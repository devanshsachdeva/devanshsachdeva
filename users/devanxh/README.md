# Amazon Loop Readiness

A single-file progress tracker for the run at an Amazon **Data Analyst**, **Data Engineer**, or
**BI Engineer** role.

Fully offline. No build step, no server required, no network calls at any point — the fonts,
styles and script are all inlined into the one file, so it works on a plane, behind a firewall,
or on a machine that has never seen this repo. All progress is saved to the browser's local
storage.

## Running it locally

Either works:

```sh
# 1. straight from the filesystem
open users/devanxh/index.html          # macOS
xdg-open users/devanxh/index.html      # Linux
start users\devanxh\index.html         # Windows

# 2. served over localhost
python3 -m http.server 8000 --directory users/devanxh
# then visit http://localhost:8000
```

**Pick one and stick with it.** Local storage is keyed to the origin, and `file://` and
`http://localhost:8000` are different origins — progress saved under one will not show up
under the other. If you do need to switch, move your data across with **Data → Export JSON**
and then **Paste JSON** on the other side.

## The code

`index.html` is a build artifact — 206 KB with four woff2 subsets base64'd into it. Don't edit
it by hand. The readable source is:

```
src/app.html          markup + the whole stylesheet (design tokens at the top)
src/app.js            all behaviour: the roadmap content, state, and rendering
src/fonts/            the four IBM Plex subsets, OFL 1.1 (see fonts/LICENSE.txt)
src/build.py          inlines the above into index.html — no dependencies
```

Edit a source file, then rebuild:

```sh
python3 src/build.py
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
