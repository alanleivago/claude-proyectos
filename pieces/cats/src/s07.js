// =====================================================================
//  s07 — 137–153 · the reunion, THE SLOW BLINK, the promise, Boss's House (~0:51)
//  Train yard, night, after: Mom holds Lily, you hold Pickles (in your arms) → "Why did you follow her?" → the slow
//  blink (extreme close-up, the lids over ~1 s) → the Sussex card → you blink back → "Don't make it weird." →
//  next morning: bowls on every corner, the city listening, the shelter behind the market, the sign "BOSS'S HOUSE".
//  Prefix s07_.
// =====================================================================
const s07_r = (t, fr = 5) => EZ.o3(clamp((TT - t) * FPS / fr));     // a gesture ramp over fr frames that stops hard
const s07_Y = { kai: 600, mom: 1300, cop: 120 };                       // train-yard marks (d = 1, feet on GROUND)

// a forearm (elbow → hand) drawn OVER something held: the cradle that makes a hold read. sh = the front shoulder.
function s07_fore(who, sh, hand, h, grip = 'hold', u0 = 0.12, hAng) {
  const J = IV_J, A1 = ivIK(...sh, ...hand, J.ua * h, J.fa * h, 1), A2 = ivIK(...sh, ...hand, J.ua * h, J.fa * h, -1), A = A1.ey >= A2.ey ? A1 : A2;
  const lw = J.lw * h, top = who.top || 'tee', sw = (top === 'hoodie' || top === 'coat' || top === 'suit' ? 1.75 : 1.55) * lw;
  const sc = ctx.getTransform().a, pxR = J.R * h * sc, mode = pxR < 34 ? 'nub' : pxR < 105 ? 'mitten' : 'glove';
  const rw = Math.max(1.6 / sc, h * 0.009), k = IV_M.key, ang = Math.atan2(A.by - A.ey, A.bx - A.ex), s = hand[0] < sh[0] ? -1 : 1;
  for (const rim of [true, false]) {
    const C = (c) => (rim ? IV_M.rim : c), Wd = (w) => w + (rim ? rw * 2 : 0);
    ctx.save(); if (rim) ctx.translate(k[0] * rw * 0.9, k[1] * rw * 0.9);
    const ex = lerp(A.ex, A.bx, u0), ey = lerp(A.ey, A.by, u0);
    if (u0 <= 0) { ivLine(sh[0], sh[1], A.ex, A.ey, Wd(lw), C(IV.ink)); ivLine(sh[0], sh[1], A.ex, A.ey, Wd(sw), C(who.col)); }
    ivLine(ex, ey, A.bx, A.by, Wd(lw), C(IV.ink));
    ivLine(ex, ey, lerp(A.ex, A.bx, 0.86), lerp(A.ey, A.by, 0.86), Wd(sw * 0.92), C(who.col));
    if (!rim) ivLine(lerp(A.ex, A.bx, 0.8), lerp(A.ey, A.by, 0.8), lerp(A.ex, A.bx, 0.86), lerp(A.ey, A.by, 0.86), sw * 0.95, who.col2 || ivShade(who.col, -0.3), 'butt');
    ivHand(A.bx, A.by, hAng ?? ang, h, mode, grip, C, Wd, s);
    ctx.restore();
  }
}
// an actor holding something in both arms (hug pose): shadow, the actor, the cargo at the hands, the front forearm over it.
// o: { who, x, y, h, f, pose, expr, talk, lift 0..1 (0 = bent down to the floor), cargo(hx, hy, M), shadow }
function s07_carry(o) {
  const h = o.h, f = o.f, s = f < 0 ? -1 : 1, af = Math.abs(f), lift = o.lift ?? 1;
  const hug = o.pose || ivPose('hug', { hL: [0.11, 0.14], hR: [0.15, 0.13] });
  const down = ivPose('duck', { hL: [0.16, 0.36], hR: [0.22, 0.36], fL: [-0.06, 0.4], fR: [0.1, 0.42], lean: 0.42, dip: 0.06 });
  const P = lift >= 1 ? hug : ivPoseMix(down, hug, lift);
  if (o.shadow !== false) ivCastShadow(o.x, o.y, h, { len: 1.1, a: 0.32 });
  const M = ivMan({ who: o.who, x: o.x, y: o.y, h, f, pose: P, expr: o.expr, talk: o.talk, hands: o.hands, blinkKey: o.blinkKey, noBlink: o.noBlink });
  const hand = M.handR, sw = IV_J.sw * h * (1 - 0.55 * af);
  o.cargo && o.cargo(hand[0], hand[1], M);
  const sh = [M.sh[0] + sw * s, M.sh[1] - h * 0.004];
  if (o.farFore) s07_fore(o.who, [M.sh[0] - sw * s, M.sh[1] + h * 0.004], M.handL, h, 'hold', o.farFore);   // the far hand under the cargo
  if (o.fore !== false) s07_fore(o.who, sh, hand, h, o.grip || 'hold', o.foreU ?? 0.12, o.hAng);
  return M;
}
// Pickles hugged to Kai's chest: his belly against the hoodie, his head up under Kai's chin (f -1 = facing Kai);
// the far hand cups his rump, the near forearm wraps over his back (drawn over the cat)
let s07_catHead = [700, 500], s07_kaiHead = [600, 450], s07_catBox = [600, 600];
const s07_HUG = { hL: [0.1, 0.17], hR: [0.185, 0.12], lean: 0.02, tilt: 0.12 };
// Kai holding Pickles at the yard (lift 0..1), expr/talk for both
function s07_kaiHold(o = {}) {
  const lift = o.lift ?? 1, f = o.f ?? 0.45, s = f < 0 ? -1 : 1, c = o.cat || {};
  const M = s07_carry({ who: CAST.kai, x: o.x ?? s07_Y.kai, y: GROUND, h: 520, f, lift, noBlink: o.noBlink, expr: o.expr || { eyes: 'happy', mouth: 'smile' }, talk: o.talk,
    pose: o.pose || ivPose('hug', s07_HUG), grip: o.grip, hAng: o.hAng, farFore: lift > 0.6 ? 0.55 : 0, foreU: 0.35,
    cargo: (hx, hy, M) => {   // the cat between the hands, pressed to the chest
      const L = M.handL, cx = L[0] + s * (c.dx ?? 34), cy = L[1] + (c.dy ?? 2);
      s07_catBox = [cx, cy]; if (c.hide) return;
      s07_catHead = ivCat({ x: cx, y: cy, s: c.s ?? 150, f: (c.f ?? -1) * s, coat: CATS.pickles, pose: 'loaf', expr: c.expr || { eyes: 'half' }, talk: c.talk, look: c.look, rot: (c.rot ?? -0.12) * s }).head;
      o.onCat && o.onCat(cx, cy, M);
    } });
  s07_kaiHead = M.head; return M;
}
// draw fn once on a scrap canvas (to learn where the heads land), then aim the camera at one: aim 'cat' | 'kai'
function s07_aim(act, aim, dx, dy, z) {
  const main = ctx; ctx = ivCanvas(41, 8, 8).getContext('2d'); try { act(); } finally { ctx = main; }
  const q = aim === 'cat' ? s07_catHead : s07_kaiHead; IV_CAM = { x: q[0] + dx, y: q[1] + dy, z }; IV_FOCUS = 1;
}
// Mom holding Lily (Lily up on her hip, arms round her neck)
function s07_momHold(o = {}) {
  const lh = 0.62 * 520;
  return s07_carry({ who: CAST.mom, x: o.x ?? s07_Y.mom, y: GROUND, h: 540, f: o.f ?? -0.4, expr: o.expr || { eyes: 'closed', mouth: 'smile' },
    pose: o.pose || ivPose('hug', { hL: [0.16, 0.14], hR: [0.2, 0.15] }),
    cargo: (hx, hy) => ivMan({ who: CAST.lily, x: hx - 28 * Math.sign(-(o.f ?? -0.4)), y: hy + 0.45 * lh - 10, h: lh, f: 0.55 * Math.sign(-(o.f ?? -0.4)), air: true,
      pose: o.lilyPose || ivPose('hug', { hL: [0.2, -0.02], hR: [0.25, -0.04], fL: [0.08, 0.42], fR: [0.14, 0.4], tilt: 0.15 }), expr: o.lily || { eyes: 'happy', mouth: 'smile' } }) });
}
const s07_cop = () => { ivCastShadow(s07_Y.cop, GROUND, 500, { a: 0.3 }); ivMan({ who: CAST.cop, x: s07_Y.cop, y: GROUND, h: 500, f: 0.35, pose: ivPose('phone'), expr: { eyes: 'open', mouth: 'smile' } }); };
// the train yard with our people; o.soft: blur the car-9 layer (close-ups: the set goes soft behind the faces)
function s07_yard(act, o = {}) {
  const L = SET_trainYard({ balloon: true, fg: o.fg ?? false });
  if (o.soft) L[2] = { ...L[2], blur: o.soft };
  L.splice(3, 0, { d: 1, draw: act });
  if (o.back) L.splice(2, 0, o.back);
  if (o.front) L.push({ d: 0.62, draw: o.front });
  IV_M = { ...IV_M, rim: '#d2deff' };
  return L;
}
// the world point on layer d that lands on screen where (wx, wy) on d = 1 lands (for things set behind a head)
function s07_behind(d, wx, wy) {
  const a = ivLayerXf(1), b = ivLayerXf(d), sx = a[0] * wx + a[4], sy = a[3] * wy + a[5];
  return [(sx - b[4]) / b[0], (sy - b[5]) / b[3]];
}
// a soft rail + sleepers right in front of the lens (front layer d 0.55): the camera sits low on the tracks
const s07_railFg = (x0 = -600, x1 = 2600, y = 1010) => ({ d: 0.55, draw: () => {
  for (let x = x0; x < x1; x += 150) ivPoly([[x, y + 30], [x + 90, y + 30], [x + 80, y + 140], [x - 10, y + 140]], '#2a2220');
  ivRR(x0, y - 10, x1 - x0, 34, 6, '#565c74'); ivLine(x0, y - 6, x1, y - 6, 4, 'rgba(210,222,255,0.55)');
  for (let x = x0 + 40; x < x1; x += 300) ivDot(x, y + 8, 7, '#22242e');
} });
// looking out through car 9's open door from inside: dark planks round the opening, the sliding panel, a moonbeam
function s07_doorFrame(k) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(960, 560); ctx.scale(k, k); ctx.translate(-960, -560);
  const x0 = 470, x1 = 1450, y0 = 150, y1 = 940;
  ctx.beginPath(); ctx.rect(-600, -600, 3100, 2300); ctx.rect(x1, y0, x0 - x1, y1 - y0); ctx.fillStyle = '#120c0c'; ctx.fill('evenodd');
  for (let x = -560; x < x0; x += 74) ivLine(x, -600, x, 1700, 3, 'rgba(70,40,32,0.6)', 'butt');
  for (let x = x1 + 30; x < 2500; x += 74) ivLine(x, -600, x, 1700, 3, 'rgba(70,40,32,0.6)', 'butt');
  ivPoly([[-600, y1], [2500, y1], [2500, 1700], [-600, 1700]], '#1c1210');                      // the car floor
  for (let i = 0; i < 6; i++) ivLine(-600, y1 + 20 + i * 34 * (1 + i * 0.3), 2500, y1 + 20 + i * 34 * (1 + i * 0.3), 3, 'rgba(90,56,40,0.5)', 'butt');
  ivRR(x0 - 16, y0 - 16, 16, y1 - y0 + 32, 3, '#3a2218'); ivRR(x1, y0 - 16, 16, y1 - y0 + 32, 3, '#3a2218'); ivRR(x0 - 16, y0 - 16, x1 - x0 + 32, 16, 3, '#3a2218');
  ivLine(x0 - 2, y0, x0 - 2, y1, 3, 'rgba(210,222,255,0.5)');                                     // moon rim on the jamb
  ivRR(x1 + 16, y0 - 30, 560, y1 - y0 + 50, 6, '#2c1a14'); for (let i = 1; i < 6; i++) ivLine(x1 + 16 + i * 93, y0 - 30, x1 + 16 + i * 93, y1 + 20, 3, 'rgba(0,0,0,0.35)', 'butt');   // the slid-open panel
  ctx.globalCompositeOperation = 'lighter';
  ivPoly([[x0 + 120, y0], [x0 + 420, y0], [x0 + 260, 1500], [x0 - 220, 1500]], 'rgba(150,170,230,0.06)');
  ctx.restore();
}
// fur under the hand: short strokes that lie down behind the stroking fingers
function s07_fur(hx, u) {   // fur along Pickles' back: strokes lie down behind the stroking hand, a few tufts between the fingers
  const r = RNG('s07fur').f, [cx, cy] = s07_catBox, y0 = cy - 82;
  for (let i = 0; i < 26; i++) { const x = cx - 50 + r() * 110, y = y0 + 2 + r() * 10, flat = x < hx ? 0.15 : 0.7 + 0.2 * Math.sin(TT * 9 + i);
    ivLine(x, y, x + 13, y - 13 * flat, 3, i % 3 ? '#f2a85a' : '#c96a22'); }
}
const s07_cam = (lt, a, b, dur) => { const u = EZ.io(clamp(lt / dur)); IV_CAM = { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u) }; };

