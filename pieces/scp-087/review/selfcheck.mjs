// creature self-check: the Thing at the hit pose seen front (the hit camera), side, 3/4 low, back; lights forced up
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path'; import fs from 'node:fs'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const b = await chromium.launch(), p = await b.newPage(); p.on('pageerror', (e) => console.error(e.message)); await p.goto(pathToFileURL(path.resolve('index.html')).href + '?export=1'); await p.waitForFunction(() => window.TIMELINE && window.renderFrame);
const urls = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; renderFrame(48, c); const T = world().thing, hp = T.head.position.clone(), pel = T.pelvis.position.clone(), out = [];
  const views = [[null], [hp.clone().add(V3(0, 0, 1.6)), hp, 30], [hp.clone().add(V3(1.0, -0.3, 1.0)), hp.clone().add(V3(0, -0.5, 0)), 45], [pel.clone().add(V3(0, 0.3, -3.2)), pel.clone().add(V3(0, 0.2, 0)), 50], [hp.clone().add(V3(0.5, 0.05, 0.25)), hp, 30]];
  views.forEach(([a, t, f]) => { window.DBG_CAM = a ? [a, t, f] : null; renderFrame(48, c); out.push(c.toDataURL('image/png')); }); window.DBG_CAM = null; return out; });
const tiles = urls.map((u, i) => { const f = `review/sc${i}.png`; fs.writeFileSync(f, Buffer.from(u.split(',')[1], 'base64')); return f; }); console.log(tiles.join(' ')); await b.close();
