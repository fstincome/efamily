import React, { useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { Plus, Loader2, Banknote, AlertCircle } from 'lucide-react';

export const IncomeForm = ({ familyId, onSuccess }: { familyId: string, onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg("Entrez un montant valide.");
      return;
    }

    setLoading(true);

    try {
      // 1. Vérification de la session avant d'envoyer
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }

      // 2. Insertion du revenu
      const { error } = await supabase.from('finance_transactions').insert([{
        family_id: familyId,
        type: 'revenu',
        amount: parseFloat(amount),
        description: description || 'Revenu global sans description',
        category: 'Entrée d\'argent'
      }]);

      if (error) throw error;

      // Succès
      setAmount('');
      setDescription('');
      onSuccess(); 
      
    } catch (err: any) {
      console.error("Erreur transaction:", err);
      // Gestion spécifique du JWT Expired
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
    <div className="bg-white p-8 rounded-[40px] border-2 border-emerald-100 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
        <Banknote size={64} className="text-emerald-600" />
      </div>
      
      <h4 className="text-sm font-black uppercase mb-6 text-emerald-600 flex items-center gap-2">
        <Plus size={16} /> Injecter un Revenu
      </h4>

      {errorMsg && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold flex items-center gap-2 rounded-r-xl animate-shake">
          <AlertCircle size={16} /> {errorMsg}
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
          disabled={loading}
          className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
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