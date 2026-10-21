// =====================================================================
//  BEATS — ganaste esa carrera. Helpers (the fleshy tunnel in perspective, sperm, the egg, shaded cells, the embryo and
//  fetus, the counter HUD) then one function per shot. Drawn at 360x640.
// =====================================================================
const at = (T, t) => { if (t <= T[0][0]) return T[0][1]; for (let i = 1; i < T.length; i++) if (t <= T[i][0]) { const [a, va] = T[i - 1], [b, vb] = T[i]; return va + (vb - va) * EZ.io((t - a) / (b - a)); } return T[T.length - 1][1]; };
const cnt = (L, t) => L.filter((x) => t >= x).length;
const VPX = 180, VPY = 230, FOC = 300;
const FLESH = ['#12020a', '#2a0618', '#4a0c28', '#6e163c', '#962a52', '#c04a6a', '#e07a88'];
const CELLP = ['#5a1410', '#9a2e1e', '#d8583a', '#ff8a6a', '#ffc0a0', '#fff0e0'];
const fmtN = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ---- the tunnel: folds rushing past toward a glowing vanishing point; speed = how fast the camera travels
function tunnel(t, o = {}) {
  const sp = o.speed ?? 1, glow = o.glow ?? 0.6, vx = o.vx ?? VPX, vy = o.vy ?? VPY;
  pfield(0, 0, SW, SH, (i, j) => {
    const dx = i - vx, dy = (j - vy) * 0.9, r = Math.hypot(dx, dy) + 1, a = Math.atan2(dy, dx), z = 60 / r;
    const u = z * 3 + t * sp * 0.9, fold = 0.5 + 0.5 * Math.sin(u * 6.283 + Math.sin(a * 5 + u) * 0.8), n = fbm(a * 2.2 + 3, u * 1.3, 77, 3);
    const depth = clamp(r / 260), v = (fold * 0.55 + n * 0.45) * (0.25 + depth * 0.85) + (1 - clamp(r / 40)) * glow * 0.8;
    return RGB(ramp(FLESH, clamp(v), i, j));
  });
  // veins: a few dark lines spiralling along the wall
  for (let k = 0; k < 6; k++) { const a0 = k * 1.05 + Math.sin(t * 0.3 + k) * 0.1; for (let q = 0; q < 70; q++) { const z = 0.25 + q * 0.03, u = mod(z - t * sp * 0.15, 2.4) + 0.25, r = FOC * 0.95 / u; if (r > 420) continue; pset(vx + Math.cos(a0 + q * 0.02) * r, vy + Math.sin(a0 + q * 0.02) * r / 0.9, '#1e0412'); } }
  pglow(vx, vy, 2, 40, '#ffb0a0', glow * 0.6);
}
// ---- a sperm: head (oval, lit) at (x, y) facing angle a, size s, a waving tail; o.you = the yellow tail
function sperm(x, y, a, s, t, ph, o = {}) {
  const L = Math.round(16 + 26 * s), amp = (o.amp ?? 1) * 3.5 * s, tc = o.you ? YOU : (o.tail ?? '#c8b8c8'), tc2 = o.you ? '#c8a020' : '#7a6a80';
  const ca = Math.cos(a), sa = Math.sin(a);
  for (let q = 0; q < L; q++) { const w = Math.sin(q * 0.35 - t * 14 + ph) * amp * (q / L), bx = x - ca * (q + 3 * s) - sa * w, by = y - sa * (q + 3 * s) + ca * w; pset(bx, by, q < L * 0.7 ? tc : tc2); if (o.you && q < L * 0.6) pset(bx + 1, by, tc); }
  const hw = Math.max(1, 2.6 * s + 0.5), hl = Math.max(2, 4 * s + 1);
  pfield(x - hl - 2, y - hl - 2, 2 * hl + 5, 2 * hl + 5, (i, j) => { const dx = i - x, dy = j - y, u = dx * ca + dy * sa, v = -dx * sa + dy * ca, d = (u / hl) ** 2 + (v / hw) ** 2; if (d > 1) return null; return RGB(d > 0.6 ? '#a8a0b8' : (u > 0 && v < 0) ? '#ffffff' : '#e8e4f0'); });
  if (o.you) pglow(x, y, 1, 6 + 4 * s, YOU, 0.35);
}
// rivals in the tunnel: angle around the axis, radius 0..0.9, relative depth z (>0 ahead). z(t) = z0 + dv * (t − tl) after losing
function rival(k, t) {
  const r = RNG('riv', k), ang = r.f() * 6.283, rr = 0.25 + r.f() * 0.65, z0 = 0.5 + r.f() * 4.5, tl = 9.8 + r.f() * 6, mode = r.i(0, 3);
  let z = z0 + Math.sin(t * 0.7 + k) * 0.08, rad = rr, a2 = ang, tired = 1;
  if (t > tl) { const s = t - tl; if (mode === 0) z -= s * 0.9; else if (mode === 1) { rad = Math.min(1.05, rr + s * 0.25); z -= s * 0.5; } else { z -= s * 0.6; tired = 0.3; } }
  return { z, x: VPX + Math.cos(a2) * rad * FOC / Math.max(0.15, z), y: VPY + Math.sin(a2) * rad * FOC / Math.max(0.15, z), s: 1 / Math.max(0.15, z), mode, lost: t > tl, tired, ph: r.f() * 6 };
}
function race(t, nR, o = {}) {
  const items = []; for (let k = 0; k < nR; k++) { const R = rival(k, t); if (R.z > 0.18 && R.z < 6) items.push(R); }
  items.sort((a, b) => b.z - a.z);
  items.forEach((R) => { const a = Math.atan2(VPY - R.y, VPX - R.x) + (R.lost && R.mode === 0 ? Math.PI : 0); sperm(R.x, R.y, a, Math.min(1.4, R.s * 0.55), t, R.ph, { amp: R.tired }); });
}
// ---- the counter HUD (bottom, like the clock): a label and a big value
function hud(label, val, o = {}) {
  pixDefer(() => lowres(DOC_TXT, () => {
    docText(label, 90, o.y ?? 210, o.lc ?? '#eef0ea', { align: 'center', outline: '#05060f' });
    docText(String(val), 90, (o.y ?? 210) + 9, o.col ?? YOU, { align: 'center', scale: o.scale ?? 2, outline: '#05060f' });
    if (o.l2) docText(o.l2[0], 90, (o.y ?? 210) + 28, '#eef0ea', { align: 'center', outline: '#05060f' }), docText(String(o.l2[1]), 90, (o.y ?? 210) + 37, o.l2[2] ?? CORAL, { align: 'center', scale: 2, outline: '#05060f' });
  }));
}
const rivalsAt = (t) => t < 9.8 ? 250e6 : Math.max(300, 250e6 * Math.pow(300 / 250e6, EZ.io(clamp((t - 9.8) / 8.2))));

