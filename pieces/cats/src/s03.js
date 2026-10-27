// =====================================================================
//  s03 — 053–071 · MINUS: brutal honesty (the hug, the shower, the bed), the night gossip, three hours of sleep,
//  the classroom (the cat insults a pigeon), and the subscribe joke (Pickles deadpan at the camera).
//  Every time comes from the voice (CUT/VW/VWE/LT/LE). SFX are registered next to their SHOT.
// =====================================================================
const s03_ID = {
  minus: '053-narrator', honest: '054-narrator', hug: '055-narrator', heart: '056-pickles', sing: '057-narrator', birds: '058-pickles',
  learn: '059-narrator', warm: '060-pickles', dawn: '061-narrator', gossip: '062-narrator', every: '063-narrator', off: '064-narrator',
  moth: '065-noodle', sleep: '066-narrator', laugh: '067-narrator', funny: '068-teacher', sorry: '069-you', sub: '070-narrator', wont: '071-narrator',
};
const s03_O = { sec: 's03' };
const s03_shot = (t0, key, title, draw, o = {}) => SHOT(t0, 's03_' + key, draw, { ...s03_O, title, ...o });
// a gesture ramp: 0 → 1 over d seconds from a (local shot time), fast out, hard stop
const s03_u = (lt, a, d = 5 / FPS) => EZ.o3(clamp((lt - a) / d));
// a camera move over the whole shot (EZ.io): a, b = [x, y, z]
const s03_move = (lt, S, a, b, d) => { const u = EZ.io(clamp(lt / (d ?? Math.max(0.5, S.t1 - S.t0)))); IV_CAM = { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u) }; };
// the grey minus icon (top-left, screen space) on every minus beat
function s03_minus(a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= a;
  const x = 118, y = 132, r = 34;
  ivDot(x + 2, y + 4, r, 'rgba(0,0,0,0.35)'); ivDot(x, y, r, '#5f6470'); ctx.beginPath(); ctx.arc(x, y, r - 3, 0, TAU); ctx.strokeStyle = '#c9ccd4'; ctx.lineWidth = 3; ctx.stroke();
  ivRR(x - 16, y - 4, 32, 8, 4, '#eef0f4');
  ctx.restore();
}
// a standing cat/actor with its cast shadow
const s03_cat = (o) => { if (o.shadow !== false && o.pose !== 'held') ivCastShadow(o.x, o.y, o.s * 0.9, { a: 0.28, w: 0.55, len: 0.6 }); return ivCat(o); };
const s03_man = (o) => { if (o.shadow !== false) ivCastShadow(o.x, o.y, o.h, { a: 0.3 }); return ivMan(o); };
// Kai lying on his back in bed (head at hx, hy on the pillow; the body runs to the right) — ivMan rotated a quarter turn
function s03_lie(hx, hy, h, o = {}) {
  // (a quarter turn zeroes the matrix's .a, which ivMan reads as its pixel scale: report the true scale meanwhile)
  const ct = ctx, g0 = CanvasRenderingContext2D.prototype.getTransform;
  ctx.save(); ctx.translate(hx + 0.85 * h, hy); ctx.rotate(-Math.PI / 2);
  ct.getTransform = function () { const m = g0.call(this); return { a: Math.hypot(m.a, m.b), b: m.b, c: m.c, d: m.d, e: m.e, f: m.f }; };
  let r; try { r = ivMan({ who: CAST.kai, x: 0, y: 0, h, f: o.f ?? 0, pose: o.pose || ivPose('stand', { hL: [-0.02, 0.3], hR: [0.02, 0.3] }), expr: o.expr || { eyes: 'open', mouth: 'flat' }, talk: o.talk, blinkKey: o.bk }); } finally { delete ct.getTransform; }
  ctx.restore(); return r;
}
// a speech bubble (world or screen coords); tail -1..1 where the tail points
function s03_bubble(str, x, y, size = 26, a = 1, o = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `800 ${size}px ${IV.font}`;
  const w = ctx.measureText(str).width + size * 1.3, h = size * 1.7, sc = 0.7 + 0.3 * EZ.back(clamp(a)), tl = o.tail ?? 0;
  ctx.translate(x, y); ctx.scale(sc, sc);
  const fill = o.bg || 'rgba(250,244,232,0.95)';
  ivRR(-w / 2 + 3, -h / 2 + 5, w, h, h * 0.45, 'rgba(0,0,0,0.25)');
  ivPoly([[tl * w * 0.25 - size * 0.4, h / 2 - 4], [tl * w * 0.25 + size * 0.4, h / 2 - 4], [tl * w * 0.42, h / 2 + size * 0.9]], fill);
  ivRR(-w / 2, -h / 2, w, h, h * 0.45, fill);
  ivText(str, 0, size * 0.36, size, o.c || '#2a2026', { track: 1 }); ctx.restore();
}
// floating music notes (singing), screen-ish world coords around x, y
function s03_notes(x, y, k = 1, key = 'nt') {
  const r = RNG(key).f;
  for (let i = 0; i < 6; i++) { const ph = mod(TT * 0.7 + r(), 1), nx = x + (r() - 0.3) * 160 + ph * 120 * k + Math.sin(TT * 3 + i) * 12, ny = y - ph * 260, a = Math.sin(Math.PI * ph);
    ctx.save(); ctx.globalAlpha = a * 0.9; ctx.translate(nx, ny); ctx.rotate(Math.sin(TT * 2 + i) * 0.3);
    ivDot(0, 0, 11, '#3c6fd1'); ivLine(9, 0, 9, -40, 4, '#3c6fd1', 'butt'); if (i % 2) { ivLine(9, -40, 30, -34, 6, '#3c6fd1', 'butt'); ivDot(21, 4, 11, '#3c6fd1'); ivLine(30, 4, 30, -34, 4, '#3c6fd1', 'butt'); }
    ctx.restore(); }
}
// Pickles' paw (a stubby orange foreleg) from (x0, y0) to (x1, y1), toe beans showing
function s03_paw(x0, y0, x1, y1, w) {
  ivLine(x0, y0, x1, y1, w + 6, IV_M.rim); ivLine(x0, y0, x1, y1, w, '#e0873a');
  ctx.save(); ctx.globalAlpha = 0.6; ivLine(x0 + w * 0.2, y0 - w * 0.3, x1, y1 - w * 0.25, w * 0.18, '#b45c1e'); ctx.restore();
  ivDot(x1, y1, w * 0.62, '#e0873a'); ivDot(x1 + w * 0.28, y1, w * 0.26, '#f2a7a0'); for (const a of [-0.8, -0.25, 0.3]) ivDot(x1 + Math.cos(a) * w * 0.55, y1 + Math.sin(a) * w * 0.55, w * 0.13, '#f2a7a0');
}

