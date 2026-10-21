// =====================================================================
//  S3 — the scale, the strangest part, a cat never seen, downhill; the stage, the camera and the sound cues
// =====================================================================
const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function beatScale() {
  const a = win(S_SCALE + 0.2, VL('strange').t0 - 0.3, 0.4); if (a <= 0) return;
  const tB = VW('llm', 'hundreds') - 0.1, tT = VW('llm', 'trillions') - 0.1, tS = VL('size').t0;
  // a field of dots that multiplies: 151, then far too many to count
  const nDots = Math.round(151 * Math.pow(30, EZ.i2(seg(TT, tB, tB + 2.2))));
  for (let i = 0; i < Math.min(nDots, 4500); i++) {
    const R = RNG('fld', i), x = R.r(60, 1020), y = R.r(260, 1660), tw = 0.35 + 0.35 * Math.sin(TT * R.r(1, 3) + i);
    bpDot(x, y, i < 151 ? 4.5 : 2.6, i < 151 ? BP.yellow : bpMix(BP.yellow, BP.ground, 0.45), a * tw * (i < 151 ? 1 : 0.8) * fadeIn(S_SCALE + 0.2 + (i % 151) * 0.018, 0.2));
  }
  OV(() => {
    const big = TT < tB ? Math.round(151 * EZ.o2(seg(TT, S_SCALE + 0.3, VL('count').t1))) : Math.round(lerp(151, 175e9, EZ.i2(seg(TT, tB, tB + 1.6))));
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = bpA(BP.ground, 0.82); ctx.fillRect(40, 690, 1000, 330); ctx.restore();
    bpText(big <= 151 ? String(big) : commas(big), 540, 860, big <= 151 ? 200 : 104, BP.yellow, { font: BP.mono, weight: 700, alpha: a, glow: 24 });
    bpText('weights', 540, 940, 50, BP.soft, { font: BP.mono, alpha: a });
    const ga = fadeIn(VW('llm', 'billions'), 0.3);
    if (ga > 0) bpText('GPT-3 (2020): 175 billion', 540, 1000, 38, BP.soft, { font: BP.mono, alpha: a * ga });
    const wa = fadeIn(tT, 0.35);
    if (wa > 0) { bpText('15,000,000,000,000+', 540, 1250, 76, BP.mint, { font: BP.mono, weight: 700, alpha: a * wa }); bpText('tokens read · Llama 3 (2024)', 540, 1320, 38, BP.soft, { font: BP.mono, alpha: a * wa }); }
    const sa = fadeIn(tS, 0.3);
    if (sa > 0) bpLines([{ t: 'Change the size.', c: BP.text }, { t: 'Same operation.', c: BP.mint, i: true }], 540, 420, 76, BP.text, a * sa);
  });
  caption([{ t: '2 × 10 + 10 + 10 × 10 + 10 + 10 + 1', c: BP.soft }], win(VW('count', 'hundred') - 0.2, tB - 0.1) * 1, 1180, 40, { font: BP.mono });
}

function beatStrange() {
  const a = win(VL('strange').t0 - 0.05, HIT, 0.25); if (a <= 0) return;
  OV(() => bpText('the strangest part', 540, 960, 86, BP.magenta, { italic: true, alpha: a, glow: 18 }));
}

// the payoff: the trained field without its examples; numbers carved into it; unseen points, all right; a new cat
function beatUnseen() {
  const a = win(HIT, S_END + 0.5, 0.15); if (a <= 0) return;
  const Wt = NN.WF, tM = VL('moved').t0, tC = VL('cat').t0;
  const burst = EZ.i2(seg(TT, HIT + 0.05, HIT + 1.1)), fieldA = a * (1 - fadeIn(tC + 0.2, 0.5) * 0.92);
  drawPlane(fieldA, Wt, 'final', { burst, dotA: () => 1 - burst, wrong: false });
  if (burst < 1) OV(() => bpText('0 examples kept', 540, 360, 64, BP.magenta, { font: BP.mono, weight: 700, alpha: a * fadeIn(HIT + 0.3, 0.3) }));
  else OV(() => bpText('0 examples kept', 540, 360, 64, BP.magenta, { font: BP.mono, weight: 700, alpha: a * fadeOut(tM + 1.2, 0.4) }));
  // the 151 weights, as numbers, falling into the field
  const W = NN.flat(Wt), mu = seg(TT, tM, tM + 3.2);
  if (mu > 0 && mu < 1) W.forEach((w, i) => {
    const R = RNG('wfall', i), u = clamp((mu - R.r(0, 0.6)) / 0.4); if (u <= 0 || u >= 1) return;
    const x0 = R.r(120, 960), y0 = R.r(-40, 240), [x1, y1] = planeXY(R.r(-1.6, 1.6), R.r(-1.6, 1.6));
    bpText(w.toFixed(2), lerp(x0, x1, EZ.i2(u)), lerp(y0, y1, EZ.i2(u)), 26, BP.yellow, { font: BP.mono, alpha: a * (1 - u * 0.7) });
  });
  OV(() => bpText('151 numbers', 540, 1340, 56, BP.yellow, { font: BP.mono, alpha: a * win(tM + 0.3, VW('cat', 'recognizes') - 0.95, 0.3) }));
  // unseen points land, each one judged right
  const ua = fadeIn(VW('cat', 'recognizes') - 0.6, 0.3);
  let right = 0;
  NN.XT.forEach(([x, y, c], i) => {
    const t0 = VW('cat', 'recognizes') - 0.6 + i * 0.06, s = EZ.back(seg(TT, t0, t0 + 0.25)); if (s <= 0) return;
    const [px, py] = planeXY(x, y), ok = (NN.predict(Wt, x, y) > 0.5) === !!c; if (ok && s >= 1) right++;
    bpDot(px, py, 12 * s, '#ffffff', fieldA); ctx.save(); ctx.globalAlpha = fieldA; ctx.strokeStyle = ok ? BP.mint : BP.magenta; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(px, py, 20 * s, 0, TAU); ctx.stroke(); ctx.restore();
  });
  if (ua > 0) OV(() => { bpText('points it has never seen', 540, 1340, 44, BP.text, { font: BP.mono, alpha: a * ua * fadeOut(tC + 0.3) }); bpText(`${right} / ${NN.XT.length}`, 540, 1440, 84, BP.mint, { font: BP.mono, weight: 700, alpha: a * ua * fadeOut(tC + 0.4) }); });
  // a new cat, never seen, assembling over the field; CAT ✓
  const cb = seg(TT, tC + 0.1, VW('cat', 'seen') + 0.2);
  if (cb > 0) {
    drawCat(CAT_B, 540, 900, 44, a, { build: cb });
    const k = EZ.back(seg(TT, VW('cat', 'seen'), VW('cat', 'seen') + 0.3));
    OV(() => { bpText('CAT', 520, 1300, 92, BP.mint, { font: BP.mono, weight: 700, alpha: a * fadeIn(VW('cat', 'seen') - 0.2, 0.25), spacing: 8 });
      if (k > 0) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = BP.mint; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(650, 1272); ctx.lineTo(650 + 18 * k, 1292); ctx.lineTo(650 + 52 * k, 1292 - 46 * k); ctx.stroke(); ctx.restore(); } });
  }
}

// the end: downhill, blindfolded; Bitstory
function beatEnd() {
  if (TT < S_END) return;
  caption([{ t: 'Learning is walking downhill,', c: BP.text }, { t: 'blindfolded, millions of times.', c: BP.mint, i: true }], fadeIn(VL('end').t0, 0.4), 380, 58);
  const tS = VL('end').t1 + 0.1, sa = fadeIn(tS, 0.2);
  if (sa > 0) OV(() => {
    ctx.save(); ctx.font = `700 72px ${BP.mono}`; const w1 = ctx.measureText('Bit').width, w = ctx.measureText('Bitstory').width; ctx.restore();
    const n = Math.round(8 * seg(TT, tS, tS + 0.6)), x0 = 540 - w / 2;
    bpText('Bit'.slice(0, n), x0, 1482, 72, BP.mint, { font: BP.mono, weight: 700, align: 'left', alpha: sa, glow: 18 });
    if (n > 3) bpText('story'.slice(0, n - 3), x0 + w1, 1482, 72, BP.magenta, { font: BP.mono, weight: 700, align: 'left', alpha: sa, glow: 18 });
    if (n < 8 || Math.floor(TT * 2.5) % 2) { ctx.save(); ctx.globalAlpha = sa; ctx.fillStyle = BP.text; ctx.font = `700 72px ${BP.mono}`; const cw = ctx.measureText('Bitstory'.slice(0, n)).width; ctx.fillRect(x0 + cw + 6, 1426, 30, 64); ctx.restore(); }
  });
}

