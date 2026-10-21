// =====================================================================
//  S1 — the circle: 20 numbered dots, each joined to its double; 400 dots; the heart; the tables; melting
// =====================================================================
// the multiplier over time: 2, then each table on the word that names it, then a slow melt, then back to 2
function kAt(t) {
  const step = (t0, a, b) => lerp(a, b, EZ.io(seg(t, t0 - 0.1, t0 + 0.45)));
  let k = 2;
  k = step(VW('three', 'three'), k, 3);
  k = step(VW('four', 'four'), k, 4);
  k = step(VW('four', 'five'), k, 5);
  k = step(VW('seven', 'seven'), k, 7);
  k = step(VW('seven', 'thirteen'), k, 13);
  if (t > VL('melt').t0 - 0.2) k = lerp(13, 2, EZ.io(seg(t, VL('melt').t0 - 0.2, VW('melt', 'raise')))) ;
  if (t > VW('melt', 'raise')) k = 2 + 16 * EZ.i2(seg(t, VW('melt', 'raise'), VL('melt').t1 + 0.6));
  if (t > VL('melt').t1 + 0.6) k = lerp(18, 2, EZ.io(seg(t, VL('melt').t1 + 0.6, VW('name', 'heart'))));
  return k;
}
// how many dots: 20, then 400 on "fill"
const NAt = (t) => (t < VW('fill', 'four') ? 20 : 400);
// how many chords are drawn
function mAt(t) {
  const N = NAt(t);
  if (N === 20) {
    const tj = VW('join', 'join'), a = [VW('join', 'one'), VW('join', 'two', 2), VW('join', 'three')];
    if (t < tj) return 0;
    if (t < a[0]) return 1 * seg(t, tj, a[0]);                        // 0 -> 0 is a point; start with 1 -> 2 on "One"
    if (t < VL('wrap').t0) return 1 + [0, 1, 2].reduce((s, i) => s + seg(t, a[i], a[i] + 0.5), 0);
    return 4 + 16 * EZ.io(seg(t, VL('wrap').t0 + 0.4, VL('wrap').t1 + 0.4));
  }
  return 400 * EZ.i2(seg(t, VW('fill', 'four'), HIT - 0.05));
}

