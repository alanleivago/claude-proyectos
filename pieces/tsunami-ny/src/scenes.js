
// =====================================================================
//  SCENES — a rooftop in lower Manhattan at sunset (metres; the camera looks south, -z; +x is west, towards New Jersey).
//  Helpers, code-drawn textures, the harbour's geography, the wave's numbers and the camera. World in world.js, motion in run.js.
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

// ---- the place
const ROOF = 170, EYE = ROOF + 1.7, LAND_Y = 3, CAMX = 600, CAMZ = -1050;   // a 150 m rooftop on the west side, 1.7 km north of One WTC
const SUN_DIR = dirV(100 * DEG, 4.5 * DEG);           // the sun setting in the west (to the right, out of frame)
// coastlines as polygons (x, z): Manhattan's southern half, New Jersey (Jersey City, Bayonne), Brooklyn, Staten Island, three islands
const MANHATTAN = [[900, 4000], [950, 1000], [880, -1500], [760, -2800], [520, -3600], [200, -3900], [-250, -3980], [-700, -3850], [-1150, -3500], [-1450, -3000], [-1600, -2000], [-1550, 0], [-1500, 4000]];
const NEWJERSEY = [[2300, 4000], [2250, 0], [2350, -2500], [2100, -5000], [2300, -8000], [2600, -11000], [3200, -12300], [9000, -12300], [9000, 4000]];
const BROOKLYN = [[-2300, 4000], [-2250, -1500], [-2500, -3500], [-2200, -5000], [-1200, -8000], [200, -11000], [1400, -13700], [600, -15500], [-9000, -15500], [-9000, 4000]];
const STATEN = [[2700, -13700], [3300, -13100], [4500, -12750], [9000, -12700], [9000, -24000], [2900, -24000], [2500, -16000]];
const ISLES = [[-900, -5300, 420], [1650, -7000, 120], [1900, -6000, 140]];   // Governors, Liberty, Ellis (x, z, r)
const inPoly = (P, x, z) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, zi] = P[i], [xj, zj] = P[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
const isLand = (x, z) => inPoly(MANHATTAN, x, z) || inPoly(NEWJERSEY, x, z) || inPoly(BROOKLYN, x, z) || inPoly(STATEN, x, z) || ISLES.some(([ix, iz, r]) => Math.hypot(x - ix, z - iz) < r);
// the harbour floor (JS and GLSL): mud shelving into a channel down the middle of the bay
function bedH(x, z) { const ch = -400 + 300 * Math.sin(z * 0.0002); return -10.5 - 7 * Math.exp(-(((x - ch) / 900) ** 2)) - 2.5 * ss(4000, 14000, -z) + 0.6 * Math.sin(x * 0.011 + z * 0.007) * Math.sin(z * 0.013 - x * 0.005); }
const BED_GLSL = `
  float bedH(vec2 p){ float x = p.x, z = p.y, ch = -400.0 + 300.0 * sin(z * 0.0002), q = (x - ch) / 900.0;
    return -10.5 - 7.0 * exp(-q * q) - 2.5 * smoothstep(4000.0, 14000.0, -z) + 0.6 * sin(x * 0.011 + z * 0.007) * sin(z * 0.013 - x * 0.005); }`;

// ---- the story's numbers
const seaLevel = (t) => -15.5 * EZ.io(seg(t, 11, 20.5));                          // harbour water level (m)
const WZ = [[24, -21000], [31, -17600], [37, -14400], [39, -13650], [43, -10600], [46, -6900], [49, -5500], [53, -4500], [55.5, -3920], [58, -3250], [60, -2450], [62, -1550], [62.8, -1075]];
const WH = [[24, 40], [31, 160], [37, 320], [43, 460], [49, 524], [62.8, 524]];
const waveZ = (t) => knots(WZ, t), waveHm = (t) => knots(WH, t), T_HIT = 62.8;
// when the wall's toe reaches a given z (bisection over the knots)
const waveAt = (z) => { if (z < WZ[0][1]) return 24; let a = 24, b = T_HIT; for (let k = 0; k < 30; k++) { const m = (a + b) / 2; if (waveZ(m) < z) a = m; else b = m; } return b; };
// the camera: a slow handheld float on the roof; it follows the wave up as it grows; the roof shakes as it arrives
function camPose(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c, sh = 0.25 * ss(52, 58, t) + 0.9 * ss(58, 62, t) * (t < 62 ? 1 : 0);
  const look = knots([[0, -14.5], [11, -15.0], [20, -14.0], [24, -12.5], [37, -11.0], [46, -9.0], [53, -5.5], [58, 1.0], [61, 10.0], [62, 16.0], [62.8, 20.0]], t);
  return {
    x: CAMX + n(0.31, 1, 0.04) + sh * (n(23, 0, 0.04) + n(31, 1, 0.03)),
    y: EYE + n(0.43, 0.3, 0.03) + sh * n(27, 2, 0.04),
    z: CAMZ - 15.55 + n(0.19, 2.2, 0.02) + 1.2 * ss(58.5, 62, t),
    yaw: (knots([[0, 1.0], [11, 0.0], [20, 0.0], [40, 0.5], [55, 2], [62.8, 3]], t) + n(0.21, 0.7, 0.35) + n(0.57, 2.1, 0.12) + sh * n(19, 3, 0.7)) * DEG,
    pitch: (look + n(0.33, 1.2, 0.22) + n(0.81, 0.4, 0.08) + sh * (n(29, 1, 0.9) + n(47, 3, 0.4))) * DEG,
    roll: (n(0.27, 2.1, 0.2) + sh * (n(17, 2, 0.9) + n(37.9, 5, 0.5))) * DEG,
  };
}
// the wall's visible height: true until its crest would leave the frame, then held near the top (like the reference);
// far away it is drawn taller than true so the line on the horizon reads
function waveVis(t) {
  const c = camPose(t), zw = waveZ(t), Hm = waveHm(t) * (1 + 3.0 * (1 - ss(24, 40, t))), cap = (24 + c.pitch / DEG) * DEG, tc = Math.tan(Math.max(5 * DEG, cap));
  const Hv = Math.min(Hm, tc * (c.z - zw) * 0.94 + EYE);
  return { zw, Hv, Hm };
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
// a New York walk-up / loft facade, 24 m x 24 m = 8 bays x 8 floors: brick (luminance, tinted per building), windows with
// white lintels, black fire escapes zig-zagging down some bays; plus its lit sheet (alpha = when that window turns on, 0.25-1)
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
function texStaves() {   // a wooden water tower: vertical cedar staves, steel hoops
  return g3Tex((x, w, h) => { const R = RNG('staves'); for (let i = 0; i < 48; i++) { const v = R.r(0.8, 1.1); x.fillStyle = `rgb(${120 * v},${92 * v},${66 * v})`; x.fillRect(i * w / 48, 0, w / 48 - 1, h); }
    speck(x, w, h, 4000, ['rgba(40,30,20,0.2)', 'rgba(200,180,150,0.12)'], R, 1, 3);
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(60,60,60,0.25)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(30,40,30,0.3)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(30,30,34,0.9)'; for (let k = 1; k < 9; k++) x.fillRect(0, k * h / 9, w, 3); }, 512, 256);
}
function texParapet() {   // the roof's brick parapet with a stone coping
  return g3Tex((x, w, h) => { const R = RNG('parapet'); x.fillStyle = '#8a4a36'; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 16; r++) for (let k = 0; k < 32; k++) { const v = R.r(0.8, 1.1); x.fillStyle = `rgb(${150 * v},${74 * v},${54 * v})`; x.fillRect(k * 16 + (r % 2 ? 8 : 0), r * 16, 15, 14); }
    x.fillStyle = '#c8c0b0'; x.fillRect(0, 0, w, h * 0.14); speck(x, w, h, 3000, ['rgba(30,20,16,0.2)', 'rgba(255,240,220,0.1)'], R, 1, 3); }, 512, 256);
}
// window grids: kind 0 blue glass, 1 grey concrete, 2 warm stone, 3 dark glass; 8 bays x 32 floors per tile
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
