// =====================================================================
//  SCENES — the shrinking POV. Helpers, the scale clock (how many times smaller you are), the scene windows (forest, drop,
//  cell, DNA, atom, nucleus, quarks), number words. Worlds in world.js, motion in run.js.
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

// ---- the scale: log10 of how many times smaller you are; your height = 1.75 m / 10^S
const SCALE = [[0, 0], [4, 0], [7, 0.9], [10, 1.94], [16, 2.94], [20, 3.4], [26, 3.55], [34, 4.4], [40, 6.2], [45, 7.3], [51, 8.6], [57, 10.5], [62, 14.5], [70, 18.25], [74, 19]];
const logS = (t) => knots(SCALE, t), heightM = (t) => 1.75 / Math.pow(10, logS(t));
// the scene windows
const SC = { forest: [0, 20.2], drop: [20.2, 34.2], cell: [34.2, 45.2], dna: [45.2, 51.2], atom: [51.2, 62.0], quark: [62.6, 74.0] };
const inSc = (k, t) => t >= SC[k][0] && t < SC[k][1];
const greyK = (t) => ss(40.2, 43.4, t);               // too small for light: the colour drains away
const T_HERO = 62.6;
// numbers in Spanish words (long scale): mil, millones, miles de millones, billones, miles de billones, trillones
function bigWords(x) {
  const f = (v) => (v < 10 ? v.toFixed(1).replace('.', ',').replace(',0', '') : pvNum(Math.round(v)));
  if (x < 1e6) return pvNum(Math.round(x / 10) * 10);
  if (x < 1e9) return `${f(x / 1e6)} millones`;
  if (x < 1e12) return `${pvNum(Math.round(x / 1e6))} millones`;
  if (x < 1e18) return x < 1e15 ? `${f(x / 1e12)} billones` : `${pvNum(Math.round(x / 1e12))} billones`;
  return `${f(x / 1e18)} trillones`;
}
function heightTxt(m) { return m >= 1 ? `${m.toFixed(2).replace('.', ',')} m` : m >= 0.01 ? `${(m * 100).toFixed(m >= 0.1 ? 0 : 1).replace('.', ',')} cm` : `${(m * 1000).toFixed(m >= 0.001 ? 1 : 2).replace('.', ',')} mm`; }
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
const texPuff = (key, n = 26, a = 0.35) => g3Tex((x, w) => { const R = RNG(key); for (let i = 0; i < n; i++) { const px = w / 2 + R.n(w * 0.2), py = w / 2 + R.n(w * 0.2), s = R.r(w * 0.12, w * 0.3); const g = x.createRadialGradient(px, py, 0, px, py, s); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); } });
function texCloud() { return g3Tex((x, w, h) => { const R = RNG('cloud'); for (let i = 0; i < 70; i++) { const px = w / 2 + R.n(w * 0.25), py = h * 0.62 + R.n(h * 0.12) - Math.max(0, 1 - Math.abs(px - w / 2) / (w * 0.35)) * R.r(0, h * 0.3), s = R.r(h * 0.08, h * 0.26);
  const g = x.createRadialGradient(px, py - s * 0.2, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.6, 'rgba(246,248,252,0.25)'); g.addColorStop(1, 'rgba(240,244,250,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
  const sh = x.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.65, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(70,90,120,0.35)'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = sh; x.fillRect(0, 0, w, h); }, 512, 256); }
