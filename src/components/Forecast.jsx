import { useState } from 'react';
import { Activity, BarChart3, Check, ShieldCheck, Sparkles, Sun } from 'lucide-react';
import { TrendChart } from '../Charts';
import { getWindows } from '../domain';
import { time } from '../lib/helpers';
import { Button, Heading, Notice, Panel } from './ui';

export function Forecast({ data, ask }) {
  const [range, setRange] = useState('48 hours');
  const windows = getWindows(data);
  const best = windows[0],
    peak = [...windows].reverse()[0];
  const current = data.current.aqi;
  const future = data.hourly.filter((x) => x.kind === 'forecast' && x.aqi !== null);
  const avg = future.length
    ? future.slice(0, 24).reduce((a, b) => a + b.aqi, 0) / Math.min(future.length, 24)
    : null;
  return (
    <div className="module-stack">
      <div className="three-cards">
        <Panel className="stat-card">
          <Sun />
          <small>LOWEST NEXT 24 HOURS</small>
          <strong>
            {best?.aqi ?? '—'} <span>US AQI</span>
          </strong>
          <p>{best ? time(best.time, data) : 'No forecast data'}</p>
        </Panel>
        <Panel className="stat-card">
          <Activity />
          <small>HIGHEST NEXT 24 HOURS</small>
          <strong>
            {peak?.aqi ?? '—'} <span>US AQI</span>
          </strong>
          <p>{peak ? time(peak.time, data) : 'No forecast data'}</p>
        </Panel>
        <Panel className="stat-card">
          <BarChart3 />
          <small>OUTLOOK VS CURRENT</small>
          <strong>
            {avg === null ? '—' : Math.abs(Math.round(avg - current))}{' '}
            <span>points {avg < current ? 'lower' : 'higher'}</span>
          </strong>
          <p>Next 24h average relative to current</p>
        </Panel>
      </div>
      <Panel>
        <Heading
          icon={BarChart3}
          title="The bigger picture"
          sub="Provider forecast; AI does not generate these numeric values"
          action={
            <select
              aria-label="Forecast chart range"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option>24 hours</option>
              <option>48 hours</option>
              <option>Past 24h</option>
            </select>
          }
        />
        <TrendChart data={data} range={range} />
      </Panel>
      <div className="two-columns">
        <Panel>
          <Heading icon={Sparkles} title="What might be changing?" />
          <p>
            Pollution can change with wind, emissions, atmospheric mixing and weather. The
            supplied data cannot establish which factor caused a change in your location.
          </p>
          <Notice>
            Current and past values are{' '}
            {data.mode === 'demo' ? 'illustrative examples' : 'CAMS model estimates'}.
            Forecast uncertainty and local variations remain. Numeric forecast confidence
            is not provided by this integration.
          </Notice>
          <Button
            onClick={() =>
              ask(
                'Explain possible reasons for changes in my pollution outlook. Clearly separate known data from possible explanations.'
              )
            }
          >
            <Sparkles size={16} />
            Explain my outlook
          </Button>
        </Panel>
        <Panel>
          <Heading icon={ShieldCheck} title="Your next best steps" />
          <ul className="check-list">
            <li>
              <Check />
              Recheck conditions shortly before leaving.
            </li>
            <li>
              <Check />
              Reduce strenuous outdoor activity when AQI rises.
            </li>
            <li>
              <Check />
              Use your family’s sensitivity and care plan.
            </li>
            <li>
              <Check />
              Treat the lowest forecast as relative, not risk-free.
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
