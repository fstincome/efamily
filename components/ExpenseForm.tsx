import React, { useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { X, ArrowDownCircle, Loader2 } from 'lucide-react';

export const ExpenseForm = ({ familyId, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentation'); // Valeur par défaut
  const [note, setNote] = useState('');

  // LISTE SYNCHRONISÉE AVEC LE TRIGGER SQL
  // Attention : Les noms doivent être identiques à ceux du script SQL (CASE WHEN)
  const categories = [
    { label: "Alimentation", value: "Alimentation" },
    { label: "Loyer & Entretien", value: "Loyer" },
    { label: "Eau + Électricité", value: "Eau/Electricité" },
    { label: "Transport", value: "Transport" },
    { label: "Communication", value: "Communication" },
    { label: "Scolarité", value: "Scolarité" },
    { label: "Santé", value: "Santé" },
    { label: "Aide Familiale", value: "Aide Familiale" },
    { label: "Vêtements", value: "Vêtements" },
    { label: "Épargne de Sécurité", value: "Epargne" },
    { label: "Projets (Maison/Business)", value: "Projets" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Veuillez entrer un montant valide");
      return;
    }
  
    setLoading(true);
  
    // Insertion dans la table des transactions
    // Le trigger handle_finance_final() s'occupera du reste
    const { error } = await supabase.from('finance_transactions').insert([{
      family_id: familyId,
      type: 'depense',
      amount: numericAmount,
      description: note || `Dépense : ${category}`,
      category: category // C'est cette valeur qui pilote le trigger
    }]);
  
    if (!error) {
      onSuccess(); 
    } else {
      console.error(error);
      alert("Erreur Base de données : " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-xl rounded-[50px] shadow-2xl overflow-hidden animate-slideUp">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-red-600">
            <ArrowDownCircle size={30}/> Sortie de fonds
          </h3>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Montant FBU</label>
              <input 
                type="number" 
                required 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className="w-full bg-slate-50 p-5 rounded-3xl text-2xl font-black outline-none focus:ring-2 focus:ring-red-500 transition-all" 
                placeholder="0.00" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Catégorie KPI</label>
              <div className="relative">
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="w-full bg-slate-50 p-5 rounded-3xl font-black text-sm outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-red-500"
                >
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                    <ArrowDownCircle size={16}/>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Note / Détails</label>
            <input 
              type="text" 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              className="w-full bg-slate-50 p-5 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-slate-200 transition-all" 
              placeholder="Ex: Facture Regideso, Achat médicaments..." 
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-slate-900 text-white py-6 rounded-[30px] font-black uppercase text-xs tracking-widest flex justify-center items-center gap-3 hover:bg-red-600 transition-all shadow-xl shadow-red-100 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin"/> : "Confirmer le retrait"}
          </button>
        </form>
      </div>
    </div>
  );
};