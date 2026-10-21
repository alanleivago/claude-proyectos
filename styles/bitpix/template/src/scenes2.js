// =====================================================================
//  beats 5–8: you, the cortex, the word "same", the end — and the stage and camera
// =====================================================================
const PH = 900, PTOP = 470, PGAP = 30;                                  // the person: height, top, dot spacing
const PDOTS = () => bpPersonDots(PH, PGAP);
const HEAD = [540, PTOP + PH * 0.09];
const isCortex = (d) => d.part === 'head' && d.y < PH * 0.095;
const FLIP = (() => {   // when each cell turns mint (the cortex never does)
  const R = RNG('flip'), a = VL('cells').t0 + 0.7, b = VL('cells').t1 - 0.1;
  return PDOTS().map((d) => (isCortex(d) ? Infinity : lerp(a, b, Math.pow(R.f(), 0.9))));
})();
const DAY = () => Math.round(90 * seg(TT, VL('cells').t0 + 0.7, VL('cells').t1 - 0.1));
// sources of the burst: the planks of both ships at the hit
let SRC_C = null;
function SRC() {
  if (SRC_C) return SRC_C;
  const keep = TT; TT = HIT - 1e-3; const sa = SA(), sb = SB(); TT = keep;
  const P = [...bpPlanks(sa.x, sa.y, sa.s), ...bpPlanks(sb.x, sb.y, sb.s)], R = RNG('src');
  return (SRC_C = PDOTS().map((d, j) => { const p = P[(j * 7) % P.length]; return { x: p.cx + R.r(-14, 14), y: p.cy + R.r(-6, 6), a: R.r(0, TAU), r: R.r(80, 260), dl: R.r(0, 0.25), c: j % P.length < N_PL ? BP.mint : BP.yellow }; }));
}
const RISE = (() => { const R = RNG('rise'); return PDOTS().map(() => ({ x: 540 + R.r(-250, 250), y: 690 + R.r(-55, 25), dl: R.r(0, 0.5) })); })();

