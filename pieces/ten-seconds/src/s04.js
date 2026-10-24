// =====================================================================
//  s04 — 065–089 · Dad, the night bus, the ghost truck, THE BRAKE (the midpoint)
//  Kitchen (lamp) → the bus in the rain (rain mood from 070 to the end). Every time comes from the voice helpers.
//  The truck pass (the loudest hit) is s04_TRUCK: in the [BEAT] between 081 "brakes" and 082, 68 % of the way through.
// =====================================================================
const s04_V = { 65: '065-narrator', 66: '066-narrator', 67: '067-dad', 68: '068-you', 69: '069-dad', 70: '070-narrator', 71: '071-narrator',
  72: '072-narrator', 73: '073-dad', 74: '074-narrator', 75: '075-narrator', 76: '076-narrator', 77: '077-narrator', 78: '078-narrator',
  79: '079-you', 80: '080-narrator', 81: '081-narrator', 82: '082-narrator', 83: '083-narrator', 84: '084-narrator', 85: '085-narrator',
  86: '086-narrator', 87: '087-narrator', 89: '089-mrsokafor', 90: '090-narrator' };
const s04_C = (n, w, k) => CUT(s04_V[n], w, k), s04_W = (n, w, k) => VW(s04_V[n], w, k), s04_WE = (n, w, k) => VWE(s04_V[n], w, k);
const s04_TRUCK = VWE(s04_V[81], 'brakes') + 0.68 * (LT(s04_V[82]) - VWE(s04_V[81], 'brakes'));
const s04_u = (a, d) => EZ.o3(clamp((TT - a) / Math.max(1e-3, d)));          // a hard-stop ramp on absolute time
const s04_ui = (a, d) => EZ.i2(clamp((TT - a) / Math.max(1e-3, d)));         // accelerating (falls, slams)
const s04_O = { sec: 's04' };
const s04_screen = (fn) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); fn(); ctx.restore(); };

// ---- small drawings ----------------------------------------------------------------------------
// a forearm + five-finger glove for hand close-ups (elbow → wrist), with the rim pass
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
// Dad's bus cap on its own (in his hand), centred on where the head would be
function s04_cap(hx, hy, R, f = 0) {
  const s = f < 0 ? -1 : 1, af = Math.abs(f), k = IV_M.key;
  ctx.save(); ctx.translate(k[0] * 3, k[1] * 3);
  ctx.beginPath(); ctx.ellipse(hx, hy - R * 0.55, R * 0.98 + 3, R * 0.55 + 3, 0, Math.PI, TAU); ctx.fillStyle = IV_M.rim; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.ellipse(hx, hy - R * 0.55, R * 0.98, R * 0.55, 0, Math.PI, TAU); ctx.fillStyle = '#1f2e4f'; ctx.fill();
  ivLine(hx - R * 0.95, hy - R * 0.56, hx + R * 0.95, hy - R * 0.56, R * 0.08, '#2a3c62', 'butt');
  ctx.beginPath(); ctx.ellipse(hx + s * R * 0.62 * (0.4 + af), hy - R * 0.52, R * 0.62, R * 0.13, 0, 0, TAU); ctx.fillStyle = '#111a2e'; ctx.fill();
  ivDot(hx + s * R * 0.2 * af, hy - R * 0.85, R * 0.12, '#f2c14e');
}
// the "22 YEARS · 0 ACCIDENTS" pin: (x, y) centre of the shield, sc scale (≈ 60 px tall at 1), n the number, a the ribbon pop
function s04_badge(x, y, sc, n, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  const sh = () => { ctx.beginPath(); ctx.moveTo(-26, -30); ctx.quadraticCurveTo(0, -38, 26, -30); ctx.lineTo(24, 4); ctx.quadraticCurveTo(20, 24, 0, 34); ctx.quadraticCurveTo(-20, 24, -24, 4); ctx.closePath(); };
  ctx.save(); ctx.translate(IV_M.key[0] * 1.6, IV_M.key[1] * 1.6); sh(); ctx.fillStyle = IV_M.rim; ctx.fill(); ctx.restore();
  sh(); ctx.fillStyle = '#e8c56a'; ctx.fill(); ctx.save(); ctx.scale(0.84, 0.84); sh(); ctx.fillStyle = '#22355e'; ctx.fill(); ctx.restore();
  ivText(String(n), 0, 6, 26, '#ffe2a0', { glow: 'rgba(255,190,90,0.6)' }); ivText('YEARS', 0, 18, 6.5, '#e8c56a', { track: 1 });
  ivDot(0, -22, 2.4, '#e8c56a'); ctx.beginPath(); ctx.ellipse(-8, -24, 6, 2.5, 0.3, 0, TAU); ctx.ellipse(8, -24, 6, 2.5, -0.3, 0, TAU); ctx.fillStyle = 'rgba(232,197,106,0.7)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-18, -28); ctx.quadraticCurveTo(-4, -32, 6, -30); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.4; ctx.stroke();
  if (a > 0) {   // the ribbon under it
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, 44); ctx.scale(0.8 + 0.2 * EZ.back(a), 0.8 + 0.2 * EZ.back(a));
    ivPoly([[-40, -9], [40, -9], [46, 0], [40, 9], [-40, 9], [-46, 0]], '#b8323a'); ivLine(-40, -6, 40, -6, 1, 'rgba(255,255,255,0.35)');
    ivText('0 ACCIDENTS', 0, 4, 9.5, '#fff1d8', { track: 1 }); ctx.restore();
  }
  ctx.restore();
}
// the ghost countdown: a cyan ring that empties from 10 to 1 between 077 "ten" and 081 "brakes"
function s04_left() { const a = s04_W(77, 'ten'), b = s04_WE(81, 'brakes'), u = clamp((TT - a) / (b - a)); return { n: clamp(Math.ceil(10 - 9 * u - 1e-6), 1, 10), u }; }
function s04_ring(x, y, r, a = 1) {
  if (a <= 0) return; const { n, u } = s04_left();
  s04_screen(() => {
    ctx.globalAlpha = a; ivGlow(x, y, r * 2.2, 'rgba(60,200,255,0.25)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.lineWidth = r * 0.07; ctx.strokeStyle = 'rgba(127,240,255,0.25)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - u)); ctx.lineWidth = r * 0.11; ctx.lineCap = 'round'; ctx.strokeStyle = IV.ghost; ctx.shadowColor = 'rgba(80,220,255,0.9)'; ctx.shadowBlur = r * 0.4; ctx.stroke(); ctx.shadowBlur = 0;
    const tick = mod((TT - s04_W(77, 'ten')) * 9 / (s04_WE(81, 'brakes') - s04_W(77, 'ten')), 1), pop = 1 + 0.12 * (1 - EZ.o3(clamp(tick * 6)));
    ctx.translate(x, y); ctx.scale(pop, pop); ivText(String(n), 0, r * 0.36, r * 1.0, IV.ghost, { glow: 'rgba(80,220,255,0.9)' });
  });
}
// a steady falling-object path: from p0 with velocity v under gravity g, bouncing on the floor fy (damped), rolling after
function s04_fly(t, x0, y0, vx, vy, g, fy, k = 0.35) {
  if (t <= 0) return { x: x0, y: y0, a: 0, air: false };
  let x = x0, y = y0, VX = vx, VY = vy, T = t;
  for (let b = 0; b < 4; b++) {
    const disc = VY * VY + 2 * g * (fy - y), tl = (-VY + Math.sqrt(Math.max(0, disc))) / g;   // time to floor
    if (T < tl) return { x: x + VX * T, y: y + VY * T + 0.5 * g * T * T, a: VX * t * 0.01, air: true };
    x += VX * tl; y = fy; T -= tl; VY = -(VY + g * tl) * k; VX *= 0.7; if (Math.abs(VY) < 60) break;
  }
  const roll = VX * (1 - Math.exp(-T * 1.6)) / 1.6;
  return { x: x + roll, y: fy, a: (x + roll) * 0.02, air: false };
}

