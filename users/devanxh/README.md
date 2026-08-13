# Amazon Loop Readiness

A single-file progress tracker for the run at an Amazon **Data Analyst**, **Data Engineer**, or
**BI Engineer** role.

Fully offline. The built `index.html` makes no network calls at any point and needs no server —
the fonts, styles and script are all inlined into that one file, so it works on a plane, behind
a firewall, or on a machine that has never seen this repo. Progress is saved to the browser's
local storage.

## Running it

One command, from the folder holding `src/`:

```sh
python3 src/run.py
```

That builds the page if anything changed and opens it in your browser. Nothing to install —
it uses only the Python standard library, and macOS and Linux already ship `python3`. If your
path has a space in it, quote it: `cd "/Users/devanxh/Amazon Skill Tracker"`.

Re-running when nothing has changed is a no-op — it fingerprints the sources and skips the
rebuild, so the command is cheap enough to be the only one you ever type.

```sh
python3 src/run.py --serve      # serve on http://localhost:8000 instead
python3 src/run.py --force      # rebuild even if nothing changed
python3 src/run.py --no-open    # build only
```

You can also just double-click `index.html` — it is a complete, standalone page and needs
neither Python nor a server.

**The first run needs the network once, and only if `src/fonts/` is empty** — it fetches the
four IBM Plex subsets, then never touches the network again. With no connection it builds
anyway and falls back to your system fonts, so the command always produces a working page;
it just isn't set in Plex. Drop the fonts in later and re-run to get them.

**Pick file or localhost and stay there.** Local storage is keyed to the origin, and `file://`
and `http://localhost:8000` are different origins — progress saved under one will not show up
under the other. To switch, move your data with **Data → Export JSON** and **Paste JSON** on
the other side.

## The code

`index.html` is a build artifact — 206 KB with four woff2 subsets base64'd into it. Don't edit
it by hand. The readable source is:

```
src/app.html          markup + the whole stylesheet (design tokens at the top)
src/app.js            all behaviour: the roadmap content, state, and rendering
src/fonts/            the four IBM Plex subsets, OFL 1.1 (see fonts/LICENSE.txt)
src/run.py            build-if-changed and open — the one command you need
src/build.py          the inliner run.py calls; usable on its own
```

Edit a source file, then re-run:

```sh
python3 src/run.py
```

The build is deterministic: same inputs, byte-identical `index.html`.

**Where to change things.** The plan itself is data at the top of `src/app.js` — `PHASES` holds
the five phases and every task (`t` title, `d` detail, `h` estimated hours, `p` pillar, `r` the
roles it applies to), `WEIGHTS` sets how much each pillar counts toward the score per role,
`LPS` is the principle list, `ROUNDS` the loop stages and `STAGES` the pipeline stages. Adding a
task is one line in the right phase array. Task IDs are positional (`p2-7` is the seventh task of
phase 2), so **inserting a task mid-array renumbers the ones after it** and their saved progress
shifts with the numbering — append to the end of a phase instead, or export your JSON first and
fix the keys up by hand.

Colour, type and spacing are CSS custom properties in the `:root` block of `src/app.html`, with
the dark palette repeated in the two blocks below it — change a token in all three places and it
propagates everywhere.

## What it tracks

| Section | What it holds |
|---|---|
| **Dashboard** | Weighted readiness score, pace against plan, six headline tiles, readiness by skill pillar, and what to do next |
| **Roadmap** | 5 phases / 55 tasks over 26 weeks, each with a status, an hour estimate, a skill pillar and the roles it applies to |
| **Stories** | The 16 Leadership Principles, one STAR story slot each, marked blank / drafted / rehearsed |
| **The loop** | Every stage from recruiter screen to Bar Raiser, with a 1–5 confidence rating per stage |
| **Pipeline** | Application tracker — team, role, stage, last touch |
| **Study log** | Hours per day, a 26-week heatmap, and a streak counter |
| **Data** | Export / import JSON, and a full reset |

## How the readiness score works

Each of the eight skill pillars scores as the share of its scheduled hours you have finished —
full credit for done, half for in progress. Those eight scores are then averaged using weights
that change with the target role you pick (a Data Engineer's score leans on pipelines and Python;
a BI Engineer's on dashboards and modelling). Leadership Principles is the one exception: it is
half scheduled work, half how many of the 16 stories you have actually written and rehearsed.

The tick mark on each bar is plan pace — where you would be if you were working through the
phases evenly between your start date and your loop target date. Change either date and the whole
plan re-paces itself.

## Portability

Local storage is per-browser and per-device. Use **Data → Export JSON** before switching machines
or clearing your browser, and **Import JSON** on the other side.
