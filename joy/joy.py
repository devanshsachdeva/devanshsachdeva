#!/usr/bin/env python3
"""joy — a two-model orchestration agent.

Given a prompt, joy:
  1. pops up a menu to pick the ORCHESTRATOR model,
  2. pops up a menu to pick the WORKER model,
  3. has the orchestrator draft a plan (goal + steps + success criteria),
  4. has the worker build the response by following that plan,
  5. has the orchestrator verify the working by comparing the plan to the
     result, and — if it falls short — feeds the critique back to the worker
     and re-verifies (a bounded refine loop).

The orchestrator never writes the answer itself; its job is to plan and to
judge the plan against what the worker produced.
"""

from __future__ import annotations

import argparse
import sys
import textwrap
from dataclasses import dataclass
from typing import List

try:
    import anthropic
    from pydantic import BaseModel, Field
except ImportError:  # pragma: no cover - dependency guidance
    sys.stderr.write(
        "joy needs the 'anthropic' package. Install with:\n"
        "    pip install -r requirements.txt\n"
    )
    raise SystemExit(1)


# --------------------------------------------------------------------------- #
# Model catalog                                                               #
# --------------------------------------------------------------------------- #
# Friendly label -> API model id. Ordered best-first for the menu.
MODELS: List[tuple[str, str]] = [
    ("Claude Opus 5      (most capable, default)", "claude-opus-5"),
    ("Claude Opus 4.8    (previous flagship)", "claude-opus-4-8"),
    ("Claude Sonnet 5    (fast, near-Opus quality)", "claude-sonnet-5"),
    ("Claude Haiku 4.5   (fastest, cheapest)", "claude-haiku-4-5"),
    ("Claude Fable 5     (deepest reasoning)", "claude-fable-5"),
]
DEFAULT_MODEL = "claude-opus-5"


# --------------------------------------------------------------------------- #
# Terminal colors                                                             #
# --------------------------------------------------------------------------- #
class C:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    JOY = "\033[95m"      # magenta — joy itself
    ORCH = "\033[96m"     # cyan — orchestrator
    WORK = "\033[93m"     # yellow — worker
    OK = "\033[92m"       # green
    WARN = "\033[91m"     # red


def _supports_color() -> bool:
    return sys.stdout.isatty()


def paint(text: str, color: str) -> str:
    if not _supports_color():
        return text
    return f"{color}{text}{C.RESET}"


def banner() -> None:
    art = r"""
       _  ___   _   _
      | |/ _ \ | | | |
   _  | | | | || | | |
  | |_| | |_| || |_| |
   \___/ \___/  \__, |
                 __/ |   two-model orchestration
                |___/
"""
    print(paint(art, C.JOY))


# --------------------------------------------------------------------------- #
# Structured outputs                                                          #
# --------------------------------------------------------------------------- #
class Plan(BaseModel):
    """The orchestrator's plan for answering the prompt."""

    goal: str = Field(description="One sentence: what a correct answer achieves.")
    steps: List[str] = Field(
        description="Ordered steps the worker should take to build the answer."
    )
    success_criteria: List[str] = Field(
        description="Concrete, checkable conditions a correct result must meet."
    )


class Verification(BaseModel):
    """The orchestrator's judgement of the worker's result against the plan."""

    verdict: str = Field(
        description="One of: pass, partial, fail."
    )
    met_criteria: List[str] = Field(
        description="Success criteria the result satisfies."
    )
    unmet_criteria: List[str] = Field(
        description="Success criteria the result does not yet satisfy."
    )
    reasoning: str = Field(
        description="Brief explanation comparing the plan to the result."
    )
    feedback_for_worker: str = Field(
        description=(
            "If not a pass, concrete instructions the worker should follow to "
            "fix the gaps. Empty string when the verdict is pass."
        )
    )


# --------------------------------------------------------------------------- #
# Menu selection ("popups")                                                   #
# --------------------------------------------------------------------------- #
def choose_model(role: str, color: str) -> str:
    """Show a terminal menu to pick a model for the given role."""
    print()
    print(paint(f"┌─ Select the {role} model " + "─" * (28 - len(role)), color))
    for i, (label, model_id) in enumerate(MODELS, start=1):
        marker = " *" if model_id == DEFAULT_MODEL else "  "
        print(paint(f"│{marker}{i}. ", color) + f"{label}")
    print(paint("└" + "─" * 46, color))

    default_idx = next(
        i for i, (_, m) in enumerate(MODELS, start=1) if m == DEFAULT_MODEL
    )
    while True:
        try:
            raw = input(
                paint(f"  Pick a number for the {role} [", C.DIM)
                + str(default_idx)
                + paint("]: ", C.DIM)
            ).strip()
        except EOFError:
            raw = ""
        if raw == "":
            choice = default_idx
        elif raw.isdigit() and 1 <= int(raw) <= len(MODELS):
            choice = int(raw)
        else:
            print(paint("  Please enter a valid number.", C.WARN))
            continue
        label, model_id = MODELS[choice - 1]
        print(paint(f"  → {role}: {label.strip()}", color))
        return model_id


