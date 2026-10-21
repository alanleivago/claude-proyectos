
// =====================================================================
//  OVERLAYS — title, the world-population HUD, captions, the end card
// =====================================================================
const fmtN = (v) => `${Math.round(v)}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
// the population counter: ticks up by births before zero; halves at zero (red); creeps on with each shot
const POP = [[0, 8204871560], [10.0, 8204871585], [10.001, 4081103224], [12, 4081103226], [45, 4081103290], [58, 4081259465], [78, 4082429251], [100, 4089852610], [112, 4099886770], [128, 4099886740], [152, 4070845780], [162, 3927410630], [172, 3927410620]];
const popAt = (t) => { for (let i = 0; i < POP.length - 1; i++) if (t < POP[i + 1][0]) return lerp(POP[i][1], POP[i + 1][1], (t - POP[i][0]) / (POP[i + 1][0] - POP[i][0])); return POP[POP.length - 1][1]; };
const SUBS = [[12, ''], [45, 'DÍA 1'], [66, 'DÍA 2'], [72, 'DÍA 6'], [78, 'DÍA 14'], [100, 'SEMANA 3'], [112, 'MES 3'], [140, 'AÑO 1'], [152, 'AÑO 1'], [162, 'AÑO 2'], [172, 'AÑO 7']];
const subAt = (t) => { for (const [b, s] of SUBS) if (t < b) return s; return ''; };
function bigTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore();
    const size = Math.min(150, Math.floor(100 * 770 / wmax)), lh = size * 1.12, y0 = 430;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 150 + lines.length * 80, a);
    lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
function capFit(str, t0, t1, dy = 0) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; ctx.restore(); const size = Math.min(52, Math.floor(52 * 760 / w));
    pvFeather(CX, 1374 + dy, 570, 120, a); pvText(str, CX, 1390 + dy, size, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f();
}
function hud(t) { if (t < 4.0 || t >= 172) return; const a = ev(4.0, 0.5) * (1 - ev(171.6, 0.4)), red = t >= T_ZERO && t < T_ZERO + 1.6;
  const f = () => { pvFeather(250, 852, 380, 150, a * 0.9); pvText('POBLACIÓN MUNDIAL', 64, 800, 26, { font: PV.sans, weight: 700, spacing: 4, alpha: a });
    ctx.save(); screen(); ctx.globalAlpha = a; ctx.font = `400 76px ${PV.serif}`; ctx.fillStyle = red ? '#ff5a4a' : '#ffffff'; ctx.textBaseline = 'alphabetic'; ctx.fillText(fmtN(popAt(t)), 60, 892); ctx.restore();
    const sub = subAt(t); if (sub) pvText(sub, 64, 934, 20, { font: PV.sans, weight: 600, spacing: 3, alpha: a * 0.85 });
    if (t >= 162) { pvText('HOMBRES Y NIÑOS EN LA TIERRA', 64, 972, 20, { font: PV.sans, weight: 700, spacing: 3, alpha: a * 0.85 }); pvText(fmtN(knots([[162, 2025140], [172, 2025165]], t)), 64, 1012, 34, { alpha: a }); } };
  if (DEFER) DEFER.push(f); else f(); }
function endCard(lt) {
  const a = ev(172.5, 0.8), b = ev(174.2, 0.8), c = ev(176.4, 0.7), d = ev(177.4, 0.6);
  const f = () => { fillAll('#121212');
    pvText('¿Qué pasaría si todos los hombres', CX, 560, 56, { align: 'center', alpha: a }); pvText('de la Tierra desaparecieran?', CX, 636, 56, { align: 'center', alpha: a });
    ['La humanidad no solo sobreviviría.', 'Las mujeres la reconstruirían.', 'Y criarían a la próxima', 'generación de hombres.'].forEach((l, i) => pvText(l, CX, 800 + i * 70, 46, { font: PV.sans, weight: 600, spacing: 1, align: 'center', alpha: b * 0.92 }));
    // the share arrow (a curved arrow out of a tray), drawn above the call to action
    ctx.save(); screen(); ctx.globalAlpha = c; ctx.translate(CX, 1150); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-34, 22); ctx.quadraticCurveTo(-30, -14, 14, -14); ctx.lineTo(14, -34); ctx.lineTo(46, -4); ctx.lineTo(14, 26); ctx.lineTo(14, 6); ctx.quadraticCurveTo(-14, 4, -34, 22); ctx.fill(); ctx.restore();
    pvText('Envíale esto a una mujer.', CX, 1260, 48, { font: PV.sans, weight: 700, spacing: 1, align: 'center', alpha: c }); pvText('Ella sabrá por qué.', CX, 1324, 48, { font: PV.sans, weight: 700, spacing: 1, align: 'center', alpha: c });
    ctx.save(); screen(); ctx.globalAlpha = c; ctx.fillStyle = '#ffffff'; ctx.fillRect(CX - 260, 1350, 520, 3); ctx.restore();
    pvText('ALTERBASE.ESP', CX, 1500, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: d * 0.9 }); };
  if (DEFER) DEFER.push(f); else f();
}
function overlays(t) {
  hud(t);
  bigTitle(['¿Qué pasaría si todos', 'los hombres de la Tierra', 'desaparecieran?'], 0.3, 3.9);
  capFit('Cada hombre y cada niño de la Tierra acaba de desaparecer.', 10.4, 11.95);
  capFit('Su papá acaba de desaparecer.', 15.4, 19.2);
  capFit('Ella todavía cree que él sostiene la bici.', 19.4, 24.8);
  capFit('19 de cada 20 pilotos eran hombres.', 26.0, 32.8);
  capFit('Cada mujer perdió a alguien:', 37.0, 44.8);
  capFit('su padre, su hermano, su hijo.', 39.2, 44.8, 74);
  capFit('Ese día, las guerras se detuvieron.', 45.5, 50.8);
  capFit('Casi 9 de cada 10 líderes mundiales eran hombres.', 51.5, 57.8);
  capFit('9 de cada 10 enfermeras eran mujeres.', 58.5, 65.8);
  capFit('La salud no se detuvo.', 61.2, 65.8, 74);
  capFit('Las estanterías se vacían.', 66.4, 71.8);
  capFit('Se va la luz.', 73.6, 77.8);
  capFit('Millones de mujeres aprenden oficios nuevos.', 78.5, 83.8);
  capFit('Antes era maestra.', 84.0, 87.8);
  capFit('Ahora le devuelve la luz a la ciudad.', 90.0, 99.6);
  capFit('Es nuevo y es muy difícil.', 100.5, 105.8);
  capFit('Lo hacen igual.', 106.2, 111.8);
  capFit('3 AM. Camina sola a casa.', 112.6, 116.9);
  capFit('Cada 10 minutos, una mujer moría', 117.3, 122.3);
  capFit('a manos de alguien de confianza.', 117.3, 122.3, 74);
  capFit('Esta noche, nadie.', 122.6, 125.0);
  capFit('840 millones de mujeres vivieron con ese miedo.', 125.2, 127.8);
  capFit('El mundo funciona otra vez.', 128.5, 133.8);
  capFit('Una cosa no.', 130.6, 133.8, 74);
  capFit('El esperma congelado dura décadas.', 134.2, 139.8);
  capFit('Es un niño.', 145.0, 148.0);
  capFit('Va a ser hermana mayor.', 148.4, 151.8);
  capFit('Los primeros niños nacen', 152.6, 161.8);
  capFit('en un mundo sin hombres.', 152.6, 161.8, 74);
  capFit('Misma calle. Misma bici.', 162.5, 166.4);
  capFit('Es parte de la primera generación', 166.6, 171.8);
  capFit('de hombres criados solo por mujeres.', 166.6, 171.8, 74);
}
SHOT_FN.card = (lt) => endCard(lt);
