// usage: node dbg.mjs <index.html> <out.png> <scale> <t> <js-file-defining-views>  ; views file sets window.VIEWS = [fn,...] each fn called as DBG_SHOT
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const [file, out, scale, t, vf] = process.argv.slice(2);
const browser = await chromium.launch(), page = await browser.newPage(); page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message)); page.on('console', (m) => console.log('LOG', m.text()));
await page.goto(pathToFileURL(path.resolve(file)).href + '?export=1'); await page.waitForFunction(() => window.TIMELINE && window.renderFrame);
await page.addScriptTag({ content: fs.readFileSync(vf, 'utf8') });
const url = await page.evaluate(([k, t]) => { const T = window.TIMELINE, c = document.createElement('canvas'); c.width = T.width; c.height = T.height; const V = window.VIEWS, w = Math.round(T.width * k), h = Math.round(T.height * k);
  const s = document.createElement('canvas'); s.width = V.length * (w + 8); s.height = h; const g = s.getContext('2d');
  V.forEach((f, i) => { window.DBG_SHOT = f.shot || f; window.DBG_CAM = f.cam ? f.cam() : null; window.renderFrame(f.t ?? t, c); g.drawImage(c, i * (w + 8), 0, w, h); window.DBG_CAM = null; }); return s.toDataURL('image/png'); }, [Number(scale), Number(t)]);
fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); await browser.close();
