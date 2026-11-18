// =====================================================================
//  RUN — the shots. The janitor is posed by walkP (stand / walk / run, on the floor or on the stairs), the flashlight
//  sits in his right fist (holdProp) and throws the only real light in the stairwell (Wd.lamp + a faint beam cone).
//  The Thing is posed by poseThing on its own stop-motion clock (stutT), still while lit, moved while dark.
// =====================================================================
const easeOut = (x) => 1 - (1 - x) ** 3;
const DOWN = V3(0, -1, 0), UPV = V3(0, 1, 0);
function animWorld(Wd, t, cam) {   // dust motes drifting in the beam / air
  const P = Wd.dust.geometry.attributes.position; Wd.dust.visible = true; const B = 3.2;
  for (let i = 0; i < 500; i++) { const x = cam.x + mod(hsh(i, 1) * B + 0.05 * t, B) - B / 2, y = cam.y + mod(hsh(i, 2) * B - 0.03 * t * (0.5 + hsh(i, 4)), B) - B / 2, z = cam.z + mod(hsh(i, 3) * B + 0.02 * Math.sin(t * 0.3 + i), B) - B / 2; P.setXYZ(i, x, y, z); } P.needsUpdate = true;
}
function lightsOff(Wd) { [Wd.lamp, Wd.key, Wd.fill, Wd.bounce, Wd.red, Wd.rim, ...Wd.slamps].forEach((l) => (l.intensity = 0)); Wd.beam.visible = false; }
function resetWorld(Wd) { Wd.me.g.visible = false; Wd.thing.g.visible = false; Wd.torch.visible = false; Wd.mop.visible = false; lightsOff(Wd); Wd.door.visible = true; Wd.dayBoard.visible = false; Wd.bulbs.forEach((b) => (b.m.material.emissiveIntensity = 0)); Wd.me.setFear(0); }
// the flashlight: a spot from the lens along dir; k = on/off level (flicker); the beam cone is drawn faintly
function torchLight(Wd, p, dir, k = 1, o = {}) {
  const L = Wd.lamp, d = dir.clone().normalize(); L.color.set('#fff0d4'); L.position.copy(p); L.target.position.copy(p).addScaledVector(d, 4); L.target.updateMatrixWorld(); L.intensity = (o.I ?? 7) * k; L.angle = o.ang ?? 0.34; L.penumbra = 0.55; L.distance = o.dist ?? 6.5; L.decay = 1.4;
  const B = Wd.beam; B.visible = k > 0.1 && o.cone !== false; const len = o.coneL ?? 3.2, rad = Math.tan(L.angle * 0.8) * len; B.position.copy(p); B.lookAt(p.clone().add(d)); B.scale.set(rad, rad, len); B.material.opacity = 0.06 * k * (o.coneA ?? 1);
  Wd.torch.userData.lens.material.color.set(k > 0.3 ? '#fff4d8' : '#6a6450');
  if (o.bounce !== false) { const Bn = Wd.bounce; Bn.color.set('#d8c8a8'); Bn.position.copy(p).addScaledVector(d, o.bD ?? 0.9).add(V3(0, 0.25, 0)); Bn.intensity = (o.bI ?? 1.3) * k; Bn.distance = 3.2; Bn.decay = 1.3; }   // spill off the lit wall / steps lights him from the front
}
function torchFromHand(Wd, P, k = 1, o = {}) { holdProp(P, 1, Wd.torch); const t = Wd.torch, p = t.localToWorld(V3(0.17, 0, 0)), d = V3(1, 0, 0).applyQuaternion(t.getWorldQuaternion(new THREE.Quaternion())); torchLight(Wd, p, d, k, o); return { p, d }; }
// where his right fist goes to aim the flashlight along dir (arm hanging, fist at chest/hip height, thumb end forward)
function aimHand(P, B, top, F, dir, o = {}) {
  const R = B.X.clone().negate(), gp = top.clone().addScaledVector(R, o.side ?? 0.21).addScaledVector(F, o.fwd ?? 0.24).add(V3(0, o.dy ?? -0.47, 0));
  const hf = barHand(dir, DOWN.clone().addScaledVector(F, -0.25).addScaledVector(R, -0.35)); return { W: wristFor(P, gp, hf), hf };
}
// the janitor walking with the light: two passes (pose → aim the fist from that pose)
function janWalk(Wd, o, aim) {
  const P = Wd.me, a = walkP(P, o), dir = aim(a), h = aimHand(P, a.B, a.top, a.F, dir, o.aimO || {});
  const hands = [a.P.arm[0].W.clone().add(V3(0, -0.03, 0)).addScaledVector(a.B.X, -0.02), h.W]; const b = walkP(P, Object.assign({}, o, { hands, hdir: [{ Z: DOWN.clone().addScaledVector(a.F, o.run ? 0.6 : 0.15), Y: a.B.X.clone() }, h.hf], grip: [false, true], curl: [0.45, 0.6], epole: [a.B.X.clone().addScaledVector(a.F, -0.8), a.B.X.clone().multiplyScalar(-0.3).addScaledVector(a.F, -1).add(V3(0, -0.6, 0))] })); return b;
}
function render3D(preset, pos, tgt, o = {}) {
  const Wd = world(), { r, cv } = rend();
  setLight(Wd, Object.assign({}, LIGHT[preset], o.light || {}));
  if (window.DBG_CAM) { pos = window.DBG_CAM[0]; tgt = window.DBG_CAM[1]; o.fov = window.DBG_CAM[2] ?? o.fov; }   // debug views only (never set in the piece)
  Wd.cam.fov = o.fov ?? 50; Wd.cam.position.copy(pos); Wd.cam.up.set(0, 1, 0); Wd.cam.lookAt(tgt); if (o.sy !== undefined && !window.DBG_CAM) Wd.cam.rotateX(-Math.atan(2 * (0.5 - o.sy) * Math.tan(Wd.cam.fov * Math.PI / 360))); if (o.roll) Wd.cam.rotateZ(o.roll); Wd.cam.updateProjectionMatrix(); Wd.cam.updateMatrixWorld(true);
  animWorld(Wd, TT, pos);
  { const c = o.shadowAt || tgt, md = (o.moonDir || V3(0.25, 0.6, 1)).clone().normalize(); Wd.moon.position.copy(c).addScaledVector(md, 40); Wd.moon.target.position.copy(c); Wd.moon.target.updateMatrixWorld(); }
  if (o.rim) { Wd.rim.intensity = o.rim; Wd.rim.color.set(o.rimC || '#9ab8b8'); const c = o.shadowAt || tgt, rd = (o.rimDir || V3(0, 0.5, -1)).clone().normalize(); Wd.rim.position.copy(c).addScaledVector(rd, 40); Wd.rim.target.position.copy(c); Wd.rim.target.updateMatrixWorld(); }
  if (preset === 'well') setBulbs(Wd, o.bulbAt || tgt, TT, o.bulbOn ?? 1);
  if (o.fill) { Wd.fill.color.set(o.fill.c || '#7a9a9c'); Wd.fill.position.copy(pos).add(o.fill.off || V3(0, 0.3, 0)); Wd.fill.intensity = o.fill.I; Wd.fill.distance = o.fill.d ?? 6; Wd.fill.decay = 1.5; }
  r.render(Wd.scene, Wd.cam);
  ykBlit(cv, { vis: o.vis ?? 1 });
}

