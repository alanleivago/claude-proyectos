// =====================================================================
//  PUPPETS — Link, Impa and Sheik as mesh puppets (src/rig.js, rigs/*.json -> tools/rig_build.py), profile only.
//  Poses are WORLD angles in degrees (0 = facing right, 90 = down, -90 = up); toDeltas() turns them into bone rotations.
//  Joint bends are kept at 70 deg or less (LBS reads clean up to there).
//  puppet(name, x, y, h, abs, o): feet on the ground at (x, y), figure height h, o.flip faces left, o.a alpha.
// =====================================================================
const PUP = {};
const PUP_DEF = {
  link: { data: () => RIG_LINK, flat: { footB: 51, footF: 44 }, figH: 1290,
    sole: { footB: [[112, 1292], [285, 1298]], footF: [[495, 1297], [690, 1232]] } },
  impa: { data: () => RIG_IMPA, flat: { footB: 30, footF: 34 }, figH: 1290,
    sole: { footB: [[60, 1190], [205, 1300]], footF: [[470, 1300], [600, 1295]] } },
  sheik: { data: () => RIG_SHEIK, flat: { footB: 18, footF: 16 }, figH: 1290,
    sole: { footB: [[40, 1250], [170, 1300]], footF: [[480, 1270], [650, 1260]] } },
};
const PUP_BOX = [1100, 1600], PUP_ANCHOR = [550, 1540];
function pup(name) {
  if (PUP[name]) return PUP[name];
  const D = PUP_DEF[name], RD = D.data(), J = RD.joints;
  const REST = Object.fromEntries(RD.bones.map((b) => [b.name, Math.atan2(J[b.tail][1] - J[b.head][1], J[b.tail][0] - J[b.head][0]) * 180 / Math.PI]));
  const LEN = Object.fromEntries(RD.bones.map((b) => [b.name, Math.hypot(J[b.tail][0] - J[b.head][0], J[b.tail][1] - J[b.head][1])]));
  const PARENT = Object.fromEntries(RD.bones.map((b) => [b.name, b.parent]));
  const STAND = { pelvis: -90, chest: -88, head: -86, uarmF: 84, farmF: 80, handF: 82, uarmB: 99, farmB: 97, handB: 102,
    thighB: 94, shinB: 95, footB: D.flat.footB, thighF: 86, shinF: 88, footF: D.flat.footF };
  const R = Rig.create(RD, ASSETS, { prefix: name + '_' });
  const P = { name, D, RD, REST, LEN, PARENT, STAND, R, bi: (n) => R.bones.findIndex((b) => b.name === n) };
  P.toDeltas = (abs) => { const world = {}, b = {}; for (const bone of RD.bones) { const n = bone.name, p = PARENT[n], pd = p ? world[p] - REST[p] : 0; world[n] = abs[n] != null ? abs[n] : REST[n] + pd; b[n] = world[n] - REST[n] - pd; } return b; };
  P.charPose = (abs) => ({ x: RD.anchor[0], y: RD.anchor[1], s: 1, b: P.toDeltas(abs) });
  P.lowest = (abs) => { const { skin } = R.solve(P.charPose(abs)); let y = -1e9; for (const f of ['footB', 'footF']) { const m = skin[P.bi(f)]; for (const [px, py] of D.sole[f]) y = Math.max(y, m[1] * px + m[3] * py + m[5]); } return y; };
  // the stance foot's speed in source px per second of gait phase (1 cycle / s): keeps the planted foot still
  const ank = (ph) => { const a = walkLegs(P, { ...STAND }, ph, 1); const { Wm } = R.solve(P.charPose(a)); return Wm[P.bi('footF')][4]; };
  P.speed = -(ank(0.6) - ank(0.4)) / 0.2;
  PUP[name] = P; return P;
}
const PTAU = Math.PI * 2;
const pwrap = (x) => x - Math.round(x), pbump = (p, c, w) => Math.exp(-((pwrap(p - c) / w) ** 2));
function walkLegs(P, abs, ph, k) {
  const S = P.STAND;
  for (const [side, off] of [['F', 0], ['B', 0.5]]) {
    const p = ph + off, th = 90 - 22 * Math.sin(PTAU * p) * k, bend = (5 + 48 * Math.max(0, Math.cos(PTAU * (p + 0.09))) ** 1.3) * k;
    const lift = side === 'F' ? 26 * pbump(p, 0.13, 0.09) * k : 0;
    abs['thigh' + side] = lerp(S['thigh' + side], th, k);
    abs['shin' + side] = abs['thigh' + side] + lerp(S['shin' + side] - S['thigh' + side], bend, k) + lift;
    abs['foot' + side] = S['foot' + side] + k * (12 * pbump(p, -0.2, 0.08) - 14 * pbump(p, 0.2, 0.08));
  }
  abs.uarmB = 99 - 20 * Math.sin(PTAU * ph) * k; abs.farmB = abs.uarmB - 8 - 6 * k; abs.handB = abs.farmB + 4;
  return abs;
}
// a pose: STAND + overrides, breathing and a slow head drift so no hold is dead
function stance(name, over = {}, key = 0) {
  const P = pup(name), a = { ...P.STAND, ...over }, br = Math.sin(PTAU * (TT + key) / 2.6);
  a.chest += 0.9 * br; a.head += 1.5 * Math.sin(PTAU * (TT + key) / 3.7) - 0.5 * br; a.uarmF += 1.4 * Math.sin(PTAU * (TT + key) / 3.1 + 1); a.uarmB -= 1.2 * br;
  return a;
}
const mixAbs = (A, B, k) => { const o = {}; for (const n in A) o[n] = lerp(A[n], B[n] ?? A[n], k); return o; };
// walk window: gait amplitude ramps in and out; root distance integrated so the planted foot does not slide
function walkK(t, t0, d, ramp = 0.45) { return Math.min(EZ.io(clamp((t - t0) / ramp)), 1 - EZ.io(clamp((t - (t0 + d - ramp)) / ramp))); }
function walkDist(t, t0, d, ramp = 0.45) { let s = 0; const dt = 1 / 48; for (let u = t0; u < Math.min(t, t0 + d); u += dt) s += walkK(u + dt / 2, t0, d, ramp) * dt; return s; }
// draw a puppet: feet at (x, y), height h
function puppet(name, x, y, h, abs, o = {}) {
  if ((o.a ?? 1) <= 0.003) return null;
  const P = pup(name), s = h / P.D.figH, low = P.lowest(abs);
  const pose = { x: PUP_ANCHOR[0], y: PUP_ANCHOR[1] - s * (low - P.RD.anchor[1]), s, b: P.toDeltas(abs), sc: o.sc || {}, props: o.props || {}, hide: o.hide || undefined };
  P.R.draw(pose, { width: PUP_BOX[0], height: PUP_BOX[1] });
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y); if (o.flip) ctx.scale(-1, 1); ctx.rotate(o.rot ?? 0);
  if (o.shadow !== false) { ctx.save(); ctx.globalAlpha *= 0.4; ctx.fillStyle = '#120c18'; ctx.beginPath(); ctx.ellipse(0, -4, h * 0.2, 14, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.drawImage(P.R.canvas, -PUP_ANCHOR[0], -PUP_ANCHOR[1]); ctx.restore();
  // where a bone is on screen (for props drawn in 2D: the lens, the sword)
  const { Wm } = P.R.solve(pose), fx = o.flip ? -1 : 1;
  return { bone: (n, f = 1) => { const m = Wm[P.bi(n)], L = P.LEN[n] * s * f / s; const bx = m[4] + m[0] * P.LEN[n] * f, by = m[5] + m[1] * P.LEN[n] * f; return { x: x + fx * (bx - PUP_ANCHOR[0]), y: y + (by - PUP_ANCHOR[1]), ang: Math.atan2(m[1], m[0] * fx) }; } };
}
// the Dead Hand arms: a 3-bone puppet (rigs/hand.json) rising from its mound; the elbow and wrist curl in a grabbing
// rhythm (bends <= 60 deg). Feet of the mound at (x, y), height h, phase key.
let HAND_R = null;
function deadArm(x, y, h, key, o = {}) {
  if ((o.a ?? 1) <= 0.003) return;
  HAND_R ??= Rig.create(RIG_HAND, ASSETS, { prefix: 'hand_' });
  const s = h / 1330, t = TT * (o.rate ?? 1.3) + key, g = 0.5 - 0.5 * Math.cos(PTAU * t * 0.55);   // g: 0 open .. 1 clutched
  const b = { root: 0, upper: (o.lean ?? 0) + 7 * Math.sin(t * 1.1), fore: -12 - 34 * g + 4 * Math.sin(t * 2.3), palm: -10 - 48 * g };
  HAND_R.draw({ x: 400, y: 1460, s, b }, { width: 800, height: 1500 });
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y); if (o.flip) ctx.scale(-1, 1); ctx.drawImage(HAND_R.canvas, -400, -1460); ctx.restore();
}
