// =====================================================================
//  s02 — PLUS (lines 017–042): the small stuff. Phone catch, gym duck, pop quiz, rock-paper-scissors,
//  the claw machine, the Wall Street cable, fourteen dollars. Every shot carries the small gold "+" (top-left).
// =====================================================================
const s02_R = (lt, a, d) => EZ.o3(clamp((lt - a) / d));            // a fast gesture ramp that stops hard
const s02_L = (id) => LT(id) - SHOT_T0;                              // a line start, in shot time
const s02_W = (id, w, n = 1) => VW(id, w, n) - SHOT_T0;              // a word start, in shot time
const s02_WE = (id, w, n = 1) => VWE(id, w, n) - SHOT_T0;
function s02_scr(fn) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); fn(); ctx.restore(); }
// the gold "+" badge, top-left inside the bars (the original's ⊕)
function s02_plus(a = 1) {
  s02_scr(() => {
    ctx.globalAlpha *= a; const x = 104, y = 128, r = 34;
    ivGlow(x, y, 90, 'rgba(255,190,80,0.35)');
    ivDot(x, y, r, 'rgba(20,14,10,0.78)'); ctx.beginPath(); ctx.arc(x, y, r - 3, 0, TAU); ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = 4; ctx.stroke();
    ivLine(x - 15, y, x + 15, y, 8, '#ffd66a'); ivLine(x, y - 15, x, y + 15, 8, '#ffd66a');
  });
}
// a close-up forearm + 5-finger glove from (x0, y0) (off frame) to the wrist (x1, y1), in the current transform.
// h = the size of the person it belongs to (hand ≈ 0.1 h). o.under(x, y, ang) draws what the hand holds (under the fingers)
function s02_arm(x0, y0, x1, y1, h, grip, col, o = {}) {
  const lw = IV_J.lw * h, sw = 1.75 * lw, rw = Math.max(2.5, h * 0.0016), k = IV_M.key, ang = Math.atan2(y1 - y0, x1 - x0), s = o.s ?? 1;
  const pass = (rim) => {
    const C = (c) => (rim ? IV_M.rim : c), Wd = (w) => w + (rim ? rw * 2 : 0);
    ctx.save(); if (rim) ctx.translate(k[0] * rw, k[1] * rw);
    ivLine(x0, y0, x1, y1, Wd(lw), C(IV.ink));
    if (col) { const c = o.cuff ?? 0.82; ivLine(x0, y0, lerp(x0, x1, c), lerp(y0, y1, c), Wd(sw), C(col)); if (!rim) ivLine(lerp(x0, x1, c - 0.04), lerp(y0, y1, c - 0.04), lerp(x0, x1, c), lerp(y0, y1, c), sw, ivShade(col, -0.25), 'butt'); }
    ivHand(x1, y1, ang, h, 'glove', grip, C, Wd, s);
    ctx.restore();
  };
  pass(true); if (o.under) o.under(x1, y1, ang); pass(false);
}
// a soft macro background for an insert: a set's layers, camera close on a point, focus pulled to the foreground
function s02_macro(layers, x, y, z = 3) { IV_CAM = { x, y, z }; IV_FOCUS = 0.45; ivStage(layers); IV_FOCUS = 1; }
// a phone lying on the ground, cracked (for the ghost)
function s02_crackedPhone(x, y, s) {
  P_phone(x, y, s, { ang: 1.45, screen: (w, h) => { ctx.fillStyle = '#10131c'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e8f2ff'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(w * 0.55, h * 0.4); ctx.lineTo(w * 0.1, h * 0.15); ctx.moveTo(w * 0.55, h * 0.4); ctx.lineTo(w * 0.95, h * 0.2);
      ctx.moveTo(w * 0.55, h * 0.4); ctx.lineTo(w * 0.3, h * 0.9); ctx.moveTo(w * 0.55, h * 0.4); ctx.lineTo(w * 0.9, h * 0.75); ctx.moveTo(w * 0.35, h * 0.28); ctx.lineTo(w * 0.2, h * 0.5); ctx.stroke(); } });
}
const s02_std = (who, x, f, h, pose, expr, o = {}) => ivMan({ who, x, y: o.y ?? GROUND, h, f, pose: pose || ivPose('relaxed'), expr: expr || { eyes: 'open', mouth: 'flat' }, ...o });

// ---------------------------------------------------------------------
//  017 "Plus." — the badge as a title card
// ---------------------------------------------------------------------
SHOT(CUT('017-narrator'), 's02_plus', (lt) => {
  IV_CAM = { x: 960, y: 540, z: 1 + 0.03 * s02_R(lt, 0, 1.6) };
  ivStage(SET_void({ mood: 'sunset', col: '#ffc860', act: () => {
    const u = s02_R(lt, 0.05, 0.25), sc = 0.6 + 0.4 * EZ.back(u);
    ctx.save(); ctx.translate(960, 470); ctx.rotate((1 - u) * -0.6); ctx.scale(sc, sc); ctx.globalAlpha = clamp(u * 3);
    ivGlow(0, 0, 420, 'rgba(255,190,80,0.45)');
    ivDot(0, 0, 190, 'rgba(26,18,12,0.85)'); ctx.beginPath(); ctx.arc(0, 0, 176, 0, TAU); ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = 14; ctx.stroke();
    ivLine(-90, 0, 90, 0, 44, '#ffd66a'); ivLine(0, -90, 0, 90, 44, '#ffd66a'); ctx.restore();
    ivText('PLUS', 960, 790, 72, '#ffe2b0', { glow: 'rgba(255,160,70,0.7)', track: 14 });
    // the three little things it is about, orbiting small (phone, ball, plush)
    const r = 300, sp = lt * 0.5;
    [[0, (x, y) => P_phone(x, y, 1.6, { screen: (w, h) => P_phoneUI.bank(w, h, {}) })], [2.1, (x, y) => P_basketball(x, y + 36, 1, { air: true })], [4.2, (x, y) => P_plush(x, y + 30, 1.1, 'bear')]].forEach(([a0, fn]) => {
      const a = a0 + sp; ctx.save(); ctx.globalAlpha = s02_R(lt, 0.3 + a0 * 0.05, 0.2); fn(960 + Math.cos(a) * r * 1.5, 470 + Math.sin(a) * r * 0.55); ctx.restore(); });
  } }));
}, { sec: 's02', title: 'PLUS — the gold + badge' });

