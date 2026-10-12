
// =====================================================================
//  SCENES — a real 3D harbour (three.js into an offscreen WebGL canvas, drawn onto the 2D canvas under the HUD).
//  One eye-level camera on a promenade behind a railing, looking out over a harbour: moored boats, colourful houses
//  on the left quay, a skyline of towers on the right, open sea in the middle. The sea drains (5.6-13.6s), a line
//  rises on the horizon (17s) and becomes a 700 m wall that swallows the skyline and reaches the promenade (57.5s).
//  Everything is a pure function of TT + seeded RNG: deterministic frame by frame.
// =====================================================================
THREE.ColorManagement.legacyMode = false;   // hex colours are sRGB
const lin = (h) => new THREE.Color(h);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const EYE = 6.65, CAMZ0 = 4.6, DECK = 5.0, QZ = -0.6, RAILZ = -0.25;
const SUNL = new THREE.Vector3(-0.55, 0.66, -0.52).normalize();   // towards the sun: front-left, ~41° up
const SUN_TAN = Math.tan(Math.asin(SUNL.y));

// ---- the story's numbers, all functions of time
const seaLevel = (t) => 0.4 - 12 * EZ.io(seg(t, 5.6, 13.6));            // harbour water level (m)
// a smooth monotone curve through knots (Catmull-Rom with averaged slopes)
function knots(K, t) {
  if (t <= K[0][0]) return K[0][1];
  if (t >= K[K.length - 1][0]) return K[K.length - 1][1];
  let i = 0; while (t > K[i + 1][0]) i++;
  const [t0, v0] = K[i], [t1, v1] = K[i + 1], h = t1 - t0, u = (t - t0) / h;
  const sl = (j) => (j <= 0 || j >= K.length - 1) ? (K[Math.min(j + 1, K.length - 1)][1] - K[Math.max(j - 1, 0)][1]) / (K[Math.min(j + 1, K.length - 1)][0] - K[Math.max(j - 1, 0)][0]) : (K[j + 1][1] - K[j - 1][1]) / (K[j + 1][0] - K[j - 1][0]);
  let m0 = sl(i) * h, m1 = sl(i + 1) * h; const d = v1 - v0;
  if (d === 0) { m0 = m1 = 0; } else { m0 = Math.sign(d) * Math.min(Math.abs(m0), 3 * Math.abs(d)) * (Math.sign(m0) === Math.sign(d) ? 1 : 0); m1 = Math.sign(d) * Math.min(Math.abs(m1), 3 * Math.abs(d)) * (Math.sign(m1) === Math.sign(d) ? 1 : 0); }
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * m1;
}
const KM = [[17, 15], [26, 12], [40, 3], [52, 0.5], [57.5, 0]];
const HM = [[17, 20], [21.5, 20], [26, 80], [40, 250], [52, 700], [57.5, 700]];
const waveKm = (t) => knots(KM, t);
const waveHm = (t) => knots(HM, t);
const waveZ = (t) => -(25 + waveKm(t) * 950);                            // the wave's toe line (world z)
// the handheld camera: a slow float the whole time; in beat 7 it backs away and tilts up at the wall
function camPose(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c, k = EZ.io(seg(t, 52.2, 57.6)), sh = ss(53.5, 57.4, t) * (t < 57.7 ? 1 : 0);
  return {
    x: n(0.37, 1, 0.035) + n(0.93, 2, 0.015) + sh * (n(23, 0, 0.025) + n(37, 1, 0.012)),
    y: EYE + n(0.53, 0, 0.02) + n(1.31, 0.4, 0.01) + 0.05 * Math.abs(Math.sin(t * 6.4)) * k * (1 - k),
    z: CAMZ0 + 25 * k + n(0.47, 2, 0.02),
    pitch: (-4.5 + 23 * EZ.io(seg(t, 52.4, 57.4)) + n(0.41, 0.3, 0.25) + n(1.07, 1.2, 0.12) + sh * (n(31, 1, 0.35) + n(19, 2, 0.25))) * DEG,
    yaw: (n(0.29, 0.7, 0.35) + n(0.71, 2.1, 0.15) + 3 * k * Math.sin(k * Math.PI) * 0.3) * DEG,
    roll: (n(0.23, 0.2, 0.25) + n(0.83, 1.9, 0.1) + sh * n(27, 2, 0.45)) * DEG,
  };
}
// the wall's visible height: true until its crest would leave the frame, then held near the top (like the reference)
function waveVis(t) {
  const c = camPose(t), zw = waveZ(t), Hm = waveHm(t) * (1 + 3.5 * (1 - ss(17, 38, t))), cap = (21.5 + 23 * EZ.io(seg(t, 52.4, 57.4))) * DEG, tc = Math.tan(cap);
  const Hv = Math.min(Hm, (tc * (c.z - zw) + EYE) / (1.05 + 0.135 * tc));
  return { zw, Hv, Hm, shadeZ: zw + Hm * (0.12 + 1 / SUN_TAN), lit: t < 17 ? 0 : 1 };
}

// ---- the sea floor (shared by JS and GLSL): a gentle slope away from the quay, ripples and hollows
function bedH(x, z) {
  const d = Math.max(0, -z - 0.6);
  let h = -3.2 - 0.016 * d - 0.012 * Math.max(0, d - 650) - 0.0004 * x * x * ss(0, 60, d) * 0.02;
  h += 0.35 * Math.sin(x * 0.045 + z * 0.03) * Math.sin(z * 0.021 - x * 0.013) + 0.12 * Math.sin(x * 0.31 + z * 0.17) * Math.sin(z * 0.27 - x * 0.11);
  return h;
}
const BED_GLSL = `
  float bedH(vec2 p){ float d = max(0.0, -p.y - 0.6); float x = p.x, z = p.y;
    float h = -3.2 - 0.016 * d - 0.012 * max(0.0, d - 650.0) - 0.0004 * x * x * smoothstep(0.0, 60.0, d) * 0.02;
    h += 0.35 * sin(x * 0.045 + z * 0.03) * sin(z * 0.021 - x * 0.013) + 0.12 * sin(x * 0.31 + z * 0.17) * sin(z * 0.27 - x * 0.11);
    return h; }`;

// ---- small helpers
function g3Tex(draw, w = 128, h = 128, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; return t; }
const g3Radial = (stops) => g3Tex((x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); stops.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, w, w); });
const IM = (geo, mat, n, shadow = true) => { const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = shadow; m.receiveShadow = true; return m; };
const M4c = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
const wrap = (t, rx, ry) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rx) t.repeat.set(rx, ry); return t; };
// the wave's shadow: every lit material multiplies its sun light by a soft edge that sweeps towards the camera
const WSH = { value: -1e6 };
const LFB = THREE.ShaderChunk.lights_fragment_begin.replace('getDirectionalLightInfo( directionalLight, geometry, directLight );', 'getDirectionalLightInfo( directionalLight, geometry, directLight ); directLight.color *= olLit;');
function olShade(m) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uShZ = WSH;
    sh.vertexShader = 'varying vec3 vOlW;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n{ vec4 ow = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\n ow = instanceMatrix * ow;\n#endif\n vOlW = (modelMatrix * ow).xyz; }');
    sh.fragmentShader = 'uniform float uShZ; varying vec3 vOlW;\n' + sh.fragmentShader.replace('#include <lights_fragment_begin>', 'float olLit = smoothstep(uShZ - 18.0, uShZ + 18.0, vOlW.z);\n' + LFB);
  };
  return m;
}
const STD = (o) => olShade(new THREE.MeshStandardMaterial(o));

