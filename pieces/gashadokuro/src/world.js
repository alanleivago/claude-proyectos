// =====================================================================
//  WORLD — a mountain pass in the Tenmei famine winter (1783), night: the village edge, the susuki field of the dead under
//  straw mats, the footpath with stone tōrō up into the cedars, patchy snow, the moon. The Gashadokuro (a giant skeleton
//  built of hundreds of small skulls and bones, instanced), its giant hand, field bones, crows, the girl with her chōchin.
//  Rig, hands, grip and poseP come from pieces/corpo-seco; cedars, kimono, chōchin from pieces/inunaki.
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

// ---------------------------------------------------------------------
//  THE PASS: one set. A footpath climbs from the village (z +40) up a susuki slope (the field of the dead, z +26..−10),
//  into the cedars, to the top of the pass (z −56). Patchy snow; stone tōrō along the path; huts at the village edge.
// ---------------------------------------------------------------------
const PASS = { z0: 36, z1: -56, h: 13 };
const baseH = (z) => PASS.h * ss(PASS.z0, PASS.z1, z) - 2.5 * ss(PASS.z1, PASS.z1 - 50, z);
const XC = (z) => 2.2 * Math.sin(z * 0.045);
const FIELD = (z) => z < 27 && z > -12;
function hT(x, z) { const d = Math.abs(x - XC(z)), n = fbm2(x * 0.08 + 3, z * 0.08);
  const side = 0.08 * Math.max(0, d - 1.4) + (n - 0.5) * 1.2 * ss(2, 8, d) + 10 * ss(24, 60, d) * fbm2(x * 0.03, z * 0.03 + 5);
  return baseH(z) + lerp(-0.07, side, ss(1.25, 1.9, d)); }
const PATH_X = [[-1.5, -0.05], [-1.2, 0], [-0.8, -0.015], [0, 0.015], [0.8, -0.015], [1.2, 0], [1.5, -0.05]];
function groundAt(x, z) { const d = x - XC(z); if (Math.abs(d) < 1.25) return baseH(z) + pan(PATH_X, d); return hT(x, z); }
const snowK = (x, z) => ss(0.52, 0.6, fbm2(x * 0.2 + 11, z * 0.2) + 0.1 * ss(0, -50, z) - 0.05 * ss(10, 30, z)) * ss(1.4, 2.4, Math.abs(x - XC(z)));
function mkTerrain(Wd) {
  const cA = lin('#5a4a34'), cB = lin('#6e5c3c'), cS = lin('#c4ccc8'), tmp = new THREE.Color();
  const xs = gridAxis(-80, 80, [[-26, 26]], 0.6, 3), zs = gridAxis(-140, 80, [[-75, 55]], 0.6, 3);
  Wd.ground = heightMesh(xs, zs, hT, (x, z) => tmp.copy(cA).lerp(cB, fbm2(x * 0.3, z * 0.3)).lerp(cS, snowK(x, z)).clone(), SM({ map: texFrost(), vertexColors: true, color: '#e8e0d0' }));
  Wd.ground.material.map.repeat.set(3, 3); Wd.scene.add(Wd.ground);
  const P = [], UV = [], idx = [], nX = PATH_X.length; let i = 0;
  for (let z = 60; z >= -110; z -= 0.25, i++) { const y0 = baseH(z), xc = XC(z); PATH_X.forEach(([o, y]) => { P.push(xc + o, y0 + y, z); UV.push((o + 1.5) / 3, -z / 6); });
    if (i) { const a = (i - 1) * nX; for (let k = 0; k < nX - 1; k++) idx.push(a + k, a + k + nX, a + k + 1, a + k + 1, a + k + nX, a + k + nX + 1); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(idx); g.computeVertexNormals();
  if (g.attributes.normal.getY(nX * 3 + 3) < 0) { const I = g.index.array; for (let k = 0; k < I.length; k += 3) { const t = I[k + 1]; I[k + 1] = I[k + 2]; I[k + 2] = t; } g.computeVertexNormals(); }
  const path = new THREE.Mesh(g, SM({ map: texDirt(), color: '#b8aa98', roughness: 0.95 })); path.receiveShadow = true; Wd.scene.add(path); Wd.path = path;
}
let GASHA_AT = null;   // where the creature stands behind the top of the pass (cedars keep clear of it)
function mkCedars(Wd) {
  const R = RNG('cedars'), pts = [];
  const ok = (x, z) => { const d = Math.abs(x - XC(z)); if (d < 4.2 || (z < -12 && d < 7.5)) return false; if (FIELD(z) && d < 30) return false; if (z > 27 && d < 22) return false; if (z < -47 && d < 13) return false; if (GASHA_AT && Math.hypot(x - GASHA_AT.x, z - GASHA_AT.z) < 11) return false; return true; };
  for (let i = 0; i < 12000 && pts.length < 1900; i++) { const near = i % 3 === 0, x = near ? R.r(-24, 24) : R.r(-70, 70), z = near ? R.r(-80, 30) : R.r(-140, 60); if (!ok(x, z)) continue;
    const top = z < -45 ? R.r(9, 15) : R.r(14, 26); pts.push([x, z, top, R.r(0.2, 0.36), R.f()]); }
  const trunk = IM(new THREE.CylinderGeometry(0.7, 1, 1, 7), SM({ map: texCedarBark() }), pts.length), tiers = 5, cone = IM(new THREE.ConeGeometry(1, 1, 8), SM({ map: texNeedles(), color: '#9aa69a' }), pts.length * tiers);
  pts.forEach(([x, z, h, r, f], i) => { const y = hT(x, z) - 0.4; trunk.setMatrixAt(i, M4c(x, y + h / 2, z, f * 6, r, h, r));
    for (let k = 0; k < tiers; k++) { const ty = y + h * (0.42 + k * 0.13), cr = h * 0.085 * (1 - k * 0.15) * (0.8 + f * 0.4), ch = h * 0.24; cone.setMatrixAt(i * tiers + k, M4c(x + Math.sin(k + f * 9) * 0.15, ty + ch / 2, z + Math.cos(k * 2 + f) * 0.15, f * 9 + k, cr, ch, cr)); } });
  Wd.scene.add(trunk); Wd.scene.add(cone); Wd.cedarPts = pts;
  { const RB = RNG('cbr'), br = IM(new THREE.CylinderGeometry(0.3, 1, 1, 4).translate(0, 0.5, 0), SM({ map: texCedarBark(), color: '#8a7a68' }), pts.length * 3); let c = 0;
    pts.forEach(([x, z, h, r]) => { const y = hT(x, z) - 0.4; for (let k = 0; k < 3; k++) { const hy = y + h * RB.r(0.12, 0.4), a = RB.r(0, TAU), L = RB.r(0.8, 2.2), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(RB.r(1.9, 2.4), a, 0, 'YXZ')); br.setMatrixAt(c++, new THREE.Matrix4().compose(V3(x, hy, z), q, V3(r * 0.35, L, r * 0.35))); } }); br.count = c; Wd.scene.add(br); Wd.cedarBr = br; } Wd.cedarIM = [trunk, cone];
}
// stone tōrō along the path (unlit): base, post, platform, firebox with dark windows, a six-sided roof with snow, the jewel
const TOROS = [];
function mkToro(Wd) {
  const parts = [], st = '#8a8a80', dk = '#0e0c0a', sn = '#d0d6d2';
  for (let z = 26, k = 0; z > -60; z -= 8.5, k++) { const sd = k % 2 ? 1 : -1, x = XC(z) + sd * 1.8, y = groundAt(x, z) - 0.05, ry = 0.3 * hsh(k, 3); TOROS.push(V3(x, y, z));
    const at = (geo, dy, col, sx = 1, sy = 1, sz = 1) => parts.push([geo, M4c(x, y + dy, z, ry, sx, sy, sz), col]);
    at(new THREE.CylinderGeometry(0.34, 0.38, 0.2, 6), 0.1, st); at(new THREE.CylinderGeometry(0.11, 0.13, 0.85, 8), 0.62, st); at(new THREE.CylinderGeometry(0.3, 0.22, 0.12, 6), 1.1, st);
    at(new THREE.BoxGeometry(0.34, 0.34, 0.34), 1.33, st); at(new THREE.BoxGeometry(0.2, 0.18, 0.36), 1.34, dk); at(new THREE.BoxGeometry(0.36, 0.18, 0.2), 1.34, dk);
    at(new THREE.ConeGeometry(0.5, 0.26, 6), 1.63, st); at(new THREE.ConeGeometry(0.42, 0.16, 6), 1.73, sn); at(new THREE.SphereGeometry(0.075, 8, 6), 1.84, st, 1, 1.3, 1); }
  const m = shd(new THREE.Mesh(mergeG(parts), SM({ map: texStone('toro', 0.8), vertexColors: true }))); Wd.scene.add(m); Wd.toro = m;
}
// the village edge: a few thatched huts with snow on the roofs, a fence of bamboo, firewood
function mkHuts(Wd) {
  const R = RNG('huts'), wall = SM({ map: texPlank('hutw', '#4a3a28') }), thatch = SM({ map: texThatch() }), snow = SM({ color: '#d0d6d2' }), shoji = SM({ color: '#3a2c1e' });
  [[-11, 35, 0.3], [9, 46, -0.2], [-13, 52, 0.1], [6, 58, 0.4]].forEach(([dx, z, ry]) => { const x = XC(z) + dx, g = new THREE.Group(); g.position.set(x, hT(x, z) - 0.2, z); g.rotation.y = ry; Wd.scene.add(g);
    const w = R.r(5, 6.5), d = R.r(4, 5); bx(w, 2.0, d, wall, 0, 1.0, 0, g); bx(1.4, 1.5, 0.05, shoji, 0.8, 0.95, -d / 2 - 0.01, g);
    const roof = shd(new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4, 1).rotateY(Math.PI / 4), thatch)); roof.scale.set((w + 1.6) * 0.72, 3.2, (d + 1.6) * 0.72); roof.position.y = 3.6; g.add(roof);
    const cap = shd(new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4, 1).rotateY(Math.PI / 4), snow)); cap.scale.set((w + 1.6) * 0.5, 2.25, (d + 1.6) * 0.5); cap.position.y = 4.42; g.add(cap);
    for (let k = 0; k < 8; k++) { const f = cyl(0.06, 0.06, 1.2, SM({ map: texDeadBark() }), 6); f.rotation.z = Math.PI / 2; f.position.set(-w / 2 + 0.7, 0.07 + Math.floor(k / 4) * 0.12, -d / 2 - 0.25 - (k % 4) * 0.13); f.rotation.y = Math.PI / 2; g.add(f); } });
}
// the dead under straw mats in the susuki: a draped mat over each body (k = 1 full, 0 flat once the crows have been)
const MATS = [[-4.2, 21.5, 0.3], [-5.6, 19.4, -0.2], [-3.5, 17.6, 0.5], [-6.6, 16.8, 0.1], [-4.6, 15.0, -0.4], [4.0, 20.2, 0.2], [5.4, 17.5, -0.3]];
function matLump(u, v) { return 0.2 * Math.exp(-((u / 0.24) ** 2)) * ss(-0.85, -0.6, v) * (1 - ss(0.45, 0.55, v)) * (0.75 + 0.25 * ss(-0.6, 0.2, v)) + 0.14 * Math.exp(-((u / 0.15) ** 2) - (((v - 0.68) / 0.11) ** 2)); }
function mkMats(Wd) {
  Wd.mats = []; const mm = SM({ map: texMat(), color: '#d8c8a0', side: THREE.DoubleSide, vertexColors: true }), foot = SM({ color: '#8a8478' });
  MATS.forEach(([dx, z, ry], i) => { const g = new THREE.PlaneGeometry(0.95, 1.9, 10, 20); const p = g.attributes.position, base = [], cols = [];
    const x0 = XC(z) + dx, ax = V3(Math.sin(ry), 0, Math.cos(ry)), ac = V3(Math.cos(ry), 0, -Math.sin(ry));
    for (let k = 0; k < p.count; k++) { const u = p.getX(k), v = p.getY(k), w = V3(x0, 0, z).addScaledVector(ac, u).addScaledVector(ax, v); base.push([w.x, w.z, u, v]); const s = ss(0.55, 0.75, hsh(k + i * 300, 4)) * 0.6; const c = lin('#ffffff').lerp(lin('#e8f0f0'), s); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); const m = shd(new THREE.Mesh(g, mm)); m.frustumCulled = false; Wd.scene.add(m);
    const feet = (i !== 2 && i !== 4) ? [-1, 1].map((sd) => { const f = new THREE.Group(), sole = capsule(0.04, 0.12, foot, 6); sole.rotation.x = Math.PI / 2; sole.scale.set(1.05, 1, 0.75); f.add(sole); const toe = sph(0.035, foot, 1.2, 0.8, 0.9); toe.position.set(0, 0.04, -0.09); f.add(toe); Wd.scene.add(f); const pp = V3(x0, 0, z).addScaledVector(ac, sd * 0.08).addScaledVector(ax, -1.0); f.position.set(pp.x, groundAt(pp.x, pp.z) + 0.05, pp.z); f.rotation.set(0, ry, sd * 0.35, 'YXZ'); return f; }) : [];
    Wd.mats.push({ m, base, feet }); });
  setMats(Wd, 1);
}
function setMats(Wd, k) { Wd.mats.forEach((M) => { const p = M.m.geometry.attributes.position; M.base.forEach(([x, z, u, v], i) => p.setXYZ(i, x, groundAt(x, z) + 0.03 + matLump(u, v) * k + 0.01 * Math.sin(u * 20 + v * 9) * (1 - k), z)); p.needsUpdate = true; M.m.geometry.computeVertexNormals(); M.feet.forEach((f) => (f.visible = k > 0.5)); }); }

