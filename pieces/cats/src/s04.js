// =====================================================================
//  s04 — 072–095 · Lily, the fair, LOST (the emotional turn)
//  Kitchen (day: Lily, the hug, the hat) → the hall at night (Pickles outside her door) → the street fair (day → dusk:
//  hand → balloon → empty hand) → "She's gone." (the fair drops to near silence) → police, phones, flyers, the clock
//  cards 8:00 → 10:00 → MIDNIGHT → "Nothing." (an empty night street; cats watch from the windows).
//  Every time comes from the voice helpers; SFX are registered next to their SHOT.
// =====================================================================
const s04_V = { 72: '072-narrator', 73: '073-narrator', 74: '074-narrator', 75: '075-narrator', 76: '076-narrator', 77: '077-lily',
  78: '078-pickles', 79: '079-narrator', 80: '080-you', 81: '081-pickles', 82: '082-narrator', 83: '083-narrator', 84: '084-narrator',
  85: '085-narrator', 86: '086-narrator', 87: '087-narrator', 88: '088-mom', 89: '089-narrator', 90: '090-narrator', 91: '091-narrator',
  92: '092-narrator', 93: '093-narrator', 94: '094-narrator', 95: '095-narrator', 96: '096-narrator' };
const s04_C = (n, w, k) => CUT(s04_V[n], w, k), s04_W = (n, w, k) => VW(s04_V[n], w, k), s04_WE = (n, w, k) => VWE(s04_V[n], w, k);
const s04_u = (a, d) => EZ.o3(clamp((TT - a) / Math.max(1e-3, d)));          // hard-stop ramp on absolute time
const s04_ui = (a, d) => EZ.i2(clamp((TT - a) / Math.max(1e-3, d)));
const s04_mv = (t0, t1, a, b) => { const u = EZ.io(clamp((TT - t0) / Math.max(1e-3, t1 - t0))); IV_CAM = { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u) }; };
const s04_O = { sec: 's04' };
const s04_LH = 0.62 * 520;                                                     // Lily's height next to a 520-px Kai
const s04_screen = (fn) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); fn(); ctx.restore(); };

// ---- small drawings ----------------------------------------------------------------------------
const s04_man = (who, x, y, h, f, pose, expr, o = {}) => { if (!o.noShadow) ivCastShadow(x, y, h, { a: 0.32 }); return ivMan({ who, x, y, h, f, pose, expr, ...o }); };
const s04_cat = (o) => { if (!o.noShadow) ivCastShadow(o.x, o.y, o.s * 0.9, { a: 0.28, w: 0.5, len: 0.6 }); return ivCat({ coat: CATS.pickles, ...o }); };
// a forearm + glove for hand close-ups (elbow → wrist), with the rim pass
function s04_arm(ex, ey, x, y, h, grip, sleeve, s = 1) {
  const lw = IV_J.lw * h, rw = 3.2 / Math.abs(ctx.getTransform().a || 1), k = IV_M.key, ang = Math.atan2(y - ey, x - ex);
  for (const rim of [true, false]) {
    const C = (c) => (rim ? IV_M.rim : c), Wd = (w) => w + (rim ? rw * 2 : 0);
    ctx.save(); if (rim) ctx.translate(k[0] * rw * 0.9, k[1] * rw * 0.9);
    ivLine(ex, ey, x, y, Wd(lw), C(IV.ink));
    if (sleeve) { ivLine(ex - (x - ex) * 0.5, ey - (y - ey) * 0.5, lerp(ex, x, 0.8), lerp(ey, y, 0.8), Wd(lw * 1.75), C(sleeve)); if (!rim) ivLine(lerp(ex, x, 0.74), lerp(ey, y, 0.74), lerp(ex, x, 0.8), lerp(ey, y, 0.8), lw * 1.78, ivShade(sleeve, -0.3), 'butt'); }
    ivHand(x, y, ang, h, 'glove', grip, C, Wd, s);
    ctx.restore();
  }
}
// a sleeve + nub hand over something held (Lily's arms around Pickles)
function s04_wrap(x1, y1, x2, y2, h, col) {
  const lw = IV_J.lw * h, k = IV_M.key;
  ctx.save(); ctx.translate(k[0] * 2.5, k[1] * 2.5); ivLine(x1, y1, x2, y2, lw * 1.75 + 5, IV_M.rim); ctx.restore();
  ivLine(x1, y1, x2, y2, lw * 1.75, col); ivDot(x2, y2, lw * 0.75, IV.ink);
}
function s04_heart(x, y, r, a = 1, col = '#e8576e') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(r / 20, r / 20);
  ctx.beginPath(); ctx.moveTo(0, 18); ctx.bezierCurveTo(-26, 0, -18, -20, 0, -8); ctx.bezierCurveTo(18, -20, 26, 0, 0, 18); ctx.fillStyle = col; ctx.fill();
  ivDot(-7, -6, 3.2, 'rgba(255,255,255,0.55)'); ctx.restore();
}
function s04_note(x, y, s, a = 1, col = '#ffe6c4') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.15);
  ctx.beginPath(); ctx.ellipse(0, 0, 11, 8, -0.4, 0, TAU); ctx.fillStyle = col; ctx.fill(); ivLine(9, -3, 9, -46, 3.5, col);
  ctx.beginPath(); ctx.moveTo(9, -46); ctx.quadraticCurveTo(26, -38, 22, -22); ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.stroke(); ctx.restore();
}
// a clock card in screen space: an analog face whose hands sweep from the previous hour, plus the time in big type
function s04_clockCard(x, y, r, h0, h1, tA, label, sub) {
  const a = ivPop(tA - 0.08); if (a <= 0) return;
  const u = s04_u(tA - 0.05, 0.35), hr = lerp(h0, h1, u), sc = 0.85 + 0.15 * EZ.back(clamp((TT - tA + 0.08) / 0.25));
  s04_screen(() => {
    ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(sc, sc);
    ivGlow(0, 0, r * 2.2, 'rgba(255,190,120,0.18)');
    ctx.beginPath(); ctx.arc(0, 0, r + 8, 0, TAU); ctx.fillStyle = 'rgba(14,12,20,0.85)'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = '#f4ead8'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#ffd6a0'; ctx.stroke();
    for (let i = 0; i < 12; i++) { const q = i / 12 * TAU; ivLine(Math.sin(q) * r * 0.8, -Math.cos(q) * r * 0.8, Math.sin(q) * r * 0.92, -Math.cos(q) * r * 0.92, i % 3 ? 3 : 6, '#3a2e36'); }
    const ah = hr / 12 * TAU, am = hr * TAU;
    ivLine(0, 0, Math.sin(ah) * r * 0.5, -Math.cos(ah) * r * 0.5, 9, '#1a1420'); ivLine(0, 0, Math.sin(am) * r * 0.78, -Math.cos(am) * r * 0.78, 5, '#1a1420'); ivDot(0, 0, 7, '#c8352e');
    ivText(label, r + 34, 22, r * 0.78, '#ffe2b0', { align: 'left', glow: 'rgba(255,150,70,0.6)', track: 2 });
    if (sub) ivText(sub, r + 38, 22 + r * 0.5, r * 0.26, 'rgba(255,230,200,0.75)', { align: 'left', weight: 700, track: 4 });
  });
}
// a walking/running actor that stops hard on tStop at xEnd (planted feet), then blends into `stop` over 5 frames
function s04_run(t0, tStop, xEnd, h, dir, fps, stop) {
  const stepT = fps / FPS, S = h * 0.26, x0 = xEnd - dir * S * (tStop - t0) / stepT, w = ivWalk(t0, x0, h, dir, fps, tStop);
  return { x: w.x, pose: TT < tStop ? w.pose : ivPoseMix(w.pose, stop, s04_u(tStop, 5 / FPS)), moving: TT < tStop };
}

