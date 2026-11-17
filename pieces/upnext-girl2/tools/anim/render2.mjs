// node tools/anim/render2.mjs sheet <clips|all> <n> <views> [w h]  -> review/engine2/<clip>_<view>_<i>.png
// node tools/anim/render2.mjs video <clips|all> <secs> <view> [w h]  -> review/engine2/vid/<clip>_<NNN>.png  (loops repeat, one-shots hold)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(HERE, '..', '..', '..');
const require = createRequire(path.join(ROOT, 'sina-test', 'package.json')); const { chromium } = require('playwright');
const [mode, clipArg = 'all', nArg = '6', viewArg = '3q', wArg, hArg] = process.argv.slice(2);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;
const out = path.resolve(HERE, '..', '..', 'review', 'engine2', mode === 'video' ? 'vid' : ''); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const w = +(wArg || (mode === 'video' ? 540 : 360)), h = +(hArg || (mode === 'video' ? 960 : 560));
const page = await browser.newPage({ viewport: { width: w, height: h } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const GLB = process.env.GLB || 'girl2_curvy_bare.glb';
await page.goto(`http://localhost:${port}/upnext-girl2/tools/anim/viewer2.html?w=${w}&h=${h}&glb=${GLB}&r=${process.env.CAMR || 25}&ch=${process.env.CAMH || -3.2}&t=${Date.now()}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
const grab = async () => Buffer.from((await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png'))).split(',')[1], 'base64');
const acts = await page.evaluate(() => window.ACTIONS);
const meta = JSON.parse(fs.readFileSync(path.resolve(HERE, '..', '..', 'out', 'actions.json')));
if (process.env.NOCAM) for (const k of Object.keys(meta)) if (meta[k] && meta[k].cam) delete meta[k].cam;
if (process.env.FRONT) for (const k of Object.keys(meta)) if (meta[k] && meta[k].cam) { meta[k].cam = meta[k].cam.slice(); meta[k].cam[2] = 1e-6; if (k === 'lie_side') meta[k].cam[0] = 46; if (k === 'lie_back') meta[k].cam[0] = 32; }   // frontal camera, keep distance / height / elevation (lying clips pulled back to fit the portrait frame)
if (mode === 'focus') {            // focus clip:frame:bone:dist:yaw:elev;...  -> review/engine2/focus_<i>.png
  const specs = clipArg.split(';');
  for (let i = 0; i < specs.length; i++) {
    const [n, f, bone, d, yaw, el] = specs[i].split(':');
    await page.evaluate(([n, f, b, d, y, e]) => window.focusShot(n, f, b, d, y, e), [n, +f, bone, +d, +yaw, +(el || 0)]);
    fs.writeFileSync(path.join(out, `focus_${i}.png`), await grab());
  }
  await browser.close(); server.close(); process.exit(0);
}
if (mode === 'shots') {
  const views = viewArg.split(',');
  for (const cf of clipArg.split(',')) {
    const [n, f] = cf.split(':');
    for (const v of views) {
      await page.evaluate(([n, v, f, cm]) => { window.CAMOV = cm; window.setAction(n, v); window.renderFrame(f); }, [n, v, +f, (meta[n] || {}).cam || null]);
      fs.writeFileSync(path.join(out, `shot_${n}_${f}_${v}.png`), await grab());
    }
  }
  await browser.close(); server.close(); process.exit(0);
}
const want = clipArg === 'all' ? null : clipArg.split(',');
for (const a of acts) {
  if (want && !want.includes(a.name)) continue;
  const views = viewArg.split(',');
  if (mode === 'sheet') {
    const N = +nArg;
    for (const v of views) for (let i = 0; i < N; i++) {
      const f = Math.round(i * (a.frames - 1) / Math.max(1, N - 1));
      await page.evaluate(([n, v, f, cm]) => { window.CAMOV = cm; window.setAction(n, v); window.renderFrame(f); }, [a.name, v, f, (meta[a.name] || {}).cam || null]);
      fs.writeFileSync(path.join(out, `${a.name}_${v}_${i}.png`), await grab());
    }
  } else {
    const total = Math.max(Math.round(+nArg * 30), meta[a.name] && !meta[a.name].loop ? a.frames + 15 : 0);
    await page.evaluate(([n, v, cm]) => { window.CAMOV = cm; window.setAction(n, v); }, [a.name, views[0], (meta[a.name] || {}).cam || null]);
    for (let k = 0; k < total; k++) {
      const loop = meta[a.name] ? meta[a.name].loop : true;
      const f = loop ? k % a.frames : Math.min(k, a.frames - 1);
      await page.evaluate((f) => window.renderFrame(f), f);
      fs.writeFileSync(path.join(out, `${a.name}_${String(k).padStart(3, '0')}.png`), await grab());
    }
  }
}
await browser.close(); server.close(); console.log('done', mode);
