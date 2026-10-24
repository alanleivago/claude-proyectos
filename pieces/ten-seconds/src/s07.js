// =====================================================================
//  s07 — 122–132 · the review, the facts, the fix (~0:40)
//  City hall: Voss at the lectern, Dad in a chair, three officials, Theo + Nia at the back → 47 clips on the
//  projector → "Play it again." → the facts (1,000+ / +1 s / −⅓) → one week later: 3.1 s yellow, Dad's bus,
//  Voss's handshake without looking. Prefix s07_.
// =====================================================================
const s07_r = (t, fr = 5) => EZ.o3(clamp((TT - t) * FPS / fr));     // a fast gesture ramp (fr frames) that stops hard
const s07_HALL = { voss: 520, dad: 790, back: [170, 300] };
const s07_TECH = { key: 'tech', top: 'vest', col: '#33343c', col2: '#f08a24', hat: 'cap', capCol: '#f08a24' };

// Dad's bus cap held in his lap / hands (side view): navy dome, black brim, gold badge
function s07_cap(x, y, s = 1, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 46, 30, 0, Math.PI, TAU); ctx.fillStyle = '#1f2e4f'; ctx.fill();
  ivRR(-48, -4, 96, 10, 4, '#162238'); ctx.beginPath(); ctx.ellipse(40, 4, 34, 7, 0.1, 0, TAU); ctx.fillStyle = '#0f1626'; ctx.fill();
  ivDot(0, -16, 7, '#f2c14e'); ctx.restore();
}
// a close-up arm: shoulder (sx, sy) off-frame → hand (hx, hy), h = the actor height that sets the thickness.
// before() draws under the hand (the thing held), after() over it. Rim pass + body pass like ivMan.
function s07_arm(who, sx, sy, hx, hy, h, grip = 'open', bend = 1, before, after, mode = 'glove') {
  const A = ivIK(sx, sy, hx, hy, IV_J.ua * h, IV_J.fa * h, bend), lw = IV_J.lw * h, sw = 1.75 * lw, rw = Math.max(2, h * 0.009), k = IV_M.key;
  const ang = Math.atan2(A.by - A.ey, A.bx - A.ex), s = hx < sx ? -1 : 1;
  before && before(A.bx, A.by, ang);
  for (const rim of [true, false]) {
    const C = (c) => (rim ? IV_M.rim : c), Wd = (w) => w + (rim ? rw * 2 : 0);
    ctx.save(); if (rim) ctx.translate(k[0] * rw * 0.9, k[1] * rw * 0.9);
    ivLine(sx, sy, A.ex, A.ey, Wd(sw), C(who.col)); ivLine(A.ex, A.ey, lerp(A.ex, A.bx, 0.86), lerp(A.ey, A.by, 0.86), Wd(sw * 0.92), C(who.col));
    if (!rim) { const cx = lerp(A.ex, A.bx, 0.8), cy = lerp(A.ey, A.by, 0.8); ivLine(cx, cy, lerp(A.ex, A.bx, 0.86), lerp(A.ey, A.by, 0.86), sw * 0.95, who.col2 || ivShade(who.col, -0.3), 'butt'); }
    ivHand(A.bx, A.by, ang, h, mode, grip, C, Wd, s);
    ctx.restore();
  }
  after && after(A.bx, A.by, ang);
  return [A.bx, A.by];
}
// fingertips (and a thumb) wrapped round the edge of something held: points in the object's local frame (cx, cy, ang)
function s07_tips(cx, cy, ang, tips, thumbs = [], r = 30) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
  const d = (rim) => { const e = rim ? 4 : 0, c = rim ? IV_M.rim : IV.ink;
    tips.forEach(([x, y]) => ivRR(x - r * 0.9 - e, y - r * 0.8 - e, r * 1.8 + e * 2, r * 1.6 + e * 2, r * 0.8 + e, c));
    thumbs.forEach(([x, y, a]) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ivRR(-r * 1.0 - e, -r * 2.2 - e, r * 2 + e * 2, r * 3.2 + e * 2, r + e, c); ctx.restore(); }); };
  d(true); d(false); ctx.restore();
}
// a phone in Theo's hand with the clip gallery (count of clips)
function s07_gallery(w, h, n) {
  ctx.fillStyle = '#0d0f16'; ctx.fillRect(0, 0, w, h); prop_statusBar(w, '4:12');
  ivText('CORNER CLIPS', 24, 120, 26, '#f2f2ea', { align: 'left', track: 1 }); ivText(n + ' items', 24, 152, 18, '#9aa4b8', { align: 'left', font: IV.sans });
  const cw = (w - 40) / 3;
  for (let i = 0; i < 15; i++) { const cx = 14 + (i % 3) * (cw + 6), cy = 176 + Math.floor(i / 3) * (cw + 6);
    ctx.save(); ctx.beginPath(); ctx.rect(cx, cy, cw, cw); ctx.clip(); s07_thumb(cx, cy, cw, cw, i); ctx.restore();
    ivText('0:1' + (i % 9), cx + cw - 8, cy + cw - 8, 14, '#ffffff', { align: 'right', font: IV.sans, weight: 700 }); }
}
// a tiny clip thumbnail: an intersection with a red signal and a vehicle crossing
function s07_thumb(x, y, w, h, i) {
  const r = RNG('s07th', i).f, dusk = r() < 0.35;
  ctx.fillStyle = dusk ? ivVGrad(y, y + h, ['#5a4060', '#c47a62']) : ivVGrad(y, y + h, ['#8fb0cc', '#cfd8de']); ctx.fillRect(x, y, w, h);
  ivRR(x + w * 0.05, y + h * 0.2, w * 0.3, h * 0.42, 2, dusk ? '#3a2a40' : '#a9927a'); ivRR(x + w * 0.42, y + h * 0.28, w * 0.34, h * 0.34, 2, dusk ? '#2e2436' : '#7f8f7a');
  ctx.fillStyle = '#3a3c46'; ctx.fillRect(x, y + h * 0.62, w, h * 0.38);
  ivLine(x + w * 0.86, y + h * 0.66, x + w * 0.86, y + h * 0.16, Math.max(1.5, w * 0.03), '#1a1c24');
  ivRR(x + w * 0.81, y + h * 0.1, w * 0.1, h * 0.22, 2, '#14151c'); ivDot(x + w * 0.86, y + h * 0.15, w * 0.035, '#ff3b30'); ivGlow(x + w * 0.86, y + h * 0.15, w * 0.12, 'rgba(255,60,40,0.7)');
  const vx = x + w * (0.1 + r() * 0.5), vy = y + h * 0.8, truck = r() < 0.5, col = ['#d9cfb8', '#3d5f8a', '#c8574a', '#e8e4d8'][Math.floor(r() * 4)];
  if (truck) { ivRR(vx - w * 0.2, vy - h * 0.24, w * 0.3, h * 0.2, 2, col); ivRR(vx + w * 0.1, vy - h * 0.16, w * 0.1, h * 0.12, 2, '#5a6070'); }
  else { ivRR(vx - w * 0.14, vy - h * 0.13, w * 0.3, h * 0.1, 3, col); ivRR(vx - w * 0.07, vy - h * 0.19, w * 0.16, h * 0.07, 3, ivShade(col, -0.2)); }
  ivDot(vx - w * 0.1, vy - h * 0.02, w * 0.035, '#111'); ivDot(vx + w * 0.12, vy - h * 0.02, w * 0.035, '#111');
}

