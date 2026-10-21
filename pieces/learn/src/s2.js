// =====================================================================
//  S2 — the landscape and the descent, backpropagation, the boundary bending
// =====================================================================
const STEPS = NN.path.length - 1;
// the descent clock: steps start on "down", most happen by the end of "step", the last tiny ones through "flat"
function stepAt(t) {
  const a = VW('down', 'down'), b = VL('step').t1, c = VL('flat').t1;
  if (t < a) return 0;
  if (t < b) return 40 * EZ.io(seg(t, a, b));
  return 40 + (STEPS - 40) * EZ.o2(seg(t, b, c));
}
function ballAt(t, rot, k = 1) {
  const s = stepAt(t), i = Math.min(STEPS - 1, Math.floor(s)), u = s - i, p = NN.path[i], q = NN.path[i + 1];
  const g0 = pathGrid(p), g1 = pathGrid(q), z = lerp(p[2], q[2], u);
  return { xy: surfProj(lerp(g0[0], g1[0], u), lerp(g0[1], g1[1], u), z, rot, k), s, z, i };
}
const landRot = () => -0.75 + 0.05 * (TT - S_LAND) + (TT > S_END ? 0.22 * (TT - S_END) : 0);

function beatLand() {
  const a = win(S_LAND + 0.2, S_BACK + 0.4, 0.6), aEnd = win(S_END + 0.1, DURATION + 1, 0.6);
  if (a <= 0 && aEnd <= 0) return;
  const endMode = aEnd > 0 && a <= 0, A = endMode ? aEnd : a;
  const rot = landRot(), k = endMode ? 0.7 : 1;
  const grow = endMode ? 1 : EZ.io(seg(TT, VL('landscape').t0, VL('landscape').t1 + 0.4));
  SURF.cy = endMode ? 1080 : 1060;
  drawSurface(A, rot, k, Math.max(0.02, grow));
  // axes labels
  const la = fadeIn(VW('directions', 'direction') - 0.1, 0.3) * (endMode ? 0 : 1);
  if (la > 0) {
    const p1 = surfProj(NN.NG + 2, NN.NG / 2, 0, rot), p2 = surfProj(NN.NG / 2, NN.NG + 2, 0, rot);
    bpText('weight 1', p1[0], p1[1] + 40, 36, BP.yellow, { font: BP.mono, alpha: a * la });
    bpText('weight 2', p2[0], p2[1] + 40, 36, BP.yellow, { font: BP.mono, alpha: a * la });
    const ha = fadeIn(VW('directions', 'height') - 0.1, 0.3);
    if (ha > 0) { const top = [180, 760]; ctx.save(); ctx.globalAlpha = a * ha; ctx.strokeStyle = BP.magenta; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(top[0] - 40, top[1] + 60); ctx.lineTo(top[0] - 40, top[1] - 60); ctx.lineTo(top[0] - 54, top[1] - 40); ctx.moveTo(top[0] - 40, top[1] - 60); ctx.lineTo(top[0] - 26, top[1] - 40); ctx.stroke(); ctx.restore();
      bpText('error', top[0] - 40, top[1] - 80, 38, BP.magenta, { font: BP.mono, alpha: a * ha }); }
  }
  // the ball and its trail (in the end: rolling down again, slowly)
  const t = endMode ? VW('down', 'down') + (TT - S_END) * 1.6 : TT;
  const ba = endMode ? aEnd : fadeIn(VL('training').t0, 0.4) * a;
  if (ba > 0) {
    const b = ballAt(t, rot, k);
    ctx.save(); ctx.globalAlpha = ba; ctx.strokeStyle = BP.yellow; ctx.lineWidth = 4; ctx.beginPath();
    for (let i = 0; i <= b.i; i++) { const g = pathGrid(NN.path[i]), p = surfProj(g[0], g[1], NN.path[i][2], rot, k); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.lineTo(b.xy[0], b.xy[1]); ctx.stroke(); ctx.restore();
    // the slope under your feet: an arrow pointing downhill
    const sa = win(VL('slope').t0, VL('step').t1, 0.3) * (endMode ? 0 : 1);
    if (sa > 0) { const n = ballAt(t + 0.5, rot, k).xy, dx = n[0] - b.xy[0], dy = n[1] - b.xy[1], L = Math.hypot(dx, dy) || 1, ax = b.xy[0] + dx / L * 110, ay = b.xy[1] + dy / L * 110;
      ctx.save(); ctx.globalAlpha = a * sa; ctx.strokeStyle = BP.text; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b.xy[0], b.xy[1]); ctx.lineTo(ax, ay);
      const an = Math.atan2(ay - b.xy[1], ax - b.xy[0]); ctx.lineTo(ax - 22 * Math.cos(an - 0.5), ay - 22 * Math.sin(an - 0.5)); ctx.moveTo(ax, ay); ctx.lineTo(ax - 22 * Math.cos(an + 0.5), ay - 22 * Math.sin(an + 0.5)); ctx.stroke(); ctx.restore(); }
    bpGlow(b.xy[0], b.xy[1], 46, BP.text, ba * 0.6);
    ctx.save(); ctx.globalAlpha = ba; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(b.xy[0], b.xy[1] - 4, 15 * k, 0, TAU); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = BP.ground; ctx.stroke(); ctx.restore();
    if (!endMode) {
      const ca = fadeIn(VW('down', 'down'), 0.3) * a;
      if (ca > 0) OV(() => {
        bpText(`step ${String(Math.round(b.s)).padStart(3, ' ')}`, 300, 1520, 48, BP.soft, { font: BP.mono, alpha: ca });
        bpText(`error ${b.z.toFixed(3)}`, 760, 1520, 48, BP.magenta, { font: BP.mono, alpha: ca });
      });
    }
  }
  caption([{ t: 'the error,', c: BP.text }, { t: 'as a landscape', c: BP.yellow, i: true }], win(VL('landscape').t0, VL('directions').t0 + 0.4), 420, 72);
  caption([{ t: 'Going down.', c: BP.mint, i: true }], win(VL('down').t0 - 0.05, VL('slope').t0 + 0.6), 420, 92);
  caption([{ t: 'tiny steps', c: BP.text, i: true }], win(VW('flat', 'steps') - 0.2, VL('gd').t0 - 0.4), 420, 80);
  caption([{ t: 'gradient descent', c: BP.mint }], win(VW('gd', 'gradient') - 0.1, S_BACK + 0.2), 420, 92);
}

