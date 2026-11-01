// =====================================================================
//  OVERLAYS — the height HUD (with what she is taller than), title, captions, the end card
// =====================================================================
const sig3 = (v) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)).replace('.', ',');
const thou = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
function fmtH(m) { if (m < 1000) return sig3(m) + ' m'; const km = m / 1000; return (km < 100 ? sig3(km) : thou(km)) + ' km'; }
const CMP = [[30, 'más larga que una ballena azul'], [93, 'más alta que la Estatua de la Libertad'], [330, 'más alta que la Torre Eiffel'], [828, 'más alta que el Burj Khalifa'], [8849, 'más alta que el Everest'], [100e3, 'la cabeza por encima de la línea de Kármán'], [408e3, 'más alta que la órbita de la Estación Espacial'], [12742e3, 'más grande que la Tierra'], [384400e3, 'más alta que la distancia a la Luna']];
function cmpOf(h) { let s = 'altura normal'; CMP.forEach(([v, txt]) => { if (h >= v) s = txt; }); return s; }
function hud(t) { if (t >= 57) return; const a = ev(0.2, 0.5) * (1 - ev(56.5, 0.4)), h = HGT(t);
  pvHud('Tu altura', fmtH(h), cmpOf(h), a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(100, Math.floor(100 * 760 / wmax)), lh = size * 1.12, y0 = 500;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.3), 1 - ev(t1 - 0.25, 0.25));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; let lines = [str];
    if (w > 760) { const mid = str.length / 2; let best = -1; for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; lines = [str.slice(0, best), str.slice(best + 1)]; }
    const size = Math.min(52, Math.floor(52 * 760 / Math.max(...lines.map((l) => ctx.measureText(l).width)))); ctx.restore(); const lh = size * 1.18, y0 = 1390 + dy - (lines.length - 1) * lh;
    pvFeather(CX, y0 - 16 + (lines.length - 1) * lh / 2, 570, 110 + (lines.length - 1) * 50, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { italic: true, align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(57.05, 0.4), b = ev(57.5, 0.5), g = ev(58.4, 0.5), h = ev(59.0, 0.4), e = ev(59.4, 0.4);
  const f = () => { fillAll('#121212'); pvText('¿Qué pasaría si duplicaras', CX, 560, 48, { align: 'center', alpha: a }); pvText('tu tamaño cada 2 segundos?', CX, 624, 48, { align: 'center', alpha: a });
    const mono = { font: '"Courier New", monospace', weight: 700, spacing: 1, align: 'center' };
    pvText('A 1 MILLÓN DE KM DE ALTURA, UN GOLPE', CX, 790, 23, Object.assign({ alpha: b * 0.85 }, mono)); pvText('EN EL PIE TARDARÍA UNOS 100 DÍAS', CX, 830, 23, Object.assign({ alpha: b * 0.85 }, mono)); pvText('EN LLEGAR A TU CEREBRO', CX, 870, 23, Object.assign({ alpha: b * 0.85 }, mono));
    pvText('Pero tranquilo, esto nunca sucederá…', CX, 1030, 42, { italic: true, align: 'center', alpha: g }); pvText('… ¿o sí?', CX, 1110, 60, { italic: true, align: 'center', alpha: h, color: '#f2d38a' }); pvText('ALTERBASE', CX, 1300, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 51.6 && t < 51.98) pvTint('#000000', 1);
  if (t >= 56.7 && t < 57) pvTint('#000000', ss(56.7, 57, t));
  if (t >= 57) { endCard(); return; }
  hud(t);
  bigTitle(['¿Qué pasaría si', 'duplicaras tu tamaño', 'cada 2 segundos?'], 0.2, 2.9);
  capFit('Al principio, la gente solo mira.', 3.2, 4.9);
  capFit('Luego, salen corriendo.', 5.2, 7.9);
  capFit('Los coches se vuelven juguetes.', 8.2, 10.9);
  capFit('Los edificios se derrumban a tus pies.', 11.2, 14.9);
  capFit('15 segundos: tan alta como la Torre Eiffel.', 15.2, 17.9);
  capFit('Más alta que el Burj Khalifa.', 18.2, 19.9);
  capFit('Las nubes llegan a tus rodillas.', 20.2, 23.9);
  capFit('Más alta que el Everest. Los aviones te esquivan.', 24.2, 27.9);
  capFit('Tu cabeza supera el 99 % del aire.', 28.2, 30.9);
  capFit('31 segundos: tu cabeza está en el espacio.', 31.2, 33.9);
  capFit('La Estación Espacial pasa frente a tus ojos.', 34.2, 37.9);
  capFit('La Tierra se curva bajo tus pies.', 38.2, 40.9);
  capFit('Un paso cruzaría un país entero.', 41.2, 45.9);
  capFit('Ahora eres más grande que la Tierra.', 46.2, 48.9);
  capFit('Los satélites rodean tus piernas como moscas.', 49.2, 51.5);
  capFit('La Luna está a 384.400 km…', 52.2, 54.6);
  capFit('…podrías tocarla.', 54.8, 56.9);
}
