// =====================================================================
//  s02 — PLUS (lines 026–052): you finally know what they're saying. The bus stop (Duchess), the pet shop (Noodle),
//  Mrs. Gomez's six cats and the ring, the lemon cake; hearing (85,000 Hz, pipes, mice, doors, 4B); watching
//  (windows, walls, cars, every street has eyes); helping (wallet, dog, gas leak) and the news: the Cat Whisperer.
//  Every shot carries the small gold "+" (top-left).
// =====================================================================
const s02_R = (lt, a, d) => EZ.o3(clamp((lt - a) / d));            // a fast gesture ramp that stops hard
const s02_W = (id, w, n = 1) => VW(id, w, n) - SHOT_T0;              // a word start, in shot time
const s02_WE = (id, w, n = 1) => VWE(id, w, n) - SHOT_T0;
const s02_L = (id) => LT(id) - SHOT_T0;
function s02_scr(fn) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); fn(); ctx.restore(); }
// a camera move over the whole shot (capped at 4 s so the dev build's last shot does not crawl)
function s02_mv(lt, S, a, b, ease = EZ.io) { const u = ease(clamp(lt / Math.min(4, Math.max(0.5, S.t1 - S.t0)))); IV_CAM = { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u) }; }
// the gold "+" badge, top-left inside the bars
function s02_plus(a = 1, y = 128) {
  s02_scr(() => {
    ctx.globalAlpha *= a; const x = 104, r = 34;
    ivGlow(x, y, 90, 'rgba(255,190,80,0.35)');
    ivDot(x, y, r, 'rgba(20,14,10,0.78)'); ctx.beginPath(); ctx.arc(x, y, r - 3, 0, TAU); ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = 4; ctx.stroke();
    ivLine(x - 15, y, x + 15, y, 8, '#ffd66a'); ivLine(x, y - 15, x, y + 15, 8, '#ffd66a');
  });
}
// people and cats always stand on a long soft shadow
function s02_man(who, x, f, h, pose, expr, o = {}) {
  const y = o.y ?? GROUND; if (o.shadow !== false) ivCastShadow(x, y, h, { a: 0.3 });
  return ivMan({ who, x, y, h, f, pose: pose || ivPose('relaxed'), expr: expr || { eyes: 'open', mouth: 'flat' }, ...o });
}
function s02_cat(coat, x, y, s, f, o = {}) {
  if (o.shadow !== false) ivCastShadow(x, y, s * 0.9, { a: 0.28, w: 0.5, len: 0.6 });
  return ivCat({ x, y, s, f, coat, pose: o.pose || 'sit', expr: o.expr || {}, ...o });
}
// a close-up forearm + glove from (x0, y0) (off frame) to the wrist (x1, y1); o.under draws what the hand holds
function s02_arm(x0, y0, x1, y1, h, grip, col, o = {}) {
  const lw = IV_J.lw * h, sw = 1.75 * lw, rw = Math.max(2.5, h * 0.0016), k = IV_M.key, s = o.s ?? 1;
  const pass = (rim) => {
    const C = (c) => (rim ? IV_M.rim : c), Wd = (w) => w + (rim ? rw * 2 : 0);
    ctx.save(); if (rim) ctx.translate(k[0] * rw, k[1] * rw);
    ivLine(x0, y0, x1, y1, Wd(lw), C(IV.ink));
    if (col) { const c = o.cuff ?? 0.82; ivLine(x0, y0, lerp(x0, x1, c), lerp(y0, y1, c), Wd(sw), C(col)); if (!rim) ivLine(lerp(x0, x1, c - 0.04), lerp(y0, y1, c - 0.04), lerp(x0, x1, c), lerp(y0, y1, c), sw, ivShade(col, -0.25), 'butt'); }
    ivHand(x1, y1, Math.atan2(y1 - y0, x1 - x0), h, 'glove', grip, C, Wd, s);
    ctx.restore();
  };
  pass(true); if (o.under) o.under(x1, y1); pass(false);
}
// a soft macro background for an insert: a set's layers, the camera close on a point, focus pulled forward
function s02_macro(layers, x, y, z = 3, focus = 0.45) { IV_CAM = { x, y, z }; IV_FOCUS = focus; ivStage(layers); IV_FOCUS = 1; }
// a cream speech bubble with a tail toward (tx, ty) — what the cats say, now in words
function s02_bubble(x, y, text, a, tx, ty, size = 34) {
  if (a <= 0) return;
  ctx.save(); ctx.font = `800 ${size}px ${IV.font}`; const w = ctx.measureText(text).width + size * 1.2, h = size * 1.7, sc = 0.6 + 0.4 * EZ.back(clamp(a));
  ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(a * 2);
  ivPoly([[-w * 0.12, h * 0.3], [w * 0.08, h * 0.3], [(tx - x) / sc, (ty - y) / sc]], '#fbf3e4');
  ivRR(-w / 2 + 4, -h / 2 + 6, w, h, h / 2, 'rgba(0,0,0,0.25)'); ivRR(-w / 2, -h / 2, w, h, h / 2, '#fbf3e4', 'rgba(90,60,40,0.35)', 2);
  ivText(text, 0, size * 0.36, size, '#2a2026', { track: 1 }); ctx.restore();
}
// close-ups through the pet shop glass: hold the passers-by of the set off the frame for this draw only
function s02_noPass(fn) { const keep = ext_person; ext_person = () => {}; try { fn(); } finally { ext_person = keep; } }
const s02_quote = (str, x, y, a, size = 32) => s02_scr(() => ivTag(str, x, y, size, a, { c: '#ffe6c4' }));

// ---------------------------------------------------------------------
//  026 "Plus." — the badge as a title card, the talking cats of this part orbiting it
// ---------------------------------------------------------------------
SHOT(CUT('026-narrator'), 's02_plusCard', (lt) => {
  IV_CAM = { x: 960, y: 540, z: 1 + 0.04 * s02_R(lt, 0, 1.6) };
  ivStage(SET_void({ glow: [255, 200, 110], act: () => {
    const u = s02_R(lt, 0.05, 0.25), sc = 0.6 + 0.4 * EZ.back(u);
    const r = 360, sp = lt * 0.5;
    [[0.4, CATS.duchess, 190], [2.5, CATS.noodle, 130], [4.5, CATS.gomez1, 170]].forEach(([a0, coat, s], i) => {
      const a = a0 + sp, x = 960 + Math.cos(a) * r * 1.55, y = 520 + Math.sin(a) * r * 0.5 + s * 0.5;
      ctx.save(); ctx.globalAlpha = s02_R(lt, 0.25 + i * 0.1, 0.2); ivCat({ x, y, s, f: Math.cos(a) > 0 ? -1 : 1, coat, pose: 'sit', expr: { eyes: 'happy', mouth: 'open' } }); ctx.restore(); });
    ctx.save(); ctx.translate(960, 470); ctx.rotate((1 - u) * -0.6); ctx.scale(sc, sc); ctx.globalAlpha = clamp(u * 3);
    ivGlow(0, 0, 420, 'rgba(255,190,80,0.45)');
    ivDot(0, 0, 190, 'rgba(26,18,12,0.85)'); ctx.beginPath(); ctx.arc(0, 0, 176, 0, TAU); ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = 14; ctx.stroke();
    ivLine(-90, 0, 90, 0, 44, '#ffd66a'); ivLine(0, -90, 0, 90, 44, '#ffd66a'); ctx.restore();
    ivText('PLUS', 960, 790, 72, '#ffe2b0', { glow: 'rgba(255,160,70,0.7)', track: 14 });
  } }));
  s02_plus(s02_R(lt, 0.4, 0.2));
}, { sec: 's02', title: 'PLUS — the gold + badge, three talking cats orbit' });
{ const t = CUT('026-narrator');
  SFX(t, 'whoosh', 1); SFX(t + 0.12, 'pop', 1.3); SFX(t + 0.55, 'pop', 0.4, 0.6); SFX(t + 0.9, 'pop', 0.35, -0.5); }

// ---------------------------------------------------------------------
//  027a "You finally know" — Kai walks down the street; a tux cat on the sidewalk turns to him
// ---------------------------------------------------------------------
const s02_tux = { ...IV_COATS.tux, key: 's02tux' };
SHOT(CUT('027-narrator'), 's02_walkStreet', (lt, S) => {
  s02_mv(lt, S, [820, 560, 1.06], [1080, 560, 1.22]);
  ivStage(SET_street({ t: 'day', act: () => {
    const w = ivWalk(S.t0, 420, 520, 1, 6);
    s02_man(CAST.kai, w.x, 0.5, 520, w.pose, { eyes: 'open', mouth: 'flat', look: [1, 0.2] });
    const tu = s02_R(lt, s02_W('027-narrator', 'know') - 0.1, 0.15);
    s02_cat(s02_tux, 1330, GROUND, 140, -1, { expr: { eyes: 'half', mouth: tu > 0.5 && Math.sin(lt * 18) > 0 ? 'open' : 'closed' }, look: [-1 * tu, 0] });
    s02_bubble(1440, 640, 'Morning, giant.', s02_R(lt, s02_W('027-narrator', 'know'), 0.2), 1350, 760, 32);
  } }));
  s02_plus();
}, { sec: 's02', title: 'you finally know — a sidewalk cat says "Morning"' });
{ const t = CUT('027-narrator'), t1 = CUT('027-narrator', 'what');
  SFX(t, 'whoosh', 0.8, -0.3);
  for (let k = 1; t + k * 0.5 < t1; k++) SFX(t + k * 0.5, 'step', 0.4, -0.2 + k * 0.1);
  SFX(VW('027-narrator', 'know'), 'pop', 0.7, 0.4); }

// ---------------------------------------------------------------------
//  027b "what they're saying." — the cat close: its words in a bubble; Kai's double take behind
// ---------------------------------------------------------------------
SHOT(CUT('027-narrator', 'what'), 's02_tuxSays', (lt) => {
  IV_CAM = { x: 1160, y: 660, z: 1.7 * ivPush(SHOT_T0, 0.04, 1.5) };
  ivStage(SET_street({ t: 'day', act: () => {
    s02_man(CAST.kai, 980, 0.6, 520, ivPose('relaxed', { tilt: -0.1 }), { eyes: 'wide', mouth: 'o', brow: 'up', look: [1, 0.6] });
    s02_cat(s02_tux, 1330, GROUND, 140, -1, { expr: { eyes: 'half', mouth: Math.sin(lt * 16) > 0 && lt < 1.3 ? 'open' : 'closed' }, look: [-1, -0.3] });
    s02_bubble(1420, 650, 'Nice hoodie. NOT.', s02_R(lt, 0.1, 0.2), 1355, 770, 30);
  } }));
  s02_plus();
}, { sec: 's02', title: "what they're saying — the cat's bubble, Kai double takes" });
{ const t = CUT('027-narrator', 'what'); SFX(t, 'swish', 0.5); SFX(t + 0.12, 'pop', 0.8, 0.4); SFX(t + 0.6, 'cloth', 0.4, -0.2); }

