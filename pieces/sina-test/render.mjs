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
  '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 400, height: 700 } });
page.on('console', (m) => { if (m.type() === 'error') console.log('[page]', m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`http://localhost:${port}/index.html`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });

const t0 = Date.now();
for (const f of frames) {
  const url = await page.evaluate((f) => { window.renderFrame(f); return document.querySelector('canvas').toDataURL('image/png'); }, f);
  fs.writeFileSync(path.join(OUT, `f_${String(f).padStart(4, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
}
console.log(`${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${OUT}`);
await browser.close(); server.close();
