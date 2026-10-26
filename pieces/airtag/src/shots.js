// =====================================================================
//  SHOTS — the shots of reference 2 in reference time R; 0.5 s dissolves at every boundary; the status pill on top.
//  People walk, rings pulse, beams climb, pins spring up; the camera never stops.
// =====================================================================
S3.hl = true;   // captions: spoken words white, the current word yellow
const K = (R, a, d = 0.35) => EZ.o2(seg(R, a, a + d));
const KO = (R, a, b, d = 0.35) => Math.min(K(R, a, d), 1 - EZ.i2(seg(R, b - d, b)));
const SPR = (R, a, d = 0.45) => (R < a ? 0 : EZ.back(seg(R, a, a + d)));
let HUD = { pill: null, dot: S3.white }, ZM = 1;
function sceneMain() {
  const R = (RNOW = refT(TT));
  const run = (key, alpha) => { resetWorld(); HUD = { pill: null, dot: S3.white }; const D = []; SHOT_FN[key](R, D); renderWorld(alpha); return { D, hud: HUD }; };
  let i = SHOTS_R.findIndex(([, a, b]) => R >= a && R < b); if (i < 0) i = SHOTS_R.length - 1; const XF = 0.25; let out;
  const nb = SHOTS_R[i + 1], pb = SHOTS_R[i - 1];
  if (nb && R > nb[1] - XF) { const u = EZ.io(seg(R, nb[1] - XF, nb[1] + XF)), A = run(SHOTS_R[i][0], 1), B = run(nb[0], u); out = u < 0.5 ? A : B; }
  else if (pb && R < SHOTS_R[i][1] + XF) { const u = EZ.io(seg(R, SHOTS_R[i][1] - XF, SHOTS_R[i][1] + XF)), A = run(pb[0], 1), B = run(SHOTS_R[i][0], u); out = u < 0.5 ? A : B; }
  else out = run(SHOTS_R[i][0], 1);
  out.D.forEach((f) => f());
  const h = out.hud, hud = () => { if (h.pill) s3Pill(h.pill, 1, { y: 300, size: 28, dot: h.dot }); s3Note('ILUSTRATIVO', 0.8, { x: 880, y: 1300 }); s3Caption(TT); };
  if (DEFER) DEFER.push(hud); else hud();
}
const PILL = { off: ['SIN CONEXIÓN', '#8d8780'], bt: ['EMITIENDO', '#3fd0d6'], det: ['DETECTADO', '#3fd0d6'], rep: ['REPORTADO', '#f2b632'], last: ['ÚLTIMA VEZ · HACE 1 MIN', '#f2b632'], near: ['CERCA', '#3fd0d6'], prec: ['PRECISO', '#f2b632'] };
const pill = (k) => { HUD.pill = PILL[k][0]; HUD.dot = PILL[k][1]; };

