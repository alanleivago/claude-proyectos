// =====================================================================
//  SCENES — el primer hackeo (style pixdoc). Every scene draws inside lowres(DOC_RES) in 270x480 pixels;
//  TT on 2s. Captions come from CAPS (head) via docCaptions(); labels and loupes are per scene.
//  RED means one thing only: the fake symbol the Blancs slipped into the state's messages.
//  Camera life: every world floats (docFloat) and its layers move by depth (parallax d: 0 far .. 1 near).
// =====================================================================
const D = DOC, CU = TIMELINE.cues;
const beatN = () => Math.floor(TT / BEAT + 1e-6);
const shotT = () => TT - E0;   // time since the current shot started

// the subtitle at TT: the latest CAPS entry, typed from its start (one that extends the previous keeps it typed)
function docCaptions() {
  const [, , , o0, oDur] = SHOT_LIST[CUR_SHOT];
  let k = -1; for (let i = 0; i < CAPS.length; i++) if (CAPS[i][0] >= o0 - 1e-6 && CAPS[i][0] < o0 + oDur && CAPS[i][0] <= TT + 1e-6) k = i;
  if (k < 0 || !CAPS[k][1]) return;
  const [t0, s] = CAPS[k], prev = k > 0 ? CAPS[k - 1][1] : null;
  docCaption(s, t0, { pre: prev && s.startsWith(prev) ? docChars(prev).length : 0 });
}

// ---- sky: dithered blue to a pale horizon, drifting cumulus, a few birds; cam moves them a little (far)
const BIRD = [['a...a', '.a.a.'], ['.....', 'aa.aa']];
function sky(y1, seed = 0, o = {}) {
  const cam = o.cam ?? { dx: 0, dy: 0 };
  pgrad(0, 0, 270, y1, o.cols ?? [D.sky0, D.sky1, D.sky2, D.sky3, D.sky4], { ease: (u) => u ** 0.8 });
  for (let i = 0; i < (o.clouds ?? 5); i++) {
    const R = RNG('cl', seed, i), y = R.i(30, Math.max(40, y1 - 50)), x = mod(R.i(0, 360) + Math.floor(TT * (2 + i % 2)), 380) - 60;
    pcloud(x + cam.dx * 0.25, y + cam.dy * 0.25, R.i(26, 54), seed * 10 + i, o.cloudCols);
  }
  for (let i = 0; i < (o.birds ?? 3); i++) {
    const R = RNG('bird', seed, i), x = mod(R.i(0, 300) - Math.floor(TT * 8), 300) - 10, y = R.i(70, Math.max(80, y1 - 40)) + (beatN() + i) % 2;
    sprite(BIRD[(B + i) % 4 < 2 ? 0 : 1], { a: D.slateDk }, x + cam.dx * 0.35, y + cam.dy * 0.35);
  }
}

// ---- the Chappe telegraph head: a regulator (the long beam) through (cx, cy) at angle a, and two indicators
// at its ends at angles bL, bR relative to it. s = size; o.col = the arms' colour (red = the fake symbol)
function chappe(cx, cy, s, a, bL, bR, o = {}) {
  const L = 17 * s, I = 9 * s, wd = Math.max(3, Math.round(2.2 * s)), c = o.col ?? D.iron, dots = o.dots ?? '#8a93a6';
  if (s < 0.6) { const w2 = Math.max(1, Math.round(s * 2)); pbeam(cx - Math.cos(a) * L, cy - Math.sin(a) * L, cx + Math.cos(a) * L, cy + Math.sin(a) * L, w2, c);
    for (const [x, y, th] of [[cx - Math.cos(a) * L, cy - Math.sin(a) * L, a + Math.PI - bL], [cx + Math.cos(a) * L, cy + Math.sin(a) * L, a + bR]]) pline(x, y, x + Math.cos(th) * I, y + Math.sin(th) * I, c);
    return; }
  const ex = Math.cos(a) * L, ey = Math.sin(a) * L;
  for (const [x, y, th] of [[cx - ex, cy - ey, a + Math.PI - bL], [cx + ex, cy + ey, a + bR]]) {
    const x2 = x + Math.cos(th) * I, y2 = y + Math.sin(th) * I;
    pbeam(x, y, x2, y2, Math.max(2, wd - 1), c); pcircle(x2, y2, Math.max(1, Math.round(s * 0.7)), c);
  }
  pbeam(cx - ex, cy - ey, cx + ex, cy + ey, wd, c);
  for (let t = -L + 3; t <= L - 3; t += 3) pset(cx + Math.cos(a) * t, cy + Math.sin(a) * t, o.col && o.col !== D.iron ? D.goldLt : dots);
  pcircle(cx, cy, Math.max(1, Math.round(s * 0.8)), D.iron2);
}
// poses [a, bL, bR] in eighths of a turn; the arms swing between poses with a small spring overshoot
const Q8 = Math.PI / 4;
function poseAt(seq) {   // seq: [[t, a, bL, bR], ...] sorted by t
  let k = 0; while (k + 1 < seq.length && seq[k + 1][0] <= TT + 1e-6) k++;
  const p = seq[k], q = k > 0 ? seq[k - 1] : p, u = TT < p[0] ? 0 : clamp(springMove(p[0], 0, 1, SPRING.snappy), -0.2, 1.2);
  return [1, 2, 3].map((j) => (q[j] + (p[j] - q[j]) * u) * Q8);
}

// ---- the opening world: a Paris roof with the telegraph hut, the river and the far bank behind.
// v = { s, ox, oy }: base coords (s = 1 is the wide) mapped to pixels; o.cam = float offsets, applied by layer depth
function roofWorld(v, arms, o = {}) {
  const cam = o.cam ?? { dx: 0, dy: 0 };
  const X = (x, d = 1) => Math.round(v.ox + x * v.s + cam.dx * d), Y = (y, d = 1) => Math.round(v.oy + y * v.s + cam.dy * d);
  const R = (x, y, w, h, c, d = 1) => prect(X(x, d), Y(y, d), X(x + w, d) - X(x, d), Y(y + h, d) - Y(y, d), c);
  const P = (pts, c, d = 1) => ppoly(pts.map(([x, y]) => [v.ox + x * v.s + cam.dx * d, v.oy + y * v.s + cam.dy * d]), c);
  const haze = o.lit ? '#5a4a68' : '#93a5b6';
  sky(Y(332, 0.6), 1, { birds: o.birds ?? 3, cols: o.skyCols, cam, cloudCols: o.cloudCols });
  // far bank (d .35): a hazy city with a dome and a spire
  for (let i = 0; i < 26; i++) { const r = RNG('city', i), x = i * 11 - 6 + r.i(0, 4), h = r.i(6, 15), w = r.i(8, 13); R(x, 300 - h, w, h, o.lit ? '#6a5a78' : i % 2 ? '#9fb0c0' : '#93a5b6', 0.35); for (let k = 0; k < 3; k++) R(x + 2 + k * 3, 300 - h + 3, 1, 1, o.lit && (k + i) % 3 ? '#f2cc6a' : '#8294a8', 0.35); }
  R(55, 286, 14, 14, haze, 0.35); pellipse(X(62, 0.35), Y(285, 0.35), 7 * v.s, 6 * v.s, haze); R(61, 276, 2, 4, haze, 0.35);
  R(180, 278, 3, 22, haze, 0.35); P([[178, 278], [185, 278], [181.5, 268]], haze, 0.35);
  // the river (d .55) with drifting ripples and a barge, the stone bridge
  R(-10, 300, 290, 30, o.lit ? '#5a5a8a' : '#5f86ad', 0.55);
  for (let i = 0; i < 40; i++) { const r = RNG('rip', i), x = mod(r.i(0, 270) + Math.floor(TT * 4), 280) - 5, y = r.i(312, 328); R(x, y, r.i(3, 7), 1, o.lit ? '#d89a7a' : '#9fbbd4', 0.55); }
  const bx = mod(Math.floor(TT * 5) + 40, 330) - 30; R(bx, 318, 22, 4, D.woodDk, 0.55); R(bx + 3, 315, 8, 3, D.wood2, 0.55);
  R(-10, 303, 290, 5, '#c9bea0', 0.55); R(-10, 303, 290, 1, '#e2d8bc', 0.55);
  for (let x = -10; x < 280; x += 22) { R(x, 308, 5, 10, '#b0a586', 0.55); R(x + 5, 308, 17, 2, '#a89c7c', 0.55); }
  R(-10, 328, 290, 12, '#7d8c74', 0.75); ptex(0, Y(328, 0.75), 270, Y(340, 0.75) - Y(328, 0.75), '#64745e', 0.3, 5); R(-10, 328, 290, 1, '#b9b48e', 0.75);
  // the mansard roof (slate, seams, dormers, a smoking chimney) and the facade below (d 1)
  P([[14, 374], [256, 374], [238, 336], [32, 336]], D.slate);
  for (let x = 36; x < 238; x += 6) R(x, 337, 1, 36, D.slate2);
  R(30, 334, 210, 2, D.slateDk);
  pdither(X(32), Y(336), X(238) - X(32), 8, null, D.slateDk, (i, j) => 0.45 * (1 - (j - Y(336)) / 8));   // the ridge's shadow
  for (const dx of [52, 88, 182, 218]) { R(dx - 6, 346, 13, 16, D.stone); R(dx - 3, 350, 7, 12, o.lit ? '#f2cc6a' : '#3a4458'); P([[dx - 8, 347], [dx + 8, 347], [dx, 340]], D.stone2); R(dx + 4, 348, 3, 14, D.stoneDk); }
  R(70, 318, 8, 18, '#a8735a'); R(69, 316, 10, 3, '#8a5a44'); R(75, 318, 3, 18, '#8a5a44');
  for (let k = 0; k < 4; k++) { const u = (TT * 0.8 + k * 0.25) % 1, r = 2 + u * 5, sx = X(74 + u * 10), sy = Y(312 - u * 34); pdither(sx - r * v.s, sy - r * v.s, 2 * r * v.s + 1, 2 * r * v.s + 1, null, '#dfe4ea', (i, j) => (Math.hypot(i - sx, j - sy) < r * v.s ? 0.7 * (1 - u) : 0)); }
  R(-10, 374, 290, 120, D.stone); ptex(0, Y(374), 270, 480 - Y(374), D.stone2, 0.18, 3); ptex(0, Y(374), 270, 480 - Y(374), '#e8dcbc', 0.06, 4);
  R(-10, 374, 290, 3, D.stoneDk); R(-10, 377, 290, 1, '#e8dcbc');
  pdither(0, Y(378), 270, 6, null, D.stoneDk, (i, j) => 0.4 * (1 - (j - Y(378)) / 6));   // the cornice's shadow
  for (const wx of [14, 50, 86, 170, 206, 242]) for (const wy of [388, 440]) {
    R(wx - 1, wy - 3, 18, 3, D.stoneDk); R(wx, wy, 16, 34, '#e8dcbc'); R(wx + 2, wy + 2, 12, 30, o.lit ? '#f2cc6a' : '#3a4458'); R(wx + 2, wy + 2, 12, 8, o.lit ? '#f6dc8a' : '#56647c');
    R(wx + 7, wy + 2, 2, 30, '#e8dcbc'); R(wx + 2, wy + 15, 12, 1, '#e8dcbc'); R(wx + 14, wy + 2, 2, 32, D.stone2);
  }
  // the hut on the ridge (its shadow on the slate), the mast
  pdither(X(156), Y(316), Math.round(30 * v.s), Math.round(22 * v.s), null, D.slateDk, (i, j) => (i - X(156) < (j - Y(316)) * 1.2 + 6 * v.s ? 0.55 : 0));
  R(112, 302, 46, 36, D.wood); for (let x = 114; x < 156; x += 4) R(x, 302, 1, 36, D.woodDk); R(112, 302, 46, 2, D.wood2); R(150, 302, 8, 36, D.woodDk);
  R(108, 297, 54, 5, D.slateDk); R(110, 296, 50, 1, D.slate2); R(108, 302, 54, 2, D.shadow);
  R(127, 318, 14, 20, D.woodDk); R(146, 310, 7, 7, (B % 9) < 7 ? '#f2cc6a' : '#c8902e');
  R(100, 312, 12, 2, D.woodDk); R(158, 312, 12, 2, D.woodDk);   // the hut's side poles
  R(132, 182, 6, 115, D.iron2); R(136, 182, 2, 115, '#6a7284'); R(132, 182, 1, 115, D.iron);
  const [a, bL, bR] = arms;
  chappe(X(135), Y(182), 2.9 * v.s, a, bL, bR, { col: o.col });
  return { X, Y };
}

