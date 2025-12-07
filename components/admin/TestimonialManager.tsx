import React, { useState } from 'react';
import { MessageSquare, Plus, Edit2, Trash2, Star, Loader2 } from 'lucide-react';
import { Testimonial } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface TestimonialManagerProps {
  testimonials: Testimonial[];
  onRefresh: () => void;
}

const TestimonialManager: React.FC<TestimonialManagerProps> = ({ testimonials, onRefresh }) => {
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!editing) return;
    setLoading(true);

    const payload = {
      client_name: editing.clientName,
      company: editing.company,
      review: editing.review,
      rating: editing.rating,
      image: editing.image || 'https://i.pravatar.cc/150',
      visible: true
    };

    let error;
    if (editing.id) {
       const res = await supabase.from('testimonials').update(payload).eq('id', editing.id);
       error = res.error;
    } else {
       const res = await supabase.from('testimonials').insert([payload]);
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

  const handleDelete = async (id: string) => {
    if (confirm("Delete this testimonial?")) {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if(!error) onRefresh();
    }
  };

  if (editing) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-700 animate-in fade-in">
        <h3 className="text-2xl font-bold text-white mb-6">{editing.id ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Client Name</label>
                <input value={editing.clientName || ''} onChange={e => setEditing({...editing, clientName: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"/>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Company</label>
                <input value={editing.company || ''} onChange={e => setEditing({...editing, company: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"/>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Rating (1-5)</label>
                <input type="number" min="1" max="5" value={editing.rating || 5} onChange={e => setEditing({...editing, rating: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"/>
              </div>
           </div>
           <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Client Image URL</label>
                <input value={editing.image || ''} onChange={e => setEditing({...editing, image: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"/>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Review</label>
                <textarea value={editing.review || ''} onChange={e => setEditing({...editing, review: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white h-32"/>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                 <button onClick={() => setEditing(null)} className="px-6 py-2 rounded-lg text-slate-400 hover:bg-slate-800">Cancel</button>
                 <button onClick={handleSave} disabled={loading} className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-2">
                   {loading && <Loader2 className="w-3 h-3 animate-spin" />} Save
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Client Testimonials</h2>
        <button onClick={() => setEditing({})} className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.id} className="glass-panel p-6 rounded-2xl border border-slate-700 relative group">
             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(t)} className="p-1.5 bg-slate-800 rounded text-cyan-400 hover:text-cyan-300"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 bg-slate-800 rounded text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4"/></button>
             </div>
             <div className="flex items-center gap-4 mb-4">
                <img src={t.image} alt={t.clientName} className="w-12 h-12 rounded-full border-2 border-slate-600" />
                <div>
                   <h4 className="font-bold text-white">{t.clientName}</h4>
                   <p className="text-xs text-slate-400">{t.company}</p>
                </div>
             </div>
             <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                ))}
             </div>
             <p className="text-slate-300 text-sm italic">"{t.review}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialManager;