// node dbg2.mjs "<js expression using ENG>" -> prints the result
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage(); page.on('pageerror', (e) => console.log('[err]', e.message));
await page.goto(pathToFileURL(path.join(dir, 'board.html')).href); await page.waitForFunction(() => window.READY, null, { timeout: 600000 });
console.log(await page.evaluate((x) => JSON.stringify(eval(x)), process.argv[2])); await browser.close();
