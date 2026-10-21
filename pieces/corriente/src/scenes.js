// =====================================================================
//  SCENES — Does electric current get used up? (voltamps). World 1080x1920, TT on 1s.
//  cyan = electrons / current, amber = energy and voltage (the bulb), magenta = the myth and the second branch.
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
//  parts: the loop, the bulb, the battery, an ammeter
// =====================================================================
const LOOP = [[300, 700], [780, 700], [780, 1250], [300, 1250]];   // clockwise: top-left → top-right → bottom-right → bottom-left
const LOOPP = [...LOOP, LOOP[0]];
function bulb(x, y, k, a = 1, s = 1) {
  if (k > 0.02) { const g = ctx.createRadialGradient(x, y, 10, x, y, 180 * s); g.addColorStop(0, `rgba(255,189,58,${0.5 * k})`); g.addColorStop(1, 'rgba(255,189,58,0)'); ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.fillRect(x - 200 * s, y - 200 * s, 400 * s, 400 * s); ctx.restore(); }
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = k > 0.02 ? `rgb(${120 + 135 * k | 0},${100 + 89 * k | 0},${80 - 22 * k | 0})` : '#2a2470'; ctx.beginPath(); ctx.arc(x, y, 44 * s, 0, TAU); ctx.fill(); ctx.restore();
  vaRing(x, y, 44 * s, k > 0.3 ? VA.amber : VA.line, 3, a);
  vaStroke([[x - 16 * s, y + 42 * s], [x - 14 * s, y + 62 * s], [x + 14 * s, y + 62 * s], [x + 16 * s, y + 42 * s]], VA.line, 3, { a });
  if (k > 0.2) for (let i = 0; i < 8; i++) { const an = -Math.PI / 2 + (i - 3.5) * 0.36, r0 = 60 * s, r1 = r0 + 20 * s * k; vaLine(x + Math.cos(an) * r0, y + Math.sin(an) * r0, x + Math.cos(an) * r1, y + Math.sin(an) * r1, VA.amber, 3, { a: a * k }); }
}
function battery(x, y, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#04031a'; ctx.fillRect(x - 50, y - 40, 100, 80); ctx.restore();
  [[-30, 34], [-10, 20], [10, 34], [30, 20]].forEach(([dx, h], i) => vaLine(x + dx, y - h, x + dx, y + h, i % 2 ? VA.text : VA.cream, i % 2 ? 4 : 6, { a }));
}
function ammeter(x, y, read, a = 1, c = VA.minus) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#04031a'; ctx.beginPath(); ctx.arc(x, y, 34, 0, TAU); ctx.fill(); ctx.restore();
  vaRing(x, y, 34, c, 3, a); vaText('A', x, y + 12, 34, c, { align: 'center', a, weight: 700 });
  if (read) vaText(read, x, y + 82, 40, c, { align: 'center', a, serif: true, glow: 8 });
}
// electrons along a path: n dots moving at speed v; dim(u) gives each dot's brightness by its position (0..1)
function flow(P, n, v, a, o = {}) {
  vaStroke(P, o.wire ?? '#1d6f96', 4, { a });
  for (let i = 0; i < n; i++) {
    const u = mod(i / n + TT * v, 1), p = vaAt(P, u), b = o.dim ? o.dim(u) : 1;
    if (b <= 0.02) continue;
    if (o.halo && b > 0.6) vaDot(p[0], p[1], 14, VA.minus, a * 0.25 * b);
    vaDot(p[0], p[1], 7, b > 0.6 ? VA.minus : '#3f7c9a', a * Math.max(0.35, b));
  }
}

