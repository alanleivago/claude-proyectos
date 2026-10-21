// =====================================================================
//  SCENES — The Ship of Theseus (bitpix). One stage: the sea. World coords 1080x1920, TT on 1s.
//  Yellow = original matter, mint = new matter, magenta = the question.
// =====================================================================
const N_PL = 38, SEA_Y = 1000;
const SHIFT = -40;   // the stage sits left of the phone UI strip on the right (9:16 safe x 60–940)
const OV = (f) => { const g = () => { ctx.save(); ctx.translate(SHIFT, 0); f(); ctx.restore(); }; DEFER ? DEFER.push(g) : g(); };   // screen-space overlay (captions, tags)
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const win = (t0, t1, d = 0.35) => fadeIn(t0, d) * fadeOut(t1, d);   // visible in [t0, t1]

// ---- the plank schedule: which plank goes when (seeded order), accelerating to all 38
const PERM = (() => { const R = RNG('perm'), a = [...Array(N_PL).keys()]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R.f() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; })();
const REP = (() => {   // REP[plank] = the time it is replaced
  const t = [], a = VW('open', 'rotten') + 0.5, b = VW('more', 'another', 1) + 0.2, c = VW('more', 'another', 2) + 0.2;
  const s = c + 0.55, e = VL('more').t1 - 0.15;
  t.push(a, b, c);
  for (let i = 3; i < N_PL; i++) t.push(s + (e - s) * Math.pow((i - 3) / (N_PL - 4), 0.62));
  const out = []; PERM.forEach((p, i) => (out[p] = t[i])); return out;
})();
const ROT = (p) => Math.min(0.4, p === PERM[0] ? 0.9 : 0.22);   // the first plank rots slowly, on "rotten"
const replacedBy = (t) => REP.filter((x) => x <= t + 1e-6).length;
// the repairs of the centuries (Athens): mint planks that rot and are swapped again
const RE2 = (() => { const R = RNG('re2'), out = {}; const t0 = VL('athens').t0 + 1.0, t1 = VL('plut').t1; for (let i = 0; i < 9; i++) out[PERM[(i * 7 + 3) % N_PL]] = lerp(t0, t1, i / 8) + R.r(-0.1, 0.1); return out; })();

// ---- where the main ship (A) and the rebuilt ship (B) are
const SA = () => {
  const k1 = VW('hobbes', 'worse') - 0.1, k2 = VW('apart', 'apart');
  return {
    x: springTrack([[0, 540], [k1, 305], [HIT, 305]], SPRING.heavy),
    y: springTrack([[0, 860], [T2, 790], [k1, 860]], SPRING.heavy),
    s: springTrack([[0, 400], [T2, 370], [k1, 185]], SPRING.heavy),
  };
};
const SB = () => ({ x: 775, y: 860, s: 185 });
const REB = (i) => { const a = VW('rebuild', 'kept') + 0.1, b = VL('rebuild').t1 + 0.25; return lerp(a, b, Math.pow(PERM.indexOf(i) / (N_PL - 1), 0.8)); };   // old plank i lands on ship B

function rotC(base, u) { return bpMix(base, '#5a4a14', u); }

