// node render_film_up.mjs "<query>" OUT.mkv [--from F --to F]
// Renders every frame of sb.html?<query> (film mode, 1080x1920, 30 fps) into a near-lossless intermediate (x264 crf 8, yuv444p).
// The UpNext post (subtitles, vignette, grain, rounded frame) + audio happen in tools/post_film.py.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { spawn } from 'node:child_process'; import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const [Q, OUT] = process.argv.slice(2); const args = process.argv.slice(2); const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? Number(args[i + 1]) : d; };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); }).listen(0);
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 400, height: 700 } });
page.on('pageerror', (e) => { console.log('[pageerror]', e.message); process.exit(1); });
page.on('console', (m) => { if (m.type() === 'error' || /NO CLIP|missing face/.test(m.text())) console.log('[page]', m.text()); });
await page.goto(`http://localhost:${server.address().port}/sb.html?${Q}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 300000 });
const film = await page.evaluate(() => window.FILM);
const F0 = opt('--from', 0), F1 = opt('--to', film.frames);
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '8', '-pix_fmt', 'yuv444p', OUT], { stdio: ['pipe', 'inherit', 'inherit'], env: { ...process.env } });
const t0 = Date.now();
for (let f = F0; f < F1; f++) {
  const url = await page.evaluate((f) => { window.renderFrame(f); return document.querySelector('canvas').toDataURL('image/png'); }, f);
  const buf = Buffer.from(url.split(',')[1], 'base64');
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % 300 === 0) console.log(`frame ${f}/${film.frames} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
ff.stdin.end(); await new Promise((r) => ff.on('close', r));
console.log('done', OUT, F1 - F0, 'frames', ((Date.now() - t0) / 1000).toFixed(0), 's', JSON.stringify(film.shots));
await browser.close(); server.close();