// ---------------------------------------------------------------------
//  053–054 MINUS · brutally honest
// ---------------------------------------------------------------------
// 053 "Minus." — the card: a big grey minus, Pickles sitting beside it, unimpressed
s03_shot(CUT(s03_ID.minus), 'minus', 'MINUS card, Pickles beside it', (lt, S) => {
  IV_CAM = { x: 960, y: 540, z: 1.05 * ivPush(S.t0, 0.04, 1.4) };
  ivStage(SET_void({ glow: [200, 205, 220], act: () => {
    s03_cat({ x: 1300, y: GROUND - 20, s: 330, f: -1, coat: CATS.pickles, pose: 'sit', expr: { eyes: 'half' }, look: [-0.6, 0] });
  } }));
  const a = ivPop(VW(s03_ID.minus, 'Minus')), sc = 0.85 + 0.15 * EZ.back(a);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(800, 470); ctx.scale(sc, sc);
  ivGlow(0, 0, 320, 'rgba(200,205,215,0.18)'); ivDot(0, 8, 150, 'rgba(0,0,0,0.35)'); ivDot(0, 0, 150, '#4c505c');
  ctx.beginPath(); ctx.arc(0, 0, 138, 0, TAU); ctx.strokeStyle = '#c9ccd4'; ctx.lineWidth = 8; ctx.stroke();
  ivRR(-78, -15, 156, 30, 15, '#eef0f4');
  ivText('MINUS', 0, 245, 62, '#ffe6c4', { glow: 'rgba(255,170,90,0.5)', track: 8 });
  ctx.restore();
});
{ const t = CUT(s03_ID.minus), tm = VW(s03_ID.minus, 'Minus');
  SFX(t, 'whoosh', 1.0); SFX(tm, 'thud', 0.9, -0.15); SFX(tm + 0.5, 'cloth', 0.35, 0.3); }

// 054 "Cats are brutally honest." — Pickles close on the bed, judging the camera; the tag lands on "brutally"
s03_shot(CUT(s03_ID.honest), 'honest', 'Pickles close: brutally honest', (lt, S) => {
  IV_CAM = { x: 1130, y: 700, z: 2.5 * ivPush(S.t0, 0.04, 2.2) }; IV_FOCUS = 1;
  const sq = s03_u(lt, VW(s03_ID.honest, 'brutally') - S.t0, 4 / FPS);
  ivStage(SET_bedroom({ blanket: true, onBed: () => {
    ivCat({ x: 1120, y: 850, s: 230, f: -1, coat: CATS.pickles, pose: 'loaf', expr: { eyes: sq > 0.5 ? 'half' : 'open', blink: sq * 0.15 }, look: [-0.4, 0.1] });
  } }));
  ivTag('BRUTALLY HONEST', 960, 170, 40, ivPop(VW(s03_ID.honest, 'brutally')));
  s03_minus();
});
{ const t = CUT(s03_ID.honest); SFX(VW(s03_ID.honest, 'brutally'), 'pop', 0.8, 0.0); SFX(VW(s03_ID.honest, 'honest') + 0.3, 'cloth', 0.3, 0.2); }

// ---------------------------------------------------------------------
//  055–056 the hug
// ---------------------------------------------------------------------
const s03_holdOut = ivPose('stand', { hL: [0.24, 0.08], hR: [0.28, 0.06], lean: 0.04 });
const s03_hugP = ivPose('hug', { hL: [0.17, 0.13], hR: [0.21, 0.11], lean: 0.06, tilt: 0.12 });
// Kai holding Pickles: u 0 = arms out (Pickles dangling) → 1 = squeezed in a hug; returns the cat's head
function s03_hugPair(x, y, h, u, o = {}) {
  ivCastShadow(x, y, h, { a: 0.3 });
  const m = ivMan({ who: CAST.kai, x, y, h, f: -0.4, pose: ivPoseMix(s03_holdOut, s03_hugP, u), expr: o.kai || { eyes: u > 0.5 ? 'happy' : 'open', mouth: 'smile' }, grip: { front: 'hold', back: 'hold' }, hands: o.hands });
  const hx = lerp((m.handL[0] + m.handR[0]) / 2, m.sh[0], 0.35 * u), hy = (m.handL[1] + m.handR[1]) / 2, s = o.s ?? h * 0.36;
  // squash: the hug flattens him a little (wider, shorter)
  ctx.save(); ctx.translate(hx, hy + s * 0.32); ctx.scale(1 + 0.12 * u, 1 - 0.1 * u);
  const c = ivCat({ x: 0, y: 0, s, f: -1, coat: CATS.pickles, pose: 'sit', rot: -0.08 * u, expr: o.cat || { eyes: u > 0.5 ? 'half' : 'open' }, talk: o.talk, look: o.look });
  ctx.restore(); c.head = [hx + c.head[0] * (1 + 0.12 * u), hy + s * 0.32 + c.head[1] * (1 - 0.1 * u)];
  // Kai's hands over the cat's body (front of the hug)
  if (u > 0.4) { ivDot(m.handR[0] - 4, m.handR[1] + 6, h * 0.032, IV.ink); ivDot(m.handL[0] + 8, m.handL[1] + 12, h * 0.03, IV.ink); }
  return { m, c };
}
// 055 "You hug Pickles." — the bedroom, morning: Kai lifts him off the bed and squeezes; the camera dollies in
s03_shot(CUT(s03_ID.hug), 'hug', 'Kai hugs Pickles (dolly in)', (lt, S) => {
  s03_move(lt, S, [1060, 560, 1.05], [1330, 540, 2.0]);
  const u = s03_u(lt, VW(s03_ID.hug, 'hug') - S.t0, 6 / FPS);
  ivStage(SET_bedroom({ act: () => { s03_hugPair(1420, 965, 560, u, { talk: s03_ID.heart, cat: { eyes: TT > LT(s03_ID.heart) ? 'half' : u > 0.5 ? 'wide' : 'open' } }); } }));
  s03_minus();
});
{ const t = CUT(s03_ID.hug), th = VW(s03_ID.hug, 'hug');
  SFX(t, 'whoosh', 0.7); SFX(th, 'cloth', 0.9, 0.3); SFX(th + 0.06, 'gasp', 0.3, 0.3); }

// 056 "Your heart is beating…" — (the hug wide runs on: Pickles talks in it) — heartbeats under the line
{ const t = CUT(s03_ID.heart), t1 = VW(s03_ID.heart, 'like') - 3 / FPS; for (let x = t + 0.15; x < t1; x += 0.6) SFX(x, 'heart', 0.6, 0.2); }

// … "like a scared mouse." — insert: a tiny mouse trembling, heart pounding
s03_shot(CUT(s03_ID.heart, 'like'), 'mouse', 'insert: a scared mouse, trembling', (lt, S) => {
  IV_CAM = { x: 975, y: 740, z: 3.2 };
  ivStage(SET_void({ glow: [255, 180, 170], act: () => {
    const tr = Math.sin(F * 2.7) * 3;
    ivCastShadow(960, 820, 120, { a: 0.35, w: 0.9, len: 0.5 });
    P_mouse(960 + tr, 820, 2.2, { f: -1 });
    const b = mod(lt, 0.3) / 0.3, pulse = Math.max(0, 1 - b * 2.5);
    ctx.save(); ctx.translate(1010, 700); ctx.scale(1 + pulse * 0.25, 1 + pulse * 0.25);
    ctx.beginPath(); ctx.moveTo(0, 12); ctx.bezierCurveTo(-30, -10, -16, -34, 0, -18); ctx.bezierCurveTo(16, -34, 30, -10, 0, 12); ctx.fillStyle = '#e8484a'; ctx.fill(); ctx.restore();
    for (const k of [-1, 1]) ivLine(960 + k * 70, 740 + Math.sin(F) * 4, 960 + k * 95, 725, 3, 'rgba(255,230,210,0.6)');
  } }));
  s03_minus();
});
{ const t = CUT(s03_ID.heart, 'like'), t1 = VW(s03_ID.heart, 'Put') - 3 / FPS;
  for (let x = t + 0.05; x < t1; x += 0.45) SFX(x, 'heart', 0.8, 0); SFX(VW(s03_ID.heart, 'mouse'), 'blip', 0.35, -0.2); }