// ---------------------------------------------------------------------
//  018 "The small stuff." — walking down the street, the phone riding loose in the hoodie pocket
// ---------------------------------------------------------------------
SHOT(CUT('018-narrator'), 's02_walk', (lt, S) => {
  IV_CAM = { x: 960, y: 560, z: 1.12 * ivPush(S.t0, 0.03, 1.8) };
  ivStage(SET_street({ t: 'day', door: 0, act: () => {
    const wY = ivWalk(S.t0, 380, 520, 1, 6), wN = ivWalk(S.t0 + 2 / FPS, 140, 500, 1, 6);
    s02_std(CAST.nia, wN.x, 0.6, 500, wN.pose, { eyes: 'open', mouth: 'smile', look: [1, 0] });
    const m = s02_std(CAST.you, wY.x, 0.5, 520, wY.pose, { eyes: 'squint', mouth: 'smirk' });
    // the phone poking out of the pocket, sliding out a little more each step
    const p = m.hip, out = lt * 6;
    P_phone(p[0] + 14, p[1] - 30 - out, 1.1, { ang: 0.25 + lt * 0.05, back: true });
  } }));
  s02_plus();
}, { sec: 's02', title: 'the small stuff — walking, phone loose in the pocket' });

// ---------------------------------------------------------------------
//  019 "Your phone!" — Nia points; the phone slips; in the ghost it lies cracked on the pavement
// ---------------------------------------------------------------------
SHOT(CUT('019-nia'), 's02_niaPhone', (lt) => {
  IV_CAM = { x: 1000, y: 650, z: 1.8 };
  const fall = s02_R(lt, 0.15, 0.6);
  ivStage(SET_street({ t: 'day', act: () => {
    ivGhost(() => s02_crackedPhone(800, 902, 1.5), 0.85);
    const m = s02_std(CAST.you, 720, 0.55, 520, ivPose('relaxed'), { eyes: 'open', mouth: 'flat', look: [1, 0] });
    const p = m.hip;
    P_phone(p[0] + 16 + fall * 40, lerp(p[1] - 30, 830, EZ.i2(clamp((lt - 0.15) / 0.75))), 1.1, { ang: 0.25 + fall * 2.2, back: true });
    const u = s02_R(lt, 0.02, 0.2);
    s02_std(CAST.nia, 1230, -0.5, 500, ivPoseMix(ivPose('relaxed'), ivPose('point', { hR: [0.3, 0.12], lean: 0.06 }), u),
      { eyes: 'wide', mouth: 'o', brow: 'up', look: [-1, 0.6] }, { talk: '019-nia', grip: { front: 'point' } });
  } }));
  s02_plus();
}, { sec: 's02', title: '"Your phone!" — Nia points, ghost: phone cracked on the ground' });

// ---------------------------------------------------------------------
//  020 "Got it." — hand close-up: the catch, a hand-width above the ghost's cracked phone
// ---------------------------------------------------------------------
SHOT(VWE('019-nia', 'phone') - 2 / FPS, 's02_catch', (lt) => {
  s02_macro(SET_street({ t: 'day', fg: false }), 820, 890, 3);
  const tc = s02_W('020-you', 'got'), c = clamp(lt / Math.max(0.1, tc));      // the phone falls until "got"
  const py = lt < tc ? lerp(260, 640, EZ.i2(c)) : 640 + 18 * Math.sin(Math.min(1, (lt - tc) * 8) * Math.PI) * Math.exp(-(lt - tc) * 6);
  const pa = lt < tc ? lerp(0.4, 1.3, c) : 1.3;
  s02_scr(() => {
    ivGhost(() => s02_crackedPhone(860, 930, 7), 0.8);
    const hu = s02_R(lt, tc - 0.22, 0.2), hx = lerp(1700, 1135, hu), hy = lerp(980, 700, hu);
    const ph = (x, y) => P_phone(x, y, 4.2, { ang: pa, back: true });
    if (lt < tc) ph(1040, py);
    s02_arm(hx + 900, hy + 380, hx, hy, 5200, lt < tc ? 'open' : 'hold', CAST.you.col, { s: -1, under: lt >= tc ? () => ph(1040, py) : null });
  });
  s02_plus();
}, { sec: 's02', title: '"Got it." — hand close-up, the catch over the ghost crack' });

// ---------------------------------------------------------------------
//  020 cont. — your face, smug, the phone already back in your hand
// ---------------------------------------------------------------------
SHOT(CUT('020-you', 'it'), 's02_gotIt', () => {
  IV_CAM = { x: 760, y: 480, z: 2.7 };
  ivStage(SET_street({ t: 'day', act: () => {
    s02_std(CAST.nia, 1230, -0.5, 500, ivPose('point', { hR: [0.3, 0.12] }), { eyes: 'wide', mouth: 'o' });
    s02_std(CAST.you, 720, 0.4, 520, ivPose('phone', { hR: [0.14, 0.02] }), { eyes: 'squint', mouth: 'smirk' },
      { talk: '020-you', grip: { front: 'hold' }, hold: { front: (x, y, a) => P_phone(x + 6, y - 14, 1.2, { ang: -0.3, back: true }) } });
  } }));
  s02_plus();
}, { sec: 's02', title: '"Got it." — your smug face' });

// ---------------------------------------------------------------------
//  021 "Heads up!" — the gym: coach yells, a ball flies in; its ghost is already on your head; you start to duck
// ---------------------------------------------------------------------
SHOT(CUT('021-coach'), 's02_headsUp', (lt, S) => {
  IV_CAM = { x: 960, y: 540, z: 1.05 * ivPush(S.t0, 0.03, 1.6) };
  const dur = S.t1 - S.t0, du = s02_R(lt, s02_W('021-coach', 'up') - 0.05, 0.2);
  ivStage(SET_gym({ act: () => {
    const u = s02_R(lt, 0, 0.18);
    s02_std(CAST.coach, 420, 0.55, 540, ivPoseMix(ivPose('relaxed'), ivPose('point', { hR: [0.3, -0.14] }), u), { eyes: 'wide', mouth: 'open', brow: 'up' }, { talk: '021-coach', grip: { front: 'point' } });
    // ghost: ten seconds on, the ball bounces off your head
    ivGhost(() => { ivMan({ who: CAST.you, x: 1380, y: GROUND, h: 520, f: -0.4, pose: ivPose('relaxed', { tilt: 0.25, lean: -0.08 }), expr: { eyes: 'closed', mouth: 'o' } }); P_basketball(1330, 420, 1.2, { air: true }); }, 0.6);
    s02_std(CAST.you, 1380, -0.4, 520, ivPoseMix(ivPose('relaxed'), ivPose('duck'), du), { eyes: 'squint', mouth: 'flat', look: [-1, -0.3] });
    const bu = clamp(lt / Math.max(0.3, dur));
    P_basketball(lerp(620, 1080, bu), lerp(330, 420, bu) - Math.sin(bu * Math.PI) * 40, 1.2, { air: true, rot: lt * 9 });
  } }));
  s02_plus();
}, { sec: 's02', title: '"Heads up!" — ball flying, ghost: it hits you' });

