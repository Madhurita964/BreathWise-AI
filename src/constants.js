import {
  Activity,
  CalendarDays,
  House,
  Leaf,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export const NAV = [
  ['overview', 'Command center', Activity],
  ['forecast', 'Forecast advisor', Sparkles],
  ['routes', 'Safer routes', Route],
  ['family', 'Family shield', ShieldCheck],
  ['planner', 'Daily planner', CalendarDays],
  ['home', 'Clean air home', House],
  ['eco', 'Eco impact', Leaf],
  ['community', 'Community', Users],
];

export const CITIES = [
  {
    name: 'Kolkata',
    label: 'Kolkata, West Bengal, India',
    latitude: 22.5726,
    longitude: 88.3639,
    timezone: 'Asia/Kolkata',
  },
  {
    name: 'New Delhi',
    label: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 'Asia/Kolkata',
  },
  {
    name: 'Mumbai',
    label: 'Mumbai, Maharashtra, India',
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
  },
  {
    name: 'Bengaluru',
    label: 'Bengaluru, Karnataka, India',
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: 'Asia/Kolkata',
  },
  {
    name: 'London',
    label: 'London, United Kingdom',
    latitude: 51.5072,
    longitude: -0.1276,
    timezone: 'Europe/London',
  },
];

export const DEFAULT_PROFILES = [
  { id: 'sample-1', name: 'You', group: 'Adult' },
  { id: 'sample-2', name: 'Aarav', group: 'Child' },
  { id: 'sample-3', name: 'Grandma', group: 'Older adult' },
];
