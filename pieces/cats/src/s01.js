// =====================================================================
//  s01 — 001–025 · cold open (3 a.m., the wall of cats, Boss), "two weeks earlier", the morning (Pickles talks),
//  the montage + title, the fact (the meow is for us). Every time comes from the voice (CUT / VW / VWE / LT / LE).
// =====================================================================
// a fast gesture ramp on absolute time: 0 before a, 1 after a + d (default 5 frames), eased out, hard stop
const s01_r = (a, d = 5 / FPS) => EZ.o3(clamp((TT - a) / d));
// a camera move over the shot: a → b ([x, y, z]) eased in-out over dur seconds from the shot start
const s01_cam = (lt, a, b, dur) => { const u = EZ.io(clamp(lt / dur)); IV_CAM = { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u) }; };
// a set's far layers + a screen-space layer on top (fn draws in screen px, 1920x1080)
function s01_cu(layers, fn) {
  const L = layers.filter((l) => l.d > 1.05);
  L.push({ d: 1, blur: 0, draw: () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); fn(); ctx.restore(); } });
  return L;
}
// a big arm for inserts: P = [shoulder, elbow, wrist] in px, sleeve colour col, h = the actor height it belongs to
function s01_arm(P, h, col, o = {}) {
  const lw = IV_J.lw * h, sw = 1.75 * lw, rw = Math.max(1.6, h * 0.009), k = IV_M.key, n = P.length;
  const ang = o.ang ?? Math.atan2(P[n - 1][1] - P[n - 2][1], P[n - 1][0] - P[n - 2][0]);
  const pass = (rim) => {
    const Cc = (c) => (rim ? IV_M.rim : c), Wd = (w) => w + (rim ? rw * 2 : 0);
    ctx.save(); if (rim) ctx.translate(k[0] * rw * 0.9, k[1] * rw * 0.9);
    for (let i = 0; i < n - 1; i++) ivLine(P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], Wd(lw), Cc(IV.ink));
    for (let i = 0; i < n - 1; i++) { const b = i === n - 2 ? 0.84 : 1; ivLine(P[i][0], P[i][1], lerp(P[i][0], P[i + 1][0], b), lerp(P[i][1], P[i + 1][1], b), Wd(sw * (i ? 0.92 : 1)), Cc(col)); }
    ivHand(P[n - 1][0], P[n - 1][1], ang, h, 'glove', o.grip || 'open', Cc, Wd, o.s ?? 1);
    ctx.restore();
  };
  pass(true); pass(false);
}
// a standing cat with its cast shadow
function s01_cat(o) { if (o.shadow !== false) ivCastShadow(o.x, o.y, o.s * 0.9, { w: 0.42, len: 0.65, a: o.sa ?? 0.3 }); return ivCat(o); }
function s01_man(o) { if (o.shadow !== false) ivCastShadow(o.x, o.y, o.h, { a: o.sa ?? 0.3 }); return ivMan(o); }
// a speech bubble (cream, rounded, a tail toward tx,ty); text flips from `from` to `to` at tFlip (a squash)
function s01_bubble(x, y, text, a = 1, o = {}) {
  if (a <= 0) return;
  const size = o.size ?? 44; let str = text, sy = 1;
  if (o.to && o.tFlip != null) { const d = TT - o.tFlip; if (d >= 0) str = o.to; sy = Math.abs(d) < 3 / FPS ? Math.max(0.15, Math.abs(d) / (3 / FPS)) : 1; }
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.font = `800 ${size}px ${IV.font}`;
  const w = ctx.measureText(str).width + size * 1.2, h = size * 1.7, sc = 0.7 + 0.3 * EZ.back(clamp(a));
  ctx.translate(x, y); ctx.scale(sc, sc * sy);
  const tx = (o.tx ?? x) - x, ty = (o.ty ?? y + h) - y;
  ctx.save(); ctx.translate(4, 6); ivPoly([[-size * 0.4, h * 0.3], [size * 0.4, h * 0.3], [tx * 0.6, ty * 0.6]], 'rgba(0,0,0,0.3)'); ivRR(-w / 2, -h / 2, w, h, h * 0.45, 'rgba(0,0,0,0.3)'); ctx.restore();
  ivPoly([[-size * 0.4, h * 0.3], [size * 0.4, h * 0.3], [tx * 0.6, ty * 0.6]], o.bg || '#fbf1e0');
  ivRR(-w / 2, -h / 2, w, h, h * 0.45, o.bg || '#fbf1e0', o.line || 'rgba(60,40,30,0.25)', 3);
  ivText(str, 0, size * 0.36, size, o.c || '#2a1e1c', { track: 1 });
  ctx.restore();
}
// sfx helpers (registration time only): a count's ticks as ivCount lands them (o3)
function s01_sfxCount(t0, t1, a, b, kind, v, pan, step = 1) { for (let k = a + step; k <= b; k += step) { const y = (k - a - 0.5 * step) / (b - a), x = 1 - Math.cbrt(1 - y); SFX(t0 + x * (t1 - t0), kind, k >= b ? v * 1.4 : v, pan); } }

// =====================================================================
//  COLD OPEN — the alley at 3 a.m.
// =====================================================================
const s01_A = () => SET_POS2.alley;
const s01_boss = (o = {}) => { const B = s01_A().boss; return ivCat({ x: B[0], y: B[1], s: B[2], f: -1, coat: CATS.boss, pose: o.pose || 'sit', expr: o.expr || { eyes: 'angry' }, talk: o.talk, look: o.look || [-0.4, 0.6] }); };
const s01_kaiAlley = (o = {}) => s01_man({ who: CAST.kai, x: o.x ?? 520, y: GROUND, h: 520, f: o.f ?? 0.5, pose: o.pose || ivPose('stand'), expr: o.expr || { eyes: 'wide', mouth: 'flat', look: [0.3, -1] }, sa: 0.4 });
// yowl share: the wall screams in waves (0.35..1)
const s01_yw = (lt) => 0.55 + 0.45 * Math.sin(lt * 5.3) * Math.sin(lt * 1.7 + 1);

// SHOT — "It's three in the morning." — a slow crane down from the moon onto the wall; 40 cats, Boss, you small
SHOT(0, 's01_alleyCrane', (lt, S) => {
  s01_cam(lt, [940, 30, 1.3], [940, 560, 1.02], Math.max(1, S.t1 - S.t0));
  ivStage(SET_alley({ cats: 40, yowl: clamp((lt - 1.2) / 1.5) * s01_yw(lt), act: () => { s01_boss({ pose: lt > 2 ? 'yowl' : 'sit' }); s01_kaiAlley(); } }));
  ivTag('3:00 A.M.', 230, 140, 30, ivPop(VW('001-narrator', 'three')));
}, { sec: 's01', title: "It's three in the morning — crane down onto the wall, 3:00 A.M." });
SFX(0, 'crowd', 0.35, 0, CUT('003-boss'));                                         // 40 cats yowling under the cold open
SFX(0.3, 'whoosh', 0.5);
SFX(VW('001-narrator', 'three'), 'pop', 0.8, -0.6);                                // 3:00 A.M.
SFX(LT('001-narrator') + 1.6, 'drip', 0.4, 0.4);                                  // the pipe into the puddle

// SHOT — "Forty cats" — tracking along the wall top, the count lands on "Forty"
SHOT(CUT('002-narrator'), 's01_forty', (lt, S) => {
  s01_cam(lt, [560, 330, 2.2], [1360, 330, 2.2], S.t1 - S.t0 + 0.5);
  ivStage(SET_alley({ cats: 40, yowl: 0.3, fg: false, act: () => s01_boss() }));
  ivTag(String(ivCount(S.t0, VWE('002-narrator', 'forty'), 0, 40)) + ' CATS', 960, 160, 46, ivPop(S.t0 + 2 / FPS));
}, { sec: 's01', title: 'Forty cats — track along the wall, 40 counts up' });
s01_sfxCount(CUT('002-narrator'), VWE('002-narrator', 'forty'), 0, 40, 'tick', 0.35, 0, 8);

// SHOT — "are screaming" — close on a cluster of cats, all yowling
SHOT(CUT('002-narrator', 'are'), 's01_scream', (lt, S) => {
  IV_CAM = { x: 1200, y: 275, z: 2.9 * ivPush(S.t0, 0.04, 0.5) };
  ivStage(SET_alley({ cats: 40, yowl: 0.75, fg: false }));
}, { sec: 's01', title: 'screaming — CU cluster, all yowl' });
SFX(CUT('002-narrator', 'are'), 'crowd', 0.9, -0.2, 0.7);
SFX(VW('002-narrator', 'screaming'), 'gasp', 0.5, -0.3);                   // a hiss in the front row

// SHOT — "at you from a wall." — you, small, from low behind the crates: wide eyes up at the wall
SHOT(CUT('002-narrator', 'at'), 's01_youLow', (lt, S) => {
  IV_CAM = { x: 640, y: 560, z: 1.9 };
  ivStage(SET_alley({ cats: 40, yowl: 0.6 * s01_yw(lt), act: () => { s01_boss(); s01_kaiAlley({ x: 560, f: 0.35, pose: ivPose('stand', { hL: [-0.06, 0.26], hR: [0.07, 0.25] }), expr: { eyes: 'wide', mouth: 'o', brow: 'up', look: [0.6, -1] } }); } }));
}, { sec: 's01', title: 'at you from a wall — you CU, eyes up' });
SFX(CUT('002-narrator', 'at') + 0.1, 'step', 0.5, -0.3);                           // one step back
SFX(CUT('002-narrator', 'at') + 0.7, 'gasp', 0.4, -0.2);

