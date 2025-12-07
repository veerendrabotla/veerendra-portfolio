import React from 'react';
import { ArrowLeft, Shield, Lock, Eye } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => window.location.hash = ''} 
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Portfolio
        </button>

        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-800 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-500 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-12">
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-900 rounded-lg text-cyan-500"><Shield className="w-5 h-5" /></div>
                <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
              </div>
              <p className="leading-relaxed">
                Welcome to HyperBuild Labs. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit our website 
                and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-900 rounded-lg text-purple-500"><Eye className="w-5 h-5" /></div>
                <h2 className="text-2xl font-bold text-white">2. Data We Collect</h2>
              </div>
              <p className="leading-relaxed mb-4">
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400 marker:text-cyan-500">
                <li><strong className="text-white">Identity Data:</strong> Includes first name, last name, username or similar identifier.</li>
                <li><strong className="text-white">Contact Data:</strong> Includes email address and telephone numbers submitted via our contact forms.</li>
                <li><strong className="text-white">Technical Data:</strong> Includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                <li><strong className="text-white">Usage Data:</strong> Includes information about how you use our website, products and services.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-900 rounded-lg text-green-500"><Lock className="w-5 h-5" /></div>
                <h2 className="text-2xl font-bold text-white">3. How We Use Your Data</h2>
              </div>
              <p className="leading-relaxed">
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400 marker:text-cyan-500 mt-4">
                <li>To communicate with you regarding project inquiries or services.</li>
                <li>To manage our relationship with you.</li>
                <li>To improve our website, services, marketing and customer relationships.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">4. Data Security</h2>
              <p className="leading-relaxed">
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

             <section className="pt-8 border-t border-slate-800">
              <h2 className="text-xl font-bold text-white mb-2">Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this privacy policy or our privacy practices, please contact us at: <br />
                <a href="mailto:contact@hyperbuildlabs.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">contact@hyperbuildlabs.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
