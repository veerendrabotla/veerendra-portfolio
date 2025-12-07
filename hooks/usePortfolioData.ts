import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Project, ExperienceItem, Service, Achievement, BlogPost, Testimonial, Lead, SiteSettings, Skill } from '../types';
import { INITIAL_SETTINGS, SKILLS as DEFAULT_SKILLS } from '../constants';

export const usePortfolioData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  
  // Track if we have done the initial load
  const isFirstLoad = useRef(true);

  const fetchData = useCallback(async () => {
    // We only set loading true if it's the very first load to prevent UI flicker on realtime updates
    if (isFirstLoad.current) {
      setLoading(true);
    }
    
    setError(null);
    try {
      const [
        projectsRes,
        experienceRes,
        servicesRes,
        achievementsRes,
        blogsRes,
        testimonialsRes,
        leadsRes,
        settingsRes,
        skillsRes
      ] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('experience').select('*').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('created_at', { ascending: true }),
        supabase.from('achievements').select('*').order('date', { ascending: false }),
        supabase.from('blogs').select('*').order('date', { ascending: false }),
        supabase.from('testimonials').select('*'),
        supabase.auth.getSession().then(({ data }) => 
          data.session ? supabase.from('leads').select('*').order('date', { ascending: false }) : { data: [], error: null }
        ),
        supabase.from('site_settings').select('*').limit(1).single(),
        supabase.from('skills').select('*').order('level', { ascending: false })
      ]);

      if (projectsRes.error) console.error('Projects Error', projectsRes.error);

      // Map Database (snake_case) to Types (camelCase)
      setProjects(projectsRes.data?.map(p => ({
        ...p,
        fullDescription: p.full_description,
        techStack: p.tech_stack,
        demoLink: p.demo_link,
        githubLink: p.github_link
      })) || []);

      setExperience(experienceRes.data || []);

      setServices(servicesRes.data?.map(s => ({
        ...s,
        priceStart: s.price_start
      })) || []);

      setAchievements(achievementsRes.data || []);

      setBlogs(blogsRes.data?.map(b => ({
        ...b,
        coverImage: b.cover_image
      })) || []);

      setTestimonials(testimonialsRes.data?.map(t => ({
        ...t,
        clientName: t.client_name
      })) || []);

      if (leadsRes.data) {
        setLeads(leadsRes.data as Lead[]);
      }

      // Use fetched skills or fallback to constants if table is empty/missing
      if (skillsRes.data && skillsRes.data.length > 0) {
        setSkills(skillsRes.data);
      } else {
        setSkills(DEFAULT_SKILLS);
      }

      if (settingsRes.data) {
        setSettings({
          heroTitle: settingsRes.data.hero_title || INITIAL_SETTINGS.heroTitle,
          heroSubtitle: settingsRes.data.hero_subtitle || INITIAL_SETTINGS.heroSubtitle,
          contactEmail: settingsRes.data.contact_email || INITIAL_SETTINGS.contactEmail,
          githubUrl: settingsRes.data.github_url || INITIAL_SETTINGS.githubUrl,
          linkedinUrl: settingsRes.data.linkedin_url || INITIAL_SETTINGS.linkedinUrl,
          resumeUrl: settingsRes.data.resume_url || INITIAL_SETTINGS.resumeUrl,
          theme: settingsRes.data.theme || 'dark'
        });
      }

    } catch (err: any) {
      console.error("Error fetching portfolio data:", err);
      // Even if error, ensure we have some skills to show
      if (skills.length === 0) setSkills(DEFAULT_SKILLS);
      setError(err.message);
    } finally {
      setLoading(false);
      isFirstLoad.current = false;
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes for all relevant tables
    const channel = supabase
      .channel('public:db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experience' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blogs' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skills' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return {
    projects,
    experience,
    services,
    achievements,
    blogs,
    testimonials,
    leads,
    skills,
    settings,
    loading,
    error,
    refreshData: fetchData
  };
};