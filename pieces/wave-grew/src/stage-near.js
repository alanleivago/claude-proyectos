// =====================================================================
//  STAGE NEAR — story time 0..185 s (owner: agent NEAR; every top-level name starts with `nr`).
//  A sunny bay -> swimmers, a pier, the beach -> the lighthouse and the town -> fields, roads, toy cars -> into the cloud deck.
//  World coordinates are FIXED (x right, the shore ahead at -Z); nrG.world.position.z = travel(st) (floating origin).
//  - The ground is one terrain mesh coloured by three code-drawn land-use maps (near 1.2 m/px, mid 3.9 m/px, far 31 m/px).
//  - Everything repeated is instanced. Things in the wave's path sink into a foam-filled flood as the toe arrives
//    (vertex shader, by camera-relative z), people and boats on the water ride up the face.
//  - One aerial-perspective fog (exponential atmosphere, warm towards the sun) shared by sky, sea, land and clouds.
// =====================================================================
let nrG = null;
const NR_BN = { x0: -1400, z0: -5000, s: 4800, res: 4096 };
const NR_BM = { x0: -6000, z0: -16000, s: 16000, res: 4096 };
const NR_BF = { x0: -32000, z0: -64000, s: 64000, res: 2048 };
const NRU = {
  uNrH: { value: 1 }, uNrT: TIMEU, uNrTrav: { value: 0 }, uCurveR: CURVE_R, uNrSunD: SUNU,
  uNrFogC: { value: lin('#d6dee8') }, uNrFogW: { value: lin('#f7d9b2') }, uNrFogD: { value: 6e-5 }, uNrHs: { value: 1300 }, uNrWhite: { value: 0 },
  uNrZen: { value: lin('#3f78c4') }, uNrMid: { value: lin('#86b2e2') }, uNrCamY: { value: 2 }, uNrOff: { value: 0.22 },
};
const NR_NOISE_GLSL = `
float nrH21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float nrVN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(nrH21(i), nrH21(i + vec2(1.0, 0.0)), f.x), mix(nrH21(i + vec2(0.0, 1.0)), nrH21(i + vec2(1.0, 1.0)), f.x), f.y); }
float nrFbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * nrVN(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }`;
const NR_FOG_GLSL = `
uniform vec3 uNrFogC, uNrFogW, uNrSunD; uniform float uNrFogD, uNrHs, uNrWhite;
vec3 nrFogCol(vec3 v){ float s = pow(max(dot(v, uNrSunD), 0.0), 5.0); return mix(mix(uNrFogC, uNrFogW, s * 0.85), vec3(1.3, 1.31, 1.33), uNrWhite); }
vec3 nrFog(vec3 col, vec3 wp){
  vec3 d = wp - cameraPosition; float L = length(d); vec3 v = d / max(L, 1e-3);
  float y0 = max(cameraPosition.y, 0.0), y1 = max(wp.y, 0.0), dy = y1 - y0, e0 = exp(-y0 / uNrHs);
  float od = abs(dy) < 1.0 ? e0 : uNrHs * (e0 - exp(-y1 / uNrHs)) / dy;
  float f = 1.0 - exp(-uNrFogD * L * od);
  f = max(f, uNrWhite * (1.0 - exp(-L * (0.0004 + 0.03 * uNrWhite * uNrWhite * uNrWhite))));
  return mix(col, nrFogCol(v), clamp(f, 0.0, 1.0));
}`;

// ---------------------------------------------------------------- small helpers
const nrQ = new THREE.Quaternion(), nrE = new THREE.Euler(0, 0, 0, 'YXZ'), nrV = new THREE.Vector3(), nrS3 = new THREE.Vector3(), nrMt = new THREE.Matrix4(), nrMt2 = new THREE.Matrix4();
const NR_COLT = new THREE.Color(), NR_HIDE = new THREE.Matrix4().makeScale(0, 0, 0), NR_TM = [0, 1, 2, 3].map(() => new THREE.Matrix4());
function nrM4(x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0, out = new THREE.Matrix4()) {
  nrE.set(rx, ry, rz, 'YXZ'); nrQ.setFromEuler(nrE); nrV.set(x, y, z); nrS3.set(sx, sy, sz); return out.compose(nrV, nrQ, nrS3);
}
function nrIM(geo, mat, n, cast = true) { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, n)); m.count = n; m.frustumCulled = false; m.castShadow = cast; m.receiveShadow = true; return m; }
// static repeated things baked into one merged mesh per map tile (SwiftShader draws one big mesh far faster than many instances);
// per-vertex aOrg = (origin z, base y, height) drives the sinking; aLp = local position in metres (facade UVs)
function nrBaked(parent, geo, mat, items, setFn, o = {}) {
  const T = o.tile || 700, buckets = new Map(), grp = new THREE.Group(), M = new THREE.Matrix4(), N3 = new THREE.Matrix3(), c = new THREE.Color(), v = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), w = new THREE.Vector3(), n = new THREE.Vector3();
  for (const it of items) { const k = Math.floor(it.x / T) + ',' + Math.floor(it.z / T); if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(it); }
  const gp = geo.attributes.position, gn = geo.attributes.normal, gc = geo.attributes.color, gi = geo.index ? geo.index.array : null, nv = gp.count, gh = o.gh || 1;
  if (!geo.boundingBox) geo.computeBoundingBox(); const gyMax = geo.boundingBox.max.y;
  for (const L of buckets.values()) {
    const P = new Float32Array(L.length * nv * 3), Nn = new Float32Array(L.length * nv * 3), C = new Float32Array(L.length * nv * 3), O = new Float32Array(L.length * nv * 3), LP = o.lp ? new Float32Array(L.length * nv * 3) : null, I = [];
    L.forEach((it, k) => { const col = setFn(it, M); c.set(col || '#ffffff'); M.decompose(v, q, sc); N3.getNormalMatrix(M);
      for (let i = 0; i < nv; i++) { const j = (k * nv + i) * 3; w.fromBufferAttribute(gp, i); if (LP) { LP[j] = w.x * sc.x; LP[j + 1] = w.y * sc.y; LP[j + 2] = w.z * sc.z; } w.applyMatrix4(M); P[j] = w.x; P[j + 1] = w.y; P[j + 2] = w.z;
        if (gn) { n.fromBufferAttribute(gn, i).applyMatrix3(N3).normalize(); Nn[j] = n.x; Nn[j + 1] = n.y; Nn[j + 2] = n.z; } else Nn[j + 1] = 1;
        const cr = gc ? gc.getX(i) : 1, cg = gc ? gc.getY(i) : 1, cb = gc ? gc.getZ(i) : 1; C[j] = c.r * cr; C[j + 1] = c.g * cg; C[j + 2] = c.b * cb;
        O[j] = v.z; O[j + 1] = v.y; O[j + 2] = sc.y * gyMax * gh; }
      if (gi) for (const x of gi) I.push(x + k * nv); else for (let i = 0; i < nv; i++) I.push(i + k * nv); });
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.BufferAttribute(P, 3)); g2.setAttribute('normal', new THREE.BufferAttribute(Nn, 3)); g2.setAttribute('color', new THREE.BufferAttribute(C, 3)); g2.setAttribute('aOrg', new THREE.BufferAttribute(O, 3));
    if (LP) g2.setAttribute('aLp', new THREE.BufferAttribute(LP, 3)); g2.setIndex(I.length > 65535 ? new THREE.Uint32BufferAttribute(I, 1) : new THREE.Uint16BufferAttribute(I, 1));
    g2.computeBoundingSphere(); g2.boundingSphere.radius += 60;
    const m = new THREE.Mesh(g2, mat); m.castShadow = o.cast !== false; m.receiveShadow = true; if (o.depth) m.customDepthMaterial = o.depth; grp.add(m);
  }
  parent.add(grp); return grp;
}
// weld a non-indexed polyhedron (three's Icosahedron etc.) into an indexed one: 5x fewer vertices to shade
function nrWeld(g) {
  const p = g.attributes.position, map = new Map(), pos = [], idx = [];
  for (let i = 0; i < p.count; i++) { const k = `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`; let j = map.get(k); if (j === undefined) { j = pos.length / 3; map.set(k, j); pos.push(p.getX(i), p.getY(i), p.getZ(i)); } idx.push(j); }
  const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); o.setIndex(idx); o.computeVertexNormals(); return o;
}
// low-vertex primitives for flat shading: 8-vertex boxes, 5-vertex pyramids, 6-vertex prisms, n+1 cones
function nrPrim(kind, a = {}) {
  let P = [], I = [];
  if (kind === 'box') { const [w, h, d] = [a.w || 1, a.h || 1, a.d || 1], [cx, cy, cz] = a.c || [0, 0.5, 0];
    for (const y of [-h / 2, h / 2]) for (const [x, z] of [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]) P.push(cx + x, cy + y, cz + z);
    I = [0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 0, 4, 5, 0, 5, 1, 1, 5, 6, 1, 6, 2, 2, 6, 7, 2, 7, 3, 3, 7, 4, 3, 4, 0]; }
  else if (kind === 'pyr') { P = [-0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5, 0, 1, 0]; I = [0, 4, 1, 1, 4, 2, 2, 4, 3, 3, 4, 0]; }
  else if (kind === 'gable') { P = [-0.5, 0, -0.5, 0.5, 0, -0.5, 0, 1, -0.5, -0.5, 0, 0.5, 0.5, 0, 0.5, 0, 1, 0.5]; I = [0, 2, 1, 3, 4, 5, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 4]; }
  else if (kind === 'cyl') { const n = a.n || 6, r0 = a.r0 || 1, r1 = a.r1 || 1, h = a.h || 1, y0 = a.y0 || 0, sz = a.sz || 1;
    for (let k = 0; k < n; k++) { const t = k / n * TAU; P.push(Math.cos(t) * r0, y0, Math.sin(t) * r0 * sz); } for (let k = 0; k < n; k++) { const t = k / n * TAU; P.push(Math.cos(t) * r1, y0 + h, Math.sin(t) * r1 * sz); } P.push(0, y0 + h, 0);
    for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; I.push(k, n + k, k1, k1, n + k, n + k1, n + k, 2 * n, n + k1); } }
  else if (kind === 'cone') { const n = a.n || 6, r = a.r || 1, h = a.h || 1, y0 = a.y0 || 0; for (let k = 0; k < n; k++) P.push(Math.cos(k / n * TAU) * r, y0, Math.sin(k / n * TAU) * r); P.push(0, y0 + h, 0); for (let k = 0; k < n; k++) I.push(k, n, (k + 1) % n); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); return g;
}
// merge indexed geometries, one flat colour each (vertex colours)
function nrMergeIdx(parts) {
  const P = [], C = [], I = []; let base = 0;
  for (const [g, col] of parts) { const c = new THREE.Color(col), p = g.attributes.position; for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); C.push(c.r, c.g, c.b); }
    const ix = g.index ? g.index.array : [...Array(p.count).keys()]; for (const k of ix) I.push(k + base); base += p.count; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.setIndex(I); g.computeVertexNormals(); return g;
}
function nrMerge(parts) {
  const P = [], N = [], C = [];
  for (const [g0, col] of parts) {
    const g = g0.index ? g0.toNonIndexed() : g0, c = new THREE.Color(col), p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); C.push(c.r, c.g, c.b); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  return g;
}
const nrHash = (i, j) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function nrVN(x, z) {
  const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  return lerp(lerp(nrHash(i, j), nrHash(i + 1, j), u), lerp(nrHash(i, j + 1), nrHash(i + 1, j + 1), u), v);
}
function nrFbm(x, z, o = 4) { let s = 0, a = 0.5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * nrVN(x * f + k * 17.3, z * f - k * 9.1); n += a; f *= 2.03; a *= 0.5; } return s / n; }
function nrInPoly(x, z, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
function nrSegD2(x, z, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz; let t = l > 0 ? ((x - ax) * dx + (z - az) * dz) / l : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; const ex = ax + t * dx - x, ez = az + t * dz - z; return ex * ex + ez * ez; }
function nrPolyD(x, z, P, closed = true) { let d = Infinity; const n = P.length; for (let i = 0; i < n - (closed ? 0 : 1); i++) { const a = P[i], b = P[(i + 1) % n]; const q = nrSegD2(x, z, a[0], a[1], b[0], b[1]); if (q < d) d = q; } return Math.sqrt(d); }
// a texture from a canvas we already drew
function nrCanvasTex(cv, srgb = true, aniso = 8) { const t = new THREE.CanvasTexture(cv); if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = aniso; return t; }
// a polyline resampled every `step` metres, with ground heights: { p: [[x,z,y]...], L: [cumulative length] }
function nrResample(pts, step) {
  const out = [], L = []; let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], d = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(d / step));
    for (let k = 0; k < n; k++) { const t = k / n; out.push([ax + (bx - ax) * t, az + (bz - az) * t]); L.push(acc + d * t); }
    acc += d;
  }
  const e = pts[pts.length - 1]; out.push([e[0], e[1]]); L.push(acc);
  for (const p of out) p.push(nrHeight(p[0], p[1]));
  return { p: out, L, len: acc };
}
function nrAlong(R, s, out) {   // position + heading at arc length s on a resampled polyline
  const L = R.L; let lo = 0, hi = L.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] <= s) lo = m; else hi = m; }
  const a = R.p[lo], b = R.p[hi], t = clamp((s - L[lo]) / Math.max(1e-6, L[hi] - L[lo]));
  out[0] = a[0] + (b[0] - a[0]) * t; out[1] = a[1] + (b[1] - a[1]) * t; out[2] = a[2] + (b[2] - a[2]) * t; out[3] = Math.atan2(b[0] - a[0], b[1] - a[1]); return out;
}

// ---------------------------------------------------------------- the geography (shared by maps, terrain and placement)
function nrBeachZ(x) { const d = Math.max(0, x - 3500); return -560 + 7 * Math.sin(x / 130) + 3 * Math.sin(x / 41 + 1) - 0.12 * d * d / (d + 2000); }
const NR_WEST = [[48, -650], [40, -760], [30, -880], [22, -1000], [16, -1100], [20, -1150], [22, -1200], [12, -1236], [4, -1258], [8, -1282], [22, -1300], [-8, -1350], [-62, -1400],
  [-150, -1500], [-300, -1660], [-480, -1820], [-700, -1990], [-900, -2120], [-1100, -2250], [-1400, -2450], [-1800, -2700], [-2300, -3000], [-2800, -3350],
  [-3150, -3650], [-3500, -3830], [-3900, -3820], [-4400, -3650], [-5000, -3400], [-6000, -3020], [-7500, -2620], [-9500, -2300], [-13000, -2100], [-20000, -2000], [-200000, -1900]];
const NR_BAY = (() => {   // the second sea: a wide bay ahead, with a mountainous far shore
  const near = [[-200000, -14500], [-30000, -14000], [-20000, -13800], [-12000, -13000], [-8000, -12400], [-5000, -12150], [-2500, -11800], [0, -11950], [2500, -11650], [5000, -12050],
    [7000, -12800], [9000, -13250], [12000, -14200], [16000, -15800], [22000, -17500], [40000, -19500], [200000, -21000]];
  const far = []; for (let x = 200000; x >= -200000; x -= (Math.abs(x) > 40000 ? 20000 : 1500)) far.push([x, -19500 - 0.04 * Math.abs(x) - 1400 * Math.sin(x / 6100) - 700 * Math.sin(x / 2300 + 1) - (x > 20000 ? (x - 20000) * 0.05 : 0)]);
  return [...near, ...far]; })();
const NR_LAND = (() => {
  const b = []; for (let x = 200000; x > 60; x -= (x > 40000 ? 20000 : x > 6000 ? 400 : 25)) b.push([x, nrBeachZ(x)]);
  b.push([60, nrBeachZ(60)]);
  return [...b, ...NR_WEST, [-200000, -300000], [200000, -300000]];
})();
const NR_RIVER = [[2700, -11500], [2300, -10200], [2550, -8800], [2200, -7600], [1650, -6600], [1250, -5600], [900, -4600], [620, -3900], [330, -3300], [60, -2850], [-250, -2500], [-470, -2290], [-640, -2120]];
const NR_RAIL = [[-650, -1960], [-200, -2060], [350, -2350], [900, -2600], [1500, -3000], [2300, -3600], [3200, -4600], [4300, -6000], [5600, -7800], [7000, -9800], [8000, -11500]];
const NR_ROADS = [   // [points, width, kind]   kind: 0 avenue, 1 highway, 2 road
  [[[60, -626], [1000, -626], [2000, -626], [3000, -626], [3500, -628], [4500, -660], [6000, -790], [8000, -1010], [10000, -1240]], 14, 0],
  [[[420, -640], [470, -1500], [520, -2300], [600, -3300], [760, -4300], [1100, -5600], [1600, -7200], [2100, -9000], [2400, -11000]], 16, 0],
  [[[-1900, -2720], [-1000, -2620], [0, -3480], [900, -3900], [2000, -4100], [3200, -3900], [4600, -3500], [6500, -3200], [9000, -3300]], 22, 1],
  [[[2000, -4100], [2600, -5600], [3200, -7600], [3000, -9600], [3600, -11400]], 22, 1],
  [[[-200, -1520], [-700, -2300], [-1300, -3300], [-1700, -4800], [-2100, -6500], [-2600, -9000], [-2900, -11000]], 12, 2],
  [[[1500, -640], [2200, -1800], [3100, -2700], [4600, -3500], [6000, -4900], [7600, -6400]], 14, 0],
  [[[60, -1150], [700, -1350], [1500, -1500], [2600, -1650], [3800, -1900], [5200, -2100]], 12, 2],
];
const NR_VILLAGES = [[-1800, -6400], [1500, -7700], [4300, -6900], [-300, -9300], [3400, -10300], [6600, -8800], [-2700, -8100], [5800, -5300], [900, -10900], [7900, -6300], [-1300, -11200], [2600, -8700]];
const nrUrbanPoly = [[60, -600], [6600, -700], [6600, -3600], [4200, -3700], [3900, -6250], [-2100, -6250], [-2400, -3300], [-1500, -2400], [-200, -1450]];
const nrMountain = (x, z) => ss(-2600, -7000, x) * ss(-2300, -4500, z);

// signed distance to the coast (+ on land), exact and from cached grids
function nrSDexact(x, z) {
  const inL = nrInPoly(x, z, NR_LAND) && !nrInPoly(x, z, NR_BAY);
  const d = Math.min(nrPolyD(x, z, NR_LAND), nrPolyD(x, z, NR_BAY));
  return inL ? d : -d;
}
const NR_SDG = [];
function nrSDgrid(B, n) { const g = new Float32Array((n + 1) * (n + 1)); for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) g[j * (n + 1) + i] = nrSDexact(B.x0 + i / n * B.s, B.z0 + j / n * B.s); NR_SDG.push({ B, n, g }); }
function nrSD(x, z) {
  for (const G of NR_SDG) {
    const u = (x - G.B.x0) / G.B.s * G.n, v = (z - G.B.z0) / G.B.s * G.n;
    if (u < 0 || v < 0 || u >= G.n || v >= G.n) continue;
    const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j, n1 = G.n + 1, g = G.g;
    return lerp(lerp(g[j * n1 + i], g[j * n1 + i + 1], fu), lerp(g[(j + 1) * n1 + i], g[(j + 1) * n1 + i + 1], fu), fv);
  }
  return nrSDexact(x, z);
}
function nrHeight(x, z) {
  const s = nrSD(x, z);
  if (s <= 0) return Math.max(-60, -0.8 + s * 0.035);
  const h = Math.min(s * 0.045, 2.6), inl = ss(12, 260, s);
  let e = 0.0062 * clamp(-z - 620, 0, 7000) + 10 * (nrFbm(x / 1100, z / 1100, 3) - 0.5);
  e += 22 * Math.exp(-((x - 260) ** 2 + (z + 1300) ** 2) / (2 * 260 * 260));
  e += ss(-3800, -6500, z) * 45 * nrFbm(x / 2600 + 3, z / 2600, 4);
  e += ss(-7500, -9500, z) * (1 - ss(-10900, -11700, z)) * 190 * Math.pow(nrFbm(x / 3000 + 7, z / 3000 + 1, 4), 1.6);
  const ml = nrMountain(x, z);
  if (ml > 0) { const rid = 1 - Math.abs(nrFbm(x / 6000, z / 6000, 5) * 2 - 1); e += ml * (250 + 1700 * Math.pow(rid, 2.4)) * ss(0, 1600, s); }
  e += ss(8000, 14000, x) * ss(-2000, -6000, z) * 520 * nrFbm(x / 5000, z / 5000 + 4, 4);
  if (z < -18000) { const rid = 1 - Math.abs(nrFbm(x / 7000 + 11, z / 7000, 5) * 2 - 1); e += ss(-19000, -24000, z) * (250 + 2100 * Math.pow(rid, 2.2)) * ss(0, 2500, s); }
  const rock = 9 * Math.exp(-((x - 32) ** 2 + (z + 1262) ** 2) / (2 * 38 * 38));
  return h + Math.max(0.6, e) * inl + rock * ss(2, 14, s);
}

// ---------------------------------------------------------------- occupancy raster (town planning)
const NR_OB = { x0: -2600, z0: -7000, sx: 9200, sz: 6800, c: 5 };
let NR_OCC = null;
const nrOccI = (x, z) => { const i = Math.floor((x - NR_OB.x0) / NR_OB.c), j = Math.floor((z - NR_OB.z0) / NR_OB.c); return i < 0 || j < 0 || i >= NR_OB.sx / NR_OB.c || j >= NR_OB.sz / NR_OB.c ? -1 : j * (NR_OB.sx / NR_OB.c) + i; };
const nrOcc = (x, z) => { const k = nrOccI(x, z); return k < 0 ? 0 : NR_OCC[k]; };
function nrStampLine(pts, r, v) { for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], d = Math.hypot(bx - ax, bz - az); for (let s = 0; s <= d; s += 2) { const x = ax + (bx - ax) * s / d, z = az + (bz - az) * s / d; for (let oz = -r; oz <= r; oz += NR_OB.c) for (let ox = -r; ox <= r; ox += NR_OB.c) if (ox * ox + oz * oz <= r * r) { const k = nrOccI(x + ox, z + oz); if (k >= 0) NR_OCC[k] = Math.max(NR_OCC[k], v); } } } }
function nrStampRect(cx, cz, a, w, d, v) { const ux = Math.cos(a), uz = -Math.sin(a), vx = Math.sin(a), vz = Math.cos(a); for (let b = -d / 2; b <= d / 2; b += 3) for (let q = -w / 2; q <= w / 2; q += 3) { const k = nrOccI(cx + ux * q + vx * b, cz + uz * q + vz * b); if (k >= 0) NR_OCC[k] = Math.max(NR_OCC[k], v); } }

