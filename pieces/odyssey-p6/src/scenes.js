// =====================================================================
//  SCENES — Odyssey p6: Ithaca, Penelope's Bed (the end) (amphora-bf, Flow layers, 16:9). The ground and its friezes (assets/bg.jpg) are fixed on screen;
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
function mountain(o = {}) {
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
  if (!o.noCave) { ctx.fillStyle = '#060304'; ctx.beginPath(); ctx.ellipse(1520, 300, 62, 46, 0, Math.PI, 0); ctx.lineTo(1582, 330); ctx.lineTo(1458, 330); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2.4; ctx.stroke(); }
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
  if (o.furled) { ctx.save(); ctx.translate(mx, yT + 7); ctx.rotate(-0.42); ctx.translate(-mx, -yT - 7); }
  ctx.fillRect(mx - 260, yT - 14, 520, 14); ctx.strokeRect(mx - 260, yT - 14, 520, 14);
  if (o.furled) ctx.restore();
  if (o.torn) { for (let i = 0; i < 5; i++) { const R = RNG('tr', i), fx = mx - 250 + i * 110, fl = 30 * Math.sin(TT * 14 + i * 2);
      ctx.beginPath(); ctx.moveTo(fx, yT); ctx.quadraticCurveTo(fx + 50 + fl, yT + 70, fx + 100 + fl * 2, yT + 50 + R.r(0, 110)); ctx.lineTo(fx + 26, yT + 2); ctx.closePath(); ctx.fill(); ctx.stroke(); } }
  else if (o.furled) { ctx.save(); ctx.translate(mx, yT + 7); ctx.rotate(-0.42); ctx.translate(-mx, -yT - 7); ctx.beginPath(); ctx.roundRect(mx - 250, yT, 500, 30, 14); ctx.fill(); ctx.stroke(); for (let j = 1; j < 6; j++) { ctx.beginPath(); ctx.moveTo(mx - 250 + j * 84, yT); ctx.lineTo(mx - 250 + j * 84, yT + 30); ctx.stroke(); } ctx.restore(); }
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
//  PART 3 helpers: trees and the forest, the low wooded island, Circe's hall, the sty, moly, the pit of the dead,
//  ghosts, the darkness of the underworld, memory roundels
// =====================================================================
// a native point given as fractions of a layer's size -> panel coordinates
const ptf = (n, x, y, h, fx, fy, o = {}) => { const [nw, nh] = nat(n); return pt(n, x, y, h, fx * nw, fy * nh, o); };
// a tree (code): a tapered trunk with two boughs and a crown of overlapping round masses, an incised outline and leaf marks
function tree(x, yb, h, o = {}) {
  const R = RNG('tree' + Math.round(x) + (o.key ?? '')), sw = 0.008 * Math.sin(TT * 0.9 + x * 0.01), fill = o.far ? '#22120c' : BF.black;
  ctx.save(); ctx.translate(x, yb); ctx.rotate(sw); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.fillStyle = fill; ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(-h * 0.06, 0); ctx.quadraticCurveTo(-h * 0.025, -h * 0.28, -h * 0.03, -h * 0.55); ctx.lineTo(h * 0.03, -h * 0.55); ctx.quadraticCurveTo(h * 0.025, -h * 0.28, h * 0.07, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = fill; ctx.lineWidth = h * 0.022; ctx.beginPath(); ctx.moveTo(0, -h * 0.4); ctx.lineTo(-h * 0.16, -h * 0.6); ctx.moveTo(0, -h * 0.46); ctx.lineTo(h * 0.15, -h * 0.64); ctx.stroke();
  const B = []; for (let i = 0; i < 8; i++) B.push([R.r(-0.24, 0.24) * h, -h * (0.66 + R.r(0, 0.22)) + Math.abs(R.r(-0.24, 0.24)) * h * 0.25, h * R.r(0.13, 0.2)]);
  ctx.fillStyle = BF.inc; for (const [bx, by, r] of B) { ctx.beginPath(); ctx.arc(bx, by, r + 2.6, 0, TAU); ctx.fill(); }
  ctx.fillStyle = fill; for (const [bx, by, r] of B) { ctx.beginPath(); ctx.arc(bx, by, r, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.4;
  for (let j = 0; j < 14; j++) { const [bx, by, r] = B[j % B.length], a = R.r(0, TAU), d = R.r(0.2, 0.7) * r, lx = bx + Math.cos(a) * d, ly = by + Math.sin(a) * d; ctx.beginPath(); ctx.arc(lx, ly, r * 0.18, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
  ctx.restore();
}
// the forest floor with a far row of trees (lighter brown) and the near trees at the given x (kept clear of the figures)
function forest(key, near = [], o = {}) {
  const R = RNG('fr' + key);
  if (!o.noFar) for (let x = -360 + R.r(0, 160); x < W + 360; x += R.r(330, 470)) tree(x, FLOOR + 2, R.r(330, 450), { far: 1, key });
  ground(FLOOR, { key, sand: o.sand });
  for (const [x, h] of near) tree(x, FLOOR + 6, h ?? 600, { key: key + 'n' });
}
// the low wooded island of Aeaea on the horizon, with a thread of smoke from the middle of its forest
function island(x, yb, smokeK = 1, s = 1) {
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(x - 520 * s, yb + 6); ctx.bezierCurveTo(x - 380 * s, yb - 70 * s, x - 160 * s, yb - 96 * s, x, yb - 100 * s); ctx.bezierCurveTo(x + 180 * s, yb - 96 * s, x + 380 * s, yb - 70 * s, x + 520 * s, yb + 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  for (let i = 0; i < 9; i++) { const tx = x - 400 * s + i * 100 * s, ty = yb - (100 - Math.abs(tx - x) / (5.2 * s) * 0.9) * s + 8; tree(tx, ty, (120 + 40 * Math.sin(i * 2.1)) * s, { key: 'is' + i }); }
  smoke(x + 20 * s, yb - 150 * s, 0.4 * s, smokeK, 61);
}
// Circe's hall: the column hall, a beam, a tapestry with a meander hung between columns, a tripod brazier with a low fire
function circeHall(o = {}) {
  hall();
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  for (const cx of o.cloths ?? [1250]) { ctx.fillRect(cx - 120, 250, 240, 300); ctx.strokeRect(cx - 120, 250, 240, 300);
    ctx.beginPath(); for (let i = 0; i < 6; i++) { const x = cx - 105 + i * 36; ctx.moveTo(x, 520); ctx.lineTo(x, 500); ctx.lineTo(x + 24, 500); ctx.lineTo(x + 24, 512); ctx.lineTo(x + 12, 512); } ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, 380, 50, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, 380, 30, 0, TAU); ctx.stroke(); }
  ctx.restore();
  ground(FLOOR, { key: o.key ?? 'ch', bare: 1 });
  if (o.fire !== false) { const fx = o.fireX ?? 1760; ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(fx - 50, FLOOR); ctx.lineTo(fx, FLOOR - 120); ctx.lineTo(fx + 50, FLOOR); ctx.moveTo(fx, FLOOR); ctx.lineTo(fx, FLOOR - 120); ctx.stroke();
    ctx.fillStyle = BF.black; ctx.beginPath(); ctx.ellipse(fx, FLOOR - 124, 70, 18, 0, 0, Math.PI); ctx.fill(); ctx.restore(); fireAt(fx, FLOOR - 128, 0.55, 1, 7); }
}
// the sty: a fence of rough posts and two rails in front of whoever is inside
function sty(x0, x1, y = FLOOR, o = {}) {
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.8; const R = RNG('sty' + x0);
  for (const ry of [y - 150, y - 80]) { ctx.save(); ctx.translate(0, ry); ctx.beginPath(); ctx.moveTo(x0, -8); for (let x = x0; x <= x1; x += 60) ctx.lineTo(x, -8 + R.r(-2, 2)); ctx.lineTo(x1, 8); for (let x = x1; x >= x0; x -= 60) ctx.lineTo(x, 8 + R.r(-2, 2)); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  for (let x = x0; x <= x1 + 1; x += (x1 - x0) / (o.n ?? 6)) { ctx.beginPath(); ctx.moveTo(x - 11, y + 4); ctx.lineTo(x - 9, y - 180); ctx.lineTo(x, y - 192); ctx.lineTo(x + 9, y - 180); ctx.lineTo(x + 11, y + 4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
// acorns thrown in an arc: from (x0, y0) at t, landing near x1
function acorns(x0, y0, x1, t, n = 6, key = 0) {
  for (let i = 0; i < n; i++) { const R = RNG('ac' + key, i), u = clamp((TT - t - i * 0.12) / 0.8); if (u <= 0) continue;
    const tx = x1 + R.r(-160, 160), ty = FLOOR - 6; const x = lerp(x0, tx, u), y = lerp(y0, ty, u * u) - Math.sin(Math.PI * u) * 140;
    ctx.save(); ctx.translate(x, y); ctx.rotate(TT * 5 * (1 - u) + i); ctx.fillStyle = FIRE_COL; ctx.beginPath(); ctx.ellipse(0, 0, 7, 10, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.4; ctx.stroke(); ctx.fillStyle = BF.black; ctx.fillRect(-7, -12, 14, 5); ctx.restore(); }
}
// magic: cream sparks swirling at (x, y), k = strength
function sparks(x, y, k, key = 0, r = 50) {
  if (k <= 0) return; glow(x, y, r * 1.6, 'rgba(255,236,200,A)', 0.35 * k, 'lighter');
  for (let i = 0; i < 9; i++) { const R = RNG('sp' + key, i), a = TT * R.r(2, 4) * (i % 2 ? 1 : -1) + R.r(0, TAU), d = r * (0.3 + 0.7 * mod(TT * 0.8 + R.f(), 1));
    bfDot(x + Math.cos(a) * d, y + Math.sin(a) * d, R.r(2, 4.5), `rgba(255,240,210,${0.9 * k})`); }
}
// song: cream curls drifting up from a singer's mouth
function song(x, y, k, key = 0) {
  if (k <= 0) return; ctx.save(); ctx.strokeStyle = 'rgb(240,222,190)'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const ph = mod(TT * 0.45 + i / 4, 1), px = x + 20 + ph * 220, py = y - ph * 170 + 10 * Math.sin(TT * 3 + i);
    ctx.globalAlpha = k * Math.sin(Math.PI * ph); ctx.beginPath(); for (let j = 0; j < 14; j++) { const th = j * 0.5 + TT * 2 + i, rr = 2 + j * 1.3; ctx.lineTo(px + Math.cos(th) * rr, py + Math.sin(th) * rr * 0.8); } ctx.stroke(); }
  ctx.restore();
}
// moly: a thin stem with narrow leaves, a white star flower and a black tangled root (code, the figures' black)
function moly(x, y, h, kRoot = 0, kFlower = 0) {
  ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // root below the ground point
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 9; const R = RNG('moly'); const roots = [];
  for (let i = 0; i < 6; i++) { const P = [[0, 0]]; let px = 0, py = 0; for (let j = 0; j < 6; j++) { px += R.r(-0.07, 0.07) * h + (i - 2.5) * 0.012 * h; py += R.r(0.04, 0.07) * h; P.push([px, py]); } roots.push(P); }
  for (const P of roots) { ctx.beginPath(); P.forEach(([a, b], j) => (j ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); }
  ctx.strokeStyle = BF.black; ctx.lineWidth = 6; for (const P of roots) { ctx.beginPath(); P.forEach(([a, b], j) => (j ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); }
  if (kRoot > 0) glow(0, h * 0.18, h * 0.3, 'rgba(229,125,54,A)', 0.5 * kRoot * (0.7 + 0.3 * Math.sin(TT * 6)), 'lighter');
  // stem and leaves
  ctx.strokeStyle = BF.black; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(h * 0.04, -h * 0.4, 0, -h * 0.78); ctx.stroke();
  ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.6;
  for (const [ly, dir] of [[-0.2, -1], [-0.34, 1], [-0.5, -1], [-0.6, 1]]) { ctx.save(); ctx.translate(h * 0.02, ly * h); ctx.rotate(dir * 0.9); ctx.beginPath(); ctx.ellipse(0, -h * 0.09, h * 0.022, h * 0.1, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
  // the white flower
  const fk = 0.55 + 0.45 * EZ.o2(clamp(kFlower)); ctx.save(); ctx.translate(0, -h * 0.8); ctx.rotate(0.1 * Math.sin(TT));
  if (kFlower > 0) glow(0, 0, h * 0.2, 'rgba(255,240,210,A)', 0.4 * kFlower, 'lighter');
  ctx.fillStyle = 'rgb(240,226,198)'; ctx.strokeStyle = BF.black; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate(i / 6 * TAU); ctx.beginPath(); ctx.ellipse(0, -h * 0.05 * fk, h * 0.018 * fk + 2, h * 0.05 * fk, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
  bfDot(0, 0, h * 0.014 + 2, BF.black); ctx.restore();
  ctx.restore();
}
// a memory roundel: a cream-ringed disc of paper above the scene, its contents drawn inside, opening from the centre
function roundel(x, y, r, k, f) {
  if (k <= 0) return; const rr = r * EZ.o2(clamp(k));
  const draw = () => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.fillStyle = BF.ground; ctx.fill(); ctx.clip(); f(); ctx.restore();
    ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.stroke(); ctx.strokeStyle = 'rgb(240,222,190)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, rr - 9), 0, TAU); ctx.stroke(); ctx.restore(); };
  FGX ? fgRoute(draw)() : draw();
}
// the underworld: a deep wash over the paper, a low far ridge, mist bands drifting, the dark ground
function hades(key, o = {}) {
  tint('#2a1016', o.k ?? 0.5, 'multiply');
  ctx.save(); ctx.fillStyle = '#1a0d0c'; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-400, 760); for (let x = -400; x <= W + 400; x += 80) ctx.lineTo(x, 740 + 26 * Math.sin(x * 0.004 + 1) + 14 * Math.sin(x * 0.013)); ctx.lineTo(W + 400, FLOOR); ctx.lineTo(-400, FLOOR); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  ground(FLOOR, { key, bare: 1 });
  ctx.save(); ctx.strokeStyle = 'rgba(240,222,190,0.1)'; ctx.lineWidth = 18; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const y = 300 + i * 110, sp = 20 + i * 8; ctx.beginPath(); for (let x = -400; x <= W + 400; x += 40) { const xx = x + mod(TT * sp, 160) - 80; const yy = y + 12 * Math.sin(xx * 0.008 + TT * 0.6 + i); x === -400 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy); } ctx.stroke(); }
  ctx.restore();
}
// the pit of the offerings: a dark hole in the ground with an incised rim, a heap of dug earth, a liquid level
const PX = 860, PY = FLOOR - 14;
function pit(open = 1, fill = 0, col = '#5a160d') {
  if (open <= 0) return; const k = EZ.o2(clamp(open)), rx = 150 * k, ry = 22 * k;
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.2;
  // the dug earth heaped round the hole: a low mound with stones
  ctx.beginPath(); ctx.moveTo(PX - rx - 70, FLOOR + 2); ctx.quadraticCurveTo(PX - rx - 20, PY - 40 * k, PX, PY - 30 * k); ctx.quadraticCurveTo(PX + rx + 20, PY - 40 * k, PX + rx + 70, FLOOR + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  const R = RNG('pit'); for (let i = 0; i < 7; i++) { const x = PX - rx - 30 + i * (rx * 2 + 60) / 6, y = FLOOR - 6 - R.r(0, 10); ctx.beginPath(); ctx.ellipse(x, y, 12, 6, 0, Math.PI, TAU); ctx.stroke(); }
  // the hole
  ctx.fillStyle = '#050203'; ctx.beginPath(); ctx.ellipse(PX, PY, rx, ry, 0, 0, TAU); ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
  if (fill > 0) { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(PX, PY + 3, rx * 0.82 * clamp(fill), ry * 0.66 * clamp(fill), 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(240,222,190,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(PX - 20, PY, rx * 0.4 * clamp(fill), ry * 0.25, 0, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke(); }
  ctx.restore();
}
// a pouring stream from (x, y) down into the pit
function pour(x, y, k, col, w = 7, dots = false) {
  if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k);
  if (dots) { for (let i = 0; i < 14; i++) { const ph = mod(TT * 1.6 + i / 14, 1), xx = lerp(x, PX - 30, ph) + 6 * Math.sin(i * 3), yy = lerp(y, PY, ph * ph); bfDot(xx, yy, 3.5, col); } }
  else { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 40, y + 10, PX - 30 + 4 * Math.sin(TT * 9), PY - 2); ctx.stroke(); ctx.strokeStyle = BF.black; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
// a ghost: a Flow figure seen through, with a soft cream haze behind it; solid 0..1 makes it whole (after the blood)
function ghost(n, x, y, h, o = {}) {
  const a = o.a ?? 1; if (a <= 0) return; const k = clamp(o.solid ?? 0), bob = 4 * Math.sin(TT * 1.3 + x * 0.02);
  glow(x, y - h * 0.55, h * 0.55, 'rgba(240,222,190,A)', 0.16 * a * (1 - 0.7 * k), 'lighter');
  fig(n, x, y + bob * (1 - k), h, { ...o, a: a * (0.58 + 0.42 * k) });
}
// a crowd of the dead at the back: small ghosts in rows rising out of the ground
const GHOSTS = ['shade', 'ghost_bride', 'ghost_old', 'ghost_youth', 'ghost_soldier'];
function deadCrowd(t, n, o = {}) {
  for (let i = 0; i < n; i++) { const R = RNG('dc' + (o.key ?? 0), i), row = i % 3, x = (o.x0 ?? 1000) + R.r(0, o.span ?? 1000), h = [150, 190, 240][row] * (o.s ?? 1), yb = FLOOR - [70, 40, 0][row];
    const nm = GHOSTS[i % GHOSTS.length], push = (o.push ?? 0) * (1 - row * 0.3);
    riseFrom(yb + 2, rise(t + R.r(0, o.spread ?? 2), 1.2), (dy) => ghost(nm, x - push, yb + dy, h, { flip: nm === 'shade', a: (o.a ?? 0.8) * [0.75, 0.88, 1][row] })); }
}
// Odysseus guarding the pit with his sword out (thrust 0..1 jabs it forward)
function guard(x, thrust = 0, o = {}) { fig('ody_guard', x + 30 * thrust, FLOOR, o.h ?? 270, { rot: 0.03 * thrust, a: o.a }); }
const OX = 520;


// =====================================================================
//  PART 4 helpers: the Sirens' isle, the deck with the furled mast, Charybdis, Scylla's cliff, the scales, the black sun,
//  the hides, the spits, the fig tree
// =====================================================================
const CREAM = 'rgb(240,222,190)';
// the Sirens' isle: a rocky mound in the sea, grass, little cream flowers, two perching rocks; returns the perches
function sirenIsle(x, s = 1, o = {}) {
  const yb = SEA + 10, top = SEA - 160 * s, R = RNG('isle');
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(x - 560 * s, yb); ctx.bezierCurveTo(x - 420 * s, top + 40 * s, x - 220 * s, top, x, top - 6 * s); ctx.bezierCurveTo(x + 220 * s, top, x + 420 * s, top + 40 * s, x + 560 * s, yb); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.clip(); ctx.lineWidth = 1.6;
  for (let k = 0; k < 4; k++) { ctx.beginPath(); for (let xx = x - 520 * s; xx <= x + 520 * s; xx += 20) { const yy = top + (40 + k * 34) * s + Math.abs(xx - x) * 0.18 + 4 * Math.sin(xx * 0.03 + k); xx === x - 520 * s ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy); } ctx.stroke(); }
  ctx.restore();
  // grass tufts and flowers along the crest
  ctx.strokeStyle = BF.black; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  for (let i = 0; i < 22; i++) { const xx = x + R.r(-430, 430) * s, yy = top + Math.pow(Math.abs(xx - x) / (440 * s), 2) * 90 * s + 2, sw = 2 * Math.sin(TT * 1.4 + i);
    ctx.beginPath(); for (let j = 0; j < 3; j++) { ctx.moveTo(xx + j * 5, yy); ctx.lineTo(xx + j * 5 - 5 + j * 5 + sw, yy - R.r(10, 20) * s); } ctx.stroke();
    if (i % 3 === 0) { bfDot(xx + 4, yy - 22 * s, 5 * s, CREAM); bfDot(xx + 4, yy - 22 * s, 1.8 * s, BF.black); } }
  ctx.restore();
  if (o.bones) bfLay('bones.webp', x + (o.bonesX ?? 0) * s, top + 28 * s, 120 * s * o.bones, { a: Math.min(1, o.bones * 1.5) });
  crag(x - 190 * s, top + 30 * s, 150 * s, 80 * s, 1); crag(x + 200 * s, top + 34 * s, 130 * s, 70 * s, 2);
  return { a: [x - 190 * s, top + 30 * s - 78 * s], b: [x + 200 * s, top + 34 * s - 68 * s] };
}
// a crag: a jagged outcrop of rock (flat-topped where a siren perches) with incised cracks
function crag(x, yb, w, h, key) {
  const Rr = RNG('crag' + key), P = [[-w / 2, 0], [-w * 0.42, -h * 0.45], [-w * 0.3, -h * 0.7], [-w * 0.16, -h * 0.98], [w * 0.14, -h], [w * 0.26, -h * 0.78], [w * 0.4, -h * 0.5], [w / 2, 0]];
  ctx.save(); ctx.translate(x, yb); ctx.beginPath(); P.forEach(([a, b], i) => (i ? ctx.lineTo(a, b + Rr.r(-3, 3)) : ctx.moveTo(a, b))); ctx.closePath();
  ctx.fillStyle = BF.black; ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.lineWidth = 1.8; for (let i = 0; i < 4; i++) { const cx = Rr.r(-w * 0.3, w * 0.3); ctx.beginPath(); ctx.moveTo(cx, -h * Rr.r(0.5, 0.85)); ctx.lineTo(cx + Rr.r(-12, 12), -h * Rr.r(0.25, 0.45)); ctx.lineTo(cx + Rr.r(-8, 8), -h * 0.05); ctx.stroke(); }
  ctx.restore();
}
// a siren on her perch, singing; k = the song's strength
function siren(n, x, y, h, k = 1, o = {}) {
  fig(n, x, y, h, { ...o, rot: (o.rot ?? 0) + 0.02 * Math.sin(TT * 1.6 + x) });
  const [mx, my] = ptf(n, x, y, h, n === 'siren_a' ? 0.1 : 0.2, 0.1, { flip: o.flip }); if (k > 0) song(o.flip ? mx - 220 : mx - 20, my, k, x);
}
// song curls flowing from right to left (toward the ship), for the panels where the song reaches them
function songStream(x0, x1, y, k, key = 0) {
  if (k <= 0) return; ctx.save(); ctx.strokeStyle = CREAM; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const ph = mod(TT * 0.22 + i / 9, 1), px = lerp(x0, x1, ph), py = y + 40 * Math.sin(ph * 7 + i * 1.3 + TT * 0.6) + (i % 3) * 30 - 30;
    ctx.globalAlpha = k * Math.sin(Math.PI * ph); ctx.beginPath(); for (let j = 0; j < 14; j++) { const th = j * 0.5 + TT * 2 + i, rr = 2 + j * 1.3; ctx.lineTo(px + Math.cos(th) * rr, py + Math.sin(th) * rr * 0.8); } ctx.stroke(); }
  ctx.restore();
}
// Odysseus at the mast on deck: the mast (code) runs on up behind his layer; strain 0..1 crossfades to the shouting pose
const TIED_H = 470, MAST_OFF = 23;
function tiedOdy(x, strain = 0, o = {}) {
  const sh = strain > 0.5 ? 4 * Math.sin(TT * 37) * (o.shake ?? 1) : 0;
  xf(o.tS ?? 1e9, 0.35, (a) => fig('ody_tied', x, DECK, TIED_H, { a, still: true }), (a) => fig('ody_strain', x + sh, DECK, TIED_H, { a, still: true, rot: 0.01 * Math.sin(TT * 9) * strain }));
}
// extra rope wraps pulled round him (cream-brown, incised), k = how far they are wound
function wraps(x, k, o = {}) {
  if (k <= 0) return; const mx = x + MAST_OFF; ctx.save(); ctx.lineCap = 'round';
  for (const [y, w] of o.at ?? [[DECK - 300, 70], [DECK - 230, 66], [DECK - 40, 40]]) {
    const tight = (o.tight ?? 0) * 6;
    ctx.strokeStyle = BF.black; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(mx - 20, y, (w - tight) * k, 12, 0, 0.1, Math.PI - 0.1); ctx.stroke();
    ctx.strokeStyle = '#b8642c'; ctx.lineWidth = 4; ctx.stroke(); }
  ctx.restore();
}
// Charybdis: the whirlpool layer squashed onto the sea and turning; k = how wide it opens, suck = how fast it turns
function whirl(x, y, w, k = 1, suck = 1) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.3);
  bfLay('charybdis.webp', 0, 0, w * EZ.o2(clamp(k)), { ay: 0.5, rot: -TT * 0.9 * suck });
  ctx.restore();
  // a dark hollow at its eye
  ctx.save(); ctx.globalAlpha *= clamp(k) * 0.8; ctx.fillStyle = '#050203'; ctx.beginPath(); ctx.ellipse(x, y, w * 0.07 * suck, w * 0.022 * suck, 0, 0, TAU); ctx.fill(); ctx.restore();
}
// Scylla's cliff (the Flow layer from the Scylla short): the heads sway on their necks
function scyllaCliff(x, yb, h, o = {}) {
  const [nw, nh] = nat('scylla'), w = h * nw / nh, d = o.flip ? -1 : 1, ex = x + d * w * 0.455;
  bfLay('scylla.webp', x, yb, h, { flip: o.flip, rot: 0.004 * Math.sin(TT * 0.9), a: o.a });
  // the rest of the cliff, out to the frame edge (over the layer's own ring there): the same black rock with incised cracks
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.fillStyle = '#010101'; ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.6; ctx.lineJoin = 'round';
  const far = d > 0 ? W + 400 : -400; ctx.fillRect(Math.min(ex, far) - 1, yb - h * 0.995, Math.abs(far - ex) + 2, h * 0.995);
  // cracks like the layer's own: long wandering fissures running down the face, with short branches
  const Rc = RNG('scy' + Math.round(x)); for (let i = 0; i < 14; i++) { let cx = ex + d * Rc.r(30, 420), cy = yb - h * Rc.r(0.25, 0.98); ctx.beginPath(); ctx.moveTo(cx, cy);
    const n = Rc.i ? 6 : 6; for (let j = 0; j < n; j++) { cx += Rc.r(-16, 16); cy += Rc.r(24, 60); if (cy > yb - 6) break; ctx.lineTo(cx, cy); if (j === 2) { ctx.lineTo(cx + Rc.r(-30, 30), cy + Rc.r(10, 30)); ctx.moveTo(cx, cy); } } ctx.stroke(); }
  ctx.restore();
}
// one of the six necks coming down from above with its head; y = where the jaws are; man = a sailor in its jaws
function neck(i, x, y, h) { bfLay('head' + i + '.webp', x, y, h, { rot: 0.03 * Math.sin(TT * 2.2 + i * 1.3) }); }
// the scales: a beam on a post, two pans; tilt > 0 = the right pan is heavier
function scales(cx, top, tilt, L, R) {
  const ang = 0.22 * tilt, bw = 480, hang = 190;
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - 12, top); ctx.lineTo(cx + 12, top); ctx.lineTo(cx + 18, FLOOR); ctx.lineTo(cx - 18, FLOOR); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 110, FLOOR); ctx.lineTo(cx + 110, FLOOR); ctx.lineTo(cx + 60, FLOOR - 30); ctx.lineTo(cx - 60, FLOOR - 30); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.translate(cx, top); ctx.rotate(ang); ctx.fillRect(-bw, -8, bw * 2, 16); ctx.strokeRect(-bw, -8, bw * 2, 16); ctx.restore();
  bfDot(cx, top, 16, BF.black);
  const ends = [-1, 1].map((d) => [cx + d * bw * Math.cos(ang), top + d * bw * Math.sin(ang)]);
  ends.forEach(([ex, ey], j) => { ctx.strokeStyle = BF.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 120, ey + hang); ctx.moveTo(ex, ey); ctx.lineTo(ex + 120, ey + hang); ctx.stroke();
    ctx.fillStyle = BF.black; ctx.beginPath(); ctx.ellipse(ex, ey + hang, 150, 22, 0, 0, Math.PI); ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.stroke();
    (j ? R : L)(ex, ey + hang); });
  ctx.restore();
}
// the black sun with turning rays (as in part 3's prophecy)
function blackSun(x, y, r, k = 1) {
  if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k); bfDot(x, y, r, BF.black); ctx.strokeStyle = BF.black; ctx.lineWidth = r * 0.09; ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + TT * 0.25; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 1.25); ctx.lineTo(x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75); ctx.stroke(); }
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, TAU); ctx.stroke(); ctx.restore();
}
// the island of the Sun: a long green-quiet mound with trees; the cattle graze on it
function sunIsle(x, w, k = 1) {
  ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = '#100a0a'; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(x - w / 2, SEA + 10); ctx.bezierCurveTo(x - w * 0.3, SEA - 110, x + w * 0.3, SEA - 110, x + w / 2, SEA + 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  for (const f of [-0.36, -0.22, 0.3]) tree(x + f * w, SEA - 70 + Math.abs(f) * 90, 150 + 40 * Math.abs(f), { key: 'si' + f });
}
// the beach of the island: sand, the shore line, the sea behind
function beach(o = {}) { sea(SEA, { speed: o.speed ?? 10, x0: o.seaX ?? 1180 }); ground(FLOOR, { sand: 1, key: o.key ?? 'bch', x1: o.x1 ?? 1200, slope: 0 }); }
// a cooking fire with spits over it: forked posts, the bar, meat that can shake (moo)
function spitFire(x, k = 1, moo = 0, key = 0) {
  fireAt(x, FLOOR, 0.6, k, key); smoke(x + 10, FLOOR - 160, 0.7, k, key);
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.black; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (const d of [-130, 130]) { ctx.beginPath(); ctx.moveTo(x + d, FLOOR); ctx.lineTo(x + d, FLOOR - 170); ctx.moveTo(x + d, FLOOR - 150); ctx.lineTo(x + d - 16, FLOOR - 186); ctx.moveTo(x + d, FLOOR - 150); ctx.lineTo(x + d + 16, FLOOR - 186); ctx.stroke(); }
  const sy = FLOOR - 168 + moo * 6 * Math.sin(TT * 23); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 160, sy); ctx.lineTo(x + 160, sy); ctx.stroke();
  for (let i = 0; i < 4; i++) { const mx = x - 90 + i * 60, j = moo * 5 * Math.sin(TT * 29 + i * 2); ctx.save(); ctx.translate(mx + j, sy); ctx.rotate(moo * 0.12 * Math.sin(TT * 17 + i)); ctx.beginPath(); ctx.ellipse(0, 0, 26, 20, 0, 0, TAU); ctx.fillStyle = FIRE_COL; ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
  ctx.restore();
  if (moo > 0) for (let i = 0; i < 3; i++) moo1(x - 80 + i * 70, sy - 40, moo, key * 3 + i);
}
// a "moo": an open cream ring swelling up and fading
function moo1(x, y, k, key) { const ph = mod(TT * 0.9 + key * 0.37, 1); ctx.save(); ctx.globalAlpha = k * (1 - ph); ctx.strokeStyle = CREAM; ctx.lineWidth = 3; for (let r = 0; r < 3; r++) { ctx.beginPath(); ctx.arc(x, y - ph * 80, 10 + ph * 30 + r * 10, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); } ctx.restore(); }
// a man thrown off the ship into the sea: an arc from (x0, y0) to the water at x1, then a splash
function thrown(n, x0, y0, x1, t, h, key) {
  const u = clamp((TT - t) / 1.0); if (TT < t) { fig(n, x0, y0, h); return; }
  if (u < 1) fig(n, lerp(x0, x1, u), lerp(y0, SEA + 40, u * u) - Math.sin(Math.PI * u) * 160, h, { rot: u * 2.2 * (x1 > x0 ? 1 : -1), still: true });
  splash(x1, SEA + 8, t + 1.0, 0.6, key);
}
// a swimmer bobbing on the swell, going under at tu
function bobber(x, t, tu, key, h = 120) { const k = at(t, 0.5); if (k <= 0) return; const dn = 120 * EZ.i2(clamp((TT - tu) / 1.4)); clipAbove(SEA + 26, () => fig(key % 2 ? 'man_swim' : 'man_swim', x + 20 * Math.sin(TT * 0.8 + key), SEA + 70 + dn + 6 * Math.sin(TT * 2 + key), h, { a: k, flip: key % 2 === 1, rot: 0.06 * Math.sin(TT * 3 + key) })); }
// the strait: the left headland (from part 2) and Scylla's cliff on the right, Charybdis in the water on the left
function strait(o = {}) {
  headland(-1);
  scyllaCliff(o.cx ?? 1700, SEA + 60, o.ch ?? 760, { a: o.scylla ?? 1 });
  sea(SEA, { speed: o.speed ?? 14, bump: o.bump });
  if (o.whirl !== false) whirl(o.wx ?? 560, SEA + 60, o.ww ?? 760, o.whirl ?? 1, o.suck ?? 1);
}

// =====================================================================
//  PART 5 helpers: Calypso's cave and its springs, tears, the leaf bed, bushes, the river, the ball, the feast table,
//  the Phaeacian hall, the gifts, the hawk, the raft breaking up, the story told (a conveyor of roundels)
// =====================================================================
// a spring: a thin stream of water in the figures' brown with an incised edge, falling from (x, y) to the ground, its
// ripples rolling down it, a little pool at the foot
function spring(x, y, len, k = 1, key = 0) {
  if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k); ctx.lineCap = 'round';
  const P = []; for (let i = 0; i <= 16; i++) { const u = i / 16; P.push([x + 8 * Math.sin(u * 5 + key) + u * u * 14, y + u * len]); }
  const line = (w, c) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); P.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); };
  line(12, BF.inc); line(8, FIRE_COL);
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.6; for (let j = 0; j < 4; j++) { const ph = mod(TT * 0.9 + j / 4 + key * 0.3, 1), i = Math.floor(ph * 15), [a, b] = P[i]; ctx.beginPath(); ctx.moveTo(a - 3, b); ctx.lineTo(a + 3, b + 6); ctx.stroke(); }
  const [ex, ey] = P[16]; for (let r = 0; r < 2; r++) { const ph = mod(TT * 0.7 + r / 2, 1); ctx.globalAlpha = clamp(k) * (1 - ph); ctx.beginPath(); ctx.ellipse(ex, ey + 2, 14 + ph * 40, 3 + ph * 6, 0, 0, TAU); ctx.stroke(); }
  ctx.restore();
}
// Calypso's cave (the Flow set): the hill with its vine-hung mouth; four springs run down its face; returns the mouth
function cave5(x, yb, h, o = {}) {
  const [nw, nh] = nat('calypso_cave'), w = h * nw / nh;
  bfLay('calypso_cave.webp', x, yb, h, { a: o.a });
  const L = (fx, fy, fl, k) => spring(x - w / 2 + fx * w, yb - h + fy * h, fl * h, o.a ?? 1, k);
  L(0.14, 0.55, 0.3, 1); L(0.3, 0.52, 0.34, 2); L(0.71, 0.52, 0.34, 3); L(0.86, 0.6, 0.26, 4);
  return { mouth: [x, yb - h * 0.08], w };
}
// tears: cream drops falling from (x, y)
function tears(x, y, k, key = 0) {
  if (k <= 0) return;
  for (let i = 0; i < 4; i++) { const ph = mod(TT * 0.8 + i / 4 + key * 0.13, 1); bfDot(x + (i % 2 ? 6 : -4) + 4 * ph, y + ph * 70, 4.5 * (1 - 0.4 * ph), `rgba(240,222,190,${k * Math.sin(Math.PI * ph)})`); }
}
// a heap of dry leaves (the figures' brown, incised), k = how high it is piled
function leaves(x, y, w, k, key = 0) {
  if (k <= 0) return; const R = RNG('lv' + key), n = Math.round(90 * clamp(k));
  ctx.save(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.4;
  for (let i = 0; i < n; i++) { const u = R.r(-1, 1), hgt = (1 - u * u) * 120 * clamp(k), lx = x + u * w / 2, ly = y - R.r(0, hgt), a = R.r(0, TAU), s = R.r(10, 18), fall = clamp((TT - (k < 1 ? 0 : 0)) / 1);
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(a + 0.05 * Math.sin(TT * 1.5 + i)); ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.42, 0, 0, TAU); ctx.fillStyle = i % 3 ? FIRE_COL : '#1a0d0a'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.stroke(); ctx.restore(); void fall; }
  ctx.restore();
}
// a few leaves drifting down onto (x, y)
function leafFall(x, y, k, key = 0) { if (k <= 0) return; ctx.save(); ctx.fillStyle = FIRE_COL; ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.2;
  for (let i = 0; i < 7; i++) { const R = RNG('lf' + key, i), ph = mod(TT * 0.35 + R.f(), 1), lx = x + R.r(-160, 160) + 40 * Math.sin(TT * 2 + i), ly = y - 380 + ph * 380; ctx.globalAlpha = k * Math.sin(Math.PI * ph); ctx.save(); ctx.translate(lx, ly); ctx.rotate(TT * 2 + i); ctx.beginPath(); ctx.ellipse(0, 0, 12, 5, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.restore(); }
// a bush: overlapping black masses with leaf marks, sitting on the ground; shake makes it rustle
function bush(x, yb, s = 1, shake = 0, key = 0) {
  const R = RNG('bu' + key); ctx.save(); ctx.translate(x + shake * 6 * Math.sin(TT * 23), yb); ctx.scale(s, s);
  const B = []; for (let i = 0; i < 7; i++) B.push([R.r(-120, 120), -R.r(40, 150), R.r(50, 80)]);
  ctx.fillStyle = BF.inc; for (const [bx, by, r] of B) { ctx.beginPath(); ctx.arc(bx, Math.min(by, -r * 0.6), r + 2.6 / s, 0, TAU); ctx.fill(); }
  ctx.fillStyle = BF.black; for (const [bx, by, r] of B) { ctx.beginPath(); ctx.arc(bx, Math.min(by, -r * 0.6), r, 0, TAU); ctx.fill(); }
  ctx.fillRect(-150, -40, 300, 40);
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.6 / s; for (let j = 0; j < 22; j++) { const [bx, by, r] = B[j % B.length], a = R.r(0, TAU), d = R.r(0.2, 0.7) * r, lx = bx + Math.cos(a) * d, ly = Math.min(by, -r * 0.6) + Math.sin(a) * d; ctx.beginPath(); ctx.arc(lx, ly, r * 0.16, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
  ctx.restore();
}
// the river: a band of dark water across the front of the picture, its swell lines running right toward the sea
function river(y0, sp = 40) {
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.fillRect(-1600, y0, W + 3200, PIC1 + 300 - y0); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-1600, y0); ctx.lineTo(W + 1600, y0); ctx.stroke();
  ctx.lineWidth = 1.8; for (let r = 0; r < 3; r++) { const y = y0 + 16 + r * 22; for (let x0 = -1600 + mod(TT * sp * (1 + r * 0.3), 180); x0 < W + 1600; x0 += 180) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo(x0 + 30, y - 5, x0 + 70, y); ctx.stroke(); } }
  ctx.restore();
}
// the ball: a little black ball with incised seams, flying in an arc from (x0, y0) to (x1, y1) over d seconds from t
function ballAt(x, y, r = 16) { bfDot(x, y, r, BF.black); ctx.save(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(x - r * 0.4, y, r * 0.75, -1.1, 1.1); ctx.stroke(); ctx.restore(); }
function ballArc(x0, y0, x1, y1, t, d, hgt = 260) { const u = clamp((TT - t) / d); ballAt(lerp(x0, x1, u), lerp(y0, y1, u) - Math.sin(Math.PI * u) * hgt); return u; }
// the Phaeacian hall: the column hall with bronze plates, a bare floor, a tripod brazier
function phaeHall(o = {}) {
  palace();
  ground(FLOOR, { key: o.key ?? 'ph', bare: 1 });
  if (o.fire !== false) { const fx = o.fireX ?? 960; ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(fx - 50, FLOOR); ctx.lineTo(fx, FLOOR - 120); ctx.lineTo(fx + 50, FLOOR); ctx.moveTo(fx, FLOOR); ctx.lineTo(fx, FLOOR - 120); ctx.stroke();
    ctx.fillStyle = BF.black; ctx.beginPath(); ctx.ellipse(fx, FLOOR - 124, 70, 18, 0, 0, Math.PI); ctx.fill(); ctx.restore(); fireAt(fx, FLOOR - 128, 0.55, o.fireK ?? 1, 7); }
}
// a low feast table with cups and loaves (code)
function table(x, w = 300) {
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  const y = FLOOR - 120; ctx.fillRect(x - w / 2, y, w, 16); ctx.strokeRect(x - w / 2, y, w, 16);
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + d * (w / 2 - 24), y + 16); ctx.lineTo(x + d * (w / 2 - 30), FLOOR); ctx.lineTo(x + d * (w / 2 - 18), FLOOR); ctx.lineTo(x + d * (w / 2 - 12), y + 16); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  // a kylix, a jug and two loaves
  ctx.beginPath(); ctx.ellipse(x - w * 0.25, y - 14, 30, 8, 0, 0, Math.PI); ctx.fill(); ctx.stroke(); ctx.fillRect(x - w * 0.25 - 4, y - 8, 8, 8);
  ctx.beginPath(); ctx.moveTo(x + w * 0.1 - 16, y); ctx.quadraticCurveTo(x + w * 0.1 - 26, y - 40, x + w * 0.1 - 8, y - 56); ctx.lineTo(x + w * 0.1 + 8, y - 56); ctx.quadraticCurveTo(x + w * 0.1 + 26, y - 40, x + w * 0.1 + 16, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (const lx of [x + w * 0.3, x + w * 0.4]) { ctx.beginPath(); ctx.ellipse(lx, y - 10, 20, 11, 0, Math.PI, TAU); ctx.fillStyle = FIRE_COL; ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
// the gifts: a bronze tripod, a chest, two jars (code)
function gifts(x, y, k = 1) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(1.4, 1.4); x = 0; y = 0; ctx.globalAlpha *= clamp(k); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  // tripod
  ctx.beginPath(); ctx.ellipse(x, y - 110, 60, 22, 0, 0, Math.PI); ctx.fill(); ctx.stroke(); for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(x + d * 40, y - 100); ctx.lineTo(x + d * 56, y); ctx.lineWidth = 6; ctx.strokeStyle = BF.black; ctx.stroke(); } ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(x + d * 48, y - 122, 14, Math.PI, 0); ctx.stroke(); }
  // chest
  ctx.fillRect(x + 90, y - 70, 120, 70); ctx.strokeRect(x + 90, y - 70, 120, 70); ctx.beginPath(); ctx.moveTo(x + 90, y - 50); ctx.lineTo(x + 210, y - 50); ctx.stroke(); bfDot(x + 150, y - 36, 6, BF.inc);
  // jars
  for (const [jx, s] of [[x - 120, 1], [x - 190, 0.8]]) { ctx.beginPath(); ctx.moveTo(jx - 14 * s, y - 110 * s); ctx.quadraticCurveTo(jx - 60 * s, y - 60 * s, jx - 10 * s, y); ctx.lineTo(jx + 10 * s, y); ctx.quadraticCurveTo(jx + 60 * s, y - 60 * s, jx + 14 * s, y - 110 * s); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(jx - 36 * s, y - 70 * s); ctx.lineTo(jx + 36 * s, y - 70 * s); ctx.stroke(); }
  ctx.restore();
}
// a hawk: a black bird with spread wings (code), gliding
function hawk(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const fl = 10 * Math.sin(TT * 7); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.6 / s;
  ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(18, -6); ctx.quadraticCurveTo(-10, -60 - fl, -60, -40 - fl); ctx.quadraticCurveTo(-20, -18, -40, -4); ctx.lineTo(-70, 4); ctx.lineTo(-40, 8); ctx.quadraticCurveTo(-20, 22, -60, 44 + fl); ctx.quadraticCurveTo(-10, 40 + fl, 18, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
// the raft breaking up: the raft layer cut in three strips that drift apart, tip and sink
function brokenRaft(x, yb, h, k) {
  const [nw, nh] = nat('raft_sail'), w = h * nw / nh;
  for (let j = 0; j < 3; j++) clipAbove(SEA + 30, () => { ctx.save(); const d = j - 1; ctx.translate(x + d * 120 * k, yb + 140 * EZ.i2(clamp(k * 1.2 - j * 0.1))); ctx.rotate(d * 0.5 * EZ.o2(k) + (j === 1 ? -0.4 * k : 0)); ctx.beginPath(); ctx.rect(-w / 2 + j * w / 3, -h * 1.2, w / 3, h * 1.4); ctx.clip(); bfLay('raft_sail.webp', 0, 0, h); ctx.restore(); });
}
// the story told: roundels of the earlier chapters passing right to left along y, one after another from t
const STORY = [['ciconian', 1.2], ['lotus_eater', 1.0], ['cyclops_sit', 1.15], ['bag', 0.9], ['giant_throw', 1.2], ['circe_wand', 1.2], ['tiresias', 1.2], ['siren_a', 1.1], ['scylla', 1.2], ['cow', 0.75], ['calypso_stand', 1.25]];
function storyBand(y, t, dur, r = 120, k = 1) {
  const n = STORY.length, gap = 300, span = (n - 1) * gap + W + 2 * r, u = clamp((TT - t) / dur), off = W + r - u * span;
  STORY.forEach(([nm, s], i) => { const x = off + i * gap; if (x < -r - 10 || x > W + r + 10) return;
    roundel(x, y, r, k, () => { if (nm === 'scylla') { sea(y + r * 0.45, { speed: 10 }); bfLay('scylla.webp', x + 20, y + r * 0.6, r * 1.5); } else { ground(y + r * 0.62, { key: 'sb' + i, bare: 1 }); fig(nm, x, y + r * 0.62, r * 1.3 * s, { still: true }); } }); });
}
// a beach on the right, the sea behind it on the left (for the shore he is thrown up on, and Ithaca)
function shoreL(o = {}) { sea(SEA, { speed: o.speed ?? 10 }); ground(FLOOR, { sand: 1, key: o.key ?? 'sh', x0: o.x0 ?? 700, slope: 140 }); }


// =====================================================================
//  PART 6 helpers: the hall of Ithaca with its brazier, the loom and the shroud, the palace gate, the dung heap and its
//  flies, the little town, the bow, arrows, the twelve axes, things thrown, the locked doors, the stairs, the held sun
// =====================================================================
// a tripod brazier with a code fire (the figures' brown)
function brazier(fx, k = 1, key = 7) {
  ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(fx - 50, FLOOR); ctx.lineTo(fx, FLOOR - 120); ctx.lineTo(fx + 50, FLOOR); ctx.moveTo(fx, FLOOR); ctx.lineTo(fx, FLOOR - 120); ctx.stroke();
  ctx.fillStyle = BF.black; ctx.beginPath(); ctx.ellipse(fx, FLOOR - 124, 70, 18, 0, 0, Math.PI); ctx.fill(); ctx.restore();
  fireAt(fx, FLOOR - 128, 0.55, k, key);
}
// Odysseus's hall on Ithaca (the column hall of part 1), a bare floor, an optional brazier
function ithHall(o = {}) {
  hall(); ground(FLOOR, { key: o.key ?? 'ih', bare: 1 });
  if (o.fireX != null) brazier(o.fireX, o.fireK ?? 1, o.fireKey ?? 7);
}
// a meander band (incised key pattern) from x0 to x1 at y, cell size s
function meander(x0, x1, y, s = 14, col = BF.inc) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let x = x0; x + s * 2 <= x1; x += s * 2) { ctx.moveTo(x, y + s); ctx.lineTo(x, y); ctx.lineTo(x + s * 1.5, y); ctx.lineTo(x + s * 1.5, y + s * 0.7); ctx.lineTo(x + s * 0.6, y + s * 0.7); ctx.lineTo(x + s * 0.6, y + s * 0.35); }
  ctx.stroke(); ctx.beginPath(); ctx.moveTo(x0, y - 4); ctx.lineTo(x1, y - 4); ctx.moveTo(x0, y + s + 4); ctx.lineTo(x1, y + s + 4); ctx.stroke(); ctx.restore();
}
// the loom: two black uprights and a beam, the warp threads with their clay weights, the shroud woven down to k (0..1)
const LOOM_TOP = 300;
function loom(x, k, o = {}) {
  const w = o.w ?? 300, top = LOOM_TOP, bot = FLOOR - 70, kk = clamp(k);
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  for (const d of [-1, 1]) { const ux = x + d * (w / 2 + 10); ctx.beginPath(); ctx.moveTo(ux - 9, top - 40); ctx.lineTo(ux + 9, top - 40); ctx.lineTo(ux + 13, FLOOR); ctx.lineTo(ux - 13, FLOOR); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.fillRect(x - w / 2 - 36, top - 18, w + 72, 24); ctx.strokeRect(x - w / 2 - 36, top - 18, w + 72, 24);
  ctx.strokeStyle = BF.black; ctx.lineWidth = 1.6;
  for (let i = 0; i <= 22; i++) { const xx = x - w / 2 + 12 + i * (w - 24) / 22, sw = 2 * Math.sin(TT * 1.3 + i); ctx.beginPath(); ctx.moveTo(xx, top + 6); ctx.lineTo(xx + sw, bot); ctx.stroke(); bfDot(xx + sw, bot + 12 + (i % 2) * 10, 7, BF.black); }
  const ch = (bot - top - 30) * kk;
  if (ch > 1) { ctx.fillStyle = FIRE_COL; ctx.fillRect(x - w / 2 + 6, top + 6, w - 12, ch); ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.2;
    ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2 + 6, top + 6, w - 12, ch); ctx.clip();
    for (let y = top + 70; y < top + ch; y += 16) { ctx.beginPath(); ctx.moveTo(x - w / 2 + 8, y); ctx.lineTo(x + w / 2 - 8, y); ctx.stroke(); }
    meander(x - w / 2 + 16, x + w / 2 - 16, top + 24, 14); ctx.restore();
    ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x - w / 2 + 6, top + 6 + ch); ctx.lineTo(x + w / 2 - 6, top + 6 + ch); ctx.stroke(); }
  ctx.restore();
  return { edge: top + 6 + ch, w };
}
// a clay lamp with a small flame (night work)
function lamp(x, y, k = 1) { ctx.save(); ctx.fillStyle = BF.black; ctx.beginPath(); ctx.ellipse(x, y, 28, 11, 0, 0, TAU); ctx.fill(); ctx.fillRect(x + 18, y - 6, 18, 8); ctx.restore(); fireAt(x + 34, y - 6, 0.16, k, 31); glow(x + 34, y - 30, 240, 'rgba(255,222,170,A)', 0.35 * k, 'lighter'); }
// a dark wash for night with the lamp's pool of light kept
function nightRoom(k, lx, ly) { if (k <= 0) return; tint('#140810', 0.62 * k, 'multiply'); glow(lx, ly, 380, 'rgba(255,222,170,A)', 0.22 * k, 'lighter'); }
// the gate of the palace: stone courses on the paper, a beam with dentils, two columns round a dark doorway
const GATE = [1200, 1500];
function gateSet(o = {}) {
  ctx.save(); ctx.strokeStyle = 'rgba(23,11,18,0.42)'; ctx.lineWidth = 2;
  for (let r = 0, y = FLOOR - 64; y > 250; r++, y -= 64) { ctx.beginPath(); ctx.moveTo(-400, y); ctx.lineTo(W + 400, y); ctx.stroke(); for (let x = -400 + (r % 2) * 70; x < W + 400; x += 140) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 64); ctx.stroke(); } }
  ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.fillRect(-400, 200, W + 800, 56); for (let x = -380; x < W + 400; x += 34) ctx.strokeRect(x, 214, 18, 18);
  ctx.fillStyle = '#0d0607'; ctx.fillRect(GATE[0], 360, GATE[1] - GATE[0], FLOOR - 360);
  ctx.fillStyle = BF.black; ctx.fillRect(GATE[0] - 90, 320, GATE[1] - GATE[0] + 180, 44); ctx.strokeRect(GATE[0] - 90, 320, GATE[1] - GATE[0] + 180, 44);
  for (const cx of [GATE[0] - 44, GATE[1] + 44]) { ctx.fillRect(cx - 42, 364, 84, 22); ctx.strokeRect(cx - 42, 364, 84, 22); ctx.beginPath(); ctx.moveTo(cx - 32, 386); ctx.lineTo(cx - 38, FLOOR); ctx.lineTo(cx + 38, FLOOR); ctx.lineTo(cx + 32, 386); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let j = -2; j <= 2; j++) { ctx.beginPath(); ctx.moveTo(cx + j * 11, 392); ctx.lineTo(cx + j * 12.5, FLOOR - 8); ctx.stroke(); } }
  // the open door leaves inside the doorway
  ctx.fillStyle = '#1c0f0b'; for (const [ex, d] of [[GATE[0], 1], [GATE[1], -1]]) { ctx.beginPath(); ctx.moveTo(ex, 360); ctx.lineTo(ex + d * 40, 380); ctx.lineTo(ex + d * 40, FLOOR - 10); ctx.lineTo(ex, FLOOR); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.restore();
  ground(FLOOR, { key: o.key ?? 'gate' });
}
// the dung heap: a low mound in the figures' brown with incised straw strokes
function dung(x, w = 380, h = 70) {
  const R = RNG('dung'); ctx.save(); ctx.fillStyle = FIRE_COL; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - w / 2, FLOOR + 4); for (let i = 0; i <= 24; i++) { const u = i / 24; ctx.lineTo(x - w / 2 + u * w, FLOOR + 4 - Math.sin(Math.PI * u) * h * (0.9 + 0.1 * Math.sin(i * 2.3))); } ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 1.4; for (let i = 0; i < 30; i++) { const u = R.r(0.08, 0.92), yy = FLOOR - R.r(4, Math.sin(Math.PI * u) * h * 0.85), xx = x - w / 2 + u * w, a = R.r(-0.8, 0.8); ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + Math.cos(a) * 14, yy + Math.sin(a) * 6); ctx.stroke(); }
  ctx.restore();
}
// flies: black specks buzzing round (x, y)
function flies(x, y, k, key = 0, n = 9) { if (k <= 0) return; for (let i = 0; i < n; i++) { const R = RNG('fl' + key, i), ph = TT * R.r(2, 4) + R.r(0, TAU); bfDot(x + Math.cos(ph) * R.r(30, 120), y + Math.sin(ph * 1.3) * R.r(20, 60), 3, `rgba(16,8,8,${k})`); } }
// the little town: low houses on the slope behind (black blocks with incised doors and tiled roofs)
function town(key = 0, yb = FLOOR - 110) {
  const R = RNG('town' + key); ctx.save(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  ctx.fillStyle = '#100a0a'; ctx.beginPath(); ctx.moveTo(-400, yb + 30); ctx.quadraticCurveTo(W / 2, yb - 40, W + 400, yb + 10); ctx.lineTo(W + 400, FLOOR); ctx.lineTo(-400, FLOOR); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (let x = -300; x < W + 300; x += R.r(190, 260)) { const w = R.r(120, 180), h = R.r(110, 170), y = yb + 30 - 70 * Math.sin(Math.PI * clamp((x + 400) / (W + 800))) + 10; ctx.fillStyle = BF.black;
    ctx.fillRect(x, y - h, w, h); ctx.strokeRect(x, y - h, w, h); ctx.beginPath(); ctx.moveTo(x - 12, y - h); ctx.lineTo(x + w / 2, y - h - 40); ctx.lineTo(x + w + 12, y - h); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let j = 1; j < 4; j++) { ctx.beginPath(); ctx.moveTo(x - 12 + j * 6, y - h - j * 9); ctx.lineTo(x + w + 12 - j * 6, y - h - j * 9); ctx.stroke(); }
    ctx.strokeRect(x + w * 0.4, y - 56, w * 0.22, 56); ctx.strokeRect(x + w * 0.12, y - h + 26, 18, 18); }
  ctx.restore();
}
// a bow (code): a black recurved stave; bend 0..1, strung draws the string
function bowC(x, y, len, rot = 0, bend = 0.3, strung = true) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.lineCap = 'round';
  const L = len / 2, b = len * 0.18 * (0.5 + bend);
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 17; const path = () => { ctx.beginPath(); ctx.moveTo(-12, -L); ctx.quadraticCurveTo(b * 2.1, 0, -12, L); ctx.moveTo(-12, -L); ctx.lineTo(-24, -L - 12); ctx.moveTo(-12, L); ctx.lineTo(-24, L + 12); }; path(); ctx.stroke();
  ctx.strokeStyle = BF.black; ctx.lineWidth = 12; path(); ctx.stroke();
  if (strung) { ctx.strokeStyle = BF.black; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, -L); ctx.lineTo(-14 - b * 0.15, 0); ctx.lineTo(-14, L); ctx.stroke(); }
  ctx.restore();
}
// an arrow pointing along ang
function arrowC(x, y, ang = 0, len = 120) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.strokeStyle = BF.black; ctx.fillStyle = BF.black; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(0, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -8); ctx.lineTo(-8, 8); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 2.5; for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(-len + j * 8, 0); ctx.lineTo(-len + j * 8 - 10, -10); ctx.moveTo(-len + j * 8, 0); ctx.lineTo(-len + j * 8 - 10, 10); ctx.stroke(); }
  ctx.restore();
}
// an arrow in flight from x0 to x1 along y; speed streaks behind it; returns u (0..1, <0 before)
function arrowFlight(x0, x1, y, t, d) { const u = (TT - t) / d; if (u < 0) return u; const x = lerp(x0, x1, clamp(u));
  if (u <= 1.05) { ctx.save(); ctx.strokeStyle = 'rgba(240,222,190,0.75)'; ctx.lineWidth = 2; for (let j = -1; j <= 1; j++) { ctx.beginPath(); ctx.moveTo(Math.max(x0, x - 260), y + j * 9); ctx.lineTo(x - 140, y + j * 9); ctx.stroke(); } ctx.restore(); }
  if (u <= 1) arrowC(x, y, x1 > x0 ? 0 : Math.PI, 110); return u; }
