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
//  the woman (me): a sleeping kimono, a kasuri hanten over it, a red obi, hair in a bun, bare feet
// ---------------------------------------------------------------------
const PDS = { girl: { torso: 0.38, shW: 0.135, hipW: 0.08, uArm: 0.23, fArm: 0.21, thigh: 0.36, shin: 0.35, headR: 0.095, hs: 0.82, fk: 1.0, fr: 0.95, ank: 0.06, gripR: 0.012, legR: [0.055, 0.042, 0.048] } };
function texMino() { return txCanvas('mino', 64, 128, (x, w, h, R) => { x.fillStyle = '#7a6440'; x.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { x.strokeStyle = R.pick(['#a08850', '#5a4a2a', '#b49a5e', '#8a7444', '#4a3c22']); x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, h); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(1.5), py + R.r(8, 22)); x.stroke(); }
  for (let r = 0; r < 4; r++) { x.fillStyle = 'rgba(30,22,12,0.5)'; x.fillRect(0, r * 32 + 4, w, 2); } }, [3, 1]); }
function mkWoman() {
  const pd = Object.assign({}, PDS.girl), g = new THREE.Group(), P = { kind: 'girl', pd, g };
  const skin = SM({ color: '#a87a56', roughness: 0.75 }), nail = SM({ color: '#c09a80' }), kim = SM({ map: texKimono('w1', '#8a8478', ['#6a6458', '#5a5448']) }), kim2 = SM({ map: texKimono('w2', '#8a8478', ['#6a6458']), side: THREE.DoubleSide });
  const han = SM({ map: texKasuri('hanten', '#1e2a40'), side: THREE.DoubleSide }), hairM = SM({ color: '#0b0d10', roughness: 0.55 });
  P.mat = { skin, top: han };
  const T = new THREE.Group(); g.add(T); P.T = T;
  const ch = capsule(0.1, pd.torso - 0.2, han, 12); ch.scale.set(1.15, 1, 0.82); ch.position.y = pd.torso * 0.55; T.add(ch); P.chest = ch;
  const pel = sph(0.11, kim, 1.1, 0.7, 0.9); pel.position.y = 0.03; T.add(pel);
  const obi = cyl(0.112, 0.112, 0.07, SM({ color: '#8e3a24' }), 14); obi.scale.set(1.1, 1, 0.82); obi.position.y = 0.14; T.add(obi);
  const hL = [[0.15, 0.02], [0.14, 0.2], [0.13, pd.torso - 0.04], [0.07, pd.torso + 0.03]];
  const hg = new THREE.LatheGeometry(hL.map(([r, y]) => new THREE.Vector2(r, y)), 20, 0.5, TAU - 1.0); const hm = shd(new THREE.Mesh(hg, han)); hm.scale.set(1.05, 1, 0.82); T.add(hm);
  const Hd = new THREE.Group(); g.add(Hd); P.H = Hd;
  const sk = shd(new THREE.Mesh(new THREE.SphereGeometry(pd.headR, 24, 18), SM({ map: texFaceOf('girl'), color: '#ffffff', roughness: 0.75 }))); sk.scale.set(0.9, 1.05, 0.98); sk.rotation.y = -Math.PI / 2; Hd.add(sk); P.skull = sk;
  const cap = sph(0.1, hairM, 0.95, 0.85, 0.95); cap.position.set(0, 0.03, -0.025); Hd.add(cap); const bun = sph(0.05, hairM); bun.position.set(0, 0.04, -0.1); Hd.add(bun);
  P.neck = { c: shd(new THREE.Mesh(UCYL1, skin)) }; g.add(P.neck.c);
  P.armR = [0.046, 0.04, 0.05, 0.042];
  P.arm = [1, -1].map((sd) => ({ sd, up: shd(new THREE.Mesh(UCYL, han)), fo: shd(new THREE.Mesh(UCYL, han)), sj: sph(1, han), ej: sph(1, han), hand: mkHand(P, sd === 1 ? -1 : 1, skin, nail) }));
  P.arm.forEach((a) => [a.up, a.fo, a.sj, a.ej].forEach((m) => g.add(m)));
  P.arm.forEach((a) => { a.cuff = cyl(1, 1, 1, han, 10); g.add(a.cuff); });
  const mkFoot = () => { const fg = new THREE.Group(); g.add(fg); const ft = capsule(0.03, 0.15, skin, 6); ft.rotation.x = Math.PI / 2; ft.scale.set(1.1, 1, 0.7); ft.position.set(0, -0.035, 0.05); fg.add(ft); return fg; };
  P.leg = [1, -1].map((sd) => ({ sd, th: shd(new THREE.Mesh(UCYL, kim)), sh: shd(new THREE.Mesh(UCYL, kim)), kj: sph(1, kim), foot: mkFoot() }));
  P.leg.forEach((l) => [l.th, l.sh, l.kj].forEach((m) => g.add(m)));
  const L = [[0.12, 0.02], [0.14, -0.12], [0.165, -0.42], [0.18, -0.62]]; P.skirt = shd(new THREE.Mesh(new THREE.LatheGeometry(L.map(([r, y]) => new THREE.Vector2(r, y)).reverse(), 20), kim2)); g.add(P.skirt);
  return P;
}

