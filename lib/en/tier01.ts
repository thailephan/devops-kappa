import type { SkillNode } from "../skill-types";

export const EN_TIER01: SkillNode[] = [
  {
    id: "FND-00", tier: 0, xp: 100, prereq: [],
    title: "DevOps Mindset & DORA",
    sum: "DevOps is a culture, not a tool. Measure with DORA, shorten the feedback loop.",
    theory: `<p><b>DevOps is not a job title or a toolset</b> — it is the practice of shortening the loop of <i>code &rarr; run in production &rarr; know whether it is healthy &rarr; fix</i> in a way that is safe, automated, and repeatable. As a developer you already own the first half; DevOps is about claiming the second half too: <b>packaging &middot; shipping &middot; operating &middot; observing &middot; owning it when it breaks at 3am</b>.</p>
<p>Four foundational questions behind every decision (the same trade-off mindset): (1) By what path does this change reach the user? (2) How do I know whether it is healthy or sick? (3) How does it fail, and can it recover on its own? (4) When do I <i>not</i> need this yet?</p>
<p><b>The CALMS framework:</b> Culture (tear down the Dev&harr;Ops wall) &middot; Automation &middot; Lean (small batches) &middot; Measurement &middot; Sharing. Tools only exist to serve these five pillars.</p>
<p><b>DORA — the four metrics that are the compass for everything you learn later:</b></p>
<ul>
<li><b>Deployment Frequency</b> — how often you ship.</li>
<li><b>Lead Time for Changes</b> — how long from commit to running in prod.</li>
<li><b>Change Failure Rate (CFR)</b> — the percentage of deploys that cause an incident.</li>
<li><b>MTTR</b> — how long it takes to recover once something breaks.</li>
</ul>
<p><b>Why small, frequent deploys are SAFER:</b> small batch &rarr; small blast radius &rarr; when it breaks it is easy to isolate the culprit and rollback costs little. If you deploy 200 commits at once, the bug lives somewhere in those 200 — you cannot debug it. High frequency <i>increases</i> stability, it does not reduce it.</p>`,
    whenUse: `<p>Apply this <b>before every tooling decision</b>. Without DORA numbers, "let's put Docker/K8s on it" is just ritual. Measure first, automate second. And always ask question (4): an edtech app with 100 users does <b>not</b> need Kubernetes yet — resisting over-engineering is part of DevOps.</p>`,
    pros: [
      "Every later tool choice has a measurable basis (DORA), not gut feeling",
      "Small batches reduce risk and increase delivery speed at the same time",
      "A culture of end-to-end ownership: whoever writes the code also operates it",
    ],
    cons: [
      "Requires cultural/organizational change — far harder than installing a tool",
      "Needs measurement discipline; without data it is easy to chase trends",
    ],
    questions: [
      { q: "A team deploys once a month, bundling 200 commits each time. Why is the risk high, and how does DevOps fix it?",
        a: "Enormous blast radius: if those 200 commits break, you have to dig through all 200 to find the culprit, and a rollback throws away the good features too. Fix it by <strong>reducing batch size</strong> — deploy small and often, with few changes each time so bugs are easy to isolate and MTTR drops. This is the core paradox of DevOps: <strong>higher deploy frequency makes the system more stable</strong>, not less." },
      { q: "A team's Change Failure Rate is currently 0%. Good news or a bad sign?",
        a: "Usually a <strong>bad sign</strong>: it means the team deploys too rarely, is too afraid to ship, or is not measuring at all. The goal is not 0% but <strong>low CFR + low MTTR</strong> (recover fast when it breaks). A genuine 0% is only achievable when you ship almost nothing — and 'not shipping' is itself a kind of failure." },
      { q: "Your boss says: 'Do DevOps, go buy Kubernetes.' Push back.",
        a: "DevOps is <strong>culture + process</strong>, not something you buy with a tool. Buying K8s while still deploying by hand once a month just adds complexity and one more system to operate. Start with <strong>measuring DORA + automating CI</strong>; heavy tools like K8s only come once you have <strong>measurable evidence</strong> that you are missing them." },
      { q: "For an edtech app with just 500 users, what are three things you deliberately do NOT do yet (anti over-engineering)?",
        a: "Reasonable examples: <strong>no Kubernetes yet</strong> (one VM plus Docker Compose or a managed container is enough), <strong>no microservices yet</strong> (a monolith ships fast with fewer breakage points), <strong>no multi-region yet</strong> (one region near the users). The principle: the architecture must be <strong>able to evolve</strong>, and you only buy complexity when there is measurable pain — question (4) of the foundational mindset." },
      { q: "Among the four DORA metrics, if you could improve only ONE first for a team that suffers prolonged incidents, which would you pick and why?",
        a: "Pick <strong>MTTR</strong> (recovery time). For a team that 'stays down for a long time', cutting MTTR delivers immediate value to users and reduces on-call pressure, while also forcing you to build fast rollback + observability — foundations that in turn improve both CFR and Lead Time. Cure 'takes forever to recover' before worrying about 'deploy faster'." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Write a one-page 'DORA baseline' for your own app/project: (1) how often do you deploy today? (2) how long from merge to prod? (3) did any of the last few deploys cause an incident? (4) how long did the most recent incident take to recover? If you cannot measure one of these yet &rarr; that is exactly the first thing you need to build. Then list three things you are <b>deliberately not doing yet</b> at your current scale, and why.</p>`,
    links: [
      { t: "DORA — DevOps Research & Assessment (State of DevOps)", u: "dora.dev" },
      { t: "Google Cloud — Use the Four Keys to measure DevOps", u: "cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance" },
      { t: "The DevOps Handbook (Gene Kim) — CALMS summary", u: "itrevolution.com/product/the-devops-handbook" },
      { t: "Atlassian — What is DevOps?", u: "atlassian.com/devops" },
    ],
  },
  {
    id: "LNX-01", tier: 1, xp: 100, prereq: ["FND-00"],
    title: "Linux & Operational CLI",
    sum: "You cannot operate what you do not understand: processes, systemd, logs, permissions, shell.",
    theory: `<p>90% of production incidents are debugged from the Linux CLI. You need a firm grip on: <b>filesystem & permissions</b> (user/group, <code>chmod</code>/<code>chown</code>, why you should not run everything as root), <b>processes</b> (<code>ps</code>, <code>top/htop</code>, the SIGTERM vs SIGKILL signals), <b>systemd</b> (<code>systemctl</code>, <code>journalctl</code>), <b>resources</b> (<code>df</code>, <code>free</code>, <code>du</code>), and <b>shell scripting</b> to automate repetitive work.</p>
<p>The diagnostic command set for when a service is 'sick':</p>
<pre><code>systemctl status app        # is it still running, how many restarts
journalctl -u app -n 100    # last 100 log lines of the service
ps aux --sort=-%mem | head  # which process is eating RAM
df -h                       # is there disk space left (full disk = silent crash)
ss -tlnp                    # which ports are listening, which PID</code></pre>
<p><b>The mindset:</b> follow the path of the request (from outside in) and always ask 'where are the logs, which resource is exhausted'. A full disk (<code>df</code>) and running out of file descriptors are the two classic causes of 'mysterious crashes' that few people think to check.</p>`,
    whenUse: `<p>The foundation for <b>every</b> layer above: Docker, K8s, and cloud VMs are all Linux underneath. Developers used to macOS/WSL should still practice, because prod is almost always a headless Linux server. You do not need to become a sysadmin — just enough to read logs, find processes, fix permissions, and write automation scripts.</p>`,
    pros: [
      "Debug real incidents instead of guessing or only knowing how to restart",
      "It is the common language of every DevOps tool above it",
      "Shell scripts automate repetitive tasks quickly",
    ],
    cons: [
      "Huge surface area of knowledge; easy to wander if you don't anchor to real needs",
      "Manual operations on a server cause 'drift' without discipline (see IAC-09)",
    ],
    questions: [
      { q: "The app returns 502 Bad Gateway. Which commands do you run, and in what order?",
        a: "502 = the reverse proxy (Nginx) cannot talk to the backend. Work from outside in: is the app alive? (<code>systemctl status app</code> / <code>ps aux</code>) &rarr; is it listening on the right port? (<code>ss -tlnp</code>) &rarr; call the backend directly, bypassing the proxy (<code>curl localhost:3000/health</code>) &rarr; read the app logs (<code>journalctl -u app</code>) plus the Nginx logs. <strong>The principle: trace the request path and isolate the broken layer before fixing anything.</strong>" },
      { q: "A prod service 'crashes mysteriously' but CPU/RAM look normal. What two classic culprits do you check?",
        a: "(1) <strong>Full disk</strong> — <code>df -h</code>; bloated logs/uploads make file writes fail, the DB cannot commit, and the app dies silently. (2) <strong>Out of file descriptors / ports</strong> — too many open connections (<code>ss</code>, <code>lsof</code>, <code>ulimit -n</code>). Neither shows up on a CPU/RAM graph, so they are often missed; this is why observability must include saturation of disk & fds, not just CPU." },
      { q: "What is the difference between sending SIGTERM and SIGKILL to a process? Why do containers/K8s send SIGTERM first?",
        a: "<strong>SIGTERM</strong> asks the process to clean up and exit (close connections, flush, finish in-flight requests) — a graceful shutdown. <strong>SIGKILL</strong> kills instantly with no chance to clean up &rarr; you can lose data or corrupt state. K8s sends SIGTERM, waits for <code>terminationGracePeriod</code>, and only then SIGKILL. Your app must <strong>catch SIGTERM</strong> to exit cleanly, otherwise every deploy cuts off a learner's request mid-flight." },
      { q: "Why should you NOT run a service as the root user, inside (and outside) a container? How do you fix it?",
        a: "Root has full power: if the service is exploited, the attacker owns the whole machine/host. The <strong>least privilege</strong> principle: create a dedicated user with minimal rights, granting access only to the exact directories it needs. In the Dockerfile add <code>USER appuser</code>; on a VM run the service via systemd with a dedicated <code>User=</code>. This shrinks the blast radius when (not if) you get breached." },
      { q: "Putting secrets in environment variables is better than hardcoding, but why is it still NOT safe enough for prod?",
        a: "Env vars separate the secret from the code (it does not leak into Git) — good for dev. But it can still leak via <code>/proc</code>, core dumps, error logs that print the whole env, or child processes that inherit it. Prod needs a <strong>secret manager</strong> (Vault / a cloud secret store) issuing short-lived secrets with rotation and auditing. This is the bridge to node SEC-17." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Spin up a Linux VM (multipass/Vagrant/a cheap VPS). Install Nginx as a reverse proxy pointing to a small app run under systemd. Then <b>break it on purpose</b> and debug: (a) stop the app &rarr; see the 502, use the diagnostic command set to find it; (b) fill the disk with <code>fallocate</code> &rarr; watch what happens; (c) write a shell health-check script (curl /health, check <code>df</code>) that raises an alert on anomalies.</p>`,
    links: [
      { t: "Linux Journey — learn Linux with a roadmap", u: "linuxjourney.com" },
      { t: "The Missing Semester of Your CS Education (MIT)", u: "missing.csail.mit.edu" },
      { t: "systemd — man systemctl / journalctl", u: "man7.org/linux/man-pages/man1/systemctl.1.html" },
      { t: "Google SRE — operational principles", u: "sre.google/sre-book/table-of-contents" },
    ],
  },
  {
    id: "NET-02", tier: 1, xp: 100, prereq: ["FND-00"],
    title: "Networking for DevOps",
    sum: "DNS &middot; TCP/IP &middot; HTTP/TLS &middot; reverse proxy/LB — understand the path of a request.",
    theory: `<p>You cannot debug a distributed system without understanding where the packets go. You need: <b>DNS</b> (resolving name &rarr; IP, TTL, why 'a DNS change only takes effect 5 minutes later'), <b>TCP/IP & ports</b>, <b>HTTP/HTTPS</b> (methods, status codes, headers, keep-alive), the <b>TLS handshake</b> (why an expired certificate = the whole site is down), and <b>reverse proxy & load balancer</b> (Nginx/ALB: load distribution, TLS termination, health checks).</p>
<p>The networking commands to know by heart:</p>
<pre><code>dig course.edu +short        # which IP does DNS resolve to
curl -v https://course.edu   # inspect the TLS handshake + headers + status
curl -o /dev/null -s -w "%{time_total}\\n" https://course.edu  # measure latency
ss -tlnp                     # which ports are listening
traceroute course.edu        # where the packets go, where they stall</code></pre>
<p><b>Latency numbers that shape your design:</b> a round trip within the same DC ~0.5ms &middot; cross-continent ~150ms &middot; a TLS handshake adds 1&ndash;2 RTTs. This is why placing a CDN/edge near users and reusing connections (keep-alive) matters for an edtech app serving video nationwide.</p>`,
    whenUse: `<p>Needed for cloud (VPC/subnet/security group in CLD-08 is exactly networking), for K8s Ingress, and for debugging 'service A cannot reach service B'. The 'good enough' level: understand status codes, be able to read <code>curl -v</code>, and know how to distinguish a DNS error / connection error / TLS error / application error.</p>`,
    pros: [
      "Diagnose the most common class of errors: connectivity, DNS, TLS, timeouts",
      "The foundation for understanding VPC/security groups/Ingress without fear",
      "Helps you design an optimal request path (CDN, keep-alive, LB)",
    ],
    cons: [
      "Deep networking theory is endless — easy to overdo; stick to commands & real scenarios",
      "Some problems live at the provider layer, beyond your control",
    ],
    questions: [
      { q: "You change a DNS record to point the domain to a new server, but many users still hit the old server for hours. Why, and how do you prevent it?",
        a: "It is the <strong>TTL of the DNS record</strong>: resolvers and browsers cache the old IP until the TTL expires. For a smooth cutover: <strong>lower the TTL (e.g. 60s) a few days beforehand</strong>, make the change, then raise it back. Do not expect DNS to change instantly — this is why important traffic shifts should happen at the load balancer layer, not by editing DNS." },
      { q: "The entire site goes down at midnight and nobody deployed anything. What is the number one network-related suspect?",
        a: "<strong>An expired TLS certificate.</strong> It expires on a schedule, so it tends to fail at a 'nobody was doing anything' moment, and it makes <em>every</em> HTTPS request fail at once. Prevention: auto-renewal (cert-manager/Let's Encrypt) + <strong>an alert 2&ndash;3 weeks before expiry</strong>. Check quickly with <code>curl -v</code> or <code>openssl s_client</code>." },
      { q: "Distinguish 502, 503, and 504 — which layer does each point to?",
        a: "<strong>502 Bad Gateway</strong>: the proxy got a broken response or could not connect to the backend (app dead, wrong port). <strong>503 Service Unavailable</strong>: there is no healthy backend to serve (mid-deploy, out of pods, the LB sees no healthy target). <strong>504 Gateway Timeout</strong>: the backend received the request but answered too slowly (a stuck query, a slow downstream). Reading the code correctly lets you target the right layer instead of restarting blindly." },
      { q: "Why do a CDN + HTTP keep-alive matter so much for an edtech app serving video/images nationwide?",
        a: "A cross-continent round trip is ~150ms and a TLS handshake adds another 1&ndash;2 RTTs. A <strong>CDN</strong> pushes static content (video, images, lessons) to an edge near the user &rarr; cutting latency and offloading the origin. <strong>Keep-alive/HTTP2</strong> reuses an already-handshaked TLS connection &rarr; avoiding the handshake cost per request. For heavy static content, this is the biggest and cheapest optimization." },
      { q: "Service A inside a VPC cannot reach service B. In what order do you check to isolate the problem?",
        a: "Go layer by layer: (1) <strong>DNS</strong> — does <code>dig</code> on B's name return the right IP? (2) <strong>L3/L4 connectivity</strong> — can <code>nc -vz B 443</code> / <code>curl -v</code> complete a TCP handshake (if it hangs &rarr; usually a security group/firewall blocking the port). (3) <strong>TLS</strong> — is the certificate valid? (4) <strong>Application</strong> — status code/response. Isolate 'which layer is stalled' before fixing; most internal cloud failures are a <strong>security group blocking a port</strong>." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">With any domain (or your own app): (1) use <code>dig</code> to see the resolution chain + TTL; (2) <code>curl -v</code> to read each step of the TLS handshake and all the headers; (3) measure <code>time_total</code> from two different network locations to see the effect of distance; (4) stand up Nginx as a reverse proxy + TLS (Let's Encrypt) for an app, then deliberately set the wrong backend port to create a 502 and read the logs. Write down what each status code you encounter means.</p>`,
    links: [
      { t: "Cloudflare Learning — DNS, TLS, HTTP", u: "cloudflare.com/learning" },
      { t: "MDN — HTTP status codes", u: "developer.mozilla.org/en-US/docs/Web/HTTP/Status" },
      { t: "High Performance Browser Networking (Ilya Grigorik)", u: "hpbn.co" },
      { t: "Let's Encrypt — free TLS certificates", u: "letsencrypt.org/docs" },
    ],
  },
  {
    id: "GIT-03", tier: 1, xp: 100, prereq: ["FND-00"],
    title: "Git Workflow & Release",
    sum: "Git from an operations angle: trunk-based, semver, release tags, rollback via artifact.",
    theory: `<p>You already know Git for <i>coding</i>. This node is Git for <i>delivery</i> — an important distinction. The focus: <b>branching strategy</b> (trunk-based development vs GitFlow), <b>semantic versioning</b> (MAJOR.MINOR.PATCH), <b>tags</b> tied to artifacts/releases, and doing <b>rollback</b> the right way.</p>
<p><b>Trunk-based</b> (short branches, merging into main many times a day, hiding unfinished features behind feature flags) is the foundation of modern CI/CD because it produces <b>small batches</b> — exactly the DORA spirit. <b>GitFlow</b> (many long-lived branches: develop/release/hotfix) produces large batches and painful merges, the opposite of frequent deploys — it only suits products released by version (desktop apps), not continuous web services.</p>
<pre><code>git tag -a v1.4.2 -m "release 1.4.2" && git push --tags
# CI builds an image labeled by the tag: registry/app:v1.4.2 (+ digest)
# Rollback = redeploy the old image ALREADY built, do NOT rebuild from source</code></pre>
<p><b>The golden rule:</b> every release is an <b>immutable artifact</b> tied to a specific commit/tag. Rollback means pointing back to the old artifact, not 'editing the code back to how it was'.</p>`,
    whenUse: `<p>Branching strategy + versioning are prerequisites for CI (CI-06) and CD (CD-07). Choose trunk-based for a continuously deployed web service; only use long-lived branches when you genuinely release packaged versions.</p>`,
    pros: [
      "Trunk-based &rarr; small batches &rarr; a fit for CI/CD and the DORA metrics",
      "Tags + semver give a clear, traceable release history",
      "Rollback via an immutable artifact: fast and already proven",
    ],
    cons: [
      "Trunk-based demands high discipline: good tests + feature flags, or main breaks easily",
      "GitFlow is intuitive but produces large, slow merges, against the spirit of continuous deployment",
    ],
    questions: [
      { q: "You deploy v2.0 and then find a serious bug at peak. How do you roll back immediately, and why do you NOT reach for git revert first?",
        a: "Prefer <strong>redeploying the already-built v1.x artifact/tag</strong> — fast (seconds/minutes) and already proven to work when it ran before. <code>git revert</code> creates a new commit that must be <strong>rebuilt + retested + redeployed from scratch</strong> &rarr; slow, and it may pull in new bugs or conflicts. Git revert is for cleaning up code history <em>after</em> you have put out the fire by pointing back to the old artifact. Rollback is an operations action, not a code-fixing action." },
      { q: "Why does trunk-based development fit CI/CD better than GitFlow? Relate it to DORA.",
        a: "Trunk-based creates <strong>short branches with continuous merges</strong> &rarr; each change is small, integrated early, with few conflicts &rarr; which is exactly the <strong>small batches</strong> that give a short Lead Time and a low CFR (DORA). GitFlow has long-lived branches (develop/release) that produce <strong>large, painful, rare merges</strong> — the opposite of 'deploy often'. Unfinished features are hidden behind a <strong>feature flag</strong> instead of being held in a long branch." },
      { q: "You need to urgently release a security fix while main already has half-finished work you do not want to release yet. How do you handle it?",
        a: "If the half-finished work is already in main but <strong>hidden behind a feature flag</strong> (the trunk-based way), just build & deploy from main as usual — the flag is off so users do not see it. If there is no flag, create a <strong>hotfix from the release tag currently running in prod</strong> (not from main's HEAD), patch it, tag <code>vX.Y.(Z+1)</code>, deploy, then merge back into main. The lesson: feature flags let you separate 'deployed' from 'released'." },
      { q: "Under semver, adding a new API endpoint (without breaking the old ones) bumps which number? And changing an existing response format?",
        a: "Adding a <strong>backward-compatible</strong> feature (a new endpoint, the old ones still work) &rarr; bump <strong>MINOR</strong> (1.4.0 &rarr; 1.5.0). Changing an existing response format so current clients break &rarr; a <strong>breaking change &rarr; bump MAJOR</strong> (1.5.0 &rarr; 2.0.0). PATCH is only for bug fixes that do not change public behavior. Semver is a 'contract' with your API consumers — for an edtech app with a mobile app calling the API, bumping MAJOR carelessly breaks learners' old apps." },
      { q: "Why is tagging a Docker image with 'latest' to deploy prod an anti-pattern?",
        a: "<code>latest</code> is a <strong>moving</strong> label: it points to different images over time, so you do not know exactly which build prod is running &rarr; not reproducible, no reliable rollback, and two nodes may pull two different builds. Instead, use an <strong>immutable tag by version/commit + digest</strong> (<code>app:v1.4.2@sha256:...</code>). An immutable artifact is the precondition for rollback and auditing to work." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">On a sample repo: (1) set up a trunk-based flow — short branch, open a PR, merge into main; (2) apply <code>git tag -a v1.0.0</code> and write a semver convention for the project; (3) simulate a release: a script that builds an 'artifact' labeled by the tag and stores it; (4) practice rollback: 'deploy' the v1.0.0 artifact after a buggy 'deploy' of v1.1.0 — measure how much faster it is than revert + rebuild. Write a short branching + release convention for the team.</p>`,
    links: [
      { t: "trunkbaseddevelopment.com", u: "trunkbaseddevelopment.com" },
      { t: "Semantic Versioning 2.0.0", u: "semver.org" },
      { t: "Martin Fowler — Patterns for Managing Source Code Branches", u: "martinfowler.com/articles/branching-patterns.html" },
      { t: "Atlassian — comparing Git workflows", u: "atlassian.com/git/tutorials/comparing-workflows" },
    ],
  },
];
