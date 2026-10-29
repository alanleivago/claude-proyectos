// =====================================================================
//  WORLD — three sets in one scene, far apart (fog hides each from the others):
//   ROAD (origin): the dry sertão of Minas Gerais at night — a red dirt road with wheel ruts bending left, barbed-wire
//     fences on crooked posts, dry grass, mandacaru cacti, leafless caatinga scrub, dead trees, low hills, the moon;
//     at the outside of the bend the hollow dead tree with a split in its trunk where the Corpo-Seco lives.
//   HOUSE (x = +400): a taipa farmhouse room lit by an oil lamp (table, stove, beams, saint, crucifix, corn, pots).
//   CHAPEL (x = −400): a small limewashed chapel with a belfry, a walled cemetery, crosses, an open grave, the coffin.
//  The ox cart (carro de boi: solid wooden wheels, plank bed, a pole to the yoke) and two zebu oxen; the hurricane
//  lantern; people on one point rig (pelvis + basis, two-bone IK arms and legs, hands with jointed fingers, held props in
//  the fitted fist): my grandfather, Tião, his mother, and the Corpo-Seco (leather on bone, ribs, a lipless grin).
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

// ---------------------------------------------------------------------
//  the road: a Catmull-Rom centreline, resampled by arc length; heights; the ground of the road set
// ---------------------------------------------------------------------
const ROADC = new THREE.CatmullRomCurve3([[7, 110], [5, 70], [3.5, 40], [2, 18], [0.6, 6], [-1.2, -2], [-5.5, -9.5], [-13, -15.5], [-26, -21.5], [-48, -28], [-80, -34], [-120, -40]].map(([x, z]) => V3(x, 0, z)));
const ROAD_L = ROADC.getLength(), ROAD_N = Math.round(ROAD_L / 0.25), RP = ROADC.getSpacedPoints(ROAD_N);
function roadAt(s) { const f = clamp(s / ROAD_L) * ROAD_N, i = Math.min(ROAD_N - 1, Math.floor(f)), k = f - i, p = RP[i].clone().lerp(RP[i + 1], k), t = RP[i + 1].clone().sub(RP[i]).normalize(); return { p, t, r: V3(-t.z, 0, t.x) }; }
function roadNear(x, z) { let best = 1e9, bi = 0; for (let i = 0; i <= ROAD_N; i += 4) { const d = (RP[i].x - x) ** 2 + (RP[i].z - z) ** 2; if (d < best) { best = d; bi = i; } }
  for (let i = Math.max(0, bi - 5); i <= Math.min(ROAD_N, bi + 5); i++) { const d = (RP[i].x - x) ** 2 + (RP[i].z - z) ** 2; if (d < best) { best = d; bi = i; } } return { d: Math.sqrt(best), s: (bi / ROAD_N) * ROAD_L, i: bi }; }
const roadDist = (x, z) => roadNear(x, z).d;
// the cross-section of the road (offset from the centre → height): crowned middle, two wheel ruts at ±0.7 m
const ROAD_X = [[-2.7, -0.03], [-1.25, 0.0], [-0.9, -0.03], [-0.7, -0.055], [-0.5, -0.03], [-0.25, 0.012], [0, 0.02], [0.25, 0.012], [0.5, -0.03], [0.7, -0.055], [0.9, -0.03], [1.25, 0.0], [2.7, -0.03]];
const roadY = (off) => pan(ROAD_X, off);
function setH(x, z) {   // the road set's ground: flat at the road, gentle swells and low rises further out
  const rd = roadDist(x, z), n = fbm2(x * 0.07 + 5, z * 0.07);
  const base = 0.25 * ss(2.8, 8, rd) + (n - 0.5) * 1.6 * ss(3, 12, rd) + 3.5 * ss(35, 90, rd) * fbm2(x * 0.02, z * 0.02);
  return lerp(-0.09, base, ss(2.4, 3.1, rd));
}
// where feet and props stand on the road set: the road profile on the road, the ground beside it
function groundAt(x, z) { const q = roadNear(x, z); if (q.d < 2.6) { const ra = roadAt(q.s), off = V3(x, 0, z).sub(ra.p).dot(ra.r); return roadY(off); } return setH(x, z); }
function gridAxis(a, b, fine, f = 1, c = 3) { const v = []; let p = a; while (p <= b + 1e-6) { v.push(+p.toFixed(3)); p += fine.some(([u, w]) => p >= u && p < w) ? f : c; } return v; }
function heightMesh(xs, zs, hf, colf, mat) {
  const nx = xs.length, nz = zs.length, P = new Float32Array(nx * nz * 3), C = new Float32Array(nx * nz * 3), UV = new Float32Array(nx * nz * 2), idx = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = xs[i], z = zs[j], k = j * nx + i, h = hf(x, z); P[k * 3] = x; P[k * 3 + 1] = h; P[k * 3 + 2] = z; UV[k * 2] = x / 5; UV[k * 2 + 1] = z / 5; const c = colf(x, z, h); C[k * 3] = c.r; C[k * 3 + 1] = c.g; C[k * 3 + 2] = c.b; }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(C, 3)); g.setAttribute('uv', new THREE.BufferAttribute(UV, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.castShadow = true; return m;
}
function mkRoadSet(Wd) {
  const cA = lin('#7a5a3a'), cB = lin('#5a4a30'), cC = lin('#8a7448'), tmp = new THREE.Color();
  const xs = gridAxis(-100, 90, [[-30, 22]], 0.75, 3), zs = gridAxis(-70, 110, [[-30, 30]], 0.75, 3);
  Wd.ground = heightMesh(xs, zs, setH, (x, z) => { const n = fbm2(x * 0.3, z * 0.3), rd = roadDist(x, z); return tmp.copy(cA).lerp(cB, n).lerp(cC, ss(0.6, 0.9, fbm2(x * 0.12 + 9, z * 0.12)) * 0.6).multiplyScalar(rd < 3 ? 0.85 : 1).clone(); }, SM({ map: texSoil(), vertexColors: true, color: '#d8d0c0' }));
  Wd.ground.material.map.repeat.set(1, 1); Wd.scene.add(Wd.ground);
  // the road ribbon with the rut profile
  const P = [], UV = [], idx = [], nX = ROAD_X.length; let v = 0;
  for (let i = 0; i <= ROAD_N; i++) { const ra = roadAt((i / ROAD_N) * ROAD_L); if (i) v += 0.25 / 10;
    ROAD_X.forEach(([o, y]) => { const p = ra.p.clone().addScaledVector(ra.r, o); P.push(p.x, y, p.z); UV.push((o + 2.7) / 5.4, v); });
    if (i) { const a = (i - 1) * nX; for (let k = 0; k < nX - 1; k++) idx.push(a + k, a + k + nX, a + k + 1, a + k + 1, a + k + nX, a + k + nX + 1); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(idx); g.computeVertexNormals();
  if (g.attributes.normal.getY(nX * 3 + 6) < 0) { const I = g.index.array; for (let k = 0; k < I.length; k += 3) { const t = I[k + 1]; I[k + 1] = I[k + 2]; I[k + 2] = t; } g.computeVertexNormals(); }
  const road = new THREE.Mesh(g, SM({ map: texDirt(), roughness: 0.95 })); road.receiveShadow = true; Wd.scene.add(road); Wd.road = road;
}

// ---------------------------------------------------------------------
//  dead trees (recursive tapered branches), the hero tree with its split hollow, cacti, scrub, fences, grass
// ---------------------------------------------------------------------
function branchSet(R, base, dir, len, r, depth, out) {
  const pts = [base.clone()]; let p = base.clone(), d = dir.clone().normalize();
  for (let k = 1; k <= 4; k++) { d.add(V3(R.n(0.35), R.n(0.15) + 0.04, R.n(0.35))).normalize(); p = p.clone().addScaledVector(d, len / 4); pts.push(p); }
  out.push({ pts, r0: r, r1: r * 0.42 });
  if (depth <= 0) return;
  const nb = depth > 1 ? 3 : 2;
  for (let b = 0; b < nb; b++) { const u = 0.5 + 0.5 * (b + 1) / (nb + 1), q = new THREE.CatmullRomCurve3(pts).getPointAt(u), side = V3(R.n(1), 0.2 + R.f() * 0.9, R.n(1)).normalize(), nd = d.clone().lerp(side, 0.55 + R.f() * 0.3).normalize();
    branchSet(R, q, nd, len * R.r(0.5, 0.75), r * R.r(0.38, 0.55), depth - 1, out); }
}
function treeGeo(seed, o = {}) {   // a leafless dead tree: trunk (o.trunk = false: branches only, from o.top) and branches → merged geometries
  const R = RNG('dtree', seed), out = [], H = o.h ?? R.r(3, 5.5), r = o.r ?? R.r(0.12, 0.25);
  const top = o.top || V3(R.n(0.4), H * 0.55, R.n(0.4));
  if (o.trunk !== false) out.push({ pts: [V3(0, -0.2, 0), V3(R.n(0.1), H * 0.2, R.n(0.1)), V3(R.n(0.2), H * 0.4, R.n(0.2)), top], r0: r, r1: r * 0.7 });
  const nl = o.limbs ?? (2 + Math.floor(R.f() * 3));
  for (let k = 0; k < nl; k++) { const a = (k / nl) * TAU + R.n(0.5), d = V3(Math.cos(a) * 0.7, 1, Math.sin(a) * 0.7); branchSet(R, top, d, H * R.r(0.45, 0.7) * (o.spread ?? 1), (o.limbR ?? r * 0.7), o.depth ?? 2, out); }
  return out.map((b, i) => taperTube(b.pts, b.r0, b.r1, b.r0 > 0.08 ? 8 : 5, b.r0 > 0.08 ? 10 : 6, { seed: seed * 31 + i }));
}
function mergeGeos(geos) {
  const P = [], N = [], UV = [], I = []; let off = 0;
  geos.forEach((g) => { const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); UV.push(uv.getX(i), uv.getY(i)); } g.index.array.forEach((v) => I.push(v + off)); off += p.count; });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(I); return g;
}
// the hero trunk: a bulging barriguda-like trunk, hollow inside from 0.45 to 2.75 m, split open toward the road (local +z)
// by a slit whose width is gap(y) × open. r(y) outer radius. The inside is a dark pocket.
const TRUNK = { r: (y) => 0.5 + 0.32 * Math.exp(-y * 3.2) + 0.12 * Math.exp(-((y - 1.3) ** 2) / 0.5) - 0.06 * ss(2.4, 4.2, y), lo: 0.45, hi: 2.75, th: 0.1 };
TRUNK.gap = (y) => 0.52 * Math.pow(Math.max(0, Math.sin(Math.PI * clamp((y - 0.55) / 2.15))), 0.55);
TRUNK.rin = (y) => (TRUNK.r(y) - TRUNK.th) * ss(TRUNK.lo - 0.1, TRUNK.lo + 0.15, y) * (1 - ss(TRUNK.hi - 0.2, TRUNK.hi + 0.05, y));
function trunkGeo(open, seed = 3) {
  const R = RNG('trunk', seed), ny = 44, na = 26, P = [], UV = [], idx = [], nl = na * 2 + 2;
  const wob = (a, y) => 1 + 0.07 * Math.sin(a * 5 + y * 2.3 + 1) + 0.05 * Math.sin(a * 9 - y * 4) + 0.04 * Math.sin(a * 13 + y * 7);
  for (let i = 0; i <= ny; i++) { const y = -0.25 + (i / ny) * 4.45, g = TRUNK.gap(y) * open + 0.02, r = TRUNK.r(y), ri = TRUNK.rin(y), lean = V3(0.06 * y * y * 0.1, 0, -0.05 * y);
    const ring = [];
    for (let j = 0; j <= na; j++) { const a = g / 2 + (j / na) * (TAU - g); ring.push([a, r * wob(a, y), j / na]); }   // outer, from one lip round the back to the other
    for (let j = na; j >= 0; j--) { const a = g / 2 + (j / na) * (TAU - g); ring.push([a, Math.max(0.001, ri * (1 + 0.04 * Math.sin(a * 7 + y * 5))), j / na]); }   // inner, back again
    ring.push(ring[0]);
    ring.forEach(([a, rr, u]) => { P.push(lean.x + Math.sin(a) * rr, y, lean.z + Math.cos(a) * rr); UV.push(u * 2, y / 1.4); });
    if (i) { const b0 = (i - 1) * (nl + 1), b1 = i * (nl + 1); for (let k = 0; k < nl; k++) idx.push(b0 + k, b0 + k + 1, b1 + k, b0 + k + 1, b1 + k + 1, b1 + k); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(idx); g.computeVertexNormals(); void R; return g;
}
function mkHeroTree(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); Wd.tree = g; const bark = SM({ map: texDeadBark(), color: '#f0e6d4' }), dark = SM({ color: '#120d09', side: THREE.BackSide });
  Wd.trunkOpen = shd(new THREE.Mesh(trunkGeo(1), bark)); Wd.trunkWide = shd(new THREE.Mesh(trunkGeo(1.45), bark)); Wd.trunkShut = shd(new THREE.Mesh(trunkGeo(0), bark)); [Wd.trunkOpen, Wd.trunkWide, Wd.trunkShut].forEach((m) => { m.material = bark; g.add(m); });
  const pocket = sph(1, dark, 1, 1, 1, 18); pocket.scale.set(0.38, 1.05, 0.36); pocket.position.set(0, 1.55, -0.05); g.add(pocket); pocket.castShadow = false; Wd.pocket = pocket;   // the dark inside, seen through the slit
  // roots, the crown of limbs (from the top of the trunk), a few broken stubs
  const roots = []; const RR = RNG('roots'); for (let k = 0; k < 7; k++) { const a = (k / 7) * TAU + RR.n(0.3); roots.push(taperTube([V3(Math.sin(a) * 0.45, 0.35, Math.cos(a) * 0.45), V3(Math.sin(a) * 0.9, 0.05, Math.cos(a) * 0.9), V3(Math.sin(a + RR.n(0.3)) * 1.6, -0.12, Math.cos(a) * 1.6)], 0.2, 0.05, 7, 6, { seed: k })); }
  const crown = treeGeo(7, { trunk: false, top: V3(0.05, 4.05, -0.15), h: 6, limbs: 4, limbR: 0.2, depth: 3, spread: 0.85 });
  const m = shd(new THREE.Mesh(mergeGeos([...roots, ...crown, taperTube([V3(0, 3.9, -0.1), V3(0.05, 4.2, -0.15)], 0.36, 0.25, 9, 2)]), bark)); g.add(m);
  // two bark faces (the last shot): the grinning one and my grandfather's, pushed out of the shut trunk
  Wd.barkFaces = new THREE.Group(); g.add(Wd.barkFaces); Wd.barkFaces.visible = false;
  return g;
}
function mkScrub(Wd) {
  const R = RNG('scrub'), bark = SM({ map: texDeadBark('dbark3', '#7a7266'), color: '#c8c0b0' }), geos = [], spots = [];
  const ok = (x, z, m) => { const rd = roadDist(x, z); return rd > m && Math.hypot(x - TREE.p.x, z - TREE.p.z) > 6; };
  // dead trees scattered over the plain, more near the road; caatinga twig bushes; mandacaru cacti
  for (let i = 0; i < 400 && spots.length < 46; i++) { const x = R.r(-70, 60), z = R.r(-55, 95); if (!ok(x, z, 7)) continue; spots.push([x, z]); }
  spots.forEach(([x, z], i) => { const s = R.r(0.7, 1.4), y = setH(x, z), gs = treeGeo(100 + i, { h: R.r(3, 6) }); gs.forEach((g) => { g.scale(s, s, s); g.rotateY(R.r(0, TAU)); g.translate(x, y, z); geos.push(g); }); });
  Wd.scene.add(shd(new THREE.Mesh(mergeGeos(geos), bark)));
  const twig = []; for (let i = 0; i < 900 && twig.length < 160; i++) { const x = R.r(-50, 45), z = R.r(-45, 80); if (!ok(x, z, 4.4)) continue; const y = setH(x, z), sc = R.r(0.5, 1.2);
    treeGeo(500 + twig.length, { trunk: false, top: V3(0, 0, 0), h: 1.4, limbs: 5, limbR: 0.025, depth: 1, spread: 1.1 }).forEach((g) => { g.scale(sc, sc, sc); g.translate(x, y, z); twig.push(g); }); }
  Wd.scene.add(shd(new THREE.Mesh(mergeGeos(twig), SM({ color: '#4a3c30' }))));
  // mandacaru: a ribbed column with upturned arms
  const cac = SM({ map: txCanvas('cactus', 32, 64, (x, w, h, R2) => { x.fillStyle = '#3c5a40'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 4) { x.fillStyle = 'rgba(10,20,14,0.55)'; x.fillRect(i, 0, 1, h); x.fillStyle = 'rgba(180,200,160,0.25)'; x.fillRect(i + 2, 0, 1, h); } speckle(x, R2, w, h, 120, ['#d3d6cc', '#a8b098']); }, [3, 2]), color: '#c8d0c0' });
  const cg = []; for (let i = 0; i < 300 && cg.length < 120; i++) { const x = R.r(-60, 50), z = R.r(-50, 90); if (!ok(x, z, 5)) continue; const y = setH(x, z), h = R.r(1.6, 4.2), r = R.r(0.1, 0.17);
    const parts = [new THREE.CylinderGeometry(r, r * 1.1, h, 8).translate(0, h / 2, 0)]; const na = Math.floor(R.r(0, 4));
    for (let k = 0; k < na; k++) { const a = R.r(0, TAU), hy = R.r(0.6, h * 0.65), L = R.r(0.25, 0.5), up = R.r(0.6, 1.5), ar = r * 0.8; parts.push(new THREE.CylinderGeometry(ar, ar, L, 6).rotateZ(Math.PI / 2).translate(L / 2, 0, 0).rotateY(a).translate(0, hy, 0));
      parts.push(new THREE.CylinderGeometry(ar * 0.9, ar, up, 6).translate(Math.cos(a) * L, hy + up / 2, -Math.sin(a) * L)); }
    parts.forEach((p) => { p.translate(x, y - 0.05, z); cg.push(p.index ? p : p); }); }
  Wd.scene.add(shd(new THREE.Mesh(mergeGeos(cg), cac)));
  // stones
  const st = IM(new THREE.DodecahedronGeometry(1, 0), SM({ color: '#8a8478', map: texSoil() }), 300); let c = 0;
  for (let i = 0; i < 900 && c < 300; i++) { const x = R.r(-40, 40), z = R.r(-40, 70), rd = roadDist(x, z); if (rd < 2.9 || Math.hypot(x - TREE.p.x, z - TREE.p.z) < 1.8) continue; const s = R.r(0.05, rd < 6 ? 0.25 : 0.5); st.setMatrixAt(c++, M4c(x, setH(x, z) + s * 0.2, z, R.r(0, 6), s * R.r(1, 1.8), s, s * R.r(0.8, 1.4))); }
  st.count = c; Wd.scene.add(st);
}
function mkFences(Wd) {
  const R = RNG('fence'), post = SM({ map: texDeadBark('post', '#6a6050'), color: '#b0a898' }), posts = [], wires = [], barbs = [];
  [-1, 1].forEach((sd) => { let last = null;
    for (let s = 20; s < ROAD_L - 30; s += 2.7) { const ra = roadAt(s), p = ra.p.clone().addScaledVector(ra.r, sd * 4.5), y = setH(p.x, p.z); if (Math.hypot(p.x - TREE.p.x, p.z - TREE.p.z) < 1.4) { last = null; continue; }
      if (p.distanceTo(V3(0, 0, 0)) > 110) { last = null; continue; }
      const h = R.r(1.25, 1.5), lean = [R.n(0.07), R.n(0.07)], top = V3(p.x + lean[0] * h, y + h, p.z + lean[1] * h), bot = V3(p.x, y - 0.1, p.z); posts.push([bot, top, R.r(0.05, 0.08)]);
      const cur = { bot, top }; if (last) [0.32, 0.62, 0.92, 1.18].forEach((hh, k) => { const a = last.bot.clone().lerp(last.top, hh / 1.4), b = bot.clone().lerp(top, hh / 1.4); if (R.f() < 0.05 && k < 2) return; const n = 6; let pa = a;
        for (let q = 1; q <= n; q++) { const u = q / n, pb = a.clone().lerp(b, u).add(V3(0, -0.06 * Math.sin(Math.PI * u), 0)); wires.push(pa, pb); pa = pb; }
        for (let q = 1; q < 9; q++) { const c = a.clone().lerp(b, q / 9).add(V3(0, -0.06 * Math.sin(Math.PI * q / 9), 0)); barbs.push(c.clone().add(V3(0.02, 0.02, 0.02)), c.clone().add(V3(-0.02, -0.02, -0.02)), c.clone().add(V3(-0.02, 0.02, 0.02)), c.clone().add(V3(0.02, -0.02, -0.02))); } });
      last = cur; } });
  const pm = IM(UCYL1, post, posts.length); const m4 = new THREE.Matrix4(), dummy = new THREE.Object3D();
  posts.forEach(([a, b, r], i) => { between(dummy, a, b, r); dummy.updateMatrix(); pm.setMatrixAt(i, dummy.matrix); }); Wd.scene.add(pm); void m4;
  const wl = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wires.concat(barbs)), new THREE.LineBasicMaterial({ color: '#5e615a', fog: true })); wl.frustumCulled = false; Wd.scene.add(wl); Wd.wires = wl;
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

