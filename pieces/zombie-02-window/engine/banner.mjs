// node banner.mjs OUTDIR [query] — renderiza banner.html y guarda OUTDIR/<clave>.png por cada dataURL de window.OUT
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const [OUT, Q = ''] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
}).listen(0);
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text()); });
await page.goto(`http://localhost:${server.address().port}/banner.html?${Q}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
for (const [k, url] of Object.entries(await page.evaluate(() => window.OUT))) fs.writeFileSync(path.join(OUT, k + '.png'), Buffer.from(url.split(',')[1], 'base64'));
await browser.close(); server.close();
