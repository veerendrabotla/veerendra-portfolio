import React, { useState } from 'react';
import { Award, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Achievement } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface AchievementManagerProps {
  achievements: Achievement[];
  onRefresh: () => void;
}

const AchievementManager: React.FC<AchievementManagerProps> = ({ achievements, onRefresh }) => {
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<Partial<Achievement>>({});

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      title: current.title,
      issuer: current.issuer,
      date: current.date,
      type: current.type || 'Certificate',
      visible: true,
      image: current.image
    };

    let error;
    if (current.id) {
       const res = await supabase.from('achievements').update(payload).eq('id', current.id);
       error = res.error;
    } else {
       const res = await supabase.from('achievements').insert([payload]);
       error = res.error;
    }

    setLoading(false);
    if (error) {
      alert('Error saving: ' + error.message);
    } else {
      setFormVisible(false);
      setCurrent({});
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from('achievements').delete().eq('id', id);
    if (error) alert(error.message);
    else onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Certificates & Awards</h2>
        <button onClick={() => { setCurrent({}); setFormVisible(true); }} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Add Certificate
        </button>
      </div>

      {formVisible && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-700 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">{current.id ? 'Edit Achievement' : 'New Achievement'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <input placeholder="Title" value={current.title || ''} onChange={e => setCurrent({...current, title: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"/>
             <input placeholder="Issuer" value={current.issuer || ''} onChange={e => setCurrent({...current, issuer: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"/>
             <select value={current.type || 'Certificate'} onChange={e => setCurrent({...current, type: e.target.value as any})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white">
                <option value="Certificate">Certificate</option>
                <option value="Award">Award</option>
                <option value="Hackathon">Hackathon Win</option>
             </select>
             <input type="date" value={current.date || ''} onChange={e => setCurrent({...current, date: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"/>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setFormVisible(false)} className="text-slate-400 hover:text-white">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              {loading && <Loader2 className="w-3 h-3 animate-spin"/>} Save
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => (
          <div key={ach.id} className="glass-panel p-5 rounded-xl border border-slate-700 hover:border-purple-500/30 transition-all group relative">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => { setCurrent(ach); setFormVisible(true); }} className="p-1.5 bg-slate-800 rounded text-cyan-400 hover:text-cyan-300"><Edit2 className="w-4 h-4"/></button>
               <button onClick={() => handleDelete(ach.id)} className="p-1.5 bg-slate-800 rounded text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4"/></button>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold mb-1">{ach.title}</h3>
            <p className="text-sm text-slate-400 mb-4">{ach.issuer} • {ach.date}</p>
            <span className="text-xs px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300">{ach.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementManager;