// =====================================================================
//  BEATS — ¿cómo se formó la Tierra? Helpers (a lit sphere that can be rock, magma, cooling crust, oceans or today's
//  Earth; a dust disk; the countdown clock) then one function per shot. Drawn at 360x640.
// =====================================================================
const at = (T, t) => { if (t <= T[0][0]) return T[0][1]; for (let i = 1; i < T.length; i++) if (t <= T[i][0]) { const [a, va] = T[i - 1], [b, vb] = T[i]; return va + (vb - va) * EZ.io((t - a) / (b - a)); } return T[T.length - 1][1]; };
const cnt = (L, t) => L.filter((x) => t >= x).length;
const gauss = (r, sd) => sd * Math.sqrt(-2 * Math.log(1 - r.f() * 0.999)) * Math.cos(6.283 * r.f());
const PCX = 180, PCY = 290;

// ---- palettes
const ROCKP = ['#1e1814', '#3a3028', '#5a4a3c', '#7a6a58', '#9a8a74', '#c0b096'];
const BASP = ['#121218', '#1e1e26', '#2c2c36', '#3e3e4a', '#56566a', '#74748a'];
const MAGP = ['#2a0804', '#6a1606', '#b0300a', '#e8601a', '#ffa030', '#ffe080'];
const OCEP = ['#06122e', '#0c2a64', '#1a4a9e', '#2a6ad0', '#4a90ec', '#8ac0ff'];
const LANDP = ['#142e10', '#1e4a18', '#2e6a24', '#448a30', '#6aa040', '#a0a85a'];
const CLDP = ['#7a86a0', '#b8c4dc', '#e8eef8', '#ffffff'];
const SUNP = ['#a04010', '#e07a1a', '#ffb030', '#ffe070', '#fff8d0'];
const MOONP = ['#2a2a30', '#4a4a52', '#76767e', '#a0a0a8', '#c8c8d0', '#e8e8f0'];
const LGX = -0.62, LGY = -0.5, LGZ = 0.6;

// craters: fixed spots on the sphere (unit vectors) with radii
const CRAT = Array.from({ length: 18 }, (_, k) => { const r = RNG('crat', k), z = r.f() * 2 - 1, a = r.f() * 6.283, s = Math.sqrt(1 - z * z); return [s * Math.cos(a), z, s * Math.sin(a), 0.08 + r.f() * 0.16]; });

// a lit sphere. o: rot, spin, seed, heat 0..1 (magma), crack 0..1 (glowing seams), basalt 0..1 (rock → dark basalt),
// sea (-1 none … 1 all water), green 0..1 (land vegetation), cloud 0..1, crater 0..1, atmo, pal (override rock palette), glow
function planet(cx, cy, r, t, o = {}) {
  r = Math.max(1, Math.round(r)); cx = Math.round(cx); cy = Math.round(cy);
  const rot = (o.rot ?? 0) + t * (o.spin ?? 0.15), heat = o.heat ?? 0, crack = o.crack ?? 0, bas = o.basalt ?? 0, sea = o.sea ?? -1, green = o.green ?? 0, cloud = o.cloud ?? 0, crater = o.crater ?? 0, seed = o.seed ?? 1;
  if (o.glow) pglow(cx, cy, r * 0.9, r * (o.glowR ?? 1.45), o.glow, o.glowA ?? 0.4);
  const rp = o.pal ?? ROCKP;
  pfield(cx - r - 1, cy - r - 1, 2 * r + 3, 2 * r + 3, (i, j) => {
    const nx = (i - cx) / r, ny = (j - cy) / r, q = nx * nx + ny * ny; if (q > 1) return null;
    const nz = Math.sqrt(1 - q), lon = Math.atan2(nx, nz) + rot, lat = Math.asin(ny), cl = Math.cos(lat);
    const X = cl * Math.cos(lon), Y = Math.sin(lat), Z = cl * Math.sin(lon);
    let h = fbm(X * 1.7 + Z * 0.9 + 5, Y * 1.7 - Z * 0.7 + 5, seed, 4);
    const L = clamp(nx * LGX + ny * LGY + nz * LGZ), lit = 0.18 + 0.82 * L;
    if (crater) for (const [a, b, c, cr] of CRAT) { const d = Math.acos(clamp(X * a + Y * b + Z * c, -1, 1)) / cr; if (d < 1.15) h += crater * (d < 1 ? -0.22 * (1 - d * d) : 0.12); }
    // magma: flowing swirls; crust plates take over as it cools
    if (heat > 0) {
      const m = fbm(X * 2.6 + Math.sin(t * 0.3 + Y * 3) * 0.25 + 9, Y * 2.6 + Z * 1.4 + t * 0.06, seed + 7, 3);
      if (m < 0.18 + 0.72 * heat) return RGB(ramp(MAGP, clamp(0.35 + (m - 0.3) * 0.9 + heat * 0.35 + (dhash(i, j + B, 3) - 0.5) * 0.08), i, j));
      return RGB(ramp(MAGP, clamp(0.05 + lit * 0.18), i, j));
    }
    if (crack > 0) { const m2 = fbm(X * 3.2 + 2, Y * 3.2 + Z * 2 + 2, seed + 11, 3); if (Math.abs(m2 - 0.5) < 0.018 + 0.02 * crack) return RGB(ramp(MAGP, clamp(0.3 + 0.6 * crack), i, j)); }
    if (cloud > 0) { const c = fbm(X * 3.0 + t * 0.05 + 1, Y * 3.0 + Z * 2.2 + 1, seed + 20, 4); if (c > 1 - cloud * 0.42) return RGB(ramp(CLDP, clamp(lit * 1.05 + (c - 0.7)), i, j)); }
    if (sea > -1 && h < 0.35 + sea * 0.3) return RGB(ramp(OCEP, clamp(lit * 0.85 + (h - 0.35) * 0.6 + (Math.abs(Y) > 0.85 ? 0.3 : 0)), i, j));
    if (o.ice && Math.abs(Y) > 0.88) return RGB(ramp(CLDP, clamp(lit), i, j));
    const v = clamp(lit * (0.55 + h * 0.7));
    if (green > 0) { const gv = clamp(lit * (0.45 + (h - 0.35) * 0.9)); return RGB((h * 1.4 - 0.2 < green ? ramp(LANDP, gv, i, j) : ramp(rp, gv, i, j))); }
    return RGB(bas > 0 && bas > bayer(i, j) ? ramp(BASP, v, i, j) : ramp(rp, v, i, j));
  });
  if (o.atmo) for (let a = 0; a < 360; a++) { const th = a / 360 * 6.283, x = cx + Math.cos(th) * (r + 1), y = cy + Math.sin(th) * (r + 1), lt = -(Math.cos(th) * LGX + Math.sin(th) * LGY); if (lt > -0.2) pset(x, y, lt > 0.4 ? '#9ad0ff' : '#3a6ab0'); }
}

