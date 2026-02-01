import React, { useState } from 'react';
import { TrafficStats } from './TrafficStats';
import { TrafficAlerts } from './TrafficAlerts';
import { TrafficReport } from '../types';
import { TRAFFIC_REPORTS } from '../data/trafficData';


export const TrafficView: React.FC = () => {
  const [reports] = useState<TrafficReport[]>([
    {
      id: '1',
      road: 'RN1',
      type: 'Jam',
      status: 'Slow',
      severity: 'Medium',
      locationName: 'Bugarama',
      description: 'Heavy morning mist, trucks moving with caution.',
      timestamp: '12m ago',
      reporter: 'User881'
    },
    {
      id: '2',
      road: 'RN3',
      type: 'Obstacle',
      status: 'Blocked',
      severity: 'High',
      locationName: 'Rumonge',
      description: 'Temporary lane closure near lake shore.',
      timestamp: '45m ago',
      reporter: 'HighwayControl'
    }
  ]);

  return (
    <div className="animate-fadeIn space-y-12">
      {/* header inchangé */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAP */}
        <div className="lg:col-span-2">MAP PLACEHOLDER</div>

        {/* ALERTS */}
        <TrafficAlerts reports={reports} />
      </div>

      <TrafficStats reports={reports} />

    </div>
  );
};
