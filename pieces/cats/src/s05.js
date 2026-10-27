// =====================================================================
//  s05 — lines 096–119 · the cats saw: Boss, the deal, the yowl across the city.
//  The alley at 3 a.m. (SET_alley) for 098–103 and 106–110; a sober snow insert for 104–105; the yowl spreads over
//  SET_roofs, a street and the city map (40 → 100 → HUNDREDS); Duchess on a balcony, Noodle on a sill; the trail goes cold.
//  Boss is the star: low angles, the moon behind his head, one eye.
// =====================================================================
// ---- timing helpers (voice only) ----------------------------------------------------------------
const s05_u = (lt, a, d) => EZ.o3(clamp((lt - a) / Math.max(1e-3, d)));       // a gesture ramp: fast, hard stop
const s05_io = (lt, a, d) => EZ.io(clamp((lt - a) / Math.max(1e-3, d)));      // a camera ramp over a shot
const s05_fr = (n) => n / FPS;
const s05_mix = (a, b, u) => ivPoseMix(typeof a === 'string' ? ivPose(a) : a, typeof b === 'string' ? ivPose(b) : b, u);
const s05_len = (S) => (S.t1 || S.t0 + 2) - S.t0;                             // the shot's length (main.js fills t1)
const s05_P = ext_proj(960, 260);                                            // the alley's projection
const s05_KAI = 520;                                                         // Kai's height at d = 1
const s05_moodMoon = { rim: '#dfe8ff', key: [-0.25, -0.95], tint: 'rgba(15,25,60,0.16)', haze: '#1e2746', vig: 0.7 };
const s05_moodSnow = { rim: '#dfe6f2', key: [0.55, -0.7], tint: 'rgba(30,40,70,0.16)', haze: '#2a3448', vig: 0.86 };

// ---- people and cats ------------------------------------------------------------------------------
function s05_kai(x, o = {}) {
  const h = o.h ?? s05_KAI, y = o.y ?? GROUND;
  if (o.shadow !== false) ivCastShadow(x, y, h, { len: 1.1, a: 0.32 });
  return ivMan({ who: CAST.kai, x, y, h, f: o.f ?? 0.5, pose: o.pose || ivPose('relaxed'), expr: o.expr || {}, talk: o.talk, hands: o.hands, grip: o.grip, blinkKey: o.bk || '', noBlink: o.noBlink });
}
// a cat with its cast shadow (s = sitting height; shadow length scales with it)
function s05_cat(x, y, s, coat, o = {}) {
  if (o.shadow !== false) ivCastShadow(x, y, s * 0.9, { len: 0.9, a: 0.3, w: 0.5 });
  return ivCat({ x, y, s, f: o.f ?? 1, coat, pose: o.pose || 'sit', expr: o.expr || {}, talk: o.talk, look: o.look, rot: o.rot, phase: o.phase });
}
const s05_BOSS = { ...CATS.boss };
// Boss's good eye on screen, for a sitting Boss drawn with ivCat (x, y, s, f)
const s05_bossEye = (x, y, s, f = -1) => [x + (f < 0 ? -1 : 1) * (16 + 19 * 0.6) * s / 100, y + (-70 - 19 * 0.08) * s / 100, 19 * s / 100];

// ---- the alley with our people ------------------------------------------------------------------------
// o.kai {x, f, pose, expr, talk} | null · o.boss {x, y, s, f, pose, expr, talk, look} | null (default: his wall spot)
// o.cats (40), o.yowl, o.extra() on d = 1 after the actors, o.fg
function s05_alley(o = {}) {
  const B = SET_POS2.alley.boss;
  return SET_alley({ cats: o.cats ?? 40, yowl: o.yowl ?? 0, garage: o.garage, fg: o.fg, mood: o.mood, act: () => {
    if (o.boss !== null) { const b = { x: B[0], y: B[1], s: B[2], f: -1, ...(o.boss || {}) };
      ivCastShadow(b.x, b.y, b.s * 0.7, { len: 0.6, a: 0.35, w: 0.5 });
      ivCat({ x: b.x, y: b.y, s: b.s, f: b.f, coat: s05_BOSS, pose: b.pose || 'sit', expr: b.expr || { eyes: 'half' }, talk: b.talk, look: b.look, rot: b.rot }); }
    o.under && o.under();
    if (o.kai !== null) { const k = { x: 520, f: 0.5, ...(o.kai || {}) }; s05_kai(k.x, k); }
    o.extra && o.extra();
  } });
}

// ---- seen from behind (for over-the-shoulder and cats'-POV shots) -------------------------------------------
// a sitting cat from behind; (x, y) ground, s sitting height; o.turn -1..1 head turn, o.nod head dip (px·S), o.notch
function s05_catBack(x, y, s, coat, o = {}) {
  const S = s / 100, c = coat.col, c2 = coat.col2 || ivShade(c, -0.2), hx = (o.turn || 0) * 9 * S, hy = -80 * S + (o.nod || 0) * S;
  const ox = (IV_M.key[0] || 0) * 9, oy = (IV_M.key[1] || 0) * 9, tw = o.tail ?? Math.sin(TT * 1.3 + x) * 0.25;
  const shape = (col, dx, dy, grow) => {
    ctx.save(); ctx.translate(x + dx, y + dy);
    ctx.beginPath(); ctx.moveTo(26 * S, -6 * S); ctx.quadraticCurveTo(70 * S, 2 * S, (78 + tw * 20) * S, -22 * S); ctx.lineWidth = 15 * S + grow * 2; ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, -16 * S, 42 * S + grow, 18 * S + grow, 0, 0, TAU); ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -38 * S, 33 * S + grow, 34 * S + grow, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hx * 0.4, -62 * S, 22 * S + grow, 14 * S + grow, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(hx, hy, 25 * S + grow, 0, TAU); ctx.fill();
    for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(hx + sg * 24 * S, hy - 4 * S); ctx.lineTo(hx + sg * 19 * S, hy - 40 * S - grow); ctx.lineTo(hx + sg * 3 * S, hy - 20 * S); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  };
  shape(IV_M.rim, ox, oy, 1.5); shape(ivShade(c, -0.28), 0, 0, 0);
  ctx.save(); ctx.translate(x, y);
  if (coat.pattern === 'tabby') for (let i = 0; i < 4; i++) { const yy = (-22 - i * 12) * S; ctx.beginPath(); ctx.ellipse(0, yy, 22 * S, 7 * S, 0, 0.15 * Math.PI, 0.85 * Math.PI); ctx.strokeStyle = c2; ctx.lineWidth = 5 * S; ctx.stroke(); }
  if (coat.pattern === 'tux') { ctx.beginPath(); ctx.ellipse(18 * S, -12 * S, 14 * S, 8 * S, 0, 0, TAU); ctx.fillStyle = '#f2efe8'; ctx.fill(); }
  const g = ctx.createRadialGradient(-20 * S, -60 * S, 4 * S, 10 * S, -30 * S, 80 * S); g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.beginPath(); ctx.ellipse(0, -38 * S, 33 * S, 34 * S, 0, 0, TAU); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.arc(hx, hy, 25 * S, 0, TAU); ctx.fill();
  for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(hx + sg * 20 * S, hy - 8 * S); ctx.lineTo(hx + sg * 18 * S, hy - 32 * S); ctx.lineTo(hx + sg * 8 * S, hy - 19 * S); ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill(); }
  if (o.notch) { ctx.beginPath(); ctx.moveTo(hx - 22 * S, hy - 30 * S); ctx.lineTo(hx - 13 * S, hy - 27 * S); ctx.lineTo(hx - 20 * S, hy - 22 * S); ctx.closePath(); ctx.fillStyle = IV_M.haze; ctx.fill(); }
  ctx.restore();
}
// Kai from behind (hood up on the back of the head, arms hanging); (x, y) feet, h height
function s05_kaiBack(x, y, h, o = {}) {
  const ox = (IV_M.key[0] || 0) * 10, oy = (IV_M.key[1] || 0) * 10, up = o.up ?? 0, C = CAST.kai;
  const fig = (rim) => {
    const ink = rim ? IV_M.rim : IV.ink, col = rim ? IV_M.rim : C.col, col2 = rim ? IV_M.rim : C.col2, g = rim ? 6 : 0, dx = rim ? ox : 0, dy = rim ? oy : 0;
    ctx.save(); ctx.translate(x + dx, y + dy);
    for (const sg of [-1, 1]) ivLine(sg * 0.05 * h, -0.46 * h, sg * 0.075 * h, -0.01 * h, 0.05 * h + g, ink);
    for (const sg of [-1, 1]) { ivLine(sg * 0.13 * h, -0.73 * h, sg * 0.16 * h, -0.5 * h, 0.065 * h + g, col); ivDot(sg * 0.162 * h, -0.47 * h, 0.034 * h + g / 2, ink); }
    ivRR(-0.14 * h - g / 2, -0.79 * h - g / 2, 0.28 * h + g, 0.36 * h + g, 0.06 * h, col);
    ivDot(0, (-0.885 + up * 0.012) * h, 0.1 * h + g / 2, ink);
    ctx.beginPath(); ctx.ellipse(0, -0.79 * h, 0.11 * h + g / 2, 0.05 * h + g / 2, 0, 0, TAU); ctx.fillStyle = col2; ctx.fill();
    ctx.restore();
  };
  fig(true); fig(false);
  ctx.save(); ctx.translate(x, y); const gr = ctx.createLinearGradient(-0.14 * h, 0, 0.14 * h, 0); gr.addColorStop(0, 'rgba(255,255,255,0.08)'); gr.addColorStop(1, 'rgba(0,0,0,0.35)');
  ivRR(-0.14 * h, -0.79 * h, 0.28 * h, 0.36 * h, 0.06 * h, gr); ivLine(0, -0.74 * h, 0, -0.45 * h, 2, 'rgba(0,0,0,0.25)'); ctx.restore();
}

// ---- the alley from other angles (SET_alley only looks one way) ----------------------------------------------
// shared bits: brick lines on a face mapper, a bulb with flicker
function s05_bricks(m, rows, cols, a = 0.2) {
  for (let j = 1; j < rows; j++) { ivLine(...m(0, j / rows), ...m(1, j / rows), 1.4, `rgba(0,0,0,${a})`, 'butt');
    for (let i = 0; i < cols; i++) { const u = (i + (j % 2) * 0.5) / cols; if (u < 1) ivLine(...m(u, (j - 1) / rows), ...m(u, j / rows), 1.2, `rgba(0,0,0,${a * 0.8})`, 'butt'); } }
}
function s05_bulb(q, pool) {
  const fl = Math.sin(TT * 23) > 0.9 || Math.sin(TT * 3.1) > 0.995 ? 0.3 : 1;
  ivDot(q[0], q[1], 11, `rgba(255,214,140,${fl})`); ivGlow(q[0], q[1], 300, 'rgba(255,200,120,0.5)', fl);
  if (pool) ivLightPool(pool, `rgba(255,190,110,${0.13 * fl})`);
  for (let i = 0; i < 3; i++) { const a = TT * (3 + i) + i * 2; ivDot(q[0] + Math.cos(a) * (30 + i * 8), q[1] + Math.sin(a * 1.3) * 20, 2.5, 'rgba(240,230,210,0.8)'); }
}
const s05_wcoat = (i) => ({ ...CATS.alley[i % CATS.alley.length], key: 's05w' + i });