// ---------------------------------------------------------------------
//  028 "The cat at the bus stop." — the bus stop, dolly in toward Duchess on the low wall
// ---------------------------------------------------------------------
const s02_bus = (o = {}) => { const B = SET_POS2.busStop;
  s02_man(CAST.kai, B.kai, 0.55, 520, o.pose || ivPose('relaxed'), o.kai || { eyes: 'open', mouth: 'flat', look: [1, -0.3] });
  s02_cat(CATS.duchess, B.duchess[0], B.duchess[1], 170, -1, { expr: o.duch || { eyes: 'half' }, talk: o.talk, shadow: false });
};
SHOT(CUT('028-narrator'), 's02_busWide', (lt, S) => {
  s02_mv(lt, S, [760, 560, 1.0], [1060, 600, 1.28]);
  ivStage(SET_busStop({ act: () => s02_bus() }));
  s02_plus();
}, { sec: 's02', title: 'the cat at the bus stop — dolly in on Duchess' });
{ const t = CUT('028-narrator'); SFX(t, 'whoosh', 0.9, 0.2); SFX(t + 0.4, 'car', 0.45, -0.6, 2.2); SFX(VW('028-narrator', 'cat'), 'step', 0.35, -0.2); SFX(VW('028-narrator', 'stop') + 0.2, 'cloth', 0.4, 0.5); }

// ---------------------------------------------------------------------
//  029a "Darling, your shoe is untied." — Duchess close, posh, talking
// ---------------------------------------------------------------------
SHOT(CUT('029-duchess'), 's02_duchessTalk', () => {
  IV_CAM = { x: 1240, y: 625, z: 2.9 * ivPush(SHOT_T0, 0.025, 1.4) };
  ivStage(SET_busStop({ act: () => s02_bus({ talk: '029-duchess', duch: { eyes: 'half' } }) }));
  s02_plus();
}, { sec: 's02', title: '"Darling, your shoe is untied." — Duchess close' });
{ const t = CUT('029-duchess'); SFX(t, 'swish', 0.4, 0.3); SFX(t + 0.35, 'cloth', 0.3, 0.4); }

// 029b on "shoe" — the insert: Kai's feet on the pavement, a white lace trailing; he looks down
SHOT(CUT('029-duchess', 'shoe'), 's02_shoe', (lt) => {
  IV_CAM = { x: 800, y: 790, z: 2.7 };
  ivStage(SET_busStop({ act: () => {
    const B = SET_POS2.busStop, lift = s02_R(lt, 0.2, 0.15) * (1 - s02_R(lt, 0.5, 0.15));
    s02_man(CAST.kai, B.kai, 0.55, 520, ivPose('relaxed', { fR: [0.08, 0.45 - lift * 0.03], tilt: 0.3 }), { eyes: 'open', mouth: 'flat', look: [0.3, 1] });
    // the lace: two loops on the right shoe, the ends dragging on the ground
    const fx = B.kai + 0.034 * 520 * 0.725 + 0.08 * 520, fy = GROUND - lift * 15, sw = Math.sin(lt * 3) * 3;
    ctx.save(); ctx.strokeStyle = '#f4efe6'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(fx + 8, fy - 6); ctx.bezierCurveTo(fx + 30, fy - 2, fx + 40 + sw, fy + 6, fx + 66 + sw, fy + 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx + 6, fy - 6); ctx.bezierCurveTo(fx - 6, fy + 4, fx - 30, fy + 3, fx - 44 - sw, fy + 1); ctx.stroke(); ctx.restore();
  } }));
  s02_scr(() => ivTag('UNTIED', 1120, 330, 30, ivPop(SHOT_T0 + 0.3)));
  s02_plus();
}, { sec: 's02', title: 'shoe — insert: the untied lace' });
{ const t = CUT('029-duchess', 'shoe'); SFX(t, 'swish', 0.5, -0.2); SFX(t + 0.25, 'cloth', 0.5, -0.1); SFX(t + 0.45, 'step', 0.4, -0.1); }

// 029c "And your haircut is a tragedy." — Kai's face; a hand goes up to his (non-existent) hair
SHOT(CUT('029-duchess', 'and'), 's02_haircut', (lt) => {
  IV_CAM = { x: 780, y: 500, z: 2.6 };
  const u = s02_R(lt, s02_W('029-duchess', 'haircut') - 0.1, 0.18);
  ivStage(SET_busStop({ act: () => {
    const B = SET_POS2.busStop;
    s02_man(CAST.kai, B.kai, 0.45, 520, ivPoseMix(ivPose('relaxed'), ivPose('relaxed', { hR: [0.02, -0.2], tilt: -0.08 }), u),
      u > 0.5 ? { eyes: 'sad', mouth: 'frown', brow: 'sad', look: [1, -0.2] } : { eyes: 'squint', mouth: 'flat', look: [1, 0] }, { grip: { front: 'flat' } });
  } }));
  s02_quote('"YOUR HAIRCUT IS A TRAGEDY."', 1400, 190, ivPop(VW('029-duchess', 'haircut')));
  s02_plus();
}, { sec: 's02', title: 'haircut is a tragedy — Kai touches his bald head' });
{ const u = VW('029-duchess', 'haircut') - 0.1; SFX(CUT('029-duchess', 'and'), 'swish', 0.4, 0.2); SFX(u, 'cloth', 0.6, 0.1); SFX(VW('029-duchess', 'tragedy'), 'pop', 0.5, 0.5); }

// ---------------------------------------------------------------------
//  030 "The kitten in the pet shop window." — the shop front, dolly toward the window display
// ---------------------------------------------------------------------
const s02_noodleIn = (lt, o = {}) => { const Wn = SET_POS2.petShop.window, x = Wn.spots[1][0], hop = o.hop ? Math.abs(Math.sin(lt * 7.5)) : 0;
  ivCastShadow(x, Wn.sill, 80 * (1 - hop * 0.4), { a: 0.25, w: 0.5, len: 0.5 });
  ivCat({ x, y: Wn.sill - hop * 70, s: 92, f: 1, coat: CATS.noodle, pose: hop > 0.25 ? 'stand' : 'sit', arch: -4, rot: -hop * 0.25, talk: o.talk, expr: o.expr || { eyes: 'wide' }, look: o.look || [0.5, 0.3] }); };
SHOT(CUT('030-narrator'), 's02_petWide', (lt, S) => {
  s02_mv(lt, S, [1300, 540, 1.0], [900, 600, 1.35]);
  ivStage(SET_petShop({ inside: () => s02_noodleIn(lt), act: () => s02_man(CAST.kai, 400, 0.55, 520, ivPose('relaxed'), { eyes: 'open', mouth: 'smile', look: [1, 0] }) }));
  s02_plus();
}, { sec: 's02', title: 'the kitten in the pet shop window — dolly in' });
{ const t = CUT('030-narrator'); SFX(t, 'whoosh', 0.9, -0.2); SFX(t + 0.5, 'step', 0.35, -0.5); SFX(VW('030-narrator', 'kitten'), 'pop', 0.4, 0.1); SFX(VW('030-narrator', 'window'), 'glass', 0.45, 0); }

// ---------------------------------------------------------------------
//  031a "Pick me! Pick me!" — Noodle hopping against the glass
// ---------------------------------------------------------------------
SHOT(CUT('031-noodle'), 's02_noodleHop', (lt) => {
  const Wn = SET_POS2.petShop.window;
  IV_CAM = { x: Wn.spots[1][0], y: 650, z: 3.4 };
  s02_noPass(() => ivStage(SET_petShop({ kittens: 0, fg: false, inside: () => s02_noodleIn(lt, { hop: true, talk: '031-noodle', expr: { eyes: 'wide' } }), act: () => {} })));
  s02_quote('"PICK ME!"', 1480, 200, ivPop(VW('031-noodle', 'pick')));
  s02_plus();
}, { sec: 's02', title: '"Pick me! Pick me!" — Noodle hops at the glass' });
{ const t = CUT('031-noodle'); for (let k = 0; k < 3; k++) SFX(t + 0.15 + k * 0.42, 'bounce', 0.45, 0.1); SFX(VW('031-noodle', 'pick', 2), 'glass', 0.5, 0.1); }

// 031b "I bite, but only a little!" — Kai's finger taps the glass; Noodle snaps at it
SHOT(CUT('031-noodle', 'i'), 's02_noodleBite', (lt) => {
  const Wn = SET_POS2.petShop.window, tb = s02_W('031-noodle', 'bite'), tl = s02_W('031-noodle', 'little');
  IV_CAM = { x: Wn.spots[1][0] - 10, y: 660, z: 3.6 };
  s02_noPass(() => ivStage(SET_petShop({ kittens: 0, fg: false, inside: () => s02_noodleIn(lt, { talk: '031-noodle', expr: { eyes: lt > tb ? 'angry' : 'wide', mouth: lt > tb ? 'open' : undefined }, look: [1, 0] }), act: () => {} })));
  s02_scr(() => {
    const inU = s02_R(lt, 0, 0.2), outU = s02_R(lt, tl - 0.05, 0.15), tap = lt > 0.25 && lt < tb ? Math.abs(Math.sin((lt - 0.25) * 14)) * 10 : 0;
    const hx = lerp(1900, 1250, inU) + outU * 200 + tap, hy = lerp(1050, 660, inU) + outU * 120;
    s02_arm(hx + 760, hy + 420, hx, hy, 5200, 'point', CAST.kai.col, { s: -1 });
  });
  s02_plus();
}, { sec: 's02', title: '"I bite, but only a little!" — the finger, the snap' });
{ const t = CUT('031-noodle', 'i'), tb = VW('031-noodle', 'bite');
  SFX(t, 'swish', 0.5, 0.5); SFX(t + 0.3, 'glass', 0.6, 0.3); SFX(tb + 0.05, 'gasp', 0.5, 0.1); SFX(VW('031-noodle', 'little') - 0.05, 'swish', 0.7, 0.6); }

