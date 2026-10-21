// =====================================================================
//  SCENES — Why does lightning seek the ground? (voltamps). World 1080x1920, TT on 1s.
//  + magenta = positive charge / things rising from the ground; − cyan = negative charge / leaders;
//  amber = the return stroke (current), cream = heat. The camera is set here, per frame.
// =====================================================================
const GY = 1440;                                       // the ground line
const CLY = 560;                                       // the cloud's centre (anvil top ~310, base ~710)
const TOWN = { tower: 170, house: 440, lamp: 640, tree: 840 };
const TS = 1.4;                                        // the town's scale
const M = [800, 1140];                                 // where the leader and the tree's streamer meet
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const win = (t0, t1, d = 0.35) => fadeIn(t0, d) * fadeOut(t1, d);
const OV = vaOverlay;

// ---- the paths (seeded, fixed for the whole piece)
const LEADER = vaBoltPath('leader', 585, 735, M[0], M[1], 14, { branch: 0.5, jit: 0.6 });
const TREE_TOP = [TOWN.tree, GY - 176 * TS];
const STREAM = vaBoltPath('stream', TREE_TOP[0], TREE_TOP[1], M[0], M[1], 4, { branch: 0, jit: 0.35 });
const CHANNEL = [...LEADER.main, ...STREAM.main.slice(0, -1).reverse()];   // cloud -> ground, through M
const UP = [...CHANNEL].reverse();
const T_TOUCH = () => VW('connect', 'touches');

// ---- the camera: a few held framings, sprung between
function camAtT() {
  const k = (id, w, n) => VW(id, w, n);
  const cx = springTrack([[0, 540], [S('charge'), 540], [S('shadow'), 540], [S('streamers'), 700], [HIT, 540]], SPRING.smooth);
  const cy = springTrack([[0, 960], [S('charge'), 545], [S('shadow'), 960], [S('leader') + 1.2, 1010], [S('streamers'), 1170], [HIT, 960], [S('thunder'), 980]], SPRING.smooth);
  const z = springTrack([[0, 1], [S('charge'), 1.85], [S('shadow'), 1], [S('leader') + 1.2, 1.12], [S('streamers'), 1.75], [HIT, 1], [S('thunder'), 0.94]], SPRING.smooth);
  const sh = TT > HIT ? Math.exp(-(TT - HIT) * 7) * 16 : 0;
  // a constant slow float, so held framings still breathe
  return { cx: cx + 16 * Math.sin(TT * 0.27), cy: cy + 10 * Math.sin(TT * 0.21 + 1), z: z * (1 + 0.025 * Math.sin(TT * 0.33)), sx: sh * Math.sin(TT * 91), sy: sh * Math.cos(TT * 77) };
}
function setCam(c) { ctx.setTransform(c.z, 0, 0, c.z, W / 2 + c.sx - c.z * c.cx, H / 2 + c.sy - c.z * c.cy); }

// ---- the cloud drifts with the storm on "follows", then settles back
const CLX = () => 540 + 70 * Math.sin(Math.PI * clamp((TT - VW('shadow', 'follows')) / 3.4));