// ---- 1: the hook. A slow, steady zoom into the tower head (as the reference does); on "hackeada" the arms
// flash red for a moment (a red halo, flickering on, then off) — the colour that will mean the fake symbol
const ROOF_POSES = [[0, 0, 2, 2], [1.0, 2, 6, 6], [1.9, 0, 4, 6], [2.5, -1, 2, 6], [3.1, 0, 2, 4]];
function sceneRoof() {
  const z = 1 + 0.32 * EZ.io(clamp(TT / 3.5)) ** 0.9, red = TT >= CU.red && TT < CU.red + 0.95 && !(TT < CU.red + 0.17 && B % 2) && !(TT > CU.red + 0.8 && B % 2);
  lowres(DOC_RES, () => {
    const { X, Y } = roofWorld({ s: z, ox: 135 - 135 * z, oy: 300 - 300 * z }, poseAt(ROOF_POSES), { col: red ? D.red : null });
    if (red) pglow(X(135), Y(182), 3, 46 * z, D.red, 0.45);
  });
  docCaptions();
}
// ---- 2: close on the arms; each pose is a number
const ARM_POSES = [[3.5, 0, 2, 4], [4.2, 0, 6, 4], [5.4, 0, 6, 7]];
const roofClose = (k = 1.75) => ({ s: k, ox: 135 - 135 * k, oy: 250 - 182 * k });
function sceneArms() {
  const k = 1.75 + 0.06 * EZ.io(clamp(shotT() / 3.5));
  lowres(DOC_RES, () => { roofWorld(roofClose(k), poseAt(ARM_POSES), { birds: 1, cam: docFloat(1, 2) }); });
  docLabel('50', 140, 900, { at: CU.arms + 0.3, scale: 2 });
  docLabel('87', 860, 1000, { at: CU.arms + 1.5, scale: 2 });
  docCaptions();
}
// ---- 3: a loupe opens on the codebook: a finger runs down page 50 to line 87, which is a word
function sceneBook() {
  lowres(DOC_RES, () => {
    roofWorld(roofClose(1.81), poseAt(ARM_POSES), { birds: 1, cam: docFloat(1, 2) });
    pdither(0, 0, 270, 480, null, D.bar, () => 0.35 * ev(CU.book, 0.3));
    const r = irisR(CU.book, 92);
    docIris(135, 268, r, (cx, cy, rr) => {
      prect(cx - rr, cy - rr, 2 * rr + 1, 2 * rr + 1, D.paper); ptex(cx - rr, cy - rr, 2 * rr, 2 * rr, D.paper2, 0.2, 7);
      pdither(cx - 12, cy - rr, 24, 2 * rr, null, D.paperDk, (i) => 0.5 * (1 - Math.abs(i - cx) / 12));   // the gutter's shade
      prect(cx - 1, cy - rr, 3, 2 * rr, D.paperDk);
      docText('50', cx - 46, cy - 66, D.ink); docText('51', cx + 34, cy - 66, D.ink);
      prect(cx - 80, cy - 56, 74, 1, D.paperDk); prect(cx + 8, cy - 56, 74, 1, D.paperDk);
      for (let k = 0; k < 9; k++) {
        const y = cy - 48 + k * 11, n = 83 + k;
        if (n === 87 && TT >= CU.book + 1.1) prect(cx - 62, y - 2, Math.round(52 * clamp((TT - CU.book - 1.1) / 0.3)), 11, D.amber);
        docText(String(n), cx - 60, y, D.ink);
        if (n === 87 && TT >= CU.book + 0.8) docText('PAZ', cx - 44, y, D.ink, { count: (TT - CU.book - 0.8) * 12 }); else prect(cx - 44, y + 3, 26 + (k * 7) % 12, 1, D.paperDk);
        docText(String(n + 9), cx + 12, y, '#5a4a30'); prect(cx + 28, y + 3, 30 + (k * 5) % 14, 1, D.paperDk);
      }
      const fy = cy - 48 + Math.round(4 * 11 * EZ.io(clamp((TT - CU.book - 0.3) / 0.6)));
      if (TT >= CU.book + 0.3) { prect(cx - 84, fy + 1, 20, 5, D.skin); prect(cx - 84, fy + 5, 20, 1, D.skinDk); prect(cx - 96, fy, 12, 7, '#2a3a6a'); }
    });
  });
  docLabel('PÁGINA 50 · LÍNEA 87', 540, 1500, { at: CU.book + 1.4, align: 'center' });
  docCaptions();
}

