import React, { useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { 
  X, Loader2, HeartPulse, Plus, Search, Trash2, 
  Stethoscope, Syringe, Activity, Clock, History, 
  CheckCircle2, Calendar, Save, User, UserPlus
} from 'lucide-react';

export const HealthForm = ({ familyId }: { familyId: string }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState('all');
  const [activeTab, setActiveTab] = useState<'history' | 'appointments'>('history');

  const [formData, setFormData] = useState({
    family_id: familyId,
    patient_name: '',
    type: 'Consultation',
    description: '',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: mems } = await supabase.from('family_members').select('*').eq('family_id', familyId);
    if (mems) setMembers(mems);

    const { data: recs } = await supabase
      .from('health_records')
      .select('*')
      .eq('family_id', familyId)
      .order('date', { ascending: false });
    
    if (recs) setRecords(recs);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [familyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_name) return alert("Veuillez choisir un patient");

    const { error } = await supabase.from('health_records').insert([formData]);
    if (!error) {
      setShowForm(false);
      fetchData();
      setFormData({ 
        family_id: familyId, 
        patient_name: '', 
        type: 'Consultation', 
        description: '', 
        date: new Date().toISOString().split('T')[0], 
        doctor: '' 
      });
    }
  };

  const today = new Date().toISOString().split('T')[0];
  
  const filteredRecords = records.filter(rec => {
    const isAppointment = rec.date >= today;
    const matchesTab = activeTab === 'appointments' ? isAppointment : !isAppointment;
    const matchesMember = selectedMember === 'all' || rec.patient_name === selectedMember;
    const matchesSearch = rec.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rec.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.doctor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesMember && matchesSearch;
  });

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[45px] shadow-sm border border-slate-100 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-xl shadow-emerald-100">
            <HeartPulse size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 leading-none">Santé</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Carnet de santé familial numérique</p>
          </div>
        </div>

        <button 
          onClick={() => setShowForm(true)}
          className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-[22px] font-black uppercase text-xs tracking-[0.15em] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-200 hover:scale-105 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> Nouvel Acte
        </button>
      </div>

      {/* --- NAVIGATION & RECHERCHE --- */}
      <div className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-50 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* TABS SELECTOR */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full lg:w-auto">
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 lg:flex-none px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <History size={16} /> Historique ({records.filter(r => r.date < today).length})
            </button>
            <button 
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 lg:flex-none px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'appointments' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Clock size={16} /> Rendez-vous ({records.filter(r => r.date >= today).length})
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Chercher un symptôme, médecin..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-[20px] text-sm font-bold border-2 border-transparent focus:border-emerald-100 focus:bg-white outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* FILTRE PAR MEMBRE */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar border-t border-slate-50 pt-4">
          <button 
            onClick={() => setSelectedMember('all')}
            className={`px-6 py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${selectedMember === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            Tous les membres
          </button>
          {members.map(m => (
            <button 
              key={m.id}
              onClick={() => setSelectedMember(m.first_name)}
              className={`px-6 py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${selectedMember === m.first_name ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-500 hover:bg-emerald-50'}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${selectedMember === m.first_name ? 'bg-white' : 'bg-emerald-400'}`} />
              {m.first_name}
            </button>
          ))}
        </div>
      </div>

      {/* --- MODAL FORMULAIRE --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[45px] shadow-2xl border-t-[12px] border-emerald-500 overflow-hidden transform animate-in zoom-in-95">
            <div className="p-10 relative">
              <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={24} />
              </button>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-8 flex items-center gap-3">
                <Stethoscope size={32} className="text-emerald-500" /> Nouveau Dossier
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Patient concerné</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-5 font-bold outline-none appearance-none cursor-pointer"
                    value={formData.patient_name}
                    onChange={e => setFormData({...formData, patient_name: e.target.value})}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {members.map(m => <option key={m.id} value={m.first_name}>{m.first_name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Type</label>
                    <select className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none border-2 border-transparent focus:border-emerald-500" onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option>Consultation</option>
                      <option>Vaccination</option>
                      <option>Examen Labo</option>
                      <option>Urgence</option>
                      <option>Dentiste</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Date</label>
                    <input type="date" className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none border-2 border-transparent focus:border-emerald-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Médecin / Établissement</label>
                  <input placeholder="Ex: Dr. Martin ou Clinique de l'Espoir" className="w-full bg-slate-50 rounded-2xl p-4 font-bold border-2 border-transparent focus:border-emerald-500 outline-none" onChange={e => setFormData({...formData, doctor: e.target.value})} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Notes & Observations</label>
                  <textarea placeholder="Symptômes, traitements, résultats..." className="w-full bg-slate-50 rounded-[30px] p-5 font-bold border-2 border-transparent focus:border-emerald-500 outline-none h-32" onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <button className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-6 rounded-[30px] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 group">
                  <Save size={20} className="group-hover:scale-125 transition-transform" /> Enregistrer le dossier
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- GRID DE RÉSULTATS --- */}
      {loading ? (
        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecords.length === 0 ? (
            <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-100 rounded-[60px] bg-slate-50/30">
              {activeTab === 'appointments' ? <Calendar className="mx-auto text-slate-200 mb-4" size={50} /> : <History className="mx-auto text-slate-200 mb-4" size={50} />}
              <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Aucun dossier dans cette section</p>
            </div>
          ) : (
            filteredRecords.map((rec) => (
              <div key={rec.id} className={`bg-white rounded-[45px] p-8 shadow-sm border border-slate-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative border-l-[12px] ${activeTab === 'appointments' ? 'border-l-amber-400' : 'border-l-emerald-500'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl shadow-lg transition-all duration-500 ${activeTab === 'appointments' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                    {rec.type === 'Vaccination' ? <Syringe size={28} /> : rec.type === 'Examen Labo' ? <Activity size={28} /> : <Stethoscope size={28} />}
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] font-black uppercase text-slate-300 tracking-widest mb-1">Date de l'acte</span>
                    <span className="text-xs font-black text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{new Date(rec.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <h4 className="font-black text-2xl text-slate-800 uppercase tracking-tighter leading-tight group-hover:text-emerald-600 transition-colors">{rec.patient_name}</h4>
                  <p className="text-emerald-500 font-bold text-xs uppercase tracking-tighter flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${activeTab === 'appointments' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                    {rec.type} • {rec.doctor || 'Médecin non spécifié'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-[25px] p-5 mb-8 min-h-[100px] border border-slate-100/50">
                  <p className="text-sm font-bold text-slate-600 leading-relaxed italic line-clamp-4">"{rec.description || 'Aucune note particulière'}"</p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   {activeTab === 'appointments' ? (
                     <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase bg-amber-50 px-3 py-2 rounded-xl">
                        <Clock size={14} /> À venir
                     </div>
                   ) : (
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-3 py-2 rounded-xl">
                        <CheckCircle2 size={14} /> Terminé
                     </div>
                   )}
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => { if(confirm("Supprimer ce dossier médical ?")) { await supabase.from('health_records').delete().eq('id', rec.id); fetchData(); } }}
                      className="w-12 h-12 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
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