// ---- a shaded cell (a lit sphere with a rim and a highlight)
function cell(x, y, r, o = {}) {
  r = Math.max(2, r); const pal = o.pal ?? CELLP;
  pfield(x - r - 1, y - r - 1, 2 * r + 3, 2 * r + 3, (i, j) => { const nx = (i - x) / r, ny = (j - y) / r, q = nx * nx + ny * ny; if (q > 1) return null; const nz = Math.sqrt(1 - q), L = clamp(-nx * 0.55 - ny * 0.6 + nz * 0.6); return RGB(ramp(pal, clamp(0.2 + L * 0.85 - (q > 0.85 ? 0.15 : 0)), i, j)); });
  if (r > 5) { pcircle(x - r * 0.35, y - r * 0.4, Math.max(1, Math.round(r * 0.18)), '#fff8f0'); }
}
// the egg: a big coral sphere with a glowing zona ring and a crown of small cells
function egg(cx, cy, R, t, o = {}) {
  pglow(cx, cy, R, R * 1.5, '#ff8a6a', 0.35);
  for (let k = 0; k < 30; k++) { const a = k / 30 * 6.283 + t * 0.05, d = R * 1.12 + Math.sin(k * 3 + t) * R * 0.04; cell(cx + Math.cos(a) * d, cy + Math.sin(a) * d, Math.round(R * 0.13), {}); }   // the corona
  pfield(cx - R - 1, cy - R - 1, 2 * R + 3, 2 * R + 3, (i, j) => { const nx = (i - cx) / R, ny = (j - cy) / R, q = nx * nx + ny * ny; if (q > 1) return null; const nz = Math.sqrt(1 - q), L = clamp(-nx * 0.5 - ny * 0.55 + nz * 0.65), n = fbm(nx * 3 + 4, ny * 3 + t * 0.05, 31, 3); return RGB(ramp(CELLP, clamp(0.25 + L * 0.6 + (n - 0.5) * 0.3), i, j)); });
  pcircle(cx, cy, R + 2, o.zona ?? '#ffd0b8', { ring: 2 });
}

