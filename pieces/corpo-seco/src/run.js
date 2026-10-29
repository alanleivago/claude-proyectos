// =====================================================================
//  RUN — the shots. Everything is posed in world space each frame: the cart and its oxen on the road (gait from the
//  distance travelled), then my grandfather placed on the cart's final pose; the Corpo-Seco in its trunk or on his back,
//  hands placed on surfaces (palm flat, fingers curled) and checked numerically; props in the fitted fist (holdProp).
// =====================================================================
const easeOut = (x) => 1 - (1 - x) ** 3;
const DOWN = V3(0, -1, 0), UPV = V3(0, 1, 0);
const qYZ = (Y, Z) => { const f = frameOf(Y, Z); return qBasis(f.Y.clone().cross(f.Z), f.Y, f.Z); };
const yzOf = (q) => ({ Y: V3(0, 1, 0).applyQuaternion(q), Z: V3(0, 0, 1).applyQuaternion(q) });
const slerpYZ = (a, b, k) => yzOf(qYZ(a.Y, a.Z).slerp(qYZ(b.Y, b.Z), clamp(k)));
function headRel(B, pitch, yaw, roll) { const q = qBasis(B.X, B.Y, B.Z).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ'))); return yzOf(q); }
function lookYZ(from, to, roll = 0) { const Z = to.clone().sub(from).normalize(), Y = UPV.clone().addScaledVector(Z, -Z.y).normalize().applyAxisAngle(Z, roll); return { Y, Z }; }
const TL = (x, y, z) => WJ.tree.localToWorld(V3(x, y, z));
const TD = (x, y, z) => V3(x, y, z).applyQuaternion(WJ.tree.quaternion);
const CL = (x, y, z) => WJ.cart.localToWorld(V3(x, y, z));
const CD = (x, y, z) => V3(x, y, z).applyQuaternion(WJ.cart.quaternion);
// the outer bark surface of the hero trunk (local): mirrors trunkGeo
const trunkWob = (a, y) => 1 + 0.07 * Math.sin(a * 5 + y * 2.3 + 1) + 0.05 * Math.sin(a * 9 - y * 4) + 0.04 * Math.sin(a * 13 + y * 7);
function barkPt(a, y, out = 0) { const r = TRUNK.r(y) * trunkWob(a, y) + out; return V3(0.006 * y * y + Math.sin(a) * r, y, -0.05 * y + Math.cos(a) * r); }
function barkN(a, y) { const e = 0.01, p = barkPt(a, y), pa = barkPt(a + e, y), py = barkPt(a, y + e); return pa.sub(p).cross(py.sub(p)).normalize().negate(); }

// ---------------------------------------------------------------------
//  per frame: wind in the grass, motes round the light, mist, the sky and hills round the camera, the moon
// ---------------------------------------------------------------------
function animWorld(Wd, t, o = {}) {
  WIND.value = t; const cam = Wd.cam.position;
  Wd.sky.position.copy(cam); Wd.ridges.forEach((m) => m.position.set(cam.x, cam.y * 0 + m.userData.y + (o.ridgeY ?? 0), cam.z));
  const md = (o.moonDir || V3(-0.3, 0.45, -1)).clone().normalize(); Wd.moonDisk.position.copy(cam).addScaledVector(md, 250); Wd.moonDisk.lookAt(cam); Wd.moonDisk.scale.setScalar(o.moonS ?? 16); Wd.moonHalo.position.copy(Wd.moonDisk.position).addScaledVector(md, 1); Wd.moonHalo.scale.setScalar((o.moonS ?? 16) * 5);
  Wd.mist.forEach((s) => { const u = s.userData; s.position.x = u.x + 1.5 * Math.sin(t * 0.07 + u.ph); const dc = s.position.distanceTo(cam) - s.scale.x * 0.5; s.material.opacity = (0.3 + 0.15 * Math.sin(t * 0.3 + u.ph)) * (o.mist ?? 1) * ss(1.5, 6.0, dc); s.visible = s.material.opacity > 0.003; });
  { const c = o.motes; Wd.motes.visible = !!c; if (c) { const P = Wd.motes.geometry.attributes.position; Wd.moteP.forEach((q, i) => { const r = c.r ?? 1.2; P.setXYZ(i, c.p.x + q.x * r + 0.15 * Math.sin(t * q.v * 2 + q.ph), c.p.y + q.y * r * 0.7 + 0.1 * Math.sin(t * q.v * 3 + q.ph * 2), c.p.z + q.z * r + 0.15 * Math.cos(t * q.v * 1.7 + q.ph)); }); P.needsUpdate = true; Wd.motes.material.opacity = c.a ?? 0.8; } }
}
// the lantern's flicker is gentle: the 3 toon bands turn any fast flicker into whole surfaces popping
function lantern(Wd, p, k = 1) { const fl = k * (0.96 + 0.025 * Math.sin(TT * 5.3) + 0.015 * Math.sin(TT * 8.9)); Wd.lantern.updateMatrixWorld(true); const c = Wd.lantern.localToWorld(V3(0, -Wd.lantern.userData.H + 0.15, 0));
  Wd.lanL.position.copy(c).add(V3(0, 0.0, 0)); Wd.lanL.intensity = 4.2 * fl; Wd.lanGlow.visible = k > 0.05; Wd.lanGlow.position.copy(c); Wd.lanGlow.scale.setScalar(0.9 * k); Wd.lanGlow.material.opacity = 0.75 * k;
  Wd.globeT.emissiveIntensity = 1.6 * k; Wd.globeT.color.set(k > 0.1 ? '#f2c87a' : '#4a4238'); Wd.globeT.emissive.set(k > 0.1 ? '#e8a050' : '#000000'); Wd.flameLan.visible = k > 0.1; void p; }
function hangLantern(Wd, swing) {   // on the hook under the yoke, swinging
  const L = Wd.lantern, hook = CL(0, CART.yokeY + 0.53, CART.yokeZ - 0.075); L.visible = true; L.position.copy(hook);
  L.quaternion.copy(WJ.cart.quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(swing.x, 0, swing.z))); L.updateMatrixWorld(true);
}
function lightsOff(Wd) { Wd.key.color.set('#b9cbc6'); [Wd.lanL, Wd.lampL, Wd.key, Wd.fill, Wd.rim].forEach((l) => (l.intensity = 0)); Wd.lanGlow.visible = false; Wd.lampGlow.visible = false; }
function resetWorld(Wd) {
  [Wd.man, Wd.tiao, Wd.mother, Wd.corpo].forEach((P) => (P.g.visible = false)); Wd.cart.visible = false; Wd.lantern.visible = false; Wd.goad.visible = false; Wd.strap.visible = false; Wd.coffin.visible = false; Wd.lid.visible = false; Wd.hat.visible = false;
  Wd.trunkOpen.visible = true; Wd.trunkWide.visible = false; Wd.trunkShut.visible = false; Wd.barkFaces.visible = false; Wd.pocket.visible = true; lightsOff(Wd);
}
function render3D(preset, pos, tgt, o = {}) {
  const Wd = world(), { r, cv } = rend();
  setLight(Wd, Object.assign({}, LIGHT[preset], o.light || {}));
  if (window.DBG_CAM) { pos = window.DBG_CAM[0]; tgt = window.DBG_CAM[1]; o.fov = window.DBG_CAM[2] ?? o.fov; }   // debug views only (never set in the piece)
  Wd.cam.fov = o.fov ?? 50; Wd.cam.position.copy(pos); Wd.cam.up.set(0, 1, 0); Wd.cam.lookAt(tgt); if (o.roll) Wd.cam.rotateZ(o.roll); Wd.cam.updateProjectionMatrix(); Wd.cam.updateMatrixWorld(true);
  animWorld(Wd, TT, o);
  { const c = o.shadowAt || tgt, md = (o.moonDir || V3(-0.3, 0.45, -1)).clone().normalize(); Wd.moon.position.copy(c).addScaledVector(md, 40); Wd.moon.target.position.copy(c); Wd.moon.target.updateMatrixWorld(); }
  if (o.rim) { Wd.rim.intensity = o.rim; const c = o.shadowAt || tgt, rd = (o.rimDir || o.moonDir || V3(0, 0.5, -1)).clone().normalize(); Wd.rim.position.copy(c).addScaledVector(rd, 30); Wd.rim.target.position.copy(c); Wd.rim.target.updateMatrixWorld(); }
  [Wd.man, Wd.tiao, Wd.mother, Wd.corpo].forEach((P) => P.g.visible && P.g.updateMatrixWorld(true));
  r.render(Wd.scene, Wd.cam);
  ykBlit(cv, { vis: o.vis ?? 1 });
}

