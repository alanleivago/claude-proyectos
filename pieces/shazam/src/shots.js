// =====================================================================
//  SHOTS — the 25 shots of reference 1 in reference time R; 0.5 s dissolves at every boundary; the step bar on top.
//  The field breathes (columns pulse with the music), peaks spring up, links draw themselves, the camera never stops.
// =====================================================================
S3.hl = true;   // captions: spoken words white, the current word yellow (the user liked the reference's)
const K = (R, a, d = 0.35) => EZ.o2(seg(R, a, a + d));
const KO = (R, a, b, d = 0.35) => Math.min(K(R, a, d), 1 - EZ.i2(seg(R, b - d, b)));
const SPR = (R, a, d = 0.45) => (R < a ? 0 : EZ.back(seg(R, a, a + d)));
const STEPS = ['ONDA', 'MAPA', 'PICOS', 'HUELLA', 'MATCH'];
let HUD = { step: null, note: '' }, ZM = 1.55;   // field shots: the camera 1.55× further from its target than authored
function sceneMain() {
  const R = (RNOW = refT(TT));
  const run = (key, alpha) => { ZM = key === 'taqueria' || key === 'app' ? 1 : 1.55; resetWorld(); HUD = { step: null, note: '' }; const D = []; SHOT_FN[key](R, D); renderWorld(alpha); return { D, hud: HUD }; };
  let i = SHOTS_R.findIndex(([, a, b]) => R >= a && R < b); if (i < 0) i = SHOTS_R.length - 1; const XF = 0.25; let out;
  const nb = SHOTS_R[i + 1], pb = SHOTS_R[i - 1];
  if (nb && R > nb[1] - XF) { const u = EZ.io(seg(R, nb[1] - XF, nb[1] + XF)), A = run(SHOTS_R[i][0], 1), B = run(nb[0], u); out = u < 0.5 ? A : B; }
  else if (pb && R < SHOTS_R[i][1] + XF) { const u = EZ.io(seg(R, SHOTS_R[i][1] - XF, SHOTS_R[i][1] + XF)), A = run(pb[0], 1), B = run(SHOTS_R[i][0], u); out = u < 0.5 ? A : B; }
  else out = run(SHOTS_R[i][0], 1);
  out.D.forEach((f) => f());
  const h = out.hud, hud = () => { if (h.step != null) s3Steps(STEPS, h.step, 1, { y: 250, color: h.step >= 4 ? '#3ce8a0' : S3.yellow }); s3Note('ILUSTRATIVO', 0.8, { x: 900, y: 1130 }); s3Caption(TT); };
  if (DEFER) DEFER.push(hud); else hud();
}
// ---- 2D helpers
function tag(v, dx, dy, title, sub, a, c = S3.yellow, size = 34, align = 'left') {
  if (a <= 0) return; const [x, y] = P2(v); if (align === 'left' && x + dx > 640) { align = 'right'; dx = Math.min(dx, -40); }
  ctx.save(); ctx.font = s3Font(size); let tw = ctx.measureText(title).width; if (sub) { ctx.font = s3Font(Math.round(size * 0.6)); tw = Math.max(tw, ctx.measureText(sub).width + 4); } ctx.restore();
  const lo = align === 'right' ? 60 + tw : align === 'center' ? 60 + tw / 2 : 60, hi = align === 'right' ? 1020 : align === 'center' ? 1020 - tw / 2 : 1020 - tw;
  const lx = clamp(x + dx, lo, Math.max(lo, hi)), ly = clamp(y + dy, 380, 1290);
  s3Leader(lx + (align === 'right' ? 8 : align === 'center' ? 0 : -8), ly + 10, x, y, c, a * 0.85, 1, 2); s3Label(lx, ly, title, sub, { alpha: a, color: c, size, align });
}
function chip(str, x, y, a, bg = '#cfe4ff', fg = '#0c1220', size = 30) { if (a <= 0) return; ctx.save(); screen(); ctx.font = s3Font(size); const w = ctx.measureText(str).width + 28; ctx.globalAlpha = clamp(a); ctx.fillStyle = bg; ctx.fillRect(x - w / 2, y - size * 0.85, w, size * 1.35); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.fillText(str, x, y + 2); ctx.restore(); }
// the paper inset: a histogram of time offsets with one tall bar (Wang 2003, fig. 3B style) drawn in code
function inset(a, y = 420) {
  if (a <= 0) return; const x0 = 140, w = 800, h = 250;
  ctx.save(); screen(); ctx.globalAlpha = clamp(a); ctx.fillStyle = '#f4f2ee'; ctx.fillRect(x0, y, w, h); ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 2; ctx.strokeRect(x0 + 50, y + 40, w - 80, h - 80);
  const R = RNG('hist'); for (let k = 0; k < 40; k++) { const bx = x0 + 60 + k * 17.5, bh = k === 26 ? h - 100 : R.r(2, 14); ctx.fillStyle = k === 26 ? '#1a3a8a' : '#4a4a58'; ctx.fillRect(bx, y + h - 40 - bh, 9, bh); }
  ctx.fillStyle = '#2a2a30'; ctx.font = s3Font(20); ctx.textAlign = 'center'; ctx.fillText('desfase de tiempo (grabación vs. canción)', x0 + w / 2, y + 28); ctx.fillText('coincidencias', x0 + w / 2, y + h - 12); ctx.restore();
  s3Text('FIG. 3B · WANG, ISMIR 2003', x0, y + h + 30, { size: 20, color: S3.note, alpha: a, spacing: 2 });
}
// ---- the app screen
function screenApp(x, o = {}) {
  const w = 540, h = 1120, g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a6af0'); g.addColorStop(1, '#0a3ab0'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const p = o.pulse ?? 0; for (let k = 0; k < 3; k++) { const rr = 130 + ((p + k / 3) % 1) * 160; x.strokeStyle = `rgba(255,255,255,${0.35 * (1 - ((p + k / 3) % 1))})`; x.lineWidth = 6; x.beginPath(); x.arc(w / 2, 520, rr, 0, TAU); x.stroke(); }
  x.fillStyle = '#fff'; x.beginPath(); x.arc(w / 2, 520, 120 * (1 + 0.05 * Math.sin(p * TAU)), 0, TAU); x.fill();
  x.strokeStyle = '#1a6af0'; x.lineWidth = 14; x.lineCap = 'round'; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(w / 2 - 20, 520, 26 + k * 24, -0.9, 0.9); x.stroke(); }
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = `700 40px ${S3.font}`; x.fillText(o.listening ? 'Escuchando…' : 'Toca para identificar', w / 2, 800);
  x.fillStyle = '#000'; x.beginPath(); x.roundRect(w / 2 - 80, 22, 160, 46, 23); x.fill();
}
// the app icon floating (a blue rounded square with the wave mark), drawn in 2D at a projected point
function appIcon(v, a, s = 90) { if (a <= 0) return; const [x, y] = P2(v); ctx.save(); screen(); ctx.globalAlpha = clamp(a); ctx.fillStyle = '#1a6af0'; ctx.beginPath(); ctx.roundRect(x - s / 2, y - s / 2, s, s, s * 0.24); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = s * 0.09; ctx.lineCap = 'round'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x - s * 0.12, y, s * (0.1 + k * 0.1), -0.9, 0.9); ctx.stroke(); } ctx.restore(); }
// a camera path over the field (pos, target as arrays)
const OVER = { pos: [-5.4, 2.4, 4.8], tgt: [0, 0.2, 0], fov: 40 };

