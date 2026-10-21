
// =====================================================================
//  SCENES — a rooftop terrace over a wooden fjord town at dusk (metres; the camera looks up the fjord, -z). Helpers,
//  textures (wooden facades with lit windows, Saturn's bands, its rings), the fjord's geography, the story's numbers,
//  the camera. World in world.js, motion in run.js. Everything is a pure function of TT + seeded RNG.
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

// ---- the place: a fjord running away from us (-z), 1.4 km wide, between rock walls rising to ~1 km; snow on top
const SHORE = -95;                                   // the near shore; our terrace is on a roof up the slope behind it
const fjordX = (z) => 120 * Math.sin(z * 0.00022 + 0.4);     // the fjord's centre line wanders
const halfW = (z) => 260 + 180 * ss(-1500, -9000, z);
const landH = (z) => 3 + Math.max(0, z - SHORE) * 0.3;
// ground height: the fjord's floor, a narrow shelf along each side (the villages), then the rock walls to ~1 km; our slope
function terrH(x, z) {
  const dx = Math.abs(x - fjordX(z)) - halfW(z), bottom = -38 * (1 - ss(-200, 0, dx));
  const wall = dx < 90 ? dx * 0.14 : 12.6 + 950 * Math.pow((dx - 90) / 280, 0.72), ridge = (180 * Math.sin(x * 0.0021 + z * 0.0011) * Math.sin(z * 0.0017 - x * 0.0007) + 90 * Math.abs(Math.sin(x * 0.006 + z * 0.0045)) + 40 * Math.sin(x * 0.02 + z * 0.017)) * ss(90, 450, dx);
  const fl = dx > 0 ? wall + ridge : bottom, k = ss(SHORE - 40, SHORE, z);
  return Math.max(fl, bottom + (landH(z) - bottom) * k);
}
const BED_GLSL = `
  float fjordX(float z){ return 120.0 * sin(z * 0.00022 + 0.4); }
  float halfW(float z){ return 260.0 + 180.0 * smoothstep(-1500.0, -9000.0, z); }
  float bedH(vec2 p){ float dx = abs(p.x - fjordX(p.y)) - halfW(p.y), bottom = -38.0 * (1.0 - smoothstep(-200.0, 0.0, dx));
    float fl = dx > 0.0 ? dx * 0.14 : bottom, land = 3.0 + max(0.0, p.y + 95.0) * 0.3, k = smoothstep(-135.0, -95.0, p.y);
    return max(fl, bottom + (land - bottom) * k); }`;
const CAMZ = 10, EYE = landH(10) + 36;                // a handheld float ~36 m above the rooftops on the slope, ~70 m above the water
const SUN_DIR = dirV(-120 * DEG, -3 * DEG);           // the sun has just set, behind us and to the left
const SUNP = dirV(-150 * DEG, 18 * DEG);              // where sunlight comes from for Saturn (it shows a crescent of shade)

