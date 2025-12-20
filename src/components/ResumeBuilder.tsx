"use client";

import { useState, useRef, useEffect } from "react";

type Education = {
  school: string;
  degree: string;
  year: string;
};

type Experience = {
  company: string;
  role: string;
  duration: string;
  description: string;
};

type Project = {
  name: string;
  technologies: string;
  link: string;
  description: string;
};

type CustomEntry = {
  title: string;
  subtitle: string;
  date: string;
  description: string;
};

type CustomSection = {
  id: string;
  title: string;
  entries: CustomEntry[];
};

export default function ResumeBuilder() {
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    website: "",
    summary: "",
  });

  const [education, setEducation] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  
  // Default order: Education -> Skills -> Experience -> Projects
  const [sectionOrder, setSectionOrder] = useState<string[]>(["education", "skills", "experience", "projects"]);

  const [currentSkill, setCurrentSkill] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isLoaded, setIsLoaded] = useState(false);

  // Temporary states for adding new items
  const [newEdu, setNewEdu] = useState<Education>({ school: "", degree: "", year: "" });
  const [newExp, setNewExp] = useState<Experience>({ company: "", role: "", duration: "", description: "" });
  const [newProject, setNewProject] = useState<Project>({ name: "", technologies: "", link: "", description: "" });
  
  // Temporary state for new custom section
  const [newCustomSectionTitle, setNewCustomSectionTitle] = useState("");
  
  // Temporary state for new custom entry (we need to know which section it belongs to, but for simplicity we'll just track one "active" entry being added per section or use a map. 
  // To keep it simple, we'll use a map of temporary entries or just one global temp entry and a selected section. 
  // Let's use a simpler approach: A separate component or just inline state for the "currently editing" entry might be complex.
  // We'll use a map keyed by section ID to store the "new entry" state for that section.
  const [newCustomEntries, setNewCustomEntries] = useState<Record<string, CustomEntry>>({});

  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("resumeData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setPersonalInfo(parsed.personalInfo || { fullName: "", email: "", phone: "", linkedin: "", website: "", summary: "" });
        setEducation(parsed.education || []);
        setExperiences(parsed.experiences || []);
        setProjects(parsed.projects || []);
        setSkills(parsed.skills || []);
        setCustomSections(parsed.customSections || []);
        setSectionOrder(parsed.sectionOrder || ["education", "skills", "experience", "projects"]);
      } catch (e) {
        console.error("Failed to load resume data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      const data = { personalInfo, education, experiences, projects, skills, customSections, sectionOrder };
      localStorage.setItem("resumeData", JSON.stringify(data));
    }
  }, [personalInfo, education, experiences, projects, skills, customSections, sectionOrder, isLoaded]);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  // Education Handlers
  const addEducation = () => {
    if (newEdu.school && newEdu.degree) {
      setEducation([...education, newEdu]);
      setNewEdu({ school: "", degree: "", year: "" });
    }
  };
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));

  // Experience Handlers
  const addExperience = () => {
    if (newExp.company && newExp.role) {
      setExperiences([...experiences, newExp]);
      setNewExp({ company: "", role: "", duration: "", description: "" });
    }
  };
  const removeExperience = (index: number) => setExperiences(experiences.filter((_, i) => i !== index));

  // Project Handlers
  const addProject = () => {
    if (newProject.name) {
      setProjects([...projects, newProject]);
      setNewProject({ name: "", technologies: "", link: "", description: "" });
    }
  };
  const removeProject = (index: number) => setProjects(projects.filter((_, i) => i !== index));

  // Skill Handlers
  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentSkill.trim()) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };
  const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));

  // Custom Section Handlers
  const addCustomSection = () => {
    if (newCustomSectionTitle.trim()) {
      const newSection: CustomSection = {
        id: `custom-${Date.now()}`,
        title: newCustomSectionTitle.trim(),
        entries: []
      };
      setCustomSections([...customSections, newSection]);
      setSectionOrder([...sectionOrder, newSection.id]);
      setNewCustomSectionTitle("");
    }
  };

  const removeCustomSection = (id: string) => {
    setCustomSections(customSections.filter(s => s.id !== id));
    setSectionOrder(sectionOrder.filter(sid => sid !== id));
  };

  const addCustomEntry = (sectionId: string) => {
    const entry = newCustomEntries[sectionId];
    if (entry && entry.title) {
      setCustomSections(customSections.map(s => {
        if (s.id === sectionId) {
          return { ...s, entries: [...s.entries, entry] };
        }
        return s;
      }));
      setNewCustomEntries({
        ...newCustomEntries,
        [sectionId]: { title: "", subtitle: "", date: "", description: "" }
      });
    }
  };

  const removeCustomEntry = (sectionId: string, entryIndex: number) => {
    setCustomSections(customSections.map(s => {
      if (s.id === sectionId) {
        return { ...s, entries: s.entries.filter((_, i) => i !== entryIndex) };
      }
      return s;
    }));
  };

  const updateNewCustomEntry = (sectionId: string, field: keyof CustomEntry, value: string) => {
    const currentEntry = newCustomEntries[sectionId] || { title: "", subtitle: "", date: "", description: "" };
    setNewCustomEntries({
      ...newCustomEntries,
      [sectionId]: { ...currentEntry, [field]: value }
    });
  };

  // Sorting Handlers
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newOrder = [...sectionOrder];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      setSectionOrder(newOrder);
    } else if (direction === 'down' && index < sectionOrder.length - 1) {
      const newOrder = [...sectionOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setSectionOrder(newOrder);
    }
  };

  const getSectionName = (id: string) => {
    switch (id) {
      case 'education': return 'Education';
      case 'skills': return 'Skills';
      case 'experience': return 'Experience';
      case 'projects': return 'Projects';
      default:
        return customSections.find(s => s.id === id)?.title || 'Unknown Section';
    }
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      // Copy styles
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(node => node.outerHTML)
        .join('');

      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Resume - ${personalInfo.fullName}</title>
            ${styles}
            <style>
              body { background: white; margin: 0; padding: 20px; font-family: "Times New Roman", Times, serif; }
              @page { size: auto; margin: 0mm; }
            </style>
          </head>
          <body>
            ${content.innerHTML}
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  };

  const handleDownloadJSON = () => {
    const data = { personalInfo, education, experiences, projects, skills, customSections, sectionOrder };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${personalInfo.fullName.replace(/\s+/g, "-").toLowerCase() || "draft"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          setPersonalInfo(parsed.personalInfo || personalInfo);
          setEducation(parsed.education || []);
          setExperiences(parsed.experiences || []);
          setProjects(parsed.projects || []);
          setSkills(parsed.skills || []);
          setCustomSections(parsed.customSections || []);
          setSectionOrder(parsed.sectionOrder || ["education", "skills", "experience", "projects"]);
        } catch (err) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all data?")) {
      setPersonalInfo({ fullName: "", email: "", phone: "", linkedin: "", website: "", summary: "" });
      setEducation([]);
      setExperiences([]);
      setProjects([]);
      setSkills([]);
      setCustomSections([]);
      setSectionOrder(["education", "skills", "experience", "projects"]);
      localStorage.removeItem("resumeData");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Editor Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            📝 Resume Editor
          </h2>
          <div className="flex bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                activeTab === "edit" ? "bg-white text-slate-800 font-medium" : "text-slate-300 hover:text-white"
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1 rounded-md text-sm transition-colors lg:hidden ${
                activeTab === "preview" ? "bg-white text-slate-800 font-medium" : "text-slate-300 hover:text-white"
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-2 border-b flex flex-wrap gap-2 justify-end">
           <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportJSON} />
           <button onClick={() => fileInputRef.current?.click()} className="text-sm px-3 py-1 bg-white border rounded hover:bg-gray-50 flex items-center gap-1">📂 Load</button>
           <button onClick={handleDownloadJSON} className="text-sm px-3 py-1 bg-white border rounded hover:bg-gray-50 flex items-center gap-1">💾 Save</button>
           <button onClick={handleClear} className="text-sm px-3 py-1 text-red-600 bg-white border border-red-200 rounded hover:bg-red-50 flex items-center gap-1">🗑️ Clear</button>
        </div>

        <div className={`p-6 space-y-8 ${activeTab === "preview" ? "hidden lg:block" : ""}`}>
          
          {/* Section Sorter */}
          <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Section Order</h3>
            <div className="space-y-2">
              {sectionOrder.map((id, idx) => (
                <div key={id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 shadow-sm">
                  <span className="font-medium text-gray-700">{getSectionName(id)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">⬆️</button>
                    <button onClick={() => moveSection(idx, 'down')} disabled={idx === sectionOrder.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">⬇️</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Personal Info */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input name="fullName" value={personalInfo.fullName} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" value={personalInfo.email} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" value={personalInfo.phone} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input name="linkedin" value={personalInfo.linkedin} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="linkedin.com/in/johndoe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio / Website</label>
                <input name="website" value={personalInfo.website} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="johndoe.com" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                <textarea name="summary" value={personalInfo.summary} onChange={handleInfoChange} rows={3} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Briefly describe your professional background..." />
              </div>
            </div>
          </section>

          {/* Education */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Education</h3>
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-800">{edu.school}</p>
                    <p className="text-sm text-gray-600">{edu.degree}</p>
                    <p className="text-xs text-gray-500">{edu.year}</p>
                  </div>
                  <button onClick={() => removeEducation(idx)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                </div>
              ))}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-dashed border-gray-300 rounded-lg">
                <input placeholder="School / University" value={newEdu.school} onChange={(e) => setNewEdu({ ...newEdu, school: e.target.value })} className="w-full p-2 border border-gray-300 rounded" />
                <input placeholder="Degree / Major" value={newEdu.degree} onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })} className="w-full p-2 border border-gray-300 rounded" />
                <input placeholder="Graduation Year" value={newEdu.year} onChange={(e) => setNewEdu({ ...newEdu, year: e.target.value })} className="w-full p-2 border border-gray-300 rounded" />
                <button onClick={addEducation} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">Add</button>
              </div>
            </div>
          </section>

          {/* Experience */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Experience</h3>
            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div key={idx} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <button onClick={() => removeExperience(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
                  <p className="font-bold text-gray-800">{exp.role}</p>
                  <p className="text-sm font-medium text-gray-700">{exp.company} | {exp.duration}</p>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
              <div className="space-y-3 p-4 border border-dashed border-gray-300 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Job Title" value={newExp.role} onChange={(e) => setNewExp({ ...newExp, role: e.target.value })} className="w-full p-2 border border-gray-300 rounded" />
                  <input placeholder="Company" value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} className="w-full p-2 border border-gray-300 rounded" />
                  <input placeholder="Duration" value={newExp.duration} onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })} className="md:col-span-2 w-full p-2 border border-gray-300 rounded" />
                </div>
                <textarea placeholder="Description..." value={newExp.description} onChange={(e) => setNewExp({ ...newExp, description: e.target.value })} rows={3} className="w-full p-2 border border-gray-300 rounded" />
                <button onClick={addExperience} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">Add Experience</button>
              </div>
            </div>
          </section>

          {/* Projects */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Projects</h3>
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <button onClick={() => removeProject(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
                  <p className="font-bold text-gray-800">{proj.name}</p>
                  <p className="text-sm font-medium text-gray-700">{proj.technologies}</p>
                  {proj.link && <p className="text-xs text-blue-600">{proj.link}</p>}
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{proj.description}</p>
                </div>
              ))}
              <div className="space-y-3 p-4 border border-dashed border-gray-300 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Project Name" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} className="w-full p-2 border border-gray-300 rounded" />
                  <input placeholder="Technologies Used" value={newProject.technologies} onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })} className="w-full p-2 border border-gray-300 rounded" />
                  <input placeholder="Link (Optional)" value={newProject.link} onChange={(e) => setNewProject({ ...newProject, link: e.target.value })} className="md:col-span-2 w-full p-2 border border-gray-300 rounded" />
                </div>
                <textarea placeholder="Project Description..." value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} rows={3} className="w-full p-2 border border-gray-300 rounded" />
                <button onClick={addProject} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">Add Project</button>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Skills</h3>
            <div className="p-4 border border-dashed border-gray-300 rounded-lg">
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    {skill}
                    <button onClick={() => removeSkill(idx)} className="hover:text-blue-900 font-bold">×</button>
                  </span>
                ))}
              </div>
              <input placeholder="Type a skill and press Enter" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyDown={addSkill} className="w-full p-2 border border-gray-300 rounded" />
            </div>
          </section>

          {/* Custom Sections */}
          <section>
             <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Custom Sections</h3>
             
             {customSections.map((section) => (
               <div key={section.id} className="mb-6 border rounded-lg p-4 bg-gray-50">
                 <div className="flex justify-between items-center mb-4">
                   <h4 className="font-bold text-gray-800">{section.title}</h4>
                   <button onClick={() => removeCustomSection(section.id)} className="text-red-500 text-sm">Delete Section</button>
                 </div>
                 
                 <div className="space-y-4 mb-4">
                    {section.entries.map((entry, idx) => (
                      <div key={idx} className="relative bg-white p-3 rounded border border-gray-200">
                        <button onClick={() => removeCustomEntry(section.id, idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs">Remove</button>
                        <p className="font-bold text-sm">{entry.title}</p>
                        <p className="text-xs text-gray-600">{entry.subtitle} | {entry.date}</p>
                        <p className="text-xs mt-1 text-gray-500">{entry.description}</p>
                      </div>
                    ))}
                 </div>

                 <div className="space-y-2 border-t pt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Add Entry</p>
                    <input placeholder="Title (e.g. Award Name)" value={newCustomEntries[section.id]?.title || ""} onChange={(e) => updateNewCustomEntry(section.id, 'title', e.target.value)} className="w-full p-2 text-sm border rounded" />
                    <div className="grid grid-cols-2 gap-2">
                       <input placeholder="Subtitle (e.g. Organization)" value={newCustomEntries[section.id]?.subtitle || ""} onChange={(e) => updateNewCustomEntry(section.id, 'subtitle', e.target.value)} className="w-full p-2 text-sm border rounded" />
                       <input placeholder="Date / Year" value={newCustomEntries[section.id]?.date || ""} onChange={(e) => updateNewCustomEntry(section.id, 'date', e.target.value)} className="w-full p-2 text-sm border rounded" />
                    </div>
                    <textarea placeholder="Description" value={newCustomEntries[section.id]?.description || ""} onChange={(e) => updateNewCustomEntry(section.id, 'description', e.target.value)} rows={2} className="w-full p-2 text-sm border rounded" />
                    <button onClick={() => addCustomEntry(section.id)} className="w-full bg-slate-600 text-white text-sm py-1 rounded hover:bg-slate-700">Add Entry</button>
                 </div>
               </div>
             ))}

             <div className="flex gap-2">
               <input 
                 placeholder="New Section Title (e.g. Awards, Volunteer)" 
                 value={newCustomSectionTitle}
                 onChange={(e) => setNewCustomSectionTitle(e.target.value)}
                 className="flex-1 p-2 border border-gray-300 rounded"
               />
               <button onClick={addCustomSection} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Section</button>
             </div>
          </section>

        </div>
      </div>

      {/* Preview Section */}
      <div className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 ${activeTab === "edit" ? "hidden lg:block" : ""}`}>
        <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">📄 Live Preview</h2>
          <button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center gap-1"
          >
            <span>🖨️</span> Print / PDF
          </button>
        </div>

        <div className="p-8 bg-white min-h-[800px]" ref={printRef} style={{ fontFamily: '"Times New Roman", Times, serif' }}>
          {/* Resume Header */}
          <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wider mb-2">
              {personalInfo.fullName || "Your Name"}
            </h1>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.email && personalInfo.phone && <span className="text-gray-400">|</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.phone && personalInfo.linkedin && <span className="text-gray-400">|</span>}
              {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
              {personalInfo.linkedin && personalInfo.website && <span className="text-gray-400">|</span>}
              {personalInfo.website && <span>{personalInfo.website}</span>}
            </div>
          </div>

          {/* Summary */}
          {personalInfo.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3 pb-1">Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed text-sm text-justify">{personalInfo.summary}</p>
            </div>
          )}

          {/* Dynamic Sections */}
          {sectionOrder.map(sectionId => {
            switch(sectionId) {
              case 'education':
                return education.length > 0 && (
                  <div key="education" className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3 pb-1">Education</h2>
                    <div className="space-y-3">
                      {education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between items-baseline">
                          <div>
                            <h3 className="font-bold text-gray-800">{edu.school}</h3>
                            <p className="text-sm text-gray-700">{edu.degree}</p>
                          </div>
                          <span className="text-sm text-gray-600">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              
              case 'experience':
                return experiences.length > 0 && (
                  <div key="experience" className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3 pb-1">Experience</h2>
                    <div className="space-y-4">
                      {experiences.map((exp, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-gray-800">{exp.role}</h3>
                            <span className="text-sm text-gray-600 whitespace-nowrap">{exp.duration}</span>
                          </div>
                          <div className="text-sm font-semibold text-gray-700 mb-1">{exp.company}</div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case 'projects':
                return projects.length > 0 && (
                  <div key="projects" className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3 pb-1">Projects</h2>
                    <div className="space-y-4">
                      {projects.map((proj, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-gray-800">{proj.name}</h3>
                          </div>
                          <div className="text-sm font-medium text-gray-700 mb-1">{proj.technologies}</div>
                          {proj.link && <div className="text-xs text-blue-600 mb-1">{proj.link}</div>}
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case 'skills':
                return skills.length > 0 && (
                  <div key="skills" className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3 pb-1">Technical Skills</h2>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-gray-700">
                      {skills.map((skill, idx) => (
                        <span key={idx} className="bg-gray-100 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );

              default:
                const customSection = customSections.find(s => s.id === sectionId);
                if (customSection && customSection.entries.length > 0) {
                  return (
                    <div key={customSection.id} className="mb-6">
                      <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3 pb-1">{customSection.title}</h2>
                      <div className="space-y-4">
                        {customSection.entries.map((entry, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-bold text-gray-800">{entry.title}</h3>
                              <span className="text-sm text-gray-600 whitespace-nowrap">{entry.date}</span>
                            </div>
                            {entry.subtitle && <div className="text-sm font-semibold text-gray-700 mb-1">{entry.subtitle}</div>}
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{entry.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
            }
          })}

        </div>
      </div>
    </div>
  );
}
