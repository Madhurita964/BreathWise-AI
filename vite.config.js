import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleApi } from './server/api.js';
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'breathewise-api',
        configureServer(server) {
          server.middlewares.use('/api', async (req, res) => {
            try {
              let body = '';
              for await (const chunk of req) body += chunk;
              const r = await handleApi(
                new Request('http://localhost/api' + req.url, {
                  method: req.method,
                  headers: { 'Content-Type': 'application/json' },
                  ...(body ? { body } : {}),
                }),
                env
              );
              res.statusCode = r.status;
              r.headers.forEach((v, k) => res.setHeader(k, v));
              res.end(await r.text());
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'API unavailable' }));
            }
          });
        },
      },
    ],
    build: {
      outDir: 'dist/client',
      rollupOptions: {
        output: {
          manualChunks: { charts: ['recharts'], maps: ['leaflet', 'react-leaflet'] },
        },
      },
    },
    server: { allowedHosts: true },
  };
});