// A — REVERSE / HIGH: from the top of the wall (the cats' seat) down the alley to its entrance and the lit street.
// o.kai {X, D, f, pose, expr, talk, crate} · o.fgCats [[x, s, i, turn]] backs on the coping (d 0.7) · o.bossBack {x, s, turn, talk}
// o.coping (default true) · o.extra()
const s05_PA = ext_proj(960, 230);
function s05_rev(o = {}) {
  IV_M = IV_MOOD.extAlley; const P = s05_PA, De = 4.6;
  return [
    { d: 4, draw: () => { ctx.fillStyle = ivVGrad(-600, 400, ['#04060d', '#121a36']); ctx.fillRect(-1500, -900, 5000, 2600); } },
    { d: 1, draw: () => {
      // the street beyond the entrance: lamp-lit pavement, a facade with lit windows, a lamp post
      ivPoly([P(-3000, 0, De), P(3000, 0, De), P(3000, 0, 7.2), P(-3000, 0, 7.2)], '#3a3036');
      ivGlow(...P(250, 0, 5.6), 380, 'rgba(255,170,90,0.45)');
      const fc = ext_box(P, -3000, 3000, 0, 2400, 7.2, 7.5, { col: '#2a2232', edge: false });
      ext_windows(fc.F, 9, 6, { key: 's05aw', v0: 0.05, v1: 0.7, lit: 0.45, litCol: '#f2b866', glass: 'rgba(16,14,24,0.95)', sheen: false, shade: false, mu: 0.3, mv: 0.3 });
      ext_q(fc.F, 0.45, 0.58, 0, 0.12, '#0e0c12'); ext_q(fc.F, 0.42, 0.61, 0.12, 0.15, '#b8463c');
      const lp = P(260, 0, 5.4), lt = P(260, 640, 5.4); ivLine(lp[0], lp[1], lt[0], lt[1], 5, '#0c0d16'); ivDot(lt[0], lt[1], 7, '#ffd9a0'); ivGlow(lt[0], lt[1], 160, 'rgba(255,190,110,0.6)');
      const cx = mod(TT * 0.35, 1.6); if (cx < 1) { const c = P(lerp(-1900, 1900, cx), 60, 6.3); ivGlow(c[0], c[1], 120, 'rgba(255,240,200,0.35)'); ivRR(c[0] - 60, c[1] - 26, 120, 34, 10, '#15161f'); }
      // the alley floor (wet cobbles) and its walls: the garage on the left, the market's back on the right
      ivPoly([P(-800, 0, 0.3), P(800, 0, 0.3), P(800, 0, De), P(-800, 0, De)], '#181d2e');
      for (let D = 0.6; D < De; D *= 1.09) ivLine(...P(-800, 0, D), ...P(800, 0, D), 2.2 / D, 'rgba(150,170,255,0.07)', 'butt');
      for (let X = -800; X <= 800; X += 160) ivLine(...P(X, 0, 0.3), ...P(X, 0, De), 1.5, 'rgba(0,0,0,0.25)', 'butt');
      ivPoly([P(-40, 0, 0.3), P(40, 0, 0.3), P(40, 0, De), P(-40, 0, De)], 'rgba(0,0,0,0.3)');
      ivLightPool([P(-800, 0, 0.7), P(800, 0, 0.7), P(800, 0, 2.2), P(-800, 0, 2.2)], 'rgba(120,140,220,0.06)');
      const lw = ext_box(P, -2600, -800, 0, 1900, 0.3, De, { col: '#232a42', side: '#262e48', edge: false });
      const rw = ext_box(P, 800, 2600, 0, 1900, 0.3, De, { col: '#1c2236', side: '#20273e', edge: false });
      for (const m of [lw.S, rw.S]) for (let j = 1; j < 22; j++) ivLine(...m(0, j / 22), ...m(1, j / 22), 1.2, 'rgba(0,0,0,0.2)', 'butt');
      ivAO(...lw.S(0, 0), ...lw.S(1, 0), 40, 0.45); ivAO(...rw.S(1, 0), ...rw.S(0, 0), 40, 0.45);
      // garage door (left), a light line under it
      ext_q(lw.S, 0.3, 0.5, 0, 0.18, '#4a4a56'); for (let j = 1; j < 9; j++) ivLine(...lw.S(0.3, j * 0.02), ...lw.S(0.5, j * 0.02), 2, 'rgba(0,0,0,0.3)', 'butt');
      ext_q(lw.S, 0.3, 0.5, 0, 0.006, 'rgba(255,190,110,0.6)'); ivLightPool([lw.S(0.3, 0), lw.S(0.5, 0), P(-500, 0, lerp(0.3, De, 0.5)), P(-560, 0, lerp(0.3, De, 0.3))], 'rgba(255,180,100,0.10)');
      // the market (right): back door, bulb, fire escape, a vent with steam
      ext_q(rw.S, 0.36, 0.44, 0, 0.12, '#3a2f2a', '#14100e', 3);
      s05_bulb(rw.S(0.4, 0.15), [P(800, 0, lerp(0.3, De, 0.3)), P(800, 0, lerp(0.3, De, 0.5)), P(300, 0, lerp(0.3, De, 0.5)), P(380, 0, lerp(0.3, De, 0.3))]);
      for (let k = 0; k < 3; k++) { const v0 = 0.3 + k * 0.18; ext_q(rw.S, 0.2, 0.34, v0, v0 + 0.012, '#0e111e'); for (let i = 0; i <= 5; i++) ivLine(...rw.S(0.2 + i * 0.028, v0), ...rw.S(0.2 + i * 0.028, v0 + 0.06), 2, '#0e111e'); }
      for (let i = 0; i < 5; i++) { const u = mod(TT * 0.3 + i / 5, 1), v = rw.S(0.62, 0.22); ext_puff(v[0] - 30 * u, v[1] - u * 160, 24 + u * 50, '200,212,255', 0.14 * Math.sin(Math.PI * u)); }
      // the dumpster (left), crates (right), the puddle with the moon
      const dp = ext_box(P, -780, -460, 0, 330, 1.9, 2.35, { col: '#3e5a46', top: '#567a60', side: '#2c4232' }); ivAO(...dp.F(0, 0), ...dp.F(1, 0), 16, 0.5);
      ext_box(P, 520, 780, 0, 240, 2.6, 2.9, { col: '#6a5034', top: '#8a6a48', side: '#4e3a26' }); ext_box(P, 560, 760, 240, 420, 2.65, 2.9, { col: '#735638', top: '#93714c', side: '#553f28' });
      const pq = P(220, 0, 1.25); ctx.save(); ctx.beginPath(); ctx.ellipse(pq[0], pq[1], 200, 46, 0, 0, TAU); ctx.fillStyle = 'rgba(110,130,200,0.3)'; ctx.fill(); ctx.clip(); ivDot(pq[0] + 40, pq[1] - 4, 22, 'rgba(240,244,255,0.5)'); ctx.restore();
      const du = mod(TT * 0.8, 1); ctx.save(); ctx.globalAlpha = 1 - du; ctx.beginPath(); ctx.ellipse(pq[0] + 40, pq[1] - 4, 10 + du * 70, (10 + du * 70) * 0.22, 0, 0, TAU); ctx.strokeStyle = 'rgba(200,215,255,0.6)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      // Kai
      if (o.kai) { const k = o.kai, q = P(k.X, 0, k.D), h = s05_KAI / k.D;
        if (k.crate) { const kk = h / s05_KAI; ivCastShadow(q[0], q[1], h * 0.6, { len: 1.2, a: 0.35 }); ivBox(q[0] - 110 * kk, q[1] - 0.3 * h, 190 * kk, 0.3 * h, 0.1, P.vp, { front: '#6a5034', top: '#8a6a48', side: '#4e3a26' }); }
        else ivCastShadow(q[0], q[1], h, { len: 1.1, a: 0.32 });
        ivMan({ who: CAST.kai, x: q[0], y: q[1] - (k.crate ? 0.01 * h : 0), h, f: k.f ?? 0.3, pose: k.pose || ivPose('relaxed'), expr: k.expr || {}, talk: k.talk, blinkKey: 's05a' }); }
      o.extra && o.extra(P);
    } },
    { d: 0.72, draw: () => {
      // the coping of our wall along the bottom of the frame; cats seen from behind sit on it
      if (o.coping === false) return;
      ivPoly([[-600, 1010], [2600, 990], [2600, 1500], [-600, 1500]], '#2c3250'); ivPoly([[-600, 985], [2600, 965], [2600, 995], [-600, 1015]], '#4a5274');
      ivLine(-600, 985, 2600, 965, 3, 'rgba(200,215,255,0.5)');
      for (const [x, s, i, turn] of o.fgCats || []) s05_catBack(x, 992 - (x + 600) * 20 / 3200, s, s05_wcoat(i), { turn });
      if (o.bossBack) { const b = o.bossBack, tk = b.talk ? ivTalk(b.talk) : 0; s05_catBack(b.x, 1000, b.s, s05_BOSS, { turn: b.turn ?? -0.6, nod: 6 * tk - 4, notch: true, tail: 0.2 }); }
    } },
  ];
}

// B — PROFILE along the wall at Kai's height: the wall runs away to the right, the cats on its coping recede.
// o.cats (0–30), o.yowl, o.boss {X, Y, D, s, f, pose, expr, talk, look, rot} | null, o.kai {X, D, f, pose, expr, talk} | null, o.crate, o.extra(P)
const s05_PB = ext_proj(1560, 470);
const s05_BSLOTS = (() => { const r = RNG('s05bs').f, a = []; let D = 0.9;
  while (D < 8.5) { if (D < 1.5 || D > 2.05) a.push([-1000 - r() * 120, D, 150 + r() * 34, r()]); D *= 1.075 + r() * 0.04; }
  return a; })();
function s05_side(o = {}) {
  IV_M = IV_MOOD.extAlley; const P = s05_PB, n = Math.min(o.cats ?? 30, s05_BSLOTS.length), yw = clamp(o.yowl ?? 0);
  return [
    { d: 4.5, draw: () => { ext_sky(['#04060d', '#0e1430', '#243058'], -700, 700); ext_stars('s05bst', 150, [-900, -500, 2900, 420]); ext_moon(430, 110, 72); ext_clouds('s05bcl', 5, -80, 220, 'rgba(40,50,90,0.6)', 7); } },
    { d: 2.6, draw: () => { const r = RNG('s05bfar').f;
      for (let i = 0; i < 13; i++) { const x = -900 + i * 300 + r() * 80, top = 200 + r() * 230; ivRR(x, top, 280, 900, 0, ['#11152a', '#141a30', '#0f1326'][i % 3]);
        if (r() < 0.5) { ivLine(x + 140, top, x + 140, top - 120, 4, '#11152a'); ivLine(x + 100, top - 90, x + 180, top - 90, 3, '#11152a'); }
        for (let j = 0; j < 4; j++) for (let k = 0; k < 2; k++) if (r() < 0.3) ivRR(x + 50 + k * 110, top + 50 + j * 100, 40, 54, 3, '#e8a85a'); } } },
    { d: 1, draw: () => {
      ivPoly([P(-1000, 0, 0.45), P(700, 0, 0.45), P(700, 0, 9), P(-1000, 0, 9)], '#171c2e');
      for (let D = 0.55; D < 9; D *= 1.1) ivLine(...P(-1000, 0, D), ...P(700, 0, D), 2.2 / D, 'rgba(150,170,255,0.07)', 'butt');
      for (let X = -900; X <= 700; X += 200) ivLine(...P(X, 0, 0.45), ...P(X, 0, 9), 1.5, 'rgba(0,0,0,0.25)', 'butt');
      // the far end: the street glows orange between the walls
      ivPoly([P(-1000, 0, 9), P(700, 0, 9), P(700, 1500, 9), P(-1000, 1500, 9)], '#2a2432'); ivGlow(...P(-100, 200, 9), 220, 'rgba(255,180,100,0.55)');
      // the garage side (right): roll-up door with light under it, a bulb, the dumpster
      const rw = ext_box(P, 700, 2600, 0, 1800, 0.45, 9, { col: '#232a42', side: '#262e48', edge: false });
      for (let j = 1; j < 20; j++) ivLine(...rw.S(0, j / 20), ...rw.S(1, j / 20), 1.2, 'rgba(0,0,0,0.2)', 'butt');
      ext_q(rw.S, 0.12, 0.3, 0, 0.17, '#4a4a56'); for (let j = 1; j < 9; j++) ivLine(...rw.S(0.12, j * 0.019), ...rw.S(0.3, j * 0.019), 2, 'rgba(0,0,0,0.3)', 'butt'); ext_q(rw.S, 0.12, 0.3, 0, 0.006, 'rgba(255,190,110,0.6)');
      s05_bulb(rw.S(0.36, 0.17), [P(700, 0, 3.0), P(700, 0, 5.0), P(200, 0, 5.0), P(200, 0, 3.0)]);
      ivAO(...rw.S(1, 0), ...rw.S(0, 0), 40, 0.45);
      const dp = ext_box(P, 360, 700, 0, 340, 2.2, 2.9, { col: '#3e5a46', top: '#567a60', side: '#2c4232' }); ivAO(...dp.F(0, 0), ...dp.F(1, 0), 16, 0.5);
      // the wall (left): its long face, bricks, a faded BOSS tag, the coping; a drain pipe
      const w = ext_box(P, -2600, -1000, 0, 520, 0.4, 9, { col: '#2a2f46', side: '#30364f', edge: false });
      const sm = (u, v) => w.S(Math.pow(u, 2.2), v); s05_bricks(sm, 9, 40, 0.22);
      ext_q(w.S, 0.17, 0.23, 0.32, 0.62, 'rgba(200,80,90,0.22)');
      ext_box(P, -2600, -975, 520, 548, 0.38, 9, { col: '#3a4060', side: '#4a5274', under: '#22263a', edge: false });
      ivLine(...P(-975, 520, 0.38), ...P(-975, 520, 9), 2.5, 'rgba(200,215,255,0.45)');
      ivAO(...w.S(0, 0), ...w.S(1, 0), 40, 0.5);
      const pp = w.S(0.09, 0); ivLine(pp[0], pp[1], ...w.S(0.09, 0.98), 9, '#1a1e30'); ivDot(pp[0] + 8, pp[1] + 10 + mod(TT * 70, 50), 3, 'rgba(180,200,255,0.7)');
      if (o.crate) { const c = o.crate, cb = ext_box(P, c[0], c[1], 0, c[2], c[3], c[4], { col: '#6a5034', top: '#8a6a48', side: '#4e3a26' }); ivAO(...cb.F(0, 0), ...cb.F(1, 0), 14, 0.5); }
      const pq = P(-400, 0, 2.4); ctx.save(); ctx.beginPath(); ctx.ellipse(pq[0], pq[1], 150, 24, 0, 0, TAU); ctx.fillStyle = 'rgba(110,130,200,0.3)'; ctx.fill(); ctx.clip(); ivDot(pq[0] - 50, pq[1] - 4, 16, 'rgba(240,244,255,0.5)'); ctx.restore();
      // the cats on the coping, far to near; the yowl spreads from the near end
      const shown = s05_BSLOTS.slice(0, n).map((s, i) => ({ s, i })).sort((a, b) => b.s[1] - a.s[1]);
      for (const { s, i } of shown) { const q = P(s[0], 548, s[1]), r = hash('s05bc', i) % 10;
        ivCat({ x: q[0], y: q[1], s: s[2] / s[1], f: 1, coat: s05_wcoat(i), pose: i < yw * n ? 'yowl' : r < 3 ? 'loaf' : 'sit', expr: { eyes: r < 4 ? 'angry' : r < 6 ? 'half' : 'open' }, look: [0.5, 0.7] }); }
      if (o.boss !== null) { const b = { X: -1010, Y: 548, D: 1.75, f: 1, ...(o.boss || {}) }, q = P(b.X, b.Y, b.D);
        ivCat({ x: q[0], y: q[1], s: b.s ?? 400 / b.D, f: b.f, coat: s05_BOSS, pose: b.pose || 'sit', expr: b.expr || { eyes: 'half' }, talk: b.talk, look: b.look || [0.6, 0.7], rot: b.rot }); }
      if (o.kai) { const k = o.kai, q = P(k.X, 0, k.D), h = s05_KAI / k.D; s05_kai(q[0], { ...k, y: q[1], h, f: k.f ?? -0.45 }); }
      o.extra && o.extra(P);
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ivLine(-300, -160, 2600, 40, 9, '#06070c'); ivRR(2050, -200, 120, 1600, 20, '#0a0c14'); } }]),
  ];
}

// D — LOW and frontal: the camera near the ground looks up at the whole wall against the sky; the moon behind Boss.
// o.cats (0–40), o.yowl, o.boss {…} | null (centre of the coping), o.kaiBack {x, y, h, up} (fg silhouette), o.kai {X, D, …}, o.stand (cats get up), o.extra(P)
const s05_PD = ext_proj(960, 760);
const s05_DSLOTS = (() => { const r = RNG('s05ds').f, a = [];
  for (let i = 0; i < 24; i++) { const X = lerp(-840, 840, (i + 0.5) / 24); if (Math.abs(X) < 150) continue; a.push([X + (r() - 0.5) * 24, 1.31, 150 + r() * 30]); }
  for (let i = 0; i < 22; i++) { const X = lerp(-860, 860, (i + 1) / 23); if (Math.abs(X) < 130) continue; a.push([X + (r() - 0.5) * 30, 1.4, 140 + r() * 30]); }
  return a.map((s, i) => ({ s, k: mod(i * 0.6180339 + (i >= 22 ? 0.31 : 0), 1) })).sort((a, b) => a.k - b.k).map((o) => o.s); })();
