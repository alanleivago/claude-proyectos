// =====================================================================
//  WORLD — the old mountain road to the Inunaki tunnel at night: cut slopes, cedars, guard rails, a curve mirror, the
//  masonry portal (moss, ivy, plaque) sealed with concrete blocks, the hand-painted sign, a 70-80 m lined tunnel, and at
//  its far end the drowned village (thatched houses, lanterns, flooded fields, dogs). A 1990s sedan with real headlight
//  beams; my brother (sukajan, jeans, high-tops, a flashlight); the villagers: far too tall and thin, long arms, ragged
//  noragi, heads wrapped in filthy bandages with one eye showing, sickles. Everyone is on one point rig (pelvis + basis,
//  two-bone IK arms and legs), hands with jointed fingers; held props sit in the fist (grip fitted to the curled fingers).
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

// ---------------------------------------------------------------------
//  the land: a road cut into the mountain, the portal face at z = 0, the tunnel to z = −80, the village beyond
// ---------------------------------------------------------------------
const XC = (z) => (z < 10 ? 0 : 0.011 * (z - 10) * (z - 10));   // road centreline (straight at the tunnel, curving right further down)
const ROAD_HW = 3.1, FACE_HW = 8.6;
const PORT = { hw: 2.5, spring: 2.2, crown: 4.7, depth: 1.6, top: 7.6 };
const TUN_Z1 = -80, FAR_Z = -81.6;
function bankH(x, z) {
  const d = x - XC(z), ad = Math.abs(d), b = 4.0 + 2.2 * ss(8, 1, z), st = 1.5 + 2.2 * ss(9, 0, z);
  let h = Math.min(34, Math.max(0, ad - b) * st);
  if (d > 0) h = lerp(h, -Math.min(16, Math.max(0, ad - 4.7) * 1.05), ss(14, 26, z));
  return h + (fbm2(x * 0.17 + 3, z * 0.17) - 0.5) * 1.2 * clamp(ad - b) * (z > -1 ? ss(1.5, 5, z) : 1);
}
const mtnH = (x, z) => 8.4 + 6 * ss(-2, -16, z) + (fbm2(x * 0.05 + 11, z * 0.05) - 0.5) * 7 * ss(-1, -10, z) + Math.abs(x) * 0.05;
function villageH(x, z) {
  const ax = Math.abs(x), lane = ax < 1.4 ? 0 : -0.32 + (fbm2(x * 0.3, z * 0.3) - 0.5) * 0.3;
  return lane + Math.max(0, ax - 24) * 0.75 + Math.max(0, -z - 150) * 0.6 + (ax > 24 || z < -150 ? (fbm2(x * 0.1, z * 0.1) - 0.5) * 4 : 0);
}
function hT(x, z) {
  const ax = Math.abs(x);
  if (z <= -81.1) { const v = villageH(x, z); return ax < 11.6 ? v : lerp(Math.max(bankH(x, z), mtnH(x, z)), v, ss(-81, -88, z)); }
  if (z > 0 || (ax < FACE_HW && z > -0.75)) return bankH(x, z);
  return Math.max(bankH(x, z), mtnH(x, z));
}
// the ground height where people and props stand (roads and tunnel floor are at 0)
const groundY = (x, z) => (z <= 0.2 && z >= FAR_Z && Math.abs(x) < PORT.hw ? 0 : Math.max(0, hT(x, z)) * (Math.abs(x - XC(z)) < ROAD_HW + 0.8 && z > -0.2 ? 0 : 1) + (z < FAR_Z ? Math.min(0, hT(x, z)) : 0));
function gridAxis(a, b, fine) { const v = []; let p = a; while (p <= b + 1e-6) { v.push(+p.toFixed(3)); p += fine.some(([u, w]) => p >= u && p < w) ? 0.5 : 1.5; } return v; }
function mkTerrain(Wd) {
  const xs = gridAxis(-51, 72, [[-14, 14], [10, 34]]), zs = gridAxis(-160, 82, [[-6, 24], [-90, -78]]);
  const nx = xs.length, nz = zs.length, P = new Float32Array(nx * nz * 3), C = new Float32Array(nx * nz * 3), UV = new Float32Array(nx * nz * 2), H0 = [];
  const cMoss = lin('#2c3a2c'), cSoil = lin('#3c3428'), cRock = lin('#4a4c46'), cGrav = lin('#4e4c46'), cMud = lin('#2a261e'), tmp = new THREE.Color();
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = xs[i], z = zs[j], h = hT(x, z), k = j * nx + i; P[k * 3] = x; P[k * 3 + 1] = h; P[k * 3 + 2] = z; UV[k * 2] = x / 6; UV[k * 2 + 1] = z / 6; H0.push(h);
    const d = Math.abs(x - XC(z)), sl = Math.abs(hT(x + 0.5, z) - hT(x - 0.5, z)) + Math.abs(hT(x, z + 0.5) - hT(x, z - 0.5)), n = fbm2(x * 0.4, z * 0.4);
    if (z < FAR_Z && Math.abs(x) < 1.45) tmp.copy(cGrav).lerp(cSoil, n * 0.5).multiplyScalar(1.35); else if (z < FAR_Z) tmp.copy(cMud).lerp(cMoss, n * 0.8); else if (d < ROAD_HW + 1.2 && h < 0.3) tmp.copy(cGrav).lerp(cMud, n); else if (sl > 2.6) tmp.copy(cRock).lerp(cSoil, n); else tmp.copy(cMoss).lerp(cSoil, n * 0.9);
    C[k * 3] = tmp.r; C[k * 3 + 1] = tmp.g; C[k * 3 + 2] = tmp.b; }
  const idx = [], cut = (cx, cz) => (Math.abs(cx) < PORT.hw + 0.45 && ((cz < 0 && cz > -PORT.depth) || (cz < TUN_Z1 && cz > FAR_Z)));
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
    const cx = (xs[i] + xs[i + 1]) / 2, cz = (zs[j] + zs[j + 1]) / 2; if (cut(cx, cz)) continue; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(C, 3)); g.setAttribute('uv', new THREE.BufferAttribute(UV, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, SM({ map: texGround(), vertexColors: true, color: '#c8c8c0' })); m.receiveShadow = true; m.castShadow = true; Wd.scene.add(m); Wd.terrain = m;
  { const t = m.material.map; t.repeat.set(1, 1); }
}
// the road ribbon (z from 0 down the mountain), with puddles
function mkRoad(Wd) {
  const P = [], UV = [], idx = []; let v = 0, prev = null;
  for (let z = -0.0, k = 0; z <= 80; z += 0.5, k++) { const xc = XC(z), dx = XC(z + 0.01) - xc, t = V3(dx / 0.01, 0, 1).normalize(), n = V3(t.z, 0, -t.x);
    if (prev) v += prev.distanceTo(V3(xc, 0, z)) / 12.4; prev = V3(xc, 0, z);
    [-1, 1].forEach((s) => { const p = V3(xc, 0, z).addScaledVector(n, s * ROAD_HW); P.push(p.x, 0.03, p.z); UV.push(s < 0 ? 0 : 1, v); });
    if (k) { const a = (k - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(idx); g.computeVertexNormals();
  if (g.attributes.normal.getY(0) < 0) { g.setIndex(idx.map((_, i) => idx[i - (i % 3) + [0, 2, 1][i % 3]])); g.computeVertexNormals(); }
  const m = new THREE.Mesh(g, SM({ map: texRoad(), roughness: 0.7 })); m.receiveShadow = true; Wd.scene.add(m);
  // forecourt asphalt in front of the portal (wider than the road)
  const fc = new THREE.Mesh(new THREE.PlaneGeometry(12.4, 7.8), SM({ map: texAsphalt('fc', [2, 1.3]), roughness: 0.7 })); fc.rotation.x = -Math.PI / 2; fc.position.set(0, 0.02, 3.9); fc.receiveShadow = true; Wd.scene.add(fc);
  // puddles: dark mirror-ish patches that pick up the sky and lights
  const pm = SM({ color: '#1f3c44', roughness: 0.2, metalness: 0.5 }), R = RNG('puddles'); Wd.puddles = [];
  for (let i = 0; i < 26; i++) { const z = i < 10 ? R.r(0.5, 7.5) : R.r(7, 60), x = XC(z) + R.n(i < 10 ? 4.6 : 2.6), s = R.r(0.25, 0.75); if (Math.hypot(x - (XC(14) - 3.5), z - 13.6) < 4) continue;
    const p = new THREE.Mesh(new THREE.CircleGeometry(1, 14), pm); p.rotation.x = -Math.PI / 2; p.scale.set(s * R.r(1, 2.2), s, 1); p.rotation.z = R.r(0, TAU); p.position.set(x, 0.04 + i * 0.0002, z); p.receiveShadow = true; Wd.scene.add(p); Wd.puddles.push(p); }
}

// ---------------------------------------------------------------------
//  the portal (masonry face with the arch hole, voussoirs, plaque, parapet, ivy), the blocks, the tunnel, the sign
// ---------------------------------------------------------------------
function archPts(n = 20, inset = 0) { const p = [V3(-PORT.hw + inset, 0, 0), V3(-PORT.hw + inset, PORT.spring, 0)]; for (let k = 1; k < n; k++) { const a = Math.PI - (k / n) * Math.PI; p.push(V3(Math.cos(a) * (PORT.hw - inset), PORT.spring + Math.sin(a) * (PORT.hw - inset), 0)); } p.push(V3(PORT.hw - inset, PORT.spring, 0), V3(PORT.hw - inset, 0, 0)); return p; }
function mkPortal(Wd, zFace, dir, key) {   // dir = +1: faces +z (front), −1: faces −z (far end)
  const g = new THREE.Group(); g.position.z = zFace; if (dir < 0) g.rotation.y = Math.PI; Wd.scene.add(g);
  const sh = new THREE.Shape(); if (dir > 0) { sh.moveTo(-6.0, -0.6); sh.lineTo(6.0, -0.6); sh.lineTo(FACE_HW, PORT.top); sh.lineTo(-FACE_HW, PORT.top); } else { sh.moveTo(-14, -1); sh.lineTo(14, -1); sh.lineTo(14, 10); sh.lineTo(-14, 10); }
  const hole = new THREE.Path(); archPts().forEach((p, i) => (i ? hole.lineTo(p.x, p.y) : hole.moveTo(p.x, p.y))); hole.lineTo(-PORT.hw, 0); sh.holes.push(hole);
  const st = texStone(key, dir > 0 ? 1 : 0.6); st.repeat.set(0.18, 0.18);
  const face = shd(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: PORT.depth, bevelEnabled: false, curveSegments: 24 }), SM({ map: st, roughness: 0.95 }))); face.position.z = -PORT.depth; g.add(face);
  // voussoirs: a ring of lighter dressed stones, protruding; a keystone
  const vm = SM({ map: texStone(key + 'v', 0.4), color: '#b0aea0' }); vm.map.repeat.set(0.3, 0.3);
  for (let k = 0; k <= 22; k++) { const a = Math.PI - (k / 22) * Math.PI, r = PORT.hw + 0.28, kk = k === 11; const b = bx(kk ? 0.42 : 0.3, kk ? 0.72 : 0.56, 0.16, vm, Math.cos(a) * r, PORT.spring + Math.sin(a) * r + (kk ? 0.06 : 0), 0.06, g); b.rotation.z = a - Math.PI / 2; }
  [-1, 1].forEach((s) => { for (let k = 0; k < 4; k++) bx(0.56, 0.5, 0.14, vm, s * (PORT.hw + 0.28), 0.3 + k * 0.53, 0.05, g); });
  // the parapet and its capping, two pilasters
  bx(FACE_HW * 2 + 0.4, 0.38, PORT.depth + 0.3, vm, 0, PORT.top + 0.15, -PORT.depth / 2 + 0.1, g);
  [-1, 1].forEach((s) => bx(0.7, PORT.top, 0.18, SM({ map: st }), s * 4.4, PORT.top / 2, 0.08, g));
  bx(FACE_HW * 2 - 2.4, 0.22, 0.24, vm, 0, 6.15, 0.1, g);
  if (dir > 0) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.56), SM({ map: texPlaque() })); pl.position.set(0, 5.62, 0.085); g.add(pl); bx(1.62, 0.66, 0.06, vm, 0, 5.62, 0.05, g); }
  return g;
}
function mkTunnel(Wd) {
  const prof = archPts(24, 0); let L = 0; const lens = [0]; for (let i = 1; i < prof.length; i++) { L += prof[i].distanceTo(prof[i - 1]); lens.push(L); }
  const P = [], UV = [], idx = [], nz = 110, z0 = -PORT.depth + 0.02, z1 = TUN_Z1 - 0.02, R = RNG('tube');
  for (let j = 0; j <= nz; j++) { const z = lerp(z0, z1, j / nz); prof.forEach((p, i) => { const wob = i > 0 && i < prof.length - 1 ? R.n(0.025) : 0, n = V3(-p.x, PORT.spring - p.y, 0).normalize(); P.push(p.x + n.x * wob, p.y + n.y * wob, z); UV.push(lens[i] / L, -z / 6); }); }
  const np = prof.length; for (let j = 0; j < nz; j++) for (let i = 0; i < np - 1; i++) { const a = j * np + i, b = a + 1, c = a + np, d = c + 1; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, SM({ map: texLining(), side: THREE.DoubleSide, roughness: 0.6 })); m.receiveShadow = true; m.castShadow = false; Wd.scene.add(m);
  // floor (old asphalt, wet), curbs and gutters along both walls
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(PORT.hw * 2, -FAR_Z + 0.4), SM({ map: texAsphalt('tfl', [1, 14]), roughness: 0.5 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.01, (FAR_Z - 0.4) / 2 + 0.2); fl.receiveShadow = true; Wd.scene.add(fl);
  const cm = SM({ map: texLining(), color: '#9a9a90' }); [-1, 1].forEach((s) => { const c = bx(0.42, 0.22, -FAR_Z, cm, s * (PORT.hw - 0.21), 0.11, FAR_Z / 2); c.receiveShadow = true; Wd.scene.add(c); });
  // dead lamp housings and a cable along the right wall; graffiti decals near the entrance
  const lh = SM({ color: '#3f4542', roughness: 0.5, metalness: 0.4 }); for (let z = -6; z > TUN_Z1 + 2; z -= 12) { const b = bx(0.14, 0.3, 0.5, lh, PORT.hw - 0.1, 2.9, z); b.rotation.z = 0.3; Wd.scene.add(b); const gl = bx(0.02, 0.22, 0.4, SM({ color: '#56706c' }), PORT.hw - 0.18, 2.88, z); gl.rotation.z = 0.3; Wd.scene.add(gl); }
  { const c = cyl(0.015, 0.015, -TUN_Z1, SM({ color: '#141a1a' }), 5); c.rotation.x = Math.PI / 2; c.position.set(PORT.hw - 0.03, 2.6, TUN_Z1 / 2); Wd.scene.add(c); }
  for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, z = -2.2 - i * 2.3, pm = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), SM({ map: texGraffitiWall(i), transparent: true, alphaTest: 0.05 })); pm.rotation.y = s * -Math.PI / 2; pm.position.set(s * (PORT.hw - 0.012), 1.1 + (i % 3) * 0.12, z); Wd.scene.add(pm); }
}
// the blocks: heavy concrete cubes stacked across the mouth (two full rows and two on top at the sides), graffiti
const BLOCKS = [];
(function () { const R = RNG('blocks'); for (let i = 0; i < 5; i++) BLOCKS.push({ x: -2.4 + i * 1.2 + R.n(0.05), y: 0.5, z: 0.75 + R.n(0.12), ry: R.n(0.06), i });
  for (let i = 0; i < 4; i++) BLOCKS.push({ x: -1.8 + i * 1.2 + R.n(0.06), y: 1.5, z: 0.7 + R.n(0.1), ry: R.n(0.08), i: i + 5 });
  [-1.75, 1.75].forEach((x, k) => BLOCKS.push({ x: x + R.n(0.05), y: 2.5, z: 0.72, ry: R.n(0.1), i: 9 + k })); })();
