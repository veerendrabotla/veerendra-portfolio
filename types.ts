
export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  fullDescription?: string;
  image: string;
  techStack: string[];
  demoLink: string;
  githubLink: string;
  featured: boolean;
  visible: boolean;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string[];
  type: 'work' | 'education' | 'hackathon';
  visible: boolean;
}

export interface Skill {
  id?: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Cloud' | 'AI/ML' | 'Tools';
  level: number; // 0-100
}

export interface Service {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  icon: string;
  priceStart?: string;
  features?: string[];
  visible: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  date: string;
  type: 'Award' | 'Certificate' | 'Hackathon';
  image?: string;
  visible: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  coverImage: string;
  date: string;
  tags: string[];
  status: 'published' | 'draft';
  views: number;
}

export interface Testimonial {
  id: string;
  clientName: string;
  company: string;
  image: string;
  review: string;
  rating: number;
  project?: string;
  visible: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  status: 'new' | 'read' | 'replied' | 'converted';
  source: 'contact_form';
}

export interface AdminLog {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  user: string;
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
  theme: 'dark' | 'light';
}
