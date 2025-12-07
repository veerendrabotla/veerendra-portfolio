import { GoogleGenAI, Type } from "@google/genai";
import { Project, ExperienceItem, Achievement, Service, Lead } from '../types';

interface AIContext {
  projects: Project[];
  experience: ExperienceItem[];
  achievements: Achievement[];
  services: Service[];
}

let aiClient: GoogleGenAI | null = null;

// Safe access to process.env to prevent crashing in browser environments where process is undefined
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore reference errors
  }
  return null;
};

const apiKey = getApiKey();
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

export const sendMessageToGemini = async (message: string, context: AIContext): Promise<string> => {
  if (!aiClient) {
    return "I'm sorry, my AI brain isn't connected right now (API Key missing). Please contact Veerendra directly!";
  }

  // Construct dynamic system prompt based on CMS data
  const systemPrompt = `
    You are an AI Assistant for Veerendra, the founder of HyperBuild Labs.
    Your goal is to impress recruiters and potential clients visiting his portfolio.
    
    Here is the live data about Veerendra:

    EXPERIENCE:
    ${context.experience.map(e => `- ${e.role} at ${e.company} (${e.period}): ${e.description?.join(', ')}`).join('\n')}

    PROJECTS:
    ${context.projects.map(p => `- ${p.title} (${p.category}): ${p.description}. Tech: ${p.techStack?.join(', ')}`).join('\n')}

    SERVICES (HyperBuild Labs):
    ${context.services.map(s => `- ${s.title}: ${s.description} (Starts at ${s.priceStart})`).join('\n')}

    ACHIEVEMENTS:
    ${context.achievements.map(a => `- ${a.title} from ${a.issuer} (${a.date})`).join('\n')}

    Tone: Professional, enthusiastic, concise, and helpful.
    If asked about contact info, suggest using the contact form on the site.
    Keep answers under 50 words unless asked for detail.
  `;

  try {
    const model = aiClient.models;
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm currently experiencing high traffic. Please try again later.";
  }
};

export const parseResume = async (base64Data: string, mimeType: string) => {
  if (!aiClient) throw new Error("API Key missing");

  // Define strict schema for the model output
  const schema = {
    type: Type.OBJECT,
    properties: {
      personalInfo: {
        type: Type.OBJECT,
        properties: {
          heroTitle: { type: Type.STRING, description: "Professional title, e.g., Full Stack Developer" },
          heroSubtitle: { type: Type.STRING, description: "Short 1-sentence bio or summary" },
          email: { type: Type.STRING },
          github: { type: Type.STRING },
          linkedin: { type: Type.STRING }
        }
      },
      experience: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            company: { type: Type.STRING },
            period: { type: Type.STRING, description: "e.g., 2023 - Present" },
            type: { type: Type.STRING, description: "Must be one of: work, education, hackathon" },
            description: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of bullet points describing responsibilities"
            }
          }
        }
      },
      projects: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING, description: "e.g. Web Dev, AI/ML, Mobile App" },
            description: { type: Type.STRING, description: "Short summary for cards (max 100 chars)" },
            fullDescription: { type: Type.STRING, description: "Detailed description of the project" },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            demoLink: { type: Type.STRING },
            githubLink: { type: Type.STRING }
          }
        }
      },
      achievements: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            issuer: { type: Type.STRING },
            date: { type: Type.STRING },
            type: { type: Type.STRING, description: "Certificate, Award, or Hackathon" }
          }
        }
      }
    }
  };

  const prompt = `
    Analyze the attached resume document. 
    Extract the work experience, projects, skills/achievements, and personal details.
    Map them strictly to the JSON schema provided.
    
    - For 'experience.type', infer if it is 'work', 'education' or 'hackathon' based on context.
    - For 'projects.techStack', extract list of technologies used.
    - If a field is missing, leave it as an empty string or empty array.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    let text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    // Sanitize JSON (remove markdown code blocks if present)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Resume Parsing Error:", error);
    throw error;
  }
};

export const generateBlogPost = async (title: string, tags: string[] = []) => {
  if (!aiClient) throw new Error("API Key missing");

  const prompt = `
    Write a comprehensive, engaging, and technical blog post with the title: "${title}".
    Tags/Topics: ${tags.join(', ')}.
    
    Requirements:
    - Use Markdown formatting (## Headers, **bold**, code blocks, lists).
    - Tone: Professional, authoritative, yet accessible (Developer focused).
    - Structure: Introduction, 3-4 Key Sections with technical depth, Conclusion.
    - Length: Approximately 400-600 words.
    - Do NOT include the title in the body (it will be rendered separately).
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Failed to generate blog content.";
  } catch (error) {
    console.error("Blog Gen Error:", error);
    throw error;
  }
};

export const generateEmailReply = async (lead: Lead) => {
  if (!aiClient) throw new Error("API Key missing");

  const prompt = `
    Draft a professional, friendly, and persuasive email reply to a potential client.
    
    Client Name: ${lead.name}
    Client Message: "${lead.message}"
    
    My Role: Veerendra, Founder of HyperBuild Labs (Agency).
    
    Requirements:
    - Acknowledge their specific needs based on the message.
    - Propose a brief call to discuss details.
    - Tone: Professional, confident, but approachable.
    - No placeholders like [Date], just say "at your earliest convenience".
    - Sign off as Veerendra.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate draft.";
  } catch (error) {
    console.error("Email Gen Error:", error);
    throw error;
  }
};

export const suggestTechStack = async (description: string) => {
  if (!aiClient) throw new Error("API Key missing");

  const prompt = `
    Based on the following project description, suggest a list of relevant modern technologies (Tech Stack) used to build it.
    Description: "${description}"
    
    Return ONLY a comma-separated list of technologies. E.g. "React, Node.js, Firebase".
    Max 5 items.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text || "";
    // Clean up response to just be the list
    return text.split(',').map(s => s.trim());
  } catch (error) {
    console.error("Tech Stack Gen Error:", error);
    return [];
  }
};

export const improveWriting = async (text: string) => {
  if (!aiClient) throw new Error("API Key missing");

  const prompt = `
    Rewrite the following job description bullet points to be more professional, impactful, and results-oriented (using the STAR method where possible). 
    Keep the meaning but make it sound impressive for a resume/portfolio.
    
    Input:
    "${text}"
    
    Return ONLY the rewritten text, preserving the bullet point format (one item per line).
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || text;
  } catch (error) {
    console.error("Improve Writing Error:", error);
    return text;
  }
};