// ---- the hills: a chain of telegraph towers receding into the haze, each copying the one before.
// o.near/o.mid/o.far = { seq, col }; o.strip = "la copia oficial" entries [[t, a, bL, bR, red, erasedAt]];
// o.antennas = 0..1 (the towers become lattice masts, far first); o.sight = the dotted line of sight, marching
const delaySeq = (seq, d) => seq.map(([t, ...r]) => [t + d, ...r]);
function tower(x, base, s, arms, col, ant = 0) {
  if (ant > 0) {   // a lattice mast instead of the hut and arms
    const h = Math.round(110 * s), w = Math.round(12 * s);
    docShadow(x + w * 1.6, base + 1, w * 1.8, Math.max(1, s * 2), 0.45);
    for (let k = 0; k <= 8; k++) { const y = base - k * h / 8, hw = w * (1 - k / 10); prect(x - hw, y, 2 * hw, 1, D.iron2); if (k < 8) { pline(x - hw, y, x + hw * 0.88, y - h / 8, D.iron2); pline(x + hw, y, x - hw * 0.88, y - h / 8, D.iron2); } }
    pline(x - w, base, x - w * 0.2, base - h, D.iron); pline(x + w, base, x + w * 0.2, base - h, D.iron);
    prect(x - 1, base - h - 6 * s, 2, 6 * s, D.iron);
    for (const k of [0.75, 0.55]) { const y = base - h * k; prect(x + w * (1 - k) + 1, y, Math.max(2, 3 * s), Math.max(3, 6 * s), '#e8ecf0'); }
    if ((B + x) % 8 < 4) pset(x, base - h - 6 * s, D.red);
    return;
  }
  const hw = Math.round(11 * s), hh = Math.round(17 * s), mh = Math.round(42 * s);
  // its cast shadow on the grass (the sun is up-left)
  ppoly([[x + hw, base], [x + hw + 16 * s, base + 3 * s], [x - hw + 16 * s, base + 4 * s], [x - hw, base + 1]], shadeC(D.grass, -0.35));
  prect(x - hw, base - hh, 2 * hw, hh, D.stone); ptex(x - hw, base - hh, 2 * hw, hh, D.stone2, 0.2, x);
  prect(x + hw - Math.max(1, Math.round(4 * s)), base - hh, Math.max(1, Math.round(4 * s)), hh, D.stoneDk);
  prect(x - hw - 1, base - hh - Math.max(1, Math.round(3 * s)), 2 * hw + 2, Math.max(1, Math.round(3 * s)), D.slateDk);
  if (s > 0.6) { prect(x - Math.round(3 * s), base - Math.round(9 * s), Math.round(5 * s), Math.round(7 * s), '#4a4438'); prect(x - hw, base - 2, 2 * hw, 2, D.stoneDk); }
  prect(x - Math.max(1, Math.round(s)), base - hh - mh, Math.max(1, Math.round(2 * s)), mh, D.iron2);
  chappe(x, base - hh - mh, 1.8 * s, ...arms, { col });
}
// field strips in perspective between a hill's crest top(x) and yBot: rows grow with distance down the slope
function fields(top, yBot, seed, cols, h0, h1) {
  for (let y = 0, row = 0; row < 40; row++) {
    const u = clamp(y / (yBot - 250)), rh = Math.round(h0 + (h1 - h0) * u ** 1.3);
    for (let i = 0; i < 12; i++) {
      const r = RNG('fld', seed, i, row); if (r.f() < 0.4) continue;
      const w = Math.round((10 + r.i(0, 18)) * (0.6 + 1.2 * u)), x = Math.round(i * 26 - 10 + r.i(-8, 8)), yy = Math.round(top(x + w / 2) + 3 + y);
      if (yy > yBot) continue;
      prect(x, yy, w, Math.max(1, rh - 1), cols[r.i(0, cols.length - 1)]);
      if (rh > 3) prect(x, yy + rh - 1, w, 1, shadeC(cols[0], -0.25));
    }
    y += rh + 1; if (y > yBot - 250) break;
  }
}
function hillsWorld(o = {}) {
  const cam = o.cam ?? docFloat(3, 2), L = (d, fn) => pshift(cam.dx * d, cam.dy * d, fn);
  sky(262, 3, { cols: o.skyCols, clouds: 4, cam });
  const ant = o.antennas ?? 0, far2 = o.far ?? {}, mid = o.mid ?? {}, near = o.near ?? {};
  const armsOf = (q) => (q.seq ? poseAt(q.seq) : [0, 2 * Q8, 6 * Q8]);
  // ridge A (d .2) with the farthest towers, almost lost in the haze
  const topA = (x) => 238 - 6 * Math.sin(x * 0.021 + 1) - 3 * Math.sin(x * 0.09);
  L(0.2, () => { const P = [[-12, 300]]; for (let x = -12; x <= 284; x += 4) P.push([x, topA(x)]); P.push([284, 300]); ppoly(P, '#b2c0c6'); ptex(-10, 226, 290, 40, '#c2ced0', 0.2, 30);
    for (const [x, sk] of [[40, 0.18], [252, 0.22]]) tower(x, Math.round(topA(x)) + 1, sk, armsOf(far2), far2.col, ant > 0.9 ? 1 : 0); });
  // ridge B (d .35): bluish-green, a far tower
  const topB = (x) => 252 - 7 * Math.sin(x * 0.016 + 2.2) - 2 * Math.sin(x * 0.11);
  L(0.35, () => { const P = [[-12, 320]]; for (let x = -12; x <= 284; x += 3) P.push([x, topB(x)]); P.push([284, 320]); ppoly(P, '#9fb2a2');
    fields(topB, 300, 2, ['#a8b88a', '#b6bc94', '#94a888'], 1, 2);
    pdither(-10, 240, 290, 60, null, '#c2ced0', (i, j) => 0.3 * (1 - (j - 240) / 60));
    tower(226, Math.round(topB(226)) + 2, 0.45, armsOf(far2), far2.col, ant > 0.66 ? 1 : 0); });
  // the middle hill (d .6): fields, grazing sheep, the middle tower
  const topM = (x) => 276 - 12 * Math.sin(x * 0.014 + 0.4) - 3 * Math.sin(x * 0.07);
  L(0.6, () => { const P = [[-12, 340]]; for (let x = -12; x <= 284; x += 3) P.push([x, topM(x)]); P.push([284, 340]); ppoly(P, '#7f9a50');
    fields(topM, 330, 3, [D.grass2, '#b8a868', '#8aa258'], 2, 4);
    pdither(-10, 262, 290, 24, null, '#b4c4b0', (i, j) => 0.22 * (1 - (j - 262) / 24));
    for (let i = 0; i < 5; i++) { const r = RNG('sheep', i), x = r.i(100, 260) + Math.floor(TT * 0.8 * (i % 2 ? 1 : -1)), y = Math.round(topM(x)) + r.i(6, 30); prect(x, y, 4, 2, '#f0eee6'); pset(x + (i % 2 ? 4 : -1), y, '#3a3a3a'); }
    tower(170, Math.round(topM(170)) + 6, 0.8, armsOf(mid), mid.col, ant > 0.33 ? 1 : 0); });
  // the near hill (d 1): big strips, a dirt path, fence posts, the near tower; tufts sway on the beat
  const topN = (x) => 316 - 30 * Math.sin(Math.PI * clamp((x + 50) / 270)) - 3 * Math.sin(x * 0.06);
  L(1, () => { const P = [[-12, 482]]; for (let x = -12; x <= 284; x += 3) P.push([x, topN(x)]); P.push([284, 482]); ppoly(P, D.grass);
    fields(topN, 480, 4, [D.field, D.grass2, '#b49c58'], 3, 11);
    ctx.fillStyle = D.grassDk; for (let j = 280; j < 480; j++) for (let i = -10; i < 280; i++) if (j > topN(i) + 2 && dhash(i, j, 33) < 0.03) cellR(i, j, 1, 1);
    ppoly([[58, 344], [74, 344], [150, 482], [96, 482]], '#c8b088'); ptex(60, 344, 100, 140, '#a89068', 0.15, 34);
    for (let k = 0; k < 7; k++) { const x = 170 + k * 16, y = Math.round(topN(x)) + 14 + k * 9; prect(x, y - 8 - k, 2, 8 + k, D.woodDk); if (k) prect(x - 16, y - 6 - k, 18, 1, D.wood2); }
    for (let i = 0; i < 18; i++) { const r = RNG('tuft', i), x = r.i(0, 266), y = r.i(400, 474), f = (beatN() + i) % 2; prect(x, y, 1, 3, D.grassDk); prect(x + 1 + f, y - 1, 1, 3, D.grassDk); prect(x - 1 - f, y, 1, 2, D.grassDk); }
    tower(66, 344, 1.6, armsOf(near), near.col, ant > 0 ? 1 : 0); });
  // the line of sight between the near and the middle tower: dots marching while the copy happens
  if (o.sight) {
    const x0 = 66 + cam.dx, y0 = 344 - 27 - 67 + cam.dy, x1 = 170 + cam.dx * 0.6, y1 = topM(170) + 6 - 14 - 34 + cam.dy * 0.6;
    for (let k = 0; k < 40; k++) { const u = mod(k / 40 + TT * 0.25, 1); if (k % 2) continue; const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u - 14 * Math.sin(Math.PI * u); pset(x, y, '#f4f4f0'); }
  }
  if (o.strip) {   // the official copy, written down at the end of the line (screen-fixed paper strip)
    prect(8, 352, 254, 26, D.paper); ptex(8, 352, 254, 26, D.paper2, 0.2, 35); prect(8, 352, 254, 1, D.paperDk); prect(8, 377, 254, 1, D.paperDk);
    prect(10, 378, 254, 2, D.shadow);
    docText('COPIA OFICIAL', 14, 356, D.ink);
    o.strip.forEach(([t, a, bL, bR, red, gone], k) => {
      if (TT < t) return;
      const x = 106 + k * 26, y = 368;
      if (gone != null && TT >= gone) { if (TT < gone + 0.3 && B % 2) chappe(x, y, 0.4, a * Q8, bL * Q8, bR * Q8, { col: D.red }); return; }
      chappe(x, y, 0.4, a * Q8, bL * Q8, bR * Q8, { col: red ? D.red : D.iron });
    });
  }
}
const TICK = [[0, 0, 2, 6], [0.6, 0, 4, 6], [1.2, -2, 2, 2], [1.8, 0, 6, 2], [2.4, 0, 2, 4], [3.0, 2, 2, 6]];
const CHAIN = (t0) => ({ far: { seq: delaySeq(TICK, t0) }, mid: { seq: delaySeq(TICK, t0 + 0.4) }, near: { seq: delaySeq(TICK, t0 + 0.8) } });
// ---- 4: each tower copies the last; a loupe on the man inside: he cannot read it
function sceneHills() {
  lowres(DOC_RES, () => {
    hillsWorld({ ...CHAIN(10.5), sight: true });
    docIris(196, 300, irisR(CU.op, 50), (cx, cy, r) => {
      prect(cx - r, cy - r, 2 * r + 1, 2 * r + 1, D.wood); for (let x = cx - r; x < cx + r; x += 5) prect(x, cy - r, 1, 2 * r, D.woodDk);
      prect(cx - r, cy + 18, 2 * r + 1, r, D.woodDk);
      prect(cx + 4, cy - 30, 22, 16, D.sky3); prect(cx + 4, cy - 30, 22, 2, D.wood2); pdither(cx - 10, cy - 14, 40, 34, null, '#f2e0a8', (i, j) => ((i - cx) - (j - cy) * 0.6 > -6 && (i - cx) - (j - cy) * 0.6 < 14 ? 0.3 : 0));
      docShadow(cx - 4, cy + 23, 12, 2, 0.6);
      docMan(cx - 6, cy + 22, { coat: '#2a3a6a', coat2: '#3a4c80', flip: false, arm: 'point' });
      pbeam(cx + 4, cy - 15, cx + 18, cy - 22, 3, '#b08a40');
      prect(cx - 30, cy + 2, 16, 3, D.wood2); prect(cx - 28, cy - 2, 10, 4, D.paper);   // his logbook
      if (TT >= CU.op + 0.6) { prect(cx - 16, cy - 40, 11, 13, D.cap); docText('?', cx - 13, cy - 37, D.ink); }
    });
  });
  docLabel('OPERADOR', 784, 1430, { at: CU.op + 0.4, align: 'center' });
  docCaptions();
}

