import type { SkillNode } from "../skill-types";

export const EN_TIER5: SkillNode[] = [
  {
    id: "K8S-11", tier: 5, xp: 100, prereq: ["CMP-05", "CLD-08"],
    title: "Kubernetes — Core Objects",
    sum: "Container orchestration: Pod/Deployment/Service/Ingress, self-heal, probes.",
    theory: `<p>Kubernetes (K8s) is a <b>reconciliation control loop</b>: you declare the <i>desired state</i> in YAML, and K8s continuously compares it against the <i>actual state</i> and drives the system back to what you asked for. This is the single most important mental shift — you stop issuing the command 'run this container' and instead declare 'there must always be 6 healthy replicas'.</p>
<p><b>The core objects you must master:</b></p>
<ul>
<li><b>Pod</b> — the smallest schedulable unit, wrapping 1 (or a few) containers that share network/volume. A Pod is <i>ephemeral</i>: once it dies it is gone and does not resurrect itself on its own.</li>
<li><b>ReplicaSet</b> — keeps the correct number of replica Pods. You rarely create it directly.</li>
<li><b>Deployment</b> — manages a ReplicaSet, enabling <b>rolling update</b> and rollback. This is what you declare for stateless apps (catalog API, enrollment).</li>
<li><b>Service</b> — a stable address (ClusterIP) in front of a set of Pods whose IPs keep changing; internal load balancing. Because Pod IPs change, services call each other via a Service, not via a Pod IP.</li>
<li><b>Ingress</b> — routes HTTP/HTTPS from outside into Services by host/path, consolidating TLS termination. For example <code>api.course.edu</code> goes to the enrollment Service and <code>video.course.edu</code> goes to the encoding Service.</li>
<li><b>ConfigMap / Secret</b> — separate configuration and secrets from the image (true to the 12-Factor spirit). Note that a Secret is only base64 by default, NOT encrypted.</li>
<li><b>namespace</b> — a logical boundary to separate environments/teams (staging vs prod, or team catalog vs team analytics), and to attach quotas.</li>
</ul>
<p><b>Self-healing:</b> a Pod dies → the ReplicaSet recreates it; a node dies → the Pods are rescheduled onto another node. A <b>rolling update</b> replaces Pods gradually per <code>maxSurge</code> (how many extra Pods may be created) and <code>maxUnavailable</code> (how many Pods may be missing) — this is precisely the zero-downtime deploy mechanism.</p>
<p><b>Probes — the easiest thing to get wrong and the most common cause of incidents:</b></p>
<ul>
<li><b>liveness probe</b> answers: 'is the container still alive?' On failure → K8s <b>kills and restarts</b> the container.</li>
<li><b>readiness probe</b> answers: 'is it ready to accept requests yet?' On failure → K8s <b>removes the Pod from the Service</b> (stops sending traffic) but does NOT restart it.</li>
</ul>
<p><b>What happens when you misconfigure probes:</b> if you point liveness at an endpoint that depends on the DB, then when the DB is slow, liveness fails → K8s restarts your healthy Pods en masse → a <b>restart loop (CrashLoopBackOff)</b> takes down the whole service even though the app is not broken at all. Conversely, if you OMIT readiness, K8s sends traffic to a Pod that has not finished warming its cache or opened its DB connections → <b>users get 5xx</b> right after every deploy. The rule: liveness checks 'is the process hung?' very simply; readiness checks 'are the dependencies ready?'.</p>
<p><b>resource requests/limits:</b> <code>requests</code> is what the scheduler uses to place the Pod (a guaranteed minimum); <code>limits</code> is the ceiling. Leaving them blank is a time bomb: a video-encoding Pod devours all of a node's CPU/RAM → a <b>noisy neighbor</b> chokes the other Pods, or it exceeds node RAM and triggers an <b>OOMKill</b> that spreads to innocent Pods on the same node.</p>
<pre><code>apiVersion: apps/v1
kind: Deployment
metadata:
  name: enrollment-api
  namespace: prod
spec:
  replicas: 6
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 0        # 0 =&gt; always keep full capacity during a deploy
  selector:
    matchLabels: { app: enrollment-api }
  template:
    metadata:
      labels: { app: enrollment-api }
    spec:
      containers:
        - name: api
          image: registry.course.edu/enrollment:v2.3.1
          ports: [ { containerPort: 8080 } ]
          readinessProbe:               # ready to accept traffic yet?
            httpGet: { path: /ready, port: 8080 }
            initialDelaySeconds: 5
            periodSeconds: 5
          livenessProbe:                # is the process still alive?
            httpGet: { path: /healthz, port: 8080 }
            initialDelaySeconds: 20
            periodSeconds: 15
            failureThreshold: 3
          resources:
            requests: { cpu: "250m", memory: "256Mi" }
            limits:   { cpu: "1",    memory: "512Mi" }</code></pre>`,
    whenUse: `<p>Use K8s when you genuinely have <b>many services, many replicas, frequent deploys</b> and need automatic self-healing/rolling updates at large scale — for example an edtech platform during back-to-school with dozens of services (catalog, enrollment, encoding, grading, analytics) and millions of users.</p>
<p><b>WHEN NOT to use K8s — just as important:</b> a small team, one app, ~500 users. K8s adds an enormous surface of complexity (control plane, CNI networking, RBAC, storage classes, cluster upgrades, YAML) that you have to operate yourself at 3am. At that scale, choose a <b>managed container</b> platform (Cloud Run / ECS Fargate / App Runner) or <b>Docker Compose on 1-2 VMs</b>. You still get containers and rolling deploys without feeding an entire cluster. The root question: 'what measurable pain forces me to buy this complexity?' — if you cannot answer that, you do not need K8s yet.</p>`,
    pros: [
      "Automatic self-healing and rolling updates: dead Pods/nodes recover on their own, deploys are zero-downtime",
      "Declares the desired state (declarative): reproducible infrastructure, a good fit for GitOps",
      "Standardizes how many services run at large scale, with a huge tooling ecosystem",
      "Abstracts away nodes: scale horizontally by adding replicas or adding nodes",
    ],
    cons: [
      "Very high operational complexity: control plane, networking, RBAC, cluster upgrades",
      "Over-engineering for a small team or low scale: the learning and operating cost exceeds the benefit",
      "Many deadly misconfiguration points (probes, resources) cause hard-to-predict incidents",
    ],
    questions: [
      { q: "After every deploy, users report 5xx errors for about 10-20 seconds and then it clears. The Deployment has no readiness probe. What is happening and how do you fix it?",
        a: "There is no <strong>readiness probe</strong>, so the moment the container starts, K8s considers the Pod ready and adds it to the Service — but the app has not finished warming its cache or opened its DB connection pool, so the first requests return 5xx. During a rolling update, new Pods keep getting added to the Service too early, so users see errors in waves. Fix it by adding a <strong>readinessProbe pointing at an endpoint that checks the dependencies are ready</strong> (DB, cache) — K8s only sends traffic after the probe passes, and in a rolling update old Pods are only removed once new Pods are ready. Also set <code>maxUnavailable: 0</code> so capacity never drops mid-deploy." },
      { q: "Every Pod of the enrollment service falls into CrashLoopBackOff even though the code has not changed. The app logs look normal, only the DB is slow. Prime suspect?",
        a: "Almost certainly a <strong>misconfigured liveness probe</strong>: it points at an endpoint that queries the DB. When the DB is slow, the probe times out and fails repeatedly past <code>failureThreshold</code> → K8s thinks the container is hung and <strong>kills then restarts</strong> it — but restarting cannot fix a slow DB, so it loops endlessly into CrashLoopBackOff, turning a minor DB hiccup into a full-service outage. The rule: <strong>liveness must check something lightweight and local</strong> (does the process still respond to HTTP), and must never depend on a downstream. 'The downstream is not ready' is readiness's job (remove from traffic, do not restart)." },
      { q: "A team ships a Deployment with no resources declared at all, 'to keep it simple'. A few days later the video-encoding job takes down the grading Pods on the same node. Why?",
        a: "With no <code>requests</code>, the scheduler does not know how much the Pod needs and places it carelessly; with no <code>limits</code>, the encoding Pod — which is CPU/RAM hungry — is allowed to swallow all of the node's resources (<strong>noisy neighbor</strong>). When total RAM exceeds the node's capacity, the kernel triggers the <strong>OOMKiller, which kills even innocent Pods</strong> like grading on the same node. Fix it by setting <code>requests</code> correctly so the scheduler places things sensibly, and <code>limits</code> to cap the ceiling; consider isolating heavy workloads onto their own node pool or using a ResourceQuota per namespace. Leaving resources blank is one of the most common 'shoot yourself in the foot' mistakes on K8s." },
      { q: "An edtech startup with just 500 users, one monolith app, a team of 2. The boss reads a blog post and wants to 'move to Kubernetes to do it properly'. How do you push back?",
        a: "K8s solves the problem of <strong>many services, many replicas, large scale</strong> — that is not your problem right now. In exchange you take on a control plane, networking, RBAC, and cluster upgrades: a complex surface that a team of 2 will be on call for at 3am, exactly when you should be focused on the product. For 500 users, a <strong>managed container platform (Cloud Run / ECS Fargate) or Docker Compose on 1-2 VMs is enough</strong> — you still get containers, rolling deploys, and can scale several times over, with almost no cluster operating cost. The anti-over-engineering principle: only buy complexity when there is <strong>measurable pain</strong>; let the architecture evolve and migrate to K8s once you truly hit the ceiling of the simpler solution." },
      { q: "In K8s, why must service A call service B via a Service (ClusterIP) rather than via the Pod's IP? And how do maxSurge/maxUnavailable affect this during a deploy?",
        a: "A Pod is <strong>ephemeral</strong>: it is killed/recreated constantly (self-heal, rolling update, node moves) and gets a new IP each time, so hardcoding a Pod IP breaks the first time that Pod dies. A <strong>Service</strong> gives a stable ClusterIP/DNS name and load-balances across the healthy Pods (specifically those currently <em>ready</em>). During a deploy, <code>maxSurge</code>/<code>maxUnavailable</code> decide how many healthy endpoints the Service keeps while Pods are being replaced: set <code>maxUnavailable: 0</code> + a positive <code>maxSurge</code> to always create ready new Pods before removing old ones → service B always has enough backends and A never sees 'no endpoints'. This is why the readiness probe + Service + rolling strategy are three pieces that fit together to produce a zero-downtime deploy." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Spin up a local cluster (kind or minikube). (1) Write a Deployment for a small app with a <code>/healthz</code> and a <code>/ready</code> endpoint, set <code>replicas: 3</code>, with readiness + liveness probes and resource requests/limits. (2) Create a Service (ClusterIP) and an Ingress pointing to it. (3) Cause deliberate failures: delete one Pod with <code>kubectl delete pod</code> and watch the ReplicaSet recreate it; intentionally make <code>/ready</code> return 503 and observe the Pod being removed from the Service's endpoints (traffic stops) but NOT restarted; then make <code>/healthz</code> fail and watch the Pod fall into CrashLoopBackOff. (4) Do a rolling update (change the image tag) with <code>maxUnavailable: 0</code>, using <code>kubectl rollout status</code> and a <code>curl</code> loop to prove there is no downtime. Finally, write a short note: at your app's current scale, do you actually need K8s, or is Compose / a managed container enough?</p>`,
    links: [
      { t: "Kubernetes — Concepts (Workloads, Services, Networking)", u: "kubernetes.io/docs/concepts" },
      { t: "Kubernetes — Configure Liveness, Readiness and Startup Probes", u: "kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes" },
      { t: "Kubernetes — Managing Resources for Containers (requests/limits)", u: "kubernetes.io/docs/concepts/configuration/manage-resources-containers" },
      { t: "Google Cloud Run — run containers without a cluster", u: "cloud.google.com/run/docs" },
      { t: "Kelsey Hightower — Kubernetes The Hard Way (understand the internals)", u: "github.com/kelseyhightower/kubernetes-the-hard-way" },
    ],
  },
  {
    id: "HLM-12", tier: 5, xp: 100, prereq: ["K8S-11"],
    title: "Helm & Per-Environment Config",
    sum: "Package & template manifests per environment; values, releases, rollback.",
    theory: `<p>When an app really lands on K8s, you no longer have a single YAML file but dozens (Deployment, Service, Ingress, ConfigMap, HPA...) multiplied by 3 environments (dev/staging/prod). If you <code>kubectl apply -f</code> each file by hand for each environment, you end up copy-pasting and suffering <b>drift</b>: prod differs from staging in places nobody remembers, and there is no clear 'unit of release' to roll back to.</p>
<p><b>Helm</b> is the package manager for K8s. It solves three things:</p>
<ul>
<li><b>Templating</b> manifests: write the YAML once with blanks, fill them from variables — no more copy-paste.</li>
<li><b>Per-environment values (DRY):</b> one shared <b>chart</b>, and per environment a <code>values-&lt;env&gt;.yaml</code> file that holds only the DIFFERENCES (replicas, resources, host, image tag).</li>
<li><b>Releases + rollback:</b> each install is a <b>release</b> with a revision number. Helm stores the history so <code>helm rollback</code> returns the whole manifest set to the exact previous revision — one action, not editing each file by hand.</li>
</ul>
<p>A template snippet and per-environment values:</p>
<pre><code># templates/deployment.yaml (once for every environment)
spec:
  replicas: REPLICAS_FROM_VALUES
  template:
    spec:
      containers:
        - name: api
          image: IMAGE_REPO:IMAGE_TAG
          resources:
            requests:
              cpu: CPU_REQUEST_FROM_VALUES

# values-staging.yaml   (only the differences)
replicas: 2
image: { tag: v2.3.1-rc }
resources: { requests: { cpu: "100m" } }

# values-prod.yaml
replicas: 6
image: { tag: v2.3.1 }
resources: { requests: { cpu: "250m" } }</code></pre>
<pre><code>helm upgrade --install enrollment ./chart -n prod -f values-prod.yaml
helm history enrollment -n prod        # view the revisions
helm rollback enrollment 4 -n prod     # back to exactly revision 4, one command</code></pre>
<p><b>Risk: over-templating.</b> Helm uses text templates; cramming too many <code>if/range</code>/functions into YAML produces a 'programming language inside YAML' that is hard to read, hard to debug (indent errors only surface at render time), and newcomers dare not touch. The rule: <b>parameterize only what truly differs between environments</b>; do not turn every value into a variable 'just to be safe'.</p>
<p><b>Helm vs Kustomize — the trade-off:</b> <b>Kustomize</b> (built into <code>kubectl -k</code>) takes the <i>overlay</i> approach: keep real YAML, patch the differences per environment, no template language — easy to read, hard to abuse, but no packaging/distribution/versioning as a 'package' and no built-in release/rollback concept. <b>Helm</b> is strong at packaging, distribution (chart repos), flexible templating, and release/rollback — at the cost of template complexity. Pragmatically: use <b>Kustomize</b> when you only need to patch per-environment config for your own app; use <b>Helm</b> when you need to distribute a chart for others to install (e.g. installing Prometheus, ingress-nginx) or need release/rollback with history.</p>`,
    whenUse: `<p>Use Helm when you already have many manifests and many environments, need a versioned unit of release with rollback, or when <b>reinstalling third-party software</b> (Prometheus, cert-manager, ingress-nginx) — nearly all of which are distributed as Helm charts. For a simple app with a single environment, <code>kubectl apply</code> or Kustomize is enough; do not add Helm just because 'everyone uses it'. For a team not yet on K8s (still on Compose / a managed container from K8S-11), you do NOT need Helm yet.</p>`,
    pros: [
      "DRY: one shared chart, and each environment declares only its differences in values",
      "Versioned releases + helm rollback: return the whole manifest set to an old revision in one command",
      "Huge chart ecosystem: install third-party software (Prometheus, ingress) very quickly",
    ],
    cons: [
      "Text templates are easily abused into 'code in YAML', hard to read and hard to debug",
      "Adds an abstraction layer: you must render to see what the real manifest is (helm template)",
      "When you only need per-environment patching, Kustomize is usually simpler and safer",
    ],
    questions: [
      { q: "A team is copying the entire YAML directory for each environment (dev/staging/prod) and then hand-editing a few lines. What problem will arise, and how does Helm fix it?",
        a: "This is a recipe for <strong>configuration drift</strong>: the three YAML copies gradually diverge in places nobody records (someone changes replicas on prod but forgets staging), so 'it works in staging' no longer guarantees anything for prod, and there is no clear unit of release to roll back to. Helm fixes it with <strong>one shared chart + a separate values file per environment holding only the differences</strong> (DRY): the manifest logic lives in exactly one place, and environment differences are declared explicitly and reviewable. On top of that, each install is a release with a revision, so rollback is one command." },
      { q: "Why is 'helm rollback' safer and faster than hand-editing YAML back to the old state and running kubectl apply again?",
        a: "Helm stores <strong>the full rendered manifest of every revision</strong>, so <code>helm rollback enrollment 4</code> restores exactly the state that once ran — including changes you do not remember. Hand-editing YAML back to 'how it was' relies on human memory: it is easy to miss a ConfigMap or an HPA change, and you have to rebuild the state in your head right while things are on fire. The principle, as in GIT-03: <strong>a rollback is pointing back at an immutable, verified state</strong>, not recreating it by hand. One command, deterministic, and with <code>helm history</code> to audit who changed what." },
      { q: "A team's Helm chart is full of nested if/else and range, with every value turned into a variable 'for flexibility'. What is this a sign of and what do you advise?",
        a: "This is <strong>over-templating</strong>: the chart has become a programming language written in YAML, hard to read, with indent errors that only surface at render time (<code>helm template</code>), and newcomers dare not touch it. 'Flexible for every case' is a cost, not a value — YAML should not carry logic. Recommendation: <strong>parameterize only what genuinely differs between environments</strong> (replicas, tag, host, resources), and keep the rest static and readable; if all you need is per-environment patching, consider moving to a <strong>Kustomize overlay</strong>, which has no template language and is therefore harder to abuse." },
      { q: "When would you choose Kustomize over Helm, and vice versa? Give an example in the edtech context.",
        a: "Choose <strong>Kustomize</strong> when you only need to <strong>patch per-environment config for your own app</strong> — for example a base for the grading service, then a prod overlay that bumps replicas and changes the host: the YAML keeps its real shape, with no template language, so it is easy to read and hard to abuse. Choose <strong>Helm</strong> when you need to <strong>package/distribute a versioned package</strong> (a chart repo for many teams to reinstall) or need built-in release/rollback with history, and especially when installing <strong>third-party software</strong> like Prometheus or ingress-nginx that ships as a Helm chart. In practice many edtech teams use both: Helm to install third-party infrastructure, and Kustomize (or a lean Helm) for their own app. Decide by your <strong>distribution/versioning</strong> needs, not by the trend." },
      { q: "A team is not on Kubernetes yet, still running Docker Compose on a VM for ~2000 users. Should they adopt Helm to 'manage config per environment'?",
        a: "No — Helm is a tool <strong>on top of Kubernetes</strong>; adopting Helm with no cluster is bolting an abstraction onto a problem that does not exist. At the Compose level, per-environment config is already handled well enough with <strong>a separate .env file per environment + Compose overrides</strong> (<code>docker compose -f base.yml -f prod.yml</code>), true to the 12-Factor spirit. Only when you genuinely need to move to K8s because of scale/number of services (the measurable pain from K8S-11) does Helm/Kustomize become a reasonable question. This is again the anti-over-engineering principle: do not buy the tool of the layer above when you are not at that layer yet." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">On a local cluster (kind/minikube): (1) <code>helm create mychart</code> then trim the sample chart down to just a Deployment + Service + Ingress for a small app. (2) Create two values files: <code>values-staging.yaml</code> (replicas 2, rc tag, small resources) and <code>values-prod.yaml</code> (replicas 6, release tag, large resources), declaring only the differences. (3) Install both into two namespaces with <code>helm upgrade --install ... -f values-...</code> and use <code>helm template</code> to see the rendered manifests differ exactly as expected. (4) Upgrade one revision, then <code>helm history</code> + <code>helm rollback</code> back to the previous revision, and measure how quick and clean it is. (5) Compare: redo the environment split with a simple <b>Kustomize overlay</b> and judge for yourself which is easier to read for your needs.</p>`,
    links: [
      { t: "Helm — Charts, Values, Releases", u: "helm.sh/docs/topics/charts" },
      { t: "Helm — helm rollback & release history", u: "helm.sh/docs/helm/helm_rollback" },
      { t: "Kustomize — config management via overlays", u: "kubectl.docs.kubernetes.io/references/kustomize" },
      { t: "Kubernetes — Declarative Management with Kustomize", u: "kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization" },
      { t: "Helm vs Kustomize — CNCF/community comparison", u: "helm.sh/docs/topics/kustomize" },
    ],
  },
  {
    id: "SCL-13", tier: 5, xp: 100, prereq: ["K8S-11"],
    title: "Autoscaling & Service Mesh",
    sum: "HPA/VPA/Cluster Autoscaler + when you actually need a service mesh.",
    theory: `<p>Autoscaling in K8s has <b>three distinct layers</b> that are often confused:</p>
<ul>
<li><b>HPA (Horizontal Pod Autoscaler)</b> — adds/removes the <i>number of Pods</i> of a Deployment based on load. A fit for stateless apps. This is the one you will use most.</li>
<li><b>VPA (Vertical Pod Autoscaler)</b> — adjusts a Pod's <i>requests/limits</i> (bigger/smaller). Useful for dialing in the right resources, but it usually has to restart the Pod, so it is rarely combined with HPA on the same metric.</li>
<li><b>Cluster Autoscaler</b> — adds/removes <i>nodes</i> when Pods have nowhere to be scheduled (Pending) or when nodes are spare. This is the <b>infrastructure</b> layer, quite different from HPA (the Pod layer).</li>
</ul>
<p><b>HPA by CPU vs by custom metric:</b> by default HPA scales on CPU/RAM. But for <b>video encoding</b>, CPU may not reflect real demand — what measures true demand is <b>queue lag</b>: the number of encoding jobs waiting. If you scale on CPU alone, the queue can grow long while each worker's CPU is 'not that high yet', leaving teachers' videos delayed for hours. The solution: scale on a <b>custom/external metric</b> (e.g. the number of messages in the queue per Pod).</p>
<pre><code>apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: video-encoder
  namespace: prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: video-encoder
  minReplicas: 4
  maxReplicas: 60
  metrics:
    - type: External                # scale on queue backlog
      external:
        metric: { name: queue_messages_per_pod }
        target: { type: AverageValue, averageValue: "30" }
  behavior:
    scaleUp:
      policies: [ { type: Percent, value: 100, periodSeconds: 30 } ]  # scale up fast
    scaleDown:
      stabilizationWindowSeconds: 300   # scale down slowly, avoid flapping</code></pre>
<p><b>Autoscale latency — the back-to-school trap:</b> autoscale is NOT instantaneous. The reaction chain: the metric must exceed the threshold for several cycles → HPA decides → the new Pod pulls its image, starts up, waits for readiness → and if nodes are exhausted, it must also wait for the <b>Cluster Autoscaler to create a new node</b> (usually a few minutes). For a steep spike at 8am on the first day of term, this total latency is enough for users to receive 5xx/timeouts before capacity arrives. The fix: <b>pre-scale/overprovision on a schedule</b> (if you know the peak, raise minReplicas before the moment), keep <b>pause pods</b> so the Cluster Autoscaler has spare nodes on standby, and prioritize fast scale-up + slow scale-down to avoid flapping.</p>
<p><b>What a service mesh (Istio/Linkerd) solves:</b> it injects a sidecar proxy next to every Pod to handle <i>service-to-service communication</i> without changing code: <b>mTLS</b> (internal encryption + authentication), <b>retry/timeout/circuit-breaking</b>, <b>traffic split</b> (canary: 5% to v2), and <b>observability</b> (golden metrics, automatic distributed tracing). In exchange comes a <b>non-trivial price</b>: an extra proxy on every request (latency + resources), a control plane you must operate and upgrade, higher debugging complexity, and a new body of knowledge for the whole team.</p>
<p><b>WHEN you do NOT need a service mesh yet:</b> few services, simple calls between them, no hard requirement for mandatory mTLS or sophisticated canaries. Most early needs (retry, timeout, TLS) can be met with an <b>in-app library</b> or ingress + cert-manager, far cheaper and with less friction. Wait until you have enough services that stuffing retry/mTLS/observability into every codebase becomes real pain — only then is a mesh worth it. Do not install Istio for 3 services.</p>`,
    whenUse: `<p><b>Autoscaling:</b> turn on HPA when load fluctuates and the app scales horizontally (catalog/enrollment API at peak; the encoder by queue). Turn on Cluster Autoscaler when you want node count to scale with Pods. For a <b>predictable</b> peak (start of term, assignment deadlines), prefer <b>scheduled pre-scaling</b> over leaving it to reactive autoscale. <b>Service mesh:</b> only when you already have many services and need mandatory mTLS / traffic split / uniform observability that in-app solutions can no longer handle. A small team with few services does NOT need a mesh yet.</p>`,
    pros: [
      "HPA scales Pod count to real load (CPU or a custom metric like queue lag), saving cost and absorbing peaks",
      "Cluster Autoscaler adds/removes nodes on its own, cleanly separating the Pod layer from the infrastructure layer",
      "A service mesh provides mTLS, retry, canary and observability uniformly without changing each service's code",
    ],
    cons: [
      "Autoscale has latency: a steep peak can cause 5xx before capacity arrives, so you need pre-scaling",
      "Scaling on the wrong metric (CPU only) lets the queue balloon while still not scaling",
      "A service mesh adds sidecars, a control plane and a lot of complexity: over-engineering with few services",
    ],
    questions: [
      { q: "The video encoder scales with HPA on CPU, but teachers complain that videos uploaded in the morning are not processed until the afternoon even though the cluster 'sees no high CPU'. Why, and how do you fix it?",
        a: "CPU is the <strong>wrong metric for a queue-based workload</strong>: each encoder worker may run at moderate CPU while the <em>job queue grows long</em> — the real demand is in the backlog, not in instantaneous CPU, so HPA sees no reason to scale. Fix it by having HPA scale on a <strong>custom/external metric of the number of jobs waiting per Pod</strong> (queue lag): when the backlog exceeds the threshold, HPA adds workers even when CPU is not high. The general lesson: <strong>autoscale must track a metric that reflects the workload's true demand</strong>, and for a queue-based system that is queue length/lag, not CPU." },
      { q: "At 8am on the first day of term, hundreds of thousands of students log in within a few minutes. Even with HPA and Cluster Autoscaler enabled, users still hit 5xx at the start. Why, and what do you do next time?",
        a: "Because <strong>autoscale is reactive, not instantaneous</strong>: the metric must exceed the threshold for several cycles before HPA decides, a new Pod still has to pull its image + start up + wait for readiness, and if there is no room it must wait for the Cluster Autoscaler to <strong>create a new node, which takes a few minutes</strong> — this total latency is longer than the steep spike, so capacity arrives after users have already gotten errors. Because this is a <strong>predictable</strong> peak, the right approach is <strong>scheduled pre-scale/overprovision</strong>: raise <code>minReplicas</code> and keep spare nodes (pause pods) before the moment, so autoscale only handles the remainder. Prioritize fast scale-up, slow scale-down to avoid flapping. The principle: for a known peak, do not leave it to real-time reaction." },
      { q: "Distinguish HPA and Cluster Autoscaler — what layer is each at and how do they interact? What happens if you enable only HPA without Cluster Autoscaler?",
        a: "<strong>HPA is at the Pod layer</strong>: it increases a Deployment's Pod replica count based on load. <strong>Cluster Autoscaler is at the infrastructure layer</strong>: it increases node count when Pods cannot be scheduled (Pending). They coordinate in a chain: load rises → HPA creates more Pods → if existing nodes lack resources, the new Pods sit Pending → the Cluster Autoscaler sees Pending and provisions new nodes → the Pods get scheduled. If you <strong>enable only HPA without Cluster Autoscaler</strong>, then once nodes are out of resources HPA still 'wants' more Pods but they are stuck Pending indefinitely — you think you have autoscale but you have really hit the hard ceiling of the node pool. The two layers must go together for scaling to flow smoothly." },
      { q: "What does a service mesh solve, and what is the price you pay?",
        a: "A mesh injects a <strong>sidecar proxy</strong> next to every Pod to handle service-to-service communication without touching code: <strong>mTLS</strong> (zero-trust internal encryption + authentication), uniform <strong>retry/timeout/circuit-breaking</strong>, <strong>traffic split</strong> for canaries (e.g. 5% of traffic to v2), and automatic <strong>observability</strong> (golden signals, distributed tracing). The price is non-trivial: every request goes through an extra proxy (added latency and resources), a <strong>new control plane you must operate and upgrade</strong>, harder debugging because of the extra layer, and a new model the whole team must learn. This is the classic trade-off of <strong>system-wide uniform features in exchange for operational complexity</strong> — only worth it when the scale is large enough that the benefit outweighs that price." },
      { q: "Your edtech has 4 services calling each other, running internally in a VPC, with no mandatory compliance requirement for internal encryption. The team proposes installing Istio 'to be modern'. How do you decide?",
        a: "Not needed yet. With 4 services, the early needs — <strong>retry/timeout</strong> via a client library in the app, <strong>edge TLS</strong> via ingress + cert-manager, <strong>basic observability</strong> via application-layer metrics/logs/traces — are all solved far more cheaply than taking on an Istio control plane and a sidecar on every request. Installing a mesh now is <strong>over-engineering</strong>: more latency, more things to be on call for, more surface to learn, in exchange for benefits you are not yet using. The right decision is to <strong>wait until you have enough services that stuffing mTLS/retry/observability into every codebase becomes measurable pain</strong> — only then does a mesh pay for itself. If a mandatory zero-trust mTLS requirement or a sophisticated canary across dozens of services shows up later, reassess; for now, keep everything simple." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">On a local cluster with metrics-server: (1) Enable an HPA on CPU for a small app (<code>minReplicas: 2</code>, <code>maxReplicas: 10</code>), use a load-generation tool (hey/k6) and watch <code>kubectl get hpa -w</code> as Pods increase. (2) Measure the <b>scale latency</b>: time it from the moment you start pushing load to when a new Pod is actually Ready and receiving traffic — feel why a steep peak needs pre-scaling. (3) Simulate a queue-based workload: build an app that reads jobs from a queue, expose a 'jobs waiting' metric, and configure HPA to scale on that external metric instead of CPU; compare the behavior to scaling on CPU. (4) Write a decision note: for your current edtech architecture, do you or do you NOT need a service mesh yet, and which three mesh features are you already doing more cheaply, and how?</p>`,
    links: [
      { t: "Kubernetes — Horizontal Pod Autoscaler", u: "kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale" },
      { t: "Kubernetes — Cluster Autoscaler (autoscaler repo)", u: "github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler" },
      { t: "KEDA — event/queue-driven autoscaling for K8s", u: "keda.sh/docs" },
      { t: "Istio — service mesh concepts (mTLS, traffic, telemetry)", u: "istio.io/latest/docs/concepts" },
      { t: "Linkerd — a lightweight service mesh and when you need a mesh", u: "linkerd.io/2/overview" },
    ],
  },
];
