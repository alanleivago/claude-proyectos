// =====================================================================
//  SETS — interiors (see SETS_API.md). SET_x(o) sets IV_M and returns the ivStage layers:
//    room (d ≈ 2–2.4: ivRoom walls/floor/ceiling, windows, far furniture) → mid (d ≈ 1.4–1.7, if any) →
//    actors' plane d = 1 (back furniture → o.act() → front furniture → o.front()) → soft foreground (d 0.6, o.fg === false drops it).
//  Every room is a one-point perspective box (SET_IN[name]: back wall rect, vanishing point, near-frame factor);
//  GROUND = 900 is the floor at d = 1. Built wide enough for z 1…3 and dollies of x ±400, z 1→1.5.
//  Helpers are set_in*; positions per set in SET_POS (the exteriors in sets2.js use SET_POS2).
// =====================================================================
IV_MOOD.bedMorning = { rim: '#ffd9a6', key: [0.75, -0.55], tint: 'rgba(255,200,140,0.05)', haze: '#e9c9a2', vig: 0.42 };
IV_MOOD.bedNight = { rim: '#9dbcff', key: [0.7, -0.45], tint: 'rgba(20,30,70,0.14)', haze: '#2a3658', vig: 0.6 };
IV_MOOD.hallNight = { rim: '#ffc98a', key: [-0.7, -0.45], tint: 'rgba(30,25,60,0.12)', haze: '#2c2840', vig: 0.6 };
IV_MOOD.kitchen = { rim: '#fff0d8', key: [-0.7, -0.6], tint: 'rgba(255,220,170,0.04)', haze: '#d9c9b0', vig: 0.4 };
IV_MOOD.bath = { rim: '#eaf6ff', key: [0.5, -0.7], tint: 'rgba(170,200,220,0.06)', haze: '#b9c9d4', vig: 0.46 };
IV_MOOD.school = { rim: '#fff0d8', key: [0.45, -0.75], tint: 'rgba(170,180,200,0.04)', haze: '#c9d0da', vig: 0.4 };
IV_MOOD.gomez = { rim: '#ffc27a', key: [-0.7, -0.5], tint: 'rgba(120,60,30,0.08)', haze: '#5a3a2a', vig: 0.55 };
IV_MOOD.studio = { rim: '#cfe4ff', key: [0.6, -0.6], tint: 'rgba(20,40,90,0.10)', haze: '#1d2a4a', vig: 0.55 };
IV_MOOD.void = { rim: '#ffd6a0', key: [0.6, -0.6], tint: 'rgba(20,15,40,0.10)', haze: '#1a1626', vig: 0.65 };
const SET_POS = {};
const SET_IN = {};   // room boxes: { back: [x0, y0, x1, y1], vp: [x, y], front }

// ---------------------------------------------------------------------
//  shared helpers (pure maths first, so SET_POS can be computed at load time)
// ---------------------------------------------------------------------
function set_inMap(R) {   // the same mappers ivRoom returns, without drawing
  const [x0, y0, x1, y1] = R.back, vp = R.vp, e = R.front;
  const near = (x, y) => [vp[0] + (x - vp[0]) * e, vp[1] + (y - vp[1]) * e];
  const c = { lt: near(x0, y0), lb: near(x0, y1), rt: near(x1, y0), rb: near(x1, y1) };
  const quad = (a, b, cc, d) => (u, v) => { const p = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], q = [lerp(d[0], cc[0], u), lerp(d[1], cc[1], u)]; return [lerp(p[0], q[0], v), lerp(p[1], q[1], v)]; };
  return {
    L: quad([x0, y1], c.lb, c.lt, [x0, y0]), R: quad([x1, y1], c.rb, c.rt, [x1, y0]),
    F: (u, w) => { const a = [lerp(x0, c.lb[0], u), lerp(y1, c.lb[1], u)], b = [lerp(x1, c.rb[0], u), lerp(y1, c.rb[1], u)]; return [lerp(a[0], b[0], w), lerp(a[1], b[1], w)]; },
    vp, corners: c,
  };
}
const set_inU = (t, e) => (1 / (1 - t * (1 - 1 / e)) - 1) / (e - 1);     // depth fraction t (0 far … 1 near, linear in the world) → mapper u
const set_inK = (R, y) => (y - R.vp[1]) / (GROUND - R.vp[1]);              // size at floor line y relative to an actor at GROUND
function set_inFloorX(R, y) {   // the floor's left/right edge at screen height y (base frame)
  const M = set_inMap(R), u = (y - R.back[3]) / (M.corners.lb[1] - R.back[3]);
  return [M.F(u, 0)[0], M.F(u, 1)[0]];
}
const set_inQ = (M, u0, u1, v0, v1) => [M(u0, v0), M(u1, v0), M(u1, v1), M(u0, v1)];
const set_inBBox = (P) => { const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
function set_inBg(c) { ctx.fillStyle = c; ctx.fillRect(-2600, -1600, 7200, 4400); }
// a window on a wall mapper: frame, the view clipped to the glass, mullions, sill and a soft reveal
function set_inWin(M, u0, u1, v0, v1, view, o = {}) {
  const fr = o.frame || '#ece4d6', du = (u1 - u0) * 0.06, dv = (v1 - v0) * 0.04;
  ivPoly(set_inQ(M, u0 - du, u1 + du, v0 - dv, v1 + dv), fr);
  const G = set_inQ(M, u0, u1, v0, v1);
  ctx.save(); ivPoly(G, null); ctx.clip(); view(set_inBBox(G), G); ctx.restore();
  const n = o.nu ?? 2, m = o.nv ?? 2, lw = o.lw ?? 7;
  for (let i = 1; i < n; i++) { const u = lerp(u0, u1, i / n), a = M(u, v0), b = M(u, v1); ivLine(a[0], a[1], b[0], b[1], lw, fr, 'butt'); }
  for (let j = 1; j < m; j++) { const v = lerp(v0, v1, j / m), a = M(u0, v), b = M(u1, v); ivLine(a[0], a[1], b[0], b[1], lw, fr, 'butt'); }
  ivPoly([M(u0 - du * 1.6, v0 - dv), M(u1 + du * 1.6, v0 - dv), M(u1 + du * 1.6, v0 - dv * 2.6), M(u0 - du * 1.6, v0 - dv * 2.6)], ivShade(fr, -0.12));   // sill
  ivLine(...M(u0, v1), ...M(u1, v1), 3, 'rgba(0,0,0,0.25)');
  ivLine(...M(u0, v0), ...M(u0, v1), 4, 'rgba(0,0,0,0.18)');
  return G;
}
function set_inClock(x, y, r, face = '#f6eddc', ink = '#2e2420') {
  ivDot(x + 3, y + 5, r + 4, 'rgba(0,0,0,0.22)'); ivDot(x, y, r, ink); ivDot(x, y, r * 0.86, face);
  for (let i = 0; i < 12; i++) { const a = i * TAU / 12; ivLine(x + Math.cos(a) * r * 0.68, y + Math.sin(a) * r * 0.68, x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78, r * 0.05, ink); }
  const s = Math.floor(TT) * TAU / 60 - TAU / 4, m = 1.3 + TT * TAU / 3600;
  ivLine(x, y, x + Math.cos(-2.2) * r * 0.42, y + Math.sin(-2.2) * r * 0.42, r * 0.09, ink);
  ivLine(x, y, x + Math.cos(m) * r * 0.64, y + Math.sin(m) * r * 0.64, r * 0.06, ink);
  ivLine(x, y, x + Math.cos(s) * r * 0.72, y + Math.sin(s) * r * 0.72, r * 0.025, '#c8463c'); ivDot(x, y, r * 0.06, ink);
}
function set_inSteam(x, y, k, a = 0.3, s = 1) {
  ctx.save();
  for (let i = 0; i < 3; i++) { const u = mod(TT * 0.45 + i / 3 + k * 0.17, 1); ctx.globalAlpha = a * Math.sin(Math.PI * u); ivDot(x + Math.sin(TT * 2 + i * 2 + k) * 6 * s, y - u * 70 * s, (6 + u * 10) * s, '#fff4e4'); }
  ctx.restore();
}
// a potted plant: a pot box and leaves that sway a little (seeded)
function set_inPlant(x, y, s, key, o = {}) {
  const r = RNG('plant', key).f, leaf = o.leaf || '#4f7f4a', pot = o.pot || '#b5653f', n = o.n ?? 9;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * 2.2, len = (60 + r() * 70) * s, sw = Math.sin(TT * (0.8 + r() * 0.6) + i) * 0.05;
    const ex = x + Math.cos(a + sw) * len, ey = y - 50 * s + Math.sin(a + sw) * len;
    ivLine(x, y - 50 * s, ex, ey, 3 * s, ivShade(leaf, -0.3));
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(a + sw); ctx.beginPath(); ctx.ellipse(0, 0, 26 * s, 11 * s, 0, 0, TAU);
    ctx.fillStyle = i % 3 ? leaf : ivShade(leaf, 0.15); ctx.fill(); ctx.restore();
  }
  ivPoly([[x - 40 * s, y - 62 * s], [x + 40 * s, y - 62 * s], [x + 30 * s, y], [x - 30 * s, y]], pot);
  ivPoly([[x - 40 * s, y - 62 * s], [x + 40 * s, y - 62 * s], [x + 38 * s, y - 50 * s], [x - 38 * s, y - 50 * s]], ivShade(pot, 0.15));
  ivPoly([[x + 8 * s, y - 50 * s], [x + 38 * s, y - 50 * s], [x + 30 * s, y], [x + 8 * s, y]], 'rgba(0,0,0,0.16)');
}
// a picture frame on a wall mapper (a photo / drawing), in perspective
function set_inFrameQ(M, u0, u1, v0, v1, inner, frame = '#4a3428') {
  const du = (u1 - u0) * 0.1, dv = (v1 - v0) * 0.08;
  ivPoly(set_inQ(M, u0 - du, u1 + du, v0 - dv, v1 + dv), frame); ivPoly(set_inQ(M, u0, u1, v0, v1), inner);
}
// a soft dark foreground silhouette with a thin rim toward the key light
function set_inFgShape(P, c = '#16121a') { ctx.save(); ctx.translate(IV_M.key[0] * 7, IV_M.key[1] * 7); ivPoly(P, ivHex(IV_M.rim, 0.4)); ctx.restore(); ivPoly(P, c); }
// sky views for windows
function set_inSkyDay(b) {
  const [x0, y0, x1, y1] = b; ctx.fillStyle = ivVGrad(y0, y1, ['#8fc1e8', '#cfe4f2', '#f6e6c8']); ctx.fillRect(x0 - 10, y0 - 10, x1 - x0 + 20, y1 - y0 + 20);
  ivGlow(x1, y0 + 20, (x1 - x0) * 1.4, 'rgba(255,240,200,0.7)');
  const r = RNG('skyd', x0 | 0).f; for (let k = 0; k < 3; k++) { const cx = x0 + mod(TT * 8 + k * 150 + r() * 100, x1 - x0 + 200) - 100; ivRR(cx, y0 + (y1 - y0) * (0.12 + k * 0.12), 90, 20, 10, 'rgba(255,255,255,0.85)'); }
}
function set_inSkyNight(b, key = 'n') {
  const [x0, y0, x1, y1] = b; ctx.fillStyle = ivVGrad(y0, y1, ['#0b1230', '#1b2550', '#2c335e']); ctx.fillRect(x0 - 10, y0 - 10, x1 - x0 + 20, y1 - y0 + 20);
  const r = RNG('skyn', key).f; for (let i = 0; i < 26; i++) { const x = lerp(x0, x1, r()), y = lerp(y0, y1 * 0.6 + y0 * 0.4, r()); ivDot(x, y, 1 + r() * 1.4, `rgba(230,236,255,${0.4 + 0.4 * Math.sin(TT * (1 + r() * 2) + i)})`); }
}
function set_inSkyline(b, key, base, col = '#0e1328', lit = '#f4bd6a') {   // a row of buildings with twinkling lit windows
  const [x0, , x1] = b, r = RNG('skl', key).f; let x = x0 - 30;
  while (x < x1 + 30) {
    const w = 40 + r() * 70, h = 60 + r() * 150; ctx.fillStyle = col; ctx.fillRect(x, base - h, w, h + 400);
    for (let yy = base - h + 12; yy < base - 8; yy += 18) for (let xx = x + 8; xx < x + w - 10; xx += 16) { const q = r(); if (q < 0.3) { const on = Math.sin(TT * 0.4 + q * 90) > -0.85; if (on) ctx.fillStyle = lit, ctx.fillRect(xx, yy, 8, 10); } }
    ctx.fillStyle = col; x += w + 4;
  }
}

// =====================================================================
//  BEDROOM — Kai's room (approved look 1). o.t 'morning' | 'night'; o.knock: true or ivCat options → a black cat at the
//  window (night); o.onBed(): drawn on top of the blanket (Pickles on Kai's chest); o.blanket === false: no blanket.
// =====================================================================
SET_IN.bedroom = { back: [460, 200, 1580, 740], vp: [1010, 460], front: 3 };
SET_POS.bedroom = (() => { const R = SET_IN.bedroom, M = set_inMap(R), win = set_inQ(M.R, 0.03, 0.2, 0.3, 0.86);
  return { vp: R.vp, bedSit: [760, 985, 540], pillow: [300, 760], chest: [1060, 868, 200], bed: [130, 1240, 820], stand: [1420, 1700], catFloor: [1500, 960, 150],
    desk: [1380, 606], window: win, sill: [lerp(win[0][0], win[1][0], 0.5), lerp(win[0][1], win[1][1], 0.5)], floorX: set_inFloorX(R, GROUND), door: set_inQ(M.L, 0.12, 0.38, 0, 0.78) }; })();
function set_bedRoom(o, night) {
  const S = SET_IN.bedroom, vp = S.vp;
  const P = night ? { wall: '#2b3152', side: '#20263f', sideR: '#2a3050', floor: '#1d1c2b', ceil: '#1d2238', wood: '#3a3046', woodT: '#4a405a', plank: 'rgba(0,0,0,0.3)' }
    : { wall: '#c9a98e', side: '#a8846c', sideR: '#b8937a', floor: '#7a5440', ceil: '#d8bfa6', wood: '#8a6650', woodT: '#a8826a', plank: 'rgba(60,30,20,0.22)' };
  set_inBg(P.side);
  const R = ivRoom({ back: S.back, vp, wall: P.wall, side: P.side, sideR: P.sideR, floor: P.floor, ceil: P.ceil, planks: 10, plankCol: P.plank, front: S.front });
  // rug in perspective
  ivQuad(R.F, 0.22, 0.62, 0.3, 0.72, night ? '#3a2a48' : '#b8604a'); ivQuad(R.F, 0.27, 0.57, 0.34, 0.68, null, night ? 'rgba(160,140,200,0.25)' : 'rgba(255,220,180,0.45)', 3);
  // the window on the right wall
  const win = set_inWin(R.R, 0.03, 0.2, 0.3, 0.86, (b) => {
    if (!night) {
      set_inSkyDay(b); const [x0, y0, x1, y1] = b;
      ctx.fillStyle = '#9ab88a'; ctx.fillRect(x0 - 10, lerp(y0, y1, 0.78), x1 - x0 + 20, 400);
      const sw = Math.sin(TT * 0.9) * 6; ivLine(x1 + 10, lerp(y0, y1, 0.2), lerp(x0, x1, 0.4) + sw, lerp(y0, y1, 0.32), 10, '#5a4234');
      for (let i = 0; i < 6; i++) ivDot(lerp(x0, x1, 0.3 + i * 0.13) + sw * (1 - i * 0.1), lerp(y0, y1, 0.22 + (i % 3) * 0.06), 26, i % 2 ? '#6f9a5c' : '#5f8a4f');
      const bu = mod(TT * 0.35, 3); if (bu < 1) { const bx = lerp(x0 - 20, x1 + 20, bu), by = lerp(y0, y1, 0.45) - Math.sin(bu * 3) * 20, fl = Math.sin(TT * 14) * 6; ivLine(bx - 10, by - fl, bx, by, 3, '#3a3040'); ivLine(bx, by, bx + 10, by - fl, 3, '#3a3040'); }
    } else {
      set_inSkyNight(b, 'bed'); const [x0, y0, x1, y1] = b;
      ivDot(lerp(x0, x1, 0.62), lerp(y0, y1, 0.2), 22, '#eef2ff'); ivGlow(lerp(x0, x1, 0.62), lerp(y0, y1, 0.2), 140, 'rgba(180,200,255,0.5)');
      set_inSkyline(b, 'bedw', lerp(y0, y1, 0.92), '#0d1226');
      const pl = mod(TT * 0.06, 1); if (Math.sin(TT * 5) > 0.3) ivDot(lerp(x0, x1, pl), lerp(y0, y1, 0.35), 2.5, '#ff5a5a');
      if (o.knock) { const k = typeof o.knock === 'object' ? o.knock : {}, cx = lerp(x0, x1, 0.5), cy = lerp(y0, y1, 0.97), s = (y1 - y0) * 0.42;
        const hd = ivCat({ x: cx, y: cy, s, f: -1, coat: CATS.shadow, pose: 'sit', expr: { eyes: 'open' }, ...k });
        ivGlow(hd.head[0], hd.head[1], s * 0.4, 'rgba(120,255,120,0.35)'); }
    }
  }, { frame: night ? '#c9c6d6' : '#f0e6d6' });
  // curtains either side of the window (they breathe a little)
  const cs = Math.sin(TT * 0.8) * 0.006;
  ivPoly([R.R(0.2, 0.92), R.R(0.255 + cs, 0.92), R.R(0.262 + cs * 2, 0.2), R.R(0.205, 0.2)], night ? '#3c4a7a' : '#d9b46a');
  ivPoly([R.R(0.0, 0.92), R.R(0.025, 0.92), R.R(0.03 + cs, 0.24), R.R(0.002, 0.24)], night ? '#34406c' : '#c9a35c');
  ivLine(...R.R(-0.01, 0.93), ...R.R(0.27, 0.93), 6, night ? '#8a86a0' : '#6b4a38');
  // far wall: space poster, corkboard with Lily's drawing, shelf, clock; fairy lights at night
  ivRR(560, 290, 150, 205, 6, '#3c6fd1'); ivDot(635, 360, 34, '#e8b84a'); ctx.save(); ctx.translate(635, 360); ctx.rotate(-0.3); ctx.beginPath(); ctx.ellipse(0, 0, 58, 12, 0, 0, TAU); ctx.strokeStyle = '#ffe6c4'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
  ivText('SPACE', 635, 460, 32, '#ffe6c4');
  ivRR(780, 300, 200, 150, 6, '#b48a5e'); ctx.save(); ctx.translate(830, 370); ctx.rotate(-0.06); ivRR(-38, -45, 76, 90, 2, '#f6f0e4'); ivDot(0, -10, 16, '#f2c230'); ivLine(-14, 20, 14, 20, 3, '#e05a7a'); ivText('KAI', 0, 38, 14, '#e05a7a'); ctx.restore();
  ctx.save(); ctx.translate(925, 365); ctx.rotate(0.08); ivRR(-35, -40, 70, 80, 2, '#e8d8c0'); ivDot(0, -8, 20, '#e0873a'); ctx.restore(); ivDot(830, 322, 5, '#c8352e'); ivDot(925, 325, 5, '#3c6fd1');
  set_inClock(1060, 280, 34, night ? '#c9cce0' : '#f6eddc');
  ivRR(1160, 390, 250, 14, 3, '#6b4a38'); ivRR(1180, 338, 40, 52, 6, '#e8b84a'); ivRR(1190, 330, 20, 10, 3, '#e8b84a');
  [['#c94a3c', 46], ['#3d6fb6', 52], ['#4f7a4a', 44], ['#e8c56a', 50]].forEach(([c, h], i) => ivRR(1250 + i * 22, 390 - h, 18, h, 2, c));
  if (night) for (let i = 0; i < 16; i++) { const x = 500 + i * 68, y = 228 + Math.sin(i * 0.9) * 10, tw = 0.6 + 0.4 * Math.sin(TT * 2.2 + i * 1.7); ivDot(x, y, 5, `rgba(255,214,140,${tw})`); ivGlow(x, y, 28, 'rgba(255,190,110,0.5)', tw); }
  // the door on the left wall, a framed photo
  ivPoly(set_inQ(R.L, 0.12, 0.38, 0, 0.78), P.wood, ivShade(P.wood, -0.3), 6); ivDot(...R.L(0.34, 0.38), 6, '#d8c49a');
  set_inFrameQ(R.L, 0.5, 0.64, 0.5, 0.7, night ? '#4a5a80' : '#9fc0d8');
  // the desk against the far wall: top, drawers, laptop, lamp, mug, chair
  ivBox(1220, 606, 330, 22, 0.18, vp, { front: P.wood, top: P.woodT }); ivLine(1236, 628, 1236, 800, 9, ivShade(P.wood, -0.3));
  ivBox(1420, 628, 118, 172, 0.18, vp, { front: ivShade(P.wood, -0.08) }); ivLine(1440, 690, 1518, 690, 3, 'rgba(0,0,0,0.3)'); ivLine(1440, 748, 1518, 748, 3, 'rgba(0,0,0,0.3)');
  ivAO(1220, 800, 1540, 800, 18, 0.35);
  ivPoly([[1270, 606], [1410, 606], [1400, 592], [1282, 592]], '#2a2e38');
  ivRR(1282, 498, 118, 94, 5, '#20242e'); ivRR(1289, 505, 104, 78, 3, night ? '#5a8af0' : '#3c6fd1');
  const ss = mod(TT * 0.5, 1); ivDot(1300 + ss * 80, 520 + Math.abs(Math.sin(ss * 9)) * 50, 6, '#ffe6c4');
  if (night) { ivGlow(1340, 545, 260, 'rgba(110,150,255,0.35)'); }
  ivLine(1500, 606, 1470, 520, 5, '#2e2a30'); ivLine(1470, 520, 1505, 480, 5, '#2e2a30'); ivPoly([[1488, 470], [1530, 470], [1545, 505], [1474, 505]], night ? '#f2c14e' : '#3a3440');
  if (night) { ivGlow(1510, 510, 300, 'rgba(255,200,120,0.55)'); ivLightPool([[1250, 606], [1560, 606], [1580, 640], [1230, 640]], 'rgba(255,200,120,0.25)'); }
  if (!night) { ivRR(1230, 578, 28, 28, 5, '#e9e2d6'); set_inSteam(1244, 572, 2, 0.35, 0.6); }
  ivBox(1300, 742, 130, 16, 0.12, vp, { front: '#2c3142', top: '#3a4054' }); ivBox(1306, 640, 118, 102, 0.06, vp, { front: '#2c3142' });
  ivLine(1310, 758, 1312, 846, 7, '#1a1d26'); ivLine(1420, 758, 1418, 846, 7, '#1a1d26'); ivAO(1300, 846, 1430, 846, 10, 0.3);
  // light: morning sun through the window, or moonlight + the desk lamp at night
  if (!night) {
    ivLightPool([R.F(0.18, 0.62), R.F(0.42, 0.28), R.F(0.92, 0.1), R.F(0.55, 0.66)], 'rgba(255,214,150,0.26)');
    ivGlow(...R.R(0.11, 0.6), 520, 'rgba(255,220,160,0.42)');
    ivRays([R.R(0.03, 0.86), R.R(0.2, 0.3)], [R.F(0.22, 0.55), R.F(0.95, 0.12)], { n: 6, a: 0.12 });
  } else {
    ivLightPool([R.F(0.18, 0.62), R.F(0.42, 0.28), R.F(0.92, 0.1), R.F(0.55, 0.66)], 'rgba(120,150,255,0.12)');
    ivRays([R.R(0.03, 0.86), R.R(0.2, 0.3)], [R.F(0.22, 0.55), R.F(0.95, 0.12)], { n: 5, a: 0.06, col: [150, 175, 255] });
  }
}
function set_bedFront(o, night) {
  const vp = SET_IN.bedroom.vp, bed = night ? { front: '#3e3a62', top: '#8c8cb4', side: '#2e2a4c', pillow: '#c9cbe0', blanket: '#33305a' } : { front: '#9c8fb8', top: '#ece6f4', side: '#7c6f98', pillow: '#f6f2fb', blanket: '#7e6ca8' };
  // nightstand by the bed's head (seen on a dolly to the left)
  ivBox(-230, 760, 230, 220, 0.2, vp, { front: night ? '#3a3046' : '#8a6650' }); ivLine(-210, 840, -20, 840, 3, 'rgba(0,0,0,0.3)');
  ivRR(-160, 700, 80, 60, 10, '#c8352e'); ivRR(-150, 712, 60, 30, 6, night ? '#ff6a4a' : '#2a2026'); if (night) ivGlow(-120, 727, 90, 'rgba(255,90,60,0.4)');
  ivAO(-240, 990, 1260, 990, 46, 0.42);
  ivBox(90, 560, 60, 430, 0.2, vp, { front: night ? '#3a3046' : '#8a6650', top: night ? '#4a405a' : '#a8826a' });   // headboard
  ivBox(130, 820, 1110, 170, 0.22, vp, { front: bed.front, top: bed.top, side: bed.side });                    // the bed
  ivRR(170, 700, 260, 110, 44, bed.pillow); ivRR(190, 712, 220, 30, 15, 'rgba(255,255,255,0.35)');
  o.act && o.act();
  if (o.blanket !== false) {
    ctx.beginPath(); ctx.moveTo(470, 800); ctx.bezierCurveTo(700, 770, 1000, 790, 1245, 784); ctx.lineTo(1252, 990); ctx.bezierCurveTo(1000, 1000, 700, 992, 440, 1000); ctx.closePath(); ctx.fillStyle = bed.blanket; ctx.fill();
    ivLine(480, 802, 1240, 786, 6, 'rgba(255,255,255,0.18)'); ivLine(470, 826, 1245, 812, 4, 'rgba(0,0,0,0.12)'); ivLine(820, 800, 850, 990, 3, 'rgba(0,0,0,0.13)'); ivLine(1060, 790, 1075, 990, 3, 'rgba(0,0,0,0.13)');
  }
  o.onBed && o.onBed();
  o.front && o.front();
}
function SET_bedroom(o = {}) {
  const night = o.t === 'night';
  IV_M = IV_MOOD[o.mood] || (night ? IV_MOOD.bedNight : IV_MOOD.bedMorning);
  return [
    { d: 2.2, draw: () => set_bedRoom(o, night) },
    { d: 1, draw: () => set_bedFront(o, night) },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => {
      set_inFgShape([[1840, 1250], [1880, 820], [1960, 800], [2000, 1250]], night ? '#0e0e18' : '#2a1e1c');   // a chair back
      set_inFgShape([[1700, 1250], [1720, 1000], [2000, 990], [2040, 1250]], night ? '#0e0e18' : '#2a1e1c');
      ctx.save(); ctx.translate(-120, 1180); for (let i = 0; i < 6; i++) { ctx.rotate(0.35); ctx.beginPath(); ctx.ellipse(120, 0, 130, 34, 0, 0, TAU); ctx.fillStyle = night ? '#0c140f' : '#2e4a2c'; ctx.fill(); } ctx.restore();
    } }]),
  ];
}
// draw flat art onto a wall/floor patch: fn(w, h) in a local w×h box mapped (affine) onto M(u0..u1, v0..v1)
function set_inOnWall(M, u0, u1, v0, v1, w, h, fn) {
  const o = M(u0, v1), a = M(u1, v1), b = M(u0, v0);
  ctx.save(); ctx.transform((a[0] - o[0]) / w, (a[1] - o[1]) / w, (b[0] - o[0]) / h, (b[1] - o[1]) / h, o[0], o[1]); fn(w, h); ctx.restore();
}