// SHOT — Boss: "Last chance, human." — low angle on Boss, the moon behind, his one eye; the wall goes quiet
SHOT(CUT('003-boss'), 's01_bossTalk', (lt, S) => {
  IV_CAM = { x: 960, y: 230, z: 2.6 * ivPush(S.t0, 0.03, 1.6) };
  ivStage(SET_alley({ cats: 40, fg: false, act: () => s01_boss({ talk: '003-boss', expr: { eyes: 'half' } }) }));
}, { sec: 's01', title: 'Boss: "Last chance, human." — low CU, one eye' });
SFX(CUT('003-boss'), 'impact', 0.6);                                               // the wall falls silent on Boss
SFX(CUT('003-boss') + 0.4, 'cloth', 0.4, 0.1);

// SHOT — "Pay the price," — extreme close: Boss's good eye narrows
SHOT(CUT('003-boss', 'pay'), 's01_bossEye', (lt, S) => {
  const B = SET_POS2.alley.boss; IV_CAM = { x: B[0] + 20, y: B[1] - 175, z: 5.2 };
  ivStage(SET_alley({ cats: 40, fg: false, act: () => s01_boss({ talk: '003-boss', expr: { eyes: 'angry' }, look: [-0.6, 0.3] }) }));
}, { sec: 's01', title: 'Pay the price — ECU, the eye narrows' });
SFX(CUT('003-boss', 'pay') + 0.05, 'swish', 0.5, 0.2);

// SHOT — "or walk away." — you glance back over your shoulder at the dark mouth of the alley
SHOT(CUT('003-boss', 'or'), 's01_walkAway', (lt, S) => {
  const u = s01_r(S.t0 + 0.15, 5 / FPS);
  IV_CAM = { x: 600, y: 470, z: 2.6 };
  ivStage(SET_alley({ cats: 40, act: () => { s01_boss(); s01_kaiAlley({ x: 560, f: lerp(0.4, -0.6, u), expr: { eyes: 'sad', mouth: 'flat', look: [lerp(0.5, -1, u), 0] } }); } }));
}, { sec: 's01', title: 'or walk away — you CU, glance back' });
SFX(CUT('003-boss', 'or') + 0.15, 'cloth', 0.6, -0.3);

// =====================================================================
//  "your little sister is lost" · "the only ones who saw … are cats"
// =====================================================================
// SHOT — "And somewhere in this city," — the city rooftops at night, a slow track across (no cats yet)
SHOT(CUT('004-narrator'), 's01_city', (lt, S) => {
  s01_cam(lt, [700, 470, 1.0], [1140, 430, 1.12], S.t1 - S.t0);
  ivStage(SET_roofs({ cats: 0 }));
}, { sec: 's01', title: 'somewhere in this city — roofs at night, track right' });
SFX(CUT('004-narrator'), 'whoosh', 0.7);
SFX(CUT('004-narrator') + 0.8, 'car', 0.3, 0.5);                                   // a far car below

// SHOT — "your little sister is lost." — a phone in your hand: LILY — MISSING; the screen light on your glove
const s01_missing = (w, h) => {
  ctx.fillStyle = ivVGrad(0, h, ['#1d1416', '#120c0e']); ctx.fillRect(0, 0, w, h); prop_statusBar(w, '3:02');
  ivRR(24, 110, w - 48, 470, 26, '#f4ecdc'); ivText('MISSING', w / 2, 178, 52, '#d8342c', { track: 3 });
  ivRR(60, 205, w - 120, 270, 10, '#cfd6e0'); ctx.save(); ctx.beginPath(); ctx.rect(60, 205, w - 120, 270); ctx.clip();
  ivMan({ who: CAST.lily, x: w / 2, y: 520, h: 330, f: 0.2, pose: ivPose('wave'), expr: { eyes: 'happy', mouth: 'grin' } }); ctx.restore();
  ivText('LILY · AGE 7', w / 2, 520, 34, '#1e1a22', { track: 2 }); ivText('YELLOW COAT', w / 2, 556, 22, '#6a5a50', { track: 2 });
  ivRR(40, 620, w - 80, 64, 32, '#d8342c'); ivText('CALL 555-0142', w / 2, 662, 26, '#ffffff', { track: 1 });
};
SHOT(CUT('004-narrator', 'your'), 's01_phone', (lt, S) => {
  const u = EZ.o3(clamp(lt / 0.5));
  ivStage(s01_cu(SET_street({ t: 'night', fg: false }), () => {
    ctx.fillStyle = 'rgba(5,6,14,0.45)'; ctx.fillRect(0, 0, W, H);
    const y = lerp(640, 540, u), x = 1000;
    ivPhoneHold(x, y, 330, 680, -0.06, () => P_phone(x, y, 9, { ang: -0.06, screen: s01_missing }), { sleeve: CAST.kai.col, side: 1 });
  }));
}, { sec: 's01', title: 'your little sister is lost — phone: LILY MISSING' });
SFX(CUT('004-narrator', 'your'), 'cloth', 0.5, 0.3);
SFX(CUT('004-narrator', 'your') + 0.35, 'buzz', 0.6, 0.1);                         // the phone buzzes in your hand

// SHOT — "The only ones who saw where she went" — a night street, a cat in every lit window; crane up the facades
SHOT(CUT('005-narrator'), 's01_windows', (lt, S) => {
  s01_cam(lt, [900, 700, 1.15], [760, 380, 1.45], S.t1 - S.t0);
  ivStage(SET_street({ t: 'night', cats: true, act: () => s01_cat({ x: 1300, y: GROUND - 6, s: 130, f: -1, coat: CATS.alley[3], pose: 'sit', expr: { eyes: 'open' }, look: [-1, -0.3] }) }));
}, { sec: 's01', title: 'the only ones who saw — night street, cats in windows, crane up' });
SFX(CUT('005-narrator'), 'whoosh', 0.6, 0.3);
SFX(CUT('005-narrator') + 0.7, 'step', 0.35, 0.5);                                 // a paw on the sill
SFX(CUT('005-narrator') + 1.3, 'wiper', 0.25, -0.5);                               // wind

// SHOT — "are cats." — darkness; pairs of cat eyes open one after another, then all of them look at you
function s01_eyesDark(lt, n, o = {}) {
  ctx.fillStyle = '#04050a'; ctx.fillRect(0, 0, W, H);
  const r = RNG('s01eyes').f, cols = ['#c9e05a', '#e8c34a', '#7cf06a', '#5ab5e8', '#e8a84a'];
  for (let i = 0; i < n; i++) {
    const x = 120 + r() * 1680, y = 150 + r() * 760, s = 0.5 + r() * 1.1, t0 = r() * (o.spread ?? 0.6), c = cols[Math.floor(r() * cols.length)], ph = r() * 9;
    const open = EZ.o3(clamp((lt - t0) / 0.12)) * (mod(lt * 1.3 + ph, 4.2) < 0.12 ? 0.1 : 1);
    if (open <= 0.02) continue;
    for (const dx of [-22, 22]) {
      const ex = x + dx * s, eh = 15 * s * open;
      ivGlow(ex, y, 46 * s, ivHex(c, 0.35));
      ctx.beginPath(); ctx.ellipse(ex, y, 11 * s, eh, 0, 0, TAU); ctx.fillStyle = c; ctx.fill();
      ctx.beginPath(); ctx.ellipse(ex + (o.look ?? 0) * 4 * s, y, 2.6 * s, eh * 0.85, 0, 0, TAU); ctx.fillStyle = '#060406'; ctx.fill();
    }
  }
}
SHOT(CUT('005-narrator', 'are'), 's01_eyes', (lt, S) => {
  IV_M = IV_MOOD.extAlley; IV_CAM = { x: 960, y: 540, z: 1 };
  ctx.save(); const z = 1 + 0.04 * EZ.io(clamp(lt / 1.5)); ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-960, -540);
  s01_eyesDark(lt, 46, { spread: 0.55 }); ctx.restore();
}, { sec: 's01', title: 'are cats — eyes opening in the dark' });
SFX(CUT('005-narrator', 'are') + 0.1, 'blip', 0.25, -0.4);
SFX(CUT('005-narrator', 'are') + 0.35, 'blip', 0.25, 0.4);
SFX(CUT('005-narrator', 'are') + 0.55, 'rise', 0.5, 0, 0.6);

// SHOT [BEAT] — wordless: the alley again, the whole wall yowls up at the moon, the camera pulls back
SHOT(LE('005-narrator') + 0.35, 's01_beatYowl', (lt, S) => {
  s01_cam(lt, [960, 300, 1.5], [960, 520, 1.0], S.t1 - S.t0);
  ivStage(SET_alley({ cats: 40, yowl: 1, act: () => { s01_boss({ pose: 'yowl' }); s01_kaiAlley({ x: 520, f: 0.5, expr: { eyes: 'wide', mouth: 'o', look: [0.4, -1] } }); } }));
}, { sec: 's01', title: '[beat] the wall yowls at the moon — pull back' });
SFX(LE('005-narrator') + 0.35, 'crowd', 1.0, 0, 1.9);
SFX(LE('005-narrator') + 0.4, 'impact', 0.7);

