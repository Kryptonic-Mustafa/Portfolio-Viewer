"use client";

import { useState, useEffect } from "react";
import Swal from 'sweetalert2';

// --- ICONS ---
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "", description: "", slug: "", type: "static", project_url: "", tech_stack: "",
  });

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
    const result = await Swal.fire({
      title: 'Delete Project?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      background: '#18181b',
      color: '#fff'
    });

    if (result.isConfirmed) {
      await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      fetchProjects();
      Swal.fire({
        title: 'Deleted!',
        icon: 'success',
        background: '#18181b',
        color: '#fff',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.slug) return Swal.fire({ icon: 'error', title: 'Oops...', text: 'Title and Slug are required!', background: '#18181b', color: '#fff' });

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Project registered successfully.',
        background: '#18181b',
        color: '#fff',
        timer: 1500,
        showConfirmButton: false
      });
      setFormData({ title: "", description: "", slug: "", type: "static", project_url: "", tech_stack: "" });
      fetchProjects();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Database connection failed.', background: '#18181b', color: '#fff' });
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Admin Console</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT: COMPACT FORM --- */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-8 shadow-xl">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Register Module</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" placeholder="Title" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none transition" 
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Slug" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none transition" 
                    value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-400 outline-none transition"
                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="static">Static</option>
                    <option value="external">External</option>
                  </select>
                </div>

                <input type="text" placeholder="Folder Name / URL" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none font-mono transition" 
                  value={formData.project_url} onChange={(e) => setFormData({...formData, project_url: e.target.value})} />
                
                <input type="text" placeholder="Tech Stack (e.g. React, Next)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none transition" 
                  value={formData.tech_stack} onChange={(e) => setFormData({...formData, tech_stack: e.target.value})} />
                
                <textarea placeholder="Description" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none h-24 transition"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-indigo-900/20">
                  Deploy
                </button>
              </form>
            </div>
          </div>

          {/* --- RIGHT: COMPACT TABLE LIST --- */}
          <div className="lg:col-span-2">
             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                 <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Live Registry</h2>
                 <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400 font-mono">{projects.length} ITEMS</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-950 uppercase text-[10px] font-bold text-zinc-500 tracking-wider">
                    <tr>
                      <th className="p-4">Module</th>
                      <th className="p-4">Tech</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {loading ? <tr><td className="p-4">Loading...</td></tr> : projects.map((proj: any) => (
                      <tr key={proj.id} className="hover:bg-zinc-800/50 transition group">
                        <td className="p-4">
                          <div className="font-bold text-white flex items-center gap-2">
                             {proj.title}
                             <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${proj.type === 'static' ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/20' : 'bg-pink-900/20 text-pink-400 border-pink-500/20'}`}>
                               {proj.type}
                             </span>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate max-w-[200px]">{proj.project_url}</div>
                        </td>
                        <td className="p-4 truncate max-w-[120px] text-xs">
                           {proj.tech_stack}
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDelete(proj.id)} className="text-zinc-600 hover:text-red-400 transition p-2 hover:bg-zinc-800 rounded-md">
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {projects.length === 0 && !loading && <div className="p-12 text-center text-zinc-600 text-sm">System Empty. Initialize a project.</div>}
              </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}