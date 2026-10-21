// =====================================================================
//  SHOTS — every shot of reference 10 (+ the added close) in reference time R; dissolves at every boundary.
//  Everything moves: the train sways, people breathe and shift, cards spring in, rings pulse, the camera drifts.
// =====================================================================
const K = (R, a, d = 0.35) => EZ.o2(seg(R, a, a + d));
const KO = (R, a, b, d = 0.35) => Math.min(K(R, a, d), 1 - EZ.i2(seg(R, b - d, b)));
const SPR = (R, a, d = 0.45) => (R < a ? 0 : EZ.back(seg(R, a, a + d)));
let HUD = { pill: '' };

function sceneMain() {
  const R = (RNOW = refT(TT)), g = g3();
  const run = (key, alpha) => { resetWorld(); if (PHONE) PHONE.visible = false; HUD = { pill: '' }; idle(R); const D = []; SHOT_FN[key](R, D); renderWorld(alpha); return { D, pill: HUD.pill }; };
  let i = SHOTS_R.findIndex(([, a, b]) => R >= a && R < b); if (i < 0) i = SHOTS_R.length - 1; const XF = 0.25; let out;
  const nb = SHOTS_R[i + 1], pb = SHOTS_R[i - 1];
  if (nb && R > nb[1] - XF) { const u = EZ.io(seg(R, nb[1] - XF, nb[1] + XF)), A = run(SHOTS_R[i][0], 1), B = run(nb[0], u); out = u < 0.5 ? A : B; }
  else if (pb && R < SHOTS_R[i][1] + XF) { const u = EZ.io(seg(R, SHOTS_R[i][1] - XF, SHOTS_R[i][1] + XF)), A = run(pb[0], 1), B = run(SHOTS_R[i][0], u); out = u < 0.5 ? A : B; }
  else out = run(SHOTS_R[i][0], 1);
  out.D.forEach((f) => f()); HUD.pill = out.pill;
  const hud = () => { if (HUD.pill) s3Pill(HUD.pill, 1, { y: 290 }); s3Caption(TT); };
  if (DEFER) DEFER.push(hud); else hud();
}
// the people idle: breathing, the train's sway, glances
function idle(R) {
  const g = g3(), sway = 0.02 * Math.sin(R * 1.7) + 0.01 * Math.sin(R * 3.9);
  pose(g.victim, { arm: -0.08, elbow: -0.15, ph: 0, yaw: 0.2 * Math.sin(R * 0.4), down: 0.15 }); g.victim.rotation.z = sway; g.victim.position.x = g.MX + 0.05 + 0.01 * Math.sin(R * 1.7);
  pose(g.thief, { arm: -0.08, elbow: -0.15, ph: 2, down: 0.25, yaw: -0.2 }); g.thief.rotation.z = sway * 1.2;
  { const a = g.victim.userData.arms[1]; a.rotation.set(-2.6, 0, 0.25); a.userData.el.rotation.x = -0.3; }   // her right hand up on the bar
  { const a = g.thief.userData.arms[0]; a.rotation.set(-0.9, 0, -0.35); a.userData.el.rotation.x = -0.6; }  // his left arm reaching low
  pose(g.shopper, { arm: -0.08, elbow: -0.15, ph: 1, down: 0.5 }); pose(g.peeker, { arm: -0.08, elbow: -0.15, ph: 3, down: 0.35, yaw: -0.25 });
}
// ---- 2D helpers
function tag(v, dx, dy, title, sub, a, c = S3.yellow, size = 40, align = 'left') {
  if (a <= 0) return; const [x, y] = P2(v); if (align === 'left' && x + dx > 640) { align = 'right'; dx = Math.min(dx, -40); }
  ctx.save(); ctx.font = s3Font(size); let tw = ctx.measureText(title).width; if (sub) { ctx.font = s3Font(Math.round(size * 0.6)); tw = Math.max(tw, ctx.measureText(sub).width + 4); } ctx.restore();
  const lo = align === 'right' ? 60 + tw : align === 'center' ? 60 + tw / 2 : 60, hi = align === 'right' ? 1020 : align === 'center' ? 1020 - tw / 2 : 1020 - tw;
  const lx = clamp(x + dx, lo, Math.max(lo, hi)), ly = clamp(y + dy, 380, 1300);
  s3Leader(lx + (align === 'right' ? 8 : align === 'center' ? 0 : -8), ly + 10, x, y, c, a * 0.85, 1, 2.5); s3Label(lx, ly, title, sub, { alpha: a, color: c, size, align });
}
function bigText(str, sub, a, y = 560, c = S3.white, size = 120) { if (a <= 0) return; s3Text(str, CX, y, { size, color: c, align: 'center', alpha: a }); if (sub) s3Text(sub, CX, y + 48, { size: 24, color: S3.note, align: 'center', alpha: a, spacing: 3 }); }
// ---- 3D helpers
const UP = V3(0, 1, 0), FWD = V3(0, 0, 1);
const HQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V3(-1, 0, 0), V3(0, 0, 1), V3(0, 1, 0)));   // hand palm onto a surface whose normal is +z, fingers along its +y
function onStageTerm(R) { const t = g3().term; t.visible = true; t.position.set(0, -0.04, 0); t.rotation.set(-0.55 + 0.02 * Math.sin(R * 0.7), 0.12 * Math.sin(R * 0.35), 0); return t; }
function hoverOver(card, term, h) { term.updateMatrixWorld(); const n = FWD.clone().applyQuaternion(term.quaternion); card.position.copy(wpt(term, 0, 0.042, 0.016)).addScaledVector(n, h); card.quaternion.copy(term.quaternion); card.rotateZ(0.08); return n; }
function feedScreen(x, o = {}) {
  x.fillStyle = '#0c0c12'; x.fillRect(0, 0, 540, 1120); const items = ['ME ROBARON LA TARJETA SOLO AL PASAR', 'Hackers roban tu tarjeta en 2 segundos', 'Este lector lee tu bolsillo', 'Nunca lleves tu tarjeta así', 'Así te vacían la cuenta en el metro', 'El truco del lector escondido'];
  const off = (o.scroll ?? 0) * 260; items.forEach((t, i) => { const y = 120 + i * 260 - off; if (y < -240 || y > 1120) return; x.fillStyle = '#3a1014'; x.beginPath(); x.roundRect(30, y, 480, 220, 22); x.fill();
    x.fillStyle = '#ff4a4a'; x.beginPath(); x.moveTo(70, y + 110); x.lineTo(100, y + 58); x.lineTo(130, y + 110); x.fill(); x.fillStyle = '#fff'; x.font = `700 30px ${S3.font}`; wrapText(x, t, 150, y + 70, 330, 36); x.fillStyle = '#9a8a8a'; x.font = `700 22px ${S3.font}`; x.fillText(['20 M vistas', '9 M vistas', '660 mil vistas', '372 mil vistas', '1,2 M vistas', '880 mil vistas'][i], 150, y + 190); });
  x.fillStyle = '#000'; x.beginPath(); x.roundRect(190, 22, 160, 46, 23); x.fill();
}
let PHONE = null; const phone = () => { if (!PHONE) { PHONE = buildPhone('#2a2c34'); g3().scene.add(PHONE); } return PHONE; };