// =====================================================================
//  1–3: the race down the tunnel. You hold the frame (yellow tail); rivals stream around; then they drop back
// =====================================================================
function youPos(t) { return [VPX + Math.sin(t * 1.3) * 6, 470 + Math.sin(t * 0.9) * 4]; }
function raceScene(t, o = {}) {
  const f = docFloat(2, 1.5);
  spaceFrame(() => {
    tunnel(t, { speed: o.speed ?? 1, vx: VPX + f.dx, vy: VPY + f.dy });
    race(t, o.n ?? 160);
    const [x, y] = youPos(t); sperm(x + f.dx, y + f.dy, -Math.PI / 2 + Math.sin(t * 1.3) * 0.08, 2.0, t, 0, { you: true });
  }, { mosaic: mosaicAt(o.mos ?? {}) });
}
function sceneTitle() { raceScene(TT, { mos: { in: false }, n: 120 }); spCaptions(); }
function sceneRace() {
  const t = TT; raceScene(t, { n: 200 });
  const [x, y] = youPos(t); docLabel('TÚ', x * 3 + 60, y * 3 - 10, { at: 4.9, fg: YOU, scale: 2 });
  if (t >= CU.rivals) hud('RIVALES', fmtN(250e6), { col: '#eef0ea', y: 172 });
  spCaptions();
}
function sceneLost() {
  const t = TT; raceScene(t, { n: 200 });
  hud('RIVALES', fmtN(rivalsAt(t)), { col: '#eef0ea', y: 172 });
  docLabel('CANSADOS', 150, 1300, { at: CU.tired + 0.2, until: 15.9, fg: '#c8b8c8' });
  docLabel('ATASCADOS', 860, 820, { at: CU.stuck + 0.1, until: 15.9, fg: '#c8b8c8', align: 'right' });
  docLabel('AL REVÉS', 540, 1180, { at: CU.wrong + 0.2, until: 15.9, fg: HOT, align: 'center' });
  spCaptions();
}
// ---- 4: the egg looms at the end of the tunnel; a few hundred left
function sceneFew() {
  const t = TT, f = docFloat(4, 1.5), u = EZ.io(clamp((t - 16) / 3)), R = 20 + 70 * u;
  spaceFrame(() => {
    tunnel(t, { speed: 0.6, glow: 0.9, vx: VPX + f.dx, vy: VPY + f.dy });
    egg(VPX + f.dx, VPY + f.dy - 10 * u, R, t);
    for (let k = 0; k < 40; k++) { const r = RNG('few', k), a = r.f() * 6.283, d = R * 1.3 + 40 + r.f() * 120 * (1 - u); sperm(VPX + Math.cos(a) * d + f.dx, VPY + Math.sin(a) * d + f.dy, a + Math.PI, 0.55, t, k); }
    const [x, y] = youPos(t); sperm(x + f.dx, y + f.dy, -Math.PI / 2, 1.3, t, 0, { you: true });
  }, { mosaic: mosaicAt() });
  hud('EN EL ÓVULO', '≈ ' + fmtN(rivalsAt(t)), { col: '#eef0ea' });
  docLabel('ÓVULO', VPX * 3, (VPY - R - 30) * 3 - 30, { at: CU.egg + 0.4, fg: CORAL, align: 'center', scale: 2 });
  spCaptions();
}
// ---- 5–6: digging in: the egg's surface fills the top; hundreds of heads push into the coat; you dive through
function surface(t, f, push) {
  const cx = VPX + f.dx, cy = -260 + f.dy, R = 480;
  pfill('#2a0618');
  pfield(0, 0, SW, SH, (i, j) => { const d = Math.hypot(i - cx, j - cy); if (d > R + 40) { const n = fbm(i * 0.02, j * 0.02 + t * 0.1, 5, 2); return RGB(ramp(FLESH, 0.15 + n * 0.3, i, j)); } if (d > R) return RGB(ramp(['#ffd0b8', '#ffb8a0', '#e88870'], (R + 40 - d) / 40, i, j)); const n = fbm(i * 0.03 + 5, j * 0.03 + t * 0.05, 31, 3); return RGB(ramp(CELLP, clamp(0.45 + (n - 0.5) * 0.4 - (R - d) / 900), i, j)); });
  for (let k = 0; k < 18; k++) { const a = Math.PI / 2 + (k - 9) * 0.075, d = R + 52; cell(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 13, {}); }
  for (let k = 0; k < 70; k++) {   // heads stuck in the coat, tails out
    const r = RNG('dig', k), a = Math.PI / 2 + (r.f() - 0.5) * 1.3, d = R + 18 + r.f() * 20 - push * r.f() * 6, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    if (y > SH + 10 || x < -10 || x > SW + 10) continue; sperm(x, y, a + Math.PI, 0.6 + r.f() * 0.3, t, k, { amp: 1.3 });
  }
  return [cx, cy, R];
}
function sceneDig() {
  const t = TT, f = docFloat(5, 1.2); let you = [0, 0];
  spaceFrame(() => { const [cx, cy, R] = surface(t, f, clamp((t - 19) / 3)); you = [cx, cy + R + 60 - (t - 19) * 6]; sperm(you[0], you[1], -Math.PI / 2, 1.2, t, 0, { you: true, amp: 1.5 }); }, { mosaic: mosaicAt({ out: false }) });
  hud('EN EL ÓVULO', '≈ 300', { col: '#eef0ea' });
  spCaptions();
}
function sceneThrough() {
  const t = TT, f = docFloat(6, 1.2), u = EZ.i3(clamp((t - CU.through) / 1.0)), sh = Math.round(Math.sin(t * 60) * u * 2);
  spaceFrame(() => {
    pshift(sh, 0, () => { const [cx, cy, R] = surface(t, f, 1); const y = cy + R + 42 - u * 70; sperm(cx, y, -Math.PI / 2, 1.2 + u * 0.6, t, 0, { you: true, amp: 2 }); if (u > 0.6) pglow(cx, cy + R, 3, 30 * u, YOU, 0.6 * u); });
  }, { mosaic: mosaicAt({ in: false, out: false }) });
  hud('EN EL ÓVULO', '≈ 300', { col: '#eef0ea' });
  spCaptions();
}
function sceneHush() { spaceFrame(() => { pfill('#0a0206'); pglow(VPX, 300, 1, 8, YOU, 0.4); pset(VPX, 300, YOU); }); }