// =====================================================================
//  A · Lily (kitchen, day) — 072–078
// =====================================================================
const s04_bed = () => SET_POS.kitchen.catBed;
// 072 "Then there's Lily." — she bursts into the kitchen at a run and stops hard on "Lily"; Kai behind the table, Pickles in his bed
SHOT(s04_C(72), 's04_lily', () => {
  const tS = s04_W(72, 'lily') - 0.05; s04_mv(SHOT_T0, SHOT_T0 + 1.6, [700, 560, 1.0], [880, 590, 1.2]);
  const [bx, by] = s04_bed();
  ivStage(SET_kitchen({ act: () => {
    s04_man(CAST.kai, 1360, GROUND, 520, -0.35, ivPose('relaxed', { hR: [0.12, 0.12] }), { eyes: 'open', mouth: 'smile', look: [-1, 0.3] });
    s04_cat({ x: bx, y: by - 22, s: 150, f: 1, pose: 'loaf', expr: { eyes: TT > tS ? 'wide' : 'half' }, noShadow: true });
    const r = s04_run(SHOT_T0, tS, 690, s04_LH, 1, 3, ivPose('handsUp', { lean: -0.05 }));
    s04_man(CAST.lily, r.x, GROUND, s04_LH, 0.55, r.pose, { eyes: 'happy', mouth: 'grin' });
  } }));
  ivTag('LILY', 690 + (960 - IV_CAM.x) * 0, 300, 34, ivPop(tS + 0.05));
}, { ...s04_O, title: 'Lily runs in, stops on "Lily"' });
{ const T0 = s04_C(72), tS = s04_W(72, 'lily') - 0.05;
  SFX(T0 + 0.02, 'door', 0.6, -0.7); for (let i = 0; i < 3; i++) SFX(T0 + 0.12 + i * 0.25, 'step', 0.45, -0.6 + i * 0.2); SFX(tS, 'slide', 0.7, -0.1); SFX(tS + 0.12, 'pop', 0.7, -0.1); }

// 073 "Your sister." — the two-shot: the height gap; she tugs his sleeve, he looks down
SHOT(s04_C(73), 's04_sister', () => {
  IV_CAM = { x: 820, y: 640, z: 1.75 * ivPush(SHOT_T0, 0.03, 1.4) };
  const tug = s04_u(s04_W(73, 'sister') - 0.05, 0.2), w = Math.sin(Math.max(0, TT - s04_W(73, 'sister')) * 14) * (1 - s04_u(s04_W(73, 'sister'), 0.6));
  ivStage(SET_kitchen({ act: () => {
    s04_man(CAST.kai, 900, GROUND, 520, -0.3, ivPose('relaxed', { hR: [0.08, 0.28] }), { eyes: 'open', mouth: 'smile', look: [-1, 0.8] });
    s04_man(CAST.lily, 690, GROUND, s04_LH, 0.45, ivPoseMix(ivPose('relaxed'), ivPose('reach', { hR: [0.32, -0.02 + w * 0.02] }), tug), { eyes: 'happy', mouth: 'grin', look: [1, -1] });
  } }));
}, { ...s04_O, title: 'the sister: height gap, sleeve tug' });
{ const tW = s04_W(73, 'sister'); SFX(s04_C(73) + 0.02, 'swish', 0.6, 0.1); SFX(tW, 'cloth', 0.9, 0.1); }

// 074 "Seven." — Lily's face, a proud grin, the big "7" pops beside her on the word
SHOT(s04_C(74), 's04_seven', () => {
  const tS = s04_W(74, 'seven'); IV_CAM = { x: 930, y: 640, z: 2.9 };
  const up = s04_u(tS - 0.12, 0.17);
  ivStage(SET_kitchen({ act: () => {
    s04_man(CAST.lily, 900, GROUND, s04_LH, 0.15, ivPoseMix(ivPose('relaxed'), ivPose('wave', { hR: [0.18, -0.2] }), up), { eyes: up > 0.5 ? 'happy' : 'open', mouth: 'grin' }, { noShadow: true });
  } }));
  const a = ivPop(tS + 0.02), sc = EZ.back(clamp((TT - tS) / 0.25));
  if (a > 0) s04_screen(() => { ctx.translate(1420, 470); ctx.scale(sc, sc); ctx.rotate(0.06);
    ivText('7', 0, 120, 340, '#ffe2b0', { glow: 'rgba(255,150,70,0.7)', shadow: 'rgba(0,0,0,0.35)' }); ivText('YEARS OLD', 0, 190, 40, '#fbeedd', { track: 6, shadow: 'rgba(0,0,0,0.4)' }); });
}, { ...s04_O, title: '"Seven." — Lily + big 7' });
{ const tS = s04_W(74, 'seven'); SFX(tS - 0.1, 'cloth', 0.6, 0.2); SFX(tS + 0.02, 'pop', 1.1, 0.3); }

// 075 "She loves Pickles more than anything." — she squeezes Pickles in a hug, he hangs there enduring it; hearts
SHOT(s04_C(75), 's04_hug', () => {
  IV_CAM = { x: 820, y: 700, z: 2.15 * ivPush(SHOT_T0, 0.05, 2.4) };
  const sq = 0.5 + 0.5 * Math.sin((TT - SHOT_T0) * 5.5), sway = Math.sin((TT - SHOT_T0) * 2.8) * 0.06;
  ivStage(SET_kitchen({ act: () => {
    const x = 820, M = s04_man(CAST.lily, x, GROUND, s04_LH, 0.1, ivPose('hug', { hL: [-0.06, 0.2], hR: [0.06, 0.2], tilt: sway * 2, lean: sway * 0.5 }), { eyes: 'happy', mouth: 'grin' });
    const cx = x + 4, cy = 836 - sq * 3;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1 + sq * 0.05, 1 - sq * 0.05); ctx.translate(-cx, -cy);
    ivCat({ x: cx, y: cy, s: 160, f: 1, coat: CATS.pickles, pose: 'sit', expr: { eyes: 'half' }, rot: -sway * 0.6 });
    ctx.restore();
    s04_wrap(cx - 62, cy - 62, cx + 44, cy - 40, s04_LH, CAST.lily.col); s04_wrap(cx + 60, cy - 58, cx - 40, cy - 30, s04_LH, CAST.lily.col);
  } }));
  [[s04_W(75, 'loves'), 640, 380], [s04_W(75, 'anything'), 1250, 330], [s04_W(75, 'anything') + 0.3, 1120, 230]].forEach(([t, hx, hy], i) => {
    const a = ivPop(t); if (a > 0) s04_screen(() => s04_heart(hx + Math.sin(TT * 3 + i) * 8, hy - (TT - t) * 40, 34 * EZ.back(clamp((TT - t) / 0.25)), a * (1 - clamp((TT - t - 1.2) / 0.5)))); });
}, { ...s04_O, title: 'Lily squeezes Pickles (hearts)' });
{ const T0 = s04_C(75); SFX(T0 + 0.03, 'cloth', 1, 0); SFX(s04_W(75, 'loves'), 'heart', 0.5, -0.3); SFX(s04_W(75, 'anything'), 'heart', 0.45, 0.3); SFX(s04_W(75, 'anything') + 0.5, 'cloth', 0.6, 0); }

