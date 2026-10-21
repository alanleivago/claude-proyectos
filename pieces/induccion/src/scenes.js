// =====================================================================
//  SCENES — Why doesn't an induction stove burn your hand? (voltamps). World 1080x1920, TT on 1s.
//  cyan = current (coil, eddy currents), magenta = the magnetic field, amber = heat, cream = big numbers.
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
//  the cooktop, the coil, the field, the pan, the hand
// =====================================================================
const HOB = { top: 780, bot: 1230, tl: 290, tr: 790, bl: 170, br: 910 }, ZC = [540, 1005], KY = 0.4;
function hob(a, o = {}) {
  if (a <= 0) return;
  const P = [[HOB.bl, HOB.bot], [HOB.br, HOB.bot], [HOB.tr, HOB.top], [HOB.tl, HOB.top]];
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = o.see ? 'rgba(18,14,54,0.55)' : '#120e36'; vaTrace(P, true); ctx.fill();
  if (o.warm) { const g = ctx.createRadialGradient(ZC[0], ZC[1] - 20, 20, ZC[0], ZC[1] - 20, 300); g.addColorStop(0, `rgba(255,170,60,${0.45 * o.warm})`); g.addColorStop(1, 'rgba(255,170,60,0)'); ctx.fillStyle = g; vaTrace(P, true); ctx.fill(); }
  ctx.restore();
  vaStroke(P, o.edge ?? VA.line, o.edgeW ?? 3, { a, closed: true });
  ctx.save(); ctx.globalAlpha *= a * 0.6; ctx.strokeStyle = VA.dim; ctx.lineWidth = 2; ctx.setLineDash([8, 10]); ctx.beginPath(); ctx.ellipse(ZC[0], ZC[1], 230, 230 * KY, 0, 0, TAU); ctx.stroke(); ctx.restore();
  if (o.H) { vaStroke([[220, 1180], [270, 1180], [266, 1150], [224, 1150]], VA.amber, 2.5, { a: a * o.H, closed: true }); vaText('H', 245, 1176, 26, VA.amber, { align: 'center', a: a * o.H * (0.6 + 0.4 * Math.sin(TT * 4)) }); }
}
const COIL = (() => { const P = []; for (let i = 0; i <= 420; i++) { const u = i / 420, th = u * TAU * 6, r = 34 + 180 * u; P.push([ZC[0] + r * Math.cos(th), ZC[1] + KY * r * Math.sin(th)]); } return P; })();
const ACF = 1.3;   // the visible flip rate (a stand-in for tens of thousands per second)
function coil(a, k = 1, o = {}) {
  if (a <= 0) return;
  const P = vaPart(COIL, o.draw ?? 1);
  if (k > 0.05) vaGlow(P, o.hot ? VA.amber : VA.minus, 3, k * a, { a }); else vaStroke(P, '#245a7a', 3, { a });
  // alternating current: pulses that slide forward and back along the spiral
  if (o.pulses) for (let j = 0; j < 10; j++) { const base = j / 10, p = base + 0.035 * Math.sin(TT * TAU * ACF); const q = vaAt(COIL, mod(p, 1)); vaDot(q[0], q[1], 6, VA.cream, a * o.pulses); }
}
function field(a, o = {}) {
  if (a <= 0) return;
  const ph = Math.sin(TT * TAU * ACF), dir = ph >= 0 ? 1 : -1, k = 0.45 + 0.55 * Math.abs(ph);
  for (const d of [80, 150, 230]) for (const side of [-1, 1]) {
    const cx = ZC[0] + side * d, P = vaArcPts(cx, ZC[1], 1, 0, TAU, 60).map(([x, y]) => [cx + (x - cx) * d, ZC[1] + (y - ZC[1]) * (o.h ?? 300) * (d / 230) ** 0.4]);
    vaGlow(P, VA.plus, 2.2, 0.5 * k * a, { a: a * k * (o.dim ?? 1) });
    // an arrow at the top of each loop, pointing with the current direction
    const tx = cx, ty = ZC[1] - (o.h ?? 300) * (d / 230) ** 0.4;
    vaArrow(tx - 14 * dir * side, ty, tx + 14 * dir * side, ty, VA.plus, 2.5, a * k * (o.dim ?? 1), 10);
  }
}
function ivSteam(x, y, k, n = 5, h = 200, w = 40) {
  if (k <= 0) return;
  for (let i = 0; i < n; i++) {
    const R = RNG('stm', i, x), u = mod(TT * 0.5 + R.f(), 1), bx = x + (i - (n - 1) / 2) * w;
    const P = []; for (let j = 0; j <= 14; j++) { const v = j / 14; P.push([bx + Math.sin(v * 9 + TT * 4 + i) * 9, y - u * 50 - v * h * 0.6]); }
    vaStroke(P, VA.amber, 3, { a: k * 0.75 * Math.sin(Math.PI * u) });
  }
}
// the pan: walls with vertical lines, an elliptical base; heat 0..1 lights the base from inside; see = x-ray base
function pan(a, heat = 0, o = {}) {
  if (a <= 0) return;
  const by = (o.y ?? 960), ty = by - 70, rxB = 210, ryB = 80, rxT = 232, ryT = 90;
  ctx.save(); ctx.globalAlpha *= a;
  // handle
  vaStroke([[ZC[0] - rxT, ty + 4], [150, ty - 14]], VA.line, 7);
  vaStroke([[ZC[0] - rxT, ty + 4], [150, ty - 14]], '#120e36', 3);
  // base
  ctx.fillStyle = o.see ? 'rgba(42,36,112,0.35)' : '#2a2470'; ctx.beginPath(); ctx.ellipse(ZC[0], by, rxB, ryB, 0, 0, TAU); ctx.fill();
  if (heat > 0) {
    const g = ctx.createRadialGradient(ZC[0], by, 10, ZC[0], by, rxB); g.addColorStop(0, `rgba(255,200,90,${0.95 * heat})`); g.addColorStop(1, `rgba(220,120,30,${0.7 * heat})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(ZC[0], by, rxB, ryB, 0, 0, TAU); ctx.fill();
    if (o.bloom) { const b = ctx.createRadialGradient(ZC[0], by, 40, ZC[0], by, 520 * o.bloom); b.addColorStop(0, `rgba(255,190,80,${0.5 * heat})`); b.addColorStop(1, 'rgba(255,190,80,0)'); ctx.fillStyle = b; ctx.fillRect(0, by - 600, W, 1200); }
  }
  ctx.restore();
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = VA.line; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(ZC[0], by, rxB, ryB, 0, 0, TAU); ctx.stroke(); ctx.restore();
  // walls: vertical strokes on the front half, the two rims
  for (let i = 0; i <= 18; i++) { const th = Math.PI * i / 18, xb = ZC[0] + rxB * Math.cos(th), yb = by + ryB * Math.sin(th), xt = ZC[0] + rxT * Math.cos(th), yt = ty + ryT * Math.sin(th); vaLine(xb, yb, xt, yt, VA.line, 1.5, { a: a * 0.6 }); }
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = VA.line; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(ZC[0], ty, rxT, ryT, 0, 0, TAU); ctx.stroke(); ctx.restore();
  vaLine(ZC[0] - rxB, by, ZC[0] - rxT, ty, VA.line, 3, { a }); vaLine(ZC[0] + rxB, by, ZC[0] + rxT, ty, VA.line, 3, { a });
  if (heat > 0.2) ivSteam(ZC[0], ty - 30, heat * a, 5, 220, 44);
}
// eddy currents: concentric loops in the pan's base, dots running round (direction flips with the field)
function eddy(a, by = 960) {
  if (a <= 0) return;
  const dir = Math.sin(TT * TAU * ACF) >= 0 ? 1 : -1;
  for (const [r, n] of [[60, 5], [110, 8], [165, 11]]) {
    ctx.save(); ctx.globalAlpha *= a * 0.9; ctx.strokeStyle = VA.minus; ctx.lineWidth = 2.5; ctx.shadowColor = VA.minus; ctx.shadowBlur = 12; ctx.beginPath(); ctx.ellipse(ZC[0], by, r, r * 0.38, 0, 0, TAU); ctx.stroke(); ctx.restore();
    for (let i = 0; i < n; i++) { const th = i / n * TAU + dir * TT * 2.2 * (110 / r); vaDot(ZC[0] + r * Math.cos(th), by + r * 0.38 * Math.sin(th), 5, VA.cream, a); }
  }
}
function ivHand(x, y, s, a, warm = 0) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.lineWidth = 3; ctx.strokeStyle = VA.line; ctx.fillStyle = warm ? `rgba(255,170,60,${0.6 * warm})` : VA.fill2;
  const rr = (x0, y0, w, h, r, rot = 0) => { ctx.save(); ctx.translate(x0, y0); ctx.rotate(rot); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, r); ctx.fill(); ctx.stroke(); ctx.restore(); };
  [[-36, -88, 78], [-12, -100, 96], [12, -96, 90], [36, -82, 72]].forEach(([dx, dy, h]) => rr(x + dx * s, y + dy * s, 22 * s, h * s, 11 * s));
  rr(x - 62 * s, y - 2 * s, 22 * s, 70 * s, 11 * s, -0.7);
  rr(x, y + 10 * s, 100 * s, 110 * s, 28 * s);
  ctx.restore();
}

// =====================================================================
//  the beats
// =====================================================================
function beatTitle() {
  const a = fadeOut(VW('hand', 'put') - 0.1, 0.3);
  if (a <= 0) return;
  OV(() => {
    vaText("Why doesn't an induction", CXT, 300, 66, VA.cream, { align: 'center', serif: true, a, frac: vaType(VL('title').t0, "Why doesn't an induction", 26), glow: 8 });
    vaText('stove burn your hand?', CXT, 386, 66, VA.amber, { align: 'center', serif: true, italic: true, a, frac: vaType(VW('title', 'stove') - 0.05, 'stove burn your hand?', 22), glow: 16 });
  });
}
function stage() {   // the cooktop stage: title .. is, then detect .. end
  const a = Math.max(BW('title', 'is'), BW('detect', 'end'));
  if (a <= 0) return 0;
  const tCoil = SUB('coil'), see = TT >= tCoil && TT < SUB('skin');
  const coilOn = TT >= VW('hand', 'switched') - 0.1 && !(TT >= SUB('detect') && TT < VW('detect', 'detects') + 0.6);
  const H = TT >= VW('contact', 'leftover') - 0.2 ? fadeIn(VW('contact', 'leftover') - 0.2, 0.3) : 0;
  const glassWarm = TT >= VW('contact', 'later') ? EZ.io(clamp((TT - VW('contact', 'later')) / 2.0)) : 0;
  hob(a, { see, H, warm: glassWarm, edge: TT >= SUB('glass') && TT < SUB('eddy') ? VA.plus : VA.line, edgeW: TT >= SUB('glass') && TT < SUB('eddy') ? 4 : 3 });
  // the coil: hidden under opaque glass until "Underneath"; drawn on, then pulsing with the current
  const ca = see ? 1 : TT >= SUB('detect') ? 0.35 : 0.12;
  coil(a * ca, coilOn ? (see ? 1 : 0.6) : 0, { draw: TT < tCoil ? 1 : EZ.io(clamp((TT - tCoil - 0.2) / 1.2)), pulses: TT >= VW('ac', 'alternating') - 0.1 && see ? 1 : 0 });
  // the field: from "magnetic field" until the pan's lesson ends; faint with the pan back on
  const fa = (see ? fadeIn(VW('field', 'magnetic') - 0.1, 0.4) : 0) + (TT >= SUB('contact') && TT < HIT ? 0.25 : 0);
  field(a * fa, { dim: TT >= SUB('eddy') && see ? 0.45 : 1 });
  // the hand (title .. hand), cold
  const ha = a * fadeIn(0.6, 0.4) * fadeOut(VW('pan', 'iron') - 0.2, 0.3);
  ivHand(540, 1000, 1.25, ha);
  // the pan: drops in on "iron pan", heats within seconds; x-ray during the coil lesson; back for detect..end
  const pIn = VW('pan', 'iron') - 0.1;
  const panA = a * (TT < tCoil ? fadeIn(pIn, 0.3) * fadeOut(tCoil - 0.2, 0.3) : TT < SUB('skin') ? fadeIn(VW('eddy', 'bottom') - 0.2, 0.4) : TT >= SUB('contact') ? fadeIn(SUB('contact'), 0.4) : 0);
  const panY = TT < tCoil ? springMove(pIn, 760, 960, SPRING.heavy) : 960;
  let heat = TT < tCoil ? EZ.io(clamp((TT - VW('pan', 'seconds')) / 1.4)) : TT < SUB('skin') ? EZ.io(clamp((TT - VW('resist', 'heat') + 0.2) / 1.2)) : TT >= SUB('contact') ? 0.9 : 0;
  const bloom = TT >= HIT ? EZ.o3(clamp((TT - HIT) / 0.8)) : 0;
  if (TT >= HIT) heat = 1;
  pan(panA, heat, { y: panY, see: see && TT < VW('resist', 'heat'), bloom });
  if (see) eddy(panA * fadeIn(VW('eddy', 'circles') - 0.3, 0.4), 960);
  // the knife: lying on the glass, its blade warming from the field
  const ka = a * fadeIn(VW('knife', 'knife') - 0.2, 0.3) * fadeOut(HIT, 0.3);
  if (ka > 0) {
    const kw = EZ.io(clamp((TT - VW('knife', 'heats')) / 1.5));
    const blade = [[620, 1130], [880, 1080], [890, 1094], [640, 1150]];
    ctx.save(); ctx.globalAlpha *= ka; ctx.fillStyle = kw > 0.05 ? `rgba(255,170,60,${0.3 + 0.6 * kw})` : '#3a3480'; vaTrace(blade, true); ctx.fill(); ctx.restore();
    vaStroke(blade, VA.line, 2.5, { a: ka, closed: true });
    vaStroke([[890, 1087], [990, 1068]], VA.line, 9, { a: ka }); vaStroke([[890, 1087], [990, 1068]], '#120e36', 4, { a: ka });
  }
  return heat;
}
function captionsStage() {
  cap("it's cold.", 1420, VW('hand', 'cold') - 0.1, VA.minus, 60, { a: fadeOut(VW('pan', 'iron') - 0.2, 0.3), italic: true });
  cap("seconds later: too hot to touch", 1420, VW('pan', 'seconds') + 0.4, VA.amber, 46, { a: fadeOut(SUB('nothing') + 0.2, 0.3), italic: true });
  cap('under the glass: nothing hot', 1420, VW('nothing', 'nothing') - 0.1, VA.text, 50, { a: fadeOut(SUB('coil') + 0.3, 0.3), italic: true });
  cap('a copper coil', 1420, VW('coil', 'copper') - 0.1, VA.minus, 56, { a: fadeOut(SUB('ac'), 0.3), italic: true });
  cap('tens of thousands of flips a second', 1420, VW('ac', 'tens') - 0.1, VA.cream, 44, { a: fadeOut(SUB('field'), 0.3), italic: true });
  OV(() => { const a = fadeIn(VW('ac', 'hear') - 0.2, 0.3) * fadeOut(SUB('field'), 0.3); if (a > 0) vaText('above 20 kHz: too high to hear', CXT, 1480, 32, VA.text, { align: 'center', a }); });
  cap('a magnetic field, flipping', 1420, VW('field', 'magnetic') - 0.1, VA.plus, 50, { a: fadeOut(SUB('glass'), 0.3), italic: true });
  cap("glass: doesn't conduct, isn't magnetic", 1420, VW('glass', 'conduct') - 0.3, VA.text, 42, { a: fadeOut(SUB('eddy'), 0.3), italic: true });
  cap('eddy currents', 1420, VW('eddy', 'eddy') - 0.1, VA.minus, 60, { a: fadeOut(SUB('resist'), 0.3), italic: true });
  cap('that resistance is heat', 1420, VW('resist', 'resistance') - 0.1, VA.amber, 54, { a: fadeOut(SUB('is'), 0.3), italic: true });
  cap('the pan IS the resistance', 1420, VW('is', 'pan', 2) - 0.2, VA.amber, 56, { a: fadeOut(SUB('skin') - 0.1, 0.3) });
  cap('no pot, no power', 1420, VW('detect', 'switch') - 0.1, VA.text, 54, { a: fadeOut(SUB('contact'), 0.3), italic: true });
  cap('the glass: hot later, by contact', 1420, VW('contact', 'later') - 0.1, VA.amber, 44, { a: fadeOut(SUB('knife'), 0.3), italic: true });
  cap('materials, not objects', 1420, VW('knife', 'materials') - 0.2, VA.cream, 56, { a: fadeOut(HIT - 0.1, 0.3), italic: true });
}
// skin effect: iron and aluminium in section; the magnet test
function beatSkin() {
  const a = BW('skin', 'magnet');
  if (a <= 0) return;
  const tI = VW('iron', 'iron') - 0.2, tA = VW('alu', 'aluminum') - 0.2, tM = VW('magnet', 'magnet') - 0.3;
  const bar = (y, name, mu, th, c, k, hot) => {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= a * k; ctx.fillStyle = hot ? `rgba(220,130,40,${0.25 + 0.45 * hot})` : '#1a1548'; ctx.fillRect(240, y, 600, 80); ctx.restore();
    vaStroke([[240, y], [840, y], [840, y + 80], [240, y + 80]], VA.line, 3, { a: a * k, closed: true });
    // the current layer at the surface facing the coil (the bottom), with charge flowing along it
    ctx.save(); ctx.globalAlpha *= a * k; ctx.fillStyle = VA.minus; ctx.shadowColor = VA.minus; ctx.shadowBlur = 16; ctx.fillRect(240, y + 80 - th, 600, th); ctx.restore();
    for (let i = 0; i < 12; i++) { const u = mod(TT * 0.35 + i / 12, 1); vaDot(lerp(250, 830, u), y + 80 - th / 2, Math.min(5, th / 2 + 1.5), VA.cream, a * k * 0.9); }
    vaText(name, 240, y - 18, 32, VA.text, { a: a * k });
    vaText(mu, 840, y - 18, 30, c, { align: 'right', a: a * k });
    if (hot) ivSteam(540, y - 40, hot * a * k, 7, 120, 70);
  };
  // a coil hint below both, so "the surface" reads as the side facing the field
  vaStroke([[240, 1330], [840, 1330]], VA.minus, 2, { a: a * 0.4, dash: [6, 8] }); label('coil side', 540, 1370, VA.minus, 28, a * 0.5);
  const ih = TT > tI + 0.6 ? EZ.io(clamp((TT - tI - 0.6) / 1.2)) : 0;
  bar(820, 'iron', '~0.1 mm', 7, VA.amber, fadeIn(SUB('skin') + 0.3, 0.4), ih);
  bar(1110, 'aluminum', '~0.5 mm', 34, VA.minus, fadeIn(tA, 0.4), 0);
  cap('current crowds at the surface', 400, VW('skin', 'crowds') - 0.2, VA.minus, 50, { a: a * fadeOut(tI + 0.1, 0.25), italic: true });
  cap('squeezed thin: lots of resistance', 400, tI + 0.4, VA.amber, 46, { a: a * fadeOut(tA, 0.3) * fadeIn(tI + 0.4, 0.3), italic: true });
  cap('thicker, and a far better conductor', 400, tA + 0.3, VA.minus, 46, { a: a * fadeOut(tM, 0.3), italic: true });
  // the magnet test: a U magnet snaps to iron, slides off aluminium
  const ma = fadeIn(tM, 0.3) * a;
  if (ma > 0) {
    const mag = (x, y, rot, k) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= k; ctx.lineWidth = 16; ctx.lineCap = 'butt'; ctx.strokeStyle = '#e04a5a'; ctx.beginPath(); ctx.arc(0, 0, 34, Math.PI, 0); ctx.stroke(); ctx.strokeStyle = '#d8d4f0'; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-34, 18); ctx.moveTo(34, 0); ctx.lineTo(34, 18); ctx.stroke(); ctx.restore(); };
    const y1 = springMove(tM, 640, 785, SPRING.snappy), x2 = 760 + 90 * EZ.i2(clamp((TT - tM - 0.7) / 0.8)), y2 = springMove(tM + 0.3, 960, 1075, SPRING.snappy) + 200 * EZ.i2(clamp((TT - tM - 0.7) / 0.8));
    mag(540, y1, 0, ma); mag(x2, y2, 0.4 * clamp((TT - tM - 0.7) / 0.8), ma * fadeOut(tM + 1.4, 0.3));
    if (TT > tM + 0.25) label('✓', 640, 760, '#6ee7a8', 44, ma);
    if (TT > tM + 0.9) label('✗', 760, 1060, VA.red, 44, ma * fadeOut(SUBEND('magnet') - 0.1, 0.2));
  }
}
// the coil itself: solid wire (only the skin carries current) vs Litz (hundreds of insulated strands)
function beatLitz() {
  const a = BW('litz', 'enemy');
  if (a <= 0) return;
  const tS = VW('litz', 'solid') - 0.2, tL = VW('litz', 'hundreds') - 0.2;
  const sa = fadeIn(SUB('litz') + 0.2, 0.3) * a;
  // the solid wire: a dark core with a lit rim
  ctx.save(); ctx.globalAlpha *= sa; ctx.fillStyle = '#16123f'; ctx.beginPath(); ctx.arc(540, 800, 140, 0, TAU); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha *= sa; ctx.strokeStyle = VA.minus; ctx.lineWidth = 20; ctx.shadowColor = VA.minus; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(540, 800, 130, 0, TAU); ctx.stroke(); ctx.restore();
  ivSteam(540, 640, sa * fadeIn(tS, 0.4) * fadeOut(tL, 0.3) * 0.8, 4, 120, 60);
  cap('solid wire: only its skin carries current', 400, tS, VA.text, 40, { a: a * fadeOut(tL, 0.3), italic: true });
  vaArrow(540, 960, 540, 1010, VA.text, 3, a * fadeIn(tL, 0.3), 14);
  // Litz: a bundle of small insulated strands, every one lit
  const la = fadeIn(tL, 0.4) * a;
  if (la > 0) {
    vaRing(540, 1180, 145, VA.line, 3, la);
    for (let r = 0; r < 5; r++) { const n = r === 0 ? 1 : r * 7; for (let i = 0; i < n; i++) { const th = i / n * TAU + r * 0.3, x = 540 + r * 30 * Math.cos(th), y = 1180 + r * 30 * Math.sin(th); vaDot(x, y, 12, VA.minus, la * popS(tL + r * 0.08)); vaRing(x, y, 13, '#0b0a2a', 2, la); } }
    cap('Litz wire: fine, insulated, twisted strands', 1420, tL + 0.2, VA.minus, 40, { a, italic: true });
  }
  cap('cooks on top · the enemy below', 400, VW('enemy', 'effect') - 0.1, VA.amber, 46, { a: a * fadeIn(VW('enemy', 'effect') - 0.1, 0.3), italic: true });
}
// your hand next to iron, in the same field
function beatHand() {
  const a = BW('hand2', 'zero');
  if (a <= 0) return;
  const tW = VW('hand2', 'ten') - 0.2, tZ = VW('zero', 'zero') - 0.2;
  const fieldArcs = (x) => { for (let i = 0; i < 3; i++) vaStroke(vaArcPts(x, 1000, 90 + i * 34, Math.PI * 1.1, Math.PI * 1.9, 20), VA.plus, 2.5, { a: a * (0.5 + 0.5 * Math.sin(TT * TAU * ACF + i)) * 0.8 }); };
  fieldArcs(320); fieldArcs(760);
  const ih = EZ.io(clamp((TT - SUB('hand2') - 0.8) / 2.0));
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = `rgba(220,130,40,${0.2 + 0.6 * ih})`; ctx.fillRect(220, 960, 200, 90); ctx.restore();
  vaStroke([[220, 960], [420, 960], [420, 1050], [220, 1050]], VA.line, 3, { a, closed: true });
  ivSteam(320, 930, ih * a, 4, 120, 40);
  label('iron', 320, 1100, VA.amber, 34, a);
  ivHand(760, 1000, 0.9, a);
  label('your hand', 760, 1110, VA.minus, 34, a);
  cap('× 10,000,000 worse at conducting', 400, tW, VA.cream, 48, { a, italic: true });
  // heat meters: iron full, hand zero
  const ma = fadeIn(VW('zero', 'induced') - 0.1, 0.3) * a;
  if (ma > 0) {
    ctx.save(); ctx.globalAlpha *= ma * 0.3; ctx.fillStyle = VA.dim; ctx.fillRect(220, 1160, 200, 20); ctx.fillRect(660, 1160, 200, 20); ctx.restore();
    vaBar(220, 1160, 200, 20, ih, VA.amber, ma);
    const z = popS(tZ) * a;
    if (z > 0) OV(() => vaText('0', 760, 1330, 140 * z, VA.minus, { align: 'center', serif: true, a: z, glow: 18 }));
  }
}
function beatEnd() {
  if (TT < HIT - 0.1) return;
  OV(() => {
    const t1 = VW('end', 'heat') - 0.2, t2 = VW('end', 'born') - 0.3;
    vaText("The heat doesn't reach the pan.", CXT, 330, 52, VA.cream, { align: 'center', serif: true, a: fadeIn(t1, 0.3), frac: vaType(t1, "The heat doesn't reach the pan.", 28), glow: 8 });
    vaText("It's born inside it.", CXT, 420, 72, VA.amber, { align: 'center', serif: true, italic: true, a: fadeIn(t2, 0.3), frac: vaType(t2, "It's born inside it.", 22), glow: 18 });
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
  const warm = TT >= HIT ? Math.max(0.3, flashK(HIT, 1.4)) * 0.8 : 0;
  vaBg(warm);
  vaGridBg(c);
  gridPulses(c);
  vaSpecks(40, 0.3);
  setCam(c);
  stage(); beatSkin(); beatLitz(); beatHand(); beatTitle(); captionsStage(); beatEnd();
}
