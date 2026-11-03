// =====================================================================
//  RUN — the shots. The rake is posed by where its body must be (poseRake: crawl gait, hands on the futon / the cradle
//  rim); the woman sits up with a match in her right fist, then runs after it; the irori embers, the moon through the
//  shōji (the paper lets it through, the lattice throws its grid), the match light.
// =====================================================================
const easeOut = (x) => 1 - (1 - x) ** 3;
const DOWN = V3(0, -1, 0), UPV = V3(0, 1, 0);
const yzOf = (q) => ({ Y: V3(0, 1, 0).applyQuaternion(q), Z: V3(0, 0, 1).applyQuaternion(q) });
function headRel(B, pitch, yaw, roll) { const q = qBasis(B.X, B.Y, B.Z).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ'))); return yzOf(q); }
const FP = (x, z) => V3(x, groundAt(x, z), z);
const yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
const jerk = (t, t0, t1, n = 5) => { const k = clamp((t - t0) / (t1 - t0)); return (Math.floor(k * n) + ss(0.7, 1, mod(k * n, 1))) / n; };   // a value that moves in ticks
const MOON_IN = V3(-1, 0.42, 0.15);

function animWorld(Wd, t, o = {}) {
  WIND.value = t; const cam = Wd.cam.position;
  Wd.sky.position.copy(cam); Wd.ridges.forEach((m) => m.position.set(cam.x, cam.y + m.userData.y - 30 + (o.ridgeY ?? 0), cam.z));
  const md = (o.moonDir || V3(-0.3, 0.45, -1)).clone().normalize(); Wd.moonDisk.position.copy(cam).addScaledVector(md, 500); Wd.moonDisk.lookAt(cam); Wd.moonDisk.scale.setScalar(o.moonS ?? 30); Wd.moonHalo.position.copy(Wd.moonDisk.position).addScaledVector(md, 1); Wd.moonHalo.scale.setScalar((o.moonS ?? 30) * 5);
  Wd.mist.forEach((s) => { const u = s.userData; s.position.x = u.x + 1.5 * Math.sin(t * 0.07 + u.ph); const dc = s.position.distanceTo(cam) - s.scale.x * 0.5; s.material.opacity = (0.3 + 0.15 * Math.sin(t * 0.3 + u.ph)) * (o.mist ?? 0) * ss(1.5, 6.0, dc); s.visible = s.material.opacity > 0.003; });
  { const c = o.motes; Wd.motes.visible = !!c; if (c) { const P = Wd.motes.geometry.attributes.position; Wd.moteP.forEach((q, i) => { const r = c.r ?? 1.2; P.setXYZ(i, c.p.x + q.x * r + 0.15 * Math.sin(t * q.v * 2 + q.ph), c.p.y + q.y * r * 0.7 + 0.1 * Math.sin(t * q.v * 3 + q.ph * 2), c.p.z + q.z * r + 0.15 * Math.cos(t * q.v * 1.7 + q.ph)); }); P.needsUpdate = true; Wd.motes.material.opacity = c.a ?? 0.8; } }
  { const k = o.snow ?? 0, P = Wd.snow.geometry.attributes.position, B = o.snowBox ?? 9; Wd.snow.visible = k > 0; Wd.snow.material.opacity = 0.85 * k;
    Wd.snowP.forEach((q, i) => { const y = mod(q.y - t * 0.09 * q.v, 1); P.setXYZ(i, cam.x + q.x * B + 0.3 * Math.sin(t * 0.8 + q.ph), cam.y - B * 0.5 + y * B, cam.z + q.z * B + 0.3 * Math.cos(t * 0.6 + q.ph)); }); P.needsUpdate = true; }
}
// a practical flame: a slow breath, a fast shiver and, now and then, a dip (deterministic: hashed per 1/12 s step)
const flick = (t, seed = 0) => { const h = hsh(Math.floor(t * 12) + seed * 97, 5), h2 = hsh(Math.floor(t * 12) - 1 + seed * 97, 5); return (0.86 + 0.08 * Math.sin(t * 6.3 + seed) + 0.06 * Math.sin(t * 15.7 + seed * 2)) * (h > 0.9 ? 0.3 : h2 > 0.9 ? 0.65 : 1); };
// a damaged lamp: stutters off and on in hashed bursts (1/20 s steps), with a few dead spells and a bright surge back
const broken = (t) => { const s = Math.floor(t * 20), h = hsh(s, 9), burst = hsh(Math.floor(t * 2.5), 4) > 0.55; return burst ? (h > 0.45 ? 1 : h > 0.25 ? 0.18 : 0.0) : (h > 0.94 ? 0.12 : 1); };
function lamp(Wd, k = 1, dmg = 0) {   // the andon by the futon's end: the main light in the room (dmg 0..1: how damaged it is)
  const f = k * flick(TT, 3) * lerp(1, broken(TT), dmg); Wd.glow.position.copy(Wd.andonAt); Wd.glow.color.set('#ffa850'); Wd.glow.distance = 7; Wd.glow.decay = 1.6; Wd.glow.intensity = 3.6 * f;
  Wd.andonM.color.set(k > 0 ? '#e8a050' : '#3a2c1c').multiplyScalar(k > 0 ? 0.35 + 0.65 * f : 1); Wd.andonGlow.visible = k > 0; Wd.andonGlow.position.copy(Wd.andonAt); Wd.andonGlow.material.opacity = 0.7 * f; Wd.andonGlow.scale.setScalar(0.9);
}
function embers(Wd, k = 1) {
  Wd.fill.intensity = 1.6 * k * flick(TT, 7);
  Wd.emb.forEach((e) => e.material.color.set(Math.sin(TT * 1.7 + e.userData.ph) > 0.2 ? '#ffa040' : '#c0501c'));
}
function setTear(Wd, torn) { const T = Wd.tear; T.intact.visible = !torn; T.torn.visible = torn; T.flaps.forEach((f) => { f.visible = torn; f.rotation.z = f.userData.r0.z + 0.08 * Math.sin(TT * 2.3 + f.userData.ph); }); }
function lightsOff(Wd) { Wd.key.color.set('#b9cbc6'); [Wd.matchL, Wd.key, Wd.fill, Wd.rim, Wd.glow].forEach((l) => (l.intensity = 0)); Wd.match.fl.visible = false; }
function resetWorld(Wd) {
  hideRake(Wd); Wd.toon.get(Wd.rake.skinM).color.set('#ffffff'); Wd.girl.g.visible = false; Wd.match.g.visible = false; Wd.headMe.visible = true; Wd.headMil.visible = true; Wd.futMe.kake.visible = true;
  Wd.paperOut.color.set('#34494b'); Wd.andonM.color.set('#3a2c1c'); Wd.andonGlow.visible = false; Wd.glow.distance = 14; Wd.glow.decay = 1.5; Wd.paperOut.transparent = false; Wd.paperOut.opacity = 1; Wd.scroll.visible = false; Wd.ofudaPost.visible = false;
  Wd.scr.forEach((s) => (s.visible = TT > 34.85 && TT < 52)); setTear(Wd, TT > 34.85 && TT < 52); lightsOff(Wd);
  // the sleepers: my head on my pillow, my mother-in-law's on hers (faces up)
  const pm = FUTON.me, hm = Wd.headMe; hm.position.set(pm.x, 0.2, pm.z - pm.l / 2 + 0.17); hm.rotation.set(-Math.PI / 2 + 0.25, 0, 0);
  const pl = FUTON.mil, hl = Wd.headMil; hl.position.set(pl.x + pl.l / 2 - 0.17, 0.2, pl.z); hl.rotation.set(0, -Math.PI / 2, 0); hl.rotateX(-Math.PI / 2 + 0.2);
}
function render3D(preset, pos, tgt, o = {}) {
  const Wd = world(), { r, cv } = rend();
  setLight(Wd, Object.assign({}, LIGHT[preset], o.light || {}));
  if (window.DBG_CAM) { pos = window.DBG_CAM[0]; tgt = window.DBG_CAM[1]; o.fov = window.DBG_CAM[2] ?? o.fov; }   // debug views only (never set in the piece)
  Wd.cam.fov = o.fov ?? 50; Wd.cam.position.copy(pos); Wd.cam.up.set(0, 1, 0); Wd.cam.lookAt(tgt); if (o.roll) Wd.cam.rotateZ(o.roll); Wd.cam.updateProjectionMatrix(); Wd.cam.updateMatrixWorld(true);
  animWorld(Wd, TT, o);
  { const c = o.shadowAt || tgt, md = (o.moonDir || MOON_IN).clone().normalize(); Wd.moon.position.copy(c).addScaledVector(md, 40); Wd.moon.target.position.copy(c); Wd.moon.target.updateMatrixWorld(); }
  if (o.rim) { Wd.rim.intensity = o.rim; const c = o.shadowAt || tgt, rd = (o.rimDir || V3(0, 0.5, -1)).clone().normalize(); Wd.rim.position.copy(c).addScaledVector(rd, 40); Wd.rim.target.position.copy(c); Wd.rim.target.updateMatrixWorld(); }
  if (Wd.girl.g.visible) Wd.girl.g.updateMatrixWorld(true);
  r.render(Wd.scene, Wd.cam);
  ykBlit(cv, { vis: o.vis ?? 1 });
}
function keyAt(Wd, from, at, I, angle = 0.4, col = '#b9cbc6') { Wd.key.color.set(col); Wd.key.position.copy(from); Wd.key.target.position.copy(at); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = I; Wd.key.angle = angle; Wd.key.penumbra = 0.7; }

// ---------------------------------------------------------------------
//  the woman: sitting up in her futon with a match (beat 7); running after it (beat 8)
// ---------------------------------------------------------------------
function matchIn(Wd, k, flare = 0) {   // the match in her right fist; k = flame (0..1)
  const P = Wd.girl, M = Wd.match; M.g.visible = true; holdProp(P, 1, M.g, -0.01);
  const tip = M.g.localToWorld(M.tip.clone()).add(V3(0, 0.012, 0)); M.fl.visible = k > 0.02; M.fl.position.copy(tip).add(V3(0, 0.012, 0)); M.fl.scale.set(0.05 * k + 0.08 * flare, (0.08 * k + 0.12 * flare) * (1 + 0.05 * Math.sin(TT * 9)), 1); M.fl.material.opacity = Math.min(1, k + flare);
  Wd.matchL.position.copy(tip).add(V3(0, 0.03, 0)); Wd.matchL.intensity = (2.6 * k + 2.5 * flare) * flick(TT, 11); return tip;
}
function seatWoman(Wd, o) {   // sitting up on the futon, legs out along +z, torso turned toward F, the match raised in the right hand
  const P = Wd.girl, pd = P.pd, base = FP(o.x, o.z).add(V3(0, 0.07, 0)), F = o.F.clone().setY(0).normalize(), Fl = V3(0, 0, 1);
  const U = UPV.clone().addScaledVector(F, 0.12).normalize(), B = frameOf(U, F), pos = base.clone().add(V3(0, 0.1, 0)), top = pos.clone().addScaledVector(B.Y, pd.torso);
  const Lx = UPV.clone().cross(Fl), feet = [1, -1].map((sd) => base.clone().addScaledVector(Fl, 0.62).addScaledVector(Lx, sd * 0.12).add(V3(0, 0.05, 0)));
  const hR = o.handR || top.clone().addScaledVector(F, 0.3).addScaledVector(B.X, -0.1).add(V3(0, 0.02, 0)), hL = base.clone().addScaledVector(B.X, 0.24).addScaledVector(F, 0.1).add(V3(0, 0.06, 0));
  poseP(P, { pos, U, F, head: headRel(B, o.pitch ?? 0, o.look ?? 0, 0), hands: [hL, hR], hdir: [{ Z: F.clone().addScaledVector(DOWN, 0.6).normalize(), Y: B.X.clone() }, { Z: F.clone().addScaledVector(UPV, 0.5).normalize(), Y: B.X.clone().negate() }],
    epole: [B.X.clone().addScaledVector(DOWN, 0.5), B.X.clone().negate().addScaledVector(DOWN, 0.8).addScaledVector(F, -0.3)], feet, fdir: [{ Z: UPV.clone(), Y: Fl.clone().negate() }, { Z: UPV.clone(), Y: Fl.clone().negate() }], kpole: UPV.clone().addScaledVector(Fl, 0.3), curl: [0.3, 0.4], grip: [false, true], breath: Math.sin(TT * 3.6), skirtLen: 0.9, skirtW: 1.0 });
  return { P, B, top, pos, F };
}
function walkWoman(Wd, o) {   // walkGirl from pieces/gashadokuro without the lantern; the right hand holds the match up
  const P = Wd.girl, pd = P.pd, F = o.D.clone().setY(0).normalize(), Lx = UPV.clone().cross(F), s = o.s, L = o.L ?? 0.5, ph = s / L;
  const feet = [], fdir = [];
  [0, 1].forEach((j) => { const oj = j * 0.5, u = ph - oj, n = Math.floor(u), f = u - n, side = j === 0 ? 1 : -1; let sp, lift = 0, pit = 0;
    if (f < 0.4) { const k = ss(0, 1, f / 0.4); sp = lerp((n - 0.32 + oj) * L, (n + 0.68 + oj) * L, k); lift = 0.08 * Math.sin(Math.PI * k); pit = 0.3 * Math.sin(Math.PI * k) * (1 - 2 * k); } else sp = (n + 0.68 + oj) * L;
    const g = o.O.clone().addScaledVector(F, sp).addScaledVector(Lx, side * 0.08), gy = groundAt(g.x, g.z); feet.push(g.setY(gy + pd.ank + lift)); fdir.push({ Z: F.clone().applyAxisAngle(Lx, pit), Y: UPV.clone().applyAxisAngle(Lx, pit) }); });
  const mid = feet[0].clone().add(feet[1]).multiplyScalar(0.5), bob = 0.016 * Math.cos(TAU * 2 * ph), sway = 0.018 * Math.sin(TAU * ph);
  const lean = o.lean ?? 0.18, U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)).normalize();
  const pos = o.O.clone().addScaledVector(F, s).addScaledVector(Lx, sway).setY(mid.y - pd.ank + (pd.thigh + pd.shin) * 0.94 + bob);
  const B = frameOf(U, F), top = pos.clone().addScaledVector(B.Y, pd.torso), R = B.X.clone().negate(), SL = top.clone().addScaledVector(B.X, pd.shW), swing = Math.sin(TAU * ph) * 0.14;
  const hL = SL.clone().addScaledVector(DOWN, 0.36).addScaledVector(F, swing + 0.04).addScaledVector(B.X, 0.04), hR = top.clone().addScaledVector(F, 0.28).addScaledVector(R, 0.16).add(V3(0, 0.2, 0));
  poseP(P, { pos, U, F, head: headRel(B, o.pitch ?? 0.05, 0, 0), hands: [hL, hR], hdir: [{ Z: DOWN.clone().addScaledVector(F, 0.15), Y: B.X.clone() }, { Z: F.clone().addScaledVector(UPV, 0.5).normalize(), Y: R.clone() }],
    epole: [B.X.clone().multiplyScalar(0.5).addScaledVector(DOWN, 0.6), R.clone().addScaledVector(DOWN, 0.8).addScaledVector(F, -0.3)], feet, fdir, kpole: F.clone().addScaledVector(UPV, 0.2), curl: [0.45, 0.4], grip: [false, true], breath: Math.sin(TT * 4.2), skirtLen: 0.8, skirtW: 1.0 });
  return { P, B, top, pos, F };
}

