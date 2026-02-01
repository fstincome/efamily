import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../src/supabaseClient';
// Importation de la liste des domaines depuis InscriptionView pour garantir la cohérence
import { DOMAINES_ACTIVITE } from './InscriptionView'; 

interface Talent {
  id: string;
  full_name: string;
  role_title: string;
  category: string;
  province: string;
  status: string;
  profile_image_url: string;
  cv_url: string;
  skills: string[];
  is_certified: boolean;
  bio: string;
  experience_summary: string;
  education_level: string;
  whatsapp_number?: string;
}

export const MarketplaceView: React.FC = () => {
  const { t } = useTranslation();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);

  useEffect(() => { fetchTalents(); }, []);

  const fetchTalents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('talents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Erreur:", error.message);
    else setTalents(data || []);
    setLoading(false);
  };

  const filteredTalents = talents.filter(t => {
    const matchesSearch = (t.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                          (t.role_title?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || t.category === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 bg-[#f8f9fa] dark:bg-[#0a0a0a] min-h-screen">
      <div className="w-12 h-12 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="font-black italic text-slate-400 uppercase tracking-[0.4em] text-[10px]">
        {t('mkt_loading')}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {selectedTalent ? (
          <DetailedView talent={selectedTalent} onClose={() => setSelectedTalent(null)} />
        ) : (
          <div className="space-y-12 animate-fadeIn">
            {/* --- HEADER --- */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="max-w-2xl space-y-4">
                <h2 className="text-7xl md:text-8xl font-black italic tracking-tighter dark:text-white uppercase leading-[0.85]">
                  <span className="text-blue-600">{t('mkt_title_elite')}</span> 
                  <br />
                  <span className="text-slate-300 dark:text-slate-800">
                    {t('mkt_title_directory')}
                  </span>
                </h2>
                <p className="text-slate-500 font-bold italic border-l-4 border-blue-600 pl-6 uppercase text-[10px] tracking-widest">
                  {t('mkt_subtitle')}
                </p>
              </div>
              <input 
                type="text" 
                placeholder={t('mkt_search_placeholder')}
                className="w-full lg:w-96 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-6 rounded-3xl outline-none focus:border-blue-600 dark:text-white font-bold italic shadow-xl transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </header>

  {/* --- SÉLECTEUR DE CATÉGORIES (MENU DÉROULANT) --- */}
<div className="flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-[30px] border-2 border-slate-100 dark:border-slate-800 shadow-xl">
  <div className="flex items-center gap-3 min-w-fit">
    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
      <span className="text-lg">🎯</span>
    </div>
    <span className="font-black uppercase text-[10px] tracking-widest dark:text-slate-400">
      Filtrer par domaine :
    </span>
  </div>

  <div className="relative w-full">
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="w-full appearance-none bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 dark:text-white font-black italic uppercase text-[11px] tracking-widest cursor-pointer transition-all"
    >
      <option value="All">{t('cat_all')}</option>
      {DOMAINES_ACTIVITE.map((cat) => (
        <option key={cat} value={cat}>
          {cat.toUpperCase()}
        </option>
      ))}
    </select>
    
    {/* Indicateur visuel pour montrer que c'est un menu déroulant */}
    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </div>
  </div>

  {/* Petit compteur de talents trouvés */}
  <div className="hidden lg:block min-w-fit px-6 border-l-2 border-slate-100 dark:border-slate-800">
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
      Résultats : <span className="text-blue-600 text-lg ml-2">{filteredTalents.length}</span>
    </p>
  </div>
</div>

            {/* --- GRILLE DES TALENTS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredTalents.map((talent) => (
                <div key={talent.id} className="group bg-white dark:bg-[#111] rounded-[50px] overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div className="h-64 relative overflow-hidden">
                    <img src={talent.profile_image_url || 'https://via.placeholder.com/400'} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt={talent.full_name} />
                    <div className="absolute top-6 right-6 bg-white/90 dark:bg-black/90 px-4 py-2 rounded-full backdrop-blur-md">
                        <span className="text-[9px] font-black uppercase text-blue-600 italic tracking-widest">{talent.province}</span>
                    </div>
                  </div>

                  <div className="p-8 flex-grow flex flex-col">
                    <div className="mb-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter leading-none">{talent.full_name}</h3>
                        {talent.is_certified && <span className="text-blue-600 font-bold">✦</span>}
                      </div>
                      <p className="text-blue-600 font-bold uppercase text-[10px] tracking-widest mt-1">{talent.role_title}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl mb-6 border border-slate-100 dark:border-slate-700/50">
                       <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold italic line-clamp-2">
                         ⚡ "{talent.experience_summary || t('mkt_new_talent')}"
                       </p>
                    </div>

                    <button 
                      onClick={() => { setSelectedTalent(talent); window.scrollTo(0,0); }}
                      className="w-full py-5 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95"
                    >
                      {t('mkt_btn_view')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- VUE DÉTAILLÉE ---
const DetailedView = ({ talent, onClose }: { talent: Talent, onClose: () => void }) => {
  const { t } = useTranslation();
  
  return (
    <div className="animate-fadeIn space-y-8">
      <button onClick={onClose} className="group flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.3em] text-blue-600 hover:gap-4 transition-all">
        <span className="text-lg">←</span> {t('mkt_back_hub')}
      </button>

      <div className="bg-white dark:bg-[#111] rounded-[60px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/20 p-8 lg:p-12 border-r border-slate-100 dark:border-slate-800 flex flex-col items-center">
            <div className="w-full max-w-[320px] aspect-square rounded-[40px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-700 mb-10">
              <img src={talent.profile_image_url} className="w-full h-full object-cover" alt={talent.full_name} />
            </div>

            <div className="w-full space-y-4">
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('reg_label_province')}</p>
                 <p className="font-black italic text-lg dark:text-white uppercase">{talent.province}</p>
              </div>
              
              <a href={`https://wa.me/${talent.whatsapp_number?.replace(/\s+/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-6 bg-[#25D366] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-transform shadow-xl shadow-green-500/10">
                 {t('mkt_btn_whatsapp')}
              </a>

              {talent.cv_url && (
                <a href={talent.cv_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all">
                   {t('mkt_btn_cv')}
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 p-8 lg:p-16 space-y-12">
            <header>
              <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {talent.category}
                  </span>
                  {talent.is_certified && <span className="text-[9px] font-black text-amber-500 uppercase border border-amber-500 px-3 py-1 rounded-full italic">✓ {t('mkt_certified')}</span>}
              </div>
              <h2 className="text-6xl md:text-7xl font-black italic tracking-tighter dark:text-white uppercase leading-none">{talent.full_name}</h2>
              <p className="text-2xl font-bold text-slate-400 italic mt-2">{talent.role_title}</p>
            </header>

            <section className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-8 bg-blue-600 text-white rounded-[40px] shadow-xl shadow-blue-500/20">
                    <h4 className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest font-sans">{t('mkt_major_exp')}</h4>
                    <p className="text-xl font-bold italic leading-tight">"{talent.experience_summary || t('mkt_excellence')}"</p>
                 </div>
                 <div className="p-8 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 rounded-[40px]">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest font-sans">{t('reg_label_diploma')}</h4>
                    <p className="text-xl font-bold italic leading-tight dark:text-white">{talent.education_level || t('mkt_cert_comp')}</p>
                 </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase text-blue-600 mb-4 tracking-[0.2em]">{t('reg_label_bio')}</h4>
                <p className="text-xl dark:text-slate-300 font-medium italic leading-relaxed">{talent.bio}</p>
              </div>

              <div className="pt-6">
                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">{t('reg_label_skills')}</h4>
                <div className="flex flex-wrap gap-2">
                  {talent.skills?.map(s => (
                    <span key={s} className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black dark:text-white uppercase italic hover:border-blue-500 transition-colors">
                      #{s}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};