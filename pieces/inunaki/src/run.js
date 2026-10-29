// =====================================================================
//  RUN — the shots. Everything is posed in world space each frame: the car on the road, my brother walking on planted
//  feet (gait from his distance walked), the villagers standing on the tunnel floor (feet by IK), heads turned with
//  quaternion blends, sickles and flashlights held in the fist (holdProp). Lights and beams follow their sources.
// =====================================================================
const easeOut = (x) => 1 - (1 - x) ** 3;
const fadeWin = (a, b, d = 0.6) => Math.min(ss(a, a + d, TT), 1 - ss(b - d, b, TT));
const DOWN = V3(0, -1, 0), UPV = V3(0, 1, 0);
const qYZ = (Y, Z) => { const f = frameOf(Y, Z); return qBasis(f.Y.clone().cross(f.Z), f.Y, f.Z); };
const yzOf = (q) => ({ Y: V3(0, 1, 0).applyQuaternion(q), Z: V3(0, 0, 1).applyQuaternion(q) });
const slerpYZ = (a, b, k) => yzOf(qYZ(a.Y, a.Z).slerp(qYZ(b.Y, b.Z), clamp(k)));
// a head frame relative to a body basis B: pitch (+ = chin down), yaw (+ = toward the person's left), roll
function headRel(B, pitch, yaw, roll) { const q = qBasis(B.X, B.Y, B.Z).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ'))); return yzOf(q); }
function lookYZ(from, to, roll = 0) { const Z = to.clone().sub(from).normalize(), Y = UPV.clone().addScaledVector(Z, -Z.y).normalize().applyAxisAngle(Z, roll); return { Y, Z }; }

// ---------------------------------------------------------------------
//  lights that follow their sources
// ---------------------------------------------------------------------
function carLights(Wd, k = 1, o = {}) {
  const c = Wd.car; c.updateMatrixWorld(true); const fwd = V3(0, 0, -1).transformDirection(c.matrixWorld);
  [[Wd.headL, Wd.beams.L, -0.5, 0], [Wd.headR, Wd.beams.R, 0.5, 1]].forEach(([s, b, x, gi]) => { const p = c.localToWorld(V3(x, 0.64, -2.42)), d = fwd.clone().add(V3(x * 0.04, o.high ? 0.035 : -0.07, 0)).normalize();
    s.position.copy(p); s.target.position.copy(p.clone().addScaledVector(d, 10)); s.target.updateMatrixWorld(); s.intensity = 7.5 * k * (o.spot ?? 1);
    aimBeam(b, p, d, o.beamLen ?? 26, 0.16 * k * (o.beam ?? 1)); const gl = Wd.glow[gi]; gl.visible = k > 0.1 && (o.glare ?? 0) > 0; gl.position.copy(p.clone().addScaledVector(fwd, 0.05)); gl.scale.setScalar(o.glare ?? 1); gl.material.opacity = clamp(k); });
  Wd.headM.color.set(k > 0.4 ? '#fff4d8' : '#3a3428'); Wd.tailM.color.set(o.brake ? '#ff4a30' : k > 0.4 ? '#a0241a' : '#3a0c08');
  if (o.brake || o.tailLight) { Wd.tail.position.copy(c.localToWorld(V3(0, 0.7, 2.7))); Wd.tail.intensity = o.tailLight ?? 1.2; } else Wd.tail.intensity = 0;
}
// the failing sodium lamp in the hook: on/off spans (irregular, deterministic). mix.py uses the same table for the buzz and clicks.
const LAMP = [[0, 0.42, 1], [0.42, 0.55, 0], [0.55, 0.62, 1], [0.62, 0.95, 0], [0.95, 1.7, 1], [1.7, 1.78, 0], [1.78, 1.86, 1], [1.86, 2.25, 0], [2.25, 3.05, 1], [3.05, 3.12, 0], [3.12, 3.6, 1], [3.6, 3.95, 0], [3.95, 4.5, 1]];
const lampOn = (t) => { const s = LAMP.find(([a, b]) => t >= a && t < b); return s ? s[2] : 0; };
function lamp(Wd, k) { Wd.lampL.intensity = 9 * k * (0.92 + 0.08 * Math.sin(TT * 377)); Wd.lampBulbM.color.set(k > 0.5 ? '#ffd090' : '#3a2a1a'); Wd.lampGlow.visible = k > 0.5; Wd.lampGlow.material.opacity = 0.9 * k; }
function lightsOff(Wd) { lamp(Wd, 0); [Wd.headL, Wd.headR, Wd.flashL, Wd.fill, Wd.tail, ...Wd.lantL].forEach((l) => (l.intensity = 0)); Object.values(Wd.beams).forEach((b) => (b.visible = false)); Wd.glow.forEach((g) => (g.visible = false)); }
function flashOn(Wd, prop, k = 1, o = {}) {
  prop.updateMatrixWorld(true); const tip = prop.localToWorld(prop.userData.tip.clone()), d = V3(1, 0, 0).transformDirection(prop.matrixWorld);
  Wd.flashL.position.copy(tip); Wd.flashL.target.position.copy(tip.clone().addScaledVector(d, 6)); Wd.flashL.target.updateMatrixWorld(); Wd.flashL.intensity = 6 * k * (o.spot ?? 1);
  aimBeam(Wd.beams.F, tip, d, o.len ?? 9, 0.2 * k * (o.beam ?? 1)); prop.userData.lensM.color.set(k > 0.3 ? '#fff4d8' : '#2b2d29');
  const gl = Wd.glow[2]; gl.visible = k > 0.1 && (o.glare ?? 0.35) > 0; gl.position.copy(tip.clone().addScaledVector(d, 0.02)); gl.scale.setScalar(o.glare ?? 0.35); gl.material.opacity = clamp(k);
}

// ---------------------------------------------------------------------
//  per frame: rain round the camera (bright where it crosses a beam), mist, ivy, wheels, lanterns, dogs
// ---------------------------------------------------------------------
function inBeam(p, s) { if (s.intensity <= 0) return 0; const d = p.clone().sub(s.position), L = d.length(), ax = s.target.position.clone().sub(s.position).normalize(), c = d.dot(ax) / Math.max(L, 1e-4); return c > Math.cos(s.angle) ? clamp(1 - L / 26) * ss(Math.cos(s.angle), Math.cos(s.angle * 0.5), c) : 0; }
function animWorld(Wd, t, o = {}) {
  const cam = Wd.cam.position;
  { const P = Wd.rain.geometry.attributes.position, Cc = Wd.rain.geometry.attributes.color, rk = o.rain ?? 1; Wd.rain.visible = rk > 0;
    if (rk > 0) Wd.rainP.forEach((q, i) => { const x = cam.x + q.x, z = cam.z + q.z * 0.8 + 3, y = cam.y + 7 - mod(q.y * 11 + t * 9 * q.v, 11), p = V3(x, y, z);
      const hid = (z < 0.15 && z > FAR_Z - 0.2 && Math.abs(x) < 6 && y < 9) || y < hT(x, z) || (Wd.car.visible && Wd.carBox && Wd.carBox.containsPoint(p));
      if (hid) { P.setXYZ(i * 2, 0, -99, 0); P.setXYZ(i * 2 + 1, 0, -99, 0); return; }
      P.setXYZ(i * 2, x, y, z); P.setXYZ(i * 2 + 1, x - 0.02, y - 0.2, z); const b = Math.max(inBeam(p, Wd.headL), inBeam(p, Wd.headR), inBeam(p, Wd.flashL) * 0.8);
      const c = [lerp(0.16, 0.95, b), lerp(0.22, 0.88, b), lerp(0.24, 0.72, b)].map((v) => v * (0.6 + 0.4 * rk)); Cc.setXYZ(i * 2, ...c); Cc.setXYZ(i * 2 + 1, ...c.map((v) => v * 0.6)); });
    P.needsUpdate = true; Cc.needsUpdate = true; }
  Wd.mist.forEach((s) => { const u = s.userData; s.position.x = u.x + 1.2 * Math.sin(t * 0.08 + u.ph); const dc = s.position.distanceTo(cam) - s.scale.x * 0.5; s.material.opacity = (0.35 + 0.2 * Math.sin(t * 0.3 + u.ph)) * (o.mist ?? 1) * ss(1.0, 5.0, dc); s.visible = s.material.opacity > 0.003; });
  { const I = Wd.ivy, m4 = new THREE.Matrix4(); I.strands.forEach((s) => { for (let k = 0; k < s.n; k++) { const f = k / (s.n - 1), sw = 0.05 * Math.sin(t * 1.3 + s.ph + f * 2) * f, R = RNG('ivyl', s.i0 + k);
      m4.copy(M4c(s.x + sw + R.n(0.06), PORT.top + 0.05 - f * s.L, 0.24 + 0.03 * f + R.n(0.02), R.n(1.2), 1, 1, 1, R.n(0.5), R.n(1.5))); I.m.setMatrixAt(s.i0 + k, m4); } }); I.m.instanceMatrix.needsUpdate = true; }
  Wd.wheels.forEach((w) => (w.rotation.x = -(o.carS ?? 0) / 0.3));
  Wd.wipers.forEach((w, i) => (w.rotation.y = (o.wipe ?? 0) * (0.2 + 1.25 * Math.max(0, Math.sin(t * 2.4))) * (i ? 1 : 1)));
  if (Wd.charm) Wd.charm.rotation.z = 0.15 * Math.sin(t * 3.1) * (o.charm ?? 0.3);
  { const lk = o.lanterns ?? 0; Wd.lantG.forEach((s, i) => { s.material.opacity = lk * (i % 2 ? 0.4 : 0.85) * (0.88 + 0.12 * Math.sin(t * 7.3 + i * 1.7) * Math.sin(t * 3.1 + i)); }); Wd.shojiM.color.set(lk > 0 ? '#9a6a34' : '#2b2219'); }
  Wd.dogs.forEach((d) => { const h = o.howl ? clamp(0.5 + 0.5 * Math.sin(t * 0.9 + d.ph)) : 0; d.neck.rotation.x = -0.35 - 0.75 * h; d.head.rotation.x = -0.3 * h; d.jaw.rotation.x = 0.35 * h; });
}

// ---------------------------------------------------------------------
//  my brother: walking on planted feet; the flashlight in his right hand; he looks back and laughs
// ---------------------------------------------------------------------
function walkBro(Wd, o) {   // o: { O (ground start), D (direction), s (metres walked), look (head yaw), laugh, aim (beam pitch), sw }
  const P = Wd.bro, pd = P.pd, F = o.D.clone().setY(0).normalize(), Lx = UPV.clone().cross(F), s = o.s, L = 0.72, ph = s / L, gy = o.O.y;
  const feet = [], fdir = [];
  [0, 1].forEach((j) => { const oj = j * 0.5, u = ph - oj, n = Math.floor(u), f = u - n, side = j === 0 ? 1 : -1; let sp, lift = 0, pit = 0;
    if (f < 0.38) { const k = ss(0, 1, f / 0.38); sp = lerp((n - 0.32 + oj) * L, (n + 0.68 + oj) * L, k); lift = 0.1 * Math.sin(Math.PI * k); pit = 0.45 * Math.sin(Math.PI * k) * (1 - 2 * k); } else sp = (n + 0.68 + oj) * L;
    const g = o.O.clone().addScaledVector(F, sp).addScaledVector(Lx, side * 0.1); feet.push(g.setY(gy + pd.ank + lift + Math.max(0, pit) * 0.06)); const fz = F.clone().applyAxisAngle(Lx, pit); fdir.push({ Z: fz, Y: UPV.clone().applyAxisAngle(Lx, pit) }); });
  const bob = 0.018 * Math.cos(TAU * 2 * ph), sway = 0.025 * Math.sin(TAU * ph), tw = 0.06 * Math.sin(TAU * ph) + (o.twist ?? 0);
  const pos = o.O.clone().addScaledVector(F, s).addScaledVector(Lx, sway).setY(gy + 0.94 + bob), Fb = F.clone().applyAxisAngle(UPV, tw), U = UPV.clone().addScaledVector(Fb, 0.05).normalize();
  const B = frameOf(U, Fb), top = pos.clone().addScaledVector(B.Y, pd.torso), R = B.X.clone().negate();
  const SL = top.clone().addScaledVector(B.X, pd.shW).addScaledVector(B.Y, -0.035), SR = top.clone().addScaledVector(R, pd.shW).addScaledVector(B.Y, -0.035);
  const swing = Math.sin(TAU * ph) * 0.2 * (o.sw ?? 1);
  const handL = SL.clone().addScaledVector(DOWN, 0.5).addScaledVector(Fb, swing + 0.04).addScaledVector(B.X, 0.04);
  const aim = Fb.clone().multiplyScalar(Math.cos(o.aim ?? 0.22)).addScaledVector(DOWN, Math.sin(o.aim ?? 0.22)).applyAxisAngle(UPV, o.aimYaw ?? 0).normalize();
  const handR = SR.clone().addScaledVector(DOWN, 0.36).addScaledVector(Fb, 0.25 - swing * 0.3).addScaledVector(R, 0.02);
  const YR = R.clone().addScaledVector(aim, -R.dot(aim)).normalize(), hdR = { Y: YR, Z: aim.clone().cross(YR) };
  const head = headRel(B, o.pitch ?? 0.12, o.look ?? 0, o.roll ?? 0);
  poseP(P, { pos, U, F: Fb, head, hands: [handL, handR], hdir: [{ Z: DOWN.clone().addScaledVector(Fb, 0.2), Y: B.X.clone() }, hdR], epole: [B.X.clone().multiplyScalar(0.3).addScaledVector(Fb, -1), R.clone().multiplyScalar(0.6).addScaledVector(Fb, -0.4).addScaledVector(DOWN, 0.5)],
    feet, fdir, kpole: Fb.clone().addScaledVector(UPV, 0.2), curl: [0.45, 0], grip: [false, true], breath: Math.sin(TT * 2.2), laugh: o.laugh });
  holdProp(P, 1, Wd.flash); return P;
}

// ---------------------------------------------------------------------
//  the villagers: standing (feet on the floor by IK), arms hanging to the knees, a sickle in the right fist
// ---------------------------------------------------------------------
// o: { at (ground point), F (facing), lean, crouch (0..1), head ({ Y, Z } world), lift (0..1 sickle raised), reachR (world wrist target + frame), breath, twitch, eye }
function standV(P, o) {
  const pd = P.pd, t = TT, ph = (P.o.seed ?? 0) * 1.37, F = o.F.clone().setY(0).normalize(), Lx = UPV.clone().cross(F), gy = o.at.y, cr = o.crouch ?? 0;
  const lean = Math.min(1.3, (o.lean ?? 0.14) + 0.02 * Math.sin(t * 0.5 + ph) + cr * 0.85), U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)).normalize(), Fc = F.clone().multiplyScalar(Math.cos(lean)).addScaledVector(UPV, -Math.sin(lean)).normalize();
  const pos = o.at.clone().addScaledVector(Lx, 0.015 * Math.sin(t * 0.4 + ph)).addScaledVector(F, -0.06 - cr * 0.28).setY(gy + (pd.thigh + pd.shin) * 0.975 + pd.ank + 0.03 - cr * 0.6 + 0.008 * Math.sin(t * 1.5 + ph));
  const B = frameOf(U, Fc), R = B.X.clone().negate(), top = pos.clone().addScaledVector(B.Y, pd.torso);
  const S = [top.clone().addScaledVector(B.X, pd.shW).addScaledVector(B.Y, -0.035), top.clone().addScaledVector(R, pd.shW).addScaledVector(B.Y, -0.035)];
  const hang = (i) => S[i].clone().addScaledVector(DOWN, 0.9).addScaledVector(F, 0.1 + cr * 0.2).addScaledVector(i ? R : B.X, 0.05).add(V3(0.01 * Math.sin(t * 0.7 + ph + i), 0, 0.01 * Math.cos(t * 0.6 + ph + i)));
  let hL = hang(0), hdL = { Z: DOWN.clone().addScaledVector(F, 0.15), Y: B.X.clone() }; let cL = 0.5; const lant = P.lantern && o.lantern !== false && !o.crouch;
  if (lant) { hL = hL.addScaledVector(F, 0.16).addScaledVector(UPV, 0.22).addScaledVector(B.X, 0.02); hdL = { Z: DOWN.clone(), Y: B.X.clone() }; } if (hL.y < gy + 0.34) { const k2 = clamp((gy + 0.34 - hL.y) / 0.3); hL.y = Math.max(hL.y, gy + 0.075); hL.y = lerp(gy + 0.34 - (gy + 0.34 - hL.y), gy + 0.075, k2) ; cL = 0.5 * (1 - k2) - 0.12 * k2; hdL = slerpYZ(hdL, { Z: F.clone().addScaledVector(B.X, 0.3).normalize(), Y: UPV.clone() }, Math.min(1, k2 * 2.5)); }
  const k = clamp(o.lift ?? 0), hangR = hang(1), up = S[1].clone().addScaledVector(F, 0.42).addScaledVector(UPV, -0.24).addScaledVector(R, 0.1);
  let hR = hangR.clone().lerp(up, k), hdR = slerpYZ({ Y: R.clone(), Z: DOWN.clone() }, { Y: F.clone().addScaledVector(UPV, -0.4).normalize(), Z: B.X.clone() }, k), epR = R.clone().multiplyScalar(0.4).addScaledVector(F, -1).lerp(R.clone().multiplyScalar(0.7).addScaledVector(DOWN, 0.6), k);
  if (k > 0 && k < 1) hR = hR.addScaledVector(F, 0.15 * Math.sin(Math.PI * k));
  if (o.reachR) { hR = o.reachR.W; hdR = o.reachR.dir; epR = R.clone().multiplyScalar(0.6).addScaledVector(UPV, 0.4); }
  const feet = [o.at.clone().addScaledVector(Lx, 0.12).addScaledVector(F, 0.04 + cr * 0.05).setY(gy + pd.ank), o.at.clone().addScaledVector(Lx, -0.12).addScaledVector(F, -0.03 + cr * 0.05).setY(gy + pd.ank)];
  poseP(P, { pos, U, F: Fc, head: o.head || headRel(B, 0.5, 0, 0.3), hands: [hL, hR], hdir: [hdL, hdR], epole: [B.X.clone().multiplyScalar(0.4).addScaledVector(F, -1), epR], feet, kpole: F.clone().addScaledVector(UPV, 0.15),
    curl: [cL, o.curlR ?? 0.5], grip: [!!lant, o.grip !== false], gripK: [1, o.gripK ?? 1], breath: Math.sin(t * 1.9 + ph) * (o.breath ?? 0.7), twitch: o.twitch ?? 0.4, eye: o.eye });
  if (o.grip !== false && P.sickle && !o.noSickle) holdProp(P, 1, P.sickle); else if (P.sickle) P.sickle.visible = false;
  if (P.lantern) { const L = P.lantern; [L.g, L.body, L.cord, L.glow].forEach((m) => (m.visible = !!lant)); if (lant) { holdProp(P, 0, L.g); const tip = L.g.localToWorld(L.tip.clone()), sw = V3(0.03 * Math.sin(t * 1.3 + ph), 0, 0.03 * Math.cos(t * 1.1 + ph)), c = tip.clone().add(V3(0, -0.28, 0)).add(sw);
    L.body.position.copy(c); L.body.rotation.set(sw.z * 2, 0, -sw.x * 2); between(L.cord, tip, c.clone().add(V3(0, 0.18, 0)), 0.004); L.glow.position.copy(c); } }
  return { B, top };
}

