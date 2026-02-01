import React, { useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { Plus, Loader2, Banknote, AlertCircle, CheckCircle2 } from 'lucide-react';

export const IncomeForm = ({ familyId, onSuccess }: { familyId: string, onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // Nouvel état
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setShowSuccess(false);

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg("Entrez un montant valide.");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }

      const { error } = await supabase.from('finance_transactions').insert([{
        family_id: familyId,
        type: 'revenu',
        amount: parseFloat(amount),
        description: description || 'Revenu global sans description',
        category: 'Entrée d\'argent'
      }]);

      if (error) throw error;

      // --- EFFET DE SUCCÈS ---
      setAmount('');
      setDescription('');
      setShowSuccess(true);
      
      // On attend 800ms pour laisser le trigger SQL finir sa répartition
      setTimeout(() => {
        onSuccess();
        setTimeout(() => setShowSuccess(false), 3000); // Cache le message après 3s
      }, 800);
      
    } catch (err: any) {
      console.error("Erreur transaction:", err);
      if (err.message?.includes('JWT') || err.status === 401) {
        setErrorMsg("Votre session a expiré. Déconnectez-vous et reconnectez-vous.");
      } else {
        setErrorMsg(err.message || "Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white p-8 rounded-[40px] border-2 transition-all duration-500 shadow-sm relative overflow-hidden group ${showSuccess ? 'border-emerald-500 bg-emerald-50/30' : 'border-emerald-100'}`}>
      
      {/* Animation d'arrière-plan */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
        <Banknote size={64} className="text-emerald-600" />
      </div>
      
      <h4 className="text-sm font-black uppercase mb-6 text-emerald-600 flex items-center gap-2">
        <Plus size={16} /> Injecter un Revenu
      </h4>

      {errorMsg && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold flex items-center gap-2 rounded-r-xl animate-bounce">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {showSuccess && (
        <div className="mb-4 p-4 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-3 rounded-2xl shadow-lg shadow-emerald-200 animate-in fade-in zoom-in">
          <CheckCircle2 size={20} /> Répartition automatique effectuée !
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input 
            type="number" 
            placeholder="0.00" 
            className="w-full bg-slate-50 p-5 rounded-3xl font-black text-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            required
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">FBU</span>
        </div>

        <input 
          type="text" 
          placeholder="Source (ex: Salaire, Vente...)" 
          className="w-full bg-slate-50 p-5 rounded-3xl font-bold text-sm outline-none border-2 border-transparent focus:border-emerald-100 transition-all"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />

        <button 
          type="submit"
          disabled={loading || showSuccess}
          className={`w-full py-5 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all flex justify-center items-center gap-3 ${showSuccess ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-emerald-600 hover:scale-[1.02]'}`}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : showSuccess ? (
            "Argent Réparti ✅"
          ) : (
            <>
              <Plus size={20} /> Confirmer l'encaissement
            </>
          )}
        </button>
      </form>
    </div>
  );
};