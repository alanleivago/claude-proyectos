// =====================================================================
//  SETS 2 — the EXTERIORS (see SETS_API.md). SET_x(o) sets IV_M and returns the ivStage layers.
//  Common options: o.act() draws the actors on the d = 1 plane (between the set's back and front pieces), o.front()
//  after the front pieces, o.fg === false drops the soft foreground, o.t = variant, o.mood overrides the mood.
//  GROUND = 900 is the floor at d = 1. Built in true one-point perspective: ext_proj(vx, vy) gives P(X, Y, D) — world
//  X across (px at the actors' plane, 0 = the vanishing point), Y up from the ground, D depth (1 = the actors' plane,
//  2 = twice as far; 1 D ≈ 2000 world px). Positions per set in SET_POS2 (SET_POS belongs to sets.js).
//  Helpers are ext_*.
// =====================================================================
IV_MOOD.extDay = { rim: '#fff0d4', key: [0.85, -0.45], tint: 'rgba(150,170,200,0.05)', haze: '#c9d0da', vig: 0.40 };
IV_MOOD.extDusk = { rim: '#ffb27a', key: [-0.8, -0.35], tint: 'rgba(110,50,90,0.12)', haze: '#a0607a', vig: 0.55 };
IV_MOOD.extNight = { rim: '#9fbaff', key: [0.6, -0.5], tint: 'rgba(20,30,70,0.16)', haze: '#2a3658', vig: 0.62 };
IV_MOOD.extPolice = { rim: '#a9b8ff', key: [0.6, -0.5], tint: 'rgba(20,25,60,0.14)', haze: '#262c4a', vig: 0.62 };
IV_MOOD.extFair = { rim: '#ffe2b0', key: [0.7, -0.55], tint: 'rgba(255,190,130,0.05)', haze: '#e9c9a2', vig: 0.42 };
IV_MOOD.extFairDusk = { rim: '#ffb070', key: [-0.7, -0.4], tint: 'rgba(120,50,80,0.12)', haze: '#8a4a5a', vig: 0.55 };
IV_MOOD.extAlley = { rim: '#a9c4ff', key: [-0.6, -0.6], tint: 'rgba(15,25,60,0.18)', haze: '#1e2746', vig: 0.70 };
IV_MOOD.extRoofs = { rim: '#b8c8ff', key: [0.7, -0.55], tint: 'rgba(15,25,60,0.16)', haze: '#1e2746', vig: 0.64 };
IV_MOOD.extYard = { rim: '#c8d8ff', key: [0.7, -0.6], tint: 'rgba(20,30,60,0.14)', haze: '#26304e', vig: 0.66 };
IV_MOOD.extMorning = { rim: '#ffd6a0', key: [-0.85, -0.35], tint: 'rgba(255,200,150,0.06)', haze: '#e8c8a8', vig: 0.45 };
const SET_POS2 = {};

