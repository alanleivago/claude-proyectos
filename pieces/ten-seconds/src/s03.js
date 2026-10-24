// =====================================================================
//  s03 — 043–064 · MINUS: the party, the punchline, the question, the lonely wide; the accidents on the street;
//  the counter (112 / 0); "nobody ever sees the disaster". Every time comes from the voice (CUT/VW/VWE/LT/LE).
// =====================================================================
const s03_ID = {
  minus: '043-narrator', nothing: '044-narrator', hear: '045-narrator', act: '047-nia', wow: '048-you',
  laugh: '049-narrator', answer: '050-narrator', finish: '051-nia', now: '052-narrator', away: '053-narrator',
  every: '054-narrator', ball: '055-narrator', cyc: '056-narrator', ladder: '057-narrator', fix: '058-narrator',
  hey: '059-painter', sorry: '060-you', itwas: '061-narrator', fut: '062-narrator', thx: '063-narrator', dis: '064-narrator',
};
// a word that may sit in a line merged later (045 holds "…ten seconds before anyone yells it" in the final voice):
// if the word is not in the line yet, fall back to the line end + d
function s03_has(id, w, n = 1) {
  const q = w.toLowerCase().replace(/[^a-z0-9']/g, ''); let k = 0;
  for (const x of VL(id).words || []) if (x.w.toLowerCase().replace(/[^a-z0-9']/g, '') === q && ++k === n) return true;
  return false;
}
const s03_VW = (id, w, n = 1, d = 0.5) => (s03_has(id, w, n) ? VW(id, w, n) : LE(id) + d);
const s03_VWE = (id, w, n = 1, d = 0.8) => (s03_has(id, w, n) ? VWE(id, w, n) : LE(id) + d);
// a gesture ramp: 0 → 1 over d seconds from a (local shot time), fast out, hard stop
const s03_u = (lt, a, d = 5 / FPS) => EZ.o3(clamp((lt - a) / d));
const s03_O = { sec: 's03' };
const s03_shot = (t0, key, title, draw, o = {}) => SHOT(t0, 's03_' + key, draw, { ...s03_O, title, ...o });
// the hand target (pose hR / hL) that puts a standing actor's hand on world point (tx, ty)
function s03_reach(x, y, h, f, tx, ty, side = 'R', P = {}, build = 1) {
  const s = f < 0 ? -1 : 1, af = Math.abs(clamp(f, -1, 1)), lean = P.lean || 0, dip = P.dip || 0, L = 0.235 * h;
  const hip = [x + (P.dx || 0) * h, y - h * (0.45 - dip)], sh = [hip[0] + Math.sin(lean) * s * L, hip[1] - Math.cos(lean) * L];
  const sw = 0.066 * h * (1 - 0.55 * af) * build;
  const S = side === 'R' ? [sh[0] + sw * s, sh[1] - h * 0.004] : [sh[0] - sw * s, sh[1] + h * 0.004];
  return [(tx - S[0]) / (s * h), (ty - S[1]) / h];
}
// the foot target (pose fR / fL) that puts a foot on world point (tx, ty)
function s03_foot(x, y, h, f, tx, ty, side = 'R', P = {}) {
  const s = f < 0 ? -1 : 1, af = Math.abs(f), hip = [x + (P.dx || 0) * h, y - h * (0.45 - (P.dip || 0))];
  const hx = hip[0] + (side === 'R' ? 1 : -1) * 0.034 * h * s * (1 - 0.5 * af);
  return [(tx - hx) / (s * h), (ty - hip[1]) / h];
}
// the grey minus icon (top-left, screen space) on the minus beats
function s03_minus(a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= a;
  const x = 118, y = 132, r = 34;
  ivDot(x + 2, y + 4, r, 'rgba(0,0,0,0.35)'); ivDot(x, y, r, '#5f6470'); ctx.beginPath(); ctx.arc(x, y, r - 3, 0, TAU); ctx.strokeStyle = '#c9ccd4'; ctx.lineWidth = 3; ctx.stroke();
  ivRR(x - 16, y - 4, 32, 8, 4, '#eef0f4');
  ctx.restore();
}
// cyan words from the future (screen space)
function s03_ghostWord(str, x, y, size, a = 0.8) {
  ivGhost(() => ivText(str, x, y, size, '#ffffff', { track: 4 }), a);
}
// a cyan tag (the future's numbers)
const s03_cyanTag = (str, x, y, size, a) => ivTag(str, x, y, size, a, { c: IV.ghost, line: 'rgba(127,240,255,0.7)', bg: 'rgba(8,24,34,0.82)' });

// ---------------------------------------------------------------------
//  PARTY — the friends crouch behind a sofa (drawn after them), you walk in, the ghost yells first
// ---------------------------------------------------------------------
const s03_SOFA = { x0: 740, x1: 1180, top: 640 };
function s03_sofa() {
  const { x0, x1, top } = s03_SOFA;
  ivRR(x0 - 30, top + 40, 70, GROUND - top - 20, 26, '#5e3242'); ivRR(x1 - 40, top + 40, 70, GROUND - top - 20, 26, '#5e3242');
  ivRR(x0, top, x1 - x0, GROUND - top + 8, 30, '#7a4656'); ivRR(x0 - 10, GROUND - 30, x1 - x0 + 20, 40, 10, '#5e3242'); ivRR(x0 + 14, top + 10, x1 - x0 - 28, 30, 14, '#8c5466');
  ivLine(x0 + 30, top + 4, x1 - 30, top + 4, 3, 'rgba(255,214,170,0.45)');
  for (const k of [0.33, 0.66]) ivLine(lerp(x0, x1, k), top + 46, lerp(x0, x1, k), GROUND - 40, 3, 'rgba(0,0,0,0.18)');
}
const s03_HIDE = [[CAST.nia, 830, -0.35, 500], [CAST.kidB, 965, -0.3, 480], [CAST.kidD, 1095, -0.4, 490]];
const s03_crouch = ivPose('duck', { dip: 0.22, lean: 0.3, hL: [0.1, 0.05], hR: [0.16, 0.02], fL: [-0.1, 0.3], fR: [0.12, 0.3], tilt: -0.1 });
// friends: u 0 = crouched, 1 = jumped up yelling; ghost: draw them as the future
function s03_friends(u, o = {}) {
  s03_HIDE.forEach(([who, x, f, h], i) => {
    const k = clamp(u * 1.15 - i * 0.07), hop = Math.sin(Math.PI * clamp(k * 1.4)) * 34;
    const P = ivPoseMix(s03_crouch, ivPose('handsUp', { hL: [-0.2, -0.24], hR: [0.2, -0.26], dip: 0, lean: 0, tilt: 0 }), k);
    ivMan({ who, x, y: GROUND - hop, h, f, pose: P, ghost: o.ghost, ghostA: o.ghostA ?? 0.55, blinkKey: 'hid' + i,
      expr: k > 0.5 ? { eyes: 'happy', mouth: 'grin' } : { eyes: i === 0 ? 'squint' : 'open', mouth: i === 1 ? 'o' : 'smirk', look: [-1, 0] },
      grip: k > 0.5 ? { front: 'open', back: 'open' } : (i === 1 ? { front: 'point' } : {}) });
  });
}
const s03_THEO_PARTY = 495;

// 043 "Minus." — the card: a big grey minus, you with arms crossed
s03_shot(CUT(s03_ID.minus), 'minus', 'MINUS card', (lt, S) => {
  IV_CAM = { x: 960, y: 540, z: 1.05 * ivPush(S.t0, 0.03, 1.6) };
  ivStage(SET_void({ mood: 'office', col: '#c9ccd4', act: () => {
    ivMan({ who: CAST.you, x: 1240, y: GROUND, h: 540, f: -0.25, pose: ivPose('arms'), expr: { eyes: 'tired', mouth: 'flat', look: [-1, 0] } });
  } }));
  const a = ivPop(VW(s03_ID.minus, 'Minus'));
  ctx.save(); ctx.globalAlpha = a; const sc = 0.85 + 0.15 * EZ.back(a);
  ctx.translate(700, 440); ctx.scale(sc, sc);
  ivGlow(0, 0, 320, 'rgba(200,205,215,0.18)'); ivDot(0, 8, 150, 'rgba(0,0,0,0.35)'); ivDot(0, 0, 150, '#4c505c');
  ctx.beginPath(); ctx.arc(0, 0, 138, 0, TAU); ctx.strokeStyle = '#c9ccd4'; ctx.lineWidth = 8; ctx.stroke();
  ivRR(-78, -15, 156, 30, 15, '#eef0f4');
  ivText('MINUS', 0, 245, 62, '#ffe6c4', { glow: 'rgba(255,170,90,0.5)', track: 8 });
  ctx.restore();
});

// 044 "Nothing surprises you." — wide: you walk in; three heads peek over the sofa
s03_shot(CUT(s03_ID.nothing), 'party-walkin', 'party wide: you walk in, friends hiding', (lt, S) => {
  IV_CAM = { x: 960, y: 540, z: 1.0 * ivPush(S.t0, 0.03, 1.8) };
  const stop = S.t0 + 0.95, w = ivWalk(S.t0, -120, 520, 1, 5, stop);
  const P = w.moving ? w.pose : ivPoseMix(w.pose, ivPose('stand'), s03_u(TT - stop, 0, 4 / FPS));
  ivStage(SET_party({ act: () => {
    s03_friends(0); s03_sofa();
    ivMan({ who: CAST.you, x: w.x, y: GROUND, h: 520, f: 0.55, pose: P, expr: { eyes: 'tired', mouth: 'flat', look: [1, 0] } });
  } }));
  s03_minus();
});

// 045 "You hear 'Surprise!' ten seconds before anyone yells it." — the ghost friends jump out; the real ones still hide
s03_shot(CUT(s03_ID.hear), 'party-ghost', 'ghost: SURPRISE! 10 s early, real friends still hiding', (lt, S) => {
  IV_CAM = { x: 830, y: 520, z: 1.45 };
  ivStage(SET_party({ act: () => {
    s03_friends(0);
    s03_friends(1, { ghost: true, ghostA: 0.6 });
    s03_sofa();
    ivMan({ who: CAST.you, x: s03_THEO_PARTY, y: GROUND, h: 520, f: 0.5, pose: ivPose('relaxed'), expr: { eyes: 'tired', mouth: 'flat', look: [1, 0] } });
  } }));
  const tS = s03_VW(s03_ID.hear, 'Surprise', 1, 0);
  const a = ivPop(tS), sc = 0.85 + 0.15 * EZ.back(a);
  if (a > 0) { ctx.save(); ctx.translate(1080, 205); ctx.scale(sc, sc); s03_ghostWord('SURPRISE!', 0, 0, 104, 0.85 * a); ctx.restore(); }
  s03_cyanTag('10 s EARLY', 1520, 330, 34, ivPop(s03_VWE(s03_ID.hear, 'seconds', 1, 0.75) - 3 / FPS));
  s03_minus();
});

// … "before anyone yells it." — the real SURPRISE! — you stand there, flat
s03_shot(s03_VW(s03_ID.hear, 'yells', 1, 1.55) - 3 / FPS, 'party-real', 'the real SURPRISE!, you flat-faced', (lt, S) => {
  IV_CAM = { x: 900, y: 540, z: 1.12 };
  const u = s03_u(lt, 0.08, 6 / FPS);
  ivStage(SET_party({ cheer: u > 0.5, act: () => {
    s03_friends(u); s03_sofa();
    ivMan({ who: CAST.you, x: s03_THEO_PARTY, y: GROUND, h: 520, f: 0.5, pose: ivPose('relaxed'), expr: { eyes: 'tired', mouth: 'flat', look: [1, 0] } });
  } }));
  const a = ivPop(S.t0 + 0.08), sc = 0.8 + 0.2 * EZ.back(a);
  if (a > 0) { ctx.save(); ctx.translate(1120, 215); ctx.scale(sc, sc); ctx.rotate(-0.04); ivText('SURPRISE!', 0, 0, 112, '#ffe2b0', { glow: 'rgba(255,150,70,0.8)', track: 4, shadow: 'rgba(40,10,20,0.6)' }); ctx.restore(); }
  s03_minus();
});

// 047 Nia: "At least act surprised."
s03_shot(CUT(s03_ID.act), 'nia-act', 'Nia close: At least act surprised.', (lt, S) => {
  IV_CAM = { x: 900, y: 455, z: 2.5 };
  const g = s03_u(lt, VW(s03_ID.act, 'act') - S.t0 - 2 / FPS);
  ivStage(SET_party({ cheer: true, act: () => {
    ivMan({ who: CAST.you, x: s03_THEO_PARTY, y: GROUND, h: 520, f: 0.5, pose: ivPose('relaxed'), expr: { eyes: 'tired', mouth: 'flat' } });
    ivMan({ who: CAST.nia, x: 860, y: GROUND, h: 500, f: -0.45, pose: ivPoseMix(ivPose('hips'), ivPose('shrug'), g), talk: s03_ID.act,
      expr: { eyes: 'squint', mouth: 'flat', brow: 'angry', look: [-1, 0] }, grip: { front: 'open', back: 'open' } });
    s03_sofa();
  } }));
  s03_minus();
});

// 048 you: "Wow. A party." — deadpan jazz hands
s03_shot(CUT(s03_ID.wow), 'you-wow', 'you close: Wow. A party. (deadpan jazz hands)', (lt, S) => {
  IV_CAM = { x: s03_THEO_PARTY + 60, y: 470, z: 2.6 };
  const up = s03_u(lt, VW(s03_ID.wow, 'Wow') - S.t0, 4 / FPS), down = s03_u(lt, VWE(s03_ID.wow, 'party') - S.t0 + 0.1, 5 / FPS);
  const P = ivPoseMix(ivPoseMix(ivPose('relaxed'), ivPose('shrug', { hL: [-0.2, -0.02], hR: [0.2, -0.03] }), up), ivPose('relaxed'), down);
  ivStage(SET_party({ cheer: true, act: () => {
    s03_friends(1); s03_sofa();
    ivMan({ who: CAST.you, x: s03_THEO_PARTY, y: GROUND, h: 520, f: 0.3, pose: P, talk: s03_ID.wow, expr: { eyes: 'tired', mouth: 'flat' }, grip: { front: 'open', back: 'open' } });
  } }));
  s03_minus();
});

// ---------------------------------------------------------------------
//  CAFETERIA — the punchline, the question, "Let me finish one sentence."
// ---------------------------------------------------------------------
const s03_CP = () => SET_POS.cafeteria;
const s03_sit = (who, x, f, o = {}) => ivMan({ who, x, y: GROUND, h: o.h || 510, f, pose: o.pose || ivPose('sitDesk'), expr: o.expr || { eyes: 'open', mouth: 'smile' }, talk: o.talk, grip: o.grip, hold: o.hold, blinkKey: o.bk, ghost: o.ghost, ghostA: o.ghostA });
// laughing: body shakes on 1s
const s03_laughP = (k, amp = 1) => ivPose('sitDesk', { lean: -0.06, tilt: -0.22, dip: 0.14 + Math.abs(Math.sin(F * 1.7 + k)) * 0.012 * amp, hL: [0.16, 0.12], hR: [0.12, 0.06 + Math.sin(F * 1.3 + k) * 0.02 * amp] });
const s03_jokeP = (u) => ivPoseMix(ivPose('sitDesk', { hR: [0.26, -0.02], hL: [0.18, 0.1] }), ivPose('sitDesk', { hR: [0.16, -0.16], hL: [0.06, -0.12], lean: 0.02 }), u);

// 049 "You laugh before the punchline." — the joke mid-air, you already laughing
s03_shot(CUT(s03_ID.laugh), 'caf-laugh', 'cafeteria: friend mid-joke, you already laughing (ghost punchline)', (lt, S) => {
  IV_CAM = { x: 900, y: 520, z: 1.3 };
  const g = Math.sin(TT * 7) * 0.5 + 0.5;
  ivStage(SET_cafeteria({ act: () => {
    s03_sit(CAST.you, 700, 0.55, { pose: s03_laughP(0), expr: { eyes: 'happy', mouth: 'grin' } });
    s03_sit(CAST.kidD, 1040, -0.55, { pose: s03_jokeP(g * 0.4), expr: { eyes: 'open', mouth: F % 6 < 3 ? 'open' : 'o', brow: 'up' } });
    ivMan({ who: CAST.kidD, x: 1110, y: GROUND, h: 510, f: -0.4, pose: ivPose('handsUp', { lean: -0.1, tilt: -0.2 }), expr: { eyes: 'happy', mouth: 'grin' }, ghost: true, ghostA: 0.55, blinkKey: 'gj' });
    s03_sit(CAST.nia, 1330, -0.55, { h: 500, expr: { eyes: 'open', mouth: 'flat', look: [-1, 0] } });
  } }));
  s03_minus();
});

// … "punchline." — the friend's face: confused, hands frozen
s03_shot(CUT(s03_ID.laugh, 'punchline'), 'caf-confused', 'friend close: confused, joke not finished', (lt, S) => {
  IV_CAM = { x: 1080, y: 470, z: 2.7 };
  ivStage(SET_cafeteria({ act: () => {
    s03_sit(CAST.you, 700, 0.55, { pose: s03_laughP(0), expr: { eyes: 'happy', mouth: 'grin' } });
    s03_sit(CAST.kidD, 1040, -0.55, { pose: s03_jokeP(0.3), expr: { eyes: 'wide', mouth: 'o', brow: 'up', look: [-1, 0] } });
  } }));
  s03_minus();
});

// 050 "You answer before the question." — your answer bubble; her question still in the future (cyan)
function s03_bubble(x, y, w, h, tail, fill, text, tc, size) {
  ivRR(x - w / 2, y - h / 2, w, h, h * 0.45, fill);
  ivPoly([[x + tail * w * 0.2 - 18, y + h / 2 - 4], [x + tail * w * 0.2 + 18, y + h / 2 - 4], [x + tail * w * 0.34, y + h / 2 + 36]], fill);
  ivText(text, x, y + size * 0.35, size, tc, { track: 2 });
}
s03_shot(CUT(s03_ID.answer), 'caf-answer', 'you answer (bubble) before Nia asks (ghost bubble)', (lt, S) => {
  IV_CAM = { x: 1000, y: 480, z: 1.55 };
  const ta = VW(s03_ID.answer, 'answer') - S.t0, fu = s03_u(lt, ta - 2 / FPS);
  ivStage(SET_cafeteria({ act: () => {
    s03_sit(CAST.you, 700, 0.55, { pose: ivPoseMix(ivPose('sitDesk'), ivPose('sitDesk', { hR: [0.16, -0.2] }), fu), expr: { eyes: 'squint', mouth: 'smirk' }, grip: { front: fu > 0.5 ? 'point' : 'open' } });
    s03_sit(CAST.nia, 1290, -0.55, { h: 500, expr: { eyes: 'open', mouth: 'o', brow: 'up', look: [-1, 0] }, pose: ivPose('sitDesk', { hR: [0.2, 0.0] }) });
  } }));
  // screen space bubbles (above heads, never over a face)
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save(); ctx.globalAlpha = 0.85 + 0.1 * Math.sin(F * 1.7); ivGlow(1390, 175, 360, 'rgba(90,230,255,0.25)');
  s03_bubble(1390, 175, 540, 96, 1, 'rgba(10,40,56,0.88)', "WHAT'S ON THE TEST?", IV.ghost, 38);
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(127,240,255,0.8)'; ctx.beginPath(); ctx.roundRect(1390 - 270, 175 - 48, 540, 96, 43); ctx.stroke(); ctx.restore();
  const a = ivPop(S.t0 + ta + 2 / FPS);
  if (a > 0) { ctx.globalAlpha = a; s03_bubble(560, 190, 380, 96, -1, '#f7eedd', 'CHAPTER 4.', '#2a1a20', 44); }
  ctx.restore();
  s03_minus();
});

// 051 Nia: "Let me finish one sentence. One. Please." — close, annoyed; then her one finger (hand insert)
s03_shot(CUT(s03_ID.finish), 'nia-finish', 'Nia close: Let me finish one sentence.', (lt, S) => {
  IV_CAM = { x: 1250, y: 470, z: 2.6 };
  const g = s03_u(lt, VW(s03_ID.finish, 'finish') - S.t0 - 2 / FPS);
  ivStage(SET_cafeteria({ act: () => {
    s03_sit(CAST.you, 700, 0.55, { expr: { eyes: 'squint', mouth: 'smirk' } });
    s03_sit(CAST.nia, 1290, -0.5, { h: 500, talk: s03_ID.finish, expr: { eyes: 'angry', mouth: 'flat', brow: 'angry', look: [-1, 0] },
      pose: ivPoseMix(ivPose('sitDesk'), ivPose('sitDesk', { hR: [0.2, 0.06], hL: [0.24, 0.08], lean: 0.18 }), g), grip: { front: 'flat', back: 'flat' } });
  } }));
  s03_minus();
});
const s03_NIA_FINGER = { x: 1290, h: 500, f: -0.5 };
// a big arm + five-finger glove in screen space (hand inserts): from the sleeve point (sx, sy) to the wrist (hx, hy)
function s03_bigArm(sx, sy, hx, hy, lw, col, grip, s = 1) {
  const ang = Math.atan2(hy - sy, hx - sx), rim = IV_M.rim, C0 = (c) => c, CR = () => rim;
  const ex = lerp(sx, hx, 0.8), ey = lerp(sy, hy, 0.8);
  ivLine(sx, sy, hx, hy, lw + 8, rim); ivHand(hx, hy, ang, lw / IV_J.lw, 'glove', grip, CR, (w) => w + 8, s);
  ivLine(sx, sy, hx, hy, lw, IV.ink); ivLine(sx, sy, ex, ey, lw * 1.65, col); ivLine(ex, ey, lerp(sx, hx, 0.83), lerp(sy, hy, 0.83), lw * 1.5, ivShade(col, -0.25));
  ivHand(hx, hy, ang, lw / IV_J.lw, 'glove', grip, C0, (w) => w, s);
}
s03_shot(CUT(s03_ID.finish, 'One', 2), 'nia-finger', 'hand insert: Nia holds up ONE finger', (lt, S) => {
  const up = s03_u(lt, 0.0, 4 / FPS);
  IV_CAM = { x: 1480, y: 470, z: 2.6 }; IV_FOCUS = 0.55;
  ivStage(SET_cafeteria({ fg: false, act: () => {
    s03_sit(CAST.nia, 1290, -0.5, { h: 500, talk: s03_ID.finish, expr: { eyes: 'angry', mouth: 'flat', brow: 'angry' } });
  } }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const hx = lerp(1300, 1240, up), hy = lerp(1050, 640, up);
  s03_bigArm(1420, 1300, hx, hy, 120, CAST.nia.col, 'point', -1);
  ctx.restore();
  ivTag('ONE', 1640, 250, 44, ivPop(VWE(s03_ID.finish, 'One', 2) - 2 / FPS));
  s03_minus();
});

// 052 "Everyone else lives right now." — the lonely wide: the group laughing together, you apart at the end of the table
const s03_GROUP = [[CAST.kidA, 1010, -0.5], [CAST.nia, 1190, -0.45], [CAST.kidC, 1380, 0.5], [CAST.kidB, 1560, -0.5]];
function s03_group(o = {}) {
  s03_GROUP.forEach(([who, x, f], i) => {
    const P = o.pose ? o.pose(i) : s03_laughP(i * 2.1, 0.8);
    ivMan({ who, x, y: GROUND, h: who === CAST.nia ? 495 : 500, f, pose: P, expr: o.expr ? o.expr(i) : { eyes: 'happy', mouth: (F + i * 3) % 10 < 5 ? 'grin' : 'open' }, blinkKey: 'grp' + i, ghost: o.ghost, ghostA: o.ghostA });
  });
}
s03_shot(CUT(s03_ID.now), 'caf-group', 'lonely wide: the group laughs together, you apart', (lt, S) => {
  IV_CAM = { x: 980, y: 540, z: 1.02 * ivPush(S.t0, 0.03, 1.8) };
  ivStage(SET_cafeteria({ act: () => {
    s03_sit(CAST.you, 420, 0.55, { expr: { eyes: 'sad', mouth: 'flat', look: [1, 0] } });
    s03_group();
  } }));
  s03_minus();
});

// 053 "You live ten seconds away from all of them." — you in a cyan haze, their future ghosts already leaving
s03_shot(CUT(s03_ID.away), 'caf-away', 'you alone, cyan haze, the group 10 s ahead as ghosts', (lt, S) => {
  IV_CAM = { x: 800, y: 480, z: 2.0 };
  ivStage(SET_cafeteria({ act: () => {
    s03_group({ pose: (i) => ivPose('sitDesk', { hR: [0.2, 0.12] }), expr: (i) => ({ eyes: 'happy', mouth: 'smile' }) });
    s03_GROUP.slice(0, 2).forEach(([who, x], i) => {
      const P = ivPose('wave', { lean: 0.05 });
      ivMan({ who, x: x + 40, y: GROUND, h: 500, f: 0.8, pose: P, expr: { eyes: 'happy', mouth: 'grin' }, ghost: true, ghostA: 0.55, blinkKey: 'ga' + i });
    });
    s03_sit(CAST.you, 420, 0.55, { expr: { eyes: 'sad', mouth: 'flat', look: [1, 0.2] } });
  } }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ivGlow(390, 430, 560, 'rgba(90,230,255,0.26)'); ivGlow(390, 900, 700, 'rgba(60,200,255,0.12)');
  ctx.restore();
  s03_cyanTag('10 s AWAY', 1180, 210, 40, ivPop(VWE(s03_ID.away, 'seconds') - 3 / FPS));
  s03_minus();
});

// ---------------------------------------------------------------------
//  STREET (day) — the accidents: the ball, the cyclist and the car door, the ladder; the painter; the counter
//  The ladder is ours (P_ladder at the set's spot, s 0.7 → 630 px) so we control its tilt and the can.
// ---------------------------------------------------------------------
const s03_LAD = { x: 1520, y: GROUND, s: 0.7, len: 900 };
const s03_ladAng = (tilt) => lerp(0.2, -1.25, EZ.i2(tilt));
// a point on the ladder's left rail, `up` px (unscaled) above the foot
function s03_ladPt(tilt, up, lx = -38) {
  const a = s03_ladAng(tilt), L = s03_LAD, ly = -up;
  return [L.x + L.s * (lx * Math.cos(a) - ly * Math.sin(a)), L.y + L.s * (lx * Math.sin(a) + ly * Math.cos(a))];
}
const s03_ladder = (tilt, o = {}) => P_ladder(s03_LAD.x, s03_LAD.y, s03_LAD.s, tilt, { len: s03_LAD.len, can: o.can });
const s03_CAR = { x: 380, y: 1050, s: 1.7, col: '#3d5f8a' };
const s03_car = (door) => set_car(s03_CAR.x, s03_CAR.y, s03_CAR.s, { col: s03_CAR.col, door });
// the disasters that would have happened (drawn inside ivGhost)
function s03_ghostLadder() {
  s03_ladder(1, { can: false });
  P_paintCan(1020, GROUND + 4, 1.6, { ang: -1.4, lid: false });
  ctx.beginPath(); ctx.ellipse(950, GROUND + 6, 120, 12, 0, 0, TAU); ctx.fillStyle = '#4aa3d8'; ctx.fill();
  ivMan({ who: CAST.extraC, x: 1180, y: GROUND, h: 480, f: -0.6, pose: ivPose('fallen'), expr: { eyes: 'closed', mouth: 'o' }, blinkKey: 'gl' });
}
function s03_ghostCrash(cx = 480) {
  s03_car(1);
  ctx.save(); ctx.translate(cx, 1110); ctx.rotate(-0.55); P_bikeRider(0, 0, 0.75, { who: CAST.cyclist, rot: 0, expr: { eyes: 'wide', mouth: 'open' } }); ctx.restore();
}
const s03_THEO_ST = 790;

// 054 "And you see every accident before it happens." — the street wide, every disaster as a ghost at once
s03_shot(CUT(s03_ID.every), 'st-every', 'street wide: all the accidents ahead as ghosts', (lt, S) => {
  IV_CAM = { x: 960, y: 560, z: 1.0 * ivPush(S.t0, 0.03, 1.8) };
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, act: () => {
    s03_ladder(0);
    ivMan({ who: CAST.you, x: s03_THEO_ST, y: GROUND, h: 480, f: 0.15, pose: ivPose('relaxed'), expr: { eyes: 'wide', mouth: 'flat', look: [Math.sin(lt * 2.2) > 0 ? 1 : -1, 0] } });
    ivGhost(() => { s03_ghostLadder(); P_ball(860, 1010, 1.3, { rot: 2 }); }, 0.45);
  }, front: () => {
    s03_car(0);
    ivGhost(() => s03_ghostCrash(), 0.45);
  } }));
});

// 055 "A ball rolling into the street." — low: the ball rolls for the curb; ghost: in the road, a car on it
s03_shot(CUT(s03_ID.ball), 'st-ball', 'ball rolling for the road (ghost: car hits it)', (lt, S) => {
  IV_CAM = { x: 780, y: 830, z: 1.7 };
  const bx = lerp(330, 640, clamp(lt / 1.7)), kid = ivWalk(S.t0 + 0.2, -60, 330, 1, 5);
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, act: () => {
    s03_ladder(0);
    ivMan({ who: CAST.kidB, x: kid.x, y: GROUND, h: 330, f: 0.8, pose: { ...kid.pose, hR: [0.2, 0.05] }, expr: { eyes: 'wide', mouth: 'o' }, blinkKey: 'kid' });
    P_ball(bx, GROUND + 2, 1.3);
    ivGhost(() => { P_ball(900, 1012, 1.3, { rot: 4 }); P_car(1560 - Math.min(lt, 1.5) * 60, 1060, 0.62, { dir: -1, col: '#c8503f' }); }, 0.55);
  } }));
});

// … "street." — insert: your sneaker comes down on the ball, it stops dead at the curb
s03_shot(CUT(s03_ID.ball, 'street'), 'st-foot', 'foot insert: you stop the ball with your foot', (lt, S) => {
  IV_CAM = { x: 690, y: 820, z: 3.2 };
  const BX = 700, bx = lerp(470, BX, EZ.o3(clamp(lt / 0.25))), h = 520, x = 615, f = 0.6;
  const top = GROUND + 2 - 29 * 1.4 * 2 + 4, down = s03_u(lt, 0.18, 4 / FPS);
  const fR = ivPoseMix({ v: s03_foot(x, GROUND, h, f, BX + 10, top - 90) }, { v: s03_foot(x, GROUND, h, f, BX - 6, top) }, down).v;
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, fg: false, act: () => {
    P_ball(bx, GROUND + 2, 1.4);
    ivMan({ who: CAST.you, x, y: GROUND, h, f, pose: ivPose('stand', { fR, fL: [-0.06, 0.45], hR: [0.1, 0.26] }), air: true, expr: { eyes: 'squint', mouth: 'flat' } });
  } }));
});

