// =====================================================================
//  SCENES — Why do appliances break right when the power comes back? (voltamps). World 1080x1920, TT on 1s.
//  cyan = power on the line, magenta = the inrush spike, amber/orange = load and heat (the hot thermistor).
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
//  parts: the line, a plug, a TV, a house, the recloser, the circuit inside the plug
// =====================================================================
function line(y, on, a = 1, x0 = 60, x1 = 1020) {
  if (on > 0.05) vaGlow([[x0, y], [x1, y]], VA.minus, 3, on * a, { a }); else vaLine(x0, y, x1, y, '#25306a', 3, { a });
}
function plugBox(x, y, a = 1, s = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = VA.fill2; ctx.beginPath(); ctx.roundRect(x - 40 * s, y - 28 * s, 80 * s, 56 * s, 10 * s); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = VA.line; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x - 40 * s, y - 28 * s, 80 * s, 56 * s, 10 * s); ctx.stroke(); ctx.restore();
  vaDot(x - 13 * s, y, 4 * s, VA.dim, a); vaDot(x + 13 * s, y, 4 * s, VA.dim, a);
}
function tv(x, y, on, a = 1, o = {}) {
  const w = (o.w ?? 260), h = (o.h ?? 170);
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#0d0b2a'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 14); ctx.fill();
  if (on > 0.02) { ctx.fillStyle = `rgba(18,182,232,${0.85 * on})`; ctx.shadowColor = VA.minus; ctx.shadowBlur = 40 * on; ctx.fillRect(x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28); }
  ctx.restore();
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = VA.line; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 14); ctx.stroke(); ctx.restore();
  vaLine(x - w * 0.3, y + h / 2, x - w * 0.36, y + h / 2 + 18, VA.line, 3, { a }); vaLine(x + w * 0.3, y + h / 2, x + w * 0.36, y + h / 2 + 18, VA.line, 3, { a });
  if (o.crack) { const k = o.crack; vaGlow([[x - w * 0.35, y - h * 0.3], [x - w * 0.05, y + h * 0.05], [x + w * 0.1, y - h * 0.08], [x + w * 0.36, y + h * 0.32]], VA.plus, 3, k * a, { a: a * k }); vaGlow([[x + w * 0.1, y - h * 0.08], [x + w * 0.2, y - h * 0.34]], VA.plus, 2.5, k * a, { a: a * k }); }
}
function house(x, y, lit, a = 1, s = 1) {
  const P = [[x - 34 * s, y + 40 * s], [x - 34 * s, y], [x, y - 30 * s], [x + 34 * s, y], [x + 34 * s, y + 40 * s]];
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = VA.fill2; vaTrace(P, true); ctx.fill(); ctx.restore();
  vaStroke(P, VA.line, 2.5, { a, closed: true });
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = lit > 0.05 ? `rgba(18,182,232,${0.3 + 0.7 * lit})` : '#1a1650'; if (lit > 0.05) { ctx.shadowColor = VA.minus; ctx.shadowBlur = 18 * lit; } ctx.fillRect(x - 12 * s, y + 8 * s, 24 * s, 22 * s); ctx.restore();
}
function recloser(x, y, closed, a = 1) {   // two contacts and a blade that swings shut
  vaDot(x - 40, y, 7, VA.line, a); vaDot(x + 40, y, 7, VA.line, a);
  const ang = lerp(-0.6, 0, closed);
  vaLine(x - 40, y, x - 40 + 80 * Math.cos(ang), y + 80 * Math.sin(ang), closed > 0.95 ? VA.minus : VA.line, 4, { a });
}
// inside the plug: a box, the capacitor in the middle, the thermistor on the input lead
const BOX = { x0: 380, x1: 700, y0: 720, y1: 1100 };
function ntcBody(x, y, heat, a = 1) {
  if (heat > 0.05) { const g = ctx.createRadialGradient(x, y, 4, x, y, 80); g.addColorStop(0, `rgba(255,140,40,${0.6 * heat})`); g.addColorStop(1, 'rgba(255,140,40,0)'); ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.fillRect(x - 80, y - 80, 160, 160); ctx.restore(); }
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = heat > 0.05 ? `rgb(${80 + 175 * heat | 0},${70 + 70 * heat | 0},${110 - 80 * heat | 0})` : '#3a3480'; ctx.beginPath(); ctx.arc(x, y, 30, 0, TAU); ctx.fill(); ctx.restore();
  vaRing(x, y, 30, heat > 0.5 ? VA.amber : VA.line, 3, a);
}
function circuit(a, o = {}) {
  if (a <= 0) return;
  const { x0, x1, y0, y1 } = BOX, cy = 910, nx = x0, ny = 810;
  plugBox(540, 640, a, 1.2);
  vaLine(540, 674, 540, y0, VA.line, 3, { a });
  vaStroke([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], VA.line, 3, { a, closed: true });
  vaLine(540, y1, 540, 1165, VA.line, 3, { a });
  tv(540, 1235, o.tvOn ?? 0, a, { w: 220, h: 140, crack: o.crack });
  // the capacitor: two plates across the box's middle; its charge as a fill between them
  vaLine(x0, cy, 516, cy, VA.line, 3, { a }); vaLine(564, cy, x1, cy, VA.line, 3, { a });
  vaLine(516, cy - 50, 516, cy + 50, VA.text, 5, { a }); vaLine(564, cy - 50, 564, cy + 50, VA.text, 5, { a });
  if (o.charge) { ctx.save(); ctx.globalAlpha *= a * 0.8; ctx.fillStyle = VA.minus; ctx.fillRect(520, cy + 48 - 96 * o.charge, 40, 96 * o.charge); ctx.restore(); }
  // the inrush: the left lead lights magenta from the plug to the capacitor
  if (o.spike) vaGlow([[540, 674], [540, y0], [x0, y0], [x0, cy], [516, cy]], VA.plus, 5, o.spike * a, { a: a * o.spike });
  if (o.flow) vaGlow([[540, 674], [540, y0], [x0, y0], [x0, cy], [516, cy]], VA.minus, 3, o.flow * a * 0.7, { a: a * o.flow });
  // the thermistor on the input lead
  if (o.ntc > 0) ntcBody(nx, ny, o.heat ?? 0, a * o.ntc);
}

