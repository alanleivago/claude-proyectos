// =====================================================================
//  BEATS — ¿cómo se forma una galaxia? Helpers (a particle galaxy, the cosmic web, the clock HUD) then one function per shot.
//  Everything is drawn at 360x640; the galaxy is ~1500 seeded stars whose layout blends between messy clumps,
//  a thick blob, a flat disk with two log-spiral arms and a round elliptical.
// =====================================================================
const GX = 180, GY = 300;
const angD = (a, b) => { let d = (a - b) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return d; };
const at = (T, t) => { if (t <= T[0][0]) return T[0][1]; for (let i = 1; i < T.length; i++) if (t <= T[i][0]) { const [a, va] = T[i - 1], [b, vb] = T[i]; return va + (vb - va) * EZ.io((t - a) / (b - a)); } return T[T.length - 1][1]; };
const gauss = (r, sd) => sd * Math.sqrt(-2 * Math.log(1 - r.f() * 0.999)) * Math.cos(6.283 * r.f());
const cnt = (L, t) => L.filter((x) => t >= x).length;

// ---- star colours by radius: a gold core, white middle, blue arms
const SC_CORE = ['#fffbe8', '#ffe6a0', '#ffd27a'], SC_MID = ['#fff0d0', '#f0eef8', '#e8e0c8'], SC_ARM = ['#c8d8ff', '#9ab8ff', '#b8ccff'], SC_OUT = ['#7a9cf0', '#5a70c8', '#8aa8f8'];
function starCol(rr, r, warm = 0) {
  const pal = rr < 0.1 ? SC_CORE : rr < 0.28 ? (warm > 0.5 ? SC_CORE : SC_MID) : rr < 0.62 ? (warm > 0.7 ? SC_MID : SC_ARM) : (warm > 0.85 ? SC_MID : SC_OUT);
  return pal[Math.floor(r * pal.length) % pal.length];
}
// a point on the disk (rr 0..1 of R, angle th) → screen, with the galaxy's flattening and tilt
function galP(cx, cy, R, rr, th, o = {}) {
  const flat = o.flat ?? 0.5, tilt = o.tilt ?? -0.3, x = Math.cos(th) * rr * R, y = Math.sin(th) * rr * R * flat;
  return [cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)];
}
// o: n, seed, arms 0..1, flat, tilt, ell 0..1 (elliptical), mess 0..1 (clumps), spin, rot, bright 0..1, tide 0..1 (tidal stretch), warm
function galaxy(cx, cy, R, t, o = {}) {
  const n = o.n ?? 2600, seed = o.seed ?? 1, arms = o.arms ?? 1, flat = o.flat ?? 0.5, tilt = o.tilt ?? -0.3, ell = o.ell ?? 0, mess = o.mess ?? 0, br = o.bright ?? 1, tide = o.tide ?? 0;
  const rot = (o.rot ?? 0) + t * (o.spin ?? 0.16), ct = Math.cos(tilt), st = Math.sin(tilt);
  if (br > 0.05) {
    pglow(cx, cy, R * 0.04, R * (0.42 + 0.25 * ell), o.glow ?? '#a87838', 0.45 * br);
    pglow(cx, cy, 1, R * 0.16, '#ffe6a0', 0.7 * br);
  }
  const P = (x, y) => [cx + x * ct - y * st, cy + x * st + y * ct];
  // diffuse light: the disk's unresolved stars, brightest along the two arms
  if (br > 0.05) { const ext = R * 1.15, GL = ['#141838', '#1e2858', '#2c3c80', '#40569e', '#6070b0', '#8a7a8a', '#b09070'];
    pfield(cx - ext, cy - ext, 2 * ext, 2 * ext, (i, j) => {
      const dx = i - cx, dy = j - cy, x = dx * ct + dy * st, y = (-dx * st + dy * ct) / Math.max(0.2, lerp(flat, 0.8, ell)), rr = Math.hypot(x, y) / R; if (rr > 1.1) return null;
      const th = Math.atan2(y, x) - rot, a0 = -Math.log(rr + 0.05) * 2.2, am = Math.min(Math.abs(angD(th, a0)), Math.abs(angD(th, a0 + Math.PI))) / 0.5, arm = Math.exp(-am * am);
      const n = fbm(x * 0.05, y * 0.05, seed + 9, 2), core = Math.exp(-rr * 6);
      const v = ((arm * arms + (1 - arms) * 0.55) * Math.exp(-rr * 2.6) * (0.75 + n * 0.5) * (1 - mess * 0.6) + core * 0.9) * br;
      return v < 0.08 ? null : [...RGB(ramp(GL, clamp(v * 1.1 + core * 0.4), i, j)), clamp(v * 2.2)];
    }); }
  // dust lanes: dark specks on the inner edge of each arm
  if (arms > 0.3 && ell < 0.5) for (let k = 0; k < n * 0.3 * br; k++) {
    const r = RNG('dust', seed, k), rr = 0.12 + r.f() * 0.6, th = (k % 2) * Math.PI - Math.log(rr + 0.05) * 2.2 - 0.32 + r.n(0.12) + rot;
    const [px, py] = P(Math.cos(th) * rr * R, Math.sin(th) * rr * R * flat); if ((k + B) % 5) pset(px, py, k % 3 ? '#1c1424' : '#3a2418');
  }
  const N = Math.round(n * Math.min(1, br * 1.5));
  for (let k = 0; k < N; k++) {
    const r = RNG('gx', seed, k);
    let rr = Math.min(1.08, -Math.log(1 - r.f() * 0.97) / 3.1);
    const th0 = (k % 2) * Math.PI - Math.log(rr + 0.05) * 2.2 + r.n(0.22 + 0.3 * rr), free = r.f() * Math.PI * 2;
    let th = free + angD(th0, free) * arms + rot * (1 + 0.25 * (1 - arms) * (1 - rr));
    if (tide) { th += tide * rr * rr * 2.6; rr *= 1 + tide * rr * rr * 1.6; }
    let x = Math.cos(th) * rr * R, y = Math.sin(th) * rr * R * flat + r.n(R * 0.035 * (1 + 2.5 * (1 - rr))) * (1 - flat * 0.6);
    if (mess) { const c = RNG('clump', seed, k % 5), a = c.f() * 6.283 + t * 0.4 * (k % 5 + 1) * 0.3, d = (k % 5 ? 0.25 + c.f() * 0.35 : 0) * R;
      x = lerp(x, Math.cos(a) * d + gauss(r, R * 0.14), mess); y = lerp(y, Math.sin(a) * d * 0.8 + gauss(r, R * 0.14), mess); }
    if (ell) { const ex = gauss(r, R * 0.3), ey = gauss(r, R * 0.24); x = lerp(x, ex, ell); y = lerp(y, ey, ell); }
    const [px, py] = P(x, y), rx = Math.round(px), ry = Math.round(py);
    if (rx < -2 || ry < -2 || rx > SW + 2 || ry > SH + 2) continue;
    const c = (k % 29 === 0 && rr > 0.3 && ell < 0.5) ? (o.pink ?? '#ff7ab0') : starCol(Math.hypot(x, y) / R * (1 - 0.4 * ell), r.f(), (o.warm ?? 0) + ell * 0.6);
    pset(rx, ry, c);
    if (k % 7 === 0 && Math.hypot(x, y) < R * 0.35) pset(rx + 1, ry, c);
    if (k % 41 === 0) { if ((B + k) % 19 < 2) sprite(SPR.twinkle, { a: '#8090d0', b: '#ffffff' }, rx - 1, ry - 1); else prect(rx, ry, 2, 2, c); }
  }
  // the bright bulge on top
  if (br > 0.05) pfield(cx - R * 0.45, cy - R * 0.45, R * 0.9, R * 0.9, (i, j) => { const d = Math.hypot(i - cx, (j - cy) / (0.75 + 0.25 * flat)) / (R * 0.1 * (1 + ell)); return d < 1 ? [...RGB(ramp(['#ffb860', '#ffd27a', '#ffe6a0', '#fffbe8'], 1 - d, i, j)), clamp((1 - d) * 1.6 * br)] : null; });
}

