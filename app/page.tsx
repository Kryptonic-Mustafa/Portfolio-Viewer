"use client";

import { useState, useEffect } from "react";

// --- ICONS ---
const InfoIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LinkIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;

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
  const [errorMsg, setErrorMsg] = useState(""); // New: Store error messages
  const [showInfo, setShowInfo] = useState(false);

  // 1. Fetch Projects on Load
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        
        // Handle non-JSON responses (like 404/500 HTML pages)
        if (!res.ok) {
           throw new Error(`Server Error: ${res.status}`);
        }

        const data = await res.json();

        // CRITICAL FIX: Ensure data is actually an Array before using it
        if (Array.isArray(data)) {
            setProjects(data);
            if (data.length > 0) setActiveProject(data[0]);
        } else {
            console.error("API Error:", data);
            setErrorMsg(data.error || "Failed to load projects");
        }
      } catch (error: any) {
        console.error("System Failure:", error);
        setErrorMsg(error.message || "System Connection Failed");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const getProjectUrl = (project: Project) => {
    return project.type === 'static' ? `/projects/${project.project_url}/index.html` : project.project_url;
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden font-sans selection:bg-emerald-500/30">
      
      {/* --- SIDEBAR --- */}
      <div className="w-80 flex flex-col border-r border-neutral-800 bg-neutral-900/50 backdrop-blur-sm z-20 shadow-2xl">
        <div className="p-6 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-widest text-emerald-400">DEV_OS</h1>
          <p className="text-xs text-neutral-500 font-mono">v2.1 • System Ready</p>
        </div>

        {/* Project List / Error Display */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-neutral-700">
          {loading ? (
            <div className="text-neutral-500 text-sm animate-pulse px-2">Scanning registry...</div>
          ) : errorMsg ? (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded text-red-200 text-xs">
              <strong>⚠️ System Error:</strong><br/>
              {errorMsg}
            </div>
          ) : (
            projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => setActiveProject(proj)}
                className={`group w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                  activeProject?.id === proj.id 
                    ? "bg-gradient-to-r from-emerald-900/40 to-transparent border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                    : "bg-transparent border-transparent hover:bg-neutral-800"
                }`}
              >
                <div className={`font-semibold text-sm ${activeProject?.id === proj.id ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>
                  {proj.title}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {proj.tech_stack?.split(',').slice(0, 3).map((tech, i) => (
                    <span key={i} className="text-[10px] bg-neutral-950 text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-800">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-neutral-800 bg-neutral-950">
          <button onClick={() => setShowInfo(true)} className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-3 rounded-lg text-sm transition">
            <InfoIcon /> System Properties
          </button>
        </div>
      </div>

      {/* --- MAIN VIEWER --- */}
      <div className="flex-1 flex flex-col h-full relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-neutral-900">
        {activeProject ? (
          <>
            <div className="h-14 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-6 shadow-sm z-10">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-wide">{activeProject.title}</span>
                <span className="text-[10px] text-emerald-500 font-mono">Running at: ./{activeProject.slug}</span>
              </div>
              <div className="flex items-center gap-4">
                 <a href={getProjectUrl(activeProject)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-full transition shadow-lg shadow-emerald-900/20">
                   Open External <LinkIcon />
                 </a>
              </div>
            </div>
            <div className="flex-1 w-full h-full relative bg-white">
              <iframe src={getProjectUrl(activeProject)} className="w-full h-full border-none" title="Project Viewer" />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-600">
            <p>Select a module to initialize...</p>
          </div>
        )}
      </div>
    </div>
  );
}