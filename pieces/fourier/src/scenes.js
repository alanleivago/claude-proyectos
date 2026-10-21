// =====================================================================
//  the π: one closed outline, resampled, and its DFT — every circle is a real term, sorted big to small
// =====================================================================
const PI_C = [540, 960], PI_S = 1.05;
const PI_PATH = (() => {
  let P = [[-270, -205], [270, -205], [275, -135], [150, -130], [150, 175], [160, 205], [200, 222], [205, 238], [160, 240], [118, 222], [92, 185], [88, -130],
    [-108, -130], [-112, 150], [-120, 205], [-140, 238], [-168, 238], [-175, 200], [-170, 150], [-168, -130], [-275, -135]];
  for (let it = 0; it < 3; it++) { const Q = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; Q.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]); } P = Q; }
  return P.map(([x, y]) => [x * PI_S, y * PI_S]);
})();
const DFT = (() => {   // resample to N points equally spaced along the outline, then c_n = (1/N) Σ z_k e^(−2πi n k / N)
  const N = 256, closed = PI_PATH.concat([PI_PATH[0]]), L = pathLen(closed), Z = [];
  for (let k = 0; k < N; k++) Z.push(pointAt(closed, k / N));
  const C = [];
  for (let n = -N / 2; n < N / 2; n++) {
    let re = 0, im = 0;
    for (let k = 0; k < N; k++) { const a = -TAU * n * k / N; re += Z[k][0] * Math.cos(a) - Z[k][1] * Math.sin(a); im += Z[k][0] * Math.sin(a) + Z[k][1] * Math.cos(a); }
    C.push({ n, re: re / N, im: im / N, amp: Math.hypot(re, im) / N, ph: Math.atan2(im, re) });
  }
  const c0 = C.find((c) => c.n === 0);
  return { c0, terms: C.filter((c) => c.n !== 0).sort((p, q) => q.amp - p.amp) };
})();
// the chain of the first k terms at phase u (0..1 = one full drawing); returns every joint
function chain(u, k, cx = PI_C[0], cy = PI_C[1]) {
  let x = cx + DFT.c0.re, y = cy + DFT.c0.im; const J = [[x, y, 0]];
  for (let i = 0; i < k; i++) { const c = DFT.terms[i], a = TAU * c.n * u + c.ph; x += c.amp * Math.cos(a); y += c.amp * Math.sin(a); J.push([x, y, c.amp]); }
  return J;
}
function drawChain(J, a, col = 'rgba(160,190,210,', o = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  for (let i = 1; i < J.length; i++) {
    const [px, py] = J[i - 1], [x, y, r] = J[i];
    ctx.strokeStyle = col + (i < 7 ? 0.45 : 0.22) + ')'; ctx.lineWidth = i < 7 ? 2 : 1.2;
    ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = col + '0.75)'; ctx.lineWidth = i < 7 ? 2.2 : 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
  }
  ctx.restore();
  const [tx, ty] = J[J.length - 1]; vaDot(tx, ty, 8, '#eafff6', a); vaDot(tx, ty, 18, o.c ?? MINT, 0.3 * a);
}
// the trace of the tip from u0 to u1 with k terms
function tipTrace(u0, u1, k, c, a, w = 5, glow = 1.1) {
  if (a <= 0 || u1 <= u0) return;
  const P = [], n = Math.max(2, Math.ceil((u1 - u0) * 600));
  for (let i = 0; i <= n; i++) { const J = chain(lerp(u0, u1, i / n), k); P.push(J[J.length - 1]); }
  vaGlow(P, c, w, glow, { a });
}
function piGhost(a) { if (a <= 0) return; vaStroke(PI_PATH.map(([x, y]) => [PI_C[0] + x, PI_C[1] + y]), VA.dim, 3, { a, closed: true }); }
function counter(n, y, c, a, word = 'circles') {
  if (a <= 0) return;
  OV(() => vaText(`${n} ${n === 1 ? 'circle' : word}`, CXT, y, 34, c, { align: 'center', weight: 700, a, glow: 10 }));
}

