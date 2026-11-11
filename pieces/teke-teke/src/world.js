// =====================================================================
//  WORLD — helpers and the person rig (two-bone IK, jointed fingers, poseP) from pieces/gashadokuro; the teke-teke
//  set (snowy railway, wall, crossing), the girl and the boys follow below.
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


// =====================================================================
//  TEKE TEKE — one set: a small snowy town in Niigata at night. A single-track railway runs along x (centre z = TZ),
//  a long concrete block wall faces it (front face z = WZ) with a footpath between, houses behind the wall and across
//  the track, utility poles, a level crossing at x = XC (red flashing lamps, crossbucks, a bell, barrier arms).
//  The girl (upper body only, posed from world points), the two boys (gakuran, scarves, bags), a train.
// =====================================================================
const TZ = 1.4, WZ = -1.4, WH = 1.85, WT = 1.93, WX1 = 10.6, XC = 14, P1 = V3(XC - 2.6, 0, TZ - 2.0), P2 = V3(XC + 2.6, 0, TZ + 2.0);
const RAIL = 0.26;   // top of the rails
function gT(x, z) {
  const n = 0.04 * (fbm2(x * 0.45, z * 0.45) - 0.5), dz = Math.abs(z - TZ);
  let h = 0.02 + n;
  if (z > WZ - 0.05 && x < WX1 + 0.3) h += 0.24 * ss(WZ + 0.75, WZ, z) * (0.55 + 0.45 * fbm2(x * 0.6, 1.3));   // drift at the foot of the wall
  if (z < WZ - 0.2) h += 0.06 + 0.25 * ss(0.55, 0.85, fbm2(x * 0.25, z * 0.25));                                 // yards behind the wall
  h = lerp(h, 0.14, ss(1.7, 1.2, dz));                                                                           // the track bed
  if (Math.abs(x - XC) < 2.6) h = lerp(h, 0.2, ss(4, 2.4, dz) * ss(2.6, 2.1, Math.abs(x - XC)));               // the road rises to the rails
  return h;
}
function texBlock() { return txCanvas('block', 256, 256, (x, w, h, R) => { x.fillStyle = '#9a9c94'; x.fillRect(0, 0, w, h);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { const off = r % 2 ? 32 : 0, bx0 = c * 64 + off, by = r * 32; x.fillStyle = R.pick(['#a4a69e', '#8e9088', '#9a9c94', '#868880', '#a8a69a']); x.fillRect(bx0 + 1, by + 1, 62, 30); x.fillRect(bx0 + 1 - 256, by + 1, 62, 30);
    speckle(x, R, 0, 0, 0, ['#000']); for (let k = 0; k < 18; k++) { x.fillStyle = R.pick(['rgba(40,44,40,0.25)', 'rgba(200,200,190,0.2)']); x.fillRect(bx0 + R.r(2, 60), by + R.r(2, 28), 2, 2); } }
  x.fillStyle = '#5a5c56'; for (let r = 0; r <= 8; r++) x.fillRect(0, r * 32 - 1, w, 2); for (let r = 0; r < 8; r++) for (let c = 0; c <= 4; c++) x.fillRect(c * 64 + (r % 2 ? 32 : 0) - 1, r * 32, 2, 32);
  for (let i = 0; i < 10; i++) { x.fillStyle = 'rgba(28,36,40,0.3)'; blob(x, R.r(0, w), R.r(0, 50), R.r(10, 26), R); x.fill(); }                                  // wet patches under the snow cap
  for (let i = 0; i < 18; i++) { const sx = R.r(0, w), L = R.r(30, 150), ww = R.r(1.5, 3.5); x.fillStyle = 'rgba(24,32,36,0.42)'; x.fillRect(sx, 0, ww, L); x.beginPath(); x.arc(sx + ww / 2, L, ww * 0.9, 0, TAU); x.fill(); }   // meltwater drips
  for (let i = 0; i < 6; i++) crack(x, R, R.r(0, w), R.r(0, h), 5, R.n(4), 6, 'rgba(30,30,28,0.6)', 1); }, [1, 1]); }