// =====================================================================
//  HALL — the upstairs hallway at night: Lily's door (left, ajar, warm light, paper sign "LILY"), a night light,
//  Pickles' spot on the floor outside her door (SET_POS.hall.spot = [x, y, s] for a sleeping/loafing cat), star
//  projector dots spilling onto the ceiling, the moon in the window at the end. o.door 0..1 how far Lily's door is open.
// =====================================================================
SET_IN.hall = { back: [760, 250, 1160, 720], vp: [960, 480], front: 8 };
SET_POS.hall = (() => { const R = SET_IN.hall, M = set_inMap(R), e = R.front, U = (t) => set_inU(t, e);
  const sp = M.F(U(0.6), 0.14);
  return { vp: R.vp, spot: [sp[0], sp[1], Math.round(150 * set_inK(R, sp[1]))], floorX: set_inFloorX(R, GROUND), door: set_inQ(M.L, U(0.5), U(0.68), 0, 0.78),
    stand: [820, 1100], lily: [700, GROUND], end: [960, 760] }; })();
function set_hallRoom(o) {
  const S = SET_IN.hall, vp = S.vp, e = S.front, U = (t) => set_inU(t, e);
  set_inBg('#1c1a2c');
  const R = ivRoom({ back: S.back, vp, wall: '#3a3656', side: '#2e2a46', sideR: '#34304e', floor: '#2a2230', ceil: '#24213a', front: e });
  // floorboards toward the vanishing point + across, a long runner rug
  for (let i = 0; i <= 8; i++) { const a = R.F(0, i / 8), b = R.F(1, i / 8); ivLine(a[0], a[1], b[0], b[1], 2, 'rgba(0,0,0,0.25)'); }
  for (let j = 1; j < 14; j++) { const u = U(j / 14), a = R.F(u, 0), b = R.F(u, 1); ivLine(a[0], a[1], b[0], b[1], 1.5, 'rgba(0,0,0,0.18)'); }
  ivPoly([R.F(0, 0.3), R.F(0, 0.7), R.F(U(0.95), 0.7), R.F(U(0.95), 0.3)], '#4a2e44'); ivPoly([R.F(U(0.02), 0.34), R.F(U(0.02), 0.66), R.F(U(0.93), 0.66), R.F(U(0.93), 0.34)], null, 'rgba(240,190,140,0.25)', 3);
  // skirting boards
  ivLine(...R.L(0, 0.04), ...R.L(1, 0.04), 3, 'rgba(255,230,200,0.12)'); ivLine(...R.R(0, 0.04), ...R.R(1, 0.04), 3, 'rgba(255,230,200,0.12)');
  // the window at the end of the hall: moon, a little table with a plant
  set_inWin((u, v) => [lerp(820, 1100, u), lerp(640, 320, v)], 0, 1, 0, 1, (b) => {
    set_inSkyNight(b, 'hall'); ivDot(lerp(b[0], b[2], 0.68), lerp(b[1], b[3], 0.3), 26, '#eef2ff'); ivGlow(lerp(b[0], b[2], 0.68), lerp(b[1], b[3], 0.3), 160, 'rgba(180,200,255,0.5)');
    set_inSkyline(b, 'hallw', b[3] - 10, '#0b1022');
  }, { frame: '#bdb8cc', nu: 2, nv: 1 });
  ivBox(880, 640, 160, 16, 0.1, vp, { front: '#4a3a40' }); ivLine(890, 656, 892, 720, 5, '#2a2026'); ivLine(1030, 656, 1028, 720, 5, '#2a2026');
  set_inPlant(960, 640, 0.5, 'hall', { leaf: '#2f5a3e', pot: '#7a4a3a' });
  ivRays([[820, 330], [1100, 330]], [R.F(U(0.25), 0.25), R.F(U(0.75), 0.75)], { n: 4, a: 0.05, col: [150, 175, 255] });
  // right wall: Kai's door (far), family photos, the night light low on the wall
  ivPoly(set_inQ(R.R, U(0.08), U(0.24), 0, 0.78), '#4a3c4e', '#2a2230', 5); ivDot(...R.R(U(0.1), 0.38), 4, '#d8c49a');
  set_inFrameQ(R.R, U(0.32), U(0.4), 0.5, 0.66, '#6a7aa0'); set_inFrameQ(R.R, U(0.44), U(0.5), 0.56, 0.7, '#a07a6a'); set_inFrameQ(R.R, U(0.32), U(0.42), 0.74, 0.84, '#7a9a7a');
  const nl = R.R(U(0.55), 0.1), pulse = 0.85 + 0.15 * Math.sin(TT * 1.3);
  ivRR(nl[0] - 10, nl[1] - 14, 20, 28, 6, '#ffd890'); ivGlow(nl[0], nl[1], 260, 'rgba(255,200,120,0.55)', pulse);
  ivLightPool([R.F(U(0.48), 1), R.F(U(0.5), 0.55), R.F(U(0.66), 0.5), R.F(U(0.66), 1)], `rgba(255,190,110,${0.16 * pulse})`);
  // Lily's door on the left wall: frame, her lit room through the gap, the door slab with the paper sign
  const d0 = U(0.5), d1 = U(0.68), op = o.door ?? 0.25;
  ivPoly(set_inQ(R.L, d0 - 0.008, d1 + 0.012, 0, 0.81), '#d9d0e0');
  ctx.save(); ivPoly(set_inQ(R.L, d0, d1, 0, 0.78), null); ctx.clip();
  const g = R.L((d0 + d1) / 2, 0.4); ctx.fillStyle = '#f0a860'; ctx.fillRect(g[0] - 600, g[1] - 900, 1200, 1800); ivGlow(g[0], g[1], 400, 'rgba(255,230,170,0.6)');
  ctx.restore();
  const dm = lerp(d1, d0, op);   // the slab covers from d0 (hinge, far side) toward d1, swinging in
  ivPoly(set_inQ(R.L, d0, dm, 0, 0.78), '#e6d6c8', 'rgba(0,0,0,0.2)', 2);
  set_inOnWall(R.L, d0 + (dm - d0) * 0.82, d0 + (dm - d0) * 0.18, 0.5, 0.64, 200, 120, (w, h) => {
    ctx.rotate(-0.04); ivRR(0, 0, w, h, 3, '#fbf7ee'); ivRR(0, 0, w, h, 3, null, 'rgba(0,0,0,0.15)', 2);
    ['#e05a7a', '#f2c230', '#3c6fd1', '#4fae5a'].forEach((c, i) => ivText('LILY'[i], 34 + i * 44, 88 + (i % 2) * 8, 66, c, { font: '"Marker Felt", "Comic Sans MS", cursive', weight: 700 }));
    ivDot(w - 18, 18, 7, '#e05a7a'); ivDot(18, 18, 6, '#c8352e');
  });
  ivDot(...R.L(dm - (dm - d0) * 0.1, 0.38), 5, '#a08a60');
  // the warm wedge of light from her door across the hall floor, and her star projector on the ceiling
  ivLightPool([R.F(d1, 0), R.F(dm, 0), R.F(lerp(dm, d1, 0.2), 0.95), R.F(d1 + 0.04, 0.95)], 'rgba(255,190,110,0.22)');
  const r = RNG('stars').f; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 22; i++) { const u = lerp(d0, d1 + 0.12, r()), w = mod(r() + TT * 0.02, 1), p = [lerp(R.L(u, 1)[0], R.R(u, 1)[0], w), lerp(R.L(u, 1)[1], R.R(u, 1)[1], w)];
    p[1] += (r() - 0.1) * 120 * (1 + u * 4); ivDot(p[0], p[1], 2 + r() * 3, `rgba(255,236,180,${0.35 + 0.3 * Math.sin(TT * 2 + i)})`); }
  ctx.restore();
  // a ceiling lamp (off) and a moth by the night light
  const cl = [lerp(R.L(U(0.3), 1)[0], R.R(U(0.3), 1)[0], 0.5), lerp(R.L(U(0.3), 1)[1], R.R(U(0.3), 1)[1], 0.5)]; ivLine(cl[0], cl[1] - 40, cl[0], cl[1] + 6, 3, '#14121e'); ctx.beginPath(); ctx.ellipse(cl[0], cl[1] + 14, 34, 12, 0, 0, TAU); ctx.fillStyle = '#5a5470'; ctx.fill();
  const mo = [nl[0] - 40 + Math.sin(TT * 3.1) * 30, nl[1] - 70 + Math.sin(TT * 4.3) * 18], fl = Math.abs(Math.sin(TT * 30)) * 6;
  ivPoly([[mo[0], mo[1]], [mo[0] - 8, mo[1] - fl], [mo[0] - 10, mo[1] + 3]], '#c9b8a0'); ivPoly([[mo[0], mo[1]], [mo[0] + 8, mo[1] - fl], [mo[0] + 10, mo[1] + 3]], '#c9b8a0');
}
function SET_hall(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.hallNight;
  const P = SET_POS.hall;
  return [
    { d: 1.8, draw: () => set_hallRoom(o) },
    { d: 1, draw: () => {
      // Pickles' spot: a folded blanket on the floor outside Lily's door
      const [x, y, s] = P.spot; ivAO(x - s * 0.9, y + 6, x + s * 0.9, y + 6, 10, 0.3);
      ctx.beginPath(); ctx.ellipse(x, y - s * 0.05, s * 0.85, s * 0.22, -0.05, 0, TAU); ctx.fillStyle = '#7a5a8a'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(x, y - s * 0.1, s * 0.7, s * 0.14, -0.05, 0, TAU); ctx.fillStyle = '#8e6aa0'; ctx.fill();
      ivLightPool([[x - s, y - 20], [x + s * 1.2, y - 30], [x + s * 1.4, y + 30], [x - s * 0.8, y + 30]], 'rgba(255,190,110,0.12)');
      o.act && o.act();
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => {   // the banister post and rail on the right, a laundry basket on the left
      set_inFgShape([[1740, 1300], [1740, 640], [1800, 620], [1860, 640], [1860, 1300]], '#1a1420'); set_inFgShape([[1800, 700], [2600, 560], [2600, 610], [1800, 750]], '#1a1420');
      for (let i = 0; i < 4; i++) set_inFgShape([[1920 + i * 120, 1300], [1920 + i * 120, 700 - i * 22], [1945 + i * 120, 700 - i * 22], [1945 + i * 120, 1300]], '#1a1420');
      set_inFgShape([[-260, 1300], [-230, 960], [250, 960], [220, 1300]], '#221a24');
    } }]),
  ];
}

