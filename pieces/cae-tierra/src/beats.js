// =====================================================================
//  BEATS — cae a través de la tierra. Physics, the planet's layers, the HUD, then one function per shot.
// =====================================================================
// ---- physics: a PREM-like g(r) (linear in the core up to 10.68 at the core-mantle boundary, then easing to 9.82 at
// the surface) integrated once into a table; the real ball's model time is scaled so the full crossing is 38.2 min
// (Klotz 2015). The textbook ghost: uniform density, simple harmonic, 42.2 min.
const RE = 6371, RCMB = 3480, RIC = 1221, D670 = 670;
const gOf = (r) => (r < RCMB ? 10.68 * r / RCMB : 10.68 - 0.86 * (r - RCMB) / (RE - RCMB));
const FALL = (() => {   // integrate from the surface to the centre; samples [t_s, depth_km, v_kms, g]
  const out = []; let r = RE * 1000, v = 0, t = 0; const dt = 0.5;
  while (r > 0) { out.push([t, RE - r / 1000, v / 1000, gOf(r / 1000)]); const a = gOf(r / 1000); v += a * dt; r -= v * dt; t += dt; }
  out.push([t, RE, v / 1000, 0]);
  const k = (38.2 * 60 / 2) / t; return out.map(([tt, d, vv, g]) => [tt * k / 60, d, vv, g]);   // minutes
})();
const T_HALF = 19.1;
function realAt(min) {   // -> { d: km from the entry, v: km/s, g: m/s² }  (mirrored after the centre)
  const m = mod(min, 2 * 38.2), leg = Math.floor(m / 38.2), u = m - leg * 38.2, mm = u <= T_HALF ? u : 38.2 - u;
  let i = 0; while (i + 1 < FALL.length && FALL[i + 1][0] < mm) i++;
  const a = FALL[i], b = FALL[Math.min(FALL.length - 1, i + 1)], f = b[0] > a[0] ? (mm - a[0]) / (b[0] - a[0]) : 0;
  const dh = a[1] + (b[1] - a[1]) * f, v = a[2] + (b[2] - a[2]) * f, g = a[3] + (b[3] - a[3]) * f;
  const d = u <= T_HALF ? dh : 2 * RE - dh;
  return { d: leg ? 2 * RE - d : d, v, g };
}
const ghostAt = (min) => { const w = Math.PI / 42.2; return { d: RE * (1 - Math.cos(w * min)), v: 7.91 * Math.abs(Math.sin(w * min)), g: 9.82 * Math.abs(Math.cos(w * min)) }; };
// model minutes for video time: the fall to the centre takes 26 s, the climb out 9 s, then the ghost catches up
function simMin(t) {
  if (t < CU.start) return 0;
  if (t < CU.center) return T_HALF * EZ.i2(clamp((t - CU.start) / (CU.center - CU.start))) ** 0.5 * 1;
  if (t < CU.arrive) return T_HALF + (38.2 - T_HALF) * (1 - (1 - clamp((t - CU.center) / (CU.arrive - CU.center))) ** 1.6);
  return 38.2 + 4.0 * clamp((t - CU.arrive) / (CU.ghostIn - CU.arrive));
}