function gaitFeet(P, o, s) {
  const pd = P.pd, F = o.D.clone().setY(0).normalize(), Lx = UPV.clone().cross(F), gf = o.gf || gT, run = !!o.run, stride = o.stride ?? (run ? 1.6 : 1.24), duty = run ? 0.4 : 0.62, c = s / stride, out = [];
  [0, 1].forEach((j) => { const side = j === 0 ? 1 : -1, a = c + 0.5 * j + duty / 2, ph = mod(a, 1), n = Math.floor(a), plantX = (n - 0.5 * j) * stride, lat = Lx.clone().multiplyScalar(side * 0.095);
    let x, lift = 0, pit = 0, stance = false, ke = 0;
    if (ph < duty) { stance = true; x = plantX; const ho = ss(duty * 0.7, duty, ph), hs = 1 - ss(0, duty * 0.15, ph); pit = 0.55 * ho - 0.22 * hs; }
    else { const k = (ph - duty) / (1 - duty); ke = ss(0, 1, k); x = lerp(plantX, plantX + stride, ke); lift = (o.stairs ? (run ? 0.1 : 0.06) : run ? 0.24 : 0.1) * Math.sin(Math.PI * Math.min(1, k * 1.1)); pit = lerp(0.55, -0.22, ss(0, 0.85, k)); }
    const base = o.O.clone().addScaledVector(F, x).add(lat); let gy = gf(base.x, base.z);
    if (!stance && o.stairs) { const pa = o.O.clone().addScaledVector(F, plantX).add(lat), pb = o.O.clone().addScaledVector(F, plantX + stride).add(lat), ga = gf(pa.x, pa.z), gb = gf(pb.x, pb.z); gy = lerp(ga, gb, ss(0.1, 0.9, ke)) + 0.35 * Math.abs(gb - ga) * Math.sin(Math.PI * ke); }   // on stairs: arc from tread to tread, never through a nosing
    let ank = base.clone().setY(gy + pd.ank + lift);
    if (pit > 0 && (stance || lift < 0.03)) { ank.addScaledVector(F, 0.13 - 0.13 * Math.cos(pit)); ank.y += 0.13 * Math.sin(pit); }   // toe pivot
    out.push({ ank, pit, stance, F, Lx }); });
  return out;
}
function walkP(P, o) {
  const pd = P.pd, F0 = o.D.clone().setY(0).normalize(), Lx = UPV.clone().cross(F0), gf = o.gf || gT, legL = pd.thigh + pd.shin, run = !!o.run, stand = !!o.plant;
  const s = o.s ?? 0, stride = o.stride ?? (run ? 1.6 : 1.24), c = s / stride; P.gfNow = gf;
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
  poseP(P, { pos, U, F, head, hands: [hL, hR], grip: o.grip || [false, false], hdir: o.hdir || [{ Z: DOWN.clone().addScaledVector(F0, run ? 0.6 : 0.15), Y: B.X.clone() }, { Z: DOWN.clone().addScaledVector(F0, run ? 0.6 : 0.15), Y: R.clone() }],
    epole: o.epole || [B.X.clone().addScaledVector(F0, -0.8), R.clone().addScaledVector(F0, -0.8)], feet: feet.map((f) => f.ank), fdir: feet.map((f) => ({ Z: F0.clone().applyAxisAngle(Lx, f.pit), Y: UPV.clone().applyAxisAngle(Lx, f.pit) })),
    kpole: F0.clone().addScaledVector(UPV, 0.1), curl: o.curl || [0.45, 0.45], breath: Math.sin(TT * (o.breathR ?? 2.4)) });
  if (P.scarfTail) P.scarfTail.rotation.x = -0.12 - (run ? 0.55 : stand ? 0 : 0.12) - 0.08 * Math.sin(TT * (run ? 9 : 3.1)) * (stand ? 0.4 : 1);
  return { P, B, top, pos, F: F0, feet };
}

