// =====================================================================
//  SCENES — a floating POV from a balcony on a pine headland (the camera) over a bay: a fishing town on the far shore and
//  the right shore, hills of pines, the open sea to the left. Helpers, textures, the place, the clocks (population, year,
//  nearest tower), the eras, the camera (with the dive into the bay and back). World in world.js, motion in run.js.
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
const GY = 0, SEA_Y = 0;
const BAY = { x: -20, z: -400, rx: 175, rz: 330 };   // an ellipse of water; the open sea joins it on the left
const CAMP = { x: 0, y: 76, z: 132 };
const BOARD_P = { x: -12, y: 12, z: -48 };            // the DEATHS TODAY billboard, on the near shore below the headland
const HERO_P = { x: 6, z: 66 };                      // the tower that rises at the balcony
const inSea = (x, z) => { const e = ((x - BAY.x) / BAY.rx) ** 2 + ((z - BAY.z) / BAY.rz) ** 2; return e < 1 || (x < -800 && z < -360); };
// ---- the clocks
const POP = [[0, 8.2e9], [4, 8.2e9], [14, 9.5e9], [25, 11.5e9], [31, 13.1e9], [41, 15.5e9], [45, 18.0e9], [49, 20.0e9], [64, 26e9]];
const YEAR = [[0, 2025], [4, 2025], [14, 2035], [25, 2050], [31, 2062], [41, 2080], [45, 2100], [49, 2115], [64, 2160]];
const NEAR = [[49, 2200], [52, 1800], [56, 900], [58, 420], [59.8, 150]];
const popN = (t) => knots(POP, t), yearN = (t) => Math.round(knots(YEAR, t)), nearM = (t) => knots(NEAR, t);
// ---- the eras (0..1)
const deathsNow = (t) => (t < 1.3 ? 3 : t < 2.6 ? 2 : t < 4 ? 1 : 0);
const farmK = (t) => ss(17, 21, t);
const nightK = (t) => ss(24.2, 25.6, t) * (1 - ss(29.8, 30.6, t));
const polK = (t) => ss(25.8, 29, t);                  // light pollution: the stars fade
const UW0 = 30.9, UW1 = 41.0;                          // underwater
const isUW = (t) => t >= UW0 && t < UW1;
const duskK = (t) => ss(40.5, 41.5, t) * (1 - ss(47, 51, t));
const T_HERO = 60.4;
// the camera: a slow handheld float; it tips down into the bay (29.4-30.9), comes back up (41-42.6); the hero tower shoves it
function camPose(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c, hit = t >= T_HERO ? Math.exp(-(t - T_HERO) * 2.0) : 0;
  const dive = ss(29.3, 30.9, t) * (t < 35 ? 1 : 0), up = t >= 41 ? 1 - ss(41, 42.8, t) : 0, look = ss(T_HERO + 0.2, 63.2, t);
  return {
    x: CAMP.x + n(0.23, 1, 0.9) + n(0.61, 2, 0.3) + hit * n(19, 0, 0.35),
    y: CAMP.y + n(0.31, 0.3, 0.6) + n(0.83, 1.7, 0.2) + hit * n(23, 2, 0.3) - 8 * dive,
    z: CAMP.z + n(0.17, 2.2, 0.8) + n(0.47, 0.6, 0.25) + 3 * look,
    yaw: (n(0.19, 0.7, 0.9) + n(0.53, 2.1, 0.3) + hit * n(17, 3, 0.8)) * DEG,
    pitch: (-9 + n(0.27, 1.2, 0.6) + n(0.71, 0.4, 0.2) + hit * n(29, 1, 1.0) - 46 * dive - 30 * up + 36 * look) * DEG,
    roll: (n(0.21, 2.1, 0.5) + n(0.67, 0.3, 0.15) + hit * n(21, 2, 0.8)) * DEG,
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
// hotel / apartment facades: cream stucco, rows of balconies with railings, shutters, windows (8 x 8 cells of 3 m)
function texStucco() {
  return g3Tex((x, w) => { const R = RNG('stucco'), c = w / 8; x.fillStyle = '#efe6d6'; x.fillRect(0, 0, w, w); speck(x, w, w, 9000, ['rgba(120,100,80,0.07)', 'rgba(255,255,255,0.1)'], R, 1, 3);
    for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) { const px = q * c, py = r * c, ww = c * 0.5, hh = c * 0.62, wx = px + (c - ww) / 2, wy = py + c * 0.12;
      const g = x.createLinearGradient(0, wy, 0, wy + hh); g.addColorStop(0, '#8fb4cc'); g.addColorStop(0.5, '#3e5466'); g.addColorStop(1, '#22303a'); x.fillStyle = g; x.fillRect(wx, wy, ww, hh);
      if (R.f() < 0.6) { x.fillStyle = R.pick(['#3a7a8a', '#5a8a4a', '#2f5f8f', '#e8e0d0']); x.fillRect(wx - c * 0.1, wy, c * 0.1, hh); x.fillRect(wx + ww, wy, c * 0.1, hh); }
      x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(px + 4, py + c * 0.76, c - 8, c * 0.06); x.fillStyle = '#f8f4ec'; x.fillRect(px + 4, py + c * 0.74, c - 8, c * 0.04);
      x.strokeStyle = 'rgba(70,70,70,0.7)'; x.lineWidth = 1.5; for (let k = 0; k < 9; k++) { x.beginPath(); x.moveTo(px + 6 + k * (c - 12) / 8, py + c * 0.6); x.lineTo(px + 6 + k * (c - 12) / 8, py + c * 0.74); x.stroke(); }
      x.beginPath(); x.moveTo(px + 6, py + c * 0.6); x.lineTo(px + c - 6, py + c * 0.6); x.stroke();
      if (R.f() < 0.3) { x.fillStyle = R.pick(['#e05a3a', '#3a8ac8', '#f0c040', '#ffffff']); x.fillRect(px + c * 0.2, py + c * 0.58, c * 0.18, c * 0.1); } } }, 512, 512);
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
// curtain-wall glass: 8 columns x 32 floors per tile; mullions, spandrel bands, a sky reflection that drifts slowly over the face
function texGlass(kind) {
  return g3Tex((x, w, h) => { const R = RNG('glass', kind), cols = 8, rows = 32, cw = w / cols, rh = h / rows;
    const pal = [['#5f86ac', '#9cc0dc', '#2e4c68'], ['#7a8a96', '#b8c6d0', '#46525c'], ['#6a7c74', '#a8c0b4', '#34443e'], ['#3c5878', '#7aa0c4', '#1c2c40']][kind];
    x.fillStyle = pal[2]; x.fillRect(0, 0, w, h);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const u = (c + 0.5) / cols, v = r / rows, refl = 0.5 + 0.5 * Math.sin(u * 2.4 + v * 5.0 + kind) * Math.sin(v * 3.1 - u * 1.3);
      const g = x.createLinearGradient(c * cw, r * rh, c * cw + cw, r * rh + rh); g.addColorStop(0, lin(pal[0]).lerp(lin(pal[1]), refl * 0.8).getStyle()); g.addColorStop(1, lin(pal[0]).lerp(lin(pal[2]), 0.35 + 0.2 * R.f()).getStyle());
      x.fillStyle = g; x.fillRect(c * cw + 2, r * rh + 2, cw - 4, rh - 5); if (R.f() < 0.05) { x.fillStyle = 'rgba(230,240,248,0.45)'; x.fillRect(c * cw + 2, r * rh + 2, cw - 4, rh - 5); } }
    x.fillStyle = 'rgba(210,216,222,0.9)'; for (let c = 0; c <= cols; c++) x.fillRect(c * cw - 1.5, 0, 3, h); for (let r = 0; r <= rows; r++) x.fillRect(0, r * rh - 2, w, 4);
    x.fillStyle = 'rgba(40,46,54,0.5)'; for (let r = 0; r < rows; r += 8) x.fillRect(0, r * rh, w, rh * 0.3); }, 512, 1024);
}
const texPuff = (key, n = 26, a = 0.35) => g3Tex((x, w) => { const R = RNG(key); for (let i = 0; i < n; i++) { const px = w / 2 + R.n(w * 0.2), py = w / 2 + R.n(w * 0.2), s = R.r(w * 0.12, w * 0.3); const g = x.createRadialGradient(px, py, 0, px, py, s); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); } });
function texCloud() { return g3Tex((x, w, h) => { const R = RNG('cloud'); for (let i = 0; i < 70; i++) { const px = w / 2 + R.n(w * 0.25), py = h * 0.62 + R.n(h * 0.12) - Math.max(0, 1 - Math.abs(px - w / 2) / (w * 0.35)) * R.r(0, h * 0.3), s = R.r(h * 0.08, h * 0.26);
  const g = x.createRadialGradient(px, py - s * 0.2, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.6, 'rgba(246,248,252,0.25)'); g.addColorStop(1, 'rgba(240,244,250,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
  const sh = x.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.65, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(70,90,120,0.35)'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = sh; x.fillRect(0, 0, w, h); }, 512, 256); }
