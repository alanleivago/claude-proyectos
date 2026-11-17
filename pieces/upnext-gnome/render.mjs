// node render.mjs  -> review/frames/*.png (turnaround, expressions, key poses), then: python sheet.py
// Serves pieces/ (for sina-test/node_modules/three), opens viewer.html in headless Chromium.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const require = createRequire(path.join(ROOT, 'sina-test', 'package.json'));
const { chromium } = require('playwright');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const OUT = path.join(HERE, 'review', 'frames');
const only = process.argv[2];                                      // optional id prefix: re-render only those
if (!only) fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const jobs = [];
for (const v of ['front', '3q', 'side', '3qb', 'back']) jobs.push({ id: `turn_${v}`, view: v, shot: 'full', act: null, f: 0 });
const EXPR = [['deadpan', 'deadpan', 'neutral'], ['skeptical', 'skeptical', 'smirk'], ['unimpressed', 'unimpressed', 'neutral'],
  ['talk A', 'deadpan', 'talkA'], ['talk O', 'deadpan', 'talkO'], ['talk E', 'deadpan', 'talkE'], ['talk M', 'deadpan', 'talkM'],
  ['tiny smile', 'deadpan', 'smile'], ['warm (final line)', 'happy', 'smile'], ['surprised', 'surprised', 'surprised'],
  ['annoyed', 'annoyed', 'frown'], ['sleepy', 'sleepy', 'sleepy'], ['blink', 'blink', 'neutral'], ['side glance', 'lookside', 'neutral'],
  ['open', 'open', 'neutral']];
for (const v of ['a', 'b']) EXPR.forEach(([label, e, m], i) => jobs.push({ id: `expr${v}_${String(i).padStart(2, '0')}`, label, view: '0.35', shot: 'face', act: null, f: 0, e, m, eyes: v }));
const POSES = [['idle', 30, '3q'], ['talk', 12, '3q'], ['point', 24, 'front'], ['shrug', 24, 'front'], ['arms_crossed', 30, 'front'],
  ['arms_crossed', 30, 'side'], ['walk', 0, 'side'], ['walk', 8, '3q'], ['nod', 8, '3q'], ['shake_head', 5, 'front'], ['sit', 40, '3q'], ['sit', 40, 'front']];
POSES.forEach(([a, f, v], i) => jobs.push({ id: `pose_${String(i).padStart(2, '0')}`, label: `${a} f${f}`, view: v, shot: 'full', act: a, f }));
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 360, height: 480 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[page]', m.text()); });
await page.goto(`http://localhost:${port}/upnext-gnome/viewer.html`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
// extra: a frame strip per clip (6 frames, 3q) for checking motion
const acts = await page.evaluate(() => window.ACTIONS);
for (const a of acts) for (let i = 0; i < 6; i++) jobs.push({ id: `strip_${a.name}_${i}`, view: a.name === 'walk' || a.name === 'sit' ? 'side' : '3q', shot: 'full', act: a.name, f: Math.round(i * a.frames / 5) });
const labels = {};
for (const j of jobs) {
  if (only && !j.id.startsWith(only)) continue;
  const url = await page.evaluate((j) => { window.setEyes(j.eyes || 'a'); window.setView(j.view, j.shot); window.setAction(j.act); return window.renderFrame(j.f, j.e, j.m); }, j);
  fs.writeFileSync(path.join(OUT, `${j.id}.png`), Buffer.from(url.split(',')[1], 'base64'));
  labels[j.id] = j.label || j.id;
}
const LP = path.join(OUT, 'labels.json');
const old = only && fs.existsSync(LP) ? JSON.parse(fs.readFileSync(LP, 'utf8')) : {};
fs.writeFileSync(LP, JSON.stringify({ ...old, ...labels }, null, 1));
console.log('frames', Object.keys(labels).length, 'clips', acts.map((a) => `${a.name}:${a.frames}`).join(' '));
await browser.close(); server.close();
