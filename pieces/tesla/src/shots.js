
// =====================================================================
//  SHOTS — garage → launch (POV) → hop over the jam → glide between towers → through the clouds (POV) → the edge of space (POV)
//  → weightless, Starman appears (POV, then outside) → both cars over the Earth → card.
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const fov = (st, f) => { st.cam.fov = f; st.cam.updateProjectionMatrix(); };
const T_LAUNCH = 8.6, T_QUIET = 50.0, T_MEET = 51.0;
// the driver's eye and a look target, in car-local coordinates
function povCam(st, car, look = [3.5, 0.75, -0.3], f = 74, eye = [-0.62, 1.2, -0.38]) { car.updateMatrixWorld(true); const e = new THREE.Vector3(...eye).applyMatrix4(car.matrixWorld), g = new THREE.Vector3(...look).applyMatrix4(car.matrixWorld); camLook(st.cam, e.x, e.y, e.z, g.x, g.y, g.z); st.cam.up.set(0, 1, 0); fov(st, f); }
function inside(S, on) { S.car.userData.glass.opacity = on ? 0.16 : 1; cabinCut(S.car, on); }
function sunAt(st, dir, target, d = 150) { st.key.target.position.copy(target); st.key.position.copy(dir).multiplyScalar(d).add(target); st.key.target.updateMatrixWorld(); }

// ---------- stages ----------
function streetStage() { return once('street', () => { const st = makeStage({ skyTop: '#5a86c8', skyHor: '#f4c89a', hemi: 0.75, sky: 0xd8c8c0, ground: 0x6a6a50, key: 2.6, keyCol: '#ffd2a0', box: 30, boxFar: 300, fog: '#e8c8b0', fogNear: 60, fogFar: 600, sunDist: 150, far: 20000 });
  st.setSun(SUN_DAWN, new THREE.Vector3(-3, 0, 2)); skyEnv(st, '#5a86c8', '#f4c89a', SUN_DAWN, '#ffd2a0'); const S = buildStreet(st); addSkyClouds(st, 36, 0, 0, 1800, 5000, 500, 1200, 'street'); S.car = buildRoadster(); S.car.userData.xr.visible = false; detailRoadster(S.car); S.cp = buildCockpit(S.car); addPlumes(S.car); st.scene.add(S.car); return S; }); }
function cityStage() { return once('city', () => { const st = makeStage({ skyTop: '#3f7fd6', skyHor: '#dce8f2', hemi: 0.85, sky: 0xcfe0f0, ground: 0x7a7a70, key: 2.8, keyCol: '#fff2dc', box: 60, boxFar: 600, fog: '#c8d6e4', fogNear: 150, fogFar: 2300, sunDist: 300, far: 30000 });
  st.setSun(SUN_DAY, new THREE.Vector3(0, 0, 0)); skyEnv(st, '#3f7fd6', '#dce8f2', SUN_DAY); const S = buildCity(st); S.car = buildRoadster(); S.car.userData.xr.visible = false; detailRoadster(S.car); addPlumes(S.car); st.scene.add(S.car); return S; }); }
function skyStage() { return once('sky', () => { const st = makeStage({ skyTop: '#2a5ab8', skyHor: '#c8dcf0', hemi: 0.9, sky: 0xdde8f4, ground: 0x8a9070, key: 2.8, keyCol: '#fff6e8', box: 12, boxFar: 200, fog: '#c8d8ea', fogNear: 800, fogFar: 9000, sunDist: 100, far: 60000 });
  st.setSun(SUN_HIGH, new THREE.Vector3(0, 0, 0)); skyEnv(st, '#2a5ab8', '#c8dcf0', SUN_HIGH); const S = buildSky(st); S.car = buildRoadster(); S.car.userData.xr.visible = false; detailRoadster(S.car); S.cp = buildCockpit(S.car); addPlumes(S.car); st.scene.add(S.car); return S; }); }
