// =====================================================================
//  S2 — the exact curve, 100,000 rooms, the pitch, the comments; the stage, the camera, the sound cues
// =====================================================================
const GR = { x0: 150, x1: 930, y0: 1180, y1: 560, nMax: 80 };
const grXY = (n, p) => [lerp(GR.x0, GR.x1, n / GR.nMax), lerp(GR.y0, GR.y1, p)];

function beatCurve() {
  const a = win(B0('odds') + 0.1, B0('sim') + 0.4, 0.5); if (a <= 0) return;
  const draw = EZ.io(seg(TT, VW('odds', 'shoot') - 0.3, VW('odds', 'twentythree') + 0.2));
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = BP.dim; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(GR.x0, GR.y1 - 30); ctx.lineTo(GR.x0, GR.y0); ctx.lineTo(GR.x1 + 20, GR.y0); ctx.stroke();
  ctx.setLineDash([10, 12]); const [, y50] = grXY(0, 0.5); ctx.beginPath(); ctx.moveTo(GR.x0, y50); ctx.lineTo(GR.x1, y50); ctx.stroke(); ctx.restore();
  bpText('50%', GR.x0 - 16, y50 + 12, 34, BP.soft, { font: BP.mono, align: 'right', alpha: a });
  bpText('people in the room', (GR.x0 + GR.x1) / 2, GR.y0 + 70, 36, BP.soft, { font: BP.mono, alpha: a });
  [0, 40, 80].forEach((n) => bpText(String(n), grXY(n, 0)[0], GR.y0 + 34, 28, BP.dim, { font: BP.mono, alpha: a }));
  // the exact curve, drawn in
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = BP.mint; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath();
  const nTo = GR.nMax * draw; for (let n = 1; n <= nTo; n += 0.5) { const [x, y] = grXY(n, BD.pExact(Math.floor(n))); n === 1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.stroke(); ctx.restore();
  // your-birthday curve, faint, for contrast
  ctx.save(); ctx.globalAlpha = a * 0.6 * draw; ctx.strokeStyle = BP.yellow; ctx.lineWidth = 3; ctx.setLineDash([8, 10]); ctx.beginPath();
  for (let n = 1; n <= GR.nMax; n++) { const [x, y] = grXY(n, BD.pMine(n)); n === 1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ctx.restore();
  if (draw > 0.6) bpText('your birthday', grXY(78, BD.pMine(78))[0], grXY(78, BD.pMine(78))[1] - 20, 30, BP.yellow, { font: BP.mono, align: 'right', alpha: a * 0.8 });
  // the two marks: 23 -> 50.7%, 70 -> 99.9%
  [[23, VW('odds', 'twentythree'), '50.7%'], [70, VW('odds', 'seventy'), '99.9%']].forEach(([n, t, lab]) => {
    const u = EZ.back(seg(TT, t - 0.1, t + 0.25)); if (u <= 0) return;
    const [x, y] = grXY(n, BD.pExact(n)); line(x, GR.y0, x, y, BP.mint, 2, a * 0.6);
    bpGlow(x, y, 50, BP.magenta, a * 0.5); bpDot(x, y, 14 * u, BP.magenta, a);
    OV(() => { bpPill(lab, x + (n === 70 ? -40 : 0), y - 60, 40, BP.magenta, a * clamp(u)); bpText(String(n), x, GR.y0 + 34, 30, BP.magenta, { font: BP.mono, weight: 700, alpha: a }); });
  });
  const r0 = VW('odds', 'twentythree') + 0.7, ra = fadeIn(r0, 0.3) * fadeOut(VW('odds', 'seventy') - 0.3, 0.2) + fadeIn(VW('odds', 'seventy') + 0.8, 0.3);
  if (ra > 0) { const n = 2 + Math.floor(mod((TT - r0) * 9, 78)), [x, y] = grXY(n, BD.pExact(n));
    bpGlow(x, y, 36, BP.mint, a * ra * 0.6); bpDot(x, y, 10, '#ffffff', a * ra);
    OV(() => bpText(`${n} people → ${(BD.pExact(n) * 100).toFixed(1)}%`, 540, 1420, 50, BP.mint, { font: BP.mono, weight: 700, alpha: a * ra })); }
  caption([{ t: 'the odds shoot up', c: BP.mint, i: true }], win(VW('odds', 'shoot') - 0.2, VW('odds', 'twentythree') - 0.2), 400, 74);
}

// 100,000 rooms: one square per 50 rooms (2,000 squares); a square is magenta when most of its rooms had a match
function beatSim() {
  const a = win(B0('sim') + 0.1, B0('match') + 0.4, 0.5); if (a <= 0) return;
  const run = EZ.io(seg(TT, VW('sim', 'filled') - 0.2, VW('sim', 'half') + 0.2)), done = Math.round(BD.N * run);
  const cols = 40, rows = 44, cw = 21, x0 = 540 - cols * cw / 2, y0 = 470, per = BD.N / (cols * rows);
  ctx.save();
  for (let k = 0; k < cols * rows; k++) {
    const i0 = Math.floor(k * per), i1 = Math.floor((k + 1) * per); if (i0 >= done) break;
    let h = 0; for (let i = i0; i < i1; i++) h += BD.hit[i];
    const x = x0 + (k % cols) * cw, y = y0 + Math.floor(k / cols) * cw, fresh = clamp((done - i0) / 3000);
    ctx.globalAlpha = a * (0.35 + 0.65 * fresh); ctx.fillStyle = h > (i1 - i0) / 2 ? BP.magenta : bpMix(BP.mint, BP.ground, 0.55);
    ctx.fillRect(x, y, cw - 4, cw - 4);
  }
  ctx.restore();
  const hits = Math.round(BD.CUM[Math.min(100, Math.floor(done / 1000))] + (done % 1000) * 0.5068);
  OV(() => {
    bpText(`${commas(done)} rooms`, 540, 1600 - 140, 52, BP.soft, { font: BP.mono, alpha: a });
    const fin = done >= BD.N;
    bpText(`${commas(fin ? BD.hits : Math.min(hits, BD.hits))} with a match`, 540, 1600 - 70, 60, BP.magenta, { font: BP.mono, weight: 700, alpha: a });
    if (fin) bpText(`${(BD.hits / BD.N * 100).toFixed(1)}%`, 540, 400, 120, BP.magenta, { font: BP.mono, weight: 700, alpha: a * fadeIn(VW('sim', 'half') - 0.1, 0.3), glow: 24 });
  });
  caption([{ t: '23 people per room', c: BP.soft }], win(VW('sim', 'filled'), VW('sim', 'half') - 0.4), 400, 54, { font: BP.mono });
}

// the pitch: 22 players and a referee
const PITCH = { cx: 540, cy: 900, w: 640, h: 960 };
const PLAYERS = (() => { const R = RNG('pl'), P = []; for (let i = 0; i < 22; i++) { const top = i < 11; P.push({ x: R.r(-0.42, 0.42), y: (top ? -1 : 1) * R.r(0.08, 0.46), team: top ? 0 : 1 }); } P.push({ x: 0.08, y: 0.02, team: 2 }); return P; })();
const PMATCH = [4, 17];   // two players to light (one per team), as in "two people on the pitch"
function beatPitch() {
  const a = win(B0('match') + 0.1, B0('test') + 0.4, 0.5); if (a <= 0) return;
  const { cx, cy, w, h } = PITCH, draw = EZ.io(seg(TT, B0('match') + 0.1, B0('match') + 0.9));
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = bpMix(BP.mint, BP.ground, 0.4); ctx.lineWidth = 4;
  trace(rrectPts(cx - w / 2, cy - h / 2, w, h * draw, 10, 4), true); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - w / 2, cy); ctx.lineTo(cx + w / 2, cy); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, 90, 0, TAU * draw); ctx.stroke();
  [-1, 1].forEach((s) => { ctx.strokeRect(cx - 160, s < 0 ? cy - h / 2 : cy + h / 2 - 150, 320, 150); ctx.strokeRect(cx - 70, s < 0 ? cy - h / 2 : cy + h / 2 - 55, 140, 55); });
  ctx.restore();
  const pm = fadeIn(VW('pitch', 'two') - 0.1, 0.3);
  PLAYERS.forEach((p, i) => {
    const s = EZ.back(seg(TT, VW('match', 'players') - 0.2 + i * 0.04, VW('match', 'players') + 0.1 + i * 0.04)); if (s <= 0) return;
    const x = cx + p.x * w + Math.sin(TT * 0.9 + i) * 8, y = cy + p.y * h + Math.cos(TT * 0.7 + i * 1.3) * 8;
    let c = p.team === 0 ? BP.mint : p.team === 1 ? BP.azure : BP.yellow;
    if (pm > 0 && PMATCH.includes(i)) c = bpMix(c, BP.magenta, pm);
    bpGlow(x, y, 40, c, a * 0.35); bpDot(x, y, 15 * s, c, a);
    if (p.team === 2) OV(() => bpText('referee', x, y + 48, 30, BP.yellow, { font: BP.mono, alpha: a * fadeIn(VW('match', 'referee') - 0.1, 0.3) }));
  });
  { const k = Math.floor((TT - B0('match')) / 0.7), u = EZ.io(mod((TT - B0('match')) / 0.7, 1)), A = PLAYERS[(k * 5) % 22], Bp = PLAYERS[((k + 1) * 5) % 22];
    const bx = cx + lerp(A.x, Bp.x, u) * w, by = cy + lerp(A.y, Bp.y, u) * h; if (TT > VW('match', 'players')) { bpGlow(bx, by, 30, '#ffffff', a * 0.5); bpDot(bx, by, 9, '#ffffff', a); } }
  if (pm > 0) { const P = PMATCH.map((i) => [cx + PLAYERS[i].x * w + Math.sin(TT * 0.9 + i) * 8, cy + PLAYERS[i].y * h + Math.cos(TT * 0.7 + i * 1.3) * 8]);
    const u = EZ.io(seg(TT, VW('pitch', 'two'), VW('pitch', 'two') + 0.5)); line(P[0][0], P[0][1], lerp(P[0][0], P[1][0], u), lerp(P[0][1], P[1][1], u), BP.magenta, 5, a * pm); }
  OV(() => {
    const ca = win(VW('match', 'twentythree') - 0.2, B0('test'), 0.3) * a;
    bpText('22 + 1 = 23', 540, 360, 92, BP.mint, { font: BP.mono, weight: 700, alpha: ca, glow: 16 });
    const ha = win(VW('pitch', 'half') - 0.2, B0('test'), 0.3) * a;
    bpText('≈ half of all matches', 540, 1500, 58, BP.magenta, { italic: true, alpha: ha });
  });
}

