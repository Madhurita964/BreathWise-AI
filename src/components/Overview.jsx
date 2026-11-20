import { useState } from 'react';
import {
  Activity,
  AirVent,
  CalendarDays,
  ChevronRight,
  Clock,
  Cloud,
  CloudSun,
  Droplets,
  Heart,
  Info,
  Leaf,
  MapPin,
  Plus,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Sun,
  Wind,
} from 'lucide-react';
import { TrendChart } from '../Charts';
import { advice, getWindows, severity } from '../domain';
import { fmt, time } from '../lib/helpers';
import MapView from '../MapView';
import { AQIGauge } from './AQIGauge';
import { Badge, Button, Heading, Panel } from './ui';

export function Overview({ data, profiles, ask, navigate, setModal, load }) {
  const [range, setRange] = useState('24 hours');
  const windows = getWindows(data);
  const best = windows[0];
  const highest = [...windows].sort((a, b) => b.aqi - a.aqi)[0];
  const s = severity(data.current.aqi);
  return (
    <>
      <div className="overview-top">
        <Panel className="current-card">
          <Heading
            title="The air around you"
            action={
              <Badge tone={data.mode === 'demo' ? 'slate' : 'green'}>
                <span className="dot" />
                {data.mode === 'demo' ? 'DEMO' : 'MODELED'}
              </Badge>
            }
          />
          <div className="place-line">
            <MapPin size={14} />
            {data.location.name}
            <span>· {time(data.time, data)}</span>
            <button
              className="icon-button small"
              aria-label="Refresh air data"
              onClick={load}
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <AQIGauge value={data.current.aqi} />
          <div className="gauge-callout">
            <ShieldCheck size={17} />
            <p>
              {s.level >= 2
                ? 'A little extra care goes a long way.'
                : 'A good day starts with awareness.'}
              <span>
                {s.level >= 2
                  ? 'Sensitive groups should limit prolonged outdoor exertion.'
                  : 'Check conditions before prolonged outdoor activity.'}
              </span>
            </p>
          </div>
          <div className="aqi-scale">
            {['Good', 'Moderate', 'Sensitive', 'Unhealthy', 'Very high', 'Hazardous'].map(
              (v, i) => (
                <span
                  key={v}
                  style={{
                    '--scale-color': [
                      '#57d8a8',
                      '#dfcb73',
                      '#f0aa6e',
                      '#e97d7e',
                      '#b391d5',
                      '#be6b92',
                    ][i],
                  }}
                >
                  <i />
                  {v}
                </span>
              )
            )}
          </div>
        </Panel>
        <Panel className="outlook-card">
          <Heading
            title="Your air, through the day"
            sub={
              range === 'Past 24h'
                ? 'Past model estimates · not measured history'
                : 'Provider forecast outlook · US AQI'
            }
            action={
              <div className="segmented">
                {['24 hours', '48 hours', 'Past 24h'].map((x) => (
                  <button
                    key={x}
                    className={range === x ? 'selected' : ''}
                    onClick={() => setRange(x)}
                  >
                    {x}
                  </button>
                ))}
              </div>
            }
          />
          <div className="chart-key">
            <span>
              <i /> {data.mode === 'demo' ? 'Illustrative trend' : 'CAMS model estimate'}
            </span>
            <span>
              <i className="dashed" />
              100 AQI reference
            </span>
          </div>
          <TrendChart data={data} range={range} />
          <div className="outlook-summary">
            <div>
              <span className="mini-icon">
                <Sun size={17} />
              </span>
              <div>
                <small>LOWER-EXPOSURE WINDOW</small>
                <strong>
                  {best ? time(best.time, data) : 'Unavailable'}{' '}
                  <span>· AQI {best?.aqi ?? '—'}</span>
                </strong>
              </div>
            </div>
            <div className="summary-divider" />
            <div>
              <span className="mini-icon amber">
                <Clock size={17} />
              </span>
              <div>
                <small>PEAK IN NEXT 24H</small>
                <strong>
                  {highest ? time(highest.time, data) : 'Unavailable'}{' '}
                  <span>· AQI {highest?.aqi ?? '—'}</span>
                </strong>
              </div>
            </div>
          </div>
        </Panel>
      </div>
      <div className="pollutant-grid">
        {[
          ['PM2.5', data.current.pm25, 'Fine particles', Wind, 'pm25'],
          ['PM10', data.current.pm10, 'Coarse particles', Activity, 'pm10'],
          ['NO₂', data.current.no2, 'Nitrogen dioxide', Cloud, 'no2'],
          ['O₃', data.current.o3, 'Ground-level ozone', Sun, 'o3'],
        ].map(([name, value, sub, Icon], i) => (
          <Panel className="pollutant-card" key={name}>
            <div className="pollutant-top">
              <span>{name}</span>
              <Icon size={17} />
            </div>
            <div className="pollutant-value">
              {fmt(value, 1)} <small>µg/m³</small>
            </div>
            <div className="pollutant-bottom">
              <span>{sub}</span>
              <span>{data.mode === 'demo' ? 'Sample' : 'Modeled'}</span>
            </div>
            <div className="metric-track">
              <i
                style={{
                  width: `${Math.min(90, 20 + (value || 0) / 2)}%`,
                  background: i < 2 ? '#d9ae74' : '#57cba7',
                }}
              />
            </div>
          </Panel>
        ))}
      </div>
      <div className="overview-middle">
        <Panel className="insight-card">
          <div className="insight-decoration">
            <Sparkles />
          </div>
          <Heading
            icon={Sparkles}
            title="Less guesswork. More peace of mind."
            action={<Badge>YOUR DAILY BRIEF</Badge>}
          />
          <p className="insight-intro">
            {data.mode === 'demo'
              ? 'In this demo scenario,'
              : 'Based on the supplied regional model,'}{' '}
            <strong>
              {s.level >= 2
                ? 'sensitive groups may benefit from a little more planning today.'
                : 'you can plan your day with a little more confidence.'}
            </strong>
          </p>
          <div className="brief-items">
            <div>
              <span>
                <ShieldCheck size={18} />
              </span>
              <p>
                <strong>Protect your people</strong>
                {advice(
                  data.current.aqi,
                  profiles.find((p) => p.group !== 'Adult')?.group || 'Adult'
                )}
              </p>
            </div>
            <div>
              <span>
                <CalendarDays size={18} />
              </span>
              <p>
                <strong>Choose your moment</strong>
                {best
                  ? `${time(best.time, data)} has the lowest supplied next-24-hour AQI (${best.aqi}). Recheck before heading out.`
                  : 'No forecast window is available.'}
              </p>
            </div>
            <div>
              <span>
                <AirVent size={18} />
              </span>
              <p>
                <strong>Make indoors a little better</strong>Avoid incense and smoke. Use
                outdoor-vented extraction when cooking.
              </p>
            </div>
          </div>
          <button
            className="text-link"
            onClick={() =>
              ask(
                'Explain today’s pollution outlook and give my family three practical actions.'
              )
            }
          >
            Explore with your AI advisor <Sparkles size={15} />
          </button>
          <span className="rules-note">
            Data-driven brief · transparent guidance rules
          </span>
        </Panel>
        <div className="right-stack">
          <Panel className="weather-card">
            <Heading
              title="Beyond the air"
              action={<CloudSun size={23} color="#e5ce83" />}
            />
            {data.weather ? (
              <>
                <div className="weather-main">
                  <strong>
                    {fmt(data.weather.temperature)}°<span>C</span>
                  </strong>
                  <div>
                    {data.location.name}
                    <small>
                      {data.weather.kind === 'illustrative'
                        ? 'Illustrative weather'
                        : 'Modeled weather'}
                    </small>
                  </div>
                </div>
                <div className="weather-metrics">
                  <span>
                    <Wind size={15} />
                    {fmt(data.weather.wind, 1)} km/h<small>Wind</small>
                  </span>
                  <span>
                    <Droplets size={15} />
                    {fmt(data.weather.humidity)}%<small>Humidity</small>
                  </span>
                </div>
              </>
            ) : (
              <p>Weather is currently unavailable. No weather assumptions are used.</p>
            )}
          </Panel>
          <Panel className="family-preview">
            <Heading
              icon={Heart}
              title="Your family, in focus"
              action={
                <button className="text-button" onClick={() => navigate('family')}>
                  View all
                </button>
              }
            />
            <div className="family-avatars">
              {profiles.slice(0, 4).map((p, i) => (
                <span
                  key={p.id}
                  className={'avatar avatar-' + i}
                  title={p.name + ' · ' + p.group}
                >
                  {p.name[0]?.toUpperCase()}
                </span>
              ))}
              <button
                className="avatar add-avatar"
                aria-label="Add family member"
                onClick={() => navigate('family')}
              >
                <Plus size={17} />
              </button>
            </div>
            <p>
              <strong>
                {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'}.
              </strong>{' '}
              One healthier plan.
            </p>
            <span className="subtle">Personalized guidance for every generation.</span>
          </Panel>
        </div>
      </div>
      <div className="overview-bottom">
        <Panel className="map-card">
          <Heading
            title="A wider view of your environment"
            sub="Location context, without false precision"
            action={
              <Button variant="ghost compact" onClick={() => navigate('community')}>
                <MapPin size={14} />
                Explore community
              </Button>
            }
          />
          <MapView data={data} />
        </Panel>
        <Panel className="quick-actions">
          <Heading
            title="A healthier day starts here"
            sub="Small decisions. Better everyday living."
          />
          {[
            [
              Route,
              'Rethink your commute',
              'Compare routes and their trade-offs',
              'routes',
            ],
            [
              CalendarDays,
              'Find your outdoor window',
              'Build an air-aware daily schedule',
              'planner',
            ],
            [
              Leaf,
              'Make your impact count',
              'Estimate your weekly carbon savings',
              'eco',
            ],
          ].map(([Icon, title, sub, page]) => (
            <button key={page} className="quick-action" onClick={() => navigate(page)}>
              <span>
                <Icon size={20} />
              </span>
              <div>
                <strong>{title}</strong>
                <small>{sub}</small>
              </div>
              <ChevronRight size={17} />
            </button>
          ))}
        </Panel>
      </div>
      <div className="source-line">
        <Info size={14} />
        <span>
          {data.source} · Valid{' '}
          {new Date(data.time).toLocaleString('en-IN', { timeZone: data.timezone })} (
          {data.timezone}) ·{' '}
          {data.mode === 'demo' ? 'Illustrative values' : 'Regional estimates'}
        </span>
        <button onClick={() => setModal('sources')}>View sources</button>
      </div>
    </>
  );
}
