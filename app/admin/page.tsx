"use client";
import { useState, useEffect, useRef } from "react";
import Swal from 'sweetalert2';

// --- ICONS ---
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CloudIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const LinkIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const FileIcon = () => <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const PlayIcon = () => <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const PaperIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

// --- RESUME TEMPLATE GENERATOR ---
const generateResumeHTML = (data: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} - Resume</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f4f4f5; color: #333; }
        .container { max-width: 800px; margin: 40px auto; background: white; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        h1 { margin: 0; color: #111; font-size: 2.5rem; }
        .role { color: #6366f1; font-weight: bold; font-size: 1.2rem; margin-bottom: 20px; display: block; }
        .section { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        .section-title { font-size: 0.9rem; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; }
        .exp-item { margin-bottom: 20px; }
        .exp-title { font-weight: bold; font-size: 1.1rem; }
        .exp-meta { font-size: 0.9rem; color: #666; margin-bottom: 5px; }
        .skills { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill-tag { background: #eef2ff; color: #4f46e5; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
        .contact { margin-top: 40px; font-size: 0.9rem; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${data.name}</h1>
        <span class="role">${data.role}</span>
        <p>${data.bio}</p>

        <div class="section">
            <div class="section-title">Experience</div>
            <div class="exp-item">
                <div class="exp-title">${data.expRole}</div>
                <div class="exp-meta">${data.expCompany} | ${data.expDate}</div>
                <p>${data.expDesc}</p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills">
                ${data.skills.split(',').map((s: string) => `<span class="skill-tag">${s.trim()}</span>`).join('')}
            </div>
        </div>

        <div class="contact">
            ${data.email} | ${data.location}
        </div>
    </div>
</body>
</html>
`;

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<'projects' | 'resume'>('projects');
  const [projects, setProjects] = useState<any[]>([]);
  
  // Project Upload State
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
  const [deploying, setDeploying] = useState(false);
  const [deployData, setDeployData] = useState({ title: "", slug: "", tech_stack: "", description: "" });
  const [linkData, setLinkData] = useState({ title: "", url: "", slug: "", tech_stack: "", description: "" });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [entryPoint, setEntryPoint] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resume Builder State
  const [resumeData, setResumeData] = useState({
      name: "", role: "", bio: "", email: "", location: "",
      expRole: "", expCompany: "", expDate: "", expDesc: "", skills: ""
  });

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

  // --- PROJECT DEPLOY HANDLER ---
  async function handleAutoDeploy(e: React.FormEvent) {
    e.preventDefault();
    if (!deployData.title || !deployData.slug || !selectedFiles || !entryPoint) {
        return Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Fill all fields & Select Folder', background: '#18181b', color: '#fff'});
    }
    await performDeploy(deployData.title, deployData.slug, deployData.tech_stack, deployData.description, entryPoint, Array.from(selectedFiles));
  }

  // --- RESUME DEPLOY HANDLER (THE MAGIC) ---
  async function handleResumeDeploy(e: React.FormEvent) {
      e.preventDefault();
      if (!resumeData.name || !resumeData.role) return Swal.fire({icon: 'warning', text: 'Name & Role required'});

      // 1. Generate HTML
      const htmlContent = generateResumeHTML(resumeData);
      const htmlFile = new File([htmlContent], "index.html", { type: "text/html" });
      
      // 2. Reuse Deployment Engine
      // We create a virtual "folder" with just index.html
      await performDeploy(
          "My Resume", 
          "resume", 
          "HTML, CSS", 
          "Auto-Generated Resume", 
          "index.html", 
          [htmlFile]
      );
  }

  // --- SHARED DEPLOYMENT FUNCTION ---
  async function performDeploy(title: string, slug: string, tech: string, desc: string, entry: string, files: File[]) {
    setDeploying(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('tech_stack', tech);
    formData.append('description', desc);
    
    const paths: string[] = [];
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
        // For resume, we just say filename. For folders, we use relativePath
        paths.push((files[i] as any).webkitRelativePath || files[i].name); 
    }
    formData.append('paths', JSON.stringify(paths));
    formData.append('entry_point', entry);

    try {
        const res = await fetch("/api/deploy", { method: "POST", body: formData });
        if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Deployed!', text: 'Site rebuilding...', background: '#18181b', color: '#fff' });
            // Reset Forms
            setDeployData({ title: "", slug: "", tech_stack: "", description: "" });
            setSelectedFiles(null); setEntryPoint(null);
            fetchProjects();
        } else { throw new Error("Deploy Failed"); }
    } catch (error: any) {
        Swal.fire({ icon: 'error', title: 'Failed', text: error.message, background: '#18181b', color: '#fff' });
    } finally { setDeploying(false); }
  }

  // --- LINK HANDLER ---
  async function handleManualLink(e: React.FormEvent) {
      e.preventDefault();
      const res = await fetch("/api/projects", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...linkData, type: 'external', project_url: linkData.url })
      });
      if (res.ok) { Swal.fire({ icon: 'success', title: 'Linked!', background: '#18181b', color: '#fff' }); fetchProjects(); }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans flex">
      
      {/* --- ADMIN SIDEBAR --- */}
      <div className="w-64 border-r border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-2">
        <h1 className="text-xl font-bold text-white mb-6">Admin OS</h1>
        <button onClick={() => setActiveView('projects')} className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition ${activeView === 'projects' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:bg-zinc-800'}`}>
            Projects Manager
        </button>
        <button onClick={() => setActiveView('resume')} className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition ${activeView === 'resume' ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:bg-zinc-800'}`}>
            Resume Builder
        </button>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
            
            {/* --- VIEW: PROJECTS --- */}
            {activeView === 'projects' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex bg-zinc-950 p-1 rounded-lg mb-6 border border-zinc-800">
                                <button onClick={() => setActiveTab('upload')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-zinc-500'}`}>Upload</button>
                                <button onClick={() => setActiveTab('link')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${activeTab === 'link' ? 'bg-emerald-600 text-white' : 'text-zinc-500'}`}>Link</button>
                            </div>

                            {activeTab === 'upload' ? (
                                <form onSubmit={handleAutoDeploy} className="space-y-3">
                                    <input type="text" placeholder="Title" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={deployData.title} onChange={(e) => setDeployData({...deployData, title: e.target.value})} />
                                    <input type="text" placeholder="Slug" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={deployData.slug} onChange={(e) => setDeployData({...deployData, slug: e.target.value})} />
                                    <input type="text" placeholder="Tech Stack" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={deployData.tech_stack} onChange={(e) => setDeployData({...deployData, tech_stack: e.target.value})} />
                                    
                                    <div className="border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center cursor-pointer bg-zinc-950/50" onClick={() => fileInputRef.current?.click()}>
                                        <p className="text-xs text-zinc-400">Select Folder</p>
                                        <input type="file" ref={fileInputRef} 
                                            // @ts-ignore
                                            webkitdirectory="" directory="" multiple="" className="hidden" onChange={(e) => {
                                                if(e.target.files) {
                                                    setSelectedFiles(e.target.files);
                                                    const files = Array.from(e.target.files);
                                                    const index = files.find(f => f.webkitRelativePath.endsWith('index.html'));
                                                    setEntryPoint(index ? index.webkitRelativePath : files[0].webkitRelativePath);
                                                }
                                            }} 
                                        />
                                    </div>
                                    {entryPoint && <div className="text-[10px] text-indigo-400">Entry: {entryPoint}</div>}

                                    <button type="submit" disabled={deploying} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg">
                                        {deploying ? "Deploying..." : "🚀 Launch"}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleManualLink} className="space-y-3">
                                    <input type="text" placeholder="Title" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={linkData.title} onChange={(e) => setLinkData({...linkData, title: e.target.value})} />
                                    <input type="text" placeholder="URL" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={linkData.url} onChange={(e) => setLinkData({...linkData, url: e.target.value})} />
                                    <input type="text" placeholder="Slug" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={linkData.slug} onChange={(e) => setLinkData({...linkData, slug: e.target.value})} />
                                    <input type="text" placeholder="Tech" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={linkData.tech_stack} onChange={(e) => setLinkData({...linkData, tech_stack: e.target.value})} />
                                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg">Link Project</button>
                                </form>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                         <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Live Registry</h2>
                         <div className="space-y-2">
                            {projects.map((proj:any) => (
                                <div key={proj.id} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                    <div className="font-bold text-white">{proj.title}</div>
                                    <button onClick={() => handleDelete(proj.id)} className="text-zinc-500 hover:text-red-400"><TrashIcon/></button>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            )}

            {/* --- VIEW: RESUME BUILDER --- */}
            {activeView === 'resume' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-2xl mx-auto shadow-xl">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800">
                        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><PaperIcon /></div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Resume Generator</h2>
                            <p className="text-sm text-zinc-500">Auto-generates and deploys a static resume site.</p>
                        </div>
                    </div>

                    <form onSubmit={handleResumeDeploy} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-500 uppercase font-bold">Full Name</label>
                                <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={resumeData.name} onChange={(e) => setResumeData({...resumeData, name: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-500 uppercase font-bold">Role Title</label>
                                <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={resumeData.role} onChange={(e) => setResumeData({...resumeData, role: e.target.value})} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-zinc-500 uppercase font-bold">Professional Bio</label>
                            <textarea className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm h-24" value={resumeData.bio} onChange={(e) => setResumeData({...resumeData, bio: e.target.value})} />
                        </div>

                        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-4">
                            <h3 className="text-sm font-bold text-white">Latest Experience</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Role (e.g. Senior Dev)" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm" value={resumeData.expRole} onChange={(e) => setResumeData({...resumeData, expRole: e.target.value})} />
                                <input type="text" placeholder="Company" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm" value={resumeData.expCompany} onChange={(e) => setResumeData({...resumeData, expCompany: e.target.value})} />
                            </div>
                            <input type="text" placeholder="Date Range" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm" value={resumeData.expDate} onChange={(e) => setResumeData({...resumeData, expDate: e.target.value})} />
                            <textarea placeholder="Job Description" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm h-20" value={resumeData.expDesc} onChange={(e) => setResumeData({...resumeData, expDesc: e.target.value})} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-zinc-500 uppercase font-bold">Skills (Comma separated)</label>
                            <input type="text" placeholder="React, Node.js, Design..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={resumeData.skills} onChange={(e) => setResumeData({...resumeData, skills: e.target.value})} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Email" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={resumeData.email} onChange={(e) => setResumeData({...resumeData, email: e.target.value})} />
                            <input type="text" placeholder="Location" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={resumeData.location} onChange={(e) => setResumeData({...resumeData, location: e.target.value})} />
                        </div>

                        <button type="submit" disabled={deploying} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg">
                            {deploying ? "Generating & Deploying..." : "⚡ Generate & Deploy Resume"}
                        </button>
                    </form>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}