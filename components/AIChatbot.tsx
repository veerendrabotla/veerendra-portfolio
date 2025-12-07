import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';
import { usePortfolioData } from '../hooks/usePortfolioData';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

const SUGGESTIONS = [
  { label: "🛠 Tech Stack", text: "What technologies does Veerendra use?" },
  { label: "📂 Projects", text: "Tell me about his best projects." },
  { label: "💰 Services", text: "What services does HyperBuild Labs offer?" },
  { label: "📧 Contact", text: "How can I hire him?" },
];

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: "Hi! I'm Veerendra's AI Assistant. Ask me anything about his skills, projects, or agency work." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch real data to pass to AI context
  const { projects, experience, achievements, services } = usePortfolioData();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Pass the current CMS data to the AI service
      const responseText = await sendMessageToGemini(textToSend, {
        projects,
        experience,
        achievements,
        services
      });
      
      const botMsg: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: "Oops, I encountered an error." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-cyan-500 hover:bg-cyan-400 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 neon-glow group"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </button>
      )}

      {isOpen && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-80 sm:w-96 shadow-2xl flex flex-col h-[500px] overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="bg-cyan-500/20 p-1.5 rounded-full border border-cyan-500/30">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Veerendra AI</h3>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white bg-slate-700/50 p-1 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg shadow-cyan-900/20'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length < 3 && !isTyping && (
             <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                {SUGGESTIONS.map((s) => (
                   <button 
                     key={s.label}
                     onClick={() => handleSend(s.text)}
                     className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-cyan-900/30 border border-slate-700 hover:border-cyan-500/50 rounded-full text-xs text-cyan-400 transition-colors flex items-center gap-1"
                   >
                      {s.label}
                   </button>
                ))}
             </div>
          )}

          {/* Input */}
          <div className="p-3 bg-slate-800 border-t border-slate-700">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about projects..."
                className="w-full bg-slate-900 text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 border border-slate-700 placeholder-slate-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
                className="absolute right-2 top-2 p-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;