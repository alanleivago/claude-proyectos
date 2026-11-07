// =====================================================================
//  RUN — the shots. People are posed by walkP (standing / walking) and crawlP (prone, headfirst); the crawler by
//  world points; the headlamp is one shadowed spot light that follows the brother's head.
// =====================================================================
const easeOut = (x) => 1 - (1 - x) ** 3;
const DOWN = V3(0, -1, 0), UPV = V3(0, 1, 0);
const yzOf = (q) => ({ Y: V3(0, 1, 0).applyQuaternion(q), Z: V3(0, 0, 1).applyQuaternion(q) });
function headRel(B, pitch, yaw, roll) { const q = qBasis(B.X, B.Y, B.Z).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ'))); return yzOf(q); }
// a damaged light: mostly on, with stutters (seeded by the second)
function broken(t, k = 1) { const s = Math.floor(t * 9), h = hsh(s, 11), h2 = hsh(Math.floor(t * 23), 12); let v = 1; if (h < 0.25 * k) v = 0.15 + 0.3 * h2; else if (h < 0.4 * k) v = 0.6 + 0.3 * h2; return v; }

function animWorld(Wd, t, o = {}) {
  WIND.value = t; const cam = Wd.cam.position;
  Wd.sky.position.copy(cam); Wd.ridges.forEach((m) => m.position.set(cam.x, cam.y + m.userData.y - 30 + (o.ridgeY ?? 0), cam.z));
  const md = (o.moonDir || V3(-0.3, 0.45, -1)).clone().normalize(); Wd.moonDisk.position.copy(cam).addScaledVector(md, 500); Wd.moonDisk.lookAt(cam); Wd.moonDisk.scale.setScalar(o.moonS ?? 26); Wd.moonHalo.position.copy(Wd.moonDisk.position).addScaledVector(md, 1); Wd.moonHalo.scale.setScalar((o.moonS ?? 26) * 5);
  { const c = o.motes; Wd.motes.visible = !!c; if (c) { const P = Wd.motes.geometry.attributes.position; Wd.moteP.forEach((q, i) => { const r = c.r ?? 1.2; P.setXYZ(i, c.p.x + q.x * r + 0.15 * Math.sin(t * q.v * 2 + q.ph), c.p.y + q.y * r * 0.7 + 0.1 * Math.sin(t * q.v * 3 + q.ph * 2) - mod(t * 0.03 * q.v, 0.3), c.p.z + q.z * r + 0.15 * Math.cos(t * q.v * 1.7 + q.ph)); }); P.needsUpdate = true; Wd.motes.material.opacity = c.a ?? 0.7; } }
  { const c = o.mist; Wd.mist.forEach((s, i) => { s.visible = !!c && i < (c ? c.n ?? 24 : 0); if (!s.visible) return; const u = s.userData, r = c.r ?? 2; s.position.set(c.p.x + u.q.x * r + 0.3 * Math.sin(t * 0.1 + u.ph), c.p.y + u.q.y * r, c.p.z + u.q.z * r * (c.flat ? 0 : 1) - (c.flat ? 0.3 : 0)); s.scale.setScalar(u.s * (c.s ?? 1.5)); const dc = s.position.distanceTo(cam); s.material.opacity = (c.a ?? 0.3) * (0.7 + 0.3 * Math.sin(t * 0.4 + u.ph)) * ss(0.4, 1.4, dc); }); }
}
function lightsOff(Wd) { [Wd.lamp, Wd.key, Wd.fill, Wd.rim, Wd.bounce].forEach((l) => (l.intensity = 0)); Wd.cones.forEach((c) => (c.visible = false)); Wd.glows.forEach((g) => (g.visible = false)); }
function resetWorld(Wd) {
  [Wd.bro, Wd.me, ...Wd.res].forEach((P) => (P.g.visible = false)); Wd.craw.g.visible = false; [Wd.ext, Wd.cham, Wd.sec].forEach((g) => (g.visible = false)); lightsOff(Wd);
  Wd.plug.visible = false; Wd.rescueSet.visible = false; Wd.setGrate('whole'); Wd.bro.lens.material.emissiveIntensity = 1.5; Wd.bro.skull.material.map = texFaceOf('man');
}
function render3D(preset, pos, tgt, o = {}) {
  const Wd = world(), { r, cv } = rend();
  setLight(Wd, Object.assign({}, LIGHT[preset], o.light || {})); (o.sets || []).forEach((k) => (Wd[k].visible = true));
  if (window.DBG_CAM) { pos = window.DBG_CAM[0]; tgt = window.DBG_CAM[1]; o.fov = window.DBG_CAM[2] ?? o.fov; }   // debug views only (never set in the piece)
  Wd.cam.fov = o.fov ?? 50; Wd.cam.position.copy(pos); Wd.cam.up.set(0, 1, 0); Wd.cam.lookAt(tgt); if (o.roll) Wd.cam.rotateZ(o.roll); Wd.cam.updateProjectionMatrix(); Wd.cam.updateMatrixWorld(true);
  animWorld(Wd, TT, o);
  { const c = o.shadowAt || tgt, md = (o.moonDir || V3(-0.3, 0.45, -1)).clone().normalize(); Wd.moon.position.copy(c).addScaledVector(md, 60); Wd.moon.target.position.copy(c); Wd.moon.target.updateMatrixWorld(); }
  if (o.rim) { Wd.rim.intensity = o.rim; const c = o.shadowAt || tgt, rd = (o.rimDir || o.moonDir || V3(0, 0.5, -1)).clone().normalize(); Wd.rim.position.copy(c).addScaledVector(rd, 60); Wd.rim.target.position.copy(c); Wd.rim.target.updateMatrixWorld(); }
  if (o.fill) { Wd.fill.color.set(o.fill.c || '#9ab8b4'); Wd.fill.position.copy(pos).add(o.fill.off || V3(0, 0.3, 0)); Wd.fill.intensity = o.fill.I; Wd.fill.distance = o.fill.d ?? 6; }
  r.render(Wd.scene, Wd.cam);
  ykBlit(cv, { vis: o.vis ?? 1 });
}
// the headlamp: the spot light, its visible cone and the lens glow, from person P's head (k = 0..1)
function headlamp(Wd, P, k, o = {}) {
  P.H.updateMatrixWorld(true); const p = P.H.localToWorld(P.lampAt.clone()), d = V3(0, -0.12, 1).normalize().applyQuaternion(P.H.getWorldQuaternion(new THREE.Quaternion()));
  if (o.spot !== false) { const L = Wd.lamp; L.position.copy(p).add(V3(0, 0, o.zoff ?? 0)); L.target.position.copy(p).addScaledVector(d, 4).add(V3(0, 0, o.zoff ?? 0)); L.target.updateMatrixWorld(); L.intensity = (o.I ?? 7) * k; L.distance = o.dist ?? 12; L.angle = o.angle ?? 0.42; L.decay = 1.6; }
  const ci = o.cone ?? 0; if (ci >= 0) { const c = Wd.cones[ci], len = o.len ?? 3.5; c.visible = k > 0.05; c.position.copy(p); c.quaternion.setFromUnitVectors(V3(0, 0, 1), d); c.scale.set(Math.tan(o.angle ?? 0.42) * len * 0.8, Math.tan(o.angle ?? 0.42) * len * 0.8, len); c.material.opacity = (o.cA ?? 0.1) * k; }
  const g = Wd.glows[o.glow ?? 0]; g.visible = k > 0.05; g.position.copy(p).addScaledVector(d, 0.02); g.scale.setScalar((o.gS ?? 0.22) * k); g.material.opacity = Math.min(1, k);
  P.lens.material.emissiveIntensity = 1.5 * k; return { p, d };
}

// ---------------------------------------------------------------------
//  people: walkP (o: { O, D, s, gf ground fn, plant, pitch, look, lean, hands }) and crawlP (o: { pel, D, N, ph, hands })
// ---------------------------------------------------------------------
function walkP(P, o) {
  const pd = P.pd, F = o.D.clone().setY(0).normalize(), Lx = UPV.clone().cross(F), s = o.s ?? 0, L = 0.62, ph = s / L, gf = o.gf;
  const feet = [], fdir = [];
  [0, 1].forEach((j) => { const oj = j * 0.5, u = ph - oj, n = Math.floor(u), f = u - n, side = j === 0 ? 1 : -1; let sp, lift = 0, pit = 0;
    if (f < 0.38) { const k = ss(0, 1, f / 0.38); sp = lerp((n - 0.32 + oj) * L, (n + 0.68 + oj) * L, k); lift = 0.07 * Math.sin(Math.PI * k); pit = 0.3 * Math.sin(Math.PI * k) * (1 - 2 * k); } else sp = (n + 0.68 + oj) * L;
    if (o.plant) sp = o.plant[j], lift = 0, pit = 0;
    const g = o.O.clone().addScaledVector(F, sp).addScaledVector(Lx, side * 0.1), gy = gf(g.x, g.z); feet.push(g.setY(gy + pd.ank + 0.02 + lift)); fdir.push({ Z: F.clone().applyAxisAngle(Lx, pit), Y: UPV.clone().applyAxisAngle(Lx, pit) }); });
  const mid = feet[0].clone().add(feet[1]).multiplyScalar(0.5), bob = o.plant ? 0 : 0.014 * Math.cos(TAU * 2 * ph), sway = o.plant ? 0 : 0.015 * Math.sin(TAU * ph);
  const lean = (o.lean ?? 0.06), U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)).normalize();
  const pos = o.O.clone().addScaledVector(F, o.plant ? (o.plant[0] + o.plant[1]) / 2 : s).addScaledVector(Lx, sway).setY(mid.y - pd.ank - 0.02 + (pd.thigh + pd.shin) * 0.96 + bob);
  const B = frameOf(U, F), top = pos.clone().addScaledVector(B.Y, pd.torso), R = B.X.clone().negate(), swing = o.plant ? 0 : Math.sin(TAU * ph) * 0.16;
  const SL = top.clone().addScaledVector(B.X, pd.shW), SR = top.clone().addScaledVector(R, pd.shW);
  const hL = o.hands ? o.hands[0] : SL.clone().addScaledVector(DOWN, 0.5).addScaledVector(F, swing + 0.06).addScaledVector(B.X, 0.05), hR = o.hands ? o.hands[1] : SR.clone().addScaledVector(DOWN, 0.5).addScaledVector(F, -swing + 0.06).addScaledVector(R, 0.05);
  poseP(P, { pos, U, F, head: o.head || headRel(B, o.pitch ?? 0.05, o.look ?? 0, 0), hands: [hL, hR], hdir: [{ Z: DOWN.clone().addScaledVector(F, 0.15), Y: B.X.clone() }, { Z: DOWN.clone().addScaledVector(F, 0.15), Y: R.clone() }],
    epole: [B.X.clone().addScaledVector(F, -0.6), R.clone().addScaledVector(F, -0.6)], feet, fdir, kpole: F.clone().addScaledVector(UPV, 0.2), curl: [0.5, 0.5], grip: [false, false], breath: Math.sin(TT * 2.4) });
  return { P, B, top, pos, F };
}
function crawlP(P, o) {
  const pd = P.pd, D = o.D.clone().normalize(), N = o.N.clone().addScaledVector(D, -o.N.dot(D)).normalize(), B = frameOf(D, N), ph = o.ph ?? 0, pos = o.pel.clone();
  const top = pos.clone().addScaledVector(D, pd.torso), X = B.X;
  const hands = o.hands || [1, -1].map((sd, i) => top.clone().addScaledVector(D, 0.34 + 0.07 * Math.sin(ph + i * Math.PI)).addScaledVector(X, sd * 0.13).addScaledVector(N, 0.07));
  const feet = o.feet || [1, -1].map((sd, i) => pos.clone().addScaledVector(D, -0.8 + 0.04 * Math.sin(ph + i * Math.PI + 1)).addScaledVector(X, sd * 0.11).addScaledVector(N, 0.07));
  poseP(P, { pos, U: D, F: N, head: o.head || { Y: N.clone().negate().addScaledVector(D, o.look === undefined ? 0.35 : 0), Z: D.clone().addScaledVector(N, o.look ?? 0.45) }, hands, hdir: o.hdir || [{ Z: D.clone(), Y: N.clone().negate() }, { Z: D.clone(), Y: N.clone().negate() }],
    epole: [X.clone().addScaledVector(N, -0.6), X.clone().negate().addScaledVector(N, -0.6)], feet, fdir: [{ Y: N.clone(), Z: D.clone().negate() }, { Y: N.clone(), Z: D.clone().negate() }], kpole: N.clone(), curl: o.curl || [0.25, 0.25], grip: [false, false], breath: Math.sin(TT * 3.2) });
  return { top, B, D, N };
}

