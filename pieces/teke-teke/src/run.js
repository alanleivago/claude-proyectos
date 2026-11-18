// =====================================================================
//  RUN — the shots. The boys are posed by walkP (stand / walk / run); the girl by world points (wallLean, crawlSt,
//  clingSt); the crossing lamps alternate and throw a pulsing red light (Wd.red) on the snow.
// =====================================================================
const easeOut = (x) => 1 - (1 - x) ** 3;
const DOWN = V3(0, -1, 0), UPV = V3(0, 1, 0);
const yzOf = (q) => ({ Y: V3(0, 1, 0).applyQuaternion(q), Z: V3(0, 0, 1).applyQuaternion(q) });
function headRel(B, pitch, yaw, roll) { const q = qBasis(B.X, B.Y, B.Z).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ'))); return yzOf(q); }

function animWorld(Wd, t) {
  WIND.value = t; const cam = Wd.cam.position;
  Wd.sky.position.copy(cam); Wd.ridges.forEach((m) => m.position.set(cam.x, cam.y + m.userData.y - 30, cam.z));
  const fw = V3(0, 0, -1).applyQuaternion(Wd.cam.quaternion);
  [[Wd.snowF, 18, 10, 3.5], [Wd.snowN, 3, 3, 1.6]].forEach(([S, B, Hh, ahead]) => { const P = S.geometry.attributes.position, c = cam.clone().addScaledVector(fw, ahead);
    S.userData.q.forEach((q, i) => { const dx = 0.25 * Math.sin(t * 0.7 + q.ph) + t * 0.35, x = c.x + mod(q.x * B + dx - c.x, B) - B / 2 + (c.x - mod(c.x, B)) * 0 , y = cam.y - Hh / 2 + mod(q.y * Hh - t * q.v * 0.85, Hh), z = c.z + mod(q.z * B + 0.15 * Math.cos(t * 0.6 + q.ph) - c.z, B) - B / 2;
      P.setXYZ(i, x, y, z); }); P.needsUpdate = true; });
}
function lightsOff(Wd) { [Wd.lamp, Wd.key, Wd.fill, Wd.bounce, Wd.red, Wd.headL, Wd.rim].forEach((l) => (l.intensity = 0)); Wd.glows.forEach((g) => (g.visible = false)); Wd.wglows.forEach((g) => (g.visible = false)); }
function resetWorld(Wd) {
  [Wd.me, Wd.ken].forEach((P) => (P.g.visible = false)); Wd.girl.g.visible = false; Wd.train.visible = false; Wd.smear.count = 0; Wd.prints.count = 0; Wd.bagGirl.visible = false; Wd.bagKenta.visible = false; lightsOff(Wd); [Wd.puff, Wd.blast, Wd.streaks, ...Wd.tglow].forEach((m) => (m.visible = false));
  Wd.cross.forEach((C) => { C.lamps.forEach((L) => (L.m.material.emissiveIntensity = 0)); C.pv.rotation.z = C.face * Math.PI / 2; });
  Wd.ken.setFear(0); Wd.me.setFear(0);
}
// the crossing: lamps alternate (a, b), the bell rings, the barrier arms come down (armK 0 up → 1 down). Returns the red pulse 0..1
function crossing(Wd, t, I = 1, armK = 0) {
  const ph = mod(t * 1.15, 1), A = ss(0, 0.05, ph) * (1 - ss(0.44, 0.5, ph)), B = ss(0.5, 0.55, ph) * (1 - ss(0.94, 1, ph)); let gi = 0;
  Wd.cross.forEach((C, ci) => { C.pv.rotation.z = C.face * Math.PI / 2 * (1 - armK); C.g.updateMatrixWorld(true);
    C.lamps.forEach((L) => { const k = (L.sd < 0 ? A : B) * I; L.m.material.emissiveIntensity = 2.6 * k; if (k > 0.3 && gi < 4) { const g = Wd.glows[gi++]; g.visible = true; g.position.copy(L.m.getWorldPosition(V3(0, 0, 0))); g.scale.setScalar(0.9 * k); g.material.opacity = k; } }); });
  const k = Math.max(A, B) * I, lp = Wd.cross[0].g.localToWorld(V3((A > B ? -1 : 1) * 0.36, 2.2, -0.35)); Wd.red.position.copy(lp); Wd.red.intensity = 5.5 * k; Wd.red.distance = 10; return { k, A, B };
}
function streetLamp() {}
function streetLampOld(Wd, i, I = 1) { const p = Wd.lampsXZ[i], K = Wd.key; K.color.set('#ffd8a0'); K.position.copy(p).add(V3(0, -0.1, 0)); K.target.position.copy(p).setY(0).add(V3(0.3, 0, -0.5)); K.target.updateMatrixWorld(); K.intensity = 6 * I; K.angle = 0.75; K.penumbra = 0.7; K.distance = 16; K.decay = 1.2;
  const g = Wd.wglows[0]; g.visible = true; g.position.copy(p).add(V3(0, -0.12, 0)); g.scale.setScalar(0.9); g.material.opacity = 0.9; }
function render3D(preset, pos, tgt, o = {}) {
  const Wd = world(), { r, cv } = rend();
  setLight(Wd, Object.assign({}, LIGHT[preset], o.light || {}));
  if (window.DBG_CAM) { pos = window.DBG_CAM[0]; tgt = window.DBG_CAM[1]; o.fov = window.DBG_CAM[2] ?? o.fov; }   // debug views only (never set in the piece)
  Wd.cam.fov = o.fov ?? 50; Wd.cam.position.copy(pos); Wd.cam.up.set(0, 1, 0); Wd.cam.lookAt(tgt); if (o.roll) Wd.cam.rotateZ(o.roll); Wd.cam.updateProjectionMatrix(); Wd.cam.updateMatrixWorld(true);
  animWorld(Wd, TT); Wd.snowF.visible = Wd.snowN.visible = o.snow !== false; Wd.snowF.material.opacity = Wd.snowN.material.opacity = o.snowA ?? 0.9;
  { const c = o.shadowAt || tgt, md = (o.moonDir || V3(-0.4, 0.6, 0.5)).clone().normalize(); Wd.moon.position.copy(c).addScaledVector(md, 60); Wd.moon.target.position.copy(c); Wd.moon.target.updateMatrixWorld(); }
  if (o.rim) { Wd.rim.intensity = o.rim; const c = o.shadowAt || tgt, rd = (o.rimDir || V3(0, 0.5, -1)).clone().normalize(); Wd.rim.position.copy(c).addScaledVector(rd, 60); Wd.rim.target.position.copy(c); Wd.rim.target.updateMatrixWorld(); }
  const night = preset === 'night'; setLamps(Wd, o.lampAt || tgt, TT, night ? 1 : 0, !!o.lampCool);
  if (night) { Wd.rim.intensity *= 0.3; }
  if (o.fill) { Wd.fill.color.set(o.fill.c || '#9ab8b4'); Wd.fill.position.copy(pos).add(o.fill.off || V3(0, 0.3, 0)); Wd.fill.intensity = o.fill.I * (night ? 0.3 : 1); Wd.fill.distance = o.fill.d ?? 6; }
  r.render(Wd.scene, Wd.cam);
  ykBlit(cv, { vis: o.vis ?? 1 });
}

// ---------------------------------------------------------------------
//  the boys: walkP — a real gait. Each foot is locked to the ground in stance (heel strike → flat → toe-off), swings
//  in an arc, and the pelvis height follows the stance legs (straight-ish, a little bob); the pelvis turns, the shoulders
//  tilt, the arms counter-swing, the head stays level. o: { O, D, s, run, stride, plant (stand), stopAt, stopK, look,
//  pitch, lean, hands, gf, breathR }
// ---------------------------------------------------------------------
function gaitFeet(P, o, s) {
  const pd = P.pd, F = o.D.clone().setY(0).normalize(), Lx = UPV.clone().cross(F), gf = o.gf || gT, run = !!o.run, stride = o.stride ?? (run ? 1.6 : 1.24), duty = run ? 0.4 : 0.62, c = s / stride, out = [];
  [0, 1].forEach((j) => { const side = j === 0 ? 1 : -1, a = c + 0.5 * j + duty / 2, ph = mod(a, 1), n = Math.floor(a), plantX = (n - 0.5 * j) * stride, lat = Lx.clone().multiplyScalar(side * 0.095);
    let x, lift = 0, pit = 0, stance = false;
    if (ph < duty) { stance = true; x = plantX; const ho = ss(duty * 0.7, duty, ph), hs = 1 - ss(0, duty * 0.15, ph); pit = 0.55 * ho - 0.22 * hs; }
    else { const k = (ph - duty) / (1 - duty), ke = ss(0, 1, k); x = lerp(plantX, plantX + stride, ke); lift = (run ? 0.24 : 0.1) * Math.sin(Math.PI * Math.min(1, k * 1.1)); pit = lerp(0.55, -0.22, ss(0, 0.85, k)); }
    const base = o.O.clone().addScaledVector(F, x).add(lat), gy = gf(base.x, base.z); let ank = base.clone().setY(gy + pd.ank + lift);
    if (pit > 0 && (stance || lift < 0.03)) { ank.addScaledVector(F, 0.13 - 0.13 * Math.cos(pit)); ank.y += 0.13 * Math.sin(pit); }   // toe pivot
    out.push({ ank, pit, stance, F, Lx }); });
  return out;
}
function walkP(P, o) {
  const pd = P.pd, F0 = o.D.clone().setY(0).normalize(), Lx = UPV.clone().cross(F0), gf = o.gf || gT, legL = pd.thigh + pd.shin, run = !!o.run, stand = !!o.plant;
  const s = o.s ?? 0, stride = o.stride ?? (run ? 1.6 : 1.24), c = s / stride;
  let feet, pos;
  const Ff = o.fixD ? o.fixD.clone().normalize() : F0, Lf = UPV.clone().cross(Ff), standFeet = (sc) => [0, 1].map((j) => { const side = j ? -1 : 1, b = o.O.clone().addScaledVector(Ff, sc + (o.plant ? o.plant[j] : 0.03 * side)).addScaledVector(Lf, side * 0.1); return { ank: b.setY(gf(b.x, b.z) + pd.ank), pit: 0, stance: true }; });
  if (stand) feet = standFeet(0);
  else if (o.stopAt !== undefined) { const A = gaitFeet(P, o, o.stopAt), B = standFeet(o.stopAt + 0.05), k = ss(0, 1, o.stopK); feet = A.map((fa, j) => { const fb = B[j], d = fa.ank.distanceTo(fb.ank); return { ank: fa.ank.clone().lerp(fb.ank, k).add(V3(0, d > 0.05 ? 0.08 * Math.sin(Math.PI * k) : 0, 0)), pit: lerp(fa.pit, 0, k), stance: true }; }); }
  else feet = gaitFeet(P, o, s);
  const sb = stand ? 0 : o.stopAt !== undefined ? o.stopAt + 0.05 * ss(0, 1, o.stopK) : s, sway = stand || o.stopAt !== undefined ? 0 : 0.016 * Math.sin(TAU * c);
  const base = o.O.clone().addScaledVector(F0, sb).addScaledVector(Lx, sway), gy0 = gf(base.x, base.z);
  let hip = gy0 + pd.ank + legL * (run ? 0.9 : 0.975);
  feet.forEach((f) => { if (!f.stance && !stand) return; const d = Math.hypot(f.ank.x - base.x, f.ank.z - base.z) , m = Math.sqrt(Math.max(0, (legL * 0.993) ** 2 - d * d)); hip = Math.min(hip, f.ank.y + m); });
  if (run && !feet.some((f) => f.stance)) hip += 0.035;   // flight
  pos = base.setY(hip + 0.03);
  const yaw = stand ? 0 : (run ? 0.1 : 0.07) * Math.sin(TAU * c), F = F0.clone().applyAxisAngle(UPV, yaw), lean = o.lean ?? (run ? 0.24 : 0.05), roll = stand ? 0 : 0.03 * Math.sin(TAU * c);
  const U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)).applyAxisAngle(F, roll).normalize();
  const B = frameOf(U, F), top = pos.clone().addScaledVector(B.Y, pd.torso), R = B.X.clone().negate();
  const rel = feet.map((f) => (f.ank.clone().sub(pos)).dot(F0));   // how far forward each foot is
  const SL = top.clone().addScaledVector(B.X, pd.shW), SR = top.clone().addScaledVector(R, pd.shW);
  const armAt = (S, sd, fwd) => run ? S.clone().addScaledVector(DOWN, 0.27).addScaledVector(F0, 0.08 + clamp(fwd, -0.3, 0.3)).add(V3(0, Math.max(0, fwd) * 0.35, 0)).addScaledVector(sd > 0 ? B.X : R, 0.04)
    : S.clone().addScaledVector(DOWN, 0.5).addScaledVector(F0, 0.04 + clamp(fwd, -0.22, 0.22)).addScaledVector(sd > 0 ? B.X : R, 0.05);
  const hL = o.hands ? o.hands[0] : armAt(SL, 1, stand ? 0 : -rel[0] * (run ? 0.5 : 0.55)), hR = o.hands ? o.hands[1] : armAt(SR, -1, stand ? 0 : -rel[1] * (run ? 0.5 : 0.55));
  const hz = F0.clone().applyAxisAngle(UPV, o.look ?? 0); hz.y = -(o.pitch ?? 0.04); const head = o.head || { Y: UPV.clone().addScaledVector(hz, 0.05).applyAxisAngle(hz.clone().normalize(), o.roll ?? 0), Z: hz.normalize() };
  poseP(P, { pos, U, F, head, hands: [hL, hR], hdir: [{ Z: DOWN.clone().addScaledVector(F0, run ? 0.6 : 0.15), Y: B.X.clone() }, { Z: DOWN.clone().addScaledVector(F0, run ? 0.6 : 0.15), Y: R.clone() }],
    epole: [B.X.clone().addScaledVector(F0, -0.8), R.clone().addScaledVector(F0, -0.8)], feet: feet.map((f) => f.ank), fdir: feet.map((f) => ({ Z: F0.clone().applyAxisAngle(Lx, f.pit), Y: UPV.clone().applyAxisAngle(Lx, f.pit) })),
    kpole: F0.clone().addScaledVector(UPV, 0.1), curl: o.curl || [0.45, 0.45], grip: [false, false], breath: Math.sin(TT * (o.breathR ?? 2.4)) });
  if (P.scarfTail) P.scarfTail.rotation.x = -0.12 - (run ? 0.55 : stand ? 0 : 0.12) - 0.08 * Math.sin(TT * (run ? 9 : 3.1)) * (stand ? 0.4 : 1);
  return { P, B, top, pos, F: F0, feet };
}
const ZME = WZ + 0.6, ZKEN = WZ + 1.15;   // their lanes on the footpath