// ---------------------------------------------------------------------
//  projection + volumes
// ---------------------------------------------------------------------
// P(X, Y, D) → [x, y] on any layer in base framing. P.D(y) = depth of a ground y; P.h(D) = a 520-px actor's height at D
function ext_proj(vx, vy) {
  const e = GROUND - vy, P = (X, Y, D) => [vx + X / D, vy + (e - Y) / D];
  P.vp = [vx, vy]; P.eye = e; P.D = (y) => e / Math.max(1, y - vy); P.X = (x, D) => (x - vx) * D; P.h = (D, h = 520) => h / D;
  return P;
}
const ext_mix = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
// a box in world space: X0..X1 across, Y0..Y1 up, D0 (near face) .. D1. Draws the faces the eye can see.
// o.col front colour (o.side / o.top override), o.edge rim line on the near top edge, o.flat: no gradient.
// returns mappers F(u, v) front, S(u, v) the visible side (u 0 near → 1 far), T(u, w) top (u depth, w across)
function ext_box(P, X0, X1, Y0, Y1, D0, D1, o = {}) {
  const fr = o.col || '#8a7a6a', sd = o.side || ivShade(fr, -0.3), tp = o.top || ivShade(fr, 0.16);
  const sideX = X0 > 0 ? X0 : X1 < 0 ? X1 : null;
  const F = (u, v) => P(lerp(X0, X1, u), lerp(Y0, Y1, v), D0);
  const S = sideX == null ? null : (u, v) => P(sideX, lerp(Y0, Y1, v), lerp(D0, D1, u));
  const T = (u, w) => P(lerp(X0, X1, w), Y1, lerp(D0, D1, u)), Bt = (u, w) => P(lerp(X0, X1, w), Y0, lerp(D0, D1, u));
  if (S && o.noSide !== true) { ivPoly([S(0, 0), S(1, 0), S(1, 1), S(0, 1)], sd);
    if (!o.flat) { const a = S(0, 0.5), b = S(1, 0.5), g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.28)'); ivPoly([S(0, 0), S(1, 0), S(1, 1), S(0, 1)], g); } }
  if (Y1 < P.eye && o.noTop !== true) ivPoly([T(0, 0), T(0, 1), T(1, 1), T(1, 0)], tp);
  else if (Y0 > P.eye) ivPoly([Bt(0, 0), Bt(0, 1), Bt(1, 1), Bt(1, 0)], o.under || ivShade(fr, -0.45));
  const q = [F(0, 0), F(1, 0), F(1, 1), F(0, 1)];
  ivPoly(q, fr);
  if (!o.flat) { const g = ctx.createLinearGradient(0, q[2][1], 0, q[0][1]); g.addColorStop(0, 'rgba(255,255,255,0.07)'); g.addColorStop(1, 'rgba(0,0,0,0.2)'); ivPoly(q, g); }
  if (o.edge !== false && Y1 < P.eye + 200) ivLine(...q[3], ...q[2], Math.max(1.2, 3 / D0), o.edge || 'rgba(255,240,220,0.3)');
  return { F, S, T, sideX };
}
// a quad on a face mapper (window, door, sign, puddle)
const ext_q = (m, u0, u1, v0, v1, fill, stroke, lw) => ivPoly([m(u0, v0), m(u1, v0), m(u1, v1), m(u0, v1)], fill, stroke, lw);
// a grid of windows on a face: nu × nv, margins; lit 0..1 share lit (night), key for the random pattern
function ext_windows(m, nu, nv, o = {}) {
  const r = RNG(o.key || 'w').f, mu = o.mu ?? 0.12, mv = o.mv ?? 0.12, v0 = o.v0 ?? 0.08, v1 = o.v1 ?? 0.95;
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = i / nu, b = (i + 1) / nu, c = lerp(v0, v1, j / nv), d = lerp(v0, v1, (j + 1) / nv);
    const lit = r() < (o.lit ?? 0), u0 = a + (b - a) * mu, u1 = b - (b - a) * mu, w0 = c + (d - c) * mv * 1.6, w1 = d - (d - c) * mv;
    const tv = o.tv && r() < 0.15;
    const col = lit ? (tv ? `rgba(140,180,255,${0.75 + 0.25 * Math.sin(TT * 7 + i * 3 + j)})` : o.litCol || '#ffcd7a') : o.glass || 'rgba(40,52,80,0.55)';
    ext_q(m, u0, u1, w0, w1, col);
    if (!lit && o.sheen !== false) ivPoly([m(u0, w1), m(lerp(u0, u1, 0.45), w1), m(u0, lerp(w0, w1, 0.4))], 'rgba(255,255,255,0.09)');
    if (o.frame) ext_q(m, u0, u1, w0, w1, null, o.frame, o.fw || 2);
    if (lit && o.shade !== false && r() < 0.5) ext_q(m, u0, u1, lerp(w0, w1, 0.62), w1, 'rgba(120,60,30,0.35)');
    if (o.each) o.each(i, j, u0, u1, w0, w1, lit);
  }
}
// ---------------------------------------------------------------------
//  sky, moon, stars, fog
// ---------------------------------------------------------------------
function ext_sky(stops, y0 = -500, y1 = 900) { ctx.fillStyle = ivVGrad(y0, y1, stops); ctx.fillRect(-2000, -1000, 6000, 3200); }
function ext_moon(x, y, r, a = 1) {
  ivGlow(x, y, r * 8, 'rgba(170,190,255,0.30)', a); ivDot(x, y, r, '#eef2fb');
  ctx.save(); ctx.globalAlpha = 0.18; ivDot(x - r * 0.3, y - r * 0.2, r * 0.22, '#9aa6c4'); ivDot(x + r * 0.35, y + r * 0.3, r * 0.15, '#9aa6c4'); ivDot(x + r * 0.1, y - r * 0.45, r * 0.1, '#9aa6c4'); ctx.restore();
}
function ext_stars(key, n, box = [-900, -400, 2900, 420]) {
  const r = RNG(key).f; ctx.save();
  for (let i = 0; i < n; i++) { const x = lerp(box[0], box[2], r()), y = lerp(box[1], box[3], r()), s = 0.8 + r() * 1.8, tw = 0.55 + 0.45 * Math.sin(TT * (1 + r() * 2) + i);
    ctx.globalAlpha = tw * (0.4 + r() * 0.6); ivDot(x, y, s, '#e8eeff'); }
  ctx.restore();
}
// drifting clouds (soft ellipses), sp px/s
function ext_clouds(key, n, y0, y1, col, sp = 6, box = [-1200, 3200]) {
  const r = RNG(key).f; ctx.save();
  for (let i = 0; i < n; i++) { const w = 160 + r() * 260, x = box[0] + mod(r() * (box[1] - box[0]) + TT * sp * (0.6 + r() * 0.8), box[1] - box[0]), y = lerp(y0, y1, r());
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.16, 0, 0, TAU); ctx.ellipse(x + w * 0.3, y - w * 0.08, w * 0.45, w * 0.14, 0, 0, TAU); ctx.ellipse(x - w * 0.35, y - w * 0.05, w * 0.4, w * 0.12, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}
// a fog band: soft horizontal strips that drift (a light veil over a layer)
function ext_fog(y, h, col, a, key = 'fog', sp = 14) {
  const r = RNG(key).f; ctx.save();
  for (let i = 0; i < 5; i++) { const w = 900 + r() * 900, x = -1500 + mod(r() * 4600 + TT * sp * (0.5 + r()), 4600), yy = y + (r() - 0.5) * h;
    ctx.save(); ctx.translate(x, yy); ctx.scale(1, 0.18);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(-w, -w, w * 2, w * 2); ctx.restore(); }
  ctx.restore();
}
// a far skyline of flat silhouettes with a few lit windows (d 4+ layers)
function ext_skyline(key, base, col, o = {}) {
  const r = RNG(key).f; let x = -1500;
  while (x < 3500) { const w = 90 + r() * 200, h = (o.h0 ?? 80) + r() * (o.h1 ?? 260); ivRR(x, base - h, w, h + 900, 0, col);
    if (r() < 0.25) ivLine(x + w * 0.5, base - h, x + w * 0.5, base - h - 40 - r() * 60, 3, col);
    if (o.lit) for (let k = 0; k < 6; k++) if (r() < o.lit) { const wx = x + 10 + r() * (w - 24), wy = base - h + 14 + r() * (h - 30); ivRR(wx, wy, 8, 10, 1, o.litCol || '#ffcf7a'); }
    x += w + r() * 14; }
}
// ---------------------------------------------------------------------
//  the street plane: road between road[0]..road[1], sidewalks out to walk[0]..walk[1] (facade lines)
//  o: { road, walk, cRoad, cWalk, cCurb, dash (X of the centre line), wet, tiles, Dn, Df }
// ---------------------------------------------------------------------
function ext_ground(P, o) {
  const Dn = o.Dn ?? 0.32, Df = o.Df ?? 90, [ra, rb] = o.road, [wa, wb] = o.walk;
  const strip = (X0, X1, c) => ivPoly([P(X0, 0, Dn), P(X1, 0, Dn), P(X1, 0, Df), P(X0, 0, Df)], c);
  strip(wa - 4000, wb + 4000, o.cWalk); strip(ra, rb, o.cRoad);
  // depth tone: the road darkens toward the camera, hazes toward the horizon
  const hz = P(0, 0, 14)[1], g = ctx.createLinearGradient(0, P.vp[1], 0, P(0, 0, Dn)[1]);
  g.addColorStop(0, o.haze || 'rgba(200,210,230,0.35)'); g.addColorStop(Math.min(0.95, (hz - P.vp[1]) / (P(0, 0, Dn)[1] - P.vp[1]) + 0.05), 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.18)');
  ivPoly([P(wa - 4000, 0, Dn), P(wb + 4000, 0, Dn), P(wb + 4000, 0, Df), P(wa - 4000, 0, Df)], g);
  // curbs: a lit edge + a shadow line, both converge
  for (const X of [ra, rb]) { ivPoly([P(X, 0, Dn), P(X + (X < 0 ? 26 : -26), 0, Dn), P(X + (X < 0 ? 26 : -26), 0, Df), P(X, 0, Df)], o.cCurb || 'rgba(230,225,215,0.55)'); ivAO(...P(X, 0, Dn), ...P(X, 0, Df), 10, 0.25); }
  // sidewalk slabs: across lines at even world steps, plus lines along
  if (o.tiles !== false) {
    for (let D = Dn; D < 12; D += 0.11) { for (const [A, Bx] of [[wa - 4000, ra], [rb, wb + 4000]]) ivLine(...P(A, 0, D), ...P(Bx, 0, D), Math.max(0.8, 2 / D), o.tileCol || 'rgba(0,0,0,0.13)', 'butt'); }
    for (const X of [ra - 300, ra - 600, rb + 300, rb + 600]) ivLine(...P(X, 0, Dn), ...P(X, 0, Df), 1.5, o.tileCol || 'rgba(0,0,0,0.1)', 'butt');
  }
  // the centre dashes (each 3 m with 6 m gaps, so they shorten toward the horizon)
  if (o.dash != null) for (let D = 0.2; D < 40; D += 0.45) { const w = 14; ivPoly([P(o.dash - w, 0, D), P(o.dash + w, 0, D), P(o.dash + w, 0, D + 0.15), P(o.dash - w, 0, D + 0.15)], o.dashCol || 'rgba(242,232,200,0.85)'); }
  // wet asphalt: streaks of light under the lamps/windows (night)
  if (o.wet) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [X, D, c] of o.wet) { const a = P(X - 40, 0, D), b = P(X + 40, 0, D), e = P(X, 0, D * 0.55);
    const gg = ctx.createLinearGradient(a[0], a[1], e[0], e[1]); gg.addColorStop(0, c); gg.addColorStop(1, 'rgba(0,0,0,0)'); ivPoly([a, b, [e[0] + 30, e[1]], [e[0] - 30, e[1]]], gg); } ctx.restore(); }
}
// a streetlamp at (X, D): pole, arm toward the road (dir), head; on → glow, cone, light pool
function ext_lamp(P, X, D, on, o = {}) {
  const dir = o.dir ?? (X < 0 ? 1 : -1), H = o.H ?? 1250, base = P(X, 0, D), top = P(X, H, D), head = P(X + dir * 220, H - 30, D), s = 1 / D;
  const pc = o.col || '#2b2e38';
  ivLine(base[0], base[1], top[0], top[1], 16 * s, pc, 'butt'); ivRR(base[0] - 14 * s, base[1] - 70 * s, 28 * s, 70 * s, 4 * s, pc);
  ctx.beginPath(); ctx.moveTo(...top); ctx.quadraticCurveTo(top[0] + dir * 30 * s, top[1] - 40 * s, head[0], head[1] - 6 * s); ctx.lineWidth = 9 * s; ctx.strokeStyle = pc; ctx.stroke();
  ivRR(head[0] - 44 * s, head[1] - 12 * s, 88 * s, 22 * s, 8 * s, pc);
  if (on) {
    const fl = o.flicker ? (Math.sin(TT * 37 + X) > 0.93 ? 0.35 : 1) : 1, pool = [P(X + dir * 220 - 380, 0, D - 0.12), P(X + dir * 220 + 380, 0, D - 0.12), P(X + dir * 220 + 300, 0, D + 0.16), P(X + dir * 220 - 300, 0, D + 0.16)];
    ivRR(head[0] - 30 * s, head[1] + 6 * s, 60 * s, 8 * s, 3 * s, o.bulb || '#ffe0a0');
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fl;
    const g = ctx.createLinearGradient(head[0], head[1], head[0], base[1]); g.addColorStop(0, o.cone || 'rgba(255,200,120,0.22)'); g.addColorStop(1, 'rgba(255,200,120,0)');
    ivPoly([[head[0] - 30 * s, head[1] + 8 * s], [head[0] + 30 * s, head[1] + 8 * s], pool[1], pool[0]], g); ctx.restore();
    ctx.save(); ctx.globalAlpha = fl; ivLightPool(pool, o.pool || 'rgba(255,200,130,0.16)'); ivGlow(head[0], head[1] + 6 * s, 160 * s, o.glow || 'rgba(255,210,140,0.7)'); ctx.restore();
  }
}
// a car as two boxes along the street (parked or driving). o: { col, w, len, toward (front faces the camera), lights, night, brake }
function ext_car(P, X, D, o = {}) {
  const w = o.w ?? 560, L = o.len ?? 0.66, col = o.col || '#3d5f8a', x0 = X - w / 2, x1 = X + w / 2;
  ivPoly([P(x0 - 40, 0, D - 0.04), P(x1 + 40, 0, D - 0.04), P(x1 + 40, 0, D + L + 0.04), P(x0 - 40, 0, D + L + 0.04)], 'rgba(0,0,0,0.32)');   // the shadow under it
  // wheels on the visible side (an ellipse foreshortened by depth)
  const side = x0 > 0 ? x0 : x1 < 0 ? x1 : null, wheel = (u) => { if (side == null) return; const Dw = D + L * u, a = P(side, 110, Dw - 0.05), b = P(side, 110, Dw + 0.05), c = P(side, 0, Dw);
    ctx.beginPath(); ctx.ellipse((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.max(2, Math.abs(b[0] - a[0]) / 2 + 3 / Dw), Math.abs(c[1] - a[1]), 0, 0, TAU); ctx.fillStyle = '#121216'; ctx.fill(); };
  const body = ext_box(P, x0, x1, 70, 270, D, D + L, { col, edge: o.night ? 'rgba(170,190,255,0.3)' : undefined });
  wheel(0.2); wheel(0.8);
  const cab = ext_box(P, x0 + 50, x1 - 50, 270, 450, D + L * 0.22, D + L * 0.72, { col: ivShade(col, -0.08), top: ivShade(col, 0.1) });
  ext_q(cab.F, 0.08, 0.92, 0.12, 0.88, o.night ? '#1a2238' : 'rgba(150,180,210,0.85)'); ivPoly([cab.F(0.15, 0.88), cab.F(0.4, 0.88), cab.F(0.2, 0.3)], 'rgba(255,255,255,0.18)');
  if (cab.S) { ext_q(cab.S, 0.08, 0.92, 0.15, 0.85, o.night ? '#151c30' : 'rgba(120,150,180,0.8)'); ext_q(cab.S, 0.48, 0.52, 0.15, 0.85, ivShade(col, -0.3)); }
  if (body.S) ivPoly([body.S(0.05, 0.75), body.S(0.95, 0.75), body.S(0.95, 0.8), body.S(0.05, 0.8)], 'rgba(255,255,255,0.12)');
  // the near face: tail lights (or head lights), plate, bumper; front wheels peek out under it
  for (const u of [0.04, 0.96]) { const p = body.F(u, 0); ivRR(p[0] - 30 / D, p[1] - 6 / D, 60 / D, 26 / D, 8 / D, '#121216'); }
  const lamp = o.toward ? '#fff3cf' : o.brake ? '#ff4030' : '#c8352e';
  ext_q(body.F, 0.04, 0.2, 0.5, 0.72, lamp); ext_q(body.F, 0.8, 0.96, 0.5, 0.72, lamp); ext_q(body.F, 0.38, 0.62, 0.22, 0.4, '#e8e4d4');
  ext_q(body.F, 0, 1, 0, 0.14, '#1e1e24');
  if (o.lights || o.brake || o.toward && o.night) { const a = body.F(0.12, 0.6), b = body.F(0.88, 0.6), c = o.toward ? 'rgba(255,240,200,0.8)' : 'rgba(255,60,40,0.7)'; ivGlow(a[0], a[1], 90 / D, c); ivGlow(b[0], b[1], 90 / D, c); }
  return body;
}
// a passer-by at depth D (walking along the depth when o.walk = 'away' | 'toward', across when 'left' | 'right')
function ext_person(P, who, X, D, o = {}) {
  const h = (o.h ?? 520) / D, p = P(X, 0, D), mv = o.walk;
  let pose = o.pose ? ivPose(o.pose) : ivPose('relaxed'), f = o.f ?? 0.3;
  if (mv) { const w = ivWalk(o.t0 ?? -hash(who.key) % 7, 0, h, 1, o.fps ?? 6); pose = w.pose; f = mv === 'away' ? -0.15 : mv === 'toward' ? 0.15 : mv === 'left' ? -0.9 : 0.9; }
  if (o.shadow !== false) ivCastShadow(p[0], p[1], h, { a: o.sa ?? 0.28, len: 0.8 });
  ivMan({ who, x: p[0], y: p[1], h, f, pose, expr: o.expr || { eyes: 'open', mouth: 'flat' }, hold: o.hold });
}
// a looping walker along the depth: D goes D0→D1 (or back) at sp D/s; returns its D for depth sorting
const ext_loopD = (D0, D1, sp, key) => { const len = Math.abs(D1 - D0) / sp, u = mod(TT / len + (hash(key) % 100) / 100, 1); return lerp(D0, D1, u); };
// a street tree at (X, D): trunk, a cloud canopy that sways; o.night darkens it
function ext_tree(P, X, D, o = {}) {
  const b = P(X, 0, D), t = P(X, 900, D), s = 1 / D, r = RNG('tree', X, D).f, sw = Math.sin(TT * 0.9 + X) * 6 * s;
  ivPoly([[b[0] - 18 * s, b[1]], [b[0] + 18 * s, b[1]], [t[0] + 10 * s, t[1]], [t[0] - 10 * s, t[1]]], o.trunk || '#4a3628');
  const cols = o.cols || ['#4f7a48', '#5f8c52', '#6f9c5c'];
  for (let i = 0; i < 9; i++) { const a = r() * TAU, rr = (120 + r() * 140) * s; ivDot(t[0] + Math.cos(a) * 170 * s + sw * (1 + i * 0.1), t[1] - 120 * s + Math.sin(a) * 120 * s, rr, cols[i % 3]); }
  ivGlow(t[0] + IV_M.key[0] * 120 * s, t[1] - 180 * s, 220 * s, 'rgba(255,240,200,0.12)');
}
// a pigeon (side view) pecking: x, y ground, s ≈ 40 at d 1
function ext_pigeon(x, y, s, key, f = 1) {
  const ph = mod(TT * 1.3 + (hash(key) % 50) / 17, 2), peck = ph < 0.25 ? Math.sin(ph / 0.25 * Math.PI) : 0, hop = ph > 1.4 && ph < 1.55 ? Math.sin((ph - 1.4) / 0.15 * Math.PI) * 0.25 : 0;
  ctx.save(); ctx.translate(x + (ph > 1.4 ? (Math.min(ph, 1.55) - 1.4) * 60 * f * s / 40 : 0), y - hop * s); ctx.scale(f * s / 40, s / 40);
  ctx.beginPath(); ctx.ellipse(0, -14, 18, 11, -0.15, 0, TAU); ctx.fillStyle = '#7f8594'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(-16, -16, 12, 5, -0.3, 0, TAU); ctx.fillStyle = '#5c6170'; ctx.fill();
  ctx.save(); ctx.translate(12, -20); ctx.rotate(peck * 1.1); ivDot(4, -6, 7.5, '#6b7080'); ivDot(6, -2, 5, 'rgba(110,160,140,0.8)'); ivDot(6.5, -8, 1.6, '#f2a23a'); ivPoly([[11, -7], [17, -5.5], [11, -4.5]], '#c99a6a'); ctx.restore();
  ivLine(-2, -4, -3, 2, 1.6, '#c8665a'); ivLine(4, -4, 5, 2, 1.6, '#c8665a');
  ctx.restore();
}
// ---------------------------------------------------------------------
//  a row of buildings along one side of a street, far → near. o: { X (facade line), deep (how far back), segs: [D…],
//  key, cols, h: [min, max], shops (ground-floor shops with awnings), lit (night share), house (pitched roofs, gaps),
//  winCat (calls winCat(x, y, s, D, key) for some lit/dark windows: cats watching) }
// ---------------------------------------------------------------------
function ext_row(P, o) {
  const r = RNG('row' + o.key).f, R = o.X > 0, segs = o.segs, out = [];
  for (let i = 0; i < segs.length - 1; i++) { const H = lerp(o.h[0], o.h[1], r()), c = o.cols[Math.floor(r() * o.cols.length)], gap = o.house ? 0.06 + r() * 0.05 : 0; out.push({ D0: segs[i] + gap, D1: segs[i + 1], H, c, k: i, setback: o.house ? r() * 120 : 0 }); }
  for (let i = out.length - 1; i >= 0; i--) {
    const b = out[i], Xf = o.X + (R ? b.setback : -b.setback), X0 = R ? Xf : Xf - o.deep, X1 = R ? Xf + o.deep : Xf;
    const bx = ext_box(P, X0, X1, 0, b.H, b.D0, b.D1, { col: b.c, side: ivShade(b.c, R ? -0.12 : -0.05), edge: o.edge });
    const floors = Math.max(1, Math.floor(b.H / 330)), nu = Math.max(1, Math.round((b.D1 - b.D0) / 0.13)), g0 = o.shops ? 330 / b.H : 0.06;
    if (bx.S) ext_windows(bx.S, nu, floors - (o.shops ? 1 : 0), { key: o.key + i, v0: g0 + 0.04, v1: 0.94, lit: o.lit, tv: o.lit > 0, glass: o.glass, frame: o.frame, mu: 0.2, mv: 0.18,
      each: o.winCat ? (ii, jj, u0, u1, w0, w1, lit) => { if (hash(o.key, i, ii, jj) % 7 === 0) { const p = bx.S((u0 + u1) / 2, w0), D = lerp(b.D0, b.D1, (u0 + u1) / 2); o.winCat(p[0], p[1], 120 / D, D, o.key + i + '_' + ii + jj); } } : null });
    const nf = Math.max(1, Math.round((X1 - X0) / 260));
    ext_windows(bx.F, nf, floors - (o.shops ? 1 : 0), { key: o.key + 'f' + i, v0: g0 + 0.04, v1: 0.94, lit: o.lit, glass: o.glass, frame: o.frame, mu: 0.22, mv: 0.18 });
    // cornice on top
    ext_box(P, R ? X0 - 24 : X1 - 40, R ? X0 + 40 : X1 + 24, b.H, b.H + 50, b.D0 - 0.01, b.D1, { col: ivShade(b.c, -0.2), under: ivShade(b.c, -0.35), edge: false, flat: true });
    ext_box(P, X0 - 10, X1 + 10, b.H, b.H + 50, b.D0 - 0.012, b.D0 + 0.01, { col: ivShade(b.c, -0.2), under: ivShade(b.c, -0.35), edge: false, flat: true, noSide: true });
    if (o.house && bx.S) {   // a pitched roof along the depth
      const ridge = b.H + 380, m = (X0 + X1) / 2, A = (Y, X, D) => P(X, Y, D);
      ivPoly([A(b.H + 40, R ? X0 - 30 : X1 + 30, b.D0), A(ridge, m, b.D0), A(ridge, m, b.D1), A(b.H + 40, R ? X0 - 30 : X1 + 30, b.D1)], ivShade(o.roof || '#5a3e3a', 0.08));
      ivPoly([A(b.H + 40, X0 - 30, b.D0), A(ridge, m, b.D0), A(b.H + 40, X1 + 30, b.D0)], ivShade(b.c, -0.1));
      const ch = A(ridge - 60, m + (R ? 150 : -150), lerp(b.D0, b.D1, 0.7)); ivRR(ch[0] - 22 / b.D0, ch[1] - 110 / b.D0, 44 / b.D0, 120 / b.D0, 2, '#4a3434');
    }
    if (o.shops && bx.S) {   // ground floor: shop glass, an awning that sticks out over the sidewalk, a sign
      const v = 300 / b.H, aw = R ? -170 : 170, ac = o.awn ? o.awn[i % o.awn.length] : ['#c8463c', '#3c7a8a', '#d89a3a', '#5a7a4a'][i % 4];
      ext_q(bx.S, 0.08, 0.92, 0.02, v * 0.8, o.lit > 0 ? 'rgba(255,205,130,0.85)' : 'rgba(70,90,110,0.7)');
      ivPoly([bx.S(0.05, v * 0.95), bx.S(0.95, v * 0.95), P(Xf + aw, 230, lerp(b.D0, b.D1, 0.95)), P(Xf + aw, 230, lerp(b.D0, b.D1, 0.05))], ac);
      for (let s = 0; s < 6; s++) { const u0 = 0.05 + s * 0.15, u1 = u0 + 0.075; ivPoly([bx.S(u0, v * 0.95), bx.S(u1, v * 0.95), P(Xf + aw, 230, lerp(b.D0, b.D1, u1)), P(Xf + aw, 230, lerp(b.D0, b.D1, u0))], 'rgba(255,255,255,0.25)'); }
      ivAO(...bx.S(0, 0), ...bx.S(1, 0), 30 / b.D0, 0.3);
    }
    ivAO(...bx.F(0, 0), ...bx.F(1, 0), 24 / b.D0, 0.25);
  }
}
// ---------------------------------------------------------------------
//  BUS STOP — day. The approved look 2, now in true perspective: the street runs away to the left of frame,
//  shops on the right, the low wall where Duchess sits (SET_POS2.busStop.duchess), the glass shelter with a bench.
// ---------------------------------------------------------------------
SET_POS2.busStop = { vp: [1060, 470], duchess: [1250, 726], wall: [1000, 1500, 660], kai: 760, bench: [1690, 790], sign: [640, 86] };
function SET_busStop(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.extDay; const P = ext_proj(1060, 470);
  const cols = ['#c98e6a', '#b7a08a', '#9d8fb0', '#c7b48e', '#a8b8a0', '#d4a07a'];
  return [
    { d: 5, draw: () => {
      ext_sky(['#6fa6dc', '#a9cdeb', '#f0e4d2'], -600, 560); ivDot(1640, 90, 54, '#fff6dc'); ivGlow(1640, 90, 420, 'rgba(255,240,200,0.5)');
      ext_clouds('bsc', 6, -150, 220, 'rgba(255,255,255,0.75)', 5);
      ext_skyline('bss', 500, '#a9b4c8', { h0: 40, h1: 160 });
    } },
    { d: 2.2, draw: () => {
      ext_row(P, { X: -3300, deep: 900, segs: [1.6, 2.2, 3, 3.9, 5, 6.4, 8.2, 11, 15, 22], key: 'bsL', cols, h: [1100, 2300], shops: true });
      ext_row(P, { X: 900, deep: 900, segs: [0.55, 1.15, 1.9, 2.7, 3.6, 4.8, 6.4, 8.5, 12, 18], key: 'bsR', cols, h: [1300, 2600], shops: true });
    } },
    { d: 1.45, draw: () => {
      ext_ground(P, { road: [-2660, -560], walk: [-3300, 900], cRoad: '#5c5a64', cWalk: '#b9b0a4', dash: -1610, Dn: 0.36 });
      const things = [];
      for (const D of [1.6, 3, 4.6, 6.6, 9.5]) things.push({ D, f: () => ext_tree(P, -760, D) });
      for (const D of [2.3, 5.4, 9]) things.push({ D, f: () => ext_lamp(P, -2780, D, false) });
      const c1 = ext_loopD(18, 1.2, 1.4, 'bsCar1'), c2 = ext_loopD(1.4, 22, 1.1, 'bsCar2');
      things.push({ D: c1, f: () => ext_car(P, -1180, c1, { col: '#c8463c', toward: true }) }, { D: c2, f: () => ext_car(P, -2100, c2, { col: '#3d5f8a' }) });
      things.push({ D: 3.4, f: () => ext_car(P, -2380, 3.4, { col: '#e0c070' }) });
      [['extraA', -3000, 9, 2.2, 'away'], ['extraB', -2900, 2.4, 10, 'toward'], ['extraC', 350, 11, 3.2, 'toward'], ['kidB', 600, 2.8, 12, 'away']].forEach(([w, X, a, b, dir], k) => {
        const D = ext_loopD(a, b, 0.35 + k * 0.05, 'bsw' + k); things.push({ D, f: () => ext_person(P, CAST[w], X, D, { walk: dir }) }); });
      things.sort((a, b) => b.D - a.D).forEach((t) => t.f());
    } },
    { d: 1, draw: () => {
      const S = SET_POS2.busStop;
      // the bus sign at the curb
      const sb = P(-470, 0, 1.12), st = P(-470, 860, 1.12); ivLine(sb[0], sb[1], st[0], st[1], 12, '#3a4458', 'butt'); ivRR(st[0] - 52, st[1] - 20, 104, 74, 10, '#2f6fb8'); ivText('BUS', st[0], st[1] + 30, 34, '#fff');
      // the low wall (box) where Duchess sits
      const wl = ext_box(P, -40, 440, 0, 230, 1.05, 1.32, { col: '#9a8f86', top: '#c9beb2' });
      for (let k = 1; k < 4; k++) ivLine(...wl.F(k / 4, 0), ...wl.F(k / 4, 1), 2, 'rgba(0,0,0,0.12)');
      ivAO(...wl.F(0, 0), ...wl.F(1, 0), 22, 0.35);
      // the glass shelter: back panel with a lit ad, a bench, the glass, the roof slab
      const sh = (X0, X1, Y0, Y1, D0, D1, c) => ext_box(P, X0, X1, Y0, Y1, D0, D1, c);
      const back = sh(520, 940, 0, 760, 1.42, 1.44, { col: 'rgba(170,200,220,0.35)', edge: false, flat: true }); ext_q(back.F, 0.55, 0.92, 0.22, 0.8, '#f4e2c4'); ext_q(back.F, 0.59, 0.88, 0.28, 0.74, '#e58a4e'); ivText('PET', ...back.F(0.735, 0.5), 30, '#fff');
      sh(600, 900, 130, 150, 1.12, 1.38, { col: '#6a5040', top: '#8a6a52', edge: false }); sh(600, 900, 150, 380, 1.38, 1.4, { col: '#6a5040', edge: false }); for (const u of [0.08, 0.92]) { const a = P(lerp(600, 900, u), 0, 1.14), b = P(lerp(600, 900, u), 130, 1.14); ivLine(a[0], a[1], b[0], b[1], 6, '#3a4458'); }
      sh(520, 940, 0, 790, 1.0, 1.45, { col: 'rgba(180,210,230,0.18)', side: 'rgba(150,180,200,0.28)', top: '#5a6478', edge: '#e8f0f8', flat: true });
      sh(500, 960, 790, 830, 0.98, 1.47, { col: '#4a5468', top: '#6a7488' });
      for (const X of [520, 940]) { const a = P(X, 0, 1.0), b = P(X, 790, 1.0); ivLine(a[0], a[1], b[0], b[1], 8, '#3a4458', 'butt'); }
      ivPoly([P(560, 760, 1.0), P(700, 760, 1.0), P(560, 300, 1.0)], 'rgba(255,255,255,0.12)');
      ext_pigeon(...P(-260, 0, 1.25), 34, 'bsp1', 1); ext_pigeon(...P(-120, 0, 1.4), 30, 'bsp2', -1);
      o.act && o.act();
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => {
      ivLine(-180, -300, -150, 1400, 46, '#2c2a30'); ivDot(-120, -40, 230, '#3f5f3a'); ivDot(60, -110, 170, '#4f7044'); ivDot(-60, 120, 150, '#456a3e');
      ivRR(2100, 860, 260, 600, 30, '#38363c');
    } }]),
  ];
}
// ---------------------------------------------------------------------
//  PET SHOP — day. The shop front faces us (D 1.2) with a deep shop seen through the big window, the kitten display
//  on the sill (SET_POS2.petShop.window: { x0, x1, y0, y1, sill, spots }), an awning (box) above, a side street on the
//  right receding to the vanishing point. o.inside() draws inside the window (behind the glass); o.kittens (default 2).
// ---------------------------------------------------------------------
SET_POS2.petShop = { vp: [1800, 470], window: { x0: 560, x1: 1380, y0: 390, y1: 735, sill: 735, spots: [[700, 735], [880, 735], [1060, 735], [1240, 735]] }, door: [1430, 1580], facadeBase: 828 };
function SET_petShop(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.extDay; const P = ext_proj(1800, 470), W2 = SET_POS2.petShop.window, Df = 1.2;
  const cols = ['#c98e6a', '#b7a08a', '#9d8fb0', '#c7b48e', '#a8b8a0'];
  const X = (x) => P.X(x, Df), Y = (y) => P.eye - (y - P.vp[1]) * Df;   // screen → world on the facade plane
  return [
    { d: 5, draw: () => { ext_sky(['#6fa6dc', '#a9cdeb', '#f0e4d2'], -600, 560); ext_clouds('psc', 6, -200, 260, 'rgba(255,255,255,0.75)', 5); ext_skyline('pss', 520, '#a9b4c8', { h0: 60, h1: 200 });
      const bx = mod(TT * 120, 4200) - 1200, by = 120 + Math.sin(TT * 0.7) * 30; for (let i = 0; i < 3; i++) { const wx = bx - i * 50, wy = by + i * 18, fl = Math.sin(TT * 10 + i) * 8; ivLine(wx - 12, wy - fl, wx, wy, 3, '#3a3a44'); ivLine(wx, wy, wx + 12, wy - fl, 3, '#3a3a44'); } } },
    { d: 2.2, draw: () => {   // the side street to the right: its far side buildings and its road
      ext_ground(P, { road: [600, 2600], walk: [-400, 3400], cRoad: '#5c5a64', cWalk: '#b9b0a4', dash: 1600, Dn: 0.5 });
      ext_row(P, { X: 3400, deep: 900, segs: [1.3, 2, 2.9, 4, 5.5, 7.5, 10, 14, 20], key: 'psR', cols, h: [1200, 2400], shops: true });
      const c = ext_loopD(1.2, 16, 1.2, 'psCar'); ext_car(P, 1150, c, { col: '#3c7a8a' });
      const D = ext_loopD(6, 1.6, 0.3, 'psw'); ext_person(P, CAST.extraB, 2900, D, { walk: 'toward' });
    } },
    { d: 1, draw: () => {
      // the corner building (the side face recedes along the side street) and the facade
      const bx = ext_box(P, X(-1700), X(1640), 0, 2300, Df, 4.5, { col: '#d7c3a4', side: '#b39e80', edge: false });
      ext_windows(bx.S, 14, 6, { key: 'psS', v0: 0.14, v1: 0.95, mu: 0.2, mv: 0.2 });
      for (let j = 0; j < 4; j++) for (let i = 0; i < 9; i++) { const x = -1500 + i * 360, y = 40 - j * 240; if (y < -700) continue; ivRR(x, y - 120, 150, 170, 4, 'rgba(50,62,90,0.55)'); ivRR(x - 10, y + 50, 170, 14, 3, '#b8a488'); ivPoly([[x, y - 120], [x + 60, y - 120], [x, y - 40]], 'rgba(255,255,255,0.1)'); }
      ivRR(-1700, 112, 3340, 26, 0, '#a89478'); ivAO(-1700, 828, 1640, 828, 30, 0.35);
      // the shop: teal front, sign, the deep shop inside the window
      ivRR(500, 138, 1140, 690, 0, '#2f7f80'); ivRR(520, 156, 1100, 90, 10, '#f4ead8'); ivText('PAWS & WHISKERS', 1040, 219, 54, '#2f7f80', { track: 3 });
      ctx.save(); ctx.beginPath(); ctx.rect(W2.x0, W2.y0, W2.x1 - W2.x0, W2.y1 - W2.y0); ctx.clip();
      const Q = ext_proj(1100, 520);   // the room behind the glass has its own centre (a box seen through a hole)
      const Rm = ivRoom({ back: [820, 430, 1360, 640], vp: [1080, 560], wall: '#e9dcc4', side: '#d6c6aa', sideR: '#cdbd9f', floor: '#b08a62', ceil: '#f2ead8', planks: 7, front: 2.4 });
      for (let k = 0; k < 3; k++) { ivRR(840, 470 + k * 52, 220, 8, 2, '#8a6a4a'); for (let i = 0; i < 6; i++) ivRR(850 + i * 34, 446 + k * 52, 24, 24, 4, ['#e85a4a', '#4a9ad8', '#f2c230', '#6ac06a'][(i + k) % 4]); }
      ivRR(1120, 470, 200, 120, 6, '#2a5a7a'); ivRR(1128, 478, 184, 104, 4, 'rgba(90,190,230,0.75)'); for (let i = 0; i < 3; i++) { const fx = 1140 + mod(TT * 30 + i * 60, 160), fy = 510 + i * 22 + Math.sin(TT * 2 + i) * 6; ivPoly([[fx, fy], [fx + 14, fy - 6], [fx + 14, fy + 6]], '#f2a23a'); }
      for (const x of [900, 1180]) { ivLine(x, 400, x, 420, 2, '#555'); ivDot(x, 426, 10, '#fff4d0'); ivGlow(x, 430, 140, 'rgba(255,230,170,0.5)'); }
      ivLightPool([Rm.F(0.3, 0.3), Rm.F(0.3, 0.7), Rm.F(0.9, 0.8), Rm.F(0.9, 0.2)], 'rgba(255,220,160,0.18)');
      void Q;
      // the display on the sill: a carpeted step, a scratching post, a yarn ball, a kitten bed
      const dsp = ext_box(P, X(W2.x0 + 10), X(W2.x1 - 10), Y(W2.sill) - 1, Y(W2.sill), 1.21, 1.42, { col: '#c06a5a', top: '#d88a76', edge: false });
      void dsp;
      ivRR(W2.x0 + 60, W2.sill - 210, 26, 210, 4, '#d8b88a'); for (let k = 0; k < 9; k++) ivLine(W2.x0 + 60, W2.sill - 200 + k * 22, W2.x0 + 86, W2.sill - 192 + k * 22, 2, '#b8946a'); ivRR(W2.x0 + 30, W2.sill - 222, 90, 18, 6, '#c06a5a');
      const sw = Math.sin(TT * 2.2) * 0.4; ivLine(W2.x0 + 75, W2.sill - 222, W2.x0 + 75 + Math.sin(sw) * 70, W2.sill - 222 + Math.cos(sw) * 70, 2, '#555'); ivDot(W2.x0 + 75 + Math.sin(sw) * 70, W2.sill - 222 + Math.cos(sw) * 70 + 8, 10, '#e85a8a');
      ivDot(W2.x1 - 120, W2.sill - 18, 18, '#4a9ad8'); ivLine(W2.x1 - 136, W2.sill - 24, W2.x1 - 104, W2.sill - 12, 2, '#2a6aa0');
      ctx.beginPath(); ctx.ellipse(1240, W2.sill - 12, 95, 26, 0, 0, TAU); ctx.fillStyle = '#8a5ab0'; ctx.fill(); ctx.beginPath(); ctx.ellipse(1240, W2.sill - 18, 74, 16, 0, 0, TAU); ctx.fillStyle = '#c4a8dc'; ctx.fill();
      const nk = o.kittens ?? 2;
      if (nk > 0) ivCat({ x: 1230, y: W2.sill - 14, s: 70, f: -1, coat: { ...IV_COATS.calico, key: 'psk1' }, pose: 'sleep' });
      if (nk > 1) ivCat({ x: 980, y: W2.sill, s: 85, f: -1, coat: { ...IV_COATS.tux, key: 'psk2' }, pose: 'loaf', look: [Math.sin(TT * 2.2) * 0.8, 0.4] });
      o.inside && o.inside();
      // the glass: a cool sheen, slow diagonal reflections, cars sliding by in the reflection
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(150,190,220,0.10)'; ctx.fillRect(W2.x0, W2.y0, W2.x1 - W2.x0, W2.y1 - W2.y0);
      for (const [a, w] of [[0, 90], [150, 40], [520, 120]]) { const x = W2.x0 + mod(a + TT * 18, 1100) - 200; ivPoly([[x, W2.y0], [x + w, W2.y0], [x + w - 180, W2.y1], [x - 180, W2.y1]], 'rgba(255,255,255,0.13)'); }
      const rx = W2.x1 - mod(TT * 260, 1600); ctx.save(); ctx.filter = 'blur(6px)'; ivRR(rx, W2.y1 - 120, 260, 70, 20, 'rgba(200,70,60,0.22)'); ctx.filter = 'none'; ctx.restore();
      ctx.restore();
      ivRR(W2.x0 - 14, W2.y0 - 14, W2.x1 - W2.x0 + 28, W2.y1 - W2.y0 + 28, 8, null, '#f4ead8', 14);
      ivRR(W2.x0 - 30, W2.y1 + 8, W2.x1 - W2.x0 + 60, 22, 4, '#e0d4bc');
      // the door with an OPEN sign that blinks, the bell
      ivRR(1430, 420, 150, 408, 6, '#245f60'); ivRR(1450, 440, 110, 220, 4, 'rgba(120,180,200,0.6)'); ivDot(1550, 640, 7, '#e8c34a');
      const on = mod(TT, 1.6) < 1.2; ivRR(1460, 470, 90, 34, 6, '#1a1418'); ivText('OPEN', 1505, 497, 24, on ? '#ff6a7a' : '#5a2a30', { font: IV.sans, glow: on ? 'rgba(255,80,100,0.9)' : null });
      // the awning: a box sticking out over the window (we see its underside, it is above the eye)
      const aw = ext_box(P, X(520), X(1400), Y(390) + 40, Y(390) + 110, 0.98, Df, { col: '#c8463c', under: '#8a2a24', edge: false });
      for (let i = 0; i < 9; i += 2) ext_q(aw.F, i / 9, (i + 1) / 9, 0, 1, '#f4ead8');
      // the café next door (left): its window and a chalkboard
      ivRR(-900, 420, 900, 330, 6, 'rgba(255,214,150,0.65)'); ivRR(-920, 400, 940, 370, 10, null, '#5a3e2e', 16); for (let i = 0; i < 4; i++) ivDot(-780 + i * 220, 470, 26, '#fff0c8');
      ivRR(-1000, 156, 1060, 90, 8, '#5a3e2e'); ivText('CAFÉ', -470, 221, 56, '#f4ead8');
      // the sidewalk to the camera, the curb, a strip of road
      const ga = P(-6000, 0, Df), gb = P(6000, 0, Df), gc = P(6000, 0, 0.4), gd = P(-6000, 0, 0.4); ivPoly([ga, gb, gc, gd], '#c4bbae');
      for (let D = 0.42; D < Df; D += 0.1) ivLine(...P(-6000, 0, D), ...P(6000, 0, D), 2 / D, 'rgba(0,0,0,0.1)', 'butt');
      for (let Xs = -6000; Xs < 6000; Xs += 380) ivLine(...P(Xs, 0, Df), ...P(Xs, 0, 0.4), 1.6, 'rgba(0,0,0,0.08)', 'butt');
      ivLightPool([P(X(W2.x0), 0, Df), P(X(W2.x1), 0, Df), P(X(W2.x1) + 300, 0, 0.9), P(X(W2.x0) + 300, 0, 0.9)], 'rgba(255,240,210,0.12)');
      ivAO(...P(-6000, 0, Df), ...P(6000, 0, Df), 22, 0.3);
      ivPoly([P(-6000, 0, 0.66), P(6000, 0, 0.66), P(6000, 0, 0.3), P(-6000, 0, 0.3)], '#5c5a64'); ivPoly([P(-6000, 0, 0.66), P(6000, 0, 0.66), P(6000, 0, 0.64), P(-6000, 0, 0.64)], '#e6e0d4');
      // passers-by behind the actors, across the sidewalk
      const px = mod(TT * 130 + 600, 3600) - 1400; ext_person(P, CAST.extraC, X(px) * 0 + P.X(px, 1.12), 1.12, { walk: 'right' });
      const qx = 2400 - mod(TT * 110, 3800); ext_person(P, CAST.extraA, P.X(qx, 1.15), 1.15, { walk: 'left' });
      ext_pigeon(...P(X(200), 0, 1.0), 34, 'psp', 1);
      o.act && o.act();
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ivRR(1980, 300, 50, 1300, 6, '#2c2a30'); ivRR(1940, 420, 130, 90, 10, '#c8352e'); ivDot(-150, 1250, 220, '#3a3036'); } }]),
  ];
}
// ---------------------------------------------------------------------
//  palettes for the street sets by time of day
// ---------------------------------------------------------------------
function ext_pal(t) {
  if (t === 'night') return { sky: ['#05070f', '#111832', '#26304e'], road: '#22263a', walk: '#3a3e52', curb: 'rgba(150,165,210,0.35)', dk: -0.58, lit: 0.45, lamps: true, haze: 'rgba(60,80,140,0.35)', sky2: '#0c1020', moon: true, tile: 'rgba(0,0,0,0.2)' };
  if (t === 'dusk') return { sky: ['#3a2c5a', '#a05a78', '#f2a46a'], road: '#4a4656', walk: '#857a84', curb: 'rgba(240,210,200,0.4)', dk: -0.3, lit: 0.35, lamps: true, haze: 'rgba(240,150,120,0.35)', sky2: '#5a3c5a', tile: 'rgba(0,0,0,0.14)' };
  return { sky: ['#6fa6dc', '#a9cdeb', '#f0e4d2'], road: '#5c5a64', walk: '#b9b0a4', curb: 'rgba(235,230,220,0.6)', dk: 0, lit: 0, lamps: false, haze: 'rgba(200,210,230,0.35)', sky2: '#a9b4c8', tile: 'rgba(0,0,0,0.13)' };
}
function ext_skyFor(p, key) {
  ext_sky(p.sky, -600, 560);
  if (p.moon) { ext_stars(key + 's', 120); ext_moon(1500, 120, 46); ext_clouds(key + 'c', 4, -100, 200, 'rgba(60,72,110,0.5)', 4); }
  else if (p.dk < 0) { ivGlow(400, 470, 700, 'rgba(255,170,110,0.5)'); ext_clouds(key + 'c', 6, -120, 260, 'rgba(255,170,150,0.45)', 4); }
  else { ivDot(1640, 90, 54, '#fff6dc'); ivGlow(1640, 90, 420, 'rgba(255,240,200,0.5)'); ext_clouds(key + 'c', 6, -150, 220, 'rgba(255,255,255,0.75)', 5); }
  ext_skyline(key + 'k', 520, p.sky2, { h0: 30, h1: 140, lit: p.lit * 0.5 });
}
// a soft round puff (steam, smoke, fog wisps): col as 'r,g,b'
function ext_puff(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
// a cat silhouette sitting in a window (cats watching the street)
function ext_winCat(x, y, s, key, lit) {
  const coat = CATS.alley[hash(key) % CATS.alley.length];
  // (a simple shape: ivCat at this size is invisible detail and rasterises unstably on the blurred far layer)
  const c = lit ? '#14121a' : ivShade(coat.col, -0.15), sw = Math.sin(TT * 1.3 + hash(key) % 9) * 3;
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 40, s / 40); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -12, 11, 13, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-2, -30, 8, 7, 0, 0, TAU); ctx.fill();
  ivPoly([[-9, -33], [-7, -42], [-3, -35]], c); ivPoly([[1, -35], [4, -42], [6, -32]], c); ivLine(8, -2, 16, -10 + sw, 3, c);
  ivDot(-5, -30, 1.5, lit ? '#e8d84a' : coat.eye || '#e8d84a'); ivDot(1, -30, 1.5, lit ? '#e8d84a' : coat.eye || '#e8d84a'); ctx.restore();
}
// ---------------------------------------------------------------------
//  STREET — o.t 'day' | 'dusk' | 'night'. A residential street: houses with pitched roofs on both sides, front hedges,
//  windows where cats watch (o.cats !== false), parked cars (boxes), streetlamps (lit at dusk/night), trees,
//  a basement grate on the sidewalk (SET_POS2.street.grate) with o.grateGlow (gas leak scene: o.leak → green wisps).
// ---------------------------------------------------------------------
SET_POS2.street = { vp: [700, 470], grate: [1200, 935], lamp: [565, 175], kai: 760, carNear: [-400, 1000] };
function SET_street(o = {}) {
  const t = o.t || 'day', p = ext_pal(t), P = ext_proj(700, 470);
  IV_M = IV_MOOD[o.mood] || (t === 'night' ? IV_MOOD.extNight : t === 'dusk' ? IV_MOOD.extDusk : IV_MOOD.extDay);
  const cols = ['#c9a27e', '#a8b8c8', '#d8c8a0', '#b89a9a', '#a8b898', '#e0d0bc'].map((c) => p.dk ? ivShade(c, p.dk) : c);
  const winCat = o.cats === false ? null : (x, y, s, D, key) => ext_winCat(x, y, s, key, p.lit > 0);
  return [
    { d: 5, draw: () => ext_skyFor(p, 'st' + t) },
    { d: 2.4, draw: () => {
      ext_row(P, { X: -3000, deep: 1100, segs: [1.5, 2.3, 3.2, 4.3, 5.7, 7.5, 10, 13.5, 19], key: 'stL', cols, h: [700, 1000], house: true, lit: p.lit, winCat, roof: p.dk ? ivShade('#5a3e3a', p.dk) : '#5a3e3a', glass: p.lit ? 'rgba(20,26,44,0.8)' : undefined });
      ext_row(P, { X: 1300, deep: 1100, segs: [0.5, 1.2, 2, 2.9, 4, 5.4, 7.2, 9.6, 13, 18], key: 'stR', cols, h: [700, 1000], house: true, lit: p.lit, winCat, roof: p.dk ? ivShade('#5a3e3a', p.dk) : '#5a3e3a', glass: p.lit ? 'rgba(20,26,44,0.8)' : undefined });
    } },
    { d: 1.45, draw: () => {
      const lampsAt = [[-180, 3.3], [-180, 6.5], [-2160, 2.2], [-2160, 5]];
      ext_ground(P, { road: [-2000, -250], walk: [-3000, 1300], cRoad: p.road, cWalk: p.walk, cCurb: p.curb, dash: -1125, Dn: 0.36, haze: p.haze, tileCol: p.tile,
        wet: p.lamps ? lampsAt.map(([X, D]) => [X + (X < -1000 ? 220 : -220), D, 'rgba(255,190,110,0.16)']) : null });
      const things = [];
      // hedges / low fences of the front yards
      for (const [X0, X1] of [[1000, 1180], [-2900, -2720]]) things.push({ D: 18, f: () => ext_box(P, X0, X1, 0, 190, 0.5, 18, { col: p.dk ? ivShade('#4f7a48', p.dk) : '#4f7a48', top: p.dk ? ivShade('#6a9a5a', p.dk) : '#6a9a5a', edge: false }) });
      for (const D of [1.7, 3.6, 6, 9]) things.push({ D, f: () => ext_tree(P, 800, D, { cols: p.dk ? ['#4f7a48', '#5f8c52', '#6f9c5c'].map((c) => ivShade(c, p.dk)) : undefined }) });
      for (const [X, D] of lampsAt) things.push({ D, f: () => ext_lamp(P, X, D, p.lamps, { flicker: t === 'night' && D > 3 }) });
      for (const [X, D, c] of [[-560, 2.3, '#c8463c'], [-560, 4.6, '#e0c070'], [-1700, 1.9, '#5a8a6a'], [-1700, 3.4, '#3d5f8a'], [-1700, 7, '#9a9aa8']]) things.push({ D, f: () => ext_car(P, X, D, { col: p.dk ? ivShade(c, p.dk * 0.6) : c, night: p.lamps }) });
      const dc = ext_loopD(20, 1.0, 1.3, 'stDrive'); things.push({ D: dc, f: () => ext_car(P, -1450, dc, { col: '#d8d0c4', toward: true, night: p.lamps }) });
      [['extraB', 650, 8, 1.7, 'toward'], ['kidA', -2500, 2.4, 9, 'away']].forEach(([w, X, a, b, dir], k) => { const D = ext_loopD(a, b, 0.3, 'stw' + k + t); things.push({ D, f: () => ext_person(P, CAST[w], X, D, { walk: dir }) }); });
      // a cat crossing the road far away
      const cu = mod(TT / 9, 1), cX = lerp(-2100, -150, cu); things.push({ D: 4, f: () => { const q = P(cX, 0, 4); ivCat({ x: q[0], y: q[1], s: 140 / 4, f: 1, coat: { ...IV_COATS.black, key: 'stcross' }, pose: 'walk' }); } });
      if (o.mid) o.mid(P, things);
      things.sort((a, b) => b.D - a.D).forEach((th) => th.f());
    } },
    { d: 1, draw: () => {
      if (o.grate !== false) {
      // the basement grate with a glow from below (steam/leak)
      const G = SET_POS2.street.grate, Dg = 1.08, gx = P.X(G[0], Dg), q = (X, D) => P(X, 0, D);
      ivPoly([q(gx - 180, Dg - 0.1), q(gx + 180, Dg - 0.1), q(gx + 180, Dg + 0.1), q(gx - 180, Dg + 0.1)], '#1a1a20');
      ivPoly([q(gx - 165, Dg - 0.09), q(gx + 165, Dg - 0.09), q(gx + 165, Dg + 0.09), q(gx - 165, Dg + 0.09)], o.leak ? 'rgba(120,200,110,0.35)' : 'rgba(255,170,90,0.28)');
      for (let k = 0; k <= 10; k++) ivLine(...q(gx - 165 + k * 33, Dg - 0.09), ...q(gx - 165 + k * 33, Dg + 0.09), 5, '#3a3a44', 'butt');
      ivPoly([q(gx - 180, Dg - 0.1), q(gx + 180, Dg - 0.1), q(gx + 180, Dg - 0.085), q(gx - 180, Dg - 0.085)], 'rgba(200,200,210,0.3)');
      ctx.save(); for (let i = 0; i < 5; i++) { const u = mod(TT * 0.35 + i / 5, 1), c = q(gx + Math.sin(TT * 1.3 + i * 2) * 60 + (i - 2) * 50, Dg); ext_puff(c[0], c[1] - u * 260, 50 + u * 70, o.leak ? '155,224,138' : '232,224,216', 0.3 * Math.sin(Math.PI * u)); } ctx.restore();
      }
      // the near streetlamp pole on our curb
      ext_lamp(P, -180, 1.05, p.lamps, { H: 1300 });
      o.back && o.back(P);
      o.act && o.act();
      if (o.nearCar !== false) ext_car(P, -560, 0.82, { col: p.dk ? ivShade('#7a5a9a', p.dk * 0.6) : '#7a5a9a', night: p.lamps });
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { const c = p.dk ? ivShade('#3f5f3a', p.dk) : '#3f5f3a'; ivDot(2150, -60, 260, c); ivDot(1960, -160, 200, ivShade(c, 0.1)); ivDot(2250, 160, 180, ivShade(c, -0.1)); } }]),
  ];
}
// ---------------------------------------------------------------------
//  crowd people: a fixed list of coloured extras (built once)
// ---------------------------------------------------------------------
const EXT_CROWD = (() => { const r = RNG('crowd').f, tops = ['tee', 'hoodie', 'jacket', 'coat', 'tee', 'cardigan'], hair = [null, null, 'bun', 'pony', null, 'puffs'],
  cols = ['#c8463c', '#3c7a8a', '#d89a3a', '#5a7a4a', '#8a5bb0', '#e0c070', '#4a6ab0', '#b86a8a', '#6a8a9a', '#e07a4a'];
  return Array.from({ length: 24 }, (_, i) => ({ key: 'crowd' + i, top: tops[i % 6], col: cols[Math.floor(r() * cols.length)], hair: hair[Math.floor(r() * 6)] })); })();
