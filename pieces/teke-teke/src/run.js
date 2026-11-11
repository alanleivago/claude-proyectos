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
function streetLamp(Wd, i, I = 1) { const p = Wd.lampsXZ[i], K = Wd.key; K.color.set('#ffd8a0'); K.position.copy(p).add(V3(0, -0.1, 0)); K.target.position.copy(p).setY(0).add(V3(0.3, 0, -0.5)); K.target.updateMatrixWorld(); K.intensity = 6 * I; K.angle = 0.75; K.penumbra = 0.7; K.distance = 16; K.decay = 1.2;
  const g = Wd.wglows[0]; g.visible = true; g.position.copy(p).add(V3(0, -0.12, 0)); g.scale.setScalar(0.9); g.material.opacity = 0.9; }
function render3D(preset, pos, tgt, o = {}) {
  const Wd = world(), { r, cv } = rend();
  setLight(Wd, Object.assign({}, LIGHT[preset], o.light || {}));
  if (window.DBG_CAM) { pos = window.DBG_CAM[0]; tgt = window.DBG_CAM[1]; o.fov = window.DBG_CAM[2] ?? o.fov; }   // debug views only (never set in the piece)
  Wd.cam.fov = o.fov ?? 50; Wd.cam.position.copy(pos); Wd.cam.up.set(0, 1, 0); Wd.cam.lookAt(tgt); if (o.roll) Wd.cam.rotateZ(o.roll); Wd.cam.updateProjectionMatrix(); Wd.cam.updateMatrixWorld(true);
  animWorld(Wd, TT); Wd.snowF.visible = Wd.snowN.visible = o.snow !== false; Wd.snowF.material.opacity = Wd.snowN.material.opacity = o.snowA ?? 0.9;
  { const c = o.shadowAt || tgt, md = (o.moonDir || V3(-0.4, 0.6, 0.5)).clone().normalize(); Wd.moon.position.copy(c).addScaledVector(md, 60); Wd.moon.target.position.copy(c); Wd.moon.target.updateMatrixWorld(); }
  if (o.rim) { Wd.rim.intensity = o.rim; const c = o.shadowAt || tgt, rd = (o.rimDir || V3(0, 0.5, -1)).clone().normalize(); Wd.rim.position.copy(c).addScaledVector(rd, 60); Wd.rim.target.position.copy(c); Wd.rim.target.updateMatrixWorld(); }
  if (o.fill) { Wd.fill.color.set(o.fill.c || '#9ab8b4'); Wd.fill.position.copy(pos).add(o.fill.off || V3(0, 0.3, 0)); Wd.fill.intensity = o.fill.I; Wd.fill.distance = o.fill.d ?? 6; }
  r.render(Wd.scene, Wd.cam);
  ykBlit(cv, { vis: o.vis ?? 1 });
}