// … "Put me down." — Pickles' paw pushes Kai's cheek away, ears back
s03_shot(CUT(s03_ID.heart, 'Put'), 'putDown', 'Pickles paw on Kai cheek: Put me down.', (lt, S) => {
  IV_CAM = { x: 1360, y: 470, z: 3.0 };
  const u = s03_u(lt, 0.05, 5 / FPS);
  ivStage(SET_bedroom({ act: () => {
    const { m, c } = s03_hugPair(1420, 965, 560, 1, { talk: s03_ID.heart, cat: { eyes: 'angry' }, kai: { eyes: 'happy', mouth: 'grin' }, look: [0.5, -0.3] });
    // the paw reaches up from the cat's chest to Kai's cheek
    const hd = m.head, R = m.R, from = [c.head[0] + 30, c.head[1] + 70], to = [lerp(from[0] + 20, hd[0] - R * 0.55, u), lerp(from[1], hd[1] + R * 0.35, u)];
    s03_paw(...from, ...to, 16);
  } }));
  s03_minus();
});
{ const t = CUT(s03_ID.heart, 'Put'); SFX(t + 0.05, 'swish', 0.6, 0.2); SFX(t + 0.25, 'cloth', 0.6, 0.2); SFX(VW(s03_ID.heart, 'down'), 'thud', 0.4, 0.2); }

// ---------------------------------------------------------------------
//  057–058 the shower
// ---------------------------------------------------------------------
const s03_singer = (lt, o = {}) => {
  const P = SET_POS.bathroom.shower, sw = Math.sin(TT * 5.2) * 0.5 + 0.5, stop = o.stop ?? 0;
  const pose = ivPoseMix(ivPose('stand', { hL: [-0.06, 0.12], hR: [0.12, -0.2], tilt: -0.18 + sw * 0.12, lean: -0.06 }), ivPose('stand', { hL: [-0.03, 0.29], hR: [0.03, 0.29], tilt: 0 }), stop);
  ivMan({ who: { ...CAST.kai, top: 'none' }, x: P[0], y: P[1], h: P[2], f: 0.3, pose, expr: stop > 0.5 ? { eyes: 'wide', mouth: 'o', look: [1, 0] } : { eyes: 'happy', mouth: mod(F, 8) < 4 ? 'open' : 'o' }, grip: { front: stop > 0.5 ? 'open' : 'fist' } });
};
// 057 "You sing in the shower." — the bathroom: steam, a voice through the curtain, notes; slow dolly in
s03_shot(CUT(s03_ID.sing), 'shower', 'shower: Kai sings behind the curtain (dolly)', (lt, S) => {
  s03_move(lt, S, [820, 540, 1.0], [880, 520, 1.35]);
  ivStage(SET_bathroom({ curtain: 0.85, steam: 0.75, doorway: (x, y, s) => ivCat({ x, y, s, f: -1, coat: CATS.pickles, pose: 'sit', expr: { eyes: 'half' } }),
    act: () => s03_singer(lt), front: () => s03_notes(760, 300, 1, 'nA') }));
  s03_minus();
});
{ const t = CUT(s03_ID.sing); SFX(t, 'splash', 0.5, -0.3); SFX(t + 0.02, 'drip', 0.35, -0.3, 2.2); SFX(VW(s03_ID.sing, 'sing'), 'blip', 0.4, -0.2); SFX(VW(s03_ID.sing, 'shower'), 'blip', 0.45, -0.1); SFX(LE(s03_ID.sing) + 0.3, 'splash', 0.35, -0.3); }

// 058 "I have heard birds die more quietly." — Pickles in the doorway, ears flat, deadpan
s03_shot(CUT(s03_ID.birds), 'doorway', 'Pickles in the doorway: I have heard birds die…', (lt, S) => {
  IV_CAM = { x: 1532, y: 860, z: 4.5 }; IV_FOCUS = 2.2;
  ivStage(SET_bathroom({ fg: false, curtain: 0.85, steam: 0.5, doorway: (x, y, s) => ivCat({ x, y, s, f: -1, coat: CATS.pickles, pose: 'sit', talk: s03_ID.birds, expr: { eyes: 'half' }, look: [-0.5, 0] }),
    act: () => s03_singer(lt) }));
  s03_minus();
});
{ const t = CUT(s03_ID.birds); SFX(t, 'swish', 0.4, 0.4); SFX(t + 0.4, 'blip', 0.3, -0.5); }

// … "birds die more quietly." — insert: a little bird on a branch, quietly tipping over
s03_shot(CUT(s03_ID.birds, 'die'), 'bird', 'insert: a bird tips over, quietly', (lt, S) => {
  IV_CAM = { x: 960, y: 520, z: 2.2 * ivPush(S.t0, 0.04, 1.5) };
  const tip = EZ.i2(clamp((lt - 0.25) / 0.4)), fall = clamp((lt - 0.65) / 0.35);
  ivStage(SET_void({ glow: [255, 220, 170], act: () => {
    ctx.save(); ctx.lineCap = 'round'; ivLine(500, 640, 1450, 600, 30, '#6a4e3c'); ivLine(1150, 612, 1260, 540, 16, '#6a4e3c'); ctx.restore();
    for (const [x, y] of [[1260, 540], [1240, 520], [560, 628]]) ivDot(x, y, 26, '#5f8a4f');
    ctx.save(); ctx.translate(960, 625 + EZ.i2(fall) * 420); ctx.rotate(tip * 1.57 + fall * 1.2);
    P_pigeon(0, 0, 2.2, { f: -1, peck: 0, key: 'diebird' }); ctx.restore();
  } }));
  ivTag('…quietly.', 960, 200, 34, ivPop(VW(s03_ID.birds, 'quietly')));
  s03_minus();
}, { boardAt: 0.4 });
{ const t = CUT(s03_ID.birds, 'die'); SFX(t + 0.25, 'blip', 0.3, 0.1); SFX(t + 0.65, 'cloth', 0.3, 0.1); SFX(t + 1.05, 'thud', 0.35, 0.1); }