// a crowd of n people standing/bobbing between depths D0..D1 and X0..X1 (sorted far → near); o.walk lets some walk across
function ext_crowd(P, key, n, X0, X1, D0, D1, o = {}) {
  const r = RNG('cr' + key).f, L = [];
  for (let i = 0; i < n; i++) { const D = lerp(D0, D1, r()), X = lerp(X0, X1, r()), who = EXT_CROWD[Math.floor(r() * EXT_CROWD.length)], kid = r() < 0.2, walk = o.walk && r() < o.walk, dir = r() < 0.5 ? 1 : -1, sp = 120 + r() * 80, ph = r() * 9, f = (r() - 0.5) * 1.6, pose = ['relaxed', 'relaxed', 'hips', 'phone', 'wave', 'arms'][Math.floor(r() * 6)]; L.push({ D, X, who, kid, walk, dir, sp, ph, f, pose }); }
  L.sort((a, b) => b.D - a.D);
  for (const c of L) {
    let X = c.X; if (c.walk) X = X0 + mod(c.X - X0 + c.dir * c.sp * TT, X1 - X0);
    const h = (c.kid ? 340 : 500 + (hash(c.who.key) % 60)) / c.D, q = P(X, 0, c.D), bob = Math.abs(Math.sin(TT * 3 + c.ph)) * (o.bounce ? 0.03 : 0.006) * h;
    ivCastShadow(q[0], q[1], h, { a: 0.18, len: 0.6 });
    const pose = c.walk ? ivWalk(-c.ph, 0, h, 1, 6).pose : ivPose(c.pose, o.bounce && c.pose === 'wave' ? { hR: [0.16, -0.24 + Math.sin(TT * 6 + c.ph) * 0.05] } : {});
    ivMan({ who: c.who, x: q[0], y: q[1] - bob, h, f: c.walk ? c.dir * 0.9 : c.f, pose, expr: { eyes: 'open', mouth: r() < 0.5 ? 'smile' : 'flat' } });
  }
}
// a string of bulbs from a to b with a sag; on = glow
function ext_bulbs(a, b, sag, n, cols, on, w = 2) {
  const pt = (u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(Math.PI * u) * sag];
  ctx.beginPath(); for (let i = 0; i <= 24; i++) { const p = pt(i / 24); i ? ctx.lineTo(...p) : ctx.moveTo(...p); } ctx.lineWidth = w; ctx.strokeStyle = 'rgba(30,26,30,0.8)'; ctx.stroke();
  const s = Math.max(2, Math.abs(b[0] - a[0]) / n * 0.12);
  for (let i = 1; i < n; i++) { const p = pt(i / n), c = cols[i % cols.length], tw = 0.75 + 0.25 * Math.sin(TT * 3 + i * 1.7); ivDot(p[0], p[1] + s, s, c); if (on) ivGlow(p[0], p[1] + s, s * 5, c, 0.45 * tw); }
}
// a balloon: x, y the knot, r radius, col; the string goes to (sx, sy)
function ext_balloon(x, y, r, col, sx, sy) {
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 8, (y + sy) / 2, sx, sy); ctx.lineWidth = Math.max(1, r * 0.04); ctx.strokeStyle = 'rgba(40,30,30,0.7)'; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y - r * 1.1, r * 0.9, r * 1.1, 0, 0, TAU); ctx.fillStyle = col; ctx.fill();
  ivDot(x - r * 0.3, y - r * 1.5, r * 0.22, 'rgba(255,255,255,0.45)'); ivPoly([[x - r * 0.15, y + r * 0.02], [x + r * 0.15, y + r * 0.02], [x, y - r * 0.12]], col);
}
// ---------------------------------------------------------------------
//  FAIR — o.t 'day' | 'dusk'. The street fair: striped stalls (boxes with awnings) down both sides, string lights
//  across, the music stage at the far end, crowds at two depths, balloons. o.crowd (default 1) scales the crowd.
// ---------------------------------------------------------------------
SET_POS2.fair = { vp: [960, 470], stage: [960, 470], seller: [1540, 900], stallsL: [], stallsR: [], gap: [700, 1250] };
function SET_fair(o = {}) {
  const t = o.t || 'day', dusk = t === 'dusk', p = ext_pal(dusk ? 'dusk' : 'day'), P = ext_proj(960, 470), cr = o.crowd ?? 1;
  IV_M = IV_MOOD[o.mood] || (dusk ? IV_MOOD.extFairDusk : IV_MOOD.extFair);
  const cols = ['#c98e6a', '#b7a08a', '#9d8fb0', '#c7b48e', '#a8b8a0'].map((c) => dusk ? ivShade(c, -0.3) : c);
  const bulbC = ['#ffd27a', '#ff7a6a', '#7ad0ff', '#a8f07a', '#ffd27a'];
  const awn = [['#c8463c', '#f4ead8'], ['#3c7a8a', '#f4ead8'], ['#d89a3a', '#fff4d8'], ['#5a7a4a', '#f4ead8'], ['#8a5bb0', '#f4ead8']];
  const stall = (side, D0, D1, k) => {   // a stall: counter box, back wall, posts, a striped awning sloping to the street
    const s = side, Xi = s * 1250, Xo = s * 1750, X0 = Math.min(Xi, Xo), X1 = Math.max(Xi, Xo), [ca, cb] = awn[k % awn.length];
    const bw = ext_box(P, X0, X1, 0, 760, D1 - 0.02, D1, { col: dusk ? '#4a3a48' : ['#7a5a6a', '#5a6a7a', '#7a6a50'][k % 3], edge: false });
    for (let i = 0; i < 5; i++) { const g = bw.F(0.15 + i * 0.17, 0.62); ivLine(g[0], g[1] - 40 / D1, g[0], g[1], 1.5, '#2a2228'); ivRR(g[0] - 14 / D1, g[1], 28 / D1, 46 / D1, 5 / D1, ['#e8c34a', '#e85a8a', '#6ac0d0', '#f4ead8'][(i + k) % 4]); }
    const cnt = ext_box(P, X0 + s * 60, X1, 0, 300, D0, D1 - 0.02, { col: ca, top: '#e8dcc4' });
    if (cnt.S) for (let i = 0; i < 4; i++) { const g = cnt.S(0.1 + i * 0.22, 1.12); ivDot(g[0], g[1], 26 / D0, ['#e85a4a', '#f2c230', '#6ac06a', '#4a9ad8'][(i + k) % 4]); }
    for (const D of [D0, D1 - 0.02]) { const a = P(Xi, 0, D), b = P(Xi, 660, D); ivLine(a[0], a[1], b[0], b[1], 8 / D, '#3a3036', 'butt'); }
    for (let i = 0; i < 6; i++) { const u0 = i / 6, u1 = (i + 1) / 6, Da = lerp(D0, D1, u0), Db = lerp(D0, D1, u1);
      ivPoly([P(Xo, 800, Da), P(Xo, 800, Db), P(Xi - s * 90, 640, Db), P(Xi - s * 90, 640, Da)], i % 2 ? cb : ca); }
    for (let i = 0; i < 6; i++) { const D = lerp(D0, D1, (i + 0.5) / 6), a = P(Xi - s * 90, 640, D); ctx.beginPath(); ctx.arc(a[0], a[1], 22 / D, 0, Math.PI); ctx.fillStyle = i % 2 ? cb : ca; ctx.fill(); }
    if (dusk) { const g = P(Xi, 760, (D0 + D1) / 2); ivGlow(g[0], g[1], 260 / D0, 'rgba(255,200,120,0.45)'); }
  };
  const stallsAt = [[1.15, 1.55], [1.7, 2.15], [2.35, 2.85], [3.1, 3.7], [4, 4.7], [5.1, 6], [6.5, 7.6]];
  return [
    { d: 5, draw: () => { ext_skyFor(p, 'fair' + t); const r = RNG('fb').f; for (let i = 0; i < 5; i++) { const x = 200 + r() * 1600, y = 600 - mod(TT * (30 + r() * 20) + r() * 900, 1100); ext_balloon(x + Math.sin(TT + i) * 20, y, 12, ['#e8463c', '#f2c230', '#4a9ad8', '#e85a9a'][i % 4], x + Math.sin(TT + i) * 20 + 6, y + 70); } } },
    { d: 2.4, draw: () => {
      ext_row(P, { X: -2300, deep: 900, segs: [1.2, 2, 3, 4.2, 5.8, 8, 11, 16], key: 'faL', cols, h: [1400, 2400], lit: dusk ? 0.4 : 0 });
      ext_row(P, { X: 2300, deep: 900, segs: [1.2, 2, 3, 4.2, 5.8, 8, 11, 16], key: 'faR', cols, h: [1400, 2400], lit: dusk ? 0.4 : 0 });
      ext_ground(P, { road: [-1250, 1250], walk: [-2300, 2300], cRoad: dusk ? '#5a5260' : '#8a8490', cWalk: p.walk, cCurb: p.curb, Dn: 4, haze: p.haze, tiles: false });
      // the stage at the far end: platform, back wall with a banner, speakers, a band that bobs, spotlights
      const st = ext_box(P, -900, 900, 0, 260, 9, 10.5, { col: '#3a2e3a', top: '#5a4a52' });
      ext_box(P, -900, 900, 260, 1300, 10.5, 10.6, { col: dusk ? '#2a1e2e' : '#4a3a4a', edge: false });
      const bn = P(0, 1150, 10.5); ivRR(bn[0] - 120, bn[1] - 16, 240, 34, 6, '#f2c230'); ivText('STREET FAIR', bn[0], bn[1] + 10, 24, '#3a2e3a');
      for (const X of [-820, 820]) ext_box(P, X - 60, X + 60, 260, 600, 9.2, 9.6, { col: '#1a1a20', top: '#2a2a30' });
      for (let i = 0; i < 4; i++) { const q = P(-450 + i * 300, 260, 9.8); ivMan({ who: EXT_CROWD[i + 3], x: q[0], y: q[1] - Math.abs(Math.sin(TT * 4 + i)) * 4, h: 520 / 9.8, f: 0, pose: ivPose(i === 1 ? 'wave' : 'hug') }); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const a = P(-600 + i * 600, 1300, 10.4), sw = Math.sin(TT * 1.2 + i * 2) * 120; ivPoly([[a[0] - 4, a[1]], [a[0] + 4, a[1]], [a[0] + sw + 50, a[1] + 150], [a[0] + sw - 50, a[1] + 150]], `rgba(${['255,120,200', '120,200,255', '255,220,120'][i]},${dusk ? 0.25 : 0.1})`); } ctx.restore();
      void st;
      for (const [a, b] of stallsAt.slice(4)) { stall(-1, a, b, Math.round(a * 3)); stall(1, a, b, Math.round(a * 3) + 2); }
      ext_crowd(P, 'far', Math.round(16 * cr), -1150, 1150, 4.2, 9, { walk: 0.3, bounce: true });
      for (const D of [4.4, 6, 8]) ext_bulbs(P(-2300, 1400, D), P(2300, 1400, D), 160 / D, 16, bulbC, dusk);
    } },
    { d: 1.5, draw: () => {
      ext_ground(P, { road: [-1250, 1250], walk: [-2300, 2300], cRoad: dusk ? '#5a5260' : '#8a8490', cWalk: p.walk, cCurb: p.curb, Dn: 0.4, Df: 4.6, haze: 'rgba(0,0,0,0)', tiles: false });
      // chalk/litter marks on the asphalt
      const r = RNG('flr').f; for (let i = 0; i < 30; i++) { const D = 0.5 + r() * 4, q = P(lerp(-1200, 1200, r()), 0, D); ivRR(q[0], q[1], 14 / D, 6 / D, 2, ['#f2c230', '#e85a4a', '#4a9ad8', '#f4ead8'][i % 4]); }
      for (const [a, b] of stallsAt.slice(0, 4).reverse()) { stall(-1, a, b, Math.round(a * 3)); stall(1, a, b, Math.round(a * 3) + 2); }
      ext_crowd(P, 'mid', Math.round(12 * cr), -1150, 1150, 1.9, 4, { walk: 0.4 });
      // the balloon seller
      const S = SET_POS2.fair.seller, sD = P.D(S[1]) * 0 + 1.6, sq = P(P.X(S[0], 1.6), 0, sD);
      ivCastShadow(sq[0], sq[1], 520 / sD); ivMan({ who: CAST.extraB, x: sq[0], y: sq[1], h: 520 / sD, f: -0.4, pose: ivPose('wave', { hR: [0.1, -0.1] }), expr: { eyes: 'happy', mouth: 'smile' } });
      for (let i = 0; i < 7; i++) { const a = -0.9 + i * 0.3, bx = sq[0] + 30 / sD + Math.sin(a) * 160 / sD + Math.sin(TT * 1.5 + i) * 6, by = sq[1] - 560 / sD - Math.cos(a) * 140 / sD; ext_balloon(bx, by, 34 / sD, ['#e8463c', '#f2c230', '#4a9ad8', '#e85a9a', '#6ac06a'][i % 5], sq[0] + 40 / sD, sq[1] - 330 / sD); }
      for (const D of [1.6, 2.4, 3.3]) ext_bulbs(P(-2300, 1400, D), P(2300, 1400, D), 160 / D, 18, bulbC, dusk, 3 / D + 1);
      // bunting
      const bt = (D) => { const a = P(-1750, 1050, D), b = P(1750, 1050, D); for (let i = 0; i < 16; i++) { const u = i / 16, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + Math.sin(Math.PI * u) * 80 / D, s = 26 / D; ivPoly([[x, y], [x + s * 1.6, y], [x + s * 0.8, y + s * 1.8 + Math.sin(TT * 3 + i) * 2]], ['#e8463c', '#f2c230', '#4a9ad8', '#f4ead8'][i % 4]); } };
      bt(2.0); bt(2.9);
    } },
    { d: 1, draw: () => {
      SET_POS2.fair.stallsL = stallsAt.map(([a]) => P(-1250, 300, a)); SET_POS2.fair.stallsR = stallsAt.map(([a]) => P(1250, 300, a));
      stall(1, 0.75, 1.05, 7);
      o.act && o.act();
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.62, draw: () => {
      ext_bulbs([-600, 60], [2600, 120], 140, 10, bulbC, dusk, 4);
      if (cr > 0) for (let i = 0; i < 3; i++) { const x = mod(i * 900 + TT * (150 + i * 40) * (i % 2 ? -1 : 1), 3600) - 800; ivMan({ who: { ...EXT_CROWD[i * 5], col: ivShade(EXT_CROWD[i * 5].col, -0.6) }, x, y: 1500, h: 900, f: i % 2 ? -0.9 : 0.9, pose: ivWalk(-i, 0, 900, 1, 7).pose }); }
    } }]),
  ];
}
// ---------------------------------------------------------------------
//  POLICE — night. The night street after Lily is lost: the street set at night with a police car (light bar,
//  o.lights 0..1: red/blue sweeping over everything, the rim light too), MISSING — LILY flyers on the poles,
//  neighbours with phones. SET_POS2.police.car = the car's rear-centre on the ground; .flyer = the near flyer.
// ---------------------------------------------------------------------
SET_POS2.police = { vp: [700, 470], car: [220, 814], flyer: [565, 480], neighbours: [[1400, 0], [1650, 0]] };
function ext_flyer(x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ivRR(-50, -66, 100, 132, 2, '#f4f0e6'); ivText('MISSING', 0, -44, 17, '#c8352e', { font: IV.sans, weight: 900 });
  ivDot(0, -10, 14, '#1a1a20'); ivDot(-12, -22, 7, '#1a1a20'); ivDot(12, -22, 7, '#1a1a20'); ivPoly([[-14, 4], [14, 4], [18, 30], [-18, 30]], '#f2c230');
  ivText('LILY · 7', 0, 50, 14, '#1a1a20', { font: IV.sans, weight: 900 }); ivLine(-30, 58, 30, 58, 2, 'rgba(0,0,0,0.3)');
  ctx.restore();
}
function SET_police(o = {}) {
  const L = clamp(o.lights ?? 1), ph = TT * 2.6, red = (Math.sin(ph * Math.PI) > 0 ? 1 : 0.15) * L, blue = (Math.sin(ph * Math.PI) > 0 ? 0.15 : 1) * L;
  const layers = SET_street({ t: 'night', cats: o.cats ?? true, nearCar: false, grate: false, fg: o.fg,
    mid: (P, things) => {
      for (const [X, D] of [[-180, 3.3], [-2160, 2.2]]) things.push({ D: D - 0.01, f: () => { const q = P(X, 560, D); ext_flyer(q[0], q[1], 1.4 / D, 0.05); } });
      [[400, 2.2, 'extraA'], [620, 2.6, 'extraC'], [880, 2.0, 'kidC'], [-2500, 3.0, 'extraB']].forEach(([X, D, w], k) => things.push({ D, f: () => {
        ext_person(P, CAST[w], X, D, { pose: k % 2 ? 'phoneUp' : 'phone', f: -0.3, expr: { eyes: 'sad', mouth: 'flat' } });
        const q = P(X + 60, 420, D); ivGlow(q[0], q[1], 90 / D, 'rgba(170,210,255,0.7)'); } }));
    },
    back: (P) => {
      // the police car across the road, facing us, its light bar flashing
      const D = 1.25, b = ext_car(P, -600, D, { col: '#e8eaf0', toward: true, night: true, lights: true, len: 0.62 });
      ext_q(b.F, 0, 1, 0.3, 0.55, '#1c2438');
      const bar = ext_box(P, -750, -450, 450, 500, D + 0.2, D + 0.3, { col: '#1a1a22', edge: false });
      ext_q(bar.F, 0, 0.48, 0.1, 0.9, `rgba(255,${40 + 60 * (1 - red)},40,${0.3 + 0.7 * red})`); ext_q(bar.F, 0.52, 1, 0.1, 0.9, `rgba(60,120,255,${0.3 + 0.7 * blue})`);
      const a = bar.F(0.25, 0.5), c = bar.F(0.75, 0.5); ivGlow(a[0], a[1], 420 * red, 'rgba(255,50,40,0.8)'); ivGlow(c[0], c[1], 420 * blue, 'rgba(60,120,255,0.8)');
      const fl = P(-180, 640, 1.05); ext_flyer(fl[0] + 14, fl[1], 1.25, -0.04);
      const f2 = P(-180, 420, 1.05); ext_flyer(f2[0] + 14, f2[1], 1.1, 0.06);
      o.back && o.back(P);
    },
    act: o.act, front: o.front });
  IV_M = { ...(IV_MOOD[o.mood] || IV_MOOD.extPolice), rim: red > blue ? '#ff9a8a' : '#9ab4ff' };
  // the sweep: a red wash from the left and a blue one from the right, alternating, over every layer
  return layers.map((Ly) => ({ ...Ly, draw: () => { Ly.draw(); if (L <= 0) return; const k = Ly.d > 3 ? 0.35 : 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    let g = ctx.createRadialGradient(150, 600, 50, 150, 600, 1500); g.addColorStop(0, `rgba(255,40,40,${0.15 * red * k})`); g.addColorStop(1, 'rgba(255,40,40,0)'); ctx.fillStyle = g; ctx.fillRect(-1500, -800, 5000, 3000);
    g = ctx.createRadialGradient(1300, 600, 50, 1300, 600, 1600); g.addColorStop(0, `rgba(60,110,255,${0.15 * blue * k})`); g.addColorStop(1, 'rgba(60,110,255,0)'); ctx.fillStyle = g; ctx.fillRect(-1500, -800, 5000, 3000);
    ctx.restore(); } }));
}
// ---------------------------------------------------------------------
//  ALLEY — night, 3 a.m. The garage behind the market (approved look 3, in true perspective): a high camera looks
//  down the alley; the market's back wall (left: door, bulb, vent, fire escape) and the garage (right: roll-up door,
//  pipe) converge on the end wall, where the street cats sit. o.cats 0–40 cats on the wall (CATS.alley coats), filled
//  spread out (slots in SET_POS2.alley.wallTop, in fill order: [x, y, s, f]); the centre is kept for Boss
//  (SET_POS2.alley.boss = [x, y, s]); o.yowl 0..1 share of the wall cats yowling (from the centre out);
//  o.garage 0..1 how far the garage door is up. Kai stands on GROUND (D = 1); the wall top is at y ≈ 343.
// ---------------------------------------------------------------------
SET_POS2.alley = (() => {
  const P = ext_proj(960, 260), slots = [], r = RNG('alleySlots').f;
  for (let i = 0; i < 22; i++) { const X = lerp(-820, 820, (i + 0.5) / 22); if (Math.abs(X) < 150) continue; const q = P(X + (r() - 0.5) * 30, 520, 1.35); slots.push([q[0], q[1], 108 + r() * 26, X < 0 ? 1 : -1, 1.35]); }
  for (let i = 0; i < 20; i++) { const X = lerp(-840, 840, (i + 1) / 21); if (Math.abs(X) < 120) continue; const q = P(X + (r() - 0.5) * 30, 520, 1.47); slots.push([q[0], q[1], 92 + r() * 22, X < 0 ? 1 : -1, 1.47]); }
  const order = slots.map((s, i) => ({ s, k: mod(i * 0.6180339 + (i >= 20 ? 0.31 : 0), 1) })).sort((a, b) => a.k - b.k).map((o) => o.s).slice(0, 40);
  const b = P(0, 520, 1.35);
  return { vp: [960, 260], wallTop: order, boss: [b[0], b[1], 260], wall: [P(-900, 520, 1.3)[0], P(900, 520, 1.3)[0], P(0, 520, 1.3)[1], P(0, 0, 1.3)[1]], puddle: [1180, 1000], door: [395, 760], garage: [1640, 700], bulb: [300, 420] };
})();
function SET_alley(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.extAlley; const P = ext_proj(960, 260), A = SET_POS2.alley, n = clamp(Math.round(o.cats ?? 0), 0, 40);
  return [
    { d: 4.5, draw: () => { ext_sky(['#04060d', '#0e1430', '#1e2746'], -700, 500); ext_stars('alst', 140, [-900, -500, 2900, 300]); ext_moon(520, 60, 62); ext_clouds('alcl', 5, -120, 160, 'rgba(40,50,90,0.6)', 7); } },
    { d: 2.6, draw: () => {
      // beyond the wall the alley runs on: its walls converge to the vanishing point (windows, fire escapes), the far end
      const r = RNG('alfar').f;
      for (let i = 0; i < 7; i++) { const X0 = -2400 + i * 700 + r() * 100, H = 1700 + r() * 900, D = 9 + r() * 2;
        const bx = ext_box(P, X0, X0 + 620, 0, H, D, D + 0.6, { col: '#11152a', side: '#0b0e1e', edge: 'rgba(150,170,255,0.18)' });
        ext_windows(bx.F, 3, Math.floor(H / 300), { key: 'alw' + i, lit: 0.3, litCol: '#f2b866', glass: 'rgba(20,24,40,0.9)', sheen: false, shade: false });
        if (r() < 0.6) { const tq = P(X0 + 300, H, D + 0.3), s = 1 / D; ivRR(tq[0] - 70 * s, tq[1] - 250 * s, 140 * s, 170 * s, 20 * s, '#0e1124'); ivPoly([[tq[0] - 75 * s, tq[1] - 250 * s], [tq[0], tq[1] - 300 * s], [tq[0] + 75 * s, tq[1] - 250 * s]], '#0e1124'); ivLine(tq[0], tq[1], tq[0], tq[1] - 80 * s, 6 * s, '#0e1124'); } }
      for (const [X0, X1, c, sd, k] of [[-2600, -900, '#161b30', '#1a2036', 'L'], [900, 2600, '#1b2138', '#1e2540', 'R']]) {
        const segs = [1.3, 2.4, 3.6, 5.2, 7.2, 9.6];
        for (let i = segs.length - 2; i >= 0; i--) { const H = 1500 + (hash(k, i) % 900), bx = ext_box(P, X0, X1, 0, H, segs[i], segs[i + 1], { col: c, side: ivShade(sd, (i % 2) * -0.15), edge: false });
          ext_windows(bx.S, 3, Math.floor(H / 320), { key: 'al' + k + i, v0: 0.12, lit: 0.35, litCol: '#e8a85a', glass: 'rgba(12,15,28,0.9)', sheen: false, mu: 0.3, mv: 0.25,
            each: (ii, jj, u0, u1, w0, w1, lit) => { if (lit && Math.sin(TT * 0.5 + i * 3 + ii + jj) > 0.985) ext_q(bx.S, u0, u1, w0, w1, '#141828'); } });
          for (let f = 0; f < 3; f++) { const v = 0.3 + f * 0.22; ext_q(bx.S, 0.2, 0.7, v, v + 0.01, '#080a14'); ivLine(...bx.S(0.2, v + 0.07), ...bx.S(0.7, v + 0.07), 1.5, '#080a14'); }
        }
      }
      ivPoly([P(-4000, 0, 2.2), P(4000, 0, 2.2), P(4000, 0, 8), P(-4000, 0, 8)], '#0d1120');
      const fy = P(0, 300, 2.4)[1]; ivRR(-1200, fy, 4400, 10, 2, '#1a2036'); for (let x = -1200; x < 3200; x += 60) ivLine(x, fy, x, P(0, 0, 2.4)[1], 4, '#161b30');
      const cx = mod(TT * 60, 3000) - 600; ivCat({ x: cx, y: fy, s: 46, f: 1, coat: { ...IV_COATS.black, key: 'alfence' }, pose: 'walk' });
    } },
    { d: 1, draw: () => {
      const Dw = 1.3;
      // the alley floor: cobbles in perspective, wet
      ivPoly([P(-900, 0, 0.4), P(900, 0, 0.4), P(900, 0, Dw), P(-900, 0, Dw)], '#161b2c');
      for (let D = 0.45; D < Dw; D += 0.07) ivLine(...P(-900, 0, D), ...P(900, 0, D), 2 / D, 'rgba(150,170,255,0.07)', 'butt');
      for (let X = -900; X <= 900; X += 180) ivLine(...P(X, 0, 0.4), ...P(X, 0, Dw), 1.5, 'rgba(0,0,0,0.25)', 'butt');
      ivGlow(1180, 960, 380, 'rgba(160,180,255,0.12)');
      // the gutter down the middle
      ivPoly([P(-40, 0, 0.4), P(40, 0, 0.4), P(40, 0, Dw), P(-40, 0, Dw)], 'rgba(0,0,0,0.3)');
      // the end wall (box) — bricks, a coping slab on top
      const ew = ext_box(P, -900, 900, 0, 520, Dw, 1.55, { col: '#2a2f46', top: '#454b68', edge: 'rgba(170,190,255,0.35)' });
      for (let j = 1; j < 9; j++) { ivLine(...ew.F(0, j / 9), ...ew.F(1, j / 9), 1.5, 'rgba(0,0,0,0.22)', 'butt'); for (let i = 0; i < 12; i++) { const u = (i + (j % 2) * 0.5) / 12; if (u < 1) ivLine(...ew.F(u, (j - 1) / 9), ...ew.F(u, j / 9), 1.5, 'rgba(0,0,0,0.18)', 'butt'); } }
      ext_q(ew.F, 0.12, 0.3, 0.3, 0.6, 'rgba(200,80,90,0.25)'); ivText('BOSS', ...ew.F(0.21, 0.4), 34, 'rgba(240,200,200,0.35)');
      ext_box(P, -920, 920, 520, 545, Dw - 0.02, 1.57, { col: '#3a4060', top: '#5a6288' });
      ivAO(...ew.F(0, 0), ...ew.F(1, 0), 30, 0.45);
      // the side walls
      const lw = ext_box(P, -2600, -900, 0, 1900, 0.4, Dw, { col: '#1c2236', side: '#20273e', edge: false });
      const rw = ext_box(P, 900, 2600, 0, 1800, 0.4, Dw, { col: '#232a42', side: '#262e48', edge: false });
      for (const [m, c] of [[lw.S, 'rgba(0,0,0,0.2)'], [rw.S, 'rgba(0,0,0,0.2)']]) for (let j = 1; j < 24; j++) ivLine(...m(0, j / 24), ...m(1, j / 24), 1.2, c, 'butt');
      ivAO(...lw.S(0, 0), ...lw.S(1, 0), 40, 0.4); ivAO(...rw.S(1, 0), ...rw.S(0, 0), 40, 0.4);
      ivAO(...lw.S(1, 0), ...lw.S(1, 0.3), 30, 0.3); ivAO(...rw.S(1, 0.3), ...rw.S(1, 0), 30, 0.3);
      // left: the market's back door, a bulb (flickers), moths, a vent with steam, a fire escape
      ext_q(lw.S, 0.68, 0.8, 0, 0.13, '#3a2f2a', '#14100e', 4); ext_q(lw.S, 0.7, 0.78, 0.06, 0.11, 'rgba(255,200,120,0.25)');
      const fl = Math.sin(TT * 23) > 0.9 || Math.sin(TT * 3.1) > 0.995 ? 0.3 : 1, bq = lw.S(0.74, 0.16);
      ivDot(bq[0], bq[1], 12, `rgba(255,214,140,${fl})`); ivGlow(bq[0], bq[1], 300, 'rgba(255,200,120,0.5)', fl);
      ivRays([[bq[0] - 8, bq[1]], [bq[0] + 8, bq[1]]], [P(-900, 0, 0.95), P(-300, 0, 1.2)], { n: 4, a: 0.07 * fl, col: [255, 200, 130] });
      ivLightPool([P(-900, 0, 0.92), P(-360, 0, 1.0), P(-420, 0, 1.25), P(-900, 0, 1.25)], `rgba(255,190,110,${0.12 * fl})`);
      for (let i = 0; i < 4; i++) { const a = TT * (3 + i) + i * 2; ivDot(bq[0] + Math.cos(a) * (30 + i * 8), bq[1] + Math.sin(a * 1.3) * 20, 2.5, 'rgba(240,230,210,0.8)'); }
      ext_q(lw.S, 0.88, 0.94, 0.2, 0.26, '#2a3048', '#11152a', 3); for (let i = 0; i < 6; i++) { const u = mod(TT * 0.3 + i / 6, 1), v = lw.S(0.91, 0.26); ext_puff(v[0] + 40 * u + Math.sin(TT + i) * 10, v[1] - u * 200, 30 + u * 60, '200,212,255', 0.16 * Math.sin(Math.PI * u)); }
      for (let k = 0; k < 3; k++) { const v0 = 0.36 + k * 0.2; ext_q(lw.S, 0.62, 0.98, v0, v0 + 0.012, '#0e111e'); for (let i = 0; i <= 6; i++) ivLine(...lw.S(0.62 + i * 0.06, v0), ...lw.S(0.62 + i * 0.06, v0 + 0.06), 2, '#0e111e'); ivLine(...lw.S(0.62, v0 + 0.06), ...lw.S(0.98, v0 + 0.06), 2, '#0e111e'); }
      ext_windows(lw.S, 3, 4, { key: 'allw', v0: 0.3, v1: 0.95, lit: 0.3, litCol: '#e8a85a', glass: 'rgba(14,18,32,0.9)', sheen: false, shade: false, mu: 0.3, mv: 0.3 });
      // right: the garage door (ribs, o.garage lifts it, warm light under it), a pipe that drips into the puddle
      const gu = clamp(o.garage ?? 0.08);
      ext_q(rw.S, 0.62, 0.95, 0, 0.3, '#0c0a08'); ext_q(rw.S, 0.62, 0.95, 0, 0.3 * gu + 0.002, 'rgba(255,190,110,0.5)');
      ext_q(rw.S, 0.62, 0.95, 0.3 * gu, 0.3, '#4a4a56'); for (let j = 0; j < 10; j++) { const v = lerp(0.3 * gu, 0.3, j / 10); ivLine(...rw.S(0.62, v), ...rw.S(0.95, v), 2, 'rgba(0,0,0,0.3)', 'butt'); }
      ext_q(rw.S, 0.6, 0.97, 0.3, 0.32, '#1a1e2e'); ivLightPool([rw.S(0.62, 0), rw.S(0.95, 0), P(400, 0, lerp(0.4, Dw, 0.95)), P(300, 0, lerp(0.4, Dw, 0.62))], `rgba(255,180,100,${0.05 + 0.25 * gu})`);
      ext_q(rw.S, 0.55, 0.58, 0, 0.9, '#2e3448'); const dq = rw.S(0.565, 0.05), du = mod(TT * 0.8, 1); ivDot(dq[0], dq[1] + du * 90, 4, 'rgba(180,200,255,0.8)');
      // the puddle (moon in it, a ripple on each drip)
      const pq = A.puddle; ctx.save(); ctx.beginPath(); ctx.ellipse(pq[0], pq[1], 230, 34, 0, 0, TAU); ctx.fillStyle = 'rgba(110,130,200,0.32)'; ctx.fill(); ctx.clip(); ivDot(pq[0] - 60, pq[1] - 6, 26, 'rgba(240,244,255,0.55)'); ctx.restore();
      ctx.save(); ctx.globalAlpha = 1 - du; ctx.beginPath(); ctx.ellipse(pq[0] - 60, pq[1] - 6, 10 + du * 80, (10 + du * 80) * 0.15, 0, 0, TAU); ctx.strokeStyle = 'rgba(200,215,255,0.6)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      // the dumpster against the garage, crates by the market
      const dp = ext_box(P, 480, 880, 0, 360, 1.06, 1.28, { col: '#3e5a46', top: '#567a60', side: '#2c4232' }); ext_box(P, 460, 895, 360, 390, 1.04, 1.29, { col: '#2c4232', top: '#4a6a52' }); ivAO(...dp.F(0, 0), ...dp.F(1, 0), 20, 0.5);
      ext_q(dp.F, 0.1, 0.9, 0.55, 0.62, 'rgba(0,0,0,0.25)');
      ext_box(P, -890, -650, 0, 260, 1.08, 1.26, { col: '#6a5034', top: '#8a6a48', side: '#4e3a26' }); ext_box(P, -870, -680, 260, 460, 1.12, 1.26, { col: '#735638', top: '#93714c', side: '#553f28' });
      ext_box(P, -630, -440, 0, 200, 1.14, 1.28, { col: '#5e462e', top: '#7e6040', side: '#46341f' });
      // the cats on the wall: back row first; Boss's spot stays free
      const shown = A.wallTop.slice(0, n).map((s, i) => ({ s, i })).sort((a, b) => b.s[4] - a.s[4] || a.s[0] - b.s[0]), yw = clamp(o.yowl ?? 0);
      for (const { s, i } of shown) { const coat = { ...CATS.alley[i % CATS.alley.length], key: 'alw' + i }, far = Math.abs(s[0] - 960) / 640, r = hash('alc', i) % 10;
        ivCat({ x: s[0], y: s[1], s: s[2], f: s[3], coat, pose: far < yw ? 'yowl' : r < 3 ? 'loaf' : 'sit', expr: { eyes: r < 4 ? 'angry' : r < 6 ? 'half' : 'open' }, look: [s[3] * -0.3, 0.6] }); }
      o.act && o.act();
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ivLine(-300, -200, 2400, -60, 10, '#06070c'); ivLine(-300, -120, 2400, 40, 6, '#06070c'); ivRR(1900, 700, 500, 700, 30, '#0a0c14'); ivRR(-400, 980, 520, 400, 30, '#0a0c14'); } }]),
  ];
}
// ---------------------------------------------------------------------
//  ROOFS — night. City rooftops in deep layers seen from a roof: the near roofs (d 1, three blocks with gaps, where
//  actors and Pickles stand: GROUND), mid roofs (d 1.8), far roofs (d 3.2), the skyline and the moon. Chimneys, water
//  tanks, antennas, skylights, lit windows. o.cats: how many cats on the roofs (0..60), filled outward from o.from
//  (a screen point, default the centre) so a yowl can spread; o.yowl 0..1 share of them yowling (same order).
//  SET_POS2.roofs.path: a cat's run roof to roof on d 1 ([x, y] points, jumps included); .roofs: the near roof tops.
// ---------------------------------------------------------------------
SET_POS2.roofs = { vp: [960, 470], maxCats: 60,   // (the slot count may be a bit under 60: o.cats is clamped by it)
  path: [[-300, 900], [300, 900], [700, 900], [790, 880], [900, 760], [1010, 790], [1120, 880], [1180, 900], [1500, 900], [1840, 900], [1930, 860], [2040, 720], [2160, 760], [2250, 860], [2600, 860], [3000, 860]],
  roofs: [[-1100, 810, 900], [1110, 1860, 900], [2060, 3400, 860]], tank: [1640, 560], chimney: [210, 640] };
