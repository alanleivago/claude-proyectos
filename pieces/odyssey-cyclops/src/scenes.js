// =====================================================================
//  SCENES — The Cyclops (amphora-bf, Flow layers, 16:9). The ground and its friezes (assets/bg.jpg) are fixed on screen;
//  the picture (y 90–922) slides right panel to panel. Each panel is clipped to its own rectangle, so every layer stays
//  inside its panel. Nothing pops in: things walk in, rise, fall, or crossfade. Every figure carries a baked 5px orange ring.
// =====================================================================
const PIC0 = 90, PIC1 = 922, FLOOR = 850, SEA = 702;
const since = (id) => TT - SUB(id);
const pu = (id) => clamp((TT - SUB(id)) / (SUBEND(id) - SUB(id)));
const at = (t, d = 0.6) => EZ.io(clamp((TT - t) / d));
const LT = (id) => VL(id).t0, LE = (id) => VL(id).t1;
const breath = (x) => 1 + 0.008 * Math.sin(TT * 1.7 + x * 0.013);
const nat = (n) => { const im = asset(n + '.webp'); return im ? [im.naturalWidth, im.naturalHeight] : [100, 100]; };
// a figure that breathes and sways a little (feet at x, y; height h)
function fig(n, x, y, h, o = {}) {
  if ((o.a ?? 1) <= 0) return;
  bfLay(n + '.webp', x, y, h, { ...o, sy: (o.sy ?? 1) * (o.still ? 1 : breath(x)), rot: (o.rot ?? 0) + (o.still ? 0 : 0.005 * Math.sin(TT * 1.2 + x * 0.01)) });
}
// a native pixel of a layer drawn with fig/bfLay -> panel coordinates
function pt(n, x, y, h, px, py, o = {}) {
  const [nw, nh] = nat(n), s = h / nh, w = nw * s; let lx = -w / 2 + px * s; const ly = -h + py * s; if (o.flip) lx = -lx;
  const r = o.rot || 0, c = Math.cos(r), sn = Math.sin(r); return [x + lx * c - ly * sn, y + lx * sn + ly * c];
}
// a pose change: a crossfade (A out, B in) over d seconds from t; each side gets its own alpha
function xf(t, d, A, B) { const k = EZ.io(clamp((TT - t) / d)); if (k < 1) A(Math.min(1, 2 * (1 - k))); if (k > 0) B(Math.min(1, 2 * k)); }
// walking from x0 to x1: position, a step bob and a rock while moving
function walk(x0, x1, t0, d, rate = 6.5, bob = 12) { const u = EZ.io(clamp((TT - t0) / d)), mv = TT > t0 && TT < t0 + d ? Math.sin(Math.PI * clamp((TT - t0) / d)) : 0; return { x: lerp(x0, x1, u), dy: -Math.abs(Math.sin(TT * rate)) * bob * mv, rot: 0.025 * Math.sin(TT * rate) * mv, mv }; }
function glow(x, y, r, c, a, op = 'source-over') { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = op; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c.replace('A', a)); g.addColorStop(1, c.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
// the camera inside a panel: zoom z about the point (fx, fy), plus a shake
function cam(fx, fy, z, sh = 0, key = 0) { const sx = sh ? sh * Math.sin(TT * 61 + key) : 0, sy = sh ? sh * Math.cos(TT * 53 + key * 2) : 0; ctx.translate(fx + sx, fy + sy); ctx.scale(z, z); ctx.translate(-fx, -fy); }
const shake = (t, amp, d = 0.8) => (TT > t && TT < t + d ? amp * (1 - (TT - t) / d) ** 2 : 0);
// a flat colour over the whole picture (red flash, firelight, darkness on figures)
function tint(c, a, op = 'source-over') { if (a <= 0) return; if (FGX) { const j = ctx, f = FGX; f.setTransform(j.getTransform()); ctx = f; FGX = null; try { tint(c, a * (op === 'lighter' ? 0.5 : 1), 'source-atop'); } finally { ctx = j; FGX = f; } return; } ctx.save(); ctx.globalCompositeOperation = op; ctx.globalAlpha = clamp(a); ctx.fillStyle = c; ctx.fillRect(-400, PIC0 - 200, W + 800, PIC1 - PIC0 + 400); ctx.restore(); }

// ---- the cave set (stretched to the picture, as on the board), its darkness and the fire
const FIRE = [985, 842];
function cave(dark = 0, fire = 1) {
  const im = asset('cave.webp'); if (im) ctx.drawImage(im, 0, PIC0, W, PIC1 - PIC0);
  flames(fire);
  tint('#0d0605', dark);
  if (fire > 0) { const fl = 0.85 + 0.1 * Math.sin(TT * 9.1) + 0.06 * Math.sin(TT * 23.7); glow(FIRE[0], FIRE[1] - 70, 360 * fl, 'rgba(255,150,70,A)', 0.2 * fire * fl * (0.6 + dark), 'lighter'); }
}
// code flames over the painted fire: black tongues with an incised orange edge, swaying; embers rising
function flames(k = 1, big = 0) {
  if (k <= 0) return;
  const [fx, fy] = FIRE;
  ctx.save(); ctx.globalAlpha *= clamp(k);
  const T = [[-34, 64, 0], [0, 104, 1.3], [30, 74, 2.4], [-12, 84, 3.1], [18, 56, 4.2]];
  for (const [dx, h0, ph] of T) {
    const h = (h0 + big * h0 * 1.6) * (0.82 + 0.18 * Math.sin(TT * 8 + ph * 2) + 0.08 * Math.sin(TT * 19 + ph)), sw = 12 * Math.sin(TT * 5 + ph), wd = 26 + big * 18;
    ctx.beginPath(); ctx.moveTo(fx + dx - wd, fy - 8); ctx.quadraticCurveTo(fx + dx - wd * 0.9, fy - h * 0.55, fx + dx + sw, fy - h);
    ctx.quadraticCurveTo(fx + dx + wd * 0.9, fy - h * 0.5, fx + dx + wd, fy - 8); ctx.closePath();
    ctx.fillStyle = BF.black; ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.6; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx + dx - wd * 0.3, fy - 14); ctx.quadraticCurveTo(fx + dx, fy - h * 0.45, fx + dx + sw * 0.6, fy - h * 0.72); ctx.stroke();
  }
  for (let i = 0; i < 9 + big * 12; i++) { const R = RNG('emb', i), ph = mod(TT * R.r(0.35, 0.7) + R.f(), 1), x = fx + R.r(-50, 50) + Math.sin(TT * 2 + i) * 14 * ph, y = fy - 60 - ph * (220 + big * 200);
    bfDot(x, y, R.r(2, 4) * (1 - ph * 0.6), `rgba(255,${180 + (i % 3) * 20},110,${(1 - ph) * 0.9})`); }
  ctx.restore();
}
// ---- the sea: a black band with thin orange swell lines that roll
function sea(y0 = SEA, o = {}) {
  const sp = o.speed ?? 30;
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.fillRect(-400, y0, W + 800, PIC1 + 300 - y0);
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.2;
  for (let r = 0; r < 6; r++) { const y = y0 + 22 + r * 42; if (y > PIC1 + 40) break; ctx.beginPath();
    for (let x = -400; x <= W + 400; x += 24) { const yy = y + 5 * Math.sin(x * 0.006 + TT * (0.9 + r * 0.15) * (sp / 30) + r * 1.7) + (o.bump ? o.bump(x, r) : 0); x === -400 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
  ctx.restore();
}
// the galley riding the swell: (x, yb) = centre and the bottom of the oars; returns where the deck is
function ship(x, yb, w, o = {}) {
  const [nw, nh] = nat('ship'), h = w * nh / nw, dy = 6 * Math.sin(TT * 1.5 + x * 0.004) + (o.dy ?? 0), rot = (o.rot ?? 0) + 0.014 * Math.sin(TT * 1.2 + x * 0.003);
  const s = { x, y: yb + dy, w, h, rot, deck: (fx) => [x + fx * w * Math.cos(rot) + 0.48 * h * Math.sin(rot), yb + dy - 0.48 * h + fx * w * Math.sin(rot) + 0.085 * w] };
  if (o.behind) o.behind(s);   // whoever stands on deck goes behind the hull, feet below the gunwale
  bfLay('ship.webp', x, yb + dy, h, { rot, flip: o.flip, a: o.a });
  return s;
}
const coast = (cx, yb, h, o = {}) => bfLay('coast.webp', cx, yb, h, o);
// a rock (code): a black boulder with an orange ring and incised cracks
function rock(x, y, r, rot = 0) {
  const R = RNG('rk'), P = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; P.push([Math.cos(a) * r * (0.96 + 0.035 * Math.sin(i * 1.7) + R.r(-0.01, 0.01)), Math.sin(a) * r * (0.96 + 0.035 * Math.sin(i * 1.3 + 1))]); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath(); P.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath();
  ctx.strokeStyle = BF.ground; ctx.lineWidth = 10; ctx.stroke(); ctx.fillStyle = BF.black; ctx.fill();
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; const C = RNG('rkc');
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + C.r(-0.3, 0.3); ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.93, Math.sin(a) * r * 0.93); ctx.lineTo(Math.cos(a + 0.12) * r * 0.72, Math.sin(a + 0.12) * r * 0.72); ctx.lineTo(Math.cos(a + 0.02) * r * 0.55, Math.sin(a + 0.02) * r * 0.55); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(-r * 0.1, -r * 0.1, r * 0.8, Math.PI * 1.05, Math.PI * 1.45); ctx.stroke();
  ctx.restore();
}
// the sailors, one layer each: every man has his own step bob, sway and tremble (feet on y)
function crew(list) {
  list.forEach((m, i) => { const ph = i * 1.9 + (m.ph ?? 0), r = m.rate ?? 5.5, b = m.bob ?? 0;
    fig(m.n, m.x + (m.tr ?? 0) * Math.sin(TT * 31 + ph * 3), m.y - Math.abs(Math.sin(TT * r + ph)) * b, m.h, { flip: m.flip, a: m.a, rot: (m.rot ?? 0) + (b ? 0.018 * Math.sin(TT * r + ph) : 0) }); });
}
// the hillside of p03: a far ridge with peaks and its cave mouth, the path the men climb, rock strata, stones and scrub
const SLOPE = (x) => 820 - 400 * x / 1920;
function mountain() {
  const R = RNG('mtn');
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // the far ridge behind the path
  const ridge = [[560, SLOPE(560)], [760, 520], [860, 548], [1010, 410], [1090, 438], [1240, 262], [1300, 300], [1440, 168], [1530, 236], [1600, 214], [1760, 330], [1880, 300], [W + 400, 380]];
  ctx.beginPath(); ctx.moveTo(ridge[0][0], ridge[0][1]); ridge.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(W + 400, PIC1 + 300); ctx.lineTo(560, PIC1 + 300); ctx.closePath();
  ctx.fillStyle = '#22120c'; ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.6; ctx.stroke();
  // ridge lines running down both flanks of each peak, parallel to the flank, a little inside it
  ctx.lineWidth = 1.8;
  for (let i = 1; i < ridge.length - 1; i++) { const [px, py] = ridge[i]; if (py > ridge[i - 1][1] || py > ridge[i + 1][1]) continue;
    for (const [qx, qy] of [ridge[i - 1], ridge[i + 1]]) { const dx = qx - px, dy = qy - py;
      for (let k = 1; k <= 3; k++) { const ins = 20 * k, f0 = 0.1 + k * 0.08, f1 = R.r(0.75, 1.3);
        ctx.beginPath(); ctx.moveTo(px + dx * f0, py + dy * f0 + ins); ctx.lineTo(px + dx * f1, py + dy * f1 + ins + R.r(-4, 4)); ctx.stroke(); } } }
  // the cave mouth near the top
  ctx.fillStyle = '#060304'; ctx.beginPath(); ctx.ellipse(1520, 300, 62, 46, 0, Math.PI, 0); ctx.lineTo(1582, 330); ctx.lineTo(1458, 330); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2.4; ctx.stroke();
  // the near slope: the path is its top edge
  ctx.fillStyle = '#100a0a'; ctx.beginPath(); ctx.moveTo(-400, 840); ctx.lineTo(0, 820); ctx.lineTo(W, 420); ctx.lineTo(W + 400, 340); ctx.lineTo(W + 400, PIC1 + 300); ctx.lineTo(-400, PIC1 + 300); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-400, 840); ctx.lineTo(0, 820); ctx.lineTo(W, 420); ctx.lineTo(W + 400, 340); ctx.stroke();
  // rock strata parallel to the path, broken, with wobble
  ctx.lineWidth = 2;
  for (let k = 0; k < 7; k++) { const off = 46 + k * 58 + k * k * 4; let x = -60 + R.r(0, 120);
    while (x < W + 40) { const len = R.r(120, 320), x2 = Math.min(W + 60, x + len);
      ctx.beginPath(); for (let xx = x; xx <= x2; xx += 20) { const yy = SLOPE(xx) + off + 5 * Math.sin(xx * 0.02 + k * 2); xx === x ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy); } ctx.stroke(); x = x2 + R.r(30, 110); } }
  // short hatch strokes under the path, slanting downhill
  ctx.lineWidth = 1.6;
  for (let x = -40; x < W + 40; x += R.r(16, 34)) { const y = SLOPE(x) + R.r(10, 22), l = R.r(10, 24); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - l * 0.35, y + l); ctx.stroke(); }
  // stones half sunk in the slope
  for (let i = 0; i < 14; i++) { const x = R.r(-40, W + 40), off = R.r(70, 420), y = SLOPE(x) + off, rx = R.r(14, 34), ry = rx * R.r(0.45, 0.7);
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, -0.2, Math.PI * 1.05, Math.PI * 2.1); ctx.stroke(); }
  // scrub on the path's edge (away from the men's feet)
  for (const bx of [140, 300, 1420, 1610, 1800]) { const by = SLOPE(bx) + 4;
    ctx.fillStyle = BF.black; ctx.beginPath(); for (let j = 0; j < 7; j++) { const a = Math.PI + j / 6 * Math.PI, rr = 26 + 10 * Math.sin(j * 2.3 + bx); ctx.lineTo(bx + Math.cos(a) * rr * 1.3, by + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.lineWidth = 2; ctx.stroke();
    for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.moveTo(bx - 18 + j * 12, by - 4); ctx.lineTo(bx - 22 + j * 14, by - 20 - (j % 2) * 8); ctx.stroke(); } }
  ctx.restore();
}
// a warm glint in an eye (the Cyclops looks)
function eyeGlint(x, y, k) { if (k <= 0) return; glow(x, y, 46, 'rgba(255,214,150,A)', 0.85 * k, 'lighter'); bfDot(x, y, 5 * k, `rgba(255,240,200,${k})`); }

