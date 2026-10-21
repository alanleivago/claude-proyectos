
// =====================================================================
//  SCENES — a porch on a hillside above a timber river town at sunrise (metres; the camera looks north, -z).
//  The asteroid, its trail, the burst, the plume and the dust wall are in world.js / run.js.
//  Everything is a pure function of TT + seeded RNG: deterministic frame by frame.
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
// ---- the sky: a sunrise gradient (blue above, peach at the horizon), the sun and its halo; the fireball's glow, the
//      burst's white-out, the heat's amber and the dust's brown
const SKY_GLSL = `
  uniform vec3 top, mid, hor, sunDir, sunCol, fireCol; uniform vec3 fireDir[3]; uniform float fire[3], fireW[3]; uniform float flash, amber, dust;
  vec3 skyColor(vec3 d){ float h = clamp(d.y, -0.2, 1.0);
    vec3 c = mix(hor, mid, smoothstep(0.0, 0.2, pow(max(h, 0.0), 0.8))); c = mix(c, top, smoothstep(0.12, 0.8, h));
    float s = max(dot(d, sunDir), 0.0); c += sunCol * (pow(s, 1800.0) * 3.0 + pow(s, 60.0) * 0.35 + pow(s, 6.0) * 0.16) * (1.0 - dust);
    c += vec3(0.07, 0.05, 0.03) * exp(-abs(d.y) * 12.0);
    float a = 9.0;
    for (int k = 0; k < 3; k++) { float ak = acos(clamp(dot(d, fireDir[k]), -1.0, 1.0)); a = min(a, ak);
      c += fireCol * fire[k] * (1.2 * exp(-ak * ak / fireW[k]) + 0.35 * exp(-ak * 4.0) + 0.08 * exp(-ak)); }
    c = mix(c, vec3(1.0, 0.62, 0.32) * (0.6 + 0.6 * exp(-a * 1.5)), amber * 0.55);
    c = mix(c, vec3(0.52, 0.42, 0.32) * (0.75 + 0.25 * smoothstep(-0.1, 0.5, d.y)), dust);
    c = mix(c, vec3(1.0, 0.98, 0.94), flash);
    return c; }`;