const EXT_ROOFSLOTS = [];   // filled once: { d, x, y, s, f, i }
function ext_roofBlock(P, X0, X1, Ytop, D0, D1, c, key, o = {}) {
  const r = RNG('rb' + key).f, bx = ext_box(P, X0, X1, Ytop - 2600, Ytop, D0, D1, { col: c, side: ivShade(c, -0.25), top: ivShade(c, 0.12), edge: o.edge || 'rgba(170,190,255,0.35)' });
  ext_windows(bx.F, Math.max(1, Math.round((X1 - X0) / 300)), 6, { key: 'rbw' + key, v0: 0.55, v1: 0.98, lit: o.lit ?? 0.35, litCol: '#f2b866', glass: 'rgba(14,18,32,0.9)', sheen: false, mu: 0.28, mv: 0.3 });
  if (bx.S) ext_windows(bx.S, 3, 6, { key: 'rbs' + key, v0: 0.55, v1: 0.98, lit: (o.lit ?? 0.35) * 0.8, litCol: '#e8a85a', glass: 'rgba(10,13,24,0.9)', sheen: false, mu: 0.3, mv: 0.3 });
  // the parapet along the front and the roof clutter (back to front)
  const items = [];
  const nI = o.items ?? 2;
  for (let k = 0; k < nI; k++) { const kind = Math.floor(r() * 4), X = lerp(X0 + 150, X1 - 150, r()), D = lerp(D0 + (D1 - D0) * 0.35, D1 - 0.05, r()); items.push({ kind, X, D }); }
  items.sort((a, b) => b.D - a.D).forEach(({ kind, X, D }) => {
    if (kind === 0) { ext_box(P, X - 70, X + 70, Ytop, Ytop + 420, D, D + 0.08, { col: '#3a2a2e', top: '#4a3a3e' }); const q = P(X, Ytop + 440, D); ext_puff(q[0], q[1] - 30 / D, 50 / D, '170,180,220', 0.12); }
    else if (kind === 1) { const q = P(X, Ytop, D), s = 1 / D; for (const dx of [-60, 60]) ivLine(q[0] + dx * s, q[1], q[0] + dx * 0.8 * s, q[1] - 160 * s, 8 * s, '#0c0e1a'); ivRR(q[0] - 110 * s, q[1] - 420 * s, 220 * s, 270 * s, 20 * s, '#2a2230'); ivPoly([[q[0] - 118 * s, q[1] - 420 * s], [q[0], q[1] - 500 * s], [q[0] + 118 * s, q[1] - 420 * s]], '#221a28'); for (let i = 1; i < 4; i++) ivLine(q[0] - 110 * s, q[1] - (420 - i * 68) * s, q[0] + 110 * s, q[1] - (420 - i * 68) * s, 3 * s, 'rgba(0,0,0,0.3)'); }
    else if (kind === 2) { const q = P(X, Ytop, D), s = 1 / D; ivLine(q[0], q[1], q[0], q[1] - 600 * s, 4 * s, '#0c0e1a'); for (let i = 0; i < 3; i++) ivLine(q[0] - (90 - i * 25) * s, q[1] - (420 + i * 60) * s, q[0] + (90 - i * 25) * s, q[1] - (420 + i * 60) * s, 3 * s, '#0c0e1a'); if (Math.sin(TT * 3 + X) > 0) ivDot(q[0], q[1] - 600 * s, 5 * s + 1, '#ff4a3a'); }
    else { const sk = ext_box(P, X - 120, X + 120, Ytop, Ytop + 90, D, D + 0.12, { col: '#2a3048', top: 'rgba(255,214,150,0.55)' }); void sk; }
  });
  ext_box(P, X0, X1, Ytop, Ytop + 70, D0, D0 + 0.03, { col: ivShade(c, 0.08), top: ivShade(c, 0.25), edge: o.edge || 'rgba(170,190,255,0.4)' });
  return bx;
}
function SET_roofs(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.extRoofs; const P = ext_proj(960, 470), n = clamp(Math.round(o.cats ?? 0), 0, 60), from = o.from || [960, 600], yw = clamp(o.yowl ?? 0);
  // the roof blocks (built once) and the cat slots on their parapets, ordered outward from `from`
  if (!EXT_ROOFSLOTS.length) {
    const r = RNG('roofSlots').f, B = (EXT_ROOFSLOTS.blocks = { 3.2: [], 1.8: [] });
    for (let i = 0; i < 9; i++) { const X0 = -6400 + i * 1500 + r() * 200, D = 4 + r() * 0.8; B[3.2].push({ X0, X1: X0 + 1100 + r() * 300, Y: r() < 0.45 ? 100 + r() * 300 : 700 + r() * 1100, D, c: ['#151a30', '#191e36', '#12172a'][i % 3], k: 'f' + i }); }
    for (let i = 0; i < 7; i++) { const X0 = -3600 + i * 1100 + r() * 120, D = 2.1 + r() * 0.3; B[1.8].push({ X0, X1: X0 + 850 + r() * 120, Y: 60 + r() * 330, D, c: ['#1c2238', '#20263e', '#191e32'][i % 3], k: 'm' + i }); }
    for (const d of [3.2, 1.8]) for (const b of B[d]) { if (b.Y > P.eye) continue; const m = Math.max(1, Math.round((b.X1 - b.X0) / (d > 2 ? 260 : 220))); for (let j = 0; j < m; j++) { const X = lerp(b.X0 + 80, b.X1 - 80, (j + 0.2 + r() * 0.6) / m), q = P(X, b.Y + 70, b.D + 0.015); EXT_ROOFSLOTS.push({ d, x: q[0], y: q[1], s: 150 / b.D, f: r() < 0.5 ? 1 : -1, pose: r() < 0.3 ? 'loaf' : 'sit' }); } }
    for (const [X0, X1, Y] of [[-2400, -300, 0], [250, 850, 0], [1250, 2500, 40]]) for (let j = 0; j < 5; j++) { const X = lerp(X0, X1, r()), D = 1.2 + r() * 0.35, q = P(X, Y, D); EXT_ROOFSLOTS.push({ d: 1, x: q[0], y: q[1], s: 150 / D, f: r() < 0.5 ? 1 : -1, pose: r() < 0.3 ? 'loaf' : 'sit' }); }
    EXT_ROOFSLOTS.sort((a, b) => a.y - b.y).forEach((sl, i) => { sl.i = i; });
  }
  const order = EXT_ROOFSLOTS.map((sl) => ({ sl, k: Math.hypot(sl.x - from[0], (sl.y - from[1]) * 1.4) * (sl.d === 1 ? 1.25 : 1) })).sort((a, b) => a.k - b.k).map((x) => x.sl);
  const shown = new Map(order.slice(0, n).map((sl, k) => [sl, k]));
  const cats = (d) => { for (const sl of EXT_ROOFSLOTS) if (sl.d === d && shown.has(sl)) { const k = shown.get(sl); ivCat({ x: sl.x, y: sl.y, s: sl.s, f: sl.f, coat: { ...CATS.alley[sl.i % CATS.alley.length], key: 'rc' + sl.i }, pose: k < yw * n ? 'yowl' : sl.pose }); } };
  return [
    { d: 6, draw: () => { ext_sky(['#04060d', '#0c1430', '#1e2a50'], -700, 600); ext_stars('rfst', 180, [-1200, -600, 3200, 420]); ext_moon(1420, 110, 80); ext_clouds('rfcl', 5, -150, 200, 'rgba(40,52,95,0.55)', 6);
      ext_skyline('rfsk', 560, '#0d1226', { h0: 60, h1: 220, lit: 0.35, litCol: '#d8a060' }); } },
    { d: 3.2, draw: () => {
      for (const b of EXT_ROOFSLOTS.blocks[3.2]) ext_roofBlock(P, b.X0, b.X1, b.Y, b.D, b.D + 1, b.c, b.k, { items: 2, lit: 0.4 });
      cats(3.2);
    } },
    { d: 1.8, draw: () => {
      for (const b of EXT_ROOFSLOTS.blocks[1.8]) ext_roofBlock(P, b.X0, b.X1, b.Y, b.D, b.D + 0.8, b.c, b.k, { items: 2, lit: 0.35 });
      ext_fog(P(0, 0, 2.6)[1], 120, 'rgba(120,140,200,0.5)', 0.25, 'rffog', 10);
      cats(1.8);
    } },
    { d: 1, draw: () => {
      // three near roofs with gaps: A (we stand on it), B, C (a step up)
      ext_roofBlock(P, 1100, 2600, 40, 0.62, 1.7, '#262c44', 'C', { items: 0 });
      ext_roofBlock(P, 150, 900, 0, 0.62, 1.6, '#2a3048', 'B', { items: 0 });
      ext_roofBlock(P, -2600, -150, 0, 0.62, 1.6, '#2c3250', 'A', { items: 0 });
      // tar-paper seams on the roofs, a moon sheen
      for (const [X0, X1, Y] of [[-2600, -150, 0], [150, 900, 0], [1100, 2600, 40]]) for (let D = 0.7; D < 1.6; D += 0.12) ivLine(...P(X0, Y, D), ...P(X1, Y, D), 1.5, 'rgba(0,0,0,0.18)', 'butt');
      ivLightPool([P(-1500, 0, 1.0), P(-300, 0, 1.0), P(-300, 0, 1.5), P(-1500, 0, 1.5)], 'rgba(150,170,255,0.06)');
      // the clutter on them: a chimney (A), the stair hut with a lit door (A), the water tank (B), an antenna (C)
      const hut = ext_box(P, -2200, -1500, 0, 520, 1.25, 1.55, { col: '#3a3450', top: '#4a4462' }); ext_q(hut.F, 0.6, 0.85, 0, 0.75, 'rgba(255,200,120,0.75)'); const hd = hut.F(0.72, 0.4); ivGlow(hd[0], hd[1], 260, 'rgba(255,190,110,0.35)');
      ivLightPool([P(-1820, 0, 1.25), P(-1590, 0, 1.25), P(-1500, 0, 0.95), P(-1950, 0, 0.95)], 'rgba(255,190,110,0.18)'); ivAO(...hut.F(0, 0), ...hut.F(1, 0), 22, 0.4);
      const ch = ext_box(P, -830, -660, 0, 420, 1.3, 1.4, { col: '#4a2e2e', top: '#5e3c3a' }); for (let j = 1; j < 6; j++) ivLine(...ch.F(0, j / 6), ...ch.F(1, j / 6), 1.5, 'rgba(0,0,0,0.25)', 'butt');
      for (let i = 0; i < 4; i++) { const u = mod(TT * 0.25 + i / 4, 1), q = P(-745, 440, 1.35); ext_puff(q[0] + u * 60, q[1] - u * 220, 40 + u * 60, '180,190,230', 0.18 * Math.sin(Math.PI * u)); }
      const tq = P(700, 0, 1.45), s = 1 / 1.45; for (const dx of [-120, 120]) ivLine(tq[0] + dx * s, tq[1], tq[0] + dx * 0.8 * s, tq[1] - 300 * s, 10 * s, '#0c0e1a');
      ivRR(tq[0] - 210 * s, tq[1] - 760 * s, 420 * s, 480 * s, 34 * s, '#3a2e3a'); ivPoly([[tq[0] - 222 * s, tq[1] - 760 * s], [tq[0], tq[1] - 900 * s], [tq[0] + 222 * s, tq[1] - 760 * s]], '#2e2430');
      for (let i = 1; i < 6; i++) ivLine(tq[0] - 210 * s, tq[1] - (760 - i * 80) * s, tq[0] + 210 * s, tq[1] - (760 - i * 80) * s, 4 * s, 'rgba(0,0,0,0.3)');
      ivRR(tq[0] + 60 * s, tq[1] - 760 * s, 40 * s, 480 * s, 10 * s, 'rgba(170,190,255,0.18)');
      const aq = P(2000, 40, 1.5); ivLine(aq[0], aq[1], aq[0], aq[1] - 520, 5, '#0c0e1a'); for (let i = 0; i < 4; i++) ivLine(aq[0] - 90 + i * 15, aq[1] - 360 - i * 45, aq[0] + 90 - i * 15, aq[1] - 360 - i * 45, 4, '#0c0e1a'); if (Math.sin(TT * 2.4) > 0) { ivDot(aq[0], aq[1] - 520, 6, '#ff4a3a'); ivGlow(aq[0], aq[1] - 520, 60, 'rgba(255,70,50,0.7)'); }
      // a clothesline on roof B, sheets sway
      const c1 = P(200, 520, 1.2), c2 = P(880, 520, 1.5); ivLine(...c1, ...c2, 2, '#0c0e1a'); for (let i = 0; i < 3; i++) { const u = 0.2 + i * 0.28, x = lerp(c1[0], c2[0], u), y = lerp(c1[1], c2[1], u) + 10, sw = Math.sin(TT * 1.6 + i) * 8; ivPoly([[x - 40, y], [x + 40, y], [x + 40 + sw, y + 110], [x - 40 + sw, y + 106]], ['#c8c0d8', '#8a9ac8', '#d8b8c0'][i]); }
      cats(1);
      o.act && o.act();
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ivLine(-200, 1400, -60, -300, 14, '#05060c'); for (let i = 0; i < 5; i++) ivLine(-260 + i * 10, 200 + i * 90, 160 - i * 10, 200 + i * 90, 8, '#05060c'); ivLine(-300, 120, 2400, 60, 4, '#05060c'); ivRR(1960, 900, 400, 600, 20, '#07080f'); } }]),
  ];
}
// ---------------------------------------------------------------------
//  TRAIN YARD — night. Tracks converge to the vanishing point (left of centre); a line of broken train cars recedes
//  on the left track; car 9 stands across a siding on the right, its long side to us (box, the end toward the vanishing
//  point shows), its sliding door: o.door 0..1 (open), o.inside() drawn inside the opening (Lily), o.balloon (true: a
//  red balloon tied to the door). Moonlight + one floodlight with rays, drifting fog, a far train light, a blinking signal.
//  SET_POS2.trainYard.car9 = { x0, x1, top, base, door: [x0, y0, x1, y1], floor, num: [x, y], tie: [x, y] } (d 1 coords)
// ---------------------------------------------------------------------
SET_POS2.trainYard = (() => { const P = ext_proj(760, 420), D = 1.35, f = (X, Y) => P(X, Y, D), X0 = 260, X1 = 1560, dx0 = lerp(X0, X1, 0.34), dx1 = lerp(X0, X1, 0.56);
  return { vp: [760, 420], car9: { x0: f(X0, 0)[0], x1: f(X1, 0)[0], top: f(0, 900)[1], base: f(0, 0)[1], door: [f(dx0, 0)[0], f(0, 820)[1], f(dx1, 0)[0], f(0, 170)[1]], floor: f(0, 170)[1], num: [f(lerp(X0, X1, 0.8), 0)[0], f(0, 560)[1]], tie: [f(dx0, 0)[0] - 6, f(0, 470)[1]], D }, flood: [593, 80] }; })();
