
// =====================================================================
//  SHOTS — the reference's camera, shot by shot: walking with the donut; a slow pan to the pigeons; low angles on
//  the cart and the wheel; down at the manholes; the bridge; up at the domes and the sky; the path with the wedge;
//  down at the road; up at the leaning city; the fold ahead; on the ground; looking up
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const fov = (st, f) => { st.cam.fov = f; st.cam.updateProjectionMatrix(); };
function camPt(st, p, q, f, t, amt = 0.5, seed = 1) { camLook(st.cam, p[0], p[1], p[2], q[0], q[1], q[2]); fov(st, f); handheld(st.cam, t, amt, seed); }
const mixv = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
function park() { return once('park', buildPark); }
const walkZ = (t) => 2 - 1.25 * TS(t);
// look from a point with yaw (degrees, 0 = down the path toward -z, + = left) and pitch
function camYP(st, p, yaw, pitch, f, t, amt = 0.5, seed = 1) { const a = yaw * DEG, pp = pitch * DEG; camLook(st.cam, p[0], p[1], p[2], p[0] - Math.sin(a) * Math.cos(pp) * 10, p[1] + Math.sin(pp) * 10, p[2] - Math.cos(a) * Math.cos(pp) * 10); fov(st, f); handheld(st.cam, t, amt, seed); }
function render(S, st, exp = 1.0, bl = 0.25) { poseSkyPi(S, S.st.cam, TT); renderStage(st, exp * LIGHT.exp); bloom(bl); }
function base(t) { const S = park(); posePark(S, t); placeDonut(S, S.st.cam, 0, 0, t); S.legs.visible = false; return S; }
SHOT_FN.walk = (lt, dur, t) => { const S = base(t), st = S.st, z = walkZ(t), b = 0.035 * Math.sin(TS(t) * 11);
  camYP(st, [0.3, 1.68 + b, z], knots([[0, 0], [3, 3], [5.5, -4], [8, 0]], t), knots([[0, 2], [5, 0], [8, -3]], t), 62, t, 0.4, 1); st.cam.rotation.z += 0.012 * Math.sin(TS(t) * 5.5);
  placeDonut(S, st.cam, ss(6.2, 7.4, t), 0, t); render(S, st); };
SHOT_FN.slow = (lt, dur, t) => { const S = base(t), st = S.st, z = walkZ(t);
  camYP(st, [0.3, 1.68, z], knots([[8, 0], [9.4, 0], [12.5, -38]], t), knots([[8, -3], [9.4, -2], [12.5, 6]], t), 62, t, 0.25, 2);
  placeDonut(S, st.cam, 1 - ss(10.6, 11.6, t), ss(8.4, 9.8, t), t); render(S, st); };
