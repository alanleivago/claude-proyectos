// =====================================================================
//  SCENES — The most important invention you can't see (voltamps). World 1080x1920, TT on 1s.
//  cyan = current / the transistor's pads, magenta = the gate / the control, amber = gold and history,
//  cream = big numbers. Every free text is centred (x 540); titles and big text in serif.
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
//  the devices (look, same, end)
// =====================================================================
function devDots(key, x, y, w, h, n, a, k = 1) {
  for (let i = 0; i < n; i++) {
    const R = RNG('dd', key, i), px = x + R.r(-w / 2, w / 2), py = y + R.r(-h / 2, h / 2);
    const on = 0.35 + 0.65 * (Math.sin(TT * R.r(3, 9) + i) > 0.2 ? 1 : 0.2);
    vaDot(px, py, 3.2, VA.minus, a * on * k);
  }
}
function devPhone(x, y, s, a) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = VA.fill2; ctx.beginPath(); ctx.roundRect(x - 62 * s, y - 112 * s, 124 * s, 224 * s, 20 * s); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = VA.line; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x - 62 * s, y - 112 * s, 124 * s, 224 * s, 20 * s); ctx.stroke(); ctx.restore();
  vaLine(x - 16 * s, y - 98 * s, x + 16 * s, y - 98 * s, VA.line, 3, { a });
  devDots('ph', x, y, 96 * s, 176 * s, 34, a);
}
function devMonitor(x, y, s, a) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = VA.fill2; ctx.fillRect(x - 130 * s, y - 85 * s, 260 * s, 160 * s); ctx.restore();
  vaStroke([[x - 130 * s, y - 85 * s], [x + 130 * s, y - 85 * s], [x + 130 * s, y + 75 * s], [x - 130 * s, y + 75 * s]], VA.line, 3, { a, closed: true });
  vaLine(x, y + 75 * s, x, y + 110 * s, VA.line, 3, { a }); vaLine(x - 44 * s, y + 110 * s, x + 44 * s, y + 110 * s, VA.line, 3, { a });
  devDots('mo', x, y - 5 * s, 236 * s, 140 * s, 40, a);
}
function devCar(x, y, s, a) {
  const P = [[-140, 30], [-140, -5], [-110, -18], [-70, -60], [40, -60], [85, -22], [135, -12], [145, 30]].map(([u, v]) => [x + u * s, y + v * s]);
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = VA.fill2; vaTrace(P, true); ctx.fill(); ctx.restore();
  vaStroke(P, VA.line, 3, { a, closed: true });
  for (const wx of [-85, 85]) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#04031a'; ctx.beginPath(); ctx.arc(x + wx * s, y + 30 * s, 28 * s, 0, TAU); ctx.fill(); ctx.restore(); vaRing(x + wx * s, y + 30 * s, 28 * s, VA.line, 3, a); }
  devDots('ca', x, y - 14 * s, 230 * s, 70 * s, 26, a);
}
function devGlobe(x, y, s, a) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = VA.fill2; ctx.beginPath(); ctx.arc(x, y, 100 * s, 0, TAU); ctx.fill(); ctx.restore();
  vaRing(x, y, 100 * s, VA.line, 3, a);
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = VA.dim; ctx.lineWidth = 2;
  for (const k of [0.35, 0.75]) { ctx.beginPath(); ctx.ellipse(x, y, 100 * s * k, 100 * s, 0, 0, TAU); ctx.stroke(); }
  for (const dy of [-50, 0, 50]) { const w = Math.sqrt(1 - (dy / 100) ** 2) * 100 * s; ctx.beginPath(); ctx.moveTo(x - w, y + dy * s); ctx.lineTo(x + w, y + dy * s); ctx.stroke(); }
  ctx.restore();
  devDots('gl', x, y, 140 * s, 140 * s, 30, a);
}
const DEV = [[devPhone, 320, 760], [devMonitor, 760, 760], [devCar, 320, 1140], [devGlobe, 760, 1140]];

