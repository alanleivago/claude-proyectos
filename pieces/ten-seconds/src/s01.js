// =====================================================================
//  s01 — 001–016 · cold open (lunch, the juice), the hook (80 ms / +10 s), the title, the rules of the ghost.
//  Every time comes from the voice (CUT / VW / VWE / LT / LE). Close-ups draw in screen space on the d = 1 plane
//  (s01_cu) over the set's own soft far layers.
// =====================================================================
// a fast gesture ramp on absolute time: 0 before a, 1 after a + d (default 5 frames), eased out, hard stop
const s01_r = (a, d = 5 / FPS) => EZ.o3(clamp((TT - a) / d));
// a set's far layers + a screen-space close-up layer (fn draws in screen px, 1920x1080)
function s01_cu(layers, fn, fg) {
  const L = layers.filter((l) => l.d > 1.05);
  L.push({ d: 1, blur: 0, draw: () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); fn(); ctx.restore(); } });
  if (fg) L.push({ d: 0.6, blur: 0, draw: () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); fg(); ctx.restore(); } });
  return L;
}
// a big arm for close-ups: P = [shoulder, elbow, wrist] in px, sleeve colour col, h = the actor height it belongs to
function s01_arm(P, h, col, o = {}) {
  const lw = IV_J.lw * h, sw = (o.sleeve ?? 1.75) * lw, rw = Math.max(1.6, h * 0.009), k = IV_M.key, n = P.length;
  const ang = o.ang ?? Math.atan2(P[n - 1][1] - P[n - 2][1], P[n - 1][0] - P[n - 2][0]);
  const pass = (rim) => {
    const Cc = (c) => (rim ? IV_M.rim : c), Wd = (w) => w + (rim ? rw * 2 : 0);
    ctx.save(); if (rim) ctx.translate(k[0] * rw * 0.9, k[1] * rw * 0.9);
    for (let i = 0; i < n - 1; i++) ivLine(P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], Wd(lw), Cc(IV.ink));
    for (let i = 0; i < n - 1; i++) { const b = i === n - 2 ? 0.84 : 1; ivLine(P[i][0], P[i][1], lerp(P[i][0], P[i + 1][0], b), lerp(P[i][1], P[i + 1][1], b), Wd(sw * (i ? 0.92 : 1)), Cc(col)); }
    if (!rim && o.cuff) { const b = 0.84, x = lerp(P[n - 2][0], P[n - 1][0], b), y = lerp(P[n - 2][1], P[n - 1][1], b); ivDot(x, y, sw * 0.47, o.cuff); }
    ivHand(P[n - 1][0], P[n - 1][1], ang, h, 'glove', o.grip || 'open', Cc, Wd, o.s ?? 1);
    ctx.restore();
  };
  pass(true); pass(false);
}
// the lunch table in a close-up (screen px): the top surface from y0 to y1, the front edge, the dark underneath
function s01_tableCU(y0, y1) {
  ctx.fillStyle = ivVGrad(y0, y1, ['#8d6f6e', '#a5837f']); ctx.fillRect(-10, y0, 1940, y1 - y0);
  ivLine(-10, y0 + 2, 1930, y0 + 2, 3, 'rgba(255,225,185,0.35)');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ivPoly([[300, y0], [760, y0], [980, y1], [420, y1]], 'rgba(255,200,140,0.06)'); ivPoly([[1240, y0], [1600, y0], [1820, y1], [1380, y1]], 'rgba(255,200,140,0.05)'); ctx.restore();
  ivRR(-10, y1, 1940, 46, 0, '#5c4248'); ivLine(-10, y1 + 1, 1930, y1 + 1, 3, 'rgba(255,225,185,0.4)');
  ctx.fillStyle = ivVGrad(y1 + 46, 1080, ['#1e151a', '#140e12']); ctx.fillRect(-10, y1 + 46, 1940, 1100 - y1);
}
const s01_cafCU = (cam, fn, fg) => { IV_CAM = cam; return s01_cu(SET_cafeteria({ fg: false }), fn, fg); };
// juice positions in the wide (world, on the table top)
const s01_J = { carton: 1150, tray0: 990, tray1: 720, spill: 1040 };
// sfx helpers (registration time only): a counter's ticks as ivCount lands them (o3), and footsteps every fps frames
function s01_sfxCount(t0, t1, a, b, kind, v, pan) { for (let k = a + 1; k <= b; k++) { const y = (k - a - 0.5) / (b - a), x = 1 - Math.cbrt(1 - y); SFX(t0 + x * (t1 - t0), kind, k === b ? v * 1.4 : v, pan); } }
function s01_sfxSteps(t0, t1, fps, v, pan) { for (let t = t0 + fps / FPS, i = 0; t < t1; t += fps / FPS, i++) SFX(t, 'step', v * (i % 2 ? 0.85 : 1), typeof pan === 'function' ? pan(t) : pan); }

// ---------------------------------------------------------------------
//  SHOT 1 — "Lunch." — the wide: the long table, you and Nia, kids behind, light through the tall windows
// ---------------------------------------------------------------------
SHOT(0, 's01_lunch', (lt, S) => {
  const P = SET_POS.cafeteria;
  IV_CAM = { x: 990, y: 560, z: 1.18 * ivPush(S.t0 + 0.2, 0.03, 1.8) };
  ivStage(SET_cafeteria({
    act: () => {
      // you: eating, fork to mouth every ~1.5 s
      const bite = Math.sin(clamp(mod(lt, 1.6) / 0.5) * Math.PI);
      ivMan({ who: CAST.you, x: P.seatL, y: GROUND, h: 520, f: 0.55, pose: ivPose('sitDesk', { hR: [lerp(0.25, 0.1, bite), lerp(0.16, -0.02, bite)] }), expr: { eyes: 'open', mouth: bite > 0.6 ? 'o' : 'flat', look: [1, 0] } });
      // Nia: telling a story with big hands (the gesture flips every ~0.6 s, hard stops)
      const g = Math.floor(lt / 0.62) % 3, gu = s01_r(S.t0 + Math.floor(lt / 0.62) * 0.62, 4 / FPS);
      const G = [[0.2, 0.05], [0.14, -0.14], [0.26, -0.02]], a = G[(g + 2) % 3], b = G[g];
      ivMan({ who: CAST.nia, x: P.seatR, y: GROUND, h: 500, f: -0.55, pose: ivPose('sitDesk', { hR: [lerp(a[0], b[0], gu), lerp(a[1], b[1], gu)], hL: [0.16, 0.12] }), expr: { eyes: g === 1 ? 'happy' : 'open', mouth: g === 1 ? 'grin' : 'smile', look: [-1, 0] } });
    },
    front: () => {
      P_tray(s01_J.tray0, P.tableTop + 2, 0.95); P_tray(1330, P.tableTop + 2, 0.9, { col: '#cfc6ba' });
      P_carton(s01_J.carton, P.tableTop + 2, 1);
    },
  }));
}, { sec: 's01', title: 'Lunch. — wide, you + Nia at the long table' });
SFX(0, 'crowd', 0.4, 0, CUT('007-narrator'));                                        // cafeteria bed under 001–006
SFX(0.05, 'whoosh', 0.6);
for (const t of [0.25, 1.85]) SFX(t + 0.22, 'metal', 0.35, -0.35);                     // your fork on the tray
for (const t of [0.62, 1.24, 1.86, 2.48]) if (t < CUT('002-narrator')) SFX(t, 'swish', 0.35, 0.3);   // Nia's big hands

