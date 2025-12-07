import React, { useState } from 'react';
import AdminSidebar from './admin/AdminSidebar';
import DashboardOverview from './admin/DashboardOverview';
import ProjectManager from './admin/ProjectManager';
import AchievementManager from './admin/AchievementManager';
import BlogManager from './admin/BlogManager';
import ExperienceManager from './admin/ExperienceManager';
import ServiceManager from './admin/ServiceManager';
import TestimonialManager from './admin/TestimonialManager';
import SettingsManager from './admin/SettingsManager';
import SkillManager from './admin/SkillManager';
import Inbox from './admin/Inbox';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { Loader2 } from 'lucide-react';

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Use the hook to fetch real data from Supabase
  const { 
    projects, 
    achievements, 
    experience, 
    blogs, 
    services, 
    testimonials, 
    leads, 
    skills,
    loading, 
    refreshData 
  } = usePortfolioData();

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  // Calculate real stats from DB data
  const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);

  const stats = {
    visitors: totalViews, // Real aggregation of blog views
    leads: leads.length,
    projects: projects.filter(p => p.visible).length,
    messages: leads.filter(l => l.status === 'new').length
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return <DashboardOverview stats={stats} leads={leads} blogs={blogs} />;
      case 'projects':
        return <ProjectManager projects={projects} onRefresh={refreshData} />;
      case 'skills':
        return <SkillManager skills={skills} onRefresh={refreshData} />;
      case 'achievements':
        return <AchievementManager achievements={achievements} onRefresh={refreshData} />;
      case 'experience':
        return <ExperienceManager experience={experience} onRefresh={refreshData} />;
      case 'blogs':
        return <BlogManager blogs={blogs} onRefresh={refreshData} />;
      case 'services':
        return <ServiceManager services={services} onRefresh={refreshData} />;
      case 'testimonials':
        return <TestimonialManager testimonials={testimonials} onRefresh={refreshData} />;
      case 'inbox':
        return <Inbox leads={leads} onRefresh={refreshData} />;
      case 'settings':
        return <SettingsManager />;
      default:
        return (
          <div className="glass-panel p-10 rounded-2xl border border-slate-700 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Under Construction</h2>
            <p className="text-slate-400">This module is part of the next update.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex bg-slate-950 text-slate-200 overflow-hidden">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-lg font-medium text-white capitalize flex items-center gap-2">
            <span className="text-slate-500">CMS /</span> {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-white">Veerendra</span>
                <span className="text-xs text-cyan-400">Super Admin</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white border-2 border-slate-800 shadow-lg">
                V
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;