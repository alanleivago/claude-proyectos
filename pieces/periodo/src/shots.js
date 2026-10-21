
// =====================================================================
//  SHOTS — each place on its own stage, a slow handheld camera move per shot
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const hh = (st, t, a, s) => handheld(st.cam, t, a, s);
SHOT_FN.gym = (lt, dur, t) => { const S = once('gym', buildGym), st = S.st; poseGym(S, t); const k = EZ.io(seg(t, 0, 6)), hit = ss(3.5, 3.7, t) * (1 - ss(3.9, 4.6, t));
  _cam(st, [lerp(1.4, 0.7, k), lerp(1.5, 1.2, k), lerp(2.6, 1.6, k)], [0, lerp(1.2, 0.9, k), -1.2], 50); hh(st, t, 0.6 + 4 * hit, 1); renderStage(st, 1.0); bloom(0.2); };
SHOT_FN.street = (lt, dur, t) => { const S = once('street', buildStreet), st = S.st; poseStreet(S, t); const k = EZ.io(seg(t, 6, 11)); _cam(st, [lerp(-2.4, 2.4, k), 1.75, 5.2], [lerp(-1.2, 1.2, k), 0.9, -1.4], 56); hh(st, t, 0.6, 2); renderStage(st, 1.05); bloom(0.2); };
SHOT_FN.ball = (lt, dur, t) => { const S = once('ball', buildBall), st = S.st; poseBall(S, t);
  if (t < 15) { const k = EZ.io(seg(t, 11, 15)); _cam(st, [lerp(-4, 4, k), 13, 24], [0, 0, -16], 50); } else { const k = EZ.io(seg(t, 15, 19)); const u = ss(17.6, 18.8, t); _cam(st, [lerp(-3.4, -2.6, k), lerp(1.5, 1.7, k), lerp(3.4, 2.8, k)], [lerp(1, 0, u), lerp(0.3, 16, u), lerp(-0.6, -116, u)], lerp(48, 38, u)); }
  hh(st, t, 0.6, 3); renderStage(st, 1.05); bloom(0.2); };
SHOT_FN.site = (lt, dur, t) => { const S = once('site', buildSite), st = S.st; poseSite(S, t); const k = EZ.io(seg(t, 19, 26)); _cam(st, [lerp(-1, 2, k), lerp(2.2, 1.6, k), lerp(8.5, 6.2, k)], [0, lerp(1.6, 0.7, k), 0.6], 52); hh(st, t, 0.6, 4); renderStage(st, 1.05); bloom(0.2); };
SHOT_FN.market = (lt, dur, t) => { const S = once('market', buildMarket), st = S.st; poseMarket(S, t); const k = EZ.io(seg(t, 26, 34)), z = -6 + (t - 26) * 0.55;
  if (t < 30.5) _cam(st, [lerp(-0.6, 0.6, k), 1.7, lerp(10, 8, k)], [0, 1.1, -4], 50); else _cam(st, [0.9, 1.55, z + 2.2], [0, 1.25, z], 46); hh(st, t, 0.6, 5); renderStage(st, 1.0); bloom(0.2); };
SHOT_FN.parl = (lt, dur, t) => { const S = once('parl', buildParl), st = S.st; poseParl(S, t);
  if (t < 38) { const k = EZ.io(seg(t, 34, 38)); _cam(st, [lerp(-2, 2, k), 3.0, -3.5], [0, 1.4, 8], 62); } else { const k = EZ.io(seg(t, 38, 40)); _cam(st, [0, lerp(5, 6.5, k), lerp(8, 4, k)], [0, 7.0, -16.9], 52); }
  hh(st, t, 0.5, 6); renderStage(st, 1.0); bloom(0.25); };
SHOT_FN.office = (lt, dur, t) => { const S = once('office', buildOffice), st = S.st; poseOffice(S, t); const k = EZ.io(seg(t, 43, 50)); _cam(st, [lerp(-4.5, 3.5, k), 1.6, 3.0], [lerp(-2.5, 4.5, k), 1.1, -1.6], 58); hh(st, t, 0.5, 7); renderStage(st, 1.05); bloom(0.2); };
SHOT_FN.dusk = (lt, dur, t) => { const S = once('dusk', buildDusk), st = S.st; poseDusk(S, t);
  if (t < 52.6) _cam(st, [-2.2, 1.4, 3.4], [0.3, 0.9, -2], 50); else { const k = EZ.io(seg(t, 52.6, 56)); _cam(st, [lerp(-0.6, 0.6, k), 1.6, lerp(3.6, 2.4, k)], [2.2, 1.5, 0.1], lerp(42, 34, k)); }
  hh(st, t, 0.5, 8); renderStage(st, 1.0); bloom(0.25); };
SHOT_FN.card = () => {};