function s05_low(o = {}) {
  IV_M = IV_MOOD.extAlley; const P = s05_PD, n = Math.min(o.cats ?? 40, s05_DSLOTS.length), yw = clamp(o.yowl ?? 0), mn = o.moon || [960, 210];
  return [
    { d: 4.5, draw: () => { ext_sky(['#03050c', '#0e1430', '#26325c'], -700, 700); ext_stars('s05dst', 170, [-900, -500, 2900, 500]);
      ivGlow(mn[0], mn[1], 820, 'rgba(150,175,255,0.25)'); ext_moon(mn[0], mn[1], 120); ext_clouds('s05dcl', 5, -60, 300, 'rgba(40,50,90,0.55)', 7); } },
    { d: 2.6, draw: () => { const r = RNG('s05dfar').f;
      for (let i = 0; i < 13; i++) { const x = -900 + i * 300 + r() * 80, top = 260 + r() * 200; if (Math.abs(x + 140 - 960) < 260) continue; ivRR(x, top, 280, 900, 0, ['#11152a', '#141a30', '#0f1326'][i % 3]);
        if (r() < 0.6) { const ax = x + 60 + r() * 160; ivLine(ax, top, ax, top - 170, 4, '#11152a'); ivLine(ax - 40, top - 120, ax + 40, top - 120, 3, '#11152a'); if (Math.sin(TT * 3 + i) > 0) ivDot(ax, top - 170, 4, '#ff4a3a'); }
        for (let j = 0; j < 4; j++) for (let k = 0; k < 2; k++) if (r() < 0.3) ivRR(x + 50 + k * 110, top + 50 + j * 100, 40, 54, 3, '#e8a85a'); } } },
    { d: 1, draw: () => {
      ivPoly([P(-900, 0, 0.35), P(900, 0, 0.35), P(900, 0, 1.3), P(-900, 0, 1.3)], '#151a2a');
      for (let D = 0.4; D < 1.3; D += 0.06) ivLine(...P(-900, 0, D), ...P(900, 0, D), 2 / D, 'rgba(150,170,255,0.08)', 'butt');
      for (let X = -900; X <= 900; X += 180) ivLine(...P(X, 0, 0.35), ...P(X, 0, 1.3), 1.5, 'rgba(0,0,0,0.25)', 'butt');
      ctx.save(); ctx.beginPath(); ctx.ellipse(1060, 1010, 360, 50, 0, 0, TAU); ctx.fillStyle = 'rgba(110,130,200,0.3)'; ctx.fill(); ctx.clip(); ivDot(1000, 1004, 40, 'rgba(240,244,255,0.55)'); ctx.restore();
      const lw = ext_box(P, -2600, -900, 0, 1900, 0.35, 1.3, { col: '#1c2236', side: '#20273e', edge: false });
      const rw = ext_box(P, 900, 2600, 0, 1800, 0.35, 1.3, { col: '#232a42', side: '#262e48', edge: false });
      for (const m of [lw.S, rw.S]) for (let j = 1; j < 24; j++) ivLine(...m(0, j / 24), ...m(1, j / 24), 1.2, 'rgba(0,0,0,0.2)', 'butt');
      ext_windows(lw.S, 3, 4, { key: 's05dlw', v0: 0.35, v1: 0.95, lit: 0.35, litCol: '#e8a85a', glass: 'rgba(14,18,32,0.9)', sheen: false, shade: false, mu: 0.3, mv: 0.3 });
      for (let k = 0; k < 3; k++) { const v0 = 0.3 + k * 0.2; ext_q(lw.S, 0.55, 0.95, v0, v0 + 0.012, '#0e111e'); for (let i = 0; i <= 6; i++) ivLine(...lw.S(0.55 + i * 0.066, v0), ...lw.S(0.55 + i * 0.066, v0 + 0.05), 2, '#0e111e'); }
      s05_bulb(lw.S(0.75, 0.16), null);
      ext_q(rw.S, 0.6, 0.95, 0, 0.28, '#4a4a56'); for (let j = 1; j < 9; j++) ivLine(...rw.S(0.6, j * 0.03), ...rw.S(0.95, j * 0.03), 2, 'rgba(0,0,0,0.3)', 'butt'); ext_q(rw.S, 0.6, 0.95, 0, 0.01, 'rgba(255,190,110,0.6)');
      // the end wall: bricks, the BOSS tag, the coping; the cats along its edge against the sky
      const ew = ext_box(P, -900, 900, 0, 520, 1.3, 1.55, { col: '#2a2f46', edge: false });
      s05_bricks(ew.F, 9, 12, 0.22); ext_q(ew.F, 0.12, 0.3, 0.3, 0.6, 'rgba(200,80,90,0.25)'); ivText('BOSS', ...ew.F(0.21, 0.42), 30, 'rgba(240,200,200,0.35)');
      const gr = ctx.createLinearGradient(0, ew.F(0, 1)[1], 0, ew.F(0, 0)[1]); gr.addColorStop(0, 'rgba(160,180,255,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0.25)'); ivPoly([ew.F(0, 0), ew.F(1, 0), ew.F(1, 1), ew.F(0, 1)], gr);
      ivAO(...ew.F(0, 0), ...ew.F(1, 0), 30, 0.45); ivAO(...lw.S(1, 0), ...lw.S(1, 0.3), 30, 0.3); ivAO(...rw.S(1, 0.3), ...rw.S(1, 0), 30, 0.3);
      const shown = s05_DSLOTS.slice(0, n).map((s, i) => ({ s, i })).sort((a, b) => b.s[1] - a.s[1]);
      const cats = (row) => { for (const { s, i } of shown) { if ((s[1] > 1.35) !== row) continue; const q = P(s[0], 548, s[1]), far = Math.abs(s[0]) / 860, r = hash('s05dc', i) % 10;
        ivCat({ x: q[0], y: q[1], s: s[2] / s[1], f: s[0] < 0 ? 1 : -1, coat: s05_wcoat(i), pose: far < yw ? 'yowl' : o.stand && r < 7 ? 'stand' : r < 3 ? 'loaf' : 'sit', expr: { eyes: r < 4 ? 'angry' : r < 6 ? 'half' : 'open' }, look: [s[0] < 0 ? 0.3 : -0.3, 0.8] }); } };
      cats(true);
      ext_box(P, -920, 920, 520, 548, 1.28, 1.57, { col: '#3a4060', under: '#22263a', edge: false }); ivLine(...P(-920, 520, 1.28), ...P(920, 520, 1.28), 2.5, 'rgba(200,215,255,0.5)');
      cats(false);
      if (o.boss !== null) { const b = { X: 0, Y: 548, D: 1.3, f: -1, ...(o.boss || {}) }, q = P(b.X, b.Y, b.D);
        ivCat({ x: q[0], y: q[1], s: b.s ?? 340 / b.D, f: b.f, coat: s05_BOSS, pose: b.pose || 'sit', expr: b.expr || { eyes: 'half' }, talk: b.talk, look: b.look || [-0.2, 0.8], rot: b.rot }); }
      o.extra && o.extra(P);
      if (o.kai) { const k = o.kai, q = P(k.X, 0, k.D), h = s05_KAI / k.D; s05_kai(q[0], { ...k, y: q[1], h }); }
    } },
    ...(o.kaiBack ? [{ d: 0.8, draw: () => { const k = o.kaiBack; ivCastShadow(k.x, k.y, k.h, { len: 0.5, a: 0.35 }); s05_kaiBack(k.x, k.y, k.h, { up: k.up }); } }] : []),
  ];
}

// ---- Boss in close-up: a low angle, the moon right behind his head --------------------------------------
// o: x, y (his seat, on the wall coping), s, f, pose, expr, talk, look, sil (0..1 silhouette), eye (0..1 the good eye
// opening, for the silhouette), moon [x, y], rings (u 0..1 yowl rings), tilt (sky slides), extra()
function s05_bossCU(o = {}) {
  IV_M = s05_moodMoon;
  const x = o.x ?? 1000, y = o.y ?? 1010, s = o.s ?? 900, f = o.f ?? -1, mn = o.moon || [x + (f < 0 ? 40 : -40), 300];
  const coat = o.sil ? { ...s05_BOSS, col: '#0e1018', col2: '#0e1018', pattern: 'plain', key: 'bossSil' } : s05_BOSS;
  return [
    { d: 5, draw: () => {
      ctx.fillStyle = ivVGrad(-400, 1300, ['#03050c', '#0c1430', '#1d2850']); ctx.fillRect(-1500, -900, 5000, 3000);
      const r = RNG('s05st').f; for (let i = 0; i < 120; i++) ivDot(-800 + r() * 3600, -500 + r() * 1200, 0.8 + r() * 1.8, `rgba(230,236,255,${0.25 + 0.5 * r() * (0.6 + 0.4 * Math.sin(TT * 2 + i))})`);
      ivGlow(mn[0], mn[1], 900, 'rgba(150,175,255,0.30)'); ivGlow(mn[0], mn[1], 420, 'rgba(210,222,255,0.45)');
      ivDot(mn[0], mn[1], 210, '#e9eefa');
      ctx.save(); ctx.globalAlpha = 0.12; ivDot(mn[0] - 60, mn[1] - 40, 50, '#9aa6c8'); ivDot(mn[0] + 70, mn[1] + 50, 34, '#9aa6c8'); ivDot(mn[0] + 20, mn[1] - 100, 24, '#9aa6c8'); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.5; for (let i = 0; i < 3; i++) { const cx = mod(-600 + i * 900 + TT * 25, 3600) - 900; ctx.beginPath(); ctx.ellipse(cx, 120 + i * 140, 420, 46, 0, 0, TAU); ctx.fillStyle = 'rgba(30,40,80,0.8)'; ctx.fill(); } ctx.restore();
    } },
    { d: 2.6, draw: () => {
      const r = RNG('s05sky').f;
      for (let i = 0; i < 14; i++) { const bx = -900 + i * 290 + r() * 60, top = 760 + r() * 160, w = 230 + r() * 60;
        ivRR(bx, top, w, 900, 0, ['#0b0f22', '#0d1226', '#0a0d1e'][i % 3]);
        if (r() < 0.5) { ivLine(bx + w * 0.5, top, bx + w * 0.5, top - 140, 4, '#0b0f22'); ivLine(bx + w * 0.5 - 40, top - 100, bx + w * 0.5 + 40, top - 100, 3, '#0b0f22'); }
        for (let j = 0; j < 3; j++) for (let k = 0; k < 2; k++) if (r() < 0.35) ivRR(bx + 40 + k * 100, top + 50 + j * 90, 34, 44, 3, '#f2b866'); }
      ivRR(-1500, 1000, 5000, 600, 0, '#070914');
    } },
    { d: 1, draw: () => {
      // the coping slab of the wall he sits on, seen from below
      ivBox(-400, y, 2800, 300, 0.05, [960, 1400], { front: '#2a2f46', top: '#454b68', side: '#1c2032', line: 'rgba(200,215,255,0.55)' });
      ivAO(-400, y, 2400, y, 26, 0.5);
      if (o.rings != null) { const rc = o.pose === 'yowl' ? [x + (f < 0 ? -1 : 1) * 46 * s / 100, y - 54 * s / 100] : s05_bossEye(x, y, s, f); s05_rings(rc[0], rc[1], 1500, o.rings, { n: 6, w: 10, col: '#ffd9a0' }); }
      ivCat({ x, y, s, f, coat, pose: o.pose || 'sit', expr: o.sil ? { eyes: 'closed' } : (o.expr || { eyes: 'half' }), talk: o.talk, look: o.look, rot: o.rot });
      if (o.sil) { const [ex, ey, er] = s05_bossEye(x, y, s, f), op = clamp(o.eye ?? 0);
        if (op > 0) { ivGlow(ex, ey, er * 4, 'rgba(255,210,80,0.55)', op);
          ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, er * 0.27, er * 0.34 * op, 0, 0, TAU); ctx.fillStyle = '#ffd23a'; ctx.fill(); ctx.clip();
          ctx.beginPath(); ctx.ellipse(ex, ey, er * 0.06, er * 0.3, 0, 0, TAU); ctx.fillStyle = '#0d0907'; ctx.fill(); ctx.restore(); } }
      o.extra && o.extra();
    } },
  ];
}

// ---- eyes in the dark (pairs open one by one) -------------------------------------------------------------
function s05_eyePair(x, y, s, open, col, look = 0) {
  if (open <= 0.02) return;
  ivGlow(x, y, s * 2.4, col.replace('rgb', 'rgba').replace(')', ',0.35)'), open);
  for (const dx of [-s * 0.55, s * 0.55]) {
    ctx.beginPath(); ctx.ellipse(x + dx, y, s * 0.26, s * 0.3 * open, 0, 0, TAU); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip(); ctx.beginPath(); ctx.ellipse(x + dx + look * s * 0.08, y, s * 0.06, s * 0.3, 0, 0, TAU); ctx.fillStyle = '#05040a'; ctx.fill();
    ivDot(x + dx + s * 0.09, y - s * 0.12, s * 0.05, 'rgba(255,255,255,0.8)'); ctx.restore();
  }
}

// ---- hands and paws (the deal) ------------------------------------------------------------------------------
// a sleeve from (x0, y0) to the wrist (x, y) with a five-finger glove; w = sleeve width
function s05_arm(x0, y0, x, y, w, col, grip = 'open') {
  const ang = Math.atan2(y - y0, x - x0), h = w / IV_J.lw / 1.75;
  ivLine(x0 + 4, y0 - 4, x + 4, y - 4, w + 8, IV_M.rim);
  ivLine(x0, y0, x, y, IV_J.lw * h, IV.ink); ivLine(x0, y0, lerp(x0, x, 0.9), lerp(y0, y, 0.9), w, col);
  ivLine(lerp(x0, x, 0.84), lerp(y0, y, 0.84), lerp(x0, x, 0.9), lerp(y0, y, 0.9), w * 1.04, CAST.kai.col2, 'butt');
  ivHand(x, y, ang, h, 'glove', grip, () => IV_M.rim, (v) => v + 6, 1);
  ivHand(x, y, ang, h, 'glove', grip, (c) => c, (v) => v, 1);
}
// Boss's front leg and paw coming down from (x0, y0) to the paw at (x, y); s = paw width
function s05_paw(x0, y0, x, y, s) {
  const c = s05_BOSS.col, c2 = s05_BOSS.col2, lw = s * 0.62;
  ivLine(x0 + 5, y0 - 5, x + 5, y - 5, lw + 10, IV_M.rim); ivLine(x0, y0, x, y - s * 0.1, lw, c);
  for (let i = 1; i < 5; i++) { const u = i / 5.5, px = lerp(x0, x, u), py = lerp(y0, y, u); ivLine(px - lw * 0.42, py - 6, px + lw * 0.42, py + 6, 6, c2); }
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.56 + 5, s * 0.36 + 5, 0, 0, TAU); ctx.fillStyle = IV_M.rim; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.56, s * 0.36, 0, 0, TAU); ctx.fillStyle = c; ctx.fill();
  for (let i = 0; i < 4; i++) { const tx = (-0.36 + i * 0.24) * s; ctx.beginPath(); ctx.ellipse(tx, s * 0.22, s * 0.13, s * 0.11, 0, 0, TAU); ctx.fillStyle = ivShade(c, 0.12); ctx.fill(); ivLine(tx + s * 0.12, s * 0.12, tx + s * 0.12, s * 0.32, 3, c2); }
  const g = ctx.createRadialGradient(-s * 0.15, -s * 0.15, 4, 0, 0, s * 0.6); g.addColorStop(0, 'rgba(255,245,230,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.56, s * 0.36, 0, 0, TAU); ctx.fillStyle = g; ctx.fill();
  ctx.restore();
}

// ---- big numbers and tags -------------------------------------------------------------------------------
function s05_bigNum(str, x, y, size, a, o = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a); ctx.translate(x, y); const k = 0.7 + 0.3 * EZ.back(clamp(a)); ctx.scale(k, k);
  ivText(str, 0, 0, size, o.c || '#ffe2b0', { glow: o.glow || 'rgba(255,150,60,0.75)', shadow: 'rgba(0,0,0,0.45)', track: 4 });
  if (o.sub) ivText(o.sub, 0, size * 0.42, size * 0.24, 'rgba(255,236,214,0.85)', { track: 6, weight: 800 });
  ctx.restore();
}
// a screen-space tag (stays put while the camera moves)
function s05_tag(str, x, y, size, a, o) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ivTag(str, x, y, size, a, o); ctx.restore(); }

