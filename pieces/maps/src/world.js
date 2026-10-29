// =====================================================================
//  WORLD — "Cómo sabe Google Maps del tráfico" (three.js r149), metres. A light daytime world like reference 3:
//  a curving 8-lane urban expressway on sand-coloured ground (s = metres along it, 0..L), traffic-coloured verges per
//  segment, an overpass, a frontage road, a parking lot, white and terracotta buildings, palms, ~420 cars that flow
//  through a speed field (they bunch up where it is slow), cyan phone dots over 40 % of them, GPS satellites;
//  and the street graph (x = 2000) for the routing shots.
// =====================================================================
const ROAD_PTS = [[0, 90], [8, 0], [-14, -120], [6, -260], [28, -400], [12, -540], [-10, -680]];
const NSEG = 12;            // traffic segments along the road
const LANE = 3.5, MED = 1.2, EDGE = MED + 4 * LANE;   // half the median, the carriageway's outer edge (15.2)
let G = null, CURVE = null, L = 0;
const C_GREEN = '#2fb06a', C_ORANGE = '#f29a2e', C_RED = '#e8443a';
function rf(s) {   // road frame at s: point, tangent, right normal
  const u = clamp(s / L, 0, 1), p = CURVE.getPointAt(u), t = CURVE.getTangentAt(u); return { p, t, n: V3(-t.z, 0, t.x) };
}
const roadPt = (s, off, y = 0) => { const f = rf(s); return f.p.clone().addScaledVector(f.n, off).setY(y); };
// a strip along the road between offsets o0..o1, from s0 to s1, at height y
function ribbon(o0, o1, y, s0 = 0, s1 = null, N = 240, colors = false) {
  s1 = s1 ?? L; const pos = [], idx = [], col = [];
  for (let i = 0; i <= N; i++) { const s = lerp(s0, s1, i / N), a = roadPt(s, o0, y), b = roadPt(s, o1, y); pos.push(a.x, a.y, a.z, b.x, b.y, b.z); if (colors) col.push(1, 1, 1, 1, 1, 1);
    if (i < N) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); if (colors) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function g3() {
  if (G) return G;
  CURVE = new THREE.CatmullRomCurve3(ROAD_PTS.map(([x, z]) => V3(x, 0, z)), false, 'centripetal'); L = CURVE.getLength();
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  const scene = new THREE.Scene(); scene.background = lin('#e8e6e0'); scene.fog = new THREE.Fog(lin('#e8e6e0'), 150, 520);
  const cam = new THREE.PerspectiveCamera(40, W / H, 0.3, 3000); scene.add(cam);
  const hemi = new THREE.HemisphereLight(0xffffff, 0xb8b0a0, 1.05); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff4e4, 1.15); key.position.set(-60, 120, 40); key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -140, right: 140, top: 140, bottom: -140, near: 1, far: 400 }); key.shadow.bias = -0.0004; scene.add(key, key.target);

  // ---- ground, road, median, verges (traffic colours), edge lines, dashes
  const world = new THREE.Group();
  world.add(mesh(new THREE.PlaneGeometry(3000, 3000), std('#e6dfcf', { r: 1 }), 0, -0.05, -300, { rx: -Math.PI / 2, cast: false }));
  const asph = std('#5b5f67', { r: 0.9, side: THREE.DoubleSide }), concrete = std('#cfccc4', { r: 0.9, side: THREE.DoubleSide }), white = basic('#f4f2ec', { side: THREE.DoubleSide });
  world.add(mesh(ribbon(-EDGE, EDGE, 0.02), asph, 0, 0, 0, { cast: false }));
  world.add(mesh(ribbon(-MED, MED, 0.25), concrete, 0, 0, 0, { cast: false }));
  for (const sd of [-1, 1]) { world.add(mesh(ribbon(sd * (EDGE - 0.35), sd * (EDGE - 0.15), 0.04), white, 0, 0, 0, { cast: false })); world.add(mesh(ribbon(sd * (MED + 0.15), sd * (MED + 0.3), 0.04), white, 0, 0, 0, { cast: false })); }
  const vergeM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide });
  const verges = [1, -1].map((sd) => { const g = ribbon(sd > 0 ? EDGE : -EDGE - 3.2, sd > 0 ? EDGE + 3.2 : -EDGE, 0.05, 0, null, 480, true); const m = mesh(g, vergeM, 0, 0, 0, { cast: false }); world.add(m); return m; });
  { const dash = new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 0.03, 3.2), white, 4000); let k = 0; const o = new THREE.Object3D();
    for (let s = 2; s < L - 2 && k < 4000; s += 11) for (const off of [-1, 1].flatMap((sd) => [1, 2, 3].map((j) => sd * (MED + j * LANE)))) { const f = rf(s), p = roadPt(s, off, 0.045); o.position.copy(p); o.rotation.set(0, Math.atan2(f.t.x, f.t.z), 0); o.updateMatrix(); dash.setMatrixAt(k++, o.matrix); }
    dash.count = k; dash.castShadow = false; world.add(dash); }
  // ---- the overpass (s = 250), the frontage road (offsets 24..31, s 180..440), the parking lot (s 140, right)
  const OV = 250; { const f = rf(OV), ang = Math.atan2(f.t.x, f.t.z) + Math.PI / 2, ov = new THREE.Group(); ov.add(mesh(new THREE.BoxGeometry(140, 1.4, 13), concrete, 0, 8, 0)); ov.add(mesh(new THREE.BoxGeometry(140, 0.05, 11), asph, 0, 8.72, 0));
    for (const x of [-26, -10, 10, 26]) ov.add(mesh(new THREE.BoxGeometry(2, 8, 2.4), concrete, x, 4, 0)); for (const sd of [-1, 1]) ov.add(mesh(new THREE.BoxGeometry(140, 1.0, 0.4), concrete, 0, 9.2, sd * 6.3));
    ov.position.copy(f.p); ov.rotation.y = ang; world.add(ov); }
  world.add(mesh(ribbon(24, 31.5, 0.03, 170, 450, 120), asph, 0, 0, 0, { cast: false })); world.add(mesh(ribbon(27.6, 27.9, 0.045, 170, 450, 120), white, 0, 0, 0, { cast: false }));
  const lot = new THREE.Group(); { const f = rf(140), c = roadPt(140, 44, 0.03); lot.add(mesh(new THREE.PlaneGeometry(34, 26), std('#8a8d92', { r: 0.95 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false }));
    for (let k = 0; k < 9; k++) lot.add(mesh(new THREE.PlaneGeometry(0.2, 5), white, -14 + k * 3.5, 0.02, -6, { rx: -Math.PI / 2, cast: false }));
    for (let k = 0; k < 9; k++) lot.add(mesh(new THREE.PlaneGeometry(0.2, 5), white, -14 + k * 3.5, 0.02, 6, { rx: -Math.PI / 2, cast: false }));
    lot.position.copy(c); lot.rotation.y = Math.atan2(f.t.x, f.t.z); world.add(lot); }
  // ---- buildings (white, light grey, terracotta) and palms, away from the roads
  const R = RNG('city'), bld = [], palms = [];
  for (let s = 0; s < L; s += 7) for (const sd of [-1, 1]) for (let row = 0; row < 7; row++) {
    const off = sd * (44 + row * 22 + R.r(-4, 4)); if (sd > 0 && s > 120 && s < 165 && row < 2) continue; if (R.f() < 0.35) continue;
    const tall = s > 190 && s < 330 && row < 3 && R.f() < 0.7, h = tall ? R.r(30, 70) : R.r(6, 18), p = roadPt(s, off, 0);
    bld.push([p.x, p.z, R.r(9, 16), h, R.r(9, 16), R.f() < 0.22 ? '#c98a64' : R.pick(['#efede8', '#e2e0da', '#d6d3cc', '#f4f2ee'])]); }
  for (let s = 5; s < L; s += 16) for (const sd of [-1, 1]) { const p = roadPt(s + R.r(-4, 4), sd * R.r(20.5, 23), 0); palms.push([p.x, p.z, R.r(7, 10)]); }
  const bI = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std('#ffffff', { r: 0.95 }), bld.length), c = new THREE.Color();
  bld.forEach(([x, z, w, h, d, col], k) => { _m4.compose(V3(x, h / 2, z), _q4, V3(w, h, d)); bI.setMatrixAt(k, _m4); bI.setColorAt(k, c.set(col)); }); bI.castShadow = bI.receiveShadow = true; world.add(bI);
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.35, 1, 6), std('#8a6a48', { r: 0.9 }), palms.length), frondG = new THREE.BoxGeometry(0.9, 0.12, 3.6).translate(0, 0, 1.8), crown = new THREE.InstancedMesh(frondG, std('#4f8f5a', { r: 0.8 }), palms.length * 7);
  palms.forEach(([x, z, h], k) => { _m4.compose(V3(x, h / 2, z), _q4, V3(1, h, 1)); trunk.setMatrixAt(k, _m4); for (let f = 0; f < 7; f++) { _m4.compose(V3(x, h, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, k + f * TAU / 7, 0)).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35 + 0.15 * Math.sin(k + f), 0, 0))), V3(1, 1, 1)); crown.setMatrixAt(k * 7 + f, _m4); } });
  trunk.castShadow = crown.castShadow = true; world.add(trunk, crown);
  scene.add(world);

  // ---- cars: body + cabin + windshield band, instanced, coloured; phone dots over 40 %
  const NC = 300, bodyI = new THREE.InstancedMesh(rrBox(1.9, 4.5, 1.05, 0.35, 0.05).rotateX(Math.PI / 2), std('#ffffff', { r: 0.4, m: 0.2 }), NC);
  const cabI = new THREE.InstancedMesh(rrBox(1.65, 2.3, 0.75, 0.3, 0.04).rotateX(Math.PI / 2), std('#2a2e36', { r: 0.25, m: 0.4 }), NC);
  const CARC = ['#f4f2ee', '#f4f2ee', '#c8ccd2', '#1e2026', '#3a4250', '#c8352e', '#2f6fd1', '#f2c230', '#f2c230', '#8a9098'];
  const cars = []; { const Rc = RNG('cars'); for (let i = 0; i < NC; i++) { const lane = i % 8, dir = lane < 4 ? 1 : -1; cars.push({ lane, dir, off: dir * (MED + LANE * ((lane % 4) + 0.5)), ph: Rc.f(), vf: Rc.r(0.92, 1.08), phone: Rc.f() < 0.42 }); bodyI.setColorAt(i, c.set(Rc.pick(CARC))); } }
  bodyI.castShadow = cabI.castShadow = true; scene.add(bodyI, cabI);
  const dotI = new THREE.InstancedMesh(new THREE.SphereGeometry(0.7, 20, 14), new THREE.MeshStandardMaterial({ color: lin('#1fb8c8'), emissive: lin('#0c6a78'), emissiveIntensity: 0.6, roughness: 0.3 }), NC);
  const haloI = new THREE.InstancedMesh(new THREE.RingGeometry(0.82, 1.1, 32), new THREE.MeshBasicMaterial({ color: lin('#ffffff'), toneMapped: false, side: THREE.DoubleSide }), NC);
  dotI.castShadow = false; scene.add(dotI, haloI);
  // ---- parked cars in the lot (static), a pulled-over car (shots move it)
  const parked = new THREE.InstancedMesh(bodyI.geometry, std('#ffffff', { r: 0.4, m: 0.2 }), 14); { const Rp = RNG('park'); for (let k = 0; k < 14; k++) { const lx = -12.2 + (k % 7) * 3.5 * 1.2, lz = k < 7 ? -6 : 6, p = V3(lx, 0.55, lz).applyMatrix4(lot.matrixWorld.clone()); lot.updateMatrixWorld(); const q = V3(lx, 0.55, lz); lot.localToWorld(q); _m4.compose(q, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, lot.rotation.y, 0)), V3(1, 1, 1)); parked.setMatrixAt(k, _m4); parked.setColorAt(k, c.set(Rp.pick(CARC))); } } scene.add(parked);
  const hero = new THREE.Group(); hero.add(mesh(bodyI.geometry, std('#f2c230', { r: 0.4, m: 0.2 }), 0, 0.55, 0)); hero.add(mesh(cabI.geometry, std('#2a2e36', { r: 0.25, m: 0.4 }), 0, 1.3, -0.3)); scene.add(hero);
  const heroDot = mesh(new THREE.SphereGeometry(1.1, 24, 16), new THREE.MeshStandardMaterial({ color: lin('#1fb8c8'), emissive: lin('#0c6a78'), emissiveIntensity: 0.7, roughness: 0.3 }), 0, 0, 0, { cast: false }); scene.add(heroDot);
  // ---- GPS satellites, discs (GPS uncertainty), rings, raw-fix points
  const sats = [0, 1, 2].map(() => { const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(2.4, 2.4, 3.2), std('#e8e4da', { r: 0.4, m: 0.4 }))); for (const sd of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(7, 0.12, 2.4), std('#2a4a8a', { r: 0.3, m: 0.5 }), sd * 4.8, 0, 0)); scene.add(g); return g; });
  const discs = [...Array(8)].map(() => { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: lin('#7aa8e8'), transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); return m; });
  const fixes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.55, 12, 8), new THREE.MeshBasicMaterial({ color: lin('#ffffff'), toneMapped: false }), 80); fixes.count = 0; scene.add(fixes);
  const fixRing = new THREE.InstancedMesh(new THREE.RingGeometry(0.6, 0.9, 20), new THREE.MeshBasicMaterial({ color: lin('#1fb8c8'), toneMapped: false, side: THREE.DoubleSide }), 80); fixRing.count = 0; scene.add(fixRing);
  const rings = [...Array(10)].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 64), new THREE.MeshBasicMaterial({ color: lin('#1fb8c8'), transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide })); m.visible = false; scene.add(m); return m; });

  // ---- the street graph (x = 2000): nodes, streets, the highway arc, low blocks
  const GX = 2000, gw = new THREE.Group(); gw.position.set(GX, 0, 0);
  gw.add(mesh(new THREE.PlaneGeometry(600, 600), std('#ece6d8', { r: 1 }), 0, -0.04, 0, { rx: -Math.PI / 2, cast: false }));
  const NODES = GRAPH.nodes.map(([x, z]) => V3(x, 0, z));
  const streetM = std('#9ea3ab', { r: 0.9 }), hiwM = std(C_GREEN, { r: 0.8 });
  const edgeMeshes = GRAPH.edges.map(([a, b, kind]) => { const A = NODES[a], B = NODES[b], d = A.distanceTo(B), w = kind === 'h' ? 12 : 7;
    const m = mesh(new THREE.BoxGeometry(w, 0.1, d), kind === 'h' ? hiwM.clone() : streetM.clone(), (A.x + B.x) / 2, 0.05, (A.z + B.z) / 2, { cast: false }); m.rotation.y = Math.atan2(B.x - A.x, B.z - A.z); gw.add(m); return m; });
  const nodeM = NODES.map((p) => { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(6, 6, 0.6, 28), std('#ffffff', { r: 0.5 }), 0, 0.4, 0)); g.add(mesh(new THREE.TorusGeometry(6, 1.0, 8, 28), std('#1e2026', { r: 0.5 }), 0, 0.5, 0, { rx: Math.PI / 2 })); g.position.copy(p); gw.add(g); return g; });
  { const Rb = RNG('gb'), bI2 = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std('#ffffff', { r: 0.95 }), 900); let k = 0;
    for (let x = -260; x < 260; x += 13) for (let z = -260; z < 260; z += 13) { if (k >= 900) break; const p = V3(x + Rb.r(-2, 2), 0, z + Rb.r(-2, 2)); if (GRAPH.edges.some(([a, b]) => distSeg(p, NODES[a], NODES[b]) < 10)) continue; if (Rb.f() < 0.3) continue; const h = Rb.r(3, 14);
      _m4.compose(V3(p.x, h / 2, p.z), _q4, V3(Rb.r(6, 10), h, Rb.r(6, 10))); bI2.setMatrixAt(k, _m4); bI2.setColorAt(k++, c.set(Rb.f() < 0.08 ? '#c98a64' : Rb.pick(['#efede8', '#dedbd4', '#d2cfc8']))); }
    bI2.count = k; bI2.castShadow = true; gw.add(bI2); G_GB = bI2; }
  const route = mesh(new THREE.BufferGeometry(), basic('#2f6fd1'), 0, 0, 0, { cast: false }); gw.add(route);
  scene.add(gw);
  G = { r, cv, scene, cam, hemi, key, world, verges, bodyI, cabI, dotI, haloI, cars, parked, hero, heroDot, sats, discs, fixes, fixRing, rings, gw, GX, NODES, edgeMeshes, nodeM, route, OV };
  return G;
}
let G_GB = null;
const _m4 = new THREE.Matrix4(), _q4 = new THREE.Quaternion(), _e4 = new THREE.Euler(), _c4 = new THREE.Color();
function distSeg(p, a, b) { const ab = b.clone().sub(a), t = clamp(p.clone().sub(a).dot(ab) / ab.lengthSq()); return p.distanceTo(a.clone().addScaledVector(ab, t)); }
// the street graph: nodes (x, z) and edges [a, b, 'h' highway | 's' street]
const GRAPH = {
  nodes: [[-150, 150], [-60, 160], [40, 140], [140, 150], [-140, 50], [-40, 60], [60, 40], [150, 60], [-150, -60], [-50, -40], [50, -60], [150, -50], [-140, -160], [-40, -150], [60, -160], [150, -150]],
  edges: [[0, 1, 's'], [1, 2, 's'], [2, 3, 's'], [4, 5, 's'], [5, 6, 's'], [6, 7, 's'], [8, 9, 's'], [9, 10, 's'], [10, 11, 's'], 
    [0, 4, 's'], [4, 8, 's'], [8, 12, 's'], [1, 5, 's'], [5, 9, 's'], [9, 13, 's'], [2, 6, 's'], [6, 10, 's'], [10, 14, 's'], [3, 7, 'h'], [7, 11, 'h'], [11, 15, 'h'], [12, 13, 'h'], [13, 14, 'h'], [14, 15, 'h'], [12, 9, 's'], [9, 6, 's'], [6, 3, 's']],
};