// the twelve axes planted in a row, handles down, their heads' round holes all on y = AXY
const AXY = 640;
function axes(x0, x1, k = 1, o = {}) {
  for (let i = 0; i < 12; i++) { const x = lerp(x0, x1, i / 11), kk = o.t == null ? k : EZ.o2(clamp((TT - o.t - i * 0.07) / 0.3)); if (kk <= 0) continue;
    const y = AXY + (1 - kk) * 60, s = o.s ?? 1; ctx.save(); ctx.globalAlpha *= clamp(kk * 1.5);
    ctx.strokeStyle = BF.black; ctx.lineWidth = 9 * s; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(x, y + 26 * s); ctx.lineTo(x, FLOOR); ctx.stroke();
    ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.6;
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + d * 10 * s, y - 16 * s); ctx.quadraticCurveTo(x + d * 30 * s, y - 20 * s, x + d * 46 * s, y - 34 * s); ctx.quadraticCurveTo(x + d * 34 * s, y, x + d * 46 * s, y + 34 * s); ctx.quadraticCurveTo(x + d * 30 * s, y + 20 * s, x + d * 10 * s, y + 16 * s); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.fillRect(x - 12 * s, y - 22 * s, 24 * s, 48 * s);
    bfDot(x, y, 9 * s, BF.ground); ctx.strokeStyle = BF.inc; ctx.beginPath(); ctx.arc(x, y, 9 * s, 0, TAU); ctx.stroke();
    if (o.glint != null && TT > o.glint + i * 0.04 && TT < o.glint + i * 0.04 + 0.5) glow(x, y, 50, 'rgba(255,236,200,A)', 0.8 * (1 - (TT - o.glint - i * 0.04) / 0.5), 'lighter');
    ctx.restore(); }
}
// things thrown: a stool, a footstool, a cow's hoof (code), in an arc from (x0, y0) to (x1, y1) over d from t
function stoolC(x, y, s = 1, rot = 0, low = false) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  const h = low ? 26 : 60; ctx.fillRect(-40, -h - 10, 80, 12); ctx.strokeRect(-40, -h - 10, 80, 12); ctx.lineWidth = 7; ctx.strokeStyle = BF.black; ctx.beginPath(); ctx.moveTo(-32, -h); ctx.lineTo(-38, 0); ctx.moveTo(32, -h); ctx.lineTo(38, 0); ctx.stroke(); ctx.restore(); }
function hoofC(x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-10, -60); ctx.lineTo(10, -60); ctx.lineTo(16, -18); ctx.quadraticCurveTo(34, 0, 22, 10); ctx.lineTo(-22, 10); ctx.quadraticCurveTo(-34, 0, -16, -18); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 10); ctx.stroke(); ctx.restore(); }
function thrownC(f, x0, y0, x1, y1, t, d, hgt = 160) { const u = (TT - t) / d; if (u < 0) return; const k = clamp(u); f(lerp(x0, x1, k), lerp(y0, y1, k) - Math.sin(Math.PI * k) * hgt, TT * (u < 1 ? 7 : 0) + (u >= 1 ? 1.4 : 0)); }
// the hall's doors, barred: two black leaves with bronze studs and a bar dropping across (shut 0..1)
function doors(x, shut) {
  const w = 300, top = 330, k = EZ.io(clamp(shut)), leaf = (w / 2) * (0.2 + 0.8 * k);
  ctx.save(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  ctx.fillStyle = '#0d0607'; ctx.fillRect(x - w / 2, top, w, FLOOR - top);
  ctx.fillStyle = BF.black; ctx.fillRect(x - w / 2 - 30, top - 34, w + 60, 34); ctx.strokeRect(x - w / 2 - 30, top - 34, w + 60, 34);
  for (const d of [-1, 1]) { const lx = d < 0 ? x - w / 2 : x + w / 2 - leaf; ctx.fillStyle = '#1c0f0b'; ctx.fillRect(lx, top, leaf, FLOOR - top); ctx.strokeRect(lx, top, leaf, FLOOR - top);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) bfDot(lx + leaf * (0.3 + 0.4 * c), top + 50 + r * 85, 4, BF.inc); }
  const b = EZ.o2(clamp((shut - 0.8) / 0.2)); if (b > 0) { ctx.fillStyle = BF.black; ctx.fillRect(x - w / 2 - 40, lerp(top - 80, 560, b), w + 80, 26); ctx.strokeRect(x - w / 2 - 40, lerp(top - 80, 560, b), w + 80, 26); }
  ctx.restore();
}
// spears on wall pegs; gone 0..1 takes them down one by one (they lift off and fade)
function spearRack(x0, n, gone = 0) {
  ctx.save(); ctx.fillStyle = BF.black; for (let i = 0; i < n; i++) { const x = x0 + i * 46; ctx.fillRect(x - 10, 300, 20, 10); ctx.fillRect(x - 10, 600, 20, 10); } ctx.restore();
  for (let i = 0; i < n; i++) { const k = clamp(gone * (n + 2) - i), x = x0 + i * 46; if (k >= 1) continue; ctx.save(); ctx.globalAlpha *= 1 - k; ctx.translate(0, -140 * EZ.i2(k)); ctx.strokeStyle = BF.black; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, 640); ctx.lineTo(x, 270); ctx.stroke(); ctx.fillStyle = BF.black; ctx.beginPath(); ctx.moveTo(x, 230); ctx.lineTo(x - 11, 272); ctx.lineTo(x + 11, 272); ctx.closePath(); ctx.fill(); ctx.restore(); }
}
// stairs up to the women's rooms: black treads with incised edges rising right
function stairs(x0, n = 9, step = 48, rise = 52) {
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  for (let i = 0; i < n; i++) { const x = x0 + i * step, y = FLOOR - (i + 1) * rise; ctx.fillRect(x, y, W + 400 - x, rise); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(W + 400, y); ctx.moveTo(x, y); ctx.lineTo(x, y + rise); ctx.stroke(); }
  ctx.restore();
}
const stairY = (x, x0 = 900, step = 70, rise = 32) => FLOOR - Math.max(0, Math.min(9, Math.floor((x - x0) / step) + 1)) * rise;
// a swaddled baby in a basket (code)
function baby(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-90, -40); ctx.quadraticCurveTo(0, 30, 90, -40); ctx.lineTo(70, 0); ctx.lineTo(-70, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); for (let j = -3; j <= 3; j++) { ctx.beginPath(); ctx.moveTo(j * 22, -12); ctx.lineTo(j * 20, 0); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -46, 60, 22, 0, 0, TAU); ctx.fill(); ctx.stroke(); bfDot(-62, -52, 18, BF.black); ctx.beginPath(); ctx.arc(-62, -52, 18, 0, TAU); ctx.stroke(); for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.moveTo(-30 + j * 18, -66); ctx.lineTo(-20 + j * 18, -26); ctx.stroke(); } ctx.restore(); }
// a swallow: a little black bird with forked tail (code)
function swallow(x, y, s = 1, flap = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const f = 14 * Math.sin(TT * 14 + flap); ctx.fillStyle = BF.black;
  ctx.beginPath(); ctx.moveTo(30, 0); ctx.quadraticCurveTo(0, -8, -20, -2); ctx.lineTo(-48, -14); ctx.lineTo(-30, 0); ctx.lineTo(-48, 14); ctx.lineTo(-20, 2); ctx.quadraticCurveTo(0, 8, 30, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(6, 0); ctx.quadraticCurveTo(-6, -30 - f, -26, -40 - f); ctx.quadraticCurveTo(-4, -14, -8, 0); ctx.fill(); ctx.restore(); }
// the sun under the horizon (cream disc with rays), held back: k = how far it has come up
function heldSun(x, yH, k) { const y = yH + 120 - 150 * k; ctx.save(); ctx.beginPath(); ctx.rect(-400, PIC0, W + 800, yH - PIC0); ctx.clip();
  glow(x, y, 360, 'rgba(255,226,180,A)', 0.4 * k, 'lighter'); bfDot(x, y, 80, 'rgba(240,222,190,0.95)'); ctx.strokeStyle = 'rgba(240,222,190,0.8)'; ctx.lineWidth = 4;
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + TT * 0.1; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 100, y + Math.sin(a) * 100); ctx.lineTo(x + Math.cos(a) * 140, y + Math.sin(a) * 140); ctx.stroke(); } ctx.restore(); }
// little house of Odysseus on the island with a lit window
function homeHouse(x, yb, s = 1, lit = 1) { ctx.save(); ctx.translate(x, yb); ctx.scale(s, s); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2 / s;
  ctx.fillRect(-80, -90, 160, 90); ctx.strokeRect(-80, -90, 160, 90); ctx.beginPath(); ctx.moveTo(-96, -90); ctx.lineTo(0, -140); ctx.lineTo(96, -90); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  bfDot(x + 30 * s, yb - 52 * s, 13 * s, `rgba(255,222,160,${0.9 * lit})`); glow(x + 30 * s, yb - 52 * s, 90 * s, 'rgba(255,222,160,A)', 0.5 * lit, 'lighter'); }

