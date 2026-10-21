// =====================================================================
//  SCENES — Rhaenyra (tapestry). One embroidered strip: panel i sits at world x = i*W; at every shot boundary
//  the camera slides right to the next panel (no cuts). Borders, linen, dividers and captions belong to the cloth.
//  Main band y 360..1500, feet on TP_FLOOR. Red/navy lettering; Blacks black, Greens green.
// =====================================================================
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const shotU = (id) => clamp((TT - SUB(id)) / (SUBEND(id) - SUB(id)));
const FL = TP_FLOOR, SLIDE = 0.8, PZ = 1.12;

// ---- the strip: an eased step at each boundary
function stripPos() { let p = 0; for (let i = 1; i < TB.length; i++) p += EZ.io(clamp((TT - (TB[i] - SLIDE / 2)) / SLIDE)); return p; }

// ---- captions, stitched into each panel: chunks at sentence ends (and a comma inside a long sentence)
const CAPS = {};
const WORD_C = { blacks: TP.black, greens: TP.green, fire: TP.red, blood: TP.redD, dragons: TP.red, rhaenyra: TP.red, aegon: TP.green, "aegon's": TP.green, lucerys: TP.navy, aemond: TP.navy };
function capChunks(id) {
  const L = VL(id), ws = L.text.split(/\s+/), out = [[]];
  const left = (i) => { let n = 0; for (let j = i + 1; j < ws.length; j++) { n++; if (/[.:?]$/.test(ws[j])) break; } return n; };
  ws.forEach((w, i) => {
    const n = w.toLowerCase().replace(/[^a-z']/g, '');
    out[out.length - 1].push({ w, t: L.words[i] ? L.words[i].t0 : L.t0, c: WORD_C[n] });
    const cur = out[out.length - 1];
    if (i < ws.length - 1 && (/[.:?]$/.test(w) || (/,$/.test(w) && cur.length >= 7 && left(i) >= 4))) out.push([]);
  });
  return out;
}
function panelCaption(i) {
  const id = IDS[i]; if (!VL(id)) return;
  const ch = CAPS[id] || (CAPS[id] = capChunks(id));
  for (let k = 0; k < ch.length; k++) {
    const t0 = ch[k][0].t - 0.15, t1 = k + 1 < ch.length ? ch[k + 1][0].t - 0.15 : 1e9;
    if (TT < t0 || TT >= t1) continue;
    tpCaption(ch[k], 540, 470, { size: 62, maxW: 790, a: k + 1 < ch.length ? fadeOut(t1 - 0.15, 0.15) : 1 });
  }
}

// ---- border emblems (each drawn at the centre of its compartment)
const EMB = [
  () => tpSigil(TP.red, 0.9),
  () => tpFill([[-46, 30], [-52, -26], [-26, 2], [-8, -40], [10, 0], [30, -36], [50, 2], [54, -26], [48, 30]], TP.gold, { key: 'ecr', couch: false, lw: 2.2 }),
  () => { tpFill(ellipsePts(0, 0, 34, 46, 0, 18), TP.wine, { key: 'eeg', couch: false }); for (let i = 0; i < 6; i++) tpStem(arcPts(-14 + (i % 3) * 14, -18 + Math.floor(i / 3) * 24, 9, 0.2, 2.9, 5), TP.gold, { w: 2, key: 'egs' + i, hl: false }); },
  () => { tpFill([[-6, -60], [6, -60], [6, 30], [-6, 30]], TP.greyL, { key: 'esw', couch: false, lw: 2 }); tpFill([[-30, 30], [30, 30], [30, 40], [-30, 40]], TP.goldD, { key: 'eswg', couch: false, lw: 2 }); tpFill([[-7, 40], [7, 40], [7, 66], [-7, 66]], TP.brown, { key: 'eswh', couch: false, lw: 2 }); },
  () => tpFlames(0, 50, 90, 100, 'ebf'),
  () => { tpFill([[-60, 10], [60, 10], [44, 40], [-44, 40]], TP.brown, { key: 'esh', couch: false }); tpLine(0, 10, 0, -60, TP.ink, { w: 3, key: 'esm' }); tpFill([[2, -56], [46, -20], [2, 0]], TP.blueL, { key: 'ess', couch: false, lw: 2 }); tpWaves(-70, 70, 50, 'esw', 1); },
  () => { tpFill([[-24, 50], [24, 50], [18, -40], [-18, -40]], TP.greyL, { key: 'etw', ang: 0 }); tpFlames(0, -40, 40, 50, 'etf'); for (let i = 0; i < 3; i++) tpDot(0, 30 - i * 24, 3.5, TP.ink); },
  () => { for (let i = 0; i < 3; i++) tpStem(ellipsePts(-34 + i * 34, 0, 18, 11, 0.4 * (i % 2 ? 1 : -1), 12), TP.greyL, { closed: true, w: 4, key: 'ech' + i, hl: false }); },
];
// a Bayeux-style tree: a twisted trunk and interlaced branches, between panels
function tpTree(x, key) {
  const y0 = FL, y1 = 640;
  for (const d of [-1, 1]) { const P = []; for (let i = 0; i <= 12; i++) { const u = i / 12; P.push([x + d * 10 * Math.sin(u * PI * 3), lerp(y0, y1, u)]); } tpStem(P, TP.brown, { w: 7, key: key + 'tr' + d, hl: false }); }
  for (let i = 0; i < 5; i++) { const yy = lerp(1300, 700, i / 4), sp = 60 + i * 6;
    for (const d of [-1, 1]) { const P = [[x, yy], [x + d * sp * 0.6, yy - 50], [x + d * sp, yy - 10], [x + d * sp * 0.7, yy + 30]]; tpStem(P, i % 2 ? TP.greenL : TP.green, { w: 5, key: key + 'br' + i + d, hl: false }); tpFill(ellipsePts(x + d * sp, yy - 20, 22, 14, d * 0.6, 10), i % 2 ? TP.green : TP.red, { key: key + 'lf' + i + d, couch: false, lw: 2 }); } }
  tpFill(ellipsePts(x, y1 - 10, 46, 30, 0, 14), TP.green, { key: key + 'crw', couch: false, lw: 2 });
}

// =====================================================================
//  the panels (local coords: x 0..1080)
// =====================================================================
const RH = (o) => ({ robe: TP.red, trim: TP.gold, over: TP.wine, hair: TP.silver, hairStyle: 'long', braid: true, eye: TP.blue, key: 'rh', ...o });
function pHeir() {
  tpThrone(540, FL - 40, 0.62);
  const up = fadeIn(VW('heir', 'heir') - 0.2, 0.4);
  tpFigure(290, FL, 0.92, { robe: TP.wine, over: TP.red, trim: TP.gold, cloak: TP.black, hair: TP.silver, hairStyle: 'long', beard: TP.greyL, crown: true, face: 1, key: 'vis', male: true, armR: lerp(0.12, 1.35, up), nod: true });
  tpFigure(780, FL, 0.86, RH({ face: -1, key: 'rh1' }));
  if (up > 0) { const y = lerp(560, 650, EZ.o3(up)) + 6 * Math.sin(TT * 2.4); ctx.save(); ctx.globalAlpha = up; tpFill([[730, y], [724, y - 58], [748, y - 26], [766, y - 70], [784, y - 28], [806, y - 66], [828, y - 26], [834, y - 58], [830, y]], TP.gold, { key: 'hcr', couch: false, lw: 2.2 }); for (let i = 0; i < 4; i++) star4(780 + 90 * Math.cos(TT * 2 + i * 1.6), y - 40 + 40 * Math.sin(TT * 2 + i * 1.6), 9 + 4 * Math.sin(TT * 5 + i), TP.fireL); ctx.restore(); }
}
function pSwear() {
  const turn = TT > VW('swear', 'still') - 0.2;
  tpFigure(230, FL, 0.86, { robe: TP.wine, over: TP.red, trim: TP.gold, cloak: TP.black, hair: TP.silver, hairStyle: 'long', beard: TP.greyL, crown: true, face: 1, key: 'vis2', male: true, nod: true });
  tpFigure(420, FL, 0.8, RH({ face: 1, key: 'rh2' }));
  [[620, TP.navy, TP.brown], [770, TP.green, TP.ochre], [920, TP.blue, TP.black]].forEach(([x, c, hc], i) => {
    // the lords rise from their knees and turn away, smoothly
    const u = EZ.io(clamp((TT - (VW('swear', 'still') - 0.3 + i * 0.25)) / 0.9));
    tpFigure(x, FL, 0.64, { robe: c, trim: TP.cream, hair: hc, beard: i !== 1 ? tpShade(hc, 0.1) : undefined, face: lerp(-1, 1, u), kneel: 1 - u, key: 'lord' + i, male: true,
      hold: u > 0.4 ? undefined : (hR) => { ctx.save(); ctx.globalAlpha *= 1 - u / 0.4; tpFill([[hR[0] - 6, hR[1] - 260], [hR[0] + 6, hR[1] - 260], [hR[0] + 6, hR[1]], [hR[0] - 6, hR[1]]], TP.greyL, { key: 'lsw' + i, couch: false, lw: 2, ang: 1.57 }); tpFill([[hR[0] - 24, hR[1] - 4], [hR[0] + 24, hR[1] - 4], [hR[0] + 24, hR[1] + 6], [hR[0] - 24, hR[1] + 6]], TP.goldD, { key: 'lsg' + i, couch: false, lw: 1.8 }); ctx.restore(); },
      armR: lerp(2.6, 0.14, u) });
  });
}
function pCrown() {
  // the dead king on his bier, candles; Aegon crowned on the throne; the cloth tears in two between them
  tpFill([[60, 1330], [480, 1330], [470, 1370], [70, 1370]], TP.brown, { key: 'bier', ang: 0 });
  for (const lx of [80, 460]) { tpFill([[lx - 6, 1330], [lx + 6, 1330], [lx + 6, 1440], [lx - 6, 1440]], TP.brown, { key: 'bl' + lx, couch: false, lw: 2 }); tpFill([[lx - 8, 1250], [lx + 8, 1250], [lx + 8, 1320], [lx - 8, 1320]], TP.cream, { key: 'cd' + lx, couch: false, lw: 2 }); tpFlames(lx, 1250, 30, 46 + 8 * Math.sin(TT * 9 + lx), 'cdf' + lx); }
  ctx.save(); ctx.translate(470, 1290); ctx.rotate(-PI / 2); tpFigure(0, 0, 0.55, { robe: TP.wine, trim: TP.gold, hair: TP.greyL, beard: TP.greyL, crown: true, key: 'visd', male: true, still: true }); ctx.restore();
  tpThrone(800, FL - 20, 0.7);
  tpFigure(800, FL, 0.78, { robe: TP.green, over: TP.greenL, trim: TP.gold, cloak: TP.green, hair: TP.silver, face: 0, key: 'aeg', male: true, crown: TT > VW('crown', 'crown') + 0.4, nod: true });
  if (TT > VW('crown', 'crown') - 0.4 && TT < VW('crown', 'crown') + 0.4) { const u = EZ.o2(clamp((TT - VW('crown', 'crown') + 0.4) / 0.8)), y = lerp(560, 800, u); tpFill([[752, y], [746, y - 58], [770, y - 26], [790, y - 70], [808, y - 28], [828, y - 66], [850, y - 26], [856, y - 58], [852, y]], TP.gold, { key: 'acr', couch: false, lw: 2.2 }); }
  const tear = EZ.io(clamp((TT - VW('crown', 'split') + 0.1) / 0.7));
  if (tear > 0) { const P = [], Q = []; for (let i = 0; i <= 16; i++) { const y = lerp(620, 1500, i / 16), zx = 540 + (i % 2 ? 14 : -14), wd = 16 * tear * (1 - Math.abs(i / 16 - 0.5)); P.push([zx - wd, y]); Q.push([zx + wd, y]); } const T = [...P, ...Q.reverse()]; tpFill(T, '#3b2d27', { key: 'tear', couch: false, lw: 2.4, lc: TP.red }); }
}
function pSides() {
  const bA = fadeIn(VW('sides', 'blacks') - 0.2, 0.3), gA = fadeIn(VW('sides', 'greens') - 0.2, 0.3);
  ctx.save(); ctx.globalAlpha = Math.max(0.25, bA);
  tpBanner(90, FL - 300, TP.black, () => tpSigil(TP.red, 0.7), 'bb1', 0.9); tpBanner(420, FL - 320, TP.black, () => tpSigil(TP.red, 0.7), 'bb2', 0.9);
  ctx.restore();
  ctx.save(); ctx.globalAlpha = Math.max(0.25, gA);
  tpBanner(600, FL - 320, TP.green, () => tpSigil(TP.gold, 0.7), 'gb1', 0.9); tpBanner(930, FL - 300, TP.green, () => tpSigil(TP.gold, 0.7), 'gb2', 0.9);
  ctx.restore();
  tpFigure(260, FL, 0.82, RH({ robe: TP.black, over: TP.wine, trim: TP.red, cloak: TP.black, face: 1, key: 'rh3' }));
  tpFigure(820, FL, 0.82, { robe: TP.green, over: TP.greenL, trim: TP.gold, cloak: TP.green, hair: TP.silver, crown: true, face: -1, key: 'aeg2', male: true, nod: true });
  if (bA > 0) tpText('THE BLACKS', 300, 700, 40, TP.black, { reveal: bA });
  if (gA > 0) tpText('THE GREENS', 780, 700, 40, TP.green, { reveal: gA });
}
function pSons() {
  tpWaves(-40, 1120, 1380, 'sw', 2);
  tpCastle(230, 1370, 0.8, { c: TP.black, c2: TP.grey, banner: TP.black });
  const u = shotU('sons');
  tpDragon(lerp(300, 600, u), lerp(1060, 760, u), 0.62, 1, { c: TP.greenL, cw: TP.green, key: 'vermax', ph: TT * 5, rider: { robe: TP.black, trim: TP.red, hair: TP.brown, male: true } });
  tpDragon(lerp(180, 520, u), lerp(1240, 1000, u), 0.5, 1, { c: TP.white, cw: TP.blueL, key: 'arrax', ph: TT * 6 + 1, horn: TP.goldD, rider: { robe: TP.black, trim: TP.red, hair: TP.brown, male: true } });
}
function pChase() {
  for (let i = 0; i < 5; i++) tpCloud(-60 + i * 280 + 10 * Math.sin(TT * 0.6 + i), 760 + (i % 2) * 40, 0.8, i % 2 ? TP.grey : TP.greyL, 'chc' + i);
  tpRain(-40, 1120, 760, 1440, 'chr', 70);
  const fl = mod(TT, 2.7) < 0.12 ? 1 : 0; tpBolt(820, 760, 420, fl, 'chb' + Math.floor(TT / 2.7));
  const u = shotU('chase');
  tpDragon(lerp(560, 820, u), 1000 + 30 * Math.sin(TT * 2), 0.32, 1, { c: TP.white, cw: TP.blueL, key: 'arrax2', ph: TT * 7, horn: TP.goldD, rider: { robe: TP.black, trim: TP.red, hair: TP.brown, male: true } });
  const vx = lerp(-360, 180, EZ.io(u));
  tpDragon(vx, 1220, 0.95, 1, { c: '#7d6f43', cw: '#5a5233', key: 'vhagar', ph: TT * 2.6, horn: TP.cream, spike: TP.greyL, jaw: 0.4 + 0.3 * Math.sin(TT * 3), rider: { robe: TP.green, trim: TP.gold, hair: TP.silver, patch: true, patchSide: 1, male: true } });
  ctx.save(); ctx.globalAlpha = fadeIn(VW('chase', 'lucerys') - 0.1, 0.3); tpText('LUCERYS', lerp(560, 820, u) + 70, 880, 34, TP.navy); ctx.restore();
  ctx.save(); ctx.globalAlpha = fadeIn(VW('chase', 'vhagar') - 0.1, 0.3); tpText('VHAGAR', vx + 200, 1000, 38, TP.wine); ctx.restore();
}
function pFell() {
  tpWaves(-40, 1120, 1360, 'fw', 3);
  const tB = VW('fell', 'fell') - 0.15, bite = clamp((TT - tB) / 0.25), jaw = TT < tB ? 1 : 1 - bite;
  tpDragon(-60, 1080, 1.0, 1, { c: '#7d6f43', cw: '#5a5233', key: 'vhagar2', ph: TT * 2.4, horn: TP.cream, spike: TP.greyL, jaw, rider: { robe: TP.green, trim: TP.gold, hair: TP.silver, patch: true, patchSide: 1, male: true } });
  const f = EZ.i2(clamp((TT - tB) / 1.8));
  tpDragon(lerp(600, 760, f), lerp(860, 1340, f), 0.32, 1, { c: TP.white, cw: TP.blueL, key: 'arrax3', ph: TT * 3, horn: TP.goldD, rot: f * 2.6 });
  if (TT > tB) { ctx.save(); ctx.translate(lerp(640, 900, f), lerp(900, 1400, f)); ctx.rotate(f * 4); tpFigure(0, 0, 0.3, { robe: TP.black, trim: TP.red, hair: TP.brown, key: 'luke', still: true, male: true }); ctx.restore(); }
  if (bite > 0) for (let i = 0; i < 7; i++) { const R = RNG('bld', i), u = clamp((TT - tB) / 0.9); if (u >= 1) continue; const a = R.r(-1, 1), L = 40 + u * 120; tpLine(560, 900, 560 + Math.cos(a) * L, 900 + Math.sin(a) * L + u * 60, TP.red, { w: 4, key: 'bl' + i, hl: false }); }
}
function pGrief() {
  const u = shotU('grief');
  [[170, 0], [540, 0.4], [910, 0.8]].forEach(([x, d], i) => { const b = clamp((TT - SUB('grief') - d) / 1.5); tpCastle(x, FL, 0.5, { c: TP.grey, c2: TP.greyL, banner: [TP.black, TP.green, TP.black][i], burn: b }); if (b > 0.3) { const v = mod(TT * 0.2 + i * 0.3, 1); ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * v); tpCloud(x + 30 + v * 50, 1060 - v * 220, 0.35 + v * 0.2, TP.grey, 'gsm' + i); ctx.restore(); } });
  const tD = VW('grief', 'dragons') - 0.2;
  [[300, TP.red, 0], [780, TP.ochre, 0.4]].forEach(([x, c, d], i) => { const f = EZ.i2(clamp((TT - tD - d) / 2.2)); if (TT < tD + d) return; tpDragon(x + f * 40, lerp(640, 1180, f), 0.3, i ? -1 : 1, { c, key: 'fd' + i, ph: TT * 2, rot: f * 2.2 * (i ? -1 : 1), rider: { robe: i ? TP.green : TP.black, trim: TP.gold, hair: TP.silver } }); });
}
function pVengeance() {
  const tF = VW('vengeance', 'fire') - 0.2, fire = clamp((TT - tF) / 0.4) * (0.85 + 0.15 * Math.sin(TT * 12));
  tpDragon(900, 940, 0.8, -1, { c: TP.ochre, cw: TP.goldD, key: 'syrax', ph: TT * 3, horn: TP.cream, fire: TT > tF ? fire : 0 });
  tpFigure(380, FL, 0.92, RH({ robe: TP.black, trim: TP.red, face: 1, key: 'rh4', armR: lerp(0.12, 2.2, fadeIn(VW('vengeance', 'vengeance') - 0.1, 0.4)) }));
  if (TT > tF) tpFlames(200, FL, 360, 160 * fire, 'vfl');
}
function pLost() {
  tpWaves(500, 1120, 1300, 'lw', 3);
  tpFill([[-40, 1440], [620, 1440], [560, 1320], [-40, 1340]], TP.ochre, { key: 'shore', ang: 0.1 });
  tpFill([[680, 1360], [760, 1300], [880, 1290], [960, 1320], [900, 1350], [800, 1370]], TP.white, { key: 'wing', ang: 0.2 }); for (let i = 0; i < 3; i++) tpLine(680, 1360, 800 + i * 60, 1300 + i * 8, TP.ink, { w: 3, key: 'wb' + i, hl: false });
  tpFigure(320, FL, 0.9, RH({ robe: TP.black, trim: TP.red, face: 1, kneel: true, sad: true, key: 'rh5' }));
  for (let i = 0; i < 3; i++) { const bx = 700 + i * 90 + TT * 12, by = 760 + 10 * Math.sin(TT * 2 + i); tpStem([[bx - 18, by], [bx, by + 8], [bx + 18, by]], TP.ink2, { w: 3, key: 'gl' + i, hl: false }); }
}
function pCost() {
  const b = clamp((TT - HIT) / 1.2);
  tpDragon(150, 820 + 20 * Math.sin(TT * 2), 0.5, 1, { c: '#7d6f43', cw: '#5a5233', key: 'vh3', ph: TT * 3, horn: TP.cream, spike: TP.greyL, fire: b * (0.7 + 0.3 * Math.sin(TT * 9)) * 0.6, rider: { robe: TP.green, trim: TP.gold, hair: TP.silver, patch: true, patchSide: 1, male: true } });
  tpDragon(930, 880 + 20 * Math.sin(TT * 2.3 + 1), 0.5, -1, { c: TP.red, cw: TP.redD, key: 'carax', ph: TT * 3.4, fire: b * (0.7 + 0.3 * Math.sin(TT * 10)) * 0.6, rider: { robe: TP.black, trim: TP.red, hair: TP.silver } });
  tpThrone(540, FL - 10, 0.95);
  tpFlames(540, FL, 1100, 300 * b, 'cfl');
}
function pSign() {
  const k = springMove(SIGN_T, 0, 1, SPRING.heavy), sz = 440 * k, bob = 8 * Math.sin((TT - SIGN_T) * 1.6);
  if (sz > 1) { ctx.save(); ctx.globalAlpha = clamp(k * 1.5); ctx.translate(540, 720 + bob); drawAsset('apple.png', -sz / 2, -sz / 2, sz, sz, { fit: 'contain' }); ctx.restore(); }
  ctx.save(); ctx.globalAlpha = EZ.o2(clamp((TT - SIGN_T - 0.4) / 0.8)); tpLogo('AMPHORUS', 520, 1040, 80, SIGN_T); ctx.restore();
}
const PANELS = [pHeir, pSwear, pCrown, pSides, pSons, pChase, pFell, pGrief, pVengeance, pLost, pCost, pSign];

function sceneStage() {
  const p = stripPos(), off = p * W;
  tpLinen(off);
  tpBand(off, 58, 268, EMB, 'top');
  tpBand(off + 105, 1652, 1862, EMB.slice().reverse(), 'bot');
  const i0 = Math.floor(p), i1 = Math.min(PANELS.length - 1, i0 + 1);
  for (const i of i0 === i1 ? [i0] : [i0, i1]) {
    // the picture is scaled up into the tall band (feet at y 1600); the caption sits at the top of the band
    ctx.save(); ctx.setTransform(1, 0, 0, 1, i * W - off, 0); ctx.beginPath(); ctx.rect(0, 278, W, 1366); ctx.clip();
    ctx.setTransform(PZ, 0, 0, PZ, i * W - off + 540 * (1 - PZ), 1600 - FL * PZ);
    PANELS[i]();
    ctx.setTransform(1, 0, 0, 1, i * W - off, 0); panelCaption(i);
    ctx.restore();
  }
  // the dividing trees sit on the seams between panels
  for (let i = 1; i < PANELS.length; i++) { const x = i * W - off; if (x > -200 && x < W + 200) { ctx.save(); ctx.setTransform(PZ, 0, 0, PZ, x, 1600 - FL * PZ); tpTree(0, 'tree' + i); ctx.restore(); } }
}
