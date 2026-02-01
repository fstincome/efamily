import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, ShieldCheck, MapPin, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white dark:bg-[#020617] border-t border-slate-100 dark:border-slate-900 pt-28 pb-12 transition-colors duration-500 overflow-hidden">
  
      {/* Arrière-plan : Image familiale ou Texture (remplacé le drapeau par une texture plus douce) */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url('/70.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      {/* Overlay de dégradé */}
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-white via-white/95 to-white dark:from-[#020617] dark:via-[#020617]/95 dark:to-[#020617]"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Section 1: Identité Familiale */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40">
                <Heart size={24} fill="currentColor" />
              </div>
              <span span className="text-green-600">HYADY</span><span span className="text-blue-600">LEGACY {'OS'} </span>
              
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-bold italic max-w-xs">
              "Préserver nos souvenirs, bâtir notre avenir et rester unis, peu importe la distance."
            </p>
          </div>

          {/* Section 2: Accès Rapides */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Navigation</h4>
            <ul className="space-y-4 text-[13px] font-black text-slate-600 dark:text-slate-300 italic uppercase tracking-wider">
              <li className="hover:text-blue-600 cursor-pointer transition-all flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span> Journal Familial
              </li>
              
              <li className="hover:text-blue-600 cursor-pointer transition-all flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span> Hyady AI Chat
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition-all flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span> Événements
              </li>
            </ul>
          </div>

          {/* Section 3: Sécurité & Privé */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Confidentialité</h4>
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic">
                    Cet espace est strictement privé. Les données sont chiffrées et réservées aux membres de la famille.
                </p>
            </div>
          </div>

          {/* Section 4: Localisation du Hub */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Origine du Node</h4>
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-[35px] border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-blue-600" />
                <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">Gitega, Burundi</span>
              </div>
              <p className="text-[11px] font-bold dark:text-slate-300 font-mono leading-relaxed opacity-70">
                SERVEUR: PRIVÉ-FAM-01<br/>
                STATUS: EN LIGNE<br/>
                SYNC: TEMPS RÉEL
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-[0.3em] dark:text-white">Burundi</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase italic">Bwoga-Gitega</span>
              </div>
          </div>
          
          <div className="text-center md:text-right space-y-1">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
              © {currentYear} HYADY LEGACY OS • 
            </p>
            <p className="text-[9px] font-bold text-blue-600  tracking-widest">
            L'alchimie du temps changée en patrimoine éternel.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};