// ---------------------------------------------------------------------
//  the girl: every pose is a function of HER time (stop-motion held, stutT) and gets a head velocity for the hair lag
// ---------------------------------------------------------------------
function girl(Wd, fn, t, extra = {}) { const tq = stutT(t), A = fn(tq), Bq = fn(tq - 0.08); A.vel = A.head.p.clone().sub(Bq.head.p).divideScalar(0.08); A.t = tq; Object.assign(A, extra); const G = poseGirl(Wd, A);
  const L = Wd.bounce, hp = G.head.position, cam = Wd.cam.position; L.color.set('#86a8b8'); L.position.copy(hp).add(V3(0, 0.45, 0)).addScaledVector(A.head.Z.clone().setY(0).normalize(), 0.5); L.intensity = extra.cool ?? 1.1; L.distance = 2.2; L.decay = 1.5; void cam; return G; }
// leaning over the wall at x: the long torso hangs behind it, elbows on the top, forearms and fingers spread down the face;
// lift 0 = the head hangs face-down over the edge, 1 = it looks out; roll = the tilt of the head
function wallLean(x, t, o = {}) {
  const lean = o.lean ?? 0, lift = o.lift ?? 0.7, J = jerk(t, o.seed ?? 1, o.jk ?? 0.6);
  const chest = V3(x, WT + 0.15 + 0.04 * lean, WZ - 0.1 + 0.08 * lean), waist = V3(x - 0.02, WT - 0.44 + 0.18 * lean, WZ - 0.6 + 0.32 * lean);
  const hp = chest.clone().add(V3(J.side, -0.03 + 0.12 * lift, 0.15 + 0.02 * lift)), look = (o.look || V3(0, -0.2, 1)).clone().normalize().applyAxisAngle(UPV, J.yaw * 0.6);
  const Z = V3(0, -0.85, 0.45).normalize().lerp(look, lift).normalize(), Y = V3(0, 0.35, 0.95).normalize().lerp(V3(0, 1, 0.1), lift).normalize();
  const arms = [1, -1].map((sd, i) => { const dig = o.dig ? o.dig[i] : 0, E = V3(x + sd * 0.25, WT + 0.032, WZ - 0.085), W = V3(x + sd * 0.29, WT - 0.4 - 0.02 * dig, WZ + 0.045);
    return { E, W, hand: { Z: V3(sd * -0.1, -1, 0.06), Y: V3(0, 0.05, 1), curl: 0.05 + 0.08 * dig, spread: 1.15, tap: o.tap ?? 0.7 } }; });
  return { chest, waist, N: V3(0, 1, -0.4), head: { p: hp, Y, Z }, roll: (o.roll ?? 0) + J.roll * (o.jr ?? 1), side: 0, arms, gy: null, F: V3(0, 0, 1), open: 0 };
}
// the crawl: K = mkCrawl(...) schedule along path(s)
function crawlSt(K, path, t, o = {}) {
  const c = crawlAt(K, t), { p, F } = path(c.s), X = V3(-F.z, 0, F.x), g = (q) => gT(q.x, q.z), J = jerk(t, o.seed ?? 3, o.jk ?? 1);
  const chest = p.clone(); chest.y = g(p) + 0.2 + (c.drag ? -0.015 : 0); const wp = p.clone().addScaledVector(F, -0.6), waist = wp.clone(); waist.y = g(wp) + 0.085;
  const hp = chest.clone().addScaledVector(F, 0.1).add(V3(0, 0.03, 0)), look = F.clone().add(V3(0, 0.22 + J.pitch * 0.5, 0)).applyAxisAngle(UPV, J.yaw * 0.7).normalize();
  const arms = [1, -1].map((sd, i) => { const h = c.hands[i], pe = path(h.s), Xe = V3(-pe.F.z, 0, pe.F.x), W = pe.p.clone().addScaledVector(Xe, sd * 0.25); W.y = g(W) + 0.035 + 0.2 * h.lift;
    return { W, hand: { Z: pe.F.clone().add(V3(0, h.lift > 0 ? 0.35 : -0.04, 0)), Y: V3(0, 1, 0).addScaledVector(pe.F, 0.15), curl: h.lift > 0 ? 0.15 : 0.26, spread: 1.25, tap: h.lift > 0 ? 0 : (o.tap ?? 0.55) } }; });
  return { chest, waist, N: V3(0, 1, 0).addScaledVector(F, -0.25), head: { p: hp, Y: V3(0, 1, 0).addScaledVector(F, 0.55), Z: look }, roll: J.roll + (o.roll ?? 0), side: J.side, arms, gy: gT, F, open: 0, s: c.s, crawl: c };
}
function kickSnow(Wd, K, path, t) {   // snow kicked up where each hand plants (the end of its reach), and under the dragged waist
  const P = Wd.puff.geometry.attributes.position; let n = 0; Wd.puff.visible = true;
  K.C.forEach((c, ci) => [0, 1].forEach((j) => { const tp = c.t + (j + 1) * c.r, age = t - tp; if (age < 0 || age > 0.45) return; const pe = path(c.s + K.R), Xe = V3(-pe.F.z, 0, pe.F.x), E = pe.p.clone().addScaledVector(Xe, (j ? -1 : 1) * 0.25); E.y = gT(E.x, E.z);
    for (let k = 0; k < 24 && n < 400; k++) { const h1 = hsh(ci * 31 + k + j * 7, 2), h2 = hsh(ci * 17 + k * 3 + j, 5), h3 = hsh(ci * 7 + k * 11 + j, 9); P.setXYZ(n++, E.x + (h1 - 0.5) * 1.2 * age, E.y + (0.5 + 1.1 * h3) * age - 4.9 * age * age + 0.02, E.z + (h2 - 0.5) * 1.2 * age); } }));
  const c = crawlAt(K, t); if (c.drag) { const pp = path(c.s - 0.6).p; for (let k = 0; k < 50 && n < 400; k++) { const age = ((t * 3 + hsh(k, 4)) % 1) * 0.3; P.setXYZ(n++, pp.x + (hsh(k, 6) - 0.5) * 0.35, gT(pp.x, pp.z) + 0.7 * age * hsh(k, 7) - 2 * age * age + 0.02, pp.z + (hsh(k, 8) - 0.5) * 0.35); } }
  for (; n < 400; n++) P.setXYZ(n, 0, -999, 0); P.needsUpdate = true;
}
const lerpV = (a, b, k) => a.clone().lerp(b, k);
function lerpSt(A, B, k, arc = 0) {   // blend two poses (points lerp, a little up-arc mid-way)
  const up = V3(0, arc * Math.sin(Math.PI * k), 0), L = (a, b) => lerpV(a, b, k).add(up);
  return { chest: L(A.chest, B.chest), waist: L(A.waist, B.waist).add(V3(0, arc * 0.6 * Math.sin(Math.PI * k), 0)), N: lerpV(A.N, B.N, k), head: { p: L(A.head.p, B.head.p), Y: lerpV(A.head.Y, B.head.Y, k), Z: lerpV(A.head.Z, B.head.Z, k) }, roll: lerp(A.roll, B.roll, k), side: 0,
    arms: A.arms.map((a, i) => { const b = B.arms[i]; return { W: L(a.W, b.W), hand: { Z: lerpV(a.hand.Z, b.hand.Z, k), Y: lerpV(a.hand.Y, b.hand.Y, k), curl: lerp(a.hand.curl, b.hand.curl, k), spread: 1.2, tap: 0 } }; }), gy: k > 0.5 ? gT : null, F: B.F, open: 0 };
}
// clinging to Kenta's back: chest behind his right shoulder, her face beside his, long arms over his shoulders, hands spread on his chest
function clingSt(K, t, o = {}) {
  const P = Wd_().ken, F = K.F, Rr = UPV.clone().cross(F).negate(), top = K.top, hp0 = P.H.position, J = jerk(t, 7, o.jk ?? 0.25);
  const chest = top.clone().addScaledVector(F, -0.2).addScaledVector(Rr, 0.1).add(V3(0, 0.02, 0)), waist = chest.clone().addScaledVector(F, -0.08).add(V3(0, -0.55, 0)).addScaledVector(Rr, -0.04);
  const near = o.near ?? 1, hp = hp0.clone().addScaledVector(Rr, lerp(0.27, 0.19, near)).addScaledVector(F, -0.03).add(V3(0, -0.02, 0));
  const look = F.clone().addScaledVector(Rr, -0.25 * near).add(V3(0, -0.04, 0)).normalize();
  const tight = o.tight ?? 0, arms = [
    { E: top.clone().addScaledVector(Rr, 0.2).addScaledVector(F, -0.04).add(V3(0, 0.08, 0)), W: top.clone().addScaledVector(Rr, 0.08).addScaledVector(F, 0.14).add(V3(0, -0.24, 0)), hand: { Z: V3(0, -1, 0).addScaledVector(Rr, -0.45), Y: F.clone(), curl: 0.3 + 0.35 * tight, spread: 1.25, tap: 0.3 } },
    { E: top.clone().addScaledVector(Rr, -0.21).addScaledVector(F, -0.09).add(V3(0, 0.06, 0)), W: top.clone().addScaledVector(Rr, -0.09).addScaledVector(F, 0.13).add(V3(0, -0.28, 0)), hand: { Z: V3(0, -1, 0).addScaledVector(Rr, 0.45), Y: F.clone(), curl: 0.3 + 0.35 * tight, spread: 1.25, tap: 0.25 } } ];
  return { chest, waist, N: F.clone().negate(), head: { p: hp, Y: V3(0, 1, 0).addScaledVector(Rr, 0.12), Z: look }, roll: (o.roll ?? -0.25) + J.roll, side: J.side * 0.5, arms, gy: null, F, open: o.open ?? 0 };
}
const Wd_ = () => world();
// her path in the chase: along the footpath toward the crossing
const GX7 = -14 + 1.1 * (28.1 - 20.6) - 2.0, CX0 = GX7 + 0.3;
const chasePath = (s) => ({ p: V3(CX0 + s, 0, WZ + 0.55 + 0.42 * ss(0, 4, s) + 0.08 * Math.sin(s * 0.4)), F: V3(1, 0, 0.032 * Math.cos(s * 0.4) + 0.105 * (ss(0, 4, s + 0.05) - ss(0, 4, s)) / 0.05).normalize() });
const KCH = mkCrawl(39.4, 0, ['med', 'burst', 'burst', 'burst', 'burst', 'burst', 'slow', 'burst', 'burst', 'burst', 'burst', 'burst']);
// the trail in beat 4: along the snow between the rails, away from the crossing
const railPath = (s) => ({ p: V3(XC - 2.5 - s, 0, TZ - 0.95 + 0.1 * Math.sin(s * 0.35)), F: V3(-1, 0, -0.035 * Math.cos(s * 0.35)).normalize() });

