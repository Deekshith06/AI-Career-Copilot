import { useMemo, useState, useEffect } from "react";
import Layout from "../components/layout";

const PK = "prometheus_progress";
const read = () => { try { const r = localStorage.getItem(PK); return r ? JSON.parse(r) : { totalXp:0, totalCompleted:0, dailyHistory:{} }; } catch { return { totalXp:0, totalCompleted:0, dailyHistory:{} }; } };
const readTasks = () => { try { const r = localStorage.getItem("prometheus_tasks"); return r ? JSON.parse(r) : []; } catch { return []; } };
const TIERS = [{name:"Bronze",min:1},{name:"Silver",min:6},{name:"Gold",min:11},{name:"Platinum",min:16},{name:"Diamond",min:21},{name:"Crown",min:26},{name:"Ace",min:31},{name:"Conqueror",min:36}];
const getStreak = (h) => { let s=0; const c=new Date(); while(true){ const k=c.toISOString().slice(0,10); if((h[k]||0)>0){s++;c.setDate(c.getDate()-1);}else break; } return s; };

function Progress() {
  const [pd, setPd] = useState(read);
  const [tasks, setTasks] = useState(readTasks);
  useEffect(() => { const fn = () => { setPd(read()); setTasks(readTasks()); }; window.addEventListener("prometheus_progress_update", fn); window.addEventListener("storage", fn); return () => { window.removeEventListener("prometheus_progress_update", fn); window.removeEventListener("storage", fn); }; }, []);

  const totalXp = pd.totalXp || 0, totalCompleted = pd.totalCompleted || 0;
  const totalTasks = tasks.length || totalCompleted, remaining = Math.max(0, totalTasks - totalCompleted);
  const level = Math.floor(totalXp / 100) + 1, xpInLevel = totalXp % 100, xpPct = xpInLevel;
  const tier = useMemo(() => [...TIERS].reverse().find(t => level >= t.min) || TIERS[0], [level]);
  const roman = ["I","II","III","IV","V"], tierSub = ((level - 1) % 5) + 1;
  const tierXpStart = (tier.min - 1) * 100, tierXpEnd = (tier.min + 4) * 100;
  const tierPct = tierXpEnd > tierXpStart ? Math.min(100, ((totalXp - tierXpStart) / (tierXpEnd - tierXpStart)) * 100) : 0;
  const streak = getStreak(pd.dailyHistory || {}), completionPct = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const history = pd.dailyHistory || {};

  // Chart data
  const chartData = useMemo(() => {
    const pts = []; const today = new Date(); let cumXp = 0;
    const allDates = Object.keys(history).sort();
    const startDate = new Date(today); startDate.setDate(today.getDate() - 29);
    allDates.forEach(d => { if (d < startDate.toISOString().slice(0,10)) cumXp += (history[d] || 0) * 10; });
    for (let i = 29; i >= 0; i--) { const dt = new Date(today); dt.setDate(today.getDate() - i); const k = dt.toISOString().slice(0, 10); cumXp += (history[k] || 0) * 10; pts.push({ date: k, label: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }), xp: cumXp }); }
    return pts;
  }, [history]);

  const maxXp = Math.max(...chartData.map(p => p.xp), 1), CW = 800, CH = 240;
  const cpts = chartData.map((p, i) => ({ x: (i / (chartData.length - 1)) * CW, y: CH - (p.xp / maxXp) * (CH - 20) }));
  const pathD = cpts.reduce((a, p, i) => { if (i === 0) return `M${p.x},${p.y}`; const prev = cpts[i-1]; const cx = (prev.x + p.x) / 2; return `${a} C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`; }, "");
  const lastPt = cpts[cpts.length - 1];
  const chartLabels = [chartData[0], chartData[6], chartData[13], chartData[20], chartData[27], chartData[29]].filter(Boolean);

  // Streak days for grid (last 14 days)
  const streakDays = useMemo(() => {
    const days = []; const today = new Date();
    for (let i = 13; i >= 0; i--) { const dt = new Date(today); dt.setDate(today.getDate() - i); const k = dt.toISOString().slice(0,10); days.push({ date: k, label: dt.toLocaleDateString("en-US",{month:"short",day:"numeric"}), active: (history[k]||0) > 0 }); }
    return days;
  }, [history]);

  const circ = 2 * Math.PI * 42, off = circ * (1 - xpPct / 100);
  const S = {
    iconBox: (rgb) => ({ width:40, height:40, borderRadius:12, background:`rgba(${rgb},0.1)`, border:`1px solid rgba(${rgb},0.2)`, display:"flex", alignItems:"center", justifyContent:"center" }),
    badge: (c, bg) => ({ display:"inline-flex", alignItems:"center", gap:4, fontSize:10, fontWeight:700, color:c, padding:"3px 8px", borderRadius:999, background:bg || `${c}15`, border:`1px solid ${c}33` }),
  };

  const stats = [
    { val:totalTasks, label:"Total Tasks", badge:`↑ ${completionPct > 0 ? '12' : '0'}%`, bc:"#22c55e", rgb:"var(--accent-1-rgb)", stroke:"var(--accent-1)", bar:"progress-bar-primary", w:`${Math.min(100,totalTasks*9)}%` },
    { val:totalCompleted, label:"Completed Tasks", badge:`↑ ${completionPct}%`, bc:"#22c55e", rgb:"var(--accent-2-rgb)", stroke:"var(--accent-2)", bar:"progress-bar-accent2", w:`${completionPct}%` },
    { val:remaining, label:"Remaining Tasks", badge:"--", bc:"var(--text-dim)", rgb:"var(--accent-3-rgb)", stroke:"var(--accent-3)", bar:"progress-bar-accent3", w:`${totalTasks > 0 ? Math.round(remaining/totalTasks*100) : 0}%` },
    { val:totalXp, label:"Total XP Gain", badge:`LVL ${level}`, bc:"var(--accent-1)", rgb:"var(--accent-primary-rgb)", stroke:"var(--accent-primary)", bar:"progress-bar-primary", w:`${xpPct}%` },
  ];
  const icons = [
    <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
    <><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></>,
    <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  ];

  return (
    <Layout>
      <div>
        {/* ── Stat Cards ── */}
        <div className="mobile-stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          {stats.map((s,i) => (
            <div key={i} className={`glass-card stagger-${i+1}`} style={{ padding:24, borderRadius:24, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", right:-32, bottom:-32, width:96, height:96, background:`rgba(${s.rgb},0.05)`, filter:"blur(40px)", borderRadius:"50%" }}/>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div style={S.iconBox(s.rgb)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[i]}</svg></div>
                <span style={S.badge(s.bc)}>{s.badge}</span>
              </div>
              <div className="font-display" style={{ fontSize:"2rem", fontWeight:700, color:"var(--text-primary)", marginBottom:4 }}>{s.val}</div>
              <div style={{ fontSize:10, fontWeight:700, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.12em" }}>{s.label}</div>
              <div style={{ marginTop:16, height:4, background:"rgba(255,255,255,0.05)", borderRadius:999, overflow:"hidden" }}>
                <div className={s.bar} style={{ height:"100%", width:s.w, borderRadius:999, transition:"width 1s ease" }}/>
              </div>
            </div>
          ))}
        </div>

        {/* ── Chart + Level ── */}
        <div className="mobile-two-col-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:24, marginBottom:24 }}>
          {/* Progress Chart */}
          <div className="glass-card mobile-chart-card" style={{ padding:32, borderRadius:28, position:"relative", overflow:"hidden" }}>
            <div className="mobile-card-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={S.iconBox("var(--accent-1-rgb)")}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                <div><h3 className="font-display" style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", margin:0 }}>Progress Overview</h3><p style={{ fontSize:12, color:"var(--text-dim)", margin:0 }}>Your cumulative XP over the last 30 days</p></div>
              </div>
              <div style={{ padding:"6px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, fontSize:12, fontWeight:600, color:"var(--text-muted)", display:"flex", alignItems:"center", gap:6 }}>Last 30 Days <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg></div>
            </div>
            <div style={{ position:"relative", height:240 }}>
              <svg viewBox={`0 0 ${CW} ${CH}`} style={{ width:"100%", height:"100%", overflow:"visible" }}>
                <defs>
                  <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="var(--accent-1)"/><stop offset="100%" stopColor="var(--accent-primary)"/></linearGradient>
                  <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent-1)" stopOpacity="0.3"/><stop offset="100%" stopColor="var(--accent-1)" stopOpacity="0"/></linearGradient>
                </defs>
                {[0,.25,.5,.75,1].map((f,i)=><line key={i} x1="0" y1={f*CH} x2={CW} y2={f*CH} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4"/>)}
                <path d={`${pathD} L${CW},${CH} L0,${CH} Z`} fill="url(#fg)" opacity="0.6"/>
                <path d={pathD} fill="none" stroke="url(#lg)" strokeWidth="3" strokeLinecap="round" filter="drop-shadow(0 0 8px rgba(59,130,246,0.8))"/>
                {cpts.filter((_,i)=>i%4===0||i===cpts.length-1).map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--accent-1)" style={{animation:"pulse-glow 2.5s ease infinite"}}/>)}
                <circle cx={lastPt.x} cy={lastPt.y} r="6" fill="var(--accent-1)" stroke="white" strokeWidth="2" filter="drop-shadow(0 0 12px rgba(59,130,246,0.8))"/>
                <rect x={lastPt.x-30} y={lastPt.y-42} width="60" height="26" rx="8" fill="var(--accent-1)" filter="drop-shadow(0 0 10px rgba(59,130,246,0.5))"/>
                <text x={lastPt.x} y={lastPt.y-25} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{totalXp} XP</text>
              </svg>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
              {chartLabels.map((p,i)=><span key={i} style={{ fontSize:10, fontWeight:700, color:i===chartLabels.length-1?"var(--accent-1)":"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.12em" }}>{i===chartLabels.length-1?"Today":p.label}</span>)}
            </div>
          </div>

          {/* Level Card */}
          <div className="glass-card" style={{ padding:32, borderRadius:28, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", textAlign:"center", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-48, right:-48, width:192, height:192, background:"rgba(var(--accent-1-rgb),0.08)", filter:"blur(60px)", borderRadius:"50%" }}/>
            <div style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h3 className="font-display" style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", margin:0 }}>Current Level</h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <div style={{ position:"relative", width:192, height:192 }}>
              {/* Outer decorative ring */}
              <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position:"absolute", inset:0, animation:"rotate-slow 20s linear infinite" }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(var(--accent-1-rgb),0.08)" strokeWidth="2" strokeDasharray="2 8"/>
              </svg>
              {/* Main progress ring */}
              <svg width="100%" height="100%" viewBox="0 0 100 100" className="progress-circle" style={{ position:"absolute", inset:0 }}>
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none"/>
                <circle cx="50" cy="50" r="42" stroke="var(--accent-1)" strokeWidth="6" fill="none" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" filter="drop-shadow(0 0 10px rgba(var(--accent-1-rgb),0.6))"/>
              </svg>
              {/* Center emblem */}
              <div style={{ position:"absolute", inset:"25%", borderRadius:"50%", background:"linear-gradient(135deg, rgba(15,23,42,0.9), rgba(0,0,0,0.9))", border:"1px solid rgba(255,255,255,0.15)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", boxShadow:"inset 0 0 20px rgba(0,0,0,0.5)" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"var(--accent-1)", letterSpacing:"0.2em" }}>LEVEL</div>
                <div className="font-display" style={{ fontSize:"2.5rem", fontWeight:900, color:"var(--text-primary)", lineHeight:1, textShadow:"0 0 10px rgba(var(--accent-1-rgb),0.5)" }}>{level}</div>
              </div>
              {/* Particles */}
              <div style={{ position:"absolute", bottom:-4, left:-4, width:6, height:6, borderRadius:"50%", background:"var(--accent-1)", filter:"blur(2px)", animation:"bob 3s ease infinite" }}/>
              <div style={{ position:"absolute", top:-8, right:16, width:4, height:4, borderRadius:"50%", background:"rgba(var(--accent-1-rgb),0.6)", animation:"pulse-glow 2s ease infinite" }}/>
            </div>
            <div style={{ width:"100%", marginTop:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>
                <span style={{ color:"var(--text-dim)" }}>{xpInLevel} / 100 XP</span>
                <span style={{ color:"var(--accent-1)" }}>{xpPct}%</span>
              </div>
              <div style={{ height:6, background:"rgba(255,255,255,0.05)", borderRadius:999, overflow:"hidden" }}>
                <div className="progress-bar-primary" style={{ height:"100%", width:`${xpPct}%`, borderRadius:999, boxShadow:"0 0 15px rgba(var(--accent-1-rgb),0.5)" }}/>
              </div>
            </div>
          </div>
        </div>

        {/* ── Streak + Tier ── */}
        <div className="mobile-two-col-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:24, marginBottom:24 }}>
          {/* Streak Grid */}
          <div className="glass-card mobile-chart-card" style={{ padding:32, borderRadius:28, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", right:-64, top:-64, width:128, height:128, background:"rgba(var(--accent-1-rgb),0.04)", filter:"blur(48px)", borderRadius:"50%" }}/>
            <div className="mobile-card-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={S.iconBox("var(--accent-1-rgb)")}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg></div>
                <div><h3 className="font-display" style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", margin:0 }}>{streak}-Day Streak</h3><p style={{ fontSize:12, color:"var(--text-dim)", margin:0 }}>Stay consistent to build momentum</p></div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ display:"flex" }}>
                  {[0,1].map(j=><div key={j} style={{ width:24, height:24, borderRadius:"50%", background:"rgba(var(--accent-1-rgb),0.15)", border:"1px solid rgba(var(--accent-1-rgb),0.25)", display:"flex", alignItems:"center", justifyContent:"center", marginLeft:j?-6:0 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" strokeWidth="3"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>)}
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:"var(--accent-1)" }}>{streak} Days Active</span>
              </div>
            </div>
            <div className="mobile-streak-grid" style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:12 }}>
              {streakDays.map((d,i) => (
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ aspectRatio:"1", borderRadius:16, background:d.active?"var(--accent-1)":"rgba(255,255,255,0.04)", border:`1px solid ${d.active?"rgba(var(--accent-1-rgb),0.5)":"rgba(255,255,255,0.06)"}`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:d.active?"0 0 20px rgba(var(--accent-1-rgb),0.2)":"none", transition:"all 0.3s" }}>
                    {d.active ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>}
                  </div>
                  <p style={{ fontSize:9, fontWeight:700, color:d.active?"var(--text-dim)":"rgba(255,255,255,0.15)", textTransform:"uppercase", marginTop:6, letterSpacing:"0.05em" }}>{d.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tier Card */}
          <div className="glass-card" style={{ padding:32, borderRadius:28, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", bottom:-48, right:-48, width:128, height:128, background:"rgba(var(--accent-3-rgb),0.08)", filter:"blur(48px)", borderRadius:"50%" }}/>
            <div style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h3 className="font-display" style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", margin:0 }}>Current Tier</h3>
              <span style={{ fontSize:10, fontWeight:700, color:"var(--accent-3)", padding:"3px 8px", borderRadius:999, background:"rgba(var(--accent-3-rgb),0.1)", border:"1px solid rgba(var(--accent-3-rgb),0.2)", textTransform:"uppercase" }}>{tier.name} {roman[tierSub-1]}</span>
            </div>
            {/* Tier Emblem */}
            <div style={{ position:"relative", width:160, height:160, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position:"absolute", inset:0, animation:"rotate-slow 25s linear infinite", opacity:0.4 }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(var(--accent-3-rgb),0.1)" strokeWidth="2" strokeDasharray="4 4"/>
              </svg>
              <div style={{ width:96, height:96, borderRadius:"50%", background:"linear-gradient(135deg, rgba(15,23,42,0.9), rgba(0,0,0,0.95))", border:"1px solid rgba(var(--accent-3-rgb),0.3)", boxShadow:"0 0 40px rgba(var(--accent-3-rgb),0.1)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", zIndex:1 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter:"drop-shadow(0 0 10px rgba(var(--accent-3-rgb),0.5))" }}>
                  <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
              </div>
            </div>
            <div style={{ width:"100%", marginTop:16 }}>
              <p style={{ fontSize:12, color:"var(--text-dim)", textAlign:"center", marginBottom:12 }}>Unlock exclusive perks as you climb higher.</p>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>
                <span style={{ color:"var(--text-dim)" }}>Tier XP Progress</span>
                <span style={{ color:"var(--accent-3)" }}>{totalXp} / {tierXpEnd} XP</span>
              </div>
              <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:999, overflow:"hidden" }}>
                <div className="progress-bar-accent3" style={{ height:"100%", width:`${Math.round(tierPct)}%`, borderRadius:999 }}/>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quote ── */}
        <div className="glass-card mobile-quote-card" style={{ borderRadius:16, padding:"20px 32px", display:"flex", alignItems:"center", gap:16, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", left:0, top:0, width:3, height:"100%", background:"rgba(var(--accent-1-rgb),0.4)" }}/>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(var(--accent-1-rgb),0.3)" strokeWidth="2" style={{ flexShrink:0, transform:"rotate(180deg)" }}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>
          <p style={{ flex:1, fontSize:14, color:"var(--text-secondary)", fontStyle:"italic", fontWeight:500, margin:0 }}>"Small daily improvements lead to stunning results."</p>
          <span style={{ fontSize:11, fontWeight:700, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.12em", whiteSpace:"nowrap" }}>— Robin Sharma</span>
        </div>
      </div>
      <style>{`@keyframes rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
}
export default Progress;