// ---- the planet seen from inside the tunnel. scale = px per km, d = the ball's depth (km from the entry).
// Layers are drawn as true circles about the Earth's centre, so boundaries cross the frame as arcs.
const LAYERS = [   // [outer radius km, colours (dark → light), name]
  [RE, ['#2a1440', '#44205e', '#5e2c78', '#7a3a8a'], 'corteza / manto superior'],
  [RE - D670, ['#3a0a18', '#5a1222', '#78182a', '#922432'], 'manto inferior'],
  [RCMB, ['#7a2a08', '#b04810', '#d8661a', '#f08a2a'], 'núcleo externo'],
  [RIC, ['#d89a2a', '#f2c040', '#ffe070', '#fff4b0'], 'núcleo interno'],
];
function planetView(d, scale, t, o = {}) {
  const cy = SCY + (RE - d) * scale, cx = SCX;   // the Earth's centre on screen
  pfield(0, 0, SW, SH, (i, j) => {
    const r = Math.hypot((i - cx) / scale, (j - cy) / scale);
    if (r > RE) { const sky = j < cy - RE * scale; return sky ? RGB(ramp(['#0a0c22', '#1a1440', '#2a1a50'], clamp(((cy - RE * scale) - j) / 260), i, j)) : [10, 8, 20]; }
    let k = LAYERS.length - 1; while (k > 0 && r > LAYERS[k][0]) k--;
    const [r0, cols] = LAYERS[k], r1 = k + 1 < LAYERS.length ? LAYERS[k + 1][0] : 0, u = (r - r1) / Math.max(1, r0 - r1);
    if ((r0 - r) * scale < 1.4) return RGB('#1a0a14');                        // the boundary line
    let n = fbm(i * 0.035 + (k === 2 ? t * 0.25 : 0), (j - cy) * 0.035 + (k === 2 ? Math.sin(t + i * 0.02) * 0.6 : 0), 20 + k, 3);
    if (k === 2) n = n * 0.7 + 0.3 * fbm((i - cx) * 0.012 + t * 0.4, (j - cy) * 0.05, 31, 2);      // liquid iron swirls
    const glow = k === 3 ? clamp(1 - r / RIC) * 0.5 : 0;
    return RGB(ramp(cols, clamp(0.25 + (1 - u) * 0.25 + (n - 0.5) * 0.9 + glow), i, j));
  });
  // the tunnel: a dark shaft with dashed rails, lit near the ball
  const tw = Math.max(6, Math.round(26 * Math.min(1, scale * 40)));
  pfield(cx - tw / 2, 0, tw, SH, (i, j) => {
    const r = Math.hypot((i - cx) / scale, (j - cy) / scale); if (r > RE) return null;
    const e = Math.abs(i - cx) > tw / 2 - 2, lit = clamp(1 - Math.abs(j - SCY) / 140);
    if (e) return RGB(((j + Math.floor(-d * scale)) % 10 < 5) ? '#c06a4a' : '#5a2a2a');
    return RGB(ramp(['#120810', '#1e0e18', '#3a1a24'], lit * 0.8, i, j));
  });
  return { cx, cy };
}
// the ball: a white-blue glowing point with a trail (o.dir = +1 falling / -1 rising, o.speed 0..1)
function ballSprite(x, y, sp, dir, o = {}) {
  const L = Math.round(6 + 40 * sp);
  for (let k = 1; k < L; k++) { const yy = y - dir * k * 1.2; if ((k * 0.7) / L < bayer(x, yy) * 0.9 + 0.1 && k > 3) continue; pset(x, yy, k < L / 3 ? '#c8e0ff' : '#5a7ac0'); }
  pglow(x, y, 3, 12 + sp * 8, '#8ab8ff', 0.6); pcircle(x, y, 4, o.col ?? '#e8f4ff'); pcircle(x, y, 4, '#6a9aff', { ring: 1 }); pset(x - 1, y - 2, '#ffffff');
}
function ghostSprite(x, y) { pcircle(x, y, 4, '#b8b4c8', { ring: 1 }); pcircle(x, y, 6, '#5a5670', { ring: 1 }); }
// depth labels at layer boundaries (on screen, right of the tunnel)
function boundaryLabels(d, scale, until) {
  [[D670, '670 KM'], [RE - RCMB, '2.891 KM'], [RE - RIC, '5.150 KM'], [RE, '6.371 KM'], [2 * RE - (RE - RIC), '7.592 KM'], [2 * RE - (RE - RCMB), '9.851 KM'], [2 * RE - D670, '12.072 KM']].forEach(([dd, s]) => {
    const y = SCY + (dd - d) * scale; if (y < 150 || y > 500 || Math.abs(y - SCY) < 12) return; docLabel(s, (SCX + 22) * 3, y * 3 - 10, { fg: '#ffe0b0', until });
  });
}
// the HUD: minutes, km/s, m/s² (left), a depth gauge (right)
function hud(min, st, flash) {
  pixDefer(() => lowres(DOC_TXT, () => {
    const x = 8, y = 82; prect(x - 2, y - 3, 72, 41, '#05060f'); prect(x - 2, y - 3, 72, 1, '#3a4aa8'); prect(x - 2, y + 37, 72, 1, '#3a4aa8');
    docText(`${Math.floor(min)} MIN`, x + 2, y, '#eef0ea');
    docText(`${st.v.toFixed(1).replace('.', ',')} KM/S`, x + 2, y + 12, '#9ab8ff');
    docText(`${st.g.toFixed(1).replace('.', ',')} M/S²`, x + 2, y + 24, flash ? '#ffd060' : '#eef0ea');
    // depth gauge: the layers top to bottom, a marker for the ball and one for the ghost
    const gx = 168, g0 = 80, gh = 130;
    [[0, D670, '#5e2c78'], [D670, RE - RCMB, '#78182a'], [RE - RCMB, RE - RIC, '#d8661a'], [RE - RIC, RE + RIC, '#ffe070'], [RE + RIC, RE + RCMB, '#d8661a'], [RE + RCMB, 2 * RE - D670, '#78182a'], [2 * RE - D670, 2 * RE, '#5e2c78']]
      .forEach(([a, b, c]) => prect(gx, g0 + Math.round(a / (2 * RE) * gh), 5, Math.max(1, Math.round((b - a) / (2 * RE) * gh)), c));
    const gm = ghostAt(Math.min(min, 42.2)), ym = g0 + Math.round(st.d / (2 * RE) * gh), yg = g0 + Math.round(gm.d / (2 * RE) * gh);
    prect(gx - 4, yg, 3, 1, '#8a86a0'); prect(gx - 5, ym - 1, 4, 3, '#e8f4ff');
  }));
}