// ---- the eye macro (097): a green eye, the slit narrows; the street and a tiny yellow coat in the reflection ---------
function s05_eyeMacro(lt, slit, open) {
  IV_M = s05_moodMoon;
  ivStage([
    { d: 2.5, draw: () => {
      ctx.fillStyle = '#0d0c12'; ctx.fillRect(-1200, -800, 4400, 2800);
      const r = RNG('s05fur').f; ctx.lineCap = 'round';
      for (let i = 0; i < 420; i++) { const x = -400 + r() * 2700, y = -300 + r() * 1700, a = Math.atan2(y - 540, x - 960) + 0.4, L = 30 + r() * 60;
        ivLine(x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, 3 + r() * 4, r() < 0.5 ? '#1b1a22' : '#22212b'); }
      ivGlow(1300, 200, 900, 'rgba(120,150,255,0.14)');
    } },
    { d: 1, draw: () => {
      const cx = 960, cy = 560, w = 640, h = 330 * open;
      const almond = () => { ctx.beginPath(); ctx.moveTo(cx - w, cy); ctx.quadraticCurveTo(cx - w * 0.2, cy - h * 1.6, cx + w, cy - h * 0.15); ctx.quadraticCurveTo(cx + w * 0.1, cy + h * 1.5, cx - w, cy); ctx.closePath(); };
      ctx.save(); almond(); ctx.lineWidth = 34; ctx.strokeStyle = '#08070c'; ctx.stroke(); ctx.restore();
      ctx.save(); almond(); ctx.clip();
      let g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 520); g.addColorStop(0, '#d8ff8a'); g.addColorStop(0.35, '#7cf06a'); g.addColorStop(0.8, '#2f8a3a'); g.addColorStop(1, '#123a1a');
      ctx.fillStyle = g; ctx.fillRect(cx - w, cy - 500, w * 2, 1000);
      const r = RNG('s05iris').f; ctx.globalAlpha = 0.35; for (let i = 0; i < 90; i++) { const a = r() * TAU, r0 = 90 + r() * 60, r1 = 280 + r() * 200; ivLine(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, 2 + r() * 3, r() < 0.5 ? '#1f5a26' : '#e8ffb0'); } ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, slit, 330, 0, 0, TAU); ctx.fillStyle = '#040306'; ctx.fill();
      // the reflection: the curved street under a lamp, a tiny yellow coat and a red balloon
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.55;
      ctx.beginPath(); ctx.ellipse(cx + 170, cy - 120, 210, 120, -0.3, 0, TAU); ctx.fillStyle = 'rgba(150,175,230,0.35)'; ctx.fill();
      ivGlow(cx + 250, cy - 190, 90, 'rgba(255,214,150,0.9)'); ivLine(cx + 250, cy - 190, cx + 230, cy - 40, 4, 'rgba(200,210,240,0.7)');
      ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.85; ivRR(cx + 132, cy - 92, 22, 40, 8, '#f2c230'); ivDot(cx + 143, cy - 104, 11, '#2a2430'); ivLine(cx + 154, cy - 80, cx + 172, cy - 150, 1.5, '#ddd');
      ivDot(cx + 174, cy - 162, 14, '#e5352b'); ctx.restore();
      ivDot(cx - 150, cy - 140, 46, 'rgba(255,255,255,0.85)'); ivDot(cx - 90, cy - 90, 14, 'rgba(255,255,255,0.7)');
      g = ctx.createLinearGradient(0, cy - h * 1.2, 0, cy); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(cx - w, cy - 600, w * 2, 600);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.6; ctx.strokeStyle = IV_M.rim; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - w, cy); ctx.quadraticCurveTo(cx - w * 0.2, cy - h * 1.6, cx + w, cy - h * 0.15); ctx.stroke(); ctx.restore();
    } },
  ]);
}

// ---- snow (104–105): the sober insert -------------------------------------------------------------------
function s05_flakes(key, n, sp, sz, a = 0.8, wind = 30) {
  const r = RNG(key).f;
  for (let i = 0; i < n; i++) { const x = mod(r() * 3000 + Math.sin(TT * 0.8 + i) * 40 + TT * wind, 3000) - 540, y = mod(r() * 1400 + TT * sp * (0.7 + r() * 0.6), 1400) - 160;
    ivDot(x, y, sz * (0.6 + r() * 0.8), `rgba(240,244,255,${a * (0.5 + r() * 0.5)})`); }
}
// the lamp-lit flakes: brighter inside a light cone (apex [x, y], spread w at the bottom y1)
function s05_coneFlakes(key, ax, ay, w, y1, n) {
  const r = RNG(key).f;
  for (let i = 0; i < n; i++) { const v = mod(r() + TT * (0.12 + r() * 0.08), 1), y = lerp(ay + 20, y1, v), x = ax + (r() - 0.5) * w * v + Math.sin(TT + i) * 10;
    ivDot(x, y, 2 + r() * 2.5, `rgba(255,236,200,${0.5 + 0.4 * r()})`); }
}
// o.act() on d = 1 (ground at GROUND), o.cats far huddled cats, o.spill [x0, x1] the window's warm light on the near snow
function s05_snow(o = {}) {
  IV_M = s05_moodSnow; const P = ext_proj(960, 470);
  return [
    { d: 4, draw: () => {
      ctx.fillStyle = ivVGrad(-400, 700, ['#04060c', '#121a2a', '#2a3346']); ctx.fillRect(-1500, -900, 5000, 2600);
      ivGlow(1500, 120, 700, 'rgba(190,205,235,0.14)');
      const r = RNG('s05snb').f; for (let i = 0; i < 14; i++) { const x = -900 + i * 280 + r() * 60, top = 140 + r() * 220; ivRR(x, top, 250, 900, 0, ['#121826', '#161d2c', '#0f1420'][i % 3]); ivRR(x - 6, top - 12, 262, 16, 6, '#9aa6ba');
        for (let j = 0; j < 4; j++) for (let k = 0; k < 2; k++) if (r() < 0.22) ivRR(x + 50 + k * 100, top + 60 + j * 100, 40, 52, 3, 'rgba(232,168,90,0.55)'); }
      s05_flakes('s05f4', 170, 45, 2, 0.5, 20);
    } },
    { d: 1.6, draw: () => {
      // the snow field: dark far, bright near, blue tyre ruts toward the vanishing point
      ivPoly([[-1500, 470], [3400, 470], [3400, 1500], [-1500, 1500]], ivVGrad(470, 1000, ['#3a4458', '#68748c', '#8a96ac']));
      for (const X of [160, 330, 900, 1070]) ivPoly([P(X - 30, 0, 0.6), P(X + 30, 0, 0.6), P(X + 8, 0, 9), P(X - 8, 0, 9)], 'rgba(40,52,80,0.22)');
      // the house on the left: one warm window (curtains, a lamp, a plant), snow on the sill, its light on the snow
      const hb = ext_box(P, -2600, -800, 0, 1500, 3.0, 3.4, { col: '#262a36', side: '#1c202a', edge: false });
      ivPoly([P(-2700, 1500, 2.95), P(-760, 1500, 2.95), P(-760, 1530, 2.95), P(-2700, 1530, 2.95)], '#c8d0dc');
      ext_q(hb.F, 0.1, 0.3, 0.55, 0.75, 'rgba(232,168,90,0.25)');
      const w0 = P(-1550, 70, 3.0), w1 = P(-1000, 400, 3.0), ww = w1[0] - w0[0], wh = w0[1] - w1[1];
      ivGlow(w0[0] + ww / 2, w1[1] + wh / 2, 420, 'rgba(255,170,90,0.32)');
      ivRR(w0[0] - 10, w1[1] - 10, ww + 20, wh + 20, 4, '#14110f');
      ivRR(w0[0], w1[1], ww, wh, 2, ivVGrad(w1[1], w0[1], ['#ffd590', '#f0a058']));
      ivDot(w0[0] + ww * 0.7, w1[1] + wh * 0.35, 16, '#fff2c8'); ivGlow(w0[0] + ww * 0.7, w1[1] + wh * 0.35, 90, 'rgba(255,230,170,0.6)');
      ivPoly([[w0[0] + ww * 0.62, w1[1] + wh * 0.42], [w0[0] + ww * 0.78, w1[1] + wh * 0.42], [w0[0] + ww * 0.72, w1[1] + wh * 0.3], [w0[0] + ww * 0.68, w1[1] + wh * 0.3]], '#7a3a2a');
      for (let k = 0; k < 4; k++) ivLine(w0[0] + ww * 0.25, w0[1] - 12, w0[0] + ww * (0.12 + k * 0.08), w0[1] - wh * 0.35 - (k % 2) * 10, 5, '#3e6a3a');
      ivPoly([[w0[0], w1[1]], [w0[0] + ww * 0.2, w1[1]], [w0[0] + ww * 0.12, w0[1]], [w0[0], w0[1]]], '#9a3a30'); ivPoly([[w0[0] + ww, w1[1]], [w0[0] + ww * 0.8, w1[1]], [w0[0] + ww * 0.88, w0[1]], [w0[0] + ww, w0[1]]], '#9a3a30');
      ivLine(w0[0] + ww / 2, w1[1], w0[0] + ww / 2, w0[1], 6, '#14110f'); ivLine(w0[0], w1[1] + wh / 2, w0[0] + ww, w1[1] + wh / 2, 6, '#14110f');
      ivRR(w0[0] - 18, w0[1] - 4, ww + 36, 14, 6, '#e6ebf3');
      ivLightPool([w0, [w0[0] + ww, w0[1]], P(-700, 0, 1.6), P(-1900, 0, 1.6)], 'rgba(255,170,90,0.16)');
      // a street lamp on the right with a cone of light
      const lb = P(700, 0, 2.6), lt = P(700, 900, 2.6); ivLine(lb[0], lb[1], lt[0], lt[1], 7, '#141824'); ivLine(lt[0], lt[1], lt[0] - 40, lt[1], 6, '#141824');
      ivRR(lt[0] - 70, lt[1] - 14, 40, 10, 3, '#e6ebf3'); ivDot(lt[0] - 50, lt[1] + 4, 8, '#fff0d0');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ivPoly([[lt[0] - 56, lt[1] + 6], [lt[0] - 44, lt[1] + 6], [lt[0] + 70, lb[1]], [lt[0] - 170, lb[1]]], 'rgba(255,220,160,0.07)'); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.ellipse(lb[0] - 50, lb[1], 150, 26, 0, 0, TAU); ctx.fillStyle = 'rgba(255,225,170,0.22)'; ctx.fill(); ctx.restore();
      s05_coneFlakes('s05cf', lt[0] - 50, lt[1], 240, lb[1], 40);
      // snow drifts along the house; the huddled cats with snow on their backs
      for (let i = 0; i < 6; i++) { const q = P(-780 + i * 10, 0, 1.4 + i * 0.3); ctx.beginPath(); ctx.ellipse(q[0], q[1], 120 / (1.4 + i * 0.3), 28 / (1.4 + i * 0.3), 0, Math.PI, TAU); ctx.fillStyle = '#c9d1de'; ctx.fill(); }
      const r = RNG('s05hud').f; for (let i = 0; i < (o.cats ?? 0); i++) { const D = 2.4 + r() * 3, X = (r() - 0.5) * 3600, q = P(X, 0, D); ivCat({ x: q[0], y: q[1], s: 150 / D * 1.6, f: r() < 0.5 ? 1 : -1, coat: { ...CATS.alley[i % 7], key: 's05h' + i }, pose: r() < 0.5 ? 'loaf' : 'sleep', expr: { eyes: 'half' } });
        ctx.beginPath(); ctx.ellipse(q[0], q[1] - 34 / D * 1.6, 40 / D * 1.6, 8 / D * 1.6, 0, Math.PI, TAU); ctx.fillStyle = 'rgba(235,240,250,0.9)'; ctx.fill(); }
      s05_flakes('s05f16', 120, 65, 3, 0.7, 26);
    } },
    { d: 1, draw: () => {
      ivPoly([[-1500, 960], [3400, 960], [3400, 1500], [-1500, 1500]], ivVGrad(940, 1100, ['rgba(200,208,224,0.22)', 'rgba(214,222,236,0.5)']));
      const r = RNG('s05sh').f; for (let i = 0; i < 9; i++) { const x = -300 + i * 300 + r() * 100; ctx.beginPath(); ctx.ellipse(x, 1000 + r() * 60, 140, 12, 0, 0, TAU); ctx.fillStyle = 'rgba(70,86,120,0.16)'; ctx.fill(); }
      if (o.spill) { const [a, b] = o.spill; ivLightPool([[a - 80, 930], [b - 60, 930], [b + 40, 1100], [a - 160, 1100]], 'rgba(255,170,90,0.3)'); }
      o.act && o.act();
      s05_flakes('s05f1', 110, 90, 4, 0.85, 34);
    } },
    { d: 0.6, draw: () => { const r = RNG('s05bk').f; for (let i = 0; i < 18; i++) { const x = mod(r() * 2600 + TT * 50, 2600) - 340, y = mod(r() * 1300 + TT * 170 * (0.7 + r() * 0.5), 1300) - 110; ivGlow(x, y, 14 + r() * 16, 'rgba(240,244,255,0.55)'); } } },
  ];
}
// a bowl with snow in it (empty), a small heap on the rim
function s05_snowBowl(x, y, s) { P_bowl(x, y, s, { full: 0, col: '#7a8494' }); ctx.beginPath(); ctx.ellipse(x, y - 40 * s, 50 * s, 12 * s, 0, 0, TAU); ctx.fillStyle = 'rgba(238,242,250,0.95)'; ctx.fill(); ivDot(x - 14 * s, y - 46 * s, 14 * s, 'rgba(238,242,250,0.95)'); }

// ---- the roofs with rings over each yowling cat ----------------------------------------------------------
function s05_roofs(o = {}) {
  const L = SET_roofs({ cats: o.cats, yowl: o.yowl, from: o.from, fg: o.fg, act: () => { ring(1); o.act && o.act(); }, front: o.front });
  const n = clamp(Math.round(o.cats ?? 0), 0, 60), from = o.from || [960, 600], yw = clamp(o.yowl ?? 0);
  const order = EXT_ROOFSLOTS.map((sl) => ({ sl, k: Math.hypot(sl.x - from[0], (sl.y - from[1]) * 1.4) * (sl.d === 1 ? 1.25 : 1) })).sort((a, b) => a.k - b.k).map((x) => x.sl).slice(0, n);
  function ring(d) { if (o.rings === false) return; order.forEach((sl, k) => { if (sl.d !== d || k >= yw * n) return;
    s05_rings(sl.x + sl.f * sl.s * 0.25, sl.y - sl.s * 0.62, sl.s * 1.5, mod(TT * 0.9 + sl.i * 0.37, 1), { n: 3, w: Math.max(2.5, sl.s * 0.03) }); }); }
  L.splice(2, 0, { d: 3.2, draw: () => ring(3.2) }); L.splice(4, 0, { d: 1.8, draw: () => ring(1.8) });
  return L;
}
// the city map on the dark void stage
function s05_map(u, mo = {}, over) {
  ivStage(SET_void({ mood: 'extRoofs', glow: [255, 170, 90], fg: false, act: () => { P_cityMap(960, 545, 1.25, u, mo); over && over(); } }));
}