// ---------------------------------------------------------------------
//  the shots
// ---------------------------------------------------------------------
const RK_FOOT = V3(-2.6, 0, 0.98);   // the rake at the foot of my futon (hook, beat 4)
function shotHook() {   // from my pillow: it crouches at the foot of the futon, hands on the quilt, lit by the moon through the shōji; its head ticks
  const Wd = world(), t = TT; Wd.headMe.visible = false; embers(Wd, 0.4); lamp(Wd, 1, 1);
  const roll = 0.32 * jerk(t, 0.4, 1.6, 4) - 0.1 * ss(2.6, 3.4, t), K = poseRake(Wd, { p: RK_FOOT, yaw: Math.PI, lift: 0.04, arch: 0.04, head: { pitch: -0.25 + 0.06 * Math.sin(t * 0.9), yaw: 0.06 * Math.sin(t * 1.3), roll }, jaw: 0.08, curl: [0.5, 0.45], twitch: 1 });
  const cam = V3(-2.62, 0.3, -1.32), tg = K.Hc.clone().add(V3(0, -0.36, 0));
  keyAt(Wd, V3(-4.6, 1.5, 0.4), K.Hc, 0.9, 0.35);
  render3D('inside', cam, tg, { fov: 38, vis: 1 - ss(4.15, 4.5, t), rim: 0.45, rimDir: V3(0.3, 0.5, 1), shadowAt: K.p });
}
const printSrc = () => asset('print.jpg');
function shotCard() {
  fillAll('#020306'); ykStars(ss(4.5, 5.2, TT) * (1 - ss(7.9, 8.5, TT)));
  const kIn = TT < 7.9 ? ss(4.7, 5.5, TT) : 1 - ss(7.9, 8.45, TT), kN = TT < 7.9 ? ss(5.4, 6.2, TT) : 1 - ss(7.9, 8.3, TT);
  if (printSrc()) ykCard(printSrc(), 'The Rake', kIn, kN, { y: 320, w: 720, h: 524, pw: 90, seal: '爪' });
}
function shotOutside() {   // the minka in the snow at night; the irori glows through the shōji; cedars, the ridge, the moon
  const Wd = world(), t = TT, k = ss(8.5, 14, t); Wd.paperOut.color.set('#d89a58'); Wd.glow.position.set(HS.eng - 0.6, 0.6, 0.2); Wd.glow.intensity = 1.6;
  const cam = V3(lerp(-12.5, -11.4, k), 1.8, lerp(8.8, 8.0, k)), tg = V3(-2.4, 1.0, 0.3);
  render3D('night', cam, tg, { fov: 52, light: { hemI: 1.3, moonI: 1.2 }, vis: ss(8.5, 8.9, t), moonDir: V3(0.25, 0.42, -1), moonS: 24, rim: 1.0, rimDir: V3(0.3, 0.5, -1), shadowAt: V3(-2, 0, 0), mist: 0.8, snow: 1, snowBox: 10 });
}
function shotWake() {   // I wake: my face on the pillow close, and beyond the futon's end the crouched shape by the moonlit shōji
  const Wd = world(), t = TT; embers(Wd, 0.4); lamp(Wd, 1, 0.6);
  const K = poseRake(Wd, { p: RK_FOOT.clone().add(V3(0.1, 0, 0.05)), yaw: Math.PI + 0.1, lift: 0.0, arch: 0.06, head: { pitch: -0.1, yaw: 0.04 * Math.sin(t * 0.7), roll: 0.12 }, jaw: 0.05, curl: [0.55, 0.5], twitch: 0.6 });
  const cam = V3(0.1, 0.5, lerp(-0.3, -0.2, ss(14, 20, t))), tg = V3(-2.6, 0.28, 0.75);
  keyAt(Wd, V3(-4.6, 1.4, 0.5), K.Hc, 0.7, 0.4);
  render3D('inside', cam, tg, { fov: 38, rim: 0.35, rimDir: V3(0.3, 0.5, 1), shadowAt: K.p });
}
function shotFace() {   // close on its face in the ember light; it tilts its head, and keeps tilting, past where a neck should stop
  const Wd = world(), t = TT; embers(Wd, 0.6); lamp(Wd, 1);
  const roll = 0.15 + 2.35 * jerk(t, 22.8, 24.6, 6), K = poseRake(Wd, { p: RK_FOOT, yaw: Math.PI, lift: 0.04, arch: 0.04, head: { pitch: -0.18, yaw: 0.0, roll }, jaw: 0.06 + 0.08 * ss(24.6, 25.2, t), curl: [0.5, 0.45], twitch: 0.5 });
  const HZ = V3(0, 0, 1).applyQuaternion(K.head.quaternion), cam = K.Hc.clone().add(V3(0, 0.04, 0)).add(V3(HZ.x, 0, HZ.z).normalize().multiplyScalar(1.3)), tg = K.Hc.clone().add(V3(0, -0.26, 0));
  keyAt(Wd, K.Hc.clone().add(V3(-1.6, 0.6, -0.6)), K.Hc, 0.6, 0.3);
  render3D('inside', cam, tg, { fov: 36, rim: 0.45, rimDir: V3(0.6, 0.4, 1), shadowAt: K.Hc, light: { fn: 1, ff: 9 } });
}
const CRAWL = { a: V3(2.35, 0, 1.25), b: V3(1.95, 0, -1.02) };
function crawlPose(Wd, t) {   // crawl from beside the irori to my mother-in-law's head, then bend over her mouth
  const D = CRAWL.b.clone().sub(CRAWL.a), len = D.length(), yaw = Math.atan2(D.x, D.z), s = len * ss(26.6, 30.0, t), dip = 0.22 * ss(30.0, 31.2, t);
  const walking = t < 30.0;
  return poseRake(Wd, { p: walking ? CRAWL.a : CRAWL.a.clone().addScaledVector(D, s / len), yaw, gait: walking, s: walking ? s : 0, lift: -0.02, arch: 0.06, dip, head: { pitch: 0.2 + 0.55 * ss(30.0, 31.4, t), yaw: -0.15 * ss(30.5, 31.5, t), roll: 0.25 * ss(30.4, 31.6, t) }, jaw: 0.1 * ss(30.8, 31.6, t), curl: [0.3, 0.3], twitch: 0.4 });
}
function shotCrawl() {   // across the irori: it crawls to my mother-in-law and bends over her mouth
  const Wd = world(), t = TT; embers(Wd, 2.2); lamp(Wd, 1.0); const K = crawlPose(Wd, t);
  const cam = V3(lerp(-1.4, -1.25, ss(26.6, 32, t)), 1.3, lerp(0.7, 0.6, ss(26.6, 32, t))), tg = V3(1.65, 0.2, -1.2);
  keyAt(Wd, V3(-1.8, 1.8, -1.2), K.Hc, 0.4, 0.5);
  render3D('inside', cam, tg, { fov: 46, rim: 0.3, rimDir: V3(1, 0.5, -0.6), shadowAt: K.p });
}
const TEAR_T = 34.85, PANEL_C = () => V3(HS.xp, 0.0, -1.35 + 2 * 0.9);
function shotMatch() {   // over my shoulder: I strike a match; it turns; it bolts through the paper wall toward the baby's room
  const Wd = world(), t = TT; embers(Wd, 0.6); lamp(Wd, 0.7); Wd.headMe.visible = false; Wd.futMe.kake.visible = false;
  const w = seatWoman(Wd, { x: FUTON.me.x, z: -1.15, F: V3(1, 0, 0.25), pitch: -0.05, look: 0.0, handR: null });
  const strike = ss(32.85, 32.95, t), flare = strike * (1 - ss(33.0, 33.5, t)); matchIn(Wd, strike, flare);
  const leap = ss(34.3, 35.05, t), p0 = CRAWL.b.clone(), pc = PANEL_C();
  if (t < 34.3) { const tw = ss(33.2, 33.5, t), body = ss(33.7, 34.2, t), K0 = crawlPose(Wd, 32);
    poseRake(Wd, { p: K0.p, yaw: lerp(K0.F.x === 0 ? 0 : Math.atan2(K0.F.x, K0.F.z), yawTo(K0.p, pc), body), dip: 0.22 * (1 - body), arch: 0.06, head: { pitch: lerp(0.75, -0.2, tw), yaw: lerp(-0.15, -1.6, tw) * (1 - body), roll: lerp(0.25, 0.4, tw) }, jaw: 0.2 * tw, curl: [0.3, 0.3], twitch: 1 }); }
  else if (t < TEAR_T + 0.05) { const p = p0.clone().lerp(pc.clone().setY(0), leap), yw = yawTo(p0, pc); p.y = 0;
    const up = 0.3 * Math.sin(Math.PI * leap), fw = V3(Math.sin(yw), 0, Math.cos(yw)), sdv = V3(Math.cos(yw), 0, -Math.sin(yw));
    const K = poseRake(Wd, { p, yaw: yw, lift: up, arch: -0.04, head: { pitch: -0.25, yaw: 0, roll: 0.2 }, jaw: 0.3, curl: [0.1, 0.1], twitch: 0,
      hands: [1, -1].map((sd) => p.clone().addScaledVector(fw, 0.78).addScaledVector(sdv, sd * 0.2).add(V3(0, 0.3 + up, 0))),
      feet: [0, 0, 1, -1].map((sd) => (sd ? p.clone().addScaledVector(fw, -0.5).addScaledVector(sdv, sd * 0.22).add(V3(0, 0.2 + up, 0)) : null)) });
    void K; }
  const cam = w.top.clone().add(V3(-0.85, 0.25, 0.32)), tg = V3(2.0, 0.4, -1.1);
  render3D('inside', cam, tg, { fov: 42, rim: 0.5, rimDir: V3(1, 0.5, 0), shadowAt: V3(0.5, 0, -0.8) });
}
function shotRun() {   // I run after it with the match held up; it gutters out at the torn panel
  const Wd = world(), t = TT; embers(Wd, 0.5); lamp(Wd, 0.5); Wd.headMe.visible = false; Wd.futMe.kake.visible = false;
  const O = V3(-0.4, 0, -0.95), D = V3(2.85, 0, 0.15).sub(O), w = walkWoman(Wd, { O, D, s: Math.min(D.length() - 0.3, 1.5 * (t - 37)), pitch: 0.0 });
  const k = 1 - ss(39.4, 39.75, t) * (0.6 + 0.4 * Math.sin(t * 40) ** 2); matchIn(Wd, k);
  const sc = Math.min(D.length() - 0.3, 1.5 * (t - 37)), base = O.clone().addScaledVector(w.F, sc).setY(0.95), cam = base.clone().addScaledVector(w.F, -1.3).add(V3(0.1, 0.5, -1.25)), tg = base.clone().addScaledVector(w.F, 1.4).add(V3(0, 0.25, 0.35));
  render3D('inside', cam, tg, { fov: 56, vis: 1 - ss(39.8, 40.0, t), shadowAt: w.pos });
}
const RK_CRADLE = V3(4.98, 0, 0.6);
function shotHit() {   // THE HIT: the baby's room, the window light: it is crouched over the cradle, claws hooked on the rim; it looks up at me, and speaks
  const Wd = world(), t = TT; const E = Wd.ejiko, c = E.g.position;
  const look = ss(41.3, 41.9, t), hands = [0.5, -0.5].map((a) => V3(c.x + Math.cos(a) * 0.26, E.rimY + 0.06, c.z + Math.sin(a) * 0.26));
  const K = poseRake(Wd, { p: RK_CRADLE, yaw: -Math.PI / 2, lift: 0.02, arch: -0.04, dip: -0.07, hands, handZ: [V3(-1, -0.6, 0.2).normalize(), V3(-1, -0.6, -0.2).normalize()], curl: [0.95, 0.95], twitch: 0.8,
    head: { pitch: lerp(0.65, -0.08, look) + 0.03 * Math.sin(t * 1.1), yaw: 0.05 * Math.sin(t * 0.8), roll: lerp(0.1, 0.32, look) }, jaw: 0.04 + 0.5 * ss(43.4, 43.8, t) * (1 - ss(44.6, 45.2, t)) * (0.75 + 0.25 * Math.sin(t * 23)) });
  const cam = V3(3.3, lerp(0.64, 0.6, ss(40.6, 46, t)), 0.48), tg = K.Hc.clone().add(V3(-0.1, -0.34, 0));
  keyAt(Wd, V3(4.4, 1.35, 3.4), K.Hc.clone().add(V3(0, -0.1, 0)), 2.4 * (0.85 + 0.15 * flick(t, 13)), 0.26);
  render3D('inside', cam, tg, { fov: 44, rim: 0.7, rimDir: V3(1, 0.6, 0.3), shadowAt: c, motes: { p: V3(4.4, 1.1, 2.0), r: 0.7, a: 0.5 }, light: { fn: 2, ff: 12 } });
}
function shotDay() {   // the morning: the torn panel, claw marks on the post and the boards, the priest's old scroll on the floor
  const Wd = world(), t = TT, k = ss(46, 52, t); Wd.scroll.visible = true; keyAt(Wd, V3(3.3, 2.1, 0.3), V3(5.5, 0.7, 0.6), 3.0, 0.9, '#a8bcb8'); Wd.paperOut.color.set('#cfdcd4'); hideRake(Wd);
  const cam = V3(lerp(0.75, 0.95, k), 1.25, lerp(2.15, 2.0, k)), tg = V3(2.55, 0.35, 0.3);
  render3D('day', cam, tg, { fov: 50, vis: ss(46, 46.4, t), moonDir: V3(-1, 0.5, 0.25), shadowAt: V3(1.5, 0, 0.5) });
}
const RK_OUT = V3(-5.0, 0, 0.2);
function shotLast() {   // years later, night: the ofuda on the post; through the moonlit paper, its crouched shape on the engawa, waiting
  const Wd = world(), t = TT; embers(Wd, 0.35); lamp(Wd, 0.6); Wd.ofudaPost.visible = true; Wd.headMe.visible = false; Wd.headMil.visible = false;
  Wd.paperOut.color.set('#b4ccc6'); Wd.paperOut.transparent = true; Wd.paperOut.opacity = 0.38; Wd.toon.get(Wd.rake.skinM).color.set('#1a1e20');
  poseRake(Wd, { p: RK_OUT, yaw: 0, lift: 0.02, arch: 0.08, head: { pitch: -0.1, yaw: 1.1, roll: 0.15 + 0.35 * ss(54, 58, t) }, jaw: 0.04, curl: [0.5, 0.5], twitch: 0.3 });
  const cam = V3(lerp(-3.05, -3.2, ss(52, 62, t)), 0.5, -0.25), tg = V3(-4.5, 0.5, 0.55);
  render3D('inside', cam, tg, { fov: 48, vis: ss(52, 52.4, t) * (1 - ss(61.4, 62, t)), moonDir: V3(-1, 0.5, 0.35), shadowAt: V3(-4.5, 0, 0.5), light: { fog: '#4a6a6a', fn: 2.5, ff: 22, moonI: 0.22 } });
}

