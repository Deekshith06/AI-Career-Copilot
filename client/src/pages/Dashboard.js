import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard-noir.css';
import './theme-dynamic.css';

const Icon = ({ name, className }) => {
  const svgs = {
    'arrow-right': <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    'github': <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.18-.35 6.5-1.5 6.5-7.1a5.1 5.1 0 0 0-1.4-3.5 4.9 4.9 0 0 0-.1-3.5s-1.1-.3-3.5 1.3a12.1 12.1 0 0 0-6 0c-2.4-1.6-3.5-1.3-3.5-1.3a4.9 4.9 0 0 0-.1 3.5 5.1 5.1 0 0 0-1.4 3.5c0 5.6 3.3 6.7 6.5 7.1a4.8 4.8 0 0 0-1 3.03v4"/><path d="M9 20c-5 1.5-5-2.5-7-3"/></svg>,
    'bot': <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>,
    'code': <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    'zap': <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    'layers': <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    'star': <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    'user': <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    'check': <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  };
  return svgs[name] || null;
};

export default function Dashboard() {
  const nav = useNavigate();
  const token = localStorage.getItem("token");

  // Generate dense stars for parallax background
  const shadowsSmall = useMemo(() => {
    let value = `${~~(Math.random()*2000)}px ${~~(Math.random()*2000)}px #FFF`;
    for(let i=1; i<700; i++) value += `, ${~~(Math.random()*2000)}px ${~~(Math.random()*2000)}px #FFF`;
    return value;
  }, []);
  const shadowsMedium = useMemo(() => {
    let value = `${~~(Math.random()*2000)}px ${~~(Math.random()*2000)}px #FFF`;
    for(let i=1; i<200; i++) value += `, ${~~(Math.random()*2000)}px ${~~(Math.random()*2000)}px #FFF`;
    return value;
  }, []);

  return (
    <div className="selection-blue min-h-screen bg-[var(--bg-body)] text-white font-inter relative overflow-x-hidden">
      
      {/* Global Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-body)] to-[rgb(var(--bg-main-end))]"></div>
          <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent animate-[animStar_50s_linear_infinite]" style={{boxShadow: shadowsSmall}}>
            <div className="absolute top-[2000px] left-0 w-[1px] h-[1px] bg-transparent" style={{boxShadow: shadowsSmall}}></div>
          </div>
          <div className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent animate-[animStar_80s_linear_infinite]" style={{boxShadow: shadowsMedium}}>
            <div className="absolute top-[2000px] left-0 w-[2px] h-[2px] bg-transparent" style={{boxShadow: shadowsMedium}}></div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent-1)]/5 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_80%)]"></div>
      </div>

      {/* Top Blur Header */}
      <div className="gradient-blur"></div>

      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 pt-6 px-4">
          <nav className="max-w-5xl mx-auto flex items-center justify-between bg-[var(--bg-body)]/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl">
              <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[var(--accent-1)] rounded-sm rotate-45"></div>
                  <span className="text-lg font-bold font-manrope tracking-tight">PROMETHEUS</span>
              </div>
              
              <div className="hidden md:flex items-center gap-8">
                  <a href="#product" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Product</a>
                  <a href="#solutions" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Solutions</a>
                  <a href="#resources" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Resources</a>
                  <a href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</a>
              </div>

              <div className="flex items-center gap-4">
                  {token ? (
                    <button onClick={() => nav("/dashboard")} className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white/5 px-6 py-2 transition-transform active:scale-95">
                        <span className="absolute inset-0 border border-white/10 rounded-full"></span>
                        <span className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_75%,var(--accent-1)_100%)] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                        <span className="absolute inset-[1px] rounded-full bg-[var(--bg-body)]"></span>
                        <span className="relative z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            Go to App <Icon name="arrow-right" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                    </button>
                  ) : (
                    <>
                      <button onClick={() => nav("/login")} className="hidden md:block text-sm font-medium text-zinc-300 hover:text-white">Log In</button>
                      <button onClick={() => nav("/signup")} className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white/5 px-6 py-2 transition-transform active:scale-95">
                          <span className="absolute inset-0 border border-white/10 rounded-full"></span>
                          <span className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_75%,var(--accent-1)_100%)] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          <span className="absolute inset-[1px] rounded-full bg-[var(--bg-body)]"></span>
                          <span className="relative z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                              Get Access <Icon name="arrow-right" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                      </button>
                    </>
                  )}
              </div>
          </nav>
      </header>

      <main className="relative z-10">
          {/* Hero Section */}
          <section className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6">
              <div className="text-center max-w-5xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-up" style={{animationDelay: "0.1s"}}>
                      <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-1)]"></span>
                      </span>
                      <span className="text-xs font-medium text-blue-100/90 tracking-wide font-manrope">
                          Prometheus AI 2.0 is now live
                      </span>
                      <Icon name="arrow-right" className="w-3 h-3 text-[var(--accent-1)]" />
                  </div>

                  <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter font-manrope leading-[1.1] mb-8 animate-fade-up" style={{animationDelay: "0.2s"}}>
                      <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">ARE  YOU  