// =====================================================================
//  the panels (panel coords = screen coords; the board's layout)
// =====================================================================
function p01() {   // the ship sails toward the island; a tiny shepherd walks out of his cave on the hill
  const t2 = LT('c02') - 0.4, zin = at(t2, 2.2), zout = at(LT('c03'), 2.5), z = 1 + 0.32 * zin - 0.2 * zout;
  ctx.save(); cam(1460, 470, z);
  sea(700);
  coast(1430, 712, 560);
  const w = walk(1580, 1470, LT('c01') + 2, 7, 4, 3); fig('cyclops_walk', w.x, 560 + w.dy, 150, { flip: true, a: fadeIn2(LT('c01') + 1.6, 1.2) });
  ship(lerp(280, 560, EZ.io(pu('p01'))), 760, 560);
  ctx.restore();
}
const fadeIn2 = (t, d) => EZ.io(clamp((TT - t) / d));
function p02() {   // Odysseus on the deck, shading his eyes: he wants to see them
  const z = 1 + 0.06 * EZ.io(pu('p02'));
  ctx.save(); cam(960, 470, z);
  sea(720);
  const lean = 0.03 * at(VW('c04', 'odysseus'), 1.2);
  ship(lerp(740, 840, EZ.io(pu('p02'))), 800, 790, { behind: (s) => shipOdy(s, 0.2, 'ody_look', 300, { rot: lean }) });
  ctx.restore();
}
function p03() {   // twelve men climb the dark slope with the wineskin
  const z = 1 + 0.05 * EZ.io(pu('p03'));
  ctx.save(); cam(900, 600, z);
  mountain();
  const u = EZ.io(clamp(since('p03') / (SUBEND('p03') - SUB('p03') + 0.4))), x0 = lerp(760, 1240, u);
  crew([5, 4, 3, 2, 1, 0].map((i) => { const x = x0 - i * 118; return { n: i ? 'man_walk' : 'man_skin', x, y: SLOPE(x) + 6, h: 270, rot: -0.1, bob: 7, ph: i * 0.7 }; }));
  ctx.restore();
}
function p04() {   // the cave: racks of cheese, lambs in the pens, buckets of milk; the camera looks around
  const t = TT, f1 = LT('c07'), fxs = [[f1, 380], [VW('c07', 'pens'), 1500], [VW('c07', 'buckets'), 830], [LT('c08'), 960]];
  let fx = 380; for (let i = 1; i < fxs.length; i++) fx = lerp(fx, fxs[i][1], at(fxs[i][0] - 0.2, 1.4));
  const z = 1.1 - 0.1 * at(LT('c08'), 2);
  ctx.save(); cam(fx, 640, z);
  cave(0);
  const g = (x, ph) => ({ rot: 0.03 * Math.sin(TT * 1.3 + ph), dy: 2 * Math.sin(TT * 2.1 + ph) });
  const a = g(0, 0), b = g(0, 2); fig('ram', 560 + 10 * Math.sin(TT * 0.4), 850 + a.dy, 165, { rot: a.rot });
  fig('ram', 1500, 850 + b.dy, 160, { flip: true, rot: b.rot });
  ctx.restore();
}
function p05() {   // his men beg him to grab the cheese and run; he says no
  const z = 1 + 0.05 * EZ.io(pu('p05'));
  ctx.save(); cam(1000, 640, z);
  cave(0);
  const tNo = VW('c10', 'no') - 0.1, beg = TT < tNo ? Math.sin(TT * 4.2) : 0;
  [[430, 0.5], [560, 0], [690, 1.1], [810, 0.3]].forEach(([x, ph], i) => { const b = TT < tNo ? Math.sin(TT * 4.2 + ph * 2) : 0;
    xf(tNo + i * 0.12, 0.6, (a) => fig(i === 1 ? 'man_skin' : 'man_beg', x + 14 * b, 850, 266, { a, rot: 0.03 * b }), (a) => fig('man_fear', x - 10, 850, 262, { a, flip: i % 2 === 1 })); });
  fig('ody_look', 1200, 850, 380, { flip: true, rot: -0.02 * at(tNo, 0.5) });
  ctx.restore();
}
function p06() {   // at evening the owner comes home: his flock first, then the giant
  const z = 1 + 0.08 * at(LT('c12'), 3);
  ctx.save(); cam(1380, 420, z);
  cave(0.1 * EZ.io(pu('p06')));
  [[600, 0], [820, 0.6]].forEach(([x1, d], i) => { const w = walk(2150 + i * 200, x1, SUB('p06') + 0.2 + d, 4.2, 7, 6); fig('ram', w.x, 850 + w.dy, 150, { flip: true, rot: w.rot }); });
  const w = walk(2300, 1370, VW('c11', 'owner') - 0.4, 3.6, 4.2, 10);
  fig('cyclops_walk', w.x, 850 + w.dy, 720, { flip: true, rot: w.rot });
  ctx.restore();
}
function p07() {   // he picks up the stone and closes the door: the cave goes dark
  const tUp = VW('c13', 'picked') - 0.15, tClose = VW('c13', 'closed') - 0.1, tOut = tClose + 0.2;
  const dark = 0.12 + 0.48 * at(tClose + 0.6, 1.6);
  const sh = shake(tClose + 1.6, 7, 0.9);
  ctx.save(); cam(1300, 500, 1.02 + 0.04 * EZ.io(pu('p07')), sh, 7);
  cave(dark, 1);
  // the last of the flock trots in, then the giant turns, lifts the stone and carries it to the door
  const r = walk(1500, 640, SUB('p07') + 0.1, 3.4, 7, 6); fig('ram', r.x, 850 + r.dy, 150, { flip: true, rot: r.rot, a: 1 - at(tClose, 1.2) });
  const wo = walk(1520, 2200, tOut, 2.2, 3.6, 8);
  xf(tUp, 0.7, (a) => fig('cyclops_walk', 1370 + 150 * at(SUB('p07') + 0.3, 2), 850, 720, { flip: TT < tUp - 1.6, a }),
    (a) => fig('cyclops_lift', wo.x, 850 + wo.dy - 10 * at(tUp, 0.6), 720, { a, rot: wo.rot }));
  ctx.restore();
}
function p08() {   // he lights a fire, and he sees them
  const tLit = VW('c14', 'lit') - 0.1, tSaw = VW('c14', 'saw') - 0.05;
  const fireK = at(tLit, 0.8), dark = 0.6 - 0.25 * fireK;
  ctx.save(); cam(1100, 560, 1 + 0.05 * at(tSaw, 1.5));
  cave(dark, fireK);
  if (fireK > 0) glow(FIRE[0], FIRE[1] - 90, 520, 'rgba(255,170,90,A)', 0.18 * fireK * (1 - at(tLit + 0.6, 1.2)), 'lighter');
  fig('cyclops_sit', 1350, 850, 640, { a: 0.35 + 0.65 * fireK });
  const tr = TT > tSaw ? 3 * Math.sin(TT * 37) * (1 - at(tSaw + 0.6, 1.5)) : 0;
  crew([[400, 0], [470, 1], [545, 0], [620, 1]].map(([x, f]) => ({ n: f ? 'man_fear' : 'man_walk', x: x + tr, y: 850, h: 190, flip: !!f, tr: TT > tSaw ? 1.5 : 0 })));
  const e = pt('cyclops_sit', 1350, 850, 640, 352, 140);
  eyeGlint(e[0], e[1], TT > tSaw ? Math.sin(Math.PI * clamp((TT - tSaw) / 1.4)) : 0);
  ctx.restore();
}
function p09() {   // Odysseus steps forward and asks for hospitality
  const z = 1 + 0.06 * EZ.io(pu('p09'));
  ctx.save(); cam(1050, 560, z);
  cave(0.15);
  fig('cyclops_sit', 1350, 850, 640);
  const w = walk(520, 760, VW('c15', 'stepped') - 0.2, 1.8, 6, 8);
  const talk = TT > LT('c16') && TT < LE('c16') ? 0.012 * Math.sin(TT * 7) : 0;
  fig('ody_look', w.x, 850 + w.dy, 380, { rot: w.rot + talk });
  ctx.restore();
}
function p10() {   // the Cyclops laughs at him
  const tL = VW('c17', 'laughed') - 0.2, z = 1 + 0.05 * EZ.io(pu('p10'));
  ctx.save(); cam(1150, 520, z);
  cave(0.15);
  const lg = TT > tL ? Math.sin(TT * 11) * (1 - at(tL + 2.5, 1.5)) : 0;
  xf(tL, 0.6, (a) => fig('cyclops_sit', 1350, 850, 640, { a }), (a) => fig('cyclops_laugh', 1400, 850 + Math.abs(lg) * 6, 640, { flip: true, a, rot: 0.012 * lg }));
  const back = at(VW('c17', 'stronger') - 0.2, 0.8);
  fig('ody_look', 760 - 50 * back, 850, 380, { rot: -0.03 * back });
  ctx.restore();
}
function p11() {   // he grabs two of the men (no gore: a red flash over the picture, two men gone)
  const tG = VW('c18', 'grabbed') - 0.1, tS = VW('c18', 'smashed') - 0.05, tA = VW('c18', 'ate') - 0.05;
  const lean = at(tG - 0.2, 0.4) * (1 - at(tG + 0.5, 0.8));
  ctx.save(); cam(1000, 600, 1 + 0.05 * EZ.io(pu('p11')));
  cave(0.15);
  fig('cyclops_sit', 1350 - 40 * lean, 850, 640, { rot: -0.05 * lean });
  // the men huddle; the two nearest the giant are gone after the flash
  const gone = at(tG + 0.05, 0.25);
  crew([[360, 'man_fear', 1], [430, 'man_fear', 0], [500, 'man_walk', 1], [570, 'man_fear', 0], [650, 'man_beg', 0], [720, 'man_fear', 0]].map(([x, n, f], i) => ({ n, x, y: 850, h: 190, flip: !!f, tr: 2.5, a: i >= 4 ? 1 - gone : 1 })));
  ctx.restore();
  const fl = (t, a) => (TT > t ? a * Math.exp(-(TT - t) * 2.2) : 0);
  tint('#b0281a', Math.min(0.62, 0.45 * at(tG - 0.1, 0.15) * (1 - at(LE('c18') + 0.3, 1.5)) + fl(tG, 0.25) + fl(tS, 0.18) + fl(tA, 0.15)), 'multiply');
  tint('#ff5a2a', fl(tG, 0.22) + fl(tS, 0.12));
}
function p12() {   // he washes them down with milk and lies down among his sheep
  const tL = VW('c19', 'lay') - 0.2;
  ctx.save(); cam(1100, 620, 1 + 0.06 * EZ.io(pu('p12')));
  cave(0.4 * at(tL, 2.5), 1 - 0.4 * at(tL, 2.5));
  const sl = 1 + 0.012 * Math.sin(TT * 1.4);
  xf(tL, 0.9, (a) => fig('cyclops_sit', 1350, 850, 640, { a, rot: -0.03 * Math.sin(Math.PI * clamp((TT - LT('c19')) / 1.4)) }), (a) => fig('cyclops_sleep', 1052, 815, 340, { a, sy: sl, still: true }));
  const w = walk(2150, 1600, VW('c19', 'sheep') - 1.2, 2.6, 7, 5); fig('ram', w.x, 850 + w.dy, 150, { flip: true, rot: w.rot });
  ctx.restore();
}
function p13() {   // he draws his sword over the sleeping giant, and does not strike
  const tD = VW('c20', 'drew') - 0.15, tW = VW('c22', 'waited') - 0.4, tK = VW('c20', 'killed') - 0.2;
  ctx.save(); cam(900, 600, 1.02 + 0.07 * at(tK, 3) - 0.05 * at(tW, 2));
  cave(0.42, 0.6);
  fig('cyclops_sleep', 1152, 815, 340, { sy: 1 + 0.012 * Math.sin(TT * 1.4), still: true });
  const w = walk(300, 600, SUB('p13') + 0.1, 1.8, 6, 8), st = 40 * at(tK, 0.8) * (1 - at(LT('c21'), 1.2));
  xf(tD, 0.5, (a) => fig('ody_look', w.x, 850 + w.dy, 400, { a, rot: w.rot }),
    (a) => xf(tW, 0.8, (b) => fig('ody_sword', w.x + 10 + st, 850, 400, { a: a * b, rot: 0.02 * at(tK, 0.6) }), (b) => fig('ody_look', w.x - 20, 850, 400, { a: a * b, flip: true })));
  ctx.restore();
}
function p14() {   // morning: he eats two more, takes the flock out and rolls the stone back behind him
  const tO = VW('c23', 'took') - 0.3, tR = VW('c23', 'rolled') - 0.1, tB = VW('c23', 'breakfast') - 0.1;
  ctx.save(); cam(1300, 560, 1 + 0.05 * EZ.io(pu('p14')), shake(tR + 1.6, 5, 0.8), 14);
  cave(0.5 * at(tR + 0.4, 1.8), 0.7);
  const r = walk(1150, 2200, tO, 4.5, 7, 6); fig('ram', r.x, 850 + r.dy, 150, { rot: r.rot });
  const w = walk(1490, 2350, tO + 1.2, 5, 4.2, 10); fig('cyclops_walk', w.x, 850 + w.dy, 720, { rot: w.rot });
  ctx.restore();
  tint('#b0281a', 0.3 * Math.sin(Math.PI * clamp((TT - tB) / 1.2)), 'multiply');
}
function p15() {   // the olive-wood club: he cuts it, sharpens it, hardens the point in the fire, hides it
  const tS = VW('c25', 'sharpened') - 0.1, tH = VW('c25', 'hardened') - 0.1, tHide = VW('c25', 'hid') - 0.2;
  ctx.save(); cam(950, 700, 1.04 + 0.08 * at(tS, 3) - 0.08 * at(tHide, 1.5));
  cave(0.32, 1);
  const work = TT > LT('c25') && TT < tHide ? Math.sin(TT * 6.5) : 0;
  const o = { rot: 0.025 * work };
  xf(tHide, 0.8, (a) => { fig('ody_sharpen', 900, 850, 300, { ...o, a, still: true }); const tp = pt('ody_sharpen', 900, 850, 300, 1081, 333, o);
      const hot = at(tH, 1.0) * (1 - at(tHide, 0.6)); glow(tp[0], tp[1], 60, 'rgba(255,200,120,A)', 0.9 * hot, 'lighter'); bfDot(tp[0], tp[1], 6 * hot, `rgba(255,236,190,${hot})`); },
    (a) => fig('ody_look', 760, 850, 400, { a }));
  if (TT > tH && TT < tHide) flames(1, 0.5 * Math.sin(Math.PI * clamp((TT - tH) / (tHide - tH))));
  ctx.restore();
}
function p16() {   // he comes home and eats two more; Odysseus walks up with a bowl of the dark wine
  const tW = VW('c26', 'walked') - 0.3, tHere = LT('c27'), tD = LT('c28');
  ctx.save(); cam(1000, 560, 1 + 0.06 * EZ.io(pu('p16')));
  cave(0.15);
  const c = walk(2300, 1380, SUB('p16') + 0.2, 3.2, 4.2, 10), tSit = SUB('p16') + 3.2;
  xf(tSit, 0.9, (a) => fig('cyclops_walk', c.x, 850 + c.dy, 720, { flip: true, rot: c.rot, a }), (a) => fig('cyclops_sit', 1380, 850, 600, { a, rot: -0.04 * Math.sin(Math.PI * clamp((TT - VW('c28', 'loved')) / 1.2)) }));
  const r = walk(-200, 540, SUB('p16') + 1, 3.6, 7, 5); fig('ram', r.x, 850 + r.dy, 170, { rot: r.rot });
  const o = walk(-150, 770, tW, 3.4, 6, 8);
  const step = (t) => (TT > t ? 30 * Math.sin(Math.PI * clamp((TT - t) / 1.0)) : 0);
  fig('ody_offer', o.x + step(VW('c28', 'another')) + step(VW('c28', 'third')), 850 + o.dy - 6 * at(tHere, 0.5), 400, { rot: o.rot });
  ctx.restore();
  tint('#b0281a', 0.28 * Math.sin(Math.PI * clamp((TT - VW('c26', 'ate') + 0.1) / 1.2)), 'multiply');
}
function p17() {   // "My name is Nobody." NOBODY is lettered in the orange; "I'll eat you last."
  const tN = VW('c30', 'nobody') - 0.05, tL = VW('c31', 'last') - 0.3, tK = VW('c29', 'kindly') - 0.2;
  const lean = 0.5 * at(tK, 1.2) + 0.5 * at(tL - 1.2, 1.2);
  ctx.save(); cam(lerp(900, 1250, at(tL - 1.5, 2)), 420, 1 + 0.06 * EZ.io(pu('p17')) + 0.05 * at(tL - 1.5, 2));
  cave(0.15);
  fig('cyclops_sit', 1300 - 30 * lean, 860, 760, { rot: -0.04 * lean });
  fig('ody_offer', 600, 850, 470);
  // NOBODY, written letter by letter in the orange area on the word
  if (TT > tN) {
    ctx.save(); ctx.font = `bold 96px ${CAP_FONT}`; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '6px';
    const str = 'NOBODY', tw = ctx.measureText(str).width; let x = 740 - tw / 2; const y = 372;
    for (let i = 0; i < str.length; i++) { const ch = str[i], cw = ctx.measureText(ch).width + 6, k = EZ.o2(clamp((TT - tN - i * 0.07) / 0.18));
      if (k > 0) { ctx.globalAlpha = k; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.strokeStyle = BF.ground; ctx.strokeText(ch, x, y + (1 - k) * 8); ctx.fillStyle = BF.black; ctx.fillText(ch, x, y + (1 - k) * 8); }
      x += cw; }
    ctx.restore();
  }
  ctx.restore();
}
function p18() {   // he falls over backwards, drunk, and snores
  const tF = VW('c32', 'fell') - 0.1, tSn = VW('c32', 'snoring') - 0.2;
  const tip = at(tF, 0.45);
  ctx.save(); cam(1100, 620, 1.02 + 0.05 * at(tSn, 2.5));
  cave(0.3, 0.8);
  const snore = 1 + (TT > tSn ? 0.022 : 0.01) * Math.sin(TT * 1.6);
  xf(tF + 0.3, 0.5, (a) => fig('cyclops_sit', 1350 + 40 * tip, 850, 640, { a, rot: 0.22 * tip }), (a) => fig('cyclops_sleep', 1100, 812, 372, { a, sy: snore, still: true, rot: 0.01 * Math.sin(TT * 0.9) }));
  ctx.restore();
}
// the climax geometry: the men drive the stake tip exactly into the eye on HIT
const P19 = { sH: 372, mH: 440, mFoot: 848, lift: 22, rot: -0.04 };
function stakeTip(xc, dy, rot) { return pt('men_stake', xc, P19.mFoot + dy, P19.mH, 1326, 255, { rot }); }
function p19() {   // the stake in the coals until it glows; four men and Odysseus drive it into the eye
  const tC = LT('c33'), tGlow = VW('c33', 'glowed') - 0.2, tLift = VW('c34', 'lifted') - 0.2, tScr = VW('c36', 'screamed') - 0.1;
  // where the eye must be: the stake's tip at the strike pose
  const [mw, mh] = nat('men_stake'), mW = P19.mH * mw / mh, xHit = 1044 - (1326 / mw - 0.5) * mW;
  const hitTip = stakeTip(xHit, -P19.lift, P19.rot), [sw, sh] = nat('cyclops_sleep'), sW = P19.sH * sw / sh;
  const cyX = hitTip[0] - (218 / sw - 0.5) * sW, cyY = hitTip[1] + (sh - 90) / sh * P19.sH;
  // the men: hold the tip in the fire, lift, back up, charge, twist, then fall back when he rears up
  const prep = at(tLift, 0.6), back = at(tLift + 0.3, 0.9), drive = EZ.i2(clamp((TT - (HIT - 0.42)) / 0.42));
  const retreat = at(tScr + 0.2, 1.2);
  let xc = xHit - 60 - 90 * back + 150 * drive * back, dy = -P19.lift * prep, rot = lerp(0.03, P19.rot, prep);
  if (TT >= HIT) { xc = xHit; dy = -P19.lift; rot = P19.rot + 0.012 * Math.sin((TT - HIT) * 14) * (1 - retreat); }
  xc -= 260 * retreat; dy += 0 * retreat; rot = lerp(rot, 0.02, retreat);
  const shk = shake(HIT, 14, 1.1) + shake(tScr, 9, 1.2);
  ctx.save(); cam(lerp(800, 1000, at(tLift, 2)), 560, 1.02 + 0.06 * at(tLift, 3) + 0.05 * at(HIT - 0.3, 0.4) - 0.07 * at(tScr, 1.5), shk, 19);
  cave(0.3, 1);
  flames(1, 0.9 * Math.sin(Math.PI * clamp((TT - tC) / (tLift - tC + 0.6))));
  // the giant: asleep, then rearing up blind, hands over his face
  xf(tScr, 0.7, (a) => fig('cyclops_sleep', cyX, cyY, P19.sH, { a, still: true, sy: TT < HIT ? 1 + 0.02 * Math.sin(TT * 1.6) : 1, rot: TT > HIT ? 0.012 * Math.sin(TT * 23) * (1 - at(HIT + 1.5, 1)) : 0 }),
    (a) => fig('cyclops_blind', 1380, 850, 720, { a, rot: 0.02 * Math.sin(TT * 9) }));
  fig('men_stake', xc, P19.mFoot + dy, P19.mH, { rot, still: true });
  // the tip glows; on the hit, a flash at the eye, then steam while they twist
  const tip = stakeTip(xc, dy, rot), hot = at(tC + 0.5, 2) * (1 - at(tScr, 1));
  glow(tip[0], tip[1], 70, 'rgba(255,190,110,A)', 0.85 * hot, 'lighter'); bfDot(tip[0], tip[1], 7 * hot, `rgba(255,240,200,${hot})`);
  if (TT > HIT && TT < tScr + 0.5) for (let i = 0; i < 10; i++) { const R = RNG('st', i), ph = mod((TT - HIT) * R.r(0.5, 0.9) + R.f(), 1); bfDot(tip[0] + R.r(-20, 30) + ph * 30, tip[1] - 10 - ph * 140, R.r(4, 9) * (1 - ph), `rgba(240,222,190,${0.6 * (1 - ph)})`); }
  ctx.restore();
  tint('#2a1206', 0.35, 'multiply');
  if (TT > HIT && TT < HIT + 0.5) { tint('#fff0d0', 0.6 * (1 - (TT - HIT) / 0.5)); }
  if (TT > HIT && TT < HIT + 1.4) tint('#b0281a', 0.35 * (1 - (TT - HIT) / 1.4), 'multiply');
}
function p20() {   // outside: the neighbours come running and shout through the stone
  const tR = SUB('p20') + 0.3, tN = VW('c38', 'nobody') - 0.1, tHome = VW('c39', 'home') - 0.6;
  ctx.save(); cam(960, 560, 1 + 0.05 * EZ.io(pu('p20')));
  const sh = TT > tN && TT < tN + 1.6 ? 5 * Math.sin(TT * 47) * (1 - (TT - tN) / 1.6) : 0;
  rock(960 + sh, 730, 335, 0.0);
  const lean = 0.04 * at(LT('c37') + 2.5, 1) * (1 - at(tHome - 1, 1));
  const L = walk(-300, 370, tR, 3.4, 6.5, 12), Lo = walk(370, -350, tHome + 0.4, 3.4, 6.5, 12);
  const R = walk(2220, 1550, tR + 0.3, 3.4, 6.5, 12), Ro = walk(1550, 2270, tHome + 0.4, 3.4, 6.5, 12);
  xf(tHome, 0.6, (a) => fig('cyclops_walk', L.x, 850 + L.dy, 600, { rot: L.rot + lean, a }), (a) => fig('cyclops_walk', Lo.x, 850 + Lo.dy, 600, { flip: true, rot: Lo.rot, a }));
  xf(tHome, 0.6, (a) => fig('cyclops_walk', R.x, 850 + R.dy, 600, { flip: true, rot: R.rot - lean, a }), (a) => fig('cyclops_walk', Ro.x, 850 + Ro.dy, 600, { rot: Ro.rot, a }));
  ctx.restore();
}
// the flock walks out under the blind giant's hands, one at a time (from between his hands to the right edge)
function flock(list, v = 130) {
  for (const [n, t0, h] of list) { const x = 830 + (TT - t0) * v; if (TT < t0 || x > 2300) continue;
    const a = clamp((TT - t0) / 0.6), b = Math.abs(Math.sin(TT * 6 + t0)) * 5; fig(n, x, 850 - b, h, { a, rot: 0.02 * Math.sin(TT * 6 + t0) }); }
}
const handsDy = () => 10 * Math.sin(TT * 1.3);
function p21() {   // morning: the blind giant sits in the doorway, feeling every sheep that goes past
  const t0 = SUB('p21');
  ctx.save(); cam(900, 600, 1 + 0.05 * EZ.io(pu('p21')));
  cave(0.1);
  fig('cyclops_feel', 520, 850 + handsDy() * 0.3, 600, { rot: 0.012 * Math.sin(TT * 1.3) });
  flock([['ram', t0 - 5.5, 200], ['ram', t0 - 1, 200], ['ram', t0 + 3.5, 210], ['ram', t0 + 8, 200]]);
  ctx.restore();
}
function p21b() {   // Odysseus hangs under the biggest ram; the hands pass right over his back
  const t0 = SUB('p21b'), tP = VW('c42', 'passed') - 0.2, tBig = tP - 2.2;
  ctx.save(); cam(860, 640, 1.14 + 0.04 * EZ.io(pu('p21b')));
  cave(0.1);
  const press = Math.sin(Math.PI * clamp((TT - tP + 0.8) / 2.2));
  fig('cyclops_feel', 520, 850 + handsDy() * 0.3 + 14 * press, 600, { rot: 0.012 * Math.sin(TT * 1.3) + 0.02 * press });
  flock([['ram_man', t0 - 4, 220], ['ram_man', t0 + 0.6, 220], ['ram', t0 + 5, 200], ['ram_man', tBig, 245], ['ram', tBig + 4.6, 200]], 110);
  ctx.restore();
}
function p22() {   // they run for the ships, and they get away
  const u = EZ.io(pu('p22'));
  ctx.save(); cam(960, 520, 1 + 0.04 * u);
  sea(700, { speed: 45 });
  coast(356 - 60 * u, 722, 420, { flip: true });
  ship(lerp(1000, 1320, u), 780, 710);
  ctx.restore();
}
// draw f with nothing below y (a man rising from inside the hull)
function clipAbove(y, f) { ctx.save(); ctx.beginPath(); ctx.rect(-400, PIC0 - 200, W + 800, y - (PIC0 - 200)); ctx.clip(); f(); ctx.restore(); }
function shipOdy(s, fx, pose, h, o = {}) { const [dx, dy] = s.deck(fx); fig(pose, dx, dy + (o.dy ?? 0), h, { rot: s.rot + (o.rot ?? 0), a: o.a }); }
function p23() {   // the ship pulls out; he stands up on the deck and shouts back at the island
  const tUp = VW('c45', 'stood') - 0.3, tSh = VW('c45', 'shouted') - 0.1;
  ctx.save(); cam(760, 480, 1 + 0.08 * EZ.io(pu('p23')));
  sea(702);
  const up = at(tUp, 0.9);
  ship(lerp(700, 800, EZ.io(pu('p23'))), 800, 790, { behind: (s) => clipAbove(s.deck(0)[1], () => xf(tSh, 0.5, (a) => shipOdy(s, 0, 'ody_look', 300, { a, dy: 160 * (1 - up) }), (a) => shipOdy(s, 0, 'ody_shout', 300, { a }))) });
  ctx.restore();
}
function p23b() {   // "It was Odysseus, sacker of cities!" — his men beg him to shut up
  const ws = [['c46', 'cyclops'], ['c46', 'nobody'], ['c47', 'odysseus'], ['c47', 'cities'], ['c47', 'ithaca']].map(([l, w]) => VW(l, w));
  const jump = ws.reduce((s, t) => s + (TT > t - 0.1 ? 14 * Math.exp(-(TT - t + 0.1) * 5) * Math.sin(Math.PI * clamp((TT - t + 0.1) / 0.35)) : 0), 0);
  const back = at(LT('c48') - 0.2, 2);
  ctx.save(); cam(800, 440, 1.16 - 0.14 * back + 0.03 * EZ.io(pu('p23b')));
  sea(702, { speed: 40 });
  ship(lerp(800, 900, EZ.io(pu('p23b'))), 800, 790, { behind: (s) => shipOdy(s, 0, 'ody_shout', 300, { dy: -jump, rot: 0.02 * Math.sin(TT * 5) }) });
  ctx.restore();
}
// the throw: the boulder flies from his hands to the sea beside the ship; a wave throws the ship back
const P24 = { cx: 470, cy: 712, ch: 560 };
function p24() {
  const tT = VW('c49', 'tore') - 0.2, tTh = VW('c49', 'threw') - 0.05, fly = 1.15, tS = tTh + fly, tW = VW('c49', 'wave') - 0.1;
  const wave = clamp((TT - tS) / 3.2), push = Math.sin(Math.PI * clamp((TT - tS - 0.2) / 3.6));
  ctx.save(); cam(lerp(800, 1200, at(tTh, 1.5)), 520, 1.02 + 0.04 * EZ.io(pu('p24')), shake(tS, 8, 1.0), 24);
  // the wave hump rolls from the splash toward the ship and the beach
  const wx = lerp(1300, 600, EZ.o2(wave)), wa = Math.sin(Math.PI * wave) * (TT > tS ? 1 : 0);
  sea(702, { speed: 40, bump: (x, r) => -wa * 70 * Math.exp(-(((x - wx) / 230) ** 2)) * (1 - r * 0.12) });
  if (wa > 0) { ctx.save(); ctx.fillStyle = '#100a0a'; ctx.beginPath(); ctx.moveTo(wx - 520, 704); for (let x = wx - 520; x <= wx + 520; x += 20) ctx.lineTo(x, 704 - wa * 90 * Math.exp(-(((x - wx) / 230) ** 2))); ctx.lineTo(wx + 520, 704); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.4; ctx.stroke(); ctx.restore(); }
  coast(356, 722, 420, { flip: true });
  const lift = at(tT, 0.8) * (1 - at(tTh, 0.2)), wind = -0.06 * lift;
  xf(tTh + 0.05, 0.35, (a) => fig('cyclops_throw', P24.cx, P24.cy, P24.ch, { a, rot: wind, sy: 1 + 0.03 * lift }), (a) => fig('cyclops_blind', P24.cx + 20, P24.cy, P24.ch * 1.02, { a, rot: 0.04 * (1 - at(tTh + 0.3, 1)) }));
  const s = ship(lerp(1480, 1560, EZ.io(pu('p24'))) - 160 * push, 770, 560, { rot: 0.16 * push * Math.sin((TT - tS) * 3.2), dy: -30 * push });
  // the boulder (the same size as in his hands) arcs over the sea and splashes beside the ship
  const r0 = pt('cyclops_throw', P24.cx, P24.cy, P24.ch, 253, 238), [, th] = nat('cyclops_throw'), rr = 190 * P24.ch / th;
  if (TT >= tTh && TT < tS) { const u = (TT - tTh) / fly, x = lerp(r0[0], 1300, u), y = lerp(r0[1], 690, u) - Math.sin(Math.PI * u) * 330; rock(x, y, rr * lerp(1, 0.75, u), u * 5); }
  if (TT >= tS && TT < tS + 1.6) { const u = (TT - tS) / 1.6;
    for (let i = 0; i < 26; i++) { const R = RNG('spl', i), a = R.r(-Math.PI * 0.95, -Math.PI * 0.05), v = R.r(250, 620), x = 1300 + Math.cos(a) * v * u * 1.2, y = 700 + Math.sin(a) * v * u + 700 * u * u;
      if (y < 712) { bfDot(x, y, R.r(7, 16) * (1 - u * 0.5), BF.black); ctx.save(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, R.r(7, 16) * (1 - u * 0.5), 0, TAU); ctx.stroke(); ctx.restore(); } } }
  ctx.restore();
}
function p24b() {   // he wanted the credit; the Cyclops kneels and lifts his hands to the sea
  const tP = VW('c51', 'lifted') - 0.2, u = EZ.io(pu('p24b'));
  ctx.save(); cam(lerp(1400, 600, at(LT('c51') - 0.5, 3)), 480, 1.08);
  sea(702, { speed: 22 });
  ship(lerp(1450, 1640, u), 760, 380, { behind: (s) => shipOdy(s, 0, 'ody_shout', 150) });
  xf(tP, 0.9, (a) => fig('cyclops_blind', 430, 712, 560, { a }), (a) => fig('cyclops_pray', 410, 715, 420, { a }));
  ctx.restore();
}
function p24c() {   // the prayer; Poseidon rises out of the sea and hears him
  const tR = VW('c53', 'or') - 0.2, tH = VW('c54', 'heard') + 0.2, u = EZ.io(clamp((TT - tR) / (tH - tR)));
  ctx.save(); cam(lerp(960, 1300, at(tH - 1, 4)), 520, 1 + 0.06 * EZ.io(pu('p24c')));
  const churn = clamp((TT - tR + 2) / 2) * (1 - u * 0.6);
  sea(702, { speed: 22 + 30 * churn, bump: (x, r) => -churn * 18 * Math.exp(-(((x - 1450) / 260) ** 2)) * Math.sin(TT * 3 + r) });
  fig('cyclops_pray', 410, 715, 420, { rot: 0.012 * Math.sin(TT * 1.1) });
  ctx.save(); ctx.beginPath(); ctx.rect(-400, PIC0 - 200, W + 800, lerp(706, 1000, u) - (PIC0 - 200)); ctx.clip();
  fig('poseidon', 1450, 900 + 560 * (1 - u), 600, { rot: 0.008 * Math.sin(TT * 0.8) });
  ctx.restore();
  const e = pt('poseidon', 1450, 900, 600, 0, 0); void e;
  ctx.restore();
  if (TT > tH - 0.3) tint('#2a2f3a', 0.12 * at(tH - 0.3, 2), 'multiply');
}

