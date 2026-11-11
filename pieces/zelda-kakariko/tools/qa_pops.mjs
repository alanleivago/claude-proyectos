// frame-by-frame pop/flicker QA without the style's wiggle: render every frame at 1/4 size, count pixels that jump
// (>30 grey) vs the previous frame, and report spikes (>2.2x the local median) outside the panel slides; also
// "flicker" = pixels that change and change back (2nd difference) per frame.
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import { pathToFileURL } from 'node:url'; import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(execSync('npm root -g').toString().trim() + '/playwright'); } })();
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu'] }), p = await b.newPage();
await p.goto(pathToFileURL(process.cwd() + '/index.html').href + '?export=1'); await p.waitForFunction(() => window.renderFrame);
const res = await p.evaluate(() => {
  STYLE.post = () => {};
  const T = window.TIMELINE, c = document.createElement('canvas'); c.width = T.width; c.height = T.height;
  const s = document.createElement('canvas'); s.width = T.width / 4; s.height = T.height / 4; const g = s.getContext('2d', { willReadFrequently: true });
  let a = null, b2 = null; const out = [];
  for (let i = 0; i < T.frames; i++) {
    window.renderFrame(i / T.fps, c); g.drawImage(c, 0, 0, s.width, s.height);
    const d = g.getImageData(0, 0, s.width, s.height).data, L = new Float32Array(d.length / 4);
    for (let k = 0; k < L.length; k++) L[k] = 0.3 * d[4 * k] + 0.59 * d[4 * k + 1] + 0.11 * d[4 * k + 2];
    let ch = 0, fl = 0;
    if (a) for (let k = 0; k < L.length; k++) { if (Math.abs(L[k] - a[k]) > 30) ch++; if (b2 && Math.abs(L[k] - 2 * a[k] + b2[k]) > 60 && Math.abs(L[k] - b2[k]) < 15) fl++; }
    out.push([i, ch, fl]); b2 = a; a = L;
  }
  return out;
});
fs.writeFileSync('review/qa_series.json', JSON.stringify(res)); await b.close();
const TB = JSON.parse(fs.readFileSync('board/times.json')).slice(1).map((x) => x.t0);
const inSlide = (i) => TB.some((t) => Math.abs(i / 24 - t) < 0.55);
const flag = [], fl = [];
for (let k = 3; k < res.length - 3; k++) {
  const nb = [...res.slice(k - 3, k), ...res.slice(k + 1, k + 4)].map((r) => r[1]).sort((x, y) => x - y)[3];
  if (res[k][1] > 2.2 * Math.max(nb, 150) && !inSlide(k)) flag.push([k, +(k / 24).toFixed(2), res[k][1], nb]);
  if (res[k][2] > 300 && !inSlide(k)) fl.push([k, +(k / 24).toFixed(2), res[k][2]]);
}
console.log('pops outside slides:', JSON.stringify(flag)); console.log('flicker frames (>300 px change-and-back):', JSON.stringify(fl));
