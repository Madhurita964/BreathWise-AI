# Deployment

## One Node server: simplest portable deployment

Use a Node.js host such as Render, Railway, a container service or your own server. The frontend and `/api` run on the same origin, avoiding cross-origin configuration and keeping Gemini secrets server-side.

- Node version: 22.16+.
- Install: `npm ci`.
- Build: `npm run build`.
- Start: `npm start`.
- Health endpoint: `/api/health`.
- Port: `PORT` provided by your host, default 3001.

Set environment variables in the host’s secret manager before building:

| Name | Where | Needed for |
|---|---|---|
| `GEMINI_API_KEY` | Runtime server secret | Generative AI, otherwise rules fallback |
| `GEMINI_MODEL` | Runtime | Optional provider model selection |
| `OPEN_METEO_API_KEY` | Runtime server secret | Optional commercial customer endpoint |
| `VITE_SUPABASE_URL` | Build time, public | Optional cloud auth/preferences |
| `VITE_SUPABASE_ANON_KEY` | Build time, public | Supabase public key, protected by RLS |
| `PORT` | Runtime | Node listener |

Run the Supabase schema before enabling cloud sync and allow your deployment’s exact auth redirect origin. Do not expose a Supabase service-role key. Changes to `VITE_` variables require rebuilding the frontend; changes to server keys require restarting/redeploying the server.

A `render.yaml` is included as a starting deployment blueprint. Select your own service plan and inspect any host charges before deployment. No external host account or paid service was created by this project.

## Docker

```bash
docker build -t breathewise-ai .
docker run --rm -p 3001:3001 --env-file .env breathewise-ai
```

The default image contains an unconfigured demo-capable frontend. Public Supabase variables must be provided at image build with `--build-arg VITE_SUPABASE_URL=... --build-arg VITE_SUPABASE_ANON_KEY=...`. Runtime `--env-file` supplies Gemini and other server keys. The public Supabase key must still be protected by RLS.

## Cloudflare Worker / Sites

`npm run build` produces:

- `dist/client/`: conventional static frontend assets.
- `dist/server/index.js`: an ES module exporting `fetch(request, env)` with those assets embedded and the shared API bundled.
- `dist/.openai/hosting.json`: the matching deployment manifest.

The Worker does not require a Node process or a separate API host. In Sites, set `GEMINI_API_KEY`, `GEMINI_MODEL` and `OPEN_METEO_API_KEY` as production runtime variables and redeploy. Never put secret values in the hosting manifest. Supabase public variables need to be present during the frontend build, so configure them in the build environment before publishing a new build.

You can also deploy the bundled Worker with Cloudflare’s own tooling. Treat `.openai/hosting.json` as Sites-specific metadata, not a secret. Create your own Worker configuration with entrypoint `dist/server/index.js`; do not try to run `server/worker.js` directly because its asset import is generated during the build.

## Static hosts (Netlify / Vercel static mode / GitHub Pages)

Publishing only `dist/client` does **not** deploy `/api`. For an independent static frontend, provide a serverless adapter for `handleApi`, or route `/api/*` to the Node server. The included one-server deployment is recommended. Do not silently rely on a static host to run the Node API.

## External provider operations

- Open-Meteo free endpoints are intended for non-commercial use. Commercial deployments require an appropriate plan and `OPEN_METEO_API_KEY`; the backend switches to customer hosts automatically.
- Source attribution and timestamps must remain visible.
- OSRM and the OSM walking/cycling demo routing services have fair-use limits and no production SLA. Replace these demonstration endpoints with a suitable production routing provider/self-hosted OSRM for substantial traffic. No live-traffic feed is connected.
- CARTO / OSM map tiles require correct attribution and compliance with their applicable plan/usage policies.
- API responses are cached in-process for five minutes, with bounded entries. This cache is per Node process/Worker isolate, not a globally coordinated cache. Weather errors do not fabricate weather.
- For a public rollout, configure platform-level authentication, global rate limits, quotas and budget alerts for `/api/chat` and third-party routing calls. The supplied hosted Site is private by default. Set Gemini provider quotas to suit your spending limits.
- Gemini model availability may change. Set `GEMINI_MODEL` to a supported model in your account. Model/API failure produces a labeled rules fallback rather than an AI success claim.

## Smoke checks after deployment

1. `/api/health` returns `ok: true`. `aiConfigured` confirms presence of a key only; send a chat request to verify the provider itself.
2. Demo mode loads and every module remains usable.
3. Switch to model data; expect either `mode: live` with `kind: modeled`, or an explicitly labeled demo fallback.
4. Ask a question. With a working Gemini connection, the response engine is `Gemini`; otherwise it is `Rules-based advisor`.
5. Add a family profile, refresh and verify local persistence.
6. If configured, sign in through Supabase, save preferences and verify a reload in your account. Test that another user cannot read your row.
7. Download a community report and confirm source/type/timestamps are present.
8. Test routes between reachable points and inspect the source/assumptions. An upstream routing failure must show an error, not an invented live route.