// the projector, paused on clip 1: a still of the corner + a play button
function s07_paused(w, h) {
  s07_thumb(0, 0, w, h, 3); ctx.fillStyle = 'rgba(10,10,20,0.25)'; ctx.fillRect(0, 0, w, h);
  ivDot(w / 2, h / 2, 62, 'rgba(10,10,20,0.6)'); ivPoly([[w / 2 - 20, h / 2 - 32], [w / 2 - 20, h / 2 + 32], [w / 2 + 34, h / 2]], '#f7f2e6');
  ivRR(0, h - 34, w, 34, 0, 'rgba(10,10,20,0.6)'); ivRR(16, h - 20, w - 32, 6, 3, 'rgba(255,255,255,0.3)'); ivRR(16, h - 20, 40, 6, 3, '#e5352b');
  ivText('CLIP 01 / 47', 18, 30, 20, '#f7f2e6', { align: 'left', font: IV.sans, weight: 800, shadow: 'rgba(0,0,0,0.5)' });
}
// the hearing room with everyone in it. o: { voss, dad, off (officials), you, nia } each { pose, expr, talk, f }
function s07_hearing(o = {}) {
  const Hh = SET_POS.hearing, keys = [CAST.city2, CAST.cityW, CAST.city3];
  const L = SET_hearing({ screen: o.screen || s07_paused, sharpScreen: o.sharpScreen, fg: o.fg, act: () => {
    keys.forEach((w, k) => { const p = (o.off || [])[k] || {};
      ivMan({ who: w, x: Hh.officials[k], y: GROUND, h: 500, f: p.f ?? (k - 1) * -0.25, pose: p.pose || ivPose('sit', { hL: [0.07, 0.25], hR: [-0.07, 0.25], bendL: -1, bendR: 1 }), expr: p.expr || { eyes: 'open', mouth: 'flat', look: [(1 - k) * 0.6 - 1, 0] }, talk: p.talk, grip: p.grip, blinkKey: 'off' + k }); });
    set_chair(s07_HALL.dad, GROUND, 520, 1, '#3a2a22');
    const d = o.dad || {};
    ivMan({ who: CAST.dadHome, x: s07_HALL.dad, y: GROUND, h: 520, f: d.f ?? 0.55, pose: d.pose || ivPose('sit', { hL: [0.16, 0.2], hR: [0.2, 0.2] }), expr: d.expr || { eyes: 'tired', mouth: 'flat', look: [0.4, 0.6] },
      grip: { front: 'hold' }, hold: d.cap === false ? null : { front: (x, y) => s07_cap(x - 20, y - 4, 1, d.capAng ?? 0.15) } });
    const v = o.voss || {};
    ivMan({ who: CAST.voss, x: s07_HALL.voss, y: GROUND, h: 545, f: v.f ?? 0.5, pose: v.pose || ivPose('stand', { hR: [0.16, 0.12], hL: [0.1, 0.13] }), expr: v.expr || { eyes: 'squint', mouth: 'smirk' }, talk: v.talk, grip: v.grip });
  } });
  // Theo + Nia at the back (the audience plane, d 1.7), standing by the side wall
  if (o.back !== false) L.splice(2, 0, { d: 1.7, draw: () => {
    const y = 870, u = o.you || {}, n = o.nia || {};
    ivMan({ who: CAST.nia, x: s07_HALL.back[0], y, h: 360, f: n.f ?? 0.45, pose: n.pose || ivPose('arms'), expr: n.expr || { eyes: 'squint', mouth: 'flat' }, talk: n.talk });
    ivMan({ who: CAST.you, x: s07_HALL.back[1], y, h: 375, f: u.f ?? 0.5, pose: u.pose || ivPose('phone'), expr: u.expr || { eyes: 'open', mouth: 'flat', look: [1, 0] },
      hold: u.phone === false ? null : { R: (x, yy, a) => P_phone(x + 4, yy - 6, 0.55, { ang: 0.2, screen: (w, h) => s07_gallery(w, h, 47) }) } });
  } });
  if (o.heads) L.push({ d: 0.75, draw: () => [[150, 0], [390, 1], [560, 0]].forEach(([x, k]) => { ivDot(x, 292 + k * 6, 40, '#140e10'); if (k) ivDot(x - 14, 254, 16, '#140e10'); ivRR(x - 60, 312 + k * 6, 120, 90, 30, '#140e10'); }) });   // audience heads (in the projector framing)
  return L;
}

