// =====================================================================
//  s06 — 107–121 · the corner: filming the future. Fifth and Main by day, the days passing (day → sunset),
//  the yellow that is too short, Nia's "Spoiler. The blue van." Sets: SET_corner 'day' / 'sunset', SET_void.
//  Every shot cues on the voice (CUT / VW / VWE / LT / LE). Helpers are s06_*.
// =====================================================================
const s06_E = (lt, a, d = 5 / 24) => EZ.o3(clamp((lt - a) / d));            // a 5-frame gesture that stops hard
const s06_norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
// the end/start of the first of several spellings of a word (the final voice may split "forty-seven")
function s06_wE(id, ...ws) { const L = VL(id); for (const w of ws) { const x = (L.words || []).find((k) => s06_norm(k.w) === s06_norm(w)); if (x) return x.t1; } return L.t1; }
function s06_wS(id, ...ws) { const L = VL(id); for (const w of ws) { const x = (L.words || []).find((k) => s06_norm(k.w) === s06_norm(w)); if (x) return x.t0; } return L.t0; }
const s06_you = (o) => ivMan({ who: CAST.you, y: GROUND, h: 520, blinkKey: 's06', ...o });
const s06_nia = (o) => ivMan({ who: CAST.nia, y: GROUND, h: 500, blinkKey: 's06', ...o });
// a phone held in the front hand, back to us (filming)
const s06_film = (k = 1) => ({ grip: { front: 'hold' }, hold: { front: (x, y, a, h) => P_phone(x, y - h * 0.02, h / 520 * k, { back: true }) } });
// the corner's road: lanes (far drives left, near drives right) and a car on them at speed, crossing x = 800 at tc
const s06_L = SET_POS.corner;
function s06_runner(tc, lane = 1, col = '#c8574a', v = 1500, ghost = false, kind = 'car') {
  const dir = lane ? 1 : -1, x = 820 + dir * v * (TT - tc);
  if (x < -1500 || x > 3400) return;
  const draw = () => (kind === 'van' ? s06_van(x, s06_L.lanes[lane], s06_L.laneS[lane] * 0.95, dir, col) : set_car(x, s06_L.lanes[lane], s06_L.laneS[lane], { col, dir, lights: true }));
  if (ghost) { ivGhost(draw, 0.85); ivGhost(draw, 0.4); } else draw();
}
// a parked / waiting car on the far lane (at the red)
const s06_waiting = (x = 1150, col = '#d9cfb8') => set_car(x, s06_L.lanes[0], s06_L.laneS[0], { col, dir: -1 });
// a blue delivery van, side view, facing dir; s = 1 → ~520 px long; (x, y) = bottom centre
function s06_van(x, y, s, dir = 1, col = '#2f62b8') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 270, 14, 0, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
  const body = () => { ctx.beginPath(); ctx.moveTo(-260, -40); ctx.lineTo(-262, -300); ctx.quadraticCurveTo(-258, -318, -236, -320); ctx.lineTo(120, -320);
    ctx.quadraticCurveTo(150, -318, 170, -296); ctx.lineTo(235, -190); ctx.quadraticCurveTo(262, -180, 264, -150); ctx.lineTo(262, -40); ctx.closePath(); };
  ctx.save(); ctx.translate(IV_M.key[0] * 4, IV_M.key[1] * 4); body(); ctx.lineWidth = 6; ctx.strokeStyle = IV_M.rim; ctx.stroke(); ctx.restore();
  body(); ctx.fillStyle = col; ctx.fill();
  ctx.save(); body(); ctx.clip(); ctx.fillStyle = ivVGrad(-320, -40, ['rgba(255,255,255,0.10)', 'rgba(0,0,0,0.25)']); ctx.fillRect(-270, -330, 540, 300); ctx.restore();
  ivPoly([[120, -300], [160, -296], [222, -196], [120, -196]], '#22293a');                                        // windscreen
  ctx.save(); ctx.globalAlpha = 0.18; ivPoly([[140, -298], [158, -296], [140, -200], [124, -200]], '#fff'); ctx.restore();
  ivRR(-240, -170, 340, 54, 6, '#f2efe6'); ivText('CITY FLOWERS', -70, -132, 30, ivShade(col, -0.35), { track: 2 });   // side panel logo
  ivLine(100, -300, 100, -60, 3, 'rgba(0,0,0,0.3)'); ivRR(60, -200, 30, 8, 3, 'rgba(0,0,0,0.4)');
  ivRR(-264, -70, 528, 26, 6, ivShade(col, -0.45)); ivRR(240, -170, 20, 26, 6, '#fff2c4'); ivGlow(262, -158, 200, 'rgba(255,240,190,0.4)');
  ivRR(-266, -250, 12, 40, 4, '#d6302a');
  [-160, 160].forEach((wx) => { ivDot(wx, -44, 46, '#121119'); ivDot(wx, -44, 24, '#9aa0ad'); const a = x / (46 * s) * dir; ivLine(wx, -44, wx + Math.cos(a) * 20, -44 + Math.sin(a) * 20, 6, '#5a5f6c'); });
  ctx.restore();
}
// a big glove hand + sleeve for hand close-ups (screen coords): wrist at (x, y), pointing ang; h sets the size (lw = 0.034 h)
function s06_arm(x, y, ang, h, grip, col, s = 1, len = 1400) {
  const lw = IV_J.lw * h, c = Math.cos(ang), sn = Math.sin(ang), bx = x - c * len, by = y - sn * len, rw = Math.max(3, h * 0.0016), k = IV_M.key;
  const cx = x - c * lw * 1.1, cy = y - sn * lw * 1.1;
  ctx.save(); ctx.translate(k[0] * rw * 1.2, k[1] * rw * 1.2);
  ivLine(bx, by, x, y, lw + rw * 2, IV_M.rim); ivLine(bx, by, cx, cy, lw * 1.9 + rw * 2, IV_M.rim);
  ivHand(x, y, ang, h, 'glove', grip, () => IV_M.rim, (w) => w + rw * 2, s); ctx.restore();
  ivLine(bx, by, x, y, lw, IV.ink); ivLine(bx, by, cx, cy, lw * 1.9, col, 'butt');
  ivLine(cx - c * lw * 0.3, cy - sn * lw * 0.3, cx, cy, lw * 1.9, ivShade(col, -0.3), 'butt');   // the cuff
  ivHand(x, y, ang, h, 'glove', grip, (q) => q, (w) => w, s);
}
// fingertips wrapping a held thing's edge (drawn over it): n tips along an edge from (x, y) going down, pointing ang
function s06_tips(x, y, n, dx, dy, lw, ang) {
  for (let i = 0; i < n; i++) { const xx = x + i * dx, yy = y + i * dy; ivLine(xx, yy - Math.sin(ang) * lw * 0.15, xx + Math.cos(ang) * lw * 0.5, yy + Math.sin(ang) * lw * 0.5, lw * 0.46, IV.ink); }
}
// the phone camera's view of the intersection (local 360×760): sky, shops, the signal, the road; draws a car crossing at tc
function s06_camView(w, h, o = {}) {
  const day = o.t !== 'sunset';
  ctx.fillStyle = ivVGrad(0, h * 0.55, day ? ['#7fa9d4', '#c9d9e6'] : ['#5b3a6c', '#f2a35e']); ctx.fillRect(0, 0, w, h);
  const r = RNG('s06cam').f; for (let i = 0; i < 6; i++) { const bx = -20 + i * 70, bh = 120 + r() * 160; ivRR(bx, h * 0.5 - bh, 64, bh + 10, 2, day ? ['#b8735a', '#d0ae80', '#7a8aa0'][i % 3] : ['#4a3150', '#62405a', '#3e2c4a'][i % 3]);
    for (let j = 0; j < 3; j++) ivRR(bx + 10, h * 0.5 - bh + 18 + j * 40, 14, 20, 1, day ? '#4e5c74' : '#f7b468'); }
  ctx.fillStyle = day ? '#5a5a62' : '#2e2230'; ctx.fillRect(0, h * 0.5, w, h);
  for (let i = 0; i < 6; i++) ivRR(30 + i * 60, h * 0.52 + i * 0, 36, 70, 2, 'rgba(240,235,220,0.55)');
  ivLine(w * 0.78, h * 0.62, w * 0.78, h * 0.18, 10, '#151824'); ivRR(w * 0.78 - 24, h * 0.1, 48, 112, 10, '#151824');
  const st = o.light || 'red', lc = { red: ['#ff3b30', 0], yellow: ['#ffc22e', 1], green: ['#38e07a', 2] }[st];
  ivDot(w * 0.78, h * 0.1 + 20 + lc[1] * 36, 13, lc[0]); ivGlow(w * 0.78, h * 0.1 + 20 + lc[1] * 36, 70, ivHex(lc[0], 0.6));
  if (o.tc != null) { const x = w * 0.5 + (TT - o.tc) * 900; if (x > -200 && x < w + 200) { ctx.save(); ctx.translate(x, h * 0.66); ctx.scale(0.42, 0.42); ctx.translate(0, 0);
    if (o.kind === 'van') s06_van(0, 0, 1, 1, o.col || '#2f62b8'); else set_car(0, 0, 1, { col: o.col || '#c8574a', lights: true }); ctx.restore(); } }
}
// the stage behind an insert: the set far out of focus (inserts never move)
const s06_soft = (layers) => { IV_FOCUS = 0.42; ivStage(layers); IV_FOCUS = 1; };

