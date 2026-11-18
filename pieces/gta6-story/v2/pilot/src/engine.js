// ---- v2 engine: shot timeline -> frame. A shot = plate + its character layer under ONE camera transform (they come
// from the same photo, so the figure stays glued to its bunk/seat), screen-space lettering on top, then grain,
// vignette and a thin letterbox. Comic devices (panel split, SFX) only where the shot list marks an accent.
let acc = 0; for (const s of SHOTS) { s.t0 = acc; acc += s.dur; }
window.TIMELINE = { width: W, height: H, fps: FPS, duration: acc, frames: Math.round(acc * FPS), shots: SHOTS.map((s) => [s.id, s.t0, s.dur]) };
{ const m = location.search.match(/dia=([ABC])/); if (m) LT.dia = m[1]; }
const IMG = (n) => ASSETS[n + '.jpg'] || ASSETS[n + '.webp'] || ASSETS[n + '.png'];
const BOX = 46;                                          // letterbox bar height
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- camera ----------
function camAt(c, u, T) {
  const e = c.e === 'io' ? inOut(u) : c.e === 'out' ? outCubic(u) : u;
  const L = (a, d) => (a ? a[0] + (a[1] - a[0]) * e : d);
  const z = Math.max(1, L(c.z, 1)), F = [c.f[0] * W, c.f[1] * H];
  let ox = L(c.x, 0), oy = L(c.y, 0);
  if (c.bob) oy += Math.sin(T * Math.PI * 2 * 1.7) * c.bob;
  if (c.shake != null) { const k = clamp(1 - Math.abs(u * 3 - c.shake * 3) * 2); const st = Math.floor(T * 12); ox += (rnd(st) - 0.5) * 22 * k; oy += (rnd(st + 9) - 0.5) * 16 * k; }
  ox = clamp(ox, -(W - F[0]) * (z - 1), F[0] * (z - 1)); oy = clamp(oy, -(H - F[1]) * (z - 1), F[1] * (z - 1));
  return { z, x: F[0] - F[0] * z + ox, y: F[1] - F[1] * z + oy };
}
const toScr = (cm, px, py) => [cm.x + px * cm.z, cm.y + py * cm.z];
function drawLayers(g, S, cm) {
  g.drawImage(IMG(S.bg + '_bg'), cm.x, cm.y, W * cm.z, H * cm.z);
  for (const [x, y, rx, ry] of S.sh || []) {                       // contact shadow under feet / seat (image px)
    const [sx, sy] = toScr(cm, x, y); g.save(); g.translate(sx, sy); g.scale(1, ry / rx);
    const r = g.createRadialGradient(0, 0, 0, 0, 0, rx * cm.z); r.addColorStop(0, 'rgba(18,6,30,0.6)'); r.addColorStop(0.6, 'rgba(18,6,30,0.3)'); r.addColorStop(1, 'rgba(18,6,30,0)');
    g.globalCompositeOperation = 'multiply'; g.fillStyle = r; g.beginPath(); g.arc(0, 0, rx * cm.z, 0, Math.PI * 2); g.fill(); g.restore();
  }
  if (S.ch) g.drawImage(IMG(S.bg + '_ch'), cm.x, cm.y, W * cm.z, H * cm.z);
}
// ---------- panel-split accent (S0-03) ----------
const PCACHE = {};
function composed(n) {
  if (PCACHE[n]) return PCACHE[n];
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.drawImage(IMG(n + '_bg'), 0, 0, W, H); const ch = IMG(n + '_ch'); if (ch) g.drawImage(ch, 0, 0, W, H);
  return (PCACHE[n] = c);
}
function drawPanels(g, S, t) {
  g.fillStyle = LT.INK; g.fillRect(0, 0, W, H);
  const n = S.panels.length, sk = 70, gut = 16, foc = [[0.64, 0.42], [0.45, 0.6], [0.72, 0.42]];
  S.panels.forEach((src, i) => {
    const x0 = (W / n) * i, x1 = (W / n) * (i + 1), u = outCubic(lin(t, 0.1 + i * 0.14, 0.5 + i * 0.14));
    const dy = (1 - u) * (i % 2 ? -H : H), out = inCubic(lin(t, S.dur - 0.35, S.dur)) * (i % 2 ? H : -H);
    g.save(); g.translate(0, dy + out);
    const p = new Path2D(); p.moveTo(x0 + sk + gut / 2, 0); p.lineTo(x1 + sk - gut / 2, 0); p.lineTo(x1 - sk - gut / 2, H); p.lineTo(x0 - sk + gut / 2, H); p.closePath();
    g.clip(p);
    const z = 1.0 + 0.06 * lin(t, 0, S.dur), F = foc[i], iw = W * z, ih = H * z, cx = (x0 + x1) / 2;   // full height, focus centred in the panel
    g.drawImage(composed(src), cx - F[0] * iw, (H - ih) * F[1] * 2 * 0.5, iw, ih);
    g.restore();
    g.save(); g.translate(0, dy + out); g.strokeStyle = 'rgba(255,240,250,0.85)'; g.lineWidth = 3; g.stroke(p); g.restore();
  });
}
// ---------- effects ----------
let GRAIN = null;
function grain(i) {
  if (!GRAIN) { GRAIN = [0, 1, 2].map((k) => { const c = document.createElement('canvas'); c.width = 480; c.height = 270; const g = c.getContext('2d'); const id = g.createImageData(480, 270);
    for (let j = 0; j < id.data.length; j += 4) { const v = 128 + (rnd(j * 0.37 + k * 999) - 0.5) * 70; id.data[j] = id.data[j + 1] = id.data[j + 2] = v; id.data[j + 3] = 255; }
    g.putImageData(id, 0, 0); return c; }); }
  return GRAIN[i % 3];
}
function fxPost(g, S, t, T, cm) {
  const fx = S.fx || [], st = Math.floor(T * 12);
  if (fx.includes('clouds')) { g.save(); g.globalCompositeOperation = 'screen'; const r = g.createRadialGradient(W * 0.12 + t * 20, H * 0.2, 10, W * 0.12, H * 0.2, W * 0.5); r.addColorStop(0, 'rgba(255,230,170,0.35)'); r.addColorStop(1, 'rgba(255,200,170,0)'); g.fillStyle = r; g.fillRect(0, 0, W, H); g.restore(); }
  if (fx.includes('police')) {
    const red = st % 4 < 2; g.save(); g.globalCompositeOperation = 'screen';
    const r = g.createRadialGradient(W * 0.86, H * 0.32, 20, W * 0.86, H * 0.32, W * 0.75);
    r.addColorStop(0, red ? 'rgba(255,40,80,0.55)' : 'rgba(40,120,255,0.55)'); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, W, H); g.restore();
  }
  if (fx.includes('night')) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(70,58,140,0.62)'; g.fillRect(0, 0, W, H); g.restore(); }
  if (fx.includes('searchlight')) {
    const o = toScr(cm, 0.726 * W, 0.235 * H), a = -2.05 + Math.sin(t * 0.9) * 0.55, len = W * 1.6, sp = 0.09;
    g.save(); g.globalCompositeOperation = 'screen';
    const gr = g.createRadialGradient(o[0], o[1], 5, o[0], o[1], len); gr.addColorStop(0, 'rgba(255,250,220,0.75)'); gr.addColorStop(1, 'rgba(255,250,220,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(o[0], o[1]); g.lineTo(o[0] + Math.cos(a - sp) * len, o[1] - Math.sin(a - sp) * -len); g.lineTo(o[0] + Math.cos(a + sp) * len, o[1] - Math.sin(a + sp) * -len); g.closePath(); g.fill();
    const hl = g.createRadialGradient(o[0], o[1], 2, o[0], o[1], 40); hl.addColorStop(0, 'rgba(255,255,240,1)'); hl.addColorStop(1, 'rgba(255,255,240,0)'); g.fillStyle = hl; g.fillRect(o[0] - 40, o[1] - 40, 80, 80);
    g.restore();
  }
  if (fx.includes('flicker')) { const on = (st % 17 === 3 || st % 23 === 9) ? 0.26 : 0;   /* diegetic strip-light flicker, rare and soft */ if (on) { g.fillStyle = `rgba(10,6,24,${on})`; g.fillRect(0, 0, W, H); } }
  if (fx.includes('flicker2')) { const on = (st % 19 === 4) ? 0.22 : 0; if (on) { g.fillStyle = `rgba(10,6,24,${on})`; g.fillRect(0, 0, W, H); } }
  if (fx.includes('barshadow')) {
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(60,30,90,0.55)';
    for (let i = -2; i < 9; i++) { const x = toScr(cm, i * 260 + 120, 0)[0]; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 70 * cm.z, 0); g.lineTo(x + 70 * cm.z - 120, H); g.lineTo(x - 120, H); g.closePath(); g.fill(); }
    g.restore();
  }
}
function finish(g, T) {
  g.save(); const v = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(20,6,30,0)'); v.addColorStop(1, 'rgba(20,6,30,0.5)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'soft-light'; g.globalAlpha = 0.22; g.drawImage(grain(Math.floor(T * 12)), 0, 0, W, H); g.restore();
  g.fillStyle = '#05030A'; g.fillRect(0, 0, W, BOX); g.fillRect(0, H - BOX, W, BOX);
}
function drawText(g, S, t) {
  for (const it of S.text || []) {
    const at = it.at != null ? it.at : 0.25, to = it.to != null ? it.to : S.dur - 0.08, a = ltIn(t, at, to);
    if (it.k === 'cap') drawCap(g, it.text, a);
    else if (it.k === 'sfx') drawSfx(g, it, ltIn(t, at, to, 0.17));
    else if (it.k === 'bubble') drawBubble(g, it, a);
    else drawSub(g, { who: it.who, text: it.text, kind: it.k === 'sub' ? 'sub' : it.k }, a);
  }
}
function frame(g, T) {
  const S = SHOTS.find((s) => T >= s.t0 && T < s.t0 + s.dur) || SHOTS[SHOTS.length - 1], t = T - S.t0, u = clamp(t / S.dur);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  let cm = { z: 1, x: 0, y: 0 };
  if (S.panels) drawPanels(g, S, t);
  else { cm = camAt(S.cam, u, T); drawLayers(g, S, cm); fxPost(g, S, t, T, cm); }
  if ((S.fx || []).includes('title')) drawTitle(g, W * 0.5, H * 0.47, 210, lin(t, 0.35, 0.75) * (1 - lin(t, S.dur - 0.3, S.dur)));
  finish(g, T);
  drawText(g, S, t);
  if (S.tr === 'flash') { const a = 1 - lin(t, 0, 0.25); if (a > 0) { g.fillStyle = `rgba(255,250,245,${a})`; g.fillRect(0, 0, W, H); } }
  if (S.tr === 'dipin') { const a = 1 - lin(t, 0, 0.42); if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(0, 0, W, H); } }
  if (S.out === 'dip') { const a = lin(t, S.dur - 0.42, S.dur); if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(0, 0, W, H); } }
  if (S.out === 'fade') { const a = lin(t, S.dur - 0.85, S.dur); if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(0, 0, W, H); } }
}