// ---------------------------------------------------------------------
//  SHOT 2 — "Nia's elbow hits her juice." — close on the table: her elbow comes down on the carton; the ghost
//  (10 s ahead) shows the carton on its side in a puddle the moment it is hit
// ---------------------------------------------------------------------
SHOT(CUT('002-narrator'), 's01_elbow', (lt, S) => {
  const tHit = VW('002-narrator', 'hits'), u = s01_r(tHit - 4 / FPS, 4 / FPS), jolt = TT > tHit ? Math.sin(clamp((TT - tHit) / 0.35) * Math.PI * 3) * 0.06 * (1 - clamp((TT - tHit) / 0.35)) : 0;
  ivStage(s01_cafCU({ x: 1250, y: 520, z: 2.4 }, () => {
    s01_tableCU(800, 960);
    P_tray(300, 905, 2.8);                                                              // your tray, still in the way (left edge)
    if (TT >= tHit) ivGhost(() => { P_juiceSpill(520, 905, 3.2, 1); P_carton(720, 900, 3.2, { ang: -1.57 }); }, 0.7);
    P_carton(860, 900, 3.2, { ang: -0.04 + jolt });
    // Nia from the right: leaning in to tell the story, then the elbow drops onto the table
    const wave = TT < tHit - 4 / FPS ? Math.sin(lt * 9) * 30 : 0;
    const sh = [2060, 330], el = [lerp(1420, 1010, u), lerp(560, 800, u)], wr = [lerp(1560, 1330, u) + wave, lerp(250, 380, u) - wave * 0.5];
    s01_arm([sh, el, wr], 2600, CAST.nia.col, { grip: TT < tHit ? 'open' : 'fist', s: -1 });
  }));
}, { sec: 's01', title: "Nia's elbow hits her juice — elbow drops, ghost spill" });
SFX(CUT('002-narrator'), 'swish', 0.5, 0.2);
SFX(VW('002-narrator', 'hits') - 4 / FPS, 'swish', 0.8, 0.4);                         // the elbow comes down
SFX(VW('002-narrator', 'hits'), 'plastic', 1.6, 0.1);                                 // elbow on the carton
SFX(VW('002-narrator', 'hits'), 'thud', 1, 0.2);
SFX(VW('002-narrator', 'hits') + 0.04, 'ghost', 0.8, -0.2);                           // ghost spill appears

// ---------------------------------------------------------------------
//  SHOT 3 — "The carton hasn't even tipped," — extreme close-up: the real carton barely leaning; over it the ghost
//  carton already on its side and the juice running toward your tray
// ---------------------------------------------------------------------
SHOT(CUT('003-narrator'), 's01_tip', (lt, S) => {
  const D = Math.max(0.5, CUT('003-narrator', 'your') - S.t0);
  ivStage(s01_cafCU({ x: 1150, y: 600, z: 3 }, () => {
    s01_tableCU(780, 980);
    P_tray(130, 930, 3.6);
    ivGhost(() => { P_juiceSpill(560, 935, 4.6, 0.55 + 0.45 * EZ.o3(clamp(lt / D))); P_carton(1080, 930, 5.2, { ang: -1.57 }); }, 0.75);
    P_carton(1120, 930, 5.2, { ang: -0.05 - 0.05 * clamp(lt / D) });                    // hasn't tipped: a hair's lean
    s01_arm([[2200, 380], [1420, 900], [1720, 380]], 3600, CAST.nia.col, { grip: 'fist', s: -1 });
  }));
  ivTag('NOW', 1120, 230, 30, ivPop(S.t0 + 0.15));
  ivTag('+10 s', 560, 640, 30, ivPop(S.t0 + 0.45), { c: IV.ghost, line: 'rgba(127,240,255,0.6)' });
}, { sec: 's01', title: "the carton hasn't even tipped — ECU, ghost carton down + juice" });
SFX(CUT('003-narrator'), 'swish', 0.5);
SFX(CUT('003-narrator') + 0.05, 'shimmer', 0.5, -0.2);
SFX(CUT('003-narrator') + 0.15, 'pop', 1, 0.15);                                      // NOW
SFX(CUT('003-narrator') + 0.45, 'pop', 1, -0.4);                                      // +10 s
SFX(CUT('003-narrator') + 0.9, 'drip', 0.5, -0.4);
SFX(CUT('003-narrator') + 1.4, 'drip', 0.4, -0.5);

// ---------------------------------------------------------------------
//  SHOT 4 — "and your tray is already out of the way." — hand close-up: your glove on the tray, it has just slid
//  left; then the real carton falls and the juice runs into the empty spot where the tray was
// ---------------------------------------------------------------------
SHOT(CUT('003-narrator', 'your'), 's01_tray', (lt, S) => {
  const tFall = VW('003-narrator', 'out'), slide = EZ.o3(clamp(lt / (6 / FPS))), fall = s01_r(tFall, 5 / FPS), spill = clamp((TT - tFall - 4 / FPS) / 0.9);
  ivStage(s01_cafCU({ x: 900, y: 600, z: 2.8 }, () => {
    s01_tableCU(800, 990);
    const tx = lerp(1010, 560, slide) + (slide > 0.99 ? 0 : 0);
    P_juiceSpill(1340, 930, 2.6, spill);
    P_tray(tx, 935, 3.4);
    P_carton(1560, 930, 4, { ang: lerp(-0.08, -1.57, fall) });
    if (fall > 0.99 && TT < tFall + 0.4) { ctx.save(); ctx.globalAlpha = 1 - (TT - tFall) / 0.4; for (let i = 0; i < 6; i++) ivDot(1300 - i * 50, 860 - Math.sin(i) * 30 - (TT - tFall) * 200, 9, '#f2a03c'); ctx.restore(); }
    // your arm from the left, the glove holding the tray's rim
    const gx = tx - 240 * 3.4 / 2 + 30, gy = 900;
    s01_arm([[-420, 520], [gx - 360, gy + 40], [gx, gy]], 3800, CAST.you.col, { grip: 'hold', ang: -0.1 });
  }));
}, { sec: 's01', title: 'your tray is already out of the way — hand CU, real juice spills' });
SFX(CUT('003-narrator', 'your'), 'cloth', 0.6, -0.4);                                // grab the tray
SFX(CUT('003-narrator', 'your') + 1 / FPS, 'slide', 1.2, -0.2);                       // it slides left
SFX(VW('003-narrator', 'out') + 5 / FPS, 'plastic', 1.2, 0.6);                        // the carton falls over
SFX(VW('003-narrator', 'out') + 5 / FPS, 'thud', 0.6, 0.6);
SFX(VW('003-narrator', 'out') + 5 / FPS, 'splash', 1.1, 0.4);
SFX(VW('003-narrator', 'out') + 0.7, 'drip', 0.6, 0.3);
SFX(VW('003-narrator', 'out') + 1.1, 'drip', 0.5, 0.2);

