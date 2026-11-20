import { ExternalLink } from 'lucide-react';
import { fmt } from '../lib/helpers';
import { Badge, Notice } from './ui';

export function SourceDetails({ data }) {
  return (
    <div className="module-stack">
      <Notice>{data.notice}</Notice>
      <div className="source-table">
        <div>
          <span>Current source</span>
          <strong>{data.source}</strong>
        </div>
        <div>
          <span>Value type</span>
          <strong>
            {data.mode === 'demo'
              ? 'Illustrative demonstration'
              : 'Regional atmospheric model estimate'}
          </strong>
        </div>
        <div>
          <span>AQI standard</span>
          <strong>US AQI · not India CPCB AQI</strong>
        </div>
        <div>
          <span>Valid timestamp</span>
          <strong>{data.time}</strong>
        </div>
        <div>
          <span>Retrieved</span>
          <strong>{data.fetchedAt}</strong>
        </div>
        <div>
          <span>Spatial resolution</span>
          <strong>{data.resolution}</strong>
        </div>
      </div>
      <h3>All available pollutants</h3>
      <div className="source-table">
        {[
          ['PM2.5', data.current.pm25],
          ['PM10', data.current.pm10],
          ['NO₂', data.current.no2],
          ['O₃', data.current.o3],
          ['SO₂', data.current.so2],
          ['CO', data.current.co],
        ].map(([name, value]) => (
          <div key={name}>
            <span>{name}</span>
            <strong>
              {fmt(value, 1)} µg/m³ · {data.mode === 'demo' ? 'Illustrative' : 'Modeled'}
            </strong>
          </div>
        ))}
      </div>
      <h3>Understand each label</h3>
      <div className="label-explanations">
        <p>
          <Badge tone="slate">DEMO</Badge>Illustrative sample values. Never use for
          real-world safety decisions.
        </p>
        <p>
          <Badge>MODELED</Badge>Current or past model estimates. They are not physical
          station measurements.
        </p>
        <p>
          <Badge tone="blue">FORECAST</Badge>Future values supplied by the environmental
          provider, with uncertainty.
        </p>
        <p>
          <Badge tone="amber">AI GUIDANCE</Badge>Generated explanation or recommendation,
          never a verified measurement.
        </p>
      </div>
      <div className="source-links">
        <a
          href="https://open-meteo.com/en/docs/air-quality-api"
          target="_blank"
          rel="noreferrer"
        >
          Open-Meteo air-quality API <ExternalLink size={15} />
        </a>
        <a href="https://atmosphere.copernicus.eu/" target="_blank" rel="noreferrer">
          Copernicus CAMS / ENSEMBLE <ExternalLink size={15} />
        </a>
        <a href="https://www.airnow.gov/aqi/aqi-basics/" target="_blank" rel="noreferrer">
          US AQI background <ExternalLink size={15} />
        </a>
        <a
          href="https://www.epa.gov/indoor-air-quality-iaq/air-cleaners-hvac-filters-and-respiratory-viruses"
          target="_blank"
          rel="noreferrer"
        >
          EPA indoor filtration guidance <ExternalLink size={15} />
        </a>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap contributors <ExternalLink size={15} />
        </a>
        <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">
          CARTO basemaps <ExternalLink size={15} />
        </a>
      </div>
      <p className="subtle">
        The Open-Meteo free endpoint is intended for non-commercial use. Commercial
        deployments need the appropriate provider plan. Attribution: Open-Meteo,
        Copernicus CAMS, and CAMS European ENSEMBLE data where applicable.
      </p>
    </div>
  );
}
