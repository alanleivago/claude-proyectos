// render every panel's board frame (TIMELINE.board) to <out>/pNN.jpg and print the panel times as JSON
//   usage: node tools/board.mjs <outdir> [--scale 0.5] [--times t1,t2,...  (extra frames -> <outdir>/tNNN.jpg)]
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const args = process.argv.slice(2), out = args[0];
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const scale = Number(opt('--scale', 1)), extra = opt('--times', null);
const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
const browser = await chromium.launch(), page = await browser.newPage();
page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
page.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') console.error('console:', m.text()); });
await page.goto(pathToFileURL(file).href + '?export=1');
await page.waitForFunction(() => window.TIMELINE && window.renderFrame);
await page.evaluate(() => document.fonts.ready);
fs.mkdirSync(out, { recursive: true });
const jobs = extra ? extra.split(',').map((t) => [Number(t), 't' + String(Math.round(Number(t) * 10)).padStart(4, '0')]) : await page.evaluate(() => window.TIMELINE.board.map((b, i) => [b.t, 'p' + String(i + 1).padStart(2, '0')]));
for (const [t, name] of jobs) {
  const url = await page.evaluate(([t, k]) => { const T = window.TIMELINE, c = document.createElement('canvas'); c.width = T.width; c.height = T.height; window.renderFrame(Math.round(t * T.fps) / T.fps, c);
    const s = document.createElement('canvas'); s.width = Math.round(T.width * k); s.height = Math.round(T.height * k); const g = s.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, s.width, s.height); return s.toDataURL('image/jpeg', 0.88); }, [t, scale]);
  fs.writeFileSync(path.join(out, name + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
}
if (!extra) console.log(JSON.stringify(await page.evaluate(() => window.TIMELINE.shots.map((s, i) => ({ id: s.key, t0: s.t0, t1: s.t1, board: window.TIMELINE.board[i].t })))));
await browser.close();
