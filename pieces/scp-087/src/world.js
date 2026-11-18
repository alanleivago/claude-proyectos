// =====================================================================
//  WORLD — helpers and the person rig (two-bone IK, jointed fingers, poseP) from pieces/gashadokuro; the scp-087
//  sets (the school corridor in Sendai, the endless stairwell), the creature and the janitor follow below.
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
  if (P.Hp) { P.Hp.position.copy(st.pos); P.Hp.quaternion.copy(qBasis(...Object.values((() => { const f = frameOf(V3(0, 1, 0), st.F); return { X: f.X, Y: f.Y, Z: f.Z }; })()))); }   // the hips stay upright; the torso bends over them
  if (P.chest) P.chest.scale.set((corpo ? 1.25 : 1.2) * (1 + 0.02 * (st.breath ?? 0)), 1, (corpo ? 0.82 : 0.78) * (1 + 0.04 * (st.breath ?? 0)));
  const top = st.pos.clone().addScaledVector(B.Y, pd.torso);
  let HY, HALLZ; if (st.head && st.head.Y) { const f = frameOf(st.head.Y, st.head.Z); HY = f.Y; HALLZ = f.Z; }
  else { const h = st.head || {}, e = new THREE.Euler(h.pitch ?? 0, h.yaw ?? 0, h.roll ?? 0, 'YXZ'), hq = q.clone().multiply(new THREE.Quaternion().setFromEuler(e)); HY = V3(0, 1, 0).applyQuaternion(hq); HALLZ = V3(0, 0, 1).applyQuaternion(hq); }
  const HF = frameOf(HY, HALLZ); P.H.quaternion.copy(qBasis(HF.X, HF.Y, HF.Z));
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
    between(a.up, S, E, aR[0]); between(a.fo, E, W, aR[1]); if (a.bu) { const du = E.clone().sub(S), lu = du.length(), dw = W.clone().sub(E), lw = dw.length(); a.bu.position.copy(S).addScaledVector(du, 0.42); a.bu.quaternion.setFromUnitVectors(_up, du.normalize()); a.bu.scale.set(aR[0] * 1.22, lu * 0.36, aR[0] * 1.12); a.fb.position.copy(E).addScaledVector(dw, 0.3); a.fb.quaternion.setFromUnitVectors(_up, dw.normalize()); a.fb.scale.set(aR[1] * 1.25, lw * 0.3, aR[1] * 1.1); } a.sj.position.copy(S); a.sj.scale.setScalar(aR[2]); a.ej.position.copy(E); a.ej.scale.setScalar(aR[3] * (corpo ? 1.25 : 1));
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
    if (l.boot) { const d = K.clone().sub(Aw); between(l.boot, Aw.clone().add(V3(0, -0.02, 0)), Aw.clone().addScaledVector(d, 0.42), 1, 1); l.boot.scale.set(1, l.boot.scale.y, 1); }   // rubber boot shaft
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
//  SCP-087 — two sets far apart, one shown per shot:
//   HALL (origin): a school corridor along x (floor y 0, z ∈ [−1.4, 1.4]); classroom wall with sliding doors at z −1.4,
//   window wall with moonlight at z +1.4, shoe lockers, a mop bucket; the end wall at x 0 holds the grey STAIRS door.
//   WELL (x SX): a grey concrete switchback stair that only goes down. Lane A (z < −0.45) runs +x, lane B (z > 0.45)
//   runs −x, an open well between. Landing n (n ≥ 1) is at y −1.5 n, east (odd) or west (even); n 0 = the door landing.
// =====================================================================
const HALLZ = 1.4, HCEIL = 2.85, SX = 200, ST = 0.28, SR = 1.5 / 9, SL = 8 * ST, LW = 1.0, WELL = 0.45, LD = 1.3, NLV = 9;
// height of the stair surface under (x, z) for flight `fl` (0 = A from landing 0, 1 = B from landing 1, …) and its two landings
function stairY(fl, x, z) {
  const k = Math.floor(fl / 2), A = fl % 2 === 0, yTop = -1.5 * fl, u = A ? x - SX : SX + SL - x;   // u: distance along the flight from its top
  if (u <= 0) return yTop; if (u >= SL) return yTop - 1.5; void k; void z;
  return yTop - (Math.floor(u / ST) + 1) * SR;
}
const landY = (n) => -1.5 * n, landX = (n) => (n % 2 ? SX + SL + LD / 2 : SX - LD / 2);
function texStairCon(k = 0) { return txCanvas('scon' + k, 256, 256, (x, w, h, R) => { x.fillStyle = k ? '#80827c' : '#8c8e88'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 120; i++) { x.fillStyle = R.pick(['rgba(255,255,250,0.07)', 'rgba(20,22,20,0.14)', 'rgba(90,72,50,0.10)', 'rgba(40,60,60,0.10)']); blob(x, R.r(0, w), R.r(0, h), R.r(3, 22), R); x.fill(); }
  for (let i = 0; i < 70; i++) { x.fillStyle = 'rgba(20,20,18,0.5)'; x.beginPath(); x.arc(R.r(0, w), R.r(0, h), R.r(0.6, 1.8), 0, TAU); x.fill(); }   // air holes
  for (let r = 0; r < 4; r++) { x.fillStyle = 'rgba(30,30,28,0.3)'; x.fillRect(0, r * 64 + R.r(0, 8), w, 1); }   // form joints
  for (let i = 0; i < 10; i++) { const cx = R.r(0, w), g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(26,30,28,0.45)'); g.addColorStop(1, 'rgba(26,30,28,0)'); x.fillStyle = g; x.fillRect(cx, R.r(0, h * 0.4), R.r(2, 7), h * R.r(0.2, 0.6)); }   // damp streaks
  speckle(x, R, w, h, 4500, ['rgba(30,30,28,0.45)', 'rgba(210,210,200,0.25)'], [1, 2]); for (let i = 0; i < 6; i++) crack(x, R, R.r(0, w), R.r(0, h), 7, R.n(6), R.r(4, 9)); }, [1, 1]); }