// ---------------------------------------------------------------------
function resetWorld(Wd) {
  Wd.bro.g.visible = false; Wd.vill.forEach((P) => { P.g.visible = false; P.sickle.visible = false; if (P.lantern) [P.lantern.g, P.lantern.body, P.lantern.cord, P.lantern.glow].forEach((m) => (m.visible = false)); }); Wd.car.visible = false; Wd.flash.visible = false; Wd.flashNew.visible = false; Wd.flashOld.forEach((f) => (f.visible = false));
  Wd.blocks.visible = true; Wd.blockScars.visible = false; lightsOff(Wd); Wd.carBox = null;
}
function render3D(preset, pos, tgt, o = {}) {
  const Wd = world(), { r, cv } = rend();
  setLight(Wd, Object.assign({}, LIGHT[preset], o.light || {}));
  if (window.DBG_CAM) { pos = window.DBG_CAM[0]; tgt = window.DBG_CAM[1]; o.fov = window.DBG_CAM[2] ?? o.fov; }   // debug views only (never set in the piece)
  Wd.cam.fov = o.fov ?? 50; Wd.cam.position.copy(pos); Wd.cam.up.set(0, 1, 0); Wd.cam.lookAt(tgt); if (o.roll) Wd.cam.rotateZ(o.roll); Wd.cam.updateProjectionMatrix(); Wd.cam.updateMatrixWorld(true);
  if (Wd.car.visible) { Wd.car.updateMatrixWorld(true); Wd.carBox = new THREE.Box3().setFromObject(Wd.car).expandByScalar(0.05); }
  animWorld(Wd, TT, o);
  { const c = o.shadowAt || tgt; Wd.moon.position.copy(c).add(V3(-16, 30, 12)); Wd.moon.target.position.copy(c); Wd.moon.target.updateMatrixWorld(); }
  Wd.glow[3].visible = !!o.farGlow; if (o.farGlow) { Wd.glow[3].position.set(0, 2.2, FAR_Z - 0.6); Wd.glow[3].scale.set(6, 5, 1); Wd.glow[3].material.opacity = o.farGlow; }
  [Wd.bro, ...Wd.vill].forEach((P) => updateTails(P, Wd.cam));
  if (o.mirror) { const M = o.mirror; Wd.mcam.position.copy(M.pos); Wd.mcam.fov = M.fov; Wd.mcam.up.set(0, 1, 0); Wd.mcam.lookAt(M.pos.clone().add(M.dir)); Wd.mcam.updateProjectionMatrix(); Wd.mcam.updateMatrixWorld(true);
    Wd.mirrorG.visible = false; r.setRenderTarget(Wd.mirrorRT); r.render(Wd.scene, Wd.mcam); r.setRenderTarget(null); Wd.mirrorG.visible = true; }
  r.render(Wd.scene, Wd.cam);
  ykBlit(cv, { vis: o.vis ?? 1 });
}

