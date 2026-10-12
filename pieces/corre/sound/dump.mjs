// dump the moments you pass each car (and the zone edges) from the built page: node dump.mjs ../index.html out.json
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href + '?export=1');
const out = await p.evaluate(() => {
  const cars = [];
  carList().forEach(([x, z0, v], i) => { let prev = null;
    for (let t = 4.5; t < 31; t += 0.005) { const d = (z0 + v * t) - (-runS(t)); if (prev !== null && Math.sign(d) !== Math.sign(prev)) { cars.push({ i, t: +t.toFixed(3), x, rel: +(vVis(t) + (v < 0 ? v : v)).toFixed(1), oncoming: v > 0 }); break; } prev = d; } });
  const steps = []; let k0 = Math.floor(stepP(4.7)); for (let t = 4.7; t < 18.6; t += 0.002) { const k = Math.floor(stepP(t)); if (k !== k0) { steps.push(+t.toFixed(3)); k0 = k; } }
  return { steps, cars: cars.sort((a, b) => a.t - b.t), ZB, ZC, ZD, tB: tPass(-ZB), tC: tPass(-ZC), tD: tPass(-ZD) };
});
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1)); await b.close();
console.log(out.cars.length, 'car passes; zones', out.tB.toFixed(2), out.tC.toFixed(2), out.tD.toFixed(2));
console.log(out.cars.map((c) => `${c.t}${c.oncoming ? 'o' : ''}@${c.x}`).join(' '));