// =====================================================================
//  charge separation: crystals (small, light) rise on the updraft, hit graupel (large, soft), swap charge
// =====================================================================
const NP = 8;
const PARTS = [...Array(NP)].map((_, i) => {
  const R = RNG('part', i);
  return { gx: 330 + i * 60 + R.r(-10, 10), gy: 560 + R.r(-35, 35), cx0: 330 + i * 60 + R.r(-16, 16), tHit: 0, R };
});
function partTimes() {
  const a = VW('charge', 'slam'), b = VL('charge').t1 - 0.2;
  PARTS.forEach((p, i) => (p.tHit = lerp(a, b, (i * 5 % NP) / (NP - 1))));
}
// final layout of the charge layers (cloud-relative): + row up top, − row mid, a small + pocket at the base
const ROW_P = [...Array(9)].map((_, i) => [-300 + i * 75, -232 + (i % 2) * 8]);
const ROW_M = [...Array(8)].map((_, i) => [-245 + i * 70, -20 + (i % 3) * 6]);
const ROW_B = [[70, 125], [115, 128], [160, 123]];
function drawCharges(x, a) {
  if (a <= 0) return;
  for (const [dx, dy] of ROW_P) vaPlus(x + dx, CLY + dy, 26, a);
  for (const [dx, dy] of ROW_M) vaMinus(x + dx, CLY + dy, 28, a);
  for (const [dx, dy] of ROW_B) vaPlus(x + dx, CLY + dy, 20, a * 0.9);
  vaText('-15 °C', x - 250, CLY - 80, 30, VA.minus, { a: a * 0.9 * (1 - clamp((CAMZ - 1.2) / 0.2)) });
}
function cloudInner(x) {
  // updraft chevrons, rising in columns
  const ua = win(S('charge') + 0.2, VW('layers', 'splits') + 0.8, 0.6);
  if (ua > 0) for (let c = 0; c < 6; c++) for (let r = 0; r < 7; r++) {
    const yy = CLY + 160 - mod(TT * 55 + r * 52 + c * 17, 360);
    vaChevron(x - 250 + c * 100, yy, 9, VA.dim, ua * 0.8 * clamp((CLY + 160 - yy) / 60) * clamp((yy - (CLY - 210)) / 60));
  }
  partTimes();
  const t1 = VW('layers', 'light'), t2 = VW('layers', 'heavy'), t3 = VW('layers', 'splits') + 0.5;
  const pa = win(S('charge') + 0.3, t3, 0.35);
  if (pa > 0) PARTS.forEach((p, i) => {
    const R = p.R, hit = TT >= p.tHit;
    // the crystal rises toward its graupel; after the hit it rebounds, then (layers) climbs to the + row
    let cx = p.cx0 + Math.sin(TT * 2 + i) * 4, cy;
    if (!hit) cy = lerp(CLY + 150, p.gy + 14, EZ.i2(clamp(1 - (p.tHit - TT) / 1.6)));
    else cy = p.gy + 14 + 26 * EZ.o3(clamp((TT - p.tHit) / 0.3));
    const up = EZ.io(clamp((TT - t1 - i * 0.05) / 1.1));
    const tgP = ROW_P[i % ROW_P.length];
    cx = lerp(cx, x + tgP[0], up); cy = lerp(cy, CLY + tgP[1], up);
    // the graupel wobbles in place; on "heavy" it sinks to the − row
    const dn = EZ.io(clamp((TT - t2 - i * 0.04) / 1.0));
    const tgM = ROW_M[i % ROW_M.length];
    const gx = lerp(p.gx + Math.sin(TT * 1.3 + i) * 3, x + tgM[0], dn), gy = lerp(p.gy + Math.cos(TT * 1.1 + i) * 3, CLY + tgM[1], dn);
    // graupel: a ringed soft ball
    vaDot(gx, gy, 11, '#2c2580', pa); vaRing(gx, gy, 11, hit ? VA.minus : VA.line, 2.5, pa);
    if (hit) vaMinus(gx, gy, 10, pa * clamp((TT - p.tHit) / 0.2));
    // crystal: a tiny bright six-point
    ctx.save(); ctx.globalAlpha *= pa; ctx.strokeStyle = hit ? VA.plus : VA.cream; ctx.lineWidth = 2;
    for (let k = 0; k < 3; k++) { const an = k * Math.PI / 3 + TT * 1.5; ctx.beginPath(); ctx.moveTo(cx - Math.cos(an) * 6, cy - Math.sin(an) * 6); ctx.lineTo(cx + Math.cos(an) * 6, cy + Math.sin(an) * 6); ctx.stroke(); }
    ctx.restore();
    if (hit) vaPlus(cx + 9, cy - 9, 8, pa * clamp((TT - p.tHit) / 0.2));
    // the spark of the hit
    const sp = clamp((TT - p.tHit) / 0.25);
    if (sp > 0 && sp < 1) { vaRing(gx, (gy + cy) / 2, 6 + sp * 22, VA.cream, 2, (1 - sp) * pa); }
  });
  // the layered result
  drawCharges(x, fadeIn(t3, 0.5));
  // in-cloud flashes on "Most bolts never even touch it" and "jumping between layers"
  for (const [t, key] of [[VW('open', 'most'), 'ic1'], [VW('open', 'touch') - 0.1, 'ic2']]) {
    const f = clamp((TT - t) / 0.12), o = 1 - clamp((TT - t - 0.12) / 0.35);
    if (f > 0 && o > 0) { const R = RNG('ic', key); const b = vaBoltPath(key, x + R.r(-160, -40), CLY + R.r(-120, 40), x + R.r(40, 170), CLY + R.r(-60, 90), 6, { branch: 0.3 }); vaBolt(b, f * 6, VA.minus, 3, 1, { a: o }); }
  }
}

