// =====================================================================
//  SCENES — Why is there a no-phones sign at every gas station? (voltamps). World 1080x1920, TT on 1s.
//  magenta = static charge (the real suspect), cyan = the phone / safe ground, amber = vapour, fire and energy.
//  Every free text is centred (x 540); titles and big text in serif.
// =====================================================================
const CXT = 540;
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const win = (t0, t1, d = 0.35) => fadeIn(t0, d) * fadeOut(t1, d);
const OV = vaOverlay;
const flashK = (t, d = 0.6) => (TT < t ? 0 : TT < t + 0.08 ? (TT - t) / 0.08 : Math.exp(-(TT - t - 0.08) / d * 3));
const BW = (from, to = from, d = 0.3) => win(SUB(from) + 0.05, SUBEND(to) - 0.05, d);   // visible across beats from..to
let CAMZ = 1;

// ---- text helpers: centred serif captions, typed on their word
function cap(str, y, t0, c = VA.cream, size = 60, o = {}) {
  const a = (o.a ?? 1) * fadeIn(t0 - 0.05, 0.25);
  if (a <= 0) return;
  OV(() => vaText(str, CXT, y, size, c, { align: 'center', serif: o.mono ? false : true, italic: o.italic, weight: o.weight, a, frac: vaType(t0, str, o.cps ?? 26), glow: o.glow ?? 8 }));
}
function label(str, x, y, c = VA.text, size = 30, a = 1) { vaText(str, x, y, size, c, { align: 'center', a }); }

// ---- the camera: a slow float (the zooms are drawn locally)
function camAtT() {
  // each beat drifts the other way: push in on one, ease out on the next (continuous across the boundaries)
  let i = 0; while (i + 1 < TB.length && TT >= TB[i + 1]) i++;
  const u = EZ.io(clamp((TT - TB[i]) / Math.max(0.5, (i + 1 < TB.length ? TB[i + 1] : DURATION) - TB[i])));
  const push = 0.13 * (i % 2 ? 1 - u : u);
  return { cx: 540 + 30 * Math.sin(TT * 0.29), cy: 960 + 20 * Math.sin(TT * 0.23 + 1), z: (1 + push) * (1 + 0.03 * Math.sin(TT * 0.41)), sx: 0, sy: 0 };
}
function setCam(c) { ctx.setTransform(c.z, 0, 0, c.z, W / 2 + c.sx - c.z * c.cx, H / 2 + c.sy - c.z * c.cy); }
// current running along the major grid lines: short cyan pulses, in screen space with the grid's parallax
function gridPulses(c) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + (c.z - 1) * 0.35, st = 240 * z, ox = -(c.cx - 540) * 0.4 * z, oy = -(c.cy - 960) * 0.4 * z;
  for (let k = 0; k < 9; k++) {
    const R = RNG('gp', k), horiz = k % 2 === 0, line = Math.floor(R.r(0, 8)), sp = R.r(120, 260), ph = R.r(0, 3000);
    const pos = mod(TT * sp + ph, (horiz ? W : H) + 400) - 200;
    const x = horiz ? pos : mod(line * st + ox, W), y = horiz ? mod(line * st + oy, H) : pos;
    const g = ctx.createLinearGradient(horiz ? x - 120 : x, horiz ? y : y - 120, x, y);
    g.addColorStop(0, 'rgba(18,182,232,0)'); g.addColorStop(1, 'rgba(18,182,232,0.55)');
    ctx.strokeStyle = g; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(horiz ? x - 120 : x, horiz ? y : y - 120); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = 'rgba(160,235,255,0.8)'; ctx.fillRect(x - 2, y - 2, 4, 4);
  }
  ctx.restore();
}
function zoomAbout(x, y, z, f) { ctx.save(); ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y); f(); ctx.restore(); }





