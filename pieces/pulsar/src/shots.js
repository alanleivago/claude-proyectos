
// =====================================================================
//  SHOTS — one place, the fair; the camera stands at the railing and turns to the sky, the wheel, the people
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const T_APPEAR = 9.0, T_FLARE = 44.0, T_SHOCK = 51.0;
function state(t) { const pulse = (t - 16) / 1.5, ph = pulse - Math.floor(pulse);
  return { P: ss(T_APPEAR, T_APPEAR + 2.5, t) * (1 - 0.6 * ss(59, 62, t)), beam: t < 16 ? 0 : Math.exp(-((ph - 0.5) ** 2) * 60) * (t < 34 ? 1 : 1.5) * (1 - ss(44, 44.2, t)) + 0.2 * ss(16, 18, t) * (1 - ss(44, 44.2, t)),
    beamA: t * TAU / 1.5, aur: ss(24, 30, t) * (1 - ss(60, 64, t)) + 0.6 * ss(44.5, 46, t) * (1 - ss(58, 62, t)), flare: t < T_FLARE ? 0 : Math.max(ss(T_FLARE, T_FLARE + 0.2, t) * (1 - ss(T_FLARE + 0.4, 52, t) * 0.55), 0) * (1 - ss(56, 60, t)),
    brown: ss(64, 67, t), sat: ss(59.5, 60.5, t) * (1 - ss(65, 66, t)), out: ss(T_SHOCK + 1.2, T_SHOCK + 3.5, t), look: ss(T_APPEAR + 1, T_APPEAR + 2.5, t), panic: ss(T_FLARE + 0.3, T_FLARE + 1.2, t) * (1 - ss(62, 66, t)) }; }
function lookF(st, yaw, pitch, f = 58, dp = [0, 0, 0]) { const x = 0.4 + dp[0], y = 1.65 + dp[1], z = 2.6 + dp[2], a = yaw * DEG, p = pitch * DEG; camLook(st.cam, x, y, z, x - Math.sin(a) * 10 * Math.cos(p), y + 10 * Math.sin(p), z - Math.cos(a) * 10 * Math.cos(p)); st.cam.fov = f; st.cam.updateProjectionMatrix(); }
const YAWK = [[0, 8], [5, 32], [8.5, 6], [12, -12], [16, -16], [22, -24], [28, 10], [34, -14], [40, -18], [43.9, -18], [45, -14], [49, 14], [52, 160], [55, 175], [58, 150], [62, 20], [68, -6], [71, -6]];
const PITK = [[0, 4], [5, 16], [8.5, 12], [12, 26], [16, 30], [22, 34], [28, 16], [34, 30], [40, 30], [43.9, 30], [45, 22], [49, 16], [52, 4], [55, -4], [58, 4], [62, 30], [68, 10], [71, 10]];
function fairShot(lt, dur, t) { const S = once('fair', buildFair), st = S.st, s = state(t); SKY.uP.value = s.P; SKY.uBeam.value = s.beam; SKY.uAur.value = s.aur; SKY.uFlare.value = s.flare; SKY.uBrown.value = s.brown; SKY.uSat.value = s.sat;
  const b = s.beamA; SKY.uQ.value.set(Math.cos(b), Math.sin(b) * 0.6, Math.sin(b)).normalize(); poseFair(S, t, s);
  const shake = ss(T_SHOCK, T_SHOCK + 0.3, t) * (1 - ss(T_SHOCK + 1.0, T_SHOCK + 4, t));
  lookF(st, knots(YAWK, t), knots(PITK, t), 60 + 6 * s.flare); handheld(st.cam, t, 0.6 + 8 * shake, 1);
  renderReflectionF(S, st); renderStage(st, 1.0 - 0.3 * s.flare); bloom(0.55 + 0.4 * s.flare); }
SHOT_FN.fair = SHOT_FN.beam = SHOT_FN.mag = SHOT_FN.flare = SHOT_FN.after = fairShot;
SHOT_FN.card = () => {};