// 076 "Pickles pretends to hate her." — his face: glare, turned away... her hand strokes him and his eyes melt shut
// (a purr), then snap back to the glare when she looks — he pretends
SHOT(s04_C(76), 's04_pretend', () => {
  const [bx, by] = s04_bed(); IV_CAM = { x: 480, y: 790, z: 3.4 };
  const tP = s04_W(76, 'her') - 0.1, pet = s04_u(tP, 0.25), back = s04_u(LE(s04_V[76]) + 0.45, 0.12);
  const melt = pet * (1 - back), stroke = Math.sin(Math.max(0, TT - tP) * 6) * pet * (1 - back);
  ivStage(SET_kitchen({ fg: false, act: () => {
    const C = s04_cat({ x: bx, y: by - 22, s: 170, f: -1, pose: 'sit', expr: { eyes: melt > 0.6 ? 'happy' : 'angry', blink: 0 }, look: [-1, 0], noShadow: true });
    const hx = C.head[0] + C.r * 0.55 + stroke * 12, hy = C.head[1] - C.r * 1.25 + Math.abs(stroke) * 3;
    const ex = lerp(760, hx + 140, 1), ey = lerp(560, hy - 120, 1);
    s04_arm(lerp(ex + 180, ex, pet), lerp(ey - 80, ey, pet), lerp(hx + 200, hx, pet), lerp(hy - 60, hy, pet), 620, 'flat', CAST.lily.col, -1);
  } }));
  ivTag('"HATE"', 760, 260, 30, ivPop(s04_W(76, 'hate')) * (1 - pet));
}, { ...s04_O, title: 'Pickles glares — melts under her hand — glares' });
{ const tP = s04_W(76, 'her') - 0.1; SFX(s04_C(76) + 0.02, 'swish', 0.5, -0.2); SFX(s04_W(76, 'hate'), 'gasp', 0.35, -0.3); SFX(tP + 0.1, 'cloth', 0.9, 0.2); SFX(tP + 0.6, 'cloth', 0.6, 0.2); SFX(LE(s04_V[76]) + 0.45, 'tick', 0.5, -0.2); }

// 077 "Pickles! Pickles, come here, I made you a hat!" — she runs across the kitchen calling, the hat hidden behind her back;
// Pickles in his bed goes wide-eyed, then flattens into a resigned loaf
SHOT(s04_C(77), 's04_lilyCall', () => {
  const tS = s04_W(77, 'come') + 0.05, [bx, by] = s04_bed();
  s04_mv(SHOT_T0, tS + 0.2, [1120, 600, 1.45], [800, 620, 1.55]);
  ivStage(SET_kitchen({ act: () => {
    s04_cat({ x: bx, y: by - 22, s: 150, f: 1, pose: 'loaf', expr: { eyes: TT < s04_W(77, 'pickles', 2) ? 'wide' : 'half' }, look: [1, 0], noShadow: true });
    const behind = { hL: [-0.12, 0.24], hR: [-0.09, 0.25] };
    const r = s04_run(SHOT_T0, tS, 690, s04_LH, -1, 4, ivPose('relaxed', { ...behind, lean: 0.08 }));
    const pose = { ...r.pose, ...behind };
    s04_man(CAST.lily, r.x, GROUND, s04_LH, -0.6, pose, { eyes: 'happy', mouth: 'grin' }, { talk: s04_V[77], hold: { L: (x, y) => P_catHat(x - 10, y + 30, 0.9, { ang: 0.5 }) } });
  } }));
}, { ...s04_O, title: 'Lily runs in calling, hat behind her back' });
{ const T0 = s04_C(77), tS = s04_W(77, 'come') + 0.05;
  SFX(T0 + 0.02, 'whoosh', 0.5, 0.4); for (let i = 0; i < 3; i++) SFX(lerp(T0 + 0.1, tS - 0.1, i / 2), 'step', 0.4, 0.5 - i * 0.3); SFX(tS, 'slide', 0.6, -0.3); SFX(s04_W(77, 'pickles', 2), 'gasp', 0.35, -0.5); SFX(tS + 0.5, 'paper', 0.6, -0.2); }

// 077 "...I made you a hat!" — insert: her two small hands thrust the paper hat at the camera; it pops on "hat"
SHOT(s04_C(77, 'i'), 's04_hatReveal', () => {
  IV_CAM = { x: 620, y: 560, z: 3.2 };
  const up = s04_u(SHOT_T0, 0.3), pop = s04_u(s04_W(77, 'hat') - 0.08, 0.14), bob = Math.sin((TT - SHOT_T0) * 7) * 3 * (1 - pop);
  ivStage(SET_kitchen({ fg: false, act: () => {
    const hy = lerp(800, 690, up) - pop * 30 + bob, hx = 620, s = 1.6 + 0.3 * EZ.back(clamp((TT - s04_W(77, 'hat') + 0.08) / 0.25));
    P_catHat(hx, hy, s, { ang: -0.05 + Math.sin(TT * 4) * 0.03 });
    s04_arm(390, 860, hx - 64 * s * 0.5 - 6, hy + 10, 620, 'hold', CAST.lily.col, 1);
    s04_arm(850, 860, hx + 64 * s * 0.5 + 6, hy + 10, 620, 'hold', CAST.lily.col, -1);
  } }));
}, { ...s04_O, title: 'insert: her hands thrust the paper hat' });
{ const T0 = s04_C(77, 'i'), tH = s04_W(77, 'hat'); SFX(T0 + 0.05, 'swish', 0.8, 0); SFX(T0 + 0.2, 'paper', 0.8, 0); SFX(tH - 0.08, 'paper', 0.7, 0); SFX(tH, 'pop', 1.0, 0); }