// ---- 137 "Mom holds Lily." — wide: Mom lifts Lily in front of car 9, Kai and Pickles watch; a slow track in --------
{ const t = CUT('137-narrator'), tE = CUT('138-narrator');
  SHOT(t, 's07_momHolds', (lt) => {
    s07_cam(lt, [700, 140, 1.3], [1000, 560, 1.12], tE - t);
    ivStage(s07_yard(() => {
      s07_cop();
      ivCastShadow(s07_Y.kai, GROUND, 520); ivMan({ who: CAST.kai, x: s07_Y.kai, y: GROUND, h: 520, f: 0.5, pose: ivPose('relaxed'), expr: { eyes: 'sad', mouth: 'smile', look: [1, 0] } });
      ivCastShadow(780, GROUND, 140, { w: 0.4, len: 0.8, a: 0.3 }); ivCat({ x: 780, y: GROUND, s: 150, f: 1, coat: CATS.pickles, pose: 'sit', expr: { eyes: 'half' } });
      s07_momHold();
    }, { fg: true }));
  }, { sec: 's07', title: 'Mom holds Lily: crane down from the floodlight to the family in its pool' });
  SFX(t, 'swish', 0.5); SFX(VW('137-narrator', 'holds') - 0.05, 'cloth', 0.6, 0.4);
}
// ---- "…Lily." — close on the hug: Lily's face on Mom's shoulder, both eyes shut ---------------------------------
{ const t = CUT('137-narrator', 'Lily');
  SHOT(t, 's07_hugClose', (lt) => {
    IV_CAM = { x: 1235, y: 470, z: 2.5 + lt * 0.04 }; IV_FOCUS = 1;
    ivStage(s07_yard(() => s07_momHold({ lily: { eyes: 'closed', mouth: 'smile' } }), { soft: 9 }));
  }, { sec: 's07', title: 'Hug close: Lily on Mom\'s shoulder, eyes shut' });
  SFX(t + 0.15, 'cloth', 0.45, 0.3);
}
// ---- 138 "You hold Pickles." — Kai scoops him up: bent down to the cat, then up into his arms (6 frames) ------------
{ const t = CUT('138-narrator', 'hold'), tl = VW('138-narrator', 'Pickles');
  SHOT(t, 's07_scoop', (lt) => {
    IV_CAM = { x: 760, y: 700, z: 1.6 + 0.04 * lt }; IV_FOCUS = 1;
    const u = s07_r(tl - 0.12, 7);
    ivStage(s07_yard(() => {
      s07_momHold({ x: 1240 });
      s07_kaiHold({ lift: u, expr: { eyes: u < 0.5 ? 'open' : 'happy', mouth: 'smile', look: [0.6, 1] }, cat: { dy: lerp(0, 6, u), rot: lerp(0, -0.12, u), expr: { eyes: u < 0.5 ? 'open' : 'half' } } });
    }, { soft: 5, front: s07_railFg(-600, 2600, 985).draw }));
  }, { sec: 's07', title: 'You hold Pickles: low from the rails, Kai scoops him up into his arms' });
  SFX(t, 'swish', 0.4, -0.3); SFX(tl - 0.1, 'cloth', 0.7, -0.3);
}
// ---- 139 "And this time, he doesn't tell you to put him down." — low angle: the moon right behind Kai and Pickles ----
{ const t = CUT('139-narrator'), tp = CUT('139-narrator', 'put');
  SHOT(t, 's07_inArms', (lt) => {
    s07_cam(lt, [700, 640, 2.0], [690, 610, 2.15], tp - t);
    const m = s07_behind(4, 640, 470);
    ivStage(s07_yard(() => {
      s07_kaiHold({ expr: { eyes: 'happy', mouth: 'smile' }, cat: { rot: -0.12 + Math.sin(lt * 2.2) * 0.04, expr: { eyes: 'half', blink: 0.25 } } });
    }, { soft: 4, back: { d: 4, draw: () => ext_moon(m[0], m[1], 120) }, front: s07_railFg(-400, 2000, 845).draw }));
  }, { sec: 's07', title: 'This time: low angle, the moon behind Kai hugging Pickles' });
  SFX(t + 0.3, 'cloth', 0.4, -0.2);
}
// ---- "…put him down." — close-up: Kai's hand strokes Pickles' back, fingers in the fur; "PUT ME DOWN." crossed out --
{ const t = CUT('139-narrator', 'put'), td = VW('139-narrator', 'down');
  SHOT(t, 's07_noPutDown', (lt) => {
    const st = mod(lt * 0.9, 1), u = EZ.io(clamp(st / 0.75)), lift = st > 0.75 ? Math.sin(Math.PI * (st - 0.75) / 0.25) : 0;
    IV_CAM = { x: 960, y: 540, z: 1 + 0.03 * lt }; IV_FOCUS = 1;
    ivStage(s07_yard(() => {
      // Kai's chest at the left edge, Pickles pressed against it, big
      ivRR(-200, -100, 520, 1400, 60, IV_M.rim); ivRR(-220, -100, 528, 1400, 60, CAST.kai.col);
      ivLine(250, -100, 250, 1300, 30, 'rgba(0,0,0,0.18)'); ivLine(190, 60, 182, 420, 9, '#e8eef8'); ivLine(240, 60, 250, 400, 9, '#e8eef8');
      ivCat({ x: 1100, y: 1190, s: 1100, f: -1, coat: CATS.pickles, pose: 'loaf', expr: { eyes: 'half', blink: 0.45 + 0.4 * u }, rot: 0 });
      // the hand strokes the back, head to tail; the fur lies down behind it, springs up ahead
      const hx = lerp(1060, 1460, u), hy = 792 - lift * 50 + Math.sin(u * Math.PI) * 6, h = 2600, lw = IV_J.lw * h, sw = lw * 1.5;
      const r = RNG('s07fur2').f;
      for (let k = 0; k < 60; k++) { const x = 960 + r() * 580, y = 800 + r() * 14, flat = x < hx - 40 ? 0.15 : 0.9; ivLine(x, y, x + 34, y - 34 * flat, 7, k % 3 ? '#f2a85a' : '#c96a22'); }
      for (const rim of [true, false]) { const C = (c) => (rim ? IV_M.rim : c), Wd = (w) => w + (rim ? 10 : 0);
        ivLine(hx - 520, -200, hx - 70, hy - 30, Wd(sw), C(CAST.kai.col)); ivLine(hx - 110, hy - 110, hx - 70, hy - 30, Wd(sw * 0.95), C(CAST.kai.col2 || ivShade(CAST.kai.col, -0.3)), 'butt');
        ivHand(hx - 40, hy - 14, 0.12, h, 'glove', 'flat', C, Wd, 1); }
      for (let k = 0; k < 7; k++) { const x = hx - 30 + k * 16, y = hy + 22 + (k % 2) * 6; ivLine(x, y, x + 16, y - 26, 6, '#f2a85a'); }   // tufts between the fingers
    }, { soft: 16 }));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ivTag('"PUT ME DOWN."', 1500, 170, 50, ivPop(t + 0.05) * 0.95);
    const x = s07_r(td, 6); if (x > 0) ivLine(1270, 162, lerp(1270, 1730, x), 140, 10, '#e5453a');
    ctx.restore();
  }, { sec: 's07', title: 'Close: Kai\'s hand strokes Pickles\' back; "PUT ME DOWN." crossed out' });
  SFX(td, 'paper', 0.6, 0.4);
}
// ---- 140 "Why did you follow her?" — over Pickles' shoulder: his soft ears and head in the foreground, Kai's face ----
function s07_catBackHead(x, y, r) {   // Pickles' head from behind (screen space): ears up, stripes, a moon rim
  const c = CATS.pickles, col = c.col || '#e08a3c', col2 = c.col2 || ivShade(col, -0.3);
  for (const sx of [-1, 1]) { ivPoly([[x + sx * r * 0.25, y - r * 0.6], [x + sx * r * 0.95, y - r * 0.5], [x + sx * r * 0.8, y - r * 1.45]], '#d2deff'); ivPoly([[x + sx * r * 0.3, y - r * 0.58], [x + sx * r * 0.88, y - r * 0.5], [x + sx * r * 0.76, y - r * 1.32]], col); }
  ctx.beginPath(); ctx.ellipse(x, y + r * 0.1, r * 1.12, r, 0, 0, TAU); ctx.fillStyle = '#d2deff'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(x, y + r * 0.14, r * 1.08, r * 0.97, 0, 0, TAU); ctx.fillStyle = col; ctx.fill();
  for (const dx of [-0.35, 0, 0.35]) ivLine(x + dx * r, y - r * 0.75, x + dx * r * 1.3, y - r * 0.2, r * 0.1, col2);
  ctx.beginPath(); ctx.ellipse(x, y + r * 1.4, r * 1.7, r * 0.75, 0, 0, TAU); ctx.fillStyle = col; ctx.fill();   // the shoulders
}
{ const t = CUT('140-you');
  SHOT(t, 's07_kaiAsks', (lt) => {
    const act = () => s07_kaiHold({ f: 0.35, talk: '140-you', expr: { eyes: 'sad', mouth: 'flat', look: [0.7, 0.9] }, cat: { hide: true } });
    s07_aim(act, 'kai', 130, 120, 3.0); ivStage(s07_yard(act, { soft: 11 }));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'blur(16px)'; s07_catBackHead(1180 - lt * 6, 900, 300); ctx.filter = 'none'; ctx.restore();
  }, { sec: 's07', title: 'Over Pickles\' shoulder: Kai, "Why did you follow her?"' });
  SFX(t + 0.1, 'cloth', 0.3, -0.3);
}
// ---- 141 "I told you. I watch the small ones." — Pickles up close, talking up at Kai -------------------------------
{ const t = CUT('141-pickles');
  SHOT(t, 's07_pickWatch', (lt) => {
    const act = () => s07_kaiHold({ expr: { eyes: 'open', mouth: 'smile', look: [0.6, 1] }, cat: { talk: '141-pickles', expr: { eyes: 'half' }, look: [-0.8, -0.6] } });
    s07_aim(act, 'cat', 10, 10, 5.6); ivStage(s07_yard(act, { soft: 15 }));
  }, { sec: 's07', title: 'Pickles: "I told you. I watch the small ones."' });
  SFX(t + 0.4, 'cloth', 0.2, -0.1);
}
// ---- "…the small ones." — Lily in Mom's arms waves at Pickles ------------------------------------------------------
{ const t = CUT('141-pickles', 'small');
  SHOT(t, 's07_smallOne', (lt) => {
    IV_CAM = { x: 1230, y: 480, z: 2.6 }; IV_FOCUS = 1;
    const w = Math.sin(lt * 14) * 0.05;
    ivStage(s07_yard(() => s07_momHold({ x: 1300, f: -0.25, expr: { eyes: 'happy', mouth: 'smile' }, lily: { eyes: 'happy', mouth: 'grin' },
      lilyPose: ivPose('wave', { hR: [-0.14 + w, -0.26], hL: [0.18, 0.02], fL: [0.08, 0.42], fR: [0.14, 0.4] }) }), { soft: 9 }));
  }, { sec: 's07', title: 'The small one: Lily waves at Pickles from Mom\'s arms' });
  SFX(t + 0.5, 'laugh', 0.25, 0.3);
}