// ---------------------------------------------------------------------
//  SHOT 5 — Nia: "How did you..." — close-up, eyes wide, hands up off the wet table
// ---------------------------------------------------------------------
const s01_nia = (o = {}) => ivMan({ who: CAST.nia, x: SET_POS.cafeteria.seatR, y: GROUND, h: 500, f: o.f ?? -0.55, pose: o.pose, expr: o.expr, talk: o.talk, grip: o.grip });
const s01_you = (o = {}) => ivMan({ who: CAST.you, x: o.x ?? SET_POS.cafeteria.seatL, y: GROUND, h: 520, f: o.f ?? 0.55, pose: o.pose, expr: o.expr, talk: o.talk, grip: o.grip, lean: o.lean });
const s01_wet = () => { const P = SET_POS.cafeteria; P_juiceSpill(s01_J.spill, P.tableTop + 4, 1, 1); P_carton(s01_J.carton, P.tableTop + 2, 1, { ang: -1.57 }); P_tray(s01_J.tray1, P.tableTop + 2, 0.95); P_tray(1330, P.tableTop + 2, 0.9, { col: '#cfc6ba' }); };
SHOT(CUT('004-nia'), 's01_niaHow', (lt, S) => {
  const u = s01_r(S.t0, 5 / FPS);
  IV_CAM = { x: 1230, y: 555, z: 2.7 };
  ivStage(SET_cafeteria({
    act: () => s01_nia({ pose: ivPoseMix(ivPose('sitDesk'), ivPose('sit', { hR: [0.2, -0.12], hL: [0.12, -0.1], tilt: -0.1 }), u), expr: { eyes: 'wide', mouth: 'o', brow: 'up', look: [-1, 0] }, talk: '004-nia' }),
    front: s01_wet,
  }));
}, { sec: 's01', title: 'Nia: "How did you..." — CU, hands up' });
SFX(CUT('004-nia'), 'cloth', 0.8, 0.3);                                               // hands up off the wet table
SFX(CUT('004-nia') + 1 / FPS, 'swish', 0.5, 0.3);
SFX(CUT('004-nia') + 0.45, 'drip', 0.4, 0.2);

// ---------------------------------------------------------------------
//  SHOT 6 — You: "How did you know?" — close-up, smug, finishing her sentence; her ghost mouths the same words
// ---------------------------------------------------------------------
SHOT(CUT('005-you'), 's01_youKnow', (lt, S) => {
  IV_CAM = { x: 820, y: 520, z: 2.7 };
  ivStage(SET_cafeteria({
    act: () => {
      ivMan({ who: CAST.nia, x: 1080, y: GROUND, h: 500, f: -0.55, pose: ivPose('sit', { hR: [0.2, -0.12], hL: [0.12, -0.1] }), expr: { eyes: 'wide', mouth: 'o', brow: 'up' }, talk: '005-you', ghost: true, ghostA: 0.42 });
      s01_you({ pose: ivPose('think', { hR: [0.13, -0.04], seat: true, dip: 0.14, fL: [0.17, 0.3], fR: [0.21, 0.3] }), expr: { eyes: 'squint', mouth: 'smirk', brow: 'angry', look: [1, 0] }, talk: '005-you', grip: { front: 'point' } });
    },
    front: s01_wet,
  }));
  ctx.save(); ivGlow(1160, 330, 170, 'rgba(90,230,255,0.22)'); ctx.restore();
}, { sec: 's01', title: 'You: "How did you know?" — CU smug, ghost Nia mouthing it' });
SFX(CUT('005-you'), 'ghost', 0.7, 0.3);                                               // ghost Nia mouthing it
SFX(CUT('005-you') + 0.1, 'swish', 0.4, -0.2);

// ---------------------------------------------------------------------
//  SHOT 7 — "You were about to say that." — two-shot across the table: you lean back, arms crossed; dry tray;
//  the puddle is all on her side
// ---------------------------------------------------------------------
SHOT(CUT('005-you', 'you', 2), 's01_twoShot', (lt, S) => {
  const u = s01_r(S.t0 + 2 / FPS, 6 / FPS);
  IV_CAM = { x: 1000, y: 560, z: 1.5 };
  ivStage(SET_cafeteria({
    act: () => {
      s01_you({ pose: ivPoseMix(ivPose('sitDesk'), ivPose('sit', { hL: [0.1, 0.1], hR: [-0.06, 0.12], lean: -0.1 }), u), expr: { eyes: 'squint', mouth: 'smirk', look: [1, 0] }, talk: '005-you' });
      s01_nia({ pose: ivPose('sit', { hR: [0.2, -0.05], hL: [0.12, 0.0] }), expr: { eyes: 'wide', mouth: 'flat', look: [-1, 0] } });
    },
    front: s01_wet,
  }));
}, { sec: 's01', title: '"You were about to say that." — two-shot, you lean back' });
SFX(CUT('005-you', 'you', 2) + 2 / FPS, 'cloth', 0.8, -0.4);                         // lean back, arms crossed
SFX(CUT('005-you', 'you', 2) + 6 / FPS, 'thud', 0.4, -0.4);

// ---------------------------------------------------------------------
//  SHOT 8 — Nia: "Okay. That's creepy." — close-up, she leans away on "creepy", arms in
// ---------------------------------------------------------------------
SHOT(CUT('006-nia'), 's01_creepy', (lt, S) => {
  const u = s01_r(VW('006-nia', 'creepy') - 2 / FPS, 6 / FPS);
  IV_CAM = { x: 1300, y: 570, z: 3.1 };
  ivStage(SET_cafeteria({
    act: () => s01_nia({ f: -0.4, pose: ivPoseMix(ivPose('sit', { hR: [0.2, -0.05], hL: [0.12, 0.0] }), ivPose('sit', { hL: [0.1, 0.1], hR: [-0.06, 0.12], lean: -0.16, tilt: 0.12 }), u), expr: { eyes: u > 0.5 ? 'squint' : 'tired', mouth: u > 0.5 ? 'frown' : 'flat', brow: u > 0.5 ? 'sad' : null, look: [-1, 0] }, talk: '006-nia' }),
    front: s01_wet,
  }));
}, { sec: 's01', title: 'Nia: "Okay. That\'s creepy." — CU, leans away' });
SFX(CUT('006-nia'), 'swish', 0.4, 0.2);
SFX(VW('006-nia', 'creepy') - 2 / FPS, 'cloth', 0.7, 0.4);                            // she leans away
SFX(VW('006-nia', 'creepy') + 4 / FPS, 'thud', 0.3, 0.4);

// =====================================================================
//  THE HOOK — 007–010 on the dark warm stage (SET_void 'lamp'): the brain lags 80 ms, yours runs 10 s ahead
// =====================================================================
const s01_void = () => SET_void({ mood: 'lamp' });
// a cream line-drawing of a brain inside a head (centre x, y, head radius R), with a little clock in it
function s01_brain(x, y, R, clockA, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = 'rgba(255,226,176,0.9)'; ctx.lineWidth = R * 0.03; ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(255,170,90,0.8)'; ctx.shadowBlur = R * 0.08;
  const L = [[-0.42, -0.2, 0.26], [-0.12, -0.36, 0.3], [0.22, -0.3, 0.27], [0.4, -0.02, 0.22], [-0.42, 0.12, 0.2], [0.12, 0.08, 0.24]];
  ctx.beginPath(); L.forEach(([dx, dy, r], i) => { ctx.moveTo(x + (dx + r) * R * 0.9, y + dy * R * 0.9); ctx.arc(x + dx * R * 0.9, y + dy * R * 0.9, r * R * 0.9, 0, TAU); }); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 0.05 * R, y - 0.55 * R); ctx.bezierCurveTo(x + 0.1 * R, y - 0.3 * R, x - 0.15 * R, y - 0.05 * R, x + 0.05 * R, y + 0.25 * R); ctx.stroke();
  ctx.shadowBlur = 0;
  // the clock, hand turning backwards
  const cx = x + 0.05 * R, cy = y - 0.08 * R, r = R * 0.2;
  ivDot(cx, cy, r, '#0c0b10'); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
  for (let i = 0; i < 12; i++) { const q = i * TAU / 12; ivLine(cx + Math.cos(q) * r * 0.75, cy + Math.sin(q) * r * 0.75, cx + Math.cos(q) * r * 0.88, cy + Math.sin(q) * r * 0.88, R * 0.012, 'rgba(255,226,176,0.9)'); }
  ivLine(cx, cy, cx + Math.cos(clockA) * r * 0.7, cy + Math.sin(clockA) * r * 0.7, R * 0.025, '#ffe2b0'); ivDot(cx, cy, R * 0.025, '#ffe2b0');
  ctx.restore();
}
// a fat arrow (screen px) from x0 to x1 at y, colour c
function s01_arrow(x0, x1, y, c, w = 26) {
  const d = Math.sign(x1 - x0) || 1, hx = x1 - d * w * 1.6;
  ivLine(x0, y, hx, y, w, c, 'round'); ivPoly([[x1, y], [hx, y - w * 1.25], [hx, y + w * 1.25]], c);
}