// =====================================================================
//  A · Dad (kitchen, before the night shift) — 065–069
// =====================================================================
const s04_kitTheo = (o = {}) => ivMan({ who: CAST.you, x: 740, y: GROUND, h: 520, f: 0.55, pose: o.pose || ivPose('sitDesk'), expr: o.expr || { eyes: 'open', mouth: 'smile', look: [1, -0.4] }, talk: o.talk, grip: o.grip });
// 065 "Then there's Dad." — Dad lifts his cap onto his head (the cap lands on "Dad")
SHOT(s04_C(65), 's04_cap', () => {
  const tA = s04_W(65, 'dad') - 0.12, up = s04_u(tA, 0.21), down = s04_u(tA + 0.42, 0.21), on = up >= 1;
  IV_CAM = { x: 1190, y: 600, z: 1.55 * ivPush(SHOT_T0, 0.03, 1.8) };
  ivStage(SET_kitchen({ cap: false, act: () => {
    s04_kitTheo();
    const hold = ivPose('stand', { hR: [0.16, 0.08] }), head = ivPose('stand', { hR: [0.05, -0.16], tilt: -0.06 });
    let pose = ivPoseMix(hold, head, up); if (down > 0) pose = ivPoseMix(head, ivPose('relaxed', { hR: [0.07, 0.22] }), down);
    ivMan({ who: on ? CAST.dad : CAST.dadHome, x: 1420, y: GROUND, h: 560, f: -0.4, pose, grip: { front: on && down < 0.5 ? 'flat' : 'hold' },
      expr: { eyes: on ? 'happy' : 'open', mouth: on ? 'smile' : 'flat', look: [-0.5, 0] },
      hold: on ? null : { front: (x, y, a, h) => s04_cap(x + 0.1 * h, y + 0.005 * h, h * 0.125, -0.4) } });
  } }));
}, { ...s04_O, title: 'Dad puts his cap on' });
// 066 "He drives the night bus." — his hand takes the keys (LINE 9 fob) off the table
SHOT(s04_C(66), 's04_keys', () => {
  const g = s04_W(66, 'night') - 0.18, dn = s04_u(SHOT_T0, g - SHOT_T0), lift = s04_ui(s04_W(66, 'bus') - 0.05, 0.3), shut = TT >= g + 0.05;
  IV_CAM = { x: 1060, y: 610, z: 3.2 };
  const wx = lerp(lerp(1280, 1135, dn), 1290, lift), wy = lerp(lerp(440, 632, dn), 360, lift), ex = wx + 230, ey = wy - 330;
  ivStage(SET_kitchen({ cap: false, mug: true, front: () => {
    const a = Math.atan2(wy - ey, wx - ex), fx = wx + Math.cos(a) * 62, fy = wy + Math.sin(a) * 62;
    if (!shut) P_keys(1098, 694, 2.4, { ang: -1.25 });
    else P_keys(fx, fy, 2.4, { ang: 0.1 + Math.sin((TT - g) * 9) * 0.25 * (1 - clamp(TT - g)) });
    s04_arm(ex, ey, wx, wy, 1200, shut ? 'hold' : 'open', CAST.dad.col, -1);
  } }));
}, { ...s04_O, title: 'hand grabs the LINE 9 keys' });
// 067 "Twenty-two years, not one scratch." — the pin on his chest: 22 counts up, the ribbon "0 ACCIDENTS" lands on "scratch"
SHOT(s04_C(67), 's04_badge', () => {
  IV_CAM = { x: 1415, y: 625, z: 4.2 };
  const tap = s04_u(s04_W(67, 'scratch') - 0.1, 0.2), n = ivCount(SHOT_T0 + 0.1, s04_WE(67, 'twentytwo'), 0, 22), rib = ivPop(s04_WE(67, 'scratch') - 3 / FPS);
  ivStage(SET_kitchen({ cap: false, act: () => {
    const pose = ivPoseMix(ivPose('relaxed'), ivPose('hips'), tap);
    ivMan({ who: CAST.dad, x: 1420, y: GROUND, h: 560, f: 0.12, pose, grip: { front: tap > 0.5 ? 'fist' : 'open' }, talk: s04_V[67], expr: { eyes: 'happy', mouth: 'smile' } });
    s04_badge(1390, 568, 0.95, n, rib);
  } }));
}, { ...s04_O, title: 'the 22 YEARS · 0 ACCIDENTS pin' });
// 067 "Know why?" — Dad's face, eyebrow up, a proud smile
SHOT(s04_C(67, 'know'), 's04_dadKnow', () => {
  IV_CAM = { x: 1330, y: 470, z: 2.7 };
  ivStage(SET_kitchen({ cap: false, act: () => {
    ivMan({ who: CAST.dad, x: 1420, y: GROUND, h: 560, f: -0.35, pose: ivPose('hips'), talk: s04_V[67], expr: { eyes: 'open', mouth: 'smirk', brow: 'up', look: [-1, 0] } });
  } }));
}, { ...s04_O, title: 'Dad: "Know why?"' });
// 068 "Eyes on the road." — Theo at the table, eye-roll grin: he has heard it a thousand times
SHOT(s04_C(68), 's04_theoEyes', () => {
  IV_CAM = { x: 820, y: 545, z: 2.7 };
  ivStage(SET_kitchen({ cap: false, act: () => s04_kitTheo({ talk: s04_V[68], expr: { eyes: TT < s04_W(68, 'road') ? 'tired' : 'happy', mouth: 'smile', look: [0.6, -1] } }) }));
}, { ...s04_O, title: 'Theo: "Eyes on the road."' });
// 069 "Eyes on the road, kid." — the ritual: two fingers to his eyes, a point at Theo, a fist-bump on "kid"
SHOT(s04_C(69), 's04_ritual', () => {
  const e = s04_u(s04_W(69, 'eyes') - 0.1, 0.2), r = s04_u(s04_W(69, 'road') - 0.1, 0.17), k = s04_u(s04_W(69, 'kid') - 0.12, 0.18);
  IV_CAM = { x: 900, y: 590, z: 1.45 * ivPush(SHOT_T0, 0.03, 1.8) };
  ivStage(SET_kitchen({ cap: false, act: () => {
    let pd = ivPoseMix(ivPose('relaxed'), ivPose('stand', { hR: [0.03, -0.15], tilt: -0.05 }), e);
    pd = ivPoseMix(pd, ivPose('point', { hR: [0.28, 0.0] }), r); pd = ivPoseMix(pd, ivPose('stand', { hR: [0.25, 0.09], lean: 0.08 }), k);
    ivMan({ who: CAST.dad, x: 1010, y: GROUND, h: 560, f: -0.5, pose: pd, talk: s04_V[69], grip: { front: k > 0.5 ? 'fist' : 'point' }, expr: { eyes: k > 0.9 ? 'happy' : 'open', mouth: 'smile', look: [-1, 0.4] } });
    const pt = ivPoseMix(ivPose('sitDesk'), ivPose('sitDesk', { hR: [0.23, -0.1] }), k);
    s04_kitTheo({ pose: pt, grip: { front: 'fist' }, expr: { eyes: k > 0.9 ? 'happy' : 'open', mouth: 'grin', look: [1, -0.6] } });
  } }));
}, { ...s04_O, title: 'the ritual: eyes, point, fist-bump' });