// ---------------------------------------------------------------------
//  the boys: walkP (o: { O, D, s, gf, plant, pitch, look, lean, hands, L stride, lift, swing })
// ---------------------------------------------------------------------
function walkP(P, o) {
  const pd = P.pd, F = o.D.clone().setY(0).normalize(), Lx = UPV.clone().cross(F), s = o.s ?? 0, L = o.L ?? 0.62, ph = s / L, gf = o.gf || gT, lift0 = o.lift ?? 0.07;
  const feet = [], fdir = [];
  [0, 1].forEach((j) => { const oj = j * 0.5, u = ph - oj, n = Math.floor(u), f = u - n, side = j === 0 ? 1 : -1; let sp, lift = 0, pit = 0;
    if (f < 0.38) { const k = ss(0, 1, f / 0.38); sp = lerp((n - 0.32 + oj) * L, (n + 0.68 + oj) * L, k); lift = lift0 * Math.sin(Math.PI * k); pit = 0.3 * Math.sin(Math.PI * k) * (1 - 2 * k); } else sp = (n + 0.68 + oj) * L;
    if (o.plant) sp = o.plant[j], lift = 0, pit = 0;
    const g = o.O.clone().addScaledVector(F, sp).addScaledVector(Lx, side * 0.1), gy = gf(g.x, g.z); feet.push(g.setY(gy + pd.ank + 0.02 + lift)); fdir.push({ Z: F.clone().applyAxisAngle(Lx, pit), Y: UPV.clone().applyAxisAngle(Lx, pit) }); });
  const mid = feet[0].clone().add(feet[1]).multiplyScalar(0.5), bob = o.plant ? 0 : (o.bob ?? 0.014) * Math.cos(TAU * 2 * ph), sway = o.plant ? 0 : 0.015 * Math.sin(TAU * ph);
  const lean = (o.lean ?? 0.06), U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)).normalize();
  const pos = o.O.clone().addScaledVector(F, o.plant ? (o.plant[0] + o.plant[1]) / 2 : s).addScaledVector(Lx, sway).setY(mid.y + (pd.thigh + pd.shin) * (o.crouch ?? 0.955) + bob);
  const B = frameOf(U, F), top = pos.clone().addScaledVector(B.Y, pd.torso), R = B.X.clone().negate(), swing = o.plant ? 0 : Math.sin(TAU * ph) * (o.swing ?? 0.16);
  const SL = top.clone().addScaledVector(B.X, pd.shW), SR = top.clone().addScaledVector(R, pd.shW);
  const hL = o.hands ? o.hands[0] : SL.clone().addScaledVector(DOWN, o.swing ? 0.36 : 0.5).addScaledVector(F, swing + 0.06).addScaledVector(B.X, 0.05), hR = o.hands ? o.hands[1] : SR.clone().addScaledVector(DOWN, o.swing ? 0.36 : 0.5).addScaledVector(F, -swing + 0.06).addScaledVector(R, 0.05);
  poseP(P, { pos, U, F, head: o.head || headRel(B, o.pitch ?? 0.05, o.look ?? 0, o.roll ?? 0), hands: [hL, hR], hdir: [{ Z: DOWN.clone().addScaledVector(F, 0.15), Y: B.X.clone() }, { Z: DOWN.clone().addScaledVector(F, 0.15), Y: R.clone() }],
    epole: [B.X.clone().addScaledVector(F, -0.6), R.clone().addScaledVector(F, -0.6)], feet, fdir, kpole: F.clone().addScaledVector(UPV, 0.2), curl: o.curl || [0.5, 0.5], grip: [false, false], breath: Math.sin(TT * (o.breathR ?? 2.4)) });
  return { P, B, top, pos, F };
}
const ZME = WZ + 0.6, ZKEN = WZ + 1.15;   // their lanes on the footpath

