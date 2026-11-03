// =====================================================================
//  SCENES — one SHOT_FN per shot of head.html's SHOTS, timed to the voice (VL / LT0 / LT1 / VW).
//  Each poses its set from TT and draws it with renderSoft (matte 3D, AO, DOF). Speakers move their mouths
//  on their own words (mouthOf / mouthWho).
// =====================================================================
const _hd = new THREE.Vector3(), _hu = new THREE.Vector3();
function aimHand(H, w, dir, up) { _hd.copy(dir).normalize(); _hu.copy(up).addScaledVector(_hd, -up.dot(_hd)).normalize(); const x = new THREE.Vector3().crossVectors(_hd, _hu); H.root.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, _hd, _hu)); H.root.position.copy(w); }
// move a posed POV hand so its index fingertip (or the hand centre) sits exactly at a camera-space point
function tipTo(H, cam, target, which = 'index') { H.root.updateMatrixWorld(true); const g = which === 'index' ? H.fingers[0].tipG : H.palm; const w = g.getWorldPosition(new THREE.Vector3()); const l = cam.worldToLocal(w.clone()); H.root.position.add(target.clone().sub(l)); }
// a character's hand stops at a plane (e.g. a door at z = zc): shift the whole body back if the hand would pass it
function stopAt(P, side, axis, limit) { P.root.updateMatrixWorld(true); const h = P.arms[side > 0 ? 1 : 0].hand.getWorldPosition(new THREE.Vector3()), tip = h[axis] + 0.09; if (tip > limit) P.root.position[axis] -= tip - limit; }
let BLOB = null;
function blob(P) { if (P.blob) return; BLOB = BLOB || g3Radial([[0, 'rgba(0,0,0,0.55)'], [0.55, 'rgba(0,0,0,0.25)'], [1, 'rgba(0,0,0,0)']], 64); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.65).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: BLOB, transparent: true, depthWrite: false, toneMapped: false }));
  m.position.y = 0.006; m.renderOrder = 1; m.userData.noInk = true; P.root.add(m); P.blob = m; }
const hideAll = (list) => list.forEach((P) => (P.root.visible = false));
const show = (P, q) => { P.root.visible = true; blob(P); posePerson(P, q); };
const W3 = (x, y, z) => [x, FY + y, z];                         // office-floor coords → world (tower stage)
const shake = (st, amt, t) => { st.cam.rotation.x += amt * 0.012 * Math.sin(t * 61); st.cam.rotation.y += amt * 0.012 * Math.sin(t * 47 + 1); st.cam.rotation.z += amt * 0.01 * Math.sin(t * 53 + 2); };
// the first plane: from the NNE down Manhattan into the North Tower's north face at T_HIT (5.6 s)
const SPD1 = 120, HIT1 = new THREE.Vector3(NT.x + NT.w / 2 - 4, 352, NT.z - NT.w / 2), DIR1 = new THREE.Vector3(0.78, 0.04, -0.62).normalize();
const planeAt = (t) => HIT1.clone().addScaledVector(DIR1, Math.max(0, T_HIT - t) * SPD1);
// the second plane: from the SSW over the harbour, banked, into the South Tower's south face below us (just after the cut)
const T_HIT2 = T_CUT + 0.15, HIT2 = new THREE.Vector3(-12, 300, 32.5), DIR2 = new THREE.Vector3(-0.3, 0.05, 0.95).normalize();
const plane2At = (t) => { const u = Math.max(0, T_HIT2 - t); return HIT2.clone().addScaledVector(DIR2, u <= 2 ? 200 * u : 400 + 60 * (u - 2)); };
function flyPlane(m, p, dir, roll) { m.position.copy(p); m.lookAt(p.clone().add(dir)); m.rotateZ(roll); }   // the model's nose is local -z: lookAt along the way it came, so it faces us
// tower-stage setup per shot: which props / hands / planes / people are in
function towerSet(S, o, t) { S.cup.visible = !!o.cup; S.HR.root.visible = !!o.hr; S.HL.root.visible = !!o.hl; S.phone.visible = !!o.hl; S.plane.visible = !!o.plane; S.plane2.visible = !!o.plane2;
  S.shards.visible = !!o.shards; hideAll([S.D, S.boss, S.comp, ...S.ex]); S.glass.material.color.set('#cfe2f2'); S.glass.material.opacity = 0.08; poseFx(S, t); }

