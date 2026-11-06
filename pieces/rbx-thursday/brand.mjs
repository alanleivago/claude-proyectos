// node brand.mjs shots.json -> brand/<name>.png  (shots.json = [{name, W, H, set, mood, at, actors, moon, p, l, fov, ...}])
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const dir = path.dirname(fileURLToPath(import.meta.url)), out = path.join(dir, 'brand'); fs.mkdirSync(out, { recursive: true });
const shots = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage(); page.on('pageerror', (e) => console.log('[err]', e.message)); page.on('console', (m) => { const t = m.text(); if (/ERR|rror/.test(t)) console.log('[page]', t); });
await page.goto(pathToFileURL(path.join(dir, 'brand.html')).href); await page.waitForFunction(() => window.READY, null, { timeout: 600000 });
for (const s of shots) { const url = await page.evaluate((c) => (c.heroes ? window.studio(c) : window.shoot(c)), s); fs.writeFileSync(path.join(out, s.name + '.png'), Buffer.from(url.split(',')[1], 'base64')); console.log(s.name); }
await browser.close();
