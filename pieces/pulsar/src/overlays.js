
// =====================================================================
//  OVERLAYS — HUD (nearest star / X-rays on Earth / ozone), title, captions, the flare's whiteout, end card
// =====================================================================
function starIcon(x, y, s, a = 1) { if (a <= 0) return; const f = () => { ctx.save(); screen(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s / 100, s / 100); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 50); g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, 'rgba(200,180,255,0.9)'); g.addColorStop(1, 'rgba(150,100,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 50, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(190,160,255,0.9)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-60, 40); ctx.lineTo(60, -40); ctx.stroke(); ctx.restore(); }; if (DEFER) DEFER.push(f); else f(); }
function hud(t) { if (t >= 71) return; const a = ev(0.2, 0.5) * (1 - ev(70.6, 0.4)); let label, val, sub;
  if (t < 16) { label = 'Estrella más cercana'; val = t < T_APPEAR ? '4,2 años luz' : '0,1 años luz'; sub = t < T_APPEAR ? 'Próxima Centauri' : 'un púlsar'; }
  else if (t < T_FLARE) { const s = state(t); label = 'Rayos X sobre la Tierra'; val = s.beam > 0.5 ? 'DESTELLO' : 'pulsando'; sub = `ozono: ${Math.round(100 - 13 * ss(24, 43, t))} %`; }
  else if (t < 59) { label = 'Erupción gigante'; val = t < 46 ? 'MAGNETAR' : 'ONDA DE CHOQUE'; sub = `ozono: ${Math.round(87 - 87 * ss(44, 52, t))} %`; }
  else { label = 'Ozono'; val = '0 %'; sub = t < 64 ? 'satélites: ninguno' : 'cielo marrón'; }
  starIcon(104, 735, 46, a); pvHud(label, val, sub, a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(150, Math.floor(100 * 770 / wmax)), lh = size * 1.12, y0 = 470;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  starIcon(CX, 330, 110, a); if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; ctx.restore(); const size = Math.min(52, Math.floor(52 * 760 / w)); pvFeather(CX, 1374 + dy, 570, 120, a); pvText(str, CX, 1390 + dy, size, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(71.4, 0.7), b = ev(72.0, 0.8), c2 = ev(72.6, 0.8), d = ev(74.4, 0.6), d2 = ev(75.4, 0.5), e = ev(76.0, 0.6);
  const f = () => { fillAll('#121212');
    pvText('¿Qué pasaría si un púlsar', CX, 560, 50, { align: 'center', alpha: a }); pvText('apareciera junto a la Tierra?', CX, 630, 50, { align: 'center', alpha: a });
    pvText('En 2004, un magnetar', CX, 800, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b }); pvText('a 50.000 años luz alteró', CX, 862, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b });
    pvText('la ionosfera de la Tierra.', CX, 924, 44, { font: PV.sans, weight: 600, align: 'center', alpha: c2 });
    pvText('y tranquilo, esto nunca pasará', CX, 1100, 50, { italic: true, align: 'center', alpha: d }); pvText('... o si?', CX, 1176, 58, { italic: true, align: 'center', alpha: d2 });
    pvText('ALTERBASE.ESP', CX, 1480, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  starIcon(CX, 430, 80, a); if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 43.0 && t < 44.0) pvTint('#000000', 0.35 * ss(43.0, 43.5, t));
  if (t >= T_FLARE && t < T_FLARE + 0.6) pvTint('#f4ecff', 0.95 * (1 - seg(t, T_FLARE + 0.2, T_FLARE + 0.6)));
  if (t >= T_SHOCK && t < T_SHOCK + 0.25) pvTint('#ffffff', 0.5 * (1 - seg(t, T_SHOCK, T_SHOCK + 0.25)));
  if (t >= 71) endCard();
  hud(t);
  bigTitle(['¿Qué pasaría si', 'un púlsar apareciera', 'junto a la Tierra?'], 0.3, 3.8);
  capFit('Estás en una feria junto al mar.', 4.2, 8.8);
  capFit('Apareció hace 36 días. Su luz llega esta noche.', 10.4, 15.8);
  capFit('Es un púlsar: una estrella muerta de unos 20 km.', 16.6, 22.4);
  capFit('Su haz de rayos X barre la Tierra cada 1,5 segundos.', 22.8, 28.0);
  capFit('Nada llega al suelo.', 28.4, 30.8);
  capFit('Pero cada destello se come un poco de ozono.', 31.0, 34.6);
  capFit('Y este púlsar es un magnetar.', 35.6, 42.8);
  capFit('En 0,2 s suelta tanta energía como el Sol en 250.000 años.', 45.4, 50.8);
  capFit('La onda de choque baja hasta el suelo.', 51.4, 54.6);
  capFit('Los cristales estallan en medio planeta.', 55.0, 58.8);
  capFit('Todos los satélites ya están muertos.', 59.6, 64.2);
  capFit('El cielo quedará marrón durante años.', 65.0, 70.6);
}
