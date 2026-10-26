// =====================================================================
//  RUN — the nine shots on the squid boat. The sea reacts: a water dome before the creature breaks the surface, a ring
//  wave that lifts the boat, foam and spray at its waist, sheets of water off its head; its eyes glow under the surface.
//  The arm is a two-bone IK reaching for world targets; the hand never enters the boat (checked by armCheck).
// =====================================================================
const T2 = () => Math.floor(TT * 12 + 1e-6) / 12;
const shake = (t, k) => V3(Math.sin(t * 61) * k, Math.sin(t * 47 + 1) * k, Math.sin(t * 53 + 2) * k);
const DECK = 1.33;
const ON = (p) => { const b = WJ.boat; b.updateMatrixWorld(true); return p.clone().applyMatrix4(b.matrixWorld); };   // boat-local → world
const ONd = (v) => { const b = WJ.boat; return v.clone().applyQuaternion(b.quaternion).normalize(); };                // boat-local direction → world
const railX = (z) => { const R = WJ.boat.userData.railPts; for (let i = 0; i < R.length - 1; i++) { const [z0, x0] = R[i], [z1, x1] = R[i + 1]; if ((z - z0) * (z - z1) <= 0) return lerp(x0, x1, (z - z0) / (z1 - z0 || 1)); } return 0; };
const easeOut = (x) => 1 - (1 - x) ** 3;
function placeMan(Wd, p, ry, P) { Wd._man = [p, ry, P]; placeMan0(Wd, p, ry, P); }
function placeMan0(Wd, p, ry, P) { const m = Wd.man; setPose(m, P); m.position.copy(ON(V3(p.x, DECK + 0.02, p.z))); const q = WJ.boat.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(P.rx ?? 0, ry, P.rz ?? 0, 'YXZ'))); m.quaternion.copy(q); m.visible = true; m.updateMatrixWorld(true); }
function resetWorld(Wd) {
  Wd._man = null;
  Object.assign(SEA, { calm: 0, agit: 0, bumpR: 20, bumpH: 0, bumpC: [0, 0], ringT: -1, ringA: 0, ringC: [0, 0], eyeI: 0, eyes: [0, 0, 0, 0] });
  Wd.man.visible = true; Wd.umi.visible = true; Wd.harbour.visible = false; Wd.boat.visible = true; Wd.bigLadle.visible = false; Wd.stream.visible = false;
  Wd.boat.position.set(0, 0, 0); Wd.boat.userData.ladle.visible = true; const bk = Wd.boat.userData.bucket; bk.visible = true; bk.position.set(1.3, DECK, -2.9); bk.rotation.set(0, 0, 0);
  if (Wd.manLadle) Wd.manLadle.visible = false;
}
const eyeXZ = (Wd) => { Wd.umi.updateMatrixWorld(true); return Wd.umi.userData.eyes.map(({ e }) => e.getWorldPosition(V3(0, 0, 0))); };
function render3D(preset, pos, tgt, o = {}) {
  const Wd = world(), { r, cv } = rend();
  setLight(Wd, Object.assign({}, LIGHT[preset], o.light || {}), o.focus);
  if (o.sea) Object.assign(SEA, o.sea);
  animWorld(Wd, TT, o);
  if (o.umi) { poseUmi(Wd, o.umi); const E = eyeXZ(Wd); SEA.eyes = [E[0].x, E[0].z, E[1].x, E[1].z]; if (o.umi.under) SEA.eyeI = o.umi.under; } else Wd.umi.visible = false;
  animWorld(Wd, TT, o);   // again, so the sea carries the eye glow and the boat sits on the final surface
  if (o.umi) poseUmi(Wd, o.umi);   // the arm targets were boat-relative: re-pose on the settled boat
  if (Wd._man && Wd.man.visible) placeMan0(Wd, ...Wd._man);   // and the man rides the settled deck
  waterFX(Wd, o.umi || {});
  if (o.after) o.after(Wd);
  const head = () => Wd.umi.localToWorld(V3(0, 6.4, 2.6));
  Wd.cam.fov = o.fov ?? 50; Wd.cam.position.copy(typeof pos === 'function' ? pos() : pos); if (o.shake) Wd.cam.position.add(shake(TT, o.shake)); Wd.umi.updateMatrixWorld(true);
  Wd.cam.lookAt(typeof tgt === 'function' ? tgt(head()) : tgt); Wd.cam.updateProjectionMatrix();
  r.render(Wd.scene, Wd.cam);
  ykBlit(cv, { vis: o.vis ?? 1 });
}
const fadeWin = (a, b, d = 0.6) => Math.min(ss(a, a + d, TT), 1 - ss(b - d, b, TT));
const UMI_SIDE = V3(17, 0, -1), YAW_SIDE = -Math.PI / 2 + 0.15;
const ARM = (wristL, fdirL, backL, extra = {}) => () => Object.assign({ wrist: ON(wristL), fdir: ONd(fdirL), back: ONd(backL), hs: 0.85 }, extra);
const armOf = (a) => (typeof a === 'function' ? a() : a);

function shotOpen() {   // HOOK: astern, a dome of water swells, bursts, and the head rises streaming water; the eyes light up
  const Wd = world(), t = TT, t2 = T2(), up = easeOut(ss(0.9, 3.9, t)), c = V3(0, 0, 24);
  placeMan(Wd, V3(0.4, 0, 0.5), Math.PI, POSE.look);
  const sea = { agit: 0.4 + 0.8 * ss(0.8, 1.8, t), bumpC: [c.x, c.z], bumpR: 13, bumpH: 3.2 * ss(0, 1.3, t) * (1 - ss(1.4, 2.2, t)), ringC: [c.x, c.z], ringT: t - 1.4, ringA: 1.4 };
  render3D('night', V3(lerp(-26, -23, ss(0, 4.5, t)), 7.5, lerp(-14, -12, ss(0, 4.5, t))), (h) => h.clone().add(V3(0, -6, 0)), { vis: fadeWin(0, 4.5, 0.4), fov: 56, focus: c, sea,
    umi: { pos: V3(c.x, lerp(-23, -1.5, up), c.z), s: 2.2, yaw: Math.PI, eyes: ss(2.2, 2.8, t2), wet: 1 - 0.5 * ss(3.8, 4.5, t), splash: ss(1.3, 1.7, t) * (1 - ss(3.4, 4.4, t)), foam: 1 } });
}
const printSrc = () => asset('print.jpg');
function shotCard() {
  fillAll('#020306'); ykStars(ss(4.5, 5.2, TT) * (1 - ss(8.3, 8.9, TT)));
  const kIn = TT < 8.3 ? ss(4.8, 5.6, TT) : 1 - ss(8.3, 8.9, TT), kN = TT < 8.3 ? ss(5.5, 6.3, TT) : 1 - ss(8.3, 8.7, TT);
  ykCard(printSrc(), 'Umibōzu', kIn, kN, { y: 320, w: 720, h: 540, pw: 90 });
}
function shotNight() {   // the boat under its lamps; the grandfather at the rail; the sea goes flat
  const Wd = world(), t = TT, t2 = T2(), calm = ss(13, 17, t);
  placeMan(Wd, V3(-(railX(-2.0) - 0.55), 0, -2.0), -Math.PI / 2, { rx: 0, rz: 0, y: 0.95, sp: [0.18 + 0.03 * Math.sin(t2 * 0.5), 0, 0], nk: [-0.1, 0, 0], aL: [-0.6, 0.1, -0.1], aR: [-0.6, -0.1, -0.1], lL: [0, 0.04, 0], lR: [0, -0.04, 0] });
  if (t < 13.4) { const k = (t - 9) / 4.4; render3D('night', V3(lerp(-26, -22, k), lerp(9, 8, k), lerp(-18, -14, k)), V3(0, 2.5, 0), { vis: ss(9, 9.6, t), fov: 48, calm }); }
  else { const k = (t - 13.4) / 4.6; render3D('night', () => ON(V3(lerp(0.6, 0.4, k), 2.7, lerp(-4.8, -4.4, k))), () => ON(V3(-1.8, DECK + 0.9, -2.0)), { fov: 54, calm }); }
}
function shotSonar() {   // the sonar: something huge rising; then the lamps go out one by one, a glow far below
  const Wd = world(), t = TT; drawSonar(t, ss(18.4, 22.4, t));
  if (t < 22.6) { Wd.boat.userData.bucket.visible = false; placeMan(Wd, V3(-1.0, 0, -0.6), 0.6, POSE.stand); render3D('night', () => ON(V3(0.75, 2.25, 0.05)), () => ON(V3(0.75, 2.25, 0.84)), { fov: 48, calm: 1 }); }
  else { const k = (t - 22.6) / 4.4; placeMan(Wd, V3(0.4, 0, -0.5), Math.PI, POSE.look);
    render3D('night', V3(lerp(9, 8, k), lerp(4.5, 4.2, k), lerp(9, 8, k)), V3(0, 4.5, -2), { fov: 56, calm: 1, out: ss(22.8, 26.6, t),
      umi: { pos: V3(UMI_SIDE.x, -16, UMI_SIDE.z), s: 1.4, yaw: YAW_SIDE, eyes: 1, under: 0.35 * ss(24, 26.5, t), fx: false } }); }
}
const RAIL_Z = -4.2;
function shotRise() {   // eyes glow beneath, the water domes beside the hull, the head breaks the surface; a hand on the rail
  const Wd = world(), t = TT, t2 = T2(), c = UMI_SIDE, brk = 29.8;
  const y = t < brk ? lerp(-16, -9.5, ss(27.4, brk, t)) : lerp(-9.5, -5.5, easeOut(ss(brk, 32.5, t)));
  placeMan(Wd, V3(0.6, 0, 1.0), Math.PI / 2 + 0.3, t2 < 30 ? POSE.look : POSE.shock);
  const sea = { calm: 0.4, agit: 0.3 + 0.9 * ss(brk - 0.3, brk + 0.6, t) * (1 - ss(33, 36, t) * 0.6), bumpC: [c.x - 1, c.z], bumpR: 12, bumpH: 1.8 * ss(27.6, 29.4, t) * (1 - ss(brk, brk + 0.8, t)), ringC: [c.x, c.z], ringT: t - brk, ringA: 1.5 };
  const hk = ss(31.6, 33.8, t2), rx = railX(RAIL_Z);
  const arm = hk > 0 ? ARM(V3(lerp(9, rx + 1.9, ss(0.45, 1, hk)), lerp(-2, DECK + 1.3, ss(0, 0.55, hk)) + 1.2 * Math.sin(Math.PI * ss(0.3, 1, hk)), RAIL_Z), V3(-1, lerp(0.6, -0.12, hk), 0.05), V3(0, 1, 0), { curl: lerp(0.6, 0.15, hk), thumb: 0.3, twitch: 1 }) : null;
  render3D('night', V3(lerp(-9, -8, ss(27, 36, t)), 4.6, -13.5), V3(6, lerp(0.5, 1.2, ss(27, 33, t)), -2.5), { fov: 60, out: 1, sea, shake: t > brk && t < brk + 0.8 ? 0.08 : 0,
    umi: { pos: V3(c.x, y, c.z), s: 1.4, yaw: YAW_SIDE, eyes: ss(28.2, 29.0, t2), under: t < brk ? ss(28.2, 29.0, t) : 0, wet: t < brk ? 0 : 1 - 0.5 * ss(33, 36, t), splash: ss(brk, brk + 0.4, t) * (1 - ss(brk + 1.5, brk + 3.5, t)) * 1.2, foam: 1, arm } });
}
function shotLadle() {   // the hand lifts, palm up, beside the rail; he holds out the broken ladle; the fingers close on it; black
  const Wd = world(), t = TT, t2 = T2(), lift = ss(36.4, 38.0, t2), give = ss(39.6, 40.4, t2), close = ss(40.4, 41.2, t2), rx = railX(-3.4);
  Wd.boat.userData.ladle.visible = t2 < 37.4;
  if (!Wd.manLadle) { Wd.manLadle = mkLadle(true); Wd.man.userData.J.handR.add(Wd.manLadle); Wd.manLadle.position.set(0, -0.05, 0.05); Wd.manLadle.rotation.set(-1.4, 0, 0); }
  Wd.manLadle.visible = t2 >= 37.4 && give < 0.5;
  const P = mixPose(POSE.look, { y: 0.95, sp: [0.25, 0, 0], nk: [-0.5, 0, 0], aL: [0.05, 0.12, -0.15], aR: [-2.0, -0.2, -0.2], lL: [0, 0.05, 0], lR: [0, -0.05, 0] }, ss(37.4, 38.6, t2));
  placeMan(Wd, V3(1.2, 0, -2.0), Math.PI / 2 - 0.1, P);
  const arm = ARM(V3(rx + lerp(1.9, 2.6, lift), lerp(DECK + 1.3, 3.3, lift), lerp(RAIL_Z, -6.4, lift)), V3(lerp(-1, -0.25, lift), 0.1, lerp(0.05, 1, lift)), V3(0, lerp(1, -1, lift), 0), { curl: lerp(lerp(0.15, 0.05, lift), 1.0, close), thumb: lerp(0.3, 0.9, close), twitch: 0.5 });
  render3D('night', V3(-5.5, 3.8, -8.5), () => ON(V3(2.6, 2.6, -2.6)), { fov: 56, out: 1, vis: 1 - ss(44.2, 45.0, t), sea: { calm: 0.5, agit: 0.3 },
    umi: { pos: V3(UMI_SIDE.x, -5.5, UMI_SIDE.z), s: 1.4, yaw: YAW_SIDE, eyes: 1, wet: 0.4, foam: 0.8, arm },
    after: (W) => { if (give <= 0.5) return; const H = W.umi.userData.hand; H.updateMatrixWorld(true); W.bigLadle.visible = true; W.bigLadle.scale.setScalar(1.6); W.bigLadle.position.copy(H.localToWorld(V3(0, 0.6, 1.4)));
      W.bigLadle.quaternion.copy(H.getWorldQuaternion(new THREE.Quaternion())).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))); } });
}
// the scoop: the ladle (handle through the fist) dips into the sea outboard, rises streaming water through its missing
// bottom, swings over the boat and tips: nothing falls. One cycle every 4.5 s.
function scoopPose(t) {   // the fist holds the handle across the palm (hand X = handle axis, cup end below the fist)
  const u = mod((t - 45.6) / 4.5, 1), dip = V3(8.5, 4.8, -6), high = V3(10, 11, -4), over = V3(4.8, 10.5, -1.6);
  let W; if (u < 0.28) W = high.clone().lerp(dip, ss(0, 0.28, u)); else if (u < 0.62) W = dip.clone().lerp(over, ss(0.28, 0.62, u)); else if (u < 0.82) W = over.clone(); else W = over.clone().lerp(high, ss(0.82, 1, u));
  const tip = ss(0.62, 0.78, u) * (1 - ss(0.82, 0.95, u)), Zh = V3(-1, 0, 0.25).normalize(), Yh = V3(0.25, 0, 1).normalize();   // fingers toward the boat, back of the hand outward
  const Z = Zh.clone().applyAxisAngle(Yh, 0), Y = Yh.clone().applyAxisAngle(Zh, tip * 1.1), A = Y.clone().cross(Z).normalize().negate();   // A = hand X, pointing up the handle
  return { u, W, Z, Y, A, pour: u > 0.3 && u < 0.9 ? 1 : 0, dipT: t - (45.6 + Math.floor((t - 45.6) / 4.5) * 4.5 + 0.28 * 4.5) };
}
function placeBigLadle(Wd, sp) {   // the handle passes through the closed fist (grip point = between palm and curled fingers), cup end below
  const H = Wd.umi.userData.hand; H.updateMatrixWorld(true); const hq = H.getWorldQuaternion(new THREE.Quaternion()), X = V3(1, 0, 0).applyQuaternion(hq), Z = V3(0, 0, 1).applyQuaternion(hq), Y = V3(0, 1, 0).applyQuaternion(hq);
  const up = X.y >= 0 ? X : X.clone().negate(), sc = 7.0, grip = H.localToWorld(V3(0, -0.45, 2.15));
  // ladle local: handle along +y from y=0.03 to 0.98, cup centred at origin facing +z. Put the handle's middle (y≈0.6) in the grip.
  const Zc = Y.clone().negate().addScaledVector(up, Y.dot(up)).normalize(), Xc = up.clone().cross(Zc).normalize();
  Wd.bigLadle.visible = true; Wd.bigLadle.scale.setScalar(sc); Wd.bigLadle.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xc, up, Zc));
  Wd.bigLadle.position.copy(grip).addScaledVector(up, -0.6 * sc);
  return Wd.bigLadle.localToWorld(V3(0, 0, 0.0));
}
function pourStream(Wd, cup, k) {   // water runs straight through the missing bottom of the cup
  Wd.stream.visible = k > 0 && cup.y > 0.5; if (!Wd.stream.visible) return; const P = Wd.stream.geometry.attributes.position;
  Wd.streamP.forEach((q, i) => { const tt = mod(q.ph + TT * 1.6, 1) * 1.6, y = cup.y - 4.9 * tt * tt * 1.4; P.setXYZ(i, cup.x + q.jx * (0.25 + tt * 0.4), y > 0 ? y : -50, cup.z + q.jz * (0.25 + tt * 0.4)); }); P.needsUpdate = true;
}
function shotReveal() {   // the head over the boat; it scoops and scoops, the water runs out through the broken bottom
  const Wd = world(), t = TT, t2 = T2(), sp = scoopPose(t2);
  Wd.boat.userData.ladle.visible = false; placeMan(Wd, V3(-0.4, 0, 0.6), Math.PI / 2, POSE.shock);
  const arm = { wrist: sp.W, fdir: sp.Z, back: sp.Y, hs: 0.85, curl: 1.25, thumb: 1.1 };
  const sea = { calm: 0.3, agit: 0.7, bumpC: [17, -1], bumpR: 9, bumpH: 0.8, ringC: [8.5, -6], ringT: sp.dipT, ringA: 0.9 };
  const umi = { pos: V3(17, -1.5, -1), s: 1.4, yaw: YAW_SIDE + 0.15, lean: 0.12, eyes: 1, wet: 0.7, splash: 0.25, foam: 1, arm, mouth: t > 50.6 ? 0.25 * ss(53, 55, t2) : 0 };
  const opts = { fov: 62, out: 1, sea, umi, after: (W) => pourStream(W, placeBigLadle(W, sp), sp.pour) };
  if (t < 50.6) { const k = (t - 45.6) / 5; render3D('night', V3(lerp(-6, -5, k), 4.2, lerp(-17, -15, k)), V3(7, 5.5, -3), Object.assign(opts, { shake: t < 46.4 ? 0.1 * (1 - ss(45.6, 46.4, t)) : 0 })); }
  else { const k = (t - 50.6) / 5.4; render3D('night', V3(lerp(-14, -12, k), lerp(5, 6, k), lerp(-16, -13, k)), (h) => h.clone().add(V3(-6, -4, 0)), Object.assign(opts, { fov: 54 })); }
}
function shotBucket() {   // the hand comes over the rail toward the bucket; he kicks it overboard; the head sinks in a whirl of foam
  const Wd = world(), t = TT, t2 = T2(), kick = ss(61.6, 62.2, t2), sink = ss(62.4, 65.6, t), reach = ss(56.4, 60.4, t2) * (1 - ss(62.0, 62.8, t2));
  const bk = Wd.boat.userData.bucket; if (kick > 0) { const fly = ss(61.8, 63.0, t2); bk.position.set(1.3 + 3.2 * fly, DECK + 1.6 * Math.sin(Math.PI * fly) - 2.5 * ss(62.6, 63.2, t2), -2.9 - 0.6 * fly); bk.rotation.z = -fly * 3; bk.visible = t2 < 63.4; }
  const P = kick > 0 && kick < 1 ? { y: 0.9, sp: [-0.2, 0, 0], nk: [0.1, 0, 0], aL: [0.4, 0.4, -0.3], aR: [0.4, -0.4, -0.3], lL: [-1.4, 0.05, 0.2], lR: [0.2, -0.05, 0.1] } : POSE.shock;
  placeMan(Wd, V3(0.3, 0, -2.6), Math.PI / 2, P);
  const rx = railX(-2.9), arm = ARM(V3(lerp(8, rx + 4.4, reach), lerp(6.0, 5.5, reach) - 6 * sink, -2.9), V3(-1, -0.3 * reach + 0.2 * (1 - reach), 0), V3(0, 1, 0), { curl: lerp(0.3, 0.75, reach) * (1 - kick * 0.4), thumb: 0.5, twitch: 1 });
  const sea = { calm: 0.3, agit: 0.5 + 0.8 * sink, bumpC: [17, -1], bumpR: 10, bumpH: -2.2 * Math.sin(Math.PI * sink), ringC: [17, -1], ringT: t - 62.6, ringA: 1.2 * ss(62.4, 62.8, t) };
  const umi = { pos: V3(17, -1.5 - 22 * sink * sink, -1), s: 1.4, yaw: YAW_SIDE + 0.15, eyes: 1 - ss(64.6, 65.4, t), wet: 1, splash: ss(62.4, 62.9, t) * (1 - ss(64.5, 65.8, t)), foam: 1, arm: sink < 0.8 ? arm : null };
  if (t < 59.6) { render3D('night', () => ON(V3(-2.0, 3.6, 0.8)), () => ON(V3(1.6, 1.4, -3.0)), { fov: 58, out: 1, sea, umi }); return; }
  render3D('night', V3(-12, 5.5, -14), V3(7, 2.5, -2), { fov: 54, out: 1 - 0.5 * sink, sea, umi, shake: t > 62.4 && t < 63.4 ? 0.05 : 0 });
}
function shotDawn() {   // today: the harbour at dawn; buckets with holes and broken ladles on every boat
  const Wd = world(), t = TT; Wd.boat.visible = false; Wd.man.visible = false; Wd.harbour.visible = true;
  const k = (t - 66) / 5; render3D('dawn', V3(lerp(-1.2, -1.6, k), 3.0, lerp(7.2, 6.6, k)), V3(-2, 1.1, 3.6), { fov: 56, vis: 1 - ss(69.8, 71, t), rain: false, calm: 0.6, out: 1, focus: V3(0, 1, -4) });
}
// the hand must stay out of the boat: how far any part of it dips into the hull (debug, 0 = clean)
function armCheck() { const H = WJ.umi.userData.hand; if (!H.visible || !WJ.umi.visible) return 0; H.updateMatrixWorld(true); const inv = WJ.boat.matrixWorld.clone().invert(); let worst = 0;
  H.traverse((m) => { if (!m.isMesh) return; const p = m.getWorldPosition(V3(0, 0, 0)).applyMatrix4(inv); if (p.z > -8 && p.z < 6 && Math.abs(p.x) < railX(p.z) - 0.1 && p.y < DECK + 0.25) worst = Math.max(worst, DECK + 0.25 - p.y); }); return worst; }