// ---------------------------------------------------------------------
//  032a "Mrs. Gomez next door" — her living room, the six cats, Kai at the door; dolly in
// ---------------------------------------------------------------------
const s02_gomez = (o = {}) => s02_man(CAST.gomez, SET_POS.gomez.sofaSeats[0], 0.4, 520, o.pose || ivPose('sit'), o.expr || { eyes: 'happy', mouth: 'smile' }, { shadow: false, talk: o.talk });
SHOT(CUT('032-narrator'), 's02_gomezWide', (lt, S) => {
  s02_mv(lt, S, [760, 540, 1.0], [1020, 530, 1.3]);
  const wv = s02_R(lt, s02_W('032-narrator', 'door') - 0.1, 0.18);
  ivStage(SET_gomez({ cats: 6, act: () => { s02_gomez();
    s02_man(CAST.kai, 1440, -0.5, 520, ivPoseMix(ivPose('relaxed'), ivPose('wave'), wv), { eyes: 'open', mouth: 'smile', look: [-1, 0] }); } }));
  s02_plus();
}, { sec: 's02', title: 'Mrs. Gomez next door — her room, dolly in' });
{ const t = CUT('032-narrator'); SFX(t, 'whoosh', 0.9, -0.2); SFX(VW('032-narrator', 'door') - 0.15, 'door', 0.7, 0.6); SFX(VW('032-narrator', 'door') + 0.3, 'cloth', 0.4, 0.5); }

// 032b "has six cats." — the room wide and still; numbers pop over each cat, the 6 lands on "six"
SHOT(CUT('032-narrator', 'has'), 's02_sixCats', (lt) => {
  IV_CAM = { x: 960, y: 560, z: 1.02 };
  const P = SET_POS.gomez, t0 = s02_W('032-narrator', 'has'), t1 = s02_WE('032-narrator', 'six');
  ivStage(SET_gomez({ cats: 6, act: () => s02_gomez({ expr: { eyes: 'happy', mouth: 'grin' } }), front: () => {
    [4, 5, 0, 1, 3, 2].forEach((ci, k) => { const [x, y, s] = P.cats[ci], tk = lerp(t0, t1, k / 5);
      ivTag(String(k + 1), x, y - s * 1.05, 34, ivPop(SHOT_T0 + tk), { bg: k === 5 ? 'rgba(160,90,20,0.92)' : undefined }); });
  } }));
  s02_scr(() => ivTag('6 CATS', 960, 175, 46, ivPop(SHOT_T0 + t1)));
  s02_plus();
}, { sec: 's02', title: 'six cats — 1…6 pop, "6 CATS" lands on six' });
{ const t0 = VW('032-narrator', 'has'), t1 = VWE('032-narrator', 'six');
  SFX(t0, 'tick', 0.45, -0.6); SFX(lerp(t0, t1, 0.4), 'tick', 0.45, 0); SFX(lerp(t0, t1, 0.8), 'tick', 0.45, 0.5); SFX(t1, 'pop', 1.0, 0); SFX(t1 + 0.5, 'step', 0.35, -0.6); }

// ---------------------------------------------------------------------
//  033 "They tell you everything." — Kai on the sofa, buried in cats, every one of them talking
// ---------------------------------------------------------------------
const s02_gc = (i) => SET_GOMEZ_COATS[i];
SHOT(CUT('033-narrator'), 's02_tellAll', (lt) => {
  IV_CAM = { x: 860, y: 600, z: 1.75 * ivPush(SHOT_T0, 0.04, 1.6) };
  const lines = [['She snores.', 560, 470, 0.15], ['PSST!', 1180, 400, 0.45], ['The mailman…', 1270, 690, 0.75], ['Tuesday, she…', 470, 690, 1.05]];
  ivStage(SET_gomez({ cats: 0, act: () => {
    s02_man(CAST.kai, 880, 0.1, 520, ivPose('sit', { hL: [-0.05, 0.22], hR: [0.06, 0.2] }), { eyes: 'wide', mouth: 'o', look: [Math.sin(lt * 2.5), -0.3] }, { shadow: false });
    const talk = (k) => (Math.sin(lt * 15 + k * 2) > 0.1 && lt > lines[k][3] ? 'open' : 'closed');
    ivCat({ x: 660, y: 566, s: 115, f: 1, coat: s02_gc(0), pose: 'loaf', expr: { eyes: 'open', mouth: talk(0) } });
    ivCat({ x: 1060, y: 566, s: 120, f: -1, coat: s02_gc(1), pose: 'sit', expr: { eyes: 'half', mouth: talk(1) } });
    ivCat({ x: 1170, y: 632, s: 115, f: -1, coat: s02_gc(2), pose: 'sit', expr: { eyes: 'open', mouth: talk(2) } });
    ivCat({ x: 690, y: 745, s: 110, f: 1, coat: s02_gc(3), pose: 'sit', expr: { eyes: 'wide', mouth: talk(3) } });
    s02_cat(s02_gc(4), 1050, GROUND + 60, 140, -1, { expr: { eyes: 'open' } });
    s02_cat(s02_gc(5), 640, GROUND + 70, 150, 1, { expr: { eyes: 'half' } });
  }, front: () => lines.forEach(([s, x, y, d], k) => s02_bubble(x, y, s, s02_R(lt, d, 0.2), [660, 1060, 1170, 690][k] + [30, -30, -30, 30][k], [530, 500, 560, 690][k], 30)) }));
  s02_plus();
}, { sec: 's02', title: 'they tell you everything — Kai buried in talking cats' });
{ const t = CUT('033-narrator'); SFX(t, 'swish', 0.5); [0.15, 0.75].forEach((d, k) => SFX(t + d, 'pop', 0.5, [-0.4, 0.5][k])); SFX(t + 1.4, 'cloth', 0.4, 0); }

// ---------------------------------------------------------------------
//  034a "She talks to her plants." — Gomez whispering to her fern; Duchess (visiting) on the sofa arm tells it
// ---------------------------------------------------------------------
const s02_duchArm = (o = {}) => ivCat({ x: 1170, y: 634, s: 125, f: -1, coat: CATS.duchess, pose: 'sit', talk: '034-duchess', expr: o.expr || { eyes: 'half' }, look: o.look });
SHOT(CUT('034-duchess'), 's02_plants', (lt) => {
  IV_CAM = { x: 1260, y: 560, z: 1.55 };
  ivStage(SET_gomez({ cats: 0, act: () => {
    ivAO(1440, 900, 1600, 900, 10, 0.4); set_inPlant(1520, 900, 1.05, 's02fern', { leaf: '#3f8a44', pot: '#c86a3a', n: 9 });
    const lean = 0.18 + 0.03 * Math.sin(lt * 3);
    s02_man(CAST.gomez, 1330, 0.75, 520, ivPose('relaxed', { lean, hR: [0.2, 0.12], hL: [0.05, 0.2] }), { eyes: 'happy', mouth: Math.sin(lt * 12) > 0 ? 'o' : 'smile' });
    s02_duchArm({ look: [-0.6, 0] });
    for (let i = 0; i < 2; i++) { const u = mod(lt * 0.8 + i * 0.5, 1); ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * u); ivText('♥', 1450 + u * 40, 560 - u * 70, 26 + i * 6, '#ff8a9a'); ctx.restore(); }
  } }));
  s02_plus();
}, { sec: 's02', title: 'she talks to her plants — Gomez + fern, Duchess tells' });
{ const t = CUT('034-duchess'); SFX(t, 'whoosh', 0.6, 0.3); SFX(t + 0.4, 'cloth', 0.35, 0.5); SFX(VW('034-duchess', 'plants'), 'paper', 0.3, 0.6); }

// 034b "She lost her ring in the sofa in March." — Duchess close, a paw-point at the cushions; "MARCH" tag
SHOT(CUT('034-duchess', 'she', 2), 's02_duchMarch', () => {
  IV_CAM = { x: 1120, y: 600, z: 3.0 };
  ivStage(SET_gomez({ cats: 0, act: () => s02_duchArm({ expr: { eyes: 'half' }, look: [-1, 0.5] }) }));
  s02_scr(() => ivTag('MARCH', 640, 230, 40, ivPop(VW('034-duchess', 'march'))));
  s02_plus();
}, { sec: 's02', title: 'lost her ring in the sofa in March — Duchess close' });
{ const t = CUT('034-duchess', 'she', 2); SFX(t, 'swish', 0.4, 0.2); SFX(VW('034-duchess', 'sofa'), 'cloth', 0.45, -0.2); SFX(VW('034-duchess', 'march'), 'pop', 0.6, -0.4); }

// 034c "It's still there." — insert down between the cushions: the glint
SHOT(CUT('034-duchess', "it's"), 's02_ringCrack', (lt) => {
  const P = SET_POS.gomez;
  s02_macro(SET_gomez({ cats: 0, ring: true, fg: false }), P.ring[0], P.ring[1] - 10, 4.2 * (1 + 0.04 * s02_R(lt, 0, 1.2)), 1);
  s02_plus();
}, { sec: 's02', title: "it's still there — the glint between the cushions" });
SFX(CUT('034-duchess', "it's"), 'swish', 0.4); SFX(VW('034-duchess', 'there'), 'glass', 0.35, -0.2);

// ---------------------------------------------------------------------
//  035 "You find the ring." — the hand digs in, pulls it out into the lamp light
// ---------------------------------------------------------------------
SHOT(CUT('035-narrator'), 's02_findRing', (lt) => {
  const P = SET_POS.gomez, tr = s02_W('035-narrator', 'ring') - 0.25;
  s02_macro(SET_gomez({ cats: 0, fg: false }), P.ring[0], P.ring[1] - 10, 4.2, 1);
  s02_scr(() => {
    const inU = s02_R(lt, 0, 0.25), up = s02_R(lt, tr, 0.3), hx = lerp(1500, 1160, inU) + up * 60, hy = lerp(1150, 760, inU) - up * 180;
    s02_arm(hx + 700, hy + 520, hx, hy, 5400, up > 0 ? 'hold' : 'open', CAST.kai.col, { s: -1 });
    if (up > 0) { if (up > 0.4) ivGlow(hx - 250, hy - 250, 340, 'rgba(255,230,160,0.5)', up); P_ring(hx - 240, hy - 150, 5, { sparkle: up }); }
  });
  s02_plus();
}, { sec: 's02', title: 'you find the ring — the hand pulls it out, sparkle' });
{ const t = CUT('035-narrator'), tr = VW('035-narrator', 'ring') - 0.25; SFX(t, 'swish', 0.6, 0.5); SFX(t + 0.3, 'cloth', 0.7, 0.3); SFX(tr, 'cloth', 0.5, 0.2); SFX(tr + 0.15, 'shimmer', 0.9, 0); }

