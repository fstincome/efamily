
import React, { useState } from 'react';

export const UtilitiesView: React.FC = () => {
  const [step, setStep] = useState(1);
  const [service, setService] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 2500);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn bg-white p-12 lg:p-20 rounded-[80px] shadow-2xl border border-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

      {step === 1 && (
        <div className="space-y-12">
          <div className="space-y-4">
            <h3 className="text-5xl font-black italic tracking-tighter text-slate-900">Digital Wallet</h3>
            <p className="text-slate-400 font-medium">Instant synchronization with REGIDESO and national providers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={() => { setService('Electricity'); setStep(2); }} className="p-12 rounded-[50px] border-4 border-slate-50 bg-amber-50/10 hover:border-amber-500 transition-all group flex flex-col items-center gap-6">
              <span className="text-7xl group-hover:scale-125 transition-transform duration-500">⚡</span>
              <span className="font-black text-xs uppercase tracking-[0.3em] text-amber-700">Electricity</span>
            </button>
            <button onClick={() => { setService('Water'); setStep(2); }} className="p-12 rounded-[50px] border-4 border-slate-50 bg-blue-50/10 hover:border-blue-500 transition-all group flex flex-col items-center gap-6">
              <span className="text-7xl group-hover:scale-125 transition-transform duration-500">💧</span>
              <span className="font-black text-xs uppercase tracking-[0.3em] text-blue-700">Water</span>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-10">
          <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 hover:text-slate-900 transition-colors">← Change Service</button>
          <h3 className="text-4xl font-black italic text-slate-900">Node Credentials</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-5">Account / Meter ID</label>
              <input type="text" placeholder="e.g. 0412-XXXX" className="w-full bg-slate-50 border-none p-8 rounded-[40px] font-black text-2xl outline-none focus:ring-4 ring-emerald-500/10" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-5">Amount (BIF)</label>
              <input type="number" placeholder="5,000" className="w-full bg-slate-50 border-none p-8 rounded-[40px] font-black text-2xl outline-none focus:ring-4 ring-emerald-500/10" />
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-slate-900 text-white py-8 rounded-[40px] font-black text-xl shadow-2xl hover:bg-emerald-600 transition-all active:scale-95">Lock Transaction</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-10">
          <h3 className="text-4xl font-black italic text-slate-900">Payment Node</h3>
          <div className="grid grid-cols-2 gap-4">
            {['Lumicash', 'Ecocash', 'Visa', 'Bancobu'].map(m => (
              <button key={m} onClick={handlePay} className="p-8 bg-slate-50 rounded-[35px] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-transparent hover:border-emerald-400">
                {m}
              </button>
            ))}
          </div>
          {loading && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Syncing with Central Bank...</p>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="text-center space-y-10 py-10 animate-fadeIn">
          <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-6xl mx-auto shadow-inner border-8 border-white ring-8 ring-emerald-50">✓</div>
          <div className="space-y-3">
            <h3 className="text-5xl font-black italic text-slate-900 tracking-tighter">Verified</h3>
            <p className="text-slate-400 font-medium">Transaction broadcasted successfully.</p>
          </div>
          <div className="bg-slate-950 p-10 rounded-[50px] shadow-2xl">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 block mb-4">Node Token ID</span>
            <span className="text-white font-mono text-4xl tracking-[0.3em]">8812-4409</span>
          </div>
          <button onClick={() => setStep(1)} className="text-xs font-black uppercase text-emerald-600 underline tracking-widest">New Transaction</button>
        </div>
      )}
    </div>
  );
};
