import React from 'react';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white dark:bg-[#020617] border-t border-slate-100 dark:border-slate-900 pt-28 pb-12 transition-colors duration-500 overflow-hidden">
  
      {/* Arrière-plan : Drapeau du Burundi avec opacité réduite */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.08] dark:opacity-[0.12]"
        style={{
          backgroundImage: `url('https://www.shutterstock.com/fr/video/clip-3643823463-burundi-flag-waving-background-real-fabric-texture')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'contrast(1.2) brightness(0.9)',
        }}
      ></div>

      {/* Overlay de dégradé pour la lisibilité */}
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-white via-white/95 to-white dark:from-[#020617] dark:via-[#020617]/95 dark:to-[#020617]"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Section 1: Vision */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-blue-500/40">
                BI
              </div>
              <h3 className="text-3xl font-black italic tracking-tighter dark:text-white uppercase leading-none">
                FSTI <span className="text-blue-600">Hub</span>
              </h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-bold italic max-w-xs">
              {t('footer_vision')}
            </p>
          </div>

          {/* Section 2: Navigation */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">{t('footer_quick_access')}</h4>
            <ul className="space-y-4 text-[13px] font-black text-slate-600 dark:text-slate-300 italic uppercase tracking-wider">
              <li className="hover:text-blue-600 cursor-pointer transition-all flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span> {t('nav_market')}
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition-all flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span> {t('nav_news_journal')}
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition-all flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span> {t('nav_utils')}
              </li>
            </ul>
          </div>

          {/* Section 3: Technologie */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">{t('footer_ecosystem')}</h4>
            <ul className="space-y-4 text-[13px] font-black text-slate-600 dark:text-slate-300 italic uppercase tracking-wider">
              <li className="hover:text-blue-600 cursor-pointer transition-all">SkyNet Burundi</li>
              <li className="hover:text-blue-600 cursor-pointer transition-all">Ciper Consulting</li>
              <li className="hover:text-blue-600 cursor-pointer transition-all">Mbanza AI Engine</li>
            </ul>
          </div>

          {/* Section 4: Node Status */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">{t('footer_node_status')}</h4>
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-[35px] border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase text-emerald-500">{t('footer_system_active')}</span>
              </div>
              <p className="text-[11px] font-bold dark:text-slate-300 font-mono leading-relaxed">
                LOC: 3.4076° S, 29.9312° E<br/>
                ALT: 1,504 m<br/>
                NET: FSTI-BDI-SECURE
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-[0.3em] dark:text-white">{t('footer_country')}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase italic">{t('footer_motto')}</span>
             </div>
          </div>
          
          <div className="text-center md:text-right space-y-1">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
              © {currentYear} FSTI HUB • {t('footer_propulsion')}
            </p>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">
              Gitega Digital Lab • v2.6.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};