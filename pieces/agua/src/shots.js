
// =====================================================================
//  SHOTS — all from your seat on the bench (the reference's POV): your lap, the plaza and fountain behind you,
//  the bay in front. The water vanishes at 9 s (x10 slow until 56.5 s), then the sea comes back.
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const T_GONE = 9.0, T_BACK = 56.5;
const sceneT = (t) => (t < T_GONE ? t : t < T_BACK ? T_GONE + (t - T_GONE) / 10 : T_GONE + (T_BACK - T_GONE) / 10 + (t - T_BACK));
function world() { return once('world', () => { const st = makeStage({ skyTop: '#3f7fd6', skyHor: '#dce8f2', hemi: 0.85, sky: 0xcfe0f0, ground: 0x8a8070, key: 2.8, keyCol: '#fff2dc', box: 26, boxFar: 300, fog: '#d8e2ea', fogNear: 300, fogFar: 4200, sunDist: 150, far: 40000 });
  st.setSun(SUND, new THREE.Vector3(0, 0, -6)); const S = buildBay(st); S.P = buildPlaza(st); S.L = buildLap(st); S.C = buildCrowd(st); S.E = buildExtras(st); S.W8 = buildWave(st, S); return S; }); }
// reach: your right hand lifts the empty glass toward the bay (0..1)
function drawWorld(t, reach = 0) { const S = world(), ts = sceneT(t), k = t < T_GONE || t >= T_BACK ? 1 : 0, tb = t - T_BACK;
  poseBay(S, ts, k, Math.max(0, ts - T_GONE), tb); posePlaza(S.P, ts, k); poseLap(S.L, ts, k, reach, tb); poseCrowd(S.C, ts, ss(T_BACK + WV.ARRIVE - 0.6, T_BACK + WV.ARRIVE + 0.2, t), Math.max(0, tb - WV.ARRIVE + 0.6), k < 0.5); poseExtras(S.E, ts); poseWave(S.W8, S, tb); return S; }
const fov = (st, f) => { st.cam.fov = f; st.cam.updateProjectionMatrix(); };
const POV = () => [0, 1.22, BENCHZ + 0.35];
// look from your seat: yaw 0 = the bay, + = turning left; pitch in radians
function look(st, yaw, pitch, f = 58, dp = [0, 0, 0]) { const p = POV(), x = p[0] + dp[0], y = p[1] + dp[1], z = p[2] + dp[2]; camLook(st.cam, x, y, z, x - Math.sin(yaw) * 10 * Math.cos(pitch), y + 10 * Math.sin(pitch), z - Math.cos(yaw) * 10 * Math.cos(pitch)); fov(st, f); }
const lapLook = (st, t, f = 66) => { camLook(st.cam, 0.02 + 0.01 * Math.sin(t * 0.4), 1.27, BENCHZ + 0.46, 0.02, 0.62, BENCHZ - 0.18); fov(st, f); };
function finish(S, st, t, o = {}) { renderReflection(S, st); renderStage(st, 1.05); bloom(o.bloom ?? 0.2); lensFlare(st, o.flare ?? 1); }

// ===================== 1. OPEN (0-9): your lap, the plaza behind, the bay in front, back to the glass =====================
SHOT_FN.open = (lt, dur, t) => { const S = drawWorld(t), st = S.st;
  if (t < 3.2) lapLook(st, t);
  else if (t < 8.0) { const y = knots([[3.2, 0.0], [4.3, 2.79], [5.6, 2.5], [7.2, 0.25], [8.0, 0.15]], t), p = knots([[3.2, -1.0], [4.3, -0.04], [5.6, -0.02], [7.2, 0.02], [8.0, -0.25]], t); look(st, y, p, 58); handheld(st.cam, t, 0.8, 1); }
  else { const k = EZ.io(seg(t, 8.0, 8.8)); if (k < 1) { look(st, 0.15 * (1 - k), lerp(-0.25, -1.05, k), lerp(58, 66, k)); } else lapLook(st, t); }
  finish(S, st, t); };
