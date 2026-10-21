
// =====================================================================
//  SCENES — a floating POV above an avenue that runs south (-z) to a cable-stayed bridge over a river, a skyline on the far
//  bank. Helpers, textures, the city's layout, the clock of the time without humans, the eras, the camera.
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

// ---- the place
const GY = 0;                                   // the city's ground
const RIVER_Z0 = -270, RIVER_Z1 = -520;          // the river runs across the view (along x) between these z
const AVE_W = 26;                               // the avenue's width (x = -13..13), running from the camera to the bridge
const METRO_Z = -125, METRO_Y = 14;              // the elevated metro crosses the avenue
const CAMP = { x: 0, y: 96, z: 90 };
// ---- the clock: real time without humans for each second of the video (log-interpolated), and how it reads
const CLOCK = [[0, -1], [4, 0], [7, 600], [11, 2 * 3600], [17, 23 * 3600], [21, 3 * 86400], [26, 90 * 86400], [31, 365 * 86400], [36, 7 * 3.15e7], [42, 76 * 3.15e7], [45.2, 300 * 3.15e7], [48, 320 * 3.15e7], [54, 600 * 3.15e7], [59, 2400 * 3.15e7], [63, 45000 * 3.15e7], [66, 1e6 * 3.15e7]];
const CLOG = CLOCK.filter(([, v]) => v > 0).map(([a, v]) => [a, Math.log10(v)]);
const clockS = (t) => (t < 4 ? 0 : t < 7 ? 600 * (t - 4) / 3 : Math.pow(10, knots(CLOG, t)));
// ---- the eras (0..1)
const people = (t) => (t < 4 ? 1 : 0);
const night = (t) => ss(10.6, 11.8, t) * (1 - ss(16.2, 17.2, t));
const lightsOn = (t) => t < 11 ? 1 : 1 - ss(11.5, 16.5, t);
const grassK = (t) => ss(26, 36, t);
const treeK = (t) => ss(33, 45, t);
const rustK = (t) => ss(36, 44, t);
const snowK = (t) => ss(59, 60.2, t) * (1 - ss(62.4, 63.2, t));
const forestK = (t) => ss(53, 58, t);
const T_METRO = 43.0, T_BRIDGE = 45.2;
const TOWER_T0 = 48.0, TOWER_T1 = 54.0;
// the camera: a slow handheld float (always), no pans; the bridge's fall nudges it
function camPose(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c, hit = t >= T_BRIDGE ? Math.exp(-(t - T_BRIDGE) * 2.2) : 0;
  return {
    x: CAMP.x + n(0.23, 1, 0.9) + n(0.61, 2, 0.3) + hit * n(19, 0, 0.25),
    y: CAMP.y + n(0.31, 0.3, 0.6) + n(0.83, 1.7, 0.2) + hit * n(23, 2, 0.2),
    z: CAMP.z + n(0.17, 2.2, 0.8) + n(0.47, 0.6, 0.25),
    yaw: (n(0.19, 0.7, 0.9) + n(0.53, 2.1, 0.3) + hit * n(17, 3, 0.6)) * DEG,
    pitch: (-13 + n(0.27, 1.2, 0.6) + n(0.71, 0.4, 0.2) + hit * n(29, 1, 0.8)) * DEG,
    roll: (n(0.21, 2.1, 0.5) + n(0.67, 0.3, 0.15) + hit * n(21, 2, 0.6)) * DEG,
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
function texBrick() {
  const w = 1024, c = w / 8, R = RNG('nybrick'), mk = () => { const cv = document.createElement('canvas'); cv.width = cv.height = w; return cv; };
  const ca = mk(), cl = mk(), x = ca.getContext('2d'), l = cl.getContext('2d');
  x.fillStyle = '#b8aa9c'; x.fillRect(0, 0, w, w);
  for (let r = 0; r < 256; r++) { const y = r * 4; for (let k = 0; k < 64; k++) { const v = R.r(0.84, 1.08); x.fillStyle = `rgb(${190 * v},${178 * v},${166 * v})`; x.fillRect(k * 16 + (r % 2 ? 8 : 0), y, 15, 3); } }
  speck(x, w, w, 9000, ['rgba(60,40,30,0.12)', 'rgba(255,240,220,0.1)'], R, 1, 3);
  l.fillStyle = '#000'; l.fillRect(0, 0, w, w);
  const fire = new Set(); for (let q = 0; q < 8; q++) if (R.f() < 0.22) fire.add(q);
  for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) {
    const ww = c * 0.42, hh = c * 0.55, px = q * c + (c - ww) / 2, py = r * c + c * 0.2;
    x.fillStyle = '#eae4d8'; x.fillRect(px - 5, py - 9, ww + 10, 8); x.fillRect(px - 3, py + hh, ww + 6, 5);   // lintel + sill
    const g = x.createLinearGradient(0, py, 0, py + hh); g.addColorStop(0, '#9fb0c4'); g.addColorStop(0.4, '#4a5a6c'); g.addColorStop(1, '#232c36'); x.fillStyle = g; x.fillRect(px, py, ww, hh);
    x.fillStyle = '#d8d2c4'; x.fillRect(px + ww / 2 - 1.5, py, 3, hh); x.fillRect(px, py + hh * 0.48, ww, 3);
    const th = R.f(), a = 0.25 + 0.74 * th, warm = R.pick([[255, 196, 120], [255, 214, 150], [255, 178, 96], [255, 226, 180], [190, 210, 255]]), k = R.r(0.5, 1);
    if (R.f() < 0.72) { l.fillStyle = `rgba(${warm.map((v) => Math.round(v * k)).join(',')},${a})`; l.fillRect(px, py, ww, hh); if (R.f() < 0.4) { l.fillStyle = `rgba(${warm.map((v) => Math.round(v * k * 0.4)).join(',')},${a})`; l.fillRect(px, py, ww * 0.3, hh); } }
    if (fire.has(q)) { x.strokeStyle = 'rgba(20,20,22,0.9)'; x.lineWidth = 3; x.strokeRect(q * c + c * 0.12, py + hh - 4, c * 0.76, 8); x.beginPath(); x.moveTo(q * c + c * (r % 2 ? 0.2 : 0.8), py + hh + 4); x.lineTo(q * c + c * (r % 2 ? 0.8 : 0.2), py + hh + c * 0.98); x.stroke(); }
  }
  const alb = new THREE.CanvasTexture(ca); alb.encoding = THREE.sRGBEncoding; const lit = new THREE.CanvasTexture(cl); lit.encoding = THREE.sRGBEncoding;
  return { alb, lit };
}
// a glass tower's lit windows: matches texWindows' 8 x 32 cells; alpha = when it turns on
function texTowerLit(kind) {
  return g3Tex((x, w, h) => { const R = RNG('towerlit', kind), cols = 8, rows = 32, cw = w / cols, rh = h / rows; x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { if (R.f() > 0.42) continue; const a = 0.25 + 0.74 * R.f(), col = R.pick(['255,226,170', '255,240,210', '220,235,255', '255,210,150']);
      x.fillStyle = `rgba(${col},${a})`; if (kind === 0 || kind === 3) x.fillRect(c * cw + 1, r * rh + 1.5, cw - 2, rh - 3); else x.fillRect(c * cw + cw * 0.18, r * rh + rh * 0.22, cw * 0.64, rh * 0.56); } }, 256, 512);
}
function texRoof() {   // tar and gravel roof: patches, seams, stains
  return g3Tex((x, w) => { const R = RNG('tar'); x.fillStyle = '#6a6862'; x.fillRect(0, 0, w, w); speck(x, w, w, 30000, ['rgba(40,40,38,0.25)', 'rgba(200,196,186,0.18)', 'rgba(90,84,70,0.2)'], R, 1, 3);
    for (let k = 0; k < 14; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '40,38,34' : '150,146,136'},${R.r(0.08, 0.2)})`; x.fillRect(R.r(0, w), R.r(0, w), R.r(30, 160), R.r(20, 120)); }
    x.strokeStyle = 'rgba(30,30,28,0.35)'; x.lineWidth = 2; for (let k = 0; k < 8; k++) { x.beginPath(); x.moveTo(0, k * w / 8 + R.n(3)); x.lineTo(w, k * w / 8 + R.n(3)); x.stroke(); } }, 512, 512);
}
function texWindows(kind) {
  return g3Tex((x, w, h) => {
    const R = RNG('win', kind), cols = 8, rows = 32, cw = w / cols, rh = h / rows;
    const base = ['#5d7896', '#a7a8a6', '#c9b79a', '#2f3d4c'][kind], fr = ['#3e536b', '#8e8f8c', '#a8957a', '#1e2833'][kind];
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const sky = 1 - r / rows, refl = R.f();
      let col;
      if (kind === 0 || kind === 3) col = refl < 0.04 ? '#c9dcef' : refl < 0.16 ? '#86a6c8' : (kind === 0 ? `rgb(${60 + 50 * sky},${92 + 60 * sky},${128 + 60 * sky})` : `rgb(${40 + 40 * sky},${58 + 50 * sky},${80 + 50 * sky})`);
      else col = refl < 0.1 ? '#e8e4d6' : refl < 0.2 ? '#4a5560' : `rgb(${70 + 40 * sky},${86 + 46 * sky},${104 + 50 * sky})`;
      x.fillStyle = col;
      if (kind === 0 || kind === 3) x.fillRect(c * cw + 1, r * rh + 1.5, cw - 2, rh - 3);
      else x.fillRect(c * cw + cw * 0.18, r * rh + rh * 0.22, cw * 0.64, rh * 0.56);
    }
    x.fillStyle = fr; for (let r = 0; r < rows; r += 8) x.fillRect(0, r * rh, w, 2);
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,0.08)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.1)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  }, 256, 512);
}
const texPuff = (key, n = 26, a = 0.35) => g3Tex((x, w) => { const R = RNG(key); for (let i = 0; i < n; i++) { const px = w / 2 + R.n(w * 0.2), py = w / 2 + R.n(w * 0.2), s = R.r(w * 0.12, w * 0.3); const g = x.createRadialGradient(px, py, 0, px, py, s); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); } });
function texCloud() { return g3Tex((x, w, h) => { const R = RNG('cloud'); for (let i = 0; i < 70; i++) { const px = w / 2 + R.n(w * 0.25), py = h * 0.62 + R.n(h * 0.12) - Math.max(0, 1 - Math.abs(px - w / 2) / (w * 0.35)) * R.r(0, h * 0.3), s = R.r(h * 0.08, h * 0.26);
  const g = x.createRadialGradient(px, py - s * 0.2, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.6, 'rgba(246,248,252,0.25)'); g.addColorStop(1, 'rgba(240,244,250,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
  const sh = x.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.65, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(70,90,120,0.35)'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = sh; x.fillRect(0, 0, w, h); }, 512, 256); }
