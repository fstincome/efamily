import React, { useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { 
  Plus, Clock, X, MapPin, Loader2, CalendarDays, 
  Trash2, Calendar, Users, Check, Search, Filter
} from 'lucide-react';

export const AgendaManager = ({ familyId }: { familyId: string }) => {
  // --- ÉTATS DES DONNÉES ---
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ÉTATS DES FILTRES ---
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [filterPeriod, setFilterPeriod] = useState('all'); // all, upcoming, month, past

  // --- ÉTAT DU FORMULAIRE ---
  const [formData, setFormData] = useState({ 
    title: '', 
    start_date: '', 
    end_date: '', 
    category: 'Loisirs',
    location: '',
    description: '',
    participants: [] as string[] 
  });

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = async () => {
    if (!familyId) return;
    try {
      setLoading(true);
      
      // Récupération des événements
      const { data: eventsData, error: eventsError } = await supabase
        .from('family_events')
        .select('*')
        .eq('family_id', familyId)
        .order('start_date', { ascending: true });

      // Récupération des membres pour les participants
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select('id, first_name, last_name')
        .eq('family_id', familyId)
        .eq('is_active', true);

      if (eventsError) throw eventsError;
      if (membersError) throw membersError;

      setEvents(eventsData || []);
      setFilteredEvents(eventsData || []); // Initialement, on affiche tout
      setFamilyMembers(membersData || []);
    } catch (err) {
      console.error("Erreur fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [familyId]);

  // --- LOGIQUE DE FILTRAGE ---
  useEffect(() => {
    let result = [...events];
    const now = new Date();

    // Filtre par catégorie
    if (filterCategory !== 'Tous') {
      result = result.filter(e => e.category === filterCategory);
    }

    // Filtre par période
    if (filterPeriod === 'upcoming') {
      result = result.filter(e => new Date(e.start_date) >= now);
    } else if (filterPeriod === 'month') {
      result = result.filter(e => {
        const d = new Date(e.start_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (filterPeriod === 'past') {
      result = result.filter(e => new Date(e.start_date) < now);
    }

    setFilteredEvents(result);
  }, [filterCategory, filterPeriod, events]);

  // --- ACTIONS ---
  const toggleParticipant = (fullName: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(fullName)
        ? prev.participants.filter(p => p !== fullName)
        : [...prev.participants, fullName]
    }));
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('family_events').insert([{ ...formData, family_id: familyId }]);
      if (error) throw error;
      setShowModal(false);
      setFormData({ title: '', start_date: '', end_date: '', category: 'Loisirs', location: '', description: '', participants: [] });
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'ajout.");
    } finally { setIsSubmitting(false); }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    const { error } = await supabase.from('family_events').delete().eq('id', id);
    if (!error) fetchData();
  };

  const getTimingStatus = (start: string) => {
    const startDate = new Date(start);
    const now = new Date();
    const diffDays = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: "Passé", color: "bg-slate-100 text-slate-400" };
    if (diffDays === 0) return { text: "Aujourd'hui", color: "bg-emerald-500 text-white shadow-lg shadow-emerald-100" };
    return { text: `J - ${diffDays}`, color: "bg-blue-50 text-blue-600" };
  };

  return (
    <div className="space-y-10 p-2">
      
      {/* 1. HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[35px] shadow-sm border border-slate-100 gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-slate-900 p-4 rounded-2xl text-white">
            <CalendarDays size={30} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Agenda Hyady OS</h2>
            <p className="text-sm text-slate-400 font-medium italic">Planification et déploiement familial</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-blue-50"
        >
          <Plus size={20}/> Planifier
        </button>
      </div>

      {/* 2. BARRE DE FILTRES ET RECHERCHE */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-50/50 p-4 rounded-[30px] border border-slate-100">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 flex-1 min-w-[200px]">
          <Filter size={16} className="text-slate-400" />
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-600 outline-none w-full cursor-pointer"
          >
            <option value="Tous">Toutes catégories</option>
            <option value="Loisirs">🏖️ Loisirs</option>
            <option value="Important">🔥 Important</option>
            <option value="Voyage">✈️ Voyage</option>
            <option value="Santé">🩺 Santé</option>
          </select>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 flex-1 min-w-[200px]">
          <Search size={16} className="text-slate-400" />
          <select 
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-600 outline-none w-full cursor-pointer"
          >
            <option value="all">Toutes les périodes</option>
            <option value="upcoming">À venir</option>
            <option value="month">Ce mois-ci</option>
            <option value="past">Archives (Passés)</option>
          </select>
        </div>
        
        <div className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
          {filteredEvents.length} Résultat(s)
        </div>
      </div>

      {/* 3. GRILLE D'AFFICHAGE (2 COLONNES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          [1, 2].map((i) => <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[35px]" />)
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-medium">Aucun événement ne correspond aux filtres.</p>
          </div>
        ) : (
          filteredEvents.map(event => {
            const status = getTimingStatus(event.start_date);
            const eventDate = new Date(event.start_date);
            return (
              <div key={event.id} className="bg-white p-8 rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-slate-50 flex gap-6 group">
                
                {/* BLOC DATE */}
                <div className="flex flex-col items-center justify-center border-r border-slate-50 pr-6 min-w-[80px]">
                  <span className="text-xs font-bold text-blue-500 uppercase">{eventDate.toLocaleString('fr-FR', { month: 'short' }).replace('.','')}</span>
                  <span className="text-4xl font-black text-slate-800">{eventDate.getDate()}</span>
                  <span className="text-[10px] font-bold text-slate-300 mt-1">{eventDate.getFullYear()}</span>
                </div>

                {/* CONTENU ÉVÉNEMENT */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold ${status.color}`}>
                      {status.text}
                    </span>
                    <button onClick={() => deleteEvent(event.id)} className="opacity-0 group-hover:opacity-100 text-slate-200 hover:text-red-500 transition-all">
                      <Trash2 size={18}/>
                    </button>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-800 leading-tight">{event.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{event.description || "Aucune note tactique."}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={14} className="text-blue-500" />
                      <span className="text-[11px] font-semibold">{eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin size={14} className="text-blue-500" />
                        <span className="text-[11px] font-semibold truncate max-w-[120px]">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* PARTICIPANTS */}
                  <div className="flex flex-wrap gap-1">
                    {event.participants?.map((p: string, idx: number) => (
                      <span key={idx} className="bg-slate-50 text-[9px] font-bold text-slate-400 px-2 py-0.5 rounded-md border border-slate-100">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. MODAL D'AJOUT (INPUTS CONSERVÉS) */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800">Nouvelle planification</h3>
              <button onClick={() => setShowModal(false)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100"><X size={20} /></button>
            </div>

            <form onSubmit={addEvent} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-1">Titre</label>
                <input placeholder="Ex: Réunion de famille" className="w-full bg-slate-50 p-5 rounded-2xl font-semibold outline-none border-2 border-transparent focus:border-blue-500" 
                  onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">Début</label>
                  <input type="datetime-local" className="w-full bg-slate-50 p-4 rounded-2xl font-semibold outline-none text-sm" 
                    onChange={e => setFormData({...formData, start_date: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">Fin (optionnel)</label>
                  <input type="datetime-local" className="w-full bg-slate-50 p-4 rounded-2xl font-semibold outline-none text-sm" 
                    onChange={e => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-1">Participants</label>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  {familyMembers.map(member => {
                    const fullName = `${member.first_name} ${member.last_name}`;
                    const isSelected = formData.participants.includes(fullName);
                    return (
                      <div key={member.id} onClick={() => toggleParticipant(fullName)}
                        className={`px-4 py-2 rounded-xl cursor-pointer text-[10px] font-bold transition-all border-2 ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-transparent text-slate-500 hover:border-slate-200'}`}>
                        {fullName}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">Lieu</label>
                  <input placeholder="Localisation..." className="w-full bg-slate-50 p-5 rounded-2xl font-semibold outline-none" 
                    onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">Catégorie</label>
                  <select className="w-full bg-slate-50 p-5 rounded-2xl font-bold text-xs outline-none appearance-none" 
                    onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Loisirs">Loisirs</option>
                    <option value="Important">Important</option>
                    <option value="Voyage">Voyage</option>
                    <option value="Santé">Santé</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-1">Notes tactiques</label>
                <textarea placeholder="Détails..." className="w-full bg-slate-50 p-5 rounded-2xl font-semibold outline-none min-h-[80px]" 
                  onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <button disabled={isSubmitting} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : "Confirmer l'enregistrement"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};