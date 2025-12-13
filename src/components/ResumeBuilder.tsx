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
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isLoaded, setIsLoaded] = useState(false);

  // Temporary states for adding new items
  const [newEdu, setNewEdu] = useState<Education>({ school: "", degree: "", year: "" });
  const [newExp, setNewExp] = useState<Experience>({ company: "", role: "", duration: "", description: "" });

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
        setSkills(parsed.skills || []);
      } catch (e) {
        console.error("Failed to load resume data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      const data = { personalInfo, education, experiences, skills };
      localStorage.setItem("resumeData", JSON.stringify(data));
    }
  }, [personalInfo, education, experiences, skills, isLoaded]);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const addEducation = () => {
    if (newEdu.school && newEdu.degree) {
      setEducation([...education, newEdu]);
      setNewEdu({ school: "", degree: "", year: "" });
    }
  };

  const addExperience = () => {
    if (newExp.company && newExp.role) {
      setExperiences([...experiences, newExp]);
      setNewExp({ company: "", role: "", duration: "", description: "" });
    }
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentSkill.trim()) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
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
      // Copy styles from main document
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
              body { background: white; margin: 0; padding: 20px; }
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
        // Give time for print dialog to open before removing
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  };

  const handleDownloadJSON = () => {
    const data = { personalInfo, education, experiences, skills };
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
          setSkills(parsed.skills || []);
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
      setSkills([]);
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
          {/* Personal Info */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  name="fullName"
                  value={personalInfo.fullName}
                  onChange={handleInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  value={personalInfo.email}
                  onChange={handleInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handleInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  name="linkedin"
                  value={personalInfo.linkedin}
                  onChange={handleInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio / Website</label>
                <input
                  name="website"
                  value={personalInfo.website}
                  onChange={handleInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="johndoe.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                <textarea
                  name="summary"
                  value={personalInfo.summary}
                  onChange={handleInfoChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Briefly describe your professional background and goals..."
                />
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
                  <button onClick={() => removeEducation(idx)} className="text-red-500 hover:text-red-700 text-sm">
                    Remove
                  </button>
                </div>
              ))}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-dashed border-gray-300 rounded-lg">
                <input
                  placeholder="School / University"
                  value={newEdu.school}
                  onChange={(e) => setNewEdu({ ...newEdu, school: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 bg-white"
                />
                <input
                  placeholder="Degree / Major"
                  value={newEdu.degree}
                  onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 bg-white"
                />
                <input
                  placeholder="Graduation Year"
                  value={newEdu.year}
                  onChange={(e) => setNewEdu({ ...newEdu, year: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 bg-white"
                />
                <button
                  onClick={addEducation}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Add Education
                </button>
              </div>
            </div>
          </section>

          {/* Experience */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Experience</h3>
            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div key={idx} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <button
                    onClick={() => removeExperience(idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                  <p className="font-bold text-gray-800">{exp.role}</p>
                  <p className="text-sm font-medium text-gray-700">{exp.company} | {exp.duration}</p>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
              <div className="space-y-3 p-4 border border-dashed border-gray-300 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    placeholder="Job Title"
                    value={newExp.role}
                    onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 bg-white"
                  />
                  <input
                    placeholder="Company"
                    value={newExp.company}
                    onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 bg-white"
                  />
                  <input
                    placeholder="Duration (e.g. 2020 - Present)"
                    value={newExp.duration}
                    onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                    className="md:col-span-2 w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 bg-white"
                  />
                </div>
                <textarea
                  placeholder="Description of responsibilities and achievements..."
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 bg-white"
                />
                <button
                  onClick={addExperience}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Add Experience
                </button>
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
              <input
                placeholder="Type a skill and press Enter"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyDown={addSkill}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
              />
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

        <div className="p-8 bg-white min-h-[800px]" ref={printRef}>
          {/* Resume Header */}
          <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wider mb-2">
              {personalInfo.fullName || "Your Name"}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              {personalInfo.email && <span>📧 {personalInfo.email}</span>}
              {personalInfo.phone && <span>📱 {personalInfo.phone}</span>}
              {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
              {personalInfo.website && <span>🌐 {personalInfo.website}</span>}
            </div>
          </div>

          {/* Summary */}
          {personalInfo.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3 pb-1">Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed text-sm text-justify">{personalInfo.summary}</p>
            </div>
          )}

          {/* Experience */}
          {experiences.length > 0 && (
            <div className="mb-6">
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
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-6">
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
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3 pb-1">Skills</h2>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-gray-700">
                {skills.map((skill, idx) => (
                  <span key={idx} className="bg-gray-100 px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