// ---------------------------------------------------------------------
//  107 "You can't show anyone the future."  — you point at the ghost of a car running a red; a passer-by walks right
//  through it, eyes on her phone. Nobody else sees it.
// ---------------------------------------------------------------------
SHOT(CUT('107-narrator'), 's06_noOneSees', (lt, S) => {
  IV_CAM = { x: 960, y: 520, z: 1.05 * ivPush(S.t0, 0.03, 1.8) };
  const tp = s06_wS('107-narrator', 'show') - S.t0, u = s06_E(lt, tp);
  ivStage(SET_void({ mood: 'day', act: () => {
    ivGhost(() => { P_trafficLight(1720, GROUND, 0.85, 'red'); P_car(1180 + lt * 260, GROUND, 0.55, { col: '#c8574a', lights: true }); }, 0.6);
    const w = ivWalk(S.t0 - 0.4, 2350, 470, -1);
    ivMan({ who: CAST.extraC, x: w.x, y: GROUND, h: 470, f: -0.75, pose: { ...w.pose, hR: [0.08, 0.1] }, expr: { eyes: 'open', mouth: 'flat', look: [0, 1] }, blinkKey: 's06p',
      grip: { front: 'hold' }, hold: { front: (x, y, a, h) => P_phone(x, y - 6, h / 520, { screen: (W2, H2) => P_phoneUI.news(W2, H2, { head: 'Weekend weather' }) }) } });
    s06_you({ x: 620, f: 0.55, pose: ivPoseMix(ivPose('relaxed'), ivPose('point', { hR: [0.3, -0.02] }), u), expr: { eyes: u > 0.5 ? 'sad' : 'open', mouth: 'flat', brow: 'sad', look: [1, 0] } });
  } }));
}, { sec: 's06', title: "107 nobody else sees the ghost" });

