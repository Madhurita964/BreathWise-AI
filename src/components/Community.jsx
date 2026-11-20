import {
  Activity,
  CheckCircle2,
  Download,
  House,
  Info,
  MapPin,
  Sparkles,
  TrainFront,
  Users,
} from 'lucide-react';
import { severity } from '../domain';
import { fmt } from '../lib/helpers';
import MapView from '../MapView';
import { Badge, Button, Heading, Notice, Panel } from './ui';

export function Community({ data, report, ask }) {
  return (
    <div className="module-stack">
      <div className="community-banner">
        <span className="eco-orb">
          <Users size={35} />
        </span>
        <div>
          <div className="eyebrow">CLEANER AIR IS A SHARED RESPONSIBILITY</div>
          <h2>One neighborhood. Many small actions.</h2>
          <p>Help your community understand the air and take practical steps together.</p>
        </div>
        <Button onClick={report}>
          <Download size={16} />
          Generate safety report
        </Button>
      </div>
      <div className="two-columns">
        <Panel>
          <Heading
            icon={MapPin}
            title={`${data.location.name}: local context`}
            sub="Regional model point · no neighborhood sensor network"
          />
          <MapView data={data} large />
        </Panel>
        <Panel>
          <Heading icon={Activity} title="What we know. What we don’t." />
          <div className="knowledge-row">
            <CheckCircle2 />
            <div>
              <strong>Available</strong>
              <p>
                {data.mode === 'demo'
                  ? 'Illustrative demonstration data for your selected location.'
                  : 'Regional CAMS model estimates, current pollutants and provider forecast trends.'}
              </p>
            </div>
          </div>
          <div className="knowledge-row">
            <Info />
            <div>
              <strong>Not available</strong>
              <p>
                Block-level measurements, verified local emission sources, traffic feeds
                and community sensor readings.
              </p>
            </div>
          </div>
          <Notice>
            Nearby neighborhoods may lie within one ~45 km global model grid. This app
            does not invent separate neighborhood readings or display model points as
            monitoring stations.
          </Notice>
          <div className="community-aqi">
            <span>Regional US AQI</span>
            <strong style={{ color: severity(data.current.aqi).color }}>
              {fmt(data.current.aqi)}
            </strong>
            <Badge tone="amber">{severity(data.current.aqi).short}</Badge>
          </div>
        </Panel>
      </div>
      <div className="three-cards">
        {[
          [
            House,
            'Schools & families',
            'Reduce idling at school gates. Share lower-exposure activity guidance with caregivers.',
          ],
          [
            Users,
            'Neighbors & local groups',
            'Discourage open waste burning. Organize damp-cleaning and dust-control awareness.',
          ],
          [
            TrainFront,
            'A lighter daily commute',
            'Encourage shared and public transport where practical. Plan active travel around conditions.',
          ],
        ].map(([Icon, title, text]) => (
          <Panel className="action-card" key={title}>
            <span className="mini-icon">
              <Icon size={23} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
            <Button
              variant="ghost"
              onClick={() =>
                ask(
                  'Create an actionable community awareness plan for ' +
                    title +
                    ' using my current environmental context.'
                )
              }
            >
              <Sparkles size={15} />
              Create action plan
            </Button>
          </Panel>
        ))}
      </div>
    </div>
  );
}
