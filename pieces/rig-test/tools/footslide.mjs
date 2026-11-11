// Foot sliding: during the walk, the foot on the ground (sole within 3 px of the ground) should not move in x.
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const b = await chromium.launch(), p = await b.newPage();
await p.goto(pathToFileURL(path.resolve(process.argv[2], 'index.html')).href + '?export=1');
await p.waitForFunction(() => window.renderFrame);
const r = await p.evaluate(() => {
  window.renderFrame(0);
  const res = [];
  for (let f = Math.ceil(T_WALK * 24) + 18; f < 288; f++) {
    const pose = frame(f / 24), { skin } = R.solve(pose);
    const row = { f, st: stanceFoot(f / 24) };
    for (const ft of ['footB', 'footF']) { const m = skin[R.bones.findIndex((x) => x.name === ft)];
      const pts = SOLE[ft].map(([x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]);
      row[ft] = pts; }
    res.push(row);
  }
  return res;
});
let worst = 0, sum = 0, n = 0;
let pen = 0; const hov = [];
for (let i = 1; i < r.length; i++) for (const [fi, ft] of [[0, 'footB'], [1, 'footF']]) {
  for (const q of r[i][ft]) pen = Math.max(pen, q[1] - 978);
  if (r[i].st !== fi || r[i - 1].st !== fi) continue;
  hov.push(978 - Math.max(r[i][ft][0][1], r[i][ft][1][1]));
  for (let k = 0; k < 2; k++) { const a = r[i - 1][ft][k], c = r[i][ft][k];
    if (a[1] > 978 - 3 && c[1] > 978 - 3) { const dx = Math.abs(c[0] - a[0]); worst = Math.max(worst, dx); sum += dx; n++; } }
}
hov.sort((a, b) => a - b); console.log(`planted foot above ground: median ${hov[hov.length >> 1].toFixed(1)} px, max ${hov.at(-1).toFixed(1)} px`);
console.log(`max sole below ground ${pen.toFixed(1)} px; stance frames ${n}, mean foot slip ${(sum / n).toFixed(2)} px/frame, worst ${worst.toFixed(2)} px/frame (walk moves ~${((r.at(-1).footB[0][0] - r[0].footB[0][0]) / r.length).toFixed(1)} px/frame)`);
await b.close();