// 108 "But you can show them the corner." — Fifth and Main by day, wide, push-in
SHOT(CUT('108-narrator', 'corner'), 's06_cornerWide', (lt, S) => {
  IV_CAM = { x: 960, y: 540, z: ivPush(S.t0, 0.03, 1.8) };
  ivStage(SET_corner({ t: 'day', light: 'green', act: () => {
    s06_nia({ x: 1130, f: -0.35, pose: ivPose('hips'), expr: { eyes: 'squint', mouth: 'smirk' } });
    s06_you({ x: 820, f: 0.4, pose: ivPose('relaxed'), expr: { eyes: 'open', mouth: 'smile' } });
  } }));
}, { sec: 's06', title: '108 the corner' });
SHOT(CUT('108-narrator'), 's06_butYouCan', (lt, S) => {
  // "But you can show them…" — your face, an idea: a small smile, eyes to the side
  IV_CAM = { x: 860, y: 470, z: 2.7 };
  const u = s06_E(lt, s06_wS('108-narrator', 'show') - S.t0);
  ivStage(SET_corner({ t: 'day', light: 'green', act: () => {
    s06_nia({ x: 1130, f: -0.35, pose: ivPose('hips'), expr: { eyes: 'squint', mouth: 'smirk' } });
    s06_you({ x: 820, f: 0.25, pose: ivPose('relaxed'), expr: { eyes: u > 0.5 ? 'squint' : 'open', mouth: u > 0.5 ? 'smirk' : 'flat', look: [lerp(-1, 1, u), -0.3] } });
  } }));
}, { sec: 's06', title: '108 your idea' });