// ---- 142 "Then he looks at you." — the two faces, Pickles turns his eyes up to Kai; a slow push ------------------
{ const t = CUT('142-narrator'), tE = CUT('143-narrator');
  SHOT(t, 's07_looksAtYou', (lt) => {
    const u = s07_r(VW('142-narrator', 'looks'), 6), p = EZ.io(clamp(lt / (tE - t)));
    const act = () => s07_kaiHold({ x: 380, f: 0.85, expr: { eyes: 'open', mouth: 'flat', look: [0.8, 0.6] }, noBlink: true,
      cat: { expr: { eyes: 'open' }, look: [lerp(0.4, -0.9, u), lerp(0.2, -0.7, u)], rot: lerp(-0.12, -0.2, u) } });
    s07_aim(act, 'cat', lerp(-170, -140, p), -110, lerp(3.0, 3.25, p)); ivStage(s07_yard(act, { soft: 7 }));
  }, { sec: 's07', title: 'Then he looks at you: profile two-shot, the broken cars receding behind; Pickles\' eyes turn up' });
  SFX(VW('142-narrator', 'looks'), 'cloth', 0.3, -0.1);
}
// ---- 143/144 "And blinks. Slowly." — EXTREME close-up of Pickles' face: the lids come down over ~0.6 s, stay, and rise
//      slowly on "Slowly." (the key moment; the push keeps creeping in, the background goes to soft moonlight bokeh)
const s07_blinkU = () => {
  const a = VW('143-narrator', 'blinks') - 0.05, b = VW('144-narrator', 'Slowly') + 0.3;
  return TT < b ? EZ.io(clamp((TT - a) / 0.6)) : 1 - EZ.io(clamp((TT - b) / 0.8));
};
{ const t = CUT('143-narrator'), tE = LE('144-narrator') + 0.5;
  SHOT(t, 's07_slowBlink', (lt) => {
    const bl = s07_blinkU();
    const act = () => s07_kaiHold({ f: 0.35, expr: { eyes: 'open', mouth: 'flat' }, noBlink: true, cat: { expr: { eyes: 'open', blink: bl * 0.98 + (bl > 0.97 ? 0.02 : 0) }, look: [-0.7, -0.5], rot: -0.2 } });
    s07_aim(act, 'cat', 26, 14, 9.5 + 1.2 * EZ.io(clamp(lt / (tE - t)))); ivStage(s07_yard(act, { soft: 18 }));
    // moonlight on the fur: a soft warm-cool glow that breathes with the lids
    ivGlow(1300, 200, 700, 'rgba(190,210,255,0.10)', 0.6 + 0.4 * bl);
  }, { sec: 's07', title: 'THE SLOW BLINK: extreme close-up, lids down over ~0.6 s, hold, up on "Slowly"', boardAt: 1.4 });
  SFX(VW('143-narrator', 'blinks') + 0.4, 'heart', 0.55);
}
// ---- [BEAT 2 s] — wordless: from inside car 9, through its open door: the family in the floodlight, a slow dolly back --
{ const t = LE('144-narrator') + 0.5, tE = CUT('145-narrator');
  SHOT(t, 's07_beatYard', (lt) => {
    const u = EZ.io(clamp(lt / (tE - t)));
    s07_cam(lt, [-230, 600, 1.75], [-230, 590, 1.5], tE - t);
    ivStage(s07_yard(() => {
      s07_kaiHold({ x: -420, f: 0.3, expr: { eyes: 'happy', mouth: 'smile' }, cat: { expr: { eyes: 'closed' }, rot: -0.16 } });
      s07_momHold({ x: -40, f: -0.4, expr: { eyes: 'happy', mouth: 'smile' }, lily: { eyes: 'happy', mouth: 'smile' } });
    }));
    s07_doorFrame(lerp(1.12, 1.0, u));
  }, { sec: 's07', title: '[BEAT] wordless: from inside car 9, through the open door: the family under the floodlight' });
  SFX(t, 'whoosh', 0.35); SFX(t + 0.9, 'cloth', 0.3, -0.3);
}