// 6 — backpropagation: the error at the output, pushed back, blame per weight
function beatBack() {
  const a = win(S_BACK + 0.3, S_BND + 0.5, 0.5); if (a <= 0) return;
  const show = [1, 1, 1, 1].map((v, l) => EZ.o2(seg(TT, S_BACK + 0.3 + (3 - l) * 0.15, S_BACK + 0.9 + (3 - l) * 0.15)));
  const tb0 = VW('back', 'backwards') - 0.4, tb1 = VL('back').t1 + 0.2, back = TT < tb0 ? null : TT < tb1 ? seg(TT, tb0, tb1) : 1 + mod((TT - tb1) / 1.6, 1) * 0.999;
  const P = drawNet({ a, show, Wt: NN.W0, blame: NN.G0, back, x: NET_X, cy: 920, gapY: 260, outC: BP.magenta });
  const ea = win(VW('back', 'error') - 0.2, S_BND, 0.3);
  if (ea > 0) OV(() => bpPill(`error ${NN.err[0].toFixed(2)}`, P[3][0][0], P[3][0][1] + 80, 40, BP.magenta, a * ea));
  caption([{ t: 'millions of weights', c: BP.yellow, i: true }], win(VW('how', 'millions') - 0.2, VL('back').t0 + 0.6), 420, 76);
  caption([{ t: 'handing out blame', c: BP.magenta, i: true }], win(VW('back', 'blame') - 0.2, VL('blame').t0 - 0.4), 420, 80);
  const qa = win(VL('blame').t0 - 0.1, VL('bp').t0 + 0.3, 0.3);
  if (qa > 0) OV(() => bpPill('how much blame does each weight carry?', 540, 430, 36, BP.magenta, a * qa));
  caption([{ t: 'backpropagation', c: BP.mint }], win(VW('bp', 'backpropagation') - 0.1, S_BND + 0.2), 400, 88);
  topTag('1986 · RUMELHART, HINTON & WILLIAMS', win(VW('bp', 'nineteen') - 0.1, S_BND + 0.2) * a);
}

