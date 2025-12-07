import React, { useState } from 'react';
import { 
  Github, Linkedin, Mail, ChevronRight, ExternalLink, 
  Code, Database, Cpu, Menu, X, Terminal, Download, Globe,
  Shield, Twitter, Instagram, Loader2, Send, Award, Star,
  Calendar, Lock, ArrowRight, CheckCircle
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { supabase } from '../lib/supabaseClient';
import AIChatbot from './AIChatbot';
import { Project, BlogPost } from '../types';

// Simple Markdown Renderer Component
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;
  
  const lines = content.split('\n');
  
  return (
    <div className="space-y-4 text-slate-300">
      {lines.map((line, index) => {
        // Headers
        if (line.startsWith('# ')) return <h3 key={index} className="text-2xl font-bold text-white mt-6 mb-2">{line.replace('# ', '')}</h3>;
        if (line.startsWith('## ')) return <h4 key={index} className="text-xl font-bold text-cyan-100 mt-4 mb-2">{line.replace('## ', '')}</h4>;
        if (line.startsWith('### ')) return <h5 key={index} className="text-lg font-bold text-slate-200 mt-3 mb-1">{line.replace('### ', '')}</h5>;
        
        // List Items
        if (line.trim().startsWith('- ')) {
          return (
            <div key={index} className="flex items-start gap-2 ml-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
              <span>{parseBold(line.replace('- ', ''))}</span>
            </div>
          );
        }

        // Code Blocks (simple detection)
        if (line.startsWith('```')) return null; // Skip fence lines for simple parser
        
        // Empty lines
        if (!line.trim()) return <br key={index} />;

        // Paragraphs
        return <p key={index} className="leading-relaxed">{parseBold(line)}</p>;
      })}
    </div>
  );
};