function texLandNum(n) { return txCanvas('ln2' + n, 128, 64, (x, w, h, R) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(22,22,18,0.95)'; x.font = '900 50px "Arial Black", Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('B' + n, w / 2, h / 2 + 2);
  x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 70; i++) { x.fillStyle = 'rgba(0,0,0,' + R.r(0.3, 1) + ')'; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 5), R.r(1, 3)); } x.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 4; i++) { x.fillStyle = 'rgba(22,22,18,0.7)'; x.fillRect(R.r(30, 98), R.r(44, 52), 2, R.r(4, 12)); } }, [1, 1]); }   // paint drips
function texHallFloor() { return txCanvas('hfloor', 256, 256, (x, w, h, R) => { x.fillStyle = '#6e6a5c'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = R.pick(['#6a665a', '#726e60', '#66625a', '#6e6c5e']); x.fillRect(i * 64 + 1, j * 64 + 1, 62, 62); }   // linoleum tiles
  for (let i = 0; i < 90; i++) { x.fillStyle = R.pick(['rgba(255,255,240,0.06)', 'rgba(20,18,14,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(3, 14), R); x.fill(); }
  for (let i = 0; i < 30; i++) { x.strokeStyle = 'rgba(230,230,210,0.12)'; x.lineWidth = 1; x.beginPath(); x.arc(R.r(0, w), R.r(0, h), R.r(10, 40), R.r(0, 3), R.r(3, 6)); x.stroke(); }   // mop swirls
  speckle(x, R, w, h, 2500, ['rgba(20,20,18,0.35)', 'rgba(220,220,200,0.18)'], [1, 1]); }, [6, 1]); }
function texPlaster() { return txCanvas('plast', 128, 128, (x, w, h, R) => { x.fillStyle = '#a6a89a'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { x.fillStyle = R.pick(['rgba(255,255,240,0.07)', 'rgba(40,40,30,0.08)', 'rgba(90,80,60,0.08)']); blob(x, R.r(0, w), R.r(0, h), R.r(4, 20), R); x.fill(); } x.fillStyle = 'rgba(30,30,26,0.25)'; x.fillRect(0, h - 10, w, 10);
  speckle(x, R, w, h, 800, ['rgba(30,30,28,0.25)', 'rgba(230,230,220,0.18)'], [1, 1]); }, [4, 1]); }
function texSlideDoor(k) { return txCanvas('sdoor' + k, 64, 128, (x, w, h, R) => { x.fillStyle = '#7a6448'; x.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { x.fillStyle = 'rgba(40,26,14,0.25)'; x.fillRect(R.r(0, w), 0, 1, h); }
  x.fillStyle = '#2a2a26'; x.fillRect(4, 4, w - 8, h - 8); x.fillStyle = '#7a6448'; x.fillRect(8, 8, w - 16, h - 16); x.fillStyle = '#1c2a30'; x.fillRect(10, 12, w - 20, 44); x.fillStyle = 'rgba(160,190,200,0.2)'; x.fillRect(12, 14, 6, 40);
  x.fillStyle = '#3a3026'; x.fillRect(w - 14, 70, 4, 14); speckle(x, R, w, h, 300, ['rgba(0,0,0,0.2)', 'rgba(255,240,220,0.08)'], [1, 1]);
  x.fillStyle = '#d8d0b8'; x.fillRect(16, 60, 24, 8); x.fillStyle = '#2a2420'; x.font = '7px ' + JPG; x.fillText((k + 1) + '年' + (k % 3 + 1) + '組', 17, 67); }, [1, 1]); }
function texLocker() { return txCanvas('locker', 128, 128, (x, w, h, R) => { x.fillStyle = '#8a8e86'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) { const px = i * 32 + 2, py = j * 21 + 2; x.fillStyle = '#5e625c'; x.fillRect(px, py, 28, 18); x.fillStyle = '#9a9e96'; x.fillRect(px + 1, py + 1, 26, 16); x.fillStyle = '#d6d0bc'; x.fillRect(px + 8, py + 3, 12, 4); x.fillStyle = '#3a3a36'; x.fillRect(px + 12, py + 11, 4, 2); }
  speckle(x, R, w, h, 600, ['rgba(0,0,0,0.2)', 'rgba(255,255,240,0.1)', 'rgba(110,60,30,0.2)'], [1, 1]); }, [1, 1]); }
function texSteelDoor() { return txCanvas('sdoorG', 64, 128, (x, w, h, R) => { x.fillStyle = '#6c706e'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,0.22)'; x.strokeStyle = 'rgba(20,22,22,0.5)'; x.strokeRect(5, 6, w - 10, 50); x.strokeRect(5, 64, w - 10, 56);
  for (let i = 0; i < 40; i++) { x.fillStyle = R.pick(['rgba(30,30,28,0.18)', 'rgba(220,220,210,0.08)', 'rgba(100,60,30,0.2)']); blob(x, R.r(0, w), R.r(0, h), R.r(2, 8), R); x.fill(); }
  x.fillStyle = 'rgba(80,46,24,0.5)'; x.fillRect(0, h - 10, w, 10); speckle(x, R, w, h, 500, ['rgba(0,0,0,0.25)', 'rgba(255,255,250,0.08)'], [1, 1]); }, [1, 1]); }