// =====================================================================
//  the beats
// =====================================================================
function beatTitle() {
  const a = fadeOut(VW('blackout', 'blackout') - 0.1, 0.3);
  if (a <= 0) return;
  OV(() => {
    vaText('Why do appliances break', CXT, 300, 66, VA.cream, { align: 'center', serif: true, a, frac: vaType(VL('title').t0, 'Why do appliances break', 26), glow: 8 });
    vaText('right when the power', CXT, 384, 66, VA.cream, { align: 'center', serif: true, a, frac: vaType(VW('title', 'right') - 0.05, 'right when the power', 24), glow: 8 });
    vaText('comes back?', CXT, 468, 66, VA.minus, { align: 'center', serif: true, italic: true, a, frac: vaType(VW('title', 'comes') - 0.05, 'comes back?', 20), glow: 18 });
  });
}
function stageA() {   // title .. instant: one TV on the grid
  const a = BW('title', 'instant');
  if (a <= 0) return;
  const tOff = VW('blackout', 'blackout') - 0.1, tRet = VW('instant', 'returns') - 0.1;
  const on = TT < tOff ? 1 : TT < tRet ? 0 : 1;
  const surge = flashK(tRet, 0.6);
  line(620, on * (1 + surge), a);
  vaLine(540, 620, 540, 760, VA.line, 3, { a }); plugBox(540, 790, a);
  vaLine(540, 818, 540, 945, on ? VA.minus : VA.line, 3, { a });
  tv(540, 1060, on * (1 - 0.6 * surge), a, { w: 360, h: 230, crack: TT > tRet ? Math.min(1, surge * 1.5 + 0.4 * clamp((TT - tRet) / 0.3)) : 0 });
  if (surge > 0.05) vaGlow([[540, 620], [540, 760], [540, 818], [540, 945]], VA.plus, 5, surge * a, { a: a * surge });
  cap('the blackout breaks nothing', 1380, VW('blackout', 'nothing') - 0.1, VA.text, 48, { a: a * fadeOut(SUB('instant') + 0.1, 0.3), italic: true });
  cap('the instant it returns', 1380, VW('instant', 'instant') - 0.1, VA.plus, 56, { a, italic: true });
}
const HX = [150, 280, 410, 540, 670, 800, 930];
function stageB() {   // all .. retry: the street
  const a = BW('all', 'retry');
  if (a <= 0) return;
  const tN = VW('turns', 'normally') - 0.1, tOff = VW('turns', 'blackout') - 0.1, tTog = VW('turns', 'together') - 0.2;
  const tR = [VW('retry', 'switch') - 0.1, VW('retry', 'four') - 0.4, VW('retry', 'four') + 0.2, VW('retry', 'apart')];
  // power state: on, (blackout), all on at once; during retry the switch opens and recloses four times
  let on = TT < tOff ? 1 : TT < tTog ? 0 : 1, closed = 1, rk = 0;
  tR.forEach((t, i) => { if (TT >= t && TT < t + 0.35) { on = 0; closed = clamp((TT - t) / 0.35); } if (TT >= t + 0.35) rk = i + 1; });
  const flick = tR.reduce((m, t) => Math.max(m, flashK(t + 0.35, 0.4)), 0);
  line(760, on * (1 + flick), a, 60, 1020);
  if (TT >= SUB('retry')) { recloser(280, 660, closed, a); vaLine(320, 660, 320, 760, VA.line, 2.5, { a }); label('automatic switch', 280, 610, VA.text, 26, a * fadeIn(VW('retry', 'switch') - 0.2, 0.3)); }
  HX.forEach((x, i) => {
    vaLine(x, 760, x, 920, on ? '#1d6f96' : VA.dim, 2, { a });
    // taking turns: one or two houses lit at a time; after the blackout all of them
    let lit = 0;
    if (TT < tOff) lit = TT < tN ? 0.5 : (Math.floor(TT * 1.6 + i * 0.7) % 3 === 0 ? 1 : 0.15);
    else if (TT >= tTog) lit = on;
    house(x, 975, lit, a, 1.4);
  });
  // the load meter
  const mult = TT < tOff ? 1 : TT < tTog ? 0 : Math.max(1, 5 * Math.exp(-(TT - tTog - 0.6) * 0.05) * EZ.o3(clamp((TT - tTog) / 0.6)));
  const ma = fadeIn(SUB('all') + 0.5, 0.3) * a * fadeOut(SUB('retry') + 0.2, 0.3);
  if (ma > 0) {
    const shown = TT >= VW('five', 'five') - 0.1 ? 5 : mult;
    OV(() => { vaText('×' + shown.toFixed(1), CXT, 520, 110, shown > 2 ? VA.amber : VA.cream, { align: 'center', serif: true, a: ma, glow: 12 }); vaText("the line's load", CXT, 590, 32, VA.text, { align: 'center', a: ma }); });
  }
  cap('the whole street, at once', 1380, VW('all', 'neighborhood') - 0.2, VA.minus, 54, { a: a * fadeOut(SUB('turns'), 0.3), italic: true });
  cap('normally they take turns', 1380, VW('turns', 'turns') - 0.2, VA.text, 50, { a: a * fadeOut(tOff, 0.3), italic: true });
  cap('all start together', 1380, tTog, VA.amber, 56, { a: a * fadeOut(SUB('five'), 0.3), italic: true });
  cap('up to five times normal', 1380, VW('five', 'five') - 0.1, VA.amber, 56, { a: a * fadeOut(SUB('retry'), 0.3), italic: true });
  if (rk > 0) cap('×' + rk, 1380, tR[0] + 0.35, VA.cream, 80, { a, cps: 80 });
}
function stageC() {   // cap .. seconds, the hit, tip, end: inside the plug
  const a = BW('cap', 'end');
  if (a <= 0) return;
  const tC = VW('cap', 'capacitor', 1) - 0.2, tS = VW('cap', 'short') - 0.2, tN = VW('ntc', 'ntc') - 0.2, tCold = VW('cold', 'ten') - 0.2;
  const tH = VW('hot', 'heats') - 0.1, tT = VW('hot', 'tenths') - 0.2, tCool = VW('cool', 'cooling') - 0.1, tSec = VW('seconds', 'seconds') - 0.3;
  const tU = VW('tip', 'unplug') - 0.1, tW = VW('tip', 'wait') - 0.1, tPl = VW('tip', 'plugging') - 0.1;
  // the thermistor's heat: warms on "heats", stays hot through cool (cooling takes minutes), hot at the hit; cools on "wait"
  let heat = TT < tH ? 0 : TT < tW ? EZ.io(clamp((TT - tH) / 1.2)) : 1 - EZ.io(clamp((TT - tW) / 3.0));
  const spike = TT < tS ? 0 : TT < tN ? flashK(tS, 1.5) * 0.9 + 0.1 * (TT < tN) : 0;
  const hitK = flashK(HIT, 1.0);
  const unplug = TT >= tU ? EZ.io(clamp((TT - tU) / 0.5)) * (1 - EZ.io(clamp((TT - VL('end').t0 - 0.3) / 0.6))) : 0;
  ctx.save(); ctx.translate(0, -60 * unplug);   // the plug lifts out of the wall
  circuit(a, {
    ntc: fadeIn(tN, 0.3), heat,
    charge: TT >= tS ? EZ.o3(clamp((TT - tS) / 0.5)) : 0,
    spike: Math.max(spike, TT >= tCold && TT < tH ? 0 : 0, hitK),
    flow: TT >= tCold && TT < HIT ? 0.6 : TT >= VL('end').t0 + 0.6 ? 0.6 : 0,
    tvOn: TT >= HIT ? (TT >= VL('end').t0 + 0.9 ? 1 : 0) : TT >= tCold ? 1 : 0,
    crack: TT >= HIT && TT < VL('end').t0 + 0.6 ? Math.min(1, hitK * 1.4 + 0.5) : 0,
  });
  ctx.restore();
  // the wall socket the plug comes out of
  vaStroke([[490, 602], [590, 602]], VA.line, 3, { a: a * unplug }); 
  // labels on the thermistor
  const nx = BOX.x0, ny = 810, la = fadeIn(tCold, 0.3) * a;
  if (la > 0) {
    const ohm = heat < 0.5 ? '10 Ω' : '0.3 Ω';
    vaText(ohm, nx - 50, ny + 12, 36, heat < 0.5 ? VA.text : VA.amber, { align: 'right', a: la, weight: 700 });
  }
  // captions
  cap('an empty capacitor', 400, tC, VA.minus, 56, { a: a * fadeOut(tS - 0.3, 0.25), italic: true });
  cap('≈ a short circuit', 400, tS, VA.plus, 60, { a: a * fadeOut(tN - 0.3, 0.25), italic: true });
  cap('NTC thermistor', 400, tN, VA.cream, 60, { a: a * fadeOut(SUB('cold'), 0.3) });
  cap('cold: it holds the rush back', 400, tCold, VA.text, 48, { a: a * fadeOut(SUB('hot'), 0.3), italic: true });
  cap('hot: 30–50× lower', 400, tT, VA.amber, 60, { a: a * fadeOut(SUB('must'), 0.3), italic: true });
  cap('it has to drop', 400, VW('must', 'drop') - 0.2, VA.amber, 56, { a: a * fadeOut(SUB('cool'), 0.3), italic: true });
  // the race (screen space, top): cooling takes 30 s – 2 min, the power comes back in seconds
  const ra = fadeIn(tCool, 0.3) * a * fadeOut(VL('seconds').t1 + 0.2, 0.25);
  if (ra > 0) OV(() => {
    vaText('to cool down', 170, 318, 30, VA.amber, { a: ra }); vaText('30 s – 2 min', 910, 318, 30, VA.amber, { align: 'right', a: ra });
    vaBar(170, 332, 740, 22, EZ.o3(clamp((TT - tCool) / 1.2)), VA.amber, ra);
    const sa = fadeIn(tSec, 0.25) * ra;
    if (sa > 0) { vaText('power back', 170, 408, 30, VA.minus, { a: sa }); vaText('seconds', 910, 408, 30, VA.minus, { align: 'right', a: sa }); vaBar(170, 422, 740, 22, 0.06 * EZ.o3(clamp((TT - tSec) / 0.3)), VA.minus, sa); }
  });
  cap('unplug, and wait two minutes', 400, tU, VA.cream, 52, { a: a * fadeOut(VL('end').t0, 0.3), italic: true });
  const wa = fadeIn(tW, 0.3) * a * fadeOut(VL('end').t0 + 0.4, 0.3);
  if (wa > 0) OV(() => vaBar(300, 450, 480, 18, EZ.io(clamp((TT - tW) / (VL('tip').t1 + 0.6 - tW))), VA.amber, wa));
}
function beatEnd() {
  if (TT < VL('end').t0 - 0.2) return;
  OV(() => {
    const t1 = VW('end', 'superstition') - 0.3, t2 = VW('end', 'two') - 0.3;
    vaText("It's not superstition.", CXT, 300, 60, VA.cream, { align: 'center', serif: true, a: fadeIn(t1, 0.3), frac: vaType(t1, "It's not superstition.", 24), glow: 8 });
    vaText("It's two minutes of cooling.", CXT, 384, 56, VA.amber, { align: 'center', serif: true, italic: true, a: fadeIn(t2, 0.3), frac: vaType(t2, "It's two minutes of cooling.", 26), glow: 16 });
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
  const warm = TT >= HIT ? flashK(HIT, 1.2) * 0.7 : 0;
  vaBg(warm);
  vaGridBg(c);
  gridPulses(c);
  vaSpecks(40, 0.3);
  setCam(c);
  stageA(); stageB(); stageC(); beatTitle(); beatEnd();
}