// =====================================================================
//  1: the garden. Dusk, a fence, a house, a tree; a girl drops a ball into a round hole; the camera dives in
// =====================================================================
function girl(x, y, o = {}) {
  x = Math.round(x); y = Math.round(y); const sc = o.sc ?? 2; ctx.save(); ctx.translate(x * PIX.z * (1 - sc), y * PIX.z * (1 - sc)); ctx.scale(sc, sc);
  prect(x - 3, y - 6, 2, 6, '#3a2a4a'); prect(x + 1, y - 6, 2, 6, '#3a2a4a');                          // legs
  ppoly([[x - 6, y - 6], [x + 6, y - 6], [x + 4, y - 18], [x - 4, y - 18]], '#e04a5a');                  // dress
  prect(x - 4, y - 18, 8, 1, '#ff7a80');
  const arm = o.arm ?? 0; pbeam(x + 4, y - 16, x + 9, y - 16 + 6 - arm * 10, 2, '#f0c09a');             // arm reaching
  prect(x - 4, y - 26, 8, 8, '#f0c09a'); prect(x - 5, y - 27, 10, 4, '#5a3020'); prect(x - 5, y - 23, 2, 6, '#5a3020'); prect(x + 3, y - 24, 3, 2, '#5a3020');
  pset(x + 1, y - 22, '#1a1020'); if (o.wow) prect(x + 1, y - 19, 2, 2, '#8a2a2a'); else prect(x, y - 19, 3, 1, '#8a2a2a');
  ctx.restore();
}
function gardenWorld(t, o = {}) {
  const f = o.cam ?? docFloat(1, 1.2), L = (d, fn) => pshift(f.dx * d, f.dy * d, fn), z = o.z ?? 1;
  pgrad(0, 0, SW, 330, ['#1a1a4a', '#3a2a6a', '#7a4a7a', '#d0786a', '#f0b070'], { ease: (u) => u ** 0.9 });
  starfield({ dx: 0, dy: 0 });
  pgrad(0, 0, SW, 330, ['#1a1a4a', '#3a2a6a', '#7a4a7a', '#d0786a', '#f0b070'].map((c, i) => c), { ease: (u) => Math.max(u, 0.35) ** 0.9 });
  for (let k = 0; k < 30; k++) { const r = RNG('dusk', k), x = r.i(0, SW), y = r.i(0, 140); if ((B + k) % 11) pset(x, y, '#e8e0ff'); }
  L(0.2, () => { pcircle(70, 300, 26, '#f6d070'); pglow(70, 300, 26, 60, '#f0b070', 0.4); });
  L(0.35, () => { const P = [[-10, 340]]; for (let x = -10; x <= 370; x += 4) P.push([x, 300 - 16 * Math.sin(x * 0.012 + 1) - 6 * Math.sin(x * 0.05)]); P.push([370, 340]); ppoly(P, '#4a3a6a'); });
  L(0.6, () => {
    // the house: walls, roof, lit windows, a door
    prect(220, 236, 110, 90, '#c8a888'); ptex(220, 236, 110, 90, '#b09070', 0.15, 5); ppoly([[210, 238], [340, 238], [275, 196]], '#7a3a3a'); for (let k = 0; k < 6; k++) pline(214 + k * 4, 236 - k * 7, 336 - k * 4, 236 - k * 7, '#6a2a2a');
    for (const wx of [234, 300]) { prect(wx, 254, 20, 22, '#f2cc6a'); prect(wx + 9, 254, 2, 22, '#7a5a3a'); prect(wx, 264, 20, 2, '#7a5a3a'); }
    prect(266, 286, 18, 40, '#5a3a2a'); pset(280, 306, '#f2cc6a');
    prect(330, 236, 10, 90, '#9a7a5a');
    // the tree
    prect(46, 230, 8, 100, '#4a2a1a'); for (const [x, y, r] of [[50, 210, 30], [30, 230, 22], [72, 228, 22], [50, 186, 22]]) { pcircle(x, y, r, '#2a5a3a'); pcircle(x - 4, y - 4, r - 8, '#3a7a4a'); }
    // the fence
    for (let x = 0; x < SW; x += 14) { prect(x, 308, 4, 26, '#e8d8c0'); ppoly([[x, 308], [x + 4, 308], [x + 2, 304]], '#e8d8c0'); } prect(0, 314, SW, 2, '#c8b8a0'); prect(0, 326, SW, 2, '#c8b8a0');
  });
  L(1, () => {
    // the lawn, the hole, the girl, the ball
    pgrad(0, 330, SW, 320, ['#3a6a3a', '#2a5a2e', '#1e4424', '#142e1a']);
    for (let k = 0; k < 120; k++) { const r = RNG('grass', k), x = r.i(0, SW), y = r.i(334, 640), s = (beatN() + k) % 2; prect(x, y, 1, 3, '#4a8a4a'); pset(x + (s ? 1 : -1), y - 1, '#5a9a5a'); }
    const hx = 180, hy = 470;
    pellipse(hx, hy + 6, 70, 20, '#5a3a20'); pellipse(hx, hy, 60, 16, '#0a0608'); pellipse(hx, hy - 6, 60, 6, '#2a1a12'); pellipse(hx + 6, hy + 2, 40, 8, '#140a0c');   // dirt rim, the dark hole
    for (let k = 0; k < 24; k++) { const r = RNG('dirt', k); prect(hx - 80 + r.i(0, 160), hy + 14 + r.i(0, 14), 4, 3, '#7a5a30'); }   // the dug-out dirt
    ppoly([[hx + 70, hy + 20], [hx + 130, hy + 22], [hx + 110, hy - 4], [hx + 88, hy - 8]], '#6a4a28');
    prect(300, 420, 5, 50, '#8a6a3a'); ppoly([[292, 470], [312, 470], [310, 492], [294, 492]], '#9a9aaa');   // the shovel
    if (o.ball) o.ball(hx, hy);
    docShadow(80, 507, 22, 4, 0.5);
    girl(80, 506, { arm: o.arm ?? 0, wow: o.wow });
  });
}
function sceneGarden() {
  const t = TT, dropT = CU.drop, z = 1 + 5 * EZ.i3(clamp((t - CU.dive) / 0.8));
  spaceFrame(() => {
    gardenWorld(t, { arm: t < dropT ? 1 : 0, wow: t > dropT + 0.6, ball: (hx, hy) => {
      if (t < dropT) { ballSprite(102, 446 + Math.round(Math.sin(t * 3) * 2), 0, 1, { col: '#e04a3a' }); return; }
      const u = (t - dropT), y = 446 + 60 * u * u * 3; if (y < hy) ballSprite(102 + Math.min(78, u * 110), Math.round(y), clamp(u), 1, { col: '#e04a3a' });
    } });
    if (z > 1.01) { const im = ctx.getImageData(0, 0, SW, SH), c = pixCanvas(SW, SH, 'zoom'), g = c.getContext('2d'); g.putImageData(im, 0, 0); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#05060f'; ctx.fillRect(0, 0, SW, SH);
      ctx.drawImage(c, 180 - 180 / z, 470 - 470 / z, SW / z, SH / z, 0, 0, SW, SH); ctx.restore(); }
  }, { mosaic: t > 4.6 ? MOS[Math.round(clamp((t - 4.6) / 0.4) * 7)] : 1 });
  spCaptions();
}

