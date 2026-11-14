// =====================================================================
//  RUN — the shots. Outside: the rain, the path, the jizō with its stuttering candle, my grandfather's lantern; inside:
//  the irori and the andon, my grandmother kneeling with her back to us. The Noppera-bo's face is a blank egg that
//  splits into a vertical mouth (openMouth).
// =====================================================================
const easeOut = (x) => 1 - (1 - x) ** 3;
const DOWN = V3(0, -1, 0), UPV = V3(0, 1, 0);
const yzOf = (q) => ({ Y: V3(0, 1, 0).applyQuaternion(q), Z: V3(0, 0, 1).applyQuaternion(q) });
function headRel(B, pitch, yaw, roll) { const q = qBasis(B.X, B.Y, B.Z).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ'))); return yzOf(q); }
const MOON_IN = V3(-1, 0.42, 0.15);

function animWorld(Wd, t, o = {}) {
  WIND.value = t; const cam = Wd.cam.position;
  Wd.sky.position.copy(cam); Wd.ridges.forEach((m) => m.position.set(cam.x, cam.y + m.userData.y - 30, cam.z));
  const md = (o.moonDir || V3(-0.3, 0.45, -1)).clone().normalize(); Wd.moonDisk.position.copy(cam).addScaledVector(md, 500); Wd.moonDisk.lookAt(cam); Wd.moonDisk.scale.setScalar(o.moonS ?? 0.01); Wd.moonHalo.position.copy(Wd.moonDisk.position); Wd.moonHalo.scale.setScalar((o.moonS ?? 0.01) * 5);
  Wd.mist.forEach((s) => { const u = s.userData; s.position.x = u.x + 1.5 * Math.sin(t * 0.07 + u.ph); const dc = s.position.distanceTo(cam) - s.scale.x * 0.5; s.material.opacity = (0.3 + 0.15 * Math.sin(t * 0.3 + u.ph)) * (o.mist ?? 0) * ss(1.5, 6.0, dc); s.visible = s.material.opacity > 0.003; });
  Wd.motes.visible = false; Wd.snow.visible = false; animRain(Wd, t, o.rain ?? 0);
}
// a practical flame: a slow breath, a fast shiver and, now and then, a dip (hashed per 1/12 s step)
const flick = (t, seed = 0) => { const h = hsh(Math.floor(t * 12) + seed * 97, 5), h2 = hsh(Math.floor(t * 12) - 1 + seed * 97, 5); return (0.86 + 0.08 * Math.sin(t * 6.3 + seed) + 0.06 * Math.sin(t * 15.7 + seed * 2)) * (h > 0.9 ? 0.3 : h2 > 0.9 ? 0.65 : 1); };
// a damaged light: stutters off and on in hashed bursts (1/20 s steps), with dead spells
const broken = (t) => { const s = Math.floor(t * 20), h = hsh(s, 9), burst = hsh(Math.floor(t * 2.5), 4) > 0.55; return burst ? (h > 0.45 ? 1 : h > 0.25 ? 0.18 : 0.0) : (h > 0.94 ? 0.12 : 1); };
function lamp(Wd, k = 1, dmg = 0) {   // the andon inside
  const f = k * flick(TT, 3) * lerp(1, broken(TT), dmg); Wd.glow.position.copy(Wd.andonAt); Wd.glow.color.set('#ffa850'); Wd.glow.distance = 7; Wd.glow.decay = 1.6; Wd.glow.intensity = 3.6 * f;
  Wd.andonM.color.set(k > 0 ? '#e8a050' : '#3a2c1c').multiplyScalar(k > 0 ? 0.35 + 0.65 * f : 1); Wd.andonGlow.visible = k > 0; Wd.andonGlow.position.copy(Wd.andonAt); Wd.andonGlow.material.opacity = 0.7 * f; Wd.andonGlow.scale.setScalar(0.9); return f;
}
function candle(Wd, k = 1, dmg = 1) {   // the offering candle at the jizō: a small warm light that stutters
  const f = k * flick(TT, 5) * lerp(1, broken(TT), dmg); Wd.glow.position.copy(Wd.candleAt).add(V3(0, 0.05, 0)); Wd.glow.color.set('#ffb060'); Wd.glow.distance = 4; Wd.glow.decay = 1.4; Wd.glow.intensity = 2.8 * f;
  Wd.andonGlow.visible = k > 0; Wd.andonGlow.position.copy(Wd.candleAt).add(V3(0, 0.05, 0)); Wd.andonGlow.material.opacity = 0.9 * f; Wd.andonGlow.scale.setScalar(0.38); return f;
}
function embers(Wd, k = 1) { Wd.fill.intensity = 1.6 * k * flick(TT, 7); Wd.emb.forEach((e) => e.material.color.set(Math.sin(TT * 1.7 + e.userData.ph) > 0.2 ? '#ffa040' : '#c0501c')); }
function lightsOff(Wd) { [Wd.matchL, Wd.key, Wd.fill, Wd.rim, Wd.glow].forEach((l) => (l.intensity = 0)); Wd.match.fl.visible = false; Wd.andonGlow.visible = false; }
function resetWorld(Wd) {
  [Wd.man, Wd.ghost, Wd.gran].forEach((P) => { P.g.visible = false; openMouth(P, 0); }); const L = Wd.lant; [L.g, L.body, L.cord].forEach((m) => (m.visible = false)); Wd.match.g.visible = false;
  Wd.paperOut.color.set('#34494b'); Wd.andonM.color.set('#3a2c1c'); Wd.glow.distance = 14; Wd.glow.decay = 1.5; Wd.paperOut.transparent = false; Wd.scroll.visible = false; Wd.ofudaPost.visible = false; Wd.scr.forEach((s) => (s.visible = false));
  const T = Wd.tear; T.intact.visible = true; T.torn.visible = false; T.flaps.forEach((f) => (f.visible = false)); lightsOff(Wd);
}
function render3D(preset, pos, tgt, o = {}) {
  const Wd = world(), { r, cv } = rend();
  setLight(Wd, Object.assign({}, LIGHT[preset], o.light || {}));
  if (window.DBG_CAM) { pos = window.DBG_CAM[0]; tgt = window.DBG_CAM[1]; o.fov = window.DBG_CAM[2] ?? o.fov; }   // debug views only
  Wd.cam.fov = o.fov ?? 50; Wd.cam.position.copy(pos); Wd.cam.up.set(0, 1, 0); Wd.cam.lookAt(tgt); if (o.roll) Wd.cam.rotateZ(o.roll); Wd.cam.updateProjectionMatrix(); Wd.cam.updateMatrixWorld(true);
  animWorld(Wd, TT, o);
  { const c = o.shadowAt || tgt, md = (o.moonDir || MOON_IN).clone().normalize(); Wd.moon.position.copy(c).addScaledVector(md, 40); Wd.moon.target.position.copy(c); Wd.moon.target.updateMatrixWorld(); }
  if (o.rim) { Wd.rim.intensity = o.rim; const c = o.shadowAt || tgt, rd = (o.rimDir || V3(0, 0.5, -1)).clone().normalize(); Wd.rim.position.copy(c).addScaledVector(rd, 40); Wd.rim.target.position.copy(c); Wd.rim.target.updateMatrixWorld(); }
  [Wd.man, Wd.ghost, Wd.gran].forEach((P) => P.g.visible && P.g.updateMatrixWorld(true));
  r.render(Wd.scene, Wd.cam);
  ykBlit(cv, { vis: o.vis ?? 1 });
}
function keyAt(Wd, from, at, I, angle = 0.4, col = '#b9cbc6') { Wd.key.color.set(col); Wd.key.position.copy(from); Wd.key.target.position.copy(at); Wd.key.target.updateMatrixWorld(); Wd.key.intensity = I; Wd.key.angle = angle; Wd.key.penumbra = 0.7; }
const OUT = { fog: '#0a1214', fn: 2, ff: 22, hemI: 0.22, moonI: 0.18, exp: 1.0 };

// ---------------------------------------------------------------------
//  the crying woman at the jizō: kneeling, bent forward, a sleeve at her face, her shoulders shaking
// ---------------------------------------------------------------------
const GH = () => onPath(JIZO_S, -0.72);
function poseGhost(Wd, o = {}) {
  const P = Wd.ghost, J = GH(), F = J.sd.clone().negate().applyAxisAngle(UPV, o.turn ?? 0), Lx = UPV.clone().cross(F), sob = o.sob ?? 0;
  const lean = 0.42 + 0.04 * Math.sin(TT * 7.5) * sob - 0.25 * (o.up ?? 0), at = J.p.clone();
  const b0 = at.clone().add(V3(0, 0.27, 0)), U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)), top = b0.clone().addScaledVector(U, P.pd.torso);
  const face = top.clone().addScaledVector(F, 0.2).add(V3(0, 0.06, 0)), lap = at.clone().addScaledVector(F, 0.22).add(V3(0, 0.34, 0)), low = o.lower ?? 0;
  const hR = face.clone().addScaledVector(Lx, -0.03).lerp(lap.clone().addScaledVector(Lx, -0.1), low), hL = face.clone().addScaledVector(Lx, 0.05).lerp(lap.clone().addScaledVector(Lx, 0.1), Math.max(low, o.lowerL ?? 0));
  return kneel(P, { at, F, lean, pitch: (o.pitch ?? 0.55), yaw: o.yaw ?? 0, roll: o.roll ?? 0, hands: [hL, hR], hdir: [{ Z: F.clone().negate().addScaledVector(UPV, 0.6).normalize(), Y: Lx.clone() }, { Z: F.clone().negate().addScaledVector(UPV, 0.6).normalize(), Y: Lx.clone().negate() }], curl: [0.6, 0.6], br: 5 });
}

