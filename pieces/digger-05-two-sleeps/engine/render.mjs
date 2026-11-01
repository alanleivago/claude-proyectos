// node render.mjs [--frames 0,60,150 | --all] [--out frames]
// Serves this folder, drives index.html in headless Chromium and saves window.renderFrame(f) as PNGs.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const OUT = path.resolve(ROOT, opt('--out', 'frames'));
const TOTAL = Number(opt('--total', 300));
const frames = args.includes('--all') ? [...Array(TOTAL).keys()] : opt('--frames', '0').split(',').map(Number);
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 400, height: 700 } });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'log') console.log('[page]', m.text()); });
page.on('pageerror', (e) => { console.log('[pageerror]', e.message); process.exit(1); });
await page.goto(`http://localhost:${port}/${opt('--page', 'index.html')}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });

if (args.includes('--meta')) {   // film mode: dump shots + sound cues + duration
  const meta = await page.evaluate(() => ({ film: window.FILM, cues: window.CUES, words: window.WORDS_OVERRIDE }));
  fs.writeFileSync(path.resolve(ROOT, opt('--meta')), JSON.stringify(meta, null, 1));
  console.log('meta', meta.film.frames, 'frames', meta.film.dur.toFixed(2), 's,', meta.cues.length, 'cues');
}
let names = null;
if (args.includes('--shots')) {   // review stills: start / middle / end of every shot
  const film = await page.evaluate(() => window.FILM); frames.length = 0; names = [];
  film.shots.forEach(([n, t0], i) => {
    const t1 = i + 1 < film.shots.length ? film.shots[i + 1][1] : film.dur;
    [[t0 + 0.17, 'a'], [(t0 + t1) / 2, 'b'], [t1 - 0.17, 'c']].forEach(([t, k]) => { frames.push(Math.round(t * 30)); names.push(`s${String(i + 1).padStart(2, '0')}${k}`); });
  });
}
const t0 = Date.now();
for (const [fi, f] of frames.entries()) {
  const url = await page.evaluate((f) => { window.renderFrame(f); return document.querySelector('canvas').toDataURL('image/png'); }, f);
  fs.writeFileSync(path.join(OUT, names ? `${names[fi]}_f${String(f).padStart(4, '0')}.png` : `f_${String(f).padStart(4, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
}
console.log(`${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${OUT}`);
await browser.close(); server.close();