// ---- the story's numbers
const PORCH = 44;                                   // the porch floor's height above the valley floor
const EYE = PORCH + 1.65;
const SUN_DIR = dirV(13 * DEG, 6 * DEG);         // the sun just risen, front-left
// THREE asteroids: each a new star (staggered), a fireball sliding down from the upper LEFT, its own airburst (31.0 / 31.6 / 32.3)
const TB = [31.0, 31.6, 32.3], T_BURST = TB[0], T_HIT = 57.3, T_HITS = [57.3, 58.5, 59.7];
const A_PATHS = [
  [[0, -16.0, 22.4], [13, -15.6, 22.0], [21, -15.0, 21.2], [25, -12.6, 18.6], [28, -9.8, 15.8], [31.0, -7.0, 13.6]],
  [[0, -2.0, 25.0], [13, -1.7, 24.6], [21.6, -1.2, 23.8], [25.6, 0.8, 21.0], [28.6, 3.0, 18.2], [31.6, 5.0, 15.8]],
  [[0, -20.0, 18.6], [13, -19.6, 18.2], [22.3, -18.9, 17.4], [26.3, -16.8, 14.8], [29.3, -14.4, 12.4], [32.3, -12.2, 10.6]],
];
const astDirK = (k, t) => { const P = A_PATHS[k]; return dirV(knots(P.map(([a, az]) => [a, az]), t) * DEG, knots(P.map(([a, , el]) => [a, el]), t) * DEG); };
const BURSTS = A_PATHS.map((P) => dirV(P[P.length - 1][1] * DEG, P[P.length - 1][2] * DEG));
const astGlowK = (k, t) => { const t0 = 4 + 1.8 * k, ta = 21 + 0.6 * k; return t < t0 ? 0 : t < ta ? 0.04 + 0.5 * Math.pow(ss(t0, ta, t), 2) : t < TB[k] ? 0.55 + 4.0 * Math.pow(ss(ta, TB[k], t), 2.2) : 0; };
const astDir = (t) => astDirK(0, t), astGlow = (t) => astGlowK(0, t), BURST = BURSTS[0];
// HUD: altitude (miles) until the burst; then the shockwave's countdown (seconds) and distance (miles)
const ALT_MI = [[0, 11800], [5, 7000], [13, 1500], [21, 62], [25, 32], [28, 15], [31, 5]];
const altMi = (t) => knots(ALT_MI, t);
const shockS = (t) => Math.max(0, 190 * (1 - (t - T_BURST) / (T_HIT - T_BURST)));
const shockMi = (t) => Math.max(0, 40 * (1 - Math.pow((t - T_BURST) / (T_HIT - T_BURST), 1.0)));
// the blast front: a line sweeping towards the camera (+z) from beyond the hills; z of the front (m)
const FRONT = [[47.5, -14000], [50, -7600], [53, -3600], [55, -1700], [56.5, -560], [57.3, 2]];
const frontZ = (t) => (t < 47.5 ? -1e6 : t > 57.3 ? 50 + (t - 57.3) * 600 : knots(FRONT, t));
// the camera: on the porch, breathing; it lifts its eyes to the fireball, shakes with the quake, is thrown at the blast
// the quake (43-49, a jolt on its arrival), a growing rumble as the wall comes, the blast's violent shake, settling
const camShake = (t) => 0.5 * ss(43, 43.25, t) * (1 - ss(47, 50, t)) + 0.6 * Math.exp(-Math.max(0, t - 43) * 3) * (t >= 43 ? 1 : 0) + 0.35 * Math.pow(ss(50, 56.6, t), 2) * (t < T_HIT ? 1 : 0) + (t >= T_HIT ? 4.5 * Math.exp(-(t - T_HIT) * 2.0) + 0.12 : 0) + (t >= T_HITS[1] ? 3.2 * Math.exp(-(t - T_HITS[1]) * 2.2) : 0) + (t >= T_HITS[2] ? 2.6 * Math.exp(-(t - T_HITS[2]) * 2.4) : 0);
function camPose(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c, sh = camShake(t), hit = t >= T_HIT ? ss(T_HIT, T_HIT + 0.35, t) : 0;
  const look = knots([[0, -4.5], [13, -4.0], [21, -3.2], [27, 0.5], [31, 1.5], [35, 0.6], [40, -2.0], [49, -3.0], [55, -3.2], [57.3, -3.0], [59, 0.5], [63, -1.0]], t);
  const yawL = knots([[0, 0], [21, -0.3], [31, -0.9], [36, -0.7], [42, -0.2], [50, 0], [57.3, 0], [59, -0.4], [63, -0.2]], t);
  return {
    x: n(0.31, 1, 0.03) + sh * (n(23, 0, 0.05) + n(31, 1, 0.04) + n(47.3, 2, 0.03)),
    y: EYE + n(0.43, 0.3, 0.025) + sh * n(27, 2, 0.05) - 0.3 * hit,
    z: n(0.19, 2.2, 0.03) - 0.15 * hit,
    yaw: (yawL + n(0.21, 0.7, 0.35) + n(0.57, 2.1, 0.12) + sh * (n(19, 3, 0.6) + n(41.7, 1, 0.4))) * DEG,
    pitch: (look + n(0.33, 1.2, 0.22) + n(0.81, 0.4, 0.08) + sh * (n(29, 1, 0.8) + n(53.1, 4, 0.5) + n(11.3, 2, 0.4))) * DEG,
    roll: (n(0.27, 2.1, 0.22) + sh * (n(17, 2, 0.9) + n(37.9, 5, 0.6)) - 2.2 * hit * (1 - 0.4 * ss(59, 63, t))) * DEG,
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
const M4 = () => new THREE.Matrix4(), Tr = (x, y, z) => M4().makeTranslation(x, y, z), Rx = (a) => M4().makeRotationX(a), Rz = (a) => M4().makeRotationZ(a);
const speck = (x, w, h, n, cols, R, s0 = 1, s1 = 3) => { for (let k = 0; k < n; k++) { x.fillStyle = R.pick(cols); x.fillRect(R.r(0, w), R.r(0, h), R.r(s0, s1), R.r(s0, s1)); } };
const blot = (x, px, py, r, col) => { const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); };

// ---- code-drawn textures
function texRoad() {   // 14 m across (u) x 16 m along (v): asphalt grain, patches, tyre polish, white lane dashes, a solid centre line
  return g3Tex((x, w, h) => {
    const R = RNG('road'); x.fillStyle = '#4b4b4d'; x.fillRect(0, 0, w, h);
    speck(x, w, h, 26000, ['rgba(20,20,22,0.35)', 'rgba(150,150,150,0.25)', 'rgba(90,86,80,0.3)'], R, 1, 2.5);
    for (let k = 0; k < 18; k++) blot(x, R.r(0, w), R.r(0, h), R.r(20, 70), `rgba(${R.f() < 0.5 ? '30,30,32' : '110,108,104'},0.18)`);
    for (const u of [1.75, 5.25, 8.75, 12.25]) { const g = x.createLinearGradient((u - 0.9) / 14 * w, 0, (u + 0.9) / 14 * w, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(25,25,28,0.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
    x.fillStyle = 'rgba(240,238,230,0.9)';
    for (const u of [3.5, 10.5]) for (let v = 0; v < 16; v += 8) x.fillRect((u - 0.07) / 14 * w, v / 16 * h, 0.14 / 14 * w, 4.5 / 16 * h);
    x.fillRect((7 - 0.2) / 14 * w, 0, 0.12 / 14 * w, h); x.fillRect((7 + 0.08) / 14 * w, 0, 0.12 / 14 * w, h);
    x.fillRect(0.1 / 14 * w, 0, 0.15 / 14 * w, h); x.fillRect(13.75 / 14 * w, 0, 0.15 / 14 * w, h);
    speck(x, w, h, 3000, ['rgba(60,60,60,0.25)'], R, 1, 2);
  }, 512, 512);
}
function texPaving(key, base, cols, cell) {   // square paving slabs with grout and wear
  return g3Tex((x, w) => {
    const R = RNG(key), n = Math.round(w / cell); x.fillStyle = base; x.fillRect(0, 0, w, w);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = R.pick(cols); x.fillRect(i * cell + 1, j * cell + 1, cell - 2, cell - 2); }
    speck(x, w, w, 9000, ['rgba(40,30,25,0.12)', 'rgba(255,250,240,0.12)'], R, 1, 2);
    for (let k = 0; k < 14; k++) blot(x, R.r(0, w), R.r(0, w), R.r(10, 40), 'rgba(60,50,40,0.12)');
  }, 512, 512);
}
function texPromenade() {   // a wavy two-tone mosaic (like a seaside promenade), 8 m
  return g3Tex((x, w) => {
    const R = RNG('prom'); x.fillStyle = '#efe6d6'; x.fillRect(0, 0, w, w);
    x.fillStyle = '#a7523e';
    for (let y = 0; y < w; y += 2) for (const band of [0.18, 0.5, 0.82]) { const c = band * w + Math.sin(y / w * TAU * 2) * w * 0.07; x.fillRect(c - w * 0.055, y, w * 0.11, 2); }
    speck(x, w, w, 14000, ['rgba(50,40,30,0.12)', 'rgba(255,255,255,0.18)'], R, 1, 3);
    for (let i = 0; i < 64; i++) { x.fillStyle = 'rgba(80,70,60,0.12)'; x.fillRect(0, i * w / 64, w, 1); x.fillRect(i * w / 64, 0, 1, w); }
  }, 512, 512);
}
function texSand() {
  return g3Tex((x, w) => { const R = RNG('sand'); x.fillStyle = '#e3c99d'; x.fillRect(0, 0, w, w);
    for (let k = 0; k < 30; k++) blot(x, R.r(0, w), R.r(0, w), R.r(20, 90), `rgba(${R.f() < 0.5 ? '200,170,120' : '245,230,200'},0.35)`);
    speck(x, w, w, 30000, ['rgba(120,95,60,0.25)', 'rgba(255,248,230,0.3)', 'rgba(170,140,100,0.2)'], R, 1, 2);
    for (let k = 0; k < 60; k++) { x.strokeStyle = 'rgba(150,120,80,0.15)'; x.lineWidth = 2; const px = R.r(0, w), py = R.r(0, w); x.beginPath(); x.ellipse(px, py, R.r(3, 7), R.r(2, 5), 0, 0, TAU); x.stroke(); }   // footprints
  }, 512, 512);
}
function texFacade() {   // 24 m x 24 m = 8 bays x 8 floors: plaster, glass that catches the sky, sills, shutters, cornices
  return g3Tex((x, w) => {
    const R = RNG('facadeD'), c = w / 8; x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, w);
    speck(x, w, w, 9000, ['rgba(110,100,90,0.1)', 'rgba(255,255,255,0.12)'], R, 1, 3);
    for (let k = 0; k < 50; k++) blot(x, R.r(0, w), R.r(0, w), R.r(10, 50), 'rgba(80,70,60,0.1)');
    for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) {
      const px = q * c + c * 0.3, py = r * c + c * 0.2, ww = c * 0.4, hh = c * 0.55, g = x.createLinearGradient(px, py, px + ww * 0.6, py + hh);
      g.addColorStop(0, '#c9d6e6'); g.addColorStop(0.45, '#6f7f96'); g.addColorStop(1, '#2c3440'); x.fillStyle = g; x.fillRect(px, py, ww, hh);
      x.fillStyle = 'rgba(255,255,255,0.55)'; x.fillRect(px - 3, py + hh, ww + 6, 3); x.fillStyle = 'rgba(40,36,32,0.6)'; x.fillRect(px + ww / 2 - 0.8, py, 1.6, hh); x.fillRect(px, py + hh * 0.35, ww, 1.6);
      if (R.f() < 0.4) { x.fillStyle = R.pick(['#3d6b5a', '#2f5a86', '#7a4a32', '#5a6a3a', '#a8a090', '#6a3a3a']); x.fillRect(px - ww * 0.42, py, ww * 0.38, hh); x.fillRect(px + ww * 1.04, py, ww * 0.38, hh);
        x.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = 0; k < 6; k++) { x.fillRect(px - ww * 0.42, py + k * hh / 6, ww * 0.38, 1); x.fillRect(px + ww * 1.04, py + k * hh / 6, ww * 0.38, 1); } }
    }
    x.fillStyle = 'rgba(0,0,0,0.3)'; for (let r = 0; r < 8; r++) x.fillRect(0, r * c + c - 3, w, 3);
    x.fillStyle = 'rgba(255,255,255,0.35)'; for (let r = 0; r < 8; r++) x.fillRect(0, r * c + c - 6, w, 2);
  }, 512, 512);
}
function texRoof() {   // terracotta tiles
  return g3Tex((x, w) => {
    const R = RNG('roof'); x.fillStyle = '#b8b0a8'; x.fillRect(0, 0, w, w);
    const rows = 9, cols = 12, rh = w / rows, cw = w / cols;
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const v = R.r(-20, 20), px = q * cw + (r % 2) * cw * 0.5, py = r * rh;
      const g = x.createLinearGradient(px, 0, px + cw, 0); g.addColorStop(0, `rgb(${150 + v},${150 + v},${150 + v})`); g.addColorStop(0.5, `rgb(${235 + v},${235 + v},${232 + v})`); g.addColorStop(1, `rgb(${120 + v},${120 + v},${120 + v})`);
      x.fillStyle = g; x.fillRect(px, py, cw - 1, rh); if (px + cw > w) x.fillRect(px - w, py, cw - 1, rh); }
    for (let r = 0; r < rows; r++) { const g = x.createLinearGradient(0, r * rh, 0, r * rh + rh); g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(0.25, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.12)'); x.fillStyle = g; x.fillRect(0, r * rh, w, rh); }
  }, 256, 256);
}
function texTower() {   // a curtain wall, 48 m x 96 m: glass panels reflecting a warm sky, mullions, spandrels, a few open blinds
  return g3Tex((x, w, h) => {
    const R = RNG('tower'), cw = w / 16, rh = h / 24;
    const g = x.createLinearGradient(0, 0, w * 0.3, h); g.addColorStop(0, '#f2d9c0'); g.addColorStop(0.35, '#a9b4cc'); g.addColorStop(0.7, '#56647e'); g.addColorStop(1, '#2a3446'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 12; k++) { const px = R.r(0, w), pw = R.r(20, 90); const gg = x.createLinearGradient(px, 0, px + pw, 0); gg.addColorStop(0, 'rgba(255,240,220,0)'); gg.addColorStop(0.5, 'rgba(255,240,220,0.25)'); gg.addColorStop(1, 'rgba(255,240,220,0)'); x.fillStyle = gg; x.fillRect(px, 0, pw, h); }
    for (let r = 0; r < 24; r++) for (let q = 0; q < 16; q++) { if (R.f() < 0.12) { x.fillStyle = `rgba(${R.f() < 0.5 ? '230,226,214' : '40,46,56'},0.45)`; x.fillRect(q * cw + 2, r * rh + 2, cw - 4, rh * R.r(0.3, 0.9)); } }
    x.fillStyle = 'rgba(30,34,40,0.85)'; for (let q = 0; q <= 16; q++) x.fillRect(q * cw - 1, 0, 2, h);
    x.fillStyle = 'rgba(70,76,86,0.9)'; for (let r = 0; r <= 24; r++) x.fillRect(0, r * rh - 2, w, 4);
  }, 512, 1024);
}
function texField() {   // 400 m of farmland: strips of crops, ploughed earth, hedges
  return g3Tex((x, w) => {
    const R = RNG('field'), C = ['#8fa458', '#b6b265', '#6f8a46', '#c9b878', '#9a7b52', '#7d9a4e', '#d2c48a', '#5f7a3c'];
    let y = 0; while (y < w) { const hh = R.r(18, 70); x.fillStyle = R.pick(C); x.fillRect(0, y, w, hh);
      x.fillStyle = 'rgba(0,0,0,0.08)'; for (let k = 0; k < hh; k += 3) x.fillRect(0, y + k, w, 1); x.fillStyle = 'rgba(50,60,30,0.6)'; x.fillRect(0, y, w, 2); y += hh; }
    for (let k = 0; k < 6; k++) { x.fillStyle = 'rgba(60,70,40,0.5)'; x.fillRect(R.r(0, w), 0, 3, w); }
    for (let k = 0; k < 40; k++) blot(x, R.r(0, w), R.r(0, w), R.r(20, 80), `rgba(${R.f() < 0.5 ? '255,250,220' : '40,50,20'},0.12)`);
    speck(x, w, w, 12000, ['rgba(40,50,20,0.15)', 'rgba(255,255,220,0.12)'], R, 1, 3);
  }, 512, 512);
}
function texFrond() {   // a broad palm frond: midrib + many leaflets, alpha cut-out
  return g3Tex((x, w, h) => {
    x.clearRect(0, 0, w, h); const R = RNG('frond');
    for (let i = 0; i < 46; i++) { const v = i / 46, py = h * (0.04 + 0.92 * v), L = w * 0.48 * Math.sin(Math.PI * Math.min(1, v * 1.15 + 0.08)) * R.r(0.85, 1.05);
      for (const s of [-1, 1]) { const g = x.createLinearGradient(w / 2, py, w / 2 + s * L, py + h * 0.06); g.addColorStop(0, '#3c6e2c'); g.addColorStop(1, R.f() < 0.15 ? '#9a8a40' : '#5e9440');
        x.fillStyle = g; x.beginPath(); x.moveTo(w / 2, py); x.quadraticCurveTo(w / 2 + s * L * 0.5, py - h * 0.004, w / 2 + s * L, py + h * 0.07); x.quadraticCurveTo(w / 2 + s * L * 0.5, py + h * 0.03, w / 2, py + h * 0.018); x.fill(); } }
    x.strokeStyle = '#6a7a3a'; x.lineWidth = 4; x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w / 2, h); x.stroke();
  }, 256, 512);
}
function texAwning() { return g3Tex((x, w, h) => { const R = RNG('awn'); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#f4efe4' : '#ffffff'; x.fillRect(i * w / 8, 0, w / 8, h); } x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(0, h * 0.85, w, h * 0.15);
  for (let i = 0; i < 16; i++) { x.fillStyle = 'rgba(255,255,255,0.9)'; x.beginPath(); x.arc((i + 0.5) * w / 16, h, w / 32, Math.PI, 0); x.fill(); } speck(x, w, h, 600, ['rgba(0,0,0,0.06)'], R); }, 128, 64); }