// ===================== 2. GONE (9-15): the glass is empty; legs frozen in mid-stride past your lap =====================
SHOT_FN.gone = (lt, dur, t) => { const S = drawWorld(t), st = S.st; camLook(st.cam, 0.02, 1.27, BENCHZ + 0.46, 0.04 + 0.02 * lt, 0.66 + 0.02 * lt, BENCHZ - 0.3 - 0.05 * lt); fov(st, 64); handheld(st.cam, t, 0.5, 2); finish(S, st, t); };
// ===================== 3. FOUNTAIN (15-22): turn to the plaza: the dry fountain, kids frozen =====================
SHOT_FN.fountain = (lt, dur, t) => { const S = drawWorld(t), st = S.st; const y = knots([[15, 0.1], [16.8, 2.78], [22, 2.62]], t), p = knots([[15, -0.9], [16.8, -0.07], [22, -0.05]], t); look(st, y, p, lerp(54, 36, ss(15.8, 18, t))); handheld(st.cam, t, 0.7, 3); finish(S, st, t); };
// ===================== 4. LAP (22-26) =====================
SHOT_FN.lap = (lt, dur, t) => { const S = drawWorld(t), st = S.st; if (lt < 1.2) { const k = EZ.io(seg(lt, 0, 1.2)); look(st, lerp(2.45, 0.1, k), lerp(-0.03, -1.05, k), lerp(54, 66, k)); } else lapLook(st, t, 62); handheld(st.cam, t, 0.5, 4); finish(S, st, t); };
// ===================== 5. BAY (26-36): up over the railing: the empty bay, the boats on the mud =====================
SHOT_FN.bay = (lt, dur, t) => { const S = drawWorld(t), st = S.st; const y = knots([[26, 0.0], [27.6, 0.3], [32, -0.35], [36, -0.62]], t), p = knots([[26, -1.0], [27.6, -0.24], [32, -0.2], [36, -0.16]], t); look(st, y, p, 56, [0, 0.25 * ss(26, 28, t), 0]); handheld(st.cam, t, 0.7, 5); finish(S, st, t); };
// ===================== 6. RAIL (36-44): the people at the railing, frozen =====================
SHOT_FN.rail = (lt, dur, t) => { const S = drawWorld(t), st = S.st; const y = knots([[36, -0.62], [38.2, -0.5], [40.5, 0.35], [44, 0.62]], t), p = knots([[36, -0.16], [38.2, -0.04], [44, -0.02]], t); look(st, y, p, 52); handheld(st.cam, t, 0.7, 6); finish(S, st, t); };
// ===================== 7. PLAZA (44-50): the plaza; the puppy's wet nose (water inside the living) =====================
SHOT_FN.plaza = (lt, dur, t) => { const S = drawWorld(t), st = S.st; const y = knots([[44, 0.62], [45.6, 2.7], [50, 2.5]], t); look(st, y, -0.05, lerp(56, 40, ss(45.6, 48, t))); handheld(st.cam, t, 0.6, 7); finish(S, st, t); };
// ===================== 8. REACH (50-56.5): you lift the empty glass toward the bay; silence =====================
SHOT_FN.reach = (lt, dur, t) => { const S = drawWorld(t, ss(50.6, 53.5, t)), st = S.st; const p = knots([[50, -0.9], [51.5, -0.32], [56.5, -0.12]], t); look(st, 0.02 + 0.05 * Math.sin(t * 0.3), p, 60); handheld(st.cam, t, 0.6 + 1.2 * ss(53, 56, t), 8); finish(S, st, t); };
// ===================== 9. WAVE (56.5-64): the sea comes back and slams over the railing =====================
SHOT_FN.wave = (lt, dur, t) => { const S = drawWorld(t, 1 - ss(T_BACK + WV.ARRIVE + 1.5, T_BACK + 4.5, t)), st = S.st, tb = t - T_BACK, hit = ss(WV.ARRIVE - 0.05, WV.ARRIVE + 0.1, tb) * (1 - ss(WV.ARRIVE + 0.3, WV.ARRIVE + 2.4, tb));
  if (tb < 5.4) { const y = knots([[0, 0.02], [WV.ARRIVE, 0.05], [WV.ARRIVE + 0.6, 0.38], [5.4, 0.55]], tb), p = knots([[0, -0.1], [WV.ARRIVE - 0.4, -0.06], [WV.ARRIVE + 0.3, 0.12], [5.4, -0.12]], tb); look(st, y, p, 60, [0, 0.12 * ss(WV.ARRIVE, WV.ARRIVE + 0.5, tb), 0]); }
  else { const k = EZ.io(seg(tb, 5.4, 6.2)); if (k < 1) look(st, lerp(0.55, 0.1, k), lerp(-0.12, -1.05, k), lerp(60, 66, k)); else lapLook(st, t); }
  handheld(st.cam, t, 0.8 + 9 * hit, 9); finish(S, st, t, { bloom: 0.25 + 0.3 * hit }); lensDrops(tb); };
SHOT_FN.card = () => {};
