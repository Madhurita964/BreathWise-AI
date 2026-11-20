export const GROUPS = ['Adult', 'Child', 'Older adult', 'Outdoor worker'];
export function severity(value) {
  if (!Number.isFinite(value))
    return { label: 'Unavailable', short: 'Unavailable', color: '#879aab', level: 0 };
  if (value <= 50) return { label: 'Good', short: 'Good', color: '#45d6a4', level: 0 };
  if (value <= 100)
    return { label: 'Moderate', short: 'Moderate', color: '#efcc70', level: 1 };
  if (value <= 150)
    return {
      label: 'Unhealthy for sensitive groups',
      short: 'Sensitive groups',
      color: '#f0ac6e',
      level: 2,
    };
  if (value <= 200)
    return { label: 'Unhealthy', short: 'Unhealthy', color: '#f28185', level: 3 };
  if (value <= 300)
    return {
      label: 'Very unhealthy',
      short: 'Very unhealthy',
      color: '#c69ef7',
      level: 4,
    };
  return { label: 'Hazardous', short: 'Hazardous', color: '#dc729e', level: 5 };
}
export function advice(aqi, group = 'Adult') {
  const s = severity(aqi);
  if (s.level >= 3)
    return `${group === 'Outdoor worker' ? 'Build in indoor breaks and reduce strenuous outdoor tasks.' : 'Choose indoor activities and shorten outdoor time.'} If you must go out, consider a well-fitting particulate respirator; it does not filter gases.`;
  if (s.level >= 2)
    return group === 'Adult'
      ? 'Reduce prolonged or intense outdoor exertion if you develop symptoms. Choose a lower-pollution time when possible.'
      : 'Reduce prolonged or strenuous outdoor activity. Plan indoor breaks and follow any personal care plan.';
  if (s.level === 1)
    return group === 'Child' || group === 'Older adult'
      ? 'Unusually sensitive people may need shorter outdoor sessions. Watch for symptoms.'
      : 'Most people can continue normal activity. Check local conditions before prolonged exercise.';
  return 'A reasonable time for normal outdoor activity. Keep checking conditions and your own comfort.';
}
export function getWindows(data) {
  return (data?.hourly || [])
    .filter((x) => x.kind === 'forecast' && Number.isFinite(x.aqi))
    .slice(0, 24)
    .sort((a, b) => a.aqi - b.aqi);
}
export function makePlan(data, activities, profiles = []) {
  const windows = getWindows(data);
  if (!windows.length) return [];
  const used = new Set();
  const sensitive = profiles.some((p) => p.group !== 'Adult');
  return activities
    .map((activity) => {
      const limits = /school|drop.off/i.test(activity)
        ? [7, 10]
        : /morning|breakfast/i.test(activity)
          ? [6, 11]
          : /evening|dinner/i.test(activity)
            ? [16, 21]
            : /lunch|noon/i.test(activity)
              ? [12, 15]
              : [7, 21];
      const candidates = windows.filter((x) => {
        const hour = Number(
          new Intl.DateTimeFormat('en-GB', {
            hour: 'numeric',
            hourCycle: 'h23',
            timeZone: data.timezone || 'UTC',
          }).format(new Date(x.time))
        );
        return hour >= limits[0] && hour < limits[1] && !used.has(x.time);
      });
      const slot = candidates[0];
      if (!slot)
        return {
          activity,
          time: null,
          aqi: null,
          indoor: true,
          recommendation:
            'No matching forecast window is available for this activity’s time of day. Keep your required schedule and recheck conditions; consider an indoor alternative if feasible.',
        };
      used.add(slot.time);
      return {
        activity,
        time: slot.time,
        aqi: slot.aqi,
        indoor: slot.aqi > (sensitive ? 100 : 150),
        recommendation: advice(slot.aqi, sensitive ? 'Child' : 'Adult'),
      };
    })
    .sort((a, b) => (a.time || 'z').localeCompare(b.time || 'z'));
}
export const FACTORS = { car: 0.171, bus: 0.105, rail: 0.035, cycle: 0, walk: 0 };
export function ecoSavings({
  km = 10,
  days = 5,
  mode = 'bus',
  kwh = 0,
  grid = 0.7,
  reusable = 0,
}) {
  const travel =
    Number(km) * Number(days) * (FACTORS.car - (FACTORS[mode] ?? FACTORS.bus));
  const energy = Number(kwh) * Number(grid);
  const products = Number(reusable) * 0.02;
  return {
    travel,
    energy,
    products,
    weekly: travel + energy + products,
    annual: (travel + energy + products) * 52,
  };
}
export function demoAir(
  location = { name: 'Kolkata', latitude: 22.5726, longitude: 88.3639 }
) {
  const now = Math.floor(Date.now() / 3600000) * 3600000;
  const hourly = Array.from({ length: 73 }, (_, i) => {
    const t = now + (i - 24) * 3600000;
    const wave = Math.sin(((i - 6) * Math.PI) / 12);
    return {
      time: new Date(t).toISOString(),
      aqi: Math.round(
        128 + 30 * Math.sin(((i - 24) * Math.PI) / 12) + 6 * (Math.cos(i) - Math.cos(24))
      ),
      pm25: Math.round((46.2 + 14 * Math.sin(((i - 24) * Math.PI) / 12)) * 10) / 10,
      kind: t <= now ? 'history' : 'forecast',
    };
  });
  return {
    location,
    mode: 'demo',
    kind: 'illustrative',
    source: 'BREATHEWISE sample dataset',
    sourceUrl: null,
    time: new Date(now).toISOString(),
    fetchedAt: new Date().toISOString(),
    timezone: 'Asia/Kolkata',
    current: { aqi: 128, pm25: 46.2, pm10: 79.8, no2: 24.6, o3: 38.1, so2: 8.2, co: 320 },
    weather: { temperature: 26, humidity: 64, wind: 8.4, kind: 'illustrative' },
    hourly,
    resolution: 'Illustrative data, not local measurements',
    notice:
      'Demo dataset · All values and trends are illustrative. Switch to model data to request Open-Meteo / CAMS.',
  };
}
export function homeGuidance(room, budget, aqi, sources = []) {
  const high = aqi > 100;
  return [
    {
      title: high ? 'Time your ventilation' : 'Use short, targeted ventilation',
      text: high
        ? 'Keep outdoor-facing windows closed during pollution peaks. Ventilate briefly when outdoor conditions improve.'
        : 'Ventilate when outdoor air is cleaner; avoid busy-road windows during traffic peaks.',
    },
    {
      title:
        room === 'Kitchen'
          ? 'Capture cooking smoke at the source'
          : 'Reduce particles at the source',
      text:
        room === 'Kitchen'
          ? 'Use an extractor vented outdoors while cooking. Prefer back burners and avoid burning food.'
          : 'Damp-dust surfaces and wet-mop. Avoid dry sweeping and smoke indoors.',
    },
    {
      title:
        budget < 3000 ? 'Start with source control' : 'Choose filtration for the room',
      text:
        budget < 3000
          ? 'Prioritize damp cleaning, smoke reduction and sealing obvious dust gaps. Plants are not a substitute for filtration.'
          : `Consider a HEPA purifier with a clean-air delivery rate matched to room volume (roughly 4–5 air changes per hour). Budget ₹${budget.toLocaleString('en-IN')} is a planning limit, not a product quote. Avoid ozone-generating devices.`,
    },
    ...sources.map((s) => ({
      title: `Reduce ${s.toLowerCase()}`,
      text:
        s === 'Incense'
          ? 'Reduce burning incense; use smoke-free alternatives.'
          : s === 'Cooking smoke'
            ? 'Use outdoor-vented extraction; a recirculating hood may not remove gases.'
            : s === 'Dust'
              ? 'Use damp cleaning and remove shoes at the entrance.'
              : 'Keep tobacco smoke outside and away from doors and windows.',
    })),
  ];
}
