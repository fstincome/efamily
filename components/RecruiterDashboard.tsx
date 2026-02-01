import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../src/supabaseClient';
import { 
  LayoutDashboard, PlusCircle, Users, Briefcase, TrendingUp, Clock, 
  CheckCircle2, ExternalLink, Building2, LogOut, X, Download, MapPin, 
  Wallet, FileCheck, Trash2, Edit3, Power, UserCircle, Mail, Calendar,
  MessageCircle, Award, BookOpen, Star, Phone, Info
} from 'lucide-react';

interface DashboardProps {
  setView: (view: any, data?: any) => void;
}

export const RecruiterDashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState({ active: 0, total_apps: 0, views: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedTalent, setSelectedTalent] = useState<any>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const storedUser = JSON.parse(localStorage.getItem('fsti_user') || '{}');
      if (storedUser.role !== 'recruiter') {
        localStorage.removeItem('fsti_user');
        window.location.href = '/login';
        return;
      }
      const { data: recruiterData } = await supabase.from('recruiters').select('*').eq('id', storedUser.id).single();
      if (!recruiterData) { window.location.href = '/login'; return; }
      setUser({ ...recruiterData, role: 'recruiter' });
      fetchDashboardData(recruiterData.id);
    };
    checkAccess();
  }, []);

  const fetchDashboardData = async (recruiterId: string) => {
    try {
      const { data: jobsData } = await supabase.from('jobs').select('*').eq('recruiter_id', recruiterId).order('created_at', { ascending: false });
      const jobList = jobsData || [];
      setJobs(jobList);
      const jobIds = jobList.map(j => j.id);
      
      if (jobIds.length > 0) {
        const { data: appsData } = await supabase
          .from('job_applications')
          .select(`*, job:jobs(title, location, category), talent:talents(*)`)
          .in('job_id', jobIds)
          .order('applied_at', { ascending: false });

        setApplications(appsData || []);
        setStats({ active: jobList.filter(j => j.status === 'open').length, total_apps: appsData?.length || 0, views: 0 });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleUpdateAppStatus = async (app: any, newStatus: string) => {
    try {
      const { error } = await supabase.from('job_applications').update({ status: newStatus }).eq('id', app.id);
      if (error) throw error;

      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: newStatus } : a));

      if (newStatus === 'accepted' && app.talent?.whatsapp_number) {
        const msg = `Bonjour ${app.talent.full_name}, nous avons accepté votre candidature pour le poste de ${app.job?.title} chez ${user.company_name}.`;
        window.open(`https://wa.me/${app.talent.whatsapp_number.replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
      }
      setSelectedTalent(null);
    } catch (e) { alert("Erreur mise à jour"); }
  };

  const handleToggleStatus = async (job: any) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    await supabase.from('jobs').update({ status: newStatus }).eq('id', job.id);
    setJobs(jobs.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
    if (selectedJob?.id === job.id) setSelectedJob({ ...selectedJob, status: newStatus });
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm("Supprimer ?")) return;
    await supabase.from('jobs').delete().eq('id', id);
    setJobs(jobs.filter(j => j.id !== id));
    setSelectedJob(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-black"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-8 animate-fadeIn">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter dark:text-white uppercase">Boss <span className="text-blue-600">Console</span></h1>
          <p className="text-slate-500 font-bold italic flex items-center gap-2 mt-2"><Building2 size={16} /> {user?.company_name} — {user?.full_name}</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setView('post-job')} className="flex items-center gap-3 bg-blue-600 text-white px-8 py-5 rounded-[30px] font-black uppercase text-[10px] hover:bg-black transition-all shadow-xl shadow-blue-500/20"><PlusCircle size={18} /> {t('dashboard.post_job')}</button>
          <button onClick={() => { localStorage.removeItem('fsti_user'); window.location.href = '/login'; }} className="p-5 bg-white dark:bg-slate-900 text-red-500 rounded-[25px] hover:bg-red-500 hover:text-white transition-all shadow-sm"><LogOut size={20} /></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Briefcase />} label="Jobs Actifs" value={stats.active} color="blue" />
          <StatCard icon={<Users />} label="Candidats" value={stats.total_apps} color="emerald" />
          <StatCard icon={<TrendingUp />} label="Vues" value={stats.views} color="purple" />
        </div>

        {/* LISTE DES POSTES */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black italic uppercase dark:text-white px-4 flex items-center gap-2"><LayoutDashboard size={20} className="text-blue-600" /> Vos Offres</h3>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className={`bg-white dark:bg-slate-900 p-6 rounded-[40px] border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:scale-[1.01] transition-all shadow-sm group ${job.status === 'closed' ? 'opacity-60 grayscale-[0.2]' : ''}`}>
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${job.status === 'open' ? 'bg-slate-100 text-emerald-500' : 'bg-slate-200 text-slate-400'}`}>{job.status === 'open' ? <CheckCircle2 /> : <Power size={20} />}</div>
                  <div>
                    <h4 className="font-black italic dark:text-white uppercase tracking-tight">{job.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12} /> {applications.filter(a => a.job_id === job.id).length} Candidats</p>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(job)} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><ExternalLink size={18} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR FLOW */}
        <div className="space-y-6">
          <h3 className="text-xl font-black italic uppercase dark:text-white px-4">Talent Flow</h3>
          <div className="space-y-4">
            {applications.slice(0, 6).map((app) => (
              <div key={app.id} className="bg-white dark:bg-slate-900 rounded-[35px] p-5 border border-slate-100 dark:border-slate-800 shadow-sm animate-slideUp">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs uppercase cursor-pointer" onClick={() => setSelectedTalent(app)}>
                    {app.talent?.profile_image_url ? <img src={app.talent.profile_image_url} className="w-full h-full rounded-full object-cover" /> : app.talent?.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black dark:text-white uppercase italic">{app.talent?.full_name}</p>
                    <p className="text-[9px] text-blue-600 font-bold uppercase tracking-tighter">{app.job?.title}</p>
                  </div>
                  <button onClick={() => setSelectedTalent(app)} className="p-2 text-slate-400 hover:text-blue-600"><Info size={16} /></button>
                </div>
                <div className="flex gap-2">
                  {app.status === 'pending' ? (
                    <>
                      <button onClick={() => handleUpdateAppStatus(app, 'accepted')} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase hover:bg-black transition-all">Accepter</button>
                      <button onClick={() => handleUpdateAppStatus(app, 'rejected')} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Refuser</button>
                    </>
                  ) : (
                    <div className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase text-center ${app.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>Statut : {app.status}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODALE DETAILS TALENT (FULL DATA) */}
      {selectedTalent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[50px] overflow-hidden shadow-2xl relative border border-white/10 animate-slideUp max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setSelectedTalent(null)} className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-red-500 transition-all z-10"><X size={20} /></button>
            
            <div className="p-10 bg-blue-600 text-white flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-[30px] flex items-center justify-center text-4xl font-black border-4 border-white/30 overflow-hidden">
                {selectedTalent.talent?.profile_image_url ? <img src={selectedTalent.talent.profile_image_url} className="w-full h-full object-cover" /> : selectedTalent.talent?.full_name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">{selectedTalent.talent?.full_name}</h2>
                <p className="text-blue-100 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 mt-1">
                  <Award size={14} /> {selectedTalent.talent?.role_title || selectedTalent.talent?.category}
                </p>
                <div className="flex gap-3 mt-3">
                  {selectedTalent.talent?.is_certified && <span className="bg-emerald-400 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase">Certifié</span>}
                  <span className="bg-white/20 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase italic">{selectedTalent.talent?.status}</span>
                </div>
              </div>
            </div>

            <div className="p-10 space-y-8">
              {/* CONTACTS RAPIDES */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">WhatsApp</p>
                  <p className="text-xs font-bold dark:text-white flex items-center gap-2"><Phone size={12} /> {selectedTalent.talent?.whatsapp_number || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Localisation</p>
                  <p className="text-xs font-bold dark:text-white flex items-center gap-2"><MapPin size={12} /> {selectedTalent.talent?.province || 'Burundi'}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Niveau</p>
                  <p className="text-xs font-bold dark:text-white flex items-center gap-2"><BookOpen size={12} /> {selectedTalent.talent?.education_level || 'N/A'}</p>
                </div>
              </div>

              {/* BIO & RÉSUMÉ */}
              <div className="space-y-4">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2 mb-2"><Info size={14} /> Biographie</h5>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{selectedTalent.talent?.bio || "Aucune biographie disponible."}</p>
                </div>
                <div>
                  <h5 className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2 mb-2"><Briefcase size={14} /> Expériences Professionnelles</h5>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic">{selectedTalent.talent?.experience_summary || "Résumé non fourni."}</p>
                </div>
              </div>

              {/* COMPETENCES */}
              <div>
                <h5 className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2 mb-3"><Star size={14} /> Compétences & Outils</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedTalent.talent?.skills?.map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg uppercase">{skill}</span>
                  ))}
                </div>
              </div>

              {/* CV DOWNLOAD */}
              {selectedTalent.talent?.cv_url && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-emerald-500 rounded-xl text-emerald-500 dark:text-white shadow-sm"><FileCheck size={20} /></div>
                    <div><p className="text-xs font-black dark:text-white uppercase">Curriculum Vitae (PDF)</p><p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest italic">Consulter le parcours complet</p></div>
                  </div>
                  <a href={selectedTalent.talent.cv_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-lg"><Download size={14} /> Télécharger</a>
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => handleUpdateAppStatus(selectedTalent, 'accepted')} className="flex-1 py-5 bg-blue-600 hover:bg-black text-white rounded-[25px] font-black uppercase text-[10px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20">
                  <MessageCircle size={18} /> Accepter & Contact WhatsApp
                </button>
                <button onClick={() => handleUpdateAppStatus(selectedTalent, 'rejected')} className="px-8 py-5 bg-red-100 text-red-500 rounded-[25px] font-black uppercase text-[10px] hover:bg-red-500 hover:text-white transition-all">Refuser</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DETAILS JOB */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[50px] overflow-hidden shadow-2xl border border-white/10 relative animate-slideUp">
            <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:rotate-90 transition-all text-slate-500 hover:text-red-500 z-10"><X size={20} /></button>
            <div className="p-10 pb-0">
                <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">{selectedJob.category}</span>
                <h2 className="text-4xl font-black italic tracking-tighter dark:text-white uppercase mt-4 mb-2">{selectedJob.title}</h2>
                <div className="flex flex-wrap gap-4 text-slate-500 font-bold text-xs uppercase tracking-tighter italic">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {selectedJob.location || 'Remote'}</span>
                    <span className="flex items-center gap-1"><Wallet size={14} /> {selectedJob.salary_range ? `${selectedJob.salary_range} (BIF)` : "À négocier"}</span>
                </div>
            </div>
            <div className="p-10 pt-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
                <h5 className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-4 italic">Candidats pour ce poste</h5>
                <div className="space-y-3 mb-8">
                  {applications.filter(a => a.job_id === selectedJob.id).map(app => (
                      <div key={app.id} onClick={() => { setSelectedTalent(app); setSelectedJob(null); }} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-blue-500 transition-all">
                        <div className="flex items-center gap-3">
                          <UserCircle size={24} className="text-slate-400" />
                          <div><p className="text-[10px] font-black dark:text-white uppercase">{app.talent?.full_name}</p><p className="text-[8px] text-slate-400 font-bold">{app.talent?.email}</p></div>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase ${app.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{app.status}</span>
                      </div>
                  ))}
                </div>
                <h5 className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-4 italic">Description du poste</h5>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">{selectedJob.description}</p>
            </div>
            <div className="p-10 pt-4 border-t border-slate-50 dark:border-slate-800 flex flex-wrap gap-4">
                <button onClick={() => setView('post-job', selectedJob)} className="flex-1 py-5 bg-blue-600 text-white rounded-[25px] font-black uppercase text-[10px] flex items-center justify-center gap-2"><Edit3 size={16} /> Modifier</button>
                <button onClick={() => handleToggleStatus(selectedJob)} className={`px-6 py-5 rounded-[25px] font-black uppercase text-[10px] transition-all flex items-center gap-2 ${selectedJob.status === 'open' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}><Power size={18} /> {selectedJob.status === 'open' ? 'Clôturer' : 'Relancer'}</button>
                <button onClick={() => handleDeleteJob(selectedJob.id)} className="px-6 py-5 bg-red-100 text-red-500 rounded-[25px]"><Trash2 size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => {
  const colorVariants: any = { blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20", emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20", purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" };
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
      <div className={`text-2xl mb-4 w-12 h-12 rounded-2xl flex items-center justify-center ${colorVariants[color]}`}>{icon}</div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black italic tracking-tighter dark:text-white">{value}</p>
    </div>
  );
};