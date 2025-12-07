import React from 'react';
import { ArrowLeft, FileText, Gavel, Scale } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12 font-sans selection:bg-purple-500/30">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => window.location.hash = ''} 
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Portfolio
        </button>

        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-800 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-slate-500 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-12">
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-900 rounded-lg text-purple-500"><FileText className="w-5 h-5" /></div>
                <h2 className="text-2xl font-bold text-white">1. Agreement to Terms</h2>
              </div>
              <p className="leading-relaxed">
                By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations. 
                If you do not agree with these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-900 rounded-lg text-cyan-500"><Gavel className="w-5 h-5" /></div>
                <h2 className="text-2xl font-bold text-white">2. Intellectual Property Rights</h2>
              </div>
              <p className="leading-relaxed">
                Unless otherwise indicated, the Site and its entire contents, features, and functionality (including but not limited to all information, software, code, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by HyperBuild Labs, its licensors, or other providers of such material and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-900 rounded-lg text-pink-500"><Scale className="w-5 h-5" /></div>
                <h2 className="text-2xl font-bold text-white">3. Services & Engagement</h2>
              </div>
              <p className="leading-relaxed">
                Our portfolio displays services offered by HyperBuild Labs. Engaging our services is subject to a separate service agreement. 
                The content on this portfolio is for showcase purposes and does not constitute a binding offer for any specific project or price unless confirmed in writing.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">4. Limitation of Liability</h2>
              <p className="leading-relaxed">
                In no event shall HyperBuild Labs or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on HyperBuild Labs' website, even if HyperBuild Labs or a HyperBuild Labs authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

             <section className="pt-8 border-t border-slate-800">
              <h2 className="text-xl font-bold text-white mb-2">Governing Law</h2>
              <p className="leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