// ---------------------------------------------------------------------
//  the ox cart and the oxen. Assembly local frame: forward = −z, the axle at the origin, ground y = 0.
// ---------------------------------------------------------------------
const CART = { wheelR: 0.62, track: 0.69, bedY: 0.95, bedZ0: -1.35, bedZ1: 1.75, bedW: 0.56, yokeZ: -4.05, yokeY: 1.2, oxX: 0.5, oxZ: -3.05 };
function mkCart(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); Wd.cart = g; const wood = SM({ map: texPlank('cartw', '#7a5a3c') }), wood2 = SM({ map: texPlank('cartw2', '#5a4430') }), dark = SM({ color: '#2b2219' }), iron = SM({ map: texMetal('iron', '#3f4542'), metalness: 0.4 });
  // the bed: planks, side beams, fueiros (stakes) with a woven side panel at the back half
  bx(CART.bedW * 2, 0.06, CART.bedZ1 - CART.bedZ0, wood, 0, CART.bedY, (CART.bedZ0 + CART.bedZ1) / 2, g);
  [-1, 1].forEach((sd) => { bx(0.1, 0.12, CART.bedZ1 - CART.bedZ0 + 0.1, wood2, sd * (CART.bedW + 0.02), CART.bedY - 0.06, (CART.bedZ0 + CART.bedZ1) / 2, g);
    for (let k = sd > 0 ? 1 : 0; k < 7; k++) { const z = lerp(CART.bedZ0 + 0.15, CART.bedZ1 - 0.1, k / 6), s = bx(0.045, 0.7, 0.045, wood2, sd * (CART.bedW + 0.02), CART.bedY + 0.35, z, g); s.rotation.z = sd * 0.08; }
    const rail = bx(0.04, 0.05, CART.bedZ1 - CART.bedZ0 - 0.75, wood2, sd * (CART.bedW + 0.05), CART.bedY + 0.68, (CART.bedZ0 + CART.bedZ1) / 2 + 0.34, g); void rail;
    const weave = bx(0.02, 0.5, 1.6, SM({ map: texStraw(), color: '#c8b088' }), sd * (CART.bedW + 0.0), CART.bedY + 0.3, 0.75, g); void weave; });
  // the axle housing (cocão) and the solid wheels: three planks, two crescent holes, an iron tyre; they turn with the axle
  bx(1.5, 0.12, 0.16, wood2, 0, CART.wheelR, 0, g);
  Wd.wheels = [-1, 1].map((sd) => { const wg = new THREE.Group(); wg.position.set(sd * CART.track, CART.wheelR - 0.05, 0); g.add(wg);
    const sh = new THREE.Shape(); sh.absarc(0, 0, CART.wheelR, 0, TAU, false); [1, -1].forEach((k) => { const hole = new THREE.Path(); hole.absarc(k * 0.3, 0, 0.14, Math.PI / 2 + 0.4, Math.PI * 1.5 - 0.4, k > 0); hole.absarc(k * 0.38, 0, 0.12, Math.PI * 1.5 - 0.5, Math.PI / 2 + 0.5, k < 0); sh.holes.push(hole); });
    const disc = shd(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.09, bevelEnabled: false, curveSegments: 24 }), SM({ map: texPlank('wheel', '#6a5038') }))); disc.rotation.y = Math.PI / 2; disc.position.x = -0.045; wg.add(disc);
    const tyre = shd(new THREE.Mesh(new THREE.TorusGeometry(CART.wheelR, 0.03, 5, 32), iron)); tyre.rotation.y = Math.PI / 2; wg.add(tyre);
    const hub = cyl(0.11, 0.11, 0.24, wood2, 10); hub.rotation.z = Math.PI / 2; wg.add(hub); [-0.18, 0.18].forEach((y) => { const pl = bx(0.1, 0.012, CART.wheelR * 1.9, dark, 0, y, 0, wg); void pl; }); return wg; });
  // the pole (cabeçalho) from the bed to the yoke, and the yoke (canga) with its pegs (canzis) and neck straps
  const pole = shd(new THREE.Mesh(UCYL1, wood2)); between(pole, V3(0, CART.bedY - 0.02, CART.bedZ0 + 0.5), V3(0, CART.yokeY - 0.06, CART.yokeZ - 0.05), 0.055); g.add(pole);
  const yoke = cyl(0.07, 0.07, 1.75, wood, 10); yoke.rotation.z = Math.PI / 2; yoke.position.set(0, CART.yokeY, CART.yokeZ); g.add(yoke); Wd.yoke = yoke;
  [-1, 1].forEach((sd) => [-0.2, 0.2].forEach((dx) => { const p = cyl(0.022, 0.022, 0.5, wood2, 6); p.position.set(sd * CART.oxX + dx, CART.yokeY - 0.18, CART.yokeZ); g.add(p); }));
  const post = cyl(0.025, 0.03, 0.55, wood2, 6); post.position.set(0, CART.yokeY + 0.3, CART.yokeZ); g.add(post); const hook = shd(new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 4, 10, Math.PI * 1.3), iron)); hook.position.set(0, CART.yokeY + 0.55, CART.yokeZ - 0.05); hook.rotation.y = Math.PI / 2; g.add(hook); const arm = cyl(0.008, 0.008, 0.1, iron, 4); arm.rotation.x = Math.PI / 2; arm.position.set(0, CART.yokeY + 0.57, CART.yokeZ - 0.035); g.add(arm); [post, hook, arm].forEach((m) => (m.castShadow = false));   // right beside the lantern's light: their shadows swept the man with every swing
  // the load: sacks of beans and a bundle of firewood; a sack to sit on at the front
  const sack = SM({ map: texCloth('sack', '#a08a60', { rep: [2, 2] }) });
  [[0.25, 0.6], [-0.25, 0.75], [0.05, 1.25], [-0.2, 1.4]].forEach(([x, z], i) => { const s = sph(0.25, sack, 1, 0.62, 1.4, 12); s.position.set(x, CART.bedY + 0.16, z); s.rotation.y = i * 0.5; g.add(s); });
  const seat = sph(0.24, sack, 1.3, 0.6, 1.0, 12); seat.position.set(0, CART.bedY + 0.14, CART.bedZ0 + 0.72); g.add(seat); Wd.seatY = CART.bedY + 0.14 + 0.24 * 0.6;
  for (let k = 0; k < 6; k++) { const f = cyl(0.04, 0.04, 1.3, SM({ map: texDeadBark() }), 6); f.rotation.x = Math.PI / 2; f.position.set(-0.35 + (k % 3) * 0.07, CART.bedY + 0.08 + Math.floor(k / 3) * 0.07, 0.2); g.add(f); }
  Wd.oxen = [-1, 1].map((sd, i) => { const ox = mkOx(Wd, i); g.add(ox.g); ox.g.position.set(sd * CART.oxX, 0, CART.oxZ); ox.sd = sd; return ox; });
  return g;
}
function mkOx(Wd, i) {
  const g = new THREE.Group(), hide = SM({ map: texHide(), color: i ? '#ffffff' : '#d8c8b8' }), dark = SM({ color: '#1e1814' }), horn = SM({ color: '#d8ccb0', roughness: 0.5 }), O = { g, i, legs: [] };
  // local: forward −z; body centre at y 0.98
  // one smooth body: barrel, deep chest, the zebu hump over the shoulders, a bony rump
  const bg = new THREE.SphereGeometry(1, 32, 20), bp = bg.attributes.position; for (let i = 0; i < bp.count; i++) { let x = bp.getX(i), y = bp.getY(i), z = bp.getZ(i);
    const zz = z * 1.02, hump = 0.24 * Math.exp(-(((zz + 0.62) / 0.17) ** 2)) * Math.max(0, y) ** 1.5, chest = 0.08 * Math.exp(-(((zz + 0.6) / 0.3) ** 2)) * Math.max(0, -y), rump = 0.05 * Math.exp(-(((zz - 0.75) / 0.2) ** 2)) * Math.max(0, y);
    const wz = 1 - 0.12 * Math.max(0, zz - 0.3);   // narrower behind
    bp.setXYZ(i, x * 0.31 * wz * (1 + 0.1 * Math.max(0, -y)), y * 0.36 + hump + chest + rump - 0.02 * zz, zz * 1.02); } bg.computeVertexNormals();
  const body = shd(new THREE.Mesh(bg, hide)); body.position.set(0, 1.0, 0.0); g.add(body);
  const neck = new THREE.Group(); neck.position.set(0, 1.12, -0.85); g.add(neck); O.neck = neck;
  const nm = shd(new THREE.Mesh(taperTube([V3(0, 0.0, 0.2), V3(0, -0.02, -0.15), V3(0, -0.06, -0.42)], 0.24, 0.15, 10, 6, { wob: 0.02 }), hide)); neck.add(nm);
  const dew = sph(1, hide, 0.05, 0.22, 0.32, 10); dew.position.set(0, -0.24, -0.18); neck.add(dew);   // the dewlap
  const head = new THREE.Group(); head.position.set(0, -0.06, -0.48); neck.add(head); O.head = head;
  const skull = sph(1, hide, 0.13, 0.15, 0.17, 14); skull.position.set(0, 0.05, 0.0); head.add(skull);
  const face = shd(new THREE.Mesh(taperTube([V3(0, 0.04, -0.06), V3(0, -0.06, -0.2), V3(0, -0.17, -0.32)], 0.11, 0.085, 8, 5, { wob: 0.02 }), hide)); head.add(face);
  const muz = sph(1, SM({ color: '#3c2c1e' }), 0.085, 0.065, 0.06, 10); muz.position.set(0, -0.19, -0.34); head.add(muz);
  [-1, 1].forEach((sd) => { const e = sph(0.028, BM('#0b0a08')); e.position.set(sd * 0.13, 0.06, -0.08); head.add(e);
    const ear = sph(1, hide, 0.04, 0.16, 0.08, 8); ear.position.set(sd * 0.2, -0.04, 0.04); ear.rotation.z = sd * 1.0; head.add(ear);   // long drooping zebu ears
    const hp = [V3(sd * 0.1, 0.16, 0.03), V3(sd * 0.17, 0.21, 0.04), V3(sd * 0.2, 0.3, 0.02)], hm = shd(new THREE.Mesh(taperTube(hp, 0.03, 0.008, 6, 6), horn)); head.add(hm); });
  const tail = shd(new THREE.Mesh(taperTube([V3(0, 1.2, 1.02), V3(0, 1.0, 1.1), V3(0, 0.6, 1.1), V3(0, 0.45, 1.06)], 0.03, 0.015, 5, 6), hide)); g.add(tail); const tuft = sph(1, dark, 0.04, 0.09, 0.04, 8); tuft.position.set(0, 0.4, 1.06); g.add(tuft);
  // legs: [front-left, front-right, hind-left, hind-right]: upper + lower + hoof; poles: front joint forward, hind joint back
  [[0.17, -0.62, 0], [-0.17, -0.62, 0.5], [0.17, 0.75, 0.75], [-0.17, 0.75, 0.25]].forEach(([x, z, ph], k) => { const up = shd(new THREE.Mesh(UCYL, hide)), lo = shd(new THREE.Mesh(UCYL, hide)), kn = sph(1, hide), hoof = cyl(0.05, 0.06, 0.07, dark, 8); [up, lo, kn, hoof].forEach((m) => g.add(m));
    O.legs.push({ hip: V3(x, 0.92, z), front: k < 2, ph, up, lo, kn, hoof, L1: 0.42, L2: 0.46 }); });
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return O;
}
// pose an ox in its own local frame. dist: metres walked (gait), balk: 0..1 (head tossed up, weight back), stamp
function poseOx(O, dist, o = {}) {
  const C = 1.3, bk = o.balk ?? 0, t = TT + O.i * 0.7;
  O.legs.forEach((L) => { const f = mod(dist / C + L.ph, 1); let u, lift = 0;
    if (f < 0.3) { const k = ss(0, 1, f / 0.3); u = lerp(-0.35 * C, 0.35 * C, k); lift = 0.14 * Math.sin(Math.PI * k); } else u = lerp(0.35 * C, -0.35 * C, (f - 0.3) / 0.7);
    let fz = L.hip.z - u * 0.9 + (L.front ? -0.03 : 0.04) + bk * (L.front ? -0.12 : 0.05);
    if (o.stamp && L.front && L.hip.x * O.sd > 0) lift = Math.max(lift, 0.12 * Math.max(0, Math.sin(t * 7)) * o.stamp);
    const foot = V3(L.hip.x * 1.05, 0.05 + lift + (o.gy ? o.gy(L) : 0), fz), hip = L.hip.clone().add(V3(0, 0.02 * Math.sin(dist / C * TAU * 2) - bk * (L.front ? -0.02 : 0.06), 0));
    const { E, W } = twoBone(hip, foot, L.L1, L.L2, L.front ? V3(0, 0, -1) : V3(0, 0, 1)); L.E = E; L.W = W;
    between(L.up, hip, E, 0.085); between(L.lo, E, W, 0.045); L.kn.position.copy(E); L.kn.scale.setScalar(0.06); L.hoof.position.copy(W).add(V3(0, -0.015, 0)); });
  const bob = 0.02 * Math.sin(dist / C * TAU * 2 + O.i), nod = 0.08 * Math.sin(dist / C * TAU * 2 + 0.6 + O.i) * (1 - bk);
  O.neck.rotation.set(0.05 + nod - bk * (0.55 + 0.15 * Math.sin(t * 5.3)), (o.look ?? 0) + bk * 0.25 * Math.sin(t * 3.1 + O.i * 2), 0); O.neck.position.y = 1.12 + bob;
  O.head.rotation.set(0.2 - bk * 0.2, 0, bk * 0.15 * Math.sin(t * 4.2 + O.i));
}