// ---- 122 "The review." — wide, the whole room, a slow push -------------------------------------------
SHOT(CUT('122-narrator'), 's07_review', () => {
  IV_CAM = { x: 980, y: 520, z: 1.04 * ivPush(CUT('122-narrator'), 0.03, 1.8) };
  ivStage(s07_hearing());
}, { sec: 's07', title: 'The review: city hall wide — Voss at the lectern, Dad, 3 officials, Theo + Nia at the back' });
{ const t = CUT('122-narrator');
  SFX(t, 'whoosh', 1.2); SFX(t + 0.05, 'crowd', 0.35, 0, 2.8); SFX(t + 0.4, 'paper', 0.4, 0.5); SFX(t + 0.9, 'cloth', 0.35, -0.6); SFX(t + 1.5, 'thud', 0.3, 0.1); SFX(t + 2.2, 'paper', 0.3, 0.6); }

// ---- 123 "Voss," — Voss at the lectern, smooth, the red tie ------------------------------------------
SHOT(CUT('123-narrator', 'Voss'), 's07_voss', () => {
  IV_CAM = { x: 610, y: 445, z: 2.6 }; IV_FOCUS = 1;
  ivStage(s07_hearing({ voss: { f: 0.35, pose: ivPose('stand', { hR: [0.15, 0.1], hL: [0.06, 0.12] }), expr: { eyes: 'squint', mouth: 'smirk' } } }));
}, { sec: 's07', title: 'Voss close: smirk, red tie' });
SFX(CUT('123-narrator', 'Voss'), 'swish', 0.6, -0.3); SFX(CUT('123-narrator', 'Voss') + 0.05, 'cloth', 0.4, -0.3);

// ---- "Dad," — Dad in the chair, cap off in his hands, eyes down --------------------------------------
SHOT(CUT('123-narrator', 'Dad'), 's07_dad', () => {
  IV_CAM = { x: 800, y: 520, z: 2.9 };
  const turn = Math.floor((TT - CUT('123-narrator', 'Dad')) * FPS / 6) % 2;   // turning the cap in his fingers
  ivStage(s07_hearing({ dad: { f: 0.4, pose: ivPose('sit', { hL: [0.13, 0.08], hR: [0.2, 0.09], tilt: 0.2 }), expr: { eyes: 'sad', mouth: 'frown', look: [0.5, 1] }, capAng: turn ? 0.1 : 0.22 } }));
}, { sec: 's07', title: 'Dad close: cap in his hands, eyes down' });
{ const t = CUT('123-narrator', 'Dad'); SFX(t, 'swish', 0.5); for (let k = 1; k * 0.25 < VW('123-narrator', 'three') - t; k++) SFX(t + k * 0.25, 'cloth', 0.3, 0.1); }   // the cap turning in his fingers

// ---- "and three people from the city." — the officials behind their nameplates ---------------------
SHOT(CUT('123-narrator', 'three'), 's07_three', () => {
  IV_CAM = { x: 1450, y: 560, z: 1.75 };
  const t = VW('123-narrator', 'three');
  ivStage(s07_hearing({ off: [0, 1, 2].map((k) => ({ expr: { eyes: TT > t + k * 0.18 ? 'open' : 'tired', mouth: 'flat', look: [-1, 0.2] }, f: -0.15 })) }));
  [0, 1, 2].forEach((k) => { const p = ivPop(t + k * 0.12); ivTag(String(k + 1), 960 + (SET_POS.hearing.officials[k] - 1450) * 1.75, 250, 34, p); });
}, { sec: 's07', title: 'Three officials at the long table, nameplates, 1·2·3 pop' });
{ const t = VW('123-narrator', 'three'); SFX(CUT('123-narrator', 'three'), 'swish', 0.6, 0.4);
  [0, 1, 2].forEach((k) => SFX(t + k * 0.12, 'pop', 0.8, -0.4 + k * 0.4)); SFX(t + 0.6, 'paper', 0.35, 0.3); }

// ---- 124 Voss: "A teenager with a phone." — medium, his hand sweeps back toward the kid ------------
SHOT(CUT('124-voss'), 's07_vossTalk', () => {
  IV_CAM = { x: 520, y: 560, z: 1.55 };
  const u = s07_r(VW('124-voss', 'teenager'), 5);
  const P = ivPoseMix(ivPose('stand', { hR: [0.16, 0.12], hL: [0.1, 0.13] }), ivPose('stand', { hL: [-0.3, -0.02], hR: [0.16, 0.12], tilt: -0.08 }), u);
  ivStage(s07_hearing({ voss: { f: 0.45, pose: P, expr: { eyes: 'squint', mouth: 'smirk' }, talk: '124-voss', grip: { back: 'open' } },
    you: { expr: { eyes: 'open', mouth: 'flat', look: [1, 0] } } }));
}, { sec: 's07', title: 'Voss talks, his hand flicks back at Theo' });
SFX(CUT('124-voss'), 'swish', 0.5, -0.4); SFX(VW('124-voss', 'teenager'), 'swish', 0.9, -0.5); SFX(VW('124-voss', 'teenager') + 0.12, 'cloth', 0.5, -0.5);

// ---- "…with a phone." — Theo's hand on the phone: 47 clips in the gallery ----------------------------
SHOT(CUT('124-voss', 'with'), 's07_phone', () => {
  IV_CAM = { x: 820, y: 500, z: 1.7 }; IV_FOCUS = 0.5;
  ivStage(s07_hearing({ fg: false, back: false }));
  // screen space: the phone in Theo's glove, the arm in from the bottom right
  s07_arm(CAST.you, 1800, 1500, 1000, 700, 3000, 'hold', 1, null, () => {
    P_phone(960, 500, 7.6, { ang: -0.1, screen: (w, h) => s07_gallery(w, h, 47) });
    s07_tips(960, 500, -0.1, [[150, 40], [154, 130], [150, 215], [138, 290]], [[-150, 210, 0.5]], 30);
  });
  ivTag('47 CLIPS', 1500, 300, 44, ivPop(VW('124-voss', 'phone') - 0.05));
}, { sec: 's07', title: 'Hand close-up: Theo\'s phone, the gallery of corner clips' });
SFX(CUT('124-voss', 'with'), 'swish', 0.6, 0.4); SFX(CUT('124-voss', 'with') + 0.06, 'plastic', 0.6, 0.2); SFX(VW('124-voss', 'phone') - 0.05, 'pop', 1, 0.5); SFX(VW('124-voss', 'phone') + 0.2, 'tick', 0.4, 0);