// ---- 1 · the window, the mug, the plane far too low
function windowCam(S, t) { const st = S.st, look = ss(2.4, 4.0, t); camPt(st, [0.55, FY + 1.6, -30.3], mixv([24, FY - 13, -121], [30, FY - 4, -121], look * 0.4), 72, t, 0.4, 2); }
function mugHand(S, t, drop = 0) { const cam = S.st.cam, sw = 0.005 * Math.sin(t * 1.3), c = new THREE.Vector3(0.05 + sw, -0.25 + 0.003 * Math.sin(t * 0.9), -0.5);
  const fall = Math.max(0, t - 5.75); S.cup.position.copy(c).add(new THREE.Vector3(0.02 * fall, -4.9 * fall * fall, 0)); S.cup.rotation.set(0.04 + 3 * fall, -0.55, 2 * fall); S.cup.visible = S.cup.position.y > -0.8;
  const away = ss(5.8, 6.3, t), open = ss(5.72, 5.85, t), fl = 0.04 * Math.sin(t * 2.1);
  aimHand(S.HR, new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.12, -0.04, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.3), new THREE.Vector3(1, 0.18, 0.15).applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.3));
  poseHand(S.HR, { curl: open > 0 ? [0.2, 0.25, 0.35, 0.4] : [0.08 + fl, 0.1 + fl, 0.95, 1.0], spread: 0.0, thumb: open > 0 ? 0.1 : 0.32, tremble: open > 0 ? 0.5 : 0.08 });
  // the index finger's root sits just behind the hole of the handle, so index and middle pass through it
  S.cup.updateMatrixWorld(true); const hc = S.cup.localToWorld(new THREE.Vector3(0.058, 0.011, 0.034)); cam.updateMatrixWorld(true); const target = cam.worldToLocal(hc);
  S.HR.root.updateMatrixWorld(true); const ib = cam.worldToLocal(S.HR.fingers[0].base.getWorldPosition(new THREE.Vector3())); S.HR.root.position.add(target.sub(ib)).add(new THREE.Vector3(0.12 * open, -0.5 * away, 0)); }
SHOT_FN.window = (tl, dur, t) => { const S = stTower(), st = S.st; towerSet(S, { cup: 1, hr: 1, plane: 1 }, t);
  windowCam(S, t); if (t > 4.4) { const lf = ss(4.4, 5.3, t); camPt(st, mixv([0.55, FY + 1.6, -30.3], [1.0, FY + 1.6, -30.85], lf), mixv(mixv([24, FY - 13, -121], [30, FY - 4, -121], 0.4), [4, FY + 17, -80], lf), 72, t, 0.4, 2); } mugHand(S, t); flyPlane(S.plane, planeAt(t), DIR1, -0.12);
  renderSoft(st, { blur: 0, ao: 0.2, aoR: 0.08 }); };
// ---- 2 · the hit: the fireball thrown out of the south face, its glare on our glass; the mug falls and smashes
SHOT_FN.impact = (tl, dur, t) => { const S = stTower(), st = S.st; towerSet(S, { cup: 1, hr: 1, plane: t < T_HIT, shards: t > 6.0 }, t);
  const down = ss(6.05, 6.35, t) * (1 - ss(7.2, 7.8, t)), up = ss(7.2, 7.9, t);
  const lift = ss(4.4, 5.3, t) * (1 - ss(6.05, 6.3, t)), lean = ss(4.4, 5.3, t) * (1 - ss(6.0, 6.35, t)), fy = t < 6.42 ? Math.max(0.05, 0.95 - 4.9 * Math.max(0, t - 6.0) ** 2) : 0.05; const q = mixv(mixv(mixv([24, FY - 13, -121], [4, FY + 17, -80], lift), [0.62, FY + fy * 0.5, -30.82], down), [-12, FY + 30, -110], up * 0.9);
  camPt(st, mixv([0.55, FY + 1.6 - 0.1 * down, -30.3 + 0.05 * down], [1.0, FY + 1.6, -30.85], lean), q, 72, t, 0.5, 2); shake(st, 1.4 * Math.exp(-(t - T_HIT) * 2.2) * (t > T_HIT ? 1 : 0) + 0.15, t);
  mugHand(S, t, 1); if (t < T_HIT) flyPlane(S.plane, planeAt(t), DIR1, -0.12);
  // the shards spread out from where it landed, the coffee pools
  // the mug falls (a world copy, after the hand lets go), hits the carpet and bursts: shards bounce out, coffee splashes and spreads
  const L = 6.42, af = t - L; S.fmug.visible = t > 6.0 && af < 0; if (S.fmug.visible) { S.fmug.position.set(0, fy, 0); S.fmug.rotation.set(2.4 * (t - 6.0), 1.9, 1.6 * (t - 6.0)); }
  S.shardL.forEach((s) => { s.m.visible = af > 0; if (af <= 0) return; const tt = Math.min(af, s.up / 4.9), r = s.r * EZ.o3(clamp(af / 0.45)); s.m.position.set(Math.cos(s.a) * r, Math.max(0.006, s.up * tt - 4.9 * tt * tt) * (af < s.up / 4.9 ? 1 : 0) + 0.006, Math.sin(s.a) * r); s.m.rotation.set(s.sp * Math.min(af, 0.5), s.a, Math.PI / 2 + s.sp * 0.1 * Math.min(af, 0.5)); });
  S.drops.forEach((d) => { d.m.visible = af > 0; if (af <= 0) return; const tt = Math.min(af, 2 * d.up / 9.8), y = d.up * tt - 4.9 * tt * tt, r = d.v * tt; d.m.position.set(Math.cos(d.a) * r, Math.max(0.003, y), Math.sin(d.a) * r); d.m.scale.set(1, af > 2 * d.up / 9.8 ? 0.25 : 1, 1); });
  S.pool.visible = af > 0; S.pool.scale.setScalar(0.15 + 0.85 * EZ.o3(clamp(af / 1.4)));
  const fl = t > T_HIT ? ss(T_HIT, T_HIT + 0.05, t) * Math.exp(-(t - T_HIT) * 2.2) : 0; S.glass.material.color.set('#ff9a3a'); S.glass.material.opacity = 0.08 + 0.1 * fl;
  renderSoft(st, { blur: 0, ao: 0.45, aoR: 0.12 });
  if (fl > 0) { ctx.save(); screen(); const g = ctx.createRadialGradient(W * 0.28, H * 0.2, 0, W * 0.28, H * 0.2, H * 0.75); g.addColorStop(0, `rgba(255,150,60,${0.35 * fl})`); g.addColorStop(0.45, `rgba(255,110,40,${0.12 * fl})`); g.addColorStop(1, 'rgba(255,100,30,0)'); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); bloom(0.4 * fl); } };
