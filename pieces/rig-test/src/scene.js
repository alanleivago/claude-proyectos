// =====================================================================
//  RIG TEST — one Flow image of the woven hero, rigged as a mesh puppet (src/rig.js), 12 s:
//  idle breathing -> wave -> grab the planted sword -> raise it overhead -> point -> walk across.
//  Poses are written as WORLD angles in degrees (0 = facing right, 90 = straight down, -90 = straight up);
//  toDeltas() turns them into the per-bone rotations rig.js wants.
// =====================================================================
const STYLE = { ones: true };
const FPS = 24, W = 1920, H = 1080, DUR = 12, NF = DUR * FPS;
const GROUND = 978, SCALE = 0.47;
const RIGD = RIG_LINK;
let R = null;
const J = RIGD.joints;
const REST = Object.fromEntries(RIGD.bones.map((b) => [b.name, Math.atan2(J[b.tail][1] - J[b.head][1], J[b.tail][0] - J[b.head][0]) * 180 / Math.PI]));
const LEN = Object.fromEntries(RIGD.bones.map((b) => [b.name, Math.hypot(J[b.tail][0] - J[b.head][0], J[b.tail][1] - J[b.head][1])]));
const PARENT = Object.fromEntries(RIGD.bones.map((b) => [b.name, b.parent]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const ss = (a, b, t) => { const x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;
const TAU = Math.PI * 2, D = Math.PI / 180;

function toDeltas(abs) {                       // world angles -> rotations relative to rest, down the hierarchy
  const world = {}, b = {};
  for (const bone of RIGD.bones) {
    const n = bone.name, p = PARENT[n];
    const pDelta = p ? world[p] - REST[p] : 0;
    world[n] = abs[n] != null ? abs[n] : REST[n] + pDelta;
    b[n] = world[n] - REST[n] - pDelta;
  }
  return b;
}
// the hero standing: legs straightened from the stride of the source image, feet flat, arms hanging
const FLAT = { footB: 51, footF: 44 };
const STAND = {
  pelvis: -90, chest: -88, head: -85,
  uarmF: 84, farmF: 80, handF: 82, uarmB: 99, farmB: 97, handB: 102,
  thighB: 94, shinB: 95, footB: FLAT.footB, thighF: 86, shinF: 88, footF: FLAT.footF,
};
const SOLE = { footB: [[112, 1292], [285, 1298]], footF: [[495, 1297], [690, 1232]] };
const GRIP = [585, 826];                       // where the planted sword's grip stands, in source pixels
const PALM = 0.45;                             // grip sits this far along the hand bone

// char-space solve (root = identity): positions in source pixels
const charPose = (abs, sc) => ({ x: RIGD.anchor[0], y: RIGD.anchor[1], s: 1, b: toDeltas(abs), sc });
function ik2(abs, target, up, lo, hand) {      // two-bone IK: put the wrist where the palm lands on target
  const { Wm } = R.solve(charPose(abs));
  const bi = R.bones.findIndex((b) => b.name === up), S0 = [Wm[bi][4], Wm[bi][5]];
  const hd = abs[hand] * D, wr = [target[0] - Math.cos(hd) * LEN[hand] * PALM, target[1] - Math.sin(hd) * LEN[hand] * PALM];
  const l1 = LEN[up], l2 = LEN[lo], dx = wr[0] - S0[0], dy = wr[1] - S0[1];
  const d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 1, l1 + l2 - 0.5);
  const a = Math.atan2(dy, dx), al = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const u = a + al, E = [S0[0] + Math.cos(u) * l1, S0[1] + Math.sin(u) * l1];
  return { ...abs, [up]: u / D, [lo]: Math.atan2(wr[1] - E[1], wr[0] - E[0]) / D };
}
function lowest(abs) {                         // lowest sole point in char space (for ground contact)
  const { skin } = R.solve(charPose(abs)); let y = -1e9;
  for (const f of ['footB', 'footF']) { const m = skin[R.bones.findIndex((b) => b.name === f)];
    for (const [px, py] of SOLE[f]) y = Math.max(y, m[1] * px + m[3] * py + m[5]); }
  return y;
}

// ---- the walk cycle (1 cycle per second = 2 steps), amplitude k in 0..1
const wrap = (x) => x - Math.round(x);
const bump = (p, c, w) => Math.exp(-((wrap(p - c) / w) ** 2));
function walkLegs(abs, ph, k) {
  for (const [side, off] of [['F', 0], ['B', 0.5]]) {
    const p = ph + off;
    const th = 90 - 24 * Math.sin(TAU * p) * k;
    const bend = (5 + 52 * Math.max(0, Math.cos(TAU * (p + 0.09))) ** 1.3) * k;
    const lift = side === 'F' ? 30 * bump(p, 0.13, 0.09) * k : 0;   // the near leg is drawn longer: lift it before heel strike
    abs['thigh' + side] = lerp(STAND['thigh' + side], th, k);
    abs['shin' + side] = abs['thigh' + side] + lerp(STAND['shin' + side] - STAND['thigh' + side], bend, k) + lift;
    abs['foot' + side] = FLAT['foot' + side] + k * (12 * bump(p, -0.2, 0.08) - 14 * bump(p, 0.2, 0.08));
  }
  abs.uarmB = 99 - 22 * Math.sin(TAU * ph) * k; abs.farmB = abs.uarmB - 8 - 6 * k; abs.handB = abs.farmB + 4;
  return abs;
}

// ---- the five beats; each is a full pose function of t, blended into the next over BL seconds
const T_WAVE = 2.0, T_REACH = 4.0, T_GRAB = 4.75, T_RAISE = 5.05, T_POINT = 7.0, T_WALK = 8.55, BL = 0.5;
const breath = (t) => Math.sin(TAU * t / 2.6);
function idle(t) {
  const a = { ...STAND }; const br = breath(t);
  return { abs: a, sc: { chest: [1, 1 + 0.018 * (br * 0.5 + 0.5)] }, sword: { planted: true } };
}
function wave(t) {
  const P = idle(t), a = P.abs, u = t - T_WAVE;
  const w = Math.sin(TAU * 2.1 * (u - 0.35)) * ss(0.25, 0.55, u);
  a.uarmF = -30; a.farmF = -78 + 22 * w; a.handF = a.farmF - 6 + 14 * w;
  a.head = -88; a.chest = -90;
  return P;
}
function reach(t) {
  const P = idle(t), a = P.abs;
  a.pelvis = -86; a.chest = -72; a.head = -78; a.handF = 80;
  P.abs = ik2(a, GRIP, 'uarmF', 'farmF', 'handF');
  if (t >= T_GRAB) P.sword = { hand: true };
  return P;
}
let ROT_GRAB = null;                            // the sword's angle in the hand at the moment of the grab (no pop)
const swordRot = () => (ROT_GRAB ??= 90 - reach(T_GRAB).abs.handF);
function raise(t) {
  const P = idle(t), a = P.abs, u = t - T_RAISE;
  const shake = 0;
  a.pelvis = -91; a.chest = -93; a.head = -78;
  a.uarmF = -30 + shake; a.farmF = -62 + shake; a.handF = -52;
  a.thighF = 82; a.thighB = 98;                  // a wider, prouder stance
  P.sword = { hand: true, rot: lerp(swordRot(), -96 - a.handF, ss(0, 1.1, u)) };
  return P;
}
function point(t) {
  const P = idle(t), a = P.abs;
  a.pelvis = -89; a.chest = -83; a.head = -86;
  a.uarmF = -4; a.farmF = -2; a.handF = 2;
  P.sword = { hand: true, rot: -4 - a.handF };
  return P;
}
const WALK_AMP = (t) => ss(T_WALK, T_WALK + 0.7, t);
function walk(t) {
  const P = idle(t), a = P.abs, k = WALK_AMP(t), ph = (t - T_WALK) * 1.0;
  walkLegs(a, ph, k);
  a.pelvis = -88; a.chest = -82 + 1.5 * Math.sin(TAU * 2 * ph) * k; a.head = -84;
  a.uarmF = 62 + 7 * Math.sin(TAU * ph) * k; a.farmF = 18; a.handF = 8;
  P.sword = { hand: true, rot: -44 - a.handF };
  return P;
}
const BEATS = [[0, idle], [T_WAVE, wave, 0.55], [T_REACH, reach, BL], [T_RAISE, raise, 0.85], [T_POINT, point, 0.7], [T_WALK, walk, 0.6]];
function mix(A, B, k) {
  const abs = {}; for (const n in A.abs) abs[n] = lerp(A.abs[n], B.abs[n], k);
  const sc = { chest: [1, lerp(A.sc.chest[1], B.sc.chest[1], k)] };
  let sword = B.sword;
  if (A.sword.hand && B.sword.hand) sword = { hand: true, rot: lerp(A.sword.rot ?? swordRot(), B.sword.rot ?? swordRot(), k) };
  return { abs, sc, sword };
}
function poseAt(t) {
  let i = 0; while (i + 1 < BEATS.length && t >= BEATS[i + 1][0]) i++;
  let P = BEATS[i][1](t);
  if (i > 0) { const k = ss(BEATS[i][0], BEATS[i][0] + BEATS[i][2], t); if (k < 1) P = mix(BEATS[i - 1][1](t), P, k); }
  // always alive: breathing, a slow head drift and a little arm sway on top of every beat (no dead holds)
  const br = breath(t), a = P.abs;
  a.chest += 0.9 * br; a.head += 1.6 * Math.sin(TAU * t / 3.7) - 0.6 * br;
  a.uarmF += 1.6 * Math.sin(TAU * t / 3.1 + 1); a.farmF += 1.2 * Math.sin(TAU * t / 2.3); a.uarmB -= 1.4 * br;
  if (t >= T_REACH + BL && t < T_RAISE) P.abs = ik2(a, GRIP, 'uarmF', 'farmF', 'handF');   // hand stays ON the grip
  return P;
}

// ---- root: stand where the sword is planted, walk off to the right with no foot sliding
const X0 = 620;
let VWALK = null;
function walkSpeed() {                          // screen px/s that keeps the stance foot still
  if (VWALK != null) return VWALK;
  const ank = (ph) => { const a = walkLegs({ ...STAND, pelvis: -88, chest: -82, head: -84 }, ph, 1);
    const { Wm } = R.solve(charPose(a)); const m = Wm[R.bones.findIndex((b) => b.name === 'footF')]; return m[4]; };
  return (VWALK = -(ank(0.6) - ank(0.4)) / 0.2 * SCALE);
}
function soles(abs) {                          // sole points of both feet in char space: [[x, y] heel, toe] per foot
  const { skin } = R.solve(charPose(abs));
  return ['footB', 'footF'].map((f) => { const m = skin[R.bones.findIndex((b) => b.name === f)];
    return SOLE[f].map(([px, py]) => [m[0] * px + m[2] * py + m[4], m[1] * px + m[3] * py + m[5]]); });
}
// which foot is on the ground: the leg whose thigh swings backward (0 = footB, 1 = footF)
const lowFoot = (so) => (Math.max(so[1][0][1], so[1][1][1]) > Math.max(so[0][0][1], so[0][1][1]) ? 1 : 0);
const phaseFoot = (t) => (Math.cos(TAU * (t - T_WALK)) < 0 ? 1 : 0);
const stanceFoot = phaseFoot;
// no foot sliding: integrate the root so the lowest sole point (the planted one) stays put on the cloth
const RX_STEP = 1 / 96;
const RX_CACHE = new Map();
function rootX(t) {
  if (t <= T_WALK) return X0;
  const key = Math.round(t * 960); if (RX_CACHE.has(key)) return RX_CACHE.get(key);
  let x = X0, prev = soles(poseAt(T_WALK).abs);
  for (let u = T_WALK + RX_STEP; ; u += RX_STEP) {
    const tt = Math.min(u, t), cur = soles(poseAt(tt).abs);
    const f = phaseFoot(tt - RX_STEP / 2);        // the planted foot comes from the gait phase, its lower sole point
    const best = [f, prev[f][0][1] > prev[f][1][1] ? 0 : 1];
    x -= (cur[best[0]][best[1]][0] - prev[best[0]][best[1]][0]) * SCALE;
    prev = cur; if (tt >= t) break;
  }
  RX_CACHE.set(key, x); return x;
}
let GROUND_STAND = null;
function frame(t) {
  const P = poseAt(t);
  let low = lowest(P.abs);
  GROUND_STAND ??= lowest(STAND);
  const y = GROUND - SCALE * ((t < T_WALK ? GROUND_STAND : low) - RIGD.anchor[1]);
  const pose = { x: rootX(t), y, s: SCALE, b: toDeltas(P.abs), sc: P.sc, props: {} };
  if (P.sword.planted) pose.props.sword = { parent: null, at: GRIP, rot: 90, slot: 'armF' };
  else pose.props.sword = { parent: 'handF', at: [PALM, 0], rot: P.sword.rot ?? swordRot(), slot: 'armF' };
  // standing beats keep the ground under the standing feet (the planted sword must not bob)
  if (t >= T_WALK) pose.y = GROUND - SCALE * (lerp(GROUND_STAND, low, WALK_AMP(t)) - RIGD.anchor[1]);
  return pose;
}

const TIMELINE = { width: W, height: H, fps: FPS, frames: NF, duration: DUR, gpu: true };
window.TIMELINE = TIMELINE;
const cmain = document.getElementById('c');
window.renderFrame = (t, cv = cmain) => {
  if (!R) R = Rig.create(RIGD, ASSETS, { prefix: 'link_' });
  const g = cv.getContext('2d');
  g.drawImage(ASSETS['bg.jpg'], 0, 0, W, H);
  const pose = frame(t);
  R.draw(pose, { width: W, height: H });
  g.drawImage(R.canvas, 0, 0);
  if (window.RIG_BONES) R.bonesOverlay(g, pose);
};
// close-up check of the deformation: any pose (world angles over STAND), any scale, any place, skeleton optional
window.renderCloseup = (cv, over, s, x, y, bones) => {
  if (!R) R = Rig.create(RIGD, ASSETS, { prefix: 'link_' });
  const g = cv.getContext('2d'); g.drawImage(ASSETS['bg.jpg'], 0, 0, cv.width, cv.height);
  const pose = { x, y, s, b: toDeltas({ ...STAND, ...over }), sc: {} };
  R.draw(pose, { width: cv.width, height: cv.height }); g.drawImage(R.canvas, 0, 0);
  if (bones) R.bonesOverlay(g, pose);
};
if (!/export=1/.test(location.search)) {
  let t0 = null; const loop = (ts) => { if (window.renderFrame && window.ASSETS_READY) { t0 ??= ts; window.renderFrame(((ts - t0) / 1000) % DUR); } requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
