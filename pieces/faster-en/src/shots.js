// =====================================================================
//  SHOTS — the reference's camera, shot by shot, from the pier deck (eye height EY). One stage for the whole piece:
//  pier → camera → ocean → sky/time → tilt → render. All world motion is a pure function of t.
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const fov = (st, f) => { st.cam.fov = f; st.cam.updateProjectionMatrix(); };
const EY = PIER.DECK + 1.65;
function camPt(st, p, q, f, t, amt = 0.5, seed = 1) { camLook(st.cam, p[0], p[1], p[2], q[0], q[1], q[2]); fov(st, f); handheld(st.cam, t, amt, seed); st.cam.rotation.z += TILT(t); }
const mixv = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
function world() { return once('pier', () => { const st = dayStage({ sun: SUN_PIER, top: '#3a6ec0', hor: '#cfdce8', sunC: '#fff2dc', clouds: 0.5, fogC: '#d4dfea', fogNear: 600, fogFar: 9000, box: 80, boxFar: 800, sunDist: 400, hemi: 0.6, key: 2.2, target: new THREE.Vector3(0, PIER.DECK, -70), far: 60000 });
  const S = buildPier(st); S.ocean = buildOcean(st, S); S.sky = buildSkyTime(st, S); S.tilt = buildTilt(st, S); return S; }); }
function scene(t, camFn, o = {}) { const S = world(), st = S.st; posePier(S, t); camFn(st, t); poseOcean(S.ocean, t); poseSkyTime(S.sky, t, st.cam); poseTilt(S.tilt, t, st.cam);
  renderStage(st, o.exp ?? (S.sky.exp ?? 0.9)); bloom(o.bloom ?? (S.sky.bloom ?? 0.25)); return S; }
const shot = (P0, P1, Q0, Q1, f, o = {}) => (lt, dur, t) => scene(t, (st) => { const u = EZ.io(clamp(lt / dur)); camPt(st, mixv(P0, P1, u), mixv(Q0, Q1, u), typeof f === 'number' ? f : lerp(f[0], f[1], u), t, o.amt ?? 0.4, o.seed ?? 1); }, o);
// walking south along the deck (the walk keeps going through the banner plane)
SHOT_FN.walk = (lt, dur, t) => scene(t, (st) => camPt(st, [0.6, EY + 0.04 * Math.sin(t * 11), -60 - 1.1 * t], [0, EY - 0.6, -500], 62, t, 0.5, 1));
SHOT_FN.plane = (lt, dur, t) => scene(t, (st) => { const u = EZ.io(clamp(lt / dur)); camPt(st, [0.6, EY + 0.04 * Math.sin(t * 11), -60 - 1.1 * t], mixv([0, EY + 2, -500], [-60, EY + 40, -500], u), 62, t, 0.5, 2); });
SHOT_FN.sea = shot([3.4, EY, -80], [3.7, EY, -80.5], [22, -2, -100], [24, -2, -92], 60, { seed: 3 });
SHOT_FN.beach = shot([3.6, EY, -73], [3.6, EY, -73.5], [30, 6, 10], [40, 10, 30], 60, { seed: 4 });
SHOT_FN.recede = shot([3.8, EY, -76], [3.8, EY, -76.5], [30, -2, -110], [40, -2, -130], 60, { seed: 5 });
SHOT_FN.bed = shot([3.8, EY, -77], [3.8, EY, -78], [60, 0, -160], [80, 0, -200], 60, { seed: 6 });
SHOT_FN.beyond = shot([3.8, EY, -78], [3.8, EY, -78.5], [120, 2, -500], [140, 4, -600], 58, { seed: 7 });
SHOT_FN.days = shot([2.5, EY, -68], [2.5, EY, -68.5], [30, 8, 20], [32, 9, 22], 60, { seed: 8 });
SHOT_FN.air = shot([2.5, EY, -68.5], [2.4, EY, -69], [30, 8, 20], [28, 6, 18], 60, { seed: 9, amt: 0.8 });
SHOT_FN.thin = shot([2, EY, -84], [2, EY, -84.5], [20, 6, 10], [18, 5, 8], 58, { seed: 10, amt: 0.6 });
SHOT_FN.noon = shot([1, EY, -86], [1, EY, -86], [0, 120, -160], [12, 0, -20], 66, { seed: 11 });
SHOT_FN.grip = shot([3.3, EY, -60], [3.3, EY, -60.2], [30, 2, 40], [32, 4, 40], 62, { seed: 12, amt: 0.6 });
SHOT_FN.lean = shot([3.3, EY, -60.2], [3.3, EY, -60.4], [32, 4, 40], [34, 5, 40], 62, { seed: 13, amt: 0.8 });
SHOT_FN.slide = shot([3.3, EY, -60.4], [3.3, EY, -60.6], [34, 5, 40], [36, 6, 40], 62, { seed: 14, amt: 1.0 });
SHOT_FN.wheel = shot([3.3, EY, -60.6], [3.3, EY, -61], [44, 16, 30], [30, 4, -20], 64, { seed: 15, amt: 1.2 });
SHOT_FN.hold = shot([3.3, EY, -61], [3.3, EY, -61.2], [30, 4, -20], [24, 2, -60], 64, { seed: 16, amt: 1.0 });
SHOT_FN.card = () => {};
