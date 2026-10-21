
// =====================================================================
//  OVERLAYS — title (with the two-suns icon), HUD (the time of day, suns in the sky), captions, end card
// =====================================================================
function sunsIcon(x, y, s, a = 1) { if (a <= 0) return; const f = () => { ctx.save(); screen(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  const g1 = ctx.createRadialGradient(-14, 0, 0, -14, 0, 46); g1.addColorStop(0, '#fffaf0'); g1.addColorStop(0.55, '#ffe6b0'); g1.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = g1; ctx.beginPath(); ctx.arc(-14, 0, 46, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.arc(-14, 0, 24, 0, TAU); ctx.fill();
  const g2 = ctx.createRadialGradient(30, -18, 0, 30, -18, 28); g2.addColorStop(0, '#ffb070'); g2.addColorStop(0.5, '#ff7a3a'); g2.addColorStop(1, 'rgba(255,120,60,0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(30, -18, 28, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ff9a5a'; ctx.beginPath(); ctx.arc(30, -18, 12, 0, TAU); ctx.fill(); ctx.restore(); }; if (DEFER) DEFER.push(f); else f(); }
const fmtH = (h) => { const hh = Math.floor(h), mm = Math.floor((h - hh) * 60), pm = hh >= 12, h12 = ((hh + 11) % 12) + 1; return `${h12}:${String(mm).padStart(2, '0')} ${pm ? 'PM' : 'AM'}`; };
function hud(t) { if (t >= 68) return; const a = ev(0.2, 0.5) * (1 - ev(67.6, 0.4)), h = hourAt(t), su = sunsAt(h), n = (su.elA > 0 ? 1 : 0) + (su.elB > 0 ? 1 : 0);
  let label = 'Hora', val = fmtH(h), sub = su.ecl > 0.5 ? 'un sol tapa al otro' : `soles en el cielo: ${n}`;
  if (t >= 62.5) { label = 'Atardecer'; val = 'DOS VECES'; sub = 'el cielo se apaga dos veces'; }
  sunsIcon(104, 735, 46, a); pvHud(label, val, sub, a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(150, Math.floor(100 * 770 / wmax)), lh = size * 1.12, y0 = 470;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  sunsIcon(CX, 330, 110, a); if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; ctx.restore(); const size = Math.min(52, Math.floor(52 * 760 / w)); pvFeather(CX, 1374 + dy, 570, 120, a); pvText(str, CX, 1390 + dy, size, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(68.4, 0.7), b = ev(69.0, 0.8), c2 = ev(69.6, 0.8), d = ev(71.0, 0.6), d2 = ev(72.0, 0.5), e = ev(72.6, 0.6);
  const f = () => { fillAll('#121212');
    pvText('¿Qué pasaría si la Tierra', CX, 560, 50, { align: 'center', alpha: a }); pvText('tuviera dos soles?', CX, 630, 50, { align: 'center', alpha: a });
    pvText('En 2011, la NASA encontró', CX, 800, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b }); pvText('un planeta con dos soles:', CX, 862, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b });
    pvText('Kepler-16b.', CX, 950, 44, { font: PV.sans, weight: 600, align: 'center', alpha: c2 });
    pvText('y tranquilo, esto nunca pasará', CX, 1120, 50, { italic: true, align: 'center', alpha: d }); pvText('... o si?', CX, 1196, 58, { italic: true, align: 'center', alpha: d2 });
    pvText('ALTERBASE.ESP', CX, 1480, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  sunsIcon(CX, 430, 80, a); if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 34.6 && t < 36.0) pvTint('#000000', 0.25 * ss(34.6, 35.4, t) * (1 - ss(35.8, 36.0, t)));
  if (t >= 68) endCard();
  hud(t);
  bigTitle(['¿Qué pasaría si', 'la Tierra tuviera', 'dos soles?'], 0.3, 3.8);
  capFit('Amanece sobre el desierto.', 4.2, 8.6);
  capFit('El primer sol es pequeño y naranja.', 9.0, 14.6);
  capFit('Luego sale el segundo.', 15.0, 19.4);
  capFit('Ahora todo tiene dos sombras.', 19.8, 25.4);
  capFit('Uno cálido. Otro brillante.', 25.8, 29.4);
  capFit('Al mediodía, el agua refleja dos soles.', 29.8, 34.4);
  capFit('Entonces, un sol pasa por delante del otro.', 36.2, 40.2);
  capFit('La luz baja. Las sombras se juntan.', 40.6, 45.4);
  capFit('Por la tarde, cambian de lugar.', 45.8, 51.4);
  capFit('El grande se pone primero, en dorado.', 51.8, 57.6);
  capFit('El pequeño se pone después, en rojo.', 58.0, 62.2);
  capFit('Planetas así existen de verdad.', 62.6, 67.6);
}
