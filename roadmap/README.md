# Amazon Loop Readiness

A single-file progress tracker for the run at an Amazon **Data Analyst**, **Data Engineer**, or
**BI Engineer** role.

Open `index.html` in any browser — no build step, no server, no dependencies. Everything
(fonts included) is inlined, and all progress is saved to that browser's local storage.

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