function hitFlash() {
  const u = seg(TT, HIT, HIT + 0.5); if (u <= 0 || u >= 1) return;
  const sa = SA(), cx = (sa.x + SB().x) / 2, cy = 860;
  ctx.save(); ctx.strokeStyle = BP.mint; ctx.globalAlpha = (1 - u) * 0.9; ctx.lineWidth = 10 * (1 - u) + 2;
  ctx.beginPath(); ctx.arc(cx, cy, 60 + EZ.o3(u) * 900, 0, TAU); ctx.stroke(); ctx.restore();
  OV(() => { ctx.save(); ctx.globalAlpha = 0.55 * Math.pow(1 - seg(TT, HIT, HIT + 0.3), 2); ctx.fillStyle = BP.mint; ctx.fillRect(-100, 0, W + 200, H); ctx.restore(); });
}
function drawPerson() {
  hitFlash();
  const tW = VW('trap', 'same') + 0.05, tR = VW('trap', 'never') - 0.1;
  if (TT < HIT || TT > tW + 0.6) return;
  const D = PDOTS(), S = SRC();
  D.forEach((d, j) => {
    const s = S[j], tx = 540 + d.x, ty = PTOP + d.y;
    // the burst: out from the plank, then into the figure
    const u = EZ.io(seg(TT, HIT + s.dl, HIT + s.dl + 1.15));
    const mx = s.x + Math.cos(s.a) * s.r, my = s.y + Math.sin(s.a) * s.r - 120;
    let x = (1 - u) * (1 - u) * s.x + 2 * u * (1 - u) * mx + u * u * tx, y = (1 - u) * (1 - u) * s.y + 2 * u * (1 - u) * my + u * u * ty;
    // the rise into the word
    const r = RISE[j], v = EZ.io(seg(TT, tR + r.dl, tW + 0.1));
    if (v > 0) { x = lerp(x, r.x, v); y = lerp(y, r.y, v) - Math.sin(v * Math.PI) * 80; }
    // colour: the plank's ink while flying, then yellow (original) and the turnover to mint
    let c = u < 1 ? bpMix(s.c, BP.yellow, u) : BP.yellow, glow = 0;
    if (TT >= FLIP[j]) { c = BP.mint; glow = 1 - seg(TT, FLIP[j], FLIP[j] + 0.4); }
    if (isCortex(d) && TT > VW('younger', 'almost', 2) - 0.1) glow = 0.5 + 0.5 * Math.sin(TT * 5);
    const rad = lerp(8, 11, u) * (1 - v * 0.55), al = 1 - seg(TT, tW - 0.1, tW + 0.5);
    if (glow > 0) bpGlow(x, y, 46, c, 0.6 * glow * al);
    bpDot(x, y, rad, c, al);
  });
  // the cell counter and the day
  const cA = win(VW('cells', 'replaces') - 0.2, T6);
  if (cA > 0) OV(() => {
    bpText('330 billion cells a day', 540, 1450, 54, BP.mint, { font: BP.mono, alpha: cA });
    bpText(`day ${String(DAY()).padStart(2, '0')}`, 90, 420, 50, BP.soft, { font: BP.mono, align: 'left', alpha: cA });
  });
  // beat 6: younger than you / almost: the cortex
  const tAl = VW('younger', 'almost', 2), tNe = VW('younger', 'neurons');
  const yA = win(VL('younger').t0 + 0.25, tAl - 0.45, 0.25);
  if (yA > 0) OV(() => bpText('younger than you', 540, 430, 80, BP.mint, { italic: true, alpha: yA, glow: 16 }));
  const kA = win(tAl - 0.1, T7 - 0.15, 0.25);
  if (kA > 0) {
    const fr = EZ.io(seg(TT, tAl - 0.1, tAl + 0.6));
    ctx.save(); ctx.globalAlpha = kA; ctx.strokeStyle = BP.magenta; ctx.lineWidth = 6; ctx.beginPath();
    ctx.arc(HEAD[0], HEAD[1] - 6, 104, -Math.PI / 2, -Math.PI / 2 + TAU * fr); ctx.stroke(); ctx.restore();
    OV(() => {
      bpText('almost.', 540, 430, 92, BP.magenta, { italic: true, alpha: kA * (1 - fadeIn(tNe - 0.1, 0.25)), glow: 16 });
      bpLines([{ t: 'cortex', c: BP.magenta }, { t: 'neurons', c: BP.magenta }], 765, 720, 44, BP.magenta, kA * fadeIn(tNe - 0.1, 0.3), { font: BP.mono, align: 'left' });
      bpLines(['since', 'birth'], 765, 860, 44, BP.yellow, kA * fadeIn(tNe + 0.4, 0.3), { font: BP.mono, align: 'left' });
    });
  }
}

