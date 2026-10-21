
// =====================================================================
//  OVERLAYS — HUD, title, captions, the lightning bolt, the dark before the descent, end card
// =====================================================================
function lightIcon(x, y, s, a = 1) { if (a <= 0) return; const f = () => { ctx.save(); screen(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 46); g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, 'rgba(255,240,200,0.95)'); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 46, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,240,205,0.9)'; ctx.lineCap = 'round'; for (let i = 0; i < 16; i++) { const an = i / 16 * TAU, r0 = 30, r1 = i % 2 ? 62 : 78; ctx.lineWidth = i % 2 ? 2.5 : 4; ctx.beginPath(); ctx.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); ctx.lineTo(Math.cos(an) * r1, Math.sin(an) * r1); ctx.stroke(); }
  ctx.restore(); }; if (DEFER) DEFER.push(f); else f(); }
function hud(t) { if (t >= 72) return; const a = ev(0.2, 0.5) * (1 - ev(71.6, 0.4)) * (t >= 65.5 && t < 66.6 ? 0 : 1) * (1 - ss(67.4, 68.0, t)); let label, val, sub;
  if (t < T_BOLT) { label = 'Su regreso'; val = '¿?:¿?'; sub = 'Mateo 24:36'; }
  else if (t < 17) { label = 'Señal en el cielo'; val = 'de este a oeste'; sub = 'Mateo 24:27'; }
  else if (t < 34) { label = 'Lo están viendo'; val = '8.200 millones'; sub = 'Apocalipsis 1:7'; }
  else if (t < 40) { const h = Math.max(0, Math.round(risen(t, T_RISE + 0.3))); label = 'Altura'; val = `${h} m`; sub = 'Mateo 24:40'; }
  else if (t < 46) { label = 'Dolor'; val = t < T_CRUT + 0.5 ? '100 %' : '0 %'; sub = 'Apocalipsis 21:4'; }
  else if (t < 54) { label = 'El sol'; val = `${Math.round(100 * (1 - ss(47.5, 51, t)))} %`; sub = 'Mateo 24:29'; }
  else if (t < 61) { label = 'Resucitan'; val = 'los muertos'; sub = '1 Tesalonicenses 4:16'; }
  else if (t < 66.5) { label = 'Escapar'; val = 'imposible'; sub = 'Apocalipsis 6:15'; }
  else { label = 'Cristianos + musulmanes'; val = '4.300 millones'; sub = 'esperan este día'; }
  lightIcon(104, 735, 44, a); pvHud(label, val, sub, a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(150, Math.floor(100 * 770 / wmax)), lh = size * 1.12, y0 = 470;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  lightIcon(CX, 330, 110, a); if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; ctx.restore(); const size = Math.min(52, Math.floor(52 * 760 / w)); pvFeather(CX, 1374 + dy, 570, 120, a); pvText(str, CX, 1390 + dy, size, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(72.4, 0.7), b = ev(73.2, 0.8), c2 = ev(73.8, 0.8), d = ev(75.6, 0.7), e = ev(76.6, 0.6);
  const f = () => { fillAll('#121212');
    pvText('¿Qué pasaría si', CX, 560, 54, { align: 'center', alpha: a }); pvText('Jesús regresara?', CX, 634, 54, { align: 'center', alpha: a });
    pvText('Más de 4.300 millones', CX, 800, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b }); pvText('de cristianos y musulmanes', CX, 862, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b });
    pvText('esperan su regreso.', CX, 924, 44, { font: PV.sans, weight: 600, align: 'center', alpha: c2 });
    pvText('¿Estás listo?', CX, 1130, 64, { italic: true, align: 'center', alpha: d, color: '#f2d38a' });
    pvText('ALTERBASE.ESP', CX, 1480, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  lightIcon(CX, 430, 80, a); if (DEFER) DEFER.push(f); else f(); }
let BOLT = null;
function overlays(t) {
  if (t >= T_BOLT && t < 13.5) { BOLT = BOLT || boltPath(3); const grow = ss(T_BOLT, T_BOLT + 0.22, t), fl = t < 13.0 ? 1 : 1 - seg(t, 13.0, 13.5), flick = 0.75 + 0.25 * Math.sin(t * 90); drawBolt(BOLT, grow, fl * flick); }
  if (t >= 65.5 && t < 66.6) pvTint('#000000', 0.92 * ss(65.3, 65.6, t) * (1 - ss(66.45, 66.6, t)));
  if (t >= 66.5 && t < 67.0) pvTint('#fff8ea', 0.8 * (1 - seg(t, 66.5, 67.0)));
  if (t >= 72) endCard();
  hud(t);
  bigTitle(['¿Qué pasaría si', 'Jesús', 'regresara?'], 0.3, 3.8);
  capFit('Estás en una terraza de la plaza, al atardecer.', 4.2, 8.6);
  capFit('Nadie sabe el día ni la hora… pero imagina que es hoy.', 8.9, 12.3);
  capFit('Un relámpago cruza el cielo de este a oeste.', 13.6, 16.8);
  capFit('Y todo el planeta lo ve a la vez.', 17.4, 23.6);
  capFit('Unos caen de rodillas. Otros siguen grabando.', 24.4, 29.7);
  capFit('«Uno será tomado y el otro dejado.»', 30.4, 33.8);
  capFit('Y la gente empieza a subir al cielo.', 34.6, 39.7);
  capFit('Quien no podía caminar, camina. No más dolor.', 40.6, 45.7);
  capFit('«El sol se oscurecerá y las estrellas caerán del cielo.»', 46.6, 53.7);
  capFit('«Los muertos resucitarán primero.»', 54.6, 60.7);
  capFit('Los poderosos intentan huir. No hay adónde ir.', 61.4, 65.3);
  capFit('«Nadie sabe el día ni la hora.»', 67.2, 71.7);
}