// ---------------------------------------------------------------------
//  the hurricane lantern (lampião): tank, globe, wire guard, chimney cap, bail. Local: bail top at the origin, hanging down −y.
// ---------------------------------------------------------------------
function mkLantern(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); const tin = SM({ map: texMetal('tin', '#8e3a24'), metalness: 0.5, roughness: 0.4 }), wire = SM({ color: '#2b2219', metalness: 0.5 });
  const H = 0.36; const tank = cyl(0.075, 0.08, 0.07, tin, 14); tank.position.y = -H + 0.035; g.add(tank);
  Wd.globeM = SM({ color: '#f2c87a', emissive: '#e8a050', emissiveIntensity: 1.6, transparent: true, opacity: 0.92, roughness: 0.2 }); const globe = sph(1, Wd.globeM, 0.06, 0.085, 0.06, 14); globe.position.y = -H + 0.15; g.add(globe); globe.castShadow = false;
  const flame = sph(1, BM('#fff2c8'), 0.012, 0.03, 0.012, 8); flame.position.y = -H + 0.14; g.add(flame); Wd.flameLan = flame;
  for (let k = 0; k < 4; k++) { const a = (k / 4) * TAU + 0.4, w = cyl(0.004, 0.004, 0.2, wire, 4); w.position.set(Math.cos(a) * 0.068, -H + 0.16, Math.sin(a) * 0.068); g.add(w); }
  const cap = cyl(0.035, 0.07, 0.06, tin, 12); cap.position.y = -H + 0.27; g.add(cap); const top = cyl(0.02, 0.03, 0.03, tin, 8); top.position.y = -H + 0.31; g.add(top);
  const bail = shd(new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.004, 4, 16, Math.PI), wire)); bail.position.y = -0.085; g.add(bail);
  g.userData = { H, globe }; g.traverse((m) => { if (m.isMesh) m.castShadow = false; }); return g;   // its own light sits inside it: the tin parts must not shadow it (swinging shadows flickered)
}
function mkGoad(Wd) {   // the carreiro's goad: a long rod (local X), the grip at the origin, the iron point at +X
  const g = new THREE.Group(); Wd.scene.add(g); const r = 0.0155; const rod = cyl(r * 0.75, r, 2.3, SM({ map: texDeadBark('goad', '#7a6448') }), 7); rod.rotation.z = -Math.PI / 2; rod.position.x = 0.55; g.add(rod);
  const tip = cyl(0.003, 0.008, 0.06, SM({ color: '#848a8b', metalness: 0.6 }), 5); tip.rotation.z = -Math.PI / 2; tip.position.x = 1.73; g.add(tip); g.userData = { r }; return g;
}

