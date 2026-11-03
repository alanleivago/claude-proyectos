// =====================================================================
//  SCENES — Odyssey p2: Aeolus and the Bag of Winds, The Laestrygonians (amphora-bf, Flow layers, 16:9). The ground and its friezes (assets/bg.jpg) are fixed on screen;
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
// a turn: the figure narrows to edge-on and opens the other way (no crossfade, always solid)
function turnFig(n, x, y, h, t, o = {}) { const k = clamp((TT - t) / (o.d ?? 0.3)), c = Math.cos(Math.PI * k); fig(n, x, y, h, { ...o, sx: Math.max(0.06, Math.abs(c)), flip: k > 0.5 ? !o.flip : !!o.flip }); }
// walking from x0 to x1: position, a step bob and a rock while moving
function walk(x0, x1, t0, d, rate = 6.5, bob = 12) { const u = EZ.io(clamp((TT - t0) / d)), mv = TT > t0 && TT < t0 + d ? Math.sin(Math.PI * clamp((TT - t0) / d)) : 0; return { x: lerp(x0, x1, u), dy: -Math.abs(Math.sin(TT * rate)) * bob * mv, rot: 0.025 * Math.sin(TT * rate) * mv, mv }; }
function glow(x, y, r, c, a, op = 'source-over') { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = op; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c.replace('A', a)); g.addColorStop(1, c.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
// the camera inside a panel: zoom z about the point (fx, fy), plus a shake
function cam(fx, fy, z, sh = 0, key = 0) { const sx = sh ? sh * Math.sin(TT * 61 + key) : 0, sy = sh ? sh * Math.cos(TT * 53 + key * 2) : 0; ctx.translate(fx + sx, fy + sy); ctx.scale(z, z); ctx.translate(-fx, -fy); }
function cam2(cx, cy, z, sh = 0, key = 0) { const sx = sh ? sh * Math.sin(TT * 61 + key) : 0, sy = sh ? sh * Math.cos(TT * 53 + key * 2) : 0; ctx.translate(W / 2 + sx, cy + sy); ctx.scale(z, z); ctx.translate(-cx, -cy); }
const shake = (t, amp, d = 0.8) => (TT > t && TT < t + d ? amp * (1 - (TT - t) / d) ** 2 : 0);
// a flat colour over the whole picture (red flash, firelight, darkness on figures)
function tint(c, a, op = 'source-over') { if (a <= 0) return; if (FGX) { const j = ctx, f = FGX; f.setTransform(j.getTransform()); ctx = f; FGX = null; try { tint(c, a * (op === 'lighter' ? 0.5 : 1), 'source-atop'); } finally { ctx = j; FGX = f; } return; } ctx.save(); ctx.globalCompositeOperation = op; ctx.globalAlpha = clamp(a); ctx.fillStyle = c; ctx.fillRect(-400, PIC0 - 200, W + 800, PIC1 - PIC0 + 400); ctx.restore(); }


// ---- the sea: a black band with thin orange swell lines that roll
function sea(y0 = SEA, o = {}) {
  const sp = o.speed ?? 30, xa = o.x0 ?? -1600, xb = W + 1600;
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.beginPath(); ctx.moveTo(xa + (o.x0 != null ? 140 : 0), y0); ctx.lineTo(xb, y0); ctx.lineTo(xb, PIC1 + 300); ctx.lineTo(xa, PIC1 + 300); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.2;
  for (let r = 0; r < 6; r++) { const y = y0 + 22 + r * 42; if (y > PIC1 + 40) break; ctx.beginPath(); const xs = xa + (o.x0 != null ? 140 * (1 - (r + 1) * 42 / 260) + 20 : 0);
    for (let x = xs; x <= xb; x += 24) { const yy = y + 5 * Math.sin(x * 0.006 + TT * (0.9 + r * 0.15) * (sp / 30) + r * 1.7) + (o.bump ? o.bump(x, r) : 0); x === xs ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
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

// draw f with nothing below y (a man rising from inside the hull)
function clipAbove(y, f) { ctx.save(); ctx.beginPath(); ctx.rect(-400, PIC0 - 200, W + 800, y - (PIC0 - 200)); ctx.clip(); f(); ctx.restore(); }
function shipOdy(s, fx, pose, h, o = {}) { const [dx, dy] = s.deck(fx); fig(pose, dx, dy + (o.dy ?? 0), h, { rot: s.rot + (o.rot ?? 0), a: o.a }); }

// ---- code-drawn fire: dark-brown tongues (the figures' colour) with an incised orange edge, swaying and licking; brown embers rising
const FIRE_COL = '#2e1409';
function fireAt(x, y, s = 1, k = 1, key = 0) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= clamp(k);
  const T = [[-58, 58, 0], [-34, 92, 0.9], [-10, 128, 1.7], [14, 104, 2.6], [38, 120, 3.3], [60, 66, 4.1], [0, 74, 5.0]];
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const [dx, h0, p0] of T) { const ph = p0 + key * 0.7;
    const h = h0 * (0.8 + 0.2 * Math.sin(TT * 8 + ph * 2) + 0.08 * Math.sin(TT * 19 + ph)), sw = 16 * Math.sin(TT * 5 + ph), wd = 22, curl = 10 * Math.sin(TT * 7 + ph);
    ctx.beginPath(); ctx.moveTo(dx - wd, -4); ctx.bezierCurveTo(dx - wd * 1.1, -h * 0.4, dx + sw - 14, -h * 0.7, dx + sw + curl, -h);
    ctx.bezierCurveTo(dx + sw + 10, -h * 0.68, dx + wd * 1.1, -h * 0.38, dx + wd, -4); ctx.closePath();
    ctx.fillStyle = FIRE_COL; ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.6 / s; ctx.stroke();
    ctx.lineWidth = 2 / s; ctx.beginPath(); ctx.moveTo(dx - wd * 0.3, -10); ctx.bezierCurveTo(dx - wd * 0.35, -h * 0.3, dx + sw * 0.4 - 4, -h * 0.45, dx + sw * 0.6, -h * 0.66); ctx.stroke(); }
  for (let i = 0; i < 10; i++) { const R = RNG('emb' + key, i), ph = mod(TT * R.r(0.35, 0.7) + R.f(), 1), ex = R.r(-70, 70) + Math.sin(TT * 2 + i) * 14 * ph, ey = -110 - ph * 220;
    ctx.save(); ctx.globalAlpha *= 1 - ph; ctx.translate(ex, ey); ctx.rotate(TT * 3 + i); ctx.fillStyle = FIRE_COL; ctx.fillRect(-4 / Math.sqrt(s), -1.5, 8 / Math.sqrt(s), 3); ctx.restore(); }
  ctx.restore();
}
// smoke: dark puffs that rise, swell and thin out
function smoke(x, y, s = 1, k = 1, key = 0) {
  if (k <= 0) return;
  // brown like the fire; it thins out before the top frieze so it is never sliced flat by the picture's edge
  const fade = ctx.createLinearGradient(0, PIC0 + 40, 0, PIC0 + 340); fade.addColorStop(0, 'rgba(46,20,9,0)'); fade.addColorStop(1, 'rgba(46,20,9,0.85)');
  ctx.save(); ctx.fillStyle = fade; ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.6;
  for (let j = 0; j < 3; j++) { const R = RNG('smk' + key, j), ph = R.r(0, 6), len = (360 + 120 * j) * s, n = 24, P = [];
    for (let i = 0; i <= n; i++) { const u = i / n; P.push([x + (j - 1) * 26 * s + Math.sin(u * 6 + TT * 1.3 + ph) * 34 * s * u + u * u * 110 * s, y - u * len, (16 * (1 - u) + 2.5) * s]); }
    ctx.globalAlpha = k * (0.55 - j * 0.1); ctx.beginPath();
    P.forEach(([px, py, r], i) => (i ? ctx.lineTo(px - r, py) : ctx.moveTo(px - r, py))); for (let i = P.length - 1; i >= 0; i--) ctx.lineTo(P[i][0] + P[i][2], P[i][1]); ctx.closePath(); ctx.fill();
    const [ex, ey] = P[P.length - 1]; ctx.beginPath(); for (let a = 0; a < 10; a++) { const r = (4 + a * 2.6) * s, th = a * 0.8 + TT + ph; ctx.lineTo(ex + Math.cos(th) * r, ey + Math.sin(th) * r); } ctx.lineWidth = 3 * s; ctx.strokeStyle = fade; ctx.stroke(); }
  ctx.restore();
}

// the ground: dark earth (or sand) from y0 down, an incised top edge, a broken stratum, pebbles and black tufts on the edge
function ground(y0 = FLOOR, o = {}) {
  const R = RNG('gnd' + (o.key ?? '')), x0 = o.x0 ?? -1600, x1 = o.x1 ?? W + 1600;
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.beginPath(); ctx.moveTo(x0 - (o.slope ?? 0), PIC1 + 300); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, PIC1 + 300); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(x0 - (o.slope ?? 0), y0 + (o.slope ? 90 : 0)); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
  ctx.lineWidth = 1.6;
  for (let x = x0 + R.r(0, 80); x < x1;) { const l = Math.min(x1 - x, R.r(120, 320)), y = y0 + 28 + R.r(-5, 5); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l / 2, y + R.r(-6, 6), x + l, y + R.r(-4, 4)); ctx.stroke(); x += l + R.r(40, 140); }
  if (o.sand) for (let i = 0; i < 260; i++) { const x = R.r(x0, x1), y = y0 + R.r(8, 70); bfDot(x, y, R.r(0.9, 1.9), 'rgba(223,124,60,0.75)'); }
  else for (let i = 0; i < 30; i++) { const x = R.r(x0, x1), y = y0 + R.r(16, 64), rx = R.r(8, 22); ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.45, 0, Math.PI * 1.05, Math.PI * 2.1); ctx.stroke(); }
  ctx.fillStyle = BF.black; ctx.strokeStyle = BF.black; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  for (let x = x0 + R.r(20, 90); x < x1; x += R.r(90, 220)) { if (o.bare) break; const sw = 2 * Math.sin(TT * 1.4 + x); ctx.beginPath(); for (let j = 0; j < 4; j++) { ctx.moveTo(x + j * 6, y0 + 1); ctx.lineTo(x + j * 6 + R.r(-7, 7) + sw, y0 - R.r(9, 19)); } ctx.stroke(); }
  ctx.restore();
}
// the walls of Troy (the Flow set) with its gate: open = 0 shut .. 1 wide open (two dark doorways swing in)
const WALL = { gx0: 570 / 1376, gx1: 805 / 1376, gy0: 300 / 671, gy1: 650 / 671 };
function walls(x, yb, h, open = 0, o = {}) {
  const [nw, nh] = nat('troy_walls'), w = h * nw / nh;
  bfLay('troy_walls.webp', x, yb, h, { a: o.a });
  if (open > 0) { const L = x - w / 2 + WALL.gx0 * w, R = x - w / 2 + WALL.gx1 * w, T = yb - h + WALL.gy0 * h, B = yb - h + WALL.gy1 * h, mid = (L + R) / 2, k = EZ.io(open);
    ctx.save(); ctx.fillStyle = o.inside ?? '#060304'; ctx.fillRect(L + 2, T + 2, R - L - 4, B - T);
    for (const [ex, dir] of [[L, 1], [R, -1]]) { const dw = (mid - L) * (1 - 0.82 * k);
      ctx.beginPath(); ctx.moveTo(ex, T); ctx.lineTo(ex + dir * dw, T + 18 * k); ctx.lineTo(ex + dir * dw, B - 6 * k); ctx.lineTo(ex, B); ctx.closePath();
      ctx.fillStyle = '#1c0f0b'; ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.stroke();
      for (let j = 1; j < 4; j++) { ctx.beginPath(); ctx.moveTo(ex + dir * dw * j / 4, T + 18 * k * j / 4); ctx.lineTo(ex + dir * dw * j / 4, B - 6 * k * j / 4); ctx.stroke(); } }
    ctx.restore(); }
  return { gate: [x - w / 2 + (WALL.gx0 + WALL.gx1) / 2 * w, yb - h + WALL.gy1 * h], top: yb - h + 200 / 671 * h, w };
}
// the wooden horse on its plinth (faces left; flip faces right); hatch 0..1 opens the trapdoor in its belly
const HATCH = [455, 405, 545, 485];
function horse(x, y, h, o = {}) {
  fig('trojan_horse', x, y, h, { ...o, still: true });
  if (o.hatch == null) return;
  const f = (px, py) => pt('trojan_horse', x, y, h, px, py, o), [a0, b0] = f(HATCH[0], HATCH[1]), [a1, b1] = f(HATCH[2], HATCH[3]);
  const L = Math.min(a0, a1), R = Math.max(a0, a1), T = b0, B = b1, k = EZ.io(clamp(o.hatch));
  const route = (fn) => (FGX ? fgRoute(fn)() : fn());
  route(() => { ctx.save(); ctx.fillStyle = '#050203'; ctx.fillRect(L, T, R - L, B - T);
    const dw = (R - L) * (1 - k); ctx.fillStyle = '#1a0d0a'; ctx.fillRect(o.flip ? R - dw : L, T, dw, B - T);
    ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.strokeRect(L, T, R - L, B - T); if (dw > 2) { ctx.beginPath(); for (let j = 1; j < 3; j++) { const xx = o.flip ? R - dw * j / 3 : L + dw * j / 3; ctx.moveTo(xx, T); ctx.lineTo(xx, B); } ctx.stroke(); }
    ctx.restore(); });
  return { hatch: [(L + R) / 2, B] };
}
// lettering in the orange area, letter by letter from t (like NOBODY)
function letters(str, x, y, t, size = 96, o = {}) {
  if (TT < t) return;
  ctx.save(); ctx.font = `bold ${size}px ${CAP_FONT}`; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '6px'; ctx.globalAlpha *= o.a ?? 1;
  const tw = ctx.measureText(str).width; let xx = x - tw / 2;
  for (let i = 0; i < str.length; i++) { const ch = str[i], cw = ctx.measureText(ch).width + 6, k = EZ.o2(clamp((TT - t - i * (o.step ?? 0.07)) / 0.18));
    if (k > 0) { ctx.globalAlpha = (o.a ?? 1) * k; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.strokeStyle = BF.ground; ctx.strokeText(ch, xx, y + (1 - k) * 8); ctx.fillStyle = BF.black; ctx.fillText(ch, xx, y + (1 - k) * 8); }
    xx += cw; }
  ctx.restore();
}
// incised tally strokes (years, days), one per tick, drawn from the top down
function tally(n, x, y, t0, dt, o = {}) {
  ctx.save(); ctx.strokeStyle = BF.black; ctx.lineCap = 'round'; ctx.lineWidth = o.w ?? 9; const gap = o.gap ?? 30, len = o.len ?? 70;
  for (let i = 0; i < n; i++) { const k = EZ.o2(clamp((TT - t0 - i * dt) / 0.25)); if (k <= 0) continue; const xx = x + i * gap + (i % 5 === 4 ? 0 : 0);
    ctx.beginPath(); if (i % 5 === 4) { ctx.moveTo(x + (i - 4) * gap - 14, y + len * 0.75); ctx.lineTo(lerp(x + (i - 4) * gap - 14, x + (i - 1) * gap + 14, k), lerp(y + len * 0.75, y + len * 0.2, k)); }
    else { ctx.moveTo(xx, y); ctx.lineTo(xx, y + len * k); } ctx.stroke(); }
  ctx.restore();
}
// night: a dark wash over the picture and a moon with an incised ring
function night(k, mx = 1500, my = 230) {
  if (k <= 0) return;
  tint('#140810', 0.78 * k, 'multiply');
  ctx.save(); ctx.globalAlpha *= k; bfDot(mx, my, 54, 'rgba(240,222,190,0.9)'); ctx.strokeStyle = BF.black; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx + 10, my, 46, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke(); ctx.restore();
  glow(mx, my, 200, 'rgba(240,222,190,A)', 0.18 * k, 'lighter');
}
// birds: small black Vs crossing the sky
function birds(n, y, sp, key = 0) {
  ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const R = RNG('bd' + key, i), x = mod(R.r(0, W + 400) + TT * sp * R.r(0.8, 1.2), W + 400) - 200, yy = y + R.r(-60, 60) + 8 * Math.sin(TT * 1.3 + i), fl = 8 * Math.sin(TT * 9 + i * 2), s = R.r(10, 16);
    ctx.beginPath(); ctx.moveTo(x - s, yy - fl); ctx.quadraticCurveTo(x - s * 0.4, yy - 3, x, yy); ctx.quadraticCurveTo(x + s * 0.4, yy - 3, x + s, yy - fl); ctx.stroke(); }
  ctx.restore();
}
// a hall of columns (Ithaca): black Doric columns with flutes, capitals and a beam with dentils across the top
function hall() {
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  ctx.fillRect(-400, 120, W + 800, 70); ctx.beginPath(); ctx.moveTo(-400, 190); ctx.lineTo(W + 400, 190); ctx.moveTo(-400, 130); ctx.lineTo(W + 400, 130); ctx.stroke();
  for (let x = -380; x < W + 400; x += 34) { ctx.strokeRect(x, 140, 18, 18); }
  for (const cx of [-300, 60, 420, 935, 1580, 1890, 2250]) { ctx.fillRect(cx - 44, 190, 88, 26); ctx.strokeRect(cx - 44, 190, 88, 26);
    ctx.beginPath(); ctx.moveTo(cx - 34, 216); ctx.lineTo(cx - 40, FLOOR); ctx.lineTo(cx + 40, FLOOR); ctx.lineTo(cx + 34, 216); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let j = -2; j <= 2; j++) { ctx.beginPath(); ctx.moveTo(cx + j * 12, 224); ctx.lineTo(cx + j * 13.5, FLOOR - 8); ctx.stroke(); } }
  // hanging shields and a bow on the wall between columns
  for (const sx of [240, 1330, 2070]) { bfDot(sx, 330, 46, BF.black); ctx.beginPath(); ctx.arc(sx, 330, 46, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(sx, 330, 30, 0, TAU); ctx.stroke(); bfDot(sx, 330, 8, BF.inc); }
  ctx.restore();
}
// the camp: tents (code), each can burn
function tent(x, y, s, burn = 0, key = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-110, 0); ctx.lineTo(0, -150); ctx.lineTo(110, 0); ctx.closePath(); ctx.fillStyle = BF.black; ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(0, -175); ctx.moveTo(-55, -75); ctx.lineTo(-20, 0); ctx.moveTo(55, -75); ctx.lineTo(20, 0); ctx.moveTo(-20, 0); ctx.lineTo(0, -60); ctx.lineTo(20, 0); ctx.stroke();
  ctx.restore();
  if (burn > 0) { fireAt(x, y - 20 * s, s * (0.7 + 0.6 * burn), burn, key); smoke(x, y - 120 * s, s, burn, key); }
}
// clouds of Olympus: a bank of black curls with incised spirals
function clouds(y, k = 1) {
  ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  ctx.beginPath(); for (let x = -400; x <= W + 400; x += 70) { const yy = y + 6 * Math.sin(x * 0.01 + TT * 0.6); ctx.arc(x, yy, 48, Math.PI, 0); } ctx.lineTo(W + 400, y + 60); ctx.lineTo(-400, y + 60); ctx.closePath(); ctx.fill();
  for (let x = -400; x <= W + 400; x += 70) { const yy = y + 6 * Math.sin(x * 0.01 + TT * 0.6); ctx.beginPath(); for (let a = 0; a < 9; a++) { const r = 4 + a * 3.4, th = Math.PI + a * 0.75; ctx.lineTo(x + Math.cos(th) * r, yy + Math.sin(th) * r * 0.8); } ctx.stroke(); }
  ctx.fillRect(-400, y + 40, W + 800, 30); ctx.beginPath(); ctx.moveTo(-400, y + 54); ctx.lineTo(W + 400, y + 54); ctx.stroke();
  ctx.restore();
}
// rain and lightning
function rain(k, ang = 0.35) {
  if (k <= 0) return; ctx.save(); ctx.strokeStyle = 'rgba(23,11,18,0.55)'; ctx.lineWidth = 2.2; ctx.globalAlpha *= k;
  for (let i = 0; i < 140; i++) { const R = RNG('rn', i), x = mod(R.r(-200, W + 400) - TT * 900 * ang, W + 600) - 300, y = mod(R.r(0, 900) + TT * 1300, 900) + PIC0 - 60;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 40 * ang, y + 40); ctx.stroke(); }
  ctx.restore();
}
function bolt(t, x0, d = 0.35) {
  if (TT < t || TT > t + d) return 0; const k = 1 - (TT - t) / d, R = RNG('bolt', Math.round(t * 10));
  ctx.save(); ctx.strokeStyle = `rgba(250,236,205,${k})`; ctx.lineWidth = 7; ctx.lineJoin = 'miter'; ctx.beginPath(); let x = x0, y = PIC0; ctx.moveTo(x, y);
  while (y < 640) { x += R.r(-60, 60); y += R.r(50, 90); ctx.lineTo(x, y); } ctx.stroke(); ctx.lineWidth = 2.5; ctx.strokeStyle = BF.black; ctx.stroke(); ctx.restore();
  return k;
}
// a route drawn across the sea with a travelling head
function route(P, u) {
  if (u <= 0) return; let L = 0; const seg = []; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(l); L += l; }
  let left = L * u, hx = P[0][0], hy = P[0][1];
  ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 5; ctx.setLineDash([16, 12]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length && left > 0; i++) { const k = Math.min(1, left / seg[i - 1]); hx = lerp(P[i - 1][0], P[i][0], k); hy = lerp(P[i - 1][1], P[i][1], k); ctx.lineTo(hx, hy); left -= seg[i - 1]; }
  ctx.stroke(); ctx.setLineDash([]); bfDot(hx, hy, 10, BF.black); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, TAU); ctx.stroke(); ctx.restore();
}
// a figure rising out of the ground line (nothing pops in)
function riseFrom(yl, k, f) { ctx.save(); ctx.beginPath(); ctx.rect(-400, PIC0 - 200, W + 800, yl - (PIC0 - 200)); ctx.clip(); f((1 - EZ.o2(clamp(k))) * 700); ctx.restore(); }
const rise = (t, d = 0.9) => clamp((TT - t) / d);
// a ship sinking: its hull goes under the sea line
function sinkShip(x, yb, w, k, o = {}) { clipAbove(SEA + 4, () => ship(x, yb + 260 * EZ.i2(clamp(k)), w, { ...o, rot: (o.rot ?? 0) + 0.25 * EZ.i2(clamp(k)) * (o.dir ?? 1), a: (o.a ?? 1) * (1 - 0.3 * clamp(k)) })); }
// the gods' gaze: a soft cream glint in the eye
function eyeGlint(x, y, k) { if (k <= 0) return; glow(x, y, 40, 'rgba(255,214,150,A)', 0.8 * k, 'lighter'); bfDot(x, y, 4 * k, `rgba(255,240,200,${k})`); }