// ---------------------------------------------------------------------
//  059–060 the bed at night
// ---------------------------------------------------------------------
const s03_BED = { head: [300, 752], h: 500, chest: [470, 726] };
// Kai asleep/awake in bed; Pickles loafed on his chest. o.kai expr, o.cat cat options
function s03_inBed(o = {}) {
  const B = s03_BED;
  return { act: () => { const m = s03_lie(B.head[0], B.head[1], B.h, { expr: o.kai || { eyes: 'open', mouth: 'flat' }, talk: o.talk, bk: 'bed' }); if (o.after) o.after(m); },
    blanket: false, onBed: () => {
      // a blanket over the body (the bump of his chest under it), then Pickles on top
      ctx.beginPath(); ctx.moveTo(392, 775); ctx.bezierCurveTo(398, 722, 450, 702, 520, 704); ctx.bezierCurveTo(640, 704, 720, 668, 800, 684); ctx.bezierCurveTo(950, 716, 1100, 728, 1245, 740); ctx.lineTo(1252, 990); ctx.bezierCurveTo(1000, 1000, 700, 992, 400, 1000); ctx.closePath(); ctx.fillStyle = o.night === false ? '#7e6ca8' : '#33305a'; ctx.fill();
      ivLine(408, 735, 700, 690, 6, 'rgba(255,255,255,0.16)'); ivLine(820, 790, 850, 990, 3, 'rgba(0,0,0,0.13)'); ivLine(1060, 790, 1075, 990, 3, 'rgba(0,0,0,0.13)');
      if (o.cat !== false) { ctx.save(); ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.ellipse(B.chest[0] + 10, B.chest[1] - 12, 95, 16, 0, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
        ivCat({ x: B.chest[0], y: B.chest[1] - 18, s: 170, f: -1, coat: CATS.pickles, pose: 'loaf', ...(o.cat || {}) }); }
      o.front && o.front();
    } };
}
// 059 "And you finally learn why he sleeps on you every night." — night: crane down onto the bed
s03_shot(CUT(s03_ID.learn), 'bedNight', 'night: Kai in bed, Pickles on his chest (crane down)', (lt, S) => {
  s03_move(lt, S, [760, 360, 1.05], [620, 620, 1.45]);
  const q = s03_u(lt, VW(s03_ID.learn, 'why') - S.t0, 6 / FPS);
  ivStage(SET_bedroom({ t: 'night', ...s03_inBed({ kai: { eyes: 'open', mouth: q > 0.5 ? 'smile' : 'flat', look: [0, q] }, cat: { expr: { eyes: 'closed' } } }) }));
  ivTag('WHY?', 760, 180, 34, ivPop(VW(s03_ID.learn, 'why')));
  s03_minus();
});
{ const t = CUT(s03_ID.learn); SFX(t, 'whoosh', 0.6); SFX(VW(s03_ID.learn, 'why'), 'pop', 0.6); SFX(VW(s03_ID.learn, 'night') - 0.2, 'cloth', 0.35); }

// 060 "You're warm. That's it." — Pickles close on the chest, eyes shut, a little heat haze rising
s03_shot(CUT(s03_ID.warm), 'warm', 'Pickles close: You are warm. That is it.', (lt, S) => {
  IV_CAM = { x: 470, y: 655, z: 2.6 }; IV_FOCUS = 1;
  ivStage(SET_bedroom({ t: 'night', ...s03_inBed({ kai: { eyes: 'open', mouth: 'smile', look: [1, 0] }, cat: { talk: s03_ID.warm, expr: { eyes: 'closed' } },
    front: () => { for (let i = 0; i < 4; i++) { const ph = mod(TT * 0.5 + i / 4, 1); ctx.save(); ctx.globalAlpha = 0.25 * Math.sin(Math.PI * ph); ivLine(470 + i * 30 + Math.sin(TT * 3 + i) * 8, 760 - ph * 120, 476 + i * 30 + Math.sin(TT * 3 + i + 1) * 8, 730 - ph * 120, 4, '#ffb070'); ctx.restore(); } } }) }));
  ivTag('WARM', 1250, 220, 38, ivPop(VWE(s03_ID.warm, 'warm') - 0.1), { c: '#ffc890' });
  s03_minus();
});
{ const t = CUT(s03_ID.warm); SFX(t + 0.15, 'cloth', 0.3, -0.3); SFX(VW(s03_ID.warm, 'warm'), 'pop', 0.45, 0.3); SFX(VW(s03_ID.warm, "That's"), 'heart', 0.3, -0.3); }

// … "Don't flatter yourself." — two-shot on the pillow: Kai's hopeful face falls; Pickles opens one eye
s03_shot(CUT(s03_ID.warm, "Don't"), 'flatter', 'pillow two-shot: Don’t flatter yourself.', (lt, S) => {
  IV_CAM = { x: 420, y: 670, z: 2.2 };
  const fall = s03_u(lt, VWE(s03_ID.warm, 'flatter') - S.t0, 6 / FPS);
  ivStage(SET_bedroom({ t: 'night', ...s03_inBed({ kai: { eyes: fall > 0.5 ? 'sad' : 'happy', mouth: fall > 0.5 ? 'frown' : 'smile', brow: fall > 0.5 ? 'sad' : 'up', look: [1, 0] },
    cat: { talk: s03_ID.warm, expr: { eyes: 'half' }, look: [-0.8, 0] } }) }));
  s03_minus();
});
{ const t = CUT(s03_ID.warm, "Don't"); SFX(VWE(s03_ID.warm, 'flatter'), 'drop', 0.45, -0.3); }

// [BEAT] — wordless: a high wide, Kai staring at the ceiling, Pickles asleep, the clock ticks
s03_shot(LE(s03_ID.warm) + 0.35, 'beatBed', 'BEAT: Kai stares at the ceiling, Pickles asleep', (lt, S) => {
  s03_move(lt, S, [700, 560, 1.25], [700, 600, 1.1]);
  ivStage(SET_bedroom({ t: 'night', ...s03_inBed({ kai: { eyes: 'tired', mouth: 'flat', look: [0, -1] }, cat: { pose: 'sleep', s: 170 } }) }));
  s03_minus();
});
{ const t = LE(s03_ID.warm) + 0.35; SFX(t + 0.2, 'tick', 0.3, -0.5); SFX(t + 1.2, 'tick', 0.3, -0.5); SFX(t + 1.0, 'cloth', 0.25, 0); }

// ---------------------------------------------------------------------
//  061–065 dawn, dusk, the night gossip, "you can't turn it off", Noodle and the moth
// ---------------------------------------------------------------------
// a point drawn on layer d (base coords) → screen coords under the current IV_CAM (for bubbles over set cats)
function s03_scr(x, y, d) { const s = 1 + (IV_CAM.z - 1) / d, cx = 960 + (IV_CAM.x - 960) / d, cy = 540 + (IV_CAM.y - 540) / d; return [960 + (x - cx) * s, 540 + (y - cy) * s, s]; }
// 061 "Cats are most awake at dawn…" — sunrise in the bedroom: Pickles stretches in the window light
s03_shot(CUT(s03_ID.dawn), 'dawn', 'dawn: Pickles stretches in the sunbeam', (lt, S) => {
  s03_move(lt, S, [1380, 700, 1.7], [1440, 680, 1.9]);
  const st = Math.sin(Math.PI * clamp((lt - 0.3) / 1.4)), yawn = lt > 0.5 && lt < 1.3;
  ivStage(SET_bedroom({ act: () => {
    s03_cat({ x: 1480, y: 975, s: 170, f: -1, coat: CATS.pickles, pose: 'stand', arch: -6 * st, expr: { eyes: yawn ? 'closed' : 'half', mouth: yawn ? 'open' : 'closed' } });
  } }));
  ivTag('DAWN', 960, 180, 40, ivPop(VW(s03_ID.dawn, 'dawn')), { c: '#ffd9a0' });
  s03_minus();
});
{ const t = CUT(s03_ID.dawn); SFX(t + 0.5, 'gasp', 0.25, 0.4); SFX(t + 0.9, 'cloth', 0.35, 0.4); SFX(VW(s03_ID.dawn, 'dawn'), 'pop', 0.6); }

// … "and dusk." — the street at dusk: cats wake in every window; the camera tracks along the houses
s03_shot(CUT(s03_ID.dawn, 'dusk'), 'dusk', 'dusk: cats in every window (track)', (lt, S) => {
  s03_move(lt, S, [720, 520, 1.08], [1080, 500, 1.15]);
  ivStage(SET_street({ t: 'dusk', act: () => {
    s03_cat({ x: 1180, y: 930, s: 130, f: -1, coat: CATS.alley[0], pose: 'sit', expr: { eyes: 'open' } });
  } }));
  ivTag('DUSK', 960, 180, 40, ivPop(S.t0 + 3 / FPS), { c: '#ffb890' });
  s03_minus();
});
{ const t = CUT(s03_ID.dawn, 'dusk'); SFX(t, 'whoosh', 0.6); SFX(t + 0.1, 'pop', 0.5); }

// 062 "And at night, they gossip." — the roofs at night: the camera cranes down onto two cats whispering
s03_shot(CUT(s03_ID.gossip), 'roofsGossip', 'night roofs: crane down onto two cats gossiping', (lt, S) => {
  s03_move(lt, S, [960, 420, 1.0], [640, 700, 1.75]);
  const tg = VW(s03_ID.gossip, 'gossip');
  ivStage(SET_roofs({ cats: 34, act: () => {
    s03_cat({ x: 540, y: 900, s: 150, f: 1, coat: CATS.alley[3], pose: 'sit', expr: { eyes: 'half', mouth: mod(F, 10) < 5 && TT > tg ? 'open' : 'closed' }, look: [0.6, 0] });
    s03_cat({ x: 720, y: 900, s: 140, f: -1, coat: CATS.alley[2], pose: 'loaf', expr: { eyes: TT > tg + 0.4 ? 'wide' : 'open' }, look: [-0.6, 0] });
    s03_bubble('Did you HEAR?', 480, 680, 26, ivPop(tg - 0.05), { tail: 0.2 });
    s03_bubble('No WAY.', 800, 720, 26, ivPop(tg + 0.45), { tail: -0.3 });
  } }));
  s03_minus();
});
{ const t = CUT(s03_ID.gossip), tg = VW(s03_ID.gossip, 'gossip'); SFX(t, 'whoosh', 0.6); SFX(t + 0.05, 'crowd', 0.12, 0, 4.2); SFX(tg - 0.05, 'blip', 0.4, -0.4); SFX(tg + 0.45, 'blip', 0.45, -0.2); }

// 063 "Every alley,…" — the garage wall behind the market, cats chatting in clumps
s03_shot(CUT(s03_ID.every), 'alley', 'every alley: cats chatting on the wall', (lt, S) => {
  IV_CAM = { x: 960, y: 520, z: 1.06 * ivPush(S.t0, 0.03, 1.2) };
  const A = SET_POS2.alley.wallTop;
  ivStage(SET_alley({ cats: 26, front: () => {
    s03_bubble('…and her TAIL?', A[2][0], A[2][1] - 150, 22, ivPop(S.t0 + 0.1), { tail: 0.2 });
    s03_bubble('mm-hm.', A[7][0], A[7][1] - 140, 22, ivPop(S.t0 + 0.35), { tail: -0.2 });
    s03_bubble('the dog in 4B…', A[11][0], A[11][1] - 150, 22, ivPop(S.t0 + 0.55), { tail: 0 });
  } }));
  s03_minus();
});
{ const t = CUT(s03_ID.every); SFX(t + 0.1, 'blip', 0.35, -0.5); SFX(t + 0.55, 'blip', 0.35, 0.4); }

// … "every roof." — the rooftops, a whole city of cats whispering; the camera tracks across
s03_shot(CUT(s03_ID.every, 'every', 2), 'roofsAll', 'every roof: dozens of cats whispering (track)', (lt, S) => {
  s03_move(lt, S, [640, 560, 1.12], [1240, 520, 1.2]);
  ivStage(SET_roofs({ cats: 60, from: [1100, 500] }));
  const r = RNG('s03gs').f, words = ['psst', 'gasp!', '…no.', 'HER?', 'mrrp', 'tragic', 'psst'];
  const sl = EXT_ROOFSLOTS.filter((x) => x.d !== 1);
  for (let i = 0; i < 7; i++) { const q = sl[Math.floor(r() * sl.length)], p = s03_scr(q.x, q.y - q.s * 1.15, q.d); s03_bubble(words[i], p[0], p[1], 24 + p[2] * 3, ivPop(S.t0 + 0.05 + i * 0.12), { tail: 0 }); }
  s03_minus();
});
{ const t = CUT(s03_ID.every, 'every', 2); SFX(t, 'whoosh', 0.55); SFX(t + 0.4, 'blip', 0.3, -0.3); }

// 064 "You can't turn it off." — Kai in bed, pillow pressed over his head; the gossip pours in through the window
s03_shot(CUT(s03_ID.off), 'pillow', 'Kai, pillow over his head, gossip through the window', (lt, S) => {
  s03_move(lt, S, [700, 620, 1.35], [620, 660, 1.55]);
  const pose = ivPose('stand', { hL: [-0.14, -0.18], hR: [0.14, -0.2] });
  ivStage(SET_bedroom({ t: 'night', ...s03_inBed({ cat: { pose: 'sleep', s: 160 } }), act: () => {
    const B = s03_BED, m = s03_lie(B.head[0], B.head[1], B.h, { pose, expr: { eyes: 'closed', mouth: 'frown' }, bk: 'pl' });
    const sq = Math.sin(TT * 9) * 3;
    ivRR(B.head[0] - 85, B.head[1] - 95 + sq, 150, 130, 40, '#c9cbe0'); ivRR(B.head[0] - 72, B.head[1] - 84 + sq, 120, 26, 12, 'rgba(255,255,255,0.4)');
  } }));
  const words = ['…did you SEE—', 'HISSSS', 'mrrrow?', 'and THEN she…', 'LOUDER!'];
  words.forEach((w, i) => { const a = ivPop(S.t0 + 0.1 + i * 0.32), dr = mod(lt - i * 0.32, 3); s03_bubble(w, 1500 - dr * 60 - i * 40, 250 + i * 110, 24, a, { tail: -0.6 }); });
  s03_minus();
});
{ const t = CUT(s03_ID.off); SFX(t, 'cloth', 0.6); SFX(t + 0.1, 'crowd', 0.16, 0.5, 2.2); SFX(VW(s03_ID.off, 'turn'), 'cloth', 0.5, -0.2); SFX(VW(s03_ID.off, 'off') + 0.3, 'thud', 0.3, -0.2); }

// 065 Noodle "Is that a moth? It's a moth!" — close on a roof: the kitten spots it, wiggles, leaps
s03_shot(CUT(s03_ID.moth), 'noodle', 'Noodle sees the moth, leaps', (lt, S) => {
  IV_CAM = { x: 1270, y: 760, z: 2.5 };
  const tl = VW(s03_ID.moth, "It's") - S.t0, j = clamp((lt - tl) / 0.5), hop = Math.sin(Math.PI * j) * 170, mx = 1180 + Math.sin(lt * 2) * 30, my = 650 - lt * 20;
  ivStage(SET_roofs({ cats: 10, from: [-1500, 0], act: () => {
    const x = lerp(1340, 1200, EZ.io(j)), wig = j === 0 && lt > tl - 0.5 ? Math.sin(F * 1.8) * 4 : 0;
    ivCastShadow(x, 900, 80 * (1 - hop / 400), { a: 0.25, w: 0.6, len: 0.5 });
    ivCat({ x: x + wig, y: 900 - hop, s: 115, f: -1, coat: CATS.noodle, pose: j > 0 && j < 1 ? 'stand' : 'sit', talk: s03_ID.moth, expr: { eyes: 'wide' }, look: [-0.5, -0.8], arch: j > 0 ? 4 : 0 });
    P_moth(mx, my, 1.5, { key: 's03m' }); ivGlow(mx, my, 60, 'rgba(255,230,180,0.25)');
  } }));
  s03_minus();
});
{ const t = CUT(s03_ID.moth), tl = VW(s03_ID.moth, "It's"); SFX(VW(s03_ID.moth, 'moth'), 'pop', 0.4, -0.1); SFX(tl - 0.3, 'step', 0.3); SFX(tl, 'swish', 0.6, -0.2); SFX(tl + 0.5, 'thud', 0.45, -0.2); }

// … "Everyone, it's a moth!" — wide: Noodle tears across the roof after it, every cat's head turns
s03_shot(CUT(s03_ID.moth, 'Everyone'), 'chase', 'Noodle chases the moth across the roofs; cats look', (lt, S) => {
  const pth = SET_POS2.roofs.path, u = clamp(lt / 2.2) * 0.45 * (pth.length - 1) + 1.5, i = Math.floor(u), q = ext_mix(pth[i], pth[Math.min(i + 1, pth.length - 1)], u - i);
  s03_move(lt, S, [520, 640, 1.35], [1000, 620, 1.45]);
  ivStage(SET_roofs({ cats: 44, from: [q[0], 700], yowl: clamp((lt - 1.0) / 1.2) * 0.35, act: () => {
    ivCastShadow(q[0], q[1], 70, { a: 0.25, w: 0.6, len: 0.5 });
    ivCat({ x: q[0], y: q[1], s: 115, f: 1, coat: CATS.noodle, pose: 'walk', phase: lt * 10, talk: s03_ID.moth, expr: { eyes: 'wide' }, look: [0.6, -0.6] });
    P_moth(q[0] + 140 + Math.sin(lt * 3) * 30, q[1] - 170, 1.4, { key: 's03m2' });
  } }));
  s03_minus();
});
{ const t = CUT(s03_ID.moth, 'Everyone'); SFX(t, 'whoosh', 0.6); for (let k = 0; k < 4; k++) SFX(t + 0.15 + k * 0.45, 'step', 0.4, -0.5 + k * 0.25); SFX(t + 1.0, 'crowd', 0.3, 0.2, 1.1); SFX(t + 1.6, 'thud', 0.4, 0.3); }

// ---------------------------------------------------------------------
//  066 three hours of sleep
// ---------------------------------------------------------------------
// a red alarm clock (world coords, base-centre), digits glowing
function s03_alarm(x, y, w, str, blink = 1) {
  const h = w * 0.55, vp = SET_IN.bedroom.vp;
  ivAO(x - w * 0.55, y, x + w * 0.55, y, 14, 0.4);
  ivBox(x - w / 2, y - h, w, h, 0.06, vp, { front: '#c8352e', top: '#e0554a', side: '#8e2620' });
  ivRR(x - w * 0.42, y - h * 0.82, w * 0.84, h * 0.6, w * 0.05, '#140a0c');
  ctx.save(); ctx.globalAlpha = blink; ivText(str, x, y - h * 0.32, h * 0.46, '#ff5a3a', { glow: 'rgba(255,80,50,0.9)', font: '"Courier New", monospace', weight: 700 }); ctx.restore();
  ivGlow(x, y - h * 0.5, w * 1.2, 'rgba(255,80,50,0.35)', blink);
  for (const k of [-1, 1]) ivDot(x + k * w * 0.3, y - h - w * 0.05, w * 0.1, '#e0554a');
}
// 066 "You sleep three hours a night." — the alarm clock at 3:00 beside the pillow, Kai's eyes open in the dark
s03_shot(CUT(s03_ID.sleep), 'clock', 'alarm clock 3:00, Kai awake on the pillow', (lt, S) => {
  IV_CAM = { x: 60, y: 690, z: 2.5 * ivPush(S.t0, 0.04, 1.2) };
  ivStage(SET_bedroom({ t: 'night', fg: false, ...s03_inBed({ kai: { eyes: 'wide', mouth: 'flat', look: [-1, 0] }, cat: { pose: 'sleep' } }),
    front: () => s03_alarm(-120, 762, 190, '3:00', mod(lt, 1) < 0.6 ? 1 : 0.55) }));
  ivTag('3 HOURS A NIGHT', 960, 180, 38, ivPop(VW(s03_ID.sleep, 'three')));
  s03_minus();
});
{ const t = CUT(s03_ID.sleep); SFX(t + 0.1, 'beep', 0.35, -0.4); SFX(VW(s03_ID.sleep, 'three'), 'pop', 0.6); }

// … "hours a night." — morning: Kai upright in bed, bags under his eyes; Pickles beside him, perfectly rested
s03_shot(CUT(s03_ID.sleep, 'hours'), 'tired', 'Kai wrecked in the morning (bags), Pickles fresh', (lt, S) => {
  IV_CAM = { x: 860, y: 600, z: 2.3 };
  const [bx, by, bh] = SET_POS.bedroom.bedSit, nod = Math.max(0, Math.sin(lt * 2.4 - 0.8)) * 0.12;
  ivStage(SET_bedroom({ act: () => {
    const m = ivMan({ who: CAST.kai, x: bx, y: by, h: bh, f: 0.25, pose: ivPose('slump', { tilt: 0.25 + nod }), expr: { eyes: 'tired', mouth: 'flat', look: [0, 0.6] } });
    const R = m.R, cx = m.head[0] + 0.25 * R * 0.42, cy = m.head[1] - R * 0.06, sp = R * 0.38 * (1 - 0.42 * 0.25);
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + k * sp, cy + R * 0.22, R * 0.17, 0.15 * Math.PI, 0.85 * Math.PI); ctx.strokeStyle = 'rgba(150,110,190,0.9)'; ctx.lineWidth = R * 0.05; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + k * sp, cy + R * 0.3, R * 0.15, 0.2 * Math.PI, 0.8 * Math.PI); ctx.strokeStyle = 'rgba(150,110,190,0.6)'; ctx.stroke(); }
  }, onBed: () => ivCat({ x: 1060, y: 868, s: 200, f: -1, coat: CATS.pickles, pose: 'sit', expr: { eyes: 'open' }, look: [-0.6, 0] }) }));
  s03_minus();
});
{ const t = CUT(s03_ID.sleep, 'hours'); SFX(t + 0.35, 'cloth', 0.35, -0.2); SFX(t + 1.0, 'gasp', 0.25, -0.2); }

