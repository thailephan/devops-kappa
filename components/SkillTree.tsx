"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type SkillNode, type Lang } from "@/lib/content";
import { getData, UI, type UIStrings } from "@/lib/i18n";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useProgress } from "@/lib/useProgress";

const LANG_KEY = "devops-lang";

// Màu theo tầng (phong cách fe-skilltree: mỗi nhóm một màu).
const TIER_COLORS: { c: string; s: string }[] = [
  { c: "#6366f1", s: "#eef0fe" }, // 0 indigo
  { c: "#0ea5e9", s: "#e6f6fe" }, // 1 sky
  { c: "#10b981", s: "#e7faf1" }, // 2 emerald
  { c: "#f59e0b", s: "#fef3e2" }, // 3 amber
  { c: "#ec4899", s: "#fde8f3" }, // 4 pink
  { c: "#8b5cf6", s: "#f1eafe" }, // 5 violet
  { c: "#14b8a6", s: "#e4f8f5" }, // 6 teal
  { c: "#ef4444", s: "#fdeaea" }, // 7 red
];
const tc = (tier: number) => TIER_COLORS[tier] ?? TIER_COLORS[0];

function pcVars(tier: number): React.CSSProperties {
  const { c, s } = tc(tier);
  return { ["--pc"]: c, ["--pc-soft"]: s } as React.CSSProperties;
}

function rankFor(xp: number, ranks: [number, string][]): [number, string] {
  let r = ranks[0];
  for (const x of ranks) if (xp >= x[0]) r = x;
  return r;
}

/* ---------- Icons ---------- */
const CheckSvg = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const Chev = () => (
  <svg className="chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const BLOCK_ICONS: Record<string, React.ReactNode> = {
  theory: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /></svg>,
  when: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  proscons: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M5 8l7-4 7 4M4 8l3 7H1zM17 15l3-7 3 7z" /></svg>,
  q: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" /><path d="M12 17h.01" /></svg>,
  lab: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" /></svg>,
  src: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" /></svg>,
  calc: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v4M8 19h4" /></svg>,
};

function BlockHead({ ico, title, tier }: { ico: string; title: string; tier: number }) {
  return (
    <div className="block-head">
      <span className="block-ico" style={pcVars(tier)}>{BLOCK_ICONS[ico]}</span>
      <h3>{title}</h3>
    </div>
  );
}