OBSOLETE?</span>
                      <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
                          Evolve Or <span className="text-[var(--accent-1)] inline-block relative">
                              Perish
                              <svg className="absolute w-full h-3 -bottom-2 left-0 text-[var(--accent-1)] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                              </svg>
                          </span>
                      </span>
                  </h1>

                  <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up" style={{animationDelay: "0.3s"}}>
                      The AI wave is approaching. We calculate your displacement risk, generate your survival tasks, and deploy a neural assistant to execute them.
                  </p>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-fade-up" style={{animationDelay: "0.4s"}}>
                      <button onClick={() => nav(token ? "/risk-management" : "/signup")} className="shiny-cta group">
                          <span className="relative z-10 flex items-center gap-2 text-white font-medium">
                              Start Your Journey <Icon name="arrow-right" className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                          </span>
                      </button>
                      
                      <button onClick={() => window.open('https://github.com')} className="group px-8 py-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-2">
                          <Icon name="github" className="w-5 h-5" />
                          View on GitHub
                      </button>
                  </div>
              </div>

              {/* Logo Strip */}
              <div className="w-full mt-32 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm py-10 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8 md:gap-16">
                      <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase shrink-0">Integrated with:</p>
                      <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center w-full">
                          <div className="flex items-center gap-2 font-manrope font-semibold"><div className="w-6 h-6 bg-white/20 rounded-full"></div>Gemini AI</div>
                          <div className="flex items-center gap-2 font-manrope font-semibold"><div className="w-6 h-6 bg-white/20 rounded-full"></div>React</div>
                          <div className="flex items-center gap-2 font-manrope font-semibold"><div className="w-6 h-6 bg-white/20 rounded-full"></div>Node.js</div>
                          <div className="flex items-center gap-2 font-manrope font-semibold"><div className="w-6 h-6 bg-white/20 rounded-full"></div>Vercel</div>
                          <div className="flex items-center gap-2 font-manrope font-semibold"><div className="w-6 h-6 bg-white/20 rounded-full"></div>MongoDB</div>
                      </div>
                  </div>
              </div>
          </section>

          {/* Features Bento Grid */}
          <section id="product" className="py-32 px-6">
              <div className="max-w-7xl mx-auto">
                  <div className="mb-20 text-center max-w-3xl mx-auto animate-fade-up">
                      <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight font-manrope mb-6">
                          The Operating System for <br />
                          <span className="text-[var(--accent-1)]">Career Acceleration</span>
                      </h2>
                      <p className="text-lg text-zinc-400 font-light">
                          Replace guesswork with one cohesive platform driven by AI.
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-auto lg:h-[700px]">
                      {/* Main Feature Card */}
                      <div className="lg:col-span-2 lg:row-span-2 group relative overflow-hidden p-8 border border-white/10 bg-gradient-to-b from-zinc-900/50 to-black hover:border-white/20 transition-all rounded-xl">
                          <div className="relative z-10 h-full flex flex-col">
                              <div className="mb-6 inline-flex p-3 rounded-lg bg-white/5 border border-white/10 text-[var(--accent-1)]">
                                  <Icon name="bot" className="w-6 h-6" />
                              </div>
                              <h3 className="text-3xl font-semibold text-white font-manrope mb-4 tracking-tight">AI Career Roadmaps</h3>
                              <p className="text-zinc-400 text-lg leading-relaxed">Instantly generate comprehensive career plans from a single prompt. Skills, milestones, and timelines are automatically mapped against industry benchmarks.</p>
                              <div className="mt-auto flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                  <span className="text-xs font-mono text-[var(--accent-1)]">EXPLORE FEATURE</span>
                                  <Icon name="arrow-right" className="w-4 h-4 text-[var(--accent-1)]" />
                              </div>
                          </div>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" style={{background: 'radial-gradient(circle at top right, var(--accent-1), transparent 70%)'}}></div>
                      </div>

                      {/* Feature 2 */}
                      <div className="lg:col-span-2 group relative overflow-hidden p-8 border border-white/10 bg-[var(--bg-body)] hover:border-white/20 transition-all rounded-xl">
                          <div className="relative z-10 flex flex-col h-full">
                              <div className="mb-4 inline-flex p-3 rounded-lg bg-white/5 border border-white/10 text-emerald-400">
                                  <Icon name="code" className="w-6 h-6" />
                              </div>
                              <h3 className="text-2xl font-semibold text-white font-manrope mb-2">Risk Analysis</h3>
                              <p className="text-zinc-400">Skill gap reports powered by Gemini AI, delivered in seconds to keep your career trajectory optimal.</p>
                          </div>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" style={{background: 'radial-gradient(circle at top right, #10b981, transparent 70%)'}}></div>
                      </div>

                      {/* Feature 3 */}
                      <div className="group relative overflow-hidden p-8 border border-white/10 bg-[var(--bg-body)] hover:border-white/20 transition-all rounded-xl">
                          <div className="relative z-10">
                              <div className="mb-4 inline-flex p-3 rounded-lg bg-white/5 border border-white/10 text-yellow-400">
                                  <Icon name="zap" className="w-6 h-6" />
                              </div>
                              <h3 className="text-xl font-semibold text-white font-manrope mb-2">Smart Tasks</h3>
                              <p className="text-sm text-zinc-400">Daily objectives generated by AI based on your career trajectory and goals.</p>
                          </div>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" style={{background: 'radial-gradient(circle at top right, #eab308, transparent 70%)'}}></div>
                      </div>

                      {/* Feature 4 */}
                      <div className="group relative overflow-hidden p-8 border border-white/10 bg-[var(--bg-body)] hover:border-white/20 transition-all rounded-xl">
                          <div className="relative z-10">
                              <div className="mb-4 inline-flex p-3 rounded-lg bg-white/5 border border-white/10 text-purple-400">
                                  <Icon name="layers" className="w-6 h-6" />
                              </div>
                              <h3 className="text-xl font-semibold text-white font-manrope mb-2">XP Progression</h3>
                              <p className="text-sm text-zinc-400">Gamified tracking with tiers, levels, and streaks to keep you motivated.</p>
                          </div>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" style={{background: 'radial-gradient(circle at top right, #a855f7, transparent 70%)'}}></div>
                      </div>
                  </div>
              </div>
          </section>

          {/* Testimonial Banner */}
          <div className="w-full bg-[var(--accent-1)] py-20 px-6">
              <div className="max-w-4xl mx-auto text-center">
                  <div className="flex justify-center gap-1 text-white mb-6">
                      <Icon name="star" className="w-6 h-6" />
                      <Icon name="star" className="w-6 h-6" />
                      <Icon name="star" className="w-6 h-6" />
                      <Icon name="star" className="w-6 h-6" />
                      <Icon name="star" className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold text-white font-manrope leading-tight mb-8">
                      "Prometheus completely changed how I approach my career growth. What used to feel overwhelming now feels like a game I'm winning."
                  </h3>
                  <div className="flex items-center justify-center gap-4">
                      <div className="w-12 h-12 bg-[var(--bg-body)] rounded-full overflow-hidden flex items-center justify-center">
                          <Icon name="user" className="text-white w-6 h-6" />
                      </div>
                      <div className="text-left">
                          <div className="text-white font-bold text-lg">Sarah Chen</div>
                          <div className="text-blue-100 font-medium">Software Engineer → Tech Lead</div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Pricing */}
          <section id="pricing" className="py-32 px-6 bg-[var(--bg-body)] relative border-t border-white/5">
              <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-20">
                      <h2 className="text-4xl md:text-5xl font-semibold text-white font-manrope mb-4">Simple, Transparent Pricing</h2>
                      <p className="text-zinc-400">Start for free, scale as you grow.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Starter */}
                      <div className="p-8 border border-zinc-800 bg-[var(--bg-body)] hover:border-zinc-700 transition-all rounded-xl flex flex-col">
                          <h3 className="text-xl font-bold font-manrope mb-2">Starter</h3>
                          <p className="text-zinc-500 text-sm mb-8 h-10">For individuals exploring AI career tools.</p>
                          <div className="mb-8 flex items-baseline gap-1">
                              <span className="text-zinc-500">$</span>
                              <span className="text-5xl font-bold text-white">0</span>
                              <span className="text-zinc-500 text-sm">/mo</span>
                          </div>
                          <ul className="space-y-4 mb-8 flex-1">
                              <li className="flex items-center gap-3 text-sm text-zinc-300"><Icon name="check" className="w-5 h-5 text-[var(--accent-1)]" /> 1 Career Path</li>
                              <li className="flex items-center gap-3 text-sm text-zinc-300"><Icon name="check" className="w-5 h-5 text-[var(--accent-1)]" /> Basic AI Analysis</li>
                              <li className="flex items-center gap-3 text-sm text-zinc-300"><Icon name="check" className="w-5 h-5 text-[var(--accent-1)]" /> Community Support</li>
                          </ul>
                          <button onClick={() => nav("/signup")} className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-bold uppercase tracking-wider transition-all">Get Started</button>
                      </div>

                      {/* Pro */}
                      <div className="relative p-8 border border-[var(--accent-1)] bg-zinc-900/40 shadow-[0_0_30px_rgba(59,130,246,0.15)] rounded-xl flex flex-col scale-105 z-10">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent-1)] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Recommended</div>
                          <h3 className="text-xl font-bold font-manrope mb-2">Pro</h3>
                          <p className="text-zinc-400 text-sm mb-8 h-10">For ambitious professionals leveling up fast.</p>
                          <div className="mb-8 flex items-baseline gap-1">
                              <span className="text-zinc-500">$</span>
                              <span className="text-5xl font-bold text-white">19</span>
                              <span className="text-zinc-500 text-sm">/mo</span>
                          </div>
                          <ul className="space-y-4 mb-8 flex-1">
                              <li className="flex items-center gap-3 text-sm text-zinc-300"><Icon name="check" className="w-5 h-5 text-[var(--accent-1)]" /> Unlimited Paths</li>
                              <li className="flex items-center gap-3 text-sm text-zinc-300"><Icon name="check" className="w-5 h-5 text-[var(--accent-1)]" /> Advanced Gemini AI</li>
                              <li className="flex items-center gap-3 text-sm text-zinc-300"><Icon name="check" className="w-5 h-5 text-[var(--accent-1)]" /> Full XP System</li>
                              <li className="flex items-center gap-3 text-sm text-zinc-300"><Icon name="check" className="w-5 h-5 text-[var(--accent-1)]" /> Priority Support</li>
                          </ul>
                          <button onClick={() => nav("/signup")} className="w-full py-3 px-4 bg-[var(--accent-1)] hover:bg-[var(--accent-1)] text-white rounded-lg text-sm font-bold uppercase tracking-wider transition-all">Go Pro</button>
                      </div>

                      {/* Team */}
                      <div className="p-8 border border-zinc-800 bg-[var(--bg-body)] hover:border-zinc-700 transition-all rounded-xl flex flex-col">
                          <h3 className="text-xl font-bold font-manrope mb-2">Team</h3>
                          <p className="text-zinc-500 text-sm mb-8 h-10">For organizations investing in their people.</p>
                          <div className="mb-8 flex items-baseline gap-1">
                              <span className="text-zinc-500">$</span>
                              <span className="text-5xl font-bold text-white">49</span>
                              <span className="text-zinc-500 text-sm">/mo</span>
                          </div>
                          <ul className="space-y-4 mb-8 flex-1">
                              <li className="flex items-center gap-3 text-sm text-zinc-300"><Icon name="check" className="w-5 h-5 text-[var(--accent-1)]" /> Team Collaboration</li>
                              <li className="flex items-center gap-3 text-sm text-zinc-300"><Icon name="check" className="w-5 h-5 text-[var(--accent-1)]" /> Custom Roadmaps</li>
                              <li className="flex items-center gap-3 text-sm text-zinc-300"><Icon name="check" className="w-5 h-5 text-[var(--accent-1)]" /> API Access & SSO</li>
                          </ul>
                          <button onClick={() => nav("/signup")} className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-bold uppercase tracking-wider transition-all">Contact Sales</button>
                      </div>
                  </div>
              </div>
          </section>

          {/* CTA Waitlist */}
          <section className="py-32 px-6 text-center bg-zinc-950/40">
              <div className="max-w-3xl mx-auto">
                  <h2 className="text-5xl md:text-7xl font-bold font-manrope mb-8 tracking-tighter">Ready to <span className="text-[var(--accent-1)]">Ascend?</span></h2>
                  <p className="text-xl text-zinc-400 mb-12">Join thousands of operatives using Prometheus to secure their future in the AI age.</p>
                  
                  <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                      <input type="email" placeholder="Enter your email" className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-[var(--accent-1)] transition-all" />
                      <button onClick={() => nav("/signup")} className="bg-[var(--accent-1)] hover:bg-[var(--accent-1)] text-white font-bold rounded-full px-8 py-4 transition-all">Join Now</button>
                  </div>
              </div>
          </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--bg-body)] border-t border-zinc-900 pt-20 pb-10 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-24 relative z-10">
              <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-6">
                      <div className="w-5 h-5 bg-[var(--accent-1)] rounded-sm rotate-45"></div>
                      <span className="text-2xl font-bold font-manrope tracking-tight">PROMETHEUS</span>
                  </div>
                  <p className="text-zinc-500 max-w-xs leading-relaxed">Pioneering the future of career development with artificial intelligence and gamified progression systems.</p>
              </div>
              
              <div>
                  <h4 className="text-xs font-bold text-[var(--accent-1)] uppercase tracking-widest mb-6">Platform</h4>
                  <ul className="space-y-4 text-zinc-400 text-sm">
                      <li><a onClick={() => nav("/tasks")} className="cursor-pointer hover:text-white transition-colors">Tasks</a></li>
                      <li><a onClick={() => nav("/progress")} className="cursor-pointer hover:text-white transition-colors">Progress</a></li>
                      <li><a onClick={() => nav("/risk-management")} className="cursor-pointer hover:text-white transition-colors">Risk Analysis</a></li>
                      <li><a onClick={() => nav("/profile")} className="cursor-pointer hover:text-white transition-colors">Profile</a></li>
                  </ul>
              </div>
              
              <div>
                  <h4 className="text-xs font-bold text-[var(--accent-1)] uppercase tracking-widest mb-6">Account</h4>
                  <ul className="space-y-4 text-zinc-400 text-sm">
                      <li><a onClick={() => nav("/login")} className="cursor-pointer hover:text-white transition-colors">Log In</a></li>
                      <li><a onClick={() => nav("/signup")} className="cursor-pointer hover:text-white transition-colors">Sign Up</a></li>
                  </ul>
              </div>
          </div>

          {/* Huge Footer Text */}
          <div className="flex justify-center items-center py-10 opacity-10 pointer-events-none">
              <h1 className="text-[15vw] leading-none font-bold font-manrope tracking-tighter text-stroke select-none">PROMETHEUS</h1>
          </div>

          <div className="max-w-7xl mx-auto px-6 border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-600 text-[10px] uppercase tracking-widest">
              <p>&copy; 2026 Prometheus AI Inc. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                  <span className="hover:text-zinc-400 cursor-pointer">Twitter</span>
                  <span className="hover:text-zinc-400 cursor-pointer">LinkedIn</span>
                  <span className="hover:text-zinc-400 cursor-pointer">GitHub</span>
              </div>
          </div>
      </footer>
    </div>
  );
}
