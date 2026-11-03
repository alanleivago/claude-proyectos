// =====================================================================
//  SCENES — Odyssey p3: Circe, The Underworld (amphora-bf, Flow layers, 16:9). The ground and its friezes (assets/bg.jpg) are fixed on screen;
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
//  the panels (panel coords = screen coords)
// =====================================================================
// ---- 6 · CIRCE
function p01() {   // the lone ship sails on; a low wooded island with a thread of smoke rises out of the sea; the chapter title
  const t0 = SUB('p01'), tS = VW('l01', 'smoke') - 0.4, u = EZ.io(pu('p01'));
  ctx.save(); cam(960, 560, 1.02 + 0.04 * u);
  birds(4, 260, 30, 31);
  sea(702, { speed: 14 });
  island(lerp(2300, 1460, EZ.o2(clamp((TT - t0) / 3.5))), 712, at(tS, 1.2));
  ship(lerp(460, 760, u), 800, 480, { behind: (s) => { shipOdy(s, -0.3, 'ody_look', 190); shipOdy(s, 0.1, 'sailor1', 150); shipOdy(s, 0.32, 'man_fear', 150); } });
  letters('VI · CIRCE', 640, 300, t0 + 0.3, 92, { step: 0.06 });
  ctx.restore();
}
function p02() {   // nobody wants to go and look: on deck the men shake their heads; the giants of the last two landings rise on a little frieze
  const tG = VW('l03', 'giants') - 0.4, tE = VW('l03', 'eaten') - 0.3, tN = VW('l02', 'nobody') - 0.2;
  ctx.save(); cam(lerp(900, 980, at(tG, 2)), 600, 1.04 + 0.05 * at(tG, 2));
  deck({ ithaca: 1, ithacaX: 1180, ithacaH: 90 });
  fig('ody_look', 470, DECK, 360, { rot: 0.01 * Math.sin(TT) });
  const no = (d) => 0.06 * Math.sin((TT - tN) * 9 + d) * at(tN, 0.4) * (1 - at(tN + 2.4, 0.5));
  crew([{ n: 'man_fear', x: 1060, y: DECK, h: 290, flip: true, rot: no(0), tr: 2 * at(tE, 0.3) }, { n: 'man_skin', x: 1260, y: DECK, h: 290, flip: true, rot: no(1.5), tr: 2 * at(tE, 0.3) }, { n: 'sailor2', x: 1450, y: DECK, h: 290, flip: true, rot: no(3), tr: 2 * at(tE, 0.3) }]);
  // the last two landings: the Cyclops and a Laestrygonian rise on a ledge above their heads
  const fk = at(tG - 0.6, 0.6);
  if (fk > 0) { ctx.save(); ctx.globalAlpha *= fk; ctx.fillStyle = BF.black; ctx.fillRect(700, 440, 620, 8); ctx.restore();
    riseFrom(440, rise(tG, 0.7), (dy) => fig('cyclops_pray', 860, 440 + dy, 200, { rot: 0.02 * Math.sin(TT * 3) }));
    riseFrom(440, rise(tG + 0.4, 0.7), (dy) => fig('giant_throw', 1150, 440 + dy, 210, { flip: true, rot: 0.03 * Math.sin(TT * 4) })); }
  ctx.restore();
}
function p03() {   // they draw lots on the beach: pebbles jump from Odysseus's cup; half the crew goes, led by Eurylochus, into the trees
  const tL = VW('l04', 'lots') - 0.3, tH = VW('l04', 'half') - 0.3, tE = VW('l04', 'eurylochus') - 0.3;
  ctx.save(); cam(lerp(860, 1060, at(tE, 2.5)), 580, 1.03 + 0.04 * at(tE, 2.5));
  forest('b3', [[1760, 640], [2050, 600]], { sand: 1 });
  fig('ody_offer', 380, FLOOR, 370);
  // the lots: pebbles jumping out of the cup
  if (TT > tL) for (let i = 0; i < 5; i++) { const R = RNG('lot', i), u = clamp((TT - tL - i * 0.18) / 0.7); if (u <= 0) continue; const x = lerp(470, 560 + i * 60, u), y = lerp(FLOOR - 220, FLOOR - 6, u * u) - Math.sin(Math.PI * u) * 90; bfDot(x, y, 7, i === 2 ? 'rgb(240,222,190)' : BF.black); void R; }
  const go = (x0, d) => walk(x0, x0 + 520, tE + 0.4 + d, 3.2, 6, 8);
  const e = go(1180, 0); fig('eury_wary', e.x, FLOOR + e.dy, 370, { rot: e.rot });
  eyeGlint(e.x + 34, FLOOR - 330, at(tE, 0.4) * (1 - at(tE + 1.2, 0.5)));
  [[960, 0.2, 'man_walk'], [800, 0.4, 'man_sack'], [640, 0.6, 'sailor2']].forEach(([x, d, n]) => { const w = go(x, d); fig(n, w.x, FLOOR + w.dy, 350, { rot: w.rot, sy: 1 - 0.0 * at(tH, 0.3) }); });
  ctx.restore();
}
function p04() {   // deep in the forest, the house of polished stone: the men walk in between the trees and it opens up before them
  const t0 = SUB('p04'), tH = VW('l05', 'house') - 0.4, tS = VW('l05', 'stone') - 0.3, u = EZ.io(pu('p04'));
  ctx.save(); cam(lerp(800, 1160, u), 580, 1.0 + 0.08 * u);
  forest('f4', [[160, 640], [520, 580]]);
  bfLay('circe_house.webp', 1260, FLOOR + 4, 500);
  glow(1260, FLOOR - 250, 380, 'rgba(255,236,200,A)', 0.18 * at(tS, 0.5) * (1 - at(tS + 1.2, 0.8)), 'lighter');
  tree(1980, FLOOR + 6, 640, { key: 'f4b' });
  [[0, 'eury_wary', 340], [0.4, 'man_walk', 330], [0.8, 'sailor2', 330]].forEach(([d, n, h], i) => { const w = walk(-200 - i * 160, 640 - i * 170, t0 + d, Math.max(2, tH - t0), 6, 8); fig(n, w.x, FLOOR + w.dy, h, { rot: w.rot }); });
  ctx.restore();
}
function p05() {   // lions and wolves prowl round the house, the men cringe; then the beasts come up wagging their tails like dogs
  const tL = VW('l06', 'lions') - 0.4, tWo = VW('l06', 'wolves') - 0.4, tA = VW('l06', 'attack') - 0.3, tWg = VW('l06', 'wagging') - 0.3, tD = VW('l06', 'dogs') - 0.3;
  ctx.save(); cam(960, 600, 1.04 + 0.04 * EZ.io(pu('p05')));
  forest('f5', [[90, 600]]);
  bfLay('circe_house.webp', 1560, FLOOR + 4, 380);
  const wag = at(tWg, 0.4), cring = at(tL, 0.4) * (1 - at(tD, 0.6));
  crew([{ n: 'eury_wary', x: 300, y: FLOOR, h: 350, tr: 2 * cring }, { n: 'man_fear', x: 470, y: FLOOR, h: 340, tr: 2 * cring }]);
  xf(tD, 0.5, (a) => fig('man_fear', 640, FLOOR, 340, { a, rot: -0.03 * cring }), (a) => fig('man_beg', 650, FLOOR, 330, { a, rot: 0.02 * Math.sin(TT * 2) }));
  const lw = walk(2300, 1100, tL, 2.6, 5, 5), ww = walk(2500, 1400, tWo, 2.6, 7, 6);
  const tail = (k) => 0.05 * Math.sin(TT * 14) * k;
  fig('lion', lw.x, FLOOR + lw.dy, 230, { flip: true, rot: lw.rot + tail(wag) - 0.04 * at(tA, 0.4) * (1 - wag), sy: 1 - 0.05 * wag });
  fig('wolf', ww.x, FLOOR + ww.dy, 180, { flip: true, rot: ww.rot + tail(wag) * 1.3, sy: 1 - 0.05 * wag });
  ctx.restore();
}
function p06() {   // inside, a woman sings at her loom; the song drifts through the hall; two of the men lean in at the door
  const tS = VW('l07', 'singing') - 0.4, tLm = VW('l07', 'loom') - 0.3, t0 = SUB('p06');
  ctx.save(); cam(lerp(1000, 1160, at(tLm, 2)), 580, 1.05 + 0.06 * at(tLm, 2));
  circeHall({ cloths: [1580], fireX: 1820 });
  const cx = 1180, ch = 440, pull = 0.02 * Math.sin(TT * 2.4);
  fig('circe_weave', cx, FLOOR, ch, { rot: pull * 0.3 });
  const [mx, my] = ptf('circe_weave', cx, FLOOR, ch, 0.36, 0.1); song(mx, my, at(tS, 0.8), 6);
  const w = walk(-200, 420, t0, 2.2, 6, 7); fig('man_walk', w.x, FLOOR + w.dy, 360, { rot: w.rot });
  const w2 = walk(-400, 230, t0 + 0.4, 2.2, 6, 7); fig('sailor2', w2.x, FLOOR + w2.dy, 350, { rot: w2.rot });
  ctx.restore();
}
function p07() {   // Circe invites them in: she offers the cup; cheese, honey and wine appear on a low table between them
  const tC = VW('l08', 'circe') - 0.4, tCh = VW('l08', 'cheese') - 0.3, tHo = VW('l08', 'honey') - 0.3, tW = VW('l08', 'wine') - 0.3;
  ctx.save(); cam(lerp(980, 900, at(tCh, 2)), 600, 1.05 + 0.05 * at(tCh, 2));
  circeHall({ cloths: [1580], fireX: 1820 });
  // the table and the food
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.fillRect(780, FLOOR - 120, 280, 16); ctx.strokeRect(780, FLOOR - 120, 280, 16);
  for (const lx of [800, 1040]) { ctx.beginPath(); ctx.moveTo(lx - 6, FLOOR - 104); ctx.quadraticCurveTo(lx - 16, FLOOR - 50, lx - 4, FLOOR); ctx.lineTo(lx + 6, FLOOR); ctx.quadraticCurveTo(lx - 2, FLOOR - 50, lx + 6, FLOOR - 104); ctx.fill(); }
  const item = (t, f) => { const k = at(t, 0.5); if (k <= 0) return; ctx.save(); ctx.globalAlpha *= k; ctx.translate(0, (1 - k) * -30); f(); ctx.restore(); };
  item(tCh, () => { ctx.fillStyle = 'rgb(240,222,190)'; ctx.beginPath(); ctx.moveTo(810, FLOOR - 120); ctx.lineTo(880, FLOOR - 120); ctx.lineTo(820, FLOOR - 160); ctx.closePath(); ctx.fill(); ctx.strokeStyle = BF.black; ctx.stroke(); });
  item(tHo, () => { ctx.fillStyle = BF.black; ctx.beginPath(); ctx.ellipse(925, FLOOR - 146, 30, 26, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = BF.inc; ctx.stroke(); ctx.fillStyle = 'rgb(232,176,74)'; ctx.fillRect(905, FLOOR - 178, 40, 8); });
  item(tW, () => { ctx.fillStyle = BF.black; ctx.beginPath(); ctx.moveTo(975, FLOOR - 120); ctx.lineTo(965, FLOOR - 170); ctx.lineTo(1035, FLOOR - 170); ctx.lineTo(1025, FLOOR - 120); ctx.closePath(); ctx.fill(); ctx.strokeStyle = BF.inc; ctx.stroke(); ctx.fillStyle = '#3a0f12'; ctx.fillRect(968, FLOOR - 168, 64, 7); });
  ctx.restore();
  const step = at(tC, 1.2);
  fig('circe_cup', lerp(1420, 1300, step), FLOOR, 410, { flip: true, rot: 0.01 * Math.sin(TT * 1.4) });
  crew([{ n: 'man_walk', x: 600, y: FLOOR, h: 360 }, { n: 'sailor1', x: 420, y: FLOOR, h: 350 }, { n: 'man_skin', x: 240, y: FLOOR, h: 350 }]);
  ctx.restore();
}
function p08() {   // only Eurylochus stays outside, by a tree, watching the open door; something feels wrong
  const tO = VW('l09', 'outside') - 0.4, tW = VW('l09', 'wrong') - 0.3;
  ctx.save(); cam(lerp(820, 700, at(tW, 2)), 600, 1.04 + 0.1 * at(tW, 2));
  forest('f8', [[150, 620]]);
  bfLay('circe_house.webp', 1280, FLOOR + 4, 520);
  song(1290, FLOOR - 230, 0.6, 8);
  fig('eury_wary', 420, FLOOR, 370, { rot: -0.02 * at(tW, 0.5) + 0.01 * Math.sin(TT * 1.2), sy: 1 - 0.01 * at(tW, 0.5) });
  eyeGlint(452, FLOOR - 330, at(tO, 0.4) * (1 - at(tO + 1.4, 0.5)));
  ctx.restore();
  tint('#1a0c10', 0.3 * at(tW, 0.8), 'multiply');
}
function p09() {   // the drugged wine: the men drink and sway; Circe touches each with her wand and they turn into pigs, one by one
  const tD = VW('l10', 'drugged') - 0.3, tT = VW('l11', 'touched') - 0.3, tP = VW('l11', 'pigs') - 0.4, tB = VW('l11', 'bristles') - 0.3;
  ctx.save(); cam(lerp(960, 800, at(tP, 2.5)), 620, 1.04 + 0.1 * at(tP, 2.5));
  circeHall({ cloths: [1580], fireX: 1820 });
  const sway = at(tD, 0.8);
  const cw = walk(1500, 1150, tT - 0.6, 1.4, 4, 5);
  fig('circe_wand', cw.x, FLOOR + cw.dy, 420, { flip: true, rot: cw.rot });
  const [wx, wy] = ptf('circe_wand', cw.x, FLOOR + cw.dy, 420, 0.97, 0.05, { flip: true, rot: cw.rot });
  sparks(wx, wy, at(tT, 0.3) * (1 - at(tP + 2.5, 0.6)), 9, 40);
  const men = [[860, 'man_drink', 270], [600, 'man_skin', 350], [360, 'man_walk', 350]];
  men.forEach(([x, n, h], i) => { const t1 = tP + i * 0.45, t2 = t1 + 1.3, r = 0.04 * sway * Math.sin(TT * 1.6 + i);
    sparks(x + 20, FLOOR - h * 0.7, at(t1 - 0.4, 0.2) * (1 - at(t1 + 0.4, 0.4)), 30 + i, 60);
    xf(t1, 0.4, (a) => fig(n, x, FLOOR, h, { a, rot: r }), (a) => xf(t2, 0.5, (b) => fig('man_pighead', x, FLOOR, 350, { a: a * b, rot: 0.02 * Math.sin(TT * 5 + i) }), (b) => fig('pig', x + 30, FLOOR, 190, { a: a * b, rot: 0.02 * Math.sin(TT * 6 + i), sx: 1 + 0.02 * Math.sin(TT * 9 + i) * at(tB, 0.3) })));
  });
  ctx.restore();
  tint('#1a0c10', 0.18 * sway * (0.6 + 0.4 * Math.sin(TT * 1.3)), 'multiply');
}
function p10() {   // their minds stayed human: one pig close up; inside its outline the man it was, faint; a tear runs from its eye
  const tH = VW('l12', 'human') - 0.4, tC = VW('l12', 'cruel') - 0.3, t0 = SUB('p10');
  ctx.save(); cam(960, 640, 1.05 + 0.08 * EZ.io(pu('p10')));
  circeHall({ cloths: [1580], fireX: 1820 });
  const px = 960, ph = 420;
  fig('pig', px, FLOOR, ph, { rot: 0.01 * Math.sin(TT * 1.5) });
  fig('man_fear', px - 40, FLOOR - 6, 380, { a: 0.32 * at(tH, 0.8) * (0.8 + 0.2 * Math.sin(TT * 3)), flip: true });
  const [ex, ey] = ptf('pig', px, FLOOR, ph, 0.8, 0.34);
  eyeGlint(ex, ey, at(tH, 0.5));
  const tk = clamp((TT - tC) / 1.6); if (tk > 0 && tk < 1) bfDot(ex - 4, ey + 10 + tk * 120, 6, `rgba(240,222,190,${1 - tk * 0.6})`);
  void t0; ctx.restore();
}
function p11() {   // the sty: Circe drives the pigs in behind the fence and throws them acorns
  const tDr = VW('l13', 'drove') - 0.3, tA = VW('l13', 'acorns') - 0.5, t0 = SUB('p11');
  ctx.save(); cam(960, 600, 1.03 + 0.04 * EZ.io(pu('p11')));
  forest('f11', [[1820, 620]]);
  sty(620, 1440);
  [[760, 0], [1000, 0.3], [1240, 0.6]].forEach(([x, d], i) => { const w = walk(x - 600, x, t0 + d, 2.2, 8, 6); fig('pig', w.x, FLOOR + w.dy, 170, { rot: w.rot + 0.02 * Math.sin(TT * 3 + i) }); });
  const cw = walk(80, 400, tDr, 1.6, 5, 6);
  fig('circe_wand', cw.x, FLOOR + cw.dy, 400, { rot: cw.rot - 0.05 * at(tA, 0.3) * (1 - at(tA + 0.6, 0.3)) });
  acorns(cw.x + 120, FLOOR - 260, 1000, tA, 7, 11);
  ctx.restore();
}
function p12() {   // Eurylochus runs all the way back to the ship
  const t0 = SUB('p12'), tS = VW('l14', 'ship') - 0.6;
  ctx.save(); cam(lerp(860, 1100, EZ.io(pu('p12'))), 600, 1.03);
  sea(712, { speed: 10, x0: 1060 });
  ground(FLOOR, { sand: 1, key: 12, x1: 1080, slope: 0 });
  tree(140, FLOOR + 6, 600, { key: 'b12' });
  ship(1520, 820, 520, { behind: (s) => { shipOdy(s, -0.25, 'ody_look', 200); shipOdy(s, 0.1, 'sailor1', 170); } });
  const r = walk(-200, 1000, t0 + 0.1, Math.max(2, tS - t0 + 0.6), 11, 16);
  fig('eury_run', r.x, FLOOR + r.dy, 360, { rot: r.rot });
  ctx.restore();
}
function p13() {   // Odysseus takes up his sword and goes alone into the forest
  const t0 = SUB('p13'), tSw = VW('l14', 'sword') - 0.3, tA = VW('l14', 'alone') - 0.4;
  ctx.save(); cam(lerp(800, 1100, at(tA, 2.5)), 600, 1.04);
  forest('f13', [[1500, 620], [1880, 580]]);
  crew([{ n: 'eury_wary', x: 160, y: FLOOR, h: 350, flip: false }]);
  const w = walk(420, 1300, tA, 3.4, 5.5, 8);
  xf(tSw, 0.4, (a) => fig('ody_look', 420, FLOOR, 370, { a }), (a) => fig('ody_sword', w.x, FLOOR + w.dy, 370, { a, rot: w.rot }));
  void t0; ctx.restore();
}
function p14() {   // on the path a young man stops him: Hermes comes down on winged sandals; Odysseus halts
  const t0 = SUB('p14'), tSt = VW('l15', 'stopped') - 0.6, tH = VW('l15', 'hermes') - 0.3, tG = VW('l15', 'gods') - 0.3;
  ctx.save(); cam(lerp(960, 1000, at(tH, 2)), 580, 1.04 + 0.05 * at(tH, 2));
  forest('f14', [[150, 620], [1840, 620]]);
  const w = walk(100, 640, t0, Math.max(1.2, tSt - t0), 5.5, 8);
  fig('ody_look', w.x, FLOOR + w.dy, 370, { rot: w.rot });
  const dk = EZ.o2(clamp((TT - tSt + 0.8) / 1.4)), hy = lerp(-200, FLOOR, dk);
  if (dk > 0) { glow(1220, hy - 200, 220, 'rgba(255,236,200,A)', 0.25 * (1 - at(tSt + 1.2, 1)) + 0.15 * at(tG, 0.4) * (1 - at(tG + 1, 0.6)), 'lighter'); fig('hermes', 1220, hy, 380, { flip: true, rot: 0.03 * (1 - dk) }); }
  ctx.restore();
}
function p15() {   // the gift: the plant called moly grows big between them — the black root glows on "black root", the white flower opens on "white flower"
  const tP = VW('l16', 'plant') - 0.4, tR = VW('l16', 'root') - 0.3, tF = VW('l16', 'flower') - 0.3, tM = VW('l16', 'moly') - 0.2;
  ctx.save(); cam(960, 560, 1.05 + 0.04 * at(tP, 2));
  forest('f15', [[170, 600], [1760, 600]], { noFar: true });
  fig('ody_look', 470, FLOOR, 370);
  fig('hermes', 1450, FLOOR, 380, { flip: true });
  const mk = at(tP, 1.2); if (mk > 0) { glow(960, FLOOR - 420, 300, 'rgba(255,236,200,A)', 0.18 * mk, 'lighter'); ctx.save(); ctx.globalAlpha *= mk; moly(960, FLOOR - 230 + 40 * (1 - mk) + 8 * Math.sin(TT * 1.4), 440, at(tR, 0.5), at(tF, 0.6)); ctx.restore(); }
  letters('MOLY', 960, 230, tM, 84, { step: 0.08 });
  ctx.restore();
}
function p16() {   // Hermes' advice: on a ledge between them the plan plays out — Circe raises her wand, Odysseus draws his sword
  const tE = VW('l17', 'eat') - 0.3, tWa = VW('l18', 'wand') - 0.4, tSw = VW('l18', 'sword') - 0.4, tK = VW('l18', 'kill') - 0.3;
  ctx.save(); cam(lerp(960, 960, 0), 560, 1.06 + 0.06 * at(tWa, 2));
  forest('f16', [[170, 600], [1760, 600]], { noFar: true });
  fig('ody_look', 470, FLOOR, 370);
  moly(560, FLOOR - 190, 90, 0, 1 - at(tE + 0.6, 0.6));
  fig('hermes', 1450, FLOOR, 380, { flip: true, rot: 0.015 * Math.sin(TT * 3) });
  const fk = at(tWa - 0.6, 0.6);
  if (fk > 0) { ctx.save(); ctx.globalAlpha *= fk; ctx.fillStyle = BF.black; ctx.fillRect(700, 470, 520, 8); ctx.restore();
    riseFrom(470, rise(tWa, 0.7), (dy) => fig('circe_wand', 1080, 470 + dy, 190, { flip: true }));
    const jab = at(tK, 0.25) * (1 - at(tK + 0.5, 0.3));
    riseFrom(470, rise(tSw, 0.7), (dy) => fig('ody_sword', 850 + 30 * jab, 470 + dy, 190, { rot: 0.05 * jab })); }
  ctx.restore();
}
function p17() {   // Odysseus drinks the wine: Circe offers the cup and he drinks it; the moly glows faintly in him
  const t0 = SUB('p17'), tDr = VW('l19', 'drank') - 0.4, tW = VW('l19', 'wine') - 0.2;
  ctx.save(); cam(960, 600, 1.06 + 0.05 * EZ.io(pu('p17')));
  circeHall({ cloths: [1580], fireX: 1820 });
  fig('circe_cup', 1250, FLOOR, 410, { flip: true });
  const w = walk(-200, 640, t0 - 0.4, Math.max(1, tDr - t0 + 0.4), 6, 7);
  xf(tDr, 0.5, (a) => fig('ody_look', w.x, FLOOR + w.dy, 370, { a, rot: w.rot }), (a) => fig('ody_drink', 660, FLOOR, 380, { a }));
  glow(660, FLOOR - 230, 120, 'rgba(255,240,210,A)', 0.3 * at(tW, 0.6), 'lighter');
  ctx.restore();
}
function p18() {   // she touches him with the wand: "go and lie down with your friends in the sty" — the sparks gather, fizzle and die. Nothing happens.
  const tT = VW('l20', 'touched') - 0.3, tSty = VW('l20', 'sty') - 0.3, tN = VW('l21', 'nothing') - 0.3, tH = VW('l21', 'happened');
  ctx.save(); cam(lerp(960, 860, at(tN, 1.5)), 600, 1.06 + 0.1 * at(tN, 1.5));
  circeHall({ cloths: [1580], fireX: 1820 });
  const lean = at(tT, 0.4);
  fig('circe_wand', 1120 - 40 * lean, FLOOR, 420, { flip: true, rot: -0.04 * lean });
  fig('ody_look', 660, FLOOR, 375, { rot: 0.005 * Math.sin(TT) });
  const fizz = at(tN, 0.6), sk = at(tT, 0.3) * (1 - fizz) + 0.5 * fizz * (1 - at(tN + 0.5, 0.5));
  sparks(700, FLOOR - 250, sk * (1 + 0.5 * Math.sin(TT * 20) * at(tSty, 0.3)), 18, 70 + 30 * fizz);
  // a ring of light pulses out from him and dies
  const rk = clamp((TT - tN) / 1.2); if (rk > 0 && rk < 1) { ctx.save(); ctx.strokeStyle = `rgba(240,222,190,${0.7 * (1 - rk)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(660, FLOOR - 200, 80 + 260 * rk, 120 + 300 * rk, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
  void tH; ctx.restore();
}
function p19() {   // he draws his sword and Circe drops to her knees
  const tD = VW('l22', 'drew') - 0.3, tDr = VW('l22', 'dropped') - 0.3, tU = VW('l22', 'understood') - 0.3;
  ctx.save(); cam(lerp(960, 1000, at(tDr, 1.5)), 600, 1.06 + 0.06 * at(tDr, 1.5), shake(tDr + 0.4, 6, 0.5), 19);
  circeHall({ cloths: [1580], fireX: 1820 });
  xf(tD, 0.3, (a) => fig('ody_look', 660, FLOOR, 375, { a }), (a) => fig('ody_sword', 700, FLOOR, 380, { a, rot: 0.02 * Math.sin(TT * 2) }));
  xf(tDr, 0.4, (a) => fig('circe_wand', 1120, FLOOR, 420, { a, flip: true }), (a) => fig('circe_kneel', 1150, FLOOR, 330, { a }));
  ctx.restore();
}
function p20() {   // "You must be Odysseus. Hermes always told me you'd come." He lowers the sword; Hermes' face flickers in the hall's light
  const tO = VW('l23', 'odysseus') - 0.3, tHe = VW('l23', 'hermes') - 0.4;
  ctx.save(); cam(lerp(1000, 960, at(tO, 2)), 620, 1.12 + 0.04 * at(tO, 2));
  circeHall({ cloths: [1580], fireX: 1820 });
  xf(tO + 0.4, 0.5, (a) => fig('ody_sword', 700, FLOOR, 380, { a }), (a) => fig('ody_look', 680, FLOOR, 375, { a }));
  fig('circe_kneel', 1150, FLOOR, 330, { rot: 0.01 * Math.sin(TT * 1.5) });
  const hk = at(tHe, 0.6) * (1 - at(tHe + 2, 0.8));
  if (hk > 0) { glow(700, 330, 150, 'rgba(255,236,200,A)', 0.2 * hk, 'lighter'); fig('hermes', 700, 440, 200, { a: 0.45 * hk, flip: true }); }
  ctx.restore();
}
function p21() {   // she turns his men back: in the sty the pigs rise into men, younger and taller than before; then she asks them all to stay
  const tT = VW('l24', 'turned') - 0.3, tTa = VW('l24', 'taller') - 0.3, tS = VW('l24', 'stay') - 0.4;
  ctx.save(); cam(960, 600, 1.03 + 0.04 * EZ.io(pu('p21')));
  forest('f21', [[1820, 620]]);
  sty(620, 1440);
  const grow = at(tTa, 0.8);
  [[760, 'sailor0'], [1000, 'man_skin'], [1240, 'man_walk']].forEach(([x, n], i) => { const t = tT + i * 0.35;
    sparks(x, FLOOR - 120, at(t - 0.3, 0.2) * (1 - at(t + 0.6, 0.4)), 40 + i, 70);
    xf(t, 0.5, (a) => fig('pig', x, FLOOR, 170, { a }), (a) => fig(n, x, FLOOR, 340 * (1 + 0.1 * grow), { a, flip: i === 0 })); });
  xf(tS, 0.5, (a) => fig('circe_wand', 400, FLOOR, 410, { a }), (a) => fig('circe_cup', 400, FLOOR, 410, { a }));
  ctx.restore();
}
function p22() {   // a whole year: the men lounge in the hall like the lotus eaters, Odysseus with his cup by Circe; twelve moons cross and are cut
  const t0 = SUB('p22'), tY = VW('l25', 'year') - 0.4;
  ctx.save(); cam(960, 600, 1.03 + 0.05 * EZ.io(pu('p22')));
  circeHall({ cloths: [1580], fireX: 1820 });
  fig('man_lotus', 300, FLOOR, 260); fig('man_drink', 620, FLOOR, 260);
  fig('ody_offer', 1010, FLOOR, 375, { rot: 0.01 * Math.sin(TT) });
  fig('circe_cup', 1330, FLOOR, 410, { flip: true });
  const mk = at(t0, 0.6); if (mk > 0) for (let i = 0; i < 2; i++) { const ph = mod((TT - t0) / 0.9 + i * 0.5, 1), x = lerp(200, 1720, ph), y = 320 - Math.sin(Math.PI * ph) * 120; ctx.save(); ctx.globalAlpha *= mk * Math.sin(Math.PI * ph); bfDot(x, y, 26, 'rgba(240,222,190,0.9)'); ctx.restore(); }
  tally(12, 960 - 5.5 * 34 - 10, 236, t0 + 0.2, Math.max(0.08, (tY - t0) / 12), { gap: 34, len: 60, w: 8 });
  ctx.restore();
}
function p23() {   // his men remind him: one points at him — "remember home" — and Ithaca appears in a roundel over their heads
  const tR = VW('l26', 'remind') - 0.3, tRe = VW('l26', 'remember') - 0.3, tH = VW('l26', 'home') - 0.3;
  ctx.save(); cam(lerp(960, 900, at(tRe, 2)), 600, 1.05 + 0.05 * at(tRe, 2));
  circeHall({ cloths: [1580], fireX: 1820 });
  xf(tH + 0.3, 0.5, (a) => fig('ody_offer', 600, FLOOR, 375, { a }), (a) => fig('ody_look', 600, FLOOR, 375, { a }));
  xf(tR, 0.4, (a) => fig('sailor1', 1100, FLOOR, 360, { a, flip: true }), (a) => fig('sailor0', 1100, FLOOR, 360, { a, flip: true, rot: 0.02 * Math.sin(TT * 3) }));
  fig('man_beg', 1340, FLOOR, 340, { flip: true });
  roundel(860, 330, 150, at(tRe, 0.7), () => { ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 2; for (let r = 0; r < 3; r++) { ctx.beginPath(); for (let x = 700; x <= 1020; x += 16) { const y = 400 + r * 20 + 3 * Math.sin(x * 0.05 + TT + r); x === 700 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore();
    coast(860, 392, 120); smoke(890, 300, 0.12, at(tH, 0.8), 23); });
  ctx.restore();
}
function p24() {   // he asks Circe to let him go: on his knees; she lets him — free to leave, but not home, not yet
  const tA = VW('l27', 'asked') - 0.4, tF = VW('l27', 'free') - 0.3, tY = VW('l27', 'yet') - 0.3;
  ctx.save(); cam(lerp(960, 1080, at(tY, 1.6)), 600, 1.05 + 0.08 * at(tY, 1.6));
  circeHall({ cloths: [1580], fireX: 1820 });
  xf(tA, 0.5, (a) => fig('ody_look', 640, FLOOR, 375, { a }), (a) => fig('ody_kneel', 700, FLOOR, 300, { a, rot: 0.01 * Math.sin(TT * 2) }));
  xf(tF, 0.5, (a) => fig('circe_cup', 1220, FLOOR, 410, { a, flip: true }), (a) => fig('circe_wand', 1200, FLOOR, 420, { a, flip: true, rot: 0.01 * Math.sin(TT) }));
  ctx.restore();
  tint('#1a0c10', 0.25 * at(tY, 0.8), 'multiply');
}
function p25() {   // first, the house of the dead: Circe points her wand into the dark on the left; the shades stir in it
  const tL = VW('l28', 'living') - 0.4, tH = VW('l28', 'house') - 0.3, tD = VW('l28', 'dead') - 0.3, u = at(tL, 2.5);
  ctx.save(); cam(lerp(1000, 820, at(tD, 2)), 600, 1.05 + 0.06 * at(tD, 2));
  circeHall({ cloths: [1580], fireX: 1820 });
  // the darkness creeping from the left edge
  ctx.save(); const g = ctx.createLinearGradient(-200, 0, 900, 0); g.addColorStop(0, `rgba(20,8,10,${0.92 * u})`); g.addColorStop(1, 'rgba(20,8,10,0)'); ctx.fillStyle = g; ctx.fillRect(-400, PIC0 - 200, 1300, PIC1 - PIC0 + 400); ctx.restore();
  [[160, 'shade', true], [330, 'ghost_old', false]].forEach(([x, n, f], i) => ghost(n, x, FLOOR, 300, { flip: f, a: 0.6 * at(tH + i * 0.4, 1) }));
  fig('ody_look', 760, FLOOR, 375, { flip: true });
  fig('circe_wand', 1220, FLOOR, 420, { flip: true });
  ctx.restore();
}
// ---- 7 · THE UNDERWORLD
function p26() {   // to the end of the world: the ship sails into the dark; the sun sinks and never comes back; the river Ocean; the chapter title
  const t0 = SUB('p26'), tN = VW('l29', 'never') - 0.4, tO = VW('l29', 'ocean') - 0.5, u = EZ.io(pu('p26'));
  ctx.save(); cam(960, 560, 1.02 + 0.04 * u);
  const sy = lerp(330, 760, EZ.io(clamp((TT - t0) / Math.max(1, tN - t0 + 0.6)))); clipAbove(702, () => { bfDot(1560, sy, 56, BF.black); });
  sea(702, { speed: 10 });
  // the river Ocean: a slow band of brown current at the far edge, swirling
  const ok = at(tO, 1.2); if (ok > 0) { ctx.save(); ctx.globalAlpha *= ok; ctx.strokeStyle = FIRE_COL; ctx.lineWidth = 10; ctx.lineCap = 'round'; for (let r = 0; r < 3; r++) { ctx.beginPath(); for (let x = 1000; x <= W + 400; x += 20) { const y = 690 + r * 6 + 6 * Math.sin(x * 0.02 - TT * 2 + r); x === 1000 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore(); }
  ship(lerp(420, 900, u), 800, 480, { behind: (s) => { shipOdy(s, -0.3, 'ody_look', 190); shipOdy(s, 0.1, 'sailor1', 150); shipOdy(s, 0.32, 'man_fear', 150); } });
  letters('VII · THE UNDERWORLD', 960, 300, t0 + 0.3, 76, { step: 0.045 });
  ctx.restore();
  tint('#2a1016', 0.55 * EZ.io(clamp((TT - t0 - 0.5) / Math.max(1, tN - t0))), 'multiply');
}
function p27() {   // he digs a pit with his sword and pours the offerings: milk, honey, wine, water, barley
  const tDg = VW('l30', 'dug') - 0.3, tPt = VW('l30', 'pit') - 0.3, tPo = VW('l30', 'poured') - 0.4;
  const tm = VW('l30', 'milk') - 0.3, th = VW('l30', 'honey') - 0.3, tw = VW('l30', 'wine') - 0.3, twa = VW('l30', 'water') - 0.3, tb = VW('l30', 'barley') - 0.3, tEnd = LE('l30') + 0.4;
  ctx.save(); cam(lerp(800, 760, at(tPo, 2)), 640, 1.08 + 0.1 * at(tPo, 2));
  hades('h27');
  const dig = Math.max(0, Math.sin((TT - tDg) * 7)) * (TT > tDg && TT < tPo ? 1 : 0);
  pit(at(tPt - 0.2, 1.2), clamp((TT - tPo) / 6) * 0.9, '#3e2a18');
  xf(tPo - 0.2, 0.4, (a) => fig('ody_sword', 600, FLOOR, 360, { a, rot: 0.1 * dig }), (a) => guard(600, 0, { a }));
  const [jx, jy] = ptf('ody_guard', 600, FLOOR, 270, 0.6, 0.86);
  const seg = (a, b) => at(a, 0.2) * (1 - at(b, 0.2));
  pour(jx, jy, seg(tm, th), 'rgb(240,226,198)'); pour(jx, jy, seg(th, tw), 'rgb(232,176,74)'); pour(jx, jy, seg(tw, twa), '#3a0f12'); pour(jx, jy, seg(twa, tb), 'rgba(240,226,198,0.55)', 5); pour(jx, jy, seg(tb, tEnd), 'rgb(232,190,120)', 4, true);
  ctx.restore();
}
function p28() {   // the ram and the black ewe: the blade, the animals sink down, their blood runs into the pit
  const tC = VW('l31', 'cut') - 0.3, tB = VW('l31', 'blood') - 0.4;
  ctx.save(); cam(lerp(900, 860, at(tB, 2)), 640, 1.08);
  hades('h28');
  pit(1, 0.9 * (1 - at(tB, 1)) + 0.0, '#3e2a18'); pit(1, 0.9 * at(tB, 1.5), '#5a160d');
  const fall = at(tC + 0.3, 0.9);
  fig('ram', 1150, FLOOR + 30 * fall, 230, { flip: true, rot: -0.5 * fall });
  fig('ram', 1330, FLOOR + 20 * fall, 210, { flip: true, rot: -0.4 * at(tC + 0.6, 0.9) });
  if (TT > tC && TT < tC + 0.4) { ctx.save(); ctx.strokeStyle = 'rgba(240,222,190,0.9)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1040, FLOOR - 260); ctx.lineTo(1180, FLOOR - 140); ctx.stroke(); ctx.restore(); }
  const bk = at(tB, 0.3); if (bk > 0) { ctx.save(); ctx.strokeStyle = '#5a160d'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.globalAlpha *= bk; ctx.beginPath(); ctx.moveTo(1060, FLOOR - 30); ctx.quadraticCurveTo(1000, FLOOR + 10, PX + 60, PY - 2); ctx.stroke(); ctx.restore(); }
  fig('ody_sword', 560, FLOOR, 360);
  ctx.restore();
}
function p29() {   // the dead come up out of the dark in their thousands: rows of shades rise from the ground behind the pit
  const tD = VW('l32', 'dead') - 0.5, tT = VW('l32', 'thousands') - 0.5;
  ctx.save(); cam(lerp(960, 1100, at(tD, 3)), 600, 1.04 - 0.04 * at(tT, 2));
  hades('h29');
  deadCrowd(tT, 22, { x0: 600, span: 1500, key: 29, s: 0.7, a: 0.5 });
  deadCrowd(tD, 9, { x0: 1060, span: 800, key: 30 });
  pit(1, 0.9, '#5a160d');
  guard(OX, 0);
  ctx.restore();
}
function p30() {   // brides, young men, old men, soldiers in bloody armour; all pushing toward the blood with a terrible noise
  const tBr = VW('l33', 'brides') - 0.4, tY = VW('l33', 'young') - 0.4, tO = VW('l33', 'old') - 0.4, tS = VW('l33', 'soldiers') - 0.4, tTe = VW('l34', 'terrible') - 0.3, tP = VW('l34', 'pushing') - 0.3;
  const push = 160 * at(tP, 1.5);
  ctx.save(); cam(1000, 600, 1.04, shake(tTe, 5, 1.6), 30);
  hades('h30');
  deadCrowd(SUB('p30') - 3, 18, { x0: 700, span: 1400, key: 29, s: 0.7, a: 0.5, push: push * 0.5 });
  pit(1, 0.9, '#5a160d');
  [[tBr, 'ghost_bride', 1120], [tY, 'ghost_youth', 1330], [tO, 'ghost_old', 1540], [tS, 'ghost_soldier', 1760]].forEach(([t, n, x], i) =>
    riseFrom(FLOOR + 2, rise(t, 0.9), (dy) => ghost(n, x - push * (1 - i * 0.12), FLOOR + dy, 360, { rot: 0.02 * Math.sin(TT * 2 + i) })));
  guard(OX, at(tP, 0.4) * (1 - at(tP + 0.8, 0.4)));
  ctx.restore();
}
function p31() {   // the dead are empty: one shade bends to the pit and drinks, and grows whole — only blood lets them remember, and speak
  const tE = VW('l35', 'empty') - 0.4, tB = VW('l35', 'blood') - 0.4, tR = VW('l35', 'remember') - 0.3, tS = VW('l35', 'speak') - 0.3;
  ctx.save(); cam(lerp(960, 960, 0), 640, 1.1 + 0.08 * at(tB, 2));
  hades('h31');
  deadCrowd(SUB('p31') - 3, 14, { x0: 1100, span: 900, key: 31, s: 0.75, a: 0.45 });
  pit(1, 0.85, '#5a160d');
  const bend = at(tB, 0.8) * (1 - at(tR + 0.6, 0.8));
  ghost('ghost_youth', 1060 - 60 * bend, FLOOR, 360, { rot: -0.35 * bend, solid: at(tR, 0.8), a: 1 - 0.3 * at(tE, 0.5) * (1 - at(tR, 0.5)) });
  eyeGlint(1000, FLOOR - 320, at(tR, 0.4));
  song(1010, FLOOR - 310, at(tS, 0.4) * (1 - at(tS + 1.6, 0.5)), 31);
  guard(OX, 0);
  ctx.restore();
}
function p32() {   // he holds them all back with his sword; he is waiting for one particular ghost
  const tH = VW('l36', 'held') - 0.3, tW = VW('l36', 'waiting') - 0.3, tG = VW('l36', 'ghost') - 0.4;
  const jab = Math.max(0, Math.sin((TT - tH) * 5)) * (TT > tH && TT < tW ? 1 : 0), back = 90 * at(tH, 0.5);
  ctx.save(); cam(lerp(900, 1300, at(tW, 2.5)), 600, 1.04 + 0.06 * at(tW, 2.5));
  hades('h32');
  deadCrowd(SUB('p32') - 3, 16, { x0: 1000, span: 1100, key: 32, s: 0.8, a: 0.55, push: -back });
  pit(1, 0.85, '#5a160d');
  [['ghost_bride', 1150], ['ghost_old', 1340], ['ghost_soldier', 1530]].forEach(([n, x], i) => ghost(n, x + back - 20 * jab, FLOOR, 350, { rot: 0.05 * jab }));
  guard(OX, jab);
  ghost('tiresias', 2100, FLOOR, 300, { a: 0.25 * at(tG, 1) });
  ctx.restore();
}
function p33() {   // the first to reach him: Elpenor, the youngest of his crew
  const tE = VW('l37', 'elpenor') - 0.4, tY = VW('l37', 'youngest') - 0.3, t0 = SUB('p33');
  ctx.save(); cam(lerp(960, 900, at(tE, 2)), 620, 1.06 + 0.08 * at(tE, 2));
  hades('h33');
  deadCrowd(t0 - 3, 14, { x0: 1300, span: 800, key: 33, s: 0.8, a: 0.45 });
  pit(1, 0.85, '#5a160d');
  const w = walk(1700, 1080, t0, Math.max(1.2, tE - t0 + 0.4), 4, 5);
  ghost('elpenor', w.x, FLOOR + w.dy, 350, { rot: w.rot });
  eyeGlint(w.x - 50, FLOOR - 310, at(tY, 0.4) * (1 - at(tY + 1.2, 0.5)));
  guard(OX, 0);
  ctx.restore();
}
function p34() {   // their last night at Circe's: Elpenor asleep drunk on the roof; in the morning he forgets, steps off the edge and falls
  const tN = VW('l38', 'night') - 0.4, tR = VW('l38', 'roof') - 0.4, tM = VW('l39', 'morning') - 0.4, tSt = VW('l39', 'stepped') - 0.3, tNk = VW('l39', 'neck') - 0.3;
  ctx.save(); cam(lerp(1100, 1000, at(tSt, 1)), 560, 1.05 + 0.08 * at(tR, 2), shake(tNk, 8, 0.6), 34);
  forest('f34', [[180, 620]]);
  const hx = 1150, hh = 540; bfLay('circe_house.webp', hx, FLOOR + 4, hh);
  // the roof line measured from the layer: flat top over the middle, sloping to the eaves at 15% / 85% of its width
  const hw = hh * 1048 / 558, roofAt = (x) => { const fx = (x - hx) / hw + 0.5, yf = fx < 0.4 ? lerp(0.40, 0.28, clamp((fx - 0.15) / 0.25)) : fx > 0.6 ? lerp(0.28, 0.40, clamp((fx - 0.6) / 0.25)) : 0.28; return FLOOR + 4 - hh * (1 - yf); };
  const x0 = hx + 0.05 * hw, edgeX = hx + 0.33 * hw, tUp = tM + 0.2, tFall = tSt + 0.3, fallK = EZ.i2(clamp((TT - tFall) / 0.7));
  const w = walk(x0, edgeX, tUp + 0.4, Math.max(0.5, tFall - tUp - 0.4), 4, 3), ex = TT < tFall ? w.x : edgeX + 90 * fallK, ey = TT < tFall ? roofAt(w.x) + w.dy : lerp(roofAt(edgeX), FLOOR + 2, fallK);
  xf(tUp, 0.5, (a) => fig('man_dead', x0, roofAt(x0) + 6, 70, { a, still: true, sx: 1 + 0.01 * Math.sin(TT * 1.3) }),
    (a) => xf(tFall + 0.7, 0.3, (b) => fig('elpenor', ex, ey, 170, { a: a * b, flip: true, rot: (TT < tFall ? w.rot : 0) + 1.4 * fallK }), (b) => fig('man_dead', edgeX + 150, FLOOR + 2, 70, { a: a * b, still: true })));
  ctx.restore();
  night(at(tN, 0.8) * (1 - at(tM, 0.8)));
}
function p35() {   // they sail without noticing he is gone: the ship goes; his body lies alone on the shore; his shade rises and begs
  const t0 = SUB('p35'), tB = VW('l40', 'begged') - 0.4, tBu = VW('l40', 'bury') - 0.3, u = EZ.io(pu('p35'));
  ctx.save(); cam(960, 600, 1.03 + 0.04 * u);
  sea(712, { speed: 10, x0: 800 });
  ground(FLOOR, { sand: 1, key: 35, x1: 820 });
  tree(120, FLOOR + 6, 600, { key: 'b35' });
  ship(lerp(1250, 1900, u), 800, 440, { behind: (s) => { shipOdy(s, -0.3, 'ody_look', 180); shipOdy(s, 0.12, 'sailor1', 150); } });
  fig('man_dead', 520, FLOOR + 2, 72, { still: true });
  const gk = at(tB - 0.4, 1.2);
  if (gk > 0) riseFrom(FLOOR + 2, gk, (dy) => ghost('elpenor', 560, FLOOR + dy, 340, { flip: true, rot: 0.03 * Math.sin(TT * 2) + 0.04 * at(tBu, 0.4) }));
  void t0; ctx.restore();
}
function p36() {   // then someone he did not expect: a veiled old woman comes out of the dark — his mother; alive, the day he left for Troy
  const tS = VW('l41', 'someone') - 0.4, tM = VW('l41', 'mother') - 0.3, tA = VW('l42', 'alive') - 0.4, tT = VW('l42', 'troy') - 0.4;
  ctx.save(); cam(lerp(960, 1020, at(tM, 2)), 620, 1.05 + 0.06 * at(tM, 2));
  hades('h36');
  deadCrowd(SUB('p36') - 3, 12, { x0: 1300, span: 800, key: 36, s: 0.8, a: 0.4 });
  pit(1, 0.8, '#5a160d');
  const w = walk(1800, 1180, tS, Math.max(1.2, tM - tS + 0.4), 3.5, 4);
  ghost('anticleia', w.x, FLOOR + w.dy, 350, { rot: w.rot });
  xf(tM, 0.5, (a) => guard(OX, 0, { a }), (a) => fig('ody_look', OX, FLOOR, 370, { a, rot: -0.02 }));
  roundel(960, 330, 150, at(tA, 0.7) * (1 - at(LE('l42') + 0.4, 0.5)), () => {
    ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 2; for (let r = 0; r < 3; r++) { ctx.beginPath(); for (let x = 800; x <= 1120; x += 16) { const y = 410 + r * 18 + 3 * Math.sin(x * 0.05 + TT + r); x === 800 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore();
    fig('anticleia', 1030, 410, 150, { rot: 0.04 * Math.sin(TT * 3) }); ship(lerp(900, 840, at(tT, 2)), 432, 150, { flip: true }); });
  ctx.restore();
}
function p37() {   // he keeps her back with the sword too; he won't let her drink; the camera stays on her — one of the hardest moments
  const tK = VW('l43', 'kept') - 0.3, tD = VW('l44', 'drink') - 0.4, tH = VW('l45', 'hardest') - 0.4;
  ctx.save(); cam(lerp(960, 1140, at(tH, 2.5)), 600, 1.05 + 0.14 * at(tH, 3));
  hades('h37');
  deadCrowd(SUB('p37') - 3, 12, { x0: 1350, span: 800, key: 37, s: 0.8, a: 0.4 });
  pit(1, 0.8, '#5a160d');
  const lean = at(tD, 0.6) * (1 - at(tD + 1.2, 0.6));
  ghost('anticleia', 1150 - 50 * lean, FLOOR, 350, { rot: -0.12 * lean });
  guard(OX, at(tK, 0.3) * (1 - at(tK + 0.8, 0.4)) + lean);
  ctx.restore();
  tint('#1a0c10', 0.3 * at(tH, 1), 'multiply');
}
function p38() {   // at last Tiresias, the blind prophet, with his golden staff; he bends and drinks the blood, then speaks the truth
  const t0 = SUB('p38'), tT = VW('l46', 'tiresias') - 0.5, tG = VW('l46', 'golden') - 0.3, tDr = VW('l47', 'drank') - 0.4, tTr = VW('l47', 'truth') - 0.3;
  ctx.save(); cam(lerp(1050, 960, at(tDr, 2)), 600, 1.05 + 0.05 * at(tTr, 2));
  hades('h38');
  deadCrowd(t0 - 3, 12, { x0: 1350, span: 800, key: 38, s: 0.8, a: 0.4 });
  pit(1, 0.8 * (1 - 0.3 * at(tDr, 1)), '#5a160d');
  const w = walk(1900, 1120, t0, Math.max(1.4, tT - t0 + 1.2), 3, 4), bend = at(tDr, 0.6) * (1 - at(tTr - 0.4, 0.6));
  ghost('tiresias', w.x - 40 * bend, FLOOR + w.dy, 380, { rot: w.rot - 0.3 * bend, solid: at(tDr + 0.4, 1) });
  const [sx, sy] = ptf('tiresias', w.x - 40 * bend, FLOOR + w.dy, 380, 0.08, 0.5, { rot: w.rot - 0.3 * bend });
  glow(sx, sy, 90, 'rgba(255,214,150,A)', 0.4 * at(tG, 0.4), 'lighter');
  eyeGlint(w.x - 70, FLOOR - 340, at(tTr, 0.4));
  fig('ody_look', OX, FLOOR, 370);
  ctx.restore();
}
// the prophecy: a bright vision strip
function p39() {   // Poseidon will never forgive you for his son: Poseidon rises from the sea, the Cyclops on his rock; still, the way home is drawn
  const t0 = SUB('p39'), tP = VW('l48', 'poseidon') - 0.4, tS = VW('l48', 'son') - 0.4, tH = VW('l49', 'home') - 0.5, tM = VW('l49', 'men') - 0.3, tTh = VW('l49', 'thing') - 0.3;
  ctx.save(); cam(lerp(1000, 900, at(tH, 2)), 560, 1.03);
  sea(702, { speed: 18 });
  riseFrom(SEA + 40, rise(tP, 1.2), (dy) => fig('poseidon', 1220, SEA + 60 + dy, 520, { flip: true, rot: 0.02 * Math.sin(TT * 1.4) }));
  rock(1700, 690, 90); riseFrom(650, rise(tS, 0.8), (dy) => fig('cyclops_pray', 1700, 650 + dy, 230, { flip: true }));
  ship(lerp(300, 480, at(tH, 3)), 800, 420, { behind: (s) => { shipOdy(s, -0.3, 'ody_look', 170); if (TT > tM) { shipOdy(s, 0.05, 'sailor1', 140, { a: at(tM, 0.5) }); shipOdy(s, 0.28, 'man_fear', 140, { a: at(tM + 0.2, 0.5) }); } } });
  route([[600, 620], [800, 560], [980, 600]], EZ.io(clamp((TT - tH) / 1.6)));
  letters('ONE THING', 640, 300, tTh, 70, { step: 0.05 });
  void t0; ctx.restore();
}
function p40() {   // the island of the Sun and the Sun god's cattle; leave them alone and all get home: the ship sails past
  const t0 = SUB('p40'), tI = VW('l50', 'island') - 0.4, tC = VW('l50', 'cattle') - 0.4, tA = VW('l51', 'alone') - 0.4, tH = VW('l51', 'home') - 0.4;
  ctx.save(); cam(960, 560, 1.03);
  // the Sun over its island: a big black sun with turning rays
  const sk = at(tI, 1); ctx.save(); ctx.globalAlpha *= sk; bfDot(960, 280, 80, BF.black); ctx.strokeStyle = BF.black; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + TT * 0.25; ctx.beginPath(); ctx.moveTo(960 + Math.cos(a) * 100, 280 + Math.sin(a) * 100); ctx.lineTo(960 + Math.cos(a) * 140, 280 + Math.sin(a) * 140); ctx.stroke(); } ctx.restore();
  sea(702, { speed: 14 });
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(420, 712); ctx.bezierCurveTo(600, 600, 1320, 600, 1500, 712); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  [[700, 0], [960, 0.3], [1220, 0.6]].forEach(([x, d], i) => riseFrom(640 + (x === 960 ? -10 : 8), rise(tC + d, 0.8), (dy) => fig('bull', x, 640 + (x === 960 ? -10 : 8) + dy, 120, { flip: i === 1, rot: 0.01 * Math.sin(TT * 1.2 + i) })));
  ship(lerp(-300, 2200, EZ.io(clamp((TT - tA) / 4.5))), 830, 380, { behind: (s) => { shipOdy(s, -0.3, 'ody_look', 160); shipOdy(s, 0.1, 'sailor1', 130); } });
  coast(1800, 708, 130, { a: at(tH, 1) });
  void t0; ctx.restore();
}
function p41() {   // touch them: a bull falls, a bolt breaks the ship, the men drown; home late, alone, on a stranger's ship; men in his house eating his bread and courting his wife
  const tT = VW('l52', 'touch') - 0.3, tD = VW('l52', 'destroyed') - 0.4, tDi = VW('l52', 'die') - 0.3, tL = VW('l53', 'late') - 0.4, tSt = VW('l53', "stranger's") - 0.4, tM = VW('l54', 'men') - 0.4, tB = VW('l54', 'bread') - 0.3, tW = VW('l54', 'wife') - 0.4;
  ctx.save(); cam2(lerp(lerp(560, 1000, at(tL - 0.3, 1.2)), 1460, at(tM - 0.3, 1.2)), 560, 1.15);
  sea(702, { speed: 18, x0: -400 });
  // A: the bull slaughtered, the bolt, the wreck, the dead
  const bf = at(tT + 0.2, 0.8);
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(60, 712); ctx.bezierCurveTo(140, 640, 380, 640, 460, 712); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  fig('bull', 280, 664 + 30 * bf, 110, { rot: 0.6 * bf });
  fig('sailor2', 190, 668, 150, { rot: -0.05 * bf });
  const b = bolt(tD, 660, 0.5);
  if (TT < tD + 0.4) ship(680, 800, 300); else brokenShip(680, 800, 300, clamp((TT - tD - 0.4) / 2.5), 41);
  [[600, 0], [740, 0.4]].forEach(([x, d], i) => { const k = at(tDi + d, 0.6); if (k > 0) clipAbove(SEA + 30, () => fig('man_swim', x, SEA + 60 + 80 * at(tDi + d + 0.8, 1.2), 110, { a: k, rot: 0.08 * Math.sin(TT * 4 + i) })); });
  // B: home late and alone on a stranger's ship
  coast(1180, 708, 110);
  ship(lerp(820, 1000, at(tL, 3)), 790, 300, { flip: false, behind: (s) => { shipOdy(s, -0.1, 'ody_look', 130); if (TT > tSt) shipOdy(s, 0.3, 'suitor', 120, { a: at(tSt, 0.5) }); } });
  // C: his house — men eating his bread and courting his wife
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.fillRect(1260, 400, 560, 30); ctx.strokeRect(1260, 400, 560, 30);
  for (const cx of [1280, 1800]) { ctx.fillRect(cx - 14, 430, 28, 420); ctx.strokeRect(cx - 14, 430, 28, 420); } ctx.restore();
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.fillRect(1240, 720, 600, 300); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(1240, 720); ctx.lineTo(1840, 720); ctx.stroke(); ctx.restore();
  [[1380, 0, false], [1500, 0.3, false], [1620, 0.6, true]].forEach(([x, d, f], i) => riseFrom(722, rise(tM + d, 0.7), (dy) => fig('suitor', x, 720 + dy, 230, { flip: f, rot: 0.02 * Math.sin(TT * 3 + i) + (i < 2 ? 0.03 * at(tB, 0.3) * Math.sin(TT * 8) : 0) })));
  riseFrom(722, rise(tW, 0.7), (dy) => fig('penelope', 1740, 720 + dy, 240, { flip: true }));
  ctx.restore();
  if (b > 0) tint('#fff0d0', 0.3 * b);
}
function p42() {   // only then does he let his mother drink: the sword goes down; she bends to the pit and drinks
  const tM = VW('l55', 'mother') - 0.4, tD = VW('l55', 'drink') - 0.3;
  ctx.save(); cam(960, 620, 1.08);
  hades('h42');
  pit(1, 0.7, '#5a160d');
  xf(tM, 0.5, (a) => guard(OX, 0, { a }), (a) => fig('ody_look', OX, FLOOR, 370, { a }));
  const bend = at(tD, 0.6);
  ghost('anticleia', 1080 - 70 * bend, FLOOR, 350, { rot: -0.28 * bend, solid: at(tD + 0.6, 1.2) });
  ghost('tiresias', 1550, FLOOR, 380, { solid: 1, a: 0.85 });
  ctx.restore();
}
function p43() {   // she knows him straight away: not illness, not old age — she died of missing him, waiting for him to come home
  const tK = VW('l56', 'knew') - 0.3, tI = VW('l56', 'illness') - 0.3, tMi = VW('l57', 'missing') - 0.4, tWa = VW('l57', 'waiting') - 0.3;
  ctx.save(); cam(lerp(960, 900, at(tMi, 2.5)), 600, 1.14 + 0.08 * at(tMi, 3));
  hades('h43');
  fig('ody_look', 640, FLOOR, 375);
  ghost('anticleia', 1050, FLOOR, 360, { solid: 1, rot: 0.01 * Math.sin(TT * 1.2) });
  eyeGlint(1000, FLOOR - 320, at(tK, 0.4) * (1 - at(tK + 1.2, 0.6)));
  // tears from her eye on "missing"
  for (let i = 0; i < 3; i++) { const tk = clamp((TT - tMi - i * 0.8) / 1.6); if (tk > 0 && tk < 1) bfDot(996, FLOOR - 312 + tk * 120, 5, `rgba(240,222,190,${1 - tk * 0.6})`); }
  void tI; void tWa; ctx.restore();
  tint('#1a0c10', 0.25 * at(tMi, 1), 'multiply');
}
function p44() {   // three times he reaches out to hold her, and three times she slips through his arms like a shadow; I, II, III are cut
  const t1 = VW('l58', 'reached') - 0.5, t2 = VW('l58', 'three', 2) - 0.2, t3 = VW('l58', 'slipped') + 0.1, tD = VW('l58', 'dream') - 0.3;
  const T = [t1, t2, t3], step = T.reduce((s, t) => s + at(t, 0.6), 0);
  ctx.save(); cam(lerp(900, 1100, step / 3), 620, 1.08);
  hades('h44');
  // each embrace: he lunges, she thins to nothing as his arms close, then gathers again a little further away
  const dissolve = Math.max(...T.map((t) => Math.sin(Math.PI * clamp((TT - t) / 1.1)) * (TT > t ? 1 : 0)));
  const sx = 1030 + 110 * step;
  ghost('anticleia', sx, FLOOR, 360, { solid: 0.6 * (1 - dissolve), a: 1 - 0.85 * dissolve - 0.6 * at(tD, 1) });
  const lunge = Math.max(...T.map((t) => Math.sin(Math.PI * clamp((TT - t) / 1.1)) * (TT > t ? 1 : 0)));
  fig('ody_reach', 640 + 110 * step - 60 + 80 * lunge, FLOOR, 375, { rot: 0.06 * lunge });
  ['I', 'II', 'III'].forEach((s, i) => letters(s, 760 + i * 200 + 110 * step * 0.3, 260, T[i], 90, { step: 0.06 }));
  ctx.restore();
}
function p45() {   // after her, the heroes: Agamemnon, who led the whole war, murdered in his own house on the day he came home
  const t0 = SUB('p45'), tH = VW('l59', 'heroes') - 0.4, tA = VW('l60', 'agamemnon') - 0.5, tMu = VW('l60', 'murdered') - 0.3, tHo = VW('l60', 'home') - 0.3;
  ctx.save(); cam(lerp(960, 1080, at(tA, 2)), 600, 1.05 + 0.06 * at(tMu, 2));
  hades('h45');
  deadCrowd(t0 - 3, 12, { x0: 1350, span: 800, key: 45, s: 0.8, a: 0.4 });
  fig('ody_look', OX, FLOOR, 370);
  const w = walk(1900, 1150, tH, Math.max(1.4, tA - tH + 0.6), 3.5, 4);
  ghost('king_a', w.x, FLOOR + w.dy, 390, { flip: true, rot: w.rot + 0.03 * at(tMu, 0.4) });
  // the wound: a dark stain spreading on his chest on "murdered"
  const mk = at(tMu, 0.8); if (mk > 0) { ctx.save(); ctx.globalAlpha *= 0.85 * mk; bfDot(w.x - 10, FLOOR - 250, 16 * mk, '#5a160d'); ctx.restore(); }
  void tHo; ctx.restore();
  tint('#1a0c10', 0.3 * at(tMu, 0.6) * (1 - at(tHo + 0.8, 1)), 'multiply');
}
function p46() {   // Achilles, the greatest of the Greeks; Odysseus comforts him: honoured like a god, a king among the dead
  const tA = VW('l61', 'achilles') - 0.5, tC = VW('l62', 'comfort') - 0.4, tG = VW('l63', 'god') - 0.3, tK = VW('l63', 'king') - 0.3, tD = VW('l63', 'dead') - 0.3;
  ctx.save(); cam(lerp(1000, 960, at(tC, 2)), 600, 1.04 + 0.06 * at(tK, 2));
  hades('h46');
  deadCrowd(SUB('p46') - 3, 14, { x0: 1300, span: 900, key: 46, s: 0.75, a: 0.4 });
  xf(tC, 0.5, (a) => fig('ody_look', 620, FLOOR, 370, { a }), (a) => fig('ody_reach', 640, FLOOR, 370, { a, rot: 0.01 * Math.sin(TT * 2) }));
  riseFrom(FLOOR + 2, rise(tA, 1.2), (dy) => ghost('achilles', 1180, FLOOR + dy, 470, { solid: 0.4 }));
  eyeGlint(1180, FLOOR - 470, at(tG, 0.4) * (1 - at(tG + 1, 0.5)));
  // a crown of light over his head on "king"
  const ck = at(tK, 0.6); if (ck > 0) { ctx.save(); ctx.globalAlpha *= ck; ctx.strokeStyle = 'rgb(240,222,190)'; ctx.lineWidth = 4; ctx.beginPath(); const cx = 1170, cy = FLOOR - 500 - 6 * Math.sin(TT * 2); ctx.moveTo(cx - 50, cy); ctx.lineTo(cx - 50, cy - 30); ctx.lineTo(cx - 25, cy - 14); ctx.lineTo(cx, cy - 40); ctx.lineTo(cx + 25, cy - 14); ctx.lineTo(cx + 50, cy - 30); ctx.lineTo(cx + 50, cy); ctx.closePath(); ctx.stroke(); ctx.restore(); }
  void tD; ctx.restore();
}
function p47() {   // Achilles refuses: he'd rather be the poorest hired hand on earth, ploughing for a man with nothing, than king over all the dead
  const tDe = VW('l64', 'death') - 0.4, tP = VW('l65', 'poorest') - 0.4, tF = VW('l65', 'field') - 0.4, tK = VW('l65', 'king') - 0.3, tD = VW('l65', 'dead', 1) - 0.3;
  ctx.save(); cam(lerp(1000, 1120, at(tK, 2)), 600, 1.06 + 0.06 * at(tK, 2));
  hades('h47');
  deadCrowd(SUB('p47') - 3, 14, { x0: 1300, span: 900, key: 47, s: 0.75, a: 0.4 });
  fig('ody_look', 600, FLOOR, 370);
  ghost('achilles', 1180, FLOOR, 470, { solid: 0.4, rot: -0.02 * at(tDe, 0.5) });
  // the crown of light breaks up and falls away on "king"
  const ck = 1 - at(tK, 0.8); if (ck > 0 && TT < tK + 1) { ctx.save(); ctx.globalAlpha *= ck; ctx.strokeStyle = 'rgb(240,222,190)'; ctx.lineWidth = 4; const cx = 1170, cy = FLOOR - 500 + 80 * (1 - ck); ctx.beginPath(); ctx.moveTo(cx - 50, cy); ctx.lineTo(cx - 50, cy - 30); ctx.lineTo(cx - 25, cy - 14); ctx.lineTo(cx, cy - 40); ctx.lineTo(cx + 25, cy - 14); ctx.lineTo(cx + 50, cy - 30); ctx.lineTo(cx + 50, cy); ctx.closePath(); ctx.stroke(); ctx.restore(); }
  // the hired hand's field in a roundel: a lean man walking behind a plough ox, the sun over him
  roundel(880, 330, 160, at(tP, 0.7) * (1 - at(tD + 0.5, 0.6)), () => {
    ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(720, 430); ctx.lineTo(1040, 430); ctx.stroke(); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(730 + i * 70, 450); ctx.lineTo(780 + i * 70, 440); ctx.stroke(); } ctx.restore();
    bfDot(990, 230, 24, BF.black);
    const pw = walk(760, 900, tF, 4, 3, 3); fig('bull', pw.x + 70, 430 + pw.dy * 0.3, 80, {}); fig('man_walk', pw.x - 40, 430 + pw.dy, 110, { rot: pw.rot }); });
  ctx.restore();
  tint('#1a0c10', 0.25 * at(tDe, 0.8), 'multiply');
}
function p48() {   // he climbs back up to the light: the path up out of the dark, the wash lifting, light at the top
  const t0 = SUB('p48'), tC = VW('l66', 'climbed') - 0.4, tL = VW('l66', 'light') - 0.4;
  ctx.save(); cam(lerp(800, 1120, EZ.io(pu('p48'))), 560, 1.02);
  glow(1800, 300, 520, 'rgba(255,236,200,A)', 0.4 * at(tL, 2), 'lighter');
  mountain({ noCave: true });
  const w = walk(240, 1500, tC, Math.max(3, LE('l66') - tC + 2.5), 5, 7);
  fig('ody_look', w.x, SLOPE(w.x) + 10 + w.dy, 330, { rot: w.rot });
  ctx.restore();
  tint('#2a1016', 0.55 * (1 - at(tL, 3)), 'multiply');
  void t0;
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
const FULL_SET = new Set(['p02', 'p06', 'p07', 'p09', 'p10', 'p17', 'p18', 'p19', 'p20', 'p22', 'p23', 'p24', 'p25', 'p27', 'p28', 'p29', 'p30', 'p31', 'p32', 'p33', 'p34', 'p35', 'p36', 'p37', 'p38', 'p42', 'p43', 'p44', 'p45', 'p46', 'p47']);   // panels that fill the picture with a set (Circe's hall, the deck, the underworld): they slide in as cards
const FG_SET = new Set(['circe_house.webp', 'coast.webp', 'ship_beached']), JUNK = document.createElement('canvas'); JUNK.width = JUNK.height = 2;
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
const PANELS = { p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24, p25, p26, p27, p28, p29, p30, p31, p32, p33, p34, p35, p36, p37, p38, p39, p40, p41, p42, p43, p44, p45, p46, p47, p48 };
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
const BOARD_AT = { p01: ['l01', 'forest'], p02: ['l03', 'eaten'], p03: ['l04', 'eurylochus'], p04: ['l05', 'stone'], p05: ['l06', 'dogs'], p06: ['l07', 'loom'], p07: ['l08', 'wine'], p08: ['l09', 'wrong'], p09: ['l11', 'bristles'], p10: ['l12', 'cruel'], p11: ['l13', 'acorns'], p12: ['l14', 'ship'], p13: ['l14', 'alone'], p14: ['l15', 'gods'], p15: ['l16', 'moly'], p16: ['l18', 'kill'], p17: ['l19', 'wine'], p18: ['l21', 'happened'], p19: ['l22', 'understood'], p20: ['l23', 'hermes'], p21: ['l24', 'stay'], p22: ['l25', 'year'], p23: ['l26', 'home'], p24: ['l27', 'yet'], p25: ['l28', 'dead'], p26: ['l29', 'ocean'], p27: ['l30', 'wine'], p28: ['l31', 'blood'], p29: ['l32', 'thousands'], p30: ['l34', 'pushing'], p31: ['l35', 'remember'], p32: ['l36', 'ghost'], p33: ['l37', 'youngest'], p34: ['l39', 'stepped'], p35: ['l40', 'bury'], p36: ['l42', 'troy'], p37: ['l45', 'hardest'], p38: ['l47', 'truth'], p39: ['l49', 'home'], p40: ['l51', 'alone'], p41: ['l54', 'wife'], p42: ['l55', 'drink'], p43: ['l57', 'missing'], p44: ['l58', 'reached'], p45: ['l60', 'murdered'], p46: ['l63', 'king'], p47: ['l65', 'field'], p48: ['l66', 'ears'] };
TIMELINE.board = IDS.map((id, i) => { const [l, w, n] = BOARD_AT[id]; const t = Math.min(VW(l, w, n) + 0.6, SUBEND(id) - 0.6); return { t: Math.round(t * FPS) / FPS, title: id, sound: '', next: '' }; });
