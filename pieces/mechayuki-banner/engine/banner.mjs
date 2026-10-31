// node banner.mjs OUTDIR [query] — renders banner.html and saves OUTDIR/<key>.png for each dataURL in window.OUT.
// (approach from pieces/zombie-02-window/engine/banner.mjs). Files missing here are served from digger-03-lock/engine
// (three, models incl. the purchased zero_anim.glb, textures), so nothing from the model is copied into this folder.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FALL = path.resolve(ROOT, '../../digger-03-lock/engine');
const { chromium } = createRequire(path.join(FALL, 'package.json'))('playwright');
const [OUT = path.join(ROOT, '..'), Q = ''] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const p = [path.join(ROOT, rel), path.join(FALL, rel)].find((f) => (f.startsWith(ROOT) || f.startsWith(FALL)) && fs.existsSync(f) && !fs.statSync(f).isDirectory());
  if (!p) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
}).listen(0);
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'log') console.log('[console]', m.text()); });
await page.goto(`http://localhost:${server.address().port}/banner.html?${Q}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 180000 });
for (const [k, url] of Object.entries(await page.evaluate(() => window.OUT))) fs.writeFileSync(path.join(OUT, k + '.png'), Buffer.from(url.split(',')[1], 'base64'));
await browser.close(); server.close();
