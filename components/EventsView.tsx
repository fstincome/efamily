
import React from 'react';
import { MOCK_EVENTS } from '../constants.ts';

export const EventsView: React.FC = () => {
  return (
    <div className="animate-fadeIn space-y-12">
      <header className="border-b border-slate-200 pb-10">
        <h2 className="text-5xl font-black italic tracking-tighter text-slate-900">Cultural Pulse</h2>
        <p className="text-slate-500 font-medium mt-2">Burundi's festivals and celebrations.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {MOCK_EVENTS.map(ev => (
          <article key={ev.id} className="bg-white rounded-[60px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
            <div className="h-80 relative overflow-hidden">
              <img src={ev.image} className="w-full h-full object-cover" alt={ev.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
              <div className="absolute bottom-10 left-12 text-white">
                <h3 className="text-5xl font-black italic tracking-tighter leading-none">{ev.title}</h3>
              </div>
            </div>
            <div className="p-12 flex-1 space-y-8 flex flex-col">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>{ev.venue} • {ev.province}</span>
                <span>{ev.date}</span>
              </div>
              <div className="space-y-4">
                {ev.tiers.map(t => (
                  <button key={t.name} className="w-full flex justify-between items-center p-7 bg-slate-50 rounded-[40px] hover:bg-emerald-50 transition-all">
                    <span className="font-black text-slate-900 uppercase text-xs">{t.name} Pass</span>
                    <span className="font-black text-xl text-emerald-600">{t.price.toLocaleString()} F</span>
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