// ---- the background: three star layers with parallax and a few far smudges
function cosmos(cam, o = {}) {
  starfield(cam, { milky: o.milky });
  for (let k = 0; k < 5; k++) { const r = RNG('far', k), x = mod(r.i(0, SW) + cam.dx * 0.35, SW + 40) - 20, y = mod(r.i(0, SH) + cam.dy * 0.35, SH + 40) - 20; pglow(x, y, 1, 10 + k * 3, k % 2 ? '#2a2a5a' : '#3a2440', 0.25); }
}
// the Sun in a corner (later shots): a big ball cut by the frame, with a halo
function sunCorner(t, o = {}) { starBall(o.x ?? -10, o.y ?? -6, o.r ?? 40, SUNP, t, { halo: 2.2, cell: 4, seed: 4 }); }

// ---- the countdown HUD: HACE / a big number / MIL MILLONES DE AÑOS; or a word (HOY)
const fmtG = (v) => v.toFixed(2).replace('.', ',');
function clockHud(o = {}) {
  pixDefer(() => lowres(DOC_TXT, () => {
    if (o.word) { docText(o.word, 90, 206, o.col ?? HOT, { align: 'center', scale: 3, outline: '#05060f' }); return; }
    const v = at(CLOCK, TT);
    docText('HACE', 90, 197, '#c8d0e8', { align: 'center', outline: '#05060f' });
    docText(fmtG(v), 90, 206, BLU, { align: 'center', scale: 3, outline: '#05060f' });
    docText('MIL MILLONES DE AÑOS', 90, 231, '#eef0ea', { align: 'center', outline: '#05060f' });
    if (o.counter) { const [lab, val, col] = o.counter; docText(lab, 90, 170, '#eef0ea', { align: 'center', outline: '#05060f' }); docText(String(val), 90, 179, col ?? HOT, { align: 'center', scale: 2, outline: '#05060f' }); }
  }));
}

