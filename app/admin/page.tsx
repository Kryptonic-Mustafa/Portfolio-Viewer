"use client";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';

// Icons
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CloudIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;

export default function AdminDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  
  // Auto-Deploy State
  const [deployData, setDeployData] = useState({
    title: "", slug: "", tech_stack: "", description: ""
  });
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

  // --- AUTO DEPLOY HANDLER ---
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
    
    // Add all files
    for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
    }

    try {
        const res = await fetch("/api/deploy", { method: "POST", body: formData });
        const result = await res.json();

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Deployment Started!',
                text: 'Your files are uploading to GitHub. Vercel will rebuild the site in ~60 seconds.',
                background: '#18181b', color: '#fff'
            });
            setDeployData({ title: "", slug: "", tech_stack: "", description: "" });
            setSelectedFiles(null);
            // Refresh list immediately (it will show in DB, but files take 1 min to appear on site)
            fetchProjects();
        } else {
            throw new Error(result.error);
        }
    } catch (error: any) {
        Swal.fire({ icon: 'error', title: 'Deploy Failed', text: error.message, background: '#18181b', color: '#fff' });
    } finally {
        setDeploying(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Admin Console</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT: AUTO DEPLOYER --- */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-indigo-900/20 to-zinc-900 border border-indigo-500/30 rounded-2xl p-6 sticky top-8 shadow-xl">
              <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CloudIcon /> Auto-Deployer
              </h2>
              <form onSubmit={handleAutoDeploy} className="space-y-3">
                <input type="text" placeholder="Project Title" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none" 
                  value={deployData.title} onChange={(e) => setDeployData({...deployData, title: e.target.value})} />
                
                <input type="text" placeholder="Slug (Folder Name)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none" 
                  value={deployData.slug} onChange={(e) => setDeployData({...deployData, slug: e.target.value})} />
                
                <input type="text" placeholder="Tech Stack" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none" 
                  value={deployData.tech_stack} onChange={(e) => setDeployData({...deployData, tech_stack: e.target.value})} />
                
                 {/* FILE UPLOAD INPUT */}
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center hover:border-indigo-500 transition cursor-pointer relative">
                    <p className="text-xs text-zinc-500 mb-1">Drag index.html & style.css here</p>
                    <input 
                        type="file" 
                        multiple 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setSelectedFiles(e.target.files)}
                    />
                    {selectedFiles && <p className="text-xs text-indigo-400 font-bold">{selectedFiles.length} files selected</p>}
                </div>

                <button 
                    type="submit" 
                    disabled={deploying}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-indigo-900/20 flex justify-center"
                >
                  {deploying ? "Uploading..." : "🚀 Launch to Cloud"}
                </button>
              </form>
              <p className="text-[10px] text-zinc-600 mt-4 text-center">
                * Uploads files to GitHub & Triggers Vercel.
              </p>
            </div>
          </div>

          {/* --- RIGHT: LIVE REGISTRY --- */}
          <div className="lg:col-span-2">
             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                 <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Live Registry</h2>
                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400 font-mono">{projects.length} ITEMS</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-950 uppercase text-[10px] font-bold text-zinc-500 tracking-wider">
                            <tr><th className="p-4">Module</th><th className="p-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {projects.map((proj:any) => (
                                <tr key={proj.id} className="hover:bg-zinc-800/50">
                                    <td className="p-4 font-bold text-white">
                                        {proj.title}
                                        <div className="text-[10px] text-zinc-600">/{proj.slug}</div>
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