// ---------------------------------------------------------------------
//  109 Nia: "If you get arrested, I never knew you." — hand close-up: she holds out her phone, you take it;
//  then her deadpan face on "I never knew you"
// ---------------------------------------------------------------------
SHOT(CUT('109-nia'), 's06_handOver', (lt, S) => {
  s06_soft(SET_corner({ t: 'day', light: 'green', fg: false }));
  IV_CAM = { x: 960, y: 540, z: 1 };
  const tg = s06_wS('109-nia', 'arrested') - S.t0, reach = s06_E(lt, tg - 0.25, 6 / 24), pull = s06_E(lt, tg + 0.15, 6 / 24);
  // the phone lies sideways between you: Nia holds its right end, your hand comes in, grips the left end and pulls it away
  const px = 1010 - pull * 330, py = 560 + pull * 30, hw = 355;
  const nOpen = pull > 0.15, nx = 1010 + hw + 120 + pull * 30;
  s06_arm(nx, py + 40, Math.PI - 0.08, 4200, nOpen ? 'open' : 'hold', CAST.nia.col, -1);
  const hx = lerp(-260, px - hw - 120, reach), hy = lerp(760, py + 40, reach);
  s06_arm(hx, hy, -0.05, 4200, reach > 0.95 ? 'hold' : 'open', CAST.you.col, 1);
  P_phone(px, py, 9.5, { ang: -Math.PI / 2, back: true });
  if (!nOpen) s06_tips(1010 + hw - 70, py - 168, 3, -62, 0, 143, Math.PI / 2);
  if (reach > 0.95) s06_tips(px - hw + 70, py - 168, 3, 62, 0, 143, Math.PI / 2);
}, { sec: 's06', title: '109 the phone changes hands' });
SHOT(CUT('109-nia', 'i', 1), 's06_niaNever', (lt, S) => {
  IV_CAM = { x: 1100, y: 480, z: 2.8 };
  ivStage(SET_corner({ t: 'day', light: 'green', act: () => {
    s06_you({ x: 640, f: 0.5, pose: ivPose('phone'), expr: { eyes: 'happy', mouth: 'grin' } });
    s06_nia({ x: 1130, f: -0.3, pose: ivPose('arms'), expr: { eyes: 'tired', mouth: 'flat', brow: 'up' }, talk: '109-nia' });
  } }));
}, { sec: 's06', title: '109 Nia: I never knew you' });

// ---------------------------------------------------------------------
//  110 "Fifth and Main." — the street blades and the signal, low angle; it turns yellow, then red
// ---------------------------------------------------------------------
SHOT(CUT('110-narrator'), 's06_signs', (lt, S) => {
  IV_CAM = { x: 1500, y: 260, z: 2.4 };
  const ty = LE('110-narrator') - S.t0 - 0.2;
  ivStage(SET_corner({ t: 'day', light: lt < ty ? 'green' : 'yellow', fg: false }));
}, { sec: 's06', title: '110 5TH ST x MAIN ST' });

