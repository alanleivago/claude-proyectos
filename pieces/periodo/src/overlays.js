
// =====================================================================
//  OVERLAYS — the pain-level HUD (hour, a big number, ten segments), title, captions, end card
// =====================================================================
const PAIN = [[0, 1, 1], [3.6, 4, 1], [6, 4, 2], [11, 6, 4], [19, 7, 6], [26, 8, 9], [30, 8, 10], [34, 9, 12], [43, 10, 18], [50, 0, 24], [52.6, 11, 24]];
function painAt(t) { let p = PAIN[0]; for (const q of PAIN) if (t >= q[0]) p = q; return p; }
function hud(t) { if (t >= 56) return; const a = ev(0.2, 0.5) * (1 - ev(55.6, 0.4)), [, lv, hr] = painAt(t), shake = lv >= 9 ? 3 * Math.sin(t * 40) : 0;
  const f = () => { pvFeather(CX, 210, 380, 120, a * 0.85); pvText(`DOLOR MASCULINO · HORA ${hr}`, CX, 160, 26, { font: PV.sans, weight: 700, spacing: 4, align: 'center', alpha: a });
    const col = lv >= 10 ? '#ff4a3a' : lv >= 7 ? '#ff8a3a' : lv >= 4 ? '#ffc040' : '#e8e8e8'; pvText(lv > 10 ? '10+' : String(lv), CX + shake, 244, 84, { align: 'center', alpha: a, color: col });
    ctx.save(); screen(); ctx.globalAlpha = a; for (let i = 0; i < 10; i++) { ctx.fillStyle = i < lv ? (i >= 8 ? '#ff4a3a' : i >= 5 ? '#ff8a3a' : '#ffc040') : 'rgba(255,255,255,0.25)'; ctx.fillRect(CX - 190 + i * 38, 272, 30, 8); } ctx.restore(); };
  if (DEFER) DEFER.push(f); else f(); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(150, Math.floor(100 * 770 / wmax)), lh = size * 1.12, y0 = 520;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.3), 1 - ev(t1 - 0.25, 0.25));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; ctx.restore(); const size = Math.min(52, Math.floor(52 * 760 / w)); pvFeather(CX, 1374 + dy, 570, 120, a); pvText(str, CX, 1390 + dy, size, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(56.3, 0.6), b = ev(56.9, 0.7), d = ev(58.6, 0.6), d2 = ev(59.6, 0.5), e = ev(60.2, 0.6);
  const f = () => { fillAll('#121212');
    pvText('¿Qué pasaría si los hombres tuvieran', CX, 560, 44, { align: 'center', alpha: a }); pvText('el periodo durante 24 horas?', CX, 624, 44, { align: 'center', alpha: a });
    pvText('Una mujer tiene unas 450 reglas', CX, 800, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b }); pvText('a lo largo de su vida.', CX, 862, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b });
    pvText('y tranquilo, esto nunca pasará', CX, 1060, 50, { italic: true, align: 'center', alpha: d }); pvText('... o si?', CX, 1136, 58, { italic: true, align: 'center', alpha: d2 });
    pvText('ALTERBASE.ESP', CX, 1480, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 50.0 && t < 50.8) pvTint('#000000', 0.5 * ss(50.0, 50.3, t));
  if (t >= 56) endCard();
  hud(t);
  bigTitle(['¿Qué pasaría si', 'los hombres tuvieran el periodo', 'durante 24 horas?'], 0.3, 3.4);
  capFit('Hora 1. Empieza.', 3.7, 5.9);
  capFit('Todos los hombres. A la vez.', 6.6, 10.8);
  capFit('Un médico comparó los cólicos con un infarto.', 11.4, 15.0);
  capFit('Partido suspendido. Para siempre.', 15.4, 18.8);
  capFit('Las obras se paran en todo el país.', 19.6, 25.8);
  capFit('Analgésicos: agotados.', 26.6, 29.8);
  capFit('Chocolate: también.', 30.4, 33.8);
  capFit('Sesión de emergencia en el Parlamento.', 34.6, 38.2);
  capFit('Compresas gratis. Aprobado en 4 segundos.', 38.6, 42.8);
  capFit('Mientras tanto, las mujeres…', 43.6, 46.6);
  capFit('…tuvieron un martes normal.', 46.8, 49.8);
  capFit('Hora 24.', 50.4, 51.6);
  capFit('"No fue para tanto."', 53.2, 55.8);
}