// ---- the Bordeaux bourse: a stone arcade, a slate mansard with a flag, ship masts at the quay, the twins.
// Layers float by depth; the sun is up-left, so shadows fall right
function bourseWorld(price, o = {}) {
  const cam = docFloat(5, 2), L = (d, fn) => pshift(cam.dx * d, cam.dy * d, fn);
  sky(170, 2, { clouds: 4, birds: 2, cam });
  L(0.45, () => { for (const [x, h] of [[8, 110], [24, 90], [36, 120]]) { prect(x, 150 - h + 40, 2, h, D.woodDk); for (let k = 0; k < 3; k++) prect(x - 8 + k, 150 - h + 50 + k * 22, 18 - 2 * k, 1, D.woodDk); pline(x, 150 - h + 40, x + 30, 150, '#6a5a4a'); }
    if (B % 6 < 3) prect(36, 150 - 80, 6, 3, '#e8e4d8'); });
  L(0.8, () => {
    ppoly([[40, 160], [284, 160], [284, 128], [52, 128]], D.slate); for (let x = 56; x < 284; x += 6) prect(x, 129, 1, 31, D.slate2);
    for (const dx of [70, 110, 150, 190, 230]) { prect(dx - 6, 136, 13, 16, D.stone); prect(dx - 3, 140, 7, 12, '#3a4458'); ppoly([[dx - 8, 137], [dx + 8, 137], [dx, 130]], D.stone2); prect(dx + 4, 138, 3, 14, D.stoneDk); }
    prect(158, 84, 2, 46, D.iron2);
    const wave = (B % 4 < 2) ? 0 : 1;
    for (let k = 0; k < 3; k++) for (let j = 0; j < 12; j++) prect(160 + k * 7, 86 + j + ((k + wave) % 2), 7, 1, ['#2a4aa0', '#f2f0ea', '#d8352a'][k]);
    prect(40, 160, 244, 170, D.stone); ptex(40, 160, 244, 170, D.stone2, 0.16, 11); ptex(40, 160, 244, 170, '#e8dcbc', 0.05, 12);
    prect(36, 160, 248, 6, '#e8dcbc'); prect(36, 166, 248, 2, D.stoneDk); pdither(40, 168, 244, 5, null, D.stoneDk, (i, j) => 0.4 * (1 - (j - 168) / 5));
    for (let x = 52; x < 280; x += 26) { prect(x - 1, 175, 16, 3, D.stoneDk); prect(x, 178, 14, 40, '#e8dcbc'); prect(x + 2, 180, 10, 38, '#3a4458'); prect(x + 2, 180, 10, 10, '#56647c'); prect(x + 6, 180, 2, 38, '#e8dcbc'); prect(x + 12, 180, 2, 38, D.stone2); }
    prect(40, 228, 244, 4, D.stoneDk); prect(40, 232, 244, 1, '#e8dcbc');
    for (let x = 48; x < 280; x += 30) { prect(x, 248, 20, 82, '#3e3022'); pellipse(x + 10, 248, 10, 10, '#3e3022'); prect(x + 2, 300, 16, 30, '#2e2418'); prect(x - 4, 238, 4, 92, D.stone2); prect(x - 1, 238, 1, 92, D.stoneDk); }
    // a clerk walks inside the arcade, in and out of the arches
    const cx = mod(Math.floor(TT * 7) + 60, 260) + 20; if (mod(cx - 48, 30) < 20) { docMan(cx, 328, { walk: B % 2, coat: '#2a2a36', coat2: '#3a3a48' }); }
  });
  L(1, () => {
    prect(-10, 330, 290, 152, '#cdb98c'); ptex(0, 330, 270, 150, '#b9a476', 0.2, 13); ptex(0, 330, 270, 150, '#e0cfa4', 0.08, 14);
    for (let y = 340, k = 0; y < 480; y += 6 + k * 2, k++) prect(-10, y, 290, 1, '#bba87c');
    for (let k = -4; k < 12; k++) pline(135 + k * 14, 331, 135 + k * 40, 480, '#c2ae80');   // paving joints in perspective
    prect(-10, 330, 290, 2, '#a8946a'); pdither(-10, 332, 290, 6, null, '#a8946a', (i, j) => 0.4 * (1 - (j - 332) / 6));
    for (let i = 0; i < 5; i++) { const r = RNG('pig', i), x = r.i(20, 250) + ((B + i) % 9 === 0 ? 1 : 0), y = r.i(400, 460), hop = (B + i * 3) % 7 === 0 ? 1 : 0; docShadow(x + 2, y + 2, 3, 1, 0.4); prect(x, y - hop, 4, 2, '#7a7e8a'); pset(x + ((B + i) % 2 ? 4 : -1), y - 1 - hop, '#5a5e6a'); }
    // the price board on an easel, with its shadow
    ppoly([[178, 366], [236, 366], [262, 372], [204, 372]], '#a8946a');
    prect(176, 292, 3, 74, D.woodDk); prect(230, 292, 3, 74, D.woodDk);
    prect(170, 286, 68, 46, D.wood2); prect(173, 289, 62, 40, D.chalk); ptex(173, 289, 62, 40, D.chalk2, 0.25, 15); prect(170, 330, 68, 2, D.woodDk);
    docText('RENTA 3%', 181, 294, '#e8ecd8');
    docText(price, 204, 308, o.up ? '#f6f0a0' : '#e8ecd8', { scale: 2, align: 'center' });
    // the twins (identical on purpose), with shadows
    for (const x of [60, 140]) ppoly([[x - 5, 368], [x + 6, 368], [x + 24, 374], [x + 12, 374]], '#a8946a');
    docMan(60, 368, { arm: o.armL, flip: false });
    docMan(140, 368, { arm: o.armR, flip: true });
    if (o.after) o.after();
  });
}
function sceneBourse() {
  lowres(DOC_RES, () => { bourseWorld('79,80', { after: () => {
    if (TT < CU.rich) return;
    const n = Math.min(12, 1 + Math.floor((TT - CU.rich) * 6));
    docShadow(104, 368, 12, 2, 0.4);
    for (let k = 0; k < n; k++) { const x = 94 + (k % 3) * 7, y = 364 - Math.floor(k / 3) * 3; prect(x, y, 7, 3, D.gold); prect(x, y, 7, 1, D.goldLt); prect(x + 6, y, 1, 3, D.goldDk); }
    if (n < 12 && B % 2) pset(100 + (B % 3) * 6, 352 - (B % 5), D.goldLt);
  } }); });
  docLabel('MAÑANA: ?', 816, 1010, { at: CU.rich, align: 'center' });
  docLabel('FRANÇOIS', 240, 1182, { at: CU.brothers, align: 'center' });
  docLabel('LOUIS', 560, 1182, { at: CU.brothers + 0.4, align: 'center' });
  docCaptions();
}
// ---- a mail coach: tiny on the map, full size in the plaza; the horse trots on the boil
function coach(x, y, s = 1, flip = false) {
  const f = flip ? -1 : 1, X = (dx) => x + f * dx * s - (flip ? s : 0);
  const R = (dx, dy, w, h, c) => prect(flip ? X(dx + w) + s : X(dx), y + dy * s, w * s, h * s, c);
  const bob = (B % 2) * s;
  R(0, -9, 14, 7, '#3c5a3a'); R(0, -3, 14, 1, '#2a3e28'); R(1, -8, 4, 3, D.sky3); R(7, -8, 4, 3, D.sky3); R(0, -11, 14, 2, D.woodDk); R(2, -14, 10, 3, '#8a6a4a'); R(3, -15, 3, 1, '#a88a6a');
  for (const wx of [3, 12]) { pcircle(X(wx), y - s, Math.max(1, 2 * s), D.ink); if (s >= 2) pset(X(wx) + ((B % 2) ? 1 : -1), y - s, '#8a7a6a'); }
  R(15, -8, 4, 1, D.woodDk);
  prect(flip ? X(26) + s : X(18), y - 9 * s - bob, 8 * s, 5 * s, '#7a4a2a'); prect(flip ? X(28) + s : X(25), y - 11 * s - bob, 3 * s, 4 * s, '#7a4a2a');
  const leg = (B % 2) * s; R(19, -4, 1, 4, '#5a3418'); R(24, -4, 1, 4, '#5a3418'); prect(flip ? X(21) - leg : X(21) + leg, y - 4 * s, s, 4 * s, '#5a3418');
}

// ---- the map: western Europe on old paper. Land polygons (lon, lat) are complete past every frame edge, so the
// map never shows a cut; the sea gets lighter bands that follow each coast. A view is { lon, lat, k, dx, dy }
const FR_COAST_W = [[2.55, 51.08], [1.85, 50.95], [1.6, 50.7], [1.6, 50.2], [0.6, 49.85], [0.1, 49.5], [-0.3, 49.3], [-1.2, 49.4], [-1.3, 49.7], [-1.9, 49.7], [-1.6, 48.7], [-2.3, 48.65], [-3.0, 48.8], [-4.0, 48.7], [-4.7, 48.4], [-4.3, 48.1], [-4.7, 48.0], [-4.2, 47.8], [-3.4, 47.7], [-2.7, 47.5], [-2.2, 47.27], [-2.0, 46.9], [-1.5, 46.4], [-1.15, 46.15], [-1.1, 45.6], [-1.2, 45.0], [-1.25, 44.65], [-1.35, 44.0], [-1.55, 43.48], [-1.78, 43.36]];
const FR_COAST_S = [[3.17, 42.45], [3.05, 42.7], [3.1, 43.1], [3.5, 43.27], [4.1, 43.55], [4.8, 43.35], [5.4, 43.3], [5.9, 43.1], [6.6, 43.2], [7.0, 43.55], [7.5, 43.78]];
const FR_PYR = [[-1.78, 43.36], [-1.4, 43.05], [-0.5, 42.8], [0.7, 42.85], [1.5, 42.5], [2.5, 42.4], [3.17, 42.45]];
const FR_EAST = [[7.5, 43.78], [7.0, 44.2], [6.9, 45.1], [7.05, 45.9], [6.1, 46.2], [6.4, 46.5], [6.9, 47.4], [7.6, 47.6], [7.8, 48.6], [8.2, 48.97], [6.7, 49.2], [5.8, 49.5], [4.8, 50.05], [4.2, 49.95], [3.0, 50.7], [2.55, 51.08]];
const CONTINENT = [[12, 62], [8.8, 57], [8.6, 53.9], [7, 53.6], [5.5, 53.4], [4.7, 52.9], [4.2, 51.9], [3.4, 51.4], ...FR_COAST_W,
  [-2.6, 43.4], [-3.8, 43.45], [-5.7, 43.55], [-7.0, 43.6], [-8.0, 43.7], [-9.3, 43.0], [-8.9, 42.0], [-8.8, 41.0], [-9.0, 39.5], [-9.5, 38.7], [-8.8, 37.0], [-7.4, 37.2], [-6.3, 36.6], [-5.6, 36.0],
  [-4.4, 36.7], [-2.0, 36.7], [-0.7, 37.6], [0.2, 38.8], [-0.3, 39.5], [0.2, 40.2], [0.9, 41.0], [2.2, 41.4], [3.2, 41.9], ...FR_COAST_S,
  [8.2, 43.9], [8.9, 44.4], [9.8, 44.1], [10.3, 43.5], [10.5, 42.9], [11.5, 42.3], [12.5, 41.7], [13.5, 41.2], [15.5, 40.0], [16, 30], [30, 30], [30, 62]];