const SHOT_FN = {
  rec(R, D) {
    const w = 1 - EZ.io(seg(R, 1.2, 3.4)); setField({ wave: w, reveal: EZ.o2(seg(R, 0, 1.0)) });
    setCam(camKeys(R, [[0, [-6.5, 1.0, 3.2], [-2, 0.3, 0], 42], [4.2, [-4.2, 2.6, 4.4], [0, 0.2, 0], 40]]), 0.6);
    D.push(() => { appIcon(V3(-5.7, 0.9, 1.6), K(R, 0.2, 0.3)); tag(V3(-3, 0.9, 1.8), -60, -160, w > 0.5 ? 'ruido' : 'canción', null, K(R, 0.6, 0.3), w > 0.5 ? S3.grey : S3.yellow, 32); });
    HUD.step = lerp(0, 1, 1 - w);
  },
  stars(R, D) {
    setField({ flat: 1, dim: 0.6 }); const at = setPeaks(EZ.o2(seg(R, 4.2, 5.2)), { lift: 1, y0: 0.4, stemA: 0.3 }); setLinks(EZ.io(seg(R, 4.8, 6.0)), at);
    setLinks2(EZ.io(seg(R, 5.4, 6.6)), at, V3(0, 0.0, 0), { a: K(R, 5.4, 0.4) });
    setCam(camKeys(R, [[4.2, [0, 7.5, 2.2], [0, 0, 0], 44], [7.0, [0.6, 7.0, 1.4], [0.2, 0, -0.2], 44]]), 0.4);
    D.push(() => { tag(at(Math.floor(PEAKS.length * 0.25)), 120, -120, 'canción de la base', null, K(R, 5.0, 0.3), '#3ce8a0', 30); tag(at(Math.floor(PEAKS.length * 0.5)), -80, 140, 'coincide', null, K(R, 6.0, 0.3), '#3ce8a0', 34); });
    HUD.step = 4;
  },
  melody(R, D) {
    setField({ wave: 1, dim: 0.2 }); const at = setPeaks(1, { lift: 1, y0: 1.5, stem: 0, size: 0.8 });
    setCam(camKeys(R, [[7.0, [-3, 1.6, 6.5], [0, 0.9, 0], 42], [10.2, [-1.5, 1.5, 6.0], [0.5, 0.9, 0], 42]]), 0.5);
    D.push(() => { const a = K(R, 7.3, 0.4); if (a <= 0) return; ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.beginPath(); for (let k = 0; k <= 60; k++) { const u = k / 60, [x, y] = P2(V3(lerp(-6, 6, u), 2.2 + 0.25 * Math.sin(u * 9) + 0.15 * Math.sin(u * 21), 0)); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
      tag(V3(-4, 2.3, 0), 40, -140, 'melodía', 'como la oyes tú', a, S3.white, 34); tag(at(Math.floor(PEAKS.length * 0.12)), 60, 160, 'lo que ve Shazam', 'puntos', K(R, 8.4, 0.3), S3.yellow, 32); });
    HUD.step = 0;
  },
  taqueria(R, D) {
    const g = g3(), X = g.TX; g.scene.fog.near = 3; g.scene.fog.far = 11;
    g.people.forEach((p, k) => { const t = Math.sin(R * 1.3 + k * 1.7) > 0.1 ? 0.8 : 0.1; pose(p, { ph: k, talk: t, gesture: t * (0.4 + 0.4 * Math.sin(R * 2 + k)), hand: k % 2, arm: p === g.people[g.people.length - 1] ? -0.15 : -0.6, elbow: -1.0, nod: 0.06 * Math.sin(R * 2.4 + k) }); });
    const ph = g.phone; ph.visible = true; ph.position.set(X - 0.2, 0.765 + 0.0045, 0.6); ph.rotation.set(-Math.PI / 2, 0, 0.3); paintScr(ph, screenLock, {});
    const tgt = ph.position.clone(), src = [V3(X - 3.55, 2.3, -1.0), wpt(g.people[0].userData.head, 0, 0.08, 0.1), wpt(g.people[3].userData.head, 0, 0.08, 0.1), V3(X + 0.9 + 0.25, 0.8, -1.6), wpt(g.people[5].userData.head, 0, 0.08, 0.1)];
    const t0s = [14.8, 12.6, 12.9, 13.4, 13.1];
    src.forEach((s, i) => { const u = EZ.io(seg(R, t0s[i], t0s[i] + 1.4)); if (u <= 0) return; const mid = s.clone().lerp(tgt, 0.5).add(V3(0, 0.6, 0)), pts = []; for (let k = 0; k <= 30; k++) { const t = k / 30, w = 0.04 * Math.sin(k * 1.3 + R * 8) * (i ? 1 : 0.4); const a = s.clone().lerp(mid, t), b = mid.clone().lerp(tgt, t); pts.push(a.lerp(b, t).add(V3(0, w, 0))); }
      tube(i, pts, u, i ? 0.008 : 0.014); for (let k = 0; k < 6; k++) { const f = (R * 0.8 + k / 6) % 1, j = Math.floor(f * 30 * u); spark(pts[j], i ? 0.05 : 0.08, 0.9 * Math.sin(f * Math.PI)); } });
    setCam(camKeys(R, [[10.2, [X + 3.4, 2.4, 4.2], [X - 0.4, 1.0, -0.6], 46], [14.6, [X + 2.6, 1.9, 3.1], [X - 0.4, 0.95, -0.4], 46], [18.4, [X + 0.9, 1.35, 1.7], [X - 0.2, 0.78, 0.6], 44]]), 0.6);
    D.push(() => { tag(src[1], -40, -120, 'pláticas', null, K(R, 12.8, 0.3), S3.grey, 30); tag(src[3], 60, -150, 'platos', null, K(R, 13.6, 0.3), S3.white, 30); tag(src[0], 40, -120, 'la canción', null, K(R, 15.0, 0.3), '#ffb03a', 34); tag(tgt, 80, 150, 'tu celular', null, K(R, 11.0, 0.3), S3.white, 30); });
    HUD.step = null;
  },
  app(R, D) {
    const g = g3(), ph = g.phone; ph.visible = true; ph.position.set(0, 0.004 * Math.sin(R * 1.4), 0); ph.rotation.set(-0.12, 0.12 * Math.sin(R * 0.6), 0.04); const tap = R > 18.9; paintScr(ph, screenApp, { listening: tap, pulse: tap ? (R * 0.9) % 1 : 0 });
    setCam(camKeys(R, [[18.4, [0.03, 0.01, 0.34], [0, 0, 0], 40], [20.0, [-0.02, 0.0, 0.28], [0, 0, 0], 40]]), 0.3);
    D.push(() => { if (R > 18.7 && R < 19.2) { const [x, y] = P2(V3(0, 0.02, 0.005)); ctx.save(); screen(); ctx.globalAlpha = 1 - seg(R, 18.9, 19.2); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(x, y, 40 + 60 * seg(R, 18.9, 19.2), 0, TAU); ctx.fill(); ctx.restore(); } });
    HUD.step = null;
  },
  mic(R, D) {
    const g = g3(), rev = EZ.io(seg(R, 20.0, 23.0)); setField({ wave: 1, reveal: 0.06 + 0.94 * rev });
    const front = V3(fxp(Math.floor(rev * NT)), 0.5, FZ0 + 0.3); g.micRing.visible = true; g.micRing.position.copy(front); g.micRing.rotation.set(0, Math.PI / 2, 0); g.micRing.scale.setScalar(1 + 0.08 * Math.sin(R * 8));
    setCam(camKeys(R, [[20.0, [-5.8, 1.3, 3.0], [-3.5, 0.4, 0], 42], [23.3, [-1.2, 2.2, 5.2], [1.5, 0.3, 0], 42]]), 0.5);
    D.push(() => { const s = (5 * rev).toFixed(1).replace('.', ','); s3Text(s + ' s', 900, 560, { size: 96, align: 'right', alpha: K(R, 20.4, 0.3) }); tag(front, 60, -150, 'micrófono', null, K(R, 20.3, 0.3), S3.white, 30); });
    HUD.step = 0;
  },
  field(R, D) {
    const g = g3(); setField({ wave: 1 }); g.DB.visible = true; g.scene.fog.near = 20; g.scene.fog.far = 90;
    setCam(camKeys(R, [[23.3, [-1.2, 2.2, 5.2], [1.5, 0.3, 0], 42], [26.0, [-4, 6.5, 8], [0, 0, -10], 46], [29.3, [-6, 9, 9], [0, 0, -12], 48]]), 0.5);
    D.push(() => { tag(V3(-2, 0.9, 0.5), 30, -150, 'tus 5 s', null, KO(R, 23.6, 27.4, 0.3), S3.white, 32); tag(V3(4, 0.7, -14), 0, -150, 'canciones completas', 'millones', K(R, 25.0, 0.3), S3.grey, 34, 'center');
      const a = K(R, 27.6, 0.3); if (a > 0) s3Text('lentísimo', CX, 1160, { size: 64, color: '#ff6a5a', align: 'center', alpha: a }); });
    HUD.step = 0;
  },
  back(R, D) {
    setField({ wave: 1 }); setCam(camKeys(R, [[29.3, [-6.5, 1.1, 3.4], [-2, 0.35, 0], 42], [32.0, [-5.6, 1.6, 4.0], [-1, 0.3, 0], 42]]), 0.5);
    D.push(() => { appIcon(V3(-5.6, 0.9, 1.6), SPR(R, 29.6, 0.4)); tag(V3(-3.5, 0.8, 1.6), 40, -170, 'grabación', null, K(R, 29.8, 0.3), S3.white, 30); });
    HUD.step = 0;
  },
  spec(R, D) {
    const w = 1 - EZ.io(seg(R, 32.6, 34.4)); setField({ wave: w });
    setCam(camKeys(R, [[32.0, [-5.6, 1.6, 4.0], [-1, 0.3, 0], 42], [34.5, [-4.6, 2.2, 4.6], [0, 0.3, 0], 42], [39.5, [4.2, 2.0, 4.6], [0, 0.35, 0], 42]]), 0.6);
    D.push(() => { const a = K(R, 34.8, 0.3); tag(V3(-6, 0.05, FZ0 + 0.1), 20, 140, 'tiempo →', null, a, S3.white, 30); tag(V3(6.1, 0.05, 0), -20, 150, 'frecuencia', 'graves al frente', K(R, 35.6, 0.3), S3.white, 30); tag(V3(1.2, 1.2, 0.2), 60, -170, 'volumen', 'qué tan fuerte', K(R, 36.6, 0.3), '#ffb03a', 32); });
    HUD.step = lerp(0, 1, 1 - w);
  },
  flat(R, D) {
    const f = EZ.io(seg(R, 39.6, 41.0)); setField({ flat: f });
    setCam(camKeys(R, [[39.5, [4.2, 2.0, 4.6], [0, 0.35, 0], 42], [41.0, [0.4, 8.5, 2.0], [0, 0, 0], 44], [43.0, [0.2, 8.0, 1.5], [0, 0, -0.1], 44]]), 0.4);
    D.push(() => { tag(V3(-2.3, 0.05, 0.6), 40, -150, 'fuerte', null, K(R, 41.0, 0.3), '#ffb03a', 32); tag(V3(2.4, 0.05, -1.4), -40, 150, 'suave', null, K(R, 41.4, 0.3), '#1aa8a8', 32); });
    HUD.step = 1;
  },
  const(R, D) {
    setField({ flat: 1, dim: EZ.io(seg(R, 43.0, 44.2)) * 0.8 }); setPeaks(EZ.o2(seg(R, 43.1, 44.6)), { flat: 1, stemA: 0 });
    setCam(camKeys(R, [[43.0, [0.2, 8.0, 1.5], [0, 0, -0.1], 44], [45.3, [0.0, 7.0, 1.0], [0, 0, -0.1], 44]]), 0.4);
    D.push(() => { const a = K(R, 44.2, 0.3); if (a > 0) s3Text('una constelación', CX, 1160, { size: 56, color: S3.yellow, align: 'center', alpha: a }); });
    HUD.step = 2;
  },
  cut(R, D) {
    const g = g3(), lv = lerp(0.2, 0.62, EZ.io(seg(R, 45.6, 47.0))); setField({ dim: 0.3 }); setPeaks(1, { stemA: 0.6 });
    g.cutP.visible = true; g.cutP.position.set(0, lv, 0);
    setCam(camKeys(R, [[45.3, [1, 1.2, 6.5], [0, 0.5, 0], 40], [48.5, [-1, 1.0, 6.0], [0, 0.5, 0], 40]]), 0.5);
    D.push(() => { tag(V3(-6, lv, FZ0), 30, -60, 'corte', 'debajo se descarta', K(R, 45.8, 0.3), '#7ad8ff', 30); inset(K(R, 46.4, 0.4) * (1 - seg(R, 48.0, 48.4)) * 0, 400); });
    HUD.step = 2;
  },
  peaks(R, D) {
    setField({ dim: 0.55 }); const ks = [PEAKS.findIndex((p) => p.j <= 5), PEAKS.findIndex((p) => p.j >= 14 && p.j <= 22), PEAKS.findIndex((p) => p.j >= 26)];
    const show = [0, 1, 2].filter((n) => R > [48.6, 49.8, 51.6][n]), at = setPeaks(1, { only: show.map((n) => ks[n]), size: 1.6 });
    const c = at(ks[Math.min(show.length, 3) - 1] ?? ks[0]);
    setCam(camKeys(R, [[48.5, [fxp(PEAKS[ks[0]].i) - 1.2, 0.9, 2.6], [fxp(PEAKS[ks[0]].i), 0.4, 0], 40], [50.5, [fxp(PEAKS[ks[1]].i) - 1.0, 1.4, 2.6], [fxp(PEAKS[ks[1]].i), 0.6, -0.4], 40], [54.5, [fxp(PEAKS[ks[2]].i) - 1.6, 1.6, 3.0], [fxp(PEAKS[ks[2]].i) - 0.4, 0.6, -0.8], 40]]), 0.5);
    D.push(() => { const L = ['bajo', 'voz', 'tambor']; const fo = 1 - seg(R, 54.0, 54.3); show.forEach((n) => tag(at(ks[n]), n === 1 ? -60 : 50, [-150, -260, -150][n] + (n === 2 ? 120 : 0), L[n], null, K(R, [48.6, 49.8, 51.6][n], 0.3) * fo, S3.yellow, 36));
      if (R > 52.6 && show.length > 2) { const [x0, y0] = P2(at(ks[1])), [x1, y1] = P2(at(ks[2])); ctx.save(); screen(); ctx.globalAlpha = K(R, 52.6, 0.3); ctx.strokeStyle = S3.white; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); chip('+0,25 s', clamp((x0 + x1) / 2, 140, 940), Math.max(y0, y1) + 70, K(R, 52.7, 0.3) * (1 - seg(R, 54.0, 54.3))); } });
    HUD.step = 2;
  },
  zone(R, D) {
    const g = g3(); setField({ dim: 0.7, flat: 0.4 }); const at = setPeaks(1, { flat: 0.4, stemA: 0.3 }), a0 = Math.floor(PEAKS.length * 0.37), A = at(a0);
    g.zone.visible = true; g.zone.position.set(A.x + 0.55, 0.05, A.z); g.zone.scale.set(1.0 * K(R, 54.9, 0.5), 1, 1.6 * K(R, 54.9, 0.5));
    const mine = LINKS.filter(([p]) => p === a0).length; setLinks(EZ.io(seg(R, 55.6, 57.2)) * (LINKS.findIndex(([p]) => p > a0) / LINKS.length), at);
    setCam(camKeys(R, [[54.5, [A.x - 1.4, 2.0, A.z + 2.4], [A.x + 0.4, 0.3, A.z], 40], [58.6, [A.x - 1.8, 2.6, A.z + 2.8], [A.x + 0.5, 0.3, A.z], 40]]), 0.4);
    D.push(() => { tag(A, -60, -160, 'ancla', null, K(R, 54.9, 0.3), S3.yellow, 34); tag(V3(A.x + 1.05, 0.05, A.z - 0.8), 30, -120, 'zona objetivo', null, K(R, 55.3, 0.3), '#7ad8ff', 30); chip('f1 · f2 · +0,25 s', CX, 1130, K(R, 57.0, 0.3), '#f6f3ec'); s3Text('= una huella', CX, 1190, { size: 30, color: S3.note, align: 'center', alpha: K(R, 57.3, 0.3) }); });
    HUD.step = 3;
  },
  song(R, D) {
    setField({ dim: 0.5 }); const at = setPeaks(1, { stemA: 0.4 }); setLinks(EZ.io(seg(R, 58.6, 61.0)), at);
    setCam(camKeys(R, [[58.6, [-6.5, 2.2, 3.4], [-1, 0.4, 0], 42], [63.3, [5.5, 2.6, 4.0], [1, 0.4, 0], 42]]), 0.5);
    D.push(() => { const n = Math.round(LINKS.length * EZ.io(seg(R, 58.6, 61.0))); tag(V3(2, 1.2, -1), 30, -170, `${n} huellas`, 'no toda la canción', K(R, 59.2, 0.3), S3.yellow, 36); });
    HUD.step = 3;
  },
  send(R, D) {
    const g = g3(); setField({ wave: 1, dim: 0.4 }); g.server.visible = true; const at = setPeaks(1, { lift: 1, y0: 1.2, stem: 0, size: 0.7 }); g.stems.visible = g.rings.visible = false;
    const u = EZ.io(seg(R, 63.6, 65.6)); g.keys.visible = true; for (let k = 0; k < 60; k++) { const p = at(k % PEAKS.length), s = V3(0, 1.8, -13.6), q = p.clone().lerp(s, clamp(u * 1.3 - (k % 10) * 0.03)); q.y += Math.sin(clamp(u) * Math.PI) * 1.2; _m4.compose(q, _q4, V3(1, 1, 1)); g.keys.setMatrixAt(k, _m4); } g.keys.instanceMatrix.needsUpdate = true; g.heads.visible = u < 0.05;
    setCam(camKeys(R, [[63.3, [-4, 2.6, 5.2], [0, 0.8, -2], 44], [66.2, [-3, 4.4, 4.0], [0, 1.0, -8], 44]]), 0.5);
    D.push(() => { tag(V3(0, 1.8, -13.6), 0, -150, 'servidores', null, K(R, 64.2, 0.3), '#7ad8ff', 32, 'center'); tag(V3(-3, 0.6, 1), -30, 150, 'el audio se queda', 'solo viajan las huellas', K(R, 64.6, 0.3), S3.grey, 28); });
    HUD.step = 3;
  },
  db(R, D) {
    const g = g3(); g.DB.visible = true; g.scene.fog.near = 6; g.scene.fog.far = 40; const at = setPeaks(1, { lift: 1, y0: 1.6, stem: 0, size: 0.8 }); g.stems.visible = false; setLinks(1, at);
    setCam(camKeys(R, [[66.2, [-12, 2.6, -8], [0, 1.0, -14], 50], [69.6, [-4, 2.4, -10], [6, 1.0, -15], 50]]), 0.5);
    D.push(() => { tag(V3(-6, 0.8, -12), -20, -150, 'canciones guardadas', null, K(R, 66.6, 0.3), S3.grey, 32); tag(at(Math.floor(PEAKS.length * 0.5)), 40, -140, 'tus huellas', null, K(R, 67.0, 0.3), S3.yellow, 32); });
    HUD.step = 4;
  },
  one(R, D) {
    setField({ flat: 1, dim: 0.9 }); const at = setPeaks(1, { lift: 1, y0: 0.3, stemA: 0 }); setLinks(0, at); const k = Math.floor(PEAKS.length * 0.42);
    setLinks2(0.02, at, V3(0, 0.0, -0.001), { a: 0 }); g3().heads2.visible = false;
    setCam(camKeys(R, [[69.6, [0, 6.5, 1.4], [0, 0, 0], 44], [73.6, [0.3, 6.0, 1.0], [0, 0, 0], 44]]), 0.4);
    D.push(() => { const A = at(k), B = V3(A.x + 0.8, 0.3, A.z - 0.6), [x0, y0] = P2(A), [x1, y1] = P2(B), a = K(R, 71.8, 0.3); if (a > 0) { ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = '#3ce8a0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.fillStyle = '#3ce8a0'; ctx.beginPath(); ctx.arc(x1, y1, 10, 0, TAU); ctx.fill(); ctx.restore(); }
      tag(B, 40, 120, '1 coincidencia', 'no basta', K(R, 72.0, 0.3), S3.white, 34); s3Text('otra canción', 160, 1150, { size: 26, color: S3.note, alpha: K(R, 70.0, 0.3), spacing: 2 }); });
    HUD.step = 4;
  },
  many(R, D) {
    const g = g3(); setField({ flat: 1, dim: 0.9 }); const at = setPeaks(1, { lift: 1, y0: 0.3, stemA: 0 }); setLinks(1, at, { a: 0.4 });
    const s = EZ.io(seg(R, 74.0, 77.0)); setLinks2(1, at, V3(lerp(1.5, 0, s), lerp(0.6, 0, s), lerp(-1.2, 0, s)), { a: 0.9 });
    g.bars.visible = true; for (let k = 0; k < 24; k++) { const hh = k === 12 ? 0.2 + 1.6 * s : 0.08 + 0.3 * RNG('b', k).f(); _m4.compose(V3(-2.4 + k * 0.2, hh / 2, 2.6), _q4, V3(1, hh, 1)); g.bars.setMatrixAt(k, _m4); } g.bars.instanceMatrix.needsUpdate = true;
    setCam(camKeys(R, [[73.6, [-3.5, 3.0, 6.0], [0, 0.4, 0.5], 44], [79.0, [-2.5, 2.6, 5.4], [0, 0.5, 0.8], 44]]), 0.5);
    D.push(() => { tag(V3(0.0, 0.4, 2.6), 60, 150, 'coincidencias por desfase', null, K(R, 74.4, 0.3), S3.note, 28); chip('¿mismos espacios?', CX, 560, KO(R, 76.0, 78.8, 0.3), '#f6f3ec'); });
    HUD.step = 4;
  },
  agree(R, D) {
    const g = g3(); setField({ flat: 1, dim: 0.9 }); const at = setPeaks(1, { lift: 1, y0: 0.3, stemA: 0 }); setLinks(1, at, { a: 0.3 }); setLinks2(1, at, V3(0, 0, 0), { a: 1 });
    const hh = lerp(1.8, 3.4, EZ.back(seg(R, 79.0, 79.8))); g.bigBar.visible = true; g.bigBar.position.set(0, hh / 2, 2.6); g.bigBar.scale.set(1, hh, 1);
    for (let k = 0; k < 6; k++) { const Rn = RNG('ag', k), u = seg(R, 79.0, 80.2); spark(V3(Rn.n(0.6), hh * u + Rn.r(0, 0.3), 2.6 + Rn.n(0.3)), 0.12, (1 - u) * 1.2); }
    setCam(camKeys(R, [[79.0, [-2.5, 2.6, 7.4], [0, 1.4, 1.5], 44], [83.0, [-1.6, 2.4, 7.0], [0, 1.6, 1.5], 44]]), 0.5);
    D.push(() => chip('50 huellas coinciden', CX, 430, SPR(R, 79.2, 0.4) > 0 ? clamp(SPR(R, 79.2, 0.4)) : 0, '#3ce8a0', '#062a1a', 40));
    HUD.step = 4;
  },
  noise(R, D) {
    const n = EZ.io(seg(R, 83.2, 85.6)); setField({ noise: n }); const at = setPeaks(1, { stemA: 0.7 });
    setCam(camKeys(R, [[83.0, [-5, 2.2, 4.8], [0, 0.4, 0], 42], [88.6, [4.5, 2.6, 4.6], [0, 0.45, 0], 42]]), 0.6);
    D.push(() => { tag(V3(-1, 0.9, -0.2), -40, -170, 'gente hablando', null, K(R, 83.6, 0.3), S3.grey, 32); tag(at(Math.floor(PEAKS.length * 0.62)), 50, -140, 'picos que sobreviven', null, K(R, 86.2, 0.3), S3.yellow, 32); const a = K(R, 87.2, 0.3); if (a > 0) s3Text('grabación sucia', CX, 1160, { size: 44, color: S3.note, align: 'center', alpha: a }); });
    HUD.step = 2;
  },
  hist(R, D) {
    const g = g3(); setField({ flat: 1, dim: 0.9, noise: 1 }); const at = setPeaks(1, { lift: 1, y0: 0.3, stemA: 0 }); setLinks(1, at, { a: 0.3 }); setLinks2(0.7, at, V3(0, 0, 0), { a: 1 });
    const hh = 2.6; g.bigBar.visible = true; g.bigBar.position.set(0, hh / 2, 2.6); g.bigBar.scale.set(1, hh, 1);
    g.bars.visible = true; for (let k = 0; k < 24; k++) { const b = k === 12 ? 0.001 : 0.08 + 0.4 * RNG('b2', k).f(); _m4.compose(V3(-2.4 + k * 0.2, b / 2, 2.6), _q4, V3(1, b, 1)); g.bars.setMatrixAt(k, _m4); } g.bars.instanceMatrix.needsUpdate = true;
    setCam(camKeys(R, [[88.6, [-2.4, 2.4, 7.2], [0, 1.2, 1.5], 44], [93.4, [-1.6, 2.6, 6.8], [0, 1.4, 1.5], 44]]), 0.5);
    D.push(() => { inset(K(R, 89.0, 0.4), 400); chip('34 huellas siguen coincidiendo', CX, 790, K(R, 89.8, 0.3), '#3ce8a0', '#062a1a', 34); });
    HUD.step = 4;
  },
  again(R, D) {
    setField({ wave: 1 }); setCam(camKeys(R, [[93.4, [-6.5, 1.1, 3.4], [-2, 0.35, 0], 42], [95.5, [-5.4, 1.5, 4.0], [-1, 0.3, 0], 42]]), 0.5);
    D.push(() => appIcon(V3(-5.6, 0.9, 1.6), K(R, 93.6, 0.3)));
    HUD.step = 0;
  },
  nomel(R, D) {
    const w = 1 - EZ.io(seg(R, 95.6, 96.6)); setField({ wave: w }); const at = setPeaks(EZ.o2(seg(R, 96.2, 97.4)), { stemA: 0.6 });
    setCam(camKeys(R, [[95.5, [-5.4, 1.5, 4.0], [-1, 0.3, 0], 42], [99.0, [0, 3.2, 5.5], [0.5, 0.4, 0], 42]]), 0.5);
    D.push(() => { const a = KO(R, 97.0, 98.8, 0.3); if (a > 0) { ctx.save(); screen(); ctx.globalAlpha = a * 0.7; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.beginPath(); for (let k = 0; k <= 60; k++) { const u = k / 60, [x, y] = P2(V3(lerp(-6, 6, u), 1.9 + 0.25 * Math.sin(u * 9), 0)); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); tag(V3(-3.5, 2.0, 0), 30, -130, '¿melodía?', 'no la usa', a, S3.white, 32); } });
    HUD.step = 2;
  },
  end(R, D) {
    setField({ dim: EZ.io(seg(R, 99.2, 101)) * 0.85 }); const at = setPeaks(1, { lift: EZ.io(seg(R, 99.4, 101.0)), y0: 1.0, stemA: 0.4 }); setLinks(EZ.io(seg(R, 99.6, 101.4)), at);
    setLinks2(EZ.io(seg(R, 101.0, 102.6)), at, V3(0, 0, 0), { a: K(R, 101.0, 0.5) });
    setCam(camKeys(R, [[99.0, [0, 3.2, 5.5], [0.5, 0.4, 0], 42], [104.23, [-1.5, 5.5, 6.8], [0, 0.8, 0], 44]]), 0.5);
    D.push(() => { tag(at(Math.floor(PEAKS.length * 0.56)), 40, -160, 'una sola canción', 'cuyo patrón encaja', K(R, 102.0, 0.3), '#3ce8a0', 36); const e = K(R, 103.2, 0.4); if (e > 0) s3Text('DOPAMENTES', CX, H / 2, { size: 44, align: 'center', alpha: e * 0.95, spacing: 6 }); });
    HUD.step = 4;
  },
};
