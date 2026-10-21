// =====================================================================
//  S1 — the cat, only numbers, one neuron, the layers, random weights and the error
// =====================================================================
const NEU = { x: [-0.58, 0.31] };                       // the two inputs shown (a real data point's scale)
const NEU_W = [NN.W0[0].m[0][0], NN.W0[0].m[0][1]], NEU_B = NN.W0[0].b[0];
const NEU_Z = NEU.x[0] * NEU_W[0] + NEU.x[1] * NEU_W[1] + NEU_B, NEU_A = Math.tanh(NEU_Z);
const NET_X = NN.X[3];                                   // the example pushed through the network
const NET_OUT0 = NN.predict(NN.W0, NET_X[0], NET_X[1]), NET_Y = NN.Y[3];

// 1 — a pixel cat assembles; CAT ✓
function beatCat() {
  const a = fadeOut(VW('numbers', 'only') - 0.2, 0.5); if (a <= 0) return;
  const build = seg(TT, 0.1, VL('open').t1);
  // "only numbers": every cell turns into its pixel value, then the cat dissolves into the neuron's two inputs
  const toNum = EZ.io(seg(TT, VL('numbers').t0, VW('numbers', 'numbers') + 0.2));
  const blink = [3.6, 5.2, 7.4, 8.6].some((b) => TT > b && TT < b + 0.16) ? 1 : 0;
  if (toNum < 1) drawCat(CAT_A, 540, 820, 46, a * (1 - toNum), { build, blink, bob: 6 * fadeIn(VL('open').t1, 0.5) });
  if (toNum > 0) catCells(CAT_A).forEach((c, i) => {
    const v = c.k === 'X' ? 0.62 + 0.3 * RNG('px', i).f() : c.k === 'M' ? 0.18 : 0.94;
    bpText(v.toFixed(2), 540 + c.x * 46, 820 + c.y * 46 + 7, 17, catColor(c.k), { font: BP.mono, alpha: a * toNum });
  });
  const ca = win(VW('rules', 'still') - 0.2, VW('numbers', 'only'), 0.3);
  if (ca > 0) OV(() => {
    bpText('CAT', 520, 1260, 92, BP.mint, { font: BP.mono, weight: 700, alpha: ca, spacing: 8 });
    const k = EZ.back(seg(TT, VW('rules', 'right') - 0.1, VW('rules', 'right') + 0.25));
    if (k > 0) { ctx.save(); ctx.globalAlpha = ca; ctx.strokeStyle = BP.mint; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(650, 1232); ctx.lineTo(650 + 18 * k, 1252 * 1 + 0 * k); ctx.lineTo(650 + 18 * k + 34 * k, 1252 - 46 * k); ctx.stroke(); ctx.restore(); }
  });
  caption([{ t: 'No rules.', c: BP.text }, { t: 'Still right.', c: BP.mint, i: true }], win(VW('rules', 'no'), VL('inside').t0 - 0.1), 1440, 70);
  caption([{ t: 'only numbers', c: BP.yellow, i: true }], win(VW('numbers', 'only') - 0.1, B0('neuron') + 0.6), 1430, 76);
}