function texSnow() { return txCanvas('snow', 256, 256, (x, w, h, R) => { x.fillStyle = '#e4ecec'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { x.fillStyle = R.pick(['rgba(160,190,196,0.18)', 'rgba(255,255,255,0.3)', 'rgba(120,150,160,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(8, 30), R); x.fill(); }
  speckle(x, R, w, h, 500, ['rgba(140,170,176,0.35)', 'rgba(255,255,255,0.6)'], [1, 2]); }, [1, 1]); }
function texSiding(key, base) { return txCanvas('sid' + key, 128, 128, (x, w, h, R) => { x.fillStyle = base; x.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) { x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, y, w, 1); x.fillStyle = 'rgba(255,255,255,0.06)'; x.fillRect(0, y + 1, w, 1); }
  speckle(x, R, w, h, 200, ['rgba(0,0,0,0.15)', 'rgba(255,255,255,0.05)']); for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(30,20,10,0.25)'; x.fillRect(R.r(0, w), 0, R.r(1, 3), h); } }, [1, 1]); }
function texStripe(key, a = '#d8b030', b = '#14110c', n = 8) { return txCanvas('str' + key, 128, 16, (x, w, h) => { x.fillStyle = a; x.fillRect(0, 0, w, h); x.fillStyle = b; for (let i = -2; i < n * 2; i++) { x.beginPath(); const s = w / n; x.moveTo(i * s, 0); x.lineTo(i * s + s / 2, 0); x.lineTo(i * s + s / 2 - 8, h); x.lineTo(i * s - 8, h); x.fill(); } }, [1, 1]); }
function texBlouse() { return txCanvas('blouse', 128, 128, (x, w, h, R) => { x.fillStyle = '#242c40'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) { x.fillStyle = 'rgba(8,10,16,0.4)'; x.fillRect(R.r(0, w), 0, R.r(1, 3), h); }                                     // folds
  for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(6,8,12,0.45)'; blob(x, R.r(0, w), R.r(0, h), R.r(8, 18), R); x.fill(); }                        // soaked, darker patches
  for (let i = 0; i < 7; i++) { x.fillStyle = R.pick(['rgba(70,58,44,0.45)', 'rgba(50,44,36,0.4)']); blob(x, R.r(0, w), R.r(0, h), R.r(3, 9), R); x.fill(); }   // dirt
  for (let i = 0; i < 6; i++) { x.fillStyle = '#9aa2a0'; x.beginPath(); const cx = R.r(8, w - 8), cy = R.r(8, h - 8); x.moveTo(cx, cy - R.r(5, 10)); for (let k = 0; k < 5; k++) x.lineTo(cx + R.n(3), cy - 6 + k * 3 + R.n(1)); x.lineTo(cx + 2, cy + R.r(5, 9)); x.closePath(); x.fill(); x.fillStyle = '#05060a'; x.fillRect(cx - 0.5, cy - 4, 1, 8); }   // tears (pale skin through a dark rip)
  speckle(x, R, w, h, 140, ['rgba(230,240,240,0.7)', 'rgba(200,215,215,0.5)'], [1, 2]);                                                              // snow caught in the cloth
  speckle(x, R, w, h, 160, ['rgba(0,0,0,0.15)', 'rgba(120,140,160,0.12)']); }, [1, 1]); }
function texCollar() { return txCanvas('collar', 64, 64, (x, w, h) => { x.fillStyle = '#1c2436'; x.fillRect(0, 0, w, h); x.fillStyle = '#d8d8cc'; x.fillRect(0, h - 10, w, 3); x.fillRect(0, h - 16, w, 2); x.fillRect(4, 0, 3, h); x.fillRect(10, 0, 2, h); x.fillRect(w - 7, 0, 3, h); x.fillRect(w - 12, 0, 2, h); }, [1, 1]); }
// her face: narrow and gaunt, grey-blue waxy skin, mottling and veins; small eyes deep in dark hollow sockets (whites showing,
// pinprick pupils), uneven brows; a mouth stretched too wide with thin cracked lips, small uneven teeth and dark gums
function texGirlFace() { return txCanvas('gface', 512, 256, (x, w, h, R) => {
  x.fillStyle = '#9eacb2'; x.fillRect(0, 0, w, h); const fx = w / 2;
  for (let i = 0; i < 70; i++) { x.fillStyle = R.pick(['rgba(110,120,150,0.18)', 'rgba(150,160,150,0.2)', 'rgba(90,96,120,0.2)', 'rgba(190,196,196,0.18)', 'rgba(120,100,120,0.15)']); blob(x, R.r(0, w), R.r(0, h), R.r(6, 22), R); x.fill(); }   // mottling
  const rg = (cx, cy, rx, ry, c0, c1 = 'rgba(0,0,0,0)') => { x.save(); x.translate(cx, cy); x.scale(1, ry / rx); const g = x.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, c0); g.addColorStop(1, c1); x.fillStyle = g; x.beginPath(); x.arc(0, 0, rx, 0, TAU); x.fill(); x.restore(); };
  [-1, 1].forEach((sd) => { rg(fx + sd * 50, 152, 30, 34, 'rgba(30,38,52,0.55)'); rg(fx + sd * 64, 96, 22, 30, 'rgba(30,38,52,0.4)'); });                         // sunken cheeks, temples
  rg(fx, 120, 22, 30, 'rgba(200,206,206,0.25)'); rg(fx, 196, 26, 14, 'rgba(200,206,206,0.18)');                                                                    // nose bridge and chin catch the light
  x.strokeStyle = 'rgba(60,76,120,0.55)'; x.lineWidth = 1.2; for (let i = 0; i < 12; i++) { x.beginPath(); let px = fx + (R.f() < 0.5 ? -1 : 1) * R.r(40, 80), py = R.r(60, 220); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += R.n(6); py += R.r(3, 9); x.lineTo(px, py); } x.stroke(); }   // veins
  [-1, 1].forEach((sd) => { const ex = fx + sd * 30, ey = 116 + (sd > 0 ? 2 : 0);
    rg(ex, ey, 26, 19, 'rgba(8,10,14,0.95)', 'rgba(20,24,30,0)'); rg(ex, ey, 15, 10, 'rgba(4,4,6,1)', 'rgba(8,8,10,0.8)');                                      // hollow sockets
    x.fillStyle = '#c4c0a8'; x.beginPath(); x.ellipse(ex, ey, sd > 0 ? 9 : 8, sd > 0 ? 4.2 : 3.6, sd * 0.12, 0, TAU); x.fill();                                 // small eyes, whites showing
    x.fillStyle = '#2a2a26'; x.beginPath(); x.arc(ex + sd * 1, ey + 0.3, 2.6, 0, TAU); x.fill(); x.fillStyle = '#ff2a14'; x.fillRect(ex + sd * 1 - 0.8, ey - 0.5, 1.6, 1.6);   // pinprick pupils
    x.strokeStyle = 'rgba(20,20,24,0.8)'; x.lineWidth = 1.2; x.beginPath(); x.ellipse(ex, ey - 1, 10, 5, 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
    x.fillStyle = 'rgba(30,26,26,0.85)'; x.save(); x.translate(ex + sd * 2, sd > 0 ? 95 : 99); x.rotate(sd > 0 ? -0.32 : 0.08); x.fillRect(-14, -1.6, 28, 3.2); x.restore(); });   // uneven brows
  x.fillStyle = 'rgba(40,46,56,0.6)'; x.fillRect(fx - 7, 147, 4, 3); x.fillRect(fx + 3, 147, 4, 3); x.fillStyle = 'rgba(60,70,80,0.35)'; x.fillRect(fx - 2, 112, 4, 32);
  // the mouth: stretched far too wide, corners dragged up and back, thin cracked lips, dark gums, small uneven teeth
  const W2 = 74, up = (u) => 168 - 9 * Math.pow(Math.abs(u), 2.2), lo = (u) => up(u) + 8 * (1 - u * u) + 1;
  x.fillStyle = '#5e4c5a'; x.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 20 - 1; x.lineTo(fx + u * (W2 + 3), up(u) - 2.5); } for (let i = 40; i >= 0; i--) { const u = i / 20 - 1; x.lineTo(fx + u * (W2 + 3), lo(u) + 2.5); } x.fill();   // lips
  x.fillStyle = '#0a0406'; x.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 20 - 1; x.lineTo(fx + u * W2, up(u)); } for (let i = 40; i >= 0; i--) { const u = i / 20 - 1; x.lineTo(fx + u * W2, lo(u)); } x.fill();
  x.fillStyle = '#3a1418'; for (let i = -18; i <= 18; i++) { const u = i / 20; x.fillRect(fx + u * W2 - 2, up(u), 4.5, 2); }                                                          // dark gums
  for (let i = -15; i <= 15; i++) { const u = i / 17, hh = 2 + 2.5 * hsh(i, 5) * (1 - 0.5 * u * u); if (hsh(i, 9) < 0.12) continue; x.fillStyle = R.pick(['#b8b098', '#a8a084', '#c4bca4']); x.fillRect(fx + u * (W2 - 6) - 1.2, up(u) + 1.5, 2.6 + hsh(i, 2), hh); }   // upper teeth hang from the gum
  for (let i = -13; i <= 13; i++) { const u = i / 15, hh = 1.5 + 2 * hsh(i, 7); if (hsh(i, 11) < 0.15) continue; x.fillStyle = R.pick(['#a8a084', '#b8b098']); x.fillRect(fx + u * (W2 - 12) + 1, lo(u) - hh, 2.4, hh); }   // lower teeth rise from the lip
  x.strokeStyle = 'rgba(210,200,200,0.5)'; x.lineWidth = 0.8; for (let i = 0; i < 22; i++) { const u = R.r(-1, 1), y0 = R.f() < 0.5 ? up(u) - 2.5 : lo(u) + 0.5; x.beginPath(); x.moveTo(fx + u * W2, y0); x.lineTo(fx + u * W2 + R.n(1), y0 + 2); x.stroke(); }   // cracks
  x.strokeStyle = 'rgba(30,20,26,0.7)'; x.lineWidth = 1.2; [-1, 1].forEach((sd) => { x.beginPath(); x.moveTo(fx + sd * (W2 + 2), up(sd)); x.lineTo(fx + sd * (W2 + 12), up(sd) - 7); x.stroke(); });   // corners split on
  x.fillStyle = 'rgba(14,18,24,0.6)'; x.fillRect(0, 0, w * 0.22, h); x.fillRect(w * 0.78, 0, w * 0.22, h);
}, [1, 1]); }
function texBag(key, base) { return txCanvas('bag' + key, 64, 64, (x, w, h, R) => { x.fillStyle = base; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, 20, w, 3); x.fillRect(28, 20, 8, 14); x.fillStyle = '#b8a47a'; x.fillRect(30, 26, 4, 4); speckle(x, R, w, h, 120, ['rgba(255,255,255,0.08)', 'rgba(0,0,0,0.15)']); }, [1, 1]); }
function texTrain() { return txCanvas('train', 256, 64, (x, w, h, R) => { x.fillStyle = '#b4bab2'; x.fillRect(0, 0, w, h); x.fillStyle = '#1f6a6a'; x.fillRect(0, 44, w, 6); x.fillStyle = '#5a2418'; x.fillRect(0, 52, w, 2);
  speckle(x, R, w, h, 200, ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.1)']); for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(60,50,40,0.25)'; x.fillRect(R.r(0, w), 50, R.r(4, 20), 14); } }, [1, 1]); }
