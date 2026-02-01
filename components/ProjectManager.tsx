import React, { useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { 
  Briefcase, Plus, Target, Calendar, Trash2, Loader2, 
  DollarSign, X, FileUp, Ban, PauseCircle, CheckCircle2, 
  User, Building2, Info, ExternalLink, Clock, Layers,
  MessageSquare, Send 
} from 'lucide-react';

export const ProjectManager = ({ familyId }: { familyId: string }) => {
  // Données
  const [projects, setProjects] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]); 
  const [newComment, setNewComment] = useState(""); 
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('En cours');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const domains = ["Infrastructure", "Éducation", "Santé", "Agriculture", "Technologie", "Logistique"];

  const [formData, setFormData] = useState({
    family_id: familyId, title: '', description: '', status: 'À venir',
    progress: 0, budget_allocated: 0, start_date: '', deadline: '',
    domain: '', partner_id: '', leader_id: ''
  });

  // Logique pour filtrer les projets en retard
  const isOverdue = (project: any) => {
    if (!project.deadline || project.status === 'Terminé' || project.status === 'Annulé') return false;
    return new Date(project.deadline) < new Date();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProjs, resConts, resMembs] = await Promise.all([
        supabase.from('family_projects').select('*, family_contacts(name, organization), family_members(full_name)').eq('family_id', familyId).order('deadline', { ascending: true }),
        supabase.from('family_contacts').select('id, name, organization').eq('family_id', familyId),
        supabase.from('family_members').select('id, full_name').eq('family_id', familyId)
      ]);

      if (resProjs.data) setProjects(resProjs.data);
      if (resConts.data) setContacts(resConts.data);
      if (resMembs.data) setMembers(resMembs.data);
    } catch (err) {
      console.error("Erreur de chargement", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (projectId: string) => {
    const { data } = await supabase
      .from('project_comments')
      .select('*, family_members(full_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    if (data) setComments(data);
  };

  useEffect(() => { fetchData(); }, [familyId]);

  useEffect(() => {
    if (selectedProject) fetchComments(selectedProject.id);
  }, [selectedProject]);

  const handleFileUpload = async (projectId: string) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const filePath = `${familyId}/${projectId}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('project-docs').upload(filePath, file);
    if (error) throw error;
    return supabase.storage.from('project-docs').getPublicUrl(filePath).data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const { data, error } = await supabase.from('family_projects').insert([formData]).select().single();
      if (error) throw error;
      if (file && data) {
        const url = await handleFileUpload(data.id);
        await supabase.from('family_projects').update({ file_url: url }).eq('id', data.id);
      }
      setShowAddModal(false);
      setFile(null);
      fetchData();
    } catch (err) {
      alert("Erreur lors de la création");
    } finally {
      setUploading(false);
    }
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const { error } = await supabase.from('project_comments').insert([
      { project_id: selectedProject.id, content: newComment, member_id: formData.leader_id || null }
    ]);
    if (!error) {
      setNewComment("");
      fetchComments(selectedProject.id);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'Terminé') updates.progress = 100;
    if (newStatus === 'En cours' && formData.progress === 0) updates.progress = 10;
    
    await supabase.from('family_projects').update(updates).eq('id', id);
    if (selectedProject?.id === id) setSelectedProject({...selectedProject, ...updates});
    fetchData();
  };

  return (
    <div className="w-full space-y-8 pb-20">
      
      {/* SECTION HEADER & TABS */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-4 rounded-2xl text-white"><Briefcase size={28} /></div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">Projets Famille</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Tableau de bord opérationnel</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-slate-200">
            <Plus size={18} /> Nouveau Projet
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['À venir', 'En cours', 'Terminé',  'En retard','Annulé', 'Interrompu'].map((tab) => {
            const count = tab === 'En retard' 
              ? projects.filter(p => isOverdue(p)).length 
              : projects.filter(p => p.status === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                  ${activeTab === tab 
                    ? (tab === 'En retard' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white') 
                    : 'bg-slate-50 text-slate-400'}`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* GRID DE PROJETS */}
      {loading ? (
        <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-600" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects
            .filter(p => activeTab === 'En retard' ? isOverdue(p) : p.status === activeTab)
            .map((project) => (
            <div key={project.id} className="bg-white rounded-[35px] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${isOverdue(project) ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  {project.domain} {isOverdue(project) && "• RETARD"}
                </span>
                <button onClick={() => setSelectedProject(project)} className="text-slate-300 hover:text-blue-600 transition-colors"><Info size={20}/></button>
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase mb-4 truncate">{project.title}</h3>
              
              <div className="flex items-center gap-4 mb-6">
                 <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                      {project.family_members?.full_name?.charAt(0) || <User size={12}/>}
                    </div>
                 </div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                   {project.family_contacts?.organization || "Projet Interne"}
                 </div>
              </div>

              <div className="space-y-2">
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${project.status === 'Terminé' ? 'bg-emerald-500' : (isOverdue(project) ? 'bg-red-500' : 'bg-blue-600')}`} style={{ width: `${project.progress}%` }} />
                </div>
                <div className="flex justify-between text-[9px] font-black text-slate-400">
                  <span>{project.progress}%</span>
                  <span>{project.budget_allocated?.toLocaleString()} FBU</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DÉTAILS PROJET */}
      {selectedProject && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col md:flex-row relative">
            
          <button 
  onClick={() => setSelectedProject(null)} 
  className="absolute top-6 right-6 z-[160] bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-800 transition-all shadow-sm"
>
  <X size={24}/>
</button>

            <div className="w-full md:w-1/2 p-8 overflow-y-auto border-r border-slate-50">
                <div className="bg-slate-900 -m-8 p-8 text-white mb-8">
                    <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">{selectedProject.domain}</span>
                    <h3 className="text-3xl font-black uppercase tracking-tighter mt-2 pr-8">{selectedProject.title}</h3>
                </div>
                
                <div className="space-y-6 mt-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-3xl">
                            <Clock size={16} className="text-blue-600 mb-2"/>
                            <p className="text-[8px] font-black text-slate-400 uppercase">Début</p>
                            <p className="text-[10px] font-bold">{selectedProject.start_date || '--'}</p>
                        </div>
                        <div className={`p-4 rounded-3xl ${isOverdue(selectedProject) ? 'bg-red-50' : 'bg-slate-50'}`}>
                            <Calendar size={16} className={`${isOverdue(selectedProject) ? 'text-red-600' : 'text-slate-400'} mb-2`}/>
                            <p className="text-[8px] font-black text-slate-400 uppercase">Échéance</p>
                            <p className={`text-[10px] font-bold ${isOverdue(selectedProject) ? 'text-red-600' : ''}`}>{selectedProject.deadline || '--'}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Layers size={12}/> Description</h4>
                        <p className="text-sm text-slate-600 leading-relaxed italic bg-slate-50 p-5 rounded-2xl">
                            {selectedProject.description || "Aucun détail."}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                        <div className="flex gap-3">
                          {selectedProject.status === 'À venir' && (
                              <button onClick={() => updateStatus(selectedProject.id, 'En cours')} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2">Lancer</button>
                          )}
                          {selectedProject.status === 'En cours' && (
                              <button onClick={() => updateStatus(selectedProject.id, 'Terminé')} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2">Terminer</button>
                          )}
                        </div>
                        
                        {selectedProject.file_url && (
                            <a href={selectedProject.file_url} target="_blank" rel="noreferrer" className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-all">
                              <FileUp size={16}/> Voir le Document PDF
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full md:w-1/2 bg-slate-50/50 p-8 flex flex-col pt-16 md:pt-8">
              <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
                <MessageSquare size={14}/> Journal d'activité & Détails
              </h4>
              
              <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
                {comments.length === 0 ? (
                  <div className="text-center py-10 opacity-30">
                    <MessageSquare size={40} className="mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase">Aucune note pour le moment</p>
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] font-black text-blue-600 uppercase">{c.family_members?.full_name || "Membre"}</span>
                        <span className="text-[8px] text-slate-300">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug font-medium">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={addComment} className="relative mt-auto">
                <input 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Écrire une mise à jour..."
                  className="w-full bg-white p-4 pr-12 rounded-2xl text-[11px] font-bold outline-none border border-slate-100 focus:border-blue-300 transition-all"
                />
                <button type="submit" className="absolute right-2 top-2 p-2 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-colors">
                  <Send size={16}/>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUT */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Initialisation Projet</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-slate-900"><X/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Titre" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, title: e.target.value})} required />
              <textarea placeholder="Description détaillée..." className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none min-h-[100px]" onChange={e => setFormData({...formData, description: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-slate-50 p-5 rounded-2xl font-bold text-slate-500" onChange={e => setFormData({...formData, domain: e.target.value})}>
                  <option value="">Domaine</option>
                  {domains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="number" placeholder="Budget (FBU)" className="bg-slate-50 p-5 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, budget_allocated: parseFloat(e.target.value)})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select className="bg-slate-50 p-5 rounded-2xl font-bold text-slate-500" onChange={e => setFormData({...formData, leader_id: e.target.value})}>
                  <option value="">Chef de projet</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
                <select className="bg-slate-50 p-5 rounded-2xl font-bold text-slate-500" onChange={e => setFormData({...formData, partner_id: e.target.value})}>
                  <option value="">Partenaire</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.organization || c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="date" title="Début" className="bg-slate-50 p-5 rounded-2xl font-bold outline-none text-xs" onChange={e => setFormData({...formData, start_date: e.target.value})} />
                <input type="date" title="Échéance" className="bg-slate-50 p-5 rounded-2xl font-bold outline-none text-xs" onChange={e => setFormData({...formData, deadline: e.target.value})} />
              </div>

              <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center gap-2 bg-slate-50/50">
                <FileUp className={file ? "text-blue-600" : "text-slate-300"} />
                <span className="text-[10px] font-black text-slate-400 uppercase">{file ? file.name : "Joindre un document"}</span>
                <input type="file" id="up" className="hidden" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
                <label htmlFor="up" className="text-blue-600 font-bold text-xs cursor-pointer hover:underline">Parcourir</label>
              </div>

              <button disabled={uploading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase shadow-xl disabled:opacity-50 transition-all hover:bg-blue-600">
                {uploading ? "Chargement..." : "Créer le projet"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};