// =====================================================================
//  2: the Earth in section, the tunnel drawn top to bottom; a loupe on Kola's 12 km: a hair at this scale
// =====================================================================
function sceneSection() {
  const t = TT, f = docFloat(2, 1.2), R = 150, cx = SCX + f.dx, cy = SCY + 10 + f.dy;
  spaceFrame(() => {
    starfield({ dx: -t * 3, dy: 0 });
    pglow(cx, cy, R, R + 20, '#4a6ad0', 0.35);
    pfield(cx - R, cy - R, 2 * R + 1, 2 * R + 1, (i, j) => {
      const r = Math.hypot(i - cx, j - cy) / R * RE; if (r > RE) return null;
      const right = i > cx;   // left half: the surface (oceans, land), right half: the section
      if (!right) { const x = (i - cx) / R, y = (j - cy) / R, z = Math.sqrt(Math.max(0, 1 - x * x - y * y)), land = fbm(Math.atan2(x, z) * 1.6 + t * 0.1 + 3, Math.asin(clamp(y, -1, 1)) * 2.4, 41, 4) > 0.56;
        const c = land ? [60, 130, 80] : [30, 70, 150]; return mix3([5, 8, 25], c, clamp(0.3 + z * 0.8)).map(Math.round); }
      let k = LAYERS.length - 1; while (k > 0 && r > LAYERS[k][0]) k--; if ((LAYERS[k][0] - r) / RE * R < 1) return RGB('#1a0a14');
      return RGB(ramp(LAYERS[k][1], clamp(0.35 + fbm(i * 0.05, j * 0.05, 20 + k, 2) * 0.6), i, j));
    });
    const u = EZ.io(clamp((t - 5.4) / 1.2)); for (let y = cy - R; y < cy - R + 2 * R * u; y++) { pset(cx, y, '#120810'); pset(cx + 1, y, '#120810'); if ((y | 0) % 4 < 2) pset(cx + 2, y, '#c06a4a'); }
    pcircle(cx, cy - R - 2, 2, '#e04a3a');
    docIris(cx + 92, cy - R - 10, irisR(CU.kola, 44), (lx, ly, rr) => {
      pgrad(lx - rr, ly - rr, 2 * rr + 1, 2 * rr + 1, ['#3a6a3a', '#5e2c78']);   // inside: 200 km of crust; the 12 km borehole is a stub
      prect(lx - rr, ly - rr, 2 * rr + 1, 14, '#2a5a2e'); prect(lx - 1, ly - rr + 14, 3, 4, '#e04a3a');
      prect(lx - rr, ly + 10, 2 * rr + 1, 1, '#c8a0ff');
    });
  }, { mosaic: mosaicAt() });
  docLabel('KOLA: 12 KM', (SCX + 92) * 3, (SCY - 140 + 44) * 3 + 40, { at: CU.kola + 0.5, fg: '#e04a3a', align: 'center' });
  docLabel('12.742 KM', (SCX - 40) * 3, SCY * 3 + 30, { at: 7.0, fg: '#ffe0b0', align: 'right' });
  spCaptions();
}