// ---------------------------------------------------------------- the town and the countryside, as data
function nrPlan() {
  nrSDgrid(NR_BN, 400); nrSDgrid(NR_BM, 220); nrSDgrid(NR_BF, 160);
  NR_OCC = new Uint8Array((NR_OB.sx / NR_OB.c) * (NR_OB.sz / NR_OB.c));
  const P = { lots: [], extras: [], drives: [], blocks: [], bld: [], trees: [], pools: [], parked: [], plazas: [], parks: [], fields: [], forests: [], farms: [], villages: [], croads: [], specials: [] };
  // water, roads, rail and reserved places first
  nrStampLine(NR_RIVER, 34, 4); nrStampLine(NR_RAIL, 12, 3);
  for (const [pts, w] of NR_ROADS) nrStampLine(pts, w / 2 + 6, 2);
  const reserve = [[1650, -3750, 0.3, 300, 240, 'stadium'], [1150, -1750, 0.0, 360, 240, 'park'], [900, -2600, 0.55, 230, 70, 'station'], [430, -2790, 0.12, 150, 120, 'cathedral'],
    [300, -1335, 0.35, 90, 70, 'church'], [36, -1262, 0, 90, 90, 'lighthouse'], [2600, -2900, 0.42, 260, 200, 'park2'], [-200, -3900, -0.25, 300, 220, 'school']];
  for (const [x, z, a, w, d, k] of reserve) { nrStampRect(x, z, a, w, d, 5); P.specials.push({ x, z, a, w, d, k }); }
  // the seafront: hotels and apartment blocks in one row behind the coast road
  { const R = RNG('nr-front'); let x = 90;
    while (x < 3350) { const w = R.r(18, 40), d = R.r(15, 22), tall = R.f() < 0.12, h = tall ? R.r(45, 62) : R.r(12, 40), z = -644 - d / 2;
      if (Math.abs(x + w / 2 - 420) > 16 && Math.abs(x + w / 2 - 1500) > 16 && nrOcc(x + w / 2, z) === 0) P.bld.push({ t: tall ? 'glass' : 'apt', x: x + w / 2, z, a: 0, w, d, h, col: R.pick(NR_COL.apt), roof: 'flat' });
      x += w + R.r(4, 14); }
    nrStampRect(1700, -662, 0, 3400, 40, 6); }
  // districts: blocks on rotated street grids
  const D = [
    { k: 'old', x: 260, z: -1300, a: 0.35, bw: 44, bd: 34, sw: 7, n: 12, test: (x, z) => ((x - 260) / 400) ** 2 + ((z + 1300) / 340) ** 2 < 1 },
    { k: 'center', x: 450, z: -2900, a: 0.12, bw: 96, bd: 78, sw: 16, n: 9, test: (x, z) => ((x - 450) / 760) ** 2 + ((z + 2900) / 560) ** 2 < 1 },
    { k: 'ind', x: -800, z: -2050, a: -0.6, bw: 150, bd: 90, sw: 14, n: 6, test: (x, z) => z < -1650 && z > -2600 && x < -60 && nrSD(x, z) < 520 },
    { k: 'grid', x: 600, z: -900, a: 0.0, bw: 86, bd: 64, sw: 12, n: 30, test: (x, z) => z < -682 && z > -2380 && x > 60 && x < 3350 },
    { k: 'grid', x: 1800, z: -3400, a: 0.42, bw: 92, bd: 70, sw: 12, n: 18, test: (x, z) => z < -2350 && z > -4350 && x > 850 && x < 3800 },
    { k: 'grid', x: -900, z: -3250, a: -0.25, bw: 88, bd: 66, sw: 12, n: 16, test: (x, z) => z < -2550 && z > -4350 && x < 700 },
    { k: 'sub', x: 600, z: -4800, a: 0.2, bw: 124, bd: 58, sw: 10, n: 26, test: (x, z) => z < -4250 && z > -6150 && x > -2000 && x < 3850 && nrVN(x / 700, z / 700) > 0.3 },
    { k: 'sub', x: 4800, z: -2100, a: -0.12, bw: 116, bd: 58, sw: 10, n: 16, test: (x, z) => x > 3350 && x < 6500 && z < -720 && z > -3550 && nrVN(x / 650 + 3, z / 650) > 0.25 },
  ];
  const R = RNG('nr-city');
  for (const Dd of D) {
    const ca = Math.cos(Dd.a), sa = Math.sin(Dd.a), px = Dd.bw + Dd.sw, pz = Dd.bd + Dd.sw;
    for (let j = -Dd.n; j <= Dd.n; j++) for (let i = -Dd.n; i <= Dd.n; i++) {
      const lx = i * px, lz = j * pz, x = Dd.x + lx * ca + lz * sa, z = Dd.z - lx * sa + lz * ca;
      let ok = Dd.test(x, z);
      for (let c = 0; ok && c < 9; c++) { const qx = ((c % 3) - 1) * (Dd.bw / 2 - 1), qz = (Math.floor(c / 3) - 1) * (Dd.bd / 2 - 1), X = x + qx * ca + qz * sa, Z = z - qx * sa + qz * ca;
        if (nrSD(X, Z) < 14 || nrOcc(X, Z) !== 0) ok = false; }
      if (!ok) continue;
      nrStampRect(x, z, Dd.a, Dd.bw, Dd.bd, 6);
      const b = { x, z, a: Dd.a, w: Dd.bw, d: Dd.bd, sw: Dd.sw, k: Dd.k, use: '' };
      nrFillBlock(b, R, P); P.blocks.push(b);
    }
  }
  // leftover green inside the town: clumps of trees, little meadows
  { const RG = RNG('nr-green'); P.clumps = [];
    for (let k = 0; k < 12000; k++) { const x = RG.r(-2300, 6500), z = RG.r(-6200, -700); if (!nrInPoly(x, z, nrUrbanPoly) || nrSD(x, z) < 30 || nrOcc(x, z) !== 0) continue;
      let free = true; for (const [ox, oz] of [[12, 0], [-12, 0], [0, 12], [0, -12]]) if (nrOcc(x + ox, z + oz) !== 0) free = false; if (!free) continue;
      const n = RG.i(3, 11), r = RG.r(8, 22); P.clumps.push([x, z, r]); for (let q = 0; q < n; q++) P.trees.push({ t: RG.f() < 0.2 ? 'cyp' : 'broad', x: x + RG.n(r), z: z + RG.n(r), s: RG.r(0.8, 1.4) }); } }
  // villages, farms and their roads
  { const RV = RNG('nr-vill');
    for (const [vx, vz] of NR_VILLAGES) { const a = RV.r(-0.6, 0.6), n = RV.i(26, 60), rr = RV.r(170, 280); P.villages.push({ x: vx, z: vz, a, r: rr });
      for (let k = 0; k < n; k++) { const along = RV.n(rr), side = RV.f() < 0.5 ? -1 : 1, cross = RV.f() < 0.5, off = side * RV.r(14, 26);
        const lx = cross ? off : along, lz = cross ? along * 0.7 : off, x = vx + lx * Math.cos(a) + lz * Math.sin(a), z = vz - lx * Math.sin(a) + lz * Math.cos(a);
        if (nrSD(x, z) < 20) continue;
        P.bld.push({ t: 'house', x, z, a: a + (cross ? Math.PI / 2 : 0), w: RV.r(8, 12), d: RV.r(7, 10), h: RV.r(4, 7.5), col: RV.pick(NR_COL.house), roof: RV.f() < 0.6 ? 'hip' : 'gable', rcol: RV.pick(NR_COL.roof) });
        if (RV.f() < 0.7) P.trees.push({ t: 'broad', x: x + RV.n(14), z: z + RV.n(14), s: RV.r(0.8, 1.3) }); }
      P.bld.push({ t: 'apt', x: vx + 6, z: vz + 6, a, w: 10, d: 22, h: 9, col: '#e9dcc2', roof: 'gable', rcol: '#9b4630' });
      P.specials.push({ x: vx + 6, z: vz - 8, a, k: 'steeple' }); }
    const RF = RNG('nr-farm');
    for (let k = 0; k < 420; k++) { const x = RF.r(-5500, 9800), z = RF.r(-15500, -3800);
      if (nrInPoly(x, z, nrUrbanPoly) || nrSD(x, z) < 80 || nrMountain(x, z) > 0.4) continue;
      const a = RF.r(0, 3); P.farms.push({ x, z, a });
      P.bld.push({ t: 'house', x, z, a, w: RF.r(9, 13), d: RF.r(8, 10), h: RF.r(5, 7), col: RF.pick(NR_COL.house), roof: 'hip', rcol: RF.pick(NR_COL.roof) });
      const bx = x + Math.cos(a) * 24, bz = z - Math.sin(a) * 24; P.bld.push({ t: 'ware', x: bx, z: bz, a, w: RF.r(16, 28), d: RF.r(10, 16), h: RF.r(6, 9), col: RF.pick(['#b5523e', '#a8473a', '#d9d2c2', '#8e9aa2', '#c9b79a']), roof: 'gable', rcol: RF.pick(['#7a7470', '#9b4630', '#5e6a70']) });
      if (RF.f() < 0.5) P.specials.push({ x: x - Math.sin(a) * 16, z: z - Math.cos(a) * 16, k: 'silo' });
      for (let q = 0; q < 4; q++) P.trees.push({ t: 'broad', x: x + RF.n(30), z: z + RF.n(30), s: RF.r(0.9, 1.4) }); }
    // country roads: each village to its two nearest neighbours and to the avenue / highway
    const nodes = [...NR_VILLAGES, [1100, -5600], [2600, -5600], [-1700, -4800], [3200, -7600], [6000, -4900]];
    const seen = new Set();
    NR_VILLAGES.forEach(([ax, az], i) => {
      const near = nodes.map((p, j) => [Math.hypot(p[0] - ax, p[1] - az), j]).filter(([d, j]) => j !== i).sort((a, b) => a[0] - b[0]).slice(0, 3);
      for (const [, j] of near) { const key = Math.min(i, j) + '-' + Math.max(i, j); if (seen.has(key)) continue; seen.add(key);
        const [bx, bz] = nodes[j], L = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.round(L / 160)), pts = [];
        for (let q = 0; q <= n; q++) { const t = q / n, w = Math.sin(t * Math.PI) * (nrVN(i * 3.1 + q * 0.4, j) - 0.5) * 260; pts.push([ax + (bx - ax) * t + (-(bz - az) / L) * w, az + (bz - az) * t + ((bx - ax) / L) * w]); }
        P.croads.push(pts); } });
  }
  // fields: rotated cells split into parcels (mid map: small, far map: big)
  { const RF = RNG('nr-fields'), cols = NR_COL.field;
    const doCells = (B, cs, minP, maxP, skipM) => {
      for (let cz = B.z0; cz < B.z0 + B.s; cz += cs) for (let cx = B.x0; cx < B.x0 + B.s; cx += cs) {
        const mx = cx + cs / 2, mz = cz + cs / 2;
        if (skipM && mx > NR_BM.x0 && mx < NR_BM.x0 + NR_BM.s && mz > NR_BM.z0 && mz < NR_BM.z0 + NR_BM.s) continue;
        if (nrMountain(mx, mz) > 0.35 || nrSD(mx, mz) < -cs) continue;
        const a = RF.r(-0.6, 0.6), ca = Math.cos(a), sa = Math.sin(a), S = cs * 0.62;
        const split = (u0, v0, u1, v1, dep) => {
          const du = u1 - u0, dv = v1 - v0, lim = RF.r(minP, maxP);
          if ((du < lim && dv < lim) || dep > 7) {
            const u = (u0 + u1) / 2, v = (v0 + v1) / 2, x = mx + u * ca + v * sa, z = mz - u * sa + v * ca;
            if (nrSD(x, z) < 10 || nrInPoly(x, z, nrUrbanPoly)) return;
            const pts = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].map(([p, q]) => [mx + p * ca + q * sa, mz - p * sa + q * ca]);
            let r = RF.f(), ci = 0; while (r > cols[ci][1] && ci < cols.length - 1) { r -= cols[ci][1]; ci++; }
            P.fields.push({ pts, col: cols[ci][0], a, rows: RF.f() < 0.6, edge: RF.f() < 0.45 }); return; }
          if (du > dv) { const m = u0 + du * RF.r(0.3, 0.7); split(u0, v0, m, v1, dep + 1); split(m, v0, u1, v1, dep + 1); }
          else { const m = v0 + dv * RF.r(0.3, 0.7); split(u0, v0, u1, m, dep + 1); split(u0, m, u1, v1, dep + 1); }
        };
        split(-S, -S, S, S, 0);
      } };
    doCells(NR_BM, 900, 70, 330, false); doCells(NR_BF, 2600, 260, 950, true);
    // forests: blobs, more of them on the hills and the mountains
    const RFo = RNG('nr-forest');
    for (let k = 0; k < 900; k++) {
      const far = k > 260, x = far ? RFo.r(NR_BF.x0, NR_BF.x0 + NR_BF.s) : RFo.r(NR_BM.x0, NR_BM.x0 + NR_BM.s), z = far ? RFo.r(NR_BF.z0, -1500) : RFo.r(NR_BM.z0, -3600);
      if (nrSD(x, z) < 60 || nrInPoly(x, z, nrUrbanPoly)) continue;
      const r = (far ? RFo.r(500, 2200) : RFo.r(120, 650)) * (1 + nrMountain(x, z)), n = 22, pts = [];
      for (let q = 0; q < n; q++) { const t = q / n * TAU, rr = r * (0.65 + 0.55 * nrVN(k * 1.7 + Math.cos(t) * 1.3, Math.sin(t) * 1.3)); pts.push([x + Math.cos(t) * rr, z + Math.sin(t) * rr]); }
      P.forests.push({ x, z, r, pts, pine: RFo.f() < 0.35 + 0.5 * nrMountain(x, z) });
    }
  }
  // 3D trees inside the nearer forests
  { const RT = RNG('nr-ftrees'); let budget = 34000;
    for (const f of P.forests) { if (f.x < -3000 || f.x > 7000 || f.z > -3500 || f.z < -12000) continue;
      const n = Math.min(budget, Math.round(Math.PI * f.r * f.r / 450)); budget -= n;
      for (let q = 0; q < n; q++) { const x = f.x + RT.n(f.r * 1.1), z = f.z + RT.n(f.r * 1.1); if (!nrInPoly(x, z, f.pts)) continue; P.trees.push({ t: f.pine ? 'pine' : 'broad', x, z, s: RT.r(1.3, 2.2), forest: 1 }); }
      if (budget <= 0) break; } }
  // hedgerow trees along some field edges near the path
  { const RH = RNG('nr-hedge'); let n = 0;
    for (const f of P.fields) { if (!f.edge || n > 5000) continue; const [a, b] = f.pts; if (Math.abs(a[0]) > 6000 || a[1] > -3800 || a[1] < -12500) continue;
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let s = 0; s < L; s += RH.r(9, 18)) { P.trees.push({ t: 'broad', x: a[0] + (b[0] - a[0]) * s / L, z: a[1] + (b[1] - a[1]) * s / L, s: RH.r(0.8, 1.3) }); n++; } } }
  return P;
}
const NR_COL = {
  house: ['#f1e6cf', '#ecd9b4', '#e8c79a', '#f4efe6', '#e9b7a0', '#dca98a', '#f0dca8', '#cfd8c8', '#e6d0b8', '#f6f1e4', '#d3c3aa', '#eaa882', '#bcd0d6', '#f2c9b8'],
  apt: ['#ece7dd', '#d8d2c6', '#efe2cc', '#cbd1d6', '#e3d5c0', '#d6c4ae', '#f2efe9', '#c4cacd', '#e8d9c4', '#dcd0bf', '#e8c49a', '#d9a48a', '#c9d6dc', '#e6cf9c', '#d4b8a0', '#f0d8c0', '#b8c8c0', '#e0b0a0'],
  glass: ['#9fb6c8', '#a8bac4', '#8fa7b8', '#b9c4c8', '#7f98ab', '#9eb0b0'],
  ware: ['#d8d4cc', '#c4c9cc', '#b8c4cc', '#e2dccd', '#a9b8c2', '#c9b9a2', '#d6d0c0'],
  roof: ['#b4553a', '#c0663f', '#a84a32', '#c97a4e', '#9b4630', '#b86848', '#a65a40', '#c4704a', '#8e5a48', '#7c7672'],
  field: [['#cdb86a', 0.17], ['#dccb86', 0.09], ['#8fae55', 0.19], ['#a9c16c', 0.14], ['#6f9447', 0.1], ['#a8865e', 0.1], ['#bb9c72', 0.07], ['#e2d05a', 0.04], ['#82a46e', 0.07], ['#9b8fb0', 0.03]],
};
// one block of a district: what stands on it
function nrFillBlock(b, R, P) {
  const ca = Math.cos(b.a), sa = Math.sin(b.a), W2 = b.w / 2, D2 = b.d / 2;
  const at = (lx, lz) => [b.x + lx * ca + lz * sa, b.z - lx * sa + lz * ca];
  const dC = Math.hypot(b.x - 470, b.z + 2930);
  let use = b.k === 'old' ? (R.f() < 0.06 ? 'plaza' : 'old') : b.k === 'center' ? (dC < 470 && R.f() < 0.45 ? 'tower' : R.f() < 0.1 ? 'plaza' : 'apt')
    : b.k === 'ind' ? 'ware' : b.k === 'sub' ? (R.f() < 0.05 ? 'park' : 'sub') : (R.f() < 0.07 ? 'park' : R.f() < 0.05 ? 'plaza' : R.f() < 0.06 ? 'lot' : R.f() < 0.62 ? 'apt' : 'row');
  b.use = use;
  const add = (o) => { const [x, z] = at(o.lx, o.lz); P.bld.push(Object.assign(o, { x, z, a: b.a + (o.da || 0) })); };
  const tree = (lx, lz, s, t = 'broad') => { const [x, z] = at(lx, lz); P.trees.push({ t, x, z, s }); };
  // lots along the four sides: cb(lx, lz, along, depth, facingAngle)
  const sides = (lotW, lotD, setback, cb) => {
    for (const sgn of [1, -1]) for (let u = -W2 + 1; u < W2 - lotW * 0.6; ) { const w = lotW * R.r(0.75, 1.25); const c = Math.min(u + w / 2, W2 - 1 - w / 2); cb(c, sgn * (D2 - setback - lotD / 2), w, lotD, sgn > 0 ? 0 : Math.PI); u += w; }
    for (const sgn of [1, -1]) for (let v = -D2 + lotD + setback + 1; v < D2 - lotD - setback - lotW * 0.5; ) { const w = lotW * R.r(0.75, 1.25); cb(sgn * (W2 - setback - lotD / 2), v + w / 2, w, lotD, sgn > 0 ? Math.PI / 2 : -Math.PI / 2); v += w; }
  };
  if (use === 'old' || use === 'row') {
    const old = use === 'old';
    sides(old ? 8 : 9, old ? 10 : 11, 0, (lx, lz, w, d, f) => { const fl = old ? R.i(2, 4) : R.i(2, 4), long = Math.abs(Math.sin(f)) > 0.5;
      add({ t: 'house', lx, lz, w: long ? d : w - 0.4, d: long ? w - 0.4 : d, h: fl * 3 + 0.6, col: R.pick(NR_COL.house), roof: R.f() < 0.55 ? 'hip' : 'gable', rcol: R.pick(NR_COL.roof), da: long ? Math.PI / 2 * 0 : 0 }); });
    if (R.f() < 0.6) tree(R.n(W2 * 0.3), R.n(D2 * 0.3), R.r(0.8, 1.2));
  } else if (use === 'apt') {
    const tall = b.k === 'center' ? 1.35 : 1;
    sides(R.r(18, 30), 13, 0, (lx, lz, w, d, f) => { const long = Math.abs(Math.sin(f)) > 0.5;
      add({ t: 'apt', lx, lz, w: long ? d : w - 1, d: long ? w - 1 : d, h: R.i(4, 8) * 3 * tall + 1, col: R.pick(NR_COL.apt), roof: 'flat' }); });
    for (let k = 0; k < 3; k++) tree(R.n(W2 * 0.4), R.n(D2 * 0.35), R.r(0.9, 1.3));
  } else if (use === 'tower') {
    const w = R.r(24, 36), d = R.r(22, 32), h = Math.max(45, 160 - Math.hypot(b.x - 470, b.z + 2930) * 0.22 + R.r(-30, 25));
    add({ t: 'glass', lx: R.n(8), lz: R.n(6), w, d, h, col: R.pick(NR_COL.glass), roof: 'flat' });
    add({ t: 'apt', lx: R.f() < 0.5 ? -W2 + 14 : W2 - 14, lz: 0, w: 24, d: b.d - 8, h: R.r(10, 20), col: R.pick(NR_COL.apt), roof: 'flat' });
  } else if (use === 'ware') {
    const n = R.i(1, 3); for (let k = 0; k < n; k++) add({ t: 'ware', lx: (k - (n - 1) / 2) * (b.w / n), lz: R.n(10), w: b.w / n - 10, d: R.r(40, 70), h: R.r(8, 15), col: R.pick(NR_COL.ware), roof: 'flat' });
  } else if (use === 'sub') {
    sides(R.r(17, 22), 24, 0, (lx, lz, w, d, f) => { const long = Math.abs(Math.sin(f)) > 0.5, hw = R.r(9, 13), hd = R.r(8, 11), inset = R.r(-2, 3);
      const off = [Math.sin(f) * inset, Math.cos(f) * inset];
      const hx = lx - off[0], hz = lz - off[1], hh = R.i(1, 2) * 3 + 0.8, hcol = R.pick(NR_COL.house);
      add({ t: 'house2', lx: hx, lz: hz, w: long ? hd : hw, d: long ? hw : hd, h: hh, col: hcol, roof: R.f() < 0.7 ? 'hip' : 'gable', rcol: R.pick(NR_COL.roof) });
      // porch on the street side, a garage beside, the driveway out to the kerb
      const fx = Math.sin(f), fz = Math.cos(f), sx = Math.cos(f), sz = -Math.sin(f), th = b.a + f;
      if (R.f() < 0.75) { const [px, pz] = at(hx + fx * (hd / 2 + 1.2), hz + fz * (hd / 2 + 1.2)); P.extras.push({ k: 'porch', x: px, z: pz, a: th, w: R.r(3.5, 5), col: hcol }); }
      if (R.f() < 0.6) { const sd = R.f() < 0.5 ? 1 : -1, gx = hx + sx * sd * (hw / 2 + 2), gz = hz + sz * sd * (hw / 2 + 2); const [qx, qz] = at(gx + fx * 0.8, gz + fz * 0.8); P.extras.push({ k: 'garage', x: qx, z: qz, a: th, col: hcol });
        const [dx, dz] = at(gx + fx * (hd / 2 + 4.5), gz + fz * (hd / 2 + 4.5)); P.drives.push({ x: dx, z: dz, a: th, w: 3.4, d: 9 }); }
      const [x, z] = at(lx + Math.sin(f) * 7, lz + Math.cos(f) * 7);
      if (R.f() < 0.22) P.pools.push({ x, z, a: b.a, w: R.r(4, 7), d: R.r(2.5, 4) });
      else if (R.f() < 0.8) P.trees.push({ t: R.f() < 0.15 ? 'cyp' : 'broad', x: x + R.n(3), z: z + R.n(3), s: R.r(0.7, 1.15) }); });
  } else if (use === 'park') {
    P.parks.push({ x: b.x, z: b.z, a: b.a, w: b.w, d: b.d });
    for (let k = 0; k < 26; k++) tree(R.n(W2 - 4), R.n(D2 - 4), R.r(0.9, 1.5));
  } else if (use === 'lot') {   // a car park full of cars, a low supermarket at one end
    add({ t: 'ware', lx: -W2 + 14, lz: 0, w: 24, d: b.d - 6, h: 7, col: R.pick(['#e8dccb', '#d9d4ca', '#c9d6dc']), roof: 'flat' });
    for (let u = -W2 + 32; u < W2 - 3; u += 2.6) for (const v of [-D2 + 4, -D2 + 9, -6, -1, 4, 9, D2 - 9, D2 - 4]) { if (Math.abs(v) > D2 - 2 || R.f() > 0.78) continue; const [x, z] = at(u, v); P.parked.push({ x, z, a: b.a + Math.PI / 2 + (R.f() < 0.5 ? 0 : Math.PI), c: R.pick(NR_COL.car) }); }
    P.lots.push({ x: b.x, z: b.z, a: b.a, w: b.w, d: b.d });
  } else if (use === 'plaza') {
    P.plazas.push({ x: b.x, z: b.z, a: b.a, w: b.w, d: b.d });
    for (let k = 0; k < 10; k++) { const t = k / 10 * TAU; tree(Math.cos(t) * W2 * 0.8, Math.sin(t) * D2 * 0.8, 0.8); }
  }
  // street trees on the pavement around most blocks; courtyard trees
  const RS = RNG('nr-street', Math.round(b.x), Math.round(b.z));
  if (use !== 'park' && use !== 'ware' && RS.f() < (b.k === 'old' ? 0.45 : 0.95)) {
    const off = 2.6, gap = RS.r(7, 10), sz = RS.r(0.75, 1.05);
    for (let u = -W2 + 4; u < W2 - 2; u += gap) for (const sg of [-1, 1]) if (RS.f() < 0.85) tree(u, sg * (D2 + off), sz * RS.r(0.85, 1.15));
    for (let v = -D2 + 4; v < D2 - 2; v += gap) for (const sg of [-1, 1]) if (RS.f() < 0.85) tree(sg * (W2 + off), v, sz * RS.r(0.85, 1.15));
  }
  if (use === 'apt') for (let k = 0; k < 7; k++) tree(RS.n(W2 - 16), RS.n(D2 - 15), RS.r(0.8, 1.3));
  if (use === 'sub' || use === 'row') for (let k = 0; k < 6; k++) tree(RS.n(W2 - 3), RS.n(D2 * 0.2), RS.r(0.8, 1.3));
  // parked cars along the kerbs (painted on the map)
  if (use !== 'park' && use !== 'plaza' && use !== 'lot') for (let k = 0; k < 5; k++) { const s = R.f() < 0.5, u = R.n(W2 - 3), [x, z] = s ? at(u, (R.f() < 0.5 ? 1 : -1) * (D2 + 2.2)) : at((R.f() < 0.5 ? 1 : -1) * (W2 + 2.2), R.n(D2 - 3)); P.parked.push({ x, z, a: b.a + (s ? 0 : Math.PI / 2), c: R.pick(NR_COL.car) }); }
}
NR_COL.car = ['#c8372d', '#2f6fd1', '#f2f0ea', '#1e1f22', '#8a9096', '#e0a43a', '#3a8a5a', '#d9d4c8', '#5a6a7a', '#b8babc', '#7a2a24', '#f0c33c', '#2a9d8f'];

