
// =====================================================================
//  OVERLAYS — title (with the car icon), HUD (speed, altitude), captions, the quiet, end card
// =====================================================================
function hud(t) { if (t >= 66) return; const a = ev(0.2, 0.5) * (1 - ev(65.6, 0.4)); let label, val, sub = '';
  if (t < T_LAUNCH) { label = 'Tu nuevo coche'; val = 'ROADSTER'; sub = 'con propulsores de gas frío'; }
  else if (t < 14) { label = 'Velocidad'; val = `${speedKmh(t)} km/h`; sub = '0-97 km/h en 0,81 s · cifra de Tesla'; }
  else if (t < 32) { const y = t < 22 ? jumpPos(t).y : 55 + 25 * (t - 22) / 10; label = 'Altura'; val = `${Math.round(Math.max(0, y))} m`; sub = t < 22 ? 'propulsores: activos' : 'planeando'; }
  else if (t < 40) { const y = lerp(1300, 3200, EZ.io((t - 32) / 8)); label = 'Altura'; val = `${(y / 1000).toFixed(1).replace('.', ',')} km`; sub = 'atravesando las nubes'; }
  else if (t < 50) { const al = altKm(t); label = 'Altura'; val = `${Math.round(al)} km`; sub = al >= 100 ? 'línea de Kármán superada' : 'límite del espacio: 100 km'; }
  else { label = 'Altura'; val = 'ESPACIO'; sub = 'gravedad aparente: 0'; }
  carIcon(108, 738, 54, a); pvHud(label, val, sub, a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(150, Math.floor(100 * 770 / wmax)), lh = size * 1.12, y0 = 470;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  carIcon(CX, 330, 120, a); if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; ctx.restore(); const size = Math.min(52, Math.floor(52 * 760 / w)); pvFeather(CX, 1374 + dy, 570, 120, a); pvText(str, CX, 1390 + dy, size, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(66.4, 0.7), b = ev(67.0, 0.8), c2 = ev(67.6, 0.8), d = ev(69.6, 0.6), d2 = ev(70.6, 0.5), e = ev(71.2, 0.6);
  const f = () => { fillAll('#121212');
    pvText('¿Qué pasaría si tuvieras', CX, 560, 50, { align: 'center', alpha: a }); pvText('un Tesla Roadster?', CX, 630, 50, { align: 'center', alpha: a });
    pvText('En 2018, SpaceX lanzó un', CX, 800, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b }); pvText('Tesla Roadster al espacio.', CX, 862, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b });
    pvText('Todavía sigue dando vueltas al Sol.', CX, 950, 44, { font: PV.sans, weight: 600, align: 'center', alpha: c2 });
    pvText('y tranquilo, esto nunca pasará', CX, 1120, 50, { italic: true, align: 'center', alpha: d }); pvText('... o si?', CX, 1196, 58, { italic: true, align: 'center', alpha: d2 });
    pvText('ALTERBASE.ESP', CX, 1480, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  carIcon(CX, 430, 90, a); if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= T_MEET && t < T_MEET + 0.3) pvTint('#ffffff', 0.55 * (1 - seg(t, T_MEET, T_MEET + 0.3)));
  if (t >= 66) endCard();
  hud(t);
  bigTitle(['¿Qué pasaría si', 'tuvieras un', 'Tesla Roadster?'], 0.3, 3.4);
  capFit('Tu nuevo coche te espera en el garaje.', 3.6, 6.9);
  capFit('Es un Roadster… con propulsores.', 7.2, 8.6);
  capFit('De 0 a 97 km/h en menos de un segundo.', 9.0, 13.6);
  capFit('¿Tráfico?', 14.5, 16.9);
  capFit('Lo saltas.', 17.3, 21.6);
  capFit('Y si no frenas…', 22.5, 26.6);
  capFit('…puedes planear entre los edificios.', 26.9, 31.6);
  capFit('Más alto. Más allá de las nubes.', 32.6, 39.5);
  capFit('El cielo se vuelve negro.', 40.5, 45.0);
  capFit('A 100 km empieza el espacio.', 45.4, 49.7);
  capFit('Pero no estás solo.', 52.0, 55.8);
  capFit('Ese Roadster viaja por el espacio desde 2018.', 56.2, 59.8);
  capFit('Y sigue dando vueltas al Sol.', 60.3, 65.6);
}
