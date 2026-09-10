import { NODES, TIERS, RANKS, type Lang, type SkillNode, type Tier } from "./content";
import { NODES_EN, TIERS_EN, RANKS_EN } from "./content.en";

export type { Lang };

export const LANGS: Lang[] = ["vi", "en"];

export function getData(lang: Lang): {
  nodes: SkillNode[];
  tiers: Tier[];
  ranks: [number, string][];
} {
  return lang === "en"
    ? { nodes: NODES_EN, tiers: TIERS_EN, ranks: RANKS_EN }
    : { nodes: NODES, tiers: TIERS, ranks: RANKS };
}

export type Rule = { n: string; t: string; d: string };

export type UIStrings = {
  eyebrow: string;
  h1: string;
  tagline: string;
  rank: string;
  xp: string;
  progress: string;
  reset: string;
  resetConfirm: string;
  resetDone: string;
  searchPlaceholder: string;
  navProgress: (done: number, total: number) => string;
  statusLocked: string;
  statusAvail: string;
  statusCleared: string;
  needPrefix: string;
  lockNotice: (list: string) => string;
  lockToast: (list: string) => string;
  clearToast: (id: string, xp: number, newly: string[]) => string;
  whatIs: string;
  whenUse: string;
  pros: string;
  cons: string;
  questions: string;
  lab: string;
  sources: string;
  calcHeading: string;
  revealShow: string;
  revealHide: string;
  clearBtn: (xp: number) => string;
  clearedBtn: string;
  xpEarned: (xp: number) => string;
  clearHint: string;
  qLabel: (i: number) => string;
  prev: string;
  next: string;
  home: {
    kicker: string;
    titleA: string;
    grad: string;
    titleB: string;
    p: string;
    rulesTitle: string;
    rules: Rule[];
    tiersTitle: string;
    pickHint: string;
  };
  calc: {
    slo: string;
    days: string;
    reqMil: string;
    fail: string;
    cDowntime: string;
    cDowntimeSub: (days: number) => string;
    cBudget: string;
    cBudgetSub: string;
    cConsumed: string;
    cConsumedSub: (fail: number) => string;
    cRemaining: string;
    cRemainingOk: string;
    cRemainingBad: string;
    note: string;
  };
  auth: {
    localPill: string;
    localMsg: string;
    syncedPill: string;
    syncingPill: string;
    signedIn: (email: string) => string;
    signOut: string;
    notSignedPill: string;
    prompt: string;
    send: string;
    sending: string;
    sent: (email: string) => string;
    errorPrefix: (msg: string) => string;
    emailPlaceholder: string;
    syncedLabel: string;
    syncingLabel: string;
    localLabel: string;
  };
};

