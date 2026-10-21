// =====================================================================
//  S1 — the room of 23, not 183, the calendar, your 6%, the pairs and the web
// =====================================================================
const ME = 0, [MA, MB] = BD.match;                      // "you" is person 0; MA and MB really share a birthday (BD.days)
const T_YEAR = VW('impossible', 'year'), T_BACK = B0('mine');

// where person i is: the ring, or (during the calendar) their birthday cell
function personAt(i) {
  const go = EZ.io(seg(TT, T_YEAR - 0.1 + i * 0.025, T_YEAR + 0.9 + i * 0.025)), back = EZ.io(seg(TT, T_BACK + i * 0.015, T_BACK + 0.8 + i * 0.015));
  const r = ringPt(i), c = dayCell(BD.days[i]), u = go * (1 - back);
  return [lerp(r[0], c[0], u), lerp(r[1], c[1], u) - Math.sin(u * Math.PI) * 60, u];
}
// how many lines of the web are drawn, and which people are lit
function webState() {
  const tP = VW('pairs', 'pairs'), t1 = VW('grow', 'one'), t10 = VW('grow', 'ten'), t23 = VW('grow', 'twentythree') || VW('grow', 'twenty');
  if (TT < tP) return null;
  if (TT < t1 - 0.2) { const k = Math.floor((TT - tP) * 7); return { lines: [PAIRS[(k * 37) % 253]], lit: null, n: 1, flick: true }; }   // anyone with anyone
  if (TT < t10 - 0.1) return { lines: [[0, 1]], lit: (i) => i < 2, n: 1 };
  const ten = []; for (let a = 0; a < 10; a++) for (let b = a + 1; b < 10; b++) ten.push([a, b]);
  if (TT < t23 - 0.1) { const k = Math.round(45 * EZ.o2(seg(TT, t10, t10 + 0.9))); return { lines: ten.slice(0, Math.max(1, k)), lit: (i) => i < 10, n: Math.max(1, k) }; }
  const k = Math.round(lerp(45, 253, EZ.io(seg(TT, t23, HIT - 0.05))));
  const rest = PAIRS.filter(([a, b]) => !(a < 10 && b < 10));
  return { lines: [...ten, ...rest.slice(0, k - 45)], lit: null, n: k };
}

