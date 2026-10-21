// =====================================================================
//  BEATS — polvo de estrellas. One function per beat (SHOT_LIST); helpers in scenes.js.
//  Every beat: camera life (float/push/zoom), parallax stars, a visible process, a mosaic zoom into the next beat.
// =====================================================================

// ---- 1: the hook. A vessel wall each side, cells tumbling in the flow (three depths); we zoom into one cell,
// through a mosaic into its iron atom; at the end the atom collapses into a point of light (the next beat's star)
function vesselWall(t, z) {
  for (const side of [-1, 1]) pfield(side < 0 ? 0 : SW - 70, 0, 70, SH, (i, j) => {
    const edge = SCX + side * (150 + 14 * Math.sin(j * 0.02 + t * 0.8)) * Math.min(1.6, z), d = side * (i - edge);
    if (d < 0) return null;
    const v = fbm(i * 0.04, j * 0.03 - t * 0.6, 13, 2);
    return RGB(ramp(['#1a0204', '#2e0408', '#4a0a10', '#7a1a20'], d < 3 ? 0.95 : clamp(0.15 + v * 0.6 - d * 0.004), i, j));
  });
}
function sceneBlood() {
  const t = shotT(), z = 1 + 2.4 * EZ.io(clamp(t / 1.6));
  spaceFrame(() => {
    if (t < 1.6) {
      pfield(0, 0, SW, SH, (i, j) => RGB(ramp(['#120103', '#1e0205', '#2e0407', '#3a0609'], fbm(i * 0.012, j * 0.01 - t * 0.35, 9, 3) * 0.9, i, j)));
      // three depths of cells: far (small, dark, slow), mid, near (big, fast); all drift down the vessel
      for (const [depth, n, sz, sp] of [[0.4, 14, 8, 30], [0.7, 10, 14, 55], [1.0, 5, 22, 90]]) for (let k = 0; k < n; k++) {
        const r = RNG('rbc', depth, k), y = mod(r.i(0, SH + 80) + t * sp, SH + 80) - 40, x = SCX + (r.i(-130, 130) + Math.sin(t * 1.3 + k) * 6) * (1 + (z - 1) * depth);
        bloodCell(Math.round(SCX + (x - SCX) * z * 0.7), Math.round(SCY + (y - SCY) * (1 + (z - 1) * depth)), Math.round(sz * (1 + (z - 1) * depth * 0.6)), r.f() * 3 + t * (0.8 + depth));
      }
      bloodCell(SCX, SCY + 30, Math.round(26 * z), 0.25 + t * 0.4);
      vesselWall(t, z);
    } else {
      starfield({ dx: -t * 4, dy: 0 });
      pfield(0, 0, SW, SH, (i, j) => { const d = Math.hypot(i - SCX, j - SCY - 40) / 320; return d < 1 ? [52, 6, 12, (1 - d) * 0.45] : null; });
      const shrink = 1 - EZ.i3(clamp((t - CU.zoomOut) / 0.55));
      if (shrink > 0.03) ironAtom(SCX, SCY + 40, 140 * shrink, t);
      if (t > CU.zoomOut) { const u = clamp((t - CU.zoomOut) / 0.55); pglow(SCX, SCY + 40 * (1 - u), 1, 6 + 26 * u, '#c8d4ff', 0.7); pcircle(SCX, SCY + 40 * (1 - u), 1 + Math.round(2 * u), '#ffffff'); }
    }
  }, { mosaic: t > 1.35 && t < 1.85 ? MOS[Math.round((1 - Math.abs(t - 1.6) / 0.25) * 6)] : mosaicAt({ in: false }) });
  if (t >= 1.8 && t < CU.zoomOut) docLabel('~Fe', 540, 1290, { at: 1.9, fg: EL.Fe, scale: 3, align: 'center' });
  if (t >= 2.1 && t < CU.zoomOut) docLabel('HIERRO · 26 PROTONES', 540, 1430, { at: 2.1, align: 'center', fg: D.cap });
  spCaptions();
}