// ---- 145 "Scientists at the University of Sussex found that…" — the fact card on the dark stage -------------------
function s07_card(a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); const sc = 0.9 + 0.1 * EZ.back(clamp(a)); ctx.translate(960, 500); ctx.scale(sc, sc);
  ivRR(-560, -230, 1120, 460, 34, 'rgba(18,14,24,0.88)', 'rgba(255,214,160,0.6)', 3);
  ivRR(-548, -218, 1096, 436, 28, null, 'rgba(255,214,160,0.18)', 1.5);
  // the crest: a shield with a cat's eye in it
  ctx.save(); ctx.translate(-370, -10);
  ivPoly([[-120, -130], [120, -130], [120, 10], [0, 140], [-120, 10]], '#2a2140', '#ffd6a0', 4);
  ctx.beginPath(); ctx.ellipse(0, -10, 74, 46, 0, 0, TAU); ctx.fillStyle = '#c9e05a'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -10, 14, 42, 0, 0, TAU); ctx.fillStyle = '#0d0907'; ctx.fill(); ivDot(20, -32, 8, '#fff6e0');
  const lid = 0.5 + 0.5 * Math.sin(TT * 1.6); ctx.save(); ctx.beginPath(); ctx.ellipse(0, -10, 75, 47, 0, 0, TAU); ctx.clip(); ivRR(-80, -60, 160, 94 * lid * 0.9, 0, '#2a2140'); ctx.restore();
  ctx.restore();
  ivText('UNIVERSITY OF SUSSEX', -190, -105, 30, 'rgba(255,230,200,0.85)', { align: 'left', track: 6 });
  ivLine(-190, -80, 480, -80, 1.5, 'rgba(255,214,160,0.4)');
  ivText('A SLOW BLINK', -190, 10, 84, '#ffe2b0', { align: 'left', glow: 'rgba(255,160,80,0.5)', track: 2 });
  ivText('IS HOW CATS SMILE', -190, 100, 56, '#fbeedd', { align: 'left', track: 2 });
  ivText('STUDY, 2020', -190, 170, 24, 'rgba(255,230,200,0.6)', { align: 'left', track: 5, font: IV.sans });
  ctx.restore();
}
{ const t = CUT('145-narrator'), tE = CUT('145-narrator', 'slow');
  SHOT(t, 's07_sussex', (lt) => {
    IV_CAM = { x: 960, y: 520, z: 1 + 0.05 * EZ.io(clamp(lt / (tE - t))) };
    ivStage(SET_void({ glow: [255, 200, 150], act: () => s07_card(clamp(lt * FPS / 6)) }));
  }, { sec: 's07', title: 'Fact card: UNIVERSITY OF SUSSEX — a slow blink is how cats smile' });
  SFX(t, 'whoosh', 0.5); SFX(t + 0.15, 'paper', 0.45);
}
// ---- "…a slow blink is how cats smile." — Pickles' face on the dark stage, blinking slowly; "= A CAT SMILE" lands ----
{ const t = CUT('145-narrator', 'slow'), ts = VW('145-narrator', 'smile');
  SHOT(t, 's07_blinkDiagram', (lt) => {
    IV_CAM = { x: 960, y: 540, z: 1 + 0.04 * lt };
    const ph = mod(lt, 2.4), bl = ph < 0.6 ? EZ.io(ph / 0.6) : ph < 1.1 ? 1 : ph < 1.8 ? 1 - EZ.io((ph - 1.1) / 0.7) : 0;
    ivStage(SET_void({ glow: [255, 190, 140], act: () => {
      ivCat({ x: 820, y: 1500, s: 1150, f: 1, coat: CATS.pickles, pose: 'sit', expr: { eyes: 'open', blink: Math.min(0.99, bl), mouth: 'closed' }, look: [0.2, 0] });
    } }));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ivText('SLOW BLINK', 1460, 300, 64, '#ffe2b0', { glow: 'rgba(255,160,80,0.5)', track: 4 });
    const a = ivPop(ts - 0.05); ivTag('= A CAT SMILE', 1460, 420, 50, a);
    ctx.restore();
  }, { sec: 's07', title: 'Slow blink = a cat smile: Pickles\' face blinking on the dark stage', boardAt: 2.0 });
  SFX(t + 0.3, 'cloth', 0.25); SFX(ts - 0.05, 'shimmer', 0.35);
}
// ---- 146 "Blink slowly back," — a person and a cat face to face; the person's eyes close, slowly -----------------
function s07_faceToFace(lt, catHappy) {
  const kb = VW('146-narrator', 'Blink'), ke = VWE('146-narrator', 'back');
  const shut = TT > kb + 0.1 && TT < ke + 0.15;
  ivMan({ who: CAST.kai, x: 560, y: 2100, h: 1800, f: 0.75, pose: ivPose('relaxed'), expr: { eyes: shut ? 'closed' : 'open', mouth: 'smile' }, noBlink: true });
  ivCat({ x: 1500, y: 1180, s: 620, f: -1, coat: CATS.alley[2], pose: 'sit', expr: { eyes: catHappy ? 'happy' : 'half' } });
  // dotted arcs between the faces: the look goes over and comes back
  ctx.save(); ctx.setLineDash([4, 22]); ctx.lineCap = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(255,220,170,0.6)';
  ctx.lineDashOffset = -TT * 60; ctx.beginPath(); ctx.moveTo(820, 420); ctx.quadraticCurveTo(1030, 300, 1240, 440); ctx.stroke();
  ctx.lineDashOffset = TT * 60; ctx.beginPath(); ctx.moveTo(1240, 520); ctx.quadraticCurveTo(1030, 640, 820, 520); ctx.stroke(); ctx.restore();
}
{ const t = CUT('146-narrator');
  SHOT(t, 's07_blinkBack', (lt) => {
    IV_CAM = { x: 1000, y: 540, z: 1.0 + 0.03 * lt };
    ivStage(SET_void({ glow: [255, 200, 150], act: () => s07_faceToFace(lt, false) }));
  }, { sec: 's07', title: 'Blink slowly back: a person and a cat face to face, eyes closing' });
  SFX(VW('146-narrator', 'Blink') + 0.15, 'cloth', 0.25, -0.4);
}
// ---- "…and they understand." — push onto the cat: happy eyes, a purr ---------------------------------------------
{ const t = CUT('146-narrator', 'and');
  SHOT(t, 's07_understand', (lt) => {
    IV_CAM = { x: 1480, y: 760, z: 1.7 + 0.05 * lt };
    ivStage(SET_void({ glow: [255, 200, 150], act: () => {
      P_soundRings(1520, 1060, 300, 1, { n: 3, loop: 0.6, col: '#ffd9a0', w: 5, a: 0.4, squash: 0.35 });
      s07_faceToFace(lt, lt > 0.25);
    } }));
  }, { sec: 's07', title: '...and they understand: the cat goes happy-eyed, purring' });
  SFX(t + 0.9, 'cloth', 0.25, 0.4);
}
// ---- 147 "You blink back." — Kai's face, extreme close: the eyes shut on "blink", open happy after "back" -----------
{ const t = CUT('147-narrator'), a = VW('147-narrator', 'blink'), b = VWE('147-narrator', 'back') + 0.25;
  SHOT(t, 's07_youBlink', (lt) => {
    const e = TT < a ? 'open' : TT < b ? 'closed' : 'happy';
    const act = () => s07_kaiHold({ f: 0.3, noBlink: true, expr: { eyes: e, mouth: 'smile', look: [0.6, 0.6] }, cat: { expr: { eyes: 'half' } } });
    s07_aim(act, 'kai', 10, 20, 4.6 + 0.3 * EZ.io(clamp(lt / 2))); ivStage(s07_yard(act, { soft: 16 }));
  }, { sec: 's07', title: 'You blink back: Kai\'s eyes close slowly, open happy' });
  SFX(a + 0.1, 'cloth', 0.2); SFX(b, 'heart', 0.35);
}
// ---- 148 "Fine. I like you." — Pickles, grumpy-soft, eyes half --------------------------------------------------
{ const t = CUT('148-pickles');
  SHOT(t, 's07_fine', (lt) => {
    const act = () => s07_kaiHold({ x: -300, f: -0.5, expr: { eyes: 'happy', mouth: 'smile' }, cat: { talk: '148-pickles', expr: { eyes: 'half' }, look: [-0.6, -0.4] } });
    s07_aim(act, 'cat', -110, -70, 2.8); ivStage(s07_yard(act, { soft: 10 }));
  }, { sec: 's07', title: 'Reverse angle toward the floodlight: Pickles, "Fine. I like you."' });
  SFX(t + 0.3, 'cloth', 0.2, -0.1);
}
// ---- "Don't make it weird." — he turns his head away, eyes shut, smug; Kai laughs -----------------------------------
{ const t = CUT('148-pickles', "Don't");
  SHOT(t, 's07_weird', (lt) => {
    const dc = (SET_POS2.trainYard.car9.door[0] + SET_POS2.trainYard.car9.door[2]) / 2;
    IV_CAM = { x: dc + 40, y: 560, z: 2.1 }; IV_FOCUS = 1;
    const u = s07_r(t + 0.1, 5);
    ivStage(s07_yard(() => s07_kaiHold({ x: dc - 30, f: 0.4, expr: { eyes: 'happy', mouth: lt > 0.5 ? 'grin' : 'smile' }, cat: { talk: '148-pickles', f: u > 0.5 ? 1 : -1, dx: u > 0.5 ? 0 : -4, rot: u > 0.5 ? 0.05 : -0.12, expr: { eyes: u > 0.5 ? 'closed' : 'half' } } }), { soft: 8 }));
  }, { sec: 's07', title: '"Don\'t make it weird.": in car 9\'s doorway, Pickles turns away, smug; Kai laughs' });
  SFX(t + 0.7, 'laugh', 0.35, -0.3);
}
// ---- [BEAT 1 s] — wordless: they walk home out of the yard, the camera rises toward the moon -----------------------
{ const t = LE('148-pickles') + 0.45, tE = CUT('149-narrator');
  SHOT(t, 's07_walkHome', (lt) => {
    s07_cam(lt, [820, 560, 1.15], [1180, 440, 1.02], tE - t);
    const K = ivWalk(t, 400, 520, 1, 9), M = ivWalk(t + 0.1, 700, 540, 1, 9);
    const arms = (P, hug) => ({ ...P, hL: hug.hL, hR: hug.hR });
    ivStage(s07_yard(() => {
      ivCastShadow(s07_Y.cop, GROUND, 500, { a: 0.3 }); ivMan({ who: CAST.cop, x: s07_Y.cop, y: GROUND, h: 500, f: 0.4, pose: ivPose('wave'), expr: { eyes: 'happy', mouth: 'smile' } });
      s07_momHold({ x: M.x, f: 0.45, expr: { eyes: 'happy', mouth: 'smile' }, pose: arms(M.pose, { hL: [0.16, 0.14], hR: [0.2, 0.15] }) });
      s07_kaiHold({ x: K.x, f: 0.45, pose: arms(K.pose, s07_HUG), expr: { eyes: 'happy', mouth: 'smile' }, cat: { expr: { eyes: 'closed' } } });
    }, { fg: true }));
  }, { sec: 's07', title: '[BEAT] wordless: they walk home, the cop waves, the camera rises' });
  for (let k = 0; k < 2; k++) SFX(t + 0.2 + k * 0.6, 'step', 0.35, -0.2);
}