const PARA = [
  ['My grandfather fished squid off the Gotō Islands, and every boat there carries a ladle with its bottom knocked out.', 0.4, 8.85],
  ['One summer night the sea went flat as glass, and the squid stopped rising to the lights.', 9.5, 17.75],
  ['Something was coming up from far below, and one by one the lamps went out.', 18.4, 26.75],
  ['Two white eyes opened beside the hull, and a hand as big as the boat rested on the rail.', 27.4, 35.75],
  ['A voice like the tide asked him for a ladle, so he gave it the broken one, as he had been taught.', 36.4, 44.6],
  ['It scooped and scooped, and not one drop fell. It stared at him, and it did not stop.', 46.3, 55.75],
  ['Then its hand turned toward the bucket we used to bail the hold. He kicked it into the sea before it could take it.', 56.4, 65.75],
  ['Today every bucket on our island has a hole in it. Tourists think it is for luck.', 66.6, 70.6],
];
function sceneTale() {
  const t = TT; fillAll('#020306'); resetWorld(world());
  if (t < 4.5) shotOpen(); else if (t < 9) shotCard(); else if (t < 18) shotNight(); else if (t < 27) shotSonar(); else if (t < 36) shotRise();
  else if (t < 45.6) { if (t < 45.0) shotLadle(); } else if (t < 56) shotReveal(); else if (t < 66) shotBucket(); else shotDawn();
  PARA.forEach(([s, a, b]) => ykPara(s, a, b, { cy: 1300 }));
  if (t >= 66.2) { const f = () => ykBadge(asset('kodama.jpg'), 'kodamashorts', CX, 290, ss(66.2, 66.9, t) * (1 - ss(70.4, 71, t))); if (DEFER) DEFER.push(f); else f(); }
}