// =====================================================================
//  the town and the ground's shadow charge
// =====================================================================
function drawTown(a = 1) {
  vaGround(GY, -300, W + 300, a);
  vaTower(TOWN.tower, GY, 420, a);
  vaHouse(TOWN.house, GY, TS, a);
  vaLamp(TOWN.lamp, GY, 230, a);
  vaTree(TOWN.tree, GY, TS, a);
  for (const x of [80, 330, 570, 720, 950, 1010]) vaTuft(x, GY, 1, a);
}
function drawShadow(x) {
  const t0 = VW('shadow', 'positive'), a = fadeOut(S('leader') + 0.2, 0.5);
  // electrons in the ground pushed aside
  const tp = VW('shadow', 'pushes');
  if (TT > tp - 0.1 && TT < S('leader') + 1) for (let i = 0; i < 14; i++) {
    const R = RNG('el', i), x0 = R.r(280, 800), side = x0 < x ? -1 : 1, u = EZ.o3(clamp((TT - tp - i * 0.04) / 1.6));
    vaDot(x0 + side * u * R.r(260, 420), GY + 48 + R.r(0, 40), 5, VA.minus, (1 - u * 0.7) * fadeOut(S('leader'), 0.6));
  }
  // the positive shadow under the cloud, moving with it
  for (let i = 0; i < 11; i++) {
    const px = x - 300 + i * 60, ap = clamp((TT - t0 - i * 0.07) / 0.2);
    if (ap > 0) vaPlus(px, GY + 50, 22, ap * a);
  }
}

