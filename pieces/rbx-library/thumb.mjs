// node thumb.mjs -> renders/thumb_bg_<n>.jpg (clean frames, no caption) for the thumbnail
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage(); await page.goto(pathToFileURL(path.join(dir, 'render.html')).href); await page.waitForFunction(() => window.READY, null, { timeout: 600000 });
for (const [n, u] of [[66, 0.6], [33, 0.5], [94, 0.8], [89, 0.7], [82, 0.5]]) { const url = await page.evaluate(([i, uu]) => window.renderShot(i, uu), [n - 1, u]); fs.writeFileSync(path.join(dir, 'renders', `thumb_bg_${n}.jpg`), Buffer.from(url.split(',')[1], 'base64')); }
await browser.close();
