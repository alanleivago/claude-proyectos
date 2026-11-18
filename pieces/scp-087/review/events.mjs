// frame-accurate sound cues from the picture's own clock -> sound/cues.json: heel strikes (walk/run), bulb level of the
// nearest live bulb, torch level, the Thing's head-roll snaps (stop-motion), mop swing peaks
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path'; import fs from 'node:fs'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const b = await chromium.launch(), p = await b.newPage(); p.on('pageerror', (e) => console.error(e.message)); await p.goto(pathToFileURL(path.resolve('index.html')).href + '?export=1'); await p.waitForFunction(() => window.TIMELINE && window.renderFrame);
const res = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; rend().r.render = () => {}; window.ykBlit = () => {};
  const out = { steps: [], bulb: [], torch: [], snaps: [], vis: [] }; let prevG = [true, true], prevRoll = null, prevVis = false;
  for (let f = 0; f < 1704; f++) { const t = f / 24; renderFrame(t, c); const Wd = world(), P = Wd.me, on = P.g.visible || (t >= 26.6 && t < 32.6);
    if (on) { const gf = P.gfNow || gT; P.leg.forEach((l, i) => { const g = l.A.y - gf(l.A.x, l.A.z) < P.pd.ank + 0.015; if (g && !prevG[i] && prevVis) out.steps.push([+t.toFixed(3), i, (t > 51.6 && t < 58.6) ? 'run' : (t > 20.6 && t < 58.6) ? 'stair' : 'floor']); prevG[i] = g; }); }
    prevVis = on && !(t >= 58.6); out.bulb.push(+Math.max(0, ...Wd.slamps.map((s) => s.intensity)).toFixed(3)); out.torch.push(+Wd.lamp.intensity.toFixed(2));
    const T = Wd.thing; if (T.g.visible) { const r = T.head.rotation.z; const q = T.head.quaternion; const key = q.toArray().map((v) => v.toFixed(3)).join(); if (prevRoll && key !== prevRoll) out.snaps.push(+t.toFixed(3)); prevRoll = key; } else prevRoll = null; }
  return out; });
fs.writeFileSync('sound/cues.json', JSON.stringify(res)); console.log('steps', res.steps.length, 'snaps', res.snaps.length); await b.close();