// =====================================================================
//  KITCHEN — the family kitchen / living room, day: fridge with Lily's drawings, counter + sink window, kettle,
//  a big side window with sun shafts, the table (front, after o.act: people sit behind it), a cat bed + bowl.
//  o.drawings === false hides the table crafts (crayons + the paper hat).
// =====================================================================
SET_IN.kitchen = { back: [300, 190, 1700, 730], vp: [1000, 470], front: 3.2 };
SET_POS.kitchen = (() => { const R = SET_IN.kitchen, M = set_inMap(R);
  return { vp: R.vp, seats: [1150, 1530], table: [980, 1700, 690], stand: [760, 300], catBed: [400, 965, 150], bowl: [610, 985], fridge: [330, 250, 210, 520], floorX: set_inFloorX(R, GROUND), window: set_inQ(M.R, 0.04, 0.3, 0.25, 0.86) }; })();
function set_kitRoom(o) {
  const S = SET_IN.kitchen, vp = S.vp;
  set_inBg('#a89478');
  const R = ivRoom({ back: S.back, vp, wall: '#e6d6b8', side: '#c9b394', sideR: '#d6c2a0', floor: '#8a6a52', ceil: '#efe4d0', planks: 12, plankCol: 'rgba(60,30,20,0.18)', front: S.front });
  // the side window: sun pouring in
  set_inWin(R.R, 0.04, 0.3, 0.25, 0.86, (b) => { set_inSkyDay(b); const [x0, y0, x1, y1] = b; ctx.fillStyle = '#9fbf8a'; ctx.fillRect(x0 - 10, lerp(y0, y1, 0.72), x1 - x0 + 20, 500);
    for (let i = 0; i < 4; i++) { const tx = lerp(x0, x1, 0.15 + i * 0.25), sw = Math.sin(TT * 0.9 + i) * 5; ivDot(tx + sw, lerp(y0, y1, 0.6), 50, i % 2 ? '#6f9a5c' : '#5f8a4f'); } }, { frame: '#f6efe2', nu: 3 });
  // the fridge with drawings and magnets
  ivBox(330, 250, 210, 520, 0.133, vp, { front: '#e9edf0', top: '#f6f8fa', side: '#c4cad0' }); ivLine(334, 420, 538, 420, 3, 'rgba(0,0,0,0.18)'); ivLine(520, 300, 520, 400, 6, '#9aa2aa'); ivLine(520, 440, 520, 560, 6, '#9aa2aa');
  const dr = (x, y, w, h, a, art) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ivRR(-w / 2, -h / 2, w, h, 2, '#fbf8f0'); art(w, h); ctx.restore(); ivDot(x, y - h / 2 + 4, 5, '#c8352e'); };
  dr(400, 500, 80, 96, -0.06 + Math.sin(TT * 1.4) * 0.02, () => { ctx.beginPath(); ctx.ellipse(0, 10, 26, 16, 0, 0, TAU); ctx.fillStyle = '#e0873a'; ctx.fill(); ivDot(20, -8, 11, '#e0873a'); ivText('PICKLES', 0, 42, 11, '#3c6fd1'); });
  dr(470, 320, 70, 80, 0.08, () => { ivPoly([[-22, 10], [22, 10], [22, -8], [0, -26], [-22, -8]], '#e05a7a'); ivDot(18, -24, 9, '#f2c230'); });
  dr(395, 340, 60, 70, 0.04, () => { ivDot(-8, -6, 10, '#f2c230'); ivLine(-8, 4, -8, 22, 3, '#3a3040'); ivDot(12, 14, 7, '#e0873a'); });
  dr(470, 620, 74, 60, -0.1, () => { for (let i = 0; i < 5; i++) ivLine(-26, -18 + i * 9, 26, -18 + i * 9, 2, ['#3c6fd1', '#e05a7a', '#4fae5a', '#f2c230', '#8a5bb0'][i]); });
  // counter, backsplash, sink window, upper cabinets
  ivRR(560, 400, 690, 150, 0, '#f4efe4'); for (let i = 0; i <= 14; i++) ivLine(560 + i * 49, 400, 560 + i * 49, 550, 1.5, 'rgba(0,0,0,0.08)'); for (let j = 0; j <= 4; j++) ivLine(560, 400 + j * 37, 1250, 400 + j * 37, 1.5, 'rgba(0,0,0,0.08)');
  set_inWin((u, v) => [lerp(780, 1030, u), lerp(470, 250, v)], 0, 1, 0, 1, (b) => { set_inSkyDay(b); ctx.fillStyle = '#a7bf92'; ctx.fillRect(b[0], b[3] - 50, 400, 60); }, { frame: '#f6efe2' });
  set_inPlant(830, 466, 0.35, 'sill1', { leaf: '#4f8a4a' }); set_inPlant(990, 466, 0.3, 'sill2', { pot: '#3c6fd1' });
  ivBox(560, 230, 200, 160, 0.12, vp, { front: '#7aa0a8', top: '#668a92' }); ivBox(1050, 230, 200, 160, 0.12, vp, { front: '#7aa0a8', top: '#668a92' });
  ivLine(660, 250, 660, 370, 2, 'rgba(0,0,0,0.2)'); ivLine(1150, 250, 1150, 370, 2, 'rgba(0,0,0,0.2)');
  ivBox(556, 548, 700, 22, 0.133, vp, { front: '#d8d0c4', top: '#ece6dc' }); ivBox(566, 570, 680, 200, 0.133, vp, { front: '#7aa0a8' }); ivAO(566, 770, 1246, 770, 16, 0.35);
  for (let i = 1; i < 4; i++) ivLine(566 + i * 170, 574, 566 + i * 170, 766, 3, 'rgba(0,0,0,0.2)'); for (let i = 0; i < 4; i++) ivLine(566 + i * 170 + 70, 600, 566 + i * 170 + 100, 600, 5, '#d8d0c4');
  ivPoly([[820, 540], [1000, 540], [990, 528], [830, 528]], '#9aa4ac'); ivLine(910, 528, 910, 490, 6, '#b8c0c8'); ivLine(910, 490, 930, 490, 6, '#b8c0c8');
  ivRR(1120, 500, 64, 50, 12, '#c8352e'); ivLine(1184, 512, 1200, 498, 6, '#c8352e'); set_inSteam(1200, 494, 1, 0.4, 0.8);   // kettle
  ivDot(690, 530, 20, '#e8b84a'); ivDot(712, 534, 16, '#c94a3c'); ivDot(700, 518, 14, '#7aaa4a');   // fruit
  // right part: calendar with the fair circled, clock, a shelf of jars
  ivRR(1300, 300, 120, 150, 4, '#fbf8f0'); ivRR(1300, 300, 120, 34, 4, '#c8352e'); ivText('OCT', 1360, 326, 22, '#fff');
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) ivRR(1308 + c * 22, 342 + r * 26, 18, 20, 2, 'rgba(0,0,0,0.08)'); ctx.beginPath(); ctx.arc(1397, 409, 14, 0, TAU); ctx.strokeStyle = '#e05a7a'; ctx.lineWidth = 3; ctx.stroke();
  set_inClock(1530, 300, 40); ivRR(1460, 460, 200, 12, 3, '#8a6650'); [['#e8c56a', 40], ['#c94a3c', 50], ['#7aaa4a', 36], ['#f4efe4', 46]].forEach(([c, h], i) => ivRR(1475 + i * 46, 460 - h, 34, h, 6, c));
  set_inPlant(1600, 770, 0.9, 'kfloor', { leaf: '#4f7f4a', pot: '#c47a4a', n: 11 });
  // sun shafts across the floor from the side window
  ivLightPool([R.F(0.12, 0.98), R.F(0.25, 0.4), R.F(0.75, 0.15), R.F(0.55, 0.9)], 'rgba(255,214,150,0.22)');
  ivGlow(...R.R(0.17, 0.6), 600, 'rgba(255,230,180,0.35)');
  ivRays([R.R(0.04, 0.86), R.R(0.3, 0.25)], [R.F(0.2, 0.45), R.F(0.98, 0.1)], { n: 6, a: 0.1 });
}
function SET_kitchen(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.kitchen;
  const P = SET_POS.kitchen, vp = SET_IN.kitchen.vp;
  return [
    { d: 2.2, draw: () => set_kitRoom(o) },
    { d: 1, draw: () => {
      // cat bed and bowl
      const [bx, by, bs] = P.catBed; ivAO(bx - bs, by + 4, bx + bs, by + 4, 12, 0.3);
      ctx.beginPath(); ctx.ellipse(bx, by - 18, bs * 0.95, bs * 0.3, 0, 0, TAU); ctx.fillStyle = '#5a7ab0'; ctx.fill(); ctx.beginPath(); ctx.ellipse(bx, by - 22, bs * 0.72, bs * 0.18, 0, 0, TAU); ctx.fillStyle = '#e6dccd'; ctx.fill();
      ivPoly([[P.bowl[0] - 34, P.bowl[1] - 22], [P.bowl[0] + 34, P.bowl[1] - 22], [P.bowl[0] + 24, P.bowl[1]], [P.bowl[0] - 24, P.bowl[1]]], '#c8352e'); ctx.beginPath(); ctx.ellipse(P.bowl[0], P.bowl[1] - 22, 34, 8, 0, 0, TAU); ctx.fillStyle = '#7a3a2a'; ctx.fill();
      // chairs behind the table (their backs show behind the sitters)
      for (const x of P.seats) { ivBox(x - 70, 560, 140, 150, 0.05, vp, { front: '#9a6b48' }); ivLine(x - 60, 760, x - 62, 880, 8, '#5a3a26'); ivLine(x + 60, 760, x + 62, 880, 8, '#5a3a26'); }
      // the pendant lamp over the table
      ivLine(1340, -400, 1340, 360, 3, '#3a3030'); ivPoly([[1290, 400], [1390, 400], [1360, 355], [1320, 355]], '#2f6a6a'); ivGlow(1340, 410, 200, 'rgba(255,220,160,0.35)');
      o.act && o.act();
      // the table
      ivAO(990, 940, 1690, 940, 16, 0.4);
      ivBox(980, 690, 720, 26, 0.1, vp, { front: '#b07a50', top: '#c99068' }); ivLine(1000, 716, 1004, 940, 12, '#7a5236'); ivLine(1680, 716, 1676, 940, 12, '#7a5236');
      ivRR(1330, 640, 34, 50, 6, '#e9eef2'); for (let i = 0; i < 3; i++) ivDot(1340 + i * 8, 628 - i * 6, 10, ['#e05a7a', '#f2c230', '#e8873a'][i]);
      if (o.drawings !== false) {
        ivPoly([[1050, 682], [1200, 676], [1210, 694], [1056, 700]], '#fbf8f0'); ivDot(1100, 688, 8, '#3c6fd1');
        [['#e05a7a', 0], ['#3c6fd1', 1], ['#4fae5a', 2]].forEach(([c, i]) => ivLine(1450 + i * 20, 690, 1490 + i * 20, 684, 6, c));
        ivPoly([[1560, 688], [1620, 688], [1592, 624]], '#f2c230'); ivDot(1592, 620, 6, '#e05a7a');
      }
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => {
      set_inFgShape([[-300, 1300], [-280, 900], [240, 880], [260, 1300]], '#2a2018');          // a kitchen island corner
      ctx.save(); ctx.translate(2050, -60); for (let i = 0; i < 7; i++) { ctx.rotate(0.38); ctx.beginPath(); ctx.ellipse(130, 0, 150, 30, 0, 0, TAU); ctx.fillStyle = '#2c4628'; ctx.fill(); } ctx.restore();
    } }]),
  ];
}

