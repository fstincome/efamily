import { TrafficReport } from '../types';

export const TRAFFIC_REPORTS: TrafficReport[] = [
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
];
