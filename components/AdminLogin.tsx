import React, { useState } from 'react';
import { supabase } from '../src/supabaseClient';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Accès refusé. Identifiants invalides.");
      setLoading(false);
    } else {
      onLoginSuccess();
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 animate-fadeIn px-4">
      <div className="bg-white dark:bg-slate-900 rounded-[50px] p-10 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter dark:text-white">
            Admin <span className="text-blue-600">Gate</span>
          </h2>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Identification Requise</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Email</label>
            <input 
              type="email"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border-none p-5 rounded-2xl outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold italic"
              placeholder="admin@fsti.bi"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Clé d'accès</label>
            <input 
              type="password"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border-none p-5 rounded-2xl outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold italic"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase italic text-center">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-500/10 disabled:opacity-50"
          >
            {loading ? 'Authentification...' : 'Ouvrir le Terminal'}
          </button>
        </form>
      </div>
    </div>
  );
};