// ---------------------------------------------------------------------
//  the shots
// ---------------------------------------------------------------------
const CAR_PARK = V3(0, 0, 9.2);
const HOOK_AT = V3(-0.45, 0, 2.15);
function shotOpen() {   // HOOK: under a failing sodium lamp at the sealed mouth, the tall wrapped figure tilts its head, lifts it and raises the sickle
  const Wd = world(), t = TT, V = Wd.vill[10]; placeCar(Wd, CAR_PARK.x, CAR_PARK.z, 0); Wd.car.visible = false; carLights(Wd, 0.3, { beam: 0.6, high: true, spot: 0.12 }); Wd.headM.color.set('#3a3428'); lamp(Wd, lampOn(t));
  const cam = V3(lerp(-0.55, -0.5, ss(0, 4.5, t)), lerp(1.5, 1.55, ss(0, 4.5, t)), lerp(5.9, 5.55, ss(0, 4.5, t)));
  const lift = easeOut(ss(0.5, 2.0, t)), tilt = 0.55 * (1 - ss(0.3, 1.3, t)) - 0.42 * ss(1.4, 2.6, t) + 0.08 * Math.sin(t * 1.3), pitch = lerp(0.85, -0.12, lift) + 0.05 * ss(2.6, 4.2, t);
  const Fv = V3(0, 0, 1), Bp = frameOf(UPV.clone().addScaledVector(Fv, 0.14).normalize(), Fv), look = lookYZ(V3(HOOK_AT.x, 2.45, HOOK_AT.z), cam, -tilt * 0.6), rel = headRel(Bp, pitch, 0.12 * (1 - lift), tilt);
  standV(V, { at: HOOK_AT, F: Fv, lean: 0.12 + 0.06 * ss(2.4, 4.5, t), head: slerpYZ(rel, look, lift * 0.85), lift: easeOut(ss(1.0, 3.2, t)) * 0.85, eye: cam, breath: 1.2, twitch: 0.8 });
  render3D('night', cam, V3(-0.42, 2.12, 2.15), { vis: 1 - ss(4.15, 4.5, t), fov: 52, mist: 0.6, light: { hemI: 0.22, moonI: 0.14 } });
}
const printSrc = () => asset('print.jpg');
function shotCard() {
  fillAll('#020306'); ykStars(ss(4.5, 5.2, TT) * (1 - ss(8.3, 8.9, TT)));
  const kIn = TT < 8.3 ? ss(4.8, 5.6, TT) : 1 - ss(8.3, 8.9, TT), kN = TT < 8.3 ? ss(5.5, 6.3, TT) : 1 - ss(8.3, 8.7, TT);
  ykCard(printSrc(), 'Inunaki', kIn, kN, { y: 320, w: 720, h: 540, pw: 90, seal: '犬' });
}
function roadCar(z) { const dx = (XC(z + 0.05) - XC(z - 0.05)) / 0.1, n = Math.hypot(dx, 1), side = V3(-1 / n, 0, dx / n); return { x: XC(z) + side.x * 1.45, z: z + side.z * 1.45, ry: Math.atan2(dx, 1) }; }
const CAR_STOP = 14.3;   // the car rolls in from the cut and stops here (tyres + brake on this frame in mix.py)
function shotRoad() {   // the old road at night; the car rounds the bend; then behind it, the headlights on the sealed mouth
  const Wd = world(), t = TT;
  if (t < 13.5) { const k = (t - 9) / 4.5, z = lerp(44, 21.5, k), c = roadCar(z); placeCar(Wd, c.x, c.z, c.ry); carLights(Wd, 1, { glare: 2.2, beamLen: 24 });
    const cam = V3(XC(14) - 3.5 + 0.1 * k, 1.05, 13.6 - 0.3 * k), tg = V3(XC(31) - 0.5, 0.3, 31);
    render3D('night', cam, tg, { vis: ss(9, 9.5, t), fov: 50, carS: z * -1, wipe: 0, shadowAt: V3(c.x, 0, c.z) }); return; }
  const u = clamp((t - 13.5) / (CAR_STOP - 13.5)), cz = CAR_PARK.z + 2.0 * (1 - u) * (1 - u); placeCar(Wd, CAR_PARK.x, cz, 0); carLights(Wd, 1, { brake: t < CAR_STOP + 0.6, tailLight: 0.8 });
  const k = (t - 13.5) / 4.5; render3D('night', V3(lerp(1.5, 1.3, k), lerp(2.5, 2.4, k), lerp(16.0, 15.2, k)), V3(-0.1, 1.25, 1.0), { fov: 46, carS: -cz });
}
const SIGN_C = V3(3.95, 1.55, 2.55), SIGN_N = V3(-Math.sin(0.42), 0, Math.cos(0.42));
function shotSign() {   // the sign beside the blocks: a flashlight beam finds it; then close enough to read
  const Wd = world(), t = TT; placeCar(Wd, CAR_PARK.x, CAR_PARK.z, 0); carLights(Wd, 1, { tailLight: 0.8 });
  // the brother's flashlight, off-screen to the left: a beam that sweeps onto the board and stays
  const src = V3(0.6, 1.25, 5.4), aimP = SIGN_C.clone().add(V3(lerp(-2.6, 0, easeOut(ss(18.2, 19.6, t))) + 0.08 * Math.sin(t * 1.7), -0.08 + 0.05 * Math.sin(t * 1.3), 0)); Wd.flash.visible = true; Wd.flash.position.copy(src); Wd.flash.lookAt(aimP); Wd.flash.rotateY(-Math.PI / 2); flashOn(Wd, Wd.flash, 1, { glare: 0, len: 5.5 }); Wd.flash.visible = false;
  if (t < 22.5) { const k = (t - 18) / 4.5, cam = SIGN_C.clone().addScaledVector(SIGN_N, lerp(4.4, 3.9, k)).add(V3(-1.0, 0.15, 0.3)); render3D('night', cam, SIGN_C.clone().add(V3(-0.45, -0.45, -0.3)), { fov: 50 }); return; }
  const k = (t - 22.5) / 4.5, cam = SIGN_C.clone().addScaledVector(SIGN_N, lerp(3.05, 2.85, k)).add(V3(0, -0.12, 0)); render3D('night', cam, SIGN_C.clone().add(V3(0, -0.5, 0)), { fov: 50 });
}
function shotWalk() {   // my brother laughs, walking backwards toward the open mouth (the blocks are gone); then he turns and goes in, into the dark
  const Wd = world(), t = TT; Wd.blocks.visible = false; Wd.blockScars.visible = true; placeCar(Wd, CAR_PARK.x, CAR_PARK.z, 0); carLights(Wd, 1, { tailLight: 0.8 });
  if (t < 29.6) { const k = (t - 27) / 2.6, cam = V3(lerp(-1.25, -1.15, k), lerp(1.55, 1.6, k), lerp(8.0, 7.7, k));
    walkBro(Wd, { O: V3(0.15, 0, 4.4), D: V3(0, 0, 1), s: -0.62 * (t - 27), look: -0.22 + 0.1 * Math.sin(t * 3), laugh: t > 27.3, pitch: -0.05 + 0.06 * Math.sin(t * 9), aim: 0.5, aimYaw: 0.5 * Math.sin(t * 1.9), sw: 0.6 });
    flashOn(Wd, Wd.flash, 1, { len: 6, glare: 0.3 });
    render3D('night', cam, V3(0.05, 1.2, 2.0), { fov: 50 }); return; }
  const s = 0.82 * (t - 29.6) + 0.2; walkBro(Wd, { O: V3(0.2, 0, 2.2), D: V3(-0.02, 0, -1), s, aim: 0.16, aimYaw: 0.25 * Math.sin(t * 0.8) });
  flashOn(Wd, Wd.flash, 1, { len: 10 });
  const P = Wd.bro, F = V3(-0.02, 0, -1).normalize(), b = P.T.position, cam = b.clone().addScaledVector(F, -2.7).add(V3(0.32, 0.0, 0)).setY(2.0);
  render3D('tunnel', cam, b.clone().addScaledVector(F, 6).setY(0.55), { fov: 54, light: { hemI: 0.22 }, rain: b.z > 0.5 ? 1 : 0.3 });
}
function shotFar() {   // far down the tunnel he walks on; the far end glows with lanterns; then at the far mouth: the drowned village, dogs howling
  const Wd = world(), t = TT; Wd.blocks.visible = false; Wd.blockScars.visible = true;
  if (t < 40.5) { const k = (t - 36) / 4.5; walkBro(Wd, { O: V3(0.1, 0, -28.5), D: V3(0, 0, -1), s: 0.95 * (t - 36) + 0.2, aim: 0.12, aimYaw: 0.15 * Math.sin(t * 0.7) }); flashOn(Wd, Wd.flash, 1, { len: 11, glare: 0 });
    const bz = Wd.bro.T.position.z; [0, 1, 2].forEach((i) => { const p = LANTS[[0, 9, 1][i]]; Wd.lantL[i].position.copy(p); Wd.lantL[i].intensity = 3.0; Wd.lantL[i].distance = 16; });
    render3D('tunnel', V3(0.6, 1.75, bz + 6.5), V3(0.0, 1.35, bz - 30), { fov: 48, farGlow: 0.45, lanterns: 1, rain: 0, light: { hemI: 0.24, fog: '#1a3036', fn: 34, ff: 150, sky: 1.4, bg: '#1f3c44' } }); return; }
  const k = (t - 40.5) / 4.5; walkBro(Wd, { O: V3(-0.1, 0, -78.6), D: V3(0.0, 0, -1), s: 1.1 * (t - 40.5) + 0.4, aim: 0.3, sw: 0.7 }); flashOn(Wd, Wd.flash, 0.8, { len: 8, glare: 0 });
  [0, 1, 2].forEach((i) => { const p = LANTS[[0, 9, 1][i]]; Wd.lantL[i].position.copy(p); Wd.lantL[i].intensity = 2.2; Wd.lantL[i].distance = 14; });
  render3D('village', V3(lerp(0.5, 0.4, k), lerp(1.75, 1.7, k), lerp(-74.4, -75.2, k)), V3(-0.05, 1.45, -95), { fov: 50, lanterns: 1, howl: true, vis: 1 - ss(44.3, 45.0, t), shadowAt: V3(0, 0, -90) });
}
const VILL_AT = [[-1.86, -7.6], [-1.86, -10.9], [-1.86, -14.2], [-1.86, -17.5], [-1.86, -20.8], [1.86, -9.3], [1.86, -12.6], [1.86, -15.9], [1.86, -19.2], [1.86, -22.5]];
function shotReveal() {   // they stand in the dark along both walls; all at once, every head turns to me
  const Wd = world(), t = TT; Wd.blocks.visible = false; Wd.blockScars.visible = true; placeCar(Wd, CAR_PARK.x, CAR_PARK.z, 0); Wd.car.visible = false; carLights(Wd, 1, { beam: 0.7, beamLen: 30, spot: 0.6 });
  const close = t >= 50.5, cam = close ? V3(lerp(-1.42, -1.47, (t - 50.5) / 4.5), lerp(2.18, 2.22, (t - 50.5) / 4.5), lerp(-6.25, -6.4, (t - 50.5) / 4.5)) : V3(0.1, lerp(1.32, 1.36, ss(45.6, 50.5, t)), lerp(-4.3, -4.9, ss(45.6, 50.5, t)));
  const turn = easeOut(ss(45.85, 46.25, t));
  let li = 0; VILL_AT.forEach(([x, z], i) => { const P = Wd.vill[i], R = RNG('vpose', i), tw = R.n(0.45), Fv = V3(-Math.sign(x), 0, 0).applyAxisAngle(UPV, tw), lean = R.r(0.06, 0.36), Bp = frameOf(UPV.clone().addScaledVector(Fv, lean).normalize(), Fv), hp = V3(x - Math.sign(x) * 0.1, 2.5 * P.pd.torso / 0.8, z);
    const roll = R.n(0.55) + (i === 0 ? 0.3 + (close ? 0.3 * ss(51.5, 53.5, t) : 0) : 0), rel = headRel(Bp, R.r(0.45, 0.85) + 0.05 * Math.sin(t * 0.6 + i), R.n(0.3), R.n(0.4)), look = lookYZ(hp, cam, roll);
    standV(P, { at: V3(x + R.n(0.04), 0.01, z + R.n(0.25)), F: Fv, lean, head: slerpYZ(rel, look, turn * R.r(0.8, 0.95)), lift: close && i === 0 ? 0.55 * easeOut(ss(52.0, 54.2, t)) : (P.lantern ? 0 : R.r(0, 0.25)), eye: cam, twitch: 0.6, noSickle: !!P.lantern });
    if (P.lantern && li < 3) { const l = Wd.lantL[li++]; l.position.copy(P.lantern.body.position); l.intensity = 1.4; l.distance = 6; } });
  if (!close) render3D('tunnel', cam, V3(0.0, 2.15, -14), { fov: 50, shadowAt: V3(0, 0, -12), rain: 0, light: { hemI: 0.12 } });
  else render3D('tunnel', cam, Wd.vill[0].H.position.clone().add(V3(0, -0.06, 0)), { fov: 40, shadowAt: V3(0, 0, -8), rain: 0, light: { hemI: 0.12 } });
}
const MOUTH_V = V3(0.0, 0.01, -0.45), FLASH_G = V3(-0.3, 0.0, 0.18);
function shotMirror() {   // I run out to the car; in the mirror: his flashlight on the ground, still lit, and a wrapped hand picks it up
  const Wd = world(), t = TT; Wd.blocks.visible = false; Wd.blockScars.visible = true;
  if (t < 59) { placeCar(Wd, CAR_PARK.x, CAR_PARK.z, 0); carLights(Wd, 1, { glare: 1.5, beamLen: 22 });
    const k = ss(55, 58.8, t), run = TAU * 1.6 * (t - 55), back = ss(56.85, 57.15, t) * (1 - ss(57.55, 57.85, t));
    const cam = V3(lerp(0.2, 0.85, k) + 0.05 * Math.sin(run * 0.5), 1.58 + 0.05 * Math.abs(Math.sin(run)), lerp(-4.6, 6.0, k));
    const fwd = V3(0.55, 1.05, 9.6), bk = V3(-0.3, 1.9, -8);
    // what I left behind: two of them standing in the mouth, lit by the headlights
    [[Wd.vill[0], V3(-1.1, 0.01, -2.9)], [Wd.vill[5], V3(1.25, 0.01, -4.6)]].forEach(([P, at], i) => standV(P, { at, F: V3(0, 0, 1), head: lookYZ(at.clone().setY(2.45), cam, i ? 0.2 : -0.25), lift: 0.3 * i, eye: cam }));
    render3D('night', cam, fwd.clone().lerp(bk, back), { fov: 54, roll: 0.03 * Math.sin(run * 0.5) + 0.06 * back, mist: 0.6 }); return; }
  // low at the mouth, looking in: his flashlight lies on the wet asphalt, still lit; a wrapped hand comes down, closes on it,
  // lifts it; the beam swings up at us. Our car's tail lights pull away behind the camera (red on the ground).
  const u = t - 59, cam = FLASH_G.clone().add(V3(lerp(0.3, 0.22, ss(59, 64, t)), lerp(0.88, 0.84, ss(59, 64, t)), lerp(1.12, 1.0, ss(59, 64, t))));
  Wd.tail.position.set(0.9, 0.7, 4.5 + 1.2 * u * u * 0.4); Wd.tail.intensity = 2.2 * (1 - ss(60, 64, t)) + 0.4; Wd.tail.distance = 14;
  const V = Wd.vill[10], fold = ss(60.3, 61.6, t) * (1 - 0.25 * ss(62.2, 63.4, t)), grabbed = t >= 61.6, Fv = V3(0.1, 0, 1).normalize();
  const fq = new THREE.Quaternion().setFromAxisAngle(UPV, 0.35);
  if (!grabbed) { Wd.flash.visible = true; Wd.flash.position.copy(FLASH_G).setY(Wd.flashR * 1.9); Wd.flash.quaternion.copy(fq); Wd.flash.updateMatrixWorld(true); }
  const X = V3(1, 0, 0).applyQuaternion(fq), Yh = UPV.clone(), G = gripFit(V), handFrame = { Y: Yh, Z: X.clone().cross(Yh) };
  const wristAtFlash = (p) => { const q = qYZ(handFrame.Y, handFrame.Z); return p.clone().sub(G.c.clone().applyQuaternion(q)); };
  const reach = ss(60.6, 61.6, t), lift = Math.pow(clamp((t - 61.6) / 1.3), 0.75), aimUp = ss(62.9, 63.6, t);
  const fp = Wd.flash.position.clone(), restW = wristAtFlash(FLASH_G.clone().setY(Wd.flashR * 1.9));
  standV(V, { at: MOUTH_V, F: Fv, crouch: 1.4 * fold, head: lookYZ(V3(0, 2.0 - fold * 0.9, -0.2), fp.clone().lerp(cam, aimUp), 0.2), eye: grabbed ? cam : fp, noSickle: true, curlR: lerp(0.5, 0.05, reach), grip: grabbed ? undefined : false, gripK: grabbed ? clamp((t - 61.6) / 0.4) : 0,
    reachR: reach > 0 ? { W: (() => { const Sx = V.arm[1].S || V3(-0.2, 2.0, -0.2); const hang = Sx.clone().add(V3(0, -0.9, 0.15)); if (!grabbed) return hang.lerp(restW, reach); const top = V3(-0.3, 0.36, 0.3), aimW = V3(-0.24, 0.42, 0.42); return restW.clone().lerp(top, easeOut(lift)).lerp(aimW, aimUp); })(), dir: handFrame } : null });
  if (grabbed) { holdProp(V, 1, Wd.flash); if (aimUp > 0) { const q = V.arm[1].hand.getWorldQuaternion(new THREE.Quaternion()), target = cam.clone().sub(Wd.flash.position).normalize(), cur = V3(1, 0, 0).applyQuaternion(q); Wd.flash.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(cur, cur.clone().lerp(target, aimUp).normalize())); } }
  V.sickle.visible = false; Wd.fill.position.copy(Wd.flash.position).add(V3(0.2, 0.5, 0.45)); Wd.fill.intensity = 1.6; Wd.fill.distance = 4;
  flashOn(Wd, Wd.flash, 1, { len: 5, glare: 0.3 + 0.35 * aimUp, beam: 0.8 + 0.3 * aimUp, spot: 1 - 0.6 * ss(0.3, 1, aimUp) });
  render3D('night', cam, FLASH_G.clone().add(V3(-0.02, -0.2, 0.12)), { fov: 50, rain: 0.7, mist: 0.4, light: { hemI: 0.7 } });
}
function shotToday() {   // today: by day the tunnel is sealed again; on the ground at the entrance, a lit flashlight
  const Wd = world(), t = TT, k = ss(64, 67.6, t) * 0.92 + 0.08 * clamp((t - 64) / 7);
  Wd.flashNew.visible = true; Wd.flashNew.position.set(0.55, 0.035, 2.05); Wd.flashNew.rotation.set(0, 2.5, 0); flashOn(Wd, Wd.flashNew, 1, { len: 3, glare: 0.45, beam: 0.8 });
  Wd.flashOld.forEach((f, i) => { const R = RNG('oldf', i); f.visible = true; f.position.set(-0.6 + i * 0.55 + R.n(0.1), 0.03, 1.75 + R.n(0.25)); f.rotation.set(0, R.r(0, TAU), 0); f.scale.setScalar(0.95); });
  render3D('day', V3(lerp(1.8, 1.05, k), lerp(1.8, 0.9, k), lerp(9.0, 4.7, k)), V3(lerp(0.0, 0.45, k), lerp(1.5, -0.25, k), lerp(0.5, 1.75, k)), { fov: 50, vis: ss(64, 64.6, t) * (1 - ss(70, 71, t)), rain: 0.4, mist: 0.7 });
}