// ---- "Really?" — Voss close, eyebrow up, the smirk ----------------------------------------------------
SHOT(CUT('124-voss', 'really'), 's07_really', () => {
  IV_CAM = { x: 630, y: 450, z: 3.0 };
  const u = s07_r(VW('124-voss', 'really'), 4);
  ivStage(s07_hearing({ voss: { f: 0.2, pose: ivPose('shrug', { tilt: -0.1 * u, hL: [lerp(0.1, -0.17, u), lerp(0.13, 0.1, u)], hR: [lerp(0.16, 0.17, u), lerp(0.12, 0.1, u)] }), expr: { eyes: 'squint', mouth: 'smirk', brow: u > 0.5 ? 'up' : null, look: [-0.6, 0] }, talk: '124-voss' } }));
}, { sec: 's07', title: 'Voss close: "Really?" shrug, brow up' });
SFX(CUT('124-voss', 'really'), 'swish', 0.4, -0.3); SFX(VW('124-voss', 'really'), 'cloth', 0.6, -0.3); SFX(VW('124-voss', 'really') + 4 / FPS, 'swish', 0.5, -0.4);   // the shrug

// ---- the projector, framed full: the screen plane is d 1.7, its centre (680, 365) → frame centre --------
const s07_SCR = () => { IV_CAM = { x: 484, y: 242, z: 2.87 }; IV_FOCUS = 1.7; };
// a grid of n clip thumbnails filling the screen (8 × 6), the newest flashing red
function s07_grid(w, h, n, tLand) {
  ctx.fillStyle = '#121219'; ctx.fillRect(0, 0, w, h);
  ivRR(0, 0, w, 40, 0, '#1e1d28'); ivText('5TH & MAIN  ·  RED-LIGHT RUNS', 14, 28, 18, '#f7f2e6', { align: 'left', font: IV.sans, weight: 800, track: 2 });
  ivText(String(n), w - 70, 31, 30, '#ff6a5a', { align: 'right', weight: 800 }); ivText('CLIPS', w - 14, 29, 16, '#f7f2e6', { align: 'right', font: IV.sans, weight: 800 });
  const cw = (w - 18) / 8, ch = (h - 52) / 6;
  for (let i = 0; i < n; i++) { const x = 4 + (i % 8) * (cw + 1.4), y = 46 + Math.floor(i / 8) * (ch + 1);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, cw - 2, ch - 2); ctx.clip(); s07_thumb(x, y, cw - 2, ch - 2, i); ctx.restore();
    if (i === n - 1 && TT < tLand + 0.3) ivRR(x, y, cw - 2, ch - 2, 2, null, '#ff3b30', 3); }
}

// ---- 125 "Forty-seven clips." — the projector fills with clips, one per near miss, landing on "forty-seven"
SHOT(CUT('125-narrator'), 's07_grid', () => {
  s07_SCR();
  const t1 = VWE('125-narrator', 'Forty-seven'), n = Math.max(1, ivCount(CUT('125-narrator'), t1, 1, 47));
  ivStage(s07_hearing({ sharpScreen: true, back: false, heads: true, screen: (w, h) => s07_grid(w, h, n, t1) }));
  ivTag('47', 960, 560, 120, ivPop(t1), { c: '#ffe2b0' });
}, { sec: 's07', title: 'The projector fills with clips, 1 → 47 on "forty-seven"' });
{ const t0 = CUT('125-narrator'), t1 = VWE('125-narrator', 'Forty-seven');
  SFX(t0, 'click', 1.1); SFX(t0 + 0.04, 'buzz', 0.25);   // the projector comes on
  for (let n = 2; n < 47; n += 3) SFX(t0 + (t1 - t0) * (1 - Math.cbrt(1 - (n - 1) / 46)), 'tick', 0.45, -0.6 + (n % 8) * 0.17);   // clips landing (ivCount eases o3)
  SFX(t1, 'blip', 1.2); SFX(t1, 'impact', 0.7); SFX(t1 + 0.02, 'pop', 1.2); }

// a plain delivery truck (not the RAPIDO truck from the crash): P_truck with its logo painted over
function s07_truck(x, y, s) {
  P_truck(x, y, s, { dir: 1, col: '#e8e4d8', cab: '#3d7a5a' });
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ivRR(-850, -860, 1140, 600, 6, '#e3ded2'); prop_shade(-850, -860, 1140, 600, 0.25);
  ['#3d7a5a', '#7ab36a'].forEach((c, i) => ivRR(-850, -420 + i * 40, 1140, 26, 0, c)); ivText('GREENLEAF', -280, -520, 120, '#2e5c44', { track: 4 }); ctx.restore();
}
// a phone-camera frame on screen: corner brackets, REC + time, the clip number (the footage Theo shot)
function s07_rec(clip, day) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const m = 110, L = 70, top = IV.bar + 50, bot = H - IV.bar - 50;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  [[m, top, 1, 1], [W - m, top, -1, 1], [m, bot, 1, -1], [W - m, bot, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.beginPath(); ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke(); });
  ivRR(W / 2 - 120, top - 6, 240, 52, 12, '#e5352b'); if (Math.floor(TT * 2) % 2 === 0) ivDot(W / 2 - 88, top + 20, 9, '#fff');
  ivText('00:00:' + String(Math.floor(mod(TT * 1, 50)) + 10).padStart(2, '0'), W / 2 + 14, top + 34, 30, '#fff', { font: IV.sans, weight: 700 });
  ivTag('CLIP ' + clip, m + 150, bot - 30, 30, 1); ivText(day, W - m - 10, bot - 22, 26, 'rgba(255,255,255,0.85)', { align: 'right', font: IV.sans, weight: 800, track: 3 });
  ctx.restore();
}