// 2 — one neuron: inputs x weights, add, squash
function beatNeuron() {
  const a = win(VW('numbers', 'only') + 0.1, S_NET + 0.5, 0.5); if (a <= 0) return;
  const tIn = VW('neuron', 'inputs'), tW = VW('neuron', 'weight'), tAdd = VW('neuron', 'adds'), tSq = VW('neuron', 'squashes'), tCv = VW('neuron', 'curve');
  const n = [720, 860], i1 = [270, 660], i2 = [270, 1060];
  ctx.save(); ctx.globalAlpha = a;
  // edges with their weights (yellow)
  [[i1, NEU_W[0], -1], [i2, NEU_W[1], 1]].forEach(([p, w, s], k) => {
    const f = EZ.io(seg(TT, tIn + k * 0.15, tIn + 0.6 + k * 0.15));
    ctx.strokeStyle = BP.yellow; ctx.lineWidth = 3 + 3 * clamp(Math.abs(w) / 2); ctx.globalAlpha = a * 0.8;
    ctx.beginPath(); ctx.moveTo(p[0] + 54, p[1]); ctx.lineTo(lerp(p[0] + 54, n[0] - 74, f), lerp(p[1], n[1], f)); ctx.stroke();
    const wa = fadeIn(tW + k * 0.2, 0.3);
    if (wa > 0) bpPill(`w${k + 1} ${fmt(w)}`, (p[0] + n[0]) / 2 - 10, (p[1] + n[1]) / 2 + s * 70, 40, BP.yellow, a * wa);
    // the input value travelling along its edge on "multiplies"
    const u = TT < tAdd ? seg(TT, tW + 0.3, tAdd) : mod((TT - tAdd) / 0.9 + k * 0.5, 1); if (TT > tW + 0.3 && u > 0 && u < 1) bpDot(lerp(p[0] + 54, n[0] - 74, u), lerp(p[1], n[1], u), 11, BP.yellow, a);
  });
  ctx.restore();
  // numbers streaming in from the left into the two inputs, until they are weighed
  if (TT > VL('numbers').t1 - 0.3 && TT < tAdd + 0.3) for (let q = 0; q < 6; q++) {
    const u = mod((TT - VL('numbers').t1) / 1.4 + q / 6, 1), p = q % 2 ? i2 : i1, R = RNG('strm', q);
    bpText(R.r(-1, 1).toFixed(2), lerp(70, p[0] - 64, u), p[1] + (q % 3 - 1) * 26 + 8, 30, BP.mint, { font: BP.mono, alpha: a * Math.sin(u * Math.PI) * 0.8 * win(VL('numbers').t1 - 0.3, tAdd + 0.3, 0.3) });
  }
  // the neuron's output keeps flowing out once it exists
  if (TT > tCv + 0.8) { const u = mod((TT - tCv) / 0.8, 1); bpDot(lerp(n[0] + 76, n[0] + 150, u), n[1], 8, BP.mint, a); }
  // inputs
  [[i1, NEU.x[0]], [i2, NEU.x[1]]].forEach(([p, x], k) => {
    const s = EZ.back(seg(TT, VW('numbers', 'only') + 0.3 + k * 0.1, VW('numbers', 'only') + 0.6 + k * 0.1));
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = BP.ground; ctx.strokeStyle = BP.mint; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p[0], p[1], 54 * s, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
    if (s > 0.5) bpText(fmt(x), p[0], p[1] + 11, 30, BP.mint, { font: BP.mono, alpha: a });
    if (s > 0.5) bpText(`x${k + 1}`, p[0], p[1] - 76, 38, BP.soft, { font: BP.mono, alpha: a });
  });
  // the neuron: Σ then the curve
  const ns = EZ.back(seg(TT, VW('neuron', 'neuron') - 0.1, VW('neuron', 'neuron') + 0.3)), lit = fadeIn(tAdd, 0.3);
  bpGlow(n[0], n[1], 170, BP.mint, a * (0.2 + 0.4 * lit));
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = BP.ground; ctx.strokeStyle = BP.mint; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(n[0], n[1], 74 * ns, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  if (ns > 0.5) bpText('Σ', n[0], n[1] + 28, 80, BP.mint, { alpha: a });
  // the formula and its value
  const fa = fadeIn(tAdd - 0.1, 0.3);
  if (fa > 0) OV(() => {
    bpText('z = x₁w₁ + x₂w₂ + b', 540, 1240, 54, BP.text, { font: BP.mono, alpha: a * fa });
    bpText(`z = ${fmt(NEU_Z)}`, 540, 1315, 60, BP.yellow, { font: BP.mono, weight: 700, alpha: a * fadeIn(tAdd + 0.4, 0.3) });
  });
  // the curve: tanh, the dot sliding to z, the output
  const ca = fadeIn(tSq - 0.1, 0.35);
  if (ca > 0) {
    const gx = 540, gy = 1440, gw = 300, gh = 80, map = (z) => [gx + clamp(z / 3, -1, 1) * gw, gy - Math.tanh(z) * gh];
    ctx.save(); ctx.globalAlpha = a * ca; ctx.strokeStyle = BP.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(gx - gw, gy); ctx.lineTo(gx + gw, gy); ctx.moveTo(gx, gy - gh - 20); ctx.lineTo(gx, gy + gh + 20); ctx.stroke();
    ctx.strokeStyle = BP.mint; ctx.lineWidth = 5; ctx.beginPath();
    const fr = EZ.io(seg(TT, tSq - 0.1, tCv + 0.3));
    for (let i = 0; i <= 60 * fr; i++) { const [x, y] = map(-3 + 6 * i / 60); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
    const d = EZ.io(seg(TT, tCv, tCv + 0.6)), [px, py] = map(lerp(-3, NEU_Z, d));
    if (d > 0) { bpGlow(px, py, 40, BP.mint, a * 0.6); bpDot(px, py, 12, BP.mint, a); }
    const oa = fadeIn(tCv + 0.6, 0.3);
    if (oa > 0) {
      ctx.save(); ctx.globalAlpha = a * oa; ctx.strokeStyle = BP.mint; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(n[0] + 76, n[1]); ctx.lineTo(n[0] + 150, n[1]); ctx.stroke(); ctx.restore();
      bpText(fmt(NEU_A), n[0] + 160, n[1] - 30, 44, BP.mint, { font: BP.mono, weight: 700, alpha: a * oa });
      OV(() => bpText('squashed between −1 and 1', 540, 1560, 40, BP.soft, { font: BP.mono, alpha: a * oa }));
    }
  }
  caption([{ t: 'That’s all', c: BP.text }, { t: 'the intelligence in a neuron.', c: BP.soft, i: true }], win(VW('thatsall', 'all') - 0.1, S_NET + 0.2), 420, 64);
}

// 3 — stacked: 2-10-10-1, signals forward; two numbers in; thousands of pixels
function beatNetwork() {
  const a = win(S_NET + 0.2, S_LAND + 0.6, 0.5); if (a <= 0) return;
  const t0 = VW('stack', 'stacking') - 0.2, show = [0, 1, 2, 3].map((l) => EZ.o2(seg(TT, t0 + l * 0.45, t0 + 0.6 + l * 0.45)));
  const fwdT = (t) => seg(t, VW('layers', 'layer', 2) - 0.2, VL('layers').t1);
  const flick = win(VL('random').t0, VW('compare', 'compares'), 0.4) * (1 - seg(TT, VW('random', 'lost'), VW('compare', 'compares')) * 0.6);
  // "thousands of pixels": the input row widens into a grid of pixels for a moment
  const px = win(VW('pixels', 'thousands') - 0.2, VL('pixels').t1 + 0.2, 0.35);
  const fw = TT < VW('twoin', 'two') ? (TT < VL('layers').t1 ? mod(fwdT(TT) * 2.5, 1) : fwdT(TT)) : TT < VL('random').t0 ? seg(TT, VW('twoin', 'go'), VW('twoin', 'go') + 1.4) : (TT > VW('compare', 'compares') - 1.4 && TT < VW('compare', 'compares') + 0.2 ? seg(TT, VW('compare', 'compares') - 1.4, VW('compare', 'compares')) : null);
  const P = drawNet({ a: a * (1 - px * 0.8), show, Wt: NN.W0, flick, fwd: fw != null && fw > 0 && fw < 1 ? fw : null, x: TT > VW('twoin', 'two') ? NET_X : null, cy: 900, gapY: 260, outC: TT > VW('compare', 'compares') ? BP.magenta : null });
  if (px > 0) for (let j = 0; j < 28; j++) for (let i = 0; i < 28; i++) {
    const R = RNG('pix', i, j), v = R.f();
    ctx.save(); ctx.globalAlpha = a * px * (0.35 + 0.65 * v); ctx.fillStyle = v > 0.6 ? BP.mint : bpMix(BP.mint, BP.ground, 0.6);
    ctx.fillRect(540 - 14 * 28 + i * 28, 900 - 14 * 28 + j * 28, 24, 24); ctx.restore();
  }
  if (px > 0) OV(() => bpText('784 pixels → 784 inputs', 540, 1460, 50, BP.mint, { font: BP.mono, alpha: a * px }));
  // labels
  const la = fadeIn(t0 + 1.8, 0.4) * (1 - px);
  if (la > 0) OV(() => {
    bpText('input', 860, P[0][1][1] + 14, 36, BP.soft, { font: BP.mono, align: 'left', alpha: a * la * 0 });
    
  });
  // two numbers go in
  const ia = win(VW('twoin', 'two') - 0.1, VL('pixels').t0 + 0.4, 0.3);
  if (ia > 0) OV(() => P[0].forEach(([x, y], i) => bpPill(fmt(NET_X[i]), x, y - 70, 34, BP.mint, a * ia)));
  caption([{ t: 'layer by layer,', c: BP.text }, { t: 'more complex shapes', c: BP.mint, i: true }], win(VW('layers', 'layer', 2) - 0.1, VL('twoin').t0 - 0.1), 1440, 66);
  // 4 — the answer vs the right one, the error, the coin
  const sa = win(VW('compare', 'answer') - 0.2, S_LAND + 0.3, 0.3);
  if (sa > 0) OV(() => {
    bpText(`says ${NET_OUT0.toFixed(2)}`, 360, 1430, 46, BP.magenta, { font: BP.mono, alpha: a * sa });
    bpText(`should be ${NET_Y.toFixed(2)}`, 720, 1430, 46, BP.mint, { font: BP.mono, alpha: a * sa * fadeIn(VW('compare', 'right') - 0.1, 0.25) });
  });
  const ea = win(VW('compare', 'single') - 0.3, S_LAND + 0.3, 0.3);
  if (ea > 0) OV(() => {
    const e0 = NN.err[0], bw = 640, u = EZ.io(seg(TT, VW('compare', 'single') - 0.3, VW('compare', 'number') + 0.4));
    bpText('ERROR', 540, 1520, 34, BP.magenta, { font: BP.mono, alpha: a * ea, spacing: 6 });
    ctx.save(); ctx.globalAlpha = a * ea; ctx.fillStyle = BP.panel; ctx.fillRect(540 - bw / 2, 1540, bw, 26);
    ctx.fillStyle = BP.magenta; ctx.fillRect(540 - bw / 2, 1540, bw * Math.min(1, e0 / 1.2) * u, 26);
    ctx.strokeStyle = BP.soft; ctx.lineWidth = 3; const cx = 540 - bw / 2 + bw * Math.log(2) / 1.2; ctx.beginPath(); ctx.moveTo(cx, 1532); ctx.lineTo(cx, 1574); ctx.stroke(); ctx.restore();
    bpText('a coin flip: 0.69', 540 - bw / 2 + bw * Math.log(2) / 1.2, 1612, 32, BP.soft, { font: BP.mono, alpha: a * ea * fadeIn(VW('random', 'coin'), 0.3) });
  });
  // "The error." — the number, big
  const big = win(VL('error').t0 - 0.1, S_LAND + 0.5, 0.25);
  if (big > 0) OV(() => bpText(NN.err[0].toFixed(2), 540, 430, 150, BP.magenta, { font: BP.mono, weight: 700, alpha: a * big, glow: 30 }));
  caption([{ t: 'completely lost', c: BP.magenta, i: true }], win(VW('random', 'lost') - 0.2, VW('compare', 'compares') - 0.2), 430, 80);
}