// ---------------------------------------------------------------------
//  SHOT 9 — "Your brain lives in the past." — your head huge in profile, a glowing brain inside, its clock ticking
//  backwards; on "past" an arrow points back: PAST
// ---------------------------------------------------------------------
SHOT(CUT('007-narrator'), 's01_brain', (lt, S) => {
  const tB = VW('007-narrator', 'brain'), tP = VW('007-narrator', 'past');
  IV_CAM = { x: 960, y: 540, z: 1.3 };
  ivStage(s01_cu(s01_void(), () => {
    const m = ivMan({ who: CAST.you, x: 640, y: 2700, h: 2500, f: 0.95, pose: ivPose('stand', { hL: [-0.03, 0.29], hR: [0.03, 0.29] }), expr: { eyes: 'open', mouth: 'flat', look: [1, 0] } });
    s01_brain(m.head[0] - m.R * 0.12, m.head[1] - m.R * 0.1, m.R, -Math.PI / 2 - (TT - S.t0) * 2.2, ivPop(tB - 2 / FPS));
    const u = s01_r(tP - 3 / FPS, 5 / FPS);
    if (u > 0) { ctx.save(); ctx.globalAlpha = clamp(u * 2); s01_arrow(1620, lerp(1600, 1180, u), 520, 'rgba(255,214,160,0.85)'); ctx.restore(); }
  }));
  ivTag('PAST', 1400, 420, 44, ivPop(tP));
}, { sec: 's01', title: 'Your brain lives in the past — huge head, brain + backwards clock' });
SFX(CUT('007-narrator'), 'whoosh', 1.2);
SFX(VW('007-narrator', 'brain') - 2 / FPS, 'shimmer', 0.8, -0.3);                     // the brain lights up
for (let t = VW('007-narrator', 'brain') + 0.25; t < CUT('008-narrator') - 0.1; t += 0.35) SFX(t, 'tick', 0.5, -0.3);   // clock ticking back
SFX(VW('007-narrator', 'past') - 3 / FPS, 'swish', 0.8, 0.5);                         // the arrow shoots back
SFX(VW('007-narrator', 'past'), 'pop', 1.1, 0.4);                                     // PAST

// ---------------------------------------------------------------------
//  SHOT 10 — "Everything you see" — extreme close-up of your eyes; a ball crosses in front, the eyes follow it late
// ---------------------------------------------------------------------
SHOT(CUT('008-narrator'), 's01_eyes', (lt, S) => {
  const D = Math.max(0.6, CUT('008-narrator', 'eighty') - S.t0), bx = lerp(-150, 2100, lt / D), lag = lerp(-150, 2100, (lt - 0.35) / D);
  IV_CAM = { x: 960, y: 540, z: 1 };
  ivStage(s01_cu(s01_void(), () => {
    ivMan({ who: CAST.you, x: 960, y: 560 + 0.85 * 3300, h: 3300, f: 0, expr: { eyes: 'wide', mouth: 'flat', look: [clamp((lag - 960) / 700, -1, 1) * 1.6, 0.4] }, noBlink: true });
  }, () => { ctx.save(); ctx.filter = 'blur(6px)'; P_ball(bx, 1090, 3.8, { air: true, rot: lt * 8 }); ctx.restore(); }));
}, { sec: 's01', title: 'Everything you see — ECU eyes following a ball, late' });
SFX(CUT('008-narrator'), 'swish', 0.5);
{ const t0 = CUT('008-narrator'), D = Math.max(0.6, CUT('008-narrator', 'eighty') - t0), k = 1110 / 2250;
  SFX(t0 + D * k, 'whoosh', 1.1, 0);                                                  // the ball crosses in front
  SFX(t0 + D * k + 0.35, 'swish', 0.35, 0.3); }                                       // the eyes follow, late

// ---------------------------------------------------------------------
//  SHOTS 11–12 — "…at least eighty milliseconds old." / "Yours runs the other way." — the diagram: a ball rolls,
//  what you see trails it by 0.08 s (grey copy behind); then the arrow flips and the copy jumps AHEAD, in cyan
// ---------------------------------------------------------------------
const s01_T0 = () => CUT('008-narrator', 'eighty');
const s01_bx = () => 820 + 230 * (TT - s01_T0());
function s01_ballDiagram(flipU) {
  const bx = s01_bx(), off = lerp(-150, 330, flipU);
  // the floor track with ticks
  ivLine(200, GROUND + 4, 2400, GROUND + 4, 4, 'rgba(255,214,160,0.35)', 'butt');
  for (let x = 220; x < 2400; x += 60) ivLine(x, GROUND + 4, x, GROUND + 16, 2, 'rgba(255,214,160,0.25)', 'butt');
  // the copy: grey (what you see, behind) or the cyan ghost (ahead)
  if (off < 0) { ctx.save(); ctx.globalAlpha = 0.45; ctx.filter = 'grayscale(1)'; P_ball(bx + off, GROUND, 1.6, { rot: (bx + off) / 46 }); ctx.restore(); }
  else ivGhost(() => P_ball(bx + off, GROUND, 1.6, { rot: (bx + off) / 46 }), 0.8);
  P_ball(bx, GROUND, 1.6);
  // the arrow between them, flipping
  const ay = GROUND - 150, c = off < 0 ? 'rgba(255,214,160,0.85)' : IV.ghost;
  if (Math.abs(off) > 40) s01_arrow(bx, bx + off * 0.82, ay, c, 12);
  return { bx, off, ay };
}
SHOT(CUT('008-narrator', 'eighty'), 's01_lag', (lt, S) => {
  IV_CAM = { x: 960, y: 560, z: 1.05 };
  let D;
  ivStage(s01_void().map((L) => (L.d !== 1 ? L : { d: 1, draw: () => {
    ivMan({ who: CAST.you, x: 470, y: GROUND, h: 520, f: 0.75, pose: ivPose('relaxed'), expr: { eyes: 'open', mouth: 'flat', look: [1, 0.3] } });
    D = s01_ballDiagram(0);
  } })));
  const n = ivCount(VW('008-narrator', 'eighty'), VWE('008-narrator', 'milliseconds'), 0, 8);
  const sx = 960 + (D.bx - 75 - IV_CAM.x) * IV_CAM.z, sy = 540 + (D.ay - 70 - IV_CAM.y) * IV_CAM.z;
  ivTag('0.0' + n + ' s', sx, sy, 40, ivPop(S.t0 + 3 / FPS));
  ivTag('WHAT YOU SEE', 960 + (D.bx - 150 - IV_CAM.x) * IV_CAM.z, 540 + (GROUND + 80 - IV_CAM.y) * IV_CAM.z, 22, ivPop(S.t0 + 0.4), { c: 'rgba(255,230,200,0.75)' });
}, { sec: 's01', title: 'eighty milliseconds old — the ball and its late grey copy, 0.08 s' });
SFX(CUT('008-narrator', 'eighty'), 'swish', 0.5);
SFX(CUT('008-narrator', 'eighty') + 3 / FPS, 'pop', 1, -0.1);                         // 0.0x s tag
s01_sfxCount(VW('008-narrator', 'eighty'), VWE('008-narrator', 'milliseconds'), 0, 8, 'blip', 0.6, -0.1);
SFX(CUT('008-narrator', 'eighty') + 0.4, 'pop', 0.6, -0.2);                           // WHAT YOU SEE
SHOT(CUT('009-narrator'), 's01_flip', (lt, S) => {
  const tF = VW('009-narrator', 'other') - 2 / FPS, u = s01_r(tF, 5 / FPS);
  IV_CAM = { x: s01_bx() + 120, y: GROUND - 120, z: 1.9 };
  ivStage(s01_void().map((L) => (L.d !== 1 ? L : { d: 1, draw: () => s01_ballDiagram(u) })));
  if (u >= 1) ivTag('YOURS', 1360, 330, 34, ivPop(tF + 5 / FPS), { c: IV.ghost, line: 'rgba(127,240,255,0.6)' });
  else ivTag('YOUR BRAIN', 560, 330, 34, 1);
}, { sec: 's01', title: 'Yours runs the other way — the arrow flips, the copy jumps ahead in cyan' });
SFX(CUT('009-narrator'), 'pop', 0.7, -0.4);                                           // YOUR BRAIN
SFX(VW('009-narrator', 'other') - 2 / FPS, 'whoosh', 1, 0.3);                         // the arrow flips
SFX(VW('009-narrator', 'other') + 1 / FPS, 'ghost', 1, 0.4);                          // the copy jumps ahead, cyan
SFX(VW('009-narrator', 'other') + 3 / FPS, 'pop', 1, 0.4);                            // YOURS