// ---------------------------------------------------------------------
//  022 "Already up." — ducked, deadpan, the ball sails over your head
// ---------------------------------------------------------------------
SHOT(CUT('022-you'), 's02_duck', (lt, S) => {
  IV_CAM = { x: 1330, y: 640, z: 1.8 };
  const dur = S.t1 - S.t0;
  ivStage(SET_gym({ act: () => {
    s02_std(CAST.you, 1380, -0.4, 520, ivPose('duck'), { eyes: 'squint', mouth: 'smirk', look: [-1, -0.5] }, { talk: '022-you' });
    const bu = clamp(lt / Math.max(0.3, dur * 0.8));
    P_basketball(lerp(850, 1900, bu), 470 - Math.sin(bu * Math.PI) * 25, 1.2, { air: true, rot: lt * 9 });
  } }));
  s02_plus();
}, { sec: 's02', title: '"Already up." — ducked, the ball goes over' });

// ---------------------------------------------------------------------
//  023 "Pop quiz." — the classroom wide, POP QUIZ on the board, the teacher with the stack of sheets
// ---------------------------------------------------------------------
const s02_class = (o = {}) => {
  const C = SET_POS.classroom.seats;
  ivMan({ who: CAST.kidA, x: C[0], y: GROUND, h: 500, f: 0.55, pose: ivPose('sitDesk'), expr: { eyes: o.stare ? 'wide' : 'open', mouth: o.stare ? 'o' : 'flat', look: o.stare ? [1, 0] : [1, -0.3] }, blinkKey: 'c0' });
  ivMan({ who: CAST.nia, x: C[1], y: GROUND, h: 500, f: o.stare ? 0.75 : 0.55, pose: ivPose('sitDesk'), expr: o.nia || { eyes: 'tired', mouth: 'flat', look: [1, 0] } });
  ivMan({ who: CAST.you, x: C[2], y: GROUND, h: 520, f: 0.55, pose: o.youPose || ivPose('sitDesk'), expr: o.you || { eyes: 'squint', mouth: 'smirk' }, talk: o.youTalk, grip: o.youGrip });
};
SHOT(CUT('023-narrator'), 's02_quizWide', (lt, S) => {
  IV_CAM = { x: 960, y: 540, z: ivPush(S.t0, 0.03, 1.8) };
  ivStage(SET_classroom({ act: () => {
    s02_class();
    const u = s02_R(lt, s02_W('023-narrator', 'quiz') - 0.1, 0.2);
    s02_std(CAST.teacher, 1500, lerp(0.6, -0.5, u), 540, ivPose('handOut', { hR: [0.2, 0.06] }), { eyes: 'open', mouth: 'smile' },
      { grip: { front: 'hold' }, hold: { front: (x, y) => { for (let k = 0; k < 4; k++) P_quiz(x + 8, y - 14 - k * 3, 0.9, { ang: 0.05 * k }); } } });
  } }));
  s02_plus();
}, { sec: 's02', title: 'Pop quiz — classroom wide' });

// ---------------------------------------------------------------------
//  024a "You know who gets picked," — the teacher scanning the room; her ghost already points at you
// ---------------------------------------------------------------------
SHOT(CUT('024-narrator'), 's02_picked', () => {
  IV_CAM = { x: 1250, y: 560, z: 1.8 };
  ivStage(SET_classroom({ act: () => {
    s02_class({ you: { eyes: 'squint', mouth: 'flat', look: [1, -0.2] } });
    ivGhost(() => ivMan({ who: CAST.teacher, x: 1240, y: GROUND, h: 540, f: -0.6, pose: ivPose('point', { hR: [0.32, -0.02] }), expr: { eyes: 'open', mouth: 'open', brow: 'up' }, grip: { front: 'point' } }), 0.6);
    s02_std(CAST.teacher, 1500, -0.3, 540, ivPose('relaxed', { hR: [0.12, 0.12] }), { eyes: 'squint', mouth: 'flat', look: [-1, 0] });
  } }));
  s02_plus();
}, { sec: 's02', title: 'who gets picked — ghost teacher points at you' });

// ---------------------------------------------------------------------
//  024b "and you know the answer." — insert: your quiz sheet; the answer is already there, in the ghost
// ---------------------------------------------------------------------
SHOT(CUT('024-narrator', 'and'), 's02_answer', (lt) => {
  s02_macro(SET_classroom({ fg: false }), 960, 700, 3);
  s02_scr(() => {
    ctx.fillStyle = 'rgba(120,96,70,0.55)'; ctx.fillRect(0, 760, W, 400);                        // the desk top, close
    P_quiz(900, 560, 7.4, { ang: -0.06, name: 'THEO' });
    const ga = s02_R(lt, 0.2, 0.15) * (0.85 + 0.15 * Math.sin(lt * 23));
    if (ga > 0) { ctx.save(); ctx.translate(900, 560); ctx.rotate(-0.06); ctx.scale(7.4, 7.4); ctx.translate(-40, -52); ctx.globalAlpha = ga;
      ivText('PHOTOSYNTHESIS', 20, 41.4, 7.2, IV.ghostDeep, { align: 'left', font: '"Marker Felt", "Comic Sans MS", cursive', weight: 400, glow: 'rgba(80,220,255,0.9)' }); ctx.restore(); }
    const tap = Math.max(0, Math.sin(lt * 9)) * 14 * (lt > 0.5 ? 1 : 0);
    s02_arm(2100, 1250, 1430, 690 - tap, 5000, 'point', CAST.you.col, { s: -1 });
  });
  s02_plus();
}, { sec: 's02', title: 'insert — quiz sheet, the ghost answer already written' });

