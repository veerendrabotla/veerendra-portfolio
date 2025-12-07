import React, { useState } from 'react';
import { Mail, Star, Trash2, Reply, Search, Check, Loader2, Sparkles, Copy } from 'lucide-react';
import { Lead } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { generateEmailReply } from '../../services/geminiService';

interface InboxProps {
  leads: Lead[];
  onRefresh: () => void;
}

const Inbox: React.FC<InboxProps> = ({ leads, onRefresh }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [draftReply, setDraftReply] = useState('');

  const toggleStatus = async (lead: Lead) => {
    setLoading(true);
    const newStatus = lead.status === 'new' ? 'read' : 'new';
    
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', lead.id);
    setLoading(false);
    
    if (error) {
       alert(error.message);
    } else {
       if (selectedLead?.id === lead.id) {
          setSelectedLead({ ...selectedLead, status: newStatus });
       }
       onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this message?")) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) {
      setSelectedLead(null);
      setDraftReply('');
      onRefresh();
    }
  };

  const handleGenerateReply = async () => {
    if (!selectedLead) return;
    setGenerating(true);
    setDraftReply('');
    try {
      const reply = await generateEmailReply(selectedLead);
      setDraftReply(reply);
    } catch (err: any) {
      alert("Failed to generate reply: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftReply);
    alert("Draft copied to clipboard!");
  };

  const openMailClient = () => {
    if (!selectedLead) return;
    const subject = encodeURIComponent(`Re: Inquiry from ${selectedLead.name}`);
    const body = encodeURIComponent(draftReply);
    window.open(`mailto:${selectedLead.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* List */}
      <div className="w-full md:w-1/3 glass-panel rounded-2xl border border-slate-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50">
           <div className="flex justify-between items-center mb-4">
             <h2 className="font-bold text-white">Inbox ({leads.filter(l => l.status === 'new').length})</h2>
             {loading && <Loader2 className="w-3 h-3 animate-spin text-cyan-500" />}
           </div>
           <div className="relative">
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"/>
             <input placeholder="Search emails..." className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"/>
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
           {leads.map(lead => (
             <div 
               key={lead.id} 
               onClick={() => { setSelectedLead(lead); setDraftReply(''); }}
               className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors ${selectedLead?.id === lead.id ? 'bg-cyan-900/10 border-l-2 border-l-cyan-500' : ''}`}
             >
               <div className="flex justify-between mb-1">
                 <span className={`font-bold text-sm ${lead.status === 'new' ? 'text-white' : 'text-slate-400'}`}>{lead.name}</span>
                 <span className="text-xs text-slate-500">{lead.date}</span>
               </div>
               <p className="text-xs text-slate-400 mb-2 truncate">{lead.email}</p>
               <p className="text-sm text-slate-300 line-clamp-2">{lead.message}</p>
             </div>
           ))}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-700 p-8 flex flex-col overflow-y-auto">
        {selectedLead ? (
          <>
             <div className="flex justify-between items-start mb-8 border-b border-slate-700 pb-6">
                <div>
                   <h2 className="text-2xl font-bold text-white mb-2">{selectedLead.name}</h2>
                   <div className="flex items-center gap-3 text-slate-400">
                      <Mail className="w-4 h-4" /> {selectedLead.email}
                   </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => toggleStatus(selectedLead)} className={`p-2 border rounded-lg hover:bg-slate-700 ${selectedLead.status === 'read' ? 'text-green-400 border-green-500/30' : 'text-slate-300 border-slate-600'}`}>
                      <Check className="w-4 h-4" />
                   </button>
                   <button onClick={() => handleDelete(selectedLead.id)} className="p-2 border border-red-900/50 rounded-lg hover:bg-red-900/20 text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
             </div>
             
             <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-800 mb-8">
                <h4 className="text-xs uppercase font-bold text-slate-500 mb-2">Message</h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedLead.message}</p>
             </div>

             {/* AI Smart Reply Section */}
             <div className="mt-auto">
                {!draftReply ? (
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleGenerateReply} 
                      disabled={generating}
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                    >
                       {generating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4" />}
                       {generating ? 'Drafting...' : 'Generate AI Reply'}
                    </button>
                    <button onClick={openMailClient} className="text-slate-400 hover:text-white font-medium text-sm">
                       Reply Manually
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs uppercase font-bold text-purple-400 flex items-center gap-2">
                         <Sparkles className="w-3 h-3" /> AI Suggested Draft
                       </h4>
                       <div className="flex gap-2">
                         <button onClick={copyToClipboard} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                            <Copy className="w-3 h-3" /> Copy
                         </button>
                         <button onClick={() => setDraftReply('')} className="text-xs text-red-400 hover:text-red-300">Discard</button>
                       </div>
                    </div>
                    <textarea 
                      value={draftReply} 
                      onChange={(e) => setDraftReply(e.target.value)}
                      className="w-full h-48 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                    <button 
                      onClick={openMailClient} 
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                       <Reply className="w-4 h-4" /> Open in Mail App
                    </button>
                  </div>
                )}
             </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
             <Mail className="w-16 h-16 mb-4 opacity-20" />
             <p>Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;