#!/usr/bin/env python3
"""Inline the source into one self-contained, offline HTML file.

    python3 src/build.py

Reads src/app.html (markup + stylesheet, with __FONT__ placeholders), src/app.js
(all behaviour) and the four woff2 subsets in src/fonts, and writes index.html
next to this directory. The output makes no network requests of any kind.

    --out PATH        write the page somewhere other than ../index.html
    --artifact PATH   also write a fragment variant with no doctype/head/body
                      wrapper, for hosts that supply their own document shell
"""

import argparse
import base64
import pathlib

FONTS = {
    "__SANSVAR__": "ibm-plex-sans-var.woff2",
    "__COND600__": "ibm-plex-sans-condensed-600.woff2",
    "__MONO400__": "ibm-plex-mono-400.woff2",
    "__MONO600__": "ibm-plex-mono-600.woff2",
}

HEAD = (
    '<!doctype html>\n<html lang="en">\n<head>\n'
    '<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
    '<meta name="description" content="A progress tracker for the run at an '
    'Amazon Data Analyst, Data Engineer or BI Engineer role.">\n'
)


FONT_HELP = """Missing {n} font file(s) under {dir}:

{names}

The build inlines these, so it cannot run without them. Either copy the
fonts/ directory from users/devanxh/src/ in the repo, or skip the build
entirely and open the prebuilt index.html — it already has them baked in."""


def check(src: pathlib.Path) -> None:
    for name in ("app.html", "app.js"):
        if not (src / name).is_file():
            raise SystemExit(f"Missing {src / name} — the build needs it.")
    missing = [f for f in FONTS.values() if not (src / "fonts" / f).is_file()]
    if missing:
        raise SystemExit(FONT_HELP.format(
            n=len(missing), dir=src / "fonts",
            names="\n".join("  " + m for m in missing)))


def build(src: pathlib.Path) -> str:
    check(src)
    page = (src / "app.html").read_text(encoding="utf-8")
    for token, filename in FONTS.items():
        blob = (src / "fonts" / filename).read_bytes()
        page = page.replace(token, base64.b64encode(blob).decode("ascii"))
    if "__" in page.split("<style>")[1].split("</style>")[0]:
        raise SystemExit("a font placeholder was left unfilled — check src/fonts")
    return page.replace("__APP_JS__", (src / "app.js").read_text(encoding="utf-8"))


def main() -> None:
    src = pathlib.Path(__file__).resolve().parent
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=pathlib.Path, default=src.parent / "index.html")
    ap.add_argument("--artifact", type=pathlib.Path)
    args = ap.parse_args()

    page = build(src)
    split = page.index("</style>") + len("</style>")
    document = HEAD + page[:split] + "\n</head>\n<body>" + page[split:] + "\n</body>\n</html>\n"

    args.out.write_text(document, encoding="utf-8")
    print(f"wrote {args.out} ({len(document.encode()) / 1024:.0f} KB)")
    if args.artifact:
        args.artifact.write_text(page, encoding="utf-8")
        print(f"wrote {args.artifact} ({len(page.encode()) / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