// =====================================================================
//  8: TÚ. Inside the egg: a flash, your nucleus (blue) in the middle; the seal: a bright wave runs round the coat and
//  the late ones bounce off and drift away
// =====================================================================
function insideEgg(cx, cy, R, t) {
  pglow(cx, cy, R, R * 1.35, '#ff8a6a', 0.35);
  pfield(cx - R - 1, cy - R - 1, 2 * R + 3, 2 * R + 3, (i, j) => { const nx = (i - cx) / R, ny = (j - cy) / R, q = nx * nx + ny * ny; if (q > 1) return null; const n = fbm(nx * 4 + 2, ny * 4 + t * 0.08, 33, 3); return RGB(ramp(['#e86a4a', '#ff9a72', '#ffc098', '#ffe0c8'], clamp(0.35 + (1 - q) * 0.35 + (n - 0.5) * 0.4), i, j)); });
  pcircle(cx, cy, R + 3, '#ffd0b8', { ring: 3 }); pcircle(cx, cy, R + 6, '#c06a5a', { ring: 1 });
}
function sceneSeal() {
  const t = TT, f = docFloat(8, 1.2), h = t - CU.hit, cx = VPX + f.dx, cy = 300 + f.dy, R = 120, w = clamp((t - CU.seal - 1.0) / 1.4);
  spaceFrame(() => {
    pfill('#1a0410'); for (let k = 0; k < 60; k++) { const r = RNG('bg', k); pglow(r.i(0, SW), r.i(0, SH), 1, 6 + r.i(0, 10), '#3a0a20', 0.4); }
    if (h < 0.1) { pfill('#fff4e0'); return; }
    insideEgg(cx, cy, R, t);
    const nr = 9 + Math.sin(t * 3) * 0.6; pglow(cx, cy, nr, nr * 2.4, '#5ab8ff', 0.45); cell(cx, cy, Math.round(nr), { pal: ['#0a2a6a', '#1a4ab0', '#3a7ae0', '#7ab8ff', '#c8e4ff', '#ffffff'] });
    if (w > 0) { const a0 = -Math.PI / 2, span = w * Math.PI; for (let a = -span; a <= span; a += 0.01) { const x = cx + Math.cos(a0 + a) * (R + 3), y = cy + Math.sin(a0 + a) * (R + 3); pset(x, y, '#ffffff'); pset(x + Math.cos(a0 + a) * 2, y + Math.sin(a0 + a) * 2, YOU); }
      if (w < 1) { for (const s of [-1, 1]) { const a = a0 + s * span; pglow(cx + Math.cos(a) * (R + 3), cy + Math.sin(a) * (R + 3), 2, 12, '#ffffff', 0.8); } } }
    for (let k = 0; k < 16; k++) {   // the late ones, outside, bouncing off once the coat is sealed
      const r = RNG('late', k), a = r.f() * 6.283, bounce = clamp((t - (CU.seal + 1.0 + Math.abs(((a + Math.PI / 2 + Math.PI) % 6.283) - Math.PI) / Math.PI * 1.4)) / 1.5), d = R + 16 + bounce * 90;
      sperm(cx + Math.cos(a) * d, cy + Math.sin(a) * d, a + Math.PI + bounce * 2.5, 0.7, t, k, { amp: 1 - bounce * 0.6 });
    }
    if (h < 0.7) pcircle(cx, cy, Math.round(12 + h * 260), '#ffffff', { ring: 2 });
  }, { mosaic: mosaicAt({ in: false }) });
  docLabel('TÚ', cx * 3, (cy - 40) * 3, { at: CU.hit + 0.15, fg: YOU, align: 'center', scale: 3 });
  if (t >= CU.closed) docStamp('SELLADO', 540, (cy + R + 40) * 3, { at: CU.closed + 0.3, fg: CORAL, scale: 2 });
  if (t < CU.closed + 0.3) hud('GANADOR', 1, { y: 222 });
  spCaptions();
}