// ---------------------------------------------------------------------
//  the section: a body laid in the crack. u = the pelvis on the centre line; the body follows the curve
// ---------------------------------------------------------------------
const SLEN = () => SCURVE.getLength();
function secW(u, off = 0, z = 0) { const s = secAt(u); return SC.clone().add(s.p).addScaledVector(s.n, off).add(V3(0, 0, z)); }   // world point at u, 'off' toward the roof
function broInSec(Wd, u, o = {}) {
  const L = SLEN(), s = secAt(u), hu = u + 0.52 / L, sh = secAt(hu), pel = secW(u, -s.h + 0.14), top = secW(hu, -sh.h + 0.15), D = top.clone().sub(pel).normalize(), N = s.n.clone().negate();
  const fu = Math.max(0.005, u - 0.84 / L), fs = secAt(fu), feet = [1, -1].map((sd) => secW(fu, -fs.h + 0.08, sd * 0.1));
  const r = crawlP(Wd.bro, { pel, D, N, ph: o.ph ?? 0, feet, look: 0.1, hands: o.hands, hdir: o.hdir, head: o.head, curl: o.curl }); return Object.assign(r, { s, sh, hu });
}

// ---------------------------------------------------------------------
//  the shots
// ---------------------------------------------------------------------
const W_ = (x, y, z) => CH.clone().add(V3(x, y, z));
function slitHand(Wd, t, w0, w1, k, o = {}) {   // one pale hand sliding out of the crack onto the floor, fingertips on the stone
  const W = w0.clone().lerp(w1, k), S = W_(0.1, 0.17, SLIT.z - 1.4); let hd = { mode: 'spread', Z: V3(-0.45, -0.12, 1), Y: V3(0, 1, 0.1), curl: 0.42, tap: o.tap ?? 0, tapF: 1 };
  const st = { chest: S.clone().add(V3(0, 0, -0.5)), pelvis: S.clone().add(V3(0, 0, -1.4)), N: V3(0, 1, 0), head: { p: S.clone().add(V3(0, 0.1, -0.3)), Y: UPV, Z: V3(0, 0, 1) }, headVis: false, body: false, arms: [{ S, W, pole: V3(1, 0.4, 0), hand: hd, amp: 0.04 }] };
  poseCrawler(Wd, st); let gap = 1e9; Wd.craw.arms[0].f.forEach((F) => { gap = Math.min(gap, F.tip.y - gC(F.tip.x, F.tip.z)); });
  W.y -= gap - 0.012; poseCrawler(Wd, st); return W;
}
function shotHook() {   // a pale hand with very long fingers slides out of a black vertical crack and spreads on the lit rock, tapping
  const Wd = world(), t = TT, k = easeOut(ss(0.1, 2.0, t)), ks = ss(0.9, 2.0, t), wz = (p) => CH.z + chWallZ(p.x - CH.x, p.y);
  const S = W_(VC.x - 0.01, 0.8, SLIT.z - 1.1), W0 = W_(VC.x + 0.01, 0.74, SLIT.z - 0.55), W1 = W_(VC.x + 0.06, 0.7, 0); W1.z = wz(W1) + 0.05;
  const W = W0.clone().lerp(W1, k), Zs = V3(0.72, 0.6 + 0.06 * Math.sin(t * 0.8), 0.1), Z = V3(0.05, 0.15, 1).lerp(Zs, ks).normalize();
  const st = { chest: S.clone().add(V3(0, 0, -0.4)), pelvis: S.clone().add(V3(0, 0, -1.2)), N: V3(0, 1, 0), head: { p: S.clone().add(V3(0, 0, -0.2)), Y: UPV, Z: V3(0, 0, 1) }, headVis: false, body: false, fr: 1.9,
    arms: [{ S, W, pole: V3(0, 1, 0), amp: 0.03, hand: { mode: 'spread', Z, Y: V3(0, 0, 1).lerp(V3(-0.3, -0.2, 1), 1 - ks).normalize(), curl: lerp(0.05, 0.3, ks), spread: lerp(0.25, 1.1, ks), tap: ss(2.0, 2.4, t) * 0.7, tapF: 1 } }] };
  poseCrawler(Wd, st); if (ks > 0) { let gap = 1e9; Wd.craw.arms[0].f.forEach((F) => { gap = Math.min(gap, F.tip.z - wz(F.tip)); }); W.z -= (gap - 0.008) * ss(0.9, 1.3, t); poseCrawler(Wd, st); }
  const cam = W_(VC.x + 0.1, 0.66, SLIT.z + 1.4 - 0.1 * ss(0, 4.5, t)), tg = W_(VC.x + 0.07, 0.6, SLIT.z);
  const L = Wd.lamp, lp = cam.clone().add(V3(0.5, 0.5, 0.1)), fl = broken(t, 0.6) * ss(0, 0.12, t + 0.12); L.position.copy(lp); L.target.position.copy(W_(VC.x + 0.08, 0.68, SLIT.z)); L.target.updateMatrixWorld(); L.intensity = 3.0 * fl; L.angle = 0.33; L.penumbra = 0.6; L.distance = 6; L.decay = 1.6;
  Wd.bounce.position.copy(W_(VC.x + 0.1, 0.5, SLIT.z + 0.45)); Wd.bounce.intensity = 0.7 * fl; Wd.bounce.distance = 1.8;
  render3D('cave', cam, tg, { sets: ['cham'], fov: 44, fill: { I: 0.15, d: 2 }, vis: 1 - ss(4.2, 4.5, t), motes: { p: lp.clone().lerp(W_(VC.x, 0.7, SLIT.z), 0.55), r: 0.45, a: 0.7 * fl }, mist: { p: W_(VC.x, 0.4, SLIT.z + 0.3), r: 1.0, a: 0.2, n: 8, s: 1.0 } });
}
const printSrc = () => asset('print.jpg');
function shotCard() {
  fillAll('#020306'); ykStars(ss(4.5, 5.2, TT) * (1 - ss(7.9, 8.5, TT)));
  const kIn = TT < 7.9 ? ss(4.7, 5.5, TT) : 1 - ss(7.9, 8.45, TT), kN = TT < 7.9 ? ss(5.4, 6.2, TT) : 1 - ss(7.9, 8.3, TT);
  ykCard(printSrc(), 'Black Cave', kIn, kN, { y: 320, w: 720, h: 524, pw: 96, seal: '洞' });
}
function extKey(Wd, at, from, I = 1.6) { Wd.key.color.set('#b9cbc6'); Wd.key.position.copy(from); Wd.key.target.position.copy(at); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = I; Wd.key.angle = 0.45; Wd.key.penumbra = 0.7; }
function shotHills() {   // the scrub hills behind the town at night: the limestone cliff, the mouth with its welded grate, the sign
  const Wd = world(), t = TT, k = ss(8.5, 14.6, t); Wd.setGrate('whole');
  const cam = V3(lerp(3.4, 2.7, k), lerp(1.9, 1.7, k), CZ + lerp(12.5, 10.6, k)), tg = V3(-0.1, 0.9, CZ);
  extKey(Wd, V3(0, 1, CZ), V3(-6, 9, CZ + 12), 2.0);
  render3D('night', cam, tg, { sets: ['ext'], fov: 46, vis: ss(8.5, 8.9, t), moonDir: V3(-0.5, 0.55, -1), moonS: 22, rim: 1.2, rimDir: V3(0.3, 0.5, -1), shadowAt: V3(0, 0, CZ + 2), motes: { p: cam.clone().add(V3(-1, 0, -3)), r: 3, a: 0.4 } });
}
function shotGrate() {   // the cut grate; my brother ducks in with his headlamp; me waiting at the mouth
  const Wd = world(), t = TT, k = ss(14.6, 20.6, t); Wd.setGrate('cut');
  const w = walkP(Wd.bro, { O: V3(0.05, 0, CZ + 3.3), D: V3(0, 0, -1), s: 0.55 * (t - 14.6), gf: gE, lean: lerp(0.1, 0.38, ss(16.5, 18.5, t)), pitch: lerp(0.1, -0.1, ss(16, 18, t)) });
  walkP(Wd.me, { O: V3(0.85, 0, CZ + 1.7), D: V3(-0.45, 0, -1), plant: [0.05, -0.08], gf: gE, look: lerp(0, -0.25, ss(17, 19, t)), pitch: 0.05 });
  headlamp(Wd, Wd.bro, 1, { I: 9, len: 4, cA: 0.12 });
  extKey(Wd, V3(0, 1, CZ + 1), V3(-5, 8, CZ + 9), 1.7);
  render3D('night', V3(lerp(-2.5, -2.2, k), 1.45, CZ + lerp(6.2, 5.8, k)), V3(0.35, 0.95, CZ + 0.6), { sets: ['ext'], fov: 50, moonDir: V3(-0.5, 0.55, -1), moonS: 20, rim: 1.0, rimDir: V3(0.3, 0.5, -1), shadowAt: w.pos });
}
function shotCham() {   // deep inside: he finds the crack and squeezes in headfirst
  const Wd = world(), t = TT, k = ss(20.9, 26.4, t), z = SLIT.z + lerp(1.65, 0.8, k), pel = W_(0, 0.0 + 0.14, z);
  pel.y = gC(pel.x, pel.z) + 0.14; crawlP(Wd.bro, { pel, D: V3(0, 0, -1), N: V3(0, -1, 0), ph: k * 14 });
  const hl = headlamp(Wd, Wd.bro, 1, { I: 14, len: 1.6, cA: 0.12, dist: 8 });
  Wd.bounce.position.copy(W_(0, 0.35, SLIT.z + 0.35)); Wd.bounce.intensity = 1.0; Wd.bounce.distance = 2.2;
  const cam = W_(lerp(1.15, 1.0, k), 1.05, SLIT.z + lerp(2.7, 2.4, k)), tg = W_(0.0, 0.1, SLIT.z + 0.45);
  render3D('cave', cam, tg, { sets: ['cham'], fov: 52, fill: { I: 0.9, d: 2.6, c: '#a07c50', off: V3(-0.6, -0.4, -1.2) }, motes: { p: hl.p.clone().addScaledVector(hl.d, 0.6), r: 0.5, a: 0.7 }, mist: { p: W_(0, 0.4, SLIT.z + 0.8), r: 2, a: 0.2, n: 16 } });
}
const SU = { wide: 0.12, flick: 0.27, grip: 0.31 };
function shotSecWide() {   // the side cutaway: the crack keeps getting tighter and keeps going down; him in it
  const Wd = world(), t = TT, k = ss(26.6, 32.6, t), u = SU.wide + 0.022 * k; const b = broInSec(Wd, u, { ph: k * 10 });
  const hl = headlamp(Wd, Wd.bro, 1, { I: 12, len: 0.55, cA: 0.12, dist: 2.6, zoff: -0.22 }); Wd.bounce.position.copy(b.top).add(V3(0, 0, 0.45)); Wd.bounce.intensity = 1.3; Wd.bounce.distance = 1.6;
  Wd.rim.color.set('#8fb1b0'); const cam = b.top.clone().add(V3(lerp(0.25, 0.3, k), lerp(-0.3, -0.4, k), lerp(3.4, 3.0, k))), tg = b.top.clone().add(V3(0.1, lerp(-0.75, -0.85, k), 0));
  render3D('cave', cam, tg, { sets: ['sec'], fov: 48, fill: { I: 0.3, d: 6, c: '#4e8389' }, rim: 0.25, rimDir: V3(-0.3, 0.6, 1), shadowAt: b.top, light: { hemI: 0.35, fn: 2, ff: 14 }, motes: { p: hl.p.clone().addScaledVector(hl.d, 0.3), r: 0.3, a: 0.7 } });
}
function shotFlick() {   // the headlamp flickers; pale fingertips appear in the dark below him
  const Wd = world(), t = TT, k = ss(32.6, 38.6, t), u = SU.flick + 0.004 * k; const b = broInSec(Wd, u, { ph: 2 + k * 3 });
  const fl = t < 33.4 ? 1 : broken(t, 1.6); const hl = headlamp(Wd, Wd.bro, fl, { I: 11, len: 0.55, cA: 0.12, dist: 2.4, zoff: -0.22 }); Wd.bounce.position.copy(hl.p).addScaledVector(hl.d, 0.25).add(V3(0, 0, 0.3)); Wd.bounce.intensity = 0.6 * fl; Wd.bounce.distance = 1.4;
  const L = SLEN(), hu = b.hu, au = hu + lerp(0.62, 0.42, easeOut(ss(34.2, 37.5, t))) / L, as = secAt(au), Wp = secW(au, -as.h + 0.05, 0.08), S = secW(au + 0.7 / L, -0.02, -0.15);
  const hd = { mode: 'spread', Z: as.t.clone().negate().addScaledVector(as.n, -0.15), Y: as.n.clone(), curl: 0.35, tap: 0.5, tapF: 2 };
  const Wp2 = secW(au + 0.12 / L, as.h - 0.06, -0.12), hd2 = { mode: 'spread', Z: as.t.clone().negate().addScaledVector(as.n, 0.2), Y: as.n.clone().negate(), curl: 0.3, tap: 0.3, tapF: 0 };
  poseCrawler(Wd, { chest: S.clone().addScaledVector(as.t, 0.3), pelvis: S.clone().addScaledVector(as.t, 1.2), N: as.n, head: { p: S, Y: as.n, Z: as.t.clone().negate() }, headVis: false, body: false, fr: 1.7, arms: [{ S, W: Wp, pole: V3(0, 0, 1), hand: hd, amp: 0.035 }, { S: S.clone().addScaledVector(as.n, 0.05), W: Wp2, pole: V3(0, 0, 1), hand: hd2, amp: 0.035 }] });
  Wd.craw.arms[1].segs.forEach((m) => (m.visible = t > 36.2)); Wd.craw.arms[1].kn.forEach((m) => (m.visible = t > 36.2)); Wd.craw.arms[1].palm.visible = t > 36.2; Wd.craw.arms[1].f.forEach((F) => { F.s.forEach((m) => (m.visible = t > 36.2)); F.k.forEach((m) => (m.visible = t > 36.2)); F.nail.visible = t > 36.2; });
  const mid = b.top.clone().lerp(Wp, 0.55);
  render3D('cave', mid.clone().add(V3(0.12, 0.08, 1.75)), mid.clone().add(V3(0, -0.3, 0)), { sets: ['sec'], fov: 46, fill: { I: 0.3 * (0.4 + 0.6 * fl), d: 3, c: '#4e8389' }, rim: 0.2, rimDir: V3(-0.3, 0.6, 1), shadowAt: mid, light: { hemI: 0.35, fn: 1, ff: 9 }, motes: { p: hl.p.clone().addScaledVector(hl.d, 0.3), r: 0.25, a: 0.7 * fl } });
  return b;
}
// both of his gloved hands, reaching down the crack, each wrapped by the crawler's long fingers
function gripPose(Wd, u, t, pull, head) {
  const L = SLEN(), s0 = secAt(u + 0.5 / L), ahead = (k, sd) => { const uu = u + (0.78 + 0.03 * k) / L, s = secAt(uu); return secW(uu, -s.h + 0.17, sd * 0.1); };
  const b = broInSec(Wd, u, { hands: [ahead(pull, 1), ahead(pull, -1)], hdir: [{ Z: s0.t.clone(), Y: s0.n.clone().addScaledVector(V3(0, 0, 1), 0.3) }, { Z: s0.t.clone(), Y: s0.n.clone().addScaledVector(V3(0, 0, -1), 0.3) }], curl: [0.55, 0.55], head });
  const P = Wd.bro, FKg = 1.7, arms = [], cu = u + 1.6 / L, cs = secAt(cu), chest = secW(cu, -cs.h + 0.1, 0);
  P.arm.forEach((a, i) => { const A = a.W.clone().sub(a.E).normalize(), O = a.W.clone().addScaledVector(A, -0.075), r = P.armR[1] * 1.15 + 0.004, Uref = cs.n.clone(), up = Uref.clone().addScaledVector(A, -Uref.dot(A)).normalize(), v = A.clone().cross(up);
    const th0 = -0.35 + (i ? 0.2 : 0), palmP = O.clone().addScaledVector(up, Math.cos(th0) * (r + 0.03)).addScaledVector(v, Math.sin(th0) * (r + 0.03)), Z = v.clone().multiplyScalar(Math.cos(th0)).addScaledVector(up, -Math.sin(th0));
    const S = chest.clone().addScaledVector(cs.n, 0.04).add(V3(0, 0, i ? -0.14 : 0.14)), Wc = palmP.clone().addScaledVector(Z, -0.05).addScaledVector(A, 0.03);
    arms.push({ S, W: Wc, pole: V3(0, 0, i ? -1 : 1).addScaledVector(cs.n, 0.5), amp: 0.03, hand: { mode: 'wrap', O, A, U: up, r, th0, Z, Y: up.clone().multiplyScalar(Math.cos(th0)).addScaledVector(v, Math.sin(th0)), palmP, wrapK: 0.92 } }); });
  return { b, arms, chest, cs, cu };
}
function shotGrip() {   // something in the dark holds his hands, gently, and pulls
  const Wd = world(), t = TT, pull = ss(39.5, 44.8, t), u = SU.grip + 0.012 * pull, G = gripPose(Wd, u, t, pull);
  poseCrawler(Wd, { chest: G.chest, pelvis: G.chest.clone().addScaledVector(G.cs.t, 0.9), N: G.cs.n, head: { p: G.chest.clone().addScaledVector(G.cs.t, -0.2), Y: G.cs.n, Z: G.cs.t.clone().negate() }, headVis: false, fr: 1.7, arms: G.arms });
  const k = t < 44.3 ? (t < 40 ? 1 : broken(t, t < 43.2 ? 0.45 : 0.9)) : (1 - ss(44.3, 44.9, t)) * (0.5 + 0.5 * Math.sin(t * 47) ** 2); const hl = headlamp(Wd, Wd.bro, k, { I: 11, len: 0.5, cA: 0.12, dist: 2.2, zoff: -0.22 });
  const mid = G.b.top.clone().lerp(G.arms[0].W, 0.5);
  render3D('cave', mid.clone().add(V3(0.08, 0.05, 1.05)), mid.clone().add(V3(0, -0.2, 0)), { sets: ['sec'], fov: 48, fill: { I: 0.35 * (0.3 + 0.7 * k), d: 2.5, c: '#65969a' }, rim: 0.2 * (0.3 + 0.7 * k), rimDir: V3(-0.3, 0.6, 1), shadowAt: mid, light: { hemI: 0.35 * (0.4 + 0.6 * k), fn: 0.6, ff: 6 }, vis: 1 - ss(44.85, 45.0, t), motes: { p: hl.p.clone().addScaledVector(hl.d, 0.25), r: 0.2, a: 0.7 * k } });
}
function shotHit() {   // THE HIT: the last flash shows its long eyeless face, upside down, right under his
  const Wd = world(), t = TT, u = SU.grip + 0.012, s0 = secAt(u + 0.5 / SLEN()), G = gripPose(Wd, u, t, 1, { Y: s0.n.clone(), Z: s0.t.clone().multiplyScalar(0.5).add(V3(0, 0, 0.9)) }), b = G.b, P = Wd.bro; P.skull.material.map = texFaceOf('fear');
  P.H.updateMatrixWorld(true); const hp = P.H.getWorldPosition(V3(0, 0, 0)), hz = V3(0, 0, 1).applyQuaternion(P.H.getWorldQuaternion(new THREE.Quaternion())), n = b.sh.n;
  const D = b.D, fp = hp.clone().addScaledVector(D, 0.27).addScaledVector(n, 0.0).add(V3(0, 0, 0.16)), rise = easeOut(ss(45.6, 46.6, t)); fp.addScaledVector(D, 0.1 * (1 - rise));
  poseCrawler(Wd, { chest: G.chest, pelvis: G.chest.clone().addScaledVector(G.cs.t, 0.9), N: G.cs.n, headS: 1.15, fr: 1.7, head: { p: fp, Y: D.clone(), Z: D.clone().negate().multiplyScalar(0.55).add(V3(0, 0, 0.85)) }, jaw: lerp(0.3, 0.95, ss(46.2, 48.5, t)), glint: 1, arms: G.arms });
  const k = t < 46.2 ? 1 : t < 50.4 ? 0.55 + 0.45 * broken(t, 0.7) : (1 - ss(50.4, 51.3, t)) * broken(t, 1.5);
  const L = Wd.lamp; L.position.copy(hp.clone().addScaledVector(hz, 0.12).addScaledVector(n, 0.08).add(V3(0, 0, 0.12))); L.target.position.copy(fp); L.target.updateMatrixWorld(); L.intensity = 4.5 * k; L.angle = 0.7; L.distance = 3;
  Wd.bounce.position.copy(fp.clone().add(V3(0, 0, 0.35))); Wd.bounce.intensity = 0.6 * k; Wd.bounce.distance = 1.5; P.lens.material.emissiveIntensity = 1.5 * k;
  const mid = hp.clone().lerp(fp, 0.5), cam = mid.clone().add(V3(0.06, 0.1, 1.15));
  render3D('cave', cam, mid.clone().add(V3(0, -0.27, 0)), { sets: ['sec'], fov: 46, fill: { I: 0.4 * k, d: 2, c: '#65969a' }, rim: 0.3 * k, rimDir: V3(-0.3, 0.6, 1), shadowAt: mid, light: { hemI: 0.3 * (0.3 + 0.7 * k), fn: 0.6, ff: 5 }, vis: 1 - ss(51.3, 51.6, t), motes: { p: fp.clone().add(V3(0, 0.1, 0.1)), r: 0.25, a: 0.6 * k } });
}
function shotRescue() {   // rescuers with floodlights, helmets and ropes at the mouth
  const Wd = world(), t = TT, k = ss(51.6, 58, t); Wd.setGrate('gone'); Wd.rescueSet.visible = true;
  const r0 = walkP(Wd.res[0], { O: V3(-0.2, 0, CZ + 1.2), D: V3(0.1, 0, -1), plant: [0.08, -0.1], gf: gE, lean: 0.25, pitch: 0.2 });
  walkP(Wd.res[1], { O: V3(1.15, 0, CZ + 2.2), D: V3(-0.6, 0, -1), plant: [0.05, -0.1], gf: gE, look: 0.2 * Math.sin(t * 0.4) });
  walkP(Wd.res[2], { O: V3(-1.5, 0, CZ + 3.0), D: V3(0.4, 0, -1), plant: [-0.05, 0.1], gf: gE, pitch: 0.15 });
  headlamp(Wd, Wd.res[0], 1, { I: 5, len: 3, cA: 0.08, glow: 0 }); headlamp(Wd, Wd.res[1], 1, { spot: false, cone: -1, glow: 1, gS: 0.15 }); headlamp(Wd, Wd.res[2], 1, { spot: false, cone: -1, glow: 2, gS: 0.15 }); void r0;
  const f0 = Wd.floods[0], f1 = Wd.floods[1], lp = f0.localToWorld(V3(0, 1.85, 0.12)); Wd.key.color.set('#ffe0b0'); Wd.key.position.copy(lp); Wd.key.target.position.set(0, 0.8, CZ - 1); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = 5; Wd.key.angle = 0.42; Wd.key.penumbra = 0.5;
  const c = Wd.cones[1], d = V3(0, 0.8, CZ - 1).sub(lp).normalize(); c.visible = true; c.position.copy(lp); c.quaternion.setFromUnitVectors(V3(0, 0, 1), d); c.scale.set(2.2, 2.2, 6); c.material.opacity = 0.07;
  const lp1 = f1.localToWorld(V3(0, 1.85, 0.12)); Wd.fill.position.copy(lp1).add(V3(-0.3, 0, -0.3)); Wd.fill.intensity = 2.2; Wd.fill.distance = 9;
  [lp, lp1].forEach((p, i) => { const g = Wd.glows[i === 0 ? 1 : 2]; void g; });
  render3D('night', V3(lerp(2.9, 2.6, k), 1.65, CZ + lerp(7.6, 7.0, k)), V3(-0.1, 0.85, CZ + 0.8), { sets: ['ext'], fov: 50, vis: ss(51.6, 51.9, t), moonDir: V3(-0.5, 0.55, -1), moonS: 20, rim: 0.9, rimDir: V3(0.3, 0.5, -1), shadowAt: V3(0, 0, CZ + 2), motes: { p: V3(0, 1.4, CZ + 1.5), r: 2.2, a: 0.55 } });
}
function shotSealed() {   // concrete over the mouth at dusk
  const Wd = world(), t = TT, k = ss(58, 71, t); Wd.setGrate('gone'); Wd.plug.visible = true;
  extKey(Wd, V3(0, 1, CZ), V3(-6, 7, CZ + 10), 1.2);
  render3D('dusk', V3(lerp(-1.6, -1.1, k), lerp(1.75, 1.6, k), CZ + lerp(9.2, 7.6, k)), V3(0.1, 1.9, CZ + 0.8), { sets: ['ext'], fov: 52, vis: ss(58, 58.6, t) * (1 - ss(70, 71, t)), moonDir: V3(0.7, 0.25, -1), moonS: 0.01, rim: 0.8, rimDir: V3(0.6, 0.25, -1), shadowAt: V3(0, 0, CZ + 2) });
}