// ---------------------------------------------------------------- the land-use maps (canvas, world coordinates)
function nrDrawMap(B, P, lvl) {
  const cv = document.createElement('canvas'); cv.width = cv.height = B.res; const x = cv.getContext('2d');
  const k = B.res / B.s, px = 1 / k; x.setTransform(k, 0, 0, k, -B.x0 * k, -B.z0 * k);
  const inB = (cx, cz, r) => cx + r > B.x0 && cx - r < B.x0 + B.s && cz + r > B.z0 && cz - r < B.z0 + B.s;
  const path = (pts, close = true) => { x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); if (close) x.closePath(); };
  const rect = (cx, cz, a, w, d) => { const ux = Math.cos(a), uz = -Math.sin(a), vx = Math.sin(a), vz = Math.cos(a), hw = w / 2, hd = d / 2;
    x.beginPath(); x.moveTo(cx - ux * hw - vx * hd, cz - uz * hw - vz * hd); x.lineTo(cx + ux * hw - vx * hd, cz + uz * hw - vz * hd); x.lineTo(cx + ux * hw + vx * hd, cz + uz * hw + vz * hd); x.lineTo(cx - ux * hw + vx * hd, cz - uz * hw + vz * hd); x.closePath(); };
  const stroke = (pts, w, col, minPx = 0.8) => { x.lineWidth = Math.max(w, minPx * px); x.strokeStyle = col; x.lineJoin = x.lineCap = 'round'; path(pts, false); x.stroke(); };
  const R = RNG('nr-map', lvl);
  // sea floor, land, the far bay
  x.fillStyle = '#c9b48a'; x.fillRect(B.x0, B.z0, B.s, B.s);
  x.fillStyle = '#93ac62'; path(NR_LAND); x.fill();
  // a soft large-scale tint so the land is never one flat colour
  for (let i = 0; i < 260; i++) { const cx = B.x0 + R.f() * B.s, cz = B.z0 + R.f() * B.s, r = B.s * R.r(0.02, 0.09), g = x.createRadialGradient(cx, cz, 0, cx, cz, r);
    const c = R.pick(['120,140,70', '160,150,90', '90,120,60', '150,160,100']); g.addColorStop(0, `rgba(${c},0.22)`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.fillRect(cx - r, cz - r, 2 * r, 2 * r); }
  // fields
  for (const f of P.fields) { const [a] = f.pts; if (!inB(a[0], a[1], 1200)) continue;
    x.fillStyle = f.col; path(f.pts); x.fill();
    if (lvl < 2 && f.rows) { x.save(); path(f.pts); x.clip(); x.strokeStyle = 'rgba(60,50,30,0.13)'; x.lineWidth = 1.6 * px; const ca = Math.cos(f.a), sa = Math.sin(f.a), [c0, c2] = [f.pts[0], f.pts[2]], mx = (c0[0] + c2[0]) / 2, mz = (c0[1] + c2[1]) / 2, L = Math.hypot(c2[0] - c0[0], c2[1] - c0[1]);
      x.beginPath(); for (let s = -L; s < L; s += 4.5 * px) { x.moveTo(mx + ca * s - sa * L, mz - sa * s - ca * L); x.lineTo(mx + ca * s + sa * L, mz - sa * s + ca * L); } x.stroke(); x.restore(); }
    if (f.edge) { x.strokeStyle = 'rgba(52,78,36,0.55)'; x.lineWidth = Math.max(2.5, 1.2 * px); path(f.pts); x.stroke(); }
  }
  // the mountains: scrub, rock and forest tones
  if (lvl > 0) for (let i = 0; i < 1400; i++) { const cx = R.r(-32000, -2500), cz = R.r(-64000, -2200); if (nrMountain(cx, cz) < 0.2 || !inB(cx, cz, 2000)) continue;
    const r = R.r(300, 1800), g = x.createRadialGradient(cx, cz, 0, cx, cz, r), c = R.pick(['70,95,50', '110,120,80', '130,120,100', '60,85,45']);
    g.addColorStop(0, `rgba(${c},0.45)`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.fillRect(cx - r, cz - r, 2 * r, 2 * r); }
  // forests: dark canopy with a dotted crown texture
  for (const f of P.forests) { if (!inB(f.x, f.z, f.r * 1.3)) continue;
    x.fillStyle = f.pine ? '#3d5e34' : '#4a7038'; path(f.pts); x.fill();
    if (lvl < 2) { x.save(); path(f.pts); x.clip(); const n = Math.min(4000, Math.round(f.r * f.r / (lvl ? 160 : 60))); for (let q = 0; q < n; q++) { const cx = f.x + R.n(f.r * 1.2), cz = f.z + R.n(f.r * 1.2), r = R.r(2.5, 5.5);
      x.fillStyle = R.f() < 0.5 ? 'rgba(30,48,24,0.5)' : 'rgba(110,150,70,0.35)'; x.beginPath(); x.arc(cx, cz, Math.max(r, 0.7 * px), 0, TAU); x.fill(); } x.restore(); } }
  // villages and farmyards
  for (const v of P.villages) { if (!inB(v.x, v.z, 400)) continue; x.fillStyle = 'rgba(175,165,140,0.55)'; x.beginPath(); x.ellipse(v.x, v.z, v.r * 1.1, v.r * 0.8, -v.a, 0, TAU); x.fill(); }
  for (const f of P.farms) { if (!inB(f.x, f.z, 60)) continue; x.fillStyle = '#b3a684'; rect(f.x + Math.cos(f.a) * 12, f.z - Math.sin(f.a) * 12, f.a, 60, 40); x.fill(); }
  // the river with green banks
  if (inB(1000, -6000, 8000)) { stroke(NR_RIVER, 70, '#6f9a58', 1.5); stroke(NR_RIVER, 44, '#3f7b8a', 1.2); stroke(NR_RIVER, 30, '#4a8a98', 0.8); }
  // the town: streets under every block, then the block grounds
  if (lvl < 2) {
    for (const b of P.blocks) { x.fillStyle = b.k === 'sub' ? '#8d8a84' : '#7d7a75'; rect(b.x, b.z, b.a, b.w + b.sw + 1.5, b.d + b.sw + 1.5); x.fill(); }
    for (const b of P.blocks) { x.fillStyle = '#bdb4a4'; rect(b.x, b.z, b.a, b.w + 4, b.d + 4); x.fill(); if (lvl === 0) { x.strokeStyle = '#e2dccf'; x.lineWidth = 0.4; rect(b.x, b.z, b.a, b.w + 4, b.d + 4); x.stroke(); x.strokeStyle = 'rgba(90,85,78,0.5)'; x.lineWidth = 0.25; rect(b.x, b.z, b.a, b.w + 4.5, b.d + 4.5); x.stroke(); } }
    for (const b of P.blocks) {
      x.fillStyle = { old: '#c3b296', row: '#b9b29c', apt: '#b4ab9b', tower: '#c9c0ae', ware: '#a8a59d', sub: '#86a659', park: '#79a64f', plaza: '#d9cdb4' }[b.use] || '#b5ad9c';
      rect(b.x, b.z, b.a, b.w, b.d); x.fill();
      if (b.use === 'apt' || b.use === 'tower') { x.fillStyle = '#88a560'; rect(b.x, b.z, b.a, b.w - 30, b.d - 30); x.fill(); }
      if (b.use === 'park') { x.strokeStyle = '#d8ccae'; x.lineWidth = 3; x.beginPath(); x.ellipse(b.x, b.z, b.w * 0.33, b.d * 0.3, -b.a, 0, TAU); x.stroke(); }
      if (b.use === 'lot') { x.fillStyle = '#7a7874'; rect(b.x + Math.cos(b.a) * 14, b.z - Math.sin(b.a) * 14, b.a, b.w - 28, b.d - 2); x.fill();
        if (lvl === 0) { x.strokeStyle = 'rgba(245,242,230,0.85)'; x.lineWidth = 0.15; const ca = Math.cos(b.a), sa = Math.sin(b.a); for (let u = -b.w / 2 + 31; u < b.w / 2 - 2; u += 2.6) for (const v0 of [-b.d / 2 + 1.5, -b.d / 2 + 6.5, -8.5, 1.5, b.d / 2 - 11.5]) { if (v0 + 10 > b.d / 2) continue; x.beginPath(); x.moveTo(b.x + u * ca + v0 * sa, b.z - u * sa + v0 * ca); x.lineTo(b.x + u * ca + (v0 + 5) * sa, b.z - u * sa + (v0 + 5) * ca); x.stroke(); } } }
      if (b.use === 'plaza' && lvl === 0) { x.strokeStyle = 'rgba(150,135,110,0.5)'; x.lineWidth = 0.6; for (let q = -b.w / 2; q < b.w / 2; q += 6) { rect(b.x, b.z, b.a, Math.abs(q) * 2 + 1, Math.abs(q) * 2 * b.d / b.w + 1); x.stroke(); } }
      if (lvl === 0) { // centre-line dashes on the street to one side
        x.strokeStyle = 'rgba(240,236,220,0.6)'; x.lineWidth = 0.35; x.setLineDash([3, 4]); const ca = Math.cos(b.a), sa = Math.sin(b.a), o = b.d / 2 + b.sw / 2;
        x.beginPath(); x.moveTo(b.x - ca * b.w / 2 + sa * o, b.z + sa * b.w / 2 + ca * o); x.lineTo(b.x + ca * b.w / 2 + sa * o, b.z - sa * b.w / 2 + ca * o); x.stroke(); x.setLineDash([]); }
    }
    { const a = [], b = []; for (let xx = 60; xx <= 3400; xx += 40) { a.push([xx, -633]); b.push([xx, -688]); } x.fillStyle = '#c6bdad'; path([...a, ...b.reverse()]); x.fill(); }
    for (const p of P.parks) { for (let q = 0; q < 3; q++) { x.fillStyle = 'rgba(60,110,40,0.35)'; x.beginPath(); x.ellipse(p.x + R.n(p.w * 0.3), p.z + R.n(p.d * 0.3), R.r(8, 20), R.r(6, 14), 0, 0, TAU); x.fill(); } }
    for (const [cx, cz, r] of P.clumps || []) { const g = x.createRadialGradient(cx, cz, 0, cx, cz, r * 1.6); g.addColorStop(0, 'rgba(50,80,30,0.45)'); g.addColorStop(1, 'rgba(50,80,30,0)'); x.fillStyle = g; x.fillRect(cx - r * 1.6, cz - r * 1.6, r * 3.2, r * 3.2); }
    // building footprints with a soft contact shadow
    for (const o of P.bld) { if (!inB(o.x, o.z, 80)) continue; x.fillStyle = 'rgba(40,36,32,0.35)'; rect(o.x, o.z, o.a, o.w + 3, o.d + 3); x.fill(); }
    if (lvl === 0) {
      for (const d of P.drives) { x.fillStyle = '#b8b2a6'; rect(d.x, d.z, d.a, d.w, d.d); x.fill(); }
      for (const p of P.pools) { x.fillStyle = '#e8e2d4'; rect(p.x, p.z, p.a, p.w + 1.4, p.d + 1.4); x.fill(); x.fillStyle = '#3fc0d8'; rect(p.x, p.z, p.a, p.w, p.d); x.fill(); }
      for (const c of P.parked) { x.fillStyle = 'rgba(30,30,30,0.25)'; rect(c.x, c.z, c.a, 4.6, 2.2); x.fill(); }
    }
  }
  // special places
  for (const s of P.specials) { if (!inB(s.x, s.z, 400)) continue;
    if (s.k === 'stadium') { x.fillStyle = '#9a968e'; x.beginPath(); x.ellipse(s.x, s.z, 140, 112, -s.a, 0, TAU); x.fill(); x.fillStyle = '#4f9a48'; rect(s.x, s.z, s.a, 105, 68); x.fill();
      if (lvl === 0) { for (let q = 0; q < 10; q++) { x.fillStyle = q % 2 ? 'rgba(255,255,255,0.08)' : 'rgba(0,40,0,0.08)'; const u = -47.25 + q * 10.5, ca = Math.cos(s.a), sa = Math.sin(s.a); rect(s.x + ca * u, s.z - sa * u, s.a, 10.5, 68); x.fill(); }
        x.strokeStyle = 'rgba(255,255,255,0.85)'; x.lineWidth = 0.4; rect(s.x, s.z, s.a, 100, 64); x.stroke(); x.beginPath(); x.ellipse(s.x, s.z, 9, 9, 0, 0, TAU); x.stroke(); } }
    else if (s.k === 'park' || s.k === 'park2') { x.fillStyle = '#6fa04c'; rect(s.x, s.z, s.a, s.w, s.d); x.fill(); x.fillStyle = '#4f8fa0'; x.beginPath(); x.ellipse(s.x + 40, s.z + 10, 55, 30, 0.3, 0, TAU); x.fill();
      x.strokeStyle = '#ddd2b6'; x.lineWidth = 3; x.beginPath(); x.moveTo(s.x - s.w / 2, s.z); x.bezierCurveTo(s.x - 60, s.z - 80, s.x + 20, s.z + 90, s.x + s.w / 2, s.z - 20); x.stroke(); }
    else if (s.k === 'station') { x.fillStyle = '#9d988e'; rect(s.x, s.z, s.a, s.w, s.d); x.fill(); }
    else if (s.k === 'cathedral' || s.k === 'church') { x.fillStyle = '#d8ccb0'; rect(s.x, s.z, s.a, s.w, s.d); x.fill(); }
    else if (s.k === 'school') { x.fillStyle = '#b0a898'; rect(s.x, s.z, s.a, s.w, s.d); x.fill(); x.fillStyle = '#b8583e'; rect(s.x + 60, s.z + 30, s.a, 90, 50); x.fill(); x.fillStyle = '#5f9a4a'; rect(s.x - 70, s.z - 30, s.a, 70, 45); x.fill(); }
  }
  // the rail line, the roads (with bridges over the river), the coast
  if (inB(2000, -5000, 9000)) { stroke(NR_RAIL, 16, '#9a8f80', 1.2); if (lvl === 0) { stroke(NR_RAIL, 6, '#6a6058'); stroke(NR_RAIL, 4.6, '#9a8f80'); } }
  for (const pts of P.croads) { stroke(pts, 13, '#9a9a72', 1.2); stroke(pts, 9, '#cfc6b2', 1.0); }
  for (const [pts, w, kind] of NR_ROADS) { stroke(pts, w + 4, '#a8a191', 1); stroke(pts, w, kind === 1 ? '#6f6d6a' : '#7b7873', 1);
    if (lvl === 0) { x.setLineDash(kind === 1 ? [] : [3, 5]); stroke(pts, 0.3, 'rgba(245,240,225,0.75)'); x.setLineDash([]); } }
  // the beach, the promenade and the waterline
  { const bx = []; for (let xx = 60; xx <= 9000; xx += 20) bx.push([xx, nrBeachZ(xx) + 14]);
    const back = bx.map(([xx]) => [xx, nrBeachZ(xx) - 40]).reverse();
    const g = x.createLinearGradient(0, -546, 0, -600); g.addColorStop(0, '#cbb68c'); g.addColorStop(0.2, '#d9c59a'); g.addColorStop(0.35, '#ead8ae'); g.addColorStop(1, '#efe0bb');
    x.fillStyle = g; path([...bx, ...back]); x.fill();
    if (lvl === 0) { for (let q = 0; q < 26000; q++) { const xx = R.r(60, 3400), zz = R.r(-600, nrBeachZ(xx)); x.fillStyle = R.f() < 0.5 ? 'rgba(150,120,80,0.16)' : 'rgba(255,250,235,0.25)'; x.fillRect(xx, zz, R.r(0.3, 1.2), R.r(0.3, 1.2)); } }
    const prom = bx.map(([xx]) => [xx, nrBeachZ(xx) - 40]), prom2 = bx.map(([xx]) => [xx, nrBeachZ(xx) - 58]).reverse();
    x.fillStyle = '#d9cbb0'; path([...prom, ...prom2]); x.fill();
    if (lvl === 0) { x.strokeStyle = 'rgba(160,120,90,0.35)'; x.lineWidth = 0.5; for (let xx = 60; xx < 3400; xx += 3) { x.beginPath(); x.moveTo(xx, nrBeachZ(xx) - 40); x.lineTo(xx, nrBeachZ(xx) - 58); x.stroke(); } }
    stroke(prom, 1.6, '#e8e2d2'); }
  // the gulf shore: a thin strip of sand / rock; the rocky point
  stroke(NR_WEST.slice(0, 26), 18, '#c4b48e', 1.2);
  // the west shore of the old town: a small sandy cove, a paved walk with a low wall, gardens
  { const w = [[60, -575], ...NR_WEST.slice(0, 5)]; stroke(w, 46, '#d6c4a0', 1.2); stroke(w.map(([a, b]) => [a + 30, b]), 16, '#cdbfa6', 1); stroke(w.map(([a, b]) => [a + 39, b]), 2, '#efe6d2', 1); }
  { x.fillStyle = '#8a8378'; x.beginPath(); x.ellipse(24, -1262, 30, 40, 0, 0, TAU); x.fill(); if (lvl === 0) for (let q = 0; q < 400; q++) { x.fillStyle = R.pick(['#6f6a62', '#9d968a', '#7d766a', '#5f5a52']); x.beginPath(); x.arc(24 + R.n(32), -1262 + R.n(42), R.r(0.6, 3), 0, TAU); x.fill(); } }
  // the port: concrete quays
  { const RP = RNG('nr-port'); x.fillStyle = '#aaa69d'; for (const q of NR_PORT) { rect(q.x, q.z, q.a, q.w, q.d); x.fill(); } }
  return cv;
}
const NR_PORT = (() => {   // three piers sticking out of the port shore into the gulf
  const A = [-480, -1820], B = [-1100, -2250], L = Math.hypot(B[0] - A[0], B[1] - A[1]), d = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], n = [d[1], -d[0]];
  const nn = n[1] > 0 ? n : [-n[0], -n[1]], a = Math.atan2(nn[0], nn[1]), o = [];
  for (let k = 0; k < 3; k++) { const s = 140 + k * 210; o.push({ x: A[0] + d[0] * s + nn[0] * 95, z: A[1] + d[1] * s + nn[1] * 95, a, w: 46, d: 210 }); }
  return o; })();
// aux: water (river, pools, ponds) in R; coast masks for the sea shader
function nrAuxMap(B, P, res) {
  const cv = document.createElement('canvas'); cv.width = cv.height = res; const x = cv.getContext('2d'), k = res / B.s; x.fillStyle = '#000'; x.fillRect(0, 0, res, res);
  x.setTransform(k, 0, 0, k, -B.x0 * k, -B.z0 * k); x.strokeStyle = '#fff'; x.lineWidth = 36; x.lineJoin = x.lineCap = 'round';
  x.beginPath(); NR_RIVER.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke();
  x.fillStyle = '#fff'; for (const s of P.specials) if (s.k === 'park' || s.k === 'park2') { x.beginPath(); x.ellipse(s.x + 40, s.z + 10, 55, 30, 0.3, 0, TAU); x.fill(); }
  for (const p of P.pools) { x.save(); x.translate(p.x, p.z); x.rotate(-p.a); x.fillRect(-p.w / 2, -p.d / 2, p.w, p.d); x.restore(); }
  return cv;
}
function nrCoastMap(B, res, blurA, blurB) {
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = res; return c; };
  const land = mk(), lx = land.getContext('2d'), k = res / B.s; lx.fillStyle = '#000'; lx.fillRect(0, 0, res, res);
  lx.setTransform(k, 0, 0, k, -B.x0 * k, -B.z0 * k); lx.fillStyle = '#fff';
  const path = (pts) => { lx.beginPath(); pts.forEach(([a, b], i) => (i ? lx.lineTo(a, b) : lx.moveTo(a, b))); lx.closePath(); };
  path(NR_LAND); lx.fill(); lx.fillStyle = '#000'; path(NR_BAY); lx.fill(); lx.fillStyle = '#fff'; for (const q of NR_PORT) { lx.save(); lx.translate(q.x, q.z); lx.rotate(-q.a); lx.fillRect(-q.w / 2, -q.d / 2, q.w, q.d); lx.restore(); }
  const blur = (r) => { const c = mk(), x = c.getContext('2d'); x.filter = `blur(${r}px)`; x.drawImage(land, 0, 0); return x.getImageData(0, 0, res, res).data; };
  const A = blur(blurA), Bb = blur(blurB), L = lx.getImageData(0, 0, res, res).data, out = mk(), ox = out.getContext('2d'), im = ox.createImageData(res, res);
  for (let i = 0; i < res * res; i++) { im.data[i * 4] = A[i * 4]; im.data[i * 4 + 1] = Bb[i * 4]; im.data[i * 4 + 2] = L[i * 4]; im.data[i * 4 + 3] = 255; }
  ox.putImageData(im, 0, 0); return out;
}

// ---------------------------------------------------------------- code-drawn textures
function nrTexDetail() {   // R: fine grain (ground detail), G: big blotches; tiles
  return g3Tex((x, w) => { const R = RNG('nr-det'); x.fillStyle = 'rgb(128,128,128)'; x.fillRect(0, 0, w, w);
    for (let i = 0; i < 900; i++) { const px = R.f() * w, py = R.f() * w, r = R.r(4, 40), v = R.f() < 0.5 ? 0 : 255; for (const dx of [-w, 0, w]) for (const dy of [-w, 0, w]) { const g = x.createRadialGradient(px + dx, py + dy, 0, px + dx, py + dy, r); g.addColorStop(0, `rgba(${v},${v},${v},0.13)`); g.addColorStop(1, `rgba(${v},${v},${v},0)`); x.fillStyle = g; x.fillRect(px + dx - r, py + dy - r, 2 * r, 2 * r); } }
    for (let i = 0; i < 30000; i++) { const v = R.f() < 0.5 ? 70 : 200; x.fillStyle = `rgba(${v},${v},${v},${R.r(0.08, 0.25)})`; x.fillRect(R.f() * w, R.f() * w, R.r(1, 2.5), R.r(1, 2.5)); }
  }, 512, 512, false);
}
function nrTexFacade(kind) {   // 2 bays (8 m) wide; top half = an upper floor (3 m), bottom half = the ground floor. 0 plaster house, 4 sided house, 1 apartments, 2 glass, 3 warehouse
  return g3Tex((x, w, h) => {
    const R = RNG('nr-fac', kind), bw = w / 2, fh = h / 2, sid = kind === 4;
    x.fillStyle = kind === 2 ? '#7e95a6' : '#ececec'; x.fillRect(0, 0, w, h);
    if (kind !== 2) for (let i = 0; i < 9000; i++) { const v = R.f() < 0.5 ? 205 : 250; x.fillStyle = `rgba(${v},${v},${v},${R.r(0.05, 0.18)})`; x.fillRect(R.f() * w, R.f() * h, R.r(1, 3), R.r(1, 3)); }
    if (sid) for (let y = 0; y < h; y += 9) { x.fillStyle = 'rgba(150,150,150,0.45)'; x.fillRect(0, y, w, 1.5); x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(0, y + 1.5, w, 1); }
    const win = (X, Y, ww, hh, shut) => {   // frame, glass with sky gradient, cross mullions, sill, lintel, shutters
      if (shut) { x.fillStyle = R.pick(['#3f6e55', '#3d5a80', '#7a4a32', '#2f3b46', '#5d7f4f']); x.fillRect(X - ww * 0.42, Y, ww * 0.38, hh); x.fillRect(X + ww * 1.04, Y, ww * 0.38, hh);
        x.fillStyle = 'rgba(0,0,0,0.18)'; for (let k = 0; k < 6; k++) { x.fillRect(X - ww * 0.42, Y + hh * (k + 0.5) / 6, ww * 0.38, 1.5); x.fillRect(X + ww * 1.04, Y + hh * (k + 0.5) / 6, ww * 0.38, 1.5); } }
      x.fillStyle = '#fbfaf6'; x.fillRect(X - 5, Y - 5, ww + 10, hh + 10);
      const g = x.createLinearGradient(X, Y, X + ww * 0.6, Y + hh); g.addColorStop(0, '#9fb8cc'); g.addColorStop(0.45, '#4d6272'); g.addColorStop(1, '#2b3640'); x.fillStyle = g; x.fillRect(X, Y, ww, hh);
      x.fillStyle = 'rgba(255,255,255,0.25)'; x.beginPath(); x.moveTo(X, Y + hh * 0.5); x.lineTo(X + ww * 0.5, Y); x.lineTo(X + ww * 0.7, Y); x.lineTo(X, Y + hh * 0.75); x.fill();
      x.fillStyle = '#fbfaf6'; x.fillRect(X + ww / 2 - 2.5, Y, 5, hh); x.fillRect(X, Y + hh * 0.42, ww, 5);
      x.fillStyle = '#f2efe7'; x.fillRect(X - 9, Y + hh + 4, ww + 18, 7); x.fillStyle = 'rgba(0,0,0,0.22)'; x.fillRect(X - 9, Y + hh + 11, ww + 18, 3);
      x.fillStyle = '#e8e4dc'; x.fillRect(X - 7, Y - 12, ww + 14, 7); };
    for (let c = 0; c < 2; c++) {
      const X = c * bw;
      if (kind === 0 || kind === 4) {
        win(X + bw * 0.32, fh * 0.2, bw * 0.36, fh * 0.55, R.f() < 0.75);
        if (c === 0) { x.fillStyle = '#fbfaf6'; x.fillRect(X + bw * 0.33, fh + fh * 0.18, bw * 0.34, fh * 0.82); x.fillStyle = R.pick(['#7a3a2a', '#2f4a6a', '#3d5a40', '#5a3a2a']); x.fillRect(X + bw * 0.37, fh + fh * 0.24, bw * 0.26, fh * 0.76);
          x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(X + bw * 0.4, fh + fh * 0.3, bw * 0.2, fh * 0.25); x.fillStyle = '#d8b04a'; x.fillRect(X + bw * 0.58, fh + fh * 0.62, 5, 5); x.fillStyle = '#8a8a86'; x.fillRect(X + bw * 0.28, fh + fh * 0.96, bw * 0.44, fh * 0.04); }
        else win(X + bw * 0.32, fh + fh * 0.22, bw * 0.36, fh * 0.52, R.f() < 0.75);
        x.fillStyle = 'rgba(0,0,0,0.1)'; x.fillRect(X, fh * 0.97, bw, fh * 0.03);
      } else if (kind === 1) {
        win(X + bw * 0.14, fh * 0.16, bw * 0.72, fh * 0.6, false);
        x.fillStyle = '#d9d5cd'; x.fillRect(X + bw * 0.06, fh * 0.78, bw * 0.88, fh * 0.08); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(X + bw * 0.06, fh * 0.86, bw * 0.88, fh * 0.04);
        x.fillStyle = 'rgba(40,50,60,0.55)'; x.fillRect(X + bw * 0.06, fh * 0.6, bw * 0.88, 3); for (let q = 0; q < 16; q++) x.fillRect(X + bw * 0.07 + q * bw * 0.055, fh * 0.6, 2, fh * 0.18);
        // ground floor: shop window and a striped awning
        x.fillStyle = '#2f3d48'; x.fillRect(X + bw * 0.08, fh + fh * 0.3, bw * 0.84, fh * 0.66); x.fillStyle = 'rgba(255,240,210,0.35)'; x.fillRect(X + bw * 0.1, fh + fh * 0.34, bw * 0.4, fh * 0.3);
        const aw = R.pick([['#c8372d', '#f4f1ea'], ['#2f6fb0', '#f4f1ea'], ['#3a8a5a', '#f4f1ea'], ['#e0a43a', '#6a4a2a']]); for (let q = 0; q < 8; q++) { x.fillStyle = aw[q % 2]; x.fillRect(X + bw * 0.06 + q * bw * 0.11, fh + fh * 0.12, bw * 0.11, fh * 0.16); }
      } else if (kind === 2) { for (let r = 0; r < 2; r++) { const Y = r * fh, sky = 1 - r * 0.25; x.fillStyle = `rgb(${90 + 50 * sky},${118 + 50 * sky},${140 + 50 * sky})`; x.fillRect(X + 2, Y + 2, bw - 4, fh - 4);
          const g = x.createLinearGradient(X, Y, X + bw, Y + fh); g.addColorStop(0, 'rgba(255,255,255,0.2)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,20,40,0.15)'); x.fillStyle = g; x.fillRect(X + 2, Y + 2, bw - 4, fh - 4); x.fillStyle = '#5c6e7c'; x.fillRect(X, Y + fh - 4, bw, 4); x.fillRect(X + bw / 2 - 1, Y, 2, fh); } }
      else { x.fillStyle = 'rgba(0,0,0,0.08)'; for (let q = 0; q < bw; q += 10) x.fillRect(X + q, 0, 3, h); x.fillStyle = '#5a6670'; x.fillRect(X + 6, fh * 0.2, bw - 12, fh * 0.2); if (c === 0) { x.fillStyle = '#8a9298'; x.fillRect(X + bw * 0.2, fh * 1.1, bw * 0.6, fh * 0.9); for (let q = 0; q < 10; q++) { x.fillStyle = 'rgba(0,0,0,0.15)'; x.fillRect(X + bw * 0.2, fh * 1.1 + q * fh * 0.09, bw * 0.6, 2); } } }
    }
  }, 512, 256);
}