// 056 "A cyclist about to hit a car door." — the door starts to open, the cyclist rides at it; ghost: the crash
s03_shot(CUT(s03_ID.cyc), 'st-cyclist', 'cyclist vs opening car door (ghost: the crash)', (lt, S) => {
  IV_CAM = { x: 820, y: 760, z: 1.2 };
  const cx = -260 + lt * 330, door = 0.3 * EZ.io(clamp(lt / 1.6));
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, fg: false, act: () => {
    s03_ladder(0);
    const P = ivPoseMix(ivPose('relaxed'), ivPose('point', { hR: [0.3, -0.06] }), s03_u(lt, VW(s03_ID.cyc, 'door') - S.t0 - 0.35));
    ivMan({ who: CAST.you, x: 1060, y: GROUND, h: 480, f: -0.6, pose: P, expr: { eyes: 'wide', mouth: 'open', brow: 'up' }, grip: { front: 'point' } });
  }, front: () => {
    s03_car(door);
    ivGhost(() => s03_ghostCrash(470), 0.5);
    P_bikeRider(cx, 1112, 0.75, { who: CAST.cyclist, expr: { eyes: 'open', mouth: 'smile' } });
  } }));
});

// … "door." — hand insert: your palm on the door, pushing it shut
s03_shot(CUT(s03_ID.cyc, 'door'), 'st-door', 'hand insert: you push the car door shut', (lt, S) => {
  IV_CAM = { x: 520, y: 860, z: 3.4 };
  const shut = s03_u(lt, 0.12, 5 / FPS), door = lerp(0.3, 0, shut);
  const wdt = 106 * (1 - 0.45 * door), x0 = 100 - wdt, tx = s03_CAR.x + (x0 + wdt * 0.45) * s03_CAR.s, ty = s03_CAR.y - 100 * s03_CAR.s;
  const x = 760, h = 560, f = -0.7, reach = s03_reach(x, 1120, h, f, tx + 26, ty);
  const P = ivPoseMix(ivPose('stand', { hR: [reach[0] - 0.08, reach[1] + 0.06] }), ivPose('stand', { hR: reach, lean: 0.1 }), s03_u(lt, 0, 3 / FPS));
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, fg: false, act: () => s03_ladder(0), front: () => {
    s03_car(door);
    ivMan({ who: CAST.you, x, y: 1120, h, f, pose: P, grip: { front: 'flat' }, hands: 'glove', expr: { eyes: 'squint', mouth: 'flat' } });
  } }));
});

