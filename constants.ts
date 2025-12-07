import { Project, ExperienceItem, Skill, Service, Achievement, BlogPost, Testimonial, Lead, AdminLog, SiteSettings } from './types';
import { Monitor, Server, Brain, Cloud, Smartphone, Megaphone, Terminal, Award } from 'lucide-react';

export const HERO_CONTENT = {
  name: "Veerendra",
  title: "Full-Stack Developer | AI Enthusiast",
  subtitle: "Founder of HyperBuild Labs",
  tagline: "Building digital experiences at the intersection of design and artificial intelligence.",
};

export const SKILLS: Skill[] = [
  { name: "React/Next.js", category: "Frontend", level: 95 },
  { name: "TypeScript", category: "Frontend", level: 90 },
  { name: "Tailwind CSS", category: "Frontend", level: 95 },
  { name: "Node.js", category: "Backend", level: 85 },
  { name: "Python", category: "Backend", level: 80 },
  { name: "PostgreSQL", category: "Backend", level: 80 },
  { name: "TensorFlow", category: "AI/ML", level: 70 },
  { name: "Gemini API", category: "AI/ML", level: 90 },
  { name: "AWS", category: "Cloud", level: 75 },
  { name: "Docker", category: "Cloud", level: 80 },
];

export const PROJECTS: Project[] = [
  {
    id: "1",
    title: "HyperBuild Labs Agency Site",
    category: "Web Development",
    description: "The official agency website featuring 3D interactions and high-performance SEO.",
    image: "https://picsum.photos/800/600?random=1",
    techStack: ["Next.js", "Three.js", "Tailwind"],
    demoLink: "#",
    githubLink: "#",
    featured: true,
    visible: true,
  },
  {
    id: "2",
    title: "NeuroFinance AI",
    category: "AI/ML",
    description: "A hackathon-winning fintech application predicting market trends using LSTM models.",
    image: "https://picsum.photos/800/600?random=2",
    techStack: ["Python", "FastAPI", "React"],
    demoLink: "#",
    githubLink: "#",
    featured: true,
    visible: true,
  },
  {
    id: "3",
    title: "EventHorizon",
    category: "App Development",
    description: "A cross-platform mobile app for managing large-scale tech conferences.",
    image: "https://picsum.photos/800/600?random=3",
    techStack: ["React Native", "Firebase"],
    demoLink: "#",
    githubLink: "#",
    featured: false,
    visible: true,
  },
];

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: "1",
    role: "Founder & Lead Developer",
    company: "HyperBuild Labs",
    period: "2022 - Present",
    description: [
      "Scaled agency to 5-figure monthly revenue.",
      "Delivered 15+ high-impact client projects.",
      "Managed a remote team of 4 developers."
    ],
    type: "work",
    visible: true,
  },
  {
    id: "2",
    role: "Hackathon Team Lead",
    company: "Global Tech Hackathon",
    period: "2023",
    description: [
      "Led a team of 5 to build an AI accessibility tool.",
      "Won 1st Place in 'Best Use of AI' category.",
      "Integrated Gemini API for real-time vision processing."
    ],
    type: "hackathon",
    visible: true,
  },
  {
    id: "3",
    role: "Senior Frontend Intern",
    company: "TechGiant Corp",
    period: "2021 - 2022",
    description: [
      "Optimized core dashboard performance by 40%.",
      "Migrated legacy code to TypeScript."
    ],
    type: "work",
    visible: true,
  }
];

export const SERVICES: Service[] = [
  {
    id: "1",
    title: "Web Development",
    tagline: "Pixel perfect websites",
    description: "High-performance websites using Next.js and React.",
    icon: "Monitor",
    priceStart: "$1,500",
    features: ["SEO Optimized", "Responsive", "CMS Integration"],
    visible: true,
  },
  {
    id: "2",
    title: "AI Integration",
    tagline: "Smart automation",
    description: "Custom AI chatbots, automation, and LLM fine-tuning.",
    icon: "Brain",
    priceStart: "$2,000",
    features: ["Chatbots", "Data Analysis", "Automation"],
    visible: true,
  },
  {
    id: "3",
    title: "App Development",
    tagline: "iOS & Android",
    description: "Cross-platform mobile apps for iOS and Android.",
    icon: "Smartphone",
    priceStart: "$3,000",
    features: ["React Native", "Offline Mode", "Push Notifications"],
    visible: true,
  },
  {
    id: "4",
    title: "Branding & Design",
    tagline: "Identity that speaks",
    description: "Futuristic UI/UX design and brand identity.",
    icon: "Megaphone",
    priceStart: "$1,000",
    features: ["Logo Design", "Brand Guidelines", "UI Kit"],
    visible: true,
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "1", title: "Smart India Hackathon Winner", issuer: "Govt of India", date: "2023", type: "Hackathon", visible: true },
  { id: "2", title: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", date: "2023", type: "Certificate", visible: true },
  { id: "3", title: "Best UI/UX Design Award", issuer: "Dribbble Meetup", date: "2022", type: "Award", visible: true },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "The Future of AI in Web Development",
    excerpt: "How Generative AI is reshaping the way we build and interact with the web.",
    content: "# The Future of AI\nAI is changing everything...",
    coverImage: "https://picsum.photos/800/400?random=4",
    date: "2023-10-15",
    tags: ["AI", "Web Dev", "Future"],
    status: "published",
    views: 1240
  },
  {
    id: "2",
    title: "Mastering Next.js 14 App Router",
    excerpt: "A comprehensive guide to the new routing system in Next.js.",
    content: "# Next.js 14\nThe app router is a paradigm shift...",
    coverImage: "https://picsum.photos/800/400?random=5",
    date: "2023-11-02",
    tags: ["Next.js", "React", "Tutorial"],
    status: "published",
    views: 890
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    clientName: "Sarah Johnson",
    company: "TechFlow Inc.",
    image: "https://i.pravatar.cc/150?u=1",
    review: "Veerendra delivered our project 2 weeks early and the code quality was exceptional.",
    rating: 5,
    visible: true
  },
  {
    id: "2",
    clientName: "Michael Chen",
    company: "StartUp Valley",
    image: "https://i.pravatar.cc/150?u=2",
    review: "The AI integration he built saved our support team 20 hours a week.",
    rating: 5,
    visible: true
  }
];

export const LEADS: Lead[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@enterprise.com",
    message: "We are looking for a full website redesign.",
    date: "2023-11-20",
    status: "new",
    source: "contact_form"
  },
  {
    id: "2",
    name: "Alice Smith",
    email: "alice@agency.design",
    message: "Interested in your white-label development services.",
    date: "2023-11-18",
    status: "replied",
    source: "contact_form"
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  heroTitle: HERO_CONTENT.title,
  heroSubtitle: HERO_CONTENT.subtitle,
  contactEmail: "contact@veerendra.dev",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  resumeUrl: "/resume.pdf",
  theme: "dark"
};
