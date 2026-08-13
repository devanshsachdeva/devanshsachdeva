#!/usr/bin/env python3
"""Inline the source into one self-contained, offline HTML file.

Most of the time you want `run.py`, which calls this and opens the result.

    python3 src/build.py

Reads src/app.html (markup + stylesheet, with __FONT__ placeholders), src/app.js
(all behaviour) and the four woff2 subsets in src/fonts, and writes index.html
next to this directory. The output makes no network requests of any kind.

If a font subset is absent its @font-face rule is dropped and the page falls
back to the system stacks already declared in the stylesheet — it still works,
it just isn't set in Plex.

    --out PATH        write the page somewhere other than ../index.html
    --artifact PATH   also write a fragment variant with no doctype/head/body
                      wrapper, for hosts that supply their own document shell
"""

import argparse
import base64
import pathlib

# token in app.html -> filename under src/fonts, and where to refetch it from
FONTS = {
    "__SANSVAR__": (
        "ibm-plex-sans-var.woff2",
        "https://fonts.gstatic.com/s/ibmplexsans/v23/"
        "zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxeKYY.woff2",
    ),
    "__COND600__": (
        "ibm-plex-sans-condensed-600.woff2",
        "https://fonts.gstatic.com/s/ibmplexsanscondensed/v15/"
        "Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY527LvspYY.woff2",
    ),
    "__MONO400__": (
        "ibm-plex-mono-400.woff2",
        "https://fonts.gstatic.com/s/ibmplexmono/v20/"
        "-F63fjptAgt5VM-kVkqdyU8n1i8q1w.woff2",
    ),
    "__MONO600__": (
        "ibm-plex-mono-600.woff2",
        "https://fonts.gstatic.com/s/ibmplexmono/v20/"
        "-F6qfjptAgt5VM-kVkqdyU8n3vAOwlBFgg.woff2",
    ),
}

HEAD = (
    '<!doctype html>\n<html lang="en">\n<head>\n'
    '<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
    '<meta name="description" content="A progress tracker for the run at an '
    'Amazon Data Analyst, Data Engineer or BI Engineer role.">\n'
)


def inputs(src: pathlib.Path):
    """Every file whose contents end up in the build, in a stable order."""
    yield src / "app.html"
    yield src / "app.js"
    for filename, _ in FONTS.values():
        yield src / "fonts" / filename


def missing_fonts(src: pathlib.Path):
    return [f for f, _ in FONTS.values() if not (src / "fonts" / f).is_file()]


def build(src: pathlib.Path) -> str:
    for name in ("app.html", "app.js"):
        if not (src / name).is_file():
            raise SystemExit(f"Missing {src / name} — the build needs it.")

    page = (src / "app.html").read_text(encoding="utf-8")
    for token, (filename, _) in FONTS.items():
        path = src / "fonts" / filename
        if path.is_file():
            page = page.replace(token, base64.b64encode(path.read_bytes()).decode("ascii"))
        else:
            # drop the whole @font-face line rather than leave a dead data: URI
            page = "\n".join(ln for ln in page.split("\n") if token not in ln)
    return page.replace("__APP_JS__", (src / "app.js").read_text(encoding="utf-8"))


def document(page: str) -> str:
    split = page.index("</style>") + len("</style>")
    return HEAD + page[:split] + "\n</head>\n<body>" + page[split:] + "\n</body>\n</html>\n"


def main() -> None:
    src = pathlib.Path(__file__).resolve().parent
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=pathlib.Path, default=src.parent / "index.html")
    ap.add_argument("--artifact", type=pathlib.Path)
    args = ap.parse_args()

    absent = missing_fonts(src)
    if absent:
        print(f"note: {len(absent)} font file(s) absent from {src / 'fonts'} — "
              "building with system fonts instead (run.py can fetch them)")

    page = build(src)
    args.out.write_text(document(page), encoding="utf-8")
    print(f"wrote {args.out} ({args.out.stat().st_size / 1024:.0f} KB)")
    if args.artifact:
        args.artifact.write_text(page, encoding="utf-8")
        print(f"wrote {args.artifact} ({args.artifact.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
