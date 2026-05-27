import { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import "../pages/theme-dynamic.css";

const fmt = (email) => {
  const v = String(email||"").trim().toLowerCase();
  if(!v) return "Operator";
  return v.split("@")[0].replace(/[._-]+/g," ").split(" ").filter(Boolean).map(p=>p.charAt(0).toUpperCase()+p.slice(1)).join(" ");
};

const themes = {
  purple:{primary:'#a855f7',primary_rgb:'168,85,247',a1:'#6366f1',a1_rgb:'99,102,241',a2:'#22d3ee',a2_rgb:'34,211,238',a3:'#f97316',a3_rgb:'249,115,22',a4:'#ec4899',a4_rgb:'236,72,153'},
  navy:{primary:'#3b82f6',primary_rgb:'59,130,246',a1:'#2563eb',a1_rgb:'37,99,235',a2:'#22d3ee',a2_rgb:'34,211,238',a3:'#f59e0b',a3_rgb:'245,158,11',a4:'#f472b6',a4_rgb:'244,114,182'},
  blue:{primary:'#3b82f6',primary_rgb:'59,130,246',a1:'#3b82f6',a1_rgb:'59,130,246',a2:'#10b981',a2_rgb:'16,185,129',a3:'#f97316',a3_rgb:'249,115,22',a4:'#8b5cf6',a4_rgb:'139,92,246'},
  emerald:{primary:'#10b981',primary_rgb:'16,185,129',a1:'#10b981',a1_rgb:'16,185,129',a2:'#3b82f6',a2_rgb:'59,130,246',a3:'#f59e0b',a3_rgb:'245,158,11',a4:'#8b5cf6',a4_rgb:'139,92,246'},
  rose:{primary:'#ec4899',primary_rgb:'236,72,153',a1:'#ec4899',a1_rgb:'236,72,153',a2:'#10b981',a2_rgb:'16,185,129',a3:'#f59e0b',a3_rgb:'245,158,11',a4:'#22d3ee',a4_rgb:'34,211,238'},
  orange:{primary:'#f97316',primary_rgb:'249,115,22',a1:'#f97316',a1_rgb:'249,115,22',a2:'#10b981',a2_rgb:'16,185,129',a3:'#ec4899',a3_rgb:'236,72,153',a4:'#8b5cf6',a4_rgb:'139,92,246'},
  light:{primary:'#6366f1',primary_rgb:'99,102,241',a1:'#6366f1',a1_rgb:'99,102,241',a2:'#0891b2',a2_rgb:'8,145,178',a3:'#ea580c',a3_rgb:'234,88,12',a4:'#db2777',a4_rgb:'219,39,119'},
};

const themeLabels = { purple:"Purple Cosmos", navy:"Navy Blue", blue:"Ocean Blue", emerald:"Emerald", rose:"Rose Pink", orange:"Sunset", light:"☀ Light" };

function Layout({ children }) {
  const [pd, setPd] = useState({ totalXp:0 });
  const [acct, setAcct] = useState({ email:"", profileImage:"" });
  const [showTheme, setShowTheme] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const nav = useNavigate();

  const token = localStorage.getItem("token")||"";
  const fallback = localStorage.getItem("prometheus_username")||"";
  const name = fmt(acct.email||fallback);
  const totalXp = pd.totalXp||0;
  const level = Math.floor(totalXp/100)+1;
  const TIERS=["BRONZE","SILVER","GOLD","PLATINUM","DIAMOND","CROWN","ACE","CONQUEROR"];
  const tierName=TIERS[Math.min(Math.floor((level-1)/5),TIERS.length-1)];
  const roman=["I","II","III","IV","V"];
  const tierSub=((level-1)%5)+1;

  useEffect(()=>{
    if(token){
      axios.get(`${API_BASE_URL}/api/profile`,{headers:{authorization:token}}).then(r=>{
        const u=r.data?.user||{};
        setAcct({email:u.email||fallback,profileImage:u.profileImage||""});
        if(u.email) localStorage.setItem("prometheus_username",u.email);
      }).catch(()=>setAcct({email:fallback,profileImage:""}));
      axios.get(`${API_BASE_URL}/api/progress`,{headers:{authorization:token},timeout:6000}).then(({data})=>{
        if(data.progress&&typeof data.progress.totalXp==="number"){
          setPd(data.progress);
          try{localStorage.setItem("prometheus_progress",JSON.stringify(data.progress))}catch{}
        }
      }).catch(()=>{try{const r=localStorage.getItem("prometheus_progress");if(r)setPd(JSON.parse(r))}catch{}});
    }
    const saved=localStorage.getItem('prometheus-theme');
    applyTheme(saved&&themes[saved]?saved:'purple');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const applyTheme=(k)=>{
    const t=themes[k]; if(!t) return;
    const r=document.documentElement;
    r.style.setProperty('--accent-primary',t.primary);
    r.style.setProperty('--accent-primary-rgb',t.primary_rgb);
    r.style.setProperty('--accent-1',t.a1); r.style.setProperty('--accent-1-rgb',t.a1_rgb);
    r.style.setProperty('--accent-2',t.a2); r.style.setProperty('--accent-2-rgb',t.a2_rgb);
    r.style.setProperty('--accent-3',t.a3); r.style.setProperty('--accent-3-rgb',t.a3_rgb);
    r.style.setProperty('--accent-4',t.a4); r.style.setProperty('--accent-4-rgb',t.a4_rgb);
    if(k==='light'){
      r.style.setProperty('--bg-body','#e3e8f0');
      r.style.setProperty('--bg-main-end','227,232,240');
      r.style.setProperty('--bg-sidebar','#e3e8f0');
      r.style.setProperty('--bg-card','#e3e8f0');
      r.style.setProperty('--bg-card-border','transparent');
      r.style.setProperty('--bg-input','#dce1e9');
      r.style.setProperty('--bg-elevated','#dce1e9');
      r.style.setProperty('--border-subtle','rgba(0,0,0,0.04)');
      r.style.setProperty('--text-primary','#0f1119');
      r.style.setProperty('--text-secondary','#1a1f33');
      r.style.setProperty('--text-muted','#374057');
      r.style.setProperty('--text-dim','#535d73');
      r.style.setProperty('--dot-grid','rgba(99,102,241,0.04)');
      r.style.setProperty('--scrollbar-track','#d5dbe5');
      r.style.setProperty('--scrollbar-thumb','#b0b8c8');
      r.style.setProperty('--card-shadow','8px 8px 16px #c0c5cf, -8px -8px 16px #ffffff');
      r.style.setProperty('--card-shadow-hover','10px 10px 20px #b8bdc7, -10px -10px 20px #ffffff');
      r.style.setProperty('--input-shadow','inset 4px 4px 8px #c0c5cf, inset -4px -4px 8px #ffffff');
      document.body.classList.add('theme-light');
    } else {
      r.style.setProperty('--bg-body','#10172e');
      r.style.setProperty('--bg-main-end','34,48,91');
      r.style.setProperty('--bg-sidebar','rgba(13,14,26,0.7)');
      r.style.setProperty('--bg-card','rgba(30,33,73,0.75)');
      r.style.setProperty('--bg-card-border','rgba(255,255,255,0.07)');
      r.style.setProperty('--bg-input','rgba(0,0,0,0.3)');
      r.style.setProperty('--bg-elevated','rgba(17,24,39,0.4)');
      r.style.setProperty('--border-subtle','rgba(255,255,255,0.05)');
      r.style.setProperty('--text-primary','#ffffff');
      r.style.setProperty('--text-secondary','#e2e8f0');
      r.style.setProperty('--text-muted','#9ca3af');
      r.style.setProperty('--text-dim','#6b7280');
      r.style.setProperty('--dot-grid','rgba(19,30,104,0.03)');
      r.style.setProperty('--scrollbar-track','#05060d');
      r.style.setProperty('--scrollbar-thumb','#1e1e30');
      r.style.setProperty('--card-shadow','0 10px 30px -10px rgba(0,0,0,0.5)');
      r.style.setProperty('--card-shadow-hover','0 15px 40px -10px rgba(0,0,0,0.6)');
      r.style.setProperty('--input-shadow','none');
      document.body.classList.remove('theme-light');
    }
    localStorage.setItem('prometheus-theme',k); setShowTheme(false);
  };

  const greeting=()=>{const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening";};
  const closeMobileSidebar=()=>setShowMobileSidebar(false);

  return (
    <div className="app-workspace flex min-h-screen p-4 lg:p-6 gap-6 relative" style={{background: "var(--bg-body)", color: "var(--text-primary)", zIndex: 1, overflowX: "hidden", fontFamily: "'Satoshi', sans-serif"}}>
      {/* Cosmic background elements */}
      <div className="cosmic-bg" style={{ position: "fixed", inset: 0, zIndex: -2, background: "radial-gradient(circle at 20% 30%, rgba(var(--accent-1-rgb), 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(var(--accent-1-rgb), 0.1) 0%, transparent 50%), linear-gradient(180deg, var(--bg-body) 0%, rgb(var(--bg-main-end)) 100%)" }} />
      <div className="grid-overlay" style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="star" style={{ width: 4, height: 4, top: "10%", left: "20%" }} />
      <div className="star" style={{ width: 2, height: 2, top: "40%", left: "80%" }} />
      <div className="star" style={{ width: 4, height: 4, top: "70%", left: "15%" }} />
      <div className="star" style={{ width: 2, height: 2, top: "25%", left: "60%" }} />

      {showMobileSidebar && <button className="mobile-sidebar-backdrop" aria-label="Close navigation" onClick={closeMobileSidebar} />}

      {/* Sidebar */}
      <aside className={`mobile-sidebar ${showMobileSidebar ? "is-open" : ""} hidden lg:flex flex-col w-72 glass-card p-6 relative overflow-hidden`} style={{ height: "calc(100vh - 3rem)", position: "sticky", top: 24, borderRadius: 24, flexShrink: 0 }}>
        <button className="mobile-sidebar-close" type="button" aria-label="Close navigation" onClick={closeMobileSidebar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <div style={{ position: "absolute", top: -96, left: -96, width: 192, height: 192, background: "rgba(var(--accent-1-rgb), 0.1)", filter: "blur(80px)", borderRadius: "50%" }} />
        
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(var(--accent-1-rgb),0.4)]" style={{ background: "var(--accent-1)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <span className="text-xl font-bold tracking-tight uppercase font-display" style={{ color: "var(--text-primary)" }}>Prometheus</span>
        </div>

        <div className="flex-1 space-y-8">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest px-4 mb-4" style={{ color: "var(--text-dim)" }}>Core</p>
            <nav className="space-y-2 px-1">
              <NavLink to="/progress" onClick={closeMobileSidebar} className={({isActive})=>isActive?"nav-item-active group transition-all duration-300":"flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group"} style={({isActive})=>isActive?{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderRadius:12,background:"rgba(var(--accent-1-rgb),0.12)",border:"1px solid rgba(var(--accent-1-rgb),0.5)",boxShadow:"0 0 25px rgba(var(--accent-1-rgb),0.25), inset 0 0 10px rgba(var(--accent-1-rgb),0.1)",color:"var(--accent-1)",fontWeight:600}:{color:"var(--text-muted)",fontWeight:500}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/tasks" onClick={closeMobileSidebar} className={({isActive})=>isActive?"nav-item-active group transition-all duration-300":"flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group"} style={({isActive})=>isActive?{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderRadius:12,background:"rgba(var(--accent-1-rgb),0.12)",border:"1px solid rgba(var(--accent-1-rgb),0.5)",boxShadow:"0 0 25px rgba(var(--accent-1-rgb),0.25), inset 0 0 10px rgba(var(--accent-1-rgb),0.1)",color:"var(--accent-1)",fontWeight:600}:{color:"var(--text-muted)",fontWeight:500}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>Tasks</span>
              </NavLink>
              <NavLink to="/risk-management" onClick={closeMobileSidebar} className={({isActive})=>isActive?"nav-item-active group transition-all duration-300":"flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group"} style={({isActive})=>isActive?{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderRadius:12,background:"rgba(var(--accent-1-rgb),0.12)",border:"1px solid rgba(var(--accent-1-rgb),0.5)",boxShadow:"0 0 25px rgba(var(--accent-1-rgb),0.25), inset 0 0 10px rgba(var(--accent-1-rgb),0.1)",color:"var(--accent-1)",fontWeight:600}:{color:"var(--text-muted)",fontWeight:500}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                <span>Risk</span>
              </NavLink>
            </nav>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest px-4 mb-4" style={{ color: "var(--text-dim)" }}>Intelligence</p>
            <nav className="space-y-2 px-1">
              <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group hover:text-white" style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4.5a2.5 2.5 0 00-4.96-.46 2.5 2.5 0 00-1.98 3 2.5 2.5 0 00-1.32 4.24 3 3 0 00.34 5.58 2.5 2.5 0 002.96 3.08A2.5 2.5 0 0012 20V4.5z"/><path d="M16 8V5c0-1.1.9-2 2-2"/><path d="M12 13h4M12 17h6"/></svg>
                <span>Coaching</span>
              </a>
            </nav>
          </div>

          {/* AI Assistant Card inside Sidebar */}
          <div className="mt-auto p-4 rounded-2xl relative group overflow-hidden" style={{ background: "rgba(var(--accent-1-rgb),0.05)", border: "1px solid rgba(var(--accent-1-rgb),0.2)" }}>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 blur-xl" style={{ background: "rgba(var(--accent-1-rgb),0.1)" }} />
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--accent-1)" }}>AI Assistant</p>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--text-dim)" }}>Get AI-powered insights to improve your progress and achieve your goals faster.</p>
            <button className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all" style={{ background: "rgba(var(--accent-1-rgb),0.2)", border: "1px solid rgba(var(--accent-1-rgb),0.4)", color: "var(--accent-1)", boxShadow: "0 0 15px rgba(var(--accent-1-rgb),0.1)" }}>CONSULT COPILOT</button>
          </div>
        </div>

        <div className="pt-6 border-t flex items-center gap-3" style={{ borderColor: "var(--border-subtle)", marginTop: 24 }}>
          <div className="w-10 h-10 rounded-full p-0.5 overflow-hidden ring-2" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)", border: "1px solid", ringColor: "rgba(var(--accent-1-rgb),0.2)" }}>
            {acct.profileImage ? <img src={acct.profileImage} alt="Avatar" className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full flex items-center justify-center font-bold text-white rounded-full bg-slate-800">{name.charAt(0)}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{name}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: "var(--accent-1)" }}>{tierName} {roman[tierSub-1]}</span>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-1)" }} />
            </div>
          </div>
          <button onClick={() => { closeMobileSidebar(); nav("/profile"); }} className="p-2 transition-colors" style={{ color: "var(--text-dim)" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/><circle cx="12" cy="12" r="3"/></svg></button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-main-content flex-1 flex flex-col gap-6 w-full max-w-[1200px] mx-auto z-10">
        <header className="app-page-header flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div className="space-y-1">
            <button className="mobile-sidebar-toggle" type="button" aria-label="Open navigation" onClick={() => setShowMobileSidebar(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>
              <span>Menu</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--text-primary)" }}>{greeting()}, {name.split(" ")[0]}</h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>You're on a <span className="font-semibold" style={{ color: "var(--accent-1)" }}>14-day streak!</span> Let's hit Level {level+1} today.</p>
            </div>
          </div>
          <div className="app-header-actions flex items-center gap-4">
            <div className="app-search relative flex-1 md:w-64">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-dim)" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" placeholder="Search commands..." className="w-full rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none transition-all" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }} />
            </div>
            <div className="app-action-buttons flex items-center gap-2">
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowTheme(!showTheme)} className="p-2.5 rounded-xl transition-all" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-dim)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                </button>
                {showTheme && <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setShowTheme(false)} />
                  <div style={{ position: "absolute", right: 0, top: 48, width: 200, background: "var(--bg-card)", border: "1px solid var(--bg-card-border)", borderRadius: 16, padding: 8, zIndex: 50, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", backdropFilter: "blur(12px)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 12px" }}>Select Theme</div>
                    {Object.keys(themes).map(k => <button key={k} onClick={() => applyTheme(k)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", background: "transparent", color: "var(--text-muted)", fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}><div style={{ width: 12, height: 12, borderRadius: "50%", background: k === 'light' ? 'linear-gradient(135deg,#6366f1,#f0f2f5)' : themes[k].primary, boxShadow: `0 0 8px ${themes[k].primary}66` }} />{themeLabels[k] || k}</button>)}
                  </div>
                </>}
              </div>
              <button className="p-2.5 rounded-xl transition-all" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-dim)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 009 9 9 9 0 11-9-9Z"/></svg>
              </button>
              <button onClick={() => nav("/tasks")} className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all glow-primary" style={{ background: "var(--accent-1)", color: "#fff", boxShadow: "0 0 25px rgba(var(--accent-1-rgb),0.4)" }}>
                + New Task
              </button>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

export default Layout;
