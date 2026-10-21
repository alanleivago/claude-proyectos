
// =====================================================================
//  OVERLAYS — title (with the water drop), HUD (drop + countdown), captions, the vanish shimmer, the return flash, end card
// =====================================================================
const fmtS = (s) => `${String(Math.floor(s)).padStart(2, '0')}.${String(Math.floor((s % 1) * 1000)).padStart(3, '0')}`;
function hud(t) { if (t >= 64) return; const a = ev(0.2, 0.5) * (1 - ev(63.6, 0.4));
  let label, val, sub = '';
  if (t < T_GONE) { label = 'El agua desaparece en'; val = fmtS(Math.max(0, T_GONE - t)); sub = 'superficie de la Tierra: 71 % agua'; }
  else if (t < T_BACK) { const s = Math.max(0, 5 * (1 - (t - T_GONE) / (T_BACK - T_GONE))); label = 'El agua vuelve en'; val = fmtS(s);
    sub = t < 15 ? 'tiempo 10 veces más lento' : t < 36 ? 'faltan: 1.386 millones de km³' : t < 50 ? 'cuerpo humano: cerca de 60 % agua' : 'todo vuelve a la vez'; }
  else { label = 'Agua'; val = 'DE VUELTA'; sub = 'cada gota en su lugar'; }
  dropIcon(92, 735, 46, a); pvHud(label, val, sub, a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(150, Math.floor(100 * 770 / wmax)), lh = size * 1.12, y0 = 470;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  dropIcon(CX, 330, 92, a); if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; ctx.restore(); const size = Math.min(52, Math.floor(52 * 760 / w)); pvFeather(CX, 1374 + dy, 570, 120, a); pvText(str, CX, 1390 + dy, size, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(64.4, 0.7), b = ev(65.0, 0.8), c2 = ev(65.6, 0.8), d = ev(67.6, 0.6), d2 = ev(68.6, 0.5), e = ev(69.2, 0.6);
  const f = () => { fillAll('#121212');
    pvText('¿Qué pasaría si toda el agua', CX, 560, 48, { align: 'center', alpha: a }); pvText('desapareciera durante 5 segundos?', CX, 628, 48, { align: 'center', alpha: a });
    pvText('Los océanos guardan el 96,5 %', CX, 800, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b }); pvText('del agua de la Tierra.', CX, 862, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b });
    pvText('Tu cuerpo es cerca de un 60 % agua.', CX, 950, 44, { font: PV.sans, weight: 600, align: 'center', alpha: c2 });
    pvText('y tranquilo, esto nunca pasará', CX, 1120, 50, { italic: true, align: 'center', alpha: d }); pvText('... o si?', CX, 1196, 58, { italic: true, align: 'center', alpha: d2 });
    pvText('ALTERBASE.ESP', CX, 1480, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  dropIcon(CX, 430, 70, a); if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= T_GONE && t < T_GONE + 0.35) pvTint('#d8f0ff', 0.45 * (1 - seg(t, T_GONE, T_GONE + 0.35)));
  if (t >= T_BACK - 0.5 && t < T_BACK) pvTint('#000000', 0.88);
  if (t >= T_BACK && t < T_BACK + 0.35) pvTint('#ffffff', 0.85 * (1 - seg(t, T_BACK, T_BACK + 0.35)));
  { const ti = T_BACK + WV.ARRIVE; if (t >= ti && t < ti + 0.25) pvTint('#ffffff', 0.95 * (1 - seg(t, ti, ti + 0.3))); }
  if (t >= 64) endCard();
  hud(t);
  bigTitle(['¿Qué pasaría si', 'toda el agua desapareciera', 'durante 5 segundos?'], 0.3, 3.3);
  capFit('Estás en un paseo junto al mar.', 3.5, 8.7);
  capFit('Toda el agua expuesta ha desaparecido.', 9.6, 14.8);
  capFit('Lagos y ríos desaparecen al instante.', 16.0, 21.7);
  capFit('Hasta el agua de tu vaso.', 22.6, 25.8);
  capFit('Incluso los océanos han desaparecido.', 27.6, 35.6);
  capFit('El agua es la mayor parte de tu cuerpo.', 36.6, 40.1);
  capFit('Sin ella, la vida no funciona.', 40.3, 43.8);
  capFit('Solo queda el agua dentro de los seres vivos.', 44.6, 49.7);
  capFit('Pero en cinco segundos… todo vuelve.', 50.6, 55.8);
  capFit('Y vuelve toda a la vez.', 59.4, 63.6);
}
