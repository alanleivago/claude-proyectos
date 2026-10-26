// =====================================================================
//  OVERLAYS — the HUD (day length, then sea level / air left / downhill), title, captions, the end card
// =====================================================================
const linK = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) { const [a, va] = K[i], [b, vb] = K[i + 1]; if (t < b) return lerp(va, vb, (t - a) / (b - a)); } return K[K.length - 1][1]; };
// day length in minutes, from the reference's counter (24 h → 84 min, where at the equator you would weigh nothing)
const DAY = [[0, 1440], [17, 1440], [19, 1439], [20, 1438], [24, 1433], [29, 1423], [30, 1419], [31, 1400], [32, 1354], [33, 1287], [34, 1208], [35, 1124], [36, 1040], [37, 960], [38, 890], [39, 829], [40, 781], [41, 743], [42, 711], [43, 680], [44, 649], [45, 615], [46, 578], [47, 550], [48, 501], [49, 462], [50, 422], [51, 382], [52, 339], [53, 295], [54, 254], [55, 220], [56, 193], [58, 150], [60, 127], [62, 107], [63.6, 84]];
const AIR = [[34, 100], [36, 85], [40, 40], [44, 13], [48, 4], [50, 1], [52, 0.5]];
const fmtDay = (m) => { m = Math.round(m); return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min'; };
function hud(t) { if (t >= 73.6 || (t >= 63.6 && t < 64)) return; const a = ev(0.2, 0.5) * (1 - ev(73.0, 0.5)); let label = 'Duración del día', val = fmtDay(linK(DAY, t)), sub;
  if (t < 17) sub = 'Brighton · Inglaterra';
  else if (t < 34) sub = 'nivel del mar −' + Math.round(-SEA(t)) + ' m';
  else if (t < 52) { const v = linK(AIR, t); sub = 'aire restante ' + (v < 1 ? '<1' : Math.round(v)) + ' %'; }
  else if (t < 64) sub = 'abajo apunta al sur';
  else { label = 'El ecuador'; val = 'Cuesta abajo'; sub = 'hacia el sur'; }
  pvHud(label, val, sub, a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(110, Math.floor(100 * 760 / wmax)), lh = size * 1.12, y0 = 520;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; let lines = [str];
    if (w > 760) { const mid = str.length / 2; let best = -1; for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; lines = [str.slice(0, best), str.slice(best + 1)]; }
    const size = Math.min(52, Math.floor(52 * 760 / Math.max(...lines.map((l) => ctx.measureText(l).width)))); ctx.restore(); const lh = size * 1.18, y0 = 1390 + dy - (lines.length - 1) * lh;
    pvFeather(CX, y0 - 16 + (lines.length - 1) * lh / 2, 570, 110 + (lines.length - 1) * 50, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { italic: true, align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(74.2, 0.6), b = ev(74.9, 0.7), c = ev(75.8, 0.7), g = ev(77.0, 0.7), h = ev(78.0, 0.6), e = ev(78.7, 0.5);
  const f = () => { fillAll('#121212'); pvText('¿Qué pasaría si la Tierra girara', CX, 560, 48, { align: 'center', alpha: a }); pvText('cada vez más rápido?', CX, 624, 48, { align: 'center', alpha: a });
    const mono = { font: '"Courier New", monospace', weight: 700, spacing: 1, align: 'center' };
    pvText('CON UN DÍA DE 84 MINUTOS, EN EL', CX, 790, 23, Object.assign({ alpha: b * 0.85 }, mono)); pvText('ECUADOR NO PESARÍAS NADA', CX, 830, 23, Object.assign({ alpha: b * 0.85 }, mono));
    pvText('EN REALIDAD LA TIERRA FRENA: EL DÍA', CX, 910, 23, Object.assign({ alpha: c * 0.85 }, mono)); pvText('SE ALARGA 1,7 MS POR SIGLO', CX, 950, 23, Object.assign({ alpha: c * 0.85 }, mono));
    pvText('Pero tranquilo, esto nunca sucederá…', CX, 1130, 42, { italic: true, align: 'center', alpha: g }); pvText('… ¿o sí?', CX, 1210, 60, { italic: true, align: 'center', alpha: h, color: '#f2d38a' }); pvText('ALTERBASE', CX, 1400, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (typeof skyOverlay === 'function') skyOverlay(t);
  if (typeof tiltOverlay === 'function') tiltOverlay(t);
  if (t >= 63.6 && t < 63.98) pvTint('#000000', 1);
  if (t >= 73.4 && t < 74) pvTint('#000000', ss(73.4, 74, t));
  if (t >= 74) endCard();
  hud(t);
  bigTitle(['¿Qué pasaría si la Tierra', 'girara cada vez', 'más rápido?'], 0.3, 4.6);
  capFit('Estás en un muelle en Brighton.', 5.2, 8.6);
  capFit('El giro de la Tierra decide dónde está el océano.', 10.2, 12.6);
  capFit('Entonces, el giro empieza a acelerar.', 13.0, 16.6);
  capFit('El océano empieza a deslizarse hacia el sur.', 17.4, 21.6);
  capFit('Todos los océanos van hacia el ecuador.', 22.4, 27.6);
  capFit('El océano ya está más allá del horizonte.', 28.4, 33.6);
  capFit('Cada día es más corto que el anterior.', 34.4, 39.6);
  capFit('El aire sigue al agua.', 40.3, 42.8);
  capFit('Cada respiración es más fina que en el Everest.', 43.2, 45.8);
  capFit('Es mediodía. El cielo es negro.', 46.4, 51.6);
  capFit('Abajo ya no es recto hacia abajo.', 52.4, 55.8);
  capFit('Todo se inclina hacia el sur.', 56.4, 59.8);
  capFit('Pesas menos.', 60.4, 63.5);
  capFit('Hasta la noria se suelta.', 64.4, 69.6);
  capFit('Y tú sigues agarrado.', 70.3, 73.4);
}
