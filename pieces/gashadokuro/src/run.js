// =====================================================================
//  RUN — the shots. The girl walks on the path (feet from the ground function, the chōchin in her left fist); the field
//  bones are posed per frame (rest / tremble / roll); the Gashadokuro is placed by where its head must be.
// =====================================================================
const easeOut = (x) => 1 - (1 - x) ** 3;
const DOWN = V3(0, -1, 0), UPV = V3(0, 1, 0);
const qYZ = (Y, Z) => { const f = frameOf(Y, Z); return qBasis(f.Y.clone().cross(f.Z), f.Y, f.Z); };
const yzOf = (q) => ({ Y: V3(0, 1, 0).applyQuaternion(q), Z: V3(0, 0, 1).applyQuaternion(q) });
const slerpYZ = (a, b, k) => yzOf(qYZ(a.Y, a.Z).slerp(qYZ(b.Y, b.Z), clamp(k)));
function headRel(B, pitch, yaw, roll) { const q = qBasis(B.X, B.Y, B.Z).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ'))); return yzOf(q); }
function lookYZ(from, to, roll = 0) { const Z = to.clone().sub(from).normalize(), Y = UPV.clone().addScaledVector(Z, -Z.y).normalize().applyAxisAngle(Z, roll); return { Y, Z }; }
const PP = (z, dx = 0) => { const x = XC(z) + dx; return V3(x, groundAt(x, z), z); };   // a point on the path
const UPHILL = (z) => V3(XC(z - 0.5) - XC(z + 0.5), 0, -1).normalize();

function animWorld(Wd, t, o = {}) {
  WIND.value = t; const cam = Wd.cam.position;
  Wd.sky.position.copy(cam); Wd.ridges.forEach((m) => m.position.set(cam.x, cam.y + m.userData.y - 30 + (o.ridgeY ?? 0), cam.z));
  const md = (o.moonDir || V3(-0.3, 0.45, -1)).clone().normalize(); Wd.moonDisk.position.copy(cam).addScaledVector(md, 500); Wd.moonDisk.lookAt(cam); Wd.moonDisk.scale.setScalar(o.moonS ?? 30); Wd.moonHalo.position.copy(Wd.moonDisk.position).addScaledVector(md, 1); Wd.moonHalo.scale.setScalar((o.moonS ?? 30) * 5);
  Wd.mist.forEach((s) => { const u = s.userData; s.position.x = u.x + 1.5 * Math.sin(t * 0.07 + u.ph); const dc = s.position.distanceTo(cam) - s.scale.x * 0.5; s.material.opacity = (0.3 + 0.15 * Math.sin(t * 0.3 + u.ph)) * (o.mist ?? 1) * ss(1.5, 6.0, dc); s.visible = s.material.opacity > 0.003; });
  { const c = o.motes; Wd.motes.visible = !!c; if (c) { const P = Wd.motes.geometry.attributes.position; Wd.moteP.forEach((q, i) => { const r = c.r ?? 1.2; P.setXYZ(i, c.p.x + q.x * r + 0.15 * Math.sin(t * q.v * 2 + q.ph), c.p.y + q.y * r * 0.7 + 0.1 * Math.sin(t * q.v * 3 + q.ph * 2), c.p.z + q.z * r + 0.15 * Math.cos(t * q.v * 1.7 + q.ph)); }); P.needsUpdate = true; Wd.motes.material.opacity = c.a ?? 0.8; } }
  { const k = o.snow ?? 1, P = Wd.snow.geometry.attributes.position, B = o.snowBox ?? 9; Wd.snow.visible = k > 0; Wd.snow.material.opacity = 0.85 * k;
    Wd.snowP.forEach((q, i) => { const y = mod(q.y - t * 0.09 * q.v, 1); P.setXYZ(i, cam.x + q.x * B + 0.3 * Math.sin(t * 0.8 + q.ph), cam.y - B * 0.5 + y * B, cam.z + q.z * B + 0.3 * Math.cos(t * 0.6 + q.ph)); }); P.needsUpdate = true; }
}
function lantern(Wd, k = 1) {   // the chōchin's light: gentle flicker (fast flicker pops whole toon bands)
  const L = Wd.lant, on = k > 0.02, fl = k * (0.95 + 0.03 * Math.sin(TT * 5.3) + 0.02 * Math.sin(TT * 8.9)), c = L.body.position;
  Wd.lanL.position.copy(c); Wd.lanL.intensity = 2.6 * fl; Wd.lanGlow.visible = on; Wd.lanGlow.position.copy(c); Wd.lanGlow.scale.setScalar(0.75 * k); Wd.lanGlow.material.opacity = 0.7 * k;
  Wd.paperT.emissiveIntensity = 1.0 * fl; Wd.paperT.emissive.set(on ? '#a0602a' : '#000000'); Wd.paperT.color.set(on ? '#ffffff' : '#5a5048');
}
function lightsOff(Wd) { Wd.key.color.set('#b9cbc6'); [Wd.lanL, Wd.key, Wd.fill, Wd.rim].forEach((l) => (l.intensity = 0)); Wd.lanGlow.visible = false; }
function resetWorld(Wd) {
  const G = Wd.girl, L = Wd.lant; G.g.visible = false; [L.g, L.body, L.cord].forEach((m) => (m.visible = false)); Wd.gasha.g.visible = false; Wd.hand.g.visible = false; Wd.gasha.comb.visible = false;
  poseCrows(Wd, TT, false); hideHero(Wd); Wd.mats.forEach((M) => (M.m.visible = true)); Wd.cedarIM.forEach((m) => (m.visible = true)); Wd.cedarBr.visible = true; lightsOff(Wd);
}
function render3D(preset, pos, tgt, o = {}) {
  const Wd = world(), { r, cv } = rend();
  setLight(Wd, Object.assign({}, LIGHT[preset], o.light || {}));
  if (window.DBG_CAM) { pos = window.DBG_CAM[0]; tgt = window.DBG_CAM[1]; o.fov = window.DBG_CAM[2] ?? o.fov; }   // debug views only (never set in the piece)
  Wd.cam.fov = o.fov ?? 50; Wd.cam.position.copy(pos); Wd.cam.up.set(0, 1, 0); Wd.cam.lookAt(tgt); if (o.roll) Wd.cam.rotateZ(o.roll); Wd.cam.updateProjectionMatrix(); Wd.cam.updateMatrixWorld(true);
  animWorld(Wd, TT, o);
  { const c = o.shadowAt || tgt, md = (o.moonDir || V3(-0.3, 0.45, -1)).clone().normalize(); Wd.moon.position.copy(c).addScaledVector(md, 60); Wd.moon.target.position.copy(c); Wd.moon.target.updateMatrixWorld(); }
  if (o.rim) { Wd.rim.intensity = o.rim; const c = o.shadowAt || tgt, rd = (o.rimDir || o.moonDir || V3(0, 0.5, -1)).clone().normalize(); Wd.rim.position.copy(c).addScaledVector(rd, 60); Wd.rim.target.position.copy(c); Wd.rim.target.updateMatrixWorld(); }
  if (Wd.girl.g.visible) Wd.girl.g.updateMatrixWorld(true);
  r.render(Wd.scene, Wd.cam);
  ykBlit(cv, { vis: o.vis ?? 1 });
}

// ---------------------------------------------------------------------
//  the girl walking on the path: o: { O (start on the path), D (dir), s (metres walked), pitch (head down), look, lant (0..1), plant }
// ---------------------------------------------------------------------
function walkGirl(Wd, o) {
  const P = Wd.girl, pd = P.pd, F = o.D.clone().setY(0).normalize(), Lx = UPV.clone().cross(F), s = o.s, L = 0.42, ph = s / L;
  const feet = [], fdir = [];
  [0, 1].forEach((j) => { const oj = j * 0.5, u = ph - oj, n = Math.floor(u), f = u - n, side = j === 0 ? 1 : -1; let sp, lift = 0, pit = 0;
    if (f < 0.38) { const k = ss(0, 1, f / 0.38); sp = lerp((n - 0.32 + oj) * L, (n + 0.68 + oj) * L, k); lift = 0.06 * Math.sin(Math.PI * k); pit = 0.3 * Math.sin(Math.PI * k) * (1 - 2 * k); } else sp = (n + 0.68 + oj) * L;
    if (o.plant) sp = o.plant[j], lift = 0, pit = 0;
    const g = o.O.clone().addScaledVector(F, sp).addScaledVector(Lx, side * 0.075), gy = groundAt(g.x, g.z); feet.push(g.setY(gy + pd.ank + lift)); fdir.push({ Z: F.clone().applyAxisAngle(Lx, pit), Y: UPV.clone().applyAxisAngle(Lx, pit) }); });
  const mid = feet[0].clone().add(feet[1]).multiplyScalar(0.5), bob = o.plant ? 0 : 0.012 * Math.cos(TAU * 2 * ph), sway = o.plant ? 0 : 0.015 * Math.sin(TAU * ph);
  const lean = (o.lean ?? 0.1), U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)).normalize();
  const pos = o.O.clone().addScaledVector(F, o.plant ? (o.plant[0] + o.plant[1]) / 2 : s).addScaledVector(Lx, sway).setY(mid.y - pd.ank + (pd.thigh + pd.shin) * 0.955 + bob);
  const B = frameOf(U, F), top = pos.clone().addScaledVector(B.Y, pd.torso), R = B.X.clone().negate();
  const SL = top.clone().addScaledVector(B.X, pd.shW), SR = top.clone().addScaledVector(R, pd.shW), swing = o.plant ? 0 : Math.sin(TAU * ph) * 0.12;
  const hL = SL.clone().addScaledVector(DOWN, 0.27).addScaledVector(F, 0.2).addScaledVector(B.X, -0.02), hdL = { Z: DOWN.clone().addScaledVector(F, 0.1).normalize(), Y: B.X.clone() };
  const hR = o.handR || SR.clone().addScaledVector(DOWN, 0.36).addScaledVector(F, -swing + 0.04).addScaledVector(R, 0.04);
  poseP(P, { pos, U, F, head: o.head || headRel(B, o.pitch ?? 0.1, o.look ?? 0, 0), hands: [hL, hR], hdir: [hdL, o.hdR || { Z: DOWN.clone().addScaledVector(F, 0.15), Y: R.clone() }],
    epole: [B.X.clone().multiplyScalar(0.5).addScaledVector(DOWN, 0.6), R.clone().multiplyScalar(0.5).addScaledVector(F, -0.5).addScaledVector(DOWN, 0.4)], feet, fdir, kpole: F.clone().addScaledVector(UPV, 0.2), curl: [0, o.curlR ?? 0.45], grip: [true, false], breath: Math.sin(TT * 2.6), skirtLen: 0.7, skirtW: 1.0 });
  holdChochin(Wd, o.lant ?? 1, F); return { P, B, top, pos, F };
}
function holdChochin(Wd, k, F) {
  const P = Wd.girl, L = Wd.lant; [L.g, L.body, L.cord].forEach((m) => (m.visible = true)); holdProp(P, 0, L.g);
  const tip = L.g.localToWorld(L.tip.clone()), sw = V3(0.025 * Math.sin(TT * 2.6), 0, 0.025 * Math.cos(TT * 2.1)), c = tip.clone().add(V3(0, -0.2, 0)).add(sw);
  L.body.position.copy(c); L.body.rotation.set(sw.z * 2, 0, -sw.x * 2); between(L.cord, tip, c.clone().add(V3(0, 0.12, 0)), 0.003); lantern(Wd, k);
}

