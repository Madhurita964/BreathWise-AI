import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
export function TrendChart({ data, range = '24 hours' }) {
  const now = Date.now();
  const points = (
    range === 'Past 24h'
      ? data.hourly.filter((x) => x.kind === 'history').slice(-24)
      : data.hourly
          .filter((x) => x.kind === 'forecast')
          .slice(0, range === '48 hours' ? 48 : 24)
  ).map((x) => ({
    ...x,
    label: new Date(x.time).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: data.timezone,
    }),
    aqi: x.aqi === null ? null : Math.round(x.aqi),
  }));
  return (
    <div
      className="trend-chart"
      role="img"
      aria-label={`${range} ${data.mode === 'demo' ? 'illustrative' : 'modeled'} US AQI trend`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 15, right: 10, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#52d4a6" stopOpacity={0.23} />
              <stop offset="95%" stopColor="#52d4a6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#26343c" strokeDasharray="3 5" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#84949d', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={45}
          />
          <YAxis
            tick={{ fill: '#84949d', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: '#14252d',
              border: '1px solid #354951',
              borderRadius: 12,
              color: '#fff',
            }}
            formatter={(v) => [v, 'US AQI']}
            labelFormatter={(_, p) =>
              p?.[0]?.payload?.time
                ? new Date(p[0].payload.time).toLocaleString('en-IN', {
                    timeZone: data.timezone,
                  })
                : ''
            }
          />
          <ReferenceLine y={100} stroke="#c7a867" strokeDasharray="4 5" />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#57d7ad"
            strokeWidth={2.5}
            fill="url(#aqiFill)"
            connectNulls={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function EcoChart({ result }) {
  const values = [
    { name: 'Transport', value: result.travel },
    { name: 'Electricity', value: result.energy },
    { name: 'Reusables', value: result.products },
  ];
  return (
    <div style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={values} margin={{ left: 0, right: 20 }}>
          <CartesianGrid vertical={false} stroke="#26343c" strokeDasharray="3 5" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#9baab3' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fill: '#9baab3' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#14252d', border: '1px solid #354951' }}
            formatter={(v) => [v.toFixed(2) + ' kg CO₂e', 'Weekly savings']}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={65}>
            {values.map((v, i) => (
              <Cell key={v.name} fill={['#56d6a8', '#73b6c6', '#b4c98a'][i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