// ---------------------------------------------------------------------
//  067–069 the classroom, the cat and the pigeon
// ---------------------------------------------------------------------
const s03_SEAT = SET_POS.classroom.seat;
const s03_laughP = (k = 0) => ivPose('sitDesk', { lean: -0.06, tilt: -0.22, dip: 0.14 + Math.abs(Math.sin(F * 1.7 + k)) * 0.012, hL: [0.16, 0.12], hR: [0.08, -0.02 + Math.sin(F * 1.3 + k) * 0.02] });
const s03_teacher = (f, pose, expr, talk) => s03_man({ who: CAST.teacher, x: SET_POS.classroom.teacher[0], y: GROUND, h: 540, f, pose, expr, talk });
// 067 "You laugh at nothing in class." — the classroom: Kai bursts out laughing; the teacher turns from the board
s03_shot(CUT(s03_ID.laugh), 'class', 'class: Kai laughs at nothing, teacher turns (dolly)', (lt, S) => {
  s03_move(lt, S, [1060, 540, 1.0], [1180, 520, 1.3]);
  const turn = s03_u(lt, VW(s03_ID.laugh, 'class') - S.t0, 5 / FPS);
  ivStage(SET_classroom({ act: () => {
    s03_teacher(lerp(-0.6, 0.6, turn), turn > 0.5 ? ivPose('hips') : ivPose('stand', { hR: [0.12, -0.2] }), turn > 0.5 ? { eyes: 'squint', mouth: 'flat', brow: 'angry' } : { eyes: 'open', mouth: 'flat' });
    ivMan({ who: CAST.kai, x: s03_SEAT[0], y: s03_SEAT[1], h: s03_SEAT[2], f: -0.6, pose: s03_laughP(), expr: { eyes: 'happy', mouth: 'grin' } });
  } }));
  s03_minus();
});
{ const t = CUT(s03_ID.laugh), tc = VW(s03_ID.laugh, 'class'); SFX(VW(s03_ID.laugh, 'laugh'), 'laugh', 0.9, 0.4); SFX(tc, 'cloth', 0.45, -0.6); SFX(tc + 0.15, 'step', 0.4, -0.6); }

