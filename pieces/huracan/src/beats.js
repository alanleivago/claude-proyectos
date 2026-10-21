// =====================================================================
//  BEATS — ¿cómo se forma un huracán? Helpers (sea, clouds, spiral, side section, HUD) then one function per shot.
// =====================================================================
const SEA = ['#051638', '#082759', '#0c3d7d', '#0d526d', '#1c8a88', '#37a791', '#5ac8a8'];
const LAND = ['#2e4418', '#3e5a20', '#4d6828', '#6a8434', '#8aa048'];
const CLOUD = ['#5a6a9a', '#8a9ac0', '#c0cce0', '#e8eef6', '#ffffff'];
const windAt = (t) => { if (t <= WIND[0][0]) return WIND[0][1]; for (let i = 1; i < WIND.length; i++) if (t <= WIND[i][0]) { const [a, va] = WIND[i - 1], [b, vb] = WIND[i]; return va + (vb - va) * EZ.io((t - a) / (b - a)); } return WIND[WIND.length - 1][1]; };
const CATS = [[0, 'DEPRESIÓN TROPICAL', '#5ab0ff'], [63, 'TORMENTA TROPICAL', '#5ae0a0'], [119, 'CATEGORÍA 1', '#ffe060'], [154, 'CATEGORÍA 2', '#ffb040'], [178, 'CATEGORÍA 3', '#ff7a30'], [209, 'CATEGORÍA 4', '#ff4040'], [252, 'CATEGORÍA 5', '#ff50c8']];
const catOf = (v) => { let c = CATS[0]; for (const k of CATS) if (v >= k[0] - 0.5) c = k; return c; };
// the wind HUD (top left, under the caption box): km/h big, the category in its colour; a pop when the category changes
function windHud(t) {
  const v = windAt(t), [, name, col] = catOf(v), prevCat = catOf(windAt(t - 0.25))[1];
  pixDefer(() => lowres(DOC_TXT, () => {
    const pop = prevCat !== name ? 1 : 0;
    docText(`${Math.round(v)} KM/H`, 12, 90, '#eef0ea', { scale: 2, outline: '#051638' });
    docText(name, 12, 108, col, { scale: 1 + pop, outline: '#051638' });
    if (v >= 178) docText('MAYOR', 12 + docTextW(name) + 6, 108, '#c8d0e8', { outline: '#051638' });
  }));
}
// the sea from above: banded depth (fbm), drifting foam flecks, slow swell; o.land(i, j) → true where land
function seaTop(t, o = {}) {
  const off = o.off ?? [0, 0];
  pfield(0, 0, SW, SH, (i, j) => {
    if (o.land) { const L = o.land(i, j); if (L === 2) return RGB('#e8d8a0'); if (L) return RGB(ramp(LAND, fbm(i * 0.02, j * 0.02, 70, 3), i, j)); }
    const x = i + off[0], y = j + off[1], v = fbm(x * 0.006, y * 0.012 + t * 0.01, 60, 4) + 0.15 * Math.sin(y * 0.02 + t * 0.6);
    return RGB(ramp(SEA, clamp(0.15 + v * 0.75 + (o.warm ?? 0) * 0.1), i, j));
  });
  for (let k = 0; k < 60; k++) { const r = RNG('foam', k), x = mod(r.i(0, SW) + t * 4 + off[0], SW), y = mod(r.i(0, SH) + off[1], SH); if ((B + k) % 7 < 5) prect(x, y, r.i(2, 5), 1, '#6ad0c0'); }
}
// a puffy cloud cluster at (x, y), size s, shaded top-left light, blue bottom
function puff(x, y, s, seed = 1) {
  const R = RNG('puff', seed), n = 4 + Math.round(s / 4);
  const blobs = []; for (let k = 0; k < n; k++) blobs.push([x + R.n(s * 0.6), y + R.n(s * 0.3), s * (0.35 + R.f() * 0.3)]);
  pfield(x - s * 1.6, y - s, s * 3.2, s * 2, (i, j) => {
    let best = -1, top = 0; for (const [bx, by, br] of blobs) { const d = Math.hypot(i - bx, j - by) / br; if (d < 1 && (best < 0 || d < best)) { best = d; top = (j - by) / br; } }
    if (best < 0) return null;
    return RGB(ramp(CLOUD, clamp(0.85 - top * 0.45 - best * 0.15), i, j));
  });
}
// the hurricane from above: log-spiral arms of fbm cloud, a clear eye ringed by the eyewall; strength 0..1
function spiral(cx, cy, R, t, s, o = {}) {
  const eye = Math.max(0, (s - 0.55) / 0.45) * R * 0.11, rot = t * (0.6 + 1.6 * s);
  pfield(cx - R * 1.3, cy - R * 1.3, R * 2.6, R * 2.6, (i, j) => {
    const dx = i - cx, dy = j - cy, r = Math.hypot(dx, dy) / R; if (r > 1.25) return null;
    const a = Math.atan2(dy, dx) + rot - Math.log(r + 0.05) * (1.2 + 1.6 * s);   // counter-clockwise (north)
    const arms = 0.5 + 0.5 * Math.cos(a * 2 + fbm(dx * 0.02, dy * 0.02, 81, 2) * 3), n = fbm(Math.cos(a) * r * 3 + 5, Math.sin(a) * r * 3 + 5, 82, 3);
    let v = (arms * 0.55 + n * 0.6) * clamp(1.15 - r) * (0.6 + s * 0.6) + clamp(1 - r * 2.5) * s * 0.8;
    const er = Math.hypot(dx, dy);
    if (eye > 0 && er < eye) return er > eye - 2 ? RGB(o.eyeRim ?? '#ff5aa8') : RGB(ramp(SEA, 0.3, i, j));
    if (eye > 0 && er < eye + 6) v = Math.max(v, 1.0);
    if (v < 0.42) return v > 0.36 && (i + j) % 3 === 0 ? RGB(CLOUD[0]) : null;
    return RGB(ramp(CLOUD, clamp((v - 0.42) * 1.6 - (dx + dy) / R * 0.12), i, j));
  });
}

