
// =====================================================================
//  SCENES — a hillside balcony over a lakeside village in a mountain valley (metres; the camera looks across the lake, -z).
//  Helpers, textures, the valley's geography, the story's numbers (the lake level, the eras), the camera.
//  World in world.js, motion in run.js. Everything is a pure function of TT + seeded RNG: deterministic frame by frame.
// =====================================================================
THREE.ColorManagement.legacyMode = false;   // hex colours are sRGB
const lin = (h) => new THREE.Color(h);
const C3 = (a, b, k) => lin(a).lerp(lin(b), clamp(k));
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const dirV = (az, el) => new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
function knots(K, t) {   // a smooth monotone curve through knots
  if (t <= K[0][0]) return K[0][1];
  if (t >= K[K.length - 1][0]) return K[K.length - 1][1];
  let i = 0; while (t > K[i + 1][0]) i++;
  const [t0, v0] = K[i], [t1, v1] = K[i + 1], h = t1 - t0, u = (t - t0) / h;
  const sl = (j) => (K[Math.min(j + 1, K.length - 1)][1] - K[Math.max(j - 1, 0)][1]) / (K[Math.min(j + 1, K.length - 1)][0] - K[Math.max(j - 1, 0)][0]);
  let m0 = sl(i) * h, m1 = sl(i + 1) * h; const d = v1 - v0;
  if (d === 0) { m0 = m1 = 0; } else { m0 = Math.sign(d) * Math.min(Math.abs(m0), 3 * Math.abs(d)) * (Math.sign(m0) === Math.sign(d) ? 1 : 0); m1 = Math.sign(d) * Math.min(Math.abs(m1), 3 * Math.abs(d)) * (Math.sign(m1) === Math.sign(d) ? 1 : 0); }
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * m1;
}

const pan = (K, t) => { if (t <= K[0][0]) return K[0][1]; if (t >= K[K.length - 1][0]) return K[K.length - 1][1]; let i = 0; while (t > K[i + 1][0]) i++; const [a, va] = K[i], [b, vb] = K[i + 1]; return va + (vb - va) * ss(a, b, t); };

// ---- the place: our hill (40 m) sloping down through the village to the lake shore (z ~ -280); the lake to the far
//      mountains; hills on both sides
const HILL = 40, SHORE_Z = -280;
const riverZ = (x) => -165 + 28 * Math.sin(x * 0.006 + 0.8) + 0.12 * x;   // a river crossing the village to the lake
function terrH(x, z) {
  const ax = Math.abs(x), n1 = 0.5 + 0.5 * Math.sin(x * 0.013 + 1.2) * Math.sin(z * 0.011 - 0.4);
  let h;
  if (z > SHORE_Z) { const u = clamp((z + 10 * Math.sin(x * 0.01) - SHORE_Z) / (-6 - SHORE_Z)); h = 2 + (HILL - 2) * Math.pow(u, 2.2) * (1 - 0.35 * ss(120, 420, ax)) + 1.2 * n1 * u + (z > -6 ? 1.5 : 0); }
  else h = 2 - 14 * ss(SHORE_Z, SHORE_Z - 220, z);
  const rz = riverZ(x), rd = Math.abs(z - rz); if (z > SHORE_Z - 10 && rd < 30) h = Math.min(h, lerp(-2.5, h, ss(9, 30, rd)));
  const sides = 520 * ss(380, 1500, ax) * (0.7 + 0.3 * Math.sin(z * 0.0013 + x * 0.0009)) * (0.8 + 0.2 * n1);
  const far = ss(3200, 6200, -z) * (900 + 380 * Math.sin(x * 0.0011 + 0.7) * Math.sin(z * 0.0009) + 160 * Math.abs(Math.sin(x * 0.004 + z * 0.002)));
  return Math.max(h, ax > 380 ? sides : -1e9, far + (z < SHORE_Z ? -12 : 0));   // (the side hills only outside the valley: a 0 here pinned the lake bed to the water and made it flicker)
}
const EYE0 = HILL + 20, EYE1 = HILL + 1.5 + 4.2, CAMZ = 0;   // today a balcony high on a tower on the hill; after the jump to the Carnian, low over the swamp
const eyeAt = (t) => (t < 43.15 ? EYE0 : EYE1), EYE = EYE1;
const SUN_DIR = dirV(-28 * DEG, 9 * DEG);
const VOLC = { az: 17 * DEG, d: 7200 };   // the Carnian volcano, far up the valley to the right