// 078 "Absolutely not." — Pickles' deadpan close-up; the hat hovers in over his head
SHOT(s04_C(78), 's04_absolutely', () => {
  const [bx, by] = s04_bed(); IV_CAM = { x: 470, y: 860, z: 3.4 };
  const inn = s04_u(SHOT_T0 + 0.1, 0.3);
  ivStage(SET_kitchen({ fg: false, act: () => {
    const C = s04_cat({ x: bx, y: by - 22, s: 170, f: 1, pose: 'loaf', talk: s04_V[78], expr: { eyes: 'half' }, look: [0.6, -0.4], noShadow: true });
    const hx = lerp(820, C.head[0] + 30, inn), hy = C.head[1] - C.r * 2.1;
    P_catHat(hx, hy, 1.3, { ang: 0.15 }); s04_arm(hx + 300, hy - 200, hx + 40, hy - 24, 600, 'hold', CAST.lily.col, -1);
  } }));
}, { ...s04_O, title: 'Pickles: "Absolutely not."' });
{ const T0 = s04_C(78); SFX(T0 + 0.05, 'paper', 0.5, 0.4); SFX(s04_WE(78, 'not') - 0.1, 'tick', 0.35, 0); }

// ...a beat later: he wears it anyway. Deadpan in the hat, Lily cheek to cheek with him, beaming
SHOT(s04_W(78, 'not') + 0.25, 's04_hatOn', () => {
  const [bx, by] = s04_bed(); IV_CAM = { x: 500, y: 840, z: 2.8 };
  ivStage(SET_kitchen({ fg: false, act: () => {
    const M = ivMan({ who: CAST.lily, x: 660, y: 1110, h: 370, f: -0.25, pose: ivPose('hug', { hL: [0.24, 0.1], hR: [0.3, 0.08], tilt: -0.2 }), expr: { eyes: 'happy', mouth: 'grin' } });
    const C = s04_cat({ x: bx + 20, y: by - 22, s: 170, f: 1, pose: 'loaf', expr: { eyes: 'half' }, look: [1, 0], noShadow: true });
    P_catHat(C.head[0] - C.r * 0.1, C.head[1] - C.r * 0.75, 0.62, { ang: -0.18 });
    void M;
  } }));
}, { ...s04_O, title: 'Pickles in the hat anyway' });
{ const t = s04_W(78, 'not') + 0.25; SFX(t + 0.02, 'pop', 0.6, -0.2); SFX(t + 0.35, 'laugh', 0.45, 0.2); }

// =====================================================================
//  B · the hall at night — 079–081 (+ the 2 s beat)
// =====================================================================
const s04_spot = () => SET_POS.hall.spot;
// 079 "every night, he sleeps outside her door." — the camera enters the dark hall; Pickles pads to the blanket by
// Lily's door and curls up to sleep
SHOT(s04_C(79, 'night'), 's04_hall', () => {
  const [sx, sy, ss] = s04_spot(), tL = s04_W(79, 'sleeps') + 0.1, tZ = s04_W(79, 'door');
  s04_mv(SHOT_T0, s04_C(80), [760, 520, 1.0], [sx + 160, sy - 170, 1.5]);
  ivStage(SET_hall({ door: 0.3, act: () => {
    const walking = TT < tL, x = walking ? lerp(sx + 520, sx + 10, clamp((TT - SHOT_T0) / (tL - SHOT_T0))) : sx + 10;
    s04_cat({ x, y: sy - 8, s: ss, f: -1, pose: walking ? 'walk' : TT < tZ ? 'loaf' : 'sleep', phase: TT * 2, expr: { eyes: TT < tZ ? 'half' : 'closed' } });
  } }));
}, { ...s04_O, title: 'hall at night: Pickles curls up outside her door' });
{ const T0 = s04_C(79, 'night'), tL = s04_W(79, 'sleeps') + 0.1;
  for (let i = 0; i < 2; i++) SFX(T0 + 0.1 + i * 0.35, 'step', 0.3, 0.4 - i * 0.2); SFX(tL + 0.05, 'cloth', 0.7, -0.1); SFX(s04_W(79, 'door'), 'cloth', 0.45, -0.1); }

// 080 "You like her." — Kai leans on the wall in the hallway, arms crossed, a smirk at the sleeping cat
SHOT(s04_C(80), 's04_like', () => {
  const [sx, sy, ss] = s04_spot(); IV_CAM = { x: 820, y: 760, z: 1.7 * ivPush(SHOT_T0, 0.03, 1.4) };
  ivStage(SET_hall({ door: 0.3, act: () => {
    s04_cat({ x: sx + 10, y: sy - 8, s: ss, f: -1, pose: 'sleep', expr: { eyes: 'closed' } });
    ivCastShadow(960, 975, 360, { a: 0.3 });
    s04_man(CAST.kai, 960, 975, 520, -0.5, ivPose('slump', { dip: 0.4, fL: [0.3, 0.05], fR: [0.34, 0.05], hL: [0.2, 0.2], hR: [0.25, 0.18], lean: 0.12, tilt: 0.12 }), { eyes: 'open', mouth: 'smirk', look: [-1, 0.6] }, { talk: s04_V[80], noShadow: true });
  } }));
}, { ...s04_O, title: 'Kai: "You like her."' });
{ const T0 = s04_C(80); SFX(T0 + 0.05, 'cloth', 0.6, 0.4); SFX(T0 + 0.6, 'step', 0.3, 0.4); }

// 081 "I watch the small ones. Somebody has to." — Pickles in close-up, one lazy eye, then he looks to her door
SHOT(s04_C(81), 's04_watch', () => {
  const [sx, sy, ss] = s04_spot(), tS = s04_W(81, 'somebody');
  IV_CAM = { x: sx + 40, y: sy - ss * 0.55, z: 3.3 };
  ivStage(SET_hall({ door: 0.3, fg: false, act: () => {
    s04_cat({ x: sx + 10, y: sy - 8, s: ss, f: TT < tS ? 1 : -1, pose: 'loaf', talk: s04_V[81], expr: { eyes: TT < tS ? 'half' : 'open' }, look: TT < tS ? [0.6, -0.3] : [0.8, -0.4] });
  } }));
}, { ...s04_O, title: 'Pickles: "I watch the small ones."' });
{ const tS = s04_W(81, 'somebody'); SFX(s04_C(81) + 0.05, 'cloth', 0.4, 0); SFX(tS - 0.06, 'cloth', 0.6, -0.2); }

// [BEAT 2 s] — Kai's hand rests on Pickles' head; the cat's eyes close slowly; the camera eases back
SHOT(LE(s04_V[81]) + 0.25, 's04_pat', () => {
  const [sx, sy, ss] = s04_spot(), t0 = SHOT_T0, land = s04_u(t0 + 0.15, 0.4);
  s04_mv(t0, s04_C(82), [sx + 40, sy - ss * 0.55, 3.0], [sx + 90, sy - ss * 0.9, 2.4]);
  ivStage(SET_hall({ door: 0.3, act: () => {
    const C = s04_cat({ x: sx + 10, y: sy - 8, s: ss, f: -1, pose: 'loaf', expr: { eyes: 'open', blink: s04_u(t0 + 0.5, 0.9) }, look: [0, 0] });
    const hx = C.head[0] + C.r * 0.2, hy = C.head[1] - C.r * 1.1;
    s04_arm(lerp(hx + 260, hx + 130, land), lerp(hy - 380, hy - 120, land), hx, lerp(hy - 140, hy, land), 700, 'flat', CAST.kai.col, -1);
  } }));
}, { ...s04_O, title: 'beat: Kai\'s hand on Pickles, eyes close' });
{ const t0 = LE(s04_V[81]) + 0.25; SFX(t0 + 0.5, 'cloth', 0.6, 0.2); }