// =====================================================================
//  9: divisions 1 → 2 → 4 → 8 → 16 inside the coat, each split on a spring; DÍA and CÉLULAS
// =====================================================================
function cellsAt(t, cx, cy, R0) {
  let C = [[cx, cy, R0]];
  for (let L = 0; L < 4; L++) {
    const ts = CU.div[L]; if (t < ts) break; const p = clamp(springMove(ts, 0, 1, SPRING.snappy), 0, 1.15), ax = [[1, 0], [0, 1], [0.7, 0.7], [0.7, -0.7]][L];
    const N = []; C.forEach(([x, y, r], i) => { const r2 = r * 0.8, off = r * 0.55 * p, sg = i % 2 ? 1 : -1, aa = [ax[0] * sg + (L > 1 ? Math.cos(i * 2.4) * 0.4 : 0), ax[1] + (L > 1 ? Math.sin(i * 2.4) * 0.4 : 0)];
      const nn = Math.hypot(aa[0], aa[1]) || 1; N.push([x + aa[0] / nn * off, y + aa[1] / nn * off, r2]); N.push([x - aa[0] / nn * off, y - aa[1] / nn * off, r2]); });
    // pull the cluster back inside the coat
    C = N.map(([x, y, r]) => { const d = Math.hypot(x - cx, y - cy), lim = 92 - r; return d > lim ? [cx + (x - cx) * lim / d, cy + (y - cy) * lim / d, r] : [x, y, r]; });
  }
  return C;
}
function sceneDivide() {
  const t = TT, f = docFloat(9, 1.2), cx = VPX + f.dx, cy = 300 + f.dy, n = 2 ** cnt(CU.div, t), day = [1, 1, 2, 3, 4][cnt(CU.div, t)];
  spaceFrame(() => {
    pfill('#1a0410'); for (let k = 0; k < 60; k++) { const r = RNG('bg', k); pglow(r.i(0, SW), r.i(0, SH), 1, 6 + r.i(0, 10), '#3a0a20', 0.4); }
    pglow(cx, cy, 100, 140, '#ff8a6a', 0.25); pfield(cx - 104, cy - 104, 210, 210, (i, j) => { const d = Math.hypot(i - cx, j - cy); return d < 102 ? RGB(d > 98 ? '#ffd0b8' : ramp(['#3a0a1a', '#5a1428', '#7a2034'], 0.5 + 0.3 * Math.sin(d * 0.2 + t), i, j)) : null; });
    const C = cellsAt(t, cx, cy, 60); C.sort((a, b) => a[1] - b[1]).forEach(([x, y, r]) => { docShadow(x + 3, y + r * 0.8, r * 0.8, r * 0.25, 0.3); cell(x, y, Math.round(r)); });
    const last = CU.div.filter((x) => t >= x).pop() ?? -9; if (t - last < 0.2) pcircle(cx, cy, 104, '#ffffff', { ring: 1 });
  }, { mosaic: mosaicAt() });
  hud('DÍA', day, { col: CREAM, l2: ['CÉLULAS', n, CORAL], y: 196 });
  spCaptions();
}
// ---- 10: the hollow ball (a ring of cells around a hollow + an inner cluster); it drifts down into the warm wall
function sceneBall() {
  const t = TT, f = docFloat(10, 1.2), d = EZ.io(clamp((t - CU.nest) / 1.8)), cx = VPX + f.dx, cy = 260 + 140 * d + f.dy, wallY = 600 - 160 * EZ.io(clamp((t - 37) / 2.5));
  spaceFrame(() => {
    pfill('#1a0410');
    pfield(0, 0, SW, SH, (i, j) => { const top = wallY + Math.sin(i * 0.05 + t) * 8 + fbm(i * 0.03, 1, 6, 2) * 14; if (j < top) return null; const n = fbm(i * 0.04, j * 0.04 + t * 0.1, 8, 3); return RGB(ramp(FLESH, clamp(0.45 + (n - 0.5) * 0.5 + (j - top < 4 ? 0.3 : 0)), i, j)); });
    for (let k = 0; k < 7; k++) { const x0 = k * 55 + 10; for (let q = 0; q < 60; q++) pset(x0 + Math.sin(q * 0.2 + k) * 8, wallY + 20 + q * 2.5, '#5a0c22'); }   // vessels
    pcircle(cx, cy, 64, '#ffd0b8', { ring: 2 });
    for (let k = 0; k < 26; k++) { const a = k / 26 * 6.283 + t * 0.1; cell(cx + Math.cos(a) * 54, cy + Math.sin(a) * 54, 9); }
    for (let k = 0; k < 9; k++) { const r = RNG('icm', k); cell(cx - 18 + r.n(12), cy - 26 + r.n(8), 8); }
    if (d > 0.9) for (let k = 0; k < 10; k++) { const a = Math.PI * 0.2 + k * 0.07 * Math.PI; pset(cx + Math.cos(a) * 70, cy + Math.sin(a) * 70, '#ff5a6a'); }   // taking hold
  }, { mosaic: mosaicAt() });
  hud('DÍA', t < CU.nest ? 5 : Math.min(9, 5 + Math.floor((t - CU.nest) * 1.5)), { col: CREAM, l2: ['', t < CU.nest ? 'ESFERA HUECA' : 'IMPLANTÁNDOSE', CORAL], y: 196 });
  docLabel('ÚTERO', 120, wallY * 3 + 300, { at: 38.0, fg: ROSE });
  spCaptions();
}