// ---------------------------------------------------------------------
//  036 "Mrs. Gomez cries." — her face, hands to her cheeks, happy tears, the ring in her fingers
// ---------------------------------------------------------------------
SHOT(CUT('036-narrator'), 's02_cries', (lt) => {
  IV_CAM = { x: 980, y: 470, z: 2.6 * ivPush(SHOT_T0, 0.03, 1.4) };
  const u = s02_R(lt, 0.05, 0.2), cry = s02_R(lt, s02_W('036-narrator', 'cries') - 0.1, 0.2);
  let hd = null;
  ivStage(SET_gomez({ cats: 0, act: () => {
    const m = s02_man(CAST.gomez, 980, 0.2, 520, ivPoseMix(ivPose('relaxed'), ivPose('relaxed', { hL: [-0.05, -0.08], hR: [0.07, -0.08], tilt: 0.1 }), u),
      cry > 0.5 ? { eyes: 'happy', mouth: Math.sin(lt * 9) > 0 ? 'open' : 'frown', brow: 'sad' } : { eyes: 'wide', mouth: 'o', brow: 'up' }, { grip: { front: 'hold' } });
    hd = m;
    if (cry > 0) for (const side of [-1, 1]) for (let k = 0; k < 3; k++) { const v = mod(lt * 1.4 + k / 3, 1), ex = m.head[0] + 0.2 * m.R * 0.42 + side * m.R * 0.38 * 0.92, ey = m.head[1] + m.R * 0.1;
      ctx.save(); ctx.globalAlpha = cry * (1 - v); ctx.beginPath(); ctx.ellipse(ex + side * v * 10, ey + v * m.R * 1.1, 5, 8, 0, 0, TAU); ctx.fillStyle = '#9fd8ff'; ctx.fill(); ctx.restore(); }
    P_ring(m.handR[0] + 4, m.handR[1] - 12, 1.1, { sparkle: 0.6 });
  } }));
  s02_plus();
}, { sec: 's02', title: 'Mrs. Gomez cries — happy tears, the ring in her hand' });
{ const t = CUT('036-narrator'); SFX(t, 'swish', 0.4); SFX(t + 0.1, 'cloth', 0.45, 0); SFX(VW('036-narrator', 'cries'), 'gasp', 0.5, 0); SFX(VW('036-narrator', 'cries') + 0.6, 'cloth', 0.35, 0.2); }

// ---------------------------------------------------------------------
//  037 "She gives you a whole lemon cake." — she pushes the cake into Kai's hands
// ---------------------------------------------------------------------
SHOT(CUT('037-narrator'), 's02_cake', (lt) => {
  IV_CAM = { x: 1020, y: 600, z: 1.75 };
  const g = s02_R(lt, s02_W('037-narrator', 'gives') - 0.1, 0.25), take = s02_R(lt, s02_W('037-narrator', 'cake') - 0.1, 0.2);
  ivStage(SET_gomez({ cats: 3, act: () => {
    const gm = s02_man(CAST.gomez, 760, 0.5, 520, ivPoseMix(ivPose('relaxed', { hR: [0.12, 0.12], hL: [0.18, 0.13] }), ivPose('handOut', { hR: [0.32, 0.08], hL: [0.3, 0.1] }), g * (1 - take * 0.6)), { eyes: 'happy', mouth: 'grin' });
    const km = s02_man(CAST.kai, 1280, -0.5, 520, ivPoseMix(ivPose('relaxed'), ivPose('hug', { hL: [0.28, 0.1], hR: [0.3, 0.08] }), take), take > 0.5 ? { eyes: 'happy', mouth: 'grin' } : { eyes: 'wide', mouth: 'o', look: [-1, 0.5] });
    const gh = [(gm.handL[0] + gm.handR[0]) / 2, Math.min(gm.handL[1], gm.handR[1])], kh = [(km.handL[0] + km.handR[0]) / 2, Math.min(km.handL[1], km.handR[1])];
    P_lemonCake(lerp(gh[0], kh[0], take * 0.5), lerp(gh[1], kh[1], take * 0.5) + 8, 1.1);
  } }));
  s02_scr(() => ivTag('A WHOLE LEMON CAKE', 1420, 210, 32, ivPop(VW('037-narrator', 'lemon'))));
  s02_plus();
}, { sec: 's02', title: 'she gives you a whole lemon cake' });
{ const g = VW('037-narrator', 'gives') - 0.1; SFX(CUT('037-narrator'), 'swish', 0.4); SFX(g, 'cloth', 0.45, -0.2); SFX(g + 0.25, 'plastic', 0.4, 0); SFX(VW('037-narrator', 'cake') - 0.1, 'cloth', 0.5, 0.3); SFX(VW('037-narrator', 'lemon'), 'pop', 0.5, 0.5); }

// [BEAT] — Kai carries the cake home at dusk; two street cats follow the cake with their whole heads
SHOT(VWE('037-narrator', 'cake') + 0.25, 's02_cakeHome', (lt, S) => {
  s02_mv(lt, S, [760, 560, 1.15], [980, 540, 1.25]);
  ivStage(SET_street({ t: 'dusk', act: () => {
    const w = ivWalk(S.t0, 380, 520, 1, 7);
    const m = s02_man(CAST.kai, w.x, 0.5, 520, ivPose('stand', { ...w.pose, hL: [0.16, 0.13], hR: [0.2, 0.12] }), { eyes: 'happy', mouth: 'smile' });
    P_lemonCake((m.handL[0] + m.handR[0]) / 2 + 6, (m.handL[1] + m.handR[1]) / 2 - 6, 1.1);
    const lk = clamp((w.x - 1150) / 300, -1, 1);
    s02_cat(CATS.alley[3], 1150, GROUND, 135, -1, { expr: { eyes: 'wide' }, look: [lk, -0.3] });
    s02_cat(CATS.alley[5], 1290, GROUND + 10, 125, -1, { expr: { eyes: 'wide' }, look: [lk, -0.4] });
    s02_bubble(1360, 660, '…is that lemon?', s02_R(lt, 1.0, 0.2), 1290, 770, 28);
  } }));
  s02_plus();
}, { sec: 's02', title: '[beat] Kai carries the cake home, cats stare at it' });
{ const t = VWE('037-narrator', 'cake') + 0.25; SFX(t, 'whoosh', 0.6); for (let k = 1; k < 3; k++) SFX(t + k * 0.75, 'step', 0.4, -0.3 + k * 0.2); SFX(t + 1.0, 'pop', 0.45, 0.5); }

// =====================================================================
//  HEARING (038–044)
// =====================================================================
// 038a "A cat can hear sounds" — extreme close-up: Pickles' ear in his kitchen bed, sound rings arriving
SHOT(CUT('038-narrator'), 's02_ear', (lt) => {
  const B = SET_POS.kitchen.catBed;
  IV_CAM = { x: B[0] + 40, y: B[2] ? B[1] - 95 : 870, z: 4.2 * (1 + 0.03 * s02_R(lt, 0, 1.5)) };
  ivStage(SET_kitchen({ fg: false, act: () => {
    ivCat({ x: B[0], y: B[1] - 22, s: B[2], f: 1, coat: CATS.pickles, pose: 'loaf', expr: { eyes: lt > 0.5 ? 'wide' : 'half' }, look: [-0.6, -0.6] });
    for (let k = 0; k < 2; k++) P_soundRings(B[0] + 20 - k * 30, B[1] - 140, 70 + k * 20, mod(lt * 0.9 + k * 0.5, 1), { n: 3, col: '#ffe2b0' });
  } }));
  s02_plus();
}, { sec: 's02', title: 'a cat can hear — Pickles ear close-up, rings' });
{ const t = CUT('038-narrator'); SFX(t, 'swish', 0.4); SFX(t + 0.2, 'blip', 0.35, -0.3); SFX(t + 0.5, 'cloth', 0.35, -0.2); SFX(t + 0.8, 'blip', 0.3, 0.3); }

// 038b "up to eighty-five thousand hertz." — the chart: YOU 20,000, CAT counts up and lands on "thousand"
const s02_hz = (lt, u, z = 1) => { IV_CAM = { x: 960, y: 540, z }; ivStage(SET_void({ glow: [255, 190, 120], act: () => P_hzChart(960, 520, 1.35, u) })); };
SHOT(CUT('038-narrator', 'up'), 's02_hzChart', (lt) => {
  const tl = s02_WE('038-narrator', 'thousand');
  s02_hz(lt, 0.9 * clamp((lt - 0.05) / Math.max(0.3, tl - 0.05)), 1 + 0.04 * s02_R(lt, 0, 2));
  s02_plus();
}, { sec: 's02', title: '85,000 Hz — the chart counts and lands on "thousand"' });
{ const t = VW('038-narrator', 'up'), tl = VWE('038-narrator', 'thousand');
  SFX(t, 'whoosh', 0.8); SFX(t + 0.15, 'paper', 0.4); for (let k = 1; k < 3; k++) SFX(lerp(t, tl, k / 3), 'tick', 0.35, -0.4 + k * 0.3); SFX(tl, 'pop', 1.1, 0.4); }

// 039 "Four times higher than you." — push on the ×4 badge; YOU looks tiny
SHOT(CUT('039-narrator'), 's02_four', (lt) => {
  const u = 0.9 + 0.1 * clamp((lt - 0.05) / 0.3);
  IV_CAM = { x: 1150, y: 430, z: 1.55 + 0.05 * s02_R(lt, 0, 1.4) };
  ivStage(SET_void({ glow: [255, 190, 120], act: () => P_hzChart(960, 520, 1.35, u) }));
  s02_scr(() => ivTag('4× HIGHER THAN YOU', 960, 930, 40, ivPop(VW('039-narrator', 'higher'))));
  s02_plus();
}, { sec: 's02', title: 'four times higher — ×4 badge' });
{ const t = CUT('039-narrator'); SFX(t, 'swish', 0.5); SFX(t + 0.3, 'pop', 0.9, 0.3); SFX(VW('039-narrator', 'higher'), 'pop', 0.5, 0); }

// 040 "So cats hear everything." — the kitchen; Pickles sits up, ears up; sounds arrive from every corner
SHOT(CUT('040-narrator'), 's02_hearAll', (lt, S) => {
  const B = SET_POS.kitchen.catBed;
  s02_mv(lt, S, [800, 560, 1.0], [520, 760, 1.55]);
  ivStage(SET_kitchen({ fg: false, act: () => {
    s02_cat(CATS.pickles, B[0], B[1] - 22, B[2] + 10, 1, { expr: { eyes: 'wide' }, look: [Math.sin(lt * 3), -0.4], shadow: false });
    [[1500, 420, 0.0], [1000, 300, 0.25], [150, 380, 0.5], [800, 860, 0.75]].forEach(([x, y, d]) => P_soundRings(x, y, 110, mod(lt * 0.8 + d, 1), { n: 3, col: '#ffe2b0' }));
  } }));
  s02_plus();
}, { sec: 's02', title: 'cats hear everything — kitchen, rings from every corner' });
{ const t = CUT('040-narrator'); SFX(t, 'whoosh', 0.7, -0.3); SFX(t + 0.25, 'blip', 0.35, 0.6); SFX(t + 0.7, 'blip', 0.3, -0.6); SFX(VW('040-narrator', 'everything'), 'cloth', 0.35, -0.4); }