// =====================================================================
//  C · the street fair (day → dusk) — 082–088
// =====================================================================
// Kai and Lily hand in hand, both facing right: Kai's front hand meets Lily's back hand at M
function s04_pair(KX, LX, pK, pL, eK, eL, o = {}) {
  const fK = o.fK ?? 0.5, fL = o.fL ?? 0.5, my = 700, mx = (KX + LX) / 2 + 6;
  const swK = IV_J.sw * 520 * (1 - 0.55 * fK), swL = IV_J.sw * s04_LH * (1 - 0.55 * fL);
  const kp = { ...pK, hR: [(mx - (KX + swK)) / 520, (my - (GROUND - IV_J.shY * 520)) / 520] };
  const lp = { ...pL, hL: [(mx - (LX - swL)) / s04_LH, (my - (GROUND - IV_J.shY * s04_LH)) / s04_LH] };
  s04_man(CAST.kai, KX, GROUND, 520, fK, kp, eK);
  s04_man(CAST.lily, LX, GROUND, s04_LH, fL, lp, eL, o.lily || {});
}
// passers-by walking across the frame (dark, near the camera) — an extra layer for the fair close-ups
const s04_passers = (key, n, sp = 1, h = 1300, y = 1700, dark = 0.55) => ({ d: 0.6, draw: () => {
  const r = RNG('pass' + key).f;
  for (let i = 0; i < n; i++) { const dir = r() < 0.5 ? 1 : -1, v = (220 + r() * 160) * sp, x0 = r() * 3600, x = mod(x0 + dir * v * TT, 3600) - 800, who = EXT_CROWD[(i * 7 + 3) % EXT_CROWD.length];
    ivMan({ who: { ...who, col: ivShade(who.col, -dark) }, x, y, h, f: dir * 0.9, pose: ivWalk(-i * 0.37, 0, h, 1, 7).pose, expr: { eyes: 'open' } }); }
} });
const s04_walkers = (key, n, y, h, sp = 1, gap = null) => { const r = RNG('wk' + key).f;
  for (let i = 0; i < n; i++) { const dir = r() < 0.5 ? 1 : -1, v = (160 + r() * 120) * sp, x = mod(r() * 3200 + dir * v * TT, 3200) - 600, who = EXT_CROWD[(i * 5 + 1) % EXT_CROWD.length];
    if (gap && Math.abs(x - gap[0]) < gap[1]) continue;
    ivCastShadow(x, y, h, { a: 0.25 }); ivMan({ who, x, y, h, f: dir * 0.85, pose: ivWalk(-i * 0.29, 0, h, 1, 6).pose, expr: { eyes: 'open', mouth: r() < 0.5 ? 'smile' : 'flat' } }); } };

// 082 "Saturday." 083 "The street fair." — a crane down into the fair; Kai and Lily stroll in hand in hand, the camera tracks
SHOT(s04_C(82), 's04_fair', () => {
  const t0 = SHOT_T0, KX0 = 520, fpsK = 9, fpsL = fpsK * (0.26 * s04_LH) / (0.26 * 520);
  const wK = ivWalk(t0, KX0, 520, 1, fpsK), wL = ivWalk(t0, KX0 + 140, s04_LH, 1, fpsL);
  const u = EZ.io(clamp((TT - t0) / 2.4)); IV_CAM = { x: lerp(760, wK.x + 200, u), y: lerp(330, 560, u), z: lerp(1.0, 1.18, u) };
  ivStage(SET_fair({ crowd: 1.2, act: () => {
    s04_pair(wK.x, wL.x, wK.pose, wL.pose, { eyes: 'open', mouth: 'smile', look: [1, -0.3] }, { eyes: 'happy', mouth: 'grin' });
  } }));
  ivTag('SATURDAY', 300, 150, 32, ivPop(s04_W(82, 'saturday')));
}, { ...s04_O, title: 'crane into the fair, Kai + Lily hand in hand' });
{ const T0 = s04_C(82); SFX(T0 + 0.02, 'crowd', 0.8, 0, 2.9); SFX(T0 + 0.1, 'whoosh', 0.6, 0); SFX(s04_W(82, 'saturday') + 0.02, 'pop', 0.6, -0.6);
  for (let i = 0; i < 2; i++) SFX(T0 + 0.9 + i * 0.9, 'step', 0.35, -0.2 + i * 0.2); SFX(s04_W(83, 'fair'), 'cheer', 0.5, 0.3); }

// 084 "Music." — Lily dances by a street drummer, notes bouncing off the drum, Kai bobs his head
SHOT(s04_C(84), 's04_music', () => {
  IV_CAM = { x: 1000, y: 610, z: 1.75 * ivPush(SHOT_T0, 0.03, 1.2) };
  const b = Math.floor((TT - SHOT_T0) / 0.25), hit = mod(TT - SHOT_T0, 0.25) / 0.25, bob = Math.abs(Math.sin((TT - SHOT_T0) * Math.PI * 4));
  ivStage(SET_fair({ crowd: 1.2, fg: false, act: () => {
    // the drummer and his drum
    const dx = 1230; s04_man(CAST.extraB, dx + 90, GROUND, 520, -0.5, ivPose('stand', { hL: [0.2, 0.12 - (b % 2 ? 0.08 * (1 - hit) : 0)], hR: [0.26, 0.12 - (b % 2 ? 0 : 0.08 * (1 - hit))], lean: 0.12 }), { eyes: 'happy', mouth: 'smile' });
    ivCastShadow(dx - 40, GROUND, 200, { a: 0.3 }); ivBox(dx - 120, 730, 160, 170, 0.06, SET_POS2.fair.vp, { front: '#c8463c', top: '#f4ead8', side: '#8a2e28' });
    ctx.beginPath(); ctx.ellipse(dx - 40, 730, 80, 16, 0, 0, TAU); ctx.fillStyle = '#f4ead8'; ctx.fill(); ivLine(dx - 120, 790, dx + 40, 790, 4, '#f2c230'); ivLine(dx - 120, 870, dx + 40, 870, 4, '#f2c230');
    s04_man(CAST.kai, 640, GROUND, 520, 0.45, ivPose('relaxed', { tilt: bob * 0.12 }), { eyes: 'happy', mouth: 'smile' });
    const arms = b % 2 ? ivPose('wave', { hL: [-0.16, -0.22], hR: [0.12, -0.1] }) : ivPose('wave', { hL: [-0.12, -0.08], hR: [0.16, -0.24] });
    s04_man(CAST.lily, 930, GROUND - bob * 18, s04_LH, 0.2, { ...arms, tilt: (b % 2 ? -1 : 1) * 0.12 }, { eyes: 'happy', mouth: 'grin' }, { air: true, noShadow: true });
    ivCastShadow(930, GROUND, s04_LH, { a: 0.3 - bob * 0.1 });
  } }));
  s04_screen(() => { for (let i = 0; i < 5; i++) { const t = SHOT_T0 + 0.1 + i * 0.25, k = clamp((TT - t) / 1.1); if (k <= 0 || k >= 1) continue; s04_note(1100 + i * 60 + Math.sin(k * 6 + i) * 30, 520 - k * 330, 1.3, 1 - k, ['#ffe6c4', '#ffd27a', '#ff9a8a'][i % 3]); } });
}, { ...s04_O, title: '"Music." — Lily dances by the drummer' });
{ const T0 = s04_C(84); for (let i = 0; i < 3; i++) SFX(T0 + 0.05 + i * 0.25, i % 2 ? 'click' : 'thud', 0.7, 0.5); SFX(T0 + 0.6, 'cheer', 0.35, -0.2); }