// =====================================================================
//  the next morning — the promise
// =====================================================================
// a big paper bag of cat food (bottom-centre at x, y; ang tilts it about its base)
function s07_bag(x, y, s = 1, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  prop_shadow(0, 0, 120, 0.25);
  ivPoly([[-60, 0], [60, 0], [56, -150], [-56, -150]], '#d9c49a', IV_M.rim, 3);
  ivPoly([[-56, -150], [56, -150], [50, -172], [-50, -172]], '#c4ad80');
  ivRR(-44, -118, 88, 70, 10, '#3c6fd1'); ivText('CAT', 0, -88, 22, '#fff6e0', { track: 2 }); ivText('FOOD', 0, -62, 20, '#ffe2b0', { track: 2 });
  ctx.beginPath(); ctx.ellipse(0, -30, 18, 8, 0, 0, TAU); ctx.fillStyle = '#e0873a'; ctx.fill(); ivPoly([[16, -30], [28, -38], [28, -22]], '#e0873a');
  const g = ctx.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, 'rgba(0,0,0,0.18)'); g.addColorStop(0.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(255,255,255,0.12)');
  ivPoly([[-60, 0], [60, 0], [56, -150], [-56, -150]], g);
  ctx.restore();
}
const s07_eatCat = (x, y, s, coat, f, k) => { ivCastShadow(x, y, s * 0.9, { w: 0.4, len: 0.7, a: 0.25 }); ivCat({ x, y, s, f, coat, pose: 'stand', rot: f * (0.14 + 0.05 * Math.sin(TT * 5 + k)), expr: { eyes: 'happy' } }); };
const s07_walkCat = (x, y, s, coat, f, k) => { ivCastShadow(x, y, s * 0.9, { w: 0.4, len: 0.7, a: 0.25 }); ivCat({ x, y, s, f, coat, pose: 'walk', phase: k }); };
const s07_std = (who, x, f, o = {}) => { const h = o.h ?? 520; ivCastShadow(x, o.y ?? GROUND, h); return ivMan({ who, x, y: o.y ?? GROUND, h, f, pose: o.pose || ivPose('relaxed'), expr: o.expr || { eyes: 'happy', mouth: 'smile' }, hold: o.hold, grip: o.grip, blinkKey: o.bk }); };

