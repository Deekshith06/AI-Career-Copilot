import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import Layout from "../components/layout";
import API_BASE_URL from "../config/api";

const TASKS_KEY = "prometheus_tasks";
const PROGRESS_KEY = "prometheus_progress";
const starterTasks = [
  { id: 1, title: "Translate copied countermeasures into 5 concrete weekly actions.", completed: false, rewarded: false },
  { id: 2, title: "Generate one portfolio task from your highest-risk career gap.", completed: false, rewarded: false },
  { id: 3, title: "Break your next upskilling sprint into 30-minute focus units.", completed: true, rewarded: true },
  { id: 4, title: "Create one measurable output for the task currently in progress.", completed: false, rewarded: false },
];
const defaultProgress = () => ({ totalXp: 10, totalCompleted: 1, dailyHistory: { [new Date().toISOString().slice(0, 10)]: 1 } });
const readLocal = (key, fb) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const writeLocal = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} };
const getToken = () => localStorage.getItem("token") || "";
const syncToServer = async (tasks, progress) => { const t = getToken(); if (!t) return; try { await axios.patch(`${API_BASE_URL}/api/progress`, { tasks, progress }, { headers: { authorization: t }, timeout: 5000 }); } catch {} };

function Tasks() {
  const [tasks, setTasks] = useState(() => readLocal(TASKS_KEY, starterTasks));
  const [progress, setProgress] = useState(() => readLocal(PROGRESS_KEY, defaultProgress()));
  const [taskInput, setTaskInput] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loaded, setLoaded] = useState(false);
  const syncTimer = useRef(null);

  useEffect(() => {
    const token = getToken(); if (!token) { setLoaded(true); return; }
    axios.get(`${API_BASE_URL}/api/progress`, { headers: { authorization: token }, timeout: 6000 }).then(({ data }) => {
      if (Array.isArray(data.tasks) && data.tasks.length > 0) { setTasks(data.tasks); writeLocal(TASKS_KEY, data.tasks); }
      if (data.progress && typeof data.progress.totalXp === "number") { setProgress(data.progress); writeLocal(PROGRESS_KEY, data.progress); window.dispatchEvent(new Event("prometheus_progress_update")); }
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  const scheduleSave = useCallback((nt, np) => { clearTimeout(syncTimer.current); syncTimer.current = setTimeout(() => syncToServer(nt, np), 800); }, []);
  const commitTasks = useCallback((nt, np) => {
    setTasks(nt); writeLocal(TASKS_KEY, nt);
    if (np) { setProgress(np); writeLocal(PROGRESS_KEY, np); window.dispatchEvent(new Event("prometheus_progress_update")); }
    scheduleSave(nt, np ?? progress);
  }, [progress, scheduleSave]);

  const total = tasks.length, done = tasks.filter(t => t.completed).length, pending = total - done;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const addTask = () => { const c = taskInput.trim(); if (!c) return; commitTasks([{ id: Date.now(), title: c, completed: false, rewarded: false }, ...tasks], null); setTaskInput(""); };
  const toggleTask = (id) => {
    let np = null;
    const nt = tasks.map(t => { if (t.id !== id) return t; const nc = !t.completed; if (nc && !t.rewarded) { const today = new Date().toISOString().slice(0, 10); np = { totalXp: (progress.totalXp || 0) + 10, totalCompleted: (progress.totalCompleted || 0) + 1, dailyHistory: { ...(progress.dailyHistory || {}), [today]: ((progress.dailyHistory || {})[today] || 0) + 1 } }; return { ...t, completed: true, rewarded: true }; } return { ...t, completed: nc }; });
    commitTasks(nt, np);
  };
  const removeTask = (id) => commitTasks(tasks.filter(t => t.id !== id), null);
  const filtered = filter === "ALL" ? tasks : filter === "TODO" ? tasks.filter(t => !t.completed) : tasks.filter(t => t.completed);
  const streak = useMemo(() => { let s = 0; const c = new Date(); const h = progress.dailyHistory || {}; while (true) { const k = c.toISOString().slice(0, 10); if ((h[k] || 0) > 0) { s++; c.setDate(c.getDate() - 1); } else break; } return s; }, [progress.dailyHistory]);
  const weekXp = useMemo(() => { let x = 0; const t = new Date(); for (let i = 0; i < 7; i++) { const d = new Date(t); d.setDate(t.getDate() - i); x += ((progress.dailyHistory || {})[d.toISOString().slice(0, 10)] || 0) * 10; } return x; }, [progress.dailyHistory]);
  const suggestions = ["Review system design topics for 30 mins", "Read 20 pages of a career book", "Complete one coding challenge on LeetCode"];

  const S = {
    card: { padding: 28, borderRadius: 24 },
    iconOrb: (rgb) => ({ width: 48, height: 48, borderRadius: 16, background: `rgba(${rgb},0.12)`, border: `1px solid rgba(${rgb},0.2)`, display: "flex", alignItems: "center", justifyContent: "center" }),
    stat: { fontSize: "2.2rem", fontWeight: 900, color: "var(--text-primary)", margin: "6px 0 14px", letterSpacing: "-0.02em" },
    label: { color: "var(--text-muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" },
    bar: { height: 5, background: "rgba(255,255,255,0.04)", borderRadius: 999, overflow: "hidden" },
    badge: (c) => ({ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: c, padding: "3px 10px", borderRadius: 999, background: `${c}15`, border: `1px solid ${c}25` }),
  };

  return (
    <Layout>
      <div style={{ position: "relative" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 className="font-display" style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>Task Management</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Track, organize, and complete your daily objectives.</p>
        </div>

        {/* ── Top Stats ── */}
        <div className="mobile-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 28 }}>
          {[
            { label: "TOTAL TASKS", val: total, rgb: "var(--accent-1-rgb)", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>, trend: `${total}`, color: "var(--accent-1)", pct: 100, barClass: "progress-bar-primary" },
            { label: "COMPLETED", val: done, rgb: "var(--accent-2-rgb)", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, trend: `↑ ${pct}%`, color: "#22c55e", pct: pct, barClass: "progress-bar-accent2" },
            { label: "REMAINING", val: pending, rgb: "var(--accent-3-rgb)", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-3)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, trend: pending > 0 ? `${pending} left` : "Done", color: "var(--accent-3)", pct: total > 0 ? (pending / total) * 100 : 0, barClass: "progress-bar-accent3" },
            { label: "TOTAL XP GAIN", val: done * 10, rgb: "var(--accent-primary-rgb)", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, trend: "LV. " + (Math.floor((progress.totalXp || 0) / 100) + 1), color: "var(--accent-primary)", pct: ((progress.totalXp || 0) % 100), barClass: "progress-bar-primary" },
          ].map((c, i) => (
            <div key={i} className={`glass-card stagger-${i + 1}`} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div className="icon-orb animate-bob" style={S.iconOrb(c.rgb)}>{c.icon}</div>
                <span style={S.badge(c.color)}>{c.trend}</span>
              </div>
              <div style={S.stat}>{c.val}</div>
              <div style={S.label}>{c.label}</div>
              <div style={{ ...S.bar, marginTop: 14 }}><div className={c.barClass} style={{ height: "100%", width: `${Math.min(100, c.pct)}%`, borderRadius: 999, transition: "width 1s ease" }} /></div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="mobile-two-col-grid" style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 24, marginBottom: 28 }}>
          {/* Task List */}
          <div className="glass-card" style={{ borderRadius: 24, overflow: "hidden" }}>
            <div className="mobile-card-header" style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Your Tasks</h2>
                <span style={{ ...S.badge("var(--accent-1)"), fontSize: 9 }}>{pending} ACTIVE</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["ALL", "TODO", "DONE"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 10, fontWeight: 700, color: filter === f ? "var(--accent-1)" : "var(--text-dim)", background: filter === f ? "rgba(var(--accent-1-rgb),0.1)" : "transparent", border: filter === f ? "1px solid rgba(var(--accent-1-rgb),0.2)" : "1px solid transparent", padding: "5px 12px", borderRadius: 8, cursor: "pointer", transition: "all 0.2s" }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ maxHeight: 440, overflowY: "auto" }}>
              {!loaded ? <div style={{ padding: 48, textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>Loading...</div> :
                filtered.length === 0 ? <div style={{ padding: 48, textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>No tasks found.</div> :
                filtered.map(task => (
                  <div className="mobile-task-row" key={task.id} onClick={() => toggleTask(task.id)} style={{ padding: "16px 28px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", transition: "background 0.2s" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 7, border: task.completed ? "none" : "2px solid var(--text-dim)", background: task.completed ? "var(--accent-1)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: task.completed ? "0 0 12px rgba(var(--accent-1-rgb),0.4)" : "none" }}>
                      {task.completed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: task.completed ? "var(--text-dim)" : "var(--text-primary)", textDecoration: task.completed ? "line-through" : "none", margin: 0, lineHeight: 1.5 }}>{task.title}</p>
                    <span style={{ ...S.badge("var(--accent-primary)"), fontSize: 9 }}>+10 XP</span>
                    <button onClick={e => { e.stopPropagation(); removeTask(task.id); }} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: 4, display: "flex", opacity: 0.5 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Create Task */}
            <div className="glass-card bloom-primary" style={{ padding: 28, borderRadius: 24, borderColor: "rgba(var(--accent-1-rgb),0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, position: "relative", zIndex: 1 }}>
                <div className="icon-orb" style={S.iconOrb("var(--accent-1-rgb)")}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg></div>
                <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Create Task</h2>
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <textarea value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addTask(); } }} placeholder="What needs to be accomplished?" className="input-glass" style={{ width: "100%", borderRadius: 16, padding: 16, fontSize: 13, resize: "none", height: 80, outline: "none" }}/>
                <div style={{ display: "flex", gap: 8, margin: "14px 0" }}>
                  <div style={{ flex: 1, padding: "8px 12px", background: "rgba(var(--accent-1-rgb),0.06)", border: "1px solid rgba(var(--accent-1-rgb),0.12)", borderRadius: 12, textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Reward</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: "var(--accent-1)" }}>+10 XP</span>
                  </div>
                  <div style={{ flex: 1, padding: "8px 12px", background: "rgba(var(--accent-3-rgb),0.06)", border: "1px solid rgba(var(--accent-3-rgb),0.12)", borderRadius: 12, textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Priority</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: "var(--accent-3)" }}>Medium</span>
                  </div>
                </div>
                <button onClick={addTask} className="glow-primary" style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, var(--accent-1), var(--accent-primary))", borderRadius: 14, border: "none", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}>+ Create Task</button>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="glass-card" style={{ padding: 24, borderRadius: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ background: "var(--accent-1)", fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 6, color: "#fff", letterSpacing: "0.05em" }}>AI</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Suggestions</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => setTaskInput(s)} style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
                    {s} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M5 12h14M12 5v14"/></svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Quote ── */}
        <div className="glass-card mobile-quote-card" style={{ borderRadius: 20, padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
          <div className="mobile-quote-inner" style={{ display: "flex", gap: 24, flex: 1, alignItems: "center" }}>
            <div className="mobile-quote-stat" style={{ display: "flex", alignItems: "center", gap: 12, borderRight: "1px solid rgba(255,255,255,0.06)", paddingRight: 24 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>
              <div><div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)" }}>{streak}</div><div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Day Streak</div></div>
            </div>
            <div className="mobile-quote-stat" style={{ display: "flex", alignItems: "center", gap: 12, borderRight: "1px solid rgba(255,255,255,0.06)", paddingRight: 24 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <div><div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)" }}>{weekXp}</div><div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Weekly XP</div></div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", fontStyle: "italic" }}>"Small daily improvements lead to stunning results."</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", marginLeft: 12 }}>— Robin Sharma</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
export default Tasks;
