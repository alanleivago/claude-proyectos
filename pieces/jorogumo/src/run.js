// =====================================================================
//  RUN — the nine shots: cameras, bodies (stepped on 2s), threads, light; the paragraphs; dithered fades; the card.
// =====================================================================
const T2 = () => Math.floor(TT * 12 + 1e-6) / 12;   // bodies and the spider move on 2s
const SH = Object.fromEntries(SHOTS.map(([k, , a, b]) => [k, [a, b]]));
const inShot = (k) => TT >= SH[k][0] && TT < SH[k][1];
const shake = (t, k) => V3(Math.sin(t * 61) * k, Math.sin(t * 47 + 1) * k, Math.sin(t * 53 + 2) * k);
// the jorōgumo's eight feet: front pair on the boulders under the fall, then the wall, the rim, the plateau
const TIPS = [[-6.5, 0.4, -8.0], [-6.4, 13.0, -11.4], [-9.4, 22.6, -10.0], [-13, 26.5, -22], [6.8, 0.3, -7.6], [6.6, 11.6, -11.3], [9.6, 22.2, -9.8], [13.5, 26.8, -21]];
function poseSpider(Wd, t, o = {}) {
  const sp = Wd.sp, U = sp.userData; sp.visible = o.show ?? true; if (!sp.visible) return;
  const breathe = Math.sin(t * 0.9) * 0.08;
  U.wo.rotation.x = -0.12 + breathe * 0.3 + (o.lean ?? 0); U.wo.rotation.y = Math.sin(t * 0.37) * 0.08; U.head.rotation.set(0.25 + (o.nod ?? 0), Math.sin(t * 0.31) * 0.1 + (o.turn ?? 0), Math.sin(t * 0.23) * 0.05);
  U.ab.rotation.x = -0.5 + breathe; U.ab.position.y = 3.2 + breathe;
  U.arms.forEach((a) => { const s = a.userData.s; a.rotation.set(-0.35 - (o.reach ?? 0), 0, s * (0.35 + 0.1 * Math.sin(t * 0.7 + s))); a.userData.lo.rotation.x = -0.4 - (o.reach ?? 0) * 0.6; });
  legsTo(sp, TIPS.map(([x, y, z], i) => V3(x + Math.sin(t * 1.7 + i * 2.1) * 0.15 * (o.twitch ?? 1), y + Math.max(0, Math.sin(t * 0.9 + i * 1.3)) * 0.3 * (o.twitch ?? 1), z)));
  U.head.rotation.z = 0.32 + 0.05 * Math.sin(t * 0.4) + (o.tilt ?? 0);
  const sm = o.smile ?? 0, sp2 = o.split ?? 0;
  U.halves.forEach((hg) => { const { sd, lip, teeth } = hg.userData; hg.rotation.y = sd * 0.85 * sp2; lip.scale.x = 1 + 1.6 * sm; lip.position.x = -sd * 0.38 + sd * (0.03 + 0.05 * sm); teeth.scale.x = 1 + 2.2 * sm; teeth.position.x = lip.position.x; });
  U.fangs.forEach((f, i) => { f.rotation.z = (i ? -1 : 1) * (0.9 - 0.9 * sp2) + Math.sin(t * 7 + i) * 0.06 * sp2; f.scale.setScalar(0.2 + 0.8 * sp2); });
  U.inEyes.forEach((e) => (e.visible = sp2 > 0.02));
}
const headW = (Wd) => Wd.sp.userData.head.getWorldPosition(V3(0, 0, 0));
const handW = (Wd, s) => Wd.sp.userData.arms[s].userData.lo.localToWorld(V3(0, -1.1, 0));
// the man on the ground at (x, z), facing ry, pose P; carry: 'hand' puts the axe in his right hand, else it lies at axeAt
function placeMan(Wd, x, z, ry, P, lift = 0) { const m = Wd.man; m.position.set(x, th(x, z) + lift, z); m.rotation.y = ry; setPose(m, P); m.visible = true; m.updateMatrixWorld(true); }
function axeIn(Wd, where) {
  const a = Wd.axe;
  if (where === 'hand') { const h = Wd.man.userData.J.handR; if (a.parent !== h) h.add(a); a.position.set(0, 0.02, 0); a.rotation.set(Math.PI / 2, 0, 0); a.scale.setScalar(1); return; }
  if (a.parent !== Wd.scene) Wd.scene.add(a); a.position.copy(where); a.position.y = th(where.x, where.z) + 0.04; a.rotation.set(Math.PI / 2, 0, 0.4);
}
const shin = (Wd, side, u) => { const L = Wd.man.userData.J[side ? 'legR' : 'legL'].b; return L.localToWorld(V3(0, -0.45 * u, 0)); };
const MIST = (i) => V3(Math.sin(i * 1.9) * 1.6, 14.5 + (i % 4) * 1.6, -11.8);