// ---------------------------------------------------------------------
//  SHOT 13 — "You see ten whole seconds ahead." — close-up, your eyes catch the cyan; the ghost ball far ahead;
//  "+10 s" counts up and lands on "seconds"
// ---------------------------------------------------------------------
SHOT(CUT('010-narrator'), 's01_plus10', (lt, S) => {
  const n = ivCount(VW('010-narrator', 'ten'), VWE('010-narrator', 'seconds'), 0, 10);
  IV_CAM = { x: 960, y: 540, z: 1.4 };
  ivStage(s01_cu(s01_void(), () => {
    ivGhost(() => { P_ball(1500 + lt * 40, 760, 3, { air: true, rot: lt * 3 }); ivMan({ who: CAST.extraB, x: 1700, y: 1150, h: 900, f: -0.5, pose: ivPose('catchUp'), expr: { eyes: 'happy', mouth: 'grin' } }); }, 0.55);
    ivMan({ who: CAST.you, x: 620, y: 470 + 0.85 * 1500, h: 1500, f: 0.55, pose: ivPose('relaxed'), expr: { eyes: 'wide', mouth: 'smile', look: [1, -0.2] } });
    ivGlow(760, 470, 260, 'rgba(90,230,255,0.25)');
  }));
  ivTag('+' + n + ' s', 1380, 300, 64, ivPop(VW('010-narrator', 'ten') - 2 / FPS), { c: IV.ghost, line: 'rgba(127,240,255,0.7)' });
}, { sec: 's01', title: 'ten whole seconds ahead — CU, cyan ghost ahead, +10 s' });
SFX(CUT('010-narrator'), 'shimmer', 1, 0.5);                                          // your eyes catch the cyan
SFX(CUT('010-narrator') + 0.05, 'ghost', 0.7, 0.6);
SFX(VW('010-narrator', 'ten') - 2 / FPS, 'pop', 1.1, 0.4);                            // +0 s tag
s01_sfxCount(VW('010-narrator', 'ten'), VWE('010-narrator', 'seconds'), 0, 10, 'blip', 0.6, 0.4);

// =====================================================================
//  THE TITLE — 011 + the 2 s beat: the town at sunset, you and Nia walking home small, the title pops on the beat
// =====================================================================
SHOT(CUT('011-narrator'), 's01_title', (lt, S) => {
  IV_CAM = { x: 960, y: 520, z: 1.0 * ivPush(S.t0 + 0.1, 0.03, 1.8) };
  ivStage(SET_street({ t: 'sunset', car: false, act: () => {
    const stop = S.t0 + 3.4, a = ivWalk(S.t0, 230, 330, 1, 8, stop), b = ivWalk(S.t0, 100, 315, 1, 8, stop);
    const P = (w) => (w.moving ? w.pose : ivPose('relaxed')), f = TT < stop ? 0.75 : 0.25;
    ivMan({ who: CAST.nia, x: b.x, y: GROUND, h: 315, f, pose: P(b), expr: { eyes: 'open', mouth: 'smile' } });
    ivMan({ who: CAST.you, x: a.x, y: GROUND, h: 330, f, pose: P(a), expr: { eyes: 'open', mouth: 'smile', look: [-0.6, 0] } });
  } }));
  ivTitle('WHAT IF YOU COULD SEE', '10 SECONDS INTO THE FUTURE?', 'A WHAT-IF STORY', 960, 170, ivPop(LE('011-narrator') + 2 / FPS), 74);
}, { sec: 's01', title: 'So, what if… — town at sunset, push-in; TITLE in the beat' });
SFX(CUT('011-narrator'), 'whoosh', 1.3);
s01_sfxSteps(CUT('011-narrator'), CUT('011-narrator') + 3.4, 8, 0.3, 0);               // you + Nia walking home, small
SFX(LE('011-narrator') - 0.6, 'rise', 0.6, 0, 0.6 + 2 / FPS);
SFX(LE('011-narrator') + 2 / FPS, 'impact', 1.4);                                     // TITLE
SFX(LE('011-narrator') + 2 / FPS, 'shimmer', 1.1);
SFX(LE('011-narrator') + 2 / FPS + 1.6, 'cloth', 0.3, 0);                             // they turn to look

// =====================================================================
//  THE RULES — 012–016 on the street at sunset
// =====================================================================
// screen position of a world point drawn in the current layer transform
let s01_hd = [960, 540];
const s01_scr = (p) => { const q = ctx.getTransform().transformPoint({ x: p[0], y: p[1] }); return [q.x, q.y]; };
const s01_kid = { x: 420, h: 380, ball: 500 };
const s01_theo = 1150, s01_step = 0.26 * 520 * 2;   // where you stand; two steps aside
const s01_kick = ivPose('stand', { fR: [0.2, 0.36], hL: [-0.12, 0.18], hR: [0.1, 0.2], lean: -0.08 });
const s01_pocket = ivPose('stand', { hL: [-0.06, 0.24], hR: [0.06, 0.24] });
// the ghost ball's flight from the kid's foot to (x1, y1) over u 0..1 (an arc), in world coords
const s01_arc = (u, x1, y1) => [lerp(s01_kid.ball, x1, u), lerp(GROUND - 30, y1, u) - Math.sin(u * Math.PI) * 220];

// ---------------------------------------------------------------------
//  SHOT 15 — "Here's how it works." — close-up on you: eyes shut, they open on "works" with a cyan glint
// ---------------------------------------------------------------------
SHOT(CUT('012-narrator'), 's01_works', (lt, S) => {
  const tW = VW('012-narrator', 'works') - 2 / FPS, open = TT >= tW;
  IV_CAM = { x: 900, y: 470, z: 2.8 };
  ivStage(SET_street({ t: 'sunset', car: false, act: () => {
    const m = ivMan({ who: CAST.you, x: 780, y: GROUND, h: 520, f: 0.35, hands: 'nub', pose: s01_pocket, expr: { eyes: open ? 'wide' : 'closed', mouth: open ? 'smile' : 'flat', look: [0.6, 0] }, noBlink: true });
    s01_hd = s01_scr(m.head);
    if (open) { const g = ivWalk(tW - 2, 1000, 500, 1, 7); ivMan({ who: CAST.extraB, x: g.x, y: GROUND, h: 500, f: 0.8, pose: g.pose, expr: { eyes: 'open', mouth: 'smile' }, ghost: true, ghostA: 0.6 * s01_r(tW, 6 / FPS) }); }
  } }));
  if (open) { const a = 1 - 0.5 * clamp((TT - tW) / 0.5); ivGlow(s01_hd[0] + 30, s01_hd[1] - 10, 420, 'rgba(90,230,255,0.75)', a); ivGlow(s01_hd[0] + 30, s01_hd[1] - 10, 160, 'rgba(190,250,255,0.7)', a); }
}, { sec: 's01', title: "Here's how it works — CU, eyes open on 'works', cyan glint" });
SFX(CUT('012-narrator'), 'swish', 0.6);
SFX(VW('012-narrator', 'works') - 2 / FPS, 'shimmer', 1.2, 0);                        // eyes open, cyan glint
SFX(VW('012-narrator', 'works') - 2 / FPS, 'ghost', 0.7, 0.4);                        // a ghost walker fades in

