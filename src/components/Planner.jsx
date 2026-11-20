import { useEffect, useState } from 'react';
import {
  CalendarDays,
  CheckCheck,
  CloudSun,
  LoaderCircle,
  Plus,
  Sparkles,
  Users,
  Wind,
  X,
} from 'lucide-react';
import { makePlan } from '../domain';
import { fmt, time } from '../lib/helpers';
import { Badge, Button, Empty, Heading, Notice, Panel } from './ui';

export function Planner({ data, profiles, activities, setActivities, notify }) {
  const [value, setValue] = useState('');
  const [plan, setPlan] = useState([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => setPlan([]), [data, activities, profiles]);
  function generate() {
    setBusy(true);
    setTimeout(() => {
      setPlan(makePlan(data, activities, profiles));
      setBusy(false);
    }, 500);
  }
  return (
    <div className="module-stack">
      <div className="two-columns planner-columns">
        <Panel>
          <Heading
            icon={CalendarDays}
            title="What’s on your day?"
            sub="Lower-AQI slots within suitable hours, in the next 24h."
          />
          <form
            className="activity-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (value.trim()) {
                setActivities([...activities, value.trim()]);
                setValue('');
              }
            }}
          >
            <input
              aria-label="Activity name"
              placeholder="Add a walk, commute, errand…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={80}
              required
            />
            <Button disabled={activities.length >= 10 || !value.trim()}>
              <Plus size={17} />
              Add
            </Button>
          </form>
          <div className="activity-list">
            {activities.map((a, i) => (
              <div key={i}>
                <span className="mini-icon">
                  <CalendarDays size={17} />
                </span>
                <strong>{a}</strong>
                <button
                  className="icon-button"
                  aria-label={'Remove ' + a}
                  onClick={() => setActivities(activities.filter((_, j) => i !== j))}
                >
                  <X size={17} />
                </button>
              </div>
            ))}
          </div>
          <Button
            className="full-width"
            onClick={generate}
            disabled={!activities.length || busy}
          >
            {busy ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}
            Build my air-aware day
          </Button>
          <p className="subtle">
            Rules-based scheduling · considers your {profiles.length} family profiles
            {data.weather ? ' and available weather context' : ''}.
          </p>
        </Panel>
        <Panel>
          <Heading icon={CloudSun} title="What this planner considers" />
          <div className="planner-factors">
            <div>
              <Wind />
              Forecast AQI<span>Next 24-hour provider outlook</span>
            </div>
            <div>
              <Users />
              Family needs
              <span>
                {profiles.some((p) => p.group !== 'Adult')
                  ? 'Sensitive-group threshold applied'
                  : 'General adult guidance'}
              </span>
            </div>
            <div>
              <CloudSun />
              Weather context
              <span>
                {data.weather
                  ? `${fmt(data.weather.temperature)}°C · humidity ${fmt(data.weather.humidity)}% · wind ${fmt(data.weather.wind, 1)} km/h`
                  : 'Weather unavailable'}
              </span>
            </div>
          </div>
          <Notice>
            Time-of-day cues (morning, school, evening) constrain suggestions. Activity
            times are flexible, not appointments. The planner selects relative lower-AQI
            windows, not the globally safest time. Weather is current context only; hourly
            rain, heat and UV are not available here.
          </Notice>
        </Panel>
      </div>
      {plan.length > 0 ? (
        <Panel>
          <Heading
            icon={CheckCheck}
            title="Your suggested schedule"
            sub={
              data.mode === 'demo'
                ? 'Based on illustrative demo data'
                : 'Based on the supplied regional model outlook'
            }
          />
          <div className="timeline">
            {plan.map((p, i) => (
              <div key={i}>
                <span className="timeline-dot" />
                <div className="timeline-time">
                  {p.time ? time(p.time, data) : 'Unscheduled'}
                  <small>
                    {p.time
                      ? new Date(p.time).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          timeZone: data.timezone,
                        })
                      : 'No matching slot'}
                  </small>
                </div>
                <div>
                  <h3>{p.activity}</h3>
                  <Badge tone={p.indoor ? 'amber' : 'green'}>
                    {p.indoor
                      ? 'Indoor alternative suggested'
                      : 'Lower relative AQI window'}
                    {p.aqi !== null ? ' · ' + p.aqi + ' AQI' : ''}
                  </Badge>
                  <p>
                    {p.indoor
                      ? 'Consider an indoor version or postpone if flexible. '
                      : ''}
                    {p.recommendation}
                  </p>
                  {data.weather?.temperature > 32 && (
                    <p>
                      Current weather is hot; carry water and avoid strenuous activity in
                      heat.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              const content = plan
                .map(
                  (p) =>
                    `${p.time ? time(p.time, data) : 'Unscheduled'} - ${p.activity}: ${p.aqi !== null ? 'AQI ' + p.aqi : 'No matching forecast'}. ${p.recommendation}`
                )
                .join('\n');
              navigator.clipboard
                ?.writeText(content)
                .then(() => notify('Schedule copied.'))
                .catch(() =>
                  notify('Clipboard unavailable. You can select the schedule text.')
                );
            }}
          >
            <CheckCheck size={16} />
            Copy schedule
          </Button>
        </Panel>
      ) : (
        <Panel>
          <Empty icon={CalendarDays} title="Your next day, thoughtfully planned">
            Add your activities and generate a schedule. Every recommendation explains the
            data behind it.
          </Empty>
        </Panel>
      )}
    </div>
  );
}