// =====================================================================
//  captions: Dalek Pinpoint Bold 40px, cream, a soft black drop shadow, centred low in the picture (baseline 898).
//  One phrase at a time (≤ 9 words, one line), each word written on its spoken word; the last one slides out with its panel.
// =====================================================================
const CAP_FONT = '"Dalek Pinpoint", "DalekPinpointBold", Georgia, serif', CAP_SIZE = 40, CAP_Y = 898, CAP_COL = 'rgb(240,222,190)';
const KCH = [], FUNC = new Set(['and', 'the', 'a', 'of', 'to', 'with', 'in', 'on', 'at', 'his', 'her', 'for', 'that', 'it', 'he', 'they', 'into', 'from', 'as', 'under', 'over', 'if', 'but', 'so']);
for (const L of VOICE.lines) { const ws = L.text.split(/\s+/); let cur = null; const mine = [];
  ws.forEach((w, i) => { const t = L.words[i] ? L.words[i].t0 : L.t0; if (!cur) { cur = { id: L.id, p: LINE_PANEL[L.id], ws: [], ts: [] }; mine.push(cur); } cur.ws.push(w); cur.ts.push(t);
    const n = cur.ws.length, chars = cur.ws.join(' ').length, left = ws.length - 1 - i;
    if ((/[.?!]$/.test(w)) || (/[,:;]$/.test(w) && n >= 3 && left >= 2)) cur = null;
    else if (n >= 8 || chars > 44) { if (n >= 4 && FUNC.has(w.toLowerCase())) { cur.ws.pop(); cur.ts.pop(); cur = { id: L.id, p: LINE_PANEL[L.id], ws: [w], ts: [t] }; mine.push(cur); } else cur = null; } });
  for (let k = mine.length - 1; k > 0; k--) { const a = mine[k - 1], b = mine[k]; if (b.ws.length === 1 && a.ws.length <= 8 && !/[.?!]$/.test(a.ws[a.ws.length - 1])) { a.ws.push(...b.ws); a.ts.push(...b.ts); mine.splice(k, 1); } }
  KCH.push(...mine); }