// ---- code-drawn textures
function texPaving() {   // 8 x 8 large stone tiles, grey-beige, grout, grain and stains (one tile = 1 m)
  return g3Tex((x, w) => {
    const R = RNG('pave'), n = 8, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = R.r(-14, 14), b = R.r(-6, 6); x.fillStyle = `rgb(${128 + v + b},${123 + v},${114 + v - b})`; x.fillRect(i * s, j * s, s, s);
      for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '90,84,76' : '210,204,192'},${R.r(0.03, 0.09)})`; const r = R.r(4, 26); x.beginPath(); x.ellipse(i * s + R.r(0, s), j * s + R.r(0, s), r, r * R.r(0.5, 1), R.r(0, 3), 0, TAU); x.fill(); }
      const gr = x.createLinearGradient(i * s, j * s, i * s + s, j * s + s); gr.addColorStop(0, 'rgba(255,255,255,0.05)'); gr.addColorStop(1, 'rgba(0,0,0,0.06)'); x.fillStyle = gr; x.fillRect(i * s, j * s, s, s);
    }
    for (let k = 0; k < 26000; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '60,56,50' : '235,230,220'},${R.r(0.05, 0.16)})`; x.fillRect(R.r(0, w), R.r(0, w), R.r(1, 2.2), R.r(1, 2.2)); }
    x.strokeStyle = 'rgba(58,54,50,0.85)'; x.lineWidth = 3.2;
    for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, w); x.stroke(); x.beginPath(); x.moveTo(0, i * s); x.lineTo(w, i * s); x.stroke(); }
    x.strokeStyle = 'rgba(255,250,240,0.18)'; x.lineWidth = 1.2;
    for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * s + 2.5, 0); x.lineTo(i * s + 2.5, w); x.stroke(); x.beginPath(); x.moveTo(0, i * s + 2.5); x.lineTo(w, i * s + 2.5); x.stroke(); }
  }, 1024, 1024);
}
function texQuayWall() {   // granite blocks; the lower half wet and green
  return g3Tex((x, w, h) => {
    const R = RNG('qwall'); x.fillStyle = '#8d8578'; x.fillRect(0, 0, w, h);
    const rows = 8, rh = h / rows;
    for (let r = 0; r < rows; r++) { let px = -R.r(0, 80); while (px < w) { const bw = R.r(70, 150), v = R.r(-16, 16); x.fillStyle = `rgb(${138 + v},${130 + v},${118 + v})`; x.fillRect(px + 2, r * rh + 2, bw - 4, rh - 4); px += bw; } }
    for (let k = 0; k < 9000; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '40,36,30' : '220,214,200'},${R.r(0.05, 0.15)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 3)); }
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.3, 'rgba(0,0,0,0)'); g.addColorStop(0.42, 'rgba(40,46,30,0.55)'); g.addColorStop(0.6, 'rgba(46,62,34,0.75)'); g.addColorStop(1, 'rgba(30,40,24,0.85)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 220; k++) { x.strokeStyle = `rgba(20,24,16,${R.r(0.1, 0.35)})`; x.lineWidth = R.r(1, 4); const px = R.r(0, w), py = R.r(h * 0.28, h * 0.5); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(3), py + R.r(10, 60)); x.stroke(); }
  }, 512, 512);
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
function texFacade() {   // small harbour house: white wall with windows + shutters (tinted by instance colour)
  return g3Tex((x, w, h) => {
    const R = RNG('facade'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 3000; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '120,110,100' : '255,255,255'},${R.r(0.04, 0.12)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 3)); }
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const px = 14 + c * 30, py = 12 + r * 30; x.fillStyle = '#3a3f46'; x.fillRect(px, py, 14, 18);
      x.fillStyle = '#ffffff'; x.globalAlpha = 0.35; x.fillRect(px + 2, py + 2, 4, 6); x.globalAlpha = 1;
      x.fillStyle = R.pick(['#3d6b5a', '#2f5a86', '#7a4a32', '#5a6a3a']); x.fillRect(px - 5, py, 4, 18); x.fillRect(px + 15, py, 4, 18);
    }
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, h - 6, w, 6);
  }, 128, 128);
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
let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  const ANI = r.capabilities.getMaxAnisotropy();
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xc9d8e6, 400, 16000);
  const cam = new THREE.PerspectiveCamera(64, W / H, 0.6, 26000); cam.rotation.order = 'YXZ'; scene.add(cam);
  const ENV = envCube();

  // --- sky dome (skips tone mapping so the blue stays clean)
  const skyU = { top: { value: lin('#3d70c2') }, mid: { value: lin('#79a3da') }, hor: { value: lin('#d6e4f0') }, sunCol: { value: lin('#fff4dc') }, sunDir: { value: SUNL.clone() }, dark: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(22000, 64, 32), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, mid, hor, sunCol, sunDir; uniform float dark; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, 0.0, 1.0);
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.18, pow(h, 0.8))); c = mix(c, top, smoothstep(0.12, 0.75, h));
        float a = acos(clamp(dot(d, sunDir), -1.0, 1.0));
        c += sunCol * (0.5 * exp(-a * a / 0.004) + 0.18 * exp(-a * 3.0));
        c += vec3(0.06, 0.05, 0.03) * exp(-abs(d.y) * 14.0);
        c *= 1.0 - dark;
        gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }`,
  }));
  sky.renderOrder = -1; scene.add(sky);

  // --- clouds: big cumulus behind everything (always farther than the wave), streaks low on the horizon
  const cloudTex = texCloud(), puffTex = texPuff('puff'), mistTex = texPuff('mist', 34, 0.3);
  const clouds = []; { const R = RNG('clouds'); for (let i = 0; i < 16; i++) { const lo = i < 5;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, transparent: true, depthWrite: false, opacity: lo ? 0.5 : 0.9 }));
    const ang = R.r(-0.9, 0.9), D = R.r(19000, 21000);
    s.userData = { ang, D, y: lo ? R.r(300, 900) : R.r(1600, 9000), w: lo ? R.r(5000, 9000) : R.r(3500, 7500), a: lo ? 0.18 : R.r(0.38, 0.55), v: R.r(0.0035, 0.007) * (R.f() < 0.5 ? 1 : 0.7), ph: R.r(0, 9), o: lo ? 0.45 : R.r(0.7, 0.95) };
    scene.add(s); clouds.push(s); } }

  // --- lights: a warm sun front-left, a blue sky dome, and a soft fill from behind the camera
  const hemi = new THREE.HemisphereLight(0xcfe0f4, 0x8a8070, 0.85); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.0);
  sun.target.position.set(2, DECK, -40); sun.position.copy(sun.target.position).addScaledVector(SUNL, 320); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 5; sun.shadow.blurSamples = 16;
  Object.assign(sun.shadow.camera, { left: -95, right: 95, top: 95, bottom: -95, near: 160, far: 480 }); sun.shadow.bias = -0.0005;
  const fill = new THREE.DirectionalLight(0xe8eefc, 0.45); fill.position.set(20, 40, 120); scene.add(fill);

  // --- the promenade: big stone tiles, a granite curb at the quay edge, the deck far to both sides and behind
  const paveTex = wrap(texPaving(), 1, 1); paveTex.anisotropy = ANI;
  { const g = new THREE.PlaneGeometry(600, 120, 1, 1); g.rotateX(-Math.PI / 2); g.translate(0, DECK, QZ + 60);
    const uv = g.attributes.uv, p = g.attributes.position; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 8, -p.getZ(i) / 8);
    const deck = new THREE.Mesh(g, STD({ map: paveTex, roughness: 0.82, color: 0xffffff })); deck.receiveShadow = true; scene.add(deck); var deckMat = deck.material; }
  const graniteMat = STD({ color: 0xb9b3a8, roughness: 0.7 });
  { const c = new THREE.Mesh(new THREE.BoxGeometry(600, 0.22, 0.6), graniteMat); c.position.set(0, DECK + 0.02, QZ + 0.3); c.receiveShadow = true; scene.add(c); }
  const metal = STD({ color: 0x2b3236, roughness: 0.42, metalness: 0.55, envMap: ENV, envMapIntensity: 0.6 });
  { const n = 61, posts = IM(new THREE.BoxGeometry(0.07, 1.08, 0.07), metal, n);
    for (let i = 0; i < n; i++) posts.setMatrixAt(i, M4c(-60 + i * 2, DECK + 0.54, RAILZ)); scene.add(posts);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 120, 10).rotateZ(Math.PI / 2), metal); top.position.set(0, DECK + 1.08, RAILZ); top.castShadow = true; scene.add(top);
    const midR = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 120, 6).rotateZ(Math.PI / 2), metal); midR.position.set(0, DECK + 0.58, RAILZ); midR.castShadow = true; scene.add(midR); }

  // --- the sea floor: wet sand and mud, darker hollows, weed near the quay; dense near the quay, sparse far out
  const bedTex = wrap(texBedDetail(), 1, 1); bedTex.anisotropy = ANI;
  { const nx = 150, nz = 150, g = new THREE.PlaneGeometry(2, 1, nx, nz); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, uv = g.attributes.uv, cols = [];
    const sand = lin('#6a5a44'), mud = lin('#463c2f'), light = lin('#857358'), weed = lin('#3b4a2c'), dkw = lin('#2c3424');
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i), v = 0.5 - p.getZ(i), x = Math.sign(u) * 1600 * Math.pow(Math.abs(u), 1.7), z = -0.6 - 3000 * Math.pow(v, 1.9), y = bedH(x, z);
      p.setXYZ(i, x, y, z); uv.setXY(i, x / 14, z / 14);
      const nA = 0.5 + 0.5 * Math.sin(x * 0.07 + z * 0.05) * Math.sin(z * 0.09 - x * 0.04), nB = 0.5 + 0.5 * Math.sin(x * 0.23 - z * 0.19 + 1.3);
      const c = sand.clone().lerp(light, nA * 0.5).lerp(mud, ss(0.55, 1, nB) * 0.6);
      const d = -z; c.lerp(weed.clone().lerp(dkw, nB), Math.max(ss(9, 2, d), ss(0.75, 0.95, nA * nB * 1.3) * 0.7));
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
    const bed = new THREE.Mesh(g, STD({ vertexColors: true, map: bedTex, roughness: 0.75, metalness: 0.0, envMap: ENV, envMapIntensity: 0.12 })); bed.receiveShadow = true; scene.add(bed); var bedMat = bed.material; }

  // --- the water: one shader for harbour and sea — clear over the sand near the shore, deep blue out to the horizon,
  //     sky reflection, sun glitter, foam where it meets the sand; its level drains with the story
  const seaU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uLevel: { value: 0.4 }, uSun: { value: SUNL.clone() }, uSunCol: { value: lin('#fff2dc') },
    uTop: { value: lin('#3d70c2') }, uHor: { value: lin('#d6e4f0') }, uShallow: { value: lin('#5b9a8e') }, uMid: { value: lin('#2d6f86') }, uDeep: { value: lin('#1d4c6e') }, uFar: { value: lin('#8eaac2') },
    uShZ: { value: -1e6 }, uDark: { value: 0 }, uChurn: { value: 0 } }]);
  const seaMat = new THREE.ShaderMaterial({ uniforms: seaU, fog: true, transparent: true, depthWrite: true,
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT, uLevel, uShZ, uDark, uChurn; uniform vec3 uSun, uSunCol, uTop, uHor, uShallow, uMid, uDeep, uFar; varying vec3 vW; ${BED_GLSL}
      #include <fog_pars_fragment>
      void main(){ vec2 p = vW.xz; float t = uT; float dep = uLevel - bedH(p);
        float dist = length(p - cameraPosition.xz), fine = 1.0 - smoothstep(150.0, 900.0, dist), fine2 = 1.0 - smoothstep(40.0, 260.0, dist);
        vec3 n = normalize(vec3(
          0.06 * sin(p.x * 0.11 + t * 0.9) + 0.05 * sin(p.x * 0.37 - p.y * 0.21 + t * 1.4) + fine * (0.05 * sin(p.x * 1.3 + p.y * 0.9 + t * 2.1) + 0.04 * sin(p.x * 2.9 + p.y * 1.7 + t * 2.9)) + fine2 * 0.035 * sin(p.x * 7.1 - p.y * 5.3 + t * 4.3),
          1.0,
          0.06 * sin(p.y * 0.13 - t * 0.8) + 0.05 * sin(p.y * 0.41 + p.x * 0.17 - t * 1.2) + fine * (0.05 * sin(p.y * 1.5 - p.x * 0.7 + t * 1.9) + 0.04 * sin(p.y * 3.3 - p.x * 1.1 + t * 3.1)) + fine2 * 0.035 * sin(p.y * 8.3 + p.x * 4.1 - t * 4.7)));
        n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(2500.0, 12000.0, dist)));
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n);
        float fres = 0.02 + 0.98 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
        vec3 skyR = mix(uHor, uTop, pow(clamp(Rf.y, 0.0, 1.0), 0.55));
        vec3 body = mix(uShallow, uMid, smoothstep(0.0, 3.0, dep)); body = mix(body, uDeep, smoothstep(3.0, 14.0, dep)); body = mix(body, uFar, smoothstep(1500.0, 9000.0, dist) * 0.6);
        float lit = smoothstep(uShZ - 18.0, uShZ + 18.0, vW.z);
        vec3 col = mix(body * (0.55 + 0.45 * lit), skyR, clamp(fres * 0.85, 0.0, 1.0));
        float sd = max(dot(Rf, uSun), 0.0);
        col += uSunCol * lit * (pow(sd, 700.0) * 6.0 + pow(sd, 50.0) * 0.35);
        float sw = 0.12 + 0.05 * sin(t * 0.8 + p.x * 0.03);
        float foam = exp(-dep * dep / (sw * sw)) * 0.9 * (0.6 + 0.4 * sin(p.x * 0.9 + p.y * 0.5 + t * 1.3));
        foam += uChurn * smoothstep(0.55, 1.0, sin(p.x * 0.31 + t * 2.0) * sin(p.y * 0.27 - t * 1.7 + p.x * 0.05)) * 0.4;
        col = mix(col, vec3(0.95, 0.97, 0.98) * (0.6 + 0.4 * lit), clamp(foam, 0.0, 1.0));
        col *= 1.0 - uDark;
        float al = mix(0.35, 1.0, smoothstep(0.0, 2.2, dep)); al = max(al, clamp(foam, 0.0, 1.0)); al *= smoothstep(-0.02, 0.06, dep);
        if (al < 0.01) discard;
        gl_FragColor = vec4(col, al);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }` });
  const seaGeo = new THREE.PlaneGeometry(52000, 26000, 1, 1); seaGeo.rotateX(-Math.PI / 2); seaGeo.translate(0, 0, -13000 + QZ);
  const seaMesh = new THREE.Mesh(seaGeo, seaMat); scene.add(seaMesh);
  // --- shared materials
  const concrete = STD({ color: 0xb3ada2, roughness: 0.9 }), wallTex = wrap(texQuayWall(), 1, 1);
  const quayMat = STD({ map: wallTex, roughness: 0.95 }), white = STD({ color: 0xf2efe8, roughness: 0.6 }), red = STD({ color: 0xc8372d, roughness: 0.6 });
  const wood = STD({ color: 0x7a5636, roughness: 0.85 }), dark = STD({ color: 0x23292e, roughness: 0.5, metalness: 0.3 }), glassLamp = new THREE.MeshBasicMaterial({ color: 0xfff6e0 });
  // a land block whose water-facing side runs along the line A -> B (x,z), extending `w` metres away from the water
  const landBlock = (A, B, w, side, top = DECK) => {
    const dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz), ang = Math.atan2(dx, dz), nx = -side * dz / len, nz = side * dx / len;
    const g = new THREE.BoxGeometry(w, top + 24, len); const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, uv.getX(i) * len / 14, uv.getY(i) * (top + 24) / 14);
    const m = new THREE.Mesh(g, [concrete, quayMat, concrete, concrete, quayMat, quayMat].map((mm, k) => (k === (side > 0 ? 1 : 0) ? quayMat : (k === 2 ? concrete : quayMat))));
    m.position.set((A[0] + B[0]) / 2 + nx * w / 2, (top - 24) / 2, (A[1] + B[1]) / 2 + nz * w / 2); m.rotation.y = ang; m.receiveShadow = true; scene.add(m); return m;
  };
  // left: the old harbour quay; right: the city peninsula; a jetty with a lighthouse; a breakwater
  landBlock([-38, QZ], [-170, -800], 900, -1);
  landBlock([115, -480], [175, -2600], 3000, 1, 4);
  { const j = new THREE.Mesh(new THREE.BoxGeometry(8, DECK + 24, 262), [quayMat, quayMat, concrete, concrete, quayMat, quayMat]); j.position.set(30, (DECK - 24) / 2, QZ - 131); j.receiveShadow = true; j.castShadow = true; scene.add(j);
    const uv = j.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 18, uv.getY(i) * 2); }
  { const b = new THREE.Mesh(new THREE.BoxGeometry(14, 30, 340), [quayMat, quayMat, concrete, concrete, quayMat, quayMat]); b.position.set(-128, -11, -950); b.rotation.y = -0.45; scene.add(b); }
  const lighthouse = (x, z, y0, cA, cB, hgt) => { const grp = new THREE.Group(); grp.position.set(x, y0, z); scene.add(grp);
    for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(1.5 - k * 0.12, 1.62 - k * 0.12, hgt / 5, 14), k % 2 ? cB : cA); s.position.y = hgt / 10 + k * hgt / 5; s.castShadow = true; grp.add(s); }
    const gal = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.3, 14), dark); gal.position.y = hgt + 0.15; grp.add(gal);
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 12), glassLamp); lamp.position.y = hgt + 1; grp.add(lamp);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.4, 12), cA); cap.position.y = hgt + 2.4; grp.add(cap); return grp; };
  lighthouse(30, -258, DECK, red, white, 13);
  const grn = STD({ color: 0x2f8a55, roughness: 0.6 }); lighthouse(-64, -1103, 4, grn, white, 16);

  // --- the skyline: towers with window grids (four kinds), setbacks, crowns and spires; the city towers get swallowed
  const winMats = [0, 1, 2, 3].map((k) => { const t = wrap(texWindows(k)); t.anisotropy = ANI;
    return STD({ map: t, roughness: [0.55, 0.85, 0.8, 0.5][k], metalness: [0.35, 0, 0, 0.45][k], envMap: ENV, envMapIntensity: [0.45, 0.15, 0.15, 0.55][k] }); });
  const towerBox = (w, h, d, kind) => { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, nm = g.attributes.normal;
    for (let i = 0; i < uv.count; i++) { const side = Math.abs(nm.getX(i)) > 0.5 ? d : w; uv.setXY(i, uv.getX(i) * side / 26, uv.getY(i) * h / 112); }
    return new THREE.Mesh(g, winMats[kind]); };
  const towers = [];
  { const R = RNG('towers3'), roofM = STD({ color: 0x9aa0a6, roughness: 0.8 });
    const spots = []; for (let i = 0; i < 64; i++) { const th = R.r(4.5, 15) * DEG, D = R.r(950, 2600), x = D * Math.sin(th) + 60, z = CAMZ0 - D * Math.cos(th); spots.push([x, z, D]); }
    spots.sort((a, b) => a[2] - b[2]).forEach(([x, z, D], i) => {
      const kind = R.pick([0, 0, 1, 2, 3, 0, 1]), hero = i % 7 === 3, w = R.r(26, 48), d = R.r(26, 44), h = Math.min(0.3 * D, hero ? R.r(260, 340) : R.r(70, 230) * (1 - 0.3 * (D - 520) / 1400) + R.r(0, 40));
      const grp = new THREE.Group(); grp.position.set(x, 4, z); grp.rotation.y = R.r(-0.25, 0.25); scene.add(grp);
      const b = towerBox(w, h, d, kind); b.position.y = h / 2; grp.add(b);
      let top = h;
      if (R.f() < 0.5) { const h2 = R.r(20, 60), w2 = w * R.r(0.55, 0.8), d2 = d * R.r(0.55, 0.8); const b2 = towerBox(w2, h2, d2, kind); b2.position.y = h + h2 / 2; grp.add(b2); top = h + h2; }
      const rf = new THREE.Mesh(new THREE.BoxGeometry(w * 0.4, 5, d * 0.4), roofM); rf.position.y = top + 2.5; grp.add(rf);
      if (hero || R.f() < 0.25) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.2, R.r(25, 60), 6), roofM); sp.position.y = top + 5 + sp.geometry.parameters.height / 2; grp.add(sp); top += 5 + sp.geometry.parameters.height; }
      towers.push({ grp, x, z, front: z + d / 2, h: top, w });
    });
    // low harbour sheds and two red port cranes on the city waterfront
    const shedM = STD({ color: 0xc9c2b4, roughness: 0.85 });
    for (let k = 0; k < 9; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(R.r(25, 50), R.r(8, 16), R.r(20, 40)), shedM); s.position.set(140 + R.r(0, 80), 8, -520 - k * 70 - R.r(0, 30)); scene.add(s); }
    [[-560, 0.3], [-650, -0.2]].forEach(([z, ry]) => { const c = new THREE.Group(); c.position.set(134, 4, z); c.rotation.y = ry; scene.add(c);
      for (const [lx, lz] of [[-6, -5], [6, -5], [-6, 5], [6, 5]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 32, 1.2), red); l.position.set(lx, 16, lz); c.add(l); }
      const bm = new THREE.Mesh(new THREE.BoxGeometry(70, 3, 3), red); bm.position.set(-14, 34, 0); c.add(bm);
      const hs = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 8), white); hs.position.set(0, 38, 0); c.add(hs);
      for (const lz of [-5, 5]) { const cr = new THREE.Mesh(new THREE.BoxGeometry(14, 1.5, 1.5), red); cr.position.set(0, 26, lz); c.add(cr); } }); }
  // far skyline on the left horizon (hazy) and a container ship out at sea
  { const R = RNG('farcity'), m = STD({ color: 0x8c9db0, roughness: 0.9 }), n = 40, im = IM(new THREE.BoxGeometry(1, 1, 1), m, n, false);
    for (let i = 0; i < n; i++) { const x = R.r(-2600, -700), h = R.r(40, 210) * (R.f() < 0.15 ? 1.6 : 1); im.setMatrixAt(i, M4c(x, h / 2 - 2, R.r(-5200, -4700), R.r(0, 1), R.r(40, 90), h, R.r(40, 90))); }
    scene.add(im); }
  const ship = new THREE.Group(); { const hm = STD({ color: 0x2c3e55, roughness: 0.7 }), cols = ['#c8372d', '#2f6fb0', '#e0a43a', '#3a8a5a', '#d8d4cc'];
    const h = new THREE.Mesh(new THREE.BoxGeometry(220, 14, 32), hm); h.position.y = 4; ship.add(h);
    const br = new THREE.Mesh(new THREE.BoxGeometry(18, 22, 30), white); br.position.set(-92, 22, 0); ship.add(br);
    const R = RNG('cont'); for (let i = 0; i < 9; i++) for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.BoxGeometry(17, 6, 28), STD({ color: lin(R.pick(cols)), roughness: 0.8 })); c.position.set(-70 + i * 19, 14 + k * 6, 0); ship.add(c); }
    ship.position.set(600, 0, -5200); ship.rotation.y = 0.05; scene.add(ship); }

  // --- the old harbour on the left: colourful houses with roofs, a church tower, palms along the quay
  const facadeTex = wrap(texFacade()); facadeTex.anisotropy = ANI;
  { const R = RNG('houses'), list = [];
    for (let z = -95; z > -790; z -= R.r(9, 16)) { const xq = xqAt(z); for (let row = 0; row < 3; row++) list.push([xq - 9 - row * R.r(13, 18) - R.r(0, 4), z + R.r(-3, 3), R.r(10, 15), R.r(9, 20) + row * R.r(2, 6), R.r(9, 13)]); }
    const n = list.length, hm = STD({ map: facadeTex, roughness: 0.9 }), houses = IM(new THREE.BoxGeometry(1, 1, 1), hm, n), roofs = IM(new THREE.ConeGeometry(0.75, 1, 4).rotateY(Math.PI / 4), STD({ color: 0xffffff, roughness: 0.9, flatShading: true }), n);
    const HC = ['#f2e6c9', '#e9b97a', '#d9776a', '#f4f1ea', '#9fc2c9', '#e6d27a', '#c98a5a', '#f0d6c0', '#a8c49a', '#e2a4a0'];
    { const uv = houses.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2, uv.getY(i) * 2); }
    list.forEach(([x, z, w, h, d], i) => { const yaw = -0.08 + R.n(0.03); houses.setMatrixAt(i, M4c(x, DECK + h / 2, z, yaw, d, h, w)); houses.setColorAt(i, lin(R.pick(HC)));
      roofs.setMatrixAt(i, M4c(x, DECK + h + 2, z, yaw, d * 1.05, 4, w * 1.05)); roofs.setColorAt(i, lin(R.pick(['#b5523a', '#a8472f', '#c46a48', '#8a4a3a']))); });
    scene.add(houses, roofs);
    const ch = new THREE.Group(); ch.position.set(-118, DECK, -330); scene.add(ch);
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(9, 42, 9), STD({ color: 0xe9dcc0, roughness: 0.9 })); t1.position.y = 21; ch.add(t1);
    const t2 = new THREE.Mesh(new THREE.ConeGeometry(6.6, 14, 4).rotateY(Math.PI / 4), STD({ color: 0x5f7f86, roughness: 0.7 })); t2.position.y = 49; ch.add(t2);
    const hillG = new THREE.SphereGeometry(1, 48, 16, 0, TAU, 0, Math.PI / 2); hillG.scale(420, 70, 380); const hill = new THREE.Mesh(hillG, STD({ color: 0x7d9a5a, roughness: 1 })); hill.position.set(-520, DECK - 4, -620); scene.add(hill);
    // palms on the quay
    const palms = []; for (let z = -100; z > -650; z -= R.r(30, 50)) palms.push([xqAt(z) - 3, z]);
    const trunkM = STD({ color: 0x8a7258, roughness: 1 }), leafM = STD({ color: 0x4f7a34, roughness: 0.9, side: THREE.DoubleSide, flatShading: true });
    const tr = IM(new THREE.CylinderGeometry(0.22, 0.35, 9, 6).translate(0, 4.5, 0), trunkM, palms.length), lf = IM(new THREE.ConeGeometry(3.4, 1.6, 7, 1, true).translate(0, -0.6, 0), leafM, palms.length);
    palms.forEach(([x, z], i) => { tr.setMatrixAt(i, M4c(x, DECK, z, 0, 1, 1, 1, R.n(0.06), R.n(0.08))); lf.setMatrixAt(i, M4c(x, DECK + 9.2, z, R.r(0, 3), 1, 1, 1)); });
    scene.add(tr, lf); }
  // --- boats: swept hulls with a waterline stripe and antifouling, superstructures by kind; they float, then settle on the mud
  const hullMat = STD({ vertexColors: true, roughness: 0.45, side: THREE.DoubleSide, flatShading: true, envMap: ENV, envMapIntensity: 0.35 });
  function hullGeo(L, B, D, c) {
    const PR = [[1, 0.2, 0.8], [1, 0.4, 0.95], [1, 0.48, 0.98], [1, 0.75, 1], [1, 1, 1]];
    const across = [...PR.slice().reverse().map(([s, h, w]) => [-1, h, w]), [0, 0, 0], ...PR];
    const NS = 16, ring = [];
    for (let i = 0; i <= NS; i++) { const a = i / NS, x = (a - 0.5) * L;
      const bw = B / 2 * (a < 0.6 ? 0.86 + 0.14 * Math.sin(a / 0.6 * Math.PI / 2) : Math.pow(Math.max(0, Math.cos((a - 0.6) / 0.4 * Math.PI / 2)), 0.7));
      const sheer = D * (1 + 0.25 * a * a), keel = a > 0.72 ? (a - 0.72) / 0.28 * D * 0.6 : 0;
      ring.push(across.map(([s, hf, wf]) => [x, lerp(keel, sheer, hf), s * bw * wf])); }
    const pos = [], col = [], tri = (A, Bv, Cv, cc) => { pos.push(...A, ...Bv, ...Cv); for (let k = 0; k < 3; k++) col.push(cc.r, cc.g, cc.b); };
    const cBot = lin(c.bot), cStr = lin(c.stripe), cTop = lin(c.top), cDeck = lin(c.deck);
    for (let i = 0; i < NS; i++) for (let k = 0; k < across.length - 1; k++) {
      const h = Math.min(across[k][1], across[k + 1][1]), cc = h < 0.4 ? cBot : h < 0.48 ? cStr : cTop;
      tri(ring[i][k], ring[i + 1][k], ring[i + 1][k + 1], cc); tri(ring[i][k], ring[i + 1][k + 1], ring[i][k + 1], cc); }
    const last = across.length - 1, dk = (p) => [p[0], p[1] - 0.06, p[2]];
    for (let i = 0; i < NS; i++) { tri(dk(ring[i][0]), dk(ring[i + 1][0]), dk(ring[i + 1][last]), cDeck); tri(dk(ring[i][0]), dk(ring[i + 1][last]), dk(ring[i][last]), cDeck); }
    const r0 = ring[0], ctr = [r0[0][0], D * 0.5, 0]; for (let k = 0; k < last; k++) tri(ctr, r0[k], r0[k + 1], cTop);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
  }
  const boats = [];
  function makeBoat(kind, L, x, z, yaw, ph) {
    const grp = new THREE.Group(), B = L * (kind === 'sail' ? 0.32 : 0.36), D = L * (kind === 'dinghy' ? 0.16 : 0.2);
    const C = { trawler: { top: '#c8372d', stripe: '#f2efe8', bot: '#2b2f33', deck: '#8a8072' }, yacht: { top: '#f4f2ec', stripe: '#1f3a5f', bot: '#1f3a5f', deck: '#b89a72' },
      sail: { top: '#f4f2ec', stripe: '#2f6fb0', bot: '#7a2a24', deck: '#c4a67c' }, dinghy: { top: '#e8662e', stripe: '#f4f2ec', bot: '#3a3f44', deck: '#d8d0c0' }, fish: { top: '#2f6fb0', stripe: '#f4f2ec', bot: '#8a2a22', deck: '#9a9080' } }[kind];
    const hull = new THREE.Mesh(hullGeo(L, B, D, C), hullMat); hull.castShadow = true; hull.receiveShadow = true; grp.add(hull);
    const box = (w, h, d, m, px, py, pz) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(px, py, pz); b.castShadow = true; grp.add(b); return b; };
    if (kind === 'trawler') { box(L * 0.22, D * 1.1, B * 0.62, white, -L * 0.12, D * 1.55, 0); box(L * 0.225, D * 0.28, B * 0.64, dark, -L * 0.12, D * 1.75, 0);
      box(0.18, L * 0.55, 0.18, dark, L * 0.18, D + L * 0.27, 0); box(0.12, 0.12, B * 1.8, dark, L * 0.18, D + L * 0.42, 0).rotation.x = 0.2;
      box(L * 0.4, 0.1, 0.1, dark, L * 0.05, D + L * 0.3, 0).rotation.z = -0.5; box(0.5, 0.5, 0.5, STD({ color: 0xf08a2a, roughness: 0.6 }), L * 0.3, D * 1.2, B * 0.3); }
    else if (kind === 'yacht') { box(L * 0.45, D * 0.8, B * 0.7, white, -L * 0.02, D * 1.35, 0); box(L * 0.46, D * 0.3, B * 0.72, dark, -L * 0.02, D * 1.45, 0); box(L * 0.25, D * 0.5, B * 0.55, white, -L * 0.1, D * 1.95, 0); }
    else if (kind === 'sail') { box(L * 0.3, D * 0.45, B * 0.55, white, -L * 0.05, D * 1.2, 0); box(0.12, L * 1.35, 0.12, white, L * 0.08, D + L * 0.67, 0);
      const boom = box(L * 0.42, 0.18, 0.18, STD({ color: 0x2f5f9a, roughness: 0.7 }), -L * 0.12, D + 1.6, 0); boom.scale.set(1, 2.2, 2.2); }
    else if (kind === 'fish') box(L * 0.22, D * 1.2, B * 0.6, white, -L * 0.15, D * 1.5, 0);
    grp.rotation.order = 'YXZ'; scene.add(grp);
    boats.push({ grp, x, z, yaw, D, L, ph, roll: (ph * 7.3) % 2 < 1 ? 1 : -1 });
  }
  boatList().forEach((b) => makeBoat(...b));

  // --- what the drained sea floor shows: rocks (riprap by the quay, boulders), weed, tyres, crates, puddles, fish
  const R0 = RNG('bedstuff');
  const rockM = STD({ color: 0xffffff, roughness: 0.9, flatShading: true }), nR = 340, rocks = IM(new THREE.DodecahedronGeometry(1, 0), rockM, nR);
  for (let i = 0; i < nR; i++) { const near = i < 120, z = near ? -R0.r(1, 9) : -R0.r(24, 320), x = near ? R0.r(-60, 40) : R0.n(0.3 * -z + 6), s = near ? R0.r(0.6, 1.6) : R0.r(0.15, 0.9) * (R0.f() < 0.1 ? 2.5 : 1);
    rocks.setMatrixAt(i, M4c(x, bedH(x, z) + s * 0.25, z, R0.r(0, 3), s * R0.r(0.8, 1.6), s * R0.r(0.45, 0.8), s * R0.r(0.8, 1.4), R0.r(0, 1), R0.r(0, 1)));
    rocks.setColorAt(i, lin(R0.pick(['#6f675c', '#5d564d', '#857c6e', '#4b4a3c', '#3f4a30', '#55603a']))); }
  scene.add(rocks);
  const weedM = STD({ color: 0xffffff, roughness: 0.6, metalness: 0.1, envMap: ENV, envMapIntensity: 0.4 }), nW = 260, weeds = IM(new THREE.ConeGeometry(0.18, 1, 4).rotateX(Math.PI / 2).scale(1, 0.25, 1), weedM, nW, false);
  for (let i = 0; i < nW; i++) { const z = -R0.r(22, 200), x = R0.n(0.3 * -z + 5), s = R0.r(0.6, 2.2); weeds.setMatrixAt(i, M4c(x, bedH(x, z) + 0.04, z, R0.r(0, TAU), s, s, s * R0.r(1, 2.5))); weeds.setColorAt(i, lin(R0.pick(['#2e3a1e', '#3c4a22', '#4a4a26', '#25301a']))); }
  scene.add(weeds);
  const debM = STD({ color: 0xffffff, roughness: 0.8 }), tyres = IM(new THREE.TorusGeometry(0.4, 0.16, 6, 12).rotateX(Math.PI / 2), debM, 14), crates = IM(new THREE.BoxGeometry(1, 0.7, 0.8), debM, 10);
  for (let i = 0; i < 14; i++) { const z = -R0.r(26, 140), x = R0.n(0.25 * -z + 4); tyres.setMatrixAt(i, M4c(x, bedH(x, z) + 0.12, z, 0, 1, 1, 1, R0.n(0.3), R0.n(0.3))); tyres.setColorAt(i, lin('#1c1c1e')); }
  for (let i = 0; i < 10; i++) { const z = -R0.r(26, 160), x = R0.n(0.25 * -z + 4); crates.setMatrixAt(i, M4c(x, bedH(x, z) + 0.25, z, R0.r(0, 3), 1, 1, 1, R0.n(0.4), R0.n(0.4))); crates.setColorAt(i, lin(R0.pick(['#6a4a30', '#2f6fb0', '#c8372d']))); }
  scene.add(tyres, crates);
  const puddleM = STD({ color: 0x55687a, roughness: 0.08, metalness: 0.8, envMap: ENV, envMapIntensity: 0.6, transparent: true, opacity: 0.75 });
  const nP = 70, puddles = IM(new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2), puddleM, nP, false), pud = [];
  for (let i = 0; i < nP; i++) { const z = -R0.r(26, 420), x = R0.n(0.28 * -z + 5), sx = R0.r(1.5, 9) * (1 + -z / 250), sz = sx * R0.r(0.3, 0.7), y = bedH(x, z) + 0.06; pud.push({ x, z, y, sx, sz, ry: R0.r(0, 3) }); }
  scene.add(puddles);
  const fishM = STD({ color: 0xc9d2d8, roughness: 0.25, metalness: 0.65, envMap: ENV, envMapIntensity: 1.0 });
  const nF = 70, fishB = IM(new THREE.SphereGeometry(1, 12, 8).scale(0.5, 0.13, 0.17), fishM, nF), fishT = IM(new THREE.ConeGeometry(0.16, 0.3, 4).rotateZ(Math.PI / 2).scale(1, 1, 0.25).translate(-0.62, 0, 0), fishM, nF), fish = [];
  for (let i = 0; i < nF; i++) { const z = -R0.r(27, 110), x = R0.n(0.22 * -z + 2); fish.push({ x, z, y: bedH(x, z), s: R0.r(1.0, 1.8), ry: R0.r(0, TAU), ph: R0.r(0, 9), per: R0.r(1.2, 3.2) }); fishB.setColorAt(i, lin(R0.pick(['#c9d2d8', '#b8c4cc', '#d8dcd6', '#9fb0ba']))); fishT.setColorAt(i, lin('#8a98a2')); }
  scene.add(fishB, fishT);

  // --- the promenade furniture: globe lamps, benches, life rings, bollards, trees in planters, flags
  const ironM = STD({ color: 0x1f2528, roughness: 0.5, metalness: 0.4 }), globeM = olShade(new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2dc, emissiveIntensity: 0.25, roughness: 0.3 }));
  const orange = STD({ color: 0xf06a22, roughness: 0.55 }), slatM = STD({ color: 0x8a6440, roughness: 0.8 }), planterM = STD({ color: 0xa69f92, roughness: 0.9 }), leafM2 = STD({ color: 0x4d7a36, roughness: 0.9, flatShading: true });
  const add = (parent, geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
  const grpAt = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, DECK, z); g.rotation.y = ry; scene.add(g); return g; };
  const lamp = (x, z) => { const g = grpAt(x, z); add(g, new THREE.CylinderGeometry(0.15, 0.22, 0.8, 10), ironM, 0, 0.4, 0); add(g, new THREE.CylinderGeometry(0.055, 0.075, 4.3, 8), ironM, 0, 2.9, 0);
    add(g, new THREE.CylinderGeometry(0.1, 0.06, 0.18, 8), ironM, 0, 5.1, 0); add(g, new THREE.SphereGeometry(0.3, 16, 12), globeM, 0, 5.45, 0); };
  const bench = (x, z, ry) => { const g = grpAt(x, z, ry);
    for (let k = 0; k < 3; k++) add(g, new THREE.BoxGeometry(1.9, 0.04, 0.11), slatM, 0, 0.45, -0.14 + k * 0.14);
    for (let k = 0; k < 2; k++) add(g, new THREE.BoxGeometry(1.9, 0.11, 0.035), slatM, 0, 0.65 + k * 0.16, -0.26, -0.18);
    for (const lx of [-0.8, 0.8]) { add(g, new THREE.BoxGeometry(0.06, 0.45, 0.5), ironM, lx, 0.22, 0); add(g, new THREE.BoxGeometry(0.06, 0.5, 0.06), ironM, lx, 0.7, -0.27, -0.18); } };
  const ring = (x, y, z, ry) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g); add(g, new THREE.TorusGeometry(0.3, 0.07, 10, 28), orange, 0, 0, 0);
    for (let k = 0; k < 4; k++) add(g, new THREE.TorusGeometry(0.301, 0.074, 10, 6, 0.32), white, 0, 0, 0, 0, 0, k * Math.PI / 2 + 0.6); return g; };
  const ringStand = (x, z, ry) => { const g = grpAt(x, z, ry); add(g, new THREE.BoxGeometry(0.09, 1.55, 0.09), white, 0, 0.78, 0); add(g, new THREE.BoxGeometry(0.75, 0.75, 0.05), white, 0, 1.2, -0.06); ring(x, DECK + 1.2, z + 0.02, ry); };
  const tree = (x, z, s, key) => { const R = RNG(key), g = grpAt(x, z); add(g, new THREE.CylinderGeometry(0.75, 0.7, 0.5, 14), planterM, 0, 0.25, 0); add(g, new THREE.CylinderGeometry(0.1, 0.14, 2.6 * s, 7), STD({ color: 0x6a5240, roughness: 1 }), 0, 1.3 * s + 0.4, 0);
    for (let k = 0; k < 3; k++) { const m = add(g, new THREE.IcosahedronGeometry(1.25 * s * R.r(0.75, 1.05), 1), leafM2, R.n(0.5), (2.9 + R.r(0, 0.9)) * s, R.n(0.5), R.r(0, 3), R.r(0, 3)); m.scale.y = 0.85; } };
  lamp(1.55, 0.35); lamp(-14, 0.35); lamp(18, 0.35);
  bench(1.75, 1.05, Math.PI); ringStand(-1.5, 0.15, 0);
  // the foreground's life: a bicycle against the railing, a drain grate, a puddle, wear and stains, leaves, things dropped in the panic
  const bike = new THREE.Group(); { const bm = STD({ color: 0x2a8a86, roughness: 0.4, metalness: 0.4 }), tyre = STD({ color: 0x18191b, roughness: 0.8 });
    for (const wx of [-0.52, 0.52]) { add(bike, new THREE.TorusGeometry(0.33, 0.028, 8, 32), tyre, wx, 0.35, 0); add(bike, new THREE.TorusGeometry(0.3, 0.008, 4, 24), ironM, wx, 0.35, 0); add(bike, new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8), ironM, wx, 0.35, 0, Math.PI / 2); }
    const tube = (a, b, r = 0.022) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A), m = add(bike, new THREE.CylinderGeometry(r, r, d.length(), 8), bm, 0, 0, 0); m.position.copy(A).add(Bv).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); };
    tube([-0.52, 0.35, 0], [-0.05, 0.33, 0]); tube([-0.52, 0.35, 0], [-0.17, 0.85, 0]); tube([-0.05, 0.33, 0], [-0.17, 0.85, 0], 0.026); tube([-0.05, 0.33, 0], [0.4, 0.82, 0], 0.028); tube([-0.17, 0.85, 0], [0.42, 0.86, 0], 0.024);
    tube([0.52, 0.35, 0], [0.42, 0.95, 0]); tube([0.42, 0.95, -0.24], [0.42, 0.95, 0.24], 0.015); add(bike, new THREE.BoxGeometry(0.24, 0.05, 0.1), dark, -0.2, 0.9, 0);
    add(bike, new THREE.CylinderGeometry(0.06, 0.06, 0.06, 10), ironM, -0.05, 0.33, 0, Math.PI / 2);
    bike.position.set(-0.45, DECK, -0.05); bike.rotation.set(0, 0.04, 0.09); scene.add(bike); }
  const decal = (tex, x, z, w, d, op = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), STD({ map: tex, transparent: true, opacity: op, depthWrite: false, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 })); m.position.set(x, DECK + 0.005, z); m.receiveShadow = true; scene.add(m); return m; };
  decal(g3Tex((x, w) => { const R = RNG('stains'); for (let i = 0; i < 46; i++) { const px = R.r(0, w), py = R.r(0, w), r = R.r(8, 60); const gg = x.createRadialGradient(px, py, 0, px, py, r); const c = R.pick(['40,34,28', '60,50,40', '30,30,30', '90,80,60']); gg.addColorStop(0, `rgba(${c},${R.r(0.08, 0.22)})`); gg.addColorStop(1, `rgba(${c},0)`); x.fillStyle = gg; x.fillRect(px - r, py - r, 2 * r, 2 * r); }
    for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(30,28,26,${R.r(0.25, 0.5)})`; x.beginPath(); x.arc(R.r(0, w), R.r(0, w), R.r(1.5, 3.5), 0, TAU); x.fill(); }
    for (let i = 0; i < 26; i++) { x.strokeStyle = `rgba(255,252,240,${R.r(0.05, 0.12)})`; x.lineWidth = R.r(4, 14); x.beginPath(); const px = R.r(0, w), py = R.r(0, w); x.moveTo(px, py); x.lineTo(px + R.n(60), py + R.n(60)); x.stroke(); } }, 512, 512), 0, 2.6, 12, 6.2);
  decal(g3Tex((x, w) => { x.fillStyle = '#1c1d1e'; x.fillRect(4, 4, w - 8, w - 8); x.fillStyle = '#4a4b4c'; for (let i = 0; i < 9; i++) x.fillRect(12 + i * 12.6, 12, 6, w - 24); x.strokeStyle = '#6a6b6c'; x.lineWidth = 4; x.strokeRect(4, 4, w - 8, w - 8); }, 128, 128), 0.55, 3.1, 0.55, 0.55);
  { const pg = new THREE.ShapeGeometry(new THREE.Shape([[0, 0], [0.5, -0.1], [0.85, 0.12], [0.7, 0.42], [0.3, 0.5], [-0.05, 0.34]].map(([a, b]) => new THREE.Vector2(a, b))), 12); pg.rotateX(-Math.PI / 2);
    const pud = new THREE.Mesh(pg, STD({ color: 0x5d6d7a, roughness: 0.04, metalness: 0.85, envMap: ENV, envMapIntensity: 0.9, transparent: true, opacity: 0.8, polygonOffset: true, polygonOffsetFactor: -3 })); pud.position.set(-1.0, DECK + 0.007, 3.0); pud.scale.set(1.2, 1, 0.9); scene.add(pud); }
  const dropped = new THREE.Group(); { const bagM = STD({ color: 0xa8322c, roughness: 0.6 }), umbM = STD({ color: 0xf0c33c, roughness: 0.6 }), hatM = STD({ color: 0xe8dcc0, roughness: 0.9 });
    add(dropped, new THREE.BoxGeometry(0.34, 0.24, 0.14), bagM, 0.35, 0.07, 2.55, 0, 0.4, Math.PI / 2 - 0.2); add(dropped, new THREE.TorusGeometry(0.1, 0.012, 6, 16, Math.PI), dark, 0.5, 0.04, 2.6, -Math.PI / 2, 0.4, 0);
    add(dropped, new THREE.CylinderGeometry(0.035, 0.035, 0.8, 8), umbM, -0.75, 0.05, 2.9, 0, 0.9, Math.PI / 2); add(dropped, new THREE.ConeGeometry(0.07, 0.35, 8), umbM, -0.35, 0.05, 3.12, 0, 0.9, -Math.PI / 2);
    add(dropped, new THREE.CylinderGeometry(0.2, 0.2, 0.012, 20), hatM, 0.95, 0.01, 3.4); add(dropped, new THREE.SphereGeometry(0.1, 12, 8, 0, TAU, 0, Math.PI / 2), hatM, 0.95, 0.01, 3.4); scene.add(dropped); }
  const nLeaf = 80, leaves = IM(new THREE.ShapeGeometry(new THREE.Shape([[0, 0], [0.04, 0.03], [0.05, 0.08], [0, 0.12], [-0.05, 0.08], [-0.04, 0.03]].map(([a, b]) => new THREE.Vector2(a, b)))).rotateX(-Math.PI / 2), STD({ color: 0xffffff, roughness: 0.9, side: THREE.DoubleSide }), nLeaf, false), leaf = [];
  { const R = RNG('leaves'); for (let i = 0; i < nLeaf; i++) { leaf.push({ x: R.r(-4, 4), z: R.r(-0.1, 4.2), r: R.r(0, TAU), s: R.r(0.55, 1.0), v: R.r(0.6, 1.4), ph: R.r(0, 9) }); leaves.setColorAt(i, lin(R.pick(['#8a6a32', '#7a4a22', '#6a4a2a', '#9a7a3a', '#5a5030']))); } scene.add(leaves); }
  const shTex = g3Radial([[0, 'rgba(20,24,30,0.5)'], [0.6, 'rgba(20,24,30,0.2)'], [1, 'rgba(20,24,30,0)']]);
  const gullSh = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.35).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })); scene.add(m); return m; });
  // a small dog that walks with its owner, sits to look at the sea, then bolts
  const dog = new THREE.Group(), dogLegs = []; { const fur = STD({ color: 0xb07a44, roughness: 0.9 }), furD = STD({ color: 0x5a3a22, roughness: 0.9 });
    add(dog, new THREE.CapsuleGeometry(0.12, 0.36, 4, 10).rotateZ(Math.PI / 2).scale(1, 1, 0.9), fur, 0, 0.36, 0, 0, Math.PI / 2, 0);
    const head = add(dog, new THREE.SphereGeometry(0.11, 12, 10), fur, 0, 0.52, 0.3); add(dog, new THREE.BoxGeometry(0.08, 0.07, 0.12), fur, 0, 0.49, 0.42); add(dog, new THREE.SphereGeometry(0.025, 8, 6), dark, 0, 0.51, 0.48);
    for (const ex of [-0.06, 0.06]) add(dog, new THREE.ConeGeometry(0.04, 0.1, 6), furD, ex, 0.62, 0.27, -0.3, 0, ex * 3);
    for (const [lx, lz] of [[-0.07, 0.18], [0.07, 0.18], [-0.07, -0.18], [0.07, -0.18]]) { const p = new THREE.Group(); p.position.set(lx, 0.32, lz); dog.add(p); add(p, new THREE.CylinderGeometry(0.03, 0.025, 0.32, 6).translate(0, -0.16, 0), fur, 0, 0, 0); dogLegs.push(p); }
    const tail = new THREE.Group(); tail.position.set(0, 0.42, -0.26); dog.add(tail); add(tail, new THREE.CylinderGeometry(0.02, 0.012, 0.22, 6).translate(0, 0.11, 0), fur, 0, 0, 0, -0.6); dog.userData = { head, tail };
    scene.add(dog); }
  for (let x = -27; x <= 27; x += 6) { if (Math.abs(x) < 4) continue; const b = grpAt(x, QZ + 0.32); add(b, new THREE.CylinderGeometry(0.17, 0.2, 0.42, 10), ironM, 0, 0.21, 0); add(b, new THREE.SphereGeometry(0.2, 10, 6, 0, TAU, 0, Math.PI / 2), ironM, 0, 0.42, 0); }
  // behind the camera, for the retreat: lamps, benches, trees, a ring stand, flags
  lamp(2.7, 13); lamp(-2.8, 19); lamp(2.7, 25); lamp(-2.8, 31); lamp(2.7, 37);
  bench(-3.3, 15.5, Math.PI / 2); bench(3.4, 21, -Math.PI / 2); bench(-3.3, 27.5, Math.PI / 2);
  tree(4.2, 16.5, 1.1, 't1'); tree(-4.4, 22.5, 1.0, 't2'); tree(4.3, 29.5, 1.15, 't3'); tree(-4.3, 35, 1.05, 't4'); tree(5.5, 38, 1.2, 't5');
  ringStand(-2.3, 9.5, Math.PI); ring(-9, DECK + 0.8, RAILZ + 0.05, 0); ring(9.5, DECK + 0.8, RAILZ + 0.05, 0);
  const flags = []; [[-4.2, 18.5, '#f4f2ec'], [4.8, 26.5, '#2f6fb0'], [-5.2, 4.5, '#f4f2ec']].forEach(([x, z, c], i) => { const g = grpAt(x, z); add(g, new THREE.CylinderGeometry(0.04, 0.05, 7, 6), white, 0, 3.5, 0);
    const fg = new THREE.PlaneGeometry(1.7, 1.05, 12, 6); fg.translate(0.85, 0, 0); const fm = new THREE.Mesh(fg, STD({ color: lin(c), side: THREE.DoubleSide, roughness: 0.8 })); fm.position.set(0, 6.4, 0); fm.castShadow = true; g.add(fm);
    flags.push({ m: fm, base: Float32Array.from(fg.attributes.position.array), ph: i * 1.7 }); });

  // --- people: smooth instanced bodies in everyday clothes (shirt, trousers or shorts, sleeves, hair), with roles
  const SHIRT = ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#f4f1ea', '#7b4fc9', '#ef8a3a', '#3cae5c', '#1f2d3d', '#9fc2e0', '#c2185b'];
  const PANTS = ['#2b3a55', '#3a3a3a', '#c8b89a', '#1f2d3d', '#6a7a8a', '#4a5a3a', '#e8e2d6'], SKIN = ['#f3cfae', '#e8bb94', '#d4a07a', '#b07a54', '#8a5a3a', '#5e3a26'], HAIR = ['#2a1d16', '#4a3020', '#7a5230', '#c9a060', '#1a1a1a', '#8a4a2a', '#b8b0a8'];
  const RP = RNG('people2'), ppl = [];
  const person = (role, x, z, o = {}) => { const kid = o.kid ?? RP.f() < 0.08, shirt = RP.pick(SHIRT), skin = RP.pick(SKIN), shorts = RP.f() < 0.35;
    ppl.push(Object.assign({ role, x, z, yaw: 0, kid, s: kid ? RP.r(0.6, 0.72) : RP.r(0.92, 1.08), w: RP.r(0.9, 1.2), ph: RP.r(0, TAU),
      c: (() => { const pants = lin(RP.pick(PANTS)), longS = RP.f() < 0.45; return { skin: lin(skin), shirt: lin(shirt), pants, shin: shorts ? lin(skin) : pants, sleeve: lin(shirt), fore: longS ? lin(shirt) : lin(skin),
        shoe: lin(RP.pick(['#1e1e22', '#f2f0ea', '#5a4030', '#2f4a6a', '#c8372d'])), hair: lin(RP.pick(HAIR)) }; })(), longHair: RP.f() < 0.4,
      v: 0, stopT: RP.r(6.8, 12.5), look: RP.n(0.35), runT: RP.r(26.6, 33.5), rv: RP.r(3.6, 6.2), rdx: RP.n(0.3), rdz: 1, point: RP.f() < 0.3, pointT: RP.r(18, 23) }, o)); };
  // near the railing: walkers crossing, one woman at the rail, two on the bench
  person('walk', -9.0, 0.7, { v: 1.05, stopT: 8.4, runT: 27.4, kid: false, dog: true });
  for (let i = 0; i < 9; i++) { const z = RP.r(0.3, 0.95); person('walk', RP.r(-14, 14), z, { v: (RP.f() < 0.5 ? 1 : -1) * RP.r(0.95, 1.45) }); }
  person('stand', -1.05, 0.18, { yaw: Math.PI + 0.1, kid: false, runT: 27.2 }); person('stand', 1.2, 0.2, { yaw: Math.PI - 0.15, kid: true, runT: 27.0, point: true, pointT: 9.0 });
  // the jetty: strollers and anglers; the old quay: strollers; extra runners from both sides; late runners in the retreat
  for (let i = 0; i < 28; i++) { const z = -RP.r(85, 250); if (i % 2) person('jwalk', RP.r(27.5, 32.5), z, { v: (RP.f() < 0.5 ? 1 : -1) * RP.r(0.9, 1.4), rdx: 0 }); else person('stand', 26.7, z, { yaw: -Math.PI / 2 + RP.n(0.3), rdx: 0 }); }
  for (let i = 0; i < 44; i++) { const z = -RP.r(130, 620), xq = xqAt(z); person(RP.f() < 0.5 ? 'jwalk' : 'stand', xq - RP.r(1.5, 7), z, { yaw: Math.PI / 2 + RP.n(0.6), v: (RP.f() < 0.5 ? 1 : -1) * RP.r(0.8, 1.3), rdx: -1, rdz: 0.25, quay: true }); }
  for (let i = 0; i < 16; i++) { const sd = i % 2 ? 1 : -1, z = RP.r(0.3, 3.2); person('runner', sd * RP.r(3.2, 11), z, { runT: RP.r(27, 36), rdx: -sd * RP.r(0.05, 0.3), rv: RP.r(4.2, 6.5) }); }
  for (let i = 0; i < 5; i++) { const sd = i % 2 ? 1 : -1; person('runner', sd * RP.r(1.6, 4.5), RP.r(0.4, 3), { runT: 50.5 + i * 0.8, rdx: -sd * RP.r(0.02, 0.12), rv: RP.r(6.8, 7.8), kid: false }); }
  const N = ppl.length;
  // cloth: soft fold streaks along the limbs and the torso (lathe UVs run around / along), multiplied by each instance colour
  const foldTex = g3Tex((x, w, h) => { x.fillStyle = '#f4f4f4'; x.fillRect(0, 0, w, h); const R = RNG('folds');
    for (let i = 0; i < 26; i++) { const px = R.r(0, w), ww = R.r(3, 12), g = x.createLinearGradient(px - ww, 0, px + ww, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, `rgba(0,0,0,${R.r(0.08, 0.2)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - ww, R.r(0, h * 0.4), ww * 2, R.r(h * 0.3, h)); }
    for (let i = 0; i < 10; i++) { x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(R.r(0, w), 0, R.r(2, 5), h); }
    const sh = x.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(0,0,0,0.12)'); sh.addColorStop(0.15, 'rgba(0,0,0,0)'); sh.addColorStop(0.85, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.18)'); x.fillStyle = sh; x.fillRect(0, 0, w, h); }, 128, 128);
  const clothM = STD({ map: foldTex, roughness: 0.88 }), skinM = STD({ roughness: 0.55 }), hairM = STD({ roughness: 0.7 }), shoeM = STD({ roughness: 0.5 });
  const lathe = (pts, seg = 12) => new THREE.LatheGeometry(pts.slice().sort((a, b) => a[1] - b[1]).map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const PG = {
    thigh: [lathe([[0.001, 0.03], [0.07, 0.025], [0.09, -0.02], [0.084, -0.12], [0.068, -0.32], [0.058, -0.44], [0.001, -0.46]]), 2, 'pants', clothM],
    shin: [lathe([[0.001, 0.01], [0.057, 0.0], [0.056, -0.1], [0.046, -0.28], [0.037, -0.41], [0.001, -0.43]]), 2, 'shin', clothM],
    shoe: [new THREE.CapsuleGeometry(0.05, 0.13, 4, 8).rotateX(Math.PI / 2).scale(1.1, 0.72, 1).translate(0, -0.43, 0.055), 2, 'shoe', shoeM],
    uarm: [lathe([[0.001, 0.02], [0.06, 0.0], [0.053, -0.12], [0.044, -0.28], [0.001, -0.3]], 10), 2, 'sleeve', clothM],
    farm: [lathe([[0.001, 0.0], [0.043, -0.005], [0.04, -0.12], [0.032, -0.25], [0.001, -0.26]], 10), 2, 'fore', clothM],
    hand: [new THREE.SphereGeometry(0.047, 10, 8).scale(0.75, 1.25, 0.55).translate(0, -0.3, 0), 2, 'skin', skinM],
    torso: [lathe([[0.001, -0.02], [0.15, 0.0], [0.142, 0.08], [0.158, 0.22], [0.19, 0.35], [0.175, 0.42], [0.09, 0.47], [0.001, 0.48]], 16).scale(1, 1, 0.62), 1, 'shirt', clothM],
    hips: [new THREE.CylinderGeometry(0.155, 0.165, 0.2, 14).scale(1, 1, 0.72), 1, 'pants', clothM],
    neck: [new THREE.CylinderGeometry(0.045, 0.05, 0.1, 8), 1, 'skin', skinM],
    head: [new THREE.SphereGeometry(0.11, 16, 12).scale(0.92, 1.08, 1), 1, 'skin', skinM],
    hair: [new THREE.SphereGeometry(0.118, 16, 8, 0, TAU, 0, Math.PI * 0.56).scale(0.96, 1.08, 1.04), 1, 'hair', hairM],
    hairB: [new THREE.SphereGeometry(0.1, 12, 8).scale(1.05, 1.5, 0.6), 1, 'hair', hairM],
  };
  const PM = {}; for (const k in PG) { const [geo, n, , mat] = PG[k]; const m = IM(geo, mat, N * n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); PM[k] = m; }
  ppl.forEach((q, i) => { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PM[k].setColorAt(i * PG[k][1] + j, q.c[PG[k][2]]); });

  // --- THE WAVE: a swept wall (front toe skirt, concave face, overhanging lip, rounded crest, back slope), rebuilt each frame
  const WNX = 96, WNS = 46, WPROF = [[0.34, -0.02], [0.14, 0.03], [0.035, 0.12], [0.0, 0.3], [0.008, 0.5], [0.035, 0.7], [0.08, 0.86], [0.122, 0.955], [0.135, 1.005], [0.11, 1.04], [0.05, 1.055], [-0.04, 1.035], [-0.3, 0.9], [-1.0, 0.52], [-2.3, 0.15]];
  const wProf = [], wArc = [0];
  for (let j = 0; j < WNS; j++) { const u = j / (WNS - 1) * (WPROF.length - 1), i = Math.min(WPROF.length - 2, Math.floor(u)), f = u - i, P = (k) => WPROF[Math.max(0, Math.min(WPROF.length - 1, k))];
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
    wProf.push([cr(P(i - 1)[0], P(i)[0], P(i + 1)[0], P(i + 2)[0]), cr(P(i - 1)[1], P(i)[1], P(i + 1)[1], P(i + 2)[1])]);
    if (j) wArc.push(wArc[j - 1] + Math.hypot(wProf[j][0] - wProf[j - 1][0], wProf[j][1] - wProf[j - 1][1])); }
  const wX = []; for (let i = 0; i < WNX; i++) { const u = i / (WNX - 1) * 2 - 1; wX.push(Math.sign(u) * 7000 * Math.pow(Math.abs(u), 1.7)); }
  const wGeo = new THREE.BufferGeometry(), wPos = new Float32Array(WNX * WNS * 3), wUv = new Float32Array(WNX * WNS * 2), wYn = new Float32Array(WNX * WNS), wIdx = [];
  for (let i = 0; i < WNX; i++) for (let j = 0; j < WNS; j++) wYn[i * WNS + j] = wProf[j][1];
  for (let i = 0; i < WNX - 1; i++) for (let j = 0; j < WNS - 1; j++) { const a = i * WNS + j, b = a + WNS; wIdx.push(a, b, a + 1, b, b + 1, a + 1); }
  wGeo.setIndex(wIdx); wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3)); wGeo.setAttribute('uv', new THREE.BufferAttribute(wUv, 2)); wGeo.setAttribute('aYn', new THREE.BufferAttribute(wYn, 1));
  const streakTex = wrap(texFoamStreaks()), foamTex = wrap(texFoam()); streakTex.anisotropy = ANI;
  const waveU = { uStreak: { value: streakTex }, uFoamT: { value: foamTex }, uT: { value: 0 }, uTop: { value: lin('#2a7a76') }, uMid: { value: lin('#123f4a') }, uBot: { value: lin('#0a242c') }, uSky: { value: lin('#a9c4e2') },
    uFogC: { value: lin('#c9d8e6') }, uFogNear: { value: 400 }, uFogFar: { value: 16000 }, uFogK: { value: 0.75 }, uLight: { value: 1 }, uSunUp: { value: 1 } };
  const waveMat = new THREE.ShaderMaterial({ uniforms: waveU, side: THREE.DoubleSide,
    vertexShader: `attribute float aYn; varying float vYn; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){ vYn = aYn; vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D uStreak, uFoamT; uniform float uT, uFogNear, uFogFar, uFogK, uLight, uSunUp; uniform vec3 uTop, uMid, uBot, uSky, uFogC;
      varying float vYn; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){ float yn = vYn;
        vec3 col = mix(uBot, uMid, smoothstep(0.04, 0.5, yn)); col = mix(col, uTop, smoothstep(0.6, 0.98, yn));
        col *= 0.9 + 0.1 * sin(vUv.y * 7.0 + vUv.x * 0.6 + sin(vUv.x * 2.1) * 1.5);
        vec3 V = normalize(vW - cameraPosition), n = normalize(vN); if (dot(n, V) > 0.0) n = -n;
        float fres = pow(1.0 - max(dot(-V, n), 0.0), 4.0); col = mix(col, uSky * 0.8, fres * 0.45);
        float cv = texture2D(uFoamT, vec2(vUv.x * 0.37, 0.13)).r, cv2 = texture2D(uFoamT, vec2(vUv.x * 0.21 + 0.5, 0.61)).r;
        vec2 u1 = vec2(vUv.x * 0.7, vUv.y * 0.4 + uT * 0.15);
        float s1 = texture2D(uStreak, u1).r, s2 = texture2D(uStreak, vec2(vUv.x * 1.3 + 0.37, vUv.y * 0.55 + uT * 0.27)).r, s3 = texture2D(uStreak, vec2(vUv.x * 0.45 + 0.71, vUv.y * 0.3 + uT * 0.1)).r;
        float mist = texture2D(uStreak, u1, 3.5).r + texture2D(uStreak, vec2(vUv.x * 0.45 + 0.71, vUv.y * 0.3 + uT * 0.1), 4.0).r;
        float haze = clamp(mist * 1.4, 0.0, 1.0) * smoothstep(0.8, 0.2, yn) * smoothstep(0.06, 0.28, yn);
        col = mix(col, vec3(0.62, 0.74, 0.78), haze * 0.45);
        float streak = clamp(s1 * (0.35 + 1.1 * cv) + s2 * 0.75 * (1.3 - cv) * cv2 + s3 * 0.55, 0.0, 1.0) * smoothstep(0.25, 0.95, yn) * smoothstep(0.1, 0.3, yn) * (1.0 - smoothstep(1.0, 1.05, yn) * 0.0);
        float fN = texture2D(uFoamT, vUv * 2.3 + vec2(0.0, uT * 0.05)).r, fN2 = texture2D(uFoamT, vUv * 5.1 + vec2(uT * 0.03, uT * 0.11)).r;
        float crest = smoothstep(0.935, 0.995, yn) * (0.55 + 0.7 * fN) + smoothstep(0.985, 1.04, yn);
        float toe = (1.0 - smoothstep(0.02, 0.16, yn)) * (0.55 + 0.8 * fN2);
        float dd = length(vW - cameraPosition), farK = smoothstep(2500.0, 7000.0, dd);
        float foam = clamp(max(streak * 0.9 * (1.0 - farK), max(crest * (1.0 - 0.6 * farK), toe * (1.0 - 0.9 * farK))), 0.0, 1.0);
        vec3 fc = vec3(0.86, 0.91, 0.93) * mix(0.72, 1.08, smoothstep(0.8, 1.02, yn) * uSunUp);
        col = mix(col, fc, foam);
        col *= uLight;
        float d = length(vW - cameraPosition); col = mix(col, uFogC, smoothstep(uFogNear, uFogFar, d) * uFogK);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` });
  const wave = new THREE.Mesh(wGeo, waveMat); wave.frustumCulled = false; scene.add(wave);

  // --- spray, mist and splash sprites (one pool, placed each frame), debris carried by the wall
  const sprays = Array.from({ length: 520 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistTex, transparent: true, depthWrite: false, color: 0xffffff })); s.renderOrder = 10; s.visible = false; scene.add(s); return s; });
  const debris = IM(new THREE.BoxGeometry(1, 1, 1), STD({ color: 0xffffff, roughness: 0.8 }), 90, false); debris.frustumCulled = false; scene.add(debris);
  { const R = RNG('debc'); for (let i = 0; i < 90; i++) debris.setColorAt(i, lin(R.pick(['#6a4a30', '#8a6440', '#f2efe8', '#c8372d', '#2b3236', '#2f6fb0', '#4a3a2a']))); }

  G = { cv, r, scene, cam, sky, skyU, clouds, hemi, sun, fill, seaMat, seaMesh, boats, PM, PG, ppl, wave, wGeo, wPos, wUv, wX, wProf, wArc, WNX, WNS, waveU, sprays, debris, towers,
    puddles, pud, fishB, fishT, fish, flags, ship, ENV, bike, dropped, leaves, leaf, gullSh, dog, dogLegs };
  return G;
}
// the moored boats (kind, length, x, z, yaw, phase) — shared with the score (hull creaks when each one settles)
function boatList() {
  const L = [['trawler', 16, 7.5, -46, 0.35, 0.3], ['yacht', 12, -9.5, -38, -1.25, 1.1], ['sail', 10, -3, -72, 1.4, 2.1], ['yacht', 9, 13, -92, 2.6, 0.7], ['sail', 11, -18, -112, -0.4, 3.3],
    ['fish', 7, 2, -128, 1.9, 4.1], ['dinghy', 4, -5.5, -31, 0.9, 5.2], ['yacht', 10, 22.5, -125, 0.05, 1.7], ['fish', 8, 23, -165, -0.1, 2.6], ['sail', 9, 22.5, -205, 0.1, 3.7]];
  const R = RNG('qboats'); for (let z = -170; z > -560; z -= R.r(32, 55)) L.push([R.pick(['sail', 'fish', 'yacht', 'sail']), R.r(7, 12), xqAt(z) + 6, z, R.n(0.2) + (R.f() < 0.5 ? 0 : Math.PI), R.r(0, 6)]);
  return L;
}
// when a boat's keel touches the mud (seconds), for the creaks
const boatDraft = (kind, L) => L * (kind === 'dinghy' ? 0.16 : 0.2) * 0.4;
function boatSettleT(b) { const [kind, L, x, z] = b, bc = bedH(x, z), d = boatDraft(kind, L); for (let t = 5; t < 14; t += 0.02) if (seaLevel(t) - d < bc) return t; return null; }

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(), _hid = new THREE.Matrix4().makeScale(0, 0, 0);
const M4 = () => new THREE.Matrix4(), Tr = (x, y, z) => M4().makeTranslation(x, y, z), Rx = (a) => M4().makeRotationX(a), Rz = (a) => M4().makeRotationZ(a);
const xqAt = (z) => -38 - 132 * (-z - 0.6) / 800;

