// numeric pass (every 0.25 s) + frame scan for scp-087; adapted from styles/yokai/tools/scan-example.mjs
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const [file, mode, a0, a1, step] = process.argv.slice(2);
const browser = await chromium.launch(), page = await browser.newPage(); page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
await page.goto(pathToFileURL(path.resolve(file)).href + '?export=1'); await page.waitForFunction(() => window.TIMELINE && window.renderFrame);
const res = await page.evaluate(([mode, a0, a1, step]) => {
  const T = window.TIMELINE, c = document.createElement('canvas'); c.width = T.width; c.height = T.height; const out = [];
  if (mode === 'scan') { const s = document.createElement('canvas'); s.width = 108; s.height = 192; const g = s.getContext('2d', { willReadFrequently: true }); let prev = null;
    for (let f = Math.round(a0 * 24); f <= Math.round(a1 * 24); f += step) { window.renderFrame(f / 24, c); g.drawImage(c, 0, 0, 108, 192); const d = g.getImageData(0, 0, 108, 192).data, gr = new Float32Array(108 * 192); for (let i = 0; i < gr.length; i++) gr[i] = (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3;
      if (prev) { let m = 0, cells = new Float32Array(144); for (let i = 0; i < gr.length; i++) { const v = Math.abs(gr[i] - prev[i]); m += v; const x = i % 108, y = Math.floor(i / 108); cells[Math.floor(y / 16) * 12 + Math.floor(x / 9)] += v / 144; } out.push([+(f / 24).toFixed(3), +(m / gr.length).toFixed(2), +Math.max(...cells).toFixed(1)]); } prev = gr; } return out; }
  const inLand = (p) => { for (let n = 0; n <= 2 * NLV + 1; n++) { const xc = landX(n); if (Math.abs(p.x - xc) < LD / 2 && Math.abs(p.z) < WELL + LW && p.y < landY(n) - 0.005 && p.y > landY(n) - 0.2) return 'landing ' + n; } return null; };
  const inStair = (p) => { for (let fl = 0; fl <= 2 * NLV; fl++) { const A = fl % 2 === 0, inLane = A ? (p.z < -WELL && p.z > -WELL - LW) : (p.z > WELL && p.z < WELL + LW); if (!inLane) continue; const u = A ? p.x - SX : SX + SL - p.x; if (u < 0 || u > SL) continue; const top = stairY(fl, p.x, p.z), yT = -1.5 * fl - 1.5 * u / SL; if (p.y < top - 0.005 && p.y > yT - 0.45) return 'flight ' + fl; } return null; };
  const solid = (p) => { if (p.x > 150) { if (Math.abs(p.z) > WELL + LW - 0.03 || p.x < SX - LD + 0.03 || p.x > SX + SL + LD - 0.03) return 'well wall'; return inLand(p) || inStair(p); } if (p.y < 0.02) return 'hall floor'; if (Math.abs(p.z) > HALLZ - 0.03) return 'hall wall'; if (p.x > -0.03) return 'end wall'; return null; };
  for (let t = a0; t <= a1; t += 0.25) { if (t >= 4.5 && t < 8.5 || t >= 45.0 && t < 45.6) continue; window.renderFrame(t, c); const Wd = world(), cam = Wd.cam.position.clone(), bad = [];
    const sc = solid(cam); if (sc) bad.push('cam in ' + sc);
    const P = Wd.me; if (P.g.visible) { const gf = P.gfNow || gT;
      P.leg.forEach((l, i) => { const d = l.A.y - gf(l.A.x, l.A.z); if (d < 0.05 || d > 0.42) bad.push('foot' + i + ' ' + d.toFixed(3)); const s2 = solid(l.A.clone().add(V3(0, -0.02, 0))); if (s2 && d < 0.05) bad.push('foot' + i + ' in ' + s2); const s3 = solid(l.K); if (s3) bad.push('knee in ' + s3); });
      P.arm.forEach((a, i) => { if (a.S.distanceTo(a.W) > P.pd.uArm + P.pd.fArm - 0.003) bad.push('arm' + i + ' overreach'); const s2 = solid(a.W); if (s2) bad.push('hand' + i + ' in ' + s2); });
      if (P.H.position.distanceTo(cam) < 0.35 && Wd.me.g.visible) bad.push('cam in head'); const sh = solid(P.H.position.clone().add(V3(0, 0.1, 0))); if (sh) bad.push('head in ' + sh);
      if (Wd.torch.visible && Wd.torch.position.distanceTo(cam) < 0.3) bad.push('torch at lens'); }
    const T = Wd.thing; if (T.g.visible) { const hp = T.head.position; if (hp.distanceTo(cam) < 0.6) bad.push('thing at cam'); const s1 = solid(hp); if (s1) bad.push('thing head in ' + s1); T.arms.forEach((A, i) => { const s2 = solid(A.palm.position); if (s2) bad.push('thing hand' + i + ' in ' + s2); }); T.legs.forEach((L, i) => { const s2 = solid(L.ft.position.clone().add(V3(0, 0.03, 0))); if (s2) bad.push('thing foot' + i + ' in ' + s2); }); }
    const A0 = P.g.visible ? P.leg.map((l) => l.A.clone()) : null, gf0 = P.gfNow || gT;
    window.renderFrame(t + 1 / 24, c); if (A0 && P.g.visible) P.leg.forEach((l, i) => { const a = A0[i], b = l.A; if (a.y - gf0(a.x, a.z) < P.pd.ank + 0.012 && b.y - gf0(b.x, b.z) < P.pd.ank + 0.012) { const m = Math.hypot(a.x - b.x, a.z - b.z); if (m > 0.012) bad.push('foot' + i + ' slide ' + m.toFixed(3)); } });
    if (bad.length) out.push([+t.toFixed(2), bad.join('; ')]); }
  return out; }, [mode, +a0, +a1, +(step || 1)]);
console.log(JSON.stringify(res)); await browser.close();
