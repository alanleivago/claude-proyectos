// node thumb_shoot.mjs jobs.json OUTDIR [query]  -> OUTDIR/<name>.png (+ <name>.json con lens)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { chromium } from 'playwright';
const ROOT = path.dirname(fileURLToPath(import.meta.url)); const [JOBS, OUT, Q = 'shade=0.85'] = process.argv.slice(2); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); }).listen(0);
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 400, height: 300 } }); page.on('pageerror', (e) => console.log('[pageerror]', e.message)); page.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text()); });
await page.goto(`http://localhost:${server.address().port}/thumb.html?${Q}`); await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
for (const j of JSON.parse(fs.readFileSync(JOBS, 'utf8'))) { const r = await page.evaluate((o) => window.shoot(o), j); fs.writeFileSync(path.join(OUT, j.name + '.png'), Buffer.from(r.url.split(',')[1], 'base64')); fs.writeFileSync(path.join(OUT, j.name + '.json'), JSON.stringify({ lens: r.lens, w: j.w, h: j.h })); console.log(j.name, r.lens); }
await browser.close(); server.close();
