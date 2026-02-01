import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; 
import { supabase } from '../src/supabaseClient'; 
import { CheckCircle, ShieldCheck, Copy, Building2 } from 'lucide-react';

// Ajout de 'recruiter' au type Role
type Role = 'participant' | 'coach' | 'recruiter';

// Liste des domaines unifiée (utilisable pour l'inscription et les jobs)
export const DOMAINES_ACTIVITE = [
  "Informatique & Digital",
  "Artisanat & Textile",
  "Énergie & Solaire",
  "Mécanique & Électronique",
  "Agriculture & Élevage",
  "Santé & Médical",
  "Éducation & Formation",
  "Commerce & Vente",
  "Bâtiment & Construction",
  "Transport & Logistique",
  "Hôtellerie & Restauration",
  "Finance & Comptabilité",
  "Droit & Administration",
  "Art, Culture & Design",
  "Environnement & Développement Durable",
  "Autre"
];

export const InscriptionView: React.FC = () => {
  const { t } = useTranslation();
  const [activeRole, setActiveRole] = useState<Role>('participant');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedPass, setGeneratedPass] = useState('');

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [participantData, setParticipantData] = useState({
    full_name: '',
    email: '',
    whatsapp_number: '',
    birth_date: '',
    province: 'Buhumuza',
    category: 'Informatique & Digital',
    education_level: '',
    bio: '',
    role_title: '',
    experience_summary: '',
    skills: ''
  });

  const [coachData, setCoachData] = useState({
    full_name: '',
    email: '',
    specialty: '',
    experience_years: 0,
    whatsapp_number: '',
    motivation: ''
  });

  const [recruiterData, setRecruiterData] = useState({
    full_name: '',
    company_name: '',
    email: '',
    whatsapp_number: '',
    motivation: ''
  });

  const generateID = () => `FSTI-${Math.floor(1000 + Math.random() * 9000)}`;

  const uploadToSupabase = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('fsti_assets').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('fsti_assets').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const accessKey = generateID();

    try {
      if (activeRole === 'participant') {
        let profile_url = '';
        let cv_url = '';
        if (profileImage) profile_url = await uploadToSupabase(profileImage, 'profiles');
        if (cvFile) cv_url = await uploadToSupabase(cvFile, 'cvs');

        const { error } = await supabase.from('talents').insert([{
          ...participantData,
          skills: participantData.skills.split(',').map(s => s.trim()).filter(s => s !== ""),
          profile_image_url: profile_url,
          cv_url: cv_url,
          access_key: accessKey,
          status: 'En attente'
        }]);
        if (error) throw error;
      } else if (activeRole === 'coach') {
        const { error } = await supabase.from('coaches').insert([{
          ...coachData,
          access_key: accessKey
        }]);
        if (error) throw error;
      } 
      else if (activeRole === 'recruiter') {
        const { error } = await supabase.from('recruiters').insert([{
          ...recruiterData,
          access_key: accessKey,
          status: 'verified'
        }]);
        if (error) throw error;
      }

      await supabase.functions.invoke('send-welcome-email', {
        body: { 
          user_email: activeRole === 'participant' ? participantData.email : (activeRole === 'coach' ? coachData.email : recruiterData.email),
          admin_email: 'advaxen@gmail.com',
          full_name: activeRole === 'participant' ? participantData.full_name : (activeRole === 'coach' ? coachData.full_name : recruiterData.full_name),
          access_key: accessKey,
          role: activeRole
        }
      });
      
      setGeneratedPass(accessKey);
      setSubmitted(true);
    } catch (error: any) {
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 rounded-[60px] p-12 text-center shadow-2xl border border-blue-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-emerald-500"></div>
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-lg rotate-3">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-4xl font-black italic tracking-tighter dark:text-white uppercase mb-4">
            {t('reg_success_title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold italic mb-10">
            {t('reg_success_msg')}
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-700 mb-10">
            <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-4">
              {t('reg_access_code')}
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl font-black tracking-tighter dark:text-white">{generatedPass}</span>
              <button onClick={() => navigator.clipboard.writeText(generatedPass)} className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm hover:scale-110 transition-transform">
                <Copy size={20} className="text-slate-400" />
              </button>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-[10px]">
            {t('reg_finish')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn pb-24 px-4">
      <div className="text-center mb-16">
          <h2 className="text-5xl font-black italic tracking-tighter dark:text-white uppercase">
            {t('reg_title_elite')}
          </h2>
          <div className="mt-8 inline-flex bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
            <button onClick={() => setActiveRole('participant')} className={`px-8 py-3 rounded-full font-black text-[10px] uppercase transition-all ${activeRole === 'participant' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
              {t('reg_role_participant')}
            </button>
            <button onClick={() => setActiveRole('coach')} className={`px-8 py-3 rounded-full font-black text-[10px] uppercase transition-all ${activeRole === 'coach' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
              {t('reg_role_coach')}
            </button>
            <button onClick={() => setActiveRole('recruiter')} className={`px-8 py-3 rounded-full font-black text-[10px] uppercase transition-all ${activeRole === 'recruiter' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
              {t('reg_role_recruiter')}
            </button>
          </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[60px] p-8 md:p-16 shadow-2xl border border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {activeRole === 'participant' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="md:col-span-2 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <ShieldCheck className="text-blue-600" />
                <h3 className="text-2xl font-black italic dark:text-white uppercase">{t('reg_folder_talent')}</h3>
              </div>
              <InputField label={t('reg_label_name')} placeholder="Jean-Marie Nkurunziza" value={participantData.full_name} onChange={(v: string) => setParticipantData({...participantData, full_name: v})} />
              <InputField label={t('reg_label_email')} type="email" placeholder="nom@exemple.com" value={participantData.email} onChange={(v: string) => setParticipantData({...participantData, email: v})} />
              <InputField label={t('reg_label_whatsapp')} placeholder="+257 ...." type="tel" value={participantData.whatsapp_number} onChange={(v: string) => setParticipantData({...participantData, whatsapp_number: v})} />
              <InputField label={t('reg_label_birth')} type="date" value={participantData.birth_date} onChange={(v: string) => setParticipantData({...participantData, birth_date: v})} />
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">{t('reg_label_province')}</label>
                <select 
                  required
                  value={participantData.province} 
                  onChange={(e) => setParticipantData({...participantData, province: e.target.value})} 
                  className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 dark:text-white font-bold italic transition-all"
                >
                  <option value="Buhumuza">Buhumuza</option>
                  <option value="Bujumbura">Bujumbura</option>
                  <option value="Burunga">Burunga</option>
                  <option value="Butanyerera">Butanyerera</option>
                  <option value="Gitega">Gitega</option>
                </select>
              </div>
              
              <div className="md:col-span-2 border-b border-slate-100 dark:border-slate-800 pb-4 pt-8 mb-4 uppercase text-[10px] font-black text-blue-600 tracking-widest">
                {t('reg_label_docs')}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">{t('reg_label_photo')}</label>
                <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files ? e.target.files[0] : null)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold dark:text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">{t('reg_label_cv')}</label>
                <input type="file" accept=".pdf" onChange={(e) => setCvFile(e.target.files ? e.target.files[0] : null)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold dark:text-white" />
              </div>

              {/* SELECT DES DOMAINES MIS À JOUR */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">{t('reg_label_category')}</label>
                <select value={participantData.category} onChange={(e) => setParticipantData({...participantData, category: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 ring-blue-600 dark:text-white font-bold italic transition-all">
                    {DOMAINES_ACTIVITE.map((domaine) => (
                      <option key={domaine} value={domaine}>{domaine}</option>
                    ))}
                </select>
              </div>

              <InputField label={t('reg_label_job')} placeholder="ex: Développeur React" value={participantData.role_title} onChange={(v: string) => setParticipantData({...participantData, role_title: v})} />
              <InputField label={t('reg_label_skills')} placeholder="React, Soudure..." value={participantData.skills} onChange={(v: string) => setParticipantData({...participantData, skills: v})} />
              <InputField label={t('reg_label_diploma')} placeholder="Certification..." value={participantData.education_level} onChange={(v: string) => setParticipantData({...participantData, education_level: v})} />
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">{t('reg_label_bio')}</label>
                <textarea value={participantData.bio} onChange={(e) => setParticipantData({...participantData, bio: e.target.value})} rows={4} className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[30px] outline-none focus:ring-2 ring-blue-600 dark:text-white font-bold italic"></textarea>
              </div>
            </div>
          )}

          {activeRole === 'coach' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <ShieldCheck className="text-blue-600" />
                <h3 className="text-2xl font-black italic dark:text-white uppercase">{t('reg_folder_coach')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField label={t('reg_label_name')} placeholder="Prénom Nom" value={coachData.full_name} onChange={(v: string) => setCoachData({...coachData, full_name: v})} />
                <InputField label={t('reg_label_email')} type="email" placeholder="expert@exemple.com" value={coachData.email} onChange={(v: string) => setCoachData({...coachData, email: v})} />
                <InputField label={t('reg_label_job')} placeholder="Leadership..." value={coachData.specialty} onChange={(v: string) => setCoachData({...coachData, specialty: v})} />
                <InputField label={t('reg_label_exp')} type="number" value={coachData.experience_years} onChange={(v: any) => setCoachData({...coachData, experience_years: parseInt(v)})} />
                <InputField label={t('reg_label_whatsapp')} placeholder="+257 ...." value={coachData.whatsapp_number} onChange={(v: string) => setCoachData({...coachData, whatsapp_number: v})} />
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">{t('reg_label_motivation')}</label>
                    <textarea value={coachData.motivation} onChange={(e) => setCoachData({...coachData, motivation: e.target.value})} rows={3} className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[30px] outline-none focus:ring-2 ring-blue-600 dark:text-white font-bold italic"></textarea>
                </div>
              </div>
            </div>
          )}

          {activeRole === 'recruiter' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <Building2 className="text-blue-600" />
                <h3 className="text-2xl font-black italic dark:text-white uppercase">{t('reg_folder_recruiter')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField label={t('reg_label_name')} placeholder="Responsable" value={recruiterData.full_name} onChange={(v: string) => setRecruiterData({...recruiterData, full_name: v})} />
                <InputField label={t('reg_label_company')} placeholder="Nom de l'entreprise" value={recruiterData.company_name} onChange={(v: string) => setRecruiterData({...recruiterData, company_name: v})} />
                <InputField label={t('reg_label_email')} type="email" placeholder="contact@entreprise.com" value={recruiterData.email} onChange={(v: string) => setRecruiterData({...recruiterData, email: v})} />
                <InputField label={t('reg_label_whatsapp')} placeholder="+257 ...." value={recruiterData.whatsapp_number} onChange={(v: string) => setRecruiterData({...recruiterData, whatsapp_number: v})} />
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">{t('reg_label_motivation')}</label>
                    <textarea value={recruiterData.motivation} onChange={(e) => setRecruiterData({...recruiterData, motivation: e.target.value})} rows={3} placeholder="Pourquoi rejoindre le Hub FSTI ?" className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[30px] outline-none focus:ring-2 ring-blue-600 dark:text-white font-bold italic"></textarea>
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className={`w-full py-6 rounded-[30px] font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl ${loading ? 'bg-slate-400' : 'bg-blue-600 text-white hover:bg-black shadow-blue-500/20'}`}>
            {loading ? t('reg_btn_loading') : t('reg_btn_submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, placeholder, type = "text", value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">{label}</label>
    <input required type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 dark:text-white font-bold italic transition-all" />
  </div>
);