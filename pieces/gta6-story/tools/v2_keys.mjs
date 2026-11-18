// v2: one key frame per shot (at FRAC of the shot, all text visible) -> review/v2_keys/<id>.jpg (full 1920x1080)
//   node tools/v2_keys.mjs [frac=0.8] [ids,comma] [query e.g. dia=B]
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const D = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const frac = Number(process.argv[2] || 0.8), only = process.argv[3] && process.argv[3] !== 'all' ? process.argv[3].split(',') : null, q = process.argv[4] ? '&' + process.argv[4] : '';
const out = path.join(D, 'review/v2_keys'); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch(), page = await browser.newPage();
page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
await page.goto(pathToFileURL(path.join(D, 'v2/pilot/index.html')).href + '?export=1' + q);
await page.waitForFunction(() => window.TIMELINE && window.renderFrame); await page.evaluate(() => document.fonts.ready);
const fonts = await page.evaluate(() => { const c = document.createElement('canvas').getContext('2d'); const m = (f) => { c.font = f; return Math.round(c.measureText('Hamburgefonstiv 123').width); };
  return { outfit: m('40px "Outfit SemiBold"'), barlow: m('800 40px "Barlow Condensed"'), price: m('40px "Pricedown Black"'), fallback: m('40px "NoSuchFontX"') }; });
console.log('font widths', JSON.stringify(fonts));
const shots = await page.evaluate(() => window.TIMELINE.shots);
for (const [id, t0, dur] of shots) {
  if (only && !only.includes(id)) continue;
  const t = Math.floor((t0 + dur * frac) * 12) / 12;
  const url = await page.evaluate((t) => { const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; window.renderFrame(t, c); return c.toDataURL('image/jpeg', 0.9); }, t);
  fs.writeFileSync(path.join(out, id + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close(); console.log('keys done', out);