// the street wide for 013: you on the left; a woman walks right; o.ghost adds her ghost ahead + the cyan tag
function s01_streetRule(S, ghost) {
  const t0 = CUT('013-narrator'), w = ivWalk(t0, 420, 440, 1, 14);
  IV_CAM = { x: 960, y: 540, z: 1 };
  ivStage(SET_street({ t: 'sunset', car: false, act: () => {
    ivMan({ who: CAST.you, x: 230, y: GROUND, h: 520, f: 0.6, pose: s01_pocket, expr: { eyes: 'open', mouth: 'flat', look: [1, 0] } });
    ivMan({ who: CAST.extraC, x: w.x, y: GROUND, h: 440, f: 0.8, pose: w.pose, expr: { eyes: 'open', mouth: 'smile' }, blinkKey: 'r1' });
    if (ghost) {
      const g = ivWalk(t0, 420, 440, 1, 14);
      ivMan({ who: CAST.extraC, x: g.x + 340, y: GROUND, h: 440, f: 0.8, pose: g.pose, expr: { eyes: 'happy', mouth: 'grin' }, ghost: true, ghostA: 0.8 });
    }
  } }));
  return w;
}
SHOT(CUT('013-narrator'), 's01_real', (lt, S) => { s01_streetRule(S, false); ivTag('THE REAL WORLD', 960, 160, 30, ivPop(VW('013-narrator', 'real'))); },
  { sec: 's01', title: 'On top of the real world — the street, a woman walking' });
SFX(CUT('013-narrator'), 'whoosh', 0.7);
s01_sfxSteps(CUT('013-narrator'), CUT('014-narrator'), 14, 0.45, (t) => clamp((420 + 0.26 * 440 * (t - CUT('013-narrator')) / (14 / FPS) - 960) / 960, -1, 1));   // the woman's steps
SFX(VW('013-narrator', 'real'), 'pop', 1, 0);                                         // THE REAL WORLD
SHOT(CUT('013-narrator', 'you'), 's01_ghostLayer', (lt, S) => {
  const w = s01_streetRule(S, true);
  ivTag('+10 s', Math.min(1700, w.x + 340), 300, 36, ivPop(VW('013-narrator', 'ten') - 2 / FPS), { c: IV.ghost, line: 'rgba(127,240,255,0.6)' });
}, { sec: 's01', title: 'a pale ghost, ten seconds ahead — her ghost walks ahead, +10 s' });
SFX(CUT('013-narrator', 'you'), 'ghost', 1.1, 0.2);                                  // her ghost appears ahead
SFX(VW('013-narrator', 'ten') - 2 / FPS, 'pop', 1, 0.5);                              // +10 s