// ---------------------------------------------------------------------
//  people: one point rig. kinds: 'man' (my grandfather), 'tiao', 'woman' (his mother), 'corpo' (the Corpo-Seco)
// ---------------------------------------------------------------------
const PDS = {
  man:   { torso: 0.5, shW: 0.19, hipW: 0.095, uArm: 0.29, fArm: 0.26, thigh: 0.44, shin: 0.43, headR: 0.105, hs: 1.0, fk: 1.0, fr: 1, ank: 0.085, gripR: 0.0155 },
  tiao:  { torso: 0.56, shW: 0.23, hipW: 0.11, uArm: 0.32, fArm: 0.29, thigh: 0.47, shin: 0.46, headR: 0.11, hs: 1.1, fk: 1.0, fr: 1.1, ank: 0.09, gripR: 0.016 },
  woman: { torso: 0.43, shW: 0.16, hipW: 0.095, uArm: 0.26, fArm: 0.23, thigh: 0.38, shin: 0.37, headR: 0.1, hs: 0.9, fk: 1.0, fr: 0.95, ank: 0.075, gripR: 0.014 },
  corpo: { torso: 0.6, shW: 0.155, hipW: 0.075, uArm: 0.45, fArm: 0.45, thigh: 0.56, shin: 0.56, headR: 0.1, hs: 1.2, fk: 1.85, fr: 0.62, ank: 0.07, gripR: 0.024 },
};
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
// the Corpo-Seco's head (+y crown, +z face, +x its left): a narrow skull with leather shrunk onto it, deep sockets with a
// glint far inside, a collapsed nose, the lips gone so the teeth show cheek to cheek; the lower jaw hinged (P.jaw)
function mkCorpoHead(P, skin, o = {}) {
  const Hd = P.H, sc = [0.078, 0.112, 0.097], dark = BM('#060403'), toothM = SM({ color: '#ffffff', roughness: 0.5 }), gum = SM({ color: o.bark ? '#4a4238' : '#2a120c' });
  const geo = new THREE.SphereGeometry(1, 48, 36), p = geo.attributes.position;
  const eyeD = [[-1, 0.15], [1, 0.11]].map(([sd, y]) => V3(sd * 0.4, y, 0.9).normalize());
  for (let i = 0; i < p.count; i++) { const v = V3(p.getX(i), p.getY(i), p.getZ(i)); let k = 1;
    k += 0.08 * Math.exp(-(1 - v.dot(V3(0, 0.75, -0.66).normalize())) * 3);   // a full back of the skull
    if (Math.abs(v.x) > 0.55 && v.y > -0.3 && v.y < 0.5) k -= 0.13 * ss(0.55, 0.9, Math.abs(v.x)) * (1 - Math.abs(v.y - 0.1) / 0.4);   // sunken temples
    [-1, 1].forEach((sd) => { k += 0.1 * Math.exp(-(1 - v.dot(V3(sd * 0.7, -0.12, 0.7).normalize())) * 24);   // cheekbones
      k -= 0.2 * Math.exp(-(1 - v.dot(V3(sd * 0.6, -0.48, 0.62).normalize())) * 12); });   // hollow cheeks
    eyeD.forEach((e) => { const c = v.dot(e); k -= 0.4 * Math.exp(-(1 - c) * 20) + 0.06 * Math.exp(-(1 - c) * 6); });   // deep sockets
    k += 0.07 * Math.exp(-(1 - v.dot(V3(0, 0.36, 0.93).normalize())) * 26);   // brow ridge
    k -= 0.2 * Math.exp(-(1 - v.dot(V3(0, -0.14, 1).normalize())) * 60);   // the nose collapsed into a hole
    if (v.z > 0.2 && v.y < -0.26 && v.y > -0.64) k -= 0.34 * ss(0.2, 0.55, v.z) * Math.sin(Math.PI * (v.y + 0.64) / 0.38);   // the mouth: the lips are gone
    k += 0.045 * (vn2(v.x * 3 + 7, v.y * 3 + v.z * 2) - 0.5);   // uneven, shrunken lumps
    let x = v.x * k, y = v.y * k, z = v.z * k;
    if (v.y < 0) x *= 1 - 0.28 * (-v.y) * ss(-0.2, 0.6, v.z);   // a narrow lower face
    if (v.y > 0.25 && v.z > 0.3) z *= 1 - 0.08 * ss(0.25, 0.8, v.y);   // a sloping forehead
    if (v.z > 0.1 && v.y < -0.47) { const f = ss(0.1, 0.5, v.z); y = lerp(y, Math.max(y, -0.52 - (v.y + 0.47) * 0.25), f); }   // below the mouth the face stops (the jaw takes over)
    p.setXYZ(i, x * sc[0], y * sc[1], z * sc[2]); }
  geo.computeVertexNormals();
  const sk = shd(new THREE.Mesh(geo, skin)); Hd.add(sk); P.skull = sk;
  const cav = sph(1, dark, 0.042, 0.02, 0.05, 12); cav.position.set(0, -0.047, 0.005); Hd.add(cav);   // the dark inside of the mouth, behind the teeth
  // sockets: a dark hollow and a tiny faint glint far inside each
  P.glints = []; eyeD.forEach((e) => { const pos = V3(e.x * sc[0] * 0.6, e.y * sc[1] * 0.6, e.z * sc[2] * 0.6); const hole = sph(0.022, dark, 1.2, 0.78, 0.5, 10); hole.position.copy(pos); hole.rotation.z = -e.x * 0.5; Hd.add(hole);
    const gl = sph(0.0028, BM('#3a2a1a'), 1, 1, 1, 6); gl.position.copy(pos).add(V3(0, 0.001, 0.011)); Hd.add(gl); P.glints.push(gl); });
  const nh = sph(0.013, dark, 0.75, 1.15, 0.55, 8); nh.position.set(0, -0.016, sc[2] * 0.8); Hd.add(nh);
  // teeth: an upper row hanging from the gum, the lower row on the jaw, both on the front arc of the mouth, inside it
  const tg = new THREE.BoxGeometry(1, 1, 1); tg.translate(0, -0.5, 0);
  const arc = (n, rx, rz, a0) => [...Array(n)].map((_, k) => { const a = lerp(-a0, a0, k / (n - 1)); return { x: rx * Math.sin(a), z: rz * Math.cos(a), a }; });
  const TC = ['#c8b890', '#b0a078', '#d4c8a0', '#8a7a58', '#5a4430'], up = arc(12, 0.05, 0.07, 1.05), U = IM(tg, toothM, up.length); up.forEach((t, k) => { const big = 1 - 0.35 * Math.abs(t.a) / 1.05, gone = k === 3 || k === 9 ? 0.35 : 1; U.setMatrixAt(k, M4c(t.x, -0.033, t.z + 0.004, t.a + 0.06 * (hsh(k, 2) - 0.5), 0.0078 * big, (0.019 * big + 0.005 * hsh(k, 4)) * gone, 0.0065)); U.setColorAt(k, lin(o.bark ? '#a8a296' : TC[Math.floor(hsh(k, 9) * 4.99)])); }); Hd.add(U);
  const ug = shd(new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.006, 4, 20, 2.3), gum)); ug.rotation.set(Math.PI / 2, 0, Math.PI / 2 - 1.15); ug.scale.set(0.74, 1.06, 1); ug.position.set(0, -0.032, 0.0); Hd.add(ug);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.036, -0.012); jaw.rotation.z = 0.05; Hd.add(jaw); P.jaw = jaw;
  const jg = new THREE.SphereGeometry(1, 24, 16), jp = jg.attributes.position; for (let i = 0; i < jp.count; i++) { const y = jp.getY(i), z = jp.getZ(i); jp.setXYZ(i, jp.getX(i) * (0.058 - 0.012 * ss(0, 1, z)), Math.min(0, y) * 0.05 - 0.016, z * 0.078 + 0.01); } jg.computeVertexNormals();
  const jm = shd(new THREE.Mesh(jg, skin)); jaw.add(jm);
  const lo = arc(11, 0.046, 0.064, 1.0), Lm = IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), toothM, lo.length); lo.forEach((t, k) => { const big = 1 - 0.3 * Math.abs(t.a); Lm.setMatrixAt(k, M4c(t.x, -0.019, t.z + 0.012, t.a + 0.08 * (hsh(k, 5) - 0.5), 0.0072 * big, (0.015 * big + 0.004 * hsh(k, 7)) * (k === 6 ? 0.3 : 1), 0.006)); Lm.setColorAt(k, lin(o.bark ? '#a8a296' : TC[Math.floor(hsh(k, 11) * 4.99)])); }); jaw.add(Lm);
  const lg = shd(new THREE.Mesh(new THREE.TorusGeometry(0.063, 0.005, 4, 20, 2.2), gum)); lg.rotation.set(Math.PI / 2, 0, Math.PI / 2 - 1.1); lg.scale.set(0.74, 1.08, 1); lg.position.set(0, -0.017, 0.012); jaw.add(lg);
  // shrivelled ears, a few long stringy hairs
  [-1, 1].forEach((sd) => { const e = sph(1, skin, 0.006, 0.02, 0.012, 8); e.position.set(sd * 0.074, -0.01, -0.01); e.rotation.z = sd * 0.2; Hd.add(e); });
  if (!o.bark) { const hm = SM({ color: '#1a140e' }), HR = RNG('hair', 1); for (let k = 0; k < 13; k++) { const a = Math.PI + HR.r(-1.7, 1.7), st = V3(Math.sin(a) * 0.065, 0.06 + HR.r(0, 0.03), Math.cos(a) * 0.07 - 0.01), L = HR.r(0.12, 0.3);
      const h = shd(new THREE.Mesh(taperTube([st, st.clone().add(V3(Math.sin(a) * 0.04, -0.02, -0.03)), st.clone().add(V3(Math.sin(a) * 0.06 + HR.n(0.02), -L, -0.05))], 0.0022, 0.0012, 3, 4), hm)); Hd.add(h); } }
}
// my grandfather's head (+y crown, +z face): a lean weathered skull with a brow ridge, cheekbones and a hollow under them,
// a long nose, ears; eyes in their sockets with lids; grey brows; a thick grey moustache; a mouth that can open (fear)
function mkManHead(P, skin, o = {}) {
  const Hd = P.H, sc = [0.086, 0.11, 0.098], U = {}; P.face = U;
  const geo = new THREE.SphereGeometry(1, 40, 30), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const v = V3(p.getX(i), p.getY(i), p.getZ(i)); let k = 1;
    k += 0.07 * Math.exp(-(1 - v.dot(V3(0, 0.32, 0.95).normalize())) * 18);   // brow ridge
    [-1, 1].forEach((sd) => { k -= 0.07 * Math.exp(-(1 - v.dot(V3(sd * 0.38, 0.14, 0.92).normalize())) * 30);   // eye sockets
      k += 0.06 * Math.exp(-(1 - v.dot(V3(sd * 0.66, -0.08, 0.75).normalize())) * 22);   // cheekbones
      k -= 0.07 * Math.exp(-(1 - v.dot(V3(sd * 0.58, -0.45, 0.68).normalize())) * 14); });   // hollow cheeks
    let x = v.x * k, y = v.y * k, z = v.z * k;
    if (v.y < -0.2) { x *= 1 - 0.18 * (-v.y - 0.2); }   // a narrower jaw
    if (v.y < -0.55 && v.z > 0.3) z += 0.08 * (v.z - 0.3);   // the chin
    p.setXYZ(i, x * sc[0], y * sc[1], z * sc[2]); }
  geo.computeVertexNormals();
  const sk = shd(new THREE.Mesh(geo, skin)); Hd.add(sk); P.skull = sk;
  const dark = BM('#0d0806'), skinF = o.featM || skin, white = SM({ color: o.bark ? '#a8a296' : '#e4dccb', roughness: 0.4 }), iris = BM(o.bark ? '#1a120c' : '#2a1a10'), hairM = SM({ color: o.bark ? '#8a8478' : '#9a968c', roughness: 0.8 });
  // nose: a long bony wedge
  const nose = sph(1, skinF, 0.012, 0.03, 0.02, 10); nose.position.set(0, -0.016, sc[2] * 0.96); nose.rotation.x = -0.35; Hd.add(nose);
  const tip = sph(0.0105, skinF, 1.15, 0.85, 1); tip.position.set(0, -0.036, sc[2] * 1.11); Hd.add(tip);
  [-1, 1].forEach((sd) => { const nl = sph(0.007, skinF, 1, 0.8, 1); nl.position.set(sd * 0.012, -0.04, sc[2] * 1.04); Hd.add(nl); });
  // eyes: sclera + iris in the sockets, upper and lower lids, grey brows
  U.lids = []; U.brows = []; U.eyes = [];
  [-1, 1].forEach((sd) => { const c = V3(sd * 0.031, 0.014, sc[2] * 0.83); const sock = sph(0.017, SM({ color: o.bark ? '#3a2a1e' : '#3a2214', roughness: 0.9 }), 1.35, 0.95, 0.45, 12); sock.position.copy(c).add(V3(0, 0.001, -0.004)); Hd.add(sock);   // a dark, sunken socket
    const e = sph(0.0085, white, 1.35, 0.72, 0.62, 12); e.position.copy(c); Hd.add(e); U.eyes.push(e);
    const ir = sph(0.0046, iris, 1, 1, 0.5, 10); ir.position.copy(c).add(V3(0, 0, 0.0056)); Hd.add(ir);
    const lid = new THREE.Group(); lid.position.copy(c); Hd.add(lid); const lm = shd(new THREE.Mesh(new THREE.SphereGeometry(0.0128, 12, 6, 0, TAU, 0, Math.PI / 2), skinF)); lm.scale.set(1.25, 1, 0.75); lid.add(lm); U.lids.push(lid);
    const ll = shd(new THREE.Mesh(new THREE.SphereGeometry(0.0125, 12, 6, 0, TAU, Math.PI / 2 + 0.6, Math.PI / 2 - 0.6), skinF)); ll.scale.set(1.25, 1, 0.75); ll.position.copy(c); Hd.add(ll);
    const br = new THREE.Group(); br.position.set(sd * 0.031, 0.034, sc[2] * 0.9); Hd.add(br); const bm = shd(new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.0045, 0.008), hairM)); bm.rotation.z = -sd * 0.12; br.add(bm); U.brows.push(br);
    const ear = sph(1, skinF, 0.008, 0.026, 0.016, 8); ear.position.set(sd * 0.088, -0.004, -0.006); Hd.add(ear); });
  // the mouth: a dark opening whose height follows fear, the lower lip and a few teeth; the moustache over it
  const mouth = new THREE.Group(); mouth.position.set(0, -0.058, sc[2] * 0.86); Hd.add(mouth); U.mouth = mouth;
  const cav = sph(1, dark, 0.017, 0.01, 0.006, 10); mouth.add(cav); U.cav = cav;
  const lip = shd(new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.0035, 4, 12, Math.PI), skinF)); lip.rotation.z = Math.PI; mouth.add(lip); U.lip = lip;
  const teeth = bx(0.02, 0.005, 0.004, SM({ color: o.bark ? '#a8a296' : '#c8b890' }), 0, 0.006, 0.002, mouth); U.teeth = teeth;
  const mc = new THREE.CatmullRomCurve3([V3(-0.03, -0.062, sc[2] * 0.82), V3(-0.016, -0.046, sc[2] * 0.93), V3(0, -0.044, sc[2] * 0.96), V3(0.016, -0.046, sc[2] * 0.93), V3(0.03, -0.062, sc[2] * 0.82)]);
  const mus = shd(new THREE.Mesh(new THREE.TubeGeometry(mc, 16, 0.0062, 6, false), hairM)); mus.scale.set(1, 1, 1); Hd.add(mus); U.mus = mus;
  [-1, 1].forEach((sd) => { const e = sph(0.0062, hairM); e.position.set(sd * 0.03, -0.062, sc[2] * 0.82); Hd.add(e); });
  return U;
}
// expression: fear 0..1 (eyes wide, brows up, mouth open)
function faceExpr(P, fear) { const U = P.face; if (!U) return; const f = clamp(fear);
  U.lids.forEach((l) => { l.rotation.x = lerp(-0.1, -0.32, f); });   // the upper lid stays half over the iris; fear shows in the brows and the mouth
  U.brows.forEach((b, i) => { b.position.y = 0.032 + 0.005 * f; b.rotation.z = (i ? -1 : 1) * 0.42 * f; });
  U.cav.scale.set(0.017 + 0.002 * f, 0.004 + 0.013 * f, 0.006); U.cav.position.y = -0.008 * f; U.lip.position.y = -0.002 - 0.017 * f; U.teeth.visible = f > 0.3; }