// =====================================================================
//  BATHROOM — a small tiled bathroom: the tub + shower on the left (Kai stands in it at SET_POS.bathroom.shower; the
//  tub front and the curtain are drawn after o.act), the mirror + sink on the right wall, the open door at the back
//  (o.doorway(x, y, s): draw Pickles there, on the room layer). o.curtain 0 open … 1 closed (translucent: the singer
//  shows through), o.steam 0..1 (fogs the mirror), o.water (default: on when steam > 0).
// =====================================================================
SET_IN.bath = { back: [560, 220, 1360, 740], vp: [960, 470], front: 3.4 };
SET_POS.bathroom = (() => { const R = SET_IN.bath, M = set_inMap(R);
  return { vp: R.vp, shower: [600, GROUND, 520], tub: [160, 1000, 770], doorway: [1220, 738, 95], mirror: set_inQ(M.R, 0.1, 0.26, 0.45, 0.82), sink: [1405, 640], stand: [1250, 1450], floorX: set_inFloorX(R, GROUND) }; })();
function set_bathTiles(M, nu, nv, col, e) {
  for (let i = 0; i <= nu; i++) { const u = e ? set_inU(i / nu, e) : i / nu, a = M(u, 0), b = M(u, 1); ivLine(a[0], a[1], b[0], b[1], 1.5, col); }
  for (let j = 0; j <= nv; j++) { const a = M(0, j / nv), b = M(1, j / nv); ivLine(a[0], a[1], b[0], b[1], 1.5, col); }
}
function set_bathRoom(o) {
  const S = SET_IN.bath, vp = S.vp, e = S.front, U = (t) => set_inU(t, e), steam = o.steam ?? 0;
  set_inBg('#9fb4bc');
  const R = ivRoom({ back: S.back, vp, wall: '#cfe0e2', side: '#a9c0c4', sideR: '#bcd0d2', floor: '#e8e4dc', ceil: '#e2ecec', front: e });
  // checker floor
  for (let i = 0; i < 9; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) ivPoly([R.F(U(i / 9), j / 8), R.F(U((i + 1) / 9), j / 8), R.F(U((i + 1) / 9), (j + 1) / 8), R.F(U(i / 9), (j + 1) / 8)], '#5a7a86');
  // tiles: a wainscot band (lower 0.55) on every wall
  const B = (x, y) => [x, y], back = (u, v) => B(lerp(S.back[0], S.back[2], u), lerp(S.back[3], S.back[1], v));
  ivPoly([back(0, 0), back(1, 0), back(1, 0.55), back(0, 0.55)], '#e9f2f2'); ivPoly(set_inQ(R.L, 0, 1, 0, 0.55), '#c9d8da'); ivPoly(set_inQ(R.R, 0, 1, 0, 0.55), '#d9e6e8');
  set_bathTiles((u, v) => back(u, v * 0.55), 16, 6, 'rgba(60,90,100,0.18)'); set_bathTiles((u, v) => R.L(u, v * 0.55), 14, 6, 'rgba(60,90,100,0.18)', e); set_bathTiles((u, v) => R.R(u, v * 0.55), 14, 6, 'rgba(60,90,100,0.18)', e);
  ivLine(...back(0, 0.55), ...back(1, 0.55), 6, '#5a7a86'); ivLine(...R.L(0, 0.55), ...R.L(1, 0.55), 6, '#5a7a86'); ivLine(...R.R(0, 0.55), ...R.R(1, 0.55), 6, '#5a7a86');
  // the small frosted window above the tub, light falling in
  set_inWin((u, v) => [lerp(620, 820, u), lerp(380, 250, v)], 0, 1, 0, 1, (b) => { ctx.fillStyle = ivVGrad(b[1], b[3], ['#f6fbff', '#d8e8f0']); ctx.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]); }, { frame: '#f2f6f6', nv: 1 });
  ivGlow(720, 320, 260, 'rgba(255,255,245,0.45)');
  ivRays([[630, 260], [810, 370]], [[300, 900], [760, 940]], { n: 4, a: 0.1, col: [255, 250, 235] });
  // the open door at the back: the hallway's warm light, a towel rack beside it
  ivPoly([[1110, 322], [1330, 322], [1330, 740], [1110, 740]], '#f2f0ec');
  ctx.save(); ivPoly([[1124, 336], [1316, 336], [1316, 740], [1124, 740]], null); ctx.clip();
  ctx.fillStyle = ivVGrad(336, 740, ['#b89a7a', '#8a6a50']); ctx.fillRect(1100, 330, 240, 420); ivPoly([[1124, 690], [1316, 690], [1316, 740], [1124, 740]], '#7a5038'); ivRR(1240, 420, 50, 70, 3, '#6a4a7a'); ivGlow(1220, 450, 200, 'rgba(255,210,150,0.3)');
  ctx.restore(); ivPoly([[1316, 336], [1345, 330], [1345, 760], [1316, 740]], '#d6cfc6');
  o.doorway && o.doorway(...SET_POS.bathroom.doorway);
  ivLine(960, 430, 1080, 430, 6, '#b8c0c8'); ivPoly([[972, 430], [1068, 430], [1060, 560], [978, 556]], '#e8873a'); ivLine(978, 540, 1060, 544, 6, '#f2c230');
  // right wall: the mirror (fogs with steam), the sink with a dripping tap, a toothbrush cup
  const mq = set_inQ(R.R, 0.1, 0.26, 0.45, 0.82); ivPoly(set_inQ(R.R, 0.09, 0.27, 0.43, 0.84), '#8a9aa2'); ivPoly(mq, ivVGrad(mq[2][1], mq[0][1], ['#e8f2f6', '#9fb6c0']));
  ivPoly([R.R(0.12, 0.8), R.R(0.15, 0.8), R.R(0.2, 0.5), R.R(0.17, 0.5)], 'rgba(255,255,255,0.4)');
  if (steam > 0) { ctx.save(); ctx.globalAlpha = steam * 0.75; ivPoly(mq, '#f4f8fa'); ctx.restore(); }
  ivBox(1310, 630, 200, 36, 0.12, vp, { front: '#f4f6f6', top: '#ffffff' }); ivBox(1385, 666, 52, 190, 0.08, vp, { front: '#e6eaea' }); ivAO(1370, 856, 1450, 856, 10, 0.3);
  ivPoly([[1340, 626], [1480, 626], [1470, 612], [1350, 612]], '#b8c8cc'); ivLine(1410, 612, 1410, 590, 6, '#b8c0c8'); ivLine(1410, 590, 1426, 590, 5, '#b8c0c8');
  const dp = mod(TT, 1.3) / 1.3; ivDot(1424, 596 + dp * 24, 3, `rgba(150,200,230,${1 - dp})`);
  ivRR(1470, 588, 22, 30, 4, '#e05a7a'); ivLine(1476, 588, 1474, 566, 3, '#3c6fd1'); ivLine(1486, 588, 1490, 570, 3, '#4fae5a');
  // soft steam across the room
  if (steam > 0) set_bathSteam(steam, 'room', [300, 200, 1700, 900]);
}
function set_bathSteam(k, key, box) {
  const r = RNG('steam', key).f; ctx.save();
  for (let i = 0; i < 14; i++) { const x = lerp(box[0], box[2], r()) + Math.sin(TT * 0.4 + i) * 40, y = lerp(box[1], box[3], r()) - mod(TT * 18 + r() * 300, 300), rr = 90 + r() * 120;
    ctx.globalAlpha = k * 0.16 * (0.6 + 0.4 * Math.sin(TT * 0.7 + i)); ivDot(x, y, rr, '#ffffff'); }
  ctx.restore();
}
function SET_bathroom(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.bath;
  const vp = SET_IN.bath.vp, steam = o.steam ?? 0, water = o.water ?? steam > 0, cur = clamp(o.curtain ?? 0);
  return [
    { d: 2.2, draw: () => set_bathRoom(o) },
    { d: 1, draw: () => {
      // the tub's far side + the shower head and pipe, water falling (behind the singer)
      ivRR(170, 700, 820, 80, 30, '#dfe8ea');
      ivLine(560, -300, 560, 230, 10, '#b8c0c8'); ivLine(560, 230, 600, 250, 10, '#b8c0c8'); ivPoly([[585, 240], [640, 262], [628, 286], [576, 262]], '#c9d2d8');
      if (water) { const r = RNG('water').f; ctx.save(); ctx.globalAlpha = 0.5; for (let i = 0; i < 26; i++) { const a = (r() - 0.5) * 0.5, v = mod(TT * 2.2 + r(), 1), x0 = 608 + Math.sin(a) * 40, y0 = 275 + v * 480;
        ivLine(x0 + Math.sin(a) * v * 160, y0, x0 + Math.sin(a) * v * 160, y0 + 26, 2.4, '#d8f0ff'); } ctx.restore(); }
      o.act && o.act();
      // the curtain: rod, rings, pleats; translucent so the singer reads through it
      ivLine(140, 150, 1020, 150, 8, '#b8c0c8');
      const x1 = lerp(300, 1010, cur), n = 9; ctx.save(); ctx.globalAlpha = 0.86;
      for (let i = 0; i < n; i++) { const a = lerp(150, x1, i / n), b = lerp(150, x1, (i + 1) / n), sw = Math.sin(TT * 1.3 + i) * 6;
        ivPoly([[a, 154], [b, 154], [b + sw, 800], [a + sw, 806]], i % 2 ? '#8ec8d8' : '#a6d6e2'); }
      ctx.restore(); for (let i = 0; i <= n; i++) ivDot(lerp(150, x1, i / n), 150, 8, '#d8e0e4');
      for (let k = 0; k < 3; k++) for (let i = 0; i < 6; i++) ivDot(lerp(180, x1 - 30, (i + 0.5) / 6), 260 + k * 200 + (i % 2) * 40, 7, 'rgba(255,255,255,0.5)');
      // the tub front, a rubber duck on the rim
      ivAO(150, 950, 1010, 950, 30, 0.35);
      ivBox(150, 770, 860, 180, 0.12, vp, { front: '#f4f8f8', top: '#ffffff', side: '#cfdcde' }); ivRR(150, 930, 860, 20, 8, '#cfdcde');
      const db = Math.sin(TT * 2) * 3; ivDot(930, 752 + db, 20, '#f2c230'); ivDot(948, 732 + db, 13, '#f2c230'); ivPoly([[958, 730 + db], [972, 734 + db], [958, 738 + db]], '#e8873a'); ivDot(950, 729 + db, 2.4, '#222');
      if (steam > 0) set_bathSteam(steam, 'front', [100, 100, 1100, 800]);
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => {
      set_inFgShape([[1700, 1300], [1720, 900], [2300, 880], [2300, 1300]], '#2a3a40');   // the edge of a laundry hamper
      ivRR(1760, 860, 520, 40, 14, '#3a4a52');
    } }]),
  ];
}

// =====================================================================
//  CLASSROOM — perspective classroom, day: the chalkboard on the far wall (left), two tall windows (right) with an
//  outside ledge where a cat and a pigeon sit (SET_POS.classroom.ledge, room-layer coords; o.ledge(x, y, s) draws
//  your own there, o.ledge === false leaves it empty), rows of kids facing the board, the teacher's spot (front left),
//  Kai's desk (front right, drawn after o.act: Kai sits at SET_POS.classroom.seat facing left). o.kids === false: empty room.
// =====================================================================
SET_IN.class = { back: [260, 170, 1700, 700], vp: [980, 440], front: 3 };
SET_POS.classroom = (() => { const R = SET_IN.class;
  return { vp: R.vp, seat: [1350, GROUND, 520], seat2: [1820, GROUND], teacher: [330, GROUND], board: [360, 270, 560, 290], ledge: [1495, 572, 120], windows: [[1020, 230, 260, 350], [1360, 230, 260, 350]], floorX: set_inFloorX(R, GROUND) }; })();
