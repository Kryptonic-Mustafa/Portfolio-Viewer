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
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: '#18181b',
      color: '#fff'
    });

    if (result.isConfirmed) {
      await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      fetchProjects();
      Swal.fire({
        title: 'Deleted!',
        text: 'Project has been removed.',
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
        title: 'Project Deployed',
        text: `${formData.title} is now live!`,
        background: '#18181b',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false
      });
      setFormData({ title: "", description: "", slug: "", type: "static", project_url: "", tech_stack: "" });
      fetchProjects();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not save project.', background: '#18181b', color: '#fff' });
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT: COMPACT FORM --- */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Add Project</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Title" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none" 
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Slug" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none" 
                  value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
                <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-400 outline-none"
                  value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="static">Static</option>
                  <option value="external">External</option>
                </select>
              </div>

              <input type="text" placeholder="URL / Folder Name" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none font-mono" 
                value={formData.project_url} onChange={(e) => setFormData({...formData, project_url: e.target.value})} />
              
              <input type="text" placeholder="Tech Stack (React, CSS...)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none" 
                value={formData.tech_stack} onChange={(e) => setFormData({...formData, tech_stack: e.target.value})} />
              
              <textarea placeholder="Description" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none h-20"
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition-all">
                Publish
              </button>
            </form>
          </div>
        </div>

        {/* --- RIGHT: COMPACT TABLE LIST --- */}
        <div className="lg:col-span-2">
           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
               <h2 className="font-bold text-white">Project Registry</h2>
               <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">{projects.length} Total</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-950/50 uppercase text-xs font-bold text-zinc-500">
                  <tr>
                    <th className="p-4">Project</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Tech</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? <tr><td className="p-4">Loading...</td></tr> : projects.map((proj: any) => (
                    <tr key={proj.id} className="hover:bg-zinc-800/50 transition">
                      <td className="p-4">
                        <div className="font-bold text-white">{proj.title}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">/{proj.slug}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${proj.type === 'static' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-pink-900/30 text-pink-400'}`}>
                          {proj.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 truncate max-w-[150px]">{proj.tech_stack}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(proj.id)} className="text-zinc-500 hover:text-red-400 transition p-2 hover:bg-zinc-800 rounded">
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {projects.length === 0 && !loading && <div className="p-8 text-center text-zinc-600">No projects found.</div>}
            </div>
           </div>
        </div>

      </div>
    </div>
  );
}