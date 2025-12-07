import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, DollarSign, Loader2 } from 'lucide-react';
import { Service } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface ServiceManagerProps {
  services: Service[];
  onRefresh: () => void;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({ services, onRefresh }) => {
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!editing) return;
    setLoading(true);
    
    const payload = {
      title: editing.title,
      tagline: editing.tagline,
      description: editing.description,
      price_start: editing.priceStart,
      features: Array.isArray(editing.features) ? editing.features : [],
      icon: editing.icon || 'Monitor',
      visible: true
    };

    let error;
    if (editing.id) {
       const res = await supabase.from('services').update(payload).eq('id', editing.id);
       error = res.error;
    } else {
       const res = await supabase.from('services').insert([payload]);
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
    if (confirm("Delete this service?")) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if(!error) onRefresh();
    }
  };

  if (editing) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-700 animate-in fade-in">
        <h3 className="text-2xl font-bold text-white mb-6">{editing.id ? 'Edit Service' : 'Add New Service'}</h3>
        <div className="space-y-4 max-w-2xl">
           <div>
             <label className="block text-sm text-slate-400 mb-1">Service Title</label>
             <input 
               value={editing.title || ''} 
               onChange={e => setEditing({...editing, title: e.target.value})}
               className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
             />
           </div>
           <div>
             <label className="block text-sm text-slate-400 mb-1">Tagline</label>
             <input 
               value={editing.tagline || ''} 
               onChange={e => setEditing({...editing, tagline: e.target.value})}
               className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
             />
           </div>
           <div>
             <label className="block text-sm text-slate-400 mb-1">Description</label>
             <textarea 
               value={editing.description || ''} 
               onChange={e => setEditing({...editing, description: e.target.value})}
               className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white h-24"
             />
           </div>
           <div>
             <label className="block text-sm text-slate-400 mb-1">Pricing Start</label>
             <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input 
                  value={editing.priceStart?.replace('$', '') || ''} 
                  onChange={e => setEditing({...editing, priceStart: '$' + e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-3 text-white"
                />
             </div>
           </div>
           <div>
             <label className="block text-sm text-slate-400 mb-1">Features (comma separated)</label>
             <input 
               value={editing.features?.join(', ') || ''} 
               onChange={e => setEditing({...editing, features: e.target.value.split(',').map(s=>s.trim())})}
               className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
             />
           </div>
           <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setEditing(null)} className="px-6 py-2 rounded-lg text-slate-400 hover:bg-slate-800">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-2">
                 {loading && <Loader2 className="w-3 h-3 animate-spin" />} Save Service
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Agency Services</h2>
        <button onClick={() => setEditing({})} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="glass-panel p-6 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all group relative">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => setEditing(service)} className="p-2 bg-slate-800 rounded-lg text-cyan-400 hover:bg-cyan-500/20"><Edit2 className="w-4 h-4"/></button>
               <button onClick={() => handleDelete(service.id)} className="p-2 bg-slate-800 rounded-lg text-red-400 hover:bg-red-500/20"><Trash2 className="w-4 h-4"/></button>
            </div>
            
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6">
               <Layers className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">{service.title}</h3>
            <p className="text-xs text-cyan-400 font-mono mb-3">{service.tagline}</p>
            <p className="text-slate-400 text-sm mb-6 line-clamp-2">{service.description}</p>
            
            <div className="space-y-2 mb-6">
               {service.features?.slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                     <span className="w-1 h-1 bg-cyan-500 rounded-full" /> {f}
                  </div>
               ))}
            </div>
            
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
               <span className="text-slate-500 text-xs uppercase">Starting at</span>
               <span className="text-white font-bold">{service.priceStart}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceManager;