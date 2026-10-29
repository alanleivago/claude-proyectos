// =====================================================================
//  RUN — the shots. The teacher stands at the board on the point rig (feet planted by IK, the chalk tip on the board),
//  rises out of her shoes (the shoes never move), and later hangs pressed to the ceiling (ceilPose): back on the boards,
//  arms and legs hanging, the neck a long bent chain, the head upside down facing whoever she stares at.
// =====================================================================
const T2 = () => Math.floor(TT * 12 + 1e-6) / 12;
const shake = (t, k) => V3(Math.sin(t * 61) * k, Math.sin(t * 47 + 1) * k, Math.sin(t * 53 + 2) * k);
const easeOut = (x) => 1 - (1 - x) ** 3;
const fadeWin = (a, b, d = 0.6) => Math.min(ss(a, a + d, TT), 1 - ss(b - d, b, TT));
const DOWN = V3(0, -1, 0), UPV = V3(0, 1, 0);
const TST = V3(-0.42, 0, -4.2);                       // where she stands at the board (and where her shoes stay)
const SHOE = [V3(TST.x - 0.1, PLAT_Y, TST.z - 0.02), V3(TST.x + 0.1, PLAT_Y, TST.z - 0.02)];   // [left (−x), right (+x)]

// ---- the pupils
function poseKid(k, o = {}) {
  const s = k.s, d = k.desk.position, cz = d.z + CHAIR_DZ, lean = 0.1 + (o.lean ?? 0), t = TT;
  const pos = V3(d.x, SEAT_Y + 0.082 * s, cz - 0.02), U = V3(0, Math.cos(lean), -Math.sin(lean)), F = V3(0, -Math.sin(lean), -Math.cos(lean));
  const wr = o.write ?? 0, wx = 0.025 * Math.sin(t * 7 + k.ph) * wr, wz = 0.015 * Math.cos(t * 5 + k.ph) * wr;
  const hands = [V3(d.x - 0.13 * s, DESK_Y + 0.036, d.z + 0.08), V3(d.x + 0.1 * s + wx, DESK_Y + 0.036 + 0.004 * wr, d.z + 0.04 + wz)];   // [left (−x), right (+x)]: kids face −z
  if (o.flat) { hands[0] = V3(d.x - 0.12 * s, DESK_Y + 0.036, d.z + 0.06); hands[1] = V3(d.x + 0.12 * s, DESK_Y + 0.036, d.z + 0.06); }
  const hdir = [{ Z: V3(0.3, -0.2, -1), Y: V3(0, 1, -0.2) }, { Z: V3(-0.3, -0.2, -1), Y: V3(0, 1, -0.2) }];
  const feet = [V3(d.x - 0.1 * s, 0.07 * s, cz - 0.02 - 0.37 * s), V3(d.x + 0.1 * s, 0.07 * s, cz - 0.02 - 0.37 * s)];
  poseP(k, { pos, U, F, head: { pitch: o.pitch ?? k.bow, yaw: o.yaw ?? k.yaw, roll: o.roll ?? 0 }, hands, hdir, epole: [V3(-1, -0.6, 0.5), V3(1, -0.6, 0.5)], feet, kpole: V3(0, 0.45, -1), eyesWide: o.eyesWide ?? 0, breath: Math.sin(t * 1.6 + k.ph) * (o.breath ?? 0.6) });
}
// everyone: writing / looking at the board before she stops, frozen with their eyes down after
function poseKids(Wd, o = {}) {
  const t = TT, fz = o.frozen ?? ss(19.6, 21.0, t);
  Wd.kids.forEach((k) => { if (k.hidden) { k.g.visible = false; return; }
    const looksUp = ((k.ci * 7 + k.ri * 3) % 5) < 2, p0 = looksUp ? -0.02 + 0.06 * Math.sin(t * 0.7 + k.ph) : k.bow, pitch = lerp(p0, Math.max(k.bow, 0.5), fz);
    poseKid(k, { pitch, write: (looksUp ? 0 : 1) * (1 - fz), breath: lerp(0.6, 0.35, fz), yaw: k.yaw * (1 - fz) }); });
}
// ---- the teacher standing at the board. o: { tip (chalk tip on the board) | null, arm (0 at the board .. 1 hanging),
//   phi (heels: foot pitch), rise (m), head: { roll, pitch }, curl }
function footFrame(i, phi, rise) {
  const fwd = V3(0, 0, -1), Z = fwd.clone().multiplyScalar(Math.cos(phi)).addScaledVector(UPV, -Math.sin(phi)), Y = UPV.clone().multiplyScalar(Math.cos(phi)).addScaledVector(fwd, Math.sin(phi));
  const ankle0 = SHOE[i].clone().addScaledVector(fwd, -0.04).setY(PLAT_Y + 0.087), ball = ankle0.clone().addScaledVector(fwd, 0.12).addScaledVector(UPV, -0.075).addScaledVector(UPV, rise);
  return { A: ball.clone().addScaledVector(Z, -0.12).addScaledVector(Y, 0.075), Z, Y };
}
function teacherStand(Wd, o = {}) {
  const T = Wd.T, ph = Array.isArray(o.phi) ? o.phi : [o.phi ?? 0, o.phi ?? 0], rise = o.rise ?? 0, f = [footFrame(0, ph[0], rise), footFrame(1, ph[1], rise)];
  const ay = (f[0].A.y + f[1].A.y) / 2, hx = o.hipx ?? 0;
  const pos = V3(TST.x + hx, ay + Math.sqrt(0.81 * 0.81 - hx * hx) + 0.03 - (o.bend ?? 0), TST.z + 0.03 - (o.lean ?? 0.02) * 0.5), U = V3(hx * 0.9, 1, -(o.lean ?? 0.02)).normalize(), F = V3(0, 0, -1);
  const B = frameOf(U, F), top = pos.clone().addScaledVector(B.Y, PD.torso);
  const SL = top.clone().addScaledVector(B.X, PD.shW).addScaledVector(B.Y, -0.035), SR = top.clone().addScaledVector(B.X, -PD.shW).addScaledVector(B.Y, -0.035);
  const sw = (k) => V3(0.01 * Math.sin(TT * 0.9 + k), 0, 0.01 * Math.cos(TT * 0.7 + k)) .multiplyScalar(o.swing ?? 0);
  const hangL = SL.clone().add(V3(-0.035, -0.535, 0.015)).add(sw(0)), hangR = SR.clone().add(V3(0.035, -0.535, 0.015)).add(sw(2));
  const hd = [{ Z: DOWN, Y: V3(-1, 0, 0.15) }, { Z: DOWN, Y: V3(1, 0, 0.15) }];
  let wR = hangR, hdR = hd[1], epR = V3(0.2, -0.3, 1);
  if (o.tip) { const Zh = V3(-0.38, 0.28, -0.88).normalize(), fr = frameOf(V3(0.5, 1, 0.1), Zh); const gl = gripChalk().tip; wR = o.tip.clone().addScaledVector(fr.Y.clone().cross(fr.Z), -gl.x).addScaledVector(fr.Y, -gl.y).addScaledVector(fr.Z, -gl.z);
    const k = clamp(o.arm ?? 0); if (k > 0) { const mid = wR.clone().lerp(hangR, 0.5).add(V3(0.03, 0, 0.06)); wR = k < 0.5 ? wR.clone().lerp(mid, k * 2) : mid.lerp(hangR, k * 2 - 1); }
    { const d = wR.clone().sub(SR), L = PD.uArm + PD.fArm - 0.006; if (d.length() > L) wR = SR.clone().addScaledVector(d.normalize(), L); }
    hdR = { Z: Zh.clone().lerp(DOWN, k).normalize(), Y: V3(0.5, 1, 0.1).lerp(V3(1, 0, 0.15), k).normalize() }; epR = V3(1, -1, 0.3).lerp(V3(0.2, -0.3, 1), k); }
  const hp = o.headTo ? { Y: UPV.clone().applyAxisAngle(V3(0, 0, 1), -(o.head?.roll ?? 0)), Z: o.headTo.clone().sub(top.clone().add(V3(0, 0.2, 0))).normalize() } : { pitch: o.head?.pitch ?? 0.2, yaw: 0, roll: o.head?.roll ?? 0 };
  poseP(T, { pos, U, F, head: hp, hands: [hangL, wR], hdir: [hd[0], hdR], epole: [V3(-0.2, -0.3, 1), epR], feet: [f[0].A, f[1].A], fdir: [{ Z: f[0].Z, Y: f[0].Y }, { Z: f[1].Z, Y: f[1].Y }],
    kpole: V3(0, 0.1, -1), eyeRed: o.eyeRed ?? ss(STOP, STOP + 0.6, TT), curl: [0.35, o.curl ?? 0.75], grip: !!o.tip && (o.curl ?? 0.75) > 0.5, breath: 0.4 * Math.sin(TT * 1.4), neck: { len: o.neckLen ?? 0.075 } });
  T.sway = o.hairSway ?? 0.4;
}
function chalkInHand(Wd) { const h = Wd.T.arm[1].hand, G = gripChalk(); h.updateMatrixWorld(true); const c = Wd.chalk; c.visible = true; c.position.copy(h.localToWorld(G.center.clone())); c.quaternion.copy(h.getWorldQuaternion(new THREE.Quaternion())).multiply(new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), G.D)); return c.position.clone(); }
// ---- the teacher on the ceiling. o: { c (torso centre on the ceiling), a (spine direction, horizontal), head (head centre), look (point she stares at), breath, roll }
function ceilPose(Wd, o) {
  const T = Wd.T, a = o.a.clone().normalize(), F = DOWN.clone(), pos = o.c.clone().addScaledVector(a, -0.24).setY(RM.h - 0.137), B = frameOf(a, F), top = pos.clone().addScaledVector(B.Y, PD.torso);
  const S = [top.clone().addScaledVector(B.X, PD.shW), top.clone().addScaledVector(B.X, -PD.shW)], t = TT;
  // arms spread flat, palms pressed to the boards, fingers splayed outward; the fingers creep a little
  const hands = S.map((sh, i) => { const sd = i ? -1 : 1; return sh.clone().addScaledVector(B.X, sd * (0.3 + 0.015 * Math.sin(t * 0.9 + i))).addScaledVector(a, 0.36 + 0.02 * Math.sin(t * 0.7 + i * 2)).setY(RM.h - 0.055); });
  const hdir = [0, 1].map((i) => { const sd = i ? -1 : 1; return { Z: B.X.clone().multiplyScalar(sd * 0.45).addScaledVector(a, 0.9).normalize(), Y: DOWN.clone() }; });
  const Hj = [pos.clone().addScaledVector(B.X, PD.hipW), pos.clone().addScaledVector(B.X, -PD.hipW)];
  const feet = Hj.map((h, i) => h.clone().addScaledVector(a, -0.8).addScaledVector(B.X, (i ? -1 : 1) * 0.05).setY(RM.h - 0.125));
  const fz = a.clone().multiplyScalar(-0.5).addScaledVector(DOWN, 0.86).normalize(), fdir = [{ Z: fz, Y: a.clone().negate() }, { Z: fz, Y: a.clone().negate() }];
  const look = o.look.clone().sub(o.head).normalize(), hY = DOWN.clone().addScaledVector(look, -DOWN.dot(look)).normalize().applyAxisAngle(look, o.roll ?? 0);
  const hb = o.head.clone().addScaledVector(hY, -0.075).addScaledVector(look, -0.055);
  poseP(T, { pos, U: a, F, head: { Y: hY, Z: look }, headPos: o.head, hands, hdir, epole: [B.X.clone().addScaledVector(DOWN, 0.25).addScaledVector(a, -0.3), B.X.clone().negate().addScaledVector(DOWN, 0.25).addScaledVector(a, -0.3)], feet, fdir, skirtFlat: 1, kpole: DOWN.clone(), curl: [-0.15 + 0.1 * Math.sin(t * 1.3), -0.15 + 0.1 * Math.sin(t * 1.1 + 2)], breath: o.breath ?? 0, mouth: o.mouth ?? 0.7,
    neck: { c1: top.clone().addScaledVector(a, o.k1 ?? 0.32).setY(RM.h - 0.14), c2: hb.clone().addScaledVector(hY, -(o.k2 ?? 0.3)) } });
  T.sway = o.sway ?? 0.6;
}

// ---- the board state and the chalk at a time
const LINE3 = [9.4, 12.8], LINE4 = [14.5, 19.2], STOP = 19.6, DROP = 21.2;
function boardState(t) {
  const n3 = SUMS[2].length, n4 = SUMS[3].length;
  const l3 = t < LINE3[0] ? 0 : t < LINE3[1] ? ((t - LINE3[0]) / (LINE3[1] - LINE3[0])) * n3 : n3;
  const l4 = t < LINE4[0] ? 0 : t < LINE4[1] ? ((t - LINE4[0]) / (LINE4[1] - LINE4[0])) * (n4 - 1) : t < STOP ? n4 - 1 + (t - LINE4[1]) / (STOP - LINE4[1]) : n4;
  const pre = t < 9 ? [SUMS[0].length, SUMS[1].length, n3, n4] : [SUMS[0].length, SUMS[1].length, Math.floor(l3 * 4) / 4, Math.floor(l4 * 4) / 4];
  return { lines: pre, erase: ss(55.1, 55.9, t), big: t < 55.9 ? 0 : clamp((t - 55.9) / 3.0) };
}
// the chalk tip while she writes (board px → world), with a little hand jitter
function writeTip(t) {
  let i = -1, n = 0; if (t >= LINE3[0] && t < LINE3[1] + 0.6) { i = 2; n = clamp((t - LINE3[0]) / (LINE3[1] - LINE3[0])) * SUMS[2].length; }
  else if (t >= LINE3[1] + 0.6 && t < LINE4[0]) { const k = ss(LINE3[1] + 0.6, LINE4[0], t); return boardPt(lerp(sumX(2, SUMS[2].length), SUMX + 10, k), lerp(SUMY0 + 2 * SUMDY - 14, SUMY0 + 3 * SUMDY - 14, k) - 30 * Math.sin(Math.PI * k), 0.004); }
  else { i = 3; n = t < LINE4[1] ? clamp((t - LINE4[0]) / (LINE4[1] - LINE4[0])) * (SUMS[3].length - 1) : SUMS[3].length - 1 + clamp((t - LINE4[1]) / (STOP - LINE4[1])); }
  const writing = t < STOP ? 1 : 0, px = sumX(i, Math.floor(n * 4) / 4) + 4, py = SUMY0 + i * SUMDY - 14 + writing * (9 * Math.sin(t * 26) + 4 * Math.sin(t * 41));
  return boardPt(px, py, 0.002);
}
function chalkFall(Wd, p0, t) {   // dropped at DROP: falls along the board face, hits the platform, breaks; a piece skids away
  const c = Wd.chalk, c2 = Wd.chalk2, dt = t - DROP, h0 = p0.y - (PLAT_Y + 0.0075), tf = Math.sqrt((2 * h0) / 9.8);
  if (dt < tf) { c.position.set(p0.x, p0.y - 4.9 * dt * dt, p0.z + 0.3 * dt); c.rotation.set(dt * 9, 0, dt * 4); c.visible = true; c2.visible = false; return; }
  const u = dt - tf, bnc = Math.max(0, 0.05 * Math.sin(Math.min(u, 0.2) / 0.2 * Math.PI)); c.visible = true; c.position.set(p0.x + 0.03 * ss(0, 0.4, u), PLAT_Y + 0.0075 + bnc, p0.z + 0.3 * tf + 0.05 * ss(0, 0.4, u)); c.rotation.set(Math.PI / 2, 0.4 + 0.5 * ss(0, 0.4, u), 0);
  c2.visible = true; c2.position.set(p0.x - 0.06 * ss(0, 0.6, u), PLAT_Y + 0.0075 + Math.max(0, 0.08 * Math.sin(Math.min(u, 0.3) / 0.3 * Math.PI)), p0.z + 0.3 * tf + 0.16 * ss(0, 0.6, u)); c2.rotation.set(Math.PI / 2, -0.8 * ss(0, 0.6, u), 0);
}

function resetWorld(Wd) {
  Wd.kids.forEach((k) => { k.hidden = false; k.g.visible = true; }); Wd.T.g.visible = true; Wd.chalk.visible = false; Wd.chalk2.visible = false; Wd.dust.visible = false;
  Wd.leaves.visible = Wd.leavesP.visible = Wd.papers.visible = Wd.sag.visible = false; Wd.glass.forEach((q) => (q.m.visible = true)); Wd.T.hairLen = 1;
  Wd.desks.forEach((q) => { q.d.position.copy(q.R0.dp); q.d.rotation.set(0, 0, 0); q.c.position.copy(q.R0.cp); q.c.rotation.set(0, 0, 0); });
  Wd.shoes.forEach((s, i) => { s.position.copy(SHOE[i]); s.rotation.set(0, Math.PI, 0); });
  Wd.stoveGlow.visible = true;
}
function render3D(preset, pos, tgt, o = {}) {
  const Wd = world(), { r, cv } = rend();
  setLight(Wd, Object.assign({}, LIGHT[preset], o.light || {}));
  animWorld(Wd, TT, o);
  drawBoard(Wd, o.board || boardState(TT));
  if (window.DBG_CAM) { pos = window.DBG_CAM[0]; tgt = window.DBG_CAM[1]; o.fov = window.DBG_CAM[2] ?? o.fov; }   // debug views only (never set in the piece)
  if (o.spot) { Wd.spot.position.copy(o.spot[0]); Wd.spot.intensity = o.spot[1]; } else Wd.spot.intensity = 0;
  Wd.cam.fov = o.fov ?? 50; Wd.cam.position.copy(pos); if (o.shake) Wd.cam.position.add(shake(TT, o.shake)); Wd.cam.up.set(0, 1, 0); Wd.cam.lookAt(tgt); if (o.roll) Wd.cam.rotateZ(o.roll); Wd.cam.updateProjectionMatrix(); Wd.cam.updateMatrixWorld(true);
  updateHair(Wd.T, Wd.cam);
  if (o.dust) { Wd.dust.visible = true; const P = Wd.dust.geometry.attributes.position, c = o.dust; Wd.dustP.forEach((q, i) => { const y = RM.h - 0.05 - mod(q.ph * 3 + TT * q.v, 2.6); P.setXYZ(i, c.x + q.x + 0.05 * Math.sin(TT + i), y, c.z + q.z); }); P.needsUpdate = true; }
  r.render(Wd.scene, Wd.cam);
  ykBlit(cv, { vis: o.vis ?? 1 });
}

