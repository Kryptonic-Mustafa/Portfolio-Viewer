"use client";

import { useState, useEffect } from "react";

// --- ICONS ---
const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  External: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  Folder: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  Code: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
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

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (Array.isArray(data)) setProjects(data);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    }
    fetchProjects();
  }, []);

  const getProjectUrl = (project: Project) => {
    return project.type === 'static' ? `/projects/${project.project_url}/index.html` : project.project_url;
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* --- SIDEBAR: Glass & Minimal --- */}
      <div className="w-72 flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl z-20">
        
        {/* Profile / Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-lg shadow-indigo-500/20">
              ME
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">Mustafa Ch.</h1>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Full Stack Developer</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveProject(null)}
            className="w-full flex items-center gap-2 bg-white/5 hover:bg-white/10 text-xs font-medium px-3 py-2 rounded-lg transition-all border border-white/5 hover:border-white/10"
          >
            <Icons.Home /> Return to Overview
          </button>
        </div>

        {/* Project Navigation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Projects</div>
          
          {loading ? (
            <div className="px-3 text-xs text-zinc-600">Loading...</div>
          ) : (
            projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => setActiveProject(proj)}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all duration-200 border flex flex-col gap-1 group ${
                  activeProject?.id === proj.id 
                    ? "bg-gradient-to-r from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-200" 
                    : "bg-transparent border-transparent hover:bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                   {proj.type === 'static' ? <Icons.Folder /> : <Icons.External />}
                   {proj.title}
                </div>
                <div className="text-[10px] opacity-60 pl-6 group-hover:opacity-100 transition-opacity">
                  {proj.tech_stack.split(',')[0]}
                </div>
              </button>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-white/5 text-[10px] text-zinc-600 text-center">
          Portfolio OS v3.0 • <a href="/admin" className="hover:text-zinc-400 transition">Admin</a>
        </div>
      </div>

      {/* --- MAIN STAGE --- */}
      <div className="flex-1 flex flex-col relative bg-gradient-to-br from-[#0a0a0a] to-[#111] overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        {activeProject ? (
          <>
            {/* Toolbar */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">{activeProject.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
                  {activeProject.type === 'static' ? 'Local Build' : 'Live URL'}
                </span>
              </div>
              <a 
                href={getProjectUrl(activeProject)} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition"
              >
                Open Fullscreen <Icons.External />
              </a>
            </div>

            {/* Viewer */}
            <div className="flex-1 relative bg-white/95 rounded-tl-2xl overflow-hidden shadow-2xl border-l border-t border-white/10 ml-0 mt-0">
               <iframe
                src={getProjectUrl(activeProject)}
                className="w-full h-full border-none"
                title="Project Viewer"
              />
            </div>
          </>
        ) : (
          /* --- HERO / LANDING STATE (When no project is selected) --- */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center z-10">
            <div className="max-w-2xl space-y-8">
              <div className="inline-block p-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-6">
                <div className="bg-[#0a0a0a] rounded-full px-4 py-1.5">
                  <span className="text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                    Available for hire
                  </span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                Crafting <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Digital</span> Experiences.
              </h1>
              
              <p className="text-lg text-zinc-400 leading-relaxed max-w-lg mx-auto">
                Welcome to my interactive portfolio. Select a project from the sidebar to launch a live preview of my development journey.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <div className="text-indigo-400 mb-2"><Icons.Code /></div>
                    <div className="font-bold text-white">Clean Code</div>
                    <div className="text-xs text-zinc-500 mt-1">Modern practices & type safety.</div>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <div className="text-purple-400 mb-2"><Icons.Folder /></div>
                    <div className="font-bold text-white">Full Stack</div>
                    <div className="text-xs text-zinc-500 mt-1">Next.js, Node, SQL & More.</div>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <div className="text-pink-400 mb-2"><Icons.Home /></div>
                    <div className="font-bold text-white">UI/UX Design</div>
                    <div className="text-xs text-zinc-500 mt-1">Immersive & responsive layouts.</div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}