import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, Send, Sparkles, Wind, X } from 'lucide-react';
import { fmt, post } from '../lib/helpers';
import { Notice } from './ui';

export function Chat({ data, profiles, prompt, onClose }) {
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('bw-chat')) || [];
    } catch {
      return [];
    }
  });
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const end = useRef();
  const sending = useRef(false);
  async function send(question) {
    const text = question.trim();
    if (!text || sending.current) return;
    sending.current = true;
    const history = messages;
    setMessages((m) => [...m, { role: 'user', text }]);
    setQ('');
    setBusy(true);
    setErr('');
    try {
      const result = await post('chat', {
        question: text,
        history: history.slice(-8),
        context: data,
        profiles,
      });
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: result.answer,
          engine: result.engine,
          kind: result.kind,
          notice: result.notice,
        },
      ]);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
      sending.current = false;
    }
  }
  useEffect(() => {
    if (prompt) send(prompt);
  }, [prompt]);
  useEffect(() => {
    sessionStorage.setItem('bw-chat', JSON.stringify(messages.slice(-30)));
    end.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);
  return (
    <aside
      className="chat-drawer"
      role="dialog"
      aria-modal="false"
      aria-label="Breathewise conversational assistant"
    >
      <div className="chat-header">
        <span className="brand-icon">
          <Sparkles size={22} />
        </span>
        <div>
          <h2>Your air-aware assistant</h2>
          <span>Contextual guidance · {data.location.name}</span>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close assistant">
          <X size={21} />
        </button>
      </div>
      <div className="chat-context">
        <span className="dot" />
        {data.mode === 'demo' ? 'Demo context' : 'Regional model context'} · US AQI{' '}
        {fmt(data.current.aqi)} · {profiles.length} profiles
      </div>
      <div className="chat-messages" aria-live="polite">
        {!messages.length && (
          <div className="chat-welcome">
            <span className="eco-orb">
              <Wind size={34} />
            </span>
            <h3>A little clarity goes a long way.</h3>
            <p>Ask about your air, your family’s day, or a healthier home.</p>
            <div>
              {[
                'Can my family go for a walk today?',
                'How can I improve indoor air?',
                'Explain PM2.5 simply',
              ].map((x) => (
                <button key={x} onClick={() => send(x)}>
                  {x}
                  <Sparkles size={14} />
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={'chat-message ' + m.role}>
            {m.role === 'assistant' && (
              <span className="assistant-label">
                <Sparkles size={13} />
                {m.engine} · {m.kind}
              </span>
            )}
            <p>{m.text}</p>
            {m.notice && <small>{m.notice}</small>}
          </div>
        ))}
        {busy && (
          <div className="thinking">
            <LoaderCircle size={16} className="spin" />
            Considering your context…
          </div>
        )}
        {err && <Notice kind="warning">{err} Please resend your question.</Notice>}
        <div ref={end} />
      </div>
      <div className="chat-compose">
        {messages.length > 0 && (
          <div className="chat-followups">
            {['Plan a walk', 'Indoor air tips'].map((x) => (
              <button key={x} disabled={busy} onClick={() => send(x)}>
                {x}
              </button>
            ))}
            <button onClick={() => setMessages([])} disabled={busy}>
              Clear session
            </button>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(q);
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Let’s clear the air…"
            aria-label="Message Breathewise"
            maxLength={2000}
          />
          <button disabled={busy || !q.trim()} aria-label="Send question">
            <Send size={19} />
          </button>
        </form>
        <p>
          Gemini when configured · transparent rules fallback
          <br />
          AI guidance can be wrong. Verify important decisions.
        </p>
      </div>
    </aside>
  );
}
