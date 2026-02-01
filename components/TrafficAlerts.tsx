import React from 'react';
import { TrafficReport } from '../types';

interface TrafficAlertsProps {
  reports: TrafficReport[];
  limit?: number;
}

export const TrafficAlerts: React.FC<TrafficAlertsProps> = ({
  reports,
  limit
}) => {
  return (
    <div className="space-y-4">
      {reports.slice(0, limit ?? reports.length).map(r => (
        <div
          key={r.id}
          className={`p-6 rounded-[35px] border-2 shadow-sm ${
            r.severity === 'High'
              ? 'bg-red-50 border-red-100'
              : 'bg-white border-slate-50'
          }`}
        >
          <div className="flex justify-between mb-3">
            <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${
              r.severity === 'High' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
            }`}>
              {r.type}
            </span>
            <span className="text-[9px] font-black text-slate-400">
              {r.timestamp}
            </span>
          </div>

          <h4 className="font-black italic tracking-tight">
            {r.road} – {r.locationName}
          </h4>

          <p className="text-xs italic text-slate-500 mt-2">
            "{r.description}"
          </p>
        </div>
      ))}
    </div>
  );
};