// the comments: birthdays arriving; two match
const COMMENTS = [['@lena_k', '3 Feb'], ['@marco.v', '14 Mar'], ['@yuki', '27 Aug'], ['@dev_ana', '9 Nov'], ['@tomas', '14 Mar'], ['@riya', '30 Jun'], ['@noah', '21 Dec'], ['@sofi.m', '2 Aug'], ['@kenji', '19 Apr'], ['@amara', '7 Oct'], ['@luis_r', '11 Jan'], ['@ines', '25 May'], ['@pablo', '16 Sep']];
function beatComments() {
  const a = win(B0('test') + 0.1, DURATION + 1, 0.5); if (a <= 0) return;
  const t0 = VW('test', 'write') - 0.2, x0 = 210, y0 = 560, gh = 112;
  OV(() => bpText('write your birthday ↓', 540, 440, 58, BP.mint, { font: BP.mono, weight: 700, alpha: a * fadeIn(t0, 0.3) }));
  COMMENTS.forEach(([u, d], i) => {
    const s = EZ.back(seg(TT, t0 + 0.3 + i * 0.45, t0 + 0.6 + i * 0.45)); if (s <= 0) return;
    const scroll = Math.min(gh * 0.9, gh * Math.max(0, (TT - (t0 + 0.3 + 6 * 0.45)) / 0.45)), y = y0 + i * gh + (1 - s) * 40 - scroll, vis = clamp((y - 470) / 80) * clamp((1330 - y) / 80); if (vis <= 0) return;
    const isM = d === '14 Mar', hm = isM ? fadeIn(VW('end', 'match') - 0.1, 0.3) : 0;
    ctx.save(); ctx.globalAlpha = a * clamp(s) * vis; trace(rrectPts(x0, y - 40, 660, 84, 18, 6), true); ctx.fillStyle = BP.panel; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = bpMix(BP.line, BP.magenta, hm); ctx.stroke(); ctx.restore();
    bpDot(x0 + 44, y + 2, 12, bpMix(BP.azure, BP.magenta, hm), a * s * vis);
    OV(() => { bpText(u, x0 + 80, y + 14, 36, BP.soft, { font: BP.mono, align: 'left', alpha: a * s * vis }); bpText(d, x0 + 620, y + 14, 40, bpMix(BP.text, BP.magenta, hm), { font: BP.mono, weight: 700, align: 'right', alpha: a * s * vis }); });
  });
  const hm = fadeIn(VW('end', 'match') - 0.1, 0.3);
  if (hm > 0) { const sc = Math.min(gh * 0.9, gh * Math.max(0, (TT - (t0 + 0.3 + 6 * 0.45)) / 0.45)), ya = y0 + 1 * gh + 2 - sc, yb = y0 + 4 * gh + 2 - sc, u = EZ.io(seg(TT, VW('end', 'match') - 0.1, VW('end', 'match') + 0.4));
    ctx.save(); ctx.globalAlpha = a * hm; ctx.strokeStyle = BP.magenta; ctx.lineWidth = 5 + 2 * Math.sin(TT * 5); ctx.shadowColor = BP.magenta; ctx.shadowBlur = 14 + 8 * Math.sin(TT * 5); ctx.beginPath(); ctx.moveTo(x0 + 6, ya); ctx.bezierCurveTo(x0 - 60, ya, x0 - 60, lerp(ya, yb, u), x0 + 6, lerp(ya, yb, u)); ctx.stroke(); ctx.restore(); }
  const ty = fadeIn(VW('end', 'with') - 0.2, 0.3) * a;   // someone is typing...
  if (ty > 0) { for (let k = 0; k < 3; k++) bpDot(500 + k * 40, 1330 - Math.max(0, Math.sin(TT * 7 - k * 0.9)) * 14, 9, BP.soft, ty * 0.9);
    OV(() => bpText(`${commas(1200 + Math.floor((TT - VW('end', 'with')) * 37))} comments`, 540, 1290, 30, BP.dim, { font: BP.mono, alpha: ty })); }
  OV(() => bpText('? pairs', 540, 1420, 78, BP.magenta, { font: BP.mono, weight: 700, alpha: a * fadeIn(VW('end', 'pairs') - 0.1, 0.3) * fadeOut(VL('end').t1 + 0.1, 0.3) }));
  // the signature
  const tS = VL('end').t1 + 0.1, sa = fadeIn(tS, 0.2);
  if (sa > 0) OV(() => {
    ctx.save(); ctx.font = `700 72px ${BP.mono}`; const w1 = ctx.measureText('Bit').width, w = ctx.measureText('Bitstory').width; ctx.restore();
    const n = Math.round(8 * seg(TT, tS, tS + 0.6)), xs = 540 - w / 2;
    bpText('Bit'.slice(0, n), xs, 1482, 72, BP.mint, { font: BP.mono, weight: 700, align: 'left', alpha: sa, glow: 18 });
    if (n > 3) bpText('story'.slice(0, n - 3), xs + w1, 1482, 72, BP.magenta, { font: BP.mono, weight: 700, align: 'left', alpha: sa, glow: 18 });
    if (n < 8 || Math.floor(TT * 2.5) % 2) { ctx.save(); ctx.globalAlpha = sa; ctx.fillStyle = BP.text; ctx.font = `700 72px ${BP.mono}`; const cw = ctx.measureText('Bitstory'.slice(0, n)).width; ctx.fillRect(xs + cw + 6, 1426, 30, 64); ctx.restore(); }
  });
}

