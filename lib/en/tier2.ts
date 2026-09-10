import type { SkillNode } from "../skill-types";

export const EN_TIER2: SkillNode[] = [
  {
    id: "DKR-04", tier: 2, xp: 100, prereq: ["LNX-01"],
    title: "Docker & Dockerfile",
    sum: "Containerize your app: image/layer/cache, multi-stage builds, small & secure images.",
    theory: `<p>Containers solve the age-old 'but it works on my machine' problem: they package <b>app + runtime + libraries + config</b> into a single unit that runs identically on a laptop, in CI, and in prod. Three concepts often get confused: an <b>image</b> is an immutable template (read-only, built from stacked layers); a <b>container</b> is a running process spawned from an image (with a thin writable layer on top); a <b>volume</b> is where durable data lives, decoupled from the container lifecycle. Remember this because <b>a container's filesystem is ephemeral</b> — delete the container and everything written to the writable layer is gone.</p>
<p><b>Layers & build cache</b> are the key to fast builds. Each instruction in a Dockerfile creates a layer; Docker caches each layer and only rebuilds from the first changed layer downward. That's why instruction order dictates speed: copy <code>package.json</code> and install dependencies <i>first</i>, copy source code <i>after</i> — because code changes constantly while dependencies rarely do.</p>
<p><b>Multi-stage builds</b> separate the 'build environment' from the 'runtime environment'. The build stage carries the full toolchain (compiler, devDependencies), often gigabytes; the runtime stage holds only the built artifact. Example Dockerfile for a course catalog service (Node):</p>
<pre><code># ---- Build stage ----
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
RUN addgroup -S app &amp;&amp; adduser -S app -G app
USER app
EXPOSE 3000
CMD ["node", "dist/server.js"]</code></pre>
<p><b>Small & secure base images:</b> switching from <code>node:20</code> (~1.1GB) to <code>node:20-alpine</code> (~180MB) or distroless (runtime only, no shell) both shrinks the image and cuts the attack surface — with no shell, an attacker can't easily run commands inside the container. Always add a non-root <code>USER</code>: by default containers run as root, and if the app is exploited together with a container-escape bug, the attacker owns the host.</p>
<p><b>A few core operational rules:</b> (1) Use <code>.dockerignore</code> so you don't copy <code>node_modules</code>, <code>.git</code>, or secrets into the image — this is both faster and avoids leaking secrets. (2) The app must <b>log to stdout/stderr</b>, never write log files inside the container (when the container dies you lose the logs, and it doesn't scale). (3) Push/pull images through a <b>registry</b> and <b>pin by digest</b> (<code>app@sha256:...</code>) so every node pulls exactly one immutable build, not a drifting <code>latest</code>.</p>
<p><b>A classic failure scenario:</b> a team packages a video upload service with the full <code>node:20</code> base, no multi-stage, running as root — a 1.4GB image. Every deploy has 30 nodes pull the image for 8-10 minutes, autoscaling lags at peak because pulls are slow, and a CVE in a build-time package (not needed at runtime) still ships inside the prod image. After moving to alpine + multi-stage: the image drops to 190MB, pull time falls under a minute, and the attack surface shrinks dramatically.</p>`,
    whenUse: `<p>Use this when you need <b>a single artifact that runs identically everywhere</b> and want a foundation for CI/CD, autoscaling, and K8s down the line. For edtech, containerizing each service (catalog, enrollment, grading) lets each one build/deploy/scale independently. The 'good enough' bar for a developer: be able to write a multi-stage Dockerfile, understand layer caching for fast builds, and know how to push images to a registry with immutable tags.</p>
<p><b>When you DON'T (yet) need it:</b> a tiny app running on one VM that rarely changes — containers just add a layer of complexity. <b>Don't</b> stuff a heavy stateful database into a self-managed container before you understand volumes and backups — a managed DB is safer. Containerization is a 'packaging' step, not automatically 'measure first, automate later' — you still need a clear operational reason.</p>`,
    pros: [
      "The same image runs identically in dev, CI, and prod — no more 'works on my machine'",
      "Multi-stage + small base yields a lean image, fast pulls, quick autoscaling, low attack surface",
      "An immutable artifact pinned by digest, ideal for rollback and audit",
      "Isolates dependencies between services, so each builds and scales independently",
    ],
    cons: [
      "The ephemeral filesystem easily leads newcomers to lose data if they don't understand volumes",
      "Misordered layers/cache make builds slow and images bloated",
      "Running as root with a full base image is a common security trap",
    ],
    questions: [
      { q: "The grading service's CI takes 12 minutes to build the image every time even when you only change a few lines of code. Where do you suspect the Dockerfile instruction order is wrong?",
        a: "Most likely the Dockerfile does <code>COPY . .</code> for all source code <strong>before</strong> installing dependencies, so changing a single line of code invalidates the cache for the dependency-install layer and forces a full <code>npm ci</code> from scratch. Fix it by <strong>copying package.json and installing dependencies first, copying source code after</strong>, since code changes constantly while dependencies rarely do. General principle: put rarely-changing layers on top and frequently-changing layers below to maximize build-cache reuse. Adding a <code>.dockerignore</code> so node_modules and .git aren't copied into the build context also saves significant time." },
      { q: "A team packaged the video upload service and the image came out at 1.4GB, making deploys to 30 nodes very slow. What do you propose and what is the trade-off?",
        a: "Move to a <strong>multi-stage build with a small base image</strong> (alpine or distroless): the build stage holds the heavy toolchain, the runtime stage only copies the built artifact so it drops to roughly 190MB, image pulls get much faster and autoscaling keeps up at peak. Trade-off: alpine uses musl libc so some native libraries may need recompiling or become harder to debug, and distroless has no shell so you cannot <code>exec</code> into the container to inspect it — you have to observe through logs and metrics instead of getting hands-on. For video upload, a small image is worth it because pull time directly affects how quickly you can scale when load spikes." },
      { q: "Why should you not run a container as the root user, and what does distroless add on the security front?",
        a: "By default a container runs as root; if the app is exploited together with a container-escape bug, the attacker gets root on the host and the blast radius is huge. Adding a non-root <code>USER</code> applies <strong>least privilege</strong>: even if compromised, the attacker only holds minimal permissions inside the container. <strong>Distroless goes further by removing the shell and all system tooling</strong>, so even if someone gets in it's hard to run commands, pull payloads, or poke around. The trade-off is losing the ability to shell into the container to debug by hand, which forces you to invest in observability properly." },
      { q: "The enrollment service writes log files and temp files into a directory inside the container. After a restart the logs vanish and you can't debug the incident. What went wrong?",
        a: "The container's filesystem is <strong>ephemeral</strong>: everything written to the writable layer is lost when the container is removed or replaced, and deploy/autoscale/restart cycles swap containers constantly. The app should <strong>log to stdout/stderr</strong> so the platform aggregates it into a centralized event stream (in the spirit of 12-Factor), not manage log files inside the container. Data that must persist belongs in a <strong>volume or external store</strong> (object storage, a DB), not inside the container. This is also the precondition for the container to be stateless and scale horizontally." },
      { q: "A colleague wants to deploy prod using the tag app:latest for convenience. How do you push back?",
        a: "<code>latest</code> is a <strong>mutable</strong> label that points to different images over time, so you don't know exactly which build prod is running and two nodes might pull two different builds — you lose reproducibility, rollback, and audit. Instead, tag by <strong>version/commit and pin by digest</strong> (<code>app:v1.4.2@sha256:...</code>) so each deploy is a deterministic, immutable artifact. When something breaks, you redeploy the exact old digest you've verified instead of hoping <code>latest</code> still points to the right place. Immutable artifacts are the foundation for fast rollbacks and trustworthy investigation." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Take a small Node/Python service (e.g. a course catalog API) and work through it in order: (1) write a naive single-stage Dockerfile with a full base, build it, and record the image size with <code>docker images</code>; (2) switch to a <b>multi-stage</b> build + an <code>alpine</code> or distroless base, remeasure the size and compare; (3) add a <code>.dockerignore</code> and a non-root <code>USER</code>, then try <code>docker exec</code> in to confirm it no longer runs as root; (4) reorder to copy dependencies before source code, change one line of code and rebuild to see where the cache kicks in; (5) tag the image by commit and push it to a registry (Docker Hub or GHCR), then pull it back by digest. Record the size and build-time numbers before/after to see the concrete trade-off.</p>`,
    links: [
      { t: "Docker — Get started & build images", u: "docs.docker.com/get-started" },
      { t: "Docker — Dockerfile best practices", u: "docs.docker.com/develop/develop-images/dockerfile_best-practices" },
      { t: "Docker — Multi-stage builds", u: "docs.docker.com/build/building/multi-stage" },
      { t: "Google — Distroless base images", u: "github.com/GoogleContainerTools/distroless" },
    ],
  },
  {
    id: "CMP-05", tier: 2, xp: 100, prereq: ["DKR-04"],
    title: "Docker Compose & the 12-Factor App",
    sum: "Run multiple services locally + 12-Factor principles (config via env, stateless).",
    theory: `<p>A real edtech app isn't just one container: there's an API, a database, a Redis cache, and sometimes a grading worker too. <b>Docker Compose</b> describes the whole fleet of services in one YAML file so they run together on a local machine with a single <code>docker compose up</code> — each developer spins up an identical environment in seconds, without installing Postgres/Redis on the host.</p>
<pre><code>services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/edtech
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: edtech
    volumes:
      - dbdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 3s
      retries: 5
  cache:
    image: redis:7-alpine
volumes:
  dbdata:</code></pre>
<p>The <b>12-Factor App</b> is a set of principles for an app to 'thrive' in a container/cloud environment. Not all 12 matter equally for operations; the ones worth knowing cold are:</p>
<ul>
<li><b>Config via environment variables</b> — no hardcoded connection strings, no baking prod config into the image. The same image runs dev/staging/prod, differing only by env. That's why in the YAML above <code>DATABASE_URL</code> is passed via <code>environment</code>.</li>
<li><b>Separate build / release / run</b> — build an immutable image once; a release is that image bound to a specific config set; run just executes that release. Never edit code on a running server.</li>
<li><b>Stateless processes</b> — the app keeps no state in memory or on local disk; state is pushed outward (DB, cache, object storage). Only then can it scale horizontally.</li>
<li><b>Disposability</b> — start fast, shut down cleanly: catch <code>SIGTERM</code> to finish in-flight requests and then exit. A container being killed/replaced at any moment is normal.</li>
<li><b>Logs as event streams</b> — the app only writes to stdout, letting the platform aggregate and route; it doesn't manage log files itself.</li>
</ul>
<p><b>The classic depends_on trap:</b> by default <code>depends_on</code> only guarantees that containers <i>start in order</i>, NOT that the service inside is <i>ready to accept requests</i>. Postgres needs a few seconds before it accepts connections, so once the API finishes starting it may immediately fail to connect to the DB and crash. The right approach is to attach a <b>healthcheck</b> and use <code>condition: service_healthy</code> like in the YAML above, or have the app retry the connection on startup (even more robust, since real prod has no Compose to babysit it).</p>
<p><b>When Compose is ENOUGH and you DON'T need Kubernetes:</b> local dev, CI (spinning up a real DB for tests), demos, or a single-VM app with a few services and modest load. For early-stage edtech, one VM + Compose + a managed DB can serve well until there's a measurable pain (needing multi-node autoscaling, self-healing, complex rolling updates), at which point you move to K8s. Jumping into K8s too early is over-engineering: you buy an extra complex system to operate before you have a problem that justifies it.</p>
<p><b>A failure scenario from violating statelessness:</b> a team runs 2 API instances behind a load balancer but stores login sessions in process memory. A learner logs in on instance A, the next request lands on instance B — and they get bounced back to the login page repeatedly. Similarly, a learner's uploaded file is written to one instance's local disk, so the other instance can't see it. Fix it with statelessness: <b>push sessions into Redis</b> (or use JWTs so the server doesn't need to remember anything), and <b>push uploaded files to object storage</b> (S3/GCS) instead of local disk. Only once state lives outside can you add/remove instances at will.</p>`,
    whenUse: `<p>Use Compose when you need to <b>stand up multiple services at once locally or in CI</b> in a repeatable way, and when load is small enough for a single machine to handle everything. It's the 'good enough' tool for most of the early stage and a natural stepping stone before you reach for orchestration. Apply 12-Factor from day one because it's nearly free while building but extremely expensive to retrofit once the app is tangled up in local state.</p>
<p><b>When NOT to use it:</b> Compose is not a multi-node prod tool — it has no real self-healing, autoscaling, rolling updates, or cluster scheduling; don't force Compose to do K8s's job. Conversely, don't drag K8s in just to run three containers on one VM. Choose based on measurable pain, not trends.</p>`,
    pros: [
      "Stand up an entire local/CI service fleet with one command, repeatably",
      "12-Factor keeps the app stateless so it scales horizontally and containers are easy to replace",
      "Config via env lets a single image serve every environment",
      "Good enough for the early stage, avoiding over-engineering when you don't yet need K8s",
    ],
    cons: [
      "Not a multi-node prod tool: lacks real self-healing, autoscaling, and rolling updates",
      "depends_on doesn't wait for a service to be ready, so it easily causes startup errors without a healthcheck",
      "Applying 12-Factor late is very expensive: retrofitting an app tangled in local state takes a lot of work",
    ],
    questions: [
      { q: "Learners complain about being randomly logged out after you scaled the API to 2 instances behind a load balancer. What's the root cause and the 12-Factor fix?",
        a: "The app is <strong>keeping sessions in process memory</strong>, which violates the stateless-processes principle: a request landing on an instance that doesn't hold that session is treated as not logged in. Fix it by <strong>pushing state outward</strong> — store sessions in a shared Redis, or use JWT-style tokens so the server needs to remember nothing. When processes are stateless, the load balancer can route a request to any instance with consistent results, and you can add/remove instances at will. This is the prerequisite for autoscaling to work correctly." },
      { q: "Your API occasionally crashes right at startup under docker compose up, with logs saying it can't connect to the database. depends_on is fully declared. Why?",
        a: "By default <code>depends_on</code> only guarantees the database container <strong>starts first</strong>, not that Postgres inside is <strong>ready to accept connections</strong> — and Postgres needs a few seconds to initialize. The API comes up and connects immediately while the DB isn't listening yet, so it fails and crashes. Fix it with a <strong>healthcheck on db plus condition: service_healthy</strong>, or more robustly have the <strong>app retry the connection on startup</strong>. The retry approach is worthwhile because real prod (with no Compose) also has moments where the DB is temporarily unavailable, and the app needs to tolerate that itself." },
      { q: "The boss wants to look 'professional' and demands you move the edtech app — running fine on a single VM with Docker Compose — onto Kubernetes right now. The app has ~50k users with steady load. How do you push back?",
        a: "Ask first: <strong>what measurable pain demands K8s?</strong> If you don't yet need multi-node autoscaling, cluster self-healing, or complex rolling updates, K8s just adds a heavy system to operate, learn, and maintain — the very definition of over-engineering. Compose + one VM + a managed DB is usually enough for this stage, and the investment should go into <strong>making the app truly 12-Factor</strong> so that moving to K8s later requires almost no app changes. <strong>Only upgrade orchestration when there's measurable evidence you're lacking it</strong>, not because it sounds impressive." },
      { q: "Why does 12-Factor require config via environment variables instead of per-environment config files baked into the image, and how does this help with rollback?",
        a: "If you bake prod config into the image, each environment needs a different image, which breaks the <strong>one immutable artifact runs everywhere</strong> principle and makes it easy to accidentally ship the wrong environment's config. Passing config via env lets the <strong>same image serve dev/staging/prod</strong>, differing only by environment variables at release time. Thanks to separating build/release/run, when you need to roll back you redeploy the exact same verified old image with its own config set, instead of rebuilding from code. Note that env vars only suit ordinary config; prod secrets should still come from a secret manager." },
      { q: "Learners upload submissions, and the files appear and disappear after you run multiple instances. What's the problem and what's the correct stateless solution?",
        a: "The app is <strong>writing uploaded files to one instance's local disk</strong>, so another instance serving a later request can't see them — again a statelessness violation, just like the session issue. The container filesystem is also ephemeral, so the file can be lost when the container is replaced. The correct solution is to <strong>push files to external object storage</strong> (S3/GCS/MinIO) and only store the path/metadata in the DB, so every instance accesses one shared source. Once both sessions and files live outside the process, you can truly scale horizontally and replace containers at will." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Stand up a miniature edtech stack with Docker Compose comprising 3 services: an API, a Postgres, and a Redis. (1) Write <code>docker-compose.yml</code>, passing all DB/Redis config via <code>environment</code> rather than hardcoding it in the code; (2) deliberately omit the healthcheck and run <code>docker compose up</code> repeatedly to watch the API occasionally crash because the DB isn't ready, then add a <b>healthcheck + condition: service_healthy</b> (or retry logic in the app) and confirm the crashes stop; (3) run 2 API instances behind a reverse proxy, store sessions in memory and observe erratic logouts, then move sessions to Redis to demonstrate statelessness; (4) do the same with file uploads: write to local disk (files appear and disappear), then switch to an object store like MinIO. Finally write a short argument for why this stack does NOT yet need Kubernetes at its current scale.</p>`,
    links: [
      { t: "The Twelve-Factor App", u: "12factor.net" },
      { t: "Docker — Compose overview & compose file", u: "docs.docker.com/compose" },
      { t: "Docker Compose — startup order & healthcheck (depends_on)", u: "docs.docker.com/compose/how-tos/startup-order" },
      { t: "Docker — Manage data with volumes", u: "docs.docker.com/storage/volumes" },
    ],
  },
];