// ---- the background: three star layers with parallax, faint far galaxies, an optional dust band
function cosmos(cam, o = {}) {
  starfield(cam, { milky: o.milky });
  if (o.dim) return;
  for (let k = 0; k < 7; k++) {
    const r = RNG('far', k), x = mod(r.i(0, SW) + cam.dx * 0.35, SW + 40) - 20, y = mod(r.i(0, SH) + cam.dy * 0.35, SH + 40) - 20, a = r.f() * 3, s = 3 + r.i(0, 4);
    for (let q = 0; q < 14; q++) { const rr = RNG('farq', k, q), u = rr.n(1), v = rr.n(0.35); pset(x + u * s * Math.cos(a) - v * s * Math.sin(a), y + u * s * Math.sin(a) + v * s * Math.cos(a), q % 3 ? '#4a5a98' : '#8a8ac0'); }
    pset(x, y, '#c8b890');
  }
}

// ---- the clock HUD: a big number (billions of years after the Big Bang), or HOY / FUTURO
const fmtG = (v) => (v < 1 ? v.toFixed(2) : v.toFixed(1)).replace('.', ',');
function clockHud(o = {}) {
  pixDefer(() => lowres(DOC_TXT, () => {
    if (o.word) { docText(o.word, 90, 206, o.col ?? HOT, { align: 'center', scale: 3, outline: '#05060f' }); if (o.sub) docText(o.sub, 90, 234, '#eef0ea', { align: 'center', outline: '#05060f' }); if (o.sub2) docText(o.sub2, 90, 244, '#c8d0e8', { align: 'center', outline: '#05060f' }); return; }
    const v = at(CLOCK, TT);
    docText(fmtG(v), 90, 206, '#5ab8ff', { align: 'center', scale: 3, outline: '#05060f' });
    docText('MIL MILLONES DE AÑOS', 90, 231, '#eef0ea', { align: 'center', outline: '#05060f' });
    docText('DESDE EL BIG BANG', 90, 241, '#c8d0e8', { align: 'center', outline: '#05060f' });
    if (o.counter) { const [lab, val, col] = o.counter; docText(lab, 90, 172, '#eef0ea', { align: 'center', outline: '#05060f' }); docText(String(val), 90, 182, col ?? '#5ab8ff', { align: 'center', scale: 2, outline: '#05060f' }); }
  }));
}