function mkPerson(kind, o = {}) {
  const pd = Object.assign({}, PDS[kind]), R = RNG('person', o.seed ?? 0), g = new THREE.Group(), P = { kind, pd, g, o };
  const corpo = kind === 'corpo';
  const skin = corpo ? SM({ map: texLeather(), color: '#d0b89a', roughness: 0.8 }) : kind === 'man' ? SM({ map: texOldSkin(), color: '#ffffff', roughness: 0.75 }) : SM({ map: texFaceOf(kind), color: '#ffffff', roughness: 0.75 });
  const skinB = corpo ? skin : SM({ color: kind === 'woman' ? '#9a6a48' : kind === 'tiao' ? '#5a3c28' : '#8a5c3a', roughness: 0.75 }), nail = SM({ color: corpo ? '#141008' : '#c09a80', roughness: 0.4 });
  let top, legs;
  if (kind === 'man') { top = SM({ map: texCloth('shirt', '#c8bca0') }); legs = SM({ map: texCloth('trou', '#4a3a2a') }); }
  else if (kind === 'tiao') { top = SM({ map: texCloth('tshirt', '#7a5236') }); legs = SM({ map: texCloth('ttrou', '#3c3a34') }); }
  else if (kind === 'woman') { top = SM({ map: texCloth('dress', '#26304a', { flower: ['#8e3a24', '#cfae78', '#5a2418'] }) }); legs = skinB; }
  else { top = skin; legs = skin; }
  P.mat = { skin, skinB, top, legs };
  const T = new THREE.Group(); g.add(T); P.T = T;
  if (corpo) {   // a narrow rib cage over a pinched belly, protruding hip bones, collar bones, spine knobs, a burial rag at the waist
    const ch = capsule(0.088, 0.2, skin, 12); ch.scale.set(1.25, 1, 0.82); ch.position.y = pd.torso * 0.66; T.add(ch); P.chest = ch;
    const belly = capsule(0.06, 0.16, skin, 10); belly.scale.set(1.15, 1, 0.75); belly.position.set(0, 0.17, -0.012); T.add(belly);
    const pel = sph(1, skin, 0.105, 0.065, 0.075, 12); pel.position.y = 0.02; T.add(pel);
    [-1, 1].forEach((sd) => { const crest = sph(1, skin, 0.03, 0.022, 0.04, 8); crest.position.set(sd * 0.085, 0.07, 0.015); T.add(crest);
      for (let k = 0; k < 8; k++) { const y = pd.torso * 0.86 - k * 0.036, a = 0.128 - Math.abs(k - 3) * 0.006, b = 0.082 - Math.abs(k - 3) * 0.004, pts = [];
        for (let q = 0; q <= 8; q++) { const th = lerp(0.32, 2.95, q / 8); pts.push(V3(sd * a * Math.sin(th), y - 0.05 * (1 - q / 8) * (k > 4 ? 0.6 : 1) + 0.01 * q / 8, b * Math.cos(th))); }
        T.add(shd(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.0085, 4, false), skin))); }
      const cl = shd(new THREE.Mesh(UCYL1, skin)); between(cl, V3(sd * 0.02, pd.torso - 0.03, 0.07), V3(sd * (pd.shW - 0.01), pd.torso - 0.01, 0.015), 0.011); T.add(cl);
      const sb = sph(1, skin, 0.06, 0.08, 0.025, 10); sb.position.set(sd * 0.075, pd.torso * 0.78, -0.07); sb.rotation.z = sd * 0.25; T.add(sb); });
    const ster = bx(0.022, 0.17, 0.014, skin, 0, pd.torso * 0.72, 0.078, T); void ster;
    for (let k = 0; k < 10; k++) { const kn = sph(0.014, skin, 1, 0.8, 1); kn.position.set(0, 0.1 + k * 0.05, -0.068 - (k > 5 ? 0.008 : 0)); T.add(kn); }
    const ragM = SM({ map: texCloth('burial', '#3c2c1e'), alphaMap: texRag('burial'), alphaTest: 0.5, side: THREE.DoubleSide });
    const rag = shd(new THREE.Mesh(new THREE.LatheGeometry([[0.11, 0.12], [0.12, 0.04], [0.135, -0.06], [0.15, -0.16]].map(([r, y]) => new THREE.Vector2(r, y)), 18), ragM)); rag.scale.set(1, 1, 0.8); T.add(rag);
  } else if (kind === 'woman') {
    const ch = capsule(0.12, pd.torso - 0.24, top, 12); ch.scale.set(1.15, 1, 0.82); ch.position.y = pd.torso * 0.55; T.add(ch); P.chest = ch;
    const pel = sph(0.14, top, 1.1, 0.7, 0.9); pel.position.y = 0.03; T.add(pel);
  } else {
    const big = kind === 'tiao' ? 1.18 : 1; const ch = capsule(0.15 * big, pd.torso - 0.23, top, 12); ch.scale.set(1.2, 1, 0.78); ch.position.y = pd.torso * 0.56; T.add(ch); P.chest = ch;
    const pel = sph(0.15 * big, legs, 1.12, 0.72, 0.85); pel.position.y = 0.03; T.add(pel); const belt = cyl(0.152 * big, 0.152 * big, 0.035, SM({ color: '#2b2219' }), 14); belt.scale.set(1.13, 1, 0.84); T.add(belt);
    const col = cyl(0.07, 0.08, 0.04, top, 12); col.position.y = pd.torso; T.add(col);
    if (kind === 'man') for (let k = 0; k < 4; k++) { const b = sph(0.006, SM({ color: '#d3d6cc' })); b.position.set(0, pd.torso * (0.32 + k * 0.16), 0.115 * big); T.add(b); }
  }
  const Hd = new THREE.Group(); g.add(Hd); P.H = Hd;
  if (corpo) mkCorpoHead(P, skin);
  else if (kind === 'man') { mkManHead(P, skin);
    const straw = SM({ map: texStraw(), color: '#e0d0a8' }), brim = cyl(0.21, 0.21, 0.012, straw, 24); brim.position.y = 0.055; Hd.add(brim);
    const crown = cyl(0.085, 0.105, 0.11, straw, 18); crown.position.y = 0.11; Hd.add(crown); const band = cyl(0.106, 0.106, 0.022, SM({ color: '#2b2219' }), 18); band.position.y = 0.07; Hd.add(band); P.hat = [brim, crown, band];
    const hair = sph(0.1, SM({ color: '#9a968a' }), 0.95, 0.6, 0.95); hair.position.set(0, 0.0, -0.035); Hd.add(hair); }
  else { const sk = shd(new THREE.Mesh(new THREE.SphereGeometry(pd.headR, 28, 20), skin)); sk.scale.set(0.9, 1.06, 0.98); sk.rotation.y = -Math.PI / 2; Hd.add(sk); P.skull = sk;
    const nose = sph(1, skinB, 0.014, 0.022, 0.02, 8); nose.position.set(0, -0.01, pd.headR * 0.98); Hd.add(nose);
    [-1, 1].forEach((sd) => { const e = sph(0.022, skinB, 0.5, 1, 0.8); e.position.set(sd * pd.headR * 0.9, 0, -0.005); Hd.add(e); });
    if (kind === 'man' || kind === 'tiao') {   // the straw hat
      const straw = SM({ map: texStraw(), color: kind === 'tiao' ? '#6a5a40' : '#e0d0a8' }), brim = cyl(0.21, 0.21, 0.012, straw, 24); brim.position.y = 0.055; Hd.add(brim);
      const crown = cyl(0.085, 0.105, 0.11, straw, 18); crown.position.y = 0.11; Hd.add(crown); const band = cyl(0.106, 0.106, 0.022, SM({ color: '#2b2219' }), 18); band.position.y = 0.07; Hd.add(band); P.hat = [brim, crown, band];
      const hair = sph(0.1, SM({ color: kind === 'man' ? '#6a665e' : '#16110c' }), 0.95, 0.6, 0.95); hair.position.set(0, 0.0, -0.03); Hd.add(hair); }
    else { const scarf = SM({ map: texCloth('scarf', '#8e3a24', { flower: ['#cfae78', '#26304a'] }) }), sc = sph(0.108, scarf, 0.98, 0.95, 1.0); sc.position.set(0, 0.025, -0.02); Hd.add(sc);
      const knot = sph(0.03, scarf, 1.2, 0.8, 1); knot.position.set(0, -0.06, -0.1); Hd.add(knot); }
  }
  P.neck = { c: shd(new THREE.Mesh(UCYL1, skinB)) }; g.add(P.neck.c);
  if (corpo) P.neck.t = [-1, 1].map(() => { const t = shd(new THREE.Mesh(UCYL1, skin)); g.add(t); return t; });
  const armR = corpo ? [0.026, 0.02, 0.034, 0.03] : kind === 'tiao' ? [0.07, 0.056, 0.075, 0.06] : kind === 'woman' ? [0.05, 0.04, 0.055, 0.045] : [0.056, 0.046, 0.062, 0.05];
  P.armR = armR;
  P.arm = [1, -1].map((sd) => ({ sd, up: shd(new THREE.Mesh(UCYL, top)), fo: shd(new THREE.Mesh(UCYL, corpo ? skin : kind === 'woman' ? skinB : top)), sj: sph(1, top), ej: sph(1, corpo ? skin : top), hand: mkHand(P, sd === 1 ? -1 : 1, skinB, nail) }));
  P.arm.forEach((a) => [a.up, a.fo, a.sj, a.ej].forEach((m) => g.add(m)));
  if (!corpo && kind !== 'woman') P.arm.forEach((a) => { a.cuff = cyl(1, 1, 1, top, 10); g.add(a.cuff); });
  const mkFoot = () => { const fg = new THREE.Group(); g.add(fg);
    if (corpo) { const ft = capsule(0.024, 0.17, skin, 6); ft.rotation.x = Math.PI / 2; ft.scale.set(1.2, 1, 0.7); ft.position.set(0, -0.045, 0.06); fg.add(ft); for (let k = 0; k < 5; k++) { const t = capsule(0.007, 0.03, skin, 4); t.rotation.x = Math.PI / 2 + 0.3; t.position.set(-0.024 + k * 0.012, -0.055, 0.17 + (k === 1 ? 0.01 : 0) - Math.abs(k - 1.5) * 0.008); fg.add(t); } const hl = sph(0.022, skin); hl.position.set(0, -0.05, -0.03); fg.add(hl); }
    else if (kind === 'woman') { const sh = sph(1, SM({ color: '#2b2219' }), 0.04, 0.03, 0.11, 10); sh.position.set(0, -0.05, 0.05); fg.add(sh); }
    else { const boot = SM({ color: '#3c2c1e', roughness: 0.6 }); bx(0.1, 0.025, 0.27, SM({ color: '#16110c' }), 0, -0.072, 0.05, fg); bx(0.095, 0.075, 0.24, boot, 0, -0.03, 0.04, fg); const toe = sph(0.048, boot, 1, 0.65, 1.1); toe.position.set(0, -0.045, 0.14); fg.add(toe); const hi = cyl(0.052, 0.055, 0.12, boot, 10); hi.position.set(0, 0.03, -0.01); fg.add(hi); }
    return fg; };
  P.leg = [1, -1].map((sd) => ({ sd, th: shd(new THREE.Mesh(UCYL, legs)), sh: shd(new THREE.Mesh(UCYL, kind === 'woman' ? skinB : legs)), kj: sph(1, legs), foot: mkFoot() }));
  P.leg.forEach((l) => [l.th, l.sh, l.kj].forEach((m) => g.add(m)));
  if (kind === 'woman') { const L = [[0.14, 0.02], [0.17, -0.12], [0.22, -0.5], [0.25, -0.82]]; P.skirt = shd(new THREE.Mesh(new THREE.LatheGeometry(L.map(([r, y]) => new THREE.Vector2(r, y)).reverse(), 20), SM({ map: texCloth('dress2', '#26304a', { flower: ['#8e3a24', '#cfae78', '#5a2418'] }), side: THREE.DoubleSide }))); g.add(P.skirt); }
  if (kind === 'man' || kind === 'tiao') P.leg.forEach((l) => { l.cuffL = cyl(1, 1, 1, legs, 10); g.add(l.cuffL); });
  return P;
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
    const lr = corpo ? [0.036, 0.028, 0.042] : kind3(P) ? [0.085, 0.065, 0.075] : [0.068, 0.054, 0.062];
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
//  the farmhouse room (taipa, beams, tiles, an oil lamp), set at HOUSE
// ---------------------------------------------------------------------
const HOUSE = V3(400, 0, 0), ROOM = { w: 5.2, d: 4.2, h: 2.7 };
function mkHouse(Wd) {
  const g = new THREE.Group(); g.position.copy(HOUSE); Wd.scene.add(g); Wd.house = g; const adobe = SM({ map: texAdobe() }), beamM = SM({ map: texDeadBark('beam', '#4a3828'), color: '#a09080' }), wood = SM({ map: texPlank('furn', '#5a4430') });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), SM({ map: texSoil(), color: '#8a7a68' })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
  [[0, ROOM.h / 2, -ROOM.d / 2, 0, ROOM.w], [-ROOM.w / 2, ROOM.h / 2, 0, Math.PI / 2, ROOM.d], [ROOM.w / 2, ROOM.h / 2, 0, -Math.PI / 2, ROOM.d], [0, ROOM.h / 2, ROOM.d / 2, Math.PI, ROOM.w]].forEach(([x, y, z, ry, w], k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, ROOM.h), adobe); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; m.castShadow = k === 3; g.add(m); });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), SM({ map: texTile(), color: '#4a3a30', side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = ROOM.h + 0.25; g.add(ceil);
  for (let k = 0; k < 6; k++) { const b = cyl(0.07, 0.08, ROOM.d, beamM, 7); b.rotation.x = Math.PI / 2; b.position.set(-ROOM.w / 2 + 0.4 + k * 0.88, ROOM.h + 0.05, 0); g.add(b); }
  const ridge = cyl(0.11, 0.11, ROOM.w, beamM, 8); ridge.rotation.z = Math.PI / 2; ridge.position.set(0, ROOM.h + 0.18, 0); g.add(ridge);
  // the table with the oil lamp (lamparina), a bench, a stool knocked over
  const tbl = new THREE.Group(); tbl.position.set(-1.45, 0, 0.75); g.add(tbl); bx(1.2, 0.06, 0.7, wood, 0, 0.76, 0, tbl); [[-0.52, -0.28], [0.52, -0.28], [-0.52, 0.28], [0.52, 0.28]].forEach(([x, z]) => bx(0.06, 0.74, 0.06, wood, x, 0.37, z, tbl));
  bx(1.1, 0.05, 0.28, wood, 0, 0.44, 0.62, tbl); [[-0.45], [0.45]].forEach(([x]) => bx(0.05, 0.42, 0.24, wood, x, 0.21, 0.62, tbl));
  const stool = new THREE.Group(); stool.position.set(1.4, 0.16, -0.85); stool.rotation.set(0, 0.6, Math.PI / 2 - 0.15); g.add(stool); bx(0.34, 0.04, 0.34, wood, 0, 0.42, 0, stool); [[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]].forEach(([x, z]) => bx(0.035, 0.42, 0.035, wood, x, 0.21, z, stool));
  const tin = SM({ map: texMetal('lamp', '#5e615a'), metalness: 0.5 }), lampP = V3(-1.2, 0.79, 0.62);
  const lb = cyl(0.04, 0.05, 0.08, tin, 10); lb.position.copy(lampP).add(V3(0, 0.04, 0)); g.add(lb); const sp = cyl(0.006, 0.01, 0.06, tin, 6); sp.position.copy(lampP).add(V3(0, 0.11, 0)); g.add(sp);
  const fl = sph(1, BM('#ffe0a0'), 0.012, 0.035, 0.012, 8); fl.position.copy(lampP).add(V3(0, 0.165, 0)); g.add(fl); Wd.houseFlame = fl;
  Wd.lampP = lampP.clone().add(HOUSE).add(V3(0, 0.17, 0));
  [[0.4, -0.1, 0.05], [-0.35, 0.15, 0.08]].forEach(([x, z, r]) => { const c = cyl(r, r * 0.9, r * 1.4, SM({ color: '#8e3a24' }), 10); c.position.set(x, 0.79 + r * 0.7, z); tbl.add(c); });   // clay cups
  // the stove (fogão a lenha) against the back wall: an adobe block, iron plate, pots; firewood
  const st = bx(1.4, 0.8, 0.7, adobe, 1.6, 0.4, -ROOM.d / 2 + 0.36, g); void st; bx(1.3, 0.04, 0.6, SM({ color: '#16110c', metalness: 0.5 }), 1.6, 0.82, -ROOM.d / 2 + 0.36, g);
  [[1.25, 0.12, 0.16], [1.8, 0.1, 0.12]].forEach(([x, r, h]) => { const p = cyl(r, r * 0.85, h, SM({ color: '#2b2219', metalness: 0.4 }), 12); p.position.set(x, 0.84 + h / 2, -ROOM.d / 2 + 0.36); g.add(p); });
  for (let k = 0; k < 7; k++) { const f = cyl(0.04, 0.04, 0.7, SM({ map: texDeadBark() }), 6); f.rotation.set(Math.PI / 2, 0, 0.2 * (k % 3)); f.position.set(2.2 + (k % 2) * 0.06, 0.05 + Math.floor(k / 2) * 0.07, -1.0 + (k % 3) * 0.04); g.add(f); }
  // the wall altar: a saint's print, a crucifix, a shelf with gourds; dried corn and garlic hanging from a beam; a closed shutter
  const saint = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), SM({ map: txCanvas('saint', 32, 48, (x, w, h, R) => { x.fillStyle = '#2b2219'; x.fillRect(0, 0, w, h); x.fillStyle = '#cfae78'; x.fillRect(3, 3, w - 6, h - 6); x.fillStyle = '#26304a'; x.beginPath(); x.moveTo(w / 2, 10); x.lineTo(w - 7, h - 5); x.lineTo(7, h - 5); x.fill(); x.fillStyle = '#d4c8a0'; x.beginPath(); x.arc(w / 2, 11, 4, 0, TAU); x.fill(); x.strokeStyle = '#c8a050'; x.beginPath(); x.arc(w / 2, 11, 7, 0, TAU); x.stroke(); }) }));
  saint.position.set(-0.3, 1.75, -ROOM.d / 2 + 0.01); g.add(saint);
  const cr = new THREE.Group(); cr.position.set(0.25, 1.85, -ROOM.d / 2 + 0.02); g.add(cr); bx(0.03, 0.3, 0.02, wood, 0, 0, 0, cr); bx(0.18, 0.03, 0.02, wood, 0, 0.06, 0, cr);
  bx(0.9, 0.04, 0.22, wood, -0.1, 1.45, -ROOM.d / 2 + 0.11, g); [[-0.4, 0.07], [-0.2, 0.06], [0.15, 0.08]].forEach(([x, r]) => { const gd = sph(r, SM({ color: '#a07c50' }), 1, 1.2, 1); gd.position.set(x, 1.47 + r, -ROOM.d / 2 + 0.11); g.add(gd); });
  for (let k = 0; k < 5; k++) { const c = sph(1, SM({ color: '#c8a050', map: texStraw() }), 0.045, 0.12, 0.045, 8); c.position.set(-1.9 + k * 0.12, ROOM.h - 0.2 - (k % 2) * 0.05, -0.5); c.rotation.z = (k - 2) * 0.12; g.add(c); }
  const sh = bx(0.8, 0.9, 0.05, SM({ map: texPlank('shut', '#3c2c1e') }), -ROOM.w / 2 + 0.03, 1.45, 0.6, g); sh.rotation.y = Math.PI / 2;
  const door = bx(0.9, 2.0, 0.05, SM({ map: texPlank('door', '#3c2c1e') }), 1.3, 1.0, ROOM.d / 2 - 0.03, g); void door;
  return g;
}