export const UI: Record<Lang, UIStrings> = {
  vi: {
    eyebrow: "DevOps Skill Tree",
    h1: "Lý thuyết & Thực hành",
    tagline: "Clear từng node → mở khóa node liên quan → hạ Boss cuối.",
    rank: "Rank",
    xp: "XP",
    progress: "Tiến độ",
    reset: "Reset tiến độ",
    resetConfirm: "Xóa toàn bộ tiến độ đã clear?",
    resetDone: "Đã reset tiến độ.",
    searchPlaceholder: "Tìm node…",
    navProgress: (done, total) => `${done}/${total} node`,
    statusLocked: "Đang khóa",
    statusAvail: "Có thể học",
    statusCleared: "Đã clear",
    needPrefix: "Cần:",
    lockNotice: (list) =>
      `Node này đang <b>khóa</b>. Hoàn thành các node tiên quyết sau để mở khóa: <b>${list}</b>.`,
    lockToast: (list) => `🔒 Cần clear trước: <b>${list}</b>`,
    clearToast: (id, xp, newly) =>
      `✓ Clear <b>${id}</b> +${xp} XP.` + (newly.length ? ` Mở khóa: <b>${newly.join(", ")}</b>` : ""),
    whatIs: "Là gì / Cách hoạt động",
    whenUse: "Khi nào nên / không nên dùng",
    pros: "Ưu điểm",
    cons: "Nhược điểm",
    questions: "Câu hỏi kiểm tra & đáp án gợi ý",
    lab: "Lab thực hành",
    sources: "Nguồn đọc thêm (chọn lọc)",
    calcHeading: "Máy tính Error Budget (SLO → downtime & ngân sách lỗi)",
    revealShow: "Xem đáp án gợi ý ▾",
    revealHide: "Ẩn đáp án ▴",
    clearBtn: (xp) => `Đánh dấu ĐÃ CLEAR (+${xp} XP)`,
    clearedBtn: "✓ Đã clear node này",
    xpEarned: (xp) => `+${xp} XP đã nhận`,
    clearHint: "Nên đọc lý thuyết + thử trả lời câu hỏi trước",
    qLabel: (i) => `Q${i}.`,
    prev: "Node trước",
    next: "Node tiếp",
    home: {
      kicker: "DevOps Engineer · Career Track",
      titleA: "Học DevOps từ ",
      grad: "tư duy tới production",
      titleB: "",
      p: "Lộ trình skill-tree: mỗi node là một mảng kiến thức có lý thuyết, câu hỏi tình huống edtech, lab và nguồn. Clear node để mở khóa node phụ thuộc. Tinh thần xuyên suốt: đo trước, tự động sau, chống over-engineering.",
      rulesTitle: "3 nguyên tắc xuyên suốt",
      rules: [
        { n: "01", t: "Đo trước", d: "Không có số DORA thì mọi tool chỉ là nghi lễ. Đo baseline trước khi tự động hóa." },
        { n: "02", t: "Tự động sau", d: "Việc lặp lại 2 lần thì viết script/pipeline. Sức người để dành cho quyết định." },
        { n: "03", t: "Chống over-engineering", d: "Luôn hỏi: khi nào tôi CHƯA cần thứ này? Mua độ phức tạp chỉ khi có nỗi đau đo được." },
      ],
      tiersTitle: "8 tầng — chọn một tầng để bắt đầu",
      pickHint: "Chọn một node ở thanh bên trái để bắt đầu học.",
    },
    calc: {
      slo: "SLO mục tiêu (%)",
      days: "Cửa sổ (ngày)",
      reqMil: "Req/ngày (triệu)",
      fail: "Lỗi thực tế (%)",
      cDowntime: "Downtime cho phép",
      cDowntimeSub: (days) => `trong ${days} ngày`,
      cBudget: "Error budget",
      cBudgetSub: "request được phép lỗi",
      cConsumed: "Đã tiêu",
      cConsumedSub: (fail) => `@ ${fail}% lỗi thực tế`,
      cRemaining: "Budget còn lại",
      cRemainingOk: "còn dư địa để ship",
      cRemainingBad: "HẾT → freeze feature, quay về làm ổn định",
      note:
        "Quy tắc SRE: SLO 99.9% ⇒ mỗi tháng chỉ được 'hỏng' 0.1% = error budget. Còn budget → Dev tự do ship nhanh; hết budget → cả team dừng feature, ưu tiên độ tin cậy. Chú ý bậc nhảy: 99.9%→99.99% cắt downtime cho phép đi 10 lần (43m → 4m/tháng) nhưng chi phí kỹ thuật tăng vọt — đừng hứa 'five nines' nếu không có bằng chứng cần.",
    },
    auth: {
      localPill: "Local-only",
      localMsg:
        "Chưa cấu hình Supabase — tiến độ đang lưu trên <b>trình duyệt này</b>. Thêm biến môi trường Supabase để bật đăng nhập + đồng bộ đa thiết bị (xem README).",
      syncedPill: "synced",
      syncingPill: "syncing",
      signedIn: (email) => `Đăng nhập: <b>${email}</b> — tiến độ đồng bộ lên Supabase.`,
      signOut: "Đăng xuất",
      notSignedPill: "Chưa đăng nhập",
      prompt: "Nhập email để nhận magic link đăng nhập — tiến độ sẽ đồng bộ đa thiết bị.",
      send: "Gửi magic link",
      sending: "Đang gửi…",
      sent: (email) => `Đã gửi magic link tới ${email}. Kiểm tra email!`,
      errorPrefix: (msg) => `Lỗi: ${msg}`,
      emailPlaceholder: "ban@email.com",
      syncedLabel: "Đã đồng bộ",
      syncingLabel: "Đang đồng bộ…",
      localLabel: "Local",
    },
  },
  en: {
    eyebrow: "DevOps Skill Tree",
    h1: "Theory & Practice",
    tagline: "Clear each node → unlock related nodes → beat the final Boss.",
    rank: "Rank",
    xp: "XP",
    progress: "Progress",
    reset: "Reset progress",
    resetConfirm: "Clear all cleared progress?",
    resetDone: "Progress reset.",
    searchPlaceholder: "Search nodes…",
    navProgress: (done, total) => `${done}/${total} nodes`,
    statusLocked: "Locked",
    statusAvail: "Available",
    statusCleared: "Cleared",
    needPrefix: "Requires:",
    lockNotice: (list) =>
      `This node is <b>locked</b>. Complete the prerequisites to unlock: <b>${list}</b>.`,
    lockToast: (list) => `🔒 Clear these first: <b>${list}</b>`,
    clearToast: (id, xp, newly) =>
      `✓ Cleared <b>${id}</b> +${xp} XP.` + (newly.length ? ` Unlocked: <b>${newly.join(", ")}</b>` : ""),
    whatIs: "What it is / How it works",
    whenUse: "When to use / not use",
    pros: "Pros",
    cons: "Cons",
    questions: "Self-check questions & suggested answers",
    lab: "Hands-on lab",
    sources: "Further reading (curated)",
    calcHeading: "Error Budget calculator (SLO → downtime & budget)",
    revealShow: "Show suggested answer ▾",
    revealHide: "Hide answer ▴",
    clearBtn: (xp) => `Mark as CLEARED (+${xp} XP)`,
    clearedBtn: "✓ This node is cleared",
    xpEarned: (xp) => `+${xp} XP earned`,
    clearHint: "Read the theory + try the questions first",
    qLabel: (i) => `Q${i}.`,
    prev: "Previous",
    next: "Next",
    home: {
      kicker: "DevOps Engineer · Career Track",
      titleA: "Learn DevOps from ",
      grad: "mindset to production",
      titleB: "",
      p: "A skill-tree path: each node is a knowledge block with theory, edtech scenario questions, a lab and sources. Clear a node to unlock its dependents. Guiding spirit: measure first, automate second, avoid over-engineering.",
      rulesTitle: "3 guiding principles",
      rules: [
        { n: "01", t: "Measure first", d: "Without DORA numbers every tool is just ritual. Baseline before you automate." },
        { n: "02", t: "Automate second", d: "If you do it twice, script it. Save humans for the decisions." },
        { n: "03", t: "Avoid over-engineering", d: "Always ask: when do I NOT need this yet? Buy complexity only for a measured pain." },
      ],
      tiersTitle: "8 tiers — pick one to start",
      pickHint: "Pick a node in the left sidebar to start learning.",
    },
    calc: {
      slo: "SLO target (%)",
      days: "Window (days)",
      reqMil: "Req/day (millions)",
      fail: "Actual error (%)",
      cDowntime: "Allowed downtime",
      cDowntimeSub: (days) => `over ${days} days`,
      cBudget: "Error budget",
      cBudgetSub: "requests allowed to fail",
      cConsumed: "Consumed",
      cConsumedSub: (fail) => `@ ${fail}% actual errors`,
      cRemaining: "Budget left",
      cRemainingOk: "room left to ship",
      cRemainingBad: "EXHAUSTED → freeze features, focus on reliability",
      note:
        "SRE rule: 99.9% SLO ⇒ only 0.1% 'failure' allowed per month = error budget. Budget left → devs ship freely; budget gone → the whole team stops features and prioritizes reliability. Mind the step: 99.9%→99.99% cuts allowed downtime 10× (43m → 4m/month) but engineering cost explodes — don't promise 'five nines' without evidence you need it.",
    },
    auth: {
      localPill: "Local-only",
      localMsg:
        "Supabase not configured — progress is saved in <b>this browser</b>. Add the Supabase env vars to enable login + multi-device sync (see README).",
      syncedPill: "synced",
      syncingPill: "syncing",
      signedIn: (email) => `Signed in: <b>${email}</b> — progress synced to Supabase.`,
      signOut: "Sign out",
      notSignedPill: "Not signed in",
      prompt: "Enter your email to get a magic sign-in link — progress will sync across devices.",
      send: "Send magic link",
      sending: "Sending…",
      sent: (email) => `Magic link sent to ${email}. Check your inbox!`,
      errorPrefix: (msg) => `Error: ${msg}`,
      emailPlaceholder: "you@email.com",
      syncedLabel: "Synced",
      syncingLabel: "Syncing…",
      localLabel: "Local",
    },
  },
};