// ---------------------------------------------------------------------
//  111 "Every time a driver is about to run the red, / you see it ten seconds early, / and you're already filming."
// ---------------------------------------------------------------------
SHOT(CUT('111-narrator'), 's06_ghostRunner', (lt, S) => {
  IV_CAM = { x: 960, y: 540, z: ivPush(S.t0, 0.03, 1.8) };
  const tc = s06_wS('111-narrator', 'run'), see = s06_E(TT, tc - 0.5);
  ivStage(SET_corner({ t: 'day', light: 'red', cars: false, road: () => { s06_waiting(); s06_runner(tc, 1, '#c8574a', 1100, true); }, act: () => {
    s06_nia({ x: 1180, f: -0.4, pose: ivPose('relaxed'), expr: { eyes: 'open', mouth: 'flat', look: [-1, 0] } });
    s06_you({ x: 900, f: -0.55, pose: ivPose('phone'), expr: { eyes: see > 0.5 ? 'wide' : 'open', mouth: see > 0.5 ? 'o' : 'flat', look: [-1, 0] }, ...s06_film(1) });
  } }));
}, { sec: 's06', title: '111 the ghost runs the red' });
SHOT(CUT('111-narrator', 'you'), 's06_tenEarly', (lt, S) => {
  IV_CAM = { x: 1020, y: 470, z: 2.7 };
  const tc = s06_wS('111-narrator', 'ten') + 0.2;
  ivStage(SET_corner({ t: 'day', light: 'red', cars: false, road: () => { s06_waiting(); s06_runner(tc, 1, '#c8574a', 1300, true); }, act: () => {
    s06_you({ x: 900, f: -0.25, pose: ivPose('phone'), expr: { eyes: 'wide', mouth: 'flat', look: [-0.6 + 1.2 * clamp((TT - tc + 0.4) / 0.8), 0] }, ...s06_film(1) });
  } }));
  // cyan glints in the eyes: he sees it
  ivGlow(860, 445, 140, 'rgba(127,240,255,0.35)');
  ivTag('10 SECONDS EARLY', 1330, 300, 50, ivPop(VW('111-narrator', 'ten')), { c: IV.ghost, line: 'rgba(127,240,255,0.6)' });
}, { sec: 's06', title: '111 ten seconds early' });
SHOT(CUT('111-narrator', 'and'), 's06_filming', (lt, S) => {
  s06_soft(SET_corner({ t: 'day', light: 'red', cars: false, fg: false }));
  const tc = LE('111-narrator') + 0.25, rec = 3 + lt;
  // your hand from below, phone upright in it; the screen films the corner: the real car runs the red
  s06_arm(1000, 1010, -Math.PI / 2 + 0.06, 4600, 'hold', CAST.you.col, 1);
  P_phone(980, 520, 10, { ang: 0.04, screen: (w, h) => P_phoneUI.camera(w, h, { rec, count: 1, view: (w2, h2) => s06_camView(w2, h2, { tc, light: 'red' }) }) });
  s06_tips(1172, 470, 3, 0, 78, 156, Math.PI);
  s06_tips(788, 640, 1, 0, 0, 170, 0);
}, { sec: 's06', title: "111 already filming: REC" });

// 112 Nia: "So we just stand here?" — the two of you on the corner, you filming, she unconvinced
SHOT(CUT('112-nia'), 's06_standHere', (lt, S) => {
  IV_CAM = { x: 1060, y: 590, z: 1.55 };
  ivStage(SET_corner({ t: 'day', light: 'green', act: () => {
    s06_you({ x: 900, f: -0.6, pose: ivPose('phoneUp'), expr: { eyes: 'squint', mouth: 'flat', look: [-1, 0] }, ...s06_film(1) });
    s06_nia({ x: 1230, f: -0.15, pose: ivPose('arms'), expr: { eyes: 'tired', mouth: 'flat', brow: 'up' }, talk: '112-nia' });
  } }));
}, { sec: 's06', title: '112 Nia: so we just stand here?' });