// 057 "A ladder about to tip." — the ladder starts to go; ghost: on the sidewalk, on a passer-by
s03_shot(CUT(s03_ID.ladder), 'st-ladder', 'ladder tipping (ghost: falls on a passer-by)', (lt, S) => {
  IV_CAM = { x: 1400, y: 600, z: 1.35 };
  const tilt = 0.02 + 0.09 * EZ.i2(clamp(lt / 1.3)) + Math.sin(lt * 14) * 0.006, w = ivWalk(S.t0, 760, 520, 1, 5);
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, act: () => {
    ivGhost(() => s03_ghostLadder(), 0.5);
    s03_ladder(tilt);
    ivMan({ who: CAST.you, x: w.x, y: GROUND, h: 520, f: 0.7, pose: w.pose, expr: { eyes: 'wide', mouth: 'o', look: [1, -1] } });
    set_walker(CAST.extraC, 2300, 1180, GROUND, 480, 0, 's03w', { rest: 9 });
  } }));
});

// … "tip." — hand insert: your glove closes on the rail; the ladder goes back against the scaffold
const s03_GRAB = { x: 1400, h: 540, f: 0.6, up: 400 };
s03_shot(CUT(s03_ID.ladder, 'tip'), 'st-grab', 'hand insert: you grab the ladder rail', (lt, S) => {
  const G = s03_GRAB, grab = s03_u(lt, 0.04, 4 / FPS), back = s03_u(lt, 0.25, 6 / FPS);
  const tilt = lerp(0.11, 0, back), pt = s03_ladPt(tilt, G.up), rr = s03_reach(G.x, GROUND, G.h, G.f, pt[0] + 6, pt[1]);
  const P = ivPoseMix(ivPose('stand', { hR: [0.12, 0.2] }), ivPose('stand', { hR: rr }), grab);
  const p0 = s03_ladPt(0.05, G.up);
  IV_CAM = { x: p0[0] - 30, y: p0[1] + 70, z: 3.4 };
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, fg: false, act: () => {
    s03_ladder(tilt);
    ivMan({ who: CAST.you, x: G.x, y: GROUND, h: G.h, f: G.f, pose: P, grip: { front: grab > 0.6 ? 'hold' : 'open' }, hands: 'glove', expr: { eyes: 'squint', mouth: 'flat' } });
  } }));
});

