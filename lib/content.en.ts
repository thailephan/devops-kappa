// EN dataset. Nội dung dịch từ bản VI, tách theo tier trong lib/en/*.
import type { Tier, SkillNode } from "./skill-types";
import { EN_TIER01 } from "./en/tier01";
import { EN_TIER2 } from "./en/tier2";
import { EN_TIER3 } from "./en/tier3";
import { EN_TIER4 } from "./en/tier4";
import { EN_TIER5 } from "./en/tier5";
import { EN_TIER6 } from "./en/tier6";
import { EN_TIER7 } from "./en/tier7";

export const TIERS_EN: Tier[] = [
  { id: 0, n: "TIER 0", t: "Mindset foundations", sub: "Culture · DORA · Feedback loop" },
  { id: 1, n: "TIER 1", t: "Building blocks", sub: "Linux · Networking · Git" },
  { id: 2, n: "TIER 2", t: "Packaging apps", sub: "Docker · Compose · 12-Factor" },
  { id: 3, n: "TIER 3", t: "CI/CD", sub: "Pipeline · Test · Deploy" },
  { id: 4, n: "TIER 4", t: "Infrastructure as Code", sub: "Cloud · Terraform · Ansible" },
  { id: 5, n: "TIER 5", t: "Orchestration", sub: "Kubernetes · Helm · Autoscale" },
  { id: 6, n: "TIER 6", t: "Observability & SRE", sub: "Metrics/Logs/Traces · SLO · On-call" },
  { id: 7, n: "TIER 7", t: "Security & Boss", sub: "DevSecOps · Supply chain · Capstone" },
];

export const RANKS_EN: [number, string][] = [
  [0, "Junior DevOps"],
  [300, "Mid DevOps / SRE"],
  [700, "Senior DevOps"],
  [1200, "Staff / Platform Engineer"],
  [1800, "Principal / SRE Lead"],
];

export const NODES_EN: SkillNode[] = [
  ...EN_TIER01,
  ...EN_TIER2,
  ...EN_TIER3,
  ...EN_TIER4,
  ...EN_TIER5,
  ...EN_TIER6,
  ...EN_TIER7,
];