const PARA = [
  ['If a sealed cave calls you by your name, don\'t answer. My brother did.', -1.2, 8.2],
  ['There\'s a cave in the hills behind our town. They welded a grate over it after the third person went missing.', 9.0, 14.35],
  ['My brother cut the grate on a Sunday. Just a headlamp, no rope. I waited outside.', 15.1, 20.35],
  ['Deep inside, he found a crack in the rock and squeezed in headfirst.', 21.1, 26.35],
  ['The tunnel kept getting tighter, and it kept going down.', 27.1, 32.35],
  ['Then his headlamp flickered. Something below him whispered his name. In my voice.', 33.1, 38.35],
  ['He couldn\'t back out. He said something in the dark was holding his hands. Gently. And pulling.', 39.1, 44.7],
  ['Then his light died. The last thing it showed was a face, right under his.', 46.0, 51.35],
  ['Rescuers dug for four days. They could hear him talking to someone who wasn\'t us.', 52.1, 57.75],
  ['They sealed the cave with concrete. Some nights it still calls my name. In his voice.', 58.6, 70.6],
];
function sceneTale() {
  const t = TT; fillAll('#020306'); resetWorld(world());
  if (window.DBG_SHOT) window.DBG_SHOT(); else   // debug views only (never set in the piece)
  if (t < 4.5) shotHook(); else if (t < 8.5) shotCard(); else if (t < 14.6) shotHills(); else if (t < 20.6) shotGrate(); else if (t < 26.6) shotCham();
  else if (t < 32.6) shotSecWide(); else if (t < 38.6) shotFlick(); else if (t < 45.6) { if (t < 45.0) shotGrip(); } else if (t < 51.6) shotHit(); else if (t < 58) shotRescue(); else shotSealed();
  PARA.forEach(([s, a, b]) => ykPara(s, a, b, { cy: 1300 }));
  if (t >= 66.2) { const f = () => ykBadge(asset('kodama.jpg'), 'kodamashorts', CX, 290, ss(66.2, 66.9, t) * (1 - ss(70.4, 71, t))); if (DEFER) DEFER.push(f); else f(); }
}