// 068 Teacher "Something funny, Kai?" — the teacher close, hands on hips
s03_shot(CUT(s03_ID.funny), 'teacher', 'Teacher: Something funny, Kai?', (lt, S) => {
  IV_CAM = { x: 470, y: 520, z: 2.3 };
  ivStage(SET_classroom({ act: () => {
    s03_teacher(0.55, ivPose('hips', { tilt: -0.08 }), { eyes: 'squint', mouth: 'flat', brow: 'angry', look: [1, 0] }, s03_ID.funny);
  } }));
  s03_minus();
});
{ const t = CUT(s03_ID.funny); SFX(t + 0.1, 'cloth', 0.35, -0.3); SFX(VW(s03_ID.funny, 'Kai') + 0.2, 'tick', 0.3, 0.3); }

// 069 You "No. Sorry." — Kai close, sheepish, scratching his head
s03_shot(CUT(s03_ID.sorry), 'sorry', 'Kai close: No. Sorry.', (lt, S) => {
  IV_CAM = { x: 1250, y: 520, z: 2.4 };
  const u = s03_u(lt, 0.15, 6 / FPS);
  ivStage(SET_classroom({ act: () => {
    ivMan({ who: CAST.kai, x: s03_SEAT[0], y: s03_SEAT[1], h: s03_SEAT[2], f: -0.6, talk: s03_ID.sorry, pose: ivPoseMix(ivPose('sitDesk'), ivPose('sitDesk', { hR: [0.0, -0.26], tilt: 0.12 }), u), expr: { eyes: 'open', mouth: 'smile', brow: 'sad', look: [-1, 0] } });
  } }));
  s03_minus();
});
{ const t = CUT(s03_ID.sorry); SFX(t + 0.2, 'cloth', 0.4, 0.3); }