function set_inPigeon(x, y, s, key = 'pg') {
  const bob = Math.max(0, Math.sin(TT * 3 + hash(key) % 7)) * 6 * s, f = -1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * f, s);
  ivLine(-4, 0, -4, -14, 3, '#d8735a'); ivLine(6, 0, 6, -14, 3, '#d8735a');
  ctx.beginPath(); ctx.ellipse(0, -30, 30, 20, -0.15, 0, TAU); ctx.fillStyle = '#8a8f9e'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(-8, -30, 22, 12, -0.25, 0, TAU); ctx.fillStyle = '#727787'; ctx.fill(); ivLine(-26, -28, -46, -22, 9, '#5a5f6e');
  ctx.beginPath(); ctx.ellipse(20 + bob * 0.4, -48, 10, 13, 0, 0, TAU); ctx.fillStyle = '#6a8a7a'; ctx.fill();
  ivDot(24 + bob, -60, 11, '#7a7f8e'); ivDot(28 + bob, -62, 2.6, '#f2a030'); ivPoly([[33 + bob, -60], [41 + bob, -58], [33 + bob, -56]], '#c9b8a0');
  ctx.restore();
}
function set_classKid(who, x, y, h, i) {   // a kid at a desk facing the board (left); the desk drawn in front
  const raise = i === 1 && mod(TT + 1.3, 6) < 1.6, tilt = Math.sin(TT * 0.6 + i * 2) * 0.05;
  ivBox(x + h * 0.02, y - h * 0.48, h * 0.1, h * 0.27, 0.04, SET_IN.class.vp, { front: '#3e4a5a' });   // chair back
  ivMan({ who, x, y, h, f: -0.75, pose: raise ? ivPose('sitDesk', { hR: [0.1, -0.3], tilt }) : ivPose('sitDesk', { tilt }), expr: { eyes: i % 3 ? 'open' : 'tired', mouth: 'flat', look: [-1, 0] } });
  const cx = x - h * 0.33, top = y - h * 0.37, w = h * 0.42;
  ivBox(cx - w / 2, top, w, h * 0.035, 0.05, SET_IN.class.vp, { front: '#c9a77a', top: '#dcbc90' });
  ivLine(cx - w * 0.4, top + h * 0.035, cx - w * 0.42, y, h * 0.018, '#5b5f68', 'butt'); ivLine(cx + w * 0.4, top + h * 0.035, cx + w * 0.42, y, h * 0.018, '#5b5f68', 'butt');
  ivRR(cx - w * 0.42, top + h * 0.05, w * 0.84, h * 0.06, 3, '#5b5f68');
}
function set_classRoom(o) {
  const S = SET_IN.class, vp = S.vp;
  set_inBg('#b9ae98');
  const R = ivRoom({ back: S.back, vp, wall: '#e2d7bf', side: '#c4b89e', sideR: '#d2c6ac', floor: '#a4aa98', ceil: '#ece6d6', planks: 14, plankCol: 'rgba(60,70,60,0.12)', front: S.front });
  ivPoly(set_inQ(R.L, 0, 1, 0, 0.3), '#8a9a8c'); ivPoly(set_inQ(R.R, 0, 1, 0, 0.3), '#94a496'); ivRR(S.back[0], 560, S.back[2] - S.back[0], 140, 0, '#8a9a8c');   // painted dado
  // the chalkboard with a chalk lesson, the alphabet strip above
  const [bx, by, bw, bh] = SET_POS.classroom.board;
  ivRR(bx - 14, by - 14, bw + 28, bh + 28, 6, '#8a6a4a'); ivRR(bx, by, bw, bh, 3, '#2f4a3c'); ivLine(bx + 40, by + 30, bx + bw * 0.5, by + bh - 20, 60, 'rgba(255,255,255,0.04)');
  const CH = '"Chalkboard SE", "Marker Felt", "Comic Sans MS", cursive';
  ivText('Animal Senses', bx + bw / 2, by + 62, 46, '#eef0e6', { font: CH, weight: 400 }); ivLine(bx + 120, by + 76, bx + bw - 120, by + 74, 3, 'rgba(238,240,230,0.8)');
  ivText('dog  ~ 45,000 Hz', bx + 50, by + 140, 32, '#eef0e6', { font: CH, weight: 400, align: 'left' }); ivText('cat  ~ 85,000 Hz !', bx + 50, by + 190, 32, '#f2d27a', { font: CH, weight: 400, align: 'left' }); ivText('human  20,000 Hz', bx + 50, by + 240, 32, '#eef0e6', { font: CH, weight: 400, align: 'left' });
  ctx.beginPath(); ctx.ellipse(bx + bw - 110, by + 190, 60, 34, 0, 0, TAU); ctx.strokeStyle = 'rgba(242,210,122,0.8)'; ctx.lineWidth = 3; ctx.stroke();
  ivRR(bx + 20, by + bh + 8, bw - 40, 12, 3, '#6a5038'); ivRR(bx + 80, by + bh + 2, 30, 8, 3, '#f4f1ea');
  for (let i = 0; i < 12; i++) { ivRR(bx + i * 47, by - 62, 40, 40, 3, ['#e8c56a', '#8ab0c8', '#d98c6a', '#9fbf8a'][i % 4]); ivText('ABCDEFGHIJKL'[i], bx + i * 47 + 20, by - 30, 26, '#3a3030'); }
  // the windows, the outside ledge with the cat and the pigeon
  SET_POS.classroom.windows.forEach(([x, y, w, h], k) => {
    set_inWin((u, v) => [x + u * w, y + h - v * h], 0, 1, 0, 1, (b) => {
      set_inSkyDay(b); ctx.fillStyle = '#c9a88a'; ctx.fillRect(b[0] - 10, b[1] + h * 0.45, w + 20, h); for (let i = 0; i < 4; i++) ivRR(b[0] + 20 + i * 70, b[1] + h * 0.52, 40, 50, 2, '#7a8aa8');
      const sw = Math.sin(TT * 0.8 + k) * 6; ivDot(b[0] + w * (k ? 0.2 : 0.8) + sw, b[1] + h * 0.45, 70, '#6f9a5c'); ivDot(b[0] + w * (k ? 0.05 : 0.95) + sw, b[1] + h * 0.55, 50, '#5f8a4f');
      ivRR(b[0] - 10, b[3] - 18, w + 20, 30, 0, '#b8b0a4'); ivLine(b[0] - 10, b[3] - 18, b[2] + 10, b[3] - 18, 3, '#e8e0d4');
      if (k === 1 && o.ledge !== false) { const [lx, ly, ls] = SET_POS.classroom.ledge;
        if (typeof o.ledge === 'function') o.ledge(lx, ly, ls);
        else { ivCat({ x: lx - 65, y: ly, s: ls, f: 1, coat: CATS.alley[1], pose: 'sit', expr: { eyes: 'half', mouth: mod(TT, 3) < 1.2 ? 'open' : 'closed' } }); set_inPigeon(lx + 75, ly, ls / 110 * 1.15); } }
    }, { frame: '#f2ece0', nu: 2, nv: 3, lw: 6 });
  });
  set_inClock(1310, 200, 30, '#fbf7ee');
  // left wall: the door, a poster; right wall: cubbies with coloured bins and coats on hooks
  ivPoly(set_inQ(R.L, 0.06, 0.24, 0, 0.75), '#9a7a58', '#6a5038', 5); ivPoly(set_inQ(R.L, 0.1, 0.2, 0.45, 0.68), '#cfe0e6');
  ivPoly(set_inQ(R.R, 0.04, 0.3, 0, 0.36), '#a87e58');
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) ivPoly(set_inQ(R.R, 0.05 + i * 0.062, 0.1 + i * 0.062, 0.04 + j * 0.16, 0.16 + j * 0.16), ['#e05a5a', '#3c6fd1', '#f2c230', '#4fae5a'][(i + j) % 4]);
  for (let i = 0; i < 4; i++) { const p = R.R(0.07 + i * 0.07, 0.6); ivDot(p[0], p[1], 5, '#5a4a3a'); ivPoly([[p[0] - 14, p[1]], [p[0] + 16, p[1]], [p[0] + 24, p[1] + 110], [p[0] - 18, p[1] + 110]], ['#9a5f6e', '#5d7086', '#6f7d5a', '#c2703f'][i]); }
  // light from the windows across the floor, a ceiling fan turning
  ivLightPool([R.F(0, 0.48), R.F(0, 0.95), R.F(0.6, 0.62), R.F(0.6, 0.12)], 'rgba(255,236,190,0.14)');
  ivRays([[1020, 230], [1620, 580]], [R.F(0.3, 0.2), R.F(0.55, 0.85)], { n: 6, a: 0.07 });
  const fc = [980, 60]; ivLine(fc[0], -200, fc[0], fc[1], 5, '#5a5050');
  for (let i = 0; i < 4; i++) { const a = TT * 2.4 + i * TAU / 4; ctx.beginPath(); ctx.ellipse(fc[0] + Math.cos(a) * 110, fc[1] + Math.sin(a) * 18, 100 * Math.abs(Math.cos(a)) + 12, 10, 0, 0, TAU); ctx.fillStyle = '#d8d0c0'; ctx.fill(); }
  ivDot(fc[0], fc[1], 16, '#8a8070');
}
function SET_classroom(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.school;
  const vp = SET_IN.class.vp, kids = o.kids !== false;
  return [
    { d: 2.2, draw: () => set_classRoom(o) },
    { d: 1.5, draw: () => {
      // the teacher's desk (front left) with apple, books, mug; rows of kids
      ivAO(60, 800, 520, 800, 14, 0.35);
      ivBox(60, 620, 460, 180, 0.1, vp, { front: '#8a5a3a', top: '#a87050' }); ivRR(110, 650, 160, 60, 4, '#704428');
      ivDot(160, 600, 20, '#c8352e'); ivLine(160, 582, 166, 570, 4, '#4f3020'); [['#3d6fb6', 0], ['#e8c56a', 1]].forEach(([c, k]) => ivRR(300 + k * 8, 600 - k * 20, 140, 20, 3, c));
      ivRR(460, 586, 34, 34, 6, '#e9e2d6'); set_inSteam(476, 580, 4, 0.35, 0.6);
      if (kids) { [[CAST.kidC, 640, 760, 380], [CAST.kidA, 960, 760, 380], [CAST.kidD, 1250, 760, 380], [CAST.kidB, 860, 840, 450], [CAST.kidA, 1690, 840, 450]].forEach(([w, x, y, h], i) => set_classKid({ ...w, key: w.key + i }, x, y, h, i)); }
    } },
    { d: 1, draw: () => {
      const [sx, sy, sh] = SET_POS.classroom.seat; ivBox(sx + sh * 0.02, sy - sh * 0.48, sh * 0.1, sh * 0.27, 0.04, vp, { front: '#3e4a5a' });
      ivBox(sx - sh * 0.1, sy - sh * 0.2, sh * 0.22, sh * 0.03, 0.06, vp, { front: '#3e4a5a', top: '#56647a' }); ivLine(sx - sh * 0.08, sy - sh * 0.17, sx - sh * 0.09, sy, 7, '#2a2e36'); ivLine(sx + sh * 0.1, sy - sh * 0.17, sx + sh * 0.11, sy, 7, '#2a2e36');
      o.act && o.act();
      const [x, y, h] = SET_POS.classroom.seat, cx = x - h * 0.33, top = y - h * 0.37, w = h * 0.42;
      ivBox(cx - w / 2, top, w, h * 0.035, 0.05, vp, { front: '#c9a77a', top: '#dcbc90' }); ivLine(cx - w * 0.4, top + 18, cx - w * 0.42, y + 20, 9, '#5b5f68', 'butt'); ivLine(cx + w * 0.4, top + 18, cx + w * 0.42, y + 20, 9, '#5b5f68', 'butt');
      ivRR(cx - w * 0.42, top + h * 0.05, w * 0.84, h * 0.06, 3, '#5b5f68'); ivRR(cx - 60, top - 8, 110, 8, 2, '#f4f1ea'); ivLine(cx + 10, top - 12, cx + 60, top - 16, 4, '#e8c56a');
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => {
      set_inFgShape([[1600, 1300], [1620, 960], [2200, 950], [2200, 1300]], '#2a2a30');   // a desk edge with a backpack
      ctx.beginPath(); ctx.ellipse(1840, 930, 120, 90, 0, 0, TAU); ctx.fillStyle = '#7a2a3a'; ctx.fill();
      set_inFgShape([[-300, 1300], [-260, 1000], [220, 1010], [240, 1300]], '#2a2a30');
    } }]),
  ];
}

// =====================================================================
//  GOMEZ — Mrs. Gomez's warm living room: plum sofa (box + cushions; the ring hides between the cushions at
//  SET_POS.gomez.ring, o.ring true = a glint there), many plants, a cat tree, framed cat photos, a pendulum clock,
//  a floor lamp. SET_POS.gomez.cats = 6 spots [x, y, s, pose, f]; o.cats = how many default cats to draw (0–6).
// =====================================================================
SET_IN.gomez = { back: [340, 200, 1640, 740], vp: [990, 470], front: 3 };
SET_POS.gomez = (() => { const R = SET_IN.gomez;
  return { vp: R.vp, sofaSeats: [520, 880], sofa: [300, 1150, 735], ring: [598, 742], stand: [1400, 300], floorX: set_inFloorX(R, GROUND),
    cats: [[440, 566, 130, 'loaf', 1], [1160, 646, 120, 'sit', -1], [1745, 446, 130, 'loaf', -1], [1700, 646, 120, 'sit', -1], [1380, 975, 140, 'sleep', 1], [150, 960, 140, 'sit', 1]] }; })();
