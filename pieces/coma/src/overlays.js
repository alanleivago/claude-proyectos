// =====================================================================
//  OVERLAYS — the place/time HUD, then "EN COMA · DÍA n", title, captions, the end card
// =====================================================================
const STAGES = [[16, 'DÍA 1'], [24, 'DÍA 2'], [31, 'DÍA 3'], [36, 'SEMANA 3'], [39, 'SEMANA 4'], [41, 'SEMANA 5'], [47, 'SEMANA 6']];
function hud(t) { if (t >= 68 || (t >= 15.5 && t < 16)) return;
  if (t < 15.5) { pvHud('Valle de Bravo · México', '23:48', '', ev(0.2, 0.5) * (1 - ev(15, 0.5))); return; }
  let v = 'DÍA 1'; STAGES.forEach(([a, s]) => { if (t >= a) v = s; });
  const a = ev(16.2, 0.5) * (1 - ev(67.4, 0.5)), sub = t >= 57.4 ? 'Respuesta detectada' : '';
  pvHud('En coma', v, '', a);
  if (sub) { const b = a * ev(57.4, 0.4); const f = () => pvText(sub.toUpperCase(), 64, 922, 28, { font: PV.sans, weight: 700, spacing: 3, alpha: b, color: '#7fe0a8' }); if (DEFER) DEFER.push(f); else f(); } }
function bigTitle(lines, t0, t1, y0 = 500) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(100, Math.floor(100 * 760 / wmax)), lh = size * 1.12;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.3), 1 - ev(t1 - 0.25, 0.25));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; let lines = [str];
    if (w > 760) { const mid = str.length / 2; let best = -1; for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; lines = [str.slice(0, best), str.slice(best + 1)]; }
    const size = Math.min(52, Math.floor(52 * 760 / Math.max(...lines.map((l) => ctx.measureText(l).width)))); ctx.restore(); const lh = size * 1.18, y0 = 1390 + dy - (lines.length - 1) * lh;
    pvFeather(CX, y0 - 16 + (lines.length - 1) * lh / 2, 570, 110 + (lines.length - 1) * 50, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { italic: true, align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(68.3, 0.6), q = ev(69.6, 0.6), e = ev(71.2, 0.5);
  const f = () => { pvTint('#000000', 0.4 * ev(68, 0.6)); pvFeather(CX, 580, 640, 240, a * 0.9); pvText('¿Qué pasaría si', CX, 560, 56, { align: 'center', alpha: a }); pvText('cayeras en coma?', CX, 630, 56, { align: 'center', alpha: a });
    pvFeather(CX, 1180, 560, 120, q * 0.8); pvText('¿Querrías que siguieran esperando?', CX, 1190, 44, { italic: true, align: 'center', alpha: q, color: '#f2d38a' });
    pvText('ALTERBASE', CX, 1300, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 15.5 && t < 16) pvTint('#000000', 1);
  if (t >= 56.6 && t < 57) pvTint('#000000', 1);
  if (t >= 68) { endCard(); return; }
  hud(t);
  bigTitle(['¿Qué pasaría si', 'cayeras en coma?'], 0.2, 3.8);
  capFit('Tus amigos te retan a saltar.', 4.2, 6.9);
  capFit('Saltas. No llegas lo bastante lejos.', 7.2, 9.9);
  capFit('Tu cabeza golpea una roca.', 10.2, 11.9);
  capFit('No despiertas.', 12.4, 15.4);
  capFit('Estás en coma.', 16.4, 18.8);
  capFit('Los médicos te dan 3 de 15. El mínimo.', 19.2, 20.9);
  capFit('Tu mamá llora a tu lado.', 21.3, 23.9);
  capFit('Mucha gente en terapia intensiva sueña.', 24.3, 27.8);
  capFit('Luego el sueño se vuelve pesadilla.', 28.2, 30.9);
  capFit('Los médicos hablan de desconectarte.', 31.2, 33.4);
  capFit('La mayoría de estas muertes ocurren así.', 33.6, 35.9);
  capFit('Semana 3. Abres los ojos. No puedes responder.', 36.3, 38.9);
  capFit('Tu teléfono no deja de vibrar.', 39.2, 40.9);
  capFit('El médico dice: no hay nadie ahí.', 41.2, 43.9);
  capFit('Pero 4 de cada 10 veces se equivocan.', 44.2, 46.9);
  capFit('Semana 6. Un escáner cerebral.', 47.3, 49.9);
  capFit('Una voz dice: imagina que caminas por tu casa.', 50.1, 51.9);
  capFit('Lo haces. Con todas tus fuerzas.', 52.3, 56.5);
  capFit('Tu cerebro se enciende.', 57.2, 59.9);
  capFit('1 de cada 4 que no responden puede hacer esto.', 60.2, 63.9);
  capFit('Sigues sin poder moverte. Pero ahora lo saben.', 64.2, 67.9);
}
