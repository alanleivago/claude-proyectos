// node render.mjs [accion ...] [--n 8] [--view 3q]
// Sirve F:\Claude Proyectos\pieces\ (para llegar a sina-test/node_modules/three), abre viewer.html en Chromium headless
// y guarda N frames por accion en frames/<accion>_<vista>/f_XXX.png. Luego: python sheets.py
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');                       // pieces/
const require = createRequire(path.join(ROOT, 'sina-test', 'package.json'));
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const N = Number(opt('--n', 8));
const views = opt('--view', '3q').split(',');
const only = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const SUB = opt('--sub', 'frames');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 300, height: 480 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[page]', m.text()); });
await page.goto(`http://localhost:${port}/zero-fem/anim/viewer.html`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
const acts = await page.evaluate(() => window.ACTIONS);
for (const pr of opt('--prop', '').split(',').filter(Boolean)) await page.evaluate((b) => window.addProp(b), pr);
for (const a of acts) {
  if (only.length && !only.includes(a.name)) continue;
  for (const v of views) {
    const dir = path.join(path.resolve(HERE, SUB), `${a.name}_${v}`);
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const fr = [...Array(N).keys()].map((i) => Math.round(i * a.frames / (N - 1)));
    for (const f of fr) {
      const url = await page.evaluate(([n, v, f]) => { window.setAction(n, v); window.renderFrame(f);
        return document.querySelector('canvas').toDataURL('image/png'); }, [a.name, v, f]);
      fs.writeFileSync(path.join(dir, `f_${String(f).padStart(3, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
    }
  }
  console.log(a.name, a.frames);
}
await browser.close(); server.close();