function spaceStage() { return once('space', () => { const st = makeStage({ hemi: 0.12, sky: 0x8aa0c0, ground: 0x101010, key: 2.4, keyCol: '#ffffff', box: 14, boxFar: 140, sunDist: 60, far: 60000 }); st.setSun(SUN_SPACE, new THREE.Vector3(0, 0, 0)); skyEnv(st, '#02030a', '#0a1430', SUN_SPACE, '#ffffff');
  const S = buildSpace(st); S.car = buildRoadster(); S.car.userData.xr.visible = false; detailRoadster(S.car); S.cp = buildCockpit(S.car); addPlumes(S.car); st.scene.add(S.car);
  // things that float in the cabin: your phone, the keys, a coin, a sunglasses case
  S.float = []; const ph = mesh(new THREE.BoxGeometry(0.075, 0.008, 0.155), STDm({ color: '#1a1a1e', metalness: 0.4, roughness: 0.2 })); const keys = new THREE.Group(); keys.add(mesh(new THREE.TorusGeometry(0.018, 0.003, 6, 16), STDm({ color: '#c8ccd2', metalness: 0.9, roughness: 0.25 }))); keys.add(mesh(new THREE.BoxGeometry(0.05, 0.01, 0.028), STDm({ color: '#1a1a1e' }), 0.035, 0, 0));
  const coin = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.002, 16), STDm({ color: '#c8a050', metalness: 0.9, roughness: 0.3 })), cs = mesh(new THREE.CapsuleGeometry(0.02, 0.1, 4, 10), STDm({ color: '#6a3a2a' }));
  [[ph, [0.05, 1.12, -0.18]], [keys, [0.12, 1.2, -0.55]], [coin, [-0.05, 1.28, -0.32]], [cs, [0.15, 1.05, 0.05]]].forEach(([m, p]) => { m.scale.setScalar(1.8); S.car.add(m); S.float.push({ m, p }); });
  return S; }); }

// ===================== 1. GARAGE (0-7): the door rolls up; the car rolls out; the neighbours stare =====================
SHOT_FN.garage = (lt, dur, t) => { const S = streetStage(), st = S.st; inside(S, false); posePlumes(S.car, 0, 0, t);
  const roll = EZ.io(seg(t, 4.4, 7.0)); S.car.position.set(STR.GX, 0, lerp(-4.2, 3.2, roll)); S.car.rotation.y = -Math.PI / 2; spinWheels(S.car, roll * 7.4); poseStreet(S, t, ss(0.6, 4.2, t), ss(4.6, 6.2, t));
  const k = EZ.io(seg(t, 4.4, 7.0)); camLook(st.cam, lerp(STR.GX + 1.6, STR.GX + 10, k), lerp(1.62, 1.55, k), lerp(10.5 - 1.2 * ss(0, 4.4, t), 11.5, k), lerp(STR.GX + 0.3, STR.GX + 1.0, k), lerp(1.5, 1.0, k), lerp(-2.0, 1.2, k)); fov(st, 54); handheld(st.cam, t, 0.8, 1);
  renderStage(st, 1.05); bloom(0.25); lensFlare(st, SUN_DAWN); };
