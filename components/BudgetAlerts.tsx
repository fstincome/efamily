import React from 'react';
import { AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

export const BudgetAlerts = ({ stats, transactions }: any) => {
  // Calculer le total des dépenses réelles par catégorie (KPI)
  const calculateCategorySpend = (catName: string) => {
    return transactions
      ?.filter((t: any) => t.type === 'depense' && t.category === catName)
      .reduce((acc: number, t: any) => acc + t.amount, 0) || 0;
  };

  // Exemple pour l'Alimentation (Limite 26.7% du Revenu Global)
  // On estime le revenu global à partir du total_balance + dépenses déjà faites
  const estimatedTotalIncome = (stats?.total_balance || 0) + 
    (transactions?.filter((t: any) => t.type === 'depense').reduce((acc: any, t: any) => acc + t.amount, 0) || 0);
  
  const foodSpend = calculateCategorySpend('Alimentation');
  const foodLimit = estimatedTotalIncome * 0.267;
  const isOverFood = foodSpend > foodLimit;

  if (foodSpend === 0 && !isOverFood) return null;

  return (
    <div className="space-y-4 mb-10">
      {isOverFood ? (
        <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[35px] flex items-center gap-6 animate-pulse">
          <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
            <Flame size={28} />
          </div>
          <div>
            <h4 className="text-red-600 font-black uppercase text-[10px] tracking-widest">Alerte Dépassement : Alimentation</h4>
            <p className="text-slate-900 font-bold text-sm">
              Vous avez dépassé le quota de 26.7%. Excès de <span className="text-red-600">{(foodSpend - foodLimit).toLocaleString()} FBU</span>.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[35px] flex items-center gap-6">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h4 className="text-emerald-600 font-black uppercase text-[10px] tracking-widest">Node Santé : Optimal</h4>
            <p className="text-slate-900 font-bold text-sm">Toutes les dépenses sont conformes au plan 50/30/20.</p>
          </div>
        </div>
      )}
    </div>
  );
};