// ---------------------------------------------------------------------
//  the shots
// ---------------------------------------------------------------------
const GX = 9.6;   // where she leans over the wall in the hook
function shotHook() {   // she leans over the snowy wall top, face hidden in wet hair, one eye; the red crossing light flashes on her; the lamp above stutters
  const Wd = world(), t = TT, cr = crossing(Wd, t + 0.3, 1, 0);
  girl(Wd, (tq) => wallLean(GX, tq, { lift: 0.55 + 0.25 * ss(0.3, 1.2, tq), roll: -0.25, jk: 1, lean: ss(0.2, 4.5, tq) * 0.5, dig: [ss(0.4, 1.4, tq), ss(0.7, 1.7, tq)], tap: ss(0.3, 0.8, tq), look: V3(-0.2, -0.3, 1) }), t);
  Wd.lamp.position.copy(Wd.red.position); Wd.lamp.target.position.set(GX, WT + 0.2, WZ); Wd.lamp.target.updateMatrixWorld(); Wd.red.intensity *= 0.12; Wd.lamp.intensity = 4 * cr.k; Wd.lamp.angle = 0.13; Wd.lamp.penumbra = 0.6; Wd.lamp.distance = 8;
  const cam = V3(GX - 0.18 + 0.04 * ss(0, 4.5, t), 1.98, WZ + 1.25 - 0.08 * ss(0, 4.5, t)), tg = V3(GX - 0.02, 1.9, WZ);
  render3D('night', cam, tg, { fov: 46, fill: { I: 0.35, d: 3, c: '#7aa6aa', off: V3(-0.5, 0.6, 0) }, rim: 0.9, rimDir: V3(0.2, 0.7, -1), moonDir: V3(-0.3, 0.7, -0.6), vis: 1 - ss(4.2, 4.5, t), lampAt: V3(GX, 0, WZ) });
}
const printSrc = () => asset('print.jpg');
function shotCard() {
  fillAll('#020306'); ykStars(ss(4.5, 5.2, TT) * (1 - ss(7.9, 8.5, TT)));
  const kIn = TT < 7.9 ? ss(4.7, 5.5, TT) : 1 - ss(7.9, 8.45, TT), kN = TT < 7.9 ? ss(5.4, 6.2, TT) : 1 - ss(7.9, 8.3, TT);
  ykCard(printSrc(), 'Teke Teke', kIn, kN, { y: 320, w: 720, h: 600, pw: 96, seal: '脚' });
}
function shotTown() {   // the snowy crossing at night; a girl's school bag dropped in the snow by the rails
  const Wd = world(), t = TT, k = ss(8.5, 14.6, t); Wd.bagGirl.visible = true; streetLamp(Wd, 1, 1);
  const cam = V3(lerp(XC - 6.6, XC - 6.0, k), lerp(1.75, 1.6, k), lerp(TZ + 1.9, TZ + 1.6, k)), tg = V3(XC - 2.8, 0.3, TZ - 1.0);
  render3D('night', cam, tg, { fov: 50, vis: ss(8.5, 8.9, t), fill: { I: 0.4, d: 6, c: '#e8a860', off: V3(6, 2, -1.5) }, rim: 0.6, rimDir: V3(0.3, 0.6, -1) });
}
function shotMarks() {   // empty tracks: elbow drag marks in the snow between the rails, leading away into the fog
  const Wd = world(), t = TT, k = ss(14.6, 20.6, t); layTrail(Wd, railPath, 0, 30, { w: 0.2 }); streetLamp(Wd, 1, 0.8);
  const cam = V3(XC - 1.6 - 1.4 * k, 1.0, TZ + 0.1), tg = V3(XC - 9 - 1.4 * k, 0.1, TZ - 0.8);
  render3D('night', cam, tg, { fov: 50, fill: { I: 0.5, d: 5, c: '#9ab8b4', off: V3(0, 1, 0) }, rim: 0.5 });
}
const xb5 = (t) => -14 + 1.1 * (t - 20.6);   // the boys' x while walking (beats 5–6)
function boysWalk(Wd, t, o = {}) {
  const x = o.x ?? xb5(t), s = o.s ?? 1.1 * (t - 20.6);
  const a = walkP(Wd.me, Object.assign({ O: V3(x - s, 0, ZME), D: V3(1, 0, 0), s, pitch: 0.08, look: o.lookMe ?? 0.12 }, o.me || {}));
  const b = walkP(Wd.ken, Object.assign({ O: V3(x - s + 0.25, 0, ZKEN), D: V3(1, 0, 0), s: s + 0.31, pitch: 0.05, look: o.lookKen ?? -0.15 }, o.ken || {}));
  return [a, b];
}
function shotWalk() {   // Kenta and I walk home along the line after cram school
  const Wd = world(), t = TT, x = xb5(t); boysWalk(Wd, t); streetLamp(Wd, 0, 1);
  const cam = V3(xb5(23.6) + 0.6, 1.0, 3.9), tg = V3(x + 0.45, 0.3, -0.55);
  render3D('night', cam, tg, { fov: 50, fill: { I: 0.45, d: 7, c: '#9ab8b4', off: V3(0, 1, -1) }, rim: 0.7, rimDir: V3(0.2, 0.6, -1), shadowAt: V3(x, 0, -0.5) });
}
const XSTOP = xb5(28.1);
function shotHear() {   // teke, teke: they stop (a last half step), turn and look back; there is nothing behind them
  const Wd = world(), t = TT, s0 = 1.1 * (28.1 - 20.6);
  if (t < 28.1) boysWalk(Wd, t); else if (t < 28.5) {
    walkP(Wd.me, { O: V3(-14, 0, ZME), D: V3(1, 0, 0), stopAt: s0, stopK: ss(28.1, 28.5, t), pitch: 0.06 });
    walkP(Wd.ken, { O: V3(-13.75, 0, ZKEN), D: V3(1, 0, 0), stopAt: s0 + 0.31, stopK: ss(28.1, 28.5, t), pitch: 0.04 }); }
  else { const turn = ss(28.5, 29.6, t), Dm = V3(Math.cos(Math.PI * 0.62 * turn), 0, -Math.sin(Math.PI * 0.62 * turn) * 0.6), Dk = V3(Math.cos(Math.PI * 0.66 * turn), 0, Math.sin(Math.PI * 0.66 * turn) * 0.5);
    walkP(Wd.me, { O: V3(-14 + s0 + 0.05, 0, ZME), D: Dm, fixD: V3(1, 0, 0), plant: [0.03, -0.03], pitch: 0.02, look: 0.6 * turn, lean: 0.02 });
    walkP(Wd.ken, { O: V3(-13.75 + s0 + 0.36, 0, ZKEN), D: Dk, fixD: V3(1, 0, 0), plant: [0.03, -0.03], pitch: 0.0, look: -0.6 * turn, lean: 0.02 }); }
  const cam = V3(XSTOP + 5.6, 1.9, ZME + 0.8), tg = V3(XSTOP - 1.6, 0.0, ZME + 0.1);
  render3D('night', cam, tg, { fov: 50, fill: { I: 0.4, d: 6, c: '#9ab8b4', off: V3(0, 1, 0) }, rim: 0.6, rimDir: V3(-0.6, 0.6, -0.4) });
}
function shotWall() {   // a girl leaning over the wall: her head hangs, lifts slowly, tilts 90°; then she drags herself over and the blouse hangs empty
  const Wd = world(), t = TT;
  walkP(Wd.me, { O: V3(XSTOP, 0, ZME), D: V3(-0.5, 0, -0.4), plant: [0.1, -0.1], pitch: -0.12, look: 0.1, lean: -0.04 });
  walkP(Wd.ken, { O: V3(XSTOP + 0.25, 0, ZKEN), D: V3(-0.8, 0, -0.35), plant: [-0.08, 0.12], pitch: -0.15, look: -0.1, lean: -0.08 }); Wd.ken.setFear(0.6); Wd.me.setFear(0.6);
  girl(Wd, (tq) => wallLean(GX7, tq, { lift: ss(33.4, 36.4, tq), roll: 1.5 * easeOut(ss(35.2, 37.2, tq)), jk: 0.35, jr: 0.5, lean: 0.3 + 1.9 * easeOut(ss(35.8, 38.4, tq)), dig: [0.5 + 0.5 * Math.sin(tq * 3), 0.5 + 0.5 * Math.sin(tq * 2.3 + 1.4)], tap: 0.6, look: V3(0.55, -0.2, 0.85), seed: 5 }), t);
  const cam = V3(GX7 + 1.3, 1.6, WZ + 2.0), tg = V3(GX7 - 0.05, 1.66, WZ);
  render3D('night', cam, tg, { fov: 50, fill: { I: 0.5, d: 6, c: '#9ab8b4', off: V3(0, 1, 0) }, rim: 0.8, rimDir: V3(-0.3, 0.6, -1) });
}
// the chase: Kenta runs for the crossing; she drops off the wall and comes after him on her elbows, faster than he can run
const FREEZE = KCH.t1, LUNGE = 44.72, KSPD = (CX0 + KCH.s1 + 1.2 - (XSTOP + 0.25)) / (FREEZE - 38.6);
const kenS = (t) => KSPD * Math.max(0, t - 38.6);
function chaseSt(tq) {   // her pose in the chase: the drop, the crawl, the freeze, the lunge
  if (tq < 39.4) { const k = easeOut(ss(38.6, 39.4, tq)); return lerpSt(wallLean(GX7, tq, { lean: 2.2, lift: 1, roll: 1.2, look: V3(1, -0.4, 0.4) }), crawlSt(KCH, chasePath, 39.4), k, 0.25); }
  if (tq < FREEZE) return crawlSt(KCH, chasePath, tq, { tap: 0.7 });
  const fr = crawlSt(KCH, chasePath, FREEZE - 1e-3, { jk: 0 }); if (tq < LUNGE) return fr;   // frozen solid
  const k = easeOut(ss(LUNGE, 44.95, tq)), kx = XSTOP + 0.25 + kenS(tq) - 0.35, d = kx - fr.chest.x, up = V3(d * k, 0.75 * Math.sin(Math.PI * 0.6 * k), 0);
  ['chest', 'waist'].forEach((n) => fr[n].add(up.clone().multiplyScalar(n === 'waist' ? 0.8 : 1))); fr.head.p.add(up).add(V3(0, 0.1 * k, 0)); fr.head.Z = V3(1, 0.5 * k, 0).normalize();
  fr.arms.forEach((a) => { a.W = fr.chest.clone().add(V3(0.75, 0.35 * k, a.W.z - fr.chest.z)); a.hand.Z = V3(1, 0.3, 0); a.hand.curl = 0.55; }); fr.gy = gT; return fr;
}
function shotChase() {
  const Wd = world(), t = TT, cr = crossing(Wd, t, 1, ss(43.0, 44.6, t) * 0.5);
  walkP(Wd.ken, { O: V3(XSTOP + 0.25, 0, ZKEN), D: V3(1, 0, 0), s: kenS(t), run: true, stride: 1.55, pitch: 0.1, look: t < 39.6 ? -1.0 * (1 - ss(38.8, 39.6, t)) : -0.5 * ss(42, 42.3, t) * (1 - ss(42.8, 43.2, t)) });
  Wd.ken.setFear(1);
  const G = girl(Wd, chaseSt, t); if (t >= 39.4) { const sNow = crawlAt(KCH, Math.min(stutT(t), FREEZE - 1e-3)).s; layTrail(Wd, chasePath, 0, sNow - 0.6, { fade: 0.4 }); kickSnow(Wd, KCH, chasePath, stutT(t)); }
  const gp = G.st.chest.clone().setY(0), kx = Wd.ken.T.position.x; let cam, tg;
  if (t < 39.4) { cam = V3(-3.6, 0.9, 2.9); tg = V3(gp.x + 0.5, -0.05, WZ + 0.6); }
  else if (t < 43.3) { const cp = chasePath(crawlAt(KCH, t).s).p; cam = V3(cp.x + 1.35, 0.72, cp.z + 1.3); tg = V3(cp.x + 0.1, 0.0, cp.z + 0.1); }
  else { const cp = chasePath(crawlAt(KCH, Math.min(t, FREEZE)).s).p, mx = (cp.x + kx) / 2 + 0.1, dist = clamp((kx - cp.x) * 1.4 + 1.8, 3.6, 6.0); cam = V3(mx, 0.9 + 0.08 * dist, cp.z + dist); tg = V3(mx, 0.12, cp.z + 0.1); }
  render3D('night', cam, tg, { fov: t < 39.4 ? 52 : 48, fill: { I: 0.6, d: 5, c: '#9ab8b4', off: V3(0, 0.8, 0) }, rim: 0.8, rimDir: V3(0.2, 0.6, -1), shadowAt: gp, vis: 1 - ss(44.9, 45.0, t), lampAt: gp });
  void cr;
}
const KH = V3(XC - 0.75, 0, TZ - 1.0);   // where she catches him: on the road, a step before the rails
function shotHit() {   // THE HIT: her face right by his, in the pulsing red light; she whispers
  const Wd = world(), t = TT, cr = crossing(Wd, t, 0.35, 0.5);
  Wd.ken.setFear(1);
  const K = walkP(Wd.ken, { O: KH, D: V3(-1, 0, 0.12), plant: [0.1, -0.12], lean: 0.1, pitch: 0.02, look: 0.1 + 0.03 * Math.sin(t * 9), roll: 0.06, breathR: 9 });
  girl(Wd, (tq) => clingSt(K, tq, { near: easeOut(ss(45.6, 48.5, tq)), tight: ss(46, 50, tq), roll: lerp(-0.15, -0.4, ss(46.5, 50, tq)), open: ss(46.4, 50.6, tq) }), t);
  Wd.lamp.position.copy(Wd.red.position); Wd.lamp.target.position.copy(K.top).add(V3(0, 0.2, 0)); Wd.lamp.target.updateMatrixWorld(); Wd.lamp.position.copy(K.top).add(V3(0, 0.5, 0)).addScaledVector(K.F, -0.9).addScaledVector(UPV.clone().cross(K.F), 0.5); Wd.lamp.intensity = 2.2 * cr.k; Wd.lamp.angle = 0.3; Wd.lamp.distance = 3; Wd.red.intensity = 0;
  { const Kk = Wd.key; Kk.color.set('#cfe4e8'); Kk.position.copy(K.top).add(V3(0, 2.6, 0)).addScaledVector(K.F, 1.4).addScaledVector(UPV.clone().cross(K.F), -0.6); Kk.target.position.copy(K.top).add(V3(0, 0.2, 0)); Kk.target.updateMatrixWorld(); Kk.intensity = 3.2; Kk.angle = 0.4; Kk.penumbra = 0.6; Kk.distance = 8; Kk.decay = 1.2; }
  const mid = Wd.ken.H.position.clone().addScaledVector(UPV.clone().cross(K.F).negate(), 0.1), cam = mid.clone().addScaledVector(K.F, lerp(1.0, 0.82, ss(45.6, 51.6, t))).add(V3(0, 0.02, 0)).addScaledVector(UPV.clone().cross(K.F).negate(), 0.08);
  render3D('night', cam, mid.clone().add(V3(0, -0.13, 0)), { lampCool: true, fov: 40, fill: { I: 1.6, d: 2.2, c: '#8fb0c0', off: V3(0.2, 0.4, 0) }, rim: 1.3, rimDir: V3(0.7, 0.6, -0.4), shadowAt: mid, vis: 1 - ss(51.3, 51.6, t) });
}
const TRX = (t) => XC - 7.5 + 32 * (t - 54.0);   // the train's first car centre
function trainFX(Wd, t) {   // the train in motion: wheels spin, headlight glare, speed streaks, snow blasted off the track
  const x = TRX(t), T = Wd.train; T.visible = true; T.position.x = x; Wd.wheels.forEach((w) => (w.rotation.y = -(x - XC) / 0.4)); T.updateMatrixWorld(true);
  const h = Wd.headL; h.position.set(x + 6.7, 1.3, TZ); h.target.position.set(x + 40, 0.2, TZ); h.target.updateMatrixWorld(); h.intensity = 10; h.angle = 0.5;
  Wd.hlights.forEach((m, i) => { const g = Wd.tglow[i]; g.visible = true; g.position.copy(m.getWorldPosition(V3(0, 0, 0))).add(V3(0.3, 0, 0)); g.scale.setScalar(2.4 + 0.4 * Math.sin(t * 31 + i)); });
  const M = new THREE.Matrix4(); Wd.streaks.visible = true; for (let i = 0; i < 40; i++) { const len = 2 + 5 * hsh(i, 2), px = x + 6 - mod(hsh(i, 3) * 60 + t * 18, 60), py = 0.3 + 3.3 * hsh(i, 4), pz = TZ + (hsh(i, 5) < 0.5 ? 1 : -1) * (1.47 + 0.5 * hsh(i, 6)); M.compose(V3(px, py, pz), new THREE.Quaternion(), V3(len, 0.012, 0.012)); Wd.streaks.setMatrixAt(i, M); } Wd.streaks.instanceMatrix.needsUpdate = true;
  const P = Wd.blast.geometry.attributes.position; Wd.blast.visible = true; for (let i = 0; i < 1400; i++) { const u = hsh(i, 1), age = mod(t * 2.2 + hsh(i, 2), 1), bx0 = x + 6.5 - u * 56, sd = hsh(i, 3) < 0.5 ? 1 : -1;
    P.setXYZ(i, bx0 - age * 6 * hsh(i, 4), 0.15 + age * (0.6 + 2.6 * hsh(i, 5)) * (1 - 0.6 * age), TZ + sd * (1.3 + age * (0.6 + 2.2 * hsh(i, 6)))); } P.needsUpdate = true;
}
function shotTrain() {   // the barrier comes down; the train goes past; only Kenta's bag on the tracks
  const Wd = world(), t = TT, on = (t < 57.4 ? 1 : 1 - ss(57.4, 57.8, t)) * (1 - 0.8 * ss(55.8, 56.5, t)), cr = crossing(Wd, t, on, ss(51.8, 53.2, t));
  if (t < 54.05) { const K = walkP(Wd.ken, { O: V3(XC - 1.0, 0, TZ), D: V3(0.2, 0, 1), plant: [0.1, -0.1], gf: () => RAIL - 0.06, pitch: 0.1, look: -0.5 }); Wd.ken.setFear(1); girl(Wd, (tq) => clingSt(K, tq, { near: 1, tight: 1, open: 0.6 }), t); }
  if (t > 52.6 && t < 56.3) trainFX(Wd, t);
  Wd.bagKenta.visible = t > 54.05; if (t > 55.8) { const Kk = Wd.key, bp0 = Wd.bagKenta.position; Kk.color.set('#d8ece6'); Kk.position.copy(bp0).add(V3(1.2, 4.3, 1.0)); Kk.target.position.copy(bp0); Kk.target.updateMatrixWorld(); Kk.intensity = 1.3 * ss(55.8, 56.4, t); Kk.angle = 0.42; Kk.penumbra = 0.55; Kk.distance = 9; Kk.decay = 1.2; }
  const k = ss(51.6, 58.6, t), kb = easeOut(ss(56.2, 58.4, t)), bp = Wd.bagKenta.position, cam = V3(XC + 3.2 - 0.4 * k, 1.55, TZ + 7.2 - 0.6 * k).lerp(bp.clone().add(V3(-1.4, 1.0, 0.25)), kb).add(V3(0, 0.6 * Math.sin(Math.PI * kb), 0)), tg = V3(XC - 1.0, 0.95, TZ - 0.6).lerp(bp.clone().add(V3(0, -0.1, 0)), kb);
  const sh = ss(53.6, 54.1, t) * (1 - ss(55.8, 56.4, t)); cam.add(V3(0.035 * Math.sin(t * 41) * sh, 0.025 * Math.sin(t * 53 + 1) * sh, 0.02 * Math.sin(t * 37 + 2) * sh));
  render3D('night', cam, tg, { lampCool: t > 55.8, fov: 52, vis: ss(51.6, 51.9, t), fill: { I: 0.4, d: 8, c: '#9ab8b4', off: V3(0, 1, 0) }, rim: 0.6, rimDir: V3(-0.3, 0.6, -1) });
  void cr;
}
function shotDawn() {   // the crossing at dawn, fresh snow, the bag gone
  const Wd = world(), t = TT, k = ss(58.6, 71, t);
  const cam = V3(XC - 2.2 - 0.8 * k, 1.55, TZ + 4.5 - 0.4 * k), tg = V3(XC - 12, 0.9, TZ - 0.4);
  render3D('dawn', cam, tg, { fov: 52, vis: ss(58.6, 59.2, t) * (1 - ss(70, 71, t)), snowA: 0.45, rim: 0.0, moonDir: V3(0.95, 0.14, -0.3), shadowAt: V3(XC - 2, 0, TZ - 0.5) });
}

