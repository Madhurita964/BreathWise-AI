import { useEffect, useState } from 'react';
import { Info, Leaf, SlidersHorizontal } from 'lucide-react';
import { EcoChart } from '../Charts';
import { ecoSavings } from '../domain';
import { saved } from '../lib/helpers';
import { Badge, Field, Heading, Notice, Panel } from './ui';

export function Eco({ notify }) {
  const [values, setValues] = useState(() =>
    saved('bw-eco', { km: 10, days: 5, mode: 'bus', kwh: 5, grid: 0.7, reusable: 5 })
  );
  const result = ecoSavings(values);
  function update(k, v) {
    setValues((x) => ({ ...x, [k]: v }));
  }
  useEffect(() => localStorage.setItem('bw-eco', JSON.stringify(values)), [values]);
  return (
    <div className="module-stack">
      <div className="eco-hero">
        <span className="eco-orb">
          <Leaf size={42} />
        </span>
        <div>
          <div className="eyebrow">A LIGHTER FOOTPRINT, ONE CHOICE AT A TIME</div>
          <h2>Your everyday choices add up.</h2>
          <p>Adjust the possibilities. See what a different week could look like.</p>
        </div>
        <Badge>SCENARIO ESTIMATE</Badge>
      </div>
      <div className="two-columns">
        <Panel>
          <Heading icon={SlidersHorizontal} title="Design your lower-carbon week" />
          <Field label={`Daily distance switched from solo car · ${values.km} km`}>
            <input
              type="range"
              min="0"
              max="80"
              value={values.km}
              onChange={(e) => update('km', +e.target.value)}
            />
          </Field>
          <div className="two-fields">
            <Field label="Travel days per week">
              <input
                type="number"
                min="0"
                max="7"
                value={values.days}
                onChange={(e) =>
                  update('days', Math.max(0, Math.min(7, +e.target.value)))
                }
              />
            </Field>
            <Field label="Switch to">
              <select
                value={values.mode}
                onChange={(e) => update('mode', e.target.value)}
              >
                <option value="bus">Public bus</option>
                <option value="rail">Rail / metro</option>
                <option value="walk">Walking</option>
                <option value="cycle">Cycling</option>
              </select>
            </Field>
          </div>
          <Field label={`Electricity saved per week · ${values.kwh} kWh`}>
            <input
              type="range"
              min="0"
              max="100"
              value={values.kwh}
              onChange={(e) => update('kwh', +e.target.value)}
            />
          </Field>
          <p className="subtle">
            Includes reduced consumption and efficient appliances. Enter the combined
            reduction once to avoid double counting.
          </p>
          <div className="two-fields">
            <Field label="Grid factor · kg CO₂e/kWh">
              <input
                type="number"
                value={values.grid}
                min="0"
                max="2"
                step="0.01"
                onChange={(e) =>
                  update('grid', Math.max(0, Math.min(2, +e.target.value)))
                }
              />
            </Field>
            <Field label="Single-use items avoided / week">
              <input
                type="number"
                value={values.reusable}
                min="0"
                max="500"
                onChange={(e) =>
                  update('reusable', Math.max(0, Math.min(500, +e.target.value)))
                }
              />
            </Field>
          </div>
        </Panel>
        <Panel className="eco-results">
          <Heading title="The difference you could make" />
          <div className="eco-total">
            <span>ESTIMATED WEEKLY AVOIDED EMISSIONS</span>
            <strong>
              {result.weekly.toFixed(1)}
              <small>kg CO₂e</small>
            </strong>
            <p>
              Approximately <b>{result.annual.toFixed(0)} kg CO₂e</b> over 52 identical
              weeks.
            </p>
          </div>
          <EcoChart result={result} />
          <div className="eco-breakdown">
            <span>
              Transport <b>{result.travel.toFixed(2)} kg</b>
            </span>
            <span>
              Electricity <b>{result.energy.toFixed(2)} kg</b>
            </span>
            <span>
              Reusables <b>{result.products.toFixed(2)} kg</b>
            </span>
          </div>
        </Panel>
      </div>
      <Panel>
        <Heading icon={Info} title="No magic numbers. Here’s the math." />
        <div className="formula-grid">
          <div>
            <h3>Transport</h3>
            <code>km/day × days × (car factor − new mode factor)</code>
            <p>
              Illustrative kg CO₂e/passenger-km: solo car 0.171; bus 0.105; rail 0.035;
              walking/cycling 0 operational. These are editable-scenario assumptions, not
              certified inventory factors.
            </p>
          </div>
          <div>
            <h3>Energy & products</h3>
            <code>kWh saved × grid factor + items avoided × 0.02</code>
            <p>
              Default grid factor 0.70 kg CO₂e/kWh is a user-adjustable example, not a
              verified local grid value. Reusables assume 0.02 kg avoided per disposable;
              actual lifecycle savings depend on reuse and washing.
            </p>
          </div>
        </div>
        <Notice>
          Scenario estimates exclude infrastructure, manufacturing changes, rebound
          effects and non-CO₂ local pollutants. CO₂e reductions do not directly predict a
          change in neighborhood AQI.
        </Notice>
      </Panel>
    </div>
  );
}