// =====================================================================
//  1 — the hook: 45 circles draw the π
// =====================================================================
function beatPi() {
  const a = win(0.2, VW('point', 'point') - 0.1, 0.35); if (a <= 0) return;
  const t0 = 0.5, t1 = VW('letter', 'them') + 0.2, u = EZ.io(clamp((TT - t0) / (t1 - t0)));
  const uu = u + Math.max(0, TT - t1) * 0.05, dk = EZ.io(clamp((TT - S('parts') - 0.2) / 1.2)), K = Math.max(1, Math.round(45 - 44 * dk));
  tipTrace(0, Math.min(1, uu), 45, MINT, a * (1 - dk));
  piGhost(a * dk * 0.6);
  drawChain(chain(uu % 1, K), a);
  counter(K, 1460, MINT, a * fadeIn(VW('letter', 'fortyfive') - 0.1, 0.3));
  cap('one piece at a time', 400, S('parts') + 0.2, VA.cream, 46, { italic: true, a });
  OV(() => {
    const ta = fadeOut(S('letter') + 0.2, 0.35);
    vaText('What if any drawing', CXT, 380, 58, VA.cream, { align: 'center', serif: true, a: ta * fadeIn(0.15, 0.2), frac: vaType(0.15, 'What if any drawing', 26), glow: 8 });
    vaText('could be made of spinning circles?', CXT, 450, 46, MINT, { align: 'center', serif: true, italic: true, a: ta * fadeIn(VW('title', 'nothing') - 0.2, 0.2), frac: vaType(VW('title', 'nothing') - 0.2, 'could be made of spinning circles?', 30), glow: 14 });
  });
}

// =====================================================================
//  2 — one circle → a wave; odd circles 1/3, 1/5 … → a square wave
// =====================================================================
const WCX = 250, WCY = 960, WR = 125, WX0 = 470, WSPD = 170, WF = 0.55;   // circles' centre, radius, wave start x, scroll px/s, revolutions/s
function nCirc(t) {   // how many odd harmonics are on at time t (fractional while one fades in)
  if (t < VW('hook', 'hook') - 0.1) return 1;
  const tA = VW('adding', 'adding') - 0.1, tE = VW('corners', 'corners') + 0.3;
  if (t < tA) return 1 + clamp((t - VW('hook', 'hook') + 0.1) / 0.6);
  return 2 + 28 * EZ.i2(clamp((t - tA) / (tE - tA)));
}
function sqChain(t, nc) {   // the joints: harmonics 1, 3, 5 … with radius R/n, speed n
  const J = [[WCX, WCY, 0]]; let x = WCX, y = WCY;
  for (let i = 0; i < Math.ceil(nc); i++) { const n = 2 * i + 1, k = clamp(nc - i), r = WR / n * k, an = -TAU * WF * n * t; x += r * Math.cos(an); y += r * Math.sin(an); J.push([x, y, r]); }
  return J;
}
function beatWave() {
  const a = win(S('parts') + 0.2, S('free') + 0.6, 0.35); if (a <= 0) return;
  const t0 = VW('point', 'point') - 0.2, ca = fadeIn(t0, 0.4) * a;
  const nc = nCirc(TT), J = sqChain(TT - t0, nc), [tx, ty] = J[J.length - 1];
  drawChain(J, ca);
  // the wave: the tip's height over past time, scrolling right
  const wa = fadeIn(VW('wave', 'wave') - 0.6, 0.4) * a;
  if (wa > 0) {
    const P = [], hist = Math.min(TT - VW('wave', 'keep') + 0.1, (W - 150 - WX0) / WSPD);
    for (let i = 0; i <= 360; i++) { const dt = hist * i / 360, tt = TT - dt; const Jp = sqChain(tt - t0, nCirc(tt)); P.push([WX0 + dt * WSPD, Jp[Jp.length - 1][1]]); }
    if (hist > 0) { vaLine(tx, ty, WX0, ty, MINT, 2, { a: wa * 0.6, dash: [6, 8] }); vaGlow(P, MINT, 4.5, 1.1 + 1.6 * flashK(HIT, 0.9), { a: wa }); }
  }
  // the up-and-down marker on the circle's own axis
  const ma = win(VW('wave', 'upanddown') - 0.2, S('hook'), 0.3) * a;
  if (ma > 0) { vaArrow(WCX - WR - 40, WCY, WCX - WR - 40, WCY - 70, AMB, 3, ma, 12); vaArrow(WCX - WR - 40, WCY, WCX - WR - 40, WCY + 70, AMB, 3, ma, 12); }
  // labels and counters
  const c2 = win(VW('hook', 'three') - 0.2, S('adding') + 0.3, 0.3) * a;
  if (c2 > 0 && J.length > 2) OV(() => { vaText('⅓ size · 3× speed', 330, WCY - WR - 60, 30, AMB, { align: 'center', weight: 700, a: c2, glow: 8 }); });
  counter(Math.max(1, Math.round(nc)), 1300, MINT, fadeIn(t0 + 0.4, 0.3) * fadeOut(S('free'), 0.3) * a);
  cap("the wave isn't smooth anymore", 1420, VW('smooth', 'wave') - 0.1, VA.cream, 40, { italic: true, a: a * fadeOut(S('adding') + 0.2, 0.3) });
  cap('smaller and faster', 1420, VW('adding', 'smaller') - 0.1, VA.text, 34, { mono: true, a: a * fadeOut(S('corners'), 0.3) });
  cap('out of pure spinning: corners', 1420, VW('corners', 'pure') - 0.1, AMB, 42, { italic: true, a: a * fadeOut(HIT, 0.25), glow: 12 });
  // corners: brackets flash on the square wave's corners
  const ck = win(VW('corners', 'corners') - 0.1, HIT, 0.2) * a;
  if (ck > 0) for (const x of [600, 840]) { vaStroke([[x - 20, 820], [x - 20, 800], [x, 800]], AMB, 4, { a: ck }); vaStroke([[x + 20, 1120], [x + 20, 1140], [x, 1140]], AMB, 4, { a: ck }); }
  // Fourier: the name and the sentence
  OV(() => {
    const fk = popS(HIT + 0.05) * fadeOut(S('free') + 0.1, 0.3) * a;
    if (fk > 0) vaText('Fourier', CXT, 520, 120 * fk, VA.cream, { align: 'center', serif: true, italic: true, a: fk, glow: 24 });
    const t2 = VW('signal', 'any') - 0.1, sa = fadeIn(t2, 0.3) * fadeOut(S('free') + 0.1, 0.3) * a;
    vaText('any signal', CXT, 620, 52, MINT, { align: 'center', serif: true, a: sa, frac: vaType(t2, 'any signal', 24), glow: 14 });
    vaText('= a sum of circles', CXT, 690, 52, AMB, { align: 'center', serif: true, a: sa * fadeIn(VW('signal', 'sum') - 0.1, 0.25), frac: vaType(VW('signal', 'sum') - 0.1, '= a sum of circles', 26), glow: 14 });
  });
}

