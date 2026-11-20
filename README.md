# BREATHEWISE AI

**Predict Pollution. Protect People. Breathe Smarter.**

A full-stack environmental decision dashboard built with React, Vite, Tailwind CSS, Recharts, Leaflet, Lucide, a Node.js API, optional Gemini, and optional Supabase authentication/storage. A Cloudflare Worker adapter deploys the same API and frontend as a single application.

## Start on your laptop

Requires **Node.js 22.16+** and npm. On Windows, run commands in PowerShell or the VS Code terminal.

```bash
npm ci
```

Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`; macOS/Linux: `cp .env.example .env`). All connections are optional for demo mode.

```bash
npm run dev
```

Open the local URL Vite prints, normally `http://localhost:5173`. The Vite development middleware serves `/api` too; a second terminal or API server is **not** required.

For an optimized production build served by Node:

```bash
npm test
npm run build
npm start
```

Open `http://localhost:3001`, or the port from `PORT`. `npm run dev:api` starts only the standalone API/static server and is optional.

## Your first five minutes

1. Explore the **Demo environment**. Every environmental reading, trend and demo route is explicitly illustrative.
2. Select your location in the header. Search a city, choose a suggested city or request browser geolocation.
3. Choose **Try model data**. The API requests current regional air-quality model estimates, provider forecasts and weather from Open-Meteo/Copernicus CAMS. An outage shows labeled demo data, never fabricated live values.
4. In **Family shield**, edit or remove the sample profiles and add your own.
5. In **Daily planner**, add activities and build a schedule. Morning, school and evening cues constrain forecast slots in the selected location’s timezone.
6. Use **Safer routes** to compare mode-specific route geometry, time, distance, modeled pollution context and illustrative operational carbon. You can search towns, enter `latitude, longitude`, or use **Set start / Set destination** on the map.
7. Adjust room, sources and budget in **Clean air home**, then test lifestyle scenarios in **Eco impact**.
8. Ask the assistant a question and download a community safety report.

## Connect Gemini

Set server-only `GEMINI_API_KEY` in `.env` and restart development / production. Optionally set `GEMINI_MODEL` to a model available to your account; the default is `gemini-2.5-flash`. The model is configurable because provider availability changes.

The server calls Gemini’s REST `generateContent` endpoint. Context includes the selected location, supplied AQ/weather data, family nicknames/groups, the current question and up to eight previous turns. The chat remembers the session in browser `sessionStorage`. Do not enter private medical details.

The system instruction prohibits invented measurements/forecasts, unsupported safer-route claims, diagnoses and unverified causal explanations. A missing key, provider outage or unusable model response falls back to a **Rules-based advisor**, clearly shown in each response. The fallback is not generative AI. The daily brief and planner also use transparent rules, independently of Gemini.

**Never place a Gemini secret in a `VITE_` variable or commit `.env`.**

