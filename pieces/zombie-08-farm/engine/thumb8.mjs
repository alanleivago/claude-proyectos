// renders a still at time T from the ep8 engine to OUT (1920x1080). node thumb8.mjs T OUT
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const ROOT = 'F:/Claude Proyectos/pieces/zombie-08-farm/engine'; const [T, OUT, Q = ''] = process.argv.slice(2);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); }).listen(0);
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 700, height: 400 } });
await page.goto(`http://localhost:${server.address().port}/index.html?${Q}`); await page.waitForFunction(() => window.READY === true, null, { timeout: 180000 });
const url = await page.evaluate((f) => { window.renderFrame(f); return document.querySelector('canvas').toDataURL('image/png'); }, Math.round(Number(T) * 30));
fs.writeFileSync(OUT, Buffer.from(url.split(',')[1], 'base64')); await browser.close(); server.close(); console.log('ok', OUT);
