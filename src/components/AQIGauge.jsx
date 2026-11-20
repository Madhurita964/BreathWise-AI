import { severity } from '../domain';
import { fmt } from '../lib/helpers';

export function AQIGauge({ value }) {
  const s = severity(value);
  return (
    <div className="gauge" style={{ '--aqi-color': s.color }}>
      <svg viewBox="0 0 240 175" aria-hidden="true">
        <path
          d="M 30 147 A 104 104 0 1 1 210 147"
          fill="none"
          stroke="#26343a"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M 30 147 A 104 104 0 1 1 210 147"
          fill="none"
          stroke={s.color}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${Math.min(value / 300, 1) * 435} 650`}
        />
        <defs>
          <linearGradient id="gaugeGradient">
            <stop offset="0%" stopColor="#57d9aa" />
            <stop offset="55%" stopColor="#dec777" />
            <stop offset="100%" stopColor="#f4aa73" />
          </linearGradient>
        </defs>
      </svg>
      <div className="gauge-value">
        <span>US AIR QUALITY INDEX</span>
        <strong>{fmt(value)}</strong>
        <span className="gauge-status">{s.short}</span>
      </div>
      <span className="gauge-min">0</span>
      <span className="gauge-max">300+</span>
    </div>
  );
}
