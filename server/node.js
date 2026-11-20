import express from 'express';
import { handleApi } from './api.js';
const app = express();
app.disable('x-powered-by');
app.use('/api', express.text({ type: '*/*', limit: '64kb' }), async (req, res) => {
  const response = await handleApi(
    new Request('http://localhost/api' + req.url, {
      method: req.method,
      headers: { 'content-type': 'application/json' },
      ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: req.body || '{}' }),
    }),
    process.env
  );
  res.status(response.status);
  response.headers.forEach((v, k) => res.setHeader(k, v));
  res.send(await response.text());
});
app.use(express.static('dist/client'));
app.get('/{*path}', (req, res) =>
  res.sendFile(process.cwd() + '/dist/client/index.html')
);
app.listen(process.env.PORT || 3001, () =>
  console.log('BREATHEWISE API and app ready on port ' + (process.env.PORT || 3001))
);