// =====================================================================
//  3–9: the fall. The ball holds the centre; the planet streams past; the ghost (textbook) beside it
// =====================================================================
function sceneFall(close = false) {
  const t = TT, min = simMin(t), st = realAt(min), gh = ghostAt(Math.min(min, 42.2)), f = docFloat(3, 0.8);
  const scale = (close ? 0.2 : 0.11) * (t < 10.5 ? 1 + 3 * (1 - EZ.o3(clamp((t - 9) / 1.5))) : 1);
  const dir = st.d < RE ? 1 : -1, sp = st.v / 10, shake = close && t < 35 ? Math.round(Math.sin(t * 40) * sp * 1.5) : 0;
  spaceFrame(() => {
    planetView(st.d, scale, t);
    // speed lines along the tunnel walls
    for (let k = 0; k < 24; k++) { const r = RNG('sl', k), y = mod(r.i(0, SH) - dir * t * 900 * sp, SH), x = SCX + (k % 2 ? 1 : -1) * r.i(16, 60); if (sp > 0.15 && (B + k) % 3 && Math.hypot(x - SCX, y - (SCY + (RE - st.d) * scale)) < RE * scale) pline(x, y, x, y - dir * 20 * sp, '#ffd8b080'.slice(0, 7)); }
    const gy = Math.round(SCY + (gh.d - st.d) * scale);
    if (gy > 0 && gy < SH) ghostSprite(SCX - 18, gy); else { const ey = gy <= 0 ? 150 : 600; ppoly([[SCX - 22, ey], [SCX - 14, ey], [SCX - 18, ey + (gy <= 0 ? -6 : 6)]], '#8a86a0'); }
    ballSprite(SCX + shake, SCY, sp, dir);
    if (st.g > 10.3 && t > 21 && t < 31) pcircle(SCX, SCY, 9 + (B % 3), '#ffd060', { ring: 1 });   // the core pulls harder
    if (t >= CU.center - 0.4 && t < CU.center + 0.6) pcircle(SCX, SCY, Math.round(6 + 30 * clamp((t - CU.center + 0.4) / 1)), '#ffffff', { ring: 1 });
  }, { mosaic: mosaicAt() });
  hud(min, st, st.g > 10.3);
  boundaryLabels(st.d, scale);
  const gyS = (SCY + (gh.d - st.d) * scale) * 3; if (gyS > 700 && gyS < 1600) docLabel('LIBRO', (SCX - 26) * 3, gyS - 10, { fg: '#b8b4c8', align: 'right' });
  docLabel('REAL', SCX * 3, SCY * 3 + 34, { fg: '#e8f4ff', align: 'center' });
  if (t > 24 && t < 27) docLabel('10,7 M/S²', 540, 1560, { at: 24.2, fg: '#ffd060', align: 'center', scale: 2 });
  if (close && t > 33 && t < 35) docLabel('0 G', 540, 1500, { at: 33.4, fg: '#e8f4ff', align: 'center', scale: 3 });
  spCaptions();
}
const sceneFallClose = () => sceneFall(true);

