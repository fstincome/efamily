import React, { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import { NEW_PROVINCES } from '../constants.ts';
import { getMbanzaResponse } from '../services/geminiService.ts';
import { Loader2, Sparkles, MapPin } from 'lucide-react';

interface NewsListProps {
  showFilter?: boolean;
  limit?: number;
}

export const NewsList: React.FC<NewsListProps> = ({ showFilter = true, limit }) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<any>({});
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    let query = supabase.from('news').select('*').order('created_at', { ascending: false });
    if (limit) query = query.limit(limit);
    
    const { data } = await query;
    if (data) setNews(data);
    setLoading(false);
  };

  const handleAIAnalysis = async (id: string, title: string, content: string) => {
    if (summaries[id]) return;
    setSummaries((prev: any) => ({ ...prev, [id]: { loading: true } }));

    const prompt = `En tant qu'expert en transformation digitale 2025, analyse l'impact national de cet événement familial/local : ${title}. Contenu : ${content.substring(0, 300)}`;

    const response = await getMbanzaResponse(prompt, { view: 'news', history: [], advanced: true });
    setSummaries((prev: any) => ({ ...prev, [id]: { text: response, loading: false } }));
  };

  const filteredNews = news.filter(n => selectedProvince === 'all' || n.province_tag === selectedProvince);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-12">
      {showFilter && (
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-[30px] border border-slate-100 dark:border-slate-800 shadow-sm max-w-md">
          <MapPin size={20} className="text-blue-600 ml-2" />
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="w-full bg-transparent font-black text-[10px] uppercase tracking-widest outline-none dark:text-white"
          >
            <option value="all">Toutes les régionskkk</option>
            {NEW_PROVINCES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {filteredNews.map((item) => (
          <article key={item.id} className="group bg-white dark:bg-slate-900 rounded-[50px] overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all">
            <div className="h-64 relative overflow-hidden">
              <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
              <div className="absolute top-6 left-6 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase">{item.category}</div>
            </div>
            
            <div className="p-10 space-y-6">
              <h3 className="text-2xl font-black italic tracking-tighter dark:text-white leading-tight">{item.title}</h3>
              
              {summaries[item.id]?.text ? (
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[30px] border border-blue-100 dark:border-blue-800/50 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
                    <Sparkles size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Analyse IA Mbanza</span>
                  </div>
                  <p className="text-xs font-medium italic text-slate-600 dark:text-blue-200 leading-relaxed">{summaries[item.id].text}</p>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 italic">{item.content}</p>
              )}

              <button
                onClick={() => handleAIAnalysis(item.id, item.title, item.content)}
                disabled={summaries[item.id]?.loading}
                className="w-full flex items-center justify-center gap-3 border-2 border-slate-100 dark:border-slate-800 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all dark:text-white disabled:opacity-50"
              >
                {summaries[item.id]?.loading ? <Loader2 className="animate-spin" size={14} /> : <><Sparkles size={14} /> Intelligence Artificielle</>}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};