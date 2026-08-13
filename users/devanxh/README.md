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