const SET_GOMEZ_COATS = [CATS.gomez1, CATS.gomez2, CATS.gomez3, { ...IV_COATS.kitten, key: 'gomez4' }, { ...IV_COATS.black, key: 'gomez5', eye: '#e8c34a' }, { ...IV_COATS.orange, key: 'gomez6', col: '#d9a066' }];
function set_gomRoom(o) {
  const S = SET_IN.gomez, vp = S.vp;
  set_inBg('#7a4a34');
  const R = ivRoom({ back: S.back, vp, wall: '#c98a5e', side: '#a86e48', sideR: '#b67a52', floor: '#6a4430', ceil: '#d8a880', planks: 11, plankCol: 'rgba(40,20,10,0.25)', front: S.front });
  // wallpaper stripes + wainscot on the far wall and the side walls
  for (let x = S.back[0] + 30; x < S.back[2]; x += 60) { ivLine(x, S.back[1], x, 560, 10, 'rgba(255,220,180,0.12)'); for (let y = 240; y < 560; y += 60) ivDot(x + 30, y + ((x / 60) % 2) * 30, 4, 'rgba(120,50,30,0.25)'); }
  ivRR(S.back[0], 560, S.back[2] - S.back[0], 180, 0, '#7a4a32'); ivLine(S.back[0], 560, S.back[2], 560, 6, '#5a321e');
  ivPoly(set_inQ(R.L, 0, 1, 0, 0.33), '#6a3e28'); ivPoly(set_inQ(R.R, 0, 1, 0, 0.33), '#704430');
  // the rug
  ivQuad(R.F, 0.18, 0.62, 0.2, 0.8, '#9a3a32'); ivQuad(R.F, 0.22, 0.58, 0.24, 0.76, null, '#e8b860', 4); ivQuad(R.F, 0.3, 0.5, 0.36, 0.64, null, 'rgba(232,184,96,0.6)', 3);
  // the window with lace curtains and plants on the sill, late-afternoon sky
  set_inWin((u, v) => [lerp(400, 700, u), lerp(600, 270, v)], 0, 1, 0, 1, (b) => { ctx.fillStyle = ivVGrad(b[1], b[3], ['#f2b878', '#f6d8a8']); ctx.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]); ivDot(b[0] + 60, b[1] + 80, 30, '#fff0c8');
    ctx.fillStyle = '#a86a50'; ctx.fillRect(b[0], b[1] + 200, 400, 200); for (let i = 0; i < 4; i++) ivRR(b[0] + 20 + i * 70, b[1] + 230, 30, 40, 2, '#ffd890'); }, { frame: '#f2e6d4' });
  for (let i = 0; i < 2; i++) { const x = i ? 640 : 400, sw = Math.sin(TT * 0.7 + i) * 4; ivPoly([[x - 20, 262], [x + 60, 262], [x + 50 + sw, 610], [x - 26 + sw, 610]], 'rgba(255,248,236,0.55)'); }
  set_inPlant(470, 600, 0.45, 'g1', { leaf: '#3f7a3a' }); set_inPlant(560, 600, 0.38, 'g2', { pot: '#3c6fa0' }); set_inPlant(640, 600, 0.42, 'g3', { leaf: '#5a9a4a', pot: '#d88a4a' });
  ivGlow(550, 430, 420, 'rgba(255,200,140,0.35)'); ivRays([[410, 280], [690, 590]], [[300, 1000], [900, 960]], { n: 5, a: 0.08 });
  // framed cat photos, the pendulum clock
  [[780, 290, 110, 130], [910, 270, 90, 100], [910, 390, 90, 90], [1030, 300, 120, 150]].forEach(([x, y, w, h], i) => {
    ivRR(x - 8, y - 8, w + 16, h + 16, 4, '#d8b060'); ivRR(x, y, w, h, 2, ['#e8d8c0', '#c9d8e0', '#e0c8c8', '#d8e0c8'][i]);
    const c = SET_GOMEZ_COATS[i]; ivCat({ x: x + w / 2, y: y + h - 6, s: h * 0.7, f: i % 2 ? -1 : 1, coat: { ...c, key: c.key + 'ph' }, pose: 'sit', expr: { eyes: 'happy' } });
  });
  ivRR(1215, 240, 90, 300, 10, '#5a321e'); ivDot(1260, 300, 36, '#f4ead6'); ivLine(1260, 300, 1260 + Math.cos(TT * 0.1) * 24, 300 - Math.abs(Math.sin(TT * 0.1)) * 24, 3, '#2a1a12');
  const pa = Math.sin(TT * Math.PI) * 0.35; ivLine(1260, 345, 1260 + Math.sin(pa) * 120, 345 + Math.cos(pa) * 120, 3, '#d8b060'); ivDot(1260 + Math.sin(pa) * 120, 345 + Math.cos(pa) * 120, 14, '#e8c060');
  // bookshelf with trailing plant, figurines
  ivBox(1360, 300, 250, 470, 0.12, vp, { front: '#6a3e28' }); for (let r = 0; r < 4; r++) { ivRR(1372, 400 + r * 100, 226, 10, 2, '#4a2a18'); for (let k = 0; k < 8; k++) { const h = 50 + (hash('gb' + r + k) % 30); if (k === 5 && r === 1) { ivDot(1372 + k * 27 + 12, 390 + r * 100, 14, '#f2efe9'); continue; } ivRR(1376 + k * 27, 400 + r * 100 - h, 22, h, 2, ['#8a2a2a', '#2a5a7a', '#c8a040', '#4a6a3a', '#7a4a7a'][(r + k) % 5]); } }
  set_inPlant(1480, 300, 0.4, 'gshelf', { leaf: '#4a8a44' }); for (let i = 0; i < 5; i++) { const sw = Math.sin(TT * 0.8 + i) * 4; ivLine(1450 + i * 12, 300, 1440 + i * 14 + sw, 380 + i * 30, 3, '#3f7a3a'); ivDot(1440 + i * 14 + sw, 380 + i * 30, 9, '#4a8a44'); }
  // the floor lamp (warm key), its pool on the floor
  ivLine(1650, 820, 1650, 380, 8, '#3a2a20'); ivPoly([[1595, 380], [1705, 380], [1680, 300], [1620, 300]], '#f2d0a0'); ivGlow(1650, 360, 520, 'rgba(255,190,110,0.55)'); ivAO(1610, 822, 1690, 822, 8, 0.4);
  ivLightPool([R.F(0.1, 0.62), R.F(0.1, 0.95), R.F(0.6, 1.02), R.F(0.6, 0.55)], 'rgba(255,180,100,0.16)');
  // a big monstera on the left, a hanging plant from the ceiling
  set_inPlant(220, 860, 1.6, 'monstera', { leaf: '#2f6a34', pot: '#9a5a3a', n: 13 });
  const hs = Math.sin(TT * 0.6) * 0.03; ctx.save(); ctx.translate(880, -150); ctx.rotate(hs); ivLine(0, 0, 0, 300, 3, '#3a2a20'); set_inPlant(0, 360, 0.6, 'hang', { pot: '#e8d8c0', leaf: '#4a8a44' });
  for (let i = 0; i < 4; i++) ivLine(-30 + i * 20, 330, -40 + i * 25 + Math.sin(TT + i) * 6, 450 + i * 18, 4, '#3f7a3a'); ctx.restore();
}
function SET_gomez(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.gomez;
  const vp = SET_IN.gomez.vp, P = SET_POS.gomez, nc = clamp(o.cats ?? 0, 0, 6);
  const cat = (i) => { const [x, y, s, pose, f] = P.cats[i]; if (pose !== 'sleep' && y > 900) ivCastShadow(x, y, s * 0.9, { a: 0.25, w: 0.5, len: 0.6 }); ivCat({ x, y, s, f, coat: SET_GOMEZ_COATS[i], pose, expr: { eyes: i % 2 ? 'half' : 'open' } }); };
  return [
    { d: 2.2, draw: () => set_gomRoom(o) },
    { d: 1, draw: () => {
      // the cat tree: base, sisal posts, a cubby, two platforms
      ivAO(1590, 890, 1880, 890, 14, 0.4); ivBox(1590, 846, 290, 44, 0.12, vp, { front: '#c8b08a', top: '#dcc8a4' });
      for (const x of [1640, 1820]) { ivLine(x, 846, x, 460, 26, '#c9a870'); for (let y = 470; y < 840; y += 16) ivLine(x - 13, y, x + 13, y + 5, 2, 'rgba(90,60,30,0.35)'); }
      ivBox(1600, 650, 200, 22, 0.1, vp, { front: '#c8b08a', top: '#e0ccaa' }); ivBox(1680, 450, 180, 22, 0.1, vp, { front: '#c8b08a', top: '#e0ccaa' });
      ivBox(1690, 720, 150, 126, 0.12, vp, { front: '#b89a70' }); ivDot(1765, 790, 38, '#2a1a12'); const ts = Math.sin(TT * 1.6) * 10; ivLine(1855, 672, 1858 + ts, 760, 3, '#7a6a5a'); ivDot(1858 + ts, 766, 10, '#e05a7a');
      // the sofa
      ivAO(240, 875, 1210, 875, 26, 0.45);
      ivBox(300, 560, 850, 180, 0.08, vp, { front: '#7c3c4c', top: '#8e4a5a' }); ivBox(300, 735, 850, 140, 0.14, vp, { front: '#6a3242', top: '#8a4656' });
      for (let i = 0; i < 3; i++) { ivRR(330 + i * 270, 600, 255, 130, 28, '#94505f'); ivRR(340 + i * 270, 610, 235, 22, 11, 'rgba(255,220,220,0.12)'); ivRR(320 + i * 275, 712, 262, 36, 14, '#a05868'); }
      if (o.ring) { const [rx, ry] = P.ring, tw = 0.6 + 0.4 * Math.sin(TT * 6); ivDot(rx, ry, 6, '#f2d27a'); ivGlow(rx, ry, 40, 'rgba(255,230,150,0.9)', tw); ivLine(rx - 16 * tw, ry, rx + 16 * tw, ry, 2, '#fff6d8'); ivLine(rx, ry - 16 * tw, rx, ry + 16 * tw, 2, '#fff6d8'); }
      ivBox(240, 630, 80, 245, 0.1, vp, { front: '#6a3242', top: '#8a4656' }); ivBox(1130, 630, 80, 245, 0.1, vp, { front: '#6a3242', top: '#8a4656' });
      ivPoly([[1130, 636], [1210, 636], [1214, 760], [1190, 790], [1150, 770], [1128, 700]], '#e8c870'); for (let i = 0; i < 5; i++) ivLine(1132, 660 + i * 22, 1210, 660 + i * 22, 2, 'rgba(160,110,40,0.4)');   // knitted throw
      ivRR(360, 640, 110, 90, 26, '#e8b860'); ivRR(980, 646, 100, 84, 26, '#5a8a7a');
      // side table: teapot + steam, reading glasses
      ivAO(1250, 890, 1370, 890, 8, 0.35); ivBox(1240, 740, 140, 20, 0.1, vp, { front: '#5a321e', top: '#7a4a2e' }); ivLine(1262, 760, 1264, 890, 6, '#3a2010'); ivLine(1358, 760, 1356, 890, 6, '#3a2010');
      ivDot(1300, 718, 24, '#e8eef2'); ivLine(1322, 712, 1342, 696, 6, '#e8eef2'); ivRR(1288, 690, 24, 8, 3, '#c8d2d8'); set_inSteam(1342, 690, 5, 0.4, 0.6);
      for (let i = 0; i < nc; i++) if (P.cats[i][1] < 900) cat(i);
      o.act && o.act();
      for (let i = 0; i < nc; i++) if (P.cats[i][1] >= 900) cat(i);
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => {
      ctx.save(); ctx.translate(-80, 1150); for (let i = 0; i < 7; i++) { ctx.rotate(0.32); ctx.beginPath(); ctx.ellipse(150, 0, 170, 46, 0, 0, TAU); ctx.fillStyle = i % 2 ? '#1e3a1e' : '#244a24'; ctx.fill(); } ctx.restore();
      set_inFgShape([[1820, 1300], [1840, 980], [2300, 960], [2300, 1300]], '#2a1812'); ctx.beginPath(); ctx.ellipse(1990, 1000, 150, 50, 0, 0, TAU); ctx.fillStyle = '#4a2a1e'; ctx.fill();   // armchair edge
    } }]),
  ];
}

