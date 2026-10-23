// every 2nd frame: each caption word drawn (fillText in the caption colour) — flag words above the frieze line or past the right margin,
// and words that disappear while still being written (cut off)
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const [src, color = '#6e2a18', topMin = '160'] = process.argv.slice(2);
const browser = await chromium.launch(), page = await browser.newPage();
await page.goto(pathToFileURL(path.resolve(src, 'index.html')).href + '?export=1');
await page.waitForFunction(() => window.TIMELINE && window.renderFrame); await page.evaluate(() => document.fonts.ready);
const res = await page.evaluate(([color, topMin]) => {
  const T = window.TIMELINE, c = document.createElement('canvas'); c.width = T.width; c.height = T.height;
  const P = CanvasRenderingContext2D.prototype, of = P.fillText; let rec = null;
  P.fillText = function (t, x, y) { if (rec && this.fillStyle === color) { const m = this.measureText(t), tr = this.getTransform(); const X = tr.a * x + tr.e, Y = tr.d * y + tr.f; rec.push({ t, X, top: Y - m.actualBoundingBoxAscent * tr.d, right: X + m.width * tr.a }); } return of.apply(this, arguments); };
  const bad = [];
  for (let f = 0; f < T.frames; f += 2) { rec = []; window.renderFrame(f / T.fps, c);
    for (const r of rec) { const onScreen = r.right > 0 && r.X < T.width; if (!onScreen) continue;
      if (r.top < topMin) bad.push(`t=${(f / T.fps).toFixed(2)} "${r.t}" top ${Math.round(r.top)} (over the frieze)`);
      if (r.right > 945 && r.X > 0 && r.right < T.width) bad.push(`t=${(f / T.fps).toFixed(2)} "${r.t}" right ${Math.round(r.right)} (safe zone)`); } }
  return bad;
}, [color, Number(topMin)]);
console.log(res.slice(0, 30).join('\n')); console.log('caption problems:', res.length);
await browser.close();
