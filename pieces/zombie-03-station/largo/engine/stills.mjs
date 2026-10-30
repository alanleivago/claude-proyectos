// node stills.mjs OUTDIR t1,t2,... [--q "sets=hall"] [--sheet sheet.png] [--scale 0.25]
// Renderiza fotogramas sueltos (tiempos en s) de index.html a OUTDIR/f_<t>.png y, con --sheet, una hoja de contacto.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const OUT = args[0], TIMES = args[1].split(',').map(Number);
const Q = opt('--q', ''), SHEET = opt('--sheet', null), SCALE = Number(opt('--scale', '0.25'));
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
}).listen(0);
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 700, height: 400 } });
page.on('pageerror', (e) => { console.log('[pageerror]', e.message); });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[console]', m.text()); });
await page.goto(`http://localhost:${server.address().port}/index.html?${Q}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
const files = [];
for (const t of TIMES) {
  const [url, sid] = await page.evaluate((f) => { window.renderFrame(f); return [document.querySelector('canvas').toDataURL('image/png'), window.shotAt ? window.shotAt(f / 30) : '']; }, Math.round(t * 30));
  const f = path.join(OUT, `f_${t.toFixed(2)}.png`); fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); files.push([t, f, sid]);
}
if (SHEET) {
  const w = Math.round(1920 * SCALE), h = Math.round(1080 * SCALE), cols = Math.min(files.length, Number(opt('--cols', '4'))), rows = Math.ceil(files.length / cols);
  const html = await page.evaluate(async ({ files, w, h, cols, rows }) => {
    const cv = document.createElement('canvas'); cv.width = w * cols; cv.height = (h + 22) * rows; const c = cv.getContext('2d'); c.fillStyle = '#111'; c.fillRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < files.length; i++) {
      const im = new Image(); im.src = files[i][1]; await im.decode();
      const x = (i % cols) * w, y = Math.floor(i / cols) * (h + 22);
      c.drawImage(im, x, y + 22, w, h); c.fillStyle = '#fff'; c.font = 'bold 16px sans-serif'; const tt = files[i][0]; c.fillText(`${Math.floor(tt / 60)}:${(tt % 60).toFixed(1).padStart(4, '0')}  ${files[i][2] || ''}`, x + 6, y + 17);
    }
    return cv.toDataURL('image/png');
  }, { files: files.map(([t, f, sid]) => [t, 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), sid]), w, h, cols, rows });
  fs.writeFileSync(SHEET, Buffer.from(html.split(',')[1], 'base64'));
}
console.log('stills', files.length);
await browser.close(); server.close();
