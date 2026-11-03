// =====================================================================
//  SCENES — Odyssey p4: The Sirens, Scylla and Charybdis, The Cattle of the Sun (amphora-bf, Flow layers, 16:9). The ground and its friezes (assets/bg.jpg) are fixed on screen;
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
//  the panels (panel coords = screen coords)
// =====================================================================
// ---- 8 · THE SIRENS
function p01() {   // continuing from part 3's climb to the light: on the shore at dawn Circe points out to sea and warns him; the chapter title
  const t0 = SUB('p01'), tW = VW('l01', 'warned') - 0.4, tN = VW('l01', 'next') - 0.3, u = EZ.io(pu('p01'));
  ctx.save(); cam(lerp(900, 1040, u), 560, 1.02 + 0.03 * u);
  glow(1700, 360, 520, 'rgba(255,236,200,A)', 0.3, 'lighter');
  sea(SEA, { speed: 12, x0: 980 });
  ground(FLOOR, { sand: 1, key: 'p1', x1: 1000, slope: 0 });
  tree(140, FLOOR + 6, 560, { key: 'p1t' });
  ship(1520, 800, 480, { behind: (s) => { shipOdy(s, 0.1, 'sailor1', 150); shipOdy(s, 0.3, 'sailor2', 150); } });
  fig('circe_wand', 760, FLOOR, 420, { rot: -0.04 * at(tN, 0.4) });
  const w = walk(-150, 420, t0, 2.4, 6, 7); fig('ody_look', w.x, FLOOR + w.dy, 380, { rot: w.rot });
  const [wx, wy] = ptf('circe_wand', 760, FLOOR, 420, 0.97, 0.05); sparks(wx, wy, at(tW, 0.4) * 0.8, 1, 30);
  letters('VIII · THE SIRENS', 960, 300, t0 + 0.4, 88, { step: 0.06 });
  ctx.restore();
}
function p02() {   // the Sirens: two bird-women on the rocks of a meadow by the sea, singing
  const tS = VW('l02', 'sirens') - 0.4, tT = VW('l02', 'two') - 0.3, tSa = VW('l02', 'sang') - 0.3, u = EZ.io(pu('p02'));
  ctx.save(); cam(lerp(1000, 960, u), 560, 1.04 + 0.05 * u);
  sea(SEA, { speed: 8 });
  const P = sirenIsle(1000, 1.15);
  riseFrom(P.a[1] + 4, rise(tS, 0.9), (dy) => siren('siren_a', P.a[0], P.a[1] + dy, 300, at(tSa, 0.6)));
  riseFrom(P.b[1] + 4, rise(tT, 0.9), (dy) => siren('siren_b', P.b[0], P.b[1] + dy, 320, at(tSa + 0.2, 0.6)));
  birds(3, 260, 22, 2);
  ctx.restore();
}
function p03() {   // every sailor steered straight to them: a little ship turns toward the isle; the camera finds the bones piled in the meadow
  const tE = VW('l03', 'every') - 0.3, tSt = VW('l03', 'steered') - 0.3, tB = VW('l03', 'bones') - 0.5, tSk = VW('l03', 'skin') - 0.3;
  ctx.save(); cam2(lerp(700, 1150, at(tB - 0.6, 1.6)), 640, lerp(1.0, 1.2, at(tB - 0.6, 1.6)));
  sea(SEA, { speed: 8 });
  const P = sirenIsle(1300, 1.15, { bones: at(tB, 0.8), bonesX: -10 });
  siren('siren_a', P.a[0], P.a[1], 300, 1); siren('siren_b', P.b[0], P.b[1], 320, 1);
  // a ship of other sailors turns and runs at the rocks
  const k = clamp((TT - tSt) / 3.2), sx = lerp(200, 760, EZ.io(k));
  if (TT > tE - 0.6) ship(sx, 790 + 10 * k, 300, { rot: 0.06 * k, a: at(tE - 0.6, 0.6) * (1 - at(tSk, 0.8)), behind: (s) => { shipOdy(s, -0.25, 'man_beg', 110); shipOdy(s, 0.15, 'man_walk', 110); } });
  songStream(1100, 300, 560, 0.7, 3);
  ctx.restore();
}
function p04() {   // the crew plug their ears with wax (deck card): a bowl of wax lumps; the young sailor presses it in, another follows
  const tP = VW('l04', 'plugged') - 0.4, tW = VW('l04', 'wax') - 0.3;
  ctx.save(); cam(960, 600, 1.04 + 0.04 * EZ.io(pu('p04')));
  deck({ furled: true, mast: 1500 });
  // the bowl of wax on a crate
  ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.fillRect(880, DECK - 110, 160, 110); ctx.strokeRect(880, DECK - 110, 160, 110);
  ctx.beginPath(); ctx.ellipse(960, DECK - 118, 70, 20, 0, 0, Math.PI); ctx.fill(); ctx.stroke(); ctx.restore();
  for (let i = 0; i < 5; i++) bfDot(920 + i * 20, DECK - 124 - (i % 2) * 6, 9, 'rgb(232,206,150)');
  fig('man_row_a', 1260, DECK, 250);
  fig('man_wax', 640, DECK, 370, { rot: 0.02 * Math.sin(TT * 3) * at(tW, 0.3) });
  fig('sailor1', 330, DECK, 350, { rot: 0.02 * Math.sin(TT * 2.6) });
  void tP; ctx.restore();
}
function p05() {   // Odysseus, of course, wanted to hear it: he stands at the rail, leaning toward the sea, a glint in his eye
  const tO = VW('l05', 'course') - 0.3, tH = VW('l05', 'hear') - 0.4;
  ctx.save(); cam(lerp(960, 760, at(tH, 1.6)), 560, 1.04 + 0.12 * at(tH, 1.6));
  deck({ furled: true, mast: 1500 });
  fig('man_wax', 1240, DECK, 360, { flip: true });
  fig('ody_look', 700, DECK, 400, { rot: -0.03 * at(tO, 0.6) });
  songStream(560, -100, 420, 0.4 * at(tH, 0.8), 5);
  ctx.restore();
}
function p06() {   // tied to the mast hand and foot: two men wind the ropes; "if I beg you, tie me tighter" — the ropes pull tight
  const tT = VW('l06', 'tie') - 0.4, tM = VW('l06', 'mast') - 0.3, tB = VW('l06', 'beg') - 0.3, tTi = VW('l06', 'tighter') - 0.3;
  ctx.save(); cam(960, 560, 1.03 + 0.05 * at(tTi, 0.8));
  const ox = 900; deck({ furled: true, mast: ox + MAST_OFF });
  tiedOdy(ox);
  wraps(ox, at(tM, 1.2), { tight: at(tTi, 0.3) });
  const pull = (d) => 0.06 * Math.sin((TT - tT) * 6 + d) * at(tT, 0.3) * (1 - at(tM + 1.5, 0.4)) - 0.06 * at(tTi, 0.2) * (1 - at(tTi + 0.6, 0.3));
  fig('man_untie', 1140, DECK, 300, { flip: true, rot: pull(0) });
  fig('man_walk', 640, DECK, 340, { rot: pull(1.5) });
  void tB; ctx.restore();
}
function p07() {   // the wind drops, the sea goes flat; then the song comes over the water
  const tD = VW('l07', 'dropped') - 0.3, tF = VW('l07', 'flat') - 0.3, tS = VW('l07', 'song') - 0.4, u = EZ.io(pu('p07'));
  const calm = at(tD, 2.2);
  ctx.save(); cam(960, 580, 1.03);
  sea(SEA, { speed: lerp(16, 1.5, calm), bump: (x, r) => 0 });
  ship(lerp(500, 760, u), 800, 520, { behind: (s) => { shipOdy(s, -0.3, 'man_row_b', 130); shipOdy(s, 0.0, 'ody_tied', 200); shipOdy(s, 0.3, 'man_wax', 160); } });
  // the flat calm: a long still line over the water
  ctx.save(); ctx.globalAlpha = at(tF, 0.8); ctx.strokeStyle = BF.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1300, SEA - 2); ctx.lineTo(W + 400, SEA - 2); ctx.stroke(); ctx.restore();
  songStream(W + 100, 900, 520, at(tS, 1.0), 7);
  gust(1800, 420, 500, Math.PI, 1 - calm, 7, { n: 3 });
  ctx.restore();
}
function p08() {   // what they sang about was him: the Sirens close up, the song pours out — "Come here, famous Odysseus"
  const tH = VW('l08', 'him') - 0.3, tC = VW('l09', 'come') - 0.3, tO = VW('l09', 'odysseus') - 0.3, tG = VW('l09', 'glory') - 0.3, u = EZ.io(pu('p08'));
  ctx.save(); cam(lerp(1080, 980, u), 560, 1.25 + 0.06 * u);
  sea(SEA, { speed: 2 });
  const P = sirenIsle(1150, 1.15);
  siren('siren_a', P.a[0], P.a[1], 300, 1); siren('siren_b', P.b[0], P.b[1], 320, 1);
  songStream(1000, 200, 470, 0.9, 9);
  letters('ODYSSEUS', 560, 330, tO, 64, { step: 0.06, a: 1 - at(tG + 1.4, 0.6) });
  void tH; void tC; ctx.restore();
}
function p09() {   // "we know everything you suffered at Troy, everything on earth": roundels open over the Sirens — Troy, then the whole world
  const tT = VW('l10', 'troy') - 0.4, tE = VW('l10', 'earth') - 0.4;
  ctx.save(); cam(980, 560, 1.06);
  sea(SEA, { speed: 2 });
  const P = sirenIsle(1300, 1.0);
  siren('siren_a', P.a[0], P.a[1], 280, 1); siren('siren_b', P.b[0], P.b[1], 300, 1);
  roundel(560, 400, 210, at(tT, 0.7), () => { bfLay('troy_walls.webp', 560, 520, 190); fireAt(470, 360, 0.35, 1, 9); fireAt(640, 350, 0.3, 1, 10); });
  roundel(1000, 330, 170, at(tE, 0.7), () => { sea(400, { speed: 10 }); blackSun(1000, 260, 36, 1); coast(900, 402, 60); coast(1110, 402, 50, { flip: true }); });
  ctx.restore();
}
function p10() {   // "stop and listen, and leave knowing more": the ship on the flat sea, Odysseus at the mast; the Sirens beckon from their rocks
  const tSt = VW('l11', 'stop') - 0.3, tL = VW('l11', 'listen') - 0.3, tK = VW('l11', 'knowing') - 0.3;
  ctx.save(); cam(960, 580, 1.03);
  sea(SEA, { speed: 2 });
  const P = sirenIsle(1520, 0.85);
  siren('siren_b', P.a[0], P.a[1], 250, 1, { rot: 0.04 * Math.sin(TT * 3) * at(tSt, 0.4) }); siren('siren_a', P.b[0], P.b[1], 230, 1);
  ship(600, 800, 560, { behind: (s) => { shipOdy(s, -0.32, 'man_row_b', 140); shipOdy(s, -0.05, 'ody_tied', 230); shipOdy(s, 0.25, 'man_wax', 170); } });
  songStream(1350, 750, 460, 0.9, 11);
  void tL; ctx.restore();
}
function p11() {   // the bait: fame and knowing everything, the two things he wanted most — a laurel crown and an open eye shine over him
  const tB = VW('l12', 'bait') - 0.3, tF = VW('l13', 'fame') - 0.4, tK = VW('l13', 'know') - 0.4, tM = VW('l13', 'most') - 0.3;
  ctx.save(); cam(960, 560, 1.03 + 0.06 * at(tM, 1));
  const ox = 960; deck({ furled: true, mast: ox + MAST_OFF });
  tiedOdy(ox);
  fig('man_row_a', 1460, DECK, 240); fig('man_row_b', 420, DECK, 260);
  roundel(620, 330, 130, at(tF, 0.6), () => { laurel(620, 340, 70); });
  roundel(1300, 330, 130, at(tK, 0.6), () => { eye(1300, 330, 70); });
  ctx.restore();
}
function laurel(x, y, r) { ctx.save(); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 1.4; for (const d of [-1, 1]) for (let i = 0; i < 8; i++) { const a = Math.PI / 2 + d * (0.3 + i * 0.32), lx = x + Math.cos(a) * r, ly = y + Math.sin(a) * r * 0.9; ctx.save(); ctx.translate(lx, ly); ctx.rotate(a + d * 0.9); ctx.beginPath(); ctx.ellipse(0, 0, 7, 17, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); } ctx.restore(); }
function eye(x, y, r) { ctx.save(); ctx.fillStyle = BF.black; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.quadraticCurveTo(x, y - r * 0.8, x + r, y); ctx.quadraticCurveTo(x, y + r * 0.8, x - r, y); ctx.fill(); bfDot(x, y, r * 0.34, CREAM); bfDot(x, y, r * 0.16, BF.black); ctx.strokeStyle = BF.black; ctx.lineWidth = 4; for (let i = 0; i < 9; i++) { const a = Math.PI + 0.2 + i * 0.34; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.62); ctx.lineTo(x + Math.cos(a) * r * 1.05, y + Math.sin(a) * r * 0.95); ctx.stroke(); } ctx.restore(); }
function p12() {   // he begs them to untie him; he shouts and pulls at the ropes until they cut into his skin; the rowers row on, deaf
  const tB = VW('l14', 'begged') - 0.4, tSh = VW('l15', 'shouted') - 0.3, tP = VW('l15', 'pulled') - 0.3, tC = VW('l15', 'cut') - 0.3;
  ctx.save(); cam(960, 560, 1.04 + 0.06 * at(tSh, 0.6), shake(tSh, 6) + shake(tP, 6), 3);
  const ox = 900; deck({ furled: true, mast: ox + MAST_OFF });
  tiedOdy(ox, at(tB, 0.4), { tS: tB });
  wraps(ox, 1, { tight: at(tC, 0.3) });
  const row = (d) => 0.05 * Math.sin(TT * 2.4 + d);
  fig('man_row_a', 1400, DECK, 250, { rot: row(0) }); fig('man_row_b', 400, DECK, 270, { rot: row(1.4) });
  ctx.restore();
  tint('#1a0c10', 0.15 * at(tC, 0.5), 'multiply');
}
function p13() {   // two of his men get up and tie him tighter
  const tTw = VW('l16', 'two') - 0.4, tTi = VW('l16', 'tighter') - 0.4;
  ctx.save(); cam(960, 560, 1.06);
  const ox = 900; deck({ furled: true, mast: ox + MAST_OFF });
  tiedOdy(ox, 1, { tS: -1, shake: 0.6 });
  wraps(ox, 1, { tight: 1, at: [[DECK - 300, 70], [DECK - 260, 68], [DECK - 230, 66], [DECK - 120, 46], [DECK - 40, 40]] });
  const a = walk(1500, 1130, tTw, 1.3, 6, 6), b = walk(300, 650, tTw + 0.2, 1.3, 6, 6);
  const yank = 0.08 * at(tTi, 0.2) * (1 - at(tTi + 0.5, 0.3));
  fig('man_untie', a.x, DECK + a.dy, 300, { flip: true, rot: a.rot - yank });
  fig('man_oath', b.x, DECK + b.dy, 360, { flip: true, rot: b.rot + yank });
  ctx.restore();
}
function p14() {   // the song fades behind them; the wax comes out; they row on toward the narrowest place in the sea — two cliffs rise ahead
  const tSl = VW('l17', 'slowly') - 0.3, tF = VW('l17', 'faded') - 0.3, tW = VW('l18', 'wax') - 0.3, tN = VW('l18', 'narrowest') - 0.5, u = EZ.io(pu('p14'));
  ctx.save(); cam(lerp(900, 1100, u), 580, 1.02);
  // the cliffs of the strait rising on the horizon, right
  const ck = at(tN, 1.4); ctx.save(); ctx.globalAlpha *= ck; ctx.fillStyle = '#22120c'; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.4;
  for (const [x, d] of [[1640, -1], [1900, 1]]) { ctx.beginPath(); ctx.moveTo(x - 160 * d, SEA + 2); ctx.lineTo(x - 70 * d, SEA - 200 - 40 * ck); ctx.lineTo(x + 10 * d, SEA - 240 - 40 * ck); ctx.lineTo(x + 140 * d, SEA + 2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.restore();
  sea(SEA, { speed: 12 });
  sirenIsle(lerp(80, -260, u), 0.6);
  songStream(-100, 600, 500, 0.6 * (1 - at(tF, 2.5)), 13);
  ship(lerp(700, 1050, u), 800, 520, { behind: (s) => { shipOdy(s, -0.3, 'man_row_b', 140); shipOdy(s, -0.02, 'ody_tied', 210); xf(tW, 0.4, (a) => shipOdy(s, 0.26, 'man_wax', 165, { a }), (a) => shipOdy(s, 0.26, 'sailor0', 160, { a })); } });
  void tSl; ctx.restore();
}

// ---- 9 · SCYLLA AND CHARYBDIS
function p15() {   // the strait no ship had ever crossed whole: two cliffs, a narrow gap; the ship comes on, small; the chapter title
  const t0 = SUB('p15'), tW = VW('l19', 'whole') - 0.3, u = EZ.io(pu('p15'));
  ctx.save(); cam(960, 560, 1.0 + 0.04 * u);
  headland(-1); headland(1);
  sea(SEA, { speed: 12 });
  ship(lerp(-300, 520, u), 790, 300, { behind: (s) => { shipOdy(s, 0.0, 'ody_tied', 110); } });
  letters('IX · SCYLLA AND CHARYBDIS', 960, 300, t0 + 0.4, 74, { step: 0.05 });
  void tW; ctx.restore();
}
function p16() {   // Charybdis: on one side a whirlpool swallows the sea three times a day — three strokes cut — and a ship spins into it
  const tC = VW('l20', 'charybdis') - 0.5, tSw = VW('l20', 'swallowed') - 0.3, tTh = VW('l20', 'three') - 0.3, tE = VW('l20', 'every') - 0.3, tCl = VW('l20', 'close') - 0.3;
  ctx.save(); cam(lerp(1000, 900, at(tE, 2)), 640, 1.05 + 0.1 * at(tE, 2));
  sea(SEA, { speed: 14 });
  const suck = 1 + 1.6 * at(tSw, 0.6);
  whirl(960, SEA + 80, 1300, at(tC, 1.2), suck);
  // a ship drawn in on a spiral and swallowed
  const k = clamp((TT - tE) / 3.0); if (k > 0 && k < 1) { const a = k * TAU * 1.3, r = 560 * (1 - k); clipAbove(SEA + 80 + 30 * (1 - k), () => ship(960 + Math.cos(a) * r, SEA + 90 + Math.sin(a) * r * 0.3 + 120 * EZ.i2(k), 300 * (1 - 0.4 * k), { rot: a * 0.3, a: 1 - 0.2 * k })); }
  tally(3, 1500, 220, tTh, 0.25, { w: 10, len: 80, gap: 36 });
  void tCl; ctx.restore();
}
function p17() {   // Scylla: high on her cliff, six long necks and six heads, each with three rows of teeth; the heads sway and glint
  const tSc = VW('l21', 'scylla') - 0.5, tSi = VW('l21', 'six') - 0.3, tH = VW('l21', 'heads') - 0.3, tT = VW('l21', 'teeth') - 0.4;
  ctx.save(); cam2(lerp(1100, 1250, at(tT, 1.4)), lerp(560, 480, at(tT, 1.4)), 1.0 + 0.3 * at(tT, 1.4));
  sea(SEA, { speed: 14 });
  riseFrom(SEA + 60, rise(tSc, 1.4), (dy) => scyllaCliff(1500, SEA + 60 + dy, 860));
  tally(6, 560, 260, tSi, 0.12, { w: 10, len: 80, gap: 36 });
  void tH; ctx.restore();
}
function p18() {   // Circe's warning (a memory): you cannot fight her, you cannot outrun them both — choose one
  const tCi = VW('l22', 'circe') - 0.4, tF = VW('l22', 'fight') - 0.3, tB = VW('l22', 'both') - 0.3, tC = VW('l22', 'choose') - 0.3;
  ctx.save(); cam(960, 580, 1.04);
  circeHall({ cloths: [1580], fireX: 1820 });
  fig('circe_wand', 1150, FLOOR, 430, { flip: true, rot: 0.01 * Math.sin(TT * 1.3) });
  fig('ody_look', 620, FLOOR, 390);
  roundel(760, 360, 110, at(tB, 0.6), () => { sea(390, { speed: 12 }); whirl(760, 400, 220, 1, 2); });
  roundel(1080, 360, 110, at(tB + 0.3, 0.6), () => { sea(430, { speed: 12 }); bfLay('scylla.webp', 1100, 450, 190); });
  letters('CHOOSE ONE', 905, 600, tC, 48, { step: 0.05 });
  void tCi; void tF; ctx.restore();
  tint('#1a0c10', 0.12, 'multiply');
}
function p19() {   // the price: on a pair of scales the whole ship against six men; the scales tip toward the six
  const tW = VW('l23', 'whole') - 0.3, tSi = VW('l23', 'six') - 0.3, tM = VW('l23', 'men') - 0.3;
  ctx.save(); cam(960, 560, 1.03);
  ground(FLOOR, { key: 's19', bare: 1 });
  const tilt = 0.6 * at(tW, 0.8) - 1.2 * at(tM, 1.0);
  scales(960, 300, tilt, (x, y) => { if (TT > tW - 0.5) whirl(x, y - 6, 220, at(tW - 0.5, 0.5), 1.5); ship(x, y - 2, 240, { a: at(tW - 0.5, 0.5) }); },
    (x, y) => { const n = ['sailor0', 'sailor1', 'sailor2', 'man_walk', 'man_skin', 'man_fear']; n.forEach((m, i) => { const k = at(tSi + i * 0.1, 0.3); if (k > 0) fig(m, x - 100 + i * 40, y + 2, 110 * k, { a: k, still: true, flip: i % 2 === 1 }); }); });
  ctx.restore();
}
function p20() {   // he makes his choice and tells his crew nothing: he stands apart, silent; the rowers row on, unknowing
  const tCh = VW('l24', 'choice') - 0.3, tN = VW('l24', 'nothing') - 0.4;
  ctx.save(); cam(lerp(960, 700, at(tN, 1.8)), 560, 1.04 + 0.1 * at(tN, 1.8));
  deck({ mast: 1500, billow: 0.6 });
  const row = (d) => 0.05 * Math.sin(TT * 2.4 + d);
  fig('man_row_a', 1180, DECK, 250, { rot: row(0) }); fig('man_row_b', 1440, DECK, 270, { rot: row(1.4) });
  fig('ody_arm', 560, DECK, 420, { rot: 0.01 * Math.sin(TT) });
  ctx.restore();
  tint('#1a0c10', 0.25 * at(tN, 0.8), 'multiply');
  void tCh;
}
function p21() {   // armour, two spears, at the bow: helmet in his hand, then on; he takes his stand at the prow
  const tA = VW('l25', 'armour') - 0.3, tSp = VW('l25', 'spears') - 0.3, tBo = VW('l25', 'bow') - 0.3, tP = VW('l25', 'protect') - 0.3, u = EZ.io(pu('p21'));
  ctx.save(); cam(lerp(860, 1100, u), 600, 1.03 + 0.05 * u);
  sea(SEA, { speed: 16 });
  ship(960, 830, 900, { behind: (s) => { shipOdy(s, -0.3, 'sailor2', 230); shipOdy(s, -0.1, 'sailor1', 230); xf(tSp, 0.5, (a) => shipOdy(s, 0.33, 'ody_helmet', 360, { a }), (a) => shipOdy(s, 0.33, 'ody_arm', 360, { a })); } });
  void tA; void tBo; ctx.restore();
}
function p22() {   // they steer for the cliff, staring in terror at the whirlpool: Charybdis left, Scylla's cliff right, the ship between
  const tSt = VW('l26', 'steered') - 0.3, tT = VW('l26', 'terror') - 0.3, u = EZ.io(pu('p22'));
  ctx.save(); cam(lerp(860, 1000, u), 600, 1.03);
  strait({ suck: 2.2, wx: 420, ww: 820 });
  ship(lerp(700, 960, u), 820, 560, { behind: (s) => { shipOdy(s, -0.32, 'man_fear', 180, { dy: 0 }); shipOdy(s, -0.12, 'sailor0', 180); shipOdy(s, 0.08, 'sailor1', 180); shipOdy(s, 0.34, 'ody_arm', 220); } });
  void tSt; void tT; ctx.restore();
}
function p23() {   // then the six heads come down: out of the cliff the necks lunge down over the ship
  const tH = VW('l27', 'heads') - 0.5, tD = VW('l27', 'down') - 0.4;
  ctx.save(); cam(960, 560, 1.04, shake(tD + 0.3, 10), 5);
  sea(SEA, { speed: 14 });
  scyllaCliff(1760, SEA + 60, 760);
  ship(900, 820, 640, { behind: (s) => { shipOdy(s, -0.34, 'man_fear', 200); shipOdy(s, -0.16, 'sailor0', 200); shipOdy(s, 0.02, 'sailor1', 200); shipOdy(s, 0.18, 'sailor2', 200); shipOdy(s, 0.36, 'ody_arm', 240); } });
  // the six necks drop from the top, staggered
  for (let i = 0; i < 6; i++) { const k = EZ.o2(clamp((TT - tH - i * 0.12) / 0.6)); if (k <= 0) continue; const x = 560 + i * 110, len = 520; neck(i, x, PIC0 - 40 + len * k, len); }
  ctx.restore();
  tint('#1a0c10', 0.2 * at(tD, 0.4), 'multiply');
}
function p24() {   // in a single moment six men are lifted into the air, screaming his name, reaching out; he throws his spear, too late
  const tM = VW('l28', 'moment') - 0.4, tL = VW('l28', 'lifted') - 0.4, tSc = VW('l28', 'screaming') - 0.3, tR = VW('l28', 'reaching') - 0.3;
  ctx.save(); cam2(lerp(960, 900, at(tL, 1.5)), lerp(560, 460, at(tL, 1.5)), 1.04);
  sea(SEA, { speed: 14 });
  scyllaCliff(1760, SEA + 60, 760);
  ship(900, 820, 640, { behind: (s) => { shipOdy(s, -0.34, 'man_fear', 200, { a: 1 - at(tL, 0.2) }); xf(tSc, 0.4, (a) => shipOdy(s, 0.36, 'ody_arm', 240, { a }), (a) => shipOdy(s, 0.36, 'ody_throw', 240, { a })); } });
  // the necks rise again, each with a man in its jaws
  for (let i = 0; i < 6; i++) { const k = EZ.io(clamp((TT - tL - i * 0.1) / 1.6)), x = 560 + i * 110 + 10 * Math.sin(TT * 2 + i), len = 520; neck(i, x, PIC0 - 40 + len * (1 - 0.42 * k) + 8 * Math.sin(TT * 3 + i), len); }
  // the spear flies up, and misses
  const sk = clamp((TT - tSc - 0.4) / 0.8); if (sk > 0 && sk < 1) { ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 6; ctx.translate(lerp(1170, 900, sk), lerp(420, 120, sk)); ctx.rotate(-2.3); ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(90, 0); ctx.stroke(); ctx.restore(); }
  void tM; void tR; ctx.restore();
}
function p25() {   // he could not save a single one: alone with his grief, the dark closing in
  const tS = VW('l29', 'save') - 0.3, tO = VW('l29', 'one') - 0.3;
  ctx.save(); cam(960, 600, 1.05 + 0.08 * EZ.io(pu('p25')));
  deck({ mast: 1500, torn: false, billow: 0.2 });
  fig('ody_grief', 800, DECK, 440);
  ctx.restore();
  tint('#1a0c10', 0.35 * at(tS, 1.2), 'multiply');
  void tO;
}
function p26() {   // the ship shoots out of the strait; the crew row on in silence
  const tSh = VW('l30', 'shot') - 0.4, tSi = VW('l30', 'silence') - 0.4, u = EZ.io(pu('p26'));
  ctx.save(); cam(lerp(900, 1120, u), 580, 1.02);
  headland(-1);
  sea(SEA, { speed: lerp(30, 6, at(tSi, 1.5)) });
  const k = EZ.o2(clamp((TT - tSh) / 2.2));
  ship(lerp(500, 1500, k), 800, 500, { behind: (s) => { shipOdy(s, -0.3, 'man_row_b', 140); shipOdy(s, -0.1, 'man_row_a', 140); shipOdy(s, 0.32, 'ody_grief', 200); } });
  ctx.restore();
}
function p27() {   // of everything he suffered, the most pitiful: at the stern he looks back at the cliff falling away, the heads small in the mist
  const tP = VW('l31', 'pitiful') - 0.4, u = EZ.io(pu('p27'));
  ctx.save(); cam(lerp(1000, 860, u), 600, 1.04 + 0.05 * u);
  scyllaCliff(230, SEA + 30, 760, { a: 0.9, flip: true });
  sea(SEA, { speed: 6 });
  ship(1100, 820, 720, { flip: false, behind: (s) => { shipOdy(s, -0.36, 'ody_grief', 270); shipOdy(s, 0.0, 'man_row_a', 170); shipOdy(s, 0.2, 'man_row_b', 170); } });
  ctx.restore();
  tint('#1a0c10', 0.25 * at(tP, 1.0), 'multiply');
}

// ---- 10 · THE CATTLE OF THE SUN
function p28() {   // an island ahead, green and quiet; cattle lowing on it under the black sun; the chapter title
  const t0 = SUB('p28'), tI = VW('l32', 'island') - 0.4, tC = VW('l32', 'cattle') - 0.4, tLo = VW('l32', 'lowing') - 0.3, u = EZ.io(pu('p28'));
  ctx.save(); cam(960, 560, 1.02 + 0.04 * u);
  blackSun(1790, 250, 40, at(tI, 1.2));
  sea(SEA, { speed: 10 });
  sunIsle(1300, 1100, 1);
  [[1080, 0, 'cow', false], [1300, 0.3, 'bull', true], [1520, 0.6, 'cow', true]].forEach(([x, d, n, f], i) => riseFrom(SEA - 66, rise(tC + d, 0.8), (dy) => fig(n, x, SEA - 66 + dy, n === 'cow' ? 110 : 120, { flip: f, rot: 0.01 * Math.sin(TT * 1.2 + i) })));
  if (TT > tLo) for (let i = 0; i < 2; i++) moo1(1080 + i * 440, SEA - 190, 0.8, i);
  ship(lerp(200, 520, u), 810, 380, { behind: (s) => { shipOdy(s, -0.3, 'ody_look', 160); shipOdy(s, 0.1, 'man_row_a', 110); } });
  letters('X · THE CATTLE OF THE SUN', 760, 300, t0 + 0.4, 66, { step: 0.05 });
  ctx.restore();
}
function p29() {   // he remembers the prophecy: Tiresias in a roundel; "we're not landing" — he points them straight past
  const tR = VW('l33', 'remembered') - 0.4, tP = VW('l33', 'prophecy') - 0.4, tPa = VW('l33', 'past') - 0.4;
  ctx.save(); cam(960, 580, 1.04);
  deck({ mast: 1600, billow: 0.5 });
  fig('man_row_b', 1300, DECK, 260, { rot: 0.05 * Math.sin(TT * 2.4) });
  fig('ody_look', 640, DECK, 400);
  roundel(860, 330, 150, at(tP, 0.6), () => { ground(440, { key: 'r29', bare: 1 }); ghost('tiresias', 860, 440, 250, { flip: true, solid: 1 }); });
  void tR; void tPa; ctx.restore();
}
function p30() {   // his men are worn out: slumped on the benches; Eurylochus stands up
  const tW = VW('l34', 'worn') - 0.3, tE = VW('l35', 'eurylochus') - 0.4, tT = VW('l35', 'thinking') - 0.3;
  ctx.save(); cam(960, 580, 1.04);
  deck({ mast: 1700, billow: 0.3 });
  fig('man_sleep', 1180, DECK, 110);
  fig('man_fear', 880, DECK, 320, { rot: 0.04 });
  fig('man_row_a', 1520, DECK, 240, { rot: 0.08 });
  xf(tE, 0.5, (a) => fig('eury_wary', 560, DECK, 350, { a }), (a) => fig('eury_speak', 560, DECK, 370, { a }));
  fig('ody_look', 200, DECK, 390);
  void tW; void tT; ctx.restore();
}
function p31() {   // "you're made of iron, Odysseus, and we aren't — let us sleep one night on dry land"
  const tI = VW('l36', 'iron') - 0.4, tS = VW('l36', 'sleep') - 0.3, tL = VW('l36', 'land') - 0.4;
  ctx.save(); cam(lerp(960, 900, at(tI, 1.4)), 560, 1.06);
  deck({ mast: 1700, billow: 0.3 });
  fig('man_sleep', 1350, DECK, 110);
  fig('eury_speak', 980, DECK, 380, { flip: true, rot: 0.02 * Math.sin(TT * 2) });
  fig('ody_look', 560, DECK, 400);
  // iron: a cold sheen runs down him
  const k = at(tI, 0.3) * (1 - at(tI + 1.0, 0.5)); glow(560, DECK - 260, 180, 'rgba(255,240,220,A)', 0.5 * k, 'lighter');
  void tS; ctx.restore();
}
function p32() {   // he gives in, but every man swears an oath not to touch the cattle; the cattle graze behind them
  const tG = VW('l37', 'gave') - 0.4, tSw = VW('l37', 'swear') - 0.4, tO = VW('l37', 'oath') - 0.3, tC = VW('l37', 'cattle') - 0.4;
  ctx.save(); cam(960, 580, 1.03);
  beach({ seaX: -1600, x1: W + 1600 });
  ctx.save(); ctx.fillStyle = '#22120c'; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1150, FLOOR - 220); ctx.bezierCurveTo(1300, FLOOR - 260, 1700, FLOOR - 260, 1950, FLOOR - 220); ctx.lineTo(1950, FLOOR - 200); ctx.lineTo(1150, FLOOR - 200); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  fig('cow', 1650, FLOOR - 212, 110, { flip: true, rot: 0.01 * Math.sin(TT) }); fig('bull', 1400, FLOOR - 214, 120);
  fig('ody_shout', 300, FLOOR, 390);
  const up = (d) => -0.04 * at(tSw + d, 0.3);
  xf(tSw, 0.4, (a) => fig('man_walk', 620, FLOOR, 350, { a, flip: true }), (a) => fig('man_oath', 620, FLOOR, 360, { a, rot: up(0) }));
  fig('eury_wary', 820, FLOOR, 360, { flip: true, rot: up(0.2) });
  fig('man_skin', 1010, FLOOR, 350, { flip: true, rot: up(0.4) });
  void tG; void tO; void tC; ctx.restore();
}
function p33() {   // that night a storm; then the wind settles in the south, the one wind that can't take them home; it blows for a month (30 strokes)
  const tN = VW('l38', 'night') - 0.4, tSt = VW('l38', 'storm') - 0.3, tSo = VW('l38', 'south') - 0.4, tM = VW('l39', 'month') - 0.6;
  const nk = at(tN, 0.8) * (1 - at(tSo, 1.4));
  ctx.save(); cam(960, 580, 1.03);
  beach({ x1: 900, seaX: 880 });
  ship(1480, 790, 520, { rot: 0.04 * Math.sin(TT * 3) * at(tSt, 0.5), a: 1 });
  fig('man_sleep', 500, FLOOR, 110); fig('man_sleep', 260, FLOOR + 4, 100, { flip: true });
  rain(at(tSt, 0.6) * (1 - at(tSo, 1)));
  const b1 = bolt(tSt + 0.3, 1200, 0.4) + bolt(tSt + 1.4, 700, 0.35);
  gust(1900, 500, 1300, Math.PI + 0.12, at(tSo, 0.8), 33, { n: 5 });
  tally(30, 520, 200, tM, 0.05, { w: 6, len: 46, gap: 26 });
  ctx.restore();
  night(nk, 1600, 220);
  if (b1 > 0) tint('#fff0d0', 0.3 * b1);
}
function p34() {   // they ate everything; they fished, they hunted birds, and they starved anyway
  const tA = VW('l40', 'ate') - 0.3, tF = VW('l40', 'fished') - 0.3, tB = VW('l40', 'birds') - 0.4, tS = VW('l40', 'starved') - 0.4;
  ctx.save(); cam(960, 580, 1.03);
  beach({ x1: 1100, seaX: 1080 });
  // empty jars tipped over
  fig('man_fish', 920, FLOOR, 300, { rot: 0.01 * Math.sin(TT * 1.5) });
  fig('man_resist', 560, FLOOR, 330, { rot: 0.02 * Math.sin(TT * 2) });
  birds(5, 260, 40, 34);
  fig('man_beg', 200, FLOOR, 320, { rot: 0.06 * at(tS, 0.8) });
  ctx.restore();
  tint('#1a0c10', 0.2 * at(tS, 1), 'multiply');
  void tA; void tF;
}
function p35() {   // one day, while Odysseus is off alone praying up on the hill, Eurylochus makes a speech to the men below
  const tP = VW('l41', 'praying') - 0.4, tSp = VW('l41', 'speech') - 0.4, u = EZ.io(pu('p35'));
  ctx.save(); cam(lerp(700, 1100, at(tSp - 0.6, 1.6)), 580, 1.03);
  mountain({ noCave: true });
  fig('ody_kneel', 1500, SLOPE(1500) + 8, 260, { flip: false });
  fig('eury_speak', 520, SLOPE(520) + 10, 360, { flip: true });
  fig('man_skin', 260, SLOPE(260) + 10, 330); fig('man_fear', 100, SLOPE(100) + 10, 330);
  void tP; void u; ctx.restore();
}
function p36() {   // "every death is terrible, starving the worst; kill the best of the cattle, give some to the gods; if the Sun is angry I'd rather drown in one gulp"
  const tSt = VW('l42', 'starving') - 0.3, tK = VW('l43', 'kill') - 0.4, tG = VW('l43', 'gods') - 0.4, tSu = VW('l44', 'sun') - 0.4, tD = VW('l44', 'drown') - 0.4, tGu = VW('l44', 'gulp') - 0.3;
  ctx.save(); cam(lerp(900, 1100, at(tK, 1.8)), 580, 1.04);
  ground(FLOOR, { key: 'p36' });
  const cw = walk(1700, 1500, tK, 2, 4, 4); fig('cow', cw.x, FLOOR + cw.dy, 230, { rot: cw.rot });
  fig('eury_speak', 620, FLOOR, 380, { flip: false, rot: 0.02 * Math.sin(TT * 2) });
  const turn = at(tK + 0.4, 0.5);
  fig('man_skin', 360, FLOOR, 340, { flip: turn < 0.5 }); fig('man_walk', 150, FLOOR, 340, { flip: turn < 0.5 });
  fig('man_oath', 900, FLOOR, 350, { flip: false });
  roundel(1080, 320, 140, at(tD, 0.6), () => { sea(330, { speed: 20 }); clipAbove(352, () => fig('man_swim', 1080 + 10 * Math.sin(TT * 2), 410 + 120 * EZ.i2(clamp((TT - tGu - 1.0) / 1.2)), 150, { rot: 0.06 * Math.sin(TT * 3) })); });
  blackSun(1600, 230, 40, at(tSu, 0.6) * (1 - at(tD, 0.6)));
  void tSt; void tG; ctx.restore();
}
function p37() {   // when Odysseus comes back he smells the roasting meat from far off: the fire and spits; he stops; the prophecy flashes back
  const t0 = SUB('p37'), tB = VW('l45', 'back') - 0.4, tSm = VW('l45', 'smell') - 0.4, tR = VW('l45', 'roasting') - 0.3, tOff = VW('l45', 'off') - 0.2, tFl = LE('l45') + 0.2;
  ctx.save(); cam(lerp(960, 760, at(tFl, 1.2)), 560, 1.03 + 0.08 * at(tFl, 1.2));
  ground(FLOOR, { key: 'p37' });
  spitFire(1320, 1, 0, 37);
  fig('man_spit', 1100, FLOOR, 220);
  fig('man_walk', 1650, FLOOR, 340, { flip: true });
  const w = walk(-200, 420, tB, 2.2, 6, 7); fig('ody_look', w.x, FLOOR + w.dy, 390, { rot: w.rot });
  // the smoke drifts left to him
  if (TT > tSm) songStream(1250, 500, 400, 0.6 * at(tSm, 0.6), 37);
  // the beat: the prophecy's panel returns — the island of the Sun, its cattle, the black sun, lit
  roundel(860, 330, 190, at(tFl, 0.5), () => { sea(400, { speed: 10 }); blackSun(860, 230, 32, 1); ctx.save(); ctx.fillStyle = '#100a0a'; ctx.beginPath(); ctx.moveTo(700, 404); ctx.bezierCurveTo(780, 350, 940, 350, 1020, 404); ctx.closePath(); ctx.fill(); ctx.restore(); [[800, 'bull'], [910, 'cow']].forEach(([x, n]) => fig(n, x, 372, 50, { still: true })); glow(860, 330, 200, 'rgba(255,236,200,A)', 0.35 * at(tFl, 0.6), 'lighter'); });
  void t0; void tR; void tOff; ctx.restore();
}
function p38() {   // the strangest scene: the hides crawl over the ground, the meat on the spits moos; the men shrink back
  const tS = VW('l46', 'strangest') - 0.3, tH = VW('l47', 'hides') - 0.4, tC = VW('l47', 'crawled') - 0.4, tM = VW('l47', 'mooed') - 0.4;
  ctx.save(); cam(960, 600, 1.04, shake(tM, 4), 8);
  ground(FLOOR, { key: 'p38' });
  spitFire(1450, 1, at(tM, 0.3), 38);
  [[0, 300, 0], [0.5, 760, 1]].forEach(([d, x0, i]) => { const k = clamp((TT - tC - d) / 5); const x = lerp(x0, x0 + 360, k); fig('hide', x, FLOOR + 4, 120, { sy: 1 + 0.08 * Math.sin(TT * 6 + i), sx: 1 + 0.05 * Math.sin(TT * 6 + i + 1.5), rot: 0.02 * Math.sin(TT * 3 + i), still: true }); });
  fig('man_fear', 1150, FLOOR, 340, { flip: false, tr: 0 });
  fig('man_resist', 1800, FLOOR, 330, { flip: true });
  ctx.restore();
  tint('#1a0c10', 0.3 * at(tS, 1), 'multiply');
  void tH;
}
function p39() {   // the Sun goes to Zeus: on Olympus Helios points down at them; "or I'll go down and shine among the dead" — a dark roundel lights
  const tSu = VW('l48', 'sun') - 0.4, tZ = VW('l48', 'zeus') - 0.4, tP = VW('l48', 'punish') - 0.3, tD = VW('l49', 'dead') - 0.4, tSh = VW('l49', 'shine') - 0.3;
  ctx.save(); cam(960, 560, 1.03);
  clouds(700);
  fig('helios', 640, 720, 420, { rot: 0.02 * at(tP, 0.3) });
  glow(640, 340, 200, 'rgba(255,236,200,A)', 0.25, 'lighter');
  fig('zeus', 1300, 720, 440, { flip: false, a: at(tZ, 0.6) });
  roundel(960, 330, 150, at(tD, 0.6), () => { tint('#2a1016', 0.6, 'multiply'); ground(420, { key: 'r39', bare: 1 }); ghost('shade', 900, 420, 130, {}); ghost('shade', 1020, 420, 120, { flip: true }); blackSun(960, 280, 24, 1); glow(960, 280, 120, 'rgba(255,236,200,A)', 0.5 * at(tSh, 0.6), 'lighter'); });
  void tSu; ctx.restore();
}
function p40() {   // the wind changes; they sail; the island drops behind; Zeus throws his thunderbolt from the clouds
  const tCh = VW('l50', 'changed') - 0.4, tSa = VW('l50', 'sailed') - 0.4, tDr = VW('l50', 'dropped') - 0.4, tT = VW('l50', 'thunderbolt') - 0.3, u = EZ.io(pu('p40'));
  ctx.save(); cam(960, 580, 1.02);
  sea(SEA, { speed: 16 });
  sunIsle(lerp(400, -500, at(tDr, 2.5)), 900, 1);
  const zk = at(tT - 1.6, 1.0);
  ctx.save(); ctx.globalAlpha *= zk; fig('zeus', 1320, 380, 280, {}); clouds(350); ctx.restore();
  ship(lerp(800, 1150, u), 800, 500, { behind: (s) => { shipOdy(s, -0.3, 'helmsman', 170); shipOdy(s, 0.0, 'man_row_a', 120); shipOdy(s, 0.25, 'ody_look', 170); } });
  const b = bolt(tT + 0.2, 1240, 0.9);
  void tCh; void tSa; ctx.restore();
  if (b > 0) tint('#fff0d0', 0.4 * b);
}
function p41() {   // the mast comes down and crushes the helmsman's skull (deck card)
  const tM = VW('l51', 'mast') - 0.3, tC = VW('l51', 'crushed') - 0.3, tS = VW('l51', 'skull') - 0.2;
  ctx.save(); cam(960, 580, 1.04, shake(tC, 12), 41);
  // the mast falling: a deck without the standing mast; the mast is drawn falling, from upright to across the helmsman
  deck({ mast: -2000, noOar: true });
  const k = EZ.i2(clamp((TT - tM) / (tC - tM + 0.1)));
  xf(tC, 0.2, (a) => fig('helmsman', 760, DECK, 380, { a }), (a) => fig('man_dead', 760, DECK + 6, 120, { a, still: true }));
  ctx.save(); ctx.translate(1400, DECK); ctx.rotate(-k * 1.25); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.2; ctx.fillRect(-16, -760, 32, 760); ctx.strokeRect(-16, -760, 32, 760); ctx.fillRect(-200, -620, 400, 14); ctx.restore();
  smoke(1100, 600, 0.8, at(tC, 0.6), 41);
  ctx.restore();
  void tS;
}
function p42() {   // smoke and sulphur fill the ship; the men are thrown into the water
  const tSm = VW('l52', 'smoke') - 0.4, tTh = VW('l52', 'thrown') - 0.4, tW = VW('l52', 'water') - 0.3;
  ctx.save(); cam(960, 580, 1.03);
  sea(SEA, { speed: 20 });
  ship(900, 810, 700, { rot: -0.08 * at(tTh, 1), behind: (s) => { shipOdy(s, 0.3, 'ody_look', 220); } });
  smoke(900, 560, 1.4, at(tSm, 0.8), 42); smoke(1100, 560, 1.1, at(tSm + 0.3, 0.8), 43);
  thrown('sailor0', 700, 640, 300, tTh, 160, 1); thrown('sailor1', 820, 640, 1500, tTh + 0.3, 160, 2); thrown('man_fear', 980, 640, 1700, tTh + 0.6, 160, 3); thrown('man_skin', 620, 640, 150, tTh + 0.8, 160, 4);
  void tW; ctx.restore();
}
function p43() {   // the waves carry them round the wreck like seabirds, then they go under; "All of them."
  const tW = VW('l53', 'waves') - 0.4, tS = VW('l53', 'seabirds') - 0.3, tU = VW('l53', 'under') - 0.4, tA = VW('l54', 'all') - 0.3;
  ctx.save(); cam(960, 600, 1.04 + 0.06 * at(tA, 1.2));
  sea(SEA, { speed: 10 });
  brokenShip(960, 790, 620, 0.3 + 0.45 * at(tU, 3), 43);
  for (let i = 0; i < 6; i++) { const a = TT * 0.35 + i * TAU / 6; bobber(960 + Math.cos(a) * 560, tW - 0.5 + i * 0.1, tU + i * 0.35, i, 110); }
  birds(3, 300, 30, 43);
  ctx.restore();
  tint('#1a0c10', 0.35 * at(tA, 0.8), 'multiply');
}
function p44() {   // he lashes the mast to the keel and holds on; all night the current drags him back the way he came (to the left)
  const tL = VW('l55', 'lashed') - 0.4, tN = VW('l55', 'night') - 0.4, tB = VW('l55', 'back') - 0.4, u = EZ.io(pu('p44'));
  ctx.save(); cam(960, 600, 1.04);
  sea(SEA, { speed: -20 });
  const x = lerp(1300, 600, EZ.io(clamp((TT - tN) / 5)));
  clipAbove(SEA + 30, () => fig('ody_raft', x, SEA + 40 + 6 * Math.sin(TT * 2), 140, { flip: true, rot: 0.03 * Math.sin(TT * 1.4) }));
  route([[1700, 640], [1300, 600], [900, 640], [500, 600]], EZ.io(clamp((TT - tB) / 2.4)));
  ctx.restore();
  night(at(tN, 1.0), 1500, 220);
  void tL; void u;
}
function p45() {   // back to the strait, back to Charybdis: the cliffs again, the whirlpool opening under him
  const tS = VW('l56', 'strait') - 0.4, tC = VW('l56', 'charybdis') - 0.5, u = EZ.io(pu('p45'));
  ctx.save(); cam(lerp(1000, 760, u), 600, 1.04 + 0.08 * u);
  strait({ wx: 700, ww: 900, whirl: at(tC, 1), suck: 2 });
  clipAbove(SEA + 30, () => fig('ody_raft', lerp(1300, 1000, u), SEA + 40 + 6 * Math.sin(TT * 2), 140, { flip: true, rot: 0.04 * Math.sin(TT * 1.6) }));
  void tS; ctx.restore();
  night(0.4 * (1 - u), 1500, 220);
}
function p46() {   // the whirlpool sucks the raft down; he leaps and grabs the fig tree on the cliff; he hangs there like a bat all day
  const tSu = VW('l57', 'sucked') - 0.4, tJ = VW('l57', 'jumped') - 0.3, tG = VW('l57', 'grabbed') - 0.3, tB = VW('l58', 'bat') - 0.4, tD = VW('l58', 'day') - 0.4, tSp = VW('l58', 'spit') - 0.4;
  ctx.save(); cam(lerp(960, 1060, at(tB, 2)), 520, 1.03);
  // the sun crossing the sky all day
  const sk = clamp((TT - tD) / 4); if (TT > tD - 0.5) blackSun(lerp(250, 1000, sk), 240 - 60 * Math.sin(Math.PI * sk), 34, at(tD - 0.5, 0.6));
  // the cliff and the fig tree growing out of it, over the whirlpool
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(1500, PIC0 - 10); ctx.lineTo(1480, 300); ctx.lineTo(1540, 420); ctx.lineTo(1500, 560); ctx.lineTo(1560, SEA + 60); ctx.lineTo(W + 400, SEA + 60); ctx.lineTo(W + 400, PIC0 - 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  bfLay('figtree.webp', 1440, 400, 420, { flip: true, rot: 0.01 * Math.sin(TT * 0.8) });
  sea(SEA, { speed: 14 });
  whirl(900, SEA + 70, 1000, 1, 2.2);
  // the raft spins down into it
  const rk = clamp((TT - tSu) / 2.0); if (rk < 1) clipAbove(SEA + 40, () => fig('ody_raft', lerp(1100, 900, rk), SEA + 40 + 150 * EZ.i2(rk), 140 * (1 - 0.3 * rk), { rot: rk * 3, a: TT < tJ ? 1 : 0, flip: true }));
  // the leap: from the raft up to the branch, then hanging, swaying
  const jk = EZ.o2(clamp((TT - tJ) / 0.7));
  if (TT > tJ) { const hx = 1280, hy = 330; fig('ody_hang', lerp(1060, hx, jk), lerp(SEA + 140, hy + 300, jk), 300, { ay: 1, rot: 0.04 * Math.sin(TT * 1.3) * at(tG, 0.4), still: true }); }
  void tSp; ctx.restore();
}
function p47() {   // eventually the sea spits the wood back up; he drops onto it and paddles away with his hands
  const tE = VW('l59', 'eventually') - 0.3, tDr = VW('l59', 'dropped') - 0.4, tP = VW('l59', 'paddled') - 0.4, u = EZ.io(pu('p47'));
  ctx.save(); cam(lerp(900, 1100, u), 560, 1.03);
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(1500, PIC0 - 10); ctx.lineTo(1480, 300); ctx.lineTo(1540, 420); ctx.lineTo(1500, 560); ctx.lineTo(1560, SEA + 60); ctx.lineTo(W + 400, SEA + 60); ctx.lineTo(W + 400, PIC0 - 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  bfLay('figtree.webp', 1440, 400, 420, { flip: true, rot: 0.01 * Math.sin(TT * 0.8) });
  sea(SEA, { speed: 10 });
  whirl(900, SEA + 70, 1000, 1 - at(tP, 1.5), 1.2);
  // the wood (the mast and keel) comes back up
  const up = at(tE + 0.3, 0.8);
  const fall = EZ.i2(clamp((TT - tDr) / 0.6));
  if (TT < tDr + 0.6) fig('ody_hang', 1280, lerp(630, 760, fall), 300, { still: true, a: 1 - at(tDr + 0.5, 0.15) });
  const px = lerp(1000, 2300, EZ.io(clamp((TT - tP) / 4)));
  clipAbove(SEA + 40, () => { if (TT < tDr + 0.5) { ctx.save(); ctx.translate(1050, SEA + 40 + 120 * (1 - up)); ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.fillRect(-260, -16, 520, 24); ctx.strokeRect(-260, -16, 520, 24); ctx.restore(); } else fig('ody_raft', px, SEA + 40 + 6 * Math.sin(TT * 2), 140, { rot: 0.03 * Math.sin(TT * 1.4) }); });
  ctx.restore();
}
function p48() {   // he drifts for nine days: alone on the open sea, nine strokes cut; then the tally of men — 600, struck out, 1
  const tD = VW('l60', 'drifted') - 0.4, tN = VW('l60', 'nine') - 0.3, tE = LE('l60') + 0.6, u = EZ.io(pu('p48'));
  ctx.save(); cam(960, 580, 1.02);
  sea(SEA, { speed: 8 });
  clipAbove(SEA + 40, () => fig('ody_raft', lerp(300, 1100, u), SEA + 40 + 6 * Math.sin(TT * 2), 140, { rot: 0.03 * Math.sin(TT * 1.4) }));
  tally(9, 300, 200, tN, 0.18, { w: 9, len: 70, gap: 34 });
  // the tally of men: 600 struck out, then 1
  letters('DC', 1250, 340, tE, 110, { step: 0.1, a: 1 - 0.6 * at(tE + 1.4, 0.5) });
  const sk = at(tE + 0.9, 0.4); if (sk > 0) { ctx.save(); ctx.strokeStyle = FIRE_COL; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1150, 300); ctx.lineTo(lerp(1150, 1350, sk), lerp(300, 320, sk)); ctx.stroke(); ctx.restore(); }
  letters('I', 1500, 340, tE + 1.6, 130, { step: 0.1 });
  void tD; ctx.restore();
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
const FULL_SET = new Set(['p04', 'p05', 'p06', 'p11', 'p12', 'p13', 'p18', 'p20', 'p25', 'p29', 'p30', 'p31', 'p39', 'p41']);   // panels that fill the picture with a set (Circe's hall, the deck, the underworld): they slide in as cards
const FG_SET = new Set(['circe_house.webp', 'coast.webp', 'ship_beached', 'scylla.webp', 'charybdis.webp', 'figtree.webp', 'bones.webp', 'troy_walls.webp']), JUNK = document.createElement('canvas'); JUNK.width = JUNK.height = 2;
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
const BOARD_AT = { p01: ['l01', 'next'], p02: ['l02', 'sang'], p03: ['l03', 'bones'], p04: ['l04', 'wax'], p05: ['l05', 'hear'], p06: ['l06', 'tighter'], p07: ['l07', 'song'], p08: ['l09', 'odysseus'], p09: ['l10', 'earth'], p10: ['l11', 'knowing'], p11: ['l13', 'everything'], p12: ['l15', 'skin'], p13: ['l16', 'tighter'], p14: ['l18', 'narrowest'], p15: ['l19', 'whole'], p16: ['l20', 'close'], p17: ['l21', 'teeth'], p18: ['l22', 'choose'], p19: ['l23', 'men'], p20: ['l24', 'nothing'], p21: ['l25', 'protect'], p22: ['l26', 'whirlpool'], p23: ['l27', 'down'], p24: ['l28', 'reaching'], p25: ['l29', 'one'], p26: ['l30', 'silence'], p27: ['l31', 'pitiful'], p28: ['l32', 'lowing'], p29: ['l33', 'past'], p30: ['l35', 'thinking'], p31: ['l36', 'land'], p32: ['l37', 'cattle'], p33: ['l39', 'month'], p34: ['l40', 'anyway'], p35: ['l41', 'speech'], p36: ['l44', 'gulp'], p37: ['l45', 'off'], p38: ['l47', 'mooed'], p39: ['l49', 'instead'], p40: ['l50', 'thunderbolt'], p41: ['l51', 'skull'], p42: ['l52', 'water'], p43: ['l54', 'all'], p44: ['l55', 'come'], p45: ['l56', 'charybdis'], p46: ['l58', 'wood'], p47: ['l59', 'hands'], p48: ['l60', 'days'] };
TIMELINE.board = IDS.map((id, i) => { const [l, w, n] = BOARD_AT[id]; const t = id === 'p48' ? DURATION - 1.2 : id === 'p37' ? SUBEND(id) - 0.5 : Math.min(VW(l, w, n) + 0.6, SUBEND(id) - 0.6); return { t: Math.round(t * FPS) / FPS, title: id, sound: '', next: '' }; });