// ---- 3 · the window aisle: Diego, hands on his head; people react behind him
SHOT_FN.react = (tl, dur, t) => { const S = stTower(), st = S.st; towerSet(S, {}, t); const e = S.ex;
  const sh_ = 0.06 * Math.sin(t * 13), fearO = (o) => Math.max(0.45 + 0.1 * Math.sin(t * 9), o);   // trembling; mouths stay open in fear
  show(S.D, { x: 3.7, z: -29.0, yaw: Math.PI / 2 + 0.35, crouch: 0.35, lean: 0.12, headPitch: 0.05, headYaw: -0.3 + 0.25 * ss(9.2, 9.8, t), look: [-0.4, 0.25], cryShake: 0.6, emo: { fear: 1, surprise: 1, open: fearO(mouthOf('l04', t) * 1.5 + 0.2), tremble: 1 },
    armL: [2.05 + sh_, 1.25, 2.45], armR: [2.05 - sh_, 1.25, 2.45] });   // hands clutching the head, elbows out
  show(e[0], { x: 1.4, z: -30.3, yaw: Math.PI - 0.3, lean: 0.25, crouch: 0.3, armL: [1.9, 0.3, 2.5], armR: [1.9, 0.35, 2.5], emo: { fear: 1, open: fearO(0), tremble: 1 } });    // hands over the mouth
  show(e[1], { x: 0.6 - 4.2 * tl, z: -29.6, yaw: -Math.PI / 2, run: 1, ph: t * 10, emo: { fear: 1, open: 0.6 } });
  show(e[2], Object.assign({ x: -1.6, z: -29.4, yaw: Math.PI * 0.85, emo: { fear: 0.9, open: fearO(0.5) }, lean: 0.1 }, POSE.phone()));
  show(e[3], { x: -3.4, z: -30.2, yaw: Math.PI + 0.2, armR: [1.95, 0.1, 0.1], armL: [2.6, 0.7, 2.4], emo: { fear: 1, surprise: 0.6, open: fearO(0.7) } });   // pointing, a hand on the head
  show(e[5], { x: -2.2 - 3.6 * tl, z: -28.9, yaw: -Math.PI / 2 + 0.3, run: 1, ph: t * 10 + 2, emo: { fear: 1, open: 0.6 } });
  show(e[4], { x: -5.2, z: -29.7, yaw: Math.PI / 2 + 0.6, kneel: 1, armL: [2.4, 0.9, 2.2], armR: [2.4, 0.9, 2.2], headPitch: 0.3, cryShake: 1, emo: { fear: 1, cry: 0.8, open: 0.5 } });   // on her knees
  const pan = ss(9.4, 10.6, t); camPt(st, W3(6.0, 1.6, -29.1), mixv(W3(-4, 1.45, -30.0), W3(-6, 1.3, -31.4), pan), 62, t, 0.8, 5);
  renderSoft(st, { focus: 2.2, range: 5, blur: 4, ao: 0.5, aoR: 0.3 }); };
// ---- 4 · Diego pulls you along; the boss shouts down the aisle; people run; papers outside
SHOT_FN.boss = (tl, dur, t) => { const S = stTower(), st = S.st; towerSet(S, {}, t); const e = S.ex;
  show(S.D, { x: -0.9, z: -30.65, yaw: -Math.PI / 2 - 1.2, headYaw: -0.3, armR: [1.1 + 0.3 * Math.sin(t * 7), 0.4, 0.6], emo: { fear: 0.6, open: mouthOf('l05', t) } });
  const yell = mouthOf('l06', t); show(S.boss, { x: 6.5, z: -29.7, yaw: -Math.PI / 2, armR: [1.55, 0.15 + 0.5 * (0.5 + 0.5 * Math.sin(t * 7)), 0.25], armL: [1.4, 0.2, 0.3], emo: { fear: 0.8, surprise: 0.6, open: Math.max(0.45, yell) }, lean: 0.25, crouch: 0.15 });   // both arms sweeping toward the exit
  [6, 7, 8, 9].forEach((k, i) => (t - 11.0 - i * 0.5 < 0) ? 0 : show(e[k], { x: 0.2 + 3.2 * (t - 11.0 - i * 0.5), z: -28.75 - 0.25 * (i % 2), yaw: Math.PI / 2, run: 1, ph: t * 10 + i, emo: { fear: 1, open: 0.55 } }));
  const look = ss(12.3, 13.1, t); camPt(st, W3(-3.2, 1.62, -28.9), mixv(W3(-0.6, 1.5, -28.4), W3(8, 1.5, -31.0), look), 62, t, 0.9, 6);
  renderSoft(st, { focus: lerp(2.3, 9.8, look), range: 7, blur: 3, ao: 0.5, aoR: 0.3 }); };