// ---------------------------------------------------------------------
//  the chapel and its cemetery, set at CHAPEL (the chapel faces +z; the cemetery is in front-left of it)
// ---------------------------------------------------------------------
const CHAPEL = V3(-400, 0, 0), GRAVE = V3(-401.2, 0, 7.4);   // the open grave (world)
const cemH = (x, z) => { const lx = x - CHAPEL.x, lz = z - CHAPEL.z; return (fbm2(lx * 0.1, lz * 0.1) - 0.5) * 0.25 * ss(4, 10, Math.hypot(lx + 1, lz - 8)) + 1.5 * ss(25, 60, Math.hypot(lx, lz)); };
function mkChapel(Wd) {
  const g = new THREE.Group(); g.position.copy(CHAPEL); Wd.scene.add(g); Wd.chapel = g; const lime = SM({ map: texLime() }), tile = SM({ map: texTile() }), wood = SM({ map: texPlank('chd', '#3c2c1e') });
  const xs = gridAxis(-60, 60, [[-14, 14]], 0.5, 3).map((v) => v + CHAPEL.x), zs = gridAxis(-50, 70, [[-6, 22]], 0.5, 3);
  const hole = (x, z) => Math.abs(x - GRAVE.x) < 0.45 && Math.abs(z - GRAVE.z) < 1.05;
  const gr = heightMesh(xs, zs, (x, z) => (hole(x, z) ? -1.1 : cemH(x, z)), (x, z) => lin('#7a5a3a').lerp(lin('#5a4a30'), fbm2(x * 0.3, z * 0.3)), SM({ map: texSoil(), vertexColors: true, color: '#d8d0c0' }));
  Wd.scene.add(gr);
  // the open grave: four dirt walls and a dark bottom; the mound of dug earth beside it
  const dirt = SM({ map: texSoil(), color: '#6a5034' }); [[0, -1.0, 0.9, 1.0], [0, 1.0, 0.9, 1.0]].forEach(([dx, dz, w]) => { const m = bx(w, 1.1, 0.04, dirt, GRAVE.x + dx - CHAPEL.x, -0.5, GRAVE.z + dz - CHAPEL.z, g); void m; });
  [-0.44, 0.44].forEach((dx) => bx(0.04, 1.1, 2.0, dirt, GRAVE.x + dx - CHAPEL.x, -0.5, GRAVE.z - CHAPEL.z, g)); bx(0.9, 0.04, 2.0, SM({ color: '#120d09' }), GRAVE.x - CHAPEL.x, -1.0, GRAVE.z - CHAPEL.z, g);
  const mound = sph(1, dirt, 0.7, 0.35, 1.2, 14); mound.position.set(GRAVE.x - CHAPEL.x + 1.15, 0.0, GRAVE.z - CHAPEL.z - 0.2); g.add(mound); Wd.mound = mound;
  const shovel = new THREE.Group(); shovel.position.set(GRAVE.x - CHAPEL.x + 1.3, 0.25, GRAVE.z - CHAPEL.z - 0.4); shovel.rotation.set(0.3, 0.4, -0.5); g.add(shovel); const sh1 = cyl(0.018, 0.018, 1.2, wood, 6); sh1.position.y = 0.6; shovel.add(sh1); bx(0.22, 0.28, 0.02, SM({ color: '#3f4542', metalness: 0.5 }), 0, -0.1, 0, shovel);
  // the nave, gable, belfry; door, round window; cross; tiled roof
  const nave = bx(5.2, 4.2, 8.5, lime, 0, 2.1, -4.2, g); void nave;
  const gab = new THREE.Shape(); gab.moveTo(-2.75, 0); gab.lineTo(2.75, 0); gab.lineTo(0, 2.2); gab.lineTo(-2.75, 0); const gm = shd(new THREE.Mesh(new THREE.ExtrudeGeometry(gab, { depth: 0.3, bevelEnabled: false }), lime)); gm.position.set(0, 4.2, 0.02); g.add(gm);
  [-1, 1].forEach((sd) => { const r = bx(3.4, 0.08, 9.2, tile, sd * 1.45, 5.25, -4.2, g); r.rotation.z = -sd * 0.68; });
  bx(0.24, 4.4, 0.24, lime, -2.62, 2.2, 0.2, g); bx(0.24, 4.4, 0.24, lime, 2.62, 2.2, 0.2, g); bx(5.6, 0.2, 0.34, lime, 0, 4.25, 0.2, g);
  const door = bx(1.3, 2.4, 0.06, wood, 0, 1.2, 0.04, g); void door; bx(1.6, 0.18, 0.12, lime, 0, 2.5, 0.06, g);
  const win = new THREE.Mesh(new THREE.CircleGeometry(0.42, 18), SM({ color: '#16110c' })); win.position.set(0, 5.0, 0.33); g.add(win);
  const crs = new THREE.Group(); crs.position.set(0, 6.55, 0.15); g.add(crs); bx(0.1, 0.9, 0.1, wood, 0, 0, 0, crs); bx(0.55, 0.1, 0.1, wood, 0, 0.15, 0, crs);
  const bel = new THREE.Group(); bel.position.set(3.4, 0, -1.2); g.add(bel); bx(1.4, 5.8, 1.4, lime, 0, 2.9, 0, bel); const opening = bx(0.8, 1.0, 1.46, SM({ color: '#16110c' }), 0, 4.9, 0, bel); void opening; const bell = sph(0.28, SM({ color: '#5e5a40', metalness: 0.6 }), 1, 1.1, 1); bell.position.set(0, 4.85, 0.3); bel.add(bell); Wd.bell = bell;
  const capr = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.2, 4), tile); capr.position.set(0, 6.4, 0); capr.rotation.y = Math.PI / 4; bel.add(capr); const bc = new THREE.Group(); bc.position.set(0, 7.25, 0); bel.add(bc); bx(0.06, 0.5, 0.06, wood, 0, 0, 0, bc); bx(0.3, 0.06, 0.06, wood, 0, 0.1, 0, bc);
  // the cemetery wall (limewashed, low), its iron gate, graves: wooden crosses, small tombs with crosses, mounds; a dead tree
  const wallM = lime; [[-8, 18, 0, 10, 26], [8, 18, 0, 10, 26]].forEach(() => {}); const W0 = [-9.5, 9.5], Z0 = [-1.5, 19];
  [[W0[0], Z0[0], W0[0], Z0[1]], [W0[1], Z0[0], W0[1], Z0[1]], [W0[0], Z0[1], -1.0, Z0[1]], [1.0, Z0[1], W0[1], Z0[1]]].forEach(([x0, z0, x1, z1]) => { const L = Math.hypot(x1 - x0, z1 - z0), w = bx(x0 === x1 ? 0.3 : L, 1.0, x0 === x1 ? L : 0.3, wallM, (x0 + x1) / 2, 0.45, (z0 + z1) / 2, g); void w; });
  const iron = SM({ color: '#16110c', metalness: 0.5 }); for (let k = 0; k < 9; k++) { const b = cyl(0.012, 0.012, 1.4, iron, 4); b.position.set(-0.9 + k * 0.22, 0.7, Z0[1]); g.add(b); } bx(2.0, 0.04, 0.04, iron, 0, 1.3, Z0[1], g);
  const R = RNG('graves'), crosses = [];
  for (let i = 0; i < 60 && crosses.length < 34; i++) { const x = R.r(-8.6, 8.6), z = R.r(2, 18); if (Math.hypot(x - (GRAVE.x - CHAPEL.x), z - (GRAVE.z - CHAPEL.z)) < 2.8) continue; if (Math.abs(x) < 1.4) continue; if (crosses.some(([a, b]) => Math.hypot(a - x, b - z) < 1.3)) continue; crosses.push([x, z, R.f()]); }
  crosses.forEach(([x, z, f], i) => { const y = cemH(x + CHAPEL.x, z), cg = new THREE.Group(); cg.position.set(x, y, z); cg.rotation.set(R.n(0.12), R.n(0.3), R.n(0.15)); g.add(cg);
    if (f < 0.3) { bx(0.6, 0.35, 1.2, lime, 0, 0.17, 0, cg); bx(0.05, 0.5, 0.05, iron, 0, 0.6, -0.5, cg); bx(0.25, 0.05, 0.05, iron, 0, 0.7, -0.5, cg); }
    else { const h = R.r(0.7, 1.1); bx(0.07, h, 0.06, wood, 0, h / 2, 0, cg); bx(R.r(0.35, 0.5), 0.06, 0.06, wood, 0, h * 0.72, 0, cg); const md = sph(1, dirt, 0.4, 0.12, 0.9, 10); md.position.set(0, 0.0, 0.75); cg.add(md);
      if (i % 4 === 0) { const fl = sph(0.06, SM({ color: '#a07c50' })); fl.position.set(0.05, 0.1, 0.4); cg.add(fl); } } });
  const dt = treeGeo(901, { h: 5 }); const dtm = shd(new THREE.Mesh(mergeGeos(dt), SM({ map: texDeadBark(), color: '#c8c0b0' }))); dtm.position.set(-7.2, 0, 16); g.add(dtm);
  mkGrass(Wd, 9000, [CHAPEL.x - 30, CHAPEL.x + 30, -20, 40], cemH, (x, z) => { const lx = x - CHAPEL.x; if (Math.abs(lx) < 2.9 && z < 0.4 && z > -8.6) return false; if (Math.abs(x - GRAVE.x) < 0.6 && Math.abs(z - GRAVE.z) < 1.2) return false; if (Math.hypot(x - GRAVE.x - 1.15, z - GRAVE.z + 0.2) < 1.1) return false; if (Math.hypot(x - GRAVE.x, z - GRAVE.z) < 2.4) return 'short'; if (Math.abs(lx) < 1.0 && z > 0 && z < 19) return 'short'; return true; }, ['#8a7448', '#a08850', '#6a5a3a', '#b49a5e', '#5a4a2a', '#7a6a40'], 'cem', [0.12, 0.36]);
  // the coffin (tapered six-sided box) and its lid
  const cs = new THREE.Shape(); cs.moveTo(-0.2, -0.95); cs.lineTo(0.2, -0.95); cs.lineTo(0.3, 0.45); cs.lineTo(0.24, 0.95); cs.lineTo(-0.24, 0.95); cs.lineTo(-0.3, 0.45); cs.lineTo(-0.2, -0.95);
  const cw = SM({ map: texPlank('coffin', '#3c2c1e') }); const box = new THREE.Group(); Wd.scene.add(box); Wd.coffin = box;
  const shell = shd(new THREE.Mesh(new THREE.ExtrudeGeometry(cs, { depth: 0.36, bevelEnabled: false }), cw)); shell.rotation.x = -Math.PI / 2; box.add(shell);
  const inner = shd(new THREE.Mesh(new THREE.ExtrudeGeometry(cs, { depth: 0.02, bevelEnabled: false }), SM({ color: '#16110c' }))); inner.rotation.x = -Math.PI / 2; inner.position.y = 0.33; inner.scale.set(0.86, 0.95, 1); box.add(inner);
  const lid = shd(new THREE.Mesh(new THREE.ExtrudeGeometry(cs, { depth: 0.05, bevelEnabled: false }), cw)); lid.rotation.x = -Math.PI / 2; Wd.scene.add(lid); Wd.lid = lid;
  const lc = new THREE.Group(); lid.add(lc); bx(0.06, 0.6, 0.01, SM({ color: '#a8a296' }), 0, 0.1, 0.055, lc); bx(0.3, 0.06, 0.01, SM({ color: '#a8a296' }), 0, 0.25, 0.055, lc);
  return g;
}