let doSplashNow = null;
function resetWorld(Wd) {
  Wd.stump.visible = true; Wd.stump.position.set(STUMP.x, th(STUMP.x, STUMP.z) - 0.1, STUMP.z); Wd.stump.rotation.set(0, 0, 0);
  Wd.man.visible = true; Wd.thr.visible = false; Wd.thr2.visible = false; Wd.thr2.userData.lines.forEach((l) => (l.visible = true)); Wd.deck.visible = false; Wd.sp.visible = true; Wd.splash.visible = false;
}
function render3D(preset, pos, tgt, o = {}) {
  const Wd = world(), { r, cv } = rend();
  setLight(Wd, Object.assign({}, LIGHT[preset], o.light || {}), o.focus);
  Wd.cam.fov = o.fov ?? 50; Wd.cam.position.copy(pos); if (o.shake) Wd.cam.position.add(shake(TT, o.shake)); Wd.cam.lookAt(tgt); if (o.roll) Wd.cam.rotateZ(o.roll); Wd.cam.updateProjectionMatrix();
  animWorld(Wd, TT, o); if (doSplashNow) { doSplashNow(); doSplashNow = null; }
  Wd.deck.visible = o.deck ?? false; Wd.key.intensity = o.key ?? 0; Wd.moon.visible = o.moon ?? false;
  r.render(Wd.scene, Wd.cam);
  ykBlit(cv, { vis: o.vis ?? 1, spread: o.spread ?? 30 });
}
// a dithered fade window: in over [a, a+d], out over [b-d, b]
const fadeWin = (a, b, d = 0.6) => Math.min(ss(a, a + d, TT), 1 - ss(b - d, b, TT));