// =====================================================================
//  the beats
// =====================================================================
function beatUp() {   // "the flash you see falling? It's going up": a full bolt, a pulse travelling up
  const tf = VW('up', 'flash'), tg = VW('up', 'going'), a = win(tf, S('charge') - 0.15, 0.15);
  if (a <= 0) return;
  const fl = clamp((TT - tf) / 0.18);
  vaBolt(LEADER, fl * 14, VA.amber, 5, 1.2 * a, { a, branchFade: 0.6 });
  vaGlow(vaPart(STREAM.main, 1), VA.amber, 5, a, { a: a * fl });
  const pu = clamp((TT - tg) / 0.7);
  if (pu > 0 && pu < 1) { const p = vaAt(UP, pu); vaDot(p[0], p[1], 14, VA.cream, a); vaRing(p[0], p[1], 26, VA.cream, 3, a * 0.6); }
  const ar = EZ.o3(clamp((TT - tg) / 0.7));
  if (ar > 0) vaArrow(905, 1330, 905, lerp(1330, 760, ar), VA.amber, 5, a);
}
function beatVolts(x) {
  const a = win(S('volts'), S('leader') + 0.1, 0.4);
  if (a <= 0) return;
  // field lines between the − layer and the ground's +
  for (let i = 0; i < 7; i++) {
    const fx = x - 180 + i * 60, sh = 0.5 + 0.5 * Math.sin(TT * 5 + i);
    vaLine(fx, 730, fx + (i - 3) * 8, GY - 10, VA.dim, 2, { a: a * (0.35 + 0.25 * sh), dash: [8, 14] });
  }
  const tv = VW('volts', 'hundred') - 0.1;
  vaText('100,000,000 V', 540, 840, 56, VA.text, { align: 'center', weight: 700, frac: vaType(tv, '100,000,000 V', 30), a });
  const tb = VW('volts', 'breaking');
  const b = fadeIn(tb, 0.3) * a;
  if (b > 0) {
    vaText('air breaks at', 300, 920, 30, VA.plus, { a: b }); vaText('~1 MV/m', 920, 920, 30, VA.plus, { a: b, align: 'right' });
    vaBar(300, 936, 620, 34, EZ.o3(clamp((TT - tb) / 0.8)), VA.plus, b);
    const tm = VW('volts', 'measured');
    const m = fadeIn(tm - 0.4, 0.3) * a;
    vaText('most measured', 300, 1020, 30, VA.minus, { a: m }); vaText('0.4 MV/m', 920, 1020, 30, VA.minus, { a: m, align: 'right' });
    const grow = EZ.o3(clamp((TT - tm + 0.4) / 0.9)) * 0.4 + Math.max(0, Math.sin(TT * 9)) * 0.012 * m;
    vaBar(300, 1036, 620, 34, grow, VA.minus, m);
  }
  const tq = VW('volts', 'question') - 0.2, q = popS(tq) * a;
  if (q > 0) vaText('?', 640, 1170, 84 * q, VA.cream, { align: 'center', weight: 700, a });
}
function beatLeader() {
  const t0 = VW('leader', 'channel') - 0.2, t1 = VL('leader').t1 - 0.2, t2 = T_TOUCH();
  if (TT < t0 || TT > S('types')) return null;
  // stepping: steps 0..12 across the line, the last two creep down during "streamers"
  let k;
  if (TT < t1) { const u = (TT - t0) / (t1 - t0); k = Math.floor(u * 12) + EZ.o3(clamp((u * 12 % 1) / 0.25)); }
  else k = 12 + 2 * EZ.io(clamp((TT - VW('streamers', 'up')) / Math.max(0.5, t2 - VW('streamers', 'up') - 0.15)));
  const dimAfter = TT > HIT ? 0 : 1;
  if (dimAfter) {
    const flick = 0.75 + 0.25 * Math.sin(TT * 37);
    const tip = vaBolt(LEADER, k, VA.minus, 3.5, 0.7 * flick, { branchFade: 0.7 });
    // the tip gropes: a dashed probe ring
    if (TT < t2) vaRing(tip[0], tip[1], 18 + 6 * Math.sin(TT * 8), VA.minus, 2, 0.6, [5, 7]);
    // ≈ 50 m: a rule beside the step that just landed
    const tr = VW('leader', 'fifty') - 0.2, ra = win(tr, t1 + 0.6, 0.3);
    if (ra > 0) { const A = LEADER.main[5], Bq = LEADER.main[6]; vaRule(A[0] - 70, A[1], Bq[0] - 70, Bq[1], '', VA.text, 30, ra); vaText('≈50 m', Math.min(A[0], Bq[0]) - 95, (A[1] + Bq[1]) / 2 + 10, 30, VA.text, { align: 'right', a: ra }); }
    return tip;
  }
  return null;
}
function beatStreamers() {
  const ts = VW('streamers', 'sparks') - 0.15, t2 = T_TOUCH();
  if (TT < ts || TT > HIT) return;
  const zone = fadeIn(VW('streamers', 'spikes'), 0.4) * fadeOut(HIT, 0.1);
  // the field spikes: a soft magenta haze over the ground under the tip
  ctx.save(); const g = ctx.createRadialGradient(760, GY - 60, 10, 760, GY - 60, 380);
  g.addColorStop(0, `rgba(212,98,242,${0.13 * zone})`); g.addColorStop(1, 'rgba(212,98,242,0)'); ctx.fillStyle = g; ctx.fillRect(300, GY - 440, 900, 500); ctx.restore();
  // short streamers from everything pointy
  const src = [[TOWN.tower, GY - 420, 80], [TOWN.lamp, GY - 230, 60], [TOWN.house, GY - 144 * TS, 46], [570, GY - 18, 28], [720, GY - 18, 34], [950, GY - 18, 26], [1010, GY - 18, 22]];
  src.forEach(([sx, sy, len], i) => {
    const R = RNG('st', i), g2 = EZ.o2(clamp((TT - ts - i * 0.12) / 0.5)), fl = 0.55 + 0.45 * Math.sin(TT * 31 + i * 2);
    const P = [[sx, sy]]; for (let j = 1; j <= 4; j++) P.push([sx + R.r(-10, 10) + Math.sin(TT * 13 + j + i) * 3, sy - len * j / 4]);
    vaGlow(vaPart(P, g2), VA.plus, 2.5, 0.8 * fl, { a: 0.9 * (TT > t2 ? 0.5 : 1) });
  });
  // the tree's streamer climbs to the meeting point
  const g3 = EZ.io(clamp((TT - ts - 0.2) / Math.max(0.3, t2 - ts - 0.2)));
  vaGlow(vaPart(STREAM.main, g3), VA.plus, 3.2, 1, {});
  // the dashed reach circle around the meeting point
  const ca = win(ts + 0.3, HIT, 0.3);
  if (ca > 0) vaRing(M[0], M[1] + 30, 92, VA.plus, 2, ca * 0.6, [8, 10]);
}
function beatConnect() {
  const t2 = T_TOUCH(), a = clamp((TT - t2) / 0.1) * fadeOut(HIT + 0.2, 0.2);
  if (a <= 0) return;
  vaDot(M[0], M[1], 9, VA.cream, a);
  vaRing(M[0], M[1], 18 + 40 * EZ.o3(clamp((TT - t2) / 0.6)), VA.cream, 3, a * (1 - clamp((TT - t2) / 0.9) * 0.7));
}
function beatReturn() {   // the circuit closes; the return stroke runs up; then dims, re-strikes (flicker), thunder
  if (TT < HIT || TT > S('types')) return 0;
  const run = clamp((TT - HIT) / 0.45);
  const tStay = VW('flicker', 'stays'), dart = [VW('flicker', 'new', 1), VW('flicker', 'new', 2), VW('flicker', 'three'), VW('flicker', 'four')];
  // brightness: the first stroke, decaying to a held glow; dims on "stays hot"; flashes on each re-strike
  let k = TT < tStay ? 1 - 0.45 * clamp((TT - HIT - 0.4) / 1.5) : 0.22;
  let warm = TT < tStay ? 1 - 0.5 * clamp((TT - HIT - 0.3) / 1.6) : 0.12;
  for (const d of dart) { const e = TT - d - 0.16; if (e > 0) { const f = Math.exp(-e * 6); k = Math.max(k, f); warm = Math.max(warm, 0.9 * f); } }
  const tTh = VW('thunder', 'plasma');
  if (TT > tTh) { const f = Math.exp(-(TT - tTh) * 2.5); k = Math.max(k * (1 - clamp((TT - tTh) / 1.5)), f * 0.9); warm = Math.max(warm * 0.4, f * 0.7); }
  // the lit part of the channel (from the ground up)
  const lit = vaPart(UP, run);
  vaGlow(lit, VA.amber, 5, 1.2 * k, { core: k > 0.7 ? VA.cream : VA.amber });
  for (const b of LEADER.branches) vaGlow(b.pts, VA.amber, 2.8, 0.7 * k * clamp(run * 2 - 1), { a: 0.8 });
  // the pulse head
  if (run < 1) { const p = vaAt(UP, run); vaDot(p[0], p[1], 12, VA.cream); vaRing(p[0], p[1], 30, VA.cream, 3, 0.5); }
  // darts: a cyan leader down the old channel, in one go
  for (const d of dart) { const u = clamp((TT - d) / 0.16); if (u > 0 && u < 1) { const p = vaAt(CHANNEL, u); vaGlow(vaPart(CHANNEL, u), VA.minus, 3, 0.8, { a: 0.8 }); vaDot(p[0], p[1], 8, VA.minus); } }
  return warm;
}
function beatNumbers() {
  const a = win(VW('numbers', 'thirty', 1) - 0.15, S('flicker') + 0.4, 0.35);
  // ⅓ c on the up arrow
  const tr = HIT, ar = EZ.o3(clamp((TT - tr) / 0.45)), aa = win(HIT, S('numbers') + 0.2, 0.3);
  if (aa > 0) { vaArrow(905, 1330, 905, lerp(1330, 760, ar), VA.amber, 5, aa); const tt = VW('return', 'third') - 0.1; vaText('⅓ c', 885, 1060, 40, VA.amber, { align: 'right', frac: vaType(tt, '⅓ c', 12), a: aa }); }
  if (a <= 0) return;
  const t1 = VW('numbers', 'thirty', 1) - 0.1, t2 = VW('numbers', 'thirty', 2) - 0.1, t3 = VW('numbers', 'five') - 0.1, t4 = VW('numbers', 'channel');
  vaText('30,000 A', 90, 815, 54, VA.amber, { weight: 700, frac: vaType(t1, '30,000 A', 24), a, glow: 10 });
  const b = fadeIn(t2, 0.2) * a;
  vaDot(112, 1000, 20, VA.cream, b); vaText('30,000 °C', 150, 1012, 34, VA.cream, { frac: vaType(t2, '30,000 °C', 26), a: b });
  const c = fadeIn(t3, 0.2) * a;
  vaDot(112, 930, 20, '#5d5888', c); vaText('5,500 °C  Sun', 150, 942, 34, VA.text, { frac: vaType(t3, '5,500 °C  Sun', 30), a: c });
  vaText('×5', 90, 1090, 44, VA.amber, { weight: 700, a: popS(t3 + 0.7) * a });
  // ≈2 cm on the channel: a tiny tick pair with a magnifier ring
  const d = fadeIn(t4, 0.25) * a, P = vaAt(CHANNEL, 0.62);
  vaRing(P[0], P[1], 34, VA.text, 2, d); vaLine(P[0] + 34, P[1], P[0] + 90, P[1] - 10, VA.text, 2, { a: d });
  vaText('≈2 cm', P[0] + 98, P[1] - 4, 32, VA.text, { a: d, frac: vaType(t4, '≈2 cm', 14) });
}
function beatFlicker() {
  const a = win(VW('flicker', 'new', 1) - 0.4, S('thunder') + 0.2, 0.3);
  if (a <= 0) return;
  const dart = [HIT, VW('flicker', 'new', 1) + 0.16, VW('flicker', 'new', 2) + 0.16, VW('flicker', 'three') + 0.16, VW('flicker', 'four') + 0.16];
  // a 0.5 s timeline with a tick per stroke
  const x0 = 560, x1 = 910, y = 880;
  vaLine(x0, y, x1, y, VA.dim, 2.5, { a });
  vaLine(x0, y - 10, x0, y + 10, VA.dim, 2.5, { a }); vaLine(x1, y - 10, x1, y + 10, VA.dim, 2.5, { a });
  vaText('0.5 s', x1, y + 48, 30, VA.text, { align: 'right', a });
  const span = 0.42, pos = [0, 0.18, 0.43, 0.68, 0.9];
  dart.forEach((d, i) => { const s = popS(i === 0 ? VW('flicker', 'new', 1) - 0.35 : d); if (s > 0) { vaLine(x0 + (x1 - x0) * pos[i] * span / 0.5 * 1.15, y - 26 * s, x0 + (x1 - x0) * pos[i] * span / 0.5 * 1.15, y, VA.amber, 4, { a }); } });
}
function beatThunder() {
  const t0 = VW('thunder', 'blasts') - 0.3, a = win(t0, S('types'), 0.3);
  if (a <= 0) return;
  // pressure rings: a dashed wave expanding off the channel
  for (let r = 0; r < 4; r++) {
    const u = clamp((TT - t0 - r * 0.35) / 2.2);
    if (u <= 0 || u >= 1) continue;
    const P = CHANNEL.map(([x, y], i) => { const n = CHANNEL[Math.min(i + 1, CHANNEL.length - 1)], m = CHANNEL[Math.max(i - 1, 0)], ang = Math.atan2(n[1] - m[1], n[0] - m[0]) + Math.PI / 2; return [x + Math.cos(ang) * u * 260, y + Math.sin(ang) * u * 260]; });
    const Q = CHANNEL.map(([x, y], i) => { const n = CHANNEL[Math.min(i + 1, CHANNEL.length - 1)], m = CHANNEL[Math.max(i - 1, 0)], ang = Math.atan2(n[1] - m[1], n[0] - m[0]) - Math.PI / 2; return [x + Math.cos(ang) * u * 260, y + Math.sin(ang) * u * 260]; });
    vaStroke(P, VA.cream, 2.5, { a: a * (1 - u) * 0.8, dash: [10, 12] }); vaStroke(Q, VA.cream, 2.5, { a: a * (1 - u) * 0.8, dash: [10, 12] });
  }
  const tk = VW('thunder', 'three') - 0.2, k = fadeIn(tk, 0.25) * a;
  if (k > 0) { vaRule(120, 1010, 420, 1010, '', VA.text, 30, k); vaText('1 km', 270, 990, 34, VA.text, { align: 'center', a: k }); vaText('≈ 3 s', 270, 1068, 44, VA.cream, { align: 'center', weight: 700, a: k, frac: vaType(tk + 0.3, '≈ 3 s', 12) }); }
}