// =====================================================================
//  1: the title. A spiral galaxy turns while the camera pushes in; big title; subtitle in amber
// =====================================================================
function sceneTitle() {
  const t = TT, f = docFloat(1, 2), z = 1 + 0.22 * EZ.io(clamp(t / 6.25));
  spaceFrame(() => {
    cosmos({ dx: f.dx * 3 + t * 2, dy: f.dy * 3 }, { milky: true });
    galaxy(GX + f.dx, 340 + f.dy, 160 * z, t, { arms: 1, flat: 0.42, tilt: -0.38, spin: 0.22, seed: 7, n: 3000 });
  }, { mosaic: mosaicAt({ in: false }) });
  docLabel('13.800 MILLONES DE AÑOS', 540, 1500 - 120, { at: 2.5, align: 'center' });
  docLabel('EN UN MINUTO', 540, 1500 - 70, { at: 4.9, align: 'center', fg: '#eef0ea' });
  spCaptions();
}

// =====================================================================
//  2: the Big Bang. A point of light, a white flash, a golden fireball that expands, cools and dims, sparks flying out
// =====================================================================
function sceneBang() {
  const t = TT, b = CU.bang, u = t - b, sh = u > 0 && u < 0.5 ? Math.round(Math.sin(u * 90) * 4 * (1 - u * 2)) : 0;
  const heat = u < 0 ? 0 : clamp(1 - u / 4.5), dimF = 1 - 0.6 * clamp((t - CU.nostar) / 1.2);
  spaceFrame(() => {
    pfill('#05060f');
    if (u < 0) {   // before: a single point that breathes
      const p = 1 + Math.sin(t * 9) * 0.5 + (t - 6.25) * 0.8; pglow(GX, GY, 1, 6 + p * 4, '#ffe6a0', 0.6); pcircle(GX, GY, 1 + Math.round(p * 0.6), '#ffffff');
      for (let k = 0; k < 40; k++) { const r = RNG('pre', k), a = r.f() * 6.283, d = 80 * (1 - mod(t * 0.5 + r.f(), 1)); pset(GX + Math.cos(a) * d, GY + Math.sin(a) * d, '#3a3a6a'); }
      return;
    }
    if (u < 0.09) { pfill('#fff8e0'); return; }
    pshift(sh, sh * 0.5, () => {
      const R = 30 + 520 * EZ.o3(clamp(u / 1.6)), cols = ['#05060f', '#2a140c', '#6a3414', '#b0601e', '#e8a040', '#ffd88a', '#fff6dc'];
      pfield(0, 0, SW, SH, (i, j) => {
        const d = Math.hypot(i - GX, j - GY) / R; if (d > 1.2) return null;
        const n = fbm(i * 0.02 + u * 0.3, j * 0.02 - u * 0.2, 11, 3), v = (clamp(1.1 - d) * (0.55 + heat * 0.6) + (n - 0.5) * 0.45) * dimF;
        return v < 0.06 ? null : RGB(ramp(cols, clamp(v * (0.55 + heat * 0.5)), i, j));
      });
      if (u < 0.8) pcircle(GX, GY, Math.round(30 + u * 420), u < 0.4 ? '#ffffff' : '#ffd88a', { ring: 2 });
      for (let k = 0; k < 360; k++) {   // sparks: hot gas flung outward, slowing, cooling to dim orange
        const r = RNG('spark', k), a = r.f() * 6.283, sp = 40 + r.f() * 260, d = sp * (1 - Math.exp(-u * 1.3)) + r.f() * 20;
        const x = GX + Math.cos(a) * d, y = GY + Math.sin(a) * d * 1.05; if ((B + k) % 9 === 0 && heat < 0.4) continue;
        pset(x, y, heat > 0.6 ? (k % 3 ? '#fff0b0' : '#ffd060') : heat > 0.25 ? (k % 3 ? '#ffb050' : '#ff8a3a') : (k % 3 ? '#a05a2a' : '#6a3a2a'));
        if (k % 6 === 0 && heat > 0.3) pset(x - Math.cos(a) * 2, y - Math.sin(a) * 2, '#a05a2a');
      }
    });
  }, { mosaic: mosaicAt() });
  if (u >= 0) clockHud();
  spCaptions();
}

