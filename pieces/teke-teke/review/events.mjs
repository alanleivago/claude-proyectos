// dump the picture's sound events (frame-accurate, after the stop-motion holds) to sound/cues.json
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const browser = await chromium.launch(), page = await browser.newPage(); page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
await page.goto(pathToFileURL(path.resolve('index.html')).href + '?export=1'); await page.waitForFunction(() => window.TIMELINE && window.renderFrame);
const ev = await page.evaluate(() => {
  const snap = (te) => { let f = Math.ceil(te * 24 - 1e-6); while (stutT(f / 24) < te - 1e-6 && f < 1800) f++; return +(f / 24).toFixed(4); };   // when the held pose shows it
  const out = { plants: [], drags: [], jerks: [], flick: [], steps: [], run: [], misc: {} };
  KCH.C.forEach((c, i) => { [1, 2].forEach((j) => out.plants.push({ t: snap(c.t + j * c.r), ty: c.ty, hand: j - 1, i })); out.drags.push({ t0: snap(c.t + 2 * c.r + c.h), t1: snap(c.t + 2 * c.r + c.h + c.d), ty: c.ty }); });
  out.misc = { land: snap(39.4), freeze: snap(FREEZE), lunge: snap(LUNGE), ksp: KSPD, tilt: snap(35.25) };
  // head jerk snaps (segment boundaries) per shot: [seed, t0, t1, amp]
  [[1, 0, 4.5, 1], [5, 32.6, 38.6, 0.35], [3, 39.4, FREEZE, 1], [7, 45.6, 51.6, 0.25]].forEach(([seed, a, b, amp]) => { let t0 = 0, k = 0; for (;;) { const d = 0.25 + 0.85 * hsh(k * 7 + seed, 51); t0 += d; k++; if (t0 > b) break; if (t0 > a) out.jerks.push({ t: snap(t0), amp }); } });
  // lamp flicker transitions (lamps with fl), for each frame of every night shot, the lamp's distance to the shot focus is not known here: keep x for gain later
  LAMPS.forEach((L) => { if (!L.fl) return; let prev = flick(L, 0); for (let f = 1; f < 1704; f++) { const t = f / 24, v = flick(L, t); if (Math.abs(v - prev) > 0.3) out.flick.push({ t: +t.toFixed(4), lamp: L.i, x: L.p.x, up: v > prev, v }); prev = v; } });
  // walking heel strikes (gaitFeet: phase crosses 0 when c + 0.5j + duty/2 is an integer)
  const strikes = (s0fn, t0, t1, stride, duty, who) => { for (let t = t0; t < t1; t += 1 / 240) { const c0 = s0fn(t) / stride, c1 = s0fn(t + 1 / 240) / stride; [0, 1].forEach((j) => { if (Math.floor(c0 + 0.5 * j + duty / 2) !== Math.floor(c1 + 0.5 * j + duty / 2)) out[who === 'run' ? 'run' : 'steps'].push({ t: +(t + 1 / 240).toFixed(4), who, foot: j }); }); } };
  strikes((t) => 1.1 * (t - 20.6), 20.6, 28.1, 1.24, 0.62, 'me'); strikes((t) => 1.1 * (t - 20.6) + 0.31, 20.6, 28.1, 1.24, 0.62, 'ken');
  strikes((t) => KSPD * Math.max(0, t - 38.6), 38.6, 45.0, 1.55, 0.4, 'run');
  return out; });
fs.writeFileSync('sound/cues.json', JSON.stringify(ev, null, 1)); console.log(ev.plants.length, 'plants', ev.jerks.length, 'jerks', ev.flick.length, 'flicks', ev.steps.length, 'steps', ev.run.length, 'run', JSON.stringify(ev.misc)); await browser.close();
