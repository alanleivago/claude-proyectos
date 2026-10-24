// =====================================================================
//  s08 — 133–156 · walking home, the ghost goes BLANK, Dad's hand on the hood, the scooter, the counter,
//  the message from ten seconds ahead, the CTA. Prefix s08_. Times only from the voice helpers.
// =====================================================================
const s08_ramp = (lt, a, d) => EZ.o3(clamp((lt - a) / d));          // a hard-stopping gesture ramp (d ≈ 4–6 frames)
const s08_fr = (n) => n / FPS;
const s08_ss = (fn) => () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); fn(); ctx.restore(); };   // draw in screen space
// replace a set's actor plane (d = 1) with our own draw; o.noFg drops the soft foreground
function s08_swap(layers, d1, o = {}) { return layers.filter((L) => !(o.noFg && L.d < 1)).map((L) => (L.d === 1 ? { d: 1, draw: d1 } : L)); }
// THE BLANK: the ghost is gone — the world drained to a cold grey-blue (k 0..1)
function s08_blank(k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 0.86 * k; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = k; ctx.fillStyle = 'rgb(206,214,232)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.06 * k; ctx.fillStyle = '#3a4a66'; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
// the cyan dying on "blank": a few frames of flicker, then nothing
function s08_flick(tb) {
  if (TT < tb) return 1;
  const n = Math.floor((TT - tb) * FPS); return n < 9 ? [1, 0, 0.8, 0, 0, 0.5, 0, 0.2, 0][n] : 0;
}
const s08_blankK = () => clamp((TT - VW('135-narrator', 'blank')) * FPS / 4);   // 0 → 1 over 4 frames after "blank"
// a hand target for ivMan: the vector (units of h, mirrored by facing) from the shoulder to a world point
function s08_hand(x, y, h, f, P, tx, ty, side = 'R', build = 1) {
  const J = IV_J, s = f < 0 ? -1 : 1, af = Math.abs(f), lean = P.lean || 0, dip = P.dip || 0;
  const hip = [x + (P.dx || 0) * h, y - h * (J.hipY - dip)], L = (J.shY - J.hipY) * h;
  const sh = [hip[0] + Math.sin(lean) * s * L, hip[1] - Math.cos(lean) * L];
  const sw = J.sw * h * (1 - 0.55 * af) * build, b = side === 'R' ? [sh[0] + sw * s, sh[1]] : [sh[0] - sw * s, sh[1]];
  return [(tx - b[0]) / (h * s), (ty - b[1]) / h];
}
// feet at exact points (screen/world): the leg vectors from the hip for ivMan
function s08_feet(x, y, h, f, P, L, R) {
  const s = f < 0 ? -1 : 1, hipY = y - h * (IV_J.hipY - (P.dip || 0)), hx = x + (P.dx || 0) * h;
  return { ...P, fL: [(L[0] - hx) * s / h, (L[1] - hipY) / h], fR: [(R[0] - hx) * s / h, (R[1] - hipY) / h] };
}
// Theo seen from behind: no face, the hood on the nape (for the step off the curb and the grab)
function s08_back(o) {
  const who = { ...o.who, top: 'back' }, r = ivMan({ ...o, who, expr: { eyes: 'closed', mouth: 'none' }, noBlink: true });
  const [x, y] = r.head, R = r.R, c2 = o.who.col2 || '#23704a', yank = o.hoodPull || 0;
  ivDot(x, y, R * 0.985, IV.ink);
  ctx.beginPath(); ctx.ellipse(x - yank * R * 0.25, y + R * (0.8 + yank * 0.12), R * (0.92 + yank * 0.1), R * (0.52 + yank * 0.12), 0, 0, TAU); ctx.fillStyle = c2; ctx.fill();
  ctx.beginPath(); ctx.ellipse(x, y + R * 0.62, R * 0.62, R * 0.24, 0, Math.PI * 0.08, Math.PI * 0.92); ctx.strokeStyle = ivShade(c2, -0.35); ctx.lineWidth = R * 0.07; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x - R * 0.2, y + R * 0.95, R * 0.35, R * 0.1, 0.2, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
  return r;
}
// a face close-up: head of radius R centred at (cx, cy), screen space
function s08_face(who, cx, cy, R, f, expr, o = {}) {
  const h = R / IV_J.R; return ivMan({ who, x: cx, y: cy + h * IV_J.headY, h, f, pose: o.pose || ivPose('stand', { hL: [-0.05, 0.29], hR: [0.05, 0.29] }), expr, talk: o.talk, grip: o.grip, hold: o.hold, blinkKey: o.blinkKey, armsFront: o.armsFront, noBlink: o.noBlink });
}
// the corner at sunset with our own actors' plane: keeps the set's sidewalk + pole, adds o.act
const s08_corner = (o = {}) => SET_corner({ t: 'sunset', light: 'green', ...o });

// ---------------------------------------------------------------------
//  133 "Walking home." — wide, Dad a step behind you; the ghost shows you both already across
// ---------------------------------------------------------------------
SHOT(CUT('133-narrator'), 's08_walkHome', (lt) => {
  const t0 = CUT('133-narrator');
  IV_CAM = { x: 980, y: 560, z: 1.12 * ivPush(t0, 0.03, 1.8) };
  ivStage(s08_corner({ act: () => {
    // ten seconds ahead: the two of you halfway over Main St
    ivGhost(() => { s08_back({ who: CAST.you, x: 420, y: 790, h: 360, f: 0.12, pose: ivWalk(t0 - 3, 0, 360, 1, 7).pose });
      ivMan({ who: CAST.dad, x: 560, y: 800, h: 400, f: -0.2, pose: ivWalk(t0 - 2, 0, 400, 1, 7).pose, expr: { eyes: 'open' } }); }, 0.42);
    const w = ivWalk(t0, 1320, 500, -1, 7), d = ivWalk(t0, 1640, 560, -1, 7);
    ivMan({ who: CAST.dad, x: d.x, y: 915, h: 560, f: -0.6, pose: d.pose, expr: { eyes: 'open', mouth: 'smile', look: [-1, 0.2] } });
    ivMan({ who: CAST.you, x: w.x, y: 935, h: 520, f: -0.6, pose: ivPoseMix(w.pose, ivPose('stand', { hL: [0.06, 0.14] }), 0.4), expr: { eyes: 'open', mouth: 'smile' } });
  } }));
}, { sec: 's08', title: 'Walking home — you + Dad, ghost of you both already crossing' });

// 134 "Fifth and Main." — insert: the street blades and the walk signal
SHOT(CUT('134-narrator'), 's08_signs', (lt) => {
  IV_CAM = { x: 1470, y: 300, z: 2.3 };
  ivStage(s08_corner({ light: 'green', act: () => {
    // the ghost: in ten seconds the signal is still green — nothing coming
    ivGhost(() => ivDot(SET_POS.corner.signal[0] + 2, SET_POS.corner.signal[1] + 176, 25, '#ffffff'), 0.35 + 0.1 * Math.sin(TT * 9));
  } }));
}, { sec: 's08', title: 'MAIN ST × 5TH ST blades, walk light green' });

// 135 "You step off the curb," — side-on, low: your shoe drops off the curb onto the crosswalk; the ghost foot ahead
function s08_curbFeet(lt, u, ghost) {
  const yR = 905, yS = 790, edge = 1060;                                             // road level, curb top, curb edge (screen)
  // the curb + road, side-on
  ctx.fillStyle = '#4a3644'; ctx.fillRect(edge, yS, 1200, 400); ctx.fillStyle = ivVGrad(yS, yS + 30, ['#7a5a64', '#4a3644']); ctx.fillRect(edge, yS, 1200, 30);
  ivRR(edge - 14, yS, 30, yR - yS + 10, 6, '#6a4c58'); ivLine(edge, yS + 2, 2000, yS + 2, 3, 'rgba(255,200,150,0.5)');
  ctx.fillStyle = ivVGrad(yR, 1100, ['#33263a', '#1e1624']); ctx.fillRect(-100, yR, edge + 20, 400);
  for (let k = 0; k < 4; k++) ivRR(-60 + k * 290, yR - 2, 200, 12, 4, 'rgba(235,225,215,0.8)');   // crosswalk stripes on the road top
  ivLine(-100, yR, edge, yR, 3, 'rgba(255,190,140,0.45)');
  const h = 1700, P0 = ivPose('stand', { lean: 0.04 });
  const step = (k) => {   // k 0..1: the front foot (L, facing left) lifts off the curb and lands on the road
    const back = [edge + 210, yS], frontA = [edge + 40, yS], frontB = [edge - 420, yR];
    const fx = lerp(frontA[0], frontB[0], k), fy = lerp(frontA[1], frontB[1], k) - Math.sin(Math.PI * k) * 90;
    const hx = lerp(edge + 140, edge - 120, k);
    const P = s08_feet(hx, yR, h, -1, { ...P0, dip: 0.02 + 0.03 * Math.sin(Math.PI * k) }, [fx, fy], back);
    return { x: hx, P };
  };
  if (ghost > 0) ivGhost(() => { const g = step(1); ivMan({ who: CAST.you, x: g.x - 380, y: yR, h, f: -1, pose: s08_feet(g.x - 380, yR, h, -1, P0, [edge - 820, yR], [edge - 470, yR]), noBlink: true }); }, 0.5 * ghost);
  const s = step(u); ivMan({ who: CAST.you, x: s.x, y: yR, h, f: -1, pose: s.P, noBlink: true });
}
SHOT(CUT('135-narrator'), 's08_step', (lt) => {
  const ts = VW('135-narrator', 'step') - CUT('135-narrator');
  IV_CAM = { x: 600, y: 700, z: 3.0 };
  ivStage(s08_swap(s08_corner({ cars: false }), s08_ss(() => s08_curbFeet(lt, s08_ramp(lt, ts, s08_fr(6)), 1)), { noFg: true }));
}, { sec: 's08', title: 'shoe steps off the curb; ghost foot ahead' });

// 135 "…and the ghost goes blank." — medium: you at the edge of the road, the ghost world on… then it flickers out
SHOT(CUT('135-narrator', 'and'), 's08_blank', (lt) => {
  const tb = VW('135-narrator', 'blank'), g = s08_flick(tb), k = s08_blankK(), after = TT >= tb;
  IV_CAM = { x: 560, y: 560, z: 1.9 };
  ivStage(s08_corner({ cars: false, road: () => {
    if (g > 0) ivGhost(() => { const x = -600 + mod(TT * 700, 2600); set_carNight(x, 885, 1.5, 1, '#5a6a8a'); set_carNight(2200 - mod(TT * 600 + 900, 2600), 800, 1.3, -1, '#5a6a8a'); }, 0.55 * g);
  }, act: () => {
    if (g > 0) ivGhost(() => s08_back({ who: CAST.you, x: 330, y: 760, h: 380, f: 0.1, pose: ivWalk(tb - 8, 0, 380, 1, 7).pose }), 0.45 * g);
    const u = s08_ramp(TT, tb, s08_fr(4));
    ivMan({ who: CAST.you, x: 470, y: 860, h: 520, f: lerp(-0.25, 0.05, u), pose: ivPoseMix(ivPose('relaxed'), ivPose('stand', { hL: [-0.08, 0.24], hR: [0.08, 0.24], tilt: -0.04 }), u),
      expr: after ? { eyes: 'wide', mouth: 'o', brow: 'up', look: [0.3, 0] } : { eyes: 'open', mouth: 'flat', look: [-1, -0.2] } });
    if (g > 0) ivGlow(470, 420, 260, 'rgba(90,230,255,0.22)', g);
  } }));
  s08_blank(k);
}, { sec: 's08', title: 'the ghost flickers out on "blank" — world drains grey-blue' });

// [BEAT 2 s] — silence. Wide: you alone in the crosswalk, everything still and grey
const s08_beat135 = (u) => LE('135-narrator') + (LT('136-narrator') - LE('135-narrator')) * u;
SHOT(s08_beat135(0.12), 's08_greyWide', () => {
  IV_CAM = { x: 900, y: 520, z: 1.0 };
  ivStage(s08_corner({ cars: false, act: () => {
    ivMan({ who: CAST.you, x: 470, y: 850, h: 470, f: 0.05, pose: ivPose('stand', { hL: [-0.08, 0.24], hR: [0.08, 0.24] }), expr: { eyes: 'wide', mouth: 'flat', look: [0, 0] } });
  } }));
  s08_blank(1);
}, { sec: 's08', title: 'BEAT: grey wide, alone in the crosswalk, silent' });
SHOT(s08_beat135(0.58), 's08_eyeEmpty', () => {
  IV_CAM = { x: 600, y: 420, z: 3.2 };
  ivStage(s08_swap(s08_corner({ cars: false }), s08_ss(() => {
    const R = 900, sp = R * 0.38 * (1 - 0.42 * 0.05);
    const m = s08_face(CAST.you, 960 + sp - 20, 540 + R * 0.06, R, 0.05, { eyes: 'wide', mouth: 'flat', look: [0, 0] }, { noBlink: true });
    // the eye reflects only the grey street — no cyan anywhere
    const ex = m.head[0] - sp + 0.05 * R * 0.42, ey = m.head[1] - R * 0.06;
    ivRR(ex - 70, ey - 120, 50, 28, 8, 'rgba(255,255,255,0.35)');
  }), { noFg: true }));
  s08_blank(1);
}, { sec: 's08', title: 'BEAT: extreme close-up — the eye, nothing in it' });

// 136 "For the first time in your life, / there is no next ten seconds."
SHOT(CUT('136-narrator'), 's08_faceFirst', () => {
  IV_CAM = { x: 520, y: 470, z: 2.8 };
  ivStage(s08_swap(s08_corner({ cars: false }), s08_ss(() => {
    s08_face(CAST.you, 860, 450, 215, -0.15, { eyes: 'wide', mouth: 'o', brow: 'up', look: [-0.4, 0.1] });
  }), { noFg: true }));
  s08_blank(1);
}, { sec: 's08', title: 'face: eyes wide, the ghost glow gone' });
SHOT(CUT('136-narrator', 'there'), 's08_noNext', (lt) => {
  const tEnd = VWE('136-narrator', 'seconds'), tNo = VW('136-narrator', 'no');
  ivStage(SET_void({ mood: 'night' }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const y = 600, x0 = 360, x1 = 1560;
  ivLine(x0 - 260, y, x0, y, 14, 'rgba(255,230,200,0.6)');
  ivDot(x0, y, 34, '#ffe2b0'); ivGlow(x0, y, 160, 'rgba(255,170,90,0.6)');
  ivText('NOW', x0, y + 110, 52, '#ffe6c4', { track: 4, glow: 'rgba(255,170,90,0.5)' });
  const fade = 1 - 0.7 * s08_ramp(TT, tNo, s08_fr(5));
  ctx.setLineDash([40, 30]); ctx.globalAlpha = fade; ivLine(x0 + 60, y, x1, y, 12, '#aab3c4', 'butt'); ctx.setLineDash([]); ctx.globalAlpha = 1;
  ivDot(x1, y, 26 * fade, '#aab3c4');
  ivTag('+10 s', x1, y - 120, 80, ivPop(CUT('136-narrator', 'there')) * Math.max(0.55, fade), { c: '#d9dee8', line: 'rgba(200,210,230,0.5)' });
  const st = s08_ramp(TT, tEnd - s08_fr(4), s08_fr(4));
  if (st > 0) ivLine(x1 - 160, y - 90, lerp(x1 - 160, x1 + 160, st), lerp(y - 90, y - 170, st), 12, '#f0e2cc');
  ivText('?', (x0 + x1) / 2, y - 90, 220, `rgba(225,230,240,${0.2 + 0.5 * s08_ramp(TT, tNo, s08_fr(5))})`);
  ctx.restore();
  s08_blank(1);
}, { sec: 's08', title: 'graphic: NOW —— +10 s goes dead, struck out on "seconds"' });

// 137 "Because ten seconds from now, / you won't be looking at anything." — top-down on the crosswalk
function s08_topMan(x, y, s, who, ang = 0) {   // a stick person seen from straight above
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(40, 50, 90, 46, 0.3, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();   // long sunset shadow
  ivLine(-70, 0, -92, 46, 26, IV.ink); ivLine(70, 0, 92, 46, 26, IV.ink);   // arms hanging
  ivDot(-92, 50, 16, IV.ink); ivDot(92, 50, 16, IV.ink);
  ctx.beginPath(); ctx.ellipse(0, 0, 86, 44, 0, 0, TAU); ctx.fillStyle = IV_M.rim; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 0, 82, 40, 0, 0, TAU); ctx.fillStyle = who.col; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 16, 50, 24, 0, 0, TAU); ctx.fillStyle = who.col2 || ivShade(who.col, -0.3); ctx.fill();   // hood
  ivDot(0, -4, 50, IV_M.rim); ivDot(0, -4, 47, IV.ink);
  ctx.restore();
}
SHOT(CUT('137-narrator'), 's08_topDown', (lt) => {
  IV_M = IV_MOOD.sunset;
  ivStage([{ d: 1, draw: s08_ss(() => {
    ctx.fillStyle = '#3a2c3c'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#5a4450'; ctx.fillRect(0, 0, W, 210); ivRR(-10, 200, W + 20, 26, 4, '#7a5e66');           // our sidewalk + curb (top)
    for (let x = 60; x < W; x += 240) ivLine(x, 0, x, 200, 3, 'rgba(0,0,0,0.15)');
    for (let k = 0; k < 7; k++) ivRR(700, 270 + k * 112, 520, 56, 6, 'rgba(232,224,214,0.82)');               // zebra bars
    for (let x = -100; x < W; x += 300) ivRR(x, 652, 170, 14, 4, '#e8c56a');                                  // centre line
    ivRR(1690, 60, 60, 60, 10, '#232634'); ivDot(1720, 90, 18, '#2a2e3c');                                    // the signal pole from above
    for (let i = 0; i < 4; i++) { const yy = 520 + i * 160; ivLine(0, yy, W, yy, 2, 'rgba(255,255,255,0.03)'); }
    s08_topMan(960, 420, 1.7, CAST.you);
  }) }]);
  ivTag('10 s', 1480, 330, 64, ivPop(VWE('137-narrator', 'seconds') - s08_fr(3)), { c: '#e8e2d8' });
  s08_blank(1);
}, { sec: 's08', title: 'top-down: you alone on the zebra, "10 s"' });
SHOT(CUT('137-narrator', 'you'), 's08_dots', () => {
  IV_CAM = { x: 620, y: 600, z: 1.55 };
  ivStage(s08_corner({ cars: false, act: () => {
    ivMan({ who: CAST.you, x: 470, y: 850, h: 520, f: 0.0, pose: ivPose('stand', { hL: [-0.06, 0.27], hR: [0.06, 0.27] }), expr: { eyes: 'dots', mouth: 'flat' }, noBlink: true });
  } }));
  s08_blank(1);
}, { sec: 's08', title: 'you, eyes gone to dots: "won\'t be looking at anything"' });

// 138 "You can't move." — low, front: your feet nailed to a stripe, fists shut
SHOT(CUT('138-narrator'), 's08_cantMove', () => {
  IV_CAM = { x: 470, y: 760, z: 3.0 };
  ivStage(s08_swap(s08_corner({ cars: false }), s08_ss(() => {
    ctx.fillStyle = ivVGrad(700, 1080, ['#3a2c3c', '#2a2030']); ctx.fillRect(0, 700, W, 400);
    ivPoly([[380, 830], [1540, 830], [1640, 990], [280, 990]], 'rgba(232,224,214,0.8)');
    ivLine(0, 702, W, 702, 3, 'rgba(255,190,140,0.35)');
    ivMan({ who: CAST.you, x: 960, y: 930, h: 1650, f: 0.05, pose: ivPose('stand', { hL: [-0.1, 0.25], hR: [0.1, 0.25], fL: [-0.09, 0.45], fR: [0.09, 0.45] }), grip: { front: 'fist', back: 'fist' }, noBlink: true });
  }), { noFg: true }));
  s08_blank(1);
}, { sec: 's08', title: 'feet planted on the stripe, fists shut' });

// 139 "You can't see / where it's coming from." — face: left… right (the turn on "where"); POV: the empty road
SHOT(CUT('139-narrator'), 's08_bothWays', (lt) => {
  const u = s08_ramp(TT, VW('139-narrator', 'where'), s08_fr(5));
  IV_CAM = { x: 700, y: 460, z: 2.6 };
  ivStage(s08_swap(s08_corner({ cars: false }), s08_ss(() => {
    s08_face(CAST.you, 960, 440, 210, lerp(-0.45, 0.45, u), { eyes: 'wide', mouth: 'flat', brow: 'up', look: [lerp(-1, 1, u), 0] });
  }), { noFg: true }));
  s08_blank(1);
}, { sec: 's08', title: 'face snaps left → right on "where"' });
SHOT(CUT('139-narrator', 'coming'), 's08_pov', (lt) => {
  IV_CAM = { x: -150, y: 640, z: 1.8 };
  ivStage(s08_corner({ cars: false, fg: false, road: () => {
    const u = clamp(lt / 1.4), x = -260 + u * 220, r = 9 + u * 14;   // a single small light, far down the road, growing
    ivDot(x, 838, r, '#fff6e0'); ivGlow(x, 838, 120 + u * 120, 'rgba(255,245,220,0.5)');
  } }));
  s08_blank(1);
}, { sec: 's08', title: 'POV down Main St: empty, one small light far off' });

// ---------------------------------------------------------------------
//  140–149 · the hand, the yank, the scooter, Dad, the counter (the world grey until Dad; Dad drawn in colour)
// ---------------------------------------------------------------------
// a big arm in screen space: sleeve + five-finger glove, rim pass then body pass
function s08_bigArm(x0, y0, x1, y1, lw, col, grip, s = 1) {
  const ang = Math.atan2(y1 - y0, x1 - x0), h = lw / IV_J.lw, rw = Math.max(2, h * 0.009), k = IV_M.key;
  for (const rim of [true, false]) {
    const C = (c) => (rim ? IV_M.rim : c), Wd = (w) => w + (rim ? rw * 2 : 0);
    ctx.save(); if (rim) ctx.translate(k[0] * rw * 0.9, k[1] * rw * 0.9);
    ivLine(x0, y0, x1, y1, Wd(lw), C(IV.ink));
    ivLine(x0, y0, lerp(x0, x1, 0.86), lerp(y0, y1, 0.86), Wd(lw * 1.7), C(col));
    if (!rim) ivLine(lerp(x0, x1, 0.8), lerp(y0, y1, 0.8), lerp(x0, x1, 0.86), lerp(y0, y1, 0.86), lw * 1.72, ivShade(col, -0.3), 'butt');   // cuff
    ivHand(x1, y1, ang, h, 'glove', grip, C, Wd, s);
    ctx.restore();
  }
}
const s08_sitGround = (o = {}) => ({ ...IV_POSES.stand, hL: [-0.1, 0.18], hR: [0.16, 0.12], fL: [0.28, 0.14], fR: [0.36, 0.15], dip: 0.3, seat: true, lean: -0.08, ...o });
const s08_onLayer = (fn) => { ctx.save(); ctx.setTransform(...ivLayerXf(1)); fn(); ctx.restore(); };   // draw on the actors' plane after the stage

// 140 "A hand grabs your hood…" — close: Dad's hand (in colour) closes on the green hood
SHOT(CUT('140-narrator'), 's08_grab', (lt) => {
  const tg = VW('140-narrator', 'grabs'), u = s08_ramp(TT, tg - s08_fr(5), s08_fr(5)), held = TT >= tg, pull = s08_ramp(TT, tg, s08_fr(4));
  IV_CAM = { x: 470, y: 420, z: 3.0 };
  ivStage(s08_swap(s08_corner({ cars: false }), s08_ss(() => {
    s08_back({ who: CAST.you, x: 1150, y: 420 + 0.85 * 2400, h: 2400, f: 0.04, pose: ivPose('stand', { hL: [-0.06, 0.28], hR: [0.06, 0.28] }), hoodPull: pull });
  }), { noFg: true }));
  s08_blank(1);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  s08_bigArm(-160, 1300, lerp(260, 1010 - 50 * pull, u), lerp(1110, 790 + 40 * pull, u), 118, CAST.dad.col, held ? 'hold' : 'open');
  ctx.restore();
}, { sec: 's08', title: 'HAND CLOSE-UP: Dad\'s glove grabs the hood (colour on grey)' });

// "…and yanks you back." — medium: you fly back off the road into Dad
SHOT(CUT('140-narrator', 'yanks'), 's08_yank', (lt) => {
  const ty = VW('140-narrator', 'yanks'), u = s08_ramp(TT, ty, s08_fr(5));
  let hood = [470, 500];
  IV_CAM = { x: 560, y: 640, z: 1.45 };
  ivStage(s08_corner({ cars: false, act: () => {
    const x = lerp(470, 440, u), y = lerp(850, 960, u), hh = lerp(520, 540, u), air = Math.sin(Math.PI * u) * 0.08;
    const r = s08_back({ who: CAST.you, x, y, h: hh, f: 0.04, air: true, hoodPull: 1,
      pose: ivPose('stand', { hL: [-0.17 * u - 0.05, 0.2 - 0.25 * u], hR: [0.17 * u + 0.05, 0.2 - 0.25 * u], fL: [-0.06, 0.45 - air], fR: [0.09, 0.45 - air * 1.6], dip: -air * 0.6 }) });
    hood = [r.head[0], r.head[1] + r.R * 0.85];
  } }));
  s08_blank(1);
  s08_onLayer(() => {
    const P = ivPose('grab', { lean: lerp(0, -0.22, u) }), dx = 290, dy = 1000, dh = 600;
    P.hR = s08_hand(dx, dy, dh, 0.5, P, hood[0], hood[1], 'R', CAST.dad.build);
    ivMan({ who: CAST.dad, x: dx, y: dy, h: dh, f: 0.5, pose: P, grip: { front: 'hold' }, expr: { eyes: 'angry', mouth: 'open', brow: 'angry' } });
  });
}, { sec: 's08', title: 'the yank: off the road, back into Dad' });

// 141 "A scooter screams through / the spot where you were standing."
SHOT(CUT('141-narrator'), 's08_scooter', (lt) => {
  const ts = VW('141-narrator', 'screams'), sx = 470 + (TT - ts) * 2800;
  let hood = [520, 700];
  IV_CAM = { x: 700, y: 620, z: 1.3 };
  ivStage(s08_corner({ cars: false, act: () => {
    if (sx > -900 && sx < 3000) P_scooter(sx, 858, 0.95, { dir: 1, who: CAST.extraB, h: 470, speed: 1, expr: { eyes: 'squint', mouth: 'flat' } });
    const r = ivMan({ who: CAST.you, x: 520, y: 985, h: 520, f: 0.35, pose: s08_sitGround({ hL: [-0.16, 0.14], hR: [0.1, 0.16] }), expr: { eyes: 'wide', mouth: 'o', brow: 'up', look: [1, -0.2] } });
    hood = [r.head[0] - r.R * 0.4, r.head[1] + r.R * 0.75];
  } }));
  s08_blank(1);
  s08_onLayer(() => {
    const P = ivPose('grab', { lean: -0.1 }), dx = 300, dy = 1010, dh = 600;
    P.hR = s08_hand(dx, dy, dh, 0.5, P, hood[0], hood[1], 'R', CAST.dad.build);
    ivMan({ who: CAST.dad, x: dx, y: dy, h: dh, f: 0.5, pose: P, grip: { front: 'hold' }, expr: { eyes: 'wide', mouth: 'open', brow: 'up', look: [1, -0.2] } });
  });
}, { sec: 's08', title: 'the scooter screams through the spot (you on the ground, Dad holding the hood)' });
SHOT(CUT('141-narrator', 'spot'), 's08_spot', (lt) => {
  IV_CAM = { x: 470, y: 760, z: 3.0 };
  ivStage(s08_swap(s08_corner({ cars: false }), s08_ss(() => {
    ctx.fillStyle = ivVGrad(640, 1080, ['#3a2c3c', '#241a2a']); ctx.fillRect(0, 640, W, 460);
    ivLine(0, 642, W, 642, 3, 'rgba(255,190,140,0.35)');
    ivPoly([[260, 760], [1660, 760], [1800, 960], [120, 960]], 'rgba(232,224,214,0.82)');
    const sp = clamp(1 - lt / 0.35);   // the last of the scooter's wind
    if (sp > 0) { ctx.save(); ctx.globalAlpha = sp; for (let i = 0; i < 6; i++) ivLine(200 + i * 40, 600 + i * 50, 1900, 600 + i * 50, 8, 'rgba(255,240,220,0.5)'); ctx.restore(); }
    const lx = 900 + lt * 520, ly = 700 - Math.abs(Math.sin(lt * 5)) * 90;   // a leaf still spinning where you stood
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(lt * 9); ctx.beginPath(); ctx.ellipse(0, 0, 34, 14, 0, 0, TAU); ctx.fillStyle = '#b0703a'; ctx.fill(); ivLine(-34, 0, 34, 0, 3, '#6a4020'); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.35; for (let i = 0; i < 9; i++) { const r = RNG('s08dust' + i).f; ivDot(700 + r() * 600 + lt * 300 * r(), 860 - r() * 200 - lt * 60, 4 + r() * 6, '#d8d0c8'); } ctx.restore();
  }), { noFg: true }));
  s08_blank(1);
}, { sec: 's08', title: 'the empty spot on the stripe, a leaf spinning' });

// 142 "It's Dad." — low close-up on Dad, in colour, breathing hard
SHOT(CUT('142-narrator'), 's08_itsDad', (lt) => {
  IV_CAM = { x: 300, y: 330, z: 2.6 };
  ivStage(s08_swap(s08_corner({ cars: false }), s08_ss(() => {}), { noFg: true }));
  s08_blank(0.6);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const br = Math.sin(lt * 9) * 6;
  s08_face(CAST.dad, 1060, 470 + br, 215, -0.25, { eyes: 'wide', mouth: 'open', brow: 'sad', look: [-0.5, 0.4] }, { blinkKey: 'd1' });
  ctx.restore();
}, { sec: 's08', title: 'It\'s Dad — close, low, panting' });

// 143 Dad: "Eyes on the road, kid." — the ritual: two fingers to his eyes, then at you. Colour comes back.
const s08_warm = (k0) => s08_blank(k0 * (1 - EZ.o3(clamp((TT - SHOT_T0) / 1.2))));
SHOT(CUT('143-dad'), 's08_eyesOnRoad', (lt) => {
  const te = VW('143-dad', 'eyes'), tk = VW('143-dad', 'kid');
  const a = s08_ramp(TT, te - s08_fr(5), s08_fr(5)), b = s08_ramp(TT, tk - s08_fr(5), s08_fr(5));
  IV_CAM = { x: 820, y: 600, z: 1.55 };
  ivStage(s08_corner({ cars: false, act: () => {
    const dx = 660, dy = 975, dh = 590, P0 = ivPose('relaxed');
    const eyes = s08_hand(dx, dy, dh, 0.5, P0, dx + 0.09 * dh, dy - 0.86 * dh, 'R', CAST.dad.build), kid = s08_hand(dx, dy, dh, 0.5, P0, 1000, 680, 'R', CAST.dad.build);
    const hR = b > 0 ? [lerp(eyes[0], kid[0], b), lerp(eyes[1], kid[1], b)] : [lerp(P0.hR[0], eyes[0], a), lerp(P0.hR[1], eyes[1], a)];
    ivMan({ who: CAST.dad, x: dx, y: dy, h: dh, f: 0.5, pose: { ...P0, hR }, grip: { front: 'point' }, talk: '143-dad', expr: { eyes: 'squint', mouth: 'flat', brow: 'sad' } });
    ivMan({ who: CAST.you, x: 1060, y: 985, h: 520, f: -0.45, pose: s08_sitGround({ hL: [-0.12, 0.16], hR: [0.14, 0.15] }), expr: { eyes: 'wide', mouth: 'flat', look: [-1, -0.6] } });
  } }));
  s08_warm(0.4);
}, { sec: 's08', title: 'Dad: "Eyes on the road, kid." — fingers to his eyes, then at you' });

// 144 "He didn't see the future." — Dad's eye, extreme close: no cyan, only you reflected in it
SHOT(CUT('144-narrator'), 's08_dadEye', () => {
  IV_CAM = { x: 400, y: 330, z: 3.2 };
  ivStage(s08_swap(s08_corner({ cars: false }), s08_ss(() => {
    const R = 880, sp = R * 0.38 * (1 - 0.42 * 0.1);
    const m = s08_face(CAST.dad, 960 + sp - 0.1 * R * 0.42, 600 + R * 0.06, R, 0.1, { eyes: 'open', mouth: 'flat' }, { noBlink: true });
    const ex = m.head[0] - sp + 0.1 * R * 0.42, ey = m.head[1] - R * 0.06;
    ivDot(ex, ey + 10, 92, '#3a2c34'); ivDot(ex, ey + 10, 86, '#1a1218');                                     // the iris
    ivMan({ who: CAST.you, x: ex + 6, y: ey + 64, h: 120, f: 0.1, pose: ivPose('relaxed'), hands: 'nub', expr: { eyes: 'open', mouth: 'smile' } });   // you, in his eye
    ivRR(ex - 70, ey - 120, 46, 26, 8, 'rgba(255,255,255,0.55)');
  }), { noFg: true }));
  s08_blank(0.12);
}, { sec: 's08', title: 'ECU Dad\'s eye: no ghost, just you in it' });

// 145 "He was just watching you." — the walk home again, from his side: his eyes on you the whole way
SHOT(CUT('145-narrator'), 's08_watching', (lt) => {
  const t0 = CUT('145-narrator');
  IV_CAM = { x: 1180, y: 560, z: 1.5 };
  ivStage(s08_corner({ act: () => {
    const w = ivWalk(t0, 1260, 500, -1, 7), d = ivWalk(t0, 1560, 560, -1, 7);
    ivMan({ who: CAST.you, x: w.x, y: 935, h: 500, f: -0.6, pose: w.pose, expr: { eyes: 'open', mouth: 'flat', look: [-1, 0] } });
    ivMan({ who: CAST.dad, x: d.x, y: 915, h: 560, f: -0.6, pose: d.pose, expr: { eyes: 'open', mouth: 'smile', look: [-1, 0.6] } });
  } }));
}, { sec: 's08', title: 'callback: walking home, Dad\'s eyes on you' });

// [BEAT 1 s] — the hug
SHOT(LE('145-narrator') + s08_fr(2), 's08_hug', (lt) => {
  IV_CAM = { x: 930, y: 520, z: 1.85 * ivPush(SHOT_T0, 0.03, 1.8) };
  ivStage(s08_corner({ cars: false, act: () => {
    ivMan({ who: CAST.you, x: 1010, y: 945, h: 520, f: -0.55, pose: ivPose('hug', { hL: [0.18, 0.12], hR: [0.22, 0.1] }), expr: { eyes: 'happy', mouth: 'smile' } });
    ivMan({ who: CAST.dad, x: 830, y: 950, h: 580, f: 0.55, pose: ivPose('hug', { hL: [0.24, 0.14], hR: [0.3, 0.12], tilt: 0.12 }), expr: { eyes: 'closed', mouth: 'smile' } });
  } }));
}, { sec: 's08', title: 'BEAT: the hug, warm sunset' });

// 146 "Futures changed: two hundred and thirteen." — the two of you on the kerb; the counter lands on "thirteen"
const s08_cnt = (rows, a = 1) => ivCounter(rows, a);
SHOT(CUT('146-narrator'), 's08_count213', (lt) => {
  IV_CAM = { x: 960, y: 540, z: 1.0 };
  ivStage(s08_corner({ act: () => {
    ivMan({ who: CAST.dad, x: 820, y: 930, h: 560, f: 0.4, pose: s08_sitGround({ hR: [0.2, -0.05], hL: [-0.1, 0.16] }), expr: { eyes: 'tired', mouth: 'smile' } });
    ivMan({ who: CAST.you, x: 1000, y: 935, h: 500, f: -0.2, pose: s08_sitGround({ hL: [-0.1, 0.16], hR: [0.1, 0.16] }), expr: { eyes: 'open', mouth: 'smile', look: [-0.6, 0] } });
  } }));
  s08_cnt([['FUTURES CHANGED', ivCount(VW('146-narrator', 'two'), VWE('146-narrator', 'thirteen'), 212, 213), true], ['THANK-YOUS', 0]], ivPop(SHOT_T0));
}, { sec: 's08', title: 'counter 212 → 213 on "thirteen", you two on the kerb' });
// 147 "This one wasn't yours." — Dad close, the 213 gets a tag: DAD
SHOT(CUT('147-narrator'), 's08_notYours', (lt) => {
  IV_CAM = { x: 820, y: 420, z: 2.4 };
  ivStage(s08_swap(s08_corner({ cars: false }), s08_ss(() => {
    s08_face(CAST.dad, 700, 360, 165, 0.35, { eyes: 'tired', mouth: 'smile', look: [0.6, 0.2] }, { blinkKey: 'd2' });
  }), { noFg: true }));
  s08_cnt([['FUTURES CHANGED', 213, true], ['THANK-YOUS', 0]]);
  ivTag('BY DAD', 795, H - IV.bar - 160, 30, ivPop(VW('147-narrator', 'wasn\'t')), { c: '#cfe0ff', line: 'rgba(110,150,220,0.8)' });
}, { sec: 's08', title: 'Dad close; tag "BY DAD" over 213' });
// 148 "Thank-yous: one." — you, close; THANK-YOUS 0 → 1 on "one"
SHOT(CUT('148-narrator'), 's08_thanks1', (lt) => {
  IV_CAM = { x: 1100, y: 420, z: 2.4 };
  ivStage(s08_swap(s08_corner({ cars: false }), s08_ss(() => {
    s08_face(CAST.you, 1250, 360, 165, -0.35, { eyes: 'open', mouth: 'smile', look: [-0.7, 0.1] }, { blinkKey: 'y2' });
  }), { noFg: true }));
  s08_cnt([['FUTURES CHANGED', 213, true], ['THANK-YOUS', ivCount(VW('148-narrator', 'one') - s08_fr(4), VWE('148-narrator', 'one'), 0, 1)]]);
}, { sec: 's08', title: 'you close; THANK-YOUS 0 → 1 on "one"' });
// 149 You: "Thanks, Dad." — two-shot on the kerb
SHOT(CUT('149-you'), 's08_thanksDad', (lt) => {
  IV_CAM = { x: 930, y: 600, z: 1.6 };
  ivStage(s08_corner({ cars: false, act: () => {
    ivMan({ who: CAST.dad, x: 780, y: 940, h: 560, f: 0.5, pose: s08_sitGround(), expr: { eyes: 'happy', mouth: 'smile' } });
    ivMan({ who: CAST.you, x: 1080, y: 945, h: 500, f: -0.5, pose: s08_sitGround(), talk: '149-you', expr: { eyes: 'open', mouth: 'smile', look: [-1, -0.3] } });
  } }));
}, { sec: 's08', title: 'You: "Thanks, Dad."' });
// [BEAT 1 s] — fist bump: green sleeve meets blue sleeve, hard stop
SHOT(LE('149-you') + s08_fr(2), 's08_fistBump', (lt) => {
  const u = s08_ramp(lt, 0.25, s08_fr(5)), back = Math.sin(clamp((lt - 0.25 - s08_fr(5)) / 0.25) * Math.PI) * 18;
  IV_CAM = { x: 900, y: 480, z: 2.8 };
  ivStage(s08_swap(s08_corner({ cars: false }), s08_ss(() => {
    s08_bigArm(-200, 820, lerp(380, 740, u) - back, 600, 110, CAST.dad.col, 'fist', 1);
    s08_bigArm(2120, 780, lerp(1540, 1180, u) + back, 600, 104, CAST.you.col, 'fist', -1);
    if (u >= 1 && lt < 0.25 + s08_fr(9)) { ctx.save(); ctx.globalAlpha = 0.6; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ivLine(960 + Math.cos(a) * 150, 590 + Math.sin(a) * 150, 960 + Math.cos(a) * 210, 590 + Math.sin(a) * 210, 6, '#ffe2b0'); } ctx.restore(); }
  }), { noFg: true }));
}, { sec: 's08', title: 'BEAT: fist bump close-up' });

// ---------------------------------------------------------------------
//  150–153 · that night: the message from ten seconds ahead — the cyan comes back
// ---------------------------------------------------------------------
SHOT(CUT('150-narrator'), 's08_night', (lt) => {
  IV_CAM = { x: 900, y: 560, z: 1.05 * ivPush(SHOT_T0, 0.03, 1.8) };
  ivStage(SET_bedroom({ buzz: TT >= VW('150-narrator', 'buzzes'), act: () => {
    ivMan({ who: CAST.you, x: 600, y: GROUND, h: 520, f: 0.45, pose: ivPose('sit', { hL: [0.1, 0.2], hR: [0.16, 0.2], tilt: 0.12 }), expr: { eyes: 'tired', mouth: 'flat', look: [0.6, 0.4] } });
  } }));
}, { sec: 's08', title: 'That night — bedroom wide' });
// "…your phone buzzes." — top-down on the blanket: the lock screen lights up and buzzes
function s08_lock(w, h, o = {}) {
  ctx.fillStyle = ivVGrad(0, h, ['#1a2448', '#11163a', '#0b0d1e']); ctx.fillRect(0, 0, w, h);
  prop_statusBar(w, '');
  ivText(o.time || '11:42', w / 2, 210, 96, '#eef2ff', { font: IV.sans, weight: 300 });
  ivText('Thursday', w / 2, 120, 22, 'rgba(230,236,255,0.7)', { font: IV.sans, weight: 600 });
  if (o.note > 0) { ctx.save(); ctx.globalAlpha = o.note; ivRR(18, 300, w - 36, 120, 26, 'rgba(60,68,100,0.85)'); ivDot(56, 340, 18, '#3a4058');
    ivText('UNKNOWN', 86, 346, 19, '#eef2ff', { align: 'left', font: IV.sans, weight: 700 }); ivText('now', w - 40, 346, 17, 'rgba(230,236,255,0.6)', { align: 'right', font: IV.sans, weight: 600 });
    ivText('1 new message', 40, 392, 22, 'rgba(230,236,255,0.85)', { align: 'left', font: IV.sans, weight: 600 }); ctx.restore(); }
}
SHOT(CUT('150-narrator', 'your'), 's08_buzz', (lt) => {
  const tb = VW('150-narrator', 'buzzes'), on = TT >= tb, bz = on ? Math.sin(TT * 90) * 5 : 0;
  IV_M = IV_MOOD.night;
  ivStage([{ d: 1, draw: s08_ss(() => {
    ctx.fillStyle = '#2d4878'; ctx.fillRect(0, 0, W, H);                                                  // the blanket from above
    for (let i = -4; i < 12; i++) { ctx.beginPath(); ctx.moveTo(i * 220, 0); ctx.bezierCurveTo(i * 220 + 120, 300, i * 220 - 80, 700, i * 220 + 60, H); ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 30; ctx.stroke(); }
    ivRR(-60, -40, 640, 300, 120, '#f0ebe0'); ivRR(-60, -40, 640, 300, 120, null, 'rgba(0,0,0,0.12)', 8);   // the pillow corner
    if (on) { ivGlow(960, 560, 520, 'rgba(150,190,255,0.35)'); ctx.save(); ctx.globalAlpha = 0.5; for (let k = 0; k < 3; k++) { const r = 330 + k * 34 + mod(TT * 120, 34); ctx.beginPath(); ctx.arc(960, 560, r, -0.5, 0.5); ctx.strokeStyle = '#cfe0ff'; ctx.lineWidth = 6; ctx.stroke(); ctx.beginPath(); ctx.arc(960, 560, r, Math.PI - 0.5, Math.PI + 0.5); ctx.stroke(); } ctx.restore(); }
    P_phone(960 + bz, 560, 9.5, { ang: -0.12, off: !on, glow: on, screen: (w, h) => s08_lock(w, h, { note: ivPop(tb) }) });
  }) }]);
}, { sec: 's08', title: 'top-down: the phone on the blanket lights up and buzzes' });

// 151 "A message," — you, lit by the screen
SHOT(CUT('151-narrator'), 's08_reads', (lt) => {
  IV_CAM = { x: 700, y: 470, z: 2.3 };
  ivStage(SET_bedroom({ phone: false, act: () => {
    const m = ivMan({ who: CAST.you, x: 620, y: GROUND, h: 520, f: 0.45, pose: ivPose('sit', { hL: [0.16, -0.02], hR: [0.22, -0.04], tilt: 0.1 }), grip: { front: 'hold', back: 'hold' }, expr: { eyes: 'open', mouth: 'flat', look: [0.6, 0.5] },
      hold: { R: (x, y) => P_phone(x + 6, y - 10, 1.3, { ang: -0.5, screen: (w, h) => P_phoneUI.message(w, h, { from: 'UNKNOWN', text: 'Nice corner. I see twenty.', stamp: '11:42:10 PM' }) }) } });
    ivGlow(m.handR[0], m.handR[1] - 20, 260, 'rgba(160,190,255,0.35)');
  } }));
}, { sec: 's08', title: 'you on the bed, face lit by the message' });
// "…timestamped ten seconds from now." — insert: the bedside clock 11:42:00 vs the stamp 11:42:10
SHOT(CUT('151-narrator', 'timestamped'), 's08_stamp', (lt) => {
  ivStage(SET_void({ mood: 'night' }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const sec = 0;
  ivRR(250, 380, 620, 260, 34, '#141418', 'rgba(255,255,255,0.08)', 4); ivGlow(560, 510, 380, 'rgba(255,60,40,0.18)');
  ivText('11:42:0' + sec, 560, 560, 120, '#ff4a36', { font: IV.sans, weight: 700, glow: 'rgba(255,60,40,0.8)' });
  ivText('NOW', 560, 700, 30, 'rgba(255,230,210,0.7)', { track: 5 });
  ivRR(1080, 400, 600, 220, 40, '#2c3144'); ivPoly([[1110, 600], [1068, 630], [1130, 610]], '#2c3144');
  ivText('Nice corner. I see twenty.', 1380, 490, 34, 'rgba(244,246,255,0.35)', { font: IV.sans, weight: 600 });
  ivText('11:42:10 PM', 1380, 575, 56, '#e9eeff', { font: IV.sans, weight: 700 });
  ivText('SENT', 1380, 700, 30, 'rgba(255,230,210,0.7)', { track: 5 });
  ivTag('+10 s', 960, 300, 56, ivPop(VWE('151-narrator', 'seconds') - s08_fr(3)));
  ctx.restore();
}, { sec: 's08', title: 'insert: clock 11:42:00 vs stamp 11:42:10, "+10 s"' });

// 152 "Nice corner." / 153 "I see twenty." — the phone in your hand, extreme close; on "twenty" the screen turns cyan
function s08_phoneHand(text, cy) {
  s08_bigArm(1500, 1300, 1080, 900, 120, CAST.you.col, 'hold', -1);
  P_phone(960, 520, 10.5, { ang: 0.04, screen: (w, h) => { P_phoneUI.message(w, h, { from: 'UNKNOWN', text, stamp: '11:42:10 PM' });
    if (cy > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(60,200,230,${0.55 * cy})`; ctx.fillRect(0, 0, w, h); ctx.restore(); } } });
}
SHOT(CUT('152-narrator'), 's08_niceCorner', (lt) => {
  IV_CAM = { x: 820, y: 560, z: 2.6 };
  ivStage(s08_swap(SET_bedroom({ phone: false }), s08_ss(() => s08_phoneHand('Nice corner.', 0)), { noFg: true }));
}, { sec: 's08', title: 'ECU phone: "Nice corner."' });
SHOT(CUT('153-narrator'), 's08_seeTwenty', (lt) => {
  const cy = s08_ramp(TT, VW('153-narrator', 'twenty'), s08_fr(6));
  IV_CAM = { x: 820, y: 560, z: 2.6 };
  ivStage(s08_swap(SET_bedroom({ phone: false }), s08_ss(() => { ivGlow(960, 520, 900, 'rgba(90,230,255,0.4)', cy); s08_phoneHand(TT >= VW('153-narrator', 'i') ? 'Nice corner. I see twenty.' : 'Nice corner.', cy); }), { noFg: true }));
  ivTag('20 s', 1560, 300, 60, ivPop(VWE('153-narrator', 'twenty') - s08_fr(3)), { c: '#7ff0ff', line: 'rgba(127,240,255,0.7)' });
}, { sec: 's08', title: 'ECU: "I see twenty." — screen turns cyan, "20 s"' });
// [BEAT 2 s] — your face in the cyan light; then the eye, the future back in it
const s08_beat153 = (u) => LE('153-narrator') + (LT('154-narrator') - LE('153-narrator')) * u;
SHOT(s08_beat153(0.1), 's08_cyanFace', () => {
  IV_CAM = { x: 700, y: 430, z: 2.6 };
  ivStage(s08_swap(SET_bedroom({ phone: false }), s08_ss(() => {
    IV_M = { ...IV_M, rim: '#7ff0ff' };
    ivGlow(960, 1000, 700, 'rgba(90,230,255,0.45)');
    s08_face(CAST.you, 960, 470, 210, 0.05, { eyes: 'wide', mouth: 'o', brow: 'up', look: [0, 0.5] }, { blinkKey: 'y3' });
    ivGlow(960, 1080, 380, 'rgba(127,240,255,0.5)');
  }), { noFg: true }));
}, { sec: 's08', title: 'BEAT: your face lit cyan from below' });
SHOT(s08_beat153(0.55), 's08_eyeCyan', () => {
  IV_CAM = { x: 700, y: 400, z: 3.2 };
  ivStage(s08_swap(SET_bedroom({ phone: false }), s08_ss(() => {
    IV_M = { ...IV_M, rim: '#7ff0ff' };
    const R = 900, sp = R * 0.38 * (1 - 0.42 * 0.05);
    const m = s08_face(CAST.you, 960 + sp - 20, 540 + R * 0.06, R, 0.05, { eyes: 'wide', mouth: 'flat', look: [0, 0] }, { noBlink: true });
    const ex = m.head[0] - sp + 0.05 * R * 0.42, ey = m.head[1] - R * 0.06;
    ivRR(ex - 26, ey - 40, 52, 92, 10, '#7ff0ff'); ivGlow(ex, ey, 200, 'rgba(127,240,255,0.6)');           // the phone, cyan, in your eye
    ivRR(ex - 70, ey - 120, 46, 26, 8, 'rgba(255,255,255,0.55)');
  }), { noFg: true }));
}, { sec: 's08', title: 'BEAT: the eye — cyan back in it (callback to the empty eye)' });

// ---------------------------------------------------------------------
//  154–156 · the CTA
// ---------------------------------------------------------------------
// 154 "So, what would you do with ten seconds of future?" — you, to camera, your ghost a step ahead of you
SHOT(CUT('154-narrator'), 's08_cta', (lt) => {
  IV_CAM = { x: 960, y: 520, z: 1.7 };
  ivStage(SET_void({ mood: 'night', col: '#7ff0ff', act: () => {
    ivGhost(() => ivMan({ who: CAST.you, x: 1180, y: GROUND, h: 520, f: -0.2, pose: ivPose('shrug'), expr: { eyes: 'happy', mouth: 'grin' } }), 0.45);
    ivMan({ who: CAST.you, x: 900, y: GROUND, h: 520, f: 0.0, pose: ivPose('hips'), expr: { eyes: 'open', mouth: 'smirk', brow: 'up', look: [0, 0] } });
  } }));
  ivTag('10 s', 1420, 260, 50, ivPop(VWE('154-narrator', 'seconds') - s08_fr(3)), { c: '#7ff0ff', line: 'rgba(127,240,255,0.7)' });
}, { sec: 's08', title: 'CTA: you to camera, your ghost beside you, "10 s"' });
// 155 "Tell us in the comments." — a comment card; Nia already wrote one
SHOT(CUT('155-narrator'), 's08_comments', (lt) => {
  ivStage(SET_void({ mood: 'night' }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const x = 460, y = 190, w = 1000;
  ivRR(x, y, w, 700, 36, 'rgba(20,18,30,0.92)', 'rgba(255,214,160,0.4)', 3);
  ivText('COMMENTS', x + 60, y + 80, 40, '#ffe6c4', { align: 'left', track: 4 });
  const rows = [[CAST.nia, 'Nia', 'Spoiler.'], [CAST.you, 'Theo', 'I\'d stop a few more.'], [CAST.dad, 'Dad', 'Eyes on the road.']];
  rows.forEach(([who, name, txt], i) => {
    const a = ivPop(SHOT_T0 + 0.15 + i * 0.22); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; const yy = y + 170 + i * 150;
    ivDot(x + 100, yy, 46, who.col); ivDot(x + 100, yy - 6, 26, IV.ink); ivDot(x + 92, yy - 10, 4, IV.eye); ivDot(x + 108, yy - 10, 4, IV.eye);
    ivText(name, x + 180, yy - 12, 30, who.col, { align: 'left' }); ivText(txt, x + 180, yy + 34, 34, '#f4ead6', { align: 'left', font: IV.sans, weight: 600 });
    ctx.restore();
  });
  ivRR(x + 50, y + 600, w - 100, 64, 32, null, 'rgba(255,255,255,0.25)', 3);
  ivText('Add a comment…', x + 90, y + 643, 28, 'rgba(255,255,255,0.45)', { align: 'left', font: IV.sans, weight: 600 });
  if (Math.floor(lt * 2.5) % 2 === 0) ivLine(x + 330, y + 616, x + 330, y + 650, 3, '#ffe6c4');
  ctx.restore();
}, { sec: 's08', title: 'comments card: Nia "Spoiler."' });
// 156 "And if you'd have braked too," — Dad's bus, the brake (callback)
SHOT(CUT('156-narrator'), 's08_braked', (lt) => {
  const u = EZ.o3(clamp(lt / 0.7));
  IV_CAM = { x: 960, y: 540, z: 1.0 };
  ivStage(SET_busSide({ busX: 520 + 260 * u, brake: u > 0.2 ? 1 : 0 }));
}, { sec: 's08', title: 'callback: the bus brakes in the rain' });
// "…hit like and subscribe" — the corner at night, you and Dad walking home, safe; the buttons pop on their words
function s08_pill(str, x, y, a, col) {
  if (a <= 0) return; ctx.save(); ctx.translate(x, y); const sc = 0.85 + 0.15 * EZ.back(clamp(a)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(a);
  ctx.font = `800 40px ${IV.font}`; const w = ctx.measureText(str).width + 110;
  ivRR(-w / 2, -40, w, 80, 40, col); ivText(str, 22, 14, 40, '#fff6e8', { track: 2 });
  ctx.restore();
}
const s08_walkNight = (t0) => {
  const w = ivWalk(t0, 1500, 300, -1, 7), d = ivWalk(t0, 1680, 330, -1, 7);
  ivMan({ who: CAST.you, x: w.x, y: 905, h: 300, f: -0.6, pose: w.pose, expr: { eyes: 'open', mouth: 'smile' } });
  ivMan({ who: CAST.dad, x: d.x, y: 900, h: 330, f: -0.6, pose: d.pose, expr: { eyes: 'open', mouth: 'smile', look: [-1, 0.4] } });
};
SHOT(CUT('156-narrator', 'hit'), 's08_like', (lt) => {
  const t0 = CUT('156-narrator', 'hit');
  IV_CAM = { x: 960, y: 540, z: 1.0 };
  ivStage(SET_corner({ t: 'night', light: 'green', act: () => s08_walkNight(t0) }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  s08_pill('LIKE', 760, 220, ivPop(VW('156-narrator', 'like') - s08_fr(3)), '#3a3448');
  s08_pill('SUBSCRIBE', 1120, 220, ivPop(VW('156-narrator', 'subscribe') - s08_fr(3)), '#c8352e');
  ivDot(712, 228, 0.1, '#fff');
  ctx.restore();
}, { sec: 's08', title: 'LIKE / SUBSCRIBE pop over the night corner' });
// "…for part two." — the last wide: the town at night, the title small, PART 2 lands on "two"; runs to the end
SHOT(CUT('156-narrator', 'part'), 's08_end', (lt) => {
  const t0 = CUT('156-narrator', 'hit');
  IV_CAM = { x: 960, y: 560, z: 1.0 * ivPush(SHOT_T0, 0.03, 1.8) };
  ivStage(SET_corner({ t: 'night', light: 'green', act: () => s08_walkNight(t0) }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = ivVGrad(IV.bar, 420, ['rgba(5,4,12,0.78)', 'rgba(5,4,12,0.55)', 'rgba(5,4,12,0)']); ctx.fillRect(0, IV.bar, W, 360);
  ivTitle('WHAT IF YOU COULD SEE', '10 SECONDS INTO THE FUTURE?', null, 960, 170, 1, 52);
  ivTag('PART 2', 960, 300, 40, ivPop(VWE('156-narrator', 'two') - s08_fr(3)), { c: '#ffe2b0' });
  ctx.restore();
}, { sec: 's08', title: 'END: night town, title small, "PART 2" on "two"' });