// ---- night facades for Duchess's balcony and Noodle's sill ---------------------------------------------
function s05_nightBack(key) {
  return { d: 3.4, draw: () => {
    ctx.fillStyle = ivVGrad(-500, 1100, ['#04060d', '#0e1532', '#1e2a50']); ctx.fillRect(-1500, -900, 5000, 2800);
    ivDot(300, 140, 70, '#e9eefa'); ivGlow(300, 140, 460, 'rgba(170,190,255,0.3)');
    const r = RNG(key).f; for (let i = 0; i < 12; i++) { const x = -800 + i * 330 + r() * 80, top = 260 + r() * 300; ivRR(x, top, 300, 1200, 0, ['#11162c', '#151a32', '#0f1428'][i % 3]);
      for (let j = 0; j < 6; j++) for (let k = 0; k < 3; k++) if (r() < 0.32) ivRR(x + 30 + k * 90, top + 40 + j * 110, 44, 60, 3, r() < 0.8 ? '#f2b866' : '#9fc0ff'); }
  } };
}
// a lit window in a brick facade, with a sill box; (x, y) = the sill's top centre; w = window width
function s05_window(x, y, w, key) {
  const h = w * 1.15;
  ivRR(x - w * 2.2, y - h * 2, w * 4.4, h * 3.2, 0, '#3a2a30');
  const r = RNG(key).f; for (let j = 0; j < 22; j++) { const yy = y - h * 2 + j * 46; ivLine(x - w * 2.2, yy, x + w * 2.2, yy, 2, 'rgba(0,0,0,0.25)'); for (let i = 0; i < 12; i++) ivLine(x - w * 2.2 + (i + (j % 2) * 0.5) * w * 0.4, yy, x - w * 2.2 + (i + (j % 2) * 0.5) * w * 0.4, yy + 46, 2, 'rgba(0,0,0,0.18)'); }
  ivRR(x - w / 2 - 14, y - h - 14, w + 28, h + 28, 6, '#1c1418');
  const g = ctx.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, '#ffcf86'); g.addColorStop(1, '#e8925a'); ivRR(x - w / 2, y - h, w, h, 4, g);
  ivPoly([[x - w / 2, y - h], [x - w * 0.18, y - h], [x - w * 0.3, y], [x - w / 2, y]], '#b8463c'); ivPoly([[x + w / 2, y - h], [x + w * 0.2, y - h], [x + w * 0.32, y], [x + w / 2, y]], '#b8463c');
  ivLine(x, y - h, x, y, 10, '#1c1418'); ivLine(x - w / 2, y - h * 0.5, x + w / 2, y - h * 0.5, 10, '#1c1418');
  ivGlow(x, y - h * 0.4, w * 1.6, 'rgba(255,190,110,0.35)');
  ivBox(x - w * 0.75, y, w * 1.5, 34, 0.08, [960, 300], { front: '#6a5a58', top: '#8a7a76', side: '#4a3e3e' });
  ivLightPool([[x - w / 2, y], [x + w / 2, y], [x + w * 0.7, y + 220], [x - w * 0.7, y + 220]], 'rgba(255,190,110,0.10)');
}
// a balcony: slab + railing; (x, y) = the slab's top front centre (where Duchess sits on the rail cap: y - railH)
function s05_balcony(x, y, w) {
  ivBox(x - w / 2, y, w, 40, 0.12, [960, 200], { front: '#5a5260', top: '#7a7286', side: '#3e3846' });
  ivAO(x - w / 2, y + 40, x + w / 2, y + 40, 30, 0.45);
  const rh = 190; for (let i = 0; i <= 14; i++) ivLine(x - w / 2 + 20 + i * (w - 40) / 14, y, x - w / 2 + 20 + i * (w - 40) / 14, y - rh, 9, '#14121a');
  ivBox(x - w / 2, y - rh - 18, w, 22, 0.05, [960, 200], { front: '#24202c', top: '#3a3446', side: '#1a1620', line: 'rgba(220,230,255,0.5)' });
  for (const px of [x - w * 0.36, x + w * 0.3]) { ivBox(px - 40, y - 70, 80, 70, 0.1, [960, 200], { front: '#b0603a', top: '#c87a4c', side: '#8a4a2c' }); for (let k = 0; k < 5; k++) ivLine(px, y - 70, px - 50 + k * 25, y - 150 - (k % 2) * 30, 7, '#3e7a4a'); ivDot(px - 20, y - 150, 10, '#e05a7a'); }
  return y - rh - 18;
}
// a tomato hanging from a string like a balloon (the joke); (x, y) = the tomato's centre
function s05_tomato(x, y, r) {
  ivLine(x, y + r * 0.95, x - r * 0.3 + Math.sin(TT * 2) * 10, y + r * 4.5, 3, 'rgba(240,240,240,0.8)');
  ctx.beginPath(); ctx.ellipse(x, y, r * 1.12 + 5, r + 5, 0, 0, TAU); ctx.fillStyle = IV_M.rim; ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.15); g.addColorStop(0, '#ff7a5a'); g.addColorStop(0.5, '#e0301e'); g.addColorStop(1, '#8a1408');
  ctx.beginPath(); ctx.ellipse(x, y, r * 1.12, r, 0, 0, TAU); ctx.fillStyle = g; ctx.fill();
  for (const a of [-0.9, -0.3, 0.3, 0.9]) { ctx.beginPath(); ctx.ellipse(x + Math.sin(a) * r * 0.55, y, r * 0.5, r * 0.95, a * 0.3, -1.2, 1.2); ctx.strokeStyle = 'rgba(120,10,0,0.25)'; ctx.lineWidth = 3; ctx.stroke(); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU - Math.PI / 2; ctx.save(); ctx.translate(x, y - r * 0.9); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(r * 0.22, 0, r * 0.26, r * 0.07, 0, 0, TAU); ctx.fillStyle = '#3e8a3a'; ctx.fill(); ctx.restore(); }
  ivLine(x, y - r * 0.9, x + 6, y - r * 1.2, 8, '#2e6a2a');
  ivDot(x - r * 0.42, y - r * 0.42, r * 0.16, 'rgba(255,255,255,0.75)');
}
// a thought bubble (cream disc, tail toward (tx, ty)); fn() draws inside, clipped; a = pop 0..1
function s05_bubble(x, y, r, tx, ty, a, fn) {
  if (a <= 0) return; const k = 0.6 + 0.4 * EZ.back(clamp(a));
  ctx.save(); ctx.globalAlpha *= clamp(a * 1.5);
  for (let i = 1; i <= 2; i++) { const u = i / 3; ivDot(lerp(tx, x, u * 0.6), lerp(ty, y, u * 0.6), r * (0.06 + 0.06 * i) * k, '#f4ead8'); }
  ctx.translate(x, y); ctx.scale(k, k);
  ivDot(6, 10, r, 'rgba(0,0,0,0.35)'); ivDot(0, 0, r + 5, IV_M.rim); ivDot(0, 0, r, '#f4ead8');
  ctx.beginPath(); ctx.arc(0, 0, r - 10, 0, TAU); ctx.clip(); ctx.fillStyle = '#2a3048'; ctx.fillRect(-r, -r, r * 2, r * 2); ivGlow(0, -r * 0.3, r * 1.2, 'rgba(255,200,140,0.35)');
  fn(); ctx.restore();
}

// =====================================================================
//  096 — But the cats saw. (eyes open in the dark, one pair after another)
// =====================================================================
SHOT(CUT('096-narrator'), 's05_eyesDark', (lt) => {
  IV_M = s05_moodMoon; IV_CAM = { x: 960, y: 540, z: 1 + 0.06 * s05_io(lt, 0, 1.6) };
  ivStage([
    { d: 3, draw: () => { ctx.fillStyle = ivVGrad(-300, 1300, ['#020308', '#070a18', '#04050c']); ctx.fillRect(-1500, -900, 5000, 2800); ivGlow(1500, 60, 500, 'rgba(120,140,220,0.18)');
      ivPoly([[-1500, 520], [3400, 520], [3400, 2000], [-1500, 2000]], '#05060d'); ivLine(-1500, 520, 3400, 520, 3, 'rgba(160,180,255,0.18)'); } },
    { d: 1, draw: () => {
      const r = RNG('s05eyes').f, cols = ['rgb(232,195,74)', 'rgb(124,240,106)', 'rgb(90,181,232)', 'rgb(232,195,74)', 'rgb(201,224,90)'];
      for (let i = 0; i < 16; i++) { const x = 140 + r() * 1640, y = 300 + r() * 520, s = 34 + r() * 60, at = 0.08 + i * 0.07 + r() * 0.05;
        let op = s05_u(lt, at, s05_fr(3)); if (mod(F + i * 17, 70) < 2) op *= 0.1; s05_eyePair(x, y, s, op, cols[i % 5], Math.sin(TT + i) * 0.5); }
    } },
  ]);
}, { sec: 's05', title: 'eyes open in the dark, pair after pair' });
{ const t = CUT('096-narrator'); SFX(t, 'whoosh', 0.45); SFX(t + 0.5, 'cloth', 0.35, -0.3); SFX(VW('096-narrator', 'saw'), 'tick', 0.45, 0.2); }

// 097 — Cats always see. (an eye macro; the slit narrows on "see"; Lily's yellow coat in the reflection)
SHOT(CUT('097-narrator'), 's05_eyeMacro', (lt, S) => {
  IV_CAM = { x: 960, y: 540, z: 1 + 0.08 * s05_io(lt, 0, 2) };
  const ts = VW('097-narrator', 'see') - S.t0;
  s05_eyeMacro(lt, lerp(120, 34, s05_u(lt, ts, s05_fr(5))), 0.15 + 0.85 * s05_u(lt, 0.05, s05_fr(5)));
}, { sec: 's05', title: 'a green eye; the pupil narrows; a yellow coat in the reflection' });
{ SFX(CUT('097-narrator') + 0.1, 'swish', 0.4); SFX(VW('097-narrator', 'see'), 'camera', 0.45); }

// 098 — You go to the old garage behind the market (crane down into the alley, Kai walks in; Boss's spot is empty)
SHOT(CUT('098-narrator'), 's05_alleyEnter', (lt, S) => {
  // the cats' POV: from the top of the wall down the alley; Kai walks in from the street, three cats' backs in front
  const u = s05_io(lt, 0, 2.4); IV_CAM = { x: lerp(1000, 940, u), y: lerp(330, 560, u), z: lerp(1.18, 1.02, u) };
  const tw0 = S.t0 + 0.4, tw1 = tw0 + 5.2 * s05_fr(5), wk = ivWalk(tw0, 0, s05_KAI, 1, 5, tw1), p = EZ.o3(clamp((TT - tw0) / (tw1 - tw0)));
  ivStage(s05_rev({ kai: { X: lerp(-60, -160, p), D: lerp(3.9, 2.05, p), f: 0.3, pose: wk.moving ? wk.pose : ivPose('relaxed'), expr: { eyes: 'open', look: [0, -1] } },
    fgCats: [[260, 520, 2, -0.3], [800, 430, 0, 0.2], [1560, 560, 5, -0.5]] }));
  s05_tag('THE GARAGE · BEHIND THE MARKET', 1400, 150, 26, ivPop(VW('098-narrator', 'garage')));
}, { sec: 's05', title: 'crane down the alley; Kai walks in under forty cats' });
{ const t0 = CUT('098-narrator'); SFX(t0, 'whoosh', 0.5); for (let i = 0; i < 3; i++) SFX(t0 + 0.4 + (1 + i * 2) * s05_fr(5), 'step', 0.4, -0.4); SFX(VW('098-narrator', 'market'), 'drip', 0.4, 0.4); }

// 098 — where the street cats rule. (track along the wall top: glares, a hiss)
SHOT(CUT('098-narrator', 'where'), 's05_wallTrack', (lt) => {
  // profile along the wall: the camera tracks down the row of cats as they recede
  const u = s05_io(lt, 0, 2.2); IV_CAM = { x: lerp(620, 1240, u), y: lerp(420, 450, u), z: 1.75 };
  ivStage(s05_side({ boss: null, kai: null, cats: 30 }));
}, { sec: 's05', title: 'track along the wall top: forty street cats glare' });
{ SFX(CUT('098-narrator', 'where'), 'cloth', 0.4, -0.5); SFX(VW('098-narrator', 'rule'), 'gasp', 0.5, 0.4); }

// 099 — Their leader is… (Kai looks up, swallows)
SHOT(CUT('099-narrator'), 's05_kaiLooksUp', (lt) => {
  IV_CAM = { x: 600, y: 470, z: 2.6 * ivPush(SHOT_T0, 0.03, 1) }; IV_FOCUS = 1;
  ivStage(s05_alley({ boss: null, kai: { x: 560, f: 0.25, pose: ivPose('relaxed'), expr: { eyes: 'wide', mouth: lt > 0.5 ? 'o' : 'flat', brow: 'up', look: [0.3, -1] } } }));
}, { sec: 's05', title: 'Kai looks up' });
SFX(CUT('099-narrator') + 0.5, 'cloth', 0.35);

// 099 — a giant one-eyed tomcat. (the silhouette against the moon; his one eye opens on "one-eyed")
SHOT(CUT('099-narrator', 'giant'), 's05_bossSil', (lt, S) => {
  IV_CAM = { x: 960, y: lerp(620, 520, s05_io(lt, 0, 2.4)), z: 1.0 };
  const te = VW('099-narrator', 'one-eyed') - S.t0;
  ivStage(s05_bossCU({ x: 1000, y: 1010, s: 900, sil: 1, eye: s05_u(lt, te + 0.05, s05_fr(4)) }));
}, { sec: 's05', title: 'low angle: the giant silhouette, the moon behind; one eye opens' });
{ SFX(CUT('099-narrator', 'giant'), 'whoosh', 0.6); SFX(VW('099-narrator', 'one-eyed') + 0.05, 'gasp', 0.45); }

// 100 — They call him Boss. (the wall: Boss in the moonlight, forty cats turn to him; BOSS lands on the word)
SHOT(CUT('100-narrator'), 's05_bossName', (lt) => {
  // low wide from behind Kai: the whole wall against the sky, Boss in the middle with the moon behind his head
  IV_CAM = { x: 940, y: 470, z: 1.06 + 0.1 * s05_io(lt, 0, 2) };
  ivStage(s05_low({ boss: { expr: { eyes: 'half' }, look: [-0.3, 0.9] }, kaiBack: { x: 330, y: 1130, h: 900, up: 1 } }));
  s05_bigNum('BOSS', 1460, 900, 96, ivPop(VW('100-narrator', 'boss')), { c: '#e9eefa', glow: 'rgba(150,180,255,0.8)' });
}, { sec: 's05', title: 'Boss on the wall; BOSS lands on the word' });
{ SFX(CUT('100-narrator'), 'swish', 0.4); SFX(VW('100-narrator', 'boss'), 'thud', 0.8); }

