// =====================================================================
//  S2 — the cardioid's name and the rolling coin, the coffee cup's caustic, the comments; stage, camera, cues
// =====================================================================
// the coin: a coin of radius a rolls around a fixed coin of radius a; a point on it traces the cardioid.
// Fitted to the circle's heart: the cardioid (k=2 envelope) spans 2/3 r... we place the coins so their trace overlays it.
function beatCoin() {
  const a = win(VW('name', 'cardioid') - 0.3, B0('cup') + 0.3, 0.5); if (a <= 0) return;
  OV(() => bpText('cardioid', 540, 430, 92, BP.magenta, { italic: true, alpha: a, glow: 16 }));
  const ca = win(VL('coin').t0 - 0.1, B0('cup') + 0.3, 0.4); if (ca <= 0) return;
  // the k=2 envelope: centre of its fixed generating circle and radius from envPt (cusp at the top)
  const r = CIR.r / 3, c = [CIR.cx, CIR.cy];                             // fixed coin at the centre, radius r/3: the rolling coin's point traces envPt(θ, 2) exactly
  const ph = TAU * EZ.io(seg(TT, VL('coin').t0 + 0.2, VL('coin').t1 + 0.2));   // one full turn
  const tr = (p) => { const mc = [c[0] + Math.cos(p + A0) * 2 * r, c[1] + Math.sin(p + A0) * 2 * r]; return { mc, pt: [mc[0] + Math.cos(2 * p + A0) * r, mc[1] + Math.sin(2 * p + A0) * r] }; };
  ctx.save(); ctx.globalAlpha = ca; ctx.strokeStyle = BP.yellow; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, TAU); ctx.stroke();
  const { mc, pt } = tr(ph); ctx.beginPath(); ctx.arc(mc[0], mc[1], r, 0, TAU); ctx.stroke();
  ctx.strokeStyle = BP.magenta; ctx.lineWidth = 7; ctx.shadowColor = BP.magenta; ctx.shadowBlur = 16; ctx.beginPath();
  for (let j = 0; j <= 240; j++) { const p = ph * j / 240, q = tr(p).pt; j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.stroke(); ctx.restore();
  bpGlow(pt[0], pt[1], 40, BP.yellow, ca * 0.8); bpDot(pt[0], pt[1], 12, '#ffffff', ca);
  caption([{ t: 'a coin rolling', c: BP.yellow }, { t: 'around an equal coin', c: BP.text, i: true }], ca, 1430, 62);
}