// 058 "So you quietly fix them." — wide: you hold the ladder; the cyclist rides past the shut door; the kid has his ball
s03_shot(CUT(s03_ID.fix), 'st-fixed', 'wide: everything fine, you holding the ladder', (lt, S) => {
  IV_CAM = { x: 960, y: 600, z: 1.0 * ivPush(S.t0, 0.03, 1.8) };
  const G = s03_GRAB, pt = s03_ladPt(0, G.up), rr = s03_reach(G.x, GROUND, G.h, G.f, pt[0] + 6, pt[1]);
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, act: () => {
    s03_ladder(0);
    ivMan({ who: CAST.kidB, x: 760, y: GROUND, h: 330, f: 0.2, pose: ivPose('stand', { hR: [0.12, 0.12], hL: [-0.12, 0.12] }), expr: { eyes: 'happy', mouth: 'smile' }, blinkKey: 'kid',
      hold: { R: (x, y) => P_ball(x - 20, y + 30, 0.9) } });
    ivMan({ who: CAST.you, x: G.x, y: GROUND, h: G.h, f: G.f, pose: ivPose('stand', { hR: rr }), grip: { front: 'hold' }, expr: { eyes: 'open', mouth: 'flat' } });
  }, front: () => {
    s03_car(0);
    P_bikeRider(-200 + lt * 420, 1112, 0.75, { who: CAST.cyclist, expr: { eyes: 'happy', mouth: 'smile' } });
  } }));
});

