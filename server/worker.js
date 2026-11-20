import assets from './assets.generated.js';
import { handleApi } from './api.js';
export default {
  async fetch(request, env) {
    const u = new URL(request.url);
    if (u.pathname.startsWith('/api/')) return handleApi(request, env);
    const asset = assets[u.pathname] || assets['/index.html'];
    if (!asset) return new Response('Not found', { status: 404 });
    const bytes = Uint8Array.from(atob(asset.body), (c) => c.charCodeAt(0));
    return new Response(request.method === 'HEAD' ? null : bytes, {
      headers: {
        'content-type': asset.mime,
        'cache-control': u.pathname.startsWith('/assets/')
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'permissions-policy': 'geolocation=(self)',
      },
    });
  },
};