// =====================================================================
//  parts: the sign, the car, the pump, the driver, the tank in section
// =====================================================================
function sign(x, y, s, a, o = {}) {   // a no-phones sign: rounded square, a phone (or a figure), a slash
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#0d0b2a'; ctx.beginPath(); ctx.roundRect(x - 90 * s, y - 90 * s, 180 * s, 180 * s, 26 * s); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = VA.line; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x - 90 * s, y - 90 * s, 180 * s, 180 * s, 26 * s); ctx.stroke(); ctx.restore();
  if (o.figure) { person(x, y + 55 * s, 0.5 * s, a, { charge: 1 }); }
  else { ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = VA.minus; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x - 26 * s, y - 50 * s, 52 * s, 100 * s, 10 * s); ctx.stroke(); ctx.restore(); }
  if (o.slash) vaGlow([[x - 70 * s, y + 70 * s], [lerp(x - 70 * s, x + 70 * s, o.slash), lerp(y + 70 * s, y - 70 * s, o.slash)]], VA.plus, 6, a, { a });
}
const CAR = { x0: 170, x1: 770, y: 1060 };
function car(a, o = {}) {
  if (a <= 0) return;
  const { x0, x1, y } = CAR;
  const body = [[x0, y], [x0, y - 110], [x0 + 70, y - 130], [x0 + 150, y - 230], [x0 + 400, y - 230], [x0 + 470, y - 130], [x1, y - 115], [x1, y]];
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#16123f'; vaTrace(body, true); ctx.fill(); ctx.restore();
  vaStroke(body, VA.line, 3.5, { a, closed: true });
  const win = [[x0 + 170, y - 140], [x0 + 180, y - 210], [x0 + 390, y - 210], [x0 + 440, y - 140]];
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#0b0a2a'; vaTrace(win, true); ctx.fill(); ctx.restore();
  vaStroke(win, VA.dim, 2.5, { a, closed: true });
  // the seat: glows magenta while clothes rub it
  const seat = [[x0 + 200, y - 140], [x0 + 210, y - 195], [x0 + 235, y - 195], [x0 + 240, y - 150], [x0 + 300, y - 150], [x0 + 300, y - 140]];
  vaStroke(seat, o.seat ? VA.plus : '#3a3480', o.seat ? 4 : 3, { a, closed: true });
  if (o.seat) vaGlow(seat, VA.plus, 3, o.seat * a, { a: a * o.seat });
  vaLine(x0 + 300, y - 140, x0 + 300, y - 20, VA.dim, 2, { a });   // the door seam
  for (const wx of [x0 + 110, x1 - 120]) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#04031a'; ctx.beginPath(); ctx.arc(wx, y, 52, 0, TAU); ctx.fill(); ctx.restore(); vaRing(wx, y, 52, VA.line, 3.5, a); vaRing(wx, y, 18, VA.dim, 2, a); }
  vaRing(x1 - 30, y - 90, 12, o.cap ? VA.amber : VA.line, 3, a);   // the filler cap
}
const PUMP = { x0: 840, x1: 950, y0: 760, y1: 1110 };
function pump(a, o = {}) {
  if (a <= 0) return;
  const { x0, x1, y0, y1 } = PUMP;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#16123f'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.restore();
  vaStroke([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], VA.line, 3.5, { a, closed: true });
  vaStroke([[x0 + 18, y0 + 24], [x1 - 18, y0 + 24], [x1 - 18, y0 + 90], [x0 + 18, y0 + 90]], VA.dim, 2.5, { a, closed: true });
  if (o.on) { const f = mod(TT * 0.07, 1); vaBar(x0 + 26, y0 + 50, (x1 - x0 - 52), 16, f, VA.amber, a * o.on); }
  // the hose to the filler, the nozzle at the cap (or held / pulled)
  const nz = o.nozzle ?? [CAR.x1 - 22, CAR.y - 92];
  const P = []; for (let i = 0; i <= 24; i++) { const u = i / 24; P.push([lerp(x0, nz[0], u), lerp(y0 + 140, nz[1], u) + Math.sin(Math.PI * u) * 90]); }
  vaStroke(P, '#2b2470', 9, { a }); vaStroke(P, VA.line, 2.5, { a });
  vaStroke([[nz[0] + 30, nz[1] - 14], [nz[0], nz[1]], [nz[0] + 4, nz[1] + 10], [nz[0] + 34, nz[1] - 4]], VA.line, 3, { a, closed: true });
  if (o.flow) for (let i = 0; i < 6; i++) { const q = vaAt(P, mod(TT * 0.8 + i / 6, 1)); vaDot(q[0], q[1], 4, VA.amber, a * 0.9); }
}
// the driver: a simple figure; charge 0..1 makes a magenta aura; sit = seated (upper body only)
function person(x, y, s, a, o = {}) {
  if (a <= 0) return;
  const ch = o.charge ?? 0;
  if (ch > 0.05) { const g = ctx.createRadialGradient(x, y - 120 * s, 10, x, y - 120 * s, 160 * s); g.addColorStop(0, `rgba(212,98,242,${0.4 * ch})`); g.addColorStop(1, 'rgba(212,98,242,0)'); ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.fillRect(x - 170 * s, y - 290 * s, 340 * s, 340 * s); ctx.restore(); }
  const c = ch > 0.5 ? VA.plus : VA.line;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = ch > 0.5 ? 'rgba(212,98,242,0.55)' : '#2a2470';
  ctx.beginPath(); ctx.arc(x, y - 205 * s, 24 * s, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.roundRect(x - 26 * s, y - 175 * s, 52 * s, o.sit ? 70 * s : 110 * s, 18 * s); ctx.fill();
  ctx.restore();
  vaRing(x, y - 205 * s, 24 * s, c, 3, a);
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x - 26 * s, y - 175 * s, 52 * s, o.sit ? 70 * s : 110 * s, 18 * s); ctx.stroke(); ctx.restore();
  if (!o.sit) { vaLine(x - 12 * s, y - 68 * s, x - 16 * s, y, c, 4, { a }); vaLine(x + 12 * s, y - 68 * s, x + 16 * s, y, c, 4, { a }); }
  // the arm: down, or reaching out to o.reach [x, y]
  const sh = [x + 20 * s, y - 160 * s], hand = o.reach ?? [x + 30 * s, y - 80 * s];
  vaLine(sh[0], sh[1], hand[0], hand[1], c, 4, { a });
  if (ch > 0.3) for (let i = 0; i < 5; i++) { const R = RNG('pc', i), th = TT * 2 + i * 1.3; vaPlus(x + Math.cos(th) * 60 * s, y - 140 * s + Math.sin(th * 1.3) * 70 * s, 14 * s, a * ch * 0.8); }
  return hand;
}
// the tank in section: body, neck, the ring at the mouth, vapour (rich inside, lean far above)
const TK = { x0: 300, x1: 780, y0: 1080, y1: 1300, nx0: 500, nx1: 580, ny: 720 };
function tank(a, o = {}) {
  if (a <= 0) return;
  const { x0, x1, y0, y1, nx0, nx1, ny } = TK;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#17124a'; ctx.beginPath(); ctx.roundRect(x0, y0, x1 - x0, y1 - y0, 30); ctx.fill(); ctx.fillRect(nx0, ny, nx1 - nx0, y0 - ny + 4); ctx.restore();
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = VA.line; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.roundRect(x0, y0, x1 - x0, y1 - y0, 30); ctx.stroke(); ctx.restore();
  vaLine(nx0, ny, nx0, y0, VA.line, 3.5, { a }); vaLine(nx1, ny, nx1, y0, VA.line, 3.5, { a });
  // vapour: dense in the tank and neck, a thinning plume above the mouth
  for (let i = 0; i < 160; i++) { const R = RNG('vt', i); vaDot(R.r(x0 + 20, x1 - 20), R.r(y0 + 20, y1 - 20) + Math.sin(TT * 2 + i) * 4, 3, VA.amber, a * 0.55); }
  for (let i = 0; i < 40; i++) { const R = RNG('vn', i); vaDot(R.r(nx0 + 8, nx1 - 8), R.r(ny, y0) + Math.sin(TT * 2 + i) * 3, 3, VA.amber, a * 0.6); }
  for (let i = 0; i < 70; i++) { const R = RNG('vp', i), u = mod(R.f() + TT * 0.08, 1), y = ny - u * 480, spread = 30 + u * 260; vaDot(540 + R.r(-1, 1) * spread, y, 3, VA.amber, a * 0.5 * (1 - u)); }
  // the ring at the mouth
  const rk = o.ring ?? 0;
  if (rk > 0) { vaGlow(vaArcPts(540, ny, 70, Math.PI, TAU, 30), VA.plus, 5, rk * a, { a: a * rk }); }
  if (o.fire) {   // the ring alight: an amber arc and tongues of flame
    vaGlow(vaArcPts(540, ny, 70, Math.PI, TAU, 30), VA.amber, 6, o.fire * a, { a });
    for (let i = 0; i < 7; i++) { const th = Math.PI + (i + 0.5) / 7 * Math.PI, bx = 540 + Math.cos(th) * 70, by = ny + Math.sin(th) * 70, h = (30 + 24 * Math.sin(TT * 13 + i * 2)) * o.fire;
      ctx.save(); ctx.globalAlpha *= a * o.fire; ctx.fillStyle = i % 2 ? VA.amber : '#ff7a2a'; ctx.shadowColor = VA.amber; ctx.shadowBlur = 24; ctx.beginPath(); ctx.moveTo(bx - 10, by); ctx.quadraticCurveTo(bx - 12, by - h * 0.6, bx + Math.sin(TT * 9 + i) * 5, by - h); ctx.quadraticCurveTo(bx + 12, by - h * 0.6, bx + 10, by); ctx.closePath(); ctx.fill(); ctx.restore(); }
  }
}

