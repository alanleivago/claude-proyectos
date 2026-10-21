// =====================================================================
//  SCENES — a floating POV from a lodge balcony over a turquoise Patagonian lake (it runs away from us, toward -z), golden
//  steppe, lenga woods, an estancia, granite spires and glaciers behind. Helpers, textures, the place, the clocks (how far
//  you can see, gravity's tilt, the risen edges), the eras, the camera (it leans with "down"). World in world.js, motion in run.js.
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

// ---- the place
const GY = 0, LAKE_Y = 0;
const LAKE = { x: 0, z: -1950, rx: 560, rz: 1800 };
const CAMP = { x: 0, y: 78, z: 170 };
const EST = { x: 420, z: -520 };                      // the estancia on the right shore
const inLake = (x, z) => ((x - LAKE.x) / LAKE.rx) ** 2 + ((z - LAKE.z) / LAKE.rz) ** 2 < 1;
// ---- the clocks
const VIEW = [[0, 14], [2, 14], [3, 90], [8, 420], [11, 900], [15, 2200], [18, 2400]];
const TILT = [[18, 0], [22, 9], [31, 9], [34, 52]];
const EDGE = [[44, 0], [47, 5], [51, 400], [55, 1500], [59.4, 4000]];
const viewKm = (t) => knots(VIEW, t), tiltDeg = (t) => knots(TILT, t), edgeKm = (t) => knots(EDGE, t);
// ---- the eras (0..1)
const flatK = (t) => ss(4, 15, t);                    // the horizon flattens: far ranges rise into view, the haze clears
const runK = (t) => ss(22, 25.5, t) * (1 - ss(43.8, 44.2, t));   // the lake piles toward the centre (left)
const rollK = (t) => (0.45 * ss(25, 31, t) + 0.55 * ss(31, 34, t)) * (1 - ss(43.8, 44.2, t));
const airK = (t) => ss(28, 33, t) * (1 - ss(43.8, 46, t));
const EDGE0 = 34.0, EDGE1 = 44.0;
const isEdge = (t) => t >= EDGE0 && t < EDGE1;
const bowlK = (t) => ss(46.6, 59.4, t);              // the rim curls up around us
const T_HERO = 59.4;
// the camera: a slow handheld float; it leans with "down" (the world appears to tilt); the wall's arrival shakes it
function camPose(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c, hit = t >= T_HERO ? 2.6 * Math.exp(-(t - T_HERO) * 1.2) + 0.9 * ss(T_HERO, T_HERO + 0.5, t) : 0, rise = ss(47, 59, t);
  const lean = t < 44 ? tiltDeg(t) * 0.55 : 0;
  return {
    x: CAMP.x + n(0.23, 1, 0.9) + n(0.61, 2, 0.3) + hit * n(19, 0, 0.6),
    y: CAMP.y + n(0.31, 0.3, 0.6) + n(0.83, 1.7, 0.2) + hit * n(23, 2, 0.5),
    z: CAMP.z + n(0.17, 2.2, 0.8) + n(0.47, 0.6, 0.25),
    yaw: (n(0.19, 0.7, 0.9) + n(0.53, 2.1, 0.3) + hit * n(17, 3, 1.4)) * DEG,
    pitch: (-6 + n(0.27, 1.2, 0.6) + n(0.71, 0.4, 0.2) + hit * n(29, 1, 1.6) + 12 * rise) * DEG,
    roll: (-lean + n(0.21, 2.1, 0.5) + n(0.67, 0.3, 0.15) + hit * (n(21, 2, 1.4) + n(3.1, 0.7, 2.5))) * DEG,
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

// ---- code-drawn textures
// rock strata for the rim of the world: bands of rust, ochre, umber, with streaks
function texStrata() {
  return g3Tex((x, w, h) => { const R = RNG('strata'); let y = 0; while (y < h) { const bh = R.r(6, 40); x.fillStyle = R.pick(['#8a4a26', '#a85e30', '#6a3a22', '#c07a40', '#7a5236', '#b0683a', '#5a3020']); x.fillRect(0, y, w, bh + 1); y += bh; }
    for (let k = 0; k < 900; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '255,210,150' : '30,16,8'},${R.r(0.05, 0.22)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(8, 60)); }
    speck(x, w, h, 12000, ['rgba(255,220,180,0.08)', 'rgba(20,10,6,0.12)'], R, 1, 3); }, 512, 1024);
}
const texPuff = (key, n = 26, a = 0.35) => g3Tex((x, w) => { const R = RNG(key); for (let i = 0; i < n; i++) { const px = w / 2 + R.n(w * 0.2), py = w / 2 + R.n(w * 0.2), s = R.r(w * 0.12, w * 0.3); const g = x.createRadialGradient(px, py, 0, px, py, s); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); } });
function texCloud() { return g3Tex((x, w, h) => { const R = RNG('cloud'); for (let i = 0; i < 70; i++) { const px = w / 2 + R.n(w * 0.25), py = h * 0.62 + R.n(h * 0.12) - Math.max(0, 1 - Math.abs(px - w / 2) / (w * 0.35)) * R.r(0, h * 0.3), s = R.r(h * 0.08, h * 0.26);
  const g = x.createRadialGradient(px, py - s * 0.2, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.6, 'rgba(246,248,252,0.25)'); g.addColorStop(1, 'rgba(240,244,250,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
  const sh = x.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.65, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(70,90,120,0.35)'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = sh; x.fillRect(0, 0, w, h); }, 512, 256); }
