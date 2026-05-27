import { useState } from "react";
import axios from "axios";
import Layout from "../components/layout";
import "./theme-dynamic.css";
import API_BASE_URL from "../config/api";

const TASKS_KEY = "prometheus_tasks";

const roleTips = {
  software: [
    "Master System Design & Architecture — Complete 'Grokking the System Design Interview' on Educative and 'Designing Data-Intensive Applications' by Martin Kleppmann. Focus on load balancing, database sharding, caching strategies, and microservices patterns.",
    "Learn AI-Augmented Development — Take 'CS50's Introduction to AI with Python' (Harvard/edX) and integrate GitHub Copilot, Cursor, and LangChain into your workflow. Build at least 2 projects using AI APIs (OpenAI, Anthropic) to show AI fluency.",
    "Specialize in Performance Engineering — Study 'Web Performance Fundamentals' (Frontend Masters) and 'High Performance Browser Networking' by Ilya Grigorik. Master Lighthouse audits, Core Web Vitals optimization, and server-side rendering with Next.js.",
    "Build Full-Stack Production Projects — Deploy 3+ end-to-end apps with auth (OAuth/JWT), PostgreSQL/MongoDB, Redis caching, CI/CD pipelines (GitHub Actions), Docker, and monitoring (Datadog/Sentry). Document architecture decisions in case studies.",
    "Contribute to Open Source & Build Authority — Make meaningful PRs to React, Next.js, or Node.js ecosystems. Write technical deep-dives on your blog, speak at local meetups, and build a GitHub profile with 500+ contributions/year.",
  ],
  mechanical: [
    "Master Digital Twin & Simulation Tools — Complete Siemens NX or ANSYS certification. Take 'Finite Element Analysis' (Coursera/Northwestern) and learn to build predictive maintenance models using sensor data and Python.",
    "Learn Industrial IoT & Robotics — Take 'Robotics Specialization' (Coursera/UPenn) and 'Introduction to Industry 4.0' (edX). Get hands-on with PLC programming (Siemens TIA Portal), ROS2, and industrial automation protocols (OPC-UA, MQTT).",
    "Develop AI-for-Manufacturing Skills — Study 'AI for Manufacturing' (Coursera/IBM) and learn to apply computer vision (OpenCV, YOLO) for quality inspection. Build a predictive maintenance project using vibration/thermal sensor data with TensorFlow.",
    "Strengthen GD&T & DFM Expertise — Complete ASME Y14.5 GD&T certification and 'Design for Manufacturability' training. Document 3+ case studies where your DFM decisions reduced cost by 10%+ or improved first-pass yield.",
    "Get PMP or Six Sigma Green Belt — Earn Project Management Professional (PMI) or Lean Six Sigma Green Belt certification. Lead a cross-functional improvement project and quantify the cost/time savings in a portfolio case study.",
  ],
  designer: [
    "Master Advanced UX Research Methods — Complete 'Google UX Design Professional Certificate' (Coursera) and 'Interaction Design Specialization' (UC San Diego). Conduct 5+ usability studies with real users and document findings with measurable impact.",
    "Learn AI-Powered Design Tools — Master Figma AI features, Galileo AI, and Midjourney for rapid prototyping. Take 'Designing with AI' (IDEO U) and build a case study showing how AI tools 3x'd your design iteration speed.",
    "Specialize in Design Systems & Accessibility — Study 'Inclusive Design' (Microsoft Learn) and WCAG 2.2 AA compliance. Build a production design system with tokens, components, and documentation. Get IAAP WAS certification.",
    "Develop Product Strategy & Data Skills — Take 'Product Analytics' (Pendo/Amplitude Academy) and 'Lean Product Management' (Pragmatic Institute). Learn to run A/B tests, define success metrics, and present data-driven design decisions.",
    "Build a High-Impact Portfolio — Create 5 detailed case studies with problem framing, research insights, wireframes, prototypes, and measured outcomes (conversion lift, task completion rates). Present on Behance, Dribbble, and a personal site.",
  ],
  analyst: [
    "Master Advanced SQL & Python for Analytics — Complete 'Google Data Analytics Professional Certificate' (Coursera) and 'Python for Data Science' (IBM/edX). Build 3+ dashboards in Tableau/Power BI using real datasets with automated ETL pipelines.",
    "Learn Machine Learning for Business — Take 'Machine Learning Specialization' (Coursera/Andrew Ng) and 'Applied Data Science with Python' (UMich). Build predictive models for churn, forecasting, or pricing and deploy them with Flask/Streamlit.",
    "Develop Domain Expertise in Finance or Ops — Get 'Financial Modeling & Valuation Analyst' (FMVA) certification from CFI, or 'Supply Chain Analytics' (MIT/edX). Specialize in one vertical so your analysis carries domain authority.",
    "Strengthen Storytelling & Executive Communication — Take 'Data Visualization with Tableau' (UC Davis/Coursera) and 'Business Communication' (HBS Online). Create 3+ boardroom-ready analysis decks that drove real business decisions.",
    "Build an Analytics Portfolio with Impact — Document 5 projects showing end-to-end analytics: problem → data collection → analysis → insight → action → measured outcome. Host on GitHub with clean notebooks, README files, and result summaries.",
  ],
  default: [
    "Identify Your Role's AI Exposure — Map your daily tasks into 'automatable' vs 'judgment-required' categories. Take 'AI for Everyone' (Coursera/Andrew Ng) to understand which parts of your work AI can accelerate vs. replace.",
    "Build Adjacent Technical Skills — Complete 'Google IT Automation with Python' (Coursera) to learn scripting, APIs, and automation. Even non-technical roles benefit from understanding data workflows and basic programming.",
    "Develop Leadership & Strategic Thinking — Take 'Leadership Principles' (HBS Online) or 'Strategic Management' (Coursera/Copenhagen). Roles that involve decision-making, stakeholder management, and strategy are hardest to automate.",
    "Create Proof-of-Work Documentation — Build a portfolio of 3-5 case studies showing problems you solved, decisions you made, and outcomes you drove. Host on a personal site or LinkedIn to demonstrate irreplaceable human judgment.",
    "Strengthen Cross-Functional Communication — Complete 'Improving Communication Skills' (Wharton/Coursera) and practice presenting to non-expert audiences. The ability to translate complexity into action is a durable competitive advantage.",
  ],
};