// ship A's plank i: yellow -> rots -> is torn out (a dark hole for a moment) -> a mint one drops in
const GAP = 0.22;
function plankA(i) {
  const tr = REP[i], rd = ROT(i);
  if (TT < tr) return { c: rotC(BP.yellow, EZ.io(seg(TT, tr - rd, tr))), dy: TT > tr - 0.12 ? Math.sin(TT * 90) * 2.5 : 0 };
  if (TT < tr + GAP) return { hide: true };
  let c = BP.mint, glow = 0;
  const t2 = RE2[i];
  if (t2 != null && TT > t2 - 0.4) c = TT < t2 ? rotC(BP.mint, seg(TT, t2 - 0.4, t2) * 0.8) : BP.mint;
  if (t2 != null && TT >= t2 && TT < t2 + 0.3) glow = 30 * (1 - seg(TT, t2, t2 + 0.3));
  if (TT < tr + GAP + 0.35) glow = 34 * (1 - seg(TT, tr + GAP, tr + GAP + 0.35));
  return { c, dy: springMove(tr + GAP, -240, 0, SPRING.snappy), a: fadeIn(tr + GAP, 0.1), glow };
}
// the torn plank: pried out of the hull with a spray of chips, then thrown up and off to the top right (kept, off stage)
function oldPlanksOut(sa) {
  const pl = bpPlanks(sa.x, sa.y, sa.s);
  pl.forEach((p, i) => {
    const tr = REP[i], u = seg(TT, tr, tr + 1.0); if (u <= 0 || u >= 1) return;
    const c = rotC(BP.yellow, 0.55), sg = i % 2 ? 1 : -1;
    bpChips(p.cx, p.cy, seg(TT, tr, tr + 0.7), bpMix(c, BP.yellow, 0.4), 'out' + i);
    const pry = EZ.o2(seg(TT, tr, tr + 0.14)), fly = EZ.i2(seg(TT, tr + 0.1, tr + 1.0));
    const x = lerp(p.cx, 1250 + (i % 5) * 30, fly), y = lerp(p.cy - 26 * pry, -140 - (i % 7) * 20, fly) - Math.sin(fly * Math.PI) * 140;
    bpSplinter(p.P, p.cx, p.cy, x, y, sg * (0.18 * pry + fly * 2.6), c, 1 - fly * 0.25, 1, 'o' + i);
  });
}
// ship B's plank i: the old ones, flying back in from the top right and landing
function plankB(i, sb) {
  const tl = REB(i);
  if (TT >= tl) return { c: BP.yellow, glow: TT < tl + 0.3 ? 28 * (1 - seg(TT, tl, tl + 0.3)) : 0 };
  return { hide: true };
}
function oldPlanksIn(sb) {
  const pl = bpPlanks(sb.x, sb.y, sb.s);
  pl.forEach((p, i) => {
    const tl = REB(i), u = seg(TT, tl - 0.75, tl); if (u <= 0 || u >= 1) return;
    const e = EZ.o2(u);
    const x = lerp(1250 + (i % 5) * 30, p.cx, e), y = lerp(-140 - (i % 7) * 20, p.cy, e) - Math.sin(u * Math.PI) * 160;
    bpSplinter(p.P, p.cx, p.cy, x, y, (1 - e) * (i % 2 ? 2.6 : -2.6), BP.yellow, 1, 1 - e, 'o' + i);
  });
}

// ---- the tag at the top (mono) and the caption block (serif): screen space
function topTag(str, a, c = BP.soft) { OV(() => bpText(str, 540, 322, 46, c, { font: BP.mono, alpha: a, spacing: 2 })); }
function caption(lines, a, y = 1360, size = 74, o = {}) { OV(() => bpLines(lines, 540, y, size, BP.text, a, o)); }

// =====================================================================
//  beats 1–4: the planks, Athens, Hobbes, which one?
// =====================================================================
function drawShips() {
  const sa = SA(), sb = SB();
  const end = HIT;                                                    // the ships burst into dots on the hit
  if (TT >= end) return;
  const nameA = win(VW('two', 'one', 1) - 0.1, VW('two', 'one', 2) - 0.2, 0.3), nameB = win(VW('two', 'one', 2) - 0.1, VL('two').t1 + 0.4, 0.3);
  if (nameA > 0) bpGlow(sa.x, sa.y - sa.s * 0.2, sa.s * 1.3, BP.mint, 0.22 * nameA);
  if (nameB > 0) bpGlow(sb.x, sb.y - sb.s * 0.2, sb.s * 1.3, BP.yellow, 0.22 * nameB);
  bpShip(sa.x, sa.y, sa.s, { c: TT < REP[PERM[N_PL - 1]] ? BP.yellow : BP.mint, rig: TT < VL('more').t1 ? BP.yellow : BP.mint, plank: plankA, phase: 0 });
  oldPlanksOut(sa);
  if (TT > VW('rebuild', 'kept') - 0.8) {
    const rigA = fadeIn(VL('rebuild').t1 - 0.3, 0.5);
    bpShip(sb.x, sb.y, sb.s, { c: BP.yellow, plank: (i) => plankB(i, sb), rigA, phase: 1.7 });
    oldPlanksIn(sb);
  }
}