function spinWheels(car, dist) { car.userData.wheels.forEach((w) => { w.rotation.z = -dist / 0.37; }); }
// ===================== 2. LAUNCH (7-14): POV: your hands on the yoke; 0-97 km/h in 0.81 s down the street =====================
const launchX = (t) => { const s = Math.max(0, t - T_LAUNCH); return -1.8 + (s < 1.8 ? 0.5 * 33 * s * s : 0.5 * 33 * 1.8 * 1.8 + 59.4 * (s - 1.8)); };
SHOT_FN.launch = (lt, dur, t) => { const S = streetStage(), st = S.st; inside(S, true); const x = launchX(t); S.car.position.set(x, 0, 10.0); S.car.rotation.y = 0; spinWheels(S.car, x); poseStreet(S, t, 1, 1, ss(T_LAUNCH, T_LAUNCH + 0.4, t) * (1 - ss(10, 12, t)));
  const kick = ss(T_LAUNCH, T_LAUNCH + 0.15, t) * (1 - ss(T_LAUNCH + 0.3, T_LAUNCH + 1.2, t)); poseCockpit(S.cp, t, 0.02 * Math.sin(t * 3), 1, 0.15 + 0.6 * kick); drawScreen(S.cp, speedKmh(t), t < T_LAUNCH ? 'PAQUETE SPACEX · LISTO' : 'MODO PLAID', false); posePlumes(S.car, 0, 0, t);
  povCam(st, S.car, [3.5, 0.75 + 0.25 * kick, -0.3], 74 + 10 * kick, [-0.62 - 0.12 * kick, 1.2, -0.38]); handheld(st.cam, t, 0.6 + 2.5 * kick, 2); sunAt(st, SUN_DAWN, new THREE.Vector3(x, 0, 10));
  renderStage(st, 0.95); bloom(0.18); lensFlare(st, SUN_DAWN, 0.4); zoomBlur(ss(T_LAUNCH, T_LAUNCH + 0.3, t) * (1 - 0.6 * ss(T_LAUNCH + 0.5, T_LAUNCH + 1.5, t)) * 0.8 + 0.15 * ss(9.5, 11, t)); };
// ===================== 3. JUMP (14-22): the jam; the thrusters fire; over the bus =====================
const jumpPos = (t) => { const x = 40 + 26 * (t - 18.3), j1 = ss(17.0, 17.4, t) * (1 - ss(19.2, 19.6, t)), u = seg(t, 17.0, 19.6), hop = j1 > 0 ? 11 * Math.sin(u * Math.PI) : 0, rise = Math.max(0, t - 20.4) ** 1.8 * 3; return new THREE.Vector3(x + 0 * hop, hop + rise, 2.2); };
SHOT_FN.jump = (lt, dur, t) => { const S = cityStage(), st = S.st, p = jumpPos(t); S.car.position.copy(p); const air = p.y > 0.3 ? 1 : 0; S.car.rotation.set(0, 0, 0.12 * Math.sin(seg(t, 17.0, 19.6) * Math.PI) * air + (t > 20.4 ? 0.25 * ss(20.4, 21.4, t) : 0)); spinWheels(S.car, p.x);
  posePlumes(S.car, ss(16.8, 17.1, t) * (1 - ss(19.4, 19.8, t)) + ss(20.2, 20.6, t), ss(16.9, 17.1, t) * (1 - ss(18.6, 19.4, t)) + ss(20.2, 20.6, t), t); poseCity(S, t, p.x); sunAt(st, SUN_DAY, new THREE.Vector3(p.x, 0, 0), 300);
  if (t < 16.6) camLook(st.cam, p.x - 9, 2.0, 6.0, p.x + 20, 1.2, 0); else if (t < 20.2) { const k = EZ.io(seg(t, 16.6, 17.4)); camLook(st.cam, lerp(p.x - 9, 30, k), lerp(2.0, 2.6, k), lerp(6.0, 24, k), lerp(p.x + 20, p.x, k), lerp(1.2, p.y * 0.6 + 1, k), 2.2); } else camLook(st.cam, 30 + (t - 20.2) * 6, 2.6, 24, p.x, p.y * 0.8 + 1, 2.2);
  fov(st, 58); handheld(st.cam, t, 1.0 + 3 * ss(17.0, 17.3, t) * (1 - ss(17.6, 18.4, t)), 3); renderStage(st, 1.05); bloom(0.25); lensFlare(st, SUN_DAY); };
