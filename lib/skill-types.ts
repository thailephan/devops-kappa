// Kiểu dữ liệu dùng chung cho skill-tree. Tách khỏi content để nhiều file tier import được.

export type Lang = "vi" | "en";

export type Tier = { id: number; n: string; t: string; sub: string };
export type QA = { q: string; a: string };
export type NodeLink = { t: string; u: string };
export type SkillNode = {
  id: string;
  tier: number;
  xp: number;
  prereq: string[];
  title: string;
  sum: string;
  theory: string;
  whenUse: string;
  pros: string[];
  cons: string[];
  questions: QA[];
  lab: string;
  links: NodeLink[];
  calc?: boolean;
  synth?: boolean;
  boss?: boolean;
};