// ---------------------------------------------------------------------
//  the girl
// ---------------------------------------------------------------------
// leaning over the wall top at x: elbows on the top, forearms and long fingers hanging down the front face
function wallLean(x, t, o = {}) {
  const lean = o.lean ?? 0, chest = V3(x, WT + 0.21 + 0.015 * Math.sin(t * 1.7), WZ - 0.14 + 0.07 * lean), waist = V3(x - 0.02, WT - 0.2 + 0.1 * lean, WZ - 0.55 + 0.25 * lean);
  const look = (o.look || V3(0, -0.15, 1)).clone().normalize(), hp = chest.clone().add(V3(0, 0.13, 0.15 + 0.03 * lean));
  const arms = [-1, 1].map((sd, i) => { const E = V3(x + sd * 0.2, WT + 0.035, WZ - 0.09), dig = o.dig ? o.dig[i] : 0, W = V3(x + sd * 0.23, WT - 0.31 - 0.02 * dig, WZ + 0.05);
    return { E, W, hand: { Z: V3(sd * -0.08, -1, 0.06), Y: V3(0, 0.05, 1), curl: 0.04 + 0.05 * dig, spread: 1.0, tap: o.tap ?? 0 } }; });
  return { chest, waist, N: V3(0, 1, -0.6), head: { p: hp, Y: V3(0, 1, 0.12), Z: look }, roll: o.roll ?? 0, arms, gy: null, glint: 1 };
}
// the elbow crawl along path(s) → { p, F }: fast, insect-like; each arm plants elbow + forearm + clawed hand, sweeps back, flicks forward
const STR = 0.6;
function crawlSt(path, s, t, o = {}) {
  const { p, F } = path(s), X = V3(-F.z, 0, F.x), g = (q) => gT(q.x, q.z), cyc = s / (2 * STR);
  const chest = p.clone().addScaledVector(X, 0.025 * Math.sin(TAU * cyc)); chest.y = g(p) + 0.27 + 0.02 * Math.abs(Math.sin(TAU * cyc));
  const wp = p.clone().addScaledVector(F, -0.42), waist = wp.clone(); waist.y = g(wp) + 0.1;
  const tw = o.twitch ? 0.12 * Math.sin(t * 23) * ss(0.7, 0.9, Math.sin(t * 3.1)) : 0;
  const hp = chest.clone().addScaledVector(F, 0.13).add(V3(0, 0.16, 0)), look = (o.look || F.clone().add(V3(0, 0.25, 0))).clone().normalize();
  const arms = [1, -1].map((sd, i) => { const q = mod((s + i * STR) / (2 * STR), 1), s0 = s - q * 2 * STR; let Es, lift = 0, th = 0;
    if (q < 0.5) Es = s0 + 0.3; else { const k = ss(0, 1, (q - 0.5) / 0.5); Es = lerp(s0 + 0.3, s0 + 2 * STR + 0.3, k); lift = 0.15 * Math.sin(Math.PI * k); th = 0.75 * Math.sin(Math.PI * k); }
    const pe = path(Es), Xe = V3(-pe.F.z, 0, pe.F.x), E = pe.p.clone().addScaledVector(Xe, sd * 0.2); E.y = g(E) + 0.035 + lift;
    const dW = pe.F.clone().multiplyScalar(Math.cos(th)).add(V3(0, Math.sin(th), 0)).addScaledVector(Xe, -sd * 0.08).normalize(), W = E.clone().addScaledVector(dW, GL.fArm); if (q < 0.5) W.y = Math.max(W.y, g(W) + 0.03);
    return { E, W, hand: { Z: pe.F.clone().add(V3(0, q < 0.5 ? 0.02 : 0.2, 0)), Y: V3(0, 1, 0).addScaledVector(pe.F, 0.2), curl: q < 0.5 ? 0.14 : 0.25, spread: 1.15, tap: 0 } }; });
  return { chest, waist, N: V3(0, 1, 0), head: { p: hp, Y: V3(0, 1, 0).addScaledVector(F, -0.3), Z: look }, roll: tw + (o.roll ?? 0), arms, gy: gT, glint: 1 };
}
function kickSnow(Wd, path, s, v) {
  const P = Wd.puff.geometry.attributes.position; let n = 0; Wd.puff.visible = true;
  for (let i = 0; i < 2; i++) { const sd = i ? -1 : 1; for (let m = Math.floor((s + i * STR) / (2 * STR)); m > Math.floor((s + i * STR) / (2 * STR)) - 2; m--) { const sk = 2 * STR * m - i * STR, age = (s - sk) / v; if (age < 0 || age > 0.42) continue;
      const pe = path(sk + 0.3), X = V3(-pe.F.z, 0, pe.F.x), E = pe.p.clone().addScaledVector(X, sd * 0.2).addScaledVector(pe.F, 0.3); E.y = gT(E.x, E.z);
      for (let k = 0; k < 26 && n < 400; k++) { const h1 = hsh(m * 31 + k + i * 7, 2), h2 = hsh(m * 17 + k * 3 + i, 5), h3 = hsh(m * 7 + k * 11 + i, 9), vx = (h1 - 0.5) * 1.4, vz = (h2 - 0.5) * 1.4, vy = 0.6 + 1.2 * h3;
        P.setXYZ(n++, E.x + vx * age - pe.F.x * 0.5 * age, E.y + vy * age - 4.9 * age * age + 0.02, E.z + vz * age); } } }
  for (let k = 0; k < 60 && n < 400; k++) { const ds = 0.05 + 0.9 * hsh(k, 3), age = ((TT * 3 + hsh(k, 4)) % 1) * 0.35, pp = path(s - 0.42 - ds * 0.3).p; P.setXYZ(n++, pp.x + (hsh(k, 6) - 0.5) * 0.3, gT(pp.x, pp.z) + 0.6 * age * hsh(k, 7) - 2 * age * age + 0.02, pp.z + (hsh(k, 8) - 0.5) * 0.3); }
  for (; n < 400; n++) P.setXYZ(n, 0, -999, 0); P.needsUpdate = true;
}
const lerpV = (a, b, k) => a.clone().lerp(b, k);
function lerpSt(A, B, k, arc = 0) {   // blend two poses (points lerp, a little up-arc mid-way)
  const up = V3(0, arc * Math.sin(Math.PI * k), 0), L = (a, b) => lerpV(a, b, k).add(up);
  return { chest: L(A.chest, B.chest), waist: L(A.waist, B.waist).add(V3(0, arc * 0.6 * Math.sin(Math.PI * k), 0)), N: lerpV(A.N, B.N, k), head: { p: L(A.head.p, B.head.p), Y: lerpV(A.head.Y, B.head.Y, k), Z: lerpV(A.head.Z, B.head.Z, k) }, roll: lerp(A.roll, B.roll, k),
    arms: A.arms.map((a, i) => { const b = B.arms[i], E = L(a.E, b.E), W = E.clone().addScaledVector(L(a.W, b.W).sub(E).normalize(), GL.fArm); return { E, W, hand: { Z: lerpV(a.hand.Z, b.hand.Z, k), Y: lerpV(a.hand.Y, b.hand.Y, k), curl: lerp(a.hand.curl, b.hand.curl, k), spread: 1.1, tap: 0 } }; }), gy: k > 0.5 ? gT : null, glint: 1 };
}
// clinging to Kenta's back: chest behind his right shoulder, her face beside his, arms over his shoulders, hands spread on his chest
function clingSt(K, t, o = {}) {
  const P = Wd_().ken, F = K.F, Rr = UPV.clone().cross(F).negate(), top = K.top, hp0 = P.H.position;
  const chest = top.clone().addScaledVector(F, -0.2).addScaledVector(Rr, 0.1).add(V3(0, 0.06, 0)), waist = chest.clone().addScaledVector(F, -0.06).add(V3(0, -0.4, 0)).addScaledVector(Rr, -0.04);
  const near = o.near ?? 1, hp = hp0.clone().addScaledVector(Rr, lerp(0.26, 0.19, near)).addScaledVector(F, -0.02).add(V3(0, 0.0, 0));
  const look = F.clone().multiplyScalar(1).addScaledVector(Rr, -0.3 * near).add(V3(0, -0.05, 0)).normalize();
  const tight = o.tight ?? 0, arms = [
    { E: top.clone().addScaledVector(Rr, 0.19).addScaledVector(F, -0.03).add(V3(0, 0.07, 0)), W: top.clone().addScaledVector(Rr, 0.09).addScaledVector(F, 0.15).add(V3(0, -0.2, 0)), hand: { Z: V3(0, -1, 0).addScaledVector(Rr, -0.45), Y: F.clone(), curl: 0.3 + 0.35 * tight, spread: 1.2, tap: 0.25 } },
    { E: top.clone().addScaledVector(Rr, -0.2).addScaledVector(F, -0.08).add(V3(0, 0.05, 0)), W: top.clone().addScaledVector(Rr, -0.1).addScaledVector(F, 0.14).add(V3(0, -0.24, 0)), hand: { Z: V3(0, -1, 0).addScaledVector(Rr, 0.45), Y: F.clone(), curl: 0.3 + 0.35 * tight, spread: 1.2, tap: 0.2 } } ];
  return { chest, waist, N: F.clone().negate(), head: { p: hp, Y: V3(0, 1, 0).addScaledVector(Rr, 0.12), Z: look }, roll: o.roll ?? -0.25, arms, gy: null, glint: 1 };
}
const Wd_ = () => world();
// her path in the chase: along the footpath toward the crossing
const chasePath = (s) => ({ p: V3(-8.5 + s, 0, WZ + 0.55 + 0.42 * ss(0, 4, s) + 0.08 * Math.sin(s * 0.4)), F: V3(1, 0, 0.032 * Math.cos(s * 0.4) + 0.105 * (ss(0, 4, s + 0.05) - ss(0, 4, s)) / 0.05).normalize() });
// the trail in beat 4: along the snow between the rails, away from the crossing
const railPath = (s) => ({ p: V3(XC - 2.5 - s, 0, TZ - 0.95 + 0.1 * Math.sin(s * 0.35)), F: V3(-1, 0, -0.035 * Math.cos(s * 0.35)).normalize() });