// ---- the shots
function shotOpen() {   // HOOK: crawling flat on the ceiling over the board; the long neck lets the head down; it turns and grins at us
  const Wd = world(), t = TT, t2 = T2(), dn = easeOut(ss(0.0, 1.9, t)), tw = easeOut(ss(0.9, 1.25, t2)), cam = V3(lerp(0.3, 0.24, ss(0, 4.5, t)), lerp(1.6, 1.64, ss(0, 4.5, t)), lerp(-2.2, -2.32, ss(0, 4.5, t)));
  poseKids(Wd, { frozen: 1 });
  const head = V3(-0.18 + 0.025 * Math.sin(t * 0.7) + (t2 > 2.6 && t2 < 2.85 ? 0.05 : 0), lerp(2.95, 2.4, dn) + 0.012 * Math.sin(t * 2.2), lerp(-3.15, -2.98, dn)), look = cam.clone().add(V3(0.25 * (1 - tw), -0.3 * (1 - tw), 0));
  ceilPose(Wd, { c: V3(-0.2, 0, -3.4), a: V3(0, 0, 1), head, look, roll: Math.PI - 0.16 * Math.sin(t * 0.9) - (t2 > 2.6 && t2 < 2.85 ? 0.14 : 0), breath: Math.sin(t * 2.2), mouth: 0.35 + 0.65 * ss(1.3, 2.2, t), k1: lerp(0.12, 0.24, dn), k2: lerp(0.08, 0.32, dn) });
  render3D('dim', cam, V3(-0.1, 2.42, -3.15), { vis: fadeWin(0, 4.5, 0.35), fov: 54, dust: V3(-0.2, 0, -3.1), flicker: 1, flickerBulb: 4 });
}
const printSrc = () => asset('print.jpg');
function shotCard() {
  fillAll('#020306'); ykStars(ss(4.5, 5.2, TT) * (1 - ss(8.3, 8.9, TT)));
  const kIn = TT < 8.3 ? ss(4.8, 5.6, TT) : 1 - ss(8.3, 8.9, TT), kN = TT < 8.3 ? ss(5.5, 6.3, TT) : 1 - ss(8.3, 8.7, TT);
  ykCard(printSrc(), 'The Floating Teacher', kIn, kN, { y: 320, w: 720, h: 540, pw: 90 });
}
function teacherWriting(Wd, t) {
  const tip = writeTip(t), hx = clamp((tip.x - (TST.x + 0.19)) * 0.6, -0.27, 0.34);
  teacherStand(Wd, { tip, hipx: hx, headTo: tip, head: { roll: 0 }, swing: 0 }); chalkInHand(Wd);
}
function shotClass() {   // the classroom in the rain, a high corner; then behind my mother in the back row
  const Wd = world(), t = TT; poseKids(Wd); teacherWriting(Wd, t);
  if (t < 13.5) { const k = (t - 9) / 4.5; render3D('rain', V3(lerp(4.55, 4.45, k), 2.95, lerp(5.9, 5.75, k)), V3(lerp(-0.6, -0.5, k), 1.05, -2.6), { vis: ss(9, 9.5, t), fov: 60 }); }
  else { const k = (t - 13.5) / 4.5; render3D('rain', V3(lerp(-0.12, -0.18, k), 1.5, lerp(4.15, 3.95, k)), V3(-0.25, 1.05, -4.2), { fov: 48 }); }
}
function shotStop() {   // close on the hand: the number stops; the chalk falls. Then from the class: she does not turn
  const Wd = world(), t = TT, t2 = T2(), cp = stopChalkPoint(Wd); poseKids(Wd);
  const tip = writeTip(Math.min(t, STOP)), hx = clamp((tip.x - (TST.x + 0.19)) * 0.6, -0.27, 0.34), limp = ss(23.5, 25.2, t2), roll = 0.42 * ss(24.2, 26.8, t);
  teacherStand(Wd, { tip, hipx: hx * (1 - ss(23, 25, t)), arm: limp, curl: t < DROP ? 0.75 : lerp(0.75, 0.1, ss(DROP, DROP + 0.3, t)), headTo: tip.clone().lerp(V3(TST.x, 1.75, BOARD.z), ss(22, 23, t)), head: { roll: roll * 1.8 }, swing: limp, neckLen: 0.075 + 0.06 * ss(24.5, 26.8, t) });
  if (t < DROP) chalkInHand(Wd); else chalkFall(Wd, cp, t);
  if (t < 22.5) { const d = ss(20.9, 21.9, t), Wr = Wd.T.arm[1].W.clone(), tp = writeTip(Math.min(t, STOP)), mid = Wr.clone().lerp(tp, 0.55), n = V3(0.85, -0.5, 0.6).normalize();
    const cam = mid.clone().addScaledVector(n, 0.5 + 0.15 * d); cam.z = Math.min(cam.z, -3.6); render3D('rain', cam, mid.clone().lerp(V3(0.42, 0.22, -4.36), d).add(V3(0, -0.07 * (1 - d), 0)), { fov: 46 }); }
  else { const k = (t - 22.5) / 4.5; render3D('rain', V3(lerp(1.35, 1.2, k), lerp(1.2, 1.28, k), lerp(-2.45, -2.75, k)), V3(lerp(-0.35, -0.4, k), lerp(1.0, 1.2, k), -4.25), { fov: 54, flicker: ss(23, 24, t), flickerBulb: 4 }); }
}
// the chalk point when she stopped (she was holding it at STOP): computed once so the fall starts where the hand was
function stopChalkPoint(Wd) {
  if (Wd._stopChalk) return Wd._stopChalk; const keep = TT; TT = DROP - 0.01; const tip = writeTip(STOP), hx = clamp((tip.x - (TST.x + 0.19)) * 0.6, -0.27, 0.34);
  teacherStand(Wd, { tip, hipx: hx, headTo: tip }); Wd._stopChalk = chalkInHand(Wd); TT = keep; return Wd._stopChalk;
}
function shotRise() {   // her heels leave the floor; she rises out of her shoes. Then wide: she floats, the shoes stay
  const Wd = world(), t = TT, t2 = T2(), cp = stopChalkPoint(Wd); poseKids(Wd, { frozen: 1 });
  const rise = 0.95 * ss(30.0, 36.5, t) ** 1.3, ft = (d) => 0.5 * ss(28.0 + d, 29.4 + d, t) + 0.75 * ss(29.9 + d, 31.6 + d, t) + 0.06 * Math.sin(t * 1.7 + d * 9) * ss(30.5, 32, t);
  teacherStand(Wd, { phi: [ft(0), ft(0.22)], rise, bend: 0.018 + 0.012 * Math.sin(t * 1.1), hipx: 0.025 * Math.sin(t * 0.8) * ss(28, 30, t), arm: 1, head: { roll: 0.75, pitch: 0.1 }, swing: 1, lean: 0.02 + 0.01 * Math.sin(t * 0.6), neckLen: 0.13 });
  chalkFall(Wd, cp, 40);
  if (t < 31.5) { const k = (t - 27) / 4.5; render3D('rain', V3(lerp(0.12, 0.08, k), 0.3, lerp(-3.48, -3.52, k)), V3(-0.43, lerp(0.13, 0.3, ss(29.8, 31.5, t)), -4.23), { fov: 44, spot: [V3(0.1, 0.55, -3.7), 1.6] }); }
  else { const k = (t - 31.5) / 4.5; render3D('rain', V3(lerp(1.55, 1.5, k), lerp(0.95, 1.0, k), lerp(-2.75, -2.85, k)), V3(-0.42, lerp(1.0, 1.3, k), -4.2), { fov: 56, flicker: 0.6, flickerBulb: 1 }); }
}
function shotStill() {   // nobody moves; my mother stares at her desk; the clock stops; black
  const Wd = world(), t = TT, cp = stopChalkPoint(Wd); poseKids(Wd, { frozen: 1 }); Wd.T.g.visible = false; chalkFall(Wd, cp, 40);
  const M = Wd.mother; poseKid(M, { pitch: 0.62 + 0.012 * Math.sin(t * 19), roll: 0.01 * Math.sin(t * 23 + 1), flat: true, breath: 1.6, lean: 0.06 });
  if (t < 40.5) { const k = (t - 36) / 4.5; render3D('rain', V3(lerp(-0.42, -0.44, k), 0.9, lerp(2.28, 2.36, k)), V3(-0.5, 0.86, 3.25), { fov: 48 }); }
  else { const k = (t - 40.5) / 4.5; render3D('rain', V3(lerp(3.0, 3.04, k), 2.3, lerp(-2.75, -2.95, k)), V3(3.2, 2.12, -4.5), { fov: 52, clockStop: 42.6, wallLight: 1.5, vis: 1 - ss(44.3, 45.0, t) }); }
}
function shotReveal() {   // low angle: pressed to the ceiling, her face upside down, staring down at the class
  const Wd = world(), t = TT, t2 = T2(), cp = stopChalkPoint(Wd); poseKids(Wd, { frozen: 1 }); chalkFall(Wd, cp, 40);
  if (t < 50.5) { const cam = V3(1.45, lerp(1.1, 1.14, ss(45.6, 50.5, t)), lerp(1.75, 1.55, ss(45.6, 50.5, t)));
    const head = V3(1.02 + 0.03 * Math.sin(t * 0.8), 2.02 + 0.03 * Math.sin(t * 1.1), 0.5);
    ceilPose(Wd, { c: V3(0.2, 0, 0.2), a: V3(1, 0, 0.05), head, look: cam.clone().add(V3(0, 0.05, 0)), roll: 2.85 + 0.08 * Math.sin(t * 0.6), sway: 0.15, breath: Math.sin(t * 2.6), k1: 0.3, k2: 0.3 });
    render3D('dim', cam, V3(1.05, 1.95, 0.5), { fov: 52, shake: t < 46.3 ? 0.03 * (1 - ss(45.6, 46.3, t)) : 0 }); }
  else { const k = (t - 50.5) / 4.5, cam = V3(lerp(1.38, 1.32, k), lerp(1.62, 1.66, k), lerp(1.5, 1.32, k));
    ceilPose(Wd, { c: V3(0.2, 0, 0.2), a: V3(1, 0, 0.05), head: V3(1.02 + 0.02 * Math.sin(t * 0.8), 2.08 + 0.02 * Math.sin(t * 1.1), 0.5), look: cam.clone(), roll: 2.3 + 0.08 * Math.sin(t * 0.6) + 0.35 * ss(52.5, 52.75, t2), sway: 0.2, breath: Math.sin(t * 2.6), mouth: 0.72 + 0.28 * Math.max(0, Math.sin(t * 2.6)), k1: 0.3, k2: 0.3 });
    render3D('dim', cam, V3(1.05, 1.9, 0.5), { fov: 50, flicker: 0.7, flickerBulb: 3 }); }
}
function shotBoard() {   // the board writes DON'T LOOK UP by itself; a boy by the window looks up; then his chair is empty
  const Wd = world(), t = TT, t2 = T2(), cp = stopChalkPoint(Wd); poseKids(Wd, { frozen: 1 }); chalkFall(Wd, cp, 40);
  if (t < 59.5) { Wd.T.g.visible = false; drawBoard(Wd, boardState(t)); const be = Wd.board.bigEnd; if (be && t > 55.9 && t < 59.0) { const p = boardPt(be[0], be[1] + 8 * Math.sin(t * 24), 0.035); Wd.chalk.visible = true; Wd.chalk.position.copy(p); Wd.chalk.rotation.set(0.4, 0, 0.6 + 0.2 * Math.sin(t * 9)); }
    const k = (t - 55) / 4.5; render3D('dim', V3(-0.26, 1.4, lerp(0.05, -0.25, k)), V3(-0.26, 1.32, BOARD.z), { fov: 56 }); return; }
  const B0 = Wd.boy, empty = t >= 62.0;
  if (empty) { B0.hidden = true; B0.g.visible = false; const q = Wd.desks.find((d) => d.c === B0.chair); q.c.position.z += 0.16; q.c.rotation.y = 0.18; Wd.T.g.visible = false; }
  else { const up = ss(59.9, 61.2, t2); poseKid(B0, { pitch: lerp(B0.bow, -0.95, up), lean: -0.06 * up, breath: 1.4, yaw: lerp(0, 0.1, up), eyesWide: up });
    ceilPose(Wd, { c: V3(-2.6, 0, 0.3), a: V3(-1, 0, 0.1), head: V3(-3.28, lerp(2.85, 2.62, ss(60.6, 62, t)), 0.5), look: B0.H.position.clone(), roll: 0.2, breath: Math.sin(t * 2.6), mouth: 0.6, k1: 0.2, k2: 0.2 }); }
  const k = (t - 59.5) / 4.5; if (!empty) { Wd.T.hairLen = 1.15; render3D('dim', V3(-3.6, lerp(2.08, 2.02, k), lerp(0.66, 0.64, k)), V3(-3.5, 0.95, 0.98), { fov: 56, spot: [V3(-3.3, 1.9, 0.5), 1.2] }); }
  else render3D('dim', V3(-2.85, lerp(1.48, 1.44, k), lerp(-0.05, 0.03, k)), V3(-3.5, 0.66, 0.86), { fov: 54 });
}
function shotToday() {   // today: the abandoned school; dust, leaves, broken panes; her shoes under the blackboard
  const Wd = world(), t = TT; Wd.kids.forEach((k) => { k.hidden = true; k.g.visible = false; }); Wd.T.g.visible = false; Wd.stoveGlow.visible = false;
  Wd.leaves.visible = Wd.leavesP.visible = Wd.papers.visible = Wd.sag.visible = true; Wd.glass.forEach((q) => (q.m.visible = !((q.wi === 1 && q.r === 2 && q.c === 1) || (q.wi === 2 && q.r === 1 && q.c === 2) || (q.wi === 2 && q.r === 2 && q.c === 3) || (q.wi === 3 && q.r === 0))));
  Wd.desks.forEach((q, i) => { const R = RNG('mess', i), keepAisle = Math.abs(q.x) < 1; q.d.position.set(q.x + R.n(keepAisle ? 0.06 : 0.25) + (keepAisle ? Math.sign(q.x) * 0.05 : 0), 0, q.z + R.n(0.2)); q.d.rotation.y = R.n(keepAisle ? 0.1 : 0.4);
    q.c.position.set(q.d.position.x + R.n(0.15), 0, q.z + CHAIR_DZ + R.r(0.0, 0.3)); q.c.rotation.y = R.n(0.6); if (R.f() < 0.22 && !keepAisle) { q.c.rotation.x = Math.PI / 2; q.c.position.y = 0.2; q.c.position.z += 0.25; } });
  const k = (t - 64) / 7;
  render3D('today', V3(lerp(0.3, -0.12, k), lerp(1.55, 0.95, k), lerp(-1.5, -3.15, k)), V3(lerp(-0.42, -0.45, k), lerp(0.32, 0.12, k), -4.3), { fov: 50, vis: ss(64, 64.6, t) * (1 - ss(70, 71, t)), bulb: 0, motes: 0.85, board: { lines: [16, 16, 15, 16], erase: 1, big: 1, ghost: 0.22 } });
}

