import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../src/supabaseClient';
import { 
  User, MapPin, ShieldCheck, Users, 
  ChevronRight, Star, QrCode, MessageCircle, Mail, Phone,
  Calendar, Clock, X, Check, Trash2, Briefcase, Award, BookOpen, Info, Edit3
} from 'lucide-react';

// ==========================================
// COMPOSANT : MODAL DE MODIFICATION PROFIL
// ==========================================
const EditProfileModal = ({ isOpen, onClose, user, onUpdated }: any) => {
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    experience_summary: user?.experience_summary || '',
    skills: user?.skills ? user.skills.join(', ') : '',
    education_level: user?.education_level || ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s !== "");

    const { error } = await supabase
      .from('talents') 
      .update({
        bio: formData.bio,
        experience_summary: formData.experience_summary,
        skills: skillsArray,
        education_level: formData.education_level
      })
      .eq('id', user.id);

    if (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
    } else {
      const updatedUser = { ...user, ...formData, skills: skillsArray };
      localStorage.setItem('fsti_user', JSON.stringify(updatedUser));
      onUpdated(updatedUser);
      onClose();
      alert("Profil mis à jour !");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white">Modifier mon Profil</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4 text-left">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Ma Biographie</label>
            <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white mt-1" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Résumé d'expérience</label>
            <textarea value={formData.experience_summary} onChange={(e) => setFormData({...formData, experience_summary: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white mt-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Compétences (virgules)</label>
              <input value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white mt-1" placeholder="React, Figma..." />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Niveau d'études</label>
              <input value={formData.education_level} onChange={(e) => setFormData({...formData, education_level: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white mt-1" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg">
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// COMPOSANT : MODAL DE RENDEZ-VOUS
// ==========================================
const AppointmentModal = ({ isOpen, onClose, coachId, talentId, onCreated }: any) => {
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCoachId = typeof coachId === 'object' ? coachId.id : coachId;
    const finalTalentId = typeof talentId === 'object' ? talentId.id : talentId;

    if (!finalCoachId || !finalTalentId) {
      alert("Erreur d'identification : l'un des participants est introuvable.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('appointments').insert([
      { coach_id: finalCoachId, talent_id: finalTalentId, title: title, meeting_date: date, status: 'pending' }
    ]);

    setSubmitting(false);
    if (error) {
      alert("Erreur: " + error.message);
    } else {
      onCreated();
      onClose();
      alert("Demande de rendez-vous envoyée !");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300 text-left">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white">Fixer un RDV</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Objet de la session</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white mt-1" placeholder="Ex: Revue de projet" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Date et Heure</label>
            <input required type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white mt-1" />
          </div>
          <button disabled={submitting} type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg">
            {submitting ? 'Envoi...' : 'Confirmer la demande'}
          </button>
        </form>
      </div>
    </div>
  );
};

const StatBox = ({ icon, label, value }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[35px] border border-slate-100 dark:border-slate-800 shadow-lg flex items-center gap-6">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">{icon}</div>
    <div className="text-left">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black dark:text-white">{value}</p>
    </div>
  </div>
);

const TalentRow = ({ name, specialty, status, image }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group">
    <div className="flex items-center gap-4 text-left">
      {image ? (
        <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-xs">{name ? name[0] : '?'}</div>
      )}
      <div>
        <h4 className="text-sm font-black dark:text-white">{name || "Utilisateur"}</h4>
        <p className="text-[9px] font-bold text-slate-500 uppercase">{specialty}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-[8px] font-black px-3 py-1 bg-white dark:bg-slate-900 rounded-full shadow-sm dark:text-slate-300 uppercase tracking-tighter">{status}</span>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
    </div>
  </div>
);

// ==========================================
// COMPOSANT PRINCIPAL : DASHBOARD
// ==========================================
export const UserDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('fsti_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchAllData(parsedUser);
      } catch (e) { console.error("Erreur parsing user", e); }
    }
  }, []);

  const fetchAllData = async (currentUser: any) => {
    setLoading(true);
    await fetchCollaborations(currentUser);
    await fetchAppointments(currentUser);
    if (currentUser.role !== 'coach') {
        await fetchApplications(currentUser);
    }
    setLoading(false);
  };

  const fetchApplications = async (currentUser: any) => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`id, applied_at, status, job:job_id (id, title, category)`)
        .eq('talent_id', currentUser.id); 
      if (error) throw error;
      setApplications(data || []);
    } catch (err) { console.error("Erreur candidatures:", err); }
  };

  const fetchCollaborations = async (currentUser: any) => {
    try {
      const { data, error } = await supabase
        .from('coach_assignments')
        .select(`
          id,
          talent:talent_id (id, full_name, role_title, category, profile_image_url, email, province, whatsapp_number),
          coach:coach_id (id, full_name, specialty, whatsapp_number, email, experience_years)
        `)
        .eq(currentUser.role === 'coach' ? 'coach_id' : 'talent_id', currentUser.id);
      if (error) throw error;
      setCollaborations(data || []);
    } catch (err) { console.error("Erreur collaborations:", err); }
  };

  const fetchAppointments = async (currentUser: any) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`*, talent:talent_id(full_name, whatsapp_number), coach:coach_id(full_name, whatsapp_number)`)
        .eq(currentUser.role === 'coach' ? 'coach_id' : 'talent_id', currentUser.id)
        .order('meeting_date', { ascending: true });
      if (error) throw error;
      setAppointments(data || []);
    } catch (err) { console.error("Erreur appointments:", err); }
  };

  const handleApproveApt = async (apt: any) => {
    try {
      const { error } = await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', apt.id);
      if (error) throw error;
      setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, status: 'confirmed' } : a));
      alert("Session confirmée !");
    } catch (err: any) { alert("Erreur : " + err.message); }
  };

  const handleDeleteApt = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (!error) setAppointments(prev => prev.filter(apt => apt.id !== id));
    }
  };

  const getWhatsAppLink = (apt: any) => {
    const isCoach = user.role === 'coach';
    const contact = isCoach ? apt.talent : apt.coach;
    const rawNumber = contact?.whatsapp_number || "";
    const cleanNumber = rawNumber.replace(/\s+/g, '').replace('+', '');
    const message = `Bonjour ${contact?.full_name}, session FSTI prévue : "${apt.title}".`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('fsti_user');
    window.location.href = '/';
  };

  if (!user) return <div className="p-10 text-center font-black uppercase tracking-widest">Chargement...</div>;
  const isCoach = user.role === 'coach';
  const assignedCoach = !isCoach && collaborations.length > 0 ? collaborations[0].coach : null;

  return (
    <div className="animate-fadeIn space-y-8 pb-24 max-w-7xl mx-auto px-4 mt-8">
      
      {/* HEADER CARD */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="w-32 h-32 rounded-[35px] bg-gradient-to-br from-slate-800 to-black overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
            {user.profile_image_url ? <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" /> : (
               <div className="w-full h-full flex items-center justify-center">
                 {isCoach ? <ShieldCheck size={60} className="text-blue-500" /> : <User size={60} className="text-white" />}
               </div>
            )}
          </div>
          
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase italic mb-2">{user.full_name}</h1>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-4">
              <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isCoach ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}`}>
                {isCoach ? "Expert Coach" : "Talent Certifié"}
              </span>
              <span className="px-4 py-1 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} /> {user.province || 'HUB NATIONAL'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4 text-left justify-center lg:justify-start">
               <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold"><Mail size={14} className="text-blue-500" /> {user.email}</div>
               <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold"><Phone size={14} className="text-blue-500" /> {user.whatsapp_number || "N/A"}</div>
            </div>
            
            {!isCoach && (
              <button onClick={() => setIsEditModalOpen(true)} className="mt-4 flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline mx-auto lg:mx-0">
                <Edit3 size={14} /> Modifier mon profil complet
              </button>
            )}
          </div>

          <button onClick={handleLogout} className="px-8 py-5 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg">Déconnexion</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatBox icon={<Users className="text-blue-500" />} label={isCoach ? "Talents supervisés" : "Experts FSTI"} value={collaborations.length} />
            <StatBox icon={<Calendar className="text-purple-500" />} label="Sessions prévues" value={appointments.length} />
          </div>

          {/* AGENDA */}
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl text-left">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-3"><Clock className="text-blue-500" /> Agenda</h3>
              {!isCoach && collaborations.length > 0 && <button onClick={() => setIsAptModalOpen(true)} className="px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase">Fixer un RDV</button>}
            </div>
            <div className="space-y-4">
              {appointments.length > 0 ? appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[25px]">
                  <div className="flex gap-4 items-center">
                    <div className="text-center bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm min-w-[70px]">
                      <p className="text-[8px] font-black text-blue-500 uppercase">{apt.meeting_date ? new Date(apt.meeting_date).toLocaleDateString('fr-FR', { weekday: 'short' }) : '--'}</p>
                      <p className="text-lg font-black dark:text-white">{apt.meeting_date ? new Date(apt.meeting_date).getDate() : '?'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black dark:text-white uppercase">{apt.title}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{isCoach ? `Avec: ${apt.talent?.full_name}` : `Coach: ${apt.coach?.full_name}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase ${apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>{apt.status}</span>
                    <div className="flex gap-2">
                        {apt.status === 'confirmed' ? (
                           <a href={getWhatsAppLink(apt)} target="_blank" className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20"><MessageCircle size={18} /></a>
                        ) : (
                          <>
                            {isCoach && <button onClick={() => handleApproveApt(apt)} className="p-2 bg-emerald-500 text-white rounded-xl"><Check size={16} /></button>}
                            <button onClick={() => handleDeleteApt(apt.id)} className="p-2 bg-red-50 text-red-500 rounded-xl"><Trash2 size={16} /></button>
                          </>
                        )}
                    </div>
                  </div>
                </div>
              )) : <p className="text-center py-4 text-[10px] font-black text-slate-400 uppercase italic">Aucune session prévue</p>}
            </div>
          </div>

          {/* CANDIDATURES */}
          {!isCoach && (
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl text-left">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-8 dark:text-white flex items-center gap-3"><Briefcase className="text-emerald-500" /> Mes Candidatures</h3>
              <div className="space-y-4">
                {applications.length > 0 ? applications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[25px]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-500"><Briefcase size={20} /></div>
                      <div>
                        <p className="text-sm font-black dark:text-white uppercase">{app.job?.title || "Poste"}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">{app.job?.category} • {new Date(app.applied_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-4 py-2 rounded-full uppercase ${app.status === 'accepted' || app.status === 'confirmed' ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                      {app.status}
                    </span>
                  </div>
                )) : <p className="text-center py-4 text-[10px] font-black text-slate-400 uppercase italic">Aucune candidature</p>}
              </div>
            </div>
          )}

          {isCoach && (
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl text-left">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 dark:text-white">Liste des Mentorés</h3>
              <div className="space-y-4">
                {collaborations.length > 0 ? collaborations.map((collab) => (
                  <TalentRow key={collab.id} name={collab.talent?.full_name} specialty={collab.talent?.role_title || collab.talent?.category} image={collab.talent?.profile_image_url} status="Suivi Actif" />
                )) : <p className="text-center py-4 text-[10px] font-black text-slate-400 uppercase italic">Aucun talent assigné</p>}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6 text-left">
          {!isCoach && (
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
               <h3 className="text-xl font-black uppercase tracking-tighter mb-6 dark:text-white flex items-center gap-3"><Info className="text-blue-500" /> Détails Profil</h3>
               <div className="space-y-6">
                 <div>
                   <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-1">Ma Bio</label>
                   <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic">{user.bio || "Non renseigné"}</p>
                 </div>
                 <div>
                   <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-2">Compétences</label>
                   <div className="flex flex-wrap gap-2">
                     {user.skills?.map((s: string, i: number) => (
                       <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-bold rounded-lg uppercase">{s}</span>
                     )) || <span className="text-[9px] text-slate-400 uppercase font-bold">Aucune</span>}
                   </div>
                 </div>
                 <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-3"><BookOpen size={14} className="text-blue-500" /> <p className="text-[10px] font-black dark:text-white uppercase">{user.education_level || "N/A"}</p></div>
                    <div className="flex items-center gap-3"><Award size={14} className="text-emerald-500" /> <p className="text-[10px] font-black dark:text-white uppercase">{user.category || "FSTI Talent"}</p></div>
                 </div>
               </div>
            </div>
          )}

          {/* BLOC MON COACH (Visible pour les Talents) */}
          {assignedCoach && (
            <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
               <h3 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                 <ShieldCheck size={20} /> Mon Coach
               </h3>
               <div className="space-y-4">
                  <div>
                    <p className="text-xl font-black italic uppercase leading-none">{assignedCoach.full_name}</p>
                    <p className="text-[10px] font-bold text-indigo-200 uppercase mt-1">{assignedCoach.specialty}</p>
                  </div>
                  <div className="space-y-2 pt-2">
                     <div className="flex items-center gap-3 text-[10px] font-bold uppercase">
                       <Award size={14} className="text-indigo-300" /> {assignedCoach.experience_years} ans d'expertise
                     </div>
                     <div className="flex items-center gap-3 text-[10px] font-bold uppercase">
                       <Mail size={14} className="text-indigo-300" /> {assignedCoach.email}
                     </div>
                  </div>
                  <a 
                    href={`https://wa.me/${assignedCoach.whatsapp_number?.replace(/\s+/g, '')}?text=${encodeURIComponent(`Bonjour Coach ${assignedCoach.full_name}, c'est ${user.full_name}. J'ai besoin de conseils.`)}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-white text-indigo-600 rounded-2xl font-black uppercase text-[10px] shadow-lg hover:bg-indigo-50 transition-colors"
                  >
                    <MessageCircle size={16} /> Contacter sur WhatsApp
                  </a>
               </div>
            </div>
          )}

          <div className="bg-slate-900 rounded-[40px] p-8 text-center text-white flex flex-col justify-center items-center shadow-2xl relative overflow-hidden group">
            <QrCode size={140} className="mb-6 bg-white p-3 rounded-3xl text-black shadow-2xl" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">ID Talent Digital</p>
            <p className="text-2xl font-black italic tracking-tighter text-blue-500">{user.id.substring(0,8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <AppointmentModal isOpen={isAptModalOpen} onClose={() => setIsAptModalOpen(false)} coachId={isCoach ? user.id : assignedCoach?.id} talentId={isCoach ? (collaborations[0]?.talent?.id) : user.id} onCreated={() => fetchAppointments(user)} />
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onUpdated={(updated: any) => setUser(updated)} />
    </div>
  );
};