// 113 You: "Three. Two. Now." — your face behind the phone, the count tags; the ghost car crosses behind you
SHOT(CUT('113-you'), 's06_threeTwo', (lt, S) => {
  IV_CAM = { x: 860, y: 480, z: 2.5 };
  const tc = VW('113-you', 'now') + 10 * 0;
  ivStage(SET_corner({ t: 'day', light: 'red', cars: false, road: () => { s06_waiting(); s06_runner(tc, 1, '#c8574a', 1500, true); }, act: () => {
    s06_you({ x: 980, f: -0.6, pose: ivPose('phoneUp'), expr: { eyes: 'squint', mouth: 'smirk', look: [-1, 0] }, talk: '113-you', ...s06_film(1) });
  } }));
  ivTag('3', 470, 330, 110, ivPop(VW('113-you', 'three')));
  ivTag('2', 640, 330, 110, ivPop(VW('113-you', 'two')));
}, { sec: 's06', title: '113 three, two…' });
SHOT(CUT('113-you', 'now'), 's06_now', (lt, S) => {
  IV_CAM = { x: 960, y: 540, z: 1.04 };
  const tc = VW('113-you', 'now') + 0.12, hit = s06_E(TT, tc, 4 / 24);
  ivStage(SET_corner({ t: 'day', light: 'red', cars: false, road: () => { s06_waiting(); s06_runner(tc, 1, '#c8574a', 1700); }, act: () => {
    s06_you({ x: 900, f: -0.6, pose: ivPose('phoneUp'), expr: { eyes: 'squint', mouth: 'smirk', look: [-1, 0] }, ...s06_film(1) });
    s06_nia({ x: 1230, f: -0.4, pose: ivPoseMix(ivPose('arms'), ivPose('handsUp', { hL: [-0.15, -0.05], hR: [0.12, -0.08] }), hit), expr: { eyes: hit > 0.5 ? 'wide' : 'tired', mouth: hit > 0.5 ? 'open' : 'flat', look: [-1, 0] } });
  } }));
}, { sec: 's06', title: '113 NOW: the real car runs the red' });
// 114 Nia: "No way."
SHOT(CUT('114-nia'), 's06_noWay', (lt, S) => {
  IV_CAM = { x: 1230, y: 470, z: 2.8 };
  ivStage(SET_corner({ t: 'day', light: 'red', act: () => {
    s06_nia({ x: 1230, f: -0.3, pose: ivPose('handsUp', { hL: [-0.15, -0.05], hR: [0.12, -0.08] }), expr: { eyes: 'wide', mouth: 'open', brow: 'up', look: [-1, 0] }, talk: '114-nia' });
  } }));
}, { sec: 's06', title: '114 Nia: no way' });

// ---------------------------------------------------------------------
//  115–117 the days pass: DAY 1 · 4 (day) → DAY 3 · 19 (afternoon) → DAY 5 · 47 (sunset); a near miss in each
// ---------------------------------------------------------------------
function s06_dayShot(id, numWords, day, n, o) {
  SHOT(CUT(id), 's06_day' + day, (lt, S) => {
    IV_CAM = { x: o.cx, y: 560, z: o.z * ivPush(S.t0, 0.02, 1.6) };
    const tE = s06_wE(id, ...numWords), tS = s06_wS(id, ...numWords), tc = tS + 0.1;
    ivStage(SET_corner({ t: o.t, mood: o.mood, light: 'red', cars: false, road: () => { s06_waiting(o.wait, o.waitCol); s06_runner(tc, 1, o.col, 1500); }, act: () => { o.act(lt, tc); } }));
    P_dayCard(o.card, 430, 1.05, day, ivCount(VW(id, 'day'), tE, 0, n), { a: ivPop(VW(id, 'day') - 1 / 24) });
  }, { sec: 's06', title: `${id.slice(0, 3)} DAY ${day} · ${n}` });
}
s06_dayShot('115-narrator', ['four'], 1, 4, { t: 'day', cx: 900, z: 1.04, card: 1400, col: '#c8574a', wait: 1150, act: (lt, tc) => {
  s06_you({ x: 560, f: -0.6, pose: ivPose('phoneUp'), expr: { eyes: 'squint', mouth: 'flat', look: [-1, 0] }, ...s06_film(1) });
  s06_nia({ x: 830, f: -0.35, pose: ivPose('arms'), expr: { eyes: TT > tc ? 'wide' : 'tired', mouth: TT > tc ? 'o' : 'flat', look: [-1, 0] } });
} });
s06_dayShot('116-narrator', ['nineteen'], 3, 19, { t: 'day', mood: 'lunch', cx: 1060, z: 1.1, card: 470, col: '#4a6a8a', wait: 1700, waitCol: '#7a4f7a', act: (lt, tc) => {
  // Nia on an upturned milk crate, bored; you still filming
  ivRR(1180, GROUND - 150, 130, 150, 8, '#3d6fb6'); for (let k = 0; k < 3; k++) ivLine(1192 + k * 52, GROUND - 140, 1192 + k * 52, GROUND - 10, 6, '#2a4f86');
  s06_nia({ x: 1220, f: -0.5, pose: ivPose('sit', { hR: [0.1, 0.05], tilt: 0.15 }), expr: { eyes: 'tired', mouth: 'flat', look: [-1, 0.5] } });
  s06_you({ x: 970, f: -0.6, pose: ivPose('phoneUp'), expr: { eyes: 'squint', mouth: 'smirk', look: [-1, 0] }, ...s06_film(1) });
} });
s06_dayShot('117-narrator', ['forty-seven', 'seven'], 5, 47, { t: 'sunset', cx: 900, z: 1.04, card: 1400, col: '#d9cfb8', wait: 1150, waitCol: '#3d5f8a', act: (lt, tc) => {
  s06_you({ x: 560, f: -0.6, pose: ivPose('phoneUp'), expr: { eyes: 'squint', mouth: 'smirk', look: [-1, 0] }, ...s06_film(1) });
  s06_nia({ x: 830, f: -0.6, pose: ivPose('phoneUp'), expr: { eyes: 'squint', mouth: 'smirk', look: [-1, 0] }, ...s06_film(0.95) });
} });