// 085 "Crowds." — the street fills: people pour across in front of them; Kai pulls Lily closer
SHOT(s04_C(85), 's04_crowds', () => {
  s04_mv(SHOT_T0, SHOT_T0 + 1.3, [960, 500, 1.05], [1000, 520, 1.2]);
  ivStage(SET_fair({ crowd: 2, act: () => {
    s04_walkers('c85b', 6, 880, 480, 1.3);
    s04_pair(930, 1060, ivPose('relaxed'), ivPose('relaxed'), { eyes: 'open', mouth: 'flat', look: [-1, 0] }, { eyes: 'wide', mouth: 'o', look: [-1, -1] });
    s04_walkers('c85f', 5, 990, 600, 1.5);
  } }));
}, { ...s04_O, title: '"Crowds." — people pour past' });
{ const T0 = s04_C(85); SFX(T0 + 0.02, 'crowd', 1.1, 0, 1.4); SFX(T0 + 0.15, 'whoosh', 0.5, -0.5); SFX(T0 + 0.8, 'whoosh', 0.4, 0.5); }

// 086 "Lily holds your hand," — close-up: her small hand slides into his
SHOT(s04_C(86), 's04_hands', () => {
  IV_CAM = { x: 960, y: 610, z: 3.0 };
  const j = s04_u(s04_W(86, 'holds') - 0.12, 0.22), sw = Math.sin((TT - SHOT_T0) * 3.4) * 10;
  const L = SET_fair({ crowd: 1.2, fg: false, act: () => {
    const kx = 930 + sw, ky = 600 + sw * 0.3;
    s04_arm(640, 330, kx, ky, 820, j > 0.6 ? 'hold' : 'open', CAST.kai.col, 1);
    s04_arm(1180, 880, lerp(1110, kx + 22, j), lerp(760, ky + 6, j), 520, 'hold', CAST.lily.col, -1);
  } });
  ivStage(L);
}, { ...s04_O, title: 'hand in hand (close-up)' });
{ const tH = s04_W(86, 'holds'); SFX(s04_C(86) + 0.03, 'crowd', 0.6, 0, 1.4); SFX(tH, 'cloth', 0.8, 0.2); }

// "then a balloon," — her hand now grips a red balloon string; it tugs her hand up and away from his
SHOT(s04_C(86, 'then', 1), 's04_balloonHand', () => {
  IV_CAM = { x: 980, y: 560, z: 2.4 };
  const away = s04_u(s04_W(86, 'balloon') + 0.1, 0.5);
  const L = SET_fair({ crowd: 1.2, fg: false, act: () => {
    const hx = lerp(1000, 1230, away), hy = lerp(780, 730, away);
    P_balloon(hx + 4, hy - 12, 1.7, { len: 110, key: 'lily' });
    s04_arm(hx + 150, hy + 230, hx, hy, 560, 'hold', CAST.lily.col, -1);
    s04_arm(560, 520, lerp(930, 900, away), lerp(800, 810, away), 820, 'open', CAST.kai.col, 1);
  } });
  ivStage([...L, s04_passers('h87', 3, 0.8)]);
}, { ...s04_O, title: 'her hand with the red balloon slips away' });
{ const tB = s04_W(86, 'balloon'); SFX(s04_C(86, 'then', 1) + 0.05, 'plastic', 0.6, 0.3); SFX(tB + 0.1, 'swish', 0.7, 0.4); SFX(tB + 0.5, 'whoosh', 0.4, 0.6); }

// "then nothing." — his empty hand; the fingers close on nothing
SHOT(s04_C(86, 'then', 2), 's04_empty', () => {
  IV_CAM = { x: 960, y: 600, z: 3.4 };
  const tN = s04_W(86, 'nothing');
  const L = SET_fair({ crowd: 1.2, fg: false, act: () => { s04_arm(700, 380, 950, 650, 820, TT < tN + 0.05 ? 'open' : TT < tN + 0.45 ? 'hold' : 'fist', CAST.kai.col, 1); } });
  ivStage(L);
}, { ...s04_O, title: 'Kai\'s empty hand closes on nothing' });
{ const tN = s04_W(86, 'nothing'); SFX(s04_C(86, 'then', 2) + 0.05, 'whoosh', 0.5, -0.4); SFX(tN + 0.05, 'cloth', 0.6, 0); SFX(tN + 0.45, 'cloth', 0.4, 0); }

// [BEAT] — dusk: Kai spins round in the crowd, looking; far off, a red balloon rises over the stalls
SHOT(s04_WE(86, 'nothing') + 0.25, 's04_turn', () => {
  const t0 = SHOT_T0, fs = [0.6, -0.65, 0.15, -0.3], k = Math.min(3, Math.floor((TT - t0) / 0.5)), sp = s04_u(t0 + k * 0.5, 4 / FPS);
  IV_CAM = { x: 980, y: 560, z: 1.3 * ivPush(t0, 0.06, 2.2) };
  ivStage(SET_fair({ t: 'dusk', crowd: 1.6, fg: false, act: () => {
    P_balloon(1500, 560, 0.45, { free: clamp((TT - t0) / 2.2), rise: 420, key: 'far' });
    s04_walkers('c90b', 5, 860, 460, 1.1);
    s04_man(CAST.kai, 960, GROUND, 520, lerp(fs[Math.max(0, k - 1)], fs[k], sp), ivPose('relaxed', { hL: [-0.1, 0.22], hR: [0.1, 0.22] }), { eyes: 'wide', mouth: 'o', look: [k % 2 ? -1 : 1, 0] });
    s04_walkers('c90f', 4, 990, 600, 1.4, [960, 420]);
  } }));
}, { ...s04_O, title: 'beat: Kai spins, looking; a balloon rises far away' });
{ const t0 = s04_WE(86, 'nothing') + 0.25; SFX(t0 + 0.02, 'crowd', 0.7, 0, 2.2); for (let i = 1; i < 4; i++) SFX(t0 + i * 0.5, 'swish', 0.5, i % 2 ? -0.4 : 0.4); }