// ---- 2D helpers
function tag(v, dx, dy, title, sub, a, c = S3.white, size = 34, align = 'left') {
  if (a <= 0) return; c = S3.white; /* user: every label over the scene is white */ const [x, y] = P2(v); if (align === 'left' && x + dx > 640) { align = 'right'; dx = Math.min(dx, -40); }
  ctx.save(); ctx.font = s3Font(size); let tw = ctx.measureText(title).width; if (sub) { ctx.font = s3Font(Math.round(size * 0.6)); tw = Math.max(tw, ctx.measureText(sub).width + 4); } ctx.restore();
  const lo = align === 'right' ? 60 + tw : align === 'center' ? 60 + tw / 2 : 60, hi = align === 'right' ? 1020 : align === 'center' ? 1020 - tw / 2 : 1020 - tw;
  const lx = clamp(x + dx, lo, Math.max(lo, hi)), ly = clamp(y + dy, 400, 1290);
  s3Leader(lx + (align === 'right' ? 8 : align === 'center' ? 0 : -8), ly + 10, x, y, c, a * 0.85, 1, 2); s3Label(lx, ly, title, sub, { alpha: a, color: c, size, align });
}
function chip(str, x, y, a, bg = '#f4f1ea', fg = '#0c1220', size = 30) { if (a <= 0) return; ctx.save(); screen(); ctx.font = s3Font(size); const w = ctx.measureText(str).width + 28; ctx.globalAlpha = clamp(a); ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.85, w, size * 1.35, 8); ctx.fill(); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.fillText(str, x, y + 2); ctx.restore(); }
// three tiles: GPS, cellular, Wi-Fi; a[k] = shown, x[k] = crossed out (0..1)
function tiles(a, xo, y = 520) {
  const s = 120, gap = 34, x0 = CX - s * 1.5 - gap;
  ctx.save(); screen();
  for (let k = 0; k < 3; k++) { const al = clamp(a[k]); if (al <= 0) continue; const sp = EZ.back(al), cx = x0 + k * (s + gap) + s / 2, cy = y;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sp, sp); ctx.globalAlpha = al;
    ctx.fillStyle = 'rgba(22,19,15,0.86)'; ctx.beginPath(); ctx.roundRect(-s / 2, -s / 2, s, s, 22); ctx.fill(); ctx.strokeStyle = 'rgba(244,241,234,0.25)'; ctx.lineWidth = 2; ctx.stroke();
    const c = xo[k] > 0 ? hexMix('#f4f1ea', '#8d8780', xo[k]) : '#f4f1ea'; ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (k === 0) { ctx.beginPath(); ctx.moveTo(-26, 4); ctx.lineTo(26, -24); ctx.lineTo(4, 28); ctx.lineTo(0, 6); ctx.closePath(); ctx.stroke(); }
    if (k === 1) for (let b = 0; b < 4; b++) ctx.fillRect(-30 + b * 17, 26 - (b + 1) * 13, 11, (b + 1) * 13);
    if (k === 2) { for (let b = 0; b < 3; b++) { ctx.beginPath(); ctx.arc(0, 24, 14 + b * 14, -Math.PI * 0.78, -Math.PI * 0.22); ctx.stroke(); } ctx.beginPath(); ctx.arc(0, 24, 5, 0, TAU); ctx.fill(); }
    const u = clamp(xo[k]); if (u > 0) { ctx.strokeStyle = '#ff5a4a'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(-40 + 80 * EZ.o2(u), -40 + 80 * EZ.o2(u)); ctx.stroke(); }
    ctx.restore(); }
  ctx.restore();
}
// a phone outline floating in the frame with a pin and a question mark
function phoneFrame(a, y = 660) {
  if (a <= 0) return; const sp = EZ.back(clamp(a)), w = 300, h = 560;
  ctx.save(); screen(); ctx.translate(CX, y); ctx.scale(sp, sp); ctx.globalAlpha = clamp(a);
  ctx.fillStyle = 'rgba(10,13,20,0.55)'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 44); ctx.fill(); ctx.strokeStyle = '#f4f1ea'; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#f4f1ea'; ctx.beginPath(); ctx.roundRect(-46, -h / 2 + 18, 92, 22, 11); ctx.fill();
  ctx.strokeStyle = '#f2b632'; ctx.fillStyle = '#f2b632'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, -40, 40, Math.PI * 0.8, Math.PI * 0.2); ctx.lineTo(0, 40); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -40, 13, 0, TAU); ctx.fill();
  ctx.font = s3Font(70); ctx.textAlign = 'center'; ctx.fillStyle = '#f4f1ea'; ctx.fillText('?', 0, 160);
  ctx.restore();
}
// dashed link between two world points (2D), progress u
function link(A, B, u, a, c = '#3fd0d6', w = 4, dash = [14, 10]) { if (u <= 0 || a <= 0) return; const [x0, y0] = P2(A), [x1, y1] = P2(B); ctx.save(); screen(); ctx.globalAlpha = clamp(a); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.setLineDash(dash); ctx.lineDashOffset = -RNOW * 40; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, clamp(u)), lerp(y0, y1, clamp(u))); ctx.stroke(); ctx.restore(); }
// the Find-style search screen (540 × 1120): item name, a big arrow, the distance
function screenFind(x, o = {}) {
  const w = 540, h = 1120; x.fillStyle = '#0e1016'; x.fillRect(0, 0, w, h); x.fillStyle = '#000'; x.beginPath(); x.roundRect(w / 2 - 80, 22, 160, 46, 23); x.fill();
  x.fillStyle = '#8d8780'; x.font = `700 26px ${S3.font}`; x.textAlign = 'left'; x.fillText('BUSCANDO', 44, 150); x.fillStyle = '#f4f1ea'; x.font = `700 52px ${S3.font}`; x.fillText('Maleta', 44, 210);
  const g = x.createRadialGradient(w / 2, 470, 10, w / 2, 470, 230); g.addColorStop(0, 'rgba(242,182,50,0.35)'); g.addColorStop(1, 'rgba(242,182,50,0)'); x.fillStyle = g; x.fillRect(0, 240, w, 460);
  x.save(); x.translate(w / 2, 470); x.rotate(o.ang ?? -0.6); x.fillStyle = '#f4f1ea'; x.beginPath(); x.moveTo(0, -150); x.lineTo(95, -20); x.lineTo(30, -20); x.lineTo(30, 150); x.lineTo(-30, 150); x.lineTo(-30, -20); x.lineTo(-95, -20); x.closePath(); x.fill(); x.restore();
  x.fillStyle = '#f4f1ea'; x.font = `700 150px ${S3.font}`; x.fillText(o.dist ?? '2 m', 44, 870); x.fillStyle = '#b9b2a8'; x.font = `700 40px ${S3.font}`; x.fillText(o.dir ?? 'a tu izquierda', 44, 930);
  for (let k = 0; k < 3; k++) { x.fillStyle = k === 1 ? '#3a3e48' : '#2a2e38'; x.beginPath(); x.arc(110 + k * 160, 1040, 40, 0, TAU); x.fill(); }
}
// the hall's "you see the suitcase" camera around the tag
const TAGC = (dx, dy, dz) => { const t = tagPos(); return [t.x + dx, t.y + dy, t.z + dz]; };
const DOME_R = 3.4;
const cityFog = (n, f) => { const g = g3(); g.scene.background.set('#121a26'); g.scene.fog.color.set('#121a26'); g.scene.fog.near = n; g.scene.fog.far = f; };
// detection: the ring on a phone pulses, a dashed link to the AirTag
function detect(p, R, t0, D, o = {}) { const ph = phoneOf(p), a = K(R, t0, 0.3) * (o.a ?? 1); if (a <= 0) return ph; const pu = (R * 1.2) % 1; ring(ph, 0.28 + 0.05 * Math.sin(R * 5), a); ring(ph, 0.25 + pu * 0.5, a * (1 - pu) * 0.8);
  if (o.link !== false) D.push(() => link(ph, tagPos(), K(R, t0, 0.5), a * 0.8)); return ph; }