// ---- 149 "The next morning, you keep your promise." — dawn crane down over the market corner; Kai walks in with a bag --
{ const t = CUT('149-narrator'), tE = CUT('149-narrator', 'promise');
  SHOT(t, 's07_dawn', (lt) => {
    s07_cam(lt, [1050, 230, 1.32], [900, 560, 1.04], tE - t);
    const K = ivWalk(t + 0.2, 60, 520, 1, 9);
    ivStage(SET_shelter({ cats: 5, shutter: 0.25 + 0.75 * EZ.io(clamp(lt / 3)), act: () => {
      s07_walkCat(K.x + 150, GROUND + 10, 140, CATS.pickles, 1, lt * 6);
      ivCastShadow(K.x, GROUND, 520);
      ivMan({ who: CAST.kai, x: K.x, y: GROUND, h: 520, f: 0.5, pose: { ...K.pose, hR: [0.06, 0.26] }, expr: { eyes: 'happy', mouth: 'smile' }, grip: { front: 'hold' },
        hold: { front: (x, y) => s07_bag(x + 8, y + 70, 0.8, 0.05) } });
    } }));
  }, { sec: 's07', title: 'Next morning: dawn crane down over the market corner, Kai walks in with a bag of food' });
  SFX(t, 'whoosh', 0.45); SFX(t + 0.2, 'rise', 0.25, 0, 1.6);
  for (let k = 0; k < 2; k++) SFX(t + 0.6 + k * 0.75, 'step', 0.3, -0.4 + k * 0.3);
}
// ---- "…promise." — close: the bag tips, kibble pours into a bowl, Pickles leans in ---------------------------------
{ const t = CUT('149-narrator', 'promise');
  SHOT(t, 's07_pour', (lt) => {
    IV_CAM = { x: 760, y: 760, z: 2.9 }; IV_FOCUS = 1;
    const tip = s07_r(t + 0.05, 6), full = EZ.o3(clamp((lt - 0.2) / 0.9)), lean = s07_r(t + 0.75, 6);
    ivStage(SET_shelter({ cats: 0, shutter: 1, act: () => {
      P_bowl(740, 905, 1.25, { full, col: '#e0873a', name: 'PICKLES' });
      // the stream of kibble from the bag's mouth into the bowl
      if (tip > 0.6 && lt < 1.3) { const r = RNG('s07k').f; for (let i = 0; i < 26; i++) { const u = mod(lt * 2.2 + r(), 1); ivDot(lerp(790, 742 + (r() - 0.5) * 40, u), lerp(700, 860, u * u), 5 + r() * 2, ['#b8733c', '#8a4c24', '#c98a4e'][i % 3]); } }
      s07_bag(850, 700 + 40 * tip, 0.95, lerp(0.2, -2.1, tip));
      s07_fore(CAST.kai, [1010, 530], [880, 690 + 30 * tip], 700, 'hold', 0);
      ivCat({ x: lerp(1120, 960, lean), y: 905, s: 160, f: -1, coat: CATS.pickles, pose: 'stand', rot: -0.18 * lean, expr: { eyes: lean > 0.5 ? 'happy' : 'half' } });
    } }));
  }, { sec: 's07', title: 'Promise kept: kibble pours into Pickles\' bowl, he leans in' });
  SFX(t + 0.05, 'paper', 0.6, 0.2); SFX(t + 0.75, 'cloth', 0.3, 0.4);
}
// ---- 150 "Bowls on every corner." — a street corner: a row of bowls, cats eating; a gentle track --------------------
const s07_tCorner = Math.max(CUT('150-narrator', 'corner'), CUT('150-narrator', 'Bowls') + 0.75);
{ const t = CUT('150-narrator', 'Bowls'), tE = s07_tCorner;
  SHOT(t, 's07_corner1', (lt) => {
    s07_cam(lt, [1000, 760, 1.7], [1120, 740, 1.8], tE - t);
    ivStage(SET_street({ t: 'day', cats: true, act: () => {
      [[860, 0], [1080, 1], [1300, 2]].forEach(([x, k]) => { P_bowl(x, GROUND + 20, 0.9, { full: 1, col: ['#5aa9e6', '#e05a7a', '#7cc46a'][k] });
        s07_eatCat(x + 95, GROUND + 20, 140, CATS.alley[k + 1], -1, k); });
      s07_walkCat(1560 - lt * 120, GROUND + 30, 130, CATS.alley[5], -1, lt * 6);
    } }));
  }, { sec: 's07', title: 'Bowls on every corner: a street corner, a row of bowls, cats eating' });
  SFX(t, 'swish', 0.4); SFX(t + 0.7, 'step', 0.3, 0.5);
}
// ---- "…every corner." — the bus stop corner: Duchess eats from a bowl on the wall, posh ----------------------------
{ const t = s07_tCorner;
  SHOT(t, 's07_corner2', (lt) => {
    const D = SET_POS2.busStop.duchess; IV_CAM = { x: D[0] - 60, y: D[1] - 80, z: 1.9 + 0.05 * lt }; IV_FOCUS = 1;
    ivStage(SET_busStop({ act: () => {
      P_bowl(D[0] - 80, D[1] + 2, 0.8, { full: 1, col: '#c9a0e8', name: 'DUCHESS' });
      ivCat({ x: D[0] + 20, y: D[1], s: 165, f: -1, coat: CATS.duchess, pose: 'stand', rot: -0.15, expr: { eyes: 'closed' } });
    } }));
  }, { sec: 's07', title: '...every corner: Duchess dines from a bowl on the bus-stop wall' });
  SFX(t + 0.1, 'swish', 0.3); SFX(t + 0.5, 'glass', 0.25, 0.3);
}
// ---- 151 "The city listens…" — neighbours set bowls down on their doorsteps, cats come trotting --------------------
{ const t = CUT('151-narrator'), tB = CUT('151-narrator', 'boy');
  SHOT(t, 's07_neighbours', (lt) => {
    s07_cam(lt, [960, 540, 1.0], [1000, 560, 1.1], tB - t);
    const d = s07_r(t + 0.4, 7), d2 = s07_r(t + 0.9, 7);
    ivStage(SET_street({ t: 'day', act: () => {
      const bow = (x, y, a) => P_bowl(x, y + 8, 0.6, { full: 1, col: '#5aa9e6' });
      [[CAST.extraA, 520, 0.45, d], [CAST.gomez, 1080, -0.4, d2], [CAST.extraC, 1450, -0.35, 0.3]].forEach(([w, x, f, u], k) => {
        const P = ivPoseMix(ivPose('handOut', { hR: [0.22, 0.1] }), ivPose('duck', { hR: [0.24, 0.36], hL: [-0.04, 0.3] }), u);
        ivCastShadow(x, GROUND, 520, { a: 0.3 });
        const M = ivMan({ who: w, x, y: GROUND, h: 520, f, pose: P, expr: { eyes: 'happy', mouth: 'smile' }, grip: { front: 'hold' }, blinkKey: 'nb' + k });
        if (u < 0.98) bow(M.handR[0], M.handR[1] + 20); else P_bowl(M.handR[0], GROUND + 6, 0.8, { full: 1, col: ['#e05a7a', '#7cc46a', '#5aa9e6'][k] });
      });
      s07_walkCat(260 + lt * 160, GROUND + 25, 130, CATS.alley[3], 1, lt * 6);
      s07_walkCat(1780 - lt * 150, GROUND + 25, 130, CATS.alley[6], -1, lt * 6 + 1);
    } }));
  }, { sec: 's07', title: 'The city listens: neighbours set bowls down, cats trot in' });
  SFX(t, 'swish', 0.35); SFX(t + 0.55, 'thud', 0.25, -0.5); SFX(t + 1.05, 'thud', 0.25, 0.2);
}
// ---- "…to the boy who speaks cat." — Kai at the corner talking with a ring of cats; kids film him ------------------
{ const t = CUT('151-narrator', 'boy');
  SHOT(t, 's07_boyCat', (lt) => {
    IV_CAM = { x: 960, y: 690, z: 1.45 + 0.04 * lt }; IV_FOCUS = 1;
    const talk = 0.3 + 0.7 * Math.abs(Math.sin(lt * 9));
    ivStage(SET_street({ t: 'day', act: () => {
      [[CAST.kidA, 1330, -0.4], [CAST.kidC, 1520, -0.45]].forEach(([w, x, f], k) => s07_std(w, x, f, { h: 400, pose: ivPose('phoneUp'), expr: { eyes: 'wide', mouth: 'o' }, bk: 'kd' + k,
        hold: { front: (hx, hy) => P_phone(hx, hy - 30, 0.32, { ang: f > 0 ? 0.1 : -0.1, back: true }) } }));
      s07_std(CAST.kai, 800, 0.3, { pose: ivPose('handOut', { hR: [0.2, 0.16], lean: 0.06, tilt: 0.15 }), expr: { eyes: 'happy', mouth: lt % 1 < 0.6 ? 'open' : 'smile', look: [0.4, 0.8] } });
      [[560, 1, 0, 'sit'], [1000, -1, 1, 'sit'], [1130, -1, 2, 'loaf'], [430, 1, 4, 'loaf']].forEach(([x, f, k, pose]) => {
        ivCastShadow(x, GROUND + 30, 130, { w: 0.4, len: 0.7, a: 0.25 });
        ivCat({ x, y: GROUND + 30, s: k === 4 ? 90 : 135, f, coat: CATS.alley[k], pose, expr: { eyes: 'open', mouth: k === 1 && talk > 0.6 && lt > 0.8 ? 'open' : 'closed' }, look: [f * 0.4, -0.6] }); });
    } }));
  }, { sec: 's07', title: 'The boy who speaks cat: Kai chats with a ring of cats, kids film him' });
  SFX(t + 0.1, 'swish', 0.3); SFX(t + 0.5, 'camera', 0.3, -0.5);
}
// ---- 152 "A shelter opens behind the market." — the market corner: the shutter rolls up, the cat house, everyone ----
{ const t = CUT('152-narrator'), tE = CUT('153-narrator');
  SHOT(t, 's07_shelterOpens', (lt) => {
    s07_cam(lt, [1250, 520, 1.12], [1020, 560, 1.0], tE - t);
    const B = SET_POS2.shelter;
    ivStage(SET_shelter({ cats: 10, shutter: 0.1 + 0.9 * EZ.io(clamp(lt / 1.6)), act: () => {
      s07_std(CAST.mom, 330, 0.4, { h: 540, bk: 'mm' });
      s07_std(CAST.lily, 520, 0.45, { h: 0.62 * 520, pose: ivPose('wave'), expr: { eyes: 'happy', mouth: 'grin' } });
      s07_std(CAST.kai, 700, 0.5, { pose: ivPose('hips') });
      ivCastShadow(820, GROUND + 10, 140, { w: 0.4, len: 0.7, a: 0.28 }); ivCat({ x: 820, y: GROUND + 10, s: 150, f: 1, coat: CATS.pickles, pose: 'sit', expr: { eyes: 'half' } });
      ivCastShadow(B.house[1] + 70, B.house[3], 190, { w: 0.4, len: 0.7, a: 0.28 }); ivCat({ x: B.house[1] + 70, y: B.house[3], s: 190, f: -1, coat: CATS.boss, pose: 'sit', expr: { eyes: 'half' } });
    } }));
  }, { sec: 's07', title: 'A shelter opens behind the market: shutter rolls up, the cat house, the family, Boss' });
  SFX(t, 'whoosh', 0.35); SFX(t + 0.1, 'metal', 0.3, -0.6, 1.4);
}
// the big painted sign in front, under a sheet until "Boss's"
const s07_SIGN = { x: 700, y: GROUND + 110, k: 1.12 };
function s07_signGeo() { ctx.save(); ctx.font = `800 54px ${IV.font}`; ctx.letterSpacing = '3px'; const tw = ctx.measureText("BOSS'S HOUSE").width; ctx.restore();
  const k = s07_SIGN.k, w = (tw + 54 * 2.6) * k, hh = 54 * 2.1 * k, cy = s07_SIGN.y - 240 * k - hh / 2; return { w, hh, cy, top: cy - hh / 2 }; }
