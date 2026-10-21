let CAMZ = 1;
// =====================================================================
//  SCENES 2 — the later small stages (types, positive bolts, upward, the rod, the Empire State, the end)
//  and the stage itself. Each small stage dips through the dark into the next (0.3s).
// =====================================================================
const DIP = 0.3;
const inSub = (id, from = id, to = id) => win(SUB(from), SUBEND(to), DIP);
// a slow, constant push so a held stage still moves
function subCam(z0 = 1, z1 = 1.05, t0 = 0, t1 = 1, cx = 540, cy = 960) { const z = lerp(z0, z1, EZ.io(clamp((TT - t0) / Math.max(0.1, t1 - t0)))); return { cx: cx + 18 * Math.sin(TT * 0.3), cy: cy + 10 * Math.sin(TT * 0.23), z: z * (1 + 0.02 * Math.sin(TT * 0.4)), sx: 0, sy: 0 }; }
// a flash envelope: up in 0.08s, down in d
const flashK = (t, d = 0.6) => (TT < t ? 0 : TT < t + 0.08 ? (TT - t) / 0.08 : Math.exp(-(TT - t - 0.08) / d * 3));

// ---- 14 · types: four little skies
const TYPE_C = [[320, 520], [740, 520], [320, 990], [740, 990]];
function stageTypes(a) {
  const t0 = SUB('types'), tIn = VW('types', 'inside') - 0.1, tCC = VW('types', 'cloud', 2) - 0.1, tAir = VW('types', 'fades') - 0.1, tGr = VW('types', 'ground') - 0.1;
  const labels = ['in the cloud', 'cloud to cloud', 'into the air', 'to the ground'];
  const cues = [tIn, tCC, tAir, tGr];
  TYPE_C.forEach(([x, y], i) => {
    const pa = a * fadeIn(t0 + 0.1 + i * 0.12, 0.35);
    if (pa <= 0) return;
    const s = 0.4, k = flashK(cues[i] + 0.15, 0.9), rep = flashK(cues[i] + 1.6, 0.6);
    const cx = i === 1 ? x - 70 : x;
    ctx.save(); ctx.globalAlpha *= pa;
    vaCloud(cx, y, s, { lit: Math.max(k, rep) * (i === 0 ? 1 : 0.6), litAt: [cx, y, i === 3 ? '#ffbd3a' : '#4fd2ff'] });
    if (i === 1) vaCloud(x + 95, y + 30, 0.3, { lit: Math.max(k, rep) * 0.6, litAt: [x + 95, y + 30, '#4fd2ff'] });
    if (i === 3 || i === 2) vaLine(x - 190, y + 260, x + 190, y + 260, VA.line, 2.5);
    const g = clamp((TT - cues[i]) / 0.25), dim = 0.35 + 0.65 * Math.max(k, rep, TT < cues[i] + 0.3 ? 1 : 0.4);
    let b;
    if (i === 0) b = vaBoltPath('ty0', cx - 90, y - 20, cx + 100, y + 30, 5, { branch: 0.4 });
    if (i === 1) b = vaBoltPath('ty1', cx + 40, y + 40, x + 70, y + 60, 4, { branch: 0.3 });
    if (i === 2) b = vaBoltPath('ty2', cx + 10, y + 70, cx + 70, y + 190, 4, { branch: 0.5 });
    if (i === 3) b = vaBoltPath('ty3', cx - 10, y + 70, cx + 40, y + 260, 6, { branch: 0.4 });
    if (g > 0) vaBolt(b, g * (b.main.length - 1), i === 3 ? VA.amber : VA.minus, 3, dim, { a: dim });
    vaText(labels[i], x, y + (i < 2 ? 210 : 310), 32, i === 3 ? VA.amber : VA.text, { align: 'center', frac: vaType(cues[i], labels[i], 30) });
    ctx.restore();
  });
  // for every flash that lands, five to ten stay up
  const tc = VW('types', 'inside') + 0.5, ca = a * fadeIn(tc, 0.3);
  if (ca > 0) {
    for (let j = 0; j < 8; j++) { const s2 = popS(tc + j * 0.07); ctx.save(); ctx.globalAlpha *= ca; ctx.fillStyle = j === 7 ? VA.amber : VA.minus; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12; const w = 44 * s2; ctx.fillRect(330 + j * 56 - w / 2 + 22, 1440 - w / 2, w, w); ctx.restore(); }
    vaText('5–10 stay up for every 1 that lands', 540, 1395, 30, VA.text, { align: 'center', a: ca, frac: vaType(tc + 0.4, '5–10 stay up for every 1 that lands', 40) });
  }
}

