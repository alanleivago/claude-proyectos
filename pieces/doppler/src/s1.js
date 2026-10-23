// =====================================================================
//  S1 — sound: the ambulance passes; rings; squeezed and stretched; what you hear; the numbers; the wall; the boom
// =====================================================================
function beatSound() {
  const aEnd = B0('light') + 0.2;
  // the opening: world fixed, the ambulance drives past the listener
  const pa = fadeOut(B0('wave') + 0.1, 0.4);
  if (pa > 0) {
    drawRings(0, pa, { mode: 'pass' });
    const x = passX(TT); drawAmbulance(x, Y0, pa);
    // the listener just below the road, and what reaches them: a pitch readout that drops as it passes
    const lx = X0, ly = Y0 + 230, ahead = x < lx;
    bpGlow(lx, ly, 50, ahead ? BP.mint : BP.magenta, pa * 0.6); bpDot(lx, ly, 16, '#ffffff', pa);
    OV(() => { bpText('you', lx, ly + 62, 38, BP.soft, { font: BP.mono, alpha: pa });
      const hz = ahead ? 767 : 644; bpText(`${hz} Hz`, 540, 1420, 96, ahead ? BP.mint : BP.magenta, { font: BP.mono, weight: 700, alpha: pa * fadeIn(1.0, 0.4), glow: 16 });
      bpText(ahead ? 'higher' : 'lower', 540, 1490, 44, BP.soft, { font: BP.mono, alpha: pa * fadeIn(1.0, 0.4) }); });
    ctx.save(); ctx.globalAlpha = pa * 0.5; ctx.strokeStyle = BP.dim; ctx.setLineDash([14, 14]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-100, Y0 + 50); ctx.lineTo(W + 100, Y0 + 50); ctx.stroke(); ctx.restore();
  }
  // from "Sound is a wave": the camera follows the source
  const fa = fadeIn(B0('wave'), 0.5) * fadeOut(aEnd, 0.5);
  if (fa > 0) {
    drawRings(B0('wave'), fa);
    const sup = TT >= HIT;
    drawAmbulance(X0, Y0, fa);
    // the shock wall: when the source catches its own sound, the fronts pile up; past it, a cone
    const wa = win(VW('pile', 'catches') - 0.2, aEnd, 0.3);
    if (wa > 0) {
      const r = Math.max(1.0001, ratioAt(TT)), th = Math.asin(1 / r), L = 1400;
      ctx.save(); ctx.globalAlpha = fa * wa; ctx.strokeStyle = BP.yellow; ctx.lineWidth = sup ? 7 : 6; ctx.shadowColor = BP.yellow; ctx.shadowBlur = 20;
      if (!sup) { ctx.beginPath(); ctx.moveTo(X0 + 70, Y0 - 420); ctx.lineTo(X0 + 70, Y0 + 420); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(X0 - Math.cos(th) * L, Y0 - Math.sin(th) * L); ctx.lineTo(X0 + 70, Y0); ctx.lineTo(X0 - Math.cos(th) * L, Y0 + Math.sin(th) * L); ctx.stroke(); }
      ctx.restore();
    }
  }
  // labels: squeezed / stretched
  const sa = win(VW('squeeze', 'squeezed') - 0.2, B0('hear'), 0.3) * fa;
  if (sa > 0) OV(() => { bpText('squeezed', 840, Y0 - 330, 48, BP.mint, { font: BP.mono, weight: 700, alpha: sa }); bpText('stretched', 240, Y0 - 330, 48, BP.magenta, { font: BP.mono, weight: 700, alpha: sa * fadeIn(VW('squeeze', 'stretched') - 0.2, 0.3) }); });
  // what you hear: received wave fronts per second
  const r = ratioAt(TT), f0 = 1 / PERIOD;
  const ha = win(VL('pitch').t0 - 0.2, VL('numbers').t0, 0.4) + win(VL('never').t0 + 0.2, B0('fast'), 0.4);
  pitchBar(1300, 'IN FRONT', f0 / Math.max(0.05, 1 - Math.min(r, 0.9)), BP.mint, ha);
  pitchBar(1420, 'BEHIND', f0 / (1 + r), BP.magenta, ha * fadeIn(VW('pitch', 'behind') - 0.2, 0.3));
  pitchBar(1180, 'THE SIREN', f0, BP.yellow, win(VL('never').t0 - 0.1, B0('fast'), 0.3));
  // the numbers
  const na = win(VL('numbers').t0 - 0.1, VL('never').t0 - 0.35, 0.3);
  if (na > 0) OV(() => {
    bpText('siren 700 Hz', 540, 360, 56, BP.yellow, { font: BP.mono, weight: 700, alpha: na });
    bpText('at 108 km/h', 540, 430, 44, BP.soft, { font: BP.mono, alpha: na * fadeIn(VW('numbers', 'hundred', 2) - 0.1, 0.3) });
    bpText('767 Hz', 820, 600, 64, BP.mint, { font: BP.mono, weight: 700, alpha: na * fadeIn(VW('numbers', 'seven', 2) - 0.1, 0.3) });
    bpText('644 Hz', 260, 600, 64, BP.magenta, { font: BP.mono, weight: 700, alpha: na * fadeIn(VW('numbers', 'six') - 0.1, 0.3) });
    // three notes down on a little keyboard
    const ka = na * fadeIn(VW('numbers', 'drop') - 0.2, 0.3); if (ka > 0) { const x0 = 330, w = 30;
      for (let i = 0; i < 14; i++) { const hi = i === 9 ? BP.mint : i === 6 ? BP.magenta : null; ctx.save(); ctx.globalAlpha = ka; ctx.fillStyle = hi || '#e4e3dc'; ctx.fillRect(x0 + i * w, 1440, w - 3, 90); ctx.restore(); }
      bpText('≈ 3 notes lower', 540, 1580, 44, BP.soft, { font: BP.mono, alpha: ka }); }
  });
  caption([{ t: 'Every single time.', c: BP.text, i: true }], win(VL('every').t0 - 0.05, VL('wave').t0), 400, 70);
  caption([{ t: 'a wave of pressure', c: BP.mint, i: true }], win(VW('wave', 'wave') - 0.2, VL('moving').t0), 400, 70);
  caption([{ t: 'the siren never changed', c: BP.yellow, i: true }], win(VL('never').t0 + 0.1, B0('fast'), 0.3), 400, 62);
  caption([{ t: 'as fast as its own sound?', c: BP.text, i: true }], win(VL('fast').t0, VL('pile').t0, 0.3), 400, 62);
  caption([{ t: 'a single wall', c: BP.yellow, i: true }], win(VW('pile', 'single') - 0.2, HIT - 0.45), 400, 80);
  OV(() => { const ma = win(HIT, B0('light'), 0.25); bpText('SONIC BOOM', 540, 400, 96, BP.yellow, { font: BP.mono, weight: 700, alpha: ma, glow: 24 }); bpText('Mach 1 ≈ 1,235 km/h', 540, 1440, 50, BP.soft, { font: BP.mono, alpha: ma * fadeIn(HIT + 0.6, 0.3) }); });
}
