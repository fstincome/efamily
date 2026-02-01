import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Copy, Check, MessageSquarePlus, Lock } from 'lucide-react';
import { supabase } from '../src/supabaseClient'; // Assure-toi que le chemin est correct

const API_KEY = import.meta.env.VITE_PPQ_KEY;
const ENDPOINT = "https://api.ppq.ai/chat/completions";
const MODEL = "gpt-4o";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  suggestions?: string[];
}

export const MbanzaChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Bienvenue dans l'espace privé de la famille. Je suis Hyady AI, prêt à vous aider. Que souhaitez-vous savoir aujourd'hui ?", 
      sender: 'bot',
      suggestions: ["Taches encours ?", "Prochain événement ?", "Météo locale et climat aujourd;hui?"]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [session, setSession] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Vérification de la connexion familiale
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    e?.preventDefault();
    if (!session) return; // Sécurité supplémentaire
    const messageText = customText || input;
    if (!messageText.trim() || isTyping) return;

    setMessages(prev => [...prev, { id: Date.now(), text: messageText, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { 
              role: "system", 
              content: "Tu es Hyady AI, l'IA privée de la famille. Réponds de façon chaleureuse et concise. À la fin, génère 3 suggestions au format : SUGGESTIONS: q1; q2; q3" 
            },
            { role: "user", content: messageText }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      let rawText = data.choices[0].message.content;
      
      let suggestions: string[] = [];
      if (rawText.includes("SUGGESTIONS:")) {
        const parts = rawText.split("SUGGESTIONS:");
        rawText = parts[0].trim();
        suggestions = parts[1].split(";").map((s: string) => s.trim()).filter((s: string) => s !== "");
      }

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: rawText, 
        sender: 'bot', 
        suggestions: suggestions.length > 0 ? suggestions : undefined 
      }]);

    } catch (error: any) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Désolé, j'ai eu un petit souci technique.", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Écran d'accès refusé pour les étrangers
  if (!session) {
    return (
      <div className="max-w-4xl mx-auto h-[80vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-[50px] border-2 border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
          <Lock size={40} />
        </div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 dark:text-white">Accès Réservé</h2>
        <p className="text-slate-500 font-bold italic max-w-sm">
          "Je ne réponds pas aux étrangers. Cet espace appartient à la famille. Veuillez vous connecter pour discuter avec moi."
        </p>
        <button 
          onClick={() => window.location.href = '/login'} // Ajuste vers ta page de login
          className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
        >
          Se connecter au Hub
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-[50px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
      
      {/* BACKGROUND IMAGE AVEC OPACITÉ RÉDUITE */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.1]" 
        style={{ 
          backgroundImage: "url('/70.jpg')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      />

      {/* HEADER */}
      <div className="p-6 bg-slate-900/90 backdrop-blur-md text-white flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot size={28} />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tighter">Hyady AI-Faites vos recherches </h3>
            <span className="text-[12px] text-emerald-400 font-black italic">Espace familial sécurisé • Membre Connecté</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-slate-400">{session.user.email.split('@')[0]}</span>
            <Sparkles className="text-blue-500 animate-pulse" />
        </div>
      </div>

      {/* CHAT ZONE */}
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-8 bg-transparent z-10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col animate-fadeIn ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              
              <div className="relative group">
                <div className={`p-5 rounded-[25px] font-bold text-sm italic shadow-md transition-all ${
                  msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white/90 dark:bg-slate-800/90 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700 backdrop-blur-sm'
                }`}>
                  {msg.text}
                </div>
                {msg.sender === 'bot' && (
                  <button onClick={() => copyToClipboard(msg.text, msg.id)} className="absolute -right-10 top-2 p-2 bg-white dark:bg-slate-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedId === msg.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-400" />}
                  </button>
                )}
              </div>
            </div>

            {msg.suggestions && msg.suggestions.length > 0 && !isTyping && (
              <div className="mt-4 flex flex-wrap gap-2 ml-11">
                {msg.suggestions.map((sug, idx) => (
                  <button key={idx} onClick={() => handleSendMessage(undefined, sug)} className="px-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-tighter border border-blue-100 dark:border-blue-800 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 shadow-sm">
                    <MessageSquarePlus size={12} /> {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start ml-11 animate-pulse">
            <div className="bg-blue-600/10 text-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase border border-blue-600/20 backdrop-blur-sm">
              Mbanza réfléchit...
            </div>
          </div>
        )}
      </div>

      {/* INPUT ZONE */}
      <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 z-10">
        <form onSubmit={handleSendMessage} className="flex gap-4 p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-[30px] border border-transparent focus-within:border-blue-600 transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez vos questions ici..." 
            className="flex-1 bg-transparent p-4 outline-none font-bold italic dark:text-white text-sm"
          />
          <button type="submit" disabled={isTyping} className="bg-blue-600 text-white p-4 rounded-[25px] hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};