
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrafficReport } from '../types.ts';

interface TrafficStatsProps {
  reports: TrafficReport[];
}

const COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981'
};

export const TrafficStats: React.FC<TrafficStatsProps> = ({ reports }) => {
  const roadData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => {
      counts[r.road] = (counts[r.road] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [reports]);

  const severityData = useMemo(() => {
    const counts: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    reports.forEach(r => {
      if (r.severity in counts) {
        counts[r.severity]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reports]);

  if (!reports || reports.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
      <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm">
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Incident Density</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Frequency per National Route (RN)</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roadData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" fill="#10b981" radius={[10, 10, 10, 10]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm">
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Severity Distribution</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Impact categorization</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={8} dataKey="value">
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