export default function SkillTree() {
  const { cleared, clearNode, reset, user, status, signIn, signOut } = useProgress();
  const [lang, setLang] = useState<Lang>("vi");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [openTiers, setOpenTiers] = useState<Record<number, boolean>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<{ html: string; show: boolean }>({ html: "", show: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY) as Lang | null;
      if (saved === "vi" || saved === "en") setLang(saved);
    } catch {}
  }, []);
  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
  }, []);

  const ui = UI[lang];
  const { nodes: NODES, tiers: TIERS, ranks: RANKS } = useMemo(() => getData(lang), [lang]);
  const nodeById = useMemo(() => new Map(NODES.map((n) => [n.id, n])), [NODES]);

  // Mặc định mở tất cả tầng lần đầu.
  useEffect(() => {
    setOpenTiers((prev) => {
      if (Object.keys(prev).length) return prev;
      const o: Record<number, boolean> = {};
      TIERS.forEach((t) => (o[t.id] = true));
      return o;
    });
  }, [TIERS]);

  useEffect(() => { setRevealed({}); if (contentRef.current) contentRef.current.scrollTop = 0; window.scrollTo(0, 0); }, [selectedId]);

  const showToast = useCallback((html: string) => {
    setToast({ html, show: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3600);
  }, []);

  const isCleared = useCallback((id: string) => cleared.has(id), [cleared]);
  const isAvailable = useCallback((n: SkillNode) => n.prereq.every((p) => cleared.has(p)), [cleared]);
  const missing = useCallback((n: SkillNode) => n.prereq.filter((p) => !cleared.has(p)), [cleared]);

  const xp = useMemo(() => NODES.filter((n) => cleared.has(n.id)).reduce((s, n) => s + n.xp, 0), [cleared, NODES]);
  const doneCount = useMemo(() => NODES.filter((n) => cleared.has(n.id)).length, [cleared, NODES]);
  const rank = rankFor(xp, RANKS);
  const rankIdx = RANKS.findIndex((r) => r[1] === rank[1]);
  const nextRank = RANKS[rankIdx + 1];
  const barPct = nextRank ? Math.min(100, Math.round(((xp - rank[0]) / (nextRank[0] - rank[0])) * 100)) : 100;

  const selected = selectedId ? nodeById.get(selectedId) ?? null : null;
  const selIdx = selected ? NODES.findIndex((n) => n.id === selected.id) : -1;
  const prevNode = selIdx > 0 ? NODES[selIdx - 1] : null;
  const nextNode = selIdx >= 0 && selIdx < NODES.length - 1 ? NODES[selIdx + 1] : null;

  const q = search.trim().toLowerCase();
  const matches = (n: SkillNode) => !q || n.id.toLowerCase().includes(q) || n.title.toLowerCase().includes(q) || n.sum.toLowerCase().includes(q);

  const openNode = (n: SkillNode) => {
    if (!isAvailable(n) && !isCleared(n.id)) {
      showToast(ui.lockToast(missing(n).join(", ")));
    }
    setSelectedId(n.id);
    setNavOpen(false);
  };

  const onClear = (n: SkillNode) => {
    if (cleared.has(n.id)) return;
    const before = new Set(NODES.filter((x) => isAvailable(x) && !isCleared(x.id)).map((x) => x.id));
    clearNode(n.id);
    const nextCleared = new Set(cleared); nextCleared.add(n.id);
    const newly = NODES.filter((x) => x.prereq.every((p) => nextCleared.has(p)) && !nextCleared.has(x.id)).map((x) => x.id).filter((id) => !before.has(id));
    showToast(ui.clearToast(n.id, n.xp, newly));
  };

  const toggleTier = (id: number) => setOpenTiers((o) => ({ ...o, [id]: !o[id] }));

  return (
    <div className={`app${navOpen ? " nav-open" : ""}`}>
      <div className="backdrop" onClick={() => setNavOpen(false)} />

      <aside className="sidebar">
        <div className="brand">
          <div className="kicker">{ui.eyebrow}</div>
          <h1 onClick={() => setSelectedId(null)}>{ui.h1}</h1>
          <div className="progress-wrap">
            <div className="progress-row"><span>{ui.progress}</span><b>{ui.navProgress(doneCount, NODES.length)}</b></div>
            <div className="bar"><i style={{ width: `${(doneCount / NODES.length) * 100}%` }} /></div>
            <div className="rankline">Lv {rankIdx + 1} · <b>{rank[1]}</b> · {xp} XP{nextRank ? ` (${barPct}%→Lv ${rankIdx + 2})` : ""}</div>
          </div>
        </div>
        <div className="search">
          <input type="search" placeholder={ui.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} aria-label={ui.searchPlaceholder} />
        </div>
        <nav className="nav">
          {TIERS.map((T) => {
            const nodes = NODES.filter((n) => n.tier === T.id && matches(n));
            if (!nodes.length) return null;
            const done = NODES.filter((n) => n.tier === T.id && cleared.has(n.id)).length;
            const total = NODES.filter((n) => n.tier === T.id).length;
            const isOpen = q ? true : openTiers[T.id];
            return (
              <div className={`tier-group${isOpen ? " open" : ""}`} key={T.id} style={pcVars(T.id)}>
                <button className="tier-btn" onClick={() => toggleTier(T.id)}>
                  <span className="dot" />
                  <span className="pt">{T.t}</span>
                  <span className="pn">{done}/{total}</span>
                  <Chev />
                </button>
                <div className="lessons">
                  {nodes.map((n) => {
                    const avail = isAvailable(n);
                    const cl = isCleared(n.id);
                    const locked = !avail && !cl;
                    return (
                      <button
                        key={n.id}
                        className={`lesson-btn${selectedId === n.id ? " active" : ""}${cl ? " done" : ""}${locked ? " locked" : ""}${n.boss ? " boss" : ""}`}
                        onClick={() => openNode(n)}
                        title={locked ? `${ui.needPrefix} ${missing(n).join(", ")}` : n.title}
                      >
                        <span className="ln">{n.id}</span>
                        <span className="lt">{n.title}</span>
                        <span className="check">{locked ? "🔒" : <CheckSvg />}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <div className="langtoggle" role="group" aria-label="Language">
            <button className={lang === "vi" ? "on" : ""} onClick={() => changeLang("vi")}>VI</button>
            <button className={lang === "en" ? "on" : ""} onClick={() => changeLang("en")}>EN</button>
          </div>
          <button className="btn" onClick={() => { if (confirm(ui.resetConfirm)) { reset(); showToast(ui.resetDone); } }}>{ui.reset}</button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <button className="hamburger" aria-label="Menu" onClick={() => setNavOpen((v) => !v)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          <span className="tt">{selected ? selected.title : ui.h1}</span>
        </div>

        <div className="content fade" key={selectedId ?? "home"} ref={contentRef}>
          {selected ? (
            <Lesson
              node={selected}
              locked={!isAvailable(selected) && !isCleared(selected.id)}
              cleared={isCleared(selected.id)}
              missing={missing(selected)}
              tierName={TIERS.find((t) => t.id === selected.tier)?.t ?? ""}
              revealed={revealed}
              setRevealed={setRevealed}
              onClear={onClear}
              prevNode={prevNode}
              nextNode={nextNode}
              onNav={(n) => setSelectedId(n.id)}
              ui={ui}
            />
          ) : (
            <Home ui={ui} tiers={TIERS} nodes={NODES} cleared={cleared} onPickTier={(tid) => {
              const first = NODES.find((n) => n.tier === tid);
              if (first) openNode(first);
            }} configured={isSupabaseConfigured} email={user?.email ?? null} status={status} signIn={signIn} signOut={signOut} />
          )}
        </div>
      </div>

      <div className={`toast${toast.show ? " show" : ""}`} dangerouslySetInnerHTML={{ __html: toast.html }} />
    </div>
  );
}

/* ---------- Home ---------- */
function Home({ ui, tiers, nodes, cleared, onPickTier, configured, email, status, signIn, signOut }: {
  ui: UIStrings;
  tiers: { id: number; n: string; t: string; sub: string }[];
  nodes: SkillNode[];
  cleared: Set<string>;
  onPickTier: (tid: number) => void;
  configured: boolean;
  email: string | null;
  status: "local" | "syncing" | "synced";
  signIn: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}) {
  return (
    <>
      <div className="hero">
        <div className="hero-kicker">{ui.home.kicker}</div>
        <h2>{ui.home.titleA}<span className="grad">{ui.home.grad}</span>{ui.home.titleB}</h2>
        <p>{ui.home.p}</p>
      </div>

      <div className="rules">
        {ui.home.rules.map((r) => (
          <div className="rule" key={r.n}>
            <div className="n">{r.n}</div>
            <div className="t">{r.t}</div>
            <div className="d">{r.d}</div>
          </div>
        ))}
      </div>

      <div className="section-title">{ui.home.tiersTitle}</div>
      <div className="phase-grid">
        {tiers.map((T) => {
          const total = nodes.filter((n) => n.tier === T.id).length;
          const done = nodes.filter((n) => n.tier === T.id && cleared.has(n.id)).length;
          return (
            <div className="pcard" key={T.id} style={pcVars(T.id)} onClick={() => onPickTier(T.id)}>
              <div className="pnum">{T.n}</div>
              <h3>{T.t}</h3>
              <div className="sub">{T.sub}</div>
              <div className="cnt">{done}/{total} node</div>
            </div>
          );
        })}
      </div>

      <AuthBar configured={configured} email={email} status={status} onSignIn={signIn} onSignOut={signOut} t={ui.auth} />
      <p className="hero-kicker" style={{ marginTop: 22 }}>{ui.home.pickHint}</p>
    </>
  );
}

/* ---------- Lesson ---------- */
function Lesson({ node, locked, cleared, missing, tierName, revealed, setRevealed, onClear, prevNode, nextNode, onNav, ui }: {
  node: SkillNode;
  locked: boolean;
  cleared: boolean;
  missing: string[];
  tierName: string;
  revealed: Record<number, boolean>;
  setRevealed: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  onClear: (n: SkillNode) => void;
  prevNode: SkillNode | null;
  nextNode: SkillNode | null;
  onNav: (n: SkillNode) => void;
  ui: UIStrings;
}) {
  return (
    <div style={pcVars(node.tier)}>
      <span className="lh-kicker"><span className="dot" />{node.id} · {tierName}</span>
      <h2 className="lh-title">{node.title}</h2>
      <p className="lh-sum">{node.sum}</p>

      {locked ? (
        <section className="block">
          <div className="locknote" dangerouslySetInnerHTML={{ __html: ui.lockNotice(missing.join(", ")) }} />
        </section>
      ) : (
        <>
          <section className="block">
            <BlockHead ico="theory" title={ui.whatIs} tier={node.tier} />
            <div className="prose" dangerouslySetInnerHTML={{ __html: node.theory }} />
          </section>

          <section className="block">
            <BlockHead ico="when" title={ui.whenUse} tier={node.tier} />
            <div className="prose whenbox" dangerouslySetInnerHTML={{ __html: node.whenUse }} />
          </section>

          <section className="block">
            <BlockHead ico="proscons" title={`${ui.pros} / ${ui.cons}`} tier={node.tier} />
            <div className="prosbox">
              <div className="pro">
                <h5>{ui.pros}</h5>
                <ul>{node.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
              <div className="con">
                <h5>{ui.cons}</h5>
                <ul>{node.cons.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            </div>
          </section>

          {node.calc && (
            <section className="block">
              <BlockHead ico="calc" title={ui.calcHeading} tier={node.tier} />
              <Calculator ui={ui} />
            </section>
          )}

          <section className="block">
            <BlockHead ico="q" title={ui.questions} tier={node.tier} />
            {node.questions.map((qa, i) => (
              <div className="q" key={i}>
                <p className="qq"><b>{ui.qLabel(i + 1)}</b> {qa.q}</p>
                <button className="reveal" onClick={() => setRevealed((o) => ({ ...o, [i]: !o[i] }))}>
                  {revealed[i] ? ui.revealHide : ui.revealShow}
                </button>
                {revealed[i] && <div className="ans" dangerouslySetInnerHTML={{ __html: qa.a }} />}
              </div>
            ))}
          </section>

          <section className="block">
            <BlockHead ico="lab" title={ui.lab} tier={node.tier} />
            <div className="lab" dangerouslySetInnerHTML={{ __html: node.lab }} />
          </section>

          <section className="block">
            <BlockHead ico="src" title={ui.sources} tier={node.tier} />
            <div className="links">
              {node.links.map((l, i) => (
                <a key={i} href={`https://${l.u}`} target="_blank" rel="noopener noreferrer">
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t">{l.t}</span>
                  <span className="u">{l.u.split("/")[0]}</span>
                </a>
              ))}
            </div>
          </section>

          <div className={`mark-done${cleared ? " is-done" : ""}`}>
            {cleared ? (
              <>
                <span className="doneicon"><CheckSvg /></span>
                <span className="hint"><b>{ui.clearedBtn}</b> — {ui.xpEarned(node.xp)}</span>
              </>
            ) : (
              <>
                <button onClick={() => onClear(node)}>{ui.clearBtn(node.xp)}</button>
                <span className="hint">{ui.clearHint}</span>
              </>
            )}
          </div>
        </>
      )}

      <div className="lesson-nav">
        <button className={prevNode ? "" : "hide"} onClick={() => prevNode && onNav(prevNode)}>
          <div className="dir">← {ui.prev}</div>
          <div className="nm">{prevNode?.title ?? ""}</div>
        </button>
        <button className={`next${nextNode ? "" : " hide"}`} onClick={() => nextNode && onNav(nextNode)}>
          <div className="dir">{ui.next} →</div>
          <div className="nm">{nextNode?.title ?? ""}</div>
        </button>
      </div>
    </div>
  );
}

/* ---------- Auth bar ---------- */
function AuthBar({ configured, email, status, onSignIn, onSignOut, t }: {
  configured: boolean;
  email: string | null;
  status: "local" | "syncing" | "synced";
  onSignIn: (email: string) => Promise<{ error: string | null }>;
  onSignOut: () => Promise<void>;
  t: UIStrings["auth"];
}) {
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (!configured) {
    return (
      <div className="authbar">
        <span className="pill local">{t.localPill}</span>
        <span className="msg" dangerouslySetInnerHTML={{ __html: t.localMsg }} />
      </div>
    );
  }
  if (email) {
    const pill = status === "synced" ? "synced" : status === "syncing" ? "syncing" : "local";
    const label = status === "synced" ? t.syncedLabel : status === "syncing" ? t.syncingLabel : t.localLabel;
    return (
      <div className="authbar">
        <span className={`pill ${pill}`}>{label}</span>
        <span className="msg" dangerouslySetInnerHTML={{ __html: t.signedIn(email) }} />
        <form onSubmit={(e) => { e.preventDefault(); void onSignOut(); }}>
          <button className="btn" type="submit">{t.signOut}</button>
        </form>
      </div>
    );
  }
  return (
    <div className="authbar">
      <span className="pill local">{t.notSignedPill}</span>
      <span className="msg">{msg ?? t.prompt}</span>
      <form onSubmit={async (e) => { e.preventDefault(); if (!value) return; setSending(true); const { error } = await onSignIn(value); setSending(false); setMsg(error ? t.errorPrefix(error) : t.sent(value)); }}>
        <input type="email" required placeholder={t.emailPlaceholder} value={value} onChange={(e) => setValue(e.target.value)} />
        <button className="btn" type="submit" disabled={sending}>{sending ? t.sending : t.send}</button>
      </form>
    </div>
  );
}

/* ---------- Error-budget calculator ---------- */
function fmt(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.round(n).toString();
}

function Calculator({ ui }: { ui: UIStrings }) {
  const c = ui.calc;
  const [slo, setSlo] = useState(99.9);
  const [days, setDays] = useState(30);
  const [reqMil, setReqMil] = useState(50);
  const [fail, setFail] = useState(0.05);

  const totalReq = reqMil * 1e6 * days;
  const budget = ((100 - slo) / 100) * totalReq;
  const consumed = (fail / 100) * totalReq;
  const remainingPct = budget > 0 ? Math.max(0, ((budget - consumed) / budget) * 100) : 0;
  const downtimeMin = ((100 - slo) / 100) * days * 24 * 60;

  const cells: [string, number | string, string][] = [
    [c.cDowntime, downtimeMin >= 60 ? (downtimeMin / 60).toFixed(1) + "h" : Math.round(downtimeMin) + "m", c.cDowntimeSub(days)],
    [c.cBudget, fmt(budget), c.cBudgetSub],
    [c.cConsumed, fmt(consumed), c.cConsumedSub(fail)],
    [c.cRemaining, remainingPct.toFixed(0) + "%", remainingPct <= 0 ? c.cRemainingBad : c.cRemainingOk],
  ];

  return (
    <div className="calc">
      <div className="row">
        <label>{c.slo}<input type="number" step="0.01" min={1} max={100} value={slo} onChange={(e) => setSlo(+e.target.value)} /></label>
        <label>{c.days}<input type="number" min={1} value={days} onChange={(e) => setDays(+e.target.value)} /></label>
        <label>{c.reqMil}<input type="number" min={0} value={reqMil} onChange={(e) => setReqMil(+e.target.value)} /></label>
        <label>{c.fail}<input type="number" step="0.01" min={0} value={fail} onChange={(e) => setFail(+e.target.value)} /></label>
      </div>
      <div className="out">
        {cells.map(([l, v, s]) => (
          <div className="cell" key={l}>
            <div className="cl">{l}</div>
            <div className="cv">{v}</div>
            <div className="cs">{s}</div>
          </div>
        ))}
      </div>
      <p className="note">{c.note}</p>
    </div>
  );
}
