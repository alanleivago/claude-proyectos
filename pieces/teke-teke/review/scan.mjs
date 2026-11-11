// numeric pass (every 0.25 s) + frame scan for teke-teke; adapted from styles/yokai/tools/scan-example.mjs
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
  const inWall = (p) => p.x < WX1 + 0.15 && p.z < WZ - 0.005 && p.z > WZ - 0.165 && p.y < WT - 0.03;
  for (let t = a0; t <= a1; t += 0.25) { if (t >= 4.5 && t < 8.5) continue; window.renderFrame(t, c); const Wd = world(), cam = Wd.cam.position, bad = [];
    if (cam.y - gT(cam.x, cam.z) < 0.3) bad.push('cam low ' + (cam.y - gT(cam.x, cam.z)).toFixed(2)); if (inWall(cam) || (cam.z < WZ && cam.z > WZ - 0.17 && cam.x < WX1 && cam.y < WT + 0.1)) bad.push('cam in wall');
    Wd.polesX.forEach((x) => { if (Math.hypot(cam.x - x, cam.z - WZ - 0.2) < 0.4) bad.push('cam at pole'); });
    [Wd.me, Wd.ken].forEach((P, pi) => { if (!P.g.visible) return; const gf = Wd.train.visible || TT > 51.6 && TT < 58.6 ? () => RAIL - 0.06 : gT;
      P.leg.forEach((l, i) => { const d = l.A.y - gf(l.A.x, l.A.z); if (d < 0.04 || d > 0.3) bad.push('p' + pi + ' foot' + i + ' ' + d.toFixed(3)); if (inWall(l.A)) bad.push('p' + pi + ' foot in wall'); });
      P.arm.forEach((a, i) => { if (a.S.distanceTo(a.W) > P.pd.uArm + P.pd.fArm - 0.003) bad.push('p' + pi + ' arm' + i + ' overreach'); if (inWall(a.W)) bad.push('p' + pi + ' hand in wall'); });
      if (P.H.position.distanceTo(cam) < 0.35) bad.push('cam in p' + pi); });
    const G = Wd.girl; if (G.g.visible) { const st = G.st;
      G.arms.forEach((A, ai) => { const a = st.arms[ai]; const u = A.S.distanceTo(a.E), f = a.E.distanceTo(a.W); if (u > GL.uArm * 1.12) bad.push('g upper' + ai + ' ' + u.toFixed(2)); if (Math.abs(f - GL.fArm) > 0.04) bad.push('g fore' + ai + ' ' + f.toFixed(2));
        A.f.forEach((F, fi) => { const tp = F.tip; if (st.gy && tp.y < gT(tp.x, tp.z) - 0.04) bad.push('g tip under ' + ai + fi); if (inWall(tp)) bad.push('g tip in wall ' + ai + fi); if (tp.distanceTo(cam) < 0.2) bad.push('g tip at cam'); });
        if (st.gy && (a.E.y < gT(a.E.x, a.E.z) - 0.01)) bad.push('g elbow under'); if (inWall(a.E) || inWall(a.W)) bad.push('g arm in wall ' + ai);
        if (Wd.ken.g.visible) { const kc = Wd.ken.T.position.clone().add(V3(0, 0.3, 0)); if (a.W.distanceTo(kc) < 0.1) bad.push('g wrist inside ken'); } });
      if (inWall(st.chest) || inWall(st.head.p)) bad.push('g body in wall'); if (st.gy && st.waist.y < gT(st.waist.x, st.waist.z)) bad.push('g waist under');
      if (G.head.position.distanceTo(cam) < 0.3) bad.push('g head at cam ' + G.head.position.distanceTo(cam).toFixed(2));
      if (Wd.ken.g.visible) { const d = G.head.position.distanceTo(Wd.ken.H.position); if (d < 0.19) bad.push('heads overlap ' + d.toFixed(2)); } }
    if (bad.length) out.push([+t.toFixed(2), bad.join('; ')]); }
  return out; }, [mode, +a0, +a1, +(step || 1)]);
console.log(JSON.stringify(res)); await browser.close();