// ---------------------------------------------------------------------
//  025 "Theo?" — the teacher turns and points
// ---------------------------------------------------------------------
SHOT(CUT('025-teacher'), 's02_theo', (lt) => {
  IV_CAM = { x: 1430, y: 470, z: 2.6 };
  const u = s02_R(lt, 0.06, 0.2);
  ivStage(SET_classroom({ act: () => {
    s02_class();
    s02_std(CAST.teacher, 1500, lerp(-0.2, -0.6, u), 540, ivPoseMix(ivPose('relaxed'), ivPose('point', { hR: [0.3, 0.0] }), u), { eyes: 'open', mouth: 'flat', brow: 'up', look: [-1, 0] }, { talk: '025-teacher', grip: { front: 'point' } });
  } }));
  s02_plus();
}, { sec: 's02', title: '"Theo?" — the teacher points' });

// ---------------------------------------------------------------------
//  026 "Photosynthesis." — you, hand already up, smug
// ---------------------------------------------------------------------
SHOT(CUT('026-you'), 's02_photo', () => {
  IV_CAM = { x: 860, y: 500, z: 2.6 };
  ivStage(SET_classroom({ act: () => s02_class({ youPose: ivPose('sitDesk', { hR: [0.12, -0.3], hL: [0.22, 0.17] }), you: { eyes: 'squint', mouth: 'smirk' }, youTalk: '026-you' }) }));
  s02_plus();
}, { sec: 's02', title: '"Photosynthesis." — hand already up' });

// ---------------------------------------------------------------------
//  027 "I haven't asked yet." — her flat face; then the class turns to stare
// ---------------------------------------------------------------------
SHOT(CUT('027-teacher'), 's02_notYet', () => {
  IV_CAM = { x: 1500, y: 470, z: 2.9 };
  ivStage(SET_classroom({ act: () => {
    s02_class();
    s02_std(CAST.teacher, 1500, -0.25, 540, ivPose('arms'), { eyes: 'tired', mouth: 'flat', look: [-1, 0] }, { talk: '027-teacher' });
  } }));
  s02_plus();
}, { sec: 's02', title: '"I haven\'t asked yet." — flat face' });
SHOT(CUT('027-teacher', 'yet'), 's02_stare', () => {
  IV_CAM = { x: 820, y: 560, z: 1.25 };
  ivStage(SET_classroom({ act: () => {
    s02_class({ stare: true, nia: { eyes: 'tired', mouth: 'flat', look: [1, 0] }, youPose: ivPose('sitDesk', { hR: [0.12, -0.3], hL: [0.22, 0.17] }), you: { eyes: 'open', mouth: 'smile' } });
    s02_std(CAST.teacher, 1500, -0.3, 540, ivPose('arms'), { eyes: 'tired', mouth: 'flat', look: [-1, 0] }, { talk: '027-teacher' });
  } }));
  s02_plus();
}, { sec: 's02', title: 'the class stares at you' });

// ---------------------------------------------------------------------
//  028 "Rock, paper, scissors with Nia." — the lunch table, both fists pumping on the words
// ---------------------------------------------------------------------
const s02_pump = (lt, ts) => { let b = 0; for (const t of ts) { const k = (lt - t) / 0.22; if (k >= 0 && k < 1) b = Math.max(b, Math.sin(k * Math.PI)); } return b; };
const s02_pile = (x, y, n, s = 1) => {   // a heap of plushies held against the chest (bottom-centre x, y)
  const kinds = ['bear', 'bunny', 'star', 'cat', 'duck', 'dino'], r = RNG('s02pile').f;
  for (let i = 0; i < n; i++) { const row = Math.floor(i / 4), col = i % 4 - 1.5 + (row % 2) * 0.5; P_plush(x + col * 46 * s + (r() - 0.5) * 10 * s, y - row * 42 * s, s, kinds[i % 6], { ang: (r() - 0.5) * 0.6 }); }
};
SHOT(CUT('028-narrator'), 's02_rps', (lt, S) => {
  IV_CAM = { x: 990, y: 560, z: 1.25 * ivPush(S.t0, 0.03, 1.8) };
  const b = s02_pump(lt, [s02_W('028-narrator', 'rock'), s02_W('028-narrator', 'paper'), s02_W('028-narrator', 'scissors')]);
  const P = SET_POS.cafeteria;
  ivStage(SET_cafeteria({ act: () => {
    ivMan({ who: CAST.you, x: P.seatL, y: GROUND, h: 520, f: 0.55, pose: ivPose('sitDesk', { hR: [0.3, -0.02 - 0.09 * b] }), expr: { eyes: 'squint', mouth: 'smirk', look: [1, 0] }, grip: { front: 'fist' } });
    ivMan({ who: CAST.nia, x: P.seatR, y: GROUND, h: 500, f: -0.55, pose: ivPose('sitDesk', { hR: [0.3, -0.02 - 0.09 * b] }), expr: { eyes: 'angry', mouth: 'flat', look: [-1, 0] }, grip: { front: 'fist' } });
  } }));
  s02_plus();
}, { sec: 's02', title: 'rock, paper, scissors — fists pumping at lunch' });

// ---------------------------------------------------------------------
//  029 "Fifty rounds." — hand close-up: her ghost already shows paper; your fist turns to scissors before she opens
// ---------------------------------------------------------------------
function s02_rpsArm(wx, wy, dir, shape, col, s = 6.2) {
  const x0 = wx - dir * 900, y0 = wy + 420, lw = 30 * s * 0.32;
  ivLine(x0, y0, wx - dir * 20, wy, lw + 8, IV_M.rim); ivLine(x0, y0, wx - dir * 20, wy, lw, IV.ink);
  ivLine(x0, y0, wx - dir * 70, wy + 12, lw * 1.9 + 8, IV_M.rim); ivLine(x0, y0, wx - dir * 70, wy + 12, lw * 1.9, col);
  P_rpsHand(wx, wy, s, shape, { ang: dir * Math.PI / 2, flip: dir < 0, sleeve: col });
}
SHOT(CUT('029-narrator'), 's02_hands', (lt, S) => {
  s02_macro(SET_cafeteria({ fg: false }), 990, 720, 3);
  const dur = S.t1 - S.t0, tw = dur * 0.42, tn = dur * 0.55;     // you switch first, she opens after
  const b = s02_pump(lt, [0, 0.3, 0.6].map((k) => k * tw / 0.6)), bob = -50 * b;
  s02_scr(() => {
    ivGhost(() => s02_rpsArm(1420, 520, -1, 'paper', CAST.nia.col), 0.75);
    s02_rpsArm(1450, 540 + bob, -1, lt < tn ? 'rock' : 'paper', CAST.nia.col);
    s02_rpsArm(470, 540 + bob, 1, lt < tw ? 'rock' : 'scissors', CAST.you.col);
    const n = ivCount(S.t0, VWE('029-narrator', 'fifty'), 1, 50);
    ivTag('ROUND ' + n, 960, 190, 40, ivPop(S.t0));
  });
  s02_plus();
}, { sec: 's02', title: 'RPS hands — ghost paper, you switch to scissors; ROUND 50' });

