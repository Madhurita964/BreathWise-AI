import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Globe,
  Leaf,
  MapPin,
  Menu,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Wind,
} from 'lucide-react';
import { supabase } from './cloud';
import { Chat } from './components/Chat';
import { CleanHome } from './components/CleanHome';
import { Community } from './components/Community';
import { Eco } from './components/Eco';
import { Family } from './components/Family';
import { Forecast } from './components/Forecast';
import { LocationModal } from './components/LocationModal';
import { Overview } from './components/Overview';
import { Planner } from './components/Planner';
import { Routes } from './components/Routes';
import { SettingsModal } from './components/SettingsModal';
import { SourceDetails } from './components/SourceDetails';
import { Badge, Button, Modal, Notice } from './components/ui';
import { CITIES, DEFAULT_PROFILES, NAV } from './constants';
import { advice, demoAir, severity } from './domain';
import { api, fmt, saved } from './lib/helpers';

export default function App() {
  const [page, setPage] = useState('overview');
  const [loc, setLoc] = useState(() => saved('bw-location', CITIES[0]));
  const [demo, setDemo] = useState(() => saved('bw-demo', true));
  const [data, setData] = useState(() => demoAir(loc));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profiles, setProfiles] = useState(() => saved('bw-profiles', DEFAULT_PROFILES));
  const [activities, setActivities] = useState(() =>
    saved('bw-activities', ['Morning walk', 'School drop-off', 'Evening groceries'])
  );
  const [modal, setModal] = useState(null);
  const [chat, setChat] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [mobile, setMobile] = useState(false);
  const [toast, setToast] = useState('');
  const [session, setSession] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');
  const generation = useRef(0);
  const cloudReady = useRef(false);
  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 4500);
  };
  async function load() {
    const id = ++generation.current;
    setLoading(true);
    setError('');
    try {
      const next = await api(
        `air?lat=${loc.latitude}&lon=${loc.longitude}&name=${encodeURIComponent(loc.name)}&demo=${demo}`
      );
      if (id !== generation.current) return;
      setData(next);
      if (next.fallback)
        setError('Model service unavailable. The dashboard is showing demo data.');
    } catch (e) {
      if (id !== generation.current) return;
      setData(demoAir(loc));
      setError(e.message + ' Displaying labeled demo data.');
    } finally {
      if (id === generation.current) setLoading(false);
    }
  }
  useEffect(() => {
    load();
    localStorage.setItem('bw-location', JSON.stringify(loc));
    localStorage.setItem('bw-demo', JSON.stringify(demo));
  }, [loc, demo]);
  useEffect(() => {
    localStorage.setItem('bw-profiles', JSON.stringify(profiles));
  }, [profiles]);
  useEffect(() => {
    localStorage.setItem('bw-activities', JSON.stringify(activities));
  }, [activities]);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, s) => {
      cloudReady.current = false;
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session || !supabase) return;
    let cancel = false;
    supabase
      .from('user_preferences')
      .select('profiles,activities')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancel) return;
        if (error) {
          setSyncStatus('Cloud read failed. Local changes are retained.');
          return;
        }
        if (data) {
          setProfiles(data.profiles);
          setActivities(data.activities);
        }
        cloudReady.current = true;
        setSyncStatus('Cloud sync ready');
      });
    return () => {
      cancel = true;
    };
  }, [session]);
  async function sync() {
    if (!session || !cloudReady.current) return;
    const { error } = await supabase.from('user_preferences').upsert({
      user_id: session.user.id,
      profiles,
      activities,
      updated_at: new Date().toISOString(),
    });
    setSyncStatus(
      error ? 'Cloud save failed. Local changes are retained.' : 'Saved to your account'
    );
    notify(
      error
        ? 'Cloud save failed. Check Supabase setup.'
        : 'Preferences saved to your account.'
    );
  }
  function navigate(p) {
    setPage(p);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function ask(prompt) {
    setChatPrompt(prompt);
    setChat(true);
  }
  function report() {
    const s = severity(data.current.aqi);
    const content = `# BREATHEWISE AI · Community Air Safety Report\n\nGenerated: ${new Date().toISOString()}\nLocation: ${loc.name} (${loc.latitude}, ${loc.longitude})\nData type: ${data.mode === 'demo' ? 'ILLUSTRATIVE DEMO DATA' : 'REGIONAL MODEL ESTIMATES, NOT STATION MEASUREMENTS'}\nSource: ${data.source}\nSource URL: ${data.sourceUrl || 'Not applicable: demo data'}\nValid time: ${data.time}\nRetrieved: ${data.fetchedAt}\nUS AQI: ${data.current.aqi} (${s.label})\nPM2.5: ${data.current.pm25} µg/m³\nPM10: ${data.current.pm10} µg/m³\n\n## Community actions\n- ${advice(data.current.aqi, 'Child')}\n- Reduce idling near schools and clinics.\n- Avoid open waste burning and indoor smoke.\n- Share official local monitoring information.\n\n## Family guidance\n${profiles.map((p) => '- ' + p.group + ': ' + advice(data.current.aqi, p.group)).join('\n')}\n\n## Limitations\n${data.notice}\n${data.resolution}\nNo street-level monitoring, live traffic, or measured indoor pollution is available. AQI uses the US scale; it is not India's CPCB AQI. Guidance is not a guarantee of safety.\n\n## Data acknowledgments\nOpen-Meteo and Copernicus Atmosphere Monitoring Service (CAMS); CAMS European ENSEMBLE where applicable. Map: OpenStreetMap contributors, CARTO.\n`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'breathewise-community-report.md';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Your safety report has been downloaded.');
  }
  const s = severity(data.current.aqi);
  const common = {
    data,
    profiles,
    setProfiles,
    activities,
    setActivities,
    ask,
    notify,
    navigate,
    demo: data.mode === 'demo',
  };
  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      {mobile && <div className="sidebar-shade" onClick={() => setMobile(false)} />}
      <aside className={'sidebar ' + (mobile ? 'open' : '')}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('overview');
          }}
        >
          <span className="brand-icon">
            <Wind size={27} />
          </span>
          <div>
            BREATHEWISE<span>AI INTELLIGENCE PLATFORM</span>
          </div>
        </a>
        <div className="workspace">
          <span className="workspace-icon">
            <Globe size={17} />
          </span>
          <div>
            Your environment<small>Personal workspace</small>
          </div>
          <ChevronDown size={14} />
        </div>
        <div className="nav-label">YOUR INTELLIGENCE</div>
        <nav>
          {NAV.map(([id, name, Icon]) => (
            <button
              key={id}
              className={'nav-item ' + (page === id ? 'active' : '')}
              onClick={() => navigate(id)}
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon size={19} />
              <span>{name}</span>
              {id === 'forecast' && <span className="ai-tag">AI</span>}
              {page === id && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="planet-card">
            <div className="planet-leaf">
              <Leaf size={22} />
              <span>SMALL STEPS. REAL IMPACT.</span>
            </div>
            <p>
              A healthier planet
              <br />
              starts with your day.
            </p>
            <button onClick={() => navigate('eco')}>
              Explore your impact <ChevronRight size={16} />
            </button>
          </div>
          <button className="nav-item" onClick={() => setModal('sources')}>
            <BookOpen size={19} />
            Data & transparency
          </button>
          <button className="nav-item" onClick={() => setModal('settings')}>
            <Settings size={19} />
            Settings & account
          </button>
          <div className="profile-mini">
            <span className="avatar">MG</span>
            <div>
              {session ? 'Your account' : 'Your personal space'}
              <small>{session ? 'Cloud sync enabled' : 'Saved on this device'}</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobile(true)}
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />{' '}
            <strong>{NAV.find((n) => n[0] === page)?.[1]}</strong>
          </div>
          <div className="topbar-actions">
            <button className="location-button" onClick={() => setModal('location')}>
              <MapPin size={16} />
              <span>
                {loc.name}, {loc.name === 'Kolkata' ? 'India' : 'change location'}
              </span>
              <ChevronDown size={14} />
            </button>
            <span className="top-divider" />
            <button
              className="icon-button notification"
              aria-label="View current pollution alerts"
              onClick={() => setModal('alerts')}
            >
              <Bell size={19} />
              {data.current.aqi > 100 && <span />}
            </button>
            <button
              className="avatar top-avatar"
              onClick={() => setModal('settings')}
              aria-label="Open account settings"
            >
              MG
            </button>
          </div>
        </header>
        <main id="main">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="little-line" /> YOUR AIR. YOUR ADVANTAGE.
              </div>
              <h1>
                {
                  {
                    overview: 'Air quality command center',
                    forecast: 'See tomorrow. Plan better.',
                    routes: 'A more mindful way to move.',
                    family: 'Cleaner air, for everyone you love.',
                    planner: 'Make room for a better day.',
                    home: 'Your home. Your clean-air haven.',
                    eco: 'Small changes. Measurable impact.',
                    community: 'Better air begins together.',
                  }[page]
                }
              </h1>
              <p>
                {
                  {
                    overview:
                      'A clearer picture of your air. A smarter plan for your day.',
                    forecast:
                      'Understand the outlook and turn environmental signals into action.',
                    routes: 'Compare the journey, the time, and the trade-offs.',
                    family: 'Personalized precautions for every member of your family.',
                    planner:
                      'Turn the air-quality outlook into a practical daily schedule.',
                    home: 'Practical, room-by-room improvements for the air you breathe.',
                    eco: 'Explore the carbon savings behind your everyday choices.',
                    community:
                      'Turn local environmental information into collective action.',
                  }[page]
                }
              </p>
            </div>
            <div className="heading-actions">
              <Button variant="ghost" onClick={report}>
                <Download size={16} />
                Export report
              </Button>
              <Button
                onClick={() => ask('What should my family know about the air today?')}
              >
                <Sparkles size={16} />
                Ask Breathewise
              </Button>
            </div>
          </div>
          <div className="status-strip">
            <div>
              <span className={'status-led ' + (data.mode === 'demo' ? 'demo' : '')} />
              <strong>
                {loading
                  ? 'Updating your environment…'
                  : data.mode === 'demo'
                    ? 'Demo environment'
                    : 'Model data connected'}
              </strong>
              <span className="status-extra">
                {data.mode === 'demo'
                  ? 'Illustrative data · not current conditions'
                  : 'Open-Meteo / CAMS · not station measurements'}
              </span>
            </div>
            <button
              onClick={() => {
                setDemo(!demo);
                notify(
                  demo
                    ? 'Requesting current regional model data…'
                    : 'Switched to illustrative demo mode.'
                );
              }}
              disabled={loading}
            >
              {demo ? 'Try model data' : 'Use demo mode'}
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
            </button>
          </div>
          {error && (
            <Notice kind="warning">
              {error}{' '}
              <button className="text-button" onClick={load}>
                Retry data
              </button>
            </Notice>
          )}
          {loading && (
            <div
              className="loading-line"
              role="status"
              aria-label="Loading air quality data"
            />
          )}
          {page === 'overview' && (
            <Overview {...common} setModal={setModal} load={load} />
          )}
          {page === 'forecast' && <Forecast {...common} />}
          {page === 'routes' && <Routes {...common} location={loc} />}
          {page === 'family' && <Family {...common} />}
          {page === 'planner' && <Planner {...common} />}
          {page === 'home' && <CleanHome {...common} />}
          {page === 'eco' && <Eco {...common} />}
          {page === 'community' && <Community {...common} report={report} />}
          <footer>
            <span>
              <Wind size={14} /> BREATHEWISE AI{' '}
              <span className="footer-tagline">
                · Predict Pollution. Protect People. Breathe Smarter.
              </span>
            </span>
            <button onClick={() => setModal('sources')}>
              Built on transparency <ShieldCheck size={13} />
            </button>
          </footer>
        </main>
      </div>
      {!chat && (
        <button
          className="chat-fab"
          onClick={() => setChat(true)}
          aria-label="Open Breathewise assistant"
        >
          <Sparkles size={21} />
          <span>Let’s clear the air</span>
          <span className="fab-dot" />
        </button>
      )}
      {chat && (
        <Chat
          {...common}
          prompt={chatPrompt}
          onClose={() => {
            setChat(false);
            setChatPrompt('');
          }}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
      {modal === 'location' && (
        <LocationModal
          onClose={() => setModal(null)}
          select={(x) => {
            setLoc(x);
            setModal(null);
          }}
          notify={notify}
        />
      )}
      {modal === 'sources' && (
        <Modal
          title="Data you can understand. Sources you can trust."
          onClose={() => setModal(null)}
          wide
        >
          <div className="modal-body">
            <SourceDetails data={data} />
          </div>
        </Modal>
      )}
      {modal === 'alerts' && (
        <Modal title="Your air-quality alerts" onClose={() => setModal(null)}>
          <div className="modal-body">
            <Badge tone="amber">{s.label}</Badge>
            <h3>
              US AQI {fmt(data.current.aqi)} · {loc.name}
            </h3>
            <p>{advice(data.current.aqi, 'Child')}</p>
            <Notice>
              These are in-app advisories based on{' '}
              {data.mode === 'demo' ? 'illustrative demo' : 'regional model'} data. Push
              notifications and background monitoring are not enabled.
            </Notice>
            <Button
              onClick={() => {
                setModal(null);
                navigate('forecast');
              }}
            >
              Review the outlook
            </Button>
          </div>
        </Modal>
      )}
      {modal === 'settings' && (
        <SettingsModal
          demo={demo}
          setDemo={setDemo}
          session={session}
          sync={sync}
          syncStatus={syncStatus}
          onClose={() => setModal(null)}
          notify={notify}
        />
      )}
    </div>
  );
}
