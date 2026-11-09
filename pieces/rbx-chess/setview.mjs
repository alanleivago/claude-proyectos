// node setview.mjs <set> [outDir] [extraScripts,comma] -> <outDir>/<set>_<view>.jpg + <set>_sheet.jpg (all the set's views)
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const dir = path.dirname(fileURLToPath(import.meta.url)), set = process.argv[2], out = path.resolve(process.argv[3] || path.join(dir, 'board', 'sets')), extra = process.argv[4] || '';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage(); page.on('console', (m) => console.log('[page]', m.text())); page.on('pageerror', (e) => console.log('[err]', e.message));
await page.goto(pathToFileURL(path.join(dir, 'setview.html')).href + `?set=${set}&extra=${extra}` + (process.env.PEOPLE === '0' ? '&people=0' : ''));
await page.waitForFunction(() => window.READY, null, { timeout: 180000 });
if ((await page.evaluate(() => window.READY)) === 'error') { await browser.close(); process.exit(1); }
const views = await page.evaluate(() => window.VIEWS), files = [];
for (const v of views) { const t = Date.now(); const url = await page.evaluate((i) => window.renderView(i), v); const f = path.join(out, `${set}_${v}.jpg`); fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); files.push(f); console.log(v, Date.now() - t, 'ms'); }
await browser.close();
if (files.length > 1) execSync(`ffmpeg -loglevel error -y ${files.map((f) => `-i "${f}"`).join(' ')} -filter_complex "${files.map((_, i) => `[${i}]scale=360:640[s${i}]`).join(';')};${files.map((_, i) => `[s${i}]`).join('')}hstack=${files.length}" "${path.join(out, set + '_sheet.jpg')}"`);
console.log('sheet', path.join(out, set + '_sheet.jpg'));