// ---------------------------------------------------------------------
//  bones: one small human skull and one long bone (instanced everywhere: the field, and the creature)
// ---------------------------------------------------------------------
function skullGeo() {   // ~1 tall, face +z; the dark sockets, nose and teeth are vertex colour
  const B = '#e0d4b8', D = '#0e0b08', T = '#9a8a6a', J = '#c8bc9c', S = (r, w, h) => new THREE.SphereGeometry(r, w, h);
  return mergeG([[S(0.5, 9, 7), M4c(0, 0.12, -0.04, 0, 0.82, 0.8, 0.95), B], [S(0.3, 7, 5), M4c(0, -0.16, 0.2, 0, 1.05, 0.85, 1), B],
    [S(0.13, 6, 4), M4c(0.16, 0.01, 0.36, 0, 1.15, 0.8, 0.7, 0, -0.35), D], [S(0.12, 6, 4), M4c(-0.15, -0.02, 0.36, 0, 1.0, 0.95, 0.7, 0, 0.25), D], [new THREE.ConeGeometry(0.06, 0.14, 3).rotateZ(Math.PI), M4c(0, -0.15, 0.44, 0, 1, 1, 0.6), D],
    [new THREE.BoxGeometry(0.3, 0.07, 0.06), M4c(0, -0.31, 0.38), T], [new THREE.BoxGeometry(0.28, 0.12, 0.26), M4c(0, -0.42, 0.22), J], [new THREE.BoxGeometry(0.24, 0.05, 0.05), M4c(0, -0.36, 0.36), T]]);
}
function boneGeo() {   // a long bone along y, 1 long, knobbed ends
  const B = '#d8ccb0', S = (r) => new THREE.SphereGeometry(r, 6, 4);
  return mergeG([[new THREE.CylinderGeometry(0.045, 0.055, 0.9, 6), null, B], [S(0.075), M4c(0.04, 0.46, 0), B], [S(0.07), M4c(-0.04, 0.47, 0), B], [S(0.08), M4c(0.035, -0.46, 0), B], [S(0.07), M4c(-0.04, -0.45, 0), B]]);
}
const BONEC = ['#ffffff', '#f0e8d8', '#e0d4bc', '#c8bca0', '#b0a488', '#d8d0c0'];
let SKG = null, BNG = null;
function boneMats() { if (!SKG) { SKG = skullGeo(); BNG = boneGeo(); } return { sk: SM({ vertexColors: true, roughness: 0.7 }), bn: SM({ vertexColors: true, roughness: 0.7 }) }; }
// a basis with Z = n (the face direction), Y as close to `up` as possible, then a twist
function qN(n, up, tw = 0) { const Z = n.clone().normalize(); let Y = up.clone().addScaledVector(Z, -up.dot(Z)); if (Y.lengthSq() < 1e-4) Y = V3(1, 0, 0).addScaledVector(Z, -Z.x); Y.normalize().applyAxisAngle(Z, tw); return qBasis(Y.clone().cross(Z), Y, Z); }
const M4q = (p, q, s) => new THREE.Matrix4().compose(p, q, s.isVector3 ? s : V3(s, s, s));
function packIM(par, sk, bn, M) {   // sk / bn: arrays of [Matrix4, colourIndex]
  const out = {}; if (sk.length) { const m = IM(SKG, M.sk, sk.length); sk.forEach(([m4, c], i) => { m.setMatrixAt(i, m4); m.setColorAt(i, lin(BONEC[c % BONEC.length])); }); par.add(m); out.sk = m; }
  if (bn.length) { const m = IM(BNG, M.bn, bn.length); bn.forEach(([m4, c], i) => { m.setMatrixAt(i, m4); m.setColorAt(i, lin(BONEC[c % BONEC.length])); }); par.add(m); out.bn = m; } return out;
}
// cover a geometry's surface with small skulls (faces out) and bones lying between them; skip(p, n) leaves holes (sockets)
function packSurface(geo, R, o) {
  const p = geo.attributes.position, nn = geo.attributes.normal, sp = o.sp, cell = new Map(), key = (v) => [Math.floor(v.x / sp), Math.floor(v.y / sp), Math.floor(v.z / sp)];
  const order = [...Array(p.count).keys()].sort(() => R.f() - 0.5), sk = [], bn = [];
  order.forEach((i) => { const v = V3(p.getX(i), p.getY(i), p.getZ(i)), n = V3(nn.getX(i), nn.getY(i), nn.getZ(i)).normalize(); if (o.skip && o.skip(v, n)) return;
    const [a, b, c] = key(v); for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) { const L = cell.get((a + x) + ',' + (b + y) + ',' + (c + z)); if (L && L.some((q) => q.distanceToSquared(v) < sp * sp)) return; }
    const k = a + ',' + b + ',' + c; if (!cell.has(k)) cell.set(k, []); cell.get(k).push(v);
    const s = o.s * R.r(0.8, 1.2), dir = n.clone().add(V3(R.n(0.5), R.n(0.5), R.n(0.5))).normalize();
    if (R.f() < (o.bones ?? 0.3)) { const t = V3(R.n(1), R.n(1), R.n(1)).cross(n).normalize(); bn.push([M4q(v.clone().addScaledVector(n, s * 0.05), new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), t), V3(s * 1.4, s * R.r(1.6, 2.6), s * 1.4)), Math.floor(R.f() * 6)]); }
    else sk.push([M4q(v.clone().addScaledVector(n, s * 0.12), qN(dir, o.up || V3(0, 1, 0), R.n(0.8)), s), Math.floor(R.f() * 6)]); });
  return { sk, bn };
}
// bones laid along a segment (local +z from 0 to len) round a core of radius r, skulls studding it
function packLimb(R, len, r, s, o = {}) {
  const sk = [], bn = [], nRing = Math.max(5, Math.round(TAU * r / (s * 0.75))), nAl = Math.max(1, Math.round(len / (s * 1.7)));
  for (let a = 0; a < nAl; a++) for (let j = 0; j < nRing; j++) { const ang = (j + (a % 2) * 0.5) / nRing * TAU + R.n(0.15), z = (a + 0.5) / nAl * len, rr = r * (o.taper ? lerp(1, o.taper, z / len) : 1), n = V3(Math.cos(ang), Math.sin(ang), 0), p = n.clone().multiplyScalar(rr).setZ(z + R.n(s * 0.2));
    if (R.f() < (o.skulls ?? 0.35)) sk.push([M4q(p.addScaledVector(n, s * 0.1), qN(n.clone().add(V3(0, 0, R.n(0.4))), V3(0, 0, 1), R.n(1)), s * R.r(0.85, 1.15)), Math.floor(R.f() * 6)]);
    else bn.push([M4q(p, new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), V3(R.n(0.25), R.n(0.25), 1).normalize()), V3(s * 1.5, len / nAl * R.r(1.1, 1.35), s * 1.5)), Math.floor(R.f() * 6)]); }
  return { sk, bn };
}
const CORE = () => SM({ color: '#7a6c58', roughness: 0.9 });

