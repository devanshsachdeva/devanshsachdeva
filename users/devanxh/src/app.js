(function () {
  "use strict";

  /* ============================ THE PLAN ============================ */

  var ROLES = { DA: "Data Analyst", DE: "Data Engineer", BIE: "BI Engineer" };

  var PILLARS = [
    { id: "sql",       n: "SQL & query craft",       c: "SQL" },
    { id: "python",    n: "Python & coding",         c: "PY"  },
    { id: "modeling",  n: "Modelling & warehousing", c: "MDL" },
    { id: "pipelines", n: "Pipelines & AWS",         c: "AWS" },
    { id: "bi",        n: "BI & dashboards",         c: "BI"  },
    { id: "stats",     n: "Statistics & experiments",c: "STA" },
    { id: "business",  n: "Business sense & writing",c: "BIZ" },
    { id: "lp",        n: "Leadership Principles",   c: "LP"  }
  ];

  var WEIGHTS = {
    DA:  { sql: 22, python: 10, modeling:  8, pipelines:  5, bi: 15, stats: 14, business: 14, lp: 12 },
    DE:  { sql: 18, python: 16, modeling: 16, pipelines: 20, bi:  4, stats:  4, business:  6, lp: 16 },
    BIE: { sql: 22, python:  8, modeling: 14, pipelines: 10, bi: 22, stats:  6, business:  6, lp: 12 }
  };

  var PHASES = [
    {
      id: "p1", n: "Baseline & foundations", w0: 1, w1: 4,
      s: "Find out honestly where you stand, then rebuild the fundamentals you will lean on for the next five months.",
      tasks: [
        { t: "Sit a timed diagnostic", d: "Fifteen SQL problems in sixty minutes, cold, no lookups. Score it and keep the paper — this is the number you are trying to beat in month six.", p: "sql", h: 3 },
        { t: "Rebuild core SQL", d: "Joins including anti-joins, aggregation, GROUP BY versus HAVING, correlated subqueries, and when a CTE beats a subquery for readability.", p: "sql", h: 8 },
        { t: "Drill window functions", d: "ROW_NUMBER, RANK, DENSE_RANK, LAG and LEAD, running totals, moving averages, and framing clauses. This is the single most-tested topic in the loop.", p: "sql", h: 10 },
        { t: "Master date arithmetic", d: "DATE_TRUNC, date differences, generating a date spine so empty days still appear, and why a calendar table saves you in reporting.", p: "sql", h: 4 },
        { t: "Refresh Python for data work", d: "pandas groupby, merge, pivot and reshaping; vectorised numpy over loops; reading and writing Parquet.", p: "python", h: 10 },
        { t: "Rewrite the CV in Amazon's shape", d: "One page. Every bullet as accomplished X, measured by Y, by doing Z. Numbers on every line — rows processed, hours saved, percent moved. Strip adjectives.", p: "business", h: 5 },
        { t: "Inventory your stories", d: "List fourteen to sixteen real situations from Infosys, the MSc and side projects. Just headlines for now — conflict, failure, a deadline you saved, a thing you built nobody asked for.", p: "lp", h: 4 },
        { t: "Read five live requisitions", d: "Pull five current Amazon postings across all three job families, extract the repeated phrases, and write the gap list they imply. That list should reorder the rest of this plan.", p: "business", h: 3 },
        { t: "Set up the study system", d: "A repo for solutions, a spaced-repetition deck for anything you got wrong, and a fixed weekly review slot. Every missed problem gets re-attempted after seven days.", p: "business", h: 2 }
      ]
    },
    {
      id: "p2", n: "SQL depth & analytical thinking", w0: 5, w1: 9,
      s: "Move from writing correct SQL to writing the six or seven query shapes that interview questions are actually built from.",
      tasks: [
        { t: "Pattern: funnels and conversion", d: "Multi-step event sequences, first-touch ordering, and conversion between steps without double counting.", p: "sql", h: 6 },
        { t: "Pattern: retention and cohorts", d: "N-day retention, rolling retention, unbounded retention, and the cohort triangle. Know why the three numbers disagree.", p: "sql", h: 6 },
        { t: "Pattern: gaps and islands", d: "Consecutive-day streaks, session stitching from timestamps, and the difference-of-row-numbers trick that solves most of them.", p: "sql", h: 5 },
        { t: "Pattern: dedup and history", d: "Picking the latest row per key, collapsing duplicates that differ in one column, and querying a slowly changing dimension as of a date.", p: "sql", h: 4 },
        { t: "Pattern: self-joins and hierarchies", d: "Manager and employee trees, recursive CTEs, and comparing a row against its own neighbours.", p: "sql", h: 4 },
        { t: "Pattern: distributions", d: "Percentiles, NTILE, top-N per group, and computing a median where the function does not exist.", p: "sql", h: 4 },
        { t: "Read an execution plan", d: "Spot the full scan, understand nested loop against hash against merge joins, know why a function on a column kills an index, and be able to say why your query is slow.", p: "sql", h: 6 },
        { t: "Learn Redshift's dialect and physics", d: "Distribution styles, sort keys, VACUUM and ANALYZE, columnar storage, and Spectrum over S3. Interviewers ask what changes at a billion rows.", p: "modeling", h: 6 },
        { t: "Grind 120 problems", d: "Medium and hard, mixed sources, timed. Log every miss with the reason you missed it, and re-attempt after a week. Volume is what makes the phone screen feel calm.", p: "sql", h: 40 },
        { t: "Statistics core", d: "Sampling, the central limit theorem, confidence intervals, what a p-value does and does not say, statistical power, and multiple comparisons.", p: "stats", h: 10, r: ["DA", "BIE", "DE"] },
        { t: "A/B testing end to end", d: "Hypothesis, primary metric versus guardrails, sample size and duration, novelty and primacy effects, peeking, and how you would call a flat result.", p: "stats", h: 10, r: ["DA", "BIE"] },
        { t: "Metric teardown drill", d: "Ten structured root-cause exercises in the shape of 'sign-ups fell eight percent week over week — why'. Segment, check the instrumentation, rule out seasonality, then form a hypothesis.", p: "business", h: 8 }
      ]
    },
    {
      id: "p3", n: "Modelling, pipelines & AWS", w0: 10, w1: 16,
      s: "The half of the loop that separates an analyst from an engineer — and the half most candidates skip.",
      tasks: [
        { t: "Dimensional modelling", d: "Facts and dimensions, declaring the grain before anything else, conformed dimensions, additive versus semi-additive measures, and bridge tables.", p: "modeling", h: 8 },
        { t: "Star, snowflake, and when to break the rules", d: "Why analytics denormalises, what it costs, and how a wide table changes query patterns and storage.", p: "modeling", h: 4 },
        { t: "Slowly changing dimensions", d: "Types one, two and three, surrogate keys, effective dating, and how a type-two dimension changes every join you write.", p: "modeling", h: 6 },
        { t: "Design drill: model a real domain", d: "From a blank page, model orders and returns, or inbound at a fulfilment centre. State the grain, defend the dimensions, then handle a late-arriving fact. Do it three times on different domains.", p: "modeling", h: 8 },
        { t: "AWS storage foundations", d: "S3 layout and partitioned prefixes, IAM roles and least privilege, Parquet against CSV, compression and columnar formats, and lifecycle policies.", p: "pipelines", h: 8 },
        { t: "Redshift architecture", d: "Leader and compute nodes, slices, massively parallel processing, workload management queues, materialised views, and Redshift Serverless.", p: "pipelines", h: 8, r: ["DE", "BIE"] },
        { t: "Glue, Athena and the catalog", d: "Crawlers and the data catalog, serverless ETL jobs, external tables, and when Athena is the cheaper answer than a warehouse.", p: "pipelines", h: 8, r: ["DE", "BIE"] },
        { t: "Orchestration with Airflow", d: "DAG design, task dependencies, idempotency, backfills, sensors, retries, SLAs, and how you make a failed run safe to re-run. MWAA is the managed version.", p: "pipelines", h: 10, r: ["DE", "BIE"] },
        { t: "Streaming fundamentals", d: "Kinesis Data Streams and Firehose, batch against stream trade-offs, at-least-once against exactly-once, watermarks and late events.", p: "pipelines", h: 6, r: ["DE"] },
        { t: "PySpark in anger", d: "DataFrame API, partitions and shuffles, broadcast joins, skew handling, caching, and reading a Spark UI to find the stage that is killing you.", p: "python", h: 12, r: ["DE"] },
        { t: "Data quality and on-call thinking", d: "Freshness, volume and schema checks, alert thresholds that do not cry wolf, a backfill strategy, and what you write in a correction of error.", p: "pipelines", h: 5, r: ["DE", "BIE"] },
        { t: "Build the capstone", d: "One end-to-end project you can talk about for twenty minutes: ingest a public dataset to S3, transform with Spark or Glue, model it dimensionally in Redshift or DuckDB, orchestrate with Airflow, add quality checks, and document it with an architecture diagram and a README that states the grain.", p: "pipelines", h: 35 },
        { t: "Optional: AWS Data Engineer Associate", d: "The DEA-C01 certification. Not required, but it forces breadth across Glue, Redshift, Kinesis, Lambda and Step Functions, and it reads well on a CV with no AWS job history.", p: "pipelines", h: 30, r: ["DE", "BIE"] }
      ]
    },
    {
      id: "p4", n: "BI, metrics & narrative", w0: 17, w1: 20,
      s: "Amazon runs on written narrative and defensible metrics. This phase is what makes you sound like an owner rather than a query writer.",
      tasks: [
        { t: "Dashboard design principles", d: "Who reads it, what decision it drives, one question per view, ordering by importance rather than availability, and cutting everything that does not change a decision.", p: "bi", h: 6, r: ["DA", "BIE"] },
        { t: "QuickSight hands-on", d: "SPICE and direct query, datasets and calculated fields, parameters and controls, row-level security, and embedding. This is Amazon's own tool — knowing it is a real edge.", p: "bi", h: 8, r: ["BIE", "DA"] },
        { t: "Build two portfolio dashboards", d: "Tableau or Power BI over your capstone data. One executive summary view, one operational drill-down. Screenshot both and write two paragraphs on what each is for.", p: "bi", h: 12, r: ["DA", "BIE"] },
        { t: "Define metrics properly", d: "Output against input metrics, north star and guardrails, the written definition document, and how you handle two teams reporting different numbers for the same thing.", p: "business", h: 5 },
        { t: "Self-serve semantics", d: "Certified datasets, naming conventions, documentation, deprecation, and how you drive adoption of a model nobody asked for.", p: "bi", h: 4, r: ["BIE"] },
        { t: "Write a two-page narrative", d: "Amazon style: full sentences, no bullets, no slideware. Context, data, insight, recommendation, risks. On your capstone. Then cut it by a third.", p: "business", h: 6 },
        { t: "Work backwards from a press release", d: "Draft a PR-FAQ for an internal data product — the press release first, then the customer and internal FAQ. It teaches the vocabulary the whole company thinks in.", p: "business", h: 5 },
        { t: "Publish the portfolio", d: "Three clean repositories with real READMEs, the profile page pinned and tidy, dashboards hosted or screenshotted, and the capstone diagram front and centre.", p: "business", h: 8 }
      ]
    },
    {
      id: "p5", n: "Loop simulation & applications", w0: 21, w1: 26,
      s: "Stop learning, start rehearsing. Everything here is performance under pressure, plus getting in front of recruiters.",
      tasks: [
        { t: "Write sixteen STAR stories", d: "One primary story per Leadership Principle, each with a real metric and an honest 'what I would do differently'. Reuse a situation across at most two principles.", p: "lp", h: 16 },
        { t: "Rehearse each story out loud", d: "Four minutes maximum, recorded. Play it back and cut the setup — most people spend two minutes on context and thirty seconds on their own actions.", p: "lp", h: 10 },
        { t: "Prepare the third-level follow-ups", d: "For every story: what exactly was your part, what data did you have, what was the trade-off, what did it cost, who disagreed. Interviewers keep digging until you run out.", p: "lp", h: 6 },
        { t: "Bar Raiser prep", d: "Pick two stories that carry Ownership, Dive Deep and Are Right A Lot under real pressure, and one clean failure story you can tell without defensiveness.", p: "lp", h: 4 },
        { t: "Practise the online assessment", d: "Four full timed sets in the real format — SQL and coding against the clock, no notes. Get used to the editor having no autocomplete.", p: "sql", h: 10 },
        { t: "Prepare for the work simulation", d: "Data engineers get a day-in-the-life exercise and a work style questionnaire. Read up on the format, and practise prioritising an inbox where everything looks urgent.", p: "business", h: 3, r: ["DE"] },
        { t: "Mock: live SQL screen", d: "With a peer, in a shared editor, sixty minutes, narrating as you type. Being watched is the skill being tested.", p: "sql", h: 2, mock: true },
        { t: "Mock: modelling and pipeline design", d: "Whiteboard a schema and a pipeline for a domain you have not seen. Ask clarifying questions for the first five minutes.", p: "modeling", h: 2, mock: true },
        { t: "Mock: business case and metrics", d: "An open metric question with no clean answer. Structure it out loud, state assumptions, and commit to a recommendation.", p: "business", h: 2, mock: true },
        { t: "Mock: full behavioural", d: "Forty-five minutes, six principle questions, with someone briefed to interrupt and dig. This is the one people skip and it is the one that fails them.", p: "lp", h: 2, mock: true },
        { t: "Write your questions for them", d: "Three sharp questions per round type. What does success look like at six months, how does this team decide what to build, what is the on-call load, how is data quality owned.", p: "business", h: 2 },
        { t: "Apply and network", d: "Ten targeted applications across teams, three referral conversations, and direct recruiter outreach. Teams hire independently, so applying to several requisitions is normal and expected.", p: "business", h: 10 },
        { t: "Understand levels and compensation", d: "What L4 and L5 expect of a data role, how the offer is built from base, sign-on and a back-loaded restricted stock vest, and the total compensation number you will actually see in years one and two.", p: "business", h: 3 }
      ]
    }
  ];

  var LPS = [
    "Customer Obsession", "Ownership", "Invent and Simplify", "Are Right, A Lot",
    "Learn and Be Curious", "Hire and Develop the Best", "Insist on the Highest Standards",
    "Think Big", "Bias for Action", "Frugality", "Earn Trust", "Dive Deep",
    "Have Backbone; Disagree and Commit", "Deliver Results",
    "Strive to be Earth's Best Employer", "Success and Scale Bring Broad Responsibility"
  ];
  var LP_LOW = { 14: 1, 15: 1 };

  var ROUNDS = [
    { id: "rec",   n: "Recruiter screen", d: "Fifteen to thirty minutes on background, visa status, notice period and level. Have a ninety-second answer for why this team, and a salary range you can defend." },
    { id: "oa",    n: "Online assessment", d: "Timed and unproctored. SQL and light coding for analysts and BI engineers; SQL, coding and a work simulation for data engineers. A work style questionnaire is bundled in." },
    { id: "phone", n: "Technical phone screen", d: "An hour with someone from the team. Live SQL in a shared editor with no autocomplete, plus one or two principle questions. Narrate the query as you write it." },
    { id: "sqlrd", n: "Loop · SQL deep dive", d: "Harder than the screen: multi-CTE questions, window functions, and a follow-up on how the query behaves at a billion rows." },
    { id: "model", n: "Loop · Data modelling", d: "Design a schema for a domain you have never seen. State the grain first, defend the dimensions, then handle history and late-arriving data." },
    { id: "etl",   n: "Loop · Pipeline design", d: "Ingestion through to serving: batch or stream, formats, partitioning, orchestration, retries, idempotency, backfills, and what you get paged for.", r: ["DE", "BIE"] },
    { id: "code",  n: "Loop · Coding", d: "Python or PySpark on a real problem — parsing, aggregating, joining. Clean and testable beats clever.", r: ["DE"] },
    { id: "case",  n: "Loop · Business case & metrics", d: "An open question about a metric that moved. Structure the teardown, name the data you would pull, flag the assumption you are least sure about.", r: ["DA", "BIE"] },
    { id: "dash",  n: "Loop · Dashboard & stakeholders", d: "Who is the reader, what decision does the view drive, what did you deliberately leave off, and how do you keep a self-serve dataset trusted.", r: ["DA", "BIE"] },
    { id: "hm",    n: "Loop · Hiring manager", d: "Scope, ambiguity and ownership. Expect the hardest push on Deliver Results and Earn Trust, and a question about a project you inherited in a bad state." },
    { id: "bar",   n: "Loop · Bar Raiser", d: "From outside the team, with a veto. Almost entirely behavioural, three levels deep on two or three stories. Expect to be interrupted." }
  ];

  var STAGES = ["Researching", "Applied", "Online assessment", "Phone screen", "Loop", "Debrief", "Offer", "Rejected"];

  /* ============================ STATE ============================ */

  var KEY = "amazon-loop-readiness-v1";
  var PLAN_WEEKS = 26;
  var storageOK = true;
  var S;

  function today() { return new Date().toISOString().slice(0, 10); }
  function addDays(iso, n) {
    var d = new Date(iso + "T00:00:00");
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function defaults() {
    return {
      v: 1, role: "DA", start: today(), target: addDays(today(), PLAN_WEEKS * 7),
      tasks: {}, lp: {}, rounds: {}, apps: [], log: [], open: { p1: true }, savedAt: ""
    };
  }
  function load() {
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) { storageOK = false; }
    var base = defaults();
    if (!raw) return base;
    try {
      var o = JSON.parse(raw);
      for (var k in base) { if (o[k] !== undefined && o[k] !== null) base[k] = o[k]; }
    } catch (e) { /* corrupt payload — start clean */ }
    return base;
  }
  function save() {
    S.savedAt = new Date().toISOString();
    try { window.localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { storageOK = false; }
  }

  /* ============================ DERIVED ============================ */

  var ALL_TASKS = [];
  PHASES.forEach(function (ph) {
    ph.tasks.forEach(function (t, i) {
      t.id = ph.id + "-" + (i + 1);
      t.phase = ph.id;
      t.roles = t.r || ["DA", "DE", "BIE"];
      ALL_TASKS.push(t);
    });
  });

  function inTrack(t) { return t.roles.indexOf(S.role) !== -1; }
  function st(id) { return S.tasks[id] || "todo"; }
  function credit(id) { var v = st(id); return v === "done" ? 1 : v === "doing" ? 0.5 : 0; }

  function elapsedWeeks() {
    var a = new Date(S.start + "T00:00:00"), b = new Date(S.target + "T00:00:00");
    var span = (b - a) / 864e5;
    if (!(span > 0)) return null;
    var gone = (Date.now() - a) / 864e5;
    return Math.max(0, Math.min(PLAN_WEEKS, (gone / span) * PLAN_WEEKS));
  }
  function daysToTarget() {
    return Math.ceil((new Date(S.target + "T00:00:00") - Date.now()) / 864e5);
  }
  function phaseDueFrac(ph, ew) {
    if (ew === null) return null;
    var len = ph.w1 - ph.w0 + 1;
    return Math.max(0, Math.min(1, (ew - (ph.w0 - 1)) / len));
  }

  function storyScore() {
    var n = 0;
    for (var i = 0; i < LPS.length; i++) {
      var e = S.lp[i] || {};
      if (e.state === "rehearsed") n += 1;
      else if (e.state === "drafted") n += 0.5;
    }
    return n / LPS.length;
  }

  function pillarStats() {
    var ew = elapsedWeeks(), out = {};
    PILLARS.forEach(function (p) { out[p.id] = { done: 0, total: 0, due: 0, tasks: 0, doneTasks: 0 }; });
    PHASES.forEach(function (ph) {
      var f = phaseDueFrac(ph, ew);
      ph.tasks.forEach(function (t) {
        if (!inTrack(t)) return;
        var o = out[t.p];
        o.total += t.h;
        o.done += t.h * credit(t.id);
        o.tasks += 1;
        if (st(t.id) === "done") o.doneTasks += 1;
        if (f !== null) o.due += t.h * f;
      });
    });
    PILLARS.forEach(function (p) {
      var o = out[p.id];
      o.pct = o.total ? o.done / o.total : 0;
      o.duePct = o.total && ew !== null ? o.due / o.total : null;
      // Leadership Principles is half scheduled work, half stories actually written.
      if (p.id === "lp") o.pct = o.pct * 0.5 + storyScore() * 0.5;
    });
    return out;
  }

  function readiness() {
    var ps = pillarStats(), w = WEIGHTS[S.role], r = 0, due = 0, haveDue = false;
    PILLARS.forEach(function (p) {
      r += (w[p.id] / 100) * ps[p.id].pct;
      if (ps[p.id].duePct !== null) { due += (w[p.id] / 100) * ps[p.id].duePct; haveDue = true; }
    });
    return { now: r, due: haveDue ? due : null, pillars: ps };
  }

  function hoursLogged() {
    return S.log.reduce(function (a, x) { return a + (+x.h || 0); }, 0);
  }
  function streak() {
    var days = {};
    S.log.forEach(function (x) { days[x.d] = (days[x.d] || 0) + (+x.h || 0); });
    var n = 0, cur = today();
    if (!days[cur]) cur = addDays(cur, -1);
    while (days[cur] > 0) { n++; cur = addDays(cur, -1); }
    return n;
  }
  function mocksDone() {
    return ALL_TASKS.filter(function (t) { return t.mock && st(t.id) === "done"; }).length;
  }
  function mocksTotal() { return ALL_TASKS.filter(function (t) { return t.mock; }).length; }
  function activeApps() {
    return S.apps.filter(function (a) { return a.stage !== "Rejected" && a.stage !== "Researching"; }).length;
  }

  /* ============================ HELPERS ============================ */

  var $ = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pct(x) { return Math.round(x * 100); }
  function h1(n) { return (Math.round(n * 10) / 10).toString(); }
  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return "—";
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "2-digit" });
  }
  var CHECK = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1.6 6.2 4.4 9 10.4 3" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var HALF = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="3.2" fill="currentColor"/></svg>';
  var CHEV = '<svg class="chev" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M5 2.5 9.5 7 5 11.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* tooltip */
  var tipEl;
  function showTip(e, html) {
    tipEl.innerHTML = html;
    tipEl.setAttribute("data-on", "1");
    var r = tipEl.getBoundingClientRect();
    var x = Math.min(window.innerWidth - r.width - 10, Math.max(10, e.clientX + 12));
    var y = e.clientY - r.height - 12;
    if (y < 8) y = e.clientY + 18;
    tipEl.style.left = x + "px";
    tipEl.style.top = y + "px";
  }
  function hideTip() { tipEl.setAttribute("data-on", "0"); }

  /* ============================ RENDER: DASHBOARD ============================ */

  function renderDash() {
    var r = readiness(), ew = elapsedWeeks(), d2t = daysToTarget();

    $("heroRole").textContent = ROLES[S.role];
    $("readyFig").innerHTML = pct(r.now) + '<span class="pct">%</span>';
    $("railFill").style.width = pct(r.now) + "%";

    var mark = $("railMark");
    if (r.due === null) { mark.hidden = true; } else {
      mark.hidden = false;
      mark.style.left = "clamp(0px, calc(" + pct(r.due) + "% - 1px), calc(100% - 2px))";
    }

    var v = $("verdict"), note = $("paceNote");
    if (r.due === null) {
      v.className = "verdict v-warn"; v.textContent = "Dates not set";
      note.textContent = "Pick a start and a loop target date above and the plan will pace itself to them.";
    } else {
      var gap = r.now - r.due;
      if (gap >= 0.02) { v.className = "verdict v-good"; v.textContent = "Ahead of plan"; }
      else if (gap >= -0.08) { v.className = "verdict v-warn"; v.textContent = "On plan"; }
      else { v.className = "verdict v-crit"; v.textContent = "Behind plan"; }
      note.textContent = "Week " + Math.max(1, Math.ceil(ew)) + " of " + PLAN_WEEKS +
        ". The plan expects " + pct(r.due) + "% by now, and you are " +
        (gap >= 0 ? "+" : "") + pct(gap) + " points against it.";
    }

    var doneTasks = ALL_TASKS.filter(function (t) { return inTrack(t) && st(t.id) === "done"; }).length;
    var trackTasks = ALL_TASKS.filter(inTrack).length;
    var rehearsed = 0;
    for (var i = 0; i < LPS.length; i++) if ((S.lp[i] || {}).state === "rehearsed") rehearsed++;

    var tiles = [
      { k: "Days to target", v: d2t > 0 ? d2t : (d2t === 0 ? "Today" : "Passed"), s: fmtDate(S.target) },
      { k: "Tasks complete", v: doneTasks, sm: "/ " + trackTasks, s: "in the " + S.role + " track" },
      { k: "Hours logged", v: h1(hoursLogged()), s: streak() > 0 ? streak() + " day streak" : "no active streak" },
      { k: "Stories rehearsed", v: rehearsed, sm: "/ 16", s: "one per principle" },
      { k: "Mocks done", v: mocksDone(), sm: "/ " + mocksTotal(), s: "full dress rehearsals" },
      { k: "Live applications", v: activeApps(), s: S.apps.length + " tracked in total" }
    ];
    $("tiles").innerHTML = tiles.map(function (t) {
      return '<div class="tile"><span class="tile-k">' + esc(t.k) + '</span>' +
        '<span class="tile-v mono">' + esc(t.v) + (t.sm ? '<small>' + esc(t.sm) + '</small>' : "") + "</span>" +
        '<span class="tile-s">' + esc(t.s) + "</span></div>";
    }).join("");

    var w = WEIGHTS[S.role];
    $("pillarBars").innerHTML = PILLARS.map(function (p) {
      var o = r.pillars[p.id], pc = pct(o.pct);
      var weak = o.duePct !== null && (o.pct - o.duePct) < -0.2 ? 1 : 0;
      var tick = o.duePct !== null
        ? '<span class="bar-tick" style="left:clamp(0px, calc(' + pct(o.duePct) + '% - 1px), calc(100% - 2px))"></span>' : "";
      return '<div class="bar-row" data-weak="' + weak + '" data-pillar="' + p.id + '">' +
        '<span class="bar-name"><b>' + p.c + "</b>" + esc(p.n) + "</span>" +
        '<span class="bar-track"><span class="bar-fill" data-zero="' + (pc === 0 ? 1 : 0) + '" style="width:' + pc + '%"></span>' + tick + "</span>" +
        '<span class="bar-val">' + pc + "%</span></div>";
    }).join("");

    $("pillarBars").querySelectorAll(".bar-row").forEach(function (row) {
      var id = row.getAttribute("data-pillar");
      var o = r.pillars[id], p = PILLARS.filter(function (x) { return x.id === id; })[0];
      row.addEventListener("mousemove", function (e) {
        showTip(e, "<b>" + esc(p.n) + "</b><br>" + h1(o.done) + " of " + h1(o.total) + " hours done · " +
          o.doneTasks + "/" + o.tasks + " tasks<br>Weight for " + ROLES[S.role] + ": <b>" + w[id] + "%</b>" +
          (o.duePct !== null ? "<br>Plan pace: <b>" + pct(o.duePct) + "%</b>" : ""));
      });
      row.addEventListener("mouseleave", hideTip);
    });

    var next = ALL_TASKS.filter(function (t) { return inTrack(t) && st(t.id) !== "done"; }).slice(0, 6);
    $("nextUp").innerHTML = next.length ? next.map(function (t) {
      var ph = PHASES.filter(function (p) { return p.id === t.phase; })[0];
      return '<li class="task" data-st="' + st(t.id) + '" data-id="' + t.id + '">' +
        '<button class="box" data-act="cycle" data-id="' + t.id + '" aria-label="Advance status">' +
          (st(t.id) === "done" ? CHECK : st(t.id) === "doing" ? HALF : "") + "</button>" +
        '<span class="task-body"><span class="task-t">' + esc(t.t) + "</span>" +
        '<span class="task-tags"><span class="chip">Phase ' + ph.id.slice(1) + '</span>' +
        '<span class="chip chip-pillar">' + PILLARS.filter(function (x) { return x.id === t.p; })[0].c + "</span></span></span>" +
        '<span class="task-r"><span class="hrs">' + t.h + "h</span></span></li>";
    }).join("") : '<li class="empty">Every task in this track is done. Go get the offer.</li>';

    var scheduled = 0, doneH = 0;
    ALL_TASKS.forEach(function (t) { if (inTrack(t)) { scheduled += t.h; doneH += t.h * credit(t.id); } });
    var nums = [
      ["Scheduled study hours", h1(doneH) + " / " + scheduled + " h"],
      ["Hours actually logged", h1(hoursLogged()) + " h"],
      ["Tasks in your track", trackTasks + " of " + ALL_TASKS.length],
      ["Stories drafted or better", (function () { var n = 0; for (var i = 0; i < LPS.length; i++) { var e = S.lp[i] || {}; if (e.state === "drafted" || e.state === "rehearsed") n++; } return n; })() + " / 16"],
      ["Loop rounds rated 4+", ROUNDS.filter(function (x) { return (S.rounds[x.id] || 0) >= 4; }).length + " / " + ROUNDS.filter(function (x) { return !x.r || x.r.indexOf(S.role) !== -1; }).length],
      ["Current study streak", streak() + " days"]
    ];
    $("numbers").innerHTML = nums.map(function (n) {
      return '<div class="kv"><dt>' + esc(n[0]) + "</dt><dd>" + esc(n[1]) + "</dd></div>";
    }).join("");

    $("eyebrow").textContent = ROLES[S.role] + " track · " +
      (ew === null ? "dates not set" : "week " + String(Math.max(1, Math.ceil(ew))).padStart(2, "0") + " of " + PLAN_WEEKS) +
      " · loop target " + fmtDate(S.target);
    $("cnt-road").textContent = "(" + doneTasks + "/" + trackTasks + ")";
    $("cnt-lp").textContent = "(" + rehearsed + "/16)";
    $("cnt-apps").textContent = S.apps.length ? "(" + S.apps.length + ")" : "";
    $("savedAt").textContent = S.savedAt ? new Date(S.savedAt).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
  }

  /* ============================ RENDER: ROADMAP ============================ */

  function renderRoad() {
    var scope = $("scopeSel").value, status = $("statusSel").value, pf = $("pillarSel").value;
    var ew = elapsedWeeks();

    $("phases").innerHTML = PHASES.map(function (ph) {
      var tasks = ph.tasks.filter(function (t) {
        if (scope === "track" && !inTrack(t)) return false;
        if (pf !== "all" && t.p !== pf) return false;
        var s = st(t.id);
        if (status === "open" && s === "done") return false;
        if (status === "doing" && s !== "doing") return false;
        if (status === "done" && s !== "done") return false;
        return true;
      });
      var scoped = ph.tasks.filter(inTrack);
      var tot = scoped.reduce(function (a, t) { return a + t.h; }, 0);
      var dn = scoped.reduce(function (a, t) { return a + t.h * credit(t.id); }, 0);
      var p = tot ? dn / tot : 0;
      var open = S.open[ph.id] ? 1 : 0;
      var due = phaseDueFrac(ph, ew);
      var live = due !== null && due > 0 && due < 1;

      return '<article class="phase" data-id="' + ph.id + '" data-open="' + open + '" data-done="' + (p >= 0.999 ? 1 : 0) + '">' +
        '<button class="phase-hd" data-act="phase" data-id="' + ph.id + '" aria-expanded="' + (open ? "true" : "false") + '">' +
          '<span class="phase-no mono">' + ph.id.slice(1).padStart(2, "0") + "</span>" +
          '<span class="phase-t"><h3>' + esc(ph.n) + "</h3>" +
            '<span class="phase-meta"><span class="mono">WEEKS ' + String(ph.w0).padStart(2, "0") + "–" + String(ph.w1).padStart(2, "0") + "</span>" +
            '<span class="mono">' + tot + "H SCHEDULED</span>" +
            '<span class="mono">' + scoped.length + " TASKS</span>" +
            (live ? '<span class="mono" style="color:var(--accent)">CURRENT PHASE</span>' : "") + "</span>" +
            '<span class="note" style="margin-top:2px">' + esc(ph.s) + "</span></span>" +
          '<span class="phase-pg"><span class="mini-track"><span class="mini-fill" style="width:' + pct(p) + '%"></span></span>' +
            '<span class="bar-val mono">' + pct(p) + "%</span>" + CHEV + "</span>" +
        "</button>" +
        '<div class="phase-bd">' + (tasks.length ? tasks.map(taskHTML).join("") : '<div class="empty">No tasks match the current filters.</div>') + "</div>" +
      "</article>";
    }).join("");
  }

  function taskHTML(t) {
    var s = st(t.id), off = inTrack(t) ? 0 : 1;
    var pil = PILLARS.filter(function (x) { return x.id === t.p; })[0];
    var label = s === "done" ? "Done" : s === "doing" ? "In progress" : "To do";
    return '<div class="task" data-st="' + s + '" data-off="' + off + '">' +
      '<button class="box" data-act="cycle" data-id="' + t.id + '" aria-label="Advance status of ' + esc(t.t) + '">' +
        (s === "done" ? CHECK : s === "doing" ? HALF : "") + "</button>" +
      '<div class="task-body"><span class="task-t">' + esc(t.t) + "</span>" +
        '<span class="task-d">' + esc(t.d) + "</span>" +
        '<span class="task-tags"><span class="chip chip-pillar">' + pil.c + "</span>" +
        t.roles.map(function (r) {
          return '<span class="chip' + (r === S.role ? "" : " chip-off") + '">' + r + "</span>";
        }).join("") +
        (t.mock ? '<span class="chip">Mock</span>' : "") + "</span></div>" +
      '<div class="task-r"><span class="st-label">' + label + "</span><span class=\"hrs\">" + t.h + "h</span></div>" +
    "</div>";
  }

  /* ============================ RENDER: STORIES ============================ */

  function renderLP() {
    var drafted = 0, rehearsed = 0;
    for (var i = 0; i < LPS.length; i++) {
      var e = S.lp[i] || {};
      if (e.state === "rehearsed") rehearsed++;
      else if (e.state === "drafted") drafted++;
    }
    $("lpSummary").textContent = rehearsed + " rehearsed · " + drafted + " drafted · " + (16 - rehearsed - drafted) + " still blank";

    $("lpGrid").innerHTML = LPS.map(function (name, i) {
      var e = S.lp[i] || { state: "none", title: "", notes: "" };
      var openNotes = e.open ? 1 : 0;
      return '<div class="lp" data-s="' + (e.state || "none") + '" data-low="' + (LP_LOW[i] ? 1 : 0) + '">' +
        '<div class="lp-hd"><h4>' + esc(name) + "</h4><span class=\"lp-no mono\">" + String(i + 1).padStart(2, "0") + "</span></div>" +
        (LP_LOW[i] ? '<span class="chip">Lower priority</span>' : "") +
        '<input type="text" data-act="lp-title" data-i="' + i + '" value="' + esc(e.title) + '" placeholder="Story headline">' +
        '<div class="lp-state">' +
          ["none", "drafted", "rehearsed"].map(function (s) {
            return '<button class="seg" data-act="lp-state" data-i="' + i + '" data-v="' + s + '" aria-pressed="' + (e.state === s || (!e.state && s === "none") ? "true" : "false") + '">' +
              (s === "none" ? "Blank" : s === "drafted" ? "Drafted" : "Rehearsed") + "</button>";
          }).join("") +
        "</div>" +
        '<button class="lp-toggle" data-act="lp-open" data-i="' + i + '">' + (openNotes ? "Hide STAR notes" : "STAR notes") + "</button>" +
        (openNotes ? '<textarea data-act="lp-notes" data-i="' + i + '" placeholder="Situation…&#10;Task…&#10;Action (what you did, not the team)…&#10;Result (with a number)…&#10;What you would do differently…">' + esc(e.notes) + "</textarea>" : "") +
      "</div>";
    }).join("");
  }

  /* ============================ RENDER: LOOP ============================ */

  function renderRounds() {
    $("rounds").innerHTML = ROUNDS.map(function (rd) {
      var mine = !rd.r || rd.r.indexOf(S.role) !== -1;
      var v = S.rounds[rd.id] || 0;
      return '<div class="round" style="' + (mine ? "" : "opacity:.5") + '">' +
        '<div class="round-t"><h4>' + esc(rd.n) + (mine ? "" : ' <span class="chip">Not in the ' + S.role + " loop</span>") + "</h4>" +
        "<p>" + esc(rd.d) + "</p></div>" +
        '<div class="dots" role="group" aria-label="Confidence for ' + esc(rd.n) + '">' +
          [1, 2, 3, 4, 5].map(function (n) {
            return '<button class="dot mono" data-act="round" data-id="' + rd.id + '" data-v="' + n + '" data-on="' + (v >= n ? 1 : 0) + '" aria-label="' + n + ' of 5">' + n + "</button>";
          }).join("") +
        "</div></div>";
    }).join("");
  }

  /* ============================ RENDER: PIPELINE ============================ */

  function renderApps() {
    $("appEmpty").hidden = S.apps.length > 0;
    $("appRows").innerHTML = S.apps.map(function (a, i) {
      return "<tr><td>" + esc(a.team) + "</td><td>" + esc(a.role) + "</td>" +
        '<td><span class="stage" data-s="' + esc(a.stage) + '">' + esc(a.stage) + "</span></td>" +
        '<td class="num">' + fmtDate(a.date) + "</td>" +
        '<td style="color:var(--ink-2);font-size:12.5px">' + esc(a.note) + "</td>" +
        '<td style="text-align:right"><button class="x" data-act="del-app" data-i="' + i + '" aria-label="Remove ' + esc(a.team) + '">&times;</button></td></tr>';
    }).join("");
  }

  /* ============================ RENDER: LOG ============================ */

  function renderLog() {
    var byDay = {};
    S.log.forEach(function (x) { byDay[x.d] = (byDay[x.d] || 0) + (+x.h || 0); });

    var end = new Date(today() + "T00:00:00");
    var endDow = (end.getDay() + 6) % 7;               // Monday = 0
    var lastMon = addDays(today(), -endDow);
    var weeks = 26, cols = [];
    for (var w = weeks - 1; w >= 0; w--) {
      var monday = addDays(lastMon, -7 * w), cells = [];
      for (var d = 0; d < 7; d++) {
        var iso = addDays(monday, d);
        cells.push({ iso: iso, h: byDay[iso] || 0, future: iso > today() });
      }
      cols.push({ monday: monday, cells: cells });
    }
    var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var lastM = -1;
    var html = '<div class="heat-days"><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span>Sun</span></div><div class="heat-cols">';
    cols.forEach(function (c) {
      var m = new Date(c.monday + "T00:00:00").getMonth();
      var label = m !== lastM ? MONTHS[m] : "";
      lastM = m;
      html += '<div class="heat-col"><span class="heat-mth">' + label + "</span>";
      c.cells.forEach(function (x) {
        var l = x.h === 0 ? 0 : x.h <= 1 ? 1 : x.h <= 2.5 ? 2 : x.h <= 4 ? 3 : 4;
        html += '<button class="cell" data-l="' + l + '" data-void="' + (x.future ? 1 : 0) + '" data-act="cell" data-d="' + x.iso + '" data-h="' + x.h + '"' +
          (x.future ? " disabled" : "") + ' aria-label="' + x.iso + ", " + h1(x.h) + ' hours"></button>';
      });
      html += "</div>";
    });
    $("heat").innerHTML = html + "</div>";

    $("heat").querySelectorAll(".cell:not([data-void='1'])").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var h = +c.getAttribute("data-h");
        showTip(e, "<b>" + fmtDate(c.getAttribute("data-d")) + "</b><br>" + (h ? h1(h) + " hours" : "nothing logged"));
      });
      c.addEventListener("mouseleave", hideTip);
    });

    var total = hoursLogged(), days = Object.keys(byDay).length;
    $("logSummary").textContent = h1(total) + " hours over " + days + " day" + (days === 1 ? "" : "s") +
      " · " + (days ? h1(total / days) : "0") + " h on an average active day · " + streak() + " day streak";

    var sorted = S.log.map(function (x, i) { return { x: x, i: i }; })
      .sort(function (a, b) { return a.x.d < b.x.d ? 1 : a.x.d > b.x.d ? -1 : 0; }).slice(0, 40);
    $("logEmpty").hidden = S.log.length > 0;
    $("logRows").innerHTML = sorted.map(function (o) {
      return '<tr><td class="num">' + fmtDate(o.x.d) + '</td><td class="num">' + h1(+o.x.h) + " h</td>" +
        '<td style="color:var(--ink-2)">' + esc(o.x.n) + "</td>" +
        '<td style="text-align:right"><button class="x" data-act="del-log" data-i="' + o.i + '" aria-label="Remove entry">&times;</button></td></tr>';
    }).join("");
  }

  /* ============================ RENDER: DATA ============================ */

  function renderData() {
    $("storeWarn").hidden = storageOK;
    var byRole = {};
    Object.keys(ROLES).forEach(function (r) {
      byRole[r] = ALL_TASKS.filter(function (t) { return t.roles.indexOf(r) !== -1; })
        .reduce(function (a, t) { return a + t.h; }, 0);
    });
    var rows = [
      ["Phases", PHASES.length],
      ["Tasks in the full plan", ALL_TASKS.length],
      ["Scheduled hours · Data Analyst", byRole.DA + " h"],
      ["Scheduled hours · Data Engineer", byRole.DE + " h"],
      ["Scheduled hours · BI Engineer", byRole.BIE + " h"],
      ["Plan length", PLAN_WEEKS + " weeks"],
      ["Leadership Principles", LPS.length],
      ["Loop stages tracked", ROUNDS.length]
    ];
    $("scopeStats").innerHTML = rows.map(function (r) {
      return '<div class="kv"><dt>' + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>";
    }).join("");
  }

  function renderAll() {
    renderDash(); renderRoad(); renderLP(); renderRounds(); renderApps(); renderLog(); renderData();
  }
  function touch() { save(); renderAll(); }

  /* ============================ EVENTS ============================ */

  var TABS = [
    ["tab-dash", "p-dash"], ["tab-road", "p-road"], ["tab-lp", "p-lp"],
    ["tab-loop", "p-loop"], ["tab-apps", "p-apps"], ["tab-log", "p-log"], ["tab-data", "p-data"]
  ];
  function selectTab(id) {
    TABS.forEach(function (t) {
      var on = t[0] === id;
      $(t[0]).setAttribute("aria-selected", on ? "true" : "false");
      $(t[1]).hidden = !on;
    });
  }

  function boot() {
    tipEl = $("tip");
    S = load();

    TABS.forEach(function (t) {
      $(t[0]).addEventListener("click", function () { selectTab(t[0]); });
    });

    $("roleSel").value = S.role;
    $("startDate").value = S.start;
    $("targetDate").value = S.target;
    $("lDate").value = today();
    $("aDate").value = today();

    $("pillarSel").innerHTML = '<option value="all">All pillars</option>' +
      PILLARS.map(function (p) { return '<option value="' + p.id + '">' + esc(p.n) + "</option>"; }).join("");
    $("aStage").innerHTML = STAGES.map(function (s) {
      return '<option value="' + s + '"' + (s === "Applied" ? " selected" : "") + ">" + s + "</option>";
    }).join("");

    $("roleSel").addEventListener("change", function () { S.role = this.value; touch(); });
    $("startDate").addEventListener("change", function () { S.start = this.value || today(); touch(); });
    $("targetDate").addEventListener("change", function () { S.target = this.value || addDays(today(), 182); touch(); });
    ["scopeSel", "statusSel", "pillarSel"].forEach(function (id) {
      $(id).addEventListener("change", renderRoad);
    });
    $("expandAll").addEventListener("click", function () {
      PHASES.forEach(function (p) { S.open[p.id] = true; }); touch();
    });
    $("collapseAll").addEventListener("click", function () { S.open = {}; touch(); });

    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-act]");
      if (!el) return;
      var act = el.getAttribute("data-act");

      if (act === "cycle") {
        var id = el.getAttribute("data-id"), cur = st(id);
        S.tasks[id] = cur === "todo" ? "doing" : cur === "doing" ? "done" : "todo";
        if (S.tasks[id] === "todo") delete S.tasks[id];
        touch();
      } else if (act === "phase") {
        var pid = el.getAttribute("data-id");
        S.open[pid] = !S.open[pid];
        save(); renderRoad();
      } else if (act === "lp-state") {
        var i = +el.getAttribute("data-i");
        S.lp[i] = S.lp[i] || {};
        S.lp[i].state = el.getAttribute("data-v");
        touch();
      } else if (act === "lp-open") {
        var j = +el.getAttribute("data-i");
        S.lp[j] = S.lp[j] || {};
        S.lp[j].open = !S.lp[j].open;
        save(); renderLP();
      } else if (act === "round") {
        var rid = el.getAttribute("data-id"), v = +el.getAttribute("data-v");
        S.rounds[rid] = S.rounds[rid] === v ? 0 : v;
        touch();
      } else if (act === "del-app") {
        S.apps.splice(+el.getAttribute("data-i"), 1); touch();
      } else if (act === "del-log") {
        S.log.splice(+el.getAttribute("data-i"), 1); touch();
      } else if (act === "cell") {
        selectTab("tab-log");
        $("lDate").value = el.getAttribute("data-d");
        $("lHours").focus();
      }
    });

    document.addEventListener("input", function (e) {
      var el = e.target.closest("[data-act]");
      if (!el) return;
      var act = el.getAttribute("data-act");
      if (act === "lp-title" || act === "lp-notes") {
        var i = +el.getAttribute("data-i");
        S.lp[i] = S.lp[i] || {};
        S.lp[i][act === "lp-title" ? "title" : "notes"] = el.value;
        save();
        $("cnt-lp").textContent = "(" + (function () {
          var n = 0; for (var k = 0; k < LPS.length; k++) if ((S.lp[k] || {}).state === "rehearsed") n++; return n;
        })() + "/16)";
      }
    });

    $("addApp").addEventListener("click", function () {
      var team = $("aTeam").value.trim();
      if (!team) { $("aTeam").focus(); return; }
      S.apps.unshift({
        team: team, role: $("aRole").value.trim() || ROLES[S.role],
        stage: $("aStage").value, date: $("aDate").value || today(), note: $("aNote").value.trim()
      });
      $("aTeam").value = ""; $("aRole").value = ""; $("aNote").value = "";
      touch();
    });

    $("addLog").addEventListener("click", function () {
      var h = parseFloat($("lHours").value);
      if (!(h > 0)) { $("lHours").focus(); return; }
      S.log.push({ d: $("lDate").value || today(), h: h, n: $("lNote").value.trim() });
      $("lNote").value = "";
      touch();
    });

    function say(msg) { $("expNote").textContent = msg; }

    function applyImport(text) {
      var o;
      try { o = JSON.parse(text); }
      catch (err) { say("That is not a readiness export — the JSON could not be read."); return; }
      if (!o || typeof o !== "object") { say("That JSON does not look like a readiness export."); return; }
      var base = defaults();
      for (var k in base) if (o[k] !== undefined && o[k] !== null) base[k] = o[k];
      S = base;
      $("roleSel").value = S.role; $("startDate").value = S.start; $("targetDate").value = S.target;
      touch();
      say("Imported. Everything below is now from that file.");
    }

    $("expBtn").addEventListener("click", function () {
      var name = "amazon-loop-readiness-" + today() + ".json";
      var json = JSON.stringify(S, null, 2);
      // Inside the Artifact viewer a page can only hand over a file through
      // the downloads capability; from the filesystem an anchor is enough.
      if (window.claude && window.claude.downloads) {
        say("Waiting for you to confirm the download…");
        window.claude.downloads.save({ filename: name, data: json }).then(function () {
          say("Saved as " + name + ".");
        }, function (err) {
          say(err && err.code === "declined"
            ? "Download cancelled — nothing was saved."
            : "The download could not be handed over. Use Paste JSON on the other browser instead.");
        });
        return;
      }
      var blob = new Blob([json], { type: "application/json" });
      var url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      say("Saved as " + name + ".");
    });

    $("impBtn").addEventListener("click", function () { $("impFile").click(); });
    $("impFile").addEventListener("change", function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () { applyImport(fr.result); };
      fr.readAsText(f);
      this.value = "";
    });
    $("pasteBtn").addEventListener("click", function () {
      var w = $("pasteWrap");
      w.hidden = !w.hidden;
      if (!w.hidden) $("pasteBox").focus();
    });
    $("pasteLoad").addEventListener("click", function () {
      var t = $("pasteBox").value.trim();
      if (!t) { $("pasteBox").focus(); return; }
      applyImport(t);
      $("pasteBox").value = "";
      $("pasteWrap").hidden = true;
    });
    $("resetBtn").addEventListener("click", function () {
      if (!window.confirm("Clear every task, story, application and log entry? Export first if you want a copy.")) return;
      S = defaults();
      $("roleSel").value = S.role; $("startDate").value = S.start; $("targetDate").value = S.target;
      touch();
    });

    renderAll();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