const PARA = [
  ['My brother drove us to the old Inunaki tunnel on his eighteenth birthday. Only one of us came home.', 0.4, 8.85],
  ['The new road took everyone around the mountain. The old tunnel was sealed with concrete blocks.', 9.5, 17.75],
  ['By the entrance, a hand-painted sign: “Beyond this point, the law of Japan does not apply.”', 18.4, 26.75],
  ['My brother laughed and walked in with the flashlight. The blocks were gone.', 27.4, 35.75],
  ['At the far end there were paper lanterns, and dogs howling, and a village that was flooded in 1994.', 36.4, 44.6],
  ['They were standing in the dark on both sides, and all of them turned to look at me.', 46.3, 54.75],
  ['I ran. Behind me, his flashlight lay on the ground, and a wrapped hand picked it up.', 55.4, 63.75],
  ['Every year on his birthday, someone leaves a lit flashlight at the entrance.', 64.6, 70.6],
];
function sceneTale() {
  const t = TT; fillAll('#020306'); resetWorld(world());
  if (window.DBG_SHOT) window.DBG_SHOT(); else   // debug views only (never set in the piece)
  if (t < 4.5) shotOpen(); else if (t < 9) shotCard(); else if (t < 18) shotRoad(); else if (t < 27) shotSign(); else if (t < 36) shotWalk();
  else if (t < 45.6) { if (t < 45.0) shotFar(); } else if (t < 55) shotReveal(); else if (t < 64) shotMirror(); else shotToday();
  PARA.forEach(([s, a, b]) => ykPara(s, a, b, { cy: 1300 }));
  if (t >= 66.2) { const f = () => ykBadge(asset('kodama.jpg'), 'kodamashorts', CX, 290, ss(66.2, 66.9, t) * (1 - ss(70.4, 71, t))); if (DEFER) DEFER.push(f); else f(); }
}
