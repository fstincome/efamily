import React, { useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { 
  UserPlus, Search, X, Save, Phone, HeartPulse, 
  Church, Utensils, Trash2, Eye, Cake, Baby, 
  Loader2, Camera, MapPin, Edit3, Droplet, Calendar, FileText
} from 'lucide-react';

export const FamilyManager = ({ familyId }: any) => {
  const [members, setMembers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null); // Pour voir les détails
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const initialForm = {
    first_name: '', last_name: '', sexe: 'M', birth_date: '', birth_place: '',
    birth_certificate_no: '', volume_no: '', relationship: 'Enfant',
    phone: '', email: '', account_role: 'Mineur', profile_url: '',
    blood_group: 'O+', allergies: '', chronic_diseases: '', disability_status: 'Aucun',
    emergency_contact_name: '', emergency_contact_phone: '',
    forbidden_foods: '', forbidden_drinks: '', baptism_date: '', confirmation_date: '',
    education_level: '', profession: '', city_zone: '', private_notes: '', dietary_preferences: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const loadMembers = async () => {
    const { data, error } = await supabase.from('family_members')
      .select('*').eq('family_id', familyId).order('created_at', { ascending: false });
    if (!error && data) setMembers(data);
  };

  useEffect(() => { loadMembers(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const filePath = `${familyId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, profile_url: publicUrl }));
    } catch (err) {
      alert("Erreur lors de l'upload de la photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // On crée une copie des données pour ne pas polluer l'affichage
    // et on retire les champs que Supabase calcule lui-même (comme full_name)
    const { full_name, created_at, id, ...cleanData } = formData as any;

    if (isEditing) {
      // Pour l'UPDATE, on utilise cleanData (sans full_name/id) 
      // et on cible par l'ID original
      const { error } = await supabase
        .from('family_members')
        .update(cleanData)
        .eq('id', formData.id);

      if (!error) {
        setIsModalOpen(false);
        loadMembers();
      } else { 
        console.error(error);
        alert(`Erreur lors de la mise à jour : ${error.message}`); 
      }
    } else {
      // Pour l'INSERT, on ajoute l'id de la famille
      const { error } = await supabase
        .from('family_members')
        .insert([{ family_id: familyId, ...cleanData }]);

      if (!error) {
        setIsModalOpen(false);
        setFormData(initialForm);
        loadMembers();
      } else { 
        console.error(error);
        alert(`Erreur SQL : ${error.message}`); 
      }
    }
  };

  const openEditModal = (member: any) => {
    setFormData(member);
    setIsEditing(true);
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const isBirthdayToday = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const birth = new Date(dateStr);
    return today.getDate() === birth.getDate() && today.getMonth() === birth.getMonth();
  };

  return (
    <div className="space-y-8 animate-fadeIn p-4 bg-slate-50/30 min-h-screen">
      
      {/* BARRE DE RECHERCHE ET ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Rechercher un membre..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs border-2 border-transparent focus:border-blue-500 transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-slate-900 transition-all shadow-lg shadow-blue-100 w-full md:w-auto justify-center"
        >
          <UserPlus size={18}/> Inscrire un membre
        </button>
      </div>

      {/* GRILLE DES MEMBRES - 2 COLONNES SUR DESKTOP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {members.filter(m => `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
          <div key={m.id} className="bg-white p-6 rounded-[45px] border border-slate-100 hover:shadow-xl transition-all flex items-center gap-6 group relative overflow-hidden">
            {isBirthdayToday(m.birth_date) && (
              <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl animate-bounce shadow-lg flex items-center gap-2 z-10">
                <Cake size={14} />
              </div>
            )}
            
            <div className="w-24 h-24 bg-slate-900 rounded-[30px] flex-shrink-0 flex items-center justify-center overflow-hidden border-4 border-slate-50 shadow-lg relative z-10">
              {m.profile_url ? <img src={m.profile_url} className="w-full h-full object-cover" /> : <span className="text-3xl font-black italic text-blue-500">{m.first_name[0]}</span>}
            </div>

            <div className="flex-1 space-y-2 relative z-10">
              <h4 className="font-black text-xl text-slate-800 tracking-tighter  italic leading-none">{m.first_name} {m.last_name}</h4>
              <p className="text-[10px] font-black text-blue-600  tracking-widest bg-blue-50 px-3 py-1 rounded-full inline-block">{m.relationship}</p>
              
              <div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedMember(m)} className="bg-slate-900 text-white px-5 py-3 rounded-xl font-black  text-[9px] tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2">
                  <Eye size={14}/> Détails
                </button>
                <button onClick={() => openEditModal(m)} className="bg-slate-100 text-slate-600 px-5 py-3 rounded-xl font-black  text-[9px] tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
                  <Edit3 size={14}/> Éditer
                </button>
                <button onClick={async () => { if(confirm("Supprimer ?")) { await supabase.from('family_members').delete().eq('id', m.id); loadMembers(); } }} className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE VUE (DÉTAILS COMPLETS) */}
      {selectedMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4">
          <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-[60px] shadow-2xl flex flex-col animate-scaleUp overflow-hidden">
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-900 rounded-[25px] overflow-hidden border-4 border-white shadow-lg">
                  {selectedMember.profile_url ? <img src={selectedMember.profile_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-blue-500 font-black text-2xl italic">{selectedMember.first_name[0]}</div>}
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">{selectedMember.first_name} {selectedMember.last_name}</h2>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedMember.relationship} • {selectedMember.account_role}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="p-4 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm bg-white"><X/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 lg:p-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <DetailBox icon={<Baby className="text-blue-500"/>} title="Identification">
                <DetailField label="Lieu de Naissance" value={selectedMember.birth_place} />
                <DetailField label="Date" value={selectedMember.birth_date} />
                <DetailField label="N° Acte / Volume" value={`${selectedMember.birth_certificate_no} / ${selectedMember.volume_no}`} />
                <DetailField label="Sexe" value={selectedMember.sexe} />
              </DetailBox>

              <DetailBox icon={<HeartPulse className="text-red-500"/>} title="Santé & Urgence">
                <div className="flex gap-2 mb-2">
                  <span className="bg-red-500 text-white px-2 py-1 rounded-md text-[10px] font-black">{selectedMember.blood_group}</span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-black uppercase">{selectedMember.disability_status}</span>
                </div>
                <DetailField label="Allergies" value={selectedMember.allergies} highlight />
                <DetailField label="Maladies Chroniques" value={selectedMember.chronic_diseases} />
                <DetailField label="Contact Urgence" value={`${selectedMember.emergency_contact_name} (${selectedMember.emergency_contact_phone})`} />
              </DetailBox>

              <DetailBox icon={<Utensils className="text-emerald-500"/>} title="Régime Alimentaire">
                <DetailField label="Interdits (Aliments)" value={selectedMember.forbidden_foods} />
                <DetailField label="Interdits (Boissons)" value={selectedMember.forbidden_drinks} />
                <DetailField label="Préférences" value={selectedMember.dietary_preferences} />
              </DetailBox>

              <DetailBox icon={<Church className="text-indigo-500"/>} title="Parcours & Foi">
                <DetailField label="Baptême" value={selectedMember.baptism_date} />
                <DetailField label="Confirmation" value={selectedMember.confirmation_date} />
                <DetailField label="Niveau Scolaire" value={selectedMember.education_level} />
                <DetailField label="Profession" value={selectedMember.profession} />
              </DetailBox>

              <DetailBox icon={<Phone className="text-slate-800"/>} title="Contact & Zone">
                <DetailField label="Téléphone" value={selectedMember.phone} />
                <DetailField label="Email" value={selectedMember.email} />
                <DetailField label="Quartier / Zone" value={selectedMember.city_zone} />
              </DetailBox>

              <DetailBox icon={<FileText className="text-amber-500"/>} title="Notes Privées">
                <p className="text-xs font-bold text-slate-500 italic leading-relaxed">{selectedMember.private_notes || "Aucune note."}</p>
              </DetailBox>
            </div>

            <div className="p-8 border-t bg-slate-50 flex justify-end gap-4">
              <button onClick={() => openEditModal(selectedMember)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                <Edit3 size={16}/> Modifier ce profil
              </button>
              <button onClick={() => setSelectedMember(null)} className="px-8 py-4 font-black uppercase text-[10px] text-slate-400">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL D'INSCRIPTION / ÉDITION (TOUS LES CHAMPS GARDÉS) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-[60px] shadow-2xl flex flex-col animate-scaleUp overflow-hidden">
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">{isEditing ? "Édition du Profil" : "Nouveau Profil"}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saisie complète des données</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-red-500 hover:text-white rounded-2xl transition-all"><X/></button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 bg-slate-100 rounded-[40px] border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {formData.profile_url ? <img src={formData.profile_url} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" size={24} />}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                  {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>}
                </div>
              </div>

              {/* SECTION 1: IDENTITÉ */}
              <div className="space-y-6">
                <h5 className="flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-tighter"><Baby size={18}/> 1. Identification & État Civil</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input label="Prénom" value={formData.first_name} onChange={v => setFormData({...formData, first_name: v})} />
                  <Input label="Nom" value={formData.last_name} onChange={v => setFormData({...formData, last_name: v})} />
                  <Select label="Sexe" options={['M', 'F', 'Autre']} value={formData.sexe} onChange={v => setFormData({...formData, sexe: v})} />
                  <Input type="date" label="Date de Naissance" value={formData.birth_date} onChange={v => setFormData({...formData, birth_date: v})} />
                  <Input label="Lieu de Naissance" value={formData.birth_place} onChange={v => setFormData({...formData, birth_place: v})} />
                  <Select label="Lien de Parenté" options={['Père', 'Mère', 'Enfant', 'Tuteur', 'Autre']} value={formData.relationship} onChange={v => setFormData({...formData, relationship: v})} />
                  <Input label="N° Acte Naissance" value={formData.birth_certificate_no} onChange={v => setFormData({...formData, birth_certificate_no: v})} />
                  <Input label="N° Volume" value={formData.volume_no} onChange={v => setFormData({...formData, volume_no: v})} />
                  <Select label="Rôle du Compte" options={['Mineur', 'Adulte', 'Administrateur']} value={formData.account_role} onChange={v => setFormData({...formData, account_role: v})} />
                </div>
              </div>

              {/* SECTION 2: CONTACT */}
              <div className="space-y-6">
                <h5 className="flex items-center gap-3 text-slate-800 font-black text-xs uppercase tracking-tighter"><Phone size={18}/> 2. Connexion & Localisation</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input label="Téléphone" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
                  <Input type="email" label="Email" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                  <Input label="Zone / Quartier / Ville" value={formData.city_zone} onChange={v => setFormData({...formData, city_zone: v})} />
                </div>
              </div>

              {/* SECTION 3: SANTÉ */}
              <div className="space-y-6">
                <h5 className="flex items-center gap-3 text-red-500 font-black text-xs uppercase tracking-tighter"><HeartPulse size={18}/> 3. Données de Santé</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Select label="Groupe Sanguin" options={['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']} value={formData.blood_group} onChange={v => setFormData({...formData, blood_group: v})} />
                  <Select label="Situation Handicap" options={['Aucun', 'Physique', 'Sensoriel', 'Mental', 'Autre']} value={formData.disability_status} onChange={v => setFormData({...formData, disability_status: v})} />
                  <Input label="Urgence (Nom)" value={formData.emergency_contact_name} onChange={v => setFormData({...formData, emergency_contact_name: v})} />
                  <Input label="Urgence (Tél)" value={formData.emergency_contact_phone} onChange={v => setFormData({...formData, emergency_contact_phone: v})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextArea label="Allergies connues" value={formData.allergies} onChange={v => setFormData({...formData, allergies: v})} />
                  <TextArea label="Maladies Chroniques" value={formData.chronic_diseases} onChange={v => setFormData({...formData, chronic_diseases: v})} />
                </div>
              </div>

              {/* SECTION 4: RÉGIME */}
              <div className="space-y-6">
                <h5 className="flex items-center gap-3 text-emerald-600 font-black text-xs uppercase tracking-tighter"><Utensils size={18}/> 4. Aliments & Préférences</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input label="Aliments Interdits" value={formData.forbidden_foods} onChange={v => setFormData({...formData, forbidden_foods: v})} />
                  <Input label="Boissons Interdites" value={formData.forbidden_drinks} onChange={v => setFormData({...formData, forbidden_drinks: v})} />
                  <Input label="Préférences" value={formData.dietary_preferences} onChange={v => setFormData({...formData, dietary_preferences: v})} />
                </div>
              </div>

              {/* SECTION 5: SOCIAL */}
              <div className="space-y-6 pb-12">
                <h5 className="flex items-center gap-3 text-indigo-600 font-black text-xs uppercase tracking-tighter"><Church size={18}/> 5. Parcours Social & Foi</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Input type="date" label="Date de Baptême" value={formData.baptism_date} onChange={v => setFormData({...formData, baptism_date: v})} />
                  <Input type="date" label="Date de Confirmation" value={formData.confirmation_date} onChange={v => setFormData({...formData, confirmation_date: v})} />
                  <Input label="Niveau Scolaire" value={formData.education_level} onChange={v => setFormData({...formData, education_level: v})} />
                  <Input label="Profession / Métier" value={formData.profession} onChange={v => setFormData({...formData, profession: v})} />
                </div>
                <TextArea label="Notes familiales privées" value={formData.private_notes} onChange={v => setFormData({...formData, private_notes: v})} />
              </div>
            </form>

            <div className="p-8 border-t bg-slate-50 flex justify-end gap-4 shadow-inner">
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-black uppercase text-[10px] text-slate-400">Annuler</button>
              <button onClick={handleSave} className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center gap-3">
                <Save size={18}/> {isEditing ? "Appliquer les modifications" : "Enregistrer le profil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPOSANTS DE PRÉSENTATION ---

const DetailBox = ({ icon, title, children }: any) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
      {icon}
      <h5 className="font-black text-xs uppercase tracking-widest text-slate-800">{title}</h5>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const DetailField = ({ label, value, highlight = false }: any) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
    <p className={`font-bold text-sm ${highlight ? 'text-red-500' : 'text-slate-700'}`}>
      {value || <span className="text-slate-200 italic font-normal text-xs">N/A</span>}
    </p>
  </div>
);

const Input = ({ label, type="text", value, onChange, placeholder="" }: any) => (
  <div className="space-y-2 group">
    <label className="text-[9px] font-black uppercase text-slate-400 ml-1 group-focus-within:text-blue-600 transition-colors">{label}</label>
    <input 
      type={type} value={value || ''} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 p-4 rounded-2xl outline-none font-bold text-sm transition-all shadow-sm"
    />
  </div>
);

const Select = ({ label, options, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">{label}</label>
    <select 
      value={value || ''} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 p-4 rounded-2xl outline-none font-bold text-sm transition-all appearance-none cursor-pointer shadow-sm"
    >
      {options.map((o:any) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const TextArea = ({ label, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">{label}</label>
    <textarea 
      value={value || ''} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold text-sm h-28 resize-none border-2 border-transparent focus:border-blue-500 transition-all shadow-sm"
    />
  </div>
);