// =====================================================================
//  the beats
// =====================================================================
function beatTitle() {
  const a = fadeOut(VW('lie', 'told') - 0.1, 0.3);
  if (a <= 0) return;
  OV(() => {
    vaText('Does electric current', CXT, 320, 72, VA.cream, { align: 'center', serif: true, a, frac: vaType(VL('title').t0, 'Does electric current', 24), glow: 8 });
    vaText('get used up?', CXT, 410, 72, VA.minus, { align: 'center', serif: true, italic: true, a, frac: vaType(VW('title', 'get') - 0.05, 'get used up?', 18), glow: 18 });
  });
}
function stageLoop() {   // title .. same
  const a = BW('title', 'same');
  if (a <= 0) return;
  const tP = VW('picture', 'leaves') - 0.2, tW = VW('false', 'wrong') - 0.2, tM1 = VW('false', 'before') - 0.2, tM2 = VW('false', 'after') - 0.2, tS = VW('same', 'half', 1) - 0.2;
  // the myth (picture → wrong): dots after the bulb fade out along the way back
  const myth = TT >= tP && TT < tW + 0.4 ? EZ.io(clamp((TT - tP) / 1.0)) : 0;
  flow(LOOPP, 28, 0.06, a, { dim: (u) => (myth > 0 ? (u < 0.25 ? 1 : 1 - myth * 0.85 * clamp((u - 0.25) / 0.2)) : 1), halo: true });
  battery(540, 1250, a);
  bulb(540, 700, 1, a);
  // the stamp
  const st = TT >= tW ? popS(tW) * fadeOut(tW + 1.6, 0.3) : 0;
  if (st > 0) { ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.12); ctx.scale(st, st); vaStroke([[-170, -50], [170, -50], [170, 50], [-170, 50]], VA.plus, 5, { a, closed: true }); vaText('MYTH', 0, 24, 72, VA.plus, { align: 'center', a, weight: 700, glow: 12 }); ctx.restore(); }
  // the two meters, before and after the bulb
  const m1 = popS(tM1) * a, m2 = popS(tM2) * a, reading = TT >= tS ? '0.5 A' : '';
  ammeter(300, 860, reading, m1); ammeter(780, 860, reading, m2);
  cap('two meters can prove it', 1430, VW('lie', 'meters') - 0.2, VA.text, 50, { a: a * fadeOut(SUB('picture'), 0.3), italic: true });
  cap('full in, a little back?', 1430, tP, VA.plus, 54, { a: a * fadeOut(tW, 0.3), italic: true });
  cap('exactly the same', 1430, tS - 0.5, VA.minus, 60, { a: a * fadeIn(tS - 0.5, 0.3), italic: true });
  OV(() => { const k = fadeIn(VW('same', 'single') - 0.2, 0.3) * a; if (k > 0) vaText('not one electron lost', CXT, 1500, 34, VA.text, { align: 'center', a: k }); });
}
// the strip: same spacing before and after the bulb, but tired electrons; the voltage step below
function stageStrip() {
  const a = BW('energy', 'voltage');
  if (a <= 0) return;
  const tE = VW('energy', 'energy') - 0.2, tV = VW('voltage', 'voltage') - 0.2, y = 820;
  flow([[40, y], [1040, y]], 24, 0.11, a, { dim: (u) => (u < 0.5 ? 1 : 0.4), halo: true });
  bulb(540, y, 0.85 + 0.15 * Math.sin(TT * 6), a, 1.1 + 0.04 * Math.sin(TT * 3));
  label('pushed hard', 260, y - 70, VA.minus, 32, a * fadeIn(VW('energy', 'pushed') - 0.2, 0.3));
  label('tired', 770, y - 70, '#5f8fa8', 32, a * fadeIn(VW('energy', 'tired') - 0.2, 0.3));
  label('same current', CXT, y + 110, VA.minus, 34, a * fadeIn(VW('voltage', 'same') - 0.2, 0.3));
  // the voltage step
  const ga = fadeIn(tV - 0.6, 0.4) * a;
  if (ga > 0) {
    const d = EZ.io(clamp((TT - tV) / 0.8));
    vaGlow([[120, 1050], [540, 1050], [540, lerp(1050, 1250, d)], [960, lerp(1050, 1250, d)]], VA.amber, 4, ga);
    vaText('voltage', 120, 1020, 30, VA.amber, { a: ga });
    if (d > 0.3) { vaArrow(600, 1060, 600, 1240, VA.amber, 3, ga * d, 14); vaText('drops', 630, 1165, 34, VA.amber, { a: ga * d }); }
  }
  cap('energy is what gets used up', 1430, tE, VA.amber, 52, { a: a * fadeOut(tV - 0.3, 0.3), italic: true });
  cap('the voltage drops, not the current', 1430, tV, VA.amber, 46, { a, italic: true });
}
// the junction: 3 A in, 2 A and 1 A out; the roundabout
const JN = [420, 900];
function stageJunction() {
  const a = BW('kirchhoff', 'end');
  if (a <= 0) return;
  const tN = VW('kirchhoff', "kirchhoff's") - 0.2, tSp = VW('split', 'splits') - 0.2, tR = VW('round', 'roundabout') - 0.2;
  const hit = flashK(HIT, 1.0);
  const inP = [[40, 900], [JN[0] - 70, 900]], up = [[JN[0] + 60, 860], [980, 600]], dn = [[JN[0] + 60, 940], [980, 1180]];
  const bk = fadeIn(tSp, 0.4);
  flow(inP, 9, 0.18, a, { halo: true });
  vaGlow(vaArcPts(JN[0], JN[1], 70, 0, TAU, 48), VA.minus, 3, a * (0.5 + 0.5 * Math.sin(TT * 4)), { a });
  for (let i = 0; i < 8; i++) { const th = i / 8 * TAU + TT * 2.8; vaDot(JN[0] + 70 * Math.cos(th), JN[1] + 70 * Math.sin(th), 7, VA.minus, a * (TT >= tR - 0.5 ? 1 : 0.6)); }
  if (bk > 0) { flow(up, 6, 0.18, a * bk, { halo: true }); flow(dn, 3, 0.18, a * bk, { wire: '#6a2a7a' }); }
  if (TT >= HIT) { vaGlow([...inP], VA.minus, 4, hit * a); vaGlow(up, VA.minus, 4, hit * a); vaGlow(dn, VA.plus, 4, hit * a); vaRing(JN[0], JN[1], 70 + 160 * EZ.o3(clamp((TT - HIT) / 0.8)), VA.cream, 3, a * (1 - clamp((TT - HIT) / 0.8))); }
  label('3 A', 200, 860, VA.minus, 40, a * fadeIn(VW('split', 'three') - 0.2, 0.3));
  label('2 A', 820, 640, VA.minus, 40, a * bk);
  label('1 A', 820, 1170, VA.plus, 40, a * bk);
  cap("Kirchhoff's current law", 360, tN, VA.cream, 60, { a: a * fadeOut(HIT - 0.45, 0.3) });
  cap('what goes in, comes out', 440, VW('kirchhoff', 'wherever') - 0.2, VA.minus, 46, { a: a * fadeOut(HIT - 0.45, 0.3), italic: true });
  OV(() => { const k = fadeIn(VW('round', 'three') - 0.2, 0.3) * a * fadeOut(HIT - 0.45, 0.3); if (k > 0) { vaText('3 A = 2 A + 1 A', CXT, 1400, 64, VA.cream, { align: 'center', serif: true, a: k, glow: 10 }); } });
  cap('like a roundabout: no car disappears', 1490, tR, VA.text, 40, { a: a * fadeOut(HIT - 0.45, 0.3), italic: true });
}
function beatEnd() {
  if (TT < HIT - 0.1) return;
  OV(() => {
    const t1 = VW('end', 'current') - 0.2, t2 = VW('end', 'shared') - 0.3, t3 = VW('end', 'what') - 0.2;
    vaText("Current isn't used up.", CXT, 330, 62, VA.cream, { align: 'center', serif: true, a: fadeIn(t1, 0.3), frac: vaType(t1, "Current isn't used up.", 24), glow: 8 });
    vaText("It's shared.", CXT, 420, 80, VA.minus, { align: 'center', serif: true, italic: true, a: fadeIn(t2, 0.3), frac: vaType(t2, "It's shared.", 16), glow: 18 });
    vaText('Energy is what gets used up.', CXT, 1400, 48, VA.amber, { align: 'center', serif: true, italic: true, a: fadeIn(t3, 0.3), frac: vaType(t3, 'Energy is what gets used up.', 26), glow: 10 });
    const na = fadeIn(VL('end').t1 + 0.2, 0.5);
    if (na > 0) {
      ctx.save(); ctx.font = `700 46px ${VMONO}`; const wB = ctx.measureText('Bit').width, wV = ctx.measureText('volts').width; ctx.restore();
      const x0 = CXT - (wB + wV) / 2;
      vaText('Bit', x0, 1485, 46, VA.minus, { weight: 700, a: na, glow: 12 }); vaText('volts', x0 + wB, 1485, 46, VA.plus, { weight: 700, a: na, glow: 12 });
    }
  });
}

// =====================================================================
//  the stage
// =====================================================================
function sceneStage() {
  const c = camAtT(); CAMZ = c.z;
  const warm = TT >= HIT ? flashK(HIT, 1.0) * 0.4 : 0;
  vaBg(warm);
  vaGridBg(c);
  gridPulses(c);
  vaSpecks(40, 0.3);
  setCam(c);
  stageLoop(); stageStrip(); stageJunction(); beatTitle(); beatEnd();
}