// one person's pose at time t: walk / turn to the sea / point / run away
function personPose(q, t, cam) {
  let x = q.x, z = q.z, yaw = q.yaw, pose = q.role === 'sit' ? 'sit' : 'stand', walk = 0, run = 0, p = t * 5.6 + q.ph, pk = 0, lean = 0;
  const tw = Math.min(t, q.stopT) + 0.45 * clamp((t - q.stopT) / 0.9), turnK = ss(q.stopT + 0.2, q.stopT + 1.4, t);
  if (q.role === 'walk') { x = mod(q.x + q.v * tw + 14, 28) - 14; const yw = q.v > 0 ? Math.PI / 2 : -Math.PI / 2; yaw = lerp(yw, (q.v > 0 ? Math.PI : -Math.PI) + q.look, turnK); walk = 1 - ss(q.stopT, q.stopT + 0.9, t); }
  else if (q.role === 'jwalk') { if (q.quay) { z = q.z + q.v * tw; yaw = lerp(q.v > 0 ? 0 : Math.PI, Math.PI / 2 + q.look * 0.5, turnK); } else { z = -85 - mod(-(q.z + q.v * tw) - 85, 165); yaw = lerp(q.v > 0 ? 0 : Math.PI, Math.PI + q.look, turnK); }
    walk = 1 - ss(q.stopT, q.stopT + 0.9, t); }
  else if (q.role === 'stand' && !q.quay && Math.abs(q.yaw - Math.PI) > 0.5) yaw = lerp(q.yaw, Math.PI + q.look, turnK);
  if (q.point && t > q.pointT && t < q.runT) pk = ss(q.pointT, q.pointT + 0.5, t);
  if (q.role === 'runner' && t < q.runT) return null;
  if (t > q.runT) {
    const k = t - q.runT, d = q.rv * Math.max(0, k - 0.35 * (1 - Math.exp(-k / 0.35))), n = Math.hypot(q.rdx, q.rdz);
    x += d * q.rdx / n; z += d * q.rdz / n; pose = 'stand'; yaw = Math.atan2(q.rdx, q.rdz) + Math.sin(t * 3 + q.ph) * 0.06;
    run = ss(0, 0.4, k); walk = 0; p = t * 10.5 + q.ph; pk = 0; lean = 0.2 * ss(0, 0.5, k);
    if (q.quay && x < xqAt(z) - 15) return null;
    if (z > 70) return null;
  }
  if (z > cam.z - 0.9 && z < cam.z + 0.8 && Math.abs(x - cam.x) < 0.9) return null;   // never inside the lens
  if (z > cam.z + 0.8 && TT > 51) return null;
  return { x, z, yaw, pose, p, walk, run, pk, lean };
}

