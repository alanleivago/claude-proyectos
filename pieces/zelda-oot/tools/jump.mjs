import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const browser = await chromium.launch(), page = await browser.newPage();
await page.goto(pathToFileURL(path.resolve('index.html')).href + '?export=1'); await page.waitForFunction(() => window.TIMELINE && window.renderFrame);
const res = await page.evaluate((ids) => { const T = window.TIMELINE, out = {};
  const grab = (t) => { const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; window.renderFrame(t, c); const s = document.createElement('canvas'); s.width = 320; s.height = 180; const g = s.getContext('2d'); g.drawImage(c, 0, 0, 320, 180); return g.getImageData(0, 0, 320, 180).data; };
  for (const id of ids) { const tb = TB[IDS.indexOf(id)], f0 = Math.round((tb - 0.62) * 24), d = []; let prev = null;
    for (let f = f0; f < f0 + 30; f++) { const px = grab(f / 24); if (prev) { let s = 0; for (let k = 0; k < px.length; k += 4) s += Math.abs(px[k] - prev[k]) + Math.abs(px[k + 1] - prev[k + 1]); d.push(Math.round(s / (px.length / 4) * 10) / 10); } prev = px; }
    out[id] = d; } return out; }, ['p013', 'p030b', 'p044', 'p055', 'p063a', 'p072b']);
for (const [k, v] of Object.entries(res)) console.log(k, v.join(' ')); await browser.close();