// 101 — A human who understands us. (Boss close-up, low angle, the moon behind him)
SHOT(CUT('101-boss'), 's05_bossTalk1', (lt) => {
  IV_CAM = { x: 980, y: 520, z: 1.0 * ivPush(SHOT_T0, 0.03, 1.8) };
  ivStage(s05_bossCU({ x: 1040, y: 1060, s: 980, expr: { eyes: 'half' }, talk: '101-boss', look: [-0.4, 0.4] }));
}, { sec: 's05', title: 'Boss close-up, low angle, talking' });
{ SFX(CUT('101-boss') + 0.2, 'cloth', 0.35, 0.2); SFX(VW('101-boss', 'understands'), 'tick', 0.3); }

// 101 — Funny. Why would we help you? (two-shot: Kai small below, Boss up on the wall; the cats smirk on "Funny")
SHOT(CUT('101-boss', 'funny'), 's05_twoShot1', (lt, S) => {
  // profile along the wall: Boss up on the coping leans down to Kai below
  const u = s05_io(lt, 0, s05_len(S)); IV_CAM = { x: lerp(1120, 1170, u), y: 540, z: 1.12 };
  const tw = VW('101-boss', 'why') - S.t0, lean = s05_u(lt, tw, s05_fr(5));
  ivStage(s05_side({ boss: { expr: { eyes: lt < tw ? 'happy' : 'angry' }, talk: '101-boss', look: [0.7, 0.8], rot: 0.1 * lean },
    kai: { X: -150, D: 1.05, f: -0.45, pose: ivPose('relaxed'), expr: { eyes: 'open', brow: 'up', mouth: 'flat', look: [-0.6, -1] } } }));
}, { sec: 's05', title: 'two-shot: Boss above, Kai below; "Why would we help you?"' });
{ SFX(CUT('101-boss', 'funny') + 0.1, 'laugh', 0.3, 0.3); SFX(VW('101-boss', 'why'), 'cloth', 0.45, 0.2); SFX(VW('101-boss', 'help'), 'step', 0.4, 0.2); }

// 102 — Because she's seven. (Kai's face, steady, looking up)
SHOT(CUT('102-you'), 's05_kaiSeven', (lt) => {
  IV_CAM = { x: 580, y: 450, z: 3.0 * ivPush(SHOT_T0, 0.04, 1.4) };
  ivStage(s05_alley({ boss: null, kai: { x: 560, f: 0.3, expr: { eyes: 'sad', brow: 'sad', look: [0.3, -1] }, talk: '102-you' } }));
}, { sec: 's05', title: 'Kai close: "Because she\'s seven."' });
{ SFX(CUT('102-you') + 0.1, 'cloth', 0.35, -0.2); }

// 103 — Kittens get lost every day. (Boss in profile, closer, the moon on his scar)
SHOT(CUT('103-boss'), 's05_bossTalk2', (lt) => {
  IV_CAM = { x: 860, y: 430, z: 1.45 * ivPush(SHOT_T0, 0.03, 1.6) };
  ivStage(s05_bossCU({ x: 820, y: 1060, s: 1000, f: 1, moon: [1240, 260], expr: { eyes: 'half' }, talk: '103-boss', look: [0.6, 0.2] }));
}, { sec: 's05', title: 'Boss in profile against the moon, talking' });
SFX(CUT('103-boss') + 0.3, 'cloth', 0.35, -0.2);

// 103 — Nobody looks for ours. (a kitten alone under a crate, drips)
SHOT(CUT('103-boss', 'nobody'), 's05_kittenAlone', (lt) => {
  IV_CAM = { x: 440, y: 800, z: 3.1 + 0.15 * s05_io(lt, 0, 2.2) };
  ivStage(s05_alley({ boss: null, kai: null, cats: 40, fg: false, extra: () => {
    const q = s05_P(-535, 0, 1.0); ivBox(q[0] - 120, q[1] - 160, 240, 160, 0.15, [960, 260], { front: '#5e462e', top: '#7e6040', side: '#46341f' });
    ctx.save(); ctx.beginPath(); ctx.rect(q[0] - 110, q[1] - 150, 220, 150); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fill(); ctx.restore();
    s05_cat(q[0] - 20, q[1] - 4, 100, { ...IV_COATS.kitten, key: 's05kit' }, { f: 1, pose: 'loaf', expr: { eyes: 'wide' }, look: [0.6, 0] });
    for (let i = 0; i < 2; i++) { const du = mod(TT * 0.7 + i * 0.5, 1); ivDot(q[0] + 60 + i * 30, q[1] - 170 + du * 170, 3, 'rgba(180,200,255,0.8)'); }
  } }));
}, { sec: 's05', title: 'a kitten alone under a crate' });
{ SFX(CUT('103-boss', 'nobody') + 0.3, 'drip', 0.4, -0.4); SFX(VW('103-boss', 'ours') + 0.2, 'drip', 0.35, -0.4); }

// [BEAT] — the stare: Kai and Boss, the wall silent; a slow track
SHOT(LE('103-boss') + 0.55, 's05_stare', (lt) => {
  // over Boss's shoulder, down at Kai (the wall's point of view); a slow drift
  const u = s05_io(lt, 0, 1.6); IV_CAM = { x: lerp(1000, 1060, u), y: lerp(540, 560, u), z: 1.12 };
  ivStage(s05_rev({ kai: { X: -300, D: 1.9, f: 0.25, expr: { eyes: 'sad', brow: 'sad', look: [0.4, -1] } }, bossBack: { x: 1500, s: 540, turn: -0.7 },
    fgCats: [[150, 440, 3, 0.4]] }));
}, { sec: 's05', title: '[beat] Kai and Boss stare; the wall is silent' });
SFX(LE('103-boss') + 0.9, 'drip', 0.4, 0.4);

// =====================================================================
//  104 — Every winter, thousands of street cats… (snow; huddled cats in the distance; THOUSANDS on the word)
// =====================================================================
SHOT(CUT('104-narrator'), 's05_snowWide', (lt) => {
  const u = s05_io(lt, 0, 2.6); IV_CAM = { x: lerp(820, 1060, u), y: lerp(460, 560, u), z: lerp(1.0, 1.18, u) };
  ivStage(s05_snow({ cats: 14, act: () => { s05_snowBowl(1300, 1000, 1.2); s05_snowBowl(520, 1030, 1.0); } }));
  s05_bigNum('THOUSANDS', 960, 250, 84, ivPop(VW('104-narrator', 'thousands')), { c: '#eef2fa', glow: 'rgba(160,180,230,0.6)', sub: 'EVERY WINTER' });
}, { sec: 's05', title: 'snow: huddled street cats; THOUSANDS' });
{ SFX(CUT('104-narrator'), 'whoosh', 0.5, -0.3); SFX(VW('104-narrator', 'thousands'), 'thud', 0.5); SFX(VW('104-narrator', 'cats') , 'cloth', 0.3, 0.4); }

// 104 — …die from cold and hunger. (a thin cat curled in the snow by two empty bowls; snow settles on it)
SHOT(CUT('104-narrator', 'die'), 's05_snowCat', (lt) => {
  IV_CAM = { x: 980, y: 880, z: 2.6 + 0.12 * s05_io(lt, 0, 2.4) };
  ivStage(s05_snow({ cats: 0, spill: [420, 720], act: () => {
    s05_cat(880, 960, 230, { ...IV_COATS.grey, key: 's05thin', oneEye: false, col: '#6e7078' }, { f: 1, pose: 'sleep', expr: { eyes: 'closed' }, shadow: true });
    const k = clamp(lt / 2.4); ctx.beginPath(); ctx.ellipse(870, 960 - 30, 44 + 10 * k, 6 + 5 * k, 0, Math.PI, TAU); ctx.fillStyle = `rgba(238,242,250,${0.5 + 0.4 * k})`; ctx.fill();
    s05_snowBowl(1070, 975, 1.1); s05_snowBowl(1190, 960, 0.9);
    for (let k = 0; k < 2; k++) { const u = mod(TT / 1.7 + k * 0.5, 1); ext_puff(948 + 50 * u, 912 - 70 * u, 12 + 34 * u, '236,242,252', 0.7 * Math.sin(Math.PI * Math.min(1, u * 1.4))); }   // its breath
  } }));
}, { sec: 's05', title: 'a thin cat curled in the snow, empty bowls' });
{ SFX(VW('104-narrator', 'cold'), 'whoosh', 0.35, 0.3); SFX(VW('104-narrator', 'hunger'), 'metal', 0.3, 0.3); }

// 105 — Nobody counts them. (a row of empty bowls into the distance; paw prints fill with snow)
SHOT(CUT('105-narrator'), 's05_bowlsRow', (lt) => {
  IV_CAM = { x: 960, y: 600, z: 1.25 - 0.08 * s05_io(lt, 0, 2.2) };
  ivStage(s05_snow({ cats: 0, act: () => {
    const P = ext_proj(960, 470);
    for (let i = 7; i >= 0; i--) { const D = 0.9 + i * 0.45, q = P(-260, 0, D); s05_snowBowl(q[0], q[1], 1.25 / D); }
    const fill = clamp(lt / 2.2); for (let i = 0; i < 12; i++) { const D = 0.85 + i * 0.3, q = P(200 + (i % 2) * 60, 0, D); ctx.save(); ctx.globalAlpha = 0.6 * (1 - fill * (0.4 + i * 0.05)); ctx.beginPath(); ctx.ellipse(q[0], q[1], 16 / D, 6 / D, 0, 0, TAU); ctx.fillStyle = '#5a6478'; ctx.fill(); ctx.restore(); }
  } }));
}, { sec: 's05', title: 'empty bowls into the distance; paw prints fill with snow' });
{ SFX(CUT('105-narrator') + 0.2, 'whoosh', 0.35, -0.3); SFX(VW('105-narrator', 'them') + 0.3, 'tick', 0.25); }

// =====================================================================
//  106 — Here's the price. (Boss close, angry eye, THE PRICE)
// =====================================================================
SHOT(CUT('106-boss'), 's05_price', (lt) => {
  IV_CAM = { x: 1000, y: 470, z: 1.2 * ivPush(SHOT_T0, 0.04, 1.2) };
  ivStage(s05_bossCU({ x: 1080, y: 1060, s: 960, expr: { eyes: 'angry' }, talk: '106-boss', look: [-0.6, 0.4] }));
  s05_tag('THE PRICE', 520, 200, 40, ivPop(VW('106-boss', 'price')));
}, { sec: 's05', title: 'Boss: "Here\'s the price."' });
{ SFX(CUT('106-boss') + 0.1, 'cloth', 0.4, 0.3); SFX(VW('106-boss', 'price'), 'pop', 0.5, -0.4); }

// 106 — You feed the alley. (hand insert: kibble pours into a bowl; heads crowd in)
SHOT(CUT('106-boss', 'feed'), 's05_feed', (lt) => {
  IV_M = IV_MOOD.extAlley; IV_CAM = { x: 960, y: 540, z: 1 };
  const f = clamp(lt / 0.9);
  ivStage([
    { d: 3, draw: () => { ctx.fillStyle = ivVGrad(-300, 1300, ['#0e1430', '#1a2036', '#161b2c']); ctx.fillRect(-1500, -900, 5000, 2800); ivGlow(400, 200, 500, 'rgba(255,200,120,0.3)'); ivGlow(1500, 300, 600, 'rgba(160,180,255,0.2)'); } },
    { d: 1, draw: () => {
      ivPoly([[-400, 760], [2400, 760], [2400, 1400], [-400, 1400]], '#1d2236');
      P_bowl(960, 900, 4.2, { full: f, col: '#5aa9e6', name: 'ALLEY' });
      ivCat({ x: 340, y: 1180, s: 520, f: 1, coat: { ...CATS.alley[0], key: 's05fA' }, pose: 'stand', expr: { eyes: 'wide' }, look: [1, 0.6] });
      ivCat({ x: 1620, y: 1200, s: 540, f: -1, coat: { ...CATS.alley[3], key: 's05fB' }, pose: 'stand', expr: { eyes: 'wide', mouth: 'open' }, look: [-1, 0.6] });
      const r = RNG('s05kib').f; for (let i = 0; i < 26; i++) { const p = mod(TT * 2.2 + r(), 1), x = 1000 + (r() - 0.5) * 60 + p * 30, y = 330 + p * 420; ctx.save(); ctx.translate(x, y); ctx.rotate(r() * 3); ctx.beginPath(); ctx.ellipse(0, 0, 9, 6, 0, 0, TAU); ctx.fillStyle = ['#b8733c', '#8a4c24', '#c98a4e'][i % 3]; ctx.fill(); ctx.restore(); }
    } },
    { d: 0.85, draw: () => {
      // Kai's hand tips a bag of kibble from the top
      ctx.save(); ctx.translate(1060, 250); ctx.rotate(0.9); ivRR(-150, -230, 300, 360, 30, '#c9473a'); ivRR(-150, -230, 300, 360, 30, null, IV_M.rim, 4); ivText('KIBBLE', 0, -40, 44, '#fff3e0'); ivDot(0, 40, 40, '#f2c230'); ctx.restore();
      s05_arm(1900, 80, 1290, 130, 110, CAST.kai.col, 'hold');
    } },
  ]);
}, { sec: 's05', title: 'insert: Kai\'s hand pours kibble; two cats crowd the bowl' });
{ SFX(CUT('106-boss', 'feed') + 0.12, 'plastic', 0.6, 0.2); }

// 106 — Every day. (bowls; the sun and the moon wheel over and over)
SHOT(CUT('106-boss', 'every', 1), 's05_everyDay', (lt) => {
  IV_M = IV_MOOD.extAlley; IV_CAM = { x: 960, y: 540, z: 1.04 };
  const a = lt * 7.5;
  ivStage([
    { d: 3, draw: () => { const day = 0.5 + 0.5 * Math.sin(a); ctx.fillStyle = ivVGrad(-300, 1000, [day > 0.5 ? '#6a9ad0' : '#0e1430', day > 0.5 ? '#e8c89a' : '#1e2746']); ctx.fillRect(-1500, -900, 5000, 2800);
      const sx = 960 + Math.cos(a) * 760, sy = 760 - Math.sin(a) * 520; ivDot(sx, sy, 70, '#ffd65a'); ivGlow(sx, sy, 300, 'rgba(255,210,100,0.5)');
      const mx = 960 - Math.cos(a) * 760, my = 760 + Math.sin(a) * 520; ivDot(mx, my, 56, '#e9eefa'); } },
    { d: 1, draw: () => { ivPoly([[-400, 820], [2400, 820], [2400, 1400], [-400, 1400]], '#2a2f46'); for (let i = 0; i < 5; i++) P_bowl(380 + i * 290, 960, 1.6, { full: 1 - mod(lt * 2.4 + i * 0.2, 1) }); } },
  ]);
  s05_tag('EVERY DAY', 960, 200, 44, ivPop(SHOT_T0 + s05_fr(3)));
}, { sec: 's05', title: 'EVERY DAY: suns and moons wheel over the bowls' });
SFX(CUT('106-boss', 'every', 1), 'swish', 0.5);

