"use client";

import { useState, useEffect } from "react";

// --- ICONS ---
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>;

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    type: "static",
    project_url: "",
    tech_stack: "",
  });

  // 1. Fetch Data
  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch");
    }
  }

  // 2. Delete Handler
  async function handleDelete(id: number) {
    if(!confirm("Are you sure you want to delete this project?")) return;
    
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    fetchProjects(); // Refresh the list
  }

  // 3. Submit Handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.slug) return alert("Title and Slug are required");

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Project Deployed! 🚀");
      setFormData({ title: "", description: "", slug: "", type: "static", project_url: "", tech_stack: "" });
      fetchProjects();
    } else {
      alert("Error saving project");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-10 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              Admin Command
            </h1>
            <p className="text-slate-500 mt-2">Manage your Portfolio OS registry.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{projects.length}</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">Active Projects</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT COLUMN: UPLOAD FORM */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-10">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PlusIcon /> New Deployment
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Project Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Neon Calculator" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-white" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Slug</label>
                    <input 
                      type="text" 
                      placeholder="neon-calc" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none text-white" 
                      value={formData.slug} 
                      onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Type</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none text-white"
                      value={formData.type} 
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="static">Static (Internal)</option>
                      <option value="external">External Link</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Target URL / Folder</label>
                  <input 
                    type="text" 
                    placeholder="Folder name OR https://..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none font-mono text-xs text-white" 
                    value={formData.project_url} 
                    onChange={(e) => setFormData({...formData, project_url: e.target.value})} 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Tech Stack</label>
                  <input 
                    type="text" 
                    placeholder="React, Node, SQL" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none text-white" 
                    value={formData.tech_stack} 
                    onChange={(e) => setFormData({...formData, tech_stack: e.target.value})} 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Description</label>
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none h-20 text-white"
                    placeholder="Project details..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all transform active:scale-95">
                  Initialize Project
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: PROJECT REGISTRY */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-white mb-6">System Registry</h2>
            
            {loading ? <div className="animate-pulse h-12 bg-slate-900 rounded-lg"></div> : (
              <div className="space-y-3">
                {/* @ts-ignore */}
                {projects.map((proj: any) => (
                  <div key={proj.id} className="group bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:border-emerald-500/30 hover:bg-slate-800/80 transition-all">
                    
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${proj.type === 'static' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>
                        {proj.type === 'static' ? 'DIR' : 'URL'}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{proj.title}</h3>
                        <p className="text-xs text-slate-500 font-mono">/{proj.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-slate-400">{proj.tech_stack}</div>
                        <div className="text-[10px] text-slate-600">{new Date(proj.created_at).toLocaleDateString()}</div>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(proj.id)}
                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition"
                        title="Delete Project"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}