function texSkyDawn() { return txCanvas('skydawn', 512, 256, (x, w, h, R) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#4a6e7a'); g.addColorStop(0.4, '#7e9ea6'); g.addColorStop(0.68, '#b8ccce'); g.addColorStop(0.8, '#e8c8a0'); g.addColorStop(0.86, '#f0b080'); g.addColorStop(0.92, '#a8a294'); g.addColorStop(1, '#7a8686'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { x.fillStyle = R.pick(['rgba(230,236,236,0.22)', 'rgba(110,140,150,0.2)', 'rgba(250,210,170,0.18)']); x.beginPath(); x.ellipse(R.r(0, w), R.r(h * 0.2, h * 0.78), R.r(30, 120), R.r(2, 7), 0, 0, TAU); x.fill(); } }, [1, 1]); }

function texFacePlain(key, skin) { return txCanvas('fp' + key, 256, 128, (x, w, h, R) => { x.fillStyle = skin; x.fillRect(0, 0, w, h); const fx = w / 2;
  for (let i = 0; i < 30; i++) { x.fillStyle = R.pick(['rgba(60,36,20,0.18)', 'rgba(255,230,210,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(4, 14), R); x.fill(); }
  [-1, 1].forEach((sd) => { x.fillStyle = 'rgba(40,24,14,0.35)'; x.beginPath(); x.ellipse(fx + sd * 12, 58, 8, 6, 0, 0, TAU); x.fill(); });
  x.fillStyle = 'rgba(40,24,14,0.3)'; x.fillRect(fx - 1, 62, 2, 12); x.fillStyle = 'rgba(20,12,8,0.35)'; x.fillRect(0, 0, w * 0.18, h); x.fillRect(w * 0.82, 0, w * 0.18, h); }, [1, 1]); }
// a house: box walls with siding, a gable roof under snow, windows (some lit warm)
function mkHouse(par, x, z, w, d, h, ry, R, lit = 0.6) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; par.add(g);
  const wall = SM({ map: texSiding(R.pick(['a', 'b', 'c']), R.pick(['#5a4430', '#4a4e4a', '#6a5038', '#3c4446'])) }); bx(w, h, d, wall, 0, h / 2, 0, g);
  const roofM = SM({ color: '#2b2d29' }), snowM = SM({ map: texSnow(), color: '#ffffff' }), pitch = 0.5, rl = (d / 2 + 0.35) / Math.cos(pitch);
  [-1, 1].forEach((sd) => { const r = bx(w + 0.5, 0.1, rl, roofM, 0, h + Math.tan(pitch) * d / 4 + 0.05, sd * d / 4, g); r.rotation.x = sd * pitch; const s = bx(w + 0.55, 0.14, rl, snowM, 0, h + Math.tan(pitch) * d / 4 + 0.16, sd * (d / 4 - 0.02), g); s.rotation.x = sd * pitch; });
  const gab = new THREE.Shape(); gab.moveTo(-d / 2, 0); gab.lineTo(d / 2, 0); gab.lineTo(0, Math.tan(pitch) * d / 2); gab.closePath(); [-1, 1].forEach((sd) => { const m = shd(new THREE.Mesh(new THREE.ShapeGeometry(gab), wall)); m.rotation.y = Math.PI / 2 * sd; m.position.set(sd * w / 2, h, 0); g.add(m); });
  const win = []; const nw = Math.max(1, Math.floor(w / 2.2)); for (let i = 0; i < nw; i++) for (let fl = 0; fl < (h > 4 ? 2 : 1); fl++) { const on = R.f() < lit, m = bx(0.9, 0.75, 0.04, on ? SM({ color: '#ffd8a0', emissive: '#e8a860', emissiveIntensity: 1.3 }) : SM({ color: '#0e1418' }), -w / 2 + (i + 0.5) * w / nw, 1.3 + fl * 2.4, d / 2 + 0.02, g);
    bx(1.0, 0.06, 0.08, SM({ color: '#2a201a' }), m.position.x, m.position.y - 0.42, d / 2 + 0.04, g); if (on) win.push(m); }
  return { g, win };
}
function mkCrossPole(par, P, face) {   // face: +1 / −1, the side the barrier arm swings across (+x / −x)
  const g = new THREE.Group(); g.position.copy(P).setY(gT(P.x, P.z)); par.add(g); const grey = SM({ color: '#b4b4ac' }), blk = SM({ color: '#14110c' });
  const pole = cyl(0.065, 0.07, 3.3, grey, 10); pole.position.y = 1.65; g.add(pole); const base = cyl(0.075, 0.075, 0.9, SM({ map: texStripe('pole') }), 10); base.position.y = 0.45; base.material.map.repeat.set(1, 1); base.rotation.z = 0; g.add(base);
  [-1, 1].forEach((sd) => { const b = bx(1.35, 0.17, 0.03, SM({ map: texStripe('xb', '#d8b030', '#14110c', 6) }), 0, 2.85, 0.08, g); b.rotation.z = sd * 0.62; const b2 = b.clone(); b2.position.z = -0.08; g.add(b2); });   // the crossbuck
  const bar = bx(0.9, 0.06, 0.06, blk, 0, 2.25, 0, g); void bar; const lamps = [];
  [-1, 1].forEach((sd) => { [-1, 1].forEach((fz) => { const vis = bx(0.3, 0.3, 0.05, blk, sd * 0.36, 2.25, fz * 0.06, g); void vis; const hood = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.14, 14, 1, true, 0, Math.PI), blk)); hood.rotation.set(Math.PI / 2 * fz, 0, 0); hood.position.set(sd * 0.36, 2.25, fz * 0.13); g.add(hood);
    const lens = shd(new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), SM({ color: '#5a1410', emissive: '#ff2a10', emissiveIntensity: 0 }))); lens.position.set(sd * 0.36, 2.25, fz * 0.09); if (fz < 0) lens.rotation.y = Math.PI; g.add(lens); lamps.push({ m: lens, sd }); }); });
  const bell = sph(0.12, SM({ color: '#2b2d29' }), 1, 0.8, 1); bell.position.y = 3.38; g.add(bell);
  const box = bx(0.3, 0.42, 0.26, SM({ color: '#b4b4ac' }), face * 0.24, 0.95, 0, g); void box;
  const pv = new THREE.Group(); pv.position.set(face * 0.42, 1.0, 0); g.add(pv); const arm = bx(4.2, 0.075, 0.075, SM({ map: texStripe('arm', '#d8b030', '#14110c', 14) }), face * 2.1, 0, 0, pv); arm.material.map.repeat.set(1, 1);
  const cw = bx(0.5, 0.18, 0.12, blk, -face * 0.25, 0, 0, pv); void cw;
  return { g, lamps, pv, face };
}
function mkTrain(par, Wd) {   // a commuter train: a front cab, lit windows, doors, bogies with wheels
  const g = new THREE.Group(); par.add(g); const body = SM({ map: texTrain() }), roof = SM({ color: '#6e706a' }), glass = SM({ color: '#c8a070', emissive: '#c88848', emissiveIntensity: 0.75 }), dark = SM({ color: '#14110c' }), steel = SM({ color: '#3a3a36', roughness: 0.5 }), door = SM({ color: '#8a908a' });
  Wd.wheels = [];
  for (let c = 0; c < 4; c++) { const cg = new THREE.Group(); cg.position.x = -c * 13.4; g.add(cg); bx(13, 2.6, 2.8, body, 0, 0.95 + 1.3, 0, cg); bx(13, 0.22, 2.6, roof, 0, 3.66, 0, cg); bx(12.4, 0.35, 2.5, dark, 0, 0.82, 0, cg);
    for (let i = 0; i < 6; i++) [-1, 1].forEach((sd) => { bx(1.25, 0.85, 0.04, glass, -5.3 + i * 2.12, 2.55, sd * 1.42, cg); bx(1.35, 0.06, 0.05, dark, -5.3 + i * 2.12, 2.12, sd * 1.425, cg); bx(0.08, 0.9, 0.05, dark, -5.3 + i * 2.12 - 0.66, 2.55, sd * 1.425, cg); for (let k2 = 0; k2 < 2; k2++) bx(0.22, 0.4, 0.02, SM({ color: '#2a201a' }), -5.6 + i * 2.12 + k2 * 0.55, 2.35, sd * 1.405, cg); });
    [-3.9, 0.1, 4.1].forEach((dx) => [-1, 1].forEach((sd) => bx(1.05, 2.0, 0.03, door, dx, 1.95, sd * 1.415, cg)));
    [-4.4, 4.4].forEach((bxx) => { const bg = new THREE.Group(); bg.position.set(bxx, 0, 0); cg.add(bg); bx(2.6, 0.3, 2.0, steel, 0, 0.55, 0, bg);
      [-0.85, 0.85].forEach((wx) => [-0.62, 0.62].forEach((wz) => { const wh = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 12), steel)); wh.rotation.x = Math.PI / 2; wh.position.set(wx, 0.44, wz); bg.add(wh); const sp = bx(0.08, 0.6, 0.11, dark, wx, 0.44, wz, bg); wh.add(sp); sp.position.set(0, 0, 0); sp.rotation.x = -Math.PI / 2; Wd.wheels.push(wh); })); }); }
  // the cab: a raked windshield, a destination sign, two headlights
  const cab = new THREE.Group(); cab.position.x = 6.5; g.add(cab); const ws = bx(0.06, 1.2, 2.4, SM({ color: '#0e1418', roughness: 0.2 }), 0.05, 2.55, 0, cab); ws.rotation.z = -0.18;
  bx(0.06, 0.28, 1.2, SM({ color: '#ffe8a0', emissive: '#ffcc60', emissiveIntensity: 1.4 }), 0.12, 3.35, 0, cab); bx(0.1, 0.9, 2.8, body, 0.0, 1.45, 0, cab);
  Wd.hlights = [-0.85, 0.85].map((z) => bx(0.06, 0.2, 0.32, SM({ color: '#ffffff', emissive: '#fff4d0', emissiveIntensity: 2.2 }), 0.08, 1.3, z, cab));
  g.position.set(-200, 0, TZ); g.visible = false; return g;
}
function mkTown(Wd) {
  const G = new THREE.Group(); Wd.scene.add(G); Wd.town3 = G; const R = RNG('town3');
  const xs = gridAxis(-70, 70, [[-30, 30]], 0.25, 2), zs = gridAxis(-40, 50, [[-3, 4.5]], 0.15, 1), cS = lin('#ffffff'), cB = lin('#9aa6a4'), cR = lin('#6a6a60'), tmp = new THREE.Color();
  const gr = heightMesh(xs, zs, gT, (x, z) => { tmp.copy(cS).lerp(cB, 0.35 * fbm2(x * 0.5, z * 0.5)); const dz = Math.abs(z - TZ); tmp.lerp(cR, 0.55 * ss(1.0, 0.75, dz) * ss(0.45, 0.75, fbm2(x * 2, z * 3)));   // ballast through the snow near the rails
    if (Math.abs(x - XC) < 2.2 && dz > 1.3) tmp.lerp(cB, 0.45 * ss(0.3, 0, Math.abs(Math.abs(x - XC) - 0.9)));   // tyre ruts on the road
    if (z > WZ && z < WZ + 1.3 && x < WX1) tmp.lerp(cB, 0.25 * ss(0.5, 0.2, Math.abs(z - WZ - 0.75)));   // the trodden footpath
    return tmp.clone(); }, SM({ map: texSnow(), vertexColors: true, color: '#ffffff' })); gr.material.map.repeat.set(1, 1); G.add(gr);
  // the track: sleepers every 0.6 (half buried), two rails
  { const sl = IM(new THREE.BoxGeometry(0.22, 0.1, 2.0), SM({ color: '#4a3e2e' }), 220); let n = 0; for (let x = -65; x < 65; x += 0.6) sl.setMatrixAt(n++, M4c(x, 0.045 + 0.02 * hsh(n, 3), TZ, 0, 1, 1, 1)); sl.count = n; G.add(sl);
    const rl = SM({ map: texRust(), color: '#9a9088', roughness: 0.5 }); [-0.534, 0.534].forEach((dz) => { const r = bx(130, 0.11, 0.07, rl, 0, RAIL - 0.055, TZ + dz, G); void r; const h = bx(130, 0.02, 0.03, SM({ color: '#c8ccc4', roughness: 0.3 }), 0, RAIL + 0.005, TZ + dz, G); void h; }); }
  // the concrete block wall with a snow cap, posts every 2 m, ofuda near the end
  { const L = WX1 + 60, blk = SM({ map: texBlock() }); blk.map.repeat.set(L / 1.6, WH / 1.6); const w = bx(L, WH, 0.16, blk, WX1 - L / 2, WH / 2, WZ - 0.08, G); Wd.wall = w;
    const cap = bx(L, 0.06, 0.2, SM({ color: '#7a7c76' }), WX1 - L / 2, WH + 0.03, WZ - 0.08, G); void cap;
    const sn = SM({ map: texSnow(), color: '#ffffff' }); const sc = IM(new THREE.SphereGeometry(1, 8, 5), sn, 400); let n = 0; for (let x = WX1 - L; x < WX1 - 0.1; x += 0.35) { sc.setMatrixAt(n++, M4c(x, WH + 0.06, WZ - 0.08, 0, 0.32, 0.075 + 0.03 * fbm2(x, 2), 0.13)); } sc.count = n; G.add(sc);
    const end = bx(0.3, WH + 0.12, 0.3, SM({ map: texBlock(), color: '#b0b0a8' }), WX1, (WH + 0.12) / 2, WZ - 0.08, G); void end; const es = sph(0.2, sn, 1, 0.45, 1); es.position.set(WX1, WH + 0.16, WZ - 0.08); G.add(es);
    mkOfuda(G, V3(8.7, 1.28, WZ + 0.005), 0.06, 1.6, 1); mkOfuda(G, V3(8.95, 1.18, WZ + 0.005), -0.1, 1.3, 2);
    for (let i = 0; i < 70; i++) { const x = WX1 - R.r(0, L), s = R.r(0.08, 0.2); const ic = cyl(0.012, 0.002, s, SM({ color: '#c8d8d8', roughness: 0.2 }), 4); ic.position.set(x, WH - s / 2 - 0.01, WZ + 0.015); G.add(ic); } }   // icicles
  // houses behind the wall and across the track; the town's windows beyond
  Wd.houses = []; [[-38, -7], [-29, -8], [-20, -6.8], [-11, -7.5], [-2.5, -6.5], [5.5, -7.2], [22, -7], [31, -8]].forEach(([x, z], i) => Wd.houses.push(mkHouse(G, x, z, R.r(6, 8), R.r(5, 6.5), R.r(3, 5.2), R.n(0.05), R, i % 3 ? 0.55 : 0.8)));
  [[-34, 9], [-24, 8.5], [-14, 10], [-4, 9], [6, 9.5], [22, 9], [31, 10.5]].forEach(([x, z], i) => Wd.houses.push(mkHouse(G, x, z, R.r(6, 8), R.r(5, 6), R.r(3, 5), Math.PI + R.n(0.05), R, i % 2 ? 0.5 : 0.75)));
  // utility poles along the wall, wires between, two street lamps
  { const wood = SM({ map: texDeadBark('pole', '#6a6058') }), xsP = [-36, -27, -18, -9, 0, 8.6]; Wd.polesX = xsP; const tops = [];
    xsP.forEach((x, i) => { const p = cyl(0.11, 0.14, 7.6, wood, 8); p.position.set(x, 3.8, WZ + 0.2); G.add(p); const ca = bx(1.4, 0.08, 0.08, wood, x, 7.1, WZ + 0.2, G); void ca; tops.push(V3(x, 7.1, WZ + 0.2));
      [-0.6, 0, 0.6].forEach((dx) => { const ins = cyl(0.03, 0.04, 0.1, SM({ color: '#d8d0b8' }), 6); ins.position.set(x + dx, 7.2, WZ + 0.2); G.add(ins); });
      const tf = cyl(0.25, 0.25, 0.6, SM({ color: '#6e706a' }), 10); tf.position.set(x + 0.32, 5.7, WZ + 0.2); if (i % 2) G.add(tf);
      if (i === 3 || i === 5) { const arm = bx(0.9, 0.05, 0.05, SM({ color: '#2b2d29' }), x, 4.6, WZ + 0.6, G); arm.rotation.y = Math.PI / 2; const lp = bx(0.3, 0.08, 0.16, SM({ color: '#ffe8c0', emissive: '#ffd090', emissiveIntensity: 1.6 }), x, 4.54, WZ + 1.0, G); void lp; } });
    const wm = SM({ color: '#14110c' }); for (let i = 0; i < tops.length - 1; i++) [-0.6, 0, 0.6].forEach((dx) => { const a = tops[i].clone().add(V3(dx, 0.12, 0)), b = tops[i + 1].clone().add(V3(dx, 0.12, 0)), pts = []; for (let k = 0; k <= 8; k++) { const u = k / 8; pts.push(a.clone().lerp(b, u).add(V3(0, -0.5 * 4 * u * (1 - u), 0))); } G.add(shd(new THREE.Mesh(taperTube(pts, 0.012, 0.012, 3, 16, { wob: 0 }), wm))); }); }
  Wd.lampsXZ = [V3(-9, 4.5, WZ + 1.0), V3(8.6, 4.5, WZ + 1.0)];
  // the crossing: two poles (lamps, crossbucks, bells, barrier arms), a road sign, ofuda on the near pole
  Wd.cross = [mkCrossPole(G, P1, 1), mkCrossPole(G, P2, -1)];
  mkOfuda(Wd.cross[0].g, V3(0, 1.55, -0.072), 0.04, 1.4, 0, Math.PI); mkOfuda(Wd.cross[0].g, V3(0.072, 1.35, 0), -0.08, 1.2, 2, Math.PI / 2);
  { const f = SM({ color: '#2b2d29' }); for (let x = 18.5; x < 60; x += 2) { const p = cyl(0.03, 0.03, 1.1, f, 5); p.position.set(x, 0.55, WZ - 0.1); G.add(p); } const rl = bx(42, 0.04, 0.04, f, 39, 1.0, WZ - 0.1, G); void rl; }
  // snow lumps along the tracks and the wall, a vending machine glow by the crossing
  { const lm = IM(new THREE.SphereGeometry(1, 8, 5), SM({ map: texSnow(), color: '#ffffff' }), 140); let n = 0; for (let i = 0; i < 400 && n < 140; i++) { const x = R.r(-50, 50), z = R.pick([TZ - 1.5, TZ + 1.6, WZ - 0.5, TZ + 3.5]) + R.n(0.3); if (Math.abs(x - XC) < 3) continue; const s = R.r(0.15, 0.45); lm.setMatrixAt(n++, M4c(x, gT(x, z), z, R.r(0, 6), s * 1.8, s * 0.5, s)); } lm.count = n; G.add(lm); }
  { const vm = new THREE.Group(); vm.position.set(XC + 4.2, 0, TZ - 3.2); G.add(vm); bx(0.9, 1.8, 0.7, SM({ color: '#c8ccc4' }), 0, 0.9, 0, vm); bx(0.7, 1.0, 0.03, SM({ color: '#ffffff', emissive: '#d8f0f0', emissiveIntensity: 1.1 }), 0, 1.15, -0.36, vm).rotation.y = Math.PI; Wd.vend = vm; }
  // her school bag in the snow (beat 3) and Kenta's on the tracks (beat 10)
  const mkBagMesh = (key, col) => { const g = new THREE.Group(); G.add(g); bx(0.36, 0.27, 0.1, SM({ map: texBag(key, col) }), 0, 0, 0, g); const st = shd(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 4, 16, Math.PI), SM({ color: '#14110c' }))); st.position.set(0, 0.135, 0); g.add(st); return g; };
  Wd.bagGirl = mkBagMesh('girl', '#1c2436'); Wd.bagGirl.position.set(XC - 3.4, gT(XC - 3.4, TZ - 1.0) + 0.04, TZ - 1.0); Wd.bagGirl.rotation.set(-Math.PI / 2 + 0.12, 0.6, 0);
  Wd.bagKenta = mkBagMesh('kenta', '#a04a26'); Wd.bagKenta.position.set(XC - 1.1, RAIL - 0.04, TZ + 0.1); Wd.bagKenta.rotation.set(-Math.PI / 2 + 0.2, -0.4, 0.1);
  Wd.train = mkTrain(G, Wd);
  // the trail: elbow prints and a dark smear (instanced quads on the snow)
  { const tex = g3Tex((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.6, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 32, 32, false);
    const pg = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2); Wd.smear = new THREE.InstancedMesh(pg, new THREE.MeshBasicMaterial({ color: '#160c0a', alphaMap: tex, transparent: true, opacity: 0.95, depthWrite: false }), 260); Wd.smear.frustumCulled = false; Wd.smear.count = 0; Wd.smear.renderOrder = 2; G.add(Wd.smear);
    Wd.prints = new THREE.InstancedMesh(pg, new THREE.MeshBasicMaterial({ color: '#2e3a3e', alphaMap: tex, transparent: true, opacity: 0.95, depthWrite: false }), 200); Wd.prints.frustumCulled = false; Wd.prints.count = 0; Wd.prints.renderOrder = 2; G.add(Wd.prints); }
  return G;
}
// lay the trail along path(s) → {p, F} for s in [s0, s1]: a smear under the waist, elbow prints every 0.6 m left/right
function layTrail(Wd, path, s0, s1, o = {}) {
  const M = new THREE.Matrix4(); let n = 0, m = 0;
  for (let s = s1; s > s0 && n < 260; s -= 0.07) { const { p, F } = path(s), X = V3(-F.z, 0, F.x), w = (o.w ?? 0.22) * (0.7 + 0.5 * hsh(Math.floor(s * 14), 4)) * (o.fade ? ss(s0, s0 + o.fade, s) : 1), pp = p.clone().addScaledVector(X, 0.03 * Math.sin(s * 5)); pp.y = gT(pp.x, pp.z) + 0.012; M.compose(pp, new THREE.Quaternion().setFromAxisAngle(UPV0, Math.atan2(F.x, F.z)), V3(w, 1, 0.16)); Wd.smear.setMatrixAt(n++, M); }
  for (let s = s1 - 0.3; s > s0 && m < 200; s -= 0.3) { const k = Math.round(s / 0.3), sd = k % 2 ? 1 : -1, { p, F } = path(s), X = V3(-F.z, 0, F.x); [0, 0.32].forEach((d) => { if (m >= 200) return; const pp = p.clone().addScaledVector(X, sd * (0.2 - d * 0.1)).addScaledVector(F, d); pp.y = gT(pp.x, pp.z) + 0.014; M.compose(pp, new THREE.Quaternion().setFromAxisAngle(UPV0, Math.atan2(F.x, F.z)), V3(d ? 0.08 : 0.11, 1, d ? 0.12 : 0.2)); Wd.prints.setMatrixAt(m++, M); }); }
  Wd.smear.count = n; Wd.prints.count = m; Wd.smear.instanceMatrix.needsUpdate = true; Wd.prints.instanceMatrix.needsUpdate = true;
}
const UPV0 = V3(0, 1, 0);