// ---- the dust disk: 1400 grains. u 0..1 from a round cloud to a flat spinning disk round (cx, cy)
const DUSTN = 1400;
function grain(k, t, u, cx, cy) {
  const r = RNG('dust', k), cr = Math.sqrt(r.f()), ca = r.f() * 6.283, cpx = Math.cos(ca) * cr * 165, cpy = Math.sin(ca) * cr * 150 + gauss(r, 10);
  const rr = 22 + Math.pow(r.f(), 0.8) * 150, w = 0.9 / Math.sqrt(rr / 30), a = r.f() * 6.283 + t * w * u + t * 0.04 * (1 - u);
  const dx = Math.cos(a) * rr, dy = Math.sin(a) * rr * 0.26 + gauss(r, 2.5);
  return [cx + lerp(cpx + Math.sin(t * 0.3 + k) * 3, dx, u), cy + lerp(cpy, dy, u), Math.sin(a), r.f()];
}
function dustDisk(t, u, cx, cy, back) {
  for (let k = 0; k < DUSTN; k++) {
    const [x, y, s, f] = grain(k, t, u, cx, cy); if (u > 0.5 && (back ? s > 0 : s <= 0)) continue;
    const c = f < 0.5 ? '#c0703a' : f < 0.8 ? '#e8a050' : f < 0.93 ? '#8a5a40' : '#ffd890';
    pset(x, y, c); if (k % 23 === 0) pset(x + 1, y, c);
  }
}

// =====================================================================
//  1 / 15: the Earth today turning, its Moon on a small orbit; the camera pushes in (title) or drifts out (end)
// =====================================================================
function todayEarth(t, R, cy, o = {}) {
  const ma = t * 0.35 + 1, mx = PCX + Math.cos(ma) * R * 1.75, my = cy + Math.sin(ma) * R * 0.45, mFront = Math.sin(ma) > 0;
  if (!mFront) planet(mx, my, R * 0.27, t, { pal: MOONP, crater: 1, spin: 0.05, seed: 40 });
  planet(PCX, cy, R, t, { sea: 0.55, green: 1, cloud: 0.6, ice: true, atmo: true, spin: 0.12, seed: 2, glow: '#2a5ab0', glowA: 0.35 });
  if (mFront) planet(mx, my, R * 0.27, t, { pal: MOONP, crater: 1, spin: 0.05, seed: 40 });
}
function sceneTitle() {
  const t = TT, f = docFloat(1, 2), z = 1 + 0.2 * EZ.io(clamp(t / 5.75));
  spaceFrame(() => { cosmos({ dx: f.dx * 3 + t * 2, dy: f.dy * 3 }, { milky: true }); todayEarth(t, 72 * z, 340 + f.dy); }, { mosaic: mosaicAt({ in: false }) });
  docLabel('4.600 MILLONES DE AÑOS', 540, 1380, { at: 2.0, align: 'center' });
  docLabel('EN UN MINUTO', 540, 1430, { at: 4.4, align: 'center', fg: '#eef0ea' });
  spCaptions();
}
function sceneEnd() {
  const t = TT, f = docFloat(15, 1.5), z = 1 - 0.15 * EZ.io(clamp((t - 67.25) / 4.2));
  spaceFrame(() => { cosmos({ dx: f.dx * 2 + t * 2, dy: f.dy * 2 }, { milky: true }); todayEarth(t, 90 * z, 360 + f.dy); });
  spCaptions();
}

