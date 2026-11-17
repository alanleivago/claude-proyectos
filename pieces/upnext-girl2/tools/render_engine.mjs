// node tools/render_engine.mjs his 0,21,42 [eyes] [mouth]   -> review/engine/ours_XXX.png (his calibrated camera, 1080x1920)
// node tools/render_engine.mjs anim walk,wave [n] [views]     -> review/engine/anim_<name>_<view>_<i>.png
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(HERE, '..', '..');
const require = createRequire(path.join(ROOT, 'sina-test', 'package.json')); const { chromium } = require('playwright');
const args = process.argv.slice(2); const mode = args[0]; const list = (args[1] || '').split(',').filter(Boolean);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;
const out = path.resolve(HERE, '..', 'review', 'engine'); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const [w, h] = mode === 'his' ? [1080, 1920] : [360, 560];
const page = await browser.newPage({ viewport: { width: w, height: h } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[page]', m.text()); });
const GLB = process.env.GLB || 'girl2_anim.glb', PRE = process.env.PREFIX || '';
await page.goto(`http://localhost:${port}/upnext-girl2/tools/viewer.html?w=${w}&h=${h}&glb=${GLB}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
const grab = async () => Buffer.from((await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png'))).split(',')[1], 'base64');
if (mode === 'his') {
  const eyes = args[2] || 'open', mouth = args[3] || 'neutral';
  for (const k of list) {
    await page.evaluate(([k, e, m]) => window.hisView(+k, e, m), [k, eyes, mouth]);
    fs.writeFileSync(path.join(out, `${PRE}ours_${String(k).padStart(3, '0')}.png`), await grab());
  }
} else {
  const N = +(args[2] || 6); const views = (args[3] || '3q').split(',');
  const acts = await page.evaluate(() => window.ACTIONS);
  for (const a of acts) {
    if (list.length && !list.includes(a.name)) continue;
    for (const v of views) for (let i = 0; i < N; i++) {
      const f = Math.round(i * a.frames / Math.max(1, N - 1));
      await page.evaluate(([n, v, f]) => { window.setAction(n, v); window.renderFrame(f); }, [a.name, v, f]);
      fs.writeFileSync(path.join(out, `${PRE}anim_${a.name}_${v}_${i}.png`), await grab());
    }
  }
}
await browser.close(); server.close(); console.log('done', mode, list.length);
