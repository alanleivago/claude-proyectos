// =====================================================================
//  SHOTS — reference 5 in reference time R: one near-continuous camera around the head, 0.5 s dissolves where the
//  look changes (skin / infrared / dots / depth / mesh). The lock pill on top; small grey honesty notes.
// =====================================================================
S3.hl = true;
const K = (R, a, d = 0.35) => EZ.o2(seg(R, a, a + d));
const KO = (R, a, b, d = 0.35) => Math.min(K(R, a, d), 1 - EZ.i2(seg(R, b - d, b)));
const SPR = (R, a, d = 0.45) => (R < a ? 0 : EZ.back(seg(R, a, a + d)));
let HUD = {}, ZM = 1;
function sceneMain() {
  const R = (RNOW = refT(TT));
  const run = (key, alpha) => { resetWorld(); HUD = { lock: true, note: null }; const D = []; SHOT_FN[key](R, D); renderWorld(alpha); return { D, hud: HUD }; };
  let i = SHOTS_R.findIndex(([, a, b]) => R >= a && R < b); if (i < 0) i = SHOTS_R.length - 1; const XF = 0.25; let out;
  const nb = SHOTS_R[i + 1], pb = SHOTS_R[i - 1];
  if (nb && R > nb[1] - XF) { const u = EZ.io(seg(R, nb[1] - XF, nb[1] + XF)), A = run(SHOTS_R[i][0], 1), B = run(nb[0], u); out = u < 0.5 ? A : B; }
  else if (pb && R < SHOTS_R[i][1] + XF) { const u = EZ.io(seg(R, SHOTS_R[i][1] - XF, SHOTS_R[i][1] + XF)), A = run(pb[0], 1), B = run(SHOTS_R[i][0], u); out = u < 0.5 ? A : B; }
  else out = run(SHOTS_R[i][0], 1);
  out.D.forEach((f) => f());
  const h = out.hud, hud = () => { s3Pill(h.lock ? 'BLOQUEADO' : 'DESBLOQUEADO', 1, { y: 300, size: 28, dot: h.lock ? '#8d8780' : '#3ce8a0' }); if (h.note) s3Note(h.note, 0.9, { x: 60, y: 1300, size: 20 }); s3Note('ESCANEO DE CABEZA: LEE PERRY-SMITH · CC BY 3.0', 0.7, { x: 60, y: 1330, size: 18 }); s3Caption(TT); };
  if (DEFER) DEFER.push(hud); else hud();
}
function tag(v, dx, dy, title, sub, a, size = 34, align = 'left') {
  if (a <= 0) return; const c = S3.white, [x, y] = P2(v); if (align === 'left' && x + dx > 640) { align = 'right'; dx = Math.min(dx, -40); }
  ctx.save(); ctx.font = s3Font(size); let tw = ctx.measureText(title).width; if (sub) { ctx.font = s3Font(Math.round(size * 0.6)); tw = Math.max(tw, ctx.measureText(sub).width + 4); } ctx.restore();
  const lo = align === 'right' ? 60 + tw : 60, hi = align === 'right' ? 1020 : 1020 - tw, lx = clamp(x + dx, lo, Math.max(lo, hi)), ly = clamp(y + dy, 400, 1220);
  s3Leader(lx + (align === 'right' ? 8 : -8), ly + 10, x, y, c, a * 0.85, 1, 2); s3Label(lx, ly, title, sub, { alpha: a, color: c, size, align });
}
const HC = V3(0, 0.0, 0);   // head centre
// orbit camera around the head: yaw (0 = front, +π/2 = from the head's left/our right), pitch, distance, target y
const orb = (yaw, pitch, d, ty = 0.0, fov = 30) => ({ pos: [Math.sin(yaw) * Math.cos(pitch) * d, ty + Math.sin(pitch) * d, Math.cos(yaw) * Math.cos(pitch) * d], tgt: [0, ty, 0], fov });
function orbKeys(R, keys) { let i = 0; while (i < keys.length - 2 && R > keys[i + 1][0]) i++; const a = keys[i], b = keys[i + 1] ?? a, u = b === a ? 0 : EZ.io(seg(R, a[0], b[0])); return orb(...a.slice(1).map((v, k) => lerp(v, b[k + 1], u))); }
// the TrueDepth screen: a dark lock screen, the island with the sensor lenses (drawn), a Face ID glyph
function screenFace(x, o = {}) {
  const w = 540, h = 1120; x.fillStyle = '#05060a'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#000'; x.beginPath(); x.roundRect(w / 2 - 110, 22, 220, 60, 30); x.fill();
  x.fillStyle = '#1a2a40'; x.beginPath(); x.arc(w / 2 + 62, 52, 14, 0, TAU); x.fill(); x.fillStyle = '#2a3a5a'; x.beginPath(); x.arc(w / 2 + 62, 52, 6, 0, TAU); x.fill();
  if (o.ir) { x.fillStyle = `rgba(255,90,40,${0.6 * o.ir})`; x.beginPath(); x.arc(w / 2 - 60, 52, 9, 0, TAU); x.fill(); x.beginPath(); x.arc(w / 2 - 30, 52, 7, 0, TAU); x.fill(); }
  const ok = o.unlock ?? 0; x.strokeStyle = ok > 0.5 ? '#3ce8a0' : 'rgba(244,241,234,0.85)'; x.lineWidth = 8; x.lineCap = 'round'; const cx = w / 2, cy = 330, s = 60;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { x.beginPath(); x.moveTo(cx + sx * s, cy + sy * (s - 22)); x.lineTo(cx + sx * s, cy + sy * s); x.lineTo(cx + sx * (s - 22), cy + sy * s); x.stroke(); }
  if (ok > 0.5) { x.beginPath(); x.moveTo(cx - 24, cy); x.lineTo(cx - 6, cy + 20); x.lineTo(cx + 28, cy - 22); x.stroke(); } else { x.beginPath(); x.arc(cx - 18, cy - 12, 3, 0, TAU); x.arc(cx + 18, cy - 12, 3, 0, TAU); x.stroke(); x.beginPath(); x.arc(cx, cy + 6, 20, 0.3, Math.PI - 0.3); x.stroke(); }
  x.fillStyle = 'rgba(244,241,234,0.85)'; x.font = `700 120px ${S3.font}`; x.textAlign = 'center'; x.fillText('22:47', w / 2, 560);
}
const fPH = (o) => { const ph = g3().phone; paintScr(ph, screenFace, o); return ph; };
const tip = () => wpt(g3().face, 0, 0.0, 0.11);   // ~ the nose tip (front of the face)