function update3D() {
  const g = g3(), t = TT, c = camPose(t), wv = waveVis(t), lev = seaLevel(t), on = t >= 17;
  const zw = wv.zw, Hv = wv.Hv;
  g.cam.position.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.sky.position.copy(g.cam.position);
  // the wall's shadow and how much sky it covers
  const crestAng = on ? Math.atan2(Hv * 1.05 - c.y, c.z - zw) : 0, cover = ss(4 * DEG, 48 * DEG, crestAng), inShade = on ? ss(c.z - 30, c.z + 30, wv.shadeZ) : 0;
  WSH.value = on ? wv.shadeZ : -1e6;
  g.hemi.intensity = 0.7 * (1 - 0.5 * cover); g.fill.intensity = 0.45 * (1 - 0.6 * cover);
  g.r.toneMappingExposure = 1.0 - 0.32 * inShade - 0.12 * cover;
  g.skyU.dark.value = 0.22 * cover + 0.1 * inShade;
  const fogC = lin('#c9d8e6').lerp(lin('#8fa3ae'), Math.max(cover * 0.7, inShade * 0.8));
  g.scene.fog.color.copy(fogC); g.scene.fog.far = lerp(16000, 2600, ss(47, 57.4, t)); g.scene.fog.near = lerp(400, 120, ss(47, 57.4, t));
  // clouds drift
  g.clouds.forEach((s) => { const u = s.userData, a = u.ang + t * u.v; s.position.set(c.x + Math.sin(a) * u.D, u.y, c.z - Math.cos(a) * u.D); s.scale.set(u.w * (1 + 0.07 * Math.sin(t * 0.09 + u.ph)), u.w * u.a * (1 + 0.1 * Math.sin(t * 0.13 + u.ph * 1.7)), 1); s.material.rotation = 0.04 * Math.sin(t * 0.05 + u.ph); s.material.opacity = u.o * (0.85 + 0.15 * Math.sin(t * 0.11 + u.ph * 2.3)) * (1 - 0.35 * cover); });
  g.ship.position.x = 600 - t * 6;
  // the water drains
  const su = g.seaMat.uniforms; g.seaMesh.position.y = lev; su.uT.value = t; su.uLevel.value = lev; su.uShZ.value = WSH.value; su.uDark.value = 0.25 * cover; su.uChurn.value = ss(50, 57, t);
  su.fogColor.value.copy(fogC); su.fogNear.value = g.scene.fog.near; su.fogFar.value = g.scene.fog.far;
  // the wave: rebuild the swept wall
  g.wave.visible = on;
  if (on) {
    const { wPos, wUv, wX, wProf, wArc, WNX, WNS } = g, Y0 = -16;
    for (let i = 0; i < WNX; i++) { const x = wX[i], hx = 1 + 0.035 * Math.sin(x * 0.0021 + 1.3) + 0.02 * Math.sin(x * 0.0063 + 0.4), cr = Hv * hx, zo = zw - x * x / 120000 + 0.02 * Hv * Math.sin(x * 0.0017 + 0.5);
      for (let j = 0; j < WNS; j++) { const k = i * WNS + j, [dn, yn] = wProf[j]; wPos[k * 3] = x; wPos[k * 3 + 1] = Y0 + yn * (cr - Y0); wPos[k * 3 + 2] = zo + dn * cr; wUv[k * 2] = x / 160; wUv[k * 2 + 1] = wArc[j] * (cr - Y0) / 160; } }
    g.wGeo.attributes.position.needsUpdate = true; g.wGeo.attributes.uv.needsUpdate = true; g.wGeo.computeVertexNormals();
    const wu = g.waveU; wu.uT.value = t; wu.uFogC.value.copy(fogC); wu.uFogNear.value = g.scene.fog.near; wu.uFogFar.value = Math.max(g.scene.fog.far, 3000); wu.uFogK.value = 0.22; wu.uLight.value = 1 - 0.25 * inShade;
  }
  const hitK = (z0, lead = 0) => on ? clamp((zw + 0.3 * Hv + lead - z0) / 45) : 0;   // 0 before the toe reaches z0, 1 a little after
  // boats float, settle on the mud, and are thrown when the wall arrives
  g.boats.forEach((b) => { const bc = bedH(b.x, b.z), fy = lev - 0.4 * b.D, gnd = ss(-0.05, 0.8, bc - fy), hk = hitK(b.z);
    let y = Math.max(fy, bc - 0.12 * b.D * gnd) + (1 - gnd) * 0.07 * Math.sin(t * 1.3 + b.ph);
    let roll = b.roll * 0.3 * gnd + (1 - gnd) * 0.035 * Math.sin(t * 1.1 + b.ph), pitch = (1 - gnd) * 0.02 * Math.sin(t * 0.9 + b.ph) + gnd * 0.05 * b.roll;
    y += hk * hk * Hv * 0.35; roll += hk * 2.5 * b.roll; pitch += hk * 1.2;
    b.grp.position.set(b.x, y, b.z + hk * 35); b.grp.rotation.set(pitch, b.yaw + hk * 0.8, roll); b.grp.visible = hk < 1; });
  // fish flapping on the exposed mud, puddles appearing
  g.fish.forEach((f, i) => { const exp = lev < f.y + 0.05 && hitK(f.z) <= 0;
    if (!exp) { g.fishB.setMatrixAt(i, _hid); g.fishT.setMatrixAt(i, _hid); return; }
    const cyc = mod(t + f.ph, f.per) / f.per, side = Math.floor((t + f.ph) / f.per) % 2 ? 1 : -1, hop = cyc < 0.2 ? Math.sin(cyc / 0.2 * Math.PI) : 0, rollA = cyc < 0.2 ? lerp(-side, side, cyc / 0.2) : side;
    const s = f.s * (1 - ss(13, 24, t) * 0.0), m = M4c(f.x, f.y + 0.08 * s + hop * 0.3 * s, f.z, f.ry, s, s, s, rollA * Math.PI / 2 * 0.95, 0);
    g.fishB.setMatrixAt(i, m); g.fishT.setMatrixAt(i, m.clone().multiply(M4c(-0.55, 0, 0, Math.sin(t * 22 + f.ph) * 0.5 * (hop > 0 ? 1 : 0.25)).multiply(M4c(0.55, 0, 0)))); });
  g.fishB.instanceMatrix.needsUpdate = true; g.fishT.instanceMatrix.needsUpdate = true;
  g.pud.forEach((p, i) => { const k = ss(p.y + 0.1, p.y - 0.15, lev) * (hitK(p.z) > 0 ? 0 : 1); g.puddles.setMatrixAt(i, k > 0.01 ? M4c(p.x, p.y, p.z, p.ry, p.sx * k, 1, p.sz * k) : _hid); });
  g.puddles.instanceMatrix.needsUpdate = true;
  // towers vanish once the wall has rolled over them
  g.towers.forEach((tw) => { tw.grp.visible = !(on && zw > tw.front + 60); });
  // flags flutter, harder as the wind of the wave arrives
  { const amp = 0.1 * (1 + 2.5 * ss(38, 56, t)), sp = 7 + 6 * ss(38, 56, t);
    g.flags.forEach((f) => { const p = f.m.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const bx = f.base[i * 3], by = f.base[i * 3 + 1]; p.setXYZ(i, bx, by - bx * 0.04 * (1 - ss(38, 50, t)), Math.sin(bx * 3.2 - t * sp + f.ph + by * 0.8) * amp * bx); }
      p.needsUpdate = true; f.m.geometry.computeVertexNormals(); }); }

  // people
  const PM = g.PM, PG = g.PG, hide = (i) => { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PM[k].setMatrixAt(i * PG[k][1] + j, _hid); };
  g.ppl.forEach((q, i) => {
    const st = personPose(q, t, c); if (!st) return hide(i);
    const { x, z, yaw, pose, p, walk, run, pk, lean } = st, s = q.s, w = q.w;
    if (q.dog) g.dogAt = { x, z, yaw, walk, run, p, t };
    const base = M4().compose(_v.set(x, DECK + (run ? Math.abs(Math.sin(p)) * 0.05 * run : 0), z), _q.setFromEuler(_e.set(0, yaw, 0)), _s.set(s * w, s, s * w));
    if (lean) base.multiply(Rx(lean));
    const sit = pose === 'sit'; if (sit) base.multiply(Tr(0, -0.45, 0));
    // gait: hips swing opposite, knees fold on the forward swing, arms counter-swing, elbows bend more when running
    const A = 0.42 * walk + 0.85 * run, Ak = 0.5 * walk + 1.3 * run, Aa = 0.35 * walk + 0.75 * run, breathe = 0.02 * Math.sin(TT * 1.7 + q.ph);
    const hip = (j) => sit ? -1.5 + (j ? 0.06 : -0.03) : (j ? 1 : -1) * Math.sin(p) * A, knee = (j) => sit ? 1.5 : 0.04 + Ak * Math.max(0, Math.sin(p + 1.7 + (j ? Math.PI : 0)));
    const sh = (j) => sit ? -0.35 : (j ? -1 : 1) * Math.sin(p) * Aa + (j && pk ? -1.45 * pk : 0) + breathe, elb = (j) => sit ? 0.7 : 0.18 + 0.15 * walk + 1.25 * run - (j ? pk * 0.15 : 0);
    const put = (k, j, m) => PM[k].setMatrixAt(i * PG[k][1] + j, _m.copy(m));
    for (const j of [0, 1]) {
      const th = base.clone().multiply(Tr(j ? 0.095 : -0.095, 0.9, 0)).multiply(Rx(hip(j))), sn = th.clone().multiply(Tr(0, -0.44, 0)).multiply(Rx(knee(j)));
      put('thigh', j, th); put('shin', j, sn); put('shoe', j, sn.clone().multiply(Rx(-knee(j) * 0.4 - (sit ? 0 : hip(j) * 0.3))));
      const ua = base.clone().multiply(Tr(j ? 0.2 : -0.2, 1.4, 0)).multiply(Rz((j ? 1 : -1) * (0.09 + 0.06 * run + (j ? 0.12 * pk : 0)))).multiply(Rx(sh(j))), fa = ua.clone().multiply(Tr(0, -0.29, 0)).multiply(Rx(-elb(j)));
      put('uarm', j, ua); put('farm', j, fa); put('hand', j, fa);
    }
    put('hips', 0, base.clone().multiply(Tr(0, 0.92, 0))); put('torso', 0, base.clone().multiply(Tr(0, 0.94, 0)).multiply(Rx(sit ? -0.05 : 0.03 * run)));
    put('neck', 0, base.clone().multiply(Tr(0, 1.45, 0))); const hd = base.clone().multiply(Tr(0, 1.6, 0)).multiply(Rx(q.role === 'stand' && !run ? -0.08 : 0.05));
    put('head', 0, hd); put('hair', 0, hd.clone().multiply(Tr(0, 0.025, -0.012))); put('hairB', 0, q.longHair ? hd.clone().multiply(Tr(0, -0.08, -0.07)) : _hid);
  });
  // the dog follows its owner, sits when the owner stops, bolts ahead when everyone runs
  { const d = g.dogAt, D = g.dog; D.visible = !!d;
    if (d) { const dir = Math.sin(d.yaw), fwd = d.walk + d.run, sitK = 1 - Math.min(1, fwd * 1.5);
      D.position.set(d.x + 0.6 * (d.run ? 0.2 : 1) * Math.sin(d.yaw), DECK, d.z + 0.35 + d.run * 1.6); D.rotation.set(-0.35 * sitK, d.run ? d.yaw : lerp(d.yaw, Math.PI, sitK), 0);
      g.dogLegs.forEach((l, k) => { l.rotation.x = Math.sin(d.p * 1.3 + (k % 2 ? Math.PI : 0) + (k > 1 ? 0.5 : 0)) * (0.5 * d.walk + 0.9 * d.run) + (k > 1 ? sitK * -1.1 : sitK * 0.3); });
      D.userData.tail.rotation.z = Math.sin(TT * 12) * 0.5; D.userData.head.rotation.y = Math.sin(TT * 0.7) * 0.3 * sitK; } }
  g.dogAt = null;
  // dropped things appear once the crowd has run; leaves blow towards the camera as the wind of the wave arrives; gull shadows cross the tiles
  g.dropped.visible = t > 28.3;
  { const wind = ss(40, 56, t);
    g.leaf.forEach((L, i) => { const k = Math.max(0, t - 41 - (i % 7) * 0.6), dz = k * k * 0.35 * L.v + wind * k * 2.5, dx = Math.sin(k * 0.7 + L.ph) * k * 0.4 + 0.15 * Math.sin(TT * 0.8 + L.ph) * (1 + wind);
      const lift = k > 0 ? Math.abs(Math.sin(k * 2 + L.ph)) * 0.25 * wind : 0;
      g.leaves.setMatrixAt(i, M4c(L.x + dx, DECK + 0.01 + lift, L.z + dz, L.r + k * 3 * L.v, L.s, L.s, L.s, lift * 3, lift * 2)); });
    g.leaves.instanceMatrix.needsUpdate = true; }
  g.gullSh.forEach((m, i) => { const vis = t < 26; m.visible = vis; if (!vis) return; const sp = 5 + i * 1.3, x = -7 + mod(t * sp + i * 5.3, 15), z = 0.6 + i * 1.2 + Math.sin(t * 0.5 + i) * 0.4; m.position.set(x, DECK + 0.008, z); m.rotation.y = 0.2; m.scale.set(1, 1, 0.8 + 0.4 * Math.abs(Math.sin(t * 7 + i))); });
  { const fall = EZ.i2(seg(t, 50.6, 51.3)); g.bike.rotation.z = 0.09 + fall * 1.45; g.bike.position.z = -0.05 + fall * 0.5; }
  for (const k in PM) PM[k].instanceMatrix.needsUpdate = true;

  // spray: mist along the lip, churn at the toe, splashes where it hits towers, boats and the quay, then the white-out
  let si = 0; const SP = g.sprays, put = (x, y, z, sc, op, col) => { if (si >= SP.length || op <= 0.005) return; const s = SP[si++]; s.visible = true; s.position.set(x, y, z); s.scale.set(sc, sc, 1); s.material.opacity = Math.min(1, op); s.material.color.set(col || '#ffffff'); };
  if (on && Hv > 40) {
    const dist = c.z - zw, half = dist * 0.42 + 0.3 * Hv, front = zw + 0.15 * Hv, lipA = ss(40, 160, Hv), R = RNG('lip');
    for (let k = 0; k < 56; k++) { const u = R.f(), age = mod(t * R.r(0.12, 0.22) + R.f(), 1), x = c.x + (u * 2 - 1) * half, zo = -x * x / 120000;
      put(x, Hv * (1.0 + 0.04 * Math.sin(x * 0.0021 + 1.3)) + age * 0.12 * Hv, front + zo + 8, Hv * R.r(0.12, 0.22) * (0.7 + age), 0.55 * lipA * Math.sin(age * Math.PI), '#f4f8fa'); }
    for (let k = 0; k < 34; k++) { const u = R.f(), age = mod(t * R.r(0.2, 0.35) + R.f(), 1), x = c.x + (u * 2 - 1) * half, zo = -x * x / 120000;
      put(x, Math.max(lev, bedH(x, zw + 0.34 * Hv)) + age * 0.1 * Hv, zw + 0.36 * Hv + zo + 6, Hv * R.r(0.12, 0.2) * (0.6 + age), 0.38 * lipA * Math.sin(age * Math.PI), '#eef4f6'); }
    // a tower swallowed: a white burst at its foot, spray columns climbing the face, a veil of mist
    g.towers.forEach((tw, ti) => { const th = zw + 0.05 * Hv - tw.front; if (th < -30 || th > 420) return; const a = clamp((th + 30) / 450), Rt = RNG('spl', ti), fz = (y) => zw + (0.035 + 0.1 * (y / Hv) ** 2) * Hv + 22, inA = ss(0, 0.06, a);
      for (let j = 0; j < 6; j++) { const y = 4 + a * 0.22 * Hv + Rt.r(0, 0.08) * Hv; put(tw.x + Rt.n(tw.w * 0.9), y, fz(y), Hv * (0.12 + 0.32 * a) * Rt.r(0.7, 1.2), 0.95 * inA * Math.pow(1 - a, 0.6), '#ffffff'); }
      for (let col = 0; col < 5; col++) { const cx = tw.x + Rt.n(tw.w * 1.2), top = Rt.r(0.45, 0.95) * Hv * Math.pow(a, 0.6);
        for (let j = 0; j < 4; j++) { const y = 4 + top * (j + 1) / 4; put(cx + Rt.n(6), y, fz(y), tw.w * 2.5 + Hv * 0.1 * (1 + j * 0.3), 0.85 * inA * (1 - a) * (0.6 + 0.4 * (1 - j / 4)), '#f8fbfc'); } }
      for (let j = 0; j < 4; j++) { const y = Hv * Rt.r(0.15, 0.6); put(tw.x + Rt.n(tw.w * 2), y, fz(y) + 15, Hv * 0.6, 0.35 * Math.sin(a * Math.PI), '#e8f0f2'); } });
    g.boats.forEach((b, bi) => { const hk = hitK(b.z, 20); if (hk <= 0 || hk >= 1) return; const Rb = RNG('bsp', bi);
      for (let j = 0; j < 3; j++) put(b.x + Rb.n(4), bedH(b.x, b.z) + hk * 30 + j * 8, b.z + 12, 10 + hk * 20, 0.5 * Math.sin(hk * Math.PI), '#ffffff'); });
  }
  if (t > 56.6) { const k = ss(56.6, 57.6, t), R = RNG('impact');
    for (let j = 0; j < 40; j++) { const a = R.f(), x = c.x + R.n(14 + 20 * k), y = DECK + R.r(-2, 25) * (0.4 + k), z = lerp(zw + 30, c.z - 6, a * k);
      put(x, y + R.r(0, 30) * k, z, R.r(12, 30) * (0.5 + k), k * R.r(0.5, 0.95), '#ffffff'); } }
  for (; si < SP.length; si++) SP[si].visible = false;
  // debris carried up the face
  { const D = g.debris, R = RNG('debris'), act = on && t > 48.5 && Hv > 100;
    for (let i = 0; i < 90; i++) { if (!act) { D.setMatrixAt(i, _hid); continue; }
      const dist = c.z - zw, x = c.x + R.n(dist * 0.32 + 40), age = mod(t * R.r(0.12, 0.25) + R.f(), 1), sz = R.r(0.6, 4.5) * (1 + dist / 400);
      D.setMatrixAt(i, M4c(x, -2 + age * 0.5 * Hv, zw + 0.03 * Hv + 6 + age * 0.06 * Hv, t * R.r(1, 3), sz, sz * R.r(0.2, 0.6), sz * R.r(0.4, 1), t * R.r(1, 3), t * R.r(0.5, 2))); }
    D.instanceMatrix.needsUpdate = true; }

  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}