## Connect Supabase

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor. It creates `user_preferences`, enables row-level security, and permits authenticated users to read/write only their own row.
3. Enable email magic-link authentication. Configure the exact local/deployed URL in Authentication → URL Configuration / allowed redirect URLs.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`. Use the anon/publishable key, **never a service-role key**.
5. Restart Vite; for production, rebuild. These two public variables are embedded at build time.
6. Open **Settings & account**, request an email sign-in link, sign in, and use **Save preferences to cloud**. Existing cloud profiles/activities load on sign-in; cloud saving is explicit. Local preferences remain available if cloud operations fail.

Without Supabase configuration, the app uses browser `localStorage` for location, data mode, family profiles, activities and eco scenarios. No database connection is falsely reported as active. Supabase stores profiles and activities only; chat is session-local and environmental feeds are fetched on demand.

## Modules

| Module | Functional behavior |
|---|---|
| Command center | Location search/geolocation, current modeled US AQI, four pollutant cards, all six pollutant values in Data & transparency, 24/48h outlook, past model trend, weather, regional map, data provenance |
| Forecast advisor | Lowest/highest next-24h values, current-vs-average comparison, provider trend charts, contextual explanation through the assistant |
| Safer routes | User-selected endpoints; driving, cycling and walking OSRM profiles; transit road scenario; route alternatives when returned; regional PM2.5 sampling; transparent time/exposure/emission comparison |
| Family shield | Add, rename, categorize and remove up to 12 profiles; group-sensitive precautions |
| Daily planner | Up to 10 activities, time-of-day constraints, local timezone, sensitive-group threshold, current weather context, indoor alternatives, schedule copying |
| Clean air home | Four room types, room area, budget, source checklist, ventilation/source-control guidance, transparent CADR sizing estimate |
| Eco impact | Transport switching, electricity savings including efficient appliances, reusables, weekly/annual estimates, visible factors and formulas |
| Conversational assistant | Gemini integration, contextual session history, useful follow-ups, error states and a labeled rule-based fallback |
| Community | Location map, available/unavailable evidence, community action-plan prompts, downloadable Markdown safety report with provenance and limitations |

## Structure

```text
src/
  App.jsx               All product views, controls, report export, session chat
  Charts.jsx            Recharts trend and impact charts
  MapView.jsx           Leaflet map, routes, point picking
  domain.js             AQI categories, planning, indoor guidance, emissions, demo data
  cloud.js              Optional Supabase client
  ErrorBoundary.jsx     Recoverable UI failure screen
  styles.css            Responsive navy/emerald design and accessibility styles
server/
  api.js                Shared Fetch API handler, provider integrations and caching
  node.js               Express adapter for local/self-hosted deployments
  worker.js             Cloudflare Fetch adapter and embedded asset serving
scripts/
  build-worker.mjs      Builds standalone Worker from Vite assets and shared API
supabase/schema.sql     Authenticated storage with RLS
 tests/domain.test.js   Calculation, provenance, fallback, validation and planner checks
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting, environment variables and provider usage constraints, [ARCHITECTURE.md](ARCHITECTURE.md) for data contracts and assumptions, and [DEMO_GUIDE.md](DEMO_GUIDE.md) for a presentation walkthrough.

## Verification

`npm test` runs Node’s built-in test runner. Tests verify US AQI boundaries, exact emission arithmetic, distinct local-time scheduling, honest provenance, null pollutants, invalid input, demo routes, chat fallback and upstream outage behavior. `npm run build` builds the production frontend and bundled server Worker.

## Limits that matter

- This integration provides **regional model estimates**, not verified real-time station observations. There is no connected indoor sensor network.
- The global CAMS grid is approximately 45 km; European CAMS is approximately 11 km. Neighboring streets cannot be reliably ranked by this data.
- No live traffic feed, transit timetable, verified emission inventory or inhaled-dose model is connected.
- The US AQI scale is explicitly used; do not interpret it as India’s CPCB AQI.
- Forecasts come from the provider, never from invented AI numbers. Historical trends are model history.
- App alerts are in-app only; there are no background pushes or scheduled monitoring.
- There are no guaranteed pollution-related health outcomes. Follow local official guidance and individual care plans.

## Source acknowledgments

- [Open-Meteo air-quality API](https://open-meteo.com/en/docs/air-quality-api), [weather API](https://open-meteo.com/en/docs), [geocoding API](https://open-meteo.com/en/docs/geocoding-api).
- Copernicus Atmosphere Monitoring Service (CAMS); CAMS European ENSEMBLE data where applicable.
- [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), [OSRM](https://project-osrm.org/docs/v5.24.0/api/) and CARTO basemaps.
- [AirNow US AQI basics](https://www.airnow.gov/aqi/aqi-basics/) and [EPA filtration guidance](https://www.epa.gov/indoor-air-quality-iaq/air-cleaners-hvac-filters-and-respiratory-viruses) inform general precaution content.
- Carbon factors are explicitly **illustrative scenario assumptions**, not falsely attributed official emission factors.
