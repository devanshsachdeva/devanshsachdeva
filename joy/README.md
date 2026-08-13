# joy

A two-model orchestration agent. Give it a prompt and joy will:

1. **Pop up a menu** to pick the **orchestrator** model.
2. **Pop up a menu** to pick the **worker** model.
3. Have the **orchestrator** draft a plan — a goal, ordered steps, and concrete
   success criteria. *(The orchestrator never writes the answer itself.)*
4. Have the **worker** build the response by following that plan.
5. Have the **orchestrator verify the working**: it compares its plan against
   the worker's result and returns a verdict. If the result falls short, it
   sends concrete feedback back to the worker and re-verifies — a bounded
   refine loop.

```
prompt ─▶ [orchestrator] plan ─▶ [worker] build ─▶ [orchestrator] verify
                 ▲                                          │
                 └──────── feedback (if not a pass) ◀───────┘
```

## Install

Python (primary):

```bash
cd joy
pip install -r requirements.txt
```

Or via npm (installs the Python deps for you and gives you a `joy` command):

```bash
cd joy
npm install
```

You need Claude API credentials. Set `ANTHROPIC_API_KEY`, or run `ant auth login`.

## Use

```bash
python3 joy.py "Write a haiku about orchestration and explain the meter"
# or, with npm:
npm start -- "Write a haiku about orchestration and explain the meter"
```

joy will then show two menus — one for the orchestrator model, one for the
worker model — and run the plan → build → verify → refine cycle.

### Options

```
joy [prompt...]
  --orchestrator MODEL_ID   skip the orchestrator menu
  --worker MODEL_ID         skip the worker menu
  --iterations N            max verify/refine rounds (default 2)
```

Example (no menus):

```bash
python3 joy.py --orchestrator claude-opus-5 --worker claude-sonnet-5 \
  "Draft a function that dedupes a list preserving order, with tests"
```

## Models offered

| Menu label        | Model id           |
| ----------------- | ------------------ |
| Claude Opus 5     | `claude-opus-5`    |
| Claude Opus 4.8   | `claude-opus-4-8`  |
| Claude Sonnet 5   | `claude-sonnet-5`  |
| Claude Haiku 4.5  | `claude-haiku-4-5` |
| Claude Fable 5    | `claude-fable-5`   |

A common pairing is a strong orchestrator (Opus 5) directing a faster worker
(Sonnet 5 or Haiku 4.5): the expensive model plans and grades, the cheap model
does the bulk generation.