// =====================================================================
//  the transistor: a slab in perspective with source (input), drain (output) and the gate between them
// =====================================================================
function mos(x, y, s, gate, a = 1, o = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const plate = [[x - 280 * s, y + 60 * s], [x + 280 * s, y + 60 * s], [x + 230 * s, y - 50 * s], [x - 230 * s, y - 50 * s]];
  ctx.fillStyle = '#17124a'; vaTrace(plate, true); ctx.fill(); vaStroke(plate, VA.line, 3, { closed: true });
  const pad = (x0, x1, c, k) => {
    const P = [[x0 * s + x, y + 40 * s], [x1 * s + x, y + 40 * s], [x1 * s + x - 18 * s, y - 30 * s], [x0 * s + x + 18 * s, y - 30 * s]];
    ctx.fillStyle = c; ctx.globalAlpha *= k; vaTrace(P, true); ctx.fill(); ctx.globalAlpha /= k; vaStroke(P, VA.minus, 2.5, { closed: true });
  };
  pad(-210, -80, '#0d5f86', 0.8); pad(80, 210, '#0d5f86', 0.8);
  // the channel under the gate: lights when the gate is on
  if (gate > 0) { const ch = [[x - 80 * s, y + 30 * s], [x + 80 * s, y + 30 * s], [x + 66 * s, y - 20 * s], [x - 66 * s, y - 20 * s]]; ctx.save(); ctx.globalAlpha *= gate; ctx.fillStyle = VA.minus; ctx.shadowColor = VA.minus; ctx.shadowBlur = 24; vaTrace(ch, true); ctx.fill(); ctx.restore(); }
  // the gate: a raised block
  const gy = y - 30 * s - 46 * s * (o.lift ?? 1);
  const top = [[x - 70 * s, gy + 34 * s], [x + 70 * s, gy + 34 * s], [x + 58 * s, gy], [x - 58 * s, gy]];
  const front = [[x - 70 * s, gy + 34 * s], [x + 70 * s, gy + 34 * s], [x + 70 * s, y + 4 * s], [x - 70 * s, y + 4 * s]];
  ctx.fillStyle = gate > 0.05 ? `rgba(212,98,242,${0.45 + 0.5 * gate})` : '#3a2a6a'; vaTrace(front, true); ctx.fill();
  ctx.fillStyle = gate > 0.05 ? '#f0a6ff' : '#5a4790'; vaTrace(top, true); ctx.fill();
  if (gate > 0.05) { ctx.save(); ctx.shadowColor = VA.plus; ctx.shadowBlur = 30 * gate; vaStroke(front, VA.plus, 2.5, { closed: true }); ctx.restore(); } else vaStroke(front, VA.dim, 2.5, { closed: true });
  ctx.restore();
}
// electrons from the input to the output, while the gate is on (blocked at the input while off)
function mosFlow(x, y, s, gate, a, n = 14, speed = 1) {
  for (let i = 0; i < n; i++) {
    const R = RNG('el', i), u = mod(TT * 0.6 * speed + R.f(), 1);
    let px, py = y + 6 * s + R.r(-16, 16) * s;
    if (gate > 0.5) px = x + lerp(-190, 190, u) * s;
    else px = x + lerp(-190, -96, R.f()) * s + Math.sin(TT * 6 + i) * 4;
    vaDot(px, py, 6 * s, VA.cream, a * (gate > 0.5 ? Math.sin(Math.PI * u) : 0.7));
  }
}