// ---------------------------------------------------------------------
//  SHOT 18 — "Only what your own eyes would see." — top-down: you on the sidewalk, a cone of sight in front;
//  inside it everything has a ghost, behind you nothing does
// ---------------------------------------------------------------------
// a person seen from straight above (screen px): head, shoulders, arms swinging, feet when walking; dir = angle
function s01_top(x, y, s, who, dir, ph = 0, walking = false) {
  const col = who.col, rim = IV_M.rim;
  ctx.save(); ctx.translate(x, y);
  ctx.save(); ctx.translate(-34 * s, 22 * s); ctx.rotate(dir); ctx.beginPath(); ctx.ellipse(0, 0, 30 * s, 60 * s, 0, 0, TAU); ctx.fillStyle = 'rgba(10,6,16,0.35)'; ctx.fill(); ctx.restore();
  ctx.rotate(dir);
  const sw = walking ? Math.sin(ph) : 0;
  if (walking) { ivRR(-8 * s + sw * 26 * s, -34 * s, 22 * s, 14 * s, 6 * s, IV.ink); ivRR(-8 * s - sw * 26 * s, 20 * s, 22 * s, 14 * s, 6 * s, IV.ink); }
  for (const [k, ry] of [[1, -46], [-1, 46]]) { ivDot(sw * 20 * s * k + 6 * s, ry * s, 13 * s, rim); ivDot(sw * 20 * s * k + 6 * s, ry * s, 11 * s, IV.ink); }
  ctx.beginPath(); ctx.ellipse(0, 0, 26 * s, 50 * s, 0, 0, TAU); ctx.fillStyle = rim; ctx.fill();
  ctx.beginPath(); ctx.ellipse(-1 * s, 0, 24 * s, 48 * s, 0, 0, TAU); ctx.fillStyle = col; ctx.fill();
  if (who.top === 'hoodie') { ctx.beginPath(); ctx.ellipse(-16 * s, 0, 14 * s, 24 * s, 0, 0, TAU); ctx.fillStyle = who.col2; ctx.fill(); }
  if (who.hair === 'puffs') { ivDot(0, -26 * s, 13 * s, IV.ink); ivDot(0, 26 * s, 13 * s, IV.ink); }
  if (who.hair === 'bun') ivDot(-18 * s, 0, 11 * s, IV.ink);
  ivDot(1.5 * s, -1.5 * s, 28 * s, rim); ivDot(0, 0, 27 * s, IV.ink);
  ctx.restore();
}
// a car from above (screen px), length L, pointing along dir
function s01_topCar(x, y, L, col, dir) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(dir);
  ivRR(-L / 2 + 10, -L * 0.22 + 14, L, L * 0.44, L * 0.08, 'rgba(10,6,16,0.35)');
  ivRR(-L / 2, -L * 0.22, L, L * 0.44, L * 0.08, col); ivRR(-L * 0.12, -L * 0.18, L * 0.34, L * 0.36, L * 0.05, ivShade(col, -0.35));
  ivRR(L * 0.14, -L * 0.17, L * 0.12, L * 0.34, L * 0.03, '#2a3a52'); ivRR(-L * 0.3, -L * 0.17, L * 0.1, L * 0.34, L * 0.03, '#2a3a52');
  ivDot(L * 0.48, -L * 0.15, L * 0.03, '#ffe6b0'); ivDot(L * 0.48, L * 0.15, L * 0.03, '#ffe6b0');
  ctx.restore();
}
SHOT(CUT('014-narrator'), 's01_cone', (lt, S) => {
  const tE = VW('014-narrator', 'eyes') - 2 / FPS, cone = s01_r(S.t0 + 2 / FPS, 6 / FPS);
  IV_M = IV_MOOD.sunset; IV_CAM = { x: 960, y: 540, z: 1 };
  ivStage([{ d: 1, blur: 0, draw: () => {
    // the ground from above: building edge, sidewalk slabs, curb, road with dashes; long sunset shadows
    set_rect(-10, -10, 1940, 250, '#3a2a40'); for (let x = 0; x < 1940; x += 240) { ivRR(x + 20, 30, 200, 150, 6, '#45324c'); ivRR(x + 40, 50, 160, 110, 4, '#5a3f5a'); }
    set_rect(-10, 230, 1940, 430, '#5a4452'); for (let x = -40; x < 1940; x += 150) ivLine(x, 230, x, 660, 2, 'rgba(0,0,0,0.14)', 'butt'); ivLine(-10, 445, 1930, 445, 2, 'rgba(0,0,0,0.12)', 'butt');
    set_rect(-10, 660, 1940, 24, '#6e5866'); set_rect(-10, 684, 1940, 420, '#2e2230');
    for (let x = -60; x < 1940; x += 260) ivRR(x, 878, 150, 12, 4, 'rgba(240,220,180,0.5)');
    ivDot(1300, 610, 26, '#c8352e'); ivDot(1300, 610, 16, '#a82a24');                        // a hydrant
    ctx.save(); ctx.globalAlpha = 0.5; ivDot(220, 560, 60, '#3d5a40'); ivDot(250, 530, 46, '#4a6a4a'); ctx.restore();   // a planter
    // the cone of sight (in front of you only)
    const yx = 760, yy = 450;
    if (cone > 0) { ctx.save(); const g = ctx.createRadialGradient(yx, yy, 40, yx, yy, 1400 * cone); g.addColorStop(0, 'rgba(127,240,255,0.30)'); g.addColorStop(1, 'rgba(127,240,255,0.02)');
      ctx.beginPath(); ctx.moveTo(yx, yy); ctx.arc(yx, yy, 1500 * cone, -0.55, 0.55); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = 'rgba(160,245,255,0.6)'; ctx.lineWidth = 3; ctx.setLineDash([16, 12]); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
    // behind you: a man walking, no ghost
    const bxp = 260 + lt * 70; s01_top(bxp, 330, 1.05, CAST.extraA, 0, lt * 9, true);
    // in front: a woman walking right + a car coming — both with ghosts ahead
    const wx = 1180 + lt * 70; s01_top(wx, 330, 1.05, CAST.extraC, 0, lt * 9, true);
    const cx = 2050 - lt * 240; s01_topCar(cx, 800, 330, '#3d5f8a', Math.PI);
    if (cone > 0.9) ivGhost(() => { ctx.beginPath(); ctx.moveTo(yx, yy); ctx.arc(yx, yy, 1500, -0.55, 0.55); ctx.closePath(); ctx.clip(); s01_top(wx + 330, 330, 1.05, CAST.extraC, 0, lt * 9 + 1, true); s01_topCar(cx - 620, 800, 330, '#3d5f8a', Math.PI); }, 0.75);
    s01_top(yx, yy, 1.25, CAST.you, 0);
  } }]);
  ivTag('NO GHOST', 260, 210, 26, ivPop(tE), { c: 'rgba(255,230,200,0.85)' });
}, { sec: 's01', title: 'Only what your own eyes would see — top-down, cone of sight' });
SFX(CUT('014-narrator'), 'whoosh', 1.1);
SFX(CUT('014-narrator') + 2 / FPS, 'shimmer', 0.9, 0);                                // the cone of sight opens
SFX(CUT('014-narrator') + 6 / FPS, 'ghost', 0.8, 0.5);                                // ghosts inside the cone
SFX(CUT('014-narrator') + 2.2, 'car', 0.7, 0.4, 2.2);                                 // the car coming along the road
for (let t = CUT('014-narrator') + 0.17; t < CUT('015-narrator'); t += 2 * Math.PI / 9) SFX(t, 'step', 0.25, 0);   // the walkers from above (every other step)
SFX(VW('014-narrator', 'eyes') - 2 / FPS, 'pop', 0.9, -0.7);                          // NO GHOST

// ---------------------------------------------------------------------
//  SHOTS 19–20 — "And only the future where you do nothing." — a kid with a ball; in the ghost he kicks it and it
//  hits your head. Close-up: real you, still; the ghost you takes the ball on the forehead
// ---------------------------------------------------------------------
function s01_kidMan(pose, ghost, a = 0.6) { return ivMan({ who: CAST.kidD, x: s01_kid.x, y: GROUND, h: s01_kid.h, f: 0.7, pose, expr: { eyes: 'happy', mouth: 'grin' }, ghost, ghostA: a }); }
const s01_headY = GROUND - 0.85 * 520;
SHOT(CUT('015-narrator'), 's01_ballWide', (lt, S) => {
  const D = Math.max(0.6, CUT('015-narrator', 'do') - S.t0), u = clamp((lt - 0.25) / (D - 0.4)), hit = u >= 1;
  IV_CAM = { x: 860, y: 560, z: 1.12 * ivPush(S.t0, 0.03, 1.8) };
  ivStage(SET_street({ t: 'sunset', car: false, act: () => {
    s01_kidMan(ivPose('relaxed', { fR: [0.1, 0.43] }), false); P_ball(s01_kid.ball, GROUND, 1.1);
    ivMan({ who: CAST.you, x: s01_theo, y: GROUND, h: 520, f: -0.45, pose: s01_pocket, expr: { eyes: 'open', mouth: 'flat', look: [-1, 0] } });
    s01_kidMan(lt > 0.25 ? s01_kick : ivPose('relaxed'), true, 0.6);
    const [gx, gy] = s01_arc(u, s01_theo - 30, s01_headY);
    ivGhost(() => { P_ball(gx, gy + 32, 1.1, { air: true, rot: lt * 10 }); }, 0.85);
    if (hit) ivMan({ who: CAST.you, x: s01_theo, y: GROUND, h: 520, f: -0.45, pose: ivPose('stand', { lean: -0.18, tilt: -0.3, hL: [-0.14, 0.05], hR: [0.12, 0.02] }), expr: { eyes: 'closed', mouth: 'o' }, ghost: true, ghostA: 0.65 });
  } }));
}, { sec: 's01', title: 'only the future where you do nothing — ghost ball flies at your head' });
SFX(CUT('015-narrator'), 'whoosh', 0.8);
SFX(CUT('015-narrator') + 0.25, 'ghost', 0.6, -0.5);                                  // the ghost kid kicks
SFX(CUT('015-narrator') + 0.27, 'bounce', 0.6, -0.5);
SFX(CUT('015-narrator') + 0.25 + (Math.max(0.6, CUT('015-narrator', 'do') - CUT('015-narrator')) - 0.4) * 0.5, 'swish', 0.6, 0);   // ghost ball in flight
SHOT(CUT('015-narrator', 'do'), 's01_bonk', (lt, S) => {
  const tHit = S.t0 + 0.3, hu = s01_r(tHit, 3 / FPS);
  IV_CAM = { x: s01_theo - 120, y: 470, z: 2.8 };
  ivStage(SET_street({ t: 'sunset', car: false, act: () => {
    ivMan({ who: CAST.you, x: s01_theo, y: GROUND, h: 520, f: -0.3, hands: 'nub', pose: s01_pocket, expr: { eyes: 'open', mouth: 'flat', look: [-0.5, 0] } });
    ivMan({ who: CAST.you, x: s01_theo, y: GROUND, h: 520, f: -0.3, hands: 'nub', pose: ivPoseMix(s01_pocket, ivPose('stand', { lean: -0.2, tilt: -0.35, hL: [-0.14, 0.05], hR: [0.12, 0.02] }), hu), expr: { eyes: hu > 0.5 ? 'closed' : 'wide', mouth: 'o' }, ghost: true, ghostA: 0.6, blinkKey: 'g' });
    const bu = clamp((TT - (tHit - 0.3)) / 0.3), bx = TT < tHit ? lerp(s01_theo - 520, s01_theo - 70, bu) : s01_theo - 70 - (TT - tHit) * 500, by = TT < tHit ? lerp(s01_headY - 40, s01_headY + 10, bu) : s01_headY + 10 - Math.sin(clamp((TT - tHit) / 0.8) * Math.PI) * 140;
    ivGhost(() => {
      P_ball(bx, by + 32, 1.1, { air: true, rot: TT * 9 });
      if (TT >= tHit && TT < tHit + 0.5) { ctx.save(); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; for (let i = 0; i < 6; i++) { const q = i * TAU / 6 + 0.3; ctx.beginPath(); ctx.moveTo(s01_theo - 90 + Math.cos(q) * 40, s01_headY - 10 + Math.sin(q) * 40); ctx.lineTo(s01_theo - 90 + Math.cos(q) * 75, s01_headY - 10 + Math.sin(q) * 75); ctx.stroke(); } ctx.restore(); }
    }, 0.85);
  } }));
}, { sec: 's01', title: 'do nothing — CU: real you still, ghost you gets bonked' });
SFX(CUT('015-narrator', 'do') + 0.3, 'whoosh', 0.8, -0.4);                           // ball incoming
SFX(CUT('015-narrator', 'do') + 0.3, 'bounce', 1.6, -0.1);                            // bonk on the ghost forehead
SFX(CUT('015-narrator', 'do') + 0.3, 'thud', 0.8, -0.1);
SFX(CUT('015-narrator', 'do') + 0.32, 'ghost', 0.5, -0.1);

// ---------------------------------------------------------------------
//  SHOTS 21–22 — "Move, and the ghost moves with you." — you take two steps aside; the ghost re-forms: the ghost
//  you stands in the new spot and the ghost ball now flies past
// ---------------------------------------------------------------------
const s01_moveT = () => VW('016-narrator', 'move') - 2 / FPS;
function s01_youMoving(o = {}) {
  const t0 = s01_moveT(), w = ivWalk(t0, s01_theo, 520, 1, 5, t0 + 10 / FPS), done = TT >= t0 + 10 / FPS;
  ivMan({ who: CAST.you, x: w.x, y: GROUND, h: 520, f: done || TT < t0 ? -0.45 : 0.8, pose: w.moving ? w.pose : s01_pocket, expr: o.expr || { eyes: 'open', mouth: done ? 'smirk' : 'flat', look: [-1, 0] } });
  return w.x;
}
SHOT(CUT('016-narrator'), 's01_move', (lt, S) => {
  IV_CAM = { x: s01_theo + 60, y: 560, z: 1.7 };
  ivStage(SET_street({ t: 'sunset', car: false, act: () => {
    const x = s01_youMoving();
    // the ghost ball still aimed at the old spot (the future where you stay), hanging in the air
    ivGhost(() => { const [gx, gy] = s01_arc(0.85, s01_theo - 30, s01_headY); P_ball(gx, gy + 32, 1.1, { air: true, rot: TT * 9 }); ivLine(gx + 50, gy + 10, s01_theo - 40, s01_headY + 10, 4, '#fff'); }, 0.6 * (1 - clamp((x - s01_theo) / s01_step)));
  } }));
}, { sec: 's01', title: 'Move, — you step aside (two steps)' });
SFX(CUT('016-narrator'), 'swish', 0.5);
SFX(s01_moveT(), 'cloth', 0.6, 0.1);
SFX(s01_moveT() + 5 / FPS, 'step', 0.9, 0.2);                                         // two steps aside
SFX(s01_moveT() + 10 / FPS, 'step', 0.8, 0.35);
SFX(s01_moveT() + 6 / FPS, 'shimmer', 0.5, -0.3);                                     // the old ghost ball fades
SHOT(CUT('016-narrator', 'ghost'), 's01_ghostMoves', (lt, S) => {
  const D = Math.max(0.6, LE('016-narrator') - S.t0), u = clamp(lt / D);
  IV_CAM = { x: 860, y: 560, z: 1.12 };
  ivStage(SET_street({ t: 'sunset', car: false, act: () => {
    s01_kidMan(ivPose('relaxed', { fR: [0.1, 0.43] }), false); P_ball(s01_kid.ball, GROUND, 1.1);
    const x = s01_youMoving();
    s01_kidMan(s01_kick, true, 0.55);
    ivMan({ who: CAST.you, x: x + 30, y: GROUND, h: 520, f: -0.85, pose: ivPose('stand', { lean: 0.05, tilt: 0.15, hL: [-0.06, 0.24], hR: [0.06, 0.24] }), expr: { eyes: 'happy', mouth: 'grin', look: [-1, 0] }, ghost: true, ghostA: 0.5, blinkKey: 'g2' });
    ivGhost(() => { for (let k = 0; k < 4; k++) { const q = clamp(u - k * 0.06); const [gx, gy] = s01_arc(q * 1.25, s01_theo + 60, GROUND - 40); ctx.save(); ctx.globalAlpha = k ? 0.35 / k : 1; P_ball(gx, gy + 32, 1.1, { air: true, rot: TT * 9 }); ctx.restore(); } }, 0.85);
  } }));
}, { sec: 's01', title: 'the ghost moves with you — ghost you in the new spot, ghost ball misses' });
SFX(CUT('016-narrator', 'ghost'), 'ghost', 1.1, 0.3);                                // the ghost re-forms in the new spot
SFX(CUT('016-narrator', 'ghost') + 0.05, 'swish', 0.5, -0.5);                         // ghost kid kicks
SFX(CUT('016-narrator', 'ghost') + Math.max(0.6, LE('016-narrator') - CUT('016-narrator', 'ghost')) * 0.55, 'whoosh', 0.6, 0.3);   // ghost ball flies past

// ---------------------------------------------------------------------
//  SHOT 23 — [BEAT] wordless: the real ball whizzes through the spot where you were; you don't even look
// ---------------------------------------------------------------------
SHOT(LE('016-narrator') + 2 / FPS, 's01_miss', (lt, S) => {
  const x = s01_theo + s01_step, tB = S.t0 + 0.25, bu = clamp((TT - tB) / 0.4);
  IV_CAM = { x: x - 140, y: 500, z: 2.3 };
  ivStage(SET_street({ t: 'sunset', car: false, act: () => {
    // the ball lands where you stood and bounces off behind you
    if (bu > 0 && TT < tB + 1.4) { const p = clamp((TT - tB) / 0.4), q = clamp((TT - tB - 0.4) / 0.9);
      const bx = p < 1 ? lerp(s01_theo - 420, s01_theo + 40, p) : s01_theo + 40 + q * 700, by = p < 1 ? lerp(s01_headY - 60, GROUND, p * p) : GROUND - Math.sin(q * Math.PI) * 260;
      P_ball(bx, by, 1.1, { air: by < GROUND - 2, rot: TT * 12 }); }
    ivMan({ who: CAST.you, x, y: GROUND, h: 520, f: -0.35, hands: 'nub', pose: ivPose('stand', { hL: [-0.06, 0.24], hR: [0.06, 0.24] }), expr: { eyes: TT > tB + 0.5 ? 'squint' : 'open', mouth: TT > tB + 0.5 ? 'smirk' : 'flat', look: [0.6, 0] } });
  } }));
}, { sec: 's01', title: '[beat] the real ball lands where you stood; you smirk' });
SFX(LE('016-narrator') + 2 / FPS, 'swish', 0.5);
SFX(LE('016-narrator') + 2 / FPS + 0.6, 'whoosh', 1.2, -0.4);                         // the real ball whizzes in
SFX(LE('016-narrator') + 2 / FPS + 0.65, 'bounce', 1.3, -0.1);                        // lands where you stood
SFX(LE('016-narrator') + 2 / FPS + 1.55, 'bounce', 0.7, 0.5);                          // bounces off behind you
SFX(LE('016-narrator') + 2 / FPS + 0.75, 'cloth', 0.35, 0.1);                         // you don't even look — smirk
