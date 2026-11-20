import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
const assets = {};
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else {
      const ext = path.extname(file);
      assets['/' + path.relative('dist/client', file)] = {
        body: (await fs.readFile(file)).toString('base64'),
        mime:
          {
            '.html': 'text/html; charset=utf-8',
            '.js': 'text/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
            '.woff2': 'font/woff2',
          }[ext] || 'application/octet-stream',
      };
    }
  }
}
await walk('dist/client');
await fs.mkdir('dist/server', { recursive: true });
await fs.writeFile(
  'server/assets.generated.js',
  'export default ' + JSON.stringify(assets)
);
await build({
  entryPoints: ['server/worker.js'],
  outfile: 'dist/server/index.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  minify: true,
});
await fs.rm('server/assets.generated.js');
await fs.mkdir('dist/.openai', { recursive: true });
await fs.copyFile('.openai/hosting.json', 'dist/.openai/hosting.json');
console.log(
  'Built full-stack Worker with ' +
    Object.keys(assets).length +
    ' embedded frontend assets'
);