const texPuff = (key, n = 26, a = 0.35) => g3Tex((x, w) => { const R = RNG(key); for (let i = 0; i < n; i++) { const px = w / 2 + R.n(w * 0.2), py = w / 2 + R.n(w * 0.2), s = R.r(w * 0.12, w * 0.3); const g = x.createRadialGradient(px, py, 0, px, py, s); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); } });
function texCloud() { return g3Tex((x, w, h) => { const R = RNG('cloudD'); for (let i = 0; i < 80; i++) { const px = w / 2 + R.n(w * 0.26), py = h * 0.55 + R.n(h * 0.1), s = R.r(h * 0.08, h * 0.24);
  const g = x.createRadialGradient(px, py - s * 0.25, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.6, 'rgba(250,246,244,0.22)'); g.addColorStop(1, 'rgba(240,236,240,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); } }, 512, 256); }
// the planets in code
function noise2(R, N = 64) {   // a value-noise sampler (seeded lattice of N cells + smooth interpolation), seamless in x
  const L = Array.from({ length: N * N }, () => R.f()), at = (i, j) => L[((j % N) + N) % N * N + ((i % N) + N) % N];
  return (u, v) => { const x = u * N, y = v * N, i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    return lerp(lerp(at(i, j), at(i + 1, j), sx), lerp(at(i, j + 1), at(i + 1, j + 1), sx), sy); };
}
function texEarth() {   // continents from fractal noise, deserts, forests, ice caps; a separate cloud map
  const w = 1024, h = 512, R = RNG('earth'), nz = noise2(R, 6), fbm = (u, v, o = 6) => { let a = 0, s = 1, t = 0; for (let k = 0; k < o; k++) { a += nz(u * s, v * s) / s; t += 1 / s; s *= 2; } return a / t; };
  const map = g3Tex((x) => { const im = x.createImageData(w, h), d = im.data;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const u = i / w, v = j / h, lat = Math.abs(v - 0.5) * 2, e = fbm(u, v + 7, 6) - 0.53 + 0.06 * Math.sin(u * TAU * 2 + 1);
      let c; if (e < 0.0) { const dp = clamp(-e * 5); c = [lerp(36, 10, dp), lerp(96, 40, dp), lerp(150, 98, dp)]; }
      else { const dry = fbm(u * 6 + 3, v * 6) * (1 - lat) * 1.6, m = clamp(e * 6); c = dry > 0.62 ? [196, 168, 118] : [lerp(70, 120, m), lerp(110, 120, m), lerp(54, 70, m)]; }
      if (lat > 0.84 + 0.05 * Math.sin(u * 40)) c = [236, 240, 244];
      const k = (j * w + i) * 4; d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = 255; }
    x.putImageData(im, 0, 0); }, w, h);
  const clouds = g3Tex((x) => { const im = x.createImageData(w, h), d = im.data, Rc = RNG('ecl'), nc = noise2(Rc, 8);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const u = i / w, v = j / h; let a = 0, s = 1; for (let k = 0; k < 3; k++) { a += nc(u * 2 * s + v * 0.6, v * 4 * s) / s; s *= 2; }
      const al = clamp((a / 1.75 - 0.45) * 2.6) * 255, k2 = (j * w + i) * 4; d[k2] = d[k2 + 1] = d[k2 + 2] = 255; d[k2 + 3] = al; }
    x.putImageData(im, 0, 0); }, w, h);
  [map, clouds].forEach((t) => { t.wrapS = THREE.RepeatWrapping; });
  return { map, clouds };
}
// the Moon (maps from the approved luna piece): albedo + height
function texMoonMaps() {
  const R = RNG('moonmap2'), w = 1024, h = 512, cr = [];
  for (let k = 0; k < 300; k++) cr.push([R.f(), R.r(0.05, 0.95), Math.pow(R.f(), 4) * 22 + 1.4, R.f() * 0.95]);
  cr.push([0.47, 0.76, 13, 0.99], [0.4, 0.31, 18, 0.98], [0.62, 0.62, 11, 0.97], [0.3, 0.55, 15, 0.96]);
  const MARIA = [[0.43, 0.36, 70], [0.5, 0.42, 62], [0.56, 0.33, 52], [0.6, 0.48, 56], [0.37, 0.5, 74], [0.32, 0.41, 48], [0.47, 0.6, 44], [0.55, 0.58, 40], [0.66, 0.4, 36], [0.28, 0.33, 40], [0.45, 0.48, 50]];
  const each = (x, u, v, r, fn) => { const lat = (v - 0.5) * Math.PI, sx = 1 / Math.max(0.25, Math.cos(lat)); for (const du of [-w, 0, w]) { x.save(); x.translate(u * w + du, (1 - v) * h); x.scale(sx, 1); fn(x, r); x.restore(); } };
  const blobs = (x, u, v, r, a, col, Rb) => { for (let k = 0; k < 16; k++) each(x, u + Rb.n(r * 0.45) / w, v + Rb.n(r * 0.45) / h, r * Rb.r(0.45, 0.95), (c, rr) => { const g = c.createRadialGradient(0, 0, 0, 0, 0, rr); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(0.65, `rgba(${col},${a * 0.75})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(-rr, -rr, 2 * rr, 2 * rr); }); };
  const alb = g3Tex((x) => {
    x.fillStyle = '#9e9c96'; x.fillRect(0, 0, w, h); const Rn = RNG('malb');
    for (let k = 0; k < 26000; k++) { x.fillStyle = `rgba(${Rn.f() < 0.5 ? '80,80,78' : '235,233,226'},${Rn.r(0.03, 0.09)})`; x.fillRect(Rn.r(0, w), Rn.r(0, h), Rn.r(1, 4), Rn.r(1, 3)); }
    const Rb = RNG('maria'); MARIA.forEach(([u, v, r]) => blobs(x, u, v, r, 0.55, '58,58,64', Rb));
    for (let k = 0; k < 14; k++) blobs(x, Rb.f(), Rb.r(0.2, 0.8), Rb.r(14, 36), 0.2, '82,82,84', Rb);
    cr.forEach(([u, v, r, q]) => each(x, u, v, r, (c, rr) => { const g = c.createRadialGradient(0, 0, 0, 0, 0, rr * 1.5); g.addColorStop(0, 'rgba(80,80,80,0.08)'); g.addColorStop(0.5, 'rgba(80,80,80,0.04)'); g.addColorStop(0.72, 'rgba(235,233,226,0.07)'); g.addColorStop(1, 'rgba(235,233,226,0)'); c.fillStyle = g; c.fillRect(-rr * 1.5, -rr * 1.5, rr * 3, rr * 3); }));
    cr.filter((c) => c[3] > 0.955).forEach(([u, v, r]) => each(x, u, v, r, (c, rr) => { const Rr = RNG('rays', Math.round(u * 1000)); for (let k = 0; k < 30; k++) { const a = Rr.r(0, TAU), L = rr * Rr.r(2.5, 6); c.strokeStyle = `rgba(248,246,238,${Rr.r(0.03, 0.08)})`; c.lineWidth = Rr.r(1, 2.5); c.beginPath(); c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); c.lineTo(Math.cos(a) * L, Math.sin(a) * L); c.stroke(); } }));
  }, w, h);
  const hgt = g3Tex((x) => {
    x.fillStyle = 'rgb(128,128,128)'; x.fillRect(0, 0, w, h); const Rn = RNG('mhgt');
    for (let k = 0; k < 18000; k++) { x.fillStyle = `rgba(${Rn.f() < 0.5 ? '0,0,0' : '255,255,255'},${Rn.r(0.01, 0.03)})`; x.fillRect(Rn.r(0, w), Rn.r(0, h), Rn.r(1, 3), Rn.r(1, 3)); }
    const Rb = RNG('maria'); MARIA.forEach(([u, v, r]) => blobs(x, u, v, r, 0.12, '0,0,0', Rb));
    cr.forEach(([u, v, r]) => each(x, u, v, r, (c, rr) => { const g = c.createRadialGradient(0, 0, 0, 0, 0, rr * 1.6);
      g.addColorStop(0, 'rgba(0,0,0,0.34)'); g.addColorStop(0.45, 'rgba(0,0,0,0.26)'); g.addColorStop(0.66, 'rgba(255,255,255,0.32)'); g.addColorStop(0.8, 'rgba(255,255,255,0.1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(-rr * 1.6, -rr * 1.6, rr * 3.2, rr * 3.2);
      if (rr > 10) { const p = c.createRadialGradient(0, 0, 0, 0, 0, rr * 0.16); p.addColorStop(0, 'rgba(255,255,255,0.5)'); p.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = p; c.fillRect(-rr * 0.2, -rr * 0.2, rr * 0.4, rr * 0.4); } }));
  }, w, h, false);
  [alb, hgt].forEach((t) => { t.wrapS = THREE.RepeatWrapping; });
  return { alb, hgt };
}
function texJupiter() {   // belts and zones with turbulent edges, festoons, the Great Red Spot
  const w = 1024, h = 512, R = RNG('jup'), nz = noise2(R);
  const BANDS = [[0, '#b8a690'], [0.06, '#d8ccb8'], [0.11, '#c0a080'], [0.16, '#e6dccb'], [0.21, '#b9906e'], [0.26, '#ece2d0'], [0.31, '#c49c78'], [0.355, '#b07656'], [0.4, '#eee4d2'], [0.47, '#f2eadb'], [0.52, '#d8c4a4'], [0.57, '#b07c5a'], [0.615, '#c89e7c'],
    [0.66, '#ebdfca'], [0.71, '#bf9878'], [0.76, '#e4d8c4'], [0.82, '#c4aa8c'], [0.88, '#d8cab4'], [0.94, '#b8a690'], [1, '#a89884']];
  const t = g3Tex((x) => { const im = x.createImageData(w, h), d = im.data, cs = BANDS.map(([o, c]) => [o, lin(c)]);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const u = i / w, v = j / h; let a = 0, s = 1; for (let k = 0; k < 5; k++) { a += nz(u * 4 * s, v * 2 * s) / s; s *= 2; }
      const vv = clamp(v + (a / 1.9 - 0.5) * 0.025 + 0.006 * Math.sin(u * TAU * 14 + v * 60) * Math.sin(u * TAU * 3 + 1)); let k = 0; while (k < cs.length - 2 && vv > cs[k + 1][0]) k++;
      const f = ss(0.15, 1, (vv - cs[k][0]) / (cs[k + 1][0] - cs[k][0])), c = cs[k][1].clone().lerp(cs[k + 1][1], f), q = (j * w + i) * 4;
      d[q] = c.r * 255; d[q + 1] = c.g * 255; d[q + 2] = c.b * 255; d[q + 3] = 255; }
    x.putImageData(im, 0, 0);
    const g = x.createRadialGradient(w * 0.62, h * 0.6, 0, w * 0.62, h * 0.6, 40); g.addColorStop(0, '#c0553a'); g.addColorStop(0.6, '#d0805a'); g.addColorStop(1, 'rgba(230,200,170,0)');
    x.save(); x.translate(w * 0.62, h * 0.6); x.scale(1.7, 1); x.translate(-w * 0.62, -h * 0.6); x.fillStyle = g; x.fillRect(w * 0.62 - 40, h * 0.6 - 40, 80, 80); x.restore(); }, w, h);
  t.wrapS = THREE.RepeatWrapping; return t;
}

// the matching light sheet: each window glows warm or TV-blue; alpha = the moment it switches on (0.25..1)
function texWindowsLit() {
  return g3Tex((x, w) => {
    const R = RNG('winlit'), c = w / 8; x.clearRect(0, 0, w, w);
    x.fillStyle = 'rgba(0,0,0,1)'; x.fillRect(0, 0, w, w);
    for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) {
      const px = q * c + c * 0.32, py = r * c + c * 0.22, ww = c * 0.36, hh = c * 0.5, th = R.f(), a = 0.25 + 0.74 * th;
      const blue = R.f() < 0.22, base = blue ? [150, 190, 255] : R.pick([[255, 196, 120], [255, 214, 150], [255, 178, 96], [255, 226, 180]]);
      const k = R.r(0.55, 1);
      x.clearRect(px, py, ww, hh);
      const g = x.createLinearGradient(px, py, px, py + hh);
      g.addColorStop(0, `rgba(${base.map((v) => Math.round(v * k * 0.75)).join(',')},${a})`); g.addColorStop(1, `rgba(${base.map((v) => Math.round(v * k)).join(',')},${a})`);
      x.fillStyle = g; x.fillRect(px, py, ww, hh);
      if (R.f() < 0.5) { x.fillStyle = `rgba(${base.map((v) => Math.round(v * k * 0.45)).join(',')},${a})`; x.fillRect(px, py, ww * R.r(0.15, 0.4), hh); }
    }
  }, 512, 512);
}
