import React, { useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { X, Loader2 } from 'lucide-react';

interface FinanceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const FinanceForm: React.FC<FinanceFormProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'depense',
    budget_type: 'essentiel',
    category: 'Alimentation'
  });

  // Liste des catégories basée sur ton besoin 50/30/20
  const categories: Record<string, string[]> = {
    essentiel: ['Alimentation', 'Logement', 'Eau/Élec', 'Transport', 'Communication'],
    developpement: ['Scolarité', 'Santé', 'Aide familiale', 'Vêtements'],
    epargne: ['Sécurité', 'Projets (Terrain/Business)']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.from('finance_transactions').insert([{
      ...formData,
      amount: parseFloat(formData.amount)
    }]);

    if (!error) {
      onSuccess();
      onClose();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white w-full max-w-lg rounded-[40px] p-10 relative shadow-2xl border border-slate-100">
      <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600">
        <X size={24} />
      </button>

      <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter italic text-slate-800">💰 Flux Financier</h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block">Description</label>
            <input 
              required
              className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Ex: Courses mensuelles"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block">Montant (€)</label>
            <input 
              type="number" required
              className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block">Règle Budget</label>
            <select 
              className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none"
              value={formData.budget_type}
              onChange={(e) => setFormData({...formData, budget_type: e.target.value})}
            >
              <option value="essentiel">50% Essentiel</option>
              <option value="developpement">30% Développement</option>
              <option value="epargne">20% Épargne</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block">Catégorie Spécifique</label>
          <select 
            className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            {categories[formData.budget_type as keyof typeof categories].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-slate-900 text-white py-5 rounded-[25px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Enregistrer la donnée"}
        </button>
      </form>
    </div>
  );
};