// =====================================================================
//  3: the dark ages. Dim brown haze thinning to black, gas motes drifting in three depths; violet threads hint at the end
// =====================================================================
function sceneDark() {
  const t = TT, f = docFloat(3, 1.5), u = clamp((t - 12.75) / 3.5);
  spaceFrame(() => {
    pfill('#04040a');
    pfield(0, 0, SW, SH, (i, j) => { const v = fbm(i * 0.01 + t * 0.03, j * 0.012, 23, 3) * (1 - u * 0.75); return v > 0.42 ? [...RGB(v > 0.58 ? '#2a1a1c' : '#160e14'), (v - 0.42) * 4] : null; });
    for (let L = 0; L < 3; L++) for (let k = 0; k < 90; k++) {
      const r = RNG('mote', L, k), x = mod(r.i(0, SW) + t * (2 + L * 3) + f.dx * (L + 1), SW), y = mod(r.i(0, SH) - t * (1 + L) + f.dy * (L + 1), SH);
      pset(x, y, L === 2 ? '#5a5a80' : L === 1 ? '#3a3a58' : '#26263a');
    }
    const w = clamp((t - 16.0) / 1.5);   // the web, barely there
    if (w > 0) for (const [a, bb] of WEB_E) { const A = WEB_N[a], Bn = WEB_N[bb]; for (let s = 0; s < 1; s += 0.02) if ((s * 50 + B) % 3 < w * 2) pset(lerp(A[0], Bn[0], s), lerp(A[1], Bn[1], s), '#2a1a4a'); }
  }, { mosaic: mosaicAt() });
  clockHud();
  spCaptions();
}

// =====================================================================
//  4–5: the cosmic web. Violet filaments draw on between nodes (dark matter); blue gas drifts to them, then falls into the
//  nodes, which squeeze and ignite: the first stars (a counter). Shared by two shots.
// =====================================================================
const WEB_N = [[180, 300], [70, 150], [290, 130], [320, 300], [260, 460], [90, 450], [40, 290], [180, 170], [200, 560], [330, 560], [30, 560], [150, 60]];
const WEB_E = [[0, 7], [7, 1], [7, 2], [0, 3], [3, 2], [0, 4], [4, 9], [0, 5], [5, 6], [6, 1], [5, 10], [4, 8], [8, 5], [7, 11], [3, 9]];
const IGN = WEB_N.map((_, i) => CU.ignite + [0, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.15, 2.3, 2.45, 2.6][i]);
function webWorld(t, cam, o = {}) {
  const sx = (p) => [p[0] + cam.dx, p[1] + cam.dy];
  // filaments: draw-on with a bright head, thickness by a dithered halo
  WEB_E.forEach(([a, b], e) => {
    const p = clamp((t - (CU.web + e * 0.22)) / 0.9); if (p <= 0) return;
    const A = sx(WEB_N[a]), Bn = sx(WEB_N[b]), L = Math.hypot(Bn[0] - A[0], Bn[1] - A[1]), nx = -(Bn[1] - A[1]) / L, ny = (Bn[0] - A[0]) / L;
    for (let s = 0; s <= p; s += 1 / L) {
      const wob = Math.sin(s * 9 + e) * 5 + Math.sin(s * 23 + e * 2) * 2, x = lerp(A[0], Bn[0], s) + nx * wob, y = lerp(A[1], Bn[1], s) + ny * wob;
      pset(x, y, '#9a6aff'); if ((Math.round(x) + Math.round(y)) % 2 === 0) { pset(x + nx * 2, y + ny * 2, '#4a2a8a'); pset(x - nx * 2, y - ny * 2, '#4a2a8a'); }
      if (dhash(Math.round(s * L), e, 5) < 0.18) pset(x + nx * 3 * (dhash(e, Math.round(s * L), 6) - 0.5) * 2, y + ny * 3, '#2e1a5a');
    }
    if (p < 1) { const x = lerp(A[0], Bn[0], p), y = lerp(A[1], Bn[1], p); pglow(x, y, 1, 7, '#c8a0ff', 0.6); prect(x - 1, y - 1, 3, 3, '#ffffff'); }
  });
  // nodes: violet halos that tighten as the gas falls in
  WEB_N.forEach((n, i) => { const g = clamp((t - CU.web - 0.6) / 2), q = clamp((t - CU.fall) / 2.5), [x, y] = sx(n); if (g > 0) pglow(x, y, 2, (14 - 6 * q) * g + 2, '#7a4ac8', 0.55 * g); });
  // gas: 520 blue motes. Drift toward the web, then fall into the nearest node with a little swirl
  for (let k = 0; k < 520; k++) {
    const r = RNG('gas', k), hx = r.i(0, SW), hy = r.i(0, SH);
    let best = 0, bd = 1e9; WEB_N.forEach((n, i) => { const d = Math.hypot(n[0] - hx, n[1] - hy); if (d < bd) { bd = d; best = i; } });
    const N = WEB_N[best], fall = EZ.io(clamp((t - CU.fall - r.f() * 1.2) / 2.2)), drift = clamp((t - CU.web) / 6) * 0.25;
    const a0 = Math.atan2(hy - N[1], hx - N[0]) + fall * 1.6, d = bd * (1 - drift) * (1 - fall * 0.93);
    const x = N[0] + Math.cos(a0) * d + Math.sin(t * 0.7 + k) * 1.5 * (1 - fall) + cam.dx, y = N[1] + Math.sin(a0) * d + cam.dy;
    if (t >= IGN[best] + 0.3 && fall > 0.9) continue;   // swallowed by the new star
    pset(x, y, k % 4 ? '#5a7ad8' : '#9ab8ff');
  }
  // first stars: each node ignites (a flash ring, then a white star with a gold halo); a few companions after
  let stars = 0;
  WEB_N.forEach((n, i) => {
    const a = t - IGN[i]; if (a < 0) return; const [x, y] = sx(n);
    stars += 1 + Math.min(3, Math.floor(a / 0.6));
    if (a < 0.3) { pcircle(x, y, Math.round(3 + a * 50), '#ffffff', { ring: 1 }); pglow(x, y, 2, 20, '#ffffff', 0.7 * (1 - a / 0.3)); }
    pglow(x, y, 2, 10 + Math.sin(t * 5 + i) * 2, '#ffd27a', 0.5);
    prect(x - 1, y - 3, 3, 7, '#ffffff'); prect(x - 3, y - 1, 7, 3, '#ffffff'); prect(x - 1, y - 1, 3, 3, '#fff6dc');
    for (let c = 0; c < Math.min(3, Math.floor(a / 0.6)); c++) { const rr = RNG('comp', i, c), cx2 = x + rr.n(8), cy2 = y + rr.n(8); prect(cx2, cy2, 2, 2, c % 2 ? '#c8d8ff' : '#fff0b0'); if ((B + c + i) % 13 === 0) sprite(SPR.twinkle, { a: '#8090d0', b: '#ffffff' }, cx2 - 1, cy2 - 1); }
  });
  return stars * 3;
}
function sceneWeb() {
  const t = TT, f = docFloat(4, 1.5), z = (t - 17.5) * 0.6;
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2, dy: f.dy * 2 - z }, { dim: true });
    webWorld(t, { dx: f.dx, dy: f.dy });
  }, { mosaic: mosaicAt({ out: false }) });
  docLabel('(INVISIBLE)', 300 * 3, 560, { at: 19.9, fg: VIO, align: 'right' });
  clockHud();
  spCaptions();
}
function sceneStars() {
  const t = TT, f = docFloat(4, 1.5);
  let s = 0;
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2, dy: f.dy * 2 - (t - 17.5) * 0.6 }, { dim: true });
    s = webWorld(t, { dx: f.dx, dy: f.dy });
  }, { mosaic: mosaicAt({ in: false }) });
  clockHud(t >= CU.ignite ? { counter: ['ESTRELLAS', s] } : {});
  spCaptions();
}