// =====================================================================
//  B · the night bus in the rain — 070–073
// =====================================================================
const s04_dadDrive = (o = {}) => { const B = SET_POS.busFront; return ivMan({ who: CAST.dad, x: B.driver[0], y: B.driver[1], h: B.driver[2], f: o.f ?? 0.6, pose: o.pose || ivPose('drive'), talk: o.talk, grip: { front: 'hold', back: 'hold' }, expr: o.expr || { eyes: 'open', mouth: 'smile', look: [1, 0] } }); };
const s04_theoPole = (o = {}) => { const B = SET_POS.busFront; return ivMan({ who: CAST.you, x: B.rider[0], y: B.rider[1], h: B.rider[2], f: o.f ?? -0.35, pose: o.pose || ivPose('relaxed', { hR: [0.13, -0.06] }), talk: o.talk, noBlink: o.noBlink, grip: o.grip || { front: 'hold' }, expr: o.expr || { eyes: 'open', mouth: 'smile', look: [-1, 0] } }); };
// 070 "One Friday, you ride with him." — the bus side-on in the rain, rolling right; FRIDAY tag on "Friday"
SHOT(s04_C(70), 's04_busWide', () => {
  IV_CAM = { x: 960, y: 540, z: ivPush(SHOT_T0, 0.03, 1.8) };
  ivStage(SET_busSide({ busX: 560 + (TT - SHOT_T0) * 170, light: 'green' }));
  s04_screen(() => ivTag('FRIDAY  ·  11:48 PM', 360, 150, 34, ivPop(s04_W(70, 'friday'))));
}, { ...s04_O, title: 'the night bus, Friday, rain' });
SHOT(s04_C(70, 'ride'), 's04_rideWith', () => {
  IV_CAM = { x: 960, y: 560, z: 1.05 };
  ivStage(SET_busFront({ light: 'green', act: () => { s04_dadDrive({ expr: { eyes: 'happy', mouth: 'smile', look: [1, 0] } }); s04_theoPole(); } }));
}, { ...s04_O, title: 'riding up front with Dad' });
// 071 "Rain." — the windshield: drops, the wiper sweeping, the city smeared beyond
SHOT(s04_C(71), 's04_rainGlass', () => {
  IV_CAM = { x: 700, y: 360, z: 2.5 };
  ivStage(SET_busFront({ light: 'green', act: () => {
    const r = RNG('s04drops').f; for (let i = 0; i < 26; i++) { const x = 300 + r() * 900, y = 160 + mod(r() * 420 + TT * (r() < 0.3 ? 120 : 10), 420), rr = 4 + r() * 7; ivDot(x, y, rr, 'rgba(210,228,255,0.35)'); ivDot(x - rr * 0.3, y - rr * 0.3, rr * 0.35, 'rgba(255,255,255,0.6)'); }
  } }));
}, { ...s04_O, title: 'rain on the windshield' });
// 072 "Line nine." — the LED sign above the aisle: LINE 9, the next stop scrolling (5TH & MAIN)
function s04_led(x, y, w, h, hot) {
  ivRR(x - 10, y - 10, w + 20, h + 20, 10, '#05050a'); ivRR(x, y, w, h, 6, '#0d0b08');
  ctx.save(); ctx.beginPath(); ctx.rect(x + 6, y + 4, w - 12, h - 8); ctx.clip();
  const amber = '#ffb347', glow = 'rgba(255,170,60,0.95)';
  ivText('LINE', x + 30, y + h * 0.74, h * 0.55, amber, { font: IV.sans, align: 'left', glow, track: 3 });
  ivText('9', x + 30 + h * 1.75, y + h * 0.78, h * 0.72 * (1 + 0.15 * (1 - hot)), hot >= 1 ? '#fff0c8' : amber, { font: IV.sans, align: 'left', glow });
  ctx.save(); ctx.beginPath(); ctx.rect(x + h * 2.95, y, w, h); ctx.clip();
  ivText('NEXT:  5TH & MAIN   •   NEXT:  5TH & MAIN   •', x + w - mod(TT * 80, w * 1.3) + 40, y + h * 0.7, h * 0.42, amber, { font: IV.sans, align: 'left', glow }); ctx.restore();
  ctx.globalCompositeOperation = 'multiply'; for (let yy = y; yy < y + h; yy += 5) set_rect(x, yy + 3, w, 2, 'rgba(0,0,0,0.85)'); for (let xx = x; xx < x + w; xx += 5) set_rect(xx + 3, y, 2, h, 'rgba(0,0,0,0.85)');
  ctx.restore(); ivLine(x + 20, y - 6, x + w - 20, y - 6, 2, 'rgba(255,255,255,0.12)');
}
SHOT(s04_C(72), 's04_line9', () => {
  IV_CAM = { x: 470, y: 160, z: 2.6 };
  ivStage(SET_busAisle({ fg: false, front: () => s04_led(110, 70, 720, 110, ivPop(s04_W(72, 'nine'))) }));
}, { ...s04_O, title: 'LINE 9 sign, next: 5th & Main' });
// 073 "Rain like this, nobody's out." — Dad at the wheel, easy; then the empty aisle: only Mrs. Okafor, seat 4, bags + cane
SHOT(s04_C(73), 's04_dadRain', () => {
  IV_CAM = { x: 600, y: 640, z: 2.35 };
  ivStage(SET_busFront({ light: 'green', act: () => s04_dadDrive({ talk: s04_V[73], expr: { eyes: 'open', mouth: 'smile', look: [1, 0] } }) }));
}, { ...s04_O, title: 'Dad: "Rain like this…"' });
const s04_okSeat = (o = {}) => ivMan({ who: CAST.okafor, x: SET_POS.busAisle.seat4, y: GROUND, h: 500, f: -0.5, pose: o.pose || ivPose('sit', { hL: [0.14, 0.22], hR: [0.18, 0.21] }), talk: o.talk, expr: o.expr || { eyes: 'tired', mouth: 'smile', look: [-1, 0.2] } });
SHOT(s04_C(73, "nobody's"), 's04_aisleEmpty', () => {
  IV_CAM = { x: 1000, y: 540, z: ivPush(SHOT_T0, 0.03, 1.8) };
  ivStage(SET_busAisle({ act: () => { s04_okSeat(); P_bags(1360, 742, 1.35); P_cane(1260, 760, 0.95, { ang: 0.22 }); } }));
}, { ...s04_O, title: 'empty bus: Mrs. Okafor, seat 4' });

// =====================================================================
//  C · Fifth and Main — the light, the ghost truck — 074–076 + [BEAT]
// =====================================================================
// 074 "At Fifth and Main," — the corner in the rain, empty; the bus comes in along Main St and slows
SHOT(s04_C(74), 's04_corner', () => {
  IV_CAM = { x: 960, y: 540, z: ivPush(SHOT_T0, 0.03, 1.8) };
  const bx = lerp(2250, 1250, EZ.o2(clamp((TT - SHOT_T0) / 1.6)));
  ivStage(SET_corner({ t: 'rain', light: 'green', cars: false, road: () => P_bus(bx, SET_POS.corner.lanes[0], 0.34, { dir: -1 }) }));
}, { ...s04_O, title: 'Fifth and Main, rain, the bus arrives' });
// a traffic-light close-up stage: the wet street soft behind, the signal head sharp, rain in front
function s04_signalStage(x, y, s, state) {
  IV_M = IV_MOOD.rain;
  ivStage([
    { d: 4, draw: () => { set_wetStreet('rain', state, { signal: false, key: 's04sig' }); set_rain(140, 40, 0.3, 's04sr0'); } },
    { d: 1, draw: () => { ivLine(x + 40 * s, y - 60 * s, 2400, y - 60 * s, 16 * s, '#141722', 'butt'); ivRR(x + 30 * s, y - 80 * s, 26 * s, 50 * s, 4 * s, '#141722'); P_trafficLight(x, y, s, state, { head: true, glow: 1.4 });
      const r = RNG('s04sigd').f; for (let i = 0; i < 14; i++) { const dx = (r() - 0.5) * 70 * s, dy = mod(r() * 230 + TT * (20 + r() * 40), 230) - 115; ivDot(x + dx, y + dy * s, (1 + r() * 1.6) * s, 'rgba(210,228,255,0.55)'); } } },
    { d: 0.6, draw: () => set_rain(70, 130, 0.35, 's04sr1') },
  ]);
}
// 074 "…the light turns yellow." — green → yellow on "yellow"
SHOT(s04_C(74, 'light'), 's04_yellow', () => { s04_signalStage(1120, 540, 3.1, TT < s04_W(74, 'yellow') ? 'green' : 'yellow'); }, { ...s04_O, title: 'the light turns yellow' });
// 075 "Then red." — tight on the lamps: yellow → red on "red"
SHOT(s04_C(75), 's04_red', () => { s04_signalStage(900, 540 + 36 * 6.4, 6.4, TT < s04_W(75, 'red') ? 'yellow' : 'red'); }, { ...s04_O, title: 'then red' });