// 041 "Leaking pipes." — under the sink: the pipe drips into a puddle; Pickles' ear soft in the foreground
function s02_cabinet(lt, extra) {
  IV_M = IV_MOOD.lamp;
  return [
    { d: 2.2, draw: () => { ctx.fillStyle = '#1a1210'; ctx.fillRect(-1500, -800, 5000, 3000);
      const R = ivRoom({ back: [600, 260, 1320, 760], vp: [960, 480], wall: '#4a3a30', floor: '#3a2c24', ceil: '#2a201a', front: 2.4 });
      ivGlow(960, 380, 700, 'rgba(255,200,130,0.18)'); ivRR(700, 640, 120, 120, 8, '#5a6a8a'); ivRR(860, 680, 90, 80, 6, '#c8a040'); ivText('SOAP', 905, 730, 22, '#3a2a10'); } },
    { d: 1, draw: () => {
      P_pipe(960, 470, 1.6, { len: 520, drip: true, floor: 260 });
      const v = mod(lt * 1.2, 1); ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(lt * 4); ctx.beginPath(); ctx.ellipse(960, 900, 170 + v * 40, 26 + v * 6, 0, 0, TAU); ctx.fillStyle = 'rgba(150,190,230,0.45)'; ctx.fill(); ctx.restore();
      ctx.save(); ctx.globalAlpha = 1 - v; ctx.beginPath(); ctx.ellipse(960, 900, v * 140, v * 22, 0, 0, TAU); ctx.strokeStyle = '#cfe6ff'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
      extra && extra();
    } },
    { d: 0.6, draw: () => ivCat({ x: 120, y: 1350, s: 900, f: 1, coat: CATS.pickles, pose: 'sit', expr: { eyes: 'wide' } }) },
  ];
}
SHOT(CUT('041-narrator'), 's02_pipe', (lt) => {
  IV_CAM = { x: 960, y: 560, z: 1.1 * (1 + 0.04 * s02_R(lt, 0, 1.5)) };
  ivStage(s02_cabinet(lt));
  s02_plus();
}, { sec: 's02', title: 'leaking pipes — under the sink, the drip' });
{ const t = CUT('041-narrator'); SFX(t, 'swish', 0.4); SFX(t + 0.25, 'drip', 0.8, 0); SFX(VW('041-narrator', 'pipes') + 0.1, 'metal', 0.35, 0.2); SFX(t + 1.1, 'splash', 0.3, 0); }

// 042 "Mice in the walls." — the wall cut away: a mouse runs along the beam inside; Pickles presses an ear to the wall
SHOT(CUT('042-narrator'), 's02_mice', (lt) => {
  IV_M = IV_MOOD.kitchen || IV_MOOD.lunch; IV_CAM = { x: 940, y: 560, z: 1.05 };
  const hole = (nb) => { if (!nb) ctx.beginPath(); const r = RNG('s02hole').f; for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, k = 0.9 + r() * 0.16; (i ? ctx.lineTo : ctx.moveTo).call(ctx, 820 + Math.cos(a) * 470 * k, 540 + Math.sin(a) * 270 * k); } ctx.closePath(); };
  ivStage([
    { d: 1.4, draw: () => { ctx.fillStyle = '#2a1c1a'; ctx.fillRect(-1500, -800, 5000, 3000);
      for (let x = 340; x < 1400; x += 230) { ivRR(x, 120, 70, 900, 4, '#8a6440'); ivRR(x + 8, 120, 14, 900, 2, 'rgba(255,220,170,0.2)'); }
      ctx.fillStyle = 'rgba(230,140,150,0.35)'; for (let x = 410; x < 1400; x += 230) ctx.fillRect(x, 200, 160, 760);
      ivRR(200, 640, 1300, 36, 4, '#9a7048'); ivAO(200, 676, 1500, 676, 20, 0.4); } },
    { d: 1, draw: () => {
      ctx.save(); hole(); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, W, H);
      const mx = lerp(250, 1150, clamp((lt - 0.1) / 1.6));
      P_mouse(mx, 640, 2.4, { run: true }); P_mouse(1150, 640, 2, { f: -1 }); ctx.restore();
      // the wall itself, with the hole cut out (even-odd), plaster edge
      ctx.save(); ctx.beginPath(); ctx.rect(-1500, -800, 5000, 1700); hole(true); ctx.fillStyle = '#d8b48a'; ctx.fill('evenodd'); ctx.restore();
      for (let x = -400; x < 2400; x += 80) ivLine(x, -200, x, 900, 8, 'rgba(255,240,210,0.15)');
      ctx.save(); hole(); ctx.lineWidth = 16; ctx.strokeStyle = '#f2e6d4'; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.stroke(); ctx.restore();
      ivRR(-400, 900, 2800, 300, 0, '#7a5440'); ivAO(-400, 900, 2400, 900, 30, 0.4);
      s02_cat(CATS.pickles, 1480, 1040, 330, -1, { expr: { eyes: 'wide' }, look: [-1, -0.2] });
    } },
  ]);
  s02_plus();
}, { sec: 's02', title: 'mice in the walls — cutaway, a mouse runs the beam' });
{ const t = CUT('042-narrator'); SFX(t, 'swish', 0.4); for (let k = 0; k < 3; k++) SFX(t + 0.15 + k * 0.4, 'step', 0.3, -0.6 + k * 0.5); SFX(VW('042-narrator', 'walls'), 'tick', 0.3, 0.3); }

// the 4th-floor corridor of Kai's building, in perspective: doors on both walls, numbers, a runner carpet
function s02_corridor(lt, o = {}) {
  IV_M = { ...IV_MOOD.lamp, key: [-0.5, -0.6], rim: '#ffcf8a' };
  return [
    { d: 2.2, draw: () => { ctx.fillStyle = '#1e1612'; ctx.fillRect(-1500, -800, 5000, 3000);
      const R = ivRoom({ back: [800, 300, 1120, 640], vp: [960, 470], wall: '#a89a78', side: '#8c7e5e', sideR: '#968866', floor: '#5a3a2e', ceil: '#6a604c', front: 4.2 });
      ivQuad(R.F, 0, 1, 0.3, 0.7, '#8a2a2a'); ivQuad(R.F, 0, 1, 0.33, 0.67, null, 'rgba(230,180,90,0.5)', 3);
      ivRR(920, 400, 80, 240, 4, '#5a3a28'); ivText('4E', 960, 440, 20, '#e8c870');
      [[0.25, 'L', '4D'], [0.25, 'R', '4C'], [0.62, 'L', '4A'], [0.62, 'R', '4B']].forEach(([u, sd, n]) => {
        const M = sd === 'L' ? R.L : R.R; ivQuad(M, u, u + 0.12, 0, 0.66, '#6a4430', '#3a2418', 4);
        const p = M(u + 0.06, 0.55); ivText(n, p[0], p[1], 16 + u * 30, '#f2d27a');
        const q0 = M(u, 0.005), q1 = M(u + 0.12, 0.005); ivLine(q0[0], q0[1], q1[0], q1[1], 3 + u * 4, 'rgba(255,200,120,0.6)'); });
      for (let i = 0; i < 4; i++) { const u = 0.15 + i * 0.22, p = [lerp(960, lerp(-500, 2400, 0.5), u), lerp(300, -260, u)]; ivRR(p[0] - 40 * (1 + u * 3), p[1] - 8, 80 * (1 + u * 3), 14 * (1 + u), 6, '#fff2d0'); ivGlow(p[0], p[1] + 30, 260 * (1 + u), 'rgba(255,220,150,0.35)'); }
      o.room && o.room(R);
    } },
    { d: 1, draw: () => { o.act && o.act(); } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ivRR(1820, 300, 300, 1000, 20, '#120c0a'); set_inPlant(-60, 1200, 1.4, 's02corr', { leaf: '#24402a', pot: '#2a1a12' }); } }]),
  ];
}
// 043 "Secrets behind closed doors." — Pickles in the corridor, muffled voices leaking from behind 4B
SHOT(CUT('043-narrator'), 's02_doors', (lt, S) => {
  s02_mv(lt, S, [960, 560, 1.0], [1080, 540, 1.3]);
  ivStage(s02_corridor(lt, { room: (R) => {
    const p = R.R(0.68, 0.3);
    [['…no, YOU tell him…', 0], ['psst… the money…', 0.6]].forEach(([s, d], k) => { const u = mod(lt * 0.5 + d, 1);
      ctx.save(); ctx.globalAlpha = 0.65 * Math.sin(Math.PI * u); s02_bubble(p[0] - 180 - u * 60, p[1] - 80 - u * 90 - k * 60, s, 1, p[0] - 40, p[1] - 20, 30); ctx.restore(); });
  }, act: () => s02_cat(CATS.pickles, 1150, 960, 180, 1, { expr: { eyes: 'half' }, look: [1, -0.3] }) }));
  s02_plus();
}, { sec: 's02', title: 'secrets behind closed doors — muffled bubbles from 4B' });
{ const t = CUT('043-narrator'); SFX(t, 'whoosh', 0.6, 0.2); SFX(t + 0.1, 'crowd', 0.18, 0.6, 1.6); SFX(VW('043-narrator', 'doors'), 'door', 0.35, 0.6); }

