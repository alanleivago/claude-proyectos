// node thumb_exp.mjs OUTDIR  -> clean 1920x1080 frames for the YouTube thumbnail (no caption, no HUD).
// The video files are NOT changed: the thumbnail-only shots (thumb_shots08.js) and the 3D font (Luckiest Guy, Apache-2.0, as a
// three.js typeface JSON) are injected into film.js while it is served.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const [OUT] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const INJECT = fs.readFileSync(path.join(ROOT, 'thumb_shots08.js'), 'utf8');
const NL = String.fromCharCode(10);
const HEAD = ["import { Font } from 'three/addons/loaders/FontLoader.js';", "import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';",
  'const LUCKIEST = ' + fs.readFileSync(path.join(ROOT, 'fonts_thumb', 'luckiest_typeface.json'), 'utf8') + ';', ''].join(NL);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  if (path.basename(p) === 'film.js') { const s = fs.readFileSync(p, 'utf8'); const k = s.indexOf('  S.sort((a, b) => wi(a.at[0]'); return res.end(s.slice(0, k) + INJECT + NL + s.slice(k)); }
  fs.createReadStream(p).pipe(res);
}).listen(0);
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 400, height: 700 } });
page.on('pageerror', (e) => { console.log('[pageerror]', e.message); process.exit(1); });
page.on('console', (m) => { if (m.type() === 'error') console.log('[page]', m.text()); });
await page.goto(`http://localhost:${server.address().port}/index.html?v=megagirl`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 180000 });
const shots = await page.evaluate(() => window.FILM.shots.filter((s) => s[3] && s[3][0] === 9 && ['new', 'songs'].includes(s[3][1])).map((s) => [s[3][1], s[1]]));
for (const [w, t0] of shots) {
  const url = await page.evaluate((t) => { window.WORDS_OVERRIDE = [[0, 0.001, '']]; window.renderFrame(Math.round(t * 30)); return document.querySelector('canvas').toDataURL('image/png'); }, t0 + 0.05);
  fs.writeFileSync(path.join(OUT, `${w}.png`), Buffer.from(url.split(',')[1], 'base64')); console.log('ok', w, t0);
}
await browser.close(); server.close();
