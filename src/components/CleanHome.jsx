import { useState } from 'react';
import { AirVent, House, ShieldCheck } from 'lucide-react';
import { homeGuidance } from '../domain';
import { Field, Heading, Notice, Panel } from './ui';

export function CleanHome({ data }) {
  const [room, setRoom] = useState('Bedroom');
  const [budget, setBudget] = useState(5000);
  const [size, setSize] = useState(20);
  const [sources, setSources] = useState(['Dust']);
  const guidance = homeGuidance(room, budget, data.current.aqi, sources);
  return (
    <div className="module-stack">
      <Notice>
        No indoor sensor is connected. These are practical recommendations based on room
        inputs and outdoor context, not measured indoor air quality.
      </Notice>
      <div className="two-columns">
        <Panel>
          <Heading icon={House} title="Build your room’s clean-air plan" />
          <div className="room-tabs">
            {['Bedroom', 'Living room', 'Kitchen', 'Study'].map((r) => (
              <button
                className={room === r ? 'selected' : ''}
                key={r}
                onClick={() => setRoom(r)}
              >
                {r}
              </button>
            ))}
          </div>
          <Field label={`Room area · ${size} m²`}>
            <input
              type="range"
              min="8"
              max="80"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </Field>
          <Field label={`Your planning budget · ₹${budget.toLocaleString('en-IN')}`}>
            <input
              type="range"
              min="0"
              max="30000"
              step="500"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </Field>
          <Field label="What are the likely indoor sources?">
            <div className="check-options">
              {['Dust', 'Cooking smoke', 'Incense', 'Tobacco smoke'].map((s) => (
                <label key={s}>
                  <input
                    type="checkbox"
                    checked={sources.includes(s)}
                    onChange={() =>
                      setSources(
                        sources.includes(s)
                          ? sources.filter((x) => x !== s)
                          : [...sources, s]
                      )
                    }
                  />
                  {s}
                </label>
              ))}
            </div>
          </Field>
          <div className="cadr">
            <AirVent />
            <div>
              <small>ILLUSTRATIVE FILTRATION TARGET</small>
              <strong>
                {Math.round(size * 2.7 * 4)}–{Math.round(size * 2.7 * 5)} m³/h CADR
              </strong>
              <p>
                {size} m² × assumed 2.7 m ceiling × 4–5 air changes/hour. Check product
                performance for your actual room.
              </p>
            </div>
          </div>
        </Panel>
        <Panel>
          <Heading icon={ShieldCheck} title={`${room}: your practical priorities`} />
          <div className="home-guidance">
            {guidance.map((g, i) => (
              <div key={g.title}>
                <span className="step-number">{i + 1}</span>
                <div>
                  <h3>{g.title}</h3>
                  <p>{g.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel>
        <Heading title="Better air doesn’t always start with a purchase." />
        <div className="three-columns explanatory">
          <div>
            <h3>₹0–₹3,000 · Start at the source</h3>
            <p>
              Reduce smoke, wet-mop dust and ventilate strategically. Fix moisture
              sources. Source control improves what filters must work against.
            </p>
          </div>
          <div>
            <h3>₹3,000–₹10,000 · Match the room</h3>
            <p>
              If buying filtration, prioritize independently rated particle CADR and
              replacement-filter cost over decorative features. Prices and availability
              vary.
            </p>
          </div>
          <div>
            <h3>₹10,000+ · Build a system</h3>
            <p>
              Consider filtration coverage across occupied rooms and reliable ventilation.
              Expensive equipment does not replace control of smoke and gas sources.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
