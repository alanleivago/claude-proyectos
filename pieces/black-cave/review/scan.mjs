// numeric pass (every 0.25 s) + frame scan for black-cave; adapted from styles/yokai/tools/scan-example.mjs
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
  for (let t = a0; t <= a1; t += 0.25) { window.renderFrame(t, c); const Wd = world(), cam = Wd.cam.position, bad = [];
    if (Wd.ext.visible) { const gy = gE(cam.x, cam.z); if (cam.y - gy < 0.4) bad.push('cam low ' + (cam.y - gy).toFixed(2)); }
    if (Wd.cham.visible) { const gy = gC(cam.x, cam.z); if (cam.y - gy < 0.2) bad.push('cam low'); if (cam.z - CH.z < SLIT.z + 0.4) bad.push('cam in wall'); }
    if (Wd.sec.visible) { if (cam.z - SC.z < 0.4) bad.push('cam behind cut ' + (cam.z - SC.z).toFixed(2)); }
    [Wd.bro, Wd.me, ...Wd.res].forEach((P, pi) => { if (!P.g.visible) return; const gf = Wd.ext.visible ? gE : Wd.cham.visible ? gC : null;
      if (gf && Wd.ext.visible) P.leg.forEach((l, i) => { const d = l.A.y - gf(l.A.x, l.A.z); if (d < 0.04 || d > 0.2) bad.push('p' + pi + ' foot' + i + ' ' + d.toFixed(3)); });
      P.arm.forEach((a, i) => { if (a.S.distanceTo(a.W) > P.pd.uArm + P.pd.fArm - 0.003) bad.push('p' + pi + ' arm' + i + ' overreach'); });
      if (P.H.position.distanceTo(cam) < 0.35) bad.push('cam in p' + pi);
      if (Wd.cham.visible) { [...P.arm.map((a) => a.W), ...P.leg.map((l) => l.A), P.H.position].forEach((p, k) => { if (p.y < gC(p.x, p.z) + 0.01) bad.push('p' + pi + ' part' + k + ' under floor'); }); }
      if (Wd.sec.visible) { const L = SCURVE.getLength(); [...P.arm.map((a) => a.W), P.H.position, P.top].forEach((p, k) => { const lp = p.clone().sub(SC); let best = 1e9, bu = 0; for (let u = 0; u <= 1; u += 0.002) { const d = secAt(u).p.distanceTo(V3(lp.x, lp.y, 0)); if (d < best) { best = d; bu = u; } } const h = secAt(bu).h; if (best > h + 0.02) bad.push('p' + pi + ' part' + k + ' in rock ' + (best - h).toFixed(3)); }); } });
    const C = Wd.craw; if (C.g.visible) { C.arms.forEach((A, ai) => { if (!A.palm.visible) return; A.f.forEach((F, fi) => { const tp = F.tip; if (Wd.cham.visible && tp.y < gC(tp.x, tp.z) - 0.01) bad.push('craw tip under ' + ai + fi); if (tp.distanceTo(cam) < 0.25) bad.push('tip at cam');
        if (Wd.sec.visible && Wd.bro.g.visible) { const H = Wd.bro.H.position; if (tp.distanceTo(H) < 0.1) bad.push('tip in his head'); } }); });
      if (C.head.visible && Wd.bro.g.visible) { const d = C.head.position.distanceTo(Wd.bro.H.position); if (d < 0.2) bad.push('heads overlap ' + d.toFixed(2)); }
      if (C.head.visible && C.head.position.distanceTo(cam) < 0.3) bad.push('head at cam'); }
    if (bad.length) out.push([+t.toFixed(2), bad.join('; ')]); }
  return out; }, [mode, +a0, +a1, +(step || 1)]);
console.log(JSON.stringify(res)); await browser.close();