# --------------------------------------------------------------------------- #
# The agent                                                                   #
# --------------------------------------------------------------------------- #
@dataclass
class JoyResult:
    plan: Plan
    answer: str
    verification: Verification
    iterations: int


class Joy:
    def __init__(self, orchestrator: str, worker: str, max_iterations: int = 2):
        self.client = anthropic.Anthropic()
        self.orchestrator = orchestrator
        self.worker = worker
        self.max_iterations = max(1, max_iterations)

    # --- orchestrator: plan ------------------------------------------------ #
    def make_plan(self, prompt: str) -> Plan:
        system = (
            "You are the orchestrator. Do NOT answer the user's request yourself. "
            "Instead, produce a concise plan another model will follow to build the "
            "answer, and a short list of concrete, checkable success criteria you "
            "will later use to verify that answer. Keep the plan tight and specific."
        )
        resp = self.client.messages.parse(
            model=self.orchestrator,
            max_tokens=4000,
            system=system,
            messages=[{"role": "user", "content": f"User request:\n{prompt}"}],
            output_format=Plan,
        )
        plan = resp.parsed_output
        if plan is None:
            raise RuntimeError("Orchestrator did not return a usable plan.")
        return plan

    # --- worker: build the response --------------------------------------- #
    def build_answer(
        self, prompt: str, plan: Plan, prior_answer: str = "", feedback: str = ""
    ) -> str:
        plan_text = _format_plan(plan)
        system = (
            "You are the worker. Build the best possible response to the user's "
            "request by following the plan below. Satisfy every success criterion. "
            "Return only the finished response — no meta commentary about the plan."
        )
        user = f"User request:\n{prompt}\n\n{plan_text}"
        if feedback:
            user += (
                "\n\nYour previous attempt did not fully meet the plan. "
                "Here is the orchestrator's feedback — address all of it:\n"
                f"{feedback}\n\nYour previous attempt was:\n{prior_answer}"
            )

        print(paint("\n  worker is building the response…\n", C.WORK))
        chunks: List[str] = []
        with self.client.messages.stream(
            model=self.worker,
            max_tokens=16000,
            system=system,
            messages=[{"role": "user", "content": user}],
        ) as stream:
            for text in stream.text_stream:
                sys.stdout.write(paint(text, C.WORK) if _supports_color() else text)
                sys.stdout.flush()
                chunks.append(text)
        print()
        return "".join(chunks).strip()

    # --- orchestrator: verify --------------------------------------------- #
    def verify(self, prompt: str, plan: Plan, answer: str) -> Verification:
        system = (
            "You are the orchestrator, now acting as verifier. Compare the plan "
            "you made to the result the worker produced. Judge only whether the "
            "result satisfies the plan's success criteria — do not rewrite the "
            "answer. Give an honest verdict (pass, partial, or fail). If it is not "
            "a pass, write concrete feedback the worker can act on."
        )
        user = (
            f"User request:\n{prompt}\n\n"
            f"{_format_plan(plan)}\n\n"
            f"=== WORKER RESULT ===\n{answer}"
        )
        resp = self.client.messages.parse(
            model=self.orchestrator,
            max_tokens=4000,
            system=system,
            messages=[{"role": "user", "content": user}],
            output_format=Verification,
        )
        verification = resp.parsed_output
        if verification is None:
            raise RuntimeError("Orchestrator did not return a usable verification.")
        return verification

    # --- full run ---------------------------------------------------------- #
    def run(self, prompt: str) -> JoyResult:
        print(paint("\n▸ orchestrator is drafting a plan…", C.ORCH))
        plan = self.make_plan(prompt)
        _print_plan(plan)

        answer = self.build_answer(prompt, plan)

        verification = None
        iterations = 0
        for attempt in range(1, self.max_iterations + 1):
            iterations = attempt
            print(paint(f"\n▸ orchestrator is verifying (attempt {attempt})…", C.ORCH))
            verification = self.verify(prompt, plan, answer)
            _print_verification(verification)

            if verification.verdict.lower() == "pass":
                break
            if attempt >= self.max_iterations:
                break
            if not verification.feedback_for_worker.strip():
                break
            print(paint("\n▸ orchestrator sent the worker back to fix it.", C.ORCH))
            answer = self.build_answer(
                prompt,
                plan,
                prior_answer=answer,
                feedback=verification.feedback_for_worker,
            )

        assert verification is not None
        return JoyResult(plan=plan, answer=answer, verification=verification, iterations=iterations)


