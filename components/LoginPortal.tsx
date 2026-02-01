import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Importation du hook
import { supabase } from '../src/supabaseClient';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, ShieldAlert } from 'lucide-react';

export const LoginPortal: React.FC = () => {
  const { t } = useTranslation(); // Initialisation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const identifier = email.trim();
    const secret = password.trim();

    try {
      // 1. Test Admin (Logique inchangée)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: secret,
      });

      if (!authError && authData.session) {
        window.location.href = '/';
        return;
      }

      // 2. Test Talent (Logique inchangée)
      const { data: talent } = await supabase
        .from('talents')
        .select('*')
        .eq('email', identifier)
        .eq('access_key', secret.toUpperCase())
        .single();

      if (talent) {
        localStorage.setItem('fsti_user', JSON.stringify({ ...talent, role: 'participant' }));
        window.location.href = '/';
        return;
      }

      // 3. Test Coach (Logique inchangée)
      const { data: coach } = await supabase
        .from('coaches')
        .select('*')
        .eq('email', identifier)
        .eq('access_key', secret.toUpperCase())
        .single();

      if (coach) {
        localStorage.setItem('fsti_user', JSON.stringify({ ...coach, role: 'coach' }));
        window.location.href = '/user-dashboard';
        return;
      }

      // 4. NOUVEAU : Test Recruteur (Boss)
      const { data: recruiter } = await supabase
        .from('recruiters')
        .select('*')
        .eq('email', identifier)
        .eq('access_key', secret.toUpperCase())
        .single();

      if (recruiter) {
        localStorage.setItem('fsti_user', JSON.stringify({ ...recruiter, role: 'recruiter' }));
        // Redirection vers le dashboard recruteur
        window.location.href = '/'; 
        return;
      }

      // Si aucun des tests n'est concluant
      setErrorMsg(t('login_error_denied'));
      
    } catch (err) {
      setErrorMsg(t('login_error_hub'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-[50px] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <ShieldCheck size={32} className="text-white dark:text-black" />
          </div>

          <h2 className="text-4xl font-black italic uppercase tracking-tighter dark:text-white mb-2">
            Elite <span className="text-blue-600">Access</span>
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left mt-8">
            {/* EMAIL */}
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                required
                type="email" 
                placeholder={t('login_placeholder_email')} 
                className="w-full p-5 pl-14 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 dark:text-white font-bold italic transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD / CODE FSTI */}
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                required
                type={showPassword ? "text" : "password"} 
                placeholder={t('login_placeholder_pass')} 
                className="w-full p-5 pl-14 pr-14 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 dark:text-white font-bold italic transition-all"
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {errorMsg && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-xl">
                <ShieldAlert size={16} className="text-red-500" />
                <p className="text-red-500 text-[10px] font-black uppercase italic">{errorMsg}</p>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3"
            >
              {loading ? t('login_btn_loading') : t('login_btn_submit')}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};