const ENGLAND = [[-5.7, 50.0], [-4.2, 50.35], [-3.5, 50.6], [-2.0, 50.6], [-1.0, 50.8], [0.3, 50.75], [1.4, 51.15], [1.4, 51.4], [0.9, 51.8], [1.7, 52.6], [1.7, 53.5], [0.2, 53.6], [-0.5, 54.5], [-1.5, 55.6], [-2, 57.5], [-6, 58], [-5, 55], [-3.2, 54.3], [-3, 53.4], [-4.6, 53.3], [-4.2, 52.4], [-5.2, 51.8], [-3.5, 51.5], [-4.2, 51.2]];
const IRELAND = [[-6.0, 52.2], [-6.2, 53.3], [-6.0, 54.0], [-5.5, 54.6], [-6.5, 55.3], [-8.5, 55.3], [-10.5, 54.0], [-10.5, 51.5], [-8.0, 51.6]];
const CORSICA = [[9.4, 43.0], [9.55, 42.6], [9.4, 41.4], [9.1, 41.4], [8.6, 41.9], [8.6, 42.6], [9.3, 43.0]];
const LANDS = [CONTINENT, ENGLAND, IRELAND, CORSICA];
const RIVERS = [
  [[4.3, 45.0], [4.1, 46.0], [3.2, 47.0], [2.9, 47.6], [1.9, 47.9], [1.3, 47.6], [0.69, 47.39], [-0.55, 47.47], [-1.55, 47.21], [-2.2, 47.27]],
  [[4.8, 47.8], [4.0, 48.3], [3.0, 48.4], [2.35, 48.86], [1.8, 49.0], [1.1, 49.4], [0.1, 49.45]],
  [[0.6, 42.9], [1.44, 43.6], [0.6, 44.2], [-0.2, 44.5], [-0.58, 44.84], [-0.75, 45.2], [-1.1, 45.6]],
  [[4.8, 43.35], [4.8, 44.5], [4.85, 45.75], [5.5, 46.2], [6.1, 46.2]],
];
const LINE_PB = [[2.35, 48.86], [1.9, 47.9], [0.69, 47.39], [0.34, 46.58], [0.16, 45.65], [-0.58, 44.84]];   // Paris, Orléans, Tours, Poitiers, Angoulême, Bordeaux
const ROAD_PB = [[2.35, 48.86], [2.0, 48.3], [1.9, 47.9], [1.3, 47.6], [0.69, 47.39], [0.6, 47.0], [0.34, 46.58], [0.2, 46.1], [0.16, 45.65], [-0.2, 45.3], [-0.58, 44.84]];
const CITY = { paris: [2.35, 48.86], tours: [0.69, 47.39], bordeaux: [-0.58, 44.84] };
const MAP_WIDE = { lon: 1.6, lat: 46.8, k: 25.9 }, MAP_PT = { lon: 1.4, lat: 48.0, k: 62 }, MAP_TB = { lon: 0.15, lat: 46.2, k: 44 };
const mapP = (v, [lon, lat]) => [135 + (v.dx ?? 0) + (lon - v.lon) * v.k * 0.688, 245 + (v.dy ?? 0) - (lat - v.lat) * v.k];
// a view between a and b (spring), floating
function viewAt(a, b, t0, dur, seed = 7) {
  const u = clamp(springMove(t0, 0, 1, SPRING.smooth) * clamp((TT - t0) / dur * 4), 0, 1.05), f = docFloat(seed, 1.6);
  return { lon: a.lon + (b.lon - a.lon) * u, lat: a.lat + (b.lat - a.lat) * u, k: a.k * (b.k / a.k) ** u, dx: f.dx, dy: f.dy };
}
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
// a route drawn on up to fraction u (0..1, or [u0, u1] for a moving stretch): a line with railway ticks and a pulsing head
function routeDraw(P, u, o = {}) {
  const [u0, u1] = Array.isArray(u) ? u : [0, u], col = o.col ?? D.ink, tick = o.tick ?? col;
  for (const [x, y, f, th] of alongPts(P, 1)) { if (f < u0 || f > u1) continue; if (o.dash && Math.floor(f * 600) % 4 >= 2) continue; pset(x, y, col); }
  if (!o.dash) for (const [x, y, f, th] of alongPts(P, 4)) { if (f < u0 || f > u1) continue; const nx = -Math.sin(th) * 2, ny = Math.cos(th) * 2; pline(x - nx, y - ny, x + nx, y + ny, tick); }
  if (u1 > 0 && u1 < 1 && o.head !== false) { const pts = alongPts(P, 1), h = pts[Math.min(pts.length - 1, Math.floor(u1 * pts.length))]; pcircle(h[0], h[1], 2, o.headCol ?? col); pcircle(h[0], h[1], 4 + (B % 3), o.headCol ?? col, { ring: 1 }); }
}
function mapWorld(v, o = {}) {
  const M = (p) => mapP(v, p), LP = LINE_PB.map(M);
  // the sea: a base with faint swell lines, then lighter bands hugging every coast
  pfill(D.sea); for (let y = 0; y < 480; y += 5) pdither(0, y, 270, 2, null, D.sea2, () => 0.35);
  const polys = LANDS.map((L) => L.map(M)), shifted = (P, dx, dy) => P.map(([x, y]) => [x + dx, y + dy]);
  for (const [r, c] of [[8, '#9ebccc'], [5, '#a8c4d2'], [3, '#b6cfda']]) for (const P of polys) for (let a = 0; a < 8; a++) ppoly(shifted(P, Math.round(Math.cos(a * Q8) * r), Math.round(Math.sin(a * Q8) * r)), c);
  for (const P of polys) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) ppoly(shifted(P, dx, dy), '#5d7c90');
  for (const P of polys) ppoly(P, D.paper);
  // paper grain and old stains on the land only: recolour the flat paper pixels in place (keyed to the float)
  { const im = ctx.getImageData(0, 0, 270, 480), d = im.data, pp = rgbOf(D.paper), p2 = rgbOf(D.paper2), pl = rgbOf('#f8ecd0'), st = rgbOf('#dcc89c'), ox = Math.round(v.dx ?? 0), oy = Math.round(v.dy ?? 0);
    for (let j = 0; j < 480; j++) for (let i = 0; i < 270; i++) {
      const q = (j * 270 + i) * 4; if (d[q] !== pp[0] || d[q + 1] !== pp[1] || d[q + 2] !== pp[2]) continue;
      const h = dhash(i - ox, j - oy, 21), stain = [[40, 160, 26], [220, 400, 34], [200, 140, 18]].some(([sx, sy, sr]) => Math.hypot(i - sx, j - sy) < sr) && bayer(i, j) < 0.18;
      const c = stain ? st : h < 0.14 ? p2 : h > 0.95 ? pl : null; if (c) { d[q] = c[0]; d[q + 1] = c[1]; d[q + 2] = c[2]; }
    }
    ctx.putImageData(im, 0, 0); }
  const g0 = Math.floor(v.lon - 12), g1 = Math.ceil(v.lon + 12);
  for (let lon = g0; lon <= g1; lon++) { const [x] = M([lon, v.lat]); pdither(x, 0, 1, 480, null, D.paperDk, (i, j) => (j % 2 ? 0.6 : 0)); }
  for (let lat = Math.floor(v.lat - 12); lat <= Math.ceil(v.lat + 12); lat++) { const [, y] = M([v.lon, lat]); pdither(0, y, 270, 1, null, D.paperDk, (i) => (i % 2 ? 0.6 : 0)); }
  const poly = (pts, c, dash) => { const P = pts.map(M); for (let i = 1; i < P.length; i++) { if (dash) { for (const [x, y] of alongPts([P[i - 1], P[i]], 2)) pset(x, y, c); } else pline(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], c); } };
  poly(FR_PYR, '#8a6a4a', true); poly(FR_EAST, '#8a6a4a', true);
  for (const r of RIVERS) poly(r, '#86a8bc');
  // faint names of the neighbours, drawn with the map so they move with it
  for (const [t, p] of [['ESPAÑA', [-3.8, 40.6]], ['INGLATERRA', [-1.6, 52.2]], ['OCÉANO', [-3.6, 45.4]], ['ATLÁNTICO', [-3.6, 44.9]], ['MEDITERRÁNEO', [5.6, 42.0]]]) { const [x, y] = M(p); docText(t, x, y, t === 'ESPAÑA' || t === 'INGLATERRA' ? D.paperDk : '#5d7c90', { align: 'center' }); }
  // the telegraph line: faint until a scene draws it on; tower ticks along it
  if (o.line !== false) routeDraw(LP, 1, { col: '#b09878', head: false });
  const towers = alongPts(LP, Math.max(5, Math.round(v.k / 5)));
  for (const [x, y] of towers) { pset(x, y - 1, D.woodDk); pset(x, y, D.woodDk); pset(x - 1, y - 1, D.woodDk); pset(x + 1, y - 1, D.woodDk); }
  for (const k in CITY) { const [x, y] = M(CITY[k]); prect(x - 2, y - 2, 5, 5, D.ink); prect(x - 1, y - 1, 3, 3, D.paper); }
  // the edges darken like an old sheet
  pdither(0, 0, 270, 480, null, '#8a7a5a', (i, j) => { const d = Math.min(i, j, 269 - i, 479 - j); return d < 10 ? 0.35 * (1 - d / 10) : 0; });
  return { M, LP, towers };
}
// a city label on the map, at its projected spot (screen coords from the 270-grid)
function mapLabel(v, k, txt, dx = 12, dy = -4, at) { const [x, y] = mapP(v, CITY[k]); docLabel(txt, x * 4 + dx * 4, y * 4 + dy * 4, { fg: D.ink, outline: D.paper, at }); }