function s07_sheet(u) {   // u 0 (draped) .. 1 (pulled off to the left)
  if (u >= 1) return; const G = s07_signGeo(), x0 = s07_SIGN.x - G.w / 2 - 16, x1 = s07_SIGN.x + G.w / 2 + 16, y0 = G.top - 16, y1 = G.cy + G.hh / 2 + 56;
  ctx.save(); ctx.translate(x0, y1); ctx.rotate(-0.7 * u); ctx.translate(-x0 - 900 * u, -y1 + 140 * u - 260 * u * u); ctx.globalAlpha = 1 - u * 0.3;
  const wv = (x) => Math.sin(x * 0.03 + TT * 3) * 8 * (0.3 + u);
  ctx.beginPath(); ctx.moveTo(x0, y0 + 8); ctx.quadraticCurveTo((x0 + x1) / 2, y0 - 10, x1, y0 + 8);
  for (let x = x1; x >= x0; x -= 40) ctx.lineTo(x, y1 + wv(x) + (x === x1 || x - 40 < x0 ? 0 : 10));
  ctx.closePath(); ctx.fillStyle = '#ece4d4'; ctx.fill(); ctx.strokeStyle = IV_M.rim; ctx.lineWidth = 3; ctx.stroke();
  for (let k = 1; k < 6; k++) { const x = lerp(x0, x1, k / 6); ivLine(x, y0 + 14, x + wv(x) * 0.5, y1 - 6, 6, 'rgba(120,90,60,0.18)'); }
  const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(0,0,0,0.15)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(255,255,255,0.12)'); ctx.fillStyle = g; ctx.fill();
  ctx.restore();
}
// the unveiling scene: o.pull 0..1 (the sheet), o.boss: { x, y, pose, expr } or null, o.kai expr
function s07_unveil(o) {
  const S = s07_SIGN, G = s07_signGeo(), k = S.k, lh = 0.62 * 520 * k, u = o.pull;
  P_sign(S.x, S.y, k, "BOSS'S HOUSE");
  s07_sheet(u);
  // Lily holds the sheet's corner, then throws it up
  const lp = u < 0.5 ? ivPose('reach', { hR: [0.27, 0.2], lean: -0.04 }) : ivPose('catchUp', { hR: [0.1, -0.28], hL: [-0.12, -0.2] });
  ivCastShadow(S.x - G.w / 2 - 130, S.y, lh); ivMan({ who: CAST.lily, x: S.x - G.w / 2 - 130, y: S.y, h: lh, f: 0.5, pose: lp, expr: u < 0.5 ? { eyes: 'open', mouth: 'smile', look: [1, -0.5] } : { eyes: 'happy', mouth: 'grin' }, grip: { front: 'fist' } });
  ivCastShadow(S.x + G.w / 2 + 170, S.y, 520 * k); ivMan({ who: CAST.kai, x: S.x + G.w / 2 + 170, y: S.y, h: 520 * k, f: -0.4, pose: ivPose(o.kaiPose || 'relaxed'), expr: o.kai || { eyes: 'happy', mouth: 'smile', look: [-0.6, -0.6] } });
  ivCastShadow(S.x + G.w / 2 + 30, S.y + 10, 150, { w: 0.4, len: 0.7, a: 0.28 }); ivCat({ x: S.x + G.w / 2 + 30, y: S.y + 10, s: 165, f: -1, coat: CATS.pickles, pose: 'sit', expr: { eyes: 'half' }, look: [0, -0.8] });
  if (o.boss) ivCat({ coat: CATS.boss, s: 215, f: -1, ...o.boss });
}
const s07_bossLand = () => VW('153-narrator', "Boss's") + 0.55;
function s07_bossAt() {   // Boss leaps from the right onto the top of the sign, then sits
  const G = s07_signGeo(), tl = s07_bossLand(), u = clamp((TT - (tl - 0.35)) / 0.35);
  if (TT < tl - 0.35) return null;
  if (u < 1) return { x: lerp(s07_SIGN.x + 620, s07_SIGN.x + 30, u), y: lerp(G.top + 40, G.top + 2, u) - Math.sin(Math.PI * u) * 160, pose: 'stand', rot: lerp(-0.35, 0.1, u), expr: { eyes: 'wide' } };
  return { x: s07_SIGN.x + 30, y: G.top + 2, pose: 'sit', expr: { eyes: 'half' } };
}
// ---- 153 "Its sign says:" — the sign under a sheet, Lily holding its corner, Kai and Pickles waiting ---------------
{ const t = CUT('153-narrator');
  SHOT(t, 's07_signSheet', (lt) => {
    IV_CAM = { x: 760, y: 640, z: 1.45 + 0.03 * lt }; IV_FOCUS = 1;
    ivStage(SET_shelter({ cats: 8, shutter: 1, fg: false, act: () => s07_unveil({ pull: 0, boss: null }) }));
  }, { sec: 's07', title: 'Its sign says: the sign under a sheet, Lily holding the corner' });
  SFX(t + 0.1, 'cloth', 0.4, -0.4);
}
// ---- "…Boss's House." — the sheet whips off on "Boss's", the painted sign lands; Boss leaps onto it -----------------
{ const t = CUT('153-narrator', "Boss's"), tp = VW('153-narrator', "Boss's") - 0.06;
  SHOT(t, 's07_bossHouse', (lt) => {
    const G = s07_signGeo(); IV_CAM = { x: s07_SIGN.x + 20, y: G.top - 20, z: 2.15 + 0.06 * lt + 0.05 * (1 - s07_r(tp, 4)) }; IV_FOCUS = 1;
    ivStage(SET_shelter({ cats: 8, shutter: 1, fg: false, act: () => s07_unveil({ pull: s07_r(tp, 6), boss: s07_bossAt() }) }));
  }, { sec: 's07', title: '"BOSS\'S HOUSE": the sheet whips off, Boss leaps onto the sign' });
  SFX(tp, 'whoosh', 0.7, -0.4); SFX(tp + 0.05, 'cloth', 0.5, -0.5); SFX(s07_bossLand(), 'thud', 0.55, 0.1); SFX(tp + 0.25, 'cheer', 0.3, 0, 1.2);
}
// ---- [BEAT 1 s] — wordless: Boss on his sign in the sunrise, satisfied; he gives Kai a slow blink. A slow push ---------
{ const t = LE('153-narrator') + 0.35, tE = CUT('154-narrator');
  SHOT(t, 's07_bossSign', (lt) => {
    const G = s07_signGeo(); s07_cam(lt, [820, 600, 1.3], [760, G.cy + 10, 1.5], tE - t);
    const ph = clamp((lt - 0.5) / 1.4), bl = ph < 0.4 ? EZ.io(ph / 0.4) : ph < 0.6 ? 1 : 1 - EZ.io((ph - 0.6) / 0.4);
    ivStage(SET_shelter({ cats: 10, shutter: 1, fg: false, act: () => s07_unveil({ pull: 1, kaiPose: 'hips', kai: { eyes: 'happy', mouth: 'grin', look: [-0.6, -0.8] },
      boss: { x: s07_SIGN.x + 30, y: G.top + 2, pose: 'sit', expr: { eyes: 'open', blink: Math.min(0.99, 0.35 + 0.65 * bl) } } }) }));
  }, { sec: 's07', title: '[BEAT] wordless: Boss satisfied on his sign at sunrise, a slow blink at Kai' });
  SFX(t + 0.2, 'cloth', 0.25, 0.1);
}
