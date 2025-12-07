import React, { useState } from 'react';
import { FolderPlus, Edit2, Trash2, Eye, EyeOff, Search, Loader2, Star, Link as LinkIcon, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Project } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { suggestTechStack } from '../../services/geminiService';

interface ProjectManagerProps {
  projects: Project[];
  onRefresh: () => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to delete this project?")) {
      setLoading(true);
      const { error } = await supabase.from('projects').delete().eq('id', id);
      setLoading(false);
      
      if (error) {
        alert('Error deleting project: ' + error.message);
      } else {
        onRefresh();
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    const dbPayload = {
      title: currentProject.title,
      category: currentProject.category,
      description: currentProject.description,
      tech_stack: currentProject.techStack,
      demo_link: currentProject.demoLink,
      github_link: currentProject.githubLink,
      image: currentProject.image || 'https://picsum.photos/800/600',
      visible: currentProject.visible ?? true,
      featured: currentProject.featured ?? false,
      full_description: currentProject.fullDescription
    };

    let error;
    if (currentProject.id) {
       const res = await supabase.from('projects').update(dbPayload).eq('id', currentProject.id);
       error = res.error;
    } else {
       const res = await supabase.from('projects').insert([dbPayload]);
       error = res.error;
    }

    setLoading(false);

    if (error) {
      alert('Error saving project: ' + error.message);
    } else {
      setIsEditing(false);
      setCurrentProject({});
      onRefresh();
    }
  };

  const handleSuggestStack = async () => {
    if (!currentProject.description && !currentProject.fullDescription) {
      alert("Please add a description first to get suggestions.");
      return;
    }
    setSuggesting(true);
    const textToAnalyze = currentProject.fullDescription || currentProject.description || "";
    try {
      const stack = await suggestTechStack(textToAnalyze);
      setCurrentProject(prev => ({ ...prev, techStack: stack }));
    } catch (e) {
      console.error(e);
    } finally {
      setSuggesting(false);
    }
  };

  const toggleVisibility = async (project: Project) => {
    const { error } = await supabase
      .from('projects')
      .update({ visible: !project.visible })
      .eq('id', project.id);
      
    if (!error) onRefresh();
  };

  const toggleFeatured = async (project: Project) => {
    const { error } = await supabase
      .from('projects')
      .update({ featured: !project.featured })
      .eq('id', project.id);
      
    if (!error) onRefresh();
  };

  if (isEditing) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-700 animate-in slide-in-from-right-10">
        <h3 className="text-2xl font-bold text-white mb-6">{currentProject.id ? 'Edit Project' : 'Add New Project'}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Columns */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title</label>
                <input 
                  value={currentProject.title || ''} 
                  onChange={e => setCurrentProject({...currentProject, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <input 
                  value={currentProject.category || ''} 
                  onChange={e => setCurrentProject({...currentProject, category: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Short Description</label>
              <textarea 
                value={currentProject.description || ''} 
                onChange={e => setCurrentProject({...currentProject, description: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white h-24"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                 <label className="block text-sm text-slate-400">Tech Stack (comma separated)</label>
                 <button 
                   onClick={handleSuggestStack}
                   disabled={suggesting}
                   className="text-xs flex items-center gap-1 text-cyan-400 hover:text-white disabled:opacity-50"
                 >
                   {suggesting ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                   {suggesting ? 'Analyzing...' : 'Suggest Stack'}
                 </button>
              </div>
              <input 
                value={currentProject.techStack?.join(', ') || ''} 
                onChange={e => setCurrentProject({...currentProject, techStack: e.target.value.split(',').map(s => s.trim())})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                placeholder="e.g. React, Node.js"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Full Case Study (Markdown)</label>
              <textarea 
                value={currentProject.fullDescription || ''} 
                onChange={e => setCurrentProject({...currentProject, fullDescription: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white h-32 font-mono text-sm"
              />
            </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm text-slate-400 mb-1">Live Link</label>
                 <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500"/>
                    <input 
                      value={currentProject.demoLink || ''} 
                      onChange={e => setCurrentProject({...currentProject, demoLink: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-3 text-white"
                    />
                 </div>
               </div>
               <div>
                 <label className="block text-sm text-slate-400 mb-1">GitHub Link</label>
                 <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500"/>
                    <input 
                      value={currentProject.githubLink || ''} 
                      onChange={e => setCurrentProject({...currentProject, githubLink: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-3 text-white"
                    />
                 </div>
               </div>
             </div>
          </div>

          {/* Image & Preview Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Image URL</label>
              <input 
                value={currentProject.image || ''} 
                onChange={e => setCurrentProject({...currentProject, image: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-xs font-mono"
                placeholder="https://..."
              />
            </div>
            <div className="aspect-video bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl overflow-hidden flex items-center justify-center relative group">
               {currentProject.image ? (
                  <img src={currentProject.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400?text=Invalid+Image')}/>
               ) : (
                  <div className="text-center text-slate-500">
                     <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                     <span className="text-xs">Image Preview</span>
                  </div>
               )}
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
               <input 
                  type="checkbox" 
                  checked={currentProject.featured || false}
                  onChange={e => setCurrentProject({...currentProject, featured: e.target.checked})}
                  className="rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500/50"
               />
               <label className="text-sm text-white font-medium">Feature on Homepage</label>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end gap-3">
          <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg text-slate-400 hover:bg-slate-800">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {currentProject.id ? 'Update' : 'Create'} Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Project Manager</h2>
        <button onClick={() => { setCurrentProject({}); setIsEditing(true); }} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20">
          <FolderPlus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
          <input placeholder="Search projects..." className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none" />
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-700 overflow-hidden">
        {projects.length === 0 ? (
           <div className="p-12 text-center text-slate-400">
              <p>No projects found. Add your first project!</p>
           </div>
        ) : (
        <table className="w-full text-left">
          <thead className="bg-slate-800 text-slate-400 text-sm uppercase font-semibold">
            <tr>
              <th className="p-4">Project</th>
              <th className="p-4 hidden md:table-cell">Category</th>
              <th className="p-4 text-center">Featured</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-800/50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={project.image || 'https://picsum.photos/50/50'} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-800" />
                    <div>
                      <div className="font-medium text-white">{project.title}</div>
                      <div className="flex gap-2 md:hidden mt-1">
                         <span className="text-xs text-slate-500">{project.category}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-400 hidden md:table-cell">{project.category}</td>
                <td className="p-4 text-center">
                   <button 
                     onClick={() => toggleFeatured(project)}
                     className={`p-1.5 rounded-lg transition-colors ${project.featured ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-600 hover:text-yellow-400'}`}
                   >
                      <Star className={`w-5 h-5 ${project.featured ? 'fill-yellow-400' : ''}`} />
                   </button>
                </td>
                <td className="p-4 text-center">
                   <button onClick={() => toggleVisibility(project)} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${project.visible ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                      {project.visible ? <><Eye className="w-3 h-3"/> Visible</> : <><EyeOff className="w-3 h-3"/> Hidden</>}
                   </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setCurrentProject(project); setIsEditing(true); }} className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(project.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;