// ---- the cast: who wears which layer (all solid black, ringed)
//   Odysseus: ody_look (traveller), ody_beggar / ody_beggar_sit / ody_string / ody_shoot_sit (the beggar in rags),
//   ody_bow (rags torn, on the threshold), ody_shout, ody_sword, ody_sit / ody_tell (himself again), embrace
//   suitors: suitor = Antinous (cup), antinous_fall, eurymachus (laughing), suitor_throw (the brute), suitor_bow, suitor_cower, suitor_dead
//   Penelope: penelope, penelope_weave, penelope_sit; Telemachus: telemachus, telemachus_give; Eurycleia: nurse_run;
//   Eumaeus (eumaeus) and the cowherd (cowherd); the maid (maid_tell); Athena: athena, athena_wand; Argos: argos, argos_dead; Laertes

// =====================================================================
//  the panels (panel coords = screen coords)
// =====================================================================
// ---- 13 · ITHACA
function p01() {   // continuing from part 5's beach: Athena comes to him on the shore of Ithaca and tells him what waits at home; the chapter title
  const t0 = SUB('p01'), tA = VW('l01', 'athena') - 0.4, tH = VW('l01', 'house') - 0.4;
  ctx.save(); cam(lerp(1040, 1000, EZ.io(pu('p01'))), 580, 1.03);   // picks up exactly where part 5's last panel left off
  glow(1600, SEA - 30, 520, 'rgba(255,214,170,A)', 0.4, 'lighter');
  shoreL({ x0: 1100, key: 'p43' });
  gifts(1790, FLOOR, 1);
  fig('ody_look', 1180, FLOOR, 400, { flip: true });
  const w = walk(400, 720, tA - 0.2, 1.6, 4, 4); fig('athena', w.x, FLOOR + w.dy, 430, { flip: true, a: at(tA - 0.4, 0.6), rot: w.rot });
  sparks(w.x, FLOOR - 380, at(tA, 0.4) * (1 - at(tA + 1.4, 0.6)), 61, 60);
  roundel(1560, 300, 120, at(tH, 0.6), () => { ground(380, { key: 'r01', bare: 1 }); homeHouse(1560, 380, 0.9, 1); });
  letters('XIII · ITHACA', 600, 300, t0 + 0.4, 96, { step: 0.06 });
  ctx.restore();
}
function p02() {   // twenty years, ten at the war and ten at sea; everyone believed him dead
  const tTw = VW('l02', 'twenty') - 0.3, tW = VW('l02', 'war') - 0.4, tS = VW('l02', 'sea') - 0.4, tD = VW('l02', 'dead') - 0.3;
  ctx.save(); cam(960, 560, 1.02);
  sea(SEA + 60, { speed: 8 });
  tally(10, 330, 160, tTw, 0.08, { w: 8, len: 60, gap: 28 });
  tally(10, 1330, 160, tTw + 0.9, 0.08, { w: 8, len: 60, gap: 28 });
  roundel(580, 450, 170, at(tW, 0.6), () => { ground(560, { key: 'r02', bare: 1 }); bfLay('troy_walls.webp', 580, 560, 200); fireAt(520, 420, 0.3, 1, 21); });
  roundel(1340, 450, 170, at(tS, 0.6), () => { sea(500, { speed: 14 }); ship(1340 + 20 * Math.sin(TT), 540, 280, {}); });
  // a grave mound with a stele on 'dead'
  const kD = at(tD, 0.6); if (kD > 0) { ctx.save(); ctx.globalAlpha *= kD; ctx.fillStyle = BF.black; ctx.beginPath(); ctx.ellipse(960, SEA + 60, 140, 70, 0, Math.PI, TAU); ctx.fill(); ctx.fillRect(940, SEA - 120, 40, 120); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.strokeRect(940, SEA - 120, 40, 120); ctx.restore(); }
  ctx.restore();
  tint('#1a0c10', 0.2 * kD, 'multiply');
}
function p03() {   // more than a hundred young men moved into his palace to court his wife (hall card)
  const tH = VW('l03', 'hundred') - 0.4, tM = VW('l03', 'moved') - 0.4, tP = VW('l03', 'penelope') - 0.4;
  ctx.save(); cam(lerp(1000, 900, EZ.io(pu('p03'))), 580, 1.03);
  ithHall({ fireX: 1180, key: 'h3' });
  // the crowd at the back: small suitors in a row, then the four in front walk in
  [['suitor_throw', 180, 390, false], ['suitor_bow', 430, 380, false], ['suitor', 700, 400, true], ['eurymachus', 960, 410, false]].forEach(([n, x, h, f], i) => { const w = walk(x - 1200, x, tM - 1.2 + i * 0.15, 2.0, 6, 6); fig(n, w.x, FLOOR + w.dy, h, { flip: f, rot: w.rot }); });
  const B = ['eurymachus', 'suitor', 'suitor_bow', 'suitor_throw'];
  roundel(1180, 300, 130, at(tH, 0.6), () => { ground(380, { key: 'r03', bare: 1 }); for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) fig(B[(i + r) % 4], 1080 + i * 26 + r * 12, 360 + r * 22, 70, { still: true, flip: (i + r) % 2 === 1 }); });
  fig('penelope', 1560, FLOOR, 420, { flip: true, a: at(tP - 0.6, 0.6) });
  ctx.restore();
}
function p04() {   // they ate his cattle and drank his wine: the feast in his hall
  const tA = VW('l04', 'ate') - 0.4, tD = VW('l04', 'drank') - 0.4, tSe = VW('l04', 'servant') - 0.4;
  ctx.save(); cam(960, 580, 1.04);
  ithHall({ key: 'h4' });
  spitFire(1560, 1, 0, 4);
  table(880, 520);
  fig('suitor', 640, FLOOR, 400, { rot: 0.03 * Math.sin(TT * 2.2) * at(tD, 0.4) });
  fig('eurymachus', 1100, FLOOR, 410, { flip: true });
  fig('suitor_throw', 300, FLOOR, 390, { a: 0 });
  fireAt(1560, FLOOR - 30, 0.4, at(tA, 0.5), 44);
  void tSe; ctx.restore();
}
function p05() {   // and every day they demanded that she pick one of them to marry
  const tE = VW('l05', 'every') - 0.4, tDe = VW('l05', 'demanded') - 0.4, tM = VW('l05', 'marry') - 0.4;
  ctx.save(); cam(lerp(960, 1080, at(tDe, 1.6)), 580, 1.04);
  ithHall({ key: 'h5' });
  fig('suitor', 640, FLOOR, 400, { flip: true });
  fig('eurymachus', 940, FLOOR, 410, { rot: -0.03 * at(tDe, 0.4) });
  fig('suitor_bow', 360, FLOOR, 380, { a: 0 });
  fig('penelope', 1560, FLOOR, 420, { flip: true });
  // the days ticking by: little suns crossing the frieze top
  for (let i = 0; i < 5; i++) { const k = at(tE + i * 0.35, 0.3); if (k > 0) blackSun(1080 + i * 110, 300, 18, k); }
  glow(1500, 440, 240, 'rgba(255,236,200,A)', 0.25 * at(tM, 0.6), 'lighter');
  ctx.restore();
}
function p06() {   // for years she'd tricked them: Penelope at her loom (her room, card)
  const tT = VW('l06', 'tricked') - 0.3;
  ctx.save(); cam(960, 580, 1.04);
  ithHall({ key: 'h6' });
  loom(1150, 0.35 + 0.05 * at(tT, 1));
  fig('penelope_weave', 900, FLOOR, 430);
  ctx.restore();
}
function p07() {   // she'd choose a husband once she finished weaving a burial shroud for Odysseus's old father (Laertes in a roundel)
  const tC = VW('l07', 'choose') - 0.4, tW = VW('l07', 'weaving') - 0.4, tS = VW('l07', 'shroud') - 0.4, tF = VW('l07', 'father') - 0.4;
  ctx.save(); cam(lerp(960, 1040, EZ.io(pu('p07'))), 580, 1.04);
  ithHall({ key: 'h6' });
  loom(1150, 0.4 + 0.1 * at(tW, 2));
  fig('penelope_weave', 900, FLOOR, 430);
  fig('eurymachus', 280, FLOOR, 410, { a: at(tC - 0.6, 0.6) });
  roundel(1560, 300, 130, at(tF, 0.6), () => { ground(400, { key: 'r07', bare: 1 }); fig('laertes', 1560, 400, 220, { still: true }); });
  glow(1150, 420, 260, 'rgba(255,236,200,A)', 0.25 * at(tS, 0.5) * (1 - at(tS + 1.2, 0.6)), 'lighter');
  ctx.restore();
}
function p08() {   // every day she wove it, every night in secret she unpicked it: the cloth grows by day, shrinks by lamplight
  const tD = VW('l08', 'day') - 0.4, tN = VW('l08', 'night') - 0.4, tU = VW('l08', 'unpicked') - 0.4;
  const grow = at(tD, 1.4), shrink = at(tU - 0.2, 1.6), nk = at(tN, 0.7);
  ctx.save(); cam(960, 580, 1.05);
  ithHall({ key: 'h6' });
  loom(1150, 0.5 + 0.25 * grow - 0.3 * shrink);
  fig('penelope_weave', 900, FLOOR, 430, { rot: 0.012 * Math.sin(TT * 5) * (grow < 1 || shrink > 0 ? 1 : 0) });
  if (nk > 0) lamp(1420, FLOOR - 4, nk);
  ctx.restore();
  nightRoom(nk, 1440, FLOOR - 40);
}
function p09() {   // three years, until one of her maids gave her away: the maid whispers to Eurymachus behind the loom
  const tT = VW('l09', 'three') - 0.3, tM = VW('l09', 'maids') - 0.4, tA = VW('l09', 'away') - 0.3;
  ctx.save(); cam(lerp(960, 760, at(tM, 1.4)), 580, 1.05);
  ithHall({ key: 'h6' });
  loom(1150, 0.45);
  fig('penelope_weave', 900, FLOOR, 430);
  tally(3, 1260, 160, tT, 0.25, { w: 9, len: 70, gap: 40 });
  const w = walk(-100, 260, tM - 0.8, 1.2, 6, 5); fig('maid_tell', w.x, FLOOR + w.dy, 380, { rot: w.rot });
  fig('eurymachus', 520, FLOOR, 410, { flip: true, rot: -0.03 * at(tA, 0.4) });
  eyeGlint(...ptf('eurymachus', 520, FLOOR, 410, 0.42, 0.07, { flip: true }), at(tA, 0.4) * (1 - at(tA + 1, 0.4)));
  ctx.restore();
}
function p10() {   // his son Telemachus: a baby when Odysseus sailed for Troy; now a grown man
  const tS = VW('l10', 'son') - 0.4, tB = VW('l10', 'baby') - 0.4, tSa = VW('l10', 'sailed') - 0.4;
  ctx.save(); cam(960, 580, 1.04);
  ithHall({ fireX: 1700, key: 'h10' });
  const w = walk(-200, 700, tS - 0.5, 1.8, 6, 6); fig('telemachus', w.x, FLOOR + w.dy, 440, { rot: w.rot });
  roundel(1180, 330, 150, at(tB, 0.6), () => { ground(450, { key: 'r10', bare: 1 }); if (TT < tSa) baby(1180, 440, 0.9); else { ctx.save(); ctx.globalAlpha *= at(tSa, 0.4); sea(400, { speed: 12 }); ship(1180 + 60 * at(tSa, 2), 440, 260, {}); ctx.restore(); ctx.save(); ctx.globalAlpha *= 1 - at(tSa, 0.4); baby(1180, 440, 0.9); ctx.restore(); } });
  ctx.restore();
}
function p11() {   // now a grown man, and the suitors planned to murder him — then the whole hall: the suitors, Penelope, her son
  const tG = VW('l11', 'grown') - 0.4, tP = VW('l11', 'planning') - 0.4, tMu = VW('l11', 'murder') - 0.3, tPan = LE('l11') + 0.1;
  const pan = EZ.io(clamp((TT - tPan) / 2.0));
  ctx.save(); cam2(lerp(960, 1300, pan), 560, lerp(1.05, 0.8, pan));
  ithHall({ fireX: 2100, key: 'h11' });
  fig('telemachus', 700, FLOOR, 440);
  // the plotters lean together, a knife glinting
  fig('suitor_throw', 1180, FLOOR, 390, { flip: true });
  fig('eurymachus', 1440, FLOOR, 410, { flip: true, rot: -0.03 * at(tP, 0.5) });
  fig('suitor', 1700, FLOOR, 400);
  const kn = at(tMu, 0.3); if (kn > 0) { ctx.save(); ctx.globalAlpha *= kn; ctx.strokeStyle = BF.black; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(1240, 610); ctx.lineTo(1300, 560); ctx.stroke(); ctx.restore(); glow(1300, 560, 50, 'rgba(255,240,210,A)', 0.8 * kn * (1 - at(tMu + 0.6, 0.4)), 'lighter'); }
  // the rest of the frieze (comes into view on the pull back)
  fig('suitor_bow', 1960, FLOOR, 380, { flip: true });
  fig('suitor_cower', 2220, FLOOR, 360, { flip: true });
  fig('penelope', 2520, FLOOR, 420, { flip: true });
  fig('penelope_sit', -260, FLOOR, 360, { a: 0 });
  ctx.restore();
  tint('#1a0c10', 0.25 * at(tMu, 0.6) * (1 - pan), 'multiply');
  void tG;
}
function p12() {   // Athena touches Odysseus with her wand (the shore; open)
  const tT = VW('l12', 'touched') - 0.4, tW = VW('l12', 'wand') - 0.3;
  ctx.save(); cam(960, 580, 1.04);
  shoreL({ x0: 1500, key: 'p12' });
  tree(180, FLOOR + 6, 460, { key: 'p12t' });
  fig('athena_wand', 560, FLOOR, 440);
  fig('ody_look', 1000, FLOOR, 400, { flip: true });
  const [wx, wy] = ptf('athena_wand', 560, FLOOR, 440, 0.97, 0.36); sparks(wx + 20, wy - 10, at(tT, 0.4), 12, 60);
  glow(1000, 560, 300, 'rgba(255,236,200,A)', 0.4 * at(tW, 0.6), 'lighter');
  ctx.restore();
}
function p13() {   // his skin wrinkled, his hair fell out, his eyes went cloudy, filthy rags: he becomes the beggar
  const tSk = VW('l13', 'skin') - 0.4, tH = VW('l13', 'hair') - 0.4, tE = VW('l13', 'eyes') - 0.4, tR = VW('l13', 'rags') - 0.4, tN = VW('l13', 'nobody') - 0.4;
  ctx.save(); cam(1100, 560, 1.05 + 0.15 * at(tSk, 1.5) - 0.12 * at(tN, 1.2));
  shoreL({ x0: 1600, key: 'p13' });
  xf(tH, 1.2, (a) => fig('ody_look', 1100, FLOOR, 400, { flip: true, a }), (a) => fig('ody_beggar', 1100, FLOOR, 370, { flip: true, a }));
  sparks(1100, 560, at(tSk, 0.4) * (1 - at(tR + 0.8, 0.6)), 13, 140);
  // the cloudy eyes: a pale film over the eye
  const [ex, ey] = ptf('ody_beggar', 1100, FLOOR, 370, 0.23, 0.12, { flip: true }); bfDot(ex, ey, 5, `rgba(240,222,190,${0.8 * at(tE, 0.5) * (1 - at(tR, 0.6))})`);
  ctx.restore();
}
function p14() {   // he walked into his own town as a beggar
  const tW = VW('l14', 'walked') - 0.4, tB = VW('l14', 'beggar') - 0.4;
  ctx.save(); cam(960, 580, 1.03);
  town(14);
  ground(FLOOR, { key: 'p14' });
  const w = walk(1150, 2200, SUB('p14'), SUBEND('p14') - SUB('p14') + 0.4, 4, 5); fig('ody_beggar', w.x, FLOOR + w.dy, 370, { rot: w.rot });
  birds(4, 260, 40, 14);
  void tB; ctx.restore();
}
function p15() {   // at the gate of the palace, on a heap of dung, an old dog crawling with fleas, too weak to stand (gate card)
  const tG = VW('l15', 'gate') - 0.4, tDu = VW('l15', 'dung') - 0.4, tO = VW('l15', 'old') - 0.4, tF = VW('l15', 'fleas') - 0.4, tWe = VW('l15', 'weak') - 0.4;
  ctx.save(); cam(lerp(1100, 560, at(tDu, 1.8)), 600, 1.02 + 0.1 * at(tDu, 1.8));
  gateSet({ key: 'g15' });
  dung(520, 420, 70);
  fig('argos', 520, FLOOR - 40, 190, { rot: -0.02 + 0.01 * Math.sin(TT * 0.8), a: 1 });
  flies(560, FLOOR - 170, at(tF, 0.5), 15);
  void tG; void tO; void tWe; ctx.restore();
}
function p16() {   // it was Argos
  const tA = VW('l16', 'argos') - 0.4;
  ctx.save(); cam(560, 640, 1.18);
  gateSet({ key: 'g15' });
  dung(520, 420, 70);
  fig('argos', 520, FLOOR - 40, 190, { rot: -0.02 + 0.01 * Math.sin(TT * 0.8) });
  flies(560, FLOOR - 170, 1, 16);
  letters('ARGOS', 620, 440, tA, 110, { step: 0.08 });
  ctx.restore();
}
function p17() {   // Odysseus had raised him from a puppy, just before he left for Troy (a roundel of the young master and the pup)
  const tR = VW('l17', 'raised') - 0.4, tP = VW('l17', 'puppy') - 0.4, tT = VW('l17', 'troy') - 0.4;
  ctx.save(); cam(700, 600, 1.08);
  gateSet({ key: 'g15' });
  dung(520, 420, 70);
  fig('argos', 520, FLOOR - 40, 190);
  flies(560, FLOOR - 170, 1, 17);
  roundel(1000, 360, 190, at(tR, 0.6), () => { ground(500, { key: 'r17', bare: 1 }); fig('ody_offer', 940, 500, 300, { still: true }); bfLay('argos.webp', 1080, 500, 90 * at(tP, 0.5) + 0.1, { a: at(tP, 0.5) }); if (TT > tT) { ctx.save(); ctx.globalAlpha *= at(tT, 0.5); sea(470, { speed: 10 }); ship(1100, 490, 160, {}); ctx.restore(); } });
  ctx.restore();
}
function p18() {   // after twenty years not one person recognised Odysseus: the beggar comes up to the gate; the townsfolk pass him by
  const tA = VW('l18', 'twenty') - 0.4, tN = VW('l18', 'one') - 0.4;
  ctx.save(); cam(960, 600, 1.03);
  gateSet({ key: 'g15' });
  dung(520, 420, 70);
  fig('argos', 520, FLOOR - 40, 190);
  flies(560, FLOOR - 170, 1, 18);
  const w = walk(-200, 860, SUB('p18') - 0.2, 3.4, 4, 5); fig('ody_beggar', w.x, FLOOR + w.dy, 370, { rot: w.rot });
  const g = walk(1500, 1250, tN - 0.6, 2.4, 6, 5); fig('maid_tell', g.x, FLOOR + g.dy, 370, { flip: true, rot: g.rot, a: at(SUB('p18') + 0.6, 0.6) });
  void tA; ctx.restore();
}
function p19() {   // the dog knew him at once: Argos lifts his head, his eye catches the light
  const tD = VW('l19', 'dog') - 0.4, tK = VW('l19', 'knew') - 0.3;
  ctx.save(); cam(lerp(860, 700, at(tK, 1.2)), 640, 1.06 + 0.1 * at(tK, 1.2));
  gateSet({ key: 'g15' });
  dung(520, 420, 70);
  fig('argos', 520, FLOOR - 40, 190, { rot: -0.06 * at(tK, 0.4) });
  eyeGlint(...ptf('argos', 520, FLOOR - 40, 190, 0.83, 0.2), at(tK, 0.3) * (1 - at(tK + 1.6, 0.5)));
  fig('ody_beggar', 860, FLOOR, 370, { rot: 0.02 * at(tK, 0.3) });
  void tD; ctx.restore();
}
function p20() {   // he flattened his ears and wagged his tail, but couldn't get up to go to him
  const tE = VW('l20', 'ears') - 0.4, tT = VW('l20', 'tail') - 0.4, tU = VW('l20', 'up') - 0.4;
  ctx.save(); cam(700, 640, 1.12);
  gateSet({ key: 'g15' });
  dung(520, 420, 70);
  const wag = at(tT, 0.3), up = Math.max(0, Math.sin(Math.PI * clamp((TT - tU) / 1.1)));
  fig('argos', 520, FLOOR - 40 - 16 * up, 190, { rot: -0.05 + 0.03 * Math.sin(TT * 14) * wag * 0.3 - 0.05 * up, still: true });
  // the tail sweeping the dung
  if (wag > 0) { const [tx, ty] = ptf('argos', 520, FLOOR - 40, 190, 0.06, 0.76); ctx.save(); ctx.strokeStyle = 'rgba(240,222,190,0.6)'; ctx.lineWidth = 2; for (let j = 0; j < 2; j++) { ctx.beginPath(); ctx.arc(tx, ty, 34 + j * 12, Math.PI * (0.6 + 0.15 * Math.sin(TT * 14)), Math.PI * (0.9 + 0.15 * Math.sin(TT * 14))); ctx.stroke(); } ctx.restore(); }
  fig('ody_beggar', 860, FLOOR, 370);
  void tE; ctx.restore();
}
function p21() {   // and Odysseus couldn't go to the dog without giving himself away (a suitor watches from the gateway)
  const tC = VW('l21', "couldn't") - 0.4, tA = VW('l21', 'away') - 0.4;
  ctx.save(); cam(lerp(860, 1100, at(tC, 1.6)), 600, 1.05);
  gateSet({ key: 'g15' });
  dung(520, 420, 70);
  fig('argos', 520, FLOOR - 40, 190, { rot: -0.05 });
  fig('ody_beggar', 860, FLOOR, 370);
  fig('eurymachus', 1360, FLOOR, 410, { flip: true, a: at(tC - 0.4, 0.6) });
  eyeGlint(...ptf('eurymachus', 1360, FLOOR, 410, 0.42, 0.07, { flip: true }), at(tA, 0.4) * (1 - at(tA + 1.2, 0.4)));
  ctx.restore();
}
function p22() {   // so he walked past, and wiped away a tear before anyone could see it
  const tW = VW('l22', 'walked') - 0.4, tT = VW('l22', 'tear') - 0.4;
  ctx.save(); cam(960, 600, 1.04);
  gateSet({ key: 'g15' });
  dung(520, 420, 70);
  fig('argos', 520, FLOOR - 40, 190, { rot: -0.03 });
  const w = walk(860, 1350, tW - 0.2, 2.6, 4, 5); fig('ody_beggar', w.x, FLOOR + w.dy, 370, { rot: w.rot });
  const [ex, ey] = ptf('ody_beggar', w.x, FLOOR, 370, 0.77, 0.12); tears(ex, ey, at(tT - 0.4, 0.4) * (1 - at(tT + 1.4, 0.4)), 22);
  ctx.restore();
}
function p23() {   // and Argos, having seen his master again after twenty years, died
  const tS = VW('l23', 'seen') - 0.4, tM = VW('l23', 'master') - 0.4, tD = VW('l23', 'died') - 0.3;
  ctx.save(); cam(lerp(700, 560, at(tS, 3)), 660, 1.12 + 0.08 * at(tD, 1.4));
  gateSet({ key: 'g15' });
  dung(520, 420, 70);
  xf(tD - 0.1, 1.0, (a) => fig('argos', 520, FLOOR - 40, 190, { a, rot: -0.03, still: true }), (a) => fig('argos_dead', 520, FLOOR - 34, 140, { a, still: true }));
  flies(560, FLOOR - 120, 1 - at(tD, 0.6), 23);
  void tM; ctx.restore();
  tint('#1a0c10', 0.35 * at(tD, 1.2), 'multiply');
}
function p24() {   // inside, the suitors made fun of the beggar (hall card; he sits by the door on his stool)
  const tI = VW('l24', 'inside') - 0.4, tF = VW('l24', 'fun') - 0.4;
  ctx.save(); cam(960, 580, 1.03);
  ithHall({ fireX: 1820, key: 'hb' });
  fig('ody_beggar_sit', 360, FLOOR, 330);
  fig('eurymachus', 900, FLOOR, 410, { flip: true, rot: 0.03 * Math.sin(TT * 7) * at(tF, 0.3) });
  fig('suitor', 1160, FLOOR, 400, { rot: 0.02 * Math.sin(TT * 6) * at(tF, 0.3) });
  fig('suitor_throw', 1440, FLOOR, 390, { flip: true, a: 0 });
  void tI; ctx.restore();
}
function p25() {   // one threw a stool at him, another a footstool, another a cow's hoof
  const tS = VW('l25', 'stool') - 0.5, tF = VW('l25', 'footstool') - 0.5, tH = VW('l25', 'hoof') - 0.5;
  ctx.save(); cam(960, 580, 1.03, shake(tS + 0.5, 6) + shake(tF + 0.5, 6) + shake(tH + 0.5, 6));
  ithHall({ fireX: 1820, key: 'hb' });
  const hit = (t) => 0.06 * Math.sin(Math.PI * clamp((TT - t - 0.45) / 0.3));
  fig('ody_beggar_sit', 360, FLOOR, 330, { rot: -hit(tS) - hit(tF) - hit(tH) });
  fig('suitor_throw', 1180, FLOOR, 390, { flip: true });
  fig('eurymachus', 900, FLOOR, 410, { flip: true });
  fig('suitor', 1500, FLOOR, 400);
  thrownC((x, y, r) => stoolC(x, y, 0.8, r), 1180, 500, 420, FLOOR - 4, tS, 0.5);
  thrownC((x, y, r) => stoolC(x, y, 0.7, r, true), 900, 600, 520, FLOOR - 4, tF, 0.5);
  thrownC((x, y, r) => hoofC(x, y, 0.9, r), 1500, 560, 260, FLOOR - 6, tH, 0.55);
  ctx.restore();
}
function p26() {   // Odysseus took it all without a word, and he watched them: push in on the beggar
  const tT = VW('l26', 'took') - 0.4, tW = VW('l26', 'watched') - 0.4;
  ctx.save(); cam(lerp(960, 420, at(tW - 0.5, 1.6)), 560, 1.03 + 0.4 * at(tW - 0.5, 1.6));
  ithHall({ fireX: 1820, key: 'hb' });
  stoolC(420, FLOOR - 4, 0.8, 1.4); stoolC(520, FLOOR - 4, 0.7, 1.4, true); hoofC(260, FLOOR - 6, 0.9, 1.4);
  fig('ody_beggar_sit', 360, FLOOR, 330);
  fig('eurymachus', 900, FLOOR, 410, { flip: true, rot: 0.02 * Math.sin(TT * 7) });
  fig('suitor_throw', 1180, FLOOR, 390, { flip: true });
  fig('suitor', 1500, FLOOR, 400, { rot: 0.02 * Math.sin(TT * 6) });
  eyeGlint(...ptf('ody_beggar_sit', 360, FLOOR, 330, 0.74, 0.12), at(tW, 0.4));
  void tT; ctx.restore();
}
function p27() {   // that night Penelope sat down to talk with the stranger (her room, a lamp)
  const tN = VW('l27', 'night') - 0.4, tS = VW('l27', 'stranger') - 0.4, tD = VW('l27', 'decided') - 0.4;
  ctx.save(); cam(960, 580, 1.05);
  ithHall({ key: 'hn' });
  loom(1650, 0.25, { w: 240 });
  fig('penelope_sit', 640, FLOOR, 360);
  lamp(960, FLOOR - 4, 1);
  fig('ody_beggar_sit', 1260, FLOOR, 330, { flip: true });
  void tS; void tD; ctx.restore();
  nightRoom(at(tN - 0.6, 0.6) * 0.0 + 1, 990, FLOOR - 40);
}
function p28() {   // tomorrow, she said, I'll bring out my husband's bow (the bow on its peg in a roundel)
  const tT = VW('l28', 'tomorrow') - 0.4, tB = VW('l28', 'bow') - 0.4;
  ctx.save(); cam(lerp(960, 800, at(tT, 1.4)), 580, 1.05);
  ithHall({ key: 'hn' });
  loom(1650, 0.25, { w: 240 });
  fig('penelope_sit', 640, FLOOR, 360);
  lamp(960, FLOOR - 4, 1);
  fig('ody_beggar_sit', 1260, FLOOR, 330, { flip: true });
  ctx.restore();
  nightRoom(1, 990, FLOOR - 40);
  ctx.save(); cam(lerp(960, 800, at(tT, 1.4)), 580, 1.05);   // the roundel stays lit over the dark room
  roundel(860, 330, 150, at(tB, 0.6), () => { ctx.save(); ctx.fillStyle = BF.black; ctx.fillRect(840, 220, 40, 12); ctx.restore(); bowC(840, 330, 250, 0, 0.75, false); ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.translate(920, 330); ctx.rotate(0.15); ctx.fillRect(-16, -70, 32, 150); ctx.strokeRect(-16, -70, 32, 150); for (let j = 0; j < 4; j++) arrowC(-8 + j * 6, -80, -Math.PI / 2, 30); ctx.restore(); glow(860, 330, 120, 'rgba(255,236,200,A)', 0.3, 'lighter'); });
  ctx.restore();
}
function p29() {   // whoever strings it and shoots through twelve axe heads in a row, the way Odysseus used to, I'll marry him
  const tSt = VW('l29', 'string') - 0.4, tSh = VW('l29', 'shoot') - 0.4, tT = VW('l29', 'twelve') - 0.4, tO = VW('l29', 'odysseus') - 0.4, tM = VW('l29', 'marry') - 0.4;
  ctx.save(); cam(960, 560, 1.03);
  ithHall({ key: 'hn' });
  fig('penelope_sit', 300, FLOOR, 360);
  axes(620, 1500, 1, { t: tT, s: 0.9 });
  const u = arrowFlight(560, 1700, AXY, tSh + 0.9, 1.1);
  roundel(1650, 300, 130, at(tO, 0.6), () => { ground(400, { key: 'r29', bare: 1 }); fig('ody_bow', 1650, 400, 210, { still: true }); });
  glow(300, 560, 220, 'rgba(255,236,200,A)', 0.3 * at(tM, 0.6), 'lighter');
  void tSt; void u; ctx.restore();
  nightRoom(0.7, 400, FLOOR - 40);
}
function p30() {   // the next day the suitors tried, one after another (the hall by day, the axes in their row)
  const tN = VW('l30', 'next') - 0.4, tT = VW('l30', 'tried') - 0.4, tO = VW('l30', 'another') - 0.4;
  ctx.save(); cam(960, 580, 1.03);
  ithHall({ fireX: 1820, key: 'hb' });
  axes(560, 1280, 1, { s: 0.8 });
  fig('ody_beggar_sit', 300, FLOOR, 330);
  xf(tO - 0.3, 0.6, (a) => fig('suitor_bow', 1480, FLOOR, 380, { a, rot: 0.02 * Math.sin(TT * 17) }), (a) => fig('suitor_bow', 1480, FLOOR, 380, { a, flip: true, rot: 0.03 * Math.sin(TT * 19) }));
  fig('suitor', 1700, FLOOR, 400, { a: 0 });
  void tN; void tT; ctx.restore();
}
function p31() {   // they warmed the bow by the fire and rubbed it with fat, and none could even bend it
  const tW = VW('l31', 'warmed') - 0.4, tF = VW('l31', 'fat') - 0.4, tB = VW('l31', 'bend') - 0.4;
  ctx.save(); cam(lerp(1300, 1500, at(tW, 2)), 580, 1.08);
  ithHall({ fireX: 1820, key: 'hb' });
  axes(560, 1280, 1, { s: 0.8 });
  // the bow held over the fire, steaming
  if (TT < tB - 0.3) { bowC(1600, 600, 200, Math.PI / 2, 0.15, false); smoke(1640, 560, 0.35, at(tW, 0.5), 31); }
  fig('eurymachus', 1720, FLOOR, 410, { flip: true, rot: 0.01 * Math.sin(TT * 3) });
  if (TT > tF - 0.3) glow(1600, 600, 100, 'rgba(255,226,170,A)', 0.4 * (1 - at(tB - 0.6, 0.4)), 'lighter');
  if (TT > tB - 0.3) fig('suitor_bow', 1420, FLOOR, 380, { a: at(tB - 0.3, 0.3), rot: 0.035 * Math.sin(TT * 23) });
  ctx.restore();
}
function p32() {   // then the beggar asked for a turn
  const tB = VW('l32', 'beggar') - 0.4, tT = VW('l32', 'turn') - 0.4;
  ctx.save(); cam(lerp(960, 760, at(tB, 1.2)), 580, 1.05);
  ithHall({ fireX: 1820, key: 'hb' });
  axes(560, 1280, 1, { s: 0.8 });
  fig('suitor_bow', 1480, FLOOR, 380, { flip: true });
  xf(tB, 0.6, (a) => fig('ody_beggar_sit', 300, FLOOR, 330, { a }), (a) => fig('ody_beggar', 340, FLOOR, 370, { a, rot: 0.02 * at(tT, 0.4) }));
  ctx.restore();
}
function p33() {   // they laughed at him, and they shouted
  const tL = VW('l33', 'laughed') - 0.4, tS = VW('l33', 'shouted') - 0.4;
  ctx.save(); cam(960, 580, 1.03, shake(tS, 5));
  ithHall({ fireX: 1820, key: 'hb' });
  axes(560, 1280, 1, { s: 0.8 });
  fig('ody_beggar', 340, FLOOR, 370);
  fig('eurymachus', 1000, FLOOR, 410, { flip: true, rot: 0.04 * Math.sin(TT * 9) * at(tL, 0.3) });
  fig('suitor_throw', 1300, FLOOR, 390, { flip: true, rot: 0.03 * Math.sin(TT * 8) * at(tS, 0.3) });
  fig('suitor_bow', 1600, FLOOR, 380, { flip: true });
  for (const [x, y, t, k] of [[960, 380, tL, 1], [1260, 400, tS, 2], [1560, 420, tS + 0.2, 3]]) { const s = at(t, 0.3); if (s > 0) moo1(x, y, s, k); }
  ctx.restore();
}
function p34() {   // but Telemachus handed him the bow
  const tT = VW('l34', 'telemachus') - 0.4, tH = VW('l34', 'handed') - 0.4;
  ctx.save(); cam(lerp(960, 640, at(tH, 1.2)), 580, 1.05);
  ithHall({ fireX: 1820, key: 'hb' });
  axes(560, 1280, 1, { s: 0.8 });
  fig('eurymachus', 1300, FLOOR, 410, { flip: true });
  fig('suitor_bow', 1600, FLOOR, 380, { flip: true, a: 0 });
  const w = walk(1100, 640, tT - 0.4, 1.4, 6, 5);
  xf(tH, 0.4, (a) => fig('telemachus', w.x, FLOOR + w.dy, 440, { a, flip: true, rot: w.rot }), (a) => fig('telemachus_give', 640, FLOOR, 440, { a, flip: true }));
  xf(tH + 0.4, 0.5, (a) => fig('ody_beggar', 340, FLOOR, 370, { a }), (a) => fig('ody_beggar_sit', 300, FLOOR, 330, { a }));
  ctx.restore();
}
function p35() {   // he turned it over in his hands, the way a musician picks up a lyre he knows (the singer in a roundel)
  const tT = VW('l35', 'turned') - 0.4, tM = VW('l35', 'musician') - 0.4, tL = VW('l35', 'lyre') - 0.4;
  ctx.save(); cam(lerp(640, 480, at(tT, 2)), 580, 1.1 + 0.08 * at(tT, 2));
  ithHall({ fireX: 1820, key: 'hb' });
  axes(560, 1280, 1, { s: 0.8 });
  fig('ody_string', 320, FLOOR, 340, { rot: 0.03 * Math.sin(TT * 1.6) });
  fig('telemachus', 860, FLOOR, 440, { flip: true });
  roundel(700, 320, 140, at(tM, 0.6), () => { ground(420, { key: 'r35', bare: 1 }); fig('demodocus', 700, 420, 230, { still: true }); const [mx, my] = ptf('demodocus', 700, 420, 230, 0.75, 0.1); song(mx, my, at(tL, 0.4), 35); });
  ctx.restore();
}
function p36() {   // without even getting up from his seat, he strung it, easily
  const tW = VW('l36', 'without') - 0.4, tS = VW('l36', 'strung') - 0.4, tE = VW('l36', 'easily') - 0.4;
  ctx.save(); cam(480, 600, 1.2);
  ithHall({ fireX: 1820, key: 'hb' });
  axes(560, 1280, 1, { s: 0.8 });
  fig('ody_string', 320, FLOOR, 340, { rot: -0.02 * Math.sin(Math.PI * clamp((TT - tS) / 0.6)) });
  const [bx, by] = ptf('ody_string', 320, FLOOR, 340, 0.85, 0.03); glow(bx, by, 60, 'rgba(255,236,200,A)', 0.7 * at(tE, 0.3) * (1 - at(tE + 0.8, 0.4)), 'lighter');
  fig('telemachus', 860, FLOOR, 440, { flip: true });
  void tW; ctx.restore();
}
function p37() {   // he plucked the string and it sang like a swallow (a swallow flies off the string)
  const tP = VW('l37', 'plucked') - 0.4, tSa = VW('l37', 'sang') - 0.4, tSw = VW('l37', 'swallow') - 0.4;
  ctx.save(); cam(lerp(480, 700, at(tSw, 1.6)), 560, 1.2 - 0.1 * at(tSw, 1.6));
  ithHall({ fireX: 1820, key: 'hb' });
  axes(560, 1280, 1, { s: 0.8 });
  fig('ody_string', 320, FLOOR, 340);
  const [sx, sy] = ptf('ody_string', 320, FLOOR, 340, 0.79, 0.45);
  if (TT > tP) { const v = Math.exp(-(TT - tP) * 3) * Math.sin((TT - tP) * 60); ctx.save(); ctx.strokeStyle = 'rgba(240,222,190,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, sy - 120); ctx.quadraticCurveTo(sx + 14 * v, sy, sx, sy + 140); ctx.stroke(); ctx.restore(); }
  song(sx + 30, sy - 40, at(tSa, 0.4), 37);
  const u = clamp((TT - tSw) / 2.2); if (u > 0) swallow(sx + 40 + u * 900, sy - 40 - 260 * Math.sin(u * 2.4) , 1.2, 1);
  fig('telemachus', 860, FLOOR, 440, { flip: true });
  ctx.restore();
}
function p38() {   // out of a clear sky, Zeus thundered: a bolt over the hall, the suitors flinch
  const tC = VW('l38', 'clear') - 0.4, tZ = VW('l38', 'zeus') - 0.4, tTh = VW('l38', 'thundered') - 0.3;
  ctx.save(); cam(960, 560, 1.02, shake(tTh, 12, 1.0));
  ithHall({ fireX: 1820, key: 'hb' });
  axes(560, 1280, 1, { s: 0.8 });
  fig('ody_string', 320, FLOOR, 340);
  fig('eurymachus', 1300, FLOOR, 410, { flip: true, rot: -0.05 * at(tTh, 0.2) });
  fig('suitor_cower', 1580, FLOOR, 360, { flip: true, a: at(tTh, 0.25) });
  roundel(960, 280, 140, at(tZ, 0.5), () => { clouds(330, 1); fig('zeus', 960, 400, 240, { still: true }); });
  const b = bolt(tTh, 980, 0.45); if (b > 0) tint('rgba(255,240,210,1)', 0.25 * b, 'lighter');
  void tC; ctx.restore();
}
function p39() {   // he fitted an arrow and shot it through all twelve axes without touching one — hold, silence
  const tF = VW('l39', 'fitted') - 0.4, tSh = VW('l39', 'shot') - 0.3, tT = VW('l39', 'touching') - 0.4;
  ctx.save(); cam(lerp(800, 1000, at(tSh, 2)), 600, 1.05 + 0.05 * at(tT, 2));
  ithHall({ fireX: 1820, key: 'hb' });
  axes(640, 1420, 1, { s: 0.85, glint: tSh + 0.1 });
  xf(tF, 0.5, (a) => fig('ody_string', 320, FLOOR, 340, { a }), (a) => fig('ody_shoot_sit', 360, FLOOR, 330, { a }));
  const ay = ptf('ody_shoot_sit', 360, FLOOR, 330, 0.95, 0.33)[1];
  arrowFlight(560, 1546, AXY, tSh, 1.0);
  if (TT > tSh + 1.0) arrowC(1546 + 2 * Math.sin((TT - tSh - 1) * 60) * Math.exp(-(TT - tSh - 1) * 6), AXY, 0, 110);   // it sticks quivering in the far column
  fig('suitor_cower', 1760, FLOOR, 360, { flip: true });
  void ay; ctx.restore();
}
function p40() {   // he tore off his rags, leapt onto the threshold, and poured the arrows out at his feet
  const tR = VW('l40', 'rags') - 0.4, tL = VW('l40', 'leapt') - 0.4, tP = VW('l40', 'poured') - 0.4;
  ctx.save(); cam(lerp(900, 760, at(tL, 1.2)), 580, 1.06);
  ithHall({ fireX: 1820, key: 'hb' });
  // the threshold: a stone step by the door
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.fillRect(160, FLOOR - 30, 460, 30); ctx.strokeRect(160, FLOOR - 30, 460, 30); ctx.restore();
  const j = Math.sin(Math.PI * clamp((TT - tL) / 0.6)) * 70;
  xf(tR, 0.5, (a) => fig('ody_shoot_sit', 360, FLOOR, 330, { a }), (a) => fig('ody_bow', 400, FLOOR - 30 - j, 390, { a, rot: -0.03 * j / 70 }));
  // the rags flung aside
  if (TT > tR) { const u = clamp((TT - tR) / 0.8); ctx.save(); ctx.globalAlpha *= 1 - 0.3 * u; ctx.fillStyle = BF.black; ctx.translate(lerp(380, 140, u), lerp(620, FLOOR - 10, EZ.i2(u))); ctx.rotate(u * 2); ctx.beginPath(); ctx.moveTo(-50, -20); ctx.lineTo(40, -30); ctx.lineTo(56, 10); ctx.lineTo(30, 4); ctx.lineTo(20, 26); ctx.lineTo(-10, 8); ctx.lineTo(-44, 22); ctx.closePath(); ctx.fill(); ctx.restore(); }
  // the arrows poured out at his feet
  for (let i = 0; i < 9; i++) { const u = clamp((TT - tP - i * 0.06) / 0.45); if (u <= 0) continue; arrowC(lerp(430, 470 + i * 26, u), lerp(620, FLOOR - 36, EZ.i2(u)), lerp(Math.PI / 2, 0.08 * (i - 4), u), 90); }
  fig('suitor', 1300, FLOOR, 400, {});
  fig('eurymachus', 1600, FLOOR, 410, { flip: true });
  ctx.restore();
}
function p41() {   // the first one went into the throat of Antinous as he lifted his cup
  const tA = VW('l41', 'antinous') - 0.4, tL = VW('l41', 'lifting') - 0.4, tF = VW('l41', 'first') - 0.4, hitT = VW('l41', 'throat') - 0.1;
  ctx.save(); cam(lerp(800, 1150, at(tF, 1.2)), 580, 1.06, shake(hitT + 0.35, 6));
  ithHall({ fireX: 1820, key: 'hb' });
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.fillRect(160, FLOOR - 30, 460, 30); ctx.strokeRect(160, FLOOR - 30, 460, 30); ctx.restore();
  for (let i = 0; i < 9; i++) arrowC(470 + i * 26, FLOOR - 36, 0.08 * (i - 4), 90);
  fig('ody_bow', 400, FLOOR - 30, 390);
  const fl = arrowFlight(640, 1250, 560, hitT - 0.3, 0.35);
  const fall = EZ.i2(clamp((TT - hitT - 0.3) / 0.9));
  xf(hitT + 0.3, 0.3, (a) => fig('suitor', 1300, FLOOR, 400, { a, rot: 0.04 * at(tL, 0.6) }), (a) => fig('antinous_fall', 1360 + 60 * fall, FLOOR, 400, { a, flip: true, rot: 0.25 * fall }));
  fig('eurymachus', 1660, FLOOR, 410, { flip: true, rot: -0.04 * at(hitT + 0.3, 0.3) });
  void tA; void fl; ctx.restore();
}
function p42() {   // you dogs, said Odysseus — you thought I'd never come home
  const tD = VW('l42', 'dogs') - 0.4, tH = VW('l42', 'home') - 0.4;
  ctx.save(); cam(lerp(600, 520, at(tD, 1)), 560, 1.15, shake(tD + 0.1, 4));
  ithHall({ fireX: 1820, key: 'hb' });
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.fillRect(160, FLOOR - 30, 460, 30); ctx.strokeRect(160, FLOOR - 30, 460, 30); ctx.restore();
  fig('ody_bow', 400, FLOOR - 30, 390);
  eyeGlint(...ptf('ody_bow', 400, FLOOR - 30, 390, 0.47, 0.08), at(tD, 0.3));
  fig('suitor_dead', 1050, FLOOR + 4, 120);
  fig('suitor_cower', 1520, FLOOR, 360, { flip: true });
  void tH; ctx.restore();
}
function p43() {   // the doors were locked, and the spears had been taken down off the walls the night before
  const tDo = VW('l43', 'doors') - 0.4, tL = VW('l43', 'locked') - 0.3, tS = VW('l43', 'spears') - 0.4, tN = VW('l43', 'night') - 0.4;
  ctx.save(); cam(960, 580, 1.03);
  ithHall({ key: 'hd' });
  doors(560, at(tDo, 0.8) * 0.8 + 0.2 * at(tL, 0.4));
  spearRack(1140, 10, clamp((TT - tS) / 2.2));
  fig('suitor_cower', 900, FLOOR, 360, { flip: true, a: 0 });
  void tN; ctx.restore();
}
function p44() {   // Odysseus, his son and two loyal servants fought more than a hundred men in that hall
  const tO = VW('l44', 'odysseus') - 0.4, tS = VW('l44', 'son') - 0.4, tT = VW('l44', 'servants') - 0.4, tF = VW('l44', 'fought') - 0.4, tH = VW('l44', 'hundred') - 0.4;
  ctx.save(); cam(960, 580, 1.03, 2 * at(tF, 0.4));
  ithHall({ key: 'hf' });
  const thr = (t, x) => x + 30 * Math.max(0, Math.sin((TT - t) * 5)) * at(t, 0.3);
  fig('cowherd', thr(tF + 0.2, 160), FLOOR, 400, { a: at(tT, 0.5) });
  fig('eumaeus', thr(tF + 0.5, 380), FLOOR, 400, { a: at(tT - 0.2, 0.5) });
  fig('telemachus', thr(tF, 620), FLOOR, 440, { a: at(tS, 0.5) });
  fig('ody_sword', thr(tF + 0.3, 860), FLOOR, 420, { a: at(tO, 0.4) });
  // the suitors, many against four
  fig('suitor_throw', 1180, FLOOR, 390, { flip: true });
  fig('suitor_cower', 1400, FLOOR, 360, { flip: true });
  fig('eurymachus', 1620, FLOOR, 410, { flip: true });
  for (let i = 0; i < 7; i++) { const k = at(tH + i * 0.08, 0.4); if (k <= 0) continue; fig(['suitor_bow', 'suitor', 'suitor_throw'][i % 3], 1250 + i * 110, FLOOR - 80, 190, { a: 0.85 * k, flip: true, still: true }); }
  ctx.restore();
}
function p45() {   // they fought until the floor ran with blood and nobody else was left standing (the vase register: they fall, one by one)
  const tK = VW('l45', 'kept') - 0.4, tFl = VW('l45', 'floor') - 0.4, tN = VW('l45', 'nobody') - 0.4, tSt = VW('l45', 'standing') - 0.4;
  const fall = (t) => EZ.i2(clamp((TT - t) / 0.6));
  ctx.save(); cam(lerp(960, 760, at(tN, 2.4)), 580, 1.03 + 0.06 * at(tN, 2.4), 3 * (1 - at(tN, 1)));
  ithHall({ key: 'hf' });
  // the dark pool spreading on the floor (the figures' brown, no red)
  const pk = at(tFl, 1.8); if (pk > 0) { ctx.save(); ctx.fillStyle = FIRE_COL; ctx.globalAlpha *= 0.85; ctx.beginPath(); ctx.ellipse(1300, FLOOR + 20, 700 * pk, 40 * pk, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  for (const [x, f, t] of [[1100, false, tK], [1360, true, tK + 0.8], [1640, false, tFl]]) { if (TT > t + 0.5) fig('suitor_dead', x, FLOOR + 6, 120, { flip: f, a: at(t + 0.5, 0.3), still: true }); }
  xf(tK + 0.4, 0.3, (a) => fig('suitor_throw', 1180, FLOOR, 390, { flip: true, a, rot: 0.3 * fall(tK) }), () => {});
  xf(tK + 1.2, 0.3, (a) => fig('suitor_cower', 1400, FLOOR, 360, { flip: true, a, rot: 0.3 * fall(tK + 0.8) }), () => {});
  xf(tFl + 0.4, 0.3, (a) => fig('eurymachus', 1620, FLOOR, 410, { flip: true, a, rot: 0.3 * fall(tFl) }), () => {});
  fig('telemachus', 620, FLOOR, 440);
  fig('ody_sword', 880, FLOOR, 420);
  fig('eumaeus', 380, FLOOR, 400);
  fig('cowherd', 160, FLOOR, 400);
  ctx.restore();
  tint('#1a0c10', 0.3 * at(tSt, 1.2), 'multiply');
}
// ---- 14 · PENELOPE'S BED
function p46() {   // the old nurse ran upstairs to wake Penelope; the chapter title
  const t0 = SUB('p46'), tN = VW('l46', 'nurse') - 0.4, tU = VW('l46', 'upstairs') - 0.4;
  ctx.save(); cam(960, 580, 1.03);
  ithHall({ key: 'hs' });
  stairs(900, 9, 70, 32);
  const w = walk(300, 1400, tN - 0.4, 3.6, 7, 6); fig('nurse_run', w.x, stairY(w.x) + w.dy, 360, { rot: w.rot - 0.06 * clamp((w.x - 700) / 400) });
  letters("XIV · PENELOPE'S BED", 620, 280, t0 + 0.4, 84, { step: 0.05 });
  void tU; ctx.restore();
}
function p47() {   // he's here, she told her: Odysseus is home, and he's killed them all
  const tH = VW('l47', 'here') - 0.4, tO = VW('l47', 'odysseus') - 0.4, tK = VW('l47', 'killed') - 0.4;
  ctx.save(); cam(960, 580, 1.04);
  ithHall({ key: 'hr' });
  loom(1680, 0.25, { w: 240 });
  fig('nurse_run', 640, FLOOR, 360);
  fig('penelope', 1180, FLOOR, 420, { flip: true, rot: 0.02 * at(tO, 0.4) });
  roundel(900, 300, 130, at(tK, 0.6), () => { ground(400, { key: 'r47', bare: 1 }); fig('suitor_dead', 900, 404, 70, { still: true }); fig('ody_bow', 860, 400, 160, { still: true }); });
  glow(1150, 460, 240, 'rgba(255,236,200,A)', 0.3 * at(tO, 0.5), 'lighter');
  void tH; ctx.restore();
}
function p48() {   // Penelope came down and sat across the fire from him, looked at him a long time, and said nothing
  const tC = VW('l48', 'came') - 0.4, tS = VW('l48', 'sat') - 0.4, tL = VW('l48', 'long') - 0.4, tN = VW('l48', 'nothing') - 0.4;
  ctx.save(); cam(960, 600, 1.03 + 0.07 * at(tL, 2.5));
  ithHall({ fireX: 960, key: 'hc', fireK: 0.8 });
  xf(tS, 0.6, (a) => { const w = walk(-700, 560, tC - 0.6, 2.8, 5, 5); fig('penelope', w.x, FLOOR + w.dy, 420, { a, rot: w.rot }); }, (a) => fig('penelope_sit', 560, FLOOR, 360, { a }));
  fig('ody_sit', 1380, FLOOR, 360);
  void tN; ctx.restore();
}
function p49() {   // Telemachus was furious with her: Mother, how can you be so cold?
  const tF = VW('l49', 'furious') - 0.4, tM = VW('l49', 'mother') - 0.4, tC = VW('l49', 'cold') - 0.4;
  ctx.save(); cam(960, 600, 1.05, shake(tM, 3));
  ithHall({ fireX: 960, key: 'hc', fireK: 0.8 });
  fig('penelope_sit', 560, FLOOR, 360);
  fig('ody_sit', 1380, FLOOR, 360);
  const w = walk(1900, 1120, tF - 0.6, 1.4, 6, 6); fig('telemachus', w.x, FLOOR + w.dy, 440, { flip: true, rot: w.rot - 0.03 * at(tM, 0.3) });
  moo1(w.x - 120, 420, at(tM, 0.3), 49);
  void tC; ctx.restore();
}
function p50() {   // she had waited twenty years; gods had walked through her house in disguise (Athena in a roundel, the old man and the god)
  const tW = VW('l50', 'waited') - 0.4, tG = VW('l50', 'gods') - 0.4, tD = VW('l50', 'disguise') - 0.4;
  ctx.save(); cam(lerp(960, 700, at(tW, 2)), 600, 1.06);
  ithHall({ fireX: 960, key: 'hc', fireK: 0.8 });
  fig('penelope_sit', 560, FLOOR, 360);
  fig('ody_sit', 1380, FLOOR, 360);
  tally(20, 220, 170, tW, 0.04, { w: 6, len: 46, gap: 18 });
  roundel(960, 330, 150, at(tG, 0.6), () => { ground(450, { key: 'r50', bare: 1 }); xf(tD, 0.6, (a) => fig('athena', 960, 450, 250, { still: true, a, flip: true }), (a) => fig('ody_beggar', 960, 450, 220, { still: true, a, flip: true })); sparks(960, 360, at(tD, 0.3) * (1 - at(tD + 1, 0.4)), 50, 50); });
  ctx.restore();
}
function p51() {   // she wasn't going to throw her arms around a stranger because he said he was her husband
  const tA = VW('l51', 'arms') - 0.4, tSt = VW('l51', 'stranger') - 0.4, tH = VW('l51', 'husband') - 0.4;
  ctx.save(); cam(960, 600, 1.05);
  ithHall({ fireX: 960, key: 'hc', fireK: 0.8 });
  fig('penelope_sit', 560, FLOOR, 360, { rot: -0.015 * at(tA, 0.5) });
  xf(tSt, 0.6, (a) => fig('ody_sit', 1380, FLOOR, 360, { a }), (a) => fig('ody_tell', 1360, FLOOR, 420, { a }));
  void tH; ctx.restore();
}
function p52() {   // so she tested him: move our bed out of the bedroom so he can sleep on it (the bed in a roundel, sliding)
  const tT = VW('l52', 'tested') - 0.4, tN = VW('l52', 'nurse') - 0.4, tM = VW('l52', 'move') - 0.4, tB = VW('l52', 'bed') - 0.4;
  ctx.save(); cam(960, 600, 1.04);
  ithHall({ fireX: 960, key: 'hc', fireK: 0.8 });
  fig('penelope_sit', 560, FLOOR, 360);
  fig('ody_tell', 1360, FLOOR, 420);
  fig('nurse_run', 220, FLOOR, 340, { a: at(tN - 0.6, 0.5) });
  roundel(960, 320, 150, at(tB, 0.6), () => { ground(440, { key: 'r52', bare: 1 }); bfLay('olive_bed.webp', 960 + 60 * Math.sin(Math.PI * clamp((TT - tB - 0.6) / 1.4)), 440, 210); });
  void tT; void tM; ctx.restore();
}
function p53() {   // and Odysseus, who'd tricked a giant and a witch and a hundred suitors, finally lost his temper
  const tG = VW('l53', 'giant') - 0.4, tWi = VW('l53', 'witch') - 0.4, tS = VW('l53', 'suitors') - 0.4, tT = VW('l53', 'temper') - 0.4;
  ctx.save(); cam(960, 600, 1.04, shake(tT, 6));
  ithHall({ fireX: 960, key: 'hc', fireK: 0.8 + 0.4 * at(tT, 0.3) });
  fig('penelope_sit', 560, FLOOR, 360);
  xf(tT, 0.4, (a) => fig('ody_tell', 1360, FLOOR, 420, { a }), (a) => fig('ody_shout', 1360, FLOOR, 430, { a }));
  [[560, tG, () => fig('cyclops_sit', 560, 360, 190, { still: true })], [960, tWi, () => fig('circe_wand', 960, 360, 200, { still: true })], [1360, tS, () => fig('suitor', 1360, 360, 190, { still: true })]].forEach(([x, t, f], i) =>
    roundel(x, 260, 110, at(t, 0.5) * (1 - at(tT - 0.2, 0.4)), () => { ground(360, { key: 'r53' + i, bare: 1 }); f(); }));
  ctx.restore();
}
function p54() {   // who moved my bed? nobody can move that bed
  const tW = VW('l54', 'who') - 0.3, tN = VW('l54', 'nobody') - 0.4;
  ctx.save(); cam(lerp(1100, 1300, at(tW, 1)), 560, 1.12, shake(tW + 0.2, 7) + shake(tN, 5));
  ithHall({ fireX: 960, key: 'hc', fireK: 1.2 });
  fig('penelope_sit', 560, FLOOR, 360);
  fig('ody_shout', 1360, FLOOR, 430, { rot: 0.02 * Math.sin(TT * 9) });
  ctx.restore();
}
function p55() {   // I built it myself, around the trunk of an olive tree growing right there in the house (the bedroom: the bed grows up out of the floor)
  const tB = VW('l55', 'built') - 0.4, tTr = VW('l55', 'trunk') - 0.4, tO = VW('l55', 'olive') - 0.4, tH = VW('l55', 'house') - 0.4;
  ctx.save(); cam(960, 560, 1.03);
  ithHall({ key: 'hbd' });
  const g = at(tTr - 0.3, 2.4), [nw, nh] = nat('olive_bed'), h = 580, w = h * nw / nh;
  // the bed rises out of the floor line, the crown spreads last
  ctx.save(); ctx.beginPath(); ctx.rect(-400, FLOOR + 30 - (h + 60) * g, W + 800, (h + 60) * g + 20); ctx.clip(); bfLay('olive_bed.webp', 1050, FLOOR + 30, h); ctx.restore();
  fig('ody_tell', 360, FLOOR, 420);
  void tB; void tO; void tH; void w; ctx.restore();
}
function p56() {   // the tree is one of its legs; to move it you'd have to cut it down (an axe in a roundel, struck out)
  const tT = VW('l56', 'tree') - 0.4, tL = VW('l56', 'legs') - 0.4, tC = VW('l56', 'cut') - 0.4, tD = VW('l56', 'down') - 0.3;
  ctx.save(); cam(lerp(960, 760, at(tL, 1.2)), 640, 1.03 + 0.14 * at(tL, 1.2));
  ithHall({ key: 'hbd' });
  bfLay('olive_bed.webp', 1050, FLOOR + 30, 580);
  const [nw, nh] = nat('olive_bed'), w = 580 * nw / nh; glow(1050 - w / 2 + 0.2 * w, FLOOR - 160, 200, 'rgba(255,236,200,A)', 0.4 * at(tL, 0.5), 'lighter');
  fig('ody_tell', 360, FLOOR, 420);
  roundel(700, 300, 120, at(tC, 0.5), () => { ground(400, { key: 'r56', bare: 1 }); fig('ody_axe', 700, 400, 200, { still: true }); const s = at(tD, 0.4); if (s > 0) { ctx.save(); ctx.strokeStyle = FIRE_COL; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(620, 220); ctx.lineTo(lerp(620, 780, s), lerp(220, 380, s)); ctx.stroke(); ctx.restore(); } });
  void tT; ctx.restore();
}
function p57() {   // only the two of them had ever known that (the hearth again: the two faces, a warm glow between)
  const tO = VW('l57', 'only') - 0.4, tT = VW('l57', 'two') - 0.4, tK = VW('l57', 'known') - 0.4;
  ctx.save(); cam(960, 560, 1.12);
  ithHall({ fireX: 960, key: 'hc', fireK: 0.8 });
  fig('penelope_sit', 560, FLOOR, 360);
  fig('ody_tell', 1360, FLOOR, 420);
  glow(960, 480, 520, 'rgba(255,226,180,A)', 0.4 * at(tT, 1), 'lighter');
  eyeGlint(...ptf('penelope_sit', 560, FLOOR, 360, 0.62, 0.1), at(tK, 0.4));
  void tO; ctx.restore();
}
function p58() {   // Penelope ran to him then, and held him, and cried — the closing image under the olive bed
  const tR = VW('l58', 'ran') - 0.4, tH = VW('l58', 'held') - 0.4, tC = VW('l58', 'cried') - 0.4;
  ctx.save(); cam(lerp(960, 1000, at(tH, 3)), 560, 1.03 + 0.07 * at(tH, 3));
  ithHall({ key: 'hbd' });
  bfLay('olive_bed.webp', 1360, FLOOR + 30, 580);
  const w = walk(260, 620, tR - 0.3, 0.9, 9, 6);
  xf(tH, 0.6, (a) => { fig('penelope', w.x, FLOOR + w.dy, 420, { a, rot: w.rot }); fig('ody_tell', 820, FLOOR, 420, { a }); }, (a) => fig('embrace', 720, FLOOR, 430, { a }));
  const [ex, ey] = ptf('embrace', 720, FLOOR, 430, 0.62, 0.17); tears(ex, ey, at(tC, 0.4), 58);
  glow(720, 500, 420, 'rgba(255,226,180,A)', 0.35 * at(tH, 1), 'lighter');
  ctx.restore();
}
function p59() {   // twelve ships and six hundred men, every one lost along the way (open paper: the fleet struck out)
  const tT = VW('l59', 'twelve') - 0.4, tSi = VW('l59', 'six') - 0.4, tL = VW('l59', 'lost') - 0.4;
  ctx.save(); cam(960, 560, 1.02);
  sea(SEA, { speed: 8 });
  ctx.save(); ctx.translate(960, 420); ctx.scale(2.2, 2.2); fleet(0, 0, tT, (i) => tL + i * 0.12, { gap: 60 }); ctx.restore();
  // six hundred men: little strokes in rows that fade
  const k = at(tSi, 0.5); if (k > 0) { ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 3; for (let i = 0; i < 120; i++) { const x = 300 + (i % 60) * 22, y = 520 + Math.floor(i / 60) * 50, kk = clamp(k * 3 - i / 60) * (1 - at(tL + 0.4 + i * 0.01, 0.4)); if (kk <= 0) continue; ctx.globalAlpha = kk; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 36); ctx.stroke(); } ctx.restore(); }
  ctx.restore();
}
function p60() {   // some to the sea and the monsters, some to the gods, more than a few to his own pride
  const tS = VW('l60', 'sea') - 0.4, tM = VW('l60', 'monsters') - 0.4, tG = VW('l60', 'gods') - 0.4, tP = VW('l60', 'pride') - 0.4;
  ctx.save(); cam(960, 560, 1.02);
  sea(SEA + 60, { speed: 8 });
  roundel(480, 420, 170, at(tS, 0.6), () => { sea(470, { speed: 16 }); if (TT < tM) sinkShip(480, 540, 260, clamp((TT - tS) / 2)); else bfLay('scylla.webp', 480, 600, 280, { a: at(tM, 0.4) }); });
  roundel(960, 420, 170, at(tG, 0.6), () => { clouds(470, 1); fig('zeus', 900, 560, 250, { still: true }); fig('poseidon', 1030, 580, 220, { still: true }); });
  roundel(1440, 420, 170, at(tP, 0.6), () => { sea(480, { speed: 10 }); ship(1440, 560, 240, { behind: (s) => shipOdy(s, 0.1, 'ody_shout', 110) }); });
  ctx.restore();
}
function p61() {   // but he was home: the island at night, a light in the window of his house
  const tH = VW('l61', 'home') - 0.4, u = EZ.io(pu('p61'));
  ctx.save(); cam(lerp(1000, 1100, u), 560, 1.02 + 0.06 * u);
  sea(SEA, { speed: 5 });
  coast(1150, SEA + 4, 380, { flip: true });
  homeHouse(1150, SEA - 300, 0.8, at(tH - 0.3, 0.6));
  ctx.restore();
  night(0.8, 500, 240);
}
function p62() {   // and that night Athena held back the dawn, so the night would last a little longer
  const tA = VW('l62', 'athena') - 0.4, tHe = VW('l62', 'held') - 0.4, tD = VW('l62', 'dawn') - 0.4, tL = VW('l62', 'longer') - 0.4;
  const rise = 0.6 * at(tD - 1.2, 1.0) * (1 - at(tHe + 0.6, 1.4));
  ctx.save(); cam(960, 560, 1.02);
  sea(SEA, { speed: 4 });
  heldSun(420, SEA, rise + 0.42);
  ground(FLOOR, { key: 'p62', sand: 1, x0: 760, slope: 140 });
  coast(1500, SEA + 4, 380, { flip: true });
  homeHouse(1500, SEA - 300, 0.8, 1);
  fig('athena_wand', 1000, FLOOR, 430, { a: at(tA, 0.8), flip: true });
  const [wx, wy] = ptf('athena_wand', 1000, FLOOR, 430, 0.97, 0.36, { flip: true }); sparks(wx, wy, at(tHe, 0.4), 62, 50);
  void tL; ctx.restore();
  night(0.75 - 0.15 * rise, 1700, 220);
}
function p63() {   // the sign-off: the apple and AMPHORUS in gold, the end of the whole long video
  const t0 = SUB('p63') + 0.3;   // then it holds ~15 s, calm, for the YouTube end-screen boxes: only a very slow drift in
  ctx.save(); cam(960, 560, 1 + 0.025 * clamp((TT - t0 - 1.5) / 14));
  const k = EZ.back(clamp((TT - t0) / 0.7)), sz = 340 * k, bob = 3 * Math.sin((TT - t0) * 0.5);
  if (sz > 1) { ctx.save(); ctx.globalAlpha *= clamp(k * 1.5); ctx.translate(960, 440 + bob); ctx.rotate(0.03 * Math.sin((TT - t0) * 1.2)); drawAsset('apple.png', -sz / 2, -sz / 2, sz, sz, { fit: 'contain' }); ctx.restore(); }
  if (TT > t0 + 0.4) { ctx.save(); ctx.globalAlpha *= EZ.o2(clamp((TT - t0 - 0.4) / 0.8)); bfLogo('AMPHORUS', 960, 760, 110, t0); ctx.restore(); }
  ctx.restore();
}

// =====================================================================
//  captions: Dalek Pinpoint Bold 40px, cream, a soft black drop shadow, centred low in the picture (baseline 898).
//  One phrase at a time (≤ 9 words, one line), each word written on its spoken word; the last one slides out with its panel.
// =====================================================================
const CAP_FONT = '"Dalek Pinpoint", "DalekPinpointBold", Georgia, serif', CAP_SIZE = 40, CAP_Y = 898, CAP_COL = 'rgb(240,222,190)';
const PAT = (t) => { let p = IDS[0]; for (let i = 0; i < IDS.length; i++) if (t >= TB[i] - 0.3) p = IDS[i]; return p; };
// (a line's last word is never left on its own: no break with one word to go)
const KCH = [], FUNC = new Set(['and', 'the', 'a', 'of', 'to', 'with', 'in', 'on', 'at', 'his', 'her', 'for', 'that', 'it', 'he', 'they', 'into', 'from', 'as', 'under', 'over', 'if', 'but', 'so']);
for (const L of VOICE.lines) { const ws = L.text.split(/\s+/); let cur = null; const mine = [];
  ws.forEach((w, i) => { const t = L.words[i] ? L.words[i].t0 : L.t0; if (!cur) { cur = { id: L.id, p: PAT(t), ws: [], ts: [] }; mine.push(cur); } cur.ws.push(w); cur.ts.push(t);
    const n = cur.ws.length, chars = cur.ws.join(' ').length, left = ws.length - 1 - i;
    if ((/[.?!]$/.test(w)) || (/[,:;]$/.test(w) && n >= 3 && left >= 2)) cur = null;
    else if ((n >= 8 || chars > 44) && left > 1) { if (n >= 4 && FUNC.has(w.toLowerCase())) { cur.ws.pop(); cur.ts.pop(); cur = { id: L.id, p: PAT(t), ws: [w], ts: [t] }; mine.push(cur); } else cur = null; } });
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
const FULL_SET = new Set(['p03','p04','p05','p06','p07','p08','p09','p10','p11','p15','p16','p17','p18','p19','p20','p21','p22','p23','p24','p25','p26','p27','p28','p29','p30','p31','p32','p33','p34','p35','p36','p37','p38','p39','p40','p41','p42','p43','p44','p45','p46','p47','p48','p49','p50','p51','p52','p53','p54','p55','p56','p57','p58']);   // panels that fill the picture with a set (the hall, the palace gate, the rooms): they slide in as cards
const FG_SET = new Set(['circe_house.webp', 'coast.webp', 'ship_beached', 'scylla.webp', 'charybdis.webp', 'figtree.webp', 'bones.webp', 'troy_walls.webp', 'calypso_cave.webp', 'olive_bed.webp']), JUNK = document.createElement('canvas'); JUNK.width = JUNK.height = 2;
const fgRoute = (f) => function (...a) { if (!FGX) return f(...a); const j = ctx; FGX.setTransform(j.getTransform()); FGX.globalAlpha = j.globalAlpha; ctx = FGX; try { return f(...a); } finally { ctx = j; } };
const _bfLay = bfLay, _rock = rock, _fgLay = fgRoute(_bfLay);
// a card sliding in over a panel of the same room: a figure the new card also shows fades out of the old one, so nobody is on screen twice
let COLLECT = null, FADE = null;
const WHO = (n) => { n = n.replace('.webp', ''); return /^(ody_|embrace)/.test(n) ? 'ody' : n.startsWith('penelope') ? 'pen' : n.startsWith('telemachus') ? 'tel' : n.startsWith('argos') ? 'argos' : n.startsWith('athena') ? 'ath' : (n === 'suitor' || n === 'antinous_fall') ? 'ant' : n; };
bfLay = function (name, ...a) {
  if (COLLECT) { COLLECT.add(WHO(name)); return; }
  if (FADE && FADE.names.has(WHO(name)) && !FG_SET.has(name)) { a[3] = { ...(a[3] || {}), a: (a[3]?.a ?? 1) * FADE.k }; if (a[3].a <= 0) return; }
  return FGX && !FG_SET.has(name) ? _fgLay(name, ...a) : _bfLay(name, ...a); };
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
const PANELS = { p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24, p25, p26, p27, p28, p29, p30, p31, p32, p33, p34, p35, p36, p37, p38, p39, p40, p41, p42, p43, p44, p45, p46, p47, p48, p49, p50, p51, p52, p53, p54, p55, p56, p57, p58, p59, p60, p61, p62, p63 };
function sceneStage() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); drawAsset('bg.jpg', 0, 0, W, H);   // the ground and its friezes stay put
  const p = bfStripPos(), off = p * W, i0 = Math.min(IDS.length - 1, Math.floor(p)), i1 = Math.min(IDS.length - 1, i0 + 1);
  // a slide. Into an open panel (mostly bare paper: sea, ship, outdoors) the frieze is one long strip: both panels move
  // together over the same paper, and the figures cross the seam. Into a full set (the cave) the new panel slides in
  // over the old one, opaque, while the old one drifts a little left underneath.
  const u = off / W - i0, sliding = i0 !== i1 && u > 0, card = sliding && FULL_SET.has(IDS[i1]);
  const pos = !sliding ? [[i0, 0]] : card ? [[i0, -SLIDE_PAR * u * W], [i1, (1 - u) * W]] : [[i0, -u * W], [i1, (1 - u) * W]];
  let dup = null;
  if (card) { const main = ctx; dup = new Set(); ctx = JUNK.getContext('2d'); COLLECT = dup; try { ctx.save(); PANELS[IDS[i1]](); ctx.restore(); } finally { COLLECT = null; ctx = main; } }
  for (const [i, dx] of pos) {
    BF_PDX = dx; FADE = card && i === i0 ? { names: dup, k: 1 - EZ.io(clamp(u / 0.45)) } : null;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, BF_PDX, 0);
    ctx.beginPath(); ctx.rect(0, PIC0, W, PIC1 - PIC0); ctx.clip();
    if (card && i === i1) drawAsset('bg.jpg', 0, 0, W, H);   // a full set carries its own paper, so it hides the panel below
    PANELS[IDS[i]]();
    ctx.restore();
    FADE = null;
    kCaptions(i, card && i === i0 ? (1 - u) * W : W);
  }
  if (sliding && !card) { slideOverflow(i0, -u * W); slideOverflow(i1, (1 - u) * W); }
  if (card) { const x = (1 - u) * W, g = ctx.createLinearGradient(x - 36, 0, x, 0);   // a soft shadow under the leading edge: the new panel lies on top
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.38)'); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = g; ctx.fillRect(x - 36, PIC0, 36, PIC1 - PIC0); ctx.restore();
    slideOverflow(i1, x); }
  BF_PDX = 0;
}