// gulls over the harbour (lazy circles), then a flock fleeing from the horizon past the camera
function birds() {
  if (TT > 40) return;
  const R = RNG('gulls2');
  ctx.save(); screen(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const gull = (x, y, s, fl, a) => {
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(246,246,244,0.96)'; ctx.strokeStyle = 'rgba(70,74,84,0.8)'; ctx.lineWidth = Math.max(1.2, s * 0.09);
    ctx.beginPath(); ctx.moveTo(x - s, y - s * fl * 0.6); ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.45, x, y); ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.45, x + s, y - s * fl * 0.6);
    ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.18, x, y + s * 0.12); ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.18, x - s, y - s * fl * 0.6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(40,40,46,0.8)'; ctx.beginPath(); ctx.arc(x + s * (fl > 0 ? 0.92 : -0.92), y - s * fl * 0.58, s * 0.07, 0, TAU); ctx.fill(); };
  for (let i = 0; i < 9; i++) {   // lazy gulls, gone once the sea drains away... they come back to pick at the fish, then flee at 26s
    const cx = R.r(120, 960), cy = R.r(380, 820), rr = R.r(60, 200), sp = R.r(0.15, 0.35) * (R.f() < 0.5 ? 1 : -1), a = TT * sp + R.r(0, TAU), s = R.r(12, 22);
    const flee = ss(25.5, 29, TT), fx = cx + Math.cos(a) * rr + flee * (cx - 540) * 3, fy = cy + Math.sin(a) * rr * 0.35 - flee * 600;
    gull(fx, fy, s * (1 + flee), Math.sin(TT * (6 + 6 * flee) + i * 1.3) * 0.7, 1 - ss(30, 33, TT));
  }
  if (TT > 26 && TT < 38) for (let i = 0; i < 46; i++) {   // the flock: born small near the horizon, sweeping out and up past the lens
    const t0 = 26 + R.r(0, 7), k = (TT - t0) / R.r(2.2, 3.8); if (k < 0 || k > 1) continue;
    const ang = R.r(-2.6, -0.5), sx = 540 + R.n(120), sy = 880 + R.n(30), d = Math.pow(k, 1.6) * R.r(700, 1300);
    gull(sx + Math.cos(ang) * d * 1.2, sy + Math.sin(ang) * d, 4 + k * k * R.r(30, 60), Math.sin(TT * 14 + i) * 0.8, ss(0, 0.15, k));
  }
  ctx.restore();
}

