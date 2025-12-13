"use client";

import { useState, useEffect } from "react";

type Project = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
  image?: string; // We'll just use a placeholder generator
};

export default function ProjectShowcase() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: "",
    description: "",
    tags: [],
    link: "",
    github: "",
  });
  const [currentTag, setCurrentTag] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("projects");
      if (stored) {
        setProjects(JSON.parse(stored));
      } else {
        // Default sample projects if none exist
        setProjects([
          {
            id: 1,
            title: "Student Social Media",
            description: "A comprehensive platform for students to connect, share resources, and find opportunities. Built with Next.js and PostgreSQL.",
            tags: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind"],
            link: "#",
            github: "#",
          },
          {
            id: 2,
            title: "AI Study Buddy",
            description: "An intelligent chatbot that helps students understand complex topics using the OpenRouter API.",
            tags: ["AI", "React", "API Integration"],
            link: "#",
            github: "#",
          }
        ]);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("projects", JSON.stringify(projects));
    }
  }, [projects]);

  const addProject = () => {
    if (!newProject.title || !newProject.description) return;
    
    const project: Project = {
      id: Date.now(),
      title: newProject.title!,
      description: newProject.description!,
      tags: newProject.tags || [],
      link: newProject.link,
      github: newProject.github,
      image: `https://api.dicebear.com/7.x/shapes/svg?seed=${newProject.title}`, // Auto-generate avatar/image
    };

    setProjects([project, ...projects]);
    resetForm();
  };

  const deleteProject = (id: number) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const resetForm = () => {
    setNewProject({ title: "", description: "", tags: [], link: "", github: "" });
    setCurrentTag("");
    setIsFormOpen(false);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      setNewProject({
        ...newProject,
        tags: [...(newProject.tags || []), currentTag.trim()]
      });
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewProject({
      ...newProject,
      tags: newProject.tags?.filter(t => t !== tagToRemove)
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Project Showcase</h2>
          <p className="text-gray-600 mt-1">Share your best work with the community</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium flex items-center gap-2"
        >
          <span>+</span> Add New Project
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Add New Project</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title <span className="text-red-500">*</span></label>
                <input 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  placeholder="e.g. E-commerce Dashboard"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Describe what your project does..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Demo Link</label>
                  <input 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    value={newProject.link}
                    onChange={(e) => setNewProject({...newProject, link: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Repo</label>
                  <input 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    value={newProject.github}
                    onChange={(e) => setNewProject({...newProject, github: e.target.value})}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Image URL (Optional)</label>
                  <input 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    value={newProject.image || ""}
                    onChange={(e) => setNewProject({...newProject, image: e.target.value})}
                    placeholder="https://example.com/image.png"
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newProject.tags?.map(tag => (
                    <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-blue-900">×</button>
                    </span>
                  ))}
                </div>
                <input 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Type tag and press Enter (e.g. React, Python)"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={addProject}
                disabled={!newProject.title || !newProject.description}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden flex flex-col h-full group">
            <div className="h-40 relative overflow-hidden bg-gray-100">
               {p.image ? (
                   <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               ) : (
                   <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 group-hover:scale-110 transition-transform duration-500">
                       <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                   </div>
               )}
               
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

               <div className="absolute bottom-0 left-0 p-4 text-white z-10">
                 <h3 className="text-xl font-bold truncate">{p.title}</h3>
               </div>
               
               {/* Actions overlay */}
               <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <button 
                   onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                   className="bg-black/50 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                   title="Delete Project"
                 >
                   🗑️
                 </button>
               </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">{p.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {p.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {tag}
                  </span>
                ))}
                {p.tags.length > 3 && (
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    +{p.tags.length - 3}
                  </span>
                )}
              </div>
              
              <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                {p.link && (
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors">
                    Live Demo ↗
                  </a>
                )}
                {p.github && (
                  <a href={p.github} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 py-2 rounded-lg transition-colors">
                    Code ⌨
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No projects yet. Start building your portfolio!</p>
            <button onClick={() => setIsFormOpen(true)} className="mt-4 text-blue-600 font-medium hover:underline">
              Add your first project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
