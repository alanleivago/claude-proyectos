// =====================================================================
//  RUN — the nine shots on the summit: cameras, the uncle (stepped on 2s), the Behemoth, light; the paragraphs; dithered
//  fades; the card.
// =====================================================================
const T2 = () => Math.floor(TT * 12 + 1e-6) / 12;   // bodies move on 2s
const shake = (t, k) => V3(Math.sin(t * 61) * k, Math.sin(t * 47 + 1) * k, Math.sin(t * 53 + 2) * k);
const D1 = DOMES[0], DECK = () => th(D1.x, D1.z) - 0.5 + D1.h * 0.62 - 1.0;
const DIR = V3(0.22, 0, -0.97).normalize(), SIDE = V3(0.97, 0, 0.22), RY = Math.atan2(DIR.x, DIR.z);
const MAN0 = () => V3(D1.x, DECK(), D1.z).addScaledVector(DIR, D1.r + 0.65);       // on the catwalk, facing the sea of clouds
const off = (p, s, d, y) => p.clone().addScaledVector(SIDE, s).addScaledVector(DIR, d).add(V3(0, y, 0));
function placeMan(Wd, p, ry, P) { const m = Wd.man; m.position.copy(p); m.rotation.y = ry; setPose(m, P); m.visible = true; m.updateMatrixWorld(true); }
function resetWorld(Wd) {
  Wd.posts.visible = true;
  Wd.domes.forEach((d) => (d.userData.shutter.visible = true));
  Wd.man.visible = true; Wd.truck.visible = true; Wd.hand.visible = false; Wd.bh.visible = true; Wd.flakes.visible = false; Wd.falling.visible = false; Wd.cup.visible = false;
  Wd.tour.forEach((m) => (m.visible = false)); Wd.cars.forEach((c) => (c.visible = false)); Wd.thermos.visible = true;
  Wd.domes.forEach((d) => { d.scale.set(1, 1, 1); d.rotation.set(0, 0, 0); });
  const tp = V3(-6, 0, -2); Wd.truck.position.set(tp.x, th(tp.x, tp.z), tp.z); Wd.truck.rotation.set(0, 0.6, 0); Wd.truck.userData.lights.forEach((l) => l.material.color.set('#3f4542'));
}
function render3D(preset, pos, tgt, o = {}) {
  const Wd = world(), { r, cv } = rend();
  setLight(Wd, Object.assign({}, LIGHT[preset], o.light || {}), o.focus);
  Wd.cam.fov = o.fov ?? 50; Wd.cam.position.copy(pos); if (o.shake) Wd.cam.position.add(shake(TT, o.shake)); Wd.cam.lookAt(tgt); if (o.roll) Wd.cam.rotateZ(o.roll); Wd.cam.updateProjectionMatrix();
  animWorld(Wd, TT, o);
  r.render(Wd.scene, Wd.cam);
  ykBlit(cv, { vis: o.vis ?? 1 });
}
const fadeWin = (a, b, d = 0.6) => Math.min(ss(a, a + d, TT), 1 - ss(b - d, b, TT));
// flakes shed from a point, drifting down; rocks falling from the hand's grip
function shed(Wd, at, spread, t) { const M = Wd.flakes; M.visible = true; Wd.flakeP.forEach((q, i) => { const k = mod(t * 0.05 * q.v + q.u, 1); M.setMatrixAt(i, M4c(at.x + Math.cos(q.a) * q.r * spread + Math.sin(t + q.ph) * spread * 0.1, at.y - k * spread * 3, at.z + Math.sin(q.a) * q.r * spread, t * 2 + q.ph, spread * 0.03, spread * 0.03, 1, t * 3 + q.ph, t)); }); M.instanceMatrix.needsUpdate = true; }
function rockfall(Wd, at, sz, t, t0) { const M = Wd.falling; M.visible = true; Wd.rockP.forEach((q, i) => { const tt = t - t0 - q.t0, on = tt > 0 ? 1 : 0, u = Math.max(0, tt); M.setMatrixAt(i, M4c(at.x + q.x * sz, at.y - 4.9 * u * u * 6, at.z + q.z * sz + u * 6, u * 3, q.s * on, q.s * on, q.s * on, u * 2)); }); M.instanceMatrix.needsUpdate = true; }