// =====================================================================
//  the beats
// =====================================================================
function beatTitle() {
  const a = fadeOut(VW('look', 'look') - 0.1, 0.3);
  if (a <= 0) return;
  OV(() => {
    vaText('The most important', CXT, 300, 74, VA.cream, { align: 'center', serif: true, a, frac: vaType(VL('title').t0, 'The most important', 24), glow: 8 });
    vaText('invention', CXT, 386, 74, VA.cream, { align: 'center', serif: true, a, frac: vaType(VW('title', 'invention') - 0.05, 'invention', 18), glow: 8 });
    vaText("you can't see.", CXT, 472, 74, VA.minus, { align: 'center', serif: true, italic: true, a, frac: vaType(VW('title', 'you') - 0.05, "you can't see.", 20), glow: 18 });
  });
  // one speck, too small to see, at the centre
  const p = 0.6 + 0.4 * Math.sin(TT * 3);
  vaDot(540, 960, 4, VA.minus, a * p); vaRing(540, 960, 14 + 6 * p, VA.minus, 2, a * 0.4);
}
function beatDevices() {
  const a = BW('look', 'same');
  if (a <= 0) return;
  const cues = [VW('look', 'phone'), VW('look', 'screen'), VW('look', 'car'), VW('look', 'internet')];
  const tg = VW('same', 'same') - 0.1, tb = VW('same', 'billions') - 0.2;
  DEV.forEach(([f, x, y], i) => {
    const pa = a * popS(cues[i] - 0.1) * (1 - 0.7 * EZ.io(clamp((TT - tb) / 1.2)));
    if (pa > 0) f(x, y, 1, pa);
  });
  // the same part: dots stream from every device into one point
  const st = clamp((TT - tg) / 2.4);
  if (st > 0) for (let i = 0; i < 60; i++) {
    const R = RNG('st', i), [, dx, dy] = DEV[i % 4], u = EZ.io(clamp(st * 1.4 - R.f() * 0.4));
    const sx = dx + R.r(-90, 90), sy = dy + R.r(-70, 70);
    vaDot(lerp(sx, 540, u), lerp(sy, 960, u), 3.5, VA.minus, a * (0.4 + 0.6 * u));
  }
  if (st > 0.6) { const k = clamp((st - 0.6) / 0.4); vaDot(540, 960, 8, VA.cream, a * k); vaRing(540, 960, 22, VA.minus, 3, a * k * 0.7); }
  cap('×  billions', 1480, tb, VA.minus, 56, { a, italic: true });
}
function beatSwitch() {
  const a = BW('switch');
  if (a <= 0) return;
  const ts = VW('switch', 'software') - 0.2, tw = VW('switch', 'switch') - 0.1, tsm = VW('switch', 'small') - 0.2;
  // "it isn't software": a line of code, struck out
  const ca = win(ts, tw, 0.25) * a;
  if (ca > 0) { vaText('if (smart) { run(); }', CXT, 960, 46, VA.dim, { align: 'center', a: ca }); vaLine(300, 945, 300 + 480 * EZ.o3(clamp((TT - ts - 0.4) / 0.4)), 945, VA.red, 4, { a: ca }); }
  // the switch symbol, shrinking to a speck on "too small to see"
  const sa = fadeIn(tw, 0.3) * a, sh = 1 - 0.97 * EZ.io(clamp((TT - tsm) / 1.0));
  if (sa > 0) zoomAbout(540, 960, sh, () => {
    vaRing(540, 960, 110, VA.line, 3, sa);
    vaLine(500, 900, 500, 1020, VA.minus, 5, { a: sa });
    vaLine(400, 960, 470, 960, VA.plus, 4, { a: sa }); vaLine(470, 900, 470, 1020, VA.plus, 4, { a: sa });
    vaStroke([[500, 930], [580, 880], [580, 820]], VA.minus, 4, { a: sa }); vaStroke([[500, 990], [580, 1040], [580, 1100]], VA.minus, 4, { a: sa });
    vaArrow(548, 1020, 572, 1035, VA.minus, 4, sa, 12);
  });
  cap('sand + metal', 1300, VW('switch', 'sand') - 0.1, VA.amber, 52, { a: a * fadeOut(tsm + 0.5, 0.3), italic: true });
  if (TT > tsm + 0.8) { const p = 0.6 + 0.4 * Math.sin(TT * 4); vaRing(540, 960, 12 + 8 * p, VA.minus, 2, a * 0.5); }
}
function beatTransistor() {   // parts, gate, fast, decide
  const a = BW('parts', 'decide');
  if (a <= 0) return;
  const tIn = VW('parts', 'input') - 0.1, tOut = VW('parts', 'output') - 0.1, tGate = VW('parts', 'gate') - 0.1;
  const tNo = VW('gate', 'no') - 0.1, tOn = VW('gate', 'voltage', 2) - 0.05, tFlip = VW('fast', 'flip') - 0.1, tChain = VW('decide', 'chain') - 0.1;
  // gate state: off, on at "Voltage on", flickering fast on "flip billions", steady pulsing in the chain
  let g = TT < tOn ? 0 : 1;
  if (TT > tFlip && TT < tChain) g = (Math.floor(TT * 18) % 2) ? 1 : 0;
  const pop = EZ.back(clamp((TT - SUB('parts') - 0.1) / 0.5));
  const s = lerp(1.5, 0.62, EZ.io(clamp((TT - tChain) / 1.0))) * pop;
  // the chain: copies around the centre, linked, signals running between them
  const ch = clamp((TT - tChain) / 1.2);
  if (ch > 0) {
    const pos = [[300, 760], [780, 760], [300, 1180], [780, 1180], [540, 640], [540, 1300]];
    pos.forEach(([px, py], i) => {
      const k = clamp(ch * 1.6 - i * 0.12);
      if (k <= 0) return;
      vaLine(540, 960, px, py, VA.dim, 2, { a: a * k * 0.6, dash: [6, 8] });
      const u = mod(TT * 0.9 + i * 0.3, 1); vaDot(lerp(540, px, u), lerp(960, py, u), 5, VA.plus, a * k);
      mos(px, py, 0.42, (Math.floor(TT * 3 + i) % 2) ? 1 : 0.1, a * k);
    });
  }
  mos(540, 960, s, g, a);
  mosFlow(540, 960, s, g, a, 14, TT > tFlip && TT < tChain ? 3 : 1);
  // labels under each part (centred under them)
  const la = a * fadeOut(tChain, 0.3);
  if (la > 0) {
    label('input', 540 - 145 * s, 960 + 110 * s, VA.minus, 34, la * fadeIn(tIn, 0.25));
    label('output', 540 + 145 * s, 960 + 110 * s, VA.minus, 34, la * fadeIn(tOut, 0.25));
    label('gate', 540, 960 - 120 * s, VA.plus, 34, la * fadeIn(tGate, 0.25));
  }
  cap('no voltage: no current', 1360, tNo, VA.text, 52, { a: a * fadeOut(tOn - 0.1, 0.2), italic: true });
  cap('voltage on: current flows', 1360, tOn, VA.minus, 52, { a: a * fadeOut(VL('gate').t1 + 0.4, 0.3), italic: true });
  cap('billions of times a second', 1360, tFlip, VA.plus, 52, { a: a * fadeOut(tChain, 0.3), italic: true });
  cap("that's a computer.", 1480, VW('decide', 'computer') - 0.2, VA.cream, 60, { a, italic: true });
}
// 1947: a germanium slab, a plastic wedge, two gold contacts; then the gap, zoomed
function beat1947() {
  const a = BW('first', 'gap');
  if (a <= 0) return;
  const tg = VW('parts47', 'germanium') - 0.1, tw = VW('parts47', 'wedge') - 0.2, tGold = VW('parts47', 'gold') - 0.1, tGap = VW('gap', 'gap') - 0.3, tHair = VW('gap', 'hair') - 0.6;
  cap('December 16, 1947', 330, VW('first', 'december') - 0.1, VA.cream, 64, { a: a * fadeOut(tGap, 0.3) });
  cap('Bell Labs', 410, VW('first', 'labs') - 0.1, VA.amber, 46, { a: a * fadeOut(tGap, 0.3), italic: true });
  const tip = [540, 1000];
  const z = 1 + 5 * EZ.io(clamp((TT - tGap) / 1.4));
  zoomAbout(tip[0], tip[1], z, () => {
    const sa = popS(SUB('first') + 0.5) * a;
    if (sa > 0) {
      const slab = [[220, 1100], [860, 1100], [800, 1000], [280, 1000]];
      ctx.save(); ctx.globalAlpha *= sa; ctx.fillStyle = '#2a2470'; vaTrace(slab, true); ctx.fill(); ctx.restore(); vaStroke(slab, VA.line, 3, { a: sa, closed: true });
    }
    const wa = fadeIn(tw, 0.3) * a;
    if (wa > 0) { const dy = 300 * (1 - EZ.o3(clamp((TT - tw) / 0.5))); const P = [[540, 720 - dy], [470, 1000 - dy], [610, 1000 - dy]]; ctx.save(); ctx.globalAlpha *= wa * 0.5; ctx.fillStyle = '#5a50b8'; vaTrace(P, true); ctx.fill(); ctx.restore(); vaStroke(P, VA.line, 2.5, { a: wa, closed: true }); }
    const ga = fadeIn(tGold, 0.3) * a;
    if (ga > 0) { vaGlow([[532, 760], [536.5, 1000]], VA.amber, 2.2 / Math.sqrt(z), ga); vaGlow([[548, 760], [543.5, 1000]], VA.amber, 2.2 / Math.sqrt(z), ga); }
  });
  // the hair: a translucent band beside the gap, at the same scale
  const ha = fadeIn(tHair, 0.4) * a;
  if (ha > 0) {
    const gw = 7 * z;   // the gap's width on screen
    ctx.save(); ctx.globalAlpha *= ha * 0.5; ctx.fillStyle = '#b8b0ff'; ctx.beginPath(); ctx.moveTo(700, 500); ctx.lineTo(700 + gw * 1.3, 500); ctx.lineTo(700 + gw * 1.3 + 60, 1400); ctx.lineTo(760, 1400); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  cap('the gap', 1200, tGap + 0.6, VA.amber, 72, { a: a * fadeIn(tGap + 0.6, 0.3), italic: true });
  cap('≈ the width of a hair', 1290, tHair + 0.3, VA.cream, 52, { a, italic: true });
  // what it was made of (before the zoom)
  const ma = a * fadeOut(tGap, 0.3);
  if (ma > 0) {
    cap('germanium', 1200, tg, VA.text, 44, { a: ma, italic: true });
    cap('two gold contacts', 1270, tGold, VA.amber, 44, { a: ma, italic: true });
    cap('a plastic wedge', 1340, tw, VA.line, 44, { a: ma, italic: true });
  }
}
// Moore: one square of silicon, the same part halving again and again
function beatShrink() {
  const a = BW('moore', 'shrink');
  if (a <= 0) return;
  const t0 = VW('moore', 'sixtyfive') - 0.4, tD = VW('moore', 'doubling') - 0.1, tT = VW('moore', 'target') - 0.2;
  const tE = VW('shrink', 'every'), tMm = VW('shrink', 'millimeters') - 0.1, tUm = VW('shrink', 'microns', 1) - 0.1, tNm = VW('shrink', 'nanometers') - 0.1, tL = VW('shrink', 'light') - 0.2;
  cap('1965', 330, t0, VA.cream, 80, { a });
  cap('Gordon Moore: ×2 every year', 410, VW('moore', 'gordon') - 0.1, VA.amber, 44, { a, italic: true });
  // subdivision level: 0 → 1 → 2 … climbing through both lines
  const lev = TT < tD ? 0 : TT < tE ? 1 + 2 * clamp((TT - tD) / (tE - tD)) : 3 + 5 * clamp((TT - tE) / (tL - tE));
  const x0 = 260, y0 = 680, S0 = 560;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#120e3a'; ctx.fillRect(x0, y0, S0, S0); ctx.restore();
  const L = Math.floor(lev), fr = lev - L;
  for (let k = 1; k <= L + 1; k++) {
    const n = 2 ** k, al = k <= L ? 1 : fr, fade = a * al * clamp(1.4 - k * 0.12) * (TT > tL ? fadeOut(tL + 0.4, 1.2) : 1);
    if (fade <= 0.01 || n > 256) continue;
    for (let i = 1; i < n; i++) {
      vaLine(x0 + S0 * i / n, y0, x0 + S0 * i / n, y0 + S0, VA.minus, k < 4 ? 2 : 1, { a: fade * (k < 4 ? 0.9 : 0.5) });
      vaLine(x0, y0 + S0 * i / n, x0 + S0, y0 + S0 * i / n, VA.minus, k < 4 ? 2 : 1, { a: fade * (k < 4 ? 0.9 : 0.5) });
    }
  }
  vaStroke([[x0, y0], [x0 + S0, y0], [x0 + S0, y0 + S0], [x0, y0 + S0]], VA.minus, 3, { a, closed: true });
  // past light: the grid dissolves into a fog
  if (TT > tL) { ctx.save(); ctx.globalAlpha *= a * fadeIn(tL + 0.3, 1.0) * 0.8; ctx.fillStyle = '#2a2470'; ctx.fillRect(x0, y0, S0, S0); ctx.restore(); }
  // the scale
  const unit = TT < tUm ? 'mm' : TT < tNm ? 'µm' : 'nm';
  if (TT > tMm - 0.1) cap(unit === 'mm' ? 'millimeters' : unit === 'µm' ? 'microns' : 'nanometers', 1300, unit === 'mm' ? tMm : unit === 'µm' ? tUm : tNm, VA.minus, 56, { a, italic: true, cps: 40 });
  const la = fadeIn(tL, 0.3) * a;
  if (la > 0) { vaLine(250, 1360, 830, 1360, VA.amber, 3, { a: la, dash: [10, 10] }); OV(() => vaText('visible light: 400–700 nm', CXT, 1420, 40, VA.amber, { align: 'center', serif: true, italic: true, a: la })); }
  cap('a target', 1300, tT, VA.cream, 52, { a: a * fadeOut(tE, 0.25), italic: true });
}
// the chip on a fingertip; 28 billion; per square millimetre
function beatChip() {
  const a = BW('chip', 'mm');
  if (a <= 0) return;
  const tF = VW('chip', 'fingertip') - 0.3, tN = VW('chip', 'twentyeight') - 0.2, tMm = VW('mm', 'over') - 0.1;
  // the fingertip: a rounded capsule from below
  const fa = fadeIn(tF, 0.4) * a;
  if (fa > 0) {
    ctx.save(); ctx.globalAlpha *= fa; ctx.fillStyle = '#1a1548'; ctx.beginPath(); ctx.moveTo(380, 1500); ctx.lineTo(380, 1010); ctx.arc(540, 1010, 160, Math.PI, 0); ctx.lineTo(700, 1500); ctx.closePath(); ctx.fill(); ctx.restore();
    vaStroke([[380, 1500], [380, 1010], ...vaArcPts(540, 1010, 160, Math.PI, TAU, 24), [700, 1500]], VA.line, 3, { a: fa });
    for (const ky of [1330, 1350, 1440]) vaStroke(vaArcPts(540, ky - 260, 300, Math.PI * 0.38, Math.PI * 0.62, 12), VA.dim, 2.5, { a: fa * 0.8 });   // knuckle creases
    for (let r = 0; r < 7; r++) vaStroke(vaArcPts(540, 1060, 60 + r * 16, Math.PI * 1.05, Math.PI * 1.95, 20), VA.dim, 2, { a: fa * 0.7 });   // fingerprint ridges
  }
  // the chip: a square with four blocks
  const cs = 150, cx = 540, cy = 1040, ca = popS(SUB('chip') + 0.2) * a;
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha *= ca; ctx.fillStyle = '#13306a'; ctx.fillRect(cx - cs / 2, cy - cs / 2, cs, cs); ctx.restore();
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) vaStroke([[cx + dx * 8, cy + dy * 8], [cx + dx * 66, cy + dy * 8], [cx + dx * 66, cy + dy * 66], [cx + dx * 8, cy + dy * 66]], VA.minus, 2.5, { a: ca, closed: true });
    vaStroke([[cx - cs / 2, cy - cs / 2], [cx + cs / 2, cy - cs / 2], [cx + cs / 2, cy + cs / 2], [cx - cs / 2, cy + cs / 2]], VA.minus, 3, { a: ca, closed: true });
    devDots('chip', cx, cy, cs - 10, cs - 10, 50, ca);
  }
  // 28,000,000,000
  const na = fadeIn(tN, 0.2) * a;
  if (na > 0) { const n = Math.round(28e9 * EZ.o3(clamp((TT - tN) / 1.2)) / 1e6) * 1e6; OV(() => { vaText(n.toLocaleString('en-US'), CXT, 420, 72, VA.cream, { align: 'center', serif: true, a: na, glow: 10 }); vaText('transistors inside', CXT, 490, 40, VA.minus, { align: 'center', serif: true, italic: true, a: na }); }); }
  // per square millimetre: an inset from the chip's corner
  const ma = fadeIn(tMm, 0.3) * a;
  if (ma > 0) {
    vaStroke([[cx + 50, cy - 75], [cx + 75, cy - 75], [cx + 75, cy - 50], [cx + 50, cy - 50]], VA.amber, 2.5, { a: ma, closed: true });
    vaLine(cx + 75, cy - 75, 830, 620, VA.amber, 1.5, { a: ma * 0.6, dash: [5, 7] }); vaLine(cx + 50, cy - 50, 650, 800, VA.amber, 1.5, { a: ma * 0.6, dash: [5, 7] });
    ctx.save(); ctx.globalAlpha *= ma; ctx.fillStyle = '#1a1548'; ctx.fillRect(650, 620, 180, 180); ctx.restore();
    vaStroke([[650, 620], [830, 620], [830, 800], [650, 800]], VA.amber, 3, { a: ma, closed: true });
    devDots('mm', 740, 710, 170, 170, 90, ma);
    label('1 mm²', 740, 845, VA.amber, 30, ma);
    cap('100,000,000+ per mm²', 1480, tMm + 0.1, VA.amber, 52, { a, italic: true });
  }
}
// "3 nm": a name, not a size; the gates are ~45 nm apart
function beatName() {
  const a = BW('name');
  if (a <= 0) return;
  const t3 = VW('name', 'three', 1) - 0.1, tNo = VW('name', 'nothing') - 0.1, tB = VW('name', 'brand') - 0.1, tG = VW('name', 'gates') - 0.2;
  const big = fadeIn(t3, 0.25) * a * fadeOut(tG, 0.3);
  if (big > 0) {
    OV(() => vaText('3 nm', CXT, 1010, 170, VA.cream, { align: 'center', serif: true, a: big, glow: 14 }));
    const st = EZ.o3(clamp((TT - tNo) / 0.5));
    if (st > 0) vaGlow([[340, 960], [340 + 400 * st, 960]], VA.plus, 7, big);
  }
  cap('a brand name', 1200, tB, VA.plus, 56, { a: a * fadeOut(tG, 0.3), italic: true });
  // two gates, ~45 nm apart
  const ga = fadeIn(tG, 0.3) * a;
  if (ga > 0) {
    for (const gx of [380, 700]) { ctx.save(); ctx.globalAlpha *= ga; ctx.fillStyle = 'rgba(212,98,242,0.7)'; ctx.shadowColor = VA.plus; ctx.shadowBlur = 20; ctx.fillRect(gx - 40, 820, 80, 300); ctx.restore(); }
    vaLine(260, 1120, 820, 1120, VA.minus, 3, { a: ga });
    vaRule(380, 790, 700, 790, '', VA.text, 30, ga);
    cap('≈ 45 nm apart', 1240, tG + 0.3, VA.cream, 60, { a, italic: true });
  }
}
// the floor: nanosheets a few nm thick, a few dozen atoms; below that, current leaks through
function beatFloor() {
  const a = BW('floor');
  if (a <= 0) return;
  const tS = VW('floor', 'sheets') - 0.3, tA = VW('floor', 'atoms') - 0.5, tF = VW('floor', 'floor') - 0.2, tL = VW('floor', 'leaks') - 0.3;
  // three stacked sheets wrapped by the gate
  const sa = fadeIn(SUB('floor') + 0.2, 0.4) * a * fadeOut(tA, 0.4);
  if (sa > 0) for (let k = 0; k < 3; k++) {
    const y = 860 + k * 110, P = [[300, y + 30], [780, y + 30], [740, y - 20], [340, y - 20]];
    ctx.save(); ctx.globalAlpha *= sa * 0.8; ctx.fillStyle = '#0d5f86'; vaTrace(P, true); ctx.fill(); ctx.restore(); vaStroke(P, VA.minus, 2.5, { a: sa, closed: true });
    const u = mod(TT * 0.7 + k * 0.3, 1); vaDot(lerp(330, 750, u), y + 5, 6, VA.cream, sa * Math.sin(Math.PI * u));
  }
  if (sa > 0) { ctx.save(); ctx.globalAlpha *= sa * 0.35; ctx.fillStyle = VA.plus; ctx.fillRect(480, 800, 120, 380); ctx.restore(); vaStroke([[480, 800], [600, 800], [600, 1180], [480, 1180]], VA.plus, 2.5, { a: sa, closed: true }); label('gate', 540, 785, VA.plus, 30, sa); }
  cap('a few nanometers thick', 1360, tS, VA.minus, 52, { a: a * fadeOut(tA, 0.3), italic: true });
  // atoms: a few dozen circles across one sheet, then the floor, then the leak
  const aa = fadeIn(tA, 0.4) * a;
  if (aa > 0) {
    const n = 26, x0 = 200, x1 = 880;
    for (let j = 0; j < 3; j++) for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, i / (n - 1)), y = 920 + j * 26 + (i % 2) * 6;
      vaRing(x, y, 11, VA.minus, 2, aa * 0.9); vaDot(x, y, 3, VA.minus, aa * 0.8);
    }
    cap('a few dozen atoms', 1360, tA + 0.2, VA.minus, 52, { a: a * fadeOut(tF - 0.35, 0.25), italic: true });
  }
  const fa = fadeIn(tF, 0.3) * a;
  if (fa > 0) { vaGlow([[180, 1040], [900, 1040]], VA.amber, 4, fa); cap('the floor', 1360, tF, VA.amber, 60, { a: a * fadeOut(tL, 0.25) }); }
  const la = fadeIn(tL, 0.3) * a;
  if (la > 0) {
    // a barrier; electrons that should stop pass straight through, ghosted
    ctx.save(); ctx.globalAlpha *= la * 0.5; ctx.fillStyle = '#3a2f8e'; ctx.fillRect(520, 1100, 40, 220); ctx.restore();
    for (let i = 0; i < 6; i++) { const u = mod(TT * 0.5 + i / 6, 1), x = lerp(300, 800, u), inside = x > 520 && x < 560; vaDot(x, 1150 + i * 30, 7, VA.cream, la * (inside ? 0.3 : 0.9) * Math.sin(Math.PI * u)); }
    cap('current leaks through', 1440, tL, VA.red, 52, { a, italic: true });
  }
}
// 13 sextillion
function beatCount() {
  const a = BW('count', 'never');
  if (a <= 0) return;
  const t = VW('count', 'thirteen') - 0.3, tM = VW('count', 'manufactured') - 0.3;
  const digits = '13,000,000,000,000,000,000,000';
  const u = EZ.o3(clamp((TT - t) / 1.4)), k = Math.round(u * 22);   // digits appear left to right
  const shown = digits.slice(0, 2 + Math.ceil(k * (digits.length - 2) / 22));
  OV(() => {
    const ca = a * fadeIn(t, 0.2) * fadeOut(VL('count').t1 + 0.5, 0.6);
    vaText(shown, CXT, 900, 44, VA.cream, { align: 'center', serif: true, a: ca, glow: 10 });
    vaText('transistors made', CXT, 970, 40, VA.minus, { align: 'center', serif: true, italic: true, a: ca * fadeIn(t + 0.6, 0.3) });
    vaText('the most manufactured object', CXT, 1150, 46, VA.amber, { align: 'center', serif: true, italic: true, a: ca * fadeIn(tM, 0.3), frac: vaType(tM, 'the most manufactured object', 30) });
    vaText('in human history', CXT, 1214, 46, VA.amber, { align: 'center', serif: true, italic: true, a: ca * fadeIn(tM + 0.6, 0.3), frac: vaType(tM + 0.6, 'in human history', 24) });
  });
  // a rain of specks behind the number: each one a transistor
  for (let i = 0; i < 160; i++) { const R = RNG('cnt', i), y = mod(R.r(0, 1920) + TT * R.r(40, 120), 1920); vaDot(R.r(60, 1020), y, 2, VA.minus, a * u * 0.5 * fadeOut(VL('count').t1 + 0.5, 0.6)); }
  // never: one speck alone
  const na = fadeIn(VW('never', 'never') - 0.2, 0.5) * a;
  if (na > 0) { const p = 0.6 + 0.4 * Math.sin(TT * 3); vaDot(540, 960, 4, VA.minus, na * p); vaRing(540, 960, 14 + 6 * p, VA.minus, 2, na * 0.4); }
}
// the payoff: everything rebuilt on top of one transistor
function beatEnd() {
  if (TT < HIT - 0.1) return;
  const u = (d) => EZ.back(clamp((TT - HIT - d) / 0.5));
  const k = flashK(HIT, 1.0);
  vaDot(540, 1300, 10, VA.cream, 1); vaRing(540, 1300, 20 + 200 * EZ.o3(clamp((TT - HIT) / 0.8)), VA.minus, 3, 1 - clamp((TT - HIT) / 0.8));
  mos(540, 1300, 0.5 * u(0), 1, 1);
  // the chip above it, then the devices above that, linked down
  const c = u(0.35);
  if (c > 0) { ctx.save(); ctx.globalAlpha *= c; ctx.fillStyle = '#13306a'; ctx.fillRect(540 - 70, 1100 - 70, 140, 140); ctx.restore(); vaStroke([[470, 1030], [610, 1030], [610, 1170], [470, 1170]], VA.minus, 3, { a: c, closed: true }); devDots('chip2', 540, 1100, 130, 130, 40, c); vaLine(540, 1170, 540, 1260, VA.minus, 2.5, { a: c }); }
  [[devPhone, 230, 800, 0.62], [devMonitor, 435, 790, 0.62], [devCar, 645, 815, 0.62], [devGlobe, 850, 800, 0.62]].forEach(([f, x, y, s], i) => {
    const d = u(0.7 + i * 0.12);
    if (d <= 0) return;
    f(x, y, s * d, d);
    vaLine(x, y + 80, 540, 1030, VA.dim, 2, { a: d * 0.7, dash: [6, 8] });
    const p = mod(TT * 0.8 + i * 0.25, 1); vaDot(lerp(540, x, p), lerp(1030, y + 80, p), 4, VA.plus, d);
  });
  OV(() => {
    const t1 = VW('end', 'everything') - 0.1;
    vaText('Everything else', CXT, 360, 74, VA.cream, { align: 'center', serif: true, a: fadeIn(t1, 0.3), frac: vaType(t1, 'Everything else', 22), glow: 10 });
    vaText('is built on top of it.', CXT, 450, 66, VA.minus, { align: 'center', serif: true, italic: true, a: fadeIn(VW('end', 'built') - 0.1, 0.3), frac: vaType(VW('end', 'built') - 0.1, 'is built on top of it.', 24), glow: 16 });
    const na = fadeIn(VL('end').t1 + 0.2, 0.5);
    if (na > 0) {
      ctx.save(); ctx.font = `700 46px ${VMONO}`; const wB = ctx.measureText('Bit').width, wV = ctx.measureText('volts').width; ctx.restore();
      const x0 = CXT - (wB + wV) / 2;
      vaText('Bit', x0, 1475, 46, VA.minus, { weight: 700, a: na, glow: 12 }); vaText('volts', x0 + wB, 1475, 46, VA.plus, { weight: 700, a: na, glow: 12 });
    }
  });
  return k;
}

// =====================================================================
//  the stage
// =====================================================================
function sceneStage() {
  const c = camAtT(); CAMZ = c.z;
  const warm = TT >= HIT ? flashK(HIT, 1.2) * 0.6 : TT >= SUB('first') && TT < SUBEND('gap') ? 0.2 * BW('first', 'gap') : 0;
  vaBg(warm);
  vaGridBg(c);
  gridPulses(c);
  vaSpecks(40, 0.3);
  setCam(c);
  beatTitle(); beatDevices(); beatSwitch(); beatTransistor(); beat1947(); beatShrink(); beatChip(); beatName(); beatFloor(); beatCount(); beatEnd();
}