// ---- 5: the whole line lights up Paris to Bordeaux in minutes; then the state's stamp
function sceneMap() {
  const v = viewAt({ lon: 1.6, lat: 46.6, k: 23.5 }, { lon: 1.3, lat: 46.7, k: 27.5 }, 14.0, 4.0);
  lowres(DOC_RES, () => {
    const { LP, towers } = mapWorld(v, { line: false });
    const u = clamp((TT - 14.5) / 1.5);
    routeDraw(LP, 1, { col: '#c8b494', head: false });
    routeDraw(LP, EZ.io(u), { col: '#b06a10', tick: D.amber, headCol: D.amber });
    for (const [x, y, f] of towers) if (f <= EZ.io(u)) { const fresh = EZ.io(u) - f < 0.08; prect(x - 1, y - 2, 3, 3, D.amber); if (fresh) pcircle(x, y - 1, 3, D.goldLt, { ring: 1 }); }
  });
  mapLabel(v, 'paris', 'PARÍS'); mapLabel(v, 'tours', 'TOURS', 6, 4); mapLabel(v, 'bordeaux', 'BURDEOS', -10, 8);
  docStamp('SOLO EL ESTADO', 540, 1440, { at: CU.stamp });
  docCaptions();
}
// ---- 7: the news crawls by coach along the road, days late; the road draws on behind it
function sceneCoach() {
  const v = viewAt({ lon: 1.2, lat: 46.9, k: 27 }, { lon: 0.8, lat: 46.4, k: 30 }, 22.0, 3.5, 9);
  lowres(DOC_RES, () => {
    const { M } = mapWorld(v), RP = ROAD_PB.map(M), u = clamp((TT - 22.3) / 3.2) * 0.85, pts = alongPts(RP, 1), p = pts[Math.min(pts.length - 1, Math.floor(u * pts.length))];
    routeDraw(RP, u, { col: '#8a5a32', dash: true, head: false });
    docShadow(p[0] - 6, p[1] + 4, 9, 1, 0.4);
    coach(p[0] - 10, p[1] + 3, 1, true);
    if ((B % 4) < 2) pset(p[0] + 18, p[1] - 2, '#d8c8a8');   // dust behind the wheels
  });
  const day = 1 + Math.min(4, Math.floor(clamp((TT - 22.3) / 3.2) * 5));
  mapLabel(v, 'paris', 'PARÍS'); mapLabel(v, 'bordeaux', 'BURDEOS', -10, 8);
  docLabel('DÍA ' + day, 540, 1380, { at: 22.3, align: 'center', scale: 2 });
  docCaptions();
}
// ---- 10: the bribe at Tours. The map zooms in; a parcel travels the road from Paris; a loupe opens on it
function sceneBribe() {
  const v = viewAt({ lon: 1.6, lat: 47.2, k: 30 }, MAP_PT, 33.0, 1.2, 11);
  lowres(DOC_RES, () => {
    const { M } = mapWorld(v), [tx, ty] = M(CITY.tours), RP = ROAD_PB.slice(0, 5).map(M);
    if (TT >= CU.bribe) { pcircle(tx, ty, 7, D.amber, { ring: 1 }); if (B % 4 < 2) pcircle(tx, ty, 10, D.amber, { ring: 1 }); }
    const u = EZ.io(clamp((TT - CU.parcel) / 1.3)), pts = alongPts(RP, 1), p = pts[Math.min(pts.length - 1, Math.floor(u * pts.length))];
    if (TT >= CU.parcel - 0.4) {
      routeDraw(RP, u, { col: '#8a5a32', dash: true, head: false });
      const x = Math.round(p[0]), y = Math.round(p[1]) - 8 - (B % 2);
      docShadow(x, y + 10, 5, 1, 0.4); prect(x - 5, y - 4, 11, 8, '#b08a58'); prect(x - 5, y - 4, 11, 1, '#d8b47c'); prect(x, y - 4, 1, 8, '#6a4a28'); prect(x - 5, y, 11, 1, '#6a4a28');
    }
    docIris(178, 392, irisR(CU.parcel + 1.5, 64), (cx, cy, rr) => {
      prect(cx - rr, cy - rr, 2 * rr + 1, 2 * rr + 1, '#8a5a32'); ptex(cx - rr, cy - rr, 2 * rr, 2 * rr, '#6a4426', 0.25, 23);
      docShadow(cx + 4, cy + 4, 46, 32, 0.5);
      prect(cx - 44, cy - 30, 88, 60, '#d8b47c'); prect(cx - 40, cy - 26, 80, 52, D.paper2); prect(cx - 40, cy - 26, 80, 4, D.paperDk);
      // the folded garment rises out of the box: the kind of garment was the code
      const lift = Math.round(6 * EZ.o3(clamp((TT - CU.parcel - 1.8) / 0.4)));
      ppoly([[cx - 26, cy - 14 - lift], [cx + 26, cy - 14 - lift], [cx + 30, cy + 16 - lift], [cx - 30, cy + 16 - lift]], '#7a5aa0');
      pdither(cx - 30, cy - 14 - lift, 60, 30, null, '#5a3a80', (i, j) => ((i + j) % 7 === 0 ? 1 : 0));
      prect(cx - 26, cy - 14 - lift, 52, 2, '#9a7ac0');
    });
  });
  mapLabel(v, 'paris', 'PARÍS'); mapLabel(v, 'tours', 'TOURS', 14, 2);
  docLabel('OPERADOR', mapP(v, CITY.tours)[0] * 4 - 10, mapP(v, CITY.tours)[1] * 4 + 60, { at: CU.bribe + 0.3 });
  docLabel('LA PRENDA ERA LA SEÑAL', 600, 1400, { at: CU.parcel + 2.0, align: 'center' });
  docCaptions();
}
// ---- 11: the red symbol hops tower to tower to Bordeaux; the spy's spyglass
const TB_PART = (LP) => LP.slice(2);   // Tours (index 2 of LINE_PB) to Bordeaux
function sceneRelay() {
  const v = viewAt({ lon: 0.3, lat: 46.4, k: 40 }, MAP_TB, 37.0, 4.0, 13);
  lowres(DOC_RES, () => {
    const { LP, towers } = mapWorld(v), seg2 = TB_PART(LP), u = EZ.io(clamp((TT - CU.relay) / 1.6));
    routeDraw(seg2, u, { col: D.red, tick: D.redDk, headCol: D.red });
    const tw = alongPts(seg2, Math.max(5, Math.round(v.k / 5)));
    for (const [x, y, f] of tw) if (f <= u) { prect(x - 1, y - 2, 3, 3, D.red); if (u - f < 0.06) pcircle(x, y - 1, 3, D.red, { ring: 1 }); }
    docIris(200, 330, irisR(CU.spy, 48), (cx, cy, r) => {
      pgrad(cx - r, cy - r, 2 * r + 1, 2 * r + 1, [D.sky1, D.sky3, D.sky4]);
      const hl = []; for (let x = -r; x <= r; x += 3) hl.push([cx + x, cy + 22 + 5 * Math.sin(x * 0.05)]); hl.push([cx + r, cy + r + 2], [cx - r, cy + r + 2]);
      ppoly(hl, D.grass); ptex(cx - r, cy + 16, 2 * r, r, D.grass2, 0.2, 41);
      const sway = Math.round(Math.sin(TT * 3) * 1.5);   // the spyglass trembles in his hand
      pshift(sway, 0, () => tower(cx, cy + 26, 1.1, [2 * Q8, 6 * Q8, 6 * Q8], D.red));
      pdither(cx - r, cy - r, 2 * r + 1, 2 * r + 1, null, D.shadow, (i, j) => clamp((Math.hypot(i - cx, j - cy) - r * 0.7) / (r * 0.3)) * 0.8);   // the glass's vignette
    });
  });
  mapLabel(v, 'tours', 'TOURS'); mapLabel(v, 'bordeaux', 'BURDEOS', -10, 8);
  docLabel('EL ESPÍA', 800, 1060, { at: CU.spy + 0.6, align: 'center' });
  docCaptions();
}
// ---- 13: two years: red pulses keep running to Bordeaux, the coins pile up; then the operator falls ill
function sceneYears() {
  const v = viewAt(MAP_TB, { lon: 0.3, lat: 46.4, k: 38 }, 44.5, 3.5, 15);
  lowres(DOC_RES, () => {
    const { LP } = mapWorld(v), seg2 = TB_PART(LP);
    for (let k = 0; k < 3; k++) { const u = mod((TT - 44.5) * 0.9 - k / 3, 1); routeDraw(seg2, [Math.max(0, u - 0.12), u], { col: D.red, tick: D.redDk, headCol: D.red }); }
    const [bx, by] = mapP(v, CITY.bordeaux), n = Math.min(16, 2 + Math.floor((TT - 44.5) * 5));
    docShadow(bx + 17, by + 10, 10, 2, 0.4);
    for (let k = 0; k < n; k++) { const x = bx + 10 + (k % 2) * 8, y = by + 6 - Math.floor(k / 2) * 3; prect(x, y, 7, 3, D.gold); prect(x, y, 7, 1, D.goldLt); prect(x + 6, y, 1, 3, D.goldDk); }
    docIris(192, 250, irisR(CU.sick, 56), (cx, cy, r) => {
      prect(cx - r, cy - r, 2 * r + 1, 2 * r + 1, '#8a6a52'); ptex(cx - r, cy - r, 2 * r, 2 * r, '#7a5a44', 0.25, 43);
      pdither(cx - r, cy - r, 2 * r + 1, 2 * r + 1, null, '#f2cc6a', (i, j) => clamp(1 - Math.hypot(i - cx + 30, j - cy + 20) / 40) * 0.5);   // candle light
      prect(cx - 34, cy - 30, 2, 8, '#f0e8d0'); pset(cx - 34, cy - 32 - (B % 2), '#f6c84a');
      docShadow(cx - 12, cy + 22, 32, 3, 0.5);
      prect(cx - 40, cy + 2, 54, 14, D.shirt); prect(cx - 40, cy + 16, 54, 4, D.woodDk); prect(cx - 44, cy - 10, 5, 30, D.woodDk);
      prect(cx - 38, cy - 4, 10, 8, D.skin); prect(cx - 38, cy - 5, 10, 2, '#3a2618'); prect(cx - 28, cy - 1 + (B % 4 < 2 ? 0 : 1), 40, 5, '#9a9ab0');
      docShadow(cx + 32, cy + 27, 10, 2, 0.5);
      docMan(cx + 30, cy + 26, { flip: true, coat: '#4a3a2a', coat2: '#5c4a38' });
      if (TT >= CU.sick + 0.7) { prect(cx + 22, cy - 40, 13, 13, D.cap); docText('!', cx + 26, cy - 37, D.ink); }
    });
  });
  mapLabel(v, 'bordeaux', 'BURDEOS', -10, 8);
  docLabel(String(1834 + Math.min(2, Math.floor((TT - 44.5) / 0.6))), 540, 1460, { at: 44.5, align: 'center', scale: 2 });
  docCaptions();
}