// =====================================================================
//  the stage, the camera, the sound cues
// =====================================================================
function sceneStage() {
  bpGround();
  for (let i = 0; i < 26; i++) { const R = RNG('mote', i), x = mod(R.r(0, W) + TT * R.r(-8, 8), W), y = mod(R.r(0, H) - TT * R.r(4, 14), H); bpDot(x, y, R.r(1.5, 3), BP.dim, 0.35 + 0.25 * Math.sin(TT * R.r(0.5, 1.5) + i)); }
  beatRoom(); beatCurve(); beatSim(); beatPitch(); beatComments();
  const fl = 1 - seg(TT, HIT, HIT + 0.3);
  if (fl > 0 && fl < 1) OV(() => { ctx.save(); ctx.globalAlpha = 0.5 * fl * fl; ctx.fillStyle = BP.mint; ctx.fillRect(-100, 0, W + 200, H); ctx.restore(); });
}
function pieceCam(era, t) {
  const slow = 1 + 0.06 * EZ.io(seg(t, 0, B0('impossible'))) * (1 - seg(t, B0('impossible'), B0('impossible') + 0.6))
    + 0.08 * EZ.io(seg(t, VW('grow', 'twentythree') - 0.2, HIT)) * (1 - seg(t, HIT, HIT + 0.25)) + 0.05 * EZ.io(seg(t, B0('match'), B0('test'))) * (1 - seg(t, B0('test'), B0('test') + 0.5))
    + 0.1 * EZ.io(seg(t, B0('odds') + 0.5, B0('sim'))) * (1 - seg(t, B0('sim'), B0('sim') + 0.5));
  const z = slow * (1 + 0.01 * Math.sin(t * 0.4));
  return camOf({ z, p: [540, 900], to: [540 + SHIFT, 900] });
}
window.SFX_CUES = (() => {
  const C = [], add = (id, t, pan = 0) => C.push({ id, t: +t.toFixed(3), pan });
  for (let i = 0; i < 23; i++) add('dot', 0.25 + i * 0.07, Math.cos(-Math.PI / 2 + i / 23 * TAU) * 0.5);
  add('hint', VW('likely', 'share') - 0.1);
  add('strike', VW('again', 'not') + 0.2); add('pulse', VW('again', 'twentythree', 2));
  add('fly', VW('impossible', 'year') - 0.1); add('fly', T_BACK);
  add('no', VW('gut', 'wrong') - 0.1);
  add('you', VW('mine', 'someone') - 0.1); add('six', VW('mine', 'six') - 0.1);
  add('line', VW('pairs', 'pairs')); add('line', VW('grow', 'one'));
  add('ten', VW('grow', 'ten')); add('build', VW('grow', 'twentythree') || VW('grow', 'twenty'));
  add('hit', HIT); add('collide', VW('chances', 'collide') - 0.2);
  add('curve', VW('odds', 'shoot') - 0.3); add('mark', VW('odds', 'twentythree')); add('mark', VW('odds', 'seventy'));
  add('rain', VW('sim', 'filled') - 0.2); add('result', VW('sim', 'half') - 0.1);
  add('whistle', VW('match', 'referee') - 0.1); add('players', VW('match', 'players') - 0.2); add('two', VW('pitch', 'two'));
  for (let i = 0; i < COMMENTS.length; i++) add('card', VW('test', 'write') + 0.1 + i * 0.45, 0.1);
  add('match2', VW('end', 'match') - 0.1);
  const tS = VL('end').t1 + 0.1; for (let i = 0; i < 8; i++) add('key' + i, tS + (i + 0.5) * 0.6 / 8, -0.2 + i * 0.05);
  return C.sort((a, b) => a.t - b.t);
})();