// ---- side section helpers: sky bands, the sea, a tower cloud with an orange heat core, arrows
function sideWorld(t, o = {}) {
  const hz = o.hz ?? 420;
  pgrad(0, 0, SW, hz, ['#0a1430', '#122050', '#1c3070', '#2a4a8a', '#4a72b0'], { ease: (u) => u ** 1.2 });
  for (let k = 0; k < 4; k++) { const y = 150 + k * 6; for (let x = 0; x < SW; x += 6) if ((x / 6 + k) % 2 === 0) pset(x, y, '#2a3a70'); }   // the tropopause, dashed
  pgrad(0, hz, SW, SH - hz, ['#37a791', '#1c8a88', '#0d526d', '#082759', '#051638']);
  prect(0, hz, SW, 2, '#7ae0c8');
  for (let k = 0; k < 40; k++) { const r = RNG('swell', k), x = mod(r.i(0, SW) + t * (6 + k % 4), SW + 20) - 10, y = hz + 4 + r.i(0, 24); prect(x, y, r.i(4, 10), 1, '#5ac8a8'); }
  // a buoy with a pole (scale) and a ship far off
  const bx = o.buoy ?? 70; prect(bx - 1, hz - 22, 2, 22, '#8a8aa0'); for (let k = 0; k < 4; k++) pline(bx - 4 + k, hz - 22 + k * 5, bx + 4 - k, hz - 17 + k * 5, '#6a6a80'); pellipse(bx, hz, 7, 3 + (B % 2), '#e8c040'); pset(bx, hz - 23, (B % 6) < 3 ? '#ff4040' : '#6a2020');
}
function tower(x, base, top, w, t, heat = 1) {   // a cumulonimbus: stacked puffs from base to top, an anvil when top < 180
  const n = Math.max(2, Math.round((base - top) / (w * 0.55)));
  for (let k = 0; k < n; k++) { const y = base - k * (base - top) / n, s = w * (0.6 + 0.15 * Math.sin(k * 1.7 + t)); puff(x + Math.sin(k * 2.1) * w * 0.15, y, s, 30 + k); }
  if (top < 190) { const L = Math.min(150, (190 - top) * 2.2 + 40); pfield(x - L, top - 16, 2 * L, 22, (i, j) => { const u = Math.abs(i - x) / L, h = 10 * (1 - u * u); if (j < top - 6 - h * 0.4 || j > top + 2 + h * 0.3) return null; return RGB(ramp(CLOUD, clamp(0.95 - (j - top + 6) / 20), i, j)); }); }
  if (heat > 0) for (let k = 0; k < 30 * heat; k++) { const r = RNG('heat', k), u = mod(r.f() + t * 0.5, 1), y = base - u * (base - top) * 0.95, xx = x + r.n(w * 0.2); if ((B + k) % 4) prect(xx, y, 2, 3, k % 3 ? HEAT : '#ffd060'); }
}
function arrow(x0, y0, x1, y1, col = '#c8d8ff', head = true) {
  for (const [x, y, f] of alongPts([[x0, y0], [x1, y1]], 1)) if (Math.floor(f * 30) % 2 === 0 || !head) pset(x, y, col);
  if (head) { const a = Math.atan2(y1 - y0, x1 - x0); for (const s of [-1, 1]) pline(x1, y1, x1 - Math.cos(a + s * 0.6) * 5, y1 - Math.sin(a + s * 0.6) * 5, col); }
}
function palm(x, base, h, bend, t) {   // a palm tree bending to the right by `bend` (0..1)
  const pts = []; for (let k = 0; k <= 20; k++) { const u = k / 20; pts.push([x + bend * h * 0.6 * u * u + Math.sin(t * 9 + u * 3) * bend * 2 * u, base - h * u * (1 - bend * 0.25)]); }
  for (let k = 1; k < pts.length; k++) { pbeam(pts[k - 1][0], pts[k - 1][1], pts[k][0], pts[k][1], 9 - k * 0.25, k % 2 ? '#7a5a34' : '#5a3e22'); pbeam(pts[k - 1][0] + 2, pts[k - 1][1], pts[k][0] + 2, pts[k][1], 2, '#3a2814'); }
  const [tx, ty] = pts[pts.length - 1];
  for (let f = 0; f < 11; f++) { const a = -Math.PI / 2 + (f - 5) * 0.34 + bend * 1.3 + Math.sin(t * 11 + f) * 0.14 * (0.3 + bend), L = 46 + (f % 3) * 10;
    for (let k = 0; k < L; k++) { const u = k / L, xx = tx + Math.cos(a) * k + bend * u * u * 16, yy = ty + Math.sin(a) * k + u * u * 22 * (1 - bend * 0.6); pbeam(xx, yy, xx + 1, yy + 1, 3 - u * 2, '#2a7a3a'); if (k % 2 === 0) { pline(xx, yy, xx - Math.sin(a) * 7 * (1 - u), yy + Math.cos(a) * 7 * (1 - u) + 2, '#3a9a4a'); pline(xx, yy, xx + Math.sin(a) * 6 * (1 - u), yy - Math.cos(a) * 6 * (1 - u) + 3, '#1e5a2a'); } } }
  for (const [dx, dy] of [[0, 4], [5, 6], [-4, 7]]) pcircle(tx + dx, ty + dy, 3, '#5a3a1a');
}