// =====================================================================
//  "Two weeks earlier." — the picture rewinds
// =====================================================================
SHOT(CUT('006-narrator'), 's01_rewind', (lt, S) => {
  const D = S.t1 - S.t0, u = clamp(lt / D);
  s01_cam(lt, [960, 520, 1.0], [960, 220, 1.9], D);      // the beat's pull-back, played backwards and fast
  ivStage(SET_alley({ cats: Math.round(40 * (1 - u)), yowl: 1 - u, act: () => s01_boss({ pose: 'yowl' }) }));
  // tape rewind: strips slide, colour drains, scanlines, a white streak runs up
  const c = ivCanvas(40, W, H), g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(ctx.canvas, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const r = RNG('rw' + F).f;
  for (let y = 0; y < H; y += 36) { const off = (r() - 0.5) * 90 * (0.4 + u); ctx.drawImage(c, 0, y, W, 36, off, y, W, 36); }
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${0.5 + 0.4 * u})`; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over'; for (let y = 0; y < H; y += 6) { ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(0, y, W, 2); }
  const sy = H - mod(lt * 1400, H + 200); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(0, sy, W, 60);
  ctx.globalAlpha = 0.85; ivText('◀◀', 170, 160, 54, '#ffffff'); ctx.restore();
  ivTag('TWO WEEKS EARLIER', 960, 560, 62, ivPop(VW('006-narrator', 'two')));
}, { sec: 's01', title: 'Two weeks earlier — the alley rewinds (tape)' });
SFX(CUT('006-narrator'), 'whoosh', 1.2);
SFX(CUT('006-narrator') + 0.05, 'drop', 0.8, 0, LE('006-narrator') - CUT('006-narrator'));   // tape spinning back
SFX(VW('006-narrator', 'two'), 'click', 0.8);

// =====================================================================
//  THE MORNING — Kai asleep, Pickles on his chest
// =====================================================================
// (rotated -1.35 rad, not -π/2: ivMan sizes its rim from the transform's x-scale, which is 0 at exactly 90°)
const s01_LIE = { px: 751, py: 832, h: 520 };
// Kai lying on his back, head on the pillow (left), under the blanket (drawn in s01_blanket)
function s01_kaiLie(o = {}) {
  ctx.save(); ctx.translate(s01_LIE.px, s01_LIE.py); ctx.rotate(-1.35 + (o.lift || 0));
  ivMan({ who: CAST.kai, x: 0, y: 0, h: s01_LIE.h, f: o.f ?? 0.1, pose: ivPose('stand', { hL: [-0.06, 0.3], hR: [0.06, 0.3] }), expr: o.expr || { eyes: 'closed', mouth: 'flat' }, talk: o.talk });
  ctx.restore();
}
function s01_blanket() {
  ctx.beginPath(); ctx.moveTo(380, 760); ctx.bezierCurveTo(396, 650, 660, 640, 840, 756); ctx.bezierCurveTo(950, 792, 1100, 786, 1245, 784);
  ctx.lineTo(1252, 990); ctx.bezierCurveTo(1000, 1000, 700, 992, 440, 1000); ctx.closePath(); ctx.fillStyle = '#7e6ca8'; ctx.fill();
  ctx.save(); ctx.clip(); const g = ctx.createLinearGradient(0, 700, 0, 1000); g.addColorStop(0, 'rgba(255,255,255,0.16)'); g.addColorStop(0.3, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.2)'); ctx.fillStyle = g; ctx.fillRect(380, 690, 900, 320); ctx.restore();
  ctx.beginPath(); ctx.moveTo(384, 756); ctx.bezierCurveTo(400, 652, 660, 642, 840, 758); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.stroke();
  ivLine(820, 760, 850, 990, 3, 'rgba(0,0,0,0.13)'); ivLine(1060, 790, 1075, 990, 3, 'rgba(0,0,0,0.13)'); 
}
// Pickles loafing on Kai's chest (on the blanket's bump)
const s01_PK = [590, 680, 175];
const s01_pickChest = (o = {}) => { ctx.save(); ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.ellipse(s01_PK[0] - 10, s01_PK[1] + 2, s01_PK[2] * 0.42, 9, 0, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  return ivCat({ x: s01_PK[0], y: s01_PK[1], s: o.s ?? s01_PK[2], f: -1, coat: CATS.pickles, pose: o.pose || 'loaf', expr: o.expr || { eyes: 'half' }, talk: o.talk, look: o.look || [-0.6, 0.2] }); };
const s01_bedLie = (o = {}) => SET_bedroom({ blanket: false, fg: o.fg, act: () => s01_kaiLie(o.kai || {}), onBed: () => { s01_blanket(); o.cat !== false && s01_pickChest(o.pk || {}); o.extra && o.extra(); } });
// the same bed seen from the desk side: the near layers mirrored (the blurred room stays, so its text reads) about x = 960 (world positions flip: x → 1920 − x)
const s01_mirror = (L) => L.map((l) => l.d > 1.05 ? l : ({ ...l, draw: () => { ctx.save(); ctx.translate(1920, 0); ctx.scale(-1, 1); l.draw(); ctx.restore(); } }));

// ---- TOP-DOWN: the camera looks straight down at the bed. Kai on his back (front view = face up), head at the top,
//      the blanket from the chest down, Pickles on his chest. o.rot turns the whole bed (a dutch top shot).
const s01_TD = { kx: 960, ky: 1700, kh: 1400, pk: [960, 1000, 400] };   // Kai's feet point + height · Pickles x, y, s
function s01_tdBed(o) {
  ctx.save(); ctx.translate(960, 760); ctx.rotate(o.rot || 0); ctx.translate(-960, -760);
  // the mattress (a box seen from above: its side shows as a darker band on the right/bottom)
  ivRR(400, 150, 1180, 2300, 40, '#7c6f98'); ivRR(380, 130, 1180, 2300, 40, '#ece6f4');
  ctx.save(); ctx.globalAlpha = 0.5; for (let i = 0; i < 5; i++) ivLine(560 + i * 190, 180, 600 + i * 170, 2300, 2, 'rgba(160,150,190,0.4)'); ctx.restore();
  // the pillow with a dent
  ivRR(500, 250, 960, 480, 150, 'rgba(60,40,80,0.18)'); ivRR(480, 230, 960, 480, 150, '#f6f2fb'); ctx.save(); ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.ellipse(960, 500, 330, 170, 0, 0, TAU); ctx.fillStyle = '#c9c0dc'; ctx.fill(); ctx.restore();
  // Kai: a soft contact shadow, then the man (arms along his sides, under the blanket below the chest)
  ctx.save(); ctx.globalAlpha = 0.22; ctx.beginPath(); ctx.ellipse(985, 560, 210, 220, 0, 0, TAU); ctx.fillStyle = '#2a1e30'; ctx.fill(); ctx.restore();
  const K = ivMan({ who: CAST.kai, x: s01_TD.kx, y: s01_TD.ky, h: s01_TD.kh, f: 0, pose: ivPose('stand', { hL: [-0.09, 0.3], hR: [0.09, 0.3] }), expr: o.expr || { eyes: 'closed', mouth: 'flat' }, talk: o.talk, noBlink: o.noBlink });
  // the blanket from the chest down: folds, a quilted edge, the bump of his body under it
  const by = 860;
  ctx.beginPath(); ctx.moveTo(360, by + 30); ctx.bezierCurveTo(700, by - 20, 1200, by - 10, 1560, by + 40); ctx.lineTo(1580, 2500); ctx.lineTo(350, 2500); ctx.closePath();
  ctx.fillStyle = '#7e6ca8'; ctx.fill();
  ctx.save(); ctx.clip(); const g = ctx.createLinearGradient(700, 0, 1300, 0); g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(0.5, 'rgba(255,255,255,0.0)'); g.addColorStop(1, 'rgba(0,0,0,0.18)'); ctx.fillStyle = g; ctx.fillRect(400, by - 60, 1100, 1700);
  for (const [x0, x1] of [[690, 640], [1230, 1290], [880, 820]]) ivLine(x0, by + 80, x1, 1700, 4, 'rgba(0,0,0,0.12)');
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(360, by + 30); ctx.bezierCurveTo(700, by - 20, 1200, by - 10, 1560, by + 40); ctx.lineWidth = 26; ctx.strokeStyle = '#ece6f4'; ctx.stroke();   // the sheet folded over
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(80,60,110,0.35)'; ctx.stroke();
  // Pickles on the chest (+ his contact shadow)
  if (o.cat !== false) { const P = s01_TD.pk, pk = o.pk || {}, y = P[1] + (pk.dy || 0), s = pk.s ?? P[2];
    ctx.save(); ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.ellipse(P[0] + 20, y + 8, s * 0.48, s * 0.12, 0, 0, TAU); ctx.fillStyle = '#2a1e30'; ctx.fill(); ctx.restore();
    ivCat({ x: P[0], y, s, f: pk.f ?? -1, coat: CATS.pickles, pose: pk.pose || 'loaf', expr: pk.expr || { eyes: 'half' }, talk: pk.talk, look: pk.look || [0, -0.6], blinkKey: 'td' }); }
  o.extra && o.extra(K);
  // morning sun through the window: two warm stripes across the bed
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [x, w] of [[300, 260], [700, 150]]) ivPoly([[x, -200], [x + w, -200], [x + w + 900, 2400], [x + 900, 2400]], 'rgba(255,200,130,0.10)');
  ctx.restore();
  ctx.restore();
  return K;
}
function s01_topDown(o = {}) {
  IV_M = IV_MOOD.bedMorning;
  return [
    { d: 1.25, draw: () => {   // the floor far below the mattress: planks + the rug corner
      ctx.save(); ctx.translate(960, 760); ctx.rotate(o.rot || 0); ctx.translate(-960, -760);
      ctx.fillStyle = '#7a5440'; ctx.fillRect(-1600, -1400, 5200, 4400);
      for (let i = -12; i < 30; i++) ivLine(i * 140, -1400, i * 140, 3000, 3, 'rgba(60,30,20,0.25)');
      ivRR(1700, 300, 900, 1200, 10, '#b8604a'); ivRR(1740, 340, 820, 1120, 8, null, 'rgba(255,220,180,0.45)', 4);
      ivRR(-700, 200, 520, 380, 12, '#8a6650'); ivRR(-640, 260, 160, 110, 14, '#c8352e');   // the nightstand + alarm clock seen from above
      ctx.restore(); } },
    { d: 1, draw: () => s01_tdBed(o) },
  ];
}

// ---- POV: from Kai's pillow, looking down his body — the blanket hill, Pickles towering on his chest, the room behind
//      (the room is the bedroom's far layer framed high: ceiling + wall). o.cat: ivCat overrides; o.shoulder: Kai's head
//      out of focus at the bottom-left (over the shoulder).
function s01_pov(o = {}) {
  const L = SET_bedroom({ fg: false });
  return s01_cu(L, () => {
    ctx.fillStyle = 'rgba(30,18,10,0.18)'; ctx.fillRect(0, 0, W, H);
    // the blanket hill rising toward the lens
    ctx.beginPath(); ctx.moveTo(-60, 1100); ctx.bezierCurveTo(200, 860, 560, 790, 980, 800); ctx.bezierCurveTo(1400, 810, 1700, 900, 1990, 1040); ctx.lineTo(1990, 1100); ctx.closePath();
    const g = ctx.createLinearGradient(0, 780, 0, 1100); g.addColorStop(0, '#9a88c4'); g.addColorStop(0.4, '#7e6ca8'); g.addColorStop(1, '#4a3c70'); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-60, 1100); ctx.bezierCurveTo(200, 860, 560, 790, 980, 800); ctx.bezierCurveTo(1400, 810, 1700, 900, 1990, 1040); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(255,230,200,0.35)'; ctx.stroke();
    ivLine(700, 830, 560, 1090, 5, 'rgba(0,0,0,0.12)'); ivLine(1320, 840, 1500, 1090, 5, 'rgba(0,0,0,0.12)');
    const c = o.cat || {}, s = c.s ?? 680, x = c.x ?? 1010, y = c.y ?? 816;
    ctx.save(); ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.ellipse(x - 20, y + 6, s * 0.45, s * 0.07, 0, 0, TAU); ctx.fillStyle = '#1e1430'; ctx.fill(); ctx.restore();
    const hd = ivCat({ x, y, s, f: -1, coat: CATS.pickles, pose: c.pose || 'sit', expr: c.expr || { eyes: 'half' }, talk: c.talk, look: c.look || [-0.2, 0.9], blinkKey: 'pov' });
    if (o.shoulder) {   // the back of Kai's head + his hood, big and soft in the corner
      ctx.save(); ctx.filter = 'blur(10px)';
      ctx.beginPath(); ctx.ellipse(1760, 1180, 520, 300, -0.3, 0, TAU); ctx.fillStyle = ivShade(CAST.kai.col || '#3c6fd1', -0.25); ctx.fill();
      ctx.beginPath(); ctx.arc(1690, 1010, 250, 0, TAU); ctx.fillStyle = IV.ink; ctx.fill();
      ctx.beginPath(); ctx.arc(1690, 1010, 250, Math.PI * 1.05, Math.PI * 1.45); ctx.lineWidth = 14; ctx.strokeStyle = IV_M.rim; ctx.stroke();
      ctx.restore();
    }
    o.extra && o.extra(hd);
  });
}

// SHOT [BEAT] — the room in the morning: sun through the window, Kai asleep, Pickles on his chest, staring; dolly in
SHOT(LE('006-narrator') + 0.45, 's01_room', (lt, S) => {
  s01_cam(lt, [860, 560, 1.0], [700, 620, 1.35], S.t1 - S.t0 + 0.4);
  ivStage(s01_bedLie({ kai: { expr: { eyes: 'closed', mouth: 'o' } } }));
  const z = mod(lt, 1.2) / 1.2; ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * z) * 0.8; ivText('z', 420 + z * 60, 520 - z * 80, 30 + z * 20, '#fff4e0'); ctx.restore();
}, { sec: 's01', title: '[beat] the morning — dolly in, Kai asleep, Pickles on him' });
SFX(LE('006-narrator') + 0.45, 'pop', 0.4);
SFX(LE('006-narrator') + 0.9, 'tick', 0.3, 0.3);                                  // the clock
SFX(LE('006-narrator') + 1.6, 'tick', 0.3, 0.3);

// SHOT — "You wake up." — close on Kai's face on the pillow: eyes snap open on "up"
SHOT(CUT('007-narrator'), 's01_wake', (lt, S) => {
  const tO = VW('007-narrator', 'up');
  IV_CAM = { x: 960, y: 615, z: 2.0 * ivPush(S.t0, 0.04, 1.6) };
  ivStage(s01_topDown({ rot: -0.22, expr: TT < tO ? { eyes: 'closed', mouth: 'flat' } : { eyes: 'wide', mouth: 'flat', brow: 'up', look: [0, 1] }, noBlink: true, pk: { look: [0.3, -1] } }));
}, { sec: 's01', title: 'You wake up — TOP-DOWN ECU on the face, eyes snap open, Pickles\' ears at the bottom' });
SFX(VW('007-narrator', 'up'), 'pop', 0.6, -0.3);
SFX(VW('007-narrator', 'up') + 0.1, 'cloth', 0.4, -0.3);

// SHOT — "Your cat, Pickles," — Pickles close, staring down at you; name tag
SHOT(CUT('008-narrator'), 's01_pickles', (lt, S) => {
  IV_CAM = { x: 900, y: 300, z: 1.6 }; IV_FOCUS = 1;
  ivStage(s01_pov({ shoulder: true, cat: { s: 700 * ivPush(S.t0, 0.03, 1.2), expr: { eyes: 'half' }, look: [0.5, 0.9] } }));
  ivTag('PICKLES', 520, 200, 44, ivPop(VW('008-narrator', 'pickles')));
}, { sec: 's01', title: 'Your cat, Pickles — over Kai\'s shoulder: Pickles towers on his chest, name tag' });
SFX(VW('008-narrator', 'pickles'), 'pop', 0.8, 0.4);

// SHOT — "is sitting on your chest." — the two-shot from the bed's side: the weight on the chest, you look down
SHOT(CUT('008-narrator', 'is'), 's01_onChest', (lt, S) => {
  const sink = Math.sin(clamp((lt - 0.1) / 0.3) * Math.PI) * 14;
  s01_cam(lt, [960, 820, 1.08], [960, 800, 1.16], S.t1 - S.t0);
  ivStage(s01_topDown({ rot: 0.06, expr: { eyes: 'squint', mouth: 'frown', look: [0, 1] }, pk: { dy: sink, expr: { eyes: 'half' }, look: [0.2, -1] },
    extra: () => ivTag('OOF', 1240, 640 + sink, 30, ivPop(S.t0 + 0.2) * 0.9) }));
}, { sec: 's01', title: 'sitting on your chest — TOP-DOWN medium: the weight, OOF' });
SFX(CUT('008-narrator', 'is') + 0.1, 'thud', 0.5);
SFX(CUT('008-narrator', 'chest'), 'cloth', 0.4, 0.2);

// SHOT — "Fourteen years old." — Pickles from the other side, old and unimpressed; 14 counts up and lands on the word
SHOT(CUT('009-narrator'), 's01_fourteen', (lt, S) => {
  // an old photo from the corkboard: toddler Kai hugging a tiny orange kitten — "DAY ONE"
  IV_CAM = { x: 870, y: 380, z: 2.2 };
  ivStage(s01_cu(s01_bedLie({ fg: false }), () => {
    ctx.fillStyle = 'rgba(20,12,8,0.35)'; ctx.fillRect(0, 0, W, H);
    const a = -0.08 + 0.03 * EZ.io(clamp(lt / 2)), z = 1 + 0.04 * EZ.io(clamp(lt / 2));
    ctx.save(); ctx.translate(820, 560); ctx.rotate(a); ctx.scale(z, z);
    ivRR(-330, -360, 660, 760, 8, 'rgba(0,0,0,0.35)'); ctx.translate(-8, -10);
    ivRR(-330, -360, 660, 760, 8, '#f6f0e4'); ctx.save(); ctx.beginPath(); ctx.rect(-290, -320, 580, 560); ctx.clip();
    ctx.fillStyle = ivVGrad(-320, 240, ['#e9c49a', '#d8a070']); ctx.fillRect(-290, -320, 580, 560);
    ivGlow(-150, -200, 400, 'rgba(255,230,180,0.5)'); ctx.fillStyle = '#b8604a'; ctx.fillRect(-290, 120, 580, 120);
    ivMan({ who: { ...CAST.kai, key: 'kaiKid', head: 1.25 }, x: -60, y: 300, h: 420, f: 0.3, pose: ivPose('hug', { hL: [0.16, 0.16], hR: [0.2, 0.14] }), expr: { eyes: 'happy', mouth: 'grin' }, noBlink: true });
    ivCat({ x: 70, y: 150, s: 110, f: -1, coat: { ...CATS.pickles, key: 'pkKid' }, pose: 'sit', expr: { eyes: 'wide' } });
    ctx.restore();
    ivText('KAI + PICKLES · DAY ONE', 0, 330, 30, '#4a3a30', { font: '"Marker Felt", "Comic Sans MS", cursive', weight: 400 });
    ctx.globalAlpha = 0.08; ivPoly([[-330, -360], [100, -360], [-330, 200]], '#ffffff'); ctx.restore();
    ivTag(ivCount(S.t0, VWE('009-narrator', 'fourteen'), 0, 14) + ' YEARS OLD', 1440, 300, 54, ivPop(S.t0 + 2 / FPS));
  }));
}, { sec: 's01', title: 'Fourteen years old — old photo DAY ONE, 14 counts up' });
s01_sfxCount(CUT('009-narrator'), VWE('009-narrator', 'fourteen'), 0, 14, 'tick', 0.35, 0.3, 2);
SFX(CUT('009-narrator'), 'paper', 0.6, -0.2);                                    // the photo

// SHOT — "Orange." — extreme close on the tabby fur and the tail flicking; a swatch tag
SHOT(CUT('010-narrator'), 's01_orange', (lt, S) => {
  IV_CAM = { x: 640, y: 560, z: 1.3 }; IV_FOCUS = 1;
  const L = SET_bedroom({ fg: false }); L.forEach((l) => { l.blur = 9; });
  ivStage(s01_cu(L, () => {
    // macro: the tabby back + tail fill the frame, the tail flicks on the swish
    const fl = Math.sin(clamp((TT - CUT('010-narrator') - 0.3) / 0.35) * Math.PI);
    ctx.beginPath(); ctx.moveTo(-60, 1100); ctx.bezierCurveTo(400, 960, 1400, 940, 1990, 1000); ctx.lineTo(1990, 1100); ctx.closePath(); ctx.fillStyle = '#6e5c98'; ctx.fill();
    ctx.save(); ctx.translate(260, 1480); ctx.rotate(-0.05 + fl * 0.04);
    ivCat({ x: 0, y: 0, s: 2200, f: -1, coat: CATS.pickles, pose: 'loaf', expr: { eyes: 'half' }, look: [-1, 0], blinkKey: 'mac' });
    ctx.restore();
  }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ivTag('ORANGE', 960, 160, 56, ivPop(VW('010-narrator', 'orange')), { c: '#ffb46a', line: 'rgba(255,160,80,0.8)' }); ctx.restore();
}, { sec: 's01', title: 'Orange — MACRO on the tabby fur, ORANGE tag' });
SFX(VW('010-narrator', 'orange'), 'pop', 0.7);
SFX(CUT('010-narrator') + 0.3, 'swish', 0.3, 0.3);                                  // tail flick

// SHOT — "Shaped like a loaf of bread." — a loaf of bread drops onto the blanket next to him: same shape
function s01_bread(x, y, s, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= clamp(a);
  ctx.save(); ctx.globalAlpha *= 0.3; ctx.beginPath(); ctx.ellipse(0, 2, 70, 8, 0, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.roundRect(-68, -62, 136, 62, [30, 30, 8, 8]); ctx.fillStyle = '#c98a44'; ctx.fill();
  ctx.save(); ctx.clip(); const g = ctx.createRadialGradient(-20, -60, 4, -10, -30, 90); g.addColorStop(0, 'rgba(255,230,180,0.5)'); g.addColorStop(1, 'rgba(90,40,10,0.35)'); ctx.fillStyle = g; ctx.fillRect(-80, -70, 160, 80); ctx.restore();
  for (const dx of [-34, -4, 26]) { ctx.beginPath(); ctx.moveTo(dx - 8, -52); ctx.quadraticCurveTo(dx + 4, -60, dx + 14, -46); ctx.lineWidth = 4; ctx.strokeStyle = '#f2d29a'; ctx.stroke(); }
  ivLine(-62, -1, 62, -1, 3, 'rgba(90,40,10,0.4)'); ctx.restore();
}
SHOT(CUT('011-narrator'), 's01_loaf', (lt, S) => {
  const tB = VW('011-narrator', 'loaf'), d = s01_r(tB - 4 / FPS, 4 / FPS), y = lerp(560, 712, d);
  IV_CAM = { x: 1230, y: 640, z: 2.6 };   // from the desk side (mirrored): Pickles left of frame, the bread lands on his right
  ivStage(s01_mirror(s01_bedLie({ fg: false, kai: { expr: { eyes: 'squint', mouth: 'flat', look: [0, 1] } }, pk: { expr: { eyes: 'half' }, look: [1, 0] }, extra: () => s01_bread(800, y, 1.15, d * 4) })));
  ivTag('=', 935, 470, 50, ivPop(VWE('011-narrator', 'bread')));
}, { sec: 's01', title: 'loaf of bread — from the desk side: bread drops next to Pickles' });
SFX(VW('011-narrator', 'loaf'), 'thud', 0.6, 0.2);
SFX(VWE('011-narrator', 'bread'), 'pop', 0.6);

// SHOT — "He stares at you and says:" — Pickles' face, straight into the lens; slow push
const s01_pkHead = () => [s01_PK[0] - 24 * s01_PK[2] / 100, s01_PK[1] - 44 * s01_PK[2] / 100];
SHOT(CUT('012-narrator'), 's01_stare', (lt, S) => {
  const h = s01_pkHead(); IV_CAM = { x: h[0] - 4, y: h[1] + 6, z: 9.5 * ivPush(S.t0, 0.06, 2.4) };
  ivStage(s01_bedLie({ fg: false, pk: { expr: { eyes: 'open' }, look: [0, 0] } }));
}, { sec: 's01', title: 'He stares at you — EXTREME CU on the eyes, push in' });
SFX(CUT('012-narrator') + 0.1, 'rise', 0.4, 0, 1.4);

// SHOT — Pickles: "Breakfast. Now." — close, talking; on "Now." he stands up on your chest and leans in
SHOT(CUT('013-pickles'), 's01_breakfast', (lt, S) => {
  const tN = VW('013-pickles', 'now'), u = s01_r(tN - 2 / FPS, 5 / FPS), up = TT >= tN - 2 / FPS;
  IV_CAM = { x: 900, y: 300, z: 1.6 }; IV_FOCUS = 1;
  ivStage(s01_pov({ cat: { pose: up ? 'stand' : 'loaf', s: lerp(680, 900, u), x: lerp(1010, 1080, u), y: lerp(816, 900, u), talk: '013-pickles', expr: { eyes: up ? 'angry' : 'half' }, look: [-0.3, 0.9] } }));
  ivTag('"BREAKFAST."', 1500, 200, 40, ivPop(VW('013-pickles', 'breakfast')));
  ivTag('"NOW."', 1500, 300, 50, ivPop(tN));
}, { sec: 's01', title: 'Pickles: "Breakfast. Now." — Kai\'s POV: he talks, stands and looms into the lens on Now' });
SFX(VW('013-pickles', 'now') - 2 / FPS, 'step', 0.5, 0);                             // he stands on your chest
SFX(VW('013-pickles', 'now'), 'pop', 0.6, 0.4);

// SHOT — "You useless, hairless giant." — the wide from the bed's foot: the insults pop around him, word by word
SHOT(CUT('013-pickles', 'you'), 's01_giant', (lt, S) => {
  s01_cam(lt, [760, 600, 1.55], [700, 610, 1.7], S.t1 - S.t0);
  ivStage(s01_bedLie({ kai: { expr: { eyes: 'wide', mouth: 'frown', look: [0, 1] } }, pk: { pose: 'stand', s: 165, talk: '013-pickles', expr: { eyes: 'half' }, look: [-1, 0.4] } }));
  ivTag('USELESS', 1180, 210, 34, ivPop(VW('013-pickles', 'useless')));
  ivTag('HAIRLESS', 1360, 290, 34, ivPop(VW('013-pickles', 'hairless')));
  ivTag('GIANT', 1250, 370, 44, ivPop(VW('013-pickles', 'giant')));
}, { sec: 's01', title: 'You useless, hairless giant — wide, insults pop' });
SFX(VW('013-pickles', 'hairless'), 'pop', 0.5, 0.5);
SFX(VW('013-pickles', 'giant'), 'pop', 0.7, 0.4);

// =====================================================================
//  Kai sits up: "Did you just… talk?" / "Did you just… understand me?"
// =====================================================================
const s01_bedSit = (o = {}) => SET_bedroom({ fg: o.fg, act: () => { const P = SET_POS.bedroom.bedSit; ivMan({ who: CAST.kai, x: P[0], y: P[1], h: P[2], f: o.kf ?? 0.3, pose: o.pose || ivPose('sit', { hL: [0.18, 0.12], hR: [0.26, 0.1] }), expr: o.kexpr || { eyes: 'wide', mouth: 'o', brow: 'up', look: [1, 0.3] }, talk: o.ktalk }); },
  onBed: () => { const C = SET_POS.bedroom.chest; ctx.save(); ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.ellipse(C[0], C[1] + 2, 70, 10, 0, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
    ivCat({ x: C[0], y: C[1], s: C[2], f: -1, coat: CATS.pickles, pose: o.pkPose || 'sit', expr: o.pexpr || { eyes: 'half' }, talk: o.ptalk, look: o.plook || [-1, 0] }); } });
SHOT(CUT('014-you'), 's01_talk', (lt, S) => {
  const u = s01_r(S.t0, 4 / FPS);
  IV_CAM = { x: 820, y: 600, z: 2.3 };
  ivStage(s01_bedSit({ fg: false, ktalk: '014-you', pose: ivPoseMix(ivPose('sit', { hL: [0.12, 0.2], hR: [0.16, 0.2], lean: -0.15 }), ivPose('sit', { hL: [0.18, 0.12], hR: [0.3, -0.02] }), u), kexpr: { eyes: 'wide', mouth: 'o', brow: 'up', look: [1, 0.3] } }));
}, { sec: 's01', title: 'You: "Did you just... talk?" — sits bolt up, CU' });
SFX(CUT('014-you'), 'cloth', 0.9, -0.2);                                           // bolt upright

SHOT(CUT('015-pickles'), 's01_understand', (lt, S) => {
  IV_CAM = { x: 1050, y: 690, z: 3.2 };
  ivStage(s01_bedSit({ fg: false, ptalk: '015-pickles', pexpr: { eyes: 'wide' }, plook: [-1, 0] }));
}, { sec: 's01', title: 'Pickles: "Did you just... understand me?" — CU, eyes wide' });
SFX(CUT('015-pickles'), 'pop', 0.5, 0.3);
SFX(VW('015-pickles', 'understand'), 'cloth', 0.35, 0.3);                           // fur puffs up

// SHOT [BEAT] — the stare-off: both frozen, the clock ticks, a very slow push
SHOT(LE('015-pickles') + 0.3, 's01_stareOff', (lt, S) => {
  s01_cam(lt, [900, 600, 1.3], [930, 610, 1.45], S.t1 - S.t0);
  ivStage(s01_bedSit({ kexpr: { eyes: 'wide', mouth: 'flat', look: [1, 0.3] }, pexpr: { eyes: 'wide' }, plook: [-1, -0.2] }));
}, { sec: 's01', title: '[beat] the stare-off — two-shot, slow push' });
SFX(LE('015-pickles') + 0.4, 'tick', 0.45, 0.2);
SFX(LE('015-pickles') + 1.6, 'tick', 0.45, 0.2);

// =====================================================================
//  "He doesn't know. Nobody knows." · the montage: every meow, hiss, purr → words · "Only for you." · TITLE
// =====================================================================
// SHOT — "He doesn't know." — Pickles alone on the bed, looking at his own paw: a little "?"
SHOT(CUT('016-narrator'), 's01_dunno', (lt, S) => {
  IV_CAM = { x: 1180, y: 720, z: 3.2 };
  ivStage(s01_bedSit({ fg: false, kexpr: { eyes: 'wide', mouth: 'flat', look: [1, 0.3] }, pexpr: { eyes: 'half' }, plook: [0.6, 0.6] }));
  ivTag('?', 1300, 260, 70, ivPop(VW('016-narrator', 'know')));
}, { sec: 's01', title: "He doesn't know — Pickles CU, a little ?" });
SFX(VW('016-narrator', 'know'), 'pop', 0.5, 0.3);
SFX(CUT('016-narrator') + 0.3, 'cloth', 0.3, 0.3);

// SHOT — "Nobody knows." — the street outside on an ordinary morning: people walk past, cats in the windows; track
SHOT(CUT('017-narrator'), 's01_nobody', (lt, S) => {
  s01_cam(lt, [760, 560, 1.05], [1080, 540, 1.2], S.t1 - S.t0 + 0.5);
  ivStage(SET_street({ t: 'day', cats: true, act: () => {
    const a = ivWalk(S.t0 - 0.5, 1500, 500, -1, 6), b = ivWalk(S.t0, 300, 470, 1, 7);
    s01_man({ who: CAST.extraC, x: a.x, y: GROUND, h: 500, f: -0.8, pose: a.pose, expr: { eyes: 'open', mouth: 'flat' }, sa: 0.25 });
    s01_man({ who: CAST.extraA, x: b.x, y: GROUND, h: 470, f: 0.8, pose: b.pose, expr: { eyes: 'squint', mouth: 'flat' }, sa: 0.25 });
    s01_cat({ x: 1240, y: GROUND, s: 130, f: -1, coat: CATS.alley[1], pose: 'sit', look: [-1, 0] });
  } }));
}, { sec: 's01', title: 'Nobody knows — ordinary street, people pass, track' });
SFX(CUT('017-narrator'), 'whoosh', 0.5);
SFX(CUT('017-narrator') + 0.3, 'step', 0.3, 0.4); SFX(CUT('017-narrator') + 0.6, 'step', 0.3, -0.4); SFX(CUT('017-narrator') + 0.9, 'car', 0.35, 0.6);

// a dawn grade over SET_roofs: the night sky warms from the horizon up (u 0 night → 1 dawn)
function s01_roofsDawn(o, u) {
  const L = SET_roofs(o), d0 = L[0].draw;
  L[0].draw = () => { d0(); ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, 640, 0, -300); g.addColorStop(0, `rgba(255,140,80,${0.55 * u})`); g.addColorStop(0.35, `rgba(200,90,110,${0.3 * u})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(-2000, -800, 6000, 1500); ivGlow(500, 600, 700, `rgba(255,170,90,${0.6 * u})`); ctx.restore(); };
  for (const l of L.slice(1, 3)) { const d = l.draw; l.draw = () => { d(); ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = `rgba(255,140,90,${0.1 * u})`; ctx.fillRect(-3000, -1000, 7000, 3000); ctx.restore(); }; }
  if (u > 0.3) IV_M = { ...IV_M, rim: '#ffc08a', key: [-0.8, -0.4] };
  return L;
}
// SHOT — "Overnight," — the city roofs from night to dawn in one move; the cats come out
SHOT(CUT('018-narrator'), 's01_overnight', (lt, S) => {
  const D = S.t1 - S.t0; s01_cam(lt, [960, 600, 1.0], [960, 420, 1.15], D);
  ivStage(s01_roofsDawn({ cats: Math.round(40 * clamp(lt / D)) }, clamp(lt / D)));
}, { sec: 's01', title: 'Overnight — roofs night → dawn, cats appear' });
SFX(CUT('018-narrator'), 'rise', 0.5, 0, 0.9);