// ---------------------------------------------------------------------
//  the Corpo-Seco in its trunk: crouched in the hollow, face in the slit, long fingers hooked round the lips
// ---------------------------------------------------------------------
function corpoInTrunk(Wd, o) {   // o: { look (world point), turn (0..1), jaw, glint, lean, out (face forward), hands: 'lips' | 'in' | {...} }
  const P = Wd.corpo, t = TT, Fz = TD(0, 0, 1), U = UPV.clone().addScaledVector(Fz, 0.38 + (o.lean ?? 0)).normalize();
  const pos = TL(0.0, 1.22 + (o.rise ?? 0), -0.02 + (o.out ?? 0) * 0.5);
  const feet = [TL(0.09, 0.47 + P.pd.ank, -0.18), TL(-0.09, 0.47 + P.pd.ank, -0.2)];
  const B = frameOf(U, Fz), prof = headRel(B, 0.25, (o.yaw0 ?? 1.25), 0.15), look = lookYZ(TL(0, 2.0, 0.3), o.look, -0.25 + 0.06 * Math.sin(t * 2.1));
  const head = slerpYZ(prof, look, o.turn);
  const hands = [], hdir = [], curl = [], ep = [], rhos = [], taus = [];
  [1, -1].forEach((sd, i) => { const hy = i ? 1.5 : 1.74, g = TRUNK.gap(hy) * (o.gapK ?? 1) + 0.02, al = sd * g / 2;   // the hand in the slit, palm on its side face, fingers hooked round the lip onto the bark
    const rho = V3(Math.sin(al), 0, Math.cos(al)), tau = V3(-Math.cos(al), 0, Math.sin(al)).multiplyScalar(sd), c0 = V3(0.006 * hy * hy, hy, -0.05 * hy);
    const wl = c0.clone().addScaledVector(rho, TRUNK.rin(hy) + 0.03).addScaledVector(tau, 0.042 * P.pd.hs);
    hands.push(TL(wl.x, wl.y, wl.z)); hdir.push({ Y: TD(tau.x, 0, tau.z), Z: TD(rho.x, -0.12, rho.z).normalize() }); rhos.push(TD(rho.x, 0, rho.z)); taus.push(TD(tau.x, 0, tau.z)); curl.push(0.62 + 0.05 * Math.sin(t * 3 + i)); ep.push(TD(sd * 0.1, -1, -0.6)); });
  const hi = o.hands === 'in' ? 1 : (o.handsIn ?? 0), inH = [TL(0.12, 1.5, 0.05), TL(-0.12, 1.4, 0.05)], inD = [{ Y: TD(-1, 0, 0), Z: DOWN.clone() }, { Y: TD(1, 0, 0), Z: DOWN.clone() }];
  const h0 = ss(0, 0.3, hi), h1 = ss(0.3, 0.7, hi), h2 = ss(0.7, 1, hi), hw = hands.map((h, i) => h.clone().addScaledVector(rhos[i], -0.26 * h1).addScaledVector(taus[i], 0.03 * h0).lerp(inH[i], h2));   // withdraw straight back through the slit, then fold away inside
  if (hi > 0) curl.forEach((c, i) => (curl[i] = lerp(c, -0.05, h0)));
  poseP(P, { pos, U, F: Fz, head, hands: hw, hdir: hdir.map((d, i) => slerpYZ(d, inD[i], h2)), epole: ep, feet, kpole: Fz.clone().addScaledVector(UPV, 0.3), curl, spread: [0.6 * (1 - h0), 0.6 * (1 - h0)], thumb: o.hands === 'in' ? null : [-0.5, -0.5], twitch: 0.5, jaw: o.jaw, glint: o.glint, breath: 0 });
  return P;
}