const SHOT_FN = {
  skim(R, D) {
    const g = g3(), pocket = V3(g.MX + 0.2, 0.84, 0.34); g.reader.visible = true; g.reader.position.set(g.MX + 0.36 - 0.03 * K(R, 0.4, 1.5), 0.88, 0.2); g.reader.lookAt(pocket); g.reader.rotateY(Math.PI);
    ringsAt(g.reader.position.clone(), pocket.clone().sub(g.reader.position).normalize(), R, K(R, 0.5, 0.4), { len: 0.16, r0: 0.012, r1: 0.03, speed: 1.4 });
    setCam(camKeys(R, [[0, [g.MX + 2.0, 1.6, 1.25], [g.MX + 0.2, 1.15, 0.15], 46], [5.0, [g.MX + 1.4, 1.3, 1.05], [g.MX + 0.22, 0.95, 0.25], 46]]), 0.6);
    D.push(() => tag(g.reader.position, 160, -170, 'lector de tarjetas', 'escondido en una bolsa', K(R, 1.4, 0.3), '#ff6a6a', 38));
    HUD.pill = 'EN EL METRO';
  },
  feed(R, D) {
    const g = g3(), p = phone(); p.visible = true; p.position.set(0, 0.02 * Math.sin(R * 1.3), 0); p.rotation.set(-0.1, 0.15 * Math.sin(R * 0.5), 0.05); paintScr(p, feedScreen, { scroll: EZ.io(seg(R, 5.0, 6.4)) * 2.2 });
    setCam(camKeys(R, [[5.0, [0.02, 0.0, 0.3], [0, 0, 0], 40], [6.4, [-0.01, 0.0, 0.26], [0, 0, 0], 40]]), 0.3);
    HUD.pill = 'ESOS VIDEOS';
  },
  card(R, D) {
    const g = g3(), c = g.card; c.visible = true; const s = SPR(R, 6.5, 0.6); c.scale.setScalar(Math.max(0.001, s)); c.position.set(0, 0.004 * Math.sin(R * 1.4), 0);
    c.rotation.set(-0.25 + 0.05 * Math.sin(R * 0.8), -0.5 + 0.5 * EZ.o3(seg(R, 6.5, 7.6)) + 0.08 * Math.sin(R * 0.6), 0.06);
    const xr = K(R, 8.2, 0.5); cardXray(c, xr, 0);
    const dim = K(R, 9.6, 0.6); c.position.y -= 0.006 * dim; c.rotation.z += 0.05 * dim;
    setCam(camKeys(R, [[6.4, [0.03, 0.02, 0.22], [0, 0, 0], 40], [11.2, [-0.02, 0.03, 0.18], [0, 0, 0], 40]]), 0.4);
    D.push(() => { tag(wpt(c, CW / 2 - 0.01, -CH / 2 + 0.004, 0), 30, 150, 'batería', 'no tiene', K(R, 8.4, 0.3), S3.white, 38); tag(wpt(c, ...c.userData.chip.toArray()), -40, -170, 'chip', null, K(R, 8.7, 0.3), '#ffcf5a', 38);
      tag(wpt(c, CW / 2 - 0.004, CH / 2 - 0.006, 0), 0, -150, 'antena', 'una bobina de cobre', K(R, 9.0, 0.3), '#7ae8ff', 36); const z = K(R, 9.7, 0.4); if (z > 0) s3Text('z z z', CX + 230, 600 - 20 * Math.sin(R * 2), { size: 48, color: S3.note, alpha: z * (0.6 + 0.4 * Math.sin(R * 3)) }); });
    HUD.pill = 'SIN BATERÍA';
  },
  terminal(R, D) {
    const g = g3(), t = onStageTerm(R), c = g.card; paintTerm(t, {}); c.visible = true;
    const down = EZ.io(seg(R, 11.6, 13.4)), n = hoverOver(c, t, lerp(0.22, 0.035, down) + 0.003 * Math.sin(R * 2));
    const wake = EZ.o2(seg(R, 16.4, 18.0)), xr = Math.max(K(R, 15.4, 0.4), 0.6 * (1 - down)); cardXray(c, xr, wake * (0.85 + 0.15 * Math.sin(R * 9)));
    ringsAt(wpt(t, 0, 0.042, 0.017), n, R, K(R, 13.6, 0.4), { grow: true, r0: 0.01, r1: 0.06, n: 6, color: '#7ab8ff', speed: 0.8 });
    if (wake > 0) for (let k = 0; k < 14; k++) { const Rn = RNG('wk', k), u = (R * 0.6 + Rn.f()) % 1; spark(wpt(c, Rn.n(CW / 2), Rn.n(CH / 2), 0.002 + u * 0.01), 0.004, wake * (1 - u)); }
    setCam(camKeys(R, [[11.2, [0.05, 0.12, 0.3], [0, 0.0, 0], 40], [16.0, [-0.04, 0.1, 0.24], [0, 0.01, 0], 40], [21.2, [0.03, 0.11, 0.2], [0, 0.02, 0], 40]]), 0.4);
    D.push(() => { tag(wpt(t, 0.03, 0.06, 0.02), 140, -160, 'campo magnético', 'de la terminal', K(R, 14.0, 0.3), '#7ab8ff', 38); tag(wpt(c, CW / 2 - 0.004, CH / 2 - 0.006, 0), -60, -140, 'antena', 'recibe la energía', K(R, 16.6, 0.3), '#7ae8ff', 36);
      if (R > 19.2) s3Readout('0,5', 's', 'DESPIERTA', K(R, 19.2, 0.3), { y: 1300, bar: S3.cyan }); });
    HUD.pill = wake > 0.5 ? 'DESPIERTA' : 'LA TERMINAL';
  },
  chip(R, D) {
    const g = g3(), se = g.se, I = g.infos; se.visible = true; se.rotation.y = 0.25 * Math.sin(R * 0.4); g.core.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(R * 3);
    const core = wpt(se, 0, 0.12, 0); g.keyG.visible = R > 24.3; g.keyG.rotation.set(0, R * 0.8, 0.2 * Math.sin(R)); g.keyG.scale.setScalar(0.6 * (SPR(R, 24.3, 0.4) || 0.001));
    const fly = (m, t0, from) => { if (R < t0) return; const u = EZ.io(seg(R, t0, t0 + 1.4)); m.visible = u < 0.98; m.position.copy(from.clone().lerp(core, u)); m.scale.setScalar(SPR(R, t0, 0.35) * (1 - 0.7 * u)); m.lookAt(g.cam.position); };
    fly(I.num, 21.6, V3(-0.12, 0.55, 0.1)); fly(I.pago, 22.4, V3(0.12, 0.45, 0.1));
    setCam(camKeys(R, [[21.2, [0.12, 0.8, 1.5], [0, 0.24, 0], 40], [28.8, [-0.1, 0.72, 1.32], [0, 0.24, 0], 40]]), 0.4);
    D.push(() => tag(wpt(g.keyG, 0, 0, 0), 120, 170, 'llave secreta', 'nunca sale del chip', K(R, 24.6, 0.3), '#ffcf5a', 40));
    HUD.pill = 'DENTRO DEL CHIP';
  },
  code(R, D) {
    const g = g3(), se = g.se, I = g.infos; se.visible = true; se.rotation.y = 0.25 * Math.sin(R * 0.4); g.core.material.emissiveIntensity = 0.6 + 0.6 * K(R, 29.0, 0.3) * Math.exp(-(R - 29) * 2) + 0.3 * Math.sin(R * 3);
    const core = wpt(se, 0, 0.12, 0); g.keyG.visible = true; g.keyG.rotation.set(0, R * 0.8, 0); g.keyG.position.set(0, 0.12, 0.09);
    const out = (m, t0, to) => { if (R < t0) return; const u = EZ.o3(seg(R, t0, t0 + 0.9)); m.visible = true; m.position.copy(core.clone().lerp(to, u)); m.scale.setScalar(Math.max(0.001, SPR(R, t0, 0.5))); m.lookAt(g.cam.position); };
    out(I.code, 29.1, V3(-0.04, 0.5, 0.1)); out(I.next, 31.7, V3(0.05, 0.36, 0.15));
    if (R > 31.7) I.code.material.opacity = 1 - 0.55 * K(R, 31.9, 0.4); else I.code.material.opacity = 1;
    for (let k = 0; k < 16 && R > 29.1 && R < 30.2; k++) { const Rn = RNG('cd', k), u = seg(R, 29.1, 30.2), a = Rn.f() * TAU; spark(core.clone().add(V3(Math.cos(a) * u * 0.25, u * Rn.r(0.05, 0.3), Math.sin(a) * u * 0.25)), 0.03, 1 - u); }
    setCam(camKeys(R, [[28.8, [-0.1, 0.72, 1.32], [0, 0.26, 0], 40], [33.4, [0.08, 0.76, 1.42], [0, 0.28, 0], 40]]), 0.4);
    D.push(() => { tag(I.code.position, 160, -150, 'código de un solo uso', 'sirve solo para este pago', K(R, 29.6, 0.3), '#3ad08a', 38); if (R > 31.7) tag(I.next.position, 160, 120, 'el próximo pago', 'otro código distinto', K(R, 32.0, 0.3), S3.note, 34); });
    HUD.pill = 'UN CÓDIGO NUEVO CADA VEZ';
  },
  thief(R, D) {
    const g = g3(), pocket = V3(g.MX + 0.2, 0.84, 0.34), lean = EZ.io(seg(R, 33.6, 35.4)); g.reader.visible = true; g.reader.position.set(g.MX + 0.36 - 0.08 * lean, 0.88 - 0.02 * lean, 0.2 + 0.04 * lean); g.reader.lookAt(pocket); g.reader.rotateY(Math.PI);
    g.thief.position.x = g.MX + 0.42 - 0.05 * lean; pose(g.thief, { arm: -0.08, elbow: -0.15, ph: 2, down: 0.35, yaw: -0.35, lean: 0.12 * lean }); { const a = g.thief.userData.arms[0]; a.rotation.set(-1.1 - 0.2 * lean, 0, -0.4); a.userData.el.rotation.x = -0.5; }
    ringsAt(g.reader.position.clone(), pocket.clone().sub(g.reader.position).normalize(), R, 1, { len: 0.1, r0: 0.012, r1: 0.025, speed: 1.6 });
    setCam(camKeys(R, [[33.4, [g.MX + 0.75, 1.05, 0.95], [g.MX + 0.25, 0.88, 0.28], 38], [38.8, [g.MX + 0.62, 0.98, 0.82], [g.MX + 0.24, 0.87, 0.3], 38]]), 0.5);
    D.push(() => { if (R > 36.2) s3Readout('≈ 5', 'cm', 'ALCANCE NORMAL', K(R, 36.2, 0.3), { y: 1300, bar: '#ff6a6a' }); });
    HUD.pill = 'EL LADRÓN SE ACERCA';
  },
  list(R, D) {
    const g = g3(); g.reader.visible = true; g.reader.position.set(g.MX + 0.29, 0.86, 0.24); g.reader.lookAt(V3(g.MX + 0.2, 0.84, 0.34)); g.reader.rotateY(Math.PI); ringsAt(g.reader.position.clone(), V3(g.MX + 0.2, 0.84, 0.34).sub(g.reader.position).normalize(), R, 0.6, { len: 0.1, r0: 0.012, r1: 0.025, speed: 1.6 });
    setCam(camKeys(R, [[38.8, [g.MX + 0.62, 0.98, 0.82], [g.MX + 0.24, 0.87, 0.3], 38], [45.0, [g.MX + 0.75, 1.05, 0.95], [g.MX + 0.25, 0.88, 0.28], 38]]), 0.5);
    D.push(() => {
      const a = K(R, 39.0, 0.4); if (a <= 0) return; ctx.save(); screen(); ctx.globalAlpha = a * 0.55; ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a * 0.92; ctx.fillStyle = '#121620'; ctx.beginPath(); ctx.roundRect(110, 460, 860, 560, 24); ctx.fill(); ctx.restore();
      s3Text('LO QUE SE LLEVA EL LADRÓN', 160, 530, { size: 26, color: S3.note, alpha: a, spacing: 3 });
      [['Número de tarjeta', true, 39.3], ['Fecha de vencimiento', true, 40.3], ['Código de seguridad', false, 42.1], ['Llave secreta', false, 43.5]].forEach(([t, ok, t0], i) => { const b = SPR(R, t0, 0.4); if (b <= 0) return; const y = 640 + i * 100;
        s3Text(t, 160 + (1 - Math.min(1, b)) * 40, y, { size: 44, alpha: clamp(b) }); s3Text(ok ? '✓' : '✕', 900, y, { size: 56 * Math.min(1.2, b), color: ok ? '#3ad08a' : '#ff5a5a', align: 'center', alpha: clamp(b) }); });
    });
    HUD.pill = '¿QUÉ SE LLEVA?';
  },
  copy(R, D) {
    const g = g3(), t = onStageTerm(R), c = g.copy, no = R > 47.0; c.visible = true; paintTerm(t, { state: no ? 'no' : '' });
    const down = EZ.io(seg(R, 45.1, 46.9)); hoverOver(c, t, lerp(0.25, 0.03, down)); c.rotateZ(0.3 * (1 - down));
    if (no) { const k = Math.exp(-(R - 47) * 5); t.rotation.z += 0.04 * k * Math.sin(R * 60); c.position.y += 0.03 * EZ.o2(seg(R, 47.2, 48.2)); for (let i = 0; i < 18 && R < 47.9; i++) { const Rn = RNG('no', i), u = seg(R, 47.0, 47.9), a = Rn.f() * TAU; spark(wpt(t, Math.cos(a) * u * 0.08, 0.042 + Math.sin(a) * u * 0.08, 0.03), 0.006, 1 - u); } }
    setCam(camKeys(R, [[45.0, [0.04, 0.16, 0.32], [0, 0.03, 0], 40], [49.75, [-0.03, 0.12, 0.25], [0, 0.02, 0], 40]]), 0.4);
    D.push(() => tag(wpt(c, 0, CH / 2, 0), 150, -170, 'una copia', 'no puede crear códigos nuevos', K(R, 45.6, 0.3) * (1 - seg(R, 49.2, 49.5)), '#ff8a8a', 38));
    HUD.pill = no ? 'RECHAZADA' : 'UNA COPIA';
  },
  tap(R, D) {
    const g = g3(), t = g.term; t.visible = true; t.position.set(g.SX + 0.1, 1.085, -0.32); t.rotation.set(-0.7, -0.2, 0); const ok = R > 50.7; paintTerm(t, { state: ok ? 'ok' : '' });
    const tapU = EZ.io(seg(R, 49.9, 50.6)) * (1 - EZ.io(seg(R, 51.3, 52.0))), h = g.hand; h.visible = true; const scr = wpt(t, 0, 0.042, 0.02), n = FWD.clone().applyQuaternion(t.quaternion);
    h.position.copy(scr).addScaledVector(n, lerp(0.16, 0.04, tapU) + 0.012); h.quaternion.copy(t.quaternion).multiply(HQ); h.position.addScaledVector(V3(0, 1, 0).applyQuaternion(t.quaternion), -0.085);
    const c = g.card; c.visible = true; c.position.copy(scr).addScaledVector(n, lerp(0.15, 0.025, tapU)); c.quaternion.copy(t.quaternion); c.rotateZ(0.1);
    setCam(camKeys(R, [[49.75, [g.SX + 0.45, 1.35, 0.25], [g.SX + 0.1, 1.08, -0.32], 40], [52.3, [g.SX + 0.38, 1.3, 0.15], [g.SX + 0.1, 1.08, -0.32], 40]]), 0.4);
    D.push(() => { if (ok) tag(scr, -140, -170, 'acercar la tarjeta', 'no es lo peligroso', K(R, 50.9, 0.3), '#3ad08a', 38); });
    HUD.pill = 'PAGAR ASÍ ES SEGURO';
  },
  pin(R, D) {
    const g = g3(), t = g.term; t.visible = true; t.position.set(g.SX + 0.1, 1.085, -0.32); t.rotation.set(-0.7, -0.2, 0); paintTerm(t, {});
    { const a = g.shopper.userData.arms[1], tap = 0.1 * Math.max(0, Math.sin(R * 9)); a.rotation.set(-1.25 - tap, 0, 0.35); a.userData.el.rotation.x = -0.6; }
    pose(g.peeker, { arm: -0.08, elbow: -0.15, ph: 3, down: 0.55, yaw: -0.5, lean: 0.15 * K(R, 52.5, 0.8) });
    setCam(camKeys(R, [[52.3, [g.SX - 1.9, 2.0, -0.95], [g.SX + 0.15, 1.3, 0.5], 46], [55.2, [g.SX - 1.6, 1.95, -0.8], [g.SX + 0.15, 1.28, 0.5], 46]]), 0.5);
    D.push(() => { const e = wpt(g.peeker.userData.head, 0, 0.11, 0.1), k = wpt(t, 0, -0.03, 0.02), [x0, y0] = P2(e), [x1, y1] = P2(k), a = K(R, 52.8, 0.3); if (a > 0) { ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = '#ff4a4a'; ctx.lineWidth = 4; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -R * 60; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); }
      tag(e, 60, -160, 'el que te está viendo', 'mientras escribes tu PIN', K(R, 53.2, 0.3), '#ff6a6a', 38); });
    HUD.pill = 'LO PELIGROSO';
  },
  cover(R, D) {
    const g = g3(), t = g.term; t.visible = true; t.position.set(g.SX + 0.1, 1.085, -0.32); t.rotation.set(-0.7, -0.2, 0); paintTerm(t, {});
    const cov = EZ.back(seg(R, 55.4, 56.1)), h = g.hand; h.visible = true; const kp = wpt(t, 0, -0.03, 0.02), n = FWD.clone().applyQuaternion(t.quaternion);
    h.position.copy(kp).addScaledVector(n, lerp(0.2, 0.03, Math.min(1, cov))); h.quaternion.copy(t.quaternion).multiply(HQ); h.rotateY(0.5); h.position.addScaledVector(V3(0, 1, 0).applyQuaternion(t.quaternion), -0.04);
    pose(g.peeker, { arm: -0.08, elbow: -0.15, ph: 3, down: 0.3, yaw: lerp(-0.5, 0.6, K(R, 56.6, 0.8)) });
    setCam(camKeys(R, [[55.2, [g.SX - 1.6, 1.95, -0.8], [g.SX + 0.15, 1.28, 0.5], 46], [56.3, [g.SX + 0.55, 1.4, 0.15], [g.SX + 0.1, 1.08, -0.32], 40], [59.0, [g.SX + 0.7, 1.5, 0.35], [g.SX + 0.1, 1.08, -0.32], 40]]), 0.5);
    D.push(() => { const e = wpt(g.peeker.userData.head, 0, 0.11, 0.1), [x0, y0] = P2(e), [x1, y1] = P2(kp), a = 1 - K(R, 56.0, 0.4); if (a > 0) { ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = '#ff4a4a'; ctx.lineWidth = 4; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, 0.75), lerp(y0, y1, 0.75)); ctx.stroke(); ctx.restore(); }
      tag(kp, -150, -190, 'tápalo con la mano', 'así de fácil', K(R, 55.9, 0.3) * (1 - seg(R, 57.9, 58.2)), '#3ad08a', 40); const e2 = K(R, 58.3, 0.4); if (e2 > 0) s3Text('DOPAMENTES', CX, H / 2, { size: 44, align: 'center', alpha: e2 * 0.95, spacing: 6 }); });
    HUD.pill = 'TÁPALO';
  },
};
