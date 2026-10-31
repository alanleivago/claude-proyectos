// =====================================================================
//  SCENES — Odyssey p1: Cold open, The Horse, Ismarus and the Lotus-Eaters (amphora-bf, Flow layers, 16:9). The ground and its friezes (assets/bg.jpg) are fixed on screen;
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

// ---- code-drawn fire: black tongues with an incised orange edge, swaying; embers rising (feet of the fire at x, y; scale s)
function fireAt(x, y, s = 1, k = 1, key = 0) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= clamp(k);
  const T = [[-58, 58, 0], [-34, 92, 0.9], [-10, 128, 1.7], [14, 104, 2.6], [38, 120, 3.3], [60, 66, 4.1], [0, 74, 5.0]];
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const [dx, h0, p0] of T) { const ph = p0 + key * 0.7;
    const h = h0 * (0.8 + 0.2 * Math.sin(TT * 8 + ph * 2) + 0.08 * Math.sin(TT * 19 + ph)), sw = 16 * Math.sin(TT * 5 + ph), wd = 22, curl = 10 * Math.sin(TT * 7 + ph);
    ctx.beginPath(); ctx.moveTo(dx - wd, -4); ctx.bezierCurveTo(dx - wd * 1.1, -h * 0.4, dx + sw - 14, -h * 0.7, dx + sw + curl, -h);
    ctx.bezierCurveTo(dx + sw + 10, -h * 0.68, dx + wd * 1.1, -h * 0.38, dx + wd, -4); ctx.closePath();
    ctx.fillStyle = BF.black; ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.6 / s; ctx.stroke();
    ctx.lineWidth = 2 / s; ctx.beginPath(); ctx.moveTo(dx - wd * 0.3, -10); ctx.bezierCurveTo(dx - wd * 0.35, -h * 0.3, dx + sw * 0.4 - 4, -h * 0.45, dx + sw * 0.6, -h * 0.66); ctx.stroke(); }
  for (let i = 0; i < 10; i++) { const R = RNG('emb' + key, i), ph = mod(TT * R.r(0.35, 0.7) + R.f(), 1), ex = R.r(-70, 70) + Math.sin(TT * 2 + i) * 14 * ph, ey = -110 - ph * 220;
    ctx.save(); ctx.globalAlpha *= 1 - ph; ctx.translate(ex, ey); ctx.rotate(TT * 3 + i); ctx.fillStyle = BF.black; ctx.fillRect(-4 / Math.sqrt(s), -1.5, 8 / Math.sqrt(s), 3); ctx.restore(); }
  ctx.restore();
}
// smoke: dark puffs that rise, swell and thin out
function smoke(x, y, s = 1, k = 1, key = 0) {
  if (k <= 0) return;
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.6;
  for (let j = 0; j < 3; j++) { const R = RNG('smk' + key, j), ph = R.r(0, 6), len = (360 + 120 * j) * s, n = 24, P = [];
    for (let i = 0; i <= n; i++) { const u = i / n; P.push([x + (j - 1) * 26 * s + Math.sin(u * 6 + TT * 1.3 + ph) * 34 * s * u + u * u * 110 * s, y - u * len, (16 * (1 - u) + 2.5) * s]); }
    ctx.globalAlpha = k * (0.55 - j * 0.1); ctx.beginPath();
    P.forEach(([px, py, r], i) => (i ? ctx.lineTo(px - r, py) : ctx.moveTo(px - r, py))); for (let i = P.length - 1; i >= 0; i--) ctx.lineTo(P[i][0] + P[i][2], P[i][1]); ctx.closePath(); ctx.fill();
    const [ex, ey] = P[P.length - 1]; ctx.beginPath(); for (let a = 0; a < 10; a++) { const r = (4 + a * 2.6) * s, th = a * 0.8 + TT + ph; ctx.lineTo(ex + Math.cos(th) * r, ey + Math.sin(th) * r); } ctx.lineWidth = 3 * s; ctx.strokeStyle = BF.black; ctx.stroke(); }
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
//  the panels (panel coords = screen coords)
// =====================================================================
// ---- 0 · COLD OPEN
function p01() {   // the Trojan Horse in front of the walls of Troy; the camera pushes in
  const u = EZ.io(pu('p01'));
  ctx.save(); cam(620, 640, 1 + 0.12 * u);
  birds(5, 230, 60, 1);
  walls(1330, FLOOR, 620);
  ground(FLOOR, { key: 1 });
  horse(560, FLOOR, 470, {});
  ctx.restore();
}
function p02() {   // what it cost: the ships sink one by one, his friends walk away past him, he is left alone on the sand
  const tY = VW('l02', 'years') - 0.2, tS = VW('l02', 'ship') - 0.2, tF = VW('l02', 'friend') - 0.4;
  ctx.save(); cam(760, 600, 1 + 0.08 * EZ.io(pu('p02')) + 0.06 * at(tY, 2));
  sea(700);
  [[1180, 0], [1480, 0.35], [1760, 0.7]].forEach(([x, d], i) => sinkShip(x, 770, 380, at(tS + d, 1.4), { dir: i % 2 ? 1 : -1 }));
  ground(FLOOR, { sand: 1, key: 2 });
  [[940, 'sailor0', 0], [1080, 'man_walk', 0.2], [1230, 'sailor1', 0.4], [1380, 'man_beg', 0.6]].forEach(([x, n, d], i) => {
    const w = walk(x, x - 1900, tF + d, 3.4, 6, 8);   // they walk away past him, out of the left side
    fig(n, w.x, FLOOR + w.dy, 250, { flip: true, rot: w.rot + 0.02 * Math.sin(TT * 2 + i) * (1 - w.mv) }); });
  fig('ody_grief', 620, FLOOR, 420, { flip: true, rot: -0.01 * at(tF, 1.5) });
  ctx.restore();
}
function p03() {   // the giant with one eye, the witch, the six-headed monster: the camera travels along them
  const tG = VW('l03', 'giant') - 0.3, tW = VW('l03', 'witch') - 0.3, tM = VW('l03', 'monster') - 0.3;
  let fx = 420; fx = lerp(fx, 960, at(tW - 0.3, 1.3)); fx = lerp(fx, 1480, at(tM - 0.3, 1.3)); fx = lerp(fx, 990, at(VW('l03', 'long') - 0.5, 1.2));
  ctx.save(); cam2(fx, 560, 1.28 - 0.26 * at(VW('l03', 'long') - 0.5, 1.2));
  ground(FLOOR, { key: 3 });
  const g = walk(-480, 420, tG - 2.2, 2.8, 4.2, 10); fig('cyclops_walk', g.x, FLOOR + g.dy, 640, { rot: g.rot });
  riseFrom(FLOOR + 2, rise(tW, 1.0), (dy) => fig('circe', 960, FLOOR + dy, 560, { rot: 0.01 * Math.sin(TT * 1.1) }));
  riseFrom(FLOOR + 2, rise(tM, 1.2), (dy) => fig('scylla', 1560, FLOOR + dy, 720, { rot: 0.015 * Math.sin(TT * 1.6) }));
  ctx.restore();
}
function p04() {   // down among the dead: the shades crowd around a pit of blood; he stands with his sword
  const tC = VW('l04', 'crowd') - 0.4, dn = at(SUB('p04'), 2.4);
  ctx.save(); ctx.translate(0, 70 * (1 - dn)); cam(960, 700, 1.04 + 0.06 * at(tC, 2.5));
  ground(FLOOR, { key: 4, bare: 1 });
  // the pit: black, a red pool that shivers
  ctx.save(); ctx.fillStyle = '#050203'; ctx.beginPath(); ctx.ellipse(1040, FLOOR - 8, 250, 20, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(1040, FLOOR - 8, 250, 20, 0, Math.PI, TAU); ctx.stroke();
  ctx.fillStyle = 'rgba(154,43,31,0.95)'; ctx.beginPath(); ctx.ellipse(1040, FLOOR - 9, 210 + 4 * Math.sin(TT * 2), 12, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(240,120,80,0.7)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { const r = mod(TT * 0.4 + i / 3, 1); ctx.globalAlpha = 1 - r; ctx.beginPath(); ctx.ellipse(1040, FLOOR - 9, 40 + r * 150, 2 + r * 9, 0, 0, TAU); ctx.stroke(); } ctx.restore();
  [[2050, 1340, 0, true, 300], [2150, 1490, 0.2, true, 280], [2250, 1640, 0.4, true, 300], [-720, 760, 0.1, false, 290], [-880, 620, 0.4, false, 270]].forEach(([x0, x1, d, fl, h], i) => {
    const w = walk(x0, x1, SUB('p04') + 0.3 + d, Math.max(1.6, tC - SUB('p04') - 0.4 - d), 3, 3); fig('shade', w.x, FLOOR + w.dy, h, { flip: fl, rot: w.rot + 0.02 * Math.sin(TT * 1.3 + i) }); });
  fig('ody_sword', 340, FLOOR, 380, { rot: 0.01 * Math.sin(TT * 1.1) });
  ctx.restore();
  tint('#160a10', 0.45, 'multiply');
}
function p05() {   // home as a beggar, then the bow; the camera turns to the hundred men and his wife
  const tB = VW('l05', 'bow') - 0.3, tM = VW('l05', 'hundred') - 0.4, tWf = VW('l05', 'wife') - 0.5;
  ctx.save(); cam2(lerp(640, 1240, at(tM - 0.2, 2.4)), 560, 1.2 - 0.06 * at(tM, 2.4));
  hall();
  ground(FLOOR, { key: 5, bare: 1 });
  const w = walk(-720, 760, SUB('p05') + 0.1, 4.6, 4.5, 6);
  xf(tB, 0.6, (a) => fig('ody_beggar', w.x, FLOOR + w.dy, 360, { a, rot: w.rot }), (a) => fig('ody_bow', 760, FLOOR, 370, { a, rot: -0.01 * at(tB + 0.4, 0.6) }));
  [[1090, 0], [1250, 1.3], [1410, 2.2]].forEach(([x, ph], i) => { const toast = Math.sin(TT * 2.2 + ph); fig('suitor', x, FLOOR, 350 - i * 8, { rot: 0.025 * toast, a: 1 }); });
  fig('penelope', 1730, FLOOR, 370, { rot: -0.015 * at(tWf, 1.2) });
  ctx.restore();
}
function p06() {   // twelve ships leave Troy; the sea takes some (a wave), the monster takes others (Scylla); one ship is left
  const tSea = VW('l07', 'sea') - 0.3, tMo = VW('l07', 'monsters') - 0.4, u = EZ.io(pu('p06'));
  const wave = clamp((TT - tSea) / 2.6), wx = lerp(300, 1100, EZ.o2(wave)), wa = Math.sin(Math.PI * wave);
  ctx.save(); cam(lerp(820, 1150, u), 560, 1.04);
  sea(700, { speed: 30 + 30 * wa, bump: (x, r) => -wa * 80 * Math.exp(-(((x - wx) / 240) ** 2)) * (1 - r * 0.12) });
  bfLay('troy_city.webp', 220 - 420 * u, 704, 170);
  const lunge = at(tMo, 0.5) * (1 - at(tMo + 1.6, 1));
  riseFrom(706, rise(tMo - 0.5, 1.2), (dy) => fig('scylla', 1720 + 40 * lunge, 980 + dy, 860, { rot: -0.07 * lunge + 0.01 * Math.sin(TT * 1.6) }));
  for (let i = 0; i < 12; i++) { const back = i % 2 === 0, x = 560 + (i >> 1) * 210 + (back ? 0 : 100) + 120 * u, yb = back ? 730 : 790, w = back ? 220 : 280;
    if (i === 5) continue; const byMonster = x > 1350, t = byMonster ? tMo + 0.2 + RNG('sk', i).r(0, 0.8) : tSea + 0.4 + Math.abs(x - 600) / 700 + RNG('sk', i).r(0, 0.3);
    sinkShip(x, yb, w, at(t, 1.4), { dir: i % 3 ? 1 : -1 }); }
  if (wa > 0) { ctx.save(); ctx.fillStyle = '#100a0a'; ctx.beginPath(); ctx.moveTo(wx - 560, 704); for (let x = wx - 560; x <= wx + 560; x += 20) ctx.lineTo(x, 704 - wa * 130 * Math.exp(-(((x - wx) / 240) ** 2))); ctx.lineTo(wx + 560, 704); ctx.closePath(); ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.4; ctx.stroke(); ctx.restore(); }
  ship(560 + 2 * 210 + 100 + 120 * u, 790, 280);
  ctx.restore();
}
function p08() {   // at the start of every disaster: Odysseus giving the order, the camera closes in, his men turn to him
  const tO = VW('l08', 'odysseus') - 0.3, tD = VW('l08', 'disaster') - 0.3;
  ctx.save(); cam(920, 520, 1 + 0.06 * EZ.io(pu('p08')) + 0.22 * at(tO, 2.2));
  sea(700, { speed: 20 });
  ship(1560, 760, 420);
  ground(FLOOR, { sand: 1, key: 8 });
  crew([[520, 'man_walk', 0], [640, 'man_skin', 0], [1230, 'sailor2', 1], [1360, 'man_walk', 1]].map(([x, n, f]) => ({ n, x, y: FLOOR, h: 260, flip: !!f })));
  fig('ody_point', 920, FLOOR, 400, { rot: 0.012 * Math.sin(TT * 1.4) });
  ctx.restore();
  tint('#1a0c10', 0.3 * at(tD, 1.4), 'multiply');
}
function p09() {   // "with the horse": the horse rolls in and the title is lettered
  const tH = VW('l09', 'horse') - 0.15;
  ctx.save(); cam(960, 520, 1.06 - 0.06 * EZ.io(pu('p09')));
  ground(FLOOR, { key: 9 });
  const w = walk(-720, 960, SUB('p09') + 0.3, 2.9, 0, 0); horse(w.x, FLOOR, 440, { rot: 0.006 * Math.sin(TT * 3) * w.mv });
  letters('I · THE HORSE', 960, 300, tH, 88, { step: 0.035 });
  ctx.restore();
}
// ---- 1 · THE HORSE
function p10() {   // ten years at the walls: the Greeks charge under the arrows, then turn and fall back
  const t0 = SUB('p10');
  const tH2 = (() => { const L = VL('l10'); const hs = L.words.filter((x) => x.w.toLowerCase().startsWith('held')); return hs.length ? hs[hs.length - 1].t0 - 0.4 : L.t1 - 1; })();
  ctx.save(); cam(980, 560, 1.02 + 0.05 * EZ.io(pu('p10')), shake(tH2, 5, 0.8), 10);
  const wl = walls(1460, FLOOR, 640);
  ground(FLOOR, { key: 10 });
  [[-720, 0, 'soldier_attack'], [-880, 0.4, 'soldier_spear'], [-1040, 0.8, 'soldier_attack'], [-1200, 1.2, 'soldier_spear'], [-1360, 1.6, 'soldier_attack']].forEach(([x0, d, n], i) => {
    const xT = 1060 - i * 190, tb = tH2 + i * 0.12, inn = walk(x0, xT, t0 + d * 0.6, 3.0, 7, 10), out = walk(xT, xT - 900, tb + 0.25, 3.0, 7, 10);
    if (TT < tb) fig(n, inn.x, FLOOR + inn.dy, 330, { rot: inn.rot }); else turnFig(n, out.x, FLOOR + out.dy, 330, tb, { rot: out.rot, d: 0.25 }); });
  // arrows from the battlements
  ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) { const R = RNG('ar', i), per = 1.3, ph = mod((TT - t0) / per + R.f(), 1), x0 = 1200 + R.r(0, 300), y0 = wl.top, x1 = x0 - R.r(400, 800), y1 = FLOOR - 20;
    const x = lerp(x0, x1, ph), y = lerp(y0, y1, ph) - Math.sin(Math.PI * ph) * 160, dx = (x1 - x0), dy = (y1 - y0) + -Math.cos(Math.PI * ph) * 160 * Math.PI, l = Math.hypot(dx, dy);
    if (TT < t0 + 0.6) continue; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dx / l * 34, y - dy / l * 34); ctx.stroke(); }
  ctx.restore();
  ctx.restore();
}
function p11() {   // Achilles dead on the plain; Odysseus over him; the camera drifts on to the other dead
  const tA = VW('l11', 'along') - 0.3;
  ctx.save(); cam2(lerp(820, 1260, at(tA, 3)), 600, 1.14);
  smoke(1700, FLOOR - 40, 1.2, 1, 11);
  ground(FLOOR, { key: 11 });
  fig('man_dead', 1320, FLOOR + 6, 130, { still: true });
  fig('man_dead', 1660, FLOOR + 6, 120, { flip: true, still: true });
  fig('achilles_dead', 900, FLOOR + 8, 180, { still: true });
  fig('ody_grief', 520, FLOOR, 400, { flip: true });
  ctx.restore();
}
function p12() {   // the kings quarrel; behind them the ships rot on the beach
  const tTurn = VW('l12', 'other') - 0.3, tShip = VW('l12', 'ships') - 0.4;
  ctx.save(); cam2(lerp(800, 1240, at(tShip, 2.2)), 560, 1.14 - 0.08 * at(tShip, 2.2));
  sea(700, { speed: 15 });
  ground(780, { sand: 1, key: 12 });
  // beached hulls tilted on the sand, with cracks
  for (const [x, w, r] of [[1420, 520, 0.07], [1820, 440, -0.05]]) { bfLay('ship.webp', x, 800, w * 672 / 1253, { rot: r });
    ctx.save(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.5; const R = RNG('crk', x); for (let i = 0; i < 4; i++) { const cx = x + R.r(-w * 0.35, w * 0.35), cy = 760 + R.r(-20, 10); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R.r(-14, 14), cy + 16); ctx.lineTo(cx + R.r(-10, 10), cy + 30); ctx.stroke(); } ctx.restore(); }
  ground(FLOOR, { key: 121 });
  const jab = Math.max(0, Math.sin(TT * 3.4)) * (1 - at(tTurn, 0.5));
  fig('king_a', 640 + 12 * jab, FLOOR, 400, { rot: 0.03 * jab });
  turnFig('king_b', 950, FLOOR, 410, tTurn, {});
  ctx.restore();
}
// a dolphin leaping out of the sea in an arc (code: black body, orange incised eye and fin line)
function dolphin(x0, y0, t0, per, key) {
  const ph = mod((TT - t0) / per, 1); if (ph > 0.42) return; const u = ph / 0.42, x = x0 + u * 260, y = y0 - Math.sin(Math.PI * u) * 120, a = -Math.cos(Math.PI * u) * 0.9;
  clipAbove(y0 + 2, () => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-70, 0); ctx.quadraticCurveTo(-20, -30, 50, -8); ctx.lineTo(78, -4); ctx.lineTo(50, 6); ctx.quadraticCurveTo(-10, 22, -70, 4); ctx.lineTo(-92, -16); ctx.lineTo(-84, 2); ctx.lineTo(-96, 18); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, -20); ctx.lineTo(-20, -44); ctx.lineTo(14, -18); ctx.fillStyle = BF.black; ctx.fill(); ctx.stroke(); bfDot(40, -6, 3, BF.inc); ctx.restore(); });
}
function p13() {   // the king of Ithaca on his rocky island: his small house on the summit, a ship moored below, dolphins; the camera pulls back
  const tP = VW('l13', 'small') - 0.4;
  const z = lerp(2.2, 1, EZ.io(clamp((TT - tP) / 4)));
  const zk = (z - 1) / 1.2; ctx.save(); ctx.translate(-640 * zk, 394 * zk); cam(1600, 166, z);
  birds(6, 260, 30, 13);
  sea(712, { speed: 14 });
  dolphin(240, 714, SUB('p13') + 0.6, 3.1, 1); dolphin(520, 714, SUB('p13') + 1.9, 3.1, 2);
  ship(760 + 10 * Math.sin(TT * 0.5), 770, 330);
  coast(1430, 722, 560);
  // his house on the summit: walls, a pitched roof with an incised tile line, a door, smoke from the hearth
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.6;
  ctx.fillRect(1470, 128, 74, 38); ctx.beginPath(); ctx.moveTo(1462, 130); ctx.lineTo(1507, 106); ctx.lineTo(1552, 130); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1470, 128); ctx.lineTo(1544, 128); ctx.stroke(); ctx.strokeRect(1500, 144, 12, 22); ctx.restore();
  smoke(1530, 110, 0.18, 1, 13);
  fig('ram', 1680 - 20 * Math.sin(TT * 0.3), 167, 34, { flip: true });
  fig('ody', 1600, 167, 110, { rot: 0.008 * Math.sin(TT) });
  ctx.restore();
}
function p14() {   // not the strongest, not the bravest — but a mind looking for the trick: he turns a little wooden horse over in his hands, at his feet a sketch drawn in the sand
  const tS = VW('l14', 'strongest') - 0.2, tM = VW('l15', 'mind') - 0.4, tT = VW('l15', 'trick') - 0.4;
  ctx.save(); cam(lerp(960, 760, at(tM, 2)), 600, 1.04 + 0.16 * at(tM, 2.5));
  ground(FLOOR, { key: 14 });
  const flex = at(tS, 0.5) * (1 - at(tS + 1.2, 0.8));
  fig('soldier_spear', 1300, FLOOR, 540, { flip: true, sy: 1 + 0.03 * flex });
  xf(tM, 0.35, (a) => fig('ody_helmet', 660, FLOOR, 380, { a }), (a) => fig('odysseus_think', 680, FLOOR, 400, { a }));
  // the toy horse he has carved stands on the block beside him; on "trick" it is set rolling and lines are drawn in the sand toward the walls
  const roll = 70 * at(tT, 1.2);
  fig('trojan_horse', 860 + roll, FLOOR, 120, { still: true, rot: 0.01 * Math.sin(TT * 6) * (TT > tT && TT < tT + 1.2 ? 1 : 0) });
  const d = EZ.io(clamp((TT - tT - 0.2) / 1.4));
  if (d > 0) { ctx.save(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 3; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(900, FLOOR + 22); ctx.lineTo(lerp(900, 1180, d), FLOOR + 22); ctx.stroke(); ctx.setLineDash([]);
    if (d > 0.95) { ctx.beginPath(); ctx.moveTo(1170, FLOOR + 12); ctx.lineTo(1190, FLOOR + 22); ctx.lineTo(1170, FLOOR + 32); ctx.stroke(); } ctx.restore(); }
  ctx.restore();
}
function p15() {   // the horse: men push it to the gates; on "hollow" a hatch in its side shows the soldiers packed inside; they leave it
  const tHo = VW('l17', 'hollow') - 0.2, tG = VW('l17', 'gates') - 0.6, tOff = VW('l17', 'offering') - 0.3;
  const hx = lerp(420, 790, EZ.io(clamp((TT - SUB('p15') - 0.3) / (tG - SUB('p15'))))), mv = TT < tG ? 1 : 0;
  ctx.save(); cam(lerp(760, 1000, at(tG, 2)), 560, 1.06 - 0.04 * at(tOff, 2));
  walls(1560, FLOOR, 540);
  ground(FLOOR, { key: 15 });
  horse(hx, FLOOR, 470, { rot: 0.004 * Math.sin(TT * 5) * mv });
  // the cutaway: a panel of the belly opens to the paper and shows three helmeted men crouched inside, then closes
  const hk = at(tHo, 0.4) * (1 - at(tHo + 2.4, 0.4));
  if (hk > 0) { const [ax, ay] = pt('trojan_horse', hx, FLOOR, 470, 300, 395), [bx, by] = pt('trojan_horse', hx, FLOOR, 470, 650, 545), w = (bx - ax) * hk;
    const draw = () => { ctx.save(); ctx.beginPath(); ctx.rect(ax + (bx - ax - w) / 2, ay, w, by - ay); ctx.clip(); ctx.fillStyle = BF.ground; ctx.fillRect(ax, ay, bx - ax, by - ay);
      for (let i = 0; i < 3; i++) fig('soldier_spear', lerp(ax, bx, 0.2 + i * 0.3), by - 2, (by - ay) * 0.92, { still: true, rot: 0.02 * Math.sin(TT * 2 + i) });
      ctx.restore(); ctx.save(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 3; ctx.strokeRect(ax + (bx - ax - w) / 2, ay, w, by - ay); ctx.restore(); };
    FGX ? fgRoute(draw)() : draw(); }
  [[-260, 'man_walk'], [-130, 'man_skin'], [-10, 'man_walk']].forEach(([dx, n], i) => {
    const tb = tG + 0.4 + i * 0.2, push = { x: hx - 330 + dx, y: FLOOR }, back = walk(push.x, push.x - 900, tb + 0.25, 3, 6.5, 8);
    if (TT < tb) fig(n, push.x, FLOOR - Math.abs(Math.sin(TT * 5 + i)) * 6 * mv, 250, { rot: 0.12 }); else turnFig(n, back.x, FLOOR + back.dy, 250, tb, { rot: back.rot, d: 0.25 }); });
  ctx.restore();
}
function p16() {   // the camp burns and the fleet sails off; the Trojans come out of the gate onto the empty beach; the camera turns to the empty sea
  const tB = VW('l18', 'burned') - 0.4, tS = VW('l18', 'sailed') - 0.4, tC = VW('l19', 'came') - 0.3, tG = LT('l20') - 0.3;
  let fx = 900; fx = lerp(fx, 2300, at(tC - 0.8, 2.2)); fx = lerp(fx, 900, at(tG, 3));
  ctx.save(); cam2(fx, 560, 1.04);
  sea(700, { speed: 26 });
  const sx = 900 * at(tS, 4);
  [[1150, 0], [1450, 1], [1740, 0]].forEach(([x, b], i) => ship(x + sx * (1 + i * 0.2), b ? 730 : 760, b ? 300 : 380, { a: 1 - at(tS + 3.2, 1) }));
  ground(FLOOR, { sand: 1, key: 16, x1: W + 1600 });
  [[300, 0.9, 0], [620, 1.0, 0.5], [930, 0.85, 1.0], [1260, 0.95, 1.4]].forEach(([x, s, d], i) => { const b = at(tB + d, 1.2) * (1 - 0.6 * at(tC + 1, 3)); tent(x, FLOOR, s * (1 - 0.5 * at(tC, 4)), b, i); });
  walls(2760, FLOOR, 640, at(tC - 0.4, 1.6));
  horse(1880, FLOOR, 470, {});
  const r = walk(-720, 1500, tB - 1.2, 4.8, 8, 10); fig('soldier_torch', r.x, FLOOR + r.dy, 300, { rot: r.rot, a: 1 - at(tB + 3.2, 0.6) });
  if (TT < tB + 3.8) { const [tx, ty] = pt('soldier_torch', r.x, FLOOR + r.dy, 300, 470, 70, { rot: r.rot }); fireAt(tx, ty + 20, 0.25, 1 - at(tB + 3.2, 0.6), 9); }
  [[0, 0], [0.7, 1], [1.4, 2]].forEach(([d, i]) => { const w = walk(2760, 2420 - i * 150, tC + d, 2.6, 6, 8); fig('trojan_walk', w.x, FLOOR + w.dy, 300, { flip: true, rot: w.rot, a: at(tC + d - 0.1, 0.5) }); });
  ctx.restore();
}
function p18b() {   // inside the city: they drag the horse in, drink and dance around it, then sleep, and night comes
  const tD = VW('l21', 'drank') - 0.5, tS = VW('l21', 'sleep') - 0.6, nk = at(tS - 0.4, 1.8);
  const hx = lerp(380, 900, EZ.io(clamp((TT - SUB('p18b') - 0.2) / (tD - SUB('p18b')))));
  ctx.save(); cam(lerp(800, 960, at(tD, 1.5)), 560, 1.06);
  bfLay('temple.webp', 1620, FLOOR, 520);
  ground(FLOOR, { key: 181 });
  horse(hx, FLOOR, 470, { flip: true, rot: TT < tD ? 0.004 * Math.sin(TT * 5) : 0 });
  // the pullers, roped to the horse's neck, turn into the dancers
  const P = [1180, 1330, 1480].map((x, i) => [x - 520 + (hx - 380), FLOOR - Math.abs(Math.sin(TT * 4 + i)) * 5]);
  const rk = 1 - at(tD, 0.5);
  if (rk > 0) { const [nx, ny] = pt('trojan_horse', hx, FLOOR, 470, 120, 260, { flip: true }), [lx, ly] = pt('trojan_pull', P[0][0], P[0][1], 290, 28, 176);
    ctx.save(); ctx.globalAlpha *= rk; ctx.strokeStyle = BF.black; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(nx, ny); ctx.quadraticCurveTo((nx + lx) / 2, (ny + ly) / 2 + 20, lx, ly); ctx.stroke(); ctx.restore(); }
  [[420, 0, false], [640, 1.7, true], [1240, 0.8, false], [1420, 2.4, true]].forEach(([x, ph, f], i) => {
    const dance = (a) => fig('trojan_dance', x + 30 * Math.sin(TT * 1.6 + ph), FLOOR - Math.abs(Math.sin(TT * 4.5 + ph)) * 18, 280, { flip: f, a, rot: 0.06 * Math.sin(TT * 4.5 + ph) });
    const sleep = (a) => { if (i % 2 === 0) fig('sleeping_trojan', x + 40, FLOOR + 6, 120, { a, flip: f, still: true, sy: 1 + 0.02 * Math.sin(TT * 1.4 + ph) }); };
    const pull = (a) => { if (i < 3 && i > 0 || i === 3) { const j = Math.min(2, i - 1 + (i === 3 ? 0 : 0)); fig('trojan_pull', P[j][0], P[j][1], 290, { a, rot: 0.05 + 0.02 * Math.sin(TT * 4 + j) }); } };
    xf(tD + i * 0.12, 0.6, (a) => (i === 0 ? null : pull(a)), (a) => xf(tS + i * 0.15, 0.9, (b) => dance(a * b), (b) => sleep(a * b))); });
  ctx.restore();
  night(nk, 1600, 220);
}
function p19() {   // night: the hatch in the belly opens; a rope; Odysseus and his best men climb down; the gate opens
  const tH = VW('l22', 'hatch') - 0.2, tR = VW('l23', 'rope') - 0.6, tG = VW('l23', 'gates') - 0.6;
  ctx.save(); cam2(lerp(820, 1380, at(tG - 0.4, 1.8)), 560, 1.16 - 0.1 * at(tG - 0.4, 1.8));
  const wl = walls(1900, FLOOR, 640, at(tG + 0.3, 1.4), { inside: '#2a1408' });
  ground(FLOOR, { key: 19 });
  const hs = horse(760, FLOOR, 600, { hatch: at(tH, 0.8) });
  const [hx, hy] = hs.hatch, rope = EZ.o2(clamp((TT - tH - 0.6) / 0.8));
  if (rope > 0) { ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hx, hy - 10); ctx.lineTo(hx + 3 * Math.sin(TT * 2), lerp(hy, FLOOR, rope)); ctx.stroke(); ctx.restore(); }
  // three men down the rope, one after another, then they walk to the gate
  for (let i = 0; i < 3; i++) { const t = tR + i * 1.1, d = clamp((TT - t) / 1.4); if (TT < t - 0.1) continue;
    const yRope = lerp(hy + 60, FLOOR, EZ.io(d)), w = walk(hx + 30, lerp(1250, 1500, i / 2), t + 1.5, 2.6, 6, 8);
    xf(t + 1.45, 0.3, (a) => clipAbove(FLOOR + 2, () => { ctx.save(); ctx.beginPath(); ctx.rect(-400, hy - 4, W + 800, 2000); ctx.clip(); fig('soldier_rope', hx + 4, yRope + 30, 230, { a, still: true }); ctx.restore(); }),
      (a) => fig(i ? 'soldier_spear' : 'ody_helmet', w.x, FLOOR + w.dy, i ? 300 : 320, { a, rot: w.rot })); }
  void wl;
  ctx.restore();
  night(1, 1250, 210);
}
function p20() {   // the fleet comes back from behind the island, in the dark
  const u = EZ.io(pu('p20'));
  ctx.save(); cam(960, 540, 1.04 + 0.04 * u);
  sea(702, { speed: 22 });
  [[0, 790, 380], [0.6, 740, 280], [1.2, 790, 340], [1.8, 740, 250]].forEach(([d, yb, w], i) => { const k = EZ.io(clamp((TT - SUB('p20') - d) / 6)); ship(lerp(1650, 500 - i * 160, k), yb, w, { flip: true }); });
  coast(1820, 722, 520);
  ctx.restore();
  night(1, 420, 200);
}
function p21() {   // by morning Troy was ash: the walls burn, the smoke climbs, ash falls
  const tA = VW('l25', 'ash') - 0.2, burn = at(SUB('p21'), 1.2);
  ctx.save(); cam(960, 520, 1.02 + 0.06 * EZ.io(pu('p21')), shake(tA, 6, 0.9), 21);
  for (let i = 0; i < 6; i++) smoke(260 + i * 300, 260, 1.4, burn, 210 + i);
  const wl = walls(960, FLOOR, 700);
  [[300, 0.9], [560, 1.2], [860, 1.4], [1120, 1.0], [1420, 1.3], [1640, 0.9]].forEach(([x, s], i) => fireAt(x, wl.top + 10, s * 1.7, burn, i + 3));
  ground(FLOOR, { key: 21 });
  ctx.restore();
  // ash drifting down
  for (let i = 0; i < 40; i++) { const R = RNG('ash', i), y = mod(R.r(0, 800) + TT * R.r(30, 60), 800) + PIC0, x = R.r(0, W) + 30 * Math.sin(TT * 0.8 + i); bfDot(x, y, R.r(1.5, 3.5), `rgba(40,30,30,${0.5 * burn})`); }
  tint('#1a0c10', 0.18 * burn, 'multiply');
}
function p22() {   // the temple burns; a woman at the altar begs; a soldier drags her away
  const tT = VW('l27', 'temples') - 0.4, tD = VW('l27', 'dragged') - 0.3, tB = VW('l27', 'beg') - 0.3;
  ctx.save(); cam2(lerp(1150, 900, at(tD, 2)), 560, 1.06 + 0.04 * EZ.io(pu('p22')));
  bfLay('temple.webp', 1360, FLOOR, 600);
  [[1150, 1.1], [1360, 1.3], [1570, 1.0]].forEach(([x, s], i) => fireAt(x, FLOOR - 560, s, at(tT + i * 0.3, 1), 30 + i));
  smoke(1360, FLOOR - 640, 1.2, at(tT, 1.5), 22);
  ground(FLOOR, { key: 22 });
  // the altar: a block with a meander band
  ctx.save(); ctx.fillStyle = BF.black; ctx.fillRect(900, FLOOR - 130, 150, 130); ctx.fillRect(880, FLOOR - 150, 190, 24); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.strokeRect(900, FLOOR - 130, 150, 130); ctx.strokeRect(880, FLOOR - 150, 190, 24);
  for (let x = 910; x < 1040; x += 26) { ctx.beginPath(); ctx.moveTo(x, FLOOR - 70); ctx.lineTo(x, FLOOR - 100); ctx.lineTo(x + 16, FLOOR - 100); ctx.lineTo(x + 16, FLOOR - 82); ctx.stroke(); } ctx.restore();
  fireAt(975, FLOOR - 150, 0.45, 1, 40);
  const drag = at(tD + 0.3, 2.2), sw = walk(260, 640, SUB('p22') + 0.4, 2.6, 6, 8), sOut = walk(640, 240, tD + 0.3, 2.4, 5, 8);
  if (TT < tD + 0.3) fig('soldier_attack', sw.x, FLOOR + sw.dy, 330, { rot: sw.rot }); else turnFig('soldier_attack', sOut.x, FLOOR + sOut.dy, 330, tD + 0.3, { rot: sOut.rot, d: 0.25 });
  fig('woman_plead', lerp(820, 420, EZ.io(drag)), FLOOR, 250, { rot: -0.08 * Math.sin(Math.PI * drag) + 0.02 * Math.sin(TT * 3) * (1 - drag) });
  ctx.restore();
}
function p23() {   // the gods saw all of it: Athena, Zeus and Poseidon on the clouds, looking down at burning Troy
  const tG = VW('l28', 'gods') - 0.4, tS = VW('l28', 'saw') - 0.3;
  ctx.save(); cam(960, lerp(420, 520, at(tS, 2)), 1.06);
  bfLay('troy_city.webp', 960, FLOOR, 230);
  [[400, 0.7], [760, 0.9], [1140, 1.0], [1500, 0.8]].forEach(([x, s], i) => { fireAt(x, FLOOR - 120, s * 0.6, 1, 50 + i); smoke(x, FLOOR - 160, 0.45, 1, 50 + i); });
  ground(FLOOR, { key: 23 });
  [['athena', 560, 0, 400, true], ['zeus', 960, 0.25, 430, false], ['poseidon', 1360, 0.5, 400, false]].forEach(([n, x, d, h, f]) => riseFrom(560, rise(tG + d - 0.8, 1.1), (dy) => fig(n, x, 560 + dy, h, { flip: f, rot: 0.03 * at(tS, 1) * (x < 960 ? 1 : -1) })));
  clouds(540);
  ctx.restore();
}
function p24() {   // loading the ships with gold, slaves and wine; the ship turns for home, the route is drawn; suns and moons wheel for ten years
  const tT = VW('l29', 'turned') - 0.4, tI = LT('l30') - 0.2, tW = VW('l30', "weeks'") - 0.3, tY = LT('l31') - 0.2, tTen = VW('l31', 'ten') - 0.2;
  ctx.save(); cam2(lerp(900, 1240, at(tT, 2)), 560, 1.06 - 0.06 * at(tI, 2));
  sea(700, { speed: 18 });
  // ten years: a sun and a moon wheel over the sea
  const yk = at(tY, 0.8); if (yk > 0) { const per = 0.7; for (let i = 0; i < 2; i++) { const ph = mod((TT - tY) / per / 2 + i * 0.5, 1), x = lerp(200, 2100, ph), y = 640 - Math.sin(Math.PI * ph) * 420;
    ctx.save(); ctx.globalAlpha *= yk * Math.sin(Math.PI * ph);
    if (i === 0) { bfDot(x, y, 40, BF.black); ctx.strokeStyle = BF.black; ctx.lineWidth = 4; for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + TT; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 52, y + Math.sin(a) * 52); ctx.lineTo(x + Math.cos(a) * 68, y + Math.sin(a) * 68); ctx.stroke(); } }
    else bfDot(x, y, 30, 'rgba(240,222,190,0.9)'); ctx.restore(); } }
  coast(1880, 712, 150, { a: at(tI, 1.2) });
  route([[1420, 690], [1580, 660], [1740, 680], [1840, 670]], EZ.io(clamp((TT - tW) / 2.2)));
  const sx = 520 * EZ.io(clamp((TT - tT) / 5));
  ship(1320 + sx * 0.3, 790, 460, { rot: 0.01 * Math.sin(TT * 1.3) });
  ground(FLOOR, { sand: 1, key: 24, x1: 1100 });
  [['man_sack', 0], ['trojan_walk', 0.8], ['man_skin', 1.6], ['man_sack', 2.4]].forEach(([n, d], i) => { const w = walk(-720 - i * 40, 1050, SUB('p24') + d, 5.2, 6, 8); fig(n, w.x, FLOOR + w.dy, 260, { rot: w.rot, a: 1 - at(SUB('p24') + d + 3.9, 0.5) }); });
  fig('ody_point', 380, FLOOR, 380, { rot: 0.01 * Math.sin(TT * 1.2) });
  tally(10, 1240 - 4.5 * 34 - 10, 150, tTen, 0.1, { gap: 34, len: 64, w: 8 });
  ctx.restore();
}
// the hill of Ismarus: its ridge as a function so figures can stand on it
const HILL = (x) => (x < 900 ? 730 : x < 1520 ? 730 - 320 * EZ.io((x - 900) / 620) : 410 + (x - 1520) * 0.11);
const HSLOPE = (x) => (HILL(x + 4) - HILL(x - 4)) / 8;
function p26() {   // Ismarus: a busy city on a hill — cattle grazing, Ciconians on the path, hearth smoke; Odysseus's ships come in; the title
  const t0 = SUB('p26'), tI = VW('l32', 'ismarus') - 0.15;
  ctx.save(); cam(1000, 540, 1.04 + 0.04 * EZ.io(pu('p26')));
  sea(720, { speed: 18 });
  for (let i = 0; i < 3; i++) smoke(1420 + i * 130, 400, 0.4, 1, 260 + i);
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.beginPath(); ctx.moveTo(860, 760); for (let x = 860; x <= W + 400; x += 20) ctx.lineTo(x, HILL(x)); ctx.lineTo(W + 400, PIC1 + 300); ctx.lineTo(860, PIC1 + 300); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 880; x <= W + 400; x += 20) x === 880 ? ctx.moveTo(x, HILL(x)) : ctx.lineTo(x, HILL(x)); ctx.stroke();
  ctx.lineWidth = 1.8; const R = RNG('ism'); for (let k = 1; k < 7; k++) { let x = 940 + k * 30 + R.r(0, 60); while (x < W + 100) { const l = R.r(120, 260); ctx.beginPath(); for (let xx = x; xx <= x + l; xx += 20) { const yy = HILL(xx) + k * 48 + 4 * Math.sin(xx * 0.02 + k); xx === x ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy); } ctx.stroke(); x += l + R.r(40, 120); } } ctx.restore();
  bfLay('troy_city.webp', 1560, HILL(1560) + 30, 190, { flip: true });
  // two Ciconians walking up the path toward the city
  [0, 1].forEach((i) => { const w = walk(1020 + i * 110, 1200 + i * 90, t0 + 0.4 + i * 0.6, 6, 5, 4); fig('ciconian', w.x, HILL(w.x) + 4 + w.dy, 130, { flip: true, rot: clamp(Math.atan(HSLOPE(w.x)), -0.35, 0.35) + w.rot }); });
  [0, 1].forEach((i) => ship(lerp(-300 - i * 300, 520 - i * 300, EZ.io(clamp((TT - t0) / 5))), 800 - i * 50, 380 - i * 80, { behind: i ? null : (s) => shipOdy(s, 0.25, 'ody_point', 150) }));
  letters('II · ISMARUS', 520, 300, tI, 84, { step: 0.035 });
  ctx.restore();
}
function p27() {   // the raid: Odysseus throws, his men charge, the Ciconians fall; the women and the cattle are taken
  const tA = VW('l33', 'attacked') - 0.4, tK = VW('l34', 'killed') - 0.4, tW = VW('l34', 'women') - 0.4, tC = VW('l34', 'cattle') - 0.8;
  ctx.save(); cam2(lerp(820, 1200, at(tW - 0.4, 2.2)), 560, 1.08);
  ground(FLOOR, { key: 27 });
  xf(tA, 0.4, (a) => fig('ody_helmet', 360, FLOOR, 360, { a }), (a) => fig('ody_throw', 360, FLOOR, 360, { a }));
  // the spear flies
  if (TT > tA + 0.3 && TT < tA + 1.3) { const u = (TT - tA - 0.3) / 1.0, x = lerp(420, 1150, u), y = lerp(560, 640, u) - Math.sin(Math.PI * u) * 80; ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 80, y + 6); ctx.lineTo(x + 30, y - 2); ctx.stroke(); ctx.restore(); }
  [[-720, 700, 'soldier_attack', 0], [-900, 860, 'soldier_spear', 0.4]].forEach(([x0, x1, n, d]) => { const w = walk(x0, x1, tA + d, 2.4, 7, 10); fig(n, w.x, FLOOR + w.dy, 320, { rot: w.rot }); });
  [[1100, 0], [1260, 0.4]].forEach(([x, d]) => { const fall = at(tK + d, 0.6);
    xf(tK + d + 0.45, 0.4, (a) => fig('ciconian', x, FLOOR, 320, { a, rot: -1.2 * EZ.i2(fall) * 0.6 }), (a) => fig('man_dead', x + 60, FLOOR + 6, 110, { a, still: true })); });
  fig('woman_plead', 1540, FLOOR, 240, { flip: true, rot: 0.02 * Math.sin(TT * 3) });
  const b = walk(2250, 1700, tC - 1.2, 3.2, 5, 4); fig('bull', b.x, FLOOR + b.dy, 210, { flip: true, rot: b.rot * 0.5 });
  ctx.restore();
}
function p28() {   // he orders them back to the ships; they don't listen; they sit on the beach drinking and roasting cattle
  const tL = VW('l36', 'listen') - 0.3, tR = VW('l37', 'roasting') - 0.4;
  ctx.save(); cam2(lerp(760, 1180, at(LT('l36') - 0.3, 2.2)), 560, 1.08);
  sea(700, { speed: 16 });
  ship(260, 770, 420); ship(560, 740, 300);
  ground(FLOOR, { sand: 1, key: 28, x0: 620, slope: 160 });
  const order = Math.max(0, Math.sin(TT * 2.6)) * (TT < tL ? 1 : 0);
  fig('ody_point', 820, FLOOR, 380, { flip: true, rot: -0.02 * order });
  // the spit over the fire
  ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(1290, FLOOR); ctx.lineTo(1310, FLOOR - 150); ctx.moveTo(1590, FLOOR); ctx.lineTo(1570, FLOOR - 150); ctx.moveTo(1280, FLOOR - 140); ctx.lineTo(1600, FLOOR - 140); ctx.stroke();
  ctx.translate(1440, FLOOR - 140); ctx.rotate(TT * 0.8); ctx.fillStyle = BF.black; ctx.beginPath(); ctx.ellipse(0, 0, 90, 34, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 70, 20, 0, 0.3, 2.8); ctx.stroke(); ctx.restore();
  fireAt(1440, FLOOR, 0.6 + 0.3 * at(tR, 1), 1, 60);
  smoke(1440, FLOOR - 200, 0.8, 0.7, 61);
  [[1180, false, 0], [1720, true, 1.3], [1900, true, 2.1]].forEach(([x, f, ph]) => { const sip = Math.sin(TT * 1.8 + ph); fig('man_drink', x, FLOOR, 230, { flip: f, rot: 0.03 * sip + (TT > tL ? 0.02 * Math.sin(TT * 5 + ph) : 0) }); });
  fig('bull', 2150, FLOOR, 180, { flip: true, rot: 0.01 * Math.sin(TT) });
  ctx.restore();
}
function p29() {   // the neighbours come down out of the hills: Ciconians run down the slope
  const t0 = SUB('p29');
  ctx.save(); cam(980, 560, 1.02 + 0.06 * EZ.io(pu('p29')));
  mountain();
  for (let i = 0; i < 6; i++) { const d = i * 0.45, w = walk(2150 + i * 120, 560 + i * 150, t0 + d, 4.6, 7.5, 10), x = w.x;
    fig('ciconian', x, SLOPE(x) + 6 + w.dy, 250, { rot: -0.2 + w.rot }); }
  ctx.restore();
}
function p30() {   // the losses: Ciconians cut down the last men on the sand, survivors run for the ships, the ships push off with gaps at the oars; 72, then 12 × 6
  const t72 = VW('l39', 'seventytwo') - 0.2, tSix = VW('l40', 'six') - 0.2, tP = VW('l39', 'pushed') - 0.5, t0 = SUB('p30');
  ctx.save(); cam(960, 560, 1.04 + 0.04 * EZ.io(pu('p30')));
  sea(700, { speed: 22, x0: 1240 });
  const sx = 560 * EZ.io(clamp((TT - tP) / 5));
  ship(1380 + sx, 780, 400, { behind: (s) => { shipOdy(s, -0.2, 'man_fear', 120); shipOdy(s, 0.15, 'sailor1', 120); } });
  ship(1720 + sx * 1.2, 740, 300);
  ground(FLOOR, { sand: 1, key: 30, x1: 1400 });
  [[200, 0], [430, 1], [880, 1], [1100, 0]].forEach(([x, f]) => fig('man_dead', x, FLOOR + 4, 92, { flip: !!f, still: true }));
  // two men fall as the Ciconians reach them (they topple over their feet and lie still: no fade)
  [[640, t0 + 0.8], [1290, t72 + 0.3]].forEach(([x, t], i) => { const k = EZ.i2(clamp((TT - t) / 0.55)); fig(i ? 'man_fear' : 'man_walk', x, FLOOR, 220, { flip: true, rot: -1.5 * k, still: k > 0 }); });
  [[260, 0], [520, 0.5]].forEach(([x1, d], i) => { const w = walk(-500 - i * 160, x1, t0 + d, 2.6, 7, 9), jab = TT > t0 + d + 2.6 ? 0.05 * Math.sin(TT * 3 + i) : 0; fig('ciconian', w.x, FLOOR + w.dy, 260, { flip: true, rot: w.rot + jab }); });
  // a survivor sprints for the ship
  const r = walk(780, 1700, t0 + 0.3, 3.2, 8, 12); fig('man_walk', r.x, FLOOR + r.dy, 220, { flip: true, rot: r.rot, a: 1 - at(t0 + 3.4, 0.25) });
  letters('72', 760, 300, t72, 140, { step: 0.12 });
  letters('12 × 6', 760, 400, tSix, 60, { step: 0.06 });
  ctx.restore();
}
function p31() {   // the storm: nine days of wind; the ship is thrown about; lightning; nine strokes are cut
  const t0 = SUB('p31'), tN = VW('l42', 'nine') - 0.2, tEdge = VW('l42', 'edge') - 0.4;
  const b1 = bolt(t0 + 0.6, 1200), b2 = bolt(VW('l42', 'south'), 600), b3 = bolt(tEdge + 0.4, 1500);
  ctx.save(); cam(lerp(960, 1200, at(tEdge, 2)), 540, 1.06, 4 + 3 * Math.sin(TT * 0.7), 31);
  sea(700, { speed: 90, bump: (x, r) => -95 * Math.sin(x * 0.005 + TT * 2.2 + r * 0.5) * (1 - r * 0.12) });
  const sxp = lerp(900, 1500, at(tEdge, 3)), lift = 95 * Math.sin(sxp * 0.005 + TT * 2.2) * 0.8;
  ship(lerp(900, 1500, at(tEdge, 3)), 800 - lift, 560, { rot: 0.12 * Math.sin(TT * 1.9), dy: 0 });
  tally(9, 960 - 4 * 34 - 10, 150, tN, 0.12, { gap: 34, len: 60, w: 8 });
  ctx.restore();
  rain(1);
  tint('#1a0c10', 0.4, 'multiply');
  const fl = Math.max(b1, b2, b3); if (fl > 0) tint('#fff0d0', 0.35 * fl);
}
function p32() {   // the gentle country of the lotus; three men go ashore into the flowers; they don't come back
  const tA = VW('l44', 'ashore') - 0.6, tB = LT('l45') - 0.1;
  ctx.save(); cam2(lerp(860, 1200, at(tA, 3)), 560, 1.04 + 0.06 * at(tB, 3));
  birds(3, 260, 25, 32);
  sea(700, { speed: 10 });
  ship(lerp(300, 620, EZ.io(clamp((TT - SUB('p32')) / 4))), 790, 440, { behind: (s) => shipOdy(s, 0.2, 'ody_look', 230, { a: at(tA - 0.5, 0.8) }) });
  ground(FLOOR, { sand: 1, key: 32, x0: 900, slope: 200 });
  fig('lotus_eater', 1820, FLOOR, 240, {});
  [[0, 0], [0.5, 1], [1.0, 2]].forEach(([d, i]) => { const w = walk(860, 2100 + i * 60, tA + d, 6, 6, 8); fig(i === 1 ? 'man_skin' : 'man_walk', w.x, FLOOR + w.dy, 240, { rot: w.rot, a: 1 - at(tA + d + 4.6, 0.8) }); });
  [[1240, 300], [1460, 340], [1640, 260], [1960, 320], [2120, 280]].forEach(([x, h], i) => fig('lotus', x, FLOOR + 4, h, { rot: 0.03 * Math.sin(TT * 1.1 + i * 1.3), still: true }));
  ctx.restore();
}
function p33() {   // he finds them sitting with the Lotus-Eaters, smiling; the camera moves in on one of them; home fades
  const tW = VW('l46', 'went') - 0.4, tD = LT('l49') - 0.3, tF = VW('l50', 'forgotten') - 0.3;
  ctx.save(); cam2(lerp(960, 1140, at(tD, 3)), lerp(560, 600, at(tD, 3)), 1 + 0.42 * EZ.io(clamp((TT - tD) / 7)));
  ground(FLOOR, { key: 33 });
  [[180, 320], [380, 260], [1740, 300], [1900, 360]].forEach(([x, h], i) => fig('lotus', x, FLOOR + 4, h, { rot: 0.03 * Math.sin(TT * 1.1 + i), still: true }));
  // the memory of home: a faint island above, gone on "forgotten"
  fig('lotus_eater', 1550, FLOOR, 250, {});
  fig('lotus_eater', 770, FLOOR, 240, { flip: true });
  [[1000, 0], [1190, 1.4], [1340, 2.6]].forEach(([x, ph]) => fig('man_lotus', x, FLOOR, 230, { rot: 0.02 * Math.sin(TT * 0.9 + ph) }));
  const o = walk(-720, 420, tW - 0.9, 4.0, 6, 8); fig('ody_look', o.x, FLOOR + o.dy, 360, { rot: o.rot });
  // petals drifting
  for (let i = 0; i < 12; i++) { const R = RNG('pt', i), ph = mod(TT * R.r(0.05, 0.1) + R.f(), 1), x = lerp(-100, W + 100, ph), y = 300 + R.r(0, 400) + 30 * Math.sin(TT * 1.2 + i);
    ctx.save(); ctx.translate(x, y); ctx.rotate(TT * 1.5 + i); ctx.fillStyle = BF.black; ctx.beginPath(); ctx.ellipse(0, 0, 9, 4, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
function p34() {   // he drags them back to the ships in tears; the ship rows away before anyone else can taste it
  const tT = VW('l51', 'tied') - 0.4, tR = VW('l52', 'row') - 0.4;
  ctx.save(); cam2(lerp(820, 1300, at(tT, 2.4)), 560, 1.06);
  sea(700, { speed: 24 });
  const sx = 700 * EZ.io(clamp((TT - tR) / 5));
  ship(1500 + sx, 790, 480, { rot: 0.012 * Math.sin(TT * 1.4) });
  ground(FLOOR, { sand: 1, key: 34, x1: 1180, slope: 0 });
  [[0, 'ody_drag', 0], [180, 'man_resist', 0.2]].forEach(([dx, n, d]) => { const w = walk(-720 - dx, 1100 - dx, SUB('p34') + d, 4.8, 4.5, 6); fig(n, w.x, FLOOR + w.dy, 330, { flip: true, rot: w.rot, a: 1 - at(tT + 1.6, 0.6) }); });
  const w2 = walk(-720, 760, SUB('p34') + 0.1, 4.8, 4.5, 6); fig('man_fear', w2.x, FLOOR + w2.dy, 300, { flip: true, rot: w2.rot, a: 1 - at(tT + 1.8, 0.6) });
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
const FULL_SET = new Set(['p04', 'p05', 'p10', 'p15', 'p18b', 'p19', 'p20', 'p21', 'p22', 'p31']);   // panels that fill the picture with a set   // how far the outgoing panel drifts during a slide (fraction of the width)
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
const PANELS = { p01, p02, p03, p04, p05, p06, p08, p09, p10, p11, p12, p13, p14, p15, p16, p18b, p19, p20, p21, p22, p23, p24, p26, p27, p28, p29, p30, p31, p32, p33, p34 };
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
const BOARD_AT = { p01: ['l01', 'horse'], p02: ['l02', 'friend'], p03: ['l03', 'necks'], p04: ['l04', 'blood'], p05: ['l05', 'wife'], 
  p06: ['l07', 'others'], p08: ['l08', 'disaster'], p09: ['l09', 'horse'], p10: ['l10', 'walls', 2], p11: ['l11', 'anything'], p12: ['l12', 'beach'], p13: ['l13', 'visit'],
  p14: ['l15', 'trick'], p15: ['l17', 'hollow'], p16: ['l19', 'found'], p18b: ['l21', 'danced'], p19: ['l23', 'rope'],
  p20: ['l24', 'dark'], p21: ['l25', 'ash'], p22: ['l27', 'altars'], p23: ['l28', 'all'], p24: ['l31', 'years'], p26: ['l32', 'troy'],
  p27: ['l34', 'women'], p28: ['l37', 'cattle'], p29: ['l38', 'hills'], p30: ['l40', 'ship'], p31: ['l42', 'knew'], p32: ['l44', 'hello'], p33: ['l46', 'flower'], p34: ['l51', 'tears'] };
TIMELINE.board = IDS.map((id, i) => { const [l, w, n] = BOARD_AT[id]; const t = Math.min(VW(l, w, n) + 0.6, SUBEND(id) - 0.6); return { t: Math.round(t * FPS) / FPS, title: id, sound: '', next: '' }; });