// ---------------------------------------------------------------------
//  030 "Fifty wins." — you, smug; the score lands 50 – 0
// ---------------------------------------------------------------------
SHOT(CUT('030-narrator'), 's02_score', (lt, S) => {
  IV_CAM = { x: 760, y: 520, z: 2.5 };
  const P = SET_POS.cafeteria;
  ivStage(SET_cafeteria({ act: () => {
    ivMan({ who: CAST.you, x: P.seatL, y: GROUND, h: 520, f: 0.35, pose: ivPose('sitDesk', { hR: [0.14, -0.26] }), expr: { eyes: 'happy', mouth: 'grin' }, grip: { front: 'open' } });
    ivMan({ who: CAST.nia, x: P.seatR, y: GROUND, h: 500, f: -0.55, pose: ivPose('sitDesk'), expr: { eyes: 'tired', mouth: 'frown' } });
  } }));
  s02_scr(() => { const n = ivCount(S.t0 + 0.05, VWE('030-narrator', 'fifty'), 0, 50); ivTag('YOU ' + n + '  –  0 NIA', 1380, 230, 46, ivPop(S.t0)); });
  s02_plus();
}, { sec: 's02', title: 'Fifty wins — 50 – 0, smug' });

// ---------------------------------------------------------------------
//  031 "Spoiler." — Nia, deadpan close-up
// ---------------------------------------------------------------------
SHOT(CUT('031-nia'), 's02_spoiler', () => {
  IV_CAM = { x: 1270, y: 530, z: 2.8 };
  const P = SET_POS.cafeteria;
  ivStage(SET_cafeteria({ act: () => {
    ivMan({ who: CAST.you, x: P.seatL, y: GROUND, h: 520, f: 0.55, pose: ivPose('sitDesk'), expr: { eyes: 'happy', mouth: 'grin' } });
    ivMan({ who: CAST.nia, x: P.seatR, y: GROUND, h: 500, f: -0.35, pose: ivPose('arms', { dip: 0.14, seat: true, fL: [0.17, 0.3], fR: [0.21, 0.3] }), expr: { eyes: 'tired', mouth: 'flat', look: [-1, 0] }, talk: '031-nia' });
  } }));
  s02_plus();
}, { sec: 's02', title: '"Spoiler." — Nia deadpan' });

// ---------------------------------------------------------------------
//  032 "That's her word for you now." — the two-shot: she points at you, you shrug, the word hangs between them
// ---------------------------------------------------------------------
SHOT(CUT('032-narrator'), 's02_herWord', (lt, S) => {
  IV_CAM = { x: 990, y: 540, z: 1.15 * ivPush(S.t0, 0.03, 1.8) };
  const P = SET_POS.cafeteria, u = s02_R(lt, 0.1, 0.2), v = s02_R(lt, 0.5, 0.2);
  ivStage(SET_cafeteria({ act: () => {
    ivMan({ who: CAST.you, x: P.seatL, y: GROUND, h: 520, f: 0.45, pose: ivPoseMix(ivPose('sitDesk'), ivPose('shrug', { dip: 0.14, seat: true, fL: [0.17, 0.3], fR: [0.21, 0.3] }), v), expr: { eyes: 'happy', mouth: 'smile' } });
    ivMan({ who: CAST.nia, x: P.seatR, y: GROUND, h: 500, f: -0.55, pose: ivPoseMix(ivPose('sitDesk'), ivPose('sitDesk', { hR: [0.32, -0.08] }), u), expr: { eyes: 'tired', mouth: 'smirk', look: [-1, 0] }, grip: { front: 'point' } });
  } }));
  s02_scr(() => ivTag('“SPOILER.”', 1000, 250, 40, ivPop(S.t0 + 0.15)));
  s02_plus();
}, { sec: 's02', title: 'her word for you — Nia points, you shrug' });

// ---------------------------------------------------------------------
//  033 "The claw machine at the arcade." — the arcade wide; you walk up to the CLAW and stop at the controls
// ---------------------------------------------------------------------
const s02_youAtClaw = (t0, o = {}) => {   // you walking in (5 steps) and stopping at the joystick
  const steps = 5, fps = 6, x0 = 975 - steps * 520 * 0.26, until = t0 + steps * fps / FPS;
  const w = ivWalk(t0, x0, 520, 1, fps, until), moving = TT < until;
  const pose = moving ? w.pose : (o.pose || ivPose('relaxed', { hR: [0.2, 0.18] }));
  return ivMan({ who: CAST.you, x: moving ? w.x : 975, y: GROUND, h: 520, f: 0.6, pose, expr: o.expr || { eyes: 'squint', mouth: 'smirk', look: [1, -0.4] }, grip: { front: o.grip || 'hold' }, talk: o.talk });
};
SHOT(CUT('033-narrator'), 's02_arcade', (lt, S) => {
  IV_CAM = { x: 1000, y: 540, z: 1.05 * ivPush(S.t0, 0.03, 1.8) };
  ivStage(SET_arcade({ act: () => {
    s02_std(CAST.manager, 1680, -0.5, 540, ivPose('arms'), { eyes: 'tired', mouth: 'flat', look: [-1, 0] });
    s02_youAtClaw(S.t0);
  } }));
  s02_plus();
}, { sec: 's02', title: 'the claw machine — arcade wide, you walk up' });

