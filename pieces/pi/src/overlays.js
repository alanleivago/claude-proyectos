
// =====================================================================
//  OVERLAYS — the circle icon and HUD (countdown, then the slowed clock), the circle diagram at the top (π = 3.14159…
//  then a circle that can no longer close), title, captions; the 2D sky shots (the flattened Sun, the halo, the Moon
//  crumbling), the black wedge in your eyes, the cracked sky, the end card
// =====================================================================
const fmt3 = (v) => v.toFixed(3).replace('.', ',');
function piIcon(x, y, s, a = 1, gap = 0) { if (a <= 0) return; const f = () => { ctx.save(); screen(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 6; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.arc(0, 0, 44, -Math.PI / 2 + gap * TAU * 0.5, -Math.PI / 2 + TAU - gap * TAU * 0.5); ctx.stroke(); ctx.restore(); }; if (DEFER) DEFER.push(f); else f(); }
const slowClock = (t) => Math.max(0, 0.043 + (t - 8.4) * 0.1029);
function hud(t) { if (t >= 65) return; const a = ev(0.2, 0.5) * (1 - ev(64.2, 0.6)) * (t >= 30 && t < 37 ? 0.85 : 1); let label, val, sub;
  if (t < 8) { label = 'π se vuelve 3 en'; val = '0:0' + fmt3(Math.max(0, 8 - t)); sub = 'π = 3,14159…'; }
  else if (t < 56) { label = t < 18 ? 'Cosas redondas' : t < 30 ? 'Cosas que giran' : t < 41 ? 'El cielo' : 'El planeta'; val = fmt3(slowClock(t)) + ' s'; sub = 'tiempo ralentizado ×12'; }
  else { label = 'π'; val = '3,14159…'; sub = 'han pasado 5 segundos'; }
  piIcon(104, 735, 44, a, t >= 8 && t < 56 ? 0.045 : 0); pvHud(label, val, sub, a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(130, Math.floor(100 * 760 / wmax)), lh = size * 1.12, y0 = 480;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; let lines = [str];
    if (w > 760) { const mid = str.length / 2; let best = -1; for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; lines = [str.slice(0, best), str.slice(best + 1)]; }
    const size = Math.min(52, Math.floor(52 * 760 / Math.max(...lines.map((l) => ctx.measureText(l).width)))); ctx.restore(); const lh = size * 1.18, y0 = 1390 + dy - (lines.length - 1) * lh;
    pvFeather(CX, y0 - 16 + (lines.length - 1) * lh / 2, 570, 110 + (lines.length - 1) * 50, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { italic: true, align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
// the sky shots
function sunShot(t) { const k = ss(30.4, 32.2, t), g = ctx.createRadialGradient(CX, 820, 40, CX, 820, 1300); g.addColorStop(0, '#d8a060'); g.addColorStop(0.35, '#8a5428'); g.addColorStop(1, '#3a200e'); ctx.save(); screen(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = 70, sq = 1 - 0.45 * k; pvGlow(CX, 820, 360, 'rgba(255,200,120,0.5)', 1); ctx.translate(CX, 820); ctx.rotate(-0.6); ctx.fillStyle = '#fff6e0'; ctx.shadowColor = 'rgba(255,220,150,1)'; ctx.shadowBlur = 60; ctx.beginPath(); ctx.ellipse(0, 0, r * (1 + 0.25 * k), r * sq, 0, 0, TAU); ctx.fill();
  ctx.shadowBlur = 30; ctx.strokeStyle = `rgba(255,250,235,${0.9 * k})`; ctx.lineWidth = 6 * k + 1; ctx.beginPath(); ctx.moveTo(-1400 * k, 0); ctx.lineTo(1400 * k, 0); ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,255,255,${k})`; ctx.beginPath(); ctx.moveTo(-r * 1.6, 0); ctx.lineTo(r * 1.6, 0); ctx.stroke(); ctx.restore(); }
function haloShot(t) { const k = ss(33, 33.8, t); ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = `rgba(255,255,255,${0.55 * k})`; ctx.lineWidth = 5; [[CX + 120, 620, 520], [CX + 120, 620, 300]].forEach(([x, y, r], i) => { ctx.beginPath(); ctx.arc(x, y, r, -0.4 + i, -0.4 + i + TAU * 0.955); ctx.stroke(); });
  pvGlow(CX + 120, 620, 260, 'rgba(255,250,235,0.9)', 1); ctx.lineWidth = 7; ctx.strokeStyle = `rgba(255,255,255,${0.7 * k})`; ctx.beginPath(); ctx.moveTo(-100, 260); ctx.lineTo(W + 100, 900 + 60 * Math.sin(t)); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W, 120); ctx.lineTo(W * 0.55, 0); ctx.stroke(); ctx.restore(); }
function moonShot(t) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4a7ac0'); g.addColorStop(1, '#8ab4e0'); ctx.save(); screen(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); const k = ss(35.8, 36.9, t), mx = CX - 90, my = 760, r = 120, R = RNG('moon');
  ctx.filter = 'blur(18px)'; ctx.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(R.r(-100, W + 100), H * R.r(0.82, 1.02), R.r(160, 320), R.r(40, 80), 0, 0, TAU); ctx.fill(); } ctx.filter = 'none';
  ctx.fillStyle = 'rgba(244,244,250,0.95)'; ctx.beginPath(); ctx.arc(mx, my, r, Math.PI / 2, Math.PI * 1.5); ctx.ellipse(mx, my, r * 0.35, r, 0, -Math.PI / 2, Math.PI / 2, true); ctx.fill();
  for (let i = 0; i < 40; i++) { const a = R.r(-1.2, 1.2), d = R.r(0, 1) * r, px = mx + r * 0.3 + Math.cos(a) * d * 0.3 + k * R.r(40, 260), py = my + Math.sin(a) * r * 0.9 + k * R.r(-60, 120); ctx.globalAlpha = 1 - 0.7 * k; ctx.fillRect(px, py, R.r(3, 12), R.r(3, 12)); } ctx.restore(); }
function wedge(t) { const k = ss(37.2, 39.6, t); if (k <= 0) return; ctx.save(); screen(); ctx.fillStyle = '#000'; const w = 150 * k, h = H * 0.62 * k + 40; ctx.beginPath(); ctx.moveTo(CX - w / 2, -10); ctx.lineTo(CX + w / 2, -10); ctx.lineTo(CX + 8, h); ctx.lineTo(CX - 8, h); ctx.closePath(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 20; ctx.fill(); ctx.restore(); }
function crackedSky(t) { const k = ss(60.2, 61.2, t); if (k <= 0) return; const R = RNG('skyc'), cx = CX + 60, cy = 330; ctx.save(); screen(); ctx.strokeStyle = `rgba(255,255,255,${0.75 * k})`; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(255,255,255,0.5)'; ctx.shadowBlur = 6;
  for (let i = 0; i < 16; i++) { let a = i / 16 * TAU + R.n(0.15), x = cx, y = cy; ctx.lineWidth = R.r(1.5, 3.5); ctx.beginPath(); ctx.moveTo(x, y); const L = R.r(180, 520) * k; for (let s = 0; s < 8; s++) { a += R.n(0.18); x += Math.cos(a) * L / 8; y += Math.sin(a) * L / 8; ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore(); }
function endCard() { const a = ev(65.3, 0.7), b = ev(66.6, 0.8), c = ev(68.4, 0.8), d = ev(70.2, 0.8), g = ev(72.6, 0.8), h = ev(74.8, 0.7), e = ev(76.4, 0.6);
  const f = () => { fillAll('#121212'); pvText('¿Qué pasaría si π valiera exactamente 3', CX, 600, 46, { align: 'center', alpha: a }); pvText('durante 5 segundos?', CX, 664, 46, { align: 'center', alpha: a });
    pvText('En 1897, la Cámara de Indiana votó 67 a 0', CX, 830, 38, { font: PV.sans, weight: 600, align: 'center', alpha: b }); pvText('una ley que implicaba que π = 3,2.', CX, 884, 38, { font: PV.sans, weight: 600, align: 'center', alpha: c });
    pvText('El Senado la archivó.', CX, 1000, 52, { italic: true, align: 'center', alpha: d, color: '#f2d38a' }); pvText('Pero tranquilo, esto nunca sucederá…', CX, 1170, 42, { italic: true, align: 'center', alpha: g }); pvText('… ¿o sí?', CX, 1250, 60, { italic: true, align: 'center', alpha: h }); pvText('ALTERBASE.ESP', CX, 1480, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  piIcon(CX, 450, 70, a, 0.045 * (1 - ss(74, 78, TT))); if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 30 && t < 33) sunShot(t);
  if (t >= 33 && t < 35.5) haloShot(t);
  if (t >= 35.5 && t < 37) moonShot(t);
  if (t >= 37 && t < 40) wedge(t);
  if (t >= 60 && t < 65) crackedSky(t);
  if (t >= T_PI && t < T_PI + 0.35) pvTint('#ffffff', 0.5 * (1 - seg(t, T_PI, T_PI + 0.35)));
  if (t >= T_BACK && t < T_BACK + 0.4) pvTint('#ffffff', 0.8 * (1 - seg(t, T_BACK, T_BACK + 0.4)));
  if (t >= 64 && t < 65) pvTint('#000000', ss(64, 65, t));
  if (t >= 65) endCard();
  diagramPi(t); hud(t);
  bigTitle(['¿Qué pasaría si π valiera', 'exactamente 3', 'durante 5 segundos?'], 0.3, 4.6);
  capFit('Cada círculo acaba de perder un 4,5 %.', 9.3, 12.3);
  capFit('Un disco plano solo puede doblarse en cono.', 12.8, 14.8);
  capFit('Cada rueda tiene un 4,7 % de llanta de más.', 15.2, 17.8);
  capFit('Las tapas ya no encajan en sus agujeros.', 20.2, 22.8);
  capFit('Cada arco es demasiado largo para su hueco.', 23.2, 24.8);
  capFit('Nada que gire puede seguir girando.', 25.4, 29.8);
  capFit('El Sol ya no es una esfera.', 30.4, 35.4);
  capFit('Tus ojos también son redondos.', 37.6, 39.8);
  capFit('Nada en la Tierra puede rodar.', 40.6, 43.8, -300);
  capFit('El ecuador de la Tierra mide 1.800 km de más.', 44.6, 49.8);
  capFit('El suelo tiene que plegarse en algún sitio.', 50.4, 55.8);
  capFit('π ha vuelto. El daño se queda.', 57.6, 63.8);
}
