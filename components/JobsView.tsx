import React, { useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { Briefcase, MapPin, Search, FileText, ArrowUpRight, CheckCircle, MessageCircle, User } from 'lucide-react';

export const JobsView: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [userApplications, setUserApplications] = useState<string[]>([]);
  const [coach, setCoach] = useState<any>(null); // État pour stocker les infos du coach
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [lang, setLang] = useState<'fr' | 'en' | 'rn' | 'sw'>('fr');

  const t = {
    fr: {
      title: "Offres d' ", job_word: "Emploi", subtitle: "Trouvez votre prochain défi technologique au Burundi",
      search: "RECHERCHER UN POSTE OU UNE VILLE...", budget: "Budget/Salaire", deadline: "Date limite",
      apply: "Postuler", applied: "Déjà postulé", tdr: "Voir TDR", no_result: "Aucune offre ne correspond à votre recherche.",
      my_coach: "Mon Coach Accompagnateur", contact_whatsapp: "Contacter sur WhatsApp"
    },
    en: {
      title: "Job", job_word: "Opportunities", subtitle: "Find your next tech challenge in Burundi",
      search: "SEARCH FOR A POSITION OR CITY...", budget: "Budget/Salary", deadline: "Deadline",
      apply: "Apply Now", applied: "Applied", tdr: "View TDR", no_result: "No job offers match your search.",
      my_coach: "My Assigned Coach", contact_whatsapp: "Message on WhatsApp"
    },
    rn: {
      title: "Utunzi", job_word: "n'Akazi", subtitle: "Rondera akazi k'ubuhinga mu Burundi",
      search: "RONDA AKAZI CANKE IKIBANZA...", budget: "Inshirambere", deadline: "Igihe ntarengwa",
      apply: "Saba akazi", applied: "Warashizeko", tdr: "Ivyanditswe", no_result: "Nta kintu na kimwe rironseke ku vyo murondera.",
      my_coach: "Umuyobozi wanje", contact_whatsapp: "Vugana nawe kuri WhatsApp"
    },
    sw: {
      title: "Nafasi za", job_word: "Kazi", subtitle: "Tafuta changamoto yako ijayo ya kiteknolojia nchini Burundi",
      search: "TAFUTA KAZI AU MJI...", budget: "Bajeti/Mshahara", deadline: "Mwisho",
      apply: "Omba kazi", applied: "Umeshaomba", tdr: "Angalia TDR", no_result: "Hakuna nafasi ya kazi inayolingana na utafutaji wako.",
      my_coach: "Kocha Wangu", contact_whatsapp: "Tuma ujumbe WhatsApp"
    }
  }[lang];

  useEffect(() => {
    const storedUser = localStorage.getItem('fsti_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserApplications(parsedUser.id);
      fetchAssignedCoach(parsedUser.id); // Charger le coach
    }
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select(`*, recruiters (company_name)`)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setJobs(data);
      setFilteredJobs(data);
    }
    setLoading(false);
  };

  // Récupérer le coach via la table pivot coach_assignments
  const fetchAssignedCoach = async (talentId: string) => {
    const { data, error } = await supabase
      .from('coach_assignments')
      .select(`
        coaches (
          full_name,
          specialty,
          whatsapp_number,
          email
        )
      `)
      .eq('talent_id', talentId)
      .single();
    
    if (data && data.coaches) {
      setCoach(data.coaches);
    }
  };

  const fetchUserApplications = async (talentId: string) => {
    const { data } = await supabase
      .from('job_applications')
      .select('job_id')
      .eq('talent_id', talentId);
    
    if (data) {
      setUserApplications(data.map(app => app.job_id));
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user) {
      alert("Veuillez vous connecter pour postuler.");
      return;
    }
    if (userApplications.includes(jobId)) return;

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert([{ job_id: jobId, talent_id: user.id, status: 'pending' }]);

      if (error) throw error;
      setUserApplications([...userApplications, jobId]);
      alert("Votre candidature a été envoyée !");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  useEffect(() => {
    const filtered = jobs.filter((job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="animate-fadeIn space-y-12 pb-20">
      
      {/* LANGUAGE SWITCHER */}
      <div className="flex justify-center gap-2">
        {['fr', 'en', 'rn', 'sw'].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l as any)}
            className={`px-4 py-1 border-2 border-slate-900 font-black text-[10px] uppercase rounded-lg transition-all ${
              lang === l ? 'bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-slate-900'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* HEADER */}
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-black tracking-tighter uppercase dark:text-white leading-none">
          {t.title} <span className="text-indigo-600 italic">{t.job_word}</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">
          {t.subtitle}
        </p>
      </div>

      {/* SECTION COACH (S'affiche si un coach est assigné) */}
      {coach && (
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-amber-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-indigo-500 p-6 rounded-[30px] shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white border-2 border-slate-900">
              <User size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{t.my_coach}</p>
              <h4 className="text-xl font-black dark:text-white uppercase">{coach.full_name}</h4>
              <p className="text-xs font-bold text-slate-500 uppercase">{coach.specialty}</p>
            </div>
            {coach.whatsapp_number && (
              <a 
                href={`https://wa.me/${coach.whatsapp_number.replace(/\s+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
              >
                <MessageCircle size={18} /> {t.contact_whatsapp}
              </a>
            )}
          </div>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="relative group">
          <input 
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-8 py-5 bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-indigo-600 rounded-[25px] font-black uppercase text-xs tracking-widest shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none dark:text-white"
          />
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-900 dark:text-indigo-600" size={20} />
        </div>
      </div>

      {/* JOBS LIST */}
      <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto px-4">
        {filteredJobs.length > 0 ? filteredJobs.map((job) => {
          const hasApplied = userApplications.includes(job.id);
          return (
            <div 
              key={job.id} 
              className="group relative bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-slate-800 p-6 md:p-8 rounded-[35px] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-indigo-200">{job.category}</span>
                    <span className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase"><MapPin size={12} /> {job.location}</span>
                  </div>
                  <h3 className="text-2xl font-black dark:text-white uppercase group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-tight">{job.recruiters?.company_name || "Entreprise Partenaire"}</p>
                </div>

                <div className="grid grid-cols-2 md:flex items-center gap-4">
                  <div className="space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase">{t.budget}</p>
                    <p className="text-xs font-black dark:text-white">{job.budget || job.salary_range}</p>
                  </div>
                  <div className="space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase">{t.deadline}</p>
                    <p className="text-xs font-black dark:text-white">{job.deadline ? new Date(job.deadline).toLocaleDateString() : '--/--/----'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {job.tdr_url && (
                    <a href={job.tdr_url} target="_blank" className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-900 dark:border-slate-700 hover:bg-white transition-colors" title={t.tdr}>
                      <FileText size={20} className="text-slate-900 dark:text-white" />
                    </a>
                  )}
                  <button 
                    onClick={() => handleApply(job.id)}
                    disabled={hasApplied}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:scale-95 ${
                      hasApplied ? 'bg-emerald-500 text-white cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {hasApplied ? <><CheckCircle size={16} /> {t.applied}</> : <>{t.apply} <ArrowUpRight size={16} /></>}
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-20 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px]">
            <p className="text-slate-400 font-black uppercase italic">{t.no_result}</p>
          </div>
        )}
      </div>
    </div>
  );
};