// ---------------------------------------------------------------------
//  034 "You just wait for the ghost to grab." — inside the glass: the real claw waits; its ghost drops, grabs, lifts a bear
// ---------------------------------------------------------------------
function s02_ghostClaw(x, lt, t0) {
  const d = s02_R(lt, t0, 0.55), cl = s02_R(lt, t0 + 0.6, 0.12), up = s02_R(lt, t0 + 0.85, 0.5) * (1 - 0);
  const pile = SET_POS.arcade.pile - 30, gy = SET_POS.arcade.glass[1];
  const cy = lerp(380, pile, d) - up * (pile - 400);
  ivLine(x, gy + 18, x, cy - 8, 3, '#d0d4dc');
  if (cl > 0.5) set_plush(x, cy + 64, 1, 'bear', '#f2d06a');
  set_claw(x, cy, 1.2, lerp(0.7, 0.05, cl));
}
SHOT(CUT('034-narrator'), 's02_ghostClaw', (lt) => {
  IV_CAM = { x: 1250, y: 500, z: 2.5 };
  ivStage(SET_arcade({ claw: [1180, 380], drop: 0, open: 0.6, out: () => ivGhost(() => s02_ghostClaw(1310, lt, 0.15), 0.85) }));
  s02_scr(() => ivGlow(1180, 560, 380, 'rgba(90,230,255,0.10)'));
  s02_plus();
}, { sec: 's02', title: 'the ghost claw grabs a bear; the real one waits' });

// ---------------------------------------------------------------------
//  035 "Kid, that machine is rigged." — the manager, arms crossed
// ---------------------------------------------------------------------
SHOT(CUT('035-manager'), 's02_rigged', () => {
  IV_CAM = { x: 1640, y: 470, z: 2.7 };
  ivStage(SET_arcade({ fg: false, act: () => s02_std(CAST.manager, 1680, -0.4, 540, ivPose('arms'), { eyes: 'tired', mouth: 'flat', look: [-1, 0] }, { talk: '035-manager' }) }));
  s02_plus();
}, { sec: 's02', title: '"Kid, that machine is rigged." — manager' });

// ---------------------------------------------------------------------
//  036 "I know. Watch." — you at the controls, the ghost's cyan in your eyes
// ---------------------------------------------------------------------
SHOT(CUT('036-you'), 's02_watch', (lt) => {
  IV_CAM = { x: 1020, y: 480, z: 2.6 };
  const u = s02_R(lt, s02_W('036-you', 'watch'), 0.16);
  ivStage(SET_arcade({ claw: [1310, 380], out: () => ivGhost(() => s02_ghostClaw(1310, 0.3, 0), 0.5), act: () => {
    ivMan({ who: CAST.you, x: 975, y: GROUND, h: 520, f: 0.5, pose: ivPoseMix(ivPose('relaxed', { hR: [0.2, 0.18] }), ivPose('relaxed', { hR: [0.24, 0.08] }), u), expr: { eyes: 'squint', mouth: 'smirk', look: [1, -0.3] }, grip: { front: 'hold' }, talk: '036-you' });
  } }));
  s02_scr(() => ivGlow(1180, 420, 300, 'rgba(90,230,255,0.16)'));
  s02_plus();
}, { sec: 's02', title: '"I know. Watch." — you at the controls' });

// ---------------------------------------------------------------------
//  [BEAT 2 s] — hand close-up: your thumb slams the red button; then the chute: plushies dropping one after another
// ---------------------------------------------------------------------
SHOT(LE('036-you') - 2 / FPS, 's02_button', (lt) => {
  s02_macro(SET_arcade({ fg: false }), 1150, 760, 3);
  s02_scr(() => {
    const p = s02_R(lt, 0.25, 0.14), y = 610 + p * 40;
    ivRR(560, 690, 900, 400, 30, '#2a0f30'); ivRR(560, 690, 900, 12, 6, '#5a1f5e');
    ivDot(960, 760, 150, '#3a0e18'); ivDot(960, 752 + p * 8, 128, p > 0.5 ? '#ff6a86' : '#ff2f55'); ivGlow(960, 750, 360, `rgba(255,60,110,${0.25 + p * 0.35})`);
    ivDot(920, 712 + p * 8, 30, 'rgba(255,255,255,0.35)');
    ivLine(1330, 760, 1300, 560, 26, '#c9ccd4'); ivDot(1300, 540, 52, '#ffd23a'); ivDot(1285, 525, 14, 'rgba(255,255,255,0.5)');
    s02_arm(380, 1250, 860, y, 5200, 'fist', CAST.you.col, { s: 1 });
  });
  s02_plus();
}, { sec: 's02', title: 'BEAT — hand slams the button' });
SHOT(LE('036-you') + 0.75, 's02_cascade', (lt) => {
  IV_CAM = { x: 1180, y: 640, z: 2.1 };
  const per = 0.17, n = Math.min(11, Math.floor(lt / per) + 1), kinds = ['bear', 'bunny', 'star', 'blob'];
  const [chx, chy] = SET_POS.arcade.chute;
  ivStage(SET_arcade({ claw: [chx, 380], drop: 0.15, open: 0.9, out: () => {
    // the one falling right now, from the claw into the chute
    const k = (lt % per) / per; set_plush(chx + 5, lerp(470, chy + 40, EZ.i2(k)), 1, kinds[n % 4]);
  }, act: () => {
    for (let i = 0; i < n - 1; i++) { const r = RNG('s02cas' + i).f; P_plush(1060 + (i % 4) * 46 + r() * 16, GROUND - Math.floor(i / 4) * 34, 0.9, ['bear', 'bunny', 'star', 'cat', 'duck', 'dino'][i % 6], { ang: (r() - 0.5) * 0.8 }); }
    const k = (lt % per) / per; P_plush(1100, lerp(790, GROUND - Math.floor((n - 1) / 4) * 34, EZ.i2(k)), 0.9, ['bear', 'bunny', 'star', 'cat', 'duck', 'dino'][(n - 1) % 6]);
  } }));
  s02_plus();
}, { sec: 's02', title: 'BEAT — plushies tumble out one after another' });

// ---------------------------------------------------------------------
//  037 "Eleven plushies." — you with an armful, the 11 lands on the word
// ---------------------------------------------------------------------
SHOT(CUT('037-narrator'), 's02_eleven', (lt, S) => {
  IV_CAM = { x: 1000, y: 560, z: 1.7 };
  ivStage(SET_arcade({ act: () => {
    const m = ivMan({ who: CAST.you, x: 960, y: GROUND, h: 520, f: 0.15, pose: ivPose('hug', { hL: [0.14, 0.14], hR: [0.18, 0.12] }), expr: { eyes: 'happy', mouth: 'grin' } });
    s02_pile(m.sh[0] + 20, m.sh[1] + 195, 11, 1.25);
  } }));
  s02_scr(() => { const n = ivCount(S.t0 + 0.1, VWE('037-narrator', 'eleven'), 0, 11); ivTag(String(n), 1420, 330, 64, ivPop(S.t0 + 0.05)); });
  s02_plus();
}, { sec: 's02', title: 'Eleven plushies — armful, tag 11' });