function mkBlocks(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); Wd.blocks = g;
  BLOCKS.forEach((b) => { const m = bx(1.18, 0.98, 1.18, SM({ map: texBlock(b.i % 6) }), b.x, b.y, b.z, g); m.rotation.y = b.ry; });
  // pale rectangles on the asphalt where the blocks stood (seen when they are gone)
  const sc = new THREE.Group(); Wd.scene.add(sc); Wd.blockScars = sc; const scm = SM({ color: '#5a5c58', roughness: 0.9 });
  BLOCKS.filter((b) => b.y < 1).forEach((b) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.14, 1.14), scm); p.rotation.x = -Math.PI / 2; p.rotation.z = b.ry; p.position.set(b.x, 0.025, b.z); sc.add(p); });
}
function mkSign(Wd) {
  const g = new THREE.Group(); g.position.set(3.95, 0, 2.55); g.rotation.y = -0.42; Wd.scene.add(g); Wd.sign = g;
  const wood = SM({ map: texPlank(), color: '#8a7a64' });
  [-0.6, 0.6].forEach((x) => { const p = bx(0.09, 2.3, 0.09, wood, x, 1.15, -0.05, g); p.rotation.z = x * 0.02; });
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.0, 0.04), [SM({ color: '#6a5a44' }), SM({ color: '#6a5a44' }), SM({ color: '#6a5a44' }), SM({ color: '#6a5a44' }), SM({ map: texSign(), roughness: 0.9 }), SM({ color: '#4a3a28' })]);
  board.position.set(0, 1.55, 0); board.rotation.z = 0.025; shd(board); g.add(board); Wd.signBoard = board;
  const roof = bx(1.5, 0.04, 0.3, wood, 0, 2.12, 0.04, g); roof.rotation.x = 0.25;
  // a rope with shide (paper streamers) tied between the posts under the board: someone tried to ward it
  { const rope = cyl(0.012, 0.012, 1.2, SM({ color: '#8a7444' }), 5); rope.rotation.z = Math.PI / 2; rope.position.set(0, 0.92, 0.03); g.add(rope);
    for (let k = 0; k < 4; k++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.2), SM({ color: '#d3d6cc', side: THREE.DoubleSide })); s.position.set(-0.42 + k * 0.28, 0.81, 0.04); s.rotation.z = (k % 2 ? 0.08 : -0.08); g.add(s); } }
}
// ---------------------------------------------------------------------
//  roadside: cedars, grass, bushes, ivy over the portal, guard rails, delineators, the curve mirror, a fallen barrier
// ---------------------------------------------------------------------
function mkCedars(Wd) {
  const R = RNG('cedars'), pts = [];
  const ok = (x, z) => { const d = Math.abs(x - XC(z)); if (z > -2 && z < 80 && d < 7.6 + (z < 3 ? 3 : 0)) return false; if (z > -3 && z < 1 && Math.abs(x) < 10) return false; if (z < FAR_Z - 0.5 && Math.abs(x) < 20 && z > -150) return Math.abs(x) > 15 || R.f() < 0.04; return true; };
  for (let i = 0; i < 9000 && pts.length < 1700; i++) { const near = i % 3 === 0, x = near ? R.r(-24, 30) : R.r(-50, 70), z = near ? R.r(-12, 40) : R.r(-160, 80); if (!ok(x, z)) continue; if (Math.abs(x - XC(z)) < 9 && R.f() < 0.4) continue; pts.push([x, z, R.r(14, 30), R.r(0.18, 0.34), R.f()]); }
  const trunk = IM(new THREE.CylinderGeometry(0.7, 1, 1, 7), SM({ map: texBark() }), pts.length), tiers = 5, cone = IM(new THREE.ConeGeometry(1, 1, 8), SM({ map: texNeedles(), color: '#9aa69a' }), pts.length * tiers);
  pts.forEach(([x, z, h, r, f], i) => { const y = hT(x, z) - 0.4; trunk.setMatrixAt(i, M4c(x, y + h / 2, z, f * 6, r, h, r));
    for (let k = 0; k < tiers; k++) { const ty = y + h * (0.42 + k * 0.13), cr = h * 0.085 * (1 - k * 0.15) * (0.8 + f * 0.4), ch = h * 0.24; cone.setMatrixAt(i * tiers + k, M4c(x + Math.sin(k + f * 9) * 0.15, ty + ch / 2, z + Math.cos(k * 2 + f) * 0.15, f * 9 + k, cr, ch, cr)); } });
  Wd.scene.add(trunk); Wd.scene.add(cone); Wd.cedarPts = pts;
}
function mkGrowth(Wd) {
  // grass blades on the shoulders, banks and the village edges; bushes and ferns; leaves on the asphalt
  const R = RNG('grass'), n = 26000, gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute([-0.012, 0, 0, 0.012, 0, 0, 0, 1, 0.01], 3)); gg.computeVertexNormals();
  const gm = IM(gg, SM({ color: '#ffffff', side: THREE.DoubleSide }), n, false); let c = 0;
  for (let i = 0; i < n * 3 && c < n; i++) { const z = R.f() < 0.75 ? R.r(-1, 30) : R.r(-150, -82), x = z > 0 ? XC(z) + (R.f() < 0.5 ? -1 : 1) * R.r(ROAD_HW + 0.05, 9) : z < FAR_Z ? R.r(-22, 22) : R.r(-12, 12), y = hT(x, z);
    if (z > -1.2 && z < 0.4 && Math.abs(x) < FACE_HW) continue; if (z < FAR_Z && Math.abs(x) < 1.5) continue; if (z > 0 && Math.abs(x - XC(z)) < ROAD_HW + 0.05) continue;
    gm.setMatrixAt(c, M4c(x, y - 0.02, z, R.r(0, TAU), R.r(0.7, 1.3), R.r(0.12, 0.42), 1, R.n(0.3), R.n(0.3))); gm.setColorAt(c, lin(R.pick(['#3c5a40', '#2c4434', '#56703c', '#4a5a34', '#6a7444', '#22382c']))); c++; }
  gm.count = c; Wd.scene.add(gm); Wd.grass = gm;
  const bush = IM(new THREE.IcosahedronGeometry(1, 0), SM({ map: texNeedles(), color: '#7c9a7c' }), 700); c = 0;
  for (let i = 0; i < 4000 && c < 700; i++) { const z = R.r(-2, 40), side = R.f() < 0.5 ? -1 : 1, x = z < 1 ? side * R.r(5.5, 11) : XC(z) + side * R.r(ROAD_HW + 0.6, 10), y = hT(x, z); if (z < 0.6 && z > -1.3 && Math.abs(x) < FACE_HW - 0.2) continue; if (Math.hypot(x - (XC(14) - 3.5), z - 13.6) < 3.5) continue; const s = R.r(0.3, 0.9);
    bush.setMatrixAt(c, M4c(x, y + s * 0.4, z, R.r(0, TAU), s * R.r(1, 1.6), s, s * R.r(1, 1.5))); bush.setColorAt(c, lin(R.pick(['#ffffff', '#c8d8c0', '#a8b8a0', '#dce6cc']))); c++; }
  bush.count = c; Wd.scene.add(bush);
  // fallen leaves / needles / twigs on the forecourt and in the tunnel mouth
  const lv = IM(new THREE.PlaneGeometry(0.08, 0.05).rotateX(-Math.PI / 2), SM({ color: '#ffffff', side: THREE.DoubleSide }), 900, false);
  let nlv = 0; for (let i = 0; i < 1400 && nlv < 900; i++) { const x = R.r(-6, 6), z = i % 3 === 0 ? R.r(-6, 1.5) : R.r(-0.5, 9), y = 0.046 + (i % 9) * 0.0004; if (z < 0.1 && Math.abs(x) > 2.1) continue; lv.setMatrixAt(nlv, M4c(x, y, z, R.r(0, TAU), R.r(0.4, 0.95), 1, R.r(0.4, 0.95))); lv.setColorAt(nlv, lin(R.pick(['#5a4430', '#8e3a24', '#3c2c1e', '#6a5038', '#2c3a2c', '#a07c50']))); nlv++; }
  lv.count = nlv; Wd.scene.add(lv);
  // ivy hanging over the parapet: strands of leaves that sway
  const IR = RNG('ivy'), strands = []; for (let i = 0; i < 46; i++) { const x = IR.r(-FACE_HW + 0.6, FACE_HW - 0.6); if (Math.abs(x) < 1.1) continue; strands.push({ x, L: IR.r(0.8, x * x < 16 ? 2.6 : 4.2), ph: IR.r(0, TAU), n: 14 }); }
  const nl = strands.reduce((a, s) => a + s.n, 0), ivy = IM(new THREE.PlaneGeometry(0.16, 0.13), SM({ color: '#ffffff', side: THREE.DoubleSide }), nl, true); let q = 0;
  strands.forEach((s) => { s.i0 = q; for (let k = 0; k < s.n; k++) { ivy.setColorAt(q, lin(IR.pick(['#2c4434', '#3c5a40', '#22382c', '#56703c']))); q++; } }); Wd.ivy = { m: ivy, strands }; Wd.scene.add(ivy);
}
function mkRoadside(Wd) {
  const R = RNG('roadside'), rail = SM({ map: texMetal('rail', '#9aa098'), roughness: 0.5, metalness: 0.4 }), post = SM({ map: texMetal('post', '#8a8e88'), metalness: 0.4 });
  // guard rail on the valley side (z 11..70) and on the mountain side near the curve; W-beam = two stacked boxes
  const railAt = (z0, z1, side) => { for (let z = z0; z < z1; z += 2) { const a = V3(XC(z) + side * 3.75, 0, z), b = V3(XC(z + 2) + side * 3.75, 0, z + 2), d = b.clone().sub(a), L = d.length(), ry = Math.atan2(d.x, d.z);
      [0.62, 0.74].forEach((y) => { const m = bx(0.04, 0.1, L + 0.02, rail, (a.x + b.x) / 2, y, (a.z + b.z) / 2); m.rotation.y = ry; m.rotation.z = R.n(0.01); Wd.scene.add(m); });
      const p = bx(0.09, 0.8, 0.09, post, a.x + side * 0.05, 0.4, a.z); Wd.scene.add(p); } };
  railAt(11, 72, 1); railAt(26, 46, -1);
  // delineators (white posts with orange reflectors) on the curve's inside
  for (let z = 14; z < 50; z += 4) { const x = XC(z) - 3.55, p = bx(0.08, 0.9, 0.08, SM({ color: '#d3d6cc' }), x, 0.45, z); Wd.scene.add(p); const r = bx(0.085, 0.1, 0.085, BM('#e8a050'), x, 0.82, z); Wd.scene.add(r); }
  // the curve mirror (カーブミラー): an orange pole, a round convex mirror with an orange rim
  { const g = new THREE.Group(), x = XC(22) + 4.05; g.position.set(x, 0, 22); g.rotation.y = 2.6; Wd.scene.add(g); const or = SM({ color: '#c86a30', roughness: 0.5 });
    const p = cyl(0.04, 0.04, 3.0, or, 8); p.position.y = 1.5; g.add(p); const rim = shd(new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 6, 20), or)); rim.position.set(0, 3.0, 0.08); g.add(rim);
    const mir = new THREE.Mesh(new THREE.SphereGeometry(0.9, 18, 10, 0, TAU, 0, 0.47), SM({ color: '#8fb1b0', roughness: 0.1, metalness: 0.9 })); mir.rotation.x = Math.PI / 2; mir.position.set(0, 3.0, -0.72); g.add(mir); }
  // a fallen barricade (yellow-black stripes) and a rusty 通行止 sign on the forecourt
  { const st = txCanvas('stripe', 64, 16, (x, w, h) => { x.fillStyle = '#d8b040'; x.fillRect(0, 0, w, h); x.fillStyle = '#16110c'; for (let i = -16; i < w; i += 16) { x.beginPath(); x.moveTo(i, h); x.lineTo(i + 8, 0); x.lineTo(i + 16, 0); x.lineTo(i + 8, h); x.fill(); } }, [2, 1]);
    const g = new THREE.Group(); g.position.set(-4.1, 0, 4.4); g.rotation.y = 0.5; Wd.scene.add(g); const bar = bx(1.6, 0.16, 0.04, SM({ map: st }), 0, 0.09, 0, g); bar.rotation.x = -Math.PI / 2 + 0.05;
    [-0.7, 0.7].forEach((x) => { const l = bx(0.05, 0.05, 0.9, SM({ color: '#848a8b' }), x, 0.03, 0.35, g); void l; });
    const sg = new THREE.Group(); sg.position.set(-5.2, 0, 3.0); sg.rotation.y = 0.25; Wd.scene.add(sg); const ps = cyl(0.03, 0.03, 1.6, SM({ map: texMetal('sp', '#7a7c74') }), 6); ps.position.y = 0.8; sg.add(ps);
    const plate = txCanvas('tsudome', 96, 96, (x, w, h, R2) => { x.fillStyle = '#e8e6da'; x.fillRect(0, 0, w, h); x.strokeStyle = '#b3271c'; x.lineWidth = 8; x.beginPath(); x.arc(48, 48, 40, 0, TAU); x.stroke(); x.fillStyle = '#26304a'; x.font = "900 26px " + JPG; x.textAlign = 'center'; x.fillText('通行止', 48, 58);
      for (let i = 0; i < 30; i++) { x.fillStyle = 'rgba(110,60,30,0.5)'; blob(x, R2.r(0, w), R2.r(0, h), R2.r(2, 8), R2); x.fill(); } });
    const pm = new THREE.Mesh(new THREE.CircleGeometry(0.33, 20), SM({ map: plate })); pm.position.set(0, 1.45, 0.04); sg.add(pm); const back = new THREE.Mesh(new THREE.CircleGeometry(0.33, 20), SM({ color: '#848a8b' })); back.rotation.y = Math.PI; back.position.set(0, 1.45, 0.03); sg.add(back); }
  // debris on the forecourt: rocks, cans, bottles, a broken umbrella, branches
  { const rk = IM(new THREE.DodecahedronGeometry(1, 0), SM({ color: '#5e615a' }), 60); for (let i = 0; i < 60; i++) { const x = R.r(-6, 6), z = R.r(-3, 6), s = R.r(0.04, 0.16); rk.setMatrixAt(i, M4c(x, s * 0.5, z, R.r(0, 6), s, s * 0.7, s)); } Wd.scene.add(rk);
    for (let i = 0; i < 9; i++) { const can = cyl(0.033, 0.033, 0.12, SM({ color: R.pick(['#b3271c', '#d3d6cc', '#26304a', '#c8a050']), metalness: 0.5, roughness: 0.4 }), 8); can.rotation.set(Math.PI / 2, R.r(0, 6), 0); can.position.set(R.r(-4.8, 4.8), 0.034, R.r(-2, 5)); Wd.scene.add(can); }
    for (let i = 0; i < 4; i++) { const b = cyl(0.03, 0.04, 0.26, SM({ color: R.pick(['#2c5a3a', '#5a4430']), roughness: 0.2, transparent: true, opacity: 0.85 }), 8); b.rotation.set(Math.PI / 2, R.r(0, 6), 0); b.position.set(R.r(-4.5, 4.5), 0.042, R.r(1.6, 5.5)); Wd.scene.add(b); }
    for (let i = 0; i < 7; i++) { const br = cyl(0.025, 0.035, R.r(0.6, 1.6), SM({ map: texBark() }), 5); br.rotation.set(Math.PI / 2, R.r(0, 6), 0); br.position.set(R.f() < 0.5 ? R.r(-6, -3.6) : R.r(3.6, 6), 0.03, R.r(-0.5, 7)); Wd.scene.add(br); } }
}