function beatsShip() {
  const sa = SA();
  // counter under the ship
  const nRep = replacedBy(TT);
  const cA = win(0, T2 + 0.15);
  OV(() => {
    const s = `${String(nRep).padStart(2, ' ')} / 38`;
    bpText(s, 540, 1160, 92, nRep ? BP.mint : BP.soft, { font: BP.mono, alpha: cA, weight: 700 });
    bpText('planks replaced', 540, 1228, 44, BP.soft, { font: BP.mono, alpha: cA, spacing: 2 });
  });
  // beat 1 captions
  caption(['Is it still', { t: 'the same ship?', c: BP.text }], win(VW('open', 'is') - 0.1, VL('open').t1 + 0.35), 1360, 76);
  caption([{ t: 'the same thing?', c: BP.magenta, i: true }], win(VL('same').t0 - 0.05, VL('same').t1 + 0.6), 1380, 92);
  // beat 2: Athens, centuries of repair, Plutarch
  topTag('ATHENS', win(T2 + 0.1, T3 - 0.2));
  const tlA = win(VL('athens').t0 + 0.5, T3 - 0.1);
  if (tlA > 0) OV(() => bpTimeline(130, 950, 1140, seg(TT, VL('athens').t0 + 0.4, VL('plut').t1), 'back from Crete', 'c. 300 BC', BP.mint, tlA));
  const pA = win(VW('plut', 'arguing') - 0.2, T3 - 0.1);
  if (pA > 0) OV(() => {
    bpText('Plutarch · c. 100 AD', 540, 1330, 44, BP.soft, { font: BP.mono, alpha: pA });
    const u = EZ.back(seg(TT, VW('plut', 'arguing') - 0.2, VW('plut', 'arguing') + 0.15));
    bpPill('same ship', 330, 1430, 46, BP.mint, pA * clamp(u * 3));
    const v = EZ.back(seg(TT, VW('plut', 'about') - 0.1, VW('plut', 'about') + 0.25));
    bpPill('not the same', 740, 1430, 46, BP.magenta, pA * clamp(v * 3));
  });
  const oA = win(VW('athens', 'theseus') - 0.1, VL('plut').t0 + 0.2, 0.25);
  if (oA > 0) OV(() => bpPill('a 30-oared galley', 540, 440, 42, BP.yellow, oA * clamp(EZ.back(seg(TT, VW('athens', 'theseus') - 0.1, VW('athens', 'theseus') + 0.2)) * 2)));
  // beat 3: Hobbes
  topTag('1655 · THOMAS HOBBES', win(T3 + 0.1, T4 + 0.2));
  const lab = win(VW('two', 'one', 1) - 0.1, HIT - 0.05, 0.25);
  const la1 = win(VW('two', 'one', 1) - 0.1, HIT - 0.05, 0.25), la2 = win(VW('two', 'one', 2) - 0.1, HIT - 0.05, 0.25);
  if (lab > 0) OV(() => {
    bpLines(['not a splinter', 'of the original'], 305, 1110, 44, BP.mint, la1, { font: BP.mono });
    bpLines(['the original,', 'whole'], 775, 1110, 44, BP.yellow, la2, { font: BP.mono });
    ctx.save(); ctx.globalAlpha = Math.min(la1, 1) * 0.6; ctx.setLineDash([10, 12]); ctx.strokeStyle = BP.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(540, 470); ctx.lineTo(540, 1260); ctx.stroke(); ctx.restore();
  });
  // beat 4: which one?
  const qa = win(VL('which').t0 - 0.05, HIT - 0.1, 0.2);
  if (qa > 0) OV(() => {
    bpText('Which one is', 540, 1350, 80, BP.magenta, { italic: true, alpha: qa });
    bpText('the ship of Theseus?', 540, 1445, 80, BP.magenta, { italic: true, alpha: qa, frac: seg(TT, VW('which', 'ship') - 0.1, VL('which').t1) * 0.6 + 0.4 });
  });
}
