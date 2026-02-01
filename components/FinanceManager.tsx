import React, { useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { IncomeForm } from './IncomeForm';
import { TrendingDown, TrendingUp, MoreVertical } from 'lucide-react';

export const FinanceManager = ({ familyId }: { familyId: string }) => {
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchTransactions = async () => {
    const { data } = await supabase.from('finance_transactions')
      .select('*').eq('family_id', familyId).order('created_at', { ascending: false });
    if (data) setTransactions(data);
  };

  useEffect(() => { fetchTransactions(); }, [familyId]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <IncomeForm familyId={familyId} onSuccess={fetchTransactions} />

      <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h4 className="font-black uppercase text-xs tracking-widest">Flux Financiers</h4>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
              <th className="p-6">Description</th>
              <th>Type</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                <td className="p-6 font-bold text-slate-700">{t.description}</td>
                <td>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${t.type === 'revenu' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type}
                  </span>
                </td>
                <td className="font-black">{t.amount.toLocaleString()} FBU</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};