// a train car along a receding track (body box, roof, wheels, windows; o.broken boards some windows, o.num paints a number)
function ext_trainCar(P, Xc, D0, D1, o = {}) {
  const w = 620, X0 = Xc - w / 2, X1 = Xc + w / 2, c = o.col || '#5a3a32';
  const bx = ext_box(P, X0, X1, 150, 860, D0, D1, { col: c, side: ivShade(c, -0.12), edge: 'rgba(170,190,255,0.25)' });
  ext_box(P, X0 + 20, X1 - 20, 860, 920, D0 + 0.02, D1 - 0.02, { col: ivShade(c, -0.25), edge: false });
  if (bx.S) { const n = Math.round((D1 - D0) / 0.22), r = RNG('tc' + Xc + D0).f;
    for (let i = 0; i < n; i++) { const u0 = (i + 0.2) / n, u1 = (i + 0.8) / n; ext_q(bx.S, u0, u1, 0.45, 0.8, o.broken && r() < 0.5 ? '#3a2a22' : 'rgba(20,24,40,0.9)');
      if (o.broken && r() < 0.4) { ivLine(...bx.S(u0, 0.45), ...bx.S(u1, 0.8), 2, '#7a5a40'); ivLine(...bx.S(u1, 0.45), ...bx.S(u0, 0.8), 2, '#7a5a40'); } }
    ext_q(bx.S, 0.05, 0.95, 0.3, 0.33, 'rgba(0,0,0,0.25)');
    if (o.tag) { ivPoly([bx.S(0.3, 0.12), bx.S(0.6, 0.15), bx.S(0.6, 0.3), bx.S(0.3, 0.27)], 'rgba(200,90,140,0.4)'); }
    for (const u of [0.12, 0.25, 0.75, 0.88]) { const a = bx.S(u - 0.04, 0), b = bx.S(u + 0.04, 0), q = P(bx.sideX, 0, lerp(D0, D1, u)); ivPoly([[a[0], a[1]], [b[0], b[1]], [b[0], q[1] + 4], [a[0], q[1] + 4]], '#121216'); } }
  ext_q(bx.F, 0.25, 0.75, 0.45, 0.8, 'rgba(20,24,40,0.9)'); ext_q(bx.F, 0.1, 0.9, 0, 0.06, '#121216');
  for (const u of [0.15, 0.85]) { const q = bx.F(u, 0), s = 1 / D0; ivRR(q[0] - 40 * s, q[1], 80 * s, 150 * s, 10 * s, '#121216'); }
  return bx;
}
function SET_trainYard(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.extYard; const P = ext_proj(760, 420), T9 = SET_POS2.trainYard.car9, door = clamp(o.door ?? 1);
  const tracks = [-2600, -1300, 0, 1300];
  return [
    { d: 5, draw: () => { ext_sky(['#03050c', '#0c1430', '#222c50'], -700, 520); ext_stars('tyst', 160); ext_moon(1560, 90, 58); ext_clouds('tycl', 4, -100, 180, 'rgba(40,52,95,0.55)', 5);
      ext_skyline('tysk', 470, '#0b0f20', { h0: 30, h1: 160, lit: 0.3, litCol: '#d8a060' });
      // a far bridge with a train sliding across, lit windows
      ivRR(-1200, 380, 4400, 14, 0, '#0b0f20'); for (let x = -1200; x < 3200; x += 160) ivLine(x, 394, x + 80, 470, 4, '#0b0f20');
      const tx = mod(TT * 140, 4200) - 1600; ivRR(tx, 352, 520, 28, 6, '#141a30'); for (let i = 0; i < 12; i++) ivRR(tx + 14 + i * 42, 358, 26, 12, 2, '#f2c27a'); } },
    { d: 2.2, draw: () => {
      // the ground: gravel, the tracks (rails + sleepers in perspective)
      ivPoly([P(-9000, 0, 0.35), P(9000, 0, 0.35), P(9000, 0, 80), P(-9000, 0, 80)], '#1c2030');
      const hz = ctx.createLinearGradient(0, P.vp[1], 0, P.vp[1] + 260); hz.addColorStop(0, 'rgba(90,110,170,0.4)'); hz.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = hz; ctx.fillRect(-1500, P.vp[1], 5000, 260);
      for (const X of tracks) { ivPoly([P(X - 420, 0, 0.35), P(X + 420, 0, 0.35), P(X + 420, 0, 80), P(X - 420, 0, 80)], '#262a38');
        for (let D = 0.4; D < 25; D *= 1.07) ivPoly([P(X - 330, 0, D), P(X + 330, 0, D), P(X + 330, 0, D + 0.02 * D), P(X - 330, 0, D + 0.02 * D)], '#3a2e28');
        for (const g of [-220, 220]) { ivPoly([P(X + g - 14, 0, 0.35), P(X + g + 14, 0, 0.35), P(X + g + 14, 0, 80), P(X + g - 14, 0, 80)], '#6a7088'); ivLine(...P(X + g - 6, 0, 0.35), ...P(X + g - 6, 0, 80), 1.5, 'rgba(200,215,255,0.5)'); } }
      // the far train light coming down the middle track
      const tl = 18 - mod(TT * 1.2, 14), lq = P(0, 300, tl); ivGlow(lq[0], lq[1], 260 / tl + 30, 'rgba(255,240,200,0.6)'); ivDot(lq[0], lq[1], 40 / tl + 2, '#fff6dc');
      // the line of broken cars on the left track, receding; a cat walks along their roofs
      ext_trainCar(P, -1300, 9.5, 11.4, { col: '#2a3a48', broken: true }); ext_trainCar(P, -1300, 6.6, 9.2, { col: '#4a3a2e', broken: true, tag: true });
      ctx.save(); const piv = P(-1300, 0, 4); ctx.translate(piv[0], piv[1]); ctx.rotate(-0.04); ctx.translate(-piv[0], -piv[1]); ext_trainCar(P, -1300, 3.8, 6.3, { col: '#5a3a32', broken: true, tag: true }); ctx.restore();
      const cu = mod(TT / 8, 1), cq = P(-1300, 920, lerp(6.5, 9, cu)); ivCat({ x: cq[0], y: cq[1], s: 140 / lerp(6.5, 9, cu), f: -1, coat: { ...IV_COATS.black, key: 'tycat' }, pose: 'walk' });
      ext_trainCar(P, -2600, 2.6, 4.6, { col: '#3a4a3a', broken: true });
      // the floodlight: a tall mast, its rays to the ground, the pool, moths
      const fb = P(-500, 0, 3.0), ft = P(-500, 1500, 3.0); ivLine(fb[0], fb[1], ft[0], ft[1], 8, '#141826', 'butt'); for (let i = 1; i < 10; i++) ivLine(ft[0] - 6, lerp(fb[1], ft[1], i / 10), ft[0] + 6, lerp(fb[1], ft[1], i / 10 + 0.04), 2, '#141826');
      ivRR(ft[0] - 46, ft[1] - 20, 92, 36, 6, '#1a1e2c'); ivRR(ft[0] - 40, ft[1] + 10, 80, 10, 3, '#fff2d0'); ivGlow(ft[0], ft[1] + 14, 220, 'rgba(255,236,200,0.7)');
      ivRays([[ft[0] - 40, ft[1] + 16], [ft[0] + 40, ft[1] + 16]], [P(-1800, 0, 1.6), P(1200, 0, 1.7)], { n: 6, a: 0.09, col: [230, 236, 255] });
      ivLightPool([P(-1700, 0, 1.6), P(1100, 0, 1.6), P(600, 0, 3.6), P(-1200, 0, 3.6)], 'rgba(220,230,255,0.08)');
      for (let i = 0; i < 6; i++) { const a = TT * (2 + i * 0.4) + i; ivDot(ft[0] + Math.cos(a) * (30 + i * 9), ft[1] + 40 + Math.sin(a * 1.4) * 22, 2.4, 'rgba(240,236,220,0.8)'); }
      // the signal mast on the right: red blinking
      const sb = P(2300, 0, 2.6), st = P(2300, 1200, 2.6); ivLine(sb[0], sb[1], st[0], st[1], 6, '#141826'); ivRR(st[0] - 18, st[1] - 10, 36, 70, 8, '#0c0e18'); const on = mod(TT, 1.2) < 0.6;
      ivDot(st[0], st[1] + 8, 9, on ? '#ff3a2a' : '#4a1a16'); if (on) ivGlow(st[0], st[1] + 8, 90, 'rgba(255,60,40,0.7)'); ivDot(st[0], st[1] + 38, 9, '#163a20');
      ext_fog(P(0, 0, 3)[1], 160, 'rgba(150,170,220,0.6)', 0.28, 'tyfog1', 16);
    } },
    { d: 1, draw: () => {
      const D = T9.D, X0 = 260, X1 = 1560, f = (X, Y) => P(X, Y, D);
      // the siding under car 9: sleepers + two rails running across the frame
      for (let x = -1400; x < 3400; x += 90) ivPoly([[x, P(0, 0, 1.22)[1]], [x + 44, P(0, 0, 1.22)[1]], [x + 40, P(0, 0, 1.55)[1]], [x + 4, P(0, 0, 1.55)[1]]], '#3a2e28');
      for (const Dr of [1.28, 1.48]) { const y = P(0, 0, Dr)[1]; ivRR(-1400, y - 7, 4800, 12, 2, '#6a7088'); ivLine(-1400, y - 6, 3400, y - 6, 2, 'rgba(200,215,255,0.5)'); }
      // car 9: a box, its long side to us, the end toward the vanishing point shows
      const c9 = ext_box(P, X0, X1, 150, 900, D, D + 0.32, { col: '#6a3e30', side: '#4a2a22', edge: 'rgba(200,215,255,0.35)' });
      ext_box(P, X0 + 20, X1 - 20, 900, 950, D + 0.02, D + 0.3, { col: '#4a2a22', edge: false });
      for (let i = 1; i < 14; i++) ivLine(...c9.F(i / 14, 0.04), ...c9.F(i / 14, 0.96), 2, 'rgba(0,0,0,0.16)', 'butt');
      ext_q(c9.F, 0, 1, 0, 0.05, '#2a1814'); ext_q(c9.F, 0.05, 0.25, 0.55, 0.85, 'rgba(20,24,40,0.9)'); ext_q(c9.F, 0.63, 0.7, 0.55, 0.85, 'rgba(20,24,40,0.9)');
      ivPoly([c9.F(0.72, 0.15), c9.F(0.96, 0.18), c9.F(0.95, 0.3), c9.F(0.74, 0.26)], 'rgba(160,90,60,0.4)');   // rust
      const nq = SET_POS2.trainYard.car9.num; ivText('9', nq[0], nq[1] + 70, 190, '#f2e2c4', { shadow: 'rgba(0,0,0,0.4)' });
      for (const u of [0.1, 0.24, 0.76, 0.9]) { const q = c9.F(u, 0); ivDot(q[0], q[1] + 40, 60, '#121216'); ivDot(q[0], q[1] + 40, 24, '#2a2a30'); }
      ivAO(...f(X0, 0), ...f(X1, 0), 30, 0.45);
      // the door opening: dark inside, a moonbeam, o.inside(), then the sliding panel
      const [dx0, dy0, dx1, dy1] = T9.door, dw = dx1 - dx0;
      ctx.save(); ctx.beginPath(); ctx.rect(dx0, dy0, dw, dy1 - dy0); ctx.clip();
      ctx.fillStyle = ivVGrad(dy0, dy1, ['#0c0e18', '#1a1a26']); ctx.fillRect(dx0, dy0, dw, dy1 - dy0);
      ivRays([[dx0 + dw * 0.6, dy0], [dx0 + dw * 1.1, dy0]], [[dx0 + dw * 0.1, dy1], [dx0 + dw * 0.6, dy1]], { n: 3, a: 0.12, col: [190, 210, 255] });
      o.inside && o.inside();
      ctx.restore();
      ivRR(dx0 - 6, dy1, dw + 12, 10, 2, '#2a1814');
      const px = dx0 + dw * door; ivRR(px, dy0 - 8, dw, dy1 - dy0 + 8, 4, '#7a4636'); for (let i = 1; i < 5; i++) ivLine(px + dw * i / 5, dy0, px + dw * i / 5, dy1, 2, 'rgba(0,0,0,0.2)'); ivRR(px + 12, (dy0 + dy1) / 2 - 30, 14, 60, 4, '#2a1814');
      ivLine(dx0 - 10, dy0 - 10, dx1 + dw + 10, dy0 - 10, 6, '#2a1814');
      if (o.balloon) { const tq = T9.tie, sw = Math.sin(TT * 1.4) * 14; ext_balloon(tq[0] - 70 + sw, tq[1] - 170, 46, '#e23a30', tq[0], tq[1]); }
      // gravel tufts and weeds in front
      const r = RNG('tyw').f; for (let i = 0; i < 26; i++) { const x = -1200 + r() * 4400, y = P(0, 0, 1.0 + r() * 0.25)[1]; for (let k = -2; k <= 2; k++) ivLine(x, y, x + k * 7 + Math.sin(TT * 1.5 + i) * 3, y - 24 - r() * 20, 2, '#2a3a2a'); }
      o.act && o.act();
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { for (let x = -400; x < 2500; x += 46) { ivLine(x, 1100, x + 46, 1054, 2, 'rgba(10,12,20,0.8)'); ivLine(x + 46, 1100, x, 1054, 2, 'rgba(10,12,20,0.8)'); } ivLine(-400, 1054, 2500, 1054, 5, '#0a0c14'); ivLine(-120, 1400, -120, 950, 14, '#0a0c14'); ivLine(2100, 1400, 2100, 950, 14, '#0a0c14'); } }]),
  ];
}
// ---------------------------------------------------------------------
//  SHELTER — morning. The market corner the next morning: the market (box: shutters, one rolling up, a sign) on the left,
//  its side running down the street to the vanishing point; low sun through the gap (rays, long shadows); the little
//  wooden cat house with the sign "BOSS'S HOUSE" (box + gable roof, round doors); a row of bowls on the ground, cats
//  eating at them. o.cats (default 8, max 12) cats at the bowls; o.bowls (default true) full bowls; o.shutter 0..1.
//  SET_POS2.shelter = { house: [x0, x1, top, base], sign: [x, y], doors: [[x, y]…], bowls: [[x, y, s]…], vp }
// ---------------------------------------------------------------------
SET_POS2.shelter = (() => { const P = ext_proj(1150, 470), bowls = [];
  for (const [X, D] of [[-700, 0.98], [-460, 1.02], [-220, 1.06], [440, 1.04], [660, 1.0], [880, 0.97], [-430, 1.45], [-430, 1.75], [-430, 2.1], [-430, 2.5], [-430, 3], [-430, 3.6]]) { const q = P(X, 0, D); bowls.push([q[0], q[1], 1 / D]); }
  const H = (X, Y) => P(X, Y, 1.25);
  return { vp: [1150, 470], house: [H(-100, 0)[0], H(360, 0)[0], H(0, 480)[1], H(0, 0)[1]], sign: [H(130, 370)[0], H(0, 370)[1]], doors: [[H(20, 0)[0], H(0, 0)[1]], [H(240, 0)[0], H(0, 0)[1]]], bowls }; })();