// the ledge outside the window (room layer, d 2.2): the tux cat and a pigeon. o.talk: the cat's insult; o.puff the pigeon's outrage; o.fly
function s03_ledge(o = {}) {
  return (lx, ly, ls) => {
    ivCat({ x: lx - 65, y: ly, s: ls, f: 1, coat: CATS.alley[1], pose: 'sit', expr: { eyes: 'half', mouth: o.talk && mod(F, 6) < 3 ? 'open' : 'closed' }, look: [0.6, 0] });
    const px = lx + 80 + (o.fly || 0) * 160, py = ly - (o.fly || 0) * 260;
    ctx.save(); ctx.translate(px, py); ctx.scale(1 + (o.puff || 0) * 0.18, 1 + (o.puff || 0) * 0.22); P_pigeon(0, 0, 1.25, { f: -1, peck: 0, fly: !!o.fly, key: 's03pg' }); ctx.restore();
  };
}
// … "A cat outside just insulted…" — through the window: the tux cat leans in and says something unforgivable
s03_shot(CUT(s03_ID.sorry, 'cat'), 'ledge', 'ledge: the cat insults the pigeon', (lt, S) => {
  IV_CAM = { x: 2137, y: 496, z: 4.5 }; IV_FOCUS = 2.2;
  ivStage(SET_classroom({ fg: false, kids: false, ledge: s03_ledge({ talk: true }) }));
  s03_bubble('Nice neck, flying rat.', 860, 300, 34, ivPop(S.t0 + 0.12), { tail: -0.5 });
  s03_minus();
});
{ const t = CUT(s03_ID.sorry, 'cat'); SFX(t, 'swish', 0.4, 0.4); SFX(t + 0.12, 'blip', 0.45, 0.3); }

// … "insulted a pigeon." — the pigeon close: puffed up, scandalised
s03_shot(CUT(s03_ID.sorry, 'insulted'), 'pigeon', 'pigeon close: puffed, scandalised', (lt, S) => {
  IV_CAM = { x: 2300, y: 450, z: 5.6 }; IV_FOCUS = 2.2;
  const p = s03_u(lt, 0.25, 4 / FPS);
  ivStage(SET_classroom({ fg: false, kids: false, ledge: s03_ledge({ puff: p }) }));
  ivTag('?!', 1320, 230, 54, ivPop(S.t0 + 0.25), { c: '#ffe6c4' });
  s03_minus();
});
{ const t = CUT(s03_ID.sorry, 'insulted'); SFX(t, 'swish', 0.35, 0.3); SFX(t + 0.25, 'cloth', 0.5, 0.3); SFX(t + 0.28, 'pop', 0.45, 0.3); }

