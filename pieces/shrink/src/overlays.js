// =====================================================================
//  OVERLAYS — the height HUD, title, captions, the end card
// =====================================================================
const sig3 = (v) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)).replace('.', ',');
function fmtH(m) { if (m >= 1) return sig3(m) + ' m'; if (m >= 0.01) return sig3(m * 100) + ' cm'; if (m >= 0.001) return sig3(m * 1000) + ' mm'; if (m >= 1e-6) return sig3(m * 1e6) + ' µm'; return sig3(m * 1e9) + ' nm'; }
function hud(t) { if (t >= 57.5) return; const a = ev(0.2, 0.5) * (1 - ev(57.0, 0.4));
  pvHud('Altura', fmtH(HGT(t)), 'la mitad cada 2 segundos', a); }
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
function endCard() { const a = ev(57.55, 0.4), b = ev(58.0, 0.5), g = ev(58.9, 0.5), h = ev(59.6, 0.4), e = ev(60.1, 0.4);
  const f = () => { fillAll('#121212'); pvText('¿Qué pasaría si te encogieras', CX, 560, 48, { align: 'center', alpha: a }); pvText('a la mitad cada 2 segundos?', CX, 624, 48, { align: 'center', alpha: a });
    const mono = { font: '"Courier New", monospace', weight: 700, spacing: 1, align: 'center' };
    pvText('EN 60 SEGUNDOS SERÍAS UNAS', CX, 800, 23, Object.assign({ alpha: b * 0.85 }, mono)); pvText('1.000 MILLONES DE VECES MÁS PEQUEÑO', CX, 840, 23, Object.assign({ alpha: b * 0.85 }, mono));
    pvText('Pero tranquilo, esto nunca sucederá…', CX, 1030, 42, { italic: true, align: 'center', alpha: g }); pvText('… ¿o sí?', CX, 1110, 60, { italic: true, align: 'center', alpha: h, color: '#f2d38a' }); pvText('ALTERBASE', CX, 1300, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 51.6 && t < 51.98) pvTint('#000000', 1);
  if (t >= 57.2 && t < 57.5) pvTint('#000000', ss(57.2, 57.5, t));
  if (t >= 57.5) { endCard(); return; }
  hud(t);
  bigTitle(['¿Qué pasaría si te', 'encogieras a la mitad', 'cada 2 segundos?'], 0.2, 2.8);
  capFit('Y vuelve a encogerse…', 2.9, 4.0);
  capFit('El sofá ahora es una montaña.', 4.4, 7.8);
  capFit('El gato cree que es un juguete.', 8.3, 10.8);
  capFit('Una moneda es un muro gigante.', 11.4, 15.8);
  capFit('Una pulga del gato es un monstruo.', 16.3, 19.8);
  capFit('El pelo del gato es una selva.', 20.3, 23.8);
  capFit('Hay ácaros por todas partes.', 24.3, 27.8);
  capFit('Un grano de sal es un bloque gigante.', 28.3, 30.8);
  capFit('Cae en una gota de leche…', 31.3, 35.8);
  capFit('…llena de bacterias.', 36.3, 39.8);
  capFit('Aterriza en una célula grande como un planeta.', 40.3, 43.8);
  capFit('Los virus son del tamaño de rocas.', 44.3, 47.8);
  capFit('Dentro… un mundo de moléculas.', 48.3, 51.5);
  capFit('El ADN: el código de la vida.', 52.3, 55.8);
  capFit('Ya solo mide unos pocos átomos.', 56.1, 57.4);
}