const SHOT_FN = {
  intro(R, D) {
    const g = g3(); g.key.intensity = 0.25; g.hemi.intensity = 0.12; setDots(1, 0.6 * (1 - seg(R, 2.6, 3.6)), 1.1); fPH({}); phoneAt(0.2, -0.05, 0.28, 0, -0.5, 0.15);
    setCam(orbKeys(R, [[0, 0.25, 0.05, 1.1, 0.0], [3.8, 0.18, 0.03, 0.95, 0.0]]), 0.2);
    HUD.note = 'IR MOSTRADO EN COLOR · INVISIBLE AL OJO';
  },
  notcam(R, D) {
    const g = g3(); g.key.intensity = 1.4; g.hemi.intensity = 0.9; g.rim.intensity = 1.4; fPH({ ir: 0 }); const ph = phoneAt(0, 0, 0, 0.35, -0.25, 0); g.H3.group.visible = false;
    const top = wpt(ph, 0, 0.06, 0); setCam({ pos: [top.x + lerp(0.05, 0.02, seg(R, 3.8, 7.1)), top.y + 0.05, top.z + lerp(0.2, 0.14, seg(R, 3.8, 7.1))], tgt: [top.x, top.y - 0.01, top.z], fov: 30 }, 0.1);
    D.push(() => tag(wpt(ph, 0.0, 0.074, 0.006), 60, 220, 'no es solo la cámara', 'sensores TrueDepth', K(R, 4.6, 0.3)));
    HUD.note = 'TELÉFONO ILUSTRATIVO';
  },
  pickup(R, D) {
    const g = g3(); g.key.intensity = 0.3; fPH({}); const u = EZ.io(seg(R, 7.1, 8.6)); phoneAt(0.12, lerp(-0.35, -0.08, u), lerp(0.5, 0.36, u), lerp(-0.6, -0.15, u), -0.35, 0.05);
    setCam(orbKeys(R, [[7.1, 0.9, 0.05, 1.2, 0.0], [8.6, 0.75, 0.04, 1.05, 0.0]]), 0.2);
  },
  flood(R, D) {
    const g = g3(); g.key.intensity = 0.3; fPH({ ir: K(R, 9.4, 0.3) }); phoneAt(0.0, -0.13, 0.3, -0.25, 0, 0); setRays(K(R, 9.6, 0.5) * (0.7 + 0.3 * Math.sin(R * 6)));
    setCam(orbKeys(R, [[8.4, 0.12, 0.08, 0.9, -0.02], [13.0, 0.05, 0.05, 0.82, -0.02]]), 0.2);
    D.push(() => tag(V3(0.06, 0.06, 0.1), 80, -200, 'luz infrarroja', 'invisible al ojo', K(R, 10.4, 0.3)));
    HUD.note = 'INFRARROJO · INVISIBLE AL OJO';
  },
  irsee(R, D) {
    const g = g3(); g.face.material = g.irM; g.irM.emissiveIntensity = lerp(0.2, 1.1, K(R, 13.2, 0.8)); g.H3.hair.visible = true; phoneAt(0.0, -0.13, 0.3, -0.25, 0, 0); fPH({ ir: 1 });
    setCam(orbKeys(R, [[13.0, -0.25, 0.04, 0.8, 0.0], [15.6, -0.32, 0.03, 0.74, 0.0]]), 0.2);
    D.push(() => tag(V3(-0.07, 0.04, 0.08), -80, -220, 'lo que ven los sensores', 'infrarrojo', K(R, 14.0, 0.3)));
    HUD.note = 'IR MOSTRADO EN COLOR';
  },
  project(R, D) {
    const g = g3(); g.key.intensity = 0.18; g.hemi.intensity = 0.1; fPH({ ir: 1 }); phoneAt(0.04, -0.07, 0.42, 0, -0.1, 0); setDots(EZ.io(seg(R, 16.2, 18.4)), K(R, 16.0, 0.4));
    setCam(orbKeys(R, [[15.6, 1.25, 0.06, 1.0, 0.0], [20.6, 1.05, 0.04, 0.9, 0.0]]), 0.2);
    D.push(() => tag(V3(0.0, 0.1, 0.1), 60, -180, 'miles de puntos', 'infrarrojos', K(R, 17.6, 0.3)));
    HUD.note = 'MILES DE PUNTOS (APPLE) · MUESTRA ILUSTRATIVA';
  },
  interesting(R, D) {
    const g = g3(); g.key.intensity = 0.25; setDots(1, 1);
    setCam(orbKeys(R, [[20.6, 0.15, 0.02, 0.62, 0.0], [23.0, 0.0, 0.0, 0.55, 0.0]]), 0.15);
  },
  bend(R, D) {
    const g = g3(); g.key.intensity = 0.2; g.hemi.intensity = 0.1; setDots(1, 1, 1.15);
    setCam(orbKeys(R, [[23.0, 0.45, 0.05, 0.5, 0.0], [25.4, 0.8, 0.02, 0.42, 0.01], [27.2, 0.35, -0.05, 0.42, 0.01], [29.0, -0.55, -0.15, 0.46, -0.04], [30.9, -0.3, -0.08, 0.55, -0.02]]), 0.15);
    D.push(() => { const L = [['nariz', V3(0, 0.0, 0.115), 25.2], ['ojos', V3(-0.033, 0.035, 0.085), 25.9], ['mejillas', V3(0.05, -0.01, 0.075), 26.6], ['mandíbula', V3(-0.055, -0.07, 0.05), 28.6]]; L.forEach(([t, v, t0]) => tag(v, -60, -150, t, null, KO(R, t0, 30.6, 0.3), 32)); });
  },
  distort(R, D) {
    const g = g3(); g.key.intensity = 0.15; const u = 1 - EZ.io(seg(R, 31.2, 32.4)) + EZ.io(seg(R, 32.6, 33.5)); setDots(clamp(u), 1, 1.1);
    setCam(orbKeys(R, [[30.9, 0.0, 0.0, 0.62, 0.0], [33.6, 0.1, 0.0, 0.6, 0.0]]), 0.1);
    D.push(() => { const a = KO(R, 31.4, 33.4, 0.3); if (a > 0) s3Text('patrón perfecto', CX, 1180, { size: 40, align: 'center', alpha: a }); });
    HUD.note = 'PRINCIPIO DE LUZ ESTRUCTURADA · ILUSTRATIVO';
  },
  depth(R, D) {
    const g = g3(); g.face.material = g.depthM; g.depthM.uniforms.near.value = 0.0; g.H3.hair.visible = false; if (g.H3.eyes) g.H3.eyes.visible = false;
    const c = orbKeys(R, [[33.6, 0.0, 0.0, 0.7, 0.0], [37.6, 0.15, 0.02, 0.66, 0.0], [39.4, 1.45, 0.0, 0.7, 0.0], [41.1, 1.57, 0.0, 0.72, 0.0]]); setCam(c, 0.1);
    const d = Math.hypot(...c.pos); g.depthM.uniforms.near.value = d - 0.13; g.depthM.uniforms.far.value = d + 0.06;
    D.push(() => { tag(V3(-0.07, 0.05, 0.06), -60, -200, 'mapa de profundidad', 'claro = cerca · oscuro = lejos', KO(R, 34.6, 39.0, 0.3)); const a = K(R, 39.6, 0.3); if (a > 0) s3Text('una forma en 3D', CX, 1180, { size: 44, align: 'center', alpha: a }); });
  },
  photo(R, D) {
    const g = g3(); g.key.intensity = 0.7; g.hemi.intensity = 0.25; g.H3.group.position.set(0.13, 0, 0); g.H3.group.rotation.y = -0.35;
    g.photo.visible = true; g.photo.position.set(-0.14, 0.0, 0.0); g.photo.rotation.set(0, 0.3 + 0.05 * Math.sin(R * 0.7), 0);
    setCam({ pos: [lerp(-0.02, 0.0, seg(R, 41.1, 47.7)), 0.02, lerp(1.25, 1.15, seg(R, 41.1, 47.7))], tgt: [0, 0, 0], fov: 30 }, 0.15);
    D.push(() => { tag(V3(-0.14, 0.13, 0), 0, -120, 'foto', 'plana: sin profundidad', K(R, 42.2, 0.3), 32); tag(V3(0.13, 0.13, 0.05), 0, -120, 'cara', 'geometría real', K(R, 44.2, 0.3), 32); });
    HUD.note = 'LAS FOTOS NO TIENEN PROFUNDIDAD';
  },
  mesh(R, D) {
    const g = g3(); g.face.visible = true; g.face.material = g.depthM; g.depthM.uniforms.a.value = 1; g.H3.hair.visible = false; if (g.H3.eyes) g.H3.eyes.visible = false;
    g.face.material = g.darkM; g.wire.visible = true; g.wireM.opacity = 0.75;
    const sep = lerp(0.18, 0, EZ.io(seg(R, 50.0, 52.6))); g.wire2.visible = R > 49.2; g.wire2.position.set(-sep, 0, -0.02 * (sep / 0.18));
    setCam(orbKeys(R, [[47.7, 0.6, 0.04, 0.85, 0.0], [53.4, 0.35, 0.03, 0.8, 0.0]]), 0.15);
    D.push(() => { tag(V3(-sep + 0.0, 0.12, 0.0), -60, -150, 'guardado al configurar', 'como malla', KO(R, 49.4, 51.2, 0.3), 30); tag(V3(0.06, 0.12, 0.05), 60, -230, 'tu cara ahora', null, KO(R, 48.2, 51.2, 0.3), 30); });
    HUD.note = 'GUARDADO COMO MATEMÁTICA · MOSTRADO COMO MALLA';
  },
  match(R, D) {
    const g = g3(); g.face.material = g.darkM; g.H3.hair.visible = false; if (g.H3.eyes) g.H3.eyes.visible = false; g.wire.visible = true; g.wire2.visible = true;
    const ok = R > 56.4; g.wire2.material.color.set(ok ? '#3ce8a0' : '#3fd0d6'); g.wireM.opacity = ok ? 0.4 : 0.75;
    setCam(orbKeys(R, [[53.4, 0.35, 0.03, 0.8, 0.0], [57.5, 0.05, 0.0, 0.7, 0.0]]), 0.15);
    D.push(() => { const pts = [V3(0, 0, 0.115), V3(-0.033, 0.035, 0.085), V3(0.033, 0.035, 0.085), V3(0, -0.045, 0.1), V3(0.05, -0.01, 0.075), V3(-0.05, -0.01, 0.075)];
      pts.forEach((p, k) => { const a = K(R, 54.0 + k * 0.3, 0.25); if (a <= 0) return; const [x, y] = P2(p); ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = '#3ce8a0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 22 * EZ.back(a), 0, TAU); ctx.stroke(); ctx.restore(); });
      const a = SPR(R, 56.4, 0.45); if (a > 0) s3Text('coincide', CX, 1180, { size: 50, align: 'center', color: '#3ce8a0', alpha: clamp(a) }); });
    HUD.lock = R < 56.4;
  },
  fraction(R, D) {
    const g = g3(); g.key.intensity = lerp(0.6, 0.25, seg(R, 57.5, 60.5)); fPH({ unlock: 1 }); phoneAt(0.21, -0.14, 0.2, 0, -0.55, 0.12);
    setCam(orbKeys(R, [[57.5, 0.3, 0.05, 1.0, 0.0], [60.5, 0.4, 0.05, 1.05, 0.0]]), 0.2);
    D.push(() => { const a = K(R, 58.2, 0.3); if (a > 0) s3Text('en una fracción de segundo', CX, 1180, { size: 40, align: 'center', alpha: a }); });
    HUD.lock = false;
  },
  dark(R, D) {
    const g = g3(); g.key.intensity = 0.05; g.hemi.intensity = 0.06; g.rim.intensity = 0.3; fPH({ unlock: 1 }); phoneAt(0.21, -0.14, 0.2, 0, -0.55, 0.12);
    setCam(orbKeys(R, [[60.5, 0.4, 0.05, 1.05, 0.0], [66.5, 0.6, 0.02, 0.8, 0.0]]), 0.2);
    D.push(() => { const a = K(R, 63.4, 0.3); if (a > 0) s3Text('no te ve como tus ojos', CX, 1180, { size: 40, align: 'center', alpha: a }); });
    HUD.lock = false;
  },
  ir2(R, D) {
    const g = g3(); g.face.material = g.irM; g.irM.emissiveIntensity = 1.1;
    setCam(orbKeys(R, [[66.5, 0.3, 0.02, 0.62, 0.0], [69.1, 0.55, 0.0, 0.56, 0.0]]), 0.15);
    HUD.lock = false; HUD.note = 'IR MOSTRADO EN COLOR · INVISIBLE AL OJO';
  },
  measure(R, D) {
    const g = g3(); g.key.intensity = 0.18; setDots(1, 1, 1.15);
    setCam(orbKeys(R, [[69.1, 0.6, 0.0, 0.52, 0.0], [72.3, 0.95, 0.02, 0.48, 0.0]]), 0.15);
    HUD.lock = false;
  },
  rebuild(R, D) {
    const g = g3(), u = EZ.io(seg(R, 74.2, 75.6)); g.H3.hair.visible = u > 0.5; g.key.intensity = 0.25 * u; g.wire.visible = u < 1; g.wireM.opacity = 0.75 * (1 - u); if (u < 0.5) { g.face.material = g.darkM; if (g.H3.eyes) g.H3.eyes.visible = false; }
    fPH({ unlock: 1 }); if (u > 0.3) phoneAt(0.21, -0.14, 0.2, 0, -0.55, 0.12);
    setCam(orbKeys(R, [[72.3, 0.5, 0.02, 0.6, 0.0], [76.5, 0.3, 0.04, 1.05, 0.0]]), 0.2);
    D.push(() => { const e = K(R, 75.6, 0.4); if (e > 0) s3Text("ALTERBASE", CX, H / 2 + 300, { size: 44, align: 'center', alpha: e * 0.95, spacing: 6 }); });
    HUD.lock = false;
  },
};
