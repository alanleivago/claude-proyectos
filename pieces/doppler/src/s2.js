// =====================================================================
//  S2 — light: red and blue; spectra; Andromeda; the receding galaxies (1929); the end; stage, camera, cues
// =====================================================================
// a spectrum strip with three absorption lines; shift (−1 blue .. +1 red) slides the lines
function spectrum(y, label, shift, a) {
  if (a <= 0) return;
  const x0 = 170, x1 = 910, g = ctx.createLinearGradient(x0, 0, x1, 0);
  ['#6a3cff', '#3d7bff', '#22d3ee', '#1fffa9', '#ffd426', '#ff8a1f', '#ff2d55'].forEach((c, i, A) => g.addColorStop(i / (A.length - 1), c));
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x0, y - 30, x1 - x0, 60);
  ctx.fillStyle = '#0b1014'; for (const p of [0.22, 0.48, 0.71]) { const x = lerp(x0, x1, p + shift * 0.09); ctx.fillRect(x - 4, y - 30, 8, 60); }
  ctx.restore();
  OV(() => bpText(label, x0, y - 46, 32, BP.soft, { font: BP.mono, align: 'left', alpha: a }));
}
function galaxy(x, y, s, a, rot = 0) {
  for (let i = 0; i < 70; i++) { const R = RNG('gx', i), arm = i % 2, tt = i / 70 * 3.2, r = s * (0.15 + tt * 0.3), an = rot + arm * Math.PI + tt * 1.6 + R.r(-0.2, 0.2);
    bpDot(x + Math.cos(an) * r, y + Math.sin(an) * r * 0.6, R.r(1.5, 3.2) * (s / 60), i % 5 ? '#ffe9b0' : BP.azure, a * 0.85); }
  bpGlow(x, y, s * 0.8, '#ffe9b0', a * 0.6);
}
function beatLight() {
  const a = win(B0('light'), B0('galaxies') + 0.3, 0.5); if (a <= 0) return;
  // the rings again, now light: blue ahead, red behind; the source a star
  drawRings(B0('light'), a * fadeOut(VL('andro').t0, 0.5), { ahead: '#4d8dff', behind: '#ff3d5a' });
  const sa = a * fadeOut(VL('andro').t0, 0.5); bpGlow(X0, Y0, 90, '#fff2c0', sa * 0.8); bpDot(X0, Y0, 18, '#ffffff', sa);
  OV(() => { const la = win(VW('shift', 'red') - 0.2, VL('andro').t0, 0.3) * a; bpText('red', 240, Y0 - 330, 52, '#ff3d5a', { font: BP.mono, weight: 700, alpha: la });
    bpText('blue', 840, Y0 - 330, 52, '#4d8dff', { font: BP.mono, weight: 700, alpha: la * fadeIn(VW('shift', 'blue') - 0.2, 0.3) }); });
  // spectra: at rest vs observed
  const shiftNow = TT < VW('shift', 'closer') ? 1 : -1;
  spectrum(1300, 'at rest', 0, a * fadeIn(VW('shift', 'stretched') - 0.3, 0.4));
  spectrum(1440, 'observed', EZ.io(seg(TT, VW('shift', 'stretched'), VW('shift', 'red'))) * shiftNow, a * fadeIn(VW('shift', 'stretched') - 0.3, 0.4));
  // Andromeda approaching: blue
  const aa = win(VL('andro').t0 - 0.2, B0('galaxies') + 0.3, 0.4) * a;
  if (aa > 0) { const s = lerp(60, 150, EZ.io(seg(TT, VL('andro').t0, VL('andro').t1))); galaxy(540, 760, s, aa, TT * 0.2);
    OV(() => { bpText('Andromeda', 540, 470, 64, '#4d8dff', { italic: true, alpha: aa }); bpText('~300 km/s toward us · measured 1912', 540, 1060, 36, BP.soft, { font: BP.mono, alpha: aa }); }); }
}
// the galaxies: all receding from us, faster the farther (Hubble, 1929)
const GAL = (() => { const R = RNG('gals'), G = []; for (let i = 0; i < 38; i++) { const an = R.r(0, TAU), d = R.r(120, 470); G.push({ an, d, s: R.r(14, 26), rot: R.r(0, TAU) }); } return G; })();
function beatCosmos() {
  const a = win(B0('galaxies'), B0('end') + 0.3, 0.5); if (a <= 0) return;
  const cx = 540, cy = 860, grow = 1 + 0.06 * (TT - B0('galaxies'));
  bpGlow(cx, cy, 40, BP.mint, a * 0.8); bpDot(cx, cy, 10, BP.mint, a);
  OV(() => bpText('us', cx, cy + 50, 34, BP.mint, { font: BP.mono, alpha: a }));
  const arr = fadeIn(VW('galaxies', 'moving') - 0.2, 0.4), hub = fadeIn(VW('year', 'nineteen') - 0.1, 0.4);
  GAL.forEach((g, i) => {
    const d = g.d * grow, x = cx + Math.cos(g.an) * d, y = cy + Math.sin(g.an) * d * 1.25;
    galaxy(x, y, g.s, a * clamp(seg(TT, B0('galaxies') + i * 0.02, B0('galaxies') + 0.4 + i * 0.02)), g.rot);
    const L = (30 + 0.22 * g.d * (0.4 + 0.6 * hub)) * arr;   // arrow length ∝ distance once 1929 is named
    if (L > 2) { const ux = Math.cos(g.an), uy = Math.sin(g.an) * 1.25, n = Math.hypot(ux, uy); line(x + ux / n * 20, y + uy / n * 20, x + ux / n * (20 + L), y + uy / n * (20 + L), '#ff3d5a', 3, a * arr); }
  });
  topTag('1929 · HUBBLE', hub * a);
  caption([{ t: 'all shifted red', c: '#ff3d5a', i: true }], win(VW('galaxies', 'red') - 0.2, VL('year').t0, 0.3) * a, 1460, 66);
  caption([{ t: 'farther = faster', c: BP.yellow, i: true }], win(VW('year', 'universe') - 0.2, B0('end') + 0.2, 0.3) * a, 1460, 66);
}
function beatEnd() {
  if (TT < B0('end')) return;
  const a = fadeIn(B0('end'), 0.6);
  drawRings(B0('end'), a); drawAmbulance(X0, Y0, a);
  caption([{ t: 'the same trick', c: BP.text }, { t: 'the universe is growing', c: BP.mint, i: true }], fadeIn(VL('end').t0 + 0.3, 0.4) * fadeOut(VL('end').t1 + 0.1, 0.25), 400, 62);
  const tS = VL('end').t1 + 0.15, sa = fadeIn(tS, 0.2);
  if (sa > 0) OV(() => {
    ctx.save(); ctx.font = `700 72px ${BP.mono}`; const w1 = ctx.measureText('Bit').width, w = ctx.measureText('Bitstory').width; ctx.restore();
    const n = Math.round(8 * seg(TT, tS, tS + 0.6)), xs = 540 - w / 2;
    bpText('Bit'.slice(0, n), xs, 1482, 72, BP.mint, { font: BP.mono, weight: 700, align: 'left', alpha: sa, glow: 18 });
    if (n > 3) bpText('story'.slice(0, n - 3), xs + w1, 1482, 72, BP.magenta, { font: BP.mono, weight: 700, align: 'left', alpha: sa, glow: 18 });
    if (n < 8 || Math.floor(TT * 2.5) % 2) { ctx.save(); ctx.globalAlpha = sa; ctx.fillStyle = BP.text; ctx.font = `700 72px ${BP.mono}`; const cw = ctx.measureText('Bitstory'.slice(0, n)).width; ctx.fillRect(xs + cw + 6, 1426, 30, 64); ctx.restore(); }
  });
}
function sceneStage() {
  bpGround();
  for (let i = 0; i < 26; i++) { const R = RNG('mote', i), x = mod(R.r(0, W) + TT * R.r(-8, 8), W), y = mod(R.r(0, H) - TT * R.r(4, 14), H); bpDot(x, y, R.r(1.5, 3), BP.dim, 0.35 + 0.25 * Math.sin(TT * R.r(0.5, 1.5) + i)); }
  beatSound(); beatLight(); beatCosmos(); beatEnd();
  const fl = 1 - seg(TT, HIT, HIT + 0.35);
  if (fl > 0 && fl < 1) OV(() => { ctx.save(); ctx.globalAlpha = 0.5 * fl * fl; ctx.fillStyle = BP.yellow; ctx.fillRect(-100, 0, W + 200, H); ctx.restore(); });
}
function pieceCam(era, t) {
  const hold = (t0, t1, amt) => amt * EZ.io(seg(t, t0, t1)) * (1 - EZ.io(seg(t, t1, t1 + 0.6)));
  const shake = t > HIT && t < HIT + 0.6 ? Math.sin(t * 90) * 10 * (1 - seg(t, HIT, HIT + 0.6)) : 0;
  const z = 1 + hold(VL('squeeze').t0, VL('pitch').t1, 0.16) + hold(VL('numbers').t0, VL('numbers').t1, 0.14) + hold(VL('shift').t0, VL('andro').t0, 0.12) + hold(VL('end').t0, DURATION, -0.12)
    + hold(VL('wave').t0, B0('moving'), 0.08) + hold(VL('never').t0, B0('fast'), 0.08) + hold(VL('fast').t0, HIT, 0.12) + hold(VL('year').t0, B0('end'), 0.1) + 0.01 * Math.sin(t * 0.4);
  const pan = Math.sin(t * 0.33) * 46 * seg(t, B0('wave'), B0('wave') + 1);
  return camOf({ z, p: [540 + pan, 900], to: [540 + shake, 900] });
}
window.SFX_CUES = (() => {
  const C2 = [], add = (id, t, pan = 0) => C2.push({ id, t: +t.toFixed(3), pan });
  add('siren', 0.2); add('pass', VW('open', 'passes'));
  for (let k = Math.ceil(B0('wave') / PERIOD); k * PERIOD < VL('moving').t0; k++) add('pulse', k * PERIOD);
  add('squeeze', VW('squeeze', 'squeezed') - 0.1); add('stretch', VW('squeeze', 'stretched') - 0.1);
  add('ticks', VL('pitch').t0); add('num', VW('numbers', 'seven', 2) - 0.1); add('num2', VW('numbers', 'six') - 0.1);
  add('riser', VL('fast').t0 + 0.4);
  add('hit', HIT);
  add('light', VL('light').t0); add('andro', VL('andro').t0); add('gals', VW('galaxies', 'moving') - 0.2); add('year', VW('year', 'nineteen') - 0.1);
  add('siren', B0('end') + 0.1);
  const tS = VL('end').t1 + 0.15; for (let i = 0; i < 8; i++) add('key' + i, tS + (i + 0.5) * 0.6 / 8, -0.2 + i * 0.05);
  return C2.sort((a, b) => a.t - b.t);
})();