// ---------------------------------------------------------------------
//  the shots
// ---------------------------------------------------------------------
const GX = 9.6;   // where she leans over the wall in the hook
function shotHook() {   // she leans over the snowy wall top, grinning; the red crossing light flashes on her face
  const Wd = world(), t = TT, cr = crossing(Wd, t + 0.3, 1, 0);
  const roll = lerp(0.12, -0.38, easeOut(ss(0.25, 1.6, t))) + 0.06 * Math.sin(t * 5.3) * ss(2.4, 2.6, t) * (1 - ss(3.0, 3.3, t));
  poseGirl(Wd, wallLean(GX, t, { roll, lean: ss(0.2, 4.5, t) * 0.6, dig: [ss(0.4, 1.4, t), ss(0.7, 1.7, t)], tap: ss(0.5, 1.0, t) * 0.8, look: V3(-0.2, -0.32, 1) }));
  Wd.lamp.position.copy(Wd.red.position); Wd.lamp.target.position.set(GX, WT + 0.3, WZ); Wd.lamp.target.updateMatrixWorld(); Wd.red.intensity *= 0.3; Wd.lamp.intensity = 4 * cr.k; Wd.lamp.angle = 0.26; Wd.lamp.penumbra = 0.8; Wd.lamp.distance = 8;
  streetLamp(Wd, 1, 0.5);
  const cam = V3(GX - 0.3 + 0.06 * ss(0, 4.5, t), 1.72, WZ + 2.0 - 0.15 * ss(0, 4.5, t)), tg = V3(GX - 0.05, 1.66, WZ);
  render3D('night', cam, tg, { fov: 46, fill: { I: 0.35, d: 3, c: '#7aa6aa', off: V3(-0.5, 0.6, 0) }, rim: 0.9, rimDir: V3(0.2, 0.7, -1), moonDir: V3(-0.3, 0.7, -0.6), vis: 1 - ss(4.2, 4.5, t) });
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
function shotHear() {   // teke, teke: they stop and look back; there is nothing behind them
  const Wd = world(), t = TT, s0 = 1.1 * (28.1 - 20.6), walking = t < 28.1, s = walking ? 1.1 * (t - 20.6) : s0, x = walking ? xb5(t) : XSTOP;
  const turn = ss(28.5, 29.6, t), Dm = V3(Math.cos(Math.PI * 0.62 * turn), 0, -Math.sin(Math.PI * 0.62 * turn) * 0.6), Dk = V3(Math.cos(Math.PI * 0.66 * turn), 0, Math.sin(Math.PI * 0.66 * turn) * 0.5);
  if (walking) boysWalk(Wd, t); else {
    walkP(Wd.me, { O: V3(XSTOP, 0, ZME), D: Dm, plant: [0.05, -0.04], pitch: 0.02, look: 0.6 * turn, lean: 0.02 });
    walkP(Wd.ken, { O: V3(XSTOP + 0.25, 0, ZKEN), D: Dk, plant: [-0.04, 0.05], pitch: 0.0, look: -0.6 * turn, lean: 0.02 }); }
  streetLamp(Wd, 0, 1); void s;
  const cam = V3(XSTOP + 5.6, 1.9, ZME + 0.8), tg = V3(XSTOP - 1.6, 0.0, ZME + 0.1);
  render3D('night', cam, tg, { fov: 50, fill: { I: 0.4, d: 6, c: '#9ab8b4', off: V3(0, 1, 0) }, rim: 0.6, rimDir: V3(-0.6, 0.6, -0.4) });
}
const GX7 = XSTOP - 2.0;   // where she leans over the wall behind them
function shotWall() {   // a girl leaning over the wall, smiling at us. She had no legs: she drags herself over and the blouse hangs empty
  const Wd = world(), t = TT, over = easeOut(ss(35.6, 38.4, t));
  walkP(Wd.me, { O: V3(XSTOP, 0, ZME), D: V3(-0.5, 0, -0.4), plant: [0.12, -0.12], pitch: -0.12, look: 0.1, lean: -0.04 });
  walkP(Wd.ken, { O: V3(XSTOP + 0.25, 0, ZKEN), D: V3(-0.8, 0, -0.35), plant: [-0.1, 0.14], pitch: -0.15, look: -0.1, lean: -0.08 }); Wd.ken.setFear(0.6); Wd.me.setFear(0.6);
  const roll = lerp(-0.3, 0.2, ss(33, 35, t));
  poseGirl(Wd, wallLean(GX7, t, { roll, lean: 0.4 + 1.8 * over, dig: [0.5 + 0.5 * Math.sin(t * 3), 0.5 + 0.5 * Math.sin(t * 3 + 1.4)], tap: 0.5, look: V3(0.55, -0.25, 0.85) }));
  streetLamp(Wd, 0, 1);
  const cam = V3(GX7 + 1.3, 1.6, WZ + 2.0), tg = V3(GX7 - 0.05, 1.72, WZ);
  render3D('night', cam, tg, { fov: 50, fill: { I: 0.5, d: 6, c: '#9ab8b4', off: V3(0, 1, 0) }, rim: 0.8, rimDir: V3(-0.3, 0.6, -1) });
}
// the chase: Kenta runs for the crossing; she drops off the wall and comes after him on her elbows, faster than he can run
const kenX = (t) => XSTOP + 0.25 + 2.85 * Math.max(0, t - 38.6) - 0.6 * ss(38.6, 39.2, t) * 0;
const gS = (t) => t < 39.4 ? 0 : 3.0 * (t - 39.4) + 0.125 * (t - 39.4) ** 2;
const gV = (t) => 3.0 + 0.25 * Math.max(0, t - 39.4);
function shotChase() {
  const Wd = world(), t = TT, cr = crossing(Wd, t, 1, ss(43.0, 44.6, t) * 0.5);
  const sk = 2.85 * Math.max(0, t - 38.6); walkP(Wd.ken, { O: V3(XSTOP + 0.25, 0, ZKEN), D: V3(1, 0, 0), s: sk, L: 1.15, lift: 0.17, swing: 0.24, lean: 0.24, pitch: 0.1, bob: 0.03, look: t < 39.6 ? -0.9 * (1 - ss(38.8, 39.6, t)) : -0.25 * ss(42, 42.4, t) * (1 - ss(43, 43.5, t)), crouch: 0.93 });
  if (t < 39.4) { const k = easeOut(ss(38.6, 39.4, t)); poseGirl(Wd, lerpSt(wallLean(GX7, t, { lean: 2.2, look: V3(1, -0.4, 0.4) }), crawlSt(chasePath, 0, t), k, 0.25)); }
  else { const s = gS(t); poseGirl(Wd, crawlSt(chasePath, s, t, { twitch: true, look: V3(1, 0.35, 0.25) })); layTrail(Wd, chasePath, 0, s - 0.42, { fade: 0.4 }); kickSnow(Wd, chasePath, s, gV(t)); }
  Wd.ken.setFear(1);
  const gp = t < 39.4 ? V3(GX7, 0, WZ + 0.4) : chasePath(gS(t)).p, kx = Wd.ken.T.position.x; let cam, tg;
  if (t < 39.4) { cam = V3(-3.6, 0.9, 2.9); tg = V3(gp.x + 0.5, -0.05, WZ + 0.6); }
  else { const gap = Math.max(0.3, kx - gp.x), dist = clamp(gap * 0.5 + 1.2, 1.5, 1.9), fx = gp.x + 0.12 + clamp(gap * 0.25, 0.0, 0.25); const kw = ss(43.1, 44.2, t), mx = (gp.x + kx) / 2 + 0.1; cam = V3(lerp(gp.x + 1.3, mx, kw), lerp(0.78, 1.0, kw), gp.z + lerp(1.3, 3.9, kw)); tg = V3(lerp(gp.x + 0.15, mx, kw), lerp(-0.02, 0.32, kw), gp.z + 0.1); void dist; void fx; }
  streetLamp(Wd, 1, ss(9, 4, Math.abs(gp.x - 8.6)));
  render3D('night', cam, tg, { fov: t < 39.4 ? 52 : 48, fill: { I: 0.6, d: 5, c: '#9ab8b4', off: V3(0, 0.8, 0) }, rim: 0.8, rimDir: V3(0.2, 0.6, -1), shadowAt: gp, vis: 1 - ss(44.85, 45.0, t) });
  void cr;
}
const KH = V3(XC - 0.75, 0, TZ - 1.0);   // where she catches him: on the road, a step before the rails
function shotHit() {   // THE HIT: her face right by his, in the pulsing red light; she whispers
  const Wd = world(), t = TT, cr = crossing(Wd, t, 0.35, 0.5);
  Wd.ken.setFear(1);
  const K = walkP(Wd.ken, { O: KH, D: V3(-1, 0, 0.12), plant: [0.1, -0.12], lean: 0.1, pitch: 0.02, look: 0.1 + 0.03 * Math.sin(t * 9), roll: 0.06, breathR: 9 });
  poseGirl(Wd, clingSt(K, t, { near: easeOut(ss(45.6, 48.5, t)), tight: ss(46, 50, t), roll: lerp(-0.15, -0.35, ss(46.5, 50, t)) }));
  Wd.lamp.position.copy(Wd.red.position); Wd.lamp.target.position.copy(K.top).add(V3(0, 0.2, 0)); Wd.lamp.target.updateMatrixWorld(); Wd.lamp.intensity = 2.2 * cr.k; Wd.lamp.angle = 0.35; Wd.lamp.distance = 6;
  const mid = Wd.ken.H.position.clone().addScaledVector(UPV.clone().cross(K.F).negate(), 0.1), cam = mid.clone().addScaledVector(K.F, lerp(1.0, 0.82, ss(45.6, 51.6, t))).add(V3(0, 0.02, 0)).addScaledVector(UPV.clone().cross(K.F).negate(), 0.08);
  render3D('night', cam, mid.clone().add(V3(0, -0.13, 0)), { fov: 40, fill: { I: 0.25, d: 2, c: '#7aa6aa', off: V3(0, 0.4, 0) }, rim: 1.3, rimDir: V3(0.7, 0.6, -0.4), shadowAt: mid, vis: 1 - ss(51.3, 51.6, t) });
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
  const Wd = world(), t = TT, on = t < 57.4 ? 1 : 1 - ss(57.4, 57.8, t), cr = crossing(Wd, t, on, ss(51.8, 53.2, t));
  if (t < 54.05) { const K = walkP(Wd.ken, { O: V3(XC - 1.0, 0, TZ), D: V3(0.2, 0, 1), plant: [0.1, -0.1], gf: () => RAIL - 0.06, pitch: 0.1, look: -0.5 }); Wd.ken.setFear(1); poseGirl(Wd, clingSt(K, t, { near: 1, tight: 1 })); }
  if (t > 52.6 && t < 56.3) trainFX(Wd, t);
  Wd.bagKenta.visible = t > 54.05; streetLamp(Wd, 1, 0.8);
  const k = ss(51.6, 58.6, t), kb = easeOut(ss(56.2, 58.4, t)), bp = Wd.bagKenta.position, cam = V3(XC + 3.2 - 0.4 * k, 1.55, TZ + 7.2 - 0.6 * k).lerp(bp.clone().add(V3(-1.4, 1.0, 0.25)), kb).add(V3(0, 0.6 * Math.sin(Math.PI * kb), 0)), tg = V3(XC - 1.0, 0.95, TZ - 0.6).lerp(bp.clone().add(V3(0, -0.1, 0)), kb);
  const sh = ss(53.6, 54.1, t) * (1 - ss(55.8, 56.4, t)); cam.add(V3(0.035 * Math.sin(t * 41) * sh, 0.025 * Math.sin(t * 53 + 1) * sh, 0.02 * Math.sin(t * 37 + 2) * sh));
  render3D('night', cam, tg, { fov: 52, vis: ss(51.6, 51.9, t), fill: { I: 0.4, d: 8, c: '#9ab8b4', off: V3(0, 1, 0) }, rim: 0.6, rimDir: V3(-0.3, 0.6, -1) });
  void cr;
}
function shotDawn() {   // the crossing at dawn, fresh snow, the bag gone
  const Wd = world(), t = TT, k = ss(58.6, 71, t);
  const cam = V3(XC + 1.8 - 0.8 * k, 1.6, TZ + 6.8 - 0.9 * k), tg = V3(XC - 3.2, 1.0, TZ - 1.2);
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
