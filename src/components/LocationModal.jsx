import { useEffect, useState } from 'react';
import {
  Check,
  ChevronRight,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Search,
} from 'lucide-react';
import { CITIES } from '../constants';
import { api } from '../lib/helpers';
import { Button, Field, Modal, Notice } from './ui';

export function LocationModal({ onClose, select, notify }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function search(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const d = await api('geocode?q=' + encodeURIComponent(q));
      setResults(d.results);
      if (!d.results.length)
        setErr('No city found. Try a nearby town or a more specific place name.');
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Bring your environment into focus" onClose={onClose}>
      <div className="modal-body">
        <p>
          Search a city or use your location. Regional model coverage is not a
          neighborhood sensor reading.
        </p>
        <form onSubmit={search} className="search-form">
          <Search size={18} />
          <input
            autoFocus
            placeholder="Search city or town…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            minLength={2}
            maxLength={100}
            aria-label="City name"
            required
          />
          <Button disabled={busy}>
            {busy ? <LoaderCircle className="spin" size={17} /> : 'Search'}
          </Button>
        </form>
        {err && <Notice kind="warning">{err}</Notice>}
        <div className="city-list">
          {(results.length ? results : CITIES).map((c) => (
            <button key={c.latitude + ',' + c.longitude} onClick={() => select(c)}>
              <MapPin size={18} />
              <div>
                {c.name}
                <small>{c.label}</small>
              </div>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            if (!navigator.geolocation) {
              setErr('Geolocation is unavailable in this browser.');
              return;
            }
            setBusy(true);
            navigator.geolocation.getCurrentPosition(
              (p) => {
                select({
                  name: 'Your location',
                  latitude: p.coords.latitude,
                  longitude: p.coords.longitude,
                });
                setBusy(false);
              },
              () => {
                setErr('Location access is unavailable. Please search a city instead.');
                setBusy(false);
              },
              { timeout: 10000 }
            );
          }}
        >
          <LocateFixed size={17} />
          Use my current location
        </Button>
      </div>
    </Modal>
  );
}

export function PlaceInput({ label, value, onChange }) {
  const [q, setQ] = useState(value?.name || '');
  useEffect(() => {
    if (value) setQ(value.name);
  }, [value]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function search() {
    setError('');
    setBusy(true);
    try {
      setItems((await api('geocode?q=' + encodeURIComponent(q))).results);
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }
  return (
    <div className="place-input">
      <Field label={label}>
        <div className="input-button">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              onChange(null);
            }}
            placeholder="City, town or latitude, longitude"
            aria-label={label}
          />
          <button
            onClick={search}
            disabled={q.length < 2 || busy}
            aria-label={'Find ' + label}
          >
            {busy ? <LoaderCircle className="spin" size={16} /> : <Search size={16} />}
          </button>
        </div>
      </Field>
      {value && (
        <small className="valid-selection">
          <Check size={13} />
          Selected location
        </small>
      )}
      {error && <small className="error-text">{error}</small>}
      {items.length > 0 && (
        <div className="place-results">
          {items.map((c) => (
            <button
              key={c.latitude + ',' + c.longitude}
              onClick={() => {
                onChange(c);
                setQ(c.name);
                setItems([]);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