// ---------------------------------------------------------------------
//  THE GASHADOKURO. Local: the top of the spine (between the collarbones) at the origin, +z the way it faces, metres.
//  Head ~6.5 m (skull built of many skulls, a hinged mandible, teeth of stacked skulls on bone roots), neck, collarbones,
//  ribs, upper arms. A separate giant hand + forearm (Wd.hand) creeps beside the path.
// ---------------------------------------------------------------------
const GK = { head: V3(0, 4.7, 0.9), sc: [2.25, 2.55, 2.65], k: 1.4 };
function mkGasha(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); const R = RNG('gasha'), M = boneMats(), core = CORE(), GA = { g }; Wd.gasha = GA;
  // --- the skull: a deformed sphere (sockets, nose hole, cheekbones, temples, a flat underside for the jaw)
  const head = new THREE.Group(); head.position.copy(GK.head); head.scale.setScalar(GK.k); g.add(head); GA.head = head; const sc = GK.sc;
  const eyeD = [V3(-0.37, 0.05, 0.9).normalize(), V3(0.44, 0.17, 0.88).normalize()], EK = [[0.36, 19, 0.958, 0.82], [0.5, 12.5, 0.928, 1.08]], noseD = V3(0.03, -0.24, 1).normalize();
  const CRK = []; { const RC = RNG('crack'); [[1, 0.6, 0.9, 7], [1, -0.4, 0.6, 6], [0, 0.9, 0.5, 6], [0, -1.2, -0.3, 5]].forEach(([ei, dx, dy, n]) => { let d = eyeD[ei].clone(); const st = V3(dx, dy, 0).normalize().multiplyScalar(0.07); for (let k = 0; k < n; k++) { d = d.clone().add(st).add(V3(RC.n(0.03), RC.n(0.03), 0)).normalize(); CRK.push(d); } }); }
  const nearCrack = (d) => CRK.some((c) => d.dot(c) > 0.9982);
  const hg = new THREE.SphereGeometry(1, 64, 48), hp = hg.attributes.position;
  for (let i = 0; i < hp.count; i++) { const v = V3(hp.getX(i), hp.getY(i), hp.getZ(i)); let k = 1;
    eyeD.forEach((e, ei) => { const c = v.dot(e); k -= EK[ei][0] * Math.exp(-(1 - c) * EK[ei][1]); }); if (nearCrack(v)) k -= 0.05;
    k -= 0.3 * Math.exp(-(1 - v.dot(noseD)) * 45);
    [-1, 1].forEach((sd) => { k += 0.1 * Math.exp(-(1 - v.dot(V3(sd * 0.72, -0.2, 0.66).normalize())) * 18); if (Math.abs(v.x) > 0.6 && v.y > -0.2 && v.y < 0.45) k -= 0.08; });
    k += 0.06 * Math.exp(-(1 - v.dot(V3(0, 0.38, 0.92).normalize())) * 22) + 0.05 * (vn2(v.x * 3 + 2, v.y * 3 + v.z * 2) - 0.5);
    let x = v.x * k, y = v.y * k, z = v.z * k;
    if (v.y < -0.1) x *= 1 - 0.3 * ss(-0.1, -0.7, v.y) * ss(-0.2, 0.6, v.z);   // a narrower maxilla
    y = Math.max(y, v.z > 0.3 ? -0.64 : -0.42 - 0.2 * ss(-0.2, 0.3, v.z));   // a flat underside: the jaw hangs below
    hp.setXYZ(i, x * sc[0], y * sc[1], z * sc[2]); }
  hg.computeVertexNormals(); const hc = shd(new THREE.Mesh(hg, core)); head.add(hc);
  const inHole = (v) => { const d = V3(v.x / sc[0], v.y / sc[1], v.z / sc[2]).normalize(); return eyeD.some((e, ei) => d.dot(e) > EK[ei][2]) || d.dot(noseD) > 0.975 || nearCrack(d); };
  const hs = packSurface(hg, R, { sp: 0.34, s: 0.4, skip: (v) => inHole(v), bones: 0.28 }); packIM(head, hs.sk, hs.bn, M);
  // the sockets: deep black, a faint cold glint far inside each
  GA.glints = []; eyeD.forEach((e, ei) => { const c = V3(e.x * sc[0] * 0.55, e.y * sc[1] * 0.55, e.z * sc[2] * 0.55); const hole = sph(0.95 * EK[ei][3], BM('#030202'), 1, ei ? 0.95 : 0.75, 0.7, 16); hole.rotation.z = ei ? -0.3 : 0.2; hole.position.copy(c); head.add(hole);
    const gl = sph(0.16, BM('#3a3a30'), 1, 1, 1, 8); gl.position.copy(c).add(V3(0, 0.05, 0.55)); head.add(gl); GA.glints.push(gl); });
  { const nh = sph(0.45, BM('#030202'), 0.8, 1.1, 0.6, 12); nh.position.set(0, -0.6, sc[2] * 0.82); head.add(nh); }
  // teeth: each a bone root with two stacked skulls; the upper row hangs from the maxilla, the lower stands on the mandible
  const tooth = (list, bl, base, dirY, i, s0, L = 0.75) => { const b = base.clone(); bl.push([M4q(b.clone().add(V3(0, dirY * L * 0.45, 0)), new THREE.Quaternion(), V3(1.7, L, 1.7)), i]);
    list.push([M4q(b.clone().add(V3(0, dirY * L * 0.92, 0.03)), qN(V3(b.x * 0.4, 0, Math.max(0.3, b.z)).normalize(), V3(0, -dirY, 0), 0), s0), i + 1]); };
  const arc = (n, rx, rz, a0) => [...Array(n)].map((_, k) => { const a = lerp(-a0, a0, k / (n - 1)); return V3(rx * Math.sin(a), 0, rz * Math.cos(a)); });
  { const sk = [], bl = []; arc(9, 1.5, 2.05, 1.0).forEach((p, k) => tooth(sk, bl, p.setY(-1.5), -1, k, 0.32, 0.8)); packIM(head, sk, bl, M); GA.upperTeeth = arc(9, 1.5, 2.05, 1.0).map((p) => p.setY(-1.5)); }
  // the mandible: a horseshoe from hinge to hinge, hinged near the back of the skull
  const jaw = new THREE.Group(); jaw.position.set(0, -0.9, -0.5); head.add(jaw); GA.jaw = jaw;
  { const J = (x, y, z) => V3(x, y + 0.9, z + 0.5), pts = [J(-1.75, -0.7, -0.45), J(-1.6, -2.15, -0.1), J(-1.15, -2.55, 1.2), J(0, -2.7, 2.0), J(1.15, -2.55, 1.2), J(1.6, -2.15, -0.1), J(1.75, -0.7, -0.45)];
    const jg = taperTube(pts, 0.42, 0.42, 12, 40, { wob: 0.05 }); const jm = shd(new THREE.Mesh(jg, core)); jaw.add(jm);
    const js = packSurface(jg, R, { sp: 0.34, s: 0.38, bones: 0.3 }); packIM(jaw, js.sk, js.bn, M);
    const sk = [], bl = []; arc(8, 1.2, 1.72, 0.95).forEach((p, k) => { const yy = lerp(-2.3, -2.12, Math.abs(p.x) / 1.2); tooth(sk, bl, J(p.x, yy, p.z), 1, k + 3, 0.3, 0.62); }); packIM(jaw, sk, bl, M); }
  // neck: a column of vertebrae, each a knot of skulls
  for (let k = 0; k < 4; k++) { const c = V3(0, 0.55 + k * 0.85, -0.3 - k * 0.1), vg = new THREE.SphereGeometry(0.62, 16, 12); vg.translate(c.x, c.y, c.z); const vm = shd(new THREE.Mesh(vg, core)); g.add(vm); const vs = packSurface(vg, R, { sp: 0.36, s: 0.38, bones: 0.35 }); packIM(g, vs.sk, vs.bn, M); }
  // collarbones, shoulder knots, the spine and the ribs (bones packed along curves)
  const curve = (pts, r, s) => { const c = new THREE.CatmullRomCurve3(pts), tg = taperTube(pts, r, r * 0.8, 9, 24, { wob: 0.05 }); g.add(shd(new THREE.Mesh(tg, core))); const ps = packSurface(tg, R, { sp: s * 0.85, s, bones: 0.55 }); packIM(g, ps.sk, ps.bn, M); return c; };
  [-1, 1].forEach((sd) => { curve([V3(0, 0, 0.6), V3(sd * 2.2, 0.2, 0.7), V3(sd * 4.3, -0.2, 0)], 0.42, 0.38);
    const sh = new THREE.SphereGeometry(0.95, 18, 14); sh.translate(sd * 4.6, -0.5, -0.2); g.add(shd(new THREE.Mesh(sh, core))); const ss2 = packSurface(sh, R, { sp: 0.36, s: 0.4, bones: 0.3 }); packIM(g, ss2.sk, ss2.bn, M);
    for (let k = 0; k < 6; k++) { const y = -0.9 - k * 1.05, w = 3.0 + 0.4 * Math.sin((k + 1) / 7 * Math.PI), d = 2.1; curve([V3(sd * 0.4, y, -1.6), V3(sd * w, y - 0.4, -0.9), V3(sd * w * 0.95, y - 0.9, 1.0), V3(sd * 0.6, y - 1.2, d)], 0.22, 0.32); }
    // the upper arm hangs from the shoulder (a limb pack down −y)
    const ua = new THREE.Group(); ua.position.set(sd * 4.8, -0.7, -0.3); ua.rotation.set(Math.PI / 2 - 0.45, 0, sd * 0.3); g.add(ua); const cy2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 7, 10).rotateX(Math.PI / 2).translate(0, 0, 3.5), core); ua.add(shd(cy2)); const lp = packLimb(R, 7, 0.62, 0.4, { taper: 0.85 }); packIM(ua, lp.sk, lp.bn, M);
    const el = new THREE.Group(); el.position.z = 7; ua.add(el); { const k = new THREE.SphereGeometry(0.7, 14, 10); el.add(shd(new THREE.Mesh(k, core))); const ks = packSurface(k, R, { sp: 0.36, s: 0.38, bones: 0.3 }); packIM(el, ks.sk, ks.bn, M); }
    el.add(shd(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 6.5, 10).rotateX(Math.PI / 2).translate(0, 0, 3.25), core))); { const fp = packLimb(R, 6.5, 0.52, 0.36, { taper: 0.85 }); packIM(el, fp.sk, fp.bn, M); }
    const wr = new THREE.Group(); wr.position.z = 6.5; el.add(wr); const hh = buildHand(wr, R, M, core); hh.g = wr; GA.arms = GA.arms || []; GA.arms.push({ sd, ua, el, wr, hand: hh, ua0: ua.rotation.clone() }); });
  curve([V3(0, -0.2, -1.6), V3(0, -3.5, -1.75), V3(0, -7.5, -1.5), V3(0, -9.5, -1.2)], 0.5, 0.36);
  { const pg = new THREE.SphereGeometry(1, 20, 14); pg.scale(2.1, 1.0, 1.25); pg.translate(0, -10.2, -1.1); g.add(shd(new THREE.Mesh(pg, core))); const ps = packSurface(pg, R, { sp: 0.36, s: 0.4, bones: 0.35 }); packIM(g, ps.sk, ps.bn, M); }
  [-1, 1].forEach((sd) => curve([V3(sd * 1.4, -10.6, -0.9), V3(sd * 1.7, -14, 0.2), V3(sd * 1.8, -18, 0.9), V3(sd * 1.7, -23, 0.4)], 0.55, 0.38));
  // a yōkai touch: a frayed shimenawa rope round its neck, white shide papers hanging from it
  { const straw = SM({ color: '#c8b070', map: texStraw() }), paper = SM({ color: '#e8e4d8', side: THREE.DoubleSide }), C0 = V3(0, 1.55, -0.45), RR = 1.18, RS = RNG('rope');
    [0, Math.PI].forEach((ph) => { const pts = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * TAU, tw = a * 9 + ph; pts.push(C0.clone().add(V3(Math.sin(a) * (RR + 0.09 * Math.cos(tw)), 0.09 * Math.sin(tw) - 0.12 * Math.cos(a), Math.cos(a) * (RR + 0.09 * Math.cos(tw))))); } g.add(shd(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 192, 0.1, 6, true), straw))); });
    for (let i = 0; i < 40; i++) { const a = RS.r(-2.2, 2.2), p = C0.clone().add(V3(Math.sin(a) * RR, -0.12 * Math.cos(a), Math.cos(a) * RR)), f = cyl(0.012, 0.006, RS.r(0.15, 0.45), straw, 3); f.position.copy(p).add(V3(0, -0.15, 0)); f.rotation.set(RS.n(0.5), 0, RS.n(0.5)); g.add(f); }
    [-1.1, -0.45, 0.2, 0.85].forEach((a) => { const p = C0.clone().add(V3(Math.sin(a) * (RR + 0.06), -0.12 * Math.cos(a) - 0.1, Math.cos(a) * (RR + 0.06))), sg = new THREE.Group(); sg.position.copy(p); sg.rotation.y = a; g.add(sg);
      [[0, -0.12, 0.14, 0.24], [0.07, -0.33, 0.14, 0.22], [0, -0.53, 0.14, 0.22], [0.07, -0.73, 0.14, 0.2]].forEach(([x, y, w, h]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), paper); m.position.set(x, y, 0.02); m.castShadow = true; sg.add(m); }); }); }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  // the comb caught in its front teeth (beat 10): a red lacquer kushi with a gold flower
  { const cb = new THREE.Group(), lac = SM({ color: '#8a0e0a', roughness: 0.2, emissive: '#3a0604', emissiveIntensity: 0.5 }), sh = new THREE.Shape(); sh.moveTo(-0.055, 0); sh.quadraticCurveTo(-0.055, 0.04, 0, 0.042); sh.quadraticCurveTo(0.055, 0.04, 0.055, 0); sh.lineTo(-0.055, 0);
    const body = shd(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false }), lac)); body.position.z = -0.006; cb.add(body);
    for (let k = 0; k < 13; k++) { const t = bx(0.0045, 0.05, 0.008, lac, -0.048 + k * 0.008, -0.024, 0, cb); void t; } { const rim = shd(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.003, 4, 16, Math.PI), SM({ color: '#e0b040', roughness: 0.3, emissive: '#3a2a08' }))); rim.position.set(0, 0.0, 0.007); rim.scale.set(1.05, 0.8, 1); cb.add(rim); }
    const fl = sph(0.006, SM({ color: '#e0b040', roughness: 0.3 }), 1, 1, 0.4); fl.position.set(0.0, 0.024, 0.008); cb.add(fl);
    cb.scale.setScalar(2.2); head.add(cb); GA.comb = cb; }
  return GA;
}
// the giant hand and forearm: wrist at the origin, the palm toward +z with its face down (−y), fingers along +z,
// the forearm runs back along −z. Each finger: three segment groups (rotation.x = curl).
function buildHand(par, R, M, core) {   // palm toward +z (face down, −y), fingers along +z; returns { f: [segments per finger] }
  const H = { f: [] }, pg = new THREE.SphereGeometry(1, 20, 14); pg.scale(0.85, 0.28, 0.85); pg.translate(0, 0, 0.8); par.add(shd(new THREE.Mesh(pg, core))); { const ps = packSurface(pg, R, { sp: 0.3, s: 0.34, bones: 0.5 }); packIM(par, ps.sk, ps.bn, M); }
  const L = [1.0, 0.75, 0.55];
  [[-0.66, 1.48, -0.12, 0.95], [-0.22, 1.6, -0.04, 1.05], [0.22, 1.6, 0.04, 1.0], [0.64, 1.48, 0.13, 0.88], [0.92, 0.55, 0.85, 0.7]].forEach(([x, z, yaw, k], fi) => {
    let pp = new THREE.Group(); pp.position.set(x, 0, z); pp.rotation.y = yaw; par.add(pp); const segs = [];
    L.forEach((l0, j) => { const l = l0 * k, sg = new THREE.Group(); sg.position.z = j ? L[j - 1] * k : 0; pp.add(sg); const r = 0.2 - j * 0.035;
      sg.add(shd(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r, l, 8).rotateX(Math.PI / 2).translate(0, 0, l / 2), core)));
      const lp = packLimb(R, l, r, 0.3, { skulls: 0.25 }); lp.sk.push([M4q(V3(0, 0.05, 0), qN(V3(0, 1, 0.3), V3(0, 0, 1), R.n(0.5)), 0.42), fi + j]); packIM(sg, lp.sk, lp.bn, M);
      if (j === 2) { const tip = new THREE.Mesh(new THREE.ConeGeometry(r * 0.8, 0.35, 7).rotateX(Math.PI / 2).translate(0, 0, l + 0.15), SM({ color: '#c8bca0' })); sg.add(shd(tip)); }
      sg.userData.L = l; segs.push(sg); pp = sg; });
    H.f.push(segs); });
  return H;
}
function mkHandBig(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); const R = RNG('hand'), M = boneMats(), core = CORE();
  const fa = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.7, 24, 10).rotateX(Math.PI / 2).translate(0, 0, -12), core); g.add(shd(fa)); { const lp = packLimb(R, 24, 0.55, 0.36, { taper: 1.3 }); const fg = new THREE.Group(); fg.rotation.y = Math.PI; g.add(fg); packIM(fg, lp.sk, lp.bn, M); }
  const H = buildHand(g, R, M, core); H.g = g; Wd.hand = H;
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return H;
}
// fingertip (world) of finger i
function handTip(H, i) { const s = H.f[i][2]; s.updateMatrixWorld(true); return s.localToWorld(V3(0, 0, s.userData.L + 0.3)); }