const defaultRisk = { risk: 42, explanation: "AI and automation may impact some parts of this role, but strong demand for creative, problem-solving, and user-centric skills keeps it moderately future-proof.", tips: roleTips.default };
const fallbackCompare = [{ role: "Frontend Developer", sub: "Web Development", risk: 42, aiImpact: "Medium", jobDemand: "High", outlook: "Stable" }, { role: "Data Scientist", sub: "Data & Analytics", risk: 28, aiImpact: "Low", jobDemand: "High", outlook: "Positive" }, { role: "Graphic Designer", sub: "Design", risk: 63, aiImpact: "High", jobDemand: "Medium", outlook: "Uncertain" }];

const roleProfiles = [
  { keywords: ["mechanical","engineer","manufacturing","industrial","civil"], baseRisk: 38, explanation: "Engineering roles with physical systems knowledge are less exposed, but repetitive CAD drafting, documentation, and standard FEA analysis can still be automated by AI tools like Siemens NX AI and generative design.", tipsKey: "mechanical" },
  { keywords: ["software","developer","frontend","backend","web","programmer","full stack","fullstack"], baseRisk: 58, explanation: "Software development is heavily accelerated by AI coding assistants (Copilot, Cursor, Claude). Risk drops significantly when your work involves system architecture, debugging complex distributed systems, and product ownership.", tipsKey: "software" },
  { keywords: ["designer","ux","ui","graphic","creative","product design"], baseRisk: 52, explanation: "AI tools like Midjourney, Galileo AI, and Figma AI can generate visuals rapidly. However, designers who lead user research, define information architecture, and drive product strategy remain highly valuable.", tipsKey: "designer" },
  { keywords: ["analyst","finance","account","operations","data","business analyst"], baseRisk: 49, explanation: "Routine reporting, dashboard creation, and SQL queries are increasingly automated. Your value increases when you frame problems, interpret ambiguous data, and guide executive decisions with context AI cannot replicate.", tipsKey: "analyst" },
];

