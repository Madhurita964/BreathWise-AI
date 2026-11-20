# Architecture & evidence model

## Request path

React UI → same-origin `/api` → shared Fetch handler → provider adapters. The Fetch handler runs behind Express locally or a bundled Cloudflare Worker when hosted. Business calculations live in `src/domain.js` and are reused by server and client.

## Data contracts

`GET /api/air?lat=22.5726&lon=88.3639&name=Kolkata&demo=false`

Returns `mode` (`live` / `demo`), `kind` (`modeled` / `illustrative`), `source`, `sourceUrl`, `time` (value valid time), `fetchedAt` (retrieval time), `timezone`, `resolution`, `notice`, `location`, `current`, nullable `weather`, and `hourly` rows. Each hourly row has an ISO UTC `time`, nullable `aqi`, nullable `pm25`, and a `kind` of `history` or `forecast`. History is model history, not observed history. Missing pollutants stay null/absent and display as a dash; missing values never become fabricated zeros.

Current pollutant fields: `aqi` (US AQI), `pm25`, `pm10`, `no2`, `o3`, `so2`, `co` (all concentration fields in µg/m³). Weather fields: temperature °C, humidity %, wind km/h, and evidence kind.

On provider error the air endpoint returns an explicitly labeled demo with `fallback: true`. The frontend additionally warns the user. An explicit demo request never contacts environmental providers.

`GET /api/geocode?q=...`

User-triggered Open-Meteo place-name search (city/town level). `latitude, longitude` input is parsed and range-validated locally by the server without a provider request. Arbitrary street points can also be picked directly on the map. The app does not pretend its city geocoder is full street-address search.

`POST /api/routes`

Body: `{start: {latitude,longitude}, end: {...}, mode: car|bus|walk|cycle, demo: boolean}`.

Returns one to three alternatives when supported, geometry, distance km, estimated duration min, operational kg CO₂e/person, nullable regional PM2.5 and nullable exposure proxy. Walking/cycling select their appropriate upstream routing datasets; using the string `walking` against the public driving OSRM dataset would be incorrect and is deliberately avoided.

For each live route, current model PM2.5 is requested at origin, midpoint and destination. If any sample is missing, the exposure index is unavailable. Otherwise:

`exposure proxy = arithmetic mean PM2.5 × estimated travel minutes`.

Units: µg·min/m³. It is not inhaled dose. It does not include breathing rate, cabin filtration, elevation, route-segment weighting or traffic hot spots. Regional model resolution is too coarse to certify the safer street. Demo proxies are labeled illustrative. Transit uses driving geometry at an assumed 22 km/h and is not a bus timetable. The transport scenario table uses one common distance and explicit assumed speeds rather than implying alternate mode routes were verified.

`POST /api/chat`

Body: `{question, context, profiles, history}`. The endpoint validates question/payload length, limits history and profile count, calls Gemini if configured, and returns `{answer,engine,kind,notice?,followups}`. The context originates from the browser and is treated as untrusted supplied app state. A prompt is a constraint, not a guarantee; model output is always labeled guidance.

`GET /api/health`

Returns API availability, environmental provider name and whether an AI key is configured. It never returns a secret or claims that key presence proves provider availability.

## Personalization & scheduling

Family groups: adult, child, older adult, outdoor worker. Any non-adult group activates the stricter planner AQI threshold (100 vs 150 for adults); these thresholds guide indoor alternatives and do not mean lower values guarantee safety.

The planner examines the next 24 supplied forecast hours, ranks by AQI and selects unused slots constrained by local hour: school/drop-off 07:00–10:00, morning/breakfast 06:00–11:00, evening/dinner 16:00–21:00, lunch/noon 12:00–15:00, otherwise 07:00–21:00. End times are exclusive. With no matching slot it shows an unscheduled item, not an unrelated time. It does not know fixed appointments or trip durations. Current weather is shown as context; hot-weather guidance is added above 32°C. There is no hourly rain/UV forecast integration.

## Emission assumptions

Default illustrative operational factors, kg CO₂e/passenger-km:

| Mode | Factor |
|---|---:|
| Solo car | 0.171 |
| Bus | 0.105 |
| Rail / metro | 0.035 |
| Walking / cycling | 0 |

`transport = switched km/day × days/week × (car factor − new factor)`

`electricity = kWh saved/week × user-selected grid factor`

`products = single-use items avoided/week × 0.02`

`weekly = transport + electricity + products`; `annual = weekly × 52`.

The grid default of 0.70 and the reusable-product factor are examples, not verified regional lifecycle inventories. Efficient-appliance savings are entered in the same kWh field to avoid double counting. No tree-equivalence or local AQI improvement is invented.

## Indoor guidance

No indoor readings are synthesized. Room type, area, budget, sources and outdoor context drive guidance. Illustrative filtration sizing is area × assumed 2.7 m ceiling × 4–5 air changes/hour. Purchase guidance gives functional criteria, not unverified product prices. Moisture and smoke source control remain priorities.

## Persistence & privacy

Browser localStorage: selected location, demo flag, profiles, activities, eco scenario. sessionStorage: recent chat turns. Optional Supabase `user_preferences`: authenticated owner’s profiles/activities, protected by RLS. Existing cloud preferences load at sign-in; cloud saving is explicit. Chat is not written to Supabase.

Provider calls transmit locations to environmental/routing services. Chat transmits supplied context and selected profile fields to Gemini when configured. The privacy note is accessible in Settings. No API secret is embedded in the frontend. This project does not include a public analytics tracker, background location tracking, push subscriptions or a community user-content service.

## Verification boundaries

Automated tests cover math and evidence labeling using controlled provider fixtures. UI testing exercises representative demo flows. Real Gemini authentication and Supabase cloud persistence require the owner’s credentials and schema setup; an unconfigured integration must not be reported as connected. Live third-party endpoints can be unavailable in restricted environments and have separate service/usage constraints.
