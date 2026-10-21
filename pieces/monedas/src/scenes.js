// =====================================================================
//  the coins — gold discs on a tilted table (plane y squashed by KY), a magenta arrow on the rolling one
// =====================================================================
const CR = 120, FY = 930;                                   // coin radius, the still coin's centre on screen
const KY_NOW = () => springTrack([[0, 0.58], [S('fav') + 0.2, 1], [S('daily'), 1], [S('pocket'), 0.58]], SPRING.smooth);
let KY = 0.58;
const scr = (x, y, cy = FY) => [540 + x, cy + y * KY];
function coin(px, py, phi, o = {}) {
  const a = o.a ?? 1; if (a <= 0) return;
  const r = o.r ?? CR, [cx, cy] = scr(px, py, o.cy), ry = r * KY, th = (o.thick ?? 16) * (1 - KY) * 2.2 + 3;
  ctx.save(); ctx.globalAlpha *= a;
  // a soft shadow on the table, the side band with reeding, the face
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(cx + 10, cy + th + 12, r * 1.02, ry * 1.02, 0, 0, TAU); ctx.fill();
  if (th > 3.5) {
    ctx.fillStyle = '#8a5a0e'; ctx.beginPath(); ctx.ellipse(cx, cy + th, r, ry, 0, 0, Math.PI); ctx.lineTo(cx - r, cy); ctx.ellipse(cx, cy, r, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,214,120,0.35)'; ctx.lineWidth = 1.5;
    for (let k = 0; k < 48; k++) { const u = Math.PI * (k + 0.5) / 48, x = cx + r * Math.cos(u), y = cy + ry * Math.sin(u); ctx.beginPath(); ctx.moveTo(x, y + 1); ctx.lineTo(x, y + th - 1); ctx.stroke(); }
  }
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - ry * 0.45, r * 0.05, cx, cy, r * 1.05);
  g.addColorStop(0, '#fff0a8'); g.addColorStop(0.35, '#ffd04a'); g.addColorStop(0.8, '#e2a024'); g.addColorStop(1, '#a8700f');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, r, ry, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#b07812'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.86, ry * 0.86, 0, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,245,200,0.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx, cy - 1.5, r * 0.83, ry * 0.83, 0, Math.PI, TAU); ctx.stroke();
  // the engraving turns with the coin: a ring of dots and a small star
  const P = (ang, d) => [cx + Math.cos(ang) * d * r, cy + Math.sin(ang) * d * ry];
  ctx.fillStyle = 'rgba(150,95,10,0.55)';
  for (let k = 0; k < 24; k++) { const [x, y] = P(phi + TAU * k / 24, 0.74); ctx.beginPath(); ctx.ellipse(x, y, 3, 3 * KY, 0, 0, TAU); ctx.fill(); }
  if (!o.arrow) { const S5 = []; for (let k = 0; k < 10; k++) S5.push(P(phi + Math.PI * k / 5, k % 2 ? 0.16 : 0.38)); ctx.beginPath(); S5.forEach(([x, y], n) => (n ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = 'rgba(150,95,10,0.5)'; ctx.fill(); }
  // a light sweep that follows the turn
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, r, ry, 0, 0, TAU); ctx.clip();
  const sw = P(phi + 2.4, 0.5), sg = ctx.createRadialGradient(sw[0], sw[1], 0, sw[0], sw[1], r * 0.7); sg.addColorStop(0, 'rgba(255,255,230,0.28)'); sg.addColorStop(1, 'rgba(255,255,230,0)');
  ctx.fillStyle = sg; ctx.fillRect(cx - r, cy - ry, 2 * r, 2 * ry); ctx.restore();
  { const u = mod(TT / 2.6 + (o.r ?? CR) * 0.001 + px * 0.0007, 1) * 3 - 1; if (u > -0.4 && u < 1.4) { ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, r, ry, 0, 0, TAU); ctx.clip();
    const lx = cx - r + 2 * r * u, lg = ctx.createLinearGradient(lx - r * 0.35, 0, lx + r * 0.35, 0); lg.addColorStop(0, 'rgba(255,255,240,0)'); lg.addColorStop(0.5, 'rgba(255,255,240,0.35)'); lg.addColorStop(1, 'rgba(255,255,240,0)');
    ctx.fillStyle = lg; ctx.fillRect(cx - r, cy - ry, 2 * r, 2 * ry); ctx.restore(); } }
  if (o.hl) { ctx.save(); ctx.strokeStyle = o.hl; ctx.lineWidth = 5; ctx.shadowColor = o.hl; ctx.shadowBlur = 18; ctx.globalAlpha *= o.hlA ?? 1; ctx.beginPath(); ctx.ellipse(cx, cy, r, ry, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
  ctx.restore();
  if (o.arrow) {
    const t0 = P(phi + Math.PI, 0.5), t1 = P(phi, 0.62), sz = r * 0.2;
    ctx.save(); ctx.globalAlpha *= a; ctx.shadowColor = MAG; ctx.shadowBlur = 12;
    vaArrow(t0[0], t0[1], t1[0], t1[1], MAG, Math.max(4, r * 0.075), 1, sz);
    ctx.restore();
  }
  if (o.center) { vaDot(cx, cy, 7 + 3 * Math.sin(TT * 6), AMB, o.center * a); const q = mod(TT * 1.3, 1); vaRing(cx, cy, 10 + 50 * q, AMB, 3, o.center * a * (1 - q)); }
}
// the rolling coin's place: centre at 2r from the still one, angle th; it has turned 2·(th − θ0) (equal coins)
const TH0 = Math.PI / 2, PHI0 = -Math.PI / 2;
const rollSeg = () => [   // [t0, t1, turns of the centre round the still coin] — negative = anticlockwise on screen
  [VW('rolls', 'rolls') - 0.1, VW('rolls', 'started') + 0.3, -1],
  [HIT + 0.08, HIT + 1.5, -1],
  [VW('half', 'halfway') - 0.2, VW('half', 'pointing') + 0.1, -0.5],
  [VW('full', 'one') - 0.1, VW('full', 'two') + 0.05, -0.5],
  [S('radii') + 0.2, VW('circle', 'twice') + 0.2, -1],
  [VW('try', 'roll') - 0.2, VW('try', 'turns') + 0.3, -1],
  [S('comments') + 0.2, VL('comments').t1 + 1.5, -0.6],
];
function rollTheta() { let th = TH0; for (const [t0, t1, n] of rollSeg()) th += TAU * n * EZ.io(clamp((TT - t0) / (t1 - t0))); return th; }
function pairOfCoins(a, o = {}) {
  if (a <= 0) return;
  const th = rollTheta(), phi = PHI0 + 2 * (th - TH0), mx = 2 * CR * Math.cos(th), my = 2 * CR * Math.sin(th);
  const drawM = () => coin(mx, my, phi, { a, arrow: true, center: o.center, hl: o.hlM, hlA: o.hlMA });
  if (my < 0) drawM();
  coin(0, 0, TT * 0, { a: a * (o.stillA ?? 1), hl: o.hlS, hlA: o.hlSA });
  if (my >= 0) drawM();
  return { th, phi, mx, my };
}
// the counter chip: "1 turn" / "2 turns"
function chip(n, y, a, c, sub) {
  if (a <= 0) return;
  OV(() => {
    const word = n === 1 ? 'turn' : 'turns', s = 1 + 0.18 * flashK(HIT, 0.4) * (n === 2 ? 1 : 0);
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(10,24,36,0.92)'; ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.shadowColor = c; ctx.shadowBlur = n === 2 ? 18 : 0;
    ctx.beginPath(); ctx.roundRect(CXT - 130 * s, y - 62 * s, 260 * s, 92 * s, 16); ctx.fill(); ctx.stroke(); ctx.restore();
    vaText(String(n), CXT - 48 * s, y + 8, 76 * s, c, { align: 'center', serif: true, weight: 700, a, glow: 14 });
    vaText(word, CXT + 40 * s, y, 34 * s, c, { align: 'center', weight: 700, a });
    if (sub) vaText(sub, CXT, y + 70, 28, VA.text, { align: 'center', a });
  });
}

// =====================================================================
//  1 — the table: title, the roll, the question, 1982, "one", the same edge, "it's two", the arrow, the centre
// =====================================================================
function beatTable() {
  const a = win(0, S('unroll') + 0.3, 0.35); if (a <= 0) return;
  const C = pairOfCoins(a * fadeIn(0.1, 0.4) * fadeOut(S('unroll') + 0.1, 0.4), {
    center: fadeIn(VW('center', 'center') - 0.2, 0.3) * fadeOut(S('fav'), 0.3),
    hlS: MINT, hlSA: win(VW('edge', 'edge') - 0.2, S('clean'), 0.3), hlM: MINT, hlMA: win(VW('edge', 'edge') - 0.2, S('clean'), 0.3),
  });
  // the contact point: lit, then crossed out ("it's not the point where they touch")
  const ck = win(VW('center', 'point') - 0.2, VW('center', 'center') + 0.4, 0.25);
  if (ck > 0) { const [x, y] = scr(CR * Math.cos(C.th), CR * Math.sin(C.th)); vaDot(x, y, 10, MAG, ck); vaRing(x, y, 22 + 6 * Math.sin(TT * 8), MAG, 3, ck);
    const xs = EZ.o2(clamp((TT - VW('center', 'matters') + 0.1) / 0.25)); if (xs > 0) { vaLine(x - 22, y - 22, x - 22 + 44 * xs, y - 22 + 44 * xs, VA.red, 5, { a: ck }); } }
  // the still coin's centre and the 2-radii rule
  const ra = win(VW('radii', 'two') - 0.2, S('fav') + 0.1, 0.3);
  if (ra > 0) { const [x0, y0] = scr(0, 0), [x1, y1] = scr(C.mx, C.my); vaDot(x0, y0, 7, AMB, ra); vaLine(x0, y0, x1, y1, AMB, 3, { a: ra, dash: [10, 8] });
    OV(() => vaText('2 radii', (x0 + x1) / 2, (y0 + y1) / 2 - 22, 32, AMB, { align: 'center', weight: 700, a: ra, glow: 10 })); }
  // the centre's path: a dotted circle of radius 2r, drawn as the centre goes round
  const pa = fadeIn(S('radii') + 0.2, 0.3) * fadeOut(S('fav') + 0.1, 0.3);
  if (pa > 0) { const done = clamp((TT - S('radii') - 0.2) / (VW('circle', 'twice') - S('radii'))), P = [];
    for (let k = 0; k <= 120 * done; k++) { const u = TH0 - TAU * k / 120; P.push(scr(2 * CR * Math.cos(u), 2 * CR * Math.sin(u))); }
    vaStroke(P, AMB, 3, { a: pa, dash: [4, 10] });
    const ea = fadeIn(VW('circle', 'edge') - 0.2, 0.3) * pa; if (ea > 0) vaGlow(vaArcPts(0, 0, 1, 0, TAU, 80).map(([x, y]) => scr(x * CR, y * CR)), MINT, 3, 1, { a: ea }); }
  // the question, held at the top through the explanation
  const qa = fadeOut(S('fav'), 0.35);
  OV(() => {
    const ta = fadeOut(S('two') + 0.2, 0.35);
    vaText('How many times does a coin turn', CXT, 360, 54, VA.cream, { align: 'center', serif: true, a: ta * fadeIn(0.15, 0.2), frac: vaType(0.15, 'How many times does a coin turn', 30), glow: 8 });
    vaText('when it rolls around another one?', CXT, 436, 50, MINT, { align: 'center', serif: true, italic: true, a: ta * fadeIn(VW('title', 'rolls') - 0.1, 0.2), frac: vaType(VW('title', 'rolls') - 0.1, 'when it rolls around another one?', 30), glow: 14 });
    const t1 = VW('silly', 'how') - 0.1;
    vaText('how many turns', CXT, 330, 46, VA.cream, { align: 'center', serif: true, a: qa * fadeIn(t1, 0.25), frac: vaType(t1, 'how many turns', 30), glow: 8 });
    vaText('around itself?', CXT, 388, 46, MINT, { align: 'center', serif: true, italic: true, a: qa * fadeIn(t1 + 0.5, 0.25), frac: vaType(t1 + 0.5, 'around itself?', 30), glow: 12 });
  });
  cap('one still', 1420, VW('two', 'still') - 0.1, VA.text, 34, { mono: true, a: fadeOut(S('rolls'), 0.3) });
  cap('no slipping, not one millimeter', 1420, VW('rolls', 'slipping') - 0.1, VA.text, 32, { mono: true, a: fadeOut(S('silly') + 0.2, 0.3) });
  // 1982: a red stamp
  const sk = popS(VW('broke', '1982') - 0.1) * fadeOut(S('one') + 0.3, 0.3);
  if (sk > 0) OV(() => { ctx.save(); ctx.translate(CXT, 1350); ctx.rotate(-0.08); ctx.globalAlpha *= sk; ctx.strokeStyle = MAG; ctx.lineWidth = 5; ctx.shadowColor = MAG; ctx.shadowBlur = 14; ctx.beginPath(); ctx.roundRect(-130 * sk, -60 * sk, 260 * sk, 100 * sk, 12); ctx.stroke(); ctx.restore();
    vaText('1982', CXT, 1374, 72 * sk, MAG, { align: 'center', serif: true, weight: 700, a: sk, glow: 16 });
    vaText('an official exam, broken', CXT, 1450, 28, MAG, { align: 'center', a: sk * fadeIn(VW('broke', 'exam') - 0.1, 0.3) }); });
  // the answer chip: "1 turn" (grey) → at the payoff "2 turns" (mint)
  const ca = fadeIn(VW('one', 'one') - 0.1, 0.25) * qa;
  if (TT < HIT) chip(1, 530, ca, '#8aa0b0'); else chip(2, 530, ca * fadeOut(S('trick'), 0.3), MINT);
  // "same edge": the two rims unroll into two equal bars
  const ba = win(VW('edge', 'edge') - 0.2, S('its2') + 0.2, 0.3);
  if (ba > 0) { const L = TAU * CR * 0.95, gx = EZ.io(clamp((TT - VW('edge', 'edge') + 0.2) / 0.8));
    vaGlow([[540 - L / 2 * gx, 1290], [540 + L / 2 * gx, 1290]], MINT, 8, 1, { a: ba }); vaGlow([[540 - L / 2 * gx, 1340], [540 + L / 2 * gx, 1340]], MINT, 8, 1, { a: ba });
    cap('same edge', 1410, VW('edge', 'same') - 0.1, MINT, 36, { mono: true, a: ba }); }
  cap('one edge  →  one turn', 1490, VW('whole', 'exactly') - 0.1, VA.cream, 34, { mono: true, a: win(VW('whole', 'exactly') - 0.1, S('its2') + 0.2, 0.3) });
  // the slow roll: a counter under the coins
  const sa = win(S('arrow'), S('trick') + 0.2, 0.3);
  if (sa > 0) { const n = Math.floor((PHI0 - C.phi) / TAU + 1e-6), th1 = TT >= VW('full', 'two') ? 2 : TT >= VW('half', 'pointing') ? 1 : 0;
    OV(() => { vaText(String(th1), CXT - 30, 1390, 96, MINT, { align: 'center', serif: true, weight: 700, a: sa, glow: 18 }); vaText(th1 === 1 ? 'turn' : 'turns', CXT + 70, 1380, 34, MINT, { align: 'center', weight: 700, a: sa });
      vaText(TT < VW('full', 'one') ? 'halfway' : 'whole trip', CXT, 1450, 30, VA.text, { align: 'center', a: sa * fadeIn(VW('half', 'halfway'), 0.3) }); }); }
  // an "up" reference arrow beside the table during the slow roll
  const ua = win(S('arrow'), S('trick'), 0.3);
  if (ua > 0) { vaArrow(830, 760, 830, 640, VA.dim, 4, ua, 16); label('up', 830, 800, VA.dim, 26, ua); }
  // twice the path: the edge bar vs the centre's bar
  const tw = win(S('circle') + 0.3, S('fav') + 0.1, 0.3);
  if (tw > 0) { const L = 380, g1 = EZ.io(clamp((TT - VW('circle', 'edge') + 0.2) / 0.6)), g2 = EZ.io(clamp((TT - VW('circle', 'twice') + 0.1) / 0.8));
    vaGlow([[540 - L / 2, 1300], [540 - L / 2 + L * g1, 1300]], MINT, 8, 1, { a: tw }); label('edge', 540, 1270, MINT, 26, tw * g1);
    vaGlow([[540 - L, 1380], [540 - L + 2 * L * g2, 1380]], AMB, 8, 1, { a: tw }); label("centre's path", 540, 1350, AMB, 26, tw * g2);
    cap('×2', 1470, VW('twice', 'twice') - 0.1, AMB, 72, { a: tw, glow: 18, weight: 700 }); }
}

// =====================================================================
//  2 — unrolled: the still coin's edge becomes a straight line, the coin rolls along it once; then it curls back
// =====================================================================
const TRK_Y = 1080, LX0 = 540 - Math.PI * CR, LX1 = 540 + Math.PI * CR;
function beatUnroll() {
  const a = win(S('unroll') - 0.2, S('daily') + 0.2, 0.35); if (a <= 0) return;
  ctx.save(); ctx.translate(540, 1000); ctx.scale(0.8, 0.8); ctx.translate(-540, -1000);   // the whole track fits inside the safe frame
  unrollBody(a);
  ctx.restore();
  cap("my favourite way to see it", 400, S('fav') + 0.3, VA.cream, 44, { italic: true, a: fadeOut(VW('unroll', 'roll'), 0.3) });
  cap('the real track is a circle', 400, VW('real', 'track') - 0.1, VA.cream, 44, { italic: true, a: fadeOut(S('daily'), 0.3) });
}
function unrollBody(a) {
  const un = EZ.io(clamp((TT - VW('unroll', 'unroll') + 0.1) / 1.1)), curl = EZ.io(clamp((TT - S('real') - 0.3) / 1.6));
  const k = un * (1 - curl);
  // the track: circle (around the still coin's place) ↔ line
  const P = [];
  for (let i = 0; i <= 120; i++) { const s = i / 120, an = Math.PI / 2 + TAU * s;
    P.push([lerp(540 + CR * Math.cos(an), LX0 + (LX1 - LX0) * s, k), lerp(FY + CR * Math.sin(an) * KY, TRK_Y, k)]); }
  vaGlow(P, MINT, 5, 1.1, { a });
  // rolling along the line: one turn
  const rl = EZ.io(clamp((TT - VW('unroll', 'roll') + 0.1) / (VW('once', 'turn') + 0.2 - VW('unroll', 'roll'))));
  if (curl <= 0) {
    const x = lerp(LX0, LX1, rl), y = lerp(FY - 2 * CR, TRK_Y - CR, un);
    const phi = PHI0 + (x - LX0) / CR;
    coin(x - 540, (y - FY) / KY, phi, { a: a * fadeIn(S('unroll') - 0.1, 0.3), arrow: true });
    OV(() => { const ra = fadeIn(VW('once', 'one') - 0.1, 0.25) * a;
      vaText('1', CXT - 30, 1300, 96, MINT, { align: 'center', serif: true, weight: 700, a: ra, glow: 18 }); vaText('turn', CXT + 60, 1290, 34, MINT, { align: 'center', weight: 700, a: ra });
      vaText('rolling', CXT, 1360, 30, VA.text, { align: 'center', a: ra }); });
  } else {
    // back on the circle: the coin rides round it without rolling — the trip alone turns it once
    const ride = EZ.io(clamp((TT - VW('real', 'going') + 0.1) / (VW('real', 'own') + 0.2 - VW('real', 'going')))), th = TH0 - TAU * ride;
    const phiEnd = PHI0 + TAU, phi = lerp(PHI0 + TAU, PHI0 + TAU, 0) + (th - TH0) * -1;
    const cx = lerp(LX1 - 540, 2 * CR * Math.cos(TH0), curl), cy = lerp((TRK_Y - CR - FY) / KY, 2 * CR * Math.sin(TH0), curl);
    const px = ride > 0 ? 2 * CR * Math.cos(th) : cx, py = ride > 0 ? 2 * CR * Math.sin(th) : cy;
    coin(px, py, ride > 0 ? phiEnd + (TH0 - th) : phiEnd, { a, arrow: true });
    // the +360° trace
    if (ride > 0) { const T = []; for (let i = 0; i <= 80 * ride; i++) { const u = TH0 - TAU * i / 80; T.push(scr(2.75 * CR * Math.cos(u), 2.75 * CR * Math.sin(u))); } vaGlow(T, AMB, 4, 1, { a });
      OV(() => vaText('+360°', CXT, FY - 2.75 * CR - 30, 44, AMB, { align: 'center', weight: 700, a: a * fadeIn(VW('real', 'three') - 0.1, 0.3), glow: 14 })); }
    // 1 + 1 = 2
    const t1 = VW('plus', 'rolling') - 0.1, t2 = VW('plus', 'going') - 0.1, t3 = VW('plus', 'other') + 0.1;
    OV(() => {
      vaText('1', 330, 1420, 80, MINT, { align: 'center', serif: true, weight: 700, a: a * popS(t1), glow: 14 }); vaText('rolling', 330, 1470, 26, MINT, { align: 'center', a: a * popS(t1) });
      vaText('+', 445, 1410, 56, VA.cream, { align: 'center', a: a * popS(t2) });
      vaText('1', 560, 1420, 80, AMB, { align: 'center', serif: true, weight: 700, a: a * popS(t2), glow: 14 }); vaText('going around', 560, 1470, 26, AMB, { align: 'center', a: a * popS(t2) });
      vaText('=', 675, 1410, 56, VA.cream, { align: 'center', a: a * popS(t3) });
      vaText('2', 770, 1420, 96, VA.cream, { align: 'center', serif: true, weight: 700, a: a * popS(t3), glow: 18 });
    });
  }
}

// =====================================================================
//  3 — the Sun and the Earth: 366 spins, 365 days
// =====================================================================
function beatEarth() {
  const a = win(S('daily') + 0.2, S('back') + 0.2, 0.35); if (a <= 0) return;
  cap('it happens every day', 400, VW('daily', 'every') - 0.1, VA.cream, 46, { italic: true, a: fadeOut(S('earth'), 0.3) });
  const sk = fadeIn(S('daily') + 0.4, 0.5) * a;
  // the orbit: dotted ellipse, the Earth goes round once while spinning (not to scale)
  const OX = 540, OY = 980, ORX = 330, ORY = 150;
  vaStroke(vaArcPts(0, 0, 1, 0, TAU, 90).map(([x, y]) => [OX + x * ORX, OY + y * ORY]), VA.dim, 2, { a: sk, dash: [4, 10] });
  const u = clamp((TT - S('earth')) / (VL('orbit').t1 - S('earth'))), an = Math.PI / 2 - TAU * EZ.io(u);
  const ex = OX + ORX * Math.cos(an), ey = OY + ORY * Math.sin(an);
  const earthFirst = ey < OY;
  if (earthFirst) sphere(ex, ey, 42, { a: sk, phi: -an * 6 });
  sphere(OX, OY, 110, { a: sk, mat: 'sun', phi: TT * 0.2 });
  if (!earthFirst) sphere(ex, ey, 42, { a: sk, phi: -an * 6 });
  // the Earth's own arrow (one spin per visual day) and the line to the Sun
  const sa = -an * 6; vaArrow(ex, ey, ex + 70 * Math.cos(sa), ey + 70 * Math.sin(sa) * 0.8, MAG, 4, sk, 12);
  vaLine(ex, ey, OX, OY, AMB, 2, { a: sk * 0.35, dash: [6, 8] });
  OV(() => {
    const t1 = VW('earth', 'spins') - 0.1, t2 = VW('earth', 'count') - 0.1, t3 = VW('orbit', 'eats') - 0.1;
    vaText('366', CXT - 50, 420, 80, MINT, { align: 'center', serif: true, weight: 700, a: a * popS(t1), glow: 16 }); vaText('spins', CXT + 90, 410, 34, MINT, { align: 'center', weight: 700, a: a * popS(t1) });
    vaText('365', CXT - 50, 510, 80, AMB, { align: 'center', serif: true, weight: 700, a: a * popS(t2), glow: 16 }); vaText('days', CXT + 90, 500, 34, AMB, { align: 'center', weight: 700, a: a * popS(t2) });
    vaText('+1', CXT + 210, 470, 56, MAG, { align: 'center', weight: 700, a: a * popS(t3), glow: 16 });
    vaText('the orbit eats one spin', CXT, 1340, 34, VA.cream, { align: 'center', a: a * fadeIn(t3, 0.3) });
    vaText('(not to scale)', CXT, 1420, 26, VA.dim, { align: 'center', a: sk * fadeIn(S('earth'), 0.3) });
  });
}

// =====================================================================
//  4 — the 1982 SAT: a circle three times bigger, the answer 4, the choices without it, the rescoring
// =====================================================================
function beatSAT() {
  const a = win(S('back') + 0.1, S('pocket') + 0.2, 0.35); if (a <= 0) return;
  const ca = fadeIn(S('sat') - 0.1, 0.4) * a;
  // the stamp first
  const sk = popS(VW('back', '1982') - 0.1) * fadeOut(S('sat') + 0.2, 0.3) * a;
  if (sk > 0) OV(() => { ctx.save(); ctx.translate(CXT, 900); ctx.rotate(-0.08); ctx.globalAlpha *= sk; ctx.strokeStyle = MAG; ctx.lineWidth = 6; ctx.shadowColor = MAG; ctx.shadowBlur = 16; ctx.beginPath(); ctx.roundRect(-170 * sk, -80 * sk, 340 * sk, 130 * sk, 14); ctx.stroke(); ctx.restore();
    vaText('1982', CXT, 930, 100 * sk, MAG, { align: 'center', serif: true, weight: 700, a: sk, glow: 18 }); });
  if (ca <= 0) return;
  // the answer sheet
  ctx.save(); ctx.globalAlpha *= ca; ctx.fillStyle = 'rgba(14,30,44,0.92)'; ctx.strokeStyle = VA.edge; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(130, 470, 820, 1010, 22); ctx.fill(); ctx.stroke(); ctx.restore();
  OV(() => { vaText('SAT · 1982', CXT, 540, 34, VA.text, { align: 'center', weight: 700, a: ca }); vaText('college entrance exam', CXT, 580, 24, VA.dim, { align: 'center', a: ca }); });
  // the drawing: B (3r) and A (r) rolling round it, turning 4 times
  const BX = 540, BY = 780, RB = 150, RA = 50;
  ctx.save(); ctx.globalAlpha *= ca; const g = ctx.createRadialGradient(BX - 40, BY - 40, 10, BX, BY, RB); g.addColorStop(0, '#2a5fae'); g.addColorStop(1, '#0d2446'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(BX, BY, RB, 0, TAU); ctx.fill(); ctx.restore();
  vaRing(BX, BY, RB, '#7fb6ff', 3, ca); label('B', BX, BY + 12, '#7fb6ff', 40, ca * (1 - popS(VW('students', 'thrown') - 0.3)));
  const ru = EZ.io(clamp((TT - VW('four', 'right') + 0.1) / (VW('four', 'four') + 0.6 - VW('four', 'right')))), th = Math.PI / 2 - TAU * ru, phi = -Math.PI / 2 - 4 * TAU * ru;
  const ax = BX + (RB + RA) * Math.cos(th), ay = BY + (RB + RA) * Math.sin(th);
  ctx.save(); ctx.globalAlpha *= ca; const ga = ctx.createRadialGradient(ax - 15, ay - 15, 2, ax, ay, RA); ga.addColorStop(0, '#fff0a8'); ga.addColorStop(1, '#c88a18'); ctx.fillStyle = ga; ctx.beginPath(); ctx.arc(ax, ay, RA, 0, TAU); ctx.fill(); ctx.restore();
  vaArrow(ax - 22 * Math.cos(phi), ay - 22 * Math.sin(phi), ax + 32 * Math.cos(phi), ay + 32 * Math.sin(phi), MAG, 4, ca, 12);
  label('A', ax + 70 * Math.cos(th), ay + 70 * Math.sin(th) + 10, AMB, 30, ca * (1 - ru));
  cap('B is 3 times bigger', 1130, VW('sat', 'three') - 0.1, VA.cream, 34, { mono: true, a: ca * fadeOut(S('four'), 0.3) });
  // the answer and the rule
  const fk = popS(VW('four', 'four') - 0.1) * ca * fadeOut(S('choices'), 0.3);
  if (fk > 0) OV(() => { vaText('4', CXT, 1160, 110 * fk, MINT, { align: 'center', serif: true, weight: 700, a: fk, glow: 22 }); vaText('turns', CXT, 1205, 30, MINT, { align: 'center', weight: 700, a: fk }); });
  fx('turns = R/r + 1 = 3 + 1', 1300, VW('four', 'rule') - 0.1, VA.cream, 40, { a: ca * fadeOut(S('choices'), 0.3) });
  // the choices: none of them is 4
  const cha = fadeIn(S('choices') + 0.1, 0.3) * ca;
  if (cha > 0) {
    const C5 = [['A', '3/2'], ['B', '3'], ['C', '9/2'], ['D', '6'], ['E', '9']], tS = VW('choices', 'choices');
    C5.forEach(([l, v], i) => {
      const x = 225 + i * 157, y = 1130, k = popS(tS + i * 0.1) * cha, scan = clamp((TT - VW('choices', 'four') + 0.2 - i * 0.12) / 0.2);
      if (k <= 0) return;
      vaRing(x, y, 30, scan > 0 ? VA.red : VA.line, 3, k); label(l, x, y + 10, VA.text, 28, k);
      label(v, x, y + 80, VA.cream, 36, k);
      if (scan > 0) vaLine(x - 26, y + 66, x + 26, y + 66, VA.red, 4, { a: k * scan });
    });
    cap('no 4', 1290, VW('choices', 'there') - 0.1, MAG, 64, { a: cha * fadeOut(S('students') + 0.2, 0.3), glow: 16, weight: 700 });
  }
  // three students, VOID, 300,000 rescored
  const st = fadeIn(S('students') + 0.1, 0.3) * ca;
  if (st > 0) {
    for (let i = 0; i < 3; i++) { const k = popS(VW('students', 'three') - 0.1 + i * 0.12) * st, x = 400 + i * 140, y = 1300;
      if (k <= 0) continue; vaRing(x, y - 34, 18 * k, MINT, 3, k); vaStroke(vaArcPts(x, y + 20, 34 * k, Math.PI, TAU, 16), MINT, 3, { a: k }); vaText('!', x + 36, y - 40, 34, AMB, { align: 'center', weight: 700, a: k * fadeIn(VW('students', 'wrote') - 0.1, 0.2) }); }
    const vk = popS(VW('students', 'thrown') - 0.1) * st;
    if (vk > 0) OV(() => { ctx.save(); ctx.translate(CXT, 830); ctx.rotate(-0.18); ctx.globalAlpha *= vk; ctx.strokeStyle = VA.red; ctx.lineWidth = 8; ctx.shadowColor = VA.red; ctx.shadowBlur = 16; ctx.beginPath(); ctx.roundRect(-220 * vk, -80 * vk, 440 * vk, 140 * vk, 14); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(CXT, 830); ctx.rotate(-0.18); vaText('VOID', 0, 32, 120 * vk, VA.red, { align: 'center', serif: true, weight: 700, a: vk, glow: 18 }); ctx.restore(); });
    const nk = fadeIn(VW('students', 'three', 2) - 0.1, 0.3) * st;
    if (nk > 0) { const n = Math.round(300000 * EZ.o2(clamp((TT - VW('students', 'three', 2) + 0.1) / 1.4)));
      OV(() => { vaText('≈ ' + n.toLocaleString('en-US'), CXT, 1420, 56, AMB, { align: 'center', weight: 700, a: nk, glow: 14 }); vaText('exams rescored', CXT, 1460, 26, VA.text, { align: 'center', a: nk }); }); }
  }
}

// =====================================================================
//  5 — in your pocket: try it; the end
// =====================================================================
function beatPocket() {
  const a = win(S('pocket') + 0.1, S('end') + 0.2, 0.35); if (a <= 0) return;
  cap("it's in your pocket", 400, VW('pocket', 'pocket') - 0.1, VA.cream, 50, { italic: true, a: fadeOut(S('try'), 0.3) });
  const C = pairOfCoins(a * fadeIn(VW('pocket', 'pocket') - 0.2, 0.4), {});
  cap('watch the face. no slipping.', 400, VW('try', 'face') - 0.1, VA.cream, 40, { italic: true, a: fadeOut(S('comments'), 0.3) });
  const ta = win(VW('try', 'count') - 0.1, S('comments') + 0.2, 0.3);
  if (ta > 0) { const n = Math.min(2, Math.floor((PHI0 - C.phi) / TAU + 0.02));
    OV(() => { vaText(String(n), CXT - 30, 1390, 96, MINT, { align: 'center', serif: true, weight: 700, a: ta, glow: 18 }); vaText(n === 1 ? 'turn' : 'turns', CXT + 70, 1380, 34, MINT, { align: 'center', weight: 700, a: ta }); }); }
  const ma = fadeIn(S('comments') + 0.1, 0.3) * a;
  if (ma > 0) OV(() => {
    vaText('2  →  tell me in the comments', CXT, 1340, 36, MINT, { align: 'center', weight: 700, a: ma * fadeIn(VW('comments', 'two') - 0.1, 0.3), glow: 10 });
    vaText('1  →  it slipped', CXT, 1420, 36, MAG, { align: 'center', weight: 700, a: ma * fadeIn(VW('comments', 'one') - 0.1, 0.3), glow: 10 });
  });
}
function beatEnd() {
  const t0 = S('end') + 0.2; if (TT < t0 - 0.1) return;
  OV(() => {
    vaText('And you,', CXT, 680, 60, VA.cream, { align: 'center', serif: true, a: fadeIn(t0, 0.3), frac: vaType(t0, 'And you,', 26), glow: 10 });
    const t1 = VW('end', 'what') - 0.1;
    vaText('what did you answer?', CXT, 770, 60, MINT, { align: 'center', serif: true, italic: true, a: fadeIn(t1, 0.3), frac: vaType(t1, 'what did you answer?', 26), glow: 16 });
    const t2 = VW('end', 'before') - 0.1;
    vaText('before you saw it', CXT, 840, 34, VA.text, { align: 'center', a: fadeIn(t2, 0.3), frac: vaType(t2, 'before you saw it', 30) });
    const ak = fadeIn(t2 + 0.6, 0.3), b = 18 * Math.abs(Math.sin(TT * 4));
    if (ak > 0) vaArrow(CXT, 960 + b, CXT, 1140 + b, MAG, 7, ak, 30);
    const na = fadeIn(VL('end').t1 + 0.2, 0.5);
    if (na > 0) {
      ctx.save(); ctx.font = `700 50px ${VMONO}`; const wB = ctx.measureText('Bit').width, wS = ctx.measureText('story').width; ctx.restore();
      const x0 = CXT - (wB + wS) / 2, gl = 14 + 16 * Math.max(0, Math.sin((TT - VL('end').t1) * 2.4));
      vaText('Bit', x0, 1475, 50, MINT, { weight: 700, a: na, glow: gl }); vaText('story', x0 + wB, 1475, 50, MAG, { weight: 700, a: na, glow: gl });
      const sw = mod((TT - VL('end').t1) / 1.4, 1); ctx.save(); ctx.globalAlpha = na * 0.5 * Math.sin(Math.PI * sw); ctx.fillStyle = '#ffffff'; ctx.fillRect(x0 - 20 + (wB + wS + 40) * sw, 1428, 6, 60); ctx.restore();
    }
  });
  // two small coins keep rolling round each other under the question
  const ca = fadeIn(t0 + 0.3, 0.5), th = TH0 - TAU * (TT - t0) / 3, s = 0.35;
  if (ca > 0) { const r = CR * s, cyy = 1290; coin(0, 0, 0, { a: ca, r, cy: cyy }); coin(2 * r * Math.cos(th), 2 * r * Math.sin(th), PHI0 + 2 * (th - TH0), { a: ca, r, cy: cyy, arrow: true }); }
}

// =====================================================================
//  the stage
// =====================================================================
function sceneStage() {
  const c = camAtT();
  KY = KY_NOW();
  vaBg(0.2 * flashK(HIT, 1.2));
  stars(0.7);
  vaGridBg(c, 1.15);
  gridPulses(c);
  vaSpecks(30, 0.25);
  setCam(c);
  beatTable(); beatUnroll(); beatEarth(); beatSAT(); beatPocket(); beatEnd();
}