// ---------------------------------------------------------------------
//  the shots
// ---------------------------------------------------------------------
const LANE_A = -(WELL + LW / 2), LANE_B = WELL + LW / 2;
const gfFl = (fl) => (x, z) => stairY(fl, x, z);
// the flashlight's planned drop-outs (the Thing moves in them)
const TORCH_OFF = [[1.55, 1.8], [43.55, 43.62], [43.9, 44.05], [44.3, 44.36], [44.55, 45.0], [48.9, 48.98]];
const torchK = (t) => TORCH_OFF.some(([a, b]) => t >= a && t < b) ? 0.02 : 1;
function shotHook() {   // looking down the well from landing 1: the face looks up from landing 4; on the flicker it is on landing 3
  const Wd = world(), t = TT, tq = stutT(t), k = torchK(t), near = t >= 1.8, cam = V3(SX + SL - 0.42, landY(1) + 1.72, 0.1);
  setNums(Wd, 0);
  const base = near ? V3(SX + SL + 0.32, landY(3), 0.05) : V3(SX - 0.32, landY(4), -0.05), F = near ? V3(-1, 0, 0) : V3(1, 0, 0);
  const T = poseThing(Wd, { base, F, look: cam, lean: 0.85, roll: near ? -0.18 - 0.22 * ss(1.8, 4.4, tq) : 0.12, t: tq, hands: [base.clone().addScaledVector(F, 0.3).add(V3(0, 0.92, 0.2)), base.clone().addScaledVector(F, 0.3).add(V3(0, 0.92, -0.22))], curl: 0.5 });
  const fp = T.head.position.clone(), tg = fp.clone(), lp = cam.clone().add(V3(0.1, 0.25, 0.25));
  torchLight(Wd, lp, fp.clone().sub(lp), k, { I: 4.2, ang: 0.13, dist: 7, coneL: 4, coneA: 0.6, bounce: false });
  Wd.bulbs.forEach((b) => (b.live = [3, 4].includes(b.n) ? 1 : 0));
  render3D('well', cam, tg, { fov: lerp(21.5, 19, ss(0, 4.5, t)), sy: 0.3, bulbAt: fp, bulbOn: k, rim: 0.5, rimDir: V3(0.2, -0.6, 0.3), rimC: '#6a9a9c', fill: { I: 0.25, d: 3, c: '#7aa0a0', off: V3(0, -0.6, 0) }, vis: 1 - ss(4.2, 4.5, t) });
  Wd.bulbs.forEach((b) => (b.live = [1, 3, 6, 9, 12, 17].includes(b.n) ? 1 : 0));
}
const printSrc = () => asset('print.jpg');
function shotCard() {
  fillAll('#020306'); ykStars(ss(4.5, 5.2, TT) * (1 - ss(7.9, 8.5, TT)));
  const kIn = TT < 7.9 ? ss(4.7, 5.5, TT) : 1 - ss(7.9, 8.45, TT), kN = TT < 7.9 ? ss(5.4, 6.2, TT) : 1 - ss(7.9, 8.3, TT);
  ykCard(printSrc(), 'SCP-087', kIn, kN, { y: 320, w: 720, h: 600, pw: 96, seal: '階' });
}
const hallX = (t) => -12.5 + 0.9 * (t - 8.5);
function shotHall() {   // the night corridor: moonlight through the windows, he walks toward us with the flashlight
  const Wd = world(), t = TT, s = 0.9 * (t - 8.5), x = hallX(t);
  janWalk(Wd, { O: V3(-12.5, 0, 0.2), D: V3(1, 0, 0), s, pitch: 0.1, look: 0.05 }, (a) => a.F.clone().add(V3(0, -0.35, 0.05)));
  torchFromHand(Wd, Wd.me, 1, { I: 6, dist: 7, coneL: 2.5 });
  const cam = V3(x + 2.6 - 0.4 * ss(8.5, 14.6, t), 1.5, -0.45), tg = V3(x + 0.2, 1.25, 0.25); Wd.me.setFear(0.3);
  render3D('hall', cam, tg, { fov: 44, sy: 0.42, shadowAt: V3(x + 1.5, 0, 0), fill: { I: 0.9, d: 3.5, c: '#9ab4bc', off: V3(-0.3, 0.3, 0.8) } });
}
const DOORX = -1.9;
const handAt = (a) => a.top.clone().addScaledVector(a.B.X, -0.21).addScaledVector(a.F, 0.24).add(V3(0, -0.47, 0));   // about where the lens is
const aimAt = (a, p) => p.clone().sub(handAt(a)).normalize();
function shotDoor() {   // a grey door at the end of the hall that was not there: STAIRS; he walks up and stops, the beam on it
  const Wd = world(), t = TT, sEnd = DOORX + 4.6, s = Math.min(0.85 * (t - 14.6), 0);
  const tw = 0.85 * (t - 14.6), stopT = 14.6 + (sEnd - 0.05) / 0.85;
  if (t < stopT) janWalk(Wd, { O: V3(-4.6, 0, 0.2), D: V3(1, 0, 0), s: tw, pitch: 0.0, look: 0 }, (a) => a.F.clone().add(V3(0, 0.02 + 0.06 * ss(14.6, 16.5, t), 0)));
  else if (t < stopT + 0.45) janWalk(Wd, { O: V3(-4.6, 0, 0.2), D: V3(1, 0, 0), stopAt: sEnd - 0.05, stopK: ss(stopT, stopT + 0.45, t), pitch: -0.05 }, (a) => a.F.clone().add(V3(0, 0.08, 0)));
  else janWalk(Wd, { O: V3(-4.6 + sEnd, 0, 0.2), D: V3(1, 0, 0), plant: [0.03, -0.03], pitch: -0.12 + 0.04 * Math.sin(t * 0.7), look: 0.05 * Math.sin(t * 0.5), breathR: 3.5 }, (a) => aimAt(a, V3(0, 1.3, 0.05)));
  void s; torchFromHand(Wd, Wd.me, 1, { I: 6, dist: 7, coneL: 2.5 });
  const cam = V3(-6.6 + 1.6 * ss(14.6, 20.6, t), 1.62, -0.62), tg = V3(0, 1.45, 0.05);
  render3D('hall', cam, tg, { fov: 46, sy: 0.38, shadowAt: V3(-2, 0, 0), fill: { I: 0.6, d: 4, c: '#8aa4ac', off: V3(0, 0.5, 0.8) } });
}
// walking down flight fl at speed v from time t0 (O on the landing above, 1.5 treads before the first nosing)
function downFlight(fl, t0, v) { const A = fl % 2 === 0, D = V3(A ? 1 : -1, 0, 0), O = V3(A ? SX - 1.5 * ST : SX + SL + 1.5 * ST, 0, A ? LANE_A + 0.05 : LANE_B - 0.05); O.y = landY(fl); return { O, D, gf: gfFl(fl), stairs: true, stride: 2 * ST, s: Math.max(0, v * (TT - t0)) }; }
// walking down flight fl from its top landing; the camera behind him on the wall side, the beam finds the number of the landing below
function descend(fl, t0, v, o = {}) {
  const Wd = world(), t = TT, A = fl % 2 === 0, n = fl + 1, E = n % 2 === 1, num = V3(E ? SX + SL + LD : SX - LD, landY(n) + 1.45, E ? 0.55 : -0.55);
  const d = downFlight(fl, t0, v), sMax = SL + 1.5 * ST + 0.3; if (d.s > sMax) { d.stopAt = sMax; d.stopK = ss(0, 0.4, (d.s - sMax) / v); }
  janWalk(Wd, Object.assign(d, { pitch: 0.3, look: (E ? 1 : -1) * (A ? 0.25 : -0.25) * ss(t0 + 0.6, t0 + 1.4, t) }), (a) => aimAt(a, lerpV(num.clone().add(V3(0, -1.2, 0)), num, ss(t0 + 0.2, t0 + 1.2, t))));
  torchFromHand(Wd, Wd.me, 1, { I: 6, dist: 6, coneL: 2.6 });
  const zL = A ? LANE_A - 0.4 : LANE_B + 0.4, xT = A ? SX - 1.15 : SX + SL + 1.15, sg = A ? 1 : -1, cam = V3(xT + sg * 0.5 * ss(t0, t0 + 2.4, t), landY(fl) + 1.75, zL), tg = num.clone().add(V3(0, -0.55, -0.25 * (E ? 1 : -1)));
  render3D('well', cam, tg, { fov: 50, fill: { I: 0.7, d: 3.5, c: '#8aa0a0' }, bulbAt: num });
}
function shotDown() { setNums(world(), 0); const t = TT; if (t < 23.0) descend(0, 20.6, 0.95); else if (t < 24.8) descend(1, 23.0, 1.2); else descend(2, 24.8, 1.2); }
function shotReach() {   // over his shoulder down the next flight: the light reaches one flight; below, teal-black nothing
  const Wd = world(), t = TT; setNums(Wd, 0);
  const o = downFlight(4, 26.9, 0.4); janWalk(Wd, Object.assign(o, { pitch: 0.35 }), () => V3(1, -0.62, 0.02 * Math.sin(t * 1.3)).normalize());
  const hp = Wd.me.H.position.clone(), cam = hp.clone().add(V3(0.06, 0.02, 0)), tg = lerpV(V3(SX + SL + 0.5, landY(5) - 0.3, LANE_A + 0.1), V3(SX + SL + 1.3, landY(5) + 0.5, LANE_A + 0.2), ss(29.5, 32.4, t)); Wd.me.g.visible = false; Wd.torch.visible = false;   // POV: my eyes, my light
  torchLight(Wd, cam.clone().add(V3(0.05, -0.5, 0.2)), tg.clone().sub(cam.clone().add(V3(0.05, -0.5, 0.2))), 1, { I: 8, dist: 4.2, coneL: 3.4, coneA: 1.3 });
  Wd.bulbs.forEach((b) => (b.live = 0)); render3D('well', cam, tg, { fov: 52, fill: { I: 0.15, d: 2.5 } }); Wd.bulbs.forEach((b) => (b.live = [1, 3, 6, 9, 12, 17].includes(b.n) ? 1 : 0));
}
function shotB12() {   // B12: he stops at the rail and leans over the well, listening; the bulb stutters
  const Wd = world(), t = TT; setNums(Wd, 6);   // landing 6 reads B12
  const lean = ss(33.4, 35.0, t), P = Wd.me, X0 = SX - 0.42, y = landY(6), gf = () => y;
  const a = walkP(P, { O: V3(X0, y, -0.12), D: V3(1, 0, 0), plant: [0.05, -0.05], gf, lean: 0.05 + 0.3 * lean, pitch: 0.2 + 0.5 * lean, look: 0.15 * Math.sin(t * 0.6) * lean, breathR: 3.2 });
  const dir = V3(0.55, -1, 0.05).normalize(), h = aimHand(P, a.B, a.top, a.F, dir, { fwd: 0.42, dy: -0.26, side: 0.12 }), lw = V3(SX - 0.04, y + 0.93, -0.3);
  walkP(P, { O: V3(X0, y, -0.12), D: V3(1, 0, 0), plant: [0.05, -0.05], gf, lean: 0.05 + 0.3 * lean, pitch: 0.2 + 0.5 * lean, look: 0.15 * Math.sin(t * 0.6) * lean, breathR: 3.2, hands: [lerpV(a.P.arm[0].W, lw.clone().add(V3(-0.05, 0.02, 0)), lean), h.W], hdir: [{ Z: V3(1, -0.3, 0), Y: V3(0, 1, 0) }, h.hf], grip: [false, true] });
  torchFromHand(Wd, P, 1, { I: 7, dist: 4.5, coneL: 3 });
  const cam = V3(SX + SL * 0.6, y + 1.5, 0.0), tg = V3(SX - 0.5, y + 1.15, -0.2);
  render3D('well', cam, tg, { fov: 46, sy: 0.42, bulbAt: V3(SX - 1, y + 2, 0), fill: { I: 0.7, d: 3.5, c: '#8aa8a8', off: V3(-0.9, 0.5, -0.3) } });
}
const lerpV = (a, b, k) => a.clone().lerp(b, k);
function shotB30() {   // deeper: down the flight to B30; he stops; the crying stops; the flashlight stutters; black
  const Wd = world(), t = TT; setNums(Wd, 21);   // landing 9 reads B30
  const o = downFlight(8, 38.6, 0.6), sMax = SL + 1.5 * ST + 0.42; if (o.s > sMax) { o.stopAt = sMax; o.stopK = ss(0, 0.45, (o.s - sMax) / 0.6); }
  const stopped = o.s > sMax, k = torchK(t);
  janWalk(Wd, Object.assign(o, { pitch: stopped ? 0.15 : 0.3, look: stopped ? 0.55 * ss(42.6, 43.4, t) : 0 }), () => V3(1, stopped ? -0.15 : -0.32, stopped ? 0.3 + 0.35 * ss(42.6, 43.4, t) : 0.2).normalize());
  torchFromHand(Wd, Wd.me, k, { I: 7, dist: 6, coneL: 2.6 });
  const cam = V3(SX - 1.2 + 0.6 * ss(38.6, 42.4, t), landY(8) + 1.75 - 0.3 * ss(39, 42.4, t), LANE_A - 0.4), tg = V3(SX + SL + 1.3, landY(9) + 0.7, 0.25);
  render3D('well', cam, tg, { fov: 50, fill: { I: 0.7 * k, d: 3.5, c: '#8aa0a0' }, bulbAt: V3(SX + SL, landY(9), 0), bulbOn: t > 43.5 ? k * 0.6 : 1, vis: 1 - ss(44.9, 45.0, t) });
}
function shotHit() {   // THE HIT: my light finds the face on the landing below, looking up at me; still; a slow stop-motion tilt
  const Wd = world(), t = TT, tq = stutT(t), k = torchK(t); setNums(Wd, 21);
  const cam = V3(SX + SL - 0.1, landY(9) + 1.6, 0.1), base = V3(SX - 0.3, landY(10), 0.02);
  const J = jerk(tq, 4, 0.12), T = poseThing(Wd, { base, F: V3(1, 0, 0), look: cam, lean: 1, roll: -0.08 - 0.42 * ss(46.2, 51.4, tq) + J.roll, t: tq, glint: 1, hands: [base.clone().add(V3(0.3, 0.92, 0.22)), base.clone().add(V3(0.3, 0.92, -0.24))], curl: 0.55 + 0.2 * ss(47, 50, tq) });
  const fp = T.head.position.clone(), lp = cam.clone().add(V3(0.12, 0.3, 0.3));
  torchLight(Wd, lp, fp.clone().sub(lp), k, { I: 2.3, ang: 0.16, dist: 6, coneL: 2.6, coneA: 1.2, bounce: false });
  Wd.bulbs.forEach((b) => (b.live = 0));
  render3D('well', cam, fp, { fov: lerp(17, 13.5, ss(45.6, 51.6, t)), sy: 0.36, rim: 0.45, rimDir: V3(-0.3, -0.5, 0.6), rimC: '#5a8a8c', fill: { I: 0.12, d: 4, c: '#6a9090', off: V3(0, -1, 0) }, vis: 1 - ss(51.3, 51.6, t) });
  Wd.bulbs.forEach((b) => (b.live = [1, 3, 6, 9, 12, 17].includes(b.n) ? 1 : 0));
}
// running up: four cuts, each a flight taken two steps at a time; the numbers on the walls fall as he climbs
const RUNS = [[51.6, 86], [53.35, 59], [55.1, 33], [56.85, 8]];
function shotRun() {
  const Wd = world(), t = TT; let i = RUNS.length - 1; while (i > 0 && t < RUNS[i][0]) i--; const [t0, base] = RUNS[i]; setNums(Wd, base);
  const odd = i % 2 === 0, fl = odd ? 1 : 2, bot = fl + 1, D = V3(odd ? 1 : -1, 0, 0), z = odd ? LANE_B - 0.05 : LANE_A + 0.05;
  const O = V3(odd ? SX - 1.5 * ST : SX + SL + 1.5 * ST, landY(bot), z), s = 1.55 * (t - t0);
  janWalk(Wd, { O, D, gf: gfFl(fl), stairs: true, run: true, stride: 4 * ST, s, pitch: -0.12, look: 0.35 * Math.sin(t * 2.3) * (odd ? 1 : -1) }, (a) => a.F.clone().add(V3(0, 0.25 + 0.15 * Math.sin(t * 7.1 + 1), 0.4 * Math.sin(t * 4.3))).normalize());
  Wd.me.setFear(1); torchFromHand(Wd, Wd.me, 1, { I: 6, dist: 6, coneL: 2.6, bI: 1.6 });
  const xTop = odd ? SX + SL + 0.45 : SX - 0.45, cam = V3(xTop, landY(fl) + 1.45, odd ? 0.15 : -0.15), hp = Wd.me.H.position.clone();
  Wd.fill.color.set('#9ab0b0'); render3D('well', cam, hp.clone().add(V3(0, -0.3, 0)), { fov: 50, sy: 0.36, bulbAt: hp, fill: { I: 1.1, d: 3.2, c: '#a8b8b0', off: V3(odd ? -0.6 : 0.6, 0.3, 0) } });
}
function shotDawn() {   // the next night is past: cold dawn in the corridor, no door at the end; he mops toward us
  const Wd = world(), t = TT, k = ss(58.6, 71, t); Wd.door.visible = false; Wd.dayBoard.visible = true;
  const P = Wd.me, ph = t * 1.35, sw = Math.sin(ph), O = V3(-2.3 - 0.06 * k * 6, 0, 0.3), F0 = V3(-1, 0, 0.12).normalize(), F = F0.clone().applyAxisAngle(UPV, 0.22 * sw), X = UPV.clone().cross(F0);
  const head = O.clone().addScaledVector(F0, 0.62).addScaledVector(X, 0.36 * sw).setY(0.03);
  const st = { O, D: F, fixD: F0, plant: [0.14 + 0.03 * sw, -0.1 + 0.03 * sw], pitch: 0.42, look: -0.15 * sw, lean: 0.16 + 0.04 * Math.abs(Math.cos(ph)), roll: 0.04 * sw, breathR: 2 };
  const a = walkP(P, st), topP = a.top.clone().addScaledVector(F, 0.2).addScaledVector(X, 0.05 * sw).add(V3(0, -0.14, 0));
  const dir = topP.clone().sub(head).normalize(); Wd.mop.visible = true; Wd.mop.position.copy(head); Wd.mop.quaternion.setFromUnitVectors(UPV, dir); Wd.mop.rotateY(0.5 * sw);
  const gU = head.clone().addScaledVector(dir, 1.33), gL = head.clone().addScaledVector(dir, 1.12), hfL = barHand(dir.clone().negate(), F), hfR = barHand(dir, F);
  walkP(P, Object.assign(st, { hands: [wristFor(P, gU, hfL), wristFor(P, gL, hfR)], hdir: [hfL, hfR], grip: [true, true] })); P.setFear(0.35);
  const hp0 = P.T.position, cam = V3(hp0.x - 3.3 + 0.4 * k, 1.6, -0.4), tg = V3(hp0.x + 0.1, 0.95, hp0.z);
  render3D('dawn', cam, tg, { fov: 46, sy: 0.4, moonDir: V3(0.3, 0.42, 1), shadowAt: V3(-2.5, 0, 0), fill: { I: 0.6, d: 4, c: '#c8d4d8', off: V3(0.4, 0.3, 0.6) }, vis: ss(58.6, 59.2, t) * (1 - ss(70, 71, t)) });
}

