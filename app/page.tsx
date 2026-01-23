"use client";

import { useState, useEffect } from "react";

// --- ICONS ---
const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  External: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  Folder: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  Code: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  Profile: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Menu: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Refresh: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Cpu: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
};

interface Project {
  id: number;
  title: string;
  description: string;
  slug: string;
  type: 'static' | 'external';
  project_url: string;
  tech_stack: string;
}

export default function PortfolioOS() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // --- 1. CLOCK ---
  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 2. AUTO-REFRESH & SYNC LOGIC ---
  useEffect(() => {
    fetchProjects(); 
    const interval = setInterval(() => fetchProjects(true), 5000);
    return () => clearInterval(interval);
  }, []);

  // --- 3. FIX: SELF-HEALING STATE ---
  // If the active project disappears (deleted), reset to dashboard
  useEffect(() => {
    if (activeProject && projects.length > 0) {
        const stillExists = projects.find(p => p.id === activeProject.id);
        if (!stillExists) setActiveProject(null);
    }
  }, [projects, activeProject]);

  async function fetchProjects(silent = false) {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
      }
    } catch (e) { console.error(e); } 
    finally { 
      setLoading(false); 
      setIsRefreshing(false);
    }
  }

  const getProjectUrl = (project: Project) => {
    if (project.type === 'external') return project.project_url;
    if (project.project_url.includes('.html')) return `/projects/${project.project_url}`;
    return `/projects/${project.project_url}/index.html`;
  };

  const handleProjectSelect = (proj: Project) => {
    setActiveProject(proj);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30 relative">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 z-40">
        <div className="font-bold text-white tracking-wide">Developer OS</div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-zinc-300">
          <Icons.Menu />
        </button>
      </div>

      {mobileMenuOpen && <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />}

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0a]/95 backdrop-blur-2xl border-r border-white/5 shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-80 md:bg-[#0a0a0a]/80 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white"><Icons.Code /></div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">Dev OS</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium flex items-center gap-1">
                 v3.0 • {isRefreshing ? <span className="text-indigo-400 animate-pulse">Syncing...</span> : "Online"}
              </p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-zinc-400"><Icons.Close /></button>
        </div>

        <div className="p-4 border-b border-white/5">
             <button onClick={() => { setActiveProject(null); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 text-xs font-medium px-4 py-3 rounded-xl transition-all border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white">
                <Icons.Home /> Dashboard Overview
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          <div className="px-2 pb-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex justify-between items-center">
             <span>Modules</span>
             <button onClick={() => fetchProjects()} className="hover:text-white transition" title="Force Refresh"><Icons.Refresh /></button>
          </div>
          
          {loading ? (
            <div className="px-4 py-2 text-xs text-zinc-600 animate-pulse">Scanning registry...</div>
          ) : (
            projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => handleProjectSelect(proj)}
                className={`group w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 border flex flex-col gap-1.5 relative overflow-hidden ${activeProject?.id === proj.id ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-100" : "bg-transparent border-transparent hover:bg-white/5 text-zinc-400 hover:text-zinc-200"}`}
              >
                {activeProject?.id === proj.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                <div className="flex items-center gap-2 font-semibold">
                   {proj.type === 'static' ? <Icons.Folder /> : <Icons.External />}
                   {proj.title}
                </div>
                <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity pl-6">
                  {proj.tech_stack.split(',').slice(0, 2).map((tech, i) => <span key={i} className="text-[9px] uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{tech.trim()}</span>)}
                </div>
              </button>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-white/5 bg-black/20">
            <a href="/admin" className="flex items-center justify-center gap-2 text-[10px] text-zinc-600 hover:text-indigo-400 transition uppercase tracking-widest font-bold py-2"><Icons.Profile /> Admin Login</a>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col relative bg-[#050505] w-full pt-16 md:pt-0">
        
        {activeProject ? (
          <>
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[#0a0a0a]/50 backdrop-blur-xl z-10">
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white tracking-wide truncate">{activeProject.title}</span>
                <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span className="truncate">Active Process</span>
                </span>
              </div>
              <a href={getProjectUrl(activeProject)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] md:text-xs font-bold bg-white text-black px-3 py-2 rounded-lg hover:bg-zinc-200 transition shrink-0">
                <span className="hidden md:inline">Open Fullscreen</span> <Icons.External />
              </a>
            </div>

            <div className="flex-1 relative bg-white w-full h-full">
               <iframe
                key={activeProject.id}
                src={getProjectUrl(activeProject)}
                className="w-full h-full border-none"
                title="Project Viewer"
              />
            </div>
          </>
        ) : (
          /* --- SYSTEM DASHBOARD (AMAZING UI) --- */
          <div className="flex-1 flex flex-col p-6 md:p-12 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
            
            {/* Header */}
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">SYSTEM <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">ONLINE</span></h1>
                    <p className="text-zinc-500 font-mono text-sm">Welcome back, Administrator.</p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-4xl font-light text-white font-mono">{currentTime}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-widest">Local Time</div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Stat Card 1 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Icons.Cpu /></div>
                        <span className="text-xs text-zinc-500 font-mono">CPU</span>
                    </div>
                    <div className="text-2xl font-bold text-white">Nominal</div>
                    <div className="text-xs text-zinc-500 mt-1">System running efficiently</div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Icons.Folder /></div>
                        <span className="text-xs text-zinc-500 font-mono">MODULES</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{projects.length} Active</div>
                    <div className="text-xs text-zinc-500 mt-1">Projects deployed</div>
                </div>

                 {/* Activity Graph Mockup */}
                 <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
                     <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-4">Deployment Activity</div>
                     <div className="flex gap-1 h-12 items-end">
                         {[...Array(20)].map((_, i) => (
                             <div key={i} className="flex-1 bg-indigo-500/20 rounded-sm hover:bg-indigo-500 transition-all duration-300" style={{ height: `${Math.random() * 100}%`}}></div>
                         ))}
                     </div>
                 </div>
            </div>

            {/* Footer Message */}
            <div className="mt-auto pt-12 text-center">
                 <div className="inline-block px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                    Ready for input. Select a module from the sidebar.
                 </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}