// 059 painter: "Hey! What are you doing?" — back with his coffee, pointing at you
const s03_PAINTER = { x: 1790, h: 540, f: -0.6 };
s03_shot(CUT(s03_ID.hey), 'st-painter', 'painter: Hey! What are you doing?', (lt, S) => {
  IV_CAM = { x: 1650, y: 480, z: 2.2 };
  const G = s03_GRAB, pt = s03_ladPt(0, G.up), rr = s03_reach(G.x, GROUND, G.h, G.f, pt[0] + 6, pt[1]);
  const pnt = s03_u(lt, VW(s03_ID.hey, 'Hey') - S.t0 - 1 / FPS, 4 / FPS);
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, fg: false, act: () => {
    s03_ladder(0);
    ivMan({ who: CAST.you, x: G.x, y: GROUND, h: G.h, f: G.f, pose: ivPose('stand', { hR: rr }), grip: { front: 'hold' }, expr: { eyes: 'wide', mouth: 'flat', look: [1, 0] } });
    ivMan({ who: CAST.painter, x: s03_PAINTER.x, y: GROUND, h: s03_PAINTER.h, f: s03_PAINTER.f, talk: s03_ID.hey,
      pose: ivPoseMix(ivPose('stand', { hL: [-0.02, 0.12] }), ivPose('point', { hR: [0.3, -0.08], hL: [-0.02, 0.12] }), pnt),
      grip: { front: 'point', back: 'hold' }, hold: { L: (x, y) => P_mug(x, y + 18, 0.75, 1, { col: '#e9e2d4' }) },
      expr: { eyes: 'angry', mouth: 'open', brow: 'angry', look: [-1, 0] } });
  } }));
});