// ---------------------------------------------------------------------
//  038 "Okay. Out." — the manager points at the EXIT; you walk out with the pile
// ---------------------------------------------------------------------
SHOT(CUT('038-manager'), 's02_out', (lt, S) => {
  IV_CAM = { x: 1000, y: 540, z: 1.1 };
  const u = s02_R(lt, s02_W('038-manager', 'out') - 0.05, 0.18), tw = VW('038-manager', 'out') + 0.1;
  ivStage(SET_arcade({ act: () => {
    ivRR(120, 330, 170, 70, 10, '#0c2a1c'); ivText('EXIT', 205, 382, 44, '#6dffb0', { glow: 'rgba(80,255,160,0.9)', track: 4 }); ivGlow(205, 365, 220, 'rgba(80,255,160,0.25)');
    const w = ivWalk(tw, 900, 520, -1, 6), go = TT >= tw;
    const m = ivMan({ who: CAST.you, x: go ? w.x : 900, y: GROUND, h: 520, f: -0.45, pose: go ? ivPose('hug', { fL: w.pose.fL, fR: w.pose.fR, bob: w.pose.bob }) : ivPose('hug'), expr: { eyes: 'happy', mouth: 'smile' } });
    s02_pile(m.sh[0] - 14, m.sh[1] + 160, 11, 1);
    s02_std(CAST.manager, 1500, -0.55, 540, ivPoseMix(ivPose('arms'), ivPose('point', { hR: [0.32, -0.1] }), u), { eyes: 'tired', mouth: 'flat', look: [-1, 0] }, { talk: '038-manager', grip: { front: 'point' } });
  } }));
  s02_plus();
}, { sec: 's02', title: '"Okay. Out." — manager points at EXIT, you leave with the pile' });

// ---------------------------------------------------------------------
//  039a "Wall Street once spent about..." — the street at night: the sign, the towers, a ticker running
// ---------------------------------------------------------------------
SHOT(CUT('039-narrator'), 's02_wallSt', (lt, S) => {
  IV_M = IV_MOOD.night; IV_CAM = { x: 960, y: 540, z: ivPush(S.t0, 0.03, 1.8) };
  ivStage([
    { d: 4, draw: () => { set_bg(ivVGrad(-200, 1000, ['#0c1430', '#24306a', '#4a4a7a'])); ivGlow(960, 820, 900, 'rgba(255,170,110,0.25)'); set_skyline('s02ws0', -900, 2900, 860, 260, 600, '#0e1430', ['#f6c06a', '#e98d4c', '#cfe0ff'], null, 0.32); } },
    { d: 2, draw: () => {
      set_skyline('s02ws1', -700, 2700, 900, 380, 760, '#151b36', ['#f6c06a', '#ffdca0'], '#1b2240', 0.45, { w0: 220, w1: 160, gx: 46, gy: 52 });
      // a glowing ticker band across a facade
      ivRR(-700, 190, 3400, 70, 0, '#05070e'); ctx.save(); ctx.beginPath(); ctx.rect(-700, 190, 3400, 70); ctx.clip();
      const items = ['DOW ▲ 0.42%', 'NASDAQ ▼ 0.18%', 'S&P ▲ 0.27%', 'AAPL ▲ 1.10%', 'OIL ▼ 0.64%', 'GOLD ▲ 0.09%'];
      let x = -700 - mod(TT * 160, 1600); for (let k = 0; k < 18; k++) { const s = items[k % items.length]; ivText(s, x, 238, 34, s.includes('▲') ? '#6dffb0' : '#ff6a6a', { align: 'left', font: IV.sans, glow: 'rgba(120,255,180,0.4)' }); x += 320; }
      ctx.restore();
    } },
    { d: 1, draw: () => {
      ctx.fillStyle = ivVGrad(880, 1100, ['#141a2e', '#0a0d18']); ctx.fillRect(-1700, 880, 5400, 600);
      for (let i = 0; i < 6; i++) { const x = mod(TT * 380 + i * 520, 3200) - 800; ivRR(x, 940, 120, 18, 6, 'rgba(255,220,160,0.25)'); }
      ivLine(1380, 900, 1380, 380, 22, '#20263a'); ctx.save(); ctx.translate(1380, 400); ctx.scale(1.7, 1.7); set_sign(0, 0, 'WALL ST', 200); set_sign(0, 46, 'BROAD ST', 200); ctx.restore(); ivGlow(1380, 450, 260, 'rgba(120,255,170,0.12)');
      set_streetlamp(420, 900, 560, true);
      [[560, 0.5, 'extraA'], [760, -0.4, 'extraC'], [1720, -0.5, 'extraB']].forEach(([x, f, k], i) => ivMan({ who: CAST[k], x: x + Math.sin(TT * 0.8 + i) * 4, y: GROUND, h: 470, f, pose: ivPose(i === 1 ? 'phone' : 'relaxed'), expr: { eyes: 'tired', mouth: 'flat' }, blinkKey: 'ws' + i }));
    } },
  ]);
  s02_plus();
}, { sec: 's02', title: 'Wall Street at night — sign, towers, ticker' });

// ---------------------------------------------------------------------
//  039b "three hundred million dollars on a cable," — the map: $300,000,000 counts and lands on "million"; the cable draws on
// ---------------------------------------------------------------------
SHOT(CUT('039-narrator', 'three'), 's02_map', (lt, S) => {
  IV_CAM = { x: 960, y: 540, z: 1 };
  const u = clamp((TT - VW('039-narrator', 'cable')) / Math.max(0.2, VW('039-narrator', 'just') - VW('039-narrator', 'cable')));
  ivStage(SET_void({ mood: 'night', floor: false, act: () => {
    P_cableMap(960, 560, 1.45, u, { money: 0, ms: 0 });
    const n = ivCount(S.t0 + 0.05, VWE('039-narrator', 'million'), 0, 300000000);
    ctx.save(); ctx.translate(960 + 40 * 1.45, 560 - 40 * 1.45); ivTag('$' + n.toLocaleString('en-US'), 0, 0, 52, ivPop(S.t0 + 0.02), { c: '#ffe2b0' }); ctx.restore();
  } }));
  s02_plus();
}, { sec: 's02', title: 'the cable map — $300,000,000 lands on "million"' });

