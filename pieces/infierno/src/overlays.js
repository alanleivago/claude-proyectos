
// =====================================================================
//  OVERLAYS — the HUD (heart rate → since your last heartbeat → time left: forever, years passed), title, captions,
//  the flash cuts, the end card
// =====================================================================
const EMBER = '#f2a24a';
const fmtI = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const T_DEATH = 4.2;
function hud(t) { if (t >= 67 || (t >= 57.75 && t < 58.5)) return; const a = ev(0.2, 0.5) * (1 - ev(66.4, 0.5)); let label, val, sub;
  if (t < T_DEATH) { const bpm = t < 3.5 ? 128 + 4 * Math.sin(t * 2.1) : lerp(130, 0, ss(3.5, T_DEATH, t)); label = 'Ritmo cardíaco'; val = `${Math.round(bpm)} lpm`; sub = t < 3.5 ? 'en medio de la fiesta' : 'deteniéndose'; }
  else if (t < 26) { const s = Math.floor(t - T_DEATH); label = 'Desde tu último latido'; val = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; sub = t < 11 ? 'muerto' : t < 18 ? 'cayendo' : 'llegaste'; }
  else { label = 'Tiempo restante'; val = 'para siempre'; const yrs = t < 31 ? 0 : Math.exp(lerp(0, Math.log(9.9e9), ss(31, 66, t) ** 1.3)) - 1; sub = t < 31 ? 'sin salida' : `años pasados: ${fmtI(yrs)}`; }
  pvHud(label, val, sub, a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(110, Math.floor(100 * 760 / wmax)), lh = size * 1.12, y0 = 520;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a, color: l.includes('infierno') ? undefined : undefined })); };
  if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; let lines = [str];
    if (w > 760) { const mid = str.length / 2; let best = -1; for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; lines = [str.slice(0, best), str.slice(best + 1)]; }
    const size = Math.min(52, Math.floor(52 * 760 / Math.max(...lines.map((l) => ctx.measureText(l).width)))); ctx.restore(); const lh = size * 1.18, y0 = 1390 + dy - (lines.length - 1) * lh;
    pvFeather(CX, y0 - 16 + (lines.length - 1) * lh / 2, 570, 110 + (lines.length - 1) * 50, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { italic: true, align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(67.2, 0.6), b = ev(67.8, 0.6), c = ev(68.3, 0.6), g = ev(68.9, 0.5), e = ev(69.3, 0.4);
  const f = () => { fillAll('#100c0a'); pvText('¿Qué pasaría si', CX, 600, 50, { align: 'center', alpha: a }); pvText('el infierno fuera real?', CX, 666, 50, { align: 'center', alpha: a });
    const mono = { font: '"Courier New", monospace', weight: 700, spacing: 1, align: 'center' };
    pvText('LUCAS 16:26 · «UNA GRAN SIMA ESTÁ PUESTA', CX, 820, 23, Object.assign({ alpha: b * 0.85 }, mono)); pvText('ENTRE NOSOTROS Y VOSOTROS»', CX, 860, 23, Object.assign({ alpha: b * 0.85 }, mono));
    pvText('APOCALIPSIS 14:11 · «EL HUMO DE SU TORMENTO', CX, 940, 23, Object.assign({ alpha: c * 0.85 }, mono)); pvText('SUBE POR LOS SIGLOS DE LOS SIGLOS»', CX, 980, 23, Object.assign({ alpha: c * 0.85 }, mono));
    pvText('¿Crees que es real?', CX, 1200, 60, { italic: true, align: 'center', alpha: g, color: '#f2c27a' }); pvText('ALTERBASETV', CX, 1480, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 3.5 && t < 3.75) pvTint('#ffffff', 0.75 * (1 - seg(t, 3.5, 3.75)));
  if (t >= 4.45 && t < 4.75) pvTint('#000000', ss(4.45, 4.75, t));
  if (t >= 17.6 && t < 18.25) pvTint('#ffd8a0', ss(17.6, 17.95, t) * (1 - ss(17.95, 18.25, t)));
  if ((t >= 31 && t < 31.2) || (t >= 34 && t < 34.2) || (t >= 37 && t < 37.2)) pvTint('#ffffff', 0.6 * (1 - seg(t, Math.floor(t * 5) / 5, Math.floor(t * 5) / 5 + 0.2)));
  if (t >= 58.5 && t < 58.8) pvTint('#ffe8c0', 0.8 * (1 - seg(t, 58.5, 58.8)));
  if (t >= 66.3 && t < 67) pvTint('#000000', ss(66.3, 67, t));
  if (t >= 67) { endCard(); return; }
  hud(t);
  bigTitle(['¿Qué pasaría si', 'el infierno', 'fuera real?'], 0.25, 3.5);
  capFit('Un golpe. En medio de la fiesta.', 4.9, 6.6);
  capFit('Te ves tirado en el suelo.', 6.8, 8.9);
  capFit('Esperas subir.', 9.2, 10.9);
  capFit('Pero caes.', 11.2, 13.4);
  capFit('Más hondo. Y más hondo.', 13.6, 15.9);
  capFit('Cada segundo, más calor.', 16.1, 17.7);
  capFit('Un lago de fuego, hasta donde alcanza la vista.', 18.4, 22.4);
  capFit('Millones de personas. Gritando.', 22.6, 25.9);
  capFit('El fuego nunca se apaga.', 26.3, 28.4);
  capFit('No hay salida.', 28.6, 30.9);
  capFit('Lo recuerdas todo.', 31.3, 33.9);
  capFit('Cada oportunidad que tuviste.', 34.3, 36.9);
  capFit('Ruegas por una gota de agua.', 37.3, 40.4);
  capFit('Nunca llega.', 40.7, 42.9);
  capFit('A lo lejos, ves el cielo.', 43.3, 46.2);
  capFit('Un abismo que nadie puede cruzar.', 46.5, 48.9);
  capFit('Sin descanso, ni de día ni de noche.', 49.3, 52.2);
  capFit('El humo sube para siempre.', 52.5, 54.9);
  capFit('Fue preparado para el diablo.', 55.2, 57.65);
  capFit('No para ti.', 59.0, 62.9);
  capFit('Y nunca termina.', 63.4, 66.3);
}