// =====================================================================
//  PART 2 helpers: winds (code, the figures' brown), the bag's cord, the ship's deck, the harbour of the Laestrygonians, the fleet tally
// =====================================================================
// a gust: brown ribbons with an orange incised centre line, each ending in a curl; they stream from (x, y) along ang
function gust(x, y, len, ang, k = 1, key = 0, o = {}) {
  if (k <= 0) return;
  const n = o.n ?? 5, wd = o.w ?? 13, sp = o.speed ?? 0.9, spread = o.spread ?? 70;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const R = RNG('gu' + key, i), ph = mod(TT * sp * R.r(0.8, 1.2) + R.f(), 1), off = (i - (n - 1) / 2) * spread / Math.max(1, n - 1) * 2 + R.r(-10, 10);
    const head = len * EZ.o2(Math.min(1, ph * 1.6)), tail = len * Math.max(0, ph * 1.6 - 0.6), a = k * Math.min(1, (1 - ph) * 4);
    if (head - tail < 20) continue;
    const P = []; for (let s = tail; s <= head; s += 14) P.push([s, off + 16 * Math.sin(s * 0.012 + TT * 3 + i)]);
    const [hx, hy] = P[P.length - 1], cr = 26 + R.r(0, 16), dir = i % 2 ? 1 : -1;
    for (let a2 = 0; a2 < 10; a2++) { const th = -Math.PI / 2 * dir + a2 * 0.62 * dir, r = cr * (1 - a2 / 12); P.push([hx + Math.cos(th - Math.PI / 2 * dir) * r + cr * 0.2, hy + dir * cr + Math.sin(th - Math.PI / 2 * dir) * r * dir]); }
    ctx.globalAlpha = a; ctx.beginPath(); P.forEach(([px, py], j) => (j ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.strokeStyle = BF.inc; ctx.lineWidth = wd + 5; ctx.stroke(); ctx.strokeStyle = FIRE_COL; ctx.lineWidth = wd; ctx.stroke();
    ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.8; ctx.stroke();
  }
  ctx.restore();
}
// every wind at once: gusts thrown out in all directions from (x, y)
function burst(x, y, k, key = 0, len = 900) { for (let i = 0; i < 9; i++) gust(x, y, len * (0.7 + 0.3 * Math.sin(i * 2.1)), -Math.PI * (0.05 + i * 0.11), k, key * 10 + i, { n: 3, w: 15, speed: 1.2, spread: 40 }); }
// the silver cord: a cream line with a glint
function cord(P, k = 1) { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= k; ctx.lineCap = 'round'; ctx.strokeStyle = BF.black; ctx.lineWidth = 6; ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.strokeStyle = 'rgb(240,222,190)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
// the bag (Flow layer) with a pulse; returns its neck (knot) and belly centre
function bag(x, y, h, o = {}) {
  const pulse = o.pulse ?? 0, sx = 1 + pulse * 0.05 * Math.sin(TT * 9), sy = (1 + pulse * 0.04 * Math.sin(TT * 7 + 1)) * (o.sq ?? 1);
  bfLay('bag.webp', x + (o.shake ?? 0) * Math.sin(TT * 41), y, h, { sx, sy, rot: (o.rot ?? 0) + pulse * 0.02 * Math.sin(TT * 5), a: o.a });
  const w = h * 320 / 416; return { neck: [x + 0.02 * w, y - h * sy * 0.86], belly: [x, y - h * sy * 0.36], r: w * 0.42 };
}
// the deck of Odysseus's ship (a full set): the sea and the horizon beyond the rail, the mast and the furled sail, planks underfoot
const DECK = 820;
function deck(o = {}) {
  // the sea beyond the rail: paper with black swell lines (no dark band behind the figures)
  ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-400, 600); ctx.lineTo(W + 400, 600); ctx.stroke(); ctx.lineWidth = 2;
  for (let r = 0; r < 3; r++) { const y = 630 + r * 34; ctx.beginPath(); for (let x = -400; x <= W + 400; x += 24) { const yy = y + 4 * Math.sin(x * 0.006 + TT * (0.8 + r * 0.2) * ((o.seaSpeed ?? 14) / 14) + r * 1.7) + (o.bump ? o.bump(x, r) * 0.4 : 0); x === -400 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
  ctx.restore();
  if (o.ithaca) coast(o.ithacaX ?? 1640, 602, o.ithacaH ?? 120, { a: o.ithaca });
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.2;
  // the mast and its yard with the sail (right, clear of the figures)
  const mx = o.mast ?? 1700, bil = o.billow ?? 0.3, yT = 200, yB = 470;
  ctx.fillRect(mx - 14, PIC0 + 40, 28, DECK - PIC0 - 40); ctx.strokeRect(mx - 14, PIC0 + 40, 28, DECK - PIC0 - 40);
  ctx.fillRect(mx - 260, yT - 14, 520, 14); ctx.strokeRect(mx - 260, yT - 14, 520, 14);
  if (o.torn) { for (let i = 0; i < 5; i++) { const R = RNG('tr', i), fx = mx - 250 + i * 110, fl = 30 * Math.sin(TT * 14 + i * 2);
      ctx.beginPath(); ctx.moveTo(fx, yT); ctx.quadraticCurveTo(fx + 50 + fl, yT + 70, fx + 100 + fl * 2, yT + 50 + R.r(0, 110)); ctx.lineTo(fx + 26, yT + 2); ctx.closePath(); ctx.fill(); ctx.stroke(); } }
  else { const bw = 18 * Math.sin(TT * 1.3) * bil; ctx.beginPath(); ctx.moveTo(mx - 250, yT); ctx.lineTo(mx + 250, yT); ctx.quadraticCurveTo(mx + 262 + bw, (yT + yB) / 2, mx + 250, yB); ctx.quadraticCurveTo(mx, yB + 40 * bil, mx - 250, yB); ctx.quadraticCurveTo(mx - 262 + bw, (yT + yB) / 2, mx - 250, yT); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let j = 1; j < 5; j++) { ctx.beginPath(); ctx.moveTo(mx - 250 + j * 100, yT); ctx.lineTo(mx - 250 + j * 100 + bw * 0.5, yB + 8 * bil); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(mx - 250, yT + 90); ctx.lineTo(mx + 250, yT + 90); ctx.moveTo(mx - 250, yT + 180); ctx.lineTo(mx + 250, yT + 180); ctx.stroke(); }
  // the steering oar at the stern (left)
  if (!o.noOar) { ctx.save(); ctx.translate(120, 700); ctx.rotate(0.45 + (o.oar ?? 0)); ctx.fillRect(-7, -60, 14, 250); ctx.beginPath(); ctx.ellipse(0, 220, 22, 56, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
  // the low rail: a thin gunwale with posts, round shields hung on it between the men
  ctx.fillRect(-400, 744, W + 800, 14); ctx.beginPath(); ctx.moveTo(-400, 751); ctx.lineTo(W + 400, 751); ctx.stroke();
  for (let x = -360; x < W + 400; x += 140) ctx.fillRect(x, 758, 8, DECK - 758);
  ctx.restore();
  // the planks
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.fillRect(-400, DECK, W + 800, PIC1 + 300 - DECK); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-400, DECK); ctx.lineTo(W + 400, DECK); ctx.stroke();
  ctx.lineWidth = 1.6; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-400, DECK + k * 26); ctx.lineTo(W + 400, DECK + k * 26); ctx.stroke(); }
  const R = RNG('plk'); for (let k = 0; k < 4; k++) for (let x = -380 + R.r(0, 200); x < W + 400; x += R.r(220, 420)) { ctx.beginPath(); ctx.moveTo(x, DECK + k * 26); ctx.lineTo(x, DECK + (k + 1) * 26); ctx.stroke(); }
  ctx.restore();
}
// the harbour: two cliffs (one Flow layer, mirrored) rising out of the sea, the calm water between them
// the harbour: two rocky headlands drawn like the Cyclops mountain (irregular ridge, strata, hatch, stones, scrub), high on
// both sides, each ending in a sheer face over a narrow mouth; the giants stand on the flat tops by the mouth
const MOUTH = [880, 1400], HC = (MOUTH[0] + MOUTH[1]) / 2;
const LRIDGE = [[-420, 690], [-250, 640], [-90, 560], [10, 520], [90, 452], [170, 470], [250, 360], [300, 392], [380, 290], [440, 330], [500, 372], [560, 424], [700, 418], [880, 422]];
const LFACE = [[880, 420], [896, 470], [872, 532], [904, 592], [884, 660], [900, SEA + 60]];
const mirror = (P) => P.map(([x, y]) => [2 * HC - x, y]);
const ridgeY = (P, x) => { for (let i = 1; i < P.length; i++) { const [x0, y0] = P[i - 1], [x1, y1] = P[i]; if ((x - x0) * (x - x1) <= 0 && x0 !== x1) return lerp(y0, y1, (x - x0) / (x1 - x0)); } return P[P.length - 1][1]; };
const clampR = (P, x) => { const xs = P.map((p) => p[0]); return Math.max(Math.min(...xs), Math.min(Math.max(...xs), x)); };
const cliffTop = (x = MOUTH[0] - 100) => (x < HC ? ridgeY(LRIDGE, x) : ridgeY(mirror(LRIDGE), x));
function headland(side) {
  const ridge = side < 0 ? LRIDGE : mirror(LRIDGE), face = side < 0 ? LFACE : mirror(LFACE), R = RNG('hl' + side);
  const far = ridge.map(([x, y], i) => [x - side * 160, y - 60 - 50 * Math.abs(Math.sin(i * 1.3))]).filter(([x]) => (side < 0 ? x < MOUTH[0] - 260 : x > MOUTH[1] + 260));
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // the near mass: ridge, then the sheer face down to the water
  const P = [...ridge, ...face.slice(1)], path = () => { ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.lineTo(P[0][0], SEA + 60); ctx.closePath(); };
  path(); ctx.fillStyle = '#100a0a'; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
  ctx.save(); path(); ctx.clip(); ctx.strokeStyle = BF.inc;
  // strata following the ridge, broken, with wobble
  ctx.lineWidth = 2; const xa = Math.min(...P.map((p) => p[0])), xb = Math.max(...P.map((p) => p[0]));
  for (let k = 0; k < 6; k++) { const off = 40 + k * 46 + k * k * 3; let x = xa + R.r(0, 90);
    while (x < xb) { const len = R.r(100, 260), x2 = Math.min(xb, x + len); ctx.beginPath(); for (let xx = x; xx <= x2; xx += 16) { const yy = ridgeY(ridge, clampR(ridge, xx)) + off + 4 * Math.sin(xx * 0.03 + k * 2); xx === x ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy); } ctx.stroke(); x = x2 + R.r(30, 100); } }
  // short hatch under the ridge line, slanting down the slope
  ctx.lineWidth = 1.6; for (let x = xa + 10; x < xb; x += R.r(16, 30)) { const y = ridgeY(ridge, clampR(ridge, x)) + R.r(8, 20), l = R.r(10, 22); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + side * l * 0.35, y + l); ctx.stroke(); }
  // vertical cracks on the sheer face
  const fx = face[0][0]; ctx.lineWidth = 2.2; for (let j = 0; j < 5; j++) { const x = fx - side * (14 + j * 26), y0 = 450 + R.r(0, 60); ctx.beginPath(); ctx.moveTo(x, y0); let yy = y0; while (yy < SEA) { yy += R.r(30, 60); ctx.lineTo(x + R.r(-8, 8), yy); } ctx.stroke(); }
  // stones half sunk in the slope
  for (let i = 0; i < 10; i++) { const x = R.r(xa + 40, xb - 60), y = ridgeY(ridge, clampR(ridge, x)) + R.r(60, 240), rx = R.r(12, 28); if (y > SEA - 10) continue; ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.55, -0.2, Math.PI * 1.05, Math.PI * 2.1); ctx.stroke(); }
  ctx.restore();
  // scrub on the outer ridge (away from where the giants stand)
  ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc;
  for (const bx of side < 0 ? [-60, 120, 300] : [2 * HC + 60, 2 * HC - 120, 2 * HC - 300]) { const by = ridgeY(ridge, bx) + 4;
    ctx.beginPath(); for (let j = 0; j < 7; j++) { const a = Math.PI + j / 6 * Math.PI, rr = 22 + 8 * Math.sin(j * 2.3 + bx); ctx.lineTo(bx + Math.cos(a) * rr * 1.3, by + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.lineWidth = 2; ctx.stroke();
    for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.moveTo(bx - 18 + j * 12, by - 4); ctx.lineTo(bx - 22 + j * 14, by - 18 - (j % 2) * 8); ctx.stroke(); } }
  ctx.restore();
}
function harbour(o = {}) {
  if (o.behind) o.behind();                                  // giants rising from behind the ridge
  headland(-1); headland(1);
  if (o.front) o.front();                                    // giants standing on the tops
  sea(SEA, { speed: o.speed ?? 6, bump: o.bump });
}
const HSHIP = (i) => { const row = i % 3; return [950 + (i / 3 | 0) * 95 + row * 25, [736, 762, 800][row], [140, 165, 200][row]]; };
// the fleet tally: twelve little ships in a row; lost(i) = the time ship i is struck out (a brown cross), Infinity for never
function fleet(x, y, t0, lost = () => Infinity, o = {}) {
  const gap = o.gap ?? 74, n = 12, x0 = x - gap * (n - 1) / 2;
  for (let i = 0; i < n; i++) { const k = EZ.o2(clamp((TT - t0 - i * 0.07) / 0.3)); if (k <= 0) continue;
    const s = clamp((TT - lost(i)) / 0.35), xx = x0 + i * gap;
    bfLay('ship.webp', xx, y + (1 - k) * 12, 34, { a: k * (1 - 0.55 * s) });
    if (s > 0) { ctx.save(); ctx.strokeStyle = FIRE_COL; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(xx - 26, y - 34); ctx.lineTo(lerp(xx - 26, xx + 26, s), lerp(y - 34, y + 4, s)); if (s > 0.5) { const s2 = (s - 0.5) * 2; ctx.moveTo(xx + 26, y - 34); ctx.lineTo(lerp(xx + 26, xx - 26, s2), lerp(y - 34, y + 4, s2)); } ctx.stroke(); ctx.restore(); }
    if (o.hi === i && TT > (o.hiT ?? 1e9)) { ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(xx, y - 16, 40 + 3 * Math.sin(TT * 4), 0, TAU); ctx.stroke(); ctx.restore(); }
  }
}
// a splash: a crown of water in the figures' brown with incised orange edges: curved jets fanning out, droplets arcing
// and falling back, a dome at the start and ripple rings spreading on the water
function splash(x, y, t, s = 1, key = 0) {
  const u = (TT - t) / 1.7; if (u < 0 || u > 1) return;
  ctx.save(); ctx.fillStyle = FIRE_COL; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.lineJoin = 'round';
  // ripple rings on the water
  for (let r = 0; r < 3; r++) { const v = clamp(u * 1.3 - r * 0.15); if (v <= 0 || v >= 1) continue; const rx = (40 + v * 280) * s; ctx.globalAlpha = 1 - v; ctx.beginPath(); ctx.ellipse(x, y + 6, rx, rx * 0.1, 0, 0, TAU); ctx.stroke(); }
  ctx.globalAlpha = 1;
  // the dome thrown up first
  const dm = Math.sin(Math.PI * clamp(u / 0.45)); if (dm > 0.01) { ctx.beginPath(); ctx.moveTo(x - 90 * s, y); ctx.bezierCurveTo(x - 70 * s, y - 120 * s * dm, x - 30 * s, y - 200 * s * dm, x, y - 210 * s * dm); ctx.bezierCurveTo(x + 30 * s, y - 200 * s * dm, x + 70 * s, y - 120 * s * dm, x + 90 * s, y); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  // the crown: jets fanning out, rising and falling under gravity (their tips follow a parabola)
  const g = 1500 * s;
  for (let j = 0; j < 5; j++) { const R = RNG('spl' + key, j), a = -Math.PI / 2 + (j - 2) * 0.42 + R.r(-0.06, 0.06), v = R.r(560, 720) * s, tt = u * 1.1;
    const tx = x + Math.cos(a) * v * tt, ty = y + Math.sin(a) * v * tt + g * tt * tt * 0.5; if (ty > y + 2) continue;
    const bx = x + (j - 2) * 22 * s, w0 = 30 * s * (1 - u * 0.4), w1 = 7 * s, mx = (bx + tx) / 2 - (j - 2) * 26 * s, my = Math.min(y, (y + ty) / 2 - 30 * s);
    const nx = Math.sin(a), ny = -Math.cos(a);
    ctx.beginPath(); ctx.moveTo(bx - w0, y); ctx.quadraticCurveTo(mx - w0 * 0.6, my, tx - w1 * nx, ty - w1 * ny); ctx.arc(tx, ty, w1 * 1.8, a - Math.PI / 2, a + Math.PI / 2, true);
    ctx.quadraticCurveTo(mx + w0 * 0.6, my, bx + w0, y); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  // droplets thrown from the crown, arcing and falling back
  for (let i = 0; i < 16; i++) { const R = RNG('drp' + key, i), a = -Math.PI / 2 + R.r(-1.1, 1.1), v = R.r(380, 820) * s, tt = u * 1.25;
    const px = x + Math.cos(a) * v * tt, py = y - 40 * s + Math.sin(a) * v * tt + g * tt * tt * 0.5, r = R.r(6, 13) * s; if (py > y) continue;
    ctx.beginPath(); ctx.ellipse(px, py, r, r * 1.4, Math.atan2(Math.sin(a) * v + g * tt, Math.cos(a) * v) + Math.PI / 2, 0, TAU); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
// a thrown boulder: from (x0, y0) at t, in an arc to (x1, y1) over d seconds; returns true once it has landed
function boulder(x0, y0, x1, y1, t, d = 1.0, r = 34) { const u = (TT - t) / d; if (u < 0) return false; if (u >= 1) return true; rock(lerp(x0, x1, u), lerp(y0, y1, u * u) - Math.sin(Math.PI * u) * 60, r, TT * 4); return false; }
// a ship broken in two: the halves tip apart and sink
function brokenShip(x, yb, w, k, key = 0) {
  if (k >= 1) return; const [nw, nh] = nat('ship'), h = w * nh / nw;
  for (const side of [-1, 1]) clipAbove(SEA + 4, () => { ctx.save(); ctx.translate(x + side * 30 * k, yb + 200 * EZ.i2(k)); ctx.rotate(side * 0.5 * EZ.o2(k)); ctx.beginPath(); ctx.rect(side < 0 ? -w : 0, -h * 2, w, h * 3); ctx.clip(); bfLay('ship.webp', 0, 0, h); ctx.restore(); });
}
// the hall of Aeolus's palace: columns, a beam with dentils, bronze plates on the wall behind (incised rivets)
function palace() {
  hall();
  ctx.save(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.5;
  for (let x = -380; x < W + 400; x += 44) for (let y = 260; y < FLOOR - 20; y += 120) bfDot(x, y, 2.4, BF.black);
  ctx.restore();
}

// =====================================================================
//  the panels (panel coords = screen coords)
// =====================================================================
// ---- 4 · AEOLUS AND THE BAG OF WINDS
function p01() {   // for a while their luck turned: the fleet sails on a calm sea under the sun; the twelve ships are counted
  const u = EZ.io(pu('p01')), t0 = SUB('p01');
  ctx.save(); cam(960, 560, 1.02 + 0.04 * u);
  birds(5, 260, 40, 1);
  // the sun rising over the sea, rays turning
  const sy = lerp(640, 330, EZ.o2(clamp((TT - t0) / 3))); bfDot(1560, sy, 56, BF.black); ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + TT * 0.3; ctx.beginPath(); ctx.moveTo(1560 + Math.cos(a) * 72, sy + Math.sin(a) * 72); ctx.lineTo(1560 + Math.cos(a) * 96, sy + Math.sin(a) * 96); ctx.stroke(); } ctx.restore();
  sea(702, { speed: 14 });
  [[260, 740, 230], [620, 790, 330], [1000, 735, 220], [1300, 800, 360]].forEach(([x, yb, w], i) => ship(x + 160 * u + 30 * i * u, yb, w));
  fleet(960, 200, t0 + 0.4);
  ctx.restore();
}
function p02() {   // the floating island with walls of bronze drifts in over the sea; the winds circle it; the chapter title
  const t0 = SUB('p02'), tA = VW('l02', 'aeolus') - 0.2, tW = VW('l02', 'winds') - 0.4, u = EZ.io(pu('p02'));
  ctx.save(); cam(1000, 540, 1.02 + 0.05 * u);
  sea(722, { speed: 12 });
  const ix = lerp(2400, 1340, EZ.o2(clamp((TT - t0) / 3.2))), iy = 660 + 14 * Math.sin(TT * 0.9);
  // its shadow on the water
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = BF.black; ctx.beginPath(); ctx.ellipse(ix, 740, 280, 14, 0, 0, TAU); ctx.fill(); ctx.restore();
  for (let i = 0; i < 3; i++) gust(ix - 520 + i * 40, 300 + i * 110, 1000, 0.02 * Math.sin(TT + i), at(tW, 1), 20 + i, { n: 2, w: 10, speed: 0.5 });
  bfLay('aeolus_island.webp', ix, iy, 480, { rot: 0.012 * Math.sin(TT * 0.7) });
  [[0, 800, 330], [0.6, 750, 240]].forEach(([d, yb, w]) => ship(lerp(-300, 360 - d * 220, EZ.io(clamp((TT - t0 - d) / 5))), yb, w));
  letters('IV · AEOLUS', 520, 300, tA, 88, { step: 0.035 });
  ctx.restore();
}
function p03() {   // a month in the palace: Aeolus listens; Odysseus tells of Troy and the stories appear on a little frieze between them; moons go by
  const tS = VW('l03', 'story') - 0.3, tT = VW('l03', 'troy') - 0.3, tM = VW('l03', 'month') - 0.3;
  ctx.save(); cam(960, 560, 1.04 + 0.05 * EZ.io(pu('p03')));
  palace();
  ground(FLOOR, { key: 3, bare: 1 });
  fig('aeolus_sit', 640, FLOOR, 400, { rot: 0.01 * Math.sin(TT * 0.8) });
  const tell = Math.sin(TT * 3.2); fig('ody_offer', 1320, FLOOR, 380, { flip: true, rot: 0.015 * tell });
  // the story frieze: a ledge with little figures rising on it, story after story
  const fk = at(tS - 0.6, 0.6);
  if (fk > 0) { ctx.save(); ctx.globalAlpha *= fk; ctx.fillStyle = BF.black; ctx.fillRect(760, 470, 440, 8); ctx.restore();
    riseFrom(470, rise(tS, 0.7), (dy) => fig('trojan_horse', 880, 470 + dy, 130, { still: true }));
    riseFrom(470, rise(tT, 0.7), (dy) => fig('soldier_attack', 1050, 470 + dy, 120, { rot: 0.02 * Math.sin(TT * 4) }));
    riseFrom(470, rise(tT + 0.5, 0.7), (dy) => fig('soldier_attack', 1140, 470 + dy, 120, { flip: true, rot: 0.02 * Math.sin(TT * 4 + 1) })); }
  // a month: moons wheel across the top, and a tally of nights is cut
  const mk = at(tM, 0.6); if (mk > 0) { for (let i = 0; i < 2; i++) { const ph = mod((TT - tM) / 1.6 + i * 0.5, 1), x = lerp(300, 1620, ph), y = 330 - Math.sin(Math.PI * ph) * 90; ctx.save(); ctx.globalAlpha *= mk * Math.sin(Math.PI * ph); bfDot(x, y, 26, 'rgba(240,222,190,0.9)'); ctx.restore(); } }
  ctx.restore();
}
function p04() {   // the gift: Aeolus walks to him with the leather bag; the silver cord glints
  const tL = VW('l04', 'leave') - 0.4, tB = VW('l04', 'bag') - 0.3, tC = VW('l04', 'cord') - 0.3;
  ctx.save(); cam2(lerp(900, 1060, at(tB, 1.6)), 560, 1.06 + 0.1 * at(tC, 1.6));
  palace();
  ground(FLOOR, { key: 4, bare: 1 });
  const w = walk(560, 900, tL, Math.max(1.2, tB - tL), 4.5, 6); fig('aeolus_give', w.x, FLOOR + w.dy, 400, { rot: w.rot });
  fig('ody_look', 1300, FLOOR, 380, { flip: true, rot: 0.01 * Math.sin(TT) });
  const [kx, ky] = pt('aeolus_give', w.x, FLOOR + w.dy, 400, 412, 138, { rot: w.rot });
  eyeGlint(kx, ky, at(tC, 0.4) * (1 - at(tC + 1.4, 0.6)));
  ctx.restore();
}
function p05() {   // inside the bag: the bag fills the picture, straining; a cutaway in its belly shows every wind trapped, churning
  const tI = VW('l05', 'trapped') - 0.4, tC = VW('l05', 'course') - 0.3, t0 = SUB('p05');
  ctx.save(); cam(960, 560, 1.02 + 0.06 * EZ.io(pu('p05')));
  ground(FLOOR, { key: 5, bare: 1 });
  const b = bag(960, FLOOR, 560, { pulse: 0.4 + 0.6 * at(tI, 1), shake: 2 * at(tC, 0.5) });
  const ck = at(tI, 0.5);
  if (ck > 0) { const [cx, cy] = b.belly, r = b.r * 0.86 * EZ.o2(ck);
    const draw = () => { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip(); ctx.fillStyle = BF.ground; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      for (let i = 0; i < 4; i++) { const a0 = TT * (1.6 + i * 0.3) * (i % 2 ? -1 : 1) + i * 1.7, ox = cx + Math.cos(i * 1.9) * r * 0.42, oy = cy + Math.sin(i * 1.9) * r * 0.42; ctx.beginPath();
        for (let j = 0; j < 40; j++) { const th = a0 + j * 0.3 * (i % 2 ? -1 : 1), rr = 4 + j * r * 0.012; ctx.lineTo(ox + Math.cos(th) * rr, oy + Math.sin(th) * rr); }
        ctx.lineCap = 'round'; ctx.strokeStyle = BF.inc; ctx.lineWidth = 19; ctx.stroke(); ctx.strokeStyle = FIRE_COL; ctx.lineWidth = 14; ctx.stroke(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.8; ctx.stroke(); }
      ctx.restore(); ctx.save(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.restore(); };
    FGX ? fgRoute(draw)() : draw(); }
  // two little gusts poke at the knot and are held
  const [nx, ny] = b.neck; for (let i = 0; i < 2; i++) gust(nx, ny + 10, 70 + 30 * Math.sin(TT * 5 + i), -Math.PI / 2 + (i ? 0.6 : -0.6), at(t0 + 0.6, 0.6) * (0.6 + 0.4 * Math.sin(TT * 6 + i)), 60 + i, { n: 1, w: 8, speed: 2 });
  ctx.restore();
}
function p06() {   // only the west wind: one gust from the left fills the sail; the route to Ithaca is drawn
  const tW = VW('l06', 'west') - 0.3, tH = VW('l06', 'home') - 0.6, u = EZ.io(pu('p06'));
  ctx.save(); cam(960, 560, 1.02 + 0.04 * u);
  sea(702, { speed: 18 });
  coast(1760, 708, 140, { a: at(tH - 0.6, 1) });
  route([[760, 690], [1100, 670], [1400, 690], [1660, 680]], EZ.io(clamp((TT - tH) / 2)));
  const sx = 300 * EZ.io(clamp((TT - tW) / 5));
  gust(-120, 420, 760 + sx * 0.6, 0.08, at(tW, 0.8), 70, { n: 4, w: 14, speed: 0.8, spread: 90 });
  ship(560 + sx, 790, 460, { behind: (s) => { shipOdy(s, -0.3, 'ody_look', 150); bfLay('bag.webp', s.deck(0.05)[0], s.deck(0.05)[1], 70, { rot: s.rot }); } });
  ctx.restore();
}
function p07() {   // nine days and nights at the steering oar: suns and moons wheel, nine strokes are cut; the camera closes on him
  const tN = VW('l07', 'nine') - 0.2, tO = LT('l08') - 0.3, tT = VW('l08', 'trust') - 0.4;
  ctx.save(); cam(lerp(960, 720, at(tO, 3)), lerp(560, 520, at(tO, 3)), 1.02 + 0.3 * at(tO, 3.5));
  const yk = at(tN - 0.3, 0.8); if (yk > 0) for (let i = 0; i < 2; i++) { const ph = mod((TT - tN) / 1.1 + i * 0.5, 1), x = lerp(200, 2100, ph), y = 620 - Math.sin(Math.PI * ph) * 400;
    ctx.save(); ctx.globalAlpha *= yk * Math.sin(Math.PI * ph); if (i === 0) { bfDot(x, y, 40, BF.black); ctx.strokeStyle = BF.black; ctx.lineWidth = 4; for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + TT; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 52, y + Math.sin(a) * 52); ctx.lineTo(x + Math.cos(a) * 68, y + Math.sin(a) * 68); ctx.stroke(); } } else bfDot(x, y, 30, 'rgba(240,222,190,0.9)'); ctx.restore(); }
  sea(702, { speed: 20 });
  gust(-100, 380, 700, 0.06, 0.7, 71, { n: 3, w: 12, speed: 0.7 });
  ship(1000, 800, 760, { behind: (s) => { shipOdy(s, -0.36, 'ody_steer', 250, { rot: -0.02 * Math.sin(TT * 1.1) }); shipOdy(s, 0.12, 'sailor1', 150); shipOdy(s, 0.3, 'man_sack', 150); } });
  ctx.restore();
  tally(9, 1500, 140, tN, 0.12, { gap: 34, len: 60, w: 8 });
  // night falls on him for "the whole time" (the moon passes), lifts on "trust"
  tint('#140810', 0.25 * at(tO + 1, 1) * (1 - at(tT, 1)), 'multiply');
}
function p09() {   // on the tenth day, Ithaca: the island rises out of the horizon; Odysseus at the bow shades his eyes; his men see it too
  const tI = VW('l09', 'ithaca') - 0.5, t0 = SUB('p09');
  ctx.save(); cam(1100, 560, 1.02 + 0.06 * EZ.io(pu('p09')));
  birds(4, 300, 30, 9);
  tally(10, 960 - 4.5 * 34 - 10, 150, t0 - 2, 0.0, { gap: 34, len: 60, w: 8 });
  riseFrom(706, rise(tI - 0.4, 1.6), (dy) => coast(1560, 712 + dy * 0.4, 330));
  sea(702, { speed: 16 });
  ship(620, 800, 560, { behind: (s) => { shipOdy(s, 0.32, 'ody_look', 210); shipOdy(s, 0.05, 'sailor2', 170, { a: 1 }); shipOdy(s, -0.2, 'man_walk', 170); } });
  ctx.restore();
}
function p10() {   // close enough to see the smoke of the hearths and the people on the shore: a long push into the island
  const tS = VW('l10', 'smoke') - 0.5, tP = VW('l10', 'people') - 0.5;
  const z = lerp(1, 2.3, EZ.io(clamp((TT - SUB('p10')) / 4.5)));
  ctx.save(); cam(1430, 600, z);
  sea(712, { speed: 12 });
  coast(1430, 722, 560);
  // houses on the slopes and their hearth smoke
  for (const [hx, hy, s] of [[1330, 470, 1], [1470, 420, 0.9], [1580, 520, 1.1]]) { ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.4; ctx.translate(hx, hy); ctx.scale(s, s);
    ctx.fillRect(-26, -22, 52, 22); ctx.beginPath(); ctx.moveTo(-32, -20); ctx.lineTo(0, -38); ctx.lineTo(32, -20); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeRect(-5, -14, 10, 14); ctx.restore();
    smoke(hx + 12, hy - 36, 0.16, at(tS, 1), hx); }
  // people moving on the shore (tiny walkers along the waterline)
  const pk = at(tP, 0.8);
  [[1180, 1300, 0], [1500, 1380, 0.6], [1640, 1720, 1.1]].forEach(([x0, x1, d], i) => { const w = walk(x0, x1, tP + d, 3.4, 7, 2); fig(i === 1 ? 'man_sack' : 'man_walk', w.x, 712 + w.dy * 0.2, 38, { flip: x1 < x0, a: pk, rot: w.rot }); });
  ctx.restore();
}
function p11() {   // after nine days without sleep he closes his eyes: at the steering oar on deck, Ithaca on the horizon, he slumps asleep
  const tC = VW('l11', 'closed') - 0.4, tE = VW('l11', 'eyes');
  ctx.save(); cam(lerp(820, 600, at(tC, 2.5)), 600, 1.04 + 0.12 * at(tC, 2.5));
  deck({ ithaca: 1, ithacaX: 1100, ithacaH: 100, noOar: true });
  xf(tC, 0.9, (a) => fig('ody_steer', 520, DECK, 400, { a, rot: 0.03 * at(tC - 1.2, 1.2) }), (a) => fig('ody_sleep', 520, DECK + 4, 250, { a, still: true, sy: 1 + 0.015 * Math.sin(TT * 1.3) }));
  // the oar left alone swings loose
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.translate(140, 700); ctx.rotate(0.45 + 0.15 * at(tE, 1.5) * Math.sin(TT * 1.4)); ctx.fillRect(-7, -60, 14, 250); ctx.beginPath(); ctx.ellipse(0, 220, 22, 56, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  crew([{ n: 'sailor1', x: 1220, y: DECK, h: 260 }, { n: 'man_skin', x: 1400, y: DECK, h: 260, flip: true }]);
  ctx.restore();
  tint('#140810', 0.2 * at(tE, 1.4), 'multiply');
}
function p12() {   // his men look at the bag and start whispering
  const tL = VW('l12', 'looked') - 0.3, tW = VW('l12', 'whispering') - 0.4;
  ctx.save(); cam(lerp(960, 900, at(tW, 2)), 600, 1.06 + 0.06 * at(tW, 2));
  deck({ ithaca: 1, ithacaX: 1800, ithacaH: 100 });
  fig('ody_sleep', 260, DECK + 4, 220, { still: true, sy: 1 + 0.015 * Math.sin(TT * 1.3) });
  bag(1000, DECK, 230, { pulse: 0.3 });
  const lean = at(tL, 0.8);
  fig('sailor1', 1300, DECK, 290, { flip: true, rot: -0.06 * lean });
  xf(tW, 0.5, (a) => fig('man_walk', 700, DECK, 290, { a, rot: 0.04 * lean }), (a) => fig('man_whisper', 700, DECK, 230, { a, rot: 0.02 * Math.sin(TT * 2) }));
  fig('man_skin', 1480, DECK, 280, { flip: true, rot: -0.03 * lean });
  ctx.restore();
}
function p13() {   // gold, probably, or silver: the treasure they imagine glows over the bag; "empty-handed" — one shows his empty hands, one points at the sleeping king
  const tK = VW('l13', 'king') - 0.4, tG = VW('l13', 'gold') - 0.3, tS = VW('l13', 'silver') - 0.3, tF = VW('l14', 'fought') - 0.3, tE = VW('l14', 'emptyhanded') - 0.4;
  ctx.save(); cam2(lerp(900, 700, at(tF, 2)), 600, 1.08);
  deck({ ithaca: 1, ithacaX: 1800, ithacaH: 100 });
  fig('ody_sleep', 260, DECK + 4, 220, { still: true, sy: 1 + 0.015 * Math.sin(TT * 1.3) });
  const b = bag(1000, DECK, 230, { pulse: 0.3 });
  // the imagined treasure: cream outlines of cups and coins rising over the bag
  const gk = at(tG, 0.6) * (1 - at(tF, 0.8)), sk = at(tS, 0.6) * (1 - at(tF, 0.8));
  ctx.save(); ctx.lineWidth = 3;
  for (let i = 0; i < 7; i++) { const k = i < 4 ? gk : sk; if (k <= 0) continue; const R = RNG('gold', i), x = b.neck[0] + R.r(-200, 200), y = b.neck[1] - 60 - R.r(0, 200) - 20 * Math.sin(TT * 1.5 + i);
    ctx.globalAlpha = k * 0.9; ctx.strokeStyle = i < 4 ? 'rgb(240,190,90)' : 'rgb(240,222,190)';
    if (i % 2) { ctx.beginPath(); ctx.ellipse(x, y, 22, 22, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(x, y, 12, 12, 0, 0, TAU); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(x - 30, y - 20); ctx.quadraticCurveTo(x, y + 20, x + 30, y - 20); ctx.moveTo(x - 30, y - 20); ctx.lineTo(x + 30, y - 20); ctx.moveTo(x, y + 2); ctx.lineTo(x, y + 26); ctx.moveTo(x - 16, y + 26); ctx.lineTo(x + 16, y + 26); ctx.stroke(); } }
  ctx.restore();
  fig('man_whisper', 720, DECK, 230, { rot: 0.02 * Math.sin(TT * 2) });
  // on "king" one points at the sleeping Odysseus; on "empty-handed" another opens his empty hands
  xf(tK, 0.4, (a) => fig('sailor1', 1300, DECK, 290, { flip: true, a }), (a) => fig('sailor0', 1300, DECK, 290, { flip: true, a, rot: 0.02 * Math.sin(TT * 3) }));
  xf(tE, 0.4, (a) => fig('man_skin', 1480, DECK, 280, { flip: true, a }), (a) => fig('man_beg', 1500, DECK, 280, { flip: true, a, rot: 0.03 * Math.sin(TT * 4) }));
  ctx.restore();
}
function p15() {   // they untie the silver cord: a man kneels at the bag and pulls the cord loose; the bag swells
  const tU = VW('l15', 'untied') - 0.3, tC = VW('l15', 'cord') - 0.2;
  ctx.save(); cam(lerp(960, 1010, at(tU, 1.5)), 640, 1.08 + 0.2 * EZ.io(clamp((TT - SUB('p15')) / 2.4)));
  deck({ ithaca: 1, ithacaX: 1800, ithacaH: 100 });
  fig('ody_sleep', 260, DECK + 4, 220, { still: true });
  const loose = at(tC, 1.2), b = bag(1060, DECK, 260, { pulse: 0.4 + 1.2 * loose, sq: 1 + 0.06 * loose });
  fig('man_untie', 880, DECK, 250, { rot: 0.03 * Math.sin(TT * 5) * (1 - loose) - 0.06 * loose });
  // the cord: from the knot to his hands, it unwinds and goes slack
  const [nx, ny] = b.neck, hx = 920 + 30, hy = DECK - 150;
  cord([[nx, ny + 8], [lerp(nx - 20, hx + 40, loose), lerp(ny + 30, hy + 60 * loose, 0.6)], [hx + 20, hy + 40 * loose]], 1);
  for (let i = 0; i < 2; i++) gust(nx, ny, 80 + 70 * loose, -Math.PI / 2 + (i ? 0.5 : -0.5), loose, 80 + i, { n: 1, w: 9, speed: 2.4 });
  fig('sailor0', 1380, DECK, 280, { flip: true, rot: -0.04 });
  ctx.restore();
}
function p16() {   // every wind in the world at once: the bag bursts, gusts fly out in all directions, the men are thrown, the sail tears, Odysseus wakes
  const t0 = SUB('p16'), tO = VW('l16', 'once') - 0.2, tB = VW('l16', 'wind') - 0.3;
  const k = at(tB, 0.4);
  ctx.save(); cam(980, 600, 1.08 - 0.06 * k, 8 * k + shake(tO, 14, 1.0), 16);
  deck({ torn: TT > tB + 0.3, seaSpeed: 70, bump: (x, r) => -60 * k * Math.sin(x * 0.006 + TT * 3 + r) });
  burst(1060, DECK - 140, k, 16, 1100);
  bag(1060, DECK, 260, { sq: 1 - 0.55 * EZ.o2(k), pulse: 1 - k, a: 1 });
  const fly = (x, dir, n, h, d) => { const f = at(tB + d, 0.9); fig(n, x + dir * 260 * EZ.o2(f), DECK - 60 * Math.sin(Math.PI * Math.min(1, f)) * (1 - f * 0.5), h, { flip: dir > 0, rot: dir * 0.5 * EZ.o2(f) + 0.04 * Math.sin(TT * 12) * f }); };
  fly(860, -1, 'man_fear', 260, 0); fly(1300, 1, 'man_fear', 260, 0.1); fly(1500, 1, 'sailor2', 260, 0.2);
  xf(tO + 0.6, 0.4, (a) => fig('ody_sleep', 260, DECK + 4, 220, { a, still: true }), (a) => fig('ody_shout', 300, DECK, 360, { a, rot: 0.03 * Math.sin(TT * 9) }));
  ctx.restore();
  rain(k * 0.7, 0.6);
  tint('#1a0c10', 0.3 * k, 'multiply');
}
function p17() {   // the storm throws the fleet all the way back: ships hurled to the left over huge swells; the route runs back from Ithaca to the floating island
  const t0 = SUB('p17'), tA = VW('l17', 'aeolus') - 0.6, tBk = VW('l17', 'back') - 0.4;
  const b1 = bolt(t0 + 0.5, 1200), b2 = bolt(tBk, 500), u = EZ.io(pu('p17'));
  ctx.save(); cam(lerp(1100, 860, u), 540, 1.04, 5, 17);
  sea(700, { speed: 90, bump: (x, r) => -90 * Math.sin(x * 0.005 + TT * 2.4 + r * 0.5) * (1 - r * 0.12) });
  for (let i = 0; i < 5; i++) gust(W + 200, 260 + i * 90, 2200, Math.PI + 0.05 * Math.sin(TT + i), 1, 170 + i, { n: 3, w: 14, speed: 1.4, spread: 60 });
  coast(1820, 708, 120, { a: 1 - at(t0 + 2, 1.5) });
  bfLay('aeolus_island.webp', lerp(-600, 260, EZ.io(clamp((TT - tA) / 2))), 520 + 12 * Math.sin(TT), 300);
  route([[1760, 600], [1300, 640], [800, 600], [360, 560]], EZ.io(clamp((TT - t0 - 0.6) / (tA - t0))));
  [[1500, 790, 360, 0], [1100, 740, 260, 0.4], [1800, 750, 280, 0.8], [800, 800, 330, 1.2]].forEach(([x, yb, w, d], i) => { const lift = 90 * Math.sin(x * 0.005 + TT * 2.4) * 0.8;
    ship(x - 1200 * EZ.io(clamp((TT - t0 - d) / 6)), yb - lift, w, { flip: true, rot: 0.15 * Math.sin(TT * 2 + i) }); });
  fleet(960, 200, t0 - 1);
  ctx.restore();
  rain(1, 0.5);
  tint('#1a0c10', 0.35, 'multiply');
  const fl = Math.max(b1, b2); if (fl > 0) tint('#fff0d0', 0.3 * fl);
}
function p18() {   // he goes and begs Aeolus a second time: Aeolus on his seat; Odysseus walks in and falls to his knees
  const t0 = SUB('p18'), tBg = VW('l18', 'begged') - 0.3;
  ctx.save(); cam(960, 580, 1.06 + 0.06 * EZ.io(pu('p18')));
  palace();
  ground(FLOOR, { key: 18, bare: 1 });
  fig('aeolus_sit', 1380, FLOOR, 400, { flip: true });
  const w = walk(-400, 760, t0 + 0.1, Math.max(1.2, tBg - t0 - 0.2), 6, 8);
  xf(tBg, 0.5, (a) => fig('ody_look', w.x, FLOOR + w.dy, 370, { a, rot: w.rot }), (a) => fig('ody_kneel', 800, FLOOR, 300, { a, rot: 0.02 * Math.sin(TT * 3) }));
  ctx.restore();
}
function p19() {   // Aeolus stands and orders him out: "a man the gods hate that much..."; Odysseus turns and goes; a dark wash on "hate"
  const tO = VW('l19', 'out') - 0.5, tLk = VW('l19', 'look') - 0.4, tH = VW('l20', 'hate') - 0.3, tF = VW('l20', 'finger') - 0.4;
  ctx.save(); cam2(lerp(1000, 1200, at(tH, 2)), 560, 1.06 + 0.12 * at(tH, 2.5));
  palace();
  ground(FLOOR, { key: 19, bare: 1 });
  xf(tLk + 0.3, 0.5, (a) => fig('aeolus_sit', 1380, FLOOR, 400, { flip: true, a }), (a) => fig('aeolus_angry', 1360, FLOOR, 430, { a, rot: -0.02 * at(tO, 0.4) + 0.01 * Math.sin(TT * 2) }));
  const out = walk(800, -500, tO + 0.6, 3.6, 5, 6);
  xf(tO + 0.4, 0.4, (a) => fig('ody_kneel', 800, FLOOR, 300, { a }), (a) => fig('ody_look', out.x, FLOOR + out.dy, 380, { a, flip: true, rot: out.rot }));
  ctx.restore();
  tint('#1a0c10', 0.35 * at(tH, 0.8) * (1 - at(tF + 1, 1)), 'multiply');
}
function p21() {   // further than when they'd started: the ship far to the left, Ithaca's smoke far to the right; the dashed distance between them stretches
  const t0 = SUB('p21'), tS = VW('l21', 'smoke') - 0.4, tF = VW('l21', 'further') - 0.4, u = at(tF, 3);
  ctx.save(); cam(960, 600, 1.02);
  sea(702, { speed: 10 });
  coast(1700 + 60 * u, 708, 170 - 70 * u);
  smoke(1720 + 60 * u, 708 - 0.8 * (170 - 70 * u), 0.25, at(tS, 1), 21);
  const sx = 520 - 280 * u;
  ship(sx, 800, 440, { flip: true, behind: (s) => shipOdy(s, 0.25, 'ody_look', 190) });
  // the distance: a dashed line between ship and island, with arrow-heads
  const L = sx + 220, R = 1600 + 40 * u, dk = at(t0 + 0.8, 0.8);
  if (dk > 0) { ctx.save(); ctx.globalAlpha *= dk; ctx.strokeStyle = BF.black; ctx.lineWidth = 5; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.moveTo(L, 560); ctx.lineTo(R, 560); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(L + 26, 544); ctx.lineTo(L, 560); ctx.lineTo(L + 26, 576); ctx.moveTo(R - 26, 544); ctx.lineTo(R, 560); ctx.lineTo(R - 26, 576); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
// ---- 5 · THE LAESTRYGONIANS
function p22() {   // no wind now, so they rowed: a flat sea, the sail furled, the ship lunges forward stroke by stroke; the chapter title
  const t0 = SUB('p22'), tR = VW('l22', 'rowed') - 0.2;
  ctx.save(); cam(960, 560, 1.02 + 0.04 * EZ.io(pu('p22')));
  sea(702, { speed: 4 });
  const strokes = Math.max(0, TT - t0) * 0.75, pulse = Math.floor(strokes) + EZ.io(mod(strokes, 1));
  ship(380 + 70 * pulse, 800, 520, { behind: (s) => { shipOdy(s, -0.3, 'ody_look', 170); shipOdy(s, 0.0, 'man_sack', 150); shipOdy(s, 0.25, 'sailor2', 150); } });
  letters('V · THE LAESTRYGONIANS', 960, 300, t0 + 0.3, 72, { step: 0.04 }); void tR;
  ctx.restore();
}
function p23() {   // six days of it, to the harbour: the cliffs on both sides, the narrow mouth, the water as calm as a pond; six strokes are cut
  const t0 = SUB('p23'), tSix = VW('l23', 'six') - 0.2, tP = VW('l23', 'pond') - 0.4, u = EZ.io(pu('p23'));
  ctx.save(); cam(lerp(800, 1240, u), 560, 1.0 + 0.04 * u);
  birds(3, 260, 30, 23);
  harbour({ speed: lerp(10, 2, at(tP, 1.5)) });
  [[0, 800, 330], [0.6, 760, 260], [1.2, 800, 300]].forEach(([d, yb, w]) => ship(lerp(-300, 380 - d * 200, EZ.io(clamp((TT - t0 - d) / 6))), yb, w));
  tally(6, 1240 - 2.5 * 34 - 10, 150, tSix, 0.12, { gap: 34, len: 60, w: 8 });
  ctx.restore();
}
function p24() {   // eleven ships go in between the cliffs; Odysseus ties his own to a rock outside the entrance
  const t0 = SUB('p24'), tE = VW('l24', 'eleven') - 0.3, tT = VW('l25', 'tied') - 0.4, tR = VW('l25', 'rock') - 0.3;
  ctx.save(); cam2(lerp(1240, 900, at(LT('l25') - 0.3, 2)), 560, 1.0);
  harbour({ speed: 3 });
  // the eleven, in three rows between the cliffs
  for (let i = 0; i < 11; i++) { const [x1, yb, w] = HSHIP(i), k = EZ.io(clamp((TT - tE - i * 0.18) / 2.6));
    if (k > 0) ship(lerp(x1 - 900, x1, k), yb, w); }
  // his ship outside, its rope to a rock
  rock(440, 770, 36);
  const rk = EZ.o2(clamp((TT - tR) / 0.8));
  const s = ship(230, 830, 340, { behind: (s) => shipOdy(s, 0.2, 'ody_look', 150) });
  if (rk > 0) { const [ax, ay] = s.deck(0.45); ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(lerp(ax, 410, 0.5), 790, lerp(ax, 410, rk), lerp(ay, 770, rk)); ctx.stroke(); ctx.restore(); }
  letters('11', 1200, 300, tE, 120, { step: 0.12 });
  void tT;
  ctx.restore();
}
function p26() {   // the land of the Laestrygonians: giants rise behind the cliff tops; their king roars from the right-hand cliff
  const t0 = SUB('p26'), tL = VW('l26', 'laestrygonians') - 0.5, tG = VW('l26', 'giants') - 0.4, tC = VW('l26', 'cave') - 0.4;
  ctx.save(); cam(lerp(1100, 1300, at(tG, 3)), 560, 1.0 + 0.04 * at(tG, 3));
  harbour({ speed: 3, behind: () => {
    riseFrom(cliffTop(1500) + 2, rise(tL, 1.2), (dy) => fig('antiphates', 1500, cliffTop(1500) + dy, 260, { flip: true, rot: 0.02 * Math.sin(TT * 3) }));
    [[620, 0.3, 'giant_throw', false], [790, 0.6, 'giant_spear', false], [1680, 0.9, 'giant_throw', true]].forEach(([x, d, n, f]) => riseFrom(cliffTop(x) + 2, rise(tG + d, 1.1), (dy) => fig(n, x, cliffTop(x) + dy, 240, { flip: f })));
  } });
  for (let i = 0; i < 11; i++) { const [x, yb, w] = HSHIP(i); ship(x, yb, w); }
  rock(440, 770, 36); ship(230, 830, 340);
  void tC; void t0;
  ctx.restore();
}
function p27() {   // boulders from the cliffs, by the thousands: the giants hurl rocks, splashes leap up, the ships break like eggshells; eleven ships are struck from the tally
  const t0 = SUB('p27'), tT = VW('l27', 'threw') - 0.4, tE = VW('l27', 'eggshells') - 0.3;
  const hit = (i) => tT + 0.5 + i * 0.32;
  ctx.save(); cam(1200, 560, 1.0, shake(tE, 10, 1.2) + 2, 27);
  harbour({ speed: 8, front: () => {
    for (let j = 0; j < 6; j++) { const x = [580, 710, 840, 1450, 1590, 1720][j], f = x > 1300, tr = tT + j * 0.4, dip = Math.max(0, Math.sin((TT - tr) * 5)) * (TT > tr ? 1 : 0);
      fig(j === 3 ? 'antiphates' : 'giant_throw', x, cliffTop(x), j % 2 ? 225 : 245, { flip: f, sy: 1 - 0.05 * dip, rot: (f ? -1 : 1) * 0.08 * dip }); }
  } });
  for (let i = 0; i < 11; i++) { const [x, yb, w] = HSHIP(i), row = i % 3, th = hit(i);
    const src = i % 2 ? [1590, cliffTop(1590) - 210] : [710, cliffTop(710) - 210];
    if (TT < th + 0.9) boulder(src[0], src[1], x, yb - 50, th, 0.9, 24 + row * 5);
    if (TT < th + 0.9) ship(x, yb, w, { rot: 0.05 * Math.sin(TT * 3 + i) }); else brokenShip(x, yb, w, clamp((TT - th - 0.9) / 2.2), i);
    splash(x, SEA + 4, th + 0.9, 0.6 + row * 0.12, i); }
  rock(440, 770, 36); ship(230, 830, 340);
  ctx.restore();
}
function p28() {   // they spear the men in the water like fish: a giant on a ledge at the foot of the cliff thrusts down; the men in the water go under; the halves of hulls sink
  const t0 = SUB('p28'), tSp = VW('l28', 'speared') - 0.3, tH = VW('l28', 'home') - 0.4;
  ctx.save(); cam2(lerp(1140, 1300, at(tH, 2.5)), 600, 1.08);
  harbour({ speed: 10 });
  // the ledge at the foot of the right cliff
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(1250, 700); ctx.lineTo(1300, 652); ctx.lineTo(1700, 652); ctx.lineTo(1760, 700); ctx.lineTo(1760, 760); ctx.lineTo(1250, 760); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1.8; for (let k = 1; k < 3; k++) { ctx.beginPath(); ctx.moveTo(1290 + k * 20, 652 + k * 30); ctx.lineTo(1720 + k * 10, 652 + k * 30); ctx.stroke(); } ctx.restore();
  [[960, 0.0], [1120, 0.9]].forEach(([x, d], i) => brokenShip(x, 780, 200, clamp((TT - t0 + 1.5 - d) / 4), 40 + i));
  // the men in the water, one by one speared
  [[900, 0], [1030, 1.0], [1160, 2.0]].forEach(([x, d], i) => { const t = tSp + d, k = EZ.i2(clamp((TT - t - 0.4) / 0.6)); clipAbove(SEA + 30, () => fig('man_swim', x + 8 * Math.sin(TT * 3 + i), SEA + 70 + 120 * k, 130, { rot: 0.08 * Math.sin(TT * 4 + i) })); });
  const thrust = Math.max(0, Math.sin((TT - tSp) * 2.6 * Math.PI / 2)) * (TT > tSp && TT < tH ? 1 : 0);
  // he spears them, then on "home" turns and walks off up the ledge
  const w = walk(1420, 2400, tH + 0.3, 3.4, 4, 6);
  if (TT < tH) fig('giant_spear', 1420 - 30 * thrust, 652, 380, { rot: 0.04 * thrust }); else turnFig('giant_spear', w.x, 652 + w.dy, 380, tH, { rot: w.rot, d: 0.3, flip: true });
  ctx.restore();
}
function p29() {   // Odysseus cuts the mooring rope with his sword and shouts to row: the rope parts, the ship pulls away; boulders still fall behind
  const t0 = SUB('p29'), tC = VW('l29', 'cut') - 0.3, tS = VW('l29', 'screamed') - 0.3, tR = VW('l29', 'row') - 0.2;
  ctx.save(); cam2(lerp(560, 360, at(tR, 2)), 620, 1.25 + 0.05 * at(tS, 2));
  harbour({ speed: 12 });
  for (let i = 0; i < 4; i++) splash(960 + i * 110, SEA + 4, t0 + 0.4 + i * 0.9, 0.8, 90 + i);
  rock(440, 770, 36);
  const cut = TT > tC + 0.3, away = EZ.io(clamp((TT - tR) / 4));
  const s = ship(300 - 600 * away, 830, 420, { flip: true, behind: (s) => {
    const [dx, dy] = s.deck(-0.2);
    xf(tS, 0.4, (a) => fig('ody_sword', dx, dy, 190, { a, flip: true, rot: s.rot }), (a) => fig('ody_shout', dx, dy, 190, { a, flip: true, rot: s.rot }));
    shipOdy(s, 0.15, 'sailor2', 150); shipOdy(s, 0.35, 'man_fear', 150); } });
  const [ax, ay] = s.deck(-0.45);
  ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 5;
  if (!cut) { ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo((ax + 410) / 2, 800, 410, 770); ctx.stroke(); }
  else { const f = clamp((TT - tC - 0.3) / 0.8); ctx.beginPath(); ctx.moveTo(410, 770); ctx.quadraticCurveTo(390, 770 + 40 * f, 370, 770 + 80 * f); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(ax + 40, ay + 60 * f, ax + 60, ay + 80 * f); ctx.stroke(); }
  ctx.restore();
  ctx.restore();
}
function p30() {   // the only ship that got away: alone on the open sea; the tally — twelve ships, one left, about forty men
  const t0 = SUB('p30'), tO = VW('l30', 'only') - 0.3, tL = VW('l31', 'left') - 0.3, tF = VW('l31', 'forty') - 0.3, u = EZ.io(pu('p30'));
  ctx.save(); cam(960, 560, 1.0 + 0.05 * u);
  sea(702, { speed: 16 });
  ship(lerp(600, 1100, u), 800, 480, { behind: (s) => { shipOdy(s, -0.3, 'ody_look', 190); shipOdy(s, 0.1, 'sailor1', 150); shipOdy(s, 0.32, 'man_fear', 150); } });
  fleet(960, 200, t0 + 0.2, (i) => (i < 11 ? t0 + 1.0 + i * 0.12 : Infinity), { hi: 11, hiT: tO });
  letters('1 OF 12', 960, 340, tL, 96, { step: 0.08 });
  letters('ABOUT 40 MEN', 960, 430, tF, 56, { step: 0.05 });
  ctx.restore();
}


// =====================================================================
//  captions: Dalek Pinpoint Bold 40px, cream, a soft black drop shadow, centred low in the picture (baseline 898).
//  One phrase at a time (≤ 9 words, one line), each word written on its spoken word; the last one slides out with its panel.
// =====================================================================
const CAP_FONT = '"Dalek Pinpoint", "DalekPinpointBold", Georgia, serif', CAP_SIZE = 40, CAP_Y = 898, CAP_COL = 'rgb(240,222,190)';
const PAT = (t) => { let p = IDS[0]; for (let i = 0; i < IDS.length; i++) if (t >= TB[i] - 0.3) p = IDS[i]; return p; };
const KCH = [], FUNC = new Set(['and', 'the', 'a', 'of', 'to', 'with', 'in', 'on', 'at', 'his', 'her', 'for', 'that', 'it', 'he', 'they', 'into', 'from', 'as', 'under', 'over', 'if', 'but', 'so']);
for (const L of VOICE.lines) { const ws = L.text.split(/\s+/); let cur = null; const mine = [];
  ws.forEach((w, i) => { const t = L.words[i] ? L.words[i].t0 : L.t0; if (!cur) { cur = { id: L.id, p: PAT(t), ws: [], ts: [] }; mine.push(cur); } cur.ws.push(w); cur.ts.push(t);
    const n = cur.ws.length, chars = cur.ws.join(' ').length, left = ws.length - 1 - i;
    if ((/[.?!]$/.test(w)) || (/[,:;]$/.test(w) && n >= 3 && left >= 2)) cur = null;
    else if (n >= 8 || chars > 44) { if (n >= 4 && FUNC.has(w.toLowerCase())) { cur.ws.pop(); cur.ts.pop(); cur = { id: L.id, p: PAT(t), ws: [w], ts: [t] }; mine.push(cur); } else cur = null; } });
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
const FULL_SET = new Set(['p03', 'p04', 'p11', 'p12', 'p13', 'p15', 'p16', 'p18', 'p19', 'p24', 'p26', 'p27', 'p28', 'p29']);   // panels that fill the picture with a set   // how far the outgoing panel drifts during a slide (fraction of the width)
const FG_SET = new Set(['troy_walls.webp', 'troy_city.webp', 'temple.webp', 'coast.webp', 'ship_beached']), JUNK = document.createElement('canvas'); JUNK.width = JUNK.height = 2;
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
  if (BF_PDX > 0) ctx.rect(Math.max(0, BF_PDX - 480), PIC0, Math.min(BF_PDX, 480), PIC1 - PIC0); else ctx.rect(BF_PDX + W, PIC0, Math.min(-BF_PDX, 480), PIC1 - PIC0);   // only outside its own panel, within 480 px of the seam
  ctx.clip(); ctx.drawImage(OVC, 0, 0); ctx.restore();
}
const PANELS = { p01, p02, p03, p04, p05, p06, p07, p09, p10, p11, p12, p13, p15, p16, p17, p18, p19, p21, p22, p23, p24, p26, p27, p28, p29, p30 };
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
const BOARD_AT = { p01: ['l01', 'turned'], p02: ['l02', 'winds'], p03: ['l03', 'troy'], p04: ['l04', 'cord'], p05: ['l05', 'course'], p06: ['l06', 'home'],
  p07: ['l08', 'trust'], p09: ['l09', 'ithaca'], p10: ['l10', 'shore'], p11: ['l11', 'eyes'], p12: ['l12', 'whispering'], p13: ['l13', 'silver'],
  p15: ['l15', 'cord'], p16: ['l16', 'once'], p17: ['l17', 'aeolus'], p18: ['l18', 'time'], p19: ['l20', 'finger'], p21: ['l21', 'started'],
  p22: ['l22', 'rowed'], p23: ['l23', 'pond'], p24: ['l25', 'entrance'], p26: ['l26', 'cave'], p27: ['l27', 'eggshells'], p28: ['l28', 'fish'], p29: ['l29', 'sword'], p30: ['l31', 'board'] };
TIMELINE.board = IDS.map((id, i) => { const [l, w, n] = BOARD_AT[id]; const t = Math.min(VW(l, w, n) + 0.6, SUBEND(id) - 0.6); return { t: Math.round(t * FPS) / FPS, title: id, sound: '', next: '' }; });