// ---- 15 · positive: 90 % negative near, 10 % positive from the anvil, far out under a clear sky
const POS_GY = 1300;
const NEG_B = vaBoltPath('neg', 300, 845, 330, POS_GY, 9, { branch: 0.4 });
const POS_B = (() => {   // out of the anvil's tip, an arc away to the right, then down onto the hill
  const P = [[636, 528]], R = RNG('posb');
  for (let i = 1; i <= 16; i++) { const u = i / 16; P.push([636 + 300 * Math.sin(u * Math.PI * 0.55) + R.r(-14, 14), 528 + (POS_GY - 150 - 528) * Math.pow(u, 1.6) + R.r(-10, 10)]); }
  P.push([950, POS_GY - 140]);
  return { main: P, branches: [{ at: 6, pts: [P[6], [P[6][0] + 40, P[6][1] + 30], [P[6][0] + 60, P[6][1] + 80]] }, { at: 11, pts: [P[11], [P[11][0] - 40, P[11][1] + 40], [P[11][0] - 50, P[11][1] + 90]] }], steps: 17 };
})();
function stagePositive(a) {
  ctx.save(); ctx.globalAlpha *= a;
  const t9 = VW('positive', 'nine') - 0.1, tAn = VW('positive', 'anvil') - 0.2, tTen = VW('positive', 'ten', 2) - 0.1, tSky = VW('positive', 'clear') - 0.1, tFire = VW('positive', 'wildfires') - 0.2;
  // sky clears to the right: the sun comes up over the hill
  const sa = fadeIn(tSky, 0.5);
  if (sa > 0) vaSun(930, 330, 42, VA.amber, sa * (0.8 + 0.2 * Math.sin(TT * 2)));
  vaCloud(330 + 20 * Math.sin(TT * 0.5), 680, 0.66, { lit: Math.max(flashK(t9 + 0.1), flashK(tAn + 0.5) * 0.8, 0.45 * Math.max(0, Math.sin(TT * 2.3)) ** 10), litAt: [330, 800, '#4fd2ff'] });
  vaGround(POS_GY, -100, W + 100);
  vaHill(720, 1180, POS_GY, 150);
  // the common bolt: negative, near
  const g = clamp((TT - t9) / 0.3), k1 = Math.max(0.5, flashK(t9 + 0.3, 1.2));
  if (g > 0) { vaBolt(NEG_B, g * 9, VA.minus, 4, k1); vaText('90 %', 130, 1150, 46, VA.minus, { weight: 700, frac: vaType(t9, '90 %', 12), glow: 8 }); vaText('−', 130, 1210, 46, VA.minus, { a: fadeIn(t9 + 0.3) }); }
  // the rare one: positive, from the anvil, far out
  const gp = clamp((TT - tAn) / 0.9), k2 = Math.max(0.55, flashK(tAn + 0.9, 1.4));
  if (gp > 0) { vaBolt(POS_B, gp * 17, VA.plus, 4.5, k2); vaText('10 % +', 870, 560, 46, VA.plus, { weight: 700, align: 'right', frac: vaType(tAn + 0.3, '10 % +', 14), glow: 8 }); }
  // > 10 km
  const ra = fadeIn(tTen, 0.3);
  if (ra > 0) { const xr = lerp(330, 950, EZ.o3(clamp((TT - tTen) / 0.7))); vaRule(330, POS_GY + 70, xr, POS_GY + 70, '', VA.text, 30, ra); vaText('> 10 km', 640, POS_GY + 125, 36, VA.text, { align: 'center', a: ra, frac: vaType(tTen + 0.3, '> 10 km', 14) }); }
  // a fire on the hill
  const fa = fadeIn(tFire, 0.4);
  if (fa > 0) for (let f = 0; f < 3; f++) {
    const fx = 930 + f * 34 - 34, fy = POS_GY - 132 + Math.abs(f - 1) * 12, h = (46 - Math.abs(f - 1) * 14) * (0.85 + 0.15 * Math.sin(TT * 17 + f * 2)) * popS(tFire + f * 0.12);
    ctx.save(); ctx.globalAlpha *= fa; ctx.shadowColor = VA.amber; ctx.shadowBlur = 24; ctx.fillStyle = f === 1 ? VA.amber : '#ff7a2a';
    ctx.beginPath(); ctx.moveTo(fx - h * 0.3, fy); ctx.quadraticCurveTo(fx - h * 0.35, fy - h * 0.6, fx + Math.sin(TT * 9 + f) * 4, fy - h); ctx.quadraticCurveTo(fx + h * 0.35, fy - h * 0.6, fx + h * 0.3, fy); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

// ---- 16 · upward: from a tower on a peak, a bolt climbs and branches upward
const UPB = (() => { const b = vaBoltPath('upw', 487, 850, 560, 590, 12, { branch: 0.55, jit: 0.5 }); b.branches.forEach((br) => br.pts.forEach((p) => { p[1] = 2 * br.pts[0][1] - p[1]; })); return b; })();
function stageUpward(a) {
  ctx.save(); ctx.globalAlpha *= a;
  const t0 = VW('upward', 'start') - 0.2, tc = VW('upward', 'climb') - 0.1;
  vaCloud(540, 430, 0.75, { lit: flashK(tc + 0.3, 1.0), litAt: [560, 560, '#e07cff'] });
  vaGround(GY, -100, W + 100);
  const hill = vaHill(110, 970, GY, 400), pk = hill.reduce((m, p) => (p[1] < m[1] ? p : m));
  vaTower(pk[0], pk[1] + 2, 190);
  for (const x of [200, 330, 780, 900]) vaTuft(x, GY, 1);
  const g = clamp((TT - t0) / Math.max(0.4, tc + 0.4 - t0));
  if (g > 0) vaBolt(UPB, g * 12, VA.plus, 4.5, 0.6 + 0.6 * flashK(tc + 0.3, 1.2));
  const la = fadeIn(t0 + 0.2, 0.3);
  vaArrow(790, 1030, 790, lerp(1030, 760, EZ.o3(clamp((TT - t0) / 0.8))), VA.plus, 4, la);
  vaText('from below', 790, 1100, 32, VA.plus, { align: 'center', a: la, frac: vaType(t0 + 0.3, 'from below', 24) });
  ctx.restore();
}

// ---- 17 · the rod: it only makes sure the last jump comes from grounded metal
const ROD = { x: 540, y: 1380, s: 2.3 };
function stageRod(a) {
  ctx.save(); ctx.globalAlpha *= a;
  const tAt = VW('rod', 'attract') - 0.1, tJ = VW('rod', 'jump') - 0.2, tM = VW('rod', 'grounded') - 0.1, tR = VW('rod', 'roof') - 0.1;
  const tip = [ROD.x, ROD.y - 82 * ROD.s - 62 * ROD.s - 70 * ROD.s];
  // the leader comes down from the top
  const L2 = vaBoltPath('rodl', 470, -40, tip[0], tip[1] - 120, 8, { branch: 0.4 });
  const gL = clamp((TT - SUB('rod') - 0.3) / Math.max(0.5, tJ - SUB('rod') - 0.3));
  const hit = TT > tJ + 0.35;
  // "doesn't attract": a crossed-out magnet field (dashed rings that do NOT pull)
  const xa = win(tAt, tJ, 0.25);
  if (xa > 0) { vaRing(tip[0], tip[1], 120, VA.dim, 2, xa, [6, 10]); vaRing(tip[0], tip[1], 200, VA.dim, 2, xa * 0.6, [6, 10]); vaLine(tip[0] - 150, tip[1] - 150, tip[0] + 150, tip[1] + 150, VA.red, 4, { a: xa }); }
  // the house, its rod, the down-conductor to earth (lit by the current)
  const cur = hit ? Math.max(0.35, flashK(tJ + 0.35, 1.2)) : 0;
  vaGround(ROD.y, -100, W + 100);
  vaHouse(ROD.x, ROD.y, ROD.s, 1, { rod: true, rodC: cur > 0 ? VA.amber : VA.cream, cond: 1 });
  vaTree(900, ROD.y, 1.4);
  vaBolt(L2, gL * 8, hit ? VA.amber : VA.minus, 4, hit ? 1.2 * cur : 0.8);
  // the last jump: a short spark from the rod tip up to the leader
  const sj = clamp((TT - tJ) / 0.35);
  if (sj > 0) vaGlow(vaPart([tip, [tip[0] + 8, tip[1] - 50], [tip[0] - 4, tip[1] - 120]], sj), hit ? VA.amber : VA.plus, 4, 1);
  // current runs down the conductor into the earth
  if (hit) {
    const P = [tip, [ROD.x, ROD.y - 144 * ROD.s], [ROD.x + 90 * ROD.s + 10 * ROD.s, ROD.y - 82 * ROD.s + 4 * ROD.s], [ROD.x + 100 * ROD.s, ROD.y + 70 * ROD.s]];
    vaGlow(vaPart(P, clamp((TT - tJ - 0.35) / 0.4)), VA.amber, 4, cur);
    const pu = clamp((TT - tM) / 0.9); if (pu > 0 && pu < 1) { const p = vaAt(P, pu); vaDot(p[0], p[1], 10, VA.cream); }
    vaText('grounded metal', ROD.x + 180, ROD.y + 60, 30, VA.amber, { align: 'right', a: fadeIn(tM, 0.3), frac: vaType(tM, 'grounded metal', 26) });
  }
  // not your roof: the roof gets a check
  const ra = fadeIn(tR, 0.25);
  if (ra > 0) vaStroke([[ROD.x - 160, ROD.y - 250], [ROD.x - 120, ROD.y - 210], [ROD.x - 50, ROD.y - 300]], '#6ee7a8', 6, { a: ra });
  ctx.restore();
}

// ---- 18 · twice: the Empire State, about two dozen a year
const ESB = { x: 400, y: GY };
function esbPts() {
  const x = ESB.x, y = ESB.y;
  return [[x - 150, y], [x - 150, y - 520], [x - 110, y - 520], [x - 110, y - 700], [x - 70, y - 700], [x - 70, y - 800], [x - 34, y - 800], [x - 34, y - 860], [x - 10, y - 860], [x - 6, y - 960], [x + 6, y - 960], [x + 10, y - 860], [x + 34, y - 860], [x + 34, y - 800], [x + 70, y - 800], [x + 70, y - 700], [x + 110, y - 700], [x + 110, y - 520], [x + 150, y - 520], [x + 150, y]];
}
function stageTwice(a) {
  ctx.save(); ctx.globalAlpha *= a;
  const t1 = VW('twice', 'strikes') - 0.1, t2 = VW('twice', 'twice') - 0.05, tD = VW('twice', 'dozen') - 0.4;
  const top = [ESB.x, ESB.y - 1080];
  const P = esbPts();
  ctx.fillStyle = VA.fill2; vaTrace(P, true); ctx.fill(); vaStroke(P, VA.line, 3, { closed: true });
  vaLine(ESB.x, ESB.y - 960, ESB.x, top[1], VA.line, 3);
  // windows: a few lit, twinkling
  for (let i = 0; i < 70; i++) { const R = RNG('win', i), wx = ESB.x + R.r(-130, 130), wy = ESB.y - R.r(30, 500); if (R.f() < 0.45) vaDot(wx | 0, wy | 0, 3, VA.amber, 0.25 + 0.4 * (Math.sin(TT * R.r(0.3, 1) + i) > 0.6)); }
  for (let i = 0; i < 26; i++) { const R = RNG('win2', i), wx = ESB.x + R.r(-95, 95), wy = ESB.y - R.r(540, 690); if (R.f() < 0.5) vaDot(wx | 0, wy | 0, 3, VA.amber, 0.3); }
  vaGround(GY, -100, W + 100);
  // two strikes on the spire
  for (const [t, key] of [[t1, 'e1'], [t2, 'e2']]) {
    const b = vaBoltPath(key, ESB.x + (key === 'e1' ? -120 : 140), -40, top[0], top[1], 9, { branch: 0.45 });
    const g = clamp((TT - t) / 0.18), k = flashK(t + 0.18, 0.7);
    if (g > 0 && k > 0.03) vaBolt(b, g * 9, VA.amber, 4, k, { a: Math.min(1, k * 1.5) });
  }
  // the count: ~24 bolts a year fill a little grid
  const ca = fadeIn(tD - 0.2, 0.3);
  if (ca > 0) {
    for (let i = 0; i < 24; i++) {
      const s2 = popS(tD + i * 0.06), cx = 640 + (i % 4) * 78, cy = 560 + Math.floor(i / 4) * 92;
      if (s2 <= 0) continue;
      vaGlow([[cx + 6, cy - 30 * s2], [cx - 8, cy], [cx + 8, cy], [cx - 6, cy + 30 * s2]], VA.amber, 3.5, 0.7, { a: ca });
    }
    vaText('≈ 24 / year', 757, 1150, 40, VA.amber, { align: 'center', weight: 700, a: ca, frac: vaType(tD + 1.2, '≈ 24 / year', 18), glow: 8 });
  }
  ctx.restore();
}

// ---- 19 · the end: back to the town; the leader gropes down blind, and the ground rises to meet it
const END_L = vaBoltPath('endl', 520, 735, 860, 1120, 12, { branch: 0.5, jit: 0.7 });
const END_S = vaBoltPath('ends', TREE_TOP[0], TREE_TOP[1], 860, 1120, 4, { branch: 0, jit: 0.3 });
function stageEnd(a) {
  ctx.save(); ctx.globalAlpha *= a;
  const t0 = SUB('end'), tB = VW('end', 'blindly') - 0.3, tR = VW('end', 'rises') - 0.2, tM = VW('end', 'meet') + 0.1, tF = VL('end').t1 + 0.2;
  const k = flashK(tF, 1.6);
  vaCloud(540, CLY, 1, { lit: Math.max(k, 0.25 * flashK(tB, 0.5)), litAt: [600, 700, k > 0.1 ? '#ffbd3a' : '#4fd2ff'] });
  drawCharges(540, 1);
  drawTown(1);
  const gL = TT < tR ? 9 * EZ.o2(clamp((TT - t0 - 0.3) / (tR - t0 - 0.3))) : 9 + 3 * clamp((TT - tR) / (tM - tR));
  const hit = TT > tF;
  vaBolt(END_L, gL, hit ? VA.amber : VA.minus, hit ? 5 : 3.5, hit ? 1.2 * Math.max(0.35, k) : 0.75);
  if (!hit && TT < tM) { const tip = vaAt(END_L.main, gL / 12); vaRing(tip[0], tip[1], 20 + 6 * Math.sin(TT * 8), VA.minus, 2, 0.6, [5, 7]); }
  const gs = clamp((TT - tR) / Math.max(0.3, tM - tR));
  if (gs > 0) vaGlow(vaPart(END_S.main, gs), hit ? VA.amber : VA.plus, hit ? 5 : 3.2, hit ? 1.2 * Math.max(0.35, k) : 1);
  // the last words
  const la = fadeIn(tF + 0.3, 0.5);
  if (la > 0) OV(() => {
    vaText('THE GROUND RISES', 540, 1330, 56, VA.cream, { align: 'center', weight: 700, a: la, frac: vaType(tF + 0.3, 'THE GROUND RISES', 24), glow: 8 });
    vaText('TO MEET IT.', 540, 1405, 56, VA.plus, { align: 'center', weight: 700, a: la, frac: vaType(tF + 0.95, 'TO MEET IT.', 20), glow: 14 });
  });
  // the channel's name, under everything: Bit in cyan, volts in magenta
  const na = fadeIn(tF + 1.7, 0.5);
  if (na > 0) OV(() => {
    ctx.save(); ctx.font = `700 46px ${VMONO}`; const wB = ctx.measureText('Bit').width, wV = ctx.measureText('volts').width; ctx.restore();
    const x0 = 540 - (wB + wV) / 2;
    vaText('Bit', x0, 1488, 46, VA.minus, { weight: 700, a: na, glow: 12 });
    vaText('volts', x0 + wB, 1488, 46, VA.plus, { weight: 700, a: na, glow: 12 });
  });
  ctx.restore();
  return k;
}

// =====================================================================
//  the stage
// =====================================================================
function sceneStage() {
  vaBg(0);
  CAMZ = 1;
  const main = TT < S('types');
  let c = main ? camAtT() : subCam(1, 1.05, SUB('types'), DURATION);
  if (!main) for (const id of ['types', 'positive', 'upward', 'rod', 'twice', 'end']) if (TT >= SUB(id) && TT < SUBEND(id)) c = subCam(1, 1.12, SUB(id), SUBEND(id), 540, 960);
  if (TT >= SUB('end')) { const tF = VL('end').t1 + 0.2; c.cy = springTrack([[SUB('end'), 960], [tF + 0.2, 1140]], SPRING.heavy); c.z = 1.0; }   // the frame lifts to make room for the last words
  // the warm wash of a strike
  let w = 0;
  if (TT >= VW('up', 'flash') && TT < S('charge')) w = 0.8 * win(VW('up', 'flash'), S('charge') - 0.2, 0.12);
  if (TT >= HIT && main) w = Math.max(w, beatReturnWarm());
  if (TT >= SUB('end')) w = Math.max(w, flashK(VL('end').t1 + 0.2, 1.6) * 0.9 + (TT > VL('end').t1 + 0.2 ? 0.15 : 0));
  if (w > 0) vaBg(w);
  // depth: far storm bank and ridges (flashes light the bank), rain
  const farFlash = Math.max(w, flashK(VW('open', 'most'), 0.5), flashK(VW('open', 'touch'), 0.5));
  const gyW = TT >= SUB('positive') && TT < SUBEND('positive') ? POS_GY : TT >= SUB('rod') && TT < SUBEND('rod') ? ROD.y : TT >= SUB('types') && TT < SUBEND('types') ? 1600 : GY;
  vaFar(c, main || TT >= SUB('end') ? 1 : 0.55, farFlash, gyW);
  vaRain(0.9);
  vaSpecks(46, 0.3);
  CAMZ = c.z; setCam(c);
  if (main) {
    const x = CLX();
    const ca = EZ.o2(clamp(TT / 1.4));
    // the cloud is lit from inside by in-cloud flashes, the leader's start and the strike
    const icK = Math.max(flashK(VW('open', 'most'), 0.5), flashK(VW('open', 'touch') - 0.1, 0.5));
    const lit = Math.max(icK, TT >= HIT ? beatReturnWarm() * 0.9 : 0, TT >= VW('up', 'flash') && TT < S('charge') ? w : 0, 0.18 * Math.max(0, Math.sin(TT * 0.8)) ** 30);
    ctx.save(); if (TT < 1.4) ctx.filter = `blur(${(1 - ca) * 14}px)`;
    vaCloud(x, CLY, 1, { a: ca, inner: () => cloudInner(x), lit, litAt: TT >= HIT || (TT >= VW('up', 'flash') && TT < S('charge')) ? [600, 760, '#ffbd3a'] : [x, CLY, '#6f8bff'] });
    ctx.restore();
    drawTown(EZ.o2(clamp((TT - 0.4) / 1.2)));
    if (w > 0.05) vaLine(-300, GY, W + 300, GY, VA.amber, 3, { a: w * 0.7 });   // the ground catches the light
    drawShadow(x);
    beatUp(); beatVolts(x); beatLeader(); beatStreamers(); beatConnect(); beatReturn(); beatNumbers(); beatFlicker(); beatThunder();
    drawTitle();
  } else {
    const ta = inSub('types'); if (ta > 0) stageTypes(ta);
    const pa = inSub('positive'); if (pa > 0) stagePositive(pa);
    const ua = inSub('upward'); if (ua > 0) stageUpward(ua);
    const ra = inSub('rod'); if (ra > 0) stageRod(ra);
    const sa = inSub('twice'); if (sa > 0) stageTwice(sa);
    const ea = TT >= SUB('end') ? fadeIn(SUB('end'), DIP) : 0; if (ea > 0) stageEnd(ea);
  }
}
