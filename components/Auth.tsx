import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, Key, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onSuccess: () => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess, onBack }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (view === 'register') {
        // Registration Validation
        if (securityCode !== 'rani') {
          throw new Error("Invalid Security Code. Access Denied.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.session) {
           // If email confirmation is off, we are logged in immediately
           onSuccess();
        } else {
           alert('Registration successful! Please check your email to verify account.');
           setView('login');
           // Clean state
           setSecurityCode('');
           setConfirmPassword('');
           setPassword(''); 
        }
      } else {
        // Login Logic
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Portfolio</span>
      </button>

      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] group hover:rotate-6 transition-all duration-300">
            <Lock className="w-8 h-8 text-cyan-500 group-hover:scale-110 transition-transform" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {view === 'login' ? 'Welcome Back' : 'Create Admin Account'}
          </h2>
          <p className="text-slate-400 text-sm">
            {view === 'login' ? 'Enter credentials to access CMS' : 'Enter security code to register'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              required
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3.5 text-white focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3.5 text-white focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Register Only Fields */}
          {view === 'register' && (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <div className="relative group">
                <ShieldCheck className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3.5 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="relative group">
                <Key className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-purple-500 transition-colors" />
                <input
                  type="password"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  placeholder="Security Code (Required)"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3.5 text-white focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Login Only Fields */}
          {view === 'login' && (
            <div className="flex items-center justify-between text-sm animate-in slide-in-from-top-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-slate-300">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500/50" 
                />
                Remember me
              </label>
              <button type="button" className="text-cyan-400 hover:text-cyan-300">Forgot password?</button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {view === 'login' ? 'Access Dashboard' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle View */}
        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            onClick={() => {
              setView(view === 'login' ? 'register' : 'login');
              setError('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setSecurityCode('');
            }}
            className="text-slate-400 text-sm hover:text-cyan-400 transition-colors"
          >
            {view === 'login' 
              ? "Don't have an account? Register" 
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;