// =====================================================================
//  2: the cloud. Dusty orange gas (a slow nebula) and grains drifting in three depths
// =====================================================================
const DUSTNEB = ['#0a0810', '#1e1420', '#3a2228', '#5a3428', '#8a5030', '#c07a40', '#e8a860', '#ffe0b0'];
function sceneCloud() {
  const t = TT, f = docFloat(2, 2), z = 1 + 0.12 * EZ.io(clamp((t - 5.75) / 4.5));
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 + t * 1.5, dy: f.dy * 2 }, {});
    nebula(PCX + f.dx, PCY + f.dy, 175 * z, t, { swirl: 0.25, seed: 8, cols: DUSTNEB, squash: 0.95 });
    dustDisk(t, 0, PCX + f.dx * 1.5, PCY + f.dy * 1.5, false);
  }, { mosaic: mosaicAt() });
  clockHud();
  spCaptions();
}
// ---- 3: gravity pulls it in: arrows pulse inward, the cloud turns and flattens into a disk, the centre warms
function sceneGravity() {
  const t = TT, f = docFloat(3, 1.5), u = EZ.io(clamp((t - 11.0) / 3.2)), c = clamp((t - 10.3) / 4);
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 + t * 1.5, dy: f.dy * 2 }, {});
    nebula(PCX + f.dx, PCY + f.dy, 175 * (1 - 0.5 * u), t, { swirl: 0.25 + u, seed: 8, cols: DUSTNEB, squash: lerp(0.95, 0.3, u) });
    pglow(PCX, PCY, 2, 10 + 30 * c, '#c05a20', 0.6 * c);
    dustDisk(t, u, PCX + f.dx, PCY + f.dy, true); dustDisk(t, u, PCX + f.dx, PCY + f.dy, false);
    if (t < 12.6) for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283 + 0.3, p = mod(t * 1.2 + k * 0.15, 1), d0 = 150 - p * 60;
      for (let q = 0; q < 22; q++) pset(PCX + Math.cos(a) * (d0 - q), PCY + Math.sin(a) * (d0 - q), q < 3 ? '#ffffff' : BLU);
      for (const s of [-1, 1]) pline(PCX + Math.cos(a) * (d0 - 22), PCY + Math.sin(a) * (d0 - 22), PCX + Math.cos(a) * (d0 - 22) + Math.cos(a + s * 0.6) * 6, PCY + Math.sin(a) * (d0 - 22) + Math.sin(a + s * 0.6) * 6, BLU); }
  }, { mosaic: mosaicAt() });
  clockHud();
  spCaptions();
}
// ---- 4: the Sun lights up in the middle of the disk; a mass bar: the Sun vs everything else
function sceneSun() {
  const t = TT, f = docFloat(4, 1.5), s = t - CU.sun, sh = s > 0 && s < 0.35 ? Math.round(Math.sin(s * 80) * 3) : 0;
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 + t * 1.5, dy: f.dy * 2 }, {});
    pshift(sh, 0, () => {
      const cx = PCX + f.dx, cy = PCY + f.dy;
      nebula(cx, cy, 90, t, { swirl: 1.2, seed: 8, cols: DUSTNEB, squash: 0.3 });
      dustDisk(t, 1, cx, cy, true);
      if (s < 0) { pglow(cx, cy, 3, 34 + Math.sin(t * 6) * 4, '#c05a20', 0.7); pcircle(cx, cy, 8, '#8a3a14'); pcircle(cx, cy, 5, '#c05a20'); }
      else { if (s < 0.1) pfill('#fff8d0'); const r = 30 * clamp(springMove(CU.sun, 0.3, 1, SPRING.heavy), 0, 1.2); starBall(cx, cy, r, SUNP, t, { halo: 2.4, cell: 4, seed: 4 }); if (s < 0.6) pcircle(cx, cy, Math.round(30 + s * 260), '#ffe070', { ring: 2 }); }
      dustDisk(t, 1, cx, cy, false);
    });
    if (t >= CU.mass) {   // the mass bar
      const p = EZ.o3(clamp((t - CU.mass) / 0.6)), x0 = 40, w = 280, y = 445;
      prect(x0 - 2, y - 2, w + 4, 14, '#eef0ea'); prect(x0, y, w, 10, '#05060f');
      prect(x0, y, Math.round(w * 0.996 * p), 10, '#ffb030'); prect(x0, y, Math.round(w * 0.996 * p), 2, '#ffe070');
      if (p >= 1) prect(x0 + w - 2, y, 2, 10, (B % 4) < 2 ? '#9ab8ff' : '#5a70c8');
    }
  }, { mosaic: mosaicAt({ in: false }) });
  docLabel('EL SOL', PCX * 3, PCY * 3 + 130, { at: CU.sun + 0.5, align: 'center', fg: GOLD, scale: 2 });
  docLabel('> 99 %', 40 * 3 + 6, 445 * 3 - 70, { at: CU.mass + 0.4, fg: GOLD, scale: 2 });
  docLabel('EL RESTO', 940, 445 * 3 + 50, { at: CU.mass + 1.0, fg: '#9ab8ff', align: 'right' });
  if (t < CU.mass) clockHud();
  spCaptions();
}