// 060 you: "Sorry. Thought it was falling." — one hand still on the rail, the other on the back of your head
s03_shot(CUT(s03_ID.sorry), 'st-sorry', 'you close: Sorry. Thought it was falling.', (lt, S) => {
  IV_CAM = { x: 1440, y: 470, z: 2.5 };
  const G = s03_GRAB, pt = s03_ladPt(0, G.up), rr = s03_reach(G.x, GROUND, G.h, G.f, pt[0] + 6, pt[1]);
  const sc = s03_u(lt, VW(s03_ID.sorry, 'Sorry') - S.t0, 5 / FPS), wig = Math.sin(lt * 18) * 0.012 * sc;
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, fg: false, act: () => {
    s03_ladder(0);
    ivMan({ who: CAST.you, x: G.x, y: GROUND, h: G.h, f: G.f, talk: s03_ID.sorry,
      pose: ivPoseMix(ivPose('stand', { hR: rr }), ivPose('stand', { hR: rr, hL: [-0.05 + wig, -0.13], bendL: -1, tilt: 0.1 }), sc),
      grip: { front: 'hold', back: 'open' }, expr: { eyes: 'squint', mouth: 'smile', brow: 'sad', look: [1, 0] } });
    ivMan({ who: CAST.painter, x: s03_PAINTER.x, y: GROUND, h: s03_PAINTER.h, f: s03_PAINTER.f, pose: ivPose('hips'), expr: { eyes: 'squint', mouth: 'frown', brow: 'angry' } });
  } }));
});

