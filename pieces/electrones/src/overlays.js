
// =====================================================================
//  OVERLAYS — title (with an atom icon), HUD (countdown / return), captions, flashes, end card
// =====================================================================
function atomIcon(x, y, s, a = 1, t = 0, gone = 0) { if (a <= 0) return; const f = () => { ctx.save(); screen(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(140,190,255,0.9)';
  for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(k * Math.PI / 3); ctx.beginPath(); ctx.ellipse(0, 0, 46, 16, 0, 0, TAU); ctx.stroke(); if (gone < 1) { const u = t * 2.2 + k * 2.1; ctx.fillStyle = `rgba(150,200,255,${1 - gone})`; ctx.beginPath(); ctx.arc(Math.cos(u) * 46, Math.sin(u) * 16, 6, 0, TAU); ctx.fill(); } ctx.restore(); }
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 14); g.addColorStop(0, '#ffd0c0'); g.addColorStop(1, '#e04a3a'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 12, 0, TAU); ctx.fill(); ctx.restore(); }; if (DEFER) DEFER.push(f); else f(); }
const fmtS = (s) => `${String(Math.floor(s)).padStart(2, '0')}.${String(Math.floor((s % 1) * 1000)).padStart(3, '0')}`;
function hud(t) { if (t >= 66) return; const a = ev(0.2, 0.5) * (1 - ev(65.6, 0.4)); let label, val, sub;
  if (t < T_GONE) { label = 'Los electrones desaparecen en'; val = fmtS(Math.max(0, Math.min(6, T_GONE - t))); sub = 'todo átomo tiene electrones'; }
  else if (t < T_BACK) { label = 'Vuelven en'; val = fmtS(Math.max(0, 5 * (1 - (t - T_GONE) / (T_BACK - T_GONE)))); sub = t < 27 ? 'cámara lenta ×12 · electrones: 0' : t < 41 ? 'carga de cada átomo: positiva' : 'la Tierra entera'; }
  else { label = 'Electrones'; val = 'DE VUELTA'; sub = t < T_BOOM ? 'cada uno en su sitio' : 'demasiado tarde'; }
  atomIcon(104, 735, 46, a, t, t >= T_GONE && t < T_BACK ? 1 : 0); pvHud(label, val, sub, a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(150, Math.floor(100 * 770 / wmax)), lh = size * 1.12, y0 = 470;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  atomIcon(CX, 330, 110, a, TT); if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; ctx.restore(); const size = Math.min(52, Math.floor(52 * 760 / w)); pvFeather(CX, 1374 + dy, 570, 120, a); pvText(str, CX, 1390 + dy, size, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(66.4, 0.7), b = ev(67.0, 0.8), c2 = ev(67.6, 0.8), d = ev(69.6, 0.6), d2 = ev(70.6, 0.5), e = ev(71.2, 0.6);
  const f = () => { fillAll('#121212');
    pvText('¿Qué pasaría si los electrones', CX, 560, 48, { align: 'center', alpha: a }); pvText('desaparecieran durante 5 segundos?', CX, 628, 48, { align: 'center', alpha: a });
    pvText('Los electrones son solo el 0,03 %', CX, 800, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b }); pvText('de tu masa.', CX, 862, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b });
    pvText('Pero sin ellos no existiría la química.', CX, 950, 42, { font: PV.sans, weight: 600, align: 'center', alpha: c2 });
    pvText('y tranquilo, esto nunca pasará', CX, 1120, 50, { italic: true, align: 'center', alpha: d }); pvText('... o si?', CX, 1196, 58, { italic: true, align: 'center', alpha: d2 });
    pvText('ALTERBASE.ESP', CX, 1480, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  atomIcon(CX, 430, 80, a, TT); if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= T_GONE && t < T_GONE + 0.3) pvTint('#dfeaff', 0.85 * (1 - seg(t, T_GONE, T_GONE + 0.3)));
  if (t >= T_BACK && t < T_BACK + 0.4) pvTint('#ffffff', 0.7 * (1 - seg(t, T_BACK, T_BACK + 0.4)));
  if (t >= 66) endCard();
  hud(t);
  bigTitle(['¿Qué pasaría si', 'los electrones desaparecieran', 'durante 5 segundos?'], 0.3, 3.8);
  capFit('Estás en una azotea, al atardecer.', 4.2, 9.6);
  capFit('La luz atraviesa todo.', 10.6, 13.2);
  capFit('Puedes ver las estrellas a través de tus manos.', 14.2, 19.6);
  capFit('Cada átomo es ahora pura carga positiva.', 20.6, 26.6);
  capFit('Y las cargas positivas se repelen.', 27.4, 33.6);
  capFit('Todo empieza a estallar.', 34.4, 39.6);
  capFit('La Tierra entera brilla.', 42.4, 49.6);
  capFit('Cada electrón vuelve a su sitio.', 56.8, 60.4);
  capFit('Pero sin nada que los sujete, también explotan.', 61.8, 65.6);
}