// ---------------------------------------------------------------------
//  the Gashadokuro: place the root so the head centre lands on H, facing yaw, pitched forward
// ---------------------------------------------------------------------
function placeGasha(Wd, H, yaw, pitch, o = {}) {
  const G = Wd.gasha; G.g.visible = true; G.g.rotation.set(pitch, yaw, o.roll ?? 0, 'YXZ'); G.g.updateMatrixWorld(true);
  const off = GK.head.clone().applyQuaternion(G.g.quaternion); G.g.position.copy(H).sub(off);
  G.head.rotation.set(o.hp ?? 0, o.hy ?? 0, o.hr ?? 0); G.jaw.rotation.x = o.jaw ?? 0.05;
  (G.arms || []).forEach((A, i) => { const p = (window.ARMP && window.ARMP[i]) || (o.arms && o.arms[i]) || {}; A.ua.rotation.set(p.ua ? p.ua[0] : A.ua0.x, p.ua ? p.ua[1] : 0, p.ua ? p.ua[2] : A.ua0.z); A.el.rotation.set(p.el ?? -0.4, p.ely ?? 0, 0);
    A.wr.rotation.set(p.wr ? p.wr[0] : 0.2, p.wr ? p.wr[1] : 0, p.wr ? p.wr[2] : 0); const c = p.curl ?? 0.45; A.hand.f.forEach((segs) => { segs[0].rotation.x = c * 0.8; segs[1].rotation.x = c * 1.1; segs[2].rotation.x = c * 0.9; }); });
  G.glints.forEach((g, gi) => g.material.color.set(gi === 0 ? ((o.glint ?? 0.5) > 0.6 ? '#b8281a' : '#5a1810') : (o.glint ?? 0.5) > 0.6 ? '#9aa498' : '#3a3a30')); G.g.updateMatrixWorld(true); return G;
}
const chatter = (t, k = 1) => k * (0.06 + 0.07 * Math.max(0, Math.sin(t * 19)) + 0.04 * Math.max(0, Math.sin(t * 31 + 1)));
// the giant hand creeping on its fingertips: o: { p (wrist ground point), dir, s (distance crept), h (wrist height) }
function poseHand(Wd, o) {
  const H = Wd.hand; H.g.visible = true; const dir = o.dir.clone().setY(0).normalize(), yaw = Math.atan2(dir.x, dir.z);
  H.g.rotation.set(o.pitch ?? 0.55, yaw, o.roll ?? 0, 'YXZ'); H.g.position.copy(o.p).setY(o.p.y + (o.h ?? 2.2));
  const ph = o.s / 1.1; H.f.forEach((segs, i) => { const lift = Math.max(0, Math.sin(ph * TAU + i * 1.7)) * (i < 4 ? 1 : 0.4);
    segs[0].rotation.x = 0.35 - 0.35 * lift; segs[1].rotation.x = 0.7 + 0.25 * lift; segs[2].rotation.x = 0.55 + 0.2 * lift; });
  H.g.updateMatrixWorld(true);
  let gap = 1e9; H.f.forEach((s, i) => { const tp = handTip(H, i); gap = Math.min(gap, tp.y - groundAt(tp.x, tp.z)); });
  H.g.position.y -= gap - 0.03; H.g.updateMatrixWorld(true); return H;
}

// ---------------------------------------------------------------------
//  the shots
// ---------------------------------------------------------------------
function shotHook() {   // the giant skull rises over the cedar ridge in the fog, jaw chattering; a tiny lantern on the path below
  const Wd = world(), t = TT, rise = easeOut(ss(0, 2.2, t));
  const gz = -27, w = walkGirl(Wd, { O: PP(gz + 1.2), D: UPHILL(gz), s: 0.42 * t, pitch: 0.05 });
  const H = GASHA_AT.clone().setY(GASHA_AT.y + lerp(13, 19, rise)).add(V3(0, 0, 4)); placeGasha(Wd, H, Math.atan2(-H.x, 30 - H.z) + (window.HKY ?? 0.3), window.HKP ?? 0.55, { arms: HOOK_ARMS, jaw: chatter(t), hp: 0.3 + 0.05 * Math.sin(t * 0.8), hr: 0.08 * Math.sin(t * 0.6), glint: ss(1.2, 1.6, t) });
  const cam = PP(4).add(V3(0.4, 1.5, 0)), tg = H.clone().add(V3(0, -9.5, 0));
  Wd.key.color.set('#b9cbc6'); Wd.key.position.copy(H.clone().add(V3(-25, 15, 30))); Wd.key.target.position.copy(H); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = 1.6; Wd.key.angle = 0.2; Wd.key.penumbra = 0.7;
  render3D('night', cam, tg, { fov: 24, vis: 1 - ss(4.15, 4.5, t), moonDir: H.clone().sub(cam).setY(0).normalize().setY(0.42).applyAxisAngle(UPV, 0.06), moonS: 46, rim: 2.2, rimDir: H.clone().sub(cam).setY(0).normalize().setY(0.35), light: { fog: '#2a4a4e', fn: 30, ff: 260, hemI: 0.9, hemG: '#6a5a44' }, mist: 1.4, shadowAt: w.pos, snowBox: 12 });
}
const HOOK_ARMS = [{ ua: [0.25, -0.6, 0], el: 1.6, ely: 0.8, wr: [0.7, 0, 0], curl: 1.0 }, { ua: [0.45, 0.3, 0], el: -1.0, wr: [0.3, 0, 0], curl: 0.6 }];
const FACE_ARMS = [{ ua: [-0.35, -1.25, 0], el: -0.7, wr: [0.4, 0, 0], curl: 0.8 }, { ua: [-0.35, 1.25, 0], el: -0.7, wr: [0.4, 0, 0], curl: 0.8 }];
const printSrc = () => asset('print.jpg');
function shotCard() {
  fillAll('#020306'); ykStars(ss(4.5, 5.2, TT) * (1 - ss(7.9, 8.5, TT)));
  const kIn = TT < 7.9 ? ss(4.7, 5.5, TT) : 1 - ss(7.9, 8.45, TT), kN = TT < 7.9 ? ss(5.4, 6.2, TT) : 1 - ss(7.9, 8.3, TT);
  ykCard(printSrc(), 'Gashadokuro', kIn, kN, { y: 320, w: 720, h: 524, pw: 90, seal: '骨' });
}
function shotVillage() {   // the village edge in the famine snow; up the slope, the dead under straw mats in the susuki
  const Wd = world(), t = TT, k = ss(8.5, 14.6, t); setMats(Wd, 1); poseFieldBones(Wd, 'rest', t, { keep: 0.6 });
  const m0 = MATS[0], ax = V3(Math.sin(m0[2]), 0, Math.cos(m0[2])), c0 = PP(m0[1], m0[0]), cam = c0.clone().addScaledVector(ax, -lerp(3.6, 3.3, k)).add(V3(0.2, 1.6, 0)), tg = c0.clone().addScaledVector(ax, 0.9).add(V3(-1.0, -0.75, 0));
  cam.y = Math.max(cam.y, groundAt(cam.x, cam.z) + 0.7);
  Wd.key.color.set('#c8dcd8'); Wd.key.position.copy(c0.clone().add(V3(4, 5, -3))); Wd.key.target.position.copy(c0); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = 2.4; Wd.key.angle = 0.5; Wd.key.penumbra = 0.6;
  render3D('night', cam, tg, { fov: 60, vis: ss(8.5, 8.9, t), moonDir: V3(0.6, 0.5, -1), moonS: 26, rim: 1.6, rimDir: V3(0.2, 0.5, -1), mist: 0.5, shadowAt: c0, light: { moonI: 1.1, hemI: 1.1 } });
}
function shotBones() {   // the moonlit field: flattened mats, bones in the grass, crows
  const Wd = world(), t = TT, k = ss(14.6, 20.6, t); setMats(Wd, 0.15); poseFieldBones(Wd, 'rest', t); poseCrows(Wd, t, true, 0.15);
  const cam = PP(lerp(15.2, 15.6, k), -2.3).add(V3(0, 1.05, 0)), tg = PP(19.2, -4.8).add(V3(0, 0.0, 0));
  render3D('night', cam, tg, { fov: 48, moonDir: V3(-0.4, 0.5, 1), moonS: 22, rim: 0.8, mist: 0.9, shadowAt: tg, light: { fog: '#26403f', fn: 5, ff: 50, bg: '#1c3236' } });
}
function shotWalk() {   // she walks up the path between the stone lanterns with her chōchin
  const Wd = world(), t = TT, z0 = -15, w = walkGirl(Wd, { O: PP(z0), D: UPHILL(z0), s: 0.55 * (t - 20.6), pitch: 0.05, look: 0.15 * Math.sin(t * 0.5) });
  const cam = w.pos.clone().addScaledVector(w.F, 3.1).add(V3(1.1, 0.35, 0)), tg = w.pos.clone().add(V3(0, -0.45, 0)).addScaledVector(w.F, -0.6);
  render3D('night', cam, tg, { fov: 50, moonDir: V3(0.6, 0.5, -1), moonS: 20, motes: { p: Wd.lant.body.position, r: 0.5, a: 0.5 }, shadowAt: w.pos, mist: 0.8 });
}
function shotClick() {   // halfway up: the bones in the grass begin to tremble; she has stopped on the path behind them
  const Wd = world(), t = TT, k = ss(26.6, 32.6, t); setMats(Wd, 0.15); poseFieldBones(Wd, 'tremble', t, { k: ss(27.0, 28.5, t) });
  const z0 = -2, w = walkGirl(Wd, { O: PP(z0), D: UPHILL(z0), s: 0, plant: [0.05, -0.08], pitch: 0.05, look: lerp(0, 0.7, ss(28.5, 30, t)) });
  const cam = PP(lerp(5.4, 5.1, k), -3.3).add(V3(0, 0.55, 0)), tg = w.pos.clone().add(V3(0, -0.05, 0));
  render3D('night', cam, tg, { fov: 46, moonDir: V3(0.7, 0.5, -1), moonS: 18, shadowAt: tg, mist: 1.3, light: { hemI: 1.2, hemG: '#6a5a44', fog: '#26403f', fn: 5, ff: 50, bg: '#1c3236' } });
}
function shotRoll() {   // the bones roll and tumble uphill and gather in the dark between the cedars
  const Wd = world(), t = TT, k = ss(32.6, 38.6, t); setMats(Wd, 0.15); poseFieldBones(Wd, 'roll', t);
  const cam = PP(lerp(10.5, 10.1, k), -2.4).add(V3(0, 1.6, 0)), tg = PP(3.5, -6.5).add(V3(0, 0.1, 0)); poseHero(Wd, t, cam);
  Wd.key.color.set('#c8dcd8'); Wd.key.position.copy(PP(6, 3).add(V3(0, 6, 0))); Wd.key.target.position.copy(PP(6, -4.5)); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = 1.1; Wd.key.angle = 0.6; Wd.key.penumbra = 0.6;
  render3D('night', cam, tg, { fov: 54, moonDir: V3(0.4, 0.5, -1), moonS: 18, rim: 1.6, rimDir: V3(0, 0.5, -1), shadowAt: PP(6, -4.5), mist: 0.5, light: { moonI: 1.1, hemI: 1.1 } });
}
function shotHand() {   // eyes on the lantern, counting steps; a giant bony hand creeps beside the path. Her lantern dies at the end
  const Wd = world(), t = TT, z0 = -33, D = UPHILL(z0), s = 0.5 * (t - 38.6), w = walkGirl(Wd, { O: PP(z0), D, s, pitch: 0.55, look: 0, lant: 1 - ss(44.3, 44.9, t) * (0.6 + 0.4 * Math.sin(t * 40) ** 2) });
  const Lx = UPV.clone().cross(w.F), hp = w.pos.clone().addScaledVector(Lx, -3.8).addScaledVector(w.F, lerp(-3.5, 2.0, ss(38.6, 45, t))); hp.y = groundAt(hp.x, hp.z);
  poseHand(Wd, { p: hp, dir: w.F, s: 2.4 * (t - 38.6), pitch: 0.6, roll: -0.15 });
  const cam = w.pos.clone().addScaledVector(w.F, 4.2).addScaledVector(Lx, 1.4).add(V3(0, 0.6, 0)), tg = w.pos.clone().addScaledVector(Lx, -1.1).addScaledVector(w.F, -0.5).add(V3(0, 1.2, 0));
  render3D('night', cam, tg, { fov: 66, light: { fog: '#26403f', fn: 5, ff: 55, bg: '#1c3236' }, vis: 1 - ss(44.85, 45.0, t), moonDir: w.F.clone().negate().setY(0.5), moonS: 18, rim: 1.2, rimDir: w.F.clone().negate().setY(0.4), shadowAt: w.pos, mist: 0.9 });
}
function shotFace() {   // the top of the pass, dark: she looks up; the many-skull face lowers to her
  const Wd = world(), t = TT, z0 = -53.5, D = UPHILL(z0), w = walkGirl(Wd, { O: PP(z0), D, s: 0, plant: [0.04, -0.06], pitch: lerp(0.5, -0.75, easeOut(ss(45.7, 46.6, t))), lant: 0 });
  const low = easeOut(ss(45.6, 50.5, t)), H = w.pos.clone().addScaledVector(w.F, lerp(9, 6.2, low)).add(V3(0, lerp(14, 5.6, low), 0));
  placeGasha(Wd, H, Math.atan2(-w.F.x, -w.F.z), lerp(0.3, 0.5, low), { arms: FACE_ARMS, jaw: chatter(t, 1 - 0.6 * ss(49, 51, t)) + 0.12 * ss(49, 51, t), hp: 0.2, hr: 0.12 * Math.sin(t * 0.5), glint: 1 });
  const Lx = UPV.clone().cross(w.F), FC = window.FACECAM || [8.0, 0.5, 2.6, 3.0, -0.6], cam = w.pos.clone().addScaledVector(w.F, -FC[0]).addScaledVector(Lx, FC[1]).add(V3(0, FC[2], 0)), tg = w.pos.clone().addScaledVector(w.F, FC[3]).addScaledVector(Lx, FC[5] ?? 0).add(V3(0, lerp(FC[4] + 1, FC[4], low), 0));
  Wd.key.color.set('#9fb8b4'); Wd.key.position.copy(H.clone().addScaledVector(Lx, 14).add(V3(0, 10, 0))); Wd.key.target.position.copy(H); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = 2.0; Wd.key.angle = 0.35; Wd.key.penumbra = 0.7;
  render3D('night', cam, tg, { fov: 62, moonDir: w.F.clone().setY(0.6).applyAxisAngle(UPV, 0.5), moonS: 22, rim: 1.4, rimDir: w.F.clone().setY(0.5), shadowAt: H, mist: 0.6, light: { hemI: 0.6 } });
}
function shotTeeth() {   // close on its teeth, each a stack of skulls; her mother's red comb caught between them
  const Wd = world(), t = TT, k = ss(51.6, 58, t), G = Wd.gasha; const z0 = -53.5, F = UPHILL(z0), at = PP(z0);
  const H = at.clone().addScaledVector(F, 6.2).add(V3(0, 7.5, 0)); placeGasha(Wd, H, Math.atan2(-F.x, -F.z), 0.12, { arms: FACE_ARMS, jaw: 0.09 + 0.03 * Math.sin(t * 2), hp: 0.04, hr: 0.05, glint: 1 });
  const T4 = G.upperTeeth[4], T5 = G.upperTeeth[5], CM = T4.clone().add(T5).multiplyScalar(0.5); G.comb.visible = true; G.comb.position.set(CM.x, -1.86, CM.z + 0.13); G.comb.rotation.set(-0.05, Math.atan2(T5.x - T4.x, T5.z - T4.z) - Math.PI / 2, 0.25);
  const cp = G.head.localToWorld(V3(CM.x, -1.75, CM.z)), fwd = G.head.localToWorld(V3(0, -2.0, 4)).sub(G.head.localToWorld(V3(0, -2.0, 2.3))); fwd.y = Math.max(fwd.y, -0.15 * fwd.length()); fwd.normalize();
  const cam = cp.clone().addScaledVector(fwd, lerp(5.2, 4.6, k)).add(V3(0, -0.15, 0)), tg = cp.clone().add(V3(0, -0.45, 0));
  Wd.key.color.set('#b9cbc6'); Wd.key.position.copy(cp.clone().add(V3(-4, 3, 0)).addScaledVector(fwd, 4)); Wd.key.target.position.copy(cp); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = 3.4; Wd.key.angle = 0.3; Wd.key.penumbra = 0.6;
  render3D('night', cam, tg, { fov: 34, vis: ss(51.6, 51.9, t), moonDir: fwd.clone().negate().setY(0.6), moonS: 20, rim: 1.0, shadowAt: cp, mist: 0.2, snow: 0.6, snowBox: 4, light: { hemI: 0.8 } });
}
function shotDay() {   // the field by day in fog; fewer bones in the grass
  const Wd = world(), t = TT, k = ss(58, 71, t); setMats(Wd, 0.1); Wd.mats.forEach((M) => (M.m.visible = false)); poseFieldBones(Wd, 'rest', t, { keep: 0.22 }); Wd.cedarIM.forEach((m) => (m.visible = false)); Wd.cedarBr.visible = false;
  const cam = PP(lerp(23.5, 22, k), 0.4).add(V3(0, 1.5, 0)), tg = PP(16, -5).add(V3(0, 0.2, 0));
  render3D('dawn', cam, tg.add(V3(0, -0.4, 0)), { fov: 48, light: { fn: 3, ff: 95, fog: '#56706f', bg: '#56706f', sky: 1.4, exp: 1.15, ridgeC: ['#6e8a88', '#5c7876', '#4c6664'] }, ridgeY: 6, vis: ss(58, 58.6, t) * (1 - ss(70, 71, t)), moonDir: V3(0.4, 0.3, -1), moonS: 0.01, mist: 1.1, shadowAt: tg, snow: 0.5 });
}