// ---- 5 · walking to the core with the phone: "¿Amor?…"
SHOT_FN.call = (tl, dur, t) => { const S = stTower(), st = S.st; towerSet(S, { hl: 1 }, t); const e = S.ex;
  if (S.phone.parent !== S.HL.palm) { S.HL.palm.add(S.phone); S.phone.position.set(0.05, 0.05, -0.027); S.phone.rotation.set(0, Math.PI, Math.PI / 2); }
  S.setLcd(Math.max(0, Math.floor(t - LT0('l07') + 0.6)));
  const z = -26 + 1.5 * tl; [0, 2, 3, 7, 10].forEach((k, i) => show(e[k], { x: 7.4 + (i % 2) * 1.2 - 0.6, z: z + 2.2 + i * 1.5 + 0.9 * tl, yaw: 0, walk: 1, run: i % 2 ? 0.6 : 0, ph: t * 8 + i }));
  show(S.D, { x: 9.1, z: z + 1.3 + 1.5 * 0, yaw: -0.2, walk: 1, ph: t * 8.5, headYaw: -0.4, emo: { fear: 0.5 } });
  camPt(st, W3(8.0, 1.6 + 0.02 * Math.sin(t * 8.5), z), W3(8.2, 1.3, z + 8), 66, t, 1.0, 7);
  aimHand(S.HL, new THREE.Vector3(-0.1 + 0.006 * Math.sin(t * 8.5), -0.23 + 0.008 * Math.sin(t * 17), -0.4), new THREE.Vector3(1, 0.35, -0.15), new THREE.Vector3(0.05, -0.25, -1)); poseHand(S.HL, { curl: [0.93, 0.95, 0.95, 0.93], spread: 0.0, thumb: 0.5 });
  renderSoft(st, { focus: 0.45, range: 1.2, blur: 4, ao: 0.15, aoR: 0.1 }); };

// ---- 6 · the elevator lobby: press down, "vamos, vamos, vamos"
const pressAt = () => [LT0('l08') + 0.35, VW('l09', 0), VW('l09', 1), VW('l09', 2)];
function coreCommon(S, t) { S.wait.forEach((w, i) => show(w.P, Object.assign({ x: w.x, z: w.z, yaw: Math.PI * (i % 2 ? 0.5 : -0.4) + w.ph * 0.2, ph: w.ph, emo: { fear: 0.4 } }, i % 3 === 1 ? POSE.phone() : POSE.idle(w.ph))));
  S.carPpl.forEach((c) => (c.P.root.visible = false)); hideAll(S.upPpl); S.HR.root.visible = false; S.st.setSun(dirV(30 * DEG, 70 * DEG), new THREE.Vector3(0, 0, 0)); }
SHOT_FN.elev = (tl, dur, t) => { const S = stCore(), st = S.st; coreCommon(S, t); S.HR.root.visible = true;
  show(S.D, { x: -3.75, z: -0.85, yaw: 1.1, headYaw: t > LT1('l08') ? 0.3 : -0.3, headPitch: t > LT1('l08') ? -0.35 : 0, look: [0, 0.2], emo: { fear: 0.6, open: mouthOf('l08', t) } });
  camPt(st, [-2.45, 1.6, -0.75], [-3.15, 1.12, -1.6], 66, t, 0.5, 8); st.cam.updateMatrixWorld(true);
  const b = S.btnDown.getWorldPosition(new THREE.Vector3()), bl = st.cam.worldToLocal(b.clone()); let push = 0; pressAt().forEach((p) => { push = Math.max(push, Math.exp(-(((t - p) / 0.12) ** 2))); });
  const reach = ss(SH0('elev') + 0.1, LT0('l08') + 0.2, t), tip = bl.clone().add(new THREE.Vector3(0, 0, 0.05 * (1 - push) + 0.02));
  const wrist = tip.clone().add(new THREE.Vector3(0.05, -0.07, 0.17)).add(new THREE.Vector3(0.15, -0.2, 0.2).multiplyScalar(1 - reach));
  aimHand(S.HR, wrist, tip.clone().sub(wrist), new THREE.Vector3(0.25, 0.8, 0.5)); poseHand(S.HR, { curl: [0.0, 0.9, 0.95, 1.0], spread: 0.1, thumb: 0.8 });
  const face = S.btnDown.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0, 0.012 + 0.07 * (1 - push) + 0.25 * (1 - reach))); tipTo(S.HR, st.cam, st.cam.worldToLocal(face));
  S.btnDown.material.emissiveIntensity = t > pressAt()[0] ? 1.2 : 0;
  renderSoft(st, { focus: 0.8, range: 3, blur: 0, ao: 0, aoR: 0.2 }); };
