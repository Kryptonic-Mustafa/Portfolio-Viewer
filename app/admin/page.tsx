"use client";
import { useState, useEffect, useRef } from "react";
import Swal from 'sweetalert2';

// --- ICONS ---
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CloudIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const LinkIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const FileIcon = () => <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const PlayIcon = () => <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;

export default function AdminDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
  const [deploying, setDeploying] = useState(false);
  
  // Data States
  const [deployData, setDeployData] = useState({ title: "", slug: "", tech_stack: "", description: "" });
  const [linkData, setLinkData] = useState({ title: "", url: "", slug: "", tech_stack: "", description: "" });
  
  // File Handling
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [entryPoint, setEntryPoint] = useState<string | null>(null); // To store "admin/index.html"
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if(Array.isArray(data)) setProjects(data);
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id: number) {
    if(!confirm("Delete this project?")) return;
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    fetchProjects();
  }

  // --- 1. HANDLE FOLDER SELECTION ---
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setSelectedFiles(e.target.files);
          // Default: Try to find "index.html" automatically
          const files = Array.from(e.target.files);
          const indexFile = files.find(f => f.webkitRelativePath.endsWith('index.html'));
          if (indexFile) setEntryPoint(indexFile.webkitRelativePath);
          else setEntryPoint(files[0].webkitRelativePath);
      }
  };

  // --- 2. DEPLOY HANDLER ---
  async function handleAutoDeploy(e: React.FormEvent) {
    e.preventDefault();
    if (!deployData.title || !deployData.slug || !selectedFiles || !entryPoint) {
        return Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please fill fields, select a folder, and choose a Start File.', background: '#18181b', color: '#fff'});
    }

    setDeploying(true);
    const formData = new FormData();
    formData.append('title', deployData.title);
    formData.append('slug', deployData.slug);
    formData.append('tech_stack', deployData.tech_stack);
    formData.append('description', deployData.description);
    
    // Crucial: Create a map of Filename -> Relative Path
    // Because FormData flattens files, we need to send the paths separately
    const pathsMap: Record<string, string> = {};
    
    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        formData.append('files', file);
        pathsMap[file.name] = file.webkitRelativePath; // Store "folder/sub/style.css"
    }

    formData.append('paths', JSON.stringify(pathsMap));
    formData.append('entry_point', entryPoint); // e.g. "my-project/admin/index.html"

    try {
        const res = await fetch("/api/deploy", { method: "POST", body: formData });
        const result = await res.json();
        if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Deployed!', text: 'Site rebuilding...', background: '#18181b', color: '#fff' });
            setDeployData({ title: "", slug: "", tech_stack: "", description: "" });
            setSelectedFiles(null);
            setEntryPoint(null);
            fetchProjects();
        } else { throw new Error(result.error); }
    } catch (error: any) {
        Swal.fire({ icon: 'error', title: 'Failed', text: error.message, background: '#18181b', color: '#fff' });
    } finally { setDeploying(false); }
  }

  // --- 3. LINK HANDLER (Keep same) ---
  async function handleManualLink(e: React.FormEvent) {
      // ... (Keep existing Link logic)
      e.preventDefault();
      // ... logic here ...
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans p-4 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 tracking-tight">Admin Console</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* --- LEFT: ACTION CENTER --- */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 sticky top-8 shadow-xl">
              
              <div className="flex bg-zinc-950 p-1 rounded-lg mb-6 border border-zinc-800">
                <button onClick={() => setActiveTab('upload')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
                    Upload Project
                </button>
                <button onClick={() => setActiveTab('link')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${activeTab === 'link' ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
                    Link External
                </button>
              </div>

              {activeTab === 'upload' ? (
                  <form onSubmit={handleAutoDeploy} className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase font-bold mb-2"><CloudIcon/> Smart Deployer</div>
                    
                    <input type="text" placeholder="Project Title" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-indigo-500" value={deployData.title} onChange={(e) => setDeployData({...deployData, title: e.target.value})} />
                    <input type="text" placeholder="Slug (Unique Folder Name)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-indigo-500" value={deployData.slug} onChange={(e) => setDeployData({...deployData, slug: e.target.value})} />
                    <input type="text" placeholder="Tech Stack" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-indigo-500" value={deployData.tech_stack} onChange={(e) => setDeployData({...deployData, tech_stack: e.target.value})} />
                    
                    {/* FOLDER UPLOAD */}
                    <div 
                        className="border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center hover:border-indigo-500 transition cursor-pointer relative bg-zinc-950/50"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <p className="text-xs text-zinc-400 font-bold mb-1">Click to Select Folder</p>
                        <p className="text-[10px] text-zinc-600">Preserves sub-folders (css/js/img)</p>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            // @ts-ignore
                            webkitdirectory="" directory="" multiple="" 
                            className="hidden" 
                            onChange={handleFolderSelect} 
                        />
                    </div>

                    {/* FILE TREE / ENTRY POINT SELECTOR */}
                    {selectedFiles && (
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2 sticky top-0 bg-zinc-950">Select Start File:</p>
                            <div className="space-y-1">
                                {Array.from(selectedFiles).map((file: any, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => setEntryPoint(file.webkitRelativePath)}
                                        className={`flex items-center gap-2 text-xs p-1.5 rounded cursor-pointer transition ${entryPoint === file.webkitRelativePath ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-500/30' : 'text-zinc-500 hover:bg-zinc-900'}`}
                                    >
                                        {entryPoint === file.webkitRelativePath ? <PlayIcon /> : <FileIcon />}
                                        <span className="truncate">{file.webkitRelativePath}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={deploying} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg">
                      {deploying ? "Deploying..." : "🚀 Launch"}
                    </button>
                  </form>
              ) : (
                  // KEEP LINK FORM AS IS
                  <div className="text-center text-zinc-500 text-sm py-10">Use Manual Link Form...</div>
              )}
            </div>
          </div>

          {/* --- RIGHT: LIVE REGISTRY --- */}
          <div className="lg:col-span-2">
             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                 <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <h2 className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-widest">Live Registry</h2>
                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400 font-mono">{projects.length} ITEMS</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400 min-w-[500px]">
                        <thead className="bg-zinc-950 uppercase text-[10px] font-bold text-zinc-500 tracking-wider">
                            <tr><th className="p-4">Module</th><th className="p-4">Type</th><th className="p-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {projects.map((proj:any) => (
                                <tr key={proj.id} className="hover:bg-zinc-800/50">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{proj.title}</div>
                                        <div className="text-[10px] text-zinc-600 truncate max-w-[200px]">
                                            {proj.project_url.length > 30 ? '...'+proj.project_url.slice(-30) : proj.project_url}
                                        </div>
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