SHOT_FN.cart = (lt, dur, t) => { const S = base(t), st = S.st, u = EZ.io(seg(t, 12.5, 15)); camPt(st, [lerp(2.6, 3.0, u), 0.95, -18.5], [lerp(5.2, 9, u), lerp(3.2, 6.5, u), -26], 58, t, 0.3, 3); render(S, st); };
SHOT_FN.wheels = (lt, dur, t) => { const S = base(t), st = S.st, u = EZ.io(seg(t, 15, 18)); camPt(st, [0.6, 1.4, lerp(-31, -33, u)], [0, 0.9, -45], 54, t, 0.3, 4); render(S, st); };
SHOT_FN.manh = (lt, dur, t) => { const S = base(t), st = S.st, u = EZ.io(seg(t, 18, 23)); camPt(st, [lerp(-0.2, 0.2, u), 0.75, lerp(-31.5, -32.5, u)], [lerp(-3.5, -1.2, u), 0.4, -44], 58, t, 0.35, 5); render(S, st); };
SHOT_FN.bridge = (lt, dur, t) => { const S = base(t), st = S.st, u = EZ.io(seg(t, 23, 25)); camPt(st, [lerp(13, 11.5, u), -1.4, -91], [0, -0.5, -113], 58, t, 0.35, 6); render(S, st); };
SHOT_FN.spin = (lt, dur, t) => { const S = base(t), st = S.st; camYP(st, [0.5, 1.6, -14], knots([[25, -42], [28, -16]], t), knots([[25, 22], [28, 6]], t), 52, t, 0.35, 7); render(S, st); };
SHOT_FN.domes = (lt, dur, t) => { const S = base(t), st = S.st, u = EZ.io(seg(t, 28, 30)); camPt(st, [-3, 5, -112], [lerp(-14, -4, u), 25, -182], 30, t, 0.3, 8); render(S, st); };
SHOT_FN.sun = (lt, dur, t) => { const S = base(t), st = S.st; camYP(st, [0.5, 1.7, -20], -60, 42, 60, t, 0.3, 9); render(S, st); };
SHOT_FN.halo = (lt, dur, t) => { const S = base(t), st = S.st; camYP(st, [0.5, 1.7, -20], knots([[33, -20], [35.5, -6]], t), knots([[33, 30], [35.5, 40]], t), 62, t, 0.3, 10); render(S, st); };
SHOT_FN.moon = (lt, dur, t) => { const S = base(t), st = S.st; camYP(st, [0.5, 1.7, -20], 10, 60, 60, t, 0.3, 11); render(S, st); };
SHOT_FN.wedge = (lt, dur, t) => { const S = base(t), st = S.st; camYP(st, [0.6, 1.65, -19], -8, 2, 60, t, 0.3, 12); render(S, st); };
SHOT_FN.roll = (lt, dur, t) => { const S = base(t), st = S.st; S.ball.position.set(0.2, 0.1, -18.8); S.ball.scale.set(1.08, 0.88, 1.08); camYP(st, [0.5, 1.65, -16], -4, knots([[40, -10], [42, -38]], t), 58, t, 0.3, 13); render(S, st); };
SHOT_FN.roll2 = (lt, dur, t) => { const S = base(t), st = S.st; S.ball.position.set(0.2, 0.1, -18.8); camYP(st, [0.5, 1.65, -16], -4, -38, 58, t, 0.25, 14); placeDonut(S, st.cam, ss(42.0, 42.7, t), 1, t); render(S, st); };
SHOT_FN.planet = (lt, dur, t) => { const S = base(t), st = S.st; camYP(st, [0.4, 1.6, -42], knots([[44, 4], [47, -4]], t), knots([[44, 8], [47, 18]], t), 62, t, 0.35, 15); render(S, st); };
SHOT_FN.clock = (lt, dur, t) => { const S = base(t), st = S.st, u = EZ.io(seg(t, 47, 50)); camPt(st, [lerp(2.6, 3.0, u), 1.55, lerp(-24.5, -25.5, u)], [4.7, 3.6, -30], 52, t, 0.35, 16); render(S, st); };
SHOT_FN.fold = (lt, dur, t) => { const S = base(t), st = S.st; camYP(st, [0.5, 1.7, -38], 0, knots([[50, 2], [52.5, 8]], t), 60, t, 0.5 + 1.5 * ss(50, 52.5, t), 17); render(S, st); };
SHOT_FN.fold2 = (lt, dur, t) => { const S = base(t), st = S.st; camYP(st, [-1.5, 1.3, -50], 6, knots([[52.5, 14], [56, 30]], t), 62, t, 2.2, 18); render(S, st); };
// you are sitting on the cracked path by the clock
function sitMe(S) { S.legs.visible = true; S.legs.position.set(2.2, 0, -25.6); S.crack.position.set(2.0, 0.035, -27.6); }
SHOT_FN.down = (lt, dur, t) => { const S = base(t), st = S.st; sitMe(S); const f = ss(56, 56.4, t); camYP(st, [2.2, lerp(1.6, 1.02, f), -25.5], 0, lerp(-10, -50, f), 62, t, 0.4 + 3 * (1 - ss(56.3, 57, t)), 19); placeDonut(S, st.cam, ss(56.6, 57.2, t) * 0.75, 1, t); render(S, st); };
SHOT_FN.up = (lt, dur, t) => { const S = base(t), st = S.st; sitMe(S); camPt(st, [2.2, 1.02, -25.5], [lerp(4.6, 4.2, seg(t, 60, 65)), 4.4, -30], 56, t, 0.35, 20); render(S, st, 1.0 - 0.9 * ss(63.8, 65, t)); };
SHOT_FN.card = () => {};