// 106 — Every cat. (the wall full of cats, all looking at camera)
SHOT(CUT('106-boss', 'every', 2), 's05_everyCat', (lt) => {
  IV_CAM = { x: lerp(1100, 860, s05_io(lt, 0, 0.8)), y: 320, z: 1.9 };
  ivStage(s05_alley({ kai: null, boss: { expr: { eyes: 'angry' } } }));
  s05_tag('EVERY CAT', 960, 930, 44, ivPop(SHOT_T0 + s05_fr(3)));
}, { sec: 's05', title: 'EVERY CAT: the wall of cats' });
SFX(CUT('106-boss', 'every', 2) + 0.05, 'pop', 0.5, 0.2);

// 106 — Forever. (Boss's one eye, extreme close)
SHOT(CUT('106-boss', 'forever'), 's05_forever', (lt) => {
  const e = s05_bossEye(1040, 1060, 980, -1); IV_CAM = { x: e[0], y: e[1] + 30, z: 3.6 + 0.2 * s05_io(lt, 0, 0.6) };
  ivStage(s05_bossCU({ x: 1040, y: 1060, s: 980, expr: { eyes: 'open' }, look: [-0.2, 0.2] }));
  s05_tag('FOREVER', 960, 940, 48, ivPop(SHOT_T0 + s05_fr(2)), { c: '#ffd0a0' });
}, { sec: 's05', title: 'FOREVER: Boss\'s one eye, extreme close' });
SFX(CUT('106-boss', 'forever') + 0.05, 'thud', 0.7);

// 106 — And you tell the humans what we need. (two-shot from the other side; the three tags stay up)
SHOT(CUT('106-boss', 'and'), 's05_twoShot2', (lt, S) => {
  // over Boss's shoulder from the wall top: he talks down to Kai, who thinks it over
  const u = s05_io(lt, 0, s05_len(S)); IV_CAM = { x: lerp(900, 960, u), y: 540, z: 1.16 };
  ivStage(s05_rev({ kai: { X: -120, D: 1.75, f: -0.25, pose: s05_mix('relaxed', ivPose('think'), s05_u(lt, 0.8, s05_fr(5))), expr: { eyes: 'open', brow: 'up', look: [0.5, -1] } },
    bossBack: { x: 1480, s: 560, turn: -0.5, talk: '106-boss' }, fgCats: [[120, 470, 6, 0.3]] }));
  ['EVERY DAY', 'EVERY CAT', 'FOREVER'].forEach((t, i) => s05_tag(t, 520 + i * 270, 120, 26, 0.85));
}, { sec: 's05', title: 'two-shot reversed: "And you tell the humans what we need."' });
{ SFX(CUT('106-boss', 'and') + 0.1, 'swish', 0.4, 0.3); SFX(CUT('106-boss', 'and') + 0.8, 'cloth', 0.4, 0.4); SFX(VW('106-boss', 'need'), 'step', 0.4, -0.2); }

// =====================================================================
//  107 — Forever is a long time. (Kai medium, hand to chin, eyes drop)
// =====================================================================
SHOT(CUT('107-narrator'), 's05_kaiForever', (lt) => {
  IV_CAM = { x: 640, y: 560, z: 2.0 * ivPush(SHOT_T0, 0.04, 1.6) };
  ivStage(s05_alley({ boss: null, kai: { x: 600, f: 0.35, pose: s05_mix('relaxed', 'think', s05_u(lt, 0.25, s05_fr(5))), expr: { eyes: lt > 0.9 ? 'tired' : 'open', brow: 'sad', mouth: 'flat', look: [0.2, 0.6] } } }));
}, { sec: 's05', title: 'Kai thinks it over: "Forever is a long time."' });
{ SFX(CUT('107-narrator') + 0.25, 'cloth', 0.4); }

// 108 — But Lily has one night. (the MISSING flyer on the wall, flapping in the moonlight)
SHOT(CUT('108-narrator'), 's05_flyer', (lt) => {
  IV_M = s05_moodMoon; IV_CAM = { x: 960, y: 540, z: 1.0 + 0.1 * s05_io(lt, 0, 2.4) };
  ivStage([
    { d: 1.6, draw: () => { ctx.fillStyle = '#262b40'; ctx.fillRect(-1000, -800, 4000, 2600);
      for (let j = -6; j < 26; j++) { const y = j * 70; ivLine(-1000, y, 3000, y, 3, 'rgba(0,0,0,0.3)'); for (let i = -8; i < 24; i++) ivLine(i * 150 + (j % 2) * 75, y, i * 150 + (j % 2) * 75, y + 70, 3, 'rgba(0,0,0,0.22)'); }
      ivGlow(1500, 100, 900, 'rgba(170,190,255,0.22)'); ivGlow(300, 900, 600, 'rgba(255,190,110,0.15)'); } },
    { d: 1, draw: () => {
      ctx.save(); ctx.translate(960, 330); ctx.transform(1, 0, 0.04 * Math.sin(TT * 5), 1, 0, 0); ctx.translate(-960, -330);
      P_flyer(960, 560, 3.1, { ang: -0.03 + 0.01 * Math.sin(TT * 4) });
      ctx.restore();
      ivDot(960 - 200, 270, 9, '#c8c8d0'); ivDot(960 + 200, 260, 9, '#c8c8d0');
    } },
  ]);
  s05_tag('ONE NIGHT', 1560, 900, 40, ivPop(VW('108-narrator', 'night')), { c: '#ffd0a0' });
}, { sec: 's05', title: 'the MISSING flyer on the wall; ONE NIGHT' });
{ SFX(CUT('108-narrator') + 0.1, 'paper', 0.6); SFX(VW('108-narrator', 'night'), 'paper', 0.4, 0.2); }

// 109 — Deal. (hand insert: Kai's open hand; Boss's paw comes down on it)
SHOT(CUT('109-you'), 's05_deal', (lt, S) => {
  IV_M = IV_MOOD.extAlley; IV_CAM = { x: 960, y: 540, z: 1 + 0.03 * s05_io(lt, 0, 1.4) };
  const tp = VW('109-you', 'deal') - S.t0 + 0.25, u = s05_u(lt, tp - s05_fr(6), s05_fr(6));
  ivStage([
    { d: 3, draw: () => { ctx.fillStyle = ivVGrad(-300, 1300, ['#0b1028', '#1a2036', '#121626']); ctx.fillRect(-1500, -900, 5000, 2800);
      ivGlow(300, 300, 520, 'rgba(255,200,120,0.35)'); ivDot(300, 300, 14, '#ffd38a'); ivGlow(1600, 180, 600, 'rgba(170,190,255,0.25)');
      const r = RNG('s05bok').f; for (let i = 0; i < 14; i++) ivGlow(r() * 1920, 100 + r() * 500, 30 + r() * 50, r() < 0.5 ? 'rgba(124,240,106,0.5)' : 'rgba(232,195,74,0.5)'); } },
    { d: 1, draw: () => {
      s05_arm(-200, 1300, 820, 720, 210, CAST.kai.col, 'open');
      s05_paw(2100, lerp(220, 420, u), lerp(1180, 930, u), lerp(420, 690, u), 210);
    } },
  ]);
}, { sec: 's05', title: 'DEAL: Kai\'s hand; Boss\'s paw comes down on it' });
{ SFX(VW('109-you', 'deal') + 0.25, 'cloth', 0.7); SFX(VW('109-you', 'deal') + 0.27, 'thud', 0.35); }

// [BEAT] — the wall rises: Boss on the crate by Kai, forty cats stand up
SHOT(LE('109-you') + 0.95, 's05_dealWide', (lt) => {
  // low and frontal: Kai and Boss (on a crate) shake on it; the whole wall gets up behind them
  IV_CAM = { x: 960, y: 560, z: 1.1 + 0.05 * s05_io(lt, 0, 1.2) };
  ivStage(s05_low({ boss: null, stand: true, cats: 40, kai: { X: -330, D: 0.88, f: 0.45, pose: ivPose('handOut'), expr: { eyes: 'open', mouth: 'flat', look: [0.6, 0.3] } },
    extra: (P) => { const cb = ext_box(P, 60, 340, 0, 210, 0.95, 1.12, { col: '#6a5034', top: '#8a6a48', side: '#4e3a26' }); ivAO(...cb.F(0, 0), ...cb.F(1, 0), 14, 0.5);
      const q = P(200, 210, 1.0); ivCat({ x: q[0], y: q[1], s: 250, f: -1, coat: s05_BOSS, pose: 'stand', expr: { eyes: 'half' }, look: [-0.5, 0.2] }); } }));
}, { sec: 's05', title: '[beat] the deal made: Boss on the crate, Kai\'s hand out' });
{ SFX(LE('109-you') + 1.0, 'cloth', 0.45, -0.3); SFX(LE('109-you') + 1.5, 'step', 0.4, 0.3); }

// 110 — Boss jumps on the wall… (the leap: crate → wall top, landing on "wall")
SHOT(CUT('110-narrator'), 's05_jump', (lt, S) => {
  // profile along the wall: the leap from the crate up to the coping reads as a clean arc
  IV_CAM = { x: 1100, y: 540, z: 1.1 };
  const tj = VW('110-narrator', 'jumps') - S.t0, tl = VW('110-narrator', 'wall') - S.t0;
  const u = clamp((lt - tj) / Math.max(0.2, tl - tj)), e = EZ.io(u), X = lerp(-820, -1010, e), Y = lerp(240, 548, e) + Math.sin(Math.PI * u) * 160, D = lerp(1.3, 1.75, e);
  const land = lt > tl ? s05_u(lt, tl, s05_fr(4)) : 0, lq = s05_PB(-1010, 548, 1.75);
  ivStage(s05_side({ crate: [-990, -650, 240, 1.18, 1.5], boss: { X, Y, D, s: lerp(280, 400, e) / D, f: u >= 1 ? 1 : -1, pose: u > 0 && u < 1 ? 'stand' : (u >= 1 ? 'sit' : 'stand'), rot: u > 0 && u < 1 ? 0.5 * (1 - 2 * u) : 0, expr: { eyes: 'angry' } },
    kai: { X: -150, D: 1.0, f: -0.3, pose: s05_mix('handOut', 'relaxed', s05_u(lt, tj, s05_fr(5))), expr: { eyes: 'wide', look: [-0.3, -1] } },
    extra: () => { if (land > 0 && land < 1) { ctx.save(); ctx.globalAlpha = 1 - land; ivGlow(lq[0], lq[1], 220, 'rgba(200,215,255,0.35)'); ctx.restore(); } } }));
}, { sec: 's05', title: 'Boss leaps from the crate to the top of the wall' });
{ SFX(VW('110-narrator', 'jumps'), 'swish', 0.6, -0.3); SFX(VW('110-narrator', 'wall'), 'thud', 0.8); }

// 110 — …and yowls. (Boss yowls against the moon: rings burst; the big moment starts here)
SHOT(CUT('110-narrator', 'yowls'), 's05_yowl', (lt) => {
  IV_CAM = { x: 980, y: 520, z: 1.05 + 0.08 * s05_io(lt, 0, 0.9) };
  ivStage(s05_bossCU({ x: 1000, y: 1080, s: 900, f: -1, pose: 'yowl', rings: clamp(lt / 1.1) }));
}, { sec: 's05', title: 'Boss YOWLS against the moon; rings burst' });
{ const t = VW('110-narrator', 'yowls'); SFX(t, 'gasp', 0.6); SFX(t + 0.05, 'crowd', 0.7, 0, 1.2); SFX(t, 'rise', 0.9, 0, LE('111-narrator') - t); }

// =====================================================================
//  111 — The sound goes… (crane up out of the alley: forty cats yowl, the rings rise over the roofs)
// =====================================================================
SHOT(CUT('111-narrator'), 's05_craneUp', (lt, S) => {
  const u = s05_io(lt, 0, s05_len(S)); IV_CAM = { x: 960, y: lerp(520, 120, u), z: lerp(1.05, 1.3, u) };
  ivStage(s05_alley({ boss: { pose: 'yowl', f: -1 }, kai: { x: 560, f: 0.4, expr: { eyes: 'wide', mouth: 'o', look: [0.3, -1] } }, yowl: clamp(lt / 0.7),
    extra: () => s05_rings(940, 300, 1400, clamp(lt / 1.3), { n: 5, w: 9 }) }));
}, { sec: 's05', title: 'crane up: the whole wall yowls, rings rise over the roofs' });
{ const t = CUT('111-narrator'); SFX(t, 'whoosh', 0.7); SFX(t + 0.2, 'crowd', 0.8, 0, 1.4); }

// 111 — from roof to roof (two near roofs: a cat answers the call, the ring jumps the gap)
SHOT(CUT('111-narrator', 'roof', 1), 's05_roofToRoof', (lt) => {
  IV_CAM = { x: lerp(560, 860, s05_io(lt, 0, 1)), y: 640, z: 1.9 };
  ivStage(s05_roofs({ cats: 6, yowl: 0, from: [600, 900], rings: false, act: () => {
    const ca = [430, 900], cb = [1290, 900 - 40 / 1];
    s05_cat(ca[0], ca[1], 200, { ...CATS.alley[1], key: 's05rA' }, { f: 1, pose: 'yowl' });
    s05_rings(ca[0] + 90, ca[1] - 120, 900, clamp(lt / 0.8), { n: 4, dir: 0, spread: 0.6, w: 7 });
    const ans = lt > 0.45; s05_cat(cb[0], cb[1], 200, { ...CATS.alley[5], key: 's05rB' }, { f: -1, pose: ans ? 'yowl' : 'sit', expr: { eyes: ans ? 'open' : 'wide' } });
    if (ans) s05_rings(cb[0] + 200, cb[1] - 120, 600, clamp((lt - 0.45) / 0.6), { n: 3, dir: 0, spread: 0.8, w: 6 });
  } }));
}, { sec: 's05', title: 'roof to roof: a cat yowls, the next one answers across the gap' });
{ SFX(VW('111-narrator', 'roof', 1), 'swish', 0.6, -0.4); SFX(VW('111-narrator', 'roof', 2), 'gasp', 0.45, 0.4); }

// 111 — street to street (a night street: cats in the windows and on a car roof yowl, rings down the street)
SHOT(CUT('111-narrator', 'street', 1), 's05_streetToStreet', (lt) => {
  IV_CAM = { x: lerp(820, 1020, s05_io(lt, 0, 1.2)), y: 520, z: 1.1 };
  ivStage(SET_street({ t: 'night', cats: true, act: () => {
    s05_cat(1240, GROUND, 170, { ...CATS.alley[3], key: 's05sA' }, { f: -1, pose: 'yowl' });
    s05_rings(1150, 790, 1100, clamp(lt / 1.1), { n: 4, w: 8 });
    s05_rings(700, 520, 700, clamp((lt - 0.25) / 0.9), { n: 3, w: 5, a: 0.7 });
  } }));
}, { sec: 's05', title: 'street to street: cats in windows yowl, rings run down the street' });
{ SFX(VW('111-narrator', 'street', 1), 'whoosh', 0.55, 0.3); SFX(VW('111-narrator', 'street', 2), 'crowd', 0.6, 0, 0.8); }

