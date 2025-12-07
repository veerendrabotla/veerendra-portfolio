import React, { useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2, Calendar, Loader2, Sparkles } from 'lucide-react';
import { ExperienceItem } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { improveWriting } from '../../services/geminiService';

interface ExperienceManagerProps {
  experience: ExperienceItem[];
  onRefresh: () => void;
}

const ExperienceManager: React.FC<ExperienceManagerProps> = ({ experience, onRefresh }) => {
  const [editing, setEditing] = useState<Partial<ExperienceItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [polishing, setPolishing] = useState(false);

  const handleSave = async () => {
    if (!editing) return;
    setLoading(true);

    const descArray = typeof editing.description === 'string' 
      ? (editing.description as string).split('\n').filter(Boolean) 
      : editing.description || [];

    const payload = {
      role: editing.role,
      company: editing.company,
      period: editing.period,
      type: editing.type || 'work',
      description: descArray,
      visible: true
    };

    let error;
    if (editing.id) {
      const res = await supabase.from('experience').update(payload).eq('id', editing.id);
      error = res.error;
    } else {
      const res = await supabase.from('experience').insert([payload]);
      error = res.error;
    }

    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      setEditing(null);
      onRefresh();
    }
  };

  const handlePolish = async () => {
    if (!editing?.description) return;
    setPolishing(true);
    
    // Convert array to string if needed
    const currentText = Array.isArray(editing.description) 
       ? editing.description.join('\n') 
       : editing.description;

    try {
      const improved = await improveWriting(currentText);
      // Ensure we split back into array for storage, but keep string for textarea
      setEditing({ ...editing, description: improved });
    } catch (e) {
      console.error(e);
      alert("AI Polish failed.");
    } finally {
      setPolishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this experience entry?")) {
      await supabase.from('experience').delete().eq('id', id);
      onRefresh();
    }
  };

  if (editing) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-700 animate-in slide-in-from-right-10">
        <h3 className="text-2xl font-bold text-white mb-6">{editing.id ? 'Edit Experience' : 'Add Experience'}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Role / Degree</label>
              <input 
                value={editing.role || ''} 
                onChange={e => setEditing({...editing, role: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Company / Institution</label>
              <input 
                value={editing.company || ''} 
                onChange={e => setEditing({...editing, company: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm text-slate-400 mb-1">Period</label>
               <input 
                 value={editing.period || ''} 
                 onChange={e => setEditing({...editing, period: e.target.value})}
                 placeholder="e.g. 2022 - Present"
                 className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
               />
             </div>
             <div>
               <label className="block text-sm text-slate-400 mb-1">Type</label>
               <select 
                 value={editing.type || 'work'} 
                 onChange={e => setEditing({...editing, type: e.target.value as any})}
                 className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
               >
                 <option value="work">Work Experience</option>
                 <option value="education">Education</option>
                 <option value="hackathon">Hackathon</option>
               </select>
             </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
               <label className="block text-sm text-slate-400">Description (One point per line)</label>
               <button 
                 onClick={handlePolish}
                 disabled={polishing || !editing.description}
                 className="text-xs flex items-center gap-1 text-purple-400 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 px-2 py-1 rounded transition-colors disabled:opacity-50"
               >
                 {polishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                 {polishing ? 'Polishing...' : 'AI Polish'}
               </button>
            </div>
            <textarea 
              value={Array.isArray(editing.description) ? editing.description.join('\n') : editing.description || ''} 
              onChange={e => setEditing({...editing, description: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white h-32 leading-relaxed"
              placeholder="• Achieved X..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setEditing(null)} className="px-6 py-2 rounded-lg text-slate-400 hover:bg-slate-800">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-2">
              {loading && <Loader2 className="w-3 h-3 animate-spin"/>} Save Entry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Experience Timeline</h2>
        <button onClick={() => setEditing({})} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      <div className="relative border-l border-slate-800 ml-4 space-y-8">
        {experience.map((item) => (
          <div key={item.id} className="relative pl-8 group">
             <div className={`absolute -left-[5px] top-4 w-3 h-3 rounded-full border border-slate-900 ${
                item.type === 'work' ? 'bg-cyan-500' : 
                item.type === 'hackathon' ? 'bg-purple-500' : 'bg-slate-500'
             }`} />
             
             <div className="glass-panel p-6 rounded-xl border border-slate-700 hover:bg-slate-800/50 transition-colors relative">
                <div className="flex justify-between items-start mb-2">
                   <div>
                      <h3 className="text-xl font-bold text-white">{item.role}</h3>
                      <p className="text-slate-400 font-medium">{item.company}</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-slate-500 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                         <Calendar className="w-3 h-3" /> {item.period}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => setEditing(item)} className="p-2 text-cyan-400 hover:bg-slate-700 rounded"><Edit2 className="w-4 h-4"/></button>
                         <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-slate-700 rounded"><Trash2 className="w-4 h-4"/></button>
                      </div>
                   </div>
                </div>
                <div className="space-y-1">
                   {item.description.map((desc, i) => (
                      <p key={i} className="text-sm text-slate-400 flex items-start gap-2">
                         <span className="text-slate-600 mt-1.5 w-1.5 h-1.5 bg-slate-600 rounded-full flex-shrink-0" />
                         {desc}
                      </p>
                   ))}
                </div>
                <span className={`absolute top-4 right-14 text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                    item.type === 'work' ? 'border-cyan-500/20 text-cyan-400' : 
                    item.type === 'hackathon' ? 'border-purple-500/20 text-purple-400' : 'border-slate-500/20 text-slate-400'
                }`}>
                   {item.type}
                </span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceManager;