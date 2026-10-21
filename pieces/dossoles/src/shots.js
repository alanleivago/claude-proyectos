
// =====================================================================
//  SHOTS — one continuous time-lapse from the porch; the camera turns with the suns (east → south and up → west)
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const fov = (st, f) => { st.cam.fov = f; st.cam.updateProjectionMatrix(); };
const T_ECL = 36.0;
function world() { return once('world', () => { const st = makeStage({ hemi: 0.5, sky: 0xbcd0e8, ground: 0xa87a52, key: 2.5, keyCol: '#fff6ea', box: 45, boxFar: 400, fog: '#d8dce4', fogNear: 700, fogFar: 6500, sunDist: 150, far: 40000 }); st.scene.background = null;
  if (st.sky) st.sky.visible = false; const S = buildDesert(st); return S; }); }
// the camera's look: yaw (az, degrees) and pitch (degrees) over the day
const YAW = [[0, 98], [20, 104], [26, 124], [33, 150], [38, 170], [44, 176], [50, 210], [56, 248], [62, 262], [68, 266]], PITCH = [[0, -3], [20, -2], [26, 0], [33, 18], [38, 32], [44, 28], [50, 6], [56, -2], [68, -3]];
SHOT_FN.day = (lt, dur, t) => { const S = world(), st = S.st, su = poseDesert(S, t);
  // the rancher: walks to the tank in the morning, checks the water, looks up at the eclipse, leans on the truck in the afternoon
  const R = S.ranch, ecl = su.ecl, scare = ss(T_ECL - 0.5, T_ECL + 1.5, t) * (1 - ss(44, 47, t));
  if (t < 20) posePerson(R, { x: 6, z: 1, yaw: 0.9, emo: { smile: 0.3 } });
  else if (t < 26) { const k = seg(t, 20, 26); posePerson(R, { x: lerp(6, 5.6, k), z: lerp(1, 8.4, k), yaw: 0.6, walk: 1, ph: t * 7, emo: { smile: 0.3 } }); }
  else posePerson(R, { x: 5.6, z: 8.4, yaw: 0.6 + 2.0 * scare, lean: 0.25 * (1 - scare), headPitch: -0.9 * scare, armR: scare > 0.2 ? [2.6, 0.2, 1.9] : [0.9, 0.2, 0.5], armL: scare > 0.5 ? [1.3, 0.1, 1.6] : null, emo: scare > 0.1 ? { fear: scare, surprise: scare, open: 0.8 * scare } : { smile: 0.2 } });
  posePuppy(S.dog, t * 0.6, false); S.dog.neck.rotation.x -= 0.6 * scare; S.dog.head.rotation.z += 0.5 * scare;
  const look = ss(38.3, 39.3, t) * (1 - ss(42.2, 43.4, t)), mEl = Math.max(-2, (su.elA + su.elB) / 2), mAz = (su.azA + su.azB) / 2, yaw = lerp(lerp(knots(YAW, t), mAz, 0.55 * ss(-2, 6, mEl)), 140, look) * DEG, f = lerp(lerp(60, 80, ss(15, 55, mEl)), 58, look), pitch = lerp(clamp(mEl - f * 0.36, 2, 40), -14, look) * DEG, e = [0, 3.95, -0.55]; const fwd = 0.4; e[0] += Math.sin(yaw) * fwd; e[2] -= Math.cos(yaw) * fwd; camLook(st.cam, e[0], e[1], e[2], e[0] + Math.sin(yaw) * Math.cos(pitch) * 10, e[1] + Math.sin(pitch) * 10, e[2] - Math.cos(yaw) * Math.cos(pitch) * 10); fov(st, f); handheld(st.cam, t, 0.5 + 1.5 * scare, 1);
  const exp = 1.0 - 0.25 * ecl; renderStage(st, exp); bloom(0.25 + 0.15 * (1 - ss(5, 25, Math.max(su.elA, su.elB))));
  if (su.elB > -1) lensFlare(st, su.B, 0.6 * ss(-1, 4, su.elB) * (1 - 0.6 * ecl)); if (su.elA > -1 && ecl < 0.6) lensFlare(st, su.A, 0.35 * ss(-1, 4, su.elA)); };
SHOT_FN.noon = SHOT_FN.eve = SHOT_FN.day;
SHOT_FN.card = () => {};