// ---- 7 · the doors open on a packed car — "¡Está lleno! ¡Por la escalera!" — the SALIDA door
SHOT_FN.full = (tl, dur, t) => { const S = stCore(), st = S.st; coreCommon(S, t); S.wait.forEach((w) => { if (w.x < 0.6 && Math.abs(w.z - 0.4) < 1.0) w.P.root.visible = false; }); const d = S.doors['1:-1.5'], k = EZ.io(seg(t, SH0('full') + 0.05, SH0('full') + 0.6));
  d.hv.forEach((h, i) => (h.position.x = d.dx + (i ? 1 : -1) * (0.275 + 0.5 * k)));
  S.carPpl.forEach((c, i) => show(c.P, { x: c.x, z: c.z, yaw: Math.PI, ph: c.ph, headPitch: 0.05, emo: { fear: 0.5 }, armL: [0.1, 0.05, 0.3], armR: [0.1, 0.05, 0.3] }));
  const run = ss(LT1('l10') - 0.6, LT1('l10') + 0.2, t);
  show(S.D, Object.assign({ x: -1.0 - 3.5 * Math.max(0, t - LT1('l10') + 0.6), z: 0.45, yaw: lerp(3.05, 1.5 * Math.PI, run), headYaw: 0, headPitch: 0.03, run, ph: t * 10, emo: { fear: 0.7, open: mouthOf('l10', t) } }, run < 0.5 ? { armL: [1.4, 0.6, 0.1] } : {}));
  const pan = ss(LT1('l10') - 0.3, LT1('l10') + 0.3, t); camPt(st, [-0.9, 1.62, -0.9], mixv([-1.5, 1.3, 2.6], [-8, 1.5, 0], pan), 64, t, 0.9, 9);
  renderSoft(st, { focus: lerp(2.8, 6, pan), range: 6, blur: 3, ao: 0.5, aoR: 0.25 }); };

// ---- 8 · Stair A, over Diego's shoulder: the PISO counter falls 89 → 79
SHOT_FN.stairs = (tl, dur, t) => { const S = stStair(), st = S.st, uD = 0.5 + 0.55 * tl;
  const d = stairPath(uD); blob(S.D); posePerson(S.D, { x: d.x, y: d.y - 0.05, z: d.z, yaw: d.yaw, walk: 1, ph: uD / TREAD * Math.PI, lean: 0.12, headPitch: 0.15, emo: { fear: 0.4 } }); S.D.root.visible = true;
  S.ppl.forEach(({ P, k, ph, side }) => { const e = stairPath(uD + 1.5 + k * 1.35); P.root.visible = true; posePerson(P, { x: e.x + side * 0.12, y: e.y - 0.05, z: e.z, yaw: e.yaw, walk: 1, ph: (uD + 1.5 + k * 1.35) / TREAD * Math.PI + ph, lean: 0.1, emo: { fear: 0.3 } }); });
  camPt(st, [d.x - 0.12, d.y + 2.75, d.z + 1.95], [d.x + 0.05, d.y - 0.1, d.z - 3.2], 66, t, 0.9, 3);
  st.key.position.set(3, 8, 6); st.key.target.position.set(0, d.y - 2, -1.5); st.key.target.updateMatrixWorld();
  renderSoft(st, { focus: 2.0, range: 6, blur: 3, ao: 0.6, aoR: 0.3, exposure: 1.05 }); };
// ---- 9 · the 78 landing: SKY LOBBY, Diego pushes the door — "lo logramos"
SHOT_FN.arrive = (tl, dur, t) => { const S = stStair(), st = S.st, y = -7 * SH, X0 = -(FW + GAP / 2), X1 = GAP / 2;
  S.ppl.forEach(({ P }) => (P.root.visible = false)); S.D.root.visible = true;
  // Diego reaches the door, pushes the bar, the door swings into the lit lobby and he steps through
  const k = ss(SH0('arrive'), SH0('arrive') + 1.4, t), tp = SH0('arrive') + 1.5, open = EZ.io(seg(t, tp + 0.15, tp + 1.0)), thru = ss(tp + 0.7, tp + 2.2, t);
  S.door78.rotation.y = -1.45 * open; S.door78L.intensity = 1.6 * open;
  posePerson(S.D, { x: lerp(lerp(X1 + 0.7, X0 + 0.68, k), X0 + 0.62, thru), y, z: lerp(0.2, 1.0, k) + 1.4 * thru, yaw: lerp(-0.9, 0.0, k), walk: Math.max(1 - ss(0.8, 1, k), thru > 0 && thru < 1 ? 1 : 0), ph: t * 7, armR: k > 0.8 && thru < 0.4 ? [1.35, 0.12, 0.3] : undefined, headYaw: -0.2, emo: { fear: 0.25 } });
  if (open < 0.05) stopAt(S.D, 1, 'z', 1.37); camPt(st, [X1 + 0.75, y + 0.35 + 1.62, -1.15], [X0 + 0.5, y + 1.4, 1.5], 66, t, 0.8, 10);
  st.key.position.set(2, y + 10, 5); st.key.target.position.set(0, y, 0); st.key.target.updateMatrixWorld();
  renderSoft(st, { focus: 2.4, range: 5, blur: 2.5, ao: 0.6, aoR: 0.3, exposure: 1.05 }); };
