import { useState } from 'react';
import { Plus, ShieldCheck, Trash2, Users } from 'lucide-react';
import { advice, GROUPS } from '../domain';
import { Badge, Button, Empty, Field, Modal, Notice, Panel } from './ui';

export function Family({ data, profiles, setProfiles, notify }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [group, setGroup] = useState('Child');
  function save(e) {
    e.preventDefault();
    setProfiles([...profiles, { id: crypto.randomUUID(), name: name.trim(), group }]);
    setAdding(false);
    setName('');
    notify('Family profile added on this device.');
  }
  return (
    <div className="module-stack">
      <Notice>
        Profiles personalize general guidance. Follow individual care plans and local
        public-health advice. Sample profiles can be edited or removed.
      </Notice>
      <div className="section-toolbar">
        <div>
          <h2>A little care for every generation</h2>
          <p>
            {profiles.length} profiles · stored on this device
            {profiles.some((p) => p.id.startsWith('sample'))
              ? ' · includes sample members'
              : ''}
          </p>
        </div>
        <Button onClick={() => setAdding(true)} disabled={profiles.length >= 12}>
          <Plus size={17} />
          Add family member
        </Button>
      </div>
      <div className="family-grid">
        {profiles.map((p, i) => (
          <Panel className="family-profile" key={p.id}>
            <div className="family-profile-top">
              <span className={'avatar large-avatar avatar-' + (i % 4)}>
                {p.name[0]?.toUpperCase()}
              </span>
              <button
                className="icon-button"
                aria-label={'Remove ' + p.name}
                onClick={() => {
                  setProfiles(profiles.filter((x) => x.id !== p.id));
                  notify('Profile removed.');
                }}
              >
                <Trash2 size={17} />
              </button>
            </div>
            <input
              className="profile-name"
              aria-label={'Name of ' + p.name}
              maxLength={40}
              value={p.name}
              onChange={(e) =>
                setProfiles(
                  profiles.map((x) =>
                    x.id === p.id ? { ...x, name: e.target.value } : x
                  )
                )
              }
            />
            <select
              aria-label={'Age or activity group for ' + p.name}
              value={p.group}
              onChange={(e) =>
                setProfiles(
                  profiles.map((x) =>
                    x.id === p.id ? { ...x, group: e.target.value } : x
                  )
                )
              }
            >
              {GROUPS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <div className="profile-guidance">
              <ShieldCheck size={18} />
              <div>
                <strong>Today’s guidance</strong>
                <p>{advice(data.current.aqi, p.group)}</p>
              </div>
            </div>
            <Badge
              tone={data.current.aqi > 100 && p.group !== 'Adult' ? 'amber' : 'green'}
            >
              {data.current.aqi > 100 && p.group !== 'Adult'
                ? 'Extra care recommended'
                : 'Stay aware of conditions'}
            </Badge>
          </Panel>
        ))}
      </div>
      {!profiles.length && (
        <Panel>
          <Empty icon={Users} title="Your people belong here">
            Add a family member to receive personalized guidance.
          </Empty>
        </Panel>
      )}
      {adding && (
        <Modal title="Add someone you care about" onClose={() => setAdding(false)}>
          <form className="modal-body module-stack" onSubmit={save}>
            <Field label="Name or nickname">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                required
                placeholder="e.g. Dad"
              />
            </Field>
            <Field label="Age or activity group">
              <select value={group} onChange={(e) => setGroup(e.target.value)}>
                {GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>
            <Button disabled={!name.trim()}>
              <Plus size={17} />
              Save profile
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