function texSignStairs() { return txCanvas('sgStairs', 128, 32, (x, w, h) => { x.fillStyle = '#1e5a3e'; x.fillRect(0, 0, w, h); x.fillStyle = '#e4ecdc'; x.font = '900 22px "Arial Black", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('STAIRS', w / 2, h / 2 + 1); }, [1, 1]); }
function texPlate() { return txCanvas('sgKaidan', 64, 32, (x, w, h) => { x.fillStyle = '#d8d2bc'; x.fillRect(0, 0, w, h); x.fillStyle = '#1e1a16'; x.font = '900 20px ' + JPG; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('階段', w / 2, h / 2 + 1); }, [1, 1]); }
function texNotice() { return txCanvas('notice', 128, 96, (x, w, h, R) => { x.fillStyle = '#6a4c30'; x.fillRect(0, 0, w, h); x.fillStyle = '#a88a60'; x.fillRect(5, 5, w - 10, h - 10);
  for (let i = 0; i < 7; i++) { x.fillStyle = R.pick(['#e0dccc', '#d8c890', '#c8d8d0', '#e8d0c0']); const px = R.r(8, w - 40), py = R.r(8, h - 36); x.fillRect(px, py, R.r(22, 34), R.r(20, 30)); x.fillStyle = '#b02a1a'; x.fillRect(px + 10, py, 3, 3); } }, [1, 1]); }
function texMoonSky() { return txCanvas('moonsky', 256, 128, (x, w, h, R) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0e2632'); g.addColorStop(1, '#3a5a60'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 12; i++) { x.fillStyle = 'rgba(160,190,190,0.12)'; x.beginPath(); x.ellipse(R.r(0, w), R.r(10, 70), R.r(20, 60), R.r(2, 5), 0, 0, TAU); x.fill(); }
  x.fillStyle = '#0a1418'; for (let i = 0; i < w; i += 3) x.fillRect(i, h - 18 - 14 * fbm2(i * 0.05, 1) - (i % 37 < 8 ? 10 : 0), 3, 40); }, [1, 1]); }   // rooftops of Sendai
function texFacePlain(key, skin) { return txCanvas('fp' + key, 256, 128, (x, w, h, R) => { x.fillStyle = skin; x.fillRect(0, 0, w, h); const fx = w / 2;
  for (let i = 0; i < 40; i++) { x.fillStyle = R.pick(['rgba(60,36,20,0.18)', 'rgba(255,230,210,0.1)', 'rgba(90,50,40,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(4, 14), R); x.fill(); }
  [-1, 1].forEach((sd) => { x.fillStyle = 'rgba(40,24,14,0.4)'; x.beginPath(); x.ellipse(fx + sd * 12, 60, 9, 7, 0, 0, TAU); x.fill(); x.strokeStyle = 'rgba(50,30,20,0.45)'; x.lineWidth = 0.8; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(fx + sd * 20, 56 + k * 3); x.lineTo(fx + sd * 26, 54 + k * 4); x.stroke(); } });   // tired eyes, crow's feet
  x.strokeStyle = 'rgba(50,30,20,0.4)'; x.lineWidth = 1; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(fx - 14, 40 + k * 4); x.lineTo(fx + 14, 40 + k * 4); x.stroke(); }   // forehead lines
  [-1, 1].forEach((sd) => { x.beginPath(); x.moveTo(fx + sd * 7, 70); x.quadraticCurveTo(fx + sd * 13, 80, fx + sd * 11, 88); x.stroke(); });   // nasolabial folds
  speckle(x, R, 90, 40, 500, ['rgba(70,64,60,0.45)', 'rgba(120,120,116,0.35)'], [1, 1]); for (let i = 0; i < 380; i++) { x.fillStyle = 'rgba(80,74,70,0.4)'; x.fillRect(fx + R.n(26), R.r(80, 104), 1, 1); }   // grey stubble
  x.fillStyle = 'rgba(40,24,14,0.3)'; x.fillRect(fx - 1, 62, 2, 12); x.fillStyle = 'rgba(20,12,8,0.35)'; x.fillRect(0, 0, w * 0.18, h); x.fillRect(w * 0.82, 0, w * 0.18, h); }, [1, 1]); }

function mkHall(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); Wd.hall = g; const R = RNG('hall');
  const floor = shd(new THREE.Mesh(new THREE.PlaneGeometry(30, 2 * HALLZ), SM({ map: texHallFloor(), roughness: 0.35 }))); floor.rotation.x = -Math.PI / 2; floor.position.set(-15, 0, 0); g.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(30, 2 * HALLZ), SM({ color: '#8a8c84' })); ceil.rotation.x = Math.PI / 2; ceil.position.set(-15, HCEIL, 0); ceil.receiveShadow = true; g.add(ceil);
  const plas = SM({ map: texPlaster() }), wood = SM({ color: '#5a4630' }), frame = SM({ color: '#7c807a' });
  // classroom wall (z −1.4) with sliding doors every 6 m and transom windows
  { const wl = shd(new THREE.Mesh(new THREE.PlaneGeometry(30, HCEIL), plas)); wl.position.set(-15, HCEIL / 2, -HALLZ); g.add(wl);
    for (let i = 0; i < 4; i++) { const dx = -4.5 - i * 6; [0, 1].forEach((k) => bx(0.9, 1.85, 0.04, SM({ map: texSlideDoor(i * 2 + k) }), dx + k * 0.92, 0.94, -HALLZ + 0.03 + k * 0.025, g)); bx(1.9, 0.06, 0.08, wood, dx + 0.46, 1.9, -HALLZ + 0.04, g); bx(1.9, 0.4, 0.03, SM({ color: '#1a2a30', emissive: '#0a1418', emissiveIntensity: 0.3 }), dx + 0.46, 2.25, -HALLZ + 0.02, g); }
    bx(30, 0.12, 0.03, wood, -15, 0.06, -HALLZ + 0.02, g); }
  // window wall (z +1.4): a lower wall, the windows (open frames, moonlight comes through), the header
  { bx(30, 0.9, 0.12, plas, -15, 0.45, HALLZ + 0.06, g); bx(30, 0.55, 0.12, plas, -15, HCEIL - 0.275, HALLZ + 0.06, g); bx(30, 0.05, 0.2, frame, -15, 0.92, HALLZ + 0.04, g);
    for (let x = -30; x <= 0.01; x += 1.5) { bx(0.07, 1.4, 0.1, frame, x, 1.6, HALLZ + 0.06, g); bx(0.035, 1.4, 0.05, frame, x + 0.75, 1.6, HALLZ + 0.07, g); } bx(30, 0.04, 0.06, frame, -15, 1.6, HALLZ + 0.07, g);
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(60, 12), BM('#ffffff', { map: texMoonSky(), fog: false })); sky.position.set(-15, 3, 12); sky.rotation.y = Math.PI; g.add(sky); Wd.hsky = sky;
    const sill = SM({ color: '#8a8e86' }); bx(30, 0.03, 0.22, sill, -15, 0.935, HALLZ - 0.06, g); }
  // the shoe lockers (getabako) along the classroom wall
  { const lm = SM({ map: texLocker() }); for (let i = 0; i < 3; i++) bx(0.95, 1.3, 0.36, lm, -13.4 + i * 0.97, 0.65, -HALLZ + 0.19, g); bx(2.95, 0.04, 0.4, frame, -12.43, 1.32, -HALLZ + 0.2, g);
    for (let i = 0; i < 3; i++) { const sh = sph(0.05, SM({ color: R.pick(['#c8c4b4', '#3a4a5a', '#8a3a2a']) }), 1.8, 0.7, 0.9); sh.position.set(-13.2 + i * 0.4, 1.38, -HALLZ + 0.25); g.add(sh); } }
  // the mop bucket (yellow, with a wringer) and a fire extinguisher, a notice board
  { const yb = SM({ color: '#b08a2a' }); const b = cyl(0.17, 0.15, 0.3, yb, 14); b.position.set(-3.4, 0.2, HALLZ - 0.38); g.add(b); const wr = bx(0.26, 0.12, 0.2, SM({ color: '#4a4a46' }), -3.4, 0.42, HALLZ - 0.38, g); void wr;
    [-1, 1].forEach((sd) => { const w2 = cyl(0.03, 0.03, 0.02, SM({ color: '#1a1a18' }), 8); w2.rotation.x = Math.PI / 2; w2.position.set(-3.4 + sd * 0.12, 0.03, HALLZ - 0.38); g.add(w2); });
    const wat = new THREE.Mesh(new THREE.CircleGeometry(0.15, 14), SM({ color: '#2a3a38', roughness: 0.1 })); wat.rotation.x = -Math.PI / 2; wat.position.set(-3.4, 0.33, HALLZ - 0.38); g.add(wat);
    const ex = cyl(0.07, 0.07, 0.45, SM({ color: '#9a2a1a' }), 10); ex.position.set(-7.6, 0.35, -HALLZ + 0.1); g.add(ex);
    const nb = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), SM({ map: texNotice() })); nb.position.set(-9.8, 1.55, -HALLZ + 0.02); g.add(nb); }
  // ceiling fluorescent fixtures (off at night)
  for (let x = -27; x < 0; x += 3) bx(0.18, 0.05, 1.2, SM({ color: '#c8ccc4', emissive: '#cfe8e0', emissiveIntensity: 0 }), x, HCEIL - 0.03, 0, g);
  // the end wall (x 0) and the grey STAIRS door (only on the night it is there)
  { const ew = shd(new THREE.Mesh(new THREE.PlaneGeometry(2 * HALLZ, HCEIL), plas)); ew.rotation.y = -Math.PI / 2; ew.position.set(0, HCEIL / 2, 0); g.add(ew);
    const D = new THREE.Group(); g.add(D); Wd.door = D;
    const dr = bx(0.05, 2.02, 0.94, SM({ map: texSteelDoor(), roughness: 0.5 }), -0.03, 1.01, 0, D); dr.rotation.y = 0; void dr;
    const fm = SM({ color: '#4a4e4c' }); bx(0.07, 2.12, 0.06, fm, -0.03, 1.06, -0.5, D); bx(0.07, 2.12, 0.06, fm, -0.03, 1.06, 0.5, D); bx(0.07, 0.06, 1.06, fm, -0.03, 2.1, 0, D);
    const kn = sph(0.028, SM({ color: '#b0a890', roughness: 0.3 }), 1, 1, 1, 8); kn.position.set(-0.08, 1.0, 0.36); D.add(kn); const kp = bx(0.02, 0.12, 0.05, SM({ color: '#8a8478' }), -0.06, 1.0, 0.36, D); void kp;
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.16), SM({ map: texSignStairs(), emissive: '#1e5a3e', emissiveIntensity: 0.35 })); sg.rotation.y = -Math.PI / 2; sg.position.set(-0.03, 2.35, 0); D.add(sg); Wd.signM = sg;
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), SM({ map: texPlate() })); pl.rotation.y = -Math.PI / 2; pl.position.set(-0.012, 1.55, -0.72); D.add(pl);
    mkOfuda(D, V3(-0.07, 1.62, 0.535), 0.08, 1.1, 1, -Math.PI / 2);   // torn ofuda on the door frame
    const nb2 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.7), SM({ map: texNotice() })); nb2.rotation.y = -Math.PI / 2; nb2.position.set(-0.012, 1.5, 0.1); g.add(nb2); Wd.dayBoard = nb2; }
}
function mkWell(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); Wd.well = g; const con = SM({ map: texStairCon(0) }), con2 = SM({ map: texStairCon(1) }), rail = SM({ color: '#3c4440', roughness: 0.4 }), dark = SM({ color: '#3a3c38' });
  const parts = [], rparts = [], top = 3, bot = -1.5 * (2 * NLV + 1) - 2, BG = new THREE.BoxGeometry(1, 1, 1), CY = new THREE.CylinderGeometry(1, 1, 1, 6);
  const box = (cx, cy, cz, sx, sy, sz, P = parts) => P.push([BG, new THREE.Matrix4().compose(V3(cx, cy, cz), new THREE.Quaternion(), V3(sx, sy, sz)), '#ffffff']);
  const bar = (a, b, r) => { const d = b.clone().sub(a), L = d.length(); rparts.push([CY, new THREE.Matrix4().compose(a.clone().addScaledVector(d, 0.5), new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), d.normalize()), V3(r, L, r)), '#ffffff']); };
  for (let n = 0; n <= 2 * NLV + 1; n++) { const y = landY(n), xc = landX(n); box(xc, y - 0.1, 0, LD, 0.2, 2 * (WELL + LW)); }   // landings (full width, cover the well at the ends)
  for (let fl = 0; fl <= 2 * NLV; fl++) { const A = fl % 2 === 0, zc = A ? -(WELL + LW / 2) : WELL + LW / 2, yTop = -1.5 * fl, sgn = A ? 1 : -1, x0 = A ? SX : SX + SL;
    for (let i = 0; i < 8; i++) { const y = yTop - (i + 1) * SR, xm = x0 + sgn * (i + 0.5) * ST; box(xm, y - SR / 2 - 0.03, zc, ST, SR + 0.06, LW); box(xm, y + 0.006, zc, ST + 0.02, 0.012, LW); }   // treads + nosing
    const sl = new THREE.Matrix4().compose(V3(x0 + sgn * SL / 2, yTop - 0.75 - 0.22, zc), new THREE.Quaternion().setFromAxisAngle(V3(0, 0, 1), -sgn * Math.atan2(1.5, SL)), V3(Math.hypot(SL, 1.5) + 0.1, 0.18, LW)); parts.push([BG, sl, '#ffffff']);   // the sloped slab under it
    // the handrail along the well edge: posts every 2 treads, a top rail and a mid rail
    const ze = A ? -WELL + 0.03 : WELL - 0.03, pA = V3(x0, yTop + 0.9, ze), pB = V3(x0 + sgn * SL, yTop - 1.5 + 0.9, ze); bar(pA, pB, 0.022); bar(pA.clone().add(V3(0, -0.45, 0)), pB.clone().add(V3(0, -0.45, 0)), 0.012);
    for (let i = 0; i <= 8; i += 2) { const px = x0 + sgn * (i * ST + (i === 8 ? -0.05 : 0.05)), py = yTop - Math.max(1, i) * SR * (i ? 1 : 0); bar(V3(px, py, ze), V3(px, py + 0.9 + (i === 0 ? 0 : 0), ze), 0.014); } }
  for (let n = 0; n <= 2 * NLV + 1; n++) { const y = landY(n), xe = n % 2 ? SX + SL : SX; bar(V3(xe, y + 0.9, -WELL), V3(xe, y + 0.9, WELL), 0.022); bar(V3(xe, y, -WELL), V3(xe, y + 0.9, -WELL), 0.016); bar(V3(xe, y, WELL), V3(xe, y + 0.9, WELL), 0.016); }   // rail across the well end of each landing
  const mesh = shd(new THREE.Mesh(mergeG(parts), SM({ map: texStairCon(0), vertexColors: true }))); g.add(mesh); const rm = shd(new THREE.Mesh(mergeG(rparts), rail)); g.add(rm);
  // walls: the two long walls, the two end walls (texture repeats down the shaft); a darker painted dado band
  { const H = top - bot, wm = SM({ map: texStairCon(1).clone() }); wm.map.repeat.set(2, H / 3); wm.map.needsUpdate = true; const em = SM({ map: texStairCon(1).clone() }); em.map.repeat.set(1, H / 3); em.map.needsUpdate = true;
    const L = SL + 2 * LD, zW = WELL + LW, xm = SX + SL / 2;
    [[-1, 0], [1, Math.PI]].forEach(([s, ry]) => { const m = shd(new THREE.Mesh(new THREE.PlaneGeometry(L, H), wm)); m.position.set(xm, (top + bot) / 2, s * zW); m.rotation.y = ry; g.add(m); });
    [[SX - LD, Math.PI / 2], [SX + SL + LD, -Math.PI / 2]].forEach(([x, ry]) => { const m = shd(new THREE.Mesh(new THREE.PlaneGeometry(2 * zW, H), em)); m.position.set(x, (top + bot) / 2, 0); m.rotation.y = ry; g.add(m); }); void con2; void dark; }
  // painted numbers, a bulb (cage + bracket) and a stain on each landing's end wall
  Wd.nums = []; Wd.bulbs = [];
  for (let n = 1; n <= 2 * NLV + 1; n++) { const E = n % 2 === 1, x = E ? SX + SL + LD - 0.012 : SX - LD + 0.012, ry = E ? -Math.PI / 2 : Math.PI / 2, y = landY(n);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), SM({ map: texLandNum(n), transparent: true, alphaTest: 0.3 })); m.position.set(x, y + 1.45, (E ? 1 : -1) * 0.55); m.rotation.y = ry; m.receiveShadow = true; g.add(m); Wd.nums.push(m);
    const bpos = V3(E ? x - 0.12 : x + 0.12, y + 2.45, 0); const bulb = sph(0.04, SM({ color: '#d8d0b0', emissive: '#ffd890', emissiveIntensity: 0 }), 1, 1.2, 1, 10); bulb.castShadow = false; bulb.position.copy(bpos); g.add(bulb);
    const br = bx(0.12, 0.02, 0.02, rail, E ? x - 0.06 : x + 0.06, y + 2.52, 0, g); void br; const cage = cyl(0.055, 0.055, 0.12, SM({ color: '#2a2c2a', wireframe: true }), 6, true); cage.position.copy(bpos); cage.castShadow = false; g.add(cage);
    Wd.bulbs.push({ n, p: bpos, m: bulb, live: [3, 6, 9, 12, 17].includes(n) ? 1 : n === 1 ? 1 : 0 }); }
  // the door at the top landing (west wall at landing 0), from inside; a torn ofuda on its frame
  { const dx = SX - LD + 0.02, D = new THREE.Group(); g.add(D); bx(0.04, 2.02, 0.94, SM({ map: texSteelDoor() }), dx, 1.01, -(WELL + LW / 2), D); mkOfuda(D, V3(dx + 0.04, 1.7, -(WELL + LW / 2) + 0.53), -0.1, 1.0, 2, Math.PI / 2); }
  g.traverse((m) => { if (m.isMesh) m.frustumCulled = false; });
}
// relabel the landing numbers (the same 19 landings stand in for any depth): label of landing n = base + n
function setNums(Wd, base) { Wd.nums.forEach((m, i) => { const t = texLandNum(base + i + 1); if (m.material.map !== t) { m.material.map = t; m.material.needsUpdate = true; } }); }