// ---------------------------------------------------------------- the shader patch for built-in materials
// curvature, the flood that swallows things ahead of the wave, aerial perspective; optional ground / facade code.
function nrPatch(mat, o = {}) {
  mat.fog = false;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, NRU, o.uniforms || {});
    let vs = sh.vertexShader, fs = sh.fragmentShader;
    vs = 'uniform float uNrH, uNrOff;\nvarying vec3 vNrW;\n' + (o.vDecl || '') + '\n' + CURVE_GLSL + '\n' + vs;
    if (o.vMain) vs = vs.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + o.vMain);
    const sinkI = `
      #ifdef USE_INSTANCING
      { vec4 nrO = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0); float nrZp = nrO.z / uNrH - uNrOff, nrK = smoothstep(-3.55, -2.85, nrZp) * step(nrZp, 7.0);
        nrWp.y -= nrK * (max(nrO.y, 0.0) + length(instanceMatrix[1].xyz) * ${(o.gh || 1).toFixed(2)} + 4.0 + 0.1 * uNrH); }
      #else
      { vec4 nrO = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0); float nrZp = nrO.z / uNrH - uNrOff, nrK = smoothstep(-3.55, -2.85, nrZp) * step(nrZp, 7.0);
        nrWp.y -= nrK * (max(nrO.y, 0.0) + 0.5 * uNrH + 70.0); }
      #endif`;
    const sinkV = `{ float nrZp = nrWp.z / uNrH - uNrOff, nrK = smoothstep(-3.0, -2.78, nrZp) * step(nrZp, 8.0); nrWp.y = mix(nrWp.y, -0.06 * uNrH - 2.0, nrK); }`;
    const sinkB = `{ float nrZp = (aOrg.x + modelMatrix[3].z) / uNrH - uNrOff, nrK = smoothstep(-3.55, -2.85, nrZp) * step(nrZp, 7.0);
        nrWp.y -= nrK * (max(aOrg.y, 0.0) + aOrg.z + 4.0 + 0.1 * uNrH); }`;
    if (o.sink === 'bake') vs = 'attribute vec3 aOrg;\n' + vs;
    vs = vs.replace('#include <project_vertex>', `
      vec4 nrP = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        nrP = instanceMatrix * nrP;
      #endif
      vec4 nrWp = modelMatrix * nrP;
      ${o.sink === 'inst' ? sinkI : o.sink === 'vert' ? sinkV : o.sink === 'bake' ? sinkB : ''}
      nrWp.xyz = curveDrop(nrWp.xyz);
      vNrW = nrWp.xyz;
      vec4 mvPosition = viewMatrix * nrWp;
      gl_Position = projectionMatrix * mvPosition;`);
    fs = 'varying vec3 vNrW;\n' + NR_FOG_GLSL + '\n' + (o.fDecl || '') + '\n' + fs;
    if (o.fMap) fs = fs.replace('#include <map_fragment>', o.fMap);
    fs = fs.replace('#include <tonemapping_fragment>', 'gl_FragColor.rgb = nrFog(gl_FragColor.rgb, vNrW);\n#include <tonemapping_fragment>');
    sh.vertexShader = vs; sh.fragmentShader = fs;
  };
  mat.customProgramCacheKey = () => 'nr-' + (o.key || 'std') + '-' + (o.sink || 'none') + '-' + (o.gh || 1);
  return mat;
}
// the matching depth material, so sunk things stop casting shadows
function nrDepth(o = {}) {
  const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  m.onBeforeCompile = (sh) => { sh.uniforms.uNrH = NRU.uNrH; sh.uniforms.uNrOff = NRU.uNrOff;
    sh.vertexShader = (o.bake ? 'attribute vec3 aOrg;\n' : '') + 'uniform float uNrH, uNrOff;\n' + sh.vertexShader.replace('#include <project_vertex>', `
      vec4 nrP = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        nrP = instanceMatrix * nrP;
        vec4 nrO = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      #else
        vec4 nrO = ${o.bake ? 'vec4(0.0, 0.0, aOrg.x + modelMatrix[3].z, 1.0)' : 'modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)'};
      #endif
      vec4 nrWp = modelMatrix * nrP;
      float nrZp = nrO.z / uNrH - uNrOff; nrWp.y -= smoothstep(-3.55, -2.85, nrZp) * step(nrZp, 7.0) * (400.0 + 0.2 * uNrH);
      vec4 mvPosition = viewMatrix * nrWp;
      gl_Position = projectionMatrix * mvPosition;`); };
  m.customProgramCacheKey = () => 'nrd-' + (o.key || 'd') + (o.bake ? '-bake' : '');
  return m;
}
const nrSTD = (o, p = {}) => nrPatch(new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0 }, o)), Object.assign({ sink: 'inst', key: 'std-inst' }, p));
// facade materials: UVs from the instance's own size, so windows keep their size on every building
function nrFacadeMat(tex, tw, th, roofHex, key, extra = {}) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 8;
  return nrPatch(new THREE.MeshStandardMaterial(Object.assign({ map: tex, roughness: 0.85, metalness: 0, flatShading: true, vertexColors: true }, extra)), {
    key, sink: 'bake', uniforms: { uNrRoof: { value: lin(roofHex) } },
    vDecl: 'attribute vec3 aLp; varying vec3 vNrLp; varying float vNrOff;',
    vMain: `
      #if 1
        vec3 nrSc = vec3(1.0); float nrOff = aOrg.x * 0.37 + aLp.x * 0.0;
        vNrLp = aLp; vNrOff = floor(nrOff) * 0.5;
      #elif defined(USE_INSTANCING)
        vec3 nrSc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        float nrOff = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.11;
      #else
        vec3 nrSc = vec3(1.0); float nrOff = 0.0;
      #endif`,
    fDecl: `uniform vec3 uNrRoof; varying vec3 vNrLp; varying float vNrOff; ${NR_NOISE_GLSL}`,
    fMap: `vec3 nrFn = abs(normalize(cross(dFdx(vNrLp), dFdy(vNrLp))));
      float vNrRoof = step(0.6, nrFn.y);
      float nrFy = (vNrLp.y - 2.5) / ${th.toFixed(2)};
      float nrU = (nrFn.x > nrFn.z ? vNrLp.z : vNrLp.x) / ${tw.toFixed(1)} + vNrOff;
      vec2 vNrUv = vec2(nrU, (nrFy < 1.0 ? 0.0 : 0.5) + 0.5 * fract(max(nrFy, 0.0)));
      vec4 nrTx = texture2D(map, vNrUv);
      // the wall takes the building's colour; frames, glass, doors, shutters keep their own
      float nrCol = smoothstep(0.03, 0.09, abs(nrTx.r - nrTx.b) + abs(nrTx.g - nrTx.b)) + (1.0 - smoothstep(0.25, 0.45, nrTx.g));
      vec3 nrKeep = mix(vec3(1.0), 1.0 / max(vColor, vec3(0.05)), clamp(nrCol, 0.0, 1.0));
      vec3 nrRf = uNrRoof * (0.85 + 0.3 * nrVN(vNrLp.xz * 0.7)) / max(vColor, vec3(0.05)) * mix(vec3(1.0), vColor, 0.25);
      diffuseColor.rgb *= mix(nrTx.rgb * nrKeep * (0.72 + 0.28 * smoothstep(2.5, 4.2, vNrLp.y)), nrRf, vNrRoof);`,
  });
}

// ---------------------------------------------------------------- build
function nrBuild(g) {
  const P = nrPlan();
  const scene = new THREE.Scene(), world = new THREE.Group(); scene.add(world);
  const S = { scene, world, P, dyn: {}, lods: [] };
  // ---- light: a low warm sun ahead-right (the shared SUN), a sky fill
  const hemi = new THREE.HemisphereLight(0xcfe0f4, 0xa89a80, 0.95); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffeedd, 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 4; sun.shadow.blurSamples = 10; sun.shadow.bias = -0.0004;
  scene.add(sun, sun.target); S.sun = sun; S.hemi = hemi;
  // ---- sky dome
  { const m = new THREE.ShaderMaterial({ uniforms: NRU, side: THREE.BackSide, depthWrite: false, depthTest: false,
      vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w * 0.9999; }',
      fragmentShader: `uniform vec3 uNrZen, uNrMid; uniform float uNrCamY; varying vec3 vD; ${NR_FOG_GLSL}
        void main(){ vec3 d = normalize(vD); float dip = sqrt(2.0 * max(uNrCamY, 1.0) / 6371000.0), h = d.y + dip;
          vec3 hor = nrFogCol(normalize(vec3(d.x, 0.0, d.z)));
          vec3 c = mix(hor, uNrMid, smoothstep(0.0, 0.2, h)); c = mix(c, uNrZen, smoothstep(0.16, 0.85, h));
          float s = max(dot(d, uNrSunD), 0.0);
          c += vec3(1.0, 0.9, 0.75) * (pow(s, 2200.0) * 40.0 + pow(s, 220.0) * 1.0 + pow(s, 14.0) * 0.16) * (1.0 - uNrWhite);
          if (h < 0.0) c = hor;
          c = mix(c, vec3(1.3, 1.31, 1.33), uNrWhite);
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }` });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 48, 24), m); sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky); S.sky = sky; }
  // ---- maps
  const mapN = nrCanvasTex(nrDrawMap(NR_BN, P, 0), true, 4), mapM = nrCanvasTex(nrDrawMap(NR_BM, P, 1), true, 4), mapF = nrCanvasTex(nrDrawMap(NR_BF, P, 2), true, 2); S.maps = { mapN, mapM, mapF };
  const auxN = nrCanvasTex(nrAuxMap(NR_BN, P, 2048), false), auxM = nrCanvasTex(nrAuxMap(NR_BM, P, 1024), false);
  const coN = nrCanvasTex(nrCoastMap(NR_BN, 1024, 3, 28), false, 1), coM = nrCanvasTex(nrCoastMap(NR_BM, 1024, 1, 8), false, 1), coF = nrCanvasTex(nrCoastMap(NR_BF, 1024, 1, 3), false, 1);
  const det = nrTexDetail(); det.wrapS = det.wrapT = THREE.RepeatWrapping;
  const bv = (B) => new THREE.Vector4(B.x0, B.z0, B.s, B.s);
  const MAPU = { tN: { value: mapN }, tM: { value: mapM }, tF: { value: mapF }, tAN: { value: auxN }, tAM: { value: auxM }, tDet: { value: det },
    tCN: { value: coN }, tCM: { value: coM }, tCF: { value: coF }, uBN: { value: bv(NR_BN) }, uBM: { value: bv(NR_BM) }, uBF: { value: bv(NR_BF) } };
  const UVW = `
    vec2 nrUvOf(vec2 F, vec4 B){ return vec2((F.x - B.x) / B.z, 1.0 - (F.y - B.y) / B.w); }
    float nrInW(vec2 u, float e){ vec2 m = min(u, 1.0 - u); return smoothstep(0.0, e, min(m.x, m.y)); }`;
  // ---- terrain
  {
    const axis = (d0, d1, step, grow, lo, hi) => { const a = []; for (let v = d0; v <= d1 + 1e-6; v += step) a.push(v); const L = []; let s = step, v = d0; while (v > lo) { s *= grow; v -= s; L.push(Math.max(v, lo)); }
      const Rr = []; s = step; v = a[a.length - 1]; while (v < hi) { s *= grow; v += s; Rr.push(Math.min(v, hi)); } return [...L.reverse(), ...a, ...Rr]; };
    const xs = axis(-1700, 3700, 24, 1.1, -220000, 220000), zs = axis(-7900, 300, 24, 1.1, -220000, 220000), nx = xs.length, nz = zs.length;
    const pos = new Float32Array(nx * nz * 3), col = new Float32Array(nx * nz * 3), idx = new Uint32Array((nx - 1) * (nz - 1) * 6);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const k = j * nx + i, x = xs[i], z = zs[j], h = nrHeight(x, z); pos[k * 3] = x; pos[k * 3 + 1] = h; pos[k * 3 + 2] = z;
      // elevation tint: lowland as drawn, upland darker green, high rock
      const up = ss(150, 700, h), rock = ss(900, 1700, h); col[k * 3] = lerp(lerp(1, 0.72, up), 0.95, rock); col[k * 3 + 1] = lerp(lerp(1, 0.82, up), 0.88, rock); col[k * 3 + 2] = lerp(lerp(1, 0.7, up), 0.82, rock); }
    let q = 0; for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx[q++] = a; idx[q++] = c; idx[q++] = b; idx[q++] = b; idx[q++] = c; idx[q++] = d; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeVertexNormals();
    const mat = nrPatch(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.96, metalness: 0, vertexColors: true }), {
      key: 'ground', sink: 'vert', uniforms: MAPU, vDecl: 'varying vec2 vNrF;', vMain: 'vNrF = position.xz;',
      fDecl: `uniform sampler2D tN, tM, tF, tAN, tAM, tDet; uniform vec4 uBN, uBM, uBF; uniform float uNrH, uNrT, uNrOff; varying vec2 vNrF; ${NR_NOISE_GLSL} ${UVW}`,
      fMap: `
        vec2 F = vNrF;
        vec2 uN = nrUvOf(F, uBN), uM = nrUvOf(F, uBM), uF = nrUvOf(F, uBF);
        float wN = nrInW(uN, 0.03), wM = nrInW(uM, 0.03), wF = nrInW(uF, 0.02);
        vec3 c = vec3(0.30, 0.36, 0.20) * (0.85 + 0.3 * nrVN(F / 9000.0));
        if (wF > 0.0) c = mix(c, texture2D(tF, uF).rgb, wF);
        if (wM > 0.0) c = mix(c, texture2D(tM, uM).rgb, wM);
        if (wN > 0.0) c = mix(c, texture2D(tN, uN).rgb, wN);
        float wat = 0.0; if (wM > 0.0) wat = texture2D(tAM, uM).r * wM; if (wN > 0.0) wat = mix(wat, texture2D(tAN, uN).r, wN);
        vec2 dt = texture2D(tDet, F / 47.0).rg, dt2 = texture2D(tDet, F / 433.0).rg;
        c *= 0.9 + 0.2 * (dt.r - 0.5) * 1.6 + 0.22 * (dt2.g - 0.5) * 1.6;
        c = mix(c, vec3(0.42, 0.58, 0.66), wat * 0.45);
        // lawns: worn brown patches, fine blades, mowing stripes; asphalt: patches and wear
        float grass = smoothstep(0.02, 0.08, c.g - max(c.r, c.b) * 0.95) * (1.0 - wat);
        if (grass > 0.0) {
          float worn = smoothstep(0.56, 0.74, nrFbm(F / 16.0)) * smoothstep(0.35, 0.65, nrVN(F / 85.0));
          c = mix(c, c * vec3(1.45, 0.98, 0.62), grass * worn * 0.6);
          c *= 1.0 + grass * (texture2D(tDet, F / 5.0).r - 0.5) * 0.45;
          float mow = step(0.6, nrVN(F / 160.0)) * step(0.0, sin(F.x * 0.31 + F.y * 0.13));
          c *= 1.0 + grass * mow * 0.07;
        }
        float asph = (1.0 - smoothstep(0.015, 0.04, max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b)))) * (1.0 - smoothstep(0.12, 0.22, c.g));
        if (asph > 0.0) c *= 1.0 - asph * (0.1 * step(0.72, nrVN(floor(F / 3.5) * 0.37 + 0.5)) + 0.06 * (texture2D(tDet, F / 3.0).g - 0.5));
        // the flood running ahead of the wave's toe: silty water, a ragged white front, foam marbling
        float Hh = uNrH, zr = vNrW.z, zp = zr / Hh - uNrOff;
        float edge = -3.5 + 0.42 * (nrFbm(vec2(F.x / (Hh * 0.9) + uNrT * 0.03, 3.0)) - 0.5) + 0.12 * (nrVN(vec2(F.x / (Hh * 0.15), 7.0 + uNrT * 0.2)) - 0.5) - 0.1 * pow(nrVN(vec2(F.x / (Hh * 0.045), 11.0)), 4.0);
        float fl = smoothstep(edge, edge + 0.02, zp) * step(zp, 8.0);
        if (fl > 0.0) {
          vec2 q = vec2(F.x / Hh, zp);
          vec2 wq = vec2(nrFbm(q * vec2(5.0, 3.0) + vec2(uNrT * 0.08, 0.0)), nrFbm(q * vec2(5.0, 3.0) + vec2(5.2, -uNrT * 0.06)));
          float foam = smoothstep(0.47, 0.6, nrFbm(q * vec2(18.0, 10.0) + wq * 1.8 + vec2(0.0, -uNrT * 0.45)));
          float lace = smoothstep(0.56, 0.6, nrFbm(q * vec2(60.0, 36.0) + wq * 3.0 + vec2(3.0, -uNrT * 0.9))) * 0.75;
          vec3 wc = mix(vec3(0.10, 0.16, 0.15), vec3(0.30, 0.33, 0.27), nrVN(q * 6.0 + wq));
          float front = 1.0 - smoothstep(0.0, 0.07 + 0.05 * wq.x, zp - edge);
          wc = mix(wc, vec3(0.94, 0.96, 0.96), clamp(max(foam * 0.85, lace) + front * 0.95, 0.0, 1.0));
          float deb = step(0.955, nrVN(q * vec2(240.0, 150.0) + wq * 4.0)) * (1.0 - foam) * (1.0 - front);
          wc = mix(wc, vec3(0.22, 0.17, 0.12), deb * 0.85);
          // meet the wave's trough at its straight front edge so no seam shows
          float sm = smoothstep(-3.05, -2.8, zp);
          wc = mix(wc, mix(vec3(0.62, 0.7, 0.7), vec3(0.93, 0.95, 0.95), foam), sm * 0.55);
          c = mix(c, wc, fl);
        }
        diffuseColor.rgb *= c;`,
    });
    // chunks share the vertex buffers but have their own index ranges and bounds, so off-screen land is culled
    const terr = new THREE.Group(), CH = 56; world.add(terr); S.terr = terr;
    for (let j0 = 0; j0 < nz - 1; j0 += CH) for (let i0 = 0; i0 < nx - 1; i0 += CH) {
      const j1 = Math.min(nz - 1, j0 + CH), i1 = Math.min(nx - 1, i0 + CH), ci = new Uint32Array((j1 - j0) * (i1 - i0) * 6); let q2 = 0, ylo = 1e9, yhi = -1e9;
      for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; ci[q2++] = a; ci[q2++] = c; ci[q2++] = b; ci[q2++] = b; ci[q2++] = c; ci[q2++] = d; }
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const y = pos[(j * nx + i) * 3 + 1]; ylo = Math.min(ylo, y); yhi = Math.max(yhi, y); }
      const cg = new THREE.BufferGeometry(); for (const a of ['position', 'normal', 'color']) cg.setAttribute(a, geo.attributes[a]); cg.setIndex(new THREE.BufferAttribute(ci, 1));
      const x0 = xs[i0], x1 = xs[i1], z0 = zs[j0], z1 = zs[j1];
      cg.boundingSphere = new THREE.Sphere(new THREE.Vector3((x0 + x1) / 2, (ylo + yhi) / 2, (z0 + z1) / 2), Math.hypot(x1 - x0, z1 - z0, yhi - ylo + 400) / 2 + 60);
      const m = new THREE.Mesh(cg, mat); m.receiveShadow = true; terr.add(m);
    }
  }
  // ---- the sea (camera-centred polar grid; the pattern uses fixed world coordinates)
  { const NR = 170, NS = 200, pos = [], idx = [];
    for (let i = 0; i <= NR; i++) { const r = i === 0 ? 0 : Math.exp(i * 0.075) - 0.6; for (let j = 0; j < NS; j++) { const a = j / NS * TAU; pos.push(Math.cos(a) * r, 0, Math.sin(a) * r); } }
    for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) { const a = i * NS + j, b = i * NS + (j + 1) % NS, c = a + NS, d = b + NS; idx.push(a, b, c, b, d, c); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
    const mat = new THREE.ShaderMaterial({ uniforms: Object.assign({ uDeepL: g.wave.U.uDeep, uSkyL: SKYC }, NRU, MAPU),
      vertexShader: `
        #include <common>
        #include <logdepthbuf_pars_vertex>
        uniform float uNrH, uNrTrav, uNrOff; ${CURVE_GLSL}
        varying vec3 vNrW; varying vec2 vNrF;
        void main(){
          vec3 p = position; float Hh = uNrH, zz = p.z / Hh - uNrOff;
          // just under the wave's own trough, so the wave mesh always shows and never floats on a ledge
          p.y = -(0.036 * Hh + 0.05) * smoothstep(-3.1, -2.8, zz);
          vec4 w = modelMatrix * vec4(p, 1.0);
          vNrF = vec2(w.x, w.z - uNrTrav);
          w.xyz = curveDrop(w.xyz); vNrW = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
          #include <logdepthbuf_vertex>
        }`,
      fragmentShader: `
        #include <common>
        #include <logdepthbuf_pars_fragment>
        uniform sampler2D tCN, tCM, tCF; uniform vec4 uBN, uBM, uBF; uniform float uNrH, uNrT, uNrOff; uniform vec3 uNrZen, uNrMid, uDeepL, uSkyL;
        varying vec3 vNrW; varying vec2 vNrF;
        ${NR_FOG_GLSL} ${NR_NOISE_GLSL} ${UVW}
        void main(){
          #include <logdepthbuf_fragment>
          vec2 F = vNrF; float Hh = uNrH, t = uNrT, zr = vNrW.z, zp = zr / Hh - uNrOff;
          vec3 V = normalize(vNrW - cameraPosition); float dist = length(vNrW.xz);
          vec2 uN = nrUvOf(F, uBN), uM = nrUvOf(F, uBM), uF = nrUvOf(F, uBF);
          float wN = nrInW(uN, 0.02), wM = nrInW(uM, 0.02), wF = nrInW(uF, 0.02);
          vec3 cs = vec3(0.0);
          if (wF > 0.0) cs = mix(cs, texture2D(tCF, uF).rgb, wF);
          if (wM > 0.0) cs = mix(cs, texture2D(tCM, uM).rgb, wM);
          if (wN > 0.0) cs = mix(cs, texture2D(tCN, uN).rgb, wN);
          // normals: a swell rolling to the shore, chop, ripples; fading with distance
          float k1 = 1.0 - smoothstep(40.0, 900.0, dist), k2 = 1.0 - smoothstep(8.0, 160.0, dist), k0 = 1.0 - smoothstep(1200.0, 7000.0, dist);
          vec2 g = vec2(0.0);
          float amp = 0.5 + 0.7 * nrVN(F * 0.013 + vec2(t * 0.02, 0.0));
          g += vec2(0.006, 0.045) * cos(F.y * 0.085 + F.x * 0.011 + t * 1.15) * k0 * amp;
          g += vec2(-0.012, 0.025) * cos(F.y * 0.031 - F.x * 0.017 + t * 0.7) * k0;
          vec2 p1 = F * 0.16 + vec2(t * 0.11, -t * 0.08), p2 = F * 0.43 + vec2(-t * 0.21, t * 0.17);
          float e1 = 0.35, n1 = nrVN(p1), n2 = nrVN(p2);
          g += vec2(nrVN(p1 + vec2(e1, 0.0)) - n1, nrVN(p1 + vec2(0.0, e1)) - n1) * 0.3 * k1 * amp;
          g += vec2(nrVN(p2 + vec2(e1, 0.0)) - n2, nrVN(p2 + vec2(0.0, e1)) - n2) * 0.2 * k1;
          g += vec2(0.02, -0.02) * cos(F.x * 1.1 - F.y * 0.83 + t * 3.1) * k2;
          g += (vec2(nrVN(F * 0.9 + t * 0.6), nrVN(F * 0.9 - t * 0.5 + 7.0)) - 0.5) * 0.08 * k2;
          if (k2 > 0.0) { vec2 p3 = F * vec2(2.6, 1.7) + vec2(t * 0.9, -t * 0.7); float n3 = nrVN(p3); g += vec2(nrVN(p3 + vec2(0.3, 0.0)) - n3, nrVN(p3 + vec2(0.0, 0.3)) - n3) * 0.22 * k2; }
          vec3 N = normalize(vec3(g.x, 1.0, g.y));
          vec3 Rf = reflect(V, N); Rf.y = abs(Rf.y);
          float fres = 0.02 + 0.98 * pow(1.0 - max(dot(-V, N), 0.0), 5.0);
          vec3 skyR = mix(nrFogCol(normalize(vec3(Rf.x, 0.0, Rf.z) + 1e-4)), uNrMid, smoothstep(0.0, 0.45, Rf.y)); skyR = mix(skyR, uNrZen, smoothstep(0.3, 0.9, Rf.y));
          float shal = smoothstep(0.0, 0.45, cs.g);
          vec3 deep = vec3(0.012, 0.10, 0.20), mid = vec3(0.018, 0.20, 0.30), tq = vec3(0.05, 0.46, 0.47), sandw = vec3(0.32, 0.6, 0.52);
          vec3 body = mix(deep, mid, smoothstep(0.0, 0.08, cs.g) * 0.7 + 0.3 * k1);
          body = mix(body, tq, shal); body = mix(body, sandw, smoothstep(0.28, 0.48, cs.r));
          body *= 0.82 + 0.35 * clamp(dot(N, uNrSunD) * 4.0, 0.0, 1.0);
          // the town reflected near the horizon: warm streaks under the skyline
          float az = atan(Rf.x, -Rf.z), twn = smoothstep(0.06, 0.0, Rf.y) * smoothstep(-0.2, 0.25, -Rf.z / max(length(Rf.xz), 1e-3)) * (1.0 - smoothstep(1500.0, 6000.0, dist));
          skyR = mix(skyR, mix(vec3(0.62, 0.56, 0.48), vec3(0.85, 0.8, 0.72), nrVN(vec2(az * 60.0, 0.5))) * (0.75 + 0.25 * nrVN(F * vec2(0.05, 0.6))), twn * 0.7);
          vec3 col = mix(body, skyR, clamp(fres * 0.7, 0.0, 0.55));
          float sd = max(dot(Rf, uNrSunD), 0.0);
          float sp = smoothstep(0.75, 0.95, nrVN(F * 3.1 + vec2(t * 2.3, -t * 1.7))) * k2;
          col += vec3(1.0, 0.9, 0.74) * (pow(sd, 700.0) * 14.0 + pow(sd, 70.0) * 0.6 + pow(sd, 9.0) * 0.07 + sp * pow(sd, 6.0) * 0.8);
          // shore: a swash line and breaking lines walking in
          float sw = smoothstep(0.30, 0.47, cs.r) * (0.55 + 0.45 * nrVN(F * 0.3 + t * 0.4));
          float ph = cs.g * 34.0 - t * 1.1 + nrVN(F * 0.015) * 2.5;
          float lines = smoothstep(0.84, 0.99, sin(ph)) * smoothstep(0.06, 0.25, cs.g) * (1.0 - smoothstep(0.4, 0.48, cs.r)) * smoothstep(0.3, 0.7, nrVN(F * 0.04 + 3.0));
          float foam = max(sw, lines * 0.75);
          if (cs.r > 0.1 && cs.r < 0.5) { float lace = smoothstep(0.5, 0.56, nrFbm(F * 0.55 + vec2(t * 0.25, -t * 0.15))) * smoothstep(0.12, 0.3, cs.r) * (1.0 - smoothstep(0.45, 0.5, cs.r)); foam = max(foam, lace * 0.6); }
          // scattered whitecaps out at sea, drifting
          float wcap = smoothstep(0.84, 0.93, nrVN(F * vec2(0.09, 0.3) + vec2(t * 0.05, -t * 0.12))) * smoothstep(0.6, 0.8, nrVN(F * vec2(0.5, 1.6) - t * 0.3)) * (1.0 - shal) * smoothstep(50.0, 150.0, dist) * (1.0 - smoothstep(300.0, 1400.0, dist));
          foam = max(foam, wcap * 0.55);
          // in front of the wave: the water is drawn down and pulled towards it (darker, streaked)
          float pull = smoothstep(-6.0, -2.8, zp) * step(zp, -2.0);
          vec2 q = vec2(F.x / Hh, zp);
          float streak = smoothstep(0.55, 0.8, nrFbm(vec2(q.x * 10.0, q.y * 0.9 - t * 0.5)));
          col = mix(col, col * vec3(0.5, 0.64, 0.7), pull * 0.7);
          foam = max(foam, streak * pull * pull * 0.6);
          // meet the wave's own trough colour at its front edge, so there is no seam
          float zE = (-2.8 + uNrOff) * Hh, seam = smoothstep(zE - max(1.2 * Hh, 40.0), zE - 0.02 * Hh, zr) * step(zp, -2.0);
          vec3 trough = mix(uDeepL * (0.62 + 0.55 * clamp(dot(N, uNrSunD), 0.0, 1.0)), uSkyL, pow(1.0 - clamp(dot(N, -V), 0.0, 1.0), 4.0) * 0.5);
          trough = mix(trough, uNrFogC, clamp(1.0 - exp(-length(vNrW - cameraPosition) * uNrFogD * 0.8), 0.0, 1.0));
          col = mix(col, trough, seam * (1.0 - cs.b));
          // over flooded land right at the toe: churned foam
          float fl = cs.b * smoothstep(-3.4, -2.9, zp);
          foam = max(foam, fl * smoothstep(0.3, 0.6, nrFbm(q * vec2(6.0, 3.0) - vec2(0.0, t * 0.4))));
          col = mix(col, mix(col, vec3(0.3, 0.38, 0.36), 0.6), fl * 0.5);
          col = mix(col, vec3(0.93, 0.96, 0.97) * (0.78 + 0.25 * max(dot(N, uNrSunD), 0.0)), clamp(foam, 0.0, 1.0));
          col = nrFog(col, vNrW);
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }` });
    const sea = new THREE.Mesh(geo, mat); sea.frustumCulled = false; scene.add(sea); S.sea = sea; }
  // ---- buildings
  nrBuildTown(S, P);
  nrBuildCoast(S, P);
  nrBuildTrees(S, P);
  nrBuildMovers(S, P);
  nrBuildWater(S, P);
  nrBuildClouds(S, P);
  return S;
}

