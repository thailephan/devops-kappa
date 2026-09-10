import type { SkillNode } from "../skill-types";

export const EN_TIER6: SkillNode[] = [
  {
    id: "OBS-14", tier: 6, xp: 100, prereq: ["K8S-11"],
    title: "Observability — Metrics · Logs · Traces",
    sum: "The 3 pillars metrics/logs/traces; Prometheus/Grafana/OpenTelemetry; RED/USE.",
    theory: `<p><b>Monitoring is not Observability.</b> Monitoring answers questions you <i>already know to ask</i> — pre-built dashboards for the failures you anticipated (known-knowns). Observability is the ability to ask <i>new</i> questions about the system without redeploying code — to investigate things you never thought of (unknown-unknowns). On an edtech platform with 10 million users, the most expensive incidents are always the second kind.</p>
<p><b>A classic trap:</b> every CPU/RAM/disk chart is green, yet learners still can't submit assignments or watch videos. That's because you're measuring the <i>health of the machine</i>, not the <i>experience of the user</i>. A healthy machine does not mean a healthy service. This is why you must shift from 'measuring resources' to 'measuring the user journey'.</p>
<p><b>The three pillars — when to use each:</b></p>
<ul>
<li><b>Metrics</b> — aggregated measurements over time (requests/s, error rate, p99 latency). Cheap, compact, ideal for <i>detecting</i> that 'something is wrong' and firing alerts. They answer <i>how much / is something wrong</i>.</li>
<li><b>Logs</b> — discrete events with context (the log lines of one failing request). Ideal for <i>confirming the details</i> of what happened. They answer <i>what happened</i>.</li>
<li><b>Traces</b> — the lifecycle of a single request as it crosses multiple services (user to API gateway to lesson service to DB). Ideal for answering <i>where in the chain it slowed down or broke</i> — something isolated metrics and logs cannot pinpoint.</li>
</ul>
<p><b>Reference toolset:</b> <code>Prometheus</code> collects metrics (pull model, scraping a <code>/metrics</code> endpoint), <code>Grafana</code> draws dashboards and alerts, <code>OpenTelemetry</code> (OTel) is the vendor-neutral standard for emitting metrics/logs/traces from code (avoiding hard lock-in to a single vendor), and centralized logging goes through <code>Loki</code> or <code>ELK</code> (Elasticsearch/Logstash/Kibana). Don't leave logs scattered across individual pods — when a pod dies, its logs are gone.</p>
<p><b>Two methods for choosing metrics — don't measure at random:</b></p>
<ul>
<li><b>RED</b> — for request-handling services: <b>R</b>ate (requests/s), <b>E</b>rrors (error ratio), <b>D</b>uration (latency; look at p99, not the average).</li>
<li><b>USE</b> — for resources: <b>U</b>tilization, <b>S</b>aturation (queues backing up — the earliest sign of overload), <b>E</b>rrors.</li>
</ul>
<p>A PromQL query measuring the error ratio over the last 5 minutes for the lesson service:</p>
<pre><code>sum(rate(http_requests_total{service="lesson",code=~"5.."}[5m]))
  /
sum(rate(http_requests_total{service="lesson"}[5m]))</code></pre>
<p><b>The high-cardinality danger:</b> never use <code>user_id</code> as a metric label. Each distinct label value creates its own time series; 10 million users = 10 million series, which blows up Prometheus's RAM and crashes it. Labels must be a small, finite set (service, endpoint, status code, region). Personal identity belongs in <i>logs/traces</i>, not in metrics.</p>
<p><b>Trace sampling:</b> storing 100% of traces for 10 million users means an enormous storage bill. You should sample — for example, keep 1% of normal traces but <i>keep every trace of failing/slow requests</i> (tail-based sampling). Measure first to know your budget, then tune the ratio.</p>`,
    whenUse: `<p>Stand up observability <b>as soon as you have more than one service</b> and real users — true to the spirit of 'measure first, automate later': without measurements, every downstream autoscale, SLO, and alert is just guesswork. Start with RED for the user-path services and USE for the underlying resources. You don't need full distributed tracing while you're still a single-process monolith; but with 10 million users and multiple services, tracing is mandatory to answer 'where is it slow'. Always measure the user journey — don't stop at CPU/RAM.</p>`,
    pros: [
      "Lets you answer new questions during an incident investigation without redeploying code",
      "Measures the actual user experience, catching failures that CPU/RAM charts miss",
      "OpenTelemetry is a vendor-neutral standard, avoiding hard lock-in to a single vendor",
      "RED/USE give you a disciplined framework for choosing metrics instead of building dashboards at random",
    ],
    cons: [
      "High cardinality (a user_id label) blows up Prometheus's RAM without discipline",
      "Storing logs and traces at the scale of 10 million users is expensive; you must sample sensibly",
      "Too many dashboards that nobody reads are as useless as having none",
    ],
    questions: [
      { q: "The dashboard shows CPU, RAM, and disk across the whole cluster all green, yet support is flooded with learners who can't watch videos. Why, and how do you fix your measurements?",
        a: "You're measuring the <strong>health of the machine</strong> rather than the <strong>experience of the user</strong> — a healthy machine does not mean a healthy service (for example the CDN ran out of credit, a token expired, or a slow downstream while CPU stays idle). Fix it by adding metrics along the <strong>user journey</strong> using RED: the rate, error rate, and p99 latency of the 'play video' flow itself. The core principle of observability is to <strong>measure symptoms the user can feel, not stop at infrastructure resources</strong>." },
      { q: "An engineer wants to add a user_id label to the http_requests_total metric to 'know which user hit errors'. Why do you refuse, and what is the correct solution?",
        a: "That's <strong>high cardinality</strong>: each label value creates its own time series, so 10 million users would spawn 10 million series and make Prometheus <strong>consume RAM until it crashes</strong> — the monitoring system itself becomes the point of failure. A metric should only carry labels from a <strong>small, finite set</strong> (service, endpoint, status code, region). To trace a specific user, use <strong>logs or traces</strong>, which is where personal identity belongs — each pillar has its own job, so don't shove one pillar's work onto another." },
      { q: "When do you use metrics, when logs, and when traces? Give an edtech scenario that uses all three.",
        a: "<strong>Metrics</strong> to detect and alert (cheap, aggregated): the error rate of the assignment-submission flow spikes. <strong>Traces</strong> to locate where in the service chain it slowed or broke: a submission request takes 8 seconds, and the trace shows 7 of them are in the call to the grading service. <strong>Logs</strong> to confirm the details: the grading service's log lines show it is timing out on its DB connection. The typical sequence is <strong>metric raises the alarm to trace narrows the region to log confirms the cause</strong>; the three pillars complement each other rather than replace one another." },
      { q: "Why, when measuring Duration in RED, do you look at p99 rather than the average latency? Relate it to 10 million users.",
        a: "The average <strong>hides the tail</strong>: if 99% of requests are a fast 50ms but 1% take 5 seconds, the average still looks fine — while 1% of 10 million users is <strong>100 thousand learners</strong> in pain. <strong>p99 (and p999)</strong> expose exactly the worst-off group that the average conceals. The right decision is to <strong>set objectives and alerts on tail percentiles</strong>, because at large scale a small percentage is still an enormous number of people — this is also the foundation for SLOs in the next node." },
      { q: "Your boss says just store 100% of traces for every request to be safe. How do you push back, and what do you propose?",
        a: "At 10 million users, storing 100% of traces creates <strong>enormous storage and bandwidth costs</strong> while 99% of the traces of successful requests are read by almost nobody. Propose <strong>sampling</strong>: keep a small fraction of normal traces (say 1%) but <strong>keep every trace of failing or slow requests</strong> (tail-based sampling) — because that's what actually needs investigating. True to 'measure first, automate later': <strong>measure the real volume and value first, then tune the sampling ratio</strong>, instead of defaulting to storing everything." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Stand up a minimal observability stack for a small app: (1) add a <code>/metrics</code> endpoint and emit RED metrics (using an OpenTelemetry library or a Prometheus client); (2) run Prometheus to scrape that app and Grafana to draw 3 panels: rate, error rate, p99 duration; (3) write a PromQL query for the 5-minute error ratio and deliberately trigger 500s to watch the graph jump; (4) intentionally add a high-cardinality label (for example a random id per request) and observe the number of time series balloon in Prometheus — understand why user_id is forbidden. Write down: at what moment you would reach for each of the metrics/logs/traces pillars.</p>`,
    links: [
      { t: "Google SRE Book — Monitoring Distributed Systems", u: "sre.google/sre-book/monitoring-distributed-systems" },
      { t: "Prometheus — Querying basics (PromQL)", u: "prometheus.io/docs/prometheus/latest/querying/basics" },
      { t: "OpenTelemetry — Docs & concepts", u: "opentelemetry.io/docs/concepts" },
      { t: "Grafana Loki — log aggregation", u: "grafana.com/docs/loki/latest" },
      { t: "Brendan Gregg — The USE Method", u: "brendangregg.com/usemethod.html" },
    ],
  },
  {
    id: "SLO-15", tier: 6, xp: 100, prereq: ["OBS-14"], calc: true,
    title: "SLI · SLO · Error Budget",
    sum: "Turn 'stability vs speed' into a number-driven decision, not a gut feeling.",
    theory: `<p>This node turns the age-old fight between <b>Dev wanting to ship fast</b> and <b>Ops wanting a stable system</b> into a single number both sides agree on up front. Three concepts stack up:</p>
<ul>
<li><b>SLI (Service Level Indicator)</b> — a metric measuring the <i>real user experience</i>. Choose it by the <b>user journey</b>, not by CPU. An edtech example: 'the fraction of lesson-view requests returning 200 in under 300ms'. CPU at 80% is not an SLI because the user doesn't feel CPU — the user feels whether the page opens.</li>
<li><b>SLO (Service Level Objective)</b> — the target you <i>set yourself</i> for that SLI, for example '99.9% of lesson-view requests succeed over 30 days'. It's an internal promise.</li>
<li><b>Error Budget</b> — the amount you're allowed to fail: <code>100% − SLO</code>. A 99.9% SLO gives a 0.1% error budget. This is what turns the fight into arithmetic.</li>
</ul>
<p><b>How the error budget resolves the Dev vs Ops conflict:</b> instead of arguing 'ship or not', both sides look at the budget. <i>Budget remaining to Dev keeps shipping new features, accepting risk within the allowance.</i> <i>Budget exhausted to freeze features, and the whole team piles onto stability until the budget recovers.</i> Ops is no longer the one who 'always says no', and Dev no longer ships recklessly — the rules of the game are a number, not a gut feeling or a job title.</p>
<p><b>The cost of each nine — this is a cost ladder, not linear:</b></p>
<pre><code>SLO       downtime/month    downtime/year
99%       ~7h 18m           ~3.65 days
99.9%     ~43m              ~8.77h
99.99%    ~4m 23s           ~52.6m
99.999%   ~26s              ~5.26m</code></pre>
<p>Jumping from 99.9% (43 min/month) to 99.99% (4 min/month) sounds like just 'one more nine', but it usually <b>multiplies the cost several times over</b>: you need multi-region, hot standby, automatic failover, and a tighter on-call. The trade-off question: do edtech users truly need 99.99%, or is 99.9% enough and the money better spent elsewhere? Don't buy nines for vanity.</p>
<p><b>Is a 0% CFR good or bad — reconnecting to DORA thinking:</b> a Change Failure Rate of 0% is usually a <i>bad sign</i> — it means the team deploys too rarely out of fear, or isn't measuring. If you have <i>never</i> spent any error budget, either the SLO is set too loose or you're shipping too slowly; a surplus budget is a 'license to move faster'. The goal is not to never fail, but to fail <i>within the agreed allowance</i>.</p>
<p><b>Internal SLO vs contractual SLA:</b> an <b>SLA</b> is a <i>legal</i> commitment to the customer; breaching it means refunds or penalties. An <b>internal SLO</b> is always set <i>tighter than the SLA</i> (for example, if the SLA is 99.9%, set the internal SLO at 99.95%) to leave a buffer — so when the SLO alerts, you still have time to fix things <i>before</i> you hit the contract-breach threshold. Don't let the customer be the one who discovers the incident for you.</p>`,
    whenUse: `<p>Set SLOs as soon as you have observability (OBS-14) and before you seriously discuss autoscaling/alerting — because the SLO is what defines what 'healthy' means. On an edtech platform with 10 million users, set a separate SLO for each core journey (login, lesson viewing, submission, payment) rather than one generic SLO. Use the error budget as the rules of the game between Dev and Ops. Don't set SLOs by gut feeling or by a 'nice round number' — set them by what users actually need and what you can actually measure.</p>
<p><b>Error Budget calculator:</b> this node has an interactive 'Error Budget calculator' shown <b>right below the pros/cons section in the drawer</b>. You enter the <b>SLO %</b>, the <b>number of days in the window</b>, the <b>requests/day</b>, and the <b>actual error rate</b>; the calculator produces the corresponding <b>allowed downtime</b> and the <b>remaining budget</b>. Try changing the SLO from 99.9% to 99.99% yourself to see how sharply the allowed downtime drops — feel the cost ladder in your own numbers.</p>`,
    pros: [
      "Turns the stability-vs-speed argument into a single number the whole team agrees on up front",
      "Ops sheds the 'always says no' role and Dev stops shipping recklessly: the rules are the error budget",
      "An internal SLO tighter than the SLA gives a buffer to fix things before breaching the contract",
      "An SLI based on the user journey reflects exactly what the user actually feels",
    ],
    cons: [
      "Setting the SLO wrong (too tight or too loose) skews every downstream decision",
      "Each added nine multiplies cost non-linearly; it's easy to over-buy reliability nobody needs",
      "It takes a disciplined culture to actually freeze features when the budget runs out",
    ],
    questions: [
      { q: "Dev wants to ship 3 features urgently at month-end; Ops blocks it over stability fears. How does the error budget break this deadlock?",
        a: "Instead of arguing by gut feeling or seniority, both sides look at the month's <strong>remaining error budget</strong>. If the SLO is 99.9% and the new system has spent 40% of the budget, then <strong>there's still headroom to Dev may ship</strong>, accepting risk within the allowance. If the budget is exhausted, then <strong>freeze features</strong> and the whole team piles onto stability until the budget recovers. The decision rests on <strong>a single number agreed on up front</strong>, so Ops is no longer the one who 'always says no' and Dev doesn't ship recklessly — true to the spirit of turning a trade-off into a number." },
      { q: "An enterprise customer demands a 99.99% SLA for an exam platform. Before you agree, what do you weigh?",
        a: "99.99% allows only <strong>~4 minutes of downtime/month</strong> — a very steep step up from 99.9% (~43 minutes): it needs <strong>multi-region, automatic failover, hot standby, and a tighter on-call</strong>, costing several times more. You must ask whether the users/customer <em>truly</em> need that level, or whether 99.9% is enough. If you do sign a 99.99% SLA, then the <strong>internal SLO must be tighter still (for example 99.995%)</strong> to have an early-warning buffer. The right decision is to <strong>only buy nines when users truly need them and the revenue covers the cost</strong> — don't buy them for vanity." },
      { q: "Which SLI would you choose for the 'lesson viewing' journey of an edtech platform, and why NOT choose 'CPU under 80%'?",
        a: "Choose an SLI that reflects the <strong>real experience</strong>, for example 'the fraction of lesson-load requests that succeed in under 300ms'. <strong>CPU under 80% is not an SLI</strong> because the user doesn't feel CPU — they feel whether the page opens and how fast it is; CPU could be at 95% while the service is fine, or CPU idle while the page is broken. The principle: <strong>an SLI measures the user journey, not infrastructure resources</strong>, so the SLO truly protects what the user cares about." },
      { q: "At the end of the quarter you look back and the error budget is almost entirely untouched. Is this good news?",
        a: "It's usually a <strong>suspicious signal</strong>, much like a 0% CFR in DORA thinking: the team may be <strong>deploying too little out of fear</strong>, or the <strong>SLO is set too loose</strong> relative to what users would actually tolerate. A surplus budget is a <strong>'license to move faster'</strong> — so review whether you're shipping too slowly, or tighten the SLO closer to what users actually need. The goal is not to never spend the budget, but to <strong>use it deliberately to balance speed and reliability</strong>." },
      { q: "Distinguish an internal SLO from a contractual SLA. Why should the SLO be tighter than the SLA?",
        a: "An <strong>SLA</strong> is a <strong>legal</strong> commitment to the customer; breaching it means refunds or a lost contract. An <strong>SLO</strong> is an <strong>internal</strong> target you set to steer your work. The SLO must be <strong>tighter than the SLA</strong> (for example, an SLA of 99.9% with an SLO of 99.95%) to create a <strong>buffer</strong>: when the SLO raises the alarm, you still have time to fix things <em>before</em> hitting the contract-breach threshold. The core decision: <strong>don't let the customer be the first to discover the incident</strong> — your alerting must fire before the penalty clause does." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Define an SLO for one core edtech journey (for example 'lesson viewing'): (1) choose 1 SLI based on the user experience (the fraction of requests succeeding under a latency threshold), and write the exact measurement formula using a metric you already have from OBS-14; (2) set a 99.9% SLO for a 30-day window and compute the error budget by hand into allowed downtime minutes; (3) open the <b>Error Budget calculator</b> right below the pros/cons section in the drawer, enter the SLO %, number of days, requests/day, and actual error rate to see the allowed downtime and remaining budget — then change the SLO to 99.99% to feel the cost ladder; (4) write a one-paragraph policy: 'what the team does when the error budget runs out' and 'how much tighter the internal SLO is than the SLA'.</p>`,
    links: [
      { t: "Google SRE Book — Service Level Objectives", u: "sre.google/sre-book/service-level-objectives" },
      { t: "Google SRE Workbook — Implementing SLOs", u: "sre.google/workbook/implementing-slos" },
      { t: "Google SRE Book — Embracing Risk (error budget)", u: "sre.google/sre-book/embracing-risk" },
      { t: "Atlassian — SLA vs SLO vs SLI", u: "atlassian.com/incident-management/kpis/sla-vs-slo-vs-sli" },
      { t: "Uptime / downtime cheat sheet (nines)", u: "uptime.is" },
    ],
  },
  {
    id: "ALT-16", tier: 6, xp: 100, prereq: ["OBS-14"],
    title: "Alerting · On-call · Postmortem",
    sum: "Alert on symptoms, sustainable on-call, blameless postmortems.",
    theory: `<p>Once you have observability, the next question is: <b>when do you wake a human up at 3am?</b> Alerting done wrong is worse than no alerting at all.</p>
<p><b>Alert on symptoms, not on causes.</b> An alert must reflect what the <i>user feels</i>: the p99 latency of the lesson-view flow crosses a threshold, the error rate of the submission flow spikes. <b>Don't</b> alert on 'CPU &gt; 80%' — high CPU doesn't necessarily mean users are suffering (it could be a batch job running), and low CPU doesn't necessarily mean users are happy (a downstream could be dead). Alerting on causes (CPU, RAM, pod counts...) produces <b>alert fatigue</b>: the on-call is bombarded with so many harmless alarms that they start <i>tuning out</i> — and then miss the one real alert. Fewer alerts, and each one must be <i>worth waking up for</i>.</p>
<p>An example of a symptom-based alert rule, tied to the SLO from the previous node:</p>
<pre><code>- alert: LessonErrorRateHigh
  expr: |
    sum(rate(http_requests_total{service="lesson",code=~"5.."}[5m]))
      / sum(rate(http_requests_total{service="lesson"}[5m])) &gt; 0.01
  for: 5m
  labels:
    severity: page
  annotations:
    summary: "Lesson-view flow error rate exceeded 1% for 5 minutes"
    runbook: "wiki/runbooks/lesson-error-rate"</code></pre>
<p><b>Page vs Ticket — tiering the severity:</b></p>
<ul>
<li><b>Page</b> (call, buzz, wake up): reserved only for things that <i>affect users right now and need a human within minutes</i>. If it doesn't need immediate action, don't page.</li>
<li><b>Ticket / warning</b>: important but <i>can wait until business hours</i> (the disk will fill up in 5 days, a certificate expires in 2 weeks). It goes into a queue; it wakes nobody.</li>
</ul>
<p><b>Runbook &amp; reducing toil:</b> every alert needs a <b>runbook</b> — step-by-step instructions so the on-call (even a newcomer) can act without guessing at 3am. <b>Toil</b> is repetitive, manual work that creates no lasting value (restarting a service by hand every night). The SRE principle: when a task repeats often enough, <i>automate it</i> instead of enduring it — true to 'measure first, automate later'. A runbook you repeat 3 times is a candidate to turn into a script/automation.</p>
<p><b>Blameless postmortems — why 'blameless'?</b> After an incident, write down what happened, the impact, the timeline, and <i>why</i> — but <b>focus on systems and processes, not on prosecuting individuals</b>. The reason is very pragmatic: if whoever caused the fault gets punished, next time people will <i>hide</i> incidents and withhold information — and you lose the chance to learn, so the same fault will recur. People almost always act reasonably given the information they had at the time; the real fault lies in a system that <i>allowed</i> a single wrong action to cause huge consequences. The right question is 'how does the system prevent this next time', not 'who pressed the button'.</p>
<p><b>Sustainable on-call, fighting burnout:</b> a fair <i>rotating</i> schedule (each person one week, then off), enough people that nobody is on-call endlessly, and time off to compensate for heavy night shifts. On-call that burns people out to good people quit to fewer people to cover to more burnout: a death spiral. Few alerts and good runbooks are precisely what let an on-call shift <i>sleep</i>.</p>`,
    whenUse: `<p>Set up alerting &amp; on-call as soon as you have SLOs (SLO-15) — because the best alert is one that fires when you're <b>burning error budget too fast</b>, that is, tied directly to what the user feels. On an edtech platform with 10 million users needing 24/7 on-call, invest in alert quality (symptom-based, with runbooks) before expanding the on-call team. You don't need a 3am page for something that can wait until morning — tier page/ticket from the start. And always run a blameless postmortem after every significant incident, treating it as a learning asset, not a trial.</p>`,
    pros: [
      "Symptom-based alerting cuts alert fatigue: every alarm is worth waking up for",
      "Page/ticket tiering protects the on-call's sleep, waking them only when users are truly suffering",
      "Blameless postmortems turn incidents into lessons instead of things to hide and repeat",
      "Runbooks + automating toil help the on-call resolve issues fast and stay resilient",
    ],
    cons: [
      "Defining symptom-based alert thresholds is harder, requiring iteration and tuning",
      "A blameless culture demands real commitment from leadership; it easily drifts back to blame under pressure",
      "On-call always has a human cost; poor design is the fast road to burnout",
    ],
    questions: [
      { q: "The on-call complains of being woken 20 times a night by 'CPU > 80%' alerts, none of which ever affected users. Diagnosis and fix?",
        a: "This is <strong>alert fatigue from alerting on causes instead of symptoms</strong>: high CPU doesn't mean users are suffering (it could be a normal batch job running), so the alarm is harmless and makes the on-call <strong>lose trust and start tuning out</strong> — risking a missed real alert. Fix it by <strong>alerting on what the user feels</strong>: the error rate and p99 latency of the core flows, ideally tied to the error-budget burn rate. The principle: <strong>fewer alerts, each one worth waking up for</strong>; CPU should be a metric for investigation, not for paging." },
      { q: "Distinguish 'page' from 'ticket' severity. Give an edtech example of each and the deciding criterion.",
        a: "<strong>Page</strong> = wake a human now, used only when <strong>users are being affected and it needs action within minutes</strong>: the tuition payment flow failing en masse at 2am. <strong>Ticket/warning</strong> = important but <strong>can wait until business hours</strong>: the disk will fill up in 5 days, a TLS certificate expires in 2 weeks. The deciding criterion is <strong>'does this need a human's action right now'</strong> — if not, put it in a queue instead of waking anyone, because every wrong page erodes the on-call's sleep and trust." },
      { q: "A junior mistypes a command and accidentally drops the assignments data table, causing a major incident. What should a blameless postmortem focus on instead of disciplining them?",
        a: "Focus on <strong>why the system allowed a single manual action to have such huge consequences</strong>, not on prosecuting the individual: why there was permission to drop directly on prod, why there was no confirmation/backup/soft-delete, why the dangerous command wasn't wrapped by a safety tool. The reason is very pragmatic: <strong>if you punish individuals, next time people will hide incidents</strong> and you lose the chance to learn, so the fault recurs with someone else. The right question is <strong>'how does the system prevent this next time'</strong> — the fix is adding guardrails (removing permissions, adding confirmation, automatic backups), not reprimands." },
      { q: "Every night the on-call has to SSH in and restart a hung service. What is this a sign of, and how do you handle it in the SRE spirit?",
        a: "This is textbook <strong>toil</strong>: manual, repetitive work that creates no lasting value and grinds down the on-call's sleep. The SRE spirit is to <strong>automate a task once it repeats often enough</strong> instead of enduring it: as a stopgap, let the system restart itself (a health check + auto-restart like a liveness probe), but more importantly <strong>investigate why the service hangs</strong> (memory leak? deadlock?) to fix the root cause. 'Measure first, automate later': measure the frequency and causes of the hangs, then both automate and fix the root cause to eliminate this night shift entirely." },
      { q: "After a major incident, the boss wants to 'find someone responsible to make an example of'. Why is this counterproductive, and what do you propose instead?",
        a: "Punishing individuals creates a <strong>culture of fear</strong>: people will <strong>hide faults, not report incidents early, and be afraid to experiment</strong> — precisely the recipe for the same fault to quietly recur and MTTR to worsen. Propose a <strong>blameless postmortem</strong>: treat the incident as a learning asset, analyze the causal chain at the system/process level, and produce a <strong>list of root-cause fixes with named owners</strong>. People almost always do the reasonable thing given the information at the time; <strong>responsibility lies in improving the system, not in choosing a scapegoat</strong>." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Build a minimal 'incident response' kit: (1) from the SLO in the previous node, write 1 <b>symptom-based</b> alert rule (the error rate or p99 latency of a core flow) in Prometheus/Alertmanager, tagged with <code>severity: page</code> and a <code>runbook</code> field; (2) deliberately re-classify a 'high CPU' alert down to ticket level to see the page-vs-ticket difference for yourself; (3) write a short runbook for that alert — steps a newcomer can follow at 3am; (4) simulate a small incident and write a <b>blameless postmortem</b>: what happened, the impact, the timeline, the root cause at the system level, and 3 root-cause fixes with named owners — absolutely no one 'blamed'.</p>`,
    links: [
      { t: "Google SRE Book — Being On-Call", u: "sre.google/sre-book/being-on-call" },
      { t: "Google SRE Book — Postmortem Culture: Learning from Failure", u: "sre.google/sre-book/postmortem-culture" },
      { t: "Google SRE Workbook — Alerting on SLOs", u: "sre.google/workbook/alerting-on-slos" },
      { t: "Prometheus — Alerting rules", u: "prometheus.io/docs/prometheus/latest/configuration/alerting_rules" },
      { t: "PagerDuty — Incident Response docs", u: "response.pagerduty.com" },
    ],
  },
];
