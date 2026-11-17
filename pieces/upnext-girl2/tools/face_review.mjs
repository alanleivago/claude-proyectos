// node tools/face_review.mjs <jobs.json> <outdir> [w h]
// jobs.json: [{"name": "x", "kind": "face", "view": 0, "eyes": "open", "mouth": "neutral", "d": 2.3}, {"kind": "his", ...}]
// renders each job with tools/face_review.html (engine materials + engine setFace) -> <outdir>/<name>.png
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(HERE, '..', '..');
const require = createRequire(path.join(ROOT, 'sina-test', 'package.json')); const { chromium } = require('playwright');
const [jobsPath, outDir, wArg, hArg] = process.argv.slice(2);
const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8')); fs.mkdirSync(outDir, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const groups = {};
for (const j of jobs) { const k = `${j.w || wArg || 400}x${j.h || hArg || 440}|${j.glb || process.env.GLB || 'girl2_curvy_bare.glb'}`; (groups[k] = groups[k] || []).push(j); }
for (const [k, list] of Object.entries(groups)) {
  const [wh, glb] = k.split('|'); const [w, h] = wh.split('x').map(Number);
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('[page]', m.text()); });
  await page.goto(`http://localhost:${port}/upnext-girl2/tools/face_review.html?w=${w}&h=${h}&glb=${glb}`);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  console.log('info', JSON.stringify(await page.evaluate(() => window.INFO)));
  for (const j of list) {
    const url = await page.evaluate((j) => {
      if (j.kind === 'his') window.his(j.eyes, j.mouth, j.k || 0); else window.face(j.view || 0, j.eyes, j.mouth, j.d, j.dy || 0);
      return document.querySelector('canvas').toDataURL('image/png');
    }, j);
    fs.writeFileSync(path.join(outDir, `${j.name}.png`), Buffer.from(url.split(',')[1], 'base64'));
  }
  await page.close();
}
await browser.close(); server.close(); console.log('done', jobs.length);