// =====================================================================
//  6: small, messy galaxies crash and merge. The central one grows; satellites spiral in with tidal tails, each hit flashes
// =====================================================================
const MERGE = CU.merge;
function sceneSmall() {
  const t = TT, f = docFloat(6, 1.5), m = cnt(MERGE, t), z = 1 + 0.2 * EZ.io(clamp((t - 29.5) / 8));
  const lastHit = MERGE.filter((x) => t >= x).pop() ?? -9, h = t - lastHit, sh = h < 0.25 ? Math.round(Math.sin(h * 80) * 3) : 0;
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 + t * 1.5, dy: f.dy * 2 }, {});
    // far pairs also merging, for depth
    for (let k = 0; k < 3; k++) { const r = RNG('farpair', k), x = r.i(40, 320), y = [110, 520, 560][k], p = mod(t * 0.25 + k * 0.3, 1);
      galaxy(x - 12 * (1 - p), y, 7, t, { n: 70, seed: 50 + k, mess: 0.8, arms: 0, flat: 0.9, bright: 0.6 }); galaxy(x + 12 * (1 - p), y + 3, 5, t, { n: 50, seed: 60 + k, mess: 0.8, arms: 0, flat: 0.9, bright: 0.6 }); }
    pshift(sh, 0, () => {
      const R = (22 + m * 5.5 + (h < 0.6 ? 4 * (1 - h / 0.6) : 0)) * z;
      galaxy(GX + f.dx, GY + f.dy, R, t, { n: 260 + m * 140, seed: 3, mess: 0.75 - m * 0.04, arms: 0, flat: 0.92, tilt: 0, spin: 0.5, bright: 1 });
      MERGE.forEach((tm, i) => {   // satellites: in from a ring, spiralling, a tail of stripped stars behind
        const p = clamp((t - (tm - 1.8)) / 1.8); if (p <= 0 || p >= 1) return;
        const a = i * 2.4 + 1 + p * 2.2, d = (1 - p) * 230 + R * 0.3, x = GX + Math.cos(a) * d + f.dx, y = GY + Math.sin(a) * d * 0.9 + f.dy;
        for (let q = 1; q < 30; q++) { const aq = a - q * 0.03, dq = d + q * 3, rr = RNG('tail', i, q); pset(GX + Math.cos(aq) * dq + rr.n(2) + f.dx, GY + Math.sin(aq) * dq * 0.9 + rr.n(2) + f.dy, q % 3 ? '#5a70c8' : '#9ab8ff'); }
        galaxy(x, y, 9 + (i % 3) * 3, t, { n: 90, seed: 20 + i, mess: 0.8, arms: 0, flat: 0.9, tilt: 0, spin: 1, bright: 0.9 });
      });
      if (h >= 0 && h < 0.45) { pglow(GX, GY, 4, 50 * (1 - h / 0.45) + 10, '#ffffff', 0.6 * (1 - h / 0.45)); pcircle(GX, GY, Math.round(R + h * 140), '#ffd88a', { ring: 1 }); }
    });
  }, { mosaic: mosaicAt({ out: false }) });
  clockHud({ counter: ['GALAXIAS FUSIONADAS', m, '#ff8a4a'] });
  spCaptions();
}