// ---- 10 · the time jump: the landing goes dark while the clock races
SHOT_FN.jump = (tl, dur, t) => { SHOT_FN.arrive(SH1('arrive') - SH0('arrive') - 0.05, 0, SH1('arrive') - 0.05); pvTint('#06070a', 0.86); };

// ---- 11 · sky lobby 78, behind the crowd at eye height: the PA
function lobbyCrowd(S, t) { S.ppl.forEach(({ P, q }) => { const k = q.kind, b = POSE[k === 'look' ? 'idle' : k] ? POSE[k === 'look' ? 'idle' : k](q.ph) : {}; P.root.visible = true; blob(P);
  const pa = t > LT0('l13') && t < LT1('l13') + 2 ? 1 : 0; const walker = !q.fg && Math.floor(q.ph * 7) % 6 === 0, wx = walker ? 0.7 * Math.sin(q.ph) * (t - 35) : 0; posePerson(P, Object.assign({ x: q.x + 0.08 * Math.sin(t * 0.35 + q.ph) + wx, z: q.z + 0.05 * Math.sin(t * 0.27 + q.ph * 2), yaw: walker ? (Math.sin(q.ph) > 0 ? Math.PI / 2 : -Math.PI / 2) : q.yaw + 0.12 * Math.sin(t * 0.2 + q.ph), walk: walker ? 1 : 0, sway: 0.03 * Math.sin(t * 0.9 + q.ph), headYaw: 0.5 * Math.sin(t * 0.45 + q.ph * 3), ph: walker ? t * 6 + q.ph : q.ph, headPitch: k === 'look' || (pa && q.fg) ? -0.35 : 0.05 * Math.sin(t * 0.7 + q.ph), emo: { fear: 0.15 } }, b)); }); }
function lobbySpk(S) { if (S.spk) return; S.spk = true; [[0.5, -3], [6, -6], [-6, -1]].forEach(([x, z]) => { const g = new THREE.Mesh(new THREE.CircleGeometry(0.42, 28).rotateX(Math.PI / 2), TOON({ color: '#5a5a58' })); g.position.set(x, 6.39, z); S.st.scene.add(g); const r = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.03, 6, 28).rotateX(Math.PI / 2), TOON({ color: '#d8d4cc' })); r.position.set(x, 6.38, z); S.st.scene.add(r); }); }
SHOT_FN.lobby = (tl, dur, t) => { const S = stLobby(), st = S.st; if (S.pov) S.pov.visible = false; lobbySpk(S); lobbyCrowd(S, t);
  show(S.D, { x: 1.25, z: 4.3, yaw: Math.PI - 0.25, headPitch: -0.3, emo: { fear: 0.2 } });
  const up = ss(LT0('l13') + 0.3, LT0('l13') + 1.4, t) * (1 - ss(LT1('l13') - 0.6, LT1('l13') + 0.3, t));
  camPt(st, [0.2, 1.62, 5.9], mixv([1.6, 1.9, -14], [0.6, 6.8, -3.4], up * 0.55), 62, t, 0.5, 11);
  renderSoft(st, { focus: 2.2, range: 14, blur: 3, ao: 0.4, aoR: 0.3, exposure: 1.15 }); };
// ---- 12 · Diego turns and points up: "Volvamos arriba"
SHOT_FN.point = (tl, dur, t) => { const S = stLobby(), st = S.st; if (S.pov) S.pov.visible = false; lobbySpk(S); lobbyCrowd(S, t); const pk = ss(VW('l14', 4) - 0.3, VW('l14', 4) + 0.1, t);
  show(S.D, Object.assign({ x: -0.45, z: 4.6, yaw: 0.35, headYaw: -0.25, headPitch: -0.1 - 0.15 * pk, look: [0, 0.3 * pk], emo: { surprise: 0.2, open: mouthOf('l14', t), smile: 0.1 } }, pk > 0.05 ? { armR: [lerp(0.3, 2.55, pk), 0.32, lerp(0.8, 0.25, pk)] } : {})); pointFinger(S.D, 1, pk);
  camPt(st, [-0.4, 1.62, 7.7], [2.3, 2.1, -14], 64, t, 0.5, 4);
  renderSoft(st, { focus: 3.1, range: 16, blur: 4, ao: 0.4, aoR: 0.3, exposure: 1.15 }); };
// ---- 13 · "tengo un muy mal presentimiento": the view sinks to the floor, away from everyone
SHOT_FN.doubt = (tl, dur, t) => { const S = stLobby(), st = S.st; lobbySpk(S); lobbyCrowd(S, t); pointFinger(S.D, 1, 0);
  show(S.D, { x: -0.45 - 0.9 * tl, z: 4.6 - 2.2 * tl, yaw: Math.PI + 0.4, walk: 1, ph: t * 7, emo: {} });
  const dn = EZ.io(seg(t, SH0('doubt') + 0.2, SH0('doubt') + 1.1)) * (1 - EZ.io(seg(t, SH0('doubt') + 2.4, SH0('doubt') + 3.2))); camPt(st, [-0.4, 1.62 - 0.05 * dn + 0.01 * Math.sin(t * 1.6), 7.7], mixv([2.3, 2.1, -14], [-0.38, 0.0, 6.25], dn), 74, t, 0.35, 12); povLegs(S, -0.4, 7.7, t);
  renderSoft(st, { focus: 3, range: 12, blur: 0, ao: 0.4, aoR: 0.3, exposure: 1.1 }); };