// the door of 4B, straight on (a flat wall at the actors' plane): brass number, peephole, light under the door
function s02_door4B(lt, o = {}) {
  IV_M = { ...IV_MOOD.lamp, key: [-0.5, -0.6], rim: '#ffcf8a' };
  const vp = [960, 470];
  return [
    { d: 3, draw: () => { ctx.fillStyle = '#2a201a'; ctx.fillRect(-1500, -800, 5000, 3000); } },
    { d: 1, draw: () => {
      ctx.fillStyle = '#a89a78'; ctx.fillRect(-1500, -800, 5000, 1700); for (let x = -1400; x < 3400; x += 90) ivLine(x, -800, x, 900, 10, 'rgba(255,240,210,0.08)');
      ivRR(-1500, 820, 5000, 80, 0, '#6a4a34'); ivAO(-1500, 900, 3500, 900, 30, 0.35);
      ctx.fillStyle = '#5a3a2e'; ctx.fillRect(-1500, 900, 5000, 900); ivPoly([[700, 900], [1220, 900], [1500, 1300], [420, 1300]], '#8a2a2a');
      for (const x of [400, 1520]) { ivRR(x - 30, 330, 60, 90, 10, '#e8c870'); ivGlow(x, 360, 300, 'rgba(255,210,140,0.55)'); }
      ivBox(780, 290, 360, 610, 0.03, vp, { front: '#4a2a1c' }); ivBox(810, 320, 300, 580, 0.02, vp, { front: '#6e4430' });
      ivRR(840, 360, 240, 220, 6, null, 'rgba(0,0,0,0.25)', 4); ivRR(840, 620, 240, 240, 6, null, 'rgba(0,0,0,0.25)', 4);
      ivRR(905, 400, 110, 70, 10, '#d8ac48'); ivRR(911, 406, 98, 58, 8, null, 'rgba(255,240,190,0.6)', 2); ivText('4B', 960, 452, 46, '#3a2610');
      ivDot(960, 520, 8, '#1a1210'); ivDot(1070, 640, 14, '#d8ac48');
      ivLine(812, 897, 1108, 897, 5, 'rgba(255,200,120,0.9)'); ivGlow(960, 905, 260, 'rgba(255,190,110,0.4)');
      o.act && o.act();
    } },
    { d: 0.6, draw: () => { ivRR(-300, 200, 260, 1100, 20, '#120c0a'); } },
  ];
}
// 044a "The man in 4B…" — Pickles sits on the mat in front of 4B, deadpan, talking
SHOT(CUT('044-pickles'), 's02_pickles4B', () => {
  IV_CAM = { x: 1040, y: 680, z: 1.5 };
  ivStage(s02_door4B(0, { act: () => s02_cat(CATS.pickles, 1220, 985, 200, -1, { talk: '044-pickles', expr: { eyes: 'half' }, look: [-0.8, 0] }) }));
  s02_plus();
}, { sec: 's02', title: '"The man in 4B…" — Pickles at the door, talking' });
{ const t = CUT('044-pickles'); SFX(t, 'swish', 0.4, 0.2); SFX(VW('044-pickles', '4b'), 'pop', 0.45, 0); }

// 044b "…snores in two different keys." — under the door: a big low Z and a small high z, in turns
SHOT(CUT('044-pickles', 'snores'), 's02_snore', (lt) => {
  IV_CAM = { x: 960, y: 640, z: 1.9 };
  ivStage(s02_door4B(lt, { act: () => {
    for (let k = 0; k < 5; k++) { const ph = lt * 1.1 - k * 0.42; if (ph < 0) continue; const u = mod(ph, 2.1) / 2.1, low = k % 2 === 0;
      ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * clamp(u * 1.2)); ivText(low ? 'Z' : 'z', 960 + (low ? -1 : 1) * (40 + u * 160), 880 - u * 420, low ? 90 : 46, low ? '#ffb257' : '#9fd8ff', { glow: low ? 'rgba(255,150,60,0.6)' : 'rgba(120,200,255,0.6)' }); ctx.restore(); }
    s02_cat(CATS.pickles, 1220, 985, 200, -1, { talk: '044-pickles', expr: { eyes: 'half' }, look: [-1, -0.5] });
  } }));
  s02_scr(() => { ivTag('LOW', 640, 260, 26, ivPop(VW('044-pickles', 'two')), { c: '#ffb257' }); ivTag('HIGH', 1280, 260, 26, ivPop(VW('044-pickles', 'keys')), { c: '#9fd8ff' }); });
  s02_plus();
}, { sec: 's02', title: 'snores in two different keys — Z low / z high' });
{ const t = CUT('044-pickles', 'snores'); SFX(t + 0.1, 'buzz', 0.35, -0.3); SFX(t + 0.55, 'beep', 0.2, 0.3); SFX(VW('044-pickles', 'keys'), 'buzz', 0.3, -0.3); SFX(LE('044-pickles') + 0.15, 'cloth', 0.3, 0.4); }

// =====================================================================
//  WATCHING (045–047)
// =====================================================================
// 045 "And cats watch everything." — an extreme close-up: one yellow eye, the pupil opening; the street in it
SHOT(CUT('045-narrator'), 's02_eye', (lt) => {
  s02_macro(SET_street({ t: 'day', fg: false }), 1300, 500, 1.6, 0.5);
  s02_scr(() => {
    const ex = 860, ey = 520, op = s02_R(lt, s02_W('045-narrator', 'everything') - 0.15, 0.3), z = 1 + 0.03 * s02_R(lt, 0, 1.5);
    ctx.translate(ex, ey); ctx.scale(z, z); ctx.translate(-ex, -ey);
    ctx.beginPath(); ctx.ellipse(560, 700, 1100, 820, 0, 0, TAU); ctx.fillStyle = '#26252c'; ctx.fill();
    const g = ctx.createRadialGradient(ex + 300, ey - 300, 50, ex, ey, 1100); g.addColorStop(0, 'rgba(255,240,220,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0.3)'); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 3; for (let i = 0; i < 60; i++) { const a = i * 0.37, r = 380 + (i * 47) % 600; ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * r, ey + Math.sin(a) * r * 0.8); ctx.lineTo(ex + Math.cos(a) * (r + 40), ey + Math.sin(a) * (r + 40) * 0.8); ctx.stroke(); }
    ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, 330, 240, -0.08, 0, TAU); ctx.clip();
    const ig = ctx.createRadialGradient(ex, ey, 20, ex, ey, 340); ig.addColorStop(0, '#f6e27a'); ig.addColorStop(0.7, '#e8b83a'); ig.addColorStop(1, '#9a6a1a'); ctx.fillStyle = ig; ctx.fillRect(ex - 400, ey - 300, 800, 600);
    for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; ivLine(ex + Math.cos(a) * 70, ey + Math.sin(a) * 60, ex + Math.cos(a) * 320, ey + Math.sin(a) * 230, 2, 'rgba(120,70,10,0.25)'); }
    const pw = lerp(40, 190, op); ctx.beginPath(); ctx.ellipse(ex, ey, pw, 235, 0, 0, TAU); ctx.fillStyle = '#0c0907'; ctx.fill();
    // the street reflected: a tiny Kai walking across the curve of the eye
    ctx.globalAlpha = 0.5; ivMan({ who: CAST.kai, x: ex - 140 + lt * 90, y: ey + 120, h: 170, f: 0.8, pose: ivWalk(SHOT_T0, 0, 170, 1, 6).pose, expr: { eyes: 'open' } }); ctx.globalAlpha = 1;
    ivDot(ex + 120, ey - 120, 46, 'rgba(255,255,250,0.85)'); ivDot(ex + 60, ey - 60, 16, 'rgba(255,255,250,0.6)');
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(ex, ey, 330, 240, -0.08, 0, TAU); ctx.lineWidth = 14; ctx.strokeStyle = '#0c0b10'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,248,235,0.8)'; ctx.lineWidth = 4; for (const [a, b] of [[0.1, 1], [0.25, 0.9], [0.4, 0.8]]) { ctx.beginPath(); ctx.moveTo(ex + 380, ey + 420 + a * 100); ctx.quadraticCurveTo(ex + 800, ey + 380 + a * 300, ex + 1300 * b, ey + 340 + a * 520); ctx.stroke(); }
  });
  s02_plus();
}, { sec: 's02', title: 'cats watch everything — the eye, pupil opens, Kai reflected' });
{ const t = CUT('045-narrator'); SFX(t, 'whoosh', 0.7); SFX(t + 0.2, 'heart', 0.3); SFX(VW('045-narrator', 'everything') - 0.1, 'swish', 0.45, 0.2); }

// 046a "From windows," — a house front: cats on three sills, all heads follow Kai walking past (soft, foreground)
const s02_far = (layers) => layers.filter((L) => L.d >= 2);
SHOT(CUT('046-narrator'), 's02_windows', (lt, S) => {
  s02_mv(lt, S, [820, 540, 1.0], [1120, 520, 1.08]);
  const kx = lerp(-200, 2200, clamp(lt / 1.4));
  ivStage([...s02_far(SET_street({ t: 'day' })),
    { d: 1, draw: () => {
      const vp = [960, 470];
      ivBox(-300, 60, 2500, 840, 0.04, vp, { front: '#c98e6a' }); for (let y = 90; y < 900; y += 34) ivLine(-300, y, 2200, y, 2, 'rgba(90,40,20,0.15)');
      ivRR(-300, 860, 2500, 40, 0, '#8a5a40'); ivRR(-300, 900, 2500, 300, 0, '#b9b0a4'); ivAO(-300, 900, 2200, 900, 26, 0.3);
      [[260, CATS.gomez1], [960, s02_tux], [1660, CATS.alley[2]]].forEach(([x, coat], i) => {
        ivRR(x - 230, 200, 460, 430, 8, '#3a2a28'); ivRR(x - 215, 215, 430, 400, 4, '#26304a');
        ctx.save(); ctx.globalAlpha = 0.25; ivPoly([[x - 215, 215], [x - 60, 215], [x - 180, 615], [x - 215, 615]], '#ffffff'); ctx.restore();
        ivPoly([[x - 215, 215], [x - 120, 215], [x - 150, 600], [x - 215, 615]], '#e8d8c0'); ivPoly([[x + 215, 215], [x + 120, 215], [x + 150, 600], [x + 215, 615]], '#e8d8c0');
        const look = clamp((kx - x) / 500, -1, 1);
        ivCat({ x, y: 618, s: 170, f: kx > x ? 1 : -1, coat, pose: 'sit', expr: { eyes: 'wide' }, look: [Math.abs(look), 0.5] });
        ivBox(x - 260, 618, 520, 30, 0.06, vp, { front: '#e8dcc8' }); ivAO(x - 250, 648, x + 250, 648, 12, 0.3);
        ivBox(x - 200, 648, 400, 70, 0.04, vp, { front: '#8a4a2a' }); for (let k = 0; k < 6; k++) ivDot(x - 170 + k * 68, 645, 22, ['#e05a7a', '#f2c230', '#ffffff'][k % 3]);
      });
    } },
    { d: 0.65, draw: () => ivMan({ who: CAST.kai, x: kx, y: 1500, h: 900, f: 0.9, pose: ivWalk(S.t0, 0, 900, 1, 6).pose, expr: { eyes: 'open' } }) },
  ]);
  s02_plus();
}, { sec: 's02', title: 'from windows — three sill cats follow Kai' });
{ const t = CUT('046-narrator'); SFX(t, 'whoosh', 0.8, -0.6); SFX(t + 0.3, 'step', 0.35, -0.3); SFX(t + 0.55, 'cloth', 0.3, 0.1); }

