// frame scan: render every `step` frames, grey 108x192 thumbnails, diff consecutive; plus numeric checks per 0.25 s
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const [file, mode, a0, a1, step] = process.argv.slice(2);
const browser = await chromium.launch(), page = await browser.newPage(); page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
await page.goto(pathToFileURL(path.resolve(file)).href + '?export=1'); await page.waitForFunction(() => window.TIMELINE && window.renderFrame);
const res = await page.evaluate(([mode, a0, a1, step]) => {
  const T = window.TIMELINE, c = document.createElement('canvas'); c.width = T.width; c.height = T.height; const out = [];
  if (mode === 'scan') { const s = document.createElement('canvas'); s.width = 108; s.height = 192; const g = s.getContext('2d', { willReadFrequently: true }); let prev = null;
    for (let f = Math.round(a0 * 24); f <= Math.round(a1 * 24); f += step) { window.renderFrame(f / 24, c); g.drawImage(c, 0, 0, 108, 192); const d = g.getImageData(0, 0, 108, 192).data, gr = new Float32Array(108 * 192); for (let i = 0; i < gr.length; i++) gr[i] = (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3;
      if (prev) { let m = 0, cells = new Float32Array(12 * 12); for (let i = 0; i < gr.length; i++) { const v = Math.abs(gr[i] - prev[i]); m += v; const x = i % 108, y = Math.floor(i / 108); cells[Math.floor(y / 16) * 12 + Math.floor(x / 9)] += v / 144; } out.push([+(f / 24).toFixed(3), +(m / gr.length).toFixed(2), +Math.max(...cells).toFixed(1)]); } prev = gr; } return out; }
  // numeric
  for (let t = a0; t <= a1; t += 0.25) { window.renderFrame(t, c); const Wd = world(), cam = Wd.cam.position, bad = [];
    if (t > 8.5 || t < 4.5) { const gy = groundAt(cam.x, cam.z); if (cam.y - gy < 0.25) bad.push('cam low ' + (cam.y - gy).toFixed(2)); }
    const G = Wd.girl; if (G.g.visible) { G.leg.forEach((l, i) => { const gy = groundAt(l.A.x, l.A.z), d = l.A.y - gy; if (d < 0.045 || d > 0.15) bad.push('foot' + i + ' ' + d.toFixed(3)); });
      const lb = Wd.lant.body.position; if (lb.y - 0.13 < groundAt(lb.x, lb.z)) bad.push('lantern in ground'); if (G.H.position.distanceTo(cam) < 0.4) bad.push('cam in girl');
      G.arm.forEach((a, i) => { const L = a.S.distanceTo(a.W); if (L > G.pd.uArm + G.pd.fArm - 0.004) bad.push('arm' + i + ' overreach'); }); }
    const H = Wd.hand; if (H.g.visible) { H.f.forEach((s, i) => { const tp = handTip(H, i); if (tp.y < groundAt(tp.x, tp.z) - 0.02) bad.push('tip' + i + ' under'); });
      const pc = H.g.localToWorld(V3(0, 0, 0.8)); if (pc.y - 0.3 < groundAt(pc.x, pc.z)) bad.push('palm in ground'); const gp = G.g.visible ? G.T.position : null; if (gp) { [0, 1, 2, 3, 4].forEach((i) => { const tp = handTip(H, i); if (tp.distanceTo(gp) < 0.8) bad.push('finger near girl'); }); } }
    const GA = Wd.gasha; if (GA.g.visible) { GA.g.updateMatrixWorld(true); let md = 1e9; GA.g.traverse((m) => { if (!m.isInstancedMesh) return; const M4 = new THREE.Matrix4(), p = V3(0, 0, 0); for (let i = 0; i < m.count; i += 3) { m.getMatrixAt(i, M4); p.setFromMatrixPosition(M4).applyMatrix4(m.matrixWorld); md = Math.min(md, p.distanceTo(cam)); } }); if (md < 0.6) bad.push('cam near bone ' + md.toFixed(2));
      (GA.arms || []).forEach((A, ai) => A.hand.f.forEach((s, fi) => { const tp = handTip(A.hand, fi); if (tp.y < groundAt(tp.x, tp.z) - 0.3) bad.push('gasha finger under ' + ai); if (G.g.visible && tp.distanceTo(G.T.position) < 1.2) bad.push('gasha finger at girl'); if (tp.distanceTo(cam) < 1) bad.push('finger at cam'); })); const jb = GA.jaw.localToWorld(V3(0, -1.9, 1.9)); if (jb.y < groundAt(jb.x, jb.z) + 0.3) bad.push('chin in ground'); if (G.g.visible && jb.distanceTo(G.H.position) < 1.0) bad.push('jaw at girl'); }
    if (bad.length) out.push([+t.toFixed(2), bad.join('; ')]); }
  return out; }, [mode, +a0, +a1, +(step || 1)]);
console.log(JSON.stringify(res)); await browser.close();
