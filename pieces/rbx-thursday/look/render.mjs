// node render.mjs [a,b,c,d] -> a.png.. in this folder (1080x1920), GPU headless chromium
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const dir = path.dirname(fileURLToPath(import.meta.url)), ids = (process.argv[2] || 'a,b,c,d').split(','), out = process.argv[3] || dir;
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage(); page.on('console', (m) => console.log('[page]', m.text())); page.on('pageerror', (e) => console.log('[err]', e.message));
if (process.env.BEAMK) await page.addInitScript((k) => { window.BEAMK = k; }, Number(process.env.BEAMK));
if (process.env.NOLINING) await page.addInitScript(() => { window.NOLINING = 1; });
if (process.env.LINC) await page.addInitScript((k) => { window.LINC = k; }, process.env.LINC);
if (process.env.NOMS) await page.addInitScript(() => { window.NOMS = 1; });
await page.goto(pathToFileURL(path.join(dir, 'look.html')).href); await page.waitForFunction(() => window.READY, null, { timeout: 120000 });
console.log(await page.evaluate(() => { const gl = document.createElement('canvas').getContext('webgl2'); const e = gl.getExtension('WEBGL_debug_renderer_info'); return gl.getParameter(e.UNMASKED_RENDERER_WEBGL); }));
for (const id of ids) { const t = Date.now(); const url = await page.evaluate((i) => window.renderShot(i), id); fs.writeFileSync(path.join(out, `${id}.png`), Buffer.from(url.split(',')[1], 'base64')); console.log(id, Date.now() - t, 'ms'); }
await browser.close();
