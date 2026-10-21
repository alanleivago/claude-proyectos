
// =====================================================================
//  SCENES — a balcony over the seafront of a port city on the hills (metres; the camera faces the sea, -z; +x is to the right,
//  where the coast curves out into the port and the hills). Helpers, textures, the coast's geography, the magnitude, the camera.
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
// a held curve: linear segments with smooth ends (for camera pans that settle)
const pan = (K, t) => { if (t <= K[0][0]) return K[0][1]; if (t >= K[K.length - 1][0]) return K[K.length - 1][1]; let i = 0; while (t > K[i + 1][0]) i++; const [a, va] = K[i], [b, vb] = K[i + 1]; return va + (vb - va) * ss(a, b, t); };

// ---- the place
const LAND_Y = 1.5, BALC = 24.0, EYE = BALC + 1.62, CAMZ = -1.35, CAMX = 26.5;   // a corner balcony, by the cross street
const SUN_DIR = dirV(-62 * DEG, 22 * DEG);   // afternoon sun over the sea to the left, lighting the facades that face the camera
// the coastline: straight in front of us, curving out to sea on the right into the port, a little on the far left
const shoreZ = (x) => -72 - 0.62 * Math.max(0, x - 150) - 0.3 * Math.max(0, -600 - x);
// hills: behind the port on the right and behind the whole city
const hillH = (x, z) => 150 * ss(170, 760, x) * ss(-60, 240, z - shoreZ(x)) * (0.85 + 0.15 * Math.sin(x * 0.006 + z * 0.004)) + 90 * ss(140, 520, z) + 6 * Math.sin(x * 0.02) * Math.sin(z * 0.017) * ss(170, 400, x);
// ground height: land above the shore, a 20 m beach, then the sea floor shelving away
function terrH(x, z) { const d = shoreZ(x) - z; if (d <= 0) return LAND_Y + hillH(x, z) * ss(0, 30, -d); return LAND_Y - 0.075 * d - 12 * ss(30, 700, d) + 0.4 * Math.sin(x * 0.03 + z * 0.02); }
const BED_GLSL = `
  float shoreZ(float x){ return -72.0 - 0.62 * max(0.0, x - 150.0) - 0.3 * max(0.0, -600.0 - x); }
  float bedH(vec2 p){ float d = shoreZ(p.x) - p.y; if (d <= 0.0) return 1.5; return 1.5 - 0.075 * d - 12.0 * smoothstep(30.0, 700.0, d) + 0.4 * sin(p.x * 0.03 + p.y * 0.02); }`;

