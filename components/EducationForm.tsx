import React, { useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { 
  X, GraduationCap, UploadCloud, Loader2, CheckCircle, 
  FileText, Calendar, Plus, Trash2, Award, Search, Save, Users, Filter 
} from 'lucide-react';

export const EducationForm = ({ familyId }: { familyId: string }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // États de recherche et filtrage
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    member_id: '',
    institution_name: '',
    degree_name: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    status: 'En cours',
    document_url: '',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: mems } = await supabase.from('family_members').select('*').eq('family_id', familyId);
    if (mems) setMembers(mems);

    const { data: recs } = await supabase
      .from('education_records')
      .select('*, family_members!inner(*)')
      .eq('family_members.family_id', familyId)
      .order('created_at', { ascending: false });
    
    if (recs) setRecords(recs);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [familyId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const filePath = `${familyId}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('documents').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, document_url: publicUrl }));
    } catch (err: any) {
      alert("Erreur upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('education_records').insert([formData]);
    if (!error) {
      setShowSuccess(true);
      setShowForm(false);
      setFormData({ member_id: '', institution_name: '', degree_name: '', field_of_study: '', start_date: '', end_date: '', status: 'En cours', document_url: '', description: '' });
      fetchData();
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  // LOGIQUE DE FILTRAGE COMBINÉE (Membre + Recherche)
  const filteredRecords = records.filter(rec => {
    const matchesMember = selectedMemberId === 'all' || rec.member_id === selectedMemberId;
    const matchesSearch = 
      rec.degree_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.institution_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.family_members?.first_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMember && matchesSearch;
  });

  return (
    <div className="w-full space-y-6 pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-100">
            <GraduationCap size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 leading-none">Diplômes</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestion du patrimoine académique</p>
          </div>
        </div>

        <button 
          onClick={() => setShowForm(true)}
          className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[22px] font-black uppercase text-xs tracking-[0.15em] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> Ajouter un document
        </button>
      </div>

      {/* --- BARRE DE RECHERCHE ET FILTRES --- */}
      <div className="bg-white p-4 rounded-[30px] shadow-sm border border-slate-50 space-y-4">
        {/* Barre de recherche */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Rechercher un diplôme, une école ou un membre..."
            className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[20px] text-sm font-bold border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filtres Membres */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-2 text-slate-400 pr-2 border-r border-slate-100 mr-2">
            <Filter size={16} />
            <span className="text-[10px] font-black uppercase">Filtrer :</span>
          </div>
          <button 
            onClick={() => setSelectedMemberId('all')}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${selectedMemberId === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            Tous ({records.length})
          </button>
          {members.map(member => (
            <button 
              key={member.id}
              onClick={() => setSelectedMemberId(member.id)}
              className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${selectedMemberId === member.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-500 hover:bg-indigo-50'}`}
            >
              {member.first_name}
            </button>
          ))}
        </div>
      </div>

      {/* --- NOTIFICATION SUCCÈS --- */}
      {showSuccess && (
        <div className="bg-emerald-500 text-white p-5 rounded-[25px] flex items-center justify-center gap-3 animate-bounce shadow-xl shadow-emerald-100 mx-auto max-w-md">
          <CheckCircle size={24} /> <span className="font-black uppercase text-xs tracking-widest">Enregistrement Réussi !</span>
        </div>
      )}

      {/* --- FORMULAIRE MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[45px] shadow-2xl border-t-[12px] border-indigo-600 overflow-hidden transform animate-in zoom-in-95">
            <div className="p-10 relative">
              <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={24} />
              </button>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-8">Nouveau Parcours</h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">À qui appartient ce diplôme ?</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 font-bold outline-none appearance-none cursor-pointer"
                    value={formData.member_id}
                    onChange={e => setFormData({...formData, member_id: e.target.value})}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Nom de l'école" className="w-full bg-slate-50 rounded-2xl p-5 font-bold border-2 border-transparent focus:border-indigo-500 outline-none" onChange={e => setFormData({...formData, institution_name: e.target.value})} required />
                  <input placeholder="Nom du diplôme" className="w-full bg-slate-50 rounded-2xl p-5 font-bold border-2 border-transparent focus:border-indigo-500 outline-none" onChange={e => setFormData({...formData, degree_name: e.target.value})} required />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Début</label>
                    <input type="date" className="w-full bg-slate-50 rounded-2xl p-4 font-bold text-xs outline-none" onChange={e => setFormData({...formData, start_date: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Fin</label>
                    <input type="date" className="w-full bg-slate-50 rounded-2xl p-4 font-bold text-xs outline-none" onChange={e => setFormData({...formData, end_date: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Statut</label>
                    <select className="w-full bg-slate-50 rounded-2xl p-4 font-bold text-xs outline-none" onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="En cours">En cours</option>
                      <option value="Terminé">Terminé</option>
                    </select>
                  </div>
                </div>

                <div className={`border-4 border-dashed rounded-[35px] p-8 transition-all flex flex-col items-center justify-center gap-3 relative ${formData.document_url ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                   {uploading ? <Loader2 className="animate-spin text-indigo-600" size={32} /> : <UploadCloud className="text-slate-300" size={32} />}
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Justificatif (PDF / Image)</p>
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                </div>

                <button className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-6 rounded-[30px] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 group">
                  <Save size={20} className="group-hover:scale-125 transition-transform" /> Valider le dossier
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- GRID DE RÉSULTATS --- */}
      {loading ? (
        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecords.length === 0 ? (
            <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-100 rounded-[60px] bg-slate-50/30">
              <Search className="mx-auto text-slate-200 mb-4" size={50} />
              <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Aucun résultat trouvé</p>
            </div>
          ) : (
            filteredRecords.map((rec) => (
              <div key={rec.id} className="bg-white rounded-[45px] p-8 shadow-sm border border-slate-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative">
                <div className="flex justify-between items-start mb-8">
                  <div className="bg-indigo-50 text-indigo-600 p-5 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-indigo-50">
                    <Award size={32} />
                  </div>
                  <span className={`text-[10px] px-4 py-2 font-black uppercase rounded-xl ${rec.status === 'Terminé' ? 'bg-emerald-100 text-emerald-600 shadow-sm shadow-emerald-50' : 'bg-amber-100 text-amber-600'}`}>
                    {rec.status}
                  </span>
                </div>

                <div className="space-y-1 mb-8">
                  <h4 className="font-black text-2xl text-slate-800 uppercase tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors">{rec.degree_name}</h4>
                  <p className="text-slate-400 font-bold text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" /> {rec.institution_name}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-8 border-t border-slate-50 bg-slate-50/50 -mx-8 px-8 pb-0">
                  <div className="flex flex-col mb-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Titulaire</span>
                    <span className="text-sm font-black text-slate-800 uppercase italic">{rec.family_members?.first_name}</span>
                  </div>
                  <div className="flex gap-3 mb-4">
                    {rec.document_url && (
                      <a href={rec.document_url} target="_blank" className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg">
                        <FileText size={18} />
                      </a>
                    )}
                    <button 
                      onClick={async () => { if(confirm("Supprimer ce document ?")) { await supabase.from('education_records').delete().eq('id', rec.id); fetchData(); } }}
                      className="w-12 h-12 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};