// 061 "It was." — beat on the paint can at the top of the ladder: still swinging, then still
s03_shot(CUT(s03_ID.itwas), 'st-can', 'beat: the paint can wobbling at the ladder top', (lt, S) => {
  const L = s03_LAD, a = s03_ladAng(0), ty = -L.len + 95, hook = [L.x + L.s * (-ty * Math.sin(a)), L.y + L.s * (Math.cos(a) * ty)];
  IV_CAM = { x: hook[0] - 40, y: hook[1] + 70, z: 3.4 };
  const wob = 0.42 * Math.sin(lt * 11) * Math.exp(-lt * 2.4);
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, fg: false, act: () => {
    s03_ladder(0, { can: false });
    ctx.save(); ctx.translate(hook[0], hook[1]); ctx.scale(L.s, L.s); ctx.rotate(wob); P_paintCan(0, 104, 1.3, { hang: true }); ctx.restore();
    // a drip that almost goes
    if (lt > 0.15) { const d = clamp((lt - 0.15) * 2); ivDot(hook[0] + Math.sin(wob) * -50 + 14, hook[1] + 82 + d * 8, 4 + d * 3, '#4aa3d8'); }
  } }));
});

// 062 "Futures changed: one hundred and twelve." — you walk on; the counter climbs and lands on "twelve"
s03_shot(CUT(s03_ID.fut), 'st-counter', 'walking on; FUTURES CHANGED → 112', (lt, S) => {
  IV_CAM = { x: 960, y: 650, z: 1.0 };
  const w = ivWalk(S.t0, 260, 420, 1, 6);
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, act: () => {
    s03_ladder(0);
    ivMan({ who: CAST.painter, x: s03_LAD.x + 200, y: GROUND, h: 520, f: -0.5, pose: ivPose('think'), expr: { eyes: 'squint', mouth: 'flat', look: [-1, -1] } });
    ivMan({ who: CAST.you, x: w.x, y: GROUND, h: 420, f: 0.8, pose: w.pose, expr: { eyes: 'open', mouth: 'flat' } });
  }, front: () => s03_car(0) }));
  const n = ivCount(VW(s03_ID.fut, 'one'), VWE(s03_ID.fut, 'twelve'), 0, 112);
  ivCounter([['FUTURES CHANGED', n, true]], ivPop(VW(s03_ID.fut, 'Futures') - 2 / FPS));
});

