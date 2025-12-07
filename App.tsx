import React, { useState, useEffect } from 'react';
import Portfolio from './components/Portfolio';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'portfolio' | 'admin' | 'auth' | 'privacy' | 'terms'>('portfolio');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Session
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.error("Session init error:", error);
        
        if (mounted) {
          setSession(session);
        }
      } catch (err) {
        console.error("Unexpected auth error:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle Routing based on Session & Hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      window.scrollTo(0, 0); // Ensure we start at the top when switching views

      if (hash === '#admin') {
        if (session) {
          setCurrentView('admin');
        } else {
          setCurrentView('auth');
        }
      } else if (hash === '#privacy') {
        setCurrentView('privacy');
      } else if (hash === '#terms') {
        setCurrentView('terms');
      } else {
        setCurrentView('portfolio');
      }
    };

    if (!loading) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [session, loading]);

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = '';
    setCurrentView('portfolio');
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">Initializing System...</p>
        </div>
      </div>
    );
  }

  // Views
  if (currentView === 'auth') {
    return (
      <Auth 
        onSuccess={() => setCurrentView('admin')} 
        onBack={() => {
          window.location.hash = '';
          setCurrentView('portfolio');
        }} 
      />
    );
  }

  if (currentView === 'admin' && session) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (currentView === 'privacy') {
    return <PrivacyPolicy />;
  }

  if (currentView === 'terms') {
    return <TermsOfService />;
  }

  return <Portfolio />;
};

export default App;