function shotOpen() {   // night; her shape in the mist on the brink; one thread glints down to the water
  const Wd = world(), t = TT, k = (t - 0) / 4.5;
  poseSpider(Wd, T2(), { twitch: 0.4 }); Wd.man.visible = false; axeIn(Wd, V3(40, 0, 40)); Wd.thr.visible = false; Wd.thr2.visible = true;
  threadsTo(Wd.thr2, (i) => handW(Wd, i % 2), (i) => V3(-1 + i * 1.2, 0, -7 + i), t, 0.2, 1);
  render3D('night', V3(lerp(0.6, 0, k), lerp(2.6, 3.6, k), lerp(18, 15, k)), V3(0, 22, -13), { vis: fadeWin(0, 4.5, 0.7), mist: 0.4, birds: false, fov: 60, moon: true });
}
const printSrc = () => asset('print.jpg');
function shotCard() {
  fillAll('#020306'); ykStars(ss(4.5, 5.2, TT) * (1 - ss(8.3, 8.9, TT)));
  const kIn = TT < 8.3 ? ss(4.8, 5.6, TT) : 1 - ss(8.3, 8.9, TT), kN = TT < 8.3 ? ss(5.5, 6.3, TT) : 1 - ss(8.3, 8.7, TT);
  ykCard(printSrc(), 'Jorōgumo', kIn, kN, { y: 320, w: 720, h: 540 });
}
function shotNap() {   // day; the wide, then him asleep with the axe beside him
  const Wd = world(), t = TT, t2 = T2(); poseSpider(Wd, t2, { show: false }); Wd.thr2.visible = false;
  const breath = Math.sin(t2 * 1.6) * 0.04, P = Object.assign({}, POSE.lie, { sp: [breath, 0, 0] });
  placeMan(Wd, NAP.x, NAP.z, Math.PI + 0.2, P, 0.2); axeIn(Wd, V3(NAP.x + 0.6, 0, NAP.z - 0.2));
  Wd.thr.visible = t > 15; if (Wd.thr.visible) threadsTo(Wd.thr, (i) => shin(Wd, i % 2, 0.5 + 0.1 * (i % 3)), (i) => MIST(i), t, 0.6, 0.25 * ss(15, 17.5, t));
  if (t < 13.6) { const k = (t - 9) / 4.6; render3D('day', V3(lerp(3.8, 3.0, k), lerp(4.4, 4.0, k), lerp(20, 18.6, k)), V3(lerp(0.8, 0.4, k), 1.4, -4), { vis: ss(9, 9.6, t), fov: 58 }); }
  else { const k = (t - 13.6) / 4.4; render3D('day', V3(lerp(4.2, 3.8, k), lerp(2.9, 2.6, k), lerp(10.9, 10.4, k)), V3(1.15, 0.55, 8.5), { fov: 46 }); }
}
function shotLegs() {   // threads round his shins, up into the mist; he sits up
  const Wd = world(), t = TT, t2 = T2(); poseSpider(Wd, t2, { show: false }); Wd.thr2.visible = false;
  const up = ss(22.6, 23.8, t2), P = mixPose(POSE.lie, POSE.sitUp, up);
  placeMan(Wd, NAP.x, NAP.z, Math.PI + 0.2, P, 0.13 * (1 - up)); axeIn(Wd, V3(NAP.x + 0.6, 0, NAP.z - 0.2));
  Wd.thr.visible = true; threadsTo(Wd.thr, (i) => shin(Wd, i % 2, 0.25 + 0.12 * (i % 5)), (i) => MIST(i), t, 0.15, 1);
  const dim = { sunI: lerp(2.1, 1.2, ss(18, 26, t)), cover: lerp(0.5, 0.38, ss(18, 26, t)) };
  if (t < 22.5) { const k = ss(20.4, 22.4, t); render3D('day', V3(lerp(3.0, 2.6, k), lerp(1.55, 1.7, k), lerp(9.4, 10.4, k)), V3(lerp(1.3, 0, k), lerp(1.0, 13, k), lerp(7.4, -11, k)), { fov: 48, light: dim }); }
  else { const k = (t - 22.5) / 4.5; render3D('day', V3(NAP.x + 0.3, lerp(1.1, 1.0, k), NAP.z + lerp(3.3, 2.8, k)), V3(NAP.x, 0.55, NAP.z - 0.4), { fov: 50, light: dim }); }
}
function shotStump() {   // he chops the threads free, ties them to the old stump, backs away
  const Wd = world(), t = TT, t2 = T2(); poseSpider(Wd, t2, { show: false }); Wd.thr2.visible = false;
  const S = Wd.stump.position, top = V3(S.x, S.y + 0.7, S.z), light = { sunI: 1.1, cover: 0.36 };
  if (t < 31.5) {
    const ch = (t2 < 29.2) ? (mod(t2 - 27.4, 0.84) < 0.42 ? POSE.chopUp : POSE.chopDn) : POSE.kneel;
    placeMan(Wd, S.x + 0.95, S.z + 0.25, -Math.PI / 2 - 0.15, ch); axeIn(Wd, t2 < 29.2 ? 'hand' : V3(S.x + 1.4, 0, S.z + 0.9));
    Wd.thr.visible = true; threadsTo(Wd.thr, (i) => (t2 < 29.2 ? shin(Wd, i % 2, 0.5) : top.clone().add(V3(Math.sin(i) * 0.25, 0, Math.cos(i) * 0.25))), (i) => MIST(i), t, 0.1, 0.8);
    const k = (t - 27) / 4.5; render3D('day', V3(lerp(-6.0, -5.4, k), 1.5, lerp(9.8, 9.3, k)), V3(S.x + 0.3, 0.6, S.z - 0.2), { fov: 48, light });
  } else {
    const k = ss(31.7, 35.6, t2), x = lerp(S.x + 0.9, S.x + 1.6, k), z = lerp(S.z + 0.5, S.z + 3.2, k), P = gait(t2 * 0.7, 0.45, true); P.nk = [0.15, 0, 0];
    placeMan(Wd, x, z, Math.PI + 0.1, P); axeIn(Wd, 'hand');
    Wd.thr.visible = true; threadsTo(Wd.thr, (i) => top.clone().add(V3(Math.sin(i) * 0.25, 0, Math.cos(i) * 0.25)), (i) => MIST(i), t, 0.05, 1);
    const kk = (t - 31.5) / 4.5; render3D('day', V3(lerp(-0.4, -0.7, kk), lerp(1.5, 1.3, kk), lerp(13.6, 13.0, kk)), V3(-2.0, 3.0, -6), { fov: 50, light });
  }
}
// the stump's path: shaking, torn out at 38.6, dragged to the edge, in at 40.5, gone by 41.6
function stumpAt(t) {
  const S0 = V3(STUMP.x, th(STUMP.x, STUMP.z) - 0.1, STUMP.z);
  if (t < 38.6) { const sh = ss(37.2, 38.5, t) * 0.06; return { p: S0.clone().add(V3(Math.sin(t * 70) * sh, 0, Math.sin(t * 53) * sh)), rx: 0 }; }
  const k = ss(38.6, 40.5, t), e = V3(-1.8, 0, 4.4), p = S0.clone().lerp(e, Math.pow(k, 1.4)); p.y = th(p.x, p.z) + 0.25 * Math.sin(Math.PI * k);
  if (t > 40.5) { const s = ss(40.5, 41.6, t); p.add(V3(0.3 * s, -2.8 * s, -2.4 * s)); }
  return { p, rx: -0.9 * ss(38.6, 39.2, t) - 0.6 * ss(40.5, 41.4, t) };
}
function shotPull() {
  const Wd = world(), t = TT, t2 = T2(); poseSpider(Wd, t2, { show: false }); Wd.thr2.visible = false;
  const st = stumpAt(t2); Wd.stump.position.copy(st.p); Wd.stump.rotation.x = st.rx;
  const sk = t - 40.5; const doSplash = () => { if (sk < 0 || sk > 1.8) return; const P = Wd.splash.geometry.attributes.position; Wd.splashP.forEach((q, i) => { const tt = Math.max(0, sk - q.d); P.setXYZ(i, -1.6 + Math.cos(q.a) * q.v * tt, Math.max(-0.2, q.u * tt - 4.9 * tt * tt), 3.8 + Math.sin(q.a) * q.v * tt); }); P.needsUpdate = true; Wd.splash.visible = true; };
  const top = st.p.clone().add(V3(0, 0.7, 0)), light = { sunI: lerp(1.0, 0.3, ss(41, 45, t)), cover: 0.34 };
  Wd.thr.visible = t < 41.6; threadsTo(Wd.thr, (i) => top.clone().add(V3(Math.sin(i) * 0.25, 0, Math.cos(i) * 0.25)), (i) => MIST(i), t, 0, 1);
  placeMan(Wd, STUMP.x + 1.6, STUMP.z + 3.2, Math.PI + 0.1, Object.assign({}, POSE.look, { nk: [-0.1, 0, 0] })); axeIn(Wd, 'hand');
  if (t < 39.4) render3D('day', V3(-1.0, 0.5, 9.8), V3(STUMP.x, 0.55, STUMP.z), { fov: 50, light, shake: ss(37.4, 38.6, t) * 0.03 + (t > 38.6 ? 0.08 * (1 - ss(38.6, 39.4, t)) : 0) });
  else { const k = (t - 39.4) / 5.6; Wd.splash.onBeforeRender = () => {}; doSplashNow = doSplash; render3D('day', V3(lerp(3.8, 3.4, k), lerp(2.8, 2.6, k), lerp(11.8, 11.2, k)), V3(-1.8, 0.4, 3.0), { fov: 50, light, vis: 1 - ss(44.2, 45.0, t), shake: t > 40.5 && t < 41.2 ? 0.05 : 0 }); }
}
function shotReveal() {   // dusk; from the water's edge up at her; then closer on her body and the eight legs
  const Wd = world(), t = TT, t2 = T2(); Wd.stump.visible = false; Wd.thr.visible = false; Wd.thr2.visible = true;
  poseSpider(Wd, t2, { reach: 0.2 }); threadsTo(Wd.thr2, (i) => handW(Wd, i % 2), (i) => V3(-2 + i * 2, 0, -6 + i), t, 0.2, 1);
  placeMan(Wd, 1.0, 5.6, Math.PI - 0.05, POSE.look); axeIn(Wd, 'hand');
  if (t < 50.6) { const k = (t - 45.6) / 5; render3D('dusk', V3(lerp(2.4, 2.0, k), lerp(1.2, 1.6, k), lerp(8.4, 7.2, k)), V3(0, 23, -13), { fov: 56, mist: 0.3, focus: V3(0, 20, -14), key: 1.6 }); }
  else { const k = (t - 50.6) / 5.4; Wd.man.visible = false; render3D('dusk', V3(lerp(-3.5, 3.0, k), lerp(20, 23, k), lerp(4, 2.0, k)), V3(0, lerp(27, 29, k), -16), { fov: 60, mist: 0.35, focus: V3(0, 26, -16), key: 1.6 }); }
}
function shotSmile() {   // her face: six eyes open, the smile; then he runs through the cedars
  const Wd = world(), t = TT, t2 = T2(); Wd.stump.visible = false;
  if (t < 61.6) {
    poseSpider(Wd, t2, { smile: ss(57.6, 58.6, t2), split: ss(59.4, 60.2, t2), tilt: 0.25 * ss(56.4, 57.4, t2) + (t2 > 59.2 && t2 < 59.5 ? -0.12 : 0), nod: -0.2, twitch: 0.2 }); Wd.man.visible = false; Wd.thr.visible = false; Wd.thr2.visible = false;
    const H0 = headW(Wd), k = (t - 56) / 5.6;
    const pull = ss(59.2, 60.4, t); render3D('dusk', H0.clone().add(V3(lerp(0.8, 0.2, k), lerp(0.5, 0.25, k), lerp(9, 6.8, k) + 2.5 * pull)), H0.clone().add(V3(0, -0.75, 0)), { fov: 34, mist: 0, motes: false, light: { fn: 40, ff: 160, sunD: [-0.55, 0.3, 0.8], sunI: 2.6, hemI: 0.6, hemS: '#2a4f57' }, focus: H0, key: 0.25 });
  } else {
    poseSpider(Wd, t2, { show: true }); Wd.thr.visible = false; Wd.thr2.visible = false;
    const k = (t2 - 61.6) / 4.4, x = lerp(9, 20, k), z = lerp(10, 17, k), P = gait(t2 * 1.6, 1);
    placeMan(Wd, x, z, Math.atan2(11, 7), P); axeIn(Wd, V3(60, 0, 60));
    const m = Wd.man.position, dv = V3(11, 0, 7).normalize(), sv = V3(-dv.z, 0, dv.x); render3D('dusk', m.clone().addScaledVector(dv, -3.2).addScaledVector(sv, 1.6).add(V3(0, 1.5, 0)), m.clone().addScaledVector(dv, 2.5).add(V3(0, 0.9, 0)), { fov: 55, light: { sunI: 2.6, exp: 1.2, hemI: 1.5, fn: 10, ff: 70 }, motes: true });
  }
}
function shotDawn() {   // pale dawn; tourists on the deck photograph the fall; one thread glints over the water
  const Wd = world(), t = TT, t2 = T2(); Wd.stump.visible = false; Wd.man.visible = false; Wd.thr.visible = false; Wd.thr2.visible = true; poseSpider(Wd, t2, { show: false });
  Wd.tour.forEach((m, i) => { const P = i === 2 ? POSE.stand : mixPose(POSE.phone, POSE.stand, 0.15 * Math.sin(t2 * 0.5 + i) + 0.15); setPose(m, P); });
  threadsTo(Wd.thr2, (i) => V3(-2.6 + i * 0.2, 23.5, -12.8), (i) => V3(-1.2 + i * 0.3, 0.05, -2 + i * 0.2), t, 0.08, 1);
  Wd.thr2.userData.lines.forEach((l, i) => (l.visible = i === 0));
  const k = (t - 66) / 9; render3D('dawn', V3(lerp(9.6, 8.6, k), lerp(4.0, 3.7, k), lerp(21, 19.5, k)), V3(lerp(0.5, 0, k), 8.5, -10), { fov: 54, deck: true, mist: 0.5, birds: true, vis: 1 - ss(73.8, 75, t) });
}

