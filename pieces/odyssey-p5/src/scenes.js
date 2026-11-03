// =====================================================================
//  SCENES — Odyssey p5: Calypso, the Phaeacians (amphora-bf, Flow layers, 16:9). The ground and its friezes (assets/bg.jpg) are fixed on screen;
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
//  the panels (panel coords = screen coords)
// =====================================================================
// ---- 11 · CALYPSO
function p01() {   // continuing from part 4's drift: on the tenth night the sea throws him up on an island; the chapter title
  const t0 = SUB('p01'), tT = VW('l01', 'tenth') - 0.4, tTh = VW('l01', 'threw') - 0.3, tC = VW('l01', 'calypso') - 0.4, u = EZ.io(pu('p01'));
  ctx.save(); cam(lerp(900, 1060, u), 580, 1.02 + 0.03 * u);
  tally(10, 720, 360, tT, 0.08, { w: 8, len: 60, gap: 30 });
  shoreL({ x0: 1150, key: 'p1' });
  tree(1700, FLOOR + 6, 520, { key: 'p1t' }); tree(1500, FLOOR + 6, 380, { key: 'p1u' });
  // the raft carried in on a big swell and thrown up on the sand
  const k = EZ.io(clamp((TT - tTh + 0.6) / 1.6)), rx = lerp(300, 1250, k), ry = lerp(SEA + 40, FLOOR + 4, EZ.i2(k)) - Math.sin(Math.PI * k) * 120;
  clipAbove(k < 0.6 ? SEA + 30 : PIC1, () => fig('ody_raft', rx, ry + (k < 1 ? 6 * Math.sin(TT * 2) : 0), 140, { rot: 0.03 * Math.sin(TT * 1.4) + 0.25 * Math.sin(Math.PI * k) }));
  if (TT > tTh + 0.9) splash(1150, SEA + 8, tTh + 0.9, 0.6, 1);
  letters('XI · CALYPSO', 860, 300, t0 + 0.4, 96, { step: 0.06 });
  void tC; ctx.restore();
  night(0.8 * (1 - at(SUBEND('p01') - 1.2, 1.0)), 1500, 220);
}
function p02() {   // Calypso: a nymph, a goddess, beautiful, alone in a cave hung with vines, springs all round
  const tN = VW('l02', 'nymph') - 0.4, tB = VW('l02', 'beautiful') - 0.3, tC = VW('l02', 'cave') - 0.4, tV = VW('l02', 'vines') - 0.3, tS = VW('l02', 'springs') - 0.3, u = EZ.io(pu('p02'));
  ctx.save(); cam(lerp(1020, 900, u), 580, 1.04 + 0.04 * u);
  ground(FLOOR, { key: 'p2' });
  tree(160, FLOOR + 6, 480, { key: 'p2a' }); tree(1820, FLOOR + 6, 540, { key: 'p2b' });
  cave5(1000, FLOOR + 30, 640);
  const w = walk(1000, 700, tN, 2.4, 3.5, 4); fig('calypso_stand', w.x, FLOOR + w.dy, 440, { rot: w.rot, a: at(tN - 0.3, 0.5) });
  const [hx, hy] = ptf('calypso_stand', w.x, FLOOR, 440, 0.62, 0.06); sparks(hx, hy, at(tB, 0.4) * (1 - at(tB + 1.6, 0.6)), 2, 40);
  void tC; void tV; void tS; ctx.restore();
}
function p03() {   // she saved his life, fed him, fell in love with him: he lies on the sand; she kneels... offers the cup; a warm glow
  const tSa = VW('l03', 'saved') - 0.4, tF = VW('l03', 'fed') - 0.3, tL = VW('l03', 'love') - 0.3;
  ctx.save(); cam(960, 600, 1.05 + 0.05 * at(tL, 1.2));
  sea(SEA, { speed: 8, x0: 1380 });
  ground(FLOOR, { key: 'p3', x1: 1400, sand: 1, slope: 0 });
  xf(tF - 0.2, 0.5, (a) => fig('ody_lie', 640, FLOOR + 4, 170, { a, still: true }), (a) => fig('ody_sleep', 640, FLOOR, 300, { a }));
  xf(tF, 0.5, (a) => fig('calypso_stand', 1000, FLOOR, 440, { a, flip: true }), (a) => fig('calypso_offer', 940, FLOOR, 440, { a, flip: true }));
  glow(800, 560, 320, 'rgba(255,226,190,A)', 0.4 * at(tL, 0.8), 'lighter');
  void tSa; ctx.restore();
}
function p04() {   // and she wouldn't let him leave: she stands between him and the sea; the dark closes in
  const tW = VW('l04', "wouldn't") - 0.3, tL = VW('l04', 'leave') - 0.3;
  ctx.save(); cam(lerp(960, 1080, at(tW, 1.8)), 600, 1.04);
  sea(SEA, { speed: 8, x0: 1180 });
  ground(FLOOR, { key: 'p4', x1: 1200, sand: 1, slope: 0 });
  cave5(380, FLOOR + 30, 560);
  fig('ody_look', 1500, FLOOR, 390, {});
  fig('calypso_stand', 1060, FLOOR, 440, { flip: false, rot: -0.02 * at(tW, 0.4) });
  ctx.restore();
  tint('#1a0c10', 0.28 * at(tL, 1.0), 'multiply');
}
function p05() {   // seven years: the sun crosses again and again over the island; seven strokes cut
  const tSe = VW('l05', 'seven') - 0.3, tY = VW('l05', 'years') - 0.3, u = EZ.io(pu('p05'));
  ctx.save(); cam(960, 580, 1.02);
  // the sun wheeling over the sky, faster and faster
  const ph = mod((TT - SUB('p05')) * (0.35 + 0.5 * at(tSe, 1)), 1); blackSun(lerp(-100, W + 100, ph), 300 - 180 * Math.sin(Math.PI * ph), 34, 1);
  sea(SEA, { speed: 10, x0: 1180 });
  ground(FLOOR, { key: 'p5', x1: 1200, sand: 1, slope: 0 });
  cave5(420, FLOOR + 30, 520);
  fig('ody_weep', 1420, FLOOR, 300);
  tally(7, 760, 200, tSe, 0.3, { w: 10, len: 80, gap: 40 });
  void tY; void u; ctx.restore();
}
function p06() {   // she offers him everything: "stay with me and I'll make you immortal" — the cup of ambrosia glows
  const tO = VW('l06', 'offered') - 0.4, tE = VW('l06', 'everything') - 0.3, tSt = VW('l07', 'stay') - 0.3, tI = VW('l07', 'immortal') - 0.4;
  ctx.save(); cam(lerp(960, 900, at(tI, 1.6)), 580, 1.04 + 0.08 * at(tI, 1.6));
  ground(FLOOR, { key: 'p6' });
  cave5(1640, FLOOR + 30, 560);
  fig('ody_look', 620, FLOOR, 400);
  fig('calypso_offer', 1060, FLOOR, 440, { flip: true, rot: -0.02 * at(tSt, 0.6) });
  const [cx, cy] = ptf('calypso_offer', 1060, FLOOR, 440, 0.86, 0.33, { flip: true });
  glow(cx, cy, 170, 'rgba(255,236,200,A)', 0.55 * at(tI, 0.6) + 0.2 * at(tE, 0.6), 'lighter'); sparks(cx, cy - 10, at(tI, 0.5), 6, 40);
  void tO; ctx.restore();
}
function p07() {   // "you'll never get old, and you'll never die": two roundels — an old man, a dead man — each struck out
  const tO = VW('l08', 'old') - 0.4, tD = VW('l08', 'die') - 0.4;
  ctx.save(); cam(960, 580, 1.05);
  ground(FLOOR, { key: 'p7' });
  cave5(1700, FLOOR + 30, 540);
  fig('calypso_offer', 1180, FLOOR, 440, { flip: true });
  fig('ody_look', 420, FLOOR, 400);
  const strike = (x, y, t) => { const s = at(t + 0.6, 0.4); if (s <= 0) return; ctx.save(); ctx.strokeStyle = FIRE_COL; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 90, y - 90); ctx.lineTo(lerp(x - 90, x + 90, s), lerp(y - 90, y + 90, s)); ctx.stroke(); ctx.restore(); };
  roundel(700, 340, 130, at(tO, 0.5), () => { ground(440, { key: 'r7a', bare: 1 }); fig('ody_beggar', 700, 440, 190, { still: true }); }); strike(700, 340, tO);
  roundel(1000, 340, 130, at(tD, 0.5), () => { ground(420, { key: 'r7b', bare: 1 }); fig('man_dead', 1000, 420, 60, { still: true }); }); strike(1000, 340, tD);
  ctx.restore();
}
function p08() {   // every day he went down to the beach, sat on the rocks, looked out at the sea, and cried
  const tD = VW('l09', 'down') - 0.4, tSa = VW('l09', 'sat') - 0.3, tL = VW('l09', 'looked') - 0.3, tC = VW('l09', 'cried') - 0.3, u = EZ.io(pu('p08'));
  ctx.save(); cam(lerp(900, 1100, u), 580, 1.03 + 0.05 * at(tC, 1));
  sea(SEA, { speed: 8, x0: 1220 });
  ground(FLOOR, { key: 'p8', x1: 1240, sand: 1, slope: 0 });
  const w = walk(200, 920, SUB('p08'), tSa - SUB('p08'), 6, 7);
  xf(tSa, 0.45, (a) => fig('ody_look', w.x, FLOOR + w.dy, 390, { a, rot: w.rot }), (a) => fig('ody_weep', 960, FLOOR, 300, { a }));
  const [ex, ey] = ptf('ody_weep', 960, FLOOR, 300, 0.62, 0.17); tears(ex, ey, at(tC, 0.6), 8);
  void tD; void tL; ctx.restore();
}
function p09() {   // all he wanted was to see the smoke rising from Ithaca once more: far on the horizon a little island, a thread of smoke
  const tW = VW('l10', 'wanted') - 0.3, tSm = VW('l10', 'smoke') - 0.4, tI = VW('l10', 'ithaca') - 0.4, tD = VW('l10', 'die') - 0.3;
  ctx.save(); cam(lerp(960, 1300, at(tSm - 0.3, 2)), 560, 1.0 + 0.12 * at(tSm - 0.3, 2));
  sea(SEA, { speed: 6, x0: 980 });
  ground(FLOOR, { key: 'p9', x1: 1000, sand: 1, slope: 0 });
  coast(1500, SEA + 4, 120 * at(tSm - 0.6, 1.2) + 0.1, { a: at(tSm - 0.6, 1.2) });
  smoke(1520, SEA - 100, 0.5, at(tSm, 1), 9);
  glow(1500, SEA - 120, 260, 'rgba(255,236,200,A)', 0.3 * at(tI, 0.8), 'lighter');
  fig('ody_weep', 640, FLOOR, 330);
  const [ex, ey] = ptf('ody_weep', 640, FLOOR, 330, 0.62, 0.17); tears(ex, ey, 0.8, 9);
  void tW; ctx.restore();
  tint('#1a0c10', 0.25 * at(tD, 1.0), 'multiply');
}
function p10() {   // he turned down living forever, for a small rocky island and a wife getting older without him
  const tT = VW('l11', 'turned') - 0.3, tF = VW('l11', 'forever') - 0.4, tR = VW('l11', 'rocky') - 0.4, tWi = VW('l11', 'wife') - 0.4, tO = VW('l11', 'older') - 0.3;
  ctx.save(); cam(960, 580, 1.03);
  ground(FLOOR, { key: 'p10', bare: 1 });
  fig('ody_look', 960, FLOOR, 400);
  // left: forever — the cup of ambrosia, pushed away (struck)
  roundel(520, 400, 170, at(tF, 0.5), () => { ground(510, { key: 'r10a', bare: 1 }); fig('calypso_offer', 520, 510, 230, { still: true, flip: true }); glow(560, 380, 120, 'rgba(255,236,200,A)', 0.4, 'lighter'); });
  const s = at(tF + 0.8, 0.4); if (s > 0) { ctx.save(); ctx.strokeStyle = FIRE_COL; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(400, 280); ctx.lineTo(lerp(400, 640, s), lerp(280, 520, s)); ctx.stroke(); ctx.restore(); }
  // right: a small rocky island, and Penelope growing older
  roundel(1400, 400, 170, at(tR, 0.5), () => { sea(500, { speed: 8 }); coast(1400, 504, 150); if (TT > tWi - 0.5) fig('penelope', 1330, 540, 200 * at(tWi - 0.5, 0.6) + 1, { still: true, a: at(tWi - 0.5, 0.6), rot: 0.06 * at(tO, 1.5) }); });
  void tT; ctx.restore();
}
function p11() {   // "I've always liked him most here": a quiet push in on him on his rock at the end of the day
  const u = EZ.io(pu('p11'));
  ctx.save(); cam(lerp(960, 1100, u), 560, 1.04 + 0.16 * u);
  glow(1600, SEA - 40, 520, 'rgba(255,226,180,A)', 0.35, 'lighter');
  sea(SEA, { speed: 5, x0: 1200 });
  ground(FLOOR, { key: 'p11', x1: 1220, sand: 1, slope: 0 });
  fig('ody_weep', 960, FLOOR, 320);
  ctx.restore();
}
function p12() {   // in the end the gods took pity on him: on Olympus Zeus, Athena and Hermes look down
  const tP = VW('l13', 'pity') - 0.4, tG = VW('l13', 'gods') - 0.4;
  ctx.save(); cam(960, 560, 1.03);
  clouds(700);
  fig('athena', 620, 720, 400, { flip: true, a: at(tG - 0.4, 0.5) });
  fig('zeus', 1000, 720, 430, { a: at(tG - 0.2, 0.5) });
  fig('hermes', 1400, 720, 380, { a: at(tG, 0.5) });
  roundel(1000, 190, 90, at(tP, 0.6), () => { sea(215, { speed: 5 }); fig('ody_weep', 1000, 240, 90, { still: true }); });
  ctx.restore();
}
function p13() {   // Poseidon away at a feast at the far end of the world: the route runs east across the sea to his feast
  const tPo = VW('l14', 'poseidon') - 0.4, tF = VW('l14', 'feast') - 0.4, tFa = VW('l14', 'far') - 0.4, u = EZ.io(pu('p13'));
  ctx.save(); cam(lerp(900, 1150, at(tFa, 1.6)), 580, 1.02);
  sea(SEA, { speed: 8 });
  // the far land at the world's edge: a low shore with the feast
  ctx.save(); ctx.fillStyle = '#100a0a'; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(1300, SEA + 10); ctx.quadraticCurveTo(1450, SEA - 90, 1700, SEA - 100); ctx.lineTo(W + 400, SEA - 100); ctx.lineTo(W + 400, SEA + 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(0, SEA - 100 - FLOOR); spitFire(1780, at(tF, 0.6), 0, 13); ctx.restore();
  fig('poseidon', 1420, SEA + 30, 330, { a: at(tPo, 0.6) });
  // tiny Ogygia on the left: the cave hill and him on the beach
  bfLay('calypso_cave.webp', 260, SEA + 6, 110);
  route([[420, SEA - 20], [800, SEA - 70], [1150, SEA - 60], [1450, SEA - 110]], at(tFa, 1.6));
  void u; ctx.restore();
}
function p14() {   // Athena, goddess of wisdom, who loved him for his cleverness, goes to Zeus (the horse in a roundel on 'clever')
  const tA = VW('l15', 'athena') - 0.4, tWi = VW('l15', 'wisdom') - 0.4, tC = VW('l15', 'clever') - 0.4, tZ = VW('l15', 'zeus') - 0.4;
  ctx.save(); cam(960, 560, 1.03);
  clouds(700);
  const w = walk(300, 820, tZ - 1.8, 1.8, 5, 6); fig('athena', w.x, 720 + w.dy, 420, { flip: true, rot: w.rot });
  fig('zeus', 1350, 720, 440);
  const [ex, ey] = ptf('athena', w.x, 720, 420, 0.45, 0.12, { flip: true }); eyeGlint(ex, ey, at(tWi, 0.3) * (1 - at(tWi + 1.2, 0.4)));
  roundel(1000, 300, 130, at(tC, 0.6), () => { ground(400, { key: 'r14', bare: 1 }); fig('trojan_horse', 1000, 400, 200, { still: true }); });
  void tA; ctx.restore();
}
function p15() {   // Zeus sends Hermes down to Calypso with the order to let him go
  const tSe = VW('l16', 'sent') - 0.4, tH = VW('l16', 'hermes') - 0.4, tG = VW('l16', 'go') - 0.3, u = EZ.io(pu('p15'));
  ctx.save(); cam(960, 580, 1.02);
  ground(FLOOR, { key: 'p15' });
  cave5(1380, FLOOR + 30, 600);
  fig('calypso_stand', 1060, FLOOR, 440, { flip: true });
  // Hermes flies down on his winged sandals from the top left and lands facing her
  const k = EZ.io(clamp((TT - tH) / 2.4)), hx = lerp(-200, 600, k), hy = lerp(PIC0 + 360, FLOOR, k);
  fig('hermes', hx, hy, 380, { rot: -0.25 * (1 - k), flip: true });
  if (k > 0 && k < 1) { ctx.save(); ctx.strokeStyle = 'rgba(240,222,190,0.5)'; ctx.lineWidth = 3; ctx.setLineDash([10, 14]); ctx.beginPath(); ctx.moveTo(hx - 300, hy - 200); ctx.lineTo(hx - 40, hy - 30); ctx.stroke(); ctx.restore(); }
  void tSe; void tG; void u; ctx.restore();
}
function p16() {   // Calypso is furious: "you gods can't stand it when a goddess loves a mortal man"
  const tF = VW('l17', 'furious') - 0.4, tSt = VW('l18', 'stand') - 0.3, tL = VW('l18', 'loves') - 0.3, tM = VW('l18', 'mortal') - 0.3;
  ctx.save(); cam(lerp(960, 1000, at(tF, 1)), 580, 1.05, shake(tF, 5) + shake(tSt, 3), 16);
  ground(FLOOR, { key: 'p16' });
  cave5(1560, FLOOR + 30, 600);
  fig('hermes', 640, FLOOR, 380, { flip: true });
  xf(tF, 0.35, (a) => fig('calypso_stand', 1060, FLOOR, 440, { a, flip: true }), (a) => fig('calypso_angry', 1060, FLOOR, 450, { a, flip: true, rot: 0.02 * Math.sin(TT * 5) }));
  ctx.restore();
  tint('#3a0c08', 0.12 * at(tF, 0.4), 'multiply');
  void tL; void tM;
}
function p17() {   // but she did as she was told: Hermes rises away; she lowers her head
  const tB = VW('l19', 'but') - 0.3, tT = VW('l19', 'told') - 0.4;
  ctx.save(); cam(960, 580, 1.05);
  ground(FLOOR, { key: 'p17' });
  cave5(1560, FLOOR + 30, 600);
  const k = EZ.i2(clamp((TT - tB) / 2.2)); fig('hermes', lerp(640, 200, k), lerp(FLOOR, PIC0 - 200, k), 380, { flip: false, rot: 0.2 * k });
  xf(tB - 0.2, 0.4, (a) => fig('calypso_angry', 1060, FLOOR, 450, { a, flip: true }), (a) => fig('calypso_stand', 1060, FLOOR, 440, { a, flip: true, rot: -0.05 * at(tT, 0.6) }));
  ctx.restore();
}
function p18() {   // she gives him tools; he cuts down trees and builds a raft with his own hands
  const tG = VW('l20', 'tools') - 0.4, tC = VW('l20', 'cut') - 0.3, tTr = VW('l20', 'trees') - 0.3, tB = VW('l20', 'built') - 0.3, tR = VW('l20', 'raft') - 0.3, tH = VW('l20', 'hands') - 0.3;
  ctx.save(); cam(lerp(860, 1060, at(tB, 2)), 600, 1.03);
  sea(SEA, { speed: 8, x0: 1300 });
  ground(FLOOR, { key: 'p18', x1: 1320, sand: 1, slope: 0 });
  // the tree he fells: it tips and falls on 'trees'
  const fk = EZ.i2(clamp((TT - tTr - 0.4) / 0.9)); ctx.save(); ctx.translate(560, FLOOR + 6); ctx.rotate(-fk * 1.45); tree(0, 0, 520, { key: 'p18f' }); ctx.restore();
  tree(240, FLOOR + 6, 480, { key: 'p18b' });
  // the chopping: the axe swings
  const sw = TT > tC && TT < tB ? 0.18 * Math.max(0, Math.sin((TT - tC) * 7)) : 0;
  fig('ody_axe', 800, FLOOR, 400, { flip: true, rot: sw });
  fig('calypso_stand', 1150, FLOOR, 420, { flip: true, a: 1 - at(tC + 0.6, 0.6) });
  // the logs pile up on the sand, then the raft stands on the shore
  for (let i = 0; i < 6; i++) { const lk = at(tB + i * 0.18, 0.3) * (1 - at(tR + 0.3, 0.5)); if (lk <= 0) continue; ctx.save(); ctx.globalAlpha *= lk; ctx.fillStyle = BF.black; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(1080, FLOOR - 26 - i * 26 * (i < 3 ? 1 : 0) - (i >= 3 ? (i - 3) * 26 + 13 : 0), 300, 24, 12); ctx.fill(); ctx.stroke(); ctx.restore(); }
  const lk = EZ.i2(clamp((TT - (SUBEND('p18') - 1.4)) / 1.4)); fig('raft_sail', lerp(1300, 2600, lk), lerp(FLOOR + 6, SEA + 40, clamp(lk * 4)), 330, { a: at(tR + 0.2, 0.6), still: true });
  void tG; void tH; ctx.restore();
}
function p19() {   // on the eighteenth day at sea he sees land: 18 strokes cut; a coast rises on the horizon
  const tE = VW('l21', 'eighteenth') - 0.3, tL = VW('l21', 'land') - 0.4, u = EZ.io(pu('p19'));
  ctx.save(); cam(960, 580, 1.02);
  sea(SEA, { speed: 14 });
  coast(1650, SEA + 4, 150 * at(tL, 1.2) + 1, { a: at(tL, 1.2) });
  clipAbove(SEA + 34, () => fig('raft_sail', lerp(-700, 820, EZ.o2(clamp((TT - SUB('p19')) / 3))), SEA + 40 + 6 * Math.sin(TT * 2), 300, { rot: 0.03 * Math.sin(TT * 1.4) }));
  tally(18, 260, 200, tE, 0.1, { w: 8, len: 60, gap: 28 });
  ctx.restore();
}
function p20() {   // Poseidon, coming home from his feast, sees him: the god rises out of the sea on the left, his eye glints
  const tP = VW('l22', 'poseidon') - 0.5, tH = VW('l22', 'home') - 0.3, tS = VW('l22', 'saw') - 0.3;
  ctx.save(); cam(lerp(960, 800, at(tS, 1)), 560, 1.02 + 0.06 * at(tS, 1));
  sea(SEA, { speed: 14 });
  coast(1700, SEA + 4, 150);
  clipAbove(SEA + 34, () => fig('raft_sail', 1180, SEA + 40 + 6 * Math.sin(TT * 2), 240, { rot: 0.03 * Math.sin(TT * 1.4) }));
  riseFrom(SEA + 100, rise(tP, 1.4), (dy) => fig('poseidon', 520, SEA + 100 + dy, 700, { flip: true }));
  const [ex, ey] = ptf('poseidon', 520, SEA + 100, 700, 0.36, 0.17, { flip: true }); eyeGlint(ex, ey, at(tS, 0.3));
  void tH; ctx.restore();
  tint('#1a0c10', 0.2 * at(tS, 0.8), 'multiply');
}
function p21() {   // he gathers every cloud and stirs the sea with his trident: the storm; the raft comes apart
  const tG = VW('l23', 'gathered') - 0.4, tCl = VW('l23', 'cloud') - 0.4, tSt = VW('l23', 'stirred') - 0.3, tA = VW('l23', 'apart') - 0.4;
  const st = at(tSt, 0.8);
  ctx.save(); cam(960, 580, 1.03, 4 * st + shake(tA, 10), 21);
  ctx.save(); ctx.globalAlpha *= at(tCl, 1.0); clouds(lerp(60, 200, at(tCl, 1.2))); ctx.restore();
  rain(at(tCl + 0.6, 0.6));
  const bump = (x, r) => 34 * st * Math.sin(x * 0.005 + TT * 3 + r * 0.5);
  fig('poseidon', 360, SEA + 160, 640, { flip: true, rot: 0.06 * Math.sin(TT * 3) * st });
  sea(SEA, { speed: 30, bump });
  const rx = 1250, ry = SEA + 40 + bump(1250, 0) * 0.8;
  if (TT < tA) clipAbove(SEA + 34 + bump(1250, 0), () => fig('raft_sail', rx, ry, 260, { rot: 0.18 * Math.sin(TT * 2.2) * st, still: true }));
  else { brokenRaft(rx, ry, 260, clamp((TT - tA) / 1.6)); clipAbove(SEA + 40, () => fig('man_swim', rx + 60, SEA + 110 + 6 * Math.sin(TT * 3), 160, { a: at(tA + 0.4, 0.4) })); }
  const b = bolt(tCl + 0.4, 1100, 0.4) + bolt(tA - 0.2, 1400, 0.35);
  ctx.restore();
  tint('#140810', 0.4 * at(tCl, 1), 'multiply'); if (b > 0) tint('#fff0d0', 0.3 * b);
}
function p22() {   // two days and two nights he swims: the sun and the moon each cross twice over him
  const tT = VW('l24', 'two') - 0.3, tSw = VW('l24', 'swam') - 0.3, d0 = SUB('p22'), D = SUBEND('p22') - d0;
  const ph = clamp((TT - d0) / D) * 2, dayK = 0.5 + 0.5 * Math.cos(ph * TAU);   // day -> night -> day -> night
  ctx.save(); cam(960, 580, 1.03);
  const sx = lerp(-100, W + 100, mod(ph * 2, 1)); if (dayK > 0.5) blackSun(sx, 280 - 140 * Math.sin(Math.PI * mod(ph * 2, 1)), 34, (dayK - 0.5) * 2);
  sea(SEA, { speed: 18, bump: (x, r) => 14 * Math.sin(x * 0.006 + TT * 2 + r) });
  clipAbove(SEA + 30, () => fig('man_swim', 900 + 20 * Math.sin(TT * 0.7), SEA + 90 + 10 * Math.sin(TT * 2), 220, { rot: 0.06 * Math.sin(TT * 2.4) }));
  tally(2, 1500, 200, tT, 0.4, { w: 10, len: 80, gap: 40 });
  ctx.restore();
  night(1 - dayK, mod(ph * 2, 1) * W, 220);
  void tSw;
}
function p23() {   // on the third day, more dead than alive, he drags himself up a river mouth onto a beach
  const tTh = VW('l25', 'third') - 0.4, tDe = VW('l25', 'dead') - 0.3, tDr = VW('l25', 'dragged') - 0.4, tB = VW('l25', 'beach') - 0.3;
  ctx.save(); cam(960, 600, 1.04);
  // the land behind, reeds, the river mouth opening to the sea on the left
  sea(SEA, { speed: 10 });
  ground(FLOOR - 70, { key: 'p23', x0: 700, slope: 160, sand: 1 });
  tree(1500, FLOOR - 64, 460, { key: 'p23a' }); tree(1760, FLOOR - 64, 380, { key: 'p23b' });
  river(FLOOR - 4, 50);
  const k = EZ.io(clamp((TT - tDr) / 3.0)); fig('ody_crawl', lerp(620, 1040, k), FLOOR - 66 + 40 * (1 - k), 170, { flip: true, rot: 0.04 * Math.sin(TT * 4) * (k < 1 ? 1 : 0), still: true });
  tally(3, 300, 200, tTh, 0.25, { w: 10, len: 80, gap: 40 });
  void tDe; void tB; ctx.restore();
}
function p24() {   // he buries himself in a pile of dry leaves under two olive trees and sleeps; night falls
  const tBu = VW('l26', 'buried') - 0.4, tL = VW('l26', 'leaves') - 0.3, tSl = VW('l26', 'slept') - 0.3;
  ctx.save(); cam(960, 600, 1.04 + 0.06 * at(tSl, 1.4));
  ground(FLOOR, { key: 'p24' });
  tree(720, FLOOR + 6, 560, { key: 'p24a' }); tree(1180, FLOOR + 6, 600, { key: 'p24b' });
  fig('ody_lie', 950, FLOOR + 4, 150, { still: true });
  leafFall(950, FLOOR - 40, at(tBu, 0.6) * (1 - at(tSl + 0.8, 0.8)), 24);
  leaves(950, FLOOR + 6, 560, 0.1 + 0.9 * at(tL, 1.6), 24);
  ctx.restore();
  night(0.75 * at(tSl, 1.4), 1500, 220);
}

// ---- 12 · THE PHAEACIANS
function p25() {   // he wakes to the sound of girls playing ball: by the river the ball flies between the princess and a maid; the title
  const t0 = SUB('p25'), tW = VW('l27', 'woke') - 0.4, tB = VW('l27', 'ball') - 0.3;
  ctx.save(); cam(960, 600, 1.02);
  ground(FLOOR, { key: 'p25' });
  fig('nausicaa_ball', 420, FLOOR, 420);
  fig('maid_ball', 960, FLOOR, 410, { flip: true });
  // the ball back and forth
  const per = 2.2, n = Math.floor(Math.max(0, TT - t0) / per), tt = t0 + n * per, dir = n % 2; ballArc(dir ? 940 : 470, dir ? 430 : 470, dir ? 470 : 940, dir ? 470 : 430, tt, per * 0.8, 200);
  river(FLOOR + 30, 40);
  letters('XII · THE PHAEACIANS', 1240, 300, t0 + 0.4, 72, { step: 0.05 });
  void tW; void tB; ctx.restore();
}
function p26() {   // the princess Nausicaa came down to the river with her maids to wash clothes: cloths drying on the stones
  const tP = VW('l28', 'princess') - 0.4, tN = VW('l28', 'nausicaa') - 0.4, tR = VW('l28', 'river') - 0.4, tWa = VW('l28', 'wash') - 0.3;
  ctx.save(); cam(lerp(1000, 900, EZ.io(pu('p26'))), 600, 1.04);
  ground(FLOOR, { key: 'p26' });
  // clothes spread to dry on the bank
  ctx.save(); ctx.fillStyle = FIRE_COL; ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; for (const [x, w] of [[1640, 130], [1800, 150]]) { ctx.beginPath(); ctx.moveTo(x, FLOOR - 4); ctx.lineTo(x + w, FLOOR - 4); ctx.lineTo(x + w - 10, FLOOR - 20); ctx.lineTo(x + 10, FLOOR - 22); ctx.closePath(); ctx.fill(); ctx.stroke(); for (let j = 1; j < 4; j++) { ctx.beginPath(); ctx.moveTo(x + j * w / 4, FLOOR - 4); ctx.lineTo(x + j * w / 4 + 4, FLOOR - 21); ctx.stroke(); } } ctx.restore();
  tree(260, FLOOR + 6, 520, { key: 'p26t' });
  fig('nausicaa_ball', 760, FLOOR, 430, { a: 1 });
  fig('maid_wash', 1150, FLOOR + 30, 300, { rot: 0.03 * Math.sin(TT * 3) * at(tWa, 0.3) });
  fig('maid_ball', 1480, FLOOR, 400, { flip: true });
  river(FLOOR + 30, 40);
  void tP; void tN; void tR; ctx.restore();
}
function p27() {   // a naked man, crusted with salt, steps out of the bushes holding a leafy branch in front of himself
  const tN = VW('l29', 'naked') - 0.4, tSa = VW('l29', 'salt') - 0.3, tSt = VW('l29', 'stepped') - 0.4, tB = VW('l29', 'branch') - 0.3;
  ctx.save(); cam(lerp(900, 760, at(tSt, 2)), 600, 1.04 + 0.06 * at(tSt, 2));
  ground(FLOOR, { key: 'p27' });
  tree(240, FLOOR + 6, 560, { key: 'p27t' });
  const w = walk(440, 760, tSt, 2.0, 5, 5);
  fig('ody_branch', w.x, FLOOR + w.dy, 400, { rot: w.rot });
  // salt glints on him
  if (TT > tSa - 0.3) { const R = RNG('salt'); for (let i = 0; i < 14; i++) { const [sx, sy] = ptf('ody_branch', w.x, FLOOR, 400, R.r(0.3, 0.7), R.r(0.08, 0.7)); bfDot(sx, sy, R.r(1.5, 3), `rgba(240,232,214,${0.8 * at(tSa - 0.3, 0.5) * (0.6 + 0.4 * Math.sin(TT * 5 + i))})`); } }
  bush(500, FLOOR + 6, 1.4, at(tSt - 0.4, 0.2) * (1 - at(tSt + 1.2, 0.3)), 27);
  fig('maid_wash', 1350, FLOOR + 30, 280, { flip: false });
  fig('nausicaa_ball', 1650, FLOOR, 420, { flip: true });
  river(FLOOR + 30, 40);
  void tN; void tB; ctx.restore();
}
function p28() {   // the maids run
  const tR = VW('l30', 'ran') - 0.4, u = EZ.io(pu('p28'));
  ctx.save(); cam(960, 600, 1.03);
  ground(FLOOR, { key: 'p28' });
  tree(380, FLOOR + 6, 540, { key: 'p28t' });
  bush(700, FLOOR + 6, 1.2, 0, 28);
  fig('ody_branch', 980, FLOOR, 400);
  const a = walk(1300, 2700, tR - 0.1, 1.7, 9, 16), b = walk(1650, 3000, tR + 0.1, 1.7, 9, 16);
  fig('maid_run', a.x, FLOOR + a.dy, 380, { rot: a.rot });
  fig('maid_ball', b.x, FLOOR + b.dy, 400, { rot: b.rot + 0.15 * b.mv });
  river(FLOOR + 30, 40);
  void u; ctx.restore();
}
function p29() {   // the princess stands her ground; she gives him clothes (the cloak passes, he stands clothed)
  const tP = VW('l31', 'princess') - 0.4, tG = VW('l31', 'ground') - 0.3, tC = VW('l32', 'clothes') - 0.3;
  ctx.save(); cam(960, 580, 1.03);
  ground(FLOOR, { key: 'p29' });
  tree(300, FLOOR + 6, 560, { key: 'p29t' }); tree(620, FLOOR + 6, 420, { key: 'p29u' });
  bush(960, FLOOR + 6, 1.2, 0, 29);
  xf(tC + 0.3, 0.6, (a) => fig('ody_branch', 1240, FLOOR, 400, { a }), (a) => fig('ody_look', 1240, FLOOR, 400, { a }));
  fig('nausicaa_stand', 1720, FLOOR, 430, { rot: -0.015 * at(tG, 0.5) });
  glow(1720, 520, 300, 'rgba(255,236,200,A)', 0.25 * at(tG, 0.6) * (1 - at(tC, 1)), 'lighter');
  river(FLOOR + 30, 40);
  void tP; ctx.restore();
}
function p30() {   // to her father, the king of the Phaeacians, the finest sailors in the world (hall card; a ship in a roundel)
  const tF = VW('l32', 'father') - 0.4, tK = VW('l32', 'king') - 0.4, tSa = VW('l32', 'sailors') - 0.4, tW = VW('l32', 'world') - 0.3;
  ctx.save(); cam(960, 580, 1.03);
  phaeHall({ fireX: 1820 });
  fig('alcinous', 1400, FLOOR, 400);
  fig('arete', 1650, FLOOR, 390);
  const w = walk(-1160, 560, SUB('p30') - 0.6, 3.0, 5, 5); fig('nausicaa_stand', w.x + 260, FLOOR + w.dy, 420, { flip: true, rot: w.rot });
  const v = walk(-800, 360, SUB('p30') - 0.3, 3.0, 6, 6); fig('ody_look', v.x, FLOOR + v.dy, 400, { rot: v.rot });
  roundel(1000, 330, 140, at(tSa, 0.6), () => { sea(380, { speed: 16 }); ship(1000 + 30 * Math.sin(TT), 400, 240, { behind: (s) => shipOdy(s, 0.1, 'phaeacian_row', 80) }); });
  void tF; void tK; void tW; ctx.restore();
}
function p31() {   // the feast: a blind singer takes his lyre and sings of the Trojan War (Troy burning in a roundel)
  const tB = VW('l33', 'blind') - 0.4, tLy = VW('l33', 'lyre') - 0.3, tSa = VW('l33', 'sang') - 0.3, tTr = VW('l33', 'trojan') - 0.4;
  ctx.save(); cam(lerp(960, 900, EZ.io(pu('p31'))), 580, 1.03);
  phaeHall({ fireX: 1820, fireK: 0.8 });
  table(1040, 300);
  fig('guest_a', 840, FLOOR, 250);
  fig('alcinous', 1500, FLOOR, 390);
  fig('demodocus', 400, FLOOR, 360);
  const [mx, my] = ptf('demodocus', 400, FLOOR, 360, 0.75, 0.1); song(mx, my, at(tSa, 0.6), 32);
  roundel(820, 320, 140, at(tTr, 0.6), () => { bfLay('troy_walls.webp', 820, 430, 160); fireAt(740, 300, 0.32, 1, 9); fireAt(900, 300, 0.28, 1, 10); });
  void tB; void tLy; ctx.restore();
}
function p32() {   // he sings of the wooden horse, and of the clever man who thought of it
  const tH = VW('l34', 'horse') - 0.4, tC = VW('l34', 'clever') - 0.4;
  ctx.save(); cam(960, 580, 1.04);
  phaeHall({ fireX: 1820, fireK: 0.8 });
  table(1200, 360);
  fig('guest_b', 1500, FLOOR, 330);
  fig('ody_veil', 1080, FLOOR, 330, { a: 0 });
  fig('ody_look', 1000, FLOOR, 400, { flip: true });
  fig('demodocus', 400, FLOOR, 360);
  const [mx, my] = ptf('demodocus', 400, FLOOR, 360, 0.75, 0.1); song(mx, my, 1, 33);
  roundel(760, 320, 150, at(tH, 0.6), () => { ground(440, { key: 'r33', bare: 1 }); fig('trojan_horse', 760, 440, 240, { still: true, a: 1 - at(tC, 0.4) }); if (TT > tC - 0.2) fig('ody_offer', 760, 440, 230, { still: true, a: at(tC, 0.4) }); });
  ctx.restore();
}
function p33() {   // the stranger at the table pulls his cloak over his face and weeps
  const tSt = VW('l35', 'stranger') - 0.4, tP = VW('l35', 'pulled') - 0.4, tW = VW('l35', 'wept') - 0.3;
  ctx.save(); cam(lerp(960, 1080, at(tP, 1.6)), 600, 1.04 + 0.12 * at(tP, 1.6));
  phaeHall({ fireX: 1820, fireK: 0.8 });
  table(1200, 360);
  fig('guest_b', 1560, FLOOR, 330);
  xf(tP, 0.5, (a) => fig('ody_look', 1000, FLOOR, 400, { a, flip: true }), (a) => fig('ody_veil', 1000, FLOOR, 340, { a, rot: 0.01 * Math.sin(TT * 6) * at(tW, 0.4) }));
  fig('demodocus', 400, FLOOR, 360);
  const [mx, my] = ptf('demodocus', 400, FLOOR, 360, 0.75, 0.1); song(mx, my, 1, 34);
  ctx.restore();
  tint('#1a0c10', 0.22 * at(tW, 0.8), 'multiply');
  void tSt;
}
function p34() {   // the king asks him, gently, who he is; the song stops
  const tK = VW('l36', 'king') - 0.4, tGe = VW('l36', 'gently') - 0.3, tWh = VW('l36', 'who') - 0.3;
  ctx.save(); cam(960, 600, 1.05);
  phaeHall({ fireX: 300, fireK: 0.8 });
  fig('ody_veil', 760, FLOOR, 340);
  fig('alcinous', 1240, FLOOR, 400, { rot: -0.02 * at(tGe, 0.5) });
  fig('arete', 1520, FLOOR, 390);
  void tK; void tWh; ctx.restore();
}
function p35() {   // for the first time since the Cyclops he says his name: he stands — I AM ODYSSEUS
  const tF = VW('l37', 'first') - 0.4, tC = VW('l37', 'cyclops') - 0.4, tN = VW('l37', 'name') - 0.3, tI = VW('l38', 'i') - 0.3, tO = VW('l38', 'odysseus') - 0.4;
  ctx.save(); cam(lerp(960, 880, at(tI, 1.2)), 580, 1.04 + 0.06 * at(tI, 1.2));
  phaeHall({ fireX: 300, fireK: 0.8 });
  xf(tN - 0.2, 0.5, (a) => fig('ody_veil', 760, FLOOR, 340, { a }), (a) => fig('ody_tell', 760, FLOOR, 420, { a }));
  fig('alcinous', 1240, FLOOR, 400, { rot: -0.02 });
  fig('arete', 1520, FLOOR, 390);
  roundel(1120, 300, 130, at(tC, 0.5) * (1 - at(tI - 0.4, 0.4)), () => { ground(400, { key: 'r36', bare: 1 }); fig('cyclops_throw', 1120, 400, 230, { still: true }); });
  letters('ODYSSEUS', 1100, 330, tO, 96, { step: 0.07 });
  void tF; ctx.restore();
}
function p36() {   // he tells them everything since Troy: the earlier chapters pass over the hall in roundels, ending with the cattle of the Sun
  const tT = VW('l39', 'told') - 0.4, tC = VW('l39', 'cattle') - 0.4;
  ctx.save(); cam(960, 600, 1.03);
  phaeHall({ fireX: 300, fireK: 0.7 });
  fig('ody_tell', 520, FLOOR, 420);
  fig('guest_a', 1080, FLOOR, 250, { flip: true });
  fig('alcinous', 1500, FLOOR, 400);
  storyBand(330, tT, SUBEND('p36') + 0.6 - tT, 120, at(tT, 0.4));
  ctx.restore();
}
function p37() {   // and the name of every man he'd lost along the way: the ghosts of his crew rise in a row behind him
  const tN = VW('l39', 'name') - 0.4, tE = VW('l39', 'every') - 0.3, tL = VW('l39', 'lost') - 0.4;
  ctx.save(); cam(960, 600, 1.03);
  phaeHall({ fireX: 300, fireK: 0.6 });
  const C = ['sailor0', 'man_walk', 'sailor1', 'man_fear', 'sailor2', 'man_skin', 'shade'];
  for (let i = 0; i < 9; i++) { const x = 820 + i * 120, k = at(tE + i * 0.25, 0.8); if (k <= 0) continue; ghost(C[i % C.length], x, FLOOR - 40 - (i % 2) * 20, 260 + (i % 3) * 20, { a: 0.7 * k * (1 - 0.4 * at(tL + 1.0, 1)), flip: i % 2 === 0 }); }
  fig('ody_tell', 520, FLOOR, 420);
  tint('#2a1016', 0.2 * at(tN, 0.8), 'multiply');
  ctx.restore();
}
function p38() {   // the Phaeacians sit listening in silence until midnight: the fire burns low, the hall darkens
  const tS = VW('l40', 'silence') - 0.4, tM = VW('l40', 'midnight') - 0.4;
  ctx.save(); cam(960, 600, 1.04);
  phaeHall({ fireX: 960, fireK: 1 - 0.6 * at(tM, 1.4) });
  fig('guest_a', 640, FLOOR, 250);
  fig('guest_b', 1320, FLOOR, 330);
  fig('demodocus', 240, FLOOR, 340);
  fig('arete', 1700, FLOOR, 380);
  fig('alcinous', 1500, FLOOR, 380);
  ctx.restore();
  tint('#140810', 0.5 * at(tM, 1.4), 'multiply');
  void tS;
}
function p39() {   // the next evening they put him on one of their ships, loaded with gifts
  const tN = VW('l41', 'evening') - 0.4, tP = VW('l41', 'put') - 0.4, tG = VW('l41', 'gifts') - 0.4, u = EZ.io(pu('p39'));
  ctx.save(); cam(960, 580, 1.03);
  glow(1700, SEA - 40, 520, 'rgba(255,214,170,A)', 0.35, 'lighter');
  sea(SEA, { speed: 8, x0: 820 });
  ground(FLOOR, { key: 'p39', x1: 840, sand: 1, slope: 0 });
  ship(1320, 810, 700, { behind: (s) => { shipOdy(s, -0.3, 'phaeacian_row', 190); shipOdy(s, 0.32, 'phaeacian_row', 190); } });
  gifts(420, FLOOR, at(tG, 0.6));
  const w = walk(200, 780, tP, 1.8, 6, 6); fig('ody_look', w.x, FLOOR + w.dy, 380, { rot: w.rot });
  fig('nausicaa_stand', 120, FLOOR, 400);
  void tN; void u; ctx.restore();
}
function p40() {   // he falls into a sleep deep as death, while the ship skims over the water faster than a hawk
  const tSl = VW('l42', 'sleep') - 0.4, tD = VW('l42', 'death') - 0.3, tSk = VW('l42', 'skimmed') - 0.4, tH = VW('l42', 'hawk') - 0.4;
  const sp = at(tSk, 1.0);
  ctx.save(); cam(960, 580, 1.03);
  sea(SEA, { speed: 14 + 50 * sp });
  ship(lerp(760, 1200, at(tSk, 2)), 800, 640, { behind: (s) => { shipOdy(s, -0.32, 'phaeacian_row', 170); shipOdy(s, 0.0, 'ody_lie', 70, { dy: 14 }); shipOdy(s, 0.32, 'phaeacian_row', 170); } });
  gust(200, 520, 900, 0, sp, 41, { n: 4, speed: 2 });
  hawk(lerp(1500, 1100, at(tH, 2)), 300 + 10 * Math.sin(TT * 2), 1.4);
  ctx.restore();
  night(0.8, 1500, 220);
  tint('#140810', 0.2 * at(tD, 0.6) * (1 - at(tSk, 0.8)), 'multiply');
}
function p41() {   // he wakes up on a beach he doesn't recognise: mist, the gifts beside him, the ship already gone
  const tW = VW('l43', 'woke') - 0.4, tR = VW('l43', "recognise") - 0.4, u = EZ.io(pu('p41'));
  ctx.save(); cam(960, 600, 1.04);
  glow(400, SEA - 60, 520, 'rgba(255,226,190,A)', 0.4, 'lighter');
  sea(SEA, { speed: 6, x0: 1080 });
  ground(FLOOR, { key: 'p41', x1: 1100, sand: 1, slope: 0 });
  gifts(560, FLOOR, 1);
  xf(tW + 0.2, 0.6, (a) => fig('ody_lie', 900, FLOOR + 4, 140, { a, still: true }), (a) => (TT < tR ? fig('ody_look', 900, FLOOR, 400, { a }) : turnFig('ody_look', 900, FLOOR, 400, tR, { a })));
  ship(lerp(1500, 2300, u), 760, 220, {});
  // mist bands drifting over the shore
  ctx.save(); ctx.strokeStyle = 'rgba(240,222,190,0.14)'; ctx.lineWidth = 26; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { const y = 500 + i * 90; ctx.beginPath(); for (let x = -200; x <= W + 200; x += 40) { const yy = y + 10 * Math.sin(x * 0.007 + TT * 0.5 + i); x === -200 ? ctx.moveTo(x + mod(TT * 20, 80), yy) : ctx.lineTo(x + mod(TT * 20, 80), yy); } ctx.stroke(); } ctx.restore();
  ctx.restore();
}
function p42() {   // it was Ithaca: the rocky island, lettered
  const tI = VW('l44', 'ithaca') - 0.4, u = EZ.io(pu('p42'));
  ctx.save(); cam(960, 560, 1.02 + 0.04 * u);
  glow(1300, 360, 600, 'rgba(255,236,200,A)', 0.35 * at(tI, 0.8), 'lighter');
  sea(SEA, { speed: 6 });
  coast(560, SEA + 4, 380, { flip: true });
  shoreL({ x0: 1000, key: 'p42' });
  fig('ody_look', 1300, FLOOR, 380, { flip: true });
  letters('ITHACA', 600, 300, tI, 120, { step: 0.08 });
  ctx.restore();
}
function p43() {   // home late, alone, on somebody else's ship, just as the Cyclops prayed (his prayer in a roundel)
  const tL = VW('l45', 'late') - 0.3, tA = VW('l45', 'alone') - 0.3, tS = VW('l45', 'ship') - 0.3, tC = VW('l45', 'cyclops') - 0.4, tP = VW('l45', 'prayed') - 0.3, u = EZ.io(pu('p43'));
  ctx.save(); cam(lerp(960, 1040, u), 580, 1.03);
  glow(1600, SEA - 30, 520, 'rgba(255,214,170,A)', 0.4, 'lighter');
  shoreL({ x0: 1100, key: 'p43' });
  ship(lerp(700, 300, u), 740, 180 * (1 - 0.3 * u), { flip: true });
  fig('ody_look', 1180, FLOOR, 400, { flip: true });
  gifts(1790, FLOOR, 1);
  roundel(1000, 320, 140, at(tC, 0.6), () => { ground(420, { key: 'r44', bare: 1 }); fig('cyclops_pray', 1000, 420, 220, { still: true }); });
  void tL; void tA; void tS; void tP; ctx.restore();
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
const FULL_SET = new Set(['p12', 'p14', 'p30', 'p31', 'p32', 'p33', 'p34', 'p35', 'p36', 'p37', 'p38', 'p40']);   // panels that fill the picture with a set (Olympus, the Phaeacian hall): they slide in as cards
const FG_SET = new Set(['circe_house.webp', 'coast.webp', 'ship_beached', 'scylla.webp', 'charybdis.webp', 'figtree.webp', 'bones.webp', 'troy_walls.webp', 'calypso_cave.webp']), JUNK = document.createElement('canvas'); JUNK.width = JUNK.height = 2;
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
const PANELS = { p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24, p25, p26, p27, p28, p29, p30, p31, p32, p33, p34, p35, p36, p37, p38, p39, p40, p41, p42, p43 };
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
const BOARD_AT = { p01: ['l01', 'calypso'], p02: ['l02', 'springs'], p03: ['l03', 'love'], p04: ['l04', 'leave'], p05: ['l05', 'years'], p06: ['l07', 'immortal'], p07: ['l08', 'die'], p08: ['l09', 'cried'], p09: ['l10', 'ithaca'], p10: ['l11', 'older'], p11: ['l12', 'here'], p12: ['l13', 'him'], p13: ['l14', 'world'], p14: ['l15', 'clever'], p15: ['l16', 'go'], p16: ['l18', 'mortal'], p17: ['l19', 'told'], p18: ['l20', 'hands'], p19: ['l21', 'land'], p20: ['l22', 'him'], p21: ['l23', 'apart'], p22: ['l24', 'swam'], p23: ['l25', 'beach'], p24: ['l26', 'slept'], p25: ['l27', 'ball'], p26: ['l28', 'clothes'], p27: ['l29', 'himself'], p28: ['l30', 'ran'], p29: ['l31', 'ground'], p30: ['l32', 'sailors'], p31: ['l33', 'war'], p32: ['l34', 'it'], p33: ['l35', 'wept'], p34: ['l36', 'was'], p35: ['l38', 'odysseus'], p36: ['l39', 'cattle'], p37: ['l39', 'way'], p38: ['l40', 'midnight'], p39: ['l41', 'gifts'], p40: ['l42', 'hawk'], p41: ['l43', 'recognise'], p42: ['l44', 'ithaca'], p43: ['l45', 'prayed'] };
TIMELINE.board = IDS.map((id, i) => { const [l, w, n] = BOARD_AT[id]; const t = id === 'p43' ? DURATION - 1.2 : Math.min(VW(l, w, n) + 0.6, SUBEND(id) - 0.6); return { t: Math.round(t * FPS) / FPS, title: id, sound: '', next: '' }; });