const PARA = [
  ['If you hear teeth chattering on the mountain pass at night, don\'t look up. My grandmother did.', -1.2, 8.2],
  ['In the famine winter of 1783 the ground froze, and our village left its dead in the grass above the pass.', 9.0, 14.35],
  ['No one came back for them. The crows took the rest. The bones stayed.', 15.1, 20.35],
  ['She was sent over the pass at night to buy rice in the next valley, with a paper lantern.', 21.1, 26.35],
  ['Halfway up she heard it. A dry clicking, like a thousand teeth, all around her.', 27.1, 32.35],
  ['The bones in the field were rolling uphill, into the dark between the cedars.', 33.1, 38.35],
  ['She kept her eyes on the lantern and counted her steps. The clicking walked beside her.', 39.1, 44.7],
  ['At the top of the pass, the lantern went out. She looked up.', 46.0, 51.35],
  ['It was made of everyone they had left behind. In its teeth, she saw her mother\'s comb.', 52.1, 57.75],
  ['She never crossed the pass again. Every famine winter, there are fewer bones in the field.', 58.6, 70.6],
];
function sceneTale() {
  const t = TT; fillAll('#020306'); resetWorld(world());
  if (window.DBG_SHOT) window.DBG_SHOT(); else   // debug views only (never set in the piece)
  if (t < 4.5) shotHook(); else if (t < 8.5) shotCard(); else if (t < 14.6) shotVillage(); else if (t < 20.6) shotBones(); else if (t < 26.6) shotWalk();
  else if (t < 32.6) shotClick(); else if (t < 38.6) shotRoll(); else if (t < 45.6) { if (t < 45.0) shotHand(); } else if (t < 51.6) shotFace(); else if (t < 58) shotTeeth(); else shotDay();
  PARA.forEach(([s, a, b]) => ykPara(s, a, b, { cy: 1300 }));
  if (t >= 66.2) { const f = () => ykBadge(asset('kodama.jpg'), 'kodamashorts', CX, 290, ss(66.2, 66.9, t) * (1 - ss(70.4, 71, t))); if (DEFER) DEFER.push(f); else f(); }
}