// =====================================================================
//  7: spin flattens it into a disk; gravity draws spiral arms. The camera eases round; labels DISCO, BRAZOS
// =====================================================================
function sceneDisk() {
  const t = TT, f = docFloat(7, 1.5), u = EZ.io(clamp((t - CU.flat + 0.6) / 2.2)), a = EZ.io(clamp((t - 40.9) / 1.8)), R = 70 + 50 * EZ.io(clamp((t - 37.75) / 5));
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 + t * 3, dy: f.dy * 2 }, { milky: true });
    galaxy(GX + f.dx, GY + f.dy, R, t, { n: 1500, seed: 3, mess: 0.45 * (1 - u), arms: a, flat: lerp(0.95, 0.42, u), tilt: lerp(0, -0.38, u), spin: 0.5 - 0.25 * a, bright: 1 });
    if (t > 38.2 && t < 40.6) for (let k = 0; k < 3; k++) { const ang = t * 2.4 + k * 2.09; for (let q = 0; q < 14; q++) { const [x, y] = galP(GX + f.dx, GY + f.dy, R * 1.12, 1, ang + q * 0.05, { flat: lerp(0.95, 0.42, u), tilt: lerp(0, -0.38, u) }); pset(x, y, q > 10 ? '#ffffff' : '#f0b23c'); } }   // spin arrows
  }, { mosaic: mosaicAt({ in: false, out: false }) });
  docLabel('DISCO', 540 + 300, 300 * 3 - 150, { at: 40.0, until: 41.4, align: 'center' });
  docLabel('BRAZO', 540 + 280, 300 * 3 + 120, { at: 41.9, fg: BLU, align: 'center' });
  docLabel('BRAZO', 540 - 290, 300 * 3 - 170, { at: 42.2, fg: BLU, align: 'center' });
  clockHud();
  spCaptions();
}
// ---- 8: one second of near nothing: the core as a single gold point
function sceneHush() {
  spaceFrame(() => { pfill('#03030a'); pglow(GX, GY, 1, 5, '#ffd27a', 0.4); pset(GX, GY, '#ffe6a0'); });
}

