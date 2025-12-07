import React, { useState } from 'react';
import { Zap, Plus, Edit2, Trash2, Save, Loader2, Gauge } from 'lucide-react';
import { Skill } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface SkillManagerProps {
  skills: Skill[];
  onRefresh: () => void;
}

const SkillManager: React.FC<SkillManagerProps> = ({ skills, onRefresh }) => {
  const [editing, setEditing] = useState<Partial<Skill> | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ['Frontend', 'Backend', 'Cloud', 'AI/ML', 'Tools'];

  const handleSave = async () => {
    if (!editing || !editing.name) return;
    setLoading(true);

    const payload = {
      name: editing.name,
      category: editing.category || 'Frontend',
      level: editing.level || 50
    };

    let error;
    if (editing.id) {
       const res = await supabase.from('skills').update(payload).eq('id', editing.id);
       error = res.error;
    } else {
       const res = await supabase.from('skills').insert([payload]);
       error = res.error;
    }

    setLoading(false);
    if (error) {
       alert('Error saving skill: ' + error.message);
    } else {
       setEditing(null);
       onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this skill?")) {
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (!error) onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Technical Arsenal</h2>
        <button 
          onClick={() => setEditing({ category: 'Frontend', level: 80 })} 
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {editing && (
         <div className="glass-panel p-6 rounded-2xl border border-slate-700 animate-in slide-in-from-right-4 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">{editing.id ? 'Edit Skill' : 'New Skill'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
               <div>
                  <label className="block text-sm text-slate-400 mb-1">Skill Name</label>
                  <input 
                    value={editing.name || ''} 
                    onChange={e => setEditing({...editing, name: e.target.value})}
                    placeholder="e.g. React Native"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                  />
               </div>
               <div>
                  <label className="block text-sm text-slate-400 mb-1">Category</label>
                  <select 
                    value={editing.category} 
                    onChange={e => setEditing({...editing, category: e.target.value as any})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                  >
                     {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-sm text-slate-400 mb-1">Proficiency ({editing.level}%)</label>
                  <div className="flex items-center gap-3">
                     <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={editing.level || 0} 
                        onChange={e => setEditing({...editing, level: parseInt(e.target.value)})}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                     />
                  </div>
               </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
               <button onClick={() => setEditing(null)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
               <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center gap-2">
                  {loading && <Loader2 className="w-3 h-3 animate-spin" />} Save Skill
               </button>
            </div>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {categories.map(category => (
            <div key={category} className="space-y-3">
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${category === 'Frontend' ? 'bg-cyan-500' : category === 'Backend' ? 'bg-green-500' : category === 'AI/ML' ? 'bg-purple-500' : 'bg-slate-500'}`} />
                  {category}
               </h3>
               <div className="space-y-2">
                  {skills.filter(s => s.category === category).map(skill => (
                     <div key={skill.id || skill.name} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between group hover:border-slate-600 transition-colors">
                        <div>
                           <div className="font-bold text-slate-200">{skill.name}</div>
                           <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Gauge className="w-3 h-3" /> {skill.level}%
                           </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => setEditing(skill)} className="p-1.5 hover:bg-slate-800 rounded text-cyan-400"><Edit2 className="w-3 h-3" /></button>
                           {skill.id && <button onClick={() => handleDelete(skill.id!)} className="p-1.5 hover:bg-slate-800 rounded text-red-400"><Trash2 className="w-3 h-3" /></button>}
                        </div>
                     </div>
                  ))}
                  {skills.filter(s => s.category === category).length === 0 && (
                     <div className="text-xs text-slate-600 italic p-2">No skills added</div>
                  )}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default SkillManager;