// ---- the story's numbers
// distance to Saturn's cloud tops (miles): log-interpolated
const MILES = [[0, 746e6], [5, 520e6], [9, 90e6], [14, 9e6], [18, 2.6e6], [22, 1.1e6], [30, 1.4e5], [38, 4.5e4], [46, 6.7e3], [53, 1.5e3], [59, 120], [60.2, 1]];
const MLOG = MILES.map(([a, b]) => [a, Math.log10(b)]);
const milesAt = (t) => (t >= 60.2 ? 0 : Math.pow(10, knots(MLOG, t)));
// Saturn's angular radius (deg) and where it sits; it rises as it nears
const SAT_R = [[0, 0.02], [5, 0.03], [9, 0.25], [14, 2.2], [18, 5.5], [22, 9.0], [30, 16], [38, 24], [46, 34], [53, 52], [57, 75], [60.2, 120]];
const satR = (t) => knots(SAT_R, t) * DEG;
const satDir = (t) => dirV(knots([[0, 9], [30, 6], [60, 2]], t) * DEG, knots([[0, 16], [14, 19], [30, 26], [46, 34], [53, 42], [60, 55]], t) * DEG);
const RING_TILT = 22 * DEG;
// the fjord's water: it drains, then a surge floods the shore (m)
const seaLevel = (t) => -9 * EZ.io(seg(t, 21.5, 25.5)) + 21 * EZ.io(seg(t, 25.5, 32)) + 2 * ss(46, 58, t);
// the ice rain from the rings (30-46+)
const iceRate = (t) => ss(30, 34, t) * (1 - 0.5 * ss(50, 56, t));
// how hard the ground shakes
const shake = (t) => 0.06 * ss(22, 26, t) + 0.25 * ss(36, 42, t) + 0.9 * ss(46, 50, t) + 0.6 * ss(55, 59.5, t);
const T_HIT = 60.2;
// the camera: on the terrace, a slow handheld float; it lifts its eyes to Saturn as it grows
function camPose(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c, k = shake(t);
  const look = knots([[0, -13], [5, -12], [14, -6], [22, -3], [26, -9], [32, -4], [38, 3], [46, 4], [52, -2], [55.5, 0], [58, 10], [60.2, 28]], t);
  const yaw = knots([[0, 2], [14, 4], [22, 2], [30, 4], [46, 3], [60, 2]], t);
  return {
    x: n(0.31, 1, 0.03) + k * (n(17, 0, 0.12) + n(29, 1, 0.08)),
    y: EYE + n(0.43, 0.3, 0.025) + k * (n(23, 2, 0.1) + n(11, 4, 0.06)),
    z: CAMZ + n(0.19, 2.2, 0.03) + k * n(13, 3, 0.06),
    yaw: (yaw + n(0.21, 0.7, 0.3) + n(0.57, 2.1, 0.12) + k * (n(19, 3, 1.0) + n(37, 1, 0.5))) * DEG,
    pitch: (look + n(0.33, 1.2, 0.2) + n(0.81, 0.4, 0.08) + k * (n(31, 1, 1.2) + n(53, 3, 0.5))) * DEG,
    roll: (n(0.27, 2.1, 0.2) + k * (n(21, 2, 1.4) + n(41, 5, 0.6))) * DEG,
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
// a painted wooden facade, 24 m x 24 m = 8 bays x 8 floors: vertical boards (luminance, tinted per house), white window frames,
// lace curtains; plus its lit sheet (alpha = when that window turns on, 0.25-1)
function texWood() {
  const w = 1024, c = w / 8, R = RNG('woodfac'), mk = () => { const cv = document.createElement('canvas'); cv.width = cv.height = w; return cv; };
  const ca = mk(), cl = mk(), x = ca.getContext('2d'), l = cl.getContext('2d');
  for (let i = 0; i < 128; i++) { const v = R.r(0.86, 1.04); x.fillStyle = `rgb(${226 * v},${222 * v},${214 * v})`; x.fillRect(i * 8, 0, 8, w); x.fillStyle = 'rgba(0,0,0,0.22)'; x.fillRect(i * 8 + 7, 0, 1, w); x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(i * 8, 0, 1, w); }
  speck(x, w, w, 9000, ['rgba(60,40,24,0.06)', 'rgba(255,255,255,0.08)'], R, 1, 3);
  l.fillStyle = '#000'; l.fillRect(0, 0, w, w);
  for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) { if (R.f() < 0.25) continue; const ww = c * 0.36, hh = c * 0.5, px = q * c + (c - ww) / 2, py = r * c + c * 0.24;
    x.fillStyle = '#fbf8f2'; x.fillRect(px - 7, py - 7, ww + 14, hh + 14); x.fillRect(px - 10, py + hh + 4, ww + 20, 6);
    const g = x.createLinearGradient(0, py, 0, py + hh); g.addColorStop(0, '#8aa0b8'); g.addColorStop(1, '#2a3440'); x.fillStyle = g; x.fillRect(px, py, ww, hh);
    x.fillStyle = 'rgba(250,246,238,0.6)'; x.fillRect(px, py, ww, hh * 0.22); x.fillStyle = '#fbf8f2'; x.fillRect(px + ww / 2 - 2, py, 4, hh); x.fillRect(px, py + hh * 0.5, ww, 3);
    const th = R.f(), a = 0.25 + 0.74 * th, col = R.pick([[255, 196, 120], [255, 214, 150], [255, 178, 96], [255, 226, 180]]);
    l.fillStyle = `rgba(${col.join(',')},${a})`; l.fillRect(px, py, ww, hh); l.fillStyle = `rgba(${col.map((v) => v * 0.5).join(',')},${a})`; l.fillRect(px, py, ww, hh * 0.22); }
  const alb = new THREE.CanvasTexture(ca); alb.encoding = THREE.sRGBEncoding; const lit = new THREE.CanvasTexture(cl); lit.encoding = THREE.sRGBEncoding;
  return { alb, lit };
}
// Saturn's bands: pale butterscotch zones and tan belts with soft turbulent edges, a darker blue-grey north pole, the polar hexagon hint
function texSaturn() {
  const w = 2048, h = 1024, R = RNG('saturnTex'), nz = noise2(R);
  const BANDS = [[0, '#6a7480'], [0.06, '#8a8a80'], [0.12, '#b8a888'], [0.2, '#d8c8a4'], [0.27, '#c8b088'], [0.33, '#e4d4b0'], [0.38, '#c8a878'], [0.43, '#e8dcbc'], [0.47, '#d4bc90'],
    [0.5, '#ece2c4'], [0.54, '#dcc69c'], [0.58, '#c8a87a'], [0.63, '#e2d0aa'], [0.7, '#c4a47c'], [0.76, '#d8c6a0'], [0.84, '#b8a080'], [0.92, '#9a8e7a'], [1, '#86827a']];
  const t = g3Tex((x) => { const im = x.createImageData(w, h), d = im.data, cs = BANDS.map(([o, c]) => [o, lin(c)]);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const u = i / w, v = j / h; let a = 0, s = 1; for (let k = 0; k < 4; k++) { a += nz(u * 6 * s, v * 3 * s) / s; s *= 2; }
      const vv = clamp(v + (a / 1.9 - 0.5) * 0.012 + 0.004 * Math.sin(u * TAU * 18 + v * 80)); let k = 0; while (k < cs.length - 2 && vv > cs[k + 1][0]) k++;
      const f = ss(0.1, 1, (vv - cs[k][0]) / (cs[k + 1][0] - cs[k][0])), c = cs[k][1].clone().lerp(cs[k + 1][1], f), q = (j * w + i) * 4, gr = 0.94 + 0.06 * Math.sin(u * TAU * 40 + v * 200) * Math.sin(v * 300);
      d[q] = c.r * 255 * gr; d[q + 1] = c.g * 255 * gr; d[q + 2] = c.b * 255 * gr; d[q + 3] = 255; }
    x.putImageData(im, 0, 0);
    for (let k = 0; k < 40; k++) { const px = R.r(0, w), py = h * R.pick([0.27, 0.38, 0.58, 0.7]) + R.n(6); x.fillStyle = `rgba(250,244,226,${R.r(0.12, 0.3)})`; x.beginPath(); x.ellipse(px, py, R.r(10, 30), R.r(3, 6), 0, 0, TAU); x.fill(); } }, w, h);
  t.wrapS = THREE.RepeatWrapping; return t;
}
// the rings across their width (u: inner C ring -> outer A ring and the F ring): ringlets, the Cassini Division, the Encke gap;
// RGB = colour, A = opacity
function texRings() {
  return g3Tex((x, w) => { const R = RNG('ringsTex'); x.clearRect(0, 0, w, 4);
    for (let i = 0; i < w; i++) { const u = i / w; let a, c;
      if (u < 0.17) { a = 0.12 + 0.1 * Math.sin(u * 400); c = [150, 140, 128]; }                                  // C ring: faint, grey
      else if (u < 0.5) { a = 0.75 + 0.2 * Math.sin(u * 900) * Math.sin(u * 77); c = [226, 210, 180]; }             // B ring: bright, dense
      else if (u < 0.56) { a = 0.06; c = [120, 110, 100]; }                                                        // the Cassini Division
      else if (u < 0.86) { a = 0.55 + 0.15 * Math.sin(u * 700); c = [200, 186, 160]; if (u > 0.79 && u < 0.8) a = 0.05; }   // A ring with the Encke gap
      else if (u < 0.93) { a = 0; c = [0, 0, 0]; } else if (u < 0.935) { a = 0.5; c = [220, 210, 196]; } else { a = 0; c = [0, 0, 0]; }   // the F ring
      a *= 0.9 + 0.1 * R.f(); x.fillStyle = `rgba(${c.join(',')},${clamp(a)})`; x.fillRect(i, 0, 1, 4); } }, 2048, 4);
}
function texSnowRock() {   // rock with snow lying on the flats: grey striations, cracks, white drifts (luminance)
  return g3Tex((x, w) => { const R = RNG('rock'); x.fillStyle = '#8a8680'; x.fillRect(0, 0, w, w);
    for (let k = 0; k < 400; k++) { x.strokeStyle = `rgba(${R.f() < 0.5 ? '50,48,46' : '170,166,160'},${R.r(0.08, 0.25)})`; x.lineWidth = R.r(1, 4); const px = R.r(0, w), py = R.r(0, w); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(20), py + R.r(20, 120)); x.stroke(); }
    speck(x, w, w, 20000, ['rgba(40,38,36,0.2)', 'rgba(230,230,230,0.15)'], R, 1, 3); }, 512, 512);
}
const texPuff = (key, n = 26, a = 0.35) => g3Tex((x, w) => { const R = RNG(key); for (let i = 0; i < n; i++) { const px = w / 2 + R.n(w * 0.2), py = w / 2 + R.n(w * 0.2), s = R.r(w * 0.12, w * 0.3); const g = x.createRadialGradient(px, py, 0, px, py, s); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); } });
function texCloud() { return g3Tex((x, w, h) => { const R = RNG('cloud'); for (let i = 0; i < 70; i++) { const px = w / 2 + R.n(w * 0.25), py = h * 0.62 + R.n(h * 0.12) - Math.max(0, 1 - Math.abs(px - w / 2) / (w * 0.35)) * R.r(0, h * 0.3), s = R.r(h * 0.08, h * 0.26);
  const g = x.createRadialGradient(px, py - s * 0.2, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.6, 'rgba(246,248,252,0.25)'); g.addColorStop(1, 'rgba(240,244,250,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
  const sh = x.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.65, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(70,90,120,0.35)'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = sh; x.fillRect(0, 0, w, h); }, 512, 256); }
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
