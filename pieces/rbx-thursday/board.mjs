// node board.mjs [ids e.g. 1-30 or 3,7] [u=0.5] -> board/pNN.jpg (+ board/shots.json); then board_sheet.py builds the sheets
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const dir = path.dirname(fileURLToPath(import.meta.url)), out = path.join(dir, 'board'); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage(); page.on('console', (m) => { const t = m.text(); if (t.trim() && !t.includes('willReadFrequently')) console.log('[page]', t); }); page.on('pageerror', (e) => console.log('[err]', e.message));
await page.goto(pathToFileURL(path.join(dir, 'board.html')).href); await page.waitForFunction(() => window.READY, null, { timeout: 600000 });
if ((await page.evaluate(() => window.READY)) === 'error') { await browser.close(); process.exit(1); }
const shots = await page.evaluate(() => window.SHOTS_T); fs.writeFileSync(path.join(out, 'shots.json'), JSON.stringify(shots, null, 1));
const sel = process.argv[2] || `1-${shots.length}`, u = Number(process.argv[3] ?? 0.5), ids = [];
sel.split(',').forEach((p) => { const [a, b] = p.split('-').map(Number); for (let k = a; k <= (b || a); k++) ids.push(k); });
for (const n of ids) { const t = Date.now(); try { const url = await page.evaluate(([i, uu]) => window.renderShot(i, uu), [n - 1, u]); fs.writeFileSync(path.join(out, `p${String(n).padStart(2, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64')); console.log('p' + n, Date.now() - t, 'ms'); } catch (e) { console.log('p' + n, 'FAILED', e.message.split('\n')[0]); } }
await browser.close();