// ===================== 4. CITY (22-32): gliding between the towers, then over the bridge and the river =====================
SHOT_FN.city = (lt, dur, t) => { const S = cityStage(), st = S.st, x = lerp(-120, 330, lt / dur), y = 55 + 25 * lt / dur + 8 * Math.sin(lt * 0.5); S.car.position.set(x, y, 0.5 * Math.sin(lt)); S.car.rotation.set(0.05 * Math.sin(lt * 1.3), 0, 0.08 * Math.sin(lt * 0.9) + 0.12); poseCity(S, t, x); posePlumes(S.car, 0.85, 0.55, t); sunAt(st, SUN_DAY, new THREE.Vector3(x, 0, 0), 300);
  if (lt < 5) camLook(st.cam, x - 11, y + 3.2, 4.5, x + 30, y - 12, -1); else { const k = EZ.io(seg(lt, 5, 6.5)); camLook(st.cam, lerp(x - 11, x + 16, k), lerp(y + 3.2, y + 6, k), lerp(4.5, 22, k), x, y, 0); }
  fov(st, 62); handheld(st.cam, t, 1.2, 4); renderStage(st, 1.05); bloom(0.25); lensFlare(st, SUN_DAY); };
// ===================== 5. CLOUDS (32-40): POV climbing steeply through the cloud deck =====================
SHOT_FN.clouds = (lt, dur, t) => { const S = skyStage(), st = S.st, y = lerp(1300, 3200, EZ.io(lt / dur)); S.car.position.set(0, y, 0); S.car.rotation.set(0, 0, 0.55); inside(S, true); poseCockpit(S.cp, t, 0.03 * Math.sin(t * 2), 1, 0.3); drawScreen(S.cp, speedKmh(t), 'ASCENSO', true); posePlumes(S.car, 1, 0.7, t); sunAt(st, SUN_HIGH, S.car.position, 100);
  povCam(st, S.car, [3.5, 1.2, -0.3], 76); handheld(st.cam, t, 1.5, 5); if (st.sky) st.sky.position.copy(st.cam.position); renderStage(st, 1.05); const fogK = ss(1700, 1950, y) * (1 - ss(2150, 2400, y)); if (fogK > 0) pvTint('#f4f6fa', 0.85 * fogK); bloom(0.25); lensFlare(st, SUN_HIGH, 1 - fogK); };
// ===================== 6. EDGE (40-50): POV: the sky turns black; the curve of the Earth; 100 km =====================
const altKm = (t) => (t < 40 ? 12 : t < 50 ? lerp(25, 112, EZ.io(seg(t, 40, 49.6))) : 112);
SHOT_FN.edge = (lt, dur, t) => { const S = spaceStage(), st = S.st, alt = altKm(t); poseSpace(S, t, alt * 1.6); const dark = ss(25, 90, alt); st.scene.background = lin('#7aa4d8').lerp(lin('#010104'), dark); S.stars.material.opacity = ss(60, 105, alt);
  S.star.visible = false; S.car.position.set(0, 0, 0); S.car.rotation.set(0, Math.PI / 2, 0.3 * (1 - ss(44, 48, t)) - 0.3 * ss(43, 47.5, t)); inside(S, true); poseCockpit(S.cp, t, 0, 1, 0.2); drawScreen(S.cp, speedKmh(t), altKm(t) >= 100 ? 'ESPACIO' : 'ASCENSO', t < 49.6); posePlumes(S.car, 1 - ss(47, 49.6, t), 0, t); S.float.forEach((f) => (f.m.visible = false));
  const pitch = lerp(1.4, -0.3, ss(43, 47.5, t)); povCam(st, S.car, [3.5, 1.1 + pitch, -0.3], 78); handheld(st.cam, t, 1.2 * (1 - ss(46, 50, t)), 6); renderStage(st, 1.0); bloom(0.3); lensFlare(st, SUN_SPACE, 0.7); };
