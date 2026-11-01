// node thumb.mjs OUTDIR spec.json
// Fotogramas LIMPIOS para la miniatura: sin subtitulo ni HUD (parcheados al servir, sin tocar film.js/main.js).
// spec.json = [{ "name": "a", "shot": "67_final_glass", "dt": 1.5, "cam": [x,y,z,lx,ly,lz,fov]? }, ...]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const [OUT, SPEC] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(SPEC, 'utf8'));
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary' };
const PATCH = {
  'film.js': [["HUD_T0 = T['02_gate'];", 'HUD_T0 = 1e9;']],
  'main.js': [["const DBG = new URLSearchParams(location.search).get('cam')?.split(',').map(Number);", 'let DBG = null; window.setCam = (c) => { DBG = c; };'],
    ['const t = warp(f / FPS);', 'const t = window.RAW_T ?? warp(f / FPS);'],
    ['s.update(t - s.t0, t);', 's.update(t - s.t0, t); if (window.POST) window.POST(s, t);'],
    ['if (SHOTS[k].overlay) SHOTS[k].overlay(', 'if (SHOTS[k].overlay && !window.NO_OV) SHOTS[k].overlay(']],
};
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  const rel = path.relative(ROOT, p).replace(/\\/g, '/');
  if (PATCH[rel]) {
    let s = fs.readFileSync(p, 'utf8');
    for (const [a, b] of PATCH[rel]) { if (!s.includes(a)) throw new Error('patch miss ' + rel); s = s.replace(a, b); }
    return res.end(s);
  }
  fs.createReadStream(p).pipe(res);
}).listen(0);
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 700, height: 400 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const sets = [...new Set(spec.map((s) => s.set || 'hall'))].join(',');
await page.goto(`http://localhost:${server.address().port}/index.html?sets=${sets}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 180000 });
await page.evaluate(async () => { const P = await import('./thumb_post.js'); await P.init(); window.TP = P; });
for (const s of spec) {
  const url = await page.evaluate((s) => {
    window.WORDS_OVERRIDE = [];
    window.setCam(s.cam || null); window.NO_OV = !!s.noOverlay;
    window.POST = s.post ? (sh, t) => window.TP.apply(sh, t, s.post) : null;
    window.RAW_T = (s.at ? window.CTX.at(...s.at) : window.CTX.T[s.shot]) + (s.dt || 0);
    window.renderFrame(0);
    return document.querySelector('canvas').toDataURL('image/png');
  }, s);
  fs.writeFileSync(path.join(OUT, `${s.name}.png`), Buffer.from(url.split(',')[1], 'base64'));
  console.log('ok', s.name);
}
await browser.close(); server.close();