function beatCircle() {
  const a = fadeOut(B0('name') + 6, 0.5) * (1 - 0.8 * win(B0('coin') + 0.4, B0('cup') + 0.3, 0.6));
  if (a <= 0) return;
  const tableA = a * fadeOut(B0('cup') - 0.2, 0.5);
  drawCircle(tableA * fadeIn(0.2, 0.6));
  const N = NAt(TT), k = kAt(TT), m = mAt(TT);
  drawTable(N, k, m, tableA);
  // the 20 numbered dots
  const da = fadeIn(VW('dots', 'dots') - 0.1, 0.4) * fadeOut(VW('fill', 'four') , 0.5) * tableA;
  if (da > 0) for (let i = 0; i < 20; i++) {
    const s = EZ.back(seg(TT, VW('dots', 'dots') - 0.1 + i * 0.04, VW('dots', 'dots') + 0.2 + i * 0.04)), [x, y] = cPt(i, 20), [lx, ly] = cPt(i, 20, CIR.r + 46);
    bpDot(x, y, 9 * s, BP.text, da);
    OV(() => bpText(String(i), lx, ly + 12, 32, BP.yellow, { font: BP.mono, alpha: da * clamp(s) * fadeIn(VW('dots', 'number') - 0.1, 0.3) }));
  }
  // each chord, as it's drawn: a pill "i -> 2i" and a light running along it
  if (N === 20 && TT < VL('wrap').t0 + 0.3) for (let i = 1; i <= Math.min(3, Math.floor(m + 0.001)); i++) {
    const [x0, y0] = cPt(i, 20), [x1, y1] = cPt(2 * i, 20), u = mod((TT - VW('join', 'one')) / 0.9 + i * 0.3, 1);
    bpGlow(lerp(x0, x1, u), lerp(y0, y1, u), 26, BP.yellow, tableA * 0.7); bpDot(lerp(x0, x1, u), lerp(y0, y1, u), 7, BP.yellow, tableA);
    OV(() => bpPill(`${i} → ${2 * i}`, (x0 + x1) / 2, (y0 + y1) / 2, 34, BP.yellow, tableA * fadeOut(VL('wrap').t0 + 0.2, 0.3)));
  }
  // the wrap: 11 -> 22 -> 2 (past the end, keep counting)
  const wa = win(VL('wrap').t0 - 0.1, VL('wrap').t1 + 0.3, 0.3) * tableA;
  if (wa > 0) { const [x0, y0] = cPt(11, 20), [x1, y1] = cPt(2, 20); line(x0, y0, x1, y1, BP.yellow, 6, wa); bpGlow(x1, y1, 40, BP.yellow, wa * 0.7);
    OV(() => bpPill('11 × 2 = 22 → 2', 540, 1420, 44, BP.yellow, wa)); }
  // the 400 dots appear as a ring
  const ra = fadeIn(VW('fill', 'four'), 0.6) * tableA;
  if (ra > 0) for (let i = 0; i < 400; i += 1) { const [x, y] = cPt(i, 400); bpDot(x, y, 2.2, BP.text, ra * 0.7); }
  // the heart: the envelope lights up on the hit
  const ea = TT < HIT ? 0 : fadeIn(HIT, 0.25) * (TT < B0('three') ? 1 : 0.6) * tableA;
  drawEnvelope(k, ea * (TT > B0('look') && TT < B0('nobody') ? 0.35 : 1) * (TT > VL('melt').t0 - 0.2 && TT < VW('name', 'heart') ? 0 : 1), EZ.io(seg(TT, HIT, HIT + 0.6)));
  // a light running along the edge nobody drew
  if (ea > 0.3 && !(TT > VL('melt').t0 - 0.2 && TT < VW('name', 'heart'))) { const [x, y] = envPt(mod(TT * 1.1, TAU), k); bpGlow(x, y, 46, '#ffffff', ea * 0.6); bpDot(x, y, 8, '#ffffff', ea); }
  // the cusps, counted, on each table
  const ca = win(VW('three', 'three') - 0.1, VL('melt').t0 - 0.3, 0.3) * tableA;
  if (ca > 0) {
    const kk = Math.round(k), settled = Math.abs(k - kk) < 0.04;
    if (settled && kk > 2) cusps(kk).forEach(([x, y], j) => { bpGlow(x, y, 44, BP.magenta, ca * 0.8); bpDot(x, y, 11, BP.magenta, ca); });
    OV(() => { if (settled && kk > 2) { bpText(`${kk - 1}`, 540, 1440, 120, BP.magenta, { font: BP.mono, weight: 700, alpha: ca, glow: 20 }); bpText(kk - 1 === 1 ? 'point' : 'points', 540, 1500, 40, BP.soft, { font: BP.mono, alpha: ca }); } });
  }
  // the multiplier, top
  const ka = fadeIn(0.3, 0.4) * tableA;
  OV(() => {
    const melting = TT > VW('melt', 'raise') && TT < VL('melt').t1 + 0.6;
    bpText(`× ${melting ? k.toFixed(2) : Math.round(k)}`, 540, 330, 92, BP.mint, { font: BP.mono, weight: 700, alpha: ka, glow: 14 });
    const ru = win(VW('rule', 'number') - 0.2, VL('melt').t0 - 0.2, 0.3) * tableA;
    if (ru > 0) bpText('points = × − 1', 540, 410, 50, BP.yellow, { font: BP.mono, alpha: ru });
  });
  // captions
  caption([{ t: 'only the 2 times table', c: BP.text, i: true }], win(0.4, VL('dots').t0 - 0.1), 1440, 66);
  caption([{ t: 'each number → its double', c: BP.mint, i: true }], win(VW('join', 'join') - 0.1, VL('wrap').t0 - 0.55), 1440, 66);
  caption([{ t: 'There it is.', c: BP.magenta, i: true }], win(HIT + 0.2, B0('look') + 0.2), 1460, 92);
  caption([{ t: 'not one curved line', c: BP.text, i: true }], win(VW('look', 'curved') - 0.2, VL('nobody').t0 - 0.4), 1460, 70);
  caption([{ t: 'nobody drew it', c: BP.magenta, i: true }], win(VW('nobody', 'nobody') - 0.1, VL('three').t0 - 0.1), 1460, 76);
  caption([{ t: 'forever', c: BP.mint, i: true }], win(VW('melt', 'forever') - 0.1, VL('name').t0 - 0.1), 1460, 80);
}