// ---------------------------------------------------------------------
//  the world, lights, the moon, motes, mist, snow, the toon conversion
// ---------------------------------------------------------------------
function world() {
  if (WJ) return WJ;
  const scene = new THREE.Scene(), Wd = { scene }; WJ = Wd;
  scene.background = lin('#0b1a22'); scene.fog = new THREE.Fog('#172728', 8, 60);
  Wd.cam = new THREE.PerspectiveCamera(50, YK.LW / YK.LH, 0.03, 900);
  Wd.hemi = new THREE.HemisphereLight('#4e8389', '#221c15', 0.6); scene.add(Wd.hemi);
  const moon = new THREE.DirectionalLight('#8fb1b0', 0.5); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); const sc = moon.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 120; moon.shadow.bias = -0.0006;
  scene.add(moon); scene.add(moon.target); Wd.moon = moon;
  Wd.rim = new THREE.DirectionalLight('#b9cbc6', 0); scene.add(Wd.rim); scene.add(Wd.rim.target);
  { const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.MeshBasicMaterial({ map: texSky(), side: THREE.BackSide, fog: false })); scene.add(sky); Wd.sky = sky;
    Wd.ridges = [[400, '#0e1c22', 0], [320, '#14262c', 1], [250, '#1a3036', 2]].map(([r, c, k]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 70, 48, 1, true), new THREE.MeshBasicMaterial({ color: c, map: texRidge(k), alphaTest: 0.5, side: THREE.BackSide, fog: false })); m.material.map.repeat.set(5, 1); m.userData.y = 22 - k * 5; scene.add(m); return m; });
    Wd.moonDisk = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texMoon(), transparent: true, fog: false, depthWrite: false })); scene.add(Wd.moonDisk);
    Wd.moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(200,225,220,0.55)'], [0.35, 'rgba(120,170,170,0.18)'], [1, 'rgba(60,110,110,0)']]), transparent: true, depthWrite: false, fog: false })); scene.add(Wd.moonHalo); }
  mkHouse(Wd); mkOutside(Wd); mkPathSet(Wd);
  Wd.man = mkPerson({ key: 'man', kim: ['#3a3428', ['#2a241c', '#4a3c28']], top: '#2a3048', skin: '#9a6a48', hat: true, mino: true, obi: '#2a241c', pd: { torso: 0.4, shW: 0.15, headR: 0.1, hs: 0.86 } }); scene.add(Wd.man.g); Wd.lant = mkChochin(Wd, Wd.man);
  Wd.ghost = mkPerson({ key: 'ghost', kim: ['#8a7a9a', ['#6a5a7a', '#a08aa8']], top: '#5a4a6a', blank: true, bun: 0.06, obi: '#8e2a1c' }); scene.add(Wd.ghost.g);
  Wd.gran = mkPerson({ key: 'gran', kim: ['#4a4438', ['#3a342a']], top: '#3a2a22', blank: true, bun: 0.045, hair: '#6a6a64', obi: '#3a241a' }); scene.add(Wd.gran.g);
  Wd.match = mkMatch(Wd);
  // lights (a fixed set: intensities change per shot, the count never does)
  Wd.matchL = new THREE.PointLight('#ffb868', 0, 7, 1.4); Wd.matchL.castShadow = true; Wd.matchL.shadow.mapSize.set(512, 512); Wd.matchL.shadow.bias = -0.002; Wd.matchL.shadow.camera.near = 0.05; scene.add(Wd.matchL);
  Wd.key = new THREE.SpotLight('#b9cbc6', 0, 60, 0.5, 0.6, 1.0); Wd.key.castShadow = true; Wd.key.shadow.mapSize.set(1024, 1024); Wd.key.shadow.bias = -0.0008; Wd.key.shadow.camera.near = 0.1; scene.add(Wd.key); scene.add(Wd.key.target);
  Wd.fill = new THREE.PointLight('#e8883a', 0, 6, 1.5); Wd.fill.position.set(IRORI.x, 0.2, IRORI.z); scene.add(Wd.fill);
  Wd.glow = new THREE.PointLight('#e8a860', 0, 14, 1.5); scene.add(Wd.glow);
  { const R = RNG('motes'), n = 260, geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); Wd.moteP = [...Array(n)].map(() => ({ x: R.n(1), y: R.n(1), z: R.n(1), ph: R.r(0, TAU), v: R.r(0.3, 1) }));
    Wd.motes = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#e8eef0', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false })); Wd.motes.frustumCulled = false; scene.add(Wd.motes); }
  { const R = RNG('mist'), t = g3Radial([[0, 'rgba(200,220,220,0.5)'], [0.5, 'rgba(180,205,205,0.18)'], [1, 'rgba(160,190,190,0)']], 64); Wd.mist = [];
    for (let i = 0; i < 50; i++) { let x = 0, z = 0; do { x = R.r(-40, 40); z = R.r(-40, 40); } while (Math.hypot(x, z) < 9); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: R.r(0.3, 0.7) }));
      s.position.set(x, groundAt(x, z) + R.r(0.6, 3), z); s.scale.set(R.r(8, 16), R.r(2, 4), 1); s.userData = { x, z, ph: R.r(0, TAU) }; scene.add(s); Wd.mist.push(s); } }
  { const R = RNG('snow'), n = 700, geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); Wd.snowP = [...Array(n)].map(() => ({ x: R.r(-1, 1), y: R.r(0, 1), z: R.r(-1, 1), v: R.r(0.5, 1), ph: R.r(0, TAU) }));
    Wd.snow = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#dfe8e8', size: 1.2, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false })); Wd.snow.frustumCulled = false; scene.add(Wd.snow); }
  const grad = new THREE.DataTexture(new Uint8Array([45, 45, 45, 255, 135, 135, 135, 255, 255, 255, 255, 255]), 3, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const done = new Map(); scene.traverse((m) => { if (!m.isMesh || !m.material) return; const conv = (o) => { if (!o.isMeshStandardMaterial) return o; if (!done.has(o)) { const t = new THREE.MeshToonMaterial({ color: o.color, map: o.map, alphaMap: o.alphaMap, alphaTest: o.alphaTest, vertexColors: o.vertexColors, side: o.side, gradientMap: grad, transparent: o.transparent, opacity: o.opacity, depthWrite: o.depthWrite, emissive: o.emissive, emissiveIntensity: o.emissiveIntensity }); if (o.onBeforeCompile && o.customProgramCacheKey) { t.onBeforeCompile = o.onBeforeCompile; t.customProgramCacheKey = o.customProgramCacheKey; } done.set(o, t); } return done.get(o); };
    m.material = Array.isArray(m.material) ? m.material.map(conv) : conv(m.material); });
  Wd.toon = done; Wd.paperT = done.get(Wd.paperM);
  return Wd;
}
const LIGHT = {
  night:  { hemS: '#4e8389', hemG: '#3c2c1e', hemI: 0.9, moonC: '#8fb1b0', moonI: 0.85, fog: '#172728', fn: 8, ff: 80, bg: '#0b1a22', exp: 1.2, sky: 1 },
  inside: { hemS: '#2e5458', hemG: '#1a140e', hemI: 0.14, moonC: '#8fb4b0', moonI: 0.32, fog: '#04080a', fn: 1.5, ff: 9, bg: '#04080a', exp: 0.95, sky: 1 },
  day:    { hemS: '#6a8a8a', hemG: '#3a2c20', hemI: 0.7, moonC: '#b8c4bc', moonI: 0.8, fog: '#2a3c3e', fn: 2.5, ff: 14, bg: '#2a3c3e', exp: 1.2, sky: 2.2 },
};
function setLight(Wd, L) {
  Wd.hemi.color.set(L.hemS); Wd.hemi.groundColor.set(L.hemG); Wd.hemi.intensity = L.hemI; Wd.moon.color.set(L.moonC); Wd.moon.intensity = L.moonI;
  Wd.scene.fog.color.set(L.fog); Wd.scene.fog.near = L.fn; Wd.scene.fog.far = L.ff; Wd.scene.background.set(L.bg); rend().r.toneMappingExposure = L.exp;
  Wd.sky.material.color.setScalar(L.sky); Wd.ridges.forEach((m) => (m.visible = L.sky > 0.5 && L.sky < 2)); Wd.ridges.forEach((m, i) => m.material.color.set(L.ridgeC ? L.ridgeC[i] : ['#0e1c22', '#14262c', '#1a3036'][i])); Wd.moonDisk.visible = Wd.moonHalo.visible = L.sky > 0.5;
}