KCH.forEach((c, i) => { const prev = i > 0 ? KCH[i - 1] : null; c.show = Math.max(c.ts[0] - 0.08, prev ? prev.ts[prev.ts.length - 1] + 0.3 : -1); });
KCH.forEach((c, i) => { const nx = KCH[i + 1]; c.last = !nx || nx.p !== c.p; c.end = c.last ? SUBEND(c.p) + BF_SLIDE : nx.show; });
function kCaptions(pi, xMax = W) {   // xMax: the panel sliding in covers this panel's captions from there on
  const id = IDS[pi], dx = BF_PDX;
  for (const c of KCH) {
    if (c.p !== id || TT < c.show || TT >= c.end) continue;
    const a = c.last ? 1 : 1 - clamp((TT - (c.end - 0.1)) / 0.1);
    bfOverlay(() => {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, dx, 0); ctx.beginPath(); ctx.rect(-4000, 0, xMax - dx + 4000, H); ctx.clip(); ctx.font = `bold ${CAP_SIZE}px ${CAP_FONT}`; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '1px';
      const sp = ctx.measureText(' ').width, ww = c.ws.map((w) => ctx.measureText(w).width), tw = ww.reduce((s, v) => s + v, 0) + sp * (ww.length - 1);
      let x = W / 2 - tw / 2;
      c.ws.forEach((w, i) => { const k = EZ.o2(clamp((TT - Math.max(c.ts[i], c.show) + 0.04) / 0.16));
        if (k > 0) { ctx.globalAlpha = a * k; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 3; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 3; ctx.fillStyle = CAP_COL; ctx.fillText(w, x, CAP_Y + (1 - k) * 4); }
        x += ww[i] + sp; });
      ctx.restore();
    });
  }
}