const getRoleTips = (job) => { const l = job.toLowerCase(); const p = roleProfiles.find(p => p.keywords.some(k => l.includes(k))); return roleTips[p?.tipsKey || "default"]; };
const getRoleProfile = (job) => { const l = job.toLowerCase(); return roleProfiles.find(p => p.keywords.some(k => l.includes(k))) || defaultRisk; };
const createFallback = (job, skill) => { const p = getRoleProfile(job); const adj = Math.round((50 - skill) * 0.35); return { risk: Math.max(12, Math.min(92, (p.baseRisk || 42) + adj)), explanation: p.explanation || defaultRisk.explanation, tips: getRoleTips(job) }; };
const createCompareFallback = (roles) => roles.map((r, i) => { const p = getRoleProfile(r); const off = r.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 9; return { role: r, sub: "", risk: Math.max(14, Math.min(88, (p.baseRisk || 42) + off - i * 3)), aiImpact: (p.baseRisk || 42) > 50 ? "High" : "Medium", jobDemand: "High", outlook: (p.baseRisk || 42) > 50 ? "Uncertain" : "Stable" }; });

function RiskManagement() {
  const [jobTitle, setJobTitle] = useState("");
  const [riskData, setRiskData] = useState(defaultRisk);
  const [careers, setCareers] = useState(["", "", ""]);
  const [compareData, setCompareData] = useState(fallbackCompare);
  const [isCalc, setIsCalc] = useState(false);
  const [isComp, setIsComp] = useState(false);
  const [addedTips, setAddedTips] = useState({});
  const [msg, setMsg] = useState("");

  const riskLabel = riskData.risk < 25 ? "No Risk" : riskData.risk < 40 ? "Low Risk" : riskData.risk < 60 ? "Medium Risk" : riskData.risk < 80 ? "High Risk" : "Very High Risk";
  const riskColor = riskData.risk < 40 ? "var(--accent-2)" : riskData.risk < 60 ? "var(--accent-3)" : "var(--accent-4)";
  const circ = 2 * Math.PI * 80;
  const off = circ * (1 - riskData.risk / 100);

  const analyze = async () => {
    if (!jobTitle.trim()) return;
    setIsCalc(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/predict-risk`, { role: jobTitle }, { timeout: 1800 });
      const t = res.data.result || ""; const rm = t.match(/Risk:\s*(\d+)/i);
      setRiskData({ risk: rm ? Number(rm[1]) : createFallback(jobTitle, 50).risk, explanation: getRoleProfile(jobTitle).explanation || defaultRisk.explanation, tips: getRoleTips(jobTitle) });
    } catch { setRiskData(createFallback(jobTitle, 50)); }
    setIsCalc(false); setAddedTips({}); setMsg("");
  };

  const compare = async () => {
    const cl = careers.map(c => c.trim()).filter(Boolean);
    if (cl.length !== 3) { alert("Enter 3 careers."); return; }
    setIsComp(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/compare-roles`, { roles: cl }, { timeout: 1800 });
      const d = Array.isArray(res.data?.data) ? res.data.data : [];
      const n = d.slice(0, 3).map((item, i) => ({ role: item.role || cl[i], sub: "", risk: Number(item.risk ?? 0), aiImpact: "Medium", jobDemand: "High", outlook: "Stable" }));
      setCompareData(n.length === 3 ? n : createCompareFallback(cl));
    } catch { setCompareData(createCompareFallback(cl)); }
    setIsComp(false);
  };

  const addTip = (tip) => {
    try {
      const raw = localStorage.getItem(TASKS_KEY); const stored = raw ? JSON.parse(raw) : [];
      if (stored.some(t => t.title?.trim().toLowerCase() === tip.trim().toLowerCase())) { setMsg("Already in tasks."); return; }
      localStorage.setItem(TASKS_KEY, JSON.stringify([{ id: Date.now(), title: tip, completed: false, rewarded: false }, ...stored]));
      setAddedTips(p => ({ ...p, [tip]: true })); setMsg("Added to tasks!");
    } catch { setMsg("Could not add."); }
  };

  const tipIcons = [
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2"><path d="M12 4.5a2.5 2.5 0 00-4.96-.46 2.5 2.5 0 00-1.98 3 2.5 2.5 0 00-1.32 4.24 3 3 0 00.34 5.58 2.5 2.5 0 002.96 3.08A2.5 2.5 0 0012 20V4.5z"/></svg>,
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-3)" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>,
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-4)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  ];

  const cardColors = ["var(--accent-primary)", "var(--accent-2)", "var(--accent-3)"];

  return (
    <Layout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 className="font-display" style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>Risk Analysis</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>AI-powered career risk assessment and future-proofing insights.</p>
        </div>

        {/* Top: Analyzer + Counter Measures */}
        <div className="mobile-two-col-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          {/* Left: Analyzer */}
          <div className="glass-card bloom-primary" style={{ padding: 32, borderRadius: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>AI Career Risk Analyzer</h2>
              <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 6, background: "rgba(var(--accent-2-rgb),0.15)", color: "var(--accent-2)", border: "1px solid rgba(var(--accent-2-rgb),0.3)" }}>BETA</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>Enter a job role or career path</p>
            <div className="mobile-input-row" style={{ display: "flex", gap: 12, marginBottom: 32 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && analyze()} placeholder="Frontend Developer" className="input-glass" style={{ width: "100%", borderRadius: 16, padding: "14px 16px 14px 44px", fontSize: 14, outline: "none" }}/>
              </div>
              <button onClick={analyze} disabled={isCalc} className="glow-primary" style={{ padding: "14px 28px", background: "var(--accent-primary)", borderRadius: 16, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{isCalc ? "..." : "Analyze"}</button>
            </div>

            {/* Risk Score */}
            <div className="mobile-risk-score" style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 24 }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>AI Replacement Risk Score</p>
                <div style={{ position: "relative", width: 180, height: 180 }}>
                  <svg width="180" height="180" className="progress-circle"><circle cx="90" cy="90" r="80" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none"/><circle cx="90" cy="90" r="80" stroke={riskColor} strokeWidth="10" fill="none" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${riskColor})` }}/></svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span className="font-display" style={{ fontSize: "2.8rem", fontWeight: 900, color: "var(--text-primary)" }}>{riskData.risk}%</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: riskColor }}>{riskLabel}</span>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Analysis Summary</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}>{riskData.explanation}</p>
                <div className="mobile-metric-row" style={{ display: "flex", gap: 16 }}>
                  {[{ l: "AI Impact", v: riskData.risk < 40 ? "Low" : riskData.risk < 60 ? "Medium" : "High", c: riskData.risk < 40 ? "var(--accent-2)" : riskData.risk < 60 ? "var(--accent-3)" : "var(--accent-4)" }, { l: "Job Demand", v: "High", c: "var(--accent-primary)" }, { l: "Future Outlook", v: riskData.risk < 50 ? "Stable" : "Uncertain", c: riskData.risk < 50 ? "var(--accent-2)" : "var(--accent-3)" }].map((m, i) => (
                    <div key={i} style={{ padding: "8px 16px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>{m.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: m.c }}>{m.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk Bar */}
            <div style={{ position: "relative", height: 8, background: "linear-gradient(90deg, var(--accent-2), var(--accent-3), var(--accent-4))", borderRadius: 999, marginBottom: 8 }}>
              <div style={{ position: "absolute", left: `${riskData.risk}%`, top: -4, width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "3px solid var(--accent-primary)", transform: "translateX(-50%)", boxShadow: "0 0 10px rgba(var(--accent-primary-rgb),0.5)" }}/>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700, color: "var(--text-dim)" }}>
              {["0%\nNo Risk", "25%\nLow Risk", "50%\nMedium Risk", "75%\nHigh Risk", "100%\nVery High Risk"].map((l, i) => <span key={i} style={{ textAlign: "center", whiteSpace: "pre-line" }}>{l}</span>)}
            </div>
          </div>

          {/* Right: Counter Measures */}
          <div className="glass-card" style={{ padding: 32, borderRadius: 24 }}>
            <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>AI Recommended Counter Measures</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {riskData.tips.slice(0, 5).map((tip, i) => {
                const added = addedTips[tip];
                const title = tip.split("—")[0].split("–")[0].trim();
                const desc = tip.includes("—") ? tip.split("—")[1].trim() : tip.includes("–") ? tip.split("–")[1].trim() : "";
                return (
                  <div key={i} onClick={() => !added && addTip(tip)} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: 16, borderRadius: 16, background: added ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${added ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)"}`, cursor: added ? "default" : "pointer", transition: "all 0.2s" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `rgba(var(--accent-${Math.min(i + 1, 4)}-rgb),0.1)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{tipIcons[i]}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>{title}</h4>
                      {desc && <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{desc}</p>}
                    </div>
                    {added ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{ flexShrink: 0, marginTop: 4 }}><polyline points="20 6 9 17 4 12"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0, marginTop: 4 }}><path d="M5 12h14M12 5v14"/></svg>}
                  </div>
                );
              })}
            </div>
            {msg && <p style={{ fontSize: 12, color: "#22c55e", marginTop: 12, fontWeight: 600 }}>{msg}</p>}
          </div>
        </div>

        {/* Compare Career Risks */}
        <div className="glass-card" style={{ padding: 32, borderRadius: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Compare Career Risks</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Compare up to 3 career paths and their AI replacement risk.</p>
          </div>
          {/* Inputs */}
          <div className="mobile-input-row" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            {careers.map((c, i) => (
              <input key={i} value={c} onChange={e => setCareers(p => p.map((v, j) => j === i ? e.target.value : v))} placeholder={fallbackCompare[i]?.role || `Career ${i + 1}`} className="input-glass" style={{ flex: 1, borderRadius: 14, padding: "12px 16px", fontSize: 14, outline: "none" }}/>
            ))}
            <button onClick={compare} disabled={isComp} style={{ padding: "12px 24px", background: "var(--accent-primary)", borderRadius: 14, border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" }}>{isComp ? "..." : "Compare"}</button>
          </div>

          {/* Cards */}
          <div className="mobile-compare-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {compareData.map((item, i) => {
              const rl = item.risk < 30 ? "Low Risk" : item.risk < 60 ? "Medium Risk" : "High Risk";
              const rc = item.risk < 30 ? "var(--accent-2)" : item.risk < 60 ? "var(--accent-3)" : "var(--accent-4)";
              const c2 = 2 * Math.PI * 50; const o2 = c2 * (1 - item.risk / 100);
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `${cardColors[i]}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: cardColors[i] }}>{i + 1}</div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{item.role || `Career ${i + 1}`}</h3>
                      <p style={{ fontSize: 11, color: "var(--text-dim)", margin: 0 }}>{item.sub || "Career Path"}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" style={{ marginLeft: "auto" }}><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
                      <svg width="100" height="100" className="progress-circle"><circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none"/><circle cx="50" cy="50" r="40" stroke={rc} strokeWidth="8" fill="none" strokeDasharray={c2} strokeDashoffset={o2} strokeLinecap="round"/></svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)" }}>{item.risk}%</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: rc }}>{rl}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                      {[{ l: "AI Impact", v: item.aiImpact || "Medium" }, { l: "Job Demand", v: item.jobDemand || "High" }, { l: "Future Outlook", v: item.outlook || "Stable" }].map((m, j) => (
                        <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: "var(--text-dim)" }}>{m.l}</span>
                          <span style={{ fontWeight: 700, color: m.v === "High" || m.v === "Positive" ? "var(--accent-2)" : m.v === "Low" || m.v === "Stable" ? "var(--accent-2)" : m.v === "Uncertain" ? "var(--accent-3)" : "var(--accent-primary)" }}>{m.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button style={{ width: "100%", marginTop: 16, padding: "10px", background: `${cardColors[i]}15`, border: `1px solid ${cardColors[i]}40`, borderRadius: 12, color: cardColors[i], fontSize: 12, fontWeight: 700, cursor: "pointer" }}>View Details</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insight Banner */}
        <div className="glass-card mobile-quote-card" style={{ marginTop: 24, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 6, background: "rgba(var(--accent-1-rgb),0.15)", color: "var(--accent-1)" }}>AI</span>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}><strong style={{ color: "var(--text-primary)" }}>AI Insight:</strong> Roles that combine creativity, strategy, and human empathy are least likely to be replaced.</p>
        </div>
      </div>
    </Layout>
  );
}

export default RiskManagement;