// ---------------------------------------------------------------------
//  the shots
// ---------------------------------------------------------------------
function shotHook() {   // she crouches by the jizō in the rain, her back to us, sobbing; the offering candle stutters
  const Wd = world(), t = TT; candle(Wd, 1, 1); const g = poseGhost(Wd, { sob: 1, pitch: 0.6 + 0.05 * Math.sin(t * 3) });
  const J = GH(), cam = J.p.clone().addScaledVector(J.sd, 1.25).addScaledVector(J.tg, -0.55).add(V3(0, 0.62, 0)), tg = g.top.clone().add(V3(0, -0.3, 0)).addScaledVector(J.sd, -0.1);
  keyAt(Wd, J.p.clone().add(V3(-2, 3.5, 1)), g.top, 0.5, 0.5);
  render3D('night', cam, tg, { fov: 40, vis: 1 - ss(3.7, 4.0, t), light: OUT, rain: 1, mist: 0.4, rim: 0.4, rimDir: J.sd.clone().negate().setY(0.5) });
}
const printSrc = () => asset('print.jpg');
function shotCard() {
  fillAll('#020306'); ykStars(ss(4.0, 4.6, TT) * (1 - ss(6.5, 7.0, TT)));
  const kIn = TT < 6.5 ? ss(4.15, 4.9, TT) : 1 - ss(6.5, 6.95, TT), kN = TT < 6.5 ? ss(4.7, 5.4, TT) : 1 - ss(6.5, 6.85, TT);
  if (printSrc()) ykCard(printSrc(), 'Noppera-bo', kIn, kN, { y: 320, w: 720, h: 524, pw: 88, seal: '無' });
}
const MAN_S0 = 11.2, MAN_STOP = 16.5;
function shotRoad() {   // he comes up the path with his lantern; she is crouched by the jizō in the foreground
  const Wd = world(), t = TT; candle(Wd, 1, 0.5); poseGhost(Wd, { sob: 1 });
  const s = Math.min(MAN_STOP - MAN_S0, 0.95 * (t - 7.0)), A = onPath(MAN_S0, 0.15), w = walkMan(Wd, { O: A.p, D: A.tg, s, pitch: 0.05, look: 0.3 * ss(10.5, 12, t), plant: s >= MAN_STOP - MAN_S0 - 0.01 ? [s - 0.05, s + 0.08] : null }); holdChochin(Wd, 1);
  const J = GH(), cam = J.p.clone().addScaledVector(J.tg, 0.9).addScaledVector(J.sd, 0.35).add(V3(0, 0.85, 0)), tg = w.pos.clone().lerp(J.p, 0.2).add(V3(0, 0.25, 0));
  render3D('night', cam, tg, { fov: 38, vis: ss(7.0, 7.4, t), light: OUT, rain: 1, mist: 0.7 });
}
function shotSleeve() {   // he kneels and touches her shoulder; she turns to him and lowers her sleeve: there is nothing there
  const Wd = world(), t = TT; candle(Wd, 1, 0.3); const J = GH();
  const turn = ss(14.4, 15.4, t), lower = ss(15.8, 16.5, t), g = poseGhost(Wd, { sob: 1 - ss(16.4, 16.6, t), turn: -1.35 * turn, up: turn, pitch: lerp(0.55, 0.1, turn) + 0.12 * lower, lower, roll: 0.15 * lower });
  const mF = J.tg.clone().negate(), mAt = J.p.clone().addScaledVector(J.tg, -0.62).addScaledVector(J.sd, 0.05), Lx = UPV.clone().cross(mF);
  const reach = ss(13.2, 13.8, t) * (1 - 0.6 * ss(16.5, 17.2, t)), sh = g.top.clone().addScaledVector(Lx, 0.0).add(V3(0, -0.02, 0)), rest = mAt.clone().addScaledVector(mF, 0.25).addScaledVector(Lx, -0.12).add(V3(0, 0.35, 0));
  const m = kneel(Wd.man, { at: mAt, F: mF, lean: 0.25 - 0.15 * ss(16.5, 17, t), pitch: 0.25, hands: [mAt.clone().addScaledVector(mF, 0.3).addScaledVector(Lx, 0.15).add(V3(0, 0.34, 0)), rest.clone().lerp(sh, reach)], grip: [true, false], curl: [0.4, 0.3] });
  holdChochin(Wd, 1);
  const HZ = J.sd.clone().negate().applyAxisAngle(UPV, -1.35), hp = J.p.clone().addScaledVector(HZ, 0.2).add(V3(0, 0.78, 0)), cam = hp.clone().addScaledVector(HZ, 1.15).addScaledVector(UPV.clone().cross(HZ), 0.45).add(V3(0, 0.08, 0)), tg = hp.clone().add(V3(0, -0.22, 0)).addScaledVector(UPV.clone().cross(HZ), 0.15);
  keyAt(Wd, Wd.lant.body.position.clone().add(V3(0, 0.2, 0)), hp, 1.4 * flick(t, 21), 0.45, '#ffb070');
  render3D('night', cam, tg, { fov: 42, light: OUT, rain: 1, mist: 0.3 });
}
function shotRun() {   // he runs down the path toward the house, the lantern swinging
  const Wd = world(), t = TT, A = onPath(MAN_STOP + 0.5, 0.1), s = 2.1 * (t - 19.0), w = walkMan(Wd, { O: A.p, D: onPath(MAN_STOP + 6).p.clone().sub(A.p), s, L: 0.7, lean: 0.22, pitch: 0.0 }); holdChochin(Wd, 1);
  Wd.paperOut.color.set('#d89a58'); Wd.glow.position.set(HS.eng - 0.6, 0.6, 0.4); Wd.glow.intensity = 1.6;
  const cam = w.pos.clone().addScaledVector(w.F, -2.3).add(V3(0, 0.75, 0)), tg = w.pos.clone().add(V3(0, 0.45, 0)).lerp(V3(HS.eng, 1.0, 0.6), 0.12);
  render3D('night', cam, tg, { fov: 52, light: OUT, rain: 1, mist: 0.8 });
}
const GRAN = { at: V3(1.0, 0, -0.32), F: V3(0, 0, 1) }, MAN_IN = { at: V3(0.62, 0, -1.35), F: V3(0.2, 0, 1) };
function shotHome() {   // inside, wet, he tells her; she kneels at the irori with her back to him
  const Wd = world(), t = TT; embers(Wd, 1.2); lamp(Wd, 0.9, 0.25);
  kneel(Wd.gran, { at: GRAN.at, F: GRAN.F, lean: 0.12, pitch: 0.25, br: 1.6 });
  const m = kneel(Wd.man, { at: MAN_IN.at, F: MAN_IN.F, lean: 0.22, pitch: 0.1 + 0.05 * Math.sin(t * 4), br: 5 });
  const cam = m.top.clone().add(V3(-0.55, -0.05, -0.15)), tg = GRAN.at.clone().add(V3(0.05, 0.25, 0.2));
  render3D('inside', cam, tg, { fov: 48, vis: 1 - ss(29.25, 29.4, t), rim: 0.3, rimDir: V3(0, 0.5, 1) });
}
function shotTurn() {   // THE HIT: she turns: the same smooth face; then it splits into a vertical mouth of teeth
  const Wd = world(), t = TT; embers(Wd, 1.0); lamp(Wd, 1, 0.45);
  const turn = easeOut(ss(30.0, 30.45, t)), F = GRAN.F.clone().applyAxisAngle(UPV, Math.PI * turn), G = Wd.gran;
  kneel(G, { at: GRAN.at, F, lean: 0.1, pitch: -0.05 + 0.04 * Math.sin(t * 1.3), roll: 0.18 * ss(31, 33, t), br: 1.2 }); { const u = ss(31.6, 33.0, t), n = 5, ok = (Math.floor(u * n) + ss(0.55, 1, mod(u * n, 1))) / n; openMouth(G, ok * (0.95 + 0.05 * Math.sin(t * 11))); }
  const hd = G.H.position, cam = hd.clone().add(V3(0.05, 0.0, -1.0 + 0.22 * ss(30.5, 35.5, t))), tg = hd.clone().add(V3(0, -0.15, 0));
  keyAt(Wd, hd.clone().add(V3(-0.9, 0.5, -0.8)), hd, 1.2, 0.35, '#ffb070');
  render3D('inside', cam, tg, { fov: 40, rim: 0.35, rimDir: V3(0.4, 0.4, 1) });
}
function shotEnd() {   // the lamp sputters out; only the embers: her open face close; then dark
  const Wd = world(), t = TT, out = ss(36.2, 36.9, t); embers(Wd, 0.9 - 0.4 * out); lamp(Wd, 1 - out, 1);
  const G = Wd.gran; kneel(G, { at: GRAN.at, F: GRAN.F.clone().negate(), lean: 0.1 + 0.05 * ss(35.5, 40, t), pitch: -0.02, roll: 0.18, br: 1.2 }); openMouth(G, 0.95);
  const hd = G.H.position, cam = hd.clone().add(V3(0.16, 0.02, -0.95 + 0.1 * ss(35.5, 40, t))), tg = hd.clone().add(V3(0, -0.035, 0));
  keyAt(Wd, hd.clone().add(V3(0.3, -0.35, -0.5)), hd, 2.4 * (1 - 0.5 * ss(37, 40, t)) * flick(t, 7), 0.5, '#ff8a40');
  render3D('inside', cam, tg, { fov: 40, vis: 1 - ss(39.4, 40, t) });
}

