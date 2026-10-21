// =====================================================================
//  SCENES — Why do LED lights use so little electricity? (voltamps). World 1080x1920, TT on 1s.
//  amber = heat / the filament, magenta = visible light, cyan = the LED and its electrons, cream = white-hot.
// =====================================================================
const BL = [310, 620], BR = [770, 620], BRAD = 140;      // the two bulbs (filament left, LED right)
const CXT = 540;                                        // every free text is centred on the frame
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const win = (t0, t1, d = 0.35) => fadeIn(t0, d) * fadeOut(t1, d);
const OV = vaOverlay;
const flashK = (t, d = 0.6) => (TT < t ? 0 : TT < t + 0.08 ? (TT - t) / 0.08 : Math.exp(-(TT - t - 0.08) / d * 3));
const LT = (id, u) => lerp(VL(id).t0, VL(id).t1, u);    // a point inside a line (for lines whose word times are unsure)
let CAMZ = 1;

// ---- the camera
function camAtT() {
  const cx = springTrack([[0, 540], [S('filament'), BL[0]], [S('infrared'), 540], [S('method'), BR[0]], [S('step'), 540], [S('losses'), 620], [S('never'), 540]], SPRING.smooth);
  const cy = springTrack([[0, 900], [S('filament'), BL[1] - 10], [S('infrared'), 1000], [S('method'), BR[1] - 10], [S('step'), 1000], [S('losses'), 860], [S('never'), 900], [HIT, 880]], SPRING.smooth);
  const z = springTrack([[0, 1], [S('filament'), 2.3], [S('infrared'), 1], [S('method'), 2.3], [S('step'), 1], [S('losses'), 1.25], [S('never'), 1], [HIT, 1.08]], SPRING.smooth);
  const sh = TT > HIT ? Math.exp(-(TT - HIT) * 6) * 12 : 0;
  return { cx: cx + 26 * Math.sin(TT * 0.31), cy: cy + 16 * Math.sin(TT * 0.23 + 1), z: z * (1 + 0.045 * Math.sin(TT * 0.42)), sx: sh * Math.sin(TT * 91), sy: sh * Math.cos(TT * 77) };
}
function setCam(c) { ctx.setTransform(c.z, 0, 0, c.z, W / 2 + c.sx - c.z * c.cx, H / 2 + c.sy - c.z * c.cy); }

// ---- depth: a faint dotted lab grid behind everything, with parallax
function ledGridBack(c) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const k = 0.35, z = 1 + (c.z - 1) * 0.3, ox = -(c.cx - 540) * k * z, oy = -(c.cy - 960) * k * z, step = 64 * z;
  for (let gx = mod(ox, step) - step; gx < W + step; gx += step) for (let gy = mod(oy, step) - step; gy < H + step; gy += step) {
    const d = Math.hypot(gx - W / 2, gy - H * 0.45) / (H * 0.6);
    ctx.globalAlpha = 0.16 * (1 - clamp(d)); ctx.fillStyle = VA.dim; ctx.fillRect(gx, gy, 2.5, 2.5);
  }
  ctx.restore();
}

