
// =====================================================================
//  OVERLAYS — the believers counter, the HUD per place, title, captions, end card
// =====================================================================
const fmtN = (n) => Math.max(0, Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const BELIEVERS = [[0, 5.94e9], [6.15, 5.94e9], [7.15, 3.94e9], [7.4, 3.94e9], [8.4, 3.925e9], [8.65, 3.925e9], [9.65, 2.725e9], [9.9, 2.725e9], [10.9, 2.405e9], [11.6, 2.405e9], [14.4, 1.05e8], [15.4, 1.05e8], [17.4, 0]];
function believers(t) { if (t <= BELIEVERS[0][0]) return BELIEVERS[0][1]; for (let i = 0; i < BELIEVERS.length - 1; i++) { const [a, va] = BELIEVERS[i], [b, vb] = BELIEVERS[i + 1]; if (t < b) return lerp(va, vb, EZ.io(clamp((t - a) / (b - a)))); } return 0; }
function hud(t) { if (t >= 60 || (t >= 45.5 && t < 51)) return; const a = ev(0.2, 0.5) * (1 - ev(59.6, 0.4)); let label, val, sub;
  if (t < 23) { label = 'Creyentes'; val = fmtN(believers(t)); sub = t < 18 ? 'en el mundo' : 'Plaza de San Pedro'; }
  else if (t < 28) { label = 'Kumbh Mela 2025'; val = '662 millones'; sub = t < 25.8 ? 'se bañaron en el río' : 'ahora: solo un río'; }
  else if (t < 33) { label = 'Nombres de bebé, 2024'; val = t < 31.2 ? '1 · 2 · 3' : '· · 3'; sub = 'Inglaterra y Gales'; }
  else if (t < 38) { label = 'Billete de 1 dólar'; val = 'desde 1957'; sub = t < 35.9 ? 'In God We Trust' : 'borrado'; }
  else if (t < 45.5) { label = 'Nueva fe'; val = 'el fútbol'; sub = 'ocupa el vacío'; }
  else if (t < 56) { label = 'Guerras de la historia'; val = '7 %'; sub = 'por religión · 123 de 1.763'; }
  else { label = 'Se dicen muy felices'; val = '36 % vs 25 %'; sub = 'creyentes activos vs. el resto · EE. UU.'; }
  sparkIcon(104, 735, 44, a); pvHud(label, val, sub, a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(150, Math.floor(100 * 770 / wmax)), lh = size * 1.12, y0 = 470;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  sparkIcon(CX, 330, 110, a); if (DEFER) DEFER.push(f); else f(); }
// a caption: one line at 52 px when it fits; otherwise two lines split at the space nearest the middle (never shrunk to tiny)
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; let lines = [str];
    if (w > 760) { const mid = str.length / 2; let best = -1; for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; lines = [str.slice(0, best), str.slice(best + 1)]; }
    const size = Math.min(52, Math.floor(52 * 760 / Math.max(...lines.map((l) => ctx.measureText(l).width)))); ctx.restore(); const lh = size * 1.18, y0 = 1390 + dy - (lines.length - 1) * lh;
    pvFeather(CX, y0 - 16 + (lines.length - 1) * lh / 2, 570, 110 + (lines.length - 1) * 50, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { italic: true, align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(60.3, 0.6), b = ev(60.9, 0.7), d = ev(62.0, 0.6), e = ev(62.8, 0.5);
  const f = () => { fillAll('#121212');
    pvText('¿Qué pasaría si', CX, 560, 54, { align: 'center', alpha: a }); pvText('la religión desapareciera?', CX, 634, 54, { align: 'center', alpha: a });
    pvText('Casi 6.000 millones de personas', CX, 820, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b }); pvText('tienen una religión.', CX, 882, 44, { font: PV.sans, weight: 600, align: 'center', alpha: b });
    pvText('¿En qué creerías tú?', CX, 1110, 64, { italic: true, align: 'center', alpha: d, color: '#f2d38a' });
    pvText('ALTERBASE.ESP', CX, 1480, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  sparkIcon(CX, 430, 80, a); if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 45.5 && t < 46.5) pvTint('#000000', 0.25 * ss(45.5, 46.0, t));
  if (t >= 46.5 && t < 46.75) pvTint('#ffffff', 0.45 * (1 - seg(t, 46.5, 46.75)));
  if (t >= 60) endCard();
  hud(t);
  bigTitle(['¿Qué pasaría si', 'la religión', 'desapareciera?'], 0.3, 3.8);
  capFit('Casi 6.000 millones de personas tienen una religión.', 3.9, 5.9);
  capFit('Y entonces, desaparece.', 6.3, 10.9);
  capFit('Cada iglesia. Cada mezquita. Cada templo.', 11.4, 14.8);
  capFit('Todos a la vez.', 15.3, 17.8);
  capFit('Los lugares sagrados se quedan vacíos.', 18.4, 22.7);
  capFit('662 millones se bañaron en el Kumbh Mela de 2025.', 23.3, 25.6);
  capFit('Ahora es solo un río.', 25.8, 27.8);
  capFit('Los nombres de bebé más puestos en Inglaterra: Muhammad, Noah, Oliver.', 28.4, 30.9);
  capFit('Dos vienen de la religión. Se esfuman.', 31.1, 32.8);
  capFit('«In God We Trust», en cada dólar desde 1957.', 33.4, 35.8);
  capFit('Borrado.', 36.0, 37.8);
  capFit('El vacío busca otra fe.', 38.4, 41.6);
  capFit('Y el fútbol ocupa su lugar.', 41.8, 45.2);
  capFit('Para muchos, la fe era un freno. Ya no está.', 46.9, 50.8);
  capFit('Pero solo el 7 % de las guerras fueron por religión.', 51.4, 55.8);
  capFit('Y los creyentes dicen ser más felices.', 56.3, 58.0);
  capFit('¿Quién nos consuela ahora?', 58.1, 59.8);
}
