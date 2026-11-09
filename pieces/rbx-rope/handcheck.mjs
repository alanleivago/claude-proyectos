// node handcheck.mjs -> per shot, worst hand-to-rope distance (body units) over u = 0..1; flags > 0.6 (hand visibly off the rope)
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage(); await page.goto(pathToFileURL(path.join(dir, 'board.html')).href); await page.waitForFunction(() => window.READY, null, { timeout: 600000 });
const n = await page.evaluate(() => ENG.shots.length); let all = 0;
for (let i = 0; i < n; i++) { let w = { d: 0 }; for (const u of [0, 0.2, 0.4, 0.6, 0.8, 1]) { const r = await page.evaluate(([k, uu]) => window.handErr(k, uu), [i, u]); if (r.d > w.d) w = Object.assign(r, { u }); } all = Math.max(all, w.d); if (w.d > 0.6) console.log('shot', i + 1, JSON.stringify(w)); }
console.log('max', all); await browser.close();