// =====================================================================
//  9: the centre. A gilded loupe opens on the core: an accretion disk round a black shadow, a photon ring, stars on orbits
// =====================================================================
function blackHole(cx, cy, r, t) {
  pfill('#020208');
  for (let k = 0; k < 60; k++) { const q = RNG('bhs', k); pset(cx + q.n(r * 0.7), cy + q.n(r * 0.7), k % 4 ? '#3a3a5a' : '#8a8ab0'); }
  const sR = r * 0.24, dIn = r * 0.3, dOut = r * 0.78, fl = 0.28, tilt = -0.12;
  const disk = (front) => pfield(cx - dOut - 2, cy - dOut * 0.6, 2 * dOut + 4, dOut * 1.2, (i, j) => {
    const x = i - cx, y0 = j - cy, x2 = x * Math.cos(-tilt) - y0 * Math.sin(-tilt), y2 = x * Math.sin(-tilt) + y0 * Math.cos(-tilt), y = y2 / fl, d = Math.hypot(x2, y);
    if (d < dIn || d > dOut || (front ? y2 < 0 : y2 >= 0)) return null;
    const a = Math.atan2(y, x2), sw = fbm(Math.cos(a - t * 1.8 + d * 0.05) * 3 + 5, d * 0.08, 33, 3), dop = 0.5 - 0.4 * Math.cos(a);   // the approaching side is brighter
    const v = clamp((1 - (d - dIn) / (dOut - dIn)) * 0.8 + (sw - 0.5) * 0.7 + dop * 0.45);
    return v < 0.12 ? null : RGB(ramp(['#3a0e08', '#8a2a0c', '#d0601a', '#ff9a3a', '#ffd88a', '#fff6dc'], v, i, j));
  });
  disk(false);
  // the lensed far side: an arc of the disk bent over the top of the shadow
  for (let a = Math.PI * 1.02; a < Math.PI * 1.98; a += 0.01) { const rr = sR * 1.35 + Math.sin(a * 3 + t * 4) * 0.8; pset(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.92, (Math.round(a * 100) + B) % 4 ? '#ff9a3a' : '#ffd88a'); pset(cx + Math.cos(a) * (rr + 1), cy + Math.sin(a) * (rr + 1) * 0.92, '#8a2a0c'); }
  pcircle(cx, cy, Math.round(sR) + 2, '#ffd88a', { ring: 1 }); pcircle(cx, cy, Math.round(sR), '#000000');
  disk(true);
  // stars on orbits (S2 and friends): dotted ellipses, a star with a short trail
  [[0.62, 0.3, 0.4, 1.1], [0.5, 0.42, -0.9, 0.8], [0.72, 0.22, 2.0, 0.6]].forEach(([a, b, rotA, sp], k) => {
    for (let q = 0; q < 90; q += 2) { const th = q / 90 * 6.283; pset(cx + Math.cos(th) * a * r * Math.cos(rotA) - Math.sin(th) * b * r * Math.sin(rotA), cy + Math.cos(th) * a * r * Math.sin(rotA) + Math.sin(th) * b * r * Math.cos(rotA), '#2a3060'); }
    for (let q = 0; q < 6; q++) { const th = t * sp + k * 2 - q * 0.06, x = cx + Math.cos(th) * a * r * Math.cos(rotA) - Math.sin(th) * b * r * Math.sin(rotA), y = cy + Math.cos(th) * a * r * Math.sin(rotA) + Math.sin(th) * b * r * Math.cos(rotA); if (q === 0) { prect(x - 1, y - 1, 3, 3, '#ffffff'); pglow(x, y, 1, 5, '#9ab8ff', 0.5); } else pset(x, y, q < 3 ? '#9ab8ff' : '#4a5ab8'); }
  });
}
function sceneHole() {
  const t = TT, f = docFloat(9, 1.5), u = t - CU.hit, sh = u < 0.3 ? Math.round(Math.sin(u * 90) * 4) : 0, ir = irisR(CU.hit + 0.05, 120);
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 + t * 2, dy: f.dy * 2 }, { milky: true });
    pshift(sh, 0, () => galaxy(GX + f.dx, GY + f.dy, 150, t, { n: 1700, seed: 3, arms: 1, flat: 0.42, tilt: -0.38, spin: 0.25, rot: 0.6 }));
    pdither(0, 0, SW, SH, null, '#05060f', () => 0.35);
    if (u < 0.12) pfill('#fff6dc');
    if (ir > 3) docIris(GX + f.dx, GY + f.dy, ir, (cx, cy, r) => blackHole(cx, cy, r, t));
  }, { mosaic: mosaicAt({ in: false }) });
  docLabel('SAGITARIO A*', 540, 1240, { at: CU.sgr, align: 'center', scale: 2 });
  docLabel('≈ 4 MILLONES', 540, 1330, { at: CU.mass, align: 'center', fg: GOLD, scale: 2 });
  docLabel('DE SOLES', 540, 1400, { at: CU.mass + 0.2, align: 'center', fg: GOLD });
  if (t < CU.sgr) clockHud();
  spCaptions();
}

// =====================================================================
//  10: today. The Milky Way, almost face-on; the clock says HOY; on "aquí" the camera springs toward the Sun's arm
// =====================================================================
const SUN = { rr: 0.62, th: 2.9 };
function sceneToday() {
  const t = TT, f = docFloat(10, 1.5), zp = clamp(springMove(CU.here - 0.1, 0, 1, SPRING.smooth), 0, 1.1), o = { flat: 0.6, tilt: -0.25 }, R = 150 + 10 * EZ.io(clamp((t - 50.75) / 6));
  const rot = 0.6 + t * 0.12, sunTh = SUN.th - Math.log(SUN.rr + 0.05) * 2.2 + rot;
  const [sx0, sy0] = galP(GX, GY, R, SUN.rr, sunTh, o), z = 1 + 0.55 * zp, cx = GX + (GX - sx0) * (z - 1) * 0.8 + f.dx, cy = GY + (GY - sy0) * (z - 1) * 0.8 + f.dy;
  let sp = [0, 0];
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 + t * 2 - zp * 30, dy: f.dy * 2 - zp * 20 }, { milky: true });
    galaxy(cx, cy, R * z, t, { n: 1900, seed: 3, arms: 1, flat: o.flat, tilt: o.tilt, spin: 0.12, rot: 0.6 });
    sp = galP(cx, cy, R * z, SUN.rr, sunTh, o);
    if (t >= CU.here - 0.2) {   // the marker: a blinking amber box, a leader line
      const [x, y] = sp, s = 5 + (B % 4 < 2 ? 1 : 0);
      prect(x - s, y - s, 2 * s + 1, 1, AMB); prect(x - s, y + s, 2 * s + 1, 1, AMB); prect(x - s, y - s, 1, 2 * s + 1, AMB); prect(x + s, y - s, 1, 2 * s + 1, AMB);
      pset(x, y, '#ffffff'); pset(x + 1, y, '#ffe6a0');
      const p = clamp((t - CU.here) / 0.4); for (let q = 0; q < 34 * p; q++) pset(x + s + q * 0.4, y - s - q, AMB);
    }
  }, { mosaic: mosaicAt() });
  docLabel('TÚ ESTÁS AQUÍ', clamp(sp[0] * 3 + 60, 330, 750), sp[1] * 3 - 180, { at: CU.here + 0.4, align: 'center', scale: 2 });
  docLabel('EL SOL', sp[0] * 3, sp[1] * 3 + 40, { at: CU.here + 0.9, fg: '#eef0ea', align: 'center' });
  clockHud(t >= CU.today ? { word: 'HOY', sub: '13.800 MILLONES DE AÑOS' } : {});
  spCaptions();
}