// =====================================================================
//  5: the dust sticks: grains clump into pebbles, then rocks crash into one growing body (a counter). The Sun in the corner
// =====================================================================
function protoR(t) { return 3 + 3 * clamp((t - CU.stick) / 2.4) + 3.2 * cnt(CU.crash, t) + (t > 28.25 ? 0 : 0); }
function sceneDust() {
  const t = TT, f = docFloat(5, 1.5), z = 1 + 0.25 * EZ.io(clamp((t - 20.5) / 7.75)), last = CU.crash.filter((x) => t >= x).pop() ?? -9, h = t - last, sh = h < 0.25 ? Math.round(Math.sin(h * 90) * 3) : 0;
  const nCol = Math.round(at([[21.6, 0], [24.0, 2], [26.0, 14], [28.25, 61]], t));
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 - t * 4, dy: f.dy * 2 }, {});
    sunCorner(t);
    pshift(sh, 0, () => {
      const cx = PCX + f.dx, cy = PCY - 20 + f.dy, R = protoR(t) * z;
      for (let k = 0; k < 700; k++) {   // grains drift past (left to right, three depths) and some fall onto the body
        const r = RNG('gr', k), d = 0.4 + (k % 3) * 0.35, x = mod(r.i(0, SW) + t * 14 * d, SW + 10) - 5, y = r.i(140, 560) + Math.sin(t + k) * 2;
        const pull = clamp((t - CU.stick - r.f() * 3) / 1.5) * (k % 4 === 0 ? 1 : 0);
        const px = lerp(x, cx + Math.cos(k) * (R + 2), EZ.i3(pull)), py = lerp(y, cy + Math.sin(k) * (R + 2), EZ.i3(pull));
        if (pull >= 1) continue; pset(px, py, k % 5 ? '#c0703a' : '#e8a050');
      }
      for (let k = 0; k < 9; k++) { const r = RNG('peb', k), a = r.f() * 6.283 + t * 0.5, d = 30 + r.f() * 60; if (t > CU.stick + k * 0.3) planet(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.5, 2 + (k % 3), t, { crater: 0.5, seed: 50 + k, spin: 0.6 }); }   // pebbles in orbit
      CU.crash.forEach((tm, i) => {   // incoming rocks with a dust trail
        const p = clamp((t - (tm - 0.9)) / 0.9); if (p <= 0 || p >= 1) return; const a = i * 2.3 + 0.7, d = (1 - EZ.i3(p)) * 220 + R, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8;
        for (let q = 1; q < 14; q++) pset(x + Math.cos(a) * q * 2, y + Math.sin(a) * q * 1.6, q % 2 ? '#8a5a40' : '#c0703a');
        planet(x, y, 3 + (i % 3) * 1.5, t, { crater: 0.6, seed: 60 + i, spin: 1 });
      });
      planet(cx, cy, R, t, { crater: 1, seed: 3, spin: 0.4, glow: h < 0.5 ? '#ff8a3a' : null, glowA: 0.6 * (1 - h / 0.5) });
      if (h < 0.4) { pcircle(cx, cy, Math.round(R + 2 + h * 60), '#ffd890', { ring: 1 }); for (let q = 0; q < 16; q++) { const a = q * 0.4 + last, d = R + h * 90 * (0.5 + (q % 3) * 0.3); pset(cx + Math.cos(a) * d, cy + Math.sin(a) * d, q % 2 ? '#ffd890' : '#ff8a3a'); } }
    });
  }, { mosaic: mosaicAt() });
  clockHud(t >= CU.stick ? { counter: ['CHOQUES', nCol] } : {});
  spCaptions();
}
// ---- 6: a young Earth: grey-brown, cratered, still being hit by small rocks that flash on its face
function sceneYoung() {
  const t = TT, f = docFloat(6, 1.5), R = 62 + 6 * EZ.io(clamp((t - 28.25) / 2.25));
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 - t * 3, dy: f.dy * 2 }, { milky: true });
    sunCorner(t);
    const cx = PCX + f.dx, cy = PCY + f.dy;
    planet(cx, cy, R, t, { crater: 1, seed: 3, spin: 0.25, glow: '#8a3a14', glowA: 0.3 });
    for (let k = 0; k < 6; k++) { const tm = 28.4 + k * 0.33, p = (t - tm) / 0.5; if (p < 0 || p > 1.4) continue; const a = 3.6 + k * 0.6, ex = cx + Math.cos(a) * R * 0.8, ey = cy + Math.sin(a) * R * 0.8;
      if (p < 1) { const x = lerp(ex + 120, ex, p), y = lerp(ey - 160, ey, p); for (let q = 0; q < 8; q++) pset(x + q * 2.2, y - q * 3, q < 2 ? '#ffffff' : '#ffb050'); } else { pglow(ex, ey, 1, 10, '#ffb050', 0.8 * (1.4 - p)); prect(ex - 1, ey - 1, 3, 3, '#ffffff'); } }
  }, { mosaic: mosaicAt() });
  clockHud();
  spCaptions();
}

// =====================================================================
//  7–8: Theia comes in from the right, half the Earth's size; a size bracket. The silence freezes it one beat before contact
// =====================================================================
function theiaWorld(t, f) {
  const cx = 140 + f.dx, cy = PCY + 10 + f.dy, R = 68, u = EZ.io(clamp((t - 30.5) / 4.0)), tx = lerp(420, cx + R + 30, u), ty = lerp(140, cy - 26, u);
  cosmos({ dx: f.dx * 2 - t * 3, dy: f.dy * 2 }, { milky: true });
  sunCorner(t);
  planet(cx, cy, R, t, { crater: 1, seed: 3, spin: 0.25, glow: '#8a3a14', glowA: 0.3 });
  planet(tx, ty, 36, t, { crater: 0.8, seed: 9, spin: 0.3, pal: ['#22140e', '#4a2a1a', '#7a4428', '#a0603a', '#c4845a', '#e0a878'], glow: '#7a3a1a', glowA: 0.35 });
  if (t >= CU.mars) { const y0 = ty + 44; prect(tx - 36, y0, 72, 1, AMB); prect(tx - 36, y0 - 3, 1, 4, AMB); prect(tx + 35, y0 - 3, 1, 4, AMB); }
  return [tx, ty];
}
function sceneTheia() {
  const t = TT, f = docFloat(7, 1.5); let p = [0, 0];
  spaceFrame(() => { p = theiaWorld(t, f); }, { mosaic: mosaicAt({ in: false, out: false }) });
  docLabel('TEA', p[0] * 3, p[1] * 3 - 160, { at: CU.theia, align: 'center', fg: HOT, scale: 2 });
  docLabel('≈ MARTE', p[0] * 3, p[1] * 3 + 165, { at: CU.mars, align: 'center', fg: AMB });
  clockHud();
  spCaptions();
}
function sceneHush() {
  const keep = TT; TT = 34.45; const f = docFloat(7, 1.5); TT = keep;
  spaceFrame(() => { const k2 = TT; TT = 34.45; try { theiaWorld(34.45, f); } finally { TT = k2; } pdither(0, 0, SW, SH, null, '#020206', () => 0.7); });
}