// ---------------------------------------------------------------- town: houses, apartments, towers, warehouses, landmarks
function nrBuildTown(S, P) {
  const W0 = S.world, box = nrPrim('box');
  const kinds = { house: [], house2: [], apt: [], glass: [], ware: [] };
  for (const b of P.bld) { b.y = nrHeight(b.x, b.z); (kinds[b.t] || kinds.house).push(b); }
  const mats = {
    house: nrFacadeMat(nrTexFacade(0), 8, 3, '#a9a39a', 'fac-house'), house2: nrFacadeMat(nrTexFacade(4), 8, 3, '#a9a39a', 'fac-house2'), apt: nrFacadeMat(nrTexFacade(1), 8, 3, '#8c8780', 'fac-apt'),
    glass: nrFacadeMat(nrTexFacade(2), 6, 4, '#6f7478', 'fac-glass', { roughness: 0.35, metalness: 0.35 }), ware: nrFacadeMat(nrTexFacade(3), 16, 5, '#b9bcbe', 'fac-ware'),
  };
  const dep = nrDepth({ key: 'bld' }), depB = nrDepth({ key: 'bld', bake: true }), tmp = new THREE.Matrix4(), c = new THREE.Color();
  for (const k in kinds) nrBaked(W0, box, mats[k], kinds[k], (b, m) => { nrM4(b.x, b.y - 2.5, b.z, b.a, b.w, b.h + 2.5, b.d, 0, 0, m); return b.col; }, { depth: depB, tile: 700, lp: true });
  // pitched roofs: hipped (4-sided pyramid) and gabled (prism)
  const hip = nrPrim('pyr');
  const gab = nrPrim('gable');
  const roofMat = nrSTD({ roughness: 0.8, flatShading: true, vertexColors: true }, { key: 'roof', sink: 'bake', vDecl: 'attribute vec3 aLp; varying vec3 vNrLp;', vMain: 'vNrLp = aLp;',
    fDecl: `varying vec3 vNrLp; ${NR_NOISE_GLSL}`, fMap: `
      float nrRow = vNrLp.y * 2.4, nrCol = (vNrLp.x + vNrLp.z) * 1.6 + floor(nrRow) * 0.5;
      float nrTile = 0.78 + 0.22 * smoothstep(0.0, 0.18, fract(nrRow)) * (0.85 + 0.3 * nrH21(vec2(floor(nrRow), floor(nrCol))));
      nrTile *= 0.9 + 0.1 * smoothstep(0.0, 0.1, fract(nrCol));
      nrTile *= 0.75 + 0.25 * smoothstep(0.0, 0.25, vNrLp.y);
      diffuseColor.rgb *= nrTile * (0.9 + 0.2 * nrVN(vNrLp.xz * 0.4));` });
  const pitched = P.bld.filter((b) => b.roof === 'hip' || b.roof === 'gable');
  const hips = pitched.filter((b) => b.roof === 'hip'), gabs = pitched.filter((b) => b.roof === 'gable');
  nrBaked(W0, hip, roofMat, hips, (b, m) => { nrM4(b.x, b.y + b.h, b.z, b.a, b.w * 1.12, 0.3 * Math.min(b.w, b.d) + 1.2, b.d * 1.12, 0, 0, m); return b.rcol || '#b4553a'; }, { depth: depB, tile: 700, lp: true });
  nrBaked(W0, gab, roofMat, gabs, (b, m) => { const along = b.w > b.d; nrM4(b.x, b.y + b.h, b.z, b.a + (along ? Math.PI / 2 : 0), (along ? b.d : b.w) * 1.1, 0.32 * Math.min(b.w, b.d) + 1, (along ? b.w : b.d) * 1.06, 0, 0, m); return b.rcol || '#b4553a'; }, { depth: depB, tile: 700, lp: true });
  // chimneys, porches (roof, deck, two columns), garages with up-and-over doors
  { const RX = RNG('nr-extras'), parts = [], cs = Math.cos, sn = Math.sin;
    const put = (cx, cz, a, ox, oz, y, w, h, d, col) => parts.push({ x: cx + ox * cs(a) + oz * sn(a), z: cz - ox * sn(a) + oz * cs(a), y, a, w, h, d, col });
    for (const b of pitched) if (RX.f() < 0.4) { const rh = 0.3 * Math.min(b.w, b.d) + 1.2; put(b.x, b.z, b.a, RX.n(b.w * 0.25), RX.n(b.d * 0.2), b.y + b.h + 0.2, 0.9, rh * 0.7 + 1.1, 0.9, RX.pick(['#8f4f3a', '#a0583f', '#c9bfb0', '#7c6a5c'])); }
    for (const e of P.extras) { const y = nrHeight(e.x, e.z);
      if (e.k === 'porch') { put(e.x, e.z, e.a, 0, 0, y + 2.65, e.w + 0.4, 0.22, 2.6, '#f2efe8');
        for (const sx of [-1, 1]) put(e.x, e.z, e.a, sx * (e.w / 2 - 0.15), 1.0, y, 0.2, 2.65, 0.2, '#fbfaf6'); }
      else { put(e.x, e.z, e.a, 0, 0, y - 0.5, 3.8, 3.3, 6, e.col); put(e.x, e.z, e.a, 0, 3.01, y, 2.8, 2.2, 0.05, '#e8e4dc'); put(e.x, e.z, e.a, 0, 0, y + 2.8, 4.1, 0.2, 6.3, '#8c8780'); } }
    S.lods.push([600, 9], nrBaked(W0, box, nrSTD({ roughness: 0.85, flatShading: true, vertexColors: true }, { key: 'extras', sink: 'bake' }), parts, (p, m) => { nrM4(p.x, p.y, p.z, p.a, p.w, p.h, p.d, 0, 0, m); return p.col; }, { depth: depB, tile: 700 })); }
  // flat-roof clutter: stair huts, AC boxes, water tanks; parapets
  { const flat = P.bld.filter((b) => b.roof === 'flat' && b.t !== 'ware'), R = RNG('nr-roofstuff'), L = [];
    for (const b of flat) { const n = 1 + (b.w * b.d > 400 ? 2 : 0); for (let k = 0; k < n; k++) { const lx = R.n(b.w * 0.3), lz = R.n(b.d * 0.3), s = R.r(2, 4.5); L.push([b.x + lx * Math.cos(b.a) + lz * Math.sin(b.a), b.y + b.h, b.z - lx * Math.sin(b.a) + lz * Math.cos(b.a), b.a, s, R.r(1.5, 3), s * R.r(0.7, 1.3)]); } }
    S.lods.push([900, 10], nrBaked(W0, box, nrSTD({ color: 0xc9c6c0, roughness: 0.8, flatShading: true, vertexColors: true }, { key: 'clutter', sink: 'bake' }), L.map((a) => ({ x: a[0], z: a[2], a })), (it, m) => { const a = it.a; nrM4(a[0], a[1], a[2], a[3], a[4], a[5], a[6], 0, 0, m); return null; }, { depth: depB, tile: 700 })); }
  // landmarks
  const add = (geo, mat, x, y, z, ry = 0, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = cast; m.receiveShadow = true; m.customDepthMaterial = dep; W0.add(m); return m; };
  const stone = nrSTD({ color: 0xe6dac0, roughness: 0.9 }, { key: 'std' }), slate = nrSTD({ color: 0x6a767c, roughness: 0.7, flatShading: true }, { key: 'std' }),
    terra = nrSTD({ color: 0xa8553a, roughness: 0.8, flatShading: true }, { key: 'std' }), copper = nrSTD({ color: 0x6f9a8a, roughness: 0.5, metalness: 0.3 }, { key: 'std' }),
    white = nrSTD({ color: 0xf2efe8, roughness: 0.6 }, { key: 'std' }), red = nrSTD({ color: 0xc8372d, roughness: 0.55 }, { key: 'std' }), dark = nrSTD({ color: 0x2b3033, roughness: 0.5 }, { key: 'std' }),
    concrete = nrSTD({ color: 0xb9b4aa, roughness: 0.9 }, { key: 'std' });
  S.mats = { stone, slate, terra, copper, white, red, dark, concrete };
  for (const s of P.specials) {
    const y = nrHeight(s.x, s.z);
    if (s.k === 'church') { add(new THREE.BoxGeometry(14, 14, 32).translate(0, 7, 0), stone, s.x, y, s.z, s.a); add(new THREE.ConeGeometry(11.5, 7, 4, 1).rotateY(Math.PI / 4).scale(0.9, 1, 2.0).translate(0, 17.5, 0), terra, s.x, y, s.z, s.a);
      const tx = s.x + Math.sin(s.a) * 18, tz = s.z + Math.cos(s.a) * 18; add(new THREE.BoxGeometry(7, 34, 7).translate(0, 17, 0), stone, tx, y, tz, s.a); add(new THREE.ConeGeometry(5.6, 12, 4).rotateY(Math.PI / 4).translate(0, 40, 0), slate, tx, y, tz, s.a); }
    else if (s.k === 'cathedral') { add(new THREE.BoxGeometry(36, 22, 70).translate(0, 11, 0), stone, s.x, y, s.z, s.a); add(new THREE.CylinderGeometry(13, 13, 14, 20).translate(0, 29, 0), stone, s.x, y, s.z, s.a);
      add(new THREE.SphereGeometry(13.5, 20, 10, 0, TAU, 0, Math.PI / 2).translate(0, 36, 0), copper, s.x, y, s.z, s.a);
      for (const sgn of [-1, 1]) { const tx = s.x + Math.cos(s.a) * 14 * sgn + Math.sin(s.a) * 38, tz = s.z - Math.sin(s.a) * 14 * sgn + Math.cos(s.a) * 38; add(new THREE.BoxGeometry(9, 46, 9).translate(0, 23, 0), stone, tx, y, tz, s.a); add(new THREE.ConeGeometry(6.6, 14, 4).rotateY(Math.PI / 4).translate(0, 53, 0), copper, tx, y, tz, s.a); } }
    else if (s.k === 'station') { add(new THREE.BoxGeometry(70, 14, 26).translate(0, 7, 0), stone, s.x + 30, y, s.z - 40, s.a); add(new THREE.BoxGeometry(220, 1.2, 28).translate(0, 9, 0), nrSTD({ color: 0x8a959c, roughness: 0.5, metalness: 0.4 }, { key: 'std' }), s.x, y, s.z, s.a); }
    else if (s.k === 'stadium') { add(nrStadiumGeo(), nrSTD({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide }, { key: 'std' }), s.x, y, s.z, s.a);
      for (let q = 0; q < 4; q++) { const a = s.a + Math.PI / 4 + q * Math.PI / 2, mx = s.x + Math.cos(a) * 128, mz = s.z - Math.sin(a) * 104; add(new THREE.CylinderGeometry(0.8, 1.2, 44, 6).translate(0, 22, 0), dark, mx, y, mz); add(new THREE.BoxGeometry(8, 4, 1.5).translate(0, 45, 0), white, mx, y, mz, a + Math.PI / 2); } }
    else if (s.k === 'school') { add(new THREE.BoxGeometry(110, 12, 24).translate(0, 6, 0), nrSTD({ color: 0xe8c9a0 }, { key: 'std' }), s.x - 20, y, s.z + 60, s.a); add(new THREE.BoxGeometry(24, 12, 90).translate(0, 6, 0), nrSTD({ color: 0xe8c9a0 }, { key: 'std' }), s.x + 110, y, s.z, s.a); }
    else if (s.k === 'steeple') { add(new THREE.BoxGeometry(5, 20, 5).translate(0, 10, 0), stone, s.x, y, s.z, s.a); add(new THREE.ConeGeometry(4, 9, 4).rotateY(Math.PI / 4).translate(0, 24.5, 0), slate, s.x, y, s.z, s.a); }
    else if (s.k === 'silo') { add(new THREE.CylinderGeometry(3.2, 3.2, 16, 12).translate(0, 8, 0), nrSTD({ color: 0xc9ccce, roughness: 0.4, metalness: 0.5 }, { key: 'std' }), s.x, y, s.z); add(new THREE.SphereGeometry(3.2, 12, 6, 0, TAU, 0, Math.PI / 2).translate(0, 16, 0), nrSTD({ color: 0xc9ccce, roughness: 0.4, metalness: 0.5 }, { key: 'std' }), s.x, y, s.z); }
  }
  // the port: quays, container stacks, cranes, sheds, a ship; a factory with chimneys
  { const RP = RNG('nr-port3d'); const cont = []; const CC = ['#c8372d', '#2f6fb0', '#e0a43a', '#3a8a5a', '#d8d4cc', '#7a4a8a', '#e86f2a', '#2a5a7a'];
    for (const q of NR_PORT) { const qm = add(new THREE.BoxGeometry(q.w, 6, q.d).translate(0, -3 + 2.4, 0), concrete, q.x, 0, q.z, q.a, false);
      const ca = Math.cos(q.a), sa = Math.sin(q.a);
      for (let r = 0; r < 9; r++) for (let cc = 0; cc < 3; cc++) { if (RP.f() < 0.25) continue; const lz = -90 + r * 16, lx = -14 + cc * 3.2, hh = RP.i(1, 4);
        for (let k = 0; k < hh; k++) cont.push([q.x + lx * ca + lz * sa, 2.4 + k * 2.6, q.z - lx * sa + lz * ca, q.a, RP.pick(CC)]); }
      for (const lz of [-40, 40]) { const cx = q.x + 16 * ca + lz * sa, cz = q.z - 16 * sa + lz * ca; const cr = new THREE.Group(); cr.position.set(cx, 2.4, cz); cr.rotation.y = q.a; W0.add(cr);
        for (const [a, b] of [[-5, -4], [5, -4], [-5, 4], [5, 4]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(1, 30, 1).translate(0, 15, 0), red); l.position.set(a, 0, b); l.castShadow = true; cr.add(l); }
        const bm = new THREE.Mesh(new THREE.BoxGeometry(48, 2.5, 2.5), red); bm.position.set(-14, 31, 0); bm.castShadow = true; cr.add(bm); const hs = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 6), white); hs.position.set(0, 34, 0); cr.add(hs); } }
    const ci = nrIM(new THREE.BoxGeometry(2.9, 2.5, 12).translate(0, 1.25, 0), nrSTD({ color: 0xffffff, roughness: 0.75 }, { key: 'std-inst' }), cont.length); ci.customDepthMaterial = dep;
    cont.forEach(([x, y, z, a, col], i) => { ci.setMatrixAt(i, nrM4(x, y, z, a, 1, 1, 1, 0, 0, tmp)); ci.setColorAt(i, c.set(col)); }); W0.add(ci);
    // container ship along the first quay
    const q = NR_PORT[0], ship = new THREE.Group(); ship.position.set(q.x - 34 * Math.cos(q.a), 0, q.z + 34 * Math.sin(q.a)); ship.rotation.y = q.a; W0.add(ship);
    const hull = new THREE.Mesh(new THREE.BoxGeometry(30, 14, 180).translate(0, 3, 0), nrSTD({ color: 0x2c3e55, roughness: 0.7 }, { key: 'std' })); hull.castShadow = true; ship.add(hull);
    const br = new THREE.Mesh(new THREE.BoxGeometry(26, 18, 14).translate(0, 19, -75), white); br.castShadow = true; ship.add(br);
    for (let r = 0; r < 10; r++) for (let k = 0; k < 2; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(26, 2.6, 12.5).translate(0, 11.3 + k * 2.6, -55 + r * 13), nrSTD({ color: lin(RP.pick(CC)), roughness: 0.8 }, { key: 'std' })); m.castShadow = true; ship.add(m); }
    // factory + chimneys (smoke: sprites in nrBuildMovers)
    add(new THREE.BoxGeometry(90, 18, 60).translate(0, 9, 0), nrSTD({ color: 0xc4c0b6 }, { key: 'std' }), -1150, nrHeight(-1150, -2600), -2600, -0.6);
    for (const [cx, cz] of [[-1190, -2560], [-1170, -2585]]) { const y0 = nrHeight(cx, cz); for (let k = 0; k < 6; k++) add(new THREE.CylinderGeometry(2.6 - k * 0.12, 2.75 - k * 0.12, 11, 12).translate(0, 5.5 + k * 11, 0), k % 2 ? white : red, cx, y0, cz); }
    S.chimneys = [[-1190, -2560], [-1170, -2585]].map(([x, z]) => [x, nrHeight(x, z) + 66, z]);
    // tank farm
    for (let k = 0; k < 6; k++) add(new THREE.CylinderGeometry(11, 11, 12, 18).translate(0, 6, 0), nrSTD({ color: 0xdedbd4, roughness: 0.5 }, { key: 'std' }), -1360 + (k % 3) * 28, nrHeight(-1360, -2420), -2420 - Math.floor(k / 3) * 28);
  }
  // wind turbines on the hills ahead (rotors spin in the update)
  { const R = RNG('nr-wind'); S.rotors = []; const tw = white;
    for (let k = 0; k < 14; k++) { const x = 3200 + (k % 7) * 420 + R.n(80), z = -8000 - Math.floor(k / 7) * 900 + R.n(120), y = nrHeight(x, z);
      add(new THREE.CylinderGeometry(1.4, 2.4, 80, 8).translate(0, 40, 0), tw, x, y, z); add(new THREE.BoxGeometry(3, 3, 9).translate(0, 81, 0), tw, x, y, z, -1.1);
      const rot = new THREE.Group(); rot.position.set(x + Math.sin(-1.1) * 4.6, y + 81, z + Math.cos(-1.1) * 4.6); rot.rotation.y = -1.1; W0.add(rot);
      for (let b = 0; b < 3; b++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(2.2, 46, 0.6).translate(0, 23, 0), tw); bl.rotation.z = b * TAU / 3; bl.castShadow = true; rot.add(bl); }
      S.rotors.push({ m: rot, ph: R.r(0, TAU), v: R.r(1.1, 1.6) }); } }
}
function nrStadiumGeo() {   // elliptical bowl: seats rising outwards, blue/red bands, a roof rim
  const pos = [], col = [], N = 64, rows = [[56, 40, 1], [70, 54, 4], [88, 70, 14], [100, 80, 22], [102, 82, 22], [102, 82, 0]];
  const cs = ['#9a9a96', '#2f5fa0', '#c8372d', '#e8e4dc', '#d8d4cc', '#b0aca4'];
  for (let r = 0; r < rows.length - 1; r++) for (let i = 0; i < N; i++) {
    const a0 = i / N * TAU, a1 = (i + 1) / N * TAU, [A, Bb, Y] = rows[r], [A2, B2, Y2] = rows[r + 1];
    const p = (a, AA, BB, YY) => [Math.cos(a) * AA, YY, Math.sin(a) * BB];
    const q = [p(a0, A, Bb, Y), p(a1, A, Bb, Y), p(a1, A2, B2, Y2), p(a0, A2, B2, Y2)], cc = new THREE.Color(cs[r]);
    for (const t of [0, 1, 2, 0, 2, 3]) { pos.push(...q[t]); col.push(cc.r, cc.g, cc.b); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}

// ---------------------------------------------------------------- the beach, the promenade, the pier, the lighthouse
function nrBuildCoast(S, P) {
  const W0 = S.world, M = S.mats, R = RNG('nr-beach'), tmp = new THREE.Matrix4(), c = new THREE.Color(), dep = nrDepth({ key: 'bld' });
  const add = (geo, mat, x, y, z, ry = 0, cast = true, parent = W0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = cast; m.receiveShadow = true; m.customDepthMaterial = dep; parent.add(m); return m; };
  const nBeach0 = W0.children.length;
  // umbrellas and towels in loose rows; lifeguard towers
  const umb = [], tow = [];
  for (let x = 90; x < 3300; x += R.r(5, 9)) { if (Math.abs(x - 110) < 14) continue; const zw = nrBeachZ(x);
    for (let row = 0; row < 4; row++) { if (R.f() < 0.35) continue; const z = zw - 14 - row * 7.5 + R.n(1.5), xx = x + R.n(1.5);
      umb.push([xx, nrHeight(xx, z), z, R.pick(['#e8473c', '#f2c94c', '#2f80c8', '#f4f1ea', '#3aa58a', '#f08a3a', '#e86fa8', '#4a5fc8']), R.n(0.12), R.n(0.12)]);
      if (R.f() < 0.8) tow.push([xx + R.n(1.2), z + R.r(1, 2.5), R.n(0.6), R.pick(['#e85a4a', '#4a8ad8', '#f2d24a', '#f4f1ea', '#5ac48a', '#e88ac0', '#8a6ad8'])]); } }
  { const pole = nrIM(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 5).translate(0, 1.1, 0), M.white, umb.length, false);
    const can = nrIM(new THREE.ConeGeometry(1.15, 0.5, 10, 1, true).translate(0, 2.3, 0), nrSTD({ color: 0xffffff, roughness: 0.7, side: THREE.DoubleSide, flatShading: true }, { key: 'std-inst-ds', gh: 2.6 }), umb.length);
    umb.forEach(([x, y, z, col, rx, rz], i) => { const m = nrM4(x, y, z, 0, 1, 1, 1, rx, rz, tmp); pole.setMatrixAt(i, m); can.setMatrixAt(i, m); can.setColorAt(i, c.set(col)); });
    const tw = nrIM(new THREE.BoxGeometry(0.9, 0.03, 1.8), nrSTD({ color: 0xffffff, roughness: 0.9 }, { key: 'std-inst' }), tow.length, false);
    tow.forEach(([x, z, a, col], i) => { tw.setMatrixAt(i, nrM4(x, nrHeight(x, z) + 0.02, z, a, 1, 1, 1, 0, 0, tmp)); tw.setColorAt(i, c.set(col)); });
    pole.customDepthMaterial = can.customDepthMaterial = dep; W0.add(pole, can, tw); S.towels = tow; }
  const wood = nrSTD({ color: 0x9a7a56, roughness: 0.85 }, { key: 'std' });
  for (const lx of [380, 1250, 2150]) { const z = nrBeachZ(lx) - 22, y = nrHeight(lx, z), g = new THREE.Group(); g.position.set(lx, y, z); W0.add(g);
    for (const [a, b] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]]) add(new THREE.BoxGeometry(0.18, 3, 0.18).translate(0, 1.5, 0), wood, a, 0, b, 0, true, g);
    add(new THREE.BoxGeometry(3, 2.2, 3).translate(0, 4.1, 0), M.white, 0, 0, 0, 0, true, g); add(new THREE.BoxGeometry(3.4, 0.25, 3.4).translate(0, 5.3, 0), M.red, 0, 0, 0, 0, true, g);
    add(new THREE.BoxGeometry(0.08, 0.9, 1.2).translate(0, 3.5, 1.6).rotateX(-0.7), wood, 0, 0, 0, 0, true, g);
    add(new THREE.CylinderGeometry(0.04, 0.04, 3, 5).translate(0, 6.8, 0), M.white, 1.4, 0, 1.4, 0, true, g);
    const fl = add(new THREE.PlaneGeometry(1.1, 0.7, 6, 2).translate(0.55, 7.9, 0), nrSTD({ color: 0xd8342a, side: THREE.DoubleSide }, { key: 'std' }), 1.4, 0, 1.4, 0, true, g); S.flags = (S.flags || []).concat([{ m: fl, base: Float32Array.from(fl.geometry.attributes.position.array) }]); }
  // the promenade: palms, globe lamps, kiosks, a low sea wall
  { const palms = [], lamps = [];
    for (let x = 80; x < 3350; x += 16) { const z = nrBeachZ(x) - 49; palms.push([x + R.n(2), z + R.n(1.5), R.r(0.85, 1.2), R.r(0, TAU)]); lamps.push([x + 8, z - 7]); }
    const tr = nrIM(new THREE.CylinderGeometry(0.2, 0.32, 9, 6).translate(0, 4.5, 0), nrSTD({ color: 0x8a7258, roughness: 1 }, { key: 'std-inst', gh: 9 }), palms.length);
    const fr = nrIM(nrPalmGeo(), nrSTD({ color: 0x4f7a34, roughness: 0.9, side: THREE.DoubleSide, flatShading: true }, { key: 'std-inst-ds', gh: 10 }), palms.length);
    palms.forEach(([x, z, s, r], i) => { const y = nrHeight(x, z); tr.setMatrixAt(i, nrM4(x, y, z, 0, s, s, s, R.n(0.05), R.n(0.07), tmp)); fr.setMatrixAt(i, nrM4(x, y + 9 * s, z, r, s, s, s, 0, 0, tmp)); });
    const lp = nrIM(new THREE.CylinderGeometry(0.06, 0.09, 4.5, 6).translate(0, 2.25, 0), M.dark, lamps.length, false), lg = nrIM(new THREE.SphereGeometry(0.28, 10, 8).translate(0, 4.7, 0), nrSTD({ color: 0xffffff, emissive: 0xfff2dc, emissiveIntensity: 0.3 }, { key: 'std-inst' }), lamps.length, false);
    lamps.forEach(([x, z], i) => { const m = nrM4(x, nrHeight(x, z), z, 0, 1, 1, 1, 0, 0, tmp); lp.setMatrixAt(i, m); lg.setMatrixAt(i, m); });
    tr.customDepthMaterial = fr.customDepthMaterial = dep; W0.add(tr, fr, lp, lg);
    const wall = []; for (let x = 70; x < 3350; x += 20) wall.push(x);
    const wm = nrIM(new THREE.BoxGeometry(20.2, 1.2, 0.6), nrSTD({ color: 0xd8ccb0 }, { key: 'std-inst' }), wall.length);
    wall.forEach((x, i) => { const z = nrBeachZ(x + 10) - 40.3; wm.setMatrixAt(i, nrM4(x + 10, nrHeight(x + 10, z - 2) - 0.2, z, 0, 1, 1, 1, 0, 0, tmp)); }); W0.add(wm);
    for (const kx of [260, 640, 990, 1430, 1890, 2420, 2900]) { const z = nrBeachZ(kx) - 30, y = nrHeight(kx, z); add(new THREE.BoxGeometry(5, 3, 4).translate(0, 1.5, 0), nrSTD({ color: lin(R.pick(['#f2c94c', '#4aa8d8', '#e8735a', '#f4f1ea'])) }, { key: 'std' }), kx, y, z);
      add(new THREE.BoxGeometry(6.4, 0.3, 5.4).translate(0, 3.15, 0), M.white, kx, y, z); } }
  S.beachGrp = new THREE.Group(); W0.children.slice(nBeach0).forEach((o) => S.beachGrp.add(o)); W0.add(S.beachGrp);
  const nPier0 = W0.children.length;
  // the pier: piles, deck, railings, lamps, a pavilion at the end
  { const PX = 110, Z0 = nrBeachZ(PX) - 36, Z1 = -310, TOP = 7.2, L = Z1 - Z0, zc = (Z0 + Z1) / 2;   // Z0 beach end (more negative), Z1 sea end
    // the deck in 6 m sections, so the flood takes it section by section
    const plank = nrSTD({ color: 0x8c7b66, roughness: 0.9 }, { key: 'plank', gh: 1 }), nSec = Math.ceil(L / 6), dm = nrIM(new THREE.BoxGeometry(7, 0.6, 6.05), plank, nSec);
    for (let k = 0; k < nSec; k++) dm.setMatrixAt(k, nrM4(PX, TOP - 0.3, Z0 + 3 + k * 6, 0, 1, 1, 1, 0, 0, tmp)); dm.customDepthMaterial = dep; W0.add(dm); const deck = { material: plank };
    const piles = []; for (let z = Z0 + 30; z < Z1; z += 7) for (const dx of [-2.6, 2.6]) piles.push([PX + dx, z]);
    const pm = nrIM(new THREE.CylinderGeometry(0.25, 0.3, TOP + 6, 6).translate(0, (TOP + 6) / 2 - 6, 0), nrSTD({ color: 0x5a4a3a, roughness: 0.9 }, { key: 'std-inst', gh: 14 }), piles.length);
    piles.forEach(([x, z], i) => pm.setMatrixAt(i, nrM4(x, 0, z, 0, 1, 1, 1, 0, 0, tmp))); pm.customDepthMaterial = dep; W0.add(pm);
    const posts = []; for (let z = Z0; z < Z1; z += 2.5) for (const dx of [-3.4, 3.4]) posts.push([PX + dx, z]);
    const po = nrIM(new THREE.BoxGeometry(0.14, 1.1, 0.14).translate(0, TOP + 0.55, 0), M.white, posts.length, false); posts.forEach(([x, z], i) => po.setMatrixAt(i, nrM4(x, 0, z, 0, 1, 1, 1, 0, 0, tmp))); W0.add(po);
    const rails = []; for (let z = Z0; z < Z1 - 10; z += 10) for (const dx of [-3.4, 3.4]) rails.push([PX + dx, z + 5]);
    const ra = nrIM(new THREE.BoxGeometry(0.12, 0.12, 10).translate(0, TOP + 1.1, 0), M.white, rails.length, false); rails.forEach(([x, z], i) => ra.setMatrixAt(i, nrM4(x, 0, z, 0, 1, 1, 1, 0, 0, tmp))); W0.add(ra);
    const lamps = []; for (let z = Z0 + 8; z < Z1; z += 24) lamps.push([PX - 2.9, z], [PX + 2.9, z + 12]);
    const lp = nrIM(new THREE.CylinderGeometry(0.05, 0.07, 3.6, 6).translate(0, TOP + 1.8, 0), M.dark, lamps.length, false), lg = nrIM(new THREE.SphereGeometry(0.22, 8, 6).translate(0, TOP + 3.7, 0), M.white, lamps.length, false);
    lamps.forEach(([x, z], i) => { const m = nrM4(x, 0, z, 0, 1, 1, 1, 0, 0, tmp); lp.setMatrixAt(i, m); lg.setMatrixAt(i, m); }); W0.add(lp, lg);
    const end = add(new THREE.BoxGeometry(14, 0.5, 14), wood, PX, TOP - 0.25, Z1 + 4); end.material = deck.material;
    const pv = new THREE.Group(); pv.position.set(PX, TOP, Z1 + 4); W0.add(pv);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; add(new THREE.CylinderGeometry(0.12, 0.12, 3, 6).translate(0, 1.5, 0), M.white, Math.cos(a) * 4.5, 0, Math.sin(a) * 4.5, 0, true, pv); }
    add(new THREE.ConeGeometry(6, 2.6, 6).translate(0, 4.3, 0), nrSTD({ color: 0x3f7f8f, roughness: 0.6, flatShading: true }, { key: 'std' }), 0, 0, 0, 0, true, pv);
    S.pier = { x: PX, z0: Z0, z1: Z1, top: TOP, pav: pv }; }
  S.pierGrp = new THREE.Group(); W0.children.slice(nPier0).forEach((o) => S.pierGrp.add(o)); W0.add(S.pierGrp);
  // the lighthouse on the rocky point, rocks, the keeper's house
  { const LX = 35, LZ = -1262, y0 = nrHeight(LX, LZ), g = new THREE.Group(); g.position.set(LX, y0, LZ); W0.add(g); S.lighthouse = { x: LX, z: LZ, y: y0, g };
    const NSk = { sink: 'none', key: 'lh' }, lRed = nrSTD({ color: 0xc8372d, roughness: 0.5 }, NSk), lWhite = nrSTD({ color: 0xf4f1ea, roughness: 0.5 }, NSk), lDark = nrSTD({ color: 0x2b3033, roughness: 0.5 }, NSk);
    const hgt = 40 - y0 + 1.5, n = 6;
    for (let k = 0; k < n; k++) { const r0 = 3.4 - k * 0.16, r1 = 3.4 - (k + 1) * 0.16; add(new THREE.CylinderGeometry(r1, r0, hgt / n, 18).translate(0, hgt / n * (k + 0.5), 0), k % 2 ? lWhite : lRed, 0, 0, 0, 0, true, g); }
    add(new THREE.CylinderGeometry(3.3, 3.3, 0.4, 18).translate(0, hgt + 0.2, 0), lDark, 0, 0, 0, 0, true, g);
    for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; add(new THREE.BoxGeometry(0.06, 1, 0.06).translate(0, hgt + 0.9, 0), lDark, Math.cos(a) * 3.2, 0, Math.sin(a) * 3.2, 0, false, g); }
    add(new THREE.CylinderGeometry(1.7, 1.7, 2.6, 12).translate(0, hgt + 1.7, 0), nrSTD({ color: 0xfff4d0, emissive: 0xffe6a0, emissiveIntensity: 0.9, roughness: 0.2 }, NSk), 0, 0, 0, 0, false, g);
    add(new THREE.SphereGeometry(1.9, 14, 8, 0, TAU, 0, Math.PI / 2).translate(0, hgt + 3, 0), lRed, 0, 0, 0, 0, true, g);
    add(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 5).translate(0, hgt + 5.3, 0), lDark, 0, 0, 0, 0, false, g);
    { const ct = g3Tex((x, w) => { const R2 = RNG('nr-collar'); for (let i = 0; i < 260; i++) { const a = R2.r(0, TAU), r = w * (0.2 + 0.28 * Math.pow(R2.f(), 0.6)), px = w / 2 + Math.cos(a) * r, py = w / 2 + Math.sin(a) * r, s = R2.r(3, 14);
        const gg = x.createRadialGradient(px, py, 0, px, py, s); gg.addColorStop(0, `rgba(255,255,255,${R2.r(0.3, 0.8)})`); gg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.fillRect(px - s, py - s, 2 * s, 2 * s); } }, 256, 256);
      const col = new THREE.Mesh(new THREE.PlaneGeometry(26, 26).rotateX(-Math.PI / 2), nrPatch(new THREE.MeshBasicMaterial({ map: ct, transparent: true, depthWrite: false }), { key: 'collar' }));
      col.renderOrder = 4; W0.add(col); S.collar = { m: col, x: LX, z: LZ }; }
    { const rg = nrWeld(new THREE.IcosahedronGeometry(1, 3)); const rp = rg.attributes.position; for (let i = 0; i < rp.count; i++) { const k = 1 + 0.2 * (nrFbm(rp.getX(i) * 1.7 + 3, rp.getZ(i) * 1.7 + rp.getY(i) * 1.3, 3) - 0.5); rp.setXYZ(i, rp.getX(i) * k, rp.getY(i) * k, rp.getZ(i) * k); } rg.computeVertexNormals();
      const rockM = nrSTD({ color: 0x5f5850, roughness: 0.95 }, NSk);
      for (const [dx, dy, dz, sx, sy, sz] of [[0, -14, 0, 8, 22, 8], [4, -6, -3, 6, 9, 5], [-3, -8, 4, 5, 10, 6], [2, -18, 2, 11, 16, 10]]) { const m = add(rg, rockM, dx, dy, dz, 0, true, g); m.scale.set(sx, sy, sz); } }
    const hx = LX + 14, hz = LZ - 8, hy = nrHeight(hx, hz); add(new THREE.BoxGeometry(9, 5, 7).translate(0, 2.5, 0), M.white, hx, hy, hz, 0.3); add(new THREE.ConeGeometry(6.6, 3, 4).rotateY(Math.PI / 4).scale(1, 1, 0.8).translate(0, 6.5, 0), M.red, hx, hy, hz, 0.3);
    const rocks = []; const RR = RNG('nr-rocks'); for (let k = 0; k < 70; k++) { const a = RR.r(0, TAU), d = RR.r(16, 46), x = LX + Math.cos(a) * d * 0.8, z = LZ + Math.sin(a) * d; const s = RR.r(0.8, 2.6); rocks.push([x, Math.max(-0.8, nrHeight(x, z)) - s * 0.4, z, s]); }
    const rm = nrIM(new THREE.DodecahedronGeometry(1, 0), nrSTD({ color: 0xffffff, roughness: 0.95, flatShading: true }, { key: 'std-inst', gh: 1 }), rocks.length);
    rocks.forEach(([x, y, z, s], i) => { rm.setMatrixAt(i, nrM4(x, y, z, RR.r(0, 3), s * RR.r(0.9, 1.5), s * RR.r(0.6, 1), s * RR.r(0.9, 1.4), RR.r(0, 1), RR.r(0, 1), tmp)); rm.setColorAt(i, c.set(RR.pick(['#5d574e', '#6a6358', '#4e4a43', '#756d60', '#3f3c37']))); });
    rm.customDepthMaterial = dep; W0.add(rm); }
}
function nrPalmGeo() { const parts = []; for (let k = 0; k < 7; k++) { const g = new THREE.PlaneGeometry(0.7, 3.6, 1, 4); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const v = p.getY(i) + 1.8; p.setXYZ(i, p.getX(i) * (1 - v / 4), -0.12 * v * v, -v * 0.95); } g.computeVertexNormals(); g.rotateY(k / 7 * TAU); parts.push([g, '#ffffff']); } return nrMerge(parts); }