// =====================================================================
//  the bulbs
// =====================================================================
function ledHeatWaves(x, y, k, n = 5, h = 220) {   // wavy lines rising off something hot
  if (k <= 0) return;
  for (let i = 0; i < n; i++) {
    const R = RNG('hw', i, x), u = mod(TT * 0.45 + R.f(), 1), bx = x + (i - (n - 1) / 2) * 34;
    const P = []; for (let j = 0; j <= 14; j++) { const v = j / 14; P.push([bx + Math.sin(v * 9 + TT * 4 + i) * 9, y - u * 60 - v * h * 0.6]); }
    vaStroke(P, VA.amber, 3, { a: k * 0.7 * Math.sin(Math.PI * u) });
  }
}
// a bulb: glass, neck, screw base; inside a coil (filament) or a row of chips (LED); lit = 0..1
function ledBulb(x, y, kind, lit = 0, o = {}) {
  const r = BRAD, hot = kind === 'fil', a = o.a ?? 1;
  ctx.save(); ctx.globalAlpha *= a;
  // glow outside: concentric soft rings
  if (lit > 0) {
    const c = hot ? (o.white ? '255,238,200' : '255,176,60') : '120,200,255';
    const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * (2.6 + (o.bloom ?? 0)));
    g.addColorStop(0, `rgba(${c},${0.45 * lit})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * (2.6 + (o.bloom ?? 0)), 0, TAU); ctx.fill();
    for (let i = 1; i <= 3; i++) vaRing(x, y, r * (1 + i * 0.2) + 6 * Math.sin(TT * 2 + i), hot ? VA.amber : VA.minus, 2, lit * 0.35 / i);
  }
  // glass
  ctx.fillStyle = '#100c30'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (lit > 0) { const g = ctx.createRadialGradient(x, y, 4, x, y, r); g.addColorStop(0, hot ? `rgba(255,214,140,${0.55 * lit})` : `rgba(170,230,255,${0.5 * lit})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  vaRing(x, y, r, VA.line, 3);
  vaStroke(vaArcPts(x, y, r * 0.78, -2.5, -1.9, 8), VA.text, 3, { a: 0.35 });   // a highlight on the glass
  // neck and base
  const ny = y + r * 0.86;
  vaStroke([[x - r * 0.5, ny - 8], [x - r * 0.38, y + r * 1.32], [x + r * 0.38, y + r * 1.32], [x + r * 0.5, ny - 8]], VA.line, 3);
  ctx.fillStyle = VA.fill2; ctx.fillRect(x - r * 0.38, y + r * 1.32, r * 0.76, r * 0.5);
  for (let i = 0; i < 4; i++) vaLine(x - r * 0.38, y + r * (1.32 + i * 0.13), x + r * 0.38, y + r * (1.38 + i * 0.13), VA.line, 2.5);
  vaStroke([[x - r * 0.38, y + r * 1.82], [x - r * 0.16, y + r * 1.98], [x + r * 0.16, y + r * 1.98], [x + r * 0.38, y + r * 1.82]], VA.line, 3);
  // inside
  if (hot) {
    vaLine(x - 40, y + r * 0.9, x - 40, y + 4, VA.dim, 2.5); vaLine(x + 40, y + r * 0.9, x + 40, y + 4, VA.dim, 2.5);
    const P = []; for (let i = 0; i <= 60; i++) { const u = i / 60; P.push([x - 40 + 80 * u, y + 4 - 14 - 12 * Math.sin(u * TAU * 7)]); }
    const cc = lit > 0.05 ? (o.white ? VA.cream : VA.amber) : VA.dim;
    if (lit > 0.05) vaGlow(P, cc, 3, lit, { core: o.white ? '#ffffff' : VA.cream }); else vaStroke(P, cc, 3);
  } else {
    vaLine(x - 46, y + 18, x + 46, y + 18, VA.dim, 3); vaLine(x, y + 18, x, y + r * 0.9, VA.dim, 2.5);
    for (let i = 0; i < 4; i++) {
      const cx = x - 36 + i * 24;
      ctx.fillStyle = lit > 0.05 ? VA.minus : '#2b2470'; ctx.shadowColor = VA.minus; ctx.shadowBlur = 18 * lit;
      ctx.fillRect(cx - 8, y + 2, 16, 14); ctx.shadowBlur = 0;
      if (lit > 0.05) { ctx.fillStyle = '#e8fbff'; ctx.globalAlpha *= lit; ctx.fillRect(cx - 4, y + 5, 8, 7); ctx.globalAlpha /= lit; }
    }
  }
  ctx.restore();
}

// =====================================================================
//  the charts and diagrams (lower area, world y ~1020–1460)
// =====================================================================
const CH = { x0: 150, x1: 900, y0: 1430, h: 330 };
const LMIN = 0.2, LMAX = 3.2;
const lx = (lam) => lerp(CH.x0, CH.x1, (lam - LMIN) / (LMAX - LMIN));
function planck(lam, T = 2700) { const c2 = 14388; return 1 / (Math.pow(lam, 5) * (Math.exp(c2 / (lam * T)) - 1)); }
const PMAX = planck(2898 / 2700);
function chartAxes(a) {
  vaLine(CH.x0, CH.y0, CH.x1 + 10, CH.y0, VA.line, 2.5, { a });
  vaLine(CH.x0, CH.y0, CH.x0, CH.y0 - CH.h - 20, VA.line, 2.5, { a });
  vaText('λ (µm)', CH.x1, CH.y0 + 44, 26, VA.dim, { align: 'right', a });
  for (const l of [0.5, 1, 2]) { vaLine(lx(l), CH.y0, lx(l), CH.y0 + 10, VA.line, 2, { a }); vaText(String(l), lx(l), CH.y0 + 40, 24, VA.dim, { align: 'center', a }); }
}
// the filament's spectrum: a 2,700 K black body, drawn on with u
function chartFilament(a, u, o = {}) {
  if (a <= 0) return;
  chartAxes(a * (o.axes ?? 1));
  const pts = []; for (let i = 0; i <= 120; i++) { const l = LMIN + (LMAX - LMIN) * i / 120; pts.push([lx(l), CH.y0 - CH.h * planck(l) / PMAX]); }
  const P = vaPart(pts, u), last = P[P.length - 1];
  ctx.save(); ctx.globalAlpha *= a * (o.ghost ? 0.35 : 1);
  // fills: visible (magenta), infrared (amber)
  const fill = (lo, hi, c) => { ctx.beginPath(); ctx.moveTo(lx(lo), CH.y0); for (const [x, y] of P) if (x >= lx(lo) && x <= lx(hi)) ctx.lineTo(x, y); ctx.lineTo(Math.min(lx(hi), last[0]), CH.y0); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); };
  fill(0.38, 0.75, 'rgba(212,98,242,0.75)');
  if (last[0] > lx(0.75)) fill(0.75, LMAX, 'rgba(255,189,58,0.28)');
  ctx.restore();
  vaGlow(P, VA.amber, 3, 0.6 * a, { a: a * (o.ghost ? 0.35 : 1), dash: o.ghost ? [8, 10] : null });
}
// the LED's spectrum: a narrow blue spike and a broad phosphor hump, all inside the visible band
function chartLED(a, u) {
  if (a <= 0) return;
  const g = (l, m, s) => Math.exp(-((l - m) ** 2) / (2 * s * s));
  const pts = []; for (let i = 0; i <= 120; i++) { const l = LMIN + (LMAX - LMIN) * i / 120; pts.push([lx(l), CH.y0 - CH.h * 0.95 * (0.9 * g(l, 0.45, 0.012) + 0.62 * g(l, 0.57, 0.05))]); }
  const P = vaPart(pts, u);
  ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.moveTo(P[0][0], CH.y0); for (const [x, y] of P) ctx.lineTo(x, y); ctx.lineTo(P[P.length - 1][0], CH.y0); ctx.closePath(); ctx.fillStyle = 'rgba(212,98,242,0.55)'; ctx.fill(); ctx.restore();
  vaGlow(P, VA.plus, 3, 0.8 * a, { a });
}
// the energy step: two levels, electrons that drop, photons that leave (the gap sets the colour)
const STP = { x0: 200, x1: 880, top: 1080 };
const gapAt = () => {   // the step's height: steady, then (colour) small -> mid -> large
  const t = VW('color', 'height') - 0.2;
  return springTrack([[0, 240], [t, 150], [t + 0.75, 250], [t + 1.5, 340], [VL('color').t1 + 0.3, 250]], SPRING.smooth);
};
const gapColor = (g) => (g < 190 ? '#ff4d5e' : g < 290 ? '#4dff9a' : '#4d8dff');
function stepDiagram(a) {
  if (a <= 0) return;
  const g = gapAt(), bot = STP.top + g;
  vaGlow([[STP.x0, STP.top], [STP.x1, STP.top]], VA.minus, 3, 0.5 * a, { a });
  vaGlow([[STP.x0, bot], [STP.x1, bot]], VA.minus, 3, 0.5 * a, { a });
  vaArrow(STP.x0 + 30, bot - 6, STP.x0 + 30, STP.top + 8, VA.text, 2.5, a, 14); vaArrow(STP.x0 + 30, STP.top + 8, STP.x0 + 30, bot - 6, VA.text, 2.5, a, 14);
  vaText('energy step', STP.x0 + 50, (STP.top + bot) / 2 + 10, 30, VA.text, { a });
  // electrons: each falls on its own clock; the first one on the words
  const t0 = VW('step', 'electron') - 0.1, tDrop = VW('step', 'drops') - 0.05;
  const drops = [tDrop]; for (let k = 1; k < 30; k++) drops.push(VW('step', 'photon') + 0.4 + k * 0.62);
  drops.forEach((td, i) => {
    if (TT < td - 0.9 || TT > td + 1.8) return;
    const ex = 420 + ((i * 137) % 380), app = fadeIn(i === 0 ? t0 : td - 0.9, 0.3);
    const fall = EZ.i2(clamp((TT - td) / 0.28)), ey = lerp(STP.top - 14, bot - 14, fall);
    vaDot(ex, ey, 11, VA.minus, a * app * (1 - clamp((TT - td - 1.2) / 0.5))); vaRing(ex, ey, 18, VA.minus, 2, a * app * 0.4);
    // the photon: a wiggle leaving to the right, in the gap's colour
    const pu = clamp((TT - td - 0.28) / 1.1);
    if (pu > 0 && pu < 1) {
      const c = gapColor(g), P = []; const px = ex + pu * 520;
      for (let j = 0; j <= 30; j++) { const v = j / 30; P.push([px - 120 + v * 120, bot - 40 - pu * 160 + Math.sin(v * TAU * 3 - TT * 20) * 14 * Math.sin(Math.PI * v)]); }
      vaGlow(P, c, 3, a * (1 - pu * 0.6), { a: a * (1 - pu) });
    }
  });
  const ta = fadeIn(VW('step', 'photon') - 0.1, 0.3) * fadeOut(S('color'), 0.3) * a;
  if (ta > 0) vaText('photon', CXT, STP.top - 50, 52, VA.plus, { align: 'center', serif: true, italic: true, a: ta, frac: vaType(VW('step', 'photon') - 0.1, 'photon', 20) });
  const ca = win(VW('color', 'height') - 0.2, S('math') + 0.2, 0.3) * a;
  if (ca > 0) { vaText('height → colour', CXT, STP.top - 50, 52, gapColor(g), { align: 'center', serif: true, italic: true, a: ca }); }
}
function ledBars(rows, a) {   // rows: [label, value text, frac, colour, y, split?]
  for (const r of rows) {
    const [lab, val, frac, c, y, split] = r, x0 = 150, w = 740;
    vaText(lab, x0, y - 16, 30, VA.text, { a });
    vaText(val, x0 + w, y - 16, 30, c, { align: 'right', a, weight: 700 });
    ctx.save(); ctx.globalAlpha *= a * 0.25; ctx.fillStyle = VA.dim; ctx.fillRect(x0, y, w, 46); ctx.restore();
    if (split) { const [lf, hf, g] = split; vaBar(x0, y, w, 46, lf * g, VA.plus, a); vaBar(x0 + w * lf * g, y, w, 46, hf * g, VA.amber, a * 0.85); }
    else vaBar(x0, y, w, 46, frac, c, a);
  }
}