// 7 — the boundary bends: the real network, snapshot by snapshot
const PLANE = { cx: 540, cy: 800, s: 760 };
const planeXY = (x, y) => [PLANE.cx + x / 2.15 * PLANE.s / 2, PLANE.cy - y / 2.15 * PLANE.s / 2];
let FIELD = null, FIELD_K = -1;
function fieldCanvas(Wt, key) {
  if (FIELD_K === key && FIELD) return FIELD;
  const N = 120; if (!FIELD) { FIELD = document.createElement('canvas'); FIELD.width = N; FIELD.height = N; }
  const g = FIELD.getContext('2d'), img = g.createImageData(N, N), cm = bpHex('#0e6a4a'), cb = bpHex('#1d3f6e'), cl = bpHex('#e4e3dc');
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = (i / (N - 1) - 0.5) * 4.3, y = -(j / (N - 1) - 0.5) * 4.3, p = NN.predict(Wt, x, y), e = Math.exp(-Math.pow((p - 0.5) / 0.06, 2));
    const c = p > 0.5 ? cm : cb, o = (j * N + i) * 4;
    img.data[o] = lerp(c[0], cl[0], e * 0.8); img.data[o + 1] = lerp(c[1], cl[1], e * 0.8); img.data[o + 2] = lerp(c[2], cl[2], e * 0.8); img.data[o + 3] = 255;
  }
  g.putImageData(img, 0, 0); FIELD_K = key; return FIELD;
}
const epochAt = (t) => Math.round(NN.EPOCHS * 0.5 * Math.pow(seg(t, VL('learning').t0, VL('nobody').t1), 3.4) / NN.SNAP) * NN.SNAP;
function drawPlane(a, Wt, key, o = {}) {
  const f = fieldCanvas(Wt, key), s = PLANE.s;
  ctx.save(); ctx.globalAlpha = clamp(a); ctx.imageSmoothingEnabled = true;
  trace(rrectPts(PLANE.cx - s / 2, PLANE.cy - s / 2, s, s, 18, 6), true); ctx.clip();
  ctx.drawImage(f, PLANE.cx - s / 2, PLANE.cy - s / 2, s, s); ctx.restore();
  ctx.save(); ctx.globalAlpha = clamp(a); ctx.strokeStyle = BP.line; ctx.lineWidth = 3; trace(rrectPts(PLANE.cx - s / 2, PLANE.cy - s / 2, s, s, 18, 6), true); ctx.stroke(); ctx.restore();
  if (o.dots !== false) NN.X.forEach(([x, y], k) => {
    const [px, py] = planeXY(x, y), R = RNG('dot', k), da = o.dotA ? o.dotA(k, R) : 1; if (da <= 0) return;
    const dx = o.burst ? Math.cos(R.r(0, TAU)) * o.burst * R.r(200, 700) : 0, dy = o.burst ? Math.sin(R.r(0, TAU)) * o.burst * R.r(200, 700) : 0;
    const c = NN.Y[k] ? BP.mint : BP.azure, wrong = (NN.predict(Wt, x, y) > 0.5) !== !!NN.Y[k];
    bpDot(px + dx, py + dy, 9, c, a * da);
    if (wrong && o.wrong !== false) { ctx.save(); ctx.globalAlpha = a * da; ctx.strokeStyle = BP.magenta; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 15, 0, TAU); ctx.stroke(); ctx.restore(); }
  });
}
function beatBoundary() {
  const a = win(S_BND + 0.3, S_SCALE + 0.4, 0.5); if (a <= 0) return;
  const e = epochAt(TT), Wt = NN.snaps[e / NN.SNAP];
  drawPlane(a, Wt, e, { dotA: (k, R) => EZ.back(seg(TT, VL('learning').t0 - 0.3 + R.r(0, 0.6), VL('learning').t0 + R.r(0.2, 0.9))) });
  // the error curve under the plane
  const ca = fadeIn(VL('learning').t0, 0.4) * a;
  if (ca > 0) {
    const x0 = 160, x1 = 920, y0 = 1350, h = 120, n = Math.max(1, e);
    ctx.save(); ctx.globalAlpha = ca; ctx.strokeStyle = BP.dim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0 - h); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.strokeStyle = BP.magenta; ctx.lineWidth = 4; ctx.beginPath();
    for (let i = 0; i <= n; i += 2) { const x = x0 + (x1 - x0) * i / (NN.EPOCHS * 0.5), y = y0 - h * Math.min(1, NN.err[i] / NN.err[0]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
    OV(() => {
      bpText('error', 180, 1250, 34, BP.magenta, { font: BP.mono, align: 'left', alpha: ca });
      bpText(`epoch ${e}`, 330, 1440, 50, BP.soft, { font: BP.mono, alpha: ca });
      bpText(`${Math.round(NN.acc(Wt) * 100)}% right`, 750, 1440, 50, BP.mint, { font: BP.mono, weight: 700, alpha: ca });
    });
  }
  caption([{ t: 'the decision boundary', c: BP.text, i: true }], win(VW('boundary', 'decision') - 0.2, VL('nobody').t0 + 0.4), 360, 70);
  caption([{ t: 'nobody drew this curve', c: BP.mint, i: true }], win(VW('nobody', 'curve') - 0.3, S_SCALE + 0.1), 360, 70);
}
