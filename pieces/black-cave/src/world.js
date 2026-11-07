// =====================================================================
//  WORLD — helpers, the person rig (two-bone IK, jointed fingers, fitted grip, poseP) from pieces/gashadokuro; the
//  black-cave sets, the crawler and the people follow below.
// =====================================================================
let R3 = null, WJ = null;
function rend() {
  if (R3) return R3;
  const cv = document.createElement('canvas'); cv.width = YK.LW; cv.height = YK.LH;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: false, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(YK.LW, YK.LH, false); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  R3 = { cv, r }; return R3;
}
const SM = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0 }, o));
const BM = (c, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o));
const shd = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
const capsule = (r, l, mat, n = 8) => shd(new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, n), mat));
const sph = (r, mat, sx = 1, sy = 1, sz = 1, seg = 14) => { const m = shd(new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), mat)); m.scale.set(sx, sy, sz); return m; };
const bx = (w, h, d, mat, x, y, z, par) => { const m = shd(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)); m.position.set(x, y, z); if (par) par.add(m); return m; };
const cyl = (rt, rb, h, mat, seg = 10, open = false) => shd(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), mat));
const UCYL = new THREE.CylinderGeometry(0.8, 1, 1, 10);   // unit limb (tapers toward +y), placed with between()
const UCYL1 = new THREE.CylinderGeometry(1, 1, 1, 8);
const _up = V3(0, 1, 0);
function between(mesh, a, b, r, r2) { const d = b.clone().sub(a), L = d.length(); mesh.position.copy(a).addScaledVector(d, 0.5); mesh.quaternion.setFromUnitVectors(_up, d.normalize()); mesh.scale.set(r, L, r2 ?? r); }
const qBasis = (X, Y, Z) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
function frameOf(U, F) { const u = U.clone().normalize(), f = F.clone().addScaledVector(u, -F.dot(u)).normalize(), x = u.clone().cross(f); return { X: x, Y: u, Z: f }; }
function twoBone(S, T, L1, L2, pole) {
  const d = T.clone().sub(S), len = clamp(d.length(), 0.02, L1 + L2 - 0.002), dir = d.normalize(), a = (L1 * L1 - L2 * L2 + len * len) / (2 * len), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const po = pole.clone().addScaledVector(dir, -pole.dot(dir)).normalize(); return { E: S.clone().addScaledVector(dir, a).addScaledVector(po, h), W: S.clone().addScaledVector(dir, len) };
}
// a tapered tube along points (radius r0 → r1), rings of n sides; o.wob: bark knots
function taperTube(pts, r0, r1, n = 7, seg = 10, o = {}) {
  const c = new THREE.CatmullRomCurve3(pts), F = c.computeFrenetFrames(seg, false), P = [], UV = [], idx = [], R = RNG('tube', o.seed ?? 0), L = c.getLength();
  for (let i = 0; i <= seg; i++) { const u = i / seg, p = c.getPointAt(u), r = lerp(r0, r1, Math.pow(u, 0.8)) * (1 + (o.wob ?? 0.1) * (R.f() - 0.5));
    for (let j = 0; j <= n; j++) { const a = (j / n) * TAU, nn = F.normals[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(F.binormals[i], Math.sin(a)); P.push(p.x + nn.x * r, p.y + nn.y * r, p.z + nn.z * r); UV.push(j / n, u * L / 1.2); } }
  for (let i = 0; i < seg; i++) for (let j = 0; j < n; j++) { const a = i * (n + 1) + j, b = a + n + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function gridAxis(a, b, fine, f = 1, c = 3) { const v = []; let p = a; while (p <= b + 1e-6) { v.push(+p.toFixed(3)); p += fine.some(([u, w]) => p >= u && p < w) ? f : c; } return v; }
function heightMesh(xs, zs, hf, colf, mat) {
  const nx = xs.length, nz = zs.length, P = new Float32Array(nx * nz * 3), C = new Float32Array(nx * nz * 3), UV = new Float32Array(nx * nz * 2), idx = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = xs[i], z = zs[j], k = j * nx + i, h = hf(x, z); P[k * 3] = x; P[k * 3 + 1] = h; P[k * 3 + 2] = z; UV[k * 2] = x / 5; UV[k * 2 + 1] = z / 5; const c = colf(x, z, h); C[k * 3] = c.r; C[k * 3 + 1] = c.g; C[k * 3 + 2] = c.b; }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(C, 3)); g.setAttribute('uv', new THREE.BufferAttribute(UV, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.castShadow = true; return m;
}
function mergeGeos(geos) {
  const P = [], N = [], UV = [], I = []; let off = 0;
  geos.forEach((g) => { const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); UV.push(uv.getX(i), uv.getY(i)); } g.index.array.forEach((v) => I.push(v + off)); off += p.count; });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(I); return g;
}
// grass blades (dry), swaying in the wind (a vertex shader offset from the blade's own position)
const WIND = { value: 0 };
function windMat(mat, amp = 0.1) {
  mat.onBeforeCompile = (sh) => { sh.uniforms.uWind = WIND; sh.vertexShader = 'uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    #ifdef USE_INSTANCING
    vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
    #else
    vec3 ip = vec3(0.);
    #endif
    float hk = max(0., position.y); transformed.x += hk * ${amp.toFixed(3)} * (sin(uWind * 1.7 + ip.x * 0.35 + ip.z * 0.21) + 0.4 * sin(uWind * 3.9 + ip.z * 1.1));
    transformed.z += hk * ${(amp * 0.6).toFixed(3)} * sin(uWind * 1.3 + ip.x * 0.5);`); };
  mat.customProgramCacheKey = () => 'wind' + amp; return mat;
}
function mkGrass(Wd, n, area, hf, avoid, cols, key, hgt = [0.25, 0.8]) {
  const R = RNG('grass', key), gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute([-0.014, 0, 0, 0.014, 0, 0, 0, 1, 0.01, 0.0, 0, 0.012, 0.012, 0, -0.008, 0.02, 0.85, -0.03], 3)); gg.computeVertexNormals();
  const gm = IM(gg, windMat(SM({ color: '#ffffff', side: THREE.DoubleSide }), 0.1), n, false); let c = 0;
  for (let i = 0; i < n * 4 && c < n; i++) { const x = R.r(area[0], area[1]), z = R.r(area[2], area[3]); const a = avoid(x, z); if (a === false) continue; const y = hf(x, z), hh = R.r(hgt[0], hgt[1]) * (a === 'short' ? 0.35 : 1);
    gm.setMatrixAt(c, M4c(x, y - 0.02, z, R.r(0, TAU), R.r(0.7, 1.4), hh, 1, R.n(0.35), R.n(0.35))); gm.setColorAt(c, lin(R.pick(cols))); c++; }
  gm.count = c; Wd.scene.add(gm); return gm;
}
function mkHand(P, sd, mat, nailM) {
  const hg = new THREE.Group(), s = P.pd.hs, fk = P.pd.fk, fr = P.pd.fr, corpo = P.kind === 'corpo'; P.g.add(hg);
  const palm = sph(1, mat, 0.04 * s * (corpo ? 0.85 : 1), 0.016 * s * (corpo ? 0.8 : 1), 0.05 * s); palm.position.z = 0.045 * s; hg.add(palm); hg.userData.f = [];
  const wr = sph(1, mat, 0.03 * s * (corpo ? 0.75 : 1), 0.019 * s, 0.03 * s); hg.add(wr);
  if (corpo) for (let f = 0; f < 4; f++) { const tn = cyl(0.0035 * s, 0.003 * s, 0.07 * s, mat, 4); tn.rotation.x = Math.PI / 2; tn.position.set((f - 1.5) * 0.0165 * -sd * s, 0.012 * s, 0.05 * s); hg.add(tn); }   // tendons on the back of the hand
  for (let f = 0; f < 4; f++) { const kp = V3((f - 1.5) * 0.0175 * -sd * s, 0.003 * s, (0.088 - Math.abs(f - 1.3) * 0.005) * s), kn = sph(0.0095 * s * (corpo ? 0.9 : 1), mat); kn.position.copy(kp); hg.add(kn);
    let par = new THREE.Group(); par.position.copy(kp); par.rotation.y = (f - 1.5) * 0.06 * -sd; hg.add(par); const segs = [], k = (1.18 - Math.abs(f - 1.2) * 0.1) * fk;
    [0.04, 0.028, 0.022].forEach((L0, j) => { const L = L0 * k * s, sg = new THREE.Group(); sg.position.z = j ? segs[j - 1].userData.L : 0; par.add(sg); const r = (0.0078 - j * 0.0012) * s * fr, c = capsule(r, L, mat, 6); c.rotation.x = Math.PI / 2; c.position.z = L / 2; sg.add(c); sg.add(sph(r * (corpo ? 1.45 : 1.05), mat)); sg.userData.L = L; sg.userData.r = r; segs.push(sg); par = sg; });
    if (corpo) { const nl = shd(new THREE.Mesh(new THREE.ConeGeometry(0.0045 * s, 0.026 * s, 5), nailM)); nl.rotation.x = Math.PI / 2 + 0.25; nl.position.set(0, -0.001 * s, segs[2].userData.L + 0.006 * s); segs[2].add(nl); }   // long dark nails like thorns
    else { const nl = sph(1, nailM, 0.0055 * s, 0.002 * s, 0.008 * s); nl.position.set(0, 0.0055 * s, segs[2].userData.L - 0.004 * s); segs[2].add(nl); } hg.userData.f.push(segs); }
  const th = new THREE.Group(); th.position.set(sd * 0.03 * s, -0.008 * s, 0.025 * s); hg.add(th); hg.userData.th = th; hg.userData.ts = []; let par = th;
  [0.034, 0.026].forEach((L0, j) => { const L = L0 * s * (fk > 1 ? 1.25 : 1), sg = new THREE.Group(); sg.position.z = j ? hg.userData.ts[0].userData.L : 0; par.add(sg); const c = capsule((0.009 - j * 0.001) * s * fr, L, mat, 6); c.rotation.x = Math.PI / 2; c.position.z = L / 2; sg.add(c); sg.add(sph(0.0095 * s * fr, mat)); sg.userData.L = L; hg.userData.ts.push(sg); par = sg; });
  hg.userData.sd = sd; return hg;
}
function fingerJointsL(P, f, A, sd) { const s = P.pd.hs, k = (1.18 - Math.abs(f - 1.2) * 0.1) * P.pd.fk, L = [0.04, 0.028, 0.022].map((v) => v * k * s), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (f - 1.5) * 0.06 * -sd, 0));
  const p = V3((f - 1.5) * 0.0175 * -sd * s, 0.003 * s, (0.088 - Math.abs(f - 1.3) * 0.005) * s), out = [p.clone()]; for (let j = 0; j < 3; j++) { q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(A[j], 0, 0))); p.add(V3(0, 0, L[j]).applyQuaternion(q)); out.push(p.clone()); } return out; }
const GRIP = { f: [[1.25, 1.55, 1.05], [1.3, 1.55, 1.05], [1.35, 1.5, 1.0], [1.4, 1.45, 0.95]], t: [0.9, -0.55, 0.55, 0.45] };
function gripFit(P) {
  if (P.grip) return P.grip; let fit = null; for (let m = 1.0; m <= 1.5; m += 0.02) { const A = GRIP.f.map((a) => a.map((v, j) => v * (j === 0 ? m : 1 + (m - 1) * 0.4))); fit = gripFit0(P, A); fit.A = A; if (fit.r <= P.pd.gripR) break; }
  return (P.grip = fit);
}
function gripFitR(P, rr) {   // a looser fist round a thicker bar (e.g. a forearm): the first curl whose fitted circle is ≤ rr
  P._gr = P._gr || {}; if (P._gr[rr]) return P._gr[rr]; let fit = null; for (let m = 0.3; m <= 1.5; m += 0.02) { const A = GRIP.f.map((a) => a.map((v, j) => v * (j === 0 ? m : 1 + (m - 1) * 0.4))); fit = gripFit0(P, A); fit.A = A; if (fit.r <= rr) break; } return (P._gr[rr] = fit);
}
function gripFit0(P, A) {
  const s = P.pd.hs, pts = [[-0.016 * s, 0.055 * s], [-0.016 * s, 0.075 * s]];
  [0, 1, 2].forEach((f) => fingerJointsL(P, f, A[f], 1).forEach((p) => pts.push([p.y, p.z])));
  let a = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], b = [0, 0, 0];
  pts.forEach(([y, z]) => { const r = [y, z, 1], q = -(y * y + z * z); for (let i = 0; i < 3; i++) { b[i] += r[i] * q; for (let j = 0; j < 3; j++) a[i][j] += r[i] * r[j]; } });
  const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D0 = det(a), sol = [0, 1, 2].map((k) => det(a.map((row, i) => row.map((v, j) => (j === k ? b[i] : v)))) / D0);
  const cy = -sol[0] / 2, cz = -sol[1] / 2, R0 = Math.sqrt(cy * cy + cz * cz - sol[2]);
  return { c: V3(0, cy, cz), r: R0 - 0.0075 * s * P.pd.fr };
}
// place a person. st: { pos (pelvis), U, F, head: { Y, Z } world, hands: [wristL, wristR], hdir: [{ Z, Y }], epole, feet: [ankleL, ankleR], fdir, kpole,
//   curl: [l, r], grip: [bool, bool], gripK, breath, twitch, jaw (0..1), glint (0..1) }
function poseP(P, st) {
  const pd = P.pd, B = frameOf(st.U, st.F), q = qBasis(B.X, B.Y, B.Z), corpo = P.kind === 'corpo';
  P.g.visible = true; P.T.position.copy(st.pos); P.T.quaternion.copy(q);
  if (P.chest) P.chest.scale.set((corpo ? 1.25 : 1.2) * (1 + 0.02 * (st.breath ?? 0)), 1, (corpo ? 0.82 : 0.78) * (1 + 0.04 * (st.breath ?? 0)));
  const top = st.pos.clone().addScaledVector(B.Y, pd.torso);
  let HY, HZ; if (st.head && st.head.Y) { const f = frameOf(st.head.Y, st.head.Z); HY = f.Y; HZ = f.Z; }
  else { const h = st.head || {}, e = new THREE.Euler(h.pitch ?? 0, h.yaw ?? 0, h.roll ?? 0, 'YXZ'), hq = q.clone().multiply(new THREE.Quaternion().setFromEuler(e)); HY = V3(0, 1, 0).applyQuaternion(hq); HZ = V3(0, 0, 1).applyQuaternion(hq); }
  const HF = frameOf(HY, HZ); P.H.quaternion.copy(qBasis(HF.X, HF.Y, HF.Z));
  const nb = top.clone().addScaledVector(B.Y, -0.01).addScaledVector(B.Z, corpo ? 0.015 : 0), nl = corpo ? 0.12 : 0.07, hh = corpo ? 0.1 : pd.headR * 0.95;
  const Hc = st.headAt ? st.headAt.clone() : nb.clone().addScaledVector(B.Y, nl * 0.5).addScaledVector(HF.Y, nl * 0.5 + hh * 0.8).addScaledVector(HF.Z, corpo ? -0.02 : 0); P.H.position.copy(Hc);
  const hb = Hc.clone().addScaledVector(HF.Y, -hh * 0.6).addScaledVector(HF.Z, -0.015); between(P.neck.c, nb, hb, corpo ? 0.026 : 0.045); P.neckTop = hb; P.neckBase = nb;
  if (P.neck.t) P.neck.t.forEach((t, i) => between(t, nb.clone().addScaledVector(B.X, (i ? -1 : 1) * 0.022).addScaledVector(B.Z, 0.03), hb.clone().addScaledVector(HF.X, (i ? -1 : 1) * 0.03).addScaledVector(HF.Z, 0.01), 0.008));
  if (P.jaw) P.jaw.rotation.x = 0.04 + 0.42 * (st.jaw ?? 0);
  if (P.face) faceExpr(P, st.fear ?? 0);
  if (P.glints) P.glints.forEach((g) => g.material.color.set((st.glint ?? 0.3) > 0.5 ? '#d8c078' : (st.glint ?? 0.3) > 0.2 ? '#7a6a40' : '#2a1e14'));
  const aR = P.armR;
  P.arm.forEach((a, i) => {
    const S = top.clone().addScaledVector(B.X, a.sd * pd.shW).addScaledVector(B.Y, -0.035), Wt = st.hands[i];
    const pole = (st.epole && st.epole[i]) || B.X.clone().multiplyScalar(a.sd * 0.4).addScaledVector(B.Z, -1).addScaledVector(B.Y, -0.3);
    const { E, W } = twoBone(S, Wt, pd.uArm, pd.fArm, pole); a.S = S; a.E = E; a.W = W;
    between(a.up, S, E, aR[0]); between(a.fo, E, W, aR[1]); a.sj.position.copy(S); a.sj.scale.setScalar(aR[2]); a.ej.position.copy(E); a.ej.scale.setScalar(aR[3] * (corpo ? 1.25 : 1));
    const hd = (st.hdir && st.hdir[i]) || { Z: W.clone().sub(E).normalize(), Y: B.X.clone().multiplyScalar(a.sd) };
    const f = frameOf(hd.Y, hd.Z); a.hand.position.copy(W); a.hand.quaternion.copy(qBasis(f.Y.clone().cross(f.Z), f.Y, f.Z)); a.hand.updateMatrixWorld(true);
    if (a.cuff) { const d = W.clone().sub(E).normalize(); between(a.cuff, W.clone().addScaledVector(d, -0.06), W.clone().addScaledVector(d, -0.015), aR[1] * 1.15); }
    const U = a.hand.userData, c = st.curl ? st.curl[i] : 0.3, G = st.grip && st.grip[i] ? GRIP : null, tw = st.twitch ?? 0, gk = st.gripK ? st.gripK[i] : 1, spread = st.spread ? st.spread[i] : 0;
    U.f.forEach((segs, k) => { segs[0].parent.rotation.y = (k - 1.5) * (0.06 + spread * 0.12) * -U.sd; segs.forEach((sg, j) => (sg.rotation.x = lerp(c * [0.55, 0.8, 0.6][j] * (1 + 0.12 * k) + (0.05 + tw * 0.25 * (j ? 1 : 0.4)) * Math.sin(TT * (1.7 + tw * 3) + k * 1.3 + i), G ? (st.gripA && st.gripA[i] ? st.gripA[i] : gripFit(P).A)[k][j] : 0, G ? gk : 0))); });
    const tp0 = [st.thumb ? st.thumb[i] : 0.35 + 0.3 * c, -0.25 - spread * 0.3, 0.25 * c, 0.3 * c], tp = G ? tp0.map((v, qq) => lerp(v, G.t[qq], gk)) : tp0; U.th.rotation.set(tp[0], U.sd * tp[1], 0); U.ts[0].rotation.x = tp[2]; U.ts[1].rotation.x = tp[3];
  });
  P.leg.forEach((l, i) => {
    const Hj = st.pos.clone().addScaledVector(B.X, l.sd * pd.hipW).addScaledVector(B.Y, -0.03), A = st.feet[i];
    const { E: K, W: Aw } = twoBone(Hj, A, pd.thigh, pd.shin, (st.kpoles && st.kpoles[i]) || st.kpole || B.Z.clone().addScaledVector(B.Y, 0.2));
    l.H = Hj; l.K = K; l.A = Aw;
    const lr = pd.legR || (corpo ? [0.036, 0.028, 0.042] : kind3(P) ? [0.085, 0.065, 0.075] : [0.068, 0.054, 0.062]);
    between(l.th, Hj, K, lr[0]); between(l.sh, K, Aw, lr[1]); l.kj.position.copy(K); l.kj.scale.setScalar(lr[2] * (corpo ? 1.2 : 1));
    if (l.cuffL) { const d = Aw.clone().sub(K).normalize(); between(l.cuffL, Aw.clone().addScaledVector(d, -0.12), Aw.clone().addScaledVector(d, -0.03), lr[1] * 1.15); }
    const fd = (st.fdir && st.fdir[i]) || { Z: V3(B.Z.x, 0, B.Z.z).normalize(), Y: V3(0, 1, 0) }, f = frameOf(fd.Y, fd.Z);
    l.foot.position.copy(Aw); l.foot.quaternion.copy(qBasis(f.Y.clone().cross(f.Z), f.Y, f.Z));
  });
  if (P.skirt) { const w0 = st.pos.clone().addScaledVector(B.Y, 0.08), kn = P.leg[0].K.clone().add(P.leg[1].K).multiplyScalar(0.5), an = P.leg[0].A.clone().add(P.leg[1].A).multiplyScalar(0.5), to = kn.clone().lerp(an, st.skirtLen ?? 0.6);
    const A = to.clone().sub(w0), L = A.length(); A.normalize(); const X = B.X.clone().addScaledVector(A, -B.X.dot(A)).normalize(), Y = A.clone().negate(), Z = X.clone().cross(Y);
    P.skirt.position.copy(w0); P.skirt.quaternion.copy(qBasis(X, Y, Z)); P.skirt.scale.set(st.skirtW ?? 1.0, L / 0.84, (st.skirtW ?? 1.0) * 0.85); }
  P.st = st; P.top = top; P.B = B;
}
const kind3 = (P) => P.kind === 'tiao';
// put a held prop in the fist: its local X along the hand's X, its grip point at the fitted bar centre
function holdProp(P, i, prop, off = 0) { const h = P.arm[i].hand, G = gripFit(P); h.updateMatrixWorld(true); prop.visible = true; prop.position.copy(h.localToWorld(G.c.clone().add(V3(off, 0, 0)))); prop.quaternion.copy(h.getWorldQuaternion(new THREE.Quaternion())); prop.updateMatrixWorld(true); }
// a hand frame that holds a bar along direction D (bar = the hand's X; for a right hand the thumb end is +X), fingers toward Zc
function barHand(D, Zc) { const X = D.clone().normalize(), Z = Zc.clone().addScaledVector(X, -Zc.dot(X)).normalize(), Y = Z.clone().cross(X); return { Y, Z }; }
// where the wrist must be so the fitted grip centre lands on point G with hand frame hf
function wristFor(P, Gp, hf, fit) { const f = frameOf(hf.Y, hf.Z), q = qBasis(f.Y.clone().cross(f.Z), f.Y, f.Z); return Gp.clone().sub((fit || gripFit(P)).c.clone().applyQuaternion(q)); }


// =====================================================================
//  BLACK CAVE — three sets far apart, one shown per shot:
//   EXT (origin): rocky scrub hills behind the town, a limestone cliff with the cave mouth (CZ), a welded grate, a sign.
//   CHAM (x 300): the cave chamber, a low crack at the foot of the back wall, ofuda and a torn shimenawa round it.
//   SEC (x 600): a side cutaway of the crack going down (front face = the cut, a trough behind it, a back plate).
//  The pale crawler (posed from world points), the brother (headlamp, hanten, gloves), "me", the rescuers.
// =====================================================================
function texLimestone() { return txCanvas('limes', 256, 256, (x, w, h, R) => { x.fillStyle = '#c4c0b0'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) { x.fillStyle = R.pick(['rgba(255,250,230,0.08)', 'rgba(40,36,28,0.12)', 'rgba(110,90,60,0.12)', 'rgba(20,40,44,0.1)']); blob(x, R.r(0, w), R.r(0, h), R.r(4, 26), R); x.fill(); }
  for (let r = 0; r < 9; r++) { x.fillStyle = 'rgba(30,26,20,0.28)'; const y = R.r(0, h); x.fillRect(0, y, w, R.r(1, 3)); }
  for (let i = 0; i < 14; i++) { const cx = R.r(0, w), g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(14,20,20,0.55)'); g.addColorStop(1, 'rgba(14,20,20,0)'); x.fillStyle = g; x.fillRect(cx, R.r(0, h * 0.5), R.r(3, 10), h * R.r(0.2, 0.6)); }   // wet streaks
  speckle(x, R, w, h, 4000, ['rgba(30,28,24,0.5)', 'rgba(210,205,190,0.35)'], [1, 2]); for (let i = 0; i < 10; i++) crack(x, R, R.r(0, w), R.r(0, h), 7, R.n(5), R.r(5, 10)); }, [1, 1]); }
function texWet() { return txCanvas('wet', 256, 256, (x, w, h, R) => { x.fillStyle = '#b4b2a4'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 200; i++) { x.fillStyle = R.pick(['rgba(200,210,200,0.10)', 'rgba(10,16,18,0.25)', 'rgba(90,70,48,0.18)', 'rgba(52,108,118,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(3, 22), R); x.fill(); }
  for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(230,240,235,0.35)'; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), 1); }   // wet glints
  speckle(x, R, w, h, 5000, ['rgba(20,20,18,0.5)', 'rgba(180,180,170,0.3)'], [1, 2]); for (let i = 0; i < 12; i++) crack(x, R, R.r(0, w), R.r(0, h), 7, R.n(6), R.r(4, 9)); }, [1, 1]); }
function texSign() { return txCanvas('sign', 256, 128, (x, w, h, R) => { x.fillStyle = '#cfc7ae'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(60,44,30,0.25)'; x.fillRect(0, i * 22 + R.r(0, 6), w, 1); }
  for (let i = 0; i < 40; i++) { x.fillStyle = R.pick(['rgba(90,68,40,0.25)', 'rgba(40,30,20,0.2)']); blob(x, R.r(0, w), R.r(0, h), R.r(3, 14), R); x.fill(); }
  x.fillStyle = '#8e2a1a'; x.font = '900 46px Impact, "Arial Black", sans-serif'; x.textAlign = 'center'; x.save(); x.translate(w / 2, 52); x.rotate(-0.03); x.fillText('DANGER', 0, 0); x.restore();
  x.font = '900 26px "Arial Black", sans-serif'; x.fillStyle = '#2a1e14'; x.fillText('KEEP OUT', w / 2 - 30, 92); x.fillStyle = '#8e2a1a'; x.font = '900 30px ' + JPG; x.fillText('危険', w / 2 + 82, 94);
  for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(142,42,26,0.8)'; x.fillRect(R.r(40, 220), R.r(54, 70), 2, R.r(6, 18)); }   // paint drips
  for (let i = 0; i < 30; i++) { x.fillStyle = 'rgba(207,199,174,0.8)'; blob(x, R.r(0, w), R.r(0, h), R.r(1, 4), R); x.fill(); } }, [1, 1]); }
function texConcrete() { return txCanvas('concr', 256, 256, (x, w, h, R) => { x.fillStyle = '#7a7c76'; x.fillRect(0, 0, w, h);
  for (let r = 0; r < 7; r++) { x.strokeStyle = 'rgba(30,30,28,0.45)'; x.lineWidth = 2; x.beginPath(); let yy = r * 37 + R.r(0, 10); x.moveTo(0, yy); for (let k = 0; k <= 16; k++) x.lineTo(k * 16, yy + R.n(4)); x.stroke(); }   // pour layers
  for (let i = 0; i < 60; i++) { x.fillStyle = R.pick(['rgba(240,240,230,0.12)', 'rgba(20,20,18,0.3)']); x.beginPath(); x.arc(R.r(0, w), R.r(0, h), R.r(1, 3), 0, TAU); x.fill(); }   // air holes
  for (let i = 0; i < 90; i++) { x.fillStyle = R.pick(['rgba(255,255,250,0.07)', 'rgba(20,20,18,0.12)', 'rgba(90,70,44,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(3, 18), R); x.fill(); }
  for (let i = 0; i < 12; i++) { const cx = R.r(0, w), g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(70,46,26,0.5)'); g.addColorStop(1, 'rgba(70,46,26,0)'); x.fillStyle = g; x.fillRect(cx, R.r(0, h * 0.3), R.r(2, 6), h * 0.6); }
  speckle(x, R, w, h, 5000, ['rgba(30,30,28,0.5)', 'rgba(200,200,190,0.3)'], [1, 2]); for (let i = 0; i < 5; i++) crack(x, R, R.r(0, w), R.r(0, h), 6, R.n(6), R.r(5, 9));
  for (let i = 0; i < 18; i++) { const cx = R.r(0, w), l = R.r(20, 90); x.fillStyle = 'rgba(25,28,26,0.45)'; x.fillRect(cx, 0, R.r(2, 4), l); x.beginPath(); x.arc(cx + 1.5, l, 3, 0, TAU); x.fill(); }   // drips from the top
  x.save(); x.translate(w * 0.56, h * 0.5); x.rotate(0.2); x.strokeStyle = 'rgba(14,16,16,0.75)'; x.lineCap = 'round'; x.lineWidth = 5; x.beginPath(); x.ellipse(0, 10, 9, 12, 0, 0, TAU); x.stroke(); [-0.5, -0.17, 0.15, 0.45, 1.3].forEach((a, i) => { x.beginPath(); x.moveTo(Math.sin(a) * 9, -Math.cos(a) * 9 + 6); x.lineTo(Math.sin(a) * (i === 4 ? 26 : 52), -Math.cos(a) * (i === 4 ? 26 : 52) + 6); x.stroke(); }); x.restore(); }, [1, 1]); }   // a long-fingered hand imprint
function texSkyDusk() { return txCanvas('skyd', 512, 256, (x, w, h, R) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#06090f'); g.addColorStop(0.3, '#0b2c38'); g.addColorStop(0.43, '#1f3c44'); g.addColorStop(0.475, '#56706c'); g.addColorStop(0.497, '#a07c50'); g.addColorStop(0.52, '#3c2c1e'); g.addColorStop(1, '#191b18'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { x.fillStyle = R.pick(['rgba(20,40,46,0.35)', 'rgba(160,124,80,0.12)']); x.beginPath(); x.ellipse(R.r(0, w), R.r(h * 0.3, h * 0.48), R.r(30, 110), R.r(2, 5), 0, 0, TAU); x.fill(); } }, [1, 1]); }
function texOfuda(k) { return txCanvas('ofuda' + k, 32, 96, (x, w, h, R) => { x.fillStyle = '#d4c8a0'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 20; i++) { x.fillStyle = R.pick(['rgba(90,70,40,0.3)', 'rgba(30,40,40,0.25)']); blob(x, R.r(0, w), R.r(0, h), R.r(2, 8), R); x.fill(); }
  x.fillStyle = '#8e2a1a'; x.fillRect(w / 2 - 4, 6, 8, 8); x.fillStyle = '#1a1410'; for (let y = 20; y < h - 10; y += R.r(7, 11)) { x.fillRect(w / 2 - R.r(3, 7), y, R.r(6, 12), R.r(2, 4)); x.fillRect(w / 2 - 1, y, 2, R.r(4, 8)); }
  x.clearRect(0, h - R.r(6, 22), w, h); for (let i = 0; i < 6; i++) x.clearRect(R.r(0, w), R.r(h * 0.6, h), R.r(3, 8), h); }, [1, 1]); }
function texWax() { return txCanvas('wax', 128, 128, (x, w, h, R) => { x.fillStyle = '#e4e4da'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { x.fillStyle = R.pick(['rgba(255,255,248,0.12)', 'rgba(110,120,120,0.14)', 'rgba(150,130,110,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(3, 14), R); x.fill(); }
  for (let i = 0; i < 10; i++) { x.strokeStyle = 'rgba(60,50,44,0.45)'; x.lineWidth = 1; x.beginPath(); const yy = R.r(0, h); x.moveTo(0, yy); for (let k = 0; k <= 8; k++) x.lineTo(k * w / 8, yy + R.n(2)); x.stroke(); }   // creases
  for (let i = 0; i < 22; i++) { x.strokeStyle = 'rgba(70,90,120,0.6)'; x.lineWidth = 1; x.beginPath(); let px = R.r(0, w), py = R.r(0, h); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += R.n(10); py += R.r(4, 10); x.lineTo(px, py); } x.stroke(); }   // veins
  speckle(x, R, w, h, 900, ['rgba(60,60,56,0.35)', 'rgba(240,240,232,0.3)'], [1, 1]); }, [2, 2]); }
function texRust() { return txCanvas('rust', 64, 64, (x, w, h, R) => { x.fillStyle = '#3a342e'; x.fillRect(0, 0, w, h); for (let i = 0; i < 50; i++) { x.fillStyle = R.pick(['rgba(142,58,36,0.5)', 'rgba(90,40,24,0.5)', 'rgba(160,124,80,0.3)']); blob(x, R.r(0, w), R.r(0, h), R.r(2, 9), R); x.fill(); } }, [1, 1]); }

// a vertical rock face in local x/y (facing +z); dep(x, y) pushes a vertex back (−z); col(x, y, d) colour
function wallMesh(x0, x1, y0, y1, st, dep, col, mat) {
  const nx = Math.round((x1 - x0) / st) + 1, ny = Math.round((y1 - y0) / st) + 1, P = [], C = [], UV = [], idx = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = x0 + i * st, y = y0 + j * st, d = dep(x, y), c = col(x, y, d); P.push(x, y, -d); C.push(c.r, c.g, c.b); UV.push(x / 3, (y + d * 0.5) / 3); }
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(idx); g.computeVertexNormals();
  return shd(new THREE.Mesh(g, mat));
}
const tmpC = new THREE.Color();
// the shimenawa (twisted straw rope) along points, with zigzag shide; torn = frayed ends hanging
function mkShimenawa(par, pts, nShide, o = {}) {
  const straw = SM({ map: texStraw(), color: '#c8b080' }), paper = SM({ color: '#d8d0b8', side: THREE.DoubleSide }), R = RNG('shime', o.seed ?? 0), g = new THREE.Group(); par.add(g);
  const c = new THREE.CatmullRomCurve3(pts); [0, 1].forEach((k) => { const P2 = []; for (let i = 0; i <= 40; i++) { const u = i / 40, p = c.getPointAt(u), a = u * 30 + k * Math.PI; P2.push(p.clone().add(V3(0, Math.sin(a) * 0.025, Math.cos(a) * 0.025))); } g.add(shd(new THREE.Mesh(taperTube(P2, o.r ?? 0.045, (o.r ?? 0.045) * 0.8, 6, 60), straw))); });
  for (let i = 0; i < nShide; i++) { const p = c.getPointAt((i + 0.5) / nShide), s = new THREE.Group(); s.position.copy(p).add(V3(0, -0.03, 0.02)); s.rotation.z = R.n(0.15);
    for (let k = 0; k < 4; k++) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.07), paper); pl.position.set((k % 2 ? 0.03 : -0.03) * 0.6, -0.05 - k * 0.065, 0); pl.rotation.z = (k % 2 ? 1 : -1) * 0.25; s.add(pl); } g.add(s); }
  (o.frays || []).forEach((p) => { for (let k = 0; k < 6; k++) { const m = new THREE.Mesh(UCYL1, straw); between(m, p, p.clone().add(V3(R.n(0.06), -R.r(0.12, 0.3), R.n(0.03))), 0.006); g.add(m); } });
  return g;
}
function mkOfuda(par, p, rz, s = 1, k = 0, ry = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.075 * s, 0.22 * s), SM({ map: texOfuda(k % 3), alphaTest: 0.5, side: THREE.DoubleSide })); m.position.copy(p); m.rotation.set(0, ry, rz); par.add(m); m.receiveShadow = true; return m; }

// ---------------- EXT: the hill, the cliff and the mouth ----------------
const CZ = -20, ARCH = { w: 1.3, h: 2.3 }, PATHX = (z) => 1.4 * Math.sin((z - CZ) * 0.12) * ss(0, 6, z - CZ);
const archR = (x, y) => { const yy = Math.max(0, y - 0.7); return Math.max(Math.abs(x) / ARCH.w, Math.hypot(x / ARCH.w, yy / (ARCH.h - 0.7))); };   // <1 inside the mouth
function gE(x, z) { const n = fbm2(x * 0.12 + 7, z * 0.12);
  if (z < CZ) { if (Math.abs(x) < 2.8 && z > CZ - 9) return -0.15; return 3.6 + 1.6 * n + 4 * ss(CZ - 10, CZ - 60, z) * fbm2(x * 0.05, 3); }
  const d = z - CZ; return -0.11 * d - 0.012 * x * x * ss(0, 30, d) * 0.4 + (n - 0.5) * 1.1 * ss(2.5, 7, Math.hypot(x, d)); }
function mkExt(Wd) {
  const G = new THREE.Group(); Wd.scene.add(G); Wd.ext = G; const R = RNG('ext');
  const xs = gridAxis(-70, 70, [[-20, 20]], 0.5, 3), zs = gridAxis(-80, 120, [[-24, 30]], 0.5, 3), cA = lin('#8a7a5a'), cB = lin('#a8987a'), cR = lin('#b8b4a4'), cP = lin('#d8c8a0'), tmp = new THREE.Color();
  const gr = heightMesh(xs, zs, gE, (x, z) => tmp.copy(cA).lerp(cB, fbm2(x * 0.3, z * 0.3)).lerp(cR, ss(0.6, 0.7, fbm2(x * 0.5 + 3, z * 0.5))).lerp(cP, z > CZ ? ss(0.9, 0.6, Math.abs(x - PATHX(z))) * 0.85 : 0).clone(), SM({ map: texSoil(), vertexColors: true, color: '#ffffff' })); gr.material.map.repeat.set(2, 2); G.add(gr);
  // the cliff face with the mouth (a funnel pushed back into the dark)
  const lim = SM({ map: texLimestone(), vertexColors: true }), cL = lin('#a8a698'), cD = lin('#0b1a22'), cM = lin('#020306');
  const cliff = wallMesh(-22, 22, -1.2, 4.9, 0.1, (x, y) => { const r = archR(x, y), n = fbm2(x * 0.6, y * 0.6), top = ss(3.6, 4.9, y) * 1.8 * fbm2(x * 0.3, 2);
      if (y < 0.02 && r < 1) return 6 * ss(1.0, 0.86, r) * 1 + 0.0; return 0.55 * n + 0.25 * fbm2(x * 2.2, y * 2.2) + top + 6 * ss(1.0, 0.86, r) + 0.6 * ss(14, 22, Math.abs(x)); },
    (x, y, d) => tmp.copy(cL).lerp(lin('#6e7068'), fbm2(x * 0.8, y * 0.8)).lerp(cD, ss(0.35, 1.2, d)).lerp(cM, ss(1.2, 3.0, d)).clone(), lim);
  cliff.position.set(0, 0, CZ); G.add(cliff); Wd.cliff = cliff;
  // the grate: vertical bars every 0.14, cross bars every 0.42, welded to the rock (beads at the ends); the cut panel is its own group
  const steel = SM({ map: texRust(), color: '#a09890', roughness: 0.6 }), bead = SM({ color: '#5a4430' }), GZ = CZ - 0.32;
  const inCut = (x, y) => Math.abs(x) < 0.5 && y < 1.75, fixed = [], cut = [];
  const bar = (a, b, list) => list.push([a, b]);
  for (let x = -ARCH.w + 0.07; x < ARCH.w; x += 0.14) { let y1 = 0; while (archR(x, y1 + 0.02) < 1.02 && y1 < 3) y1 += 0.02; if (Math.abs(x) < 0.5) { bar(V3(x, -0.05, 0), V3(x, 1.75, 0), cut); bar(V3(x, 1.75, 0), V3(x, y1 + 0.06, 0), fixed); } else bar(V3(x, -0.05, 0), V3(x, y1 + 0.06, 0), fixed); }
  for (let y = 0.3; y < ARCH.h; y += 0.42) { let x1 = 0; while (archR(x1 + 0.02, y) < 1.02) x1 += 0.02; if (y < 1.75) { bar(V3(-x1 - 0.06, y, 0), V3(-0.5, y, 0), fixed); bar(V3(0.5, y, 0), V3(x1 + 0.06, y, 0), fixed); bar(V3(-0.5, y, 0), V3(0.5, y, 0), cut); } else bar(V3(-x1 - 0.06, y, 0), V3(x1 + 0.06, y, 0), fixed); }
  const mkBars = (list, par) => { const m = IM(new THREE.BoxGeometry(1, 1, 1), steel, list.length); const d = new THREE.Object3D(); list.forEach(([a, b], i) => { between(d, a, b, 0.022, 0.022); d.updateMatrix(); m.setMatrixAt(i, d.matrix); }); par.add(m); return m; };
  const gF = new THREE.Group(); gF.position.set(0, 0, GZ); G.add(gF); mkBars(fixed, gF); Wd.grateF = gF;
  fixed.forEach(([a, b]) => [a, b].forEach((p) => { if (archR(p.x, p.y) > 0.97) { const s = sph(0.04, bead, 1, 1, 1, 6); s.position.copy(p); gF.add(s); } }));
  [[-0.5, 0.3], [0.5, 0.3], [-0.5, 0.72], [0.5, 0.72], [-0.5, 1.14], [0.5, 1.14], [-0.5, 1.56], [0.5, 1.56]].forEach(([x, y]) => { const s = sph(0.03, SM({ color: '#c8a050', emissive: '#5a3010', emissiveIntensity: 0.4 }), 1.3, 0.8, 1, 6); s.position.set(x, y, 0.01); s.userData.cutEnd = true; gF.add(s); });   // fresh cut ends
  const gP = new THREE.Group(); G.add(gP); const gPi = new THREE.Group(); gPi.position.set(0, -0.875, 0); gP.add(gPi); mkBars(cut.map(([a, b]) => [a.clone().setY(a.y), b.clone()]), gPi); Wd.grateP = gP;   // panel local origin = its centre
  Wd.setGrate = (mode) => { gF.visible = mode !== 'gone'; gF.children.forEach((c) => { if (c.userData.cutEnd) c.visible = mode === 'cut'; }); gP.visible = mode !== 'gone';
    if (mode === 'whole') { gP.position.set(0, 0.875, GZ); gP.rotation.set(0, 0, 0); } else { gP.position.set(2.15, gE(2.15, CZ + 0.9) + 0.86, CZ + 0.75); gP.rotation.set(-0.22, -0.5, 0.05); } };
  // the hand-painted sign on two posts, left of the mouth
  { const sg = new THREE.Group(), x = -2.5, z = CZ + 1.5; sg.position.set(x, gE(x, z), z); sg.rotation.y = 0.35; G.add(sg); const wood = SM({ map: texDeadBark() });
    [-0.5, 0.5].forEach((dx) => { const p = cyl(0.04, 0.05, 1.5, wood, 6); p.position.set(dx, 0.62, -0.03); p.rotation.z = dx * 0.04; sg.add(p); });
    const b = bx(1.3, 0.62, 0.035, SM({ map: texSign() }), 0, 1.02, 0, sg); b.rotation.z = -0.05; Wd.sign = sg; }
  // an old shimenawa across the top of the mouth, iron pegs at the ends
  { const z = CZ + 0.15, L = V3(-1.55, 2.55, z), Rr = V3(1.5, 2.6, z); mkShimenawa(G, [L, V3(-0.6, 2.28, z + 0.12), V3(0.5, 2.3, z + 0.12), Rr], 4, { seed: 1 }); [L, Rr].forEach((p) => { const pg = cyl(0.025, 0.02, 0.3, steel, 5); pg.rotation.x = Math.PI / 2; pg.position.copy(p).add(V3(0, 0, -0.1)); G.add(pg); }); }
  // the concrete plug
  { const st = 0.04, P = [], UV = [], C = [], idx = [], nx = Math.round(3.0 / st) + 1, ny = Math.round(2.7 / st) + 1, id = new Int32Array(nx * ny).fill(-1); let n = 0;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = -1.5 + i * st, y = -0.2 + j * st, r = archR(x, Math.max(0, y)); if (r > 1.09) continue; const lip = ss(0.93, 1.06, r), sag = 0.05 * ss(1.4, 0, y), bump = 0.035 * fbm2(x * 3, y * 3) + 0.012 * fbm2(x * 11, y * 11);
      P.push(x, y, -0.32 + bump + sag + 0.12 * lip * (1 - ss(1.04, 1.09, r)) - 0.25 * ss(1.06, 1.09, r)); UV.push(x / 1.3, y / 1.3); const c = lin('#ffffff').lerp(lin('#7a7468'), 0.5 * ss(0.55, 0.75, fbm2(x * 2 + 4, y * 2))).lerp(lin('#6a5038'), 0.4 * ss(1.4, 0, y) * fbm2(x * 5, 1)); C.push(c.r, c.g, c.b); id[j * nx + i] = n++; }
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = id[j * nx + i], b = id[j * nx + i + 1], c = id[(j + 1) * nx + i], d = id[(j + 1) * nx + i + 1]; if (a < 0 || b < 0 || c < 0 || d < 0) continue; idx.push(a, b, c, b, d, c); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.setIndex(idx); g.computeVertexNormals();
    const pl = shd(new THREE.Mesh(g, SM({ map: texConcrete(), vertexColors: true }))); pl.position.set(0, 0, CZ); G.add(pl); Wd.plug = pl; }
  if (0) { const sh = new THREE.Shape(); sh.moveTo(-ARCH.w - 0.08, -0.2); for (let a = 0; a <= 40; a++) { const t = Math.PI - a / 40 * Math.PI; sh.lineTo(Math.cos(t) * (ARCH.w + 0.08), 0.7 + Math.sin(t) * (ARCH.h - 0.7 + 0.08)); } sh.lineTo(ARCH.w + 0.08, -0.2);
    const pl = shd(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.05, bevelSegments: 1 }), SM({ map: texConcrete() }))); pl.material.map.repeat.set(0.45, 0.45); pl.position.set(0, 0, CZ - 0.7); G.add(pl); Wd.plug = pl; }
  // scrub: dark bushes, limestone rocks, dry grass
  { const bush = IM(new THREE.IcosahedronGeometry(1, 1), SM({ map: texNeedles(), color: '#7a7a5a' }), 260), rock = IM(new THREE.DodecahedronGeometry(1, 0), SM({ map: texLimestone(), color: '#b0aa98' }), 200); let nb = 0, nr = 0;
    for (let i = 0; i < 3000 && (nb < 260 || nr < 200); i++) { const x = R.r(-40, 40), z = R.r(CZ + 0.8, 60); if (Math.abs(x) < 3.2 && z < CZ + 9) continue; if (Math.abs(x - PATHX(z)) < 1.0) continue; if (Math.abs(x + 2.5) < 1.2 && Math.abs(z - CZ - 1.5) < 1) continue; const y = gE(x, z);
      if (R.f() < 0.55 && nb < 260) { const s = R.r(0.3, 0.9); bush.setMatrixAt(nb, M4c(x, y + s * 0.35, z, R.r(0, 6), s * R.r(0.9, 1.4), s * R.r(0.6, 0.9), s)); bush.setColorAt(nb++, lin(R.pick(['#8a8a62', '#6e6a4a', '#7a6a4a', '#5e6450']))); }
      else if (nr < 200) { const s = R.r(0.15, 0.7); rock.setMatrixAt(nr, M4c(x, y + s * 0.2, z, R.r(0, 6), s * R.r(1, 1.6), s * R.r(0.5, 0.9), s, R.n(0.3), R.n(0.3))); rock.setColorAt(nr++, lin(R.pick(['#ffffff', '#d8d4c8', '#b8b4a4']))); } }
    for (let i = 0; i < 40; i++) { const x = R.r(-12, 12), y = R.r(7, 8.6), z = CZ - R.r(0.5, 4); bush.setMatrixAt(nb < 260 ? nb++ : 0, M4c(x, gE(x, z) + 0.2, z, R.r(0, 6), R.r(0.5, 1.1), R.r(0.4, 0.8), R.r(0.5, 1))); void y; }
    bush.count = nb; rock.count = nr; G.add(bush); G.add(rock); Wd.bush = bush; }
  Wd.grassE = mkGrass(Wd, 18000, [-25, 25, CZ + 0.6, 30], gE, (x, z) => { if (Math.abs(x) < 1.6 && z < CZ + 6) return 'short'; if (Math.abs(x - PATHX(z)) < 0.7) return false; if (Math.abs(x + 2.5) < 0.9 && Math.abs(z - CZ - 1.5) < 0.6) return false; return true; }, ['#7a6c4c', '#6a5c40', '#86785a', '#5a4c34', '#8e8060'], 'scrub', [0.15, 0.5]); Wd.scene.remove(Wd.grassE); G.add(Wd.grassE);
  // rubble from the digging, a coil of rope, a rope into the mouth, two floodlights on tripods (the rescue)
  { const RS = new THREE.Group(); G.add(RS); Wd.rescueSet = RS; const rb = IM(new THREE.DodecahedronGeometry(1, 0), SM({ map: texLimestone(), color: '#a8a290' }), 60); const RR = RNG('rubble');
    for (let i = 0; i < 60; i++) { const x = R.r(1.4, 3.4) * (i % 2 ? 1 : -1) * (i % 5 ? 1 : 0.6), z = CZ + RR.r(0.5, 2.6), s = RR.r(0.1, 0.35); rb.setMatrixAt(i, M4c(x, gE(x, z) + s * 0.3 + (2.2 - Math.abs(Math.abs(x) - 2.4)) * 0.1, z, RR.r(0, 6), s, s * 0.7, s)); } RS.add(rb);
    const rope = SM({ color: '#b8603a' }); const coil = shd(new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 6, 20), rope)); coil.rotation.x = Math.PI / 2; coil.position.set(-1.0, gE(-1, CZ + 2.6) + 0.04, CZ + 2.6); RS.add(coil);
    const coil2 = coil.clone(); coil2.position.y += 0.07; coil2.scale.setScalar(0.85); RS.add(coil2);
    RS.add(shd(new THREE.Mesh(taperTube([V3(-0.75, gE(-0.75, CZ + 2.4) + 0.05, CZ + 2.4), V3(-0.4, -0.08, CZ + 1.0), V3(-0.2, -0.12, CZ - 0.5), V3(0, -0.12, CZ - 3.5)], 0.03, 0.03, 5, 30, { wob: 0 }), rope)));
    Wd.floods = [[-2.0, CZ + 4.2], [2.6, CZ + 3.6]].map(([x, z]) => { const f = new THREE.Group(); f.position.set(x, gE(x, z), z); RS.add(f); const m = SM({ color: '#2b2d29' });
      for (let k = 0; k < 3; k++) { const a = k / 3 * TAU, l = new THREE.Mesh(UCYL1, m); between(l, V3(Math.cos(a) * 0.45, 0, Math.sin(a) * 0.45), V3(0, 1.7, 0), 0.015); f.add(l); }
      const head = bx(0.42, 0.3, 0.16, m, 0, 1.85, 0, f); const lens = bx(0.36, 0.24, 0.02, SM({ color: '#ffffff', emissive: '#ffe0a0', emissiveIntensity: 1.5 }), 0, 1.85, 0.09, f); f.lookAt(0, 0.8, CZ - 1); f.rotation.x = 0; void head; void lens; return f; }); }
  return G;
}
// ---------------- CHAM: the chamber and the crack ----------------
const CH = V3(300, 0, 0), SLIT = { y: 0.22, w: 0.55, h: 0.2, z: -3 }, VC = { x: 2.4 };
const vcR = (x, y) => Math.abs(x - VC.x - 0.035 * Math.sin(y * 9) - 0.02 * Math.sin(y * 23)) / (0.07 * ss(0.05, 0.35, y) * (1 - ss(1.05, 1.35, y)) + 0.004);
const chDep = (x, y) => { const r = slitR(x, y); return 0.18 * fbm2(x * 1.4, y * 1.4) + 0.08 * fbm2(x * 5, y * 5) + 3.2 * ss(1.0, 0.7, r) + (y < 0.02 && Math.abs(x) < SLIT.w ? 3.2 * ss(1.0, 0.7, Math.abs(x) / SLIT.w) : 0) + 1.6 * ss(1.0, 0.55, vcR(x, y)); };
const chWallZ = (lx, y) => SLIT.z - chDep(lx, y);
const slitR = (x, y) => Math.hypot(x / SLIT.w, (y - SLIT.y) / SLIT.h);
const gC = (x, z) => { const lx = x - CH.x; return -0.03 + 0.06 * (fbm2(lx * 1.5, z * 1.5) - 0.5) * ss(0.4, 1.5, Math.hypot(lx, z - SLIT.z)) + 0.05 * ss(2, 6, Math.abs(lx)); };
function mkCham(Wd) {
  const G = new THREE.Group(); G.position.copy(CH); Wd.scene.add(G); Wd.cham = G; const wet = SM({ map: texWet(), vertexColors: true }), R = RNG('cham');
  const cW = lin('#8a9a98'), cK = lin('#020306'), tmp = new THREE.Color();
  const fl = heightMesh(gridAxis(-8, 8, [[-3, 3]], 0.1, 0.4), gridAxis(-4, 8, [[-3.5, 2]], 0.1, 0.4), (x, z) => gC(x + CH.x, z), (x, z) => tmp.copy(lin('#7a8684')).lerp(lin('#2a3a3a'), ss(0.45, 0.6, fbm2(x * 0.7, z * 0.7))).clone(), wet); G.add(fl);   // dark patches = puddles
  const wall = wallMesh(-6, 6, -0.3, 5, 0.02, chDep,
    (x, y, d) => tmp.copy(cW).lerp(lin('#56706c'), fbm2(x * 2, y * 2)).lerp(cK, ss(0.3, 1.2, d)).clone(), wet);
  wall.position.set(0, 0, SLIT.z); G.add(wall); Wd.chWall = wall;
  // the dome (back half of an ellipsoid, inside out) and stalactites
  { const dg = new THREE.SphereGeometry(1, 40, 20, 0, TAU, 0, Math.PI / 2), p = dg.attributes.position; for (let i = 0; i < p.count; i++) { const v = V3(p.getX(i), p.getY(i), p.getZ(i)), n = 1 + 0.12 * (fbm2(v.x * 4 + 3, v.z * 4 + v.y * 3) - 0.5); p.setXYZ(i, v.x * n, v.y * n, v.z * n); } dg.computeVertexNormals();
    const dm = shd(new THREE.Mesh(dg, SM({ map: texWet(), color: '#56706c', side: THREE.BackSide }))); dm.scale.set(6.5, 4.2, 6); dm.position.set(0, -0.2, 0.5); G.add(dm);
    const st = IM(new THREE.ConeGeometry(1, 1, 6).rotateX(Math.PI), SM({ map: texLimestone(), color: '#b8b4a4' }), 70); for (let i = 0; i < 70; i++) { const x = R.r(-5, 5), z = R.r(-2.8, 5), top = -0.2 + 4.2 * Math.sqrt(Math.max(0.05, 1 - (x / 6.5) ** 2 - ((z - 0.5) / 6) ** 2)), l = R.r(0.2, 1.1); st.setMatrixAt(i, M4c(x, top - l / 2 + 0.1, z, 0, R.r(0.04, 0.12), l, R.r(0.04, 0.12))); } G.add(st);
    const sm = IM(new THREE.ConeGeometry(1, 1, 6), SM({ map: texLimestone(), color: '#a8a494' }), 24); for (let i = 0; i < 24; i++) { let x = R.r(-4.5, 4.5); const z = R.r(-2.6, 4); if (Math.abs(x) < 1.6 && z < 1) x += Math.sign(x || 1) * 1.6; const h = R.r(0.15, 0.6); sm.setMatrixAt(i, M4c(x, gC(x + CH.x, z) + h / 2 - 0.02, z, 0, R.r(0.06, 0.18), h, R.r(0.06, 0.18))); } G.add(sm); }
  // round the crack: ofuda pasted on the rock, a torn shimenawa pegged above it, one shred lying on the floor
  { const pts = [[-0.8, 0.55, -0.15], [-0.68, 0.24, 0.35], [0.74, 0.5, -0.2], [0.86, 0.18, 0.25], [-0.15, 0.62, 0.05], [0.3, 0.66, -0.1], [-1.1, 0.75, 0.2]];
    pts.forEach(([x, y, rz], i) => { const d = Wd.chWall ? 0 : 0; const z = SLIT.z - (0.18 * fbm2(x * 1.4, y * 1.4) + 0.08 * fbm2(x * 5, y * 5) + 3.2 * ss(1.0, 0.7, slitR(x, y))) + 0.025; mkOfuda(G, V3(x, y, z), rz, 1.1, i); void d; });
    const zw = (x, y) => SLIT.z - (0.18 * fbm2(x * 1.4, y * 1.4) + 0.08 * fbm2(x * 5, y * 5)) + 0.06;
    mkShimenawa(G, [V3(-0.95, 0.95, zw(-0.95, 0.95)), V3(-0.4, 0.8, zw(-0.4, 0.8) + 0.05), V3(0.05, 0.82, zw(0.05, 0.82) + 0.04)], 2, { seed: 2, r: 0.035, frays: [V3(0.05, 0.82, zw(0.05, 0.82) + 0.04)] });
    [[VC.x - 0.22, 0.95, 0.2], [VC.x + 0.25, 1.05, -0.25], [VC.x + 0.32, 0.3, 0.15]].forEach(([x, y, rz], i) => mkOfuda(G, V3(x, y, chWallZ(x, y) + 0.02), rz, 1.1, i + 1));
    mkShimenawa(G, [V3(VC.x - 0.5, 1.45, chWallZ(VC.x - 0.5, 1.45) + 0.05), V3(VC.x - 0.1, 1.3, chWallZ(VC.x - 0.1, 1.3) + 0.1), V3(VC.x + 0.15, 1.33, chWallZ(VC.x + 0.15, 1.33) + 0.08)], 2, { seed: 5, r: 0.03, frays: [V3(VC.x + 0.15, 1.33, chWallZ(VC.x + 0.15, 1.33) + 0.08)] });
    const sh2 = mkShimenawa(G, [V3(0.55, 0.0, SLIT.z + 0.55), V3(0.9, 0.02, SLIT.z + 0.75), V3(1.2, 0.0, SLIT.z + 0.7)], 1, { seed: 3, r: 0.03 }); void sh2;
    const peg = cyl(0.02, 0.015, 0.2, SM({ map: texRust() }), 5); peg.rotation.x = Math.PI / 2; peg.position.set(-0.95, 0.95, zw(-0.95, 0.95) - 0.05); G.add(peg); }
  return G;
}
// ---------------- SEC: the cutaway of the crack ----------------
const SC = V3(600, 0, 0), SDEP = 0.55;
const SPTS = [[-1.0, 0.0], [-0.2, -0.35], [0.7, -1.1], [1.05, -2.4], [0.55, -3.7], [0.95, -5.1], [1.7, -6.4], [1.45, -7.9], [0.9, -9.4], [1.2, -11]].map(([x, y]) => V3(x, y, 0));
let SCURVE = null;
const secH = (u) => lerp(0.42, 0.27, ss(0, 0.45, u)) - 0.02 * ss(0.5, 1, u);
function secAt(u) { const c = SCURVE, p = c.getPointAt(clamp(u)), t = c.getTangentAt(clamp(u)).normalize(), n = V3(-t.y, t.x, 0); return { p, t, n, h: secH(u) }; }   // n: the 'roof' side; −n the floor
function mkSec(Wd) {
  SCURVE = new THREE.CatmullRomCurve3(SPTS); const L = SCURVE.getLength(), G = new THREE.Group(); G.position.copy(SC); Wd.scene.add(G); Wd.sec = G; const tmp = new THREE.Color();
  const S = [...Array(400)].map((_, i) => ({ u: i / 399, ...secAt(i / 399) }));
  const CHB = { c: V3(-2.6, 1.0, 0), rx: 2.3, ry: 1.15 };
  const inside = (x, y) => { if (((x - CHB.c.x) / CHB.rx) ** 2 + ((y - CHB.c.y) / CHB.ry) ** 2 < 1 && y > 0.0 - 0.0) return true; let b = 1e9, h = 0; for (const s of S) { const d = (x - s.p.x) ** 2 + (y - s.p.y) ** 2; if (d < b) { b = d; h = s.h; } } return Math.sqrt(b) < h; };
  // front face (the cut): quads, dropped inside the cavity; strata by vertex colour
  { const st = 0.03, P = [], C = [], UV = [], strata = (x, y) => { const k = y * 1.6 + 0.6 * fbm2(x * 0.4, y * 0.4) + 0.3 * Math.sin(x * 0.5); const band = ['#56706c', '#3f4542', '#5e6a64', '#2a3a3a', '#4e5a52', '#3a3a32'][mod(Math.floor(k), 6)]; return tmp.copy(lin(band)).lerp(lin('#191b18'), 0.5 * fbm2(x * 3, y * 3) * fbm2(x * 9 + 2, y * 9)).lerp(lin('#8a8a80'), ss(0.66, 0.72, fbm2(x * 6 + 5, y * 6)) * 0.5).clone(); };
    const snap = (x, y) => { const e = ((x - CHB.c.x) / CHB.rx) ** 2 + ((y - CHB.c.y) / CHB.ry) ** 2; if (e < 1 && y > 0) { const k = 1 / Math.sqrt(e || 1e-6); return [CHB.c.x + (x - CHB.c.x) * k, Math.max(0.0, CHB.c.y + (y - CHB.c.y) * k)]; } let b = 1e9, sb = null; for (const s of S) { const d = (x - s.p.x) ** 2 + (y - s.p.y) ** 2; if (d < b) { b = d; sb = s; } } const d = Math.sqrt(b); if (d < sb.h) { const k = sb.h / Math.max(d, 1e-4); return [sb.p.x + (x - sb.p.x) * k, sb.p.y + (y - sb.p.y) * k]; } return null; };
    const vx = (x, y) => { const sn = snap(x, y); return sn ? { p: sn, in: true } : { p: [x, y], in: false }; };
    for (let y = -12.5; y < 3.6; y += st) for (let x = -5; x < 5.5; x += st) { const v = [vx(x, y), vx(x + st, y), vx(x + st, y + st), vx(x, y + st)]; if (v.every((q) => q.in)) continue; [v[0], v[1], v[2], v[0], v[2], v[3]].forEach((q) => { const [a, b] = q.p; P.push(a, b, 0); const c = strata(a, b); C.push(c.r, c.g, c.b); UV.push(a / 3, b / 3); }); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.computeVertexNormals();
    const fm = new THREE.Mesh(g, SM({ map: texWet(), vertexColors: true })); fm.receiveShadow = true; G.add(fm); Wd.secFace = fm; }
  // the trough behind the cut (the crack's walls), the chamber's back half, a back plate
  { const n = 300, ring = 12, P = [], UV = [], idx = []; for (let i = 0; i <= n; i++) { const u = i / n, s = secAt(u); for (let j = 0; j <= ring; j++) { const a = j / ring * Math.PI, w = 1 + 0.12 * (fbm2(u * 40, j * 0.7) - 0.5) * Math.sin(a); const p = s.p.clone().addScaledVector(s.n, s.h * Math.cos(a) * w).add(V3(0, 0, -SDEP * Math.sin(a) * w)); P.push(p.x, p.y, p.z); UV.push(j / ring, u * L / 1.5); } }
    for (let i = 0; i < n; i++) for (let j = 0; j < ring; j++) { const a = i * (ring + 1) + j, b = a + ring + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(idx); g.computeVertexNormals();
    const tm = shd(new THREE.Mesh(g, SM({ map: texWet(), color: '#8a9a98', side: THREE.DoubleSide }))); G.add(tm); Wd.secTube = tm;
    const cg = new THREE.SphereGeometry(1, 30, 16, Math.PI, Math.PI); const cm = shd(new THREE.Mesh(cg, SM({ map: texWet(), color: '#e0dccc', side: THREE.DoubleSide }))); cm.scale.set(CHB.rx, CHB.ry, 1.6); cm.position.copy(CHB.c); G.add(cm);
    const bp = bx(12, 17, 0.05, SM({ color: '#1a2224' }), 0, -4.7, -1.65, G); void bp;
    const fl = bx(4.6, 0.06, 1.6, SM({ map: texWet(), color: '#d0ccc0' }), CHB.c.x, 0.0, -0.8, G); void fl; }
  // ofuda and a torn shimenawa on the crack's walls deep down, near where it waits
  { [0.62, 0.66, 0.71, 0.75].forEach((u, i) => { const s = secAt(u), p = s.p.clone().addScaledVector(s.n, s.h * 0.55 * (i % 2 ? -1 : 1)).add(V3(0, 0, -SDEP * 0.8)); mkOfuda(G, p, Math.atan2(s.t.y, s.t.x) + Math.PI / 2 + (i % 2 ? 0.3 : -0.3), 0.9, i + 1); });
    const s1 = secAt(0.68), s2 = secAt(0.72); mkShimenawa(G, [s1.p.clone().addScaledVector(s1.n, s1.h * 0.85).add(V3(0, 0, -0.35)), s1.p.clone().lerp(s2.p, 0.5).addScaledVector(s1.n, s1.h * 0.6).add(V3(0, 0, -0.3)), s2.p.clone().addScaledVector(s2.n, s2.h * 0.7).add(V3(0, 0, -0.4))], 1, { seed: 4, r: 0.025, frays: [s2.p.clone().addScaledVector(s2.n, s2.h * 0.7).add(V3(0, 0, -0.4))] }); }
  // the hill's surface above the cut: dry grass line + a few bushes
  { const top = bx(12, 0.25, 1.4, SM({ map: texSoil(), color: '#8a7a5a' }), 0, 3.65, -0.6, G); void top; }
  return G;
}

// ---------------- THE PALE CRAWLER ----------------
// posed from world points every frame: { chest, pelvis, N (back side), head {p, Y, Z}, jaw, arms: [{ S, W, pole, hand }] }
const CRAW = { segR: 0.026, fingL: [0.1, 0.09, 0.08, 0.07], palm: 0.085 };
function mkCrawler(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); const wax = SM({ map: texWax(), color: '#c4c2b2', roughness: 0.45, emissive: '#3a2420', emissiveIntensity: 0.18 }), dark = SM({ color: '#0e0606' }), tooth = SM({ color: '#d8ccb0' }), C = { g, wax };
  const tube = () => { const m = shd(new THREE.Mesh(UCYL1, wax)); g.add(m); return m; }, knob = (r) => { const m = sph(r, wax, 1, 1, 1, 8); g.add(m); return m; };
  C.torso = shd(new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), wax)); g.add(C.torso); C.pelv = sph(1, wax, 1, 1, 1, 12); g.add(C.pelv);
  C.spine = [...Array(9)].map(() => knob(0.028)); C.ribs = [...Array(10)].map(() => tube());
  C.neck = tube(); C.neckK = [...Array(5)].map(() => knob(0.03));
  // the head (local: +z the snout, +y the crown): a long eyeless skull, smooth brow pits, a mouth under the front with too many teeth
  const H0 = new THREE.Group(); g.add(H0); C.head = H0; const H = new THREE.Group(); H.scale.setScalar(0.66); H0.add(H);
  const sk = shd(new THREE.Mesh(new THREE.SphereGeometry(1, 22, 16), wax)); sk.scale.set(0.085, 0.092, 0.28); sk.position.set(0, 0.02, 0.06); H.add(sk);
  const snout = shd(new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), wax)); snout.scale.set(0.07, 0.06, 0.15); snout.position.set(0, -0.035, 0.2); H.add(snout);
  const brow = shd(new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8), wax)); brow.scale.set(0.088, 0.024, 0.05); brow.position.set(0, 0.06, 0.215); H.add(brow);   // a heavy brow ridge
  [-1, 1].forEach((sd) => { const lid = shd(new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), SM({ map: texWax(), color: '#b4b0a4', emissive: '#2a1814', emissiveIntensity: 0.3 }))); lid.scale.set(0.03, 0.022, 0.018); lid.position.set(sd * 0.042, 0.03, 0.255); lid.rotation.y = sd * 0.45; H.add(lid);   // skin grown over the sockets
    });
  const nose = shd(new THREE.Mesh(UCYL1, wax)); between(nose, V3(0, 0.045, 0.255), V3(0, 0.005, 0.345), 0.012, 0.009); H.add(nose);   // a long nose ridge
  const cav = sph(1, dark, 0.048, 0.028, 0.11, 12); cav.position.set(0, -0.06, 0.2); H.add(cav); C.cav = cav;
  C.glint = sph(0.012, BM('#c02818', { fog: false }), 1, 1, 1, 6); C.glint.position.set(0.006, -0.068, 0.13); H.add(C.glint);
  const tg = new THREE.ConeGeometry(0.0055, 0.034, 4); C.upT = []; C.loT = [];
  for (let row = 0; row < 2; row++) for (let i = 0; i < 15; i++) { const a = (i / 14 - 0.5) * 2.5, rr = 0.052 - row * 0.012, x = Math.sin(a) * rr, z = 0.2 + Math.cos(a) * rr * 2.0 - row * 0.012; const t = shd(new THREE.Mesh(tg, tooth)); t.rotation.x = Math.PI; t.position.set(x, -0.05 - 0.017, z); t.scale.y = 1 - row * 0.3 + 0.2 * hsh(i + row * 20, 5); H.add(t); C.upT.push(t); }
  const jaw = new THREE.Group(); jaw.position.set(0, -0.06, 0.07); H.add(jaw); C.jaw = jaw;
  const jm = shd(new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10, 0, TAU, Math.PI / 2, Math.PI / 2), wax)); jm.scale.set(0.062, 0.05, 0.19); jm.position.set(0, -0.012, 0.12); jaw.add(jm);
  const jc = sph(1, dark, 0.042, 0.01, 0.13, 10); jc.position.set(0, -0.012, 0.13); jaw.add(jc);
  for (let row = 0; row < 2; row++) for (let i = 0; i < 14; i++) { const a = (i / 13 - 0.5) * 2.4, rr = 0.046 - row * 0.011, x = Math.sin(a) * rr, z = 0.13 + Math.cos(a) * rr * 2.1 - row * 0.012; const t = shd(new THREE.Mesh(tg, tooth)); t.position.set(x, -0.012 + 0.016, z); t.scale.y = 1 - row * 0.3 + 0.2 * hsh(i + row * 30, 6); jaw.add(t); C.loT.push(t); }
  // arms: 6 segments (too many joints), knuckles, a hand with five very long four-jointed fingers
  C.arms = [0, 1].map(() => ({ segs: [...Array(6)].map(() => tube()), kn: [...Array(7)].map(() => knob(0.034)), palm: (() => { const m = shd(new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), wax)); g.add(m); return m; })(),
    f: [...Array(5)].map(() => ({ s: [...Array(4)].map(() => tube()), k: [...Array(4)].map(() => knob(0.012)), nail: (() => { const m = shd(new THREE.Mesh(new THREE.ConeGeometry(1, 1, 5), SM({ color: '#cfae78' }))); g.add(m); return m; })() })) }));
  g.traverse((m) => { if (m.isMesh) m.frustumCulled = false; }); return C;
}
const FR = [0.0105, 0.0115, 0.011, 0.0098, 0.0115];   // finger radii (index..pinky, thumb)
// finger points: mode 'spread' (o: { O wrist, X, Y back of hand, Z fingers, curl, tap }) or 'wrap' (o: { O axis point, A axis, r, th0, dir })
function fingerPts(o, i, t) {
  const L = CRAW.fingL, pts = [];
  const fk = o.fk ?? 1; if (o.mode === 'wrap') { const A = o.A.clone().normalize(), u = (o.U || V3(0, 1, 0)).clone().addScaledVector(A, -(o.U || V3(0, 1, 0)).dot(A)).normalize(), v = A.clone().cross(u), rr = o.r + FR[i] * fk;
    const ax = (i < 4 ? (i - 1.5) * 0.026 : -0.055) * fk, dir = i < 4 ? 1 : -1; let th = o.th0 + (i < 4 ? 0 : 0.6);
    const at = (th, s) => o.O.clone().addScaledVector(A, ax + s).addScaledVector(u, Math.cos(th) * rr).addScaledVector(v, Math.sin(th) * rr);
    pts.push(at(th - dir * 0.25, 0).addScaledVector(u, 0.0)); L.forEach((l) => { th += dir * l / rr * (o.wrapK ?? 1); pts.push(at(th, 0)); }); return pts; }
  const sp = i < 4 ? (i - 1.5) * 0.2 : 1.0, base = o.O.clone().addScaledVector(o.Z, i < 4 ? CRAW.palm : CRAW.palm * 0.35).addScaledVector(o.X, i < 4 ? (i - 1.5) * 0.022 : -0.04);
  let d = o.Z.clone().applyAxisAngle(o.Y, sp * (o.spread ?? 1)); const ax = o.Y.clone().cross(d).normalize(); pts.push(base.clone()); const p = base.clone();
  const lift = o.tap ? Math.max(0, Math.sin(t * 7 + i * 1.3)) * (i === (o.tapF ?? 1) ? 0.9 : 0.25) * o.tap : 0;
  L.forEach((l, j) => { const c = (o.curl ?? 0.3) * (j === 0 ? 0.3 : 1) - (j === 0 ? lift : 0); d = d.clone().applyAxisAngle(ax, c); p.addScaledVector(d, l); pts.push(p.clone()); }); return pts;
}
function poseCrawler(Wd, st) {
  const C = Wd.craw; C.g.visible = true; const FK = st.fr ?? 1, N = st.N.clone().normalize(), sp = st.chest.clone().sub(st.pelvis), sL = sp.length(), U = sp.clone().normalize(), X = U.clone().cross(N).normalize();
  { const mid = st.pelvis.clone().lerp(st.chest, 0.5), q = qBasis(X, U, N); C.torso.position.copy(mid).addScaledVector(N, -0.01); C.torso.quaternion.copy(q); C.torso.scale.set(0.13, sL * 0.55, 0.065);
    C.pelv.position.copy(st.pelvis).addScaledVector(U, 0.04); C.pelv.quaternion.copy(q); C.pelv.scale.set(0.11, 0.08, 0.06); C.pelv.visible = st.pelvisVis !== false;
    C.spine.forEach((k, i) => { k.position.copy(st.pelvis).addScaledVector(U, sL * (i + 0.5) / 9).addScaledVector(N, 0.05 + 0.006 * Math.sin(i * 1.7)); });
    C.ribs.forEach((r, i) => { const sd = i % 2 ? 1 : -1, y = sL * (0.45 + 0.1 * Math.floor(i / 2)); const a = st.pelvis.clone().addScaledVector(U, y).addScaledVector(N, 0.05), b = a.clone().addScaledVector(X, sd * 0.12).addScaledVector(N, -0.03).addScaledVector(U, -0.03); between(r, a, b, 0.011); }); }
  { const hb = st.head.p.clone().addScaledVector(st.head.Z, -0.16).addScaledVector(st.head.Y, -0.02), nb = st.chest.clone().addScaledVector(N, 0.02); between(C.neck, nb, hb, 0.032); C.neckK.forEach((k, i) => k.position.copy(nb).lerp(hb, (i + 0.5) / 5).addScaledVector(N, 0.018));
    const f = frameOf(st.head.Y, st.head.Z); C.head.position.copy(st.head.p); C.head.quaternion.copy(qBasis(f.X, f.Y, f.Z)); C.head.scale.setScalar(st.headS ?? 1); C.jaw.rotation.x = 0.08 + 0.5 * (st.jaw ?? 0); C.glint.material.color.set((st.glint ?? 1) > 0.5 ? '#d83020' : '#3a0c08'); C.head.visible = st.headVis !== false; C.neck.visible = C.head.visible; C.neckK.forEach((k) => (k.visible = C.head.visible)); }
  [C.torso, C.pelv, ...C.spine, ...C.ribs].forEach((m) => (m.visible = st.body !== false));
  C.arms.forEach((A, ai) => { const a = st.arms && st.arms[ai]; const vis = !!a; A.segs.forEach((m) => (m.visible = vis)); A.kn.forEach((m) => (m.visible = vis)); A.palm.visible = vis; A.f.forEach((F) => { F.s.forEach((m) => (m.visible = vis)); F.k.forEach((m) => (m.visible = vis)); F.nail.visible = vis; }); if (!vis) return;
    const S = a.S, Wp = a.W, d = Wp.clone().sub(S), pole = a.pole.clone().addScaledVector(d.clone().normalize(), -a.pole.dot(d.clone().normalize())).normalize(), zz = [0, 1, -0.7, 0.9, -0.6, 0.5, 0], amp = a.amp ?? 0.06;
    const J = zz.map((z, i) => S.clone().addScaledVector(d, i / 6).addScaledVector(pole, z * amp * (i && i < 6 ? 1 : 0)));
    A.segs.forEach((m, i) => between(m, J[i], J[i + 1], CRAW.segR * Math.sqrt(FK) * (1 - i * 0.06))); A.kn.forEach((k, i) => { k.position.copy(J[i]); k.scale.setScalar(i === 0 ? 1.3 : 1 - i * 0.04); });
    const hd = a.hand, hz = hd.Z.clone().normalize(), hy = hd.Y.clone().addScaledVector(hz, -hd.Y.dot(hz)).normalize(), hx = hy.clone().cross(hz);
    A.palm.position.copy(hd.mode === 'wrap' ? hd.palmP : Wp.clone().addScaledVector(hz, CRAW.palm * 0.5)); A.palm.quaternion.copy(qBasis(hx, hy, hz)); A.palm.scale.set(0.05 * Math.sqrt(FK), 0.018 * Math.sqrt(FK), CRAW.palm * 0.62);
    A.f.forEach((F, i) => { const P = fingerPts(Object.assign({ X: hx, Y: hy, Z: hz, O: Wp, fk: FK }, hd), i, TT); if (hd.mode === 'wrap') P[0] = A.palm.position.clone().addScaledVector(hd.A, (i < 4 ? (i - 1.5) * 0.02 : -0.04) * FK).addScaledVector(hy, -0.008);
      F.s.forEach((m, j) => between(m, P[j], P[j + 1], FR[i] * FK * (1 - j * 0.1))); F.k.forEach((k, j) => { k.position.copy(P[j + 1]); k.scale.setScalar(FR[i] * FK / 0.012 * 1.12); });
      const tip = P[4], dd = P[4].clone().sub(P[3]).normalize(); F.nail.position.copy(tip).addScaledVector(dd, 0.008); F.nail.quaternion.setFromUnitVectors(V3(0, 1, 0), dd); F.nail.scale.set(FR[i] * FK * 0.85, 0.03 * FK, FR[i] * FK * 0.85); F.tip = tip.clone().addScaledVector(dd, 0.03 * FK); }); });
  C.g.updateMatrixWorld(true); return C;
}

// ---------------- PEOPLE: the brother (hanten, gloves, headlamp), me, rescuers ----------------
const PDM = { torso: 0.5, shW: 0.18, hipW: 0.095, uArm: 0.29, fArm: 0.26, thigh: 0.43, shin: 0.41, headR: 0.1, hs: 1.0, fk: 1.0, fr: 1.0, ank: 0.07, gripR: 0.015, legR: [0.068, 0.055, 0.06] };
function mkPerson(o = {}) {
  const pd = Object.assign({}, PDM, o.pd || {}), g = new THREE.Group(), P = { kind: 'man', pd, g };
  const skin = SM({ color: o.skin || '#a87a56', roughness: 0.75 }), glove = o.gloves ? SM({ map: texLeather('glove', '#4a3a2a') }) : skin, nail = o.gloves ? glove : SM({ color: '#c09a80' });
  const jac = SM({ map: texKimono(o.key || 'hanten', o.jacket || '#26304a', o.patch || ['#3c2c1e', '#1f3c44', '#141a2e']) }), pants = SM({ map: texCloth((o.key || 'p') + 'pants', o.pants || '#2b2d29') }), boot = SM({ color: '#1a1410' }), hairM = SM({ color: '#0b0d10', roughness: 0.55 });
  P.mat = { skin, top: jac };
  const T = new THREE.Group(); g.add(T); P.T = T;
  const ch = capsule(0.13, pd.torso - 0.24, jac, 12); ch.scale.set(1.2, 1, 0.78); ch.position.y = pd.torso * 0.55; T.add(ch); P.chest = ch;
  const hem = cyl(0.17, 0.2, 0.22, jac, 14); hem.scale.set(1.05, 1, 0.75); hem.position.y = 0.04; T.add(hem);   // the hanten's skirt round the hips
  const pel = sph(0.13, pants, 1.1, 0.7, 0.85); pel.position.y = 0.0; T.add(pel);
  if (o.collar) { [-1, 1].forEach((sd) => { const c = bx(0.045, 0.32, 0.02, SM({ color: o.collar }), sd * 0.055, pd.torso * 0.62, 0.1, T); c.rotation.z = sd * 0.32; }); const b = cyl(0.168, 0.168, 0.05, SM({ color: o.collar }), 14); b.scale.set(1.2, 1, 0.78); b.position.y = 0.2; T.add(b); }
  if (o.vest) { const v = cyl(0.17, 0.165, 0.16, SM({ color: o.vest }), 14); v.scale.set(1.22, 1, 0.8); v.position.y = pd.torso * 0.5; T.add(v); }
  const Hd = new THREE.Group(); g.add(Hd); P.H = Hd;
  const sk = shd(new THREE.Mesh(new THREE.SphereGeometry(pd.headR, 24, 18), SM({ map: texFaceOf('man'), color: '#ffffff', roughness: 0.75 }))); sk.scale.set(0.9, 1.08, 0.98); sk.rotation.y = -Math.PI / 2; Hd.add(sk); P.skull = sk;
  const cap = sph(0.104, hairM, 0.95, 0.8, 0.98); cap.position.set(0, 0.035, -0.02); Hd.add(cap);
  if (o.helmet) { const hm = shd(new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 10, 0, TAU, 0, Math.PI / 2), SM({ color: o.helmet }))); hm.position.y = 0.03; Hd.add(hm); const br = cyl(0.135, 0.135, 0.015, SM({ color: o.helmet }), 16); br.position.y = 0.03; Hd.add(br); }
  if (o.lamp) { const band = shd(new THREE.Mesh(new THREE.TorusGeometry(0.104, 0.012, 5, 18), SM({ color: '#1a1a18' }))); band.rotation.x = Math.PI / 2 - 0.15; band.position.y = 0.045; Hd.add(band);
    const box = bx(0.06, 0.04, 0.035, SM({ color: '#3a3a36' }), 0, o.helmet ? 0.09 : 0.06, 0.105, Hd); void box; P.lens = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 10), SM({ color: '#ffffff', emissive: '#ffd890', emissiveIntensity: 1.5 }))); P.lens.rotation.x = Math.PI / 2; P.lens.position.set(0, o.helmet ? 0.09 : 0.06, 0.125); Hd.add(P.lens); P.lampAt = V3(0, o.helmet ? 0.09 : 0.06, 0.14); }
  P.neck = { c: shd(new THREE.Mesh(UCYL1, skin)) }; g.add(P.neck.c);
  P.armR = [0.05, 0.043, 0.055, 0.045];
  P.arm = [1, -1].map((sd) => ({ sd, up: shd(new THREE.Mesh(UCYL, jac)), fo: shd(new THREE.Mesh(UCYL, jac)), sj: sph(1, jac), ej: sph(1, jac), hand: mkHand(P, sd === 1 ? -1 : 1, glove, nail) }));
  P.arm.forEach((a) => [a.up, a.fo, a.sj, a.ej].forEach((m) => g.add(m))); P.arm.forEach((a) => { a.cuff = cyl(1, 1, 1, o.gloves ? glove : jac, 10); g.add(a.cuff); });
  const mkFoot = () => { const fg = new THREE.Group(); g.add(fg); const b = capsule(0.042, 0.16, boot, 6); b.rotation.x = Math.PI / 2; b.scale.set(1.05, 1, 0.8); b.position.set(0, -0.035, 0.05); fg.add(b); bx(0.09, 0.02, 0.26, boot, 0, -0.065, 0.05, fg); return fg; };
  P.leg = [1, -1].map((sd) => ({ sd, th: shd(new THREE.Mesh(UCYL, pants)), sh: shd(new THREE.Mesh(UCYL, pants)), kj: sph(1, pants), foot: mkFoot() }));
  P.leg.forEach((l) => [l.th, l.sh, l.kj].forEach((m) => g.add(m)));
  g.traverse((m) => { if (m.isMesh) m.frustumCulled = false; }); return P;
}

// ---------------- the world ----------------
function world() {
  if (WJ) return WJ;
  const scene = new THREE.Scene(), Wd = { scene }; WJ = Wd;
  scene.background = lin('#0b1a22'); scene.fog = new THREE.Fog('#172728', 8, 60);
  Wd.cam = new THREE.PerspectiveCamera(50, YK.LW / YK.LH, 0.03, 900);
  Wd.hemi = new THREE.HemisphereLight('#4e8389', '#221c15', 0.6); scene.add(Wd.hemi);
  const moon = new THREE.DirectionalLight('#8fb1b0', 0.5); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); const sc = moon.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 14; sc.bottom = -14; sc.near = 1; sc.far = 160; moon.shadow.bias = -0.0008;
  scene.add(moon); scene.add(moon.target); Wd.moon = moon;
  Wd.rim = new THREE.DirectionalLight('#b9cbc6', 0); scene.add(Wd.rim); scene.add(Wd.rim.target);
  { const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.MeshBasicMaterial({ map: texSky(), side: THREE.BackSide, fog: false })); scene.add(sky); Wd.sky = sky;
    Wd.ridges = [[400, '#0e1c22', 0], [320, '#14262c', 1], [250, '#1a3036', 2]].map(([r, c, k]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 70, 48, 1, true), new THREE.MeshBasicMaterial({ color: c, map: texRidge(k), alphaTest: 0.5, side: THREE.BackSide, fog: false })); m.material.map.repeat.set(5, 1); m.userData.y = 22 - k * 5; scene.add(m); return m; });
    Wd.moonDisk = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texMoon(), transparent: true, fog: false, depthWrite: false })); scene.add(Wd.moonDisk);
    Wd.moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(200,225,220,0.55)'], [0.35, 'rgba(120,170,170,0.18)'], [1, 'rgba(60,110,110,0)']]), transparent: true, depthWrite: false, fog: false })); scene.add(Wd.moonHalo); }
  // the town below: warm windows far down the valley
  { const R = RNG('town'), n = 160, P = []; for (let i = 0; i < n; i++) { const x = R.r(-90, 90), z = R.r(140, 260); P.push(x, -24 - 0.08 * (z - 140) + R.r(0, 3), z); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    Wd.town = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#e8a860', size: 2, sizeAttenuation: false, fog: false })); scene.add(Wd.town); }
  mkExt(Wd); mkCham(Wd); mkSec(Wd); Wd.craw = mkCrawler(Wd);
  Wd.bro = mkPerson({ key: 'bro', jacket: '#465a72', patch: ['#8e3a24', '#5a4430', '#26304a'], collar: '#191b18', gloves: true, lamp: true, pants: '#5a4430' }); scene.add(Wd.bro.g);
  Wd.me = mkPerson({ key: 'me', jacket: '#3f4542', patch: ['#2b2d29', '#5a4430'], pants: '#191b18', collar: '#5a2418' }); scene.add(Wd.me.g);
  Wd.res = [0, 1, 2].map((i) => { const P = mkPerson({ key: 'res' + i, jacket: '#8e3a24', patch: ['#5a2418', '#a07c50'], pants: '#26304a', helmet: '#cfae78', lamp: true, gloves: true, vest: '#cfae78' }); scene.add(P.g); return P; });
  // lights (a fixed set: intensities change per shot, the count never does)
  Wd.lamp = new THREE.SpotLight('#ffd8a0', 0, 14, 0.42, 0.45, 1.2); Wd.lamp.castShadow = true; Wd.lamp.shadow.mapSize.set(1024, 1024); Wd.lamp.shadow.bias = -0.0015; Wd.lamp.shadow.camera.near = 0.05; scene.add(Wd.lamp); scene.add(Wd.lamp.target);
  Wd.key = new THREE.SpotLight('#b9cbc6', 0, 200, 0.5, 0.6, 1.0); Wd.key.castShadow = true; Wd.key.shadow.mapSize.set(1024, 1024); Wd.key.shadow.bias = -0.0008; scene.add(Wd.key); scene.add(Wd.key.target);
  Wd.fill = new THREE.PointLight('#e8a860', 0, 20, 1.5); scene.add(Wd.fill);
  Wd.bounce = new THREE.PointLight('#c89060', 0, 4, 1.6); scene.add(Wd.bounce);
  { const cg = new THREE.ConeGeometry(1, 1, 24, 1, true).translate(0, -0.5, 0).rotateX(-Math.PI / 2); const ca = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0.0)'); g.addColorStop(0.15, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 8, 64, false);
    Wd.cones = [0, 1, 2].map(() => { const m = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ color: '#ffd8a0', alphaMap: ca, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })); m.visible = false; scene.add(m); return m; }); }
  Wd.glows = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,240,200,1)'], [0.2, 'rgba(255,200,120,0.6)'], [1, 'rgba(230,140,60,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.visible = false; scene.add(s); return s; });
  { const R = RNG('motes'), n = 260, geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); Wd.moteP = [...Array(n)].map(() => ({ x: R.n(1), y: R.n(1), z: R.n(1), ph: R.r(0, TAU), v: R.r(0.3, 1) }));
    Wd.motes = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#d8e4e0', size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false })); Wd.motes.frustumCulled = false; scene.add(Wd.motes); }
  { const R = RNG('mist'), t = g3Radial([[0, 'rgba(160,200,200,0.5)'], [0.5, 'rgba(120,170,170,0.18)'], [1, 'rgba(100,150,150,0)']], 64); Wd.mist = [];
    for (let i = 0; i < 40; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0.4 })); s.userData = { ph: R.r(0, TAU), q: V3(R.n(1), R.n(1) * 0.5, R.n(1)), s: R.r(0.6, 1.4) }; s.visible = false; scene.add(s); Wd.mist.push(s); } }
  const grad = new THREE.DataTexture(new Uint8Array([45, 45, 45, 255, 135, 135, 135, 255, 255, 255, 255, 255]), 3, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const done = new Map(); scene.traverse((m) => { if (!m.isMesh || !m.material) return; const conv = (o) => { if (!o.isMeshStandardMaterial) return o; if (!done.has(o)) { const t = new THREE.MeshToonMaterial({ color: o.color, map: o.map, alphaMap: o.alphaMap, alphaTest: o.alphaTest, vertexColors: o.vertexColors, side: o.side, gradientMap: grad, transparent: o.transparent, opacity: o.opacity, depthWrite: o.depthWrite, emissive: o.emissive, emissiveIntensity: o.emissiveIntensity }); if (o.onBeforeCompile && o.customProgramCacheKey) { t.onBeforeCompile = o.onBeforeCompile; t.customProgramCacheKey = o.customProgramCacheKey; } done.set(o, t); } return done.get(o); };
    m.material = Array.isArray(m.material) ? m.material.map(conv) : conv(m.material); });
  Wd.toon = done; return Wd;
}
const LIGHT = {
  night: { hemS: '#346c76', hemG: '#221c15', hemI: 0.5, moonC: '#8fb1b0', moonI: 0.55, fog: '#0b1a22', fn: 6, ff: 70, bg: '#06090f', exp: 1.15, sky: 0.8 },
  cave:  { hemS: '#1f3c44', hemG: '#06090f', hemI: 0.2, moonC: '#4e8389', moonI: 0, fog: '#0b1a22', fn: 0.6, ff: 8, bg: '#06090f', exp: 1.3, sky: 0 },
  dusk:  { hemS: '#4e8389', hemG: '#5a4430', hemI: 0.95, moonC: '#cfae78', moonI: 0.7, fog: '#1f3c44', fn: 10, ff: 110, bg: '#0b2c38', exp: 1.2, sky: 1, skyMap: 'dusk' },
};
function setLight(Wd, L) {
  Wd.hemi.color.set(L.hemS); Wd.hemi.groundColor.set(L.hemG); Wd.hemi.intensity = L.hemI; Wd.moon.color.set(L.moonC); Wd.moon.intensity = L.moonI;
  Wd.scene.fog.color.set(L.fog); Wd.scene.fog.near = L.fn; Wd.scene.fog.far = L.ff; Wd.scene.background.set(L.bg); rend().r.toneMappingExposure = L.exp;
  Wd.sky.visible = L.sky > 0; Wd.sky.material.color.setScalar(L.sky); { const m = L.skyMap === 'dusk' ? texSkyDusk() : texSky(); if (Wd.sky.material.map !== m) { Wd.sky.material.map = m; Wd.sky.material.needsUpdate = true; } } Wd.ridges.forEach((m) => (m.visible = L.sky > 0.5)); Wd.moonDisk.visible = Wd.moonHalo.visible = L.sky > 0.5 && L.sky < 1.5 && L.skyMap !== 'dusk'; Wd.town.visible = L.sky > 0;
}