// ---------------------------------------------------------------------
//  the car: a 1990s Japanese four-door sedan (boxy, RHD), dark red; front toward local −z
// ---------------------------------------------------------------------
function mkCar(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); Wd.car = g;
  const paint = SM({ color: '#c9c7bb', roughness: 0.35, metalness: 0.2 }), trim = SM({ color: '#141414', roughness: 0.6 }), chrome = SM({ color: '#b9cbc6', roughness: 0.25, metalness: 0.8 });
  const side = (pts, arches) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(([a, b]) => s.lineTo(a, b)); (arches || []).forEach(([cx]) => { s.lineTo(cx - 0.37, 0.3); s.absarc(cx, 0.3, 0.37, Math.PI, 0, true); }); s.lineTo(pts[0][0], pts[0][1]); return s; };
  const ext = (sh, w, mat, bev = 0.035) => { const geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: true, bevelSize: bev, bevelThickness: bev, bevelSegments: 2, curveSegments: 10 }); geo.translate(0, 0, -w / 2); const m = shd(new THREE.Mesh(geo, mat)); m.rotation.y = -Math.PI / 2; return m; };
  // body: nose, hood, cowl, belt line, trunk, rear; wheel arches cut from the sill
  const body = ext(side([[2.28, 0.3], [2.33, 0.46], [2.31, 0.78], [2.24, 0.86], [1.52, 0.88], [1.4, 0.84], [-0.86, 0.84], [-1.02, 0.8], [-2.22, 0.73], [-2.3, 0.64], [-2.32, 0.46], [-2.26, 0.3], [-1.72, 0.3]], [[-1.35], [1.35]]), 1.62, paint);
  g.add(body);
  // greenhouse: glass volume, then pillars and the roof in paint
  const glassM = SM({ color: '#16242a', roughness: 0.15, metalness: 0.5, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false });
  const cab = ext(side([[-0.84, 0.86], [-0.12, 1.34], [0.96, 1.35], [1.5, 0.88]]), 1.36, glassM, 0.02); cab.renderOrder = 3; cab.castShadow = false; g.add(cab); Wd.carGlass = cab;
  const roof = ext(side([[-0.1, 1.33], [0.96, 1.34], [0.98, 1.38], [-0.12, 1.38]]), 1.42, paint, 0.02); g.add(roof);
  [-1, 1].forEach((sx) => { const x = sx * 0.69, pl = (a, b, r = 0.035) => { const m = shd(new THREE.Mesh(UCYL1, trim)); between(m, a, b, r); g.add(m); return m; };
    pl(V3(x, 0.86, -0.84), V3(x * 0.98, 1.35, -0.12)); pl(V3(x, 0.86, 0.38), V3(x * 0.99, 1.35, 0.38), 0.04); pl(V3(x, 0.86, 1.5), V3(x * 0.98, 1.35, 0.96), 0.05);
    pl(V3(x, 0.87, -0.84), V3(x, 0.87, 1.5), 0.02);   // window sill trim
    bx(0.01, 0.03, 3.2, trim, sx * 0.85, 0.55, 0.0, g); bx(0.01, 0.5, 0.008, trim, sx * 0.849, 0.58, 0.36, g); bx(0.01, 0.5, 0.008, trim, sx * 0.849, 0.58, -0.86, g); bx(0.01, 0.46, 0.008, trim, sx * 0.849, 0.6, 1.4, g);   // door gaps, molding
    bx(0.02, 0.025, 0.12, chrome, sx * 0.85, 0.76, -0.55, g); bx(0.02, 0.025, 0.12, chrome, sx * 0.85, 0.76, 0.6, g);   // handles
    const dm = bx(0.18, 0.11, 0.06, paint, sx * 0.98, 0.98, -0.66, g); dm.rotation.y = sx * 0.2; bx(0.14, 0.08, 0.005, chrome, sx * 0.98, 0.98, -0.63, g).rotation.y = sx * 0.2; });
  // front: headlights (flush rectangles), corner lamps, grille, bumper, plate; rear: tail light band, bumper, plate
  Wd.headM = BM('#3a3428'); Wd.tailM = BM('#3a0c08'); Wd.revM = BM('#3a3a36');
  [-1, 1].forEach((sx) => { bx(0.44, 0.13, 0.03, Wd.headM, sx * 0.5, 0.64, -2.348, g); bx(0.12, 0.11, 0.03, BM('#8a5a1e'), sx * 0.81, 0.64, -2.34, g); bx(0.48, 0.17, 0.03, chrome, sx * 0.5, 0.64, -2.338, g);
    bx(0.62, 0.11, 0.03, Wd.tailM, sx * 0.48, 0.7, 2.362, g); bx(0.1, 0.08, 0.03, Wd.revM, sx * 0.13, 0.7, 2.364, g); });
  { const gr = txCanvas('grille', 64, 16, (x, w, h) => { x.fillStyle = '#0c0c0c'; x.fillRect(0, 0, w, h); x.fillStyle = '#8a9290'; for (let y = 2; y < h; y += 4) x.fillRect(0, y, w, 1.5); x.fillStyle = '#b9cbc6'; x.fillRect(28, 4, 8, 8); }); bx(0.5, 0.13, 0.03, SM({ map: gr }), 0, 0.64, -2.345, g); }
  bx(1.8, 0.16, 0.2, trim, 0, 0.4, -2.27, g); bx(1.8, 0.16, 0.2, trim, 0, 0.42, 2.27, g);
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.165), SM({ map: texPlate(0) })); pf.rotation.y = Math.PI; pf.position.set(0, 0.42, -2.375); g.add(pf);
  const pr = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.165), SM({ map: texPlate(1) })); pr.position.set(0, 0.58, 2.38); g.add(pr);
  // wheels: tyres, steel rims with hubcaps (they turn)
  Wd.wheels = []; const tyre = SM({ color: '#141414', roughness: 0.9 }), cap = SM({ map: txCanvas('hub', 64, 64, (x, w, h) => { x.fillStyle = '#7a7c74'; x.fillRect(0, 0, w, h); x.fillStyle = '#b9cbc6'; x.beginPath(); x.arc(32, 32, 28, 0, TAU); x.fill(); x.fillStyle = '#3f4542'; for (let k = 0; k < 8; k++) { x.save(); x.translate(32, 32); x.rotate(k / 8 * TAU); x.fillRect(-2, 8, 4, 16); x.restore(); } x.fillStyle = '#26304a'; x.beginPath(); x.arc(32, 32, 6, 0, TAU); x.fill(); }), metalness: 0.5, roughness: 0.4 });
  [[-0.74, -1.35], [0.74, -1.35], [-0.74, 1.35], [0.74, 1.35]].forEach(([x, z]) => { const w = new THREE.Group(); w.position.set(x, 0.3, z); g.add(w); const t = cyl(0.3, 0.3, 0.19, tyre, 18); t.rotation.z = Math.PI / 2; w.add(t);
    const c = new THREE.Mesh(new THREE.CircleGeometry(0.2, 18), cap); c.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2; c.position.x = x > 0 ? 0.097 : -0.097; w.add(c); Wd.wheels.push(w); });
  // interior: seats, dash, wheel on the right (RHD), the rear-view mirror with an omamori charm, rear shelf
  const seat = SM({ color: '#3a3a36', map: texCloth2() }), dash = SM({ color: '#1e1e1c', roughness: 0.7 });
  [-0.36, 0.36].forEach((x) => { bx(0.5, 0.14, 0.5, seat, x, 0.45, 0.25, g); const bk = bx(0.5, 0.62, 0.12, seat, x, 0.82, 0.55, g); bk.rotation.x = -0.18; bx(0.26, 0.18, 0.1, seat, x, 1.2, 0.62, g); });
  bx(1.36, 0.14, 0.5, seat, 0, 0.47, 1.15, g); const rb = bx(1.36, 0.4, 0.14, seat, 0, 0.66, 1.42, g); rb.rotation.x = -0.25; bx(1.3, 0.03, 0.4, dash, 0, 0.9, 1.6, g);
  bx(1.4, 0.24, 0.5, dash, 0, 0.84, -0.62, g); bx(1.34, 0.012, 1.15, SM({ color: '#3f4542', map: texCloth2() }), 0, 1.325, 0.42, g); bx(1.4, 0.06, 0.28, dash, 0, 0.98, -0.78, g);
  { const sw = shd(new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.022, 6, 20), dash)); sw.position.set(0.36, 0.98, -0.32); sw.rotation.x = 0.45; g.add(sw); Wd.steer = sw; const col = cyl(0.03, 0.04, 0.3, dash, 6); col.rotation.x = Math.PI / 2 - 0.45; col.position.set(0.36, 0.93, -0.45); g.add(col); }
  { const mg = new THREE.Group(); mg.position.set(0, 1.25, -0.1); g.add(mg); Wd.mirrorG = mg; const stem = cyl(0.008, 0.008, 0.06, trim, 5); stem.position.y = 0.04; mg.add(stem);
    bx(0.29, 0.1, 0.035, trim, 0, 0, -0.012, mg); Wd.mirrorRT = new THREE.WebGLRenderTarget(216, 68, { magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter });
    const mm = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.085), new THREE.MeshBasicMaterial({ map: Wd.mirrorRT.texture, toneMapped: false })); mm.material.color.setScalar(1.25); mm.position.z = 0.014; mg.add(mm); Wd.mirrorMesh = mm;
    mm.geometry.attributes.uv.array.forEach((v, i, a) => { if (i % 2 === 0) a[i] = 1 - v; }); mm.geometry.attributes.uv.needsUpdate = true;
    Wd.charm = new THREE.Group(); mg.add(Wd.charm); Wd.charm.position.set(0.03, -0.03, 0); const str = cyl(0.002, 0.002, 0.12, SM({ color: '#c8a050' }), 4); str.position.y = -0.06; Wd.charm.add(str);
    const om = bx(0.035, 0.05, 0.008, SM({ map: txCanvas('omamori', 32, 48, (x, w, h) => { x.fillStyle = '#9a1e12'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8a050'; x.font = "700 11px " + JPM; x.textAlign = 'center'; x.fillText('交通', w / 2, 20); x.fillText('安全', w / 2, 34); x.fillRect(0, 2, w, 2); }) }), 0, -0.145, 0, Wd.charm); void om; }
  // wipers
  Wd.wipers = [-0.4, 0.3].map((x) => { const w = new THREE.Group(); w.position.set(x, 0.87, -0.86); g.add(w); const a = bx(0.5, 0.012, 0.012, trim, 0.25, 0, 0, w); a.rotation.z = 0; return w; });
}
function texCloth2() { return txCanvas('seatcl', 64, 64, (x, w, h, R) => { x.fillStyle = '#3a3a36'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 4) { x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(i, 0, 1, h); } speckle(x, R, w, h, 300, ['rgba(255,255,255,0.06)']); }, [3, 3]); }
// car pose: position on the ground, heading (0 = facing −z), wheel turn; lights
function placeCar(Wd, x, z, heading, roll = 0) { const c = Wd.car; c.visible = true; c.position.set(x, 0, z); c.rotation.set(0, heading, roll); c.updateMatrixWorld(true); }

// ---------------------------------------------------------------------
//  people: one point rig. kinds: 'brother' (1.74 m), 'villager' (2.6–2.8 m, long arms, wrapped head, one eye)
// ---------------------------------------------------------------------
const PDS = {
  brother:  { torso: 0.5, shW: 0.2, hipW: 0.095, uArm: 0.3, fArm: 0.27, thigh: 0.45, shin: 0.44, headR: 0.105, hs: 1.0, fk: 1.0, ank: 0.085, gripR: 0.019 },
  villager: { torso: 0.8, shW: 0.18, hipW: 0.085, uArm: 0.54, fArm: 0.52, thigh: 0.74, shin: 0.72, headR: 0.13, hs: 1.35, fk: 1.25, ank: 0.07, gripR: 0.03 },
};
function mkHand(P, sd, mat, nailM) {
  const hg = new THREE.Group(), s = P.pd.hs, fk = P.pd.fk; P.g.add(hg);
  const palm = sph(1, mat, 0.04 * s, 0.016 * s, 0.05 * s); palm.position.z = 0.045 * s; hg.add(palm); hg.userData.f = [];
  const wr = sph(1, mat, 0.03 * s, 0.019 * s, 0.03 * s); hg.add(wr);
  for (let f = 0; f < 4; f++) { const kp = V3((f - 1.5) * 0.0175 * -sd * s, 0.003 * s, (0.088 - Math.abs(f - 1.3) * 0.005) * s), kn = sph(0.0095 * s, mat); kn.position.copy(kp); hg.add(kn);
    let par = new THREE.Group(); par.position.copy(kp); par.rotation.y = (f - 1.5) * 0.06 * -sd; hg.add(par); const segs = [], k = (1.18 - Math.abs(f - 1.2) * 0.1) * fk;
    [0.04, 0.028, 0.022].forEach((L0, j) => { const L = L0 * k * s, sg = new THREE.Group(); sg.position.z = j ? segs[j - 1].userData.L : 0; par.add(sg); const r = (0.0078 - j * 0.0012) * s, c = capsule(r, L, mat, 6); c.rotation.x = Math.PI / 2; c.position.z = L / 2; sg.add(c); sg.add(sph(r * 1.05, mat)); sg.userData.L = L; sg.userData.r = r; segs.push(sg); par = sg; });
    const nl = sph(1, nailM, 0.0055 * s, 0.002 * s, 0.008 * s); nl.position.set(0, 0.0055 * s, segs[2].userData.L - 0.004 * s); segs[2].add(nl); hg.userData.f.push(segs); }
  const th = new THREE.Group(); th.position.set(sd * 0.03 * s, -0.008 * s, 0.025 * s); hg.add(th); hg.userData.th = th; hg.userData.ts = []; let par = th;
  [0.034, 0.026].forEach((L0, j) => { const L = L0 * s * (fk > 1 ? 1.1 : 1), sg = new THREE.Group(); sg.position.z = j ? hg.userData.ts[0].userData.L : 0; par.add(sg); const c = capsule((0.009 - j * 0.001) * s, L, mat, 6); c.rotation.x = Math.PI / 2; c.position.z = L / 2; sg.add(c); sg.add(sph(0.0095 * s, mat)); sg.userData.L = L; hg.userData.ts.push(sg); par = sg; });
  hg.userData.sd = sd; return hg;
}
// finger forward kinematics in hand-local space (mirrors mkHand)
function fingerJointsL(P, f, A, sd) { const s = P.pd.hs, k = (1.18 - Math.abs(f - 1.2) * 0.1) * P.pd.fk, L = [0.04, 0.028, 0.022].map((v) => v * k * s), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (f - 1.5) * 0.06 * -sd, 0));
  const p = V3((f - 1.5) * 0.0175 * -sd * s, 0.003 * s, (0.088 - Math.abs(f - 1.3) * 0.005) * s), out = [p.clone()]; for (let j = 0; j < 3; j++) { q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(A[j], 0, 0))); p.add(V3(0, 0, L[j]).applyQuaternion(q)); out.push(p.clone()); } return out; }