// the cup: seen from above; light rays reflect off the inside of the rim; their envelope (the caustic) appears
const CUP = { cx: 540, cy: 900, r: 380 };
function rayCaustic(src, a, n = 320, shown = 1) {   // src: { x, y } or { dir: [dx, dy] } (parallel light)
  ctx.save(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#ffd95a'; ctx.globalAlpha = a * 0.28; ctx.beginPath();
  for (let i = 0; i < n * shown; i++) {
    const th = TAU * (i * 0.6180339 % 1), nx = Math.cos(th), ny = Math.sin(th), P = [CUP.cx + nx * CUP.r, CUP.cy + ny * CUP.r];
    let d = src.dir ? src.dir : [P[0] - src.x, P[1] - src.y]; const L = Math.hypot(d[0], d[1]) || 1; d = [d[0] / L, d[1] / L];
    const dn = d[0] * nx + d[1] * ny; if (dn <= 0.02) continue;                       // the ray must hit the inside of the wall going outwards
    const rx = d[0] - 2 * dn * nx, ry = d[1] - 2 * dn * ny;                              // reflected
    const t = -2 * ((P[0] - CUP.cx) * rx + (P[1] - CUP.cy) * ry);                      // the chord to the other side
    ctx.moveTo(P[0], P[1]); ctx.lineTo(P[0] + rx * t, P[1] + ry * t);
  }
  ctx.stroke(); ctx.restore();
}
function beatCup() {
  const a = fadeIn(B0('cup') + 0.1, 0.6); if (a <= 0) return;
  // the coffee
  ctx.save(); ctx.globalAlpha = a; const g = ctx.createRadialGradient(CUP.cx, CUP.cy, 40, CUP.cx, CUP.cy, CUP.r);
  g.addColorStop(0, '#3b2416'); g.addColorStop(1, '#22140c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CUP.cx, CUP.cy, CUP.r, 0, TAU); ctx.fill();
  ctx.lineWidth = 26; ctx.strokeStyle = '#d8d4cc'; ctx.beginPath(); ctx.arc(CUP.cx, CUP.cy, CUP.r + 13, 0, TAU); ctx.stroke(); ctx.restore();
  // the light: far away (parallel rays from the left), then it moves right up to the rim
  const mv = EZ.io(seg(TT, VW('rim', 'move') - 0.1, VW('rim', 'edge') + 0.4));
  const dist = lerp(60, 1.0, mv) * CUP.r, src = mv < 0.001 ? { dir: [1, 0.12] } : { x: CUP.cx - dist, y: CUP.cy - dist * 0.12 / Math.hypot(1, 0.12) * 1 };
  ctx.save(); ctx.beginPath(); ctx.arc(CUP.cx, CUP.cy, CUP.r, 0, TAU); ctx.clip();
  const la = fadeIn(VW('cup', 'light') - 0.1, 0.5) * a;
  rayCaustic(src, la, 320, EZ.o2(seg(TT, VW('cup', 'light') - 0.1, VW('cup', 'reflection') + 0.4)));
  ctx.restore();
  // steam rising off the coffee
  for (let s = 0; s < 4; s++) { ctx.save(); ctx.globalAlpha = a * 0.22; ctx.strokeStyle = '#e8e2d8'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
    for (let j = 0; j <= 30; j++) { const v = j / 30, y = CUP.cy - CUP.r * 0.2 - v * 520 - mod(TT * 40 + s * 37, 60), x = CUP.cx - 120 + s * 80 + Math.sin(v * 7 + TT * 1.6 + s) * 26 * v; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore(); }
  // the lamp icon
  const lx = mv < 0.02 ? 70 : clamp(CUP.cx - dist, 70, CUP.cx - CUP.r), ly = CUP.cy;
  bpGlow(lx, ly, 70, BP.yellow, la * 0.8); bpDot(lx, ly, 16, BP.yellow, la);
  // the names
  OV(() => {
    const na = win(VW('cup', 'nephroid') - 0.2, VW('rim', 'move') - 0.1, 0.3) * a;
    bpText('nephroid = × 3', 540, 430, 80, BP.yellow, { font: BP.mono, weight: 700, alpha: na, glow: 14 });
    const ha = fadeIn(VW('rim', 'heart') - 0.2, 0.3) * a * fadeOut(DURATION - 0.3, 0.3);
    bpText('cardioid = × 2', 540, 430, 80, BP.magenta, { font: BP.mono, weight: 700, alpha: ha, glow: 14 });
    const fa = win(VW('cup', 'faraway') - 0.2, VW('cup', 'nephroid') - 0.55, 0.3) * a;
    bpText('a lamp far away', 540, 430, 64, BP.yellow, { italic: true, alpha: fa });
    const ra2 = win(VW('rim', 'edge') - 0.2, VW('rim', 'heart') - 0.55, 0.3) * a;
    bpText('light at the rim', 540, 430, 64, BP.yellow, { italic: true, alpha: ra2 });
  });
}
function beatCta() {
  if (TT < B0('cta')) return;
  caption([{ t: 'Look at your coffee.', c: BP.text }, { t: 'Do you see it? ↓', c: BP.mint, i: true }], fadeIn(VL('cta').t0, 0.4) * fadeOut(VL('cta').t1 - 0.2, 0.25), 1420, 60);
  const tS = VL('cta').t1 + 0.15, sa = fadeIn(tS, 0.2);
  if (sa > 0) OV(() => {
    ctx.save(); ctx.font = `700 72px ${BP.mono}`; const w1 = ctx.measureText('Bit').width, w = ctx.measureText('Bitstory').width; ctx.restore();
    const n = Math.round(8 * seg(TT, tS, tS + 0.6)), xs = 540 - w / 2;
    bpText('Bit'.slice(0, n), xs, 1482, 72, BP.mint, { font: BP.mono, weight: 700, align: 'left', alpha: sa, glow: 18 });
    if (n > 3) bpText('story'.slice(0, n - 3), xs + w1, 1482, 72, BP.magenta, { font: BP.mono, weight: 700, align: 'left', alpha: sa, glow: 18 });
    if (n < 8 || Math.floor(TT * 2.5) % 2) { ctx.save(); ctx.globalAlpha = sa; ctx.fillStyle = BP.text; ctx.font = `700 72px ${BP.mono}`; const cw = ctx.measureText('Bitstory'.slice(0, n)).width; ctx.fillRect(xs + cw + 6, 1426, 30, 64); ctx.restore(); }
  });
}

function sceneStage() {
  bpGround();
  for (let i = 0; i < 26; i++) { const R = RNG('mote', i), x = mod(R.r(0, W) + TT * R.r(-8, 8), W), y = mod(R.r(0, H) - TT * R.r(4, 14), H); bpDot(x, y, R.r(1.5, 3), BP.dim, 0.35 + 0.25 * Math.sin(TT * R.r(0.5, 1.5) + i)); }
  beatCircle(); beatCoin(); beatCup(); beatCta();
  const fl = 1 - seg(TT, HIT, HIT + 0.3);
  if (fl > 0 && fl < 1) OV(() => { ctx.save(); ctx.globalAlpha = 0.45 * fl * fl; ctx.fillStyle = BP.magenta; ctx.fillRect(-100, 0, W + 200, H); ctx.restore(); });
}
// the camera: a slow push while the lines fill, a deep push into the edge on "not a single curved line", drift
function pieceCam(era, t) {
  const tl = VW('look', 'curved') - 0.4, tb = VL('nobody').t0 + 0.2;
  const zin = EZ.io(seg(t, tl, tl + 1.2)) * (1 - EZ.io(seg(t, tb, tb + 1.2)));
  const slow = 1 + 0.08 * EZ.io(seg(t, VW('fill', 'four'), HIT)) * (1 - seg(t, HIT, HIT + 0.3)) + 0.06 * EZ.io(seg(t, B0('cup'), B0('cta')));
  const hold = (t0, t1, amt) => amt * EZ.io(seg(t, t0, t1)) * (1 - EZ.io(seg(t, t1, t1 + 0.6)));
  const holds = hold(VW('join', 'join'), VL('wrap').t0, 0.1) + hold(VL('nobody').t0 + 1.2, B0('three'), 0.08) + hold(VL('see').t0 - 0.2, B0('seven'), 0.1)
    + hold(VL('home').t0, VW('cup', 'light'), 0.07) + hold(VW('rim', 'move'), B0('cta') + 0.3, 0.06);
  const z = (slow + holds) * (1 + 2.2 * zin) * (1 + 0.01 * Math.sin(t * 0.4));
  const fx = lerp(540, CIR.cx + CIR.r * 0.62, zin), fy = lerp(900, CIR.cy - CIR.r * 0.1, zin);
  return camOf({ z, p: [fx, fy], to: [540, lerp(900, 880, zin)] });
}
window.SFX_CUES = (() => {
  const C = [], add = (id, t, pan = 0) => C.push({ id, t: +t.toFixed(3), pan });
  for (let i = 0; i < 20; i++) add('dot', VW('dots', 'dots') - 0.1 + i * 0.04, Math.cos(angOf(i, 20)) * 0.5);
  [VW('join', 'one'), VW('join', 'two', 2), VW('join', 'three')].forEach((t) => add('chord', t));
  add('wrap', VL('wrap').t0 + 0.2);
  for (let i = 0; i < 16; i++) add('tick', VL('wrap').t0 + 0.4 + i * (VL('wrap').t1 - VL('wrap').t0) / 16, (i % 3 - 1) * 0.3);
  add('fill', VW('fill', 'four'));
  add('hit', HIT);
  add('zoom', VW('look', 'curved') - 0.4);
  ['three', 'four', 'five', 'seven', 'thirteen'].forEach((w) => add('table', VW(w === 'five' ? 'four' : w === 'seven' || w === 'thirteen' ? 'seven' : w, w) + 0.35));
  add('melt', VW('melt', 'raise'));
  add('name', VW('name', 'cardioid') - 0.2);
  add('roll', VL('coin').t0 + 0.2);
  add('light', VW('cup', 'light') - 0.1); add('neph', VW('cup', 'nephroid') - 0.2);
  add('move', VW('rim', 'move') - 0.1); add('heart', VW('rim', 'heart') - 0.2);
  const tS = VL('cta').t1 + 0.1; for (let i = 0; i < 8; i++) add('key' + i, tS + (i + 0.5) * 0.6 / 8, -0.2 + i * 0.05);
  return C.sort((a, b) => a.t - b.t);
})();
