import React from 'react';
import { TrafficReport } from '../types';

interface TrafficStatsProps {
  reports: TrafficReport[];
  compact?: boolean; // 👈 pour HomeView
}

export const TrafficStats: React.FC<TrafficStatsProps> = ({
  reports,
  compact = false
}) => {
  const total = reports.length;
  const high = reports.filter(r => r.severity === 'High').length;
  const medium = reports.filter(r => r.severity === 'Medium').length;

  return (
    <div className={`grid grid-cols-3 gap-6 ${compact ? '' : 'mt-16'}`}>
      <div className="bg-white rounded-[35px] p-8 shadow-sm border">
        <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">
          Reports
        </p>
        <h4 className="text-4xl font-black mt-2">{total}</h4>
      </div>

      <div className="bg-amber-50 rounded-[35px] p-8 shadow-sm border border-amber-100">
        <p className="text-[9px] uppercase font-black tracking-widest text-amber-500">
          Medium
        </p>
        <h4 className="text-4xl font-black mt-2">{medium}</h4>
      </div>

      <div className="bg-red-50 rounded-[35px] p-8 shadow-sm border border-red-100">
        <p className="text-[9px] uppercase font-black tracking-widest text-red-600">
          High Risk
        </p>
        <h4 className="text-4xl font-black mt-2">{high}</h4>
      </div>
    </div>
  );
};