// the power grip: fingers curled round a bar that runs along the hand's X axis; the bar centre and radius are fitted
// to the curled fingers (circle through palm surface, knuckle, finger joints in the hand's y-z plane)
const GRIP = { f: [[1.25, 1.55, 1.05], [1.3, 1.55, 1.05], [1.35, 1.5, 1.0], [1.4, 1.45, 0.95]], t: [0.9, -0.55, 0.55, 0.45] };
function gripFit(P) {
  if (P.grip) return P.grip; let fit = null; for (let m = 1.0; m <= 1.5; m += 0.02) { const A = GRIP.f.map((a) => a.map((v, j) => v * (j === 0 ? m : 1 + (m - 1) * 0.4))); fit = gripFit0(P, A); fit.A = A; if (fit.r <= P.pd.gripR) break; }
  return (P.grip = fit);
}
function gripFit0(P, A) {   // least-squares circle (Kasa) through the curled finger joints and the palm surface, in the hand's y-z plane
  const s = P.pd.hs, pts = [[-0.016 * s, 0.055 * s], [-0.016 * s, 0.075 * s]];
  [0, 1, 2].forEach((f) => fingerJointsL(P, f, A[f], 1).forEach((p) => pts.push([p.y, p.z])));
  let a = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], b = [0, 0, 0];
  pts.forEach(([y, z]) => { const r = [y, z, 1], q = -(y * y + z * z); for (let i = 0; i < 3; i++) { b[i] += r[i] * q; for (let j = 0; j < 3; j++) a[i][j] += r[i] * r[j]; } });
  const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D0 = det(a), sol = [0, 1, 2].map((k) => det(a.map((row, i) => row.map((v, j) => (j === k ? b[i] : v)))) / D0);
  const cy = -sol[0] / 2, cz = -sol[1] / 2, R0 = Math.sqrt(cy * cy + cz * cz - sol[2]);
  return { c: V3(0, cy, cz), r: R0 - 0.0075 * s };
}
function lumpy(geo, seed, eye) {   // an uneven skull: lumps under the wrappings, a flattened side, a sunken cheek, a deep socket at the eye
  const p = geo.attributes.position, R = RNG('lump', seed); const bumps = [0, 1, 2, 3, 4, 5, 6].map(() => [V3(R.n(1), R.n(1), R.n(1)).normalize(), R.r(0.05, 0.13)]), flat = V3(R.n(1), 0.2, -0.5).normalize();
  for (let i = 0; i < p.count; i++) { const v = V3(p.getX(i), p.getY(i), p.getZ(i)); let k = 1; bumps.forEach(([d, a]) => { k += a * Math.exp(-(1 - v.dot(d)) * 7); });
    k -= 0.1 * Math.max(0, v.dot(flat) - 0.6) * 2.5; if (v.z > 0.4 && v.y < 0) k -= 0.1 * v.z * -v.y;
    if (eye) { const c = v.dot(eye); k -= 0.24 * Math.exp(-(1 - c) * 26) + 0.07 * Math.exp(-(1 - c) * 8); }
    p.setXYZ(i, v.x * k, v.y * k, v.z * k); }
  geo.computeVertexNormals(); return geo;
}
// a bandage strip round the head: a raised band (lathe ring with thickness and rounded edges) whose outer radius wobbles in folds
function bandRing(r, w, seed) {
  const R = RNG('ring', seed), prof = [[r - 0.03, -w / 2], [r + 0.012, -w / 2 + 0.012], [r + 0.03, -w * 0.15], [r + 0.03, w * 0.15], [r + 0.012, w / 2 - 0.012], [r - 0.03, w / 2]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(prof, 30), p = g.attributes.position, ph = R.r(0, 6), ph2 = R.r(0, 6);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + 0.025 * Math.sin(a * 5 + ph) + 0.018 * Math.sin(a * 11 + ph2); p.setXYZ(i, x * k, y + 0.012 * Math.sin(a * 3 + ph2), z * k); }
  g.computeVertexNormals(); return g;
}
function mkPerson(kind, o = {}) {
  const h0 = o.hgt ?? 1, pd = Object.assign({}, PDS[kind], h0 === 1 ? {} : { torso: PDS[kind].torso * h0, uArm: PDS[kind].uArm * h0, fArm: PDS[kind].fArm * h0, thigh: PDS[kind].thigh * h0, shin: PDS[kind].shin * h0, shW: PDS[kind].shW * (0.92 + 0.08 * h0), headR: PDS[kind].headR * (0.95 + 0.05 * h0) }), R = RNG('person', o.seed ?? 0), g = new THREE.Group(), P = { kind, pd, g, o, s: 1 };
  const vill = kind === 'villager';
  const skin = SM({ color: vill ? '#7a7a6c' : '#a87a56', roughness: 0.75 }), band = SM({ map: texBandage('h' + (o.seed ?? 0), [1, 1]), color: kind === 'villager' ? '#8a8478' : '#a8a296', roughness: 0.9 }), nail = SM({ color: vill ? '#2a221a' : '#c09a80' });
  let top, legs, low;
  if (vill) { const kc = o.cloth || ['#26304a', ['#3c2c1e', '#5a2418', '#1f3c44']]; top = SM({ map: texKimono(o.seed + 'a', kc[0], kc[1]) }); low = SM({ map: texKimono(o.seed + 'b', kc[0], kc[1]), alphaMap: texRag(o.seed), alphaTest: 0.5, side: THREE.DoubleSide }); legs = SM({ map: texKimono(o.seed + 'k', '#2b2d29', ['#3c2c1e', '#191b18']), color: '#a09a90' }); }
  else { top = SM({ map: texSukajan(), roughness: 0.45 }); legs = SM({ map: texDenim() }); }
  P.mat = { skin, top, legs, band };
  const T = new THREE.Group(); g.add(T); P.T = T;
  { const pel = sph(vill ? 0.13 : 0.15, vill ? top : legs, 1.15, 0.72, 0.85); pel.position.y = 0.03; T.add(pel);
    const ch = capsule(vill ? 0.115 : 0.155, pd.torso - (vill ? 0.3 : 0.23), top, 12); ch.scale.set(vill ? 1.12 : 1.22, 1, vill ? 0.66 : 0.78); ch.position.y = pd.torso * (vill ? 0.5 : 0.56); T.add(ch); P.chest = ch;
    if (vill) { const dk = SM({ color: '#b0aaa0', map: texKimono(o.seed + 'e', '#3c2c1e', ['#5a4430']) }); [-1, 1].forEach((sd) => { const a = V3(sd * 0.095, pd.torso - 0.03, 0.055), b = V3(-sd * 0.008, 0.2, 0.082), L = a.distanceTo(b), l = bx(0.045, L, 0.014, dk, (a.x + b.x) / 2, (a.y + b.y) / 2, sd > 0 ? 0.083 : 0.079, T); l.rotation.z = Math.atan2(b.x - a.x, a.y - b.y) * -1; l.rotation.x = -0.06; });   // the collar (eri): a V, left over right
      const obi = shd(new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.022, 5, 18), SM({ map: texStraw(), color: '#a08a60' }))); obi.rotation.x = Math.PI / 2; obi.scale.set(1.12, 0.78, 1); obi.position.y = 0.11; T.add(obi);
      const kn = sph(0.035, SM({ map: texStraw() }), 1.4, 0.8, 0.8); kn.position.set(0.06, 0.1, 0.12); T.add(kn); const tl = bx(0.025, 0.14, 0.01, SM({ map: texStraw() }), 0.07, 0.03, 0.125, T); tl.rotation.z = 0.2; }
    else { const rib = SM({ map: texRib() }); const hem = cyl(0.17, 0.17, 0.06, rib, 14); hem.scale.set(1.15, 1, 0.82); hem.position.y = 0.09; T.add(hem);
      const col = cyl(0.075, 0.085, 0.05, rib, 12); col.position.y = pd.torso + 0.0; T.add(col); const tee = bx(0.07, 0.04, 0.01, SM({ color: '#d3d6cc' }), 0, pd.torso - 0.05, 0.11, T); void tee;
      const belt = cyl(0.152, 0.152, 0.03, SM({ color: '#2b2219' }), 14); belt.scale.set(1.15, 1, 0.84); belt.position.y = 0.0; T.add(belt); }
  }
  // head (+y crown, +z face, +x the person's left)
  const Hd = new THREE.Group(); g.add(Hd); P.H = Hd;
  if (vill) { P.eyeSide = o.eyeSide ?? (R.f() < 0.5 ? -1 : 1); const sk = new THREE.Group(), sc = [0.82, 1.32, 0.95].map((v) => v * pd.headR); sk.scale.set(...sc); Hd.add(sk); P.skullG = sk; P.skullS = sc;
    const e = V3(P.eyeSide * 0.31, 0.19, 0.93).normalize(), BR = RNG('bands', o.seed ?? 0); let nb = 0;
    sk.add(shd(new THREE.Mesh(lumpy(new THREE.SphereGeometry(1, 36, 26), o.seed ?? 0, e), SM({ map: texHead(o.seed ?? 0, P.eyeSide), color: '#8e897e', roughness: 0.9 }))));
    const bandM = [0, 1, 2].map((k) => SM({ map: texBandage('bb' + k + (o.seed ?? 0), [3, 0.35]), color: ['#8e887c', '#77715f', '#857c6a'][k], side: THREE.DoubleSide }));
    for (let i = 0; i < 90 && nb < 11; i++) { const ax = V3(BR.n(0.6), 1, BR.n(1.0)).normalize(); if (Math.abs(ax.dot(e)) < 0.26) continue; const t = shd(new THREE.Mesh(bandRing(1.04 + nb * 0.012 + BR.r(0, 0.02), BR.r(0.16, 0.26), i + 31 * (o.seed ?? 0)), bandM[nb % 3])); t.quaternion.setFromUnitVectors(V3(0, 1, 0), ax); sk.add(t); nb++; }
    const ey = V3(P.eyeSide * 0.31 * sc[0], 0.19 * sc[1], 0.93 * sc[2]).normalize().multiplyScalar(V3(P.eyeSide * 0.31 * sc[0], 0.19 * sc[1], 0.93 * sc[2]).length() * 0.8); const eye = shd(new THREE.Mesh(new THREE.SphereGeometry(0.0118, 14, 10), SM({ map: texEye(), roughness: 0.25 }))); eye.position.copy(ey); Hd.add(eye); P.eye = eye; P.eye0 = ey;
    // a few stiff black hairs escaping above the wrappings
    const hm = SM({ color: '#0b0d10' }); for (let k = 0; k < 7; k++) { const h = cyl(0.002, 0.003, 0.09, hm, 3), a = BR.r(-1, 1); h.position.set(Math.sin(a) * 0.05, 0.15 + 0.02, Math.cos(a) * 0.04 - 0.02); h.rotation.set(BR.n(0.6), 0, BR.n(0.6)); Hd.add(h); }
  } else { const sk = shd(new THREE.Mesh(new THREE.SphereGeometry(pd.headR, 28, 20), SM({ map: texFace(0), roughness: 0.7 }))); sk.scale.set(0.9, 1.06, 0.98); Hd.add(sk); P.skull = sk;
    [-1, 1].forEach((sd) => { const e = sph(0.022, skin, 0.5, 1, 0.8); e.position.set(sd * 0.093, 0, -0.005); Hd.add(e); });
    const hair = SM({ color: '#0b0d10', roughness: 0.55 }), cap = sph(0.112, hair, 0.95, 0.8, 0.95); cap.position.set(0, 0.052, -0.03); Hd.add(cap);
    [-1, 1].forEach((sd) => { const c = sph(0.06, hair, 0.75, 1.0, 0.5); c.position.set(sd * 0.05, 0.06, 0.07); c.rotation.z = sd * 0.5; Hd.add(c); const sb = sph(0.04, hair, 0.5, 1.3, 1.0); sb.position.set(sd * 0.093, 0.02, 0.0); Hd.add(sb); });
    const nape = sph(0.08, hair, 1.1, 0.9, 0.8); nape.position.set(0, -0.03, -0.06); Hd.add(nape); }
  // neck, arms, legs
  P.neck = { c: shd(new THREE.Mesh(UCYL1, vill ? band : skin)) }; g.add(P.neck.c);
  P.arm = [1, -1].map((sd) => ({ sd, up: shd(new THREE.Mesh(UCYL, top)), fo: shd(new THREE.Mesh(UCYL, vill ? band : top)), sj: sph(1, top), ej: sph(1, vill ? band : top), hand: mkHand(P, sd === 1 ? -1 : 1, vill ? band : skin, nail) }));
  P.arm.forEach((a) => [a.up, a.fo, a.sj, a.ej].forEach((m) => g.add(m)));
  if (vill) { const sg = new THREE.CylinderGeometry(1, 1.5, 1, 12, 1, true); P.arm.forEach((a) => { a.sleeve = shd(new THREE.Mesh(sg, SM({ map: texKimono(o.seed + 's', (o.cloth || ['#26304a'])[0], (o.cloth || [0, ['#3c2c1e']])[1]), alphaMap: texRag(o.seed + 's'), alphaTest: 0.5, side: THREE.DoubleSide }))); g.add(a.sleeve); }); }
  else { const rib = SM({ map: texRib() }); P.arm.forEach((a) => { a.cuff = cyl(1, 1, 1, rib, 10); g.add(a.cuff); }); }
  const mkFoot = () => { const fg = new THREE.Group(); g.add(fg);
    if (vill) { const sole = bx(0.1, 0.018, 0.27, SM({ map: texStraw() }), 0, -0.062, 0.05, fg); void sole; const ft = capsule(0.032, 0.17, skin, 6); ft.rotation.x = Math.PI / 2; ft.scale.set(1.1, 1, 0.65); ft.position.set(0, -0.038, 0.05); fg.add(ft);
      for (let k = 0; k < 4; k++) { const t = sph(0.011, skin, 1, 0.8, 1.3); t.position.set(-0.03 + k * 0.02, -0.042, 0.17 - Math.abs(k - 1.5) * 0.01); fg.add(t); }
      [-1, 1].forEach((sd) => { const s = bx(0.012, 0.012, 0.11, SM({ map: texStraw() }), sd * 0.04, -0.03, 0.08, fg); s.rotation.y = sd * 0.5; }); const wrap = cyl(0.045, 0.04, 0.09, SM({ map: texBandage('wr' + o.seed) }), 8); wrap.position.y = 0.0; fg.add(wrap); }
    else { const w = SM({ color: '#d8d6cc', roughness: 0.6 }), sole = SM({ color: '#e8e6da' }); bx(0.105, 0.03, 0.28, sole, 0, -0.07, 0.055, fg); const up = bx(0.1, 0.08, 0.25, w, 0, -0.03, 0.05, fg); void up; const toe = sph(0.05, w, 1, 0.65, 1.1); toe.position.set(0, -0.045, 0.15); fg.add(toe);
      const hi = cyl(0.055, 0.058, 0.1, w, 10); hi.position.set(0, 0.02, 0.0); fg.add(hi); bx(0.03, 0.006, 0.12, SM({ color: '#26304a' }), 0, 0.012, 0.08, fg).rotation.x = -0.4; bx(0.106, 0.012, 0.1, SM({ color: '#b3271c' }), 0, -0.05, -0.04, fg); }
    return fg; };
  P.leg = [1, -1].map((sd) => ({ sd, th: shd(new THREE.Mesh(UCYL, vill ? legs : legs)), sh: shd(new THREE.Mesh(UCYL, legs)), kj: sph(1, legs), foot: mkFoot() }));
  P.leg.forEach((l) => [l.th, l.sh, l.kj].forEach((m) => g.add(m)));
  if (vill) { const L = [[0.15, 0], [0.17, -0.12], [0.2, -0.5], [0.23, -1]]; P.skirt = shd(new THREE.Mesh(new THREE.LatheGeometry(L.map(([r, y]) => new THREE.Vector2(r, y)).reverse(), 20), low)); g.add(P.skirt);
    // loose bandage ends: one from the back of the head, one from a wrist (simulated ribbons)
    P.tails = [{ on: 'head', at: V3(-0.04 * P.eyeSide, -0.05, -0.1), L: 0.55 + R.f() * 0.25, w: 0.032, n: 9 }, { on: 'hand', i: R.f() < 0.5 ? 0 : 1, at: V3(0, 0.02, -0.01), L: 0.32, w: 0.026, n: 6 }];
    const nv = P.tails.reduce((a, t) => a + (t.n - 1) * 6, 0), tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nv * 3), 3)); tg.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nv * 3), 3)); tg.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(nv * 2), 2));
    P.tailM = new THREE.Mesh(tg, SM({ map: texBandage('tail' + o.seed), side: THREE.DoubleSide })); P.tailM.frustumCulled = false; P.tailM.castShadow = true; g.add(P.tailM); }
  return P;
}
// place a person. st: { pos (pelvis), U, F, head: { Y, Z } | { pitch, yaw, roll }, hands: [wristL, wristR], hdir: [{ Z, Y }], epole, feet: [ankleL, ankleR], fdir, kpole,
//   curl: [l, r], grip: [bool, bool], breath, eye (world point it looks at), laugh }
function poseP(P, st) {
  const pd = P.pd, B = frameOf(st.U, st.F), q = qBasis(B.X, B.Y, B.Z), vill = P.kind === 'villager';
  P.g.visible = true; P.T.position.copy(st.pos); P.T.quaternion.copy(q);
  if (P.chest) P.chest.scale.set((vill ? 1.12 : 1.22) * (1 + 0.02 * (st.breath ?? 0)), 1, (vill ? 0.66 : 0.78) * (1 + 0.05 * (st.breath ?? 0)));
  const top = st.pos.clone().addScaledVector(B.Y, pd.torso);
  let HY, HZ; if (st.head && st.head.Y) { const f = frameOf(st.head.Y, st.head.Z); HY = f.Y; HZ = f.Z; }
  else { const h = st.head || {}, e = new THREE.Euler(h.pitch ?? 0, h.yaw ?? 0, h.roll ?? 0, 'YXZ'), hq = q.clone().multiply(new THREE.Quaternion().setFromEuler(e)); HY = V3(0, 1, 0).applyQuaternion(hq); HZ = V3(0, 0, 1).applyQuaternion(hq); }
  const HF = frameOf(HY, HZ); P.H.quaternion.copy(qBasis(HF.X, HF.Y, HF.Z));
  const nb = top.clone().addScaledVector(B.Y, -0.01).addScaledVector(B.Z, vill ? 0.02 : 0), nl = vill ? 0.17 : 0.07, hh = vill ? pd.headR * 1.32 : pd.headR * 0.95;
  const Hc = nb.clone().addScaledVector(B.Y, nl * 0.5).addScaledVector(HF.Y, nl * 0.5 + hh * 0.82).addScaledVector(HF.Z, vill ? 0.0 : 0.0); P.H.position.copy(Hc);
  const hb = Hc.clone().addScaledVector(HF.Y, -hh * 0.62).addScaledVector(HF.Z, -0.02); between(P.neck.c, nb, hb, vill ? 0.042 : 0.045); P.neckTop = hb;
  P.arm.forEach((a, i) => {
    const S = top.clone().addScaledVector(B.X, a.sd * pd.shW).addScaledVector(B.Y, -0.035), Wt = st.hands[i];
    const pole = (st.epole && st.epole[i]) || B.X.clone().multiplyScalar(a.sd * 0.4).addScaledVector(B.Z, -1).addScaledVector(B.Y, -0.3);
    const { E, W } = twoBone(S, Wt, pd.uArm, pd.fArm, pole); a.S = S; a.E = E; a.W = W;
    between(a.up, S, E, vill ? 0.04 : 0.058); between(a.fo, E, W, vill ? 0.03 : 0.047); a.sj.position.copy(S); a.sj.scale.setScalar(vill ? 0.05 : 0.062); a.ej.position.copy(E); a.ej.scale.setScalar(vill ? 0.034 : 0.05);
    if (a.sleeve) { const e2 = S.clone().lerp(E, 1.32); between(a.sleeve, e2, S.clone().addScaledVector(B.Y, 0.02), 0.075); }
    const hd = (st.hdir && st.hdir[i]) || { Z: W.clone().sub(E).normalize(), Y: B.X.clone().multiplyScalar(a.sd) };
    const f = frameOf(hd.Y, hd.Z); a.hand.position.copy(W); a.hand.quaternion.copy(qBasis(f.Y.clone().cross(f.Z), f.Y, f.Z)); a.hand.updateMatrixWorld(true);
    if (a.cuff) { const d = W.clone().sub(E).normalize(); between(a.cuff, W.clone().addScaledVector(d, -0.05), W.clone().addScaledVector(d, -0.005), 0.05); }
    const U = a.hand.userData, c = st.curl ? st.curl[i] : 0.3, G = st.grip && st.grip[i] ? GRIP : null, tw = st.twitch ?? 0, gk = st.gripK ? st.gripK[i] : 1;
    U.f.forEach((segs, k) => segs.forEach((sg, j) => (sg.rotation.x = lerp(c * [0.55, 0.8, 0.6][j] * (1 + 0.12 * k) + (0.05 + tw * 0.25 * (j ? 1 : 0.4)) * Math.sin(TT * (1.7 + tw * 3) + k * 1.3 + i), G ? gripFit(P).A[k][j] : 0, G ? gk : 0))));
    const tp0 = [0.35 + 0.3 * c, -0.25, 0.25 * c, 0.3 * c], tp = G ? tp0.map((v, q) => lerp(v, G.t[q], gk)) : tp0; U.th.rotation.set(tp[0], U.sd * tp[1], 0); U.ts[0].rotation.x = tp[2]; U.ts[1].rotation.x = tp[3];
  });
  P.leg.forEach((l, i) => {
    const Hj = st.pos.clone().addScaledVector(B.X, l.sd * pd.hipW).addScaledVector(B.Y, -0.03), A = st.feet[i];
    const { E: K, W: Aw } = twoBone(Hj, A, pd.thigh, pd.shin, st.kpole || B.Z.clone().addScaledVector(B.Y, 0.2));
    l.H = Hj; l.K = K; l.A = Aw;
    between(l.th, Hj, K, vill ? 0.045 : 0.075); between(l.sh, K, Aw, vill ? 0.034 : 0.058); l.kj.position.copy(K); l.kj.scale.setScalar(vill ? 0.038 : 0.06);
    const fd = (st.fdir && st.fdir[i]) || { Z: V3(B.Z.x, 0, B.Z.z).normalize(), Y: V3(0, 1, 0) }, f = frameOf(fd.Y, fd.Z);
    l.foot.position.copy(Aw); l.foot.quaternion.copy(qBasis(f.Y.clone().cross(f.Z), f.Y, f.Z));
  });
  if (P.skirt) { const w0 = st.pos.clone().addScaledVector(B.Y, 0.08), kn = P.leg[0].K.clone().add(P.leg[1].K).multiplyScalar(0.5), an = P.leg[0].A.clone().add(P.leg[1].A).multiplyScalar(0.5), to = w0.clone().lerp(kn.clone().lerp(an, st.skirtLen ?? 0.45), 1.0);
    const A = to.clone().sub(w0), L = A.length(); A.normalize(); const X = B.X.clone().addScaledVector(A, -B.X.dot(A)).normalize(), Y = A.clone().negate(), Z = X.clone().cross(Y);
    P.skirt.position.copy(w0); P.skirt.quaternion.copy(qBasis(X, Y, Z)); P.skirt.scale.set(1.0, L, 0.8); }
  if (P.eye && st.eye) { P.H.updateMatrixWorld(true); const l = P.H.worldToLocal(st.eye.clone()).sub(P.eye0).normalize(); const lim = V3(clamp(l.x, -0.35, 0.35), clamp(l.y, -0.3, 0.3), 1).normalize(); P.eye.quaternion.setFromUnitVectors(V3(0, 0, 1), lim); }
  if (P.skull) P.skull.material.map = texFace(st.laugh ? 1 : 0);
  P.st = st; P.top = top; P.B = B;
}
// the loose bandage ribbons hang under gravity from their roots, sway, and are pushed out of the head and body
function updateTails(P, cam) {
  if (!P.tails || !P.g.visible) return; const pos = P.tailM.geometry.attributes.position.array, nor = P.tailM.geometry.attributes.normal.array, uv = P.tailM.geometry.attributes.uv.array; let o = 0, ou = 0;
  const cols = [[P.H.position, P.pd.headR * 1.25], [P.T.position.clone().addScaledVector(P.B.Y, P.pd.torso * 0.6), 0.17], [P.T.position.clone().addScaledVector(P.B.Y, P.pd.torso * 0.25), 0.17]];
  P.tails.forEach((t, ti) => { const par = t.on === 'head' ? P.H : P.arm[t.i].hand; par.updateMatrixWorld(true); let p = par.localToWorld(t.at.clone()); const pts = [p], seg = t.L / (t.n - 1);
    for (let k = 1; k < t.n; k++) { const sw = V3(0.25 * Math.sin(TT * 1.6 + ti * 2 + k * 0.5), 0, 0.25 * Math.cos(TT * 1.2 + ti + k * 0.4)).multiplyScalar(k / t.n), d = V3(0, -1, 0).add(sw).normalize(); let qn = p.clone().addScaledVector(d, seg);
      for (const [c, r] of cols) { const v = qn.clone().sub(c); if (v.length() < r) qn = c.clone().addScaledVector(v.normalize(), r); } qn = p.clone().addScaledVector(qn.sub(p).normalize(), seg); pts.push(qn); p = qn; }
    for (let k = 0; k < t.n - 1; k++) { const a = pts[k], b = pts[k + 1], v = cam.position.clone().sub(a).normalize(), side = b.clone().sub(a).cross(v).normalize(), w = t.w * (1 - 0.3 * k / t.n) * 0.5;
      const Q = [a.clone().addScaledVector(side, -w), a.clone().addScaledVector(side, w), b.clone().addScaledVector(side, w), a.clone().addScaledVector(side, -w), b.clone().addScaledVector(side, w), b.clone().addScaledVector(side, -w)], U2 = [[0, k / t.n], [1, k / t.n], [1, (k + 1) / t.n], [0, k / t.n], [1, (k + 1) / t.n], [0, (k + 1) / t.n]];
      Q.forEach((pp, j) => { pos[o] = pp.x; pos[o + 1] = pp.y; pos[o + 2] = pp.z; nor[o] = v.x; nor[o + 1] = v.y; nor[o + 2] = v.z; o += 3; uv[ou++] = U2[j][0]; uv[ou++] = U2[j][1] * 2; }); } });
  ['position', 'normal', 'uv'].forEach((k) => (P.tailM.geometry.attributes[k].needsUpdate = true)); P.tailM.geometry.computeBoundingSphere();
}
// held props: the flashlight (barrel along local X, lens at +X) and the sickle (handle along X, blade at the +X end)
function mkFlashlight(Wd, kind) {
  const g = new THREE.Group(); Wd.scene.add(g); const old = kind === 'old', neu = kind === 'new';
  const body = SM({ color: neu ? '#d8b040' : old ? '#5a3c26' : '#9a1e12', roughness: neu ? 0.4 : 0.55, metalness: neu ? 0.5 : 0.1 }), metal = SM({ color: '#848a8b', metalness: 0.6, roughness: 0.35 }), r = kind === 'brother' ? Wd.flashR : 0.016;
  const h = cyl(r, r, 0.17, body, 12); h.rotation.z = Math.PI / 2; h.position.x = 0.0; g.add(h);
  for (let k = 0; k < 4; k++) { const ring = cyl(r * 1.06, r * 1.06, 0.006, SM({ color: '#16110c' }), 12); ring.rotation.z = Math.PI / 2; ring.position.x = -0.06 + k * 0.03; g.add(ring); }
  const cap = cyl(r * 1.02, r * 1.1, 0.025, body, 12); cap.rotation.z = Math.PI / 2; cap.position.x = -0.097; g.add(cap);
  const head = cyl(neu ? r * 1.4 : r * 1.9, r * 1.05, 0.07, body, 14); head.rotation.z = Math.PI / 2; head.position.x = 0.12; g.add(head);
  const bez = shd(new THREE.Mesh(new THREE.TorusGeometry(neu ? r * 1.4 : r * 1.9, 0.004, 4, 16), metal)); bez.rotation.y = Math.PI / 2; bez.position.x = 0.155; g.add(bez);
  const lensM = BM(old ? '#2b2d29' : '#fff4d8'), lens = new THREE.Mesh(new THREE.CircleGeometry(neu ? r * 1.35 : r * 1.85, 16), lensM); lens.rotation.y = Math.PI / 2; lens.position.x = 0.1555; g.add(lens);
  const sw = bx(0.03, 0.008, 0.012, SM({ color: '#16110c' }), 0.05, r + 0.002, 0, g); void sw;
  g.userData = { lensM, lens, tip: V3(0.16, 0, 0) }; g.traverse((m) => { if (m.isMesh) m.castShadow = true; }); return g;
}
function mkLanternStick(Wd, P) {
  const g = new THREE.Group(); Wd.scene.add(g); const r = gripFit(P).r * 0.98, wood = SM({ map: texBark(), color: '#a08060' });
  const st = cyl(r, r * 0.7, 0.62, wood, 7); st.rotation.z = Math.PI / 2; st.position.x = -0.24; g.add(st);
  const body = new THREE.Group(); Wd.scene.add(body); const lm = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), SM({ map: texLantern(), emissive: '#a0602a', emissiveIntensity: 1.0 })); lm.scale.set(0.12, 0.17, 0.12); body.add(lm);
  [-0.165, 0.165].forEach((y) => { const c = cyl(0.075, 0.075, 0.03, SM({ color: '#16110c' }), 10); c.position.y = y; body.add(c); });
  const cord = shd(new THREE.Mesh(UCYL1, SM({ color: '#16110c' }))); Wd.scene.add(cord);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,214,150,1)'], [0.3, 'rgba(240,160,80,0.45)'], [1, 'rgba(200,100,40,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); glow.scale.setScalar(0.9); Wd.scene.add(glow);
  return { g, body, cord, glow, tip: V3(-0.54, 0, 0) };
}
function mkSickle(Wd, P) {
  const g = new THREE.Group(), gs = new THREE.Group(); Wd.scene.add(g); g.add(gs); gs.scale.setScalar(1.25); const r = gripFit(P).r * 0.98 / 1.25, wood = SM({ map: texBark(), color: '#a08060' }), steel = SM({ map: texMetal('blade', '#5e615a'), metalness: 0.5, roughness: 0.45 });
  const h = cyl(r, r * 1.12, 0.42, wood, 8); h.rotation.z = Math.PI / 2; h.position.x = 0.03; gs.add(h);
  const fer = cyl(r * 1.2, r * 1.2, 0.03, steel, 8); fer.rotation.z = Math.PI / 2; fer.position.x = 0.235; gs.add(fer);
  // the blade: a flat crescent leaving the ferrule at a right angle, curving back toward the handle (edge on the inside)
  const k = 0.95, s = new THREE.Shape(); s.moveTo(0, 0.014 * k); s.quadraticCurveTo(0.15 * k, 0.024 * k, 0.24 * k, -0.1 * k); s.quadraticCurveTo(0.258 * k, -0.155 * k, 0.215 * k, -0.215 * k); s.quadraticCurveTo(0.2 * k, -0.12 * k, 0.12 * k, -0.052 * k); s.quadraticCurveTo(0.06 * k, -0.024 * k, 0, -0.014 * k); s.lineTo(0, 0.014 * k);
  const pale = SM({ map: texMetal('bladeP', '#b4bab2'), color: '#e0e4dc', metalness: 0.25, roughness: 0.3 });
  const bl = shd(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.006, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelSegments: 1, curveSegments: 12 }), pale)); bl.position.set(0.245, 0, -0.003); bl.quaternion.copy(qBasis(V3(0, 0, 1), V3(1, 0, 0), V3(0, 1, 0))); gs.add(bl);
  // the honed inner edge catches the light (a bright rim), the back of the blade is a darker spine
  const edge = new THREE.QuadraticBezierCurve3(V3(0.215 * k, -0.215 * k, 0.003), V3(0.2 * k, -0.12 * k, 0.003), V3(0.12 * k, -0.052 * k, 0.003)), e2 = new THREE.QuadraticBezierCurve3(V3(0.12 * k, -0.052 * k, 0.003), V3(0.06 * k, -0.024 * k, 0.003), V3(0.01, -0.014 * k, 0.003));
  [edge, e2].forEach((c) => bl.add(new THREE.Mesh(new THREE.TubeGeometry(c, 12, 0.0032, 4), BM('#f4f8f2'))));
  bl.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(V3(0, 0.014 * k, 0.003), V3(0.15 * k, 0.024 * k, 0.003), V3(0.24 * k, -0.1 * k, 0.003)), 12, 0.003, 4), SM({ color: '#3f4542' })));
  return g;
}
// put a held prop in the fist: its local X along the hand's X, its grip point at the fitted bar centre
function holdProp(P, i, prop, off = 0) { const h = P.arm[i].hand, G = gripFit(P); h.updateMatrixWorld(true); prop.visible = true; prop.position.copy(h.localToWorld(G.c.clone().add(V3(off, 0, 0)))); prop.quaternion.copy(h.getWorldQuaternion(new THREE.Quaternion())); prop.updateMatrixWorld(true); }