# --------------------------------------------------------------------------- #
# Pretty printing                                                             #
# --------------------------------------------------------------------------- #
def _format_plan(plan: Plan) -> str:
    steps = "\n".join(f"  {i}. {s}" for i, s in enumerate(plan.steps, 1))
    crit = "\n".join(f"  - {c}" for c in plan.success_criteria)
    return (
        f"=== PLAN ===\nGoal: {plan.goal}\n\nSteps:\n{steps}\n\n"
        f"Success criteria:\n{crit}"
    )


def _print_plan(plan: Plan) -> None:
    print(paint("\n  Plan", C.ORCH + C.BOLD))
    print(paint(f"  goal: {plan.goal}", C.ORCH))
    for i, s in enumerate(plan.steps, 1):
        print(paint(f"    {i}. {s}", C.ORCH))
    print(paint("  success criteria:", C.ORCH))
    for c in plan.success_criteria:
        print(paint(f"    - {c}", C.ORCH))


def _print_verification(v: Verification) -> None:
    color = {
        "pass": C.OK,
        "partial": C.WARN,
        "fail": C.WARN,
    }.get(v.verdict.lower(), C.WARN)
    print(paint(f"  verdict: {v.verdict.upper()}", color + C.BOLD))
    if v.met_criteria:
        print(paint("  met:", C.OK))
        for c in v.met_criteria:
            print(paint(f"    ✓ {c}", C.OK))
    if v.unmet_criteria:
        print(paint("  unmet:", C.WARN))
        for c in v.unmet_criteria:
            print(paint(f"    ✗ {c}", C.WARN))
    for line in textwrap.wrap(f"reasoning: {v.reasoning}", width=78):
        print(paint("  " + line, C.DIM))


# --------------------------------------------------------------------------- #
# Entry point                                                                 #
# --------------------------------------------------------------------------- #
def _no_credentials_message() -> str:
    return paint(
        "\nNo Claude API credentials found.\n"
        "  Set one of these, then run joy again:\n"
        "    export ANTHROPIC_API_KEY=sk-ant-...\n"
        "  or authenticate a profile with:  ant auth login",
        C.WARN,
    )


def main(argv: List[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="joy",
        description="Two-model orchestration: plan, build, verify, refine.",
    )
    parser.add_argument("prompt", nargs="*", help="The request for joy to fulfill.")
    parser.add_argument(
        "--orchestrator", help="Skip the menu and set the orchestrator model id."
    )
    parser.add_argument(
        "--worker", help="Skip the menu and set the worker model id."
    )
    parser.add_argument(
        "--iterations",
        type=int,
        default=2,
        help="Max verify/refine rounds (default: 2).",
    )
    args = parser.parse_args(argv)

    banner()

    prompt = " ".join(args.prompt).strip()
    if not prompt:
        try:
            prompt = input(paint("What should joy do?  ", C.JOY + C.BOLD)).strip()
        except EOFError:
            prompt = ""
    if not prompt:
        print(paint("No prompt given. Nothing to do.", C.WARN))
        return 1

    orchestrator = args.orchestrator or choose_model("orchestrator", C.ORCH)
    worker = args.worker or choose_model("worker", C.WORK)

    print(
        paint("\njoy: ", C.JOY + C.BOLD)
        + f"{orchestrator} orchestrates {worker}  "
        + paint(f"(up to {max(1, args.iterations)} verify rounds)", C.DIM)
    )

    try:
        joy = Joy(orchestrator, worker, max_iterations=args.iterations)
        result = joy.run(prompt)
    except anthropic.AuthenticationError:
        print(_no_credentials_message())
        return 2
    except TypeError as e:
        # The SDK raises a bare TypeError at request time when no credential
        # (api key, auth token, or profile) can be resolved.
        if "authentication" in str(e).lower():
            print(_no_credentials_message())
            return 2
        raise
    except anthropic.APIError as e:
        print(paint(f"\nAPI error: {e}", C.WARN))
        return 3

    print(paint("\n" + "=" * 60, C.JOY))
    print(paint("FINAL ANSWER", C.JOY + C.BOLD))
    print(paint("=" * 60, C.JOY))
    print(result.answer)
    print(paint("=" * 60, C.JOY))
    verdict = result.verification.verdict.upper()
    vcolor = C.OK if verdict == "PASS" else C.WARN
    print(
        paint(f"verified: {verdict}", vcolor + C.BOLD)
        + paint(f"  ·  {result.iterations} round(s)", C.DIM)
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