// =====================================================================
//  10: the far side: night on another continent; the ball pops out of a hole, stops in mid-air, the HUD freezes
// =====================================================================
function sceneArrive() {
  const t = TT, min = simMin(t), up = clamp((t - 44.5) / 0.9), y = Math.round(470 - 150 * (1 - (1 - up) ** 2)), f = docFloat(4, 1);
  spaceFrame(() => {
    pgrad(0, 0, SW, 360, ['#05060f', '#0a0d2a', '#1a1a4a', '#3a2a5a']);
    starfield({ dx: f.dx * 2, dy: 0 });
    pcircle(290 + f.dx * 0.2, 90, 14, '#e8e8f0'); pcircle(296 + f.dx * 0.2, 86, 12, '#0a0d2a');   // a crescent moon
    pshift(f.dx * 0.4, 0, () => { const P = [[-10, 380]]; for (let x = -10; x <= 370; x += 4) P.push([x, 330 - 30 * Math.sin(x * 0.01 + 2) - 10 * Math.sin(x * 0.04)]); P.push([370, 380]); ppoly(P, '#1a2a3a'); });
    pshift(f.dx * 0.7, 0, () => { prect(-10, 360, 380, 40, '#1a3a5a'); for (let k = 0; k < 30; k++) { const r = RNG('wave', k); prect(mod(r.i(0, 380) + t * 6, 380) - 10, r.i(362, 396), r.i(4, 10), 1, '#4a7aa0'); } });
    pgrad(0, 398, SW, 250, ['#1e3a24', '#142a1a', '#0a1a10']);
    for (let k = 0; k < 80; k++) { const r = RNG('ng', k), x = r.i(0, SW), yy = r.i(402, 640); prect(x, yy, 1, 3, '#2a4a2e'); }
    pellipse(180, 474, 40, 12, '#3a2a1a'); pellipse(180, 470, 34, 10, '#0a0608');
    for (let k = 0; k < 6; k++) { const r = RNG('dust3', k), u = clamp((t - 44.5) / 0.8); if (u > 0 && u < 1) pset(180 + r.i(-30, 30) * u, 468 - r.i(0, 40) * u, '#7a5a3a'); }
    ballSprite(180, y, (1 - up) * 0.5, -1);
    if (t > CU.ghostIn) { const g = clamp((t - CU.ghostIn) / 0.6); ghostSprite(150, Math.round(470 - 140 * (1 - (1 - g) ** 2))); }
  }, { mosaic: mosaicAt() });
  hud(Math.min(min, 38.2), realAt(Math.min(min, 38.2)), false);
  docLabel('38 MIN', 540, 1230, { at: 45.4, fg: '#e8f4ff', align: 'center', scale: 3 });
  docLabel('LIBRO: 42 MIN', 540, 1390, { at: CU.ghostIn + 0.5, fg: '#b8b4c8', align: 'center', scale: 2 });
  spCaptions();
}