// ---- 8: the network's own "error" sign; the copy gets it, then everything holds its breath
const ERR = [0, 2, 2];
function sceneError() {
  const seq = [[25.5, 0, 2, 6], [CU.err, ...ERR]];
  lowres(DOC_RES, () => {
    hillsWorld({ near: { seq }, mid: { seq: delaySeq(seq, -0.4) }, far: { seq: delaySeq(seq, -0.8) }, sight: TT < CU.drop, strip: [[25.5, 0, 2, 6], [25.5, 0, 4, 6], [CU.err + 0.4, ...ERR, false]] });
    if (TT >= CU.drop) pdither(0, 0, 270, 480, null, D.bar, () => 0.25);
  });
  docLabel('ERROR', 180, 760, { at: CU.err + 0.2 });
  docCaptions();
}
// ---- 9: THE TRICK. A fake red symbol, then "error": the copy strikes both out and stays clean
function sceneTrick() {
  const seq = [[29.0, 2, 6, 6], [30.0, ...ERR], [30.8, 0, 4, 2]];
  lowres(DOC_RES, () => {
    hillsWorld({ near: { seq, col: TT < 30.0 ? D.red : null }, mid: { seq: delaySeq(seq, 0.4), col: TT >= 29.4 && TT < 30.4 ? D.red : null }, far: { seq: delaySeq(seq, 0.8), col: TT >= 29.8 && TT < 30.8 ? D.red : null }, sight: true,
      strip: [[25.5, 0, 2, 6], [25.5, 0, 4, 6], [29.2, 2, 6, 6, true, 31.4], [30.2, ...ERR, false, 31.4], [31.0, 0, 4, 2]] });
    if (TT < 29.0 + 1 / 12) pfill('#f4ecd8');   // the hit: one white frame
  });
  docLabel('SÍMBOLO FALSO', 120, 700, { at: CU.hit, fg: D.red, until: 30.0 });
  docLabel('ERROR', 180, 760, { at: 30.1, until: 31.4 });
  docStamp('LIMPIA', 800, 1380, { at: CU.clean + 0.2, fg: '#2e6a3a' });
  docCaptions();
}
// ---- 12: they buy; the coach rolls in later; the price moves
function sceneBuy() {
  const up = TT >= 43.6;
  lowres(DOC_RES, () => {
    bourseWorld(up ? '80,05' : '79,80', { up, armL: TT >= CU.buy ? 'up' : null, after: () => {
      if (TT < 42.6) return;
      const x = -40 + Math.min(80, Math.floor((TT - 42.6) * 60));
      docShadow(x + 26, 354, 30, 3, 0.45); coach(x, 352, 2);
      if (TT < 43.4) for (let k = 0; k < 3; k++) docShadow(x - 6 - k * 8, 348 - k, 4 + k, 2, 0.25, '#e8dcbc');   // dust
    } });
  });
  docLabel('¡COMPRA!', 240, 1160, { at: CU.buy, fg: D.cap });
  docLabel('↑', 900, 1100, { at: 43.6, fg: '#f6f0a0', scale: 2 });
  docLabel('LLEGA LA NOTICIA', 300, 1440, { at: 43.0, until: 44.5 });
  docCaptions();
}
// ---- 14: the trial at Tours, 1837. A plaster wall, a tall window and its shaft of light with dust, the bench,
// the semaphore model as evidence, the twins in the dock up front. The gavel shakes the room
function sceneCourt() {
  const f = docFloat(17, 1.6), shake = (TT >= CU.gavel && TT < CU.gavel + 0.17) || (TT >= CU.jury + 0.9 && TT < CU.jury + 1.07) ? (B % 2 ? 2 : -2) : 0, L = (d, fn) => pshift(f.dx * d + shake, f.dy * d, fn);
  lowres(DOC_RES, () => {
    L(0.6, () => {
      prect(-10, -10, 290, 250, '#b9ab88'); ptex(-10, 0, 290, 240, '#a89a78', 0.25, 61); ptex(-10, 0, 290, 240, '#c8bc98', 0.1, 62);
      prect(-10, 40, 290, 4, '#9a8c6a'); prect(-10, 44, 290, 1, '#d4c8a4');
      // the clock, ticking
      pcircle(40, 100, 11, '#5a3820'); pcircle(40, 100, 9, '#efe6cc'); const th = Math.floor(TT * 2) * Math.PI / 30 - Math.PI / 2; pline(40, 100, 40 + Math.cos(th) * 7, 100 + Math.sin(th) * 7, D.ink); pline(40, 100, 40, 94, D.ink);
      // the window and its frame
      prect(192, 56, 58, 178, '#3e2614'); prect(196, 60, 50, 170, '#efe6cc'); pdither(196, 60, 50, 170, null, '#fff8e4', (i, j) => (j < 120 ? 0.5 : 0.2));
      prect(220, 60, 2, 170, '#3e2614'); for (const y of [100, 140, 185]) prect(196, y, 50, 2, '#3e2614'); prect(188, 232, 66, 4, '#5a3820');
      // the bench: top rail, recessed panels, the judges (the presiding one in red) and the gavel
      docBust(60, 176, { coat: D.coat, cap: D.coat, jabot: true, hat: false, key: 'j1', look: 1 });
      docBust(110, 176, { coat: '#8a1a1a', coat2: '#a02a24', cap: '#8a1a1a', jabot: true, hat: false, key: 'j2', talk: TT < CU.gavel, beard: true, hair: '#d8d4c8' });
      docBust(160, 176, { coat: D.coat, cap: D.coat, jabot: true, hat: false, key: 'j3', look: -1 });
      const down = (TT >= CU.gavel && TT < CU.gavel + 0.25) || (TT >= CU.jury + 0.9 && TT < CU.jury + 1.15); pbeam(124, down ? 168 : 156, 132, down ? 172 : 150, 2, D.woodDk); prect(down ? 129 : 128, down ? 170 : 146, 7, 4, D.woodDk);
      prect(16, 172, 182, 6, '#7a4a2a'); prect(16, 178, 182, 64, '#5a3820'); pdither(16, 178, 182, 6, null, D.shadow, (i, j) => 0.5 * (1 - (j - 178) / 6));
      for (let k = 0; k < 4; k++) { const x = 24 + k * 44; prect(x, 188, 36, 44, '#4a2e18'); prect(x, 188, 36, 1, D.shadow); prect(x, 188, 1, 44, D.shadow); prect(x + 35, 188, 1, 44, '#7a4a2a'); prect(x, 231, 36, 1, '#7a4a2a'); }
    });
    L(0.85, () => {
      // the lower wall: dark panelling with bevels
      prect(-10, 240, 290, 250, '#4a2e1a');
      for (let k = 0; k < 6; k++) for (let j = 0; j < 2; j++) { const x = -4 + k * 48, y = 252 + j * 100; prect(x, y, 40, 88, '#3e2614'); prect(x, y, 40, 1, D.shadow); prect(x, y, 1, 88, D.shadow); prect(x + 39, y, 1, 88, '#6a4428'); prect(x, y + 87, 40, 1, '#6a4428'); }
    });
    // the shaft of light from the window, down-left across the room, with floating dust
    const sh = (i, j) => { const u = (j - 236) / 244; if (u < 0) return 0; const a = 196 - u * 150 + f.dx * 0.6, b = 246 - u * 110 + f.dx * 0.6; return i > a && i < b ? 0.42 - 0.12 * u : 0; };
    pdither(0, 236, 270, 244, null, '#f2e4c0', sh);
    for (let k = 0; k < 22; k++) { const r = RNG('dust', k), x = mod(r.i(0, 200) + TT * (1 + k % 3), 200) + 40, y = mod(r.i(240, 470) - TT * 2, 240) + 240; if (sh(Math.round(x), Math.round(y)) > 0 && (B + k) % 5 > 0) pset(x, y, '#fff8e4'); }
    L(1, () => {
      // the evidence table and the semaphore model (a red tag on its arm)
      docShadow(84, 356, 60, 4, 0.5);
      prect(8, 328, 130, 6, '#2e4a34'); prect(8, 334, 130, 3, '#22382a'); prect(14, 337, 4, 38, D.woodDk); prect(128, 337, 4, 38, D.woodDk);
      prect(70, 262, 3, 66, '#e8e0c8'); prect(72, 262, 1, 66, '#b8b098'); chappe(71, 262, 1.1, 0, 2 * Q8, 6 * Q8, { col: '#e8e0c8', dots: '#b8b098' });
      prect(60, 322, 22, 6, '#e8e0c8'); prect(88, 281, 6, 4, D.red);
      // the dock: the twins behind a balustrade, looking up at the bench
      docShadow(205, 470, 70, 6, 0.5);
      const glance = TT >= CU.jury + 0.2 && TT < CU.jury + 0.8;   // the twins glance at each other at the verdict
      docBust(178, 418, { key: 't1', look: glance ? 1 : -1 }); docBust(226, 418, { key: 't2', look: -1 });
      prect(140, 412, 140, 6, '#7a4a2a'); prect(140, 418, 140, 70, '#4a2e18'); for (let x = 146; x < 280; x += 10) { prect(x, 420, 4, 56, '#5a3820'); prect(x + 3, 420, 1, 56, '#3e2614'); }
      prect(140, 418, 140, 2, D.shadow);
    });
  });
  docCaptions();
}
// ---- 14b: black. The twist, alone
function sceneBlack() {
  lowres(DOC_RES, () => pfill(D.bar));
  docCaption('PERO HACKEAR NO ERA DELITO.', CU.nolaw, { bar: false, y: 900, cps: 24 });
}
// ---- 15: the law of 2 May 1837 is written out; then the towers become masts, the far ones first
function sceneLaw() {
  lowres(DOC_RES, () => {
    hillsWorld({ antennas: clamp((TT - CU.morph) / 1.2) });
    if (TT >= CU.law) {
      const drop = Math.round(10 * (1 - EZ.o3(clamp((TT - CU.law) / 0.3))));
      docShadow(137, 378, 120, 3, 0.5);
      prect(14, 330 - drop, 242, 44, D.paper); ptex(14, 330 - drop, 242, 44, D.paper2, 0.2, 51); prect(14, 330 - drop, 242, 1, D.paperDk); prect(14, 373 - drop, 242, 1, D.paperDk);
      docText('LEY DEL 2 DE MAYO DE 1837', 135, 337 - drop, D.ink, { align: 'center', count: (TT - CU.law) * 30 });
      docText('SEÑALES SIN PERMISO: CÁRCEL', 135, 355 - drop, D.redDk, { align: 'center', count: (TT - CU.law - 0.9) * 30 });
    }
    if (TT >= CU.morph && TT < CU.morph + 1.4 && B % 3 === 0) pdither(0, 0, 270, 480, null, '#f4f4f0', () => 0.12);   // a flicker as the eras switch
  });
  docCaptions();
}
// ---- 16: the masts today: a hidden red packet among the white ones, an insider at the base. Then the title
// over the opening roof at dusk, its arms red: the start, changed
const DUSK = ['#2a2850', '#4a3a6a', '#8a4a6a', '#d0705a', '#f0b070'];
function sceneToday() {
  if (TT >= CU.title) {
    const f = docFloat(19, 2), push = 1 + 0.05 * EZ.io(clamp((TT - CU.title) / 2.8));
    lowres(DOC_RES, () => { roofWorld({ s: push, ox: 135 - 135 * push, oy: 480 - 480 * push }, [0, 4 * Q8, 6 * Q8], { col: D.red, skyCols: DUSK, lit: true, birds: 2, cam: f, cloudCols: { lt: '#f0b090', dk: '#b07080' } }); });
    pixDefer(() => lowres(DOC_TXT, () => {
      const n = Math.floor((TT - CU.title) * 16) + 1;
      docText('EL PRIMER', 90, 60, D.cap, { align: 'center', scale: 2, count: n, outline: D.bar });
      docText('HACKEO', 90, 84, D.cap, { align: 'center', scale: 2, count: n - 10, outline: D.bar });
      docText('PARÍS-BURDEOS, 1834', 90, 108, D.amber, { align: 'center', count: (TT - CU.title - 1) * 24, outline: D.bar });
    }));
    return;
  }
  lowres(DOC_RES, () => {
    const cam = docFloat(3, 2);
    hillsWorld({ antennas: 1, cam });
    const A = [[66 + cam.dx, 168 + cam.dy], [170 + cam.dx * 0.6, 182 + cam.dy * 0.6], [226 + cam.dx * 0.35, 204 + cam.dy * 0.35]];
    for (let k = 0; k < 6; k++) {
      const u = mod(TT * 0.7 + k / 6, 1), i = Math.floor(u * 2), fr = u * 2 - i, [x0, y0] = A[i], [x1, y1] = A[i + 1];
      const x = x0 + (x1 - x0) * fr, y = y0 + (y1 - y0) * fr - 10 * Math.sin(Math.PI * fr), red = k === 2;
      prect(x - 2, y - 2, 5, 4, red ? D.red : '#f0f2f4'); prect(x - 2, y + 2, 5, 1, red ? D.redDk : '#9aa4b0');
    }
    pshift(cam.dx, cam.dy, () => { docShadow(88, 362, 8, 2, 0.5); pcircle(84, 344, 15, D.amber, { ring: 1 }); docMan(84, 360, { coat: '#3a4a5a', coat2: '#4c5c6c', flip: true }); });
  });
  docLabel('SEÑAL ESCONDIDA', 380, 640, { at: 55.6, fg: D.red });
  docLabel('INFILTRADO', 336, 1500 - 110, { at: 56.2, align: 'center' });
  docCaptions();
}
const SCENES = { roof: sceneRoof, arms: sceneArms, book: sceneBook, hills: sceneHills, map: sceneMap, bourse: sceneBourse, coach: sceneCoach,
  error: sceneError, trick: sceneTrick, bribe: sceneBribe, relay: sceneRelay, buy: sceneBuy, years: sceneYears, court: sceneCourt,
  black: sceneBlack, law: sceneLaw, today: sceneToday };