// =====================================================================
//  the stage and the camera
// =====================================================================
function sceneStage() {
  bpGround();
  for (let i = 0; i < 26; i++) {   // motes: slow drifting dust
    const R = RNG('mote', i), x = mod(R.r(0, W) + TT * R.r(-8, 8), W), y = mod(R.r(0, H) - TT * R.r(4, 14), H);
    bpDot(x, y, R.r(1.5, 3), BP.dim, 0.35 + 0.25 * Math.sin(TT * R.r(0.5, 1.5) + i));
  }
  beatCat(); beatNeuron(); beatNetwork(); beatLand(); beatBack(); beatBoundary(); beatScale(); beatStrange(); beatUnseen(); beatEnd();
  const fl = 1 - seg(TT, HIT, HIT + 0.3);   // the hit: a mint flash
  if (fl > 0 && fl < 1) OV(() => { ctx.save(); ctx.globalAlpha = 0.5 * fl * fl; ctx.fillStyle = BP.mint; ctx.fillRect(-100, 0, W + 200, H); ctx.restore(); });
}
function pieceCam(era, t) {
  // slow push on the cat, a push toward the bottom of the bowl on "flat", a slow drift everywhere
  const slow = 1 + 0.07 * EZ.io(seg(t, VL('neuron').t0, S_NET)) * (1 - seg(t, S_NET, S_NET + 0.8)) + 0.06 * EZ.io(seg(t, VL('compare').t0, S_LAND)) * (1 - seg(t, S_LAND, S_LAND + 0.6))
    + 0.08 * EZ.io(seg(t, VL('blame').t0, S_BND)) * (1 - seg(t, S_BND, S_BND + 0.6)) + 0.08 * EZ.io(seg(t, VL('nobody').t0, S_SCALE)) * (1 - seg(t, S_SCALE, S_SCALE + 0.6));
  const z = slow * springTrack([[0, 1.0], [0.3, 1.05], [S_NEU, 1.0], [VL('flat').t0, 1.12], [VL('gd').t0 + 0.3, 1.0], [S_BND, 1.0], [VL('nobody').t0, 1.06], [S_SCALE, 1.0]], SPRING.heavy) * (1 + 0.01 * Math.sin(t * 0.4));
  const py = springTrack([[0, 960], [VL('flat').t0, 1150], [VL('gd').t0 + 0.3, 960]], SPRING.heavy);
  return camOf({ z, p: [540, py], to: [540 + SHIFT, py] });
}

// =====================================================================
//  the sound-effect cues (synthesized in src/score.js)
// =====================================================================
window.SFX_CUES = (() => {
  const C = [], q = (t) => +t.toFixed(3), add = (id, t, pan = 0) => C.push({ id, t: q(t), pan });
  for (let i = 0; i < 12; i++) add('pix' + i, 0.15 + i * 0.16, (i % 5 - 2) * 0.15);       // the cat's pixels landing
  add('check', VW('rules', 'right') - 0.05);
  add('numbers', VL('numbers').t0 + 0.1);
  ['inputs', 'weight', 'adds', 'squashes'].forEach((w, i) => add('op' + i, VW('neuron', w), -0.2 + i * 0.13));
  add('curve', VW('neuron', 'curve') + 0.6);
  for (let l = 0; l < 4; l++) add('layer' + l, VW('stack', 'stacking') - 0.2 + l * 0.45, (l - 1.5) * 0.2);
  add('flow', VW('layers', 'layer', 2) - 0.2); add('flow2', VW('twoin', 'go'));
  add('pixels', VW('pixels', 'thousands') - 0.2);
  add('flicker', VL('random').t0 + 0.2);
  add('says', VW('compare', 'answer') - 0.2); add('should', VW('compare', 'right') - 0.1);
  add('err', VL('error').t0 - 0.05);
  add('rise', VL('landscape').t0);
  let last = -9; for (let t = VW('down', 'down'); t < VL('flat').t1; t += 0.02) {   // a soft step per visible descent step
    const s = Math.floor(stepAt(t)); if (s > (C._s ?? -1) && t - last > 0.14) { C._s = s; last = t; add('step', t, 0.1); } }
  add('gd', VW('gd', 'gradient') - 0.1);
  add('back', VW('back', 'backwards') - 0.4); add('back2', VW('back', 'layer') - 0.1);
  add('y1986', VW('bp', 'nineteen') - 0.1);
  for (let k = 0; k < 14; k++) add('epoch', lerp(VL('learning').t0, VL('nobody').t1, Math.pow(k / 13, 0.7)), 0.15);
  add('count', VW('count', 'hundred') - 0.2);
  add('swell', VW('llm', 'hundreds') - 0.1); add('tokens', VW('llm', 'trillions') - 0.1);
  add('size', VL('size').t0);
  add('hit', HIT);
  add('burst', HIT + 0.1);
  add('fall', VL('moved').t0 + 0.4);
  for (let i = 0; i < NN.XT.length; i += 2) add('unseen', VW('cat', 'recognizes') - 0.6 + i * 0.06, 0.2);
  add('check2', VW('cat', 'seen'));
  const tS = VL('end').t1 + 0.1; for (let i = 0; i < 8; i++) add('key' + i, tS + (i + 0.5) * 0.6 / 8, -0.2 + i * 0.05);
  delete C._s;
  return C.sort((a, b) => a.t - b.t);
})();