function shotOpen() {   // HOOK: the head rises behind the far rim, side-on, pale against the lit sea of clouds; the eye turns to us
  const Wd = world(), t = TT, k = ss(0, 4.5, t);
  Wd.man.visible = false; Wd.truck.visible = false;
  poseBH(Wd, { pos: V3(lerp(330, 320, k), lerp(40, 115, ss(0, 3.2, t)), -560), s: 80, yaw: -Math.PI / 2 + 0.55, pitch: -0.08 + 0.06 * Math.sin(t * 0.8), hyaw: 0.32 * ss(1.0, 2.6, t), jaw: 0.14 + 0.1 * ss(2.4, 3.4, t) });
  shed(Wd, V3(250, 60, -540), 50, t);
  render3D('night', V3(lerp(46, 44, k), lerp(20, 21, k), lerp(70, 62, k)), V3(lerp(205, 200, k), lerp(78, 92, k), -500), { vis: fadeWin(0, 4.5, 0.4), fov: 46, focus: V3(300, 90, -560) });
}
const printSrc = () => asset('print.jpg');
function shotCard() {
  fillAll('#020306'); ykStars(ss(4.5, 5.2, TT) * (1 - ss(8.3, 8.9, TT)));
  const kIn = TT < 8.3 ? ss(4.8, 5.6, TT) : 1 - ss(8.3, 8.9, TT), kN = TT < 8.3 ? ss(5.5, 6.3, TT) : 1 - ss(8.3, 8.7, TT);
  ykCard(printSrc(), 'Behemoth', kIn, kN, { y: 320, w: 720, h: 540, pw: 90 });
}
function shotNight() {   // the domes under the stars; the uncle on the catwalk with his thermos, the sea of clouds below
  const Wd = world(), t = TT, t2 = T2(); poseBH(Wd, { show: false });
  const P = mixPose(POSE.stand, POSE.drink, ss(14.2, 14.8, t2) * (1 - ss(16.6, 17.2, t2)));
  placeMan(Wd, MAN0(), RY, P);
  if (t < 13.4) { const k = (t - 9) / 4.4; render3D('night', V3(lerp(46, 40, k), lerp(16, 14, k), lerp(52, 46, k)), V3(lerp(-2, 0, k), 8, -40), { vis: ss(9, 9.6, t), fov: 52 }); }
  else { const m = MAN0(), k = (t - 13.4) / 4.6; render3D('night', off(m, lerp(3.4, 2.9, k), lerp(1.6, 1.3, k), 1.7), off(m, 0, -0.2, 1.1), { fov: 50, focus: m }); }
}
function shotShake() {   // the coffee shivers on the railing; the dome turns by itself
  const Wd = world(), t = TT, t2 = T2(), m = MAN0(); poseBH(Wd, { show: false });
  const cup = off(m, 0.9, 0.62, 1.02); Wd.cup.visible = true; Wd.cup.position.copy(cup); Wd.coffee.material.uniforms.t.value = t; Wd.coffee.material.uniforms.amp.value = ss(18.4, 19.4, t) * (0.6 + 0.4 * Math.sin(t * 2));
  const sh = ss(18.4, 19.6, t) * 0.04;
  if (t < 22.6) { placeMan(Wd, m, RY, POSE.look); const d1 = Wd.domes[0], cp = V3(D1.x + 34, th(D1.x + 34, D1.z + 30) + 2.5, D1.z + 30), ang = Math.atan2(cp.x - D1.x, cp.z - D1.z);
    d1.userData.shutter.visible = false; const tube = d1.userData.tube; tube.rotation.x = 0.7 - 0.55 * ss(19.0, 22.0, t) + 0.03 * Math.sin(t * 40) * ss(18.4, 19, t); tube.rotation.z = 0.25 * ss(19.5, 22.4, t);
    render3D('night', cp, V3(D1.x, D1.h + 4, D1.z), { fov: 44, focus: V3(D1.x, 8, D1.z), shake: sh, domeSpin: { i: 0, a: ang - d1.userData.ry0 } }); }
  else { const g0 = V3(D1.x - 9, 0, D1.z + 20); g0.y = th(g0.x, g0.z); placeMan(Wd, g0, Math.atan2(D1.x - g0.x, D1.z - g0.z), POSE.look); const k = ss(22.6, 27, t);
    render3D('night', g0.clone().add(V3(lerp(-2.2, -1.8, k), 0.5, lerp(3.4, 3.0, k))), V3(D1.x, D1.h + lerp(4, 7, k), D1.z), { fov: 62, domeSpin: { i: 0, a: -2.2 * ss(22.8, 26.8, t) }, shake: 0.05, focus: g0 }); }
}
function shotCloud() {   // over his shoulder: one cloud rises against the wind, shedding scales
  const Wd = world(), t = TT, t2 = T2(), m = MAN0(), k = ss(27, 36, t);
  placeMan(Wd, m, RY, t2 < 31 ? POSE.look : POSE.shock);
  poseBH(Wd, { pos: V3(200, lerp(-60, 30, k), -900), s: 62, yaw: -Math.PI / 2 + 0.15, pitch: -0.25 + 0.15 * k, jaw: 0.02, hug: true, cloak: 0.85 - 0.6 * ss(29, 35, t) });
  shed(Wd, V3(160, lerp(-20, 50, k), -860), 50, t);
  render3D('night', off(m, lerp(-1.3, -1.1, k), -0.35, 2.0), V3(150, lerp(0, 30, k), -860), { fov: 40, focus: V3(180, 0, -880) });
}
function shotGrip() {   // a hand comes over the rim, rocks fall; he runs for the truck; black
  const Wd = world(), t = TT, t2 = T2(); poseBH(Wd, { show: false });
  const H = Wd.hand; H.visible = true; const hp = V3(-3, th(-3, -96) + lerp(-25, 1, ss(36, 38.4, t)), -96); H.position.copy(hp); H.scale.setScalar(14); H.rotation.set(0.35, Math.PI + 0.6, 0); curlHand(H, lerp(0.05, 1.2, ss(37.6, 38.8, t)));
  if (t > 38.4) rockfall(Wd, hp.clone().add(V3(0, 4, 0)), 18, t, 38.4);
  if (t < 40.6) { const m = MAN0(); placeMan(Wd, m, RY, POSE.shock); render3D('night', hp.clone().add(V3(lerp(-55, -45, ss(36, 40.6, t)), 18, -70)), hp.clone().add(V3(0, 4, 8)), { fov: 40, shake: t > 38.4 && t < 39.6 ? 0.08 : 0.015, focus: hp }); }
  else { const k = ss(40.6, 44.4, t2), a = V3(D1.x + 16, th(D1.x + 16, D1.z + 6), D1.z + 6), b = V3(-7, th(-7, -1), -1), p = a.clone().lerp(b, k); p.y = th(p.x, p.z);
    placeMan(Wd, p, Math.atan2(b.x - a.x, b.z - a.z), gait(t2 * 1.6, 1));
    render3D('night', p.clone().add(V3(9, 4, 10)), p.clone().add(V3(0, 1, -2)), { fov: 50, vis: 1 - ss(44.2, 45.0, t), shake: 0.04, focus: p }); }
}
function shotReveal() {   // low by the truck: the head above the domes, looking down, jaws open; a dome crushed
  const Wd = world(), t = TT, t2 = T2(); Wd.man.visible = false;
  const d2 = Wd.domes[1]; d2.scale.set(1.05, 0.45, 1.05); d2.rotation.set(0.25, 0, 0.18);
  if (t < 50.6) { const k = (t - 45.6) / 5;
    poseBH(Wd, { pos: V3(lerp(40, 30, k), lerp(150, 140, k), -170), s: 34, yaw: -Math.PI / 2 + 0.7, pitch: 0.55, hyaw: 0.1 * Math.sin(t2 * 0.8), jaw: 0.16 + 0.04 * Math.sin(t2 * 1.4), hug: false });
    shed(Wd, V3(30, 120, -170), 30, t);
    render3D('night', V3(lerp(-4, -3, k), 3.6, lerp(6, 4, k)), V3(20, lerp(80, 95, k), -120), { fov: 62, light: { sunI: 2.4 }, focus: V3(30, 120, -170), shake: t < 46.4 ? 0.12 * (1 - ss(45.6, 46.4, t)) : 0 }); }
  else { const k = (t - 50.6) / 5.4;
    poseBH(Wd, { pos: V3(30, lerp(135, 120, k), -160), s: 34, yaw: -Math.PI / 2 + 0.55, pitch: lerp(0.55, 0.75, k), jaw: 0.2, hug: false });
    render3D('night', V3(lerp(70, 60, k), 22, lerp(30, 20, k)), V3(10, lerp(70, 60, k), -110), { fov: 58, focus: V3(30, 120, -160) }); }
}
function shotEye() {   // the eye, close; then he drives down in the dark with it walking beside him in the clouds
  const Wd = world(), t = TT, t2 = T2();
  if (t < 60.4) { poseBH(Wd, { pos: V3(30, 120, -160), s: 34, yaw: -Math.PI / 2 + 0.55, pitch: 0.75, jaw: 0.18 + 0.03 * Math.sin(t2 * 2), hyaw: 0.05 * Math.sin(t2), hug: false });
    Wd.man.visible = false; Wd.bh.updateMatrixWorld(true); const e = Wd.bh.userData.eyes[1].getWorldPosition(V3(0, 0, 0)), k = (t - 56) / 4.4;
    render3D('night', e.clone().add(V3(lerp(95, 78, k), lerp(-26, -18, k), lerp(85, 70, k))), e.clone().add(V3(-14, -12, 0)), { fov: 40, focus: e, light: { sunD: [0.8, 0.3, 0.5] } }); return; }
  Wd.man.visible = false; const k = ss(60.4, 66, t), a = V3(8, 0, 32), b = V3(28, 0, 66), p = a.clone().lerp(b, k); p.y = th(p.x, p.z);
  Wd.truck.position.copy(p); Wd.truck.rotation.set(0, Math.atan2(b.x - a.x, b.z - a.z), 0); Wd.truck.userData.wheels.forEach((w) => (w.rotation.x = t * 8)); Wd.truck.userData.tail.forEach((l) => l.material.color.set('#d9592a'));
  poseBH(Wd, { pos: V3(lerp(-240, -200, k), lerp(60, 80, ss(60.4, 63, t)), lerp(-60, 40, k)), s: 50, yaw: lerp(0.2, 0.0, k), pitch: 0.1, jaw: 0.1, hug: true });
  const fw = b.clone().sub(a).setY(0).normalize(), sd2 = V3(fw.z, 0, -fw.x), cpos = p.clone().addScaledVector(fw, -3.5).addScaledVector(sd2, 3.2); cpos.y = Math.max(p.y + 1.3, th(cpos.x, cpos.z) + 0.9); Wd.posts.visible = false; render3D('deep', cpos, p.clone().addScaledVector(fw, 1).addScaledVector(sd2, -12).add(V3(0, -1.5, 0)), { fov: 58, focus: p, shake: 0.03 });
}
function shotDusk() {   // today: tourists at sunset by the domes; one cloud does not drift with the others
  const Wd = world(), t = TT, t2 = T2(); Wd.man.visible = false; Wd.truck.visible = false;
  poseBH(Wd, { pos: V3(150, CLOUD_Y + 40, 720), s: 70, yaw: Math.PI / 2 + 0.4, pitch: -0.2, jaw: 0, hug: true, cloak: 0.5 });
  const base = V3(14, 0, 18); Wd.tour.forEach((m, i) => { m.visible = true; const p = base.clone().add(V3(-6 + i * 3, 0, (i % 2) * 1.5)); m.position.set(p.x, th(p.x, p.z), p.z); m.rotation.y = Math.atan2(120 - p.x, 700 - p.z) + (hsh(i) - 0.5) * 0.3; setPose(m, i === 2 ? POSE.stand : POSE.phone); });
  Wd.cars.forEach((c, i) => { c.visible = true; const x = 2 + i * 6, z = 8; c.position.set(x, th(x, z), z); c.rotation.y = 0.2 * i; });
  const k = (t - 66) / 9, dv = V3(120, 0, 700).sub(base).setY(0).normalize(), cp = base.clone().addScaledVector(dv, -lerp(7, 6, k)).add(V3(1.5, 0, 0)); cp.y = th(cp.x, cp.z) + 1.4; render3D('dusk', cp, V3(120, lerp(-40, -30, k), 700), { fov: 50, vis: 1 - ss(73.8, 75, t), focus: base, rain: false });
}