// =====================================================================
//  NEWSROOM — a TV news studio: the anchor desk (front, after o.act: the anchor sits behind it at SET_POS.newsroom.anchor),
//  the big screen on the far wall (o.screen(w, h) draws inside it, local coords, clipped), skyline panels, LED strips,
//  a lighting truss. o.lower: the lower-third text (screen space; false = none), o.ticker: the crawl text.
// =====================================================================
SET_IN.news = { back: [260, 150, 1660, 720], vp: [960, 450], front: 3 };
SET_POS.newsroom = (() => { const R = SET_IN.news; return { vp: R.vp, anchor: [960, GROUND, 520], desk: [560, 1360, 700], screen: [560, 200, 800, 360], stand: [300, 1650], floorX: set_inFloorX(R, GROUND) }; })();
function set_newsScreen(w, h) {
  ctx.fillStyle = ivVGrad(0, h, ['#1d4a9a', '#0e2a62']); ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) { const x = mod(i * 140 + TT * 30, w + 140) - 70, y = h * 0.3 + Math.sin(i * 2.1) * h * 0.25; ctx.save(); ctx.globalAlpha = 0.15; ivDot(x, y, 22, '#bfe0ff'); [[-22, -26], [0, -34], [22, -26]].forEach(([dx, dy]) => ivDot(x + dx, y + dy, 9, '#bfe0ff')); ctx.restore(); }
  ivDot(w * 0.18, h * 0.55, 56, '#ffe2b0'); [[-52, -60], [-18, -84], [18, -84], [52, -60]].forEach(([dx, dy]) => ivDot(w * 0.18 + dx, h * 0.52 + dy, 24, '#ffe2b0'));
  ivText('CAT', w * 0.76, h * 0.4, 84, '#ffffff', { track: 6 }); ivText('WHISPERER', w * 0.76, h * 0.62, 58, '#ffd27a', { track: 4 });
  ivText('11 PETS FOUND', w * 0.76, h * 0.8, 30, '#bfe0ff', { track: 4, weight: 700, font: IV.sans });
}
function set_newsRoom(o) {
  const S = SET_IN.news, vp = S.vp;
  set_inBg('#0c1424');
  const R = ivRoom({ back: S.back, vp, wall: '#1a2a4a', side: '#121d36', sideR: '#16223e', floor: '#0e1526', ceil: '#0a101e', front: S.front });
  // glossy floor: a big logo ring and the screen's reflection
  ivQuad(R.F, 0.08, 0.5, 0.25, 0.75, null, 'rgba(90,150,255,0.25)', 6); ivQuad(R.F, 0.15, 0.43, 0.33, 0.67, null, 'rgba(90,150,255,0.15)', 3);
  ctx.save(); ctx.globalAlpha = 0.18; ctx.translate(0, 720 * 2); ctx.scale(1, -1); ctx.fillStyle = '#3c78e0'; ctx.fillRect(560, 560, 800, 160); ctx.restore();
  // skyline panels either side of the screen
  for (const [x0, x1] of [[290, 530], [1390, 1630]]) { ctx.save(); ctx.beginPath(); ctx.rect(x0, 190, x1 - x0, 420); ctx.clip(); set_inSkyNight([x0, 190, x1, 610], 'news' + x0); set_inSkyline([x0, 190, x1, 610], 'nsk' + x0, 610, '#0a1224', '#ffcf7a'); ctx.restore(); ivRR(x0, 190, x1 - x0, 420, 4, null, '#2a4070', 6); }
  // the big screen
  const [sx, sy, sw, sh] = SET_POS.newsroom.screen; ivRR(sx - 16, sy - 16, sw + 32, sh + 32, 8, '#0a0e18');
  ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip(); ctx.translate(sx, sy); (o.screen || set_newsScreen)(sw, sh); ctx.restore();
  ivPoly([[sx, sy], [sx + sw * 0.4, sy], [sx + sw * 0.25, sy + sh], [sx, sy + sh]], 'rgba(255,255,255,0.04)'); ivGlow(sx + sw / 2, sy + sh / 2, 600, 'rgba(70,130,255,0.25)');
  ivRR(S.back[0], 640, S.back[2] - S.back[0], 14, 0, '#3c78e0'); ivGlow(960, 647, 700, 'rgba(60,120,255,0.18)');
  // LED strips on the side walls (pulsing), monitors on the left wall
  for (let i = 0; i < 6; i++) { const u = set_inU(0.12 + i * 0.15, S.front), a = 0.5 + 0.5 * Math.sin(TT * 1.5 - i * 0.6);
    for (const M of [R.L, R.R]) { const p = M(u, 0.1), q = M(u, 0.92); ivLine(p[0], p[1], q[0], q[1], 6 + u * 14, `rgba(110,180,255,${0.35 + 0.45 * a})`); } }
  for (let i = 0; i < 2; i++) { const Q = set_inQ(R.L, 0.08 + i * 0.12, 0.17 + i * 0.12, 0.4, 0.62); ivPoly(Q, '#05080f'); ivPoly(set_inQ(R.L, 0.085 + i * 0.12, 0.165 + i * 0.12, 0.42, 0.6), i ? '#2a5aa8' : '#8a2a3a'); }
  // lighting truss with spots, beams down onto the desk
  ivLine(-300, 110, 2300, 110, 14, '#2a3040'); for (let x = -300; x < 2300; x += 40) ivLine(x, 104, x + 40, 116, 2, '#3a4458');
  for (let i = 0; i < 6; i++) { const x = 360 + i * 240; ivRR(x - 22, 116, 44, 40, 8, '#1a1e28'); ivDot(x, 158, 12, '#fff2d8'); ivGlow(x, 160, 80, 'rgba(255,240,210,0.6)'); }
  ivRays([[480, 160], [1440, 160]], [[600, 760], [1320, 760]], { n: 5, a: 0.05, col: [200, 220, 255] });
}
function set_newsLower(o) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const u = EZ.o3(clamp(TT * 2 - Math.floor(TT * 2) + 1)), y = 852;
  ivRR(60, 30 + IV.bar, 140, 46, 6, '#c8323a'); ivText('LIVE', 140, 66 + IV.bar, 30, '#fff', { track: 3 }); ivDot(80, 53 + IV.bar, 7 * (0.7 + 0.3 * Math.sin(TT * 5)), '#fff');
  ivRR(W - 230, 30 + IV.bar, 170, 46, 6, 'rgba(10,20,50,0.75)'); ivText('NEWS 7', W - 145, 66 + IV.bar, 30, '#ffd27a', { track: 3 });
  if (o.lower !== false) {
    ivRR(80, y, 230, 64, 4, '#c8323a'); ivText('BREAKING', 195, y + 44, 30, '#fff', { track: 3 });
    ivRR(310, y, 1260, 64, 4, '#f4f2ee'); ivText(o.lower || 'LOCAL TEEN "CAT WHISPERER" FINDS 11 LOST PETS', 340, y + 45, 34, '#0e1a36', { align: 'left', track: 1 });
    ivRR(80, y + 64, 1490, 40, 0, '#0e1a36'); ctx.save(); ctx.beginPath(); ctx.rect(80, y + 64, 1490, 40); ctx.clip();
    const tk = (o.ticker || 'CATS SPOTTED ON EVERY ROOF IN TOWN  •  MRS. GOMEZ GETS HER RING BACK  •  GAS LEAK FOUND ON ELM ST.  •  WEATHER: CLEAR AND COLD TONIGHT  •  ') + '';
    const tw = ivText(tk, -9999, -9999, 24, '#fff', { align: 'left', weight: 700, font: IV.sans }), x0 = 80 - mod(TT * 120, tw);
    for (let k = 0; k < 3; k++) ivText(tk, x0 + k * tw, y + 92, 24, '#e8eef8', { align: 'left', weight: 700, font: IV.sans });
    ctx.restore();
  }
  ctx.restore();
}
function SET_newsroom(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.studio;
  const vp = SET_IN.news.vp;
  return [
    { d: 2.2, draw: () => set_newsRoom(o) },
    { d: 1, draw: () => {
      o.act && o.act();
      ivAO(540, 900, 1380, 900, 20, 0.5);
      ivBox(560, 700, 800, 22, 0.12, vp, { front: '#c8d4e8', top: '#e8eef8' }); ivBox(580, 722, 760, 178, 0.1, vp, { front: '#16325e' });
      ivRR(580, 790, 760, 8, 0, '#4a8aff'); ivGlow(960, 794, 420, 'rgba(80,140,255,0.3)'); ivText('NEWS 7', 960, 862, 44, '#e8eef8', { track: 8 });
      ivRR(600, 640, 90, 60, 4, '#0a0e18'); ivRR(606, 646, 78, 46, 2, '#2a5aa8'); ivRR(1230, 640, 90, 60, 4, '#0a0e18'); ivRR(1236, 646, 78, 46, 2, F % 48 < 24 ? '#8a2a3a' : '#2a5aa8');
      ivRR(1120, 668, 28, 32, 5, '#e9e2d6'); ivPoly([[760, 698], [880, 694], [884, 700], [758, 704]], '#fbf8f0');
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => {   // a studio camera with its red tally light
      set_inFgShape([[-200, 760], [180, 740], [200, 920], [-200, 940]], '#141822'); ivLine(60, 940, 40, 1300, 26, '#141822'); ivRR(150, 790, 70, 90, 10, '#0c0e14');
      ivDot(150, 760, 10, '#ff3030'); ivGlow(150, 760, 50, 'rgba(255,50,50,0.7)');
      set_inFgShape([[1780, 1300], [1800, 980], [2300, 960], [2300, 1300]], '#10141e');
    } }]),
    { d: 1, blur: 0, draw: () => set_newsLower(o) },
  ];
}

// =====================================================================
//  VOID — a dark soft stage with bokeh for graphics (facts, the 85,000 Hz chart, the city map). o.mood (default 'void'),
//  o.glow: the accent colour of the haze and the light pool ([r, g, b], default warm cream).
// =====================================================================
SET_POS.void = { vp: [960, 600], centre: [960, 520], floor: 780 };
function SET_void(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.void;
  const c = o.glow || [255, 214, 160], col = (a) => `rgba(${c},${a})`, hz = IV_M.haze || '#1a1626';
  return [
    { d: 4, draw: () => {
      ctx.fillStyle = ivVGrad(-400, 1400, ['#07060c', ivShade(hz, -0.35), '#08070e']); ctx.fillRect(-2600, -1600, 7200, 4400);
      ivGlow(960, 420, 1100, col(0.16)); ivGlow(300, 200, 700, 'rgba(120,140,255,0.08)'); ivGlow(1700, 300, 700, col(0.08));
      const r = RNG('voidb').f; ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 34; i++) { const x = -800 + r() * 3500 + Math.sin(TT * 0.2 + i) * 30, y = -300 + r() * 1500 + Math.cos(TT * 0.17 + i * 1.3) * 20, rr = 18 + r() * 60, tw = 0.5 + 0.5 * Math.sin(TT * (0.5 + r()) + i);
        ctx.globalAlpha = 0.12 + 0.12 * tw; ivDot(x, y, rr, i % 3 ? col(0.6) : 'rgba(140,170,255,0.6)'); }
      ctx.restore();
    } },
    { d: 1.6, draw: () => {
      ctx.fillStyle = ivVGrad(700, 1400, ['rgba(0,0,0,0)', 'rgba(10,8,16,0.85)']); ctx.fillRect(-2600, 700, 7200, 900);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.beginPath(); ctx.ellipse(960, 900, 820, 120, 0, 0, TAU); const g = ctx.createRadialGradient(960, 900, 0, 960, 900, 820); g.addColorStop(0, col(0.16)); g.addColorStop(1, col(0)); ctx.fillStyle = g; ctx.fill(); ctx.restore();
      for (let i = -12; i <= 12; i++) ivLine(960 + i * 30, 780, 960 + i * 420, 1500, 1.5, col(0.05));
      for (let j = 0; j < 6; j++) { const y = 780 + Math.pow(j / 6, 1.8) * 700; ivLine(-2000, y, 4000, y, 1.5, col(0.04)); }
    } },
    { d: 1, draw: () => { o.act && o.act(); o.front && o.front(); } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const r = RNG('voidf').f;
      for (let i = 0; i < 6; i++) { const x = -400 + r() * 2800 + Math.sin(TT * 0.3 + i) * 40, y = r() * 1100; ctx.globalAlpha = 0.1; ivDot(x, y, 60 + r() * 90, col(0.7)); } ctx.restore(); } }]),
  ];
}
