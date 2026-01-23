"use client";
import { useState, useEffect, useRef } from "react";
import Swal from 'sweetalert2';

// --- ICONS ---
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ExternalLinkIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;
const ChevronRight = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>;
const CloseIcon = () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
const PaperIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

// --- PROFESSIONAL RESUME TEMPLATE (HARVARD STYLE) ---
const generateResumeHTML = (data: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} - Professional Resume</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #525659; display: flex; justify-content: center; }
        .page { width: 21cm; min-height: 29.7cm; background: white; padding: 2cm; box-shadow: 0 0 20px rgba(0,0,0,0.5); margin: 20px 0; }
        
        /* Header */
        header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 25px; }
        h1 { margin: 0; font-size: 32px; text-transform: uppercase; letter-spacing: 1px; color: #111; }
        .subtitle { font-size: 16px; color: #555; margin-top: 5px; font-weight: 500; }
        .contact-info { margin-top: 10px; font-size: 14px; color: #444; display: flex; gap: 15px; flex-wrap: wrap; }
        .contact-info span { display: flex; align-items: center; gap: 5px; }

        /* Sections */
        .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #111; border-bottom: 1px solid #ddd; margin-bottom: 15px; padding-bottom: 5px; letter-spacing: 0.5px; }
        .entry { margin-bottom: 20px; }
        .entry-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
        .job-title { font-weight: 700; font-size: 16px; color: #000; }
        .company { font-weight: 600; font-size: 15px; color: #333; }
        .date { font-size: 14px; color: #666; font-style: italic; }
        .description { font-size: 14px; color: #444; line-height: 1.5; margin-top: 5px; white-space: pre-line; }
        
        /* Skills */
        .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-pill { background: #f3f4f6; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: 500; color: #374151; border: 1px solid #e5e7eb; }

        @media print {
            body { background: white; }
            .page { box-shadow: none; margin: 0; padding: 0; width: 100%; }
        }
    </style>
</head>
<body>
    <div class="page">
        <header>
            <h1>${data.name}</h1>
            <div class="subtitle">${data.role}</div>
            <div class="contact-info">
                <span>📍 ${data.location}</span>
                <span>📧 ${data.email}</span>
                <span>📱 ${data.phone}</span>
            </div>
        </header>

        <div class="section-title">Professional Summary</div>
        <div class="entry description" style="margin-bottom: 30px;">
            ${data.bio}
        </div>

        <div class="section-title">Experience</div>
        <div class="entry">
            <div class="entry-header">
                <span class="company">${data.expCompany}</span>
                <span class="date">${data.expStart} — ${data.expEnd}</span>
            </div>
            <div class="job-title">${data.expRole}</div>
            <div class="description">${data.expDesc}</div>
        </div>

        <div class="section-title">Technical Skills</div>
        <div class="skills-grid">
            ${data.skills.map((s: string) => `<span class="skill-pill">${s}</span>`).join('')}
        </div>
        
        <br>
        <div class="section-title">Education</div>
        <div class="entry">
            <div class="entry-header">
                <span class="company">${data.eduSchool}</span>
                <span class="date">${data.eduYear}</span>
            </div>
            <div class="job-title">${data.eduDegree}</div>
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

  // --- RESUME WIZARD STATE ---
  const [resumeStep, setResumeStep] = useState(1);
  const [newSkill, setNewSkill] = useState("");
  const [resumeData, setResumeData] = useState({
      name: "Mustafa Chhabrawala",
      role: "Full Stack Developer",
      email: "mustafa@example.com",
      phone: "+91 98765 43210",
      location: "Pune, India",
      bio: "Passionate developer with expertise in building scalable web applications and interactive experiences.",
      expCompany: "",
      expRole: "",
      expStart: "",
      expEnd: "",
      expDesc: "",
      eduSchool: "",
      eduDegree: "",
      eduYear: "",
      skills: ["React", "Next.js", "TypeScript", "Node.js"] as string[] 
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

  async function handleAutoDeploy(e: React.FormEvent) {
    e.preventDefault();
    if (!deployData.title || !deployData.slug || !selectedFiles || !entryPoint) {
        return Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Fill all fields & Select Folder', background: '#18181b', color: '#fff'});
    }
    await performDeploy(deployData.title, deployData.slug, deployData.tech_stack, deployData.description, entryPoint, Array.from(selectedFiles));
  }

  async function handleResumeDeploy() {
      if (!resumeData.name || !resumeData.role) return Swal.fire({icon: 'warning', text: 'Name & Role required'});

      // 1. Generate HTML
      const htmlContent = generateResumeHTML(resumeData);
      const htmlFile = new File([htmlContent], "index.html", { type: "text/html" });
      
      // 2. Reuse Deployment Engine
      await performDeploy(
          "My Resume", 
          "resume", 
          "HTML, CSS", 
          "Auto-Generated Professional Resume", 
          "index.html", 
          [htmlFile]
      );
  }

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
        paths.push((files[i] as any).webkitRelativePath || files[i].name); 
    }
    formData.append('paths', JSON.stringify(paths));
    formData.append('entry_point', entry);

    try {
        const res = await fetch("/api/deploy", { method: "POST", body: formData });
        if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Success!', text: 'Your Project is now Live!', background: '#18181b', color: '#fff' });
            fetchProjects();
        } else { throw new Error("Deploy Failed"); }
    } catch (error: any) {
        Swal.fire({ icon: 'error', title: 'Failed', text: error.message, background: '#18181b', color: '#fff' });
    } finally { setDeploying(false); }
  }

  const addSkill = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && newSkill.trim()) {
          e.preventDefault();
          setResumeData({...resumeData, skills: [...resumeData.skills, newSkill.trim()]});
          setNewSkill("");
      }
  };
  const removeSkill = (skillToRemove: string) => {
      setResumeData({...resumeData, skills: resumeData.skills.filter(s => s !== skillToRemove)});
  };

  async function handleManualLink(e: React.FormEvent) {
      e.preventDefault();
      const res = await fetch("/api/projects", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...linkData, type: 'external', project_url: linkData.url })
      });
      if (res.ok) { Swal.fire({ icon: 'success', title: 'Linked!', background: '#18181b', color: '#fff' }); fetchProjects(); }
  }

  return (
    // ✨ CHANGED: flex-col on mobile, row on desktop
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans flex flex-col md:flex-row">
      
      {/* --- ADMIN SIDEBAR (Responsive) --- */}
      {/* ✨ CHANGED: w-full on mobile, fixed width on desktop. Flex-row for buttons on mobile. */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900 p-4 md:p-6 flex flex-row md:flex-col gap-2 md:gap-4 shrink-0 overflow-x-auto md:overflow-visible items-center md:items-stretch">
        <h1 className="text-lg md:text-xl font-bold text-white md:mb-6 mr-4 md:mr-0 shrink-0">Admin OS</h1>
        
        <button onClick={() => setActiveView('projects')} className={`flex-1 md:flex-none text-left px-3 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${activeView === 'projects' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:bg-zinc-800'}`}>
            Projects
        </button>
        <button onClick={() => setActiveView('resume')} className={`flex-1 md:flex-none text-left px-3 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${activeView === 'resume' ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:bg-zinc-800'}`}>
            Resume
        </button>
        
        <div className="md:mt-auto ml-auto md:ml-0 md:pt-6 md:border-t border-zinc-800">
             <a href="/" target="_blank" className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs md:text-sm font-bold px-2 py-2 rounded transition hover:bg-zinc-800">
                <ExternalLinkIcon /> <span className="hidden md:inline">Go to Live Site</span><span className="md:hidden">Live</span>
             </a>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      {/* ✨ CHANGED: Reduced padding on mobile */}
      <div className="flex-1 p-4 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
            
            {/* --- VIEW: PROJECTS --- */}
            {activeView === 'projects' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-xl sticky top-8">
                            <div className="flex bg-zinc-950 p-1 rounded-lg mb-6 border border-zinc-800">
                                <button onClick={() => setActiveTab('upload')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-zinc-500'}`}>Upload</button>
                                <button onClick={() => setActiveTab('link')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${activeTab === 'link' ? 'bg-emerald-600 text-white' : 'text-zinc-500'}`}>Link</button>
                            </div>

                            {activeTab === 'upload' ? (
                                <form onSubmit={handleAutoDeploy} className="space-y-3">
                                    <input type="text" placeholder="Title" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={deployData.title} onChange={(e) => setDeployData({...deployData, title: e.target.value})} />
                                    <input type="text" placeholder="Slug (Folder)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={deployData.slug} onChange={(e) => setDeployData({...deployData, slug: e.target.value})} />
                                    <input type="text" placeholder="Tech Stack" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={deployData.tech_stack} onChange={(e) => setDeployData({...deployData, tech_stack: e.target.value})} />
                                    
                                    <div className="border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center cursor-pointer bg-zinc-950/50 hover:border-indigo-500 transition" onClick={() => fileInputRef.current?.click()}>
                                        <p className="text-xs text-zinc-400 font-bold">Select Folder</p>
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
                                    {entryPoint && <div className="text-[10px] text-indigo-400 font-mono bg-indigo-900/20 p-2 rounded truncate">Start: {entryPoint}</div>}

                                    <button type="submit" disabled={deploying} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg">
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
                    <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 overflow-hidden">
                         <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Live Registry</h2>
                         <div className="space-y-2">
                            {projects.map((proj:any) => (
                                <div key={proj.id} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition">
                                    <div className="min-w-0">
                                        <div className="font-bold text-white text-sm truncate">{proj.title}</div>
                                        <div className="text-[10px] text-zinc-600 font-mono truncate">/{proj.slug}</div>
                                    </div>
                                    <button onClick={() => handleDelete(proj.id)} className="text-zinc-500 hover:text-red-400 p-2 shrink-0"><TrashIcon/></button>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            )}

            {/* --- VIEW: RESUME WIZARD --- */}
            {activeView === 'resume' && (
                <div className="max-w-3xl mx-auto">
                    {/* Steps Header (Responsive) */}
                    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className={`flex items-center gap-2 shrink-0 ${resumeStep >= step ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${resumeStep >= step ? 'bg-emerald-500/20 border-emerald-500' : 'bg-zinc-900 border-zinc-700'}`}>
                                    {step}
                                </div>
                                <span className="text-xs font-bold uppercase hidden md:block">{step === 1 ? 'Details' : step === 2 ? 'Experience' : step === 3 ? 'Skills' : 'Deploy'}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-8 shadow-xl">
                        
                        {/* STEP 1: PERSONAL DETAILS */}
                        {resumeStep === 1 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                <h2 className="text-xl font-bold text-white mb-4">Personal Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Full Name</label><input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white" value={resumeData.name} onChange={e => setResumeData({...resumeData, name: e.target.value})} /></div>
                                    <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Role Title</label><input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white" value={resumeData.role} onChange={e => setResumeData({...resumeData, role: e.target.value})} /></div>
                                </div>
                                <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Professional Summary</label><textarea className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white h-24" value={resumeData.bio} onChange={e => setResumeData({...resumeData, bio: e.target.value})} /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Email</label><input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white" value={resumeData.email} onChange={e => setResumeData({...resumeData, email: e.target.value})} /></div>
                                    <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Phone</label><input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white" value={resumeData.phone} onChange={e => setResumeData({...resumeData, phone: e.target.value})} /></div>
                                </div>
                                <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Location</label><input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white" value={resumeData.location} onChange={e => setResumeData({...resumeData, location: e.target.value})} /></div>
                            </div>
                        )}

                        {/* STEP 2: EXPERIENCE */}
                        {resumeStep === 2 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                <h2 className="text-xl font-bold text-white mb-4">Latest Experience</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input placeholder="Company Name" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white" value={resumeData.expCompany} onChange={e => setResumeData({...resumeData, expCompany: e.target.value})} />
                                    <input placeholder="Job Title" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white" value={resumeData.expRole} onChange={e => setResumeData({...resumeData, expRole: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-[10px] text-zinc-500">Start Date</label><input type="month" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300" value={resumeData.expStart} onChange={e => setResumeData({...resumeData, expStart: e.target.value})} /></div>
                                    <div className="space-y-1"><label className="text-[10px] text-zinc-500">End Date</label><input type="month" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300" value={resumeData.expEnd} onChange={e => setResumeData({...resumeData, expEnd: e.target.value})} /></div>
                                </div>
                                <textarea placeholder="Job Description (Bullet points recommended)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white h-32" value={resumeData.expDesc} onChange={e => setResumeData({...resumeData, expDesc: e.target.value})} />
                                
                                <div className="pt-4 border-t border-zinc-800">
                                    <h3 className="text-sm font-bold text-zinc-400 mb-3">Education</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        <input placeholder="University" className="col-span-1 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white" value={resumeData.eduSchool} onChange={e => setResumeData({...resumeData, eduSchool: e.target.value})} />
                                        <input placeholder="Degree" className="col-span-1 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white" value={resumeData.eduDegree} onChange={e => setResumeData({...resumeData, eduDegree: e.target.value})} />
                                        <input placeholder="Year" className="col-span-1 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white" value={resumeData.eduYear} onChange={e => setResumeData({...resumeData, eduYear: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SKILLS */}
                        {resumeStep === 3 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                <h2 className="text-xl font-bold text-white mb-4">Skills & Expertise</h2>
                                <p className="text-sm text-zinc-500">Type a skill and press <b>Enter</b> to add it.</p>
                                
                                <input 
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none transition" 
                                    placeholder="e.g. React Native..." 
                                    value={newSkill} 
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={addSkill}
                                />

                                <div className="flex flex-wrap gap-2 mt-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 min-h-[100px]">
                                    {resumeData.skills.map((skill, i) => (
                                        <div key={i} className="bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                                            {skill}
                                            <button onClick={() => removeSkill(skill)} className="hover:text-white"><CloseIcon /></button>
                                        </div>
                                    ))}
                                    {resumeData.skills.length === 0 && <span className="text-zinc-600 text-sm italic">No skills added yet...</span>}
                                </div>
                            </div>
                        )}

                        {/* STEP 4: REVIEW & DEPLOY */}
                        {resumeStep === 4 && (
                            <div className="text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <PaperIcon />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Ready to Launch?</h2>
                                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                                    Your professional resume has been compiled. Clicking below will generate the HTML and deploy it to <b>/projects/resume</b>.
                                </p>
                                
                                <button onClick={handleResumeDeploy} disabled={deploying} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transform hover:scale-[1.02] transition-all">
                                    {deploying ? "Compiling & Deploying..." : "⚡ Publish Resume Now"}
                                </button>
                            </div>
                        )}

                        {/* NAVIGATION BUTTONS */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-zinc-800">
                            {resumeStep > 1 && (
                                <button onClick={() => setResumeStep(s => s - 1)} className="text-zinc-400 hover:text-white text-sm font-bold px-4 py-2 rounded bg-zinc-800">
                                    Back
                                </button>
                            )}
                            {resumeStep < 4 && (
                                <button onClick={() => setResumeStep(s => s + 1)} className="ml-auto bg-white text-black hover:bg-zinc-200 text-sm font-bold px-6 py-2 rounded flex items-center gap-2">
                                    Next Step <ChevronRight />
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}