// the ghost truck through the windshield (o.out layer, d = 2): x centre, s scale, a alpha
// (drawn on the actors' layer, clipped to the glass: a ghost must be drawn on a sharp layer)
function s04_ghostTruck(x, s, a, y = 830) { if (a <= 0) return; const [gx, gy, gw] = SET_POS.busFront.glass; ctx.save(); ctx.beginPath(); ctx.roundRect(gx + 8, gy + 8, gw - 16, 650 - gy, 34); ctx.clip(); ivGhost(() => P_truck(x, y, s, { dir: -1, beam: true }), a); ctx.restore(); }
// 076 "And in the ghost, ten seconds ahead," — Theo's face, the cyan wash rising; "+10 s" on "ten"
SHOT(s04_C(76), 's04_inGhost', () => {
  const g = s04_u(s04_W(76, 'ghost') - 0.1, 0.3);
  IV_CAM = { x: 1370, y: 560, z: 2.35 };
  ivStage(SET_busFront({ light: 'red', act: () => {
    s04_ghostTruck(lerp(1900, 1500, clamp((TT - SHOT_T0) / 2.2)), 0.45, 0.6 * g);
    const m = s04_theoPole({ f: -0.3, expr: { eyes: g > 0.5 ? 'wide' : 'open', mouth: g > 0.5 ? 'o' : 'flat', brow: g > 0.5 ? 'up' : null, look: [-1, 0] } });
    ivGlow(m.head[0] - 60, m.head[1], 420, 'rgba(90,230,255,0.35)', g);
  } }));
  s04_screen(() => ivTag('+10 s', 520, 230, 46, ivPop(s04_W(76, 'ten')), { c: IV.ghost, line: 'rgba(127,240,255,0.7)' }));
}, { ...s04_O, title: 'Theo sees the ghost: +10 s' });
// 076 "…a truck comes through that red light," — over Dad's shoulder: the real street is empty; the ghost truck charges in
SHOT(s04_C(76, 'truck'), 's04_ghostComes', () => {
  const u = clamp((TT - SHOT_T0) / (s04_C(76, 'straight') - SHOT_T0));
  IV_CAM = { x: 960, y: 520, z: 1.06 };
  ivStage(SET_busFront({ light: 'red', act: () => {
    s04_ghostTruck(lerp(1950, 950, u), 0.56, 0.75);
    s04_dadDrive({ expr: { eyes: 'open', mouth: 'flat', look: [1, 0] } });
    s04_theoPole({ f: -0.45, expr: { eyes: 'wide', mouth: 'o', brow: 'up', look: [-1, -0.2] } });
  } }));
}, { ...s04_O, title: 'the ghost truck runs the red' });
// ---- the god's-eye view of the intersection (rain, night): Main St runs up the frame, the cross street left-right ----
const s04_OH = { x0: 700, x1: 1220, y0: 260, y1: 640, busX: 1100, stop: 742, lane: 555 };
function s04_ohGround() {
  const Q = s04_OH, r = RNG('s04oh').f;
  set_bg('#141824');
  for (const [bx, by, bw, bh] of [[-1200, -1000, Q.x0 - 110 + 1200, Q.y0 - 110 + 1000], [Q.x1 + 110, -1000, 2400, Q.y0 - 110 + 1000], [-1200, Q.y1 + 110, Q.x0 - 110 + 1200, 1600], [Q.x1 + 110, Q.y1 + 110, 2400, 1600]]) {
    set_rect(bx - 110, by - 110, bw + 220, bh + 220, '#2b3141');                                                          // sidewalk
    ivRR(bx, by, bw, bh, 6, '#1a1e2b'); ivRR(bx + 14, by + 14, bw - 28, bh - 28, 4, null, '#232838', 6);                  // rooftop
    for (let i = 0; i < 7; i++) { const x = bx + 40 + r() * (bw - 160), y = by + 40 + r() * (bh - 160); ivRR(x, y, 60 + r() * 70, 40 + r() * 50, 6, '#262b3a'); ivRR(x + 8, y + 6, 30, 10, 3, '#32394b'); }
    for (let i = 0; i < 3; i++) { const x = bx + 60 + r() * (bw - 200), y = by + 60 + r() * (bh - 200), on = (Math.floor(TT * 0.7 + i) + i) % 3 !== 0; ivRR(x, y, 70, 46, 4, on ? '#e8b46a' : '#2a2f40'); if (on) ivGlow(x + 35, y + 23, 120, 'rgba(255,190,110,0.25)'); }
  }
  set_rect(Q.x0, -1200, Q.x1 - Q.x0, 3400, '#151a28'); set_rect(-1400, Q.y0, 4600, Q.y1 - Q.y0, '#151a28');
  for (const x of [Q.x0, Q.x1]) { ivLine(x, -1200, x, Q.y0, 8, '#4a5266', 'butt'); ivLine(x, Q.y1, x, 2200, 8, '#4a5266', 'butt'); }
  for (const y of [Q.y0, Q.y1]) { ivLine(-1400, y, Q.x0, y, 8, '#4a5266', 'butt'); ivLine(Q.x1, y, 3200, y, 8, '#4a5266', 'butt'); }
  for (let y = -1200; y < 2200; y += 120) if (y + 60 < Q.y0 - 120 || y > Q.y1 + 120) ivRR(956, y, 8, 60, 3, '#d8b45a');
  for (let x = -1400; x < 3200; x += 120) if (x + 60 < Q.x0 - 120 || x > Q.x1 + 120) ivRR(x, (Q.y0 + Q.y1) / 2 - 4, 60, 8, 3, '#d8b45a');
  ctx.save(); ctx.globalAlpha = 0.75;
  for (let x = Q.x0 + 22; x < Q.x1 - 20; x += 52) { ivRR(x, Q.y1 + 18, 28, 74, 2, '#d9dce4'); ivRR(x, Q.y0 - 92, 28, 74, 2, '#d9dce4'); }
  for (let y = Q.y0 + 22; y < Q.y1 - 20; y += 52) { ivRR(Q.x0 - 92, y, 74, 28, 2, '#d9dce4'); ivRR(Q.x1 + 18, y, 74, 28, 2, '#d9dce4'); }
  ctx.restore(); ivRR(962, Q.stop - 6, Q.x1 - 966, 12, 2, 'rgba(235,235,235,0.8)');
  // signals at the corners (seen from above) + their red pools on the wet road; streetlamps
  for (const [x, y] of [[Q.x1 + 60, Q.y1 + 60], [Q.x0 - 60, Q.y0 - 60], [Q.x0 - 60, Q.y1 + 60], [Q.x1 + 60, Q.y0 - 60]]) { ivGlow(x, y, 260, 'rgba(255,50,40,0.22)'); ivDot(x, y, 16, '#0c0e16'); ivDot(x, y, 7, '#ff3b30'); }
  for (const [x, y] of [[Q.x0 - 150, -300], [Q.x1 + 150, 1300], [-400, Q.y1 + 150], [2300, Q.y0 - 150]]) { ivGlow(x, y, 420, 'rgba(255,190,110,0.28)'); ivDot(x, y, 14, '#ffe2a8'); }
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(Q.x0 + 60 + r() * 420, Q.y0 + 40 + r() * 340, 50 + r() * 70, 18 + r() * 20, r(), 0, TAU); ctx.fillStyle = 'rgba(70,90,140,0.22)'; ctx.fill(); }
  for (let i = 0; i < 60; i++) { const x = -400 + r() * 2700, y = -300 + r() * 1700, p = mod(TT * 1.4 + r(), 1); ctx.beginPath(); ctx.ellipse(x, y, 4 + 22 * p, 3 + 14 * p, 0, 0, TAU); ctx.strokeStyle = `rgba(190,210,255,${0.35 * (1 - p)})`; ctx.lineWidth = 2; ctx.stroke(); }
}
// the bus from above, nose up at noseY
function s04_busTop(x, ny, o = {}) {
  const L = 780, w = 88;
  if (!o.ghost) { ctx.save(); ctx.globalAlpha = 0.45; ivRR(x - w + 14, ny + 18, w * 2, L, 30, '#05060a'); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.16; ivPoly([[x - 60, ny], [x + 60, ny], [x + 210, ny - 520], [x - 210, ny - 520]], '#fff2c8'); ctx.restore();
  ivRR(x - w - 3 + IV_M.key[0] * 4, ny - 3 + IV_M.key[1] * 4, w * 2 + 6, L + 6, 32, IV_M.rim); ivRR(x - w, ny, w * 2, L, 30, '#e9e3d3');
  ivRR(x - w, ny + 12, w * 2, 40, [26, 26, 0, 0], '#22293a'); ivLine(x - w + 6, ny + 80, x - w + 6, ny + L - 30, 6, '#d0582f'); ivLine(x + w - 6, ny + 80, x + w - 6, ny + L - 30, 6, '#d0582f');
  ivRR(x - 50, ny + 120, 100, 150, 10, '#c9c4b6'); ivRR(x - 40, ny + 520, 80, 110, 10, '#c9c4b6'); for (let k = 0; k < 4; k++) ivLine(x - 38, ny + 135 + k * 36, x + 38, ny + 135 + k * 36, 3, '#aaa596');
  ivText('9', x, ny + 440, 110, '#2c4f86'); ivLine(x - w - 14, ny + 60, x - w, ny + 70, 6, '#2a2e3a'); ivLine(x + w + 14, ny + 60, x + w, ny + 70, 6, '#2a2e3a');
  ivRR(x - w + 10, ny + 2, 26, 10, 4, '#fff3c9'); ivRR(x + w - 36, ny + 2, 26, 10, 4, '#fff3c9');
  if (o.brake) { ivRR(x - w + 8, ny + L - 10, 30, 10, 3, '#ff3a2a'); ivRR(x + w - 38, ny + L - 10, 30, 10, 3, '#ff3a2a'); ivGlow(x, ny + L + 20, 300, 'rgba(255,40,30,0.6)', o.brake); }
}
// the truck from above, driving left, centre (x, y)
function s04_truckTop(x, y, o = {}) {
  const w = 82;
  if (!o.ghost) { ctx.save(); ctx.globalAlpha = 0.45; ivRR(x - 380 + 14, y - w + 18, 760, w * 2, 18, '#05060a'); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.2; ivPoly([[x - 380, y - 55], [x - 380, y + 55], [x - 980, y + 230], [x - 980, y - 230]], '#fff2c8'); ctx.restore();
  ivRR(x - 380 - 3 + IV_M.key[0] * 4, y - w - 3 + IV_M.key[1] * 4, 766, w * 2 + 6, 18, IV_M.rim);
  ivRR(x - 380, y - w + 8, 170, w * 2 - 16, 22, '#d64933'); ivRR(x - 372, y - w + 20, 40, w * 2 - 40, 10, '#1a2030');
  ivRR(x - 200, y - w, 580, w * 2, 8, '#e9e4da'); for (let i = 1; i < 9; i++) ivLine(x - 200 + i * 64, y - w + 4, x - 200 + i * 64, y + w - 4, 2, 'rgba(0,0,0,0.08)');
  ivText('RAPIDO', x + 90, y + 24, 66, '#1d2a4a', { track: 4 }); ivRR(x - 150, y - 60, 480, 10, 3, '#e8622c');
  for (const [mx, my] of [[x - 196, y - w + 4], [x - 196, y + w - 4], [x + 376, y - w + 4], [x + 376, y + w - 4]]) ivDot(mx, my, 6, '#ffb347');
  ivRR(x - 386, y - 50, 10, 24, 3, '#fff6d6'); ivRR(x - 386, y + 26, 10, 24, 3, '#fff6d6');
}
// the stage: rot tilts the whole ground; draw() puts the vehicles on the d = 1 layer (in the same tilted frame)
function s04_overhead(draw, key = 'oh') {
  IV_M = IV_MOOD.rain;
  const tilt = (fn) => () => { ctx.save(); ctx.translate(960, 540); ctx.rotate(-0.16); ctx.translate(-960, -540); fn(); ctx.restore(); };
  ivStage([{ d: 1.15, blur: 0, draw: tilt(s04_ohGround) }, { d: 1, draw: tilt(draw) }, { d: 0.55, draw: () => set_rain(70, 120, 0.3, 's04' + key) }]);
}
// 076 "…straight into the side of the bus." — from above: the real bus rolls on; in cyan, ten seconds ahead, the truck T-bones it
SHOT(s04_C(76, 'straight'), 's04_ghostCrash', () => {
  const Q = s04_OH, tH = s04_W(76, 'side'), pre = EZ.i2(clamp((TT - SHOT_T0) / (tH - SHOT_T0))), u = s04_u(tH, 0.5);
  IV_CAM = { x: 1000, y: 640, z: 0.74 * ivPush(SHOT_T0, 0.03, 1.8) };
  s04_overhead(() => {
    s04_busTop(Q.busX, lerp(1010, 950, clamp((TT - SHOT_T0) / 3)));
    ivGhost(() => {
      ctx.save(); ctx.translate(Q.busX - 150 * u, 720); ctx.rotate(-0.4 * u); ctx.translate(-Q.busX, -720); s04_busTop(Q.busX, 300, { ghost: true }); ctx.restore();
      s04_truckTop(TT < tH ? lerp(2900, 1565, pre) : 1565 - 170 * u, Q.lane, { ghost: true });
      if (TT >= tH) { const r = RNG('s04shard').f, k = TT - tH; for (let i = 0; i < 30; i++) { const a = r() * TAU, v = 300 + r() * 700; ctx.save(); ctx.translate(1185 + Math.cos(a) * v * k * Math.exp(-k * 2), Q.lane + Math.sin(a) * v * k * Math.exp(-k * 2)); ctx.rotate(a + k * 8); ivPoly([[-10, -6], [12, -3], [4, 8]], '#fff'); ctx.restore(); } }
    }, 0.85);
    if (TT >= tH) ivGlow(1185, Q.lane, 700, 'rgba(110,235,255,0.7)', 1 - s04_u(tH, 0.6));
  }, 'ghc');
}, { ...s04_O, title: 'from above: the ghost crash into the side' });
// [BEAT] — Theo frozen: the crash still glowing in his eyes
SHOT(LE(s04_V[76]) + 0.2, 's04_frozen', () => {
  IV_CAM = { x: 1400, y: 545, z: 4.1 };
  ivStage(SET_busFront({ light: 'red', act: () => {
    const m = s04_theoPole({ noBlink: true, f: -0.25, pose: ivPose('relaxed', { hR: [0.13, -0.06] }), expr: { eyes: 'wide', mouth: 'flat', brow: 'up', look: [-0.4, 0] } });
    const R = m.R, cx = m.head[0] - 0.25 * R * 0.42 - 0.4 * R * 0.08, cy = m.head[1] - R * 0.06, sp = R * 0.38 * (1 - 0.42 * 0.25), p = 0.6 + 0.4 * Math.sin(TT * 7);
    for (const ex of [cx - sp, cx + sp]) { ivDot(ex - R * 0.035, cy, R * 0.05, 'rgba(127,240,255,0.95)'); ivGlow(ex, cy, R * 0.35, 'rgba(90,230,255,0.5)', p); }
    ivGlow(m.head[0] - R, m.head[1], R * 3, 'rgba(60,200,255,0.22)', p);
  } }));
}, { ...s04_O, title: 'BEAT: Theo frozen, cyan in his eyes', boardAt: 0.6 });

// =====================================================================
//  D · ten seconds — 077–081: the ghost countdown runs 10 → 1 and lands on "brakes"
// =====================================================================
const s04_ringS = () => s04_ring(1745, 175, 72);
// 077 "Ten seconds." — the cab, everyone still; a big cyan 10 over the windshield, the ghost truck waiting at the edge
SHOT(s04_C(77), 's04_ten', () => {
  IV_CAM = { x: 960, y: 540, z: 1.04 };
  ivStage(SET_busFront({ light: 'red', act: () => {
    s04_ghostTruck(2050, 0.5, 0.45);
    s04_dadDrive({ expr: { eyes: 'open', mouth: 'flat', look: [1, 0] } });
    s04_theoPole({ f: -0.4, expr: { eyes: 'wide', mouth: 'flat', brow: 'up', look: [-1, 0] } });
  } }));
  s04_ring(960, 340, 150, ivPop(s04_W(77, 'ten')));
}, { ...s04_O, title: 'ghost countdown: 10' });
// 078 "Not enough time to explain." — Theo turns from the glass to Dad, mouth opening
SHOT(s04_C(78), 's04_turn', () => {
  const t = s04_u(s04_W(78, 'time') - 0.05, 0.2);
  IV_CAM = { x: 1380, y: 560, z: 2.3 };
  ivStage(SET_busFront({ light: 'red', act: () => {
    s04_ghostTruck(1900, 0.45, 0.4);
    s04_theoPole({ noBlink: true, f: lerp(-0.25, -0.75, t), expr: { eyes: 'wide', mouth: t > 0.5 ? 'open' : 'flat', brow: 'up', look: [-1, 0] } });
  } }));
  s04_ringS();
}, { ...s04_O, title: 'Theo turns to Dad' });
// 079 "Dad. Brake. Now." — he leans in and points at the red light, shouting
SHOT(s04_C(79), 's04_shout', () => {
  const p = s04_u(s04_W(79, 'dad') - 0.05, 0.2);
  IV_CAM = { x: 1000, y: 610, z: 1.45 };
  ivStage(SET_busFront({ light: 'red', act: () => {
    s04_dadDrive({ f: 0.5, expr: { eyes: 'open', mouth: 'flat', look: [1, -0.3] } });
    s04_theoPole({ f: -0.65, talk: s04_V[79], pose: ivPoseMix(ivPose('relaxed', { hR: [0.13, -0.06] }), ivPose('point', { hR: [0.32, -0.1], lean: 0.12 }), p), grip: { front: p > 0.5 ? 'point' : 'hold', back: 'open' }, expr: { eyes: 'wide', mouth: 'open', brow: 'angry', look: [-1, 0] } });
  } }));
  s04_ringS();
}, { ...s04_O, title: 'Theo: "Dad. Brake. Now."' });
// 079 "Brake. Now." — Dad's eyes in the rear-view mirror, flicking to Theo and going wide on "now"
SHOT(s04_C(79, 'brake'), 's04_mirror', () => {
  IV_CAM = { x: 960, y: 300, z: 1.7 }; IV_FOCUS = 0.5;
  ivStage(SET_busFront({ light: 'red', wipers: true }));
  const mx = 960, my = 330, mw = 980, mh = 330, wide = TT >= s04_W(79, 'now');
  s04_screen(() => {
    ivLine(mx, -10, mx, my - mh / 2, 26, '#05060a'); ivRR(mx - 40, my - mh / 2 - 30, 80, 40, 8, '#0a0b10');
    ivRR(mx - mw / 2 - 22 + IV_M.key[0] * 5, my - mh / 2 - 22 + IV_M.key[1] * 5, mw + 44, mh + 44, 70, IV_M.rim); ivRR(mx - mw / 2 - 22, my - mh / 2 - 22, mw + 44, mh + 44, 70, '#0a0b10');
    ctx.save(); ctx.beginPath(); ctx.roundRect(mx - mw / 2, my - mh / 2, mw, mh, 54); ctx.clip();
    ctx.fillStyle = ivVGrad(my - mh / 2, my + mh / 2, ['#1b2236', '#0e1220']); ctx.fillRect(0, 0, W, H);
    const r = RNG('s04mir').f; for (let i = 0; i < 18; i++) ivGlow(mx - mw / 2 + r() * mw, my - mh / 2 + r() * mh, 30 + r() * 50, r() < 0.3 ? 'rgba(255,60,40,0.35)' : 'rgba(255,190,110,0.3)');
    ctx.translate(mx * 2, 0); ctx.scale(-1, 1);
    ivMan({ who: CAST.dad, x: mx + 60, y: my + 1680, h: 2300, f: wide ? 0.05 : 0.3, pose: ivPose('drive'), noBlink: true, blinkKey: 'mir', expr: { eyes: wide ? 'wide' : 'open', mouth: 'flat', brow: wide ? 'up' : null, look: wide ? [0, 0] : [0.8, 0] } });
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.12; ivPoly([[mx - 200, my - mh / 2], [mx - 60, my - mh / 2], [mx - 260, my + mh / 2], [mx - 400, my + mh / 2]], '#fff'); ctx.restore();
  });
  s04_ringS();
}, { ...s04_O, title: "Dad's eyes in the mirror" });
// 080 "He doesn't ask why." — Dad's face sets; then his hands clamp the wheel at ten and two
SHOT(s04_C(80), 's04_dadSet', () => {
  IV_CAM = { x: 600, y: 640, z: 2.35 };
  ivStage(SET_busFront({ light: 'red', act: () => s04_dadDrive({ f: 0.7, expr: { eyes: TT < s04_W(80, 'ask') ? 'wide' : 'angry', mouth: 'flat', brow: TT < s04_W(80, 'ask') ? 'up' : 'angry', look: [1, 0] } }) }));
  s04_ringS();
}, { ...s04_O, title: "Dad doesn't ask why" });
SHOT(s04_C(80, 'why'), 's04_grip', () => {
  const g = s04_u(SHOT_T0 + 1 / FPS, 4 / FPS);
  IV_CAM = { x: 720, y: 760, z: 3.4 }; IV_FOCUS = 1;
  ivStage(SET_busFront({ light: 'red', front: () => {
    const [wx, wy] = SET_POS.busFront.wheel, R = 85 * 1.45;
    ctx.fillStyle = 'rgba(5,6,10,0.55)'; ctx.fillRect(wx - 400, wy - 300, 800, 600);
    const at = (a) => [wx + Math.cos(a) * R, wy + Math.sin(a) * R * 0.78];
    const [lx, ly] = at(lerp(-3.9, -2.55, g)), [rx, ry] = at(lerp(0.75, -0.6, g));
    s04_arm(lx - 150, ly + 170, lx, ly, 1050, g > 0.6 ? 'fist' : 'hold', CAST.dad.col, 1);
    s04_arm(rx + 150, ry + 170, rx, ry, 1050, g > 0.6 ? 'fist' : 'hold', CAST.dad.col, -1);
    P_wheel(wx, wy, 1.45, { tilt: 0.22 });
  } }));
  s04_ringS();
}, { ...s04_O, title: 'hands clamp the wheel' });
// 081 "He brakes." — the shoe slams the brake pedal on "brakes"
function s04_pedals(p) {
  IV_M = IV_MOOD.rain;
  ivStage([
    { d: 2.5, draw: () => { set_bg(ivVGrad(0, 1080, ['#4a5a80', '#26304a'])); ivGlow(1000, 760, 1000, 'rgba(255,190,120,0.38)'); ivGlow(980, 700, 700 * p + 1, `rgba(255,60,40,${(0.35 * p).toFixed(3)})`); for (let k = 0; k < 6; k++) ivLine(-300 + k * 520, -200, -100 + k * 520, 1300, 30, 'rgba(255,255,255,0.025)'); ivGlow(1500, 300, 500, 'rgba(255,50,40,0.12)'); ivDot(300, 260, 10, '#3aa36b'); ivGlow(300, 260, 60, 'rgba(60,230,120,0.3)'); } },
    { d: 1, draw: () => {
      set_rect(-400, 880, 2800, 400, '#0c0e15'); for (let x = -400; x < 2400; x += 46) ivLine(x, 890, x - 60, 1200, 8, '#151926');
      // accelerator (right), brake (centre): the brake pad sinks 70 px and tips
      ivLine(1420, 300, 1440, 640, 20, '#1b1e28'); ivRR(1380, 600, 110, 250, 14, '#2a2e3a'); for (let i = 0; i < 6; i++) ivLine(1395, 630 + i * 34, 1475, 630 + i * 34, 5, '#1a1d26');
      const py = 640 + 70 * p; ivLine(1000, 120, 980, py, 26, '#1b1e28');
      ctx.save(); ctx.translate(980, py + 40); ctx.rotate(0.12 * p);
      ivRR(-150 + IV_M.key[0] * 4, -50 + IV_M.key[1] * 4, 300, 100, 18, IV_M.rim); ivRR(-150, -50, 300, 100, 18, '#2c303c'); for (let i = 0; i < 7; i++) ivLine(-130 + i * 43, -36, -130 + i * 43, 36, 7, '#1c1f28'); ctx.restore();
      // the leg + shoe
      const ax = 900 + 20 * p, ay = lerp(330, py - 95, p), toe = [ax + 300, ay + 95];
      for (const rim of [true, false]) { const o = rim ? [IV_M.key[0] * 12, IV_M.key[1] * 12] : [0, 0], c = rim ? IV_M.rim : null;
        ivLine(560 + o[0], -300 + o[1], ax + o[0], ay + o[1], 130 + (rim ? 16 : 0), c || '#2a3d68');
        ctx.save(); ctx.translate(o[0], o[1]); ctx.beginPath(); ctx.moveTo(ax - 95, ay + 72); ctx.lineTo(ax - 80, ay - 45); ctx.quadraticCurveTo(ax + 40, ay - 50, ax + 150, ay + 5);
        ctx.quadraticCurveTo(toe[0] + 60, toe[1] - 40, toe[0] + 40, toe[1] + 10); ctx.quadraticCurveTo(toe[0] + 20, toe[1] + 32, toe[0] - 40, toe[1] + 28); ctx.closePath(); ctx.fillStyle = c || '#34343f'; ctx.fill(); ctx.restore(); }
      ivGlow(toe[0] - 40, toe[1] - 40, 160, 'rgba(255,200,140,0.18)');
      for (let i = 0; i < 4; i++) ivLine(ax + 20 + i * 40, ay - 22 + i * 12, ax + 44 + i * 40, ay - 4 + i * 12, 6, '#5a5a66');
      ivLine(ax - 80, ay + 64, toe[0] + 4, toe[1] + 16, 14, '#2e3242'); ivLine(ax - 40, ay - 26, ax + 90, ay - 18, 6, 'rgba(255,255,255,0.12)');
      ivLine(560, -300, ax, ay, 4, 'rgba(120,150,220,0.25)');
    } },
    { d: 0.6, draw: () => { ivRR(-300, -200, 420, 1500, 40, '#06070b'); } },
  ]);
}
SHOT(s04_C(81), 's04_pedal', () => {
  IV_CAM = { x: 960, y: 560, z: 1 };
  s04_pedals(s04_ui(s04_W(81, 'brakes') - 0.06, 4 / FPS));
  s04_ringS();
}, { ...s04_O, title: 'the foot slams the brake' });

// =====================================================================
//  E · [BEAT 2 s] the stop, then THE TRUCK (s04_TRUCK — the loudest hit; 6-frame jolt) — 082–083
// =====================================================================
// beat 1: outside, side-on: the bus nose-dips and stops dead short of the crossing, brake lights blazing; the light is red
SHOT(VWE(s04_V[81], 'brakes') + 2 / FPS, 's04_stop', () => {
  const T = TT - SHOT_T0, Ts = 0.55, v = 760, d = T < Ts ? v * T * (1 - T / (2 * Ts)) : v * Ts / 2;
  IV_CAM = { x: 1060, y: 560, z: 1.08 };
  ivStage(SET_busSide({ busX: 640 + d, brake: 1 - 0.25 * clamp((T - Ts) / 0.3), light: 'red', act: () => {
    if (T < Ts + 0.25) for (let i = 0; i < 9; i++) { const k = clamp(T / (Ts + 0.25)), x = 640 + d - 450 + i * 40; ivLine(x, 880 + (i % 3) * 8, x - 90 - 120 * k, 860 - 30 * (1 - k) + (i % 3) * 6, 3, `rgba(200,220,255,${0.45 * (1 - k)})`); }
  } }));
}, { ...s04_O, title: 'BEAT: the bus stops dead, brake lights', boardAt: 0.5 });
// beat 2 → the hit: the windshield, silence, wipers… then the real truck tears across the glass, close enough to touch
SHOT(s04_TRUCK - 0.45, 's04_truckPass', () => {
  const k = Math.round((TT - s04_TRUCK) * FPS), J = [[16, -9], [-13, 8], [10, -6], [-7, 4], [4, -2], [-2, 1]], j = k >= 0 && k < 6 ? J[k] : [0, 0];
  IV_CAM = { x: 960 + j[0], y: 470 + j[1], z: 1.22 }; IV_FOCUS = 1.6;
  const tx = 960 - (TT - s04_TRUCK) * 7000, nose = tx - 850 * 1.0;
  ivStage(SET_busFront({ light: 'red', out: () => {
    P_truck(tx, 1010, 1.0, { dir: -1, beam: true });
    for (let i = 0; i < 14; i++) { const x = tx + 560 + i * 60, y = 880 + (i % 4) * 14; ivLine(x, y, x + 260 + (i % 3) * 80, y - 30 - (i % 5) * 18, 4, 'rgba(210,225,255,0.35)'); }
  }, act: () => {
    s04_dadDrive({ f: 0.62, pose: ivPose('drive', { lean: -0.04 }), expr: { eyes: 'wide', mouth: k >= 0 ? 'o' : 'flat', brow: 'up', look: [1, 0] } });
    s04_theoPole({ f: -0.4, pose: ivPose('relaxed', { hR: [0.13, -0.06], hL: [0.1, 0.0] }), grip: { front: 'hold', back: 'hold' }, expr: { eyes: 'wide', mouth: 'flat', brow: 'up', look: [-1, 0] } });
  } }));
  const fl = clamp(1 - Math.abs(nose - 900) / 900);
  if (fl > 0) s04_screen(() => { ivGlow(clamp(nose, 0, 1920), 430, 1100, 'rgba(255,248,225,0.8)', fl); ctx.globalAlpha = fl * 0.35; ctx.fillStyle = '#fff6e0'; ctx.fillRect(0, 0, W, H); });
}, { ...s04_O, title: 'THE TRUCK roars past (jolt)', boardAt: 0.5 });
// 082 "The truck roars past the windshield." — from above again: the bus stopped on the line, the truck blasting by its nose
SHOT(s04_C(82), 's04_nearMiss', () => {
  const Q = s04_OH, u = (TT - SHOT_T0) / 2.0, tx = lerp(1020, -1300, u);
  IV_CAM = { x: 1000, y: 640, z: 0.74 };
  s04_overhead(() => {
    s04_busTop(Q.busX, Q.stop + 6, { brake: 1 });
    for (let i = 0; i < 16; i++) { const x = tx + 390 + i * 55, y = Q.lane + ((i * 37) % 150) - 75; ivLine(x, y, x + 200 + (i % 4) * 60, y + ((i % 3) - 1) * 20, 5, `rgba(210,225,255,${0.4 - i * 0.02})`); }
    s04_truckTop(tx, Q.lane);
  }, 'nm');
  s04_screen(() => ivTag('INCHES', 1340, 500, 30, ivPop(s04_W(82, 'past')) * (1 - clamp((TT - s04_W(82, 'past') - 1.2) * 4))));
}, { ...s04_O, title: 'from above: the real truck misses by inches' });
// 083 "Close enough to read the logo." — RAPIDO FREIGHT sliding past the wet glass
SHOT(s04_C(83), 's04_logo', () => {
  const u = (TT - SHOT_T0) / (s04_C(84) - SHOT_T0), tx = lerp(980, 420, u);
  IV_CAM = { x: 900, y: 420, z: 1.75 }; IV_FOCUS = 1.7;
  ivStage(SET_busFront({ light: 'red', out: () => P_truck(tx, 880, 0.95, { dir: -1, lights: false }) }));
}, { ...s04_O, title: 'RAPIDO FREIGHT, close enough to read' });

// =====================================================================
//  F · inside, everything flies — 084–089 + [BEAT 2 s]
// =====================================================================
const s04_okLurch = (u, x = SET_POS.busAisle.seat4) => ivMan({ who: CAST.okafor, x, y: GROUND, h: 500, f: -0.5,
  pose: ivPoseMix(ivPose('sit', { hL: [0.14, 0.22], hR: [0.18, 0.21] }), ivPose('sit', { lean: 0.5, hL: [0.3, 0.02], hR: [0.33, -0.02], tilt: -0.1 }), u),
  expr: { eyes: u > 0.3 ? 'wide' : 'tired', mouth: u > 0.3 ? 'o' : 'smile', brow: u > 0.3 ? 'up' : null, look: [-1, 0] } });
// the things in flight (shared by 084–086): t = seconds since they took off
const s04_bagsAt = (t) => { const f = s04_fly(t, 1360, 742, -820, -380, 2600, GROUND, 0.2); return { ...f, ang: f.air ? -t * 5 : -1.45 }; };
const s04_orAt = (t, i) => s04_fly(t, 1330 + i * 14, 690, -460 - i * 105, -560 + i * 70, 2600, GROUND, 0.45);
const s04_caneAt = (t) => { const f = s04_fly(t, 1260, 760, -980, -650, 2600, GROUND - 12, 0.25); return { ...f, ang: f.air ? 0.22 - t * 10 : Math.PI / 2 }; };
// 084 "Inside, everything flies." — the aisle: bags, oranges, the cane in the air, Mrs. Okafor pitched forward
SHOT(s04_C(84), 's04_flies', () => {
  const t = TT - SHOT_T0 - 0.04;
  IV_CAM = { x: 980, y: 540, z: 1 };
  ivStage(SET_busAisle({ speed: 0, lurch: 0.6 * (1 - clamp(t)), act: () => {
    s04_okLurch(s04_u(SHOT_T0, 5 / FPS));
    const b = s04_bagsAt(t); P_bags(b.x, b.y, 1.35, { ang: b.ang });
    for (let i = 0; i < 6; i++) { const o = s04_orAt(t, i); P_orange(o.x, o.y, 1.6, { air: o.air }); }
    const c = s04_caneAt(t); P_cane(c.x, c.y, 0.95, { ang: c.ang });
  } }));
}, { ...s04_O, title: 'everything flies' });
// 085 "Shopping bags." — close: the bags tumbling, oranges spilling out
SHOT(s04_C(85), 's04_bags', () => {
  const t = TT - SHOT_T0;
  IV_CAM = { x: 760, y: 760, z: 2.5 };
  ivStage(SET_busAisle({ speed: 0, fg: false, act: () => {
    const f = s04_fly(t, 1180, 640, -330, -220, 1500, GROUND, 0.2), ang = f.air ? -0.4 - t * 3.2 : -1.5;
    for (let i = 0; i < 5; i++) { const t0 = 0.12 + i * 0.05, o = s04_fly(t - t0, 1150 - i * 8, 630, -260 - i * 60, -120 + i * 40, 1500, GROUND, 0.5); if (t > t0) P_orange(o.x, o.y, 2.2, { air: o.air }); }
    P_bags(f.x, f.y, 1.8, { ang });
  } }));
}, { ...s04_O, title: 'shopping bags tumbling', boardAt: 0.22 });
// 086 "A cane." — the cane spins through the air, cracks off the pole, drops
SHOT(s04_C(86), 's04_cane', () => {
  const t = TT - SHOT_T0, tc = (1420 - 1215) / 520;
  IV_CAM = { x: 1080, y: 600, z: 2.4 };
  ivStage(SET_busAisle({ speed: 0, fg: false, act: () => {
    s04_okLurch(1);
  }, front: () => {
    let x, y, a;
    if (t < tc) { x = 1420 - 520 * t; y = 470 - 150 * t + 700 * t * t; a = 0.3 - 11 * t; }
    else { const y0 = 470 - 150 * tc + 700 * tc * tc, f = s04_fly(t - tc, 1215, y0, 170, 80, 1800, GROUND - 12, 0.3); x = f.x; y = f.y; a = f.air ? 0.3 - 11 * tc + 7 * (t - tc) : Math.PI / 2; }
    P_cane(x, y, 1.2, { ang: a });
    if (t >= tc && t < tc + 0.2) for (let i = 0; i < 5; i++) { const an = -0.9 + i * 0.45, k = (t - tc) / 0.2; ivLine(1180 + Math.cos(an) * 30, y + Math.sin(an) * 30, 1180 + Math.cos(an) * (40 + 50 * k), y + Math.sin(an) * (40 + 50 * k), 5, `rgba(255,236,200,${1 - k})`); }
  } }));
}, { ...s04_O, title: 'a cane, spinning, hits the pole' });
// 087 "And Mrs. Okafor," — her face: glasses, eyes wide, pitching forward
SHOT(s04_C(87), 's04_okFace', () => {
  IV_CAM = { x: 920, y: 530, z: 2.6 };
  ivStage(SET_busAisle({ speed: 0, act: () => s04_okLurch(lerp(0.35, 1, s04_u(SHOT_T0, 0.5))) }));
}, { ...s04_O, title: 'Mrs. Okafor pitching forward' });
// 087 "…seat four," — the seat-4 plate (PRIORITY): she's thrown out of it; the 4 lights on "four"
SHOT(s04_C(87, 'seat'), 's04_seat4', () => {
  const u = s04_ui(SHOT_T0, 0.32);
  IV_CAM = { x: 990, y: 480, z: 3 };
  ivStage(SET_busAisle({ speed: 0, fg: false, act: () => {
    if (u < 1) ivMan({ who: CAST.okafor, x: 960 - 330 * u, y: GROUND, h: 500, f: -0.5, pose: ivPose('sit', { lean: 0.5 + 0.7 * u, hL: [0.3, 0.02], hR: [0.33, -0.02], dip: 0.14 + 0.1 * u }), expr: { eyes: 'wide', mouth: 'o', brow: 'up' } });
  }, front: () => { const g = ivPop(s04_W(87, 'four')); ivGlow(1055, 415, 220, 'rgba(255,210,58,0.55)', g); if (g > 0) { ctx.save(); ctx.globalAlpha = g; ivRR(1020, 390, 70, 50, 8, '#ffe066'); ivText('4', 1055, 430, 40, '#1a1e2c', { font: IV.sans }); ctx.restore(); } } }));
}, { ...s04_O, title: 'seat 4, empty' });
// 087 "…hits the floor." — she lands in the aisle on "floor": oranges rolling, the cane down, the bags spilled
const s04_aftermath = (t) => {
  P_bags(300, GROUND, 1.35, { ang: -1.45 }); P_cane(1060, GROUND - 12, 0.95, { ang: Math.PI / 2 });
  for (let i = 0; i < 6; i++) { const x = 300 + i * 150 + Math.sin(i * 2.3) * 40 - (14 + i * 5) * Math.min(t, 6); P_orange(x, GROUND + 6 + (i % 3) * 22, 1.6); }
};
SHOT(s04_C(87, 'hits'), 's04_fall', () => {
  const land = s04_W(87, 'floor') + 0.03, u = s04_ui(SHOT_T0 - 0.12, land - SHOT_T0 + 0.12), bump = TT > land ? Math.sin(clamp((TT - land) / 0.15) * Math.PI) * 10 : 0;
  IV_CAM = { x: 800, y: 700, z: 1.6 };
  ivStage(SET_busAisle({ speed: 0, act: () => {
    s04_aftermath(TT - SHOT_T0);
    ivMan({ who: CAST.okafor, x: lerp(900, 730, u), y: GROUND - bump, h: 500, f: -0.5, air: u < 1,
      pose: ivPoseMix(ivPose('sit', { lean: 0.75, hL: [0.3, 0.05], hR: [0.33, 0.02] }), ivPose('fallen'), u), expr: { eyes: u < 1 ? 'wide' : 'closed', mouth: u < 1 ? 'o' : 'frown', brow: 'sad' } });
  } }));
}, { ...s04_O, title: 'Mrs. Okafor hits the floor' });
// 089 "My wrist…" — sitting up on the floor, clutching her wrist; then the [BEAT]: the wrist, and Dad looking back
const s04_okFloor = (o = {}) => ivMan({ who: CAST.okafor, x: 720, y: GROUND, h: 500, f: -0.5, talk: o.talk,
  pose: { ...IV_POSES.stand, hL: [0.15, 0.12], hR: [0.1, 0.15], fL: [0.3, 0.04], fR: [0.35, 0.07], dip: 0.4, seat: true, lean: 0.15, tilt: 0.22 },
  grip: { front: 'hold', back: 'hold' }, expr: { eyes: 'sad', mouth: 'frown', brow: 'sad', look: [0.3, 0.6] } });
SHOT(s04_C(89), 's04_myWrist', () => {
  IV_CAM = { x: 690, y: 690, z: 2.5 };
  ivStage(SET_busAisle({ speed: 0, act: () => { s04_aftermath(TT - SHOT_T0 + 2); s04_okFloor({ talk: s04_V[89] }); } }));
}, { ...s04_O, title: 'Mrs. Okafor: "My wrist…"' });
const s04_beat2 = LE(s04_V[89]) + 0.15;
SHOT(s04_beat2, 's04_wristCU', () => {
  IV_CAM = { x: 900, y: 820, z: 3.1 }; IV_FOCUS = 1;
  const sh = Math.sin(TT * 31) * 1.2;   // a small tremble
  ivStage(SET_busAisle({ speed: 0, fg: false, front: () => {
    P_orange(1180 - 55 * (TT - SHOT_T0), GROUND + 4, 2.2);
    s04_arm(470, 900, 930 + sh, 862, 1300, 'open', CAST.okafor.col, 1);
    s04_arm(1060, 1080, 835 + sh * 0.5, 872, 1300, 'hold', CAST.okafor.col, -1);
  } }));
}, { ...s04_O, title: 'BEAT: her hand holding the wrist', boardAt: 0.5 });
SHOT(s04_beat2 + 0.5 * (s04_C(90) - s04_beat2), 's04_dadBack', () => {
  IV_CAM = { x: 590, y: 640, z: 2.35 };
  ivStage(SET_busFront({ light: 'green', act: () => s04_dadDrive({ f: -0.3, expr: { eyes: 'sad', mouth: 'o', brow: 'sad', look: [-0.6, 0.2] } }) }));
}, { ...s04_O, title: 'BEAT: Dad looks back, the light turns green', boardAt: 0.5 });