// ---------------- THE GIRL (upper body only) ----------------
// posed every frame from world points: { chest (shoulder line centre), waist, N (her back side), head { p, Y, Z }, roll,
//   arms: [{ E elbow, W wrist, hand { Z fingers, Y back of hand, curl, spread, tap } }], gy (ground fn for the hair) }
const GL = { uArm: 0.39, fArm: 0.36, shW: 0.15, fl: 0.55 };
function mkGirl(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); const skin = SM({ color: '#c8cac0', roughness: 0.4, emissive: '#1a2024', emissiveIntensity: 0.15 }), blouse = SM({ map: texBlouse() }), navy = SM({ map: texCollar() }), hair = SM({ color: '#07080a', roughness: 0.25 }), nailM = SM({ color: '#241c1a' }), G = { g, skin };
  G.torso = sph(1, blouse, 1, 1, 1, 18); g.add(G.torso);
  G.hem = shd(new THREE.Mesh(new THREE.CylinderGeometry(1, 1.25, 1, 16, 1, true), SM({ map: texBlouse(), alphaMap: texRag('hem'), alphaTest: 0.5, side: THREE.DoubleSide }))); g.add(G.hem);
  G.hemIn = sph(1, SM({ color: '#050405' }), 1, 1, 1, 10); g.add(G.hemIn);
  G.collar = bx(1, 1, 1, navy, 0, 0, 0, g); G.collarF = [0, 1].map(() => bx(1, 1, 1, navy, 0, 0, 0, g)); G.tie = sph(1, SM({ color: '#8e3a24' }), 1, 1, 1, 8); g.add(G.tie);
  G.neck = shd(new THREE.Mesh(UCYL1, skin)); g.add(G.neck);
  const H = new THREE.Group(); g.add(H); G.head = H; const sk = shd(new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 18), SM({ map: texGirlFace(), color: '#ffffff', roughness: 0.45, emissive: '#1a2024', emissiveIntensity: 0.12 }))); sk.scale.set(0.8, 1.18, 0.92); sk.rotation.y = -Math.PI / 2; H.add(sk); G.skull = sk;

  G.glints = [-1, 1].map((sd) => { const u = 0.5 + sd * 31 / 512, phi = u * TAU, th = Math.PI * (116 + (sd > 0 ? 2 : 0)) / 256, r = 0.1012, m = sph(0.0022, BM('#ff3018', { fog: false }), 1, 1, 1, 6); m.position.set(-Math.cos(phi) * Math.sin(th) * r, Math.cos(th) * r, Math.sin(phi) * Math.sin(th) * r); sk.add(m); return m; });
  const cap = sph(0.108, hair, 0.84, 0.95, 0.9, 16); cap.position.set(0, 0.05, -0.034); H.add(cap);
  // hair strands: roots on the scalp (top, sides, back; a parting over the face), 4 segments each, hang under gravity
  { const R = RNG('hair2'); G.roots = []; for (let i = 0; i < 70 && G.roots.length < 38; i++) { const az = R.r(-Math.PI, Math.PI), el = R.r(0.05, 1.2); if (Math.abs(az) < 0.8 && el < 1.0) continue; const big = R.f() < 0.35;
      G.roots.push({ p: V3(Math.sin(az) * Math.cos(el) * 0.096, 0.03 + Math.sin(el) * 0.11, Math.cos(az) * Math.cos(el) * 0.1 - 0.02), L: R.r(0.32, 0.86), front: Math.abs(az) < 1.1, ph: R.r(0, TAU), w: big ? R.r(1.6, 2.4) : R.r(0.5, 1.1), cl: R.r(0.7, 1) }); }
    G.face = [[-0.06, 0.5, 1.5], [-0.05, 0.62, 0.9], [0.004, 0.42, 0.55], [0.058, 0.4, 1.6], [0.068, 0.55, 1.0]].map(([fx0, L, w2]) => ({ x: fx0, L, w: w2 }));   // wet strands stuck across her face
    G.hair = IM(new THREE.BoxGeometry(1, 1, 1), hair, G.roots.length * 4 + G.face.length * 6); g.add(G.hair); }
  G.arms = [0, 1].map(() => ({ up: shd(new THREE.Mesh(UCYL, blouse)), fo: shd(new THREE.Mesh(UCYL, skin)), sj: sph(1, blouse, 1, 1, 1, 10), ej: sph(1, skin, 1.0, 0.8, 1.25, 8), cuff: cyl(1, 1, 1, SM({ map: texBlouse(), alphaMap: texRag('cuff'), alphaTest: 0.5, side: THREE.DoubleSide }), 10, true), palm: sph(1, skin, 1, 1, 1, 10),
    f: [...Array(5)].map(() => ({ s: [...Array(4)].map(() => shd(new THREE.Mesh(UCYL1, skin))), k: [...Array(4)].map(() => sph(1, skin, 1, 1, 1, 6)), nail: shd(new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4), nailM)) })) }));
  G.arms.forEach((A) => { [A.up, A.fo, A.sj, A.ej, A.cuff, A.palm].forEach((m) => g.add(m)); A.f.forEach((F) => { F.s.forEach((m) => g.add(m)); F.k.forEach((m) => g.add(m)); g.add(F.nail); }); });
  g.traverse((m) => { if (m.isMesh) m.frustumCulled = false; }); g.visible = false; return G;
}
const GFR = [0.0068, 0.0074, 0.007, 0.0062, 0.0076];
function fingerPtsG(o, i, t) {
  const L = [0.07, 0.055, 0.045, 0.038].map((l) => l * (o.fl ?? 1)), pts = [], sp = i < 4 ? (i - 1.5) * 0.17 : 1.05, base = o.O.clone().addScaledVector(o.Z, i < 4 ? 0.07 : 0.025).addScaledVector(o.X, i < 4 ? (i - 1.5) * 0.017 : -0.03);
  let d = o.Z.clone().applyAxisAngle(o.Y, sp * (o.spread ?? 1)); const ax = o.Y.clone().cross(d).normalize(); pts.push(base.clone()); const p = base.clone();
  const lift = o.tap ? Math.max(0, Math.sin(t * 11 + i * 1.7)) * (i === 1 || i === 2 ? 0.9 : 0.3) * o.tap : 0;
  L.forEach((l, j) => { const c = (o.curl ?? 0.3) * (j === 0 ? 0.3 : 1) - (j === 0 ? lift : 0) + (j === 3 ? 0.25 : 0); d = d.clone().applyAxisAngle(ax, c); p.addScaledVector(d, l); pts.push(p.clone()); }); return pts;
}
function poseGirl(Wd, st) {
  const G = Wd.girl; G.g.visible = true; const N = st.N.clone().normalize(), sp = st.chest.clone().sub(st.waist), sL = sp.length(), U = sp.clone().normalize(), X = U.clone().cross(N).normalize(), Nn = X.clone().cross(U).normalize(), q = qBasis(X, U, Nn);
  const mid = st.waist.clone().lerp(st.chest, 0.48); G.torso.position.copy(mid); G.torso.quaternion.copy(q); G.torso.scale.set(0.15, sL * 0.6, 0.095);
  G.hem.position.copy(st.waist).addScaledVector(U, -0.02); G.hem.quaternion.copy(q); G.hem.scale.set(0.13, 0.2, 0.085); G.hemIn.position.copy(st.waist).addScaledVector(U, 0.02); G.hemIn.quaternion.copy(q); G.hemIn.scale.set(0.115, 0.03, 0.075);
  const sh = st.chest.clone().addScaledVector(U, -0.02); G.collar.position.copy(sh).addScaledVector(Nn, 0.085).addScaledVector(U, -0.08); G.collar.quaternion.copy(q); G.collar.scale.set(0.24, 0.17, 0.012);
  G.collarF.forEach((c, i) => { const sd = i ? 1 : -1; c.position.copy(sh).addScaledVector(Nn, -0.075).addScaledVector(X, sd * 0.05).addScaledVector(U, -0.06); c.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, sd * 0.5))); c.scale.set(0.04, 0.15, 0.012); });
  G.tie.position.copy(sh).addScaledVector(Nn, -0.09).addScaledVector(U, -0.12); G.tie.quaternion.copy(q); G.tie.scale.set(0.035, 0.03, 0.02);
  const f = frameOf(st.head.Y, st.head.Z); let hq = qBasis(f.X, f.Y, f.Z); if (st.roll) hq = hq.multiply(new THREE.Quaternion().setFromAxisAngle(V3(0, 0, 1), st.roll)); G.head.position.copy(st.head.p); G.head.quaternion.copy(hq); G.head.scale.setScalar(st.headS ?? 1); G.head.updateMatrixWorld(true);
  const hb = G.head.localToWorld(V3(0, -0.075, -0.02)), nb = st.chest.clone().addScaledVector(U, 0.01); between(G.neck, nb, hb, 0.03);
  G.glints.forEach((m) => (m.material.color.set((st.glint ?? 0.5) > 0.5 ? '#ff3018' : '#5a0c08')));
  // hair
  { const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), gy = st.gy; let k = 0;
    G.roots.forEach((r, i) => { const p0 = G.head.localToWorld(r.p.clone()), out = p0.clone().sub(G.head.position).normalize(); let p = p0.clone(), d = out.clone().multiplyScalar(0.6).add(V3(0, -1, 0)).normalize(); const seg = r.L / 4;
      for (let j = 0; j < 4; j++) { d = d.clone().lerp(V3(0, -1, 0).add(V3(0.04 * Math.sin(TT * 1.3 + r.ph), 0, 0.04 * Math.cos(TT * 1.1 + r.ph))).normalize(), 0.45).normalize(); if (r.front) d.addScaledVector(f.Z, 0.08); d.normalize();
        let p1 = p.clone().addScaledVector(d, seg); if (gy) { const g0 = gy(p1.x, p1.z) + 0.012; if (p1.y < g0) { p1.y = g0; } }
        if (p1.x < WX1 + 0.15 && p1.z < WZ + 0.012 && p1.z > WZ - 0.18 && p1.y < WT + 0.012) { if (p.y > WT + 0.005 && p1.z < WZ - 0.01) p1.y = WT + 0.014; else p1.z = WZ + 0.014; }   // lie on the wall top / hang down its face
        const dd = p1.clone().sub(p), L = dd.length(); Q.setFromUnitVectors(V3(0, 1, 0), dd.normalize()); M.compose(p.clone().lerp(p1, 0.5), Q, V3(0.016 * r.w * (j === 3 ? 0.45 : 1 - j * 0.12) * r.cl, L, 0.007)); G.hair.setMatrixAt(k++, M); p = p1; } });
    G.face.forEach((F2) => { let prev = null; for (let j = 0; j <= 6; j++) { const y = 0.1 - j * F2.L / 6, xx = F2.x + 0.006 * Math.sin(j * 1.7 + F2.x * 90), e = 1 - (xx / 0.08) ** 2 - (Math.max(-0.118, y) / 0.118) ** 2, z = (e > 0 ? 0.092 * Math.sqrt(e) : 0.03) + 0.008 + (y < -0.11 ? 0.02 : 0);
        const pw = G.head.localToWorld(V3(xx, y, z)); if (prev) { const dd = pw.clone().sub(prev), L = dd.length(); Q.setFromUnitVectors(V3(0, 1, 0), dd.normalize()); M.compose(prev.clone().lerp(pw, 0.5), Q, V3(0.011 * F2.w * (j === 6 ? 0.5 : 1), L, 0.004)); G.hair.setMatrixAt(k++, M); } prev = pw; } });
    G.hair.count = k; G.hair.instanceMatrix.needsUpdate = true; }
  // arms
  G.arms.forEach((A, ai) => { const a = st.arms[ai], sd = ai ? -1 : 1, S = st.chest.clone().addScaledVector(X, sd * GL.shW).addScaledVector(U, -0.03); A.S = S;
    between(A.up, S, a.E, 0.03, 0.03); between(A.fo, a.E, a.W, 0.022); A.sj.position.copy(S); A.sj.scale.setScalar(0.036); A.ej.position.copy(a.E); A.ej.quaternion.setFromUnitVectors(V3(0, 0, 1), a.W.clone().sub(a.E).normalize()); A.ej.scale.set(0.03, 0.026, 0.04);
    const dW = a.W.clone().sub(a.E).normalize(); between(A.cuff, a.E.clone().addScaledVector(dW, -0.03), a.E.clone().addScaledVector(dW, 0.05), 0.036);
    const hd = a.hand, hz = hd.Z.clone().normalize(), hy = hd.Y.clone().addScaledVector(hz, -hd.Y.dot(hz)).normalize(), hx = hy.clone().cross(hz).multiplyScalar(sd);
    A.palm.position.copy(a.W).addScaledVector(hz, 0.04); A.palm.quaternion.copy(qBasis(hy.clone().cross(hz), hy, hz)); A.palm.scale.set(0.034, 0.012, 0.05);
    A.f.forEach((F, i) => { const P = fingerPtsG(Object.assign({ X: hx, Y: hy, Z: hz, O: a.W, fl: GL.fl }, hd), i, TT + ai * 0.7);
      F.s.forEach((m, j) => between(m, P[j], P[j + 1], GFR[i] * (1 - j * 0.15))); F.k.forEach((k2, j) => { k2.position.copy(P[j + 1]); k2.scale.setScalar(GFR[i] * (1.15 - j * 0.12)); });
      const dd = P[4].clone().sub(P[3]).normalize(), nl = 0.012 * (0.5 + hsh(i + ai * 5, 8)); F.nail.position.copy(P[4]).addScaledVector(dd, nl * 0.4); F.nail.quaternion.setFromUnitVectors(V3(0, 1, 0), dd); F.nail.scale.set(GFR[i] * 0.8, nl, GFR[i] * 0.8); F.tip = P[4].clone().addScaledVector(dd, nl * 0.9); }); });
  G.g.updateMatrixWorld(true); G.st = st; return G;
}

