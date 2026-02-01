import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Briefcase, 
  Wallet, // Remplacé DollarSign par Wallet pour plus de neutralité
  Send, 
  MapPin, 
  LayoutGrid, 
  CheckCircle, 
  ArrowLeft,
  UploadCloud,
  Save 
} from 'lucide-react';
import { supabase } from '../src/supabaseClient';
import { DOMAINES_ACTIVITE } from './InscriptionView'; 

interface JobPostProps {
  setView: (view: any) => void;
  initialData?: any; 
}

export const JobPostView: React.FC<JobPostProps> = ({ setView, initialData }) => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    salary_range: initialData?.salary_range || '',
    category: initialData?.category || DOMAINES_ACTIVITE[0],
    location: initialData?.location || '',
  });
  
  const [tdrFile, setTdrFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem('fsti_user') || '{}');
      if (!storedUser.id) throw new Error("Session expirée");

      let tdrUrl = initialData?.tdr_url || null;

      if (tdrFile) {
        const fileExt = tdrFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${storedUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('job-tdrs')
          .upload(filePath, tdrFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('job-tdrs')
          .getPublicUrl(filePath);
        
        tdrUrl = publicUrl;
      }

      const jobPayload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        salary_range: formData.salary_range,
        tdr_url: tdrUrl,
        updated_at: new Date()
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('jobs')
          .update(jobPayload)
          .eq('id', initialData.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('jobs')
          .insert([{ ...jobPayload, recruiter_id: storedUser.id, status: 'open' }]);
        
        if (insertError) throw insertError;
      }

      setIsSubmitted(true);

    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Erreur lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 rounded-[60px] p-12 text-center shadow-2xl border-4 border-emerald-500/20 relative">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-4xl font-black italic tracking-tighter dark:text-white uppercase mb-4">
            Mission {isEditing ? "Mise à jour !" : "Propulsée !"}
          </h2>
          <button 
            onClick={() => setView('admin')}
            className="bg-slate-900 dark:bg-blue-600 text-white px-10 py-5 rounded-[25px] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-fadeIn">
      <button 
        onClick={() => setView('admin')} 
        className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Annuler
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 lg:p-12 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-10 border-b border-slate-100 dark:border-slate-800 pb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white">
            {isEditing ? <Save size={32} /> : <Briefcase size={32} />}
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter dark:text-white uppercase">
              {isEditing ? "Modifier l'offre" : t('job_post_title')}
            </h2>
            <p className="text-blue-600 text-xs font-black uppercase tracking-[0.3em]">Console Recruteur</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 italic">Intitulé du poste*</label>
            <input 
              type="text" required
              value={formData.title}
              placeholder="Ex: Expert en Énergie Solaire"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 dark:text-white font-bold"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 italic">Domaine d'activité*</label>
            <div className="relative">
              <LayoutGrid className="absolute left-5 top-4 text-slate-400" size={18} />
              <select 
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-14 pr-6 py-4 dark:text-white font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-blue-600 transition-all"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {DOMAINES_ACTIVITE.map((domaine) => (
                  <option key={domaine} value={domaine}>
                    {domaine}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 italic">Fourchette Salariale (BIF)</label>
            <div className="relative">
              <Wallet className="absolute left-5 top-4 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Ex: 800,000 BIF - 1,500,000 BIF"
                value={formData.salary_range}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-14 pr-6 py-4 dark:text-white font-bold"
                onChange={(e) => setFormData({...formData, salary_range: e.target.value})} 
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 italic">Localisation (Ville / Province)</label>
            <div className="relative">
              <MapPin className="absolute left-5 top-4 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Ex: Bujumbura, Burundi"
                value={formData.location}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-14 pr-6 py-4 dark:text-white font-bold"
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
              />
            </div>
          </div>

          {/* ... reste du formulaire (TDR, Description, Bouton) identique ... */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 italic">
              {isEditing ? "Remplacer le TDR (Optionnel)" : "Termes de Référence (TDR)*"}
            </label>
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-center">
              <input 
                type="file" 
                required={!isEditing}
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => setTdrFile(e.target.files ? e.target.files[0] : null)} 
              />
              <div className="flex flex-col items-center gap-3">
                <UploadCloud className={tdrFile ? 'text-emerald-500' : 'text-blue-600'} size={32} />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  {tdrFile ? tdrFile.name : (isEditing ? "Le fichier actuel sera conservé" : "Cliquez pour uploader le PDF")}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 italic">Description résumée du poste*</label>
            <textarea 
              rows={5} required 
              placeholder="Décrivez les objectifs principaux de la mission..."
              value={formData.description}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl px-6 py-4 dark:text-white font-medium transition-all"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="md:col-span-2 bg-blue-600 text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={20} />
                {isEditing ? "Enregistrer les modifications" : "Diffuser l'offre maintenant"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};