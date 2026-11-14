// node hud_png.mjs OUTDIR [t]  -> OUTDIR/hud_FINE.png, hud_CAUTION.png, hud_DANGER.png (118x66, fondo transparente)
// Dibuja el panel CONDITION con la funcion real hud() de film.js (misma fuente, ECG y colores que el video).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2], T = Number(process.argv[3] ?? 200.37);
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
}).listen(0);
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`http://localhost:${server.address().port}/index.html?sets=screens8`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 180000 });
const urls = await page.evaluate(async (T) => {
  const F = await import('./film.js'), out = {};
  for (const st of ['FINE', 'CAUTION', 'DANGER']) {
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360;
    const c = cv.getContext('2d'); F.hud({ tctx: c }, Math.max(T, F.HUD_T0 + 1), st);
    const o = document.createElement('canvas'); o.width = 118; o.height = 66; o.getContext('2d').drawImage(cv, 8, 8, 118, 66, 0, 0, 118, 66);
    out[st] = o.toDataURL('image/png');
  }
  return out;
}, T);
for (const [st, u] of Object.entries(urls)) fs.writeFileSync(path.join(OUT, `hud_${st}.png`), Buffer.from(u.split(',')[1], 'base64'));
console.log('hud ok');
await browser.close(); server.close();