// ---------------------------------------------------------------------
//  the world, lights, the moon, dust motes
// ---------------------------------------------------------------------
let TREE = null;
function world() {
  if (WJ) return WJ;
  const scene = new THREE.Scene(), Wd = { scene }; WJ = Wd;
  scene.background = lin('#0b1a22'); scene.fog = new THREE.Fog('#172728', 8, 60);
  Wd.cam = new THREE.PerspectiveCamera(50, YK.LW / YK.LH, 0.03, 500);
  Wd.hemi = new THREE.HemisphereLight('#4e8389', '#221c15', 0.6); scene.add(Wd.hemi);
  const moon = new THREE.DirectionalLight('#8fb1b0', 0.5); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); const sc = moon.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 14; sc.bottom = -14; sc.near = 1; sc.far = 120; moon.shadow.bias = -0.0008;
  scene.add(moon); scene.add(moon.target); Wd.moon = moon;
  Wd.rim = new THREE.DirectionalLight('#b9cbc6', 0); scene.add(Wd.rim); scene.add(Wd.rim.target);
  // the tree at the outside of the bend
  { const near = roadNear(-1.6, -3.2), ra = roadAt(near.s); TREE = { s: near.s, p: ra.p.clone().addScaledVector(ra.r, 3.75), r: ra.r.clone(), t: ra.t.clone() }; TREE.p.y = setH(TREE.p.x, TREE.p.z); }
  // sky dome, the moon disc + halo, low hills (all follow the camera)
  { const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.MeshBasicMaterial({ map: texSky(), side: THREE.BackSide, fog: false })); scene.add(sky); Wd.sky = sky;
    Wd.ridges = [[200, '#0e1c22', 0], [160, '#14262c', 1], [125, '#1a3036', 2]].map(([r, c, k]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 40, 48, 1, true), new THREE.MeshBasicMaterial({ color: c, map: texRidge(k), alphaTest: 0.5, side: THREE.BackSide, fog: false })); m.material.map.repeat.set(5, 1); m.userData.y = 12 - k * 3; scene.add(m); return m; });
    Wd.moonDisk = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texMoon(), transparent: true, fog: false, depthWrite: false })); scene.add(Wd.moonDisk);
    Wd.moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(200,225,220,0.55)'], [0.35, 'rgba(120,170,170,0.18)'], [1, 'rgba(60,110,110,0)']]), transparent: true, depthWrite: false, fog: false })); scene.add(Wd.moonHalo); }
  mkRoadSet(Wd); mkHeroTree(Wd); Wd.tree.position.copy(TREE.p); Wd.tree.rotation.y = Math.atan2(-TREE.r.x, -TREE.r.z);   // the slit (local +z) faces the road
  mkScrub(Wd); mkFences(Wd);
  Wd.grass = mkGrass(Wd, 46000, [-45, 40, -40, 75], setH, (x, z) => { const rd = roadDist(x, z); if (rd < 0.22) return 'short'; if (rd < 2.5) return false; if (Math.hypot(x - TREE.p.x, z - TREE.p.z) < 0.85) return false; return true; }, ['#8a7448', '#a08850', '#6a5a3a', '#b49a5e', '#5a4a2a', '#7a6a40', '#c0a868', '#4a4a30'], 'road');
  mkCart(Wd); mkHouse(Wd); mkChapel(Wd);
  Wd.lantern = mkLantern(Wd); Wd.goad = mkGoad(Wd);
  Wd.man = mkPerson('man', { seed: 1 }); Wd.tiao = mkPerson('tiao', { seed: 2 }); Wd.mother = mkPerson('woman', { seed: 3 }); Wd.corpo = mkPerson('corpo', { seed: 4 });
  [Wd.man, Wd.tiao, Wd.mother, Wd.corpo].forEach((P) => scene.add(P.g));
  Wd.goad.userData.r = gripFit(Wd.man).r * 0.98; Wd.goad.children[0].scale.set(Wd.goad.userData.r / 0.0155, 1, Wd.goad.userData.r / 0.0155);
  { const st = new THREE.Group(); Wd.scene.add(st); Wd.strap = st; const lm = SM({ color: '#2b2219', roughness: 0.6 }); Wd.strapSeg = [0, 1, 2, 3, 4, 5].map(() => { const m = shd(new THREE.Mesh(UCYL1, lm)); st.add(m); return m; }); }
  // the two faces in the trunk (last shot): the Corpo-Seco's own dried grinning face, and my grandfather's beside it, dried to
  // the same brown leather, mouth open, his moustache and the brim of his hat grown into the bark; both half sunk in the wood
  { const leather = Wd.corpo.mat.skin, dried = SM({ map: texLeather('leatherG', '#6a4a32'), color: '#e0c8a8', roughness: 0.8 }), hairD = SM({ color: '#a8a296' });
    const Q0 = { pd: PDS.corpo, H: new THREE.Group(), kind: 'corpo' }; mkCorpoHead(Q0, leather); Wd.barkFaces.add(Q0.H);
    Q0.H.position.set(-0.2, 1.97, 0.37); Q0.H.rotation.set(-0.1, -0.3, 0.2); Q0.H.scale.set(1.9, 1.9, 1.5); Q0.jaw.rotation.x = 0.18; Q0.glints.forEach((g) => g.material.color.set('#b8a060')); Wd.bf0 = Q0;
    const Q1 = { pd: PDS.man, H: new THREE.Group(), kind: 'man' }; mkManHead(Q1, dried, { featM: dried, bark: true }); faceExpr(Q1, 1); Wd.barkFaces.add(Q1.H);
    Q1.H.traverse((m) => { if (m.isMesh && m.material && m.material.color && /9a968c|c8b890/.test(m.material.color.getHexString())) m.material = hairD; });
    Q1.H.position.set(0.22, 1.9, 0.38); Q1.H.rotation.set(0.0, 0.3, -0.08); Q1.H.scale.set(1.85, 1.85, 1.45); Wd.bf1 = Q1;
    // sunk into the wood: the heads sit mostly behind the bark surface (the trunk hides their backs and sides); torn bark
    // lips fold over each face's edges, fibrous strands cross its brow and cheeks, and his hat is only a ridge of bark
    const bk = Wd.trunkShut.material, RR = RNG('lips');
    const lip = (H, rx, ry, k) => { const pts = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * TAU, w = 1 + 0.14 * Math.sin(a * 3 + k) + 0.08 * Math.sin(a * 7 + k * 2); pts.push(V3(Math.cos(a) * rx * w, Math.sin(a) * ry * w, 0)); }
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 48, 1, 6, true), pp = g.attributes.position, n = g.attributes.normal;
      for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), y = pp.getY(i), a = Math.atan2(y, x), th = 0.032 + 0.02 * Math.max(0, Math.sin(a * 2 + k)) + 0.01 * RR.f(); const c = V3(x, y, 0).normalize(); const d = V3(pp.getX(i), pp.getY(i), pp.getZ(i)); void d;
        pp.setXYZ(i, x, y, pp.getZ(i)); }
      // rebuild with a variable tube radius: scale each ring's offset from the curve
      const curve = new THREE.CatmullRomCurve3(pts, true), F = curve.computeFrenetFrames(48, true), P2 = [], I2 = [], UV2 = [];
      for (let i = 0; i <= 48; i++) { const u = i / 48, c = curve.getPointAt(u % 1), a = u * TAU, th = 0.016 + 0.014 * Math.max(0, Math.sin(a * 2 + k)) + 0.006 * Math.sin(a * 9 + k);
        for (let j = 0; j <= 6; j++) { const v = (j / 6) * TAU, nn = F.normals[i % 48].clone().multiplyScalar(Math.cos(v)).addScaledVector(F.binormals[i % 48], Math.sin(v)); const q = c.clone().addScaledVector(nn, th); q.z = q.z * 0.8 + 0.012 + 0.02 * (1 - Math.abs(Math.cos(v))); q.addScaledVector(c.clone().normalize(), -0.4 * th * Math.max(0, Math.sin(v))); P2.push(q.x, q.y, q.z); UV2.push(u * 3, j / 6); } }
      for (let i = 0; i < 48; i++) for (let j = 0; j < 6; j++) { const a0 = i * 7 + j, b0 = a0 + 7; I2.push(a0, b0, a0 + 1, a0 + 1, b0, b0 + 1); }
      const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(P2, 3)); g2.setAttribute('uv', new THREE.Float32BufferAttribute(UV2, 2)); g2.setIndex(I2); g2.computeVertexNormals(); void g; void n;
      const m = shd(new THREE.Mesh(g2, bk)); m.position.copy(H.position).add(V3(Math.sin(H.rotation.y) * 0.075, -0.01, Math.cos(H.rotation.y) * 0.075)); m.rotation.set(H.rotation.x * 0.5, H.rotation.y * 0.8, H.rotation.z * 0.5); Wd.barkFaces.add(m); return m; };
    lip(Q0.H, 0.165, 0.215, 1); lip(Q1.H, 0.17, 0.2, 4);
    const strand = (a, b, c, r) => { const m = shd(new THREE.Mesh(taperTube([a, b, c], r, r * 0.5, 5, 8, { wob: 0.15 }), bk)); Wd.barkFaces.add(m); };
    strand(V3(-0.36, 2.2, 0.43), V3(-0.22, 2.17, 0.5), V3(-0.08, 2.24, 0.46), 0.022);   // across its brow
    strand(V3(-0.36, 1.86, 0.44), V3(-0.31, 1.95, 0.48), V3(-0.27, 2.06, 0.47), 0.018);   // over its cheek
    strand(V3(0.05, 2.06, 0.47), V3(0.22, 2.11, 0.53), V3(0.39, 2.04, 0.45), 0.03);   // his hat: a heavy ridge of bark over the brow
    strand(V3(0.08, 2.1, 0.46), V3(0.2, 2.15, 0.5), V3(0.34, 2.12, 0.45), 0.022);
    strand(V3(0.4, 1.76, 0.42), V3(0.36, 1.86, 0.48), V3(0.38, 1.98, 0.45), 0.018); }
  Wd.hat = new THREE.Group(); scene.add(Wd.hat); { const straw = SM({ map: texStraw(), color: '#e0d0a8' }); const b = cyl(0.21, 0.21, 0.012, straw, 24); Wd.hat.add(b); const c = cyl(0.085, 0.105, 0.11, straw, 18); c.position.y = 0.06; Wd.hat.add(c); const bd = cyl(0.106, 0.106, 0.022, SM({ color: '#2b2219' }), 18); bd.position.y = 0.02; Wd.hat.add(bd); }
  // lights (a fixed set: intensities change per shot, the count never does)
  Wd.lanL = new THREE.PointLight('#ffb868', 0, 14, 1.4); Wd.lanL.castShadow = true; Wd.lanL.shadow.mapSize.set(512, 512); Wd.lanL.shadow.bias = -0.002; Wd.lanL.shadow.camera.near = 0.05; scene.add(Wd.lanL);
  Wd.lampL = new THREE.PointLight('#ffb060', 0, 12, 1.2); Wd.lampL.castShadow = true; Wd.lampL.shadow.mapSize.set(1024, 1024); Wd.lampL.shadow.bias = -0.002; Wd.lampL.shadow.camera.near = 0.05; scene.add(Wd.lampL);
  Wd.key = new THREE.SpotLight('#b9cbc6', 0, 30, 0.5, 0.6, 1.2); Wd.key.castShadow = true; Wd.key.shadow.mapSize.set(1024, 1024); Wd.key.shadow.bias = -0.0008; scene.add(Wd.key); scene.add(Wd.key.target);
  Wd.fill = new THREE.PointLight('#e8a860', 0, 20, 1.5); scene.add(Wd.fill);
  Wd.lanGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,225,160,1)'], [0.25, 'rgba(255,170,80,0.5)'], [1, 'rgba(230,120,40,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); scene.add(Wd.lanGlow); Wd.lanGlow.visible = false;
  Wd.lampGlow = Wd.lanGlow.clone(); Wd.lampGlow.material = Wd.lanGlow.material.clone(); scene.add(Wd.lampGlow); Wd.lampGlow.visible = false;
  // dust motes / moths round the lights, ground mist
  { const R = RNG('motes'), n = 260, geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); Wd.moteP = [...Array(n)].map(() => ({ x: R.n(1), y: R.n(1), z: R.n(1), ph: R.r(0, TAU), v: R.r(0.3, 1) }));
    Wd.motes = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#d8c8a0', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false })); Wd.motes.frustumCulled = false; scene.add(Wd.motes); }
  { const R = RNG('mist'), t = g3Radial([[0, 'rgba(200,220,220,0.5)'], [0.5, 'rgba(180,205,205,0.18)'], [1, 'rgba(160,190,190,0)']], 64); Wd.mist = [];
    for (let i = 0; i < 60; i++) { const set = i < 40 ? 0 : 1, x = set ? CHAPEL.x + R.n(30) : R.r(-40, 30), z = set ? R.r(-10, 40) : R.r(-35, 60), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: R.r(0.3, 0.7) }));
      s.position.set(x, (set ? cemH(x, z) : setH(x, z)) + R.r(0.4, 1.6), z); s.scale.set(R.r(6, 12), R.r(1.5, 3), 1); s.userData = { x, z, ph: R.r(0, TAU) }; scene.add(s); Wd.mist.push(s); } }
  // toon: every standard material becomes a 3-band toon material (alpha masks and wind kept)
  const grad = new THREE.DataTexture(new Uint8Array([45, 45, 45, 255, 135, 135, 135, 255, 255, 255, 255, 255]), 3, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const done = new Map(); scene.traverse((m) => { if (!m.isMesh || !m.material) return; const conv = (o) => { if (!o.isMeshStandardMaterial) return o; if (!done.has(o)) { const t = new THREE.MeshToonMaterial({ color: o.color, map: o.map, alphaMap: o.alphaMap, alphaTest: o.alphaTest, vertexColors: o.vertexColors, side: o.side, gradientMap: grad, transparent: o.transparent, opacity: o.opacity, depthWrite: o.depthWrite, emissive: o.emissive, emissiveIntensity: o.emissiveIntensity }); if (o.onBeforeCompile && o.customProgramCacheKey) { t.onBeforeCompile = o.onBeforeCompile; t.customProgramCacheKey = o.customProgramCacheKey; } done.set(o, t); } return done.get(o); };
    m.material = Array.isArray(m.material) ? m.material.map(conv) : conv(m.material); });
  Wd.toon = done; Wd.globeT = done.get(Wd.globeM) || Wd.globeM;
  return Wd;
}
const LIGHT = {
  night:  { hemS: '#4e8389', hemG: '#3c2c1e', hemI: 0.9, moonC: '#8fb1b0', moonI: 0.75, fog: '#172728', fn: 6, ff: 75, bg: '#0b1a22', exp: 1.2, sky: 1 },
  house:  { hemS: '#26304a', hemG: '#3c2c1e', hemI: 0.12, moonC: '#4e8389', moonI: 0.0, fog: '#06090f', fn: 6, ff: 30, bg: '#06090f', exp: 1.15, sky: 0 },
  dusk:   { hemS: '#8fb1b0', hemG: '#5a4430', hemI: 1.7, moonC: '#d3d6cc', moonI: 1.1, fog: '#4e8389', fn: 10, ff: 85, bg: '#4e8389', exp: 1.3, sky: 2.2 },
  dawn:   { hemS: '#8fb1b0', hemG: '#5a4430', hemI: 1.4, moonC: '#d3d6cc', moonI: 1.1, fog: '#4e8389', fn: 7, ff: 85, bg: '#4e8389', exp: 1.25, sky: 2.2 },
};
function setLight(Wd, L) {
  Wd.hemi.color.set(L.hemS); Wd.hemi.groundColor.set(L.hemG); Wd.hemi.intensity = L.hemI; Wd.moon.color.set(L.moonC); Wd.moon.intensity = L.moonI;
  Wd.scene.fog.color.set(L.fog); Wd.scene.fog.near = L.fn; Wd.scene.fog.far = L.ff; Wd.scene.background.set(L.bg); rend().r.toneMappingExposure = L.exp;
  Wd.sky.material.color.setScalar(L.sky); Wd.ridges.forEach((m) => (m.visible = L.sky > 0.5)); Wd.moonDisk.visible = Wd.moonHalo.visible = L.sky > 0.5;
}