const SHOT_FN = {
  tag(R, D) {
    pill('off'); const t = tagPos();
    setCam(camKeys(R, [[0, TAGC(0.34, 0.16, 0.5), [t.x, t.y - 0.02, t.z], 34], [5.4, TAGC(0.12, 0.3, 0.4), [t.x, t.y - 0.03, t.z], 34]]), 0.3);
    D.push(() => { tiles([K(R, 1.3, 0.3), K(R, 2.4, 0.3), K(R, 3.9, 0.3)], [K(R, 1.8, 0.35), K(R, 3.1, 0.35), K(R, 4.5, 0.35)]); tag(t, 140, 220, 'AirTag', null, K(R, 0.4, 0.3), S3.white, 34); });
  },
  city(R, D) {
    const g = g3(); g.hall.visible = g.suit.visible = false; g.city.visible = true; cityFog(30, 110);
    const P = V3(CITY + 24, 0, -18); pin(0, P, 3.2 * SPR(R, 6.0, 0.5), 1, { disc: 2 });
    setCam(camKeys(R, [[5.4, [CITY - 30, 20, 34], [CITY + 6, 0, -6], 44], [10.9, [CITY - 22, 26, 26], [CITY + 10, 0, -10], 44]]), 0.4);
    D.push(() => { tag(V3(P.x, 2.2, P.z), -40, -150, 'tu maleta', 'al otro lado de la ciudad', K(R, 6.2, 0.3), S3.yellow, 32); phoneFrame(K(R, 8.9, 0.45) * (1 - seg(R, 10.5, 10.9)), 700); });
    pill('off');
  },
  self(R, D) {
    const g = g3(); g.hall.visible = g.suit.visible = false; g.city.visible = true; cityFog(20, 90);
    const P = V3(CITY + 24, 0, -18); pin(0, P, 3.2, 1, { disc: 2 });
    setCam(camKeys(R, [[10.9, [CITY + 8, 15, 6], [CITY + 22, 1, -16], 46], [14.0, [CITY + 14, 11, -2], [CITY + 24, 0.8, -18], 44]]), 0.5);
    D.push(() => chip('no sabe dónde está', CX, 1150, K(R, 11.6, 0.3) * (1 - seg(R, 13.6, 14.0))));
    pill('off');
  },
  borrow(R, D) {
    const g = g3(); g.crowd.slice(0, 10).forEach((p, k) => { const Rn = RNG('bw', k), z = Rn.r(-1, 4.5), dir = k % 2 ? 1 : -1, x0 = Rn.r(-9, 9); walkOn(p, R, [x0, z], [x0 + dir * 9, z], 13.0 + Rn.r(0, 0.5), 22, { phone: true, ph: k }); const ph = phoneOf(p), pu = (R * 1.1 + k * 0.3) % 1; ring(ph, 0.2 + pu * 0.45, K(R, 14.6 + k * 0.08, 0.3) * (1 - pu)); });
    setCam(camKeys(R, [[14.0, [-6, 6.5, 12], [0, 0.6, 1.5], 40], [16.4, [-4.5, 5.5, 11], [0.5, 0.6, 1.5], 40]]), 0.4);
    D.push(() => tag(phoneOf(g.crowd[2]), 40, -160, 'aparatos cercanos', null, K(R, 14.8, 0.3), S3.cyan, 32));
    pill('off');
  },
  leave(R, D) {
    pill('off'); const t = tagPos();
    setCam(camKeys(R, [[16.4, [3.5, 1.7, 6.5], [0, 0.45, 0], 38], [19.3, [1.6, 1.15, 3.2], [0, 0.45, 0], 38]]), 0.4);
    D.push(() => tag(t, 80, -170, 'tu maleta', 'olvidada en la estación', K(R, 17.2, 0.3), S3.yellow, 32));
  },
  explode(R, D) {
    const g = g3(); g.hall.visible = g.suit.visible = false; g.exp.visible = true; g.scene.background.set('#07090f'); g.scene.fog.color.set('#07090f');
    const u = EZ.io(seg(R, 19.4, 20.8)), S = 0.96, X = -60;
    g.back.position.y = 0.05; g.bat.position.y = lerp(0.08, 0.55, u); g.pcb.position.y = lerp(0.11, 1.05, u); g.cap.position.y = lerp(0.12, 1.55, u);
    g.exp.rotation.y = 0.25 * Math.sin(R * 0.4) + R * 0.05;
    const pc = wpt(g.pcb, 0, 0.03, 0);
    for (let k = 0; k < 3; k++) { const f = ((R - 21.5) * 0.6 + k / 3) % 1; if (R > 21.5) ring(pc, 0.4 + f * 2.2, (1 - f) * 0.9 * K(R, 21.5, 0.4)); }
    setCam(camKeys(R, [[19.3, [X + 2.6, 1.5, 3.6], [X, 0.75, 0], 40], [24.0, [X + 3.4, 2.2, 4.2], [X, 0.85, 0], 40]]), 0.3);
    D.push(() => { tag(pc, 160, -40, 'Bluetooth', 'antena de bajo consumo', K(R, 22.2, 0.3), S3.cyan, 34); tag(wpt(g.bat, 0, 0, 0.3), -150, 120, 'pila de botón', null, K(R, 20.8, 0.3), S3.white, 28); });
    pill(R > 21.5 ? 'bt' : 'off');
  },
  dome(R, D) {
    const t = tagPos(), r = DOME_R * EZ.o3(seg(R, 24.2, 25.8)); setDome(V3(SC.x, 0, SC.z), r);
    const pu = (R * 0.8) % 1; ring(V3(t.x, t.y + 0.02, t.z), 0.1 + pu * 0.6, (1 - pu) * 0.9);
    setCam(camKeys(R, [[24.0, [2.2, 1.6, 4.0], [0, 0.5, 0], 40], [26.2, [5, 4, 9], [0, 0.8, 0], 42], [30.5, [7.5, 7.5, 12.5], [0, 0.6, -1], 42]]), 0.4);
    D.push(() => { tag(V3(DOME_R * 0.7, DOME_R * 0.7, 0), 40, -150, 'alcance Bluetooth', 'no a escala', K(R, 24.8, 0.3), S3.cyan, 32); const a = K(R, 28.4, 0.3); if (a > 0) chip('atorado', CX, 1150, a, '#16130f', '#f4f1ea', 40); });
    pill('bt');
  },
  walker(R, D) {
    const g = g3(), t = tagPos(); setDome(V3(SC.x, 0, SC.z), DOME_R); const w = walkOn(g.walker, R, [-7, 1.6], [4, 1.6], 30.5, 38.7, { phone: true });
    paintScr(w.userData.phone, screenHome, {}); const pu = (R * 0.8) % 1; ring(V3(t.x, t.y + 0.02, t.z), 0.1 + pu * 0.6, (1 - pu) * 0.9);
    if (R > 33.0) detect(w, R, 33.2, D);
    const wp = w.position; setCam(camKeys(R, [[30.5, [-3.5, 1.7, 7.5], [-4.5, 1.0, 1.6], 40], [33.2, [-1.0, 1.9, 7.2], [-2.0, 1.0, 1.2], 40], [35.5, [0.6, 2.4, 7.4], [-0.6, 0.9, 0.6], 40]]), 0.4);
    D.push(() => { tag(phoneOf(w), -60, -170, 'iPhone', 'de un desconocido', K(R, 31.4, 0.3) * (1 - seg(R, 33.0, 33.3)), S3.white, 32); tag(phoneOf(w), 60, -170, 'detecta la señal', null, K(R, 33.4, 0.3), S3.cyan, 32); });
    pill(R > 33.2 ? 'det' : 'bt');
  },
  knows(R, D) {
    const g = g3(); setDome(V3(SC.x, 0, SC.z), DOME_R); const w = walkOn(g.walker, R, [-7, 1.6], [4, 1.6], 30.5, 38.7, { phone: true }); const ph = detect(w, R, 30, D);
    const gp = V3(ph.x, 0.02, ph.z), u = EZ.io(seg(R, 35.8, 36.6)); ring(gp, 0.45, K(R, 36.4, 0.3), { c: '#f4f1ea' }); ring(gp, 0.08, K(R, 36.4, 0.3), { c: '#f4f1ea' });
    const L = g.line; if (u > 0) { L.visible = true; L.geometry.setFromPoints([ph, ph.clone().lerp(gp, u)]); L.computeLineDistances(); }
    const wp = w.position; setCam(camKeys(R, [[35.5, [wp.x + 1.6, 1.5, wp.z + 2.6], [wp.x, 0.8, wp.z], 40], [38.7, [wp.x + 2.0, 2.0, wp.z + 3.0], [wp.x, 0.7, wp.z], 40]]), 0.3);
    D.push(() => tag(gp, 60, 130, 'sabe dónde está', 'GPS del iPhone', K(R, 36.6, 0.3), S3.white, 32));
    pill('det');
  },
  report(R, D) {
    const g = g3(); setDome(V3(SC.x, 0, SC.z), DOME_R); const w = walkOn(g.walker, R, [-7, 1.6], [4, 1.6], 30.5, 38.7, { phone: true }); const ph = detect(w, R, 30, D, { link: false });
    const u = EZ.io(seg(R, 39.2, 41.2)); beam(ph, 40, u, 1, 1.3); for (let k = 0; k < 8; k++) { const f = ((R - 39.2) * 0.5 + k / 8) % 1; if (R > 39.2) spark(V3(ph.x, ph.y + f * 40 * u, ph.z), 0.35, 0.9 * (1 - f)); }
    setCam(camKeys(R, [[38.7, [ph.x + 4, 2.2, ph.z + 7], [ph.x, 1.6, ph.z], 42], [41.2, [ph.x + 6, 3.5, ph.z + 11], [ph.x, 4.5, ph.z], 48], [43.8, [ph.x + 7, 4.2, ph.z + 12], [ph.x, 5.5, ph.z], 50]]), 0.4);
    D.push(() => { tag(V3(ph.x, ph.y + 2.5, ph.z), 60, 40, 'cifrado', 'nadie más ve dónde', K(R, 39.6, 0.3), S3.yellow, 30); const a = K(R, 41.0, 0.3); if (a > 0) chip('red Buscar de Apple', CX, 470, a, '#16130f', '#f4f1ea', 38); });
    pill(R > 41.0 ? 'rep' : 'det');
  },
  nonet(R, D) {
    pill('rep'); const t = tagPos();
    setCam(camKeys(R, [[43.8, TAGC(-0.3, 0.2, 0.42), [t.x, t.y - 0.02, t.z], 34], [46.3, TAGC(-0.14, 0.28, 0.36), [t.x, t.y - 0.03, t.z], 34]]), 0.3);
    D.push(() => { tiles([0, 0, K(R, 44.0, 0.3)], [0, 0, K(R, 44.6, 0.35)]); chip('internet', CX, 640, K(R, 44.3, 0.3), '#16130f', '#8d8780', 30); });
  },
  stranger(R, D) {
    const g = g3(); setDome(V3(SC.x, 0, SC.z), DOME_R); const w = walkOn(g.walker, R, [4, 1.6], [10, 1.6], 46.0, 51.0, { phone: true }); detect(w, R, 40, D, { a: 1 - seg(R, 47.4, 48.4), link: false });
    setCam(camKeys(R, [[46.3, [2.0, 1.6, 6.0], [4.8, 1.1, 1.6], 40], [48.6, [3.5, 1.8, 6.4], [7.0, 1.1, 1.6], 40]]), 0.3);
    D.push(() => tag(phoneOf(w), -80, -170, 'su celular hizo el envío', null, K(R, 46.6, 0.3), S3.yellow, 30));
    pill('rep');
  },
  another(R, D) {
    const g = g3(); setDome(V3(SC.x, 0, SC.z), DOME_R, 0.8);
    const w2 = walkOn(g.walker2, R, [-7, -1.0], [7, 2.8], 48.2, 55, { phone: true }), w3 = walkOn(g.walker3, R, [6, -3.2], [-7, 2.4], 50.2, 57, { phone: true });
    const p2 = detect(w2, R, 49.4, D), p3 = detect(w3, R, 50.9, D);
    pin(1, V3(p2.x, 0, p2.z), SPR(R, 49.6, 0.45) * 0.9, 1, { disc: 1.4 }); pin(2, V3(p3.x, 0, p3.z), SPR(R, 51.0, 0.45) * 0.9, 1, { disc: 1.4 });
    if (R > 51.8) g.crowd.slice(10, 16).forEach((p, k) => { const a = (k / 6) * TAU + 0.4, rr = 2.6 + (k % 2) * 0.5, A = [Math.cos(a) * rr - 3 * Math.sin(a), Math.sin(a) * rr + 3 * Math.cos(a)], B = [Math.cos(a) * rr + 3 * Math.sin(a), Math.sin(a) * rr - 3 * Math.cos(a)]; const pp = walkOn(p, R, A, B, 51.0, 60, { phone: true, ph: k }); const q = detect(pp, R, 52.0 + k * 0.3, D); pin(3 + k, V3(q.x, 0, q.z), SPR(R, 52.2 + k * 0.3, 0.45) * 0.7, 1, { disc: 1.0 }); });
    setCam(camKeys(R, [[48.6, [0, 11, 8.5], [0, 0, 0.4], 44], [51.6, [-1, 12.5, 9], [0, 0, 0], 46], [54.7, [-2.5, 14, 9.5], [0, 0, -0.5], 48]]), 0.4);
    D.push(() => { const a = K(R, 52.6, 0.3); if (a > 0) chip('cada aparato = un punto de detección', CX, 1150, a, '#16130f', '#f4f1ea', 30); });
    pill('rep');
  },
  travel(R, D) {
    const g = g3(), u = EZ.io(seg(R, 54.6, 57.6)), sz = lerp(0, -9, u); g.suit.position.set(0.25, 0, sz); g.suit.rotation.set(-0.12 * K(R, 54.6, 0.3), 0, 0); g.suit.userData.tele.position.y = g.suit.userData.SH + 0.09 + 0.45 * K(R, 54.5, 0.3);
    const pr = g.porter; pr.visible = true; pr.position.set(0.25, 0, sz - 0.55); pr.rotation.y = Math.PI; walkPose(pr, (-sz / 0.7) * Math.PI, u > 0 && u < 1 ? 1 : 0, {}); pr.userData.arms[1].rotation.x = 0.35; pr.userData.arms[1].rotation.z = 0.15;
    setDome(V3(0.25, 0, sz), DOME_R);
    g.crowd.slice(16, 22).forEach((p, k) => { const x = -6 + k * 2.4, z = -2 - (k % 3) * 2.6; walkOn(p, R, [x, z + 4], [x, z - 4], 53 + k * 0.3, 61, { phone: true, ph: k }); const q = detect(p, R, 55.0 + k * 0.25, D, { a: Math.abs(x - 0.25) < 3.5 ? 1 : 0, link: false }); });
    setCam(camKeys(R, [[54.7, [3.5, 3.5, 6.0], [0, 0.6, -1], 42], [57.2, [3.0, 5.5, 2.0], [0, 0.4, -8], 44]]), 0.4);
    D.push(() => tag(tagPos(), 60, -160, 'la ubicación', 'se actualiza', K(R, 55.4, 0.3), S3.yellow, 30));
    pill('rep');
  },
  cityrun(R, D) {
    const g = g3(); g.hall.visible = g.suit.visible = false; g.city.visible = true; cityFog(25, 90);
    // the bus leaves the station along the avenue z = 3 (half a block south), then turns north on x = 21
    const L1 = 21, L2 = 30, s = lerp(0, L1 + L2, EZ.io(seg(R, 57.4, 64.4))), bx = s < L1 ? s : L1, bz = s < L1 ? 3 : 3 - (s - L1), b = g.bus;
    b.position.set(bx, 0, bz); b.rotation.y = s < L1 ? 0 : Math.PI / 2; setDome(V3(CITY + bx, 0, bz), 2.4);
    const n = Math.floor((R - 57.6) / 0.75); for (let k = 0; k <= Math.min(n, 9); k++) { const sk = lerp(0, L1 + L2, EZ.io(seg(57.6 + k * 0.75, 57.4, 64.4))), px = sk < L1 ? sk : L1, pz = sk < L1 ? 3 : 3 - (sk - L1);
      pin(k, V3(CITY + px, 0, pz), SPR(R, 57.6 + k * 0.75, 0.4) * 1.1, 1, { grey: k < n, disc: 1.8, discA: k < n ? 0.3 : 1 }); }
    const ox = lerp(-9, -6, seg(R, 57.2, 64.7)), oy = lerp(12, 17, seg(R, 57.2, 64.7)); setCam({ pos: [CITY + bx + ox, oy, bz + 12], tgt: [CITY + bx + 1, 0, bz - 1.5], fov: 42 }, 0.4);
    D.push(() => { tag(V3(CITY + bx, 1.2, bz), -40, -160, 'en el autobús', null, K(R, 58.4, 0.3) * (1 - seg(R, 61.0, 61.4)), S3.white, 30); const a = K(R, 61.4, 0.3); if (a > 0) chip('sin GPS propio', CX, 1150, a, '#16130f', '#f4f1ea', 36); });
    pill('last');
  },
  close(R, D) {
    const g = g3(); setDome(V3(SC.x, 0, SC.z), DOME_R); const y = walkOn(g.you, R, [-2.5, 9], [-0.9, 2.2], 64.4, 72, { phone: true, yaw: 0.2 });
    setCam(camKeys(R, [[64.7, [0.9, 0.9, -1.5], [-1.6, 0.9, 6], 42], [67.7, [1.1, 1.1, -1.2], [-1.2, 1.0, 3.5], 42]]), 0.3);
    D.push(() => tag(phoneOf(y), 60, -160, 'tú', null, K(R, 65.6, 0.3), S3.white, 34));
    pill('last');
  },
  near(R, D) {
    const g = g3(); setDome(V3(SC.x, 0, SC.z), DOME_R); const y = walkOn(g.you, R, [-2.5, 9], [-0.9, 2.2], 64.4, 72, { phone: true, yaw: 0.2 }); const ph = phoneOf(y);
    const pu = (R * 1.0) % 1; ring(ph, 0.35, K(R, 67.9, 0.3), { face: true }); ring(ph, 0.3 + pu * 0.5, (1 - pu) * K(R, 67.9, 0.3), { face: true });
    setCam(camKeys(R, [[67.7, [y.position.x + 1.1, 1.6, y.position.z - 1.9], [y.position.x + 0.05, 1.2, y.position.z], 40], [70.8, [y.position.x + 0.8, 1.65, y.position.z - 1.5], [y.position.x + 0.05, 1.25, y.position.z], 40]]), 0.3);
    D.push(() => tag(ph, 70, -190, 'está cerca', 'Bluetooth', K(R, 68.6, 0.3), S3.cyan, 34));
    pill('near');
  },
  uwb(R, D) {
    const g = g3(); setDome(V3(SC.x, 0, SC.z), DOME_R, 0.5); const y = walkOn(g.you, R, [-0.9, 2.2], [-0.5, 1.0], 72.6, 77.6, { phone: true, yaw: 0.6 }); const ph = phoneOf(y), t = tagPos();
    const u = EZ.io(seg(R, 72.6, 73.6)); if (u > 0) { const U = g.uwb, m = ph.clone().lerp(t, 0.5); U.visible = true; U.position.copy(ph.clone().lerp(t, u / 2)); U.scale.set(1, ph.distanceTo(t) * u, 1); U.quaternion.setFromUnitVectors(V3(0, 1, 0), t.clone().sub(ph).normalize()); }
    for (let k = 0; k < 4; k++) { const f = ((R - 72.6) * 1.4 + k / 4) % 1; if (R > 72.8) spark(ph.clone().lerp(t, f), 0.08, 0.9); }
    setCam(camKeys(R, [[70.8, [3.8, 1.8, 3.0], [-0.4, 0.9, 1.0], 50], [77.0, [3.4, 1.5, 2.2], [-0.4, 0.8, 0.6], 50]]), 0.3);
    D.push(() => { { const a = K(R, 70.9, 0.3); if (a > 0) s3Label(80, 440, 'Banda ultraancha', 'iPhone compatibles', { alpha: a, color: S3.white, size: 34 }); } const d = ph.distanceTo(t), a = K(R, 73.8, 0.3); if (a > 0) { const [mx, my] = P2(ph.clone().lerp(t, 0.5)); chip(`${d.toFixed(1).replace('.', ',')} m · dirección`, clamp(mx, 300, 780), clamp(my + 90, 500, 1200), a, '#16130f', '#f4f1ea', 32); } });
    pill(R > 72.6 ? 'prec' : 'near');
  },
  arrow(R, D) {
    const g = g3(), P = g.bigPhone; P.visible = true; g.hall.visible = g.suit.visible = false; g.scene.background.set('#0c0a08');
    const d = lerp(2.0, 1.2, EZ.io(seg(R, 77.6, 80.2))), ang = -0.6 + 0.25 * Math.sin(R * 0.9); P.position.set(0, 0.003 * Math.sin(R * 1.3), 0); P.rotation.set(-0.08, -0.1 + 0.05 * Math.sin(R * 0.5), 0.03);
    paintScr(P, screenFind, { dist: d.toFixed(1).replace('.', ',').replace(',0', '') + ' m', ang, dir: 'a tu izquierda' });
    setCam(camKeys(R, [[77.0, [0.05, 0.0, 0.36], [0, 0, 0], 38], [80.5, [0.02, 0.01, 0.3], [0, 0, 0], 38]]), 0.2);
    D.push(() => { const a = K(R, 77.0, 0.25); if (a > 0) { ctx.save(); screen(); ctx.globalAlpha = a * 0.9; ctx.fillStyle = '#f2b632'; ctx.translate(CX, 1000); ctx.rotate(-0.32); ctx.fillRect(-900, -40, 1800 * EZ.o3(seg(R, 77.0, 77.6)), 80); ctx.restore(); } });
    pill('prec');
  },
  beacon(R, D) {
    pill('bt'); const t = tagPos();
    for (let k = 0; k < 3; k++) { const f = (R * 0.7 + k / 3) % 1; ring(V3(t.x, t.y + 0.02, t.z), 0.06 + f * 0.5, (1 - f) * 0.9); }
    setCam(camKeys(R, [[80.5, TAGC(0.26, 0.24, 0.44), [t.x, t.y - 0.02, t.z], 34], [84.5, TAGC(-0.1, 0.38, 0.5), [t.x, t.y - 0.03, t.z], 36]]), 0.3);
    D.push(() => { const a = K(R, 81.6, 0.3); if (a > 0) chip('no es un GPS', CX, 1150, a * (1 - seg(R, 83.6, 84.0)), '#16130f', '#f4f1ea', 36); tag(t, 120, -220, 'faro Bluetooth', null, K(R, 84.0, 0.3), S3.cyan, 34); });
  },
  network(R, D) {
    const g = g3(); setDome(V3(SC.x, 0, SC.z), DOME_R, 0.6);
    g.crowd.forEach((p, k) => { const Rn = RNG('nw', k), x = Rn.r(-10, 10), z = Rn.r(-9, 5), dir = Rn.f() < 0.5 ? 1 : -1; walkOn(p, R, [x, z], [x + dir * 6, z], 83, 95, { phone: true, ph: k }); const q = phoneOf(p);
      const t0 = 85.0 + (k % 9) * 0.35; ring(q, 0.3, K(R, t0, 0.3)); beam(q, 30, EZ.io(seg(R, t0, t0 + 1.4)), 0.8, 0.8); });
    setCam(camKeys(R, [[84.5, [-9, 9, 16], [0, 1, -2], 44], [89.5, [-11, 16, 18], [0, 5, -3], 50]]), 0.4);
    D.push(() => { const a = K(R, 86.4, 0.3); if (a > 0) chip('una enorme red colaborativa', CX, 520, a, '#16130f', '#f4f1ea', 36); });
    pill('rep');
  },
  outro(R, D) {
    const g = g3(), t = tagPos(), e = EZ.io(seg(R, 93.6, 94.8)); g.suit.userData.tele.position.y = g.suit.userData.SH + 0.09 + 0.45 * e;
    const y = g.you; walkOn(y, R, [-0.6, 0.9], [-0.6, 0.9], 0, 1, { phone: true, yaw: 0.6 }); y.visible = R < 92.8;
    setCam(camKeys(R, [[89.5, [2.4, 1.4, 3.6], [0, 0.55, 0], 38], [93.2, [1.4, 1.1, 2.2], [0, 0.65, 0], 38], [97.62, [0.9, 1.5, 1.4], [0, 1.0, 0], 38]]), 0.3);
    D.push(() => { tiles([KO(R, 89.8, 93.4, 0.3), KO(R, 90.6, 93.4, 0.3), KO(R, 92.2, 93.4, 0.3)], [K(R, 90.2, 0.3), K(R, 91.2, 0.3), K(R, 92.6, 0.3)]);
      tag(t, 100, -200, 'de vuelta contigo', null, K(R, 95.0, 0.3), S3.yellow, 32);
      const a = K(R, 96.3, 0.4); if (a > 0) s3Text('ALTERBASE', CX, H / 2, { size: 44, align: 'center', alpha: a * 0.95, spacing: 6 }); });
    pill(R > 93.6 ? 'near' : 'off');
  },
};