// the counter text for each act (es-ES numbers, unicode minus)
const kmTxt = (km) => km >= 9.95 ? `a ${Math.round(km)} km` : `a ${km.toFixed(1).replace('.', ',')} km`;
function hud() {
  const t = TT; if (t < 5 || t >= 57.45) return;
  if (t < 17) { const lv = Math.round(-12 * EZ.io(seg(t, 5.6, 13.6))); return pvHud('Nivel del mar', `${lv < 0 ? '−' : ''}${Math.abs(lv)} m`, t < 14 ? 'retrocediendo' : 'el mar se ha ido', ev(5, 0.5)); }
  const hm = Math.round(waveHm(t) / (t < 26 ? 1 : 5)) * (t < 26 ? 1 : 5), km = waveKm(t);
  if (t < 52) return pvHud('Altura de la ola', `${pvNum(hm)} m`, kmTxt(km), t < 17.5 ? ev(17, 0.5) : 1);
  const m = Math.max(0, Math.round(km * 1000 / 10) * 10);
  if (t < 56.9) return pvHud('Altura de la ola', '700 m', `a ${pvNum(m)} m`);
  return pvHud('Altura de la ola', 'AQUÍ', '');
}
// the title, two lines, sized to fit inside the safe zone
function olTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 80px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore();
    const size = Math.min(92, Math.floor(80 * 870 / wmax)), lh = size * 1.16, x = 500, y0 = 400;
    pvFeather(x, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 540, 120 + lines.length * 60, a);
    lines.forEach((l, i) => pvText(l, x, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
function endCard() {
  const a = ev(61.2, 0.8), b = ev(62.0, 0.8), c2 = ev(62.6, 0.8);
  const f = () => {
    pvText('La ola más alta registrada:', CX, 800, 54, { italic: true, align: 'center', alpha: a });
    pvText('524 m', CX, 990, 150, { align: 'center', alpha: b });
    pvText('bahía Lituya, Alaska, 1958.', CX, 1085, 50, { align: 'center', alpha: c2 });
    ctx.save(); screen(); ctx.globalAlpha = 0.5 * c2; ctx.fillStyle = '#7fb8c4'; ctx.fillRect(CX - 60, 1125, 120, 3); ctx.restore();
  };
  if (DEFER) DEFER.push(f); else f();
}

function sceneHarbour() {
  const t = TT;
  if (t < 57.75) { update3D(); birds(); }
  // the impact: white spray-out, then black
  const wh = ss(57.3, 57.62, t), bk = ss(58.15, 58.75, t);
  if (wh > 0) { pvTint('#eef3f4', wh); if (t < 58.75) { const R = RNG('whiteout', Math.floor(t * 24)); ctx.save(); screen(); for (let i = 0; i < 26; i++) { const x = R.r(0, W), y = R.r(0, H), r = R.r(120, 420); const gg = ctx.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, 'rgba(190,206,212,0.22)'); gg.addColorStop(1, 'rgba(190,206,212,0)'); ctx.fillStyle = gg; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); } ctx.restore(); } }
  if (bk > 0) pvTint('#070b0d', bk);
  if (t >= 58.75) fillAll('#070b0d');
  if (t >= 61) { pvGlow(CX, 960, 900, 'rgba(30,60,70,0.55)', ev(61, 1.2)); endCard(); }
  hud();
  olTitle(['¿Qué pasaría si una ola', 'de 700 metros golpeara', 'tu ciudad?'], 0.3, 5.0);
  pvCaption('El mar se retira.', 5.6, 13.6);
  pvCaption('Una línea en el horizonte.', 18.0, 25.6);
  pvCaption('Todavía está lejos.', 26.8, 32.6);
  pvCaption('Pero sigue creciendo.', 33.0, 39.6);
  pvCaption('Más alta que los rascacielos.', 41.0, 51.6);
  pvCaption('No hay a dónde ir.', 52.4, 57.3);
}