// the field bones (lying in the grass; they tremble, then roll uphill into the cedars)
function mkFieldBones(Wd) {
  const R = RNG('fbones'), M = boneMats(), B = [], S = [];
  for (let i = 0; i < 4000 && B.length + S.length < 900; i++) { const sd = R.f() < 0.75 ? -1 : 1, dx = sd * R.r(1.9, 15), z = R.r(-9, 25); const near = MATS.some(([mx, mz]) => Math.hypot(dx - mx, z - mz) < 2.2); if (!near && R.f() < 0.45) continue; const x = XC(z) + dx;
    if (MATS.some(([mx, mz]) => Math.hypot(dx - mx, z - mz) < 0.7)) continue;
    const e = { p: V3(x, 0, z), yaw: R.r(0, TAU), tilt: R.n(0.25), ph: R.r(0, TAU), s: R.r(0.8, 1.2), c: Math.floor(R.f() * 6), t0: R.r(32.9, 36.2), dur: R.r(2.2, 3.6), far: R.r(0.5, 1) };
    (R.f() < 0.25 ? S : B).push(e); }
  const mk = (geo, mat, L) => { const m = IM(geo, mat, L.length); L.forEach((e, i) => m.setColorAt(i, lin(BONEC[e.c]))); Wd.scene.add(m); return m; };
  Wd.fb = { B, S, bm: mk(BNG, M.bn, B), sm: mk(SKG, M.sk, S) }; poseFieldBones(Wd, 'rest', 0);
}
// where they roll to: the dark gap between the cedars above the field (left of the path, uphill)
const ROLL_TO = V3(-9, 0, -16);
function poseFieldBones(Wd, mode, t, o = {}) {
  const F = Wd.fb, q = new THREE.Quaternion(), dummy = new THREE.Matrix4();
  const one = (e, i, isSkull, m) => { let p = e.p.clone(), extra = new THREE.Quaternion(), hop = 0;
    if (mode === 'tremble') { const a = (o.k ?? 1) * 0.07; extra.setFromEuler(new THREE.Euler(a * Math.sin(t * 31 + e.ph), a * Math.sin(t * 23 + e.ph * 2), a * Math.sin(t * 37 + e.ph * 3))); hop = (o.k ?? 1) * 0.012 * Math.abs(Math.sin(t * 29 + e.ph)); }
    if (mode === 'roll') { const u = clamp((t - e.t0) / e.dur), d = ROLL_TO.clone().setX(ROLL_TO.x + (e.p.x - XC(e.p.z)) * 0.3 + XC(ROLL_TO.z)).sub(e.p).setY(0), L = d.length(), dist = L * e.far * u * u * (1.6 - 0.6 * u) * 0.55, dir = d.normalize();
      p.addScaledVector(dir, dist); const ax = V3(0, 1, 0).cross(dir).normalize(); extra.setFromAxisAngle(ax, dist / (isSkull ? 0.12 : 0.1)); hop = 0.22 * Math.abs(Math.sin(dist * 2.2)) * (u > 0 && u < 1 ? 1 : 0); }
    const gy = groundAt(p.x, p.z), base = new THREE.Quaternion().setFromEuler(isSkull ? new THREE.Euler(e.tilt, e.yaw, e.tilt * 0.5) : new THREE.Euler(Math.PI / 2, 0, e.yaw, 'YXZ'));
    q.copy(extra).multiply(base); const s = isSkull ? 0.21 * e.s : 0.42 * e.s; p.y = gy + (isSkull ? 0.09 : 0.035) * e.s + hop;
    dummy.compose(p, q, isSkull ? V3(s, s, s) : V3(s * 0.9, s, s * 0.9)); m.setMatrixAt(i, dummy); };
  const keep = o.keep ?? 1; F.B.forEach((e, i) => one(e, i, false, F.bm)); F.S.forEach((e, i) => one(e, i, true, F.sm));
  F.bm.count = Math.round(F.B.length * keep); F.sm.count = Math.round(F.S.length * keep); F.bm.instanceMatrix.needsUpdate = true; F.sm.instanceMatrix.needsUpdate = true;
}
// the hero bones (beat 7): a few big bones and skulls near the camera tumbling uphill, kicking up snow behind them
function mkHero(Wd) { const M = boneMats(), R = RNG('hero'); Wd.hero = []; for (let i = 0; i < 9; i++) { const sk = i % 3 === 0, m = shd(new THREE.Mesh(sk ? SKG : BNG, M[sk ? 'sk' : 'bn'])); m.material = M[sk ? 'sk' : 'bn']; Wd.scene.add(m); Wd.hero.push({ m, sk, dx: -2.2 - R.r(0, 3.2), z: 8.6 - R.r(0, 3.5), t0: 33.0 + i * 0.42 + R.r(0, 0.3), ph: R.r(0, TAU), s: sk ? 0.45 : 0.85 }); }
  const pt = g3Radial([[0, 'rgba(225,235,235,0.9)'], [0.5, 'rgba(200,215,215,0.35)'], [1, 'rgba(180,200,200,0)']], 32); Wd.puffs = [...Array(54)].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: pt, transparent: true, depthWrite: false })); s.visible = false; Wd.scene.add(s); return s; }); }
