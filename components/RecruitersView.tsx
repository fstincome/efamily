import React, { useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
// Correction de l'import ici : lucide-react au lieu de lucide-center
import { Building2, MapPin, CheckCircle, MessageSquare, Mail, Search } from 'lucide-react';

export const RecruitersView: React.FC = () => {
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [lang, setLang] = useState<'fr' | 'en' | 'rn' | 'sw'>('fr');

  const t = {
    fr: {
      title: "Partenaires",
      rec_word: "Recruteurs",
      subtitle: "Les entreprises qui propulsent l'économie numérique au Burundi",
      search: "RECHERCHER UNE ENTREPRISE...",
      verified: "VÉRIFIÉ",
      contact_label: "Contact",
      motivation_default: "Engagé pour le recrutement des meilleurs talents technologiques.",
      offers: "Offres",
      no_result: "Aucun recruteur ne correspond à votre recherche."
    },
    en: {
      title: "Recruitment",
      rec_word: "Partners",
      subtitle: "Companies driving the digital economy in Burundi",
      search: "SEARCH FOR A COMPANY...",
      verified: "VERIFIED",
      contact_label: "Contact",
      motivation_default: "Committed to recruiting the best technological talents.",
      offers: "Jobs",
      no_result: "No recruiter matches your search."
    },
    rn: {
      title: "Abafashanya",
      rec_word: "mu kazi",
      subtitle: "Amashirahamwe adushigikiye mu vyo kumenyesha ubuhinga",
      search: "RONDA ISHIRAHAMWE...",
      verified: "VYEMEJE",
      contact_label: "Twandikire",
      motivation_default: "Twiyemeje guha akazi abahinga b'akarorero.",
      offers: "Akazi",
      no_result: "Nta shirahamwe na rimwe rironseke ku vyo murondera."
    },
    sw: {
      title: "Washirika",
      rec_word: "Waajiri",
      subtitle: "Makampuni yanayochochea uchumi wa kidijitali nchini Burundi",
      search: "TAFUTA KAMPUNI...",
      verified: "THIBITISHWA",
      contact_label: "Mawasiliano",
      motivation_default: "Tumejitolea kuajiri vipaji bora vya kiteknolojia.",
      offers: "Kazi",
      no_result: "Hakuna mwajiri anayelingana na utafutaji wako."
    }
  }[lang];

  useEffect(() => {
    const fetchRecruiters = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('recruiters')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setRecruiters(data);
          setFilteredRecruiters(data);
        }
      } catch (err) {
        console.error("Error fetching recruiters:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiters();
  }, []);

  useEffect(() => {
    const filtered = recruiters.filter((rec) =>
      rec.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecruiters(filtered);
  }, [searchTerm, recruiters]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="animate-fadeIn space-y-12">
      
      {/* LANGUAGE SWITCHER */}
      <div className="flex justify-center gap-2">
        {['fr', 'en', 'rn', 'sw'].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l as any)}
            className={`px-4 py-1 border-2 border-slate-900 font-black text-[10px] uppercase rounded-lg transition-all ${
              lang === l ? 'bg-emerald-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-slate-900 hover:bg-slate-50'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-6xl font-black tracking-tighter uppercase dark:text-white leading-none">
          {t.title} <span className="text-emerald-500 italic">{t.rec_word}</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">
          {t.subtitle}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <div className="relative group">
          <input 
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-8 py-5 bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-emerald-500 rounded-[25px] font-black uppercase text-xs tracking-widest shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none dark:text-white"
          />
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-900 dark:text-emerald-500" size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRecruiters.length > 0 ? filteredRecruiters.map((rec) => (
          <div 
            key={rec.id} 
            className="group bg-white dark:bg-slate-900 p-8 rounded-[40px] border-4 border-slate-900 dark:border-slate-800 hover:border-emerald-500 transition-all shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] dark:shadow-[12px_12px_0px_0px_rgba(16,185,129,0.2)]"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-100 dark:border-emerald-900/30">
                <Building2 size={32} />
              </div>
              {rec.status === 'verified' && (
                <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-emerald-500/20 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.2)]">
                  <CheckCircle size={12} /> {t.verified}
                </div>
              )}
            </div>

            <h3 className="text-2xl font-black dark:text-white uppercase leading-tight mb-1">
              {rec.company_name}
            </h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6 text-emerald-600">
              {t.contact_label}: {rec.full_name}
            </p>

            <div className="space-y-4 mb-8">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium italic leading-relaxed line-clamp-2 h-10">
                "{rec.motivation || t.motivation_default}"
              </p>
              
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold truncate">
                  <Mail size={14} className="text-emerald-500 flex-shrink-0" /> {rec.email}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                  <MapPin size={14} className="text-emerald-500 flex-shrink-0" /> Burundi / International
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {t.offers}
              </button>
              <a 
                href={`https://wa.me/${rec.whatsapp_number?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95"
              >
                <MessageSquare size={14} /> {t.contact_label}
              </a>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border-4 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 font-black uppercase italic tracking-widest text-sm">
                {t.no_result}
              </p>
          </div>
        )}
      </div>
    </div>
  );
};