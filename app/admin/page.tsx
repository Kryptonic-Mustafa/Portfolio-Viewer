"use client";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';

// --- ICONS ---
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CloudIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const LinkIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;

export default function AdminDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload'); // TABS STATE

  // Form States
  const [deploying, setDeploying] = useState(false);
  const [deployData, setDeployData] = useState({ title: "", slug: "", tech_stack: "", description: "" });
  const [linkData, setLinkData] = useState({ title: "", url: "", slug: "", tech_stack: "", description: "" });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if(Array.isArray(data)) setProjects(data);
      setLoading(false);
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id: number) {
    if(!confirm("Delete this project?")) return;
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    fetchProjects();
  }

  // --- HANDLER 1: AUTO DEPLOY (STATIC FILES) ---
  async function handleAutoDeploy(e: React.FormEvent) {
    e.preventDefault();
    if (!deployData.title || !deployData.slug || !selectedFiles) {
        return Swal.fire({ icon: 'warning', title: 'Missing Info', text: 'Please fill all fields and select files.', background: '#18181b', color: '#fff'});
    }

    setDeploying(true);
    const formData = new FormData();
    formData.append('title', deployData.title);
    formData.append('slug', deployData.slug);
    formData.append('tech_stack', deployData.tech_stack);
    formData.append('description', deployData.description);
    for (let i = 0; i < selectedFiles.length; i++) formData.append('files', selectedFiles[i]);

    try {
        const res = await fetch("/api/deploy", { method: "POST", body: formData });
        const result = await res.json();
        if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Deploying!', text: 'Files uploaded. Site rebuilding...', background: '#18181b', color: '#fff' });
            setDeployData({ title: "", slug: "", tech_stack: "", description: "" });
            setSelectedFiles(null);
            fetchProjects();
        } else { throw new Error(result.error); }
    } catch (error: any) {
        Swal.fire({ icon: 'error', title: 'Failed', text: error.message, background: '#18181b', color: '#fff' });
    } finally { setDeploying(false); }
  }

  // --- HANDLER 2: MANUAL LINK (EXTERNAL APPS) ---
  async function handleManualLink(e: React.FormEvent) {
    e.preventDefault();
    if (!linkData.title || !linkData.url || !linkData.slug) return Swal.fire({ icon: 'warning', text: 'Missing required fields' });

    const payload = {
        title: linkData.title,
        slug: linkData.slug,
        type: 'external',
        project_url: linkData.url,
        tech_stack: linkData.tech_stack,
        description: linkData.description
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Linked!', text: 'External project added.', background: '#18181b', color: '#fff' });
        setLinkData({ title: "", url: "", slug: "", tech_stack: "", description: "" });
        fetchProjects();
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Admin Console</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: ACTION CENTER --- */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-8 shadow-xl">
              
              {/* TABS */}
              <div className="flex bg-zinc-950 p-1 rounded-lg mb-6 border border-zinc-800">
                <button onClick={() => setActiveTab('upload')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
                    Upload Static
                </button>
                <button onClick={() => setActiveTab('link')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${activeTab === 'link' ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
                    Link External
                </button>
              </div>

              {/* --- FORM A: UPLOAD --- */}
              {activeTab === 'upload' && (
                  <form onSubmit={handleAutoDeploy} className="space-y-3 animate-in fade-in slide-in-from-left-4">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase font-bold mb-2"><CloudIcon/> Auto-Deployer</div>
                    <input type="text" placeholder="Title" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500" value={deployData.title} onChange={(e) => setDeployData({...deployData, title: e.target.value})} />
                    <input type="text" placeholder="Slug (Folder Name)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500" value={deployData.slug} onChange={(e) => setDeployData({...deployData, slug: e.target.value})} />
                    <input type="text" placeholder="Tech Stack" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500" value={deployData.tech_stack} onChange={(e) => setDeployData({...deployData, tech_stack: e.target.value})} />
                    
                    <div className="border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center hover:border-indigo-500 transition cursor-pointer relative">
                        <p className="text-xs text-zinc-500">Drag HTML/CSS/JS files here</p>
                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setSelectedFiles(e.target.files)} />
                        {selectedFiles && <p className="text-xs text-indigo-400 font-bold mt-1">{selectedFiles.length} files</p>}
                    </div>
                    <button type="submit" disabled={deploying} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-900/20">
                      {deploying ? "Uploading..." : "🚀 Launch"}
                    </button>
                  </form>
              )}

              {/* --- FORM B: LINK EXTERNAL --- */}
              {activeTab === 'link' && (
                  <form onSubmit={handleManualLink} className="space-y-3 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase font-bold mb-2"><LinkIcon/> Link Project</div>
                    <input type="text" placeholder="Title" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500" value={linkData.title} onChange={(e) => setLinkData({...linkData, title: e.target.value})} />
                    <input type="text" placeholder="Live URL (https://...)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 font-mono" value={linkData.url} onChange={(e) => setLinkData({...linkData, url: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Slug (ID)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500" value={linkData.slug} onChange={(e) => setLinkData({...linkData, slug: e.target.value})} />
                        <input type="text" placeholder="Tech" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500" value={linkData.tech_stack} onChange={(e) => setLinkData({...linkData, tech_stack: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-900/20">
                      🔗 Link Project
                    </button>
                  </form>
              )}

            </div>
          </div>

          {/* --- RIGHT COLUMN: LIVE REGISTRY --- */}
          <div className="lg:col-span-2">
             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                 <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Live Registry</h2>
                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400 font-mono">{projects.length} ITEMS</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-950 uppercase text-[10px] font-bold text-zinc-500 tracking-wider">
                            <tr><th className="p-4">Module</th><th className="p-4">Type</th><th className="p-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {projects.map((proj:any) => (
                                <tr key={proj.id} className="hover:bg-zinc-800/50">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{proj.title}</div>
                                        <div className="text-[10px] text-zinc-600">/{proj.slug}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${proj.type === 'static' ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/20' : 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20'}`}>
                                            {proj.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDelete(proj.id)} className="text-zinc-600 hover:text-red-400"><TrashIcon/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}