// the word, its two meanings, two small ships; at the end they merge into the first ship, now mint
function beatsSame() {
  const tW = VW('trap', 'same'), tM = VW('means', 'matter'), tS = VW('means', 'story'), tA = VW('apart', 'pulled'), tE = T8 + 0.2;
  if (TT < tW - 0.3) return;
  const wa = fadeIn(tW - 0.05, 0.4) * fadeOut(tE, 0.5);
  const sp = springMove(tA, 0, 40, SPRING.heavy);                      // Hobbes pulls them apart
  const mg = EZ.io(seg(TT, tE, tE + 1.4));                              // ... and the end brings them back together
  const xl = lerp(300 - sp, 540, mg), xr = lerp(780 + sp, 540, mg), yy = lerp(1060, 905, mg), ss = lerp(150, 340, mg);
  if (wa > 0) OV(() => {
    bpText('“same”', 540, 730, 175, BP.text, { alpha: wa });
    const ar = (x1, y1, x2, y2, f, c) => {
      if (f <= 0) return; const x = lerp(x1, x2, f), y = lerp(y1, y2, f), an = Math.atan2(y2 - y1, x2 - x1);
      ctx.save(); ctx.globalAlpha = wa; ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y);
      ctx.moveTo(x, y); ctx.lineTo(x - 18 * Math.cos(an - 0.45), y - 18 * Math.sin(an - 0.45));
      ctx.moveTo(x, y); ctx.lineTo(x - 18 * Math.cos(an + 0.45), y - 18 * Math.sin(an + 0.45)); ctx.stroke(); ctx.restore();
    };
    ar(470, 780, 330 - sp * 0.6, 860, EZ.o2(seg(TT, tM - 0.2, tM + 0.2)), BP.yellow);
    ar(610, 780, 750 + sp * 0.6, 860, EZ.o2(seg(TT, tS - 0.2, tS + 0.2)), BP.mint);
    bpText('same matter', 300 - sp, 1255, 50, BP.yellow, { font: BP.mono, alpha: wa * fadeIn(tM, 0.3) });
    bpText('same story', 780 + sp, 1255, 50, BP.mint, { font: BP.mono, alpha: wa * fadeIn(tS, 0.3) });
    const da = wa * fadeIn(tA, 0.3);
    if (da > 0) { const f = EZ.io(seg(TT, tA, tA + 0.6)); ctx.save(); ctx.globalAlpha = da; ctx.setLineDash([12, 12]); ctx.strokeStyle = BP.magenta; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(540, 880); ctx.lineTo(540, 880 + 420 * f); ctx.stroke(); ctx.restore(); }
  });
  const aL = fadeIn(tM - 0.1, 0.35) * (1 - mg), aR = fadeIn(tS - 0.1, 0.35);
  if (aL > 0) bpShip(xl, yy, ss * springMove(tM - 0.1, 0.7, 1, SPRING.playful), { c: BP.yellow, a: aL, phase: 0.6 });
  if (aR > 0) bpShip(xr, yy, ss * (mg > 0 ? 1 : springMove(tS - 0.1, 0.7, 1, SPRING.playful)), { c: BP.mint, a: aR, phase: 0 });
}

// the end: the reflection of the ship is the person
function beatsEnd() {
  if (TT < T8) return;
  const ra = fadeIn(VW('daily', "it's") - 0.2, 0.8);
  if (ra > 0) {
    const D = PDOTS(), top = 1030, k = 0.42;
    ctx.save(); ctx.beginPath(); ctx.rect(-200, top - 10, W + 400, H); ctx.clip();
    D.forEach((d) => {
      const y = top + (PH - d.y) * k * 0.92, x = 540 + d.x * k + Math.sin(y * 0.045 + TT * 2.2) * 7;
      bpDot(x, y, 7, isCortex(d) ? BP.yellow : BP.mint, ra * 0.5 * (1 - (y - top) / 420));
    });
    ctx.restore();
  }
  caption(['Your matter changes every day,', { t: 'and no one doubts it’s you.', c: BP.soft }], win(VL('daily').t0 - 0.1, VL('end').t0 - 0.5, 0.3), 330, 58);
  const ea = fadeIn(VL('end').t0 - 0.1, 0.35);
  if (ea > 0) OV(() => {
    bpText('You were never', 540, 345, 90, BP.text, { alpha: ea });
    bpText('the planks.', 540, 448, 90, BP.yellow, { alpha: ea * fadeIn(VW('end', 'planks') - 0.1, 0.3), italic: true });
  });
  // the signature: Bitstory, typed on at the bottom
  const tS = VL('end').t0 + 0.6, sa = fadeIn(tS, 0.2);
  if (sa > 0) OV(() => {
    ctx.save(); ctx.font = `700 72px ${BP.mono}`; const w1 = ctx.measureText('Bit').width, w = ctx.measureText('Bitstory').width; ctx.restore();
    const n = Math.round(8 * seg(TT, tS, tS + 0.6)), x0 = 540 - w / 2;
    bpText('Bit'.slice(0, n), x0, 1482, 72, BP.mint, { font: BP.mono, weight: 700, align: 'left', alpha: sa, glow: 18 });
    if (n > 3) bpText('story'.slice(0, n - 3), x0 + w1, 1482, 72, BP.magenta, { font: BP.mono, weight: 700, align: 'left', alpha: sa, glow: 18 });
    if (n < 8 || Math.floor(TT * 2.5) % 2) { ctx.save(); ctx.globalAlpha = sa; ctx.fillStyle = BP.text; ctx.font = `700 72px ${BP.mono}`; const cw = ctx.measureText('Bitstory'.slice(0, n)).width; ctx.fillRect(x0 + cw + 6, 1426, 30, 64); ctx.restore(); }
  });
}