// ---------------------------------------------------------------------
//  the cart on the road; oxen walking; my grandfather placed on its final pose
// ---------------------------------------------------------------------
function placeCart(Wd, s, o = {}) {
  const ra = roadAt(s), c = Wd.cart; c.visible = true; const p = ra.p.clone(); p.y = 0; c.position.copy(p); c.rotation.set(0, Math.atan2(-ra.t.x, -ra.t.z) + (o.yaw ?? 0), 0); c.updateMatrixWorld(true);
  Wd.wheels.forEach((w) => (w.rotation.x = -s / CART.wheelR * 0.9));
  Wd.oxen.forEach((O) => poseOx(O, s + O.i * 0.31 + (o.dOff ?? 0), o.ox || {})); c.updateMatrixWorld(true); return c;
}
function seatMan(Wd, o = {}) {   // seated on the sack at the front of the bed, the goad in his right fist, angled forward over the oxen
  const P = Wd.man, t = TT, bob = 0.012 * Math.sin((o.s ?? 0) * 4.5);
  const pos = CL(0.02, Wd.seatY + 0.07 + bob, CART.bedZ0 + 0.74), F = CD(0, 0, -1), U = CD(0, 1, -0.12).normalize(), B = frameOf(U, F);
  const feet = [CL(-0.13, CART.bedY + 0.03 + P.pd.ank, CART.bedZ0 + 0.3), CL(0.12, CART.bedY + 0.03 + P.pd.ank, CART.bedZ0 + 0.26)];
  const D = CD(0.12, 0.62, -1).normalize(), G = CL(0.24, 1.55, CART.bedZ0 + 0.45), hf = barHand(D, CD(-1, -0.5, 0.2)), wr = wristFor(P, G, hf);
  const kneeL = CL(-0.14, Wd.seatY + 0.14, CART.bedZ0 + 0.42);
  poseP(P, { pos, U, F, head: o.head || headRel(B, 0.05 + 0.04 * Math.sin(t * 0.7), 0.1 * Math.sin(t * 0.4), 0), hands: [kneeL, wr], hdir: [{ Y: U.clone(), Z: F.clone().addScaledVector(DOWN, 0.6).normalize() }, hf], epole: [B.X.clone().addScaledVector(F, -0.5), B.X.clone().negate().addScaledVector(DOWN, 0.6)],
    feet, kpole: F.clone().addScaledVector(UPV, 0.4), curl: [0.4, 0], grip: [false, true], breath: Math.sin(t * 1.8) });
  holdProp(P, 1, Wd.goad); return P;
}
// a standing / walking man on the road: o: { O (start), D (dir), s (metres walked), crouch, look, goadUp }
function walkMan(Wd, o) {
  const P = Wd.man, pd = P.pd, F = o.D.clone().setY(0).normalize(), Lx = UPV.clone().cross(F), s = o.s, L = 0.6, ph = s / L, cr = o.crouch ?? 0;
  const feet = [], fdir = [];
  [0, 1].forEach((j) => { const oj = j * 0.5, u = ph - oj, n = Math.floor(u), f = u - n, side = j === 0 ? 1 : -1; let sp, lift = 0, pit = 0;
    if (f < 0.38) { const k = ss(0, 1, f / 0.38); sp = lerp((n - 0.32 + oj) * L, (n + 0.68 + oj) * L, k); lift = 0.09 * Math.sin(Math.PI * k); pit = 0.35 * Math.sin(Math.PI * k) * (1 - 2 * k); } else sp = (n + 0.68 + oj) * L;
    if (o.plant) sp = (o.plant[j] ?? 0), lift = 0, pit = 0;
    const g = o.O.clone().addScaledVector(F, sp).addScaledVector(Lx, side * (0.11 + cr * 0.06)), gy = groundAt(g.x, g.z); feet.push(g.setY(gy + pd.ank + lift + Math.max(0, pit) * 0.05)); fdir.push({ Z: F.clone().applyAxisAngle(Lx, pit), Y: UPV.clone().applyAxisAngle(Lx, pit) }); });
  const mid = feet[0].clone().add(feet[1]).multiplyScalar(0.5), bob = o.plant ? 0 : 0.015 * Math.cos(TAU * 2 * ph), sway = o.plant ? 0 : 0.02 * Math.sin(TAU * ph);
  const lean = (o.lean ?? 0.06) + cr * 0.35, U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)).normalize();
  const pos = o.O.clone().addScaledVector(F, o.plant ? (o.plant[0] + o.plant[1]) / 2 - 0.02 : s).addScaledVector(Lx, sway).setY(mid.y - pd.ank + (pd.thigh + pd.shin) * (0.965 - cr * 0.12) + bob - 0.02);
  const B = frameOf(U, F), top = pos.clone().addScaledVector(B.Y, pd.torso), R = B.X.clone().negate();
  const SL = top.clone().addScaledVector(B.X, pd.shW), SR = top.clone().addScaledVector(R, pd.shW), swing = o.plant ? 0 : Math.sin(TAU * ph) * 0.18;
  const handL = o.handL || SL.clone().addScaledVector(DOWN, 0.5).addScaledVector(F, swing + 0.05).addScaledVector(B.X, 0.05);
  let handR, hdR, grip = o.goad !== false;
  if (grip) { const D = (o.goadDir || F.clone().multiplyScalar(0.35).addScaledVector(UPV, 1).addScaledVector(R, 0.1)).normalize(), G = SR.clone().addScaledVector(DOWN, 0.36).addScaledVector(F, 0.22 - swing * 0.3).addScaledVector(R, 0.02); hdR = barHand(D, B.X.clone().addScaledVector(F, 0.3)); handR = wristFor(P, G, hdR); }
  else { handR = o.handR || SR.clone().addScaledVector(DOWN, 0.5).addScaledVector(F, -swing + 0.05).addScaledVector(R, 0.05); hdR = o.hdR || null; }
  poseP(P, { pos, U, F, head: o.head || headRel(B, o.pitch ?? 0.05, o.look ?? 0, 0), hands: [handL, handR], hdir: [o.hdL || { Z: DOWN.clone().addScaledVector(F, 0.2), Y: B.X.clone() }, hdR || { Z: DOWN.clone().addScaledVector(F, 0.2), Y: R.clone() }],
    epole: [B.X.clone().multiplyScalar(0.3).addScaledVector(F, -1), o.epR || R.clone().multiplyScalar(0.6).addScaledVector(F, -0.4).addScaledVector(DOWN, 0.5)], feet, fdir, kpole: F.clone().addScaledVector(UPV, 0.2), curl: [o.curlL ?? 0.45, o.curlR ?? 0.4], grip: [false, grip], breath: Math.sin(TT * 2.6) });
  if (grip) holdProp(P, 1, Wd.goad); return P;
}