// =====================================================================
//  11: where would you come out? A turning globe; a chord through the centre joins antipodes; dots drop to the sea
// =====================================================================
const CITIES = { madrid: [40.4, -3.7], welling: [-41.3, 174.8], bsas: [-34.6, -58.4], shang: [31.2, 121.5] };
function globeP(lat, lon, rot, R, cx, cy) {   // orthographic; returns [x, y, front]
  const la = lat * Math.PI / 180, lo = (lon + rot) * Math.PI / 180, x = Math.cos(la) * Math.sin(lo), y = -Math.sin(la), z = Math.cos(la) * Math.cos(lo);
  return [cx + x * R, cy + y * R * 0.98, z];
}
function sceneAntipode() {
  const t = TT, rot = -10 + (t - 49) * 22, R = 120, cx = SCX, cy = SCY + 20;
  spaceFrame(() => {
    starfield({ dx: -t * 4, dy: 0 }, { milky: true });
    pglow(cx, cy, R, R + 18, '#3a8ad0', 0.4);
    pfield(cx - R, cy - R, 2 * R + 1, 2 * R + 1, (i, j) => {
      const x = (i - cx) / R, y = (j - cy) / R, q = x * x + y * y; if (q > 1) return null;
      const z = Math.sqrt(1 - q), lat = Math.asin(-y) * 180 / Math.PI, lon = Math.atan2(x, z) * 180 / Math.PI - rot;
      const land = fbm(lon * 0.03 + 10, lat * 0.045 + 3, 41, 4) > 0.55, lit = clamp(0.25 + z * 0.9 - x * 0.2);
      const c = land ? (Math.abs(lat) > 62 ? [220, 235, 245] : [60, 130, 80]) : [30, 70, 150];
      return mix3([5, 8, 25], c, lit > bayer(i, j) * 0.4 ? lit : lit * 0.6).map(Math.round);
    });
    // the antipode chord (dashed through the globe), first Madrid–Wellington, then Buenos Aires–Shanghai
    const pair = t < CU.ant2 ? ['madrid', 'welling'] : ['bsas', 'shang'];
    if (t >= CU.ant1 && t < CU.sea) { const [a, b] = pair.map((k) => globeP(...CITIES[k], rot, R, cx, cy)), u = EZ.io(clamp((t - (t < CU.ant2 ? CU.ant1 : CU.ant2)) / 0.5));
      const ex = a[0] + (b[0] - a[0]) * u, ey = a[1] + (b[1] - a[1]) * u; for (const [x, y, s] of alongPts([[a[0], a[1]], [ex, ey]], 3)) pset(x, y, '#ffd060');
      for (const p of [a, b]) if (p[2] > -0.2) { pcircle(p[0], p[1], 3, '#e04a3a'); pcircle(p[0], p[1], 5 + (B % 3), '#e04a3a', { ring: 1 }); } }
    if (t >= CU.sea) for (let k = 0; k < 40; k++) { const r = RNG('anti', k), u = clamp((t - CU.sea - k * 0.03) / 0.3); if (u <= 0) continue; const a = r.f() * Math.PI * 2, d = Math.sqrt(r.f()) * R * 0.9, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
      const sea = k % 7 !== 0; pcircle(x, y - (1 - u) * 20, 2, sea ? '#7ac0ff' : '#ffd060'); if (sea && u >= 1 && (B + k) % 6 === 0) pcircle(x, y, 4, '#7ac0ff', { ring: 1 }); }
  }, { mosaic: mosaicAt() });
  if (t >= CU.ant1 && t < CU.sea) pair_labels(t, rot, R, cx, cy);
  spCaptions();
}
function pair_labels(t, rot, R, cx, cy) {
  const pairs = t < CU.ant2 ? [['madrid', 'ESPAÑA'], ['welling', 'N. ZELANDA']] : [['bsas', 'ARGENTINA'], ['shang', 'CHINA']];
  pairs.forEach(([k, s]) => { const p = globeP(...CITIES[k], rot, R, cx, cy); docLabel(s, clamp(p[0] * 3, 160, 900), clamp(p[1] * 3 - 40, 560, 1440), { fg: '#ffd060', align: 'center' }); });
}

