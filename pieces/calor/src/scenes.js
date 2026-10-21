// =====================================================================
//  SCENES — a floating POV along a beach at golden hour: the sea on the left (x < SHORE_X), the sand, the boardwalk, the
//  coastal road, a gas station, a fair (Ferris wheel, carousel, a circus tent, stalls), hotels and pine hills on the right,
//  a steel pier, a port with gantry cranes far ahead. Helpers, textures, the place, the temperature, the eras, the camera.
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

// ---- the place (the coast runs along z; the camera looks down it, toward -z)
const GY = 0, SEA_Y = -1.2;
const SHORE_X = 0;                             // sea for x < SHORE_X
const BOARD_X0 = 25, BOARD_X1 = 33;              // the wooden boardwalk
const ROAD_X0 = 35, ROAD_X1 = 50;                // the coastal road (two lanes)
const PIER_Z = -480;                             // the steel pier, out into the sea
const PORT_Z0 = -760, PORT_Z1 = -1060, QUAY_X = -150;   // the port's quay (its edge faces the open sea at x = QUAY_X)
const WHEEL_P = { x: 86, z: -250 };
const STATION_P = { x: 66, z: -110 };
const KIOSK_P = { x: 29, z: 30 };
const CAMP = { x: 16, y: 30, z: 105 };
// ---- the temperature: 24 °C, then +10 °C every second from 4 s
const tempC = (t) => 24 + 10 * Math.max(0, t - 4);
const tAt = (c) => 4 + (c - 24) / 10;            // when the air reaches c °C
// ---- the eras (0..1)
const fleeK = (t) => ss(4.2, 7.5, t);
const softK = (t) => ss(6.6, 10, t);             // ~50 °C: asphalt softens
const T_BURST = 10.0, T_BOIL = tAt(100), T_MELT = tAt(130), T_POP = tAt(180), T_PAPER = tAt(233), T_FUEL = 27.0, T_STATION = 29.6, T_WOOD = tAt(300);
const T_VENUS = tAt(464), T_DRAPER = tAt(525), T_STEEL = tAt(550);
const boilK = (t) => ss(T_BOIL, T_BOIL + 5, t);
const meltK = (t) => ss(T_MELT, T_MELT + 2.4, t);
const cloudK = (t) => ss(15.5, 20.5, t) * (1 - 0.6 * ss(30, 40, t));
const virgaK = (t) => ss(17.5, 18.8, t) * (1 - ss(23, 25, t));
const dryK = (t) => ss(7, 24, t);
const charK = (t) => ss(T_WOOD + 1, 47, t);
const smokeK = (t) => ss(T_PAPER, 40, t) * (1 - 0.5 * ss(50, 60, t));
const glowK = (t) => ss(T_DRAPER - 2, 64, t);
const steelK = (t) => ss(T_STEEL, T_STEEL + 2.2, t);
// the camera: a slow handheld float (always), no pans; the gas station and the steel nudge it
function camPose(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c, hit = (t >= T_STEEL ? Math.exp(-(t - T_STEEL) * 2.0) : 0) + (t >= T_STATION ? 0.45 * Math.exp(-(t - T_STATION) * 3) : 0);
  return {
    x: CAMP.x + n(0.23, 1, 0.9) + n(0.61, 2, 0.3) + hit * n(19, 0, 0.25),
    y: CAMP.y + n(0.31, 0.3, 0.6) + n(0.83, 1.7, 0.2) + hit * n(23, 2, 0.2),
    z: CAMP.z + n(0.17, 2.2, 0.8) + n(0.47, 0.6, 0.25),
    yaw: (2.5 + n(0.19, 0.7, 0.9) + n(0.53, 2.1, 0.3) + hit * n(17, 3, 0.6)) * DEG,
    pitch: (-9 + n(0.27, 1.2, 0.6) + n(0.71, 0.4, 0.2) + hit * n(29, 1, 0.8)) * DEG,
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
// stripes for awnings, the circus tent, the carousel roof, umbrellas
const texStripes = (a, b, n = 8, vertical = true) => g3Tex((x, w, h) => { for (let k = 0; k < n; k++) { x.fillStyle = k % 2 ? b : a; if (vertical) x.fillRect(k * w / n, 0, w / n + 1, h); else x.fillRect(0, k * h / n, w, h / n + 1); } speck(x, w, h, 600, ['rgba(0,0,0,0.05)', 'rgba(255,255,255,0.06)'], RNG('str' + a + b), 1, 2); }, 128, 128);
// a flame: a teardrop with a white-yellow core, orange body, red rim (additive)
const texFlame = () => g3Tex((x, w, h) => { for (let k = 0; k < 5; k++) { const s = 1 - k * 0.17, g = x.createRadialGradient(w / 2, h * 0.72, 0, w / 2, h * 0.72, w * 0.46 * s); g.addColorStop(0, `rgba(255,${240 - k * 30},${190 - k * 40},${0.5})`); g.addColorStop(0.45, `rgba(255,${150 - k * 20},40,0.32)`); g.addColorStop(1, 'rgba(200,40,10,0)'); x.save(); x.translate(w / 2, h * 0.72); x.scale(1, 1.6 + k * 0.25); x.translate(-w / 2, -h * 0.72); x.fillStyle = g; x.fillRect(0, 0, w, h); x.restore(); } }, 64, 128);
const texVirga = () => g3Tex((x, w, h) => { const R = RNG('virga'); for (let k = 0; k < 60; k++) { const px = R.r(w * 0.1, w * 0.9), g = x.createLinearGradient(0, 0, 0, h * R.r(0.4, 0.9)); g.addColorStop(0, 'rgba(130,134,144,0.3)'); g.addColorStop(1, 'rgba(130,134,144,0)'); x.fillStyle = g; x.fillRect(px, 0, R.r(1, 3), h); }
  x.globalCompositeOperation = 'destination-in'; const m = x.createLinearGradient(0, 0, w, 0); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(0.3, 'rgba(0,0,0,1)'); m.addColorStop(0.7, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = m; x.fillRect(0, 0, w, h); }, 128, 256);
const texPuff = (key, n = 26, a = 0.35) => g3Tex((x, w) => { const R = RNG(key); for (let i = 0; i < n; i++) { const px = w / 2 + R.n(w * 0.2), py = w / 2 + R.n(w * 0.2), s = R.r(w * 0.12, w * 0.3); const g = x.createRadialGradient(px, py, 0, px, py, s); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); } });
function texCloud() { return g3Tex((x, w, h) => { const R = RNG('cloud'); for (let i = 0; i < 70; i++) { const px = w / 2 + R.n(w * 0.25), py = h * 0.62 + R.n(h * 0.12) - Math.max(0, 1 - Math.abs(px - w / 2) / (w * 0.35)) * R.r(0, h * 0.3), s = R.r(h * 0.08, h * 0.26);
  const g = x.createRadialGradient(px, py - s * 0.2, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.6, 'rgba(246,248,252,0.25)'); g.addColorStop(1, 'rgba(240,244,250,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
  const sh = x.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.65, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(70,90,120,0.35)'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = sh; x.fillRect(0, 0, w, h); }, 512, 256); }
