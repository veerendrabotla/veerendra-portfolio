import React, { useState } from 'react';
import { FileText, Plus, Edit2, Trash2, Eye, Loader2, Sparkles } from 'lucide-react';
import { BlogPost } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { generateBlogPost } from '../../services/geminiService';

interface BlogManagerProps {
  blogs: BlogPost[];
  onRefresh: () => void;
}

const BlogManager: React.FC<BlogManagerProps> = ({ blogs, onRefresh }) => {
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleSave = async () => {
    if (!editing) return;
    setLoading(true);

    const payload = {
      title: editing.title,
      excerpt: editing.excerpt || (editing.content?.substring(0, 100) + '...'),
      content: editing.content,
      cover_image: editing.coverImage || 'https://picsum.photos/800/400',
      date: editing.date || new Date().toISOString().split('T')[0],
      tags: Array.isArray(editing.tags) ? editing.tags : [],
      status: editing.status || 'draft'
    };

    let error;
    if (editing.id) {
       const res = await supabase.from('blogs').update(payload).eq('id', editing.id);
       error = res.error;
    } else {
       const res = await supabase.from('blogs').insert([payload]);
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

  const handleGenerate = async () => {
    if (!editing?.title) {
      alert("Please enter a title first to generate content.");
      return;
    }
    
    setGenerating(true);
    try {
      const content = await generateBlogPost(editing.title, editing.tags || []);
      setEditing(prev => ({ ...prev, content: content, excerpt: content.substring(0, 150) + '...' }));
    } catch (error: any) {
      alert("AI Generation failed: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this post?")) {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if(!error) onRefresh();
    }
  };

  if (editing) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-700 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">{editing.id ? 'Edit Post' : 'New Post'}</h3>
          <div className="flex gap-3">
            <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin"/>} Publish
            </button>
          </div>
        </div>
        <div className="space-y-4 flex-1 flex flex-col">
           <input 
             value={editing.title || ''} 
             onChange={e => setEditing({...editing, title: e.target.value})}
             placeholder="Post Title" 
             className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xl font-bold text-white focus:border-cyan-500 outline-none"
           />
           <div className="grid grid-cols-2 gap-4">
             <input value={editing.date || ''} onChange={e => setEditing({...editing, date: e.target.value})} type="date" className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"/>
             <input value={editing.tags?.join(', ') || ''} onChange={e => setEditing({...editing, tags: e.target.value.split(',').map(s=>s.trim())})} placeholder="Tags (comma sep)" className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"/>
           </div>
           <select 
             value={editing.status || 'draft'} 
             onChange={e => setEditing({...editing, status: e.target.value as any})}
             className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white w-full"
           >
             <option value="draft">Draft</option>
             <option value="published">Published</option>
           </select>
           
           <div className="relative flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                 <label className="text-sm text-slate-400">Content (Markdown)</label>
                 <button 
                   onClick={handleGenerate}
                   disabled={generating || !editing.title}
                   className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-purple-500/20 transition-all disabled:opacity-50"
                 >
                    {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {generating ? 'Writing...' : 'Auto-Write with AI'}
                 </button>
              </div>
              <textarea 
                value={editing.content || ''}
                onChange={e => setEditing({...editing, content: e.target.value})}
                placeholder="Write your masterpiece in Markdown..." 
                className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-300 font-mono resize-none focus:border-cyan-500 outline-none leading-relaxed"
              />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Blog & Articles</h2>
        <button onClick={() => setEditing({})} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-green-500/20">
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <div className="grid gap-4">
        {blogs.map((blog) => (
           <div key={blog.id} className="glass-panel p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-6 items-center hover:bg-slate-800/50 transition-colors">
              <img src={blog.coverImage} alt="" className="w-full md:w-48 h-32 object-cover rounded-lg bg-slate-800" />
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${blog.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{blog.status}</span>
                    <span className="text-slate-500 text-sm">{blog.date}</span>
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">{blog.title}</h3>
                 <p className="text-slate-400 text-sm line-clamp-2">{blog.excerpt}</p>
                 <div className="flex gap-2 mt-3">
                    {blog.tags.map(tag => <span key={tag} className="text-xs text-slate-500">#{tag.trim()}</span>)}
                 </div>
              </div>
              <div className="flex md:flex-col gap-2">
                 <button onClick={() => setEditing(blog)} className="p-2 bg-slate-800 rounded-lg text-cyan-400 hover:bg-cyan-500/20"><Edit2 className="w-4 h-4"/></button>
                 <button onClick={() => handleDelete(blog.id)} className="p-2 bg-slate-800 rounded-lg text-red-400 hover:bg-red-500/20"><Trash2 className="w-4 h-4"/></button>
                 <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><Eye className="w-4 h-4"/></button>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default BlogManager;