// ---------------------------------------------------------------- moving things on land: cars, trains, smoke
function nrBuildMovers(S, P) {
  const W0 = S.world, R = RNG('nr-cars'), dep = nrDepth({ key: 'bld' });
  const routes = [];
  for (const [pts, w, kind] of NR_ROADS) routes.push({ r: nrResample(pts, 20), lane: w * 0.22, gap: kind === 1 ? 45 : 70, v: kind === 1 ? 26 : 13, big: 1 });
  for (const pts of P.croads) routes.push({ r: nrResample(pts, 25), lane: 3.5, gap: 120, v: 16, big: 3 });
  // a few streets inside the town: lines along block edges
  const cars = [];
  for (const ro of routes) for (const dir of [1, -1]) for (let s = R.r(0, ro.gap); s < ro.r.len; s += ro.gap * R.r(0.6, 1.5)) cars.push({ ro, s0: s, dir, v: ro.v * R.r(0.8, 1.15), c: R.pick(NR_COL.car), big: ro.big * (R.f() < 0.06 ? 2.2 : 1), bus: R.f() < 0.06 });
  const carGeo = nrMergeIdx([[nrPrim('box', { w: 1.8, h: 0.75, d: 4.3, c: [0, 0.55, 0] }), '#ffffff'], [nrPrim('box', { w: 1.6, h: 0.62, d: 2.2, c: [0, 1.2, -0.25] }), '#3a4450']]);
  const im = nrIM(carGeo, nrSTD({ vertexColors: true, roughness: 0.4, metalness: 0.2, flatShading: true }, { key: 'car', gh: 1.6 }), cars.length); im.customDepthMaterial = dep;
  const c = new THREE.Color(); cars.forEach((k, i) => im.setColorAt(i, c.set(k.c))); W0.add(im);
  // parked cars along the kerbs and in the car parks (static, baked)
  const pcm = nrSTD({ vertexColors: true, roughness: 0.4, metalness: 0.2, flatShading: true }, { key: 'pcar', sink: 'bake' });
  S.lods.push([500, 8], nrBaked(W0, carGeo, pcm, P.parked, (k, m) => { nrM4(k.x, nrHeight(k.x, k.z) + 0.05, k.z, k.a + Math.PI / 2, 1, 1, 1, 0, 0, m); return k.c; }, { tile: 700, depth: nrDepth({ key: 'bld', bake: true }) }));
  S.cars = { im, list: cars, tmp: [0, 0, 0, 0] };
  // trains on the rail line
  const rail = nrResample(NR_RAIL, 20), tg = nrMergeIdx([[nrPrim('box', { w: 3, h: 3.6, d: 19, c: [0, 2.1, 0] }), '#f2f0ea'], [nrPrim('box', { w: 3.06, h: 0.7, d: 19.06, c: [0, 2.4, 0] }), '#c8372d'], [nrPrim('box', { w: 2.6, h: 0.3, d: 17, c: [0, 4.05, 0] }), '#8a9096']]);
  const ti = nrIM(tg, nrSTD({ vertexColors: true, roughness: 0.5, flatShading: true }, { key: 'train', gh: 4 }), 16); ti.customDepthMaterial = dep; W0.add(ti);
  S.trains = { im: ti, rail, t: [{ s0: 600, v: 24, dir: 1 }, { s0: 9000, v: 22, dir: -1 }] };
  // smoke from the factory chimneys: soft puffs that rise and drift
  const smTex = g3Radial([[0, 'rgba(255,255,255,0.9)'], [0.5, 'rgba(240,240,240,0.45)'], [1, 'rgba(230,230,230,0)']], 64);
  S.smoke = []; for (const ch of S.chimneys) for (let k = 0; k < 10; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smTex, transparent: true, depthWrite: false, opacity: 0.6, color: 0xe8e6e2, fog: false })); W0.add(sp); S.smoke.push({ sp, ch, ph: k / 10 }); }
}