const PARA = [
  ['If you hear a woman crying on the mountain road at night, do not ask to see her face.', -1.2, 6.6],
  ['My grandfather was walking home in the rain when he heard her crying by the jizō.', 7.4, 12.25],
  ['He asked to see her face. She lowered her sleeve. There was nothing there. Smooth skin, like an egg.', 12.9, 18.75],
  ['He ran all the way home without looking back.', 19.4, 24.25],
  ['He told my grandmother what he saw. She kept her back to him and asked one thing.', 24.9, 29.15],
  ['"Was it like this?"', 30.3, 35.25],
  ['If someone is crying on the road at night, keep walking.', 35.9, 39.4],
];
function sceneTale() {
  const t = TT; fillAll('#020306'); resetWorld(world());
  if (window.DBG_SHOT) window.DBG_SHOT(); else
  if (t < 4.0) shotHook(); else if (t < 7.0) shotCard(); else if (t < 12.5) shotRoad(); else if (t < 19.0) shotSleeve(); else if (t < 24.5) shotRun();
  else if (t < 30.0) { if (t < 29.4) shotHome(); } else if (t < 35.5) shotTurn(); else shotEnd();
  PARA.forEach(([s, a, b]) => ykPara(s, a, b, { cy: 1300 }));
  if (t >= 36.0) { const f = () => ykBadge(asset('kodama.jpg'), 'kodamashorts', CX, 290, ss(36.0, 36.7, t) * (1 - ss(39.4, 40, t))); if (DEFER) DEFER.push(f); else f(); }
}
