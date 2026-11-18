// node sfx_dump.mjs -> ../audio/sfx_events.json: une los *_SFX exportados por sets/*.js (tiempos globales) para mix3.py
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { chromium } from 'playwright';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); }).listen(0);
const browser = await chromium.launch(); const page = await browser.newPage();
await page.goto(`http://localhost:${server.address().port}/index.html?sets=`);
const ev = await page.evaluate(async () => { const out = []; for (const [f, k] of [['ext', 'EXT_SFX'], ['hall', 'HALL_SFX'], ['rooms', 'ROOMS_SFX'], ['screens', 'SCREENS_SFX']]) { const m = await import(`./sets/${f}.js`); for (const e of m[k] || []) out.push([e[0], e[1], f]); } return out.sort((a, b) => a[0] - b[0]); });
fs.writeFileSync(path.join(ROOT, '../audio/sfx_events.json'), JSON.stringify(ev)); console.log(ev.length, [...new Set(ev.map((e) => e[1]))].join(' '));
await browser.close(); server.close();