// =====================================================================
//  1: the hook. A beach at storm light: palms bend, rain flies sideways, waves pound; then a mosaic up to space
// =====================================================================
function scenePalm() {
  const t = TT, gust = 0.55 + 0.35 * Math.sin(t * 2.3) + 0.1 * Math.sin(t * 7), sh = Math.round(Math.sin(t * 31) * 1.5);
  spaceFrame(() => {
    pgrad(0, 0, SW, 400, ['#10141e', '#1e2636', '#2e3a4e', '#46566a', '#5e6e80']);
    pfield(0, 0, SW, 380, (i, j) => { const v = fbm(i * 0.012 - t * 0.5, j * 0.025, 90, 4); return v > 0.5 ? RGB(ramp(['#1a2030', '#2a3244', '#3e485c', '#566276'], clamp((v - 0.5) * 2.4 - j / 900), i, j)) : null; });
    for (let k = 0; k < 5; k++) { const r = RNG('scud', k); pcloud(mod(r.i(0, 400) + t * 60 * (1 + k * 0.3), 460) - 60, 60 + k * 50, 70, k, { lt: '#4a5466', dk: '#2a3040' }); }
    if ((B % 37) < 2) pfill('#c8d0e8');   // a lightning flash now and then
    pshift(sh, 0, () => {
      const P = [[-10, 420]]; for (let x = -10; x <= 370; x += 4) P.push([x, 400 + 8 * Math.sin(x * 0.05 + t * 3)]); P.push([370, 420]); ppoly(P, '#2a5a6a');
      pgrad(0, 410, SW, 70, ['#2a5a6a', '#3a7a7a']);
      for (let k = 0; k < 6; k++) { const x = mod(k * 70 + t * 40, 420) - 30, y = 418 + 8 * Math.sin(t * 2 + k); pfield(x - 24, y - 10, 48, 18, (i, j) => { const u = (i - x) / 24, h = 8 * (1 - u * u); return j > y - h && j < y + 3 ? RGB(j < y - h + 3 ? '#e8f4f0' : '#7ac0c0') : null; }); }
      pgrad(0, 470, SW, 170, ['#c8b07a', '#b09868', '#8a7650']);
      for (let k = 0; k < 40; k++) { const r = RNG('sand', k); prect(r.i(0, SW), r.i(476, 636), 2, 1, '#a08a5a'); }
      palm(230, 600, 280, clamp(gust), t); palm(80, 620, 200, clamp(gust * 0.9), t + 1);
      docShadow(260, 602, 40, 5, 0.4);
    });
    for (let k = 0; k < 140; k++) { const r = RNG('rain', k), x = mod(r.i(0, 500) + t * 700, 520) - 80, y = mod(r.i(0, SH) + t * 300, SH); pline(x, y, x + 10, y + 4, k % 3 ? '#8aa0c0' : '#c0d0e8'); }   // sideways rain
    for (let k = 0; k < 8; k++) { const r = RNG('leaf', k), x = mod(r.i(0, 400) + t * 260, 420) - 30, y = 200 + r.i(0, 300) + Math.sin(t * 8 + k) * 10; prect(x, y, 3, 1, '#3a8a4a'); }
  }, { mosaic: mosaicAt({ in: false }) });
  spCaptions();
}
// ---- 2: the warm sea from above: scattered small clouds; a thermometer climbs past 26,5 °C
function sceneSea() {
  const t = TT, f = docFloat(2, 1.2), z = 1 + 0.15 * EZ.io(clamp((t - 4) / 4));
  spaceFrame(() => {
    seaTop(t, { off: [f.dx * 2 - (z - 1) * 180, f.dy * 2 - (z - 1) * 320], warm: clamp((t - 5) / 2) });
    for (let k = 0; k < 14; k++) { const r = RNG('cu', k), x = r.i(20, 340) + t * 3, y = r.i(140, 600); puff(x, y, 5 + r.i(0, 5), k); docShadow(x + 8, y + 10, 8, 3, 0.35, '#051638'); }
    // the thermometer
    const u = EZ.io(clamp((t - CU.thermo) / 1.5)), tx = 300, ty = 380, hgt = 130, lvl = Math.round(hgt * (0.35 + 0.5 * u));
    prect(tx - 7, ty - hgt - 6, 14, hgt + 8, '#eef0ea'); prect(tx - 5, ty - hgt - 4, 10, hgt + 4, '#0a1430'); pcircle(tx, ty + 8, 11, '#eef0ea'); pcircle(tx, ty + 8, 9, '#ff4a3a');
    prect(tx - 3, ty - lvl, 6, lvl + 4, '#ff4a3a'); prect(tx - 3, ty - lvl, 2, lvl, '#ff8a7a');
    const mark = ty - Math.round(hgt * 0.75); prect(tx - 12, mark, 24, 1, '#ffd060');
  }, { mosaic: mosaicAt() });
  docLabel('26,5 °C', 300 * 3 - 60, (380 - 130 * 0.75) * 3 - 26, { at: CU.thermo + 1.2, fg: '#ffd060', align: 'right', scale: 2 });
  spCaptions();
}
// ---- 3–4: the side section: vapour rises from the sea (blue specks), condenses into a cloud that releases orange heat,
// grows into a tower with an anvil; air flows in at the surface (arrows) and out at the top
function sceneSide() {
  const t = TT, f = docFloat(3, 1), hz = 420, g = EZ.io(clamp((t - CU.updraft) / 1.4)), top = Math.round(330 - g * 170), small = clamp((t - 9.2) / 1.2);
  spaceFrame(() => {
    sideWorld(t, { hz });
    pshift(f.dx, f.dy, () => {
      // evaporation: specks rise from the whole sea surface, faster where the cloud is
      for (let k = 0; k < 80; k++) { const r = RNG('vap', k), u = mod(r.f() + t * (0.25 + r.f() * 0.2), 1), x = r.i(10, 350) + Math.sin(u * 6 + k) * 4, y = hz - 2 - u * 110; if (u < 0.9 && (B + k) % 5) pset(x, y, u > 0.6 && t > CU.latent ? HEAT : '#9ad8ff'); }
      if (t > 8.8) tower(200, 320, top, 22 + 14 * small + 8 * g, t, t > CU.latent ? 0.6 + g : 0);
      if (t > 9.4) puff(80, 300, 10 + 4 * small, 7);
      if (t > CU.inflow) { const a = clamp((t - CU.inflow) / 0.6), x0 = 330 - 140 * a; for (const [s, y] of [[1, hz - 8], [-1, hz - 16]]) arrow(s > 0 ? x0 : 400 - x0 - 30, y, s > 0 ? x0 - 40 : 400 - x0 + 10, y, '#c8d8ff'); arrow(200, hz - 30, 200, top + 20, '#ffd060'); }
      if (t > CU.anvil) { const a = clamp((t - CU.anvil) / 0.6); arrow(200, top - 10, 200 - 60 * a - 20, top - 10, '#c8d8ff'); arrow(200, top - 10, 200 + 60 * a + 20, top - 10, '#c8d8ff'); }
    });
  }, { mosaic: mosaicAt() });
  if (t > CU.latent) docLabel('CALOR', 690, (300 - 40) * 3, { at: CU.latent + 0.6, fg: HEAT });
  docLabel('VAPOR', 120, (hz - 60) * 3, { at: 8.6, until: CU.updraft, fg: '#9ad8ff' });
  spCaptions();
}
// ---- 5: the globe: little spirals turn one way in the north, the other in the south; an empty band at the equator
function sceneGlobe() {
  const t = TT, rot = (t - 17) * 14, R = 130, cx = SCX, cy = SCY + 10;
  spaceFrame(() => {
    starfield({ dx: -t * 3, dy: 0 }, { milky: true });
    pglow(cx, cy, R, R + 18, '#3a8ad0', 0.45);
    pfield(cx - R, cy - R, 2 * R + 1, 2 * R + 1, (i, j) => {
      const x = (i - cx) / R, y = (j - cy) / R, q = x * x + y * y; if (q > 1) return null;
      const z = Math.sqrt(1 - q), lat = Math.asin(-y) * 180 / Math.PI, lon = Math.atan2(x, z) * 180 / Math.PI - rot;
      const land = fbm(lon * 0.03 + 10, lat * 0.045 + 3, 41, 4) > 0.56, lit = clamp(0.25 + z * 0.9 - x * 0.2);
      let c = land ? [77, 104, 40] : [13, 82, 109]; if (Math.abs(lat) > 62) c = [220, 235, 245];
      if (t > CU.equator && Math.abs(lat) < 5 && (i + j) % 2) c = mix3(c, [255, 208, 96], 0.35);
      return mix3([5, 8, 25], c, lit).map(Math.round);
    });
    for (let k = 0; k < 7; k++) { const r = RNG('cyc', k), north = k % 2 === 0, lat = (north ? 1 : -1) * (12 + r.i(0, 18)), lon = r.i(-60, 60), p = globeP(lat, lon, rot, R, cx, cy); if (p[2] < 0.2) continue;
      const s = 6 + r.i(0, 4); for (let a = 0; a < 3; a++) for (let q = 0; q < 14; q++) { const th = a * 2.09 + q * 0.3 * (north ? -1 : 1) + t * 2.5 * (north ? -1 : 1), rr = q / 14 * s; pset(p[0] + Math.cos(th) * rr, p[1] + Math.sin(th) * rr * 0.9, '#ffffff'); } }
  }, { mosaic: mosaicAt() });
  docLabel('NORTE: GIRA A LA IZQUIERDA', 540, 600, { at: 17.8, fg: '#eef0ea', align: 'center' }); docLabel('SUR: A LA DERECHA', 540, 1420, { at: 18.2, fg: '#eef0ea', align: 'center' });
  if (TT > CU.equator) docLabel('ECUADOR', 840, (SCY + 10) * 3 - 10, { at: CU.equator + 0.3, fg: '#ffd060' });
  spCaptions();
}
function globeP(lat, lon, rot, R, cx, cy) { const la = lat * Math.PI / 180, lo = (lon + rot) * Math.PI / 180; return [cx + Math.cos(la) * Math.sin(lo) * R, cy - Math.sin(la) * R, Math.cos(la) * Math.cos(lo)]; }
// ---- 6: from above: cloud cells gather into a spiral; arrows of inflow; the counter climbs; the eye opens; a coast appears
const coastX = (j) => -40 + j * 0.16 + 12 * Math.sin(j * 0.02);
const landOf = (dx) => (i, j) => { const c = coastX(j) + dx; return i < c ? 1 : i < c + 3 ? 2 : 0; };
function sceneSpin(close = false) {
  const t = TT, s = clamp((t - 21) / 8.5), f = docFloat(4, 1.2), R = Math.round((close ? 200 : 70 + 70 * s)), cx = SCX + 30 + f.dx, cy = SCY + 20 + f.dy;
  spaceFrame(() => {
    seaTop(t, { off: [f.dx * 3, f.dy * 3 + t * 6], land: landOf(close ? -120 : 0) });
    if (s < 0.4) for (let k = 0; k < 10; k++) { const r = RNG('cell', k), a = r.f() * 6.28 - t * 0.8, d = (1 - s * 2) * 110 + 20; puff(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 6 + r.i(0, 4), k + 50); }
    docShadow(cx + 14, cy + 18, R * 0.9, R * 0.75, 0.3, '#051638');
    spiral(cx, cy, R, t, close ? 1 : s);
    if (!close && t < 25) for (let k = 0; k < 6; k++) { const a = k * 1.05 - t * 0.9, d = 150 - (t - 21) * 6; arrow(cx + Math.cos(a) * d, cy + Math.sin(a) * d, cx + Math.cos(a - 0.5) * (d - 30), cy + Math.sin(a - 0.5) * (d - 30), '#c8d8ff'); }
  }, { mosaic: close ? 1 : mosaicAt({ out: false }) });
  windHud(t);
  if (t > CU.eyeOpen && !close) docLabel('OJO', (SCX + 30) * 3 + 70, (SCY + 20) * 3 - 70, { at: CU.eyeOpen + 0.3, fg: '#ff5aa8' });
  spCaptions();
}
// ---- 7: a second of dark (only a pin-prick of blue): the held breath
function sceneDark() { spaceFrame(() => { pfill('#03060f'); pcircle(SCX, SCY, 1, '#5a8aff'); }); }
// ---- 8: the section through the storm: two eyewall towers with heat columns, a calm eye with blue sky and a
// sinking-air arrow; rain curtains; a hurricane-hunter plane flies through the wall, shaking
function sceneSection() {
  const t = TT, f = docFloat(5, 1), hz = 470, eyeW = 70;
  spaceFrame(() => {
    sideWorld(t, { hz, buoy: 30 });
    pshift(f.dx, f.dy, () => {
      pgrad(SCX - eyeW, 150, 2 * eyeW, hz - 150, ['#3a6ac0', '#5a8ad8', '#8ab0e8']);   // the clear eye
      for (const s of [-1, 1]) {
        const x = SCX + s * (eyeW + 26); tower(x, hz - 40, 150, 34, t, 1.4);
        for (let k = 0; k < 4; k++) tower(x + s * (70 + k * 40), hz - 40, 230 + k * 40, 22 - k * 3, t + k, 0.4);
        for (let k = 0; k < 24; k++) { const r = RNG('rain2', s, k), xx = x + r.i(-30, 30), y = mod(r.i(0, 80) + t * 220, 90) + hz - 90; pline(xx, y, xx - s * 2, y + 6, '#9ab8e8'); }
        arrow(x + s * 160, hz - 10, x + s * 40, hz - 10, '#c8d8ff'); arrow(x, 160, x + s * 120, 150, '#c8d8ff');
      }
      if (t > 32.6) { const a = clamp((t - 32.6) / 0.8); arrow(SCX, 190, SCX, 190 + 120 * a, '#ffffff'); }
      // the plane: enters from the right at 34.8, shakes in the wall, calm in the eye
      if (t > CU.plane) { const u = (t - CU.plane) / 3.0, px = Math.round(380 - u * 420), inWall = Math.abs(Math.abs(px - SCX) - (eyeW + 26)) < 30, py = 300 + (inWall ? Math.round(Math.sin(t * 50) * 3) : 0);
        pellipse(px, py, 26, 5, '#e8e8f0'); prect(px - 24, py + 3, 48, 2, '#9a9ab0'); ppoly([[px - 4, py], [px + 12, py], [px + 4, py + 18]], '#c8c8d8'); ppoly([[px - 4, py], [px + 12, py], [px + 4, py - 14]], '#d8d8e8'); ppoly([[px + 18, py - 3], [px + 26, py - 3], [px + 27, py - 16]], '#c8c8d8'); for (let k = 0; k < 6; k++) prect(px - 18 + k * 5, py - 2, 3, 2, '#3a5aa0'); pset(px - 26, py, '#ff4040'); pcircle(px - 2, py + 9, 2, '#8a8aa0'); }
    });
  }, { mosaic: mosaicAt({ in: false }) });
  docLabel('AIRE QUE BAJA', 540, 900, { at: 33.0, until: 34.8, fg: '#eef0ea', align: 'center' });
  spCaptions();
}
// ---- 9: the heat leaves the section as orange streams into a night map whose cities light up across the world
function sceneEnergy() {
  const t = TT, u = clamp((t - CU.grid) / 3.5);
  spaceFrame(() => {
    pfill('#03060f'); starfield({ dx: -t * 2, dy: 0 });
    const R = 150, cx = SCX, cy = SCY + 30;
    pfield(cx - R, cy - R, 2 * R + 1, 2 * R + 1, (i, j) => { const x = (i - cx) / R, y = (j - cy) / R, q = x * x + y * y; if (q > 1) return null; const z = Math.sqrt(1 - q), lat = Math.asin(-y) * 57.3, lon = Math.atan2(x, z) * 57.3 + (t - 38) * 6;
      const land = fbm(lon * 0.03 + 10, lat * 0.045 + 3, 41, 4) > 0.56; if (land && dhash(i, j, 9) < 0.05 * u * 3 && dhash(i, j, 10) < u) return [255, 210, 120]; return mix3([3, 6, 15], land ? [30, 40, 26] : [8, 20, 40], 0.6 + z * 0.4).map(Math.round); });
    pglow(cx, cy, R, R + 14, '#3a5ab0', 0.3);
    for (let k = 0; k < 40; k++) { const r = RNG('hs', k), v = mod(r.f() + t * 0.4, 1), a = r.f() * 6.28, x = SCX + Math.cos(a) * (40 + v * 120), y = 120 + v * 140 + Math.sin(a) * 20; if (t < CU.grid + 2.5) prect(x, y, 2, 2, HEAT); }
    spiral(SCX, 90, 46, t, 1);
  }, { mosaic: mosaicAt() });
  docLabel('1 DÍA', 540, 1390, { at: 41.0, fg: HEAT, align: 'center', scale: 2 }); docLabel('≈ 6 MESES', 540, 1460, { at: 41.3, fg: HEAT, align: 'center', scale: 2 });
  spCaptions();
}
// ---- 10: landfall from beside: a beach town, the surge climbs, palms bend flat, roofs shiver; then from above
function sceneLandfall() {
  const t = TT, surge = EZ.io(clamp((t - CU.surge) / 2.2)), gust = 0.85 + 0.15 * Math.sin(t * 5), sh = Math.round(Math.sin(t * 37) * 2);
  spaceFrame(() => {
    pgrad(0, 0, SW, 380, ['#0c0f18', '#161e2c', '#22304a', '#34445e']);
    for (let k = 0; k < 6; k++) { const r = RNG('scud2', k); pcloud(mod(r.i(0, 400) + t * 90 * (1 + k * 0.2), 460) - 60, 40 + k * 45, 80, k + 9, { lt: '#3a4456', dk: '#1e2432' }); }
    pshift(sh, 0, () => {
      prect(0, 400, SW, 240, '#c8b07a');
      for (const [x, w, h] of [[200, 50, 50], [262, 40, 40], [312, 46, 58]]) { prect(x, 400 - h, w, h, '#d8c8a8'); ppoly([[x - 4, 400 - h], [x + w + 4, 400 - h], [x + w / 2, 400 - h - 18]], '#8a3a2a'); prect(x + 8, 400 - h + 14, 10, 10, (B % 5) ? '#f2cc6a' : '#5a4a2a'); }
      palm(160, 404, 120, gust, t); palm(90, 410, 100, gust, t + 2);
      const lvl = Math.round(440 - 70 * surge); pfield(0, lvl - 12, SW, SH - lvl + 12, (i, j) => { const top = lvl + 6 * Math.sin(i * 0.06 - t * 4) + (i > 200 ? (i - 200) * 0.05 : 0); if (j < top) return null; return RGB(j < top + 3 ? '#e8f4f0' : ramp(['#7ac0c0', '#3a8a8a', '#1e5a6a'], clamp((j - top) / 80), i, j)); });
      for (let k = 0; k < 20; k++) { const r = RNG('spray', k), x = mod(r.i(0, 380) + t * 120, 380), y = lvl - r.i(0, 30) * surge; pset(x, y, '#e8f4f0'); }
    });
    for (let k = 0; k < 160; k++) { const r = RNG('rain3', k), x = mod(r.i(0, 500) + t * 800, 520) - 80, y = mod(r.i(0, SH) + t * 340, SH); pline(x, y, x + 12, y + 4, k % 3 ? '#8aa0c0' : '#c0d0e8'); }
  }, { mosaic: mosaicAt() });
  windHud(t);
  if (t > CU.surge) docLabel('MAREJADA', 540, 1250, { at: CU.surge + 0.5, fg: '#9ad8ff', align: 'center', scale: 2 });
  spCaptions();
}
// ---- 11: from above over land: the spiral unravels and fades; the counter falls category by category
function sceneDecay() {
  const t = TT, s = 1 - clamp((t - 50) / 5.5), f = docFloat(6, 1.2), cx = SCX - 40 + (t - 50) * 6 + f.dx, cy = SCY + f.dy;
  spaceFrame(() => {
    seaTop(t, { off: [f.dx * 3 + 140, f.dy * 3], land: landOf(260) });
    docShadow(cx + 14, cy + 18, 100 * (0.5 + s * 0.5), 80 * (0.5 + s * 0.5), 0.3 * s, '#051638');
    spiral(cx, cy, Math.round(90 + 40 * s), t, s * 0.85, { eyeRim: '#ff8a8a' });
    for (let k = 0; k < 12; k++) { const r = RNG('shred', k), a = r.f() * 6.28 + t * 0.4, d = 110 + (1 - s) * 80; if (s < 0.7) puff(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, 5, k + 80); }
  }, { mosaic: mosaicAt() });
  windHud(t);
  docLabel('SIN COMBUSTIBLE', 540, 1460, { at: 52.6, fg: HEAT, align: 'center' });
  spCaptions();
}
// ---- 12: the calm warm sea again: a single small cloud begins to grow (the cycle), then the title
function sceneCalm() {
  const t = TT, f = docFloat(7, 1), g = clamp((t - CU.newCloud) / 3);
  spaceFrame(() => {
    seaTop(t, { off: [f.dx * 2, f.dy * 2], warm: 1 });
    for (let k = 0; k < 10; k++) { const r = RNG('cu2', k), x = r.i(20, 340) + t * 2, y = r.i(300, 600); puff(x, y, 4 + r.i(0, 4), k + 120); }
    if (t > CU.newCloud) { puff(SCX, SCY + 60, Math.round(6 + 14 * g), 140); docShadow(SCX + 10, SCY + 76, 10 + 12 * g, 4 + 4 * g, 0.35, '#051638');
      for (let k = 0; k < 10; k++) { const r = RNG('vap2', k), u = mod(r.f() + t * 0.5, 1); pset(SCX + r.n(20), SCY + 80 - u * 30, u > 0.6 ? HEAT : '#9ad8ff'); } }
  }, { mosaic: mosaicAt({ out: false }) });
  spCaptions();
}
const SCENES = { palm: scenePalm, sea: sceneSea, side: sceneSide, globe: sceneGlobe, spin: () => sceneSpin(false), spinClose: () => sceneSpin(true), dark: sceneDark,
  section: sceneSection, energy: sceneEnergy, landfall: sceneLandfall, decay: sceneDecay, calm: sceneCalm };

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