function SET_shelter(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.extMorning; const P = ext_proj(1150, 470), S = SET_POS2.shelter, n = clamp(Math.round(o.cats ?? 8), 0, 12);
  const cols = ['#d8a07a', '#c9b08a', '#b0a0c0', '#d8c49a', '#b8c8a8'];
  const bowl = (x, y, s, full) => { ctx.beginPath(); ctx.ellipse(x, y - 2 * s, 46 * s, 14 * s, 0, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 44 * s, y - 22 * s); ctx.lineTo(x + 44 * s, y - 22 * s); ctx.lineTo(x + 34 * s, y - 2 * s); ctx.lineTo(x - 34 * s, y - 2 * s); ctx.closePath(); ctx.fillStyle = '#c8463c'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(x, y - 22 * s, 44 * s, 12 * s, 0, 0, TAU); ctx.fillStyle = '#e06a5a'; ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y - 21 * s, 36 * s, 9 * s, 0, 0, TAU); ctx.fillStyle = full ? '#9a5a3a' : '#5a1a16'; ctx.fill();
    if (full) for (let i = 0; i < 6; i++) ivDot(x + (i - 2.5) * 10 * s, y - 24 * s + (i % 2) * 3 * s, 4 * s, '#b8724a'); };
  return [
    { d: 5, draw: () => { ext_sky(['#7aa8d8', '#f2c8a0', '#ffe2b8'], -600, 560); ivDot(240, 300, 70, '#fff4d8'); ivGlow(240, 300, 700, 'rgba(255,220,160,0.6)'); ext_clouds('shc', 6, -150, 240, 'rgba(255,236,220,0.7)', 4); ext_skyline('shs', 520, '#c8b0a8', { h0: 40, h1: 180 }); } },
    { d: 2.2, draw: () => {
      ext_row(P, { X: 1500, deep: 900, segs: [1.5, 2.2, 3, 4, 5.3, 7, 9.5, 13, 19], key: 'shR', cols, h: [1300, 2300], shops: true });
      ext_ground(P, { road: [-200, 1100], walk: [-400, 1500], cRoad: '#6a6470', cWalk: '#c8b8a8', dash: 450, Dn: 0.4, haze: 'rgba(255,220,180,0.4)' });
      const things = []; const vd = ext_loopD(16, 3, 0.9, 'shVan'); things.push({ D: vd, f: () => { const b = ext_car(P, 780, vd, { col: '#f2efe8', toward: true, len: 1.0 }); ext_q(b.F, 0.2, 0.8, 0.6, 0.9, '#3c7a8a'); } });
      [['extraA', 1250, 9, 2.4, 'toward'], ['kidD', 1300, 3, 10, 'away']].forEach(([w, X, a, b, dir], k) => { const D = ext_loopD(a, b, 0.3, 'shw' + k); things.push({ D, f: () => ext_person(P, CAST[w], X, D, { walk: dir }) }); });
      things.sort((a, b) => b.D - a.D).forEach((t) => t.f());
    } },
    { d: 1.4, draw: () => {
      // the market: front faces us, its side runs down the street; shutters, one rolling up; the sign; a coffee steam vent
      const mk = ext_box(P, -3400, -400, 0, 1500, 1.6, 9, { col: '#b8866a', side: '#9a6e56', edge: 'rgba(255,240,220,0.4)' });
      ext_windows(mk.S, 10, 3, { key: 'mkS', v0: 0.42, v1: 0.95, mu: 0.25, mv: 0.2 });
      ext_q(mk.F, 0.02, 0.98, 0.32, 0.4, '#3c6a4a'); ivText('CITY MARKET', ...ext_mix(mk.F(0.5, 0.34), mk.F(0.5, 0.34), 0), 44, '#f4ead8', { track: 4 });
      const su = clamp(o.shutter ?? (0.3 + 0.7 * EZ.io(clamp(TT / 6))));
      for (let i = 0; i < 4; i++) { const u0 = 0.05 + i * 0.235, u1 = u0 + 0.2; ext_q(mk.F, u0, u1, 0, 0.28, 'rgba(255,214,150,0.7)'); const top = i === 2 ? 0.28 * su : 0;
        ext_q(mk.F, u0, u1, top, 0.28, '#8a8c94'); for (let k = 1; k < 9; k++) { const v = lerp(top, 0.28, k / 9); ivLine(...mk.F(u0, v), ...mk.F(u1, v), 1.5, 'rgba(0,0,0,0.18)', 'butt'); } }
      for (let i = 0; i < 6; i++) ext_q(mk.S, 0.02 + i * 0.07, 0.07 + i * 0.07, 0, 0.25, i % 2 ? '#8a8c94' : 'rgba(255,214,150,0.6)');
      ivAO(...mk.F(0, 0), ...mk.F(1, 0), 24, 0.35); ivAO(...mk.S(0, 0), ...mk.S(1, 0), 20, 0.3);
      // sun rays from the left through the morning haze, a warm pool and long shadows
      ivRays([[-300, -300], [500, -200]], [P(-300, 0, 1.0), P(1600, 0, 1.4)], { n: 6, a: 0.08, col: [255, 214, 160] });
      ivLightPool([P(-350, 0, 0.6), P(1500, 0, 0.6), P(1500, 0, 2.2), P(-350, 0, 2.2)], 'rgba(255,200,140,0.08)');
      for (let i = 0; i < 5; i++) { const u = mod(TT * 0.3 + i / 5, 1), q = P(900, 0, 2.4); ext_puff(q[0] + u * 50, q[1] - u * 220, 30 + u * 70, '255,240,225', 0.22 * Math.sin(Math.PI * u)); }
      const mh = P(900, 0, 2.4); ctx.beginPath(); ctx.ellipse(mh[0], mh[1], 70, 12, 0, 0, TAU); ctx.fillStyle = '#3a3640'; ctx.fill();
      ext_pigeon(...P(1200, 0, 1.8), 30, 'shp1', -1); ext_pigeon(...P(1050, 0, 2.0), 26, 'shp2', 1); ext_pigeon(...P(1350, 0, 2.2), 24, 'shp3', -1);
    } },
    { d: 1, draw: () => {
      // the bowls far → near and cats at them
      const fullB = o.bowls !== false, order = S.bowls.map((b, i) => ({ b, i })).sort((a, b2) => a.b[1] - b2.b[1]);
      for (const { b, i } of order) { bowl(b[0], b[1], b[2] * 1.2, fullB);
        if (i < n) { const f = b[0] < 1150 ? 1 : -1, s = 150 * b[2]; ivCastShadow(b[0] - f * 60 * b[2], b[1], s * 0.9, { w: 0.4, len: 0.8, a: 0.25 });
          ivCat({ x: b[0] - f * 70 * b[2], y: b[1], s, f, coat: { ...CATS.alley[i % CATS.alley.length], key: 'shc' + i }, pose: i % 3 === 2 ? 'loaf' : 'stand', rot: i % 3 === 2 ? 0 : f * (0.12 + 0.05 * Math.sin(TT * 5 + i)), expr: { eyes: 'happy' } }); } }
      // the cat house: a box with a gable roof, two round doors, the sign
      const D0 = 1.25, X0 = -100, X1 = 360, Hh = 300, hb = ext_box(P, X0, X1, 0, Hh, D0, D0 + 0.25, { col: '#b07a4a', side: '#8a5a34' });
      for (let j = 1; j < 6; j++) ivLine(...hb.F(0, j / 6), ...hb.F(1, j / 6), 2, 'rgba(60,30,10,0.3)', 'butt');
      const rf = (Y, X) => P(X, Y, D0 - 0.02), rb = (Y, X) => P(X, Y, D0 + 0.27);
      ivPoly([rf(Hh, X0 - 40), rb(Hh, X0 - 40), rb(Hh + 180, (X0 + X1) / 2), rf(Hh + 180, (X0 + X1) / 2)], '#6a3a2a');
      ivPoly([rf(Hh, X0 - 40), rf(Hh + 180, (X0 + X1) / 2), rf(Hh, X1 + 40)], '#c08a5a'); ivLine(...rf(Hh, X0 - 40), ...rf(Hh + 180, (X0 + X1) / 2), 12, '#5a3020'); ivLine(...rf(Hh + 180, (X0 + X1) / 2), ...rf(Hh, X1 + 40), 12, '#5a3020');
      for (const [dx, dy] of S.doors) { ctx.beginPath(); ctx.ellipse(dx, dy - 56, 40, 48, 0, 0, TAU); ctx.fillStyle = '#1a100a'; ctx.fill(); ctx.fillRect(dx - 40, dy - 56, 80, 50); }
      const sq = S.sign; ctx.save(); ctx.translate(sq[0], sq[1]); ctx.rotate(-0.03); ivRR(-150, -30, 300, 56, 8, '#e8d4a8', '#5a3020', 4); ivText("BOSS'S HOUSE", 0, 10, 30, '#5a3020', { track: 2 }); ctx.restore();
      ivDot(sq[0] - 132, sq[1] - 16, 5, '#5a3020'); ivDot(sq[0] + 132, sq[1] - 16, 5, '#5a3020');
      ivAO(...hb.F(0, 0), ...hb.F(1, 0), 20, 0.45);
      ivCastShadow(P(X1, 0, D0)[0], P(0, 0, D0)[1], 300, { w: 1.2, len: 0.8, a: 0.22 });
      // a newcomer walking in from the right toward the bowls
      const wu = mod(TT / 7, 1), wq = P(lerp(1600, 900, wu), 0, 1.15); ivCat({ x: wq[0], y: wq[1], s: 130, f: -1, coat: { ...IV_COATS.calico, key: 'shnew' }, pose: 'walk' });
      o.act && o.act();
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ivRR(-260, 760, 420, 700, 40, '#4a3a30'); ivRR(-300, 720, 500, 70, 10, '#5a4a3e'); ivDot(2150, 950, 260, '#3f5f3a'); } }]),
  ];
}