// storyboard frames: each panel at its board anchor line
const BOARD_AT = { p01: ['l01', 'house'], p02: ['l02', 'dead'], p03: ['l03', 'penelope'], p04: ['l04', 'wine'], p05: ['l05', 'marry'], p06: ['l06', 'tricked'], p07: ['l07', 'father'], p08: ['l08', 'woven'], p09: ['l09', 'away'], p10: ['l10', 'troy'], p11: ['l11', 'him'], p12: ['l12', 'wand'], p13: ['l13', 'nobody'], p14: ['l14', 'walked'], p15: ['l15', 'stand'], p16: ['l16', 'argos'], p17: ['l17', 'troy'], p18: ['l18', 'odysseus'], p19: ['l19', 'once'], p20: ['l20', 'him'], p21: ['l21', 'away'], p22: ['l22', 'tear'], p23: ['l23', 'died'], p24: ['l24', 'beggar'], p25: ['l25', 'hoof'], p26: ['l26', 'them'], p27: ['l27', 'decided'], p28: ['l28', 'bow'], p29: ['l29', 'marry'], p30: ['l30', 'another'], p31: ['l31', 'bend'], p32: ['l32', 'turn'], p33: ['l33', 'shouted'], p34: ['l34', 'bow'], p35: ['l35', 'knows'], p36: ['l36', 'easily'], p37: ['l37', 'swallow'], p38: ['l38', 'thundered'], p39: ['l39', 'axes'], p40: ['l40', 'feet'], p41: ['l41', 'mouth'], p42: ['l42', 'home'], p43: ['l43', 'before'], p44: ['l44', 'hall'], p45: ['l45', 'standing'], p46: ['l46', 'penelope'], p47: ['l47', 'all'], p48: ['l48', 'nothing'], p49: ['l49', 'cold'], p50: ['l50', 'disguise'], p51: ['l51', 'husband'], p52: ['l52', 'it'], p53: ['l53', 'temper'], p54: ['l54', 'bed', 2], p55: ['l55', 'house'], p56: ['l56', 'down'], p57: ['l57', 'that'], p58: ['l58', 'cried'], p59: ['l59', 'way'], p60: ['l60', 'pride'], p61: ['l61', 'home'], p62: ['l62', 'longer'] };
TIMELINE.board = IDS.map((id, i) => { if (id === 'p63') return { t: Math.round((DURATION - 1.2) * FPS) / FPS, title: id, sound: '', next: '' }; const [l, w, n] = BOARD_AT[id]; const t = Math.min(VW(l, w, n) + 0.6, SUBEND(id) - 0.6); return { t: Math.round(t * FPS) / FPS, title: id, sound: '', next: '' }; });