// =====================================================================
//  the beats
// =====================================================================
function drawTitle() {
  const a = fadeOut(VW('same', 'same') - 0.2, 0.4);
  if (a <= 0) return;
  OV(() => {
    vaText('Why do LED lights', CXT, 290, 76, VA.cream, { align: 'center', serif: true, frac: vaType(VL('title').t0 - 0.05, 'Why do LED lights', 22), a, glow: 8 });
    vaText('use so little', CXT, 376, 76, VA.cream, { align: 'center', serif: true, frac: vaType(VW('title', 'use') - 0.05, 'use so little', 22), a, glow: 8 });
    vaText('electricity?', CXT, 462, 76, VA.minus, { align: 'center', serif: true, italic: true, frac: vaType(VW('title', 'electricity') - 0.05, 'electricity?', 18), a, glow: 18 });
  });
}
function beatSame() {   // same light, 800 lm; 60 W against 8 W; where did 52 W go?
  const t0 = VW('same', 'eight') - 0.1, a = fadeOut(S('filament') - 0.4, 0.3);
  const la = fadeIn(t0, 0.3) * a;
  if (la > 0) {
    vaText('800 lm', CXT, 395, 52, VA.plus, { align: 'center', serif: true, a: la, frac: vaType(t0, '800 lm', 14), glow: 8 });
    vaLine(510, 412, BL[0] + 40, BL[1] - BRAD - 20, VA.plus, 2, { a: la * 0.7 }); vaLine(570, 412, BR[0] - 40, BR[1] - BRAD - 20, VA.plus, 2, { a: la * 0.7 });
  }
  const t60 = VW('same', 'sixty') - 0.1, t8 = VW('same', 'eight', 2) - 0.1, tq = VW('question', 'fiftytwo') - 0.1;
  const b = fadeIn(t60, 0.2) * a;
  if (b > 0) {
    const x0 = 150, w = 650, y = 1080;
    vaText('filament', x0, y - 18, 30, VA.text, { a: b });
    const g = EZ.o3(clamp((TT - t60) / 0.7));
    vaBar(x0, y, w * 8 / 60, 46, g > 0.13 ? 1 : g / 0.13, VA.plus, b);
    vaBar(x0 + w * 8 / 60, y, w * 52 / 60, 46, clamp((g - 0.13) / 0.87), VA.amber, b);
    vaText('60 W', x0 + w + 16, y + 36, 34, VA.amber, { a: b, weight: 700 });
    const c = fadeIn(t8, 0.2) * a;
    vaText('LED', x0, y + 120, 30, VA.text, { a: c });
    vaBar(x0, y + 138, w * 8 / 60, 46, EZ.o3(clamp((TT - t8) / 0.4)), VA.plus, c);
    vaText('8 W', x0 + w * 8 / 60 + 16, y + 174, 34, VA.plus, { a: c, weight: 700 });
    // the bracket over the missing 52
    const q = fadeIn(tq, 0.3) * a;
    if (q > 0) {
      const xa = x0 + w * 8 / 60, xb = x0 + w;
      vaStroke([[xa, y - 60], [xa, y - 72], [xb, y - 72], [xb, y - 60]], VA.amber, 2.5, { a: q });
      vaText('52 W ?', CXT, y - 92, 56, VA.amber, { align: 'center', serif: true, a: q, frac: vaType(tq, '52 W ?', 14), glow: 10 });
    }
    // heat: the 52 W segment shimmers, a label
    const th = VW('heat', 'heat') - 0.1, h = fadeIn(th, 0.3) * a;
    if (h > 0) {
      for (let i = 0; i < 9; i++) { const xx = x0 + w * 8 / 60 + 30 + i * 60, yy = y - 6 - mod(TT * 40 + i * 13, 50); vaStroke([[xx, yy], [xx + 6, yy - 10], [xx, yy - 20]], VA.amber, 2.5, { a: h * 0.6 }); }
      vaText('heat', x0 + w * 0.6, y + 120, 34, VA.amber, { a: h, weight: 700, frac: vaType(th, 'heat', 12) });
      const tm = VW('heat', 'method') - 0.15, m = fadeIn(tm, 0.3) * a;
      vaText('not a flaw: the method', CXT, y + 280, 44, VA.cream, { align: 'center', serif: true, italic: true, a: m, frac: vaType(tm, 'not a flaw: the method', 30) });
    }
  }
}
function beatFilament() {   // white-hot coil, rays out: mostly infrared (amber), a few visible (magenta)
  const t0 = S('filament'), a = win(t0 + 0.3, S('method'), 0.4);
  if (a <= 0) return;
  const tw = VW('filament', 'whitehot') - 0.1, td = VW('filament', 'thousand') - 0.3;
  OV(() => {
    const k = fadeIn(td, 0.3) * fadeOut(S('infrared') + 0.2, 0.3);
    if (k > 0) { vaText('> 2,000 °C', CXT, 360, 80, VA.cream, { align: 'center', serif: true, a: k, frac: vaType(td, '> 2,000 °C', 20), glow: 14 }); vaText('≈ 2,700 K', CXT, 430, 32, VA.amber, { align: 'center', a: k }); }
  });
  // rays from the coil: amber long ones (infrared), magenta short ones (light)
  const ra = fadeIn(tw, 0.4) * a;
  if (ra > 0) for (let i = 0; i < 16; i++) {
    const an = -Math.PI / 2 + (i - 7.5) * 0.19, vis = i % 6 === 2, u = mod(TT * 0.9 + i * 0.37, 1);
    const r0 = 40 + u * 30, r1 = r0 + 34;
    vaArrow(BL[0] + Math.cos(an) * r0, BL[1] - 14 + Math.sin(an) * r0, BL[0] + Math.cos(an) * r1, BL[1] - 14 + Math.sin(an) * r1, vis ? VA.plus : VA.amber, 2.5, ra * Math.sin(Math.PI * u), 8);
  }
}
function beatInfrared() {
  const a = win(S('infrared') + 0.7, S('method') - 0.35, 0.3);
  if (a <= 0) return;
  const tc = VW('infrared', 'temperature') - 0.2, u = EZ.io(clamp((TT - tc) / 1.6));
  chartFilament(a, u);
  const vi = fadeIn(VW('infrared', 'gives'), 0.3) * a;
  if (vi > 0) {
    vaLine(lx(0.55), CH.y0 - 60, lx(0.55) - 10, CH.y0 - CH.h - 10, VA.plus, 2, { a: vi });
    vaText('visible', lx(0.55) - 12, CH.y0 - CH.h - 24, 30, VA.plus, { a: vi });
    vaText('infrared', lx(2.0), CH.y0 - CH.h * 0.75, 32, VA.amber, { a: fadeIn(VW('infrared', 'infrared') - 0.1, 0.3) * a, weight: 700 });
    const pk = lx(2898 / 2700); vaLine(pk, CH.y0, pk, CH.y0 - CH.h, VA.amber, 1.5, { a: vi * 0.6, dash: [6, 8] });
    vaText('1.07 µm', pk + 10, CH.y0 - 14, 24, VA.amber, { a: vi });
  }
  const tl = VW('infrared', 'less') - 0.1, l = fadeIn(tl, 0.3) * a;
  if (l > 0) vaText('< 5 % light', CXT, CH.y0 - CH.h - 90, 64, VA.plus, { align: 'center', serif: true, a: l, frac: vaType(tl, '< 5 % light', 18), glow: 12 });
}
function beatStep() {
  const a = win(S('step') + 0.7, S('math') + 0.2, 0.4);
  if (a <= 0) return;
  // an inset: dashed lines from the LED chip down to the diagram
  vaLine(BR[0] - 40, BR[1] + 20, STP.x0, STP.top - 70, VA.minus, 2, { a: a * 0.4, dash: [6, 8] });
  vaLine(BR[0] + 40, BR[1] + 20, STP.x1, STP.top - 70, VA.minus, 2, { a: a * 0.4, dash: [6, 8] });
  stepDiagram(a);
}
function beatMath() {
  const a = win(S('math'), S('lmw') + 0.1, 0.4);
  if (a <= 0) return;
  chartFilament(a, 1, { ghost: true });
  chartLED(a, EZ.io(clamp((TT - S('math') - 0.3) / 1.0)));
  const n = fadeIn(VW('math', 'infrared') - 0.1, 0.3) * a;
  if (n > 0) vaText('no infrared', CXT, CH.y0 - CH.h - 40, 60, VA.minus, { align: 'center', serif: true, italic: true, a: n, frac: vaType(VW('math', 'infrared') - 0.1, 'no infrared', 22), glow: 10 });
}
function beatLmw() {
  const a = win(S('lmw') + 0.1, S('hundred') - 0.3, 0.3);
  if (a <= 0) return;
  const t1 = VW('lmw', 'fifteen') - 0.1, t2 = VW('lmw', 'hundred') - 0.4;
  const n1 = Math.round(15 * EZ.o3(clamp((TT - t1) / 0.6))), n2 = Math.round(100 * EZ.o3(clamp((TT - t2) / 0.7)));
  ledBars([['old bulb', `${n1} lm/W`, 0.15 * EZ.o3(clamp((TT - t1) / 0.6)), VA.amber, 1100], ['LED', `${n2}${n2 >= 100 ? '+' : ''} lm/W`, 1.0 * EZ.o3(clamp((TT - t2) / 0.7)), VA.minus, 1280]], a);
}
function beatHundred() {
  const a = win(S('hundred') + 0.1, S('losses') - 0.35, 0.3);
  if (a <= 0) return;
  const t0 = LT('hundred', 0.05), t1 = VW('hundred', 'thirty') - 0.1, t2 = VW('hundred', 'five') - 0.2;
  vaText('of every 100 W', CXT, 1010, 46, VA.text, { align: 'center', serif: true, a, frac: vaType(t0, 'of every 100 W', 26) });
  const g1 = EZ.o3(clamp((TT - t2) / 0.6)), g2 = EZ.o3(clamp((TT - t1) / 0.6));
  ledBars([['old bulb', '5 % light', 0, VA.plus, 1110, [0.05, 0.95, Math.max(g1, fadeIn(t0, 0.4))]], ['LED', '30 % light', 0, VA.plus, 1290, [0.3, 0.7, g2]]], a);
  const x6 = popS(VW('hundred', 'instead') - 0.1) * a;
  if (x6 > 0) vaText('×6 light', CXT, 1440, 64 * x6, VA.plus, { align: 'center', serif: true, a, glow: 12 });
}
function beatLosses() {
  const a = win(S('losses') + 0.2, S('never') + 0.2, 0.35);
  if (a <= 0) return;
  // a heat sink under the LED's base, faint warmth
  const y = BR[1] + BRAD * 2.05, x = BR[0];
  ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < 7; i++) vaLine(x - 54 + i * 18, y, x - 54 + i * 18, y + 54, VA.minus, 3);
  vaLine(x - 64, y, x + 64, y, VA.minus, 3);
  ctx.restore();
  ledHeatWaves(x, y + 70, 0.5 * a, 3, 140);
  const tl = VW('losses', 'losses') - 0.1;
  vaText('losses,', CXT, y + 150, 48, VA.minus, { align: 'center', serif: true, italic: true, a: fadeIn(tl, 0.25) * a, frac: vaType(tl, 'losses,', 20) });
  vaText('not method', CXT, y + 210, 48, VA.text, { align: 'center', serif: true, a: fadeIn(VW('losses', 'method') - 0.2, 0.25) * a, frac: vaType(VW('losses', 'method') - 0.2, 'not method', 22) });
}
function beatEnd() {
  const tl = VW('heater', 'lamp') - 0.2, th = VW('heater', 'heater') - 0.15, tF = VL('heater').t1 + 0.4;
  const la = fadeIn(tl, 0.3);
  if (la > 0) vaText('never a lamp', CXT, BL[1] + BRAD * 2 + 120, 52, VA.text, { align: 'center', serif: true, italic: true, a: la * fadeOut(th, 0.3), frac: vaType(tl, 'never a lamp', 24) });
  const ha = fadeIn(th, 0.3);
  if (ha > 0) OV(() => {
    vaText('It was a heater', CXT, 1270, 80, VA.amber, { align: 'center', serif: true, a: ha, frac: vaType(th, 'It was a heater', 22), glow: 16 });
    vaText('that happened to glow.', CXT, 1352, 60, VA.cream, { align: 'center', serif: true, italic: true, a: ha, frac: vaType(VW('heater', 'happened') - 0.1, 'that happened to glow.', 26), glow: 10 });
    const na = fadeIn(VW('heater', 'heater') + 0.5, 0.5);
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
  const warm = TT >= HIT ? Math.max(0.35, flashK(HIT, 1.4)) * 0.9 : TT >= S('filament') && TT < S('method') ? 0.25 * win(S('filament'), S('method'), 0.5) : 0;
  vaBg(warm);
  vaGridBg(c);
  vaSpecks(40, 0.3);
  setCam(c);
  // the bulbs: off during the title, on at "same light"; the filament goes white-hot; dims at "LED doesn't"; the end blooms
  const on = fadeIn(VW('same', 'same') - 0.1, 0.25);
  const filLit = on * (TT >= S('method') && TT < S('never') ? 0.55 : 1) * (TT >= S('step') && TT < S('never') ? 0.6 : 1);
  const ledLit = on * (TT >= S('filament') && TT < S('method') ? 0.5 : 1);
  const white = TT >= VW('filament', 'whitehot') - 0.1 && TT < S('method');
  const bloom = TT >= HIT ? 1.6 * EZ.o3(clamp((TT - HIT) / 0.8)) : 0;
  const ba = EZ.o2(clamp((TT - 0.2) / 1.2));
  ledBulb(BL[0], BL[1], 'fil', Math.max(filLit, TT >= HIT ? 1 : 0), { a: ba, white, bloom });
  ledBulb(BR[0], BR[1], 'led', ledLit * (TT >= HIT ? 0.6 : 1), { a: ba });
  // the filament's heat: always rising, much more at the end
  ledHeatWaves(BL[0], BL[1] - BRAD - 30, on * (TT >= HIT ? 1 : TT >= VW('heat', 'heat') - 0.2 ? 0.7 : 0.3), TT >= HIT ? 7 : 5, TT >= HIT ? 320 : 220);
  const lab = on * fadeOut(S('filament') - 0.4, 0.3) + fadeIn(S('never') + 0.5, 0.4) * fadeOut(HIT, 0.3);
  if (lab > 0) { vaText('filament', BL[0], BL[1] + BRAD * 2 + 50, 30, VA.text, { align: 'center', a: lab }); vaText('LED', BR[0], BR[1] + BRAD * 2 + 50, 30, VA.minus, { align: 'center', a: lab }); }
  beatSame(); beatFilament(); beatInfrared(); beatStep(); beatMath(); beatLmw(); beatHundred(); beatLosses(); beatEnd();
  drawTitle();
}