const PARA = [
  ['My grandfather cut firewood in Izu, and he made us swear we would never fall asleep beside the Jōren falls.', 0.4, 8.85],
  ['One summer he did exactly that: the heat beat him on the bank, and he dozed off with his axe beside him.', 9.5, 17.75],
  ['He woke with his legs wrapped in threads finer than hair, running up into the mist of the falls.', 18.4, 26.75],
  ['Without a sound he cut them with his axe, tied them to an old stump, and slowly backed away.', 27.4, 35.75],
  ['Then the stump creaked, tore out by its roots, and was dragged down to the bottom of the pool.', 36.4, 44.6],
  ['In the spray he saw a woman with impossibly long hair, and behind her, eight huge legs holding up the falls.', 46.3, 55.75],
  ['She smiled and whispered, "clever boy." My grandfather ran without looking back and never returned to that forest.', 56.4, 65.75],
  ['Today tourists photograph the falls. None of them notice the thread glinting above the water.', 66.6, 74.4],
];
function sceneTale() {
  const t = TT; fillAll('#020306'); resetWorld(world());
  if (t < 4.5) shotOpen(); else if (t < 9) shotCard(); else if (t < 18) shotNap(); else if (t < 27) shotLegs(); else if (t < 36) shotStump();
  else if (t < 45.6) { if (t < 45.0) shotPull(); } else if (t < 56) shotReveal(); else if (t < 66) shotSmile(); else shotDawn();
  PARA.forEach(([s, a, b]) => ykPara(s, a, b, { cy: 1300 }));
}
