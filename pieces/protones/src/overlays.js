
// =====================================================================
//  OVERLAYS — the protons-gone look (2D: the frame inverted to magenta), the flashes, HUD, title, captions, card
// =====================================================================
let INV = null;
function invertMagenta(k) { if (k <= 0) return; if (!INV) { INV = document.createElement('canvas'); INV.width = W; INV.height = H; }
  const x = INV.getContext('2d'); x.filter = 'invert(1) hue-rotate(150deg) saturate(1.6) contrast(1.15)'; x.clearRect(0, 0, W, H); x.drawImage(ctx.canvas, 0, 0); x.filter = 'none';
  x.globalCompositeOperation = 'multiply'; x.fillStyle = '#ff5a9a'; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'screen'; x.fillStyle = 'rgba(90,0,40,0.35)'; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over';
  ctx.save(); screen(); ctx.globalAlpha = k; ctx.drawImage(INV, 0, 0); ctx.restore();
  // a soft glow on the bright edges
  bloom(0.45 * k); }
const fmtS = (s) => `${String(Math.floor(s)).padStart(2, '0')}.${String(Math.floor((s % 1) * 1000)).padStart(3, '0')}`;
function hud(t) { if (t < 4.2 || t >= 66) return; const a = ev(4.2, 0.5) * (1 - ev(65.6, 0.4));
  let label, val, sub = '';
  if (t < T_GONE) { label = 'Los protones desaparecen en'; val = fmtS(Math.max(0, 6 - (t - 4) )); sub = 'cada átomo tiene al menos uno'; }
  else if (t < T_BACK) { const s = Math.max(0, 5 * (1 - (t - T_GONE) / (T_BACK - T_GONE))); label = 'Vuelven en'; val = fmtS(s);
    sub = t < 20 ? 'cámara lenta ×12 · protones en tu cuerpo: 0' : t < 30 ? `escala · ${t < 21.2 ? '1 milímetro' : t < 23.3 ? '10 micras' : t < 24.6 ? '1 nanómetro' : t < 26.2 ? '0,1 nanómetros' : '10 femtómetros'}` : t < 38 ? 'número atómico de todo: 0' : t < 48 ? `altitud · ${t < 40 ? '50 m' : t < 41.3 ? '400 m' : t < 42.5 ? '2,5 km' : '12.000 km'}` : 'los últimos 100 milisegundos'; }
  else { label = 'Protones'; val = 'DE VUELTA'; sub = 'en el parque · 5 segundos después'; }
  pvHud(label, val, sub, a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(150, Math.floor(100 * 770 / wmax)), lh = size * 1.12, y0 = 430;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 150 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; ctx.restore(); const size = Math.min(52, Math.floor(52 * 760 / w)); pvFeather(CX, 1374 + dy, 570, 120, a); pvText(str, CX, 1390 + dy, size, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(66.4, 0.7), b = ev(67.0, 0.8), c2 = ev(67.6, 0.8), d = ev(69.4, 0.6), d2 = ev(70.4, 0.5), e = ev(71.0, 0.6);
  const f = () => { fillAll('#121212');
    pvText('¿Qué pasaría si los protones', CX, 560, 48, { align: 'center', alpha: a }); pvText('desaparecieran durante 5 segundos?', CX, 628, 48, { align: 'center', alpha: a });
    pvText('Los protones son cerca de la mitad', CX, 800, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b }); pvText('de la masa de tu cuerpo.', CX, 862, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b });
    pvText('Su número decide qué es cada átomo.', CX, 950, 44, { font: PV.sans, weight: 600, align: 'center', alpha: c2 });
    pvText('y tranquilo, esto nunca pasará', CX, 1120, 50, { italic: true, align: 'center', alpha: d }); pvText('... o si?', CX, 1196, 58, { italic: true, align: 'center', alpha: d2 });
    pvText('ALTERBASE.ESP', CX, 1480, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  const key = shotAt(t)[0], tint = key === 'zoom' || (key === 'rise' && t >= 42.5); if (goneK(t)) { if (tint) pvTint('#ff2a8a', key === 'zoom' ? 0.6 : 0.85, 'color'); else invertMagenta(1); }
  if (t >= T_GONE && t < T_GONE + 0.25) pvTint('#ffffff', 0.8 * (1 - seg(t, T_GONE, T_GONE + 0.25)));
  if (t >= T_BACK && t < T_BACK + 0.4) pvTint('#ffffff', 0.9 * (1 - seg(t, T_BACK, T_BACK + 0.4)));
  if (t >= T_BACK - 0.5 && t < T_BACK) pvTint('#000000', 0.9);
  if (t >= 66) endCard();
  hud(t);
  bigTitle(['¿Qué pasaría si', 'los protones desaparecieran', 'durante 5 segundos?'], 0.3, 4.2);
  capFit('Estás junto al lago del parque.', 4.6, 9.8);
  capFit('Cada átomo de tu cuerpo tiene protones.', 11.0, 15.4);
  capFit('Los protones deciden qué elemento es cada átomo.', 15.6, 19.8);
  capFit('Sin protones, los átomos pierden su identidad.', 27.6, 29.9);
  capFit('La química normal deja de funcionar.', 30.6, 34.0);
  capFit('Los átomos no pueden mantener su estructura.', 34.2, 37.8);
  capFit('No solo pasa aquí.', 38.6, 42.4);
  capFit('Cada átomo de la Tierra se ve afectado.', 42.8, 45.4);
  capFit('Son unos 10⁵⁰ átomos.', 45.6, 47.8);
  capFit('Cada protón vuelve a su lugar.', 57.2, 63.6);
}
