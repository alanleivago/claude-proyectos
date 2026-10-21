// =====================================================================
//  SHOTS — every shot of reference 9 in reference time R (RNOW = refT(TT)), then the HUD and the captions.
//  Everything moves: people breathe, blink, look and talk; things pop in with a spring; the camera always drifts.
// =====================================================================
const K = (R, a, d = 0.35) => EZ.o2(seg(R, a, a + d));
const KO = (R, a, b, d = 0.35) => Math.min(K(R, a, d), 1 - EZ.i2(seg(R, b - d, b)));
const SPR = (R, a, d = 0.45) => (R < a ? 0 : EZ.back(seg(R, a, a + d)));   // spring pop 0 → 1 with overshoot
let HUD = { pill: '' };

function sceneMain() {
  const R = (RNOW = refT(TT)), g = g3();
  const run = (key, alpha) => { resetWorld(); HUD = { pill: '' }; pose(g.friend, { ph: 0, look: g.you.position }); pose(g.you, { ph: 2, look: g.friend.position }); const D = []; SHOT_FN[key](R, D); renderWorld(alpha); return { D, pill: HUD.pill }; };
  // seamless: every shot boundary is a 0.5 s dissolve (both shots rendered, both cameras still moving)
  let i = SHOTS_R.findIndex(([, a, b]) => R >= a && R < b); if (i < 0) i = SHOTS_R.length - 1; const XF = 0.25; let out;
  const nb = SHOTS_R[i + 1], pb = SHOTS_R[i - 1];
  if (nb && R > nb[1] - XF) { const u = EZ.io(seg(R, nb[1] - XF, nb[1] + XF)), A = run(SHOTS_R[i][0], 1), B = run(nb[0], u); out = u < 0.5 ? A : B; }
  else if (pb && R < SHOTS_R[i][1] + XF) { const u = EZ.io(seg(R, SHOTS_R[i][1] - XF, SHOTS_R[i][1] + XF)), A = run(pb[0], 1), B = run(SHOTS_R[i][0], u); out = u < 0.5 ? A : B; }
  else out = run((SHOTS_R[i] || SHOTS_R[SHOTS_R.length - 1])[0], 1);
  out.D.forEach((f) => f()); HUD.pill = out.pill;
  const hud = () => { if (HUD.pill) s3Pill(HUD.pill, 1, { y: 290 }); s3Caption(TT); };
  if (DEFER) DEFER.push(hud); else hud();
}
// ---- 2D helpers
function tag(v, dx, dy, title, sub, a, c = S3.yellow, size = 40, align = 'left') {
  if (a <= 0) return; const [x, y] = P2(v); if (align === 'left' && x + dx > 640) { align = 'right'; dx = Math.min(dx, -40); }
  ctx.save(); ctx.font = s3Font(size); let tw = ctx.measureText(title).width; if (sub) { ctx.font = s3Font(Math.round(size * 0.6)); tw = Math.max(tw, ctx.measureText(sub).width + 4); } ctx.restore();
  const lo = align === 'right' ? 60 + tw : align === 'center' ? 60 + tw / 2 : 60, hi = align === 'right' ? 1020 : align === 'center' ? 1020 - tw / 2 : 1020 - tw;
  const lx = clamp(x + dx, lo, Math.max(lo, hi)), ly = clamp(y + dy, 380, 1300);
  s3Leader(lx + (align === 'right' ? 8 : align === 'center' ? 0 : -8), ly + 10, x, y, c, a * 0.85, 1, 2.5); s3Label(lx, ly, title, sub, { alpha: a, color: c, size, align });
}
function bubble(v, dx, dy, str, a) {   // a speech bubble that pops in (a = spring 0..1+)
  if (a <= 0) return; const [x0, y0] = P2(v); ctx.save(); screen(); ctx.font = s3Font(34); const w = ctx.measureText(str).width + 48, h = 70, x = clamp(x0 + dx, 60 + w / 2, 1020 - w / 2), y = y0 + dy;
  ctx.translate(x, y); ctx.scale(a, a);
  ctx.globalAlpha = clamp(a); ctx.fillStyle = '#f6f3ec'; ctx.beginPath(); ctx.roundRect(-w / 2, -h, w, h, 22); ctx.fill(); ctx.beginPath(); ctx.moveTo(-14, -2); ctx.lineTo(-dx * 0.12, 26); ctx.lineTo(10, -2); ctx.fill();
  ctx.fillStyle = '#16161c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, 0, -h / 2 + 2); ctx.restore();
}
function bigNumber(str, sub, a, y = 560, c = S3.white) { if (a <= 0) return; s3Text(str, CX, y, { size: 130, color: c, align: 'center', alpha: a }); if (sub) s3Text(sub, CX, y + 50, { size: 24, color: S3.note, align: 'center', alpha: a, spacing: 3 }); }
// ---- 3D helpers
const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
function vibrate(p, R, t0, d = 0.5) { if (R < t0 || R > t0 + d) return; const k = 1 - (R - t0) / d; p.rotation.z += 0.05 * k * Math.sin(R * 90); p.position.x += 0.002 * k * Math.sin(R * 77); }
function holdUp(p, x, y, z, R, ph = 0) { p.position.set(x, y + 0.004 * Math.sin(R * 1.3 + ph), z); p.rotation.set(-0.12 + 0.02 * Math.sin(R * 0.9 + ph), 0.18 * Math.sin(R * 0.35 + ph), 0.04 * Math.sin(R * 0.7 + ph)); }
function rings(p, R, a) {   // sound rings rising off the phone's mic
  const g = g3(), base = ppt(p, 0, -PH / 2, 0);
  g.rings.forEach((q, i) => { const ph = (R * 0.55 + i / g.rings.length) % 1; q.visible = a > 0; q.position.copy(base).add(V3(0, 0.02 + ph * 0.9, 0)); q.rotation.set(Math.PI / 2, 0, 0); q.scale.setScalar(0.04 + ph * 0.32); g.ringM[i].opacity = a * 0.85 * (1 - ph) * Math.min(1, ph * 6); });
}
function wifiRings(c, R, a) { const g = g3(); g.wifi.forEach((q, i) => { const ph = (R * 0.6 + i / g.wifi.length) % 1; q.visible = a > 0; q.position.copy(c).add(V3(0, 0.12, 0)); q.rotation.set(-Math.PI / 2, 0, 0); q.scale.setScalar(0.08 + ph * 1.4); g.wifiM[i].opacity = a * 0.7 * (1 - ph); }); }
function flowSparks(pts, R, a, n = 12, s = 0.05) { if (!pts || a <= 0) return; for (let k = 0; k < n; k++) { const u = (R * 0.7 + k / n) % 1, i = Math.floor(u * (pts.length - 1)); spark(pts[i], s, a * Math.sin(u * Math.PI)); } }
function arcPath(a, b, h, u = 1) { const mid = a.clone().lerp(b, 0.5).add(V3(0, h, 0)), out = []; for (let k = 0; k <= 40; k++) { const t = (k / 40) * u, p = a.clone().lerp(mid, t), p2 = mid.clone().lerp(b, t); out.push(p.lerp(p2, t)); } return out; }

