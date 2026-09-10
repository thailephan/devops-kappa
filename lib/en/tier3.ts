import type { SkillNode } from "../skill-types";

export const EN_TIER3: SkillNode[] = [
  {
    id: "CI-06", tier: 3, xp: 100, prereq: ["GIT-03", "DKR-04"],
    title: "CI — Automated Build · Test · Scan",
    sum: "Every push automatically builds/tests/lints/scans — shortening the feedback loop.",
    theory: `<p><b>CI (Continuous Integration) is a contract: on every push, an automated pipeline runs to answer a single question — 'is this change safe to merge?'</b> The shorter the feedback loop, the more developers dare to merge small batches frequently (true to the DORA spirit: short Lead Time, low CFR). A pipeline that takes 40 minutes means no one dares to push several times a day — it silently pushes the team back to large batches.</p>
<p><b>Pipeline as code:</b> the pipeline must live in the repo, versioned alongside the code, reviewed through PRs — not hand-clicked configuration in a UI. Example GitHub Actions:</p>
<pre><code>name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm          # cache node_modules keyed on the lock file hash
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --shard=1/2   # fast unit tests, merge gate</code></pre>
<p><b>Build the image ONCE, then reuse the artifact.</b> The classic mistake: every stage (test, staging, prod) rebuilds the image from scratch — both slow and dangerous, because three builds can produce three different images (dependencies change, base image changes). The right way: build the image once, pin it to an immutable digest, and have later jobs <b>pull that exact digest</b>. What gets tested is precisely what runs in prod.</p>
<p><b>Parallelize plus cache to cut a 40-minute pipeline.</b> Split independent jobs to run in parallel (lint | unit | build), shard the test suite (split 2000 tests in half across 2 runners), and cache the dependency layers (node_modules, Docker layers). A 40-minute pipeline often drops to 8-10 minutes on caching plus parallelism alone, before optimizing any test code.</p>
<p><b>Tier tests by speed:</b> fast unit tests (seconds) → merge gate, run on every push; integration tests → run after merging to main; e2e/nightly (slow, often flaky) → run on a schedule or before release, do NOT block PRs. Putting e2e on the merge gate is the surest way to teach developers the habit of 'retry until green'.</p>
<p><b>Fail-fast:</b> order the cheap, failure-prone steps first (lint, typecheck) so the pipeline dies early in 30 seconds instead of flagging a formatting error after an 8-minute build.</p>
<p><b>Secrets in CI:</b> prefer <b>short-lived OIDC tokens</b> (CI exchanges its identity for a cloud token that lives a few minutes and expires on its own) over stuffing static access keys into a secret store — a leaked long-lived key is a disaster. Never <code>echo</code> a secret to the log; mask them and assume the log is public.</p>`,
    whenUse: `<p>Stand up CI <b>the moment more than one person commits</b> to the same repo — this is the highest-ROI automation, done before even CD. But resist over-engineering: for early-stage edtech, a single <code>lint + unit + build</code> job running under 5 minutes is more than enough; you do <b>not</b> yet need a matrix build across 6 Node versions, self-hosted runners, or e2e on every PR. Only add a test tier when a measurable incident slips through the current one. Measure first (what class of bug got through?), add the gate after.</p>`,
    pros: [
      "Short feedback loop: you learn code is broken within minutes, not after merging",
      "Pipeline as code, so it is versioned, reviewable, reproducible — no drift like hand-clicking a UI",
      "Build once then reuse the artifact: what gets tested is exactly what runs in prod",
      "Parallelism plus cache cut pipelines from tens of minutes to a few, encouraging small batches",
    ],
    cons: [
      "Flaky tests erode trust: an unwarranted red pipeline trains the team to ignore even real failures",
      "A slow pipeline silently forces the team back to large batches; CI time must be treated as a metric to track",
      "Mishandled secrets (static keys, echoing to logs) turn CI into a major security hole",
    ],
    questions: [
      { q: "The team's CI pipeline takes 40 minutes, and developers start bundling many changes into one PR to avoid the wait. In what order do you diagnose and fix this?",
        a: "This is a textbook case of a slow pipeline quietly destroying the small-batch discipline: the long wait pushes the team into large batches, dragging Lead Time and CFR the wrong way against DORA. Before optimizing test code, exploit the cheapest win: <strong>run independent jobs in parallel and turn on caching</strong> (node_modules, Docker layers) — this typically cuts more than half the time. Next, <strong>shard the test suite</strong> across multiple runners and <strong>push e2e off the PR gate</strong> (run it nightly). The principle: treat pipeline time as a metric you measure and keep under a threshold (say 10 minutes), because it drives the whole team's merge behavior." },
      { q: "Someone proposes that each environment (test, staging, prod) rebuild the image from the Dockerfile to 'always be latest'. Why is this a trap, and what do you do instead?",
        a: "Rebuilding at each stage means three builds can produce <strong>three different images</strong> — a base image just updated, a 'latest' dependency just changed, a different mirror — so what you tested in staging is no longer what runs in prod, breaking the entire value of CI. The right way: <strong>build the image exactly once, pin an immutable digest, and have later stages pull that same digest</strong>. An immutable artifact is the precondition for tests to be meaningful and for reliable rollback — exactly the principle from GIT-03." },
      { q: "The e2e tests for the exam/grading service go red at random then turn green on retry. Developers start reflexively hitting 'rerun'. What is the risk, and how do you handle it?",
        a: "A flaky test is dangerous not because it goes red, but because it <strong>teaches the whole team to ignore red</strong> — so when a real failure appears, the reflex is still to hit rerun and the bug ships to prod. Handle it: <strong>quarantine the flaky test off the merge gate immediately</strong>, file a tracking issue for root cause (usually a hard-coded time wait, order dependency, or shared data), then fix or delete it. Keep the merge gate to fast, reliable tests only; a green gate must genuinely mean 'safe'. For a grading service, trust in the tests is an asset you cannot let cheapen." },
      { q: "The pipeline needs to deploy the image to a cloud registry. Someone proposes storing a long-lived cloud access key in GitHub Secrets. What is your counter-argument and proposal?",
        a: "A static access key is a long-lived secret: if it leaks (logs, a fork PR that can run the workflow, a departing team member), the attacker has access until someone remembers to rotate it — a large, hard-to-detect blast radius. Use <strong>OIDC instead: CI presents its workflow identity, and the cloud issues a token that lives a few minutes and self-expires</strong>, with no secret sitting around to be stolen. Alongside it: scope the token's permissions by repo/branch, mask every sensitive value, and never <code>echo</code> a secret to the log because you must assume the log is public. This is least privilege applied at the CI layer." },
      { q: "For a just-launched edtech product, the boss wants a 'proper' CI: a matrix of 6 Node versions, full e2e on every PR, deep security scans on every push. Do you build it all right away?",
        a: "No — this is over-engineering without a measured pain. At the early stage, the greatest value is <strong>a fast gate (lint + unit + build) running under 5 minutes</strong> so the team dares to merge several times a day. A 6-version matrix only makes sense if you actually support 6 versions; e2e on every PR makes the pipeline slow and flaky, counterproductive. The right approach: <strong>start minimal, measure what class of bug is slipping through, then add exactly the tier that catches that class</strong>. Security scanning should exist but can run in parallel and not block PRs at the early stage. Add gates by evidence, not by ritual." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">On a sample edtech repo (e.g. an enrollment service): (1) write a GitHub Actions workflow that runs <code>lint</code> + <code>unit test</code> + <code>build image</code> on every push and pull_request; (2) measure the pipeline time on the first run; (3) enable dependency caching and split the independent jobs to run in parallel, measure again — record how many minutes you cut; (4) build the image once, push it to a registry by digest, and have a 'fake deploy' job pull that exact digest instead of rebuilding; (5) deliberately add a <b>flaky</b> test (random sleep) to see how it breaks the merge gate, then practice quarantining it. Bonus: switch the deploy credential from a static key to OIDC and confirm no secret is printed to the log.</p>`,
    links: [
      { t: "GitHub Actions — workflow documentation", u: "docs.github.com/actions" },
      { t: "GitHub — OIDC hardening with cloud providers", u: "docs.github.com/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect" },
      { t: "Martin Fowler — Continuous Integration", u: "martinfowler.com/articles/continuousIntegration.html" },
      { t: "Google Testing Blog — Flaky Tests", u: "testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html" },
      { t: "DORA — CI capability", u: "dora.dev/capabilities/continuous-integration" },
    ],
  },
  {
    id: "CD-07", tier: 3, xp: 100, prereq: ["CI-06", "CMP-05"],
    title: "CD & Deployment Strategies",
    sum: "Automatically promote artifacts through environments; blue-green/canary/rollback.",
    theory: `<p><b>CD (Continuous Delivery) is the sequel to CI: once you have an immutable, tested artifact, you automatically promote it through a chain of environments dev → staging → prod in a repeatable way.</b> The goal is not 'deploy as fast as possible' but 'deploy safely enough that deploying becomes boring'. A boring deploy = low MTTR + low CFR.</p>
<p><b>The environment chain and approval gates:</b> dev is automatic; staging is automatic once CI is green; prod may add a <b>manual approval gate</b> early on (one person clicks approve), then drop it gradually as trust in the pipeline grows. Crucially, the environments must be <b>as identical as possible (environment parity)</b> — same DB type, same version, same infrastructure config — otherwise 'works in staging, breaks in prod' becomes an everyday event.</p>
<p><b>Three deployment strategies — choose by trade-off:</b></p>
<ul>
<li><b>Rolling</b>: replace instances gradually, part by part. Simple, no doubling of resources, but during rollout two versions run side by side and rollback is slow (you have to roll back through).</li>
<li><b>Blue-green</b>: stand up a full new environment (green) alongside the old (blue), test it, then switch all traffic to green; on failure, point straight back to blue instantly. Fastest rollback but <b>doubles resource usage</b> during the switch.</li>
<li><b>Canary</b>: send the new version to a small slice of traffic (1% → 5% → 25% → 100%), <b>watch the metrics</b> (errors, latency) at each step, and auto-halt/rollback if they turn bad.</li>
</ul>
<p><b>Why canary for the exam peak season:</b> exam season is when traffic peaks and risk is highest — a bug in the grading service at that moment affects millions of learners. Canary limits the <b>blast radius</b>: if the new build breaks, only 1% of learners are affected and the system auto-rolls back before it spreads. Blue-green is 'all or nothing' — it switches 100% of traffic at once, so if a failure only surfaces under real load, all 10M users are hit at once. Canary trades rollout speed for safety — exactly what you need at peak.</p>
<p><b>Rollback = redeploy the old artifact</b>, not a rushed hotfix (true to the GIT-03 principle). Example canary with GitHub Actions + kubectl:</p>
<pre><code>steps:
  - name: deploy canary 10%
    run: kubectl set image deploy/grading grading=registry/grading:v2.0.0@sha256:abc
  - name: observe for 5 minutes
    run: ./scripts/check-slo.sh --error-rate-max 0.5 --p99-ms-max 800
  - name: rollback if SLO is bad
    if: failure()
    run: kubectl rollout undo deploy/grading   # back to the old, running artifact</code></pre>
<p><b>Zero-downtime DB migration — the expand/contract pattern:</b> this is the deadliest part of CD, because a DB does not roll back as easily as code. The principle: every schema change must be <b>backward-compatible</b> so old code and new code can both run during the rollout. Renaming a column is not done in one shot but split into 3 steps: (1) <b>expand</b> — add the new column, code writes both; (2) <b>migrate</b> — copy the data, code reads the new column; (3) <b>contract</b> — drop the old column once you are certain no one uses it. Never deploy 'a breaking schema change' + 'code that depends on the new schema' at the same time.</p>
<p><b>Feature flags separate 'deploy' from 'release':</b> deploying code to prod (flag off) does not mean shipping the feature. Turn the flag on gradually for a small group, turn it off instantly if it breaks — no need to roll back the whole artifact. For edtech, you can enable a new exam feature for one school before rolling it out nationwide.</p>`,
    whenUse: `<p>Stand up automated CD to staging <b>right after you have CI</b>; for prod, add an approval gate at first then loosen it over time. Choose the strategy by risk and cost, not by trend: <b>rolling</b> is the sensible default for most internal services; <b>blue-green</b> when you need instant rollback and can afford double the resources temporarily; <b>canary</b> for high-risk changes on a hot traffic path (exam season, payments). Resist over-engineering: canary needs <b>good metrics/observability to auto-evaluate</b> — without measurable SLOs, canary is just a slower rolling deploy and not yet worth it. Feature flags are very powerful, but stale flags left around are technical debt; you need the discipline to clean up dead flags.</p>`,
    pros: [
      "Canary limits the blast radius: a bug touches only a small slice of traffic before it auto-rolls back",
      "Blue-green gives near-instant rollback by pointing traffic back to the old environment",
      "Feature flags separate deploy from release: toggle a feature without a redeploy, lowering MTTR",
      "Expand/contract lets you change schema with no downtime and still roll back code",
    ],
    cons: [
      "Blue-green doubles resource usage during the switch and does not fit a DB migration that is not backward-compatible",
      "Canary is pointless without metrics/SLOs to auto-evaluate — it becomes an over-complicated rolling deploy",
      "Stale feature flags breed technical debt and tangled logic branches without cleanup discipline",
      "A wrong DB migration (not backward-compatible) is the hardest failure to roll back and easily causes data loss",
    ],
    questions: [
      { q: "The peak exam season is approaching (5x traffic), and the team needs to deploy a new version of the grading service. Do you choose blue-green or canary, and why?",
        a: "Choose <strong>canary</strong>. Exam season is when risk and load are highest; some bugs (memory leaks, slowness under load, edge-case grading errors) only surface under real traffic. Canary sends the new build to 1% then 5% of traffic and <strong>watches real metrics at each step</strong>, so if it breaks only a small slice of learners is affected and the system auto-rolls back before it reaches 10M users. Blue-green switches 100% of traffic at once — fast rollback, but a failure that only-surfaces-under-load hits every user instantly. Here we <strong>trade rollout speed for a small blast radius</strong>, exactly what is needed at peak." },
      { q: "The team wants to rename the column 'score' to 'final_score' in the exam scores table. Why NOT deploy it in one shot, and how does the expand/contract pattern work?",
        a: "Deploying in one shot 'a breaking schema change + new code that depends on it' means that during rollout, old-code instances still look for the now-vanished <code>score</code> column → mass failures, and if you have to roll back the code the changed schema cannot be reverted — this is the hardest failure to recover from because a DB does not roll back as easily as code. The <strong>expand/contract</strong> pattern splits it into three separate deploys: (1) <strong>expand</strong> — add the <code>final_score</code> column, code writes both columns, reads the old one; (2) <strong>migrate</strong> — backfill the data and switch code to read the new column; (3) <strong>contract</strong> — once certain no one reads/writes <code>score</code>, drop it. The immovable principle: every step must be <strong>backward-compatible</strong> so old and new code coexist during the rollout." },
      { q: "A new build is running in prod when a bug is found. A teammate wants to 'fix it fast and push straight to prod'. What is your counter-argument, and what do you do?",
        a: "A rushed hotfix during a fire is a way to breed more bugs: the code has not gone through the full pipeline, fixing under pressure is error-prone, and it is not reproducible. The operational priority is <strong>rollback = redeploy the old artifact/version that ran fine</strong> (<code>kubectl rollout undo</code> or point traffic back to blue) — fast, already proven, low MTTR. If the bug is behind a feature flag it is even faster: <strong>turn the flag off</strong> without touching the artifact. Only after the fire is out and the system is stable do you calmly fix the root cause, run it through full CI, and then redeploy. Firefight first, fix the code after — true to the GIT-03 spirit." },
      { q: "The team wants to ship a new exam feature but still worries it is not solid at large scale. How do you separate the 'deploy' risk from the 'release' risk?",
        a: "Use a <strong>feature flag</strong> to separate the two: deploy the code containing the feature to prod with the <strong>flag off by default</strong> — the code is in prod but learners see nothing, so the deploy risk is validated on its own. Then <strong>turn the flag on gradually</strong>: a pilot school → a few provinces → nationwide, watching metrics at each step; if it breaks, <strong>turn the flag off instantly</strong> with no need to roll back the artifact or redeploy. The benefits: lower MTTR, the ability to run A/B experiments, and no more 'deploy at midnight so few users see it'. The price: a flag is technical debt — you need the discipline to clean up dead flags once the feature is stable nationwide." },
      { q: "A simple, low-risk service without good SLOs/observability. Should you apply canary for the sake of being 'proper'?",
        a: "No — this is over-engineering. Canary only delivers value when there are <strong>automated metrics/SLOs to evaluate each step</strong> (error rate, p99 latency); without them, canary is just rolling but more complex and slower, and it creates a false sense of safety. For a low-risk service, <strong>a rolling deploy is the sensible default</strong>: simple, no doubling of resources, good enough. The right roadmap is: stand up rolling + reliable rollback first, <strong>invest in observability/SLOs</strong> (tier 6), then upgrade to canary for exactly the high-risk services on hot traffic paths. Choose the strategy by measured risk, not by trend." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">With an edtech service (e.g. grading) that already has an immutable image from CI-06: (1) build an automated deploy chain dev → staging, adding a manual approval gate before prod; (2) implement <b>rolling</b> then <b>blue-green</b> for the same service, measuring the rollback time of each; (3) write a simple canary script: send the new build to 10% of traffic, call <code>check-slo.sh</code> to check error rate + p99, and auto <code>rollout undo</code> if it exceeds the threshold — deliberately deploy a 'broken' build to watch it self-rollback; (4) practice renaming a DB column with the <b>expand/contract</b> pattern across three separate deploys, confirming no downtime; (5) wrap a feature behind a feature flag, deploy with the flag off, then turn it on gradually and off instantly. Record: what each strategy trades off (resources, rollback speed, blast radius).</p>`,
    links: [
      { t: "Martin Fowler — BlueGreenDeployment", u: "martinfowler.com/bliki/BlueGreenDeployment.html" },
      { t: "Martin Fowler — CanaryRelease", u: "martinfowler.com/bliki/CanaryRelease.html" },
      { t: "Martin Fowler — Evolutionary Database Design (expand/contract)", u: "martinfowler.com/articles/evodb.html" },
      { t: "Martin Fowler — Feature Toggles", u: "martinfowler.com/articles/feature-toggles.html" },
      { t: "DORA — Deployment automation & Continuous Delivery", u: "dora.dev/capabilities/deployment-automation" },
    ],
  },
];