// ---------------------------------------------------------------------
//  the shots
// ---------------------------------------------------------------------
const moonBehind = (cam, at, up = 0.42, side = 0) => at.clone().sub(cam).setY(0).normalize().applyAxisAngle(UPV, side).setY(up);
function shotOpen() {   // HOOK: the dead tree at the bend, its split gaping; a dry grinning thing leans out of it, opens its eyes and turns to us
  const Wd = world(), t = TT, k = ss(0, 4.5, t); Wd.trunkOpen.visible = false; Wd.trunkWide.visible = true;
  const cam = TL(lerp(0.28, 0.2, k), lerp(1.14, 1.18, k), lerp(1.82, 1.62, k)), tgt = TL(0.0, 1.76, 0.3);
  const turn = easeOut(ss(0.7, 2.3, t)) - 0.05 * ss(2.6, 3.0, t) * (1 - ss(3.0, 3.5, t)), jaw = 0.15 + 0.55 * ss(1.2, 2.0, t) + 0.08 * Math.sin(t * 9) * ss(2.0, 2.4, t) * (1 - ss(2.4, 3.0, t));
  corpoInTrunk(Wd, { look: cam, turn, jaw, glint: ss(0.35, 0.55, t), gapK: 1.45, out: HOOK_OUT + 0.08 * easeOut(ss(1.4, 3.0, t)), rise: 0.06 });
  Wd.key.position.copy(TL(-1.3, 1.6, 2.0)); Wd.key.target.position.copy(Wd.corpo.H.position); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = 3.6; Wd.key.angle = 0.3; Wd.key.penumbra = 0.6;
  render3D('night', cam, tgt, { vis: 1 - ss(4.15, 4.5, t), fov: 50, mist: 0.7, moonDir: moonBehind(cam, Wd.corpo.H.position, 0.34, 0.12), moonS: 24, rim: 2.0, rimDir: moonBehind(cam, Wd.corpo.H.position, 0.5, 0.0), light: { hemI: 0.5, moonI: 0.5 } });
}
const HOOK_OUT = 0.36;
const printSrc = () => asset('print.jpg');
function shotCard() {
  fillAll('#020306'); ykStars(ss(4.5, 5.2, TT) * (1 - ss(7.9, 8.5, TT)));
  const kIn = TT < 7.9 ? ss(4.7, 5.5, TT) : 1 - ss(7.9, 8.45, TT), kN = TT < 7.9 ? ss(5.4, 6.2, TT) : 1 - ss(7.9, 8.3, TT);
  ykCard(printSrc(), 'Corpo-Seco', kIn, kN, { y: 320, w: 720, h: 524, pw: 90, seal: '屍' });
}
const HL = (x, y, z) => V3(x, y, z).add(HOUSE);
function shotHouse() {   // Tião over his mother, the oil lamp behind him throwing his shadow up the wall over her
  const Wd = world(), t = TT, T = Wd.tiao, M = Wd.mother, raise = easeOut(ss(9.6, 10.9, t)), sway = 0.03 * Math.sin(t * 1.4);
  { const at = HL(-0.3, 0, -0.55), F = HL(0.3, 0, -1.2).sub(at).setY(0).normalize(), Lx = UPV.clone().cross(F), lean = 0.08 + 0.06 * raise, U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)).normalize();
    const pos = at.clone().addScaledVector(F, 0.02 + sway).setY((T.pd.thigh + T.pd.shin) * 0.96 + T.pd.ank), B = frameOf(U, F), R = B.X.clone().negate(), top = pos.clone().addScaledVector(B.Y, T.pd.torso);
    const feet = [at.clone().addScaledVector(Lx, 0.14).addScaledVector(F, 0.12).setY(T.pd.ank), at.clone().addScaledVector(Lx, -0.16).addScaledVector(F, -0.12).setY(T.pd.ank)];
    const SR = top.clone().addScaledVector(R, T.pd.shW), hang = SR.clone().addScaledVector(DOWN, 0.55).addScaledVector(F, 0.08), up = SR.clone().addScaledVector(UPV, 0.42).addScaledVector(F, -0.05).addScaledVector(R, 0.1), wr = hang.clone().lerp(up, raise);
    const hdR = slerpYZ({ Y: R.clone(), Z: DOWN.clone() }, { Y: F.clone().negate(), Z: UPV.clone().addScaledVector(R, 0.2).normalize() }, raise);
    poseP(T, { pos, U, F, head: headRel(B, 0.42, 0, 0), hands: [top.clone().addScaledVector(B.X, T.pd.shW + 0.05).addScaledVector(DOWN, 0.55).addScaledVector(F, 0.1), wr], hdir: [null, hdR].map((h, i) => h || { Z: DOWN.clone().addScaledVector(F, 0.1), Y: B.X.clone() }),
      epole: [B.X.clone().addScaledVector(F, -1), R.clone().multiplyScalar(0.8).addScaledVector(F, -0.3).addScaledVector(UPV, raise * 0.3)], feet, kpole: F.clone(), curl: [0.75, 0.2], grip: [false, true], breath: Math.sin(t * 3.2) * 1.5 });
    // the strap hangs from his fist: a chain of short segments trailing behind the raised hand
    const h = T.arm[1].hand; h.updateMatrixWorld(true); let p = h.localToWorld(gripFit(T).c.clone()); Wd.strap.visible = true;
    Wd.strapSeg.forEach((m, k) => { const d = DOWN.clone().lerp(F.clone().negate().addScaledVector(DOWN, 0.6), raise * (1 - k * 0.12)).addScaledVector(R, 0.15 * Math.sin(t * 2 + k)).normalize(), q = p.clone().addScaledVector(d, 0.1); between(m, p, q, 0.012, 0.004); p = q; }); }
  { const at = HL(0.38, 0, -1.25), F = HL(-0.3, 0, -0.55).sub(at).setY(0).normalize(), Lx = UPV.clone().cross(F), tr = 0.006 * Math.sin(t * 13) + 0.004 * Math.sin(t * 19), lean = -0.12, U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)).normalize();
    const pos = at.clone().addScaledVector(F, -0.02).setY(0.5 + tr), B = frameOf(U, F), top = pos.clone().addScaledVector(B.Y, M.pd.torso);
    const feet = [at.clone().addScaledVector(Lx, 0.12).addScaledVector(F, -0.42).setY(0.15), at.clone().addScaledVector(Lx, -0.12).addScaledVector(F, -0.4).setY(0.15)];
    const Hc = top.clone().addScaledVector(B.Y, 0.15), hands = [Hc.clone().addScaledVector(B.X, 0.09).addScaledVector(B.Y, 0.12).addScaledVector(F, 0.24), Hc.clone().addScaledVector(B.X, -0.08).addScaledVector(B.Y, 0.2).addScaledVector(F, 0.2)];   // palms up between her face and him
    poseP(M, { pos, U, F, head: headRel(B, -0.3, 0.25, 0.2 + tr * 3), hands, hdir: [{ Y: F.clone().negate(), Z: UPV.clone().addScaledVector(B.X, -0.2).normalize() }, { Y: F.clone().negate(), Z: UPV.clone().addScaledVector(B.X, 0.2).normalize() }],
      epole: [B.X.clone().addScaledVector(DOWN, 0.8), B.X.clone().negate().addScaledVector(DOWN, 0.8)], feet, fdir: [{ Z: F.clone().negate().addScaledVector(DOWN, 0.15).normalize(), Y: DOWN.clone() }, { Z: F.clone().negate().addScaledVector(DOWN, 0.15).normalize(), Y: DOWN.clone() }],
      kpole: F.clone().addScaledVector(DOWN, 0.3), curl: [0.2, 0.25], spread: [0.5, 0.5], twitch: 0.8, skirtLen: 0.95, skirtW: 1.25 }); }
  const fl = 0.96 + 0.025 * Math.sin(t * 5.1) + 0.015 * Math.sin(t * 8.3); Wd.lampL.position.copy(Wd.lampP); Wd.lampL.intensity = 3.6 * fl; Wd.houseFlame.scale.set(0.012, 0.035 * fl, 0.012);
  Wd.lampGlow.visible = true; Wd.lampGlow.position.copy(Wd.lampP); Wd.lampGlow.scale.setScalar(0.5 * fl); Wd.lampGlow.material.opacity = 0.7;
  Wd.fill.position.copy(HL(1.45, 0.55, -1.25)); Wd.fill.intensity = 2.2 * (0.97 + 0.03 * Math.sin(t * 4)); Wd.fill.distance = 3.5; Wd.fill.color.set('#ff9a50');   // the stove's fire
  Wd.key.color.set('#ffb868'); Wd.key.position.copy(HL(1.0, 1.75, 0.9)); Wd.key.target.position.copy(HL(0.0, 0.9, -0.9)); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = 3.2 * fl; Wd.key.angle = 0.75; Wd.key.penumbra = 0.8;   // the lamp's spill on the two of them
  const k = ss(8.5, 14.6, t), cam = HL(lerp(2.4, 2.3, k), 0.6, lerp(1.3, 1.22, k));
  render3D('house', cam, HL(0.08, lerp(0.62, 0.64, k), -0.95), { vis: ss(8.5, 8.9, t), fov: 72, motes: { p: Wd.lampP, r: 0.8, a: 0.6 }, shadowAt: HOUSE });
}
const GL = (x, y, z) => V3(x, y, z).add(GRAVE);
function placeCoffin(Wd, lidOff) {   // the coffin lying on the dirt beside the open grave; the lid pushed half off (lidOff 1: fallen on the ground)
  const c = Wd.coffin; c.visible = true; c.position.copy(GL(-1.15, 0, 0.15)); c.position.y = cemH(c.position.x, c.position.z) + 0.015; c.rotation.set(0, 0.12, 0.03);
  const L = Wd.lid; L.visible = true; c.updateMatrixWorld(true);
  if (lidOff < 1) { L.position.copy(c.localToWorld(V3(0.16, 0.36, 0.25))); L.rotation.set(-Math.PI / 2, 0, 0.12 + 0.25); L.rotateY(0.12); L.rotateZ(0.0); }
  else { L.position.copy(GL(-1.95, 0, 0.6)); L.position.y = cemH(L.position.x, L.position.z) + 0.1; L.rotation.set(-Math.PI / 2 + 0.05, 0.08, 0.7); }
  L.updateMatrixWorld(true);
}
function shotGrave() {   // dusk at the chapel: the open grave, and the coffin lying on the dirt beside it again
  const Wd = world(), t = TT, k = ss(14.6, 20.6, t); placeCoffin(Wd, 0);
  Wd.bell.rotation.z = 0.25 * Math.sin(t * 2.2) * (1 - ss(17, 20, t));
  const C = GL(-1.15, 0.2, 0.15), cam = C.clone().add(V3(lerp(-0.45, -0.4, k), lerp(1.05, 0.98, k), lerp(2.3, 2.05, k)));
  render3D('dusk', cam, C.clone().add(V3(0.3, -0.35, -0.4)), { fov: 56, moonDir: V3(-0.8, 0.55, 0.7), moonS: 9, shadowAt: GRAVE, mist: 0.8 });
}
function shotDried() {   // the dried body standing by its coffin: arms hanging to the knees, head tilted, grinning
  const Wd = world(), t = TT, P = Wd.corpo, k = ss(20.6, 26.6, t); placeCoffin(Wd, 1);
  const at = GL(-1.35, 0, -1.25); at.y = cemH(at.x, at.z); const camP = GL(lerp(-0.5, -0.65, k), lerp(0.95, 0.9, k), lerp(1.2, 0.85, k));
  const F = camP.clone().sub(at).setY(0).normalize().applyAxisAngle(UPV, -0.15), Lx = UPV.clone().cross(F), lean = 0.1 + 0.02 * Math.sin(t * 0.8), U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)).addScaledVector(Lx, 0.05).normalize();
  const feet = [at.clone().addScaledVector(Lx, 0.11).addScaledVector(F, 0.03), at.clone().addScaledVector(Lx, -0.11).addScaledVector(F, -0.03)].map((p) => p.setY(cemH(p.x, p.z) + P.pd.ank));
  const pos = at.clone().setY(at.y + (P.pd.thigh + P.pd.shin) * 0.975 + P.pd.ank), B = frameOf(U, F), top = pos.clone().addScaledVector(B.Y, P.pd.torso);
  const jerk = ss(23.6, 23.75, t) * (1 - 0.3 * ss(24.5, 26, t)), tilt = 0.35 + 0.35 * jerk;
  const head = slerpYZ(headRel(B, 0.15, 0.1, tilt), lookYZ(top.clone().addScaledVector(B.Y, 0.22), camP, tilt), 0.75);
  const hang = (i) => top.clone().addScaledVector(B.X, (i ? -1 : 1) * (P.pd.shW + 0.06)).addScaledVector(DOWN, P.pd.uArm + P.pd.fArm - 0.03).addScaledVector(F, 0.06);
  poseP(P, { pos, U, F, head, hands: [hang(0), hang(1)], hdir: [{ Z: DOWN.clone().addScaledVector(F, 0.15), Y: B.X.clone() }, { Z: DOWN.clone().addScaledVector(F, 0.15), Y: B.X.clone().negate() }], feet, kpole: F.clone(),
    curl: [0.3 + 0.2 * Math.sin(t * 1.3), 0.35 + 0.2 * Math.sin(t * 1.1 + 1)], spread: [0.4, 0.5], twitch: 0.9, jaw: 0.35 + 0.15 * jerk, glint: 0.9, breath: 0 });
  Wd.key.position.copy(camP.clone().add(V3(-1.6, 1.4, 0.4))); Wd.key.target.position.copy(top); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = 2.6; Wd.key.angle = 0.45; Wd.key.penumbra = 0.6;
  render3D('dusk', camP, top.clone().addScaledVector(B.Y, -0.18), { fov: 54, moonDir: V3(-0.8, 0.55, 0.7), moonS: 9, shadowAt: GRAVE, rim: 0.9, rimDir: at.clone().sub(camP).setY(0).normalize().setY(0.6), mist: 0.8 });
}
function shotTree() {   // the dead tree at the bend; then close: a long hand slipping into the split
  const Wd = world(), t = TT;
  if (t < 29.6) { const k = ss(26.6, 29.6, t), ra = roadAt(TREE.s - 11 + 1.2 * k), cam = ra.p.clone().addScaledVector(ra.r, 0.6).setY(1.15), tg = TL(0, 2.6, 0);
    render3D('night', cam, tg, { fov: 50, moonDir: moonBehind(cam, Wd.tree.position, 0.5, 0.18), moonS: 18, rim: 1.0, mist: 1 }); return; }
  const k = ss(29.6, 32.6, t), back = ss(29.9, 32.3, t);   // it sinks back into the dark of the trunk, the long fingers sliding off the lips last
  corpoInTrunk(Wd, { look: TL(lerp(0.6, -1.5, ss(29.6, 31, t)), 1.7, 2.5), turn: 1 - 0.6 * ss(29.8, 31.2, t), jaw: 0.3, glint: 0.8 * (1 - ss(31.6, 32.2, t)), out: lerp(0.05, -0.42, back), handsIn: ss(31.2, 32.3, t), lean: -0.15 * back });
  const cam = TL(lerp(0.35, 0.28, k), lerp(1.5, 1.48, k), lerp(2.15, 1.95, k)); Wd.key.position.copy(TL(-1.2, 1.9, 2.0)); Wd.key.target.position.copy(TL(0, 1.75, 0.3)); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = 3.6; Wd.key.angle = 0.22; Wd.key.penumbra = 0.6;
  render3D('night', cam, TL(0.02, 1.48, 0.3), { fov: 46, moonDir: moonBehind(cam, Wd.tree.position, 0.55, 0.35), rim: 1.2, light: { hemI: 0.6, moonI: 0.5 } });
}
// the cart's progress: it rolls up the road at 0.9 m/s and stops with the yoke 2.6 m short of the tree (STOP_T)
const STOP_T = 38.9, sCart = (t) => TREE.s - 6.6 - Math.max(0, STOP_T - t) * 0.9 + (t > STOP_T ? -0.15 * ss(STOP_T + 0.3, STOP_T + 1.2, t) : 0);
function shotCart() {   // grandfather on the ox cart at night; the lantern swinging on the yoke
  const Wd = world(), t = TT, s = sCart(t); placeCart(Wd, s); const sw = V3(0.12 * Math.sin(t * 2.3), 0, 0.18 * Math.sin(t * 1.7 + 0.5)); hangLantern(Wd, sw); lantern(Wd);
  seatMan(Wd, { s, head: null });
  if (t < 35.6) { const k = ss(32.6, 35.6, t), cam = CL(lerp(-1.25, -1.15, k), lerp(1.75, 1.72, k), lerp(-6.6, -6.3, k)), tg = CL(0.15, 1.45, -2.4);
    Wd.lanGlow.scale.setScalar(0.45); Wd.lanGlow.material.opacity = 0.5; Wd.fill.color.set('#ffb060'); Wd.fill.position.copy(CL(-0.4, 2.2, -2.3)); Wd.fill.intensity = 1.5; Wd.fill.distance = 3.2;   // the lantern's spill on him
    render3D('night', cam, tg, { fov: 52, moonDir: CD(0.6, 0, 1).setY(0.45), moonS: 14, shadowAt: CL(0, 0, -2), motes: { p: Wd.lanL.position, r: 0.5, a: 0.5 } }); return; }
  const k = ss(35.6, 38.6, t), cam = CL(lerp(2.4, 2.25, k), lerp(1.75, 1.7, k), lerp(-2.9, -2.6, k));
  render3D('night', cam, CL(-0.1, 1.2, -0.85), { fov: 50, moonDir: CD(-0.6, 0, 1).setY(0.45), shadowAt: CL(0, 0, -2), motes: { p: Wd.lanL.position, r: 0.6, a: 0.7 } });
}
// grandfather's descent: seated → stands on the bed front → steps to its right edge → drops to the road → walks to the tree
function shotStop() {
  const Wd = world(), t = TT, s = sCart(t), balk = ss(STOP_T - 0.2, STOP_T + 0.4, t) * (t < 41.6 ? 1 : 0.6);
  placeCart(Wd, s, { ox: { balk, stamp: balk }, dOff: 0 }); const sw = V3(0.12 * Math.sin(t * 2.3) + 0.25 * balk * Math.sin(t * 5.1), 0, 0.15 * Math.sin(t * 1.7) + 0.2 * balk * Math.sin(t * 4.3)); hangLantern(Wd, sw); lantern(Wd);
  if (t < 41.6) { seatMan(Wd, { s, head: headRel(frameOf(CD(0, 1, 0), CD(0, 0, -1)), 0.0, -0.15, 0) });
    const cam = TL(-0.7, 0.95, 1.25).lerp(TL(-0.8, 0.95, 1.5), ss(38.6, 41.6, t)); render3D('night', cam, CL(0.05, 0.75, -4.4), { fov: 56, moonDir: moonBehind(cam, CL(0, 0, -3), 0.5, 2.6), shadowAt: CL(0, 0, -3.5), motes: { p: Wd.lanL.position, r: 0.6, a: 0.7 } }); return; }
  // he stands on the bed, steps off its right side (both feet planted, one then the other), then walks toward the tree
  const P = Wd.man, u = t - 41.6, K = (keys) => panV(keys, t);
  if (t < 43.0) {
    const BY = CART.bedY + 0.03 + P.pd.ank;
    const pel = K([[41.6, [0.02, Wd.seatY + 0.07, CART.bedZ0 + 0.74]], [42.1, [0.25, CART.bedY + 0.9, CART.bedZ0 + 0.55]], [42.35, [0.4, CART.bedY + 0.68, CART.bedZ0 + 0.52]], [42.55, [0.72, CART.bedY + 0.55, CART.bedZ0 + 0.5]], [42.72, [0.98, 0.76, CART.bedZ0 + 0.46]], [43.0, [0.98, 0.9, CART.bedZ0 + 0.44]]]);
    const fR = K([[41.6, [0.12, BY, CART.bedZ0 + 0.26]], [41.95, [0.3, BY, CART.bedZ0 + 0.42]], [42.35, [0.48, BY, CART.bedZ0 + 0.42]], [42.45, [0.72, BY + 0.06, CART.bedZ0 + 0.4]], [42.55, [0.88, 0.75, CART.bedZ0 + 0.36]], [42.72, [1.08, P.pd.ank, CART.bedZ0 + 0.34]]]);
    const fL = K([[41.6, [-0.13, BY, CART.bedZ0 + 0.3]], [42.1, [0.2, BY, CART.bedZ0 + 0.66]], [42.35, [0.32, BY, CART.bedZ0 + 0.64]], [42.47, [0.66, BY + 0.06, CART.bedZ0 + 0.62]], [42.57, [0.78, 0.72, CART.bedZ0 + 0.6]], [42.72, [0.9, P.pd.ank, CART.bedZ0 + 0.6]]]);
    const lift = (a0, a1) => 0.1 * Math.sin(Math.PI * ss(a0, a1, t)) * (t > a0 && t < a1 ? 1 : 0);
    fR.y += lift(41.6, 41.95); fL.y += lift(41.8, 42.1);
    const pos = CL(pel.x, pel.y, pel.z), feet = [CL(fL.x, fL.y, fL.z), CL(fR.x, fR.y, fR.z)];
    const Dw = TL(-0.15, 0, 1.6).sub(CL(0.98, 0, CART.bedZ0 + 0.46)).setY(0).normalize(), Fl = CD(1, 0, -0.35 * ss(41.6, 42.2, t)).lerp(CD(0, 0, -1), 1 - ss(41.6, 42.1, t)).normalize().lerp(Dw, ss(42.6, 43.0, t)).normalize(), lean = 0.12 + 0.18 * Math.sin(Math.PI * ss(42.1, 43.0, t)), U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(Fl, Math.sin(lean)).normalize();
    const B = frameOf(U, Fl), R = B.X.clone().negate(), top = pos.clone().addScaledVector(B.Y, P.pd.torso);
    const D = UPV.clone().addScaledVector(Fl, 0.35).addScaledVector(R, 0.1).normalize(), hdR = barHand(D, B.X.clone().addScaledVector(Fl, 0.3)), wr = wristFor(P, top.clone().addScaledVector(R, P.pd.shW).addScaledVector(DOWN, 0.36).addScaledVector(Fl, 0.22), hdR);
    poseP(P, { pos, U, F: Fl, head: headRel(B, lerp(0.25, 0.12, ss(42.6, 43, t)), lerp(0.1, 0.1 * Math.sin(t * 0.9), ss(42.6, 43, t)), 0), hands: [top.clone().addScaledVector(B.X, P.pd.shW + 0.05).addScaledVector(DOWN, 0.5).addScaledVector(Fl, 0.05), wr], hdir: [{ Z: DOWN.clone().addScaledVector(Fl, 0.2), Y: B.X.clone() }, hdR],
      epole: [B.X.clone().addScaledVector(Fl, -1), R.clone().multiplyScalar(0.6).addScaledVector(Fl, -0.4).addScaledVector(DOWN, 0.5)], feet, fdir: [{ Z: Fl.clone(), Y: UPV.clone() }, { Z: Fl.clone(), Y: UPV.clone() }], kpole: Fl.clone().addScaledVector(UPV, 0.2), curl: [0.4, 0], grip: [false, true], breath: Math.sin(t * 2.6) });
    holdProp(P, 1, Wd.goad);
  } else { const O = CL(0.98, 0, CART.bedZ0 + 0.46), D = TL(-0.15, 0, 1.6).sub(O).setY(0).normalize(); walkMan(Wd, { O, D, s: 0.55 * (t - 43.0), look: 0.1 * Math.sin(t * 0.9), pitch: 0.12 }); }
  const k = ss(41.6, 45, t), cam = CL(lerp(2.9, 3.1, k), 1.55, lerp(-2.6, -3.6, k)), tg = CL(lerp(0.6, 1.4, ss(42.6, 45, t)), 1.15, lerp(-1.0, -2.4, ss(42.6, 45, t)));
  render3D('night', cam, tg, { fov: 52, vis: 1 - ss(44.6, 45.0, t), moonDir: moonBehind(cam, Wd.tree.position, 0.55, 0.35), rim: 0.9, shadowAt: CL(0.5, 0, -2), motes: { p: Wd.lanL.position, r: 0.6, a: 0.6 } });
}
// the hit: on his back. The man stands 1.3 m in front of the split (road side), turned to the road; it clings to his back
const HIT_AT = () => TL(-0.15, 0, 1.45);
function manHit(Wd, o = {}) {
  const P = Wd.man, at = HIT_AT(), F = (o.F || TD(0.25, 0, 1)).clone().setY(0).normalize(), Lx = UPV.clone().cross(F), t = TT, sag = o.sag ?? 0.5;
  const feet = [at.clone().addScaledVector(Lx, 0.16).addScaledVector(F, 0.1), at.clone().addScaledVector(Lx, -0.15).addScaledVector(F, -0.12)].map((p) => p.setY(groundAt(p.x, p.z) + P.pd.ank));
  const lean = 0.22 + 0.06 * sag + 0.03 * Math.sin(t * 7) * (o.shake ?? 1), U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)).addScaledVector(Lx, 0.05 * Math.sin(t * 3)).normalize();
  const gy = (feet[0].y + feet[1].y) / 2 - P.pd.ank, pos = at.clone().addScaledVector(F, -0.06).setY(gy + (P.pd.thigh + P.pd.shin) * (0.92 - 0.04 * sag) + P.pd.ank - 0.03);
  const B = frameOf(U, F), R = B.X.clone().negate(), top = pos.clone().addScaledVector(B.Y, P.pd.torso);
  const head = headRel(B, -0.25 + 0.05 * Math.sin(t * 5), o.look ?? -0.35, 0.1);
  // his hands claw at the forearm across his chest (right) and hang/grope (left)
  const C = Wd.corpo, ca = C.arm, fo = (i) => ca[i].E.clone().lerp(ca[i].W, 0.55);
  return { P, pos, U, F, B, top, R, feet, head, fo };
}
function corpoOnBack(Wd, M, o = {}) {
  const C = Wd.corpo, B = M.B, t = TT, F = B.Z, X = B.X, R = X.clone().negate(), mp = M.P.pd;
  // its body pressed to his back, parallel to his spine; its head craned round beside his, over his right shoulder
  const N = M.top.clone().addScaledVector(B.Y, 0.16).addScaledVector(F, -0.23).addScaledVector(R, 0.02), U = B.Y.clone(), pos = N.clone().addScaledVector(U, -C.pd.torso);
  const headAt = M.P.H.position.clone().addScaledVector(R, 0.205).addScaledVector(F, -0.04 + (o.crane ?? 0) * 0.06).addScaledVector(B.Y, -0.035);
  const look = lookYZ(headAt, o.look, -0.3 + 0.07 * Math.sin(t * 3)), head = look;
  // arms over his shoulders, elbows jutting up behind his head; the palms flat on his upper chest, the long fingers spread down it
  const chest = (sx, y, z) => M.P.T.localToWorld(V3(sx, y, z)), cc = M.P.T.localToWorld(V3(0, mp.torso * 0.56, 0));
  const nrm = (p) => { const v = p.clone().sub(cc); v.addScaledVector(B.Y, -v.dot(B.Y)); return v.normalize(); };
  const P0 = [chest(0.08, mp.torso * 0.7, 0.14), chest(-0.085, mp.torso * 0.6, 0.145)], hs = C.pd.hs;
  const hands = [], hdir = [];
  P0.forEach((p, i) => { const n = nrm(p), z = DOWN.clone().addScaledVector((i ? R : X), -0.25).addScaledVector(n, -DOWN.dot(n)).normalize(); hands.push(p.clone().addScaledVector(n, 0.031 * hs).addScaledVector(z, -0.05)); hdir.push({ Y: n, Z: z }); });
  const ep = [X.clone().multiplyScalar(0.2).addScaledVector(B.Y, 0.35).addScaledVector(F, -1), R.clone().multiplyScalar(0.6).addScaledVector(B.Y, 0.35).addScaledVector(F, -1)];
  // legs round his hips: knees jutting out at his sides, feet hooked in front of his thighs
  const feet = [M.pos.clone().addScaledVector(X, 0.2).addScaledVector(F, 0.1).addScaledVector(B.Y, -0.24), M.pos.clone().addScaledVector(R, 0.2).addScaledVector(F, 0.1).addScaledVector(B.Y, -0.26)];
  poseP(C, { pos, U, F, head, headAt, hands, hdir, epole: ep, feet, kpoles: [X.clone().addScaledVector(F, -0.5).addScaledVector(B.Y, 0.3), R.clone().addScaledVector(F, -0.5).addScaledVector(B.Y, 0.3)], fdir: [{ Z: R.clone().addScaledVector(F, 0.4), Y: F.clone() }, { Z: X.clone().addScaledVector(F, 0.4), Y: F.clone() }],
    curl: [0.07 + 0.04 * Math.sin(t * 5), 0.08 + 0.04 * Math.sin(t * 4.3)], spread: [0.7, 0.6], twitch: 0.08, jaw: o.jaw ?? 0.35, glint: 1, breath: 0 });
  return C;
}
function shotHit() {
  const Wd = world(), t = TT, s = sCart(t); placeCart(Wd, s, { ox: { balk: 0.6 + 0.4 * ss(45.6, 46.5, t), stamp: 1 } }); Wd.trunkOpen.visible = false; Wd.trunkWide.visible = true; Wd.pocket.visible = true;
  // the lantern: swinging on the yoke, then jerked off its hook when the oxen bolt (51.4), falling to the road in front of us
  const fallT = 51.4, LND = TL(-1.15, 0, 2.55); LND.y = groundAt(LND.x, LND.z);
  if (t < fallT) { hangLantern(Wd, V3(0.35 * Math.sin(t * 5.1), 0, 0.3 * Math.sin(t * 4.3))); }
  else { const u = clamp((t - fallT) / 0.42), hook = CL(0, CART.yokeY + 0.53, CART.yokeZ - 0.075), L = Wd.lantern; L.visible = true;
    const p = hook.clone().lerp(LND.clone().add(V3(0, 0.08, 0)), u); p.y = lerp(hook.y, LND.y + 0.08, u * u) + 0.35 * Math.sin(Math.PI * u) * 0.4; L.position.copy(p);
    L.quaternion.setFromEuler(new THREE.Euler(0, 0.7, -Math.PI / 2 * ss(0.5, 1, u) - 0.15 * ss(1, 1.6, (t - fallT) / 0.42) * (1 - ss(53, 54, t)) )); L.updateMatrixWorld(true); }
  lantern(Wd, null, t < fallT ? 1 : 0.75 + 0.25 * Math.sin(t * 13) * (1 - ss(52, 55, t)));
  const close = t < 50.6; let cam = close ? TL(lerp(-0.5, -0.45, ss(45.6, 50.6, t)), lerp(1.55, 1.52, ss(45.6, 50.6, t)), lerp(2.75, 2.6, ss(45.6, 50.6, t))) : null;
  const M = manHit(Wd, { sag: close ? 0.5 : 0.8, look: close ? -0.3 + 0.15 * Math.sin(t * 1.3) : -0.5 });
  if (!close) { const k = ss(50.6, 56, t); cam = M.pos.clone().addScaledVector(M.R, lerp(1.45, 1.3, k)).addScaledVector(M.F, 0.55).addScaledVector(M.B.Z, -0.0).setY(M.pos.y + 0.3); }
  Wd.key.color.set('#ffb868'); Wd.key.position.copy(M.top.clone().addScaledVector(M.F, 2.2).addScaledVector(M.R, 1.2).addScaledVector(UPV, 0.3)); Wd.key.target.position.copy(M.top); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = 2.4; Wd.key.angle = 0.4; Wd.key.penumbra = 0.6;
  const turn = close ? 1 : 1 - 0.0, lookAt = close ? M.top.clone().addScaledVector(M.F, 1.2).addScaledVector(M.B.X, -0.4) : (t < 53.2 ? M.top.clone().addScaledVector(M.F, 1).addScaledVector(M.B.X, -0.6) : cam);
  // pose him first (his hands need the creature's arms), then the creature, then his hands on its forearm
  poseP(M.P, { fear: 1, pos: M.pos, U: M.U, F: M.F, head: M.head, hands: [M.top.clone().addScaledVector(M.B.X, 0.32).addScaledVector(DOWN, 0.5), M.top.clone().addScaledVector(M.R, 0.32).addScaledVector(DOWN, 0.5)], feet: M.feet, kpole: M.F.clone(), curl: [0.6, 0.6] });
  const C = corpoOnBack(Wd, M, { look: t < 53.2 || close ? lookAt : slerpV(lookAt, cam, ss(53.2, 53.7, t)), turn, jaw: close ? 0.25 + 0.3 * ss(46.0, 46.6, t) : 0.5 });
  // his hands close round its forearms where they come over his shoulders (each fist round a forearm, the bar = the forearm)
  const gf = gripFitR(M.P, 0.031), grabs = [0, 1].map((i) => { const a = C.arm[i], D = a.W.clone().sub(a.E).normalize(), G = a.E.clone().lerp(a.W, 0.84), n = G.clone().sub(M.top).addScaledVector(M.B.Y, 0).normalize(), hf = barHand(i ? D.clone().negate() : D, n.clone().negate().addScaledVector(DOWN, 0.3)); return { w: wristFor(M.P, G, hf, gf), hf }; });
  const lh = M.top.clone().addScaledVector(M.B.X, M.P.pd.shW + 0.16).addScaledVector(DOWN, 0.42).addScaledVector(M.F, 0.18 + 0.03 * Math.sin(t * 6));
  poseP(M.P, Object.assign({}, M.P.st, { hands: [lh, grabs[1].w], hdir: [{ Y: M.B.X.clone().addScaledVector(M.F, -0.3), Z: M.F.clone().addScaledVector(DOWN, 0.5).normalize() }, grabs[1].hf], epole: [M.B.X.clone().addScaledVector(DOWN, 0.5).addScaledVector(M.F, 0.6), M.R.clone().addScaledVector(DOWN, 0.5).addScaledVector(M.F, 0.6)], curl: [0.75, 0.6], spread: [0.6, 0], twitch: 0.6, grip: [false, true], gripK: [1, 1], gripA: [null, gf.A] }));
  Wd.goad.visible = true; Wd.goad.position.copy(TL(0.55, 0, 1.75)).setY(groundAt(...TL(0.55, 0, 1.75).toArray().filter((_, i) => i !== 1)) + 0.02); Wd.goad.rotation.set(0, 0.9, 0.02);
  if (close) render3D('night', cam, M.top.clone().addScaledVector(DOWN, 0.22).addScaledVector(M.B.X, -0.1), { fov: 46, moonDir: moonBehind(cam, Wd.tree.position, 0.55, -0.25), rim: 1.3, shadowAt: M.pos, light: { hemI: 0.75 } });
  else render3D('night', cam, M.top.clone().addScaledVector(DOWN, 0.12).addScaledVector(M.F, -0.12), { fov: 52, moonDir: moonBehind(cam, Wd.tree.position, 0.6, -0.2), rim: 1.2, shadowAt: M.pos, light: { hemI: 0.7 } });
}
const slerpV = (a, b, k) => a.clone().lerp(b, k);
function shotDawn() {   // dawn: the oxen still yoked on the road, his lantern on its side in the dirt; then the tree with two faces
  const Wd = world(), t = TT, s = sCart(80); placeCart(Wd, s, { ox: { balk: 0 }, dOff: 0 }); Wd.oxen.forEach((O) => { O.neck.rotation.x = 0.35 + 0.05 * Math.sin(t * 0.5 + O.i); O.neck.rotation.y = 0.2 * (O.i ? 1 : -1) + 0.05 * Math.sin(t * 0.3); });
  const LND = TL(-1.15, 0, 2.55); LND.y = groundAt(LND.x, LND.z); const L = Wd.lantern; L.visible = true; L.position.copy(LND).add(V3(0, 0.08, 0)); L.quaternion.setFromEuler(new THREE.Euler(0, 0.7, -Math.PI / 2)); L.updateMatrixWorld(true); lantern(Wd, null, 0);
  Wd.goad.visible = true; { const gp = TL(0.55, 0, 1.75); Wd.goad.position.copy(gp).setY(groundAt(gp.x, gp.z) + 0.02); Wd.goad.rotation.set(0, 0.9, 0.02); }
  if (t < 63) { const k = ss(56, 63, t), yk = CL(0.2, 0, -3.0), dir = LND.clone().sub(yk).setY(0).normalize().applyAxisAngle(UPV, 0.25), cam = LND.clone().addScaledVector(dir, lerp(2.5, 2.25, k)).setY(LND.y + lerp(0.6, 0.55, k));
    render3D("dawn", cam, LND.clone().lerp(yk, 0.08).setY(LND.y - 0.12), { fov: 52, vis: ss(56, 56.6, t), moonDir: moonBehind(cam, Wd.tree.position, 0.12, 1.2), moonS: 0.01, shadowAt: LND, mist: 1.2 }); return; }
  Wd.trunkOpen.visible = false; Wd.trunkShut.visible = true; Wd.pocket.visible = false; Wd.barkFaces.visible = true;
  Wd.hat.visible = true; Wd.hat.position.copy(TL(0.62, 0.04, 0.72)); Wd.hat.position.y = groundAt(Wd.hat.position.x, Wd.hat.position.z) + 0.03; Wd.hat.rotation.set(0.15, 0.4, 0.1);
  const k = ss(63, 71, t), cam = TL(lerp(0.04, 0.02, k), lerp(1.72, 1.8, k), lerp(2.75, 2.0, k)); Wd.key.position.copy(TL(-0.4, 2.2, 2.1)); Wd.key.target.position.copy(TL(0, 1.9, 0.45)); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = 3.0; Wd.key.angle = 0.35; Wd.key.penumbra = 0.6; Wd.key.color.set('#e8dcc4');
  render3D('dawn', cam, TL(0.02, lerp(1.66, 1.75, k), 0.3), { fov: 50, vis: 1 - ss(70, 71, t), moonDir: moonBehind(cam, Wd.tree.position, 0.15, 0.9), moonS: 0.01, shadowAt: Wd.tree.position, rim: 0.6, mist: 1 });
}