const PARA = [
  ['If you find a stairwell that wasn\'t there yesterday, don\'t go down. I went down.', -1.2, 8.2],
  ['I was the night janitor at a school in Sendai. Three floors. No basement.', 9.0, 14.35],
  ['At 2 a.m. there was a new door at the end of the hall. Grey, with a sign that said STAIRS.', 15.1, 20.35],
  ['The stairs only went down. Every landing had a number. B1. B2. B3.', 21.1, 26.35],
  ['My flashlight only reached one flight ahead. Below that, nothing.', 27.1, 32.35],
  ['At B12 I heard a child crying for help, somewhere below me.', 33.1, 38.35],
  ['I kept going down. The crying never got closer. At B30, it stopped.', 39.1, 44.7],
  ['Then my light found a face on the landing below. It was looking up at me.', 46.0, 51.35],
  ['I ran. I counted ninety flights before I saw the hallway again.', 52.1, 58.35],
  ['The next night the door was gone. But when I mop the third floor, I hear crying under the tiles.', 59.2, 70.6],
];
function sceneTale() {
  const t = TT; fillAll('#020306'); resetWorld(world());
  if (window.DBG_SHOT) window.DBG_SHOT(); else   // debug views only (never set in the piece)
  if (t < 4.5) shotHook(); else if (t < 8.5) shotCard(); else if (t < 14.6) shotHall(); else if (t < 20.6) shotDoor(); else if (t < 26.6) shotDown();
  else if (t < 32.6) shotReach(); else if (t < 38.6) shotB12(); else if (t < 45.6) { if (t < 45.0) shotB30(); } else if (t < 51.6) shotHit(); else if (t < 58.6) shotRun(); else shotDawn();
  PARA.forEach(([s, a, b]) => ykPara(s, a, b, { cy: 1300 }));
  if (t >= 66.2) { const f = () => ykBadge(asset('kodama.jpg'), 'kodamashorts', CX, 290, ss(66.2, 66.9, t) * (1 - ss(70.4, 71, t))); if (DEFER) DEFER.push(f); else f(); }
}