// =====================================================================
//  11–12: the embryo with a beating heart (a loupe), then the fetus growing week by week on its cord
// =====================================================================
function fetus(cx, cy, s, t, o = {}) {   // a curled baby, s = height in px; o.emb (0..1): embryo-like (big head, tail)
  const emb = o.emb ?? 0, sk = ['#a0404a', '#d8706a', '#f0a088', '#ffc8a8', '#ffe8d8'], hr = s * (0.26 + emb * 0.08), bx = cx + s * 0.02, by = cy + s * 0.12;
  // the cord
  for (let q = 0; q < 80; q++) { const u = q / 80, x = lerp(cx + s * 0.05, cx + 160, u) + Math.sin(u * 9 + t * 2) * 6, y = lerp(by + s * 0.05, cy - 300, u * u); pset(x, y, q % 4 ? '#c8304a' : '#ff6a7a'); pset(x + 1, y, '#8a1a30'); }
  const blob = (x, y, rx, ry, rot) => pfield(x - Math.max(rx, ry) - 1, y - Math.max(rx, ry) - 1, 2 * Math.max(rx, ry) + 3, 2 * Math.max(rx, ry) + 3, (i, j) => { const dx = i - x, dy = j - y, u = (dx * Math.cos(rot) + dy * Math.sin(rot)) / rx, v = (-dx * Math.sin(rot) + dy * Math.cos(rot)) / ry, q = u * u + v * v; if (q > 1) return null; const L = clamp(-u * 0.5 - v * 0.6 + Math.sqrt(1 - q) * 0.6); return RGB(ramp(sk, clamp(0.25 + L * 0.8), i, j)); });
  blob(bx, by, s * 0.24, s * (0.34 - emb * 0.06), -0.35);   // body
  if (emb > 0.5) for (let q = 0; q < s * 0.2; q++) pset(bx + s * 0.05 + Math.sin(q * 0.3) * 2, by + s * 0.3 + q * 0.5, sk[2]);   // embryo tail
  if (emb < 0.5) { blob(bx - s * 0.12, by + s * 0.22, s * 0.16, s * 0.08, 0.5); blob(bx + s * 0.02, by + s * 0.3, s * 0.15, s * 0.07, -0.2); blob(bx - s * 0.16, by - s * 0.02, s * 0.06, s * 0.15, 0.3); }   // legs, arm
  blob(cx - s * 0.08, cy - s * 0.22, hr, hr * 0.95, 0);   // head
  if (s > 30) { const ex = cx - s * 0.16, ey = cy - s * 0.22; prect(ex, ey, Math.max(2, s * 0.05), 1, '#5a2a2a'); if (emb < 0.5) prect(cx - s * 0.2, cy - s * 0.12, Math.max(1, s * 0.03), 1, '#c05a5a'); pcircle(cx - s * 0.2, cy - s * 0.16, Math.max(1, Math.round(s * 0.035)), '#ff9a9a'); }
}
const beatK = (t) => { const p = mod(t - 0.0, 0.5) / 0.5; return p < 0.12 ? 1 : p < 0.25 ? 0.4 : p < 0.32 ? 0.75 : 0; };
function sceneHeart() {
  const t = TT, f = docFloat(11, 1.2), ir = irisR(CU.beat - 0.3, 64), cx = 150 + f.dx, cy = 260 + f.dy, on = t >= CU.beat - 0.3, k = on ? beatK(t) : 0;
  spaceFrame(() => {
    pfill('#2a0618'); pfield(0, 0, SW, SH, (i, j) => { const n = fbm(i * 0.02, j * 0.02 + t * 0.05, 9, 3); return RGB(ramp(FLESH, clamp(0.3 + n * 0.35 + 0.1 * Math.sin((i + j) * 0.05)), i, j)); });
    pglow(cx, cy, 30, 110, '#ff6a7a', 0.25 + 0.2 * k);
    fetus(cx, cy, 70, t, { emb: 1 });
    const hx = cx + 2, hy = cy + 6; pglow(hx, hy, 2, 8 + 8 * k, '#ff2a4a', 0.5 + 0.4 * k); pcircle(hx, hy, Math.round(3 + 2 * k), '#ff2a4a');
    if (ir > 3) docIris(262, 200, ir, (x, y, r) => {   // the loupe: a tiny heart, pumping
      pfill('#3a0818'); for (let q = 0; q < 30; q++) { const rr = RNG('hb', q); pglow(x + rr.n(r), y + rr.n(r), 1, 8, '#6a1028', 0.5); }
      const s = r * (0.42 + 0.1 * k); pcircle(x - s * 0.35, y - s * 0.2, Math.round(s * 0.45), '#d81a3a'); pcircle(x + s * 0.35, y - s * 0.2, Math.round(s * 0.45), '#d81a3a'); ppoly([[x - s * 0.78, y - s * 0.05], [x + s * 0.78, y - s * 0.05], [x, y + s * 0.8]], '#d81a3a');
      pcircle(x - s * 0.45, y - s * 0.35, Math.round(s * 0.15), '#ff7a8a'); if (k > 0.7) pcircle(x, y, Math.round(s * 1.1), '#ffffff', { ring: 1 });
    });
    if (k > 0.7 && on) pline(hx, hy, 262 - 45, 200 + 45, '#ff6a7a');
  }, { mosaic: mosaicAt() });
  hud('DÍA', on ? 22 : 21, { col: CREAM, l2: ['', on ? 'LATIDO' : '', HOT], y: 196 });
  spCaptions();
}
function sceneGrow() {
  const t = TT, f = docFloat(12, 1.2), wk = at(CU.week.concat([[50.65, 38]]), t), s = lerp(60, 200, clamp((wk - 7) / 31)), cy = 290 + f.dy, k = beatK(t);
  spaceFrame(() => {
    pfill('#2a0618'); pfield(0, 0, SW, SH, (i, j) => { const n = fbm(i * 0.015, j * 0.015 + t * 0.04, 9, 3), d = Math.hypot(i - 180, j - 300) / 300; return RGB(ramp(FLESH, clamp(0.55 - d * 0.35 + (n - 0.5) * 0.4), i, j)); });
    pglow(180, 300, 60, 260, '#ff8a7a', 0.25);
    fetus(180 + f.dx, cy, s, t, { emb: clamp(1 - (wk - 7) / 6) });
    pglow(180 + f.dx, cy + s * 0.1, 2, 4 + 4 * k, '#ff2a4a', 0.4 * k);
  }, { mosaic: mosaicAt({ out: false }) });
  hud('SEMANA', Math.round(wk), { col: CREAM, y: 214 });
  spCaptions();
}
// ---- 13: one among 250 million: a field of white dots fades away, the yellow one stays and grows
function sceneOne() {
  const t = TT, f = docFloat(13, 1.2), u = clamp((t - 52.6) / 1.6), g = EZ.o3(clamp((t - 53.6) / 1.2));
  spaceFrame(() => {
    pfill('#14020c');
    for (let k = 0; k < 2400; k++) { const r = RNG('dot', k); if (r.f() < u) continue; pset(r.i(0, SW) + f.dx * 0.5, r.i(0, SH) + f.dy * 0.5, k % 3 ? '#c8b8c8' : '#7a6a80'); }
    const x = VPX + f.dx, y = 300 + f.dy; pglow(x, y, 1, 8 + 30 * g, YOU, 0.6); sperm(x, y, -Math.PI / 2, 0.4 + 1.4 * g, t, 0, { you: true });
  }, { mosaic: mosaicAt({ in: false }) });
  hud('1 ENTRE', '250.000.000', { col: '#eef0ea', lc: YOU, y: 214 });
  spCaptions();
}
function sceneEnd() {
  const t = TT, f = docFloat(14, 1.2);
  spaceFrame(() => {
    pfill('#2a0618'); pfield(0, 0, SW, SH, (i, j) => { const n = fbm(i * 0.015, j * 0.015 + t * 0.04, 9, 3), d = Math.hypot(i - 180, j - 360) / 300; return RGB(ramp(FLESH, clamp(0.55 - d * 0.35 + (n - 0.5) * 0.4), i, j)); });
    pglow(180, 360, 60, 240, '#ff8a7a', 0.3);
    fetus(180 + f.dx, 380 + f.dy, 190, t, {});
  });
  spCaptions();
}

const SCENES = { title: sceneTitle, race: sceneRace, lost: sceneLost, few: sceneFew, dig: sceneDig, through: sceneThrough, hush: sceneHush, seal: sceneSeal,
  divide: sceneDivide, ball: sceneBall, heart: sceneHeart, grow: sceneGrow, one: sceneOne, end: sceneEnd };
