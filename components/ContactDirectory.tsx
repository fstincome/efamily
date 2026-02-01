import React, { useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { Contact2, Plus, Phone, Mail, MapPin, Trash2, Search, Building2 } from 'lucide-react';

export const ContactDirectory = ({ familyId }: { familyId: string }) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', organization: '', role: '', phone: '', email: '', address: '' });

  const fetchContacts = async () => {
    setLoading(true);
    const { data } = await supabase.from('family_contacts').select('*').eq('family_id', familyId).order('name');
    if (data) setContacts(data);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, [familyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('family_contacts').insert([{ ...formData, family_id: familyId }]);
    setShowModal(false);
    fetchContacts();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-4 rounded-2xl text-white"><Contact2 size={28} /></div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Annuaire</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Partenaires & Services</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-lg hover:bg-slate-900 transition-all">
          <Plus size={18}/> Nouveau Contact
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map(contact => (
          <div key={contact.id} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Building2 size={24} />
              </div>
              <button onClick={async () => { await supabase.from('family_contacts').delete().eq('id', contact.id); fetchContacts(); }} className="text-slate-100 hover:text-red-500"><Trash2 size={16}/></button>
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{contact.name}</h3>
            <p className="text-[10px] font-black text-blue-600 uppercase mb-6 tracking-widest">{contact.role || 'Partenaire'}</p>
            
            <div className="space-y-3 border-t border-slate-50 pt-6">
              {contact.phone && <a href={`tel:${contact.phone}`} className="flex items-center gap-3 text-sm font-bold text-slate-500 hover:text-blue-600"><Phone size={14}/> {contact.phone}</a>}
              {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-sm font-bold text-slate-500 hover:text-blue-600"><Mail size={14}/> {contact.email}</a>}
              {contact.address && <div className="flex items-center gap-3 text-sm font-bold text-slate-500"><MapPin size={14}/> {contact.address}</div>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Ajouter un Contact</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Nom Complet" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input placeholder="Fonction (ex: Avocat, Plombier)" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, role: e.target.value})} />
              <input placeholder="Téléphone" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input placeholder="Email" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, email: e.target.value})} />
              <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Enregistrer</button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full text-slate-400 font-black uppercase text-[10px] mt-2">Annuler</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};