function heroAt(e, t) { const u = Math.max(0, t - e.t0), p0 = PP(e.z, e.dx), d = V3(XC(-12) - 9 - p0.x, 0, -12 - p0.z).normalize(), dist = 1.9 * u, p = p0.clone().addScaledVector(d, dist), hop = 0.55 * Math.abs(Math.sin(dist * 1.6 + e.ph)) * ss(0, 0.3, u); p.y = groundAt(p.x, p.z) + e.s * 0.25 + hop; return { p, d, dist, u }; }
function poseHero(Wd, t, cam) { let k = 0; Wd.hero.forEach((e) => { const h = heroAt(e, t), ax = V3(0, 1, 0).cross(h.d).normalize(); e.m.visible = true; e.m.position.copy(h.p); e.m.quaternion.setFromAxisAngle(ax, h.dist / 0.18).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(e.sk ? 0.3 : Math.PI / 2, e.ph, 0))); e.m.scale.setScalar(e.s);
  for (let j = 1; j <= 6; j++) { const s = Wd.puffs[k++], b = heroAt(e, t - j * 0.12); if (!s) return; s.visible = h.u > j * 0.12; s.position.copy(b.p).setY(groundAt(b.p.x, b.p.z) + 0.12); s.scale.setScalar(0.25 + j * 0.08); s.material.opacity = 0.55 * (1 - j / 7); } }); void cam; }