// =====================================================================
//  12: forever: the Earth in section with the ball as a bright dot oscillating, the period ticking; then the garden
//  again: the ball pops back out of the hole in front of the girl, who catches it; the title
// =====================================================================
function sceneLoop() {
  const t = TT;
  if (t < CU.popOut - 0.3) {
    const R = 150, cx = SCX, cy = SCY + 20, ph = (t - 55) * 1.1;
    spaceFrame(() => {
      starfield({ dx: -t * 3, dy: 0 });
      pfield(cx - R, cy - R, 2 * R + 1, 2 * R + 1, (i, j) => { const r = Math.hypot(i - cx, j - cy) / R * RE; if (r > RE) return null; let k = LAYERS.length - 1; while (k > 0 && r > LAYERS[k][0]) k--; return RGB(ramp(LAYERS[k][1], clamp(0.35 + fbm(i * 0.05, j * 0.05, 20 + k, 2) * 0.6), i, j)); });
      for (let y = cy - R; y < cy + R; y++) { pset(cx, y, '#120810'); pset(cx + 1, y, '#120810'); }
      for (let k = 0; k < 14; k++) { const yy = cy - R * Math.cos(ph * Math.PI - k * 0.06); pset(cx, yy, k < 4 ? '#c8e0ff' : '#5a7ac0'); }
      ballSprite(cx, Math.round(cy - R * Math.cos(ph * Math.PI)), Math.abs(Math.sin(ph * Math.PI)) * 0.6, Math.sin(ph * Math.PI) > 0 ? 1 : -1);
    }, { mosaic: mosaicAt({ out: false }) });
    docLabel('76 MIN', 540, 1500, { at: 55.8, fg: '#e8f4ff', align: 'center', scale: 2 });
  } else {
    spaceFrame(() => gardenWorld(t, { arm: t > CU.popOut + 0.6 ? 1 : 0, wow: true, ball: (hx, hy) => {
      const u = clamp((t - CU.popOut) / 0.7), y = Math.round(hy - 60 * Math.sin(Math.PI * Math.min(1, u * 0.85)));
      ballSprite(hx - 40 * u, y, 0.2, -1, { col: '#e04a3a' }); if (u < 0.3) for (let k = 0; k < 6; k++) pset(hx + (k - 3) * 6, hy - 6 - k % 3 * 3, '#7a5a3a');
    } }), { mosaic: t < CU.popOut ? MOS[Math.round(clamp((CU.popOut - t) / 0.3) * 6)] : 1 });
  }
  spCaptions();
}
const SCENES = { garden: sceneGarden, section: sceneSection, fall: () => sceneFall(false), fallClose: sceneFallClose, arrive: sceneArrive, antipode: sceneAntipode, loop: sceneLoop };

// points along a polyline (pixels) every `step` px, with the fraction travelled
function alongPts(P, step) {
  const out = []; let acc = 0, tot = 0;
  for (let i = 1; i < P.length; i++) tot += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
  for (let i = 1; i < P.length; i++) {
    const [x0, y0] = P[i - 1], [x1, y1] = P[i], L = Math.hypot(x1 - x0, y1 - y0);
    for (let d = (step - acc % step) % step; d < L; d += step) out.push([x0 + (x1 - x0) * d / L, y0 + (y1 - y0) * d / L, (acc + d) / tot, Math.atan2(y1 - y0, x1 - x0)]);
    acc += L;
  }
  return out;
}