// 087 "She's gone." — the camera cranes up and back: Kai alone in a gap in the crowd, the fair noise falls away
SHOT(s04_C(87), 's04_gone', () => {
  s04_mv(SHOT_T0, SHOT_T0 + 1.8, [960, 520, 1.25], [960, 380, 1.0]);
  ivStage(SET_fair({ t: 'dusk', crowd: 0.45, act: () => {
    ivLightPool([[700, 930], [1220, 930], [1300, 880], [620, 880]], 'rgba(255,190,130,0.16)');
    s04_walkers('c91b', 7, 850, 450, 0.7, [960, 420]);
    s04_man(CAST.kai, 960, GROUND, 520, 0.1, ivPose('relaxed', { hL: [-0.05, 0.3], hR: [0.05, 0.3] }), { eyes: 'sad', mouth: 'flat', look: [0, 0.4] });
    s04_walkers('c91f', 5, 1000, 600, 0.6, [960, 480]);
  } }));
}, { ...s04_O, title: '"She\'s gone." — Kai alone in the crowd' });
{ const T0 = s04_C(87); SFX(T0 + 0.02, 'drop', 0.8, 0); SFX(T0 + 0.05, 'crowd', 0.25, 0, 1.6); }

// 088 "Lily? Lily!" — Mom, hands cupped round her mouth, calling into the dusk; she turns on the second call
SHOT(s04_C(88), 's04_mom', () => {
  const t2 = s04_W(88, 'lily', 2) - 0.1, sp = s04_u(t2, 4 / FPS);
  IV_CAM = { x: 1000, y: 470, z: 2.6 };
  const L = SET_fair({ t: 'dusk', crowd: 1.6, fg: false, act: () => {
    s04_man(CAST.mom, 1000, GROUND, 540, lerp(0.3, -0.45, sp), ivPose('stand', { hL: [-0.04, 0.3], hR: [0.02, -0.08], lean: -0.04 }), { eyes: 'wide', brow: 'sad', mouth: 'open', look: [sp > 0.5 ? -1 : 1, -0.2] }, { talk: s04_V[88] });
  } });
  ivStage(L);
}, { ...s04_O, title: 'Mom: "Lily? Lily!"' });
{ const t2 = s04_W(88, 'lily', 2) - 0.1; SFX(s04_C(88) + 0.05, 'cloth', 0.5, 0); SFX(t2, 'swish', 0.6, -0.3); }

// =====================================================================
//  D · the search (night) — 089–095
// =====================================================================
// 089 "Police." — the night street: the patrol car's light bar sweeps red/blue; a cop with Mom and Kai
SHOT(s04_C(89), 's04_police', () => {
  s04_mv(SHOT_T0, SHOT_T0 + 1.4, [1300, 600, 1.0], [1060, 560, 1.25]);
  ivStage(SET_police({ lights: 1, act: () => {
    s04_man(CAST.kai, 880, GROUND, 520, 0.35, ivPose('relaxed'), { eyes: 'sad', mouth: 'flat', look: [1, 0] });
    s04_man(CAST.mom, 1140, GROUND, 540, 0.35, ivPose('stand', { hL: [0.06, 0.12], hR: [0.12, 0.08] }), { eyes: 'sad', brow: 'sad', mouth: 'open', look: [1, 0] });
    s04_man(CAST.cop, 1460, GROUND, 560, -0.45, ivPose('think', { hR: [0.14, 0.02] }), { eyes: 'open', mouth: 'flat', look: [-1, 0] });
  } }));
}, { ...s04_O, title: '"Police." — the patrol car, the cop, Mom' });
{ const T0 = s04_C(89); SFX(T0 + 0.02, 'engine', 0.5, -0.5, 1.1); SFX(T0 + 0.15, 'beep', 0.5, -0.4); SFX(T0 + 0.6, 'door', 0.7, -0.4); SFX(T0 + 0.95, 'step', 0.4, 0.3); }

// 090 "Phones." — Mom's phone rises into frame mid-call to the police; red/blue on the glass
SHOT(s04_C(90), 's04_phones', () => {
  IV_CAM = { x: 1000, y: 520, z: 2.0 };
  const up = s04_u(SHOT_T0, 0.25), sec = Math.floor((TT - SHOT_T0) + 14);
  ivStage(SET_police({ lights: 1, fg: false, act: () => {
    const px = 980, py = lerp(760, 540, up) + Math.sin(TT * 2) * 3;
    ivPhoneHold(px, py, 160, 330, 0.06, () => P_phone(px, py, 4.4, { ang: 0.06, screen: (w, h) => P_phoneUI.call(w, h, { name: 'POLICE', status: `00:${String(sec).padStart(2, '0')}`, now: '7:41' }) }), { sleeve: CAST.mom.col, side: 1 });
  } }));
}, { ...s04_O, title: '"Phones." — Mom on the line to the police' });
{ const T0 = s04_C(90); SFX(T0 + 0.05, 'swish', 0.6, 0.2); SFX(T0 + 0.3, 'beep', 0.45, 0.1); SFX(T0 + 0.75, 'beep', 0.45, 0.1); }

// 091 "Flyers." — on a lamp post: Kai's hand slaps a MISSING flyer over the others and smooths it flat
SHOT(s04_C(91), 's04_flyers', () => {
  IV_CAM = { x: 960, y: 490, z: 2.2 };
  const tS = s04_W(91, 'flyers'), in_ = s04_ui(SHOT_T0, tS - SHOT_T0), smooth = Math.sin(Math.max(0, TT - tS) * 9) * (1 - s04_u(tS, 0.8));
  ivStage(SET_police({ lights: 0.8, fg: false, act: () => {
    ivRR(930, -200, 60, 1300, 10, '#3a3e4a'); ctx.save(); ctx.globalAlpha = 0.25; ivRR(930, -200, 18, 1300, 8, '#a9b8ff'); ctx.restore();
    P_flyer(980, 330, 1.2, { ang: 0.06 }); P_flyer(940, 760, 1.2, { ang: -0.07, a: 0.9 });
    const fx = lerp(1320, 962, in_), fy = lerp(640, 545, in_);
    P_flyer(fx, fy, 1.45, { ang: lerp(0.3, -0.02, in_) });
    s04_arm(fx + 330, fy + 230, fx + 40 + smooth * 18, fy + 30, 760, 'flat', CAST.kai.col, -1);
  } }));
}, { ...s04_O, title: '"Flyers." — the MISSING flyer slapped on a post' });
{ const T0 = s04_C(91), tS = s04_W(91, 'flyers'); SFX(T0 + 0.05, 'paper', 0.7, 0.4); SFX(tS, 'thud', 0.6, 0); SFX(tS + 0.02, 'paper', 0.9, 0); SFX(tS + 0.4, 'plastic', 0.5, 0.1); }