function hideHero(Wd) { if (!Wd.hero) return; Wd.hero.forEach((e) => (e.m.visible = false)); Wd.puffs.forEach((s) => (s.visible = false)); }
// crows: a few on the mats and the bones, pecking; one flaps
function mkCrows(Wd) {
  const blk = SM({ color: '#16161a', roughness: 0.5 }), bk = SM({ color: '#3a3a38' }); Wd.crows = [];
  [[-4.0, 21.2, 0.8], [-5.3, 19.0, -1.2], [-3.8, 17.2, 2.4], [-6.2, 17.6, 0.2], [-2.9, 19.8, -2.0]].forEach(([dx, z, ry], i) => { const g = new THREE.Group(); Wd.scene.add(g);
    const body = sph(0.1, blk, 0.8, 0.85, 1.6); body.position.set(0, 0.19, 0); body.rotation.x = -0.25; g.add(body); const tail = shd(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.24, 4).rotateX(-Math.PI / 2).scale(1, 0.25, 1), blk)); tail.position.set(0, 0.15, -0.22); tail.rotation.x = 0.35; g.add(tail);
    const neck = new THREE.Group(); neck.position.set(0, 0.22, 0.11); g.add(neck); const hd = sph(0.055, blk, 0.9, 0.9, 1.1); hd.position.set(0, 0.03, 0.04); neck.add(hd);
    const bkm = shd(new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.13, 5).rotateX(Math.PI / 2).scale(0.8, 1, 1), bk)); bkm.position.set(0, 0.025, 0.14); neck.add(bkm);
    const wings = [-1, 1].map((sd) => { const w = new THREE.Group(); w.position.set(sd * 0.06, 0.21, 0.02); g.add(w); const wm = shd(new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 4).rotateX(-Math.PI / 2).scale(0.5, 0.25, 1), blk)); wm.position.set(sd * 0.03, 0, -0.08); w.add(wm); return w; });
    [-1, 1].forEach((sd) => { const l = cyl(0.009, 0.009, 0.12, bk, 4); l.position.set(sd * 0.035, 0.06, 0.01); g.add(l); const ft = bx(0.05, 0.008, 0.06, bk, sd * 0.035, 0.004, 0.03, g); void ft; const ey = sph(0.008, BM('#c8d0c8')); ey.position.set(sd * 0.04, 0.045, 0.06); neck.add(ey); }); g.scale.setScalar(2.1);
    const x = XC(z) + dx; g.position.set(x, 0, z); g.rotation.y = ry; Wd.crows.push({ g, neck, wings, i, x, z }); });
}
function poseCrows(Wd, t, on, matK = 1) { Wd.crows.forEach((C) => { C.g.visible = on; if (!on) return; const fly = C.i === 4 ? ss(15.5, 16.3, t) : 0;
  const top = MATS.some(([mx, mz]) => Math.hypot(XC(C.z) + mx - C.x, mz - C.z) < 0.9) ? 0.2 * matK : 0; C.g.position.y = groundAt(C.x, C.z) + top + fly * 1.8 * ss(15.5, 18, t);
  C.neck.rotation.x = 0.7 * Math.max(0, Math.sin(t * (3 + C.i * 0.4) + C.i * 2)) ** 3; C.wings.forEach((w, k) => (w.rotation.z = (k ? -1 : 1) * (fly > 0 ? 0.9 * Math.sin(t * 22) : 0.05))); }); }