// =====================================================================
//  the title (screen space)
// =====================================================================
function drawTitle() {
  const a = fadeOut(VW('open', 'touch') + 0.4, 0.4);
  if (a <= 0) return;
  OV(() => {
    vaText('WHY DOES LIGHTNING', 540, 1000, 68, VA.cream, { align: 'center', weight: 700, frac: vaType(VL('title').t0 - 0.05, 'WHY DOES LIGHTNING', 24), a, glow: 6 });
    vaText('SEEK THE GROUND?', 540, 1088, 68, VA.plus, { align: 'center', weight: 700, frac: vaType(VW('title', 'seek') - 0.05, 'SEEK THE GROUND?', 22), a, glow: 16 });
    vaLine(300, 1128, 300 + 480 * EZ.o3(clamp((TT - VL('title').t1) / 0.6)), 1128, VA.minus, 3, { a });
  });
}

// the warm level of the strike, without drawing (the same envelope as beatReturn)
function beatReturnWarm() {
  const tStay = VW('flicker', 'stays'), dart = [VW('flicker', 'new', 1), VW('flicker', 'new', 2), VW('flicker', 'three'), VW('flicker', 'four')];
  let warm = TT < tStay ? 1 - 0.5 * clamp((TT - HIT - 0.3) / 1.6) : 0.12;
  for (const d of dart) { const e = TT - d - 0.16; if (e > 0) warm = Math.max(warm, 0.9 * Math.exp(-e * 6)); }
  const tTh = VW('thunder', 'plasma');
  if (TT > tTh) warm = Math.max(warm * 0.4, 0.7 * Math.exp(-(TT - tTh) * 2.5));
  return warm * clamp((TT - HIT) / 0.08);
}
