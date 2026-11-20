import { test } from 'node:test';
import assert from 'node:assert/strict';
import { severity, ecoSavings, demoAir, makePlan, homeGuidance } from '../src/domain.js';
import { handleApi } from '../server/api.js';
test('US AQI boundaries preserve sensitive and unhealthy categories', () => {
  assert.equal(severity(50).level, 0);
  assert.equal(severity(51).level, 1);
  assert.equal(severity(100).level, 1);
  assert.equal(severity(101).level, 2);
  assert.equal(severity(150).level, 2);
  assert.equal(severity(151).level, 3);
  assert.equal(severity(201).level, 4);
  assert.equal(severity(301).level, 5);
  assert.equal(severity(null).label, 'Unavailable');
});
test('emissions scenario calculates passenger-km and energy without double counting', () => {
  const r = ecoSavings({ km: 10, days: 5, mode: 'bus', kwh: 5, grid: 0.7, reusable: 5 });
  assert.ok(Math.abs(r.travel - 3.3) < 1e-10);
  assert.ok(Math.abs(r.weekly - 6.9) < 1e-10);
  assert.ok(Math.abs(r.annual - 358.8) < 1e-10);
  const zero = ecoSavings({ km: 0, days: 0, kwh: 0, reusable: 0 });
  assert.equal(zero.weekly, 0);
});
test('demo data explicitly identifies illustrative values and forecast kinds', () => {
  const d = demoAir();
  assert.equal(d.mode, 'demo');
  assert.equal(d.kind, 'illustrative');
  assert.ok(d.hourly.some((h) => h.kind === 'history'));
  assert.ok(d.hourly.some((h) => h.kind === 'forecast'));
});
test('planner uses distinct future slots and stricter sensitive-group guidance', () => {
  const now = Date.parse('2026-11-20T03:00:00Z');
  const d = {
    hourly: Array.from({ length: 8 }, (_, i) => ({
      time: new Date(now + i * 3600000).toISOString(),
      kind: 'forecast',
      aqi: 130 + i,
    })),
    timezone: 'Asia/Kolkata',
  };
  const plan = makePlan(d, ['Walk', 'Shop'], [{ group: 'Child' }]);
  assert.equal(plan.length, 2);
  assert.equal(new Set(plan.map((p) => p.time)).size, 2);
  assert.ok(plan.every((p) => p.indoor));
  assert.deepEqual(makePlan({ hourly: [] }, ['Walk']), []);
});
test('indoor guidance does not claim indoor sensor measurements', () => {
  const g = homeGuidance('Kitchen', 0, 170, ['Incense']);
  assert.ok(g.some((x) => x.text.includes('extractor')));
  assert.ok(g.some((x) => x.text.includes('smoke-free')));
});
test('invalid coordinates are rejected before external requests', async () => {
  const r = await handleApi(new Request('https://app.test/api/air?lat=99&lon=0'));
  assert.equal(r.status, 400);
});
test('demo API is deterministic in provenance and exposes no credentials', async () => {
  const r = await handleApi(
    new Request('https://app.test/api/air?lat=22&lon=88&demo=true'),
    { GEMINI_API_KEY: 'secret' }
  );
  const d = await r.json();
  assert.equal(d.mode, 'demo');
  assert.ok(!JSON.stringify(d).includes('secret'));
});
test('chat fallback explains its origin and retains environmental context', async () => {
  const r = await handleApi(
    new Request('https://app.test/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        question: 'Can I walk today?',
        context: demoAir(),
        profiles: [{ group: 'Child' }],
      }),
    })
  );
  const d = await r.json();
  assert.equal(d.engine, 'Rules-based advisor');
  assert.ok(d.answer.includes('illustrative demo data'));
  assert.ok(d.notice.includes('GEMINI_API_KEY'));
});
test('empty chat input is rejected', async () => {
  const r = await handleApi(
    new Request('https://app.test/api/chat', {
      method: 'POST',
      body: JSON.stringify({ question: '' }),
    })
  );
  assert.equal(r.status, 400);
});
test('routing does not convert demo inputs into verified safety claims', async () => {
  const r = await handleApi(
    new Request('https://app.test/api/routes', {
      method: 'POST',
      body: JSON.stringify({
        demo: true,
        start: { latitude: 22.57, longitude: 88.36 },
        end: { latitude: 22.54, longitude: 88.34 },
        mode: 'cycle',
      }),
    })
  );
  const d = await r.json();
  assert.equal(d.mode, 'demo');
  assert.equal(d.routes[0].emissions, 0);
  assert.ok(d.notice.includes('Not for navigation'));
});
test('provider outage falls back to explicitly labeled demo', async () => {
  const old = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('offline');
  };
  try {
    const r = await handleApi(new Request('https://app.test/api/air?lat=10&lon=20'));
    const d = await r.json();
    assert.equal(d.fallback, true);
    assert.equal(d.mode, 'demo');
    assert.ok(d.notice.includes('not current'));
  } finally {
    globalThis.fetch = old;
  }
});
test('live adapter keeps null pollutants and labels CAMS as modeled, not measured', async () => {
  const old = globalThis.fetch;
  globalThis.fetch = async (u) =>
    new Response(
      JSON.stringify(
        String(u).includes('air-quality')
          ? {
              current: { time: 1800000000, us_aqi: 81, pm2_5: 12, pm10: null },
              hourly: {
                time: [1800000000, 1900000000],
                us_aqi: [81, null],
                pm2_5: [12, null],
              },
              timezone: 'UTC',
            }
          : {
              current: {
                temperature_2m: 24,
                relative_humidity_2m: 50,
                wind_speed_10m: 12,
              },
            }
      )
    );
  try {
    const r = await handleApi(
      new Request('https://app.test/api/air?lat=11&lon=21&name=Test')
    );
    const d = await r.json();
    assert.equal(d.kind, 'modeled');
    assert.equal(d.current.pm10, null);
    assert.equal(d.hourly[1].aqi, null);
    assert.equal(d.hourly[1].kind, 'forecast');
    assert.ok(d.notice.includes('not station'));
  } finally {
    globalThis.fetch = old;
  }
});

test('planner honors morning and school time constraints in the location timezone', () => {
  const d = demoAir();
  const plan = makePlan(
    d,
    ['Morning walk', 'School drop-off', 'Evening groceries'],
    [{ group: 'Child' }]
  );
  for (const p of plan) {
    if (!p.time) continue;
    const hour = Number(
      new Intl.DateTimeFormat('en-GB', {
        hour: 'numeric',
        hourCycle: 'h23',
        timeZone: d.timezone,
      }).format(new Date(p.time))
    );
    if (p.activity === 'Morning walk') assert.ok(hour >= 6 && hour < 11);
    if (p.activity === 'School drop-off') assert.ok(hour >= 7 && hour < 10);
    if (p.activity === 'Evening groceries') assert.ok(hour >= 16 && hour < 21);
  }
});
