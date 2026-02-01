import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../src/supabaseClient';
import { Loader2, Calendar, User, ArrowLeft, Share2, MessageCircle, Send, Heart, Reply } from 'lucide-react';

interface BlogPost {
  id: string;
  category: string;
  author: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  likes_count: number;
}

interface Comment {
  id: string;
  name: string;
  message: string;
  created_at: string;
  parent_id: string | null;
}

export const NewsView: React.FC = () => {
  const { t } = useTranslation();
  const [news, setNews] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [scrollProgress, setScrollProgress] = useState(0);

  const [comments, setComments] = useState<Comment[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentForm, setCommentForm] = useState({ name: '', message: '' });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [hasLiked, setHasLiked] = useState<boolean>(false);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (news.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const articleId = params.get('article');
      if (articleId) {
        const article = news.find(n => n.id === articleId);
        if (article) setSelectedArticle(article);
      }
    }
  }, [news]);

  useEffect(() => {
    if (selectedArticle) {
      fetchComments(selectedArticle.id);
      setHasLiked(localStorage.getItem(`liked_${selectedArticle.id}`) === 'true');
    }
    
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(currentProgress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedArticle]);

  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('family_news').select('*').order('created_at', { ascending: false });
    if (!error && data) setNews(data);
    setLoading(false);
  };

  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('family_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (!error && data) setComments(data);
  };

  const handleLike = async () => {
    if (!selectedArticle || hasLiked) return;
    
    const newCount = (selectedArticle.likes_count || 0) + 1;
    
    // 1. Mise à jour Supabase
    const { error } = await supabase
      .from('family_news')
      .update({ likes_count: newCount })
      .eq('id', selectedArticle.id);

    if (!error) {
      // 2. Mise à jour de l'article ouvert
      setSelectedArticle({ ...selectedArticle, likes_count: newCount });
      
      // 3. Mise à jour de la liste générale (Crucial pour le compteur en page d'accueil)
      setNews(prevNews => prevNews.map(item => 
        item.id === selectedArticle.id ? { ...item, likes_count: newCount } : item
      ));

      setHasLiked(true);
      localStorage.setItem(`liked_${selectedArticle.id}`, 'true');
    }
  };

  const shareArticle = (platform: string) => {
    if (!selectedArticle) return;
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?article=${selectedArticle.id}`;
    const text = `Découvrez cette publication sur le Journal Familial : ${selectedArticle.title}`;
    
    const links: any = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareUrl)}`
    };

    if (platform === 'link') {
      navigator.clipboard.writeText(shareUrl);
      alert('Lien de l\'article copié !');
    } else {
      window.open(links[platform], '_blank');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !commentForm.name || !commentForm.message) return;

    setSubmittingComment(true);
    const { error } = await supabase.from('family_comments').insert([{ 
      post_id: selectedArticle.id, 
      name: commentForm.name, 
      message: commentForm.message,
      parent_id: replyingTo 
    }]);

    if (!error) {
      setCommentForm({ name: '', message: '' });
      setReplyingTo(null);
      fetchComments(selectedArticle.id);
    }
    setSubmittingComment(false);
  };

  const categories = ['all', ...Array.from(new Set(news.map(item => item.category)))];
  const filteredNews = news.filter(post => selectedCategory === 'all' || post.category === selectedCategory);
  const getCategoryCount = (cat: string) => cat === 'all' ? news.length : news.filter(n => n.category === cat).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Ouverture du journal...</p>
    </div>
  );

  if (selectedArticle) {
    return (
      <div className="animate-fadeIn max-w-4xl mx-auto pb-24 relative px-4">
        <div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-slate-100 dark:bg-slate-800">
          <div className="h-full bg-blue-600 transition-all duration-150" style={{ width: `${scrollProgress}%` }}></div>
        </div>

        <button onClick={() => { setSelectedArticle(null); window.history.pushState({}, '', window.location.pathname); }} className="mt-8 mb-8 flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest hover:-translate-x-2 transition-transform">
          <ArrowLeft size={14} /> Retour au journal
        </button>
        
        <img src={selectedArticle.image_url} className="w-full h-[300px] md:h-[500px] object-cover rounded-[40px] md:rounded-[60px] mb-12 shadow-2xl" alt="" />
        
        <div className="space-y-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedArticle.category}</span>
              <span className="text-slate-400 text-xs font-bold italic flex items-center gap-2">
                <Calendar size={14} /> {new Date(selectedArticle.created_at).toLocaleDateString()}
              </span>
            </div>
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-black text-[10px] transition-all ${hasLiked ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500'}`}
            >
              <Heart size={16} fill={hasLiked ? "currentColor" : "none"} /> {selectedArticle.likes_count || 0} J'AIME
            </button>
          </div>
          {/* COPIE CE BLOC SOUS LE <h2> DU TITRE DANS L'ARTICLE OUVERT */}
<div className="flex items-center gap-3 py-4 border-y border-slate-100 dark:border-slate-800">
  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600">
    <User size={20} />
  </div>
  <div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rédigé par</p>
    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedArticle.author || "Administrateur"}</p>
  </div>
</div>
<h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight italic tracking-tighter ">
  {selectedArticle.title}
</h2>

          <div className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-medium space-y-6 whitespace-pre-line border-l-4 border-blue-600/20 pl-6 md:pl-10">
            {selectedArticle.content}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Share2 size={14} /> Partager l'histoire :
            </span>
            <button onClick={() => shareArticle('facebook')} className="bg-[#1877F2] text-white px-6 py-2 rounded-full text-[10px] font-black hover:opacity-80 transition-all">Facebook</button>
            <button onClick={() => shareArticle('whatsapp')} className="bg-[#25D366] text-white px-6 py-2 rounded-full text-[10px] font-black hover:opacity-80 transition-all">WhatsApp</button>
            <button onClick={() => shareArticle('link')} className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-white px-6 py-2 rounded-full text-[10px] font-black hover:opacity-80 transition-all">Lien</button>
          </div>

          <div className="mt-12 bg-slate-50 dark:bg-slate-900/50 p-6 md:p-10 rounded-[40px] border-2 border-slate-200 dark:border-slate-800">
            <h4 className="text-2xl font-black italic mb-6 dark:text-white tracking-tighter flex items-center gap-3 uppercase">
              <MessageCircle className="text-blue-600" /> Discussion Familiale
            </h4>
            
            <form className="space-y-4 mb-12" onSubmit={handleCommentSubmit}>
              {replyingTo && (
                <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border-l-4 border-blue-600">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Réponse à : {comments.find(c => c.id === replyingTo)?.name}</span>
                  <button type="button" onClick={() => setReplyingTo(null)} className="text-[10px] font-black text-slate-400 hover:text-red-500">ANNULER</button>
                </div>
              )}
              <input type="text" placeholder="Ton nom" required value={commentForm.name} onChange={(e) => setCommentForm({...commentForm, name: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-none p-5 rounded-2xl outline-none focus:ring-2 ring-blue-600 dark:text-white shadow-sm font-bold" />
              <textarea placeholder={replyingTo ? "Écris ta réponse ici..." : "Laisse un message..."} required rows={3} value={commentForm.message} onChange={(e) => setCommentForm({...commentForm, message: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-none p-6 rounded-[30px] outline-none focus:ring-2 ring-blue-600 dark:text-white shadow-sm font-medium"></textarea>
              <button disabled={submittingComment} className="bg-blue-600 text-white px-10 py-4 rounded-[25px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-3 disabled:opacity-50">
                {submittingComment ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>} Envoyer
              </button>
            </form>

            <div className="space-y-8">
              {comments.filter(c => !c.parent_id).map(mainComment => (
                <div key={mainComment.id} className="space-y-4">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-[30px] shadow-sm border border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-blue-600 text-sm uppercase italic">{mainComment.name}</span>
                      <button onClick={() => setReplyingTo(mainComment.id)} className="flex items-center gap-1 text-[9px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase"><Reply size={12} /> Répondre</button>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm italic font-medium leading-relaxed">"{mainComment.message}"</p>
                  </div>
                  {comments.filter(r => r.parent_id === mainComment.id).map(reply => (
                    <div key={reply.id} className="ml-8 md:ml-12 bg-slate-100/50 dark:bg-slate-800/40 p-5 rounded-[25px] border-l-4 border-blue-600/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-slate-800 dark:text-slate-200 text-xs uppercase">{reply.name}</span>
                        <span className="text-[8px] font-bold text-slate-400">{new Date(reply.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs italic font-medium">{reply.message}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-12 pb-20 px-4">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-12 pt-10">
        <div>
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none uppercase">Journal <span className="text-blue-600">Familial</span></h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-4 italic max-w-lg">Nos moments, nos histoires, notre héritage.</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-3 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
            {cat === 'all' ? 'Tout le journal' : cat}
            <span className={`px-2 py-0.5 rounded-md text-[8px] ${selectedCategory === cat ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>({getCategoryCount(cat)})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {filteredNews.map(post => (
          <article key={post.id} className="group bg-white dark:bg-slate-900 rounded-[50px] overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all cursor-pointer" onClick={() => { setSelectedArticle(post); window.scrollTo(0,0); }}>
            <div className="h-64 relative overflow-hidden">
              <img src={post.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              <div className="absolute top-8 left-8 bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{post.category}</div>
            </div>
            <div className="p-8 md:p-12 space-y-4">
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Heart size={12} fill="#ef4444" className="text-red-500" /> {post.likes_count || 0}</span>
              </div>
              <h4 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight italic tracking-tighter group-hover:text-blue-600 transition-colors ">{post.title}</h4>
              {/* COPIE CE BLOC SOUS LE <h3> DU TITRE DANS LA LISTE */}
<div className="flex items-center gap-2 text-slate-400 text-xs font-bold italic">
  <User size={14} className="text-blue-600" />
  <span>Par {post.author || "Administrateur"}</span>
</div>
              <p className="text-slate-500 text-sm line-clamp-2 italic font-medium">{post.content.substring(0, 120)}...</p>
              <div className="pt-4 flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-3 transition-transform">Lire l'histoire <span className="text-lg">→</span></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};