// =====================================================================
//  3 — set the tip free: the π again; each circle at its own pace; only the big ones
// =====================================================================
function beatFree() {
  const a = win(S('free') + 0.2, DURATION + 1, 0.35) * (1 - 0.5 * fadeIn(S('end'), 0.6)); if (a <= 0) return;
  const t0 = VW('free', 'back') - 1.6, t1 = VL('free').t1 + 0.4, u = EZ.io(clamp((TT - t0) / (t1 - t0)));
  const tB = VW('big', 'keep') - 0.1, kb = clamp((TT - tB) / 0.8), K = Math.round(lerp(45, 6, EZ.io(kb)));
  const uu = u + Math.max(0, TT - t1) * 0.06;
  piGhost(a * fadeIn(VW('free', 'freely') - 0.1, 0.4) * (0.4 + 0.6 * kb));
  // the full π (mint) fades as the six-circle version (magenta) takes over
  tipTrace(0, Math.min(1, uu), 45, MINT, a * (1 - kb));
  const tR = tB + 0.3, ur = EZ.io(clamp((TT - tR) / (VL('big').t1 + 0.3 - tR)));
  if (kb > 0) tipTrace(0, ur, 6, MAG, a * kb, 5, 1.3);
  drawChain(chain((kb > 0 ? ur : uu) % 1, K), a * (1 - 0.6 * fadeIn(S('jpeg'), 0.4)), 'rgba(160,190,210,', { c: kb > 0 ? MAG : MINT });
  // each circle at its own pace: speed tags on the five biggest
  const pa = win(S('knows') + 0.2, S('big'), 0.3) * a;
  if (pa > 0) { const J = chain(uu % 1, 45); for (let i = 1; i <= 5; i++) { const c = DFT.terms[i - 1], [x, y] = J[i - 1];
    OV(() => vaText(`${c.n > 0 ? '+' : ''}${c.n}×`, x + c.amp * 0.7, y - c.amp * 0.7, 28, AMB, { align: 'center', weight: 700, a: pa * fadeIn(VW('pace', 'own') - 0.3 + i * 0.1, 0.2), glow: 8 })); } }
  counter(K, 1460, kb > 0.5 ? MAG : MINT, a * fadeIn(S('free') + 0.4, 0.3) * fadeOut(S('jpeg') + 0.2, 0.3));
  cap('back to the drawing', 400, VW('free', 'back') - 0.1, VA.cream, 46, { italic: true, a: fadeOut(S('knows'), 0.3) });
  cap("no circle knows it's drawing", 400, S('knows') + 0.1, VA.cream, 46, { italic: true, a: fadeOut(S('pace'), 0.3) });
  cap('each one spins at its own pace', 400, S('pace') + 0.1, VA.text, 40, { italic: true, a: fadeOut(S('big'), 0.3) });
  cap('only the big circles', 400, VW('big', 'big') - 0.1, MAG, 50, { italic: true, a: fadeOut(S('jpeg'), 0.3), glow: 14 });
  cap('a rough π', 1390, VW('big', 'rough') - 0.1, MAG, 40, { italic: true, a: fadeOut(S('jpeg'), 0.3) });
}

