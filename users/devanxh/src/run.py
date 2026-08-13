#!/usr/bin/env python3
"""Build the tracker if anything changed, then open it. One command:

    python3 src/run.py

    --serve [PORT]  serve on http://localhost:8000 instead of opening the file
    --force         rebuild even when nothing changed
    --no-open       build only, don't launch a browser

The first run fetches the four IBM Plex subsets if they are absent, then never
touches the network again. With no network it builds with system fonts instead,
so the command always produces a working page.

Note that file:// and http://localhost are different origins to a browser, and
progress is kept in local storage — so what you save under one will not appear
under the other. Pick one and stay with it, or move your data across with
Data -> Export JSON and Paste JSON.
"""

import argparse
import hashlib
import pathlib
import sys
import webbrowser

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import build as builder  # noqa: E402

SRC = pathlib.Path(__file__).resolve().parent
OUT = SRC.parent / "index.html"
STAMP = SRC / ".build-stamp"


def fetch_fonts() -> None:
    """Grab any absent font subsets. Silent no-op when they are all present."""
    absent = [(f, u) for f, u in builder.FONTS.values() if not (SRC / "fonts" / f).is_file()]
    if not absent:
        return

    import urllib.error
    import urllib.request

    (SRC / "fonts").mkdir(parents=True, exist_ok=True)
    print(f"fetching {len(absent)} font file(s) — one time only…")
    for filename, url in absent:
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                data = r.read()
            if not data.startswith(b"wOF2"):
                raise ValueError("not a woff2 file")
            (SRC / "fonts" / filename).write_bytes(data)
            print(f"  {filename} ({len(data) / 1024:.0f} KB)")
        except (urllib.error.URLError, ValueError, OSError) as e:
            print(f"  could not fetch {filename} ({e}) — falling back to system fonts")


def fingerprint() -> str:
    h = hashlib.sha256()
    for path in [*builder.inputs(SRC), SRC / "build.py"]:
        h.update(path.name.encode())
        h.update(path.read_bytes() if path.is_file() else b"<absent>")
    return h.hexdigest()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--serve", nargs="?", type=int, const=8000, metavar="PORT")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--no-open", action="store_true")
    args = ap.parse_args()

    fetch_fonts()

    stamp = fingerprint()
    fresh = OUT.is_file() and STAMP.is_file() and STAMP.read_text().strip() == stamp
    if fresh and not args.force:
        print(f"up to date: {OUT}")
    else:
        OUT.write_text(builder.document(builder.build(SRC)), encoding="utf-8")
        STAMP.write_text(stamp)
        print(f"built {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")
        if builder.missing_fonts(SRC):
            print("      (using system fonts — the Plex subsets are absent)")

    if args.serve is None:
        url = OUT.as_uri()
        print(f"opening {url}")
        if not args.no_open and not webbrowser.open(url):
            print("could not launch a browser — open that file yourself")
        return

    import functools
    import http.server

    handler = functools.partial(http.server.SimpleHTTPRequestHandler,
                                directory=str(OUT.parent))
    with http.server.ThreadingHTTPServer(("127.0.0.1", args.serve), handler) as httpd:
        url = f"http://localhost:{args.serve}/{OUT.name}"
        print(f"serving {url}  (ctrl-c to stop)")
        if not args.no_open:
            webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped")


if __name__ == "__main__":
    main()