// Helper to parse **bold** text
const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const Portfolio: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Selected Items for Modals
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // Fetch Real Data incl. Settings
  const { 
    projects, 
    experience, 
    services, 
    achievements,
    testimonials,
    blogs,
    skills,
    settings,
    loading 
  } = usePortfolioData();

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Radar Chart Data formatting (Use dynamic skills)
  const chartData = skills.filter(s => s.level > 70).map(skill => ({
    subject: skill.name,
    A: skill.level,
    fullMark: 100,
  }));

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const handleServiceClick = (serviceTitle: string) => {
    setContactForm(prev => ({
      ...prev,
      message: `Hi Veerendra, I'm interested in your ${serviceTitle} service. I'd like to discuss a potential project.`
    }));
    scrollToSection('contact');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    
    setFormStatus('sending');
    
    const { error } = await supabase.from('leads').insert([{
      name: contactForm.name,
      email: contactForm.email,
      message: contactForm.message,
      date: new Date().toISOString().split('T')[0],
      status: 'new'
    }]);

    if (error) {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 3000);
    } else {
      setFormStatus('success');
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 5000);
    }
  };

  // Loading Screen for Initial Data
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
        <p className="text-slate-400 animate-pulse">Loading Experience...</p>
      </div>
    );
  }

  // Sorting: Featured projects first
  const sortedProjects = [...projects]
    .filter(p => p.visible)
    .sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tighter cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            HYPER<span className="text-cyan-500">BUILD</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            {['About', 'Skills', 'Projects', 'Services', 'Contact'].map((item) => (
              <button 
                key={item} 
                onClick={() => scrollToSection(item.toLowerCase())}
                className="hover:text-cyan-400 transition-colors uppercase tracking-widest text-xs"
              >
                {item}
              </button>
            ))}
            
            {/* Admin Login Icon */}
            <button 
               onClick={() => window.location.hash = 'admin'}
               className="text-slate-500 hover:text-cyan-400 transition-colors"
               title="Admin Login"
            >
               <Lock className="w-4 h-4" />
            </button>

            <button className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-cyan-500 hover:text-white transition-all transform hover:scale-105">
              Hire Me
            </button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 w-full bg-slate-900 border-b border-slate-800 p-6 flex flex-col gap-4 shadow-2xl">
            {['About', 'Skills', 'Projects', 'Services', 'Contact'].map((item) => (
              <button 
                key={item} 
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-left text-lg font-medium text-slate-300"
              >
                {item}
              </button>
            ))}
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                window.location.hash = 'admin';
              }}
              className="text-left text-lg font-medium text-cyan-400 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" /> Admin Login
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden pt-20" id="about">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Open for Commission
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Hello, I'm <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                Veerendra
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-lg font-light">
              {settings.heroTitle}. <br/>
              {settings.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => scrollToSection('contact')} className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold transition-all shadow-[0_0_20px_rgba(8,145,178,0.5)] hover:shadow-[0_0_30px_rgba(8,145,178,0.7)]">
                Start a Project
              </button>
              <a href={settings.resumeUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 border border-slate-700 hover:border-slate-500 hover:bg-slate-900 text-white rounded-full font-bold transition-all flex items-center gap-2">
                <Download className="w-5 h-5" /> Download CV
              </a>
            </div>
            <div className="flex gap-6 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">5+</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Years</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{projects.length}+</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">20+</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Hackathons</p>
              </div>
            </div>
          </div>
          
          <div className="relative h-[500px] w-full hidden md:flex items-center justify-center">
            {/* Abstract Tech Visual */}
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 rounded-3xl backdrop-blur-3xl" />
              <div className="absolute inset-4 glass-panel rounded-2xl flex items-center justify-center border border-white/10 z-20 overflow-hidden">
                <div className="grid grid-cols-2 gap-4 p-8 w-full h-full opacity-80">
                  <div className="bg-slate-900/50 rounded-xl p-4 flex flex-col justify-between border border-white/5">
                     <Terminal className="text-cyan-400 w-8 h-8 mb-4" />
                     <div className="space-y-2">
                       <div className="h-2 w-2/3 bg-slate-700 rounded" />
                       <div className="h-2 w-1/2 bg-slate-700 rounded" />
                     </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 flex flex-col justify-between border border-white/5 translate-y-8">
                     <Cpu className="text-purple-400 w-8 h-8 mb-4" />
                     <div className="space-y-2">
                       <div className="h-2 w-3/4 bg-slate-700 rounded" />
                       <div className="h-2 w-1/3 bg-slate-700 rounded" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24 relative bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Technical <span className="text-cyan-500">Arsenal</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">A comprehensive suite of tools and technologies I leverage to build scalable, high-performance applications.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-8">
              {['Frontend', 'Backend', 'AI/ML', 'Cloud'].map((cat) => (
                <div key={cat} className="space-y-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {cat === 'Frontend' && <Globe className="w-5 h-5 text-cyan-400"/>}
                    {cat === 'Backend' && <Database className="w-5 h-5 text-green-400"/>}
                    {cat === 'AI/ML' && <Code className="w-5 h-5 text-purple-400"/>}
                    {cat}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.filter(s => s.category === cat).map(skill => (
                      <span key={skill.id || skill.name} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-sm text-slate-300 hover:border-cyan-500/50 hover:text-white transition-colors cursor-default">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="py-24 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured <span className="text-cyan-500">Projects</span></h2>
              <p className="text-slate-400">Selected works from hackathons and client deliveries.</p>
            </div>
            <a href={settings.githubUrl} target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium group">
              View Github <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProjects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => setSelectedProject(project)}
                className={`group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2 cursor-pointer ${project.featured ? 'ring-1 ring-yellow-500/30' : ''}`}
              >
                {project.featured && (
                   <div className="absolute top-4 right-4 z-10 bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-slate-900" /> Featured
                   </div>
                )}
                <div className="aspect-video bg-slate-800 relative overflow-hidden">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {project.techStack?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-white/10 backdrop-blur rounded text-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2">{project.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white hover:text-cyan-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Case Study <ArrowRight className="w-4 h-4" />
                    </span>
                    <div className="text-slate-500 hover:text-white">
                      <Github className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience & Timeline */}
      <section id="experience" className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">My <span className="text-cyan-500">Journey</span></h2>
          
          <div className="relative border-l border-slate-800 ml-4 md:ml-0 space-y-12">
            {experience.filter(e => e.visible).map((item, index) => (
              <div key={item.id} className="relative pl-8 md:pl-0">
                {/* Timeline Dot */}
                <div className="absolute -left-[5px] top-0 w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                
                <div className={`md:flex gap-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="md:w-1/2 mb-4 md:mb-0"></div>
                  <div className="relative bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:bg-slate-900 transition-colors w-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white">{item.role}</h3>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded">{item.period}</span>
                    </div>
                    <p className="text-purple-400 font-medium mb-4">{item.company}</p>
                    <ul className="space-y-2">
                      {Array.isArray(item.description) && item.description.map((desc, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-cyan-500 mt-1">•</span> {desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section - NEW */}
      <section id="achievements" className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Awards & <span className="text-purple-500">Certificates</span></h2>
            <p className="text-slate-400">Recognition for technical excellence and hackathon victories.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.filter(a => a.visible).map((item) => (
              <div key={item.id} className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all hover:-translate-y-1 group">
                 <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                       <Award className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-slate-500">{item.date}</span>
                 </div>
                 <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                 <p className="text-sm text-slate-400">{item.issuer}</p>
                 <span className="inline-block mt-4 text-[10px] uppercase tracking-wider bg-slate-800 px-2 py-1 rounded text-slate-300">
                    {item.type}
                 </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Agency <span className="text-purple-500">Services</span></h2>
            <p className="text-slate-400">Scale your business with HyperBuild Labs.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.filter(s => s.visible).map((service) => (
              <div 
                 key={service.id} 
                 onClick={() => handleServiceClick(service.title)}
                 className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-2 group cursor-pointer"
              >
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors shadow-lg">
                  <Terminal className="text-white w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{service.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{service.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-mono text-cyan-400">Starts at {service.priceStart}</div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - NEW */}
      <section className="py-24 bg-slate-900/20">
         <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">Client <span className="text-cyan-500">Stories</span></h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {testimonials.filter(t => t.visible).map((t) => (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl relative">
                     <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                           <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} />
                        ))}
                     </div>
                     <p className="text-slate-300 italic mb-6">"{t.review}"</p>
                     <div className="flex items-center gap-4">
                        <img src={t.image} alt={t.clientName} className="w-10 h-10 rounded-full bg-slate-800" />
                        <div>
                           <h4 className="font-bold text-white text-sm">{t.clientName}</h4>
                           <p className="text-xs text-slate-500">{t.company}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Blogs - NEW */}
      {blogs.filter(b => b.status === 'published').length > 0 && (
         <section className="py-24 border-t border-slate-800/50">
            <div className="max-w-7xl mx-auto px-6">
               <div className="flex justify-between items-end mb-12">
                  <h2 className="text-3xl font-bold">Latest <span className="text-green-500">Insights</span></h2>
               </div>
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogs.filter(b => b.status === 'published').map((blog) => (
                     <div 
                        key={blog.id} 
                        onClick={() => setSelectedBlog(blog)}
                        className="group cursor-pointer"
                     >
                        <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-4 relative">
                           <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white">
                              {blog.tags[0]}
                           </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                           <Calendar className="w-3 h-3" /> {blog.date}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{blog.title}</h3>
                        <p className="text-sm text-slate-400 line-clamp-2">{blog.excerpt}</p>
                        <div className="mt-4 text-green-400 text-sm font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           Read Article <ArrowRight className="w-4 h-4" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-700 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Let's Build Something <span className="text-cyan-500">Future-Proof</span></h2>
            <p className="text-slate-400 mb-8">Ready to transform your ideas into reality? Whether it's a hackathon collaboration or a full-scale enterprise app, I'm here.</p>
            
            <form onSubmit={handleContactSubmit} className="space-y-4 text-left max-w-md mx-auto mb-10 relative">
              
              {/* Success Overlay */}
              {formStatus === 'success' && (
                 <div className="absolute inset-0 bg-slate-900/95 z-20 flex flex-col items-center justify-center rounded-xl animate-in fade-in">
                    <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
                    <h3 className="text-xl font-bold text-white">Message Sent!</h3>
                    <p className="text-slate-400 text-sm">I'll get back to you shortly.</p>
                 </div>
              )}

              <div>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  required
                  disabled={formStatus === 'sending'}
                  value={contactForm.name}
                  onChange={e => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors disabled:opacity-50" 
                />
              </div>
              <div>
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  required
                  disabled={formStatus === 'sending'}
                  value={contactForm.email}
                  onChange={e => setContactForm({...contactForm, email: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors disabled:opacity-50" 
                />
              </div>
              <div>
                <textarea 
                  rows={4} 
                  placeholder="Project Details" 
                  required
                  disabled={formStatus === 'sending'}
                  value={contactForm.message}
                  onChange={e => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors disabled:opacity-50"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={formStatus === 'sending'}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {formStatus === 'sending' ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Send Message</>}
              </button>
            </form>

            <div className="flex justify-center gap-6">
               <a href={settings.githubUrl} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-cyan-600 transition-all"><Github className="w-5 h-5"/></a>
               <a href={settings.linkedinUrl} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-blue-600 transition-all"><Linkedin className="w-5 h-5"/></a>
               <a href={`mailto:${settings.contactEmail}`} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-red-500 transition-all"><Mail className="w-5 h-5"/></a>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Info */}
            <div className="col-span-2">
              <h3 className="text-2xl font-bold tracking-tighter text-white mb-4">
                HYPER<span className="text-cyan-500">BUILD</span> LABS
              </h3>
              <p className="text-slate-400 max-w-sm mb-6">
                Crafting digital experiences at the intersection of design, code, and artificial intelligence. Building the future, one pixel at a time.
              </p>
              <div className="flex gap-4">
                 <a href={settings.githubUrl} className="text-slate-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                 <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors"><Twitter className="w-5 h-5" /></a>
                 <a href="#" className="text-slate-400 hover:text-pink-500 transition-colors"><Instagram className="w-5 h-5" /></a>
                 <a href={settings.linkedinUrl} className="text-slate-400 hover:text-blue-500 transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-6">Explore</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-cyan-400 transition-colors">About Me</button></li>
                <li><button onClick={() => scrollToSection('projects')} className="hover:text-cyan-400 transition-colors">Case Studies</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-cyan-400 transition-colors">Services</button></li>
                <li><button onClick={() => scrollToSection('experience')} className="hover:text-cyan-400 transition-colors">Experience</button></li>
              </ul>
            </div>

            {/* Legal & Admin */}
            <div>
               <h4 className="font-bold text-white mb-6">System</h4>
               <ul className="space-y-3 text-slate-400 text-sm">
                  <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li>
                    <button 
                      onClick={() => window.location.hash = 'admin'} 
                      className="flex items-center gap-2 hover:text-cyan-400 transition-colors group text-left"
                    >
                       <Shield className="w-3 h-3 group-hover:text-cyan-500" /> Admin Portal
                    </button>
                  </li>
               </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p>© 2024 HyperBuild Labs. All rights reserved.</p>
            <p>Designed & Built by Veerendra.</p>
          </div>
        </div>
      </footer>
      
      {/* --- MODALS --- */}
      
      {/* Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative">
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/50 rounded-full text-white z-10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-video relative">
               <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
               <div className="absolute bottom-6 left-6 md:left-10">
                  <div className="flex gap-2 mb-3">
                    {selectedProject.techStack?.map(t => (
                       <span key={t} className="text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full backdrop-blur-md">
                         {t}
                       </span>
                    ))}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">{selectedProject.title}</h2>
               </div>
            </div>
            <div className="p-8 md:p-10 space-y-8">
               <div className="flex flex-wrap gap-4">
                  <a href={selectedProject.demoLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all">
                     <ExternalLink className="w-5 h-5" /> Live Demo
                  </a>
                  <a href={selectedProject.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all">
                     <Github className="w-5 h-5" /> View Code
                  </a>
               </div>
               <div className="prose prose-invert max-w-none">
                  <h3 className="text-xl font-bold text-white mb-4">About the Project</h3>
                  <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                     {selectedProject.fullDescription || selectedProject.description}
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Modal */}
      {selectedBlog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative">
               <button 
                 onClick={() => setSelectedBlog(null)}
                 className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/50 rounded-full text-white z-10 transition-colors"
               >
                 <X className="w-6 h-6" />
               </button>
               <div className="h-64 relative">
                  <img src={selectedBlog.coverImage} alt={selectedBlog.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/40" />
               </div>
               <div className="p-8 md:p-12 -mt-20 relative">
                  <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-xl">
                     <div className="flex gap-2 mb-4">
                        {selectedBlog.tags.map(t => (
                           <span key={t} className="text-xs font-bold text-green-400 uppercase tracking-wider">{t}</span>
                        ))}
                     </div>
                     <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{selectedBlog.title}</h2>
                     <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-800">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {selectedBlog.date}</span>
                        <span>•</span>
                        <span>{Math.ceil((selectedBlog.content?.length || 0) / 1000)} min read</span>
                     </div>
                     <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <MarkdownRenderer content={selectedBlog.content} />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      <AIChatbot />
    </div>
  );
};

export default Portfolio;