// ===================== 7. MEET (50-60): silence; weightless; Starman drifts into view; then outside, side by side =====================
SHOT_FN.meet = (lt, dur, t) => { const S = spaceStage(), st = S.st; poseSpace(S, t, 190); st.scene.background = lin('#010104'); S.stars.material.opacity = 0.9; S.star.visible = true; posePlumes(S.car, 0, 0, t);
  S.car.position.set(0, 0, 0); const pov = t < 56, sx = lerp(30, 9, EZ.o3 ? EZ.o3(seg(t, T_MEET, 56)) : ss(T_MEET, 56, t)), side = lerp(9, 3.2, ss(T_MEET, 56, t));
  if (pov) { S.car.rotation.set(0, Math.PI / 2, -0.3); S.star.position.set(-side, -0.6 + 0.3 * Math.sin(t * 0.3), -sx); S.star.rotation.set(0.12 * Math.sin(t * 0.2), Math.PI / 2 + 0.5 + t * 0.02, 0.15); }
  else { S.car.rotation.set(0, 0, 0); S.star.position.set(9, 0.4 + 0.3 * Math.sin(t * 0.3), -5); S.star.rotation.set(0.12 * Math.sin(t * 0.2), Math.PI + 0.5 + t * 0.02, 0.15); }
  S.float.forEach((f, i) => { f.m.visible = true; const a = Math.max(0, t - T_QUIET); f.m.position.set(f.p[0] + 0.02 * a * Math.sin(i * 2), f.p[1] + 0.03 * a, f.p[2] + 0.02 * a * Math.cos(i * 3)); f.m.rotation.set(a * 0.6 * (i + 1) * 0.3, a * 0.4, a * 0.5 * (i % 2 ? 1 : -1)); });
  if (t < 56) { inside(S, true); drawScreen(S.cp, speedKmh(t), 'ESPACIO', false); poseCockpit(S.cp, t, 0, 0.25 + 0.75 * (1 - ss(T_QUIET, T_QUIET + 0.8, t)), 0.05); povCam(st, S.car, [3.5, lerp(0.5, 0.85, ss(51, 54, t)), lerp(-0.3, -1.1, ss(51, 54, t))], 72); }
  else { inside(S, false); const k = EZ.io(seg(t, 56, 60)); camLook(st.cam, lerp(4.2, 2.0, k), lerp(2.6, 3.5, k), lerp(3.2, 7.5, k), 5, 0.3, -2.5); fov(st, 56); }
  renderStage(st, 0.9); bloom(0.3); lensFlare(st, SUN_SPACE, 0.8); };
// ===================== 8. WIDE (60-66): both cars, small, over the Earth, the Sun beyond =====================
SHOT_FN.wide = (lt, dur, t) => { const S = spaceStage(), st = S.st; poseSpace(S, t, 190 + 600 * ss(60, 66, t)); S.star.visible = true; inside(S, false); posePlumes(S.car, 0, 0, t); S.float.forEach((f) => (f.m.visible = false));
  S.car.position.set(0, 0, 0); S.car.rotation.set(0, 0.1 * t, 0); S.star.position.set(9, 0.4, -5); S.star.rotation.set(0.12, Math.PI + 0.7 + t * 0.02, 0.15);
  const k = EZ.io(seg(t, 60, 66)); camLook(st.cam, lerp(2, -18, k), lerp(3.5, 16, k), lerp(7.5, 40, k), 4.5, -1 - 12 * k, -2.5); fov(st, 56); renderStage(st, 0.9); bloom(0.3); lensFlare(st, SUN_SPACE, 1); };
SHOT_FN.card = () => {};
// one speed for the HUD and the car's screen
function speedKmh(t) { if (t < T_LAUNCH) return 0; if (t < 14) { const s = t - T_LAUNCH; return Math.round(s < 1.8 ? 33 * s * 3.6 : 214 + (s - 1.8) * 10); } if (t < 22) return Math.round(94 + 12 * Math.sin(t)); if (t < 32) return Math.round(160 + 8 * Math.sin(t)); if (t < 40) return Math.round(lerp(400, 1900, (t - 32) / 8)); if (t < 50) return Math.round(lerp(1900, 7200, (t - 40) / 10)); return 7200; }