// ---------------------------------------------------------------------
//  118 Nia: "That yellow is way too short." — she points up at the yellow (sunset)
// ---------------------------------------------------------------------
SHOT(CUT('118-nia'), 's06_tooShort', (lt, S) => {
  IV_CAM = { x: 1360, y: 430, z: 1.9 };
  const u = s06_E(lt, 0.15), ty = s06_wS('118-nia', 'short') + 0.1;
  ivStage(SET_corner({ t: 'sunset', light: TT < ty ? 'yellow' : 'red', act: () => {
    s06_nia({ x: 1190, f: 0.5, pose: ivPoseMix(ivPose('relaxed'), ivPose('point', { hR: [0.2, -0.3] }), u), grip: { front: 'point' }, expr: { eyes: 'squint', mouth: 'flat', brow: 'angry', look: [1, -1] }, talk: '118-nia' });
  } }));
}, { sec: 's06', title: '118 Nia: that yellow is way too short' });

// 119 You: "Two seconds." — the stopwatch in your hand, timing the yellow: it stops at 2.10 as the light goes red
SHOT(CUT('119-you'), 's06_stopwatch', (lt, S) => {
  s06_soft(SET_corner({ t: 'sunset', light: 'red', fg: false }));
  const tE = s06_wE('119-you', 'seconds'), secs = 2.1 * clamp((TT - S.t0) / Math.max(0.1, tE - S.t0)), stop = TT >= tE;
  P_trafficLight(560, 540, 2.7, stop ? 'red' : 'yellow', { head: true });
  s06_arm(1330, 980, -Math.PI / 2 - 0.35, 4600, 'hold', CAST.you.col, 1);
  P_stopwatch(1220, 560, 15, secs);
  s06_tips(1475, 520, 3, 0, 80, 156, Math.PI);
  // the thumb on the crown: presses down on the stop
  const press = stop ? 1 - s06_E(TT, tE + 0.2, 4 / 24) * 0 : 0;
  s06_tips(1150, 240 + press * 18, 1, 0, 0, 190, 0.25);
  ivTag('2.1 S', 900, 880, 56, ivPop(VW('119-you', 'two')));
}, { sec: 's06', title: '119 two seconds (stopwatch 2.10)' });
// "Most places give at least three."
SHOT(CUT('119-you', 'most'), 's06_atLeast3', (lt, S) => {
  IV_CAM = { x: 1020, y: 480, z: 2.5 };
  ivStage(SET_corner({ t: 'sunset', light: 'red', act: () => {
    s06_nia({ x: 1350, f: -0.4, pose: ivPose('hips'), expr: { eyes: 'open', mouth: 'flat' } });
    s06_you({ x: 960, f: 0.3, pose: ivPose('shrug'), expr: { eyes: 'open', mouth: 'flat', brow: 'up' }, talk: '119-you' });
  } }));
  ivTag('MOST PLACES: 3 S', 1250, 300, 50, ivPop(VW('119-you', 'three')));
}, { sec: 's06', title: '119 most places give at least three' });