// ---------------------------------------------------------------- the water's life: swimmers, surfers, boats, buoys, gulls; beach people
function nrPersonGeos() {
  // legs carry a vertex colour < 0.5: the shader paints them with the instance's own trousers colour
  const body = nrMergeIdx([[nrPrim('cyl', { n: 10, r0: 0.13, r1: 0.19, h: 0.6, y0: 0.84, sz: 0.62 }), '#ffffff'], [nrPrim('cyl', { n: 10, r0: 0.19, r1: 0.11, h: 0.1, y0: 1.44, sz: 0.62 }), '#ffffff'],
    [nrPrim('cyl', { n: 8, r0: 0.09, r1: 0.15, h: 0.86, y0: 0.0, sz: 0.66 }), '#404040']]);
  const head = nrMergeIdx([[nrWeld(new THREE.IcosahedronGeometry(0.13, 1)).scale(0.95, 1.12, 0.95).translate(0, 1.62, 0.01), '#ffffff'], [nrWeld(new THREE.IcosahedronGeometry(0.135, 1)).scale(1.0, 0.8, 1.0).translate(0, 1.665, -0.04), '#3a2a22']]);
  const arm = nrPrim('cyl', { n: 6, r0: 0.04, r1: 0.05, h: 0.58, y0: -0.6 });
  return { body, head, arm };
}
function nrBuildWater(S, P) {
  const W0 = S.world, R = RNG('nr-people'), G = nrPersonGeos(), dep = nrDepth({ key: 'ppl' }), c = new THREE.Color();
  const SKIN = ['#f3cfae', '#e8bb94', '#d4a07a', '#b07a54', '#8a5a3a', '#f0c8a0'], SUIT = ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#1f2d3d', '#7b4fc9', '#ef8a3a', '#3cae5c', '#f4f1ea', '#c2185b', '#1a1a1a'];
  const ppl = [];
  // in the water: a surf spot, swimmers near the beach, some near the pier
  for (let k = 0; k < 120; k++) ppl.push({ w: 1, kind: R.f() < 0.55 ? 'sit' : 'pad', x: R.r(20, 420), z: R.r(-140, -330) });
  for (let k = 0; k < 230; k++) { const x = R.r(70, 1700); ppl.push({ w: 1, kind: R.f() < 0.2 ? 'float' : 'swim', x, z: nrBeachZ(x) + R.r(6, 120) }); }
  for (let k = 0; k < 40; k++) ppl.push({ w: 1, kind: 'swim', x: R.r(0, 260), z: R.r(-60, -300) });
  for (let k = 0; k < 70; k++) ppl.push({ w: 1, kind: R.f() < 0.5 ? 'sit' : R.f() < 0.5 ? 'swim' : 'pad', x: R.r(6, 70), z: R.r(-120, -330) });
  // on the beach: lying on towels, sitting, standing, walking along the water
  for (const [x, z, a] of S.towels) { const r = R.f(); ppl.push({ w: 0, kind: r < 0.45 ? 'lie' : r < 0.75 ? 'sitb' : 'stand', x: x + R.n(0.3), z: z + R.n(0.4), a }); }
  for (let k = 0; k < 160; k++) { const x = R.r(80, 3200); ppl.push({ w: 0, kind: 'walk', x, z: nrBeachZ(x) - R.r(3, 9), a: R.f() < 0.5 ? Math.PI / 2 : -Math.PI / 2, v: R.r(0.9, 1.4) }); }
  for (let k = 0; k < 120; k++) { const x = R.r(80, 3300); ppl.push({ w: 0, kind: 'walk', x, z: nrBeachZ(x) - R.r(44, 54), a: R.f() < 0.5 ? Math.PI / 2 : -Math.PI / 2, v: R.r(1, 1.4) }); }
  // on the pier
  for (let k = 0; k < 26; k++) ppl.push({ w: 0, kind: 'stand', x: S.pier.x + R.n(2.6), z: R.r(S.pier.z0 + 10, S.pier.z1 + 9), a: R.r(0, TAU), pier: 1 });
  ppl.forEach((p) => { p.skin = R.pick(SKIN); p.suit = R.pick(SUIT); p.pants = p.w ? (R.f() < 0.5 ? p.skin : p.suit) : R.pick(['#2b3a55', '#3a3a3a', '#c8b89a', '#1f2d3d', '#6a7a8a', '#4a5a3a', '#e8e2d6', '#8a5a3a', ...SKIN]); p.ph = R.r(0, TAU); p.s = R.r(0.9, 1.06); p.a = p.a ?? (R.r(-0.6, 0.6) + Math.PI);
    p.look = R.f() < 0.75; p.wave = R.f() < 0.25; p.turnT = R.r(-0.5, 1); p.board = p.kind === 'sit' || p.kind === 'pad'; p.bcol = R.pick(['#f4f1ea', '#f2c94c', '#4aa8d8', '#e8735a', '#7ad0c0']); });
  // two crowds: people in the water ride the wave (no sinking), people on land are swallowed by the flood
  const crowd = (list, sink) => {
    const n = list.length, o = sink ? { sink: 'inst', gh: 1.8 } : { sink: 'none' }, c = new THREE.Color();
    const vm = nrSTD({ vertexColors: true, roughness: 0.72 }, Object.assign({ key: 'ppl' }, o)), am = nrSTD({ color: 0xffffff, roughness: 0.7 }, Object.assign({ key: 'arm' }, o));
    const bm2 = nrSTD({ vertexColors: true, roughness: 0.72 }, Object.assign({ key: 'pplbody', vDecl: 'attribute vec3 aPants;', vMain: '' }, o));
    const ob = bm2.onBeforeCompile; bm2.onBeforeCompile = (sh) => { ob(sh); sh.vertexShader = sh.vertexShader.replace('#include <color_vertex>', '#include <color_vertex>\n  if (color.r < 0.5) vColor = aPants;'); };
    const body = nrIM(G.body, bm2, n), head = nrIM(G.head, vm, n), armL = nrIM(G.arm, am, n), armR = nrIM(G.arm, am, n);
    body.geometry = G.body.clone(); const pants = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, n) * 3), 3); body.geometry.setAttribute('aPants', pants);
    const boards = list.filter((p) => p.board), bm = nrIM(nrPrim('box', { w: 0.55, h: 0.08, d: 2.3, c: [0, 0, 0] }), nrSTD({ color: 0xffffff, roughness: 0.4, flatShading: true }, Object.assign({ key: 'board' }, o)), boards.length);
    list.forEach((p, i) => { body.setColorAt(i, c.set(p.suit)); head.setColorAt(i, c.set(p.skin)); armL.setColorAt(i, c.set(p.skin)); armR.setColorAt(i, c.set(p.skin)); });
    boards.forEach((p, i) => bm.setColorAt(i, c.set(p.bcol)));
    for (const m of [body, head, armL, armR, bm]) { if (sink) m.customDepthMaterial = dep; W0.add(m); }
    return { list, body, head, armL, armR, bm, pants, parts: [body, head, armL, armR, bm] };
  };
  S.crowds = [crowd(ppl.filter((p) => p.w), false), crowd(ppl.filter((p) => !p.w), true)];
  // buoys: swim-zone float lines and yellow markers
  const buoys = []; for (let x = 120; x < 1800; x += 4) buoys.push({ x, z: nrBeachZ(x) + 95, s: 0.22, col: x % 40 < 4 ? '#f2c94c' : '#e8473c' });
  for (let x = 140; x < 1800; x += 100) buoys.push({ x, z: nrBeachZ(x) + 96, s: 0.6, col: '#f2c94c', big: 1 });
  for (let k = 0; k < 10; k++) buoys.push({ x: R.r(150, 1500), z: R.r(-200, -420), s: 0.7, col: '#e8473c', big: 1 });
  const bu = nrIM(new THREE.SphereGeometry(1, 8, 6), nrSTD({ color: 0xffffff, roughness: 0.5 }, { key: 'buoy', sink: 'none' }), buoys.length, false); buoys.forEach((b, i) => bu.setColorAt(i, c.set(b.col))); W0.add(bu);
  S.buoys = { im: bu, list: buoys };
  // boats: sailboats, motor boats, fishing boats; they float and ride up the face like everything on the water
  const boats = []; const NS = { sink: 'none', key: 'boat' }, hullMat = nrSTD({ vertexColors: true, roughness: 0.45, flatShading: true }, NS), sailM = nrSTD({ color: 0xf8f6f0, side: THREE.DoubleSide, roughness: 0.8 }, NS), bWhite = nrSTD({ color: 0xf2efe8, roughness: 0.6 }, NS), bDark = nrSTD({ color: 0x2b3033, roughness: 0.5 }, NS);
  const hullG = (L, B, D, top, bot) => { const s = new THREE.Shape(); s.moveTo(0, L / 2); s.quadraticCurveTo(B / 2, L * 0.2, B / 2, -L * 0.3); s.lineTo(B * 0.4, -L / 2); s.lineTo(-B * 0.4, -L / 2); s.lineTo(-B / 2, -L * 0.3); s.quadraticCurveTo(-B / 2, L * 0.2, 0, L / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth: D, bevelEnabled: false, curveSegments: 8 }); g.rotateX(-Math.PI / 2); g.translate(0, -D * 0.35, 0); const p = g.attributes.position, cc = []; const ct = new THREE.Color(top), cb = new THREE.Color(bot);
    for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = y < 0 ? cb : ct; cc.push(k.r, k.g, k.b); } g.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3)); g.computeVertexNormals(); return g; };
  for (let k = 0; k < 26; k++) { const kind = k < 12 ? 'sail' : k < 20 ? 'motor' : 'fish', x = R.r(180, 3000), z = R.r(-60, -460), grp = new THREE.Group(); grp.rotation.order = 'YXZ'; W0.add(grp);
    const L = kind === 'sail' ? R.r(8, 13) : kind === 'motor' ? R.r(6, 10) : R.r(9, 14);
    const h = new THREE.Mesh(hullG(L, L * 0.34, L * 0.13, R.pick(['#f4f2ec', '#f4f2ec', '#2f5f9a', '#c8372d']), '#1f3a5f'), hullMat); h.castShadow = true; grp.add(h);
    if (kind === 'sail') { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, L * 1.3, 5).translate(0, L * 0.65, 0), bWhite); grp.add(m);
      const sh = new THREE.Shape([new THREE.Vector2(0, 0.6), new THREE.Vector2(0, L * 1.25), new THREE.Vector2(-L * 0.42, 0.7)]); const sg = new THREE.ShapeGeometry(sh); sg.rotateY(Math.PI / 2); const sl = new THREE.Mesh(sg, sailM); sl.castShadow = true; grp.add(sl);
      const jib = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, 0.6), new THREE.Vector2(0, L * 1.1), new THREE.Vector2(L * 0.38, 0.5)])); jib.rotateY(Math.PI / 2); grp.add(new THREE.Mesh(jib, sailM)); }
    else { const cab = new THREE.Mesh(new THREE.BoxGeometry(L * 0.28, L * 0.13, L * 0.32).translate(0, L * 0.1, -L * 0.05), bWhite); cab.castShadow = true; grp.add(cab);
      const wd = new THREE.Mesh(new THREE.BoxGeometry(L * 0.285, L * 0.05, L * 0.1).translate(0, L * 0.13, L * 0.1), bDark); grp.add(wd); }
    boats.push({ grp, x, z, a: R.r(0, TAU), v: kind === 'motor' ? R.r(3, 6) : kind === 'sail' ? R.r(1, 2.2) : R.r(0.5, 1.5), ph: R.r(0, 9), L, heel: kind === 'sail' ? R.r(0.08, 0.18) : 0 }); }
  // moored boats along the pier
  for (let k = 0; k < 5; k++) { const grp = new THREE.Group(); grp.rotation.order = 'YXZ'; W0.add(grp); const L = R.r(5, 7); const h = new THREE.Mesh(hullG(L, L * 0.38, L * 0.15, R.pick(['#f4f2ec', '#e8735a', '#4aa8d8']), '#2a3a4a'), hullMat); h.castShadow = true; grp.add(h);
    boats.push({ grp, x: S.pier.x + (k % 2 ? 7 : -7), z: S.pier.z1 - 20 - k * 30, a: 0, v: 0, ph: R.r(0, 9), L, heel: 0 }); }
  S.boats = boats;
  // wakes behind the motor boats
  const wakeTex = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0.0)'); g.addColorStop(0.08, 'rgba(255,255,255,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g;
    x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w, h); x.lineTo(w * 0.82, h); x.lineTo(w / 2, h * 0.12); x.lineTo(w * 0.18, h); x.lineTo(0, h); x.closePath(); x.fill(); x.fillRect(w * 0.44, 0, w * 0.12, h * 0.8); }, 128, 256);
  S.wakes = boats.filter((b) => b.v > 2.5).map((b) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), nrPatch(new THREE.MeshBasicMaterial({ map: wakeTex, transparent: true, depthWrite: false, opacity: 0.8 }), { key: 'wake' })); m.renderOrder = 2; W0.add(m); return { b, m }; });
  // gulls
  const gullW = nrSTD({ color: 0xf4f4f0, roughness: 0.7, side: THREE.DoubleSide, flatShading: true }, { key: 'gull', sink: 'none' });
  S.gulls = []; for (let k = 0; k < 14; k++) { const grp = new THREE.Group(); W0.add(grp); const bd = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6).scale(1, 0.8, 2.6), gullW); grp.add(bd);
    const wing = (sg) => { const w = new THREE.Group(); const m = new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.18, sg * 0.9, 0, 0.05, 0, 0, -0.2, sg * 0.9, 0, 0.05, sg * 1.5, 0, -0.18, 0, 0, -0.2], 3)), gullW); m.geometry.computeVertexNormals(); w.add(m); grp.add(w); return w; };
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 4).rotateX(Math.PI / 2).translate(0, 0, 0.48), bDark); grp.add(tip);
    S.gulls.push({ grp, wl: wing(1), wr: wing(-1), cx: R.r(20, 700), cz: R.r(-60, -560), r: R.r(15, 60), y: R.r(5, 26), w: R.r(0.12, 0.3) * (R.f() < 0.5 ? 1 : -1), ph: R.r(0, TAU) }); }
}