const PARA = [
  ['If you hear \'teke, teke\' behind you near the tracks, don\'t run. My friend ran.', -1.2, 8.2],
  ['In our town in Niigata, a girl slipped on the tracks one winter. The train cut her in half.', 9.0, 14.35],
  ['They say the cold kept her alive long enough to crawl. She\'s still looking for the rest of her.', 15.1, 20.35],
  ['Kenta and I walked home along the line after cram school.', 21.1, 26.35],
  ['Then we heard it. Teke. Teke. Teke. Like nails on frozen concrete.', 27.1, 32.35],
  ['A girl was leaning over the wall, smiling at us. She had no legs.', 33.1, 38.35],
  ['Kenta ran. She dropped off the wall and came after him on her elbows, faster than he could run.', 39.1, 44.7],
  ['She caught him at the crossing and whispered, \'Where are my legs?\'', 46.0, 51.35],
  ['He didn\'t know the answer. The barrier came down. The train went past.', 52.1, 58.35],
  ['I knew the answer. I still whisper it every night before I sleep.', 59.2, 70.6],
];
function sceneTale() {
  const t = TT; fillAll('#020306'); resetWorld(world());
  if (window.DBG_SHOT) window.DBG_SHOT(); else   // debug views only (never set in the piece)
  if (t < 4.5) shotHook(); else if (t < 8.5) shotCard(); else if (t < 14.6) shotTown(); else if (t < 20.6) shotMarks(); else if (t < 26.6) shotWalk();
  else if (t < 32.6) shotHear(); else if (t < 38.6) shotWall(); else if (t < 45.6) { if (t < 45.0) shotChase(); } else if (t < 51.6) shotHit(); else if (t < 58.6) shotTrain(); else shotDawn();
  PARA.forEach(([s, a, b]) => ykPara(s, a, b, { cy: 1300 }));
  if (t >= 66.2) { const f = () => ykBadge(asset('kodama.jpg'), 'kodamashorts', CX, 290, ss(66.2, 66.9, t) * (1 - ss(70.4, 71, t))); if (DEFER) DEFER.push(f); else f(); }
}
