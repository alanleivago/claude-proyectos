// frames just before, during and just after slides where a person crosses the seam (continuous actor)
//   usage: node tools/slidecheck.mjs <outdir> [n=6]
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const out = process.argv[2], N = Number(process.argv[3] || 6);
const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
const browser = await chromium.launch(), page = await browser.newPage();
page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
await page.goto(pathToFileURL(file).href + '?export=1'); await page.waitForFunction(() => window.TIMELINE && window.renderFrame); await page.evaluate(() => document.fonts.ready);
fs.mkdirSync(out, { recursive: true });
const slides = await page.evaluate(() => { const r = []; for (let i = 1; i < IDS.length; i++) { const a = new Set(PLAN[i - 1][3].map((c) => WHO(c[0]))), b = PLAN[i][3].filter((c) => a.has(WHO(c[0]))); if (b.length) r.push([IDS[i], TB[i]]); } return r; });
const pick = slides.filter((_, k) => k % Math.max(1, Math.floor(slides.length / N)) === 0).slice(0, N); const log = [];
for (const [id, t] of pick) for (const [tag, dt] of [['a', -0.5], ['b', -0.2], ['c', 0], ['d', 0.2], ['e', 0.5]]) {
  const url = await page.evaluate(([t]) => { const T = window.TIMELINE, c = document.createElement('canvas'); c.width = T.width; c.height = T.height; window.renderFrame(Math.round(t * T.fps) / T.fps, c);
    const s = document.createElement('canvas'); s.width = 480; s.height = 270; s.getContext('2d').drawImage(c, 0, 0, 480, 270); return s.toDataURL('image/jpeg', 0.85); }, [t + dt]);
  fs.writeFileSync(path.join(out, `${id}_${tag}.jpg`), Buffer.from(url.split(',')[1], 'base64')); log.push(`${id}_${tag}`);
}
console.log(JSON.stringify({ slides: slides.length, picked: pick.map((p) => p[0]) })); await browser.close();