// your own legs and shoes under the camera (seen when the view sinks)
function povLegs(S, x, z, t) { if (!S.pov) { S.pov = buildPovLegs(S); }
  S.pov.visible = true; S.pov.position.set(x, 0, z - 0.16); S.pov.rotation.y = 0.05 * Math.sin(t * 0.8); S.pov.userData.legs.forEach((l, i) => { const ph = t * 1.6 + i * Math.PI; l.position.z = -0.03 + 0.035 * Math.sin(ph); l.rotation.x = 0.04 * Math.sin(ph); }); }
function buildPovLegs(S) { return buildPovLegs0(S); }
function buildPovLegs0(S) { const g = new THREE.Group(), tr = TOON({ color: '#565a64', roughness: 0.92 }), sh = TOON({ color: '#4a2a18', roughness: 0.3 }), so = TOON({ color: '#1a1410', roughness: 0.7 }), lace = TOON({ color: '#2a2622' }); g.userData.legs = [];
  [-1, 1].forEach((s) => { const leg = new THREE.Group(); leg.position.set(s * 0.1, 0, 0); g.add(leg); g.userData.legs.push(leg);
    const prof = [[0.0, 0.0], [0.058, 0.06], [0.06, 0.16], [0.056, 0.32], [0.062, 0.44], [0.068, 0.56], [0.07, 0.62]].map(([r, y]) => new THREE.Vector2(r, y));
    const l = new THREE.Mesh(new THREE.LatheGeometry(prof, 24).scale(1, 1, 0.92), tr); l.position.set(0, 0.075, 0.03); l.castShadow = true; leg.add(l);
    
    const shoe = new THREE.Group(); shoe.position.set(s * 0.01, 0, -0.17); shoe.rotation.y = s * 0.1; leg.add(shoe);
    const up = new THREE.Mesh(new THREE.SphereGeometry(0.06, 22, 14).scale(0.78, 0.6, 2.3), sh); up.position.set(0, 0.045, -0.05); up.castShadow = true; shoe.add(up);
    const toe = new THREE.Mesh(new THREE.SphereGeometry(0.042, 18, 12).scale(0.95, 0.68, 1.3), sh); toe.position.set(0, 0.032, -0.15); shoe.add(toe);
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.016, 0.29), so); sole.position.set(0, 0.008, -0.06); shoe.add(sole);
    for (let k = 0; k < 4; k++) { const la = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.005, 0.006), lace); la.position.set(0, 0.083 - k * 0.004, -0.02 - k * 0.022); la.rotation.x = -0.35; shoe.add(la); } });
  S.st.scene.add(g); return g; }
function povLegsOld(S, x, z, t) { if (!S.pov) { const g = new THREE.Group(), tr = TOON({ color: '#25272d', roughness: 0.9 }), sh = TOON({ color: '#151414', roughness: 0.45 }), so = TOON({ color: '#2a2624' });
    [-1, 1].forEach((s) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.062, 0.86, 18), tr); l.position.set(s * 0.1, 0.5, -0.06); l.castShadow = true; g.add(l);
      const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.17, 6, 16).rotateX(Math.PI / 2).scale(1, 0.72, 1), sh); f.position.set(s * 0.11, 0.05, -0.16); f.rotation.y = s * 0.12; f.castShadow = true; g.add(f);
      const sl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.022, 0.29), so); sl.position.set(s * 0.11, 0.012, -0.16); sl.rotation.y = s * 0.12; g.add(sl); });
    S.st.scene.add(g); S.pov = g; }
  S.pov.visible = true; S.pov.position.set(x, 0, z - 0.16); S.pov.rotation.y = 0.04 * Math.sin(t * 0.8); }
// ---- 14 · "Vamos, hombre": Diego waves from an open car across the lobby (long lens)
SHOT_FN.wave = (tl, dur, t) => { const S = stLobby(), st = S.st; if (S.pov) S.pov.visible = false; lobbySpk(S); lobbyCrowd(S, t); pointFinger(S.D, 1, 0); S.ppl.forEach(({ P, q }) => { if (Math.abs(q.x - S.openX) < 3.6 && q.z < -5.5) P.root.visible = false; });
  S.openDoor.position.x = S.openX + 1.5 * EZ.io(seg(t, SH0('wave') - 0.5, SH0('wave') + 0.1)); const x = S.openX;
  show(S.D, { x: x - 0.1, z: -13.3, yaw: -0.12, armR: [2.5, 0.45, 0.5 + 0.45 * Math.sin(t * 9)], headPitch: 0.05, emo: { smile: 0.2, open: mouthOf('l16', t) } });
  camPt(st, [x + 0.7, 1.62, -8.9], [x, 2.25, -13.6], 58, t, 0.6, 13);
  renderSoft(st, { focus: 4.6, range: 8, blur: 0, ao: 0.4, aoR: 0.3, exposure: 1.15 }); };