// ---- 2: the first cloud: mostly hydrogen (blue specks), a little helium (violet); slow turn, a push-in
function nebulaRich(cx, cy, R, t, o = {}) {
  nebula(cx, cy, R, t, { ...o, cols: ['#0a0d24', '#1a1f5a', '#2e2f8a', '#4a3cb0', '#7a4ac8', '#c060c8', '#e080c0', '#9ab8ff', '#e8e0ff'] });
  // dark dust lanes across it
  pfield(cx - R, cy - R, 2 * R, 2 * R, (i, j) => { const dx = (i - cx) / R, dy = (j - cy) / R, r = Math.hypot(dx, dy); if (r > 0.95) return null; const a = Math.atan2(dy, dx) + (o.swirl ?? 1) * (1 - r) * 2.2 + t * 0.15 * (o.swirl ?? 1); const v = fbm(Math.cos(a) * r * 4 + 2, Math.sin(a) * r * 4 + 7, 61, 3); return v > 0.66 ? [10, 10, 28, (v - 0.66) * 4] : null; });
}
function sceneNebula() {
  const t = TT, R = Math.round(160 + 22 * EZ.io(clamp((t - 4) / 4))), f = docFloat(4, 1.5);
  spaceFrame(() => {
    starfield({ dx: -t * 3 + f.dx * 3, dy: f.dy * 3 }, { milky: true });
    nebulaRich(SCX + f.dx, SCY + f.dy, R, t, { swirl: 1.0, seed: 3 });
    for (let k = 0; k < 60; k++) {   // atoms drifting: 92 % hydrogen, 8 % helium (by number)
      const r = RNG('atom', k), a = r.f() * Math.PI * 2 + t * (0.12 + r.f() * 0.1), d = R * (0.2 + 0.8 * r.f()), x = SCX + Math.cos(a) * d + f.dx, y = SCY + Math.sin(a) * d * 0.9 + f.dy, he = k % 12 === 0;
      prect(x - 1, y - 1, 2, 2, he ? EL.He : EL.H); if ((B + k) % 9 === 0) pglow(x, y, 1, 4, he ? EL.He : EL.H, 0.6);
    }
  }, { mosaic: mosaicAt() });
  docLabel('H', 250, 1140, { at: 5.0, fg: EL.H, scale: 2 }); docLabel('H', 820, 860, { at: 5.3, fg: EL.H, scale: 2 }); docLabel('~He', 700, 1300, { at: 5.8, fg: EL.He, scale: 2 });
  spCaptions();
}

// ---- 3: gravity squeezes the cloud: it spins up, gas streams fall in, a shock ring runs inward, the core ignites
function sceneIgnite() {
  const t = TT, c = clamp((t - 8) / 2), R = Math.round(175 - 115 * EZ.io(c)), f = docFloat(5, 1.2);
  spaceFrame(() => {
    starfield({ dx: -t * 3 + f.dx * 3, dy: f.dy * 3 });
    if (t < CU.ignite + 0.6) nebulaRich(SCX, SCY, R, t, { swirl: 1 + 3 * c, core: c * 1.4, seed: 3 });
    for (let k = 0; k < 40; k++) {   // infall streams spiralling inward
      const r = RNG('fall', k), u = mod(t * 0.6 + r.f(), 1), a = r.f() * Math.PI * 2 + u * 3.5, d = (1 - u) * 190 + 8, x = SCX + Math.cos(a) * d, y = SCY + Math.sin(a) * d;
      if (t < CU.ignite + 0.4) { pset(x, y, '#9ab8ff'); pset(x - Math.cos(a + 1.57) * 2, y - Math.sin(a + 1.57) * 2, '#4a5ab0'); }
    }
    if (t >= CU.shock && t < CU.ignite + 0.2) { const u = clamp((t - CU.shock) / 0.8), rr = Math.round(R * 1.1 * (1 - u)); pcircle(SCX, SCY, rr, '#e8e0ff', { ring: 1 }); pcircle(SCX, SCY, rr + 3, '#6a6ae0', { ring: 1 }); }
    if (t >= CU.ignite) {
      const u = clamp((t - CU.ignite) / 0.5), rs = Math.round(10 + 18 * EZ.o3(clamp((t - CU.ignite) / 1.5)));
      if (t < CU.ignite + 1 / 12) pfill('#e8e0ff');
      pglow(SCX, SCY, rs, rs + 70 * u, '#9ab8ff', 0.45);
      starBall(SCX, SCY, rs, BLUE_STAR, t, { halo: 2.2, cell: 3 });
      const L = Math.round((rs + 40) * (1.2 - 0.2 * Math.sin(t * 6)));   // the four-point flare
      for (let k = -L; k <= L; k++) { const a = 1 - Math.abs(k) / L; if (a * 1.2 > bayer(SCX + k, SCY)) { pset(SCX + k, SCY, '#e8f0ff'); pset(SCX, SCY + k, '#e8f0ff'); } }
    }
  }, { mosaic: mosaicAt() });
  docLabel('H → ~He', 720, 1240, { at: 10.7, fg: '#e8e0ff', align: 'center' });
  spCaptions();
}