// ---------------------------------------------------------------------
//  039c "just to be three milliseconds faster than everyone else." — a race: two pulses, the cable wins by 3 ms
// ---------------------------------------------------------------------
SHOT(CUT('039-narrator', 'just'), 's02_race', (lt, S) => {
  const tEnd = VWE('039-narrator', 'milliseconds'), k = clamp((TT - S.t0) / Math.max(0.3, tEnd - S.t0));
  ivStage(SET_void({ mood: 'night', floor: false, act: () => {
    const x0 = 360, x1 = 1560;
    [['EVERYONE ELSE', 430, '#9aa4b4', EZ.io(k) * 0.93], ['THE CABLE', 640, '#ffb35a', EZ.io(k)]].forEach(([lab, y, c, p]) => {
      ivText(lab, x0, y - 48, 36, 'rgba(255,236,214,0.75)', { align: 'left', font: IV.sans, track: 4 });
      ivRR(x0, y - 12, x1 - x0, 24, 12, 'rgba(255,255,255,0.08)'); ivRR(x0, y - 12, (x1 - x0) * p, 24, 12, c);
      const x = lerp(x0, x1, p); ivDot(x, y, 18, '#fff6e0'); ivGlow(x, y, 90, ivHex(c, 0.8));
    });
    ivLine(x1, 360, x1, 700, 4, 'rgba(255,236,214,0.5)'); ivText('NEW YORK', x1, 330, 40, '#ffe6c4', { track: 3 });
    ivText('CHICAGO', x0 - 20, 330, 40, '#ffe6c4', { track: 3, align: 'left' });
  } }));
  s02_scr(() => ivTag('3 ms', 1560, 800, 54, ivPop(tEnd - 3 / FPS), { c: '#ffe2b0' }));
  s02_plus();
}, { sec: 's02', title: 'the race — the cable wins by 3 ms' });

// ---------------------------------------------------------------------
//  040 "You're ten thousand milliseconds faster." — you on the stage, your ghost already a step ahead; 10,000 ms in cyan
// ---------------------------------------------------------------------
SHOT(CUT('040-narrator'), 's02_tenK', (lt, S) => {
  IV_CAM = { x: 960, y: 560, z: 1.3 * ivPush(S.t0, 0.03, 1.8) };
  ivStage(SET_void({ mood: 'night', col: '#7ff0ff', act: () => {
    ivGhost(() => ivMan({ who: CAST.you, x: 1180, y: GROUND, h: 520, f: 0.4, pose: ivPose('wave'), expr: { eyes: 'happy', mouth: 'grin' } }), 0.65);
    ivMan({ who: CAST.you, x: 820, y: GROUND, h: 520, f: 0.4, pose: ivPose('hips'), expr: { eyes: 'squint', mouth: 'smirk', look: [1, 0] } });
  } }));
  s02_scr(() => {
    const n = ivCount(S.t0 + 0.05, VWE('040-narrator', 'thousand'), 0, 10000);
    ivTag(n.toLocaleString('en-US') + ' ms', 1400, 260, 60, ivPop(S.t0 + 0.02), { c: '#7ff0ff', line: 'rgba(127,240,255,0.6)' });
    ivTag('3 ms', 520, 260, 34, ivPop(S.t0 + 0.02));
  });
  s02_plus();
}, { sec: 's02', title: '10,000 ms — you and your ghost a step ahead' });

// ---------------------------------------------------------------------
//  041 "You could rob Wall Street." — Nia, sunset street, scheming grin
// ---------------------------------------------------------------------
SHOT(CUT('041-nia'), 's02_rob', (lt) => {
  IV_CAM = { x: 1180, y: 480, z: 2.6 };
  const u = s02_R(lt, s02_W('041-nia', 'rob') - 0.05, 0.18);
  ivStage(SET_street({ t: 'sunset', act: () => {
    s02_std(CAST.you, 760, 0.5, 520, ivPose('relaxed'), { eyes: 'open', mouth: 'flat' });
    s02_std(CAST.nia, 1200, -0.4, 500, ivPoseMix(ivPose('relaxed'), ivPose('shrug'), u), { eyes: 'squint', mouth: 'grin', look: [-1, 0] }, { talk: '041-nia' });
  } }));
  s02_plus();
}, { sec: 's02', title: '"You could rob Wall Street." — Nia grins' });

// ---------------------------------------------------------------------
//  042 "I have fourteen dollars." — you, flat, showing the phone; then [BEAT] the bank app close: $14.00
// ---------------------------------------------------------------------
const s02_bank = (w, h) => P_phoneUI.bank(w, h, { amount: '$14.00', now: '6:42' });
SHOT(CUT('042-you'), 's02_fourteen', (lt, S) => {
  IV_CAM = { x: 800, y: 480, z: 2.6 };
  const u = s02_R(lt, 0.05, 0.2);
  ivStage(SET_street({ t: 'sunset', act: () => {
    s02_std(CAST.nia, 1200, -0.4, 500, ivPose('shrug'), { eyes: 'squint', mouth: 'grin' });
    s02_std(CAST.you, 760, 0.3, 520, ivPoseMix(ivPose('relaxed'), ivPose('phoneUp', { hR: [0.18, -0.02] }), u), { eyes: 'tired', mouth: 'flat' },
      { talk: '042-you', grip: { front: 'hold' }, hold: { front: (x, y) => P_phone(x + 10, y - 40, 2.4, { screen: s02_bank }) } });
  } }));
  s02_scr(() => ivTag('$14', 1180, 300, 44, ivPop(VW('042-you', 'fourteen'))));
  s02_plus();
}, { sec: 's02', title: '"I have fourteen dollars." — flat, phone up' });
SHOT(LE('042-you') - 2 / FPS, 's02_bankApp', () => {
  s02_macro(SET_street({ t: 'sunset', fg: false }), 900, 560, 3);
  s02_scr(() => s02_arm(1560, 1350, 1110, 930, 6000, 'hold', CAST.you.col, { s: -1, under: () => P_phone(880, 540, 10.5, { ang: -0.06, screen: s02_bank }) }));
  s02_plus();
}, { sec: 's02', title: 'BEAT — the bank app: $14.00' });