// ---- 15 · the car going up (9:02): the indicator climbs 79 → 89 — "en dos minutos…"
SHOT_FN.up = (tl, dur, t) => { const S = stCore(), st = S.st; coreCommon(S, t); S.setInd(dispFloor(floorAt(t))); S.wait.forEach((w) => (w.P.root.visible = false));
  const X = 40, g_ = 0.15 * Math.sin(t * 3.1); show(S.D, { x: X + 0.55, z: 0.3, yaw: -2.2 + 0.08 * Math.sin(t * 0.7), headYaw: 0.1 + 0.12 * Math.sin(t * 1.3), headPitch: 0.02, sway: 0.03 * Math.sin(t * 0.9), emo: { smile: 0.35, open: mouthOf('l17', t) }, armL: [0.2, 0.1, 0.3], armR: [0.45 + g_, 0.15, 1.1 + g_] });
  show(S.upPpl[0], { x: X - 0.45, z: 0.75, yaw: 0, emo: { fear: 0.15 } }); show(S.upPpl[1], Object.assign({ x: X - 0.1, z: -0.35, yaw: 2.4 + 0.06 * Math.sin(t * 0.6), headYaw: 0.3, sway: 0.02 * Math.sin(t * 1.1) }, POSE.arms()));
  camPt(st, [X - 0.85 + 0.02 * Math.sin(t * 0.8), 1.6 + 0.01 * Math.sin(t * 1.7), -0.8], [X + 0.55, 1.62, 0.9], 64, t, 1.8, 14); st.key.target.position.set(X, 0, 0); st.key.target.updateMatrixWorld(); st.key.position.set(X + 2, 12, 3);
  renderSoft(st, { focus: 1.4, range: 3, blur: 2.5, ao: 0.55, aoR: 0.25, exposure: 1.05 }); };
// ---- 16 · back on 89, nearly empty — "algo no está bien"
SHOT_FN.back = (tl, dur, t) => { const S = stTower(), st = S.st; towerSet(S, {}, t); const e = S.ex;
  show(e[11], { x: 4.8, z: -30.1, yaw: Math.PI, armL: [0.4, 0.2, 1.2], emo: { fear: 0.3 } }); show(e[8], { x: 11.5, z: -22.6, yaw: 2.4, crouch: 0.6, armR: [0.9, 0.1, 0.4], emo: {} });
  const k = EZ.io(seg(t, SH0('back'), SH1('back') - 0.6)), z = lerp(-24.5, -30.5, k), x = lerp(8.2, 6.75, k), up = ss(SH0('back') + 1.0, SH1('back') - 0.8, t);
  show(S.D, { x: x + 1.0, z: z - 1.1, yaw: Math.PI + 0.3, walk: 1 - k * 0.7, ph: t * 6.5, emo: { fear: 0.3 } });
  camPt(st, W3(x, 1.62 + 0.015 * Math.sin(t * 6.5), z), mixv(W3(4.5, 1.2, -31.5), [-8, FY + 13, -84], up), 66, t, 0.7, 15);
  renderSoft(st, { focus: 4, range: 14, blur: 2, ao: 0.5, aoR: 0.3 }); };
// ---- 17 · the south window: a colleague; over the harbour, past the Statue of Liberty, another plane — closing in
SHOT_FN.window2 = (tl, dur, t) => { const S = stTower(), st = S.st; towerSet(S, { plane2: 1 }, t);
  const pt = ss(LT0('l19') - 0.3, LT0('l19') + 0.2, t) * (1 - ss(61.0, 61.6, t)), mouthHand = ss(61.0, 61.6, t);
  show(S.comp, Object.assign({ x: 0.8, z: 30.95, armL: [1.55, 0.25, 0.3], lean: 0.08, yaw: 0.25 * pt, headYaw: lerp(0, -1.2, ss(LT0('l19') - 0.2, LT0('l19') + 0.4, t)) * (1 - pt * 0.6), emo: { fear: 0.8 + 0.2 * pt, surprise: 0.6, open: Math.max(0.35, mouthOf('l19', t)) } }, pt > 0.05 ? { armR: [lerp(0.2, 1.75, pt), 0.15, 0.1] } : mouthHand > 0.05 ? { armR: [lerp(0.2, 1.95, mouthHand), 0.3, lerp(0.3, 2.5, mouthHand)] } : {}));
  // she points; you step to the next window, right up to the glass, and follow the plane — nothing in front of it
  const near = ss(61.4, 62.6, t), step = EZ.io(seg(t, 60.4, 61.9)), pp = plane2At(t); flyPlane(S.plane2, pp, DIR2, 0.65);
  const cp = W3(lerp(-0.1, -0.28, step), 1.6, lerp(lerp(29.0, 29.4, ss(SH0('window2'), 60.4, t)), 31.02, step)), toP = pp.clone().sub(new THREE.Vector3(...cp)).normalize().multiplyScalar(120).add(new THREE.Vector3(...cp));
  const turn = 1; camPt(st, cp, mixv(mixv(W3(0.9, 1.25, 33), W3(-40, -8, 120), turn), toP.toArray(), near), lerp(64, 58, near), t, 0.5 + 0.6 * near, 16); shake(st, 0.45 * ss(63.2, 64.2, t), t);
  renderSoft(st, { blur: 0, ao: 0.45, aoR: 0.2 }); };
SHOT_FN.part2 = () => { fillAll('#000000'); };