// =====================================================================
//  11: Andromeda comes in from the top right, bigger and tilted; if they collide: tidal tails, a burst of new (pink)
//  stars, the cores circle in and merge into one round elliptical
// =====================================================================
function sceneAndro() {
  const t = TT, f = docFloat(11, 1.5), c = CU.collide, a = EZ.io(clamp((t - 57.0) / (c - 57.0))), m = clamp((t - c) / (CU.fuse - c)), e = EZ.io(clamp((t - CU.fuse + 0.5) / 2.0));
  const mid = [180, 300], orb = m * 3.2, dsep = lerp(1, 0, EZ.io(m)) * 70;
  let mw = [lerp(100, mid[0] - 45, a), lerp(350, mid[1] + 50, a)], an = [lerp(430, mid[0] + 45, a), lerp(-40, mid[1] - 50, a)];
  if (t > c) { mw = [mid[0] - Math.cos(orb + 0.8) * dsep, mid[1] - Math.sin(orb + 0.8) * dsep]; an = [mid[0] + Math.cos(orb + 0.8) * dsep, mid[1] + Math.sin(orb + 0.8) * dsep]; }
  const tide = clamp((t - c + 0.6) / 1.5) * (1 - e), h = t - c, sh = h > 0 && h < 0.4 ? Math.round(Math.sin(h * 70) * 3) : 0;
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 + t * 2, dy: f.dy * 2 }, { milky: true });
    pshift(sh, 0, () => {
      galaxy(an[0] + f.dx, an[1] + f.dy, lerp(85, 110, a), t, { n: 1500, seed: 11, arms: 1 - e, flat: lerp(0.32, 0.8, e), tilt: 0.65, spin: 0.14, tide, ell: e, pink: '#ff9ad0', glow: '#b08a60' });
      galaxy(mw[0] + f.dx, mw[1] + f.dy, lerp(70, 80, a), t, { n: 1300, seed: 3, arms: 1 - e, flat: lerp(0.45, 0.8, e), tilt: -0.38, spin: 0.16, rot: 0.6, tide: tide * 1.2, ell: e });
      if (h > 0 && h < 2.5) for (let k = 0; k < 40; k++) { const r = RNG('burst', k), x = mid[0] + r.n(55), y = mid[1] + r.n(40); if (h > r.f() * 2) { prect(x, y, 2, 2, (B + k) % 6 ? '#ff7ab0' : '#ffffff'); if (k % 5 === 0) pglow(x, y, 1, 4, '#ff7ab0', 0.4); } }   // starburst: the collision makes new stars
      if (h > 0 && h < 0.3) pglow(mid[0], mid[1], 4, 70, '#ffffff', 0.5 * (1 - h / 0.3));
    });
  }, { mosaic: mosaicAt({ out: false }) });
  if (t < c) { docLabel('VÍA LÁCTEA', clamp(mw[0] * 3, 200, 880), mw[1] * 3 - 230, { at: 57.6, fg: '#eef0ea', align: 'center' }); docLabel('ANDRÓMEDA', clamp(an[0] * 3, 200, 800), an[1] * 3 - 230, { at: CU.andro, fg: ROSE, align: 'center' }); }
  clockHud({ word: t < 61.9 ? 'HOY' : '¿FUTURO?', col: t < 61.9 ? HOT : ROSE, sub: t < 61.9 ? '' : '50 % DE PROBABILIDAD', sub2: t < 61.9 ? '' : 'EN 10.000 MILLONES DE AÑOS' });
  spCaptions();
}

// =====================================================================
//  12: the elliptical turns slowly while the camera drifts back; the title
// =====================================================================
function sceneEnd() {
  const t = TT, f = docFloat(12, 1.5), z = 1 - 0.18 * EZ.io(clamp((t - 67.25) / 4.4));
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 + t * 2, dy: f.dy * 2 }, { milky: true });
    galaxy(GX + f.dx, 330 + f.dy, 110 * z, t, { n: 2200, seed: 11, arms: 0, flat: 0.8, tilt: 0.3, spin: 0.08, ell: 1, glow: '#b08a60' });
  });
  docLabel('ELÍPTICA', 540, 1500 - 70, { at: 67.6, fg: GOLD, align: 'center' });
  spCaptions();
}

const SCENES = { title: sceneTitle, bang: sceneBang, dark: sceneDark, web: sceneWeb, stars: sceneStars, small: sceneSmall, disk: sceneDisk, hush: sceneHush, hole: sceneHole, today: sceneToday, andro: sceneAndro, end: sceneEnd };