// 063 "Thank-yous: zero." — close on you; people pass behind without a look; the zero lands
s03_shot(CUT(s03_ID.thx), 'st-zero', 'you close, passers-by ignore you; THANK-YOUS 0', (lt, S) => {
  IV_CAM = { x: 1080, y: 470, z: 2.3 };
  const w1 = ivWalk(S.t0 - 0.6, 520, 400, 1, 6), w2 = ivWalk(S.t0, 2050, 390, -1, 6);
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, act: () => {
    ivMan({ who: CAST.extraA, x: w1.x, y: GROUND - 10, h: 400, f: 0.8, pose: { ...w1.pose, hR: [0.08, 0.1] }, expr: { eyes: 'open', mouth: 'flat', look: [0, 1] }, blinkKey: 'p1',
      hold: { R: (x, y, an) => P_phone(x + 6, y - 14, 1.3, { ang: -0.2 }) } });
    ivMan({ who: CAST.extraC, x: w2.x, y: GROUND - 10, h: 390, f: -0.8, pose: w2.pose, expr: { eyes: 'open', mouth: 'smile' }, blinkKey: 'p2' });
    ivMan({ who: CAST.you, x: 1120, y: GROUND, h: 520, f: 0.15, pose: ivPose('relaxed'), expr: { eyes: 'tired', mouth: 'flat', look: [-0.5, 0] } });
  } }));
  const tz = VW(s03_ID.thx, 'zero');
  ivCounter([['FUTURES CHANGED', 112, true], ['THANK-YOUS', TT >= tz ? 0 : '']], 1);
  if (TT >= tz && TT < tz + 0.3) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ivGlow(1125, H - IV.bar - 60, 120, 'rgba(255,170,90,0.35)', 1 - (TT - tz) / 0.3); ctx.restore(); }
});

// 064 "When you stop a disaster," — the sunny street; the disasters that never happened fade off it
s03_shot(CUT(s03_ID.dis), 'st-fade', 'sunny street, the ghost disasters fading out', (lt, S) => {
  IV_CAM = { x: 960, y: 580, z: 1.0 * ivPush(S.t0, 0.03, 1.8) };
  const fade = 0.6 * (1 - EZ.io(clamp((lt - 0.3) / 1.6)));
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, act: () => {
    s03_ladder(0);
    ivMan({ who: CAST.painter, x: s03_LAD.x - 90, y: GROUND, h: 520, f: 0.5, pose: ivPose('relaxed'), expr: { eyes: 'open', mouth: 'smile' } });
    ivMan({ who: CAST.you, x: 830, y: GROUND, h: 480, f: 0.3, pose: ivPose('relaxed'), expr: { eyes: 'tired', mouth: 'flat' } });
    if (fade > 0.01) ivGhost(() => { s03_ghostLadder(); P_ball(1000, 1012, 1.3, { rot: 4 }); }, fade);
  }, front: () => { s03_car(0); if (fade > 0.01) ivGhost(() => s03_ghostCrash(470), fade); } }));
});

// … "nobody ever sees the disaster." + the 2 s beat — you sit on the curb; the street goes on, sunny, unaware
s03_shot(CUT(s03_ID.dis, 'nobody'), 'st-curb', 'beat: you alone on the curb, the street goes on', (lt, S) => {
  IV_CAM = { x: 900, y: 640, z: 1.08 };
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, act: () => {
    s03_ladder(0);
    ivMan({ who: CAST.painter, x: s03_LAD.x - 90, y: GROUND, h: 520, f: 0.6, pose: ivPose('stand', { hR: [0.1, -0.05] }), grip: { front: 'hold' }, expr: { eyes: 'open', mouth: 'smile' },
      hold: { R: (x, y) => P_mug(x, y + 16, 0.7, 1, { col: '#e9e2d4' }) } });
    set_walker(CAST.extraB, -400, 2300, GROUND - 4, 470, 2, 's03c1');
    set_walker(CAST.kidC, 2300, -400, GROUND - 8, 360, 5, 's03c2');
    const hh = 470; ivMan({ who: CAST.you, x: 820, y: 905 + 0.31 * hh, h: hh, f: 0.35, pose: ivPose('sit', { hL: [0.14, 0.2], hR: [0.18, 0.2], lean: 0.12, tilt: 0.15 }), expr: { eyes: 'tired', mouth: 'flat', look: [0, 1] } });
  } }));
});

// the 2 s beat — close on you on the curb; a kid bounces the saved ball past behind you
s03_shot(LE(s03_ID.dis) + 0.35, 'st-beat', 'beat: your face on the curb, nobody knows', (lt, S) => {
  const hh = 470, y = 905 + 0.31 * hh;
  IV_CAM = { x: 900, y: 700, z: 2.4 };
  const k = ivWalk(S.t0 - 0.4, 420, 330, 1, 5), bounce = Math.abs(Math.sin(lt * 5)) * 70;
  ivStage(SET_street({ t: 'day', ladderOff: true, car: false, fg: false, act: () => {
    ivMan({ who: CAST.kidB, x: k.x, y: GROUND - 10, h: 330, f: 0.8, pose: { ...k.pose, hR: [0.12, 0.12] }, expr: { eyes: 'happy', mouth: 'smile' }, blinkKey: 'kid' });
    P_ball(k.x + 60, GROUND - 10 - bounce, 1, { air: bounce > 4 });
    ivMan({ who: CAST.you, x: 820, y, h: hh, f: 0.35, pose: ivPose('sit', { hL: [0.14, 0.2], hR: [0.18, 0.2], lean: 0.12, tilt: 0.15 }), expr: { eyes: 'tired', mouth: 'flat', look: [-0.3, 0.6] } });
  } }));
});