// ---- 126 "Forty-seven trucks and vans," — clip: a box truck runs the red at Fifth and Main --------------
SHOT(CUT('126-narrator'), 's07_clipTruck', (lt) => {
  IV_CAM = { x: 1000, y: 520, z: 1.12 };
  const T0 = CUT('126-narrator'), x = lerp(-1500, 3300, (TT - T0) / Math.max(0.5, VW('126-narrator', 'flying') - T0));
  ivStage(SET_corner({ t: 'day', light: 'red', cars: false, road: () => s07_truck(x, SET_POS.corner.lanes[1], 0.5) }));
  s07_rec(12, 'DAY 2');
}, { sec: 's07', title: 'Clip 12: a truck flies through the red' });
{ const T0 = CUT('126-narrator'), T1 = VW('126-narrator', 'flying');
  SFX(T0, 'whoosh', 1); SFX(T0 + 0.03, 'camera', 0.7); SFX(T0 + 0.1, 'beep', 0.4); SFX(T0 + 0.05, 'engine', 0.8, -0.5, T1 - T0);
  SFX(lerp(T0, T1, 0.51), 'car', 1.4, 0, 1.6); SFX(lerp(T0, T1, 0.56), 'horn', 0.6, 0.5, 0.4); }   // the truck flies across the red

// ---- "flying through the same red light." — clip 31 at sunset: the red signal, a van streaks under it --
SHOT(CUT('126-narrator', 'flying'), 's07_clipVan', () => {
  IV_CAM = { x: 1430, y: 470, z: 1.9 };
  const T0 = CUT('126-narrator', 'flying'), x = lerp(3400, -900, (TT - T0) / Math.max(0.5, LE('126-narrator') - T0));
  ivStage(SET_corner({ t: 'sunset', light: 'red', cars: false, road: () => P_car(x, SET_POS.corner.lanes[0], 0.55, { dir: -1, col: '#3d6fa0', lights: true }) }));
  s07_rec(31, 'DAY 4');
}, { sec: 's07', title: 'Clip 31: the red signal close, a van streaks through' });
{ const T0 = CUT('126-narrator', 'flying'), T1 = LE('126-narrator');
  SFX(T0, 'camera', 0.7); SFX(T0 + 0.02, 'swish', 0.6); SFX(lerp(T0, T1, 0.46), 'car', 1.3, 0, 1.2); SFX(lerp(T0, T1, 0.5), 'whoosh', 0.8, -0.4); }

// ---- [BEAT 2 s] silence: the officials staring at the screen ------------------------------------------
SHOT(LE('126-narrator'), 's07_silence', () => {
  IV_CAM = { x: 1540, y: 520, z: 2.25 };
  const t = LE('126-narrator') + 0.9;
  ivStage(s07_hearing({ off: [
    { expr: { eyes: 'wide', mouth: 'flat', look: [-1, -0.2] }, f: -0.2 },
    { expr: { eyes: TT > t ? 'open' : 'squint', mouth: 'flat', brow: TT > t ? 'up' : null, look: [-1, -0.2] }, f: -0.2 },
    { expr: { eyes: 'wide', mouth: TT > t + 0.4 ? 'o' : 'flat', look: [-1, -0.2] }, f: -0.25 }] }));
}, { sec: 's07', title: 'Beat: silence — the officials stare at the screen' });
{ const t = LE('126-narrator');   // near silence: room tone, a clock, one breath
  SFX(t + 0.05, 'crowd', 0.12, 0, 2); [0.5, 1.0, 1.5].forEach((d) => SFX(t + d, 'tick', 0.2, 0.6)); SFX(t + 1.3, 'gasp', 0.45, 0.6); }

// ---- (beat) Voss's smirk drains away ---------------------------------------------------------------------
SHOT(lerp(LE('126-narrator'), CUT('127-citywoman'), 0.5), 's07_vossDrop', () => {
  IV_CAM = { x: 630, y: 450, z: 3.0 };
  const t = lerp(LE('126-narrator'), CUT('127-citywoman'), 0.5) + 0.5;
  ivStage(s07_hearing({ voss: { f: 0.3, pose: ivPose('stand', { hR: [0.15, 0.1], hL: [0.06, 0.12] }), expr: { eyes: TT > t ? 'open' : 'squint', mouth: TT > t ? 'flat' : 'smirk', look: [0.8, 0] } } }));
}, { sec: 's07', title: 'Beat: Voss\'s smirk drains away' });
{ const t = lerp(LE('126-narrator'), CUT('127-citywoman'), 0.5); SFX(t, 'swish', 0.3, -0.3); SFX(t + 0.5, 'drop', 0.5, -0.2); [1.0, 1.5].forEach((d) => SFX(t + d, 'tick', 0.18, 0.6)); }

// ---- 127 City Woman: "Play it again." — close, one finger up ----------------------------------------------
SHOT(CUT('127-citywoman'), 's07_again', () => {
  IV_CAM = { x: 1450, y: 450, z: 2.9 };
  const u = s07_r(VW('127-citywoman', 'play'), 5);
  const P = ivPoseMix(ivPose('sit', { hL: [0.07, 0.25], hR: [-0.07, 0.25], bendL: -1, bendR: 1 }), ivPose('sit', { hL: [0.07, 0.25], hR: [0.1, -0.06], bendL: -1, bendR: 1 }), u);
  ivStage(s07_hearing({ off: [{}, { pose: P, f: -0.1, expr: { eyes: 'squint', mouth: 'flat', brow: 'angry', look: [-1, 0] }, talk: '127-citywoman', grip: { front: 'point' } }, {}] }));
}, { sec: 's07', title: 'City woman close: "Play it again." finger up' });
SFX(CUT('127-citywoman'), 'swish', 0.4, 0.4); SFX(VW('127-citywoman', 'play'), 'swish', 0.9, 0.3); SFX(VW('127-citywoman', 'play') + 5 / FPS, 'cloth', 0.5, 0.3); SFX(LE('127-citywoman') + 0.15, 'click', 0.9, -0.3);   // finger up; the projector restarts

