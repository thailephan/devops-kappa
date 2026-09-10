import type { SkillNode } from "../skill-types";

export const EN_TIER4: SkillNode[] = [
  {
    id: "CLD-08", tier: 4, xp: 100, prereq: ["NET-02"],
    title: "Cloud Fundamentals (VPC · IAM · Compute)",
    sum: "Cloud foundations: VPC/subnet/security group, IAM least-privilege, managed services.",
    theory: `<p>Cloud is not 'someone else's server' — it is a set of lego blocks for networking, compute, and permissions that you must understand to avoid shooting yourself in the foot. The three foundational pillars: <b>networking (VPC)</b>, <b>permissions (IAM)</b>, and <b>compute</b>.</p>
<p><b>VPC & subnet.</b> A VPC is your own virtual private network inside the cloud. Within it you split into <b>public subnets</b> (with a path out to the Internet via an Internet Gateway — for load balancers and bastions) and <b>private subnets</b> (no public IP — for web servers and, above all, the <b>database</b>). The rule for edtech: <b>web servers in a private subnet, receiving traffic only from the load balancer; the DB in an even deeper private subnet, receiving traffic only from the web tier</b>. The DB never gets a public IP — this is the classic data-leak mistake.</p>
<p><b>Security group / firewall.</b> A stateful firewall attached at the instance level: it declares which ports, from which sources, are allowed in. Least-privilege: the DB security group opens port 5432 <i>only from the web tier's security group</i>, never to <code>0.0.0.0/0</code>. Most 'service A cannot reach service B' problems in the cloud come down to a security group blocking the port (recall NET-02).</p>
<p><b>IAM least-privilege.</b> This is the easiest part to do sloppily and the most dangerous:</p>
<ul>
<li><b>Do not use the root account</b> for day-to-day work — reserve it for emergencies, enable MFA, and lock it away.</li>
<li><b>Do not create long-lived access keys</b> and stuff them into code/CI. Replace them with an <b>IAM role</b> attached to compute, and <b>OIDC</b> so CI/CD obtains short-lived, auto-expiring credentials.</li>
<li>Grant the minimum permissions needed — never <code>Action: "*"</code> just for convenience.</li>
</ul>
<p><b>Region & AZ.</b> A region is a geographic area (put it close to your users — for VN edtech, Singapore/ap-southeast is closer than us-east). Each region has multiple <b>Availability Zones</b> — data centers isolated in power and networking. <b>Multi-AZ</b> means spreading instances/DBs across 2+ AZs so one AZ dying does not take down the whole system — this is the minimum HA bar for production.</p>
<p><b>Managed vs self-hosted.</b> RDS/managed databases and object storage (S3) handle backups, patching, failover, and replicas for you. Running your own Postgres on a VM means being on call at 3 AM when the disk fills up, managing replicas yourself, and handling upgrades yourself. For a small edtech team, <b>managed almost always wins</b> in the early stages.</p>
<p><b>Cost basics:</b> <b>on-demand</b> (pay per hour, flexible, most expensive) · <b>reserved/savings plan</b> (a 1–3 year commitment, 30–70% cheaper, for stable baseline load) · <b>spot</b> (up to 90% cheaper but reclaimable at any moment — only for interruption-tolerant work like video batch processing, never for a DB).</p>`,
    whenUse: `<p>This is the foundation for everything in TIERS 4–7: Terraform builds exactly these blocks, and K8s runs on top of this VPC. The 'good enough' bar for a senior: being able to draw a VPC diagram (public/private subnets, LB → web → DB), write a least-privilege security group, and explain why you never put an access key into CI. <b>When you do NOT yet need to go deep:</b> if you are running on a PaaS (Render/Railway/Fly) at the few-thousand-user stage, most of VPC/IAM is already hidden away — do not stand up a complex VPC yourself before there is a measurable need. Only descend to raw cloud when you need control over networking, cost, or compliance.</p>`,
    pros: [
      "Managed services cut most of the operational burden (backup, patch, failover) for small teams",
      "Multi-AZ delivers real HA at reasonable cost and complexity",
      "IAM roles + OIDC eliminate long-lived credentials — a big reduction in leak risk",
    ],
    cons: [
      "A wide configuration surface makes it easy to misconfigure security (public DB, wide-open security groups)",
      "Costs escalate easily if you do not measure and do not pick the right purchasing model (on-demand vs reserved vs spot)",
    ],
    questions: [
      { q: "A team puts the edtech app's Postgres on an EC2 with a public IP so 'devs can access it conveniently'. Why is this a time bomb, and what is the correct layout?",
        a: "A DB with a public IP means the entire Internet can scan and attack port 5432 — a single weak password or vulnerability leaks all your students' data. The correct layout: put the DB in a <strong>private subnet with no route to the Internet</strong>, have its security group open the port only from the <strong>web tier's security group</strong>, and let devs reach it via a <strong>bastion/SSM/VPN</strong> rather than exposing the port outward. The root principle: <strong>a DB never gets a public IP</strong>." },
      { q: "Your CI/CD needs to deploy to the cloud. Why should you NOT create a long-lived access key plugged into the pipeline's environment variables?",
        a: "A long-lived access key is a secret that <strong>never expires on its own</strong>: it sits in logs and environment variables, leaks easily through forks/PRs, and if exposed, the attacker has access until someone notices and revokes it manually. The right way is <strong>OIDC</strong> — CI presents an identity token, the cloud exchanges it for a <strong>short-lived credential that expires in minutes</strong>, bound to a least-privilege role for the deploy. <strong>There is no static secret to leak.</strong>" },
      { q: "When do you choose managed RDS over installing Postgres yourself on a VM, and when the reverse?",
        a: "For a small edtech team, <strong>managed RDS almost always wins early on</strong>: it handles automated backups, patching, Multi-AZ failover, and read replicas — things that take weeks to get right yourself. You pay more to avoid being on call at 3 AM. Only self-host when there is a <strong>measurable</strong> need: a specific extension RDS does not support, cost optimization at very large scale, or compliance constraints that force data somewhere managed does not cover. Do not self-host because it is 'cheaper on paper' and then pay for it in on-call time." },
      { q: "A team transcodes lecture videos every night and can tolerate interruptions. Meanwhile the primary database serves 10 million students. Which purchasing model should each use?",
        a: "Video transcoding is a <strong>batch, interruption-tolerant</strong> workload → use <strong>spot instances</strong>, up to ~90% cheaper; if reclaimed, the job just reruns — perfect for cost optimization. The primary database is a <strong>baseline, 24/7, must-not-die</strong> workload → absolutely <strong>no spot</strong> (reclaimed = downed DB); use a <strong>reserved/savings plan</strong> to commit long-term for 30–70% off on-demand. The principle: match the purchasing model to the workload's fault tolerance — do not buy one model for everything." },
      { q: "One AZ in your region loses power. With a Multi-AZ architecture, what happens, and is Multi-AZ the same as disaster recovery?",
        a: "Multi-AZ means instances/DBs are spread across 2 or more isolated data centers within the same region; when one AZ dies, the load balancer shifts traffic to the surviving AZ and the managed DB fails over to standby — users barely notice. But <strong>Multi-AZ is NOT disaster recovery</strong>: it protects against <em>one AZ</em> failing, not against <em>a whole region going down</em> or <em>accidentally deleting the DB</em>. Real DR needs <strong>backups in another region/account</strong> and a rehearsed recovery plan. Do not confuse HA (protection against infrastructure failure) with DR (protection against data loss/disaster)." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">On a cloud account (use the free tier or a small budget, and set a budget alert first): (1) create a VPC with 1 public subnet and 1 private subnet; (2) place a web instance in the private subnet behind a load balancer in the public subnet, and a DB in the private subnet; (3) configure least-privilege security groups — the LB accepts 443 from the Internet, the web accepts from the LB, the DB accepts 5432 <b>only from the web security group</b>; (4) prove it: <code>curl</code> against the LB works, but you cannot connect directly to the DB from outside; (5) create a least-privilege IAM role attached to the web instance in place of an access key. Write up: which permissions/network paths did you deliberately deny, and why.</p>`,
    links: [
      { t: "AWS — VPC concepts (subnet, route table, security group)", u: "docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html" },
      { t: "AWS Well-Architected Framework — Security & Cost pillars", u: "aws.amazon.com/architecture/well-architected" },
      { t: "AWS IAM — best practices (least privilege, no root, roles)", u: "docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html" },
      { t: "GitHub Actions — OIDC to cloud (no long-lived keys)", u: "docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect" },
      { t: "Google Cloud — regions and zones", u: "cloud.google.com/compute/docs/regions-zones" },
    ],
  },
  {
    id: "IAC-09", tier: 4, xp: 100, prereq: ["CLD-08"],
    title: "Terraform & Infrastructure as Code",
    sum: "Declarative infrastructure as code: state, plan/apply, modules, drift.",
    theory: `<p><b>Infrastructure as Code (IaC)</b> means you declare your desired infrastructure as code, put it in Git, review it via PRs, and can rebuild it identically — instead of clicking around a console and having no one remember what was clicked. Terraform is a <b>declarative</b> tool: you describe the <i>target state</i> and it computes the steps to reach it, rather than you writing each command.</p>
<pre><code>resource "aws_db_instance" "edtech" {
  identifier        = "edtech-prod"
  engine            = "postgres"
  instance_class    = "db.r6g.large"
  allocated_storage = 100
  multi_az          = true          # HA: survives one AZ dying
  storage_encrypted = true
  db_subnet_group_name   = aws_db_subnet_group.private.name
  vpc_security_group_ids = [aws_security_group.db.id]
}</code></pre>
<p><b>The state file — the heart, and also a bomb.</b> Terraform keeps a <code>terraform.tfstate</code> file mapping 'your code' to 'the real resources in the cloud'. It is <b>extremely important</b>: lose the state and Terraform no longer knows what it created — the next apply may create duplicates or want to delete the wrong things. It is also <b>extremely dangerous</b>: state contains <b>sensitive values in plain text</b> (DB passwords, keys). Therefore:</p>
<ul>
<li><b>Never keep state in Git</b> or on a personal machine.</li>
<li>Use a <b>remote backend</b> (S3 + encryption, or Terraform Cloud) so the whole team shares one source of truth.</li>
<li><b>Enable state locking</b> (DynamoDB lock / the backend's lock): without it, two people running <code>apply</code> at once will overwrite each other's state → corrupted state, and infrastructure drift you cannot recover from.</li>
</ul>
<p><b>plan before apply — always.</b> <code>terraform plan</code> prints exactly what will be <i>created / modified / destroyed</i> before touching anything real. Read the <code>destroy</code> lines carefully: changing a seemingly harmless attribute can force a recreate of a database — data loss. In CI, require the plan to appear on the PR for review, and only apply after merge.</p>
<p><b>Modules + environment separation.</b> Package repeated infrastructure into <b>modules</b> (e.g. a 'service' module of compute + LB + security group), then reuse it for <b>dev / staging / prod</b> with different parameters (size, count). DRY: fix it once, every environment benefits. But do not abstract too early — only extract a module after repeating 2–3 times, and do not write a module framework for infrastructure that has just one service.</p>
<p><b>Immutable infrastructure vs SSH hot-patching.</b> When prod has an incident, the biggest temptation is to SSH into the server and fix it by hand. Doing so creates <b>configuration drift</b>: the real server now differs from the code in Git, and the next apply will 'fix it back' and erase your patch — or worse, no one knows the drift exists until a rebuild breaks. The right mindset: infrastructure is <b>immutable</b> — to change it, you edit the code, apply, and replace; you do not patch by hand. If you must hot-patch to put out a fire, immediately afterward you must fold the change into the code and run <code>plan</code> to eliminate drift.</p>
<p><b>Terraform vs Pulumi/CDK.</b> Terraform uses HCL (its own declarative language) — easy to read and forces you to think declaratively. Pulumi/CDK let you write infrastructure in TypeScript/Python — familiar to developers and powerful when you need complex logic, but easy to abuse with loops/conditionals until no one can read the infrastructure. Choose by team: a team fluent in one language that needs logic → CDK/Pulumi; a team that wants easy-to-audit, low-magic infrastructure → Terraform.</p>`,
    whenUse: `<p>Use IaC as soon as infrastructure grows beyond 'one hand-clicked VM' and involves 2 or more people or 2 or more environments — i.e. nearly every serious project. It is the prerequisite for rebuilding after a disaster, for reviewing infrastructure changes the way you review code, and for eliminating untracked console actions. <b>When you do NOT yet need it:</b> a weekend prototype, a single trial VM — writing Terraform there is a time-consuming ritual. And <b>do not</b> manage everything with Terraform at all costs: things that change constantly at the application layer (app config, feature flags) do not belong to Terraform — use the right tool for the right layer.</p>`,
    pros: [
      "Infrastructure is rebuildable identically, reviewed via PRs, with history in Git",
      "plan previews destructive impact before touching anything real",
      "Modules + environment separation keep dev/staging/prod consistent and reduce drift",
    ],
    cons: [
      "State is a lethal single point: losing/locking/leaking it has heavy consequences, requiring disciplined backend + locking",
      "The learning curve and the temptation to SSH hot-patch cause drift; it is easy to over-engineer modules too early",
    ],
    questions: [
      { q: "An engineer accidentally deletes the local terraform.tfstate file (no remote backend). What happens on the next apply, and what is the lesson?",
        a: "Terraform loses its map of 'code ↔ real resources': it thinks nothing exists yet, so the next <code>apply</code> tries to <strong>recreate everything from scratch</strong> — duplicated resources, name conflicts, or (if you <code>import</code> wrong) accidental deletion. Remediation means <code>terraform import</code>ing each resource back into state by hand — painful and error-prone. The lesson: <strong>state must live in a remote backend with versioning + encryption</strong> (e.g. S3 with versioning enabled) so you never depend on a single file on a personal machine." },
      { q: "Two engineers run 'terraform apply' at the same time on the same infrastructure with no state locking. How does it break?",
        a: "Both read the old state, each computes its own plan, and then they <strong>overwrite each other's state</strong> — the final state reflects only one person, and the other's changes vanish from state while still existing on the cloud → 'orphaned', unmanaged infrastructure, and corrupted state that can make a later apply destroy/create things wildly. Prevention: <strong>enable state locking</strong> (DynamoDB lock or Terraform Cloud's lock) so the second apply must wait rather than run in parallel. This is why a remote backend + locking is mandatory for teamwork." },
      { q: "terraform plan on a 'small' change (changing one DB parameter) shows a 'destroy and recreate' line. What do you do next?",
        a: "<strong>Stop, do not apply.</strong> Recreating a database means deleting the old DB and creating a new one → <strong>losing all your students' data</strong>. This is precisely why <code>plan</code> exists — to catch destructive impact before it happens. You need to investigate: is that parameter a 'force new resource' (some attributes cannot be modified in place), is there another way to change it (multi-step, or using <code>create_before_destroy</code>), and if a recreate is truly unavoidable, you must have a snapshot/migrate plan for the data first. <strong>Always read the destroy lines in a plan carefully before applying to prod.</strong>" },
      { q: "Prod is on fire, and an engineer SSHes into the server to hand-edit config to stop the bleeding. Why is this both right and dangerous, and what must you do afterward?",
        a: "Putting out an immediate fire is acceptable — users matter more than IaC purity. But it creates <strong>configuration drift</strong>: the real server now differs from the code in Git, and the next <code>terraform apply</code> will <strong>silently undo your patch</strong>, bringing the incident back at the worst possible moment. Mandatory once the fire is out: <strong>fold the change into the Terraform code and run plan to confirm there is no more drift</strong>. The immutable principle: the real machine must always match the code; SSH hot-patching is only an emergency exception that must be 'legitimized' immediately." },
      { q: "The state file contains the DB password in plain text. Why is this a security risk, and how do you mitigate it?",
        a: "Anyone who can read the state can read <strong>all your secrets in the clear</strong> — so state in Git or in Slack is a serious leak. Mitigate: (1) <strong>a remote backend with encryption at rest + tight access control</strong> (S3 SSE + bucket policy, or Terraform Cloud); (2) never commit state to Git (add it to <code>.gitignore</code>, but better yet use a backend so it never sits locally at all); (3) prefer having secrets managed by a <strong>secret manager</strong> with Terraform only referencing them, limiting secrets that 'settle' in state. Treat state as a first-class secret, not an ordinary file." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">On a small cloud account: (1) write Terraform to build the VPC + one web instance from node CLD-08, run <code>terraform plan</code> then <code>apply</code>; (2) configure a <b>remote backend</b> (S3 with versioning + state locking) and migrate the local state to it; (3) create drift on purpose: SSH into the server and hand-change one thing, then run <code>terraform plan</code> to see Terraform detect the divergence and want to revert it; (4) extract a <b>module</b> and reuse it for two environments, dev and prod, with different sizes; (5) deliberately change an attribute that forces a recreate and read the <code>destroy</code> lines in the plan carefully — <b>do not apply</b>, just document the impact. Finally run <code>terraform destroy</code> to clean up and avoid costs.</p>`,
    links: [
      { t: "HashiCorp — Terraform docs & tutorials", u: "developer.hashicorp.com/terraform" },
      { t: "Terraform — remote state & backends (S3, locking)", u: "developer.hashicorp.com/terraform/language/backend" },
      { t: "Terraform — state (sensitive data, import)", u: "developer.hashicorp.com/terraform/language/state" },
      { t: "Gruntwork — Terraform best practices / module patterns", u: "terraform-best-practices.com" },
      { t: "Pulumi — comparison with Terraform (IaC in a programming language)", u: "pulumi.com/docs/concepts/vs/terraform" },
    ],
  },
  {
    id: "CFG-10", tier: 4, xp: 100, prereq: ["LNX-01", "IAC-09"],
    title: "Ansible & Config Management",
    sum: "Configuration inside the machine: idempotency, push-based, and when you need it.",
    theory: `<p>There is an important boundary that is easy to blur: <b>Terraform provisions infrastructure</b> (creates VMs, networks, DBs — 'the machine exists and is in the right place'), while <b>Ansible configures what is inside the machine</b> (installs packages, lays down config files, creates users, starts services — 'inside the machine, the right things are present'). Terraform ensures <i>the machine is present</i>; Ansible ensures <i>the machine is set up correctly</i>. Mixing up these two roles is the source of many messes.</p>
<p><b>Idempotency — the core property.</b> A well-written Ansible playbook must be runnable <b>many times for the same result</b>: the first run produces the desired state, and later runs, if already correct, do nothing (reporting <code>ok</code> instead of <code>changed</code>). Ansible describes the <i>target state</i> ('package X must be present'), not a command ('run apt install') — so rerunning is safe and side effects do not accumulate.</p>
<pre><code>- name: Configure Nginx for edtech
  hosts: web
  become: true
  tasks:
    - name: Install nginx
      ansible.builtin.package:
        name: nginx
        state: present        # idempotent: skip if already present
    - name: Lay down config file
      ansible.builtin.template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
      notify: reload nginx     # only reload when the file changes
  handlers:
    - name: reload nginx
      ansible.builtin.service:
        name: nginx
        state: reloaded</code></pre>
<p><b>Agentless push vs pull.</b> Ansible is <b>push-based and agentless</b>: it just needs SSH to the target and runs, with no resident agent to install. By contrast Puppet/Chef are <b>pull-based</b>: each machine runs an agent that periodically pulls configuration from a central server. Push (Ansible) is simple to start with and easy to control the timing; pull suits very large fleets that need to continuously self-converge without anyone pressing a button. For a small-to-medium edtech team, Ansible's agentless push is usually the least-friction choice.</p>
<p><b>The real question: with immutable infra + containers, do you still need config management?</b> This is where trade-off thinking comes in. If you have gone with <b>immutable infrastructure</b> (build a standard image and replace rather than modifying a running machine) and <b>containers</b>, then most of 'configuring a running machine' disappears — you <b>bake configuration into the image</b> at build time (with a Dockerfile, or Packer + Ansible to produce a standard image), then deploy that immutable image. Ansible-running-continuously-on-a-live-machine becomes far less necessary. It is still useful for: producing golden images (Packer calling Ansible), configuring things that <b>cannot</b> be packaged into a container (the hosts of K8s nodes, network devices, bare-metal databases), and legacy systems not yet containerized. <b>Conclusion:</b> do not stand up a whole config management layer by default if you already bake images — only add it when there is a part genuinely outside the container.</p>
<p><b>Secrets in Ansible.</b> Do not put passwords/keys into playbooks in plain text. Use <b>Ansible Vault</b> to encrypt sensitive variables/files, decrypting at runtime with a password/key. Better still in production: pull secrets from a central <b>secret manager</b> at runtime, so no secret settles in the repo — the same least-privilege and rotation spirit you learned in CLD-08.</p>`,
    whenUse: `<p>Use config management when you have <b>long-lived machines</b> that need consistent setup and are not/cannot be containerized: golden images (via Packer+Ansible), node hosts, network devices, bare-metal DBs, legacy systems. <b>When you do NOT need it (or need very little):</b> if the entire workload already runs in containers on immutable infrastructure, most configuration should be <b>baked into the image</b> at build time, not managed by Ansible running continuously — standing up a full Ansible layer then is over-engineering. The principle: Terraform creates the machine, the image carries the configuration, and Ansible only fills in the part genuinely outside the container.</p>`,
    pros: [
      "Agentless push (just SSH) — easy to start, no agent to maintain on every machine",
      "Idempotent + declares the target state: safe to rerun, consistent configuration across many machines",
      "Pairs well with Packer to bake golden images instead of configuring live machines",
    ],
    cons: [
      "Configuring running machines easily creates drift; with containers, most of this should shift to baking images",
      "Push-based self-converges less well at very large scale than pull (Puppet/Chef); managing secrets requires discipline (Vault/secret manager)",
    ],
    questions: [
      { q: "A colleague uses Ansible to create both VMs and networks on the cloud, and uses Terraform to install packages inside the VM. Why is this using the wrong tool for each job?",
        a: "The roles are reversed. <strong>Terraform is strong at provisioning infrastructure</strong> (VMs, networks, DBs) because it tracks state and knows how cloud resources exist/change; forcing Terraform to install packages inside a machine leaves it unable to manage the internal state and prone to drift. <strong>Ansible is strong at configuring what is inside the machine</strong> (packages, files, services) with idempotency; forcing Ansible to create infrastructure loses Terraform's plan/state-tracking ability. The correct boundary: <strong>Terraform ensures 'the machine exists', Ansible/the image ensures 'inside the machine is correct'</strong>." },
      { q: "A playbook has a task that 'runs apt install nginx' via the command module. Why does this violate idempotency, and how do you fix it?",
        a: "The <code>command</code>/<code>shell</code> modules are <strong>imperative</strong> — Ansible does not know the target state, so every run re-executes and always reports <code>changed</code> — not idempotent, and commands with side effects (appending to a file, creating duplicates) accumulate on rerun. Fix it by using a <strong>state-declaring module</strong>: <code>package: name=nginx state=present</code> — Ansible checks, and if it is already present it reports <code>ok</code> and does nothing. The principle: <strong>describe the target state, do not issue step-by-step commands</strong>; use command/shell only when no suitable module exists, and add <code>creates:</code>/<code>when:</code> conditions yourself to keep it idempotent." },
      { q: "A team has fully containerized the edtech app and runs it on immutable infrastructure. Should they stand up an Ansible layer to configure the running containers?",
        a: "<strong>No</strong> — that goes against the immutable spirit. With containers + immutable infra, configuration should be <strong>baked into the image at build time</strong> (Dockerfile, or Packer+Ansible producing a golden image), then the immutable image is deployed and replaced on change, rather than modifying a live container. Standing up a whole continuously-running config management layer here is <strong>over-engineering</strong> and creates two conflicting sources of truth. Ansible still has a place, but for the part <strong>outside the container</strong>: the hosts of K8s nodes, image building, network devices, bare-metal DBs, legacy systems — not for the inside of the container." },
      { q: "What is the core difference between push-based (Ansible) and pull-based (Puppet/Chef), and what does each suit?",
        a: "<strong>Push (Ansible)</strong>: the control machine SSHes to the target and pushes configuration when you run it — <strong>agentless</strong>, simple, and you control exactly when it applies; suits small-to-medium teams and deliberate operations. <strong>Pull (Puppet/Chef)</strong>: each machine runs an <strong>agent</strong> that periodically pulls configuration from a server and self-converges to the desired state — suits <strong>very large fleets</strong> that need continuous self-healing of drift with no one pressing a button, and new machines self-configure on boot. The trade-off: push needs less supporting infrastructure but self-converges less well at scale; pull is strong at scale but you must maintain agents + a central server." },
      { q: "You need to feed a DB password into configuration via Ansible. What is the wrong way and the right way?",
        a: "The wrong way: write the password in <strong>plain text directly in the playbook/variables and commit it to Git</strong> — anyone who clones the repo sees the secret. The right way at a basic level: use <strong>Ansible Vault</strong> to encrypt the sensitive file/variables, decrypting only at runtime with a vault password/key protected outside the repo. Better in production: <strong>pull the secret from a central secret manager at runtime</strong> (no secret settles in the repo, with rotation and auditing) — the same least-privilege and short-lived-credential spirit learned in CLD-08. The principle: <strong>no secret in the clear in version control</strong>." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">On 2 Linux VMs (from CLD-08/IAC-09): (1) write an Ansible playbook to configure Nginx + a small app using state-declaring modules (<code>package</code>, <code>template</code>, <code>service</code>), using a handler that only reloads when the config changes; (2) run the playbook <b>twice</b> and confirm the second run reports all <code>ok</code> and not <code>changed</code> — that is idempotency; (3) feed in a fake password via <b>Ansible Vault</b> and confirm the encrypted file does not leak when viewed raw; (4) compare: rewrite the same configuration as a <code>Dockerfile</code> (baked into the image) and answer for yourself — for this app, should you use Ansible-on-a-live-machine or bake an image, and why. Document the Terraform ↔ image ↔ Ansible boundary for your project.</p>`,
    links: [
      { t: "Ansible — documentation (playbooks, modules)", u: "docs.ansible.com/ansible/latest" },
      { t: "Ansible — best practices & idempotency", u: "docs.ansible.com/ansible/latest/tips_tricks/ansible_tips_tricks.html" },
      { t: "Ansible Vault — encrypting secrets", u: "docs.ansible.com/ansible/latest/vault_guide/index.html" },
      { t: "HashiCorp Packer — bake golden images (with Ansible)", u: "developer.hashicorp.com/packer" },
      { t: "Puppet vs Chef vs Ansible — push/pull, agent", u: "redhat.com/en/topics/automation/what-is-configuration-management" },
    ],
  },
];