// 092 "Eight o'clock." — Kai and Mom walk the night street with a flashlight, calling; the clock card lands on 8:00
SHOT(s04_C(92), 's04_eight', () => {
  const t0 = SHOT_T0, wK = ivWalk(t0, 700, 520, 1, 8), wM = ivWalk(t0, 470, 540, 1, 8);
  IV_CAM = { x: lerp(860, 1000, EZ.io(clamp((TT - t0) / 1.4))), y: 560, z: 1.2 };
  ivStage(SET_street({ t: 'night', act: () => {
    const hx = wK.x + 0.35 * 520, hy = GROUND - 0.38 * 520;
    ivLightPool([[hx, hy], [hx + 8, hy - 10], [hx + 520, GROUND + 30], [hx + 220, GROUND + 60]], 'rgba(255,236,190,0.22)');
    s04_man(CAST.mom, wM.x, GROUND, 540, 0.55, { ...wM.pose, hR: [0.06, -0.08] }, { eyes: 'sad', brow: 'sad', mouth: 'open' });
    s04_man(CAST.kai, wK.x, GROUND, 520, 0.6, { ...wK.pose, hR: [0.28, 0.02] }, { eyes: 'open', mouth: 'flat', look: [1, 0.2] }, { hold: { R: (x, y) => { ivRR(x - 6, y - 14, 46, 22, 6, '#2a2c34'); ivGlow(x + 44, y - 3, 70, 'rgba(255,240,200,0.8)'); } } });
  } }));
  s04_clockCard(1440, 210, 72, 7, 8, s04_W(92, 'eight'), '8:00', 'PM');
}, { ...s04_O, title: '8:00 PM — searching the street' });
{ const T0 = s04_C(92), tE = s04_W(92, 'eight'); SFX(T0 + 0.05, 'click', 0.5, 0); SFX(T0 + 0.4, 'step', 0.35, -0.2); SFX(tE, 'tick', 0.8, 0.5); SFX(tE + 0.3, 'whoosh', 0.35, 0.5); }

// 093 "Ten." — his phone's lock screen in the dark: 9:59 flips to 10:00, "No new messages"
function s04_lock(w, h, time) {
  ctx.fillStyle = ivVGrad(0, h, ['#1a2240', '#2a2050', '#0e1020']); ctx.fillRect(0, 0, w, h);
  ivGlow(w * 0.7, h * 0.3, 300, 'rgba(120,140,255,0.25)');
  ivText('Saturday, October 18', w / 2, 120, 22, 'rgba(235,240,255,0.8)', { font: IV.sans, weight: 600 });
  ivText(time, w / 2, 230, 104, '#f4f6ff', { font: IV.sans, weight: 300 });
  ivRR(24, 300, w - 48, 92, 22, 'rgba(255,255,255,0.14)'); ivText('Messages', 46, 334, 17, 'rgba(255,255,255,0.75)', { align: 'left', font: IV.sans, weight: 700 });
  ivText('No new messages', 46, 368, 20, '#ffffff', { align: 'left', font: IV.sans, weight: 600 });
  ivRR(24, 404, w - 48, 92, 22, 'rgba(255,255,255,0.10)'); ivText('Missed call — MOM (4)', 46, 452, 19, 'rgba(255,255,255,0.8)', { align: 'left', font: IV.sans, weight: 600 });
}
SHOT(s04_C(93), 's04_ten', () => {
  IV_CAM = { x: 980, y: 560, z: 2.0 * ivPush(SHOT_T0, 0.04, 1.2) };
  const tT = s04_W(93, 'ten');
  ivStage(SET_street({ t: 'night', fg: false, act: () => {
    const px = 960, py = 560;
    ivPhoneHold(px, py, 160, 330, -0.05, () => P_phone(px, py, 4.4, { ang: -0.05, screen: (w, h) => s04_lock(w, h, TT < tT ? '9:59' : '10:00') }), { sleeve: CAST.kai.col, side: 1 });
  } }));
  ivTag('10:00 PM', 1450, 210, 34, ivPop(tT));
}, { ...s04_O, title: '10:00 PM — lock screen, no new messages' });
{ const T0 = s04_C(93), tT = s04_W(93, 'ten'); SFX(T0 + 0.05, 'click', 0.5, 0); SFX(tT, 'tick', 0.7, 0.3); }

// 094 "Midnight." — the hall again: Lily's door wide open on an empty room, and Pickles' blanket is empty too;
// Kai sits on the floor against the wall
SHOT(s04_C(94), 's04_midnight', () => {
  const [sx, sy] = s04_spot();
  s04_mv(SHOT_T0, SHOT_T0 + 1.6, [900, 580, 1.15], [860, 690, 1.4]);
  ivStage(SET_hall({ door: 0.9, act: () => {
    ivCastShadow(1150, GROUND, 360, { a: 0.3 });
    ivMan({ who: CAST.kai, x: 1150, y: GROUND, h: 520, f: -0.5, pose: ivPose('slump', { dip: 0.4, fL: [0.3, 0.05], fR: [0.34, 0.05], hL: [0.18, 0.22], hR: [0.22, 0.22], lean: 0.3 }), expr: { eyes: 'sad', mouth: 'flat', look: [-1, 0.6] } });
    void sx; void sy;
  } }));
  s04_clockCard(1440, 210, 72, 10, 12, s04_W(94, 'midnight'), '12:00', 'MIDNIGHT');
}, { ...s04_O, title: 'MIDNIGHT — open door, empty blanket' });
{ const tM = s04_W(94, 'midnight'); SFX(s04_C(94) + 0.05, 'tick', 0.35, 0.5); SFX(tM, 'tick', 0.8, 0.5); }

// 095 "Nothing." [BEAT] — the empty night street; a flyer flutters on a lamp post; behind the windows, cats watch
SHOT(s04_C(95), 's04_nothing', () => {
  s04_mv(SHOT_T0, SHOT_T0 + 3.8, [960, 560, 1.0], [880, 520, 1.38]);
  const keep = ext_person; ext_person = () => {};   // nobody on the street tonight (the set's passers-by are skipped)
  try { ivStage(SET_street({ t: 'night', cats: true, act: () => {
    P_streetLamp(1340, GROUND, 1, { dir: -1, cone: 520 });
    P_flyer(1352, 560, 0.9, { ang: 0.05 + Math.sin(TT * 3.1) * 0.06 + Math.sin(TT * 7.3) * 0.02 });
  } })); } finally { ext_person = keep; }
}, { ...s04_O, title: '"Nothing." — the empty street, cats in the windows' });
{ const T0 = s04_C(95); SFX(T0 + 0.05, 'whoosh', 0.3, -0.3); SFX(T0 + 1.4, 'paper', 0.35, 0.5); SFX(T0 + 2.6, 'whoosh', 0.25, 0.4); }