function beatRoom() {
  const a = fadeOut(B0('odds') + 0.2, 0.5); if (a <= 0) return;
  // the calendar behind the dots
  const ca = win(T_YEAR - 0.2, T_BACK + 0.4, 0.5);
  drawCalendar(ca * a);
  topTag('365 DAYS', ca * a);
  // the web
  const ws = webState(), web = TT >= HIT;
  if (ws || web) {
    const L = web ? PAIRS : ws.flick ? [0, 1, 2, 3, 4, 5].map((q) => PAIRS[(Math.floor((TT - VW('pairs', 'pairs')) * 6) * 37 + q * 41) % 253]) : ws.lines, shimmer = web ? 0.5 + 0.5 * Math.sin(TT * 3) : 1;
    L.forEach(([p, q], j) => {
      if (web && ((p === MA && q === MB) || (p === MB && q === MA))) return;
      const [x0, y0] = ringPt(p), [x1, y1] = ringPt(q);
      line(x0, y0, x1, y1, BP.mint, web ? 1.6 : 2.4, a * (web ? 0.22 + 0.12 * Math.sin(TT * 4 + j * 0.7) * shimmer : ws.flick ? 0.9 : 0.55));
    });
    if (web) { // the one real collision in this room: magenta
      const [x0, y0] = ringPt(MA), [x1, y1] = ringPt(MB), u = fadeIn(VW('chances', 'collide') - 0.2, 0.3);
      if (u > 0) { line(x0, y0, x1, y1, BP.magenta, 6, a * u); }
    }
  }
  // "you": person 0, and your 22 lines
  const ma = win(VL('mine').t0, B0('pairs') + 0.2, 0.3);
  if (ma > 0) for (let i = 1; i < 23; i++) { const [x0, y0] = ringPt(ME), [x1, y1] = ringPt(i), u = EZ.o2(seg(TT, VW('mine', 'someone') - 0.1 + i * 0.03, VW('mine', 'someone') + 0.4 + i * 0.03)); if (u > 0) line(x0, y0, lerp(x0, x1, u), lerp(y0, y1, u), BP.yellow, 2.4, a * ma * 0.7); }
  // the people
  for (let i = 0; i < 23; i++) {
    const [x, y, cu] = personAt(i), pop = EZ.back(seg(TT, 0.25 + i * 0.07, 0.5 + i * 0.07));
    if (pop <= 0) continue;
    let c = BP.mint, r = 16;
    const lit = ws && ws.lit ? ws.lit(i) : true;
    if (ma > 0 && i === ME) { c = bpMix(BP.mint, BP.yellow, ma); r = 16 + 8 * ma; }
    if (web && (i === MA || i === MB)) { const u = fadeIn(VW('chances', 'collide') - 0.2, 0.3); c = bpMix(BP.mint, BP.magenta, u); r = 16 + 6 * u; }
    if (TT > VW('likely', 'share') - 0.1 && TT < VL('again').t0 && (i === MA || i === MB)) c = BP.magenta;   // a first hint
    if (cu > 0.5) { c = BP.yellow; r = 10; }
    const al = a * (lit ? 1 : 0.25);
    const tw = 0.3 + 0.25 * Math.sin(TT * 2.6 + i * 1.7);
    bpGlow(x, y, r * 2.4, c, al * tw); bpDot(x, y, r * pop, c, al);
  }
  // the hint arc between the two who match
  const ha = win(VW('likely', 'share') - 0.1, VL('again').t0, 0.25);
  if (ha > 0) { const [x0, y0] = ringPt(MA), [x1, y1] = ringPt(MB); ctx.save(); ctx.setLineDash([12, 12]); line(x0, y0, x1, y1, BP.magenta, 3, a * ha * 0.8); ctx.restore(); }
  // the centre: 23 / 183, then the count of pairs, then "you ≈ 6%"
  OV(() => {
    const c23 = win(VW('open', 'twentythree') - 0.1, T_YEAR, 0.3) * a;
    if (c23 > 0) {
      const pulse = 1 + 0.18 * Math.exp(-Math.max(0, TT - VW('again', 'twentythree', 2)) * 6) * (TT > VW('again', 'twentythree', 2) ? 1 : 0);
      ctx.save(); ctx.translate(540, RING.cy); ctx.scale(pulse, pulse); bpText('23', 0, 50, 170, BP.mint, { font: BP.mono, weight: 700, alpha: c23, glow: 20 }); ctx.restore();
      const n183 = win(VW('again', 'not') - 0.1, VW('again', 'twentythree', 2) + 0.4, 0.25) * a;
      if (n183 > 0) { bpText('183', 540, RING.cy + 150, 80, BP.magenta, { font: BP.mono, weight: 700, alpha: n183 });
        const s = EZ.io(seg(TT, VW('again', 'not') + 0.2, VW('again', 'not') + 0.6)); line(450, RING.cy + 125, 450 + 180 * s, RING.cy + 125, BP.magenta, 8, n183); }
      bpText('people', 540, RING.cy + 105, 40, BP.soft, { font: BP.mono, alpha: c23 * fadeOut(VW('again', 'not') - 0.35, 0.2) });
    }
    const pa = (ws && TT > VW('grow', 'one') - 0.2) || web ? win(VW('grow', 'one') - 0.2, B0('odds'), 0.3) * a : 0;
    if (pa > 0) { const n = web ? 253 : ws.n; bpText(String(n), 540, RING.cy + 50, n > 99 ? 150 : 170, BP.mint, { font: BP.mono, weight: 700, alpha: pa, glow: 20 }); bpText(n === 1 ? 'pair' : 'pairs', 540, RING.cy + 105, 40, BP.soft, { font: BP.mono, alpha: pa }); }
    if (ma > 0) { bpText('≈ 6%', 540, RING.cy + 50, 150, BP.yellow, { font: BP.mono, weight: 700, alpha: ma * fadeIn(VW('mine', 'six') - 0.1, 0.3), glow: 20 }); bpText('you', ringPt(ME)[0], ringPt(ME)[1] - 46, 40, BP.yellow, { font: BP.mono, alpha: ma }); }
    if (web) { const u = fadeIn(VW('chances', 'collide') - 0.2, 0.3) * a; const [x0, y0] = ringPt(MA), [x1, y1] = ringPt(MB);
      const pu = u * fadeOut(B0('odds') - 0.4, 0.3); bpPill(BD.dateOf(BD.days[MA]), x0 + (x0 > 540 ? 90 : -90), y0, 34, BP.magenta, pu); bpPill(BD.dateOf(BD.days[MB]), x1 + (x1 > 540 ? 90 : -90), y1, 34, BP.magenta, pu); }
  });
  // captions
  caption([{ t: 'more likely than not', c: BP.mint, i: true }], win(VW('likely', 'more') - 0.1, VL('again').t0 - 0.1), 1400, 74);
  caption([{ t: 'barely touched', c: BP.yellow, i: true }], win(VW('impossible', 'year') + 0.8, VW('gut', 'your') - 0.55), 1360, 70);
  caption([{ t: 'the wrong question', c: BP.magenta, i: true }], win(VW('gut', 'gut') - 0.05, VW('mine', 'asks') - 0.4), 1360, 74);
  caption([{ t: 'will someone share', c: BP.text }, { t: 'MY birthday?', c: BP.yellow, i: true }], win(VW('mine', 'asks') + 0.05, B0('pairs'), 0.3), 1380, 66);
  caption([{ t: 'anyone with anyone', c: BP.mint, i: true }], win(VW('pairs', 'anyone') - 0.2, VL('grow').t0 - 0.1), 1380, 74);
  caption([{ t: '2 → 1     10 → 45     23 → 253', c: BP.soft }], win(VW('grow', 'ten') - 0.1, HIT - 0.1, 0.3), 1380, 46, { font: BP.mono });
  caption([{ t: '253 chances', c: BP.mint }, { t: 'to collide', c: BP.magenta, i: true }], win(VL('chances').t0 - 0.05, B0('odds'), 0.3), 1360, 74);
}