// the seafront follows the coast: the avenue's centre line runs straight in front of us, then bends out with the shore
// towards the port; offsets o are measured across it (positive = inland)
const spw = (u, w) => w * Math.log(1 + Math.exp(u / w)), sgm = (u) => 1 / (1 + Math.exp(-u));
const avZ = (x) => -13 - 0.62 * spw(x - 150, 50), avDZ = (x) => -0.62 * sgm((x - 150) / 50);
const avPt = (x, o) => { const d = avDZ(x), n = Math.hypot(1, d); return [x - d * o / n, avZ(x) + o / n]; };
// ---- the story's numbers
const MAG = [[0, 0], [10, 0], [10.25, 6.1], [14, 6.6], [19, 7.6], [25, 8.6], [31, 9.3], [33.5, 9.5], [70, 9.5]];
const magAt = (t) => knots(MAG, t);
// how hard the ground moves (0..1): a jolt at 10, building to the peak (25-42), fading out by 47
const shake = (t) => t < 10 ? 0 : 0.55 * Math.exp(-(t - 10) * 2.5) + 0.22 * ss(10, 14, t) + 0.78 * ss(14, 27, t) * (1 - ss(41, 47, t));
const seaLevel = (t) => -7.5 * EZ.io(seg(t, 49.5, 55.5));
const WZ = [[54, -2600], [56, -1850], [58, -950], [59.5, -360], [60.3, -90], [60.8, -2]];
const waveZ = (t) => knots(WZ, t), WAVE_H = 25, T_HIT = 60.8;
// the camera: on the balcony; pans from the bay to the street and the building across, back down to the seafront tearing,
// across to the facade falling, up to the hills, and back to the sea for the drain and the wave
const YAW = [[0, 6], [5, 6], [7.8, -78], [24, -82], [26.8, 0], [30.4, 2], [32.8, -126], [37.2, -122], [40.2, -62], [45, -55], [48, -10], [50.2, 4], [60.8, 3]];
const PITCH = [[0, -24], [5, -24], [7.8, -21], [24, -20], [26.8, -30], [30.4, -29], [32.8, -14], [37.2, -13], [40.2, -9], [45, -12], [48, -20], [50.2, -16], [56, -10], [59.6, 0], [60.8, 8]];
function camPose(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c, sh = shake(t) * 1.0, hit = t > 59.5 ? 0.6 * ss(59.5, 60.8, t) : 0, k = sh + hit;
  return {
    x: CAMX + n(0.31, 1, 0.025) + k * (n(17, 0, 0.09) + n(29, 1, 0.06) + n(7.3, 2, 0.05)),
    y: EYE + n(0.43, 0.3, 0.02) + k * (n(23, 2, 0.07) + n(11, 4, 0.05)),
    z: CAMZ + n(0.19, 2.2, 0.02) + k * n(13, 3, 0.06),
    yaw: (pan(YAW, t) + n(0.21, 0.7, 0.3) + n(0.57, 2.1, 0.12) + k * (n(19, 3, 0.9) + n(37, 1, 0.5))) * DEG,
    pitch: (pan(PITCH, t) + n(0.33, 1.2, 0.2) + n(0.81, 0.4, 0.08) + k * (n(31, 1, 1.1) + n(53, 3, 0.5))) * DEG,
    roll: (n(0.27, 2.1, 0.2) + k * (n(21, 2, 1.3) + n(41, 5, 0.6))) * DEG,
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
// a seafront plaster facade, 24 m x 24 m = 8 bays x 8 floors: plaster (luminance, tinted per building), cornices, tall windows
// with painted shutters and white frames, iron balconies; plus its mask (white = tint with the building colour, black = keep)
function texPlaster() {
  const w = 1024, c = w / 8, R = RNG('plaster'), mk = () => { const cv = document.createElement('canvas'); cv.width = cv.height = w; return cv; };
  const ca = mk(), cm = mk(), x = ca.getContext('2d'), m = cm.getContext('2d');
  x.fillStyle = '#e4dccf'; x.fillRect(0, 0, w, w); m.fillStyle = '#fff'; m.fillRect(0, 0, w, w); m.fillStyle = '#000';
  speck(x, w, w, 16000, ['rgba(90,70,50,0.07)', 'rgba(255,255,255,0.12)', 'rgba(60,50,40,0.05)'], R, 1, 4);
  for (let k = 0; k < 40; k++) { const g = x.createLinearGradient(0, 0, 0, w); const px = R.r(0, w); g.addColorStop(0, 'rgba(70,60,50,0)'); g.addColorStop(1, `rgba(70,60,50,${R.r(0.04, 0.12)})`); x.fillStyle = g; x.fillRect(px, R.r(0, w), R.r(3, 14), R.r(60, 300)); }
  for (let r = 0; r < 8; r++) { x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(0, r * c, w, 5); x.fillStyle = 'rgba(40,30,20,0.25)'; x.fillRect(0, r * c + 5, w, 3); }
  const both = (fn) => { fn(x); fn(m); };
  for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) {
    const ww = c * 0.38, hh = c * 0.6, px = q * c + (c - ww) / 2, py = r * c + c * 0.22, sh = R.pick(['#2f5f8a', '#3a7a5a', '#8a3a2a', '#e8e2d2', '#5a4a3a', '#2a6a7a']);
    x.fillStyle = '#f2eee4'; both((z) => z.fillRect(px - 6, py - 6, ww + 12, hh + 12));
    const g = x.createLinearGradient(0, py, 0, py + hh); g.addColorStop(0, '#a9c4dc'); g.addColorStop(0.4, '#5a7590'); g.addColorStop(1, '#2a3440'); x.fillStyle = g; x.fillRect(px, py, ww, hh);
    x.fillStyle = 'rgba(255,240,220,0.35)'; x.fillRect(px + 3, py + 3, ww * 0.35, hh * 0.25);
    x.fillStyle = '#f2eee4'; x.fillRect(px + ww / 2 - 2, py, 4, hh);
    if (R.f() < 0.55) { x.fillStyle = sh; both((z) => { z.fillRect(px - 6 - ww * 0.42, py - 2, ww * 0.42, hh + 4); z.fillRect(px + ww + 6, py - 2, ww * 0.42, hh + 4); });
      x.fillStyle = 'rgba(0,0,0,0.18)'; for (let k = 0; k < 8; k++) { x.fillRect(px - 6 - ww * 0.42, py + k * hh / 8, ww * 0.42, 2); x.fillRect(px + ww + 6, py + k * hh / 8, ww * 0.42, 2); } }
    if (r % 2 === 0 && R.f() < 0.7) { x.fillStyle = '#26282c'; both((z) => { z.fillRect(px - 14, py + hh - 4, ww + 28, 6); for (let k = 0; k <= 8; k++) z.fillRect(px - 14 + k * (ww + 28) / 8, py + hh - 26, 2, 24); z.fillRect(px - 14, py + hh - 28, ww + 28, 3); }); }
  }
  const alb = new THREE.CanvasTexture(ca); alb.encoding = THREE.sRGBEncoding; const mask = new THREE.CanvasTexture(cm);
  return { alb, mask };
}
function texPromenade() {   // a wavy two-tone mosaic (like a seaside promenade), 8 m
  return g3Tex((x, w) => { const R = RNG('prom'); x.fillStyle = '#efe6d6'; x.fillRect(0, 0, w, w); x.fillStyle = '#2a2a2e';
    for (let y = 0; y < w; y += 2) for (const band of [0.25, 0.75]) { const c = band * w + Math.sin(y / w * TAU * 2) * w * 0.09; x.fillRect(c - w * 0.08, y, w * 0.16, 2); }
    speck(x, w, w, 14000, ['rgba(50,40,30,0.12)', 'rgba(255,255,255,0.18)'], R, 1, 3);
    for (let i = 0; i < 64; i++) { x.fillStyle = 'rgba(80,70,60,0.1)'; x.fillRect(0, i * w / 64, w, 1); x.fillRect(i * w / 64, 0, 1, w); } }, 512, 512);
}
function texAsphalt() {   // 16 m of avenue (u across 18 m, v along): grain, patches, lane dashes, a double yellow centre line
  return g3Tex((x, w, h) => { const R = RNG('asph'); x.fillStyle = '#4a4a4c'; x.fillRect(0, 0, w, h); speck(x, w, h, 20000, ['rgba(20,20,22,0.3)', 'rgba(160,160,160,0.15)'], R, 1, 3);
    for (let k = 0; k < 10; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '30,30,32' : '90,90,92'},0.3)`; x.fillRect(R.r(0, w), R.r(0, h), R.r(20, 80), R.r(20, 120)); }
    x.fillStyle = '#e0b030'; x.fillRect(w * 0.49, 0, w * 0.008, h); x.fillRect(w * 0.505, 0, w * 0.008, h);
    x.fillStyle = 'rgba(240,240,236,0.85)'; for (const u of [0.25, 0.75]) x.fillRect(w * u, 0, w * 0.008, h * 0.4); x.fillRect(w * 0.02, 0, w * 0.01, h); x.fillRect(w * 0.97, 0, w * 0.01, h); }, 256, 256);
}
function texCrack() {   // a jagged fissure (alpha): a dark core with broken edges and side cracks, along v
  return g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); const R = RNG('crackT');
    const edge = (side) => { const P = []; for (let k = 0; k <= 40; k++) P.push([w / 2 + side * (w * 0.12 + R.r(0, w * 0.22) * (0.6 + 0.4 * Math.sin(k * 0.7))), k * h / 40]); return P; };
    const L = edge(-1), Rr = edge(1); x.fillStyle = '#100c0a'; x.beginPath(); L.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); Rr.slice().reverse().forEach(([a, b]) => x.lineTo(a, b)); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(16,12,10,0.85)'; for (let k = 0; k < 26; k++) { const [a, b] = (k % 2 ? L : Rr)[Math.floor(R.f() * 40)]; let px = a, py = b; x.lineWidth = R.r(1, 3); x.beginPath(); x.moveTo(px, py); for (let j = 0; j < 4; j++) { px += (k % 2 ? -1 : 1) * R.r(8, 30); py += R.n(14); x.lineTo(px, py); } x.stroke(); }
    x.strokeStyle = 'rgba(120,110,96,0.6)'; x.lineWidth = 2; for (const P of [L, Rr]) { x.beginPath(); P.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke(); } }, 256, 1024);
}
function texSand() { return g3Tex((x, w) => { const R = RNG('sandT'); x.fillStyle = '#d8c49a'; x.fillRect(0, 0, w, w); speck(x, w, w, 30000, ['rgba(120,100,70,0.2)', 'rgba(255,250,230,0.25)', 'rgba(90,80,60,0.15)'], R, 1, 2); }, 256, 256); }
// the building across the street: its whole street facade (6 bays x 7 floors, shops at the bottom), drawn once; panels sample it
function texHeroFacade() {
  return g3Tex((x, w, h) => { const R = RNG('hero'); x.fillStyle = '#e2b84e'; x.fillRect(0, 0, w, h); speck(x, w, h, 20000, ['rgba(90,70,30,0.1)', 'rgba(255,250,230,0.14)'], R, 1, 4);
    const bw = w / 6, fh = h / 9;
    for (let r = 0; r < 9; r++) { x.fillStyle = '#f4ecd8'; x.fillRect(0, r * fh, w, 7); x.fillStyle = 'rgba(60,40,10,0.25)'; x.fillRect(0, r * fh + 7, w, 4); }
    for (let r = 1; r < 9; r++) for (let q = 0; q < 6; q++) { const ww = bw * 0.42, hh = fh * 0.6, px = q * bw + (bw - ww) / 2, py = r * fh + fh * 0.2;
      x.fillStyle = '#f4ecd8'; x.fillRect(px - 8, py - 8, ww + 16, hh + 16); const g = x.createLinearGradient(0, py, 0, py + hh); g.addColorStop(0, '#b0c8dc'); g.addColorStop(0.45, '#56708a'); g.addColorStop(1, '#283240'); x.fillStyle = g; x.fillRect(px, py, ww, hh);
      x.fillStyle = '#f4ecd8'; x.fillRect(px + ww / 2 - 2, py, 4, hh); x.fillStyle = '#2f5f8a'; x.fillRect(px - 8 - ww * 0.4, py - 3, ww * 0.4, hh + 6); x.fillRect(px + ww + 8, py - 3, ww * 0.4, hh + 6);
      if (r % 2) { x.fillStyle = '#222428'; x.fillRect(px - 20, py + hh, ww + 40, 6); for (let k = 0; k <= 9; k++) x.fillRect(px - 20 + k * (ww + 40) / 9, py + hh - 30, 2, 30); x.fillRect(px - 20, py + hh - 32, ww + 40, 3); } }
    const SH = [['#c8372d', 'FARMACIA'], ['#2f6fb0', 'CAFÉ'], ['#3a8a5a', 'MERCADO'], ['#e0a43a', 'PAN'], ['#7a4fa0', 'LIBROS'], ['#c8372d', 'BAR']];
    for (let q = 0; q < 6; q++) { const px = q * bw; x.fillStyle = '#3a3a3e'; x.fillRect(px + 10, fh * 0.35, bw - 20, fh * 0.65); const g = x.createLinearGradient(0, fh * 0.4, 0, fh); g.addColorStop(0, '#d8c8a0'); g.addColorStop(1, '#5a4a38'); x.fillStyle = g; x.fillRect(px + 16, fh * 0.42, bw - 32, fh * 0.55);
      x.fillStyle = SH[q][0]; x.fillRect(px + 6, fh * 0.12, bw - 12, fh * 0.2); x.fillStyle = '#fff'; x.font = `bold ${Math.round(fh * 0.13)}px sans-serif`; x.textAlign = 'center'; x.fillText(SH[q][1], px + bw / 2, fh * 0.27);
      for (let k = 0; k < 8; k++) { x.fillStyle = k % 2 ? '#f2eee6' : SH[q][0]; x.beginPath(); x.moveTo(px + 6 + k * (bw - 12) / 8, fh * 0.32); x.lineTo(px + 6 + (k + 1) * (bw - 12) / 8, fh * 0.32); x.lineTo(px + 6 + (k + 0.5) * (bw - 12) / 8, fh * 0.38); x.fill(); } } }, 1536, 2304);
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
function texFoamStreaks() {   // white streaks running down the wave's face (alpha in the red channel), tiles both ways
  return g3Tex((x, w, h) => {
    x.fillStyle = '#000'; x.fillRect(0, 0, w, h); const R = RNG('streak2');
    const dot = (px, py, r, a) => { for (const dx of [-w, 0, w]) { const X = px + dx; if (X < -r || X > w + r) continue; for (const dy of [-h, 0, h]) { const Y = py + dy; if (Y < -r || Y > h + r) continue;
      const g = x.createRadialGradient(X, Y, 0, X, Y, r); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.55, `rgba(255,255,255,${a * 0.5})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(X - r, Y - r, 2 * r, 2 * r); } } };
    // one flow of foam running down: wandering, swelling then tapering, broken by noise, sometimes branching
    const flow = (px, py, w0, len, a, depth) => {
      let X = px; const drift = R.n(0.12), ph1 = R.r(0, 9), ph2 = R.r(0, 9), f1 = R.r(0.008, 0.025), f2 = R.r(0.04, 0.11), step = Math.max(1.2, w0 * 0.22);
      for (let s = 0; s < len; s += step) {
        const k = s / len, taper = Math.pow(1 - k, 0.9) * (0.5 + 0.5 * Math.sin(Math.min(1, k * 3) * Math.PI / 2)), brk = 0.5 + 0.5 * Math.sin(s * f1 + ph1) * Math.sin(s * f2 + ph2);
        X += drift + Math.sin(s * 0.018 + ph1) * 0.22;
        if (brk < 0.2) continue;
        const r = Math.max(0.7, w0 * taper * (0.65 + 0.35 * brk));
        dot(X + R.n(r * 0.18), py + s, r, a * Math.min(1, brk * 1.5) * (0.35 + 0.65 * (1 - k)));
        if (depth < 2 && R.f() < 0.0035 * w0 / 8) flow(X, py + s, w0 * R.r(0.3, 0.55), (len - s) * R.r(0.35, 0.8), a * 0.8, depth + 1);
      }
    };
    for (let i = 0; i < 13; i++) flow(R.r(0, w), R.r(0, h), R.r(5, 15), R.r(420, 1000), R.r(0.16, 0.36), 0);
    for (let i = 0; i < 45; i++) flow(R.r(0, w), R.r(0, h), R.r(0.9, 2.4), R.r(150, 650), R.r(0.18, 0.5), 2);   // thin trickles
  }, 512, 1024, false);
}
function texFoam() {   // bubbly foam noise for the crest and the toe
  return g3Tex((x, w) => {
    x.fillStyle = '#000'; x.fillRect(0, 0, w, w); const R = RNG('foamtex');
    for (let i = 0; i < 1400; i++) { const px = R.r(0, w), py = R.r(0, w), s = R.r(2, 18);
      for (const dx of [-w, 0, w]) for (const dy of [-w, 0, w]) { const g = x.createRadialGradient(px + dx, py + dy, 0, px + dx, py + dy, s); g.addColorStop(0, `rgba(255,255,255,${R.r(0.2, 0.5)})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(px + dx - s, py + dy - s, s * 2, s * 2); } }
  }, 256, 256, false);
}
const texPuff = (key, n = 26, a = 0.35) => g3Tex((x, w) => { const R = RNG(key); for (let i = 0; i < n; i++) { const px = w / 2 + R.n(w * 0.2), py = w / 2 + R.n(w * 0.2), s = R.r(w * 0.12, w * 0.3); const g = x.createRadialGradient(px, py, 0, px, py, s); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); } });
function texCloud() { return g3Tex((x, w, h) => { const R = RNG('cloud'); for (let i = 0; i < 70; i++) { const px = w / 2 + R.n(w * 0.25), py = h * 0.62 + R.n(h * 0.12) - Math.max(0, 1 - Math.abs(px - w / 2) / (w * 0.35)) * R.r(0, h * 0.3), s = R.r(h * 0.08, h * 0.26);
  const g = x.createRadialGradient(px, py - s * 0.2, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.6, 'rgba(246,248,252,0.25)'); g.addColorStop(1, 'rgba(240,244,250,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
  const sh = x.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.65, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(70,90,120,0.35)'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = sh; x.fillRect(0, 0, w, h); }, 512, 256); }
function texBedDetail() {   // wet sand: ripples, mud blotches, shells (multiplies the vertex colours)
  return g3Tex((x, w) => {
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, w); const R = RNG('bedtex');
    for (let i = 0; i < 60; i++) { x.strokeStyle = `rgba(80,66,50,${R.r(0.06, 0.14)})`; x.lineWidth = R.r(2, 5); x.beginPath(); const y0 = R.r(0, w); for (let k = 0; k <= 20; k++) x.lineTo(k * w / 20, y0 + Math.sin(k * 1.3 + i) * 5); x.stroke(); }
    for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(${R.pick(['70,58,44', '96,84,62', '60,70,48'])},${R.r(0.06, 0.16)})`; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, w), R.r(6, 40), R.r(4, 26), R.r(0, 3), 0, TAU); x.fill(); }
    for (let i = 0; i < 16000; i++) { x.fillStyle = R.f() < 0.6 ? `rgba(60,48,36,${R.r(0.06, 0.2)})` : `rgba(240,232,214,${R.r(0.1, 0.3)})`; x.fillRect(R.r(0, w), R.r(0, w), R.r(1, 2.5), R.r(1, 2.5)); }
  }, 512, 512);
}
function envCube() {   // the sky as a cube map, for reflections in glass and wet things
  const face = (k) => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    if (k === 2) { x.fillStyle = '#5b86c8'; x.fillRect(0, 0, 64, 64); } else if (k === 3) { x.fillStyle = '#4a5a62'; x.fillRect(0, 0, 64, 64); }
    else { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#5b86c8'); g.addColorStop(0.45, '#a9c4e2'); g.addColorStop(0.5, '#dce8f2'); g.addColorStop(0.52, '#7a8f98'); g.addColorStop(1, '#4a5a62'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }
    return c; };
  const t = new THREE.CubeTexture([0, 1, 2, 3, 4, 5].map(face)); t.encoding = THREE.sRGBEncoding; t.needsUpdate = true; return t;
}