// ---- the story's numbers
// the lake rises over the village (m); after 43 s it is the Carnian swamp at the same level
const lakeLevel = (t) => knots([[0, 0], [14, 0.3], [20, 10], [25, 21], [30, 27], [34, 29], [70, 29]], t);
const rainK = (t) => t < 4.5 ? 0 : t < 53 ? ss(4.5, 9, t) * (0.75 + 0.25 * ss(9, 14, t)) * (t > 48 ? 0.6 + 0.4 * Math.abs(Math.sin(t * 1.3)) : 1) : 1 - ss(53, 55.5, t);
const village = (t) => 1 - ss(30, 33.5, t);           // the village stands until year 100
const jungle = (t) => ss(34, 40, t);                   // ferns and conifers grow
const triassic = (t) => ss(43, 43.6, t);               // the jump to the Carnian
const clearSky = (t) => ss(53, 57, t);
const T_HIT = 63.3;
// the dinosaur: it climbs out of the swamp (z -95) up the hill to the railing; distance in m for the HUD
const DINO = [[56.8, -62], [59, -44], [61, -24], [62.6, -9.5], [70, -9.5]];
const dinoZ = (t) => knots(DINO, t);
// the camera: on the balcony, a slow handheld float; it lifts its eyes as the dinosaur comes up; the roar shakes it
// lightning strikes: time, where it hits (x, z)
const BOLTS = [[1.1, 117, -900], [3.9, -189, -1400], [6.2, 54, -2400], [8.7, 234, -700], [11.0, -117, -520], [13.2, -315, -1800], [16.4, 148, -1300], [19.0, -54, -3000], [21.6, 288, -2100], [25.0, -216, -900], [28.4, 72, -1600], [32.6, -135, -2600], [37.2, 189, -1100], [41.0, -270, -1500], [46.2, 117, -2200], [50.8, -171, -1700]];
const lightning = (t) => { let k = 0; for (const [t0] of BOLTS) { const a = t - t0; if (a >= 0 && a < 0.6) k = Math.max(k, Math.exp(-a * 9) * (0.6 + 0.4 * Math.sign(Math.sin(a * 60)))); } return k; };
function camPose(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c, roar = t >= T_HIT ? Math.exp(-(t - T_HIT) * 2.5) : 0, st = 0.05 * ss(48, 52, t) * (1 - ss(53, 55, t));
  const look = knots([[0, -11], [14, -12], [30, -11.5], [43.1, -11], [43.2, -8], [48, -6], [53, -7], [57, -8], [60, -5], [62.6, 3], [63.3, 6], [64.5, 7]], t);
  return {
    x: n(0.31, 1, 0.025) + roar * n(23, 0, 0.08),
    y: eyeAt(t) + n(0.43, 0.3, 0.02) + roar * n(29, 2, 0.06),
    z: CAMZ + n(0.19, 2.2, 0.02) + 0.25 * roar,
    yaw: (knots([[0, 0], [30, 0], [48, 3], [53, 2], [57, 0]], t) + n(0.21, 0.7, 0.3) + n(0.57, 2.1, 0.12) + roar * n(19, 3, 1.2) + st * n(17, 1, 8)) * DEG,
    pitch: (look + n(0.33, 1.2, 0.2) + n(0.81, 0.4, 0.08) + roar * (n(31, 1, 1.6) + n(53, 3, 0.8))) * DEG,
    roll: (n(0.27, 2.1, 0.2) + roar * n(21, 2, 1.8)) * DEG,
  };
}
// ---- small helpers
function g3Tex(draw, w = 128, h = 128, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; return t; }
const g3Radial = (stops, w = 128) => g3Tex((x) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); stops.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, w, w); }, w, w);
const IM = (geo, mat, n, shadow = true) => { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, n)); m.castShadow = shadow; m.receiveShadow = true; m.count = n; return m; };
const M4c = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
const wrap = (t, rx, ry) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rx) t.repeat.set(rx, ry); return t; };
const STD = (o) => new THREE.MeshStandardMaterial(o);
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(), _hid = new THREE.Matrix4().makeScale(0, 0, 0);
const speck = (x, w, h, n, cols, R, s0 = 1, s1 = 3) => { for (let k = 0; k < n; k++) { x.fillStyle = R.pick(cols); x.fillRect(R.r(0, w), R.r(0, h), R.r(s0, s1), R.r(s0, s1)); } };
const hsh = (i, k = 1) => mod(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453, 1);

