// node cuts.mjs -> ../review/cuts.json: inicios de plano resueltos por film.js (anclas en palabras) + duracion
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { chromium } from 'playwright';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); }).listen(0);
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] }); const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message)); page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[console]', m.text()); });
await page.goto(`http://localhost:${server.address().port}/index.html`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 180000 });
const f = await page.evaluate(() => window.FILM);
fs.writeFileSync(path.join(ROOT, '../review/cuts.json'), JSON.stringify(f)); console.log('shots', f.cuts.length, 'dur', f.dur.toFixed(2));
await browser.close(); server.close();