const PARA = [
  ['My mother still won\'t look at the ceiling of any room. She says it is because of her teacher.', 0.4, 8.85],
  ['Rainy afternoon, 1987, a school in the mountains. Math, last period.', 9.5, 17.75],
  ['The teacher stopped writing in the middle of a number. The chalk fell, and she did not pick it up.', 18.4, 26.75],
  ['Her heels left the floor. Then she rose out of her shoes.', 27.4, 35.75],
  ['Nobody moved. My mother stared at her desk and counted her breaths.', 36.4, 44.6],
  ['Above them, something was breathing, very close to the ceiling.', 46.3, 54.75],
  ['A boy by the window looked up. When the bell rang, his chair was empty.', 55.4, 63.75],
  ['The school closed that winter. Her shoes are still under the blackboard.', 64.6, 70.6],
];
function sceneTale() {
  const t = TT; fillAll('#020306'); resetWorld(world());
  if (window.DBG_SHOT) window.DBG_SHOT(); else   // debug views only (never set in the piece)
  if (t < 4.5) shotOpen(); else if (t < 9) shotCard(); else if (t < 18) shotClass(); else if (t < 27) shotStop(); else if (t < 36) shotRise();
  else if (t < 45.6) { if (t < 45.0) shotStill(); } else if (t < 55) shotReveal(); else if (t < 64) shotBoard(); else shotToday();
  PARA.forEach(([s, a, b]) => ykPara(s, a, b, { cy: 1300 }));
  if (t >= 66.2) { const f = () => ykBadge(asset('kodama.jpg'), 'kodamashorts', CX, 290, ss(66.2, 66.9, t) * (1 - ss(70.4, 71, t))); if (DEFER) DEFER.push(f); else f(); }
}