// ---- 128 "In the US, red-light crashes kill more than a thousand people a year." — the fact card ---------
SHOT(CUT('128-narrator'), 's07_thousand', () => {
  IV_CAM = { x: 900, y: 470, z: 1.5 }; IV_FOCUS = 0.45;
  ivStage(s07_hearing({ fg: false, back: false }));
  const t0 = CUT('128-narrator'), t1 = VWE('128-narrator', 'thousand'), n = ivCount(VW('128-narrator', 'kill'), t1, 0, 1000);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(14,10,16,0.35)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  P_statCard(560, 230, 800, 520, n.toLocaleString('en-US') + (TT >= t1 ? '+' : ''), 'PEOPLE KILLED EVERY YEAR', { a: ivPop(t0), head: 'RED-LIGHT CRASHES · USA', accent: '#ff7a5a' });
}, { sec: 's07', title: 'Fact card: 1,000+ killed a year (US), lands on "thousand"' });
{ const t0 = CUT('128-narrator'), a = VW('128-narrator', 'kill'), t1 = VWE('128-narrator', 'thousand');
  SFX(t0, 'whoosh', 0.9); SFX(t0 + 0.02, 'pop', 1.1); SFX(t0 + 0.1, 'paper', 0.4);
  for (let k = 1; k < 10; k++) SFX(a + (t1 - a) * (1 - Math.cbrt(1 - k / 10)), 'tick', 0.45);   // 0 → 1,000
  SFX(t1, 'blip', 1.1); SFX(t1 + 0.02, 'pop', 0.8, 0.3); SFX(t1 + 0.05, 'thud', 0.6); }

// a timeline of the yellow phase: 2.1 s now, +1 s growing (u 0..1), drawn at (x, y), 1 s = px
function s07_yellowBar(x, y, px, u) {
  ivRR(x - 14, y - 64, px * 3.4 + 28, 128, 22, 'rgba(14,12,20,0.82)', 'rgba(255,214,160,0.5)', 2);
  ivRR(x, y - 34, px * 2.1, 68, 12, '#ffc43a'); ivText('2.1 s', x + px * 1.05, y + 14, 40, '#3a2a10');
  if (u > 0) { ivRR(x + px * 2.1 + 6, y - 34, px * u - 6, 68, 12, '#ffe27a'); ivGlow(x + px * 2.6, y, 140 * u, 'rgba(255,220,90,0.55)'); if (u > 0.6) ivText('+1 s', x + px * 2.6 + 3, y + 14, 40, '#3a2a10'); }
  for (let k = 0; k <= 3; k++) { ivLine(x + px * k, y + 44, x + px * k, y + 56, 3, 'rgba(255,236,214,0.6)'); ivText(k + ' s', x + px * k, y + 92, 22, 'rgba(255,236,214,0.7)', { font: IV.sans }); }
}
// ---- 129 "Studies found that one extra second of yellow" — the yellow signal + its timeline growing a second
SHOT(CUT('129-narrator'), 's07_plusOne', () => {
  const t0 = VW('129-narrator', 'one'), t1 = VWE('129-narrator', 'second');
  ivStage(SET_void({ mood: 'sunset', floor: false, act: () => {
    P_trafficLight(470, 520, 2.3, 'yellow', { head: true });
  } }));
  s07_yellowBar(780, 520, 300, EZ.o3(clamp((TT - t0) / Math.max(0.1, t1 - t0))));
  ivTag('YELLOW LIGHT', 1290, 330, 34, ivPop(CUT('129-narrator')));
}, { sec: 's07', title: 'Graphic: the yellow light, its 2.1 s bar grows +1 s on "second"' });
{ const t0 = VW('129-narrator', 'one'), t1 = VWE('129-narrator', 'second');
  SFX(CUT('129-narrator'), 'whoosh', 1); SFX(CUT('129-narrator') + 0.03, 'click', 0.8, -0.5); SFX(CUT('129-narrator') + 0.05, 'pop', 0.8, 0.3);
  SFX(t0, 'rise', 0.9, 0, t1 - t0); SFX(t0, 'slide', 0.7, 0.3); SFX(t1, 'shimmer', 1, 0.3); SFX(t1 + 0.05, 'pop', 0.6, 0.4); }   // +1 s grows

// ---- "…can cut red-light running by about a third." — bars: before / after, the after bar loses a third --
SHOT(CUT('129-narrator', 'cut'), 's07_third', () => {
  const t0 = VW('129-narrator', 'cut'), t1 = VWE('129-narrator', 'third'), u = EZ.o3(clamp((TT - t0) / Math.max(0.1, t1 - t0)));
  ivStage(SET_void({ mood: 'sunset', floor: false }));
  const x = 260, L = 1000;
  ivText('RED-LIGHT RUNNING', x, 250, 40, '#ffe2b0', { align: 'left', glow: 'rgba(255,160,80,0.5)', track: 3 });
  [['BEFORE', 1, 0.15], ['AFTER +1 s', 1 - u / 3, 0.15]].forEach(([lab, f], k) => { const y = 380 + k * 200;
    ivText(lab, x, y - 20, 26, 'rgba(255,236,214,0.8)', { align: 'left', font: IV.sans, track: 3 });
    ivRR(x, y, L, 90, 14, 'rgba(255,255,255,0.08)');
    ivRR(x, y, L * f, 90, 14, k ? '#ff7a5a' : '#d6302a');
    for (let i = 0; i < 12; i++) { const cx = x + 40 + i * 80; if (cx < x + L * f - 30) ivRR(cx - 22, y + 30, 44, 30, 8, 'rgba(20,10,10,0.35)'); }   // little cars in the bar
    if (k && u > 0) { ivRR(x + L * f, y, L * (1 - f), 90, 14, null, 'rgba(255,214,160,0.6)', 3); }
  });
  P_statCard(1310, 520, 400, 300, '−⅓', 'FEWER RED-LIGHT RUNS', { a: ivPop(t1 - 2 / FPS), accent: '#ffe27a' });
}, { sec: 's07', title: 'Chart: before/after bars, the after bar loses ⅓ on "third"' });
{ const t0 = VW('129-narrator', 'cut'), t1 = VWE('129-narrator', 'third');
  SFX(CUT('129-narrator', 'cut'), 'swish', 0.7); SFX(CUT('129-narrator', 'cut') + 0.04, 'pop', 0.6, -0.5); SFX(t0 + 0.1, 'slide', 0.8, 0.1); SFX(lerp(t0, t1, 0.5), 'slide', 0.6, 0);
  SFX(t1 - 2 / FPS, 'pop', 1.1, 0.5); SFX(t1, 'blip', 1, 0.5); SFX(t1 + 0.04, 'thud', 0.5, 0.5); }   // the after bar loses a third