const PARA = [
  ['My uncle worked nights at the summit of Mauna Kea, and he warned me never to trust a cloud that moves against the wind.', 0.4, 8.85],
  ['One winter night he was alone in the dome, four thousand metres up, above a sea of clouds as flat as milk.', 9.5, 17.75],
  ['Around three in the morning the floor began to shake, and the telescope slid off the stars by itself.', 18.4, 26.75],
  ['He stepped outside. One cloud was rising against the wind, and it was shedding scales.', 27.4, 35.75],
  ['It was climbing over the mountain the way we climb over a fence.', 36.4, 44.6],
  ['It only needed one step to reach the summit. Then it looked down.', 46.3, 55.75],
  ['He drove down with the lights off, and for an hour he heard it walking beside him in the clouds.', 56.4, 65.75],
  ['Today tourists drive up to watch the sunset. None of them notice the one cloud that never moves with the wind.', 66.6, 74.4],
];
function sceneTale() {
  const t = TT; fillAll('#020306'); resetWorld(world());
  if (t < 4.5) shotOpen(); else if (t < 9) shotCard(); else if (t < 18) shotNight(); else if (t < 27) shotShake(); else if (t < 36) shotCloud();
  else if (t < 45.6) { if (t < 45.0) shotGrip(); } else if (t < 56) shotReveal(); else if (t < 66) shotEye(); else shotDusk();
  PARA.forEach(([s, a, b]) => ykPara(s, a, b, { cy: 1300 }));
}