// ---------------- the world ----------------
function world() {
  if (WJ) return WJ;
  const scene = new THREE.Scene(), Wd = { scene }; WJ = Wd;
  scene.background = lin('#081416'); scene.fog = new THREE.Fog('#0a1a1c', 2, 12);
  Wd.cam = new THREE.PerspectiveCamera(50, YK.LW / YK.LH, 0.03, 900);
  Wd.hemi = new THREE.HemisphereLight('#4e8389', '#221c15', 0.6); scene.add(Wd.hemi);
  const moon = new THREE.DirectionalLight('#8fb1b0', 0.5); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); const sc = moon.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 120; moon.shadow.bias = -0.0008;
  scene.add(moon); scene.add(moon.target); Wd.moon = moon;
  Wd.rim = new THREE.DirectionalLight('#b9cbc6', 0); scene.add(Wd.rim); scene.add(Wd.rim.target);
  mkHall(Wd); mkWell(Wd); mkLamps(Wd); Wd.thing = mkThing(Wd);
  Wd.me = mkJanitor(); scene.add(Wd.me.g);
  Wd.torch = mkTorch(Wd); Wd.mop = mkMop(Wd);
  // lights (a fixed set: intensities change per shot, the count never does)
  Wd.lamp = new THREE.SpotLight('#fff0d0', 0, 7, 0.34, 0.5, 1.5); Wd.lamp.castShadow = true; Wd.lamp.shadow.mapSize.set(1024, 1024); Wd.lamp.shadow.bias = -0.0015; Wd.lamp.shadow.camera.near = 0.05; scene.add(Wd.lamp); scene.add(Wd.lamp.target);
  Wd.key = new THREE.SpotLight('#ffd8a0', 0, 30, 0.7, 0.6, 1.2); Wd.key.castShadow = true; Wd.key.shadow.mapSize.set(1024, 1024); Wd.key.shadow.bias = -0.0008; scene.add(Wd.key); scene.add(Wd.key.target);
  Wd.fill = new THREE.PointLight('#e8a860', 0, 20, 1.5); scene.add(Wd.fill);
  Wd.bounce = new THREE.PointLight('#c89060', 0, 4, 1.6); scene.add(Wd.bounce);
  Wd.red = new THREE.PointLight('#ff2a10', 0, 9, 1.4); scene.add(Wd.red);
  // the visible beam: a faint additive cone along the flashlight (reads in the fog)
  { const cg = new THREE.ConeGeometry(1, 1, 20, 1, true); cg.translate(0, -0.5, 0); cg.rotateX(-Math.PI / 2); const cm = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ color: '#d8e8e0', transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })); cm.frustumCulled = false; cm.visible = false; scene.add(cm); Wd.beam = cm; }
  { const mkP = (n, size, op) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3).fill(-999), 3)); const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#c8d8d0', size, sizeAttenuation: false, transparent: true, opacity: op, depthWrite: false })); p.frustumCulled = false; p.visible = false; scene.add(p); return p; };
    Wd.dust = mkP(500, 1.2, 0.55); }
  const grad = new THREE.DataTexture(new Uint8Array([45, 45, 45, 255, 135, 135, 135, 255, 255, 255, 255, 255]), 3, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const done = new Map(); scene.traverse((m) => { if (!m.isMesh || !m.material) return; const conv = (o) => { if (!o.isMeshStandardMaterial) return o; if (!done.has(o)) { const t = new THREE.MeshToonMaterial({ color: o.color, map: o.map, alphaMap: o.alphaMap, alphaTest: o.alphaTest, vertexColors: o.vertexColors, side: o.side, gradientMap: grad, transparent: o.transparent, opacity: o.opacity, depthWrite: o.depthWrite, emissive: o.emissive, emissiveIntensity: o.emissiveIntensity, wireframe: o.wireframe }); done.set(o, t); } return done.get(o); };
    m.material = Array.isArray(m.material) ? m.material.map(conv) : conv(m.material); });
  Wd.toon = done; return Wd;
}
const LIGHT = {
  hall:  { hemS: '#1e3440', hemG: '#0a0c10', hemI: 0.22, moonC: '#9ab8c8', moonI: 0.75, fog: '#0a1418', fn: 6, ff: 26, bg: '#081014', exp: 1.05 },
  well:  { hemS: '#1a3034', hemG: '#081012', hemI: 0.2, moonC: '#4e6a7a', moonI: 0.0, fog: '#0b1c1e', fn: 1.6, ff: 11, bg: '#0a1a1c', exp: 1.1 },
  dawn:  { hemS: '#6a8a96', hemG: '#3a4448', hemI: 0.7, moonC: '#d8e4e8', moonI: 0.9, fog: '#3a5058', fn: 8, ff: 40, bg: '#4a6470', exp: 1.0 },
};
function setLight(Wd, L) {
  Wd.hemi.color.set(L.hemS); Wd.hemi.groundColor.set(L.hemG); Wd.hemi.intensity = L.hemI; Wd.moon.color.set(L.moonC); Wd.moon.intensity = L.moonI;
  Wd.scene.fog.color.set(L.fog); Wd.scene.fog.near = L.fn; Wd.scene.fog.far = L.ff; Wd.scene.background.set(L.bg); rend().r.toneMappingExposure = L.exp;
}
const gT = () => 0;   // the hall floor is flat (walkP's default ground)