const PARA = [
  ['If a dead tree by the road turns its face toward you, don\'t stop. My grandfather stopped.', 0.4, 8.2],
  ['In our village everyone knew about Tião, the farmer who beat his own mother every night until she died.', 9.0, 14.35],
  ['When he died, the ground would not keep him. Every morning his coffin was lying on the dirt again.', 15.1, 20.35],
  ['Heaven refused him. Hell refused him. He never rotted. He only dried.', 21.1, 26.35],
  ['They say he crawled inside the dead tree at the bend of the road, and waits there.', 27.1, 32.35],
  ['My grandfather drove his ox cart home that way after dark, a lantern on the yoke.', 33.1, 38.35],
  ['The oxen stopped at the tree and would not move. He climbed down to see why.', 39.1, 44.7],
  ['The bark split. Something dry and grinning was already on his back.', 46.3, 55.75],
  ['At dawn we found the oxen still in the yoke. Only his lantern was left on the road. The tree has two faces now.', 56.6, 70.6],
];
function sceneTale() {
  const t = TT; fillAll('#020306'); resetWorld(world());
  if (window.DBG_SHOT) window.DBG_SHOT(); else   // debug views only (never set in the piece)
  if (t < 4.5) shotOpen(); else if (t < 8.5) shotCard(); else if (t < 14.6) shotHouse(); else if (t < 20.6) shotGrave(); else if (t < 26.6) shotDried();
  else if (t < 32.6) shotTree(); else if (t < 38.6) shotCart(); else if (t < 45.6) { if (t < 45.0) shotStop(); } else if (t < 56) shotHit(); else shotDawn();
  PARA.forEach(([s, a, b]) => ykPara(s, a, b, { cy: 1300 }));
  if (t >= 66.2) { const f = () => ykBadge(asset('kodama.jpg'), 'kodamashorts', CX, 290, ss(66.2, 66.9, t) * (1 - ss(70.4, 71, t))); if (DEFER) DEFER.push(f); else f(); }
}
