import React, { useMemo } from 'react';
import { Eye, TrendingUp, FolderPlus, MessageCircle, Activity, User } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Lead, BlogPost } from '../../types';

interface OverviewProps {
  stats: {
    visitors: number;
    leads: number;
    projects: number;
    messages: number;
  };
  leads: Lead[];
  blogs: BlogPost[];
}

const DashboardOverview: React.FC<OverviewProps> = ({ stats, leads, blogs }) => {
  
  // Process Real Data for Charts
  const chartData = useMemo(() => {
    // Generate last 6 months buckets
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        key: d.toISOString().slice(0, 7), // YYYY-MM
        posts: 0,
        leads: 0
      });
    }

    // Populate with real lead counts
    leads.forEach(lead => {
      const leadMonth = lead.date.slice(0, 7); // Assumes YYYY-MM-DD
      const bucket = months.find(m => m.key === leadMonth);
      if (bucket) {
        bucket.leads += 1;
      }
    });

    // Populate with real blog post counts
    blogs.forEach(blog => {
      const blogMonth = blog.date.slice(0, 7);
      const bucket = months.find(m => m.key === blogMonth);
      if (bucket) {
        bucket.posts += 1;
      }
    });

    return months;
  }, [leads, blogs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Content Views', value: stats.visitors.toLocaleString(), icon: Eye, color: 'text-cyan-400', sub: 'From Blog Posts' },
          { label: 'Total Leads', value: stats.leads, icon: TrendingUp, color: 'text-green-400', sub: `${chartData[chartData.length-1].leads} this month` },
          { label: 'Active Projects', value: stats.projects, icon: FolderPlus, color: 'text-purple-400', sub: 'Portfolio Live' },
          { label: 'Unread Msgs', value: stats.messages, icon: MessageCircle, color: 'text-pink-400', sub: 'Requires Action' },
        ].map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 bg-slate-800 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">{stat.sub}</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-slate-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-700 h-96 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Engagement Analytics</h3>
            <div className="flex gap-2">
               <span className="text-xs flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-cyan-500"/> Content Published</span>
               <span className="text-xs flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-purple-500"/> Leads</span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} dx={-10} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Line type="monotone" dataKey="posts" name="New Content" stroke="#06b6d4" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="leads" name="New Leads" stroke="#a855f7" strokeWidth={3} dot={false} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Recent Activity / Secondary */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700 h-96 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
             <Activity className="w-5 h-5 text-green-400" /> Recent Activity
          </h3>
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
             {leads.slice(0, 5).map((lead, i) => (
                <div key={lead.id} className="flex gap-4 items-start">
                   <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700">
                      <User className="w-4 h-4 text-cyan-400" />
                   </div>
                   <div>
                      <p className="text-sm text-white">
                         <span className="font-bold">{lead.name}</span> submitted a new lead.
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{lead.date}</p>
                   </div>
                </div>
             ))}
             {leads.length === 0 && (
                <div className="text-center text-slate-500 py-10">No recent activity</div>
             )}
          </div>
        </div>
      </div>

      {/* Conversion Bar Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700 h-80">
          <h3 className="text-lg font-bold text-white mb-6">Monthly Lead Volume</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip 
                cursor={{fill: '#334155', opacity: 0.4}}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
              />
              <Bar dataKey="leads" name="Leads" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardOverview;