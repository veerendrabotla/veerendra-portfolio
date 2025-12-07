import React, { useState, useEffect, useRef } from 'react';
import { Settings, Save, Lock, Github, Linkedin, Mail, Loader2, UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { SiteSettings } from '../../types';
import { INITIAL_SETTINGS } from '../../constants';
import { supabase } from '../../lib/supabaseClient';
import { parseResume } from '../../services/geminiService';

const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'admin'>('general');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [dbId, setDbId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch settings on mount
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      if (data) {
        setDbId(data.id);
        setSettings({
          heroTitle: data.hero_title || INITIAL_SETTINGS.heroTitle,
          heroSubtitle: data.hero_subtitle || INITIAL_SETTINGS.heroSubtitle,
          contactEmail: data.contact_email || INITIAL_SETTINGS.contactEmail,
          githubUrl: data.github_url || INITIAL_SETTINGS.githubUrl,
          linkedinUrl: data.linkedin_url || INITIAL_SETTINGS.linkedinUrl,
          resumeUrl: data.resume_url || INITIAL_SETTINGS.resumeUrl,
          theme: data.theme || 'dark'
        });
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      hero_title: settings.heroTitle,
      hero_subtitle: settings.heroSubtitle,
      contact_email: settings.contactEmail,
      github_url: settings.githubUrl,
      linkedin_url: settings.linkedinUrl,
      resume_url: settings.resumeUrl,
      theme: settings.theme
    };

    let error;
    if (dbId) {
      const res = await supabase.from('site_settings').update(payload).eq('id', dbId);
      error = res.error;
    } else {
      const res = await supabase.from('site_settings').insert([payload]);
      error = res.error;
    }

    setLoading(false);
    if (error) {
      alert("Error saving settings: " + error.message);
    } else {
      alert("Settings saved successfully!");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);

    // Reset UI state
    setImporting(true);
    setImportStatus('idle');
    setStatusMsg('Reading file...');

    try {
      // 1. Read File as Base64 (Promisified for safety)
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Handle different data URI formats (though typically base64)
            const parts = result.split(',');
            resolve(parts.length > 1 ? parts[1] : result);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      setStatusMsg('Analyzing with Gemini AI (this may take 10-20s)...');
        
      // 2. Parse with Gemini
      let parsedData;
      try {
         parsedData = await parseResume(base64Data, file.type || 'application/pdf');
         console.log("Extracted Data:", parsedData);
      } catch (parseError: any) {
         console.error("AI Parsing failed:", parseError);
         throw new Error(`AI Analysis failed: ${parseError.message}. Ensure PDF is text-readable.`);
      }

      if (!parsedData) throw new Error("No data returned from AI");

      setStatusMsg('Saving to Database...');

      // 3. Insert Experience
      if (parsedData.experience && Array.isArray(parsedData.experience) && parsedData.experience.length > 0) {
          const expPayload = parsedData.experience.map((item: any) => ({
            role: item.role || 'Unknown Role',
            company: item.company || 'Unknown Company',
            period: item.period || 'Unknown Dates',
            type: item.type?.toLowerCase() || 'work',
            description: Array.isArray(item.description) ? item.description : [item.description || ''],
            visible: true
          }));
          await supabase.from('experience').insert(expPayload);
      }

      // 4. Insert Projects
      if (parsedData.projects && Array.isArray(parsedData.projects) && parsedData.projects.length > 0) {
          const projPayload = parsedData.projects.map((item: any) => ({
            title: item.title || 'Untitled Project',
            category: item.category || 'Development',
            description: item.description || '',
            full_description: item.fullDescription || item.description || '',
            tech_stack: Array.isArray(item.techStack) ? item.techStack : [],
            demo_link: item.demoLink || '#',
            github_link: item.githubLink || '#',
            image: 'https://picsum.photos/800/600', // Default placeholder
            visible: true,
            featured: false
          }));
          await supabase.from('projects').insert(projPayload);
      }

      // 5. Insert Achievements
      if (parsedData.achievements && Array.isArray(parsedData.achievements) && parsedData.achievements.length > 0) {
          const achPayload = parsedData.achievements.map((item: any) => ({
            title: item.title || 'Untitled Achievement',
            issuer: item.issuer || 'Unknown Issuer',
            date: item.date || new Date().getFullYear().toString(),
            type: item.type || 'Certificate',
            visible: true
          }));
          await supabase.from('achievements').insert(achPayload);
      }

      // 6. Update Site Settings (if extracted)
      if (parsedData.personalInfo) {
          const info = parsedData.personalInfo;
          const newSettings = {
            ...settings,
            heroTitle: info.heroTitle || settings.heroTitle,
            heroSubtitle: info.heroSubtitle || settings.heroSubtitle,
            contactEmail: info.email || settings.contactEmail,
            githubUrl: info.github || settings.githubUrl,
            linkedinUrl: info.linkedin || settings.linkedinUrl
          };
          setSettings(newSettings);
          
          // Update DB for settings immediately
          const settingsPayload = {
            hero_title: newSettings.heroTitle,
            hero_subtitle: newSettings.heroSubtitle,
            contact_email: newSettings.contactEmail,
            github_url: newSettings.githubUrl,
            linkedin_url: newSettings.linkedinUrl
          };
          if (dbId) {
            await supabase.from('site_settings').update(settingsPayload).eq('id', dbId);
          }
      }

      setImportStatus('success');
      setStatusMsg('Success! Data populated from resume.');
      alert("Resume imported successfully! Projects, Experience, and Achievements have been added.");

    } catch (err: any) {
      console.error(err);
      setImportStatus('error');
      setStatusMsg('Failed: ' + err.message);
      alert("Error importing resume: " + err.message);
    } finally {
      setImporting(false);
      // We rely on onClick to reset value, so no need to manually reset ref here, but good for safety
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <h2 className="text-2xl font-bold text-white mb-6">Site Settings</h2>
       
       <div className="flex gap-2 border-b border-slate-700 mb-6">
          {['general', 'social', 'admin'].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                 activeTab === tab 
                   ? 'border-cyan-500 text-cyan-400' 
                   : 'border-transparent text-slate-400 hover:text-white'
               }`}
             >
               {tab} Settings
             </button>
          ))}
       </div>

       <div className="glass-panel p-8 rounded-2xl border border-slate-700">
          {activeTab === 'general' && (
             <div className="space-y-6 animate-in fade-in">
                <div>
                   <label className="block text-sm text-slate-400 mb-2">Hero Title</label>
                   <input 
                     value={settings.heroTitle} 
                     onChange={(e) => setSettings({...settings, heroTitle: e.target.value})}
                     className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                   />
                </div>
                <div>
                   <label className="block text-sm text-slate-400 mb-2">Hero Subtitle</label>
                   <input 
                     value={settings.heroSubtitle} 
                     onChange={(e) => setSettings({...settings, heroSubtitle: e.target.value})}
                     className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                   />
                </div>
                <div>
                   <label className="block text-sm text-slate-400 mb-2">Contact Email</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                      <input 
                        value={settings.contactEmail} 
                        onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-3 text-white"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-sm text-slate-400 mb-2">Resume URL</label>
                   <input 
                     value={settings.resumeUrl} 
                     onChange={(e) => setSettings({...settings, resumeUrl: e.target.value})}
                     className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                   />
                </div>
                
                {/* Resume Import Section */}
                <div className="pt-6 border-t border-slate-800">
                   <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" /> Resume Sync (AI Powered)
                   </h4>
                   <p className="text-sm text-slate-400 mb-4">
                      Upload your PDF resume. Our AI agent will extract your projects, experience, and achievements and add them to the CMS. 
                      <br/><span className="text-yellow-500/80 text-xs">Note: This adds new entries; it does not delete existing ones.</span>
                   </p>
                   
                   <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                          <label className={`cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {importing ? <Loader2 className="w-4 h-4 animate-spin"/> : <UploadCloud className="w-4 h-4" />}
                            {importing ? 'Processing...' : 'Upload Resume (PDF)'}
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept=".pdf, .png, .jpg, .jpeg" 
                                className="sr-only" 
                                onChange={handleFileUpload}
                                onClick={(e) => (e.currentTarget.value = '')}
                            />
                          </label>
                          
                          {importStatus === 'success' && <span className="text-green-400 flex items-center gap-1 text-sm"><CheckCircle className="w-4 h-4"/> Sync Complete</span>}
                          {importStatus === 'error' && <span className="text-red-400 flex items-center gap-1 text-sm"><AlertCircle className="w-4 h-4"/> Failed</span>}
                      </div>
                      
                      {/* Status Message Text */}
                      {statusMsg && (
                        <p className={`text-xs ${importStatus === 'error' ? 'text-red-400' : 'text-cyan-400'} animate-pulse`}>
                           {statusMsg}
                        </p>
                      )}
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'social' && (
             <div className="space-y-6 animate-in fade-in">
                <div>
                   <label className="block text-sm text-slate-400 mb-2">GitHub URL</label>
                   <div className="relative">
                      <Github className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                      <input 
                        value={settings.githubUrl} 
                        onChange={(e) => setSettings({...settings, githubUrl: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-3 text-white"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-sm text-slate-400 mb-2">LinkedIn URL</label>
                   <div className="relative">
                      <Linkedin className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                      <input 
                        value={settings.linkedinUrl} 
                        onChange={(e) => setSettings({...settings, linkedinUrl: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-3 text-white"
                      />
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'admin' && (
             <div className="space-y-6 animate-in fade-in">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-200 text-sm mb-6">
                   Security settings. Changing password requires current password.
                </div>
                <div>
                   <label className="block text-sm text-slate-400 mb-2">Current Password</label>
                   <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                      <input type="password" className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-3 text-white" />
                   </div>
                </div>
                <div>
                   <label className="block text-sm text-slate-400 mb-2">New Password</label>
                   <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                      <input type="password" className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-3 text-white" />
                   </div>
                </div>
             </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
             <button onClick={handleSave} disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Save Changes
             </button>
          </div>
       </div>
    </div>
  );
};

export default SettingsManager;