// ---- 4: a massive blue star: boiling surface, prominences on the limb; eight little Suns line up and fall into it
function prominence(cx, cy, r, a, t, k) {
  const h = r * (0.25 + 0.15 * Math.sin(t * 1.4 + k)), w = 0.35;
  for (let s = 0; s <= 40; s++) { const u = s / 40, aa = a - w / 2 + w * u, rr = r + h * Math.sin(Math.PI * u); const x = cx + Math.cos(aa) * rr, y = cy + Math.sin(aa) * rr; prect(x - 1, y - 1, 2 + (s % 3 === 0), 2, s % 2 ? '#c8d8ff' : '#7a9cff'); }
}
function sceneBlue() {
  const t = TT, f = docFloat(6, 1.4), r = Math.round(100 + 6 * EZ.io(clamp((t - 12) / 4)) + 2 * Math.sin(t * 2)), absorb = clamp((t - 14.6) / 0.6);
  spaceFrame(() => {
    starfield({ dx: -t * 3 + f.dx * 3, dy: f.dy * 3 }, { milky: true });
    pglow(SCX + f.dx, SCY + f.dy, r, r * 1.9, '#3a5ad0', 0.35);
    for (let k = 0; k < 4; k++) prominence(SCX + f.dx, SCY + f.dy, r, k * 1.6 + 0.5 + t * 0.05, t, k);
    starBall(SCX + f.dx, SCY + f.dy, r, BLUE_STAR, t, { halo: 1.6, cell: 5, grain: 0.8 });
    if (absorb > 0 && absorb < 1) pcircle(SCX + f.dx, SCY + f.dy, r + Math.round(8 * absorb), '#ffffff', { ring: 1 });
    // eight Suns (yellow, tiny) pop in a row under the star, then fly into it
    for (let k = 0; k < 8; k++) {
      const at = CU.sunIcon + k * 0.15; if (t < at) continue;
      const x0 = 75 + k * 30, y0 = 560, u = EZ.i3(clamp((t - 14.6 - k * 0.05) / 0.5)), x = x0 + (SCX - x0) * u, y = y0 + (SCY - y0) * u;
      if (u >= 1) continue;
      const s = Math.round(7 * (1 - u * 0.6) * (t < at + 0.1 ? 1.4 : 1));
      pglow(x, y, s, s + 6, '#ffd060', 0.5); pcircle(x, y, s, '#ffd060'); pcircle(x, y, Math.max(1, s - 3), '#fff0b0'); pset(x - 2, y - 2, '#ffffff');
    }
  }, { mosaic: mosaicAt() });
  docLabel('×8', 540, 1560, { at: CU.sunIcon + 1.2, until: 14.6, fg: '#ffd060', align: 'center', scale: 2 });
  docLabel('1 SOL', 225, 1590 - 40, { at: CU.sunIcon + 0.1, until: 14.6, fg: '#ffd060', align: 'center' });
  spCaptions();
}

// ---- 5: hydrogen runs out in the core: the star swells and cools to red; then it opens in section (a wedge)
function sceneGiant() {
  const t = TT, u = EZ.io(clamp((t - CU.swell) / 1.8)), r = Math.round(106 + 66 * u), f = docFloat(7, 1.4);
  const cols = BLUE_STAR.map((c, i) => hexOf(mix3(RGB(c), RGB(RED_STAR[i]), u)));
  const open = EZ.o3(clamp((t - CU.slice) / 0.6)), zoom = 1 + 1.6 * EZ.i3(clamp((t - 19.3) / 0.7));
  spaceFrame(() => {
    starfield({ dx: -t * 3 + f.dx * 3, dy: f.dy * 3 });
    const cx = SCX + f.dx, cy = SCY + f.dy, R = Math.round(r * zoom);
    starBall(cx, cy, R, cols, t, { halo: 1.35, cell: 3 + u * 0.5, grain: 0.9, seed: 22 });
    if (open > 0) {   // the cut: a wedge from -20° to 70° opens; inside, the hydrogen envelope and the helium core
      const a0 = -0.35, a1 = a0 + 1.55 * open;
      pfield(cx, cy - R, R + 1, 2 * R + 1, (i, j) => {
        const dx = i - cx, dy = j - cy, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx); if (d > R || a < a0 || a > a1) return null;
        const q = d / R, edge = Math.min(a - a0, a1 - a) * d < 1.5;
        const c = q > 0.55 ? mix3(RGB(EL.H), [8, 8, 30], 0.2 + q * 0.3) : q > 0.08 ? mix3(RGB(EL.He), [8, 8, 30], 0.15 + q * 0.4) : [255, 240, 220];
        return (edge ? mix3(c, [255, 255, 255], 0.5) : (q * 7) % 1 < 0.08 ? mix3(c, [255, 255, 255], 0.2) : c).map(Math.round);
      });
    }
  }, { mosaic: mosaicAt() });
  spCaptions();
}

