import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppView } from '../types.ts';
import { 
  Moon, Sun, Languages, Lock, UserCheck, 
  Home, Newspaper, UserPlus, ShoppingBag, 
  Zap, MessageCircle, ShieldCheck ,BriefcaseBusiness
} from 'lucide-react';
import { supabase } from '../src/supabaseClient';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onProfileClick: () => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setView, 
  toggleDarkMode, 
  isDarkMode 
}) => {
  const { t, i18n } = useTranslation();
  const [session, setSession] = useState<any>(null);
  const [isEliteUser, setIsEliteUser] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const checkEliteSession = () => {
      const storedUser = localStorage.getItem('fsti_user');
      setIsEliteUser(!!storedUser);
    };

    checkEliteSession();
    window.addEventListener('storage', checkEliteSession);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', checkEliteSession);
    };
  }, [currentView]);

  // Items de navigation avec icônes Lucide pour plus de finesse
  const navItems = [
    { id: 'home' as AppView, label: t('nav_home'), icon: <Home size={18} /> },
    { id: 'news' as AppView, label: t('nav_news'), icon: <Newspaper size={18} /> },
    { id: 'jobs' as AppView, label: t('nav_jobs'), icon: <BriefcaseBusiness size={18} /> },
    { id: 'register' as AppView, label: t('nav_register'), icon: <UserPlus size={18} /> },
    { id: 'marketplace' as AppView, label: t('nav_market'), icon: <ShoppingBag size={18} /> },
    // { id: 'utilities' as AppView, label: t('nav_pay'), icon: <Zap size={18} /> },
    { id: 'mbanza' as AppView, label: t('nav_chat'), icon: <MessageCircle size={18} /> },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentYear = new Date().getFullYear();
  const isAnySessionActive = session || isEliteUser;

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:top-0 lg:bottom-auto glass z-[100] border-t lg:border-t-0 lg:border-b border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-2 lg:px-10">
        <div className="flex justify-between items-center h-20 lg:h-24 gap-2">
          
          {/* Logo Section */}
          <div 
            className="hidden lg:flex items-center gap-4 cursor-pointer group shrink-0" 
            onClick={() => setView('home')}
          >
          <img src="/1.jpg" alt="Logo Hub" className="w-30 h-30 object-contain rounded-full" />      
            <div className="flex flex-col">
               <span className="font-black text-xl tracking-tighter leading-none text-slate-900 dark:text-white uppercase">
                 {'HYADY LEGACY '} <span className="text-blue-600">{'OS 2018-•'} {currentYear} </span>
               </span> 
               <span className="text-[8px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-500  mt-1">
                 {t('L\'alchimie du temps changée en patrimoine éternel.')} 
               </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-1 justify-start lg:justify-center items-center gap-1 overflow-x-auto no-scrollbar px-2 py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col lg:flex-row items-center gap-1.5 lg:gap-2 px-4 py-2.5 rounded-2xl transition-all duration-300 shrink-0 ${
                  currentView === item.id 
                    ? 'text-blue-600 lg:bg-blue-50 dark:lg:bg-blue-900/20 scale-105 shadow-sm lg:shadow-none' 
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="text-[9px] lg:text-[10px] font-black whitespace-nowrap uppercase tracking-widest">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Utility Controls */}
          <div className="flex items-center gap-2 lg:gap-4 ml-2 shrink-0">
            
            {/* Language Selector */}
            <div className="relative group">
              <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <Languages size={18} />
              </button>
              <div className="absolute right-0 bottom-full lg:bottom-auto lg:top-full mb-4 lg:mb-0 lg:mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[110] p-1">
                {['fr', 'en', 'sw', 'rn'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors ${
                      i18n.language === lang 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {lang === 'rn' ? 'Kirundi' : lang === 'sw' ? 'Swahili' : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-yellow-500 hover:text-white transition-all shadow-sm"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Elite Portal / Login Toggle */}
            <button 
                onClick={() => setView('admin')}
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex flex-col items-center justify-center transition-all border shrink-0 group ${
                  currentView === 'admin' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                  : 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-md'
                }`}
            >
               {isAnySessionActive ? <UserCheck size={18} /> : <Lock size={18} />}
               <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">
                 {isAnySessionActive 
                   ? (session ? t('nav_status_admin') : t('nav_status_hub')) 
                   : t('nav_elite_login')
                 }
               </span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};