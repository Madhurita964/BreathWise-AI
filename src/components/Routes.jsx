import { useEffect, useState } from 'react';
import {
  Bike,
  Car,
  Footprints,
  Info,
  LoaderCircle,
  Route,
  TrainFront,
} from 'lucide-react';
import { post } from '../lib/helpers';
import MapView from '../MapView';
import { PlaceInput } from './LocationModal';
import { Badge, Button, Empty, Field, Heading, Notice, Panel } from './ui';

export function Routes({ data, notify }) {
  const demo = data.mode === 'demo';
  const [start, setStart] = useState(
    demo ? { name: 'College Street', latitude: 22.577, longitude: 88.363 } : null
  );
  const [end, setEnd] = useState(
    demo ? { name: 'Victoria Memorial', latitude: 22.5448, longitude: 88.3426 } : null
  );
  const [mode, setMode] = useState('car');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [pick, setPick] = useState(null);
  useEffect(() => {
    setResult(null);
    if (!demo) {
      setStart(null);
      setEnd(null);
    }
  }, [demo]);
  async function compare() {
    setBusy(true);
    setErr('');
    setResult(null);
    try {
      setResult(await post('routes', { start, end, mode, demo }));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  const visible = result?.routes;
  return (
    <div className="module-stack">
      <div className="route-layout">
        <Panel className="route-controls">
          <Heading
            icon={Route}
            title="Plan the journey"
            sub={
              demo
                ? 'Illustrative Kolkata example'
                : 'Search places, enter coordinates or pick on the map'
            }
          />
          <PlaceInput
            key={'start-' + demo}
            label="Starting point"
            value={start}
            onChange={(v) => {
              setStart(v);
              setResult(null);
            }}
          />
          <PlaceInput
            key={'end-' + demo}
            label="Destination"
            value={end}
            onChange={(v) => {
              setEnd(v);
              setResult(null);
            }}
          />
          <Field label="How are you traveling?">
            <div className="mode-grid">
              {[
                ['walk', 'Walk', Footprints],
                ['cycle', 'Cycle', Bike],
                ['bus', 'Transit', TrainFront],
                ['car', 'Car', Car],
              ].map(([id, label, Icon]) => (
                <button
                  key={id}
                  className={mode === id ? 'selected' : ''}
                  onClick={() => {
                    setMode(id);
                    setResult(null);
                  }}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
          </Field>
          <Button
            className="full-width"
            onClick={compare}
            disabled={!start || !end || busy}
          >
            {busy ? <LoaderCircle className="spin" size={17} /> : <Route size={17} />}
            Compare available routes
          </Button>
          {err && <Notice kind="warning">{err}</Notice>}
          <Notice>
            Traffic feeds and transit schedules are unavailable. Regional pollution
            estimates cannot certify a safer route.
          </Notice>
        </Panel>
        <Panel className="route-map-panel">
          <div className="map-pick-controls">
            <span>Pick directly on the map</span>
            <button
              className={pick === 'start' ? 'selected' : ''}
              onClick={() => setPick('start')}
            >
              Set start
            </button>
            <button
              className={pick === 'end' ? 'selected' : ''}
              onClick={() => setPick('end')}
            >
              Set destination
            </button>
          </div>
          <MapView
            data={data}
            routes={visible}
            large
            onPick={(point) => {
              if (!pick) return;
              const value = {
                name: `Map point (${point.lat.toFixed(4)}, ${point.lng.toFixed(4)})`,
                latitude: point.lat,
                longitude: point.lng,
              };
              if (pick === 'start') setStart(value);
              else setEnd(value);
              setResult(null);
              setPick(null);
              notify('Map point selected.');
            }}
          />
          <div className="route-map-note">
            <span className="dot" />{' '}
            {pick
              ? 'Click the map to set your ' +
                (pick === 'start' ? 'starting point' : 'destination')
              : result
                ? result.mode === 'demo'
                  ? 'Demo geometry · not navigation'
                  : 'OSRM / OSM geometry'
                : 'Your route comparison will appear here'}
          </div>
        </Panel>
      </div>
      {result ? (
        <>
          <Notice>{result.notice}</Notice>
          <div className="route-results">
            {visible.map((r, i) => (
              <Panel key={r.name} className="route-result">
                <div className="route-result-title">
                  <h3>
                    <span style={{ background: i === 0 ? '#5edcaf' : '#729bc5' }} />
                    {r.name}
                  </h3>
                  <Badge tone="slate">
                    {result.mode === 'demo' ? 'Illustrative' : 'Provider route'}
                  </Badge>
                </div>
                <div className="route-stats">
                  <div>
                    <strong>{r.duration}</strong>
                    <small>estimated min</small>
                  </div>
                  <div>
                    <strong>{r.distance.toFixed(1)}</strong>
                    <small>km distance</small>
                  </div>
                  <div>
                    <strong>{r.emissions.toFixed(2)}</strong>
                    <small>kg CO₂e / person</small>
                  </div>
                </div>
                <div className="route-exposure">
                  <span>PM2.5 × travel time</span>
                  <strong>
                    {r.exposure === null
                      ? 'Unavailable'
                      : r.exposure.toLocaleString() + ' µg·min/m³'}
                  </strong>
                </div>
                <p>
                  {r.exposure === null
                    ? 'Pollution sampling failed. No exposure comparison is available.'
                    : 'A simple concentration-time proxy; it omits breathing rate, indoor filtration and local hot spots.'}
                </p>
              </Panel>
            ))}
          </div>
          <Panel>
            <Heading
              icon={TrainFront}
              title="Compare transport scenarios"
              sub="Same distance as the first route; actual paths and travel times will vary"
            />
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Mode</th>
                    <th>Assumed speed</th>
                    <th>Estimated time</th>
                    <th>Operational CO₂e / person</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Walking', 4.8, 0],
                    ['Cycling', 15, 0],
                    ['Public bus', 22, 0.105],
                    ['Solo car', 25, 0.171],
                  ].map(([label, speed, factor]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{speed} km/h</td>
                      <td>{Math.round((visible[0].distance / speed) * 60)} min</td>
                      <td>{(visible[0].distance * factor).toFixed(2)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="subtle">
              Scenario speeds are assumptions. No live traffic, transit timetable or
              ventilation-adjusted dose is available. Active-travel suitability depends on
              air quality, heat, ability and infrastructure.
            </p>
          </Panel>
        </>
      ) : (
        <Panel>
          <Empty icon={Route} title="Every journey has trade-offs">
            Choose your places and transport to compare distance, estimated time, carbon
            emissions and available pollution context.
          </Empty>
        </Panel>
      )}
      <Panel>
        <Heading icon={Info} title="How to read this comparison" />
        <div className="three-columns explanatory">
          <div>
            <h3>Exposure</h3>
            <p>
              Lower concentration × time may suggest a lower exposure opportunity. Coarse
              model cells may give the same value across different streets. No route is
              labeled safer.
            </p>
          </div>
          <div>
            <h3>Time & mobility</h3>
            <p>
              Walking and cycling use their respective OSM routing profiles. Transit is a
              road-based scenario at 22 km/h. Traffic delays, transfers and breathing rate
              are not modeled.
            </p>
          </div>
          <div>
            <h3>Emissions</h3>
            <p>
              Illustrative factors: car 0.171, bus 0.105, walking/cycling 0 kg CO₂e per
              passenger-km. These omit active-travel food and infrastructure impacts.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