// =====================================================================
//  9: IMPACT. A white flash, a shockwave; the Earth turns to magma; debris flies out, settles into a ring that turns,
//  then gathers into the Moon
// =====================================================================
const DEBN = 950;
function debris(k, t, cx, cy, R) {
  const r = RNG('deb', k), s = t - CU.hit, a0 = -0.45 + gauss(r, 0.7), sp = 60 + r.f() * 140;
  const fly = 1 - Math.exp(-s * 1.8), ex = cx + Math.cos(a0) * (R + sp * fly), ey = cy + Math.sin(a0) * (R + sp * fly) * 0.9;   // ejecta
  const ringR = R * 1.55 + r.f() * R * 0.6, ra = r.f() * 6.283 + s * (0.9 - (ringR - R) / R * 0.3), rx = cx + Math.cos(ra) * ringR, ry = cy + Math.sin(ra) * ringR * 0.28;   // the ring
  const settle = EZ.io(clamp((t - (CU.hit + 1.3)) / 1.6)), gather = EZ.io(clamp((t - (CU.moon - 0.9 + r.f() * 0.4)) / 0.8));
  const ma = MOONA(t), mx = cx + Math.cos(ma) * R * 1.85, my = cy + Math.sin(ma) * R * 1.85 * 0.28;
  return [lerp(lerp(ex, rx, settle), mx, gather), lerp(lerp(ey, ry, settle), my, gather), Math.sin(ra), gather];
}
const MOONA = (t) => 2.6 + (t - CU.hit) * 0.55;
function sceneImpact() {
  const t = TT, f = docFloat(9, 1.5), s = t - CU.hit, sh = s < 0.6 ? Math.round(Math.sin(s * 70) * 6 * (1 - s / 0.6)) : 0, cx = PCX + f.dx, cy = PCY + f.dy, R = 70;
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 - t * 3, dy: f.dy * 2 }, { milky: true });
    if (s < 0.09) { pfill('#ffffff'); return; }
    pshift(sh, sh * 0.4, () => {
      const pts = []; for (let k = 0; k < DEBN; k++) pts.push(debris(k, t, cx, cy, R));
      const col = (k) => (k % 5 === 0 ? '#ffe080' : k % 3 ? '#ff9a4a' : '#b06a40');
      pts.forEach(([x, y, sn], k) => { if (s > 1.3 && sn < 0) pset(x, y, col(k)); });   // ring: the back half
      planet(cx, cy, R, t, { heat: 1, seed: 3, spin: 0.25, glow: '#ff5a10', glowA: 0.55 });
      pts.forEach(([x, y, sn], k) => { if (s <= 1.3 || sn >= 0) { pset(x, y, col(k)); if (k % 4 === 0) pset(x + 1, y, col(k)); } });
      if (t >= CU.moon - 0.2) { const ma = MOONA(t), r = 15 * clamp(springMove(CU.moon - 0.2, 0.2, 1, SPRING.snappy), 0, 1.2); planet(cx + Math.cos(ma) * R * 1.85, cy + Math.sin(ma) * R * 1.85 * 0.28, r, t, { pal: MOONP, crater: 0.6, seed: 40, spin: 0.1, glow: '#ff8a3a', glowA: 0.6 * clamp(1 - (t - CU.moon) / 1.2) }); }
      if (s < 0.9) { pcircle(cx + 40, cy - 20, Math.round(10 + s * 300), '#ffffff', { ring: 2 }); pglow(cx + 50, cy - 26, 4, 90 * (1 - s / 0.9), '#ffe0a0', 0.8 * (1 - s / 0.9)); }
    });
  }, { mosaic: mosaicAt({ in: false }) });
  const ma = MOONA(t); docLabel('LUNA', (cx + Math.cos(ma) * R * 1.85) * 3, (cy + Math.sin(ma) * R * 1.85 * 0.28) * 3 + 80, { at: CU.moon + 0.2, align: 'center', fg: '#e8e8f0' });
  if (s >= 0.6) clockHud();
  spCaptions();
}
// ---- 10: the magma ocean up close: swirls, glow, sparks off the limb; the young Moon crosses in front, big
function sceneMagma() {
  const t = TT, f = docFloat(10, 1.5), z = 1 + 0.1 * EZ.io(clamp((t - 41) / 3)), cx = PCX + f.dx, cy = PCY + f.dy, R = 118 * z;
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 - t * 3, dy: f.dy * 2 }, {});
    planet(cx, cy, R, t, { heat: 1, seed: 3, spin: 0.2, glow: '#ff5a10', glowA: 0.55, glowR: 1.3 });
    for (let k = 0; k < 40; k++) { const r = RNG('spk', k), a = r.f() * 6.283, p = mod(t * (0.8 + r.f()) + r.f(), 1), d = R + p * 22; if (p < 0.8) pset(cx + Math.cos(a) * d, cy + Math.sin(a) * d, p < 0.4 ? '#ffe080' : '#e8601a'); }
    const mx = lerp(-40, 400, clamp((t - 41) / 3)), my = cy + 150; planet(mx, my, 24, t, { pal: MOONP, crater: 0.8, seed: 40, spin: 0.1 }); docShadow(mx + 6, my + 30, 18, 3, 0.3);
  }, { mosaic: mosaicAt() });
  spCaptions();
}
// ---- 11: it cools: the magma crusts over into dark basalt, seams glow then fade; a loupe opens on the oldest crystal
function zircon(cx, cy, r, t) {
  pfill('#14101a'); for (let k = 0; k < 120; k++) { const q = RNG('sand', k); prect(cx + q.n(r), cy + q.n(r), 2, 2, k % 3 ? '#2a2230' : '#3a3040'); }
  const w = r * 0.32, hh = r * 0.62, tip = r * 0.22, rot = 0.35 + Math.sin(t * 0.8) * 0.06, P = (x, y) => [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
  const A = P(0, -hh - tip), B1 = P(w, -hh), C1 = P(w, hh), D1 = P(0, hh + tip), E1 = P(-w, hh), F1 = P(-w, -hh), M1 = P(w * 0.15, -hh), M2 = P(w * 0.15, hh);
  docShadow(cx + 8, cy + hh + 10, w * 1.4, 5, 0.5);
  ppoly([A, B1, C1, D1, E1, F1], '#8a4a7a'); ppoly([A, M1, M2, D1, E1, F1], '#c47aa8'); ppoly([A, B1, M1], '#e8b0d0'); ppoly([F1, A, M1], '#f0c8e0');
  for (let k = 1; k < 6; k++) { const y = -hh + k * hh * 2 / 6, a = P(-w, y), b = P(w * 0.15, y + 2); pline(a[0], a[1], b[0], b[1], '#a05a90'); }   // growth zoning
  if ((B % 12) < 3) sprite(SPR.twinkle, { a: '#c890b8', b: '#ffffff' }, Math.round(F1[0]) + 3, Math.round(F1[1]) + 4);
}
function sceneCrust() {
  const t = TT, f = docFloat(11, 1.5), cool = EZ.io(clamp((t - CU.cool) / 2.4)), cx = PCX + f.dx, cy = PCY - 20 + f.dy, ir = irisR(CU.zircon, 70), zoom = t >= CU.zircon;
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 - t * 3, dy: f.dy * 2 }, {});
    planet(cx, cy, 115, t, { heat: 1 - cool, crack: 1 - 0.75 * clamp((t - 46) / 4), basalt: 1, seed: 3, spin: 0.2, glow: '#ff5a10', glowA: 0.5 * (1 - cool) + 0.1 });
    if (zoom) pdither(0, 0, SW, SH, null, '#05060f', () => 0.35);
    if (ir > 3) docIris(PCX, 330, ir, (x, y, r) => zircon(x, y, r, t));
  }, { mosaic: mosaicAt() });
  docLabel('CIRCÓN', 540, 680, { at: CU.zircon + 0.4, align: 'center', fg: ROSE, scale: 2 });
  docLabel('4.400 MILLONES', 540, 1250, { at: CU.age, align: 'center', fg: GOLD, scale: 2 });
  docLabel('DE AÑOS', 540, 1360, { at: CU.age + 0.2, align: 'center', fg: GOLD });
  if (!zoom) clockHud();
  spCaptions();
}
// ---- 12: steam rains for millions of years: clouds circle the planet, rain streaks, lightning; the oceans fill
function sceneRain() {
  const t = TT, f = docFloat(12, 1.5), cx = PCX + f.dx, cy = PCY + f.dy, R = 112, sea = lerp(-0.9, 0.5, EZ.io(clamp((t - 52.6) / 3.4)));
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 - t * 3, dy: f.dy * 2 }, {});
    if ((B % 29) < 1) pglow(cx - 30, cy - 40, 4, 80, '#c8d8ff', 0.5);
    planet(cx, cy, R, t, { basalt: 1, crack: 0.15, sea, seed: 3, spin: 0.2, cloud: 0.35, atmo: true, glow: '#3a5a8a', glowA: 0.3 });
    for (let k = 0; k < 120; k++) { const r = RNG('rain', k), x = cx + r.i(-R, R), y0 = cy - R + mod(r.i(0, 2 * R) + t * 140, 2 * R); if (Math.hypot(x - cx, y0 - cy) < R - 2) pline(x, y0, x + 2, y0 + 5, k % 3 ? '#8ab0e0' : '#c8d8ff'); }
    for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283 + t * 0.3, x = cx + Math.cos(a) * (R + 14), y = cy + Math.sin(a) * (R + 14) * 0.9; puffC(x, y, 7 + (k % 3) * 2, k); }
  }, { mosaic: mosaicAt() });
  clockHud();
  spCaptions();
}
function puffC(x, y, s, seed) { for (let q = 0; q < 4; q++) { const r = RNG('pc', seed, q); pcircle(x + r.n(s * 0.6), y + r.n(s * 0.3), Math.round(s * (0.4 + r.f() * 0.3)), q % 2 ? '#e8eef8' : '#ffffff'); } pcircle(x, y + 2, Math.round(s * 0.45), '#b8c4dc'); }
// ---- 13: the Moon drifts away: side view, a ruler between them; the planet greens as the clock runs to today
function sceneMoon() {
  const t = TT, f = docFloat(13, 1.5), u = EZ.io(clamp((t - 57.2) / 5.2)), ex = 80 + f.dx, ey = PCY + f.dy, d = lerp(85, 255, u), mx = ex + d, my = ey - 10 * (1 - u), mr = lerp(26, 14, u);
  spaceFrame(() => {
    cosmos({ dx: f.dx * 2 - t * 3, dy: f.dy * 2 }, { milky: true });
    planet(ex, ey, 58, t, { sea: 0.5, green: clamp((t - 58) / 4), cloud: 0.5, ice: t > 60, atmo: true, seed: 2, spin: 0.25, glow: '#2a5ab0', glowA: 0.3 });
    for (let a = -0.5; a < 0.5; a += 0.012) pset(ex + Math.cos(a) * d, ey + Math.sin(a) * d * 0.7, (Math.round(a * 200) % 3) ? '#2a3060' : '#4a5aa0');   // the orbit
    planet(mx, my, mr, t, { pal: MOONP, crater: 1, seed: 40, spin: 0.05 });
    if (t >= CU.moonFar) { const y = ey + 80, p = clamp((t - CU.moonFar) / 0.6); prect(ex, y, Math.round((mx - ex) * p), 1, AMB); for (let q = 0; q <= 10; q++) if (q / 10 <= p) prect(ex + Math.round((mx - ex) * q / 10), y - (q % 5 ? 2 : 4), 1, q % 5 ? 2 : 4, AMB); prect(mx - 1, y - 3, 1, 4, AMB); }
  }, { mosaic: mosaicAt() });
  docLabel('≈ 4 CM POR AÑO', 540, (PCY - 105) * 3, { at: CU.cm, align: 'center', fg: AMB, scale: 2 });
  clockHud();
  spCaptions();
}
// ---- 14: today: the blue planet and its Moon; the clock says HOY
function sceneToday() {
  const t = TT, f = docFloat(14, 1.5), z = 1 + 0.12 * EZ.io(clamp((t - 62.75) / 4.5));
  spaceFrame(() => { cosmos({ dx: f.dx * 2 + t * 2, dy: f.dy * 2 }, { milky: true }); todayEarth(t, 88 * z, PCY + f.dy); }, { mosaic: mosaicAt({ out: false }) });
  clockHud(t >= CU.today ? { word: 'HOY' } : {});
  spCaptions();
}

const SCENES = { title: sceneTitle, cloud: sceneCloud, gravity: sceneGravity, sun: sceneSun, dust: sceneDust, young: sceneYoung, theia: sceneTheia, hush: sceneHush,
  impact: sceneImpact, magma: sceneMagma, crust: sceneCrust, rain: sceneRain, moon: sceneMoon, today: sceneToday, end: sceneEnd };