// =====================================================================
//  the stage
// =====================================================================
function sceneStage() {
  bpGround();
  for (let i = 0; i < 26; i++) {   // motes: slow drifting dust
    const R = RNG('mote', i), x = mod(R.r(0, W) + TT * R.r(-8, 8), W), y = mod(R.r(0, H) - TT * R.r(4, 14), H);
    bpDot(x, y, R.r(1.5, 3), BP.dim, 0.35 + 0.25 * Math.sin(TT * R.r(0.5, 1.5) + i));
  }
  const seaA = 1 - 0.75 * win(HIT + 0.3, T8 - 0.2, 0.6);
  bpWater(SEA_Y, { a: seaA, n: 6, gap: 24, x0: -300, x1: W + 300 });
  drawShips();
  drawPerson();
  beatsSame();
  beatsShip();
  beatsEnd();
}
// the camera: a slow push on the ship, the push-in on the head, a gentle drift
function pieceCam(era, t) {
  const slow = 1 + 0.08 * EZ.io(seg(t, VL('two').t0, HIT)) * (1 - seg(t, HIT, HIT + 0.4)) + 0.12 * EZ.io(seg(t, VL('cells').t0, T6 + 0.1)) * (1 - EZ.io(seg(t, T7, T7 + 0.8)));
  const z = slow * springTrack([[0, 1.0], [0.2, 1.06], [T2, 1.0], [T6 + 0.1, 1.5], [T7 + 0.1, 1.0], [T8 + 0.5, 1.04]], SPRING.heavy) * (1 + 0.012 * Math.sin(t * 0.4));
  const py = springTrack([[0, 830], [T6 + 0.1, HEAD[1]], [T7 + 0.1, 830]], SPRING.heavy), ty = springTrack([[0, 830], [T6 + 0.1, 820], [T7 + 0.1, 830]], SPRING.heavy);
  return camOf({ z, p: [540, py], to: [540 + SHIFT, ty] });
}

// =====================================================================
//  the sound-effect cues: every tear, landing and reveal (synthesized in src/score.js)
// =====================================================================
window.SFX_CUES = (() => {
  const C = [], q = (t) => +t.toFixed(3);
  PERM.forEach((p, i) => {   // each plank: torn out (a crack), then the new one drops in (a knock)
    C.push({ id: 'tear' + i, t: q(REP[p]), pan: (i % 5 - 2) * 0.12 });
    C.push({ id: 'swap' + i, t: q(REP[p] + GAP + 0.08), pan: (i % 5 - 2) * 0.12 });
  });
  C.push({ id: 'pill1', t: q(VW('plut', 'arguing') - 0.1), pan: -0.3 });
  C.push({ id: 'pill2', t: q(VW('plut', 'about')), pan: 0.3 });
  C.push({ id: 'slide', t: q(VW('hobbes', 'worse') - 0.1), pan: -0.3 });
  for (let i = 0; i < N_PL; i++) C.push({ id: 'land' + i, t: q(REB(PERM[i])), pan: 0.35 });
  C.push({ id: 'hit', t: q(HIT) });
  C.push({ id: 'burst', t: q(HIT + 0.55) });
  C.push({ id: 'cells', t: q(VL('cells').t0 + 0.7) });
  C.push({ id: 'circle', t: q(VW('younger', 'almost', 2) + 0.3), pan: -0.2 });
  C.push({ id: 'word', t: q(VW('trap', 'same') + 0.05) });
  C.push({ id: 'matter', t: q(VW('means', 'matter')), pan: -0.35 });
  C.push({ id: 'story', t: q(VW('means', 'story')), pan: 0.35 });
  C.push({ id: 'apart', t: q(VW('apart', 'pulled') + 0.1) });
  C.push({ id: 'merge', t: q(T8 + 0.9) });
  const tS = VL('end').t0 + 0.6;
  for (let i = 0; i < 8; i++) C.push({ id: 'key' + i, t: q(tS + (i + 0.5) * 0.6 / 8), pan: -0.2 + i * 0.05 });
  return C.sort((a, b) => a.t - b.t);
})();