// 111 — across the whole city. (THE big sweep over the roofs: cats appear outward, every one yowling)
SHOT(CUT('111-narrator', 'across'), 's05_citySweep', (lt, S) => {
  const L = s05_len(S), u = s05_io(lt, 0, L); IV_CAM = { x: lerp(300, 1650, u), y: lerp(700, 380, u), z: lerp(1.0, 1.3, u) };
  ivStage(s05_roofs({ cats: lerp(8, 60, clamp(lt / (L * 0.8))), yowl: 1, from: [300, 700] }));
}, { sec: 's05', title: 'the big sweep across the roofs: the yowl spreads cat to cat' });
{ const t = CUT('111-narrator', 'across'); SFX(t, 'whoosh', 0.8, -0.5); SFX(t + 0.3, 'crowd', 1.0, 0, LE('111-narrator') - t + 0.4); }

// =====================================================================
//  112 — Forty cats. (the whole wall yowling; 40 counts up and lands on "Forty")
// =====================================================================
SHOT(CUT('112-narrator'), 's05_forty', (lt, S) => {
  // low against the sky: the whole wall yowls, the rings rise out of Boss into the moon
  IV_CAM = { x: 960, y: 470, z: 1.12 + 0.06 * s05_io(lt, 0, 1.2) };
  ivStage(s05_low({ boss: { pose: 'yowl', f: -1 }, yowl: 1, moon: [1240, 170], extra: () => s05_rings(900, 300, 1100, 1, { loop: 0.8, n: 4, w: 7, a: 0.7 }) }));
  s05_bigNum(String(ivCount(S.t0, VWE('112-narrator', 'forty'), 0, 40)), 960, 640, 230, ivPop(S.t0), { sub: 'CATS' });
}, { sec: 's05', title: '40: the wall yowls' });
{ SFX(CUT('112-narrator'), 'crowd', 0.9, 0, 1.3); SFX(VWE('112-narrator', 'forty'), 'impact', 0.55); }

// 113 — Then a hundred. (the city map: the wave spreads from the garage; 100 lands on "hundred")
SHOT(CUT('113-narrator'), 's05_hundred', (lt, S) => {
  IV_CAM = { x: lerp(560, 760, s05_io(lt, 0, 1.4)), y: 560, z: 1.55 };
  const te = VWE('113-narrator', 'hundred');
  s05_map(lerp(0.12, 0.42, clamp((TT - S.t0) / (te - S.t0))), { count: ivCount(S.t0, te, 40, 100) });
  s05_bigNum(String(ivCount(S.t0, te, 40, 100)), 1500, 380, 190, ivPop(S.t0), { sub: 'CATS' });
}, { sec: 's05', title: 'the city map: the wave spreads; 100' });
{ SFX(CUT('113-narrator'), 'whoosh', 0.5); SFX(CUT('113-narrator') + 0.1, 'crowd', 1.0, 0, 1.3); SFX(VWE('113-narrator', 'hundred'), 'impact', 0.65); }

// 114 — Then hundreds. (pull back: the whole map lights up; HUNDREDS)
SHOT(CUT('114-narrator'), 's05_hundreds', (lt, S) => {
  IV_CAM = { x: 960, y: 560, z: lerp(1.35, 0.95, s05_io(lt, 0, 1.4)) };
  const te = VWE('114-narrator', 'hundreds');
  s05_map(lerp(0.42, 1, clamp((TT - S.t0) / (te - S.t0 + 0.4))), { count: ivCount(S.t0, te + 0.3, 100, 640) });
  s05_bigNum('HUNDREDS', 960, 560, 170, ivPop(VW('114-narrator', 'hundreds')), { sub: 'OF CATS · ONE MESSAGE' });
}, { sec: 's05', title: 'pull back: the whole city lights up; HUNDREDS' });
{ SFX(CUT('114-narrator'), 'crowd', 1.3, 0, 2.2); SFX(VW('114-narrator', 'hundreds'), 'shimmer', 0.6); SFX(VW('114-narrator', 'hundreds'), 'impact', 0.8); }

// =====================================================================
//  115 — A message passing… (low on a parapet: the ring rolls over a line of cats, each turns as it passes)
// =====================================================================
SHOT(CUT('115-narrator'), 's05_relay', (lt) => {
  IV_CAM = { x: lerp(700, 1200, s05_io(lt, 0, 1.1)), y: 660, z: 1.75 };
  ivStage(s05_roofs({ cats: 20, yowl: 0.4, from: [1600, 400], act: () => {
    const wx = lerp(100, 2000, clamp(lt / 1.0));
    for (let i = 0; i < 5; i++) { const x = 300 + i * 330, hit = wx > x; s05_cat(x, 900, 170, { ...CATS.alley[(i + 2) % 7], key: 's05rl' + i }, { f: hit ? 1 : -1, pose: hit && wx - x < 350 ? 'yowl' : 'sit', expr: { eyes: hit ? 'open' : 'half' } }); }
    s05_rings(wx, 720, 380, 0.6, { n: 3, w: 8 });
  } }));
}, { sec: 's05', title: 'the message passes cat to cat along the parapet' });
{ SFX(CUT('115-narrator') + 0.1, 'whoosh', 0.7, -0.6); SFX(CUT('115-narrator') + 0.6, 'swish', 0.5, 0.5); }

// 115 — faster than any phone. (a phone on the ledge: "Sending…" spins; the ring blows past it)
SHOT(CUT('115-narrator', 'faster'), 's05_phone', (lt) => {
  IV_CAM = { x: 1100, y: 480, z: 1.5 }; IV_FOCUS = 0.7;
  const L = s05_roofs({ cats: 40, yowl: 1, from: [900, 500], fg: false });
  L.push({ d: 0.7, blur: 0, draw: () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ivBox(-100, 860, 2200, 260, 0.06, [960, 200], { front: '#2c3250', top: '#4a5274', side: '#1e2238', line: 'rgba(200,215,255,0.5)' });
    P_phone(900, 560, 9, { ang: -0.12, screen: (w, h) => { P_phoneUI.message(w, h, { from: 'NEIGHBOURS', text: 'Has anyone seen Lily? Yellow coat, red balloon', stamp: 'Sending…', mine: true });
      ctx.save(); ctx.translate(w / 2, 600); ctx.rotate(TT * 6); ctx.beginPath(); ctx.arc(0, 0, 34, 0, 4.4); ctx.lineWidth = 8; ctx.strokeStyle = '#9fb0d8'; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
      ivRR(w - 90, 22, 14, 10, 2, '#9fb0d8'); ivRR(w - 72, 18, 14, 14, 2, 'rgba(159,176,216,0.3)'); ivRR(w - 54, 12, 14, 20, 2, 'rgba(159,176,216,0.3)'); } });
    s05_rings(1700, 380, 1800, clamp(lt / 1.2), { n: 4, w: 10 });
    ctx.restore(); } });
  ivStage(L);
}, { sec: 's05', title: 'a phone stuck on "Sending…" while the yowl blows past' });
{ SFX(VW('115-narrator', 'faster'), 'whoosh', 0.75, 0.5); SFX(VW('115-narrator', 'phone'), 'beep', 0.35, -0.2); }

// =====================================================================
//  116 — Duchess: "Small human…" (dolly into a balcony: Duchess on the rail, posh, talking)
// =====================================================================
const s05_duchessAt = { x: 1180, rail: null };
function s05_balconyScene(lt, o) {
  IV_M = IV_MOOD.extNight;
  ivStage([
    s05_nightBack('s05nbD'),
    { d: 1, draw: () => {
      s05_window(1180, 640, 360, 's05brk');
      const top = s05_balcony(1180, 860, 1000); s05_duchessAt.rail = top;
      ivCastShadow(1180, top, 200, { len: 0.5, a: 0.3, w: 0.5 });
      ivCat({ x: 1180, y: top, s: 260, f: -1, coat: CATS.duchess, pose: 'sit', expr: o.expr || { eyes: 'half' }, talk: '116-duchess', look: [-0.4, 0.5] });
      o.extra && o.extra(top);
    } },
  ]);
}
SHOT(CUT('116-duchess'), 's05_duchessWide', (lt, S) => {
  const u = s05_io(lt, 0, s05_len(S)); IV_CAM = { x: lerp(900, 1100, u), y: lerp(620, 560, u), z: lerp(1.1, 1.45, u) };
  s05_balconyScene(lt, {});
}, { sec: 's05', title: 'dolly into a balcony: Duchess on the rail, talking' });
{ SFX(CUT('116-duchess'), 'swish', 0.4); SFX(CUT('116-duchess') + 0.4, 'cloth', 0.35, 0.3); }

// 116 — yellow coat, red balloon? (Duchess close; a bubble: the yellow coat pops on "yellow", the balloon on "red")
SHOT(CUT('116-duchess', 'yellow'), 's05_duchessBubble', (lt, S) => {
  IV_CAM = { x: 1000, y: 520, z: 2.2 };
  const ty = VW('116-duchess', 'yellow'), tr = VW('116-duchess', 'red');
  s05_balconyScene(lt, { expr: { eyes: 'half' }, extra: (top) => {
    s05_bubble(820, 420, 150, 1080, top - 160, ivPop(ty) * 1, () => {
      ivMan({ who: CAST.lily, x: -10, y: 120, h: 210, f: 0.2, pose: ivPose('relaxed'), expr: { eyes: 'happy', mouth: 'smile' }, hands: 'nub' });
      if (TT >= tr) { const b = EZ.back(ivPop(tr)); ctx.save(); ctx.translate(70, 60); ctx.scale(b, b); P_balloon(0, 0, 0.75, { key: 's05bb' }); ctx.restore(); }
    });
  } });
}, { sec: 's05', title: 'Duchess close: a bubble — yellow coat, red balloon' });
{ SFX(VW('116-duchess', 'yellow'), 'pop', 0.5, -0.3); SFX(VW('116-duchess', 'red'), 'bounce', 0.4, -0.3); }

// 117 — Noodle: "I saw a balloon! It was red!" (a tiny kitten bouncing on a lit sill)
SHOT(CUT('117-noodle'), 's05_noodle', (lt) => {
  IV_M = IV_MOOD.extNight; IV_CAM = { x: 900, y: 600, z: 1.7 };
  ivStage([
    s05_nightBack('s05nbN'),
    { d: 1, draw: () => {
      s05_window(900, 760, 380, 's05brk2');
      const hop = Math.abs(Math.sin(TT * 9)) * 40, sq = 1 - 0.08 * (1 - Math.abs(Math.sin(TT * 9)));
      ivCastShadow(900, 760, 120, { len: 0.4, a: 0.3, w: 0.6 });
      ctx.save(); ctx.translate(900, 760 - hop); ctx.scale(1, sq);
      ivCat({ x: 0, y: 0, s: 230, f: 1, coat: CATS.noodle, pose: 'sit', expr: { eyes: 'wide' }, talk: '117-noodle', look: [0.6, -0.4] }); ctx.restore();
      s05_bubble(1260, 470, 120, 980, 620, ivPop(VW('117-noodle', 'balloon')), () => { P_balloon(0, 90, 0.9, { key: 's05nb' }); });
    } },
  ]);
}, { sec: 's05', title: 'Noodle bounces on a sill: "I saw a balloon! It was red!"' });
{ const t = CUT('117-noodle'); for (let i = 0; i < 4; i++) SFX(t + 0.15 + i * 0.7, 'bounce', 0.35, 0.2); SFX(VW('117-noodle', 'balloon'), 'pop', 0.45, 0.4); }

// 117 — Or a tomato! (the joke: a tomato floating on a string like a balloon)
SHOT(CUT('117-noodle', 'or'), 's05_tomato', (lt) => {
  IV_M = IV_MOOD.extNight; IV_CAM = { x: 960, y: 540, z: 1 };
  ivStage([
    s05_nightBack('s05nbT'),
    { d: 1, draw: () => { s05_tomato(960 + Math.sin(TT * 1.3) * 14, 470 - lt * 40, 150); } },
  ]);
  s05_tag('?', 1260, 300, 60, ivPop(VW('117-noodle', 'tomato')));
}, { sec: 's05', title: 'insert: a tomato on a string, floating like a balloon' });
{ SFX(VW('117-noodle', 'tomato'), 'pop', 0.6); SFX(VW('117-noodle', 'tomato') + 0.5, 'laugh', 0.3, 0.3); }

// =====================================================================
//  118 — Nobody saw her after the fair. (the fair at night, empty; a lone red balloon drifts off over the stalls)
// =====================================================================
SHOT(CUT('118-narrator'), 's05_fairEmpty', (lt) => {
  const u = s05_io(lt, 0, 2); IV_CAM = { x: 960, y: lerp(600, 500, u), z: lerp(1.15, 1.3, u) };
  ivStage(SET_fair({ t: 'dusk', crowd: 0, mood: 'extNight', act: () => P_balloon(1300 + lt * 40, 820 - lt * 160, 0.9, { free: 1, key: 's05fb' }) }));
}, { sec: 's05', title: 'the fair, empty at night; a lone balloon drifts away' });
{ SFX(CUT('118-narrator'), 'whoosh', 0.35); SFX(VW('118-narrator', 'fair'), 'paper', 0.35, 0.3); }

// 119 — The trail goes cold. (the map: the lit cats go dark from the edge in; the count falls; a cold tint)
SHOT(CUT('119-narrator'), 's05_cold', (lt, S) => {
  IV_CAM = { x: 1060, y: 520, z: 1.25 - 0.1 * s05_io(lt, 0, 1.6) };
  const u = 1 - s05_io(lt, 0.15, 1.6);
  s05_map(Math.max(0.05, u), { count: Math.round(640 * u), label: 'SEEN HER' });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(30,60,120,${0.3 * (1 - u)})`; ctx.fillRect(0, 0, W, H); ctx.restore();
  s05_bigNum('0', 960, 560, 200, ivPop(VW('119-narrator', 'cold')), { c: '#cfe0ff', glow: 'rgba(120,160,255,0.7)', sub: 'SAW HER' });
}, { sec: 's05', title: 'the map goes dark; the trail goes cold' });
{ SFX(CUT('119-narrator') + 0.15, 'drop', 0.6); SFX(VW('119-narrator', 'cold'), 'thud', 0.5); }

// [BEAT 2 s] — Kai alone in the empty alley, on a crate; the wall is bare; slow dolly out
SHOT(LE('119-narrator') + 0.6, 's05_alone', (lt) => {
  // the reverse from the bare wall top: Kai small on a crate in the empty alley, the lit street beyond; slow dolly out
  IV_CAM = { x: 900, y: 560, z: 1.38 - 0.28 * s05_io(lt, 0, 2.6) };
  ivStage(s05_rev({ kai: { X: -260, D: 1.65, f: 0.35, crate: true, pose: ivPose('slump'), expr: { eyes: 'tired', brow: 'sad', mouth: 'flat', look: [0, 1] } } }));
}, { sec: 's05', title: '[beat] Kai alone on a crate; the wall is empty' });
{ const t = LE('119-narrator') + 0.6; SFX(t, 'whoosh', 0.35, -0.4); SFX(t + 1.1, 'drip', 0.4, 0.4); }

// P_soundRings with a guard: its inner highlight ring goes to a negative radius while a ring is tiny
function s05_rings(x, y, r, u, o) {
  const c = ctx, arc = c.arc; c.arc = function (ax, ay, ar, ...rest) { return arc.call(this, ax, ay, Math.max(0, ar), ...rest); };
  try { P_soundRings(x, y, r, u, o); } finally { delete c.arc; }
}
