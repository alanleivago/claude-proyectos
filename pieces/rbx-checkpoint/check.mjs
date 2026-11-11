// node check.mjs -> lists shots whose camera is inside / against geometry (self-check before showing the board)
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage(); page.on('pageerror', (e) => console.log('[err]', e.message));
await page.goto(pathToFileURL(path.join(dir, 'board.html')).href); await page.waitForFunction(() => window.READY, null, { timeout: 600000 });
const n = await page.evaluate(() => ENG.shots.length);
for (let i = 0; i < n; i++) { const r = await page.evaluate((k) => { try { return window.checkShot(k); } catch (e) { return { i: k, hits: ["ERR " + e.message] }; } }, i); if (r.hits.length) console.log(JSON.stringify(r)); }
await browser.close();