// 046b "from walls," — the bus stop wall: a black cat on it, Kai beyond; its head turns as he passes
SHOT(CUT('046-narrator', 'from', 2), 's02_wallCat', (lt) => {
  IV_CAM = { x: 1180, y: 640, z: 1.9 };
  ivStage(SET_busStop({ act: () => {
    const w = ivWalk(SHOT_T0, 820, 520, 1, 6);
    s02_man(CAST.kai, w.x, 0.6, 520, w.pose, { eyes: 'open', mouth: 'flat', look: [-0.3, 0] });
    ivCat({ x: 1360, y: 726, s: 160, f: -1, coat: CATS.alley[0], pose: 'loaf', expr: { eyes: 'half' }, look: [-1 + lt, 0] });
  } }));
  s02_plus();
}, { sec: 's02', title: 'from walls — a black cat on the wall watching' });
{ const t = CUT('046-narrator', 'from', 2); SFX(t, 'swish', 0.4); SFX(t + 0.2, 'step', 0.35, -0.1); }

// 046c "from cars." — a ginger cat on the roof of a parked car, chin on paws, watching Kai walk
SHOT(CUT('046-narrator', 'from', 3), 's02_carCat', (lt) => {
  IV_CAM = { x: 430, y: 560, z: 1.65 };
  ivStage(SET_street({ t: 'day', act: () => {
    const w = ivWalk(SHOT_T0, 700, 520, 1, 6);
    s02_man(CAST.kai, w.x, 0.5, 520, w.pose, { eyes: 'open', mouth: 'flat' });
  }, front: () => { const P = ext_proj(700, 470), q = P(-600, 450, 1.08); ivCat({ x: q[0], y: q[1] + 4, s: 130, f: 1, coat: CATS.alley[5], pose: 'loaf', expr: { eyes: 'half' }, look: [1, 0.2] }); } }));
  s02_plus();
}, { sec: 's02', title: 'from cars — a cat on a car roof' });
{ const t = CUT('046-narrator', 'from', 3); SFX(t, 'swish', 0.4); SFX(t + 0.15, 'metal', 0.3, -0.6); SFX(VW('046-narrator', 'cars') + 0.4, 'car', 0.35, -0.5, 1.4); }

// 047 "Every street has eyes." — night, a crane up the street: dozens of eye-pairs light up on every house
SHOT(CUT('047-narrator'), 's02_eyes', (lt, S) => {
  s02_mv(lt, S, [960, 680, 1.18], [960, 420, 1.0]);
  const tE = s02_W('047-narrator', 'eyes'), r = RNG('s02eyes').f, pts = [];
  for (let i = 0; i < 70; i++) { const left = r() < 0.5; pts.push([left ? -2980 : 1320, 60 + r() * 900, 1.6 + Math.pow(r(), 1.5) * 14, r() * 0.9 + (left ? 0 : 0.05), r()]); }
  const eye = (x, y, sz, a, ph) => { if (a <= 0) return; const bl = mod(TT * 0.7 + ph * 7, 4.3) < 0.12 ? 0.15 : 1;
    ctx.save(); ctx.globalAlpha = a; ivGlow(x, y, sz * 5, 'rgba(200,255,120,0.5)'); ctx.fillStyle = '#d8ff7a'; for (const dx of [-sz, sz]) { ctx.beginPath(); ctx.ellipse(x + dx, y, sz * 0.75, sz * 0.75 * bl, 0, 0, TAU); ctx.fill(); } ctx.restore(); };
  ivStage(SET_street({ t: 'night', cats: false, mid: (P) => {
    for (const [X, Y, D, d0, ph] of pts) { const q = P(X, Y, D); eye(q[0], q[1], Math.max(3, 30 / D), clamp((lt - d0 * Math.max(0.6, tE)) * 5), ph); }
  }, act: () => {
    s02_man(CAST.kai, 760, 0.1, 520, ivPose('relaxed', { tilt: -0.05 }), { eyes: 'wide', mouth: 'o', look: [0, -1] });
    [[1150, 935], [1700, 860], [300, 980], [1450, 760], [80, 760]].forEach(([x, y], k) => eye(x, y, 13, clamp((lt - 0.3 - k * 0.25) * 5), k));
  } }));
  s02_plus();
}, { sec: 's02', title: 'every street has eyes — night crane up, eye-pairs light up' });
{ const t = CUT('047-narrator'); SFX(t, 'whoosh', 0.8); SFX(t + 0.05, 'rise', 0.4, 0, 1.4); SFX(t + 0.5, 'blip', 0.25, -0.5); SFX(VW('047-narrator', 'eyes'), 'blip', 0.35, 0.5); }

// =====================================================================
//  HELPING (048–052)
// =====================================================================
// 048 "You start helping people." — the street: a worried neighbour, the tux cat tells Kai where to look
SHOT(CUT('048-narrator'), 's02_helping', (lt, S) => {
  s02_mv(lt, S, [860, 560, 1.12], [1000, 560, 1.3]);
  const h = s02_R(lt, s02_W('048-narrator', 'helping') - 0.1, 0.2);
  ivStage(SET_street({ t: 'day', act: () => {
    s02_man(CAST.kai, 760, 0.5, 520, ivPoseMix(ivPose('relaxed'), ivPose('point', { hR: [0.3, 0.02] }), h), { eyes: 'open', mouth: 'smile', look: [1, 0] }, { grip: { front: 'point' } });
    s02_cat(s02_tux, 1000, GROUND, 135, -1, { expr: { eyes: 'half', mouth: lt < 1.2 && Math.sin(lt * 16) > 0 ? 'open' : 'closed' }, look: [-1, -0.4] });
    s02_man(CAST.extraC, 1260, -0.5, 500, ivPose(h > 0.5 ? 'relaxed' : 'think'), h > 0.5 ? { eyes: 'happy', mouth: 'smile' } : { eyes: 'sad', mouth: 'frown', brow: 'sad' });
    s02_bubble(1060, 650, 'Under the bench.', s02_R(lt, 0.2, 0.2), 1010, 770, 28);
  } }));
  s02_plus();
}, { sec: 's02', title: 'you start helping people — the cat tells, Kai points' });
{ const t = CUT('048-narrator'); SFX(t, 'whoosh', 0.7); SFX(t + 0.2, 'pop', 0.45, 0.1); SFX(VW('048-narrator', 'helping') - 0.1, 'swish', 0.5, -0.2); SFX(VW('048-narrator', 'people'), 'cloth', 0.35, 0.4); }

// 049 "A lost wallet." — under the bus-stop bench: a grey cat sitting on it like a guard; FOUND
SHOT(CUT('049-narrator'), 's02_wallet', (lt) => {
  const B = SET_POS2.busStop.bench;
  IV_CAM = { x: B[0] - 120, y: 800, z: 2.2 };
  ivStage(SET_busStop({ fg: false, front: () => {
    P_wallet(B[0] - 60, 925, 1.6, { flat: true });
    s02_cat(CATS.alley[2], B[0] - 10, 915, 150, -1, { expr: { eyes: 'half' }, look: [-1, 0.3] });
  } }));
  s02_scr(() => ivTag('FOUND', 640, 260, 36, ivPop(VW('049-narrator', 'wallet'))));
  s02_plus();
}, { sec: 's02', title: 'a lost wallet — a cat sitting on it, FOUND' });
{ const t = CUT('049-narrator'); SFX(t, 'swish', 0.4, 0.4); SFX(t + 0.2, 'paper', 0.4, 0.3); SFX(VW('049-narrator', 'wallet'), 'pop', 0.6, -0.3); }

// 050 "A missing dog." — the dog bolts into its owner's arms
SHOT(CUT('050-narrator'), 's02_dog', (lt) => {
  IV_CAM = { x: 1000, y: 620, z: 1.5 };
  const u = clamp(lt / 0.7), arr = u >= 1;
  ivStage(SET_street({ t: 'day', act: () => {
    s02_man(CAST.kai, 520, 0.5, 520, ivPose('relaxed'), { eyes: 'happy', mouth: 'smile' });
    s02_cat(s02_tux, 680, GROUND, 130, 1, { expr: { eyes: 'half' } });
    s02_man(CAST.extraB, 960, 0.6, 520, ivPose('hug', { lean: 0.32, dip: 0.07, fL: [-0.1, 0.36], fR: [0.15, 0.38], hL: [0.3, 0.12], hR: [0.34, 0.1] }), arr ? { eyes: 'happy', mouth: 'grin' } : { eyes: 'wide', mouth: 'o', brow: 'up' });
    const dx = lerp(1700, 1180, EZ.o3(u)), bob = arr ? 0 : Math.abs(Math.sin(lt * 14)) * 18;
    ivCastShadow(dx, GROUND, 200, { a: 0.28, w: 0.6, len: 0.5 });
    P_dog(dx, GROUND - bob, 1.05, { pose: arr ? 'sit' : 'stand', f: -1, wag: 1, expr: { eyes: 'happy', mouth: 'open' } });
  } }));
  s02_plus();
}, { sec: 's02', title: 'a missing dog — runs into its owner\'s arms' });
{ const t = CUT('050-narrator'); SFX(t, 'swish', 0.5, 0.6); for (let k = 0; k < 2; k++) SFX(t + 0.1 + k * 0.3, 'step', 0.35, 0.6 - k * 0.3); SFX(t + 0.75, 'cloth', 0.6, 0.1); SFX(t + 0.85, 'laugh', 0.35, 0); }

// 051a "A gas leak in the basement," — a dark basement, one bulb; the meter hisses green
SHOT(CUT('051-narrator'), 's02_basement', (lt) => {
  IV_M = { ...IV_MOOD.lamp, key: [0.3, -0.8] }; IV_CAM = { x: 960, y: 560, z: 1.05 + 0.08 * s02_R(lt, 0, 1.8) };
  const sw = Math.sin(lt * 2.2) * 0.12;
  ivStage([
    { d: 2.2, draw: () => { ctx.fillStyle = '#100c0a'; ctx.fillRect(-1500, -800, 5000, 3000);
      const R = ivRoom({ back: [560, 220, 1360, 760], vp: [960, 470], wall: '#5a544c', side: '#48433c', sideR: '#4e4942', floor: '#3a3632', ceil: '#2a2622', front: 2.6 });
      for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) ivRR(570 + j * 114 + (i % 2) * 57, 230 + i * 104, 108, 98, 2, null, 'rgba(0,0,0,0.12)', 2);
      ivRR(880, 240, 160, 60, 4, '#1a1a20'); for (let k = 0; k < 6; k++) ivLine(890 + k * 28, 244, 890 + k * 28, 296, 4, '#3a3a44');
      for (let k = 0; k < 3; k++) { ivDot(915 + k * 45, 268, 9, '#d8ff7a'); }
      ivBox(600, 560, 200, 200, 0.12, R.vp, { front: '#7a6a50' }); ivBox(1160, 600, 160, 160, 0.12, R.vp, { front: '#6a5a44' });
    } },
    { d: 1, draw: () => {
      ivLine(960, -300, 960 + Math.sin(sw) * 300, -300 + Math.cos(sw) * 420, 3, '#1a1a1a'); const bx = 960 + Math.sin(sw) * 300, by = -300 + Math.cos(sw) * 420;
      ivDot(bx, by + 20, 22, '#fff2c8'); ivGlow(bx, by + 20, 700, 'rgba(255,220,150,0.45)');
      P_pipe(960, 330, 1.4, { len: 800, rust: true });
      ivAO(700, 900, 1220, 900, 20, 0.45); P_gasMeter(960, 900 - 220 * 1.7, 1.7, { leak: 1, spin: true });
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const u = mod(lt * 0.4 + i / 6, 1); ext_puff(1080 + i * 30 + u * 200, 640 - u * 380, 80 + u * 120, '120,220,110', 0.22 * Math.sin(Math.PI * u)); } ctx.restore();
    } },
  ]);
  s02_scr(() => ivTag('GAS LEAK', 1500, 230, 38, ivPop(VW('051-narrator', 'leak')), { c: '#c8ff9a' }));
  s02_plus();
}, { sec: 's02', title: 'a gas leak in the basement — meter hisses, eyes at the grate' });
{ const t = CUT('051-narrator'); SFX(t, 'whoosh', 0.6); SFX(t + 0.1, 'wiper', 0.25, 0.3); SFX(VW('051-narrator', 'leak'), 'gasp', 0.35, 0.3); SFX(VW('051-narrator', 'basement'), 'metal', 0.35, -0.3); }

