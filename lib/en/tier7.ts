import type { SkillNode } from "../skill-types";

export const EN_TIER7: SkillNode[] = [
  {
    id: "SEC-17", tier: 7, xp: 100, prereq: ["CD-07", "IAC-09"],
    title: "DevSecOps & Secrets Management",
    sum: "Shift-left security; secret manager; least privilege; SAST/DAST/SCA.",
    theory: `<p><b>Shift-left</b> means pushing security checks earlier in the lifecycle — catching issues while they are still cheap to fix (on the dev machine, in the PR) instead of letting a pentest find them once you are already in prod. Security is not a final gate guarded by another team; it is a set of automated steps spread along the pipeline. Three concrete insertion points:</p>
<ul>
<li><b>Pre-commit</b> — scan for secrets right before the commit lands (<code>gitleaks</code>, <code>git-secrets</code>) so a token never enters Git history in the first place.</li>
<li><b>CI</b> — <b>SAST</b> (static source scanning) + <b>SCA</b> (dependency scanning: <code>npm audit</code>, Trivy, Snyk) + <b>image scan</b> (scan for vulnerabilities inside the container image).</li>
<li><b>Pre-deploy</b> — IaC policy scanning (<code>tfsec</code>, Checkov, OPA) to block dangerous configuration (public S3, security group open to 0.0.0.0/0) + <b>DAST</b> running on staging (attacking the running app the way a hacker would).</li>
</ul>
<p><b>The deadly trap — a leaked secret in Git:</b> deleting that line and committing again <i>saves nothing</i> — the secret still lives in history, and anyone who clones the repo can see it. Even rewriting history (BFG/filter-repo) means you must treat the secret as <b>permanently compromised</b>. The correct and mandatory action is to <b>ROTATE</b> — revoke and reissue the secret immediately. Rewriting history is only secondary cleanup; it does not replace rotation.</p>
<p><b>Secret manager vs env var:</b> an env var separates the secret from code (good), but it is still static, hard to rotate, easy to leak via logs/core dumps, and gives no audit trail of who read it and when. A <b>secret manager</b> (Vault, a cloud secret store) issues <b>short-lived secrets with a TTL</b>, rotates automatically, logs access, and grants permissions per identity.</p>
<p><b>Least privilege</b> for service accounts: each service gets its own identity with exactly the minimum permissions it needs. When (not if) a service is compromised, the blast radius is limited to exactly its permissions rather than spreading across the whole system.</p>`,
    whenUse: `<p>Apply this as soon as you have a CD pipeline (CD-07) and IaC (IAC-09) — because those are exactly where the security gates get inserted. For an edtech platform with 10M users holding learner data (children, payments), this is not optional. But in the spirit of <b>measure first, automate later</b>: start with a pre-commit secret scan + SCA (cheap, high value); do not stand up a full Vault HA cluster on day one. To fight over-engineering: <b>run gates in warn mode first</b>, measure the false-positive rate, and only then flip on hard blocking.</p>`,
    pros: [
      "Catches security issues early while they are still cheap, instead of letting a pentest find them in prod",
      "Secret manager gives short-lived, auto-rotated, auditable secrets",
      "Least privilege limits the blast radius when a service is compromised",
      "Automated gates turn security into a repeatable habit that does not depend on memory",
    ],
    cons: [
      "Security scans easily produce false positives; hard-blocking too early clogs the pipeline and desensitizes the team to alerts",
      "Running a secret manager (Vault) adds another system to maintain and a potential new point of failure",
    ],
    questions: [
      { q: "A dev accidentally commits an AWS access key into the repo and notices 10 minutes later. They plan to delete the line and commit again. Is that enough?",
        a: "<strong>Not enough, and the priority order is wrong.</strong> The secret is already in Git history — anyone who has cloned/fetched, or any bot scanning GitHub, already has it, so treat it as permanently compromised. The first and mandatory step is to <strong>rotate: revoke the old key and issue a new one immediately</strong>; deleting the line or rewriting history (BFG/filter-repo) is only secondary cleanup. The preventive lesson: enable <code>gitleaks</code> at pre-commit so it can never make it into the first commit." },
      { q: "Distinguish SAST, DAST, and SCA. What class of issues does each catch, and where should each live in the pipeline?",
        a: "<strong>SAST</strong> statically scans source code (without running the app) for dangerous patterns like SQL injection or hardcoded secrets — it lives in CI and runs quickly on every PR. <strong>SCA</strong> scans the dependency/third-party library tree against a database of known vulnerabilities (CVEs) — also in CI, because most prod code is someone else's dependency. <strong>DAST</strong> attacks the <em>running</em> app from the outside like a hacker (fuzzing, testing for auth bypass) — it lives <strong>pre-deploy on staging</strong> because it needs a live environment. They complement each other: SAST/SCA see issues in the code you write and borrow, while DAST sees issues that surface only when the whole system runs for real." },
      { q: "The team keeps the DB secret in the container's environment variables. Should you force a move to Vault right away?",
        a: "An env var is already better than hardcoding, but it is static, hard to rotate, leaks via logs/core dumps, and is not auditable — for an edtech holding learner data that is not enough. Even so, do not jump straight into standing up a Vault HA cluster before you have measured the need: the operational cost and risk can turn it into a new point of failure. <strong>Decide by trade-off: use the cloud's managed secret store first (cheap, low operational overhead), prioritizing auto-rotation + audit logging</strong>; only step up to self-hosted Vault when you have a requirement like dynamic DB secrets or multi-cloud that the managed store cannot meet." },
      { q: "An IaC policy scan (tfsec/Checkov) reports 300 violations across your existing Terraform codebase. Should you turn on hard-blocking immediately?",
        a: "<strong>No — hard-blocking on day one freezes every deploy and makes the team just disable the tool.</strong> Run in <em>warn (audit) mode</em> first, triage the 300 violations by severity, and only set <strong>hard-blocking for the critical class</strong> (public S3, security group open to 0.0.0.0/0 on sensitive ports), then expand gradually. This is shift-left done right: bring checks earlier but along a measurable roadmap, avoiding turning the security gate into something everyone tries to route around." },
      { q: "Why should each microservice have its own service account instead of sharing one high-privilege identity for convenience?",
        a: "Sharing one high-privilege identity means that when a single service is exploited, the attacker inherits <strong>all</strong> of those permissions — the blast radius is the whole system. <strong>Least privilege: one identity per service, with exactly the minimum permissions</strong> (the video service only reads the video bucket and cannot touch the payments DB). It also makes auditing clear (you know exactly which identity did what) and limits damage when a secret leaks. The trade-off is more accounts/policies to manage — so manage them with IaC (IAC-09) to keep it from becoming a manual burden." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">On a small app repo with a CI pipeline: (1) install <code>gitleaks</code> as a pre-commit hook, deliberately add a fake key, and confirm it gets blocked; (2) add an SCA step to CI (<code>npm audit</code> or Trivy) plus an image scan step, and make the pipeline fail on a high-severity vulnerability; (3) add <code>tfsec</code>/Checkov to a Terraform module and run it in warn mode, counting the violations; (4) rehearse a leaked-secret scenario: write a 5-step runbook — <b>rotate first</b>, then clean up history — and time how long it takes the team to finish rotating a key.</p>`,
    links: [
      { t: "OWASP — DevSecOps Guideline", u: "owasp.org/www-project-devsecops-guideline" },
      { t: "gitleaks — scan for secrets in Git", u: "github.com/gitleaks/gitleaks" },
      { t: "HashiCorp Vault — secret management", u: "developer.hashicorp.com/vault/docs" },
      { t: "OWASP Cheat Sheet — Secrets Management", u: "cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html" },
      { t: "Aqua Trivy — image & IaC scanning", u: "trivy.dev" },
    ],
  },
  {
    id: "SUP-18", tier: 7, xp: 100, prereq: ["SEC-17", "CI-06"],
    title: "Supply Chain Security (SBOM · Signing)",
    sum: "SBOM, artifact signing, provenance; defending against supply chain attacks.",
    theory: `<p>A <b>supply chain attack</b> is when an attacker does not hit you directly but poisons a link you trust: a hijacked npm library, a base image with injected malware, a tampered CI step. You build cleanly from your own code yet still get infected through what you <i>borrow</i>. Because most prod artifacts are other people's code, this is the largest and hardest-to-see attack surface.</p>
<p><b>SBOM (Software Bill of Materials)</b> is the list of ingredients: every component + version present in an artifact. Its greatest value shows up during a crisis — <b>take Log4Shell</b>: when the Log4j vulnerability broke, teams with an SBOM answered within minutes — 'yes, services X and Y use Log4j 2.14, right here' — while teams without one grepped blindly across hundreds of repos for a week. An SBOM turns the question 'are we affected, and where' from days into seconds.</p>
<p><b>Signing artifacts</b> (<code>cosign</code>/Sigstore) attaches a cryptographic signature to an image to prove 'this image was built by my pipeline and has not been altered'. Then you <b>verify at deploy time</b> — the cluster rejects any image without a valid signature:</p>
<pre><code>cosign sign --key cosign.key registry/app:v1.4.2
cosign verify --key cosign.pub registry/app:v1.4.2
# K8s: use a policy controller (Kyverno/Sigstore) to block unsigned images</code></pre>
<p><b>Pin by digest, not by tag:</b> a tag is movable (<code>node:20</code>) and can be swapped out from under you. Pinning to an immutable digest guarantees the build today and next month pulls exactly one image:</p>
<pre><code>FROM node:20-slim@sha256:abc123...   # pin the digest, not just the tag</code></pre>
<p><b>Provenance / SLSA</b> is the artifact's 'birth certificate': which commit it was born from, which pipeline, and when — re-signable so it cannot be forged. <b>SLSA</b> is a framework for ranking the trustworthiness of the build chain. <b>Dependency confusion</b>: an attacker pushes a public package with the same name as your internal package but a higher version, tricking the package manager into pulling the malicious one — defend with scoping/private registries and pinned sources.</p>`,
    whenUse: `<p>Build this on top of SEC-17 and CI-06: you can only sign/attach provenance once you control the build pipeline. For an edtech with 10M users, one poisoned image is a broad data breach. But still <b>measure first, automate later</b>: the highest-value and cheapest wins are to <b>generate an SBOM for every image</b> (one line in CI) and to <b>pin base images by digest</b> — do those right now. Signing + mandatory verify at deploy is a later step, once you have a policy controller and a key-management process; enable verify in warn mode before hard-blocking so you do not lock yourself out of prod.</p>`,
    pros: [
      "An SBOM turns a crisis question into a lookup of seconds instead of grepping for a week",
      "Signing + verify blocks unknown/tampered images before they run on the cluster",
      "Pinning by digest gives reproducible builds that cannot be swapped out from under you",
      "Provenance/SLSA gives a verifiable build chain that resists artifact forgery",
    ],
    cons: [
      "Adds signing key management and a policy controller; getting this wrong can lock you out of your own deploys",
      "An SBOM is only useful if it is stored and queryable; generating one and throwing it away is meaningless",
    ],
    questions: [
      { q: "You wake up to news that a critical vulnerability in a popular library (Log4Shell-style) was just disclosed. How do a team with an SBOM and a team without differ in the first hour?",
        a: "The team <strong>with an SBOM</strong> runs one query against the SBOM store and within minutes knows exactly which services, which versions, and where are affected — then focuses the patch on the right spots. The team <strong>without</strong> greps blindly across hundreds of repos and images, easily misses a secondary service that is still affected, and drags out exposure for days. <strong>The core value of an SBOM is shortening the time to answer 'are we affected, and where' from days to seconds</strong> — exactly when every minute is expensive. The condition: the SBOM must be stored and queryable, not generated and discarded." },
      { q: "The team's Dockerfile says FROM node:20. Why is this a supply chain risk, and how do you fix it?",
        a: "The tag <code>node:20</code> is a <strong>movable label</strong>: today and next month it can point to two different images, so builds are not reproducible, and if the tag gets poisoned you pull malware without noticing. <strong>Fix: pin to an immutable digest</strong> — <code>FROM node:20-slim@sha256:...</code> — so you always pull exactly one vetted image. The trade-off is that you must proactively update the digest when you want a newer version (automate this with Renovate/Dependabot), but in exchange you get reproducibility and a clear control point." },
      { q: "You have signed the image with cosign. But if you only sign and do nothing else, what have you actually protected?",
        a: "<strong>Nothing yet — signing without verifying is nearly useless.</strong> A signature only has value when someone <em>checks</em> it before running: the cluster must have a policy controller (Kyverno/Sigstore policy-controller) that <strong>rejects any image not carrying a valid signature from your pipeline</strong>. That is what blocks an attacker from pushing an unknown or tampered image into the registry. Operational note: enable verify in warn mode first, because a misconfigured key/policy can lock you out of deploying to prod." },
      { q: "What is dependency confusion, and why is an edtech with many internal packages especially vulnerable?",
        a: "An attacker pushes to a public registry a package with <strong>the same name as your internal package but a higher version</strong>; if the package manager prefers the highest version and can reach the public registry, it pulls the malicious one instead of the internal build. An edtech with many internal packages (shared libraries, SDKs) whose names are guessable is a juicy target. <strong>Defend: use a private scope/namespace, pin the registry source explicitly, and configure the resolver to block reaching public for internal packages</strong>. It belongs to the supply chain attack family because the entry point is something you trust, not your own system." },
    ],
    lab: `<span class="tag">Synthesis lab</span><p style="margin-top:8px">On your image build pipeline: (1) add a step to generate an SBOM (<code>syft</code> or <code>trivy sbom</code>) for every image and store it as a queryable artifact; (2) pin the base image in the Dockerfile by digest instead of tag, and record the difference; (3) use <code>cosign</code> to sign the image after build and <code>cosign verify</code> to check it — then try to deploy an unsigned image to a cluster with a policy controller and confirm it gets blocked; (4) simulate a Log4Shell drill: pick any dependency and use the SBOM to answer in under a minute 'which service uses it, and at what version'.</p>`,
    links: [
      { t: "SLSA — Supply-chain Levels for Software Artifacts", u: "slsa.dev" },
      { t: "Sigstore / cosign — sign & verify artifacts", u: "docs.sigstore.dev" },
      { t: "CISA — Software Bill of Materials (SBOM)", u: "cisa.gov/sbom" },
      { t: "Anchore Syft — generate SBOMs", u: "github.com/anchore/syft" },
      { t: "OWASP — Dependency Confusion", u: "owasp.org/www-community/attacks/Dependency_Confusion" },
    ],
  },
  {
    id: "SYN-A", tier: 7, xp: 200, prereq: ["CD-07", "K8S-11", "IAC-09"], synth: true,
    title: "⚙ Synthesis: End-to-end GitOps",
    sum: "Combine CI/CD + K8s + IaC into GitOps: Git as the single source of truth.",
    theory: `<p><b>GitOps</b> combines three things you have already learned — CD (CD-07), Kubernetes (K8S-11), IaC (IAC-09) — into one operating model: <b>the desired state of the whole system is declared in Git, and an agent continuously pulls Git to reconcile it with the cluster</b>. Git is no longer just where code lives; it is the <b>single source of truth</b> for both infrastructure and runtime configuration.</p>
<p><b>Pull vs push deploy — the core difference:</b></p>
<ul>
<li><b>Push</b> (traditional CI): the CI pipeline holds cluster credentials and <code>kubectl apply</code>s into it. The problem: CI must hold high-privilege keys to prod, and the cluster cannot tell on its own whether it has drifted from intent.</li>
<li><b>Pull</b> (GitOps — ArgoCD/Flux): an agent <i>running inside the cluster</i> pulls manifests from Git and applies them. Credentials never leave the cluster, and the agent continuously compares reality against Git.</li>
</ul>
<p><b>Drift detection & auto-heal:</b> because the agent always compares actual state against Git, if someone runs a manual <code>kubectl edit</code> at 3am, it detects the <i>drift</i> and pulls it back to match Git — or alerts. Manual changes can no longer live in the shadows; to change anything you must go through Git, which means through a PR, review, and audit.</p>
<pre><code>apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: edtech-web
spec:
  source:
    repoURL: https://git.example.com/edtech/config.git
    path: apps/web/overlays/prod
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: web
  syncPolicy:
    automated:
      prune: true      # delete things removed from Git
      selfHeal: true   # pull drift back to match Git</code></pre>
<p><b>Separate app repo and config repo:</b> app code in one repo, deployment manifests/config in another. Reasons: (1) avoid an infinite loop — CI builds and writes a new tag into the config repo without re-triggering itself; (2) changing prod config (scale, rollback) does not require rebuilding the app; (3) different permissions — whoever may change prod config is not necessarily whoever changes code.</p>
<p><b>Rollback = git revert of the manifest:</b> because state is declared in Git, rolling back is just a <code>git revert</code> of the config commit back to the old image/tag — the agent syncs automatically. Rollback becomes an audited Git operation instead of a nervous manual command.</p>`,
    whenUse: `<p>GitOps is worth it when you <b>already</b> have Kubernetes + IaC + CD and start hurting from drift, from untraceable manual changes, from CI holding too many prod keys. For an edtech with 10M users across many clusters/environments, it is how you keep everything consistent and auditable. But <b>fight over-engineering</b>: do not stand up ArgoCD for a single app on a single cluster that deploys a few times a week — simple push CD is fine there. GitOps costs you a system (ArgoCD/Flux) to operate plus the discipline of 'everything through Git'; only buy it when the pain of drift/audit/multi-cluster is measurable.</p>`,
    pros: [
      "Git is the single source of truth: every change has a PR, review, audit, and is reproducible",
      "The pull model keeps prod credentials inside the cluster; CI needs no high-privilege keys",
      "Drift detection + auto-heal eliminates shadow manual changes at 3am",
      "Rollback is an audited git revert instead of a nervous manual command",
    ],
    cons: [
      "Adds ArgoCD/Flux to operate, which becomes a critical link you must monitor",
      "Demands absolute discipline of 'everything through Git'; a single manual edit can be unexpectedly overwritten by auto-heal",
    ],
    questions: [
      { q: "Compare push deploy (CI kubectl apply) and pull deploy (ArgoCD). For an edtech with many clusters, which model is safer and why?",
        a: "<strong>Pull is safer at multi-cluster scale.</strong> Push forces CI to hold high-privilege credentials into every prod cluster — one compromised CI means the whole fleet is lost, and CI does not know whether a cluster has been manually edited out of sync. Pull puts an agent <em>inside</em> the cluster to pull Git itself, so <strong>prod credentials never leave the cluster</strong> and the agent continuously compares reality against Git to detect/fix drift. Trade-off: pull needs you to operate and monitor ArgoCD/Flux itself; at single-app single-cluster scale, simple push is still more reasonable — do not buy GitOps complexity before it hurts." },
      { q: "Why does GitOps usually separate the app repo and the config repo? Where does merging them break?",
        a: "You separate them for three reasons: <strong>(1) avoid a CI loop</strong> — the pipeline builds an image then writes a new tag into the config repo without re-triggering itself; <strong>(2) changing prod config (scale, swap tag, rollback) does not require rebuilding the app</strong>, which is faster and lower-risk; <strong>(3) different permissions</strong> — whoever is approved to change prod is not necessarily whoever changes code. Merging them means every one-line manifest edit reruns the whole app build/test, easily creates bot-commit loops, and makes it hard to split permissions — mixing 'code change' with 'prod operational change' into the same review." },
      { q: "At 3am, someone runs kubectl edit manually to bump replicas while firefighting. With GitOps selfHeal on, what happens, and what is the right way?",
        a: "The agent detects that reality has <strong>drifted from Git</strong> and pulls it back to the number of replicas declared in Git — the manual change is reverted, possibly mid-firefight, causing a dangerous surprise. That is exactly the strength (no shadow changes) but also the trap: <strong>the right way is to change through Git — edit the manifest, commit/PR, and let the agent sync</strong>; if you truly need an emergency manual patch, you must temporarily disable selfHeal for that app and then reconcile it back into Git right after. Lesson: GitOps demands the discipline of 'everything through Git', and your incident runbook must account for auto-heal." },
    ],
    lab: `<span class="tag">Synthesis lab</span><p style="margin-top:8px">On a cluster (kind/minikube): (1) create two repos — an app repo and a config repo (manifests); (2) install ArgoCD and declare one <code>Application</code> pointing at the config repo with <code>selfHeal</code> + <code>prune</code>; (3) change the replica count in the config repo, commit, and watch ArgoCD sync automatically; (4) run a manual <code>kubectl edit</code> to create drift and observe it being pulled back; (5) rehearse a rollback: <code>git revert</code> the commit that changed the image tag back to the old version and confirm the cluster rolls itself back. Record: how long the git-revert rollback took, and who can audit it.</p>`,
    links: [
      { t: "Argo CD — official documentation", u: "argo-cd.readthedocs.io" },
      { t: "OpenGitOps — GitOps principles", u: "opengitops.dev" },
      { t: "Flux CD — GitOps toolkit", u: "fluxcd.io/flux" },
      { t: "Weaveworks — What is GitOps (origin of the term)", u: "weave.works/technologies/gitops" },
    ],
  },
  {
    id: "SYN-B", tier: 7, xp: 200, prereq: ["SLO-15", "ALT-16", "SCL-13"], synth: true,
    title: "⚙ Synthesis: Design for Failure & SRE",
    sum: "Combine SLO + resilience + autoscale + chaos: PROVE fault tolerance, don't claim it.",
    theory: `<p>This node combines SLO (SLO-15), alerting/resilience (ALT-16), and autoscale (SCL-13) into one mindset: <b>whether a system tolerates failure is something you must PROVE experimentally, not declare on an architecture slide</b>. 'We have replicas so we are HA' is a belief until you pull the plug on a node at peak and watch what actually happens.</p>
<p><b>Prove resilience with controlled chaos + load testing:</b></p>
<ul>
<li><b>Chaos engineering</b> — deliberately inject failures (kill pods, add latency, cut the network to the DB) in a controlled environment, with a <i>hypothesis</i> up front ('killing 1 pod keeps the SLO') and a limited <i>blast radius</i>. If the hypothesis is wrong, you learn about a SPOF before anyone gets hurt.</li>
<li><b>Load test</b> — pump simulated load to find the breaking point <i>before</i> users do.</li>
</ul>
<pre><code>// k6: simulate a ramp to 20k VU and check the SLO threshold
import http from "k6/http";
export const options = {
  stages: [
    { duration: "5m", target: 20000 },
    { duration: "10m", target: 20000 },
  ],
  thresholds: { http_req_duration: ["p95&lt;800"] },
};
export default function () { http.get("https://staging.edtech.example/api/lessons"); }</code></pre>
<p><b>Common SPOFs + how to remove them:</b> a single DB primary (add a replica + failover), a single AZ (spread across AZs), a single Redis cache (cluster/replica + keep working when the cache dies), a single NAT/gateway, a single secret manager, a single CI/CD. The principle: walk every request path and ask 'where is there only one, whose death takes everything down'.</p>
<p><b>'The load test passed but prod still fell over' — 3 classic reasons:</b></p>
<ul>
<li><b>The test environment differs from prod</b> — staging is smaller, has less data, a different configuration; nice numbers on staging are meaningless for prod.</li>
<li><b>Wrong scenario</b> — the test hits one endpoint evenly, while prod is mixed traffic with sudden spikes (registration opening for an exam at 8am) that the test never simulated.</li>
<li><b>Hidden dependencies</b> — the test runs on a hot cache or skips third parties (payment, email, CDN), so it never sees the real bottleneck.</li>
</ul>
<p><b>Graceful degradation:</b> when load exceeds capacity or one part dies, sacrifice secondary features to keep the core alive. For edtech during exam time: prioritize submitting work / viewing the exam; temporarily disable recommendations, the leaderboard, thumbnails. Better to run 80% of features than to crash 100%.</p>`,
    whenUse: `<p>Apply this when you already have measurable SLOs and autoscale/resilience mechanisms, and you need <b>evidence</b> that they actually work — usually before a large traffic event (exam season, back-to-school) or after an incident that no one could explain. In the spirit of <b>measure first, automate later</b>: chaos/load testing is how you 'measure' fault tolerance. Fight over-engineering: do not run chaos on prod on day one — start on staging with a small blast radius and a clear hypothesis; only advance to chaos on prod (a game day) once the team is mature in observability and has SLOs/error budgets as a safety net.</p>`,
    pros: [
      "Turns 'it should hold up' into experimental evidence with a hypothesis and numbers",
      "Finds SPOFs and breaking points before anyone gets hurt, instead of at real peak",
      "Graceful degradation keeps the core alive when part of the system dies",
      "Load testing done right lets you size infrastructure before peak season",
    ],
    cons: [
      "Chaos/load testing done carelessly (wide blast radius, no hypothesis) causes a real incident",
      "A test environment that mirrors prod is very expensive; testing on a skewed environment gives false confidence",
    ],
    questions: [
      { q: "An architect says 'the system has 3 replicas so it tolerates failure well'. Why is that statement not enough, and how do you PROVE it?",
        a: "Having replicas is a <strong>claim</strong>, not yet evidence — failover may have never run, health checks may be wrong so traffic still hits a dead pod, or the DB underneath may still be a single primary. <strong>How to prove it: controlled chaos</strong> — set the hypothesis 'killing 1 of 3 pods keeps the p95 SLO', limit the blast radius, then actually kill a pod in a controlled environment and measure. If the SLO breaks, you just found a SPOF before anyone got hurt. The SRE principle: <strong>resilience is measured experimentally, not asserted on a slide</strong>." },
      { q: "The load test on staging passes fully (p95 under threshold), but at exam registration opening, prod still falls over. Three plausible causes?",
        a: "<strong>(1) The test environment differs from prod</strong> — staging is smaller, has less data, and different config/instances, so nice numbers do not represent prod. <strong>(2) Wrong scenario</strong> — the test pumps even load at one endpoint, while prod is a sudden spike at 8am with mixed traffic the test never simulated. <strong>(3) Hidden dependencies</strong> — the test runs on a hot cache or skips third parties (payment, confirmation emails, CDN), so it misses the real bottleneck. Lesson: <strong>a load test is only trustworthy when the environment is close to prod, the scenario matches real traffic, and no dependency is hidden</strong>." },
      { q: "At peak exam time the system starts to overload. How do you design graceful degradation for edtech — what do you sacrifice, what do you keep?",
        a: "Principle: <strong>classify features by how essential they are and sacrifice the secondary ones to protect the core path</strong>. For exam time, the core is <em>viewing the exam and submitting work</em> — it must survive at all costs. You can temporarily disable/degrade: the leaderboard, lesson recommendations, video thumbnails, real-time stats, notifications. Accompanying techniques: load shedding, a queue for non-urgent writes, serving static content from the CDN, and circuit breakers so a dying secondary service does not drag the core down. <strong>Better 80% of features running than 100% down</strong> — and the decision of 'what gets sacrificed' must be locked in <em>before</em> the incident, not improvised at 8am." },
      { q: "You want to start chaos engineering for edtech. Is running straight on prod to be 'most realistic' a good idea?",
        a: "<strong>You should not start on prod</strong> — careless chaos means self-inflicting a real incident on 10M users. The maturity sequence: <strong>start on staging with a small blast radius and a clear hypothesis</strong>, each experiment with an emergency stop button and measurable success/failure criteria. Only advance to chaos on prod (a scheduled game day with people on call) once the team is <strong>mature in observability and has SLOs/error budgets as a safety net</strong> to know instantly when a threshold is crossed and to stop. Chaos on prod is a worthy goal because only prod exposes all the hidden dependencies — but it is a destination, not a starting point." },
    ],
    lab: `<span class="tag">Synthesis lab</span><p style="margin-top:8px">On the staging environment of an app that has an SLO: (1) write a <code>k6</code> script that ramps load to the expected peak-season threshold, set the threshold to match the p95 SLO exactly, and find the breaking point; (2) draw the request path and circle every SPOF (DB primary, single cache, single AZ) — pick one and plan how to remove it; (3) run a small chaos experiment with a hypothesis (kill 1 pod / add 200ms latency to the DB) and check whether the SLO holds; (4) install a graceful degradation mechanism (a feature flag that turns off the leaderboard under high load) and prove the core 'submit work' still lives when the secondary part is off. Rewrite the 3 reasons 'the test passes but prod falls over' applied to your own system.</p>`,
    links: [
      { t: "Principles of Chaos Engineering", u: "principlesofchaos.org" },
      { t: "Google SRE Book — Embracing Risk & SLOs", u: "sre.google/sre-book/table-of-contents" },
      { t: "k6 — load testing", u: "k6.io/docs" },
      { t: "Netflix — Chaos Monkey / Simian Army", u: "netflix.github.io/chaosmonkey" },
    ],
  },
  {
    id: "BOSS", tier: 7, xp: 500, boss: true,
    prereq: ["LNX-01", "NET-02", "GIT-03", "DKR-04", "CMP-05", "CI-06", "CD-07", "CLD-08", "IAC-09", "CFG-10", "K8S-11", "HLM-12", "SCL-13", "OBS-14", "SLO-15", "ALT-16", "SEC-17", "SUP-18", "SYN-A", "SYN-B"],
    title: "★ BOSS: Platform DevOps for a 10M Edtech",
    sum: "Capstone: design & operate a complete, defensible delivery platform.",
    theory: `<p>This is the <b>Boss fight</b> — where every layer combines. There is no new knowledge; there is one mission: <b>design and DEFEND a complete DevOps platform for a 10M-user edtech</b>, from commit to prod, safe and fault-tolerant. The prompt simulates a Senior/Staff interview, where every choice you make gets pressed with 'why not do it differently'.</p>
<p><b>Scope you must cover:</b></p>
<ul>
<li><b>The commit → prod path</b> with safety gates: trunk-based + CI (test, SAST, SCA, image scan) → build an immutable artifact + SBOM + signing → progressive CD (canary/blue-green) + safety gate + rollback via artifact/git revert.</li>
<li><b>Infrastructure</b>: IaC (Terraform) for cloud, no manual operations; reproducible environments.</li>
<li><b>Orchestration</b>: Kubernetes + Helm; autoscale by load; GitOps (ArgoCD) as the source of truth.</li>
<li><b>Observability</b>: metrics/logs/traces; SLOs + error budget; symptom-based alerts, not cause-based ones.</li>
<li><b>Security & supply chain</b>: shift-left, secret manager, least privilege, SBOM, sign + verify at deploy time.</li>
<li><b>Fault tolerance</b>: remove SPOFs, graceful degradation, prove it with chaos + load testing.</li>
</ul>
<p><b>The rules — there is no single correct answer.</b> This Boss does not grade you on choosing ArgoCD or Flux, EKS or self-managed. It grades the <b>quality of your trade-off reasoning</b>: can you state the trade-off of each choice, do you know when NOT to need a thing, do you anchor decisions to numbers (DORA/SLO) and measurable pain instead of trends. An answer of 'use K8s because everyone does' loses to one of 'at stage X I deliberately did not use K8s yet because...'.</p>
<p><b>The four root questions</b> (from FND-00) remain the compass when defending: (1) by what path does a change reach the user? (2) how do you know it is healthy or sick? (3) how does it fail, and can it self-recover? (4) when do I NOT yet need this thing?</p>`,
    whenUse: `<p>Take on the Boss once you have all 20 prerequisite nodes — meaning you have every piece. This is the dress rehearsal before you can confidently say 'I can design and operate a delivery platform at scale'. Best way to use it: have someone play the interviewer pressing each of your choices, or play both roles yourself. The through-line: <b>measure first, automate later, fight over-engineering</b> — and always know what you are deliberately NOT doing at your current scale.</p>`,
    pros: [
      "Forces every layer into one coherent end-to-end story, not disconnected pieces",
      "Trains you to defend decisions with trade-offs and numbers, exactly like a Senior/Staff interview",
      "Forces you to state clearly what you deliberately do NOT do and why — the mark of a mature engineer",
    ],
    cons: [
      "There is no answer checklist; beginners easily think they must deploy everything at once (which is exactly the over-engineering to avoid)",
      "A strong answer requires real operational experience; hollow theory shows the moment you are pressed on failure modes",
    ],
    questions: [
      { q: "Sketch the commit → prod path for a 10M-user edtech and defend every safety gate you place. Why that gate, and which gate do you deliberately NOT add early on?",
        a: "<strong>There is no single correct diagram — you are graded on the quality of reasoning.</strong> A strong answer lays out a coherent flow (trunk-based → CI test+SAST+SCA+image scan → immutable artifact + SBOM + signing → CD canary/blue-green + safety gate + rollback) AND explains the trade-off of each gate: why SCA in CI (catch CVEs early, cheap), why canary and not big-bang (limit blast radius), rollback via artifact and not revert+build (fast, already vetted). The biggest bonus is <strong>naming the thing you deliberately did not do yet and the measurable reason</strong> — e.g. 'no hard-blocking signature verify until we have a policy controller and key-management process, to avoid locking ourselves out of prod'. A weak answer lists tools with no 'why' and no 'when not needed'." },
      { q: "The interviewer asks: 'Why use Kubernetes + GitOps for this platform? Prove it is worth the complexity.' How do you defend it — including the possibility the answer is NO?",
        a: "<strong>Graded on anchoring the decision to measurable pain, not to trends.</strong> A strong defense: at 10M users with many services, seasonally elastic exam traffic, and a need for many environments/clusters, K8s gives autoscale + self-heal and GitOps gives a source of truth + drift detection + audit — and these solve <em>concrete</em> pain (drift, untraceable manual changes, CI holding prod keys). But a mature answer also admits <strong>when NOT to need it</strong>: for a single app on a single cluster deploying a few times a week, K8s+ArgoCD is over-engineering — managed containers + simple push CD are simpler. Points off for answering 'because everyone does' or failing to name the operational cost of ArgoCD/K8s as a link you must monitor." },
      { q: "At 3am during exam season, the system is degrading but not fully down. With the SLOs/error budget, observability, GitOps, and graceful degradation you built — in what order do you make decisions?",
        a: "<strong>Graded on operational thinking under pressure and how the pieces work together, not a fixed procedure.</strong> A good answer starts from symptoms: SLO-based alerts (not CPU) tell you whether users are hurting → use traces/metrics/logs to isolate the failing layer → decide based on <em>remaining error budget</em> (plenty left means you can wait / roll back calmly; drained means act decisively) → trigger graceful degradation to protect the core 'submit work' path → if a change caused it, roll back via git revert of the manifest (GitOps) with audit; mind auto-heal when patching manually. Bonus: naming the human role (who is incident commander) and that the 'what to sacrifice' decisions were locked in BEFORE the incident. Points off: jumping to fix the cause before reducing user pain, or ignoring the error budget as a decision compass." },
      { q: "You claim the platform is 'fault-tolerant and secure'. The interviewer presses: 'Prove it — how do I trust it, not a slide?' How do you answer?",
        a: "<strong>Graded on distinguishing a CLAIM from EVIDENCE.</strong> A strong answer does not restate the architecture but offers ways to <em>verify experimentally</em>: for fault tolerance, prove it with hypothesis-driven chaos (kill a pod/AZ and measure whether the SLO holds) + a prod-like load test before peak season, and be honest about the '3 reasons the test passes but prod falls over' (skewed environment, wrong scenario, hidden dependencies); for security, prove it with automated gates that actually run (secret scan, SCA, image scan, signature verify blocking unknown images) + a leaked-secret drill with a timed rotation + a Log4Shell-style SBOM lookup. Big bonus: admitting what you <em>cannot</em> yet prove and the plan to prove it. Points off: hollow assertions like 'we have replicas so we are HA' or 'we sign so we are safe' with no verify/experiment step." },
    ],
    lab: `<span class="tag">Capstone</span><p style="margin-top:8px">Write a <b>3–5 page platform design doc</b> for a 10M-user edtech and defend it yourself: (1) a diagram of the commit → prod path with every safety gate, annotating the trade-off of each gate; (2) an infrastructure + orchestration diagram (IaC, K8s, GitOps) with a section on 'what I deliberately do NOT do at this scale and why'; (3) an observability strategy: list 3 core SLOs, an error budget policy, and a few symptom-based alerts; (4) a security & supply chain section: secrets, least privilege, SBOM, sign + verify; (5) a 'prove fault tolerance' section: one chaos scenario + one load test scenario + a graceful degradation plan for exam time. Finally, have someone (or play the role yourself) press you with 5 'why not do it differently' questions, and grade your own answers against the criteria: did you state the trade-off, did you anchor to numbers (DORA/SLO), do you know when it is NOT yet needed.</p>`,
    links: [
      { t: "Google SRE Book & Workbook", u: "sre.google/books" },
      { t: "DORA — State of DevOps & Capabilities", u: "dora.dev" },
      { t: "AWS Well-Architected Framework", u: "aws.amazon.com/architecture/well-architected" },
      { t: "CNCF — Cloud Native Landscape & Trail Map", u: "landscape.cncf.io" },
      { t: "The DevOps Handbook (Gene Kim)", u: "itrevolution.com/product/the-devops-handbook" },
    ],
  },
];
