import React, { useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { GraduationCap, Star, MessageSquare, Phone, Mail, Award, Search } from 'lucide-react';

export const CoachesView: React.FC = () => {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // État pour la langue : 'fr', 'en', 'rn' (Kirundi), 'sw' (Swahili)
  const [lang, setLang] = useState<'fr' | 'en' | 'rn' | 'sw'>('fr');

  // Dictionnaire de traduction (Mots-clés)
  const t = {
    fr: {
      title: "Nos",
      subtitle: "L'élite de l'expertise pour booster votre carrière",
      placeholder: "RECHERCHER UN EXPERT OU UNE SPECIALITÉ...",
      exp: "ANS EXP.",
      contact: "Contacter le coach",
      noResult: "Aucun coach ne correspond à votre recherche."
    },
    en: {
      title: "Our",
      subtitle: "The elite expertise to boost your career",
      placeholder: "SEARCH AN EXPERT OR SPECIALTY...",
      exp: "YRS EXP.",
      contact: "Contact the coach",
      noResult: "No coach matches your search."
    },
    rn: {
      title: "Abahungu",
      subtitle: "Inararibonye zacu mu kwubaka kazoza kawe",
      placeholder: "RONDA UMUHINGA CANKE UBUMENYI...",
      exp: "IMYAKA",
      contact: "Twandikire",
      noResult: "Nta mufasha abonetse ku vyo murondera."
    },
    sw: {
      title: "Walimu",
      subtitle: "Wataalamu wetu wa kukuza taaluma yako",
      placeholder: "TAFUTA MTAALAMU AU UTAALAMU...",
      exp: "MIAKA",
      contact: "Wasiliana na mwalimu",
      noResult: "Hakuna mwalimu anayelingana na utafutaji wako."
    }
  }[lang];

  useEffect(() => {
    const fetchCoaches = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setCoaches(data);
        setFilteredCoaches(data);
      }
      setLoading(false);
    };
    fetchCoaches();
  }, []);

  useEffect(() => {
    const results = coaches.filter((coach) =>
      coach.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCoaches(results);
  }, [searchTerm, coaches]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="animate-fadeIn space-y-12">
      
      {/* SÉLECTEUR DE LANGUE DISCRET (BRUTALISTE) */}
      <div className="flex justify-center gap-2 mb-4">
        {['fr', 'en', 'rn', 'sw'].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l as any)}
            className={`px-3 py-1 border-2 border-slate-900 font-black text-[10px] uppercase rounded-lg transition-all ${lang === l ? 'bg-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-slate-900'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* HEADER SECTION */}
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-black tracking-tighter uppercase dark:text-white leading-none">
          {t.title} <span className="text-blue-600 italic">Coaches</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
          {t.subtitle}
        </p>
      </div>

      {/* BARRE DE RECHERCHE BRUTALISTE */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="relative group">
          <input 
            type="text"
            placeholder={t.placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-8 py-5 bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-blue-600 rounded-[25px] font-black uppercase text-xs tracking-widest shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none dark:text-white placeholder:text-slate-300"
          />
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-900 dark:text-blue-600" size={20} />
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredCoaches.length > 0 ? filteredCoaches.map((coach) => (
          <div 
            key={coach.id} 
            className="group relative bg-white dark:bg-slate-900 p-8 rounded-[40px] border-4 border-slate-900 dark:border-blue-600 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] dark:shadow-[12px_12px_0px_0px_rgba(37,99,235,0.3)] hover:-translate-y-2 hover:-translate-x-1 transition-all duration-300"
          >
            {/* BADGE EXPÉRIENCE */}
            <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-4 py-2 rounded-2xl font-black text-xs rotate-12 shadow-xl border-2 border-slate-900">
              +{coach.experience_years || 0} {t.exp}
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-3xl overflow-hidden border-2 border-slate-900 flex-shrink-0">
                <img 
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${coach.full_name}`} 
                  alt={coach.full_name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black dark:text-white uppercase leading-tight">
                  {coach.full_name}
                </h3>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest mt-1">
                  <Award size={12} /> {coach.specialty || 'Expert Consultant'}
                </div>
              </div>
            </div>

            {/* MOTIVATION / BIO */}
            <div className="relative mb-8 h-20">
              <span className="absolute -top-4 -left-2 text-6xl text-slate-100 dark:text-slate-800 font-serif leading-none -z-0">“</span>
              <p className="relative z-10 text-slate-600 dark:text-slate-400 text-sm italic font-medium leading-relaxed line-clamp-3">
                {coach.motivation || "Prêt à partager mon expertise."}
              </p>
            </div>

            {/* CONTACT INFO */}
            <div className="space-y-3 mb-8 border-t border-slate-100 dark:border-slate-800 pt-6">
              {coach.email && (
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-bold truncate">
                  <Mail size={14} className="text-blue-600 flex-shrink-0" /> {coach.email}
                </div>
              )}
              {coach.whatsapp_number && (
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-bold">
                  <Phone size={14} className="text-emerald-500 flex-shrink-0" /> {coach.whatsapp_number}
                </div>
              )}
            </div>

            {/* ACTION BUTTON */}
            <a 
              href={`https://wa.me/${coach.whatsapp_number?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-center items-center gap-3 bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95"
            >
              <MessageSquare size={16} /> {t.contact}
            </a>
          </div>
        )) : (
          <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border-4 border-dashed border-slate-200 dark:border-slate-800">
             <p className="text-slate-400 font-black uppercase italic tracking-widest text-sm">
                {t.noResult}
             </p>
          </div>
        )}
      </div>
    </div>
  );
};