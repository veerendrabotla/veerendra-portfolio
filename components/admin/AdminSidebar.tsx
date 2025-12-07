import React from 'react';
import { 
  LayoutDashboard, FolderPlus, Award, Users, Settings, 
  FileText, Briefcase, MessageSquare, LogOut, Layers, MessageCircle, ExternalLink, Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderPlus },
    { id: 'skills', label: 'Tech Skills', icon: Zap },
    { id: 'achievements', label: 'Certificates', icon: Award },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'blogs', label: 'Blog & Posts', icon: FileText },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'inbox', label: 'Leads & Inbox', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLiveView = () => {
    // Navigate to root URL in a new tab
    window.open(window.location.origin, '_blank');
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 hidden md:flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-wider">CMS <span className="text-cyan-500">ADMIN</span></h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
          onClick={handleLiveView}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors border border-slate-800 hover:border-slate-700"
        >
           <ExternalLink className="w-5 h-5" />
           <span>View Live Site</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;