// ---------------- PEOPLE: the two boys (gakuran, scarves, bags) ----------------
const PDM = { torso: 0.48, shW: 0.17, hipW: 0.09, uArm: 0.28, fArm: 0.25, thigh: 0.42, shin: 0.4, headR: 0.1, hs: 1.0, fk: 1.0, fr: 1.0, ank: 0.07, gripR: 0.015, legR: [0.064, 0.052, 0.058] };
function mkPerson(o = {}) {
  const pd = Object.assign({}, PDM, o.pd || {}), g = new THREE.Group(), P = { kind: 'man', pd, g };
  const skin = SM({ color: o.skin || '#b0805a', roughness: 0.75 }), nail = SM({ color: '#c09a80' });
  const jac = SM({ map: texCloth((o.key || 'g') + 'gak', o.jacket || '#1c1f26') }), pants = SM({ map: texCloth((o.key || 'p') + 'pants', o.pants || '#191b20') }), boot = SM({ color: '#14110c' }), hairM = SM({ color: '#20262e', roughness: 0.55 }), gold = SM({ color: '#cfae78', roughness: 0.3, emissive: '#3a2810', emissiveIntensity: 0.3 });
  P.mat = { skin, top: jac };
  const T = new THREE.Group(); g.add(T); P.T = T;
  const ch = capsule(0.125, pd.torso - 0.24, jac, 12); ch.scale.set(1.2, 1, 0.78); ch.position.y = pd.torso * 0.55; T.add(ch); P.chest = ch;
  const hem = cyl(0.16, 0.18, 0.2, jac, 14); hem.scale.set(1.05, 1, 0.75); hem.position.y = 0.04; T.add(hem);
  const pel = sph(0.125, pants, 1.1, 0.7, 0.85); T.add(pel);
  const stand = cyl(0.07, 0.075, 0.06, jac, 12); stand.position.y = pd.torso + 0.0; T.add(stand);
  for (let i = 0; i < 5; i++) { const b = sph(0.009, gold, 1, 1, 0.6, 6); b.position.set(0, 0.14 + i * 0.065, 0.103); T.add(b); }
  if (o.scarf) { const sc = SM({ map: texCloth((o.key || 's') + 'scarf', o.scarf, { check: o.scarfC }) }); const ring = shd(new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.035, 6, 14), sc)); ring.rotation.x = Math.PI / 2; ring.position.y = pd.torso - 0.02; ring.scale.set(1.15, 1, 1); T.add(ring);
    const tail = bx(0.07, 0.3, 0.025, sc, 0.06, pd.torso - 0.17, 0.12, T); tail.rotation.z = 0.08; tail.rotation.x = -0.15; P.scarfTail = tail; }
  if (o.bag) { const bm = SM({ map: texBag(o.key, o.bag) }); const b = bx(0.34, 0.27, 0.11, bm, 0, pd.torso * 0.5, -0.17, T); void b; [-1, 1].forEach((sd) => { const s = bx(0.035, 0.36, 0.015, SM({ color: '#14110c' }), sd * 0.08, pd.torso * 0.62, 0.1, T); s.rotation.x = 0.1; }); }
  const Hd = new THREE.Group(); g.add(Hd); P.H = Hd;
  const sk = shd(new THREE.Mesh(new THREE.SphereGeometry(pd.headR, 24, 18), SM({ map: texFacePlain(o.key, o.skin || '#b0805a'), color: '#ffffff', roughness: 0.75 }))); sk.scale.set(0.9, 1.08, 0.98); sk.rotation.y = -Math.PI / 2; Hd.add(sk); P.skull = sk;
  // a modelled face: eyeballs (whites, dark irises), lids, brows, a nose, a mouth that can drop open; P.setFear(k) drives it
  { const sM = SM({ color: o.skin || '#b0805a', roughness: 0.7 }), wM = SM({ color: '#d8d4c4', roughness: 0.4 }), iM = SM({ color: '#140c08' }), bM = SM({ color: '#0b0d10' }), mM = SM({ color: '#1a0806' }), tM = SM({ color: '#d0c8b0' }), F = { eyes: [], irises: [], lids: [], brows: [] };
    [-1, 1].forEach((sd) => { const e = sph(0.0122, wM, 1, 0.85, 0.7, 10); e.position.set(sd * 0.03, -0.002, 0.085); Hd.add(e); F.eyes.push(e); const ir = sph(0.0055, iM, 1, 1, 0.5, 8); ir.position.set(sd * 0.03, -0.002, 0.094); Hd.add(ir); F.irises.push(ir);
      const lid = sph(0.0145, sM, 1.05, 0.55, 0.75, 10); lid.position.set(sd * 0.03, 0.01, 0.086); Hd.add(lid); F.lids.push(lid); const br = bx(0.032, 0.008, 0.01, bM, sd * 0.031, 0.024, 0.091, Hd); F.brows.push(br); });
    const no = sph(0.012, sM, 0.85, 1.4, 1.2, 8); no.position.set(0, -0.02, 0.098); Hd.add(no);
    const mo = sph(0.016, mM, 1, 0.3, 0.45, 12); mo.position.set(0, -0.046, 0.088); Hd.add(mo); F.mouth = mo; const te = bx(0.018, 0.004, 0.004, tM, 0, -0.041, 0.094, Hd); F.teeth = te;
    P.fface = F; P.setFear = (k) => { F.eyes.forEach((e) => e.scale.set(1, 1 + 0.15 * k, 0.7)); F.lids.forEach((l, i) => { l.position.y = 0.01 + 0.006 * k; l.scale.set(1.05, 0.55 - 0.2 * k, 0.75); });
      F.brows.forEach((b, i) => { b.position.y = 0.024 + 0.01 * k; b.rotation.z = (i ? -1 : 1) * 0.35 * k; }); F.mouth.scale.set(0.75 - 0.15 * k, 0.28 + 0.4 * k, 0.45); F.mouth.position.y = -0.046 - 0.006 * k; F.teeth.position.y = -0.041 + 0.002 * k; F.irises.forEach((r) => r.scale.setScalar(1 - 0.3 * k)); }; P.setFear(0); }
  const cap = sph(0.107, hairM, 0.99, 0.86, 1.03); cap.position.set(0, 0.045, -0.01); Hd.add(cap); const fr = sph(0.06, hairM, 1.4, 0.45, 0.6); fr.position.set(0, 0.075, 0.07); Hd.add(fr);
  P.neck = { c: shd(new THREE.Mesh(UCYL1, skin)) }; g.add(P.neck.c);
  P.armR = [0.048, 0.042, 0.052, 0.044];
  P.arm = [1, -1].map((sd) => ({ sd, up: shd(new THREE.Mesh(UCYL, jac)), fo: shd(new THREE.Mesh(UCYL, jac)), sj: sph(1, jac), ej: sph(1, jac), hand: mkHand(P, sd === 1 ? -1 : 1, skin, nail) }));
  P.arm.forEach((a) => [a.up, a.fo, a.sj, a.ej].forEach((m) => g.add(m))); P.arm.forEach((a) => { a.cuff = cyl(1, 1, 1, jac, 10); g.add(a.cuff); });
  const mkFoot = () => { const fg = new THREE.Group(); g.add(fg); const b = capsule(0.04, 0.15, boot, 6); b.rotation.x = Math.PI / 2; b.scale.set(1.05, 1, 0.8); b.position.set(0, -0.035, 0.05); fg.add(b); bx(0.085, 0.02, 0.25, boot, 0, -0.065, 0.05, fg); return fg; };
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
    Wd.ridges = [[400, '#0e1c22', 0], [320, '#14262c', 1], [250, '#1a3036', 2]].map(([r, c, k]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 70, 48, 1, true), new THREE.MeshBasicMaterial({ color: c, map: texRidge(k), alphaTest: 0.5, side: THREE.BackSide, fog: false })); m.material.map.repeat.set(5, 1); m.userData.y = 22 - k * 5; scene.add(m); return m; }); }
  { const R = RNG('town'), n = 220, P = []; for (let i = 0; i < n; i++) { const a = R.r(0, TAU), d = R.r(60, 220); P.push(Math.cos(a) * d, R.r(0.5, 6), Math.sin(a) * d); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    Wd.town = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#e8a860', size: 1.5, sizeAttenuation: false })); scene.add(Wd.town); }
  mkTown(Wd); Wd.girl = mkGirl(Wd);
  Wd.me = mkPerson({ key: 'me', scarf: '#2a4a52', scarfC: '#14262c', bag: '#1c2436', skin: '#b8906e' }); scene.add(Wd.me.g);
  Wd.ken = mkPerson({ key: 'ken', scarf: '#a89878', scarfC: '#6a5038', bag: '#7a3a22', skin: '#c8ac9c' }); scene.add(Wd.ken.g);
  // lights (a fixed set: intensities change per shot, the count never does)
  Wd.lamp = new THREE.SpotLight('#ff3a1c', 0, 14, 0.6, 0.6, 1.4); Wd.lamp.castShadow = true; Wd.lamp.shadow.mapSize.set(1024, 1024); Wd.lamp.shadow.bias = -0.0015; Wd.lamp.shadow.camera.near = 0.05; scene.add(Wd.lamp); scene.add(Wd.lamp.target);
  Wd.key = new THREE.SpotLight('#ffd8a0', 0, 30, 0.7, 0.6, 1.2); Wd.key.castShadow = true; Wd.key.shadow.mapSize.set(1024, 1024); Wd.key.shadow.bias = -0.0008; scene.add(Wd.key); scene.add(Wd.key.target);
  Wd.fill = new THREE.PointLight('#e8a860', 0, 20, 1.5); scene.add(Wd.fill);
  Wd.bounce = new THREE.PointLight('#c89060', 0, 4, 1.6); scene.add(Wd.bounce);
  Wd.red = new THREE.PointLight('#ff2a10', 0, 9, 1.4); scene.add(Wd.red);
  Wd.headL = new THREE.SpotLight('#fff0c0', 0, 60, 0.45, 0.5, 1.0); scene.add(Wd.headL); scene.add(Wd.headL.target);
  Wd.glows = [0, 1, 2, 3].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,90,60,1)'], [0.25, 'rgba(255,40,20,0.55)'], [1, 'rgba(200,20,10,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.visible = false; scene.add(s); return s; });
  Wd.wglows = [0, 1].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,240,200,1)'], [0.2, 'rgba(255,200,120,0.5)'], [1, 'rgba(230,140,60,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.visible = false; scene.add(s); return s; });
  // falling snow: far (1 px) and near (2 px) flakes in a box that follows the camera
  { const mk = (n, size, key) => { const R = RNG(key), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#e8f0f0', size, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false })); pts.frustumCulled = false; pts.userData.q = [...Array(n)].map(() => ({ x: R.f(), y: R.f(), z: R.f(), v: R.r(0.5, 1.1), ph: R.r(0, TAU) })); scene.add(pts); return pts; };
    Wd.snowF = mk(2600, 1.2, 'snowF'); Wd.snowN = mk(260, 2.2, 'snowN'); }
  { const mkP = (n, size, op) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3).fill(-999), 3)); const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#eef4f4', size, sizeAttenuation: false, transparent: true, opacity: op, depthWrite: false })); p.frustumCulled = false; p.visible = false; scene.add(p); return p; };
    Wd.puff = mkP(400, 2.2, 0.95); Wd.blast = mkP(1400, 1.8, 0.85);
    Wd.streaks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: '#dfe8e8', transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), 40); Wd.streaks.frustumCulled = false; Wd.streaks.visible = false; scene.add(Wd.streaks);
    Wd.tglow = [0, 1].map(() => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,250,230,1)'], [0.15, 'rgba(255,240,200,0.7)'], [1, 'rgba(255,220,160,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); sp.visible = false; scene.add(sp); return sp; }); }
  const grad = new THREE.DataTexture(new Uint8Array([45, 45, 45, 255, 135, 135, 135, 255, 255, 255, 255, 255]), 3, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const done = new Map(); scene.traverse((m) => { if (!m.isMesh || !m.material) return; const conv = (o) => { if (!o.isMeshStandardMaterial) return o; if (!done.has(o)) { const t = new THREE.MeshToonMaterial({ color: o.color, map: o.map, alphaMap: o.alphaMap, alphaTest: o.alphaTest, vertexColors: o.vertexColors, side: o.side, gradientMap: grad, transparent: o.transparent, opacity: o.opacity, depthWrite: o.depthWrite, emissive: o.emissive, emissiveIntensity: o.emissiveIntensity }); done.set(o, t); } return done.get(o); };
    m.material = Array.isArray(m.material) ? m.material.map(conv) : conv(m.material); });
  Wd.toon = done; return Wd;
}
const LIGHT = {
  night: { hemS: '#346c76', hemG: '#2a3a3c', hemI: 0.42, moonC: '#8fb1b0', moonI: 0.32, fog: '#14303a', fn: 3, ff: 46, bg: '#0b1a22', exp: 1.0, sky: 0.75 },
  dawn:  { hemS: '#8ab4bc', hemG: '#6a7478', hemI: 0.95, moonC: '#ffd8a8', moonI: 1.1, fog: '#8aa8ae', fn: 8, ff: 90, bg: '#a8c0c4', exp: 1.08, sky: 1, skyMap: 'dawn' },
};
function setLight(Wd, L) {
  Wd.hemi.color.set(L.hemS); Wd.hemi.groundColor.set(L.hemG); Wd.hemi.intensity = L.hemI; Wd.moon.color.set(L.moonC); Wd.moon.intensity = L.moonI;
  Wd.scene.fog.color.set(L.fog); Wd.scene.fog.near = L.fn; Wd.scene.fog.far = L.ff; Wd.scene.background.set(L.bg); rend().r.toneMappingExposure = L.exp;
  Wd.sky.visible = L.sky > 0; Wd.sky.material.color.setScalar(L.sky); { const m = L.skyMap === 'dawn' ? texSkyDawn() : texSky(); if (Wd.sky.material.map !== m) { Wd.sky.material.map = m; Wd.sky.material.needsUpdate = true; } } Wd.ridges.forEach((m) => (m.visible = L.sky > 0.5));
}