// =====================================================================
//  4 — JPEG, MP3; keep the big circles, throw away the tiny ones
// =====================================================================
function beatJpeg() {
  const a = win(S('jpeg') + 0.1, DURATION, 0.35); if (a <= 0) return;
  const ja = popS(VW('jpeg', 'jpeg') - 0.15) * a, ma = popS(VW('jpeg', 'mp3') - 0.15) * a, up = fadeOut(S('end') + 0.2, 0.4);
  // a photo: a framed landscape
  if (ja > 0) { const x = 300, y = 420 + 0 * up, s = ja;
    ctx.save(); ctx.globalAlpha *= ja; ctx.fillStyle = '#0f2638'; ctx.fillRect(x - 110 * s, y - 80 * s, 220 * s, 160 * s); ctx.restore();
    vaStroke([[x - 110 * s, y - 80 * s], [x + 110 * s, y - 80 * s], [x + 110 * s, y + 80 * s], [x - 110 * s, y + 80 * s]], VA.cream, 4, { a: ja, closed: true });
    vaStroke([[x - 100 * s, y + 70 * s], [x - 40 * s, y - 10 * s], [x, y + 30 * s], [x + 40 * s, y - 30 * s], [x + 100 * s, y + 70 * s]], MINT, 4, { a: ja });
    vaRing(x + 55 * s, y - 45 * s, 16 * s, AMB, 4, ja);
    OV(() => vaText('JPEG', x, y + 130, 36, VA.cream, { align: 'center', weight: 700, a: ja, glow: 8 })); }
  // a song: a waveform
  if (ma > 0) { const x = 780, y = 420; const P = []; for (let i = 0; i <= 80; i++) { const u = i / 80; P.push([x - 120 + 240 * u, y + 60 * Math.sin(u * 30 + TT * 6) * Math.sin(u * Math.PI) * (0.5 + 0.5 * Math.sin(u * 7))]); }
    vaGlow(P, AMB, 4, 1, { a: ma }); OV(() => vaText('MP3', x, y + 130, 36, VA.cream, { align: 'center', weight: 700, a: ma, glow: 8 })); }
  // the tiny circles fly off and fade
  const tf = VW('end', 'throw') - 0.2, fk = clamp((TT - tf) / 1.6);
  if (fk > 0) { for (let i = 0; i < 26; i++) { const R = RNG('fly', i), ang = R.r(0, TAU), d = 700 * EZ.i2(fk) * R.r(0.6, 1.2), r = R.r(6, 22);
      vaRing(PI_C[0] + R.r(-200, 200) + Math.cos(ang) * d, PI_C[1] + R.r(-200, 200) + Math.sin(ang) * d, r, VA.dim, 2, a * (1 - fk)); } }
  OV(() => {
    const t1 = VW('end', 'keep') - 0.1, t2 = VW('end', 'throw') - 0.1;
    vaText('keep the big circles', CXT, 1300, 44, MAG, { align: 'center', serif: true, italic: true, a: a * fadeIn(t1, 0.3), frac: vaType(t1, 'keep the big circles', 28), glow: 12 });
    vaText("throw away the tiny ones", CXT, 1370, 34, VA.text, { align: 'center', a: a * fadeIn(t2, 0.3), frac: vaType(t2, 'throw away the tiny ones', 30) });
    const na = fadeIn(VL('end').t1 + 0.2, 0.5);
    if (na > 0) {
      ctx.save(); ctx.font = `700 50px ${VMONO}`; const wB = ctx.measureText('Bit').width, wS = ctx.measureText('story').width; ctx.restore();
      const x0 = CXT - (wB + wS) / 2, gl = 14 + 16 * Math.max(0, Math.sin((TT - VL('end').t1) * 2.4));
      vaText('Bit', x0, 1475, 50, MINT, { weight: 700, a: na, glow: gl }); vaText('story', x0 + wB, 1475, 50, MAG, { weight: 700, a: na, glow: gl });
      const sw = mod((TT - VL('end').t1) / 1.4, 1); ctx.save(); ctx.globalAlpha = na * 0.5 * Math.sin(Math.PI * sw); ctx.fillStyle = '#ffffff'; ctx.fillRect(x0 - 20 + (wB + wS + 40) * sw, 1428, 6, 60); ctx.restore();
    }
  });
}

// =====================================================================
//  the stage
// =====================================================================
function sceneStage() {
  const c = camAtT();
  vaBg(0.2 * flashK(HIT, 1.2));
  stars(0.6);
  vaGridBg(c, 1.15);
  gridPulses(c);
  vaSpecks(30, 0.25);
  setCam(c);
  beatPi(); beatWave(); beatFree(); beatJpeg();
}