// ---------------------------------------------------------------------
//  120 Nia: "Spoiler. / The blue van." — her smug close-up, then she points before you do; a blue van coming
// ---------------------------------------------------------------------
SHOT(CUT('120-nia'), 's06_spoiler', (lt, S) => {
  IV_CAM = { x: 1180, y: 470, z: 2.8 };
  const u = s06_E(lt, 0.25);
  ivStage(SET_corner({ t: 'sunset', light: 'red', act: () => {
    s06_nia({ x: 1180, f: -0.3, pose: ivPoseMix(ivPose('relaxed'), ivPose('point', { hR: [0.22, -0.05] }), u), grip: { front: 'point' }, expr: { eyes: 'squint', mouth: 'smirk', look: [-1, 0] }, talk: '120-nia' });
  } }));
}, { sec: 's06', title: '120 Nia: Spoiler.' });
SHOT(CUT('120-nia', 'the'), 's06_blueVan', (lt, S) => {
  IV_CAM = { x: 960, y: 540, z: 1.04 };
  const tc = LT('121-narrator') + 0.35, turn = s06_E(TT, VW('120-nia', 'van'));
  ivStage(SET_corner({ t: 'sunset', light: 'red', cars: false, road: () => { s06_waiting(1150, '#3d5f8a'); s06_runner(tc, 1, '#2f62b8', 1400, false, 'van'); }, act: () => {
    s06_you({ x: 620, f: lerp(0.5, -0.6, turn), pose: ivPose(turn > 0.5 ? 'phoneUp' : 'phone'), expr: { eyes: turn > 0.5 ? 'wide' : 'open', mouth: 'flat', look: [lerp(0.5, -1, turn), turn > 0.5 ? 0 : 0.8] }, ...s06_film(1) });
    s06_nia({ x: 900, f: -0.6, pose: ivPose('point', { hR: [0.3, -0.06] }), grip: { front: 'point' }, expr: { eyes: 'squint', mouth: 'smirk', look: [-1, 0] }, talk: '120-nia' });
  } }));
}, { sec: 's06', title: '120 the blue van (Nia points first)' });

// 121 "She's getting good at this." — the van blasts through the red behind you; you turn to her and smile
SHOT(CUT('121-narrator'), 's06_goodAtThis', (lt, S) => {
  IV_CAM = { x: 1000, y: 590, z: 1.55 };
  const tc = LT('121-narrator') + 0.35, turn = s06_E(TT, tc + 0.35);
  ivStage(SET_corner({ t: 'sunset', light: 'red', cars: false, road: () => { s06_waiting(1150, '#3d5f8a'); s06_runner(tc, 1, '#2f62b8', 1400, false, 'van'); }, act: () => {
    s06_you({ x: 820, f: lerp(-0.6, 0.55, turn), pose: ivPoseMix(ivPose('phoneUp'), ivPose('relaxed'), turn), expr: { eyes: turn > 0.5 ? 'happy' : 'wide', mouth: turn > 0.5 ? 'smile' : 'o', look: [lerp(-1, 1, turn), 0] }, ...s06_film(1) });
    s06_nia({ x: 1150, f: -0.45, pose: ivPose('hips'), expr: { eyes: 'squint', mouth: 'smirk', look: [-1, 0] } });
  } }));
}, { sec: 's06', title: "121 she's getting good at this" });
// [BEAT] — a fist bump at the corner, the sunset behind
SHOT(LE('121-narrator') + 3 / 24, 's06_fistBump', (lt, S) => {
  IV_CAM = { x: 1010, y: 520, z: 1.95 * ivPush(S.t0, 0.03, 1.6) };
  const u = s06_E(lt, 0.25, 5 / 24), back = s06_E(lt, 0.75, 5 / 24), k = u * (1 - back * 0.6);
  ivStage(SET_corner({ t: 'sunset', light: 'green', act: () => {
    s06_you({ x: 870, f: 0.6, pose: ivPoseMix(ivPose('relaxed'), ivPose('handOut', { hR: [0.205, 0.06] }), k), grip: { front: 'fist' }, expr: { eyes: 'happy', mouth: 'grin' } });
    s06_nia({ x: 1150, f: -0.6, pose: ivPoseMix(ivPose('relaxed'), ivPose('handOut', { hR: [0.205, 0.06] }), k), grip: { front: 'fist' }, expr: { eyes: 'happy', mouth: 'smile' } });
  } }));
}, { sec: 's06', title: '121 [beat] fist bump at sunset', boardAt: 0.45 });