// =====================================================================
//  SOUND CUES — exported from the picture's own timing for sound-layer/scripts/mix.py (never typed frames):
//  shot cuts, arm poses (spring peak ≈ 0.08 s after a pose starts), labels and stamps (their `at`), captions
//  typing (30 glyphs/s × k), counters, loupes (irisR springs), the gavel, coins, hooves. Times in VIDEO seconds.
// =====================================================================
function soundCues() {
  const out = [], P = (id, t, sound, o = {}) => out.push({ id, t: +t.toFixed(3), sound, ...o }), cu = CU;
  const S = { tapA: 'tap/fs-369710-wood-knock', tapB: 'tap/kenney-impact-impact-wood-light-000', tapC: 'tap/kenney-impact-impact-wood-light-002',
    heavy: 'tap/kenney-impact-impact-wood-heavy-003', keys: ['key/fs-194797-vintage-keyboard-3-1', 'key/fs-348239-mech-keyboard-01-wav-1', 'key/fs-194796-vintage-keyboard-2-1', 'key/fs-348238-mech-keyboard-02-wav-1'],
    label: 'click/kenney-ui-audio-switch28', latch: 'click/kenney-rpg-metal-latch', page: ['paper/fs-151221-page-turn-2-2', 'paper/fs-397551-page-turn-04-wav-3', 'paper/fs-614080-page-turn-2-2'],
    swish: ['swish/fs-388003-double-swish-1', 'swish/fs-14175-27-wav-2', 'swish/fs-14175-27-wav-1'], tick: ['tick/fs-130388-clock-ticking-1', 'tick/fs-403001-clock-tick-tik-tak-2'],
    thud: 'thump/fs-454222-thud-pint-glass-beer-down-on-1', thudB: 'thump/fs-405537-thud-2-wav-1', ding: 'chime/fs-404104-glass-ding-3', bell: 'chime/fs-192761-ryuuzan-shop-door-bell00-wav-1',
    coin: 'audio/own/coin-drop.wav', hoovesA: 'audio/own/hooves-coach.wav', hoovesB: 'audio/own/hooves-plaza.wav' };
  // cuts: a soft swish, a page turn into and out of maps; the black and the trick are heroes (below)
  SHOT_LIST.forEach(([t0, sc], i) => { if (!i || sc === 'trick' || sc === 'black') return; const map = ['map', 'coach', 'bribe', 'relay', 'years'].includes(sc) || ['map', 'coach', 'bribe', 'relay', 'years'].includes(SHOT_LIST[i - 1][1]);
    P('cut-' + sc, t0, map ? S.page[i % 3] : S.swish[i % 3], { visual: 'cut', align: 'peak' }); });
  // HEROES (one per key reveal): the red flash, the state's stamp, THE TRICK, the gavel, the black, the title
  P('hero-red', NT(cu.red), 'thump/fs-389665-thump-close-wav-2+' + S.heavy, { weight: 'hero', visual: 'appear' });
  P('red-swell', NT(cu.red), 'reverse/fs-503808-reverse-fx-5-wav-1', { align: 'end' });
  P('stamp', NT(cu.stamp), S.thudB + '+' + S.heavy, { visual: 'appear', lift: 6 });
  P('hero-trick', NT(cu.hit), 'hit/fs-113747-kl-ex1bb-wav-2+boom/fs-636624-deep-hit-2', { weight: 'hero', visual: 'cut', stop_before: true, build: true });
  P('trick-swell', NT(cu.hit), 'reverse/fs-503805-reverse-fx-7-wav-1', { align: 'end' });
  P('hero-gavel', NT(cu.gavel), S.thud + '+' + S.heavy, { weight: 'hero', visual: 'appear' });
  P('hero-black', SHOT_LIST.find((r) => r[1] === 'black')[0], 'thump/fs-389665-thump-close-wav-2+' + S.tapA, { weight: 'hero', visual: 'cut' });
  P('hero-title', NT(cu.title), 'hit/fs-113749-kl-ex1dd-wav-3+boom/fs-636624-deep-hit-2', { weight: 'hero', visual: 'cut' });
  P('title-swell', NT(cu.title), 'reverse/fs-503804-reverse-fx-2-wav-1', { align: 'end' });
  // the telegraph arms: a wooden knock at each pose's spring peak (roof, close-up, the hills' chain, error, trick)
  const armsAt = (seq, tag, d = 0) => seq.slice(1).forEach(([t], k) => P(`arm-${tag}${k}`, NT(t + d + 0.08), [S.tapA, S.tapB, S.tapC][k % 3], { visual: 'move' }));
  armsAt(ROOF_POSES, 'roof'); armsAt(ARM_POSES, 'close');
  TICK.slice(1).forEach(([t], k) => { P(`arm-near${k}`, NT(10.5 + t + 0.8 + 0.08), S.tapA, { visual: 'move' }); });
  P('arm-err', NT(cu.err + 0.08), S.tapA, { visual: 'move' }); P('arm-errtrick', NT(30.0 + 0.08), S.tapC, { visual: 'move' }); P('arm-back', NT(30.8 + 0.08), S.tapA, { visual: 'move' });
  // typing: a typewriter key every ~0.22 s while a caption types (at most 5 per caption)
  const kOf = (t) => { for (let i = SHOT_LIST.length - 1; i >= 0; i--) if (t >= SHOT_LIST[i][3] - 1e-6) return SHOT_LIST[i][5]; return 1; };
  CAPS.forEach(([t0, s], i) => { if (!s) return; const prev = i > 0 ? CAPS[i - 1][1] : null, pre = prev && s.startsWith(prev) ? docChars(prev).length : 0, n = docChars(s).length - pre, dur = n / (30 * kOf(t0)), next = i + 1 < CAPS.length ? NT(CAPS[i + 1][0]) : DURATION;
    const m = dur > 1.4 ? 2 : 1; for (let k = 0; k < m; k++) { const t = NT(t0) + k * dur / m; if (t < next - 0.05 && !(t > 29.9 && t < 31.0)) P(`type${i}-${k}`, t, S.keys[(i + k) % 4], { align: 'start' }); } });
  for (let k = 0; k < 2; k++) P(`type-black${k}`, NT(cu.nolaw) + k * 0.22, S.keys[k % 4], { align: 'start' });
  for (let k = 0; k < 2; k++) P(`type-title${k}`, NT(cu.title) + 0.1 + k * 0.25, S.keys[k % 4], { align: 'start' });
  // labels and numbers popping on (their own `at` times), loupes opening (irisR spring peak ≈ 0.1 s)
  [['n50', cu.arms + 0.3, S.heavy], ['n87', cu.arms + 1.5, S.heavy], ['lbl-page', cu.book + 1.4, S.label], ['lbl-op', cu.op + 0.4, S.label], ['lbl-francois', cu.brothers, S.label],
   ['lbl-louis', cu.brothers + 0.4, S.label], ['lbl-tomorrow', cu.rich, S.label], ['lbl-day', 22.3, S.label], ['lbl-operator', cu.bribe + 0.3, S.label], ['lbl-garment', cu.parcel + 2.0, S.label],
   ['lbl-spy', cu.spy + 0.6, S.label], ['lbl-buy', cu.buy, S.label], ['lbl-news', 43.0, S.label], ['lbl-up', 43.6, S.label], ['lbl-err', cu.err + 0.2, S.latch], ['lbl-fake', cu.hit + 0.05, S.latch],
   ['lbl-err2', 30.1, S.latch], ['lbl-signal', 55.6, S.label], ['lbl-insider', 56.2, S.label]].forEach(([id, t, s]) => P(id, NT(t), s, { visual: 'appear' }));
  for (const [id, t] of [['loupe-book', cu.book], ['loupe-op', cu.op], ['loupe-parcel', cu.parcel + 1.5], ['loupe-spy', cu.spy], ['loupe-sick', cu.sick]]) P(id, NT(t + 0.1), S.swish[0], { visual: 'move' });
  P('line87', NT(cu.book + 1.1), S.page[1]); P('pages', NT(cu.book + 0.5), S.page[0]);
  // counters: the days of the coach, the years
  for (let k = 1; k <= 4; k++) P(`day${k}`, NT(22.3 + k * 0.64), S.tick[k % 2], { visual: 'appear' });
  for (let k = 1; k <= 2; k++) P(`year${k}`, NT(44.5 + k * 0.6), S.heavy, { visual: 'appear' });
  // the map: the route's head reaches towers (every 0.3 s), the clean copy, the law's paper
  for (let k = 0; k < 5; k++) P(`route${k}`, NT(14.5 + k * 0.3), S.tick[k % 2]);
  for (let k = 0; k < 5; k++) P(`relay${k}`, NT(cu.relay + k * 0.32), S.tick[(k + 1) % 2]);
  P('clean', NT(cu.clean + 0.2), S.ding, { visual: 'appear' });
  P('law-paper', NT(cu.law), S.page[2], { visual: 'appear' });
  // money and the post: coins, the parcel's bell, hooves, the bribe
  P('coins-rich', NT(cu.rich), S.coin); P('coin-buy', NT(cu.buy), S.coin); P('coins-years', NT(44.7), S.coin); P('coin-bribe', NT(cu.bribe + 0.3), S.coin);
  P('parcel-bell', NT(cu.parcel + 2.0), S.bell);
  P('hooves-map', NT(22.3), S.hoovesA, { align: 'start' }); P('hooves-plaza', NT(42.6), S.hoovesB, { align: 'start' });
  // the court: the second gavel at the verdict
  P('gavel2', NT(cu.jury + 0.9), S.thud, { visual: 'appear' });
  out.forEach((c) => { if (c.lift == null) c.lift = c.weight === 'hero' ? 8 : 6.5; });
  return out.sort((a, b) => a.t - b.t);
}
window.soundCues = soundCues;