// ---- traffic: a speed field along the forward carriageway; cars are evenly spaced in travel time, so they bunch where slow
const VF = 27.8;   // 100 km/h
let JAM = { a: 300, b: 430, k: 1 };   // slow zone (s), speed factor there (1 = free)
function vAt(s) { const w = smoothstep(JAM.a - 25, JAM.a + 15, s) * (1 - smoothstep(JAM.b - 15, JAM.b + 25, s)); return VF * (1 - (1 - JAM.k) * w); }
function smoothstep(a, b, x) { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }
let TAU_T = null;
function buildTau() { const N = 700, ds = L / N, tau = new Float32Array(N + 1); for (let i = 1; i <= N; i++) tau[i] = tau[i - 1] + ds / vAt((i - 0.5) * ds); TAU_T = { tau, ds, N }; }
function sOfTau(t) { const { tau, ds, N } = TAU_T, T = tau[N]; t = ((t % T) + T) % T; let lo = 0, hi = N; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (tau[m] <= t) lo = m; else hi = m; } return (lo + (t - tau[lo]) / (tau[hi] - tau[lo])) * ds; }
// place every car at time R; o: { jamK, dots (0..1 fraction shown), dotA, onlyFwd }
let CARPOS = [];
function setCars(R, o = {}) {
  const g = g3(); JAM.k = o.jamK ?? 1; JAM.a = o.a ?? 300; JAM.b = o.b ?? 430; buildTau(); const T = TAU_T.tau[TAU_T.N], o2 = new THREE.Object3D(); CARPOS = [];
  const nShow = o.count ?? g.cars.length; let nd = 0;
  g.cars.forEach((c, i) => {
    if (i >= nShow) { [g.bodyI, g.cabI, g.dotI, g.haloI].forEach((m) => m.setMatrixAt(i, HID)); CARPOS.push(null); return; }
    const perLane = Math.ceil(g.cars.length / 8), j = Math.floor(i / 8), t0 = ((j + c.ph * 0.6) / perLane) * T;
    let s; if (c.dir > 0) s = sOfTau(t0 + R * c.vf * (o.speed ?? 1)); else s = (((t0 / T) * L - R * VF * c.vf) % L + L) % L;
    const f = rf(s), p = f.p.clone().addScaledVector(f.n, c.off), ang = Math.atan2(f.t.x, f.t.z) + (c.dir < 0 ? Math.PI : 0);
    o2.position.set(p.x, 0.6, p.z); o2.rotation.set(0, ang, 0); o2.updateMatrix(); g.bodyI.setMatrixAt(i, o2.matrix);
    o2.position.set(p.x - Math.sin(ang) * 0.3, 1.35, p.z - Math.cos(ang) * 0.3); o2.updateMatrix(); g.cabI.setMatrixAt(i, o2.matrix);
    const show = c.phone && (o.dots ?? 1) > ((i * 0.618) % 1) && (!o.onlyFwd || c.dir > 0);
    if (show) { nd++; const k = 1 + 0.08 * Math.sin(RNOW * 3 + i); _m4.compose(V3(p.x, 4.4, p.z), _q4, V3(k, k, k).multiplyScalar(o.dotS ?? 1)); g.dotI.setMatrixAt(i, _m4); _m4.compose(V3(p.x, 4.4, p.z), g3().cam.quaternion, V3(k, k, k).multiplyScalar(o.dotS ?? 1)); g.haloI.setMatrixAt(i, _m4); }
    else { g.dotI.setMatrixAt(i, HID); g.haloI.setMatrixAt(i, HID); }
    CARPOS.push({ s, p, dir: c.dir, phone: show });
  });
  [g.bodyI, g.cabI, g.dotI, g.haloI].forEach((m) => (m.instanceMatrix.needsUpdate = true));
  return nd;
}
// colour the verges per segment: cols = [c0 .. c(NSEG-1)] (hex) for the forward side, back = hex for the other side
function setVerges(cols, back = C_GREEN) {
  const g = g3(); g.verges.forEach((m, sd) => { const a = m.geometry.attributes.color, n = a.count / 2; for (let i = 0; i < n; i++) { const s = (i / (n - 1)) * L, k = Math.min(NSEG - 1, Math.floor((s / L) * NSEG)); _c4.set(sd === 0 ? cols[k] ?? C_GREEN : back); a.setXYZ(i * 2, _c4.r, _c4.g, _c4.b); a.setXYZ(i * 2 + 1, _c4.r, _c4.g, _c4.b); } a.needsUpdate = true; });
}
const segOf = (s) => Math.min(NSEG - 1, Math.floor((s / L) * NSEG)), segMid = (k) => ((k + 0.5) / NSEG) * L;
const HID = new THREE.Matrix4().makeScale(0, 0, 0);
let RGI = 0;
function resetWorld() {
  const g = g3(); RGI = 0; g.world.visible = true; g.gw.visible = false; g.hero.visible = g.heroDot.visible = false; g.sats.forEach((s) => (s.visible = false)); g.discs.forEach((d) => (d.visible = false)); g.rings.forEach((d) => (d.visible = false));
  g.fixes.count = 0; g.fixRing.count = 0; g.route.visible = false; [g.bodyI, g.cabI, g.dotI, g.haloI, g.parked].forEach((m) => (m.visible = true));
  g.scene.background.set('#e8e6e0'); g.scene.fog.color.set('#e8e6e0'); g.scene.fog.near = 150; g.scene.fog.far = 520; g.hemi.intensity = 1.05; g.key.intensity = 1.15; g.hemi.color.set(0xffffff);
  g.key.position.set(-60, 120, 40); g.key.target.position.set(0, 0, 0);
  setVerges(Array(NSEG).fill(C_GREEN));
}
// keep the sun's shadow box around what the camera looks at
function sunAt(p) { const g = g3(); g.key.target.position.copy(p); g.key.position.copy(p).add(V3(-60, 120, 40)); g.key.target.updateMatrixWorld(); }
function ring(p, r, a, o = {}) { const m = g3().rings[RGI++]; if (!m || a <= 0) return; m.visible = true; m.position.copy(p); m.scale.setScalar(r); m.material.opacity = clamp(a); m.material.color.set(o.c ?? '#1fb8c8'); if (o.face) m.quaternion.copy(g3().cam.quaternion); else m.rotation.set(-Math.PI / 2, 0, 0); }
function disc(i, p, r, a) { const d = g3().discs[i]; if (!d || a <= 0) return; d.visible = true; d.position.set(p.x, 0.12 + i * 0.01, p.z); d.scale.setScalar(r); d.material.opacity = 0.35 * a; }
function setFixes(pts, a = 1) { const g = g3(); pts.forEach((p, k) => { _m4.compose(V3(p.x, 1.2, p.z), _q4, V3(a, a, a)); g.fixes.setMatrixAt(k, _m4); _m4.compose(V3(p.x, 1.2, p.z), g.cam.quaternion, V3(a, a, a)); g.fixRing.setMatrixAt(k, _m4); }); g.fixes.count = g.fixRing.count = pts.length; g.fixes.instanceMatrix.needsUpdate = g.fixRing.instanceMatrix.needsUpdate = true; }
const wpt = (obj, x, y, z) => { obj.updateWorldMatrix(true, false); return V3(x, y, z).applyMatrix4(obj.matrixWorld); };