function noise2(R, N = 64) {   // a value-noise sampler (seeded lattice of N cells + smooth interpolation), seamless in x
  const L = Array.from({ length: N * N }, () => R.f()), at = (i, j) => L[((j % N) + N) % N * N + ((i % N) + N) % N];
  return (u, v) => { const x = u * N, y = v * N, i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    return lerp(lerp(at(i, j), at(i + 1, j), sx), lerp(at(i, j + 1), at(i + 1, j + 1), sx), sy); };
}
// ---- code-drawn textures
// a Mediterranean stucco facade, 24 m x 24 m = 8 bays x 8 floors: plaster (luminance, tinted per house), painted shutters,
// iron balconies; plus its lit sheet (alpha = when that window turns on, 0.25-1)
function texStucco() {
  const w = 1024, c = w / 8, R = RNG('stucco'), mk = () => { const cv = document.createElement('canvas'); cv.width = cv.height = w; return cv; };
  const ca = mk(), cl = mk(), x = ca.getContext('2d'), l = cl.getContext('2d');
  x.fillStyle = '#e8e2d6'; x.fillRect(0, 0, w, w); speck(x, w, w, 16000, ['rgba(90,70,50,0.07)', 'rgba(255,255,255,0.12)'], R, 1, 4);
  for (let k = 0; k < 40; k++) { const g = x.createLinearGradient(0, 0, 0, w); g.addColorStop(0, 'rgba(70,60,50,0)'); g.addColorStop(1, `rgba(70,60,50,${R.r(0.04, 0.12)})`); x.fillStyle = g; x.fillRect(R.r(0, w), R.r(0, w), R.r(3, 14), R.r(60, 300)); }
  l.fillStyle = '#000'; l.fillRect(0, 0, w, w);
  for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) { if (R.f() < 0.2) continue; const ww = c * 0.34, hh = c * 0.52, px = q * c + (c - ww) / 2, py = r * c + c * 0.22, sh = R.pick(['#2f5f4a', '#3a6a8a', '#7a3a2a', '#5a4a3a', '#2a5a6a']);
    x.fillStyle = '#f4f0e6'; x.fillRect(px - 5, py - 5, ww + 10, hh + 10); const g = x.createLinearGradient(0, py, 0, py + hh); g.addColorStop(0, '#8a9cb0'); g.addColorStop(1, '#262e38'); x.fillStyle = g; x.fillRect(px, py, ww, hh);
    x.fillStyle = sh; x.fillRect(px - 5 - ww * 0.42, py - 2, ww * 0.42, hh + 4); x.fillRect(px + ww + 5, py - 2, ww * 0.42, hh + 4); x.fillStyle = 'rgba(0,0,0,0.2)'; for (let k = 0; k < 7; k++) { x.fillRect(px - 5 - ww * 0.42, py + k * hh / 7, ww * 0.42, 2); x.fillRect(px + ww + 5, py + k * hh / 7, ww * 0.42, 2); }
    if (R.f() < 0.35) { x.fillStyle = '#26282c'; x.fillRect(px - 12, py + hh - 2, ww + 24, 5); for (let k = 0; k <= 7; k++) x.fillRect(px - 12 + k * (ww + 24) / 7, py + hh - 22, 2, 20); x.fillRect(px - 12, py + hh - 24, ww + 24, 3); }
    const a = 0.25 + 0.74 * R.f(), col = R.pick([[255, 196, 120], [255, 214, 150], [255, 178, 96], [255, 226, 180]]); l.fillStyle = `rgba(${col.join(',')},${a})`; l.fillRect(px, py, ww, hh); }
  const alb = new THREE.CanvasTexture(ca); alb.encoding = THREE.sRGBEncoding; const lit = new THREE.CanvasTexture(cl); lit.encoding = THREE.sRGBEncoding;
  return { alb, lit };
}
function texTiles() {   // terracotta roof tiles: rows of curved tiles, moss and dark streaks
  return g3Tex((x, w) => { const R = RNG('tiles'); x.fillStyle = '#b8603e'; x.fillRect(0, 0, w, w);
    for (let r = 0; r < 24; r++) for (let q = 0; q < 16; q++) { const px = q * w / 16 + (r % 2 ? w / 32 : 0), py = r * w / 24, v = R.r(0.8, 1.1); const g = x.createLinearGradient(px, 0, px + w / 16, 0); g.addColorStop(0, `rgb(${150 * v},${70 * v},${44 * v})`); g.addColorStop(0.5, `rgb(${200 * v},${100 * v},${64 * v})`); g.addColorStop(1, `rgb(${140 * v},${64 * v},${40 * v})`); x.fillStyle = g; x.fillRect(px, py, w / 16 - 1, w / 24 - 2); }
    speck(x, w, w, 4000, ['rgba(60,70,30,0.2)', 'rgba(30,20,14,0.2)'], R, 1, 4); }, 512, 512);
}
// the storm's cloud deck: a seamless field of dark billows (luminance), scrolled in the sky shader
function texStorm() {
  const w = 512, R = RNG('storm'), nz = noise2(R);
  return g3Tex((x) => { const im = x.createImageData(w, w), d = im.data; for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) { let a = 0, s = 1, amp = 1; for (let k = 0; k < 5; k++) { a += nz(i / w * 4 * s, j / w * 4 * s) * amp; s *= 2; amp *= 0.5; } const v = Math.round(255 * clamp(a / 1.6)); const q = (j * w + i) * 4; d[q] = d[q + 1] = d[q + 2] = v; d[q + 3] = 255; }
    x.putImageData(im, 0, 0); }, w, w, false);
}
const texPuff = (key, n = 26, a = 0.35) => g3Tex((x, w) => { const R = RNG(key); for (let i = 0; i < n; i++) { const px = w / 2 + R.n(w * 0.2), py = w / 2 + R.n(w * 0.2), s = R.r(w * 0.12, w * 0.3); const g = x.createRadialGradient(px, py, 0, px, py, s); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); } });
function texCloud() { return g3Tex((x, w, h) => { const R = RNG('cloud'); for (let i = 0; i < 70; i++) { const px = w / 2 + R.n(w * 0.25), py = h * 0.62 + R.n(h * 0.12) - Math.max(0, 1 - Math.abs(px - w / 2) / (w * 0.35)) * R.r(0, h * 0.3), s = R.r(h * 0.08, h * 0.26);
  const g = x.createRadialGradient(px, py - s * 0.2, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.6, 'rgba(246,248,252,0.25)'); g.addColorStop(1, 'rgba(240,244,250,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
  const sh = x.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.65, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(70,90,120,0.35)'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = sh; x.fillRect(0, 0, w, h); }, 512, 256); }