// =====================================================================
//  the beats
// =====================================================================
function beatTitle() {
  const a = fadeOut(VW('sign', 'every') - 0.1, 0.3);
  if (a <= 0) return;
  OV(() => {
    vaText('Why is there a no-phones sign', CXT, 320, 58, VA.cream, { align: 'center', serif: true, a, frac: vaType(VL('title').t0, 'Why is there a no-phones sign', 28), glow: 8 });
    vaText('at every gas station?', CXT, 400, 64, VA.amber, { align: 'center', serif: true, italic: true, a, frac: vaType(VW('title', 'every') - 0.05, 'at every gas station?', 22), glow: 16 });
  });
  sign(540, 820, 1.6, a * fadeIn(0.4, 0.4), { slash: EZ.o3(clamp((TT - VW('title', 'sign')) / 0.5)) });
}
function stageSign() {   // sign .. lab: the phone is cleared
  const a = BW('sign', 'lab');
  if (a <= 0) return;
  const tSus = VW('sign', 'suspect') - 0.2, tC = VW('cases', 'two') - 0.3, tP = VW('cases', 'phone') - 0.2, tL = VW('lab', 'phone') - 0.2;
  const sa = a * fadeOut(SUB('suspect') + 0.1, 0.3);
  sign(540, 820, 1.6, sa, { slash: 1 });
  cap('the wrong suspect', 1380, tSus, VA.plus, 60, { a: sa, italic: true });
  // ≈200 fires: a grid of dots; phones: 0
  const ga = fadeIn(tC, 0.3) * a * fadeOut(SUB('lab') + 0.1, 0.3);
  if (ga > 0) {
    for (let i = 0; i < 196; i++) { const c = i % 14, r = Math.floor(i / 14), k = popS(tC + i * 0.006); vaDot(330 + c * 32, 560 + r * 32, 6 * k, VA.amber, ga * 0.85); }
    OV(() => vaText('≈ 200 fires', CXT, 470, 72, VA.cream, { align: 'center', serif: true, a: ga, glow: 10 }));
    const pa = fadeIn(tP, 0.3) * ga;
    if (pa > 0) { sign(420, 1180, 0.6, pa); OV(() => vaText('0 phones', 640, 1205, 64, VA.minus, { align: 'center', serif: true, a: pa, glow: 14 })); }
  }
  // the lab: a phone in a cloud of vapour, nothing
  const la = fadeIn(SUB('lab') + 0.2, 0.3) * a;
  if (la > 0) {
    for (let i = 0; i < 120; i++) { const R = RNG('lb', i), r = R.r(60, 260), th = R.r(0, TAU) + TT * 0.2; vaDot(540 + Math.cos(th) * r, 900 + Math.sin(th) * r * 0.8, 3.5, VA.amber, la * 0.6); }
    sign(540, 900, 0.9, la);
    cap("a perfect vapor cloud: nothing", 1380, tL, VA.minus, 46, { a: la, italic: true });
  }
}
// the car scene: pattern, charge, before, advice, touch
function stageCar() {
  const a = Math.max(BW('suspect'), BW('pattern', 'charge'), BW('before', 'touch'));
  if (a <= 0) return;
  const tSeat = VW('suspect', 'seat') - 0.2, tBack = VW('pattern', 'back') - 0.2, tRub = VW('charge', 'clothes') - 0.2, tStep = VW('charge', 'step') - 0.2;
  const inSus = TT < SUB('pattern'), inBefore = TT >= SUB('before') && TT < SUB('advice'), inAdvice = TT >= SUB('advice') && TT < SUB('touch'), inTouch = TT >= SUB('touch');
  // where the driver is, sitting or standing, charged or not
  let px = 800, sit = false, charge = 0, reach = null;
  if (!inSus && TT < SUB('tank')) {
    px = TT < tBack ? 800 : TT < tStep ? lerp(800, 400, EZ.io(clamp((TT - tBack) / 0.8))) : 400;
    sit = TT >= tBack + 0.8 && TT < tStep;
    charge = TT >= tRub ? EZ.io(clamp((TT - tRub) / 1.5)) : 0;
  }
  if (inBefore) { const tC = VW('before', 'cap') - 0.6; px = lerp(400, 700, EZ.io(clamp((TT - VW('before', 'stepped') + 0.2) / 1.0))); charge = TT < tC + 0.5 ? 1 : 0.1; if (TT > tC - 0.6) reach = [CAR.x1 - 30, CAR.y - 92]; }
  if (inAdvice) { sit = TT < VW('advice', 'stretch') - 0.2; px = 400; }
  if (inTouch) { px = 380; const tT = VW('touch', 'touch') - 0.2; charge = TT < tT + 0.6 ? 1 : 0; if (TT > tT - 0.4) reach = [CAR.x0 + 300, CAR.y - 100]; }
  car(a, { seat: TT >= tSeat && TT < SUB('cases') ? 1 : TT >= tRub && TT < tStep ? 0.7 + 0.3 * Math.sin(TT * 9) : 0, cap: inBefore });
  pump(a, { flow: !inBefore, on: 1, lit: mod(TT * 0.7, 40) });
  const pa = sit ? a * 0.9 : a;
  if (sit) person(px + 40, CAR.y - 140, 0.55, pa, { sit: true, charge }); else person(px, CAR.y + 50, 1, pa, { charge, reach });
  // sparks: seat rub, the cap (before), the door (touch)
  if (TT >= tRub && TT < tStep) for (let i = 0; i < 6; i++) { const R = RNG('rub', i, Math.floor(TT * 8)); vaPlus(CAR.x0 + R.r(200, 300), CAR.y - R.r(140, 200), 14, a); vaMinus(CAR.x0 + R.r(200, 300), CAR.y - R.r(140, 200), 14, a); }
  const sp = (t, p, c) => { const k = flashK(t, 0.5); if (k > 0.02) { vaGlow([[p[0] - 30, p[1] - 10], [p[0] - 14, p[1] + 6], [p[0] - 6, p[1] - 4], [p[0], p[1]]], c, 3, k * a); vaRing(p[0], p[1], 10 + 40 * (1 - k), c, 2, a * k); } };
  if (inBefore) sp(VW('before', 'cap') - 0.1, [CAR.x1 - 30, CAR.y - 92], VA.amber);
  if (inTouch) sp(VW('touch', 'door') - 0.1, [CAR.x0 + 300, CAR.y - 100], VA.minus);
  // the voltage readout
  const vv = Math.round(charge * 8000 / 100) * 100;
  const va = a * (TT >= tRub && TT < SUB('tank') ? 1 : inBefore ? fadeIn(SUB('before') + 0.35, 0.3) : inTouch ? 1 : 0);
  if (va > 0) OV(() => { vaText(vv.toLocaleString('en-US') + ' V', CXT, 470, 96, vv > 1000 ? VA.plus : VA.minus, { align: 'center', serif: true, a: va, glow: 14 }); vaText('your body', CXT, 530, 32, VA.text, { align: 'center', a: va }); });
  // advice: inside while filling ✗, then ✓
  if (inAdvice) {
    const tX = VW('advice', 'while') - 0.2;
    if (TT > tX && sit) { const k = popS(tX); vaGlow([[CAR.x0 + 190, CAR.y - 215], [CAR.x0 + 290, CAR.y - 130]], VA.red, 5, k * a); vaGlow([[CAR.x0 + 290, CAR.y - 215], [CAR.x0 + 190, CAR.y - 130]], VA.red, 5, k * a); }
  }
  // captions
  cap('it\'s in your car seat', 1380, tSeat, VA.plus, 56, { a: a * fadeOut(SUB('cases'), 0.3), italic: true });
  cap('back in the car while it fills', 1380, tBack, VA.text, 48, { a: a * fadeOut(SUB('charge'), 0.3), italic: true });
  cap('clothes rub, charges separate', 1380, tRub, VA.plus, 50, { a: a * fadeOut(tStep, 0.3), italic: true });
  cap('several thousand volts', 1380, VW('charge', 'thousand') - 0.4, VA.plus, 56, { a: a * fadeOut(SUB('tank'), 0.3), italic: true });
  cap('before fueling even started', 1380, VW('before', 'before') - 0.2, VA.amber, 50, { a: a * fadeOut(SUB('advice'), 0.3), italic: true });
  cap("don't get back in while it fills", 1380, VW('advice', 'while') - 0.2, VA.red, 46, { a: a * fadeOut(SUB('touch'), 0.3), italic: true });
  cap('touch the door first, away from the tank', 1380, VW('touch', 'touch') - 0.2, VA.minus, 40, { a, italic: true });
}
// the tank: rich inside, burns only at the ring; the spark; the fire
function stageTank() {
  const a = Math.max(BW('tank', 'energy'), BW('fire', 'nozzle'));
  if (a <= 0) return;
  const tR = VW('tank', 'rich') - 0.2, tRing = VW('ring', 'ring') - 0.2, tReach = VW('arc', 'reach') - 0.2, tB = VW('arc', 'breaks') - 0.2;
  const inFire = TT >= SUB('fire');
  const fireK = TT >= HIT && TT < SUB('before') ? Math.min(1, flashK(HIT, 3) + 0.6) : inFire ? 1 : 0;
  const shrink = TT >= SUB('energy') && TT < SUB('fire') ? EZ.io(clamp((TT - SUB('energy')) / 0.6)) : 0;
  ctx.save(); if (shrink > 0) { const z = 1 - 0.4 * shrink; ctx.translate(540, 1330); ctx.scale(z, z); ctx.translate(-540, -1330); }
  tank(a, { ring: TT >= tRing && TT < HIT ? 0.8 + 0.2 * Math.sin(TT * 5) : 0, fire: fireK });
  ctx.restore();
  label('too rich', 540, 1200, VA.amber, 36, a * fadeIn(tR, 0.3) * (inFire ? 0 : 1) * (1 - shrink));
  label('too lean', 540, 300, VA.text, 32, a * fadeIn(VW('tank', 'vapor') - 0.2, 0.3) * (inFire ? 0 : 1) * (1 - shrink));
  label('just right: the ring', 540, 620, VA.plus, 36, a * fadeIn(tRing, 0.3) * fadeOut(HIT, 0.3));
  // the hand and the nozzle coming in from the right; the arc jumps before contact
  const na = fadeIn(tReach, 0.3) * a;
  const pulled = inFire && TT >= VW('nozzle', 'pull') - 0.2 ? EZ.io(clamp((TT - VW('nozzle', 'pull') + 0.2) / 0.8)) : 0;
  if ((na > 0 || inFire) && shrink < 0.5) {
    const nx = (inFire ? 600 : lerp(900, 640, EZ.io(clamp((TT - tReach) / 1.6)))) + pulled * 260, ny = (inFire ? 700 : 690) - pulled * 160;
    vaStroke([[nx, ny], [nx + 70, ny - 40], [nx + 320, ny - 120]], '#2b2470', 10, { a: Math.max(na, inFire ? a : 0) }); vaStroke([[nx, ny], [nx + 70, ny - 40], [nx + 320, ny - 120]], VA.line, 3, { a: Math.max(na, inFire ? a : 0) });
    if (!inFire) { vaDot(nx + 110, ny - 20, 22, 'rgba(212,98,242,0.55)', na); vaRing(nx + 110, ny - 20, 22, VA.plus, 3, na); }   // the charged hand
    if (inFire && pulled > 0.1) for (let i = 0; i < 6; i++) { const u = i / 6 * pulled; const x = lerp(600, nx, u), y = lerp(700, ny, u); ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = VA.amber; ctx.shadowColor = VA.amber; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(x, y - 20 * Math.sin(TT * 10 + i), 14 + 6 * Math.sin(TT * 12 + i), 0, TAU); ctx.fill(); ctx.restore(); }
  }
  // the spark at "breaks": a white-hot zigzag from the nozzle to the ring
  const sk = TT >= tB && TT < HIT + 0.3 ? 0.6 + 0.4 * Math.sin(TT * 40) : 0;
  if (sk > 0) vaGlow([[650, 680], [628, 700], [640, 708], [612, 716], [606, 722]], VA.cream, 4, sk * a, { core: '#ffffff' });
  cap('inside, nothing can burn', 400, VW('tank', 'nothing') - 0.2, VA.amber, 48, { a: a * fadeOut(SUB('ring'), 0.3), italic: true });
  cap('only the ring burns', 400, tRing, VA.plus, 56, { a: a * fadeOut(SUB('arc'), 0.3), italic: true });
  cap('the air breaks down', 400, tB, VA.cream, 56, { a: a * fadeOut(HIT - 0.1, 0.25), italic: true });
  cap("don't pull the nozzle", 400, VW('fire', "don't") - 0.2, VA.red, 56, { a: a * fadeOut(SUB('nozzle'), 0.3), italic: true });
  cap('step away · cut the pump', 1440, VW('fire', 'step') - 0.2, VA.text, 46, { a: a * fadeOut(SUB('nozzle'), 0.3), italic: true });
  cap('nozzle in: the flame stays put', 400, VW('nozzle', 'flame') - 0.2, VA.amber, 46, { a: a * fadeOut(VW('nozzle', 'pull') - 0.3, 0.25), italic: true });
  cap('pull it out: you spread it', 400, VW('nozzle', 'pull') - 0.2, VA.red, 50, { a, italic: true });
}
// energy: 0.25 mJ needed; ×4 the spark you feel; ×20 on a dry day
function stageEnergy() {
  const a = BW('energy');
  if (a <= 0) return;
  const t1 = VW('energy', 'quarter') - 0.2, t2 = VW('energy', 'four') - 0.3, t3 = VW('energy', 'twenty') - 0.3;
  const blocks = (n, y, t0, c) => { for (let i = 0; i < n; i++) { const k = popS(t0 + i * 0.04); if (k <= 0) continue; const col = i % 10, row = Math.floor(i / 10); ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 14; const s = 40 * k; const x0 = 540 - Math.min(n, 10) * 24 + 4; ctx.fillRect(x0 + col * 48 + (40 - s) / 2, y + row * 48 + (40 - s) / 2, s, s); ctx.restore(); } };
  label('to ignite: 0.25 mJ', CXT, 420, VA.plus, 38, a * fadeIn(t1, 0.3)); blocks(1, 445, t1, VA.plus);
  label('the spark you feel: ×4', CXT, 560, VA.amber, 38, a * fadeIn(t2, 0.3)); blocks(4, 585, t2, VA.amber);
  label('a dry day: ×20', CXT, 700, VA.amber, 38, a * fadeIn(t3, 0.3)); blocks(20, 725, t3, '#ffcf6a');
}
// gas cans: on the ground ✓, in a truck bed on plastic ✗
function stageCans() {
  const a = BW('cans');
  if (a <= 0) return;
  const can = (x, y, ok, k) => {
    const P = [[x - 70, y], [x - 70, y - 160], [x - 30, y - 200], [x + 70, y - 200], [x + 70, y]];
    ctx.save(); ctx.globalAlpha *= a * k; ctx.fillStyle = '#5a1a2a'; vaTrace(P, true); ctx.fill(); ctx.restore();
    vaStroke(P, VA.line, 3, { a: a * k, closed: true }); vaStroke([[x + 20, y - 200], [x + 40, y - 240], [x + 60, y - 240]], VA.line, 4, { a: a * k });
    if (!ok) for (let i = 0; i < 6; i++) { const th = TT * 2 + i; vaPlus(x + Math.cos(th) * 100, y - 100 + Math.sin(th) * 80, 16, a * k); }
  };
  const t1 = VW('cans', 'ground') - 0.2, t2 = VW('cans', 'bed') - 0.2;
  vaLine(120, 1100, 480, 1100, VA.line, 3, { a }); for (let x = 120; x < 480; x += 30) vaLine(x, 1110, x - 14, 1126, VA.dim, 2, { a });
  can(300, 1100, true, fadeIn(t1, 0.3)); label('✓ on the ground', 300, 1180, '#6ee7a8', 34, a * fadeIn(t1, 0.3));
  const bk = fadeIn(t2, 0.3);
  vaStroke([[580, 1100], [960, 1100], [960, 1020], [580, 1020]], VA.dim, 3, { a: a * bk }); vaLine(600, 1094, 940, 1094, '#5a50b8', 8, { a: a * bk });
  can(770, 1094, false, bk); label('✗ bed liner', 770, 1180, VA.red, 34, a * bk);
  cap('the charge has nowhere to go', 1380, VW('cans', 'plastic') - 0.2, VA.plus, 48, { a, italic: true });
}
// rare: a sea of fill-ups with a couple hundred fires
function stageRare() {
  const a = BW('rare');
  if (a <= 0) return;
  for (let i = 0; i < 900; i++) { const R = RNG('rr', i), x = R.r(80, 1000), y = R.r(560, 1260); vaDot(x, y, 2.5, i % 140 === 0 ? VA.amber : VA.dim, a * (i % 140 === 0 ? 1 : 0.6)); }
  cap('≈ 200 fires · billions of fill-ups', 470, VW('rare', 'billions') - 0.4, VA.cream, 46, { a, italic: true });
  cap('two minutes outside costs nothing', 1380, VW('rare', 'two') - 0.3, VA.minus, 50, { a, italic: true });
}
function beatEnd() {
  const a = TT >= SUB('end') ? fadeIn(SUB('end'), 0.3) : 0;
  if (a <= 0) return;
  const m = EZ.io(clamp((TT - VW('end', 'suspect') + 0.2) / 0.6));
  sign(540, 880, 1.6, a * (1 - m), { slash: 1 });
  sign(540, 880, 1.6, a * m, { slash: 1, figure: true });
  OV(() => {
    const t1 = VW('end', 'sign') - 0.3;
    vaText('That sign should change', CXT, 330, 64, VA.cream, { align: 'center', serif: true, a: fadeIn(t1, 0.3), frac: vaType(t1, 'That sign should change', 26), glow: 8 });
    vaText('its suspect.', CXT, 420, 76, VA.plus, { align: 'center', serif: true, italic: true, a: fadeIn(VW('end', 'suspect') - 0.2, 0.3), frac: vaType(VW('end', 'suspect') - 0.2, 'its suspect.', 18), glow: 18 });
    const na = fadeIn(VL('end').t1 + 0.2, 0.5);
    if (na > 0) {
      ctx.save(); ctx.font = `700 46px ${VMONO}`; const wB = ctx.measureText('Bit').width, wV = ctx.measureText('volts').width; ctx.restore();
      const x0 = CXT - (wB + wV) / 2;
      vaText('Bit', x0, 1475, 46, VA.minus, { weight: 700, a: na, glow: 12 }); vaText('volts', x0 + wB, 1475, 46, VA.plus, { weight: 700, a: na, glow: 12 });
    }
  });
}

// =====================================================================
//  the stage
// =====================================================================
function sceneStage() {
  const c = camAtT(); CAMZ = c.z;
  const fire = TT >= HIT && TT < SUB('before') ? Math.max(0.35, flashK(HIT, 1.4)) * 0.8 : TT >= SUB('fire') && TT < SUB('cans') ? 0.4 : 0;
  vaBg(fire);
  vaGridBg(c);
  gridPulses(c);
  vaSpecks(40, 0.3);
  setCam(c);
  stageSign(); stageCar(); stageTank(); stageEnergy(); stageCans(); stageRare(); beatTitle(); beatEnd();
}
