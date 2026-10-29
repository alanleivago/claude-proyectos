
// =====================================================================
//  OVERLAYS — the HUD (folds, thickness), title, captions (the milestone lines), flashes, the end card
// =====================================================================
const ACCENT = '#f0a24a';
function hud(t) { if (t >= 68 || (t >= 61.5 && t < 62)) return; const a = ev(0.2, 0.5) * (1 - ev(67.4, 0.5)), F = foldAt(t), n = t >= 66 ? 12 : F.n;
  const th = t >= 66 ? thickM(12) : thickM(n) * (1 + F.k * (t < 61.4 ? 1 : 0));
  const f = () => { pvFeather(250, 720, 300, 210, a * 0.85);
    pvText(t >= 66 ? 'RÉCORD REAL' : 'PLIEGUES', 92, 640, 22, { font: PV.sans, weight: 700, spacing: 4, alpha: a * 0.9, color: ACCENT });
    pvText(String(n), 90, 735, 96, { font: PV.sans, weight: 800, alpha: a });
    pvText('GROSOR', 92, 790, 20, { font: PV.sans, weight: 700, spacing: 4, alpha: a * 0.8 });
    pvText(fmtLen(th), 90, 840, 44, { font: PV.sans, weight: 700, alpha: a }); };
  if (DEFER) DEFER.push(f); else f(); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(100, Math.floor(100 * 780 / wmax)), lh = size * 1.12, y0 = 360;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 640, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a, color: l.includes('103') ? ACCENT : undefined })); };
  if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; let lines = [str];
    if (w > 760) { const mid = str.length / 2; let best = -1; for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; lines = [str.slice(0, best), str.slice(best + 1)]; }
    const size = Math.min(52, Math.floor(52 * 760 / Math.max(...lines.map((l) => ctx.measureText(l).width)))); ctx.restore(); const lh = size * 1.18, y0 = 1390 + dy - (lines.length - 1) * lh;
    pvFeather(CX, y0 - 16 + (lines.length - 1) * lh / 2, 570, 110 + (lines.length - 1) * 50, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { italic: true, align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(68.1, 0.5), b = ev(68.5, 0.5), g = ev(69.0, 0.4), h = ev(69.4, 0.3), e = ev(69.6, 0.3);
  const f = () => { fillAll('#0e0e10'); pvText('¿Qué pasaría si doblaras una hoja', CX, 600, 46, { align: 'center', alpha: a }); pvText('de papel por la mitad 103 veces?', CX, 660, 46, { align: 'center', alpha: a });
    const mono = { font: '"Courier New", monospace', weight: 700, spacing: 1, align: 'center' };
    pvText('2002 · BRITNEY GALLIVAN DOBLÓ UN ROLLO', CX, 800, 23, Object.assign({ alpha: b * 0.85 }, mono)); pvText('DE PAPEL DE 1,2 KM POR LA MITAD 12 VECES', CX, 840, 23, Object.assign({ alpha: b * 0.85 }, mono));
    pvText('Pero tranquilo, esto nunca sucederá…', CX, 1100, 42, { italic: true, align: 'center', alpha: g }); pvText('… ¿o sí?', CX, 1180, 60, { italic: true, align: 'center', alpha: h, color: '#f2d38a' });
    pvText('ALTERBASETV', CX, 1480, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 62 && t < 62.35) pvTint('#ffffff', 0.7 * (1 - seg(t, 62, 62.35)));
  if (t >= 65.6 && t < 66.15) pvTint('#000000', ss(65.6, 65.85, t) * (1 - ss(65.9, 66.15, t)));
  if (t >= 67.6 && t < 68) pvTint('#000000', ss(67.6, 68, t));
  if (t >= 68) { endCard(); return; }
  hud(t);
  bigTitle(['¿Qué pasaría si doblaras', 'una hoja de papel por', 'la mitad 103 veces?'], 0.2, 3.9);
  capFit('Cada pliegue duplica su grosor.', 4.3, 9.8);
  capFit('14 pliegues: tan alta como tú.', 10.5, 14.0);
  capFit('Atraviesa el techo.', 14.4, 17.6);
  capFit('21 pliegues: más alta que la Torre Latinoamericana.', 18.3, 21.8);
  capFit('26 pliegues: más alta que el Popocatépetl.', 24.3, 27.4);
  capFit('27 pliegues: más alta que el Everest.', 27.6, 29.2);
  capFit('30 pliegues: llega al espacio.', 29.5, 33.0);
  capFit('Ya es más alta que la órbita de la EEI.', 33.2, 37.8);
  capFit('42 pliegues: pasa la Luna.', 39.5, 43.8);
  capFit('51 pliegues: pasa el Sol.', 46.3, 49.6);
  capFit('69 pliegues: pasa la estrella más cercana.', 50.0, 53.6);
  capFit('83 pliegues: más ancha que la Vía Láctea.', 54.0, 57.6);
  capFit('88 pliegues: pasa Andrómeda.', 57.8, 61.4);
  capFit('103 pliegues: más alta que el universo observable.', 62.4, 65.8);
  capFit('En la vida real, el récord es 12 pliegues.', 66.2, 67.8);
}
