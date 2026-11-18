// render one key frame per beat (at 82 % of the beat, all lettering visible) -> review/keys/<id>.jpg
//   node tools/keyframes.mjs [scale=0.5] [ids,comma]
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const D = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const scale = Number(process.argv[2] || 0.5), only = process.argv[3] ? process.argv[3].split(',') : null;
const beats = JSON.parse(fs.readFileSync(path.join(D, 'review/script.json'), 'utf8'));
const browser = await chromium.launch(), page = await browser.newPage();
page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
await page.goto(pathToFileURL(path.join(D, 'index.html')).href + '?export=1');
await page.waitForFunction(() => window.TIMELINE && window.renderFrame); await page.evaluate(() => document.fonts.ready);
for (const b of beats) {
  if (only && !only.includes(b.id)) continue;
  const t = Math.floor((b.t0 + b.dur * 0.82) * 12) / 12;
  const url = await page.evaluate(([t, k]) => { const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; window.renderFrame(t, c);
    const s = document.createElement('canvas'); s.width = 1920 * k; s.height = 1080 * k; const g = s.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, s.width, s.height); return s.toDataURL('image/jpeg', 0.86); }, [t, scale]);
  fs.writeFileSync(path.join(D, 'review/keys', b.id + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close(); console.log('keys done');