// ---------------------------------------------------------------------
//  the village beyond the far end: flooded fields, a raised lane, thatched houses with lit shoji, lanterns, dogs
// ---------------------------------------------------------------------
const LANTS = [];
function mkVillage(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); Wd.village = g; const R = RNG('village');
  const water = new THREE.Mesh(new THREE.PlaneGeometry(80, 90), SM({ color: '#1f3c44', roughness: 0.08, metalness: 0.7 })); water.rotation.x = -Math.PI / 2; water.position.set(0, -0.12, -127); water.receiveShadow = true; g.add(water);
  const wall = SM({ map: texPlank() }), plaster = SM({ color: '#8a8e84', map: texLining() }), thatch = SM({ map: texThatch() }), shoji = BM('#7a5a30');
  Wd.shojiM = shoji;
  [[-6.5, -93, 0.3], [7, -98, -0.2], [-8, -108, 0.15], [8.5, -116, -0.35], [-6, -124, 0.1], [7.5, -132, 0.25], [-9, -140, -0.1], [3, -150, 0.05]].forEach(([x, z, ry], i) => {
    const hg = new THREE.Group(); hg.position.set(x, -0.2, z); hg.rotation.y = ry + (x > 0 ? -Math.PI / 2 : Math.PI / 2); g.add(hg); const w = R.r(5, 7), d = R.r(4, 5);
    bx(w, 2.0, d, i % 2 ? wall : plaster, 0, 1.0, 0, hg); bx(w + 0.3, 0.3, d + 0.3, SM({ color: '#3f4542' }), 0, 0.15, 0, hg);
    for (let k = 0; k < 4; k++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.4), shoji); p.position.set(-w / 2 + 0.8 + k * 0.95, 1.0, d / 2 + 0.01); hg.add(p); }
    const roof = shd(new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4, 1).rotateY(Math.PI / 4), thatch)); roof.scale.set((w + 1.6) * 0.72, 3.2, (d + 1.6) * 0.72); roof.position.y = 2.0 + 1.6; hg.add(roof);
    bx(w * 0.5, 0.3, 0.4, SM({ color: '#2b2219' }), 0, 4.9, 0, hg);
    const stain = bx(w + 0.02, 0.5, d + 0.02, SM({ color: '#1f3c44', transparent: true, opacity: 0.35 }), 0, 0.45, 0, hg); stain.castShadow = false; });
  // lanterns: on poles along the lane and strung between them
  const lt = SM({ map: texLantern(), emissive: '#a0602a', emissiveIntensity: 0.9 }), cap = SM({ color: '#16110c' });
  for (let k = 0; k < 9; k++) { const z = -86 - k * 7.5, sdx = k % 2 ? 1 : -1, x = sdx * 1.9; const pole = cyl(0.05, 0.06, 3.2, SM({ map: texBark() }), 6); pole.position.set(x, 1.4, z); g.add(pole);
    const arm = bx(0.6, 0.04, 0.04, SM({ color: '#2b2219' }), x - sdx * 0.3, 2.95, z, g); void arm; LANTS.push(V3(x - sdx * 0.55, 2.55, z)); }
  const cordM = SM({ color: '#16110c' });
  for (let k = 0; k < 8; k++) LANTS.push(V3((k % 2 ? 1 : -1) * 0.2, 2.62, -89.75 - k * 7.5));
  LANTS.forEach((p) => { const c = cyl(0.004, 0.004, 0.2, cordM, 3); c.position.set(p.x, p.y + 0.33, p.z); g.add(c); });
  const lm = IM(new THREE.SphereGeometry(1, 12, 8), lt, LANTS.length, false), cm = IM(new THREE.CylinderGeometry(1, 1, 1, 10), cap, LANTS.length * 2, false);
  LANTS.forEach((p, i) => { lm.setMatrixAt(i, M4c(p.x, p.y, p.z, 0, 0.17, 0.25, 0.17)); cm.setMatrixAt(i * 2, M4c(p.x, p.y + 0.24, p.z, 0, 0.1, 0.05, 0.1)); cm.setMatrixAt(i * 2 + 1, M4c(p.x, p.y - 0.24, p.z, 0, 0.1, 0.05, 0.1)); });
  g.add(lm); g.add(cm);
  { const rope = []; for (let k = 0; k < 9; k++) { const z = -86 - k * 7.5, x = (k % 2 ? 1 : -1) * 1.9; rope.push(V3(x, 2.98, z)); } for (let k = 0; k < rope.length - 1; k++) { const m = shd(new THREE.Mesh(UCYL1, SM({ color: '#2b2219' }))); between(m, rope[k], rope[k + 1], 0.008); g.add(m); } }
  // glow sprites (no fog, they pierce the mist) and their reflections in the flooded fields
  const glowT = g3Radial([[0, 'rgba(255,214,150,1)'], [0.3, 'rgba(240,160,80,0.5)'], [1, 'rgba(200,100,40,0)']]); Wd.lantG = [];
  LANTS.forEach((p) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.position.copy(p); s.scale.setScalar(1.3); g.add(s);
    const rf = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0.4 })); rf.position.set(p.x * 1.6, -0.1, p.z); rf.scale.set(0.9, 2.6, 1); g.add(rf); Wd.lantG.push(s, rf); });
  // a stone jizō with a red bib by the lane, a torii at its end, reeds
  { const st = SM({ color: '#848a8b', map: texStone('jz', 0.5) }), jz = new THREE.Group(); jz.position.set(-1.9, -0.05, -95); g.add(jz); const b = sph(0.2, st, 1, 1.5, 0.9); b.position.y = 0.32; jz.add(b); const h = sph(0.13, st); h.position.y = 0.7; jz.add(h); const bib = cyl(0.1, 0.24, 0.2, SM({ color: '#9a1e12' }), 10); bib.position.y = 0.5; jz.add(bib); bx(0.5, 0.15, 0.4, st, 0, 0.07, 0, jz); }
  { const red = SM({ color: '#7a2418' }), tg = new THREE.Group(); tg.position.set(0, 0, -158); g.add(tg); [-1.6, 1.6].forEach((x) => { const p = cyl(0.17, 0.2, 5, red, 10); p.position.set(x, 2.5, 0); tg.add(p); }); const kb = bx(4.8, 0.3, 0.35, SM({ color: '#16110c' }), 0, 5.1, 0, tg); kb.rotation.z = 0.0; bx(4.0, 0.25, 0.25, red, 0, 4.4, 0, tg); }
  { const rd = IM(new THREE.CylinderGeometry(0.004, 0.007, 1, 3), SM({ color: '#5e5a40' }), 2400, false); for (let i = 0; i < 2400; i++) { const x = (R.f() < 0.5 ? -1 : 1) * R.r(1.6, 22), z = R.r(-84, -150), h = R.r(0.4, 1.2); rd.setMatrixAt(i, M4c(x, -0.12 + h / 2, z, 0, 1, h, 1, R.n(0.15), R.n(0.15))); } g.add(rd); }
  // dogs: thin mongrels sitting on the lane and on the dykes, heads thrown back to howl
  Wd.dogs = [[-0.55, -88.2, 0.5], [0.65, -91.0, -0.4], [-0.35, -95.5, 0.1], [0.5, -99.5, -0.9], [-0.7, -104, 0.6], [0.2, -110, 0]].map(([x, z, ry], i) => mkDog(Wd, g, x, z, ry, i));
}
function mkDog(Wd, par, x, z, ry, i) {
  const g = new THREE.Group(); g.position.set(x, x * x < 2 ? 0.0 : villageH(x, z) + 0.02, z); g.rotation.y = ry; g.scale.setScalar(1.25); par.add(g); const fur = SM({ color: i % 2 ? '#3c2c1e' : '#5a4430', map: texCloth2() });
  const body = capsule(0.13, 0.32, fur, 8); body.rotation.x = -0.9; body.position.set(0, 0.36, -0.05); g.add(body);
  [-1, 1].forEach((s) => { const fl = cyl(0.025, 0.03, 0.42, fur, 6); fl.position.set(s * 0.07, 0.21, 0.13); g.add(fl); const pw = sph(0.035, fur, 1, 0.6, 1.4); pw.position.set(s * 0.07, 0.02, 0.15); g.add(pw); const hl = sph(0.09, fur, 0.8, 1, 1.5); hl.position.set(s * 0.1, 0.12, -0.12); g.add(hl); });
  const tail = cyl(0.015, 0.03, 0.3, fur, 5); tail.position.set(0, 0.07, -0.33); tail.rotation.x = -1.4; g.add(tail);
  const neck = new THREE.Group(); neck.position.set(0, 0.56, 0.08); g.add(neck); const nk = cyl(0.06, 0.08, 0.2, fur, 7); nk.position.y = 0.08; neck.add(nk);
  const head = new THREE.Group(); head.position.y = 0.18; neck.add(head); const sk = sph(0.08, fur, 0.9, 0.85, 1.1); head.add(sk); const sn = cyl(0.03, 0.05, 0.14, fur, 7); sn.rotation.x = Math.PI / 2; sn.position.set(0, -0.02, 0.12); head.add(sn);
  const jaw = cyl(0.02, 0.035, 0.12, SM({ color: '#2b1410' }), 6); jaw.rotation.x = Math.PI / 2; jaw.position.set(0, -0.05, 0.1); head.add(jaw);
  [-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), fur); e.position.set(s * 0.045, 0.08, -0.01); e.rotation.z = -s * 0.25; head.add(e); });
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return { g, neck, head, jaw, ph: i * 1.7 };
}

// ---------------------------------------------------------------------
//  the world, lights, beams, rain, mist
// ---------------------------------------------------------------------
function beamMat(col) {   // a soft additive light cone (local: apex at origin, axis −y, length 1): brighter near the source and on the axis
  return new THREE.ShaderMaterial({ uniforms: { col: { value: lin(col) }, k: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying float vA; varying vec3 vN, vV; void main(){ vA = -position.y; vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 col; uniform float k; varying float vA; varying vec3 vN, vV; void main(){ float f = pow(abs(dot(normalize(vN), normalize(vV))), 2.2); float a = k * f * pow(clamp(1. - vA, 0., 1.), 1.6) * smoothstep(0., .04, vA); gl_FragColor = vec4(col * a, a); }' });
}
function mkBeam(Wd, col, angle) { const L = 1, geo = new THREE.ConeGeometry(Math.tan(angle), L, 24, 1, true); geo.translate(0, -L / 2, 0); geo.computeVertexNormals(); const m = new THREE.Mesh(geo, beamMat(col)); m.frustumCulled = false; m.renderOrder = 6; Wd.scene.add(m); return m; }
function aimBeam(beam, from, dir, len, k) { beam.visible = k > 0.001; beam.position.copy(from); beam.quaternion.setFromUnitVectors(V3(0, -1, 0), dir.clone().normalize()); beam.scale.set(len, len, len); beam.material.uniforms.k.value = k; }
function mkSpot(Wd, col, angle, shadow) { const s = new THREE.SpotLight(col, 0, 60, angle, 0.55, 1.3); s.castShadow = shadow; if (shadow) { s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -0.0006; s.shadow.camera.near = 0.1; s.shadow.camera.far = 60; } Wd.scene.add(s); Wd.scene.add(s.target); return s; }
function world() {
  if (WJ) return WJ;
  const scene = new THREE.Scene(), Wd = { scene }; WJ = Wd;
  scene.background = lin('#0b1a22'); scene.fog = new THREE.Fog('#172728', 8, 60);
  Wd.cam = new THREE.PerspectiveCamera(50, YK.LW / YK.LH, 0.03, 400); Wd.mcam = new THREE.PerspectiveCamera(10, 0.27 / 0.085, 0.4, 300);
  Wd.hemi = new THREE.HemisphereLight('#4e8389', '#221c15', 0.6); scene.add(Wd.hemi);
  const moon = new THREE.DirectionalLight('#8fb1b0', 0.5); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); const sc = moon.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 120; moon.shadow.bias = -0.0008;
  scene.add(moon); scene.add(moon.target); Wd.moon = moon;
  // the sky dome and ridges far away
  { const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.MeshBasicMaterial({ map: texSky(), side: THREE.BackSide, fog: false })); scene.add(sky); Wd.sky = sky;
    Wd.ridges = [[180, '#0e1c22', 0], [140, '#14262c', 1], [105, '#1a3036', 2]].map(([r, c, k]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 70, 48, 1, true), new THREE.MeshBasicMaterial({ color: c, map: texRidge(k), alphaTest: 0.5, transparent: false, side: THREE.BackSide, fog: false }));
      m.material.map.repeat.set(5, 1); m.position.y = 22 - k * 6; scene.add(m); return m; }); }
  mkTerrain(Wd); mkRoad(Wd); Wd.portal = mkPortal(Wd, 0, 1, 'stone'); mkPortal(Wd, FAR_Z, -1, 'stone2'); mkTunnel(Wd); mkBlocks(Wd); mkSign(Wd);
  mkCedars(Wd); mkGrowth(Wd); mkRoadside(Wd); mkCar(Wd); mkVillage(Wd);
  // the people
  Wd.bro = mkPerson('brother', { seed: 18 }); scene.add(Wd.bro.g); Wd.flashR = gripFit(Wd.bro).r * 0.98;
  const CL = [['#26304a', ['#3c2c1e', '#5a2418', '#1f3c44']], ['#5a2418', ['#26304a', '#3c2c1e', '#2b2219']], ['#a09678', ['#5a4430', '#26304a', '#3c2c1e']], ['#2b2d29', ['#5a2418', '#5a4430']], ['#3c2c1e', ['#26304a', '#a09678']]];
  Wd.vill = []; for (let i = 0; i < 11; i++) { const P = mkPerson('villager', { seed: 100 + i, cloth: i === 10 ? ['#1b1f2a', ['#2b2219', '#26304a', '#3c2c1e']] : CL[(i * 3) % CL.length], eyeSide: i % 3 === 1 ? -1 : 1, hgt: [1.0, 0.9, 1.08, 0.95, 1.04, 0.92, 1.1, 0.97, 1.02, 0.94, 1.0][i] }); scene.add(P.g); P.sickle = mkSickle(Wd, P); if ([2, 6, 8].includes(i)) P.lantern = mkLanternStick(Wd, P); Wd.vill.push(P); }
  Wd.flash = mkFlashlight(Wd, 'brother'); Wd.flashNew = mkFlashlight(Wd, 'new'); Wd.flashOld = [0, 1, 2].map(() => mkFlashlight(Wd, 'old'));
  // lights (a fixed set: intensities change per shot, the count never does)
  Wd.headL = mkSpot(Wd, '#ffe8b8', 0.42, true); Wd.headR = mkSpot(Wd, '#ffe8b8', 0.42, true); Wd.flashL = mkSpot(Wd, '#fff0cc', 0.32, true);
  // a failing sodium lamp on a bent pole in front of the mouth (used by the hook; dead in every other shot)
  { const g = new THREE.Group(); scene.add(g); const met = SM({ map: texMetal('lamp', '#5e615a'), metalness: 0.4, roughness: 0.5 }), P0 = V3(-2.9, 0, 2.75), A = V3(-1.0, 3.3, 2.75);
    const pole = cyl(0.05, 0.065, 3.45, met, 8); pole.position.set(P0.x, 1.725, P0.z); g.add(pole); const top = V3(P0.x, 3.45, P0.z);
    const arm = shd(new THREE.Mesh(UCYL1, met)); between(arm, top, A.clone().add(V3(0, 0.08, 0)), 0.025); g.add(arm);
    const sh = cyl(0.06, 0.2, 0.14, SM({ color: '#2b2d29', side: THREE.DoubleSide, metalness: 0.4 }), 12, true); sh.position.copy(A); g.add(sh);
    const cap = cyl(0.06, 0.06, 0.05, met, 10); cap.position.copy(A).add(V3(0, 0.08, 0)); g.add(cap);
    Wd.lampBulbM = BM('#3a2a1a'); const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), Wd.lampBulbM); bulb.rotation.z = Math.PI / 2; bulb.position.copy(A).add(V3(0, -0.04, 0)); g.add(bulb);
    for (let k = 0; k < 4; k++) { const w = cyl(0.006, 0.006, 0.25, SM({ color: '#16110c' }), 3); w.position.set(P0.x + 0.06, 2.9 - k * 0.45, P0.z); w.rotation.z = 0.2 * (k % 2 ? 1 : -1); g.add(w); }   // a loose cable down the pole
    Wd.lampGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,220,150,1)'], [0.25, 'rgba(255,170,80,0.55)'], [1, 'rgba(230,120,40,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    Wd.lampGlow.position.copy(bulb.position); Wd.lampGlow.scale.setScalar(1.3); scene.add(Wd.lampGlow); Wd.lampGlow.visible = false;
    Wd.lampL = mkSpot(Wd, '#ffb868', 0.95, true); Wd.lampL.position.copy(bulb.position).add(V3(0, -0.05, 0)); Wd.lampL.target.position.set(-0.45, 1.4, 2.0); Wd.lampL.target.updateMatrixWorld(); Wd.lampL.distance = 12; Wd.lampL.penumbra = 0.7; }
  Wd.fill = new THREE.PointLight('#e8a860', 0, 20, 1.5); scene.add(Wd.fill); Wd.tail = new THREE.PointLight('#d03020', 0, 9, 1.6); scene.add(Wd.tail);
  Wd.lantL = [0, 1, 2].map(() => { const l = new THREE.PointLight('#f0a050', 0, 14, 1.5); scene.add(l); return l; });
  Wd.beams = { L: mkBeam(Wd, '#f2d39a', 0.36), R: mkBeam(Wd, '#f2d39a', 0.36), F: mkBeam(Wd, '#f2e2b8', 0.26) };
  { const glowT = g3Radial([[0, 'rgba(255,250,225,1)'], [0.2, 'rgba(255,235,190,0.6)'], [1, 'rgba(255,220,170,0)']]); Wd.glow = [0, 1, 2, 3].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.visible = false; scene.add(s); return s; }); }
  // rain (line streaks round the camera, brighter where they cross a beam), mist puffs
  { const n = 1500, R = RNG('rain'); Wd.rainP = []; for (let i = 0; i < n; i++) Wd.rainP.push({ x: R.r(-9, 9), y: R.f(), z: R.r(-14, 4), v: R.r(0.85, 1.2) });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3)); geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 6), 3));
    Wd.rain = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6, depthWrite: false })); Wd.rain.frustumCulled = false; scene.add(Wd.rain); }
  { const R = RNG('mist'), t = g3Radial([[0, 'rgba(200,220,220,0.55)'], [0.5, 'rgba(180,205,205,0.2)'], [1, 'rgba(160,190,190,0)']], 64); Wd.mist = [];
    for (let i = 0; i < 70; i++) { const z = i < 40 ? R.r(-4, 40) : R.r(-150, -84), x = z > 0 ? XC(z) + R.n(14) : R.n(20), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: R.r(0.3, 0.7) }));
      s.position.set(x, Math.max(0, hT(x, z)) + R.r(0.8, 3), z); s.scale.set(R.r(5, 11), R.r(2, 4), 1); s.userData = { x, z, ph: R.r(0, TAU) }; scene.add(s); Wd.mist.push(s); } }
  // toon: every standard material becomes a 3-band toon material (alpha masks kept)
  const grad = new THREE.DataTexture(new Uint8Array([45, 45, 45, 255, 135, 135, 135, 255, 255, 255, 255, 255]), 3, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const done = new Map(); scene.traverse((m) => { if (!m.isMesh || !m.material) return; const conv = (o) => { if (!o.isMeshStandardMaterial) return o; if (!done.has(o)) done.set(o, new THREE.MeshToonMaterial({ color: o.color, map: o.map, alphaMap: o.alphaMap, alphaTest: o.alphaTest, vertexColors: o.vertexColors, side: o.side, gradientMap: grad, transparent: o.transparent, opacity: o.opacity, depthWrite: o.depthWrite, emissive: o.emissive, emissiveIntensity: o.emissiveIntensity })); return done.get(o); };
    m.material = Array.isArray(m.material) ? m.material.map(conv) : conv(m.material); });
  Wd.toon = done; return Wd;
}
const LIGHT = {
  night:   { hemS: '#4e8389', hemG: '#3c2c1e', hemI: 0.95, moonC: '#8fb1b0', moonI: 0.7, fog: '#172728', fn: 6, ff: 70, bg: '#0b1a22', exp: 1.2, sky: 1 },
  tunnel:  { hemS: '#1f3c44', hemG: '#191b18', hemI: 0.16, moonC: '#4e8389', moonI: 0.0, fog: '#06090f', fn: 4, ff: 75, bg: '#06090f', exp: 1.1, sky: 0.4 },
  village: { hemS: '#346c76', hemG: '#3c2c1e', hemI: 0.45, moonC: '#8fb1b0', moonI: 0.35, fog: '#1a3036', fn: 5, ff: 62, bg: '#0b1a22', exp: 1.05, sky: 1 },
  day:     { hemS: '#b9cbc6', hemG: '#5a4430', hemI: 1.9, moonC: '#d3d6cc', moonI: 1.6, fog: '#65969a', fn: 6, ff: 90, bg: '#65969a', exp: 1.35, sky: 2.6 },
};
function setLight(Wd, L) {
  Wd.hemi.color.set(L.hemS); Wd.hemi.groundColor.set(L.hemG); Wd.hemi.intensity = L.hemI; Wd.moon.color.set(L.moonC); Wd.moon.intensity = L.moonI;
  Wd.scene.fog.color.set(L.fog); Wd.scene.fog.near = L.fn; Wd.scene.fog.far = L.ff; Wd.scene.background.set(L.bg); rend().r.toneMappingExposure = L.exp;
  Wd.sky.material.color.setScalar(L.sky); Wd.ridges.forEach((m) => (m.visible = L.sky > 0.5));
}
