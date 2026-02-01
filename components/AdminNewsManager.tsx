import React, { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import { 
  Newspaper, Image as ImageIcon, Trash2, 
  Send, Loader2, CheckCircle, Upload, X, Calendar as CalendarIcon
} from 'lucide-react';

const ADMIN_FAMILY_ID = '11111111-1111-1111-1111-111111111111'; // Ton ID fixe

export const AdminNewsManager = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Événement',
    image_url: '',
    event_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchUser();
    fetchNews();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUser(user);
  };

  const fetchNews = async () => {
    setLoading(true);
    const { data } = await supabase.from('family_news')
      .select('*')
      .eq('family_id', ADMIN_FAMILY_ID)
      .order('created_at', { ascending: false });
    if (data) setNews(data);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileName = `${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('news_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('news_images').getPublicUrl(fileName);
      setFormData({ ...formData, image_url: data.publicUrl });
    } catch (error: any) {
      alert("Erreur upload : " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert("Vous devez être connecté.");
    
    setIsSubmitting(true);
    const payload = {
      ...formData,
      family_id: ADMIN_FAMILY_ID,
      author_id: currentUser.id,
      author_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Admin'
    };

    const { error } = await supabase.from('family_news').insert([payload]);
    
    if (!error) {
      setShowConfirm(true);
      setFormData({ title: '', content: '', category: 'Événement', image_url: '', event_date: new Date().toISOString().split('T')[0] });
      fetchNews();
      setTimeout(() => setShowConfirm(false), 3000);
    }
    setIsSubmitting(false);
  };

  const deleteArticle = async (id: string) => {
    if (confirm("Supprimer ce souvenir ?")) {
      await supabase.from('family_news').delete().eq('id', id);
      fetchNews();
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      
      {/* FORMULAIRE */}
      <section className="bg-white p-8 lg:p-12 rounded-[50px] shadow-sm border border-slate-100 relative overflow-hidden">
        {showConfirm && (
          <div className="absolute inset-0 bg-blue-600/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white animate-in zoom-in">
            <CheckCircle size={60} className="mb-4" />
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Souvenir Partagé !</h3>
          </div>
        )}

        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl text-white"><Newspaper size={24} /></div>
            <div>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase">Rédaction Journal</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auteur : {currentUser?.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Date de l'événement</label>
                <input type="date" value={formData.event_date} onChange={e => setFormData({...formData, event_date: e.target.value})}
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Catégorie</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-black text-[10px] uppercase">
                  <option value="Événement">🎉 Événement</option>
                  <option value="Réussite">🏆 Réussite</option>
                  <option value="Santé">🏥 Santé</option>
                  <option value="Voyage">✈️ Voyage</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Titre</label>
              <input required placeholder="Ex: Mariage de..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold text-lg" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Récit</label>
              <textarea required rows={5} placeholder="Racontez ce qu'il s'est passé..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full bg-slate-50 p-6 rounded-[30px] outline-none font-medium resize-none" />
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Illustration</label>
            <div className={`relative h-[340px] border-4 border-dashed rounded-[50px] flex flex-col items-center justify-center transition-all ${formData.image_url ? 'border-blue-100 bg-blue-50/30' : 'border-slate-100 bg-slate-50'}`}>
              {formData.image_url ? (
                <>
                  <img src={formData.image_url} className="absolute inset-0 w-full h-full object-cover rounded-[44px]" alt="Preview" />
                  <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="absolute top-4 right-4 bg-white/90 p-3 rounded-full shadow-xl text-red-500 hover:scale-110 transition-all"><X size={20}/></button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center group">
                  <div className="bg-white p-6 rounded-3xl shadow-sm group-hover:scale-110 transition-all duration-300">
                    {uploading ? <Loader2 className="animate-spin text-blue-600" /> : <Upload className="text-blue-600" size={30} />}
                  </div>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Ajouter une photo</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              )}
            </div>
            
            <button disabled={isSubmitting || uploading || !formData.image_url} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[4px] text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-20">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18}/> Enregistrer au Journal</>}
            </button>
          </div>
        </form>
      </section>

      {/* LISTE */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-[40px] border border-slate-100 group hover:shadow-xl transition-all">
            <div className="relative h-48 mb-4 overflow-hidden rounded-[30px]">
              <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="" />
              <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{item.category}</div>
            </div>
            <div className="px-4 pb-4">
              <h4 className="font-black text-slate-800 uppercase text-sm mb-1 truncate">{item.title}</h4>
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                <span>{new Date(item.event_date).toLocaleDateString()} • {item.author_name}</span>
                <button onClick={() => deleteArticle(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};