// ---------------------------------------------------------------- billboards: leafy trees and soft clouds as lit impostors (4 vertices each)
// a code-drawn 2x2 atlas of trees: canopies built from many overlapping leaf clusters (greyscale light/shade), real trunks and branches (brown)
function nrTreeAtlas() {
  const S = 1024, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d'), R = RNG('nr-treeatlas');
  const cell = (ci, draw) => { x.save(); x.translate((ci % 2) * S / 2, Math.floor(ci / 2) * S / 2); x.beginPath(); x.rect(0, 0, S / 2, S / 2); x.clip(); draw(S / 2); x.restore(); };
  const trunk = (w, x0, y0, x1, y1, r0, r1) => { const n = 10; for (let i = 0; i < n; i++) { const t = i / n, t2 = (i + 1) / n; x.strokeStyle = `rgb(${92 - i * 2},${66 - i},${50 - i})`; x.lineWidth = lerp(r0, r1, t) * 2; x.lineCap = 'round'; x.beginPath(); x.moveTo(lerp(x0, x1, t), lerp(y0, y1, t)); x.lineTo(lerp(x0, x1, t2), lerp(y0, y1, t2)); x.stroke(); } };
  // one leaf cluster: a soft lit ball (light from upper right) with a rim of little leaf lobes and dappled speckles
  const cluster = (cx, cy, r, base) => {
    for (let k = 0; k < 14; k++) { const a = R.r(0, TAU), rr = r * R.r(0.75, 1.0), lr = r * R.r(0.22, 0.36); const v = Math.round(base * 255 * R.r(0.75, 0.95)); x.fillStyle = `rgb(${v},${v},${v})`; x.beginPath(); x.arc(cx + Math.cos(a) * rr * 0.8, cy + Math.sin(a) * rr * 0.8, lr, 0, TAU); x.fill(); }
    const g = x.createRadialGradient(cx + r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r * 1.05);
    const hi = Math.round(Math.min(255, base * 300)), mid = Math.round(base * 210), lo = Math.round(base * 120);
    g.addColorStop(0, `rgb(${hi},${hi},${hi})`); g.addColorStop(0.55, `rgb(${mid},${mid},${mid})`); g.addColorStop(1, `rgb(${lo},${lo},${lo})`);
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    for (let k = 0; k < r * 1.6; k++) { const a = R.r(0, TAU), d = r * Math.sqrt(R.f()) * 0.95, v = R.f() < 0.5 ? Math.round(base * 255 * R.r(0.95, 1.2)) : Math.round(base * 255 * R.r(0.45, 0.7)); x.fillStyle = `rgba(${Math.min(255, v)},${Math.min(255, v)},${Math.min(255, v)},0.8)`;
      x.beginPath(); x.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, R.r(1.5, 4), R.r(1, 2.5), R.r(0, 3), 0, TAU); x.fill(); }
  };
  const broad = (s, wide, nCl) => {
    const cx = s * 0.5, cy = s * 0.42, rw = s * (wide ? 0.44 : 0.36), rh = s * (wide ? 0.33 : 0.36);
    trunk(s, cx, s * 0.99, cx + R.n(s * 0.02), cy, s * 0.04, s * 0.022);
    for (let b = 0; b < 4; b++) { const a = -Math.PI / 2 + R.n(1.0); trunk(s, cx, cy + s * 0.12, cx + Math.cos(a) * rw * 0.7, cy + Math.sin(a) * rh * 0.6, s * 0.018, s * 0.007); }
    const cl = []; for (let k = 0; k < nCl; k++) { const a = R.r(0, TAU), d = Math.sqrt(R.f()); cl.push([cx + Math.cos(a) * d * rw * 0.82, cy + Math.sin(a) * d * rh * 0.82, s * R.r(0.075, 0.13)]); }
    cl.sort((p, q) => (q[0] - q[1]) - (p[0] - p[1]));   // back-lower-left clusters first, front-upper-right last
    for (const [px, py, r] of cl) { const front = clamp(((px - cx) / rw - (py - cy) / rh) * 0.5 + 0.5); cluster(px, py, r, 0.55 + 0.4 * front); }
  };
  const conifer = (s) => { const cx = s * 0.5; trunk(s, cx, s * 0.99, cx, s * 0.6, s * 0.03, s * 0.02);
    for (let t = 0; t < 9; t++) { const y = s * (0.84 - t * 0.085), w = s * (0.3 - t * 0.03); for (let k = 0; k < 7; k++) { const u = (k / 6 - 0.5) * 2; const v = Math.round(255 * (0.45 + 0.35 * (u * 0.5 + 0.5) + R.r(-0.05, 0.05))); x.fillStyle = `rgb(${v},${v},${v})`;
      x.beginPath(); x.moveTo(cx + u * w * 0.2, y - s * 0.13); x.lineTo(cx + u * w + R.n(s * 0.02), y + s * 0.02); x.lineTo(cx + u * w * 0.5, y + s * 0.03); x.closePath(); x.fill(); } } };
  cell(0, (s) => broad(s, false, 26)); cell(1, (s) => broad(s, true, 34)); cell(2, (s) => conifer(s)); cell(3, (s) => broad(s, false, 16));
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.LinearEncoding; t.anisotropy = 4; return t;
}
// soft cumulus puffs: alpha shape with a flat-ish base; G = light (bright tops, shaded bases)
function nrCloudAtlas() {
  const S = 1024, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d'), R = RNG('nr-cloudatlas');
  for (let ci = 0; ci < 4; ci++) { const ox = (ci % 2) * S / 2, oy = Math.floor(ci / 2) * S / 2, s = S / 2; x.save(); x.translate(ox, oy); x.beginPath(); x.rect(0, 0, s, s); x.clip();
    const blobs = []; for (let k = 0; k < 60; k++) { const a = R.r(-Math.PI, 0), d = Math.pow(R.f(), 0.6) * s * 0.33, bx = s / 2 + Math.cos(a) * d * 1.25, by = s * 0.62 + Math.sin(a) * d * 0.95, r = s * R.r(0.06, 0.15) * (1 - 0.4 * d / (s * 0.33)); blobs.push([bx, Math.min(by, s * 0.66 - r * 0.4), r]); }
    blobs.sort((p, q) => q[1] - p[1]);
    for (const [bx, by, r] of blobs) { const lit = clamp(1 - (by - s * 0.25) / (s * 0.5)), g = x.createRadialGradient(bx + r * 0.25, by - r * 0.35, 0, bx, by, r);
      const hi = Math.round(150 + 105 * lit), lo = Math.round(70 + 90 * lit); g.addColorStop(0, `rgba(${hi},${hi},${hi},0.95)`); g.addColorStop(0.7, `rgba(${(hi + lo) >> 1},${(hi + lo) >> 1},${(hi + lo) >> 1},0.85)`); g.addColorStop(1, `rgba(${lo},${lo},${lo},0)`);
      x.fillStyle = g; x.fillRect(bx - r, by - r, 2 * r, 2 * r); }
    x.restore(); }
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.LinearEncoding; return t;
}
// one material for both: spherical billboards around aCtr; trees alpha-to-coverage + shadows, clouds blended
function nrBillMat(kind, tex) {
  const tree = kind === 'tree';
  const U = Object.assign({ tAtl: { value: tex }, uSunV: { value: new THREE.Vector3(1, 0, 0) }, uOp: { value: 1 }, uNear: { value: new THREE.Vector2(80, 600) } }, NRU);
  const m = new THREE.ShaderMaterial({ uniforms: U, transparent: !tree, depthWrite: tree, alphaToCoverage: tree,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute vec3 aCtr; attribute vec3 color; attribute vec2 aQ; uniform float uNrH, uNrOff, uOp; uniform vec2 uNear; ${CURVE_GLSL}
      varying vec2 vUv, vQ; varying vec3 vTint, vNrW;
      void main(){
        vec4 wp = modelMatrix * vec4(aCtr, 1.0);
        ${tree ? 'float zp = wp.z / uNrH - uNrOff; wp.y -= smoothstep(-3.55, -2.85, zp) * step(zp, 7.0) * (max(aCtr.y, 0.0) + 40.0 + 0.1 * uNrH);' : ''}
        wp.xyz = curveDrop(wp.xyz); vNrW = wp.xyz;
        vec4 mv = viewMatrix * wp; mv.xy += position.xy;
        vUv = uv; vQ = aQ; vTint = color;
        gl_Position = projectionMatrix * mv;
        ${tree ? '' : 'if (length(wp.xyz - cameraPosition) < uNear.x * 0.9 || uOp < 0.005) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);'}
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform sampler2D tAtl; uniform vec3 uSunV; uniform float uOp; uniform vec2 uNear; varying vec2 vUv, vQ; varying vec3 vTint, vNrW;
      ${NR_FOG_GLSL}
      void main(){
        #include <logdepthbuf_fragment>
        vec4 t = texture2D(tAtl, vUv);
        vec3 n = normalize(vec3(vQ * vec2(1.0, 1.0), 0.62));
        float dif = max(dot(n, uSunV), 0.0);
        ${tree ? `
        if (t.a < 0.15) discard;
        float trunk = smoothstep(0.03, 0.1, t.r - t.b);
        float L = t.g;
        vec3 leaf = vTint * L * (0.95 * mix(vec3(0.42, 0.45, 0.4), vec3(0.75, 0.82, 0.92), L) + vec3(1.0, 0.9, 0.75) * 1.9 * dif * smoothstep(0.35, 0.9, L));
        vec3 bark = vec3(0.30, 0.22, 0.16) * (0.6 + 0.8 * L) * (0.7 + 0.8 * dif);
        vec3 c = mix(leaf, bark, trunk);
        float a = t.a;` : `
        float L = t.g;
        vec3 c = mix(vec3(0.58, 0.64, 0.75), vec3(1.06, 1.01, 0.95), smoothstep(0.25, 0.95, L));
        c += vec3(1.0, 0.88, 0.7) * 0.25 * dif * L;
        float near = smoothstep(uNear.x, uNear.y, length(vNrW - cameraPosition));
        float a = t.a * uOp * near; if (a < 0.01) discard;`}
        c = nrFog(c, vNrW);
        gl_FragColor = vec4(c, a);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` });
  return m;
}
// baked billboard mesh: items [{x, y, z, w, h, cell, tint}] -> one mesh per tile; quad centred on (x, y, z), cell = atlas quadrant
function nrBillboards(parent, mat, items, o = {}) {
  const T = o.tile || 1000, buckets = new Map(), grp = new THREE.Group(), c = new THREE.Color();
  for (const it of items) { const k = Math.floor(it.x / T) + ',' + Math.floor(it.z / T); if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(it); }
  for (const L of buckets.values()) {
    if (o.sortZ) L.sort((a, b) => a.z - b.z);
    const n = L.length, P = new Float32Array(n * 12), C3 = new Float32Array(n * 12), UV = new Float32Array(n * 8), Q = new Float32Array(n * 8), C = new Float32Array(n * 12), I = new Uint32Array(n * 6);
    L.forEach((it, k) => { const u0 = (it.cell % 2) * 0.5, v0 = 1 - Math.floor(it.cell / 2) * 0.5 - 0.5, cy = it.cy ?? 0.5, qc = it.qc ?? 0.5, qr = it.w * 0.45;
      const corners = [[-0.5, -cy, 0, 0], [0.5, -cy, 1, 0], [0.5, 1 - cy, 1, 1], [-0.5, 1 - cy, 0, 1]];
      c.set(it.tint || '#ffffff');
      corners.forEach(([qx, qy, uu, vv], j) => { const q = k * 4 + j; P[q * 3] = qx * it.w; P[q * 3 + 1] = qy * it.h; P[q * 3 + 2] = 0; Q[q * 2] = qx * it.w / qr; Q[q * 2 + 1] = (qy + cy - qc) * it.h / qr;
        C3[q * 3] = it.x; C3[q * 3 + 1] = it.y; C3[q * 3 + 2] = it.z; UV[q * 2] = u0 + uu * 0.5; UV[q * 2 + 1] = v0 + vv * 0.5; C[q * 3] = c.r; C[q * 3 + 1] = c.g; C[q * 3 + 2] = c.b; });
      I.set([k * 4, k * 4 + 1, k * 4 + 2, k * 4, k * 4 + 2, k * 4 + 3], k * 6); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aCtr', new THREE.BufferAttribute(C3, 3)); g.setAttribute('uv', new THREE.BufferAttribute(UV, 2)); g.setAttribute('aQ', new THREE.BufferAttribute(Q, 2)); g.setAttribute('color', new THREE.BufferAttribute(C, 3)); g.setIndex(new THREE.BufferAttribute(I, 1));
    let cx = 0, cz = 0, cy2 = 0; for (const it of L) { cx += it.x; cz += it.z; cy2 += it.y; } cx /= n; cz /= n; cy2 /= n; let r = 0; for (const it of L) r = Math.max(r, Math.hypot(it.x - cx, it.z - cz, it.y - cy2) + Math.max(it.w, it.h));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(cx, cy2, cz), r + 80);
    const m = new THREE.Mesh(g, mat); m.castShadow = !!o.cast; m.receiveShadow = false; if (o.depth) m.customDepthMaterial = o.depth; if (o.order) m.renderOrder = o.order; grp.add(m);
  }
  parent.add(grp); return grp;
}
function nrBillDepth(tex) {   // the trees' shadow: the same billboard, facing the sun, alpha-tested
  const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
  m.onBeforeCompile = (sh) => { sh.uniforms.uNrH = NRU.uNrH; sh.uniforms.uNrOff = NRU.uNrOff;
    sh.vertexShader = 'attribute vec3 aCtr; uniform float uNrH, uNrOff;\n' + sh.vertexShader.replace('#include <project_vertex>', `
      vec4 nrWp = modelMatrix * vec4(aCtr, 1.0); float nrZp = nrWp.z / uNrH - uNrOff; nrWp.y -= smoothstep(-3.55, -2.85, nrZp) * step(nrZp, 7.0) * (400.0 + 0.2 * uNrH);
      vec4 mvPosition = viewMatrix * nrWp; mvPosition.xy += position.xy; gl_Position = projectionMatrix * mvPosition;`); };
  m.customProgramCacheKey = () => 'nr-billdepth'; return m;
}
function nrBuildTrees(S, P) {
  const W0 = S.world, R = RNG('nr-trees'), atl = nrTreeAtlas(), mat = nrBillMat('tree', atl), dep = nrBillDepth(atl); S.billMats = [mat];
  for (const t of P.trees) t.y = nrHeight(t.x, t.z);
  const T = P.trees.filter((t) => t.y > 0.3);
  const GC = ['#5d8a35', '#6e9a3e', '#4f7a2f', '#7aa346', '#587f33', '#86a84c', '#4a6e2c', '#668f3a'], AUT = ['#d8822c', '#c8502a', '#e0a83a', '#b8402a', '#d86a2a'], PC = ['#3d6a3a', '#4a7340', '#36603a', '#557a44'];
  const item = (t) => { const pine = t.t === 'pine' || t.t === 'cyp', s = t.s * R.r(0.85, 1.15), w = (pine ? (t.t === 'cyp' ? 3.2 : 6.5) : 9.5) * s, h = (pine ? (t.t === 'cyp' ? 9 : 12) : 10) * s, cy = pine ? 0.08 : 0.06;
    const cell = pine ? 2 : R.f() < 0.4 ? 1 : R.f() < 0.25 ? 3 : 0, aut = !pine && R.f() < (t.forest ? 0.18 : 0.1);
    return { x: t.x, y: t.y + h * 0.02, z: t.z, w, h, cy, qc: pine ? 0.5 : 0.58, cell, tint: pine ? R.pick(PC) : aut ? R.pick(AUT) : R.pick(GC) }; };
  // quads anchored at the trunk foot (cy = fraction of the quad below the anchor)
  const town = T.filter((t) => !t.forest).map(item), forest = T.filter((t) => t.forest).map(item);
  S.lods.push([1500, 14], nrBillboards(W0, mat, town, { tile: 700, cast: true, depth: dep }));
  S.forestGrps = [nrBillboards(W0, mat, forest, { tile: 1600, cast: false })];
}
// ---------------------------------------------------------------- clouds: soft lit impostor puffs (bright tops, shaded flat bases), a deck around the path
function nrBuildClouds(S, P) {
  const R = RNG('nr-clouds'), sprites = [], atl = nrCloudAtlas(), mat = nrBillMat('cloud', atl); S.billMats.push(mat);
  const cloud = (cx, cz, base, size, deck = 0) => { const n = Math.round(5 + size / 160) + (deck ? 4 : 0);
    sprites.push({ x: cx, y: base + size * 0.3, z: cz, w: size * 1.5, h: size * 1.5, cell: R.i(0, 3) });   // the body
    for (let k = 0; k < n; k++) { const a = R.r(0, TAU), d = Math.pow(R.f(), 0.8) * size * 0.55, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d * 0.8, s = size * R.r(0.45, 0.85) * (1 - 0.35 * d / (size * 0.55));
      sprites.push({ x, y: base + s * 0.32 + (1 - d / (size * 0.55)) * size * 0.18, z, w: s * 1.4, h: s * 1.4, cell: R.i(0, 3) }); } };
  for (let k = 0; k < 420; k++) { const x = R.r(-26000, 40000), z = R.r(-60000, -1500); if ((Math.abs(x - 600) < 2600 && z > -5200) || (x > -3000 && x < 4500 && z < -3500 && z > -9000)) continue; cloud(x, z, R.r(850, 1200), R.r(350, 1500)); }
  for (let k = 0; k < 120; k++) { const x = R.r(-2500, 6000), z = R.r(-6800, -12000); cloud(x, z, R.r(1300, 1450), R.r(500, 1500), 1); }
  cloud(700, -8350, 1320, 1800, 1); cloud(-300, -8100, 1350, 1400, 1); cloud(1500, -7900, 1350, 1500, 1); cloud(400, -7600, 1380, 1300, 1);
  // wisps where the rider enters the deck
  for (let k = 0; k < 140; k++) sprites.push({ x: R.r(-600, 2400), y: R.r(1380, 1800), z: R.r(-6900, -8800), w: R.r(250, 700), h: R.r(200, 500), cell: R.i(0, 3), wisp: 1 });
  S.clouds = nrBillboards(S.world, mat, sprites.filter((s) => !s.wisp), { tile: 4000, sortZ: true, order: 3 });
  const wm = nrBillMat('cloud', atl); S.billMats.push(wm); S.wispMat = wm;
  S.wisps = nrBillboards(S.world, wm, sprites.filter((s) => s.wisp), { tile: 4000, sortZ: true, order: 4 });
  // spray and mist thrown up along the flood front (positions follow the wave each frame)
  const NSP = 110, sm = nrBillMat('cloud', atl); S.billMats.push(sm); const sp = [];
  for (let k = 0; k < NSP; k++) sp.push({ x: 0, y: 0, z: -k, w: 1, h: 1, cell: R.i(0, 3) });
  const sg = nrBillboards(S.world, sm, sp, { tile: 1e9, order: 5 }); const mesh = sg.children[0]; mesh.frustumCulled = false;
  S.spray = { mesh, mat: sm, n: NSP, seed: sp.map(() => [R.f(), R.f(), R.f(), R.f()]) };
}
function nrSprayUpdate(S, st, Hm, tr, off) {
  const SP = S.spray, A = SP.mesh.geometry.attributes.aCtr, P = SP.mesh.geometry.attributes.position, on = ss(58, 66, st) * (1 - ss(176, 181, st));
  SP.mat.uniforms.uOp.value = 0.75 * on; SP.mat.uniforms.uNear.value.set(Hm * 0.25, Hm * 1.1); SP.mesh.visible = on > 0.01;
  for (let k = 0; k < SP.n; k++) { const [a, b, c2, d] = SP.seed[k], xr = (-1.2 + 8 * a) * Hm, life = (st * (0.15 + 0.1 * d) + c2) % 1;
    const zr = (-3.3 + off + 0.15 * (b - 0.5) - 0.08 * life) * Hm, s = Hm * (0.12 + 0.35 * b) * (0.6 + 0.8 * life), y = Hm * (0.01 + 0.06 * life) + s * 0.25;
    for (let j = 0; j < 4; j++) { const q = k * 4 + j; A.setXYZ(q, xr, y, zr - tr); const cx = (j === 0 || j === 3) ? -0.5 : 0.5, cy = j < 2 ? -0.5 : 0.5; P.setXY(q, cx * s * 1.6, cy * s); } }
  A.needsUpdate = true; P.needsUpdate = true;
}

// ---------------------------------------------------------------- per frame
function nrUpdate(S, st, Hm, tr) {
  const tmp = nrMt, A = S.cars.tmp;
  const off = NRU.uNrOff.value, zpOf = (zr) => zr / Hm - off, zrOf = (z) => z + tr;
  // the water surface under something floating: the sea, drawn down just before the wave, then the wave's own trough and face
  const waterY = (zr) => { const zp = zpOf(zr), sea = -(0.036 * Hm + 0.05) * ss(-3.1, -2.8, zp); return zp < -2.8 ? sea : Math.max(sea, Hm * waveProfile(Math.min(zp, -0.2))[1] * waveWob(st)); };
  const gone = (zr) => zpOf(zr) > -0.3;
  const onSea = st < 110;
  // people
  if (st < 125) for (const L of S.crowds) {
    const b0 = NR_TM[0], part = NR_TM[1], piv = NR_TM[2], bmM = NR_TM[3], cc = NR_COLT; let bi = 0, i = -1;
    const maxD = 260 + 9 * eyeY(st);
    for (const p of L.list) {
      if (Math.hypot(p.x, p.z + tr) > maxD) continue;
      i++; L.body.setColorAt(i, cc.set(p.suit)); cc.set(p.pants); L.pants.setXYZ(i, cc.r, cc.g, cc.b); L.head.setColorAt(i, cc.set(p.skin)); L.armL.setColorAt(i, cc); L.armR.setColorAt(i, cc);
      if (p.board) L.bm.setColorAt(bi, cc.set(p.bcol));
      const zr = zrOf(p.z); let x = p.x, z = p.z, y, ry = p.a, pitch = 0, look = 0, armA = 0.15, armB = 0.15, raise = 0, bodyY = 0;
      const near = clamp(1 - ((-2.8 - zpOf(zr)) * Hm) / (8 * Hm + 30));      // the wave is close: turn, look up
      if (p.w) {
        const bob = 0.12 * Math.sin(st * 1.7 + p.ph);
        y = waterY(zr) + bob;
        const face = clamp((zpOf(zr) + 1.25) / 1.0);
        const turn = ss(0.1 + p.turnT * 0.3, 0.7, near); ry = lerp(p.a, 0, turn);
        look = p.look ? -0.75 * ss(0.15, 0.8, near) - 0.3 * face : 0;
        if (p.wave && near > 0.3) { raise = 1; }
        if (p.kind === 'swim' || p.kind === 'float') { bodyY = p.kind === 'float' ? -1.0 : -1.3; pitch = p.kind === 'float' ? -1.1 * (1 - near) : 0; armA = 0.6 + 0.3 * Math.sin(st * 2 + p.ph); armB = armA; }
        else if (p.kind === 'sit') { bodyY = -0.8; armA = armB = 0.3; }
        else { bodyY = -0.05; pitch = lerp(Math.PI / 2, 0.6, ss(0.3, 0.9, near)); armA = 0.4 + 1.2 * (0.5 + 0.5 * Math.sin(st * 3.2 + p.ph)) * (1 - near); armB = 0.4 + 1.2 * (0.5 + 0.5 * Math.sin(st * 3.2 + p.ph + Math.PI)) * (1 - near); bodyY = -0.35; }
        // the face lifts and tilts them
        const slope = Math.atan((waterY(zr + 0.5) - waterY(zr - 0.5)));
        nrM4(x, y + bodyY, z, ry, p.s, p.s, p.s, pitch - slope * 0.5, 0, b0);
        if (p.board) L.bm.setMatrixAt(bi++, gone(zr) ? NR_HIDE : nrM4(x, y + 0.02, z, ry, 1, 1, 1, -slope * 0.8, 0, bmM));
      } else {
        y = p.pier ? S.pier.top : nrHeight(x, z);
        if (p.kind === 'walk') { const d = (st * p.v + p.ph * 20) % 60 - 30; x += Math.sin(p.a) * d; y = nrHeight(x, z) + Math.abs(Math.sin(st * p.v * 3 + p.ph)) * 0.04; armA = 0.15 + 0.25 * Math.sin(st * p.v * 3 + p.ph); armB = -armA + 0.3; }
        const alarm = ss(0, 0.6, near); ry = lerp(p.a, 0, p.look ? alarm : 0);
        if (p.kind === 'lie') { pitch = lerp(-Math.PI / 2, 0, ss(0.35, 0.8, near) * (p.look ? 1 : 0)); bodyY = pitch < -0.5 ? 0.2 : 0; }
        if (p.kind === 'sitb') bodyY = -0.42 * (1 - ss(0.3, 0.7, near));
        look = p.look ? -0.6 * alarm : 0;
        if (p.wave && near > 0.4) raise = 1;
        nrM4(x, y + bodyY, z, ry, p.s, p.s, p.s, pitch, 0, b0);
      }
      L.body.setMatrixAt(i, b0);
      part.makeTranslation(0, 1.42, 0).multiply(nrMt2.makeRotationX(look)).multiply(piv.makeTranslation(0, -1.42, 0)); L.head.setMatrixAt(i, part.premultiply(b0));
      const wav = raise ? Math.PI - 0.35 + 0.35 * Math.sin(st * 7 + p.ph) : armA;
      part.makeTranslation(-0.22, 1.36, 0).multiply(nrMt2.makeRotationZ(-wav)); L.armL.setMatrixAt(i, part.premultiply(b0));
      part.makeTranslation(0.22, 1.36, 0).multiply(nrMt2.makeRotationZ(armB)); L.armR.setMatrixAt(i, part.premultiply(b0));
      if (p.w && gone(zr)) { for (const m of [L.body, L.head, L.armL, L.armR]) m.setMatrixAt(i, NR_HIDE); }
    }
    L.pants.needsUpdate = true; for (const m of L.parts) { m.count = m === L.bm ? bi : i + 1; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.visible = m.count > 0; }
  } else for (const L of S.crowds) for (const m of L.parts) m.visible = false;
  // buoys and boats ride the swell and then the face
  if (onSea) {
    S.buoys.list.forEach((b, i) => { const zr = zrOf(b.z), y = waterY(zr) + 0.1 * Math.sin(st * 1.5 + b.x); S.buoys.im.setMatrixAt(i, gone(zr) ? NR_HIDE : nrM4(b.x, y + b.s * 0.3, b.z, 0, b.s, b.s * (b.big ? 1.3 : 1), b.s, 0, 0, tmp)); });
    S.buoys.im.instanceMatrix.needsUpdate = true;
    for (const b of S.boats) { const x = b.x + Math.sin(b.a) * b.v * st, z = b.z + Math.cos(b.a) * b.v * st, zr = zrOf(z), y = waterY(zr), sl = Math.atan(waterY(zr + 1) - waterY(zr - 1)) * 0.5;
      b.grp.visible = !gone(zr); b.grp.position.set(x, y + 0.05 * Math.sin(st * 1.3 + b.ph), z); b.grp.rotation.set(-sl * Math.cos(b.a) + 0.03 * Math.sin(st * 1.1 + b.ph), b.a, b.heel + sl * Math.sin(b.a) + 0.04 * Math.sin(st * 0.9 + b.ph)); b.cur = [x, y, z]; }
    for (const w of S.wakes) { const b = w.b, [x, y, z] = b.cur; w.m.visible = b.grp.visible && zpOf(zrOf(z)) < -2.9; w.m.position.set(x - Math.sin(b.a) * b.L * 2.2, y + 0.05, z - Math.cos(b.a) * b.L * 2.2); w.m.rotation.y = b.a + Math.PI; w.m.scale.set(b.L * 2.2, 1, b.L * 3.6); }
    for (const gl of S.gulls) { const a = st * gl.w + gl.ph, x = gl.cx + Math.cos(a) * gl.r, z = gl.cz + Math.sin(a) * gl.r; gl.grp.position.set(x, gl.y + Math.sin(st * 0.7 + gl.ph) * 2 + ss(-9, -3, zpOf(zrOf(z))) * Hm * 1.3, z);
      gl.grp.rotation.set(0, a + (gl.w > 0 ? 0 : Math.PI), -0.25 * Math.sign(gl.w)); const fl = Math.sin(st * 8 + gl.ph) * (Math.sin(st * 0.6 + gl.ph) > 0.3 ? 0.55 : 0.08); gl.wl.rotation.z = fl; gl.wr.rotation.z = -fl; gl.grp.visible = st < 95; }
  } else { for (const b of S.boats) b.grp.visible = false; for (const w of S.wakes) w.m.visible = false; for (const gl of S.gulls) gl.grp.visible = false; S.buoys.im.visible = false; }
  // the foam collar where the flood / the wave climbs the lighthouse
  { const C = S.collar, zr = zrOf(C.z), zp = zpOf(zr); C.m.visible = zp > -2.85 && zp < -0.25 && st < 115; if (C.m.visible) { const y = waterY(zr); C.m.position.set(C.x, y + 0.3, C.z); C.m.rotation.y = st * 0.3; const k = 1 + 0.08 * Math.sin(st * 3); C.m.scale.set(k, 1, k); } }
  // flags flutter
  for (const f of S.flags || []) { const p = f.m.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x0 = f.base[i * 3], y0 = f.base[i * 3 + 1]; p.setZ(i, Math.sin(x0 * 5 - st * 9) * 0.12 * x0); p.setY(i, y0 - x0 * 0.05 * Math.sin(st * 3)); } p.needsUpdate = true; }
  // cars
  { const C = S.cars; C.list.forEach((k, i) => { const L = k.ro.r.len, s = ((k.s0 + k.dir * k.v * st) % L + L) % L; nrAlong(k.ro.r, k.dir > 0 ? s : L - s, A);
      const hd = A[3] + (k.dir > 0 ? 0 : Math.PI), ox = Math.cos(hd) * k.ro.lane, oz = -Math.sin(hd) * k.ro.lane, sc = k.big;
      C.im.setMatrixAt(i, nrM4(A[0] + ox, A[2] + 0.05, A[1] + oz, hd, sc, sc * (k.bus ? 1.6 : 1), sc * (k.bus ? 2.7 : 1), 0, 0, tmp)); }); C.im.instanceMatrix.needsUpdate = true; }
  // trains
  { const T = S.trains; let n = 0; for (const t of T.t) { for (let k = 0; k < 8; k++) { const s = clamp(t.s0 + t.dir * t.v * st - t.dir * k * 20.5, 0, T.rail.len); nrAlong(T.rail, s, A); T.im.setMatrixAt(n++, nrM4(A[0], A[2] + 0.4, A[1], A[3], 1, 1, 1, 0, 0, tmp)); } } T.im.instanceMatrix.needsUpdate = true; }
  for (const r of S.rotors) r.m.rotation.z = st * r.v + r.ph;
  for (const s of S.smoke) { const u = (st * 0.06 + s.ph) % 1, [x, y, z] = s.ch; s.sp.position.set(x - u * 120, y + u * 70, z - u * 50); const sz = 8 + u * 60; s.sp.scale.set(sz, sz, 1); s.sp.material.opacity = 0.55 * (1 - u) * ss(0, 0.1, u); }
}

// ---------------------------------------------------------------- the stage
function stageNear(g, st) {
  if (!nrG) nrG = nrBuild(g);
  const S = nrG, Hm = waveH(st), tr = travel(st), ey = eyeY(st);
  const c = applyCam(g, st, Math.max(0.25, Hm * 0.012), 450000);
  updateWave(g, st); if (g.wave.mesh.parent !== S.scene) S.scene.add(g.wave.mesh);
  S.world.position.z = tr;
  NRU.uNrH.value = Hm; NRU.uNrTrav.value = tr; NRU.uNrCamY.value = ey; NRU.uNrOff.value = g.wave.mesh.position.z / Hm;
  // whiteout: into the cloud deck
  const wh = Math.pow(ss(181.5, 184.3, st), 2.0); NRU.uNrWhite.value = wh;
  const fogD = 4.6e-5; NRU.uNrFogD.value = fogD;
  FOGC.value.copy(NRU.uNrFogC.value).lerp(lin('#f6f8fb'), wh); FOGD.value = fogD * Math.exp(-ey / NRU.uNrHs.value) * 0.8 + wh * wh * wh * 0.02;
  SKYC.value.set('#9cbde2').lerp(lin('#f4f6f9'), wh);
  g.wave.U.uDark.value = 0; g.wave.U.uIce.value = 0; g.wave.U.uBoil.value = 0;
  S.sky.position.set(0, ey, 0); S.sky.scale.setScalar(1);
  S.wispMat.uniforms.uOp.value = Math.pow(ss(182.6, 184.3, st), 1.5) * 0.85 * (1 - ss(184.2, 184.7, st)); S.wispMat.uniforms.uNear.value.set(250, 1100); S.billMats[1].uniforms.uNear.value.set(lerp(80, 500, ss(180, 183, st)), lerp(600, 2600, ss(180, 183, st)));
  S.billMats[1].uniforms.uOp.value = 1 - ss(183.6, 184.4, st);
  { const sv = SUN.clone().transformDirection(g.cam.matrixWorldInverse); for (const m of S.billMats) m.uniforms.uSunV.value.copy(sv); }
  S.beachGrp.visible = st < 118; S.pierGrp.visible = st < 100; S.wisps.visible = st > 168;
  for (const f of S.forestGrps || []) f.visible = st > 96;
  for (let i = 0; i < S.lods.length; i += 2) { const [b0, k] = S.lods[i], maxD = b0 + k * ey;
    for (const m of S.lods[i + 1].children) { const bs = m.geometry.boundingSphere; m.visible = Math.hypot(bs.center.x, bs.center.z + tr) - bs.radius < maxD; } }
  nrUpdate(S, st, Hm, tr);
  nrSprayUpdate(S, st, Hm, tr, NRU.uNrOff.value);
  // the shadow box follows what the rider looks at
  { const A = clamp(70 + 3.2 * ey, 90, 2600), fx = -Math.sin(c.yaw), fz = -Math.cos(c.yaw), cx = fx * A * 0.85, cz = fz * A * 0.85;
    const sun = S.sun; sun.target.position.set(cx, 0, cz); sun.position.set(cx, 0, cz).addScaledVector(SUN, A * 3 + 400);
    const sc = sun.shadow.camera; sc.left = -A; sc.right = A; sc.top = A * 0.35 + 60; sc.bottom = -A * 0.35 - 60; sc.near = 1; sc.far = A * 6 + 1200; sc.updateProjectionMatrix();
    sun.intensity = 2.6 * (1 - wh * 0.6); S.hemi.intensity = 0.95 + wh * 0.5; }
  g.r.render(S.scene, g.cam);
  return {
    sky: lin('#cfe1f6').lerp(lin('#ffffff'), wh), ground: lin(st < 70 ? '#2f6f7a' : '#6a7a68').lerp(lin('#e8ecf0'), wh), key: 2.2 * (1 - wh * 0.5), hemi: 0.9 + wh * 0.6,
    spray: 1, flare: lerp(0.7, 0.45, ss(100, 150, st)) * (1 - wh), bloom: lerp(0.26, 0.2, ss(100, 150, st)),
    post: wh > 0.05 ? (s) => { const a = Math.pow(ss(182, 185, s), 1.5) * 0.62; if (a <= 0) return; ctx.save(); screen(); ctx.globalAlpha = a; ctx.fillStyle = '#f5f7fa'; ctx.fillRect(0, 0, W, H); ctx.restore(); } : null,
  };
}