const PARA = [
  ['If the end of your futon ever feels heavy in the night, keep your eyes shut. I opened mine.', -1.2, 8.2],
  ['We lived in my husband\'s village, high in the mountains, a day\'s walk from the nearest road.', 9.0, 13.75],
  ['That winter I woke to a weight on my feet. Something was crouched at the end of the futon.', 14.5, 19.75],
  ['I took it for a starving child from the valley. Then its head turned further than a head should.', 20.5, 25.75],
  ['It crawled to my mother-in-law and bent over her mouth, as if it were counting her breaths.', 26.5, 31.75],
  ['I struck a match. It fled, but not outside. It went through the paper wall, toward the baby.', 32.4, 36.75],
  ['I ran after it with nothing but the dying match.', 37.2, 39.9],
  ['It was crouched over the cradle. It looked at me. Then it spoke my name.', 40.9, 45.75],
  ['The priest showed me temple records three hundred years old. The same visitor. The same marks.', 46.5, 51.75],
  ['My child is grown now. It still comes back every winter. It only watches. I think it is waiting for me to close my eyes.', 52.5, 61.4],
];
function sceneTale() {
  const t = TT; fillAll('#020306'); resetWorld(world());
  if (window.DBG_SHOT) window.DBG_SHOT(); else   // debug views only (never set in the piece)
  if (t < 4.5) shotHook(); else if (t < 8.5) shotCard(); else if (t < 14) shotOutside(); else if (t < 20) shotWake(); else if (t < 26) shotFace();
  else if (t < 32) shotCrawl(); else if (t < 37) shotMatch(); else if (t < 40.6) { if (t < 40.0) shotRun(); } else if (t < 46) shotHit(); else if (t < 52) shotDay(); else shotLast();
  PARA.forEach(([s, a, b]) => ykPara(s, a, b, { cy: 1300 }));
  if (t >= 57.2) { const f = () => ykBadge(asset('kodama.jpg'), 'kodamashorts', CX, 290, ss(57.2, 57.9, t) * (1 - ss(61.4, 62, t))); if (DEFER) DEFER.push(f); else f(); }
}
