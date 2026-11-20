export function saved(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function api(path, options) {
  const response = await fetch('/api/' + path, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please retry.');
  return data;
}

export function post(path, data) {
  return api(path, { method: 'POST', body: JSON.stringify(data) });
}

export function fmt(n, dec = 0) {
  return Number.isFinite(n) ? n.toFixed(dec) : '—';
}

export function time(t, data) {
  return new Date(t).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: data.timezone,
  });
}
