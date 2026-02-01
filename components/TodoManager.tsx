import React, { useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { 
  CheckSquare, Plus, Trash2, CheckCircle2, Circle, 
  Users, Calendar, Filter, X, Loader2, Briefcase, 
  PauseCircle, Ban, RefreshCw, Check
} from 'lucide-react';

export const TodoManager = ({ familyId }: { familyId: string }) => {
  // --- ÉTATS ---
  const [todos, setTodos] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('En cours');
  const [filterProject, setFilterProject] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État pour la carte de confirmation (Toast)
  const [confirmToast, setConfirmToast] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });

  const fetchData = async () => {
    if (!familyId) return;
    try {
      setLoading(true);
      const { data: todoData } = await supabase
        .from('family_todo')
        .select(`*, member:assigned_to(first_name, last_name), project:project_id(title)`)
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      const { data: mData } = await supabase.from('family_members').select('id, first_name, last_name').eq('family_id', familyId);
      const { data: pData } = await supabase.from('family_projects').select('id, title').eq('family_id', familyId);

      setTodos(todoData || []);
      setMembers(mData || []);
      setProjects(pData || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [familyId]);

  // --- LOGIQUE DE CALCUL DU STATUT ---
  const getCalculatedStatus = (todo: any) => {
    if (todo.status === 'Terminé' || todo.status === 'Interrompu') return todo.status;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = todo.start_date ? new Date(todo.start_date) : null;
    const end = todo.due_date ? new Date(todo.due_date) : null;
    if (end && end < now) return 'En retard';
    if (start && start > now) return 'En attente';
    return 'En cours';
  };

  const getCounts = (statusLabel: string) => {
    return todos.filter(t => getCalculatedStatus(t) === statusLabel).length;
  };

  // --- ACTIONS DE CHANGEMENT DE STATUS ---
  const updateTaskStatus = async (id: string, newStatus: string) => {
    try {
      const isDone = newStatus === 'Terminé';
      const { error } = await supabase
        .from('family_todo')
        .update({ status: newStatus, is_completed: isDone })
        .eq('id', id);

      if (!error) {
        // Afficher la carte de confirmation
        setConfirmToast({ show: true, msg: `Statut mis à jour : ${newStatus}` });
        setTimeout(() => setConfirmToast({ show: false, msg: '' }), 3000);
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from('family_todo').insert([{ 
        ...formData, 
        family_id: familyId,
        assigned_to: formData.assigned_to || null,
        project_id: formData.project_id || null
    }]);
    if (!error) {
      setShowModal(false);
      setFormData({ task_name: '', category: 'Maison', assigned_to: '', project_id: '', start_date: '', due_date: '', status: 'En cours' });
      fetchData();
    }
    setIsSubmitting(false);
  };

  const [formData, setFormData] = useState({
    task_name: '', category: 'Maison', assigned_to: '', project_id: '', start_date: '', due_date: '', status: 'En cours'
  });

  const filteredTodos = todos.filter(todo => {
    const currentStatus = getCalculatedStatus(todo);
    const matchTab = activeTab === 'Tous' ? true : currentStatus === activeTab;
    const matchProject = filterProject === 'all' ? true : todo.project_id === filterProject;
    return matchTab && matchProject;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 p-4 relative">
      
      {/* CARD DE CONFIRMATION (TOAST) */}
      {confirmToast.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[999] animate-in slide-in-from-top-full">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-[25px] shadow-2xl flex items-center gap-3 border border-emerald-500/30">
                <div className="bg-emerald-500 p-1 rounded-full"><Check size={16}/></div>
                <p className="text-xs font-black uppercase tracking-widest">{confirmToast.msg}</p>
            </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-emerald-500 p-4 rounded-2xl"><CheckSquare size={32} /></div>
          <div>
            <h3 className="text-2xl font-bold">Mission Tracker</h3>
            <div className="flex gap-4 mt-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">● {getCounts('En cours')} En cours</span>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">● {getCounts('En retard')} Retards</span>
            </div>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all shadow-lg">
          <Plus size={20} /> Nouvelle Mission
        </button>
      </div>

      {/* TABS STATUTS */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
        {['En cours', 'En attente', 'En retard', 'Terminé', 'Interrompu'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
            {tab} ({getCounts(tab)})
          </button>
        ))}
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}
            className="ml-auto bg-slate-50 text-[10px] font-black uppercase p-3 rounded-xl outline-none border-none text-slate-500">
            <option value="all">Tous les projets</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {/* LISTE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>
        ) : filteredTodos.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100 text-center">
            <p className="text-slate-400 font-medium italic">Aucun élément</p>
          </div>
        ) : (
          filteredTodos.map(todo => {
            const status = getCalculatedStatus(todo);
            return (
              <div key={todo.id} className="bg-white p-7 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col gap-5 relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded bg-slate-100 text-slate-500 uppercase`}>{todo.category}</span>
                    <h4 className="font-bold text-slate-800 uppercase text-sm mt-2">{todo.task_name}</h4>
                  </div>
                  
                  {/* ACTIONS DYNAMIQUES */}
                  <div className="flex gap-2">
                    {status !== 'Terminé' && (
                      <button onClick={() => updateTaskStatus(todo.id, 'Terminé')} className="p-3 bg-emerald-500 text-white rounded-xl hover:scale-110 transition-transform">
                        <CheckCircle2 size={18}/>
                      </button>
                    )}
                    {status === 'En cours' && (
                      <button onClick={() => updateTaskStatus(todo.id, 'Interrompu')} className="p-3 bg-orange-500 text-white rounded-xl hover:scale-110 transition-transform">
                        <PauseCircle size={18}/>
                      </button>
                    )}
                    {(status === 'Interrompu' || status === 'Terminé' || status === 'En retard') && (
                      <button onClick={() => updateTaskStatus(todo.id, 'En cours')} className="p-3 bg-blue-500 text-white rounded-xl hover:scale-110 transition-transform">
                        <RefreshCw size={18}/>
                      </button>
                    )}
                    <button onClick={async () => { if(confirm('Supprimer?')) { await supabase.from('family_todo').delete().eq('id', todo.id); fetchData(); } }} className="p-3 text-slate-200 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl text-[10px] font-bold">
                    <div className="flex flex-col">
                        <span className="text-slate-400 uppercase">Start</span>
                        <span>{todo.start_date ? new Date(todo.start_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-4">
                        <span className="text-slate-400 uppercase">Deadline</span>
                        <span className={status === 'En retard' ? 'text-red-500' : ''}>{todo.due_date ? new Date(todo.due_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-[10px] text-white font-bold uppercase">{todo.member?.first_name[0]}</div>
                    <span className="text-[11px] font-bold text-slate-600">{todo.member?.first_name}</span>
                  </div>
                  {todo.project && <div className="text-[10px] font-black text-blue-500 uppercase px-3 py-1 bg-blue-50 rounded-lg">{todo.project.title}</div>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
          <div className="bg-white w-full max-w-xl rounded-[40px] p-10 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Planifier une Mission</h3>
            <form onSubmit={addTask} className="space-y-4">
              <input placeholder="Titre..." className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500"
                onChange={e => setFormData({...formData, task_name: e.target.value})} required />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 ml-2">Début</label>
                    <input type="date" className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs" onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 ml-2">Fin</label>
                    <input type="date" className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs" onChange={e => setFormData({...formData, due_date: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs outline-none" onChange={e => setFormData({...formData, assigned_to: e.target.value})}>
                    <option value="">Agent...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.first_name}</option>)}
                </select>
                <select className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs outline-none" onChange={e => setFormData({...formData, project_id: e.target.value})}>
                    <option value="">Projet...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              <button disabled={isSubmitting} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xs mt-4">
                {isSubmitting ? "Chargement..." : "Lancer la mission"}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full text-slate-400 font-bold text-xs">Annuler</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};