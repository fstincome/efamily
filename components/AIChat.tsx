
import React, { useState, useRef, useEffect } from 'react';
import { getMbanzaResponse } from '../services/geminiService.ts';

interface AIChatProps {
  currentView: string;
  userProvince?: string;
}

export const AIChat: React.FC<AIChatProps> = ({ currentView, userProvince }) => {
  const [messages, setMessages] = useState<{role: string, parts: {text: string}[]}[]>(() => {
    try {
      const saved = localStorage.getItem('hub_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { console.error("History restoration failed", e); }
    
    return [
      { role: 'model', parts: [{ text: "Amahoro! I am Mbanza, your national intelligence engine. How can I assist you today?" }] }
    ];
  });
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('hub_chat_history', JSON.stringify(messages.slice(-15)));
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg = { role: 'user', parts: [{ text: userText }] };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const responseText = await getMbanzaResponse(userText, { 
      view: currentView, 
      history: messages, 
      userProvince 
    });
    
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText || "I could not synchronize. Amahoro!" }] }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-[60px] shadow-2xl border-4 border-slate-900 overflow-hidden relative">
      <div className="p-8 bg-slate-900 text-white flex justify-between items-center relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
          <h3 className="font-black text-sm tracking-[0.2em] uppercase">Mbanza Core v2.5</h3>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/10 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[85%] px-8 py-6 rounded-[35px] text-[13px] font-medium leading-relaxed shadow-sm ${
              msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 border border-slate-100'
            }`}>
              {msg.parts?.[0]?.text || ""}
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-white border-t border-slate-100 relative z-10">
        <div className="flex gap-4">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query the hub intelligence..."
            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-[30px] px-10 py-6 outline-none focus:border-emerald-500 font-black text-slate-900 text-sm"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-all shadow-xl ${
              input.trim() ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-300'
            }`}
          >
            ↗
          </button>
        </div>
      </div>
    </div>
  );
};