// the chōchin on a short pole (stick along local X, the paper lantern hangs from its far end)
function mkChochin(Wd, P) {
  const g = new THREE.Group(); Wd.scene.add(g); const r = gripFit(P).r * 0.98, wood = SM({ map: texCedarBark(), color: '#a08060' });
  const st = cyl(r, r * 0.7, 0.5, wood, 7); st.rotation.z = Math.PI / 2; st.position.x = -0.2; g.add(st);
  const body = new THREE.Group(); Wd.scene.add(body); Wd.paperM = SM({ map: texLantern(), emissive: '#a0602a', emissiveIntensity: 1.0 }); const lm = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), Wd.paperM); lm.scale.set(0.085, 0.12, 0.085); body.add(lm); lm.castShadow = false;
  [-0.115, 0.115].forEach((y) => { const c = cyl(0.055, 0.055, 0.022, SM({ color: '#16110c' }), 10); c.position.y = y; c.castShadow = false; body.add(c); });
  const cord = new THREE.Mesh(UCYL1, SM({ color: '#16110c' })); Wd.scene.add(cord);
  return { g, body, cord, tip: V3(-0.44, 0, 0) };
}

// ---------------------------------------------------------------------
//  the girl (my grandmother): kimono, straw mino cape open at the front, a sugegasa, waraji; the chōchin in her left fist
// ---------------------------------------------------------------------
const PDS = { girl: { torso: 0.36, shW: 0.13, hipW: 0.075, uArm: 0.21, fArm: 0.19, thigh: 0.31, shin: 0.3, headR: 0.095, hs: 0.78, fk: 1.0, fr: 0.95, ank: 0.06, gripR: 0.012, legR: [0.05, 0.04, 0.045] } };
function texMino() { return txCanvas('mino', 64, 128, (x, w, h, R) => { x.fillStyle = '#7a6440'; x.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { x.strokeStyle = R.pick(['#a08850', '#5a4a2a', '#b49a5e', '#8a7444', '#4a3c22']); x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, h); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(1.5), py + R.r(8, 22)); x.stroke(); }
  for (let r = 0; r < 4; r++) { x.fillStyle = 'rgba(30,22,12,0.5)'; x.fillRect(0, r * 32 + 4, w, 2); } }, [3, 1]); }
function mkGirl() {
  const pd = Object.assign({}, PDS.girl), g = new THREE.Group(), P = { kind: 'girl', pd, g };
  const skin = SM({ color: '#a87a56', roughness: 0.75 }), nail = SM({ color: '#c09a80' }), kim = SM({ map: texKimono('g1', '#26304a', ['#3c2c1e', '#5a2418', '#1f3c44']) }), kim2 = SM({ map: texKimono('g2', '#26304a', ['#3c2c1e', '#5a2418']), side: THREE.DoubleSide });
  const straw = SM({ map: texStraw(), color: '#e0d0a8', side: THREE.DoubleSide }), mino = SM({ map: texMino(), alphaMap: texRag('mino'), alphaTest: 0.5, side: THREE.DoubleSide, color: '#d8c8a0' }), hairM = SM({ color: '#0b0d10', roughness: 0.55 });
  P.mat = { skin, top: kim };
  const T = new THREE.Group(); g.add(T); P.T = T;
  const ch = capsule(0.1, pd.torso - 0.2, kim, 12); ch.scale.set(1.12, 1, 0.8); ch.position.y = pd.torso * 0.55; T.add(ch); P.chest = ch;
  const pel = sph(0.11, kim, 1.1, 0.7, 0.9); pel.position.y = 0.03; T.add(pel);
  const obi = cyl(0.112, 0.112, 0.08, SM({ color: '#8e3a24' }), 14); obi.scale.set(1.1, 1, 0.82); obi.position.y = 0.15; T.add(obi);
  const mL = [[0.3, -0.24], [0.26, 0.04], [0.21, 0.2], [0.16, pd.torso - 0.03], [0.07, pd.torso + 0.04]];
  const mg = new THREE.LatheGeometry(mL.map(([r, y]) => new THREE.Vector2(r, y)), 22, 0.62, TAU - 1.24); const mm = shd(new THREE.Mesh(mg, mino)); mm.scale.set(1, 1, 0.85); mm.position.z = -0.02; T.add(mm); P.mino = mm;
  const Hd = new THREE.Group(); g.add(Hd); P.H = Hd;
  const sk = shd(new THREE.Mesh(new THREE.SphereGeometry(pd.headR, 24, 18), SM({ map: texFaceOf('girl'), color: '#ffffff', roughness: 0.75 }))); sk.scale.set(0.9, 1.05, 0.98); sk.rotation.y = -Math.PI / 2; Hd.add(sk); P.skull = sk;
  const cap = sph(0.1, hairM, 0.95, 0.85, 0.95); cap.position.set(0, 0.03, -0.025); Hd.add(cap); const bun = sph(0.045, hairM); bun.position.set(0, 0.02, -0.1); Hd.add(bun);
  const hat = shd(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.13, 24, 1, true), straw)); hat.position.y = 0.125; Hd.add(hat); P.hat = hat;
  const knob = sph(0.02, straw); knob.position.y = 0.19; Hd.add(knob);
  P.neck = { c: shd(new THREE.Mesh(UCYL1, skin)) }; g.add(P.neck.c);
  P.armR = [0.042, 0.035, 0.046, 0.037];
  P.arm = [1, -1].map((sd) => ({ sd, up: shd(new THREE.Mesh(UCYL, kim)), fo: shd(new THREE.Mesh(UCYL, kim)), sj: sph(1, kim), ej: sph(1, kim), hand: mkHand(P, sd === 1 ? -1 : 1, skin, nail) }));
  P.arm.forEach((a) => [a.up, a.fo, a.sj, a.ej].forEach((m) => g.add(m)));
  P.arm.forEach((a) => { a.cuff = cyl(1, 1, 1, kim, 10); g.add(a.cuff); });
  const mkFoot = () => { const fg = new THREE.Group(); g.add(fg); bx(0.075, 0.016, 0.2, SM({ map: texStraw() }), 0, -0.052, 0.04, fg); const ft = capsule(0.026, 0.12, SM({ color: '#d8d4c8' }), 6); ft.rotation.x = Math.PI / 2; ft.scale.set(1.1, 1, 0.7); ft.position.set(0, -0.03, 0.04); fg.add(ft); return fg; };
  P.leg = [1, -1].map((sd) => ({ sd, th: shd(new THREE.Mesh(UCYL, kim)), sh: shd(new THREE.Mesh(UCYL, SM({ color: '#d8d4c8' }))), kj: sph(1, kim), foot: mkFoot() }));
  P.leg.forEach((l) => [l.th, l.sh, l.kj].forEach((m) => g.add(m)));
  const L = [[0.12, 0.02], [0.14, -0.12], [0.165, -0.42], [0.18, -0.6]]; P.skirt = shd(new THREE.Mesh(new THREE.LatheGeometry(L.map(([r, y]) => new THREE.Vector2(r, y)).reverse(), 20), kim2)); g.add(P.skirt);
  return P;
}

