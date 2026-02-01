
import React from 'react';
import { RESTAURANTS } from '../constants.ts';

export const FoodView: React.FC = () => {
  return (
    <div className="animate-fadeIn space-y-12">
      <header className="border-b border-slate-200 pb-10 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-5xl font-black italic tracking-tighter text-slate-900">Flavor Hub</h2>
          <p className="text-slate-500 font-medium mt-2">Connecting Burundian kitchens to your node via secure transport.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-100">
          📍 Node: RN1 Bujumbura
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {RESTAURANTS.map(res => (
          <article key={res.id} className="bg-white rounded-[60px] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-2xl transition-all flex flex-col">
            <div className="h-72 relative overflow-hidden">
              <img src={res.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={res.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-10">
                <h3 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-lg">{res.name}</h3>
                <div className="flex gap-3 mt-2">
                  {res.cuisine.map(c => (
                    <span key={c} className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/20">{c}</span>
                  ))}
                </div>
              </div>
              <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl flex flex-col items-center">
                <span className="text-slate-900 font-black text-lg">★ {res.rating}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Rating</span>
              </div>
            </div>
            
            <div className="p-10 space-y-8 flex-1">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50 pb-6">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-600">🛵 {res.deliveryTime}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{res.deliveryFee.toLocaleString()} F Delivery</span>
                </div>
                <span className="text-slate-400">{res.province} Region</span>
              </div>

              <div className="space-y-4">
                 {res.menu.map(item => (
                   <div key={item.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-[35px] hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100 group/item">
                     <div className="flex-1">
                        <span className="font-black text-slate-900 text-lg block">{item.name}</span>
                        <p className="text-[10px] text-slate-400 font-medium italic mt-1">{item.description}</p>
                     </div>
                     <div className="flex items-center gap-6 ml-4">
                        <span className="font-black text-emerald-600 whitespace-nowrap">{item.price.toLocaleString()} F</span>
                        <button className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl hover:bg-emerald-600 hover:scale-110 active:scale-90 transition-all shadow-lg">+</button>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
