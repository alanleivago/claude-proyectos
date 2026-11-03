
// =====================================================================
//  SHOTS — the reference's camera, shot by shot, on the esplanade (the space, alien and Earth shots live in their files)
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const fov = (st, f) => { st.cam.fov = f; st.cam.updateProjectionMatrix(); };
function camPt(st, p, q, f, t, amt = 0.5, seed = 1) { camLook(st.cam, p[0], p[1], p[2], q[0], q[1], q[2]); fov(st, f); handheld(st.cam, t, amt, seed); }
const mixv = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
function esp() { return once('esp', () => { const st = dayStage({ sun: SUN_SET, top: '#5a6aa8', hor: '#f0b080', sunC: '#ffd8a0', clouds: 0.6, fogC: '#e8c0a0', fogNear: 400, fogFar: 5000, box: 60, boxFar: 600, sunDist: 300, hemi: 0.62, key: 2.4, keyCol: '#ffb070', target: new THREE.Vector3(0, 0, -20), far: 60000 });
  const S = buildEsplanade(st); buildSpace(st, S); buildHeat(st, S); return S; }); }
// the virtual clock: during the rewind (67–70) the world plays backward from 61 s to 0.5 s
const VT = (t) => (t < 67 ? t : t < 70 ? lerp(61, 0.5, EZ.i2(seg(t, 67, 70))) : t - 70 + 0.5);
function scene(t, camFn, o = {}) { const S = esp(), st = S.st, vt = VT(t); lightEsplanade(S, vt); poseEsplanade(S, vt); camFn(st, vt); poseSpace(S, vt, st.cam); poseHeat(S, vt, st.cam); renderStage(st, o.exp ?? (vt < 8 ? 0.86 : 1.0)); bloom(o.bloom ?? (vt >= 8 ? 0.45 : 0.2)); if (vt < 8 && o.flare !== false) lensFlare(st, SUN_SET, 0.35); return S; }
const shot = (P0, P1, Q0, Q1, f, o = {}) => (lt, dur, t) => scene(t, (st) => { const u = EZ.io(clamp(lt / dur)); camPt(st, mixv(P0, P1, u), mixv(Q0, Q1, u), typeof f === 'number' ? f : lerp(f[0], f[1], u), t, o.amt ?? 0.4, o.seed ?? 1); }, o);
SHOT_FN.plaza = shot([2.5, 2.4, 5], [1.5, 2.4, 2], [0, 3, -60], [0, 3.5, -60], 60);
SHOT_FN.people = shot([-0.2, 1.65, -0.6], [-0.6, 1.65, -1.4], [-3.6, 2.0, -8.5], [-3.6, 2.3, -9.5], 50, { seed: 2 });
SHOT_FN.palace = shot([0, 1.6, 1], [0, 1.6, 1.5], [0, 30, 70], [0, 38, 70], 58, { seed: 3, flare: false });
SHOT_FN.plaza2 = shot([1.2, 1.7, 1], [1, 1.7, 0.5], [0, 3.5, -60], [0, 4, -60], 60, { seed: 4 });
SHOT_FN.night = shot([1, 1.7, 0.5], [0.8, 1.7, 0.2], [0, 6, -60], [0, 14, -60], 62, { seed: 5 });
SHOT_FN.warp = shot([0, 2.4, -76], [0, 2.4, -77], [0, 0, -600], [0, 40, -600], 60, { seed: 6 });
SHOT_FN.milky = shot([4, 1.6, 6], [4, 1.6, 3], [4, 16, -60], [4, 20, -60], 62, { seed: 7 });
SHOT_FN.gal = shot([0, 1.6, 2], [0, 1.6, 1], [0, 40, -40], [4, 60, -30], 66, { seed: 8 });
SHOT_FN.quasar = shot([5, 1.1, 6], [4, 1.1, 3], [-6, 16, -60], [-4, 18, -60], 60, { seed: 9 });
SHOT_FN.first = shot([-4, 1.6, 2], [-3, 1.6, 0], [4, 16, -50], [4, 22, -50], 60, { seed: 10 });
SHOT_FN.dark = shot([2, 1.6, 0], [1.5, 1.6, -1], [0, 3, -40], [0, 3, -40], 60, { seed: 11 });
SHOT_FN.map = shot([1, 1.65, -2], [1, 1.65, -2.4], [0.6, -1.5, -14], [0.6, -1.0, -16], 60, { seed: 12 });
SHOT_FN.steam = shot([0, 2.2, -9], [0, 2.0, -11], [0, 2.5, -30], [0, 3.5, -30], 56, { seed: 13 });
SHOT_FN.burn = shot([1, 1.65, -2.4], [1, 1.65, -2.6], [0.6, -1.2, -16], [0.6, -1.0, -16], 56, { seed: 14 });
SHOT_FN.trees = shot([-14, 1.7, -8], [-16, 1.7, -9], [-38, 6, -28], [-38, 8, -34], 58, { seed: 15, amt: 0.8 });
SHOT_FN.glow = shot([1.5, 3.2, -70], [1, 3.2, -72], [0, -20, -700], [0, -5, -700], 60, { seed: 16, amt: 0.8 });
SHOT_FN.plasma = shot([1, 1.7, -66], [0.5, 1.7, -67], [0, 60, -500], [0, 90, -500], 64, { seed: 17, amt: 1.0 });
SHOT_FN.white = shot([3, 1.7, -60], [2, 1.7, -64], [0, 12, -500], [0, 18, -500], 60, { seed: 18, amt: 1.0 });
SHOT_FN.hand = shot([2, 1.7, -66], [2, 1.7, -66.5], [0, 30, -500], [0, 40, -500], 60, { seed: 19, amt: 1.2 });
SHOT_FN.rewind = shot([1, 1.7, 0.5], [1.5, 1.7, 2], [0, 14, -60], [0, 4, -60], 62, { seed: 20, amt: 1.5 });
SHOT_FN.loop = (lt, dur, t) => { SHOT_FN.plaza(lt * 0.5, 4, t); };
SHOT_FN.card = () => {};