// ---- a slide never cuts a figure: after both panels are drawn (clipped), each panel is run again with only its figures
// (Flow layers and thrown rocks) going to an offscreen canvas, its tints falling only on them; that canvas is laid over
// the neighbouring panel. Sets (cave, coast, sea, hillside) stay cut at the seam.
let FGX = null, OVC = null;
const SLIDE_PAR = 0.3;
const FULL_SET = new Set(['p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19', 'p21', 'p21b']);   // panels that fill the picture with a set   // how far the outgoing panel drifts during a slide (fraction of the width)
const FG_SET = new Set(['cave.webp', 'coast.webp', 'poseidon.webp']), JUNK = document.createElement('canvas'); JUNK.width = JUNK.height = 2;
const fgRoute = (f) => function (...a) { if (!FGX) return f(...a); const j = ctx; FGX.setTransform(j.getTransform()); FGX.globalAlpha = j.globalAlpha; ctx = FGX; try { return f(...a); } finally { ctx = j; } };
const _bfLay = bfLay, _rock = rock, _fgLay = fgRoute(_bfLay);
bfLay = function (name, ...a) { return FGX && !FG_SET.has(name) ? _fgLay(name, ...a) : _bfLay(name, ...a); };
rock = fgRoute(_rock);
function slideOverflow(i, x) {
  BF_PDX = x;
  if (!OVC) { OVC = document.createElement('canvas'); OVC.width = W; OVC.height = H; }
  const o = OVC.getContext('2d'), main = ctx; o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, W, H);
  ctx = JUNK.getContext('2d'); ctx.setTransform(1, 0, 0, 1, BF_PDX, 0); FGX = o;
  try { ctx.save(); PANELS[IDS[i]](); ctx.restore(); } finally { FGX = null; ctx = main; }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath();
  if (BF_PDX > 0) ctx.rect(0, PIC0, BF_PDX, PIC1 - PIC0); else ctx.rect(BF_PDX + W, PIC0, -BF_PDX, PIC1 - PIC0);   // only outside its own panel
  ctx.clip(); ctx.drawImage(OVC, 0, 0); ctx.restore();
}
const PANELS = { p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p21b, p22, p23, p23b, p24, p24b, p24c };
function sceneStage() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); drawAsset('bg.jpg', 0, 0, W, H);   // the ground and its friezes stay put
  const p = bfStripPos(), off = p * W, i0 = Math.min(IDS.length - 1, Math.floor(p)), i1 = Math.min(IDS.length - 1, i0 + 1);
  // a slide. Into an open panel (mostly bare paper: sea, ship, outdoors) the frieze is one long strip: both panels move
  // together over the same paper, and the figures cross the seam. Into a full set (the cave) the new panel slides in
  // over the old one, opaque, while the old one drifts a little left underneath.
  const u = off / W - i0, sliding = i0 !== i1 && u > 0, card = sliding && FULL_SET.has(IDS[i1]);
  const pos = !sliding ? [[i0, 0]] : card ? [[i0, -SLIDE_PAR * u * W], [i1, (1 - u) * W]] : [[i0, -u * W], [i1, (1 - u) * W]];
  for (const [i, dx] of pos) {
    BF_PDX = dx;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, BF_PDX, 0);
    ctx.beginPath(); ctx.rect(0, PIC0, W, PIC1 - PIC0); ctx.clip();
    if (card && i === i1) drawAsset('bg.jpg', 0, 0, W, H);   // a full set carries its own paper, so it hides the panel below
    PANELS[IDS[i]]();
    ctx.restore();
    kCaptions(i, card && i === i0 ? (1 - u) * W : W);
  }
  if (sliding && !card) { slideOverflow(i0, -u * W); slideOverflow(i1, (1 - u) * W); }
  if (card) { const x = (1 - u) * W, g = ctx.createLinearGradient(x - 36, 0, x, 0);   // a soft shadow under the leading edge: the new panel lies on top
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.38)'); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = g; ctx.fillRect(x - 36, PIC0, 36, PIC1 - PIC0); ctx.restore();
    slideOverflow(i1, x); }
  BF_PDX = 0;
}
// storyboard frames: each panel at its board anchor line
const BOARD_AT = { p01: ['c01', 'cyclopes'], p02: ['c04', 'though'], p03: ['c06', 'wine'], p04: ['c07', 'lambs'], p05: ['c09', 'run'], p06: ['c12', 'sea'], p07: ['c13', 'shifted'],
  p08: ['c14', 'them'], p09: ['c16', 'travellers'], p10: ['c17', 'gods'], p11: ['c18', 'men'], p12: ['c19', 'sleep'], p13: ['c20', 'there'], p14: ['c23', 'flock'], p15: ['c24', 'mast'],
  p16: ['c27', 'drink'], p17: ['c30', 'nobody'], p18: ['c32', 'drunk'], p19: ['c34', 'eye'], p20: ['c38', 'me'], p21: ['c40', 'past'], p21b: ['c42', 'back'], p22: ['c43', 'away'],
  p23: ['c45', 'island'], p23b: ['c47', 'cities'], p24: ['c49', 'beach'], p24b: ['c51', 'father'], p24c: ['c54', 'him'] };
TIMELINE.board = IDS.map((id, i) => { const [l, w] = BOARD_AT[id]; const t = Math.min(VW(l, w) + 0.6, SUBEND(id) - 0.6); return { t: Math.round(t * FPS) / FPS, title: id, sound: '', next: '' }; });