// ---------------------------------------------------------------------
//  the world, lights, the moon, motes, mist, the toon conversion
// ---------------------------------------------------------------------
function world() {
  if (WJ) return WJ;
  const scene = new THREE.Scene(), Wd = { scene }; WJ = Wd;
  scene.background = lin('#0b1a22'); scene.fog = new THREE.Fog('#172728', 8, 60);
  Wd.cam = new THREE.PerspectiveCamera(50, YK.LW / YK.LH, 0.05, 900);
  Wd.hemi = new THREE.HemisphereLight('#4e8389', '#221c15', 0.6); scene.add(Wd.hemi);
  const moon = new THREE.DirectionalLight('#8fb1b0', 0.5); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); const sc = moon.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 160; moon.shadow.bias = -0.0008;
  scene.add(moon); scene.add(moon.target); Wd.moon = moon;
  Wd.rim = new THREE.DirectionalLight('#b9cbc6', 0); scene.add(Wd.rim); scene.add(Wd.rim.target);
  GASHA_AT = V3(XC(-74), 0, -74); GASHA_AT.y = hT(GASHA_AT.x, GASHA_AT.z);
  { const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.MeshBasicMaterial({ map: texSky(), side: THREE.BackSide, fog: false })); scene.add(sky); Wd.sky = sky;
    Wd.ridges = [[400, '#0e1c22', 0], [320, '#14262c', 1], [250, '#1a3036', 2]].map(([r, c, k]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 70, 48, 1, true), new THREE.MeshBasicMaterial({ color: c, map: texRidge(k), alphaTest: 0.5, side: THREE.BackSide, fog: false })); m.material.map.repeat.set(5, 1); m.userData.y = 22 - k * 5; scene.add(m); return m; });
    Wd.moonDisk = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texMoon(), transparent: true, fog: false, depthWrite: false })); scene.add(Wd.moonDisk);
    Wd.moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(200,225,220,0.55)'], [0.35, 'rgba(120,170,170,0.18)'], [1, 'rgba(60,110,110,0)']]), transparent: true, depthWrite: false, fog: false })); scene.add(Wd.moonHalo); }
  mkTerrain(Wd); mkCedars(Wd); mkToro(Wd); mkHuts(Wd); mkMats(Wd);
  Wd.grass = mkGrass(Wd, 40000, [-30, 30, -14, 34], hT, (x, z) => { const d = Math.abs(x - XC(z)); if (d < 1.35) return false; if (d < 1.9) return 'short'; if (!FIELD(z) && R2f(x, z) < 0.7) return false; if (snowK(x, z) > 0.5) return 'short'; if (MATS.some(([mx, mz]) => Math.hypot(x - XC(mz) - mx, z - mz) < 1.4)) return 'short'; return true; }, ['#7a6c4c', '#6a5c40', '#86785a', '#5a4c34', '#8e8060', '#665a40'], 'susuki', [0.25, 0.7]);
  mkFieldBones(Wd); mkCrows(Wd); mkHero(Wd);
  mkGasha(Wd); mkHandBig(Wd);
  Wd.girl = mkGirl(); scene.add(Wd.girl.g); Wd.lant = mkChochin(Wd, Wd.girl);
  // lights (a fixed set: intensities change per shot, the count never does)
  Wd.lanL = new THREE.PointLight('#ffb868', 0, 9, 1.4); Wd.lanL.castShadow = true; Wd.lanL.shadow.mapSize.set(512, 512); Wd.lanL.shadow.bias = -0.002; Wd.lanL.shadow.camera.near = 0.12; scene.add(Wd.lanL);
  Wd.key = new THREE.SpotLight('#b9cbc6', 0, 200, 0.5, 0.6, 1.0); Wd.key.castShadow = true; Wd.key.shadow.mapSize.set(1024, 1024); Wd.key.shadow.bias = -0.0008; scene.add(Wd.key); scene.add(Wd.key.target);
  Wd.fill = new THREE.PointLight('#e8a860', 0, 20, 1.5); scene.add(Wd.fill);
  Wd.lanGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,225,160,1)'], [0.25, 'rgba(255,170,80,0.5)'], [1, 'rgba(230,120,40,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); scene.add(Wd.lanGlow); Wd.lanGlow.visible = false;
  { const R = RNG('motes'), n = 260, geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); Wd.moteP = [...Array(n)].map(() => ({ x: R.n(1), y: R.n(1), z: R.n(1), ph: R.r(0, TAU), v: R.r(0.3, 1) }));
    Wd.motes = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#e8eef0', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false })); Wd.motes.frustumCulled = false; scene.add(Wd.motes); }
  { const R = RNG('mist'), t = g3Radial([[0, 'rgba(200,220,220,0.5)'], [0.5, 'rgba(180,205,205,0.18)'], [1, 'rgba(160,190,190,0)']], 64); Wd.mist = [];
    for (let i = 0; i < 70; i++) { const x = R.r(-40, 40), z = R.r(-90, 50), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: R.r(0.3, 0.7) }));
      s.position.set(x, hT(x, z) + R.r(0.6, 3), z); s.scale.set(R.r(8, 16), R.r(2, 4), 1); s.userData = { x, z, ph: R.r(0, TAU) }; scene.add(s); Wd.mist.push(s); } }
  // falling snow: a few hundred flakes in a box round the camera
  { const R = RNG('snow'), n = 700, geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); Wd.snowP = [...Array(n)].map(() => ({ x: R.r(-1, 1), y: R.r(0, 1), z: R.r(-1, 1), v: R.r(0.5, 1), ph: R.r(0, TAU) }));
    Wd.snow = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#dfe8e8', size: 1.2, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false })); Wd.snow.frustumCulled = false; scene.add(Wd.snow); }
  const grad = new THREE.DataTexture(new Uint8Array([45, 45, 45, 255, 135, 135, 135, 255, 255, 255, 255, 255]), 3, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const done = new Map(); scene.traverse((m) => { if (!m.isMesh || !m.material) return; const conv = (o) => { if (!o.isMeshStandardMaterial) return o; if (!done.has(o)) { const t = new THREE.MeshToonMaterial({ color: o.color, map: o.map, alphaMap: o.alphaMap, alphaTest: o.alphaTest, vertexColors: o.vertexColors, side: o.side, gradientMap: grad, transparent: o.transparent, opacity: o.opacity, depthWrite: o.depthWrite, emissive: o.emissive, emissiveIntensity: o.emissiveIntensity }); if (o.onBeforeCompile && o.customProgramCacheKey) { t.onBeforeCompile = o.onBeforeCompile; t.customProgramCacheKey = o.customProgramCacheKey; } done.set(o, t); } return done.get(o); };
    m.material = Array.isArray(m.material) ? m.material.map(conv) : conv(m.material); });
  Wd.toon = done; Wd.paperT = done.get(Wd.paperM);
  return Wd;
}
const R2f = (x, z) => hsh(Math.floor(x * 3) * 31 + Math.floor(z * 3), 7);
const LIGHT = {
  night:  { hemS: '#4e8389', hemG: '#3c2c1e', hemI: 0.9, moonC: '#8fb1b0', moonI: 0.75, fog: '#172728', fn: 6, ff: 75, bg: '#0b1a22', exp: 1.2, sky: 1 },
  dawn:   { hemS: '#8fb1b0', hemG: '#5a4430', hemI: 1.4, moonC: '#d3d6cc', moonI: 1.1, fog: '#6a9a9c', fn: 4, ff: 60, bg: '#6a9a9c', exp: 1.25, sky: 2.2 },
};
function setLight(Wd, L) {
  Wd.hemi.color.set(L.hemS); Wd.hemi.groundColor.set(L.hemG); Wd.hemi.intensity = L.hemI; Wd.moon.color.set(L.moonC); Wd.moon.intensity = L.moonI;
  Wd.scene.fog.color.set(L.fog); Wd.scene.fog.near = L.fn; Wd.scene.fog.far = L.ff; Wd.scene.background.set(L.bg); rend().r.toneMappingExposure = L.exp;
  Wd.sky.material.color.setScalar(L.sky); Wd.ridges.forEach((m) => (m.visible = L.sky > 0.5 && L.sky < 2)); Wd.ridges.forEach((m, i) => m.material.color.set(L.ridgeC ? L.ridgeC[i] : ['#0e1c22', '#14262c', '#1a3036'][i])); Wd.moonDisk.visible = Wd.moonHalo.visible = L.sky > 0.5;
}