// [BEAT] — wordless: the whole class stares at Kai; outside, the pigeon storms off
s03_shot(LE(s03_ID.sorry) + 0.3, 'beatClass', 'BEAT: everyone stares at Kai; pigeon flies off', (lt, S) => {
  s03_move(lt, S, [980, 540, 1.12], [1020, 540, 1.2]);
  const fly = clamp((lt - 0.4) / 1.2);
  ivStage(SET_classroom({ ledge: s03_ledge({ fly }), act: () => {
    s03_teacher(0.55, ivPose('arms'), { eyes: 'squint', mouth: 'flat', brow: 'angry', look: [1, 0] });
    ivMan({ who: CAST.kai, x: s03_SEAT[0], y: s03_SEAT[1], h: s03_SEAT[2], f: -0.6, pose: ivPose('slump', { tilt: 0.1 }), expr: { eyes: 'open', mouth: 'flat', brow: 'sad', look: [-1, 0] } });
  } }));
  s03_minus();
});
{ const t = LE(s03_ID.sorry) + 0.3; SFX(t + 0.4, 'cloth', 0.45, 0.6); SFX(t + 0.45, 'swish', 0.35, 0.6); SFX(t + 1.1, 'tick', 0.3, -0.4); }

// ---------------------------------------------------------------------
//  070–071 the subscribe joke — Pickles, deadpan, into the lens
// ---------------------------------------------------------------------
const s03_PK = { x: 1000, y: 852, s: 270 };
// the SUBSCRIBE button standing on the bed (world coords, base-centre); u = pop 0..1, push = 0..1 shoved off to the right
function s03_subBtn(x, y, w, u, push = 0) {
  if (u <= 0) return;
  const h = w * 0.32, sc = 0.6 + 0.4 * EZ.back(clamp(u)), dx = EZ.i2(push) * w * 1.6, dy = Math.max(0, push - 0.55) ** 2 * w * 3, rot = EZ.i2(push) * 0.9;
  ctx.save(); ctx.translate(x + dx, y + dy); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.save(); ctx.globalAlpha = 0.35 * (1 - push); ctx.beginPath(); ctx.ellipse(0, 4, w * 0.5, h * 0.12, 0, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  ivRR(-w / 2, -h - h * 0.12, w, h, h * 0.22, '#8e1a14');                 // the thickness (2.5D)
  ivRR(-w / 2, -h - h * 0.24, w, h, h * 0.22, '#e0302a');
  ivRR(-w / 2 + 6, -h - h * 0.2, w - 12, h * 0.3, h * 0.15, 'rgba(255,255,255,0.18)');
  ivText('SUBSCRIBE', w * 0.09, -h * 0.58, h * 0.34, '#ffffff', { track: 2 });
  const bx = -w * 0.36, by = -h * 0.74; ctx.beginPath(); ctx.arc(bx, by, h * 0.16, Math.PI, 0); ctx.lineTo(bx + h * 0.19, by + h * 0.16); ctx.lineTo(bx - h * 0.19, by + h * 0.16); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ivDot(bx, by + h * 0.22, h * 0.05, '#fff');
  ctx.restore();
}
const s03_pickles = (o = {}) => ivCat({ x: s03_PK.x, y: s03_PK.y, s: s03_PK.s, f: -1, coat: CATS.pickles, pose: o.pose || 'sit', expr: o.expr || { eyes: 'half' }, look: o.look || [0.2, 0], ...o.extra });
// 070 "And if you've ever wondered what your cat really thinks of you," — Pickles on the bed slowly turns his eyes to the lens; slow push in
s03_shot(CUT(s03_ID.sub), 'pickCam', 'Pickles turns to the camera, push in', (lt, S) => {
  const tw = VW(s03_ID.sub, 'wondered') - S.t0, lk = s03_u(lt, tw, 8 / FPS);
  s03_move(lt, S, [1060, 660, 1.6], [985, 640, 3.0]);
  ivStage(SET_bedroom({ fg: false, onBed: () => s03_pickles({ look: [lerp(-1, 0.25, lk), lerp(0.3, 0, lk)], expr: { eyes: lk > 0.5 ? 'half' : 'open' } }) }));
});
{ const t = CUT(s03_ID.sub), tw = VW(s03_ID.sub, 'wondered'); SFX(t, 'whoosh', 0.5); SFX(tw, 'swish', 0.3); SFX(VW(s03_ID.sub, 'thinks'), 'tick', 0.25); }

// … "subscribe." — a big red SUBSCRIBE button pops up on the bed beside him. He does not look at it.
s03_shot(CUT(s03_ID.sub, 'subscribe'), 'subscribe', 'SUBSCRIBE button pops next to Pickles', (lt, S) => {
  IV_CAM = { x: 1110, y: 650, z: 2.2 };
  ivStage(SET_bedroom({ fg: false, onBed: () => { s03_pickles({ look: [0.25, 0] }); s03_subBtn(1290, 860, 300, ivPop(S.t0 + 0.12)); } }));
});
{ const t = CUT(s03_ID.sub, 'subscribe'); SFX(t + 0.12, 'pop', 1.0, 0.4); SFX(t + 0.9, 'ding', 0.45, 0.4); }

// 071 "Pickles says…" — without breaking eye contact, a paw slowly pushes the button off the bed
s03_shot(CUT(s03_ID.wont), 'push', 'Pickles pushes the button off the bed, deadpan', (lt, S) => {
  IV_CAM = { x: 1110, y: 650, z: 2.2 };
  const reach = EZ.io(clamp((lt - 0.15) / 0.35)), push = clamp((lt - 0.5) / 0.55), back = s03_u(lt, 1.1, 6 / FPS);
  ivStage(SET_bedroom({ fg: false, onBed: () => {
    s03_subBtn(1290, 860, 300, 1, push);
    const sx = s03_PK.x - 10, sy = s03_PK.y - 70, ex = lerp(lerp(sx + 30, 1135, reach), sx + 30, back), ey = lerp(lerp(sy + 30, 800, reach), sy + 30, back);
    if (reach > 0.05 && back < 0.95) s03_paw(sx, sy, ex + EZ.io(push) * (1 - back) * 60, ey, 26);
    s03_pickles({ look: [0.25, 0] });
  } }));
});
{ const t = CUT(s03_ID.wont); SFX(t + 0.2, 'cloth', 0.4, 0.2); SFX(t + 0.5, 'slide', 0.7, 0.4); SFX(t + 1.05, 'swish', 0.4, 0.8); }

// … "you won't." — extreme close-up: the stare. The button lands somewhere off-screen. He blinks once, curls into a loaf.
s03_shot(CUT(s03_ID.wont, "won't"), 'stare', 'ECU Pickles deadpan stare, then loafs', (lt, S) => {
  IV_CAM = { x: 975, y: 660 + (lt > 2.0 ? 30 : 0), z: 3.2 * ivPush(S.t0, 0.03, 2.5) };
  const loaf = lt > 2.0;
  ivStage(SET_bedroom({ fg: false, onBed: () => s03_pickles({ pose: loaf ? 'loaf' : 'sit', look: [0.25, 0], expr: { eyes: loaf ? 'closed' : 'half' } }) }));
});
{ const t = CUT(s03_ID.wont, "won't"); SFX(t + 0.3, 'thud', 0.6, 0.9); SFX(t + 2.0, 'cloth', 0.4); }