// SHOT — "every meow," — a kitchen: a cat at an empty bowl; MEOW flips to words
SHOT(CUT('018-narrator', 'meow'), 's01_meow', (lt, S) => {
  IV_CAM = { x: 640, y: 780, z: 2.3 };
  ivStage(SET_kitchen({ fg: false, act: () => { P_bowl(700, 990, 1.4, { full: 0 }); s01_cat({ x: 540, y: 990, s: 160, f: 1, coat: CATS.alley[1], pose: 'sit', expr: { eyes: 'open', mouth: TT < S.t0 + 0.3 ? 'open' : 'closed' }, look: [0.4, -0.6] }); } }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); s01_bubble(820, 330, 'MEOW', ivPop(S.t0 + 1 / FPS), { to: 'FEED ME. NOW.', tFlip: S.t0 + 0.3, tx: 640, ty: 560 }); ctx.restore();
}, { sec: 's01', title: 'every meow — kitchen cat at bowl: MEOW → FEED ME' });
SFX(CUT('018-narrator', 'meow') + 1 / FPS, 'pop', 0.6, -0.3);
SFX(CUT('018-narrator', 'meow') + 0.3, 'paper', 0.5, -0.3);                       // the bubble flips

// SHOT — "every hiss," — a tux cat arched at a pigeon on the sidewalk; HSSS flips to words
SHOT(CUT('018-narrator', 'hiss'), 's01_hiss', (lt, S) => {
  IV_CAM = { x: 1080, y: 720, z: 2.2 };
  ivStage(SET_street({ t: 'day', fg: false, act: () => { s01_cat({ x: 960, y: GROUND, s: 150, f: 1, coat: CATS.alley[1], pose: 'stand', arch: 9, expr: { eyes: 'angry', mouth: 'open' } }); P_pigeon(1260, GROUND, 1.3, { f: -1 }); } }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); s01_bubble(900, 300, 'HSSSS!', ivPop(S.t0 + 1 / FPS), { to: 'MY SIDEWALK.', tFlip: S.t0 + 0.3, tx: 860, ty: 560 }); ctx.restore();
}, { sec: 's01', title: 'every hiss — tux cat vs pigeon: HSSS → MY SIDEWALK' });
SFX(CUT('018-narrator', 'hiss') + 1 / FPS, 'gasp', 0.5, 0.1);                       // the hiss
SFX(CUT('018-narrator', 'hiss') + 0.3, 'paper', 0.5, 0.1);

// SHOT — "every purr" — Mrs. Gomez's living room: a calico on her lap, eyes shut; prrr flips to words
SHOT(CUT('018-narrator', 'purr'), 's01_purr', (lt, S) => {
  IV_CAM = { x: 600, y: 600, z: 2.3 };
  const st = Math.sin(lt * 6) * 0.03;
  ivStage(SET_gomez({ fg: false, act: () => {
    ivMan({ who: CAST.gomez, x: 500, y: GROUND, h: 520, f: 0.4, pose: ivPose('sit', { hR: [0.2 + st, 0.12], hL: [0.12, 0.2] }), expr: { eyes: 'happy', mouth: 'smile' } });
    ivCat({ x: 610, y: 742, s: 120, f: -1, coat: CATS.gomez1, pose: 'loaf', expr: { eyes: 'happy' } });
  } }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); s01_bubble(1150, 300, 'prrrrr…', ivPop(S.t0 + 1 / FPS), { to: "DON'T STOP.", tFlip: S.t0 + 0.3, tx: 960, ty: 520 }); ctx.restore();
}, { sec: 's01', title: "every purr — calico on Mrs. Gomez's lap: prrr → DON'T STOP" });
SFX(CUT('018-narrator', 'purr'), 'cloth', 0.5, -0.2);                              // her hand strokes the fur
SFX(CUT('018-narrator', 'purr') + 0.3, 'paper', 0.5, 0.2);

// SHOT — "in the world has become words." — the city at dawn, word bubbles pop over every roof; dolly in
const s01_WORDS = ['HI.', 'FOOD?', 'MINE.', 'NO.', 'PET ME.', 'WHO ARE YOU?', 'BIRD!', 'OPEN THE DOOR.', 'NAP TIME.', 'UGH.', 'WHERE IS MY FISH?', 'LOVE YOU.'];
SHOT(CUT('018-narrator', 'world'), 's01_world', (lt, S) => {
  s01_cam(lt, [960, 520, 1.0], [960, 480, 1.25], S.t1 - S.t0 + 0.4);
  ivStage(s01_roofsDawn({ cats: 60 }, 1));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const r = RNG('s01words').f;
  s01_WORDS.forEach((w, i) => { const x = 180 + r() * 1560, y = 150 + r() * 560, t = S.t0 + 0.05 + i * 0.09; s01_bubble(x, y, w, ivPop(t), { size: 24 + r() * 10, tx: x + (r() - 0.5) * 80, ty: y + 70 }); });
  ctx.restore();
}, { sec: 's01', title: 'the world has become words — city at dawn, bubbles everywhere' });
for (let i = 0; i < 12; i += 4) SFX(CUT('018-narrator', 'world') + 0.05 + i * 0.09, 'pop', 0.35, (i / 11 - 0.5) * 1.4);
SFX(CUT('018-narrator', 'world') + 0.1, 'crowd', 0.35, 0, 1.2);                     // a murmur of a thousand cats

// SHOT — "Only for you." — at the bus stop, words float around your head; the people next to you hear nothing
SHOT(CUT('019-narrator'), 's01_onlyYou', (lt, S) => {
  IV_CAM = { x: 820, y: 520, z: 2.0 * ivPush(S.t0, 0.03, 1.4) };
  ivStage(SET_busStop({ act: () => {
    s01_man({ who: CAST.extraB, x: 1120, y: GROUND, h: 500, f: -0.5, pose: ivPose('phone'), expr: { eyes: 'half', mouth: 'flat' } });
    s01_man({ who: CAST.kai, x: 760, y: GROUND, h: 520, f: 0.2, pose: ivPose('relaxed'), expr: { eyes: 'wide', mouth: 'o', brow: 'up', look: [Math.sin(lt * 2.5), -0.5] } });
  } }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  [['NICE SHOES.', 420, 260], ['…HE CAN HEAR US?', 1460, 300], ['SNACK?', 350, 600]].forEach(([w, x, y], i) => s01_bubble(x, y, w, ivPop(S.t0 + 0.1 + i * 0.25), { size: 30 }));
  ivTag('ONLY YOU', 960, 950, 40, ivPop(VW('019-narrator', 'you')));
  ctx.restore();
}, { sec: 's01', title: 'Only for you — you CU at the bus stop, words around you' });
SFX(CUT('019-narrator') + 0.35, 'pop', 0.4, 0.5);
SFX(VW('019-narrator', 'you'), 'pop', 0.7);

// SHOT — "So, what if you could understand every cat?" — you on the roof at dawn, Pickles beside you, cats everywhere
SHOT(CUT('020-narrator'), 's01_whatIf', (lt, S) => {
  s01_cam(lt, [420, 560, 1.7], [520, 520, 1.5], S.t1 - S.t0);
  ivStage(s01_roofsDawn({ cats: 60, act: () => {
    s01_man({ who: CAST.kai, x: 380, y: GROUND, h: 520, f: 0.35, pose: ivPose('relaxed'), expr: { eyes: 'open', mouth: 'smile', look: [1, -0.3] } });
    s01_cat({ x: 560, y: GROUND, s: 150, f: 1, coat: CATS.pickles, pose: 'sit', expr: { eyes: 'half' }, look: [1, -0.3] });
  } }, 1));
}, { sec: 's01', title: 'So, what if… — you + Pickles on the roof at dawn' });
SFX(CUT('020-narrator'), 'whoosh', 0.7);
SFX(CUT('020-narrator') + 0.5, 'wiper', 0.25, -0.3);                               // wind on the roof

// SHOT — TITLE (+ the 2 s beat) — crane up and back over the roofs at dawn, the title lands
SHOT(LE('020-narrator') - 0.15, 's01_title', (lt, S) => {
  s01_cam(lt, [600, 640, 1.35], [960, 470, 1.0], 3.2);
  ivStage(s01_roofsDawn({ cats: 60, yowl: clamp((lt - 0.6) / 1.5) * 0.2, act: () => {
    s01_man({ who: CAST.kai, x: 380, y: GROUND, h: 520, f: 0.35, pose: ivPose('relaxed'), expr: { eyes: 'open', mouth: 'smile', look: [1, -0.3] } });
    s01_cat({ x: 560, y: GROUND, s: 150, f: 1, coat: CATS.pickles, pose: 'sit', expr: { eyes: 'half' }, look: [1, -0.3] });
  } }, 1));
  ivTitle('WHAT IF YOU COULD', 'UNDERSTAND EVERY CAT?', 'A WHAT-IF STORY', 960, 190, ivPop(LE('020-narrator') + 2 / FPS), 74);
}, { sec: 's01', title: 'TITLE — crane over the roofs at dawn' });
SFX(LE('020-narrator') - 0.6, 'rise', 0.6, 0, 0.6 + 2 / FPS);
SFX(LE('020-narrator') + 2 / FPS, 'impact', 1.3);                                  // TITLE
SFX(LE('020-narrator') + 2 / FPS, 'shimmer', 0.9);                                 // (key moment 1 of 2)
SFX(LE('020-narrator') + 1.3, 'crowd', 0.4, 0, 1.4);                              // the roofs answer

// =====================================================================
//  THE FACT (021–025) — on SET_void: the meow is for us
// =====================================================================
// SHOT — "Here's the strange part." — Pickles walks into the dark stage and sits; a big question mark
SHOT(CUT('021-narrator'), 's01_strange', (lt, S) => {
  IV_CAM = { x: 960, y: 740, z: 1.9 * ivPush(S.t0, 0.04, 1.8) };
  const stop = S.t0 + 0.9, w = ivWalk(S.t0, 500, 300, 1, 5, stop), x = Math.min(w.x, 900);
  ivStage(SET_void({ act: () => s01_cat({ x, y: GROUND, s: 170, f: 1, coat: CATS.pickles, pose: TT < stop && x < 900 ? 'walk' : 'sit', phase: lt * 6, expr: { eyes: 'half' }, look: [0.5, -0.5] }) }));
  ivTag('?', 1200, 330, 110, ivPop(VW('021-narrator', 'strange')), { c: '#ffd29a' });
}, { sec: 's01', title: "Here's the strange part — void, Pickles walks in, ?" });
SFX(CUT('021-narrator'), 'whoosh', 0.8);
SFX(CUT('021-narrator') + 0.5, 'step', 0.4, -0.1);
SFX(VW('021-narrator', 'strange'), 'pop', 0.8, 0.3);

// SHOT — "Grown cats barely meow at each other." — two grown cats face to face: an empty bubble, a tiny crossed-out meow
SHOT(CUT('022-narrator'), 's01_grown', (lt, S) => {
  IV_CAM = { x: 960, y: 730, z: 1.9 };
  ivStage(SET_void({ act: () => {
    s01_cat({ x: 760, y: GROUND, s: 170, f: 1, coat: CATS.alley[2], pose: 'sit', expr: { eyes: 'half' } });
    s01_cat({ x: 1160, y: GROUND, s: 165, f: -1, coat: CATS.alley[3], pose: 'sit', expr: { eyes: 'half' } });
  } }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const a = ivPop(VW('022-narrator', 'barely')); s01_bubble(960, 400, 'meow', a, { size: 44, tx: 760, ty: 560, c: 'rgba(42,30,28,0.5)' });
  if (a > 0) ivLine(870, 420, 1050, 380, 8, '#d8342c');
  ivTag('CAT → CAT', 960, 190, 34, ivPop(S.t0 + 0.2));
  ctx.restore();
}, { sec: 's01', title: 'Grown cats barely meow at each other — two cats, crossed meow' });
SFX(CUT('022-narrator') + 0.2, 'pop', 0.5);
SFX(VW('022-narrator', 'barely') + 0.15, 'swish', 0.5, 0);

// SHOT — "Scientists think" — a scientist with a clipboard studies a cat on the table
const s01_sci = { ...CAST.teacher, key: 'sci', top: 'coat', col: '#eef0f4', col2: '#c9ced8', shirt: '#5b6a7a' };
SHOT(CUT('023-narrator'), 's01_scientist', (lt, S) => {
  IV_CAM = { x: 980, y: 640, z: 1.35 };
  const nod = Math.sin(lt * 4) * 0.02;
  ivStage(SET_void({ act: () => {
    ivAO(980, 760, 1500, 760, 10, 0.4); ivBox(980, 760, 520, 26, 0.12, [960, 600], { front: '#8a8f9e', top: '#b8bccb' }); ivLine(1010, 786, 1010, GROUND, 8, '#3a3e4a'); ivLine(1470, 786, 1470, GROUND, 8, '#3a3e4a');
    ivCat({ x: 1250, y: 760, s: 150, f: -1, coat: CATS.alley[5], pose: 'sit', expr: { eyes: 'open', mouth: 'open' }, look: [-1, 0] });
    s01_man({ who: s01_sci, x: 700, y: GROUND, h: 540, f: 0.5, pose: ivPose('stand', { hL: [0.14, 0.12], hR: [0.2, 0.06 + nod], tilt: 0.1 }), expr: { eyes: 'squint', mouth: 'flat', look: [1, 0.3] },
      hold: { R: (x, y) => { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.3); ivRR(-40, -70, 80, 105, 6, '#a07a4a'); ivRR(-33, -60, 66, 88, 3, '#f4f0e6'); for (let i = 0; i < 4; i++) ivLine(-24, -44 + i * 18, 24, -44 + i * 18, 3, '#9aa0b0'); ctx.restore(); } } });
  } }));
  ivTag('SCIENTISTS', 960, 190, 40, ivPop(VW('023-narrator', 'scientists')));
}, { sec: 's01', title: 'Scientists think — scientist with clipboard, cat on a table' });
SFX(VW('023-narrator', 'scientists'), 'pop', 0.6);
SFX(CUT('023-narrator') + 0.5, 'paper', 0.5, -0.3);                                // pen on the clipboard

// SHOT — "the meow is mostly for us." — a cat looks up at a person: a big MEOW aimed at the human
SHOT(CUT('023-narrator', 'meow'), 's01_forUs', (lt, S) => {
  IV_CAM = { x: 980, y: 640, z: 1.35 };
  ivStage(SET_void({ act: () => {
    s01_man({ who: CAST.extraB, x: 1180, y: GROUND, h: 520, f: -0.5, pose: ivPose('relaxed'), expr: { eyes: 'open', mouth: 'smile', look: [-1, 0.6] } });
    s01_cat({ x: 760, y: GROUND, s: 160, f: 1, coat: CATS.alley[5], pose: 'sit', expr: { eyes: 'wide', mouth: TT < S.t0 + 0.6 ? 'open' : 'closed' }, look: [1, -1] });
  } }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); s01_bubble(700, 420, 'MEOW!', ivPop(S.t0 + 2 / FPS), { size: 80, tx: 1050, ty: 330 });
  ivTag('FOR HUMANS', 1180, 190, 36, ivPop(VW('023-narrator', 'us'))); ctx.restore();
}, { sec: 's01', title: 'the meow is mostly for us — big MEOW aimed at the human' });
SFX(CUT('023-narrator', 'meow') + 2 / FPS, 'pop', 0.8, -0.2);
SFX(VW('023-narrator', 'us'), 'pop', 0.6, 0.3);

// SHOT — "Cats have been talking to humans" — ancient Egypt: a Bastet statue, a scribe, pyramids at dusk; track right
function s01_egypt() {
  const L = SET_void({ mood: 'void', glow: [255, 190, 110] });
  L.splice(1, 0, { d: 2.4, draw: () => {
    ctx.fillStyle = ivVGrad(300, 900, ['rgba(120,60,40,0)', 'rgba(150,80,40,0.35)']); ctx.fillRect(-2000, 300, 6000, 700);
    ivDot(1500, 420, 90, '#ffcf80'); ivGlow(1500, 420, 600, 'rgba(255,170,90,0.5)');
    for (const [x, w, h] of [[300, 900, 420], [1100, 600, 280], [2100, 800, 360], [-500, 700, 300]]) { ivPoly([[x - w / 2, 800], [x, 800 - h], [x + w / 2, 800]], '#6a4630'); ivPoly([[x, 800 - h], [x + w / 2, 800], [x + w * 0.1, 800]], '#4a3020'); }
    ctx.fillStyle = '#3a2618'; ctx.fillRect(-2000, 795, 6000, 400);
  } });
  return L;
}
SHOT(CUT('024-narrator'), 's01_egypt', (lt, S) => {
  s01_cam(lt, [760, 560, 1.35], [1160, 540, 1.45], S.t1 - S.t0 + 0.3);
  const L = s01_egypt();
  L.find((l) => l.d === 1).draw = () => {
    const pb = ivBox(980, 760, 300, 140, 0.15, [960, 600], { front: '#c9a26a', top: '#e0c08a' }); ivAO(980, GROUND, 1280, GROUND, 14, 0.4);
    for (let i = 0; i < 5; i++) { ivText(['𓂀', '𓃠', '𓆣', '𓁹', '𓋹'][i], 1010 + i * 60, 850, 34, 'rgba(70,40,20,0.7)'); }
    const hd = ivCat({ x: 1130, y: 760, s: 260, f: -1, coat: { key: 'bastet', col: '#1c1b22', col2: '#101016', pattern: 'plain', eye: '#e8c34a' }, pose: 'sit', expr: { eyes: 'half' } });
    ivLine(hd.head[0] - 30, hd.head[1] + 70, hd.head[0] + 40, hd.head[1] + 60, 10, '#e8b84a'); ivDot(hd.head[0] + 32, hd.head[1] - 6, 6, '#e8b84a');
    const m = s01_man({ who: { key: 'scribe', top: 'tee', col: '#efe6d0', col2: '#c8b890' }, x: 700, y: GROUND, h: 520, f: 0.55, pose: ivPose('handOut'), expr: { eyes: 'open', mouth: 'smile', look: [1, -0.3] } });
    const [hx, hy] = m.head, R = m.R; ivPoly([[hx - R * 1.05, hy - R * 0.6], [hx + R * 1.05, hy - R * 0.6], [hx + R * 1.3, hy + R * 1.4], [hx + R * 0.7, hy + R * 1.4], [hx + R * 0.95, hy - R * 0.1], [hx - R * 0.95, hy - R * 0.1], [hx - R * 0.7, hy + R * 1.4], [hx - R * 1.3, hy + R * 1.4]], '#2f5fa8');
    for (let i = 0; i < 4; i++) { const y = hy - R * 0.2 + i * R * 0.4; ivLine(hx - R * 1.1 - i * 0.06 * R, y, hx - R * 0.85, y, R * 0.12, '#e8b84a'); ivLine(hx + R * 0.85, y, hx + R * 1.1 + i * 0.06 * R, y, R * 0.12, '#e8b84a'); }
  };
  ivStage(L);
  ivTag('ANCIENT EGYPT', 960, 190, 36, ivPop(S.t0 + 0.15));
}, { sec: 's01', title: 'talking to humans — Egypt: Bastet statue + scribe, track' });
SFX(CUT('024-narrator'), 'whoosh', 0.8);
SFX(CUT('024-narrator') + 0.5, 'wiper', 0.3, 0.4);                                 // desert wind

// SHOT — "for thousands of years." — a timeline draws across: then → Egypt → ships → today; 9,500 lands on "years"
SHOT(CUT('024-narrator', 'thousands'), 's01_timeline', (lt, S) => {
  IV_CAM = { x: 960, y: 560, z: 1 };
  ivStage(SET_void({ fg: false }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const D = Math.max(0.5, VWE('024-narrator', 'years') - S.t0), u = EZ.o3(clamp(lt / D)), x0 = 220, x1 = 1700, y = 700;
  ivLine(x0, y, lerp(x0, x1, u), y, 6, '#ffd29a');
  [['9,500 YEARS AGO', 0], ['EGYPT', 0.42], ['SHIPS', 0.72], ['TODAY', 1]].forEach(([l, p], i) => {
    if (u < p - 0.001 && p > 0) return; const x = lerp(x0, x1, p), a = clamp((u - p) * 8 + (p === 0 ? 1 : 0));
    ivDot(x, y, 12, '#ffd29a'); ivText(l, x, y + 64, 26, `rgba(255,230,200,${a})`, { track: 2 });
    ctx.save(); ctx.globalAlpha = a; ivCat({ x: x - 30, y: y - 20, s: 90, f: 1, coat: [CATS.alley[2], { key: 'tlB', col: '#1c1b22', pattern: 'plain', eye: '#e8c34a' }, CATS.alley[1], CATS.pickles][i], pose: 'sit' });
    ivMan({ who: [CAST.extraA, { key: 'tlE', top: 'tee', col: '#efe6d0' }, CAST.extraB, CAST.kai][i], x: x + 40, y: y - 20, h: 200, f: -0.5, pose: ivPose('relaxed'), expr: { eyes: 'open', mouth: 'smile' } }); ctx.restore();
  });
  ivText(ivCount(S.t0, VWE('024-narrator', 'years'), 0, 9500).toLocaleString('en-US') + ' YEARS', 960, 330, 96, '#ffe2b0', { glow: 'rgba(255,150,70,0.6)', track: 3 });
  ctx.restore();
}, { sec: 's01', title: 'for thousands of years — timeline draws, 9,500 YEARS' });
s01_sfxCount(CUT('024-narrator', 'thousands'), VWE('024-narrator', 'years'), 0, 9500, 'tick', 0.3, 0, 2000);
SFX(CUT('024-narrator', 'thousands'), 'slide', 0.6, -0.5);

// SHOT — "We just never understood a word." — a cat says MEOW, the person scratches his head: ???
SHOT(CUT('025-narrator'), 's01_never', (lt, S) => {
  IV_CAM = { x: 960, y: 640, z: 1.35 };
  const sc = Math.sin(lt * 14) * 0.03;
  ivStage(SET_void({ act: () => {
    s01_man({ who: CAST.extraB, x: 1150, y: GROUND, h: 520, f: -0.4, pose: ivPose('catchUp', { hR: [0.05 + sc, -0.27] }), expr: { eyes: 'squint', mouth: 'frown', brow: 'sad', look: [-1, 0.5] } });
    s01_cat({ x: 780, y: GROUND, s: 160, f: 1, coat: CATS.alley[5], pose: 'sit', expr: { eyes: 'open', mouth: TT < S.t0 + 0.5 ? 'open' : 'closed' }, look: [1, -1] });
  } }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  s01_bubble(600, 500, 'MEOW.', ivPop(S.t0 + 2 / FPS), { size: 54, tx: 660, ty: 760 });
  s01_bubble(1450, 200, '???', ivPop(VW('025-narrator', 'understood')), { size: 64, tx: 1300, ty: 330 });
  ctx.restore();
}, { sec: 's01', title: 'never understood a word — MEOW / ???' });
SFX(CUT('025-narrator') + 2 / FPS, 'pop', 0.6, -0.3);
SFX(VW('025-narrator', 'understood'), 'pop', 0.6, 0.4);
SFX(VW('025-narrator', 'understood') + 0.3, 'cloth', 0.5, 0.4);                    // head scratch

// SHOT [BEAT] — wordless: back in the bedroom, Pickles turns to the camera, deadpan. Then a slow, long-suffering sigh.
SHOT(LE('025-narrator') + 0.3, 's01_beatEnd', (lt, S) => {
  IV_CAM = { x: 1150, y: 700, z: 3.2 * ivPush(S.t0, 0.04, 2) };
  const sigh = Math.sin(clamp((lt - 0.6) / 0.8) * Math.PI);
  ivStage(s01_bedSit({ fg: false, pexpr: { eyes: sigh > 0.3 ? 'closed' : 'half' }, plook: [0, 0] }));
  ivTag('…', 1360, 280, 60, ivPop(S.t0 + 0.5) * (1 - clamp((lt - 1.6) / 0.3)));
}, { sec: 's01', title: '[beat] Pickles to camera, deadpan sigh' });
SFX(LE('025-narrator') + 0.3, 'swish', 0.4);
SFX(LE('025-narrator') + 0.9, 'cloth', 0.4, 0.2);                                  // the sigh
