// SFX check for a dev build: node pieces/ten-seconds/dev/sfxcount.mjs pieces/ten-seconds/dev/s03 [sec]
// prints how many SFX the build registers, per minute over the section's shots, the kinds used, unknown kinds,
// and whether any SFX is called from a draw function (SFX_REG grows while frames render = wrong).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');
const dir = path.resolve(process.argv[2]), sec = process.argv[3];
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + path.join(dir, 'index.html') + '?export=1');
await p.waitForFunction(() => window.TIMELINE && window.renderFrame);
const r = await p.evaluate((sec) => {
  const shots = TIMELINE.shots.filter((s) => !sec || s.sec === sec);
  const t0 = Math.min(...shots.map((s) => s.t0)), t1 = Math.max(...shots.map((s) => s.t1));
  const n0 = SFX_REG.length;
  for (let k = 0; k < 12; k++) window.renderFrame(t0 + (t1 - t0) * k / 12);
  const grew = SFX_REG.length - n0;
  const mine = SFX_REG.filter(([t]) => t >= t0 - 0.5 && t < t1 + 0.5);
  const kinds = {}; mine.forEach(([, k]) => (kinds[k] = (kinds[k] || 0) + 1));
  const known = ['whoosh','swish','pop','blip','tick','click','thud','impact','splash','drip','paper','cloth','step','slide','glass','metal','beep','buzz','cheer','gasp','laugh','car','brake','horn','engine','wiper','door','bounce','coin','ding','camera','type','heart','shimmer','ghost','rise','drop','crowd','plastic'];
  const unknown = Object.keys(kinds).filter((k) => !known.includes(k));
  const perShot = shots.map((s) => mine.filter(([t]) => t >= s.t0 && t < s.t1).length);
  return { t0, t1, n: mine.length, perMin: mine.length / ((t1 - t0) / 60), grew, kinds, unknown, silentShots: shots.filter((s, i) => perShot[i] === 0).map((s) => s.key) };
}, sec);
console.log(`section ${sec || 'all'}: ${r.t0.toFixed(1)}–${r.t1.toFixed(1)} s · ${r.n} sfx · ${r.perMin.toFixed(1)} per minute`);
console.log('kinds:', JSON.stringify(r.kinds));
if (r.unknown.length) console.log('UNKNOWN kinds (will be silent):', r.unknown.join(', '));
if (r.grew) console.log(`WRONG: ${r.grew} SFX registered while drawing frames — move those SFX(...) calls out of draw functions`);
console.log('shots with no sfx:', r.silentShots.length ? r.silentShots.join(', ') : 'none');
await b.close();