const SHOT_FN = {
  rings(R, D) {
    const g = g3(), p = g.phoneY; paintScr(p, screenLock, {}); p.userData.micGlow.material.opacity = 0.5 + 0.4 * Math.sin(R * 6);
    rings(p, R, K(R, 0.1, 0.4));
    pose(g.friend, { ph: 0, look: g.you.position, talk: 0.6 }); pose(g.you, { ph: 2, look: g.friend.position, talk: 0.2 });
    setCam(camKeys(R, [[0, [0.45, 1.05, 0.0], [0.14, 0.6, -1.2], 40], [3.6, [0.3, 0.72, -0.82], [0.14, 0.52, -1.2], 40]]), 0.6);
    D.push(() => tag(ppt(p, 0, -PH / 2, 0), 150, 140, 'micrófono', '¿escuchando?', K(R, 0.6, 0.3), '#ff9a4a', 40));
    HUD.pill = '¿TE ESTÁ ESCUCHANDO?';
  },
  lock(R, D) {
    const g = g3(), p = g.phoneY, n = SPR(R, 5.0, 0.5); paintScr(p, screenLock, { notif: n }); vibrate(p, R, 5.0, 0.5);
    const c = ppt(p, 0, 0, 0); setCam(camKeys(R, [[3.6, [c.x + 0.02, c.y + 0.36, c.z + 0.16], [c.x, c.y, c.z - 0.01], 40], [7.3, [c.x + 0.01, c.y + 0.25, c.z + 0.1], [c.x, c.y, c.z - 0.01], 40]]), 0.4);
    HUD.pill = R < 5.0 ? 'TU CELULAR' : 'UN ANUNCIO';
  },
  sala(R, D) {
    const g = g3(); paintScr(g.phoneY, screenLock, {}); paintScr(g.phoneF, screenLock, {});
    const fT = KO(R, 8.6, 10.0, 0.2), yT = KO(R, 10.0, 11.3, 0.2);
    pose(g.friend, { ph: 0, look: g.you.position, talk: fT, gesture: fT * (0.6 + 0.4 * Math.sin(R * 4)), hand: 1 });
    pose(g.you, { ph: 2, look: g.friend.position, talk: yT, gesture: yT * 0.7, hand: 0, nod: R > 11.3 ? 0.08 * Math.sin(R * 6) : 0 });
    setCam(camKeys(R, [[7.3, [0.1, 1.25, 2.1], [0, 0.95, -2.2], 42], [12.3, [-0.05, 1.18, 1.4], [0, 0.95, -2.2], 42]]), 0.6);
    D.push(() => {
      tag(V3(-0.55, 1.5, -2.33), -40, -120, 'tu amigo', null, KO(R, 7.5, 9.2, 0.25), S3.white, 34); tag(V3(0.55, 1.5, -2.33), 40, -120, 'tú', null, KO(R, 7.6, 9.2, 0.25), S3.white, 34);
      bubble(V3(-0.55, 1.5, -2.33), -40, -40, 'necesito una nueva…', SPR(R, 9.0) * (1 - seg(R, 11.6, 11.9))); bubble(V3(0.55, 1.5, -2.33), 40, -40, '¿cuál?', SPR(R, 10.2) * (1 - seg(R, 11.6, 11.9)));
      const a = SPR(R, 10.9, 0.4); if (a > 0) { ctx.save(); screen(); const w = 640 * Math.min(1, a), x = CX - w / 2, y = 1160; ctx.globalAlpha = clamp(a); ctx.fillStyle = '#f6f3ec'; ctx.beginPath(); ctx.roundRect(x, y, w, 76, 38); ctx.fill(); ctx.restore();
        s3Text('freidora de aire', x + 36, y + 51, { size: 32, color: '#16161c', alpha: clamp(a) }); s3Text('NUNCA LA BUSCASTE', CX + 300, y + 50, { size: 22, color: '#e8283a', align: 'right', alpha: K(R, 11.3, 0.3), spacing: 2 }); }
    });
    HUD.pill = 'EN CASA DE UN AMIGO';
  },
  manana(R, D) {
    const g = g3(), p = g.phoneY; morning();
    if (R < 13.46) paintScr(p, screenOff); else paintScr(p, screenLock, { notif: SPR(R, 13.5, 0.4) }); vibrate(p, R, 13.46, 0.6);
    const pop = SPR(R, 13.55, 0.55), c = ppt(p, 0, 0, 0);
    if (pop > 0) { g.fryer.visible = true; g.fryer.scale.setScalar(pop * 0.42); g.fryer.position.set(c.x, c.y + 0.006 + 0.012 * pop, c.z); g.fryer.rotation.y = -0.4 + (R - 13.55) * 0.35; }
    if (R > 13.5 && R < 14.6) for (let k = 0; k < 24; k++) { const Rn = RNG('pop', k), u = seg(R, 13.5, 14.6), a = Rn.f() * TAU; spark(c.clone().add(V3(Math.cos(a) * u * Rn.r(0.15, 0.35), 0.05 + u * Rn.r(0.1, 0.4), Math.sin(a) * u * Rn.r(0.15, 0.35))), 0.03, 1 - u); }
    setCam(camKeys(R, [[12.3, [c.x + 0.2, c.y + 0.22, c.z + 0.5], [c.x, c.y + 0.03, c.z], 42], [16.3, [c.x + 0.16, c.y + 0.26, c.z + 0.46], [c.x, c.y + 0.08, c.z], 42]]), 0.5);
    D.push(() => { tag(c.clone().add(V3(0, 0.16, 0)), 0, -130, 'PATROCINADO', 'esa misma freidora', K(R, 14.0, 0.3), '#ffb42a', 38, 'center'); });
    HUD.pill = 'LA MAÑANA SIGUIENTE';
  },
  mic(R, D) {
    const g = g3(), p = g.phoneY; paintScr(p, screenLock, {}); const on = 1 - seg(R, 19.3, 19.9);
    p.userData.micGlow.material.opacity = on * (0.75 + 0.25 * Math.sin(R * 7)); p.userData.micGlow.scale.set(1 + 0.3 * on * Math.sin(R * 7), 1, 1);
    const b = ppt(p, 0, -PH / 2, 0); g.glowO.visible = on > 0.01; g.glowO.position.copy(b).add(V3(0, 0.002, 0.004)); const gs = 0.03 + 0.01 * Math.sin(R * 7); g.glowO.scale.set(gs * 1.8, gs, 1); g.glowO.material.opacity = on;
    setCam(camKeys(R, [[16.3, [b.x + 0.09, b.y + 0.025, b.z + 0.1], [b.x - 0.005, b.y, b.z], 34], [21.0, [b.x - 0.05, b.y + 0.035, b.z + 0.11], [b.x + 0.005, b.y, b.z], 34]]), 0.3);
    D.push(() => tag(b, 120, -200, 'micrófono', on > 0.5 ? '¿encendido?' : 'probablemente no', K(R, 16.6, 0.3), on > 0.5 ? '#ff9a4a' : S3.note, 40));
    HUD.pill = R < 19.3 ? '¿ESTABA ENCENDIDO?' : 'PROBABLEMENTE NO';
  },
  apps(R, D) {
    const g = g3(), N = g.N, m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), sx = lerp(-34, 34, EZ.io(seg(R, 21.66, 25.2)));
    let k = 0; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++, k++) { const x = (i - N / 2) * 1.05, z = (j - N / 2) * 1.05, d = sx - x;
      const lift = d > 0 && d < 4 ? Math.sin((d / 4) * Math.PI) * 0.55 : 0, wob = 0.05 * Math.sin(R * 2 + i * 0.4 + j * 0.3), done = R > 25.9 ? 0.08 * Math.sin(R * 6 + i + j) * (1 - seg(R, 25.9, 27.0)) : 0;
      m.compose(V3(100 + x, 0.11 + lift + wob + done, z), q, V3(1, 1, 1)); g.apps.setMatrixAt(k, m); }
    g.apps.instanceMatrix.needsUpdate = true;
    setCam(camKeys(R, [[21.0, [78, 7, 16], [96, 0, -4], 50], [25.4, [96, 5, 10], [106, 0, -6], 50], [28.8, [101, 4, 6], [110, 0, -8], 50]]), 0.3);
    D.push(() => { const n = 17260 * EZ.o2(seg(R, 21.66, 25.2)), a = K(R, 21.7, 0.3) * (1 - seg(R, 25.5, 25.8));
      bigNumber(fmt(n), 'APPS REVISADAS · ESTUDIO DE 2018 · ANDROID', a); const b = SPR(R, 25.9, 0.5); if (b > 0) bigNumber('0', 'MANDANDO AUDIO EN SECRETO', clamp(b), 560, S3.cyan); });
    HUD.pill = 'LO REVISARON';
  },
  bateria(R, D) {
    const g = g3(), p = g.phoneY, bt = lerp(0.97, 0.07, EZ.i2(seg(R, 30.2, 33.8))); holdUp(p, 0, 1.0, 0, R); paintScr(p, screenHome, { battery: bt, sat: 0.35 + 0.65 * bt, dot: true });
    setCam(camKeys(R, [[28.8, [0.02, 1.0, 0.36], [0, 1.0, 0], 40], [34.5, [-0.01, 0.99, 0.3], [0, 1.0, 0], 40]]), 0.4);
    D.push(() => { const v = Math.round(bt * 100); s3Readout(String(v), '%', 'BATERÍA · MICRÓFONO TODO EL DÍA', K(R, 29.6, 0.3), { y: 1300, bar: v < 20 ? '#ff4a3a' : S3.yellow, color: v < 20 ? '#ff6a5a' : S3.white }); });
    HUD.pill = 'MICRÓFONO TODO EL DÍA';
  },
  punto(R, D) {
    const g = g3(), p = g.phoneY; holdUp(p, 0, 1.0, 0, R); paintScr(p, screenHome, { battery: 0.07, sat: 0.4, dot: true });
    const dot = ppt(p, (322 / 540 - 0.5) * (PW - 0.005), (0.5 - 45 / 1120) * (PH - 0.005), PD / 2 + 0.003);
    spark(dot, 0.012 + 0.004 * Math.sin(R * 5), 0.9);
    setCam(camKeys(R, [[34.5, [0.02, 1.06, 0.2], [0.005, 1.065, 0], 40], [37.9, [0.012, 1.068, 0.12], [0.006, 1.068, 0], 40]]), 0.25);
    D.push(() => tag(dot, 120, 160, 'micrófono en uso', 'nunca se iría', K(R, 34.8, 0.3), '#ff9a2a', 40));
    HUD.pill = 'EL PUNTITO';
  },
  dos(R, D) {
    const g = g3(), t = R - 37.9; paintScr(g.phoneF, screenLock, {}); paintScr(g.phoneY, screenLock, {});
    for (const [p, x, y, z, ph] of [[g.phoneF, -0.16, 1.02, -0.3, 0], [g.phoneY, 0.18, 0.96, -0.45, 2]]) { p.position.set(x, y + 0.01 * Math.sin(R * 1.6 + ph), z); p.rotation.set(-0.3 + 0.2 * Math.sin(R * 0.8 + ph), 0.6 * Math.sin(R * 0.5 + ph) + t * 0.3, 0.3 * Math.sin(R * 0.6 + ph)); }
    setCam(camKeys(R, [[37.9, [0.15, 1.05, 0.45], [0, 1.0, -0.38], 40], [39.8, [-0.1, 1.08, 0.4], [0, 1.0, -0.38], 40]]), 0.4);
    D.push(() => s3Text('?', CX, 640, { size: 150, color: S3.cyan, align: 'center', alpha: SPR(R, 38.3, 0.4) > 0 ? clamp(SPR(R, 38.3, 0.4)) : 0 }));
    HUD.pill = '¿CÓMO LO SUPO?';
  },
  busqueda(R, D) {
    const g = g3(), p = g.phoneF; holdUp(p, 0, 1.0, 0, R, 1); paintScr(p, screenSearch, { typed: seg(R, 40.3, 41.6), results: seg(R, 41.7, 42.6) });
    setCam(camKeys(R, [[39.8, [0.04, 1.02, 0.34], [0, 1.0, 0], 40], [42.9, [-0.02, 1.0, 0.29], [0, 1.0, 0], 40]]), 0.4);
    D.push(() => tag(ppt(p, PW / 2, PH * 0.35, 0), 100, -120, 'tu amigo', 'la semana pasada', K(R, 40.0, 0.3), '#d8a028', 38));
    HUD.pill = 'TU AMIGO LA BUSCÓ';
  },
  wifi(R, D) {
    const g = g3(); paintScr(g.phoneF, screenLock, {}); paintScr(g.phoneY, screenLock, {});
    pose(g.friend, { ph: 0, look: g.you.position, talk: 0.5, gesture: 0.3 }); pose(g.you, { ph: 2, look: g.friend.position, talk: 0.3, nod: 0.05 * Math.sin(R * 3) });
    const rt = V3(1.75, 0.5, -1.6); wifiRings(rt, R, K(R, 43.0, 0.4));
    const A = arcPath(rt.clone().add(V3(0, 0.12, 0)), ppt(g.phoneF, 0, 0, 0), 0.45, EZ.o2(seg(R, 43.5, 44.4))), B = arcPath(rt.clone().add(V3(0, 0.12, 0)), ppt(g.phoneY, 0, 0, 0), 0.35, EZ.o2(seg(R, 43.7, 44.5)));
    if (R > 43.5) { setArc(0, A[0], A[40], 0.45, EZ.o2(seg(R, 43.5, 44.4))); setArc(1, B[0], B[40], 0.35, EZ.o2(seg(R, 43.7, 44.5))); flowSparks(A, R, K(R, 44.4), 8, 0.04); flowSparks(B, R, K(R, 44.5), 8, 0.04); }
    const pin = SPR(R, 45.4, 0.5); if (pin > 0) { g.pin.visible = true; g.pin.position.set(0.01, TABLE_Y + 0.25 * (1 - Math.min(1, pin)) + 0.02, -1.2); g.pin.scale.setScalar(Math.max(0.01, pin) * 1.2); g.pinRing.visible = true; const u = seg(R, 45.6, 47.6); g.pinRing.position.set(0.01, TABLE_Y + 0.002, -1.2); g.pinRing.scale.setScalar(0.6 + u * 0.8); g.pinRing.material.opacity = (1 - u) * 0.9; }
    setCam(camKeys(R, [[42.9, [2.2, 1.45, 0.7], [0.3, 0.55, -1.5], 42], [47.6, [1.8, 1.35, 0.35], [0.3, 0.55, -1.5], 42]]), 0.5);
    D.push(() => { tag(rt.clone().add(V3(0, 0.15, 0)), -60, -170, 'misma Wi-Fi', 'IP pública 84.112.7.20', KO(R, 43.2, 47.5, 0.3), '#5ab8ff', 38);
      tag(V3(0.01, TABLE_Y + 0.02, -1.2), 160, -170, 'mismo lugar', null, KO(R, 45.6, 47.5, 0.3), '#ff5a6a', 38); const mins = Math.round(192 * EZ.o2(seg(R, 45.8, 47.2)));
      s3Readout(`${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, '0')} min`, '', 'JUNTOS', K(R, 45.8, 0.3), { y: 1300 }); });
    HUD.pill = 'LA MISMA RED';
  },
  red(R, D) {
    const g = g3(), t = R - 47.6;
    for (const [b, ph] of [[g.bustF, 0], [g.bustY, 2]]) { b.scale.setScalar(1 + 0.012 * Math.sin(R * 1.6 + ph)); b.rotation.y = 0.15 * Math.sin(R * 0.6 + ph); }
    if (R < 48.4) for (let k = 0; k < 30; k++) { const Rn = RNG('flash', k), u = seg(R, 47.6, 48.4), a = Rn.f() * TAU; spark(V3(200 + Math.cos(a) * u * 6, 1.5 + Rn.n(1.5), Math.sin(a) * u * 4), 0.4, (1 - u) * 0.9); }
    setCam(camKeys(R, [[47.6, [200, 7, 16], [200, 1.2, -2], 44], [50.6, [200.5, 4.5, 11], [200, 1.3, 0], 44]]), 0.4);
    D.push(() => { tag(V3(197.6, 2.4, 0), -40, -160, 'tu amigo', null, K(R, 48.0, 0.3), '#d8a028', 36); tag(V3(202.4, 2.4, 0), 40, -160, 'tú', null, K(R, 48.2, 0.3), '#1fb8b0', 36); });
    HUD.pill = 'PARA UNA EMPRESA DE ANUNCIOS';
  },
  conectados(R, D) {
    const g = g3();
    g.bustF.rotation.y = lerp(0, 0.6, K(R, 50.6, 0.6)) + 0.04 * Math.sin(R * 1.2); g.bustY.rotation.y = lerp(0, -0.6, K(R, 50.7, 0.6)) + 0.04 * Math.sin(R * 1.1 + 2);
    for (const [b, ph] of [[g.bustF, 0], [g.bustY, 2]]) b.scale.setScalar(1 + 0.012 * Math.sin(R * 1.6 + ph));
    const a = V3(197.6, 1.2, 0), b = V3(202.4, 1.2, 0), u = EZ.o2(seg(R, 50.7, 51.4)); const P = arcPath(a, b, 1.6, 1);
    setArc(0, a, b, 1.6, u, 0.07); flowSparks(P, R, K(R, 51.4), 14, 0.35);
    setCam(camKeys(R, [[50.6, [200.5, 4.5, 11], [200, 1.3, 0], 44], [53.9, [200.2, 3.6, 9], [200, 1.5, 0], 44]]), 0.4);
    D.push(() => { tag(P[20], 0, -170, 'conectados', 'misma red · mismo lugar', K(R, 51.2, 0.3) * (1 - seg(R, 53.3, 53.6)), S3.cyan, 40, 'center');
      const cu = EZ.io(seg(R, 51.6, 53.2)); if (R > 51.5) { let [x, y] = P2(P[Math.round(cu * 40)]); x = clamp(x, 170, 860); y = clamp(y, 480, 1250); const s = SPR(R, 51.5, 0.4); ctx.save(); screen(); ctx.translate(x, y - 40); ctx.scale(s, s); ctx.globalAlpha = clamp(s);
        ctx.fillStyle = '#f6f3ec'; ctx.beginPath(); ctx.roundRect(-150, -46, 300, 92, 18); ctx.fill(); ctx.fillStyle = '#ffb42a'; ctx.beginPath(); ctx.roundRect(-132, -28, 56, 56, 10); ctx.fill(); ctx.restore();
        s3Text('PATROCINADO', x - 60, y - 52, { size: 20, color: S3.grey, alpha: clamp(s) }); s3Text('freidora de aire', x - 60, y - 20, { size: 28, color: '#16161c', alpha: clamp(s) }); } });
    HUD.pill = 'USTEDES ESTÁN CONECTADOS';
  },
  mesa(R, D) {
    const g = g3(); paintScr(g.phoneF, screenLock, {}); paintScr(g.phoneY, screenLock, {});
    pose(g.friend, { ph: 0, down: 0.35 }); pose(g.you, { ph: 2, down: 0.35 });
    setCam(camKeys(R, [[53.9, [0.02, 1.14, -0.6], [0, 0.47, -1.2], 50], [55.2, [0.0, 1.1, -0.64], [0, 0.47, -1.2], 50]]), 0.4);
    D.push(() => tag(ppt(g.phoneY, 0, 0, 0), 120, -180, 'no te escuchó', null, K(R, 54.3, 0.3), S3.white, 40));
    HUD.pill = 'NO TE ESCUCHÓ';
  },
  final(R, D) {
    const g = g3(); paintScr(g.phoneF, screenLock, {}); paintScr(g.phoneY, screenLock, {});
    const look = K(R, 58.3, 0.6);
    pose(g.friend, { ph: 0, look: g.you.position, down: 0.35 * (1 - look), talk: KO(R, 58.6, 60.0, 0.2) * 0.6, gesture: KO(R, 58.8, 60.2, 0.3) * 0.5 });
    pose(g.you, { ph: 2, look: g.friend.position, down: 0.35 * (1 - look) });
    const a = ppt(g.phoneF, 0, 0, 0), b = ppt(g.phoneY, 0, 0, 0), u = EZ.o2(seg(R, 56.6, 57.3)), P = arcPath(a, b, 0.14, 1); if (R > 56.6) { setArc(0, a, b, 0.14, u, 0.006); flowSparks(P, R, K(R, 57.3), 8, 0.025); }
    setCam(camKeys(R, [[55.2, [0.0, 1.1, -0.64], [0, 0.47, -1.2], 50], [57.8, [0.05, 1.0, -0.3], [0, 0.6, -1.5], 44], [61.17, [0.05, 1.25, 1.9], [0, 0.9, -2.0], 44]]), 0.5);
    D.push(() => { tag(P[20], 0, -150, 'juntos', 'con quién estabas sentado', KO(R, 57.2, 59.6, 0.3), S3.cyan, 38, 'center');
      const e = K(R, 60.5, 0.4); if (e > 0) s3Text('DOPAMENTES', CX, H / 2, { size: 44, align: 'center', alpha: e * 0.95, spacing: 6 }); });
    HUD.pill = R < 58.3 ? 'SUPO CON QUIÉN ESTABAS' : 'UN POCO PEOR';
  },
};