// ---- 130 "One week later," — Fifth and Main, a tech re-timing the signal; Theo + Nia watch ---------------
SHOT(CUT('130-narrator'), 's07_week', () => {
  IV_CAM = { x: 1060, y: 520, z: 1.08 * ivPush(CUT('130-narrator'), 0.03, 1.8) };
  const C = SET_POS.corner;
  ivStage(SET_corner({ t: 'day', light: 'yellow', act: () => {
    ivMan({ who: s07_TECH, x: C.pole - 130, y: GROUND, h: 520, f: 0.7, pose: ivPose('phoneUp', { hR: [0.2, -0.02], hL: [0.12, 0.12] }), expr: { eyes: 'open', mouth: 'flat', look: [1, -1] }, grip: { front: 'point' },
      hold: { back: (x, y) => { ctx.save(); ctx.translate(x + 6, y - 20); ctx.rotate(0.3); ivRR(-34, -46, 68, 92, 8, '#22242e'); ivRR(-28, -40, 56, 80, 4, '#9fd3c4'); ctx.restore(); } } });
    ivMan({ who: CAST.nia, x: 620, y: GROUND, h: 520, f: 0.6, pose: ivPose('arms'), expr: { eyes: 'open', mouth: 'smirk', look: [1, -0.5] } });
    ivMan({ who: CAST.you, x: 820, y: GROUND, h: 540, f: 0.6, pose: ivPose('relaxed', { hR: [0.1, 0.12] }), expr: { eyes: 'open', mouth: 'smile', look: [1, -0.5] } });
  } }));
  ivTag('ONE WEEK LATER', 960, 170, 40, ivPop(VW('130-narrator', 'one')));
}, { sec: 's07', title: 'One week later: Fifth and Main, a tech re-times the signal, Theo + Nia watch' });
{ const t = CUT('130-narrator');
  SFX(t, 'whoosh', 1.1); SFX(t + 0.05, 'car', 0.5, -0.6, 1.5); SFX(t + 0.15, 'engine', 0.3, 0.4, 1.2); SFX(t + 0.25, 'type', 0.5, 0.6, 0.8);   // street; the tech on his tablet
  SFX(VW('130-narrator', 'one'), 'pop', 0.9); SFX(VW('130-narrator', 'later') + 0.1, 'click', 0.7, 0.6); SFX(VW('130-narrator', 'later') + 0.15, 'metal', 0.4, 0.6); }

// ---- "…that yellow gets its extra second." — Theo's stopwatch on the new yellow: 3.10 s ----------------
SHOT(CUT('130-narrator', 'that'), 's07_watch', () => {
  IV_CAM = { x: 1500, y: 330, z: 1.6 }; IV_FOCUS = 0.4;
  ivStage(SET_corner({ t: 'day', light: 'yellow', fg: false }));
  const t0 = VW('130-narrator', 'that'), t1 = VWE('130-narrator', 'second'), secs = lerp(0, 3.1, clamp((TT - t0) / Math.max(0.1, t1 - t0)));
  const press = TT > t1 ? 1 : 0;
  s07_arm(CAST.you, 1500, 1500, 900, 760, 2900, 'hold', -1, null, () => {
    P_stopwatch(800, 520, 15, secs, { dial: 10 });
    s07_tips(800, 520, 0, [[250, -40], [262, 60], [250, 160]], [], 34);
    s07_tips(800, 520, 0, [], [[ -10, -320 + press * 14, 0]], 34);   // the thumb on the crown, pressing on "second"
  });
  ivTag('3.1 s', 1450, 300, 54, ivPop(t1), { c: '#ffe27a' });
}, { sec: 's07', title: 'Hand close-up: the stopwatch stops at 3.10 on "second"' });
{ const t0 = VW('130-narrator', 'that'), t1 = VWE('130-narrator', 'second');
  SFX(CUT('130-narrator', 'that'), 'swish', 0.6, 0.3); SFX(t0, 'click', 1, 0.2);
  for (let k = 1; k * 0.25 < t1 - t0; k++) SFX(t0 + k * 0.25, 'tick', 0.45, 0.2);   // the stopwatch running
  SFX(t1, 'click', 1.2, 0.2); SFX(t1 + 0.02, 'pop', 1, 0.5); SFX(t1 + 0.08, 'ding', 0.8, 0.5); }   // stops on 3.1

// ---- 131 "Dad gets his bus back." — the night bus again, Dad at the wheel, cap on; he touches the brim ----
SHOT(CUT('131-narrator'), 's07_bus', () => {
  const B = SET_POS.busFront;
  IV_CAM = { x: 620, y: 640, z: 2.1 * ivPush(CUT('131-narrator'), 0.03, 1.8) };
  const u = s07_r(VW('131-narrator', 'back'), 5);
  ivStage(SET_busFront({ t: 'night', light: 'green', act: () => {
    const P = ivPoseMix(ivPose('drive'), ivPose('drive', { hR: [0.16, -0.2] }), u);
    ivMan({ who: CAST.dad, x: B.driver[0], y: B.driver[1], h: B.driver[2], f: 0.55, pose: P, expr: { eyes: u > 0.5 ? 'happy' : 'open', mouth: 'smile', look: [1, 0] }, grip: { front: u > 0.5 ? 'flat' : 'hold', back: 'hold' } });
  } }));
}, { sec: 's07', title: 'Dad back at the wheel of the night bus, cap on, touches the brim' });
{ const t = CUT('131-narrator');
  SFX(t, 'whoosh', 1); SFX(t + 0.05, 'engine', 0.9, 0, LE('131-narrator') - t + 0.6); SFX(t + 0.3, 'car', 0.4, 0.6, 1.2);
  SFX(VW('131-narrator', 'back'), 'cloth', 0.6, -0.3); SFX(VW('131-narrator', 'back') + 5 / FPS, 'swish', 0.4, -0.3); }   // he touches the brim

