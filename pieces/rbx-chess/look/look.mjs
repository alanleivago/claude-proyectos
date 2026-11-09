// node look/look.mjs [panel,panel...] -> look/<panel>.jpg ; then python look/sheet.py builds look_sheet.jpg
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const dir = path.dirname(fileURLToPath(import.meta.url)), out = process.env.OUT || dir;
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage(); page.on('console', (m) => { const t = m.text(); if (t.trim() && !t.includes('willReadFrequently')) console.log('[page]', t); }); page.on('pageerror', (e) => console.log('[err]', e.message));
await page.goto(pathToFileURL(path.join(dir, 'look.html')).href + '?sets=' + (process.env.SETS || 'kingdom,box'));
await page.waitForFunction(() => window.READY, null, { timeout: 300000 });
if ((await page.evaluate(() => window.READY)) === 'error') { await browser.close(); process.exit(1); }
const names = process.argv[2] ? process.argv[2].split(',') : await page.evaluate(() => Object.keys(LOOK.panels));
for (const n of names) { const t = Date.now(); const r = await page.evaluate((k) => window.renderPanel(k), n); if (!r) { console.log(n, 'FAILED'); continue; }
  fs.writeFileSync(path.join(out, `${n}.jpg`), Buffer.from(r.url.split(',')[1], 'base64')); console.log(n, Date.now() - t, 'ms (frame', r.ms, 'ms)'); }
await browser.close();
