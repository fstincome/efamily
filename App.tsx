import React, { useState, useEffect } from 'react';
import './index.css';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { NewsView } from './components/NewsView';
import { UtilitiesView } from './components/UtilitiesView';
import { TrafficView } from './components/TrafficView';
import { EventsView } from './components/EventsView';
import { MbanzaChat } from './components/MbanzaChat';
import { MarketplaceView } from './components/MarketplaceView';
import { AppView } from './types.ts';
import { Footer } from './components/Footer';
import { InscriptionView } from './components/InscriptionView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { UserDashboard } from './components/UserDashboard'; 
import { RecruiterDashboard } from './components/RecruiterDashboard'; 
import { JobPostView } from './components/JobPostView'; 
import { LoginPortal } from './components/LoginPortal'; 
import { CoachesView } from './components/CoachesView';
import { RecruitersView } from './components/RecruitersView'; 
import { JobsView } from './components/JobsView.tsx';

// --- IMPORTS DES COMPOSANTS FAMILLE ---
import { FinanceForm } from './components/FinanceForm';
import { HealthForm } from './components/HealthForm';
import { EducationForm } from './components/EducationForm';

import { supabase } from './src/supabaseClient'; 
import { useTranslation } from 'react-i18next';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';

// Note: L'import des icônes X, Loader2, HeartPulse a été supprimé ici car elles sont utilisées 
// à l'intérieur des composants Forms, pas dans App.tsx.

const App: React.FC = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<AppView>('home');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [eliteUser, setEliteUser] = useState<any>(null); 
  
  const [jobToEdit, setJobToEdit] = useState<any>(null);
  const currentYear = new Date().getFullYear();

  const handleSetView = (newView: any, data: any = null) => {
    setJobToEdit(data); 
    setView(newView);
    window.scrollTo(0, 0);
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const storedUser = localStorage.getItem('fsti_user');
    if (storedUser) {
      setEliteUser(JSON.parse(storedUser));
    }

    return () => subscription.unsubscribe();
  }, [view]); 

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [view]);

  const PlaceholderView = ({ title, icon }: { title: string, icon: string }) => (
    <div className="animate-fadeIn p-12 bg-white dark:bg-slate-900 rounded-[60px] border-4 border-slate-900 dark:border-blue-600 text-center space-y-6 max-w-2xl mx-auto shadow-2xl transition-colors">
      <span className="text-8xl block">{icon}</span>
      <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium italic">
        Chargement encours. Patientez un instant
      </p>
      <button onClick={() => handleSetView('home')} className="bg-emerald-600 text-white px-10 py-5 rounded-[25px] font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl">
        Retour
      </button>
    </div>
  );

  const renderContent = () => {
    if (loading) return (
      <div className="h-[70vh] flex flex-col items-center justify-center animate-fadeIn">
        <div className="w-16 h-16 border-[6px] border-slate-100 dark:border-slate-800 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="mt-8 font-black text-slate-400 uppercase tracking-[0.4em] text-[10px] text-center leading-relaxed">
          Synchronisation encours...<br/>
          <span className="opacity-50 text-emerald-600">HYADY LEGACY {'OS 2018-•'} {currentYear}</span>
        </p>
      </div>
    );

    switch (view) {
      case 'home': return <HomeView setView={handleSetView} />;
      case 'news': return <NewsView />;
      case 'jobs': return <JobsView />;
      case 'marketplace': return <MarketplaceView />;
      case 'utilities': return <UtilitiesView />;
      case 'traffic': return <TrafficView />;
      case 'food': return <FoodView />;
      case 'events': return <EventsView />;
      case 'mbanza': return <MbanzaChat />;
      case 'register': return <InscriptionView title="Register" icon="✍️" />;
      case 'coaches': return <CoachesView />;
      case 'recruiters': return <RecruitersView />;
      
      case 'admin': 
        if (session) return <AdminDashboardView />; 
        if (eliteUser) {
          if (eliteUser.role === 'recruiter') return <RecruiterDashboard setView={handleSetView} />;
          return <UserDashboard />; 
        }
        return <LoginPortal />; 

      case 'finance':
        return <FinanceForm onClose={() => handleSetView('admin')} onSuccess={() => handleSetView('admin')} />;
      case 'health':
        return <HealthForm onClose={() => handleSetView('admin')} onSuccess={() => handleSetView('admin')} />;
      case 'education':
        return <EducationForm onClose={() => handleSetView('admin')} onSuccess={() => handleSetView('admin')} />;

      case 'post-job': 
        return <JobPostView setView={handleSetView} initialData={jobToEdit} />; 
      
      case 'cart': return <PlaceholderView title="National Basket" icon="🛒" />;
      case 'profile': return <PlaceholderView title="Citizen Profile" icon="👤" />;
      case 'settings': return <PlaceholderView title="Node Config" icon="⚙️" />;
  
      default: return <HomeView setView={handleSetView} />;
    }
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-32 lg:pb-0 lg:pt-28 overflow-x-hidden transition-colors duration-500">
        <Navbar 
          currentView={view} 
          setView={handleSetView} 
          onProfileClick={() => handleSetView('profile')}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode} 
        />
        
        <main className="max-w-7xl mx-auto px-4 lg:px-12 py-10 relative z-10">
          {renderContent()}
        </main>
        
        {/* <Footer /> */}
        
        {/* <a 
          href="https://wa.me/25761128298?text=Bonjour%20Hyady%20Family" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-24 lg:bottom-10 right-4 lg:right-12 flex items-center gap-4 glass dark:bg-slate-900/80 px-6 py-4 rounded-[30px] shadow-2xl z-[60] border border-white/50 dark:border-slate-700 hover:scale-105 transition-all group active:scale-95"
        >
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-50 dark:ring-emerald-900/20"></div>
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="flex flex-col pr-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 text-left mb-1">{t('support_label')}</span>
            <span className="text-[11px] font-black text-slate-900 dark:text-white italic flex items-center gap-2 uppercase">
              {t('support_need_help')}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </div>
        </a> */}
      </div>
    </I18nextProvider>
  );
};

export default App;