// ---- 6: the onion. Shells ignite outside-in; fusion sparks race round the newest shell; a clock below runs
// faster with every stage (each lasts a fraction of the one before) and stops dead at iron; a slow push-in
const STAGES = ['He', 'C', 'Ne', 'O', 'Si', 'Fe'];
function clockAngle(t) {   // the hand turns faster stage by stage: speeds 0.6, 1.2, 2.4, 4.8, 9.6 rev/s, then stops
  let a = 0; const sp = [0.6, 1.2, 2.4, 4.8, 9.6, 0];
  for (let k = 0; k < STAGES.length; k++) { const s0 = CU[STAGES[k]], s1 = k + 1 < STAGES.length ? CU[STAGES[k + 1]] : 1e9; if (t <= s0) break; a += (Math.min(t, s1) - s0) * sp[k] * Math.PI * 2; }
  return a;
}
function sceneOnion() {
  const t = TT, f = docFloat(2, 1.2), R = Math.round(160 + 14 * EZ.io(clamp((t - 20) / 11)) + 4 * Math.sin(t * 0.7)), cx = SCX + f.dx, cy = SCY + f.dy;
  spaceFrame(() => {
    starfield({ dx: f.dx * 4, dy: f.dy * 4 });
    onion(cx, cy, R, t);
    // fusion sparks on the inner edge of the newest shell
    const cur = [...STAGES].reverse().find((el) => t >= CU[el]);
    if (cur && cur !== 'Fe') { const rf = SHELLS.find((s) => s[0] === cur)[1], rr = R * rf - 3, sp = 1 + STAGES.indexOf(cur) * 0.8;
      for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2 + t * sp * (k % 2 ? 1 : -1.3), x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; if ((B + k) % 3) { pset(x, y, '#ffffff'); pset(x + Math.cos(a + 1.57), y + Math.sin(a + 1.57), EL[cur]); } } }
    // the clock
    const kx = SCX, ky = 568, a = clockAngle(t) - Math.PI / 2, stopped = t >= CU.Fe;
    pcircle(kx, ky, 24, '#3a4aa8'); pcircle(kx, ky, 22, '#0a0d24'); for (let k = 0; k < 12; k++) { const aa = k / 12 * Math.PI * 2; prect(kx + Math.cos(aa) * 19, ky + Math.sin(aa) * 19, 2, 2, '#6a78b0'); }
    pbeam(kx, ky, kx + Math.cos(a) * 18, ky + Math.sin(a) * 18, 2, stopped ? EL.Fe : '#eef0ea'); pbeam(kx, ky, kx + Math.cos(a / 12) * 11, ky + Math.sin(a / 12) * 11, 2, '#9aa4c8'); pcircle(kx, ky, 2, '#eef0ea');
    if (!stopped && (t - CU.Si) > 0 && B % 2) for (let k = 1; k < 5; k++) pset(kx + Math.cos(a - k * 0.22) * 17, ky + Math.sin(a - k * 0.22) * 17, '#6a78b0');   // the hand's blur at full speed
  }, { mosaic: mosaicAt({ out: false }) });
  spCaptions();
}
// ---- 7: the core collapses: every shell falls inward in 0.4 s with a shudder; then a held breath in the dark
function sceneCollapse() {
  const t = TT, u = EZ.i3(clamp((t - CU.collapse) / 0.4)), R = Math.round(174 * (1 - u)), sh = t < CU.drop ? (B % 2 ? 2 : -2) : 0;
  spaceFrame(() => {
    starfield({ dx: sh, dy: 0 });
    if (R > 2) onion(SCX + sh, SCY, R, t);
    if (t >= CU.drop) { const p = clamp((t - CU.drop) / 1.0); pglow(SCX, SCY, 1, 3 + 10 * p, '#9ab8ff', 0.5 + 0.3 * p); pcircle(SCX, SCY, 1 + Math.round(p * 2), (B % 3) ? '#e8f0ff' : '#9ab8ff'); }
  }, { mosaic: 1 });
  spCaptions();
}
// ---- 9: SUPERNOVA. One white frame, a blue afterglow, a shock ring, streaks; the element shell flies out, torn by
// turbulence (iron innermost); the neutron star blinks in the middle; the symbols ride the shell
function sceneNova() {
  const t = TT - CU.nova, sh = t < 0.35 ? Math.round((B % 2 ? 1 : -1) * 3 * (1 - t / 0.35)) : 0;
  spaceFrame(() => {
    starfield({ dx: sh, dy: 0 }, { milky: true });
    if (t < 1 / 12) { pfill('#ffffff'); return; }
    if (t < 0.25) pfield(0, 0, SW, SH, () => [200, 215, 255, 0.6 * (1 - t / 0.25)]);
    const R = 40 + 150 * EZ.o3(clamp(t / 4.5)), cols = [EL.H, EL.He, EL.C, EL.Ne, EL.O, EL.Si, EL.Fe].map(RGB), fade = 1 - clamp((t - 3) / 2) * 0.5, cx = SCX + sh;
    pglow(cx, SCY, 2, 70 * (1 - clamp(t / 2)) + 10, '#ffffff', 0.75 * (1 - clamp(t / 2.5)) + 0.1);
    const ring = R * 1.35 + 60 * t; if (t < 2.5) { pcircle(cx, SCY, Math.round(ring), '#9ab8ff', { ring: 1 }); if (B % 2) pcircle(cx, SCY, Math.round(ring) - 3, '#3a4aa8', { ring: 1 }); }
    for (let k = 0; k < 36; k++) { const a = k / 36 * Math.PI * 2 + 0.05 * k, d0 = R * 1.05, d1 = d0 + 30 * (1 - clamp(t / 3)) + 6; if ((k + B) % 4 === 0) continue; pline(cx + Math.cos(a) * d0, SCY + Math.sin(a) * d0, cx + Math.cos(a) * d1, SCY + Math.sin(a) * d1, k % 2 ? '#e8f0ff' : '#7a9cff'); }
    pfield(cx - R * 1.15, SCY - R * 1.15, R * 2.3, R * 2.3, (i, j) => {
      const dx = (i - cx) / R, dy = (j - SCY) / R, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx), n = fbm(Math.cos(a) * 2.5 + 5, Math.sin(a) * 2.5 + 5 + t * 0.2, 77, 3), q = r + (n - 0.5) * 0.35;
      if (q < 0.45 || q > 1.05) return null;
      const band = Math.min(6, Math.floor((1.05 - q) / 0.6 * 7)), grain = fbm(i * 0.15, j * 0.15 + t, 88, 2);
      if (grain < 0.38 + (q - 0.45) * 0.3) return null;
      return [...cols[6 - band], fade * (0.55 + grain * 0.6)];
    });
    for (let k = 0; k < 900; k++) { const r = RNG('sn', k), a = r.f() * Math.PI * 2, d = R * (1.0 + r.f() * 0.25) * (1 + 0.1 * Math.sin(a * 5)), x = cx + Math.cos(a) * d, y = SCY + Math.sin(a) * d; if ((k + B) % 13 === 0) continue; prect(x, y, 2, 2, [EL.H, EL.He, EL.O, EL.Si, EL.Fe][k % 5]); }
    const ns = (B % 4) < 2; pcircle(cx, SCY, ns ? 3 : 2, '#e8f0ff'); pglow(cx, SCY, 3, 14, '#9ab8ff', ns ? 0.7 : 0.4);
  }, { mosaic: mosaicAt({ in: false }) });
  if (t > 0.8) [['O', -0.7, 0.9], ['Si', 0.6, 1.2], ['Fe', 2.2, 1.5], ['C', 3.6, 1.8]].forEach(([el, a, at]) => { const rr = (40 + 150 * EZ.o3(clamp(t / 4.5))) * 1.12, x = SCX + Math.cos(a) * rr, y = SCY + Math.sin(a) * rr;
    docLabel('~' + el, clamp(x * 3, 130, 900), clamp(y * 3, 520, 1440), { at: CU.nova + at, fg: EL[el], align: 'center', scale: 2 }); });
  spCaptions();
}
// ---- 10: the remnant slows and spreads; its elements seed a new cloud that begins to turn
const DUST = [EL.C, EL.O, EL.Si, EL.Fe, EL.Ne];
function sceneRemnant() {
  const t = TT, u = clamp((t - 40) / 4), f = docFloat(8, 1.5), R = Math.round(200 - 30 * u);
  spaceFrame(() => {
    starfield({ dx: -t * 3 + f.dx * 3, dy: f.dy * 3 }, { milky: true });
    for (let k = 0; k < 3; k++) { const r = RNG('cl2', k); nebula(r.i(40, 320) + f.dx * 0.4, r.i(120, 600) + f.dy * 0.4, r.i(30, 50), t, { swirl: 0.6, seed: 50 + k, cols: ['#0a0d24', '#141a40', '#2a2f7a', '#4a4ab0'] }); }
    nebula(SCX + f.dx, SCY + f.dy, R, t, { swirl: 0.4 + 1.6 * u, seed: 9, dust: DUST, cols: ['#0a0d24', '#1a1f5a', '#2e2f8a', '#4a3cb0', '#7a4ac8', '#c060c8', '#9ab8ff'] });
    if (u < 0.5) pfield(SCX - R, SCY - R, 2 * R, 2 * R, (i, j) => { const d = Math.hypot(i - SCX - f.dx, j - SCY - f.dy) / R; return d > 0.85 && d < 0.97 && (i * 7 + j * 3) % 5 === 0 ? [...RGB(DUST[(i + j) % 5]), 1 - u * 2] : null; });
  }, { mosaic: mosaicAt() });
  spCaptions();
}
// ---- 11: a disk turns, the Sun ignites in its middle 4.6 billion years ago, planets gather; we fly to the third
function sceneSun() {
  const t = TT, on = clamp((t - CU.sunOn) / 0.6), f = docFloat(9, 1.2), z = 1 + 3 * EZ.i3(clamp((t - 47.2) / 0.8)), ex = SCX + (Math.cos(t * 0.5 + 1.2) * 110), ey = SCY + Math.sin(t * 0.5 + 1.2) * 110 * 0.32;
  const cx = SCX + (SCX - ex) * (z - 1) + f.dx, cy = SCY + (SCY - ey) * (z - 1) + f.dy;
  spaceFrame(() => {
    starfield({ dx: -t * 3 + f.dx * 3, dy: f.dy * 3 });
    nebula(cx, cy, Math.round(170 * z), t, { swirl: 2.2, seed: 12, squash: 0.32, dust: DUST, core: 0.4 * (1 - on), cols: ['#0a0d24', '#1a1f5a', '#2e2f8a', '#6a4a9a', '#c0805a', '#e0b070'] });
    if (on > 0) { const rs = Math.round((8 + 6 * on) * z); pglow(cx, cy, rs, rs * 4, '#ffb040', 0.5 * on); starBall(cx, cy, rs, ['#a04010', '#e08020', '#ffc040', '#fff0a0', '#ffffff'], t, { halo: 2, cell: 2 }); }
    [[60, '#a08070', 0.9, 2], [85, '#e0c080', 0.7, 3], [110, '#3a8ad0', 0.5, 4], [150, '#c06040', 0.38, 3]].forEach(([d, c, sp, r], k) => {
      if (t < 45 + k * 0.5) return;
      const a = t * sp + 1.2 + (k === 2 ? 0 : k), x = cx + Math.cos(a) * d * z, y = cy + Math.sin(a) * d * 0.32 * z, rr = Math.round(r * z);
      pcircle(x, y, rr, c); if (k === 2) { pset(x - 1, y - 1, '#3ae0c0'); pglow(x, y, rr, rr + 5, '#3a8ad0', 0.4); }
    });
  }, { mosaic: mosaicAt() });
  docLabel('SOL', 540 + 60, 1100, { at: CU.sunOn + 0.4, until: 47.2, fg: '#ffd060' });
  spCaptions();
}
// ---- 12: Earth turns (continents, clouds, a terminator with city lights); a bar fills with what your mass is made of
function earth(cx, cy, r, t) {
  const L = [-0.55, -0.45, 0.7];
  pglow(cx, cy, r, r + 14, '#3a8ad0', 0.45);
  pfield(cx - r - 1, cy - r - 1, 2 * r + 3, 2 * r + 3, (i, j) => {
    const x = (i - cx) / r, y = (j - cy) / r, q = x * x + y * y; if (q > 1) return null;
    const z = Math.sqrt(1 - q), lon = Math.atan2(x, z) + t * 0.25, lat = Math.asin(y), lit = clamp(x * L[0] + y * L[1] + z * L[2] + 0.15);
    const land = fbm(lon * 1.6 + 10, lat * 2.4 + 3, 41, 4) > 0.56, ice = Math.abs(lat) > 1.15, cloud = fbm(lon * 2.2 - t * 0.1 + 4, lat * 3.5, 43, 3) > 0.6;
    let c = ice ? [220, 235, 245] : land ? (fbm(lon * 5, lat * 5, 44, 2) > 0.55 ? [70, 150, 90] : [50, 120, 110]) : [30, 70, 150];
    if (cloud) c = mix3(c, [240, 245, 255], 0.75);
    if (q > 0.9) c = mix3(c, [120, 180, 255], (q - 0.9) * 6);   // the atmosphere at the limb
    if (lit < 0.12) { if (land && !cloud && dhash(i, j, 45) < 0.06) return [255, 210, 120]; return mix3(c, [5, 8, 25], 0.82).map(Math.round); }
    return mix3([5, 8, 25], c, lit < 0.3 ? (lit > bayer(i, j) * 0.3 ? 1 : 0.55) : 1).map(Math.round);
  });
}
const BODY = [['O', 65, EL.O], ['C', 18, EL.C], ['H', 10, EL.H], ['N', 3, '#8ab0ff'], ['…', 4, '#8a8ea0']];
function sceneEarth() {
  const t = TT, f = docFloat(10, 1.2), r = Math.round(92 + 6 * EZ.io(clamp((t - 48) / 4)));
  spaceFrame(() => {
    starfield({ dx: -t * 3 + f.dx * 3, dy: f.dy * 3 }, { milky: true });
    earth(SCX + f.dx, 300 + f.dy, r, t);
    // the bar: segments fill one after another; H (from the Big Bang) is left hatched
    const x0 = 30, w = 300, y = 470; prect(x0 - 2, y - 2, w + 4, 18, '#3a4aa8'); prect(x0, y, w, 14, '#0a0d24');
    let x = x0;
    BODY.forEach(([el, pc, col], k) => { const at = CU.bar + k * 0.45, u = clamp((t - at) / 0.4), ww = Math.round(w * pc / 100); if (u > 0) { prect(x, y, Math.round(ww * EZ.o3(u)), 14, col); if (el === 'H') pdither(x, y, Math.round(ww * EZ.o3(u)), 14, null, '#0a0d24', (i, j) => ((i + j) % 4 === 0 ? 1 : 0)); } x += ww; });
  }, { mosaic: mosaicAt() });
  docLabel('OXÍGENO 65%', 90 + 290, 1350, { at: CU.bar + 0.3, fg: EL.O, align: 'center' });
  docLabel('C 18%', 90 + 650, 1350, { at: CU.bar + 0.75, fg: EL.C, align: 'center' });
  docLabel('H 10%: DEL BIG BANG', 900, 1470, { at: CU.bar + 1.6, fg: EL.H, align: 'right' });
  spCaptions();
}
// ---- 13: a person: inside, oxygen (teal) and iron (rust) flow from the beating heart; we dive into the blood
function person(cx, cy, s, t) {
  const P = [[0, -0.92, 0.13], [0, -0.55, 0.2], [0, -0.25, 0.22], [0, 0.05, 0.2]], body = '#141a40', rim = '#3a4aa8';
  const shape = (i, j) => { const x = (i - cx) / s, y = (j - cy) / s;
    if (Math.hypot(x, y + 0.92) < 0.13) return true; if (Math.abs(x) < 0.07 && y > -0.8 && y < -0.7) return true;
    if (Math.abs(x) < 0.24 - Math.max(0, y + 0.1) * 0.15 && y > -0.72 && y < 0.12) return true;
    for (const sd of [-1, 1]) { const ax = 0.25 + Math.max(0, y + 0.66) * 0.18; if (Math.abs(x - sd * ax) < 0.06 && y > -0.68 && y < 0.05) return true; if (Math.abs(x - sd * 0.1) < 0.08 && y >= 0.1 && y < 0.95) return true; }
    return false; };
  pfield(cx - s * 0.6, cy - s * 1.1, s * 1.2, s * 2.1, (i, j) => { if (!shape(i, j)) return null; if (!shape(i - 1, j) || !shape(i - 2, j)) return RGB('#9ab8ff'); if (!shape(i + 1, j) || !shape(i, j - 1)) return RGB(rim); return RGB(ramp(['#0a0d24', '#141a40', '#1e2660'], clamp(0.7 - (i - cx) / s), i, j)); });
  const hb = Math.max(0, Math.sin(t * 7)) ** 4, hx = cx + s * 0.05, hy = cy - s * 0.45;
  pglow(hx, hy, 2, 6 + 6 * hb, EL.blood, 0.6); pcircle(hx, hy, Math.round(3 + 2 * hb), EL.blood);
  for (let k = 0; k < 70; k++) {   // particles flow out from the heart along the limbs and back
    const r = RNG('flow', k), path = k % 5, u = mod(t * (0.35 + r.f() * 0.2) + r.f(), 1), ends = [[-0.32, 0.0], [0.32, 0.0], [-0.1, 0.92], [0.1, 0.92], [0, -0.92]][path];
    const x = hx + (cx + ends[0] * s - hx) * u + Math.sin(u * 9 + k) * 2, y = hy + (cy + ends[1] * s - hy) * u;
    if (!shape(Math.round(x), Math.round(y))) continue;
    pset(x, y, k % 4 === 0 ? EL.Fe : EL.O); if (k % 4 === 0 && (B + k) % 5 === 0) pglow(x, y, 1, 3, EL.Fe, 0.6);
  }
}
function sceneBody() {
  const t = TT, f = docFloat(11, 1.0), z = 1 + 4 * EZ.i3(clamp((t - 55.2) / 0.8)), s = 200 * z, hx = SCX + 10, hy = SCY + 20 - 90;
  spaceFrame(() => {
    starfield({ dx: -t * 3 + f.dx * 3, dy: f.dy * 3 });
    pfield(0, 440, SW, 200, (i, j) => { const h = 500 + ((i - SCX) / 260) ** 2 * 60, d = j - h; if (d < -10) return null; if (d < 0) return [90, 150, 255, (10 + d) / 14]; const n = fbm(i * 0.03 + t * 0.05, j * 0.06, 47, 3); return RGB(ramp(['#081830', '#123a6a', '#1e5a8a', n > 0.58 ? '#2e7a5a' : '#2a6aa8', '#e8f0ff'], d < 2 ? 0.98 : clamp(0.75 - d / 140 + (n - 0.5) * 0.3), i, j)); });   // Earth's limb under them
    person(SCX + f.dx + (SCX - hx) * (z - 1), SCY + 20 + f.dy + (SCY - hy) * (z - 1) * 0.5, s, t);
  }, { mosaic: mosaicAt() });
  docLabel('O', 300, 1080, { at: 52.8, until: 55.2, fg: EL.O, scale: 2 }); docLabel('~Fe', 760, 1180, { at: 53.2, until: 55.2, fg: EL.Fe, scale: 2 });
  spCaptions();
}
// ---- 14: back in the blood (the opening, changed: now we know): one cell glints rust; the title; then the cell
// shrinks to a star and the sky takes over (the loop)
function sceneEnd() {
  const t = TT, out = EZ.i3(clamp((t - 58.8) / 1.0)), f = docFloat(12, 1.0);
  spaceFrame(() => {
    if (out < 0.98) {
      pfield(0, 0, SW, SH, (i, j) => RGB(ramp(['#120103', '#1e0205', '#2e0407', '#3a0609'], fbm(i * 0.012, j * 0.01 - t * 0.35, 9, 3) * 0.9, i, j)));
      for (let k = 0; k < 12; k++) { const r = RNG('rbc2', k), y = mod(r.i(0, SH + 80) + t * 50, SH + 80) - 40, x = SCX + r.i(-140, 140); bloodCell(Math.round(SCX + (x - SCX) * (1 - out)), Math.round(SCY + (y - SCY) * (1 - out)), Math.round(14 * (1 - out) + 1), r.f() * 3 + t); }
      const rr = Math.round(40 * (1 - out) + 1); bloodCell(SCX + f.dx, SCY + 40 + f.dy, rr, 0.3 + t * 0.4);
      for (let k = 0; k < 4; k++) { const a = t * 1.5 + k * 1.57, x = SCX + f.dx + Math.cos(a) * rr * 0.4, y = SCY + 40 + f.dy + Math.sin(a) * rr * 0.25; pglow(x, y, 1, 4 + (B + k) % 3, EL.Fe, 0.8); pset(x, y, '#ff9a70'); }
      vesselWall(t, 1 - out * 0.9);
    }
    if (out > 0) { pfield(0, 0, SW, SH, () => [5, 6, 15, out]); if (out > 0.4) { starfield({ dx: -t * 3, dy: 0 }, { milky: true }); nebulaRich(SCX, SCY, Math.round(60 * out), t, { swirl: 1, seed: 3 }); } }
  }, { mosaic: t > 58.6 && t < 59.2 ? MOS[Math.round((1 - Math.abs(t - 58.9) / 0.3) * 5)] : 1 });
  spCaptions();
}
const SCENES = { blood: sceneBlood, nebula: sceneNebula, ignite: sceneIgnite, blue: sceneBlue, giant: sceneGiant, onion: sceneOnion, collapse: sceneCollapse,
  nova: sceneNova, remnant: sceneRemnant, sun: sceneSun, earth: sceneEarth, body: sceneBody, end: sceneEnd };
