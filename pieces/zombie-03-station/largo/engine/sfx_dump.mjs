// node sfx_dump.mjs -> ../audio/sfx_events.json: une los *_SFX exportados por sets/*.js (tiempos globales) para mix3.py
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { chromium } from 'playwright';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); }).listen(0);
const browser = await chromium.launch(); const page = await browser.newPage(); page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(`http://localhost:${server.address().port}/index.html`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 180000 });
// largo: cada set exporta sfx(ctx) con tiempos anclados a palabras; film.js anade las teclas de las tarjetas (FILM_SFX)
const ev = await page.evaluate(async () => { const out = []; const sets = [...new Set((await (await fetch('shots.json')).json()).map((s) => s[1]))];
  for (const f of sets) { const m = await import(`./sets/${f}.js`); for (const e of (m.sfx ? m.sfx(window.CTX) : [])) out.push([+e[0].toFixed(3), e[1], f]); }
  const F = await import('./film.js'); for (const e of F.FILM_SFX) out.push([e[0], e[1], 'film']);
  return out.sort((a, b) => a[0] - b[0]); });
fs.writeFileSync(path.join(ROOT, '../audio/sfx_events.json'), JSON.stringify(ev)); console.log(ev.length, [...new Set(ev.map((e) => e[1]))].join(' '));
await browser.close(); server.close();