// 051b "which three cats smelled" — the street grate: three cats sniffing the green wisps; 1, 2, 3
SHOT(CUT('051-narrator', 'which'), 's02_threeCats', (lt) => {
  const G = SET_POS2.street.grate;
  IV_CAM = { x: G[0] - 20, y: 770, z: 2.0 };
  const t0 = s02_W('051-narrator', 'which'), t1 = s02_WE('051-narrator', 'three');
  ivStage(SET_street({ t: 'day', leak: true, act: () => {
    [[G[0] - 230, 1, CATS.alley[0]], [G[0] + 40, -1, CATS.alley[3]], [G[0] + 250, -1, CATS.alley[5]]].forEach(([x, f, coat], k) => {
      const sn = Math.sin(lt * 9 + k) > 0.3 ? 1 : 0;
      s02_cat(coat, x, 925 + (k === 1 ? 30 : 0), 135, f, { pose: 'stand', arch: -3, rot: f * 0.12 + sn * 0.02 * f, expr: { eyes: k === 1 ? 'wide' : 'half' }, look: [f, 1] });
      ivTag(String(k + 1), x, 690, 34, ivPop(SHOT_T0 + lerp(t0, t1, k / 2)));
    });
  } }));
  s02_plus();
}, { sec: 's02', title: 'three cats smelled it — sniffing the grate, 1 2 3' });
{ const t0 = VW('051-narrator', 'which'), t1 = VWE('051-narrator', 'three');
  SFX(t0, 'swish', 0.4); SFX(t0 + 0.1, 'pop', 0.4, -0.4); SFX(lerp(t0, t1, 0.5), 'pop', 0.45, 0); SFX(t1, 'pop', 0.6, 0.4); SFX(VW('051-narrator', 'smelled'), 'gasp', 0.3, 0); }

// 051c "before anyone else." — Kai on the phone to the gas company, neighbours hurrying out; the cats proud
SHOT(CUT('051-narrator', 'before'), 's02_callGas', (lt, S) => {
  s02_mv(lt, S, [900, 560, 1.12], [1000, 560, 1.2]);
  ivStage(SET_street({ t: 'day', leak: true, act: () => {
    const w1 = ivWalk(S.t0, 1700, 500, -1, 4), w2 = ivWalk(S.t0 + 0.2, 1900, 480, -1, 4);
    s02_man(CAST.extraA, w1.x, -0.8, 500, w1.pose, { eyes: 'wide', mouth: 'o' }); s02_man(CAST.gomez, w2.x, -0.8, 480, w2.pose, { eyes: 'wide', mouth: 'o' });
    s02_man(CAST.kai, 760, 0.4, 520, ivPose('phone'), { eyes: 'wide', mouth: Math.sin(lt * 12) > 0 ? 'open' : 'flat', brow: 'up' },
      { grip: { front: 'hold' }, hold: { front: (x, y) => P_phone(x + 4, y - 18, 0.9, { ang: -0.2, back: true }) } });
    [[1040, CATS.alley[0]], [1180, CATS.alley[3]], [1320, CATS.alley[5]]].forEach(([x, c]) => s02_cat(c, x, GROUND, 120, -1, { expr: { eyes: 'happy' } }));
  } }));
  s02_plus();
}, { sec: 's02', title: 'before anyone else — Kai calls it in, street clears' });
{ const t = CUT('051-narrator', 'before'); SFX(t, 'swish', 0.4); SFX(t + 0.15, 'beep', 0.35, -0.2); for (let k = 0; k < 2; k++) SFX(t + 0.4 + k * 0.6, 'step', 0.4, 0.7 - k * 0.2); }

// 052a "A local teenager, the so-called 'Cat Whisperer'," — the newsroom, dolly in on the anchor
const s02_anchor = () => { const A = SET_POS.newsroom.anchor; ivMan({ who: CAST.anchor, x: A[0], y: A[1], h: A[2], f: 0.1, talk: '052-newsanchor', pose: ivPose('sitDesk', { hL: [0.1, 0.17], hR: [0.16, 0.16] }), expr: { eyes: 'open', mouth: 'smile' } }); };
SHOT(CUT('052-newsanchor'), 's02_news', (lt, S) => {
  s02_mv(lt, S, [960, 540, 1.0], [960, 500, 1.35]);
  ivStage(SET_newsroom({ lower: 'LOCAL TEEN KNOWN AS THE "CAT WHISPERER"', act: s02_anchor }));
  s02_plus(1, 200);
}, { sec: 's02', title: 'the news — dolly in on the anchor, CAT WHISPERER' });
{ const t = CUT('052-newsanchor'); SFX(t, 'whoosh', 0.9); SFX(t + 0.15, 'beep', 0.4, -0.6); SFX(VW('052-newsanchor', 'whisperer'), 'pop', 0.4, 0.3); }

// 052b "has found eleven lost pets this week." — the big screen: the count lands on 11, pets pop in
SHOT(CUT('052-newsanchor', 'has'), 's02_eleven', (lt) => {
  const t0 = s02_W('052-newsanchor', 'has'), t1 = s02_WE('052-newsanchor', 'eleven');
  IV_CAM = { x: 960, y: 400, z: 2.0 }; IV_FOCUS = 2.2;
  ivStage(SET_newsroom({ lower: 'LOCAL TEEN "CAT WHISPERER" FINDS 11 LOST PETS', screen: (w, h) => {
    ctx.fillStyle = ivVGrad(0, h, ['#1d4a9a', '#0e2a62']); ctx.fillRect(0, 0, w, h);
    const n = Math.round(lerp(0, 11, EZ.o3(clamp((lt - t0) / Math.max(0.2, t1 - t0)))));
    ivText(String(n), w * 0.24, h * 0.7, 200, n === 11 ? '#ffd27a' : '#ffffff', { glow: 'rgba(255,200,100,0.5)' });
    ivText('LOST PETS FOUND', w * 0.24, h * 0.88, 26, '#bfe0ff', { track: 4, weight: 700, font: IV.sans });
    for (let i = 0; i < n; i++) { const x = w * 0.5 + (i % 6) * 62, y = h * 0.36 + Math.floor(i / 6) * 120; ctx.save(); ctx.globalAlpha = 0.95;
      if (i % 3 === 2) { ivDot(x, y + 20, 22, '#ffe2b0'); ivDot(x - 18, y + 8, 10, '#d8a070'); ivDot(x + 18, y + 8, 10, '#d8a070'); } else { ivDot(x, y + 20, 22, '#ffe2b0'); ivPoly([[x - 20, y + 10], [x - 14, y - 12], [x - 4, y + 2]], '#ffe2b0'); ivPoly([[x + 20, y + 10], [x + 14, y - 12], [x + 4, y + 2]], '#ffe2b0'); }
      ctx.restore(); }
  }, act: s02_anchor }));
  IV_FOCUS = 1;
  s02_plus(1, 200);
}, { sec: 's02', title: 'eleven lost pets — the screen counts to 11 on "eleven"' });
{ const t0 = VW('052-newsanchor', 'has'), t1 = VWE('052-newsanchor', 'eleven');
  SFX(t0, 'swish', 0.4); for (let k = 1; k < 3; k++) SFX(lerp(t0, t1, k / 3), 'tick', 0.35, -0.3 + k * 0.3); SFX(t1, 'ding', 0.7, 0); SFX(VW('052-newsanchor', 'week'), 'pop', 0.4, 0.4); }

// [BEAT] — that night: Kai on his bed grinning at the news on his phone; Pickles on the blanket, one long yawn
SHOT(LE('052-newsanchor') + 0.2, 's02_proud', (lt) => {
  const P = SET_POS.bedroom;
  IV_CAM = { x: 900, y: 600, z: 1.55 * (1 + 0.03 * s02_R(lt, 0, 2)) };
  const yawn = s02_R(lt, 0.7, 0.3) * (1 - s02_R(lt, 1.5, 0.25));
  ivStage(SET_bedroom({ t: 'night', act: () => ivMan({ who: CAST.kai, x: P.bedSit[0], y: P.bedSit[1], h: P.bedSit[2], f: 0.3, pose: ivPose('sit', { hL: [0.16, 0.1], hR: [0.2, 0.06] }), expr: { eyes: 'happy', mouth: 'grin' },
      grip: { front: 'hold' }, hold: { front: (x, y) => P_phone(x + 8, y - 30, 1.1, { ang: -0.15, screen: (w, h) => P_phoneUI.news(w, h, { head: 'Teen "Cat Whisperer" finds 11 lost pets' }) }) } }),
    onBed: () => ivCat({ x: P.chest[0], y: P.chest[1], s: P.chest[2], f: -1, coat: CATS.pickles, pose: 'loaf', expr: { eyes: yawn > 0.3 ? 'closed' : 'half', mouth: yawn > 0.3 ? 'open' : undefined } }) }));
  s02_plus();
}, { sec: 's02', title: '[beat] Kai proud with the news; Pickles yawns' });
{ const t = LE('052-newsanchor') + 0.2; SFX(t, 'whoosh', 0.5); SFX(t + 0.3, 'cloth', 0.35, -0.2); SFX(t + 0.75, 'gasp', 0.3, 0.3); SFX(t + 1.4, 'tick', 0.25, 0.6); }
