import { useEffect, useState } from 'react';
import { CheckCheck, Lock, Mail, Sparkles } from 'lucide-react';
import { supabase } from '../cloud';
import { api } from '../lib/helpers';
import { Badge, Button, Field, Modal, Notice } from './ui';

export function SettingsModal({
  demo,
  setDemo,
  session,
  sync,
  syncStatus,
  onClose,
  notify,
}) {
  const [health, setHealth] = useState(null);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api('health')
      .then(setHealth)
      .catch(() => setHealth({ ok: false }));
  }, []);
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    notify(error ? error.message : 'Check your email for a secure sign-in link.');
    setBusy(false);
  }
  return (
    <Modal title="Your preferences & connections" onClose={onClose}>
      <div className="modal-body module-stack">
        <div className="setting-row">
          <div>
            <h3>Demo environment</h3>
            <p>Explore with illustrative, clearly labeled data.</p>
          </div>
          <button
            className={'toggle ' + (demo ? 'on' : '')}
            role="switch"
            aria-checked={demo}
            onClick={() => setDemo(!demo)}
            aria-label="Demo environment"
          >
            <span />
          </button>
        </div>
        <div className="connection">
          <Sparkles />
          <div>
            <strong>Generative AI</strong>
            <p>
              {health === null
                ? 'Checking connection…'
                : health.aiConfigured
                  ? 'Gemini API key configured on server'
                  : 'Rules-based advisor active. Add GEMINI_API_KEY to enable Gemini.'}
            </p>
          </div>
          <Badge tone={health?.aiConfigured ? 'green' : 'slate'}>
            {health?.aiConfigured ? 'Connected' : 'Fallback'}
          </Badge>
        </div>
        <div className="connection">
          <Lock />
          <div>
            <strong>Supabase account</strong>
            <p>
              {supabase
                ? 'Sign in to sync family profiles and activities.'
                : 'Optional cloud sync is not configured. Your preferences remain on this device.'}
            </p>
          </div>
        </div>
        {supabase &&
          (session ? (
            <div className="module-stack">
              <p>Signed in as {session.user.email}</p>
              <Button onClick={sync}>
                <CheckCheck size={16} />
                Save preferences to cloud
              </Button>
              <span className="subtle">{syncStatus}</span>
              <Button
                variant="ghost"
                onClick={async () => {
                  await supabase.auth.signOut();
                  notify('Signed out. Device preferences remain available.');
                }}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <form onSubmit={login} className="module-stack">
              <Field label="Email for secure sign-in link">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </Field>
              <Button disabled={busy}>
                <Mail size={16} />
                {busy ? 'Sending…' : 'Send sign-in link'}
              </Button>
            </form>
          ))}
        <Notice>
          Family profiles and activities are saved locally. Chat history lasts within this
          browser tab’s session and is sent with environmental context to the AI provider
          only when you ask a question. Never enter sensitive medical details.
        </Notice>
      </div>
    </Modal>
  );
}