// the office pair: Dad (left, facing right) and Voss (right, turned away, reading a paper), hands clasped; pump 0..1
function s07_shakeAct(pump, vossExpr, dadExpr) {
  const dy = Math.sin(pump * Math.PI * 4) * 0.025, dX = 520, vX = 840, h = 545;
  const d = ivMan({ who: CAST.dad, x: dX, y: GROUND, h: 540, f: 0.6, pose: ivPose('handOut', { hR: [0.27, 0.1 + dy] }), expr: dadExpr || { eyes: 'open', mouth: 'flat', look: [1, 0] }, grip: { front: 'hold' } });
  // Voss's back arm reaches exactly to Dad's hand (shoulder from the rig: IV_J, f 0.55)
  const shY = GROUND - h * IV_J.shY + h * 0.004, shX = vX - IV_J.sw * h * (1 - 0.55 * 0.55);
  ivMan({ who: CAST.voss, x: vX, y: GROUND, h, f: 0.55, pose: ivPose('stand', { hL: [(d.handR[0] + 14 - shX) / h, (d.handR[1] - 4 - shY) / h], hR: [0.12, 0.08] }), expr: vossExpr || { eyes: 'tired', mouth: 'flat', look: [1, 0.6] }, grip: { back: 'hold' },
    hold: { front: (x, y) => { ctx.save(); ctx.translate(x + 6, y - 34); ctx.rotate(0.15); ivRR(-32, -42, 64, 84, 4, '#f4f1ea'); ivRR(-24, -30, 48, 6, 2, '#c9c4b8'); ivRR(-24, -18, 40, 6, 2, '#c9c4b8'); ivRR(-24, -6, 44, 6, 2, '#c9c4b8'); ctx.restore(); } } });
}
// ---- 132 "Voss shakes his hand…" — the handshake, close: blue cuff, grey cuff, two gloves pumping -------
SHOT(CUT('132-narrator'), 's07_hands', () => {
  IV_CAM = { x: 700, y: 560, z: 1 }; IV_FOCUS = 0.3;
  ivStage(SET_office({ fg: false, act: () => {} }));
  const p = Math.sin(clamp((TT - VW('132-narrator', 'shakes')) / 0.9) * Math.PI * 3) * 40;
  const VO = { ...CAST.voss, col2: '#eef0f4' }, DA = { ...CAST.dad, col2: '#2a4f86' };
  s07_arm(VO, 1950, 1250, 1060, 560 + p, 3600, 'hold', 1);
  s07_arm(DA, 60, 1300, 870, 610 + p, 3600, 'hold', -1);
  s07_tips(1000, 560 + p, 0, [[100, -70], [124, 14]], [], 40);   // Voss's fingertips over Dad's knuckles
}, { sec: 's07', title: 'Hand close-up: the handshake, blue cuff and grey cuff' });
{ const t = VW('132-narrator', 'shakes'); SFX(CUT('132-narrator'), 'swish', 0.6);
  SFX(t, 'cloth', 1); SFX(t + 0.02, 'thud', 0.4); [0.15, 0.45, 0.75].forEach((d) => SFX(t + d, 'cloth', 0.55, 0)); }   // grip + three pumps

// ---- "…without looking at him." — two-shot: Voss's eyes on his paper, Dad looking at him ------------------
SHOT(CUT('132-narrator', 'without'), 's07_away', () => {
  IV_CAM = { x: 690, y: 470, z: 2.0 };
  const pump = clamp((TT - CUT('132-narrator', 'without')) / 0.7);
  ivStage(SET_office({ act: () => s07_shakeAct(pump, { eyes: 'tired', mouth: 'flat', look: [1, 0.6] }, { eyes: 'sad', mouth: 'flat', look: [1, 0] }) }));
}, { sec: 's07', title: 'Two-shot: Voss shakes without looking up from his paper; Dad looks at him' });
{ const t = CUT('132-narrator', 'without'); SFX(t, 'swish', 0.4); SFX(t + 0.1, 'cloth', 0.5, -0.1); SFX(t + 0.3, 'paper', 0.5, 0.3); SFX(t + 0.6, 'cloth', 0.4, -0.1); }

// ---- [BEAT 1 s] Dad walks out past the glass; Theo waiting in the corridor; Dad's small nod ---------------
SHOT(LE('132-narrator'), 's07_out', () => {
  IV_CAM = { x: 860, y: 540, z: 1.2 };
  const t0 = LE('132-narrator'), w = ivWalk(t0, 900, 540, -1, 6, t0 + 0.67);
  ivStage(SET_office({ act: () => {
    ivMan({ who: CAST.voss, x: SET_POS.office.boss, y: GROUND, h: 520, f: -0.2, pose: ivPose('sitDesk'), expr: { eyes: 'tired', mouth: 'flat', look: [-0.5, 0.5] } });
    ivMan({ who: CAST.you, x: 300, y: GROUND, h: 520, f: 0.5, pose: ivPose('relaxed'), expr: { eyes: TT > t0 + 0.6 ? 'happy' : 'open', mouth: 'smile', look: [1, 0] } });
    ivMan({ who: CAST.dad, x: w.x, y: GROUND, h: 540, f: w.moving ? -0.7 : -0.5, pose: w.moving ? w.pose : ivPose('relaxed'), expr: { eyes: 'open', mouth: TT > t0 + 0.6 ? 'smile' : 'flat', look: [-1, 0] } });
  } }));
}, { sec: 's07', title: 'Beat: Dad walks out toward Theo, both small smiles; Voss back at his desk' });
{ const t0 = LE('132-narrator'); SFX(t0, 'swish', 0.4); [0, 1, 2].forEach((k) => SFX(t0 + k * 6 / FPS, 'step', 0.8, -0.1 - k * 0.1));   // ivWalk 6 frames/step until +0.67
  SFX(t0 + 0.3, 'glass', 0.25, 0.3); SFX(t0 + 0.75, 'cloth', 0.4, -0.4); SFX(t0 + 1.0, 'paper', 0.3, 0.5); }   // past the glass; the nod; Voss's papers
