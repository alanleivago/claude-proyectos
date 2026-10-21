
// =====================================================================
//  SCENES — a coastal town at night in real 3D (three.js into an offscreen WebGL canvas, drawn under the 2D HUD).
//  One handheld camera floats above the rooftops looking over the harbour, a lighthouse jetty and a headland to the sea.
//  The Moon falls and grows (5-34s), drags the tide over the quay (16-26), cracks with lava at the Roche limit (26-34),
//  splits (34-38), rains burning fragments (38-48), the sea pulls back (48.6-55) and a 400 m wave reaches the lens (63.0).
//  Everything is a pure function of TT + seeded RNG: deterministic frame by frame.
// =====================================================================
THREE.ColorManagement.legacyMode = false;   // hex colours are sRGB
const lin = (h) => new THREE.Color(h);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const EYE = 40, CAMZ0 = 14, QZ = -78, PROM = 2.4;
const MOON_AZ = 7 * DEG, MOON_D = 12000;

// ---- the story's numbers, all functions of time
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
const seaLevel = (t) => 0.3;   // sol: the sea stays; it freezes over from the shore (uIce)
const MOON_R = [[0, 0.45], [5, 0.5], [16, 2.6], [26, 7.5], [31, 10.0], [34, 10.6], [38, 10.8]];
const moonR = (t) => knots(MOON_R, t) * DEG;
const moonEl = (t) => { const r = moonR(t) / DEG; return Math.max(r * 0.78, lerp(9.5, r * 0.78, ss(8, 28, t))) * DEG; };
const MOON_KM = [[5, 384400], [10, 250000], [16, 90000], [21, 60000], [26, 40000], [31, 18000], [34, 18000]];
const IMPACTS = [[38, 0], [40, 12], [42, 180], [44, 900], [46, 2000], [48, 3200]];
const KM = [[49, 12], [52, 8.5], [56, 4], [59, 1.4], [61, 0.5], [62.4, 0.08], [63, 0]];
const HM = [[49, 0], [50.5, 15], [52, 60], [54, 200], [56, 400], [63, 400]];
const waveKm = (t) => knots(KM, t), waveHm = (t) => knots(HM, t);
const waveZ = (t) => CAMZ0 - 4 - waveKm(t) * 1000;
const dirV = (az, el) => new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
// the handheld camera: a slow float the whole time; at the end it drifts back over the roofs and tilts up at the wave
function camPose(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c, k = EZ.io(seg(t, 58.5, 62.95)), sh = ss(59.5, 62.9, t) * (t < 63.05 ? 1 : 0);
  return {
    x: n(0.37, 1, 0.06) + n(0.93, 2, 0.025) + sh * (n(23, 0, 0.03) + n(37, 1, 0.015)),
    y: EYE + n(0.53, 0, 0.05) + n(1.31, 0.4, 0.02) + 4 * k,
    z: CAMZ0 + 18 * k + n(0.47, 2, 0.04),
    pitch: (-1.6 + 26 * k + n(0.41, 0.3, 0.22) + n(1.07, 1.2, 0.1) + sh * (n(31, 1, 0.35) + n(19, 2, 0.25))) * DEG,
    yaw: (-2.5 + n(0.29, 0.7, 0.35) + n(0.71, 2.1, 0.14)) * DEG,
    roll: (n(0.23, 0.2, 0.25) + n(0.83, 1.9, 0.1) + sh * n(27, 2, 0.45)) * DEG,
  };
}
// the wall's visible height: true until its crest would leave the frame, then held near the top
function waveVis(t) {
  const c = camPose(t), zw = waveZ(t), Hm = waveHm(t) * (1 + 2.5 * (1 - ss(50, 58, t))), cap = (27 + 26 * EZ.io(seg(t, 58.5, 62.95))) * DEG, tc = Math.tan(cap);
  const Hv = Math.min(Hm, (tc * (c.z - zw) + c.y) / (1.05 + 0.135 * tc));
  return { zw, Hv, Hm };
}
// ---- the ground: town slope above the quay, sea floor below it (shared by JS and GLSL)
function gH(x, z) {
  if (z > QZ) return PROM + 13 * ss(-66, 10, z);
  const d = QZ - z; let h = -4 - 0.02 * d - 0.01 * Math.max(0, d - 600);
  h += 0.3 * Math.sin(x * 0.045 + z * 0.03) * Math.sin(z * 0.021 - x * 0.013) + 0.1 * Math.sin(x * 0.31 + z * 0.17) * Math.sin(z * 0.27 - x * 0.11);
  return h;
}
const GH_GLSL = `
  float gH(vec2 p){ float x = p.x, z = p.y;
    if (z > ${QZ.toFixed(1)}) return ${PROM.toFixed(2)} + 13.0 * smoothstep(-66.0, 10.0, z);
    float d = ${(-QZ).toFixed(1)} + z; d = -d; float h = -4.0 - 0.02 * d - 0.01 * max(0.0, d - 600.0);
    h += 0.3 * sin(x * 0.045 + z * 0.03) * sin(z * 0.021 - x * 0.013) + 0.1 * sin(x * 0.31 + z * 0.17) * sin(z * 0.27 - x * 0.11);
    return h; }`;
const TERR = { x: -9.15, z: -10.5 }; TERR.y = gH(TERR.x, TERR.z - 4) + 13.6;   // a flat roof terrace just below the camera
const xL = (z) => -45 + (z - QZ) * (50 / 262);   // the left harbour shore line (x at depth z)
const hillY = (x, z) => -10 + 175 * Math.sqrt(Math.max(0, 1 - ((x + 660) / 580) ** 2 - ((z + 1180) / 860) ** 2)) * (1 + 0.1 * Math.sin(x * 0.019) * Math.sin(z * 0.015));

// ---- small helpers
function g3Tex(draw, w = 128, h = 128, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; return t; }
const g3Radial = (stops, w = 128) => g3Tex((x) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); stops.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, w, w); }, w, w);
const IM = (geo, mat, n, shadow = true) => { const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = shadow; m.receiveShadow = true; return m; };
const M4c = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
const wrap = (t, rx, ry) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rx) t.repeat.set(rx, ry); return t; };
// the wave's shadow: lit materials multiply the key light by a soft edge that sweeps towards the camera
const WSH = { value: -1e6 };
const LFB = THREE.ShaderChunk.lights_fragment_begin.replace('getDirectionalLightInfo( directionalLight, geometry, directLight );', 'getDirectionalLightInfo( directionalLight, geometry, directLight ); directLight.color *= olLit;');
const WPOS_V = '#include <project_vertex>\n{ vec4 ow = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\n ow = instanceMatrix * ow;\n#endif\n vOlW = (modelMatrix * ow).xyz; }';
function olShade(m, more) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uShZ = WSH; sh.uniforms.uSnow = SNOW; sh.uniforms.uDead = WIN.uDead;
    sh.vertexShader = 'varying vec3 vOlW;\n' + sh.vertexShader.replace('#include <project_vertex>', WPOS_V);
    sh.fragmentShader = 'uniform float uShZ, uSnow, uDead; varying vec3 vOlW;\n' + sh.fragmentShader.replace('#include <normal_fragment_maps>', SNOW_GLSL).replace('#include <lights_fragment_begin>', 'float olLit = smoothstep(uShZ - 30.0, uShZ + 30.0, vOlW.z);\n' + LFB);
    if (more) more(sh);
  };
  return m;
}
// sol: snow settles on upward faces (uSnow), with a thin frost on everything
const SNOW = { value: 0 };
const SNOW_GLSL = `#include <normal_fragment_maps>
  if (uSnow > 0.0) { float up = dot(normal, normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz)), nz = 0.18 * sin(vOlW.x * 3.1 + vOlW.z * 2.3) * sin(vOlW.z * 1.7 - vOlW.x * 0.9) + 0.08 * sin(vOlW.x * 11.0 + vOlW.z * 9.0);
    float sn = uSnow * smoothstep(0.3, 0.7, up + nz) + 0.22 * uSnow * (1.0 - smoothstep(0.3, 0.7, up + nz));
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.94, 1.0), clamp(sn, 0.0, 1.0)); }`;
const STD = (o) => olShade(new THREE.MeshStandardMaterial(o));
const WIN = { uOn: { value: 0.3 }, uT: { value: 0 }, uPow: { value: 1 }, uDead: { value: 0 } };

// ---- code-drawn textures
// a facade sheet: 24 m x 24 m = 8 window bays x 8 floors (3 m each); plaster, recessed windows, sills, some shutters
function texFacade() {
  return g3Tex((x, w) => {
    const R = RNG('facade2'), c = w / 8; x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, w);
    for (let k = 0; k < 9000; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '110,100,90' : '255,255,255'},${R.r(0.04, 0.14)})`; x.fillRect(R.r(0, w), R.r(0, w), R.r(1, 3), R.r(1, 3)); }
    for (let k = 0; k < 60; k++) { const px = R.r(0, w), py = R.r(0, w), r = R.r(10, 50); const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(80,70,60,0.12)'); g.addColorStop(1, 'rgba(80,70,60,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); }
    for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) {
      const px = q * c + c * 0.32, py = r * c + c * 0.22, ww = c * 0.36, hh = c * 0.5;
      x.fillStyle = '#2a2c30'; x.fillRect(px, py, ww, hh);
      x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(px - 2, py + hh, ww + 4, 3);
      x.fillStyle = '#4a4440'; x.fillRect(px + ww / 2 - 0.7, py, 1.4, hh); x.fillRect(px, py + hh * 0.4, ww, 1.4);
      if (R.f() < 0.35) { x.fillStyle = R.pick(['#3d6b5a', '#2f5a86', '#7a4a32', '#5a6a3a', '#6a6a62']); x.fillRect(px - ww * 0.42, py, ww * 0.38, hh); x.fillRect(px + ww * 1.04, py, ww * 0.38, hh); }
    }
    x.fillStyle = 'rgba(0,0,0,0.35)'; for (let r = 0; r < 8; r++) x.fillRect(0, r * c + c - 2, w, 2);
  }, 512, 512);
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
function texRoof() {   // terracotta tiles, 2 m x 2 m: curved rows, colour variation, dirt and moss
  return g3Tex((x, w) => {
    const R = RNG('roof'); x.fillStyle = '#b8b0a8'; x.fillRect(0, 0, w, w);
    const rows = 9, cols = 12, rh = w / rows, cw = w / cols;
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      const v = R.r(-20, 20), px = q * cw + (r % 2) * cw * 0.5, py = r * rh;
      const g = x.createLinearGradient(px, 0, px + cw, 0); g.addColorStop(0, `rgb(${150 + v},${150 + v},${150 + v})`); g.addColorStop(0.5, `rgb(${235 + v},${235 + v},${232 + v})`); g.addColorStop(1, `rgb(${120 + v},${120 + v},${120 + v})`);
      x.fillStyle = g; x.fillRect(px, py, cw - 1, rh); if (px + cw > w) x.fillRect(px - w, py, cw - 1, rh);
    }
    for (let r = 0; r < rows; r++) { const g = x.createLinearGradient(0, r * rh, 0, r * rh + rh); g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(0.25, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.12)'); x.fillStyle = g; x.fillRect(0, r * rh, w, rh); }
    for (let k = 0; k < 50; k++) { const px = R.r(0, w), py = R.r(0, w), r = R.r(6, 30); const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, `rgba(${R.f() < 0.5 ? '50,60,30' : '40,34,28'},0.25)`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); }
  }, 256, 256);
}
function texCobbles() {   // dark street cobbles, 8 m
  return g3Tex((x, w) => {
    const R = RNG('cob'); x.fillStyle = '#5a5650'; x.fillRect(0, 0, w, w);
    for (let k = 0; k < 2600; k++) { const v = R.r(-22, 22); x.fillStyle = `rgb(${96 + v},${92 + v},${86 + v})`; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, w), R.r(4, 9), R.r(3, 7), R.r(0, 3), 0, TAU); x.fill(); }
    for (let k = 0; k < 9000; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '30,28,26' : '200,196,190'},${R.r(0.04, 0.12)})`; x.fillRect(R.r(0, w), R.r(0, w), 2, 2); }
  }, 512, 512);
}
function texQuayWall() {   // granite blocks; the lower half wet and green
  return g3Tex((x, w, h) => {
    const R = RNG('qwall'); x.fillStyle = '#8d8578'; x.fillRect(0, 0, w, h);
    const rows = 8, rh = h / rows;
    for (let r = 0; r < rows; r++) { let px = -R.r(0, 80); while (px < w) { const bw = R.r(70, 150), v = R.r(-16, 16); x.fillStyle = `rgb(${138 + v},${130 + v},${118 + v})`; x.fillRect(px + 2, r * rh + 2, bw - 4, rh - 4); px += bw; } }
    for (let k = 0; k < 9000; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '40,36,30' : '220,214,200'},${R.r(0.05, 0.15)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 3)); }
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.3, 'rgba(0,0,0,0)'); g.addColorStop(0.42, 'rgba(40,46,30,0.55)'); g.addColorStop(0.6, 'rgba(46,62,34,0.75)'); g.addColorStop(1, 'rgba(30,40,24,0.85)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }, 512, 512);
}
// the Moon in code: an albedo map (highlands, large dark maria, bright rims and ejecta rays) and a height map (crater bowls,
// raised rims, central peaks, ejecta blankets, low maria) that the shader turns into a bump normal
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
const texPuff = (key, n = 26, a = 0.35) => g3Tex((x, w) => { const R = RNG(key); for (let i = 0; i < n; i++) { const px = w / 2 + R.n(w * 0.2), py = w / 2 + R.n(w * 0.2), s = R.r(w * 0.12, w * 0.3); const g = x.createRadialGradient(px, py, 0, px, py, s); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); } });
// a billowing smoke puff: many lumps, each lit on its lower side (the fire is below), soft edge
const texBillow = (key) => g3Tex((x, w) => { const R = RNG(key);
  for (let i = 0; i < 46; i++) { const a = R.r(0, TAU), d = Math.pow(R.f(), 0.7) * w * 0.3, px = w / 2 + Math.cos(a) * d, py = w / 2 + Math.sin(a) * d * 0.85, s = R.r(w * 0.07, w * 0.17) * (1 - d / (w * 0.45));
    const g = x.createRadialGradient(px, py + s * 0.35, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.55, 'rgba(200,200,200,0.42)'); g.addColorStop(0.85, 'rgba(150,150,150,0.2)'); g.addColorStop(1, 'rgba(120,120,120,0)'); x.fillStyle = g; x.fillRect(px - s, py - s, 2 * s, 2 * s); } }, 128, 128);
function texCloud() { return g3Tex((x, w, h) => { const R = RNG('cloud'); for (let i = 0; i < 70; i++) { const px = w / 2 + R.n(w * 0.28), py = h * 0.55 + R.n(h * 0.1), s = R.r(h * 0.08, h * 0.22);
  const g = x.createRadialGradient(px, py - s * 0.2, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.45)'); g.addColorStop(0.6, 'rgba(246,248,252,0.2)'); g.addColorStop(1, 'rgba(240,244,250,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); } }, 512, 256); }
function texFoamStreaks() {   // white streaks running down the wave's face (from the approved template)
  return g3Tex((x, w, h) => {
    x.fillStyle = '#000'; x.fillRect(0, 0, w, h); const R = RNG('streak2');
    const dot = (px, py, r, a) => { for (const dx of [-w, 0, w]) { const X = px + dx; if (X < -r || X > w + r) continue; for (const dy of [-h, 0, h]) { const Y = py + dy; if (Y < -r || Y > h + r) continue;
      const g = x.createRadialGradient(X, Y, 0, X, Y, r); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.55, `rgba(255,255,255,${a * 0.5})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(X - r, Y - r, 2 * r, 2 * r); } } };
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
    for (let i = 0; i < 45; i++) flow(R.r(0, w), R.r(0, h), R.r(0.9, 2.4), R.r(150, 650), R.r(0.18, 0.5), 2);
  }, 512, 1024, false);
}
function texFoam() {
  return g3Tex((x, w) => {
    x.fillStyle = '#000'; x.fillRect(0, 0, w, w); const R = RNG('foamtex');
    for (let i = 0; i < 1400; i++) { const px = R.r(0, w), py = R.r(0, w), s = R.r(2, 18);
      for (const dx of [-w, 0, w]) for (const dy of [-w, 0, w]) { const g = x.createRadialGradient(px + dx, py + dy, 0, px + dx, py + dy, s); g.addColorStop(0, `rgba(255,255,255,${R.r(0.2, 0.5)})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(px + dx - s, py + dy - s, s * 2, s * 2); } }
  }, 256, 256, false);
}

// the town's houses: [x, z, w (along x), d (along z), h, ridgeAlongZ, colour, roofColour] — rows down the slope, a main street to the sea
function townList() {
  const R = RNG('town3'), L = [], WALL = ['#d9cdb4', '#c9a27a', '#b8735e', '#e2d8c6', '#9bb0b0', '#d8c27a', '#b98a64', '#cfb8a0', '#a7b49a', '#c99c96', '#e8dcc4'], ROOF = ['#b5523a', '#a8472f', '#c46a48', '#8a4a3a', '#9a5a40', '#6a6a70'];
  for (let z = -71; z < 32; z += R.r(9.6, 11.4)) {
    const half = Math.min(0.4 * (CAMZ0 - z) + 26, 70); let x = -half - R.r(0, 6);
    while (x < half) {
      const w = R.r(6.5, 11.5);
      if (x + w > -4.6 && x < 4.6) { x = 4.6 + R.r(0, 0.5); continue; }
      const cx = x + w / 2;
      if (!(cx > -21 && cx < -4 && z > -72 && z < -48) && !(cx > -15 && cx < -3.5 && z > -17 && z < -4)) {   // the church square
        const d = R.r(7.4, 8.8), fl = Math.floor(R.r(3, 6.4)), h = fl * 3 + R.r(0.3, 0.9);
        L.push([cx, z + R.r(-0.6, 0.6), w - 0.1, d, h, R.f() < 0.18, R.pick(WALL), R.pick(ROOF)]);
      }
      x += w + (R.f() < 0.16 ? R.r(2.6, 4.5) : R.r(0, 0.4));
    }
  }
  L.push([TERR.x, TERR.z, 8.7, 8, 13.6, false, '#d8c8a8', '#000000', undefined, true]);   // the roof terrace near the camera
  return L;
}
function shoreList() {   // houses along the left harbour quay, facing the water
  const R = RNG('shore'), L = [], WALL = ['#e2d8c6', '#d8c27a', '#c99c96', '#9bb0b0', '#e8dcc4', '#c9a27a', '#b8735e'], ROOF = ['#b5523a', '#a8472f', '#c46a48', '#8a4a3a'];
  for (let z = -90; z > -335; z -= R.r(8.5, 12)) for (let row = 0; row < 3; row++) { const d = R.r(7.5, 10), w = R.r(8, 11), fl = Math.floor(R.r(2, 5.5)) + (row === 2 ? 1 : 0);
    L.push([xL(z) - 9 - row * 12.5 - R.r(0, 2), z, d, w, fl * 3 + 0.5, true, R.pick(WALL), R.pick(ROOF), PROM]); }
  return L;
}
// the moored boats (kind, length, x, z, yaw, phase) — shared with the score
function boatList() {
  return [['trawler', 16, 14, -96, 0.25, 0.3], ['yacht', 12, -6, -92, -0.15, 1.1], ['sail', 10, 26, -118, 1.5, 2.1], ['yacht', 9, 4, -125, 1.6, 0.7], ['sail', 11, -20, -140, 1.3, 3.3],
    ['fish', 7, 40, -150, 1.9, 4.1], ['dinghy', 4, 8, -86, 0.1, 5.2], ['yacht', 10, -26, -180, 1.45, 1.7], ['fish', 8, 30, -200, -0.1, 2.6], ['sail', 9, -8, -215, 1.6, 3.7],
    ['trawler', 14, 52, -250, 0.3, 4.4], ['sail', 9, -36, -250, 1.5, 0.9], ['fish', 7, 18, -280, 1.4, 2.2], ['yacht', 11, -50, -300, 1.6, 5.5], ['dinghy', 4, -32, -100, 1.2, 0.4]];
}
const boatDraft = (kind, L) => L * (kind === 'dinghy' ? 0.16 : 0.2) * 0.4;
function boatSettleT(b) { const [kind, L, x, z] = b, bc = gH(x, z), d = boatDraft(kind, L); for (let t = 48.6; t < 56; t += 0.02) if (seaLevel(t) - d < bc) return t; return null; }
// the falling fragments: start in the sky, impact beyond the town (time, sky start, impact point) — shared with the score
function meteorList() {
  const R = RNG('meteors2'), L = [];
  for (let i = 0; i < 44; i++) { const t0 = 38.4 + 9.0 * Math.pow(i / 44, 0.85) + R.r(-0.3, 0.3), dur = R.r(1.3, 2.6);
    const azS = (7 + R.n(16)) * DEG, elS = R.r(12, 30) * DEG, azI = azS + R.n(5) * DEG + (R.f() < 0.5 ? -1 : 1) * R.r(2, 9) * DEG, Di = R.r(5000, 15000), big = R.f() < 0.22;
    L.push({ t0, dur, ti: t0 + dur, azS, elS, azI, Di, big, s: big ? R.r(1.6, 2.4) : R.r(0.7, 1.3) }); }
  L.push({ t0: 46.6, dur: 1.6, ti: 48.2, azS: 3 * DEG, elS: 27 * DEG, azI: -2 * DEG, Di: 8000, big: true, s: 3.4, ocean: true });
  return L;
}
const meteorPos = (m, u) => { const S = dirV(m.azS, m.elS).multiplyScalar(m.Di * 1.15).add(new THREE.Vector3(0, EYE, CAMZ0)), P = new THREE.Vector3(Math.sin(m.azI) * m.Di, 0, CAMZ0 - Math.cos(m.azI) * m.Di); return S.lerp(P, Math.pow(clamp(u), 1.3)); };
const meteorP = (m) => meteorPos(m, 1);

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
  scene.fog = new THREE.Fog(0x1a2236, 300, 22000);
  const cam = new THREE.PerspectiveCamera(64, W / H, 0.5, 26000); cam.rotation.order = 'YXZ'; scene.add(cam);

  // --- sky dome (skips tone mapping): night gradient, a halo round the Moon, a fire glow on the horizon
  const skyU = { top: { value: lin('#070b18') }, mid: { value: lin('#121a33') }, hor: { value: lin('#2a3352') }, moonDir: { value: new THREE.Vector3(0, 0.2, -1) }, halo: { value: 0.2 }, haloW: { value: 0.01 },
    fire: { value: 0 }, fireCol: { value: lin('#ff7a30') }, dark: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(22000, 64, 32), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, mid, hor, moonDir, fireCol; uniform float halo, haloW, fire, dark; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, 0.0, 1.0);
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.2, pow(h, 0.8))); c = mix(c, top, smoothstep(0.15, 0.8, h));
        float a = acos(clamp(dot(d, moonDir), -1.0, 1.0));
        c += vec3(0.75, 0.8, 0.9) * halo * (0.6 * exp(-a * a / haloW) + 0.25 * exp(-a * 2.5));
        c += fireCol * fire * (exp(-abs(d.y) * 9.0) * 0.9 + exp(-abs(d.y) * 2.5) * 0.25) * (0.75 + 0.25 * sin(atan(d.x, -d.z) * 7.0 + 1.3));
        c *= 1.0 - dark;
        gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }`,
  }));
  sky.renderOrder = -2; scene.add(sky);
  // --- stars
  const stars = (() => { const R = RNG('stars'), n = 1500, p = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const az = R.r(-Math.PI, Math.PI), el = Math.asin(R.r(0.02, 1)), v = dirV(az, el).multiplyScalar(20000); p.set([v.x, v.y, v.z], i * 3); const b = R.r(0.25, 1) ** 2, w = R.f() < 0.2; col.set([b * (w ? 1 : 0.85), b * 0.9, b * (w ? 0.8 : 1)], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.Points(g, new THREE.PointsMaterial({ size: 2.6, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false, map: g3Radial([[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.7)'], [1, 'rgba(255,255,255,0)']], 32) }));
    m.renderOrder = -1; scene.add(m); return m; })();
  // --- clouds: a thin drifting layer
  const cloudTex = texCloud(), puffTex = texPuff('puff'), mistTex = texPuff('mist', 34, 0.3), smokeTex = texPuff('smoke', 40, 0.34);
  const clouds = []; { const R = RNG('clouds2'); for (let i = 0; i < 14; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, transparent: true, depthWrite: false, opacity: 0.5 }));
    s.userData = { ang: R.r(-0.7, 0.7), D: R.r(7000, 16000), y: R.r(900, 2600), w: R.r(4000, 9000), a: R.r(0.12, 0.22), v: R.r(0.002, 0.005), ph: R.r(0, 9), o: R.r(0.35, 0.7) };
    scene.add(s); clouds.push(s); } }

  // --- lights: moonlight (later the fire on the horizon) casts soft shadows; a dim sky dome
  const hemi = new THREE.HemisphereLight(0x5a6c94, 0x1a1a22, 0.4); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xc8d6ff, 0.4);
  key.target.position.set(0, 8, -40); scene.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 5; key.shadow.blurSamples = 16;
  Object.assign(key.shadow.camera, { left: -120, right: 120, top: 120, bottom: -120, near: 150, far: 900 }); key.shadow.bias = -0.0006;
  const fill = new THREE.DirectionalLight(0xff8a50, 0); fill.position.set(0, 60, -500); scene.add(fill);

  // --- the ground: cobbled town slope + promenade (x ±170, quay to behind the camera)
  const cobTex = wrap(texCobbles()); cobTex.anisotropy = ANI;
  { const g = new THREE.PlaneGeometry(340, 120, 85, 60); g.rotateX(-Math.PI / 2); g.translate(0, 0, QZ + 60);
    const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, gH(x, Math.max(z, QZ + 0.01))); uv.setXY(i, x / 8, z / 8); }
    g.computeVertexNormals(); const m = new THREE.Mesh(g, STD({ map: cobTex, roughness: 0.75, color: 0x55524d })); m.receiveShadow = true; scene.add(m); }
  // --- the sea floor below the quay (seen when the sea pulls back)
  { const nx = 120, nz = 110, g = new THREE.PlaneGeometry(2, 1, nx, nz); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, cols = [], sand = lin('#5a4c3a'), mud = lin('#3a3228'), weed = lin('#2f3a24');
    for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = 0.5 - p.getZ(i), x = Math.sign(u) * 1400 * Math.pow(Math.abs(u), 1.7), z = QZ - 0.5 - 2500 * Math.pow(v, 1.9);
      p.setXYZ(i, x, gH(x, z), z); const nA = 0.5 + 0.5 * Math.sin(x * 0.07 + z * 0.05) * Math.sin(z * 0.09 - x * 0.04); const c = sand.clone().lerp(mud, nA * 0.7).lerp(weed, ss(30, 2, QZ - z) * 0.8); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
    const bed = new THREE.Mesh(g, STD({ vertexColors: true, roughness: 0.6, metalness: 0.1 })); bed.receiveShadow = true; scene.add(bed); }
  // --- rocks, weed and junk on the harbour floor
  { const R0 = RNG('bedstuff'), rockM = STD({ color: 0xffffff, roughness: 0.9, flatShading: true }), n = 260, rocks = IM(new THREE.DodecahedronGeometry(1, 0), rockM, n);
    for (let i = 0; i < n; i++) { const near = i < 90, z = near ? QZ - R0.r(0.5, 6) : QZ - R0.r(15, 330), x = near ? R0.r(-60, 60) : R0.r(xL(z) + 2, 90), s = near ? R0.r(0.6, 1.6) : R0.r(0.2, 1.1);
      rocks.setMatrixAt(i, M4c(x, gH(x, z) + s * 0.25, z, R0.r(0, 3), s * R0.r(0.8, 1.6), s * R0.r(0.45, 0.8), s * R0.r(0.8, 1.4), R0.r(0, 1), R0.r(0, 1))); rocks.setColorAt(i, lin(R0.pick(['#5f584e', '#4d473f', '#6a6256', '#3b3a30', '#33402a']))); }
    scene.add(rocks); }

  // --- the sea: one shader — deep navy, sky reflection, a moon (later fire) glitter path, foam where it meets the ground; its level is the tide
  const seaU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uLevel: { value: 0.3 }, uMoon: { value: new THREE.Vector3(0, 0.2, -1) }, uMoonCol: { value: lin('#dfe6ff') }, uGlit: { value: 1 }, uGK: { value: 400 },
    uTop: { value: lin('#070b18') }, uHor: { value: lin('#2a3352') }, uShallow: { value: lin('#1f3c44') }, uMid: { value: lin('#122b38') }, uDeep: { value: lin('#0a1a28') }, uFar: { value: lin('#26304a') },
    uDark: { value: 0 }, uChurn: { value: 0 }, uFlood: { value: 0 }, uToe: { value: -1e6 }, uToeOn: { value: 0 }, uToeW: { value: 60 }, uLamps: { value: Array.from({ length: 24 }, () => new THREE.Vector3(0, -1e4, 0)) }, uFire: { value: 0 }, uFireCol: { value: lin('#ff7a30') }, uIce: { value: 0 }, uIceCol: { value: lin('#cfe0ea') } }]);
  const seaMat = new THREE.ShaderMaterial({ uniforms: seaU, fog: true, transparent: true, depthWrite: true,
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT, uLevel, uDark, uChurn, uGlit, uGK, uFire, uFlood, uToe, uToeOn, uToeW, uIce; uniform vec3 uLamps[24]; uniform vec3 uIceCol, uMoon, uMoonCol, uTop, uHor, uShallow, uMid, uDeep, uFar, uFireCol; varying vec3 vW; ${GH_GLSL}
      #include <fog_pars_fragment>
      void main(){ vec2 p = vW.xz; float t = uT; float dep = uLevel - gH(p);
        float dist = length(p - cameraPosition.xz), fine = 1.0 - smoothstep(150.0, 1200.0, dist), fine2 = 1.0 - smoothstep(40.0, 300.0, dist);
        float sw = 1.0 + 1.2 * uChurn;
        vec3 n = normalize(vec3(
          sw * (0.06 * sin(p.x * 0.11 + t * 0.9) + 0.05 * sin(p.x * 0.37 - p.y * 0.21 + t * 1.4)) + fine * (0.05 * sin(p.x * 1.3 + p.y * 0.9 + t * 2.1) + 0.04 * sin(p.x * 2.9 + p.y * 1.7 + t * 2.9)) + fine2 * 0.035 * sin(p.x * 7.1 - p.y * 5.3 + t * 4.3),
          1.0,
          sw * (0.06 * sin(p.y * 0.13 - t * 0.8) + 0.05 * sin(p.y * 0.41 + p.x * 0.17 - t * 1.2)) + fine * (0.05 * sin(p.y * 1.5 - p.x * 0.7 + t * 1.9) + 0.04 * sin(p.y * 3.3 - p.x * 1.1 + t * 3.1)) + fine2 * 0.035 * sin(p.y * 8.3 + p.x * 4.1 - t * 4.7)));
        // fine ripples (several crossing octaves) close to the camera, so the water reads as water, not as smooth blobs
        { float f3 = 1.0 - smoothstep(10.0, 140.0, dist);
          float r1 = sin(p.x * 13.7 + p.y * 9.1 + t * 6.3) * sin(p.y * 11.3 - p.x * 4.7 - t * 5.1), r2 = sin(p.x * 23.1 - p.y * 17.9 + t * 8.7), r3 = sin(p.y * 29.3 + p.x * 21.7 - t * 9.9) * sin(p.x * 3.1 + t);
          n.x += f3 * (0.05 * r1 + 0.025 * r2); n.z += f3 * (0.05 * sin(p.y * 15.9 + p.x * 6.3 - t * 6.9) + 0.025 * r3); n = normalize(n); }
        n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(3000.0, 15000.0, dist) * 0.7));
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n);
        float fres = 0.02 + 0.98 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
        vec3 skyR = mix(uHor, uTop, pow(clamp(Rf.y, 0.0, 1.0), 0.55));
        skyR += uFireCol * uFire * exp(-abs(Rf.y) * 9.0) * 0.8;
        vec3 body = mix(uShallow, uMid, smoothstep(0.0, 3.0, dep)); body = mix(body, uDeep, smoothstep(3.0, 14.0, dep)); body = mix(body, uFar, smoothstep(1500.0, 9000.0, dist) * 0.6);
        vec3 col = mix(body, skyR, clamp(fres * 0.7, 0.0, 1.0));
        float sd = max(dot(Rf, uMoon), 0.0);
        col += uMoonCol * uGlit * (pow(sd, uGK * 3.0) * 7.0 + pow(sd, max(10.0, uGK * 0.12)) * 0.05);
        // depth tint and a soft colour variation across the surface (wind patches)
        col *= 0.92 + 0.08 * sin(p.x * 0.031 + p.y * 0.017 + t * 0.2) * sin(p.y * 0.023 - p.x * 0.011);
        for (int i = 0; i < 24; i++) { vec3 Ld = uLamps[i] - vW; float ld = length(Ld), s = max(dot(Rf, Ld / ld), 0.0); col += vec3(1.0, 0.72, 0.42) * (pow(s, 1400.0) * 4.0 + pow(s, 160.0) * 0.25) * (1.0 - smoothstep(40.0, 260.0, ld)); }
        float fw = 0.22 + 0.08 * sin(t * 0.8 + p.x * 0.03);
        float foam = exp(-dep * dep / (fw * fw)) * 0.8 * (0.6 + 0.4 * sin(p.x * 0.9 + p.y * 0.5 + t * 1.3));
        foam += uFlood * (1.0 - smoothstep(0.0, 1.4, dep)) * smoothstep(0.35, 0.9, sin(p.x * 0.7 + p.y * 1.9 - t * 2.4) * sin(p.y * 0.9 - p.x * 0.3 + t * 1.3) * 0.5 + 0.5) * 0.7;
        float toeF = 0.0;
        { float wz = vW.z - (uToe - vW.x * vW.x / 160000.0), band = step(-6.0, wz) * (1.0 - smoothstep(uToeW * 0.15, uToeW, wz));
          float tn = sin(p.x * 0.11 + t * 1.7 + sin(p.y * 0.07 - t) * 2.0) * sin(p.y * 0.13 - t * 2.3 + sin(p.x * 0.05) * 2.0) + 0.5 * sin(p.x * 0.43 - p.y * 0.37 + t * 3.1);
          toeF = uToeOn * band * smoothstep(-0.2, 0.9, tn) * (0.55 + 0.45 * (1.0 - smoothstep(0.0, uToeW, wz))); }
        foam += uChurn * smoothstep(0.55, 1.0, sin(p.x * 0.31 + t * 2.0) * sin(p.y * 0.27 - t * 1.7 + p.x * 0.05)) * 0.12 * (1.0 - smoothstep(0.0, 0.5, uDark));
        col = mix(col, mix(skyR, vec3(0.7, 0.74, 0.8), 0.5), clamp(foam, 0.0, 1.0));
        col = mix(col, vec3(0.86, 0.83, 0.79), clamp(toeF, 0.0, 1.0));
        // sol: sea ice grows out from the shore (front at uIce*2600 m): plates with dark cracks, pale ridges, snow on top
        float iceM = 0.0;
        if (uIce > 0.0) { float off = -78.0 - vW.z + 40.0 * sin(p.x * 0.013) + 18.0 * sin(p.x * 0.051 + 1.3), fr = uIce * 2600.0;
          iceM = 1.0 - smoothstep(fr - 60.0, fr, off);
          vec2 q = p * 0.16; vec2 c = floor(q); float cr = 9.0, cr2 = 9.0;
          for (int k = 0; k < 9; k++) { vec2 h = c + vec2(float(k / 3) - 1.0, float(k - (k / 3) * 3) - 1.0); vec2 jp = h + 0.5 + 0.4 * vec2(sin(dot(h, vec2(12.9, 78.2)) * 43.7), sin(dot(h, vec2(39.3, 11.1)) * 31.3)); float d = length(q - jp); if (d < cr) { cr2 = cr; cr = d; } else if (d < cr2) cr2 = d; }
          float edge = 1.0 - smoothstep(0.0, 0.06, cr2 - cr);
          float plate = 0.5 + 0.5 * sin(p.x * 0.41 + sin(p.y * 0.33) * 2.0) * sin(p.y * 0.37 - p.x * 0.13);
          vec3 ice = mix(uIceCol * 0.8, uIceCol, plate) * (0.9 + 0.1 * sin(p.x * 1.7 + p.y * 2.3));
          ice = mix(ice, uIceCol * 1.35, smoothstep(0.35, 0.8, plate + 0.3 * sin(p.x * 0.6) * sin(p.y * 0.5)) * 0.5);
          ice *= 1.0 - 0.5 * edge * (1.0 - smoothstep(200.0, 2500.0, dist));
          ice += 0.15 * (1.0 - smoothstep(0.0, 25.0, fr - off)) * iceM;
          col = mix(col, ice * (0.8 + 0.2 * fres) + skyR * 0.06, iceM); }
        col *= 1.0 - uDark;
        float al = mix(0.45, 1.0, smoothstep(0.0, 1.6, dep)); al = max(al, iceM); al = max(al, clamp(toeF, 0.0, 1.0)); al = max(al, clamp(foam, 0.0, 1.0)); al *= smoothstep(-0.02, 0.06, dep);
        if (al < 0.01) discard;
        gl_FragColor = vec4(col, al);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }` });
  const seaGeo = new THREE.PlaneGeometry(52000, 26080, 1, 1); seaGeo.rotateX(-Math.PI / 2); seaGeo.translate(0, 0, -13000 + 40);
  const seaMesh = new THREE.Mesh(seaGeo, seaMat); scene.add(seaMesh);

  // --- shared materials
  const concrete = STD({ color: 0x8a8478, roughness: 0.9 }), wallTex = wrap(texQuayWall(), 1, 1);
  const quayMat = STD({ map: wallTex, roughness: 0.95 }), white = STD({ color: 0xf2efe8, roughness: 0.6 }), red = STD({ color: 0xc8372d, roughness: 0.6 });
  const dark = STD({ color: 0x23292e, roughness: 0.5, metalness: 0.3 }), lampGlass = new THREE.MeshBasicMaterial({ color: 0xfff1cc });
  // the quay wall along the promenade, the left harbour quay, the lighthouse jetty
  { const q = new THREE.Mesh(new THREE.BoxGeometry(420, 12, 4), [quayMat, quayMat, concrete, concrete, quayMat, quayMat]); q.position.set(0, PROM - 6, QZ + 2); q.receiveShadow = true; scene.add(q);
    const uv = q.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 30, uv.getY(i)); }
  const landBlock = (A, B, w, side, top) => {
    const dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz), ang = Math.atan2(dx, dz), nx = -side * dz / len, nz = side * dx / len;
    const g = new THREE.BoxGeometry(w, top + 24, len); const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / 14, uv.getY(i) * (top + 24) / 14);
    const m = new THREE.Mesh(g, [quayMat, quayMat, concrete, quayMat, quayMat, quayMat]);
    m.position.set((A[0] + B[0]) / 2 + nx * w / 2, (top - 24) / 2, (A[1] + B[1]) / 2 + nz * w / 2); m.rotation.y = ang; m.receiveShadow = true; scene.add(m); return m; };
  landBlock([xL(QZ), QZ], [xL(-345), -345], 500, -1, PROM);
  { const j = new THREE.Mesh(new THREE.BoxGeometry(210, 15, 10), [quayMat, quayMat, concrete, concrete, quayMat, quayMat]); j.position.set(116, 4.2 - 7.5, -335); j.receiveShadow = true; j.castShadow = true; scene.add(j);
    const uv = j.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 14, uv.getY(i)); }
  const lighthouse = new THREE.Group(); lighthouse.position.set(14, 4.2, -335); scene.add(lighthouse);
  for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(1.5 - k * 0.12, 1.62 - k * 0.12, 3.2, 14), k % 2 ? white : red); s.position.y = 1.6 + k * 3.2; s.castShadow = true; lighthouse.add(s); }
  { const gal = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.3, 14), dark); gal.position.y = 16.15; lighthouse.add(gal);
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 12), lampGlass); lamp.position.y = 17; lighthouse.add(lamp);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.4, 12), red); cap.position.y = 18.4; lighthouse.add(cap); }
  // the sweeping beam: a long open cone, additive, fading along its length
  const beamMat = new THREE.ShaderMaterial({ uniforms: { uA: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float uA; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float along = vUv.y; float edge = pow(abs(dot(vN, vV)), 1.5); float a = uA * pow(along, 2.2) * edge * 0.55; gl_FragColor = vec4(vec3(1.0, 0.95, 0.82) * a, 1.0); }' });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(55, 900, 24, 1, true).translate(0, -450, 0).rotateZ(Math.PI / 2), beamMat);
  const beamPivot = new THREE.Group(); beamPivot.position.set(14, 4.2 + 17, -335); beamPivot.add(beam); scene.add(beamPivot); beam.renderOrder = 8;

  // --- the town: instanced houses whose windows switch on (world-sized facade sheet + light sheet), gable roofs, chimneys, antennas
  const facTex = wrap(texFacade()), litTex = wrap(texWindowsLit()), roofTex = wrap(texRoof()); facTex.anisotropy = ANI; roofTex.anisotropy = ANI;
  const FAC_V = `
    vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
    vec3 ip = instanceMatrix[3].xyz; float hs = fract(sin(dot(ip.xz, vec2(12.9898, 78.233))) * 43758.5453);
    vec3 lp = (position + 0.5) * sc;
    vFac = abs(normal.x) > 0.5 ? vec2(lp.z, lp.y - 4.0) : vec2(lp.x, lp.y - 4.0);
    vFac = vFac / 24.0 + vec2(floor(hs * 8.0) / 8.0, floor(fract(hs * 7.3) * 8.0) / 8.0);`;
  const houseMat = olShade(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, emissive: 0xffffff }), (sh) => {
    Object.assign(sh.uniforms, { uFacM: { value: facTex }, uFacE: { value: litTex }, uOn: WIN.uOn, uWT: WIN.uT, uPow: WIN.uPow });
    sh.vertexShader = 'varying vec2 vFac;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + FAC_V);
    sh.fragmentShader = 'uniform sampler2D uFacM, uFacE; uniform float uOn, uWT, uPow; varying vec2 vFac;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= texture2D(uFacM, vFac).rgb;')
      .replace('#include <emissivemap_fragment>', `{ vec4 e = texture2D(uFacE, vFac); float th = (e.a - 0.25) / 0.74; float cellH = fract(sin(dot(floor(vFac * 8.0), vec2(41.3, 17.7))) * 9137.1);
        float on = step(th, uOn) * step(0.05, e.a); float tv = step(e.r * 1.2, e.b); float fl = 1.0 - tv * (0.25 + 0.25 * sin(uWT * (5.0 + 9.0 * cellH) + cellH * 40.0));
        on *= step(uDead, fract(sin(dot(floor(vOlW.xz / 40.0), vec2(12.9898, 78.233))) * 43758.5453));
        totalEmissiveRadiance = e.rgb * on * fl * 4.5 * uPow / max(vec3(0.001), diffuseColor.rgb * 0.0 + 1.0); }`);
  });
  const roofGeo = (() => { const P = [], U = [], A = [];
    const q = (a, b, c, d, ua, ub, uc, ud, g) => { P.push(...a, ...c, ...b, ...a, ...d, ...c); U.push(...ua, ...uc, ...ub, ...ua, ...ud, ...uc); for (let k = 0; k < 6; k++) A.push(g); };
    q([-0.5, 0, -0.5], [0.5, 0, -0.5], [0.5, 1, 0], [-0.5, 1, 0], [0, 0], [1, 0], [1, 1], [0, 1], 0);
    q([0.5, 0, 0.5], [-0.5, 0, 0.5], [-0.5, 1, 0], [0.5, 1, 0], [0, 0], [1, 0], [1, 1], [0, 1], 0);
    P.push(-0.5, 0, 0.5, -0.5, 1, 0, -0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 1, 0, 0.5, 0, 0.5); U.push(0, 0, 0.5, 1, 1, 0, 0, 0, 0.5, 1, 1, 0); for (let k = 0; k < 6; k++) A.push(1);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setAttribute('aG', new THREE.Float32BufferAttribute(A, 1)); g.computeVertexNormals(); return g; })();
  const roofMat = olShade(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, map: roofTex }), (sh) => {
    sh.vertexShader = 'attribute float aG; varying float vG; varying vec2 vRf;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vG = aG;
      vRf = vec2(uv.x * sc.x, uv.y * length(vec2(sc.z * 0.5, sc.y))) / 2.0;`);
    sh.fragmentShader = 'varying float vG; varying vec2 vRf;\n' + sh.fragmentShader.replace('#include <map_fragment>', `vec4 rt = texture2D(map, vRf); diffuseColor.rgb *= mix(rt.rgb, vec3(0.62, 0.58, 0.52), vG);`);
  });
  const town = townList(), shore = shoreList(), allH = town.concat(shore), nH = allH.length;
  const houses = IM(new THREE.BoxGeometry(1, 1, 1), houseMat, nH), roofs = IM(roofGeo, roofMat, nH);
  const hMat = [], rMat = [], hPos = [];
  const chim = [], ants = []; { const R = RNG('chim');
    allH.forEach(([x, z, w, d, h, rz, wc, rc, y0f, flat], i) => {
      const y0 = y0f !== undefined ? y0f : gH(x, z - d / 2), rh = Math.min(w, d) * R.r(0.28, 0.38);
      const hm = M4c(x, y0 - 4 + (h + 4) / 2, z, 0, w, h + 4, d), rm = flat ? M4c(x, y0 + h, z, 0, 1e-4, 1e-4, 1e-4) : rz ? M4c(x, y0 + h, z, Math.PI / 2, d + 0.6, rh, w + 0.5) : M4c(x, y0 + h, z, 0, w + 0.5, rh, d + 0.6);
      houses.setMatrixAt(i, hm); roofs.setMatrixAt(i, rm); houses.setColorAt(i, lin(wc)); roofs.setColorAt(i, lin(rc)); hMat.push(hm); rMat.push(rm); hPos.push([x, z, y0 + h + rh, w]);
      if (flat) return;
      if (R.f() < 0.65) chim.push([x + R.r(-w / 3, w / 3), y0 + h + rh * 0.55, z + R.r(-d / 5, d / 5), R.r(0.6, 0.9), R.r(1.2, 2.2), i]);
      if (R.f() < 0.3 && y0f === undefined) ants.push([x + R.r(-w / 4, w / 4), y0 + h + rh, z, i]);
    }); }
  scene.add(houses, roofs);
  const brickM = STD({ color: 0x8a5a48, roughness: 0.9 }), chimI = IM(new THREE.BoxGeometry(1, 1, 1), brickM, chim.length), capI = IM(new THREE.BoxGeometry(1, 0.2, 1), dark, chim.length), cMat = [], kMat = [];
  chim.forEach(([x, y, z, s, hh], i) => { const a = M4c(x, y + hh / 2, z, 0, s, hh, s), b = M4c(x, y + hh + 0.1, z, 0, s * 1.25, 1, s * 1.25); chimI.setMatrixAt(i, a); capI.setMatrixAt(i, b); cMat.push(a); kMat.push(b); });
  scene.add(chimI, capI);
  const antI = IM(new THREE.CylinderGeometry(0.04, 0.04, 1, 4).translate(0, 0.5, 0), dark, ants.length * 3, false), aMat = [];
  ants.forEach(([x, y, z], i) => { const a = M4c(x, y, z, 0, 1, 2.6, 1), b = M4c(x, y + 2.2, z, 0, 1, 1.6, 1, 0, Math.PI / 2), c2 = M4c(x, y + 1.7, z, 0.6, 1, 1.1, 1, 0, Math.PI / 2); [a, b, c2].forEach((m, k) => { antI.setMatrixAt(i * 3 + k, m); aMat.push(m); }); });
  scene.add(antI);
  // the roof terrace: tiled floor, parapet, a stair hut with a lit door, plant pots, a table, a string of bulbs
  { const T0 = new THREE.Group(); T0.position.set(TERR.x, TERR.y, TERR.z); scene.add(T0); const tile = STD({ color: 0x9a7e6a, roughness: 0.85 }), par = STD({ color: 0xd8c8a8, roughness: 0.9 }), pot = STD({ color: 0xb0603a, roughness: 0.9 }), leaf = STD({ color: 0x3a6a34, roughness: 0.9, flatShading: true });
    const bx = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; T0.add(o); return o; };
    bx(8.7, 0.1, 8, tile, 0, 0.05, 0);
    bx(8.9, 1.0, 0.22, par, 0, 0.5, -4.0); bx(8.9, 1.0, 0.22, par, 0, 0.5, 4.0); bx(0.22, 1.0, 8, par, -4.35, 0.5, 0); bx(0.22, 1.0, 8, par, 4.35, 0.5, 0);
    bx(2.6, 2.7, 2.6, par, -2.9, 1.35, 2.6); const door = bx(0.9, 1.9, 0.05, new THREE.MeshBasicMaterial({ color: 0xffd090 }), -2.9, 0.95, 1.28); door.castShadow = false;
    for (const [x, z] of [[3.6, -3.4], [3.6, 3.2], [-0.6, 3.4], [1.5, -3.5]]) { bx(0.6, 0.55, 0.6, pot, x, 0.38, z); const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), leaf); l.position.set(x, 1.0, z); l.castShadow = true; T0.add(l); }
    bx(1.2, 0.06, 0.8, STD({ color: 0xe8e4dc, roughness: 0.6 }), 1.6, 0.75, 1.0); bx(0.08, 0.72, 0.08, dark, 1.6, 0.38, 1.0);
    const bulbs = []; for (let k = 0; k <= 14; k++) { const f = k / 14; bulbs.push([TERR.x - 4.2 + 8.4 * f, TERR.y + 2.4 - 0.6 * Math.sin(f * Math.PI), TERR.z + 3.6 - 7.2 * f]); }
    var terrBulbs = bulbs; }
  // the church: a bell tower with a lit clock, belfry and a pyramid roof, the nave behind it
  const church = new THREE.Group(); { const stone = STD({ color: 0xcfc2a6, roughness: 0.9 }), y0 = gH(-12, -62);
    church.position.set(-12, y0, -62); church.scale.setScalar(0.7); scene.add(church);
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(6, 27, 6), stone); t1.position.y = 13.5; t1.castShadow = true; t1.receiveShadow = true; church.add(t1);
    for (const [dx, dz, ry] of [[0, 3.02, 0], [0, -3.02, 0], [3.02, 0, Math.PI / 2], [-3.02, 0, Math.PI / 2]]) { const o = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.6, 0.1), dark); o.position.set(dx, 23, dz); o.rotation.y = ry; church.add(o); }
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 1.2, 12), STD({ color: 0x8a6a2a, metalness: 0.7, roughness: 0.4 })); bell.position.y = 22.6; church.add(bell);
    const clock = new THREE.Mesh(new THREE.CircleGeometry(1.3, 24), new THREE.MeshBasicMaterial({ color: 0xffe6b0 })); clock.position.set(0, 18, 3.03); church.add(clock);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.02), dark); hand.position.set(0, 18.35, 3.06); hand.rotation.z = 0.6; church.add(hand);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(4.8, 8, 4).rotateY(Math.PI / 4), STD({ color: 0x4f6a70, roughness: 0.7 })); rf.position.y = 31; rf.castShadow = true; church.add(rf);
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.6, 0.15), dark); cross.position.y = 35.8; church.add(cross);
    const nave = new THREE.Mesh(new THREE.BoxGeometry(10, 11, 18), stone); nave.position.set(0, 5.5, 12); nave.castShadow = true; nave.receiveShadow = true; church.add(nave);
    const nr = new THREE.Mesh(roofGeo, STD({ color: 0x9a4a36, roughness: 0.8 })); nr.position.set(0, 11, 12); nr.scale.set(18.6, 4.5, 10.8); nr.rotation.y = Math.PI / 2; church.add(nr);
    const rose = new THREE.Mesh(new THREE.CircleGeometry(1.4, 20), new THREE.MeshBasicMaterial({ color: 0xffc070 })); rose.position.set(5.05, 7.5, 12); rose.rotation.y = Math.PI / 2; church.add(rose); }
  // --- the headland on the left: a dark wooded hill with houses' lights and a road of lamps; a far headland on the right
  { const g = new THREE.PlaneGeometry(1250, 1800, 100, 120); g.rotateX(-Math.PI / 2); g.translate(-660, 0, -1180);
    const p = g.attributes.position, cols = [], tree = lin('#1e2a1e'), rock = lin('#4a463e'), grass = lin('#2e3a26');
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = hillY(x, z) + 1.5 * Math.sin(x * 0.3) * Math.sin(z * 0.27); p.setY(i, y); const nA = 0.5 + 0.5 * Math.sin(x * 0.05) * Math.sin(z * 0.043); const c = grass.clone().lerp(tree, nA).lerp(rock, ss(10, -6, y) * 0.8); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
    const hill = new THREE.Mesh(g, STD({ vertexColors: true, roughness: 1 })); hill.receiveShadow = true; scene.add(hill);
    const g2 = new THREE.SphereGeometry(1, 48, 16, 0, TAU, 0, Math.PI / 2); g2.scale(2600, 240, 1100); const far = new THREE.Mesh(g2, STD({ color: 0x232a2c, roughness: 1 })); far.position.set(4200, -10, -9000); scene.add(far); }
  // lights on the hill, the quays and the streets: glow points (size in metres) and warm pools on the ground
  const glowTex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,240,210,0.8)'], [0.5, 'rgba(255,190,110,0.18)'], [1, 'rgba(255,170,90,0)']], 64);
  const pts = (list, size, col) => { const p = new Float32Array(list.length * 3); list.forEach((v, i) => p.set(v, i * 3)); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const m = new THREE.Points(g, new THREE.PointsMaterial({ size, map: glowTex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); m.renderOrder = 6; scene.add(m); return m; };
  const lampList = [], hillDots = [];
  for (let z = -66; z < 6; z += 11) { lampList.push([-4.2, gH(-4.2, z) + 4.5, z], [4.2, gH(4.2, z + 5.5) + 4.5, z + 5.5]); }
  for (let x = -60; x <= 60; x += 10) lampList.push([x, PROM + 4.5, QZ + 3]);
  for (let z = -90; z > -335; z -= 14) lampList.push([xL(z) - 2.5, PROM + 4.5, z]);
  for (let x = 30; x < 220; x += 24) lampList.push([x, 4.2 + 4, -335]);
  { const R = RNG('hilllights'); for (let i = 0; i < 260; i++) { const x = R.r(-1150, -120), z = R.r(-2000, -380), y = hillY(x, z); if (y < 6 || y > 150) { i--; continue; } hillDots.push([x, y + 3, z]); }
    for (let k = 0; k < 40; k++) { const u = k / 40, x = lerp(-140, -900, u), z = lerp(-420, -1500, u) + Math.sin(u * 9) * 60; hillDots.push([x, hillY(x, z) + 5, z]); } }
  lampList.filter(([, , z]) => z < -30).slice(0, 24).forEach(([x, y, z], i) => seaU.uLamps.value[i].set(x, y, z));
  pts(terrBulbs, 0.7, 0xffe0a8);
  const lamps = pts(lampList, 3.2, 0xffd7a0), hillL = pts(hillDots, 9, 0xffcf90);
  const poolTex = g3Radial([[0, 'rgba(255,190,120,0.55)'], [0.5, 'rgba(255,170,90,0.2)'], [1, 'rgba(255,160,80,0)']], 64);
  const pools = IM(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -4 }), lampList.length, false);
  lampList.forEach(([x, y, z], i) => pools.setMatrixAt(i, M4c(x, y - 4.45, z, 0, 11, 1, 11))); scene.add(pools);
  const poles = IM(new THREE.CylinderGeometry(0.07, 0.1, 4.4, 6).translate(0, 2.2, 0), dark, lampList.length); lampList.forEach(([x, y, z], i) => poles.setMatrixAt(i, M4c(x, y - 4.5, z))); scene.add(poles);
  // a car's headlights along the waterfront (9-14s) and a bollard row on the quay
  const car = pts([[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]], 2.4, 0xfff4d8);
  { const n = 26, b = IM(new THREE.CylinderGeometry(0.18, 0.22, 0.5, 8), dark, n); for (let i = 0; i < n; i++) b.setMatrixAt(i, M4c(-62 + i * 5, PROM + 0.25, QZ + 0.5)); scene.add(b); }

  // --- boats: swept hulls with stripes and superstructures; they float with the tide and settle on the mud when it goes
  const hullMat = STD({ vertexColors: true, roughness: 0.45, side: THREE.DoubleSide, flatShading: true });
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
  boatList().forEach(([kind, L, x, z, yaw, ph]) => {
    const grp = new THREE.Group(), B = L * (kind === 'sail' ? 0.32 : 0.36), D = L * (kind === 'dinghy' ? 0.16 : 0.2);
    const C = { trawler: { top: '#c8372d', stripe: '#f2efe8', bot: '#2b2f33', deck: '#8a8072' }, yacht: { top: '#f4f2ec', stripe: '#1f3a5f', bot: '#1f3a5f', deck: '#b89a72' },
      sail: { top: '#f4f2ec', stripe: '#2f6fb0', bot: '#7a2a24', deck: '#c4a67c' }, dinghy: { top: '#e8662e', stripe: '#f4f2ec', bot: '#3a3f44', deck: '#d8d0c0' }, fish: { top: '#2f6fb0', stripe: '#f4f2ec', bot: '#8a2a22', deck: '#9a9080' } }[kind];
    const hull = new THREE.Mesh(hullGeo(L, B, D, C), hullMat); hull.castShadow = true; hull.receiveShadow = true; grp.add(hull);
    const box = (w, h, d, m, px, py, pz) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(px, py, pz); b.castShadow = true; grp.add(b); return b; };
    if (kind === 'trawler') { box(L * 0.22, D * 1.1, B * 0.62, white, -L * 0.12, D * 1.55, 0); box(L * 0.225, D * 0.28, B * 0.64, dark, -L * 0.12, D * 1.75, 0); box(0.18, L * 0.55, 0.18, dark, L * 0.18, D + L * 0.27, 0);
      const wl = box(L * 0.06, D * 0.3, B * 0.3, lampGlass, -L * 0.12, D * 1.5, B * 0.32); wl.castShadow = false; }
    else if (kind === 'yacht') { box(L * 0.45, D * 0.8, B * 0.7, white, -L * 0.02, D * 1.35, 0); box(L * 0.46, D * 0.3, B * 0.72, dark, -L * 0.02, D * 1.45, 0); box(L * 0.25, D * 0.5, B * 0.55, white, -L * 0.1, D * 1.95, 0); }
    else if (kind === 'sail') { box(L * 0.3, D * 0.45, B * 0.55, white, -L * 0.05, D * 1.2, 0); box(0.12, L * 1.35, 0.12, white, L * 0.08, D + L * 0.67, 0); }
    else if (kind === 'fish') box(L * 0.22, D * 1.2, B * 0.6, white, -L * 0.15, D * 1.5, 0);
    grp.rotation.order = 'YXZ'; scene.add(grp);
    boats.push({ grp, x, z, yaw, D, L, ph, roll: (ph * 7.3) % 2 < 1 ? 1 : -1 });
  });

  // --- people: smooth instanced bodies in everyday clothes, with roles (promenade walkers, people coming out, the left quay, street runners)
  const SHIRT = ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#f4f1ea', '#7b4fc9', '#ef8a3a', '#3cae5c', '#1f2d3d', '#9fc2e0', '#c2185b'];
  const PANTS = ['#2b3a55', '#3a3a3a', '#c8b89a', '#1f2d3d', '#6a7a8a', '#4a5a3a', '#e8e2d6'], SKIN = ['#f3cfae', '#e8bb94', '#d4a07a', '#b07a54', '#8a5a3a', '#5e3a26'], HAIR = ['#2a1d16', '#4a3020', '#7a5230', '#c9a060', '#1a1a1a', '#8a4a2a', '#b8b0a8'];
  const RP = RNG('people3'), ppl = [];
  const person = (role, x, z, o = {}) => { const kid = o.kid ?? RP.f() < 0.08, shirt = RP.pick(SHIRT), skin = RP.pick(SKIN), shorts = RP.f() < 0.2;
    ppl.push(Object.assign({ role, x, z, yaw: Math.PI, kid, s: kid ? RP.r(0.6, 0.72) : RP.r(0.92, 1.08), w: RP.r(0.9, 1.2), ph: RP.r(0, TAU),
      c: (() => { const pants = lin(RP.pick(PANTS)), longS = RP.f() < 0.7; return { skin: lin(skin), shirt: lin(shirt), pants, shin: shorts ? lin(skin) : pants, sleeve: lin(shirt), fore: longS ? lin(shirt) : lin(skin),
        shoe: lin(RP.pick(['#1e1e22', '#f2f0ea', '#5a4030', '#2f4a6a'])), hair: lin(RP.pick(HAIR)) }; })(), longHair: RP.f() < 0.4,
      v: 0, stopT: RP.r(7, 14), look: RP.n(0.3), fleeT: RP.r(19.4, 22.2), runT: 1e9, rv: RP.r(3.2, 5.6), point: RP.f() < 0.3, pointT: RP.r(12, 18) }, o)); };
  for (let i = 0; i < 18; i++) person('prom', RP.r(-34, 34), RP.r(QZ + 2.2, QZ + 9), { v: (RP.f() < 0.5 ? 1 : -1) * RP.r(0.8, 1.4), stopT: RP.r(6.5, 14) });
  for (let i = 0; i < 26; i++) { const x = (RP.f() < 0.5 ? -1 : 1) * RP.r(5.5, 36); person('out', x, -66.4, { outT: RP.r(5.6, 15.5), stopZ: RP.r(-69, QZ + 3) }); }
  for (let i = 0; i < 30; i++) { const z = -RP.r(92, 320); person('quay', xL(z) - RP.r(1.2, 6), z, { yaw: Math.PI / 2 + RP.n(0.4), v: (RP.f() < 0.5 ? 1 : -1) * RP.r(0.7, 1.2), stopT: RP.r(6, 13), fleeT: RP.r(20, 24), quay: true }); }
  for (let i = 0; i < 26; i++) person('street', RP.r(-3, 3), -RP.r(30, 66), { runT: RP.r(38.6, 49), rv: RP.r(4.2, 6.5), kid: false });
  // close figures: a family on the roof terrace below the camera, neighbours in the street just below
  [[-7.2, -13.6, 6.2, true], [-6.0, -13.5, 7.4, false], [-8.4, -13.4, 9.0, true], [-5.3, -12.4, 10.6, false]].forEach(([x, z, outT, pt], i) =>
    person('terr', x, z, { x0: TERR.x - 2.9, z0: TERR.z + 1.2, outT, fleeT: 38.7 + i * 0.35, point: pt, pointT: 12 + i * 1.5, look: RP.n(0.15), kid: i === 2, rv: 3.2 }));
  for (let i = 0; i < 9; i++) { const sd = i % 2 ? 1 : -1, z = -RP.r(17, 36); person('swatch', sd * RP.r(0.6, 3.2), z, { x0: sd * 4.4, z0: z + RP.r(-1, 1), outT: RP.r(7, 15), fleeT: RP.r(38.5, 41), rv: RP.r(4, 6), kid: RP.f() < 0.15 }); }
  const N = ppl.length;
  const foldTex = g3Tex((x, w, h) => { x.fillStyle = '#f4f4f4'; x.fillRect(0, 0, w, h); const R = RNG('folds');
    for (let i = 0; i < 26; i++) { const px = R.r(0, w), ww = R.r(3, 12), g = x.createLinearGradient(px - ww, 0, px + ww, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, `rgba(0,0,0,${R.r(0.08, 0.2)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - ww, R.r(0, h * 0.4), ww * 2, R.r(h * 0.3, h)); } }, 128, 128);
  const clothM = STD({ map: foldTex, roughness: 0.88 }), skinM = STD({ roughness: 0.55 }), hairM = STD({ roughness: 0.7 }), shoeM = STD({ roughness: 0.5 });
  const lathe = (pts2, seg2 = 12) => new THREE.LatheGeometry(pts2.slice().sort((a, b) => a[1] - b[1]).map(([rr, y]) => new THREE.Vector2(rr, y)), seg2);
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

  // --- THE MOON: a shell cut into Voronoi plates (the same seeds draw the lava cracks), so it can split along its own cracks
  const NSEED = 22, seeds = []; { const R = RNG('moonseeds'); for (let i = 0; i < NSEED; i++) { const v = new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize(); seeds.push(v); } }
  const MM = texMoonMaps();
  const moonU = { uMap: { value: MM.alb }, uH: { value: MM.hgt }, uBump: { value: 1.3 }, uL: { value: new THREE.Vector3(-0.45, 0.35, 1).normalize() }, uCrack: { value: 0 }, uHeat: { value: 0 }, uLit: { value: 1.5 }, uCool: { value: 0 }, uSeeds: { value: seeds } };
  const moonMat = new THREE.ShaderMaterial({ uniforms: moonU, side: THREE.DoubleSide, fog: false,
    vertexShader: `attribute vec3 aP; attribute float aIn; varying vec3 vP, vNo, vT, vB, vNg; varying float vIn;
      void main(){ vP = aP; vIn = aIn; vec3 p = normalize(aP); vec3 e = normalize(cross(vec3(0.0, 1.0, 0.0), p) + vec3(1e-4, 0.0, 0.0)); vec3 nn = cross(p, e); mat3 M = mat3(modelMatrix);
        vNo = normalize(M * p); vT = normalize(M * e); vB = normalize(M * nn); vNg = normalize(M * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D uMap, uH; uniform vec3 uL; uniform float uCrack, uHeat, uLit, uCool, uBump; uniform vec3 uSeeds[${NSEED}]; varying vec3 vP, vNo, vT, vB, vNg; varying float vIn;
      void main(){ vec3 p = normalize(vP);
        if (vIn > 0.5) {   // a fracture face: dark rock crust over molten rock, hotter deeper in, cooling with time
          float n1 = sin(vP.x * 31.0 + sin(vP.y * 17.0) * 2.0) * sin(vP.z * 27.0 + sin(vP.x * 13.0) * 2.0), n2 = sin(vP.x * 83.0 + vP.z * 61.0) * sin(vP.y * 71.0 - vP.x * 49.0);
          float vein = 1.0 - smoothstep(0.0, 0.22, abs(n1 + 0.35 * n2)), deep = vIn - 1.0;
          float lt = abs(dot(normalize(vNg), uL)) * 0.8 + 0.2;
          vec3 crust = vec3(0.09, 0.07, 0.06) * lt * (0.7 + 0.3 * n2);
          vec3 hot = mix(vec3(1.0, 0.26, 0.03), vec3(1.0, 0.7, 0.3), vein * deep) * (1.6 + 2.0 * deep);
          float heat = clamp(vein * (1.0 - 0.5 * uCool) + (1.0 - uCool) * 0.3 * deep * deep, 0.0, 1.0);
          gl_FragColor = vec4(mix(crust, hot, heat), 1.0);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
          return; }
        vec2 uv = vec2(atan(p.x, p.z) / 6.28318 + 0.5, asin(clamp(p.y, -1.0, 1.0)) / 3.14159 + 0.5);
        vec3 alb = texture2D(uMap, uv).rgb;
        float du = 1.0 / 1024.0, dv = 1.0 / 512.0, cl = max(0.25, sqrt(1.0 - p.y * p.y));
        vec2 gr = vec2((texture2D(uH, uv + vec2(du, 0.0)).r - texture2D(uH, uv - vec2(du, 0.0)).r) / cl, texture2D(uH, uv + vec2(0.0, dv)).r - texture2D(uH, uv - vec2(0.0, dv)).r) * uBump;
        vec3 N = normalize(vNo - gr.x * vT - gr.y * vB);
        float nl = dot(N, uL); float lit = smoothstep(-0.12, 0.45, nl) * 0.8 + 0.25 * max(nl, 0.0);
        vec3 col = alb * (0.03 + lit) * uLit;
        float d1 = 9.0, d2 = 9.0;
        for (int i = 0; i < ${NSEED}; i++) { float d = distance(p, uSeeds[i]); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
        float wob = 0.01 * sin(p.x * 43.0 + p.y * 31.0) + 0.007 * sin(p.z * 61.0 - p.x * 23.0) + 0.004 * sin(p.y * 120.0 + p.z * 90.0);
        float e = max(0.0, d2 - d1 + wob);
        float rev = 0.5 + 0.5 * sin(p.x * 5.1 + p.y * 3.7 + 1.0) * sin(p.z * 4.3 - p.y * 2.9);
        float on = smoothstep(0.0, 0.12, uCrack * 1.3 - rev);
        float w = 0.008 + 0.022 * uHeat;
        float core = 1.0 - smoothstep(0.0, w, e), halo = 1.0 - smoothstep(0.0, w * 5.0, e);
        col *= 1.0 - 0.55 * halo * on;
        vec3 lava = mix(vec3(1.0, 0.32, 0.04), vec3(1.0, 0.85, 0.45), core);
        col += lava * (core * 3.2 + halo * 0.45) * on * (1.0 + 1.5 * uHeat);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` });
  const moonG = new THREE.Group(); scene.add(moonG);
  // solid chunks: each Voronoi cell = its patch of crust (vertices on the cell borders snapped onto the bisecting great circle,
  // so the edges are smooth) + rough fracture walls running from the rim down to an inner point (a thick wedge of rock)
  const chunks = []; {
    const sg = new THREE.SphereGeometry(1, 180, 90), SPp = sg.attributes.position, IX = sg.index.array;
    const near2 = (v) => { let a = -1, b = -1, da = 9, db = 9; seeds.forEach((s, i) => { const d = s.distanceTo(v); if (d < da) { db = da; b = a; da = d; a = i; } else if (d < db) { db = d; b = i; } }); return [a, b, da, db]; };
    const key = (v) => `${Math.round(v.x * 2e4)},${Math.round(v.y * 2e4)},${Math.round(v.z * 2e4)}`;
    const V = []; for (let i = 0; i < SPp.count; i++) V.push(new THREE.Vector3(SPp.getX(i), SPp.getY(i), SPp.getZ(i)));
    const tris = [], cellsAt = new Map();
    for (let t = 0; t < IX.length; t += 3) { const a = IX[t], b = IX[t + 1], c = IX[t + 2]; if (V[a].distanceTo(V[b]) < 1e-6 || V[b].distanceTo(V[c]) < 1e-6 || V[a].distanceTo(V[c]) < 1e-6) continue;
      const cell = near2(V[a].clone().add(V[b]).add(V[c]).normalize())[0]; tris.push([a, b, c, cell]);
      for (const i of [a, b, c]) { const k = key(V[i]); if (!cellsAt.has(k)) cellsAt.set(k, new Set()); cellsAt.get(k).add(cell); } }
    const rough = (p) => 1 + 0.01 * Math.sin(p.x * 23 + p.y * 17) * Math.sin(p.z * 19 - p.x * 11) + 0.005 * Math.sin(p.x * 61 + p.z * 53) * Math.sin(p.y * 57 + 1.3);
    const snapped = new Map(), S = (i) => { const k = key(V[i]); if (snapped.has(k)) return snapped.get(k); let v = V[i].clone();
      if (cellsAt.get(k).size > 1) { const [a, b] = near2(v), n = seeds[a].clone().sub(seeds[b]).normalize(); v.addScaledVector(n, -v.dot(n)).normalize(); }
      const [, , da, db] = near2(v), r = rough(v) * (1 - 0.012 * Math.exp(-(db - da) / 0.02)); const o = { u: v, p: v.clone().multiplyScalar(r), k }; snapped.set(k, o); return o; };
    const jit = (q, amt) => q.clone().add(new THREE.Vector3(Math.sin(q.x * 37 + q.y * 11), Math.sin(q.y * 41 - q.z * 13), Math.sin(q.z * 31 + q.x * 17)).multiplyScalar(amt));
    const R = RNG('chunks'), KR = 5;
    seeds.forEach((seed, ci) => {
      const pos = [], aP = [], aIn = [], cen = seed.clone().multiplyScalar(0.62), apex = seed.clone().multiplyScalar(0.22 + 0.08 * R.f()), edges = new Map();
      const add = (p, u, f) => { pos.push(p.x - cen.x, p.y - cen.y, p.z - cen.z); aP.push(u.x, u.y, u.z); aIn.push(f); };
      tris.forEach(([a, b, c, cell]) => { if (cell !== ci) return; const A = S(a), Bv = S(b), Cv = S(c); add(A.p, A.u, 0); add(Bv.p, Bv.u, 0); add(Cv.p, Cv.u, 0);
        [[A, Bv], [Bv, Cv], [Cv, A]].forEach(([x, y]) => { const k = x.k < y.k ? x.k + '|' + y.k : y.k + '|' + x.k; if (edges.has(k)) edges.delete(k); else edges.set(k, [x, y]); }); });
      if (!pos.length) return;
      const ring = (o, k) => { if (k === 0) return o.p; if (k === KR) return apex; const f = k / KR; return jit(o.p.clone().lerp(apex, f), 0.035 * Math.sin(Math.PI * f)); };
      edges.forEach(([x, y]) => { for (let k = 0; k < KR; k++) { const a0 = ring(x, k), b0 = ring(y, k), a1 = ring(x, k + 1), b1 = ring(y, k + 1), f0 = 1 + k / KR, f1 = 1 + (k + 1) / KR;
        add(b0, b0.clone().normalize(), f0); add(a0, a0.clone().normalize(), f0); add(a1, a1.clone().normalize(), f1);
        add(b0, b0.clone().normalize(), f0); add(a1, a1.clone().normalize(), f1); add(b1, b1.clone().normalize(), f1); } });
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aP', new THREE.Float32BufferAttribute(aP, 3)); g.setAttribute('aIn', new THREE.Float32BufferAttribute(aIn, 1)); g.computeVertexNormals();
      const m = new THREE.Mesh(g, moonMat); m.frustumCulled = false; m.position.copy(cen); moonG.add(m);
      chunks.push({ m, cen, dir: seed.clone(), sp: R.r(0.6, 1.4), rot: new THREE.Vector3(R.n(0.5), R.n(0.5), R.n(0.5)), fall: R.r(0.7, 1.4), toward: R.r(-0.2, 0.9) }); });
  }
  // rubble: smaller rocks breaking off (a few from 29 s, a cloud of them at the break-up)
  const rubble = IM(new THREE.DodecahedronGeometry(1, 1).scale(1, 0.75, 0.9), STD({ color: 0x6a645c, roughness: 0.95, flatShading: true, emissive: 0x401204 }), 160, false); rubble.frustumCulled = false; scene.add(rubble);

  // --- THE WAVE: a swept wall (toe skirt, concave face, overhanging lip, crest, back slope), rebuilt each frame (from the template)
  const WNX = 96, WNS = 46, WPROF = [[0.34, -0.02], [0.14, 0.03], [0.035, 0.12], [0.0, 0.3], [0.008, 0.5], [0.035, 0.7], [0.08, 0.86], [0.122, 0.955], [0.135, 1.005], [0.11, 1.04], [0.05, 1.055], [-0.04, 1.035], [-0.3, 0.9], [-1.0, 0.52], [-2.3, 0.15]];
  const wProf = [], wArc = [0];
  for (let j = 0; j < WNS; j++) { const u = j / (WNS - 1) * (WPROF.length - 1), i = Math.min(WPROF.length - 2, Math.floor(u)), f = u - i, P = (k) => WPROF[Math.max(0, Math.min(WPROF.length - 1, k))];
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
    wProf.push([cr(P(i - 1)[0], P(i)[0], P(i + 1)[0], P(i + 2)[0]), cr(P(i - 1)[1], P(i)[1], P(i + 1)[1], P(i + 2)[1])]);
    if (j) wArc.push(wArc[j - 1] + Math.hypot(wProf[j][0] - wProf[j - 1][0], wProf[j][1] - wProf[j - 1][1])); }
  const wX = []; for (let i = 0; i < WNX; i++) { const u = i / (WNX - 1) * 2 - 1; wX.push(Math.sign(u) * 9000 * Math.pow(Math.abs(u), 1.7)); }
  const wGeo = new THREE.BufferGeometry(), wPos = new Float32Array(WNX * WNS * 3), wUv = new Float32Array(WNX * WNS * 2), wYn = new Float32Array(WNX * WNS), wIdx = [];
  for (let i = 0; i < WNX; i++) for (let j = 0; j < WNS; j++) wYn[i * WNS + j] = wProf[j][1];
  for (let i = 0; i < WNX - 1; i++) for (let j = 0; j < WNS - 1; j++) { const a = i * WNS + j, b = a + WNS; wIdx.push(a, b, a + 1, b, b + 1, a + 1); }
  wGeo.setIndex(wIdx); wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3)); wGeo.setAttribute('uv', new THREE.BufferAttribute(wUv, 2)); wGeo.setAttribute('aYn', new THREE.BufferAttribute(wYn, 1));
  const streakTex = wrap(texFoamStreaks()), foamTex = wrap(texFoam()); streakTex.anisotropy = ANI;
  const waveU = { uStreak: { value: streakTex }, uFoamT: { value: foamTex }, uT: { value: 0 }, uTop: { value: lin('#2e4a4c') }, uMid: { value: lin('#122a30') }, uBot: { value: lin('#071418') }, uSky: { value: lin('#a35a3a') },
    uFogC: { value: lin('#4a2a22') }, uFogNear: { value: 300 }, uFogFar: { value: 20000 }, uFogK: { value: 0.3 }, uLight: { value: 1 }, uFoamC: { value: lin('#cdb8a8') }, uRim: { value: lin('#ff8a4a') } };
  const waveMat = new THREE.ShaderMaterial({ uniforms: waveU, side: THREE.DoubleSide,
    vertexShader: `attribute float aYn; varying float vYn; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){ vYn = aYn; vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D uStreak, uFoamT; uniform float uT, uFogNear, uFogFar, uFogK, uLight; uniform vec3 uTop, uMid, uBot, uSky, uFogC, uFoamC, uRim;
      varying float vYn; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){ float yn = vYn;
        vec3 col = mix(uBot, uMid, smoothstep(0.04, 0.5, yn)); col = mix(col, uTop, smoothstep(0.6, 0.98, yn));
        col *= 0.9 + 0.1 * sin(vUv.y * 7.0 + vUv.x * 0.6 + sin(vUv.x * 2.1) * 1.5);
        vec3 V = normalize(vW - cameraPosition), n = normalize(vN); if (dot(n, V) > 0.0) n = -n;
        float fres = pow(1.0 - max(dot(-V, n), 0.0), 4.0); col = mix(col, uSky * 0.8, fres * 0.5);
        float cv = texture2D(uFoamT, vec2(vUv.x * 0.37, 0.13)).r, cv2 = texture2D(uFoamT, vec2(vUv.x * 0.21 + 0.5, 0.61)).r;
        vec2 u1 = vec2(vUv.x * 0.7, vUv.y * 0.4 + uT * 0.15);
        float s1 = texture2D(uStreak, u1).r, s2 = texture2D(uStreak, vec2(vUv.x * 1.3 + 0.37, vUv.y * 0.55 + uT * 0.27)).r, s3 = texture2D(uStreak, vec2(vUv.x * 0.45 + 0.71, vUv.y * 0.3 + uT * 0.1)).r;
        float mist = texture2D(uStreak, u1, 3.5).r + texture2D(uStreak, vec2(vUv.x * 0.45 + 0.71, vUv.y * 0.3 + uT * 0.1), 4.0).r;
        float haze = clamp(mist * 1.4, 0.0, 1.0) * smoothstep(0.8, 0.2, yn) * smoothstep(0.06, 0.28, yn);
        col = mix(col, uFoamC * 0.55, haze * 0.4);
        float streak = clamp(s1 * (0.35 + 1.1 * cv) + s2 * 0.75 * (1.3 - cv) * cv2 + s3 * 0.55, 0.0, 1.0) * smoothstep(0.25, 0.95, yn) * smoothstep(0.1, 0.3, yn);
        float fN = texture2D(uFoamT, vUv * 2.3 + vec2(0.0, uT * 0.05)).r, fN2 = texture2D(uFoamT, vUv * 5.1 + vec2(uT * 0.03, uT * 0.11)).r;
        float crest = smoothstep(0.935, 0.995, yn) * (0.55 + 0.7 * fN) + smoothstep(0.985, 1.04, yn);
        float toe = (1.0 - smoothstep(0.02, 0.12, yn)) * smoothstep(0.25, 0.75, fN2 * 0.6 + texture2D(uFoamT, vUv * 0.37 + vec2(uT * 0.02, 0.0)).r * 0.8) * 0.22;
        float dd = length(vW - cameraPosition), farK = smoothstep(3000.0, 9000.0, dd);
        float foam = clamp(max(streak * 0.9 * (1.0 - farK), max(crest * (1.0 - 0.5 * farK), toe * (1.0 - 0.9 * farK))), 0.0, 1.0);
        vec3 fc = uFoamC * mix(0.6, 1.0, smoothstep(0.7, 1.02, yn));
        col = mix(col, fc, foam);
        col += uRim * smoothstep(0.97, 1.05, yn) * 0.35;
        col *= uLight;
        col = mix(col, uFogC, smoothstep(uFogNear, uFogFar, dd) * uFogK);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` });
  const wave = new THREE.Mesh(wGeo, waveMat); wave.frustumCulled = false; scene.add(wave);

  // --- sprite pools: white spray (normal), fire (additive), smoke (normal); all depthWrite off, renderOrder 10
  const flameTex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.15, 'rgba(255,240,200,0.9)'], [0.4, 'rgba(255,170,80,0.45)'], [0.7, 'rgba(255,90,30,0.12)'], [1, 'rgba(255,60,20,0)']], 64);
  const pool = (n, map, add, dt = false) => Array.from({ length: n }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, depthTest: !dt, fog: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending }));
    s.renderOrder = 10; s.visible = false; scene.add(s); return s; });
  const billowTex = texBillow('billow');
  const sprays = pool(460, mistTex, false), flames = pool(800, flameTex, true), smokes = pool(420, smokeTex, false), billows = pool(560, billowTex, false);
  const debris = IM(new THREE.BoxGeometry(1, 1, 1), STD({ color: 0xffffff, roughness: 0.8 }), 90, false); debris.frustumCulled = false; scene.add(debris);
  { const R = RNG('debc'); for (let i = 0; i < 90; i++) debris.setColorAt(i, lin(R.pick(['#6a4a30', '#8a6440', '#f2efe8', '#c8372d', '#2b3236', '#2f6fb0', '#4a3a2a', '#b5523a']))); }

  G = { cv, r, scene, cam, sky, skyU, stars, clouds, hemi, key, fill, seaMat, seaMesh, boats, PM, PG, ppl, wave, wGeo, wPos, wUv, wX, wProf, wArc, WNX, WNS, waveU, sprays, flames, smokes, billows, debris, rubble,
    houses, roofs, hMat, rMat, hPos, nH, chimI, capI, cMat, kMat, chim, antI, aMat, ants, church, lighthouse, beamPivot, beamMat, lamps, hillL, pools, poles, lampList, car, moonG, moonU, chunks, seeds };
  // points on the plates' borders (where the cracks are), for dust and embers
  { const R = RNG('edges'), E = []; while (E.length < 160) { const p = new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize(); const d = seeds.map((s) => s.distanceTo(p)).sort((a, b) => a - b); if (d[1] - d[0] < 0.03) E.push({ p, r: R.f(), r2: R.f() }); } G.edges = E; }
  G.meteors = meteorList();
  return G;
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(), _hid = new THREE.Matrix4().makeScale(0, 0, 0);
const M4 = () => new THREE.Matrix4(), Tr = (x, y, z) => M4().makeTranslation(x, y, z), Rx = (a) => M4().makeRotationX(a), Rz = (a) => M4().makeRotationZ(a);
const BASECAM = new THREE.Vector3(0, EYE, CAMZ0);
const C3 = (a, b, k) => lin(a).lerp(lin(b), clamp(k));
// the light of each moment: night -> moonlit -> fire -> under the wave
function lookAt3(t) {
  const mo = ss(5, 30, t), fi = ss(38, 45, t), dk = ss(52, 62.5, t), gone = ss(38, 47, t);
  const k4 = (a, b, c, d) => C3(a, b, mo).lerp(lin(c), fi).lerp(lin(d), dk);
  return { mo, fi, dk, gone,
    top: k4('#060a17', '#2c4a80', '#2a1418', '#120a0c'), mid: k4('#10182f', '#5878b0', '#8a3624', '#3a1c16'), hor: k4('#262f4e', '#93a8cc', '#ff8a3a', '#8a3a1c'),
    fog: k4('#141c30', '#56627e', '#6a3424', '#2a1410'), hemiS: k4('#4a5a86', '#8a9ac0', '#b0603a', '#5a2a1c'), hemiG: k4('#14141c', '#2a2a34', '#3a2018', '#140c0a') };
}
// one person's pose at time t
function personPose(q, t, zw, on) {
  let x = q.x, z = q.z, yaw = q.yaw, walk = 0, run = 0, p = t * 5.6 + q.ph, pk = 0, lean = 0;
  const tw = Math.min(t, q.stopT) + 0.45 * clamp((t - q.stopT) / 0.9), turnK = ss(q.stopT + 0.2, q.stopT + 1.4, t);
  if (q.role === 'prom') { x = mod(q.x + q.v * tw + 36, 72) - 36; yaw = lerp(q.v > 0 ? Math.PI / 2 : -Math.PI / 2, (q.v > 0 ? Math.PI : -Math.PI) + q.look, turnK); walk = 1 - ss(q.stopT, q.stopT + 0.9, t); }
  else if (q.role === 'out') { if (t < q.outT) return null; const k = t - q.outT, dz = Math.min(k * 1.2, -66.4 - q.stopZ); z = q.z - dz; walk = dz < -66.4 - q.stopZ - 0.01 ? 1 : 1 - ss(0, 0.6, k - (-66.4 - q.stopZ) / 1.2); yaw = Math.PI + q.look * ss(0, 1, k - 3); }
  else if (q.role === 'quay') { z = q.z + q.v * tw; yaw = lerp(q.v > 0 ? 0 : Math.PI, Math.PI / 2 + q.look, turnK); walk = 1 - ss(q.stopT, q.stopT + 0.9, t); }
  else if (q.role === 'street' && t < q.runT) return null;
  else if (q.role === 'terr' || q.role === 'swatch') { if (t < q.outT) return null; const D = Math.hypot(q.x - q.x0, q.z - q.z0), f = Math.min(1, (t - q.outT) * 1.1 / D);
    x = lerp(q.x0, q.x, f); z = lerp(q.z0, q.z, f); walk = f < 1 ? 1 : 0; yaw = f < 1 ? Math.atan2(q.x - q.x0, q.z - q.z0) : Math.PI + q.look; }
  if (q.point && t > q.pointT && t < q.fleeT) pk = ss(q.pointT, q.pointT + 0.5, t);
  const fleeAt = q.role === 'street' ? q.runT : q.fleeT;
  if (t > fleeAt) {
    const k = t - fleeAt, d = q.rv * Math.max(0, k - 0.35 * (1 - Math.exp(-k / 0.35)));
    let dx = 0, dz = 1; if (q.role === 'quay') { dx = -1; dz = 0.15; } else if (q.role === 'terr') { dx = q.x0 - q.x; dz = q.z0 - q.z; } else if (q.role !== 'street' && q.role !== 'swatch') { dx = -Math.sign(x) * 0.5; dz = 1; }
    const n = Math.hypot(dx, dz); if (q.role === 'terr' && d > n) return null; x += d * dx / n; z += d * dz / n; yaw = Math.atan2(dx, dz) + Math.sin(t * 3 + q.ph) * 0.06;
    run = ss(0, 0.4, k); walk = 0; p = t * 10.5 + q.ph; pk = 0; lean = 0.2 * ss(0, 0.5, k);
    if (q.role === 'street' && Math.abs(x) > 3.6) x = Math.sign(x) * 3.6;
    if ((q.role === 'prom' || q.role === 'out') && z > -64.5 && Math.abs(x) > 4) return null;
    if (q.role === 'swatch' && Math.abs(x) > 3.6) x = Math.sign(x) * 3.6;
    if (q.role === 'quay' && x < xL(z) - 14) return null;
    if (z > CAMZ0 - 6) return null;
  }
  if (on && z < zw + 6) return null;
  return { x, z, yaw, p, walk, run, pk, lean, y: q.quay ? PROM : q.role === 'terr' ? TERR.y + 0.1 : gH(x, z) };
}

function update3D() {
  const g = g3(), t = TT, c = camPose(t), L = lookAt3(t), lev = seaLevel(t), on = t >= 49.5;
  const wv = waveVis(t), zw = wv.zw, Hv = wv.Hv;
  g.cam.position.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll);
  g.sky.position.copy(g.cam.position); g.stars.position.copy(g.cam.position);
  // flashes of the impacts (light the town and the sky)
  let flash = 0; g.meteors.forEach((m) => { const a = t - m.ti; if (a > 0 && a < 3) flash += m.s * Math.exp(-a * 3.5) * (m.ocean ? 2.2 : 1); });
  flash = Math.min(flash, 3.5);
  // the moon: size, height, cracks, the split
  const rM = moonR(t), elM = moonEl(t), mDir = dirV(MOON_AZ, elM), RM = MOON_D * Math.sin(rM);
  g.moonG.visible = t < 52; g.moonG.position.copy(g.cam.position).addScaledVector(mDir, MOON_D); g.moonG.scale.setScalar(RM); g.moonG.lookAt(BASECAM.clone().add(new THREE.Vector3(c.x, c.y - EYE, c.z - CAMZ0)));
  const mu = g.moonU; mu.uCrack.value = seg(t, 26, 33.5); mu.uHeat.value = ss(31, 38, t); mu.uCool.value = ss(42, 50, t); mu.uLit.value = 1.55 * (1 - 0.4 * L.fi);
  const qi = g.moonG.quaternion.clone().invert(), dLoc = new THREE.Vector3(0, -1, 0).applyQuaternion(qi);
  const chunkAt = (ch, tt) => { const sp = 0.05 * ss(34.2, 37.9, tt), k = Math.max(0, tt - 38);
    return { o: ch.cen.clone().addScaledVector(ch.dir, sp + (0.05 * k + 0.007 * k * k) * ch.sp).addScaledVector(dLoc, 0.022 * ch.fall * k * k).add(new THREE.Vector3(0, 0, ch.toward * 0.06 * k)), a: sp * 3 + k * 0.32 }; };
  g.chunks.forEach((ch) => { const s = chunkAt(ch, t); ch.m.position.copy(s.o); ch.m.rotation.set(ch.rot.x * s.a, ch.rot.y * s.a, ch.rot.z * s.a); });
  g.moonG.updateMatrixWorld();
  // rubble: a few rocks drift off the cracks (29-38), then a cloud of them is thrown out by the break-up
  { const D = g.rubble, R = RNG('rubble'); for (let i = 0; i < 160; i++) { const early = i < 30, t0 = early ? R.r(29, 36) : 37.9 + R.r(0, 1.2), d = new THREE.Vector3(R.n(1), R.n(1), R.n(1) + (early ? 1.2 : 0.5)).normalize(), sp = early ? R.r(0.01, 0.03) : R.r(0.06, 0.3), s = R.r(0.008, early ? 0.02 : 0.05), a = t - t0;
    if (a < 0 || t > 52) { D.setMatrixAt(i, _hid); continue; }
    const v = g.moonG.position.clone().addScaledVector(d, RM * (1.0 + sp * a)); v.y -= RM * 0.012 * a * a * (early ? 0.2 : 1);
    D.setMatrixAt(i, M4c(v.x, v.y, v.z, a * R.r(0.3, 1.2), RM * s, RM * s, RM * s, a * R.r(0.2, 0.9), 0)); }
    D.instanceMatrix.needsUpdate = true; }
  // sky, stars, clouds, fog
  const su = g.skyU; su.top.value.copy(L.top); su.mid.value.copy(L.mid); su.hor.value.copy(L.hor); su.moonDir.value.copy(mDir);
  su.halo.value = (0.12 + 0.55 * L.mo) * (1 - L.gone); su.haloW.value = Math.max(0.0004, (rM * 2.2) ** 2);
  su.fire.value = 1.35 * L.fi * (1 - 0.35 * L.dk) + 0.5 * flash; su.dark.value = 0.35 * ss(60, 62.95, t);
  g.stars.material.opacity = (1 - 0.8 * L.mo) * (1 - 0.9 * L.fi);
  const cloudCol = C3('#2a3350', '#8090b0', L.mo).lerp(lin('#c8643c'), L.fi).lerp(lin('#5a2a1c'), L.dk).lerp(lin('#ffc890'), Math.min(0.5, 0.18 * flash));
  g.clouds.forEach((s) => { const u = s.userData, a = u.ang + t * u.v; s.position.set(c.x + Math.sin(a) * u.D, u.y, c.z - Math.cos(a) * u.D); s.scale.set(u.w * (1 + 0.07 * Math.sin(t * 0.09 + u.ph)), u.w * u.a, 1); s.material.color.copy(cloudCol); s.material.opacity = u.o * (0.85 + 0.15 * Math.sin(t * 0.11 + u.ph * 2.3)); });
  g.scene.fog.color.copy(L.fog); g.scene.fog.far = lerp(22000, 9000, ss(55, 62.5, t)); g.scene.fog.near = 300;
  // lights: moonlight from the moon's direction, then the fire on the horizon
  const keyEl = Math.max(elM, 24 * DEG), fireDir = dirV(4 * DEG, 13 * DEG), kd = dirV(MOON_AZ, keyEl).lerp(fireDir, L.fi).normalize();
  g.key.position.copy(g.key.target.position).addScaledVector(kd, 500);
  g.key.color.copy(C3('#b8c8ff', '#dfe6ff', L.mo).lerp(lin('#ff8a48'), L.fi));
  g.key.intensity = (0.2 + 0.8 * L.mo) * (1 - L.gone) + (1.5 * L.fi) * (1 - 0.5 * L.dk) + 1.7 * flash;
  g.fill.intensity = 0.7 * L.fi * (1 - 0.5 * L.dk) + 1.5 * flash; g.fill.color.copy(C3('#ff7a3a', '#ffc080', Math.min(1, flash * 0.5)));
  g.hemi.color.copy(L.hemiS); g.hemi.groundColor.copy(L.hemiG); g.hemi.intensity = 0.4 + 0.45 * L.mo + 0.25 * L.fi - 0.3 * L.dk + 0.3 * flash;
  g.r.toneMappingExposure = (1.35 - 0.15 * L.mo) * (1 - 0.6 * ss(61, 62.95, t)) * (1 + 0.1 * flash);
  // windows switch on, TV flicker
  WIN.uOn.value = 0.42 + 0.5 * ss(5.5, 15.5, t); WIN.uT.value = t; WIN.uPow.value = 1 - 0.25 * L.fi;
  // the sea: tide, colours, glitter (moon, then fire)
  const sea = g.seaMat.uniforms; g.seaMesh.position.y = lev; sea.uT.value = t; sea.uLevel.value = lev; sea.uToe.value = on ? zw + 0.13 * Hv : -1e6; sea.uToeOn.value = on ? ss(30, 120, Hv) : 0; sea.uToeW.value = 25 + 0.18 * Hv; sea.uFlood.value = ss(19, 22, t) * (1 - ss(48.6, 50, t));
  sea.uTop.value.copy(L.top); sea.uHor.value.copy(L.hor); sea.uFire.value = L.fi * 0.8 + 0.2 * flash; sea.uDark.value = 0.3 * ss(60, 62.9, t);
  sea.uMoon.value.copy(mDir.clone().lerp(fireDir, L.gone).normalize()); sea.uMoonCol.value.copy(C3('#dfe6ff', '#ff9a5a', L.gone)); sea.uGlit.value = (0.4 + 0.5 * L.mo) * (1 - L.gone) + 0.5 * L.fi;
  sea.uGK.value = lerp(900, 160, ss(4, 34, t)) * (1 + 1.5 * L.gone); sea.uChurn.value = ss(16, 22, t) * (1 - ss(46, 49, t)) * 0.7 + ss(57, 62, t);
  sea.uShallow.value.copy(C3('#1f3c44', '#3a3028', L.fi)); sea.uDeep.value.copy(C3('#0a1a28', '#1a1012', L.fi)); sea.uMid.value.copy(C3('#122b38', '#2a1a16', L.fi)); sea.uFar.value.copy(C3('#26304a', '#7a3a22', L.fi));
  sea.fogColor.value.copy(L.fog); sea.fogNear.value = g.scene.fog.near; sea.fogFar.value = g.scene.fog.far;
  // the lighthouse beam sweeps (8 s a turn), off once the fragments fall
  g.beamPivot.rotation.y = t * TAU / 8 + 1.2; g.beamMat.uniforms.uA.value = (1 - 0.6 * L.mo) * (1 - ss(46, 50, t)) * (t > 30 ? 0.8 + 0.2 * Math.sin(t * 40) : 1);
  g.beamPivot.visible = t < 50;
  // a car along the waterfront
  { const k = seg(t, 8.6, 14.0), x = lerp(-70, 70, k), y = PROM + 0.7, z = QZ + 5.5, vis = k > 0 && k < 1 && t < 20; const p = g.car.geometry.attributes.position;
    p.setXYZ(0, x + 2, y, z - 0.7); p.setXYZ(1, x + 2, y, z + 0.7); p.setXYZ(2, vis ? x - 2.2 : 1e5, y, z - 0.7); p.setXYZ(3, vis ? x - 2.2 : 1e5, y, z + 0.7); if (!vis) { p.setXYZ(0, 1e5, 0, 0); p.setXYZ(1, 1e5, 0, 0); } p.needsUpdate = true; }
  // the wave: rebuild the swept wall
  g.wave.visible = on;
  if (on) {
    const { wPos, wUv, wX, wProf, wArc, WNX, WNS } = g, Y0 = -16;
    for (let i = 0; i < WNX; i++) { const x = wX[i], hx = 1 + 0.035 * Math.sin(x * 0.0021 + 1.3) + 0.02 * Math.sin(x * 0.0063 + 0.4), cr = Hv * hx, zo = zw - x * x / 160000 + 0.02 * Hv * Math.sin(x * 0.0017 + 0.5);
      for (let j = 0; j < WNS; j++) { const k = i * WNS + j, [dn, yn] = wProf[j]; wPos[k * 3] = x; wPos[k * 3 + 1] = Y0 + yn * (cr - Y0); wPos[k * 3 + 2] = zo + dn * cr; wUv[k * 2] = x / 160; wUv[k * 2 + 1] = wArc[j] * (cr - Y0) / 160; } }
    g.wGeo.attributes.position.needsUpdate = true; g.wGeo.attributes.uv.needsUpdate = true; g.wGeo.computeVertexNormals();
    const wu = g.waveU; wu.uT.value = t; wu.uFogC.value.copy(L.fog); wu.uFogFar.value = Math.max(g.scene.fog.far, 3000); wu.uFogK.value = 0.35; wu.uSky.value.copy(L.hor); wu.uLight.value = 1 - 0.35 * ss(60, 62.9, t) + 0.15 * flash;
    wu.uFoamC.value.copy(C3('#c9b2a2', '#8a7a70', ss(58, 62.5, t)));
  }
  const crestAng = on ? Math.atan2(Hv * 1.05 - c.y, c.z - zw) : 0, cover = ss(4 * DEG, 48 * DEG, crestAng);
  WSH.value = on ? zw + 0.15 * Hv + Hv * 0.4 : -1e6;
  g.hemi.intensity *= 1 - 0.4 * cover;
  const hitK = (z0, lead = 0) => on ? clamp((zw + 0.3 * Hv + lead - z0) / 45) : 0;
  // houses, roofs, chimneys and antennas vanish once the wall has rolled over them
  { const gone = (z) => on && zw > z + 6;
    for (let i = 0; i < g.nH; i++) { const hz = g.hPos[i][1], x = gone(hz); g.houses.setMatrixAt(i, x ? _hid : g.hMat[i]); g.roofs.setMatrixAt(i, x ? _hid : g.rMat[i]); }
    g.chim.forEach((ch, i) => { const x = gone(g.hPos[ch[5]][1]); g.chimI.setMatrixAt(i, x ? _hid : g.cMat[i]); g.capI.setMatrixAt(i, x ? _hid : g.kMat[i]); });
    g.ants.forEach((a, i) => { const x = gone(g.hPos[a[3]][1]); for (let k = 0; k < 3; k++) g.antI.setMatrixAt(i * 3 + k, x ? _hid : g.aMat[i * 3 + k]); });
    g.houses.instanceMatrix.needsUpdate = g.roofs.instanceMatrix.needsUpdate = g.chimI.instanceMatrix.needsUpdate = g.capI.instanceMatrix.needsUpdate = g.antI.instanceMatrix.needsUpdate = true;
    g.church.visible = !gone(-58); g.lighthouse.visible = !gone(-335); }
  // boats float with the tide, settle on the mud, are thrown when the wall arrives
  g.boats.forEach((b) => { const bc = gH(b.x, b.z), fy = lev - 0.4 * b.D, gnd = ss(-0.05, 0.8, bc - fy), hk = hitK(b.z);
    let y = Math.max(fy, bc - 0.12 * b.D * gnd) + (1 - gnd) * (0.07 + 0.12 * ss(16, 22, t) * (1 - ss(46, 49, t))) * Math.sin(t * 1.3 + b.ph);
    let roll = b.roll * 0.3 * gnd + (1 - gnd) * (0.035 + 0.05 * ss(16, 22, t)) * Math.sin(t * 1.1 + b.ph), pitch = (1 - gnd) * 0.02 * Math.sin(t * 0.9 + b.ph) + gnd * 0.05 * b.roll;
    y += hk * hk * Hv * 0.35; roll += hk * 2.5 * b.roll; pitch += hk * 1.2;
    b.grp.position.set(b.x, y, b.z + hk * 35); b.grp.rotation.set(pitch, b.yaw + hk * 0.8, roll); b.grp.visible = hk < 1; });

  // people
  const PM = g.PM, PG = g.PG, hide = (i) => { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PM[k].setMatrixAt(i * PG[k][1] + j, _hid); };
  g.ppl.forEach((q, i) => {
    const st = personPose(q, t, zw, on); if (!st) return hide(i);
    const { x, z, yaw, p, walk, run, pk, lean, y } = st, s = q.s, w = q.w;
    const base = M4().compose(_v.set(x, y + (run ? Math.abs(Math.sin(p)) * 0.05 * run : 0), z), _q.setFromEuler(_e.set(0, yaw, 0)), _s.set(s * w, s, s * w));
    if (lean) base.multiply(Rx(lean));
    const A = 0.42 * walk + 0.85 * run, Ak = 0.5 * walk + 1.3 * run, Aa = 0.35 * walk + 0.75 * run, breathe = 0.02 * Math.sin(TT * 1.7 + q.ph);
    const hip = (j) => (j ? 1 : -1) * Math.sin(p) * A, knee = (j) => 0.04 + Ak * Math.max(0, Math.sin(p + 1.7 + (j ? Math.PI : 0)));
    const sh = (j) => (j ? -1 : 1) * Math.sin(p) * Aa + (j && pk ? -1.45 * pk : 0) + breathe, elb = (j) => 0.18 + 0.15 * walk + 1.25 * run - (j ? pk * 0.15 : 0);
    const put = (k, j, m) => PM[k].setMatrixAt(i * PG[k][1] + j, _m.copy(m));
    for (const j of [0, 1]) {
      const th = base.clone().multiply(Tr(j ? 0.095 : -0.095, 0.9, 0)).multiply(Rx(hip(j))), sn = th.clone().multiply(Tr(0, -0.44, 0)).multiply(Rx(knee(j)));
      put('thigh', j, th); put('shin', j, sn); put('shoe', j, sn.clone().multiply(Rx(-knee(j) * 0.4 - hip(j) * 0.3)));
      const ua = base.clone().multiply(Tr(j ? 0.2 : -0.2, 1.4, 0)).multiply(Rz((j ? 1 : -1) * (0.09 + 0.06 * run + (j ? 0.12 * pk : 0)))).multiply(Rx(sh(j))), fa = ua.clone().multiply(Tr(0, -0.29, 0)).multiply(Rx(-elb(j)));
      put('uarm', j, ua); put('farm', j, fa); put('hand', j, fa);
    }
    put('hips', 0, base.clone().multiply(Tr(0, 0.92, 0))); put('torso', 0, base.clone().multiply(Tr(0, 0.94, 0)).multiply(Rx(0.03 * run)));
    put('neck', 0, base.clone().multiply(Tr(0, 1.45, 0))); const hd = base.clone().multiply(Tr(0, 1.6, 0)).multiply(Rx(!run && t > 6 ? -0.22 : 0.05));
    put('head', 0, hd); put('hair', 0, hd.clone().multiply(Tr(0, 0.025, -0.012))); put('hairB', 0, q.longHair ? hd.clone().multiply(Tr(0, -0.08, -0.07)) : _hid);
  });
  for (const k in PM) PM[k].instanceMatrix.needsUpdate = true;

  // ---- sprites
  let si = 0, fi2 = 0, mi = 0, bi2 = 0; const SP = g.sprays, FL = g.flames, SM = g.smokes, BL = g.billows;
  const put = (pool, idx, x, y, z, sc, op, col, rot = 0) => { if (idx >= pool.length || op <= 0.004) return idx; const s = pool[idx]; s.visible = true; s.position.set(x, y, z); s.scale.set(sc, sc, 1); s.material.opacity = Math.min(1, op); s.material.color.set(col); s.material.rotation = rot; return idx + 1; };
  const spray = (x, y, z, sc, op, col = '#ffffff') => { si = put(SP, si, x, y, z, sc, op, col); };
  const fire = (v, sc, op, col) => { fi2 = put(FL, fi2, v.x, v.y, v.z, sc, op, col); };
  const smoke = (v, sc, op, col, rot = 0) => { mi = put(SM, mi, v.x, v.y, v.z, sc, op, col, rot); };
  const billow = (v, sc, op, col, rot = 0) => { bi2 = put(BL, bi2, v.x, v.y, v.z, sc, op, col, rot); };
  // a billowing column: puffs born continuously at the base, rising (slowing), growing, drifting with the wind, darkening as they cool
  const column = (P, a, Hmax, W0, seed, white) => { const R = RNG('col', seed), life = 9, every = 0.55;
    for (let n = Math.max(0, Math.floor((a - life) / every)); n * every <= a; n++) { const age = a - n * every, k = age / life; if (k > 1) continue;
      const h = Hmax * (1 - Math.exp(-age / 3.2)), sz = W0 * (0.5 + 1.6 * Math.pow(k, 0.7)) * (0.8 + 0.4 * R.f()), tw = Math.sin(n * 2.3 + seed) * W0 * 0.35 * k;
      const v = P.clone(); v.y += W0 * 0.3 + h; v.x += tw + age * W0 * 0.12 + Math.sin(age * 0.9 + n) * W0 * 0.1; v.z += Math.cos(n * 1.7) * W0 * 0.2;
      const lit = 1 - ss(0.05, 0.45, k), col = white ? C3('#f0e4d8', '#9a8c86', k) : C3('#ffb070', '#5a3c30', 1 - lit).lerp(lin('#2a2222'), ss(0.4, 1, k));
      billow(v, sz, 0.85 * ss(0, 0.06, k) * (1 - ss(0.75, 1, k)) * Math.min(1, a / 0.6), col.getStyle(), n * 1.9 + seed); } };
  // waves slapping the quay wall while the tide rises, then a foam line where the water spills over the edge
  if (t > 16 && t < 27 && lev < PROM + 0.4) { const R = RNG('slap'); for (let k = 0; k < 22; k++) { const x = R.r(-45, 45), age = mod(t * R.r(0.35, 0.6) + R.f(), 1); if (age > 0.45) continue; const a = age / 0.45;
    spray(x, lev + a * 3.5, QZ - 0.8, 2.5 + a * 6, 0.55 * (1 - a) * ss(16, 18, t), '#c8d2dc'); } }
  if (t > 19 && t < 48 && lev > PROM - 0.6) { const R = RNG('spill'), front = t < 30 ? ss(PROM - 0.6, PROM + 0.4, lev) : 1; for (let k = 0; k < 30; k++) { const x = R.r(-40, 40), ph = mod(t * R.r(0.2, 0.4) + R.f(), 1);
    spray(x, lev + 0.6, QZ + 0.5 + ph * 4, 3.5 + ph * 3, 0.45 * front * Math.sin(ph * Math.PI) * (1 - ss(30, 40, t) * 0.6), '#dfe6ee'); } }
  // dust and embers off the cracks (30-38), the break-up (38+)
  if (t > 29.5 && t < 46) { g.moonG.updateMatrixWorld(); g.edges.forEach((e, i) => {
    if (e.p.z < -0.2) return; const ph = mod(t * (0.12 + 0.1 * e.r) + e.r2, 1), dr = ph * (0.05 + 0.2 * ss(36, 40, t)) * (1 + 3 * ss(38, 42, t)), amt = ss(29.5 + e.r * 4, 33 + e.r * 4, t) * (1 - ss(42, 46, t));
    const v = e.p.clone().multiplyScalar(1.0 + dr); g.moonG.localToWorld(v);
    if (i % 2) smoke(v, RM * (0.05 + 0.12 * ph), 0.5 * amt * Math.sin(ph * Math.PI), '#4a403a', e.r * 6);
    else fire(v, RM * (0.015 + 0.03 * (1 - ph)), 0.9 * amt * (1 - ph), '#ffb060'); }); }
  // the break-up: a fireball in the heart of the Moon and burning debris thrown out (38-46)
  if (t > 37.9 && t < 46) { const k = t - 37.9, R = RNG('burst'), ctr = g.moonG.position;
    fire(ctr, RM * (0.9 + 0.5 * k), 0.85 * Math.exp(-k * 0.45) * ss(0, 0.3, k), '#ffb060'); fire(ctr, RM * (0.4 + 0.2 * k), Math.exp(-k * 0.6) * ss(0, 0.2, k), '#fff0c8');
    for (let j = 0; j < 70; j++) { const d = new THREE.Vector3(R.n(1), R.n(1), R.n(1) + 0.4).normalize(), sp = R.r(0.25, 1.1), a = k - R.r(0, 1.5); if (a < 0) continue;
      const v = ctr.clone().addScaledVector(d, RM * (0.5 + sp * a * 0.55)); v.y -= RM * 0.03 * a * a; fire(v, RM * R.r(0.03, 0.08), 0.95 * Math.exp(-a * 0.35), j % 3 ? '#ff9a40' : '#ffe0a0');
      if (j % 2) smoke(v.clone().addScaledVector(d, -RM * 0.05), RM * R.r(0.06, 0.14), 0.35 * Math.exp(-a * 0.3), '#4a3630', j); } }
  // each chunk burns as it moves: flames on its trailing side, a smoke and dust cloud left behind
  if (t > 38 && t < 51) g.chunks.forEach((ch, ci) => { const k = t - 38, now = g.moonG.localToWorld(chunkAt(ch, t).o), amt = ss(0, 1.5, k) * (1 - ss(47, 51, t));
    for (let j = 1; j <= 6; j++) { const pp = g.moonG.localToWorld(chunkAt(ch, t - j * 0.22).o), f = j / 6;
      fire(pp,RM * (0.2 - 0.12 * f), 0.75 * amt * (1 - f), j < 3 ? '#ffc070' : '#ff6a20');
      smoke(g.moonG.localToWorld(chunkAt(ch, t - j * 0.5).o), RM * (0.22 + 0.12 * f), 0.4 * amt * (1 - f * 0.7), '#3e302c', ci + j); }
    fire(now, RM * 0.35, 0.25 * amt, '#ff8a3a'); });
  // embers drifting up over the town in the fire light
  if (t > 39 && t < 62.4) { const R = RNG('embers'); for (let k = 0; k < 90; k++) { const x0 = R.r(-90, 90), z0 = -R.r(40, 420), sp = R.r(1.5, 4), ph = R.f(), age = mod(t * sp / 30 + ph, 1);
    const v = new THREE.Vector3(x0 + Math.sin(t * 0.7 + k) * 6 + age * 15, 4 + age * 60, z0); fire(v, R.r(0.5, 1.4) * (1 + -z0 / 200), 0.9 * Math.sin(age * Math.PI) * ss(39, 42, t) * (0.6 + 0.4 * Math.sin(t * 9 + k)), k % 4 ? '#ffa040' : '#ffe0a0'); } }
  // burning fragments: head, flame trail, smoke trail; flash, fireball and a smoke column at the impact
  g.meteors.forEach((m, mi2) => {
    const u = (t - m.t0) / m.dur;
    if (u > 0 && u < 1) {
      const hd = meteorPos(m, u), dd = hd.distanceTo(g.cam.position), sz = dd * 0.012 * m.s;
      fire(hd, sz * 2.2, 1, '#fff6e0'); fire(hd, sz * 4.5, 0.55, '#ff9a40');
      for (let j = 1; j < 10; j++) { const uj = u - j * 0.022; if (uj < 0) break; const v = meteorPos(m, uj); fire(v, sz * (3.4 - j * 0.3), 0.7 * (1 - j / 10), j < 4 ? '#ffb050' : '#e0501c'); }
      for (let j = 2; j < 9; j++) { const uj = u - j * 0.05; if (uj < 0) break; const v = meteorPos(m, uj); smoke(v, sz * (2.5 + j * 0.9), 0.32 * (1 - j / 9), '#3a2c28', j + mi2); }
    }
    const a = t - m.ti; if (a < 0) return;
    const P = meteorP(m), dd = P.distanceTo(g.cam.position);
    if (a < 0.25) fire(P.clone().setY(dd * 0.03), dd * 0.5 * m.s * (0.5 + a * 2), 1.0 * (1 - a / 0.25), '#fff4e0');   // the flash
    if (a < 2.2) { fire(P.clone().setY(dd * 0.025 + a * dd * 0.01), dd * 0.2 * m.s * (0.4 + a * 0.6), 0.95 * (1 - a / 2.2) ** 1.5, '#ffb060'); fire(P.clone().setY(dd * 0.02), dd * 0.09 * m.s * (0.5 + a * 0.4), (1 - a / 2.2), '#fff0c0'); }   // the fireball
    if (a < 12) fire(P.clone().setY(dd * 0.006), dd * 0.07 * m.s, 0.6 * (1 - a / 12) * (0.8 + 0.2 * Math.sin(t * 17 + mi2)), '#ff6a24');   // burning on the horizon
    if ((m.big || mi2 % 2 === 0) && !(on && P.z > zw)) column(P.clone().setY(0), a, dd * 0.12 * m.s, dd * 0.03 * m.s, mi2 + 1, !!m.ocean);
  });
  // the wave: mist along the lip, churn at the toe, bursts where it swallows houses and the bell tower, boats; then the impact
  if (on && Hv > 30) {
    const dist2 = c.z - zw, half = dist2 * 0.42 + 0.3 * Hv, front = zw + 0.15 * Hv, lipA = ss(30, 160, Hv), R = RNG('lip');
    for (let k = 0; k < 56; k++) { const u = R.f(), age = mod(t * R.r(0.12, 0.22) + R.f(), 1), x = c.x + (u * 2 - 1) * half, zo = -x * x / 160000;
      spray(x, Hv * (1.0 + 0.04 * Math.sin(x * 0.0021 + 1.3)) + age * 0.12 * Hv * R.r(0.3, 1.2), front + zo + 8, Hv * R.r(0.06, 0.26) * (0.7 + age), 0.3 * lipA * Math.sin(age * Math.PI), '#d8ccc4'); }
    for (let k = 0; k < 34; k++) { const u = R.f(), age = mod(t * R.r(0.2, 0.35) + R.f(), 1), x = c.x + (u * 2 - 1) * half, zo = -x * x / 160000, zz = zw + 0.36 * Hv + zo + 6;
      const sz = Hv * R.r(0.04, 0.11) * (0.6 + age), patch = Math.max(0, Math.sin(x * 0.0045 + R.r(0, 1)) * Math.sin(x * 0.0017 + 2.1)); spray(x, Math.max(lev, zz > QZ ? gH(x, zz) : lev) + sz * 0.55 + age * R.r(0.05, 0.25) * Hv, zz + R.n(0.05 * Hv), sz, 0.22 * lipA * patch * Math.sin(age * Math.PI), '#d0c6c0'); }
    // churning white water where the wall meets the harbour: tumbling spray clumps at the waterline, patchy along x, each its own age
    { const Rc = RNG('churn'), toe = zw + 0.13 * Hv, lt = 1 - 0.35 * ss(60, 62.9, t);
      for (let k = 0; k < 150; k++) { const u = Rc.f(), x = c.x + (u * 2 - 1) * half * 0.9, zo = -x * x / 160000, age = mod(t * Rc.r(0.35, 0.7) + Rc.f(), 1), sz = Hv * Rc.r(0.015, 0.05) * (0.5 + age);
        const patch = 0.35 + 0.65 * Math.max(0, Math.sin(x * 0.006 + Rc.r(0, 6)) * 0.5 + Math.sin(x * 0.019 + t * 0.8 + k) * 0.5);
        const v = new THREE.Vector3(x, lev + sz * 0.42 + age * Hv * 0.05, toe + zo + Rc.r(-4, 0.12 * Hv));
        spray(v.x, v.y, v.z, sz, 0.75 * lipA * patch * Math.sin(age * Math.PI), C3('#efe9e2', '#b8b0aa', 1 - lt).getStyle()); } }
    for (let i = 0; i < g.nH; i += 3) { const [hx, hz, hy, hw] = g.hPos[i], th = zw + 0.05 * Hv - hz; if (th < -20 || th > 160) continue; const a = clamp((th + 20) / 180), Rt = RNG('spl', i);
      for (let j = 0; j < 3; j++) spray(hx + Rt.n(hw), hy + a * 0.18 * Hv + Rt.r(0, 0.06) * Hv, zw + 0.06 * Hv + 10, Hv * (0.06 + 0.16 * a) * Rt.r(0.7, 1.2), 0.9 * ss(0, 0.08, a) * Math.pow(1 - a, 0.6), '#f4f0ec'); }
    [[-12, -62, 26], [14, -335, 22]].forEach(([bx, bz, bh], bi) => { const th = zw + 0.05 * Hv - bz; if (th < -20 || th > 260) return; const a = clamp((th + 20) / 280), Rt = RNG('tow', bi);
      for (let j = 0; j < 9; j++) { const y = bh * 0.3 + a * 0.5 * Hv * (j + 1) / 9; spray(bx + Rt.n(10), y, zw + 0.08 * Hv + 14, Hv * 0.1 * (1 + j * 0.2), 0.85 * ss(0, 0.06, a) * (1 - a), '#f8f6f2'); } });
    g.boats.forEach((b, bi) => { const hk = hitK(b.z, 20); if (hk <= 0 || hk >= 1) return; const Rb = RNG('bsp', bi);
      for (let j = 0; j < 3; j++) spray(b.x + Rb.n(4), gH(b.x, b.z) + hk * 30 + j * 8, b.z + 12, 10 + hk * 20, 0.5 * Math.sin(hk * Math.PI), '#ffffff'); });
  }
  if (t > 62.3) { const k = ss(62.3, 63.0, t), R = RNG('impact');
    for (let j = 0; j < 46; j++) { const a = R.f(), x = c.x + R.n(14 + 20 * k), y = c.y + R.r(-25, 20) * (0.4 + k), z = lerp(zw + 30, c.z - 6, a * k);
      spray(x, y + R.r(0, 30) * k, z, R.r(12, 30) * (0.5 + k), k * R.r(0.5, 0.95), '#e8e4de'); } }
  for (; si < SP.length; si++) SP[si].visible = false;
  for (; fi2 < FL.length; fi2++) FL[fi2].visible = false;
  for (; mi < SM.length; mi++) SM[mi].visible = false;
  for (; bi2 < BL.length; bi2++) BL[bi2].visible = false;
  // debris carried up the face
  { const D = g.debris, R = RNG('debris'), act = on && t > 57 && Hv > 100;
    for (let i = 0; i < 90; i++) { if (!act) { D.setMatrixAt(i, _hid); continue; }
      const dist2 = c.z - zw, x = c.x + R.n(dist2 * 0.32 + 30), age = mod(t * R.r(0.12, 0.25) + R.f(), 1), sz = R.r(0.5, 3.5) * (1 + dist2 / 400);
      D.setMatrixAt(i, M4c(x, -2 + age * 0.5 * Hv, zw + 0.03 * Hv + 6 + age * 0.06 * Hv, t * R.r(1, 3), sz, sz * R.r(0.2, 0.6), sz * R.r(0.4, 1), t * R.r(1, 3), t * R.r(0.5, 2))); }
    D.instanceMatrix.needsUpdate = true; }

  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

// the counter text for each act (es-ES numbers)
const kmTxt = (km) => km >= 9.95 ? `a ${Math.round(km)} km` : `a ${km.toFixed(1).replace('.', ',')} km`;
function hud() {
  const t = TT; if (t < 5 || t >= 63.0 || (t >= 34 && t < 38)) return;
  if (t < 34) { const km = Math.round(knots(MOON_KM, t) / 100) * 100;
    return pvHud('La Luna', `${pvNum(km)} km ↓`, t < 16 ? 'y cayendo' : t < 26 ? 'la marea sube' : 'límite de Roche', ev(5, 0.5)); }
  if (t < 48) { const n = knots(IMPACTS, t), v = n >= 3000 ? '3.000+' : pvNum(n < 100 ? Math.round(n) : Math.round(n / 10) * 10); return pvHud('Impactos', v, 'y contando', ev(38, 0.5)); }
  const hm = Math.round(waveHm(t) / 5) * 5, km = waveKm(t);
  if (t < 56) return pvHud('Altura de la ola', `${pvNum(hm)} m`, kmTxt(km), ev(48, 0.5));
  if (t < 62.6) return pvHud('Altura de la ola', '400 m', `a ${pvNum(Math.max(10, Math.round(km * 100) * 10))} m`);
  return pvHud('Altura de la ola', 'AQUÍ', '');
}
// the title, two lines, sized to fit inside the safe zone
function olTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 80px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore();
    const size = Math.min(92, Math.floor(80 * 860 / wmax)), lh = size * 1.16, x = 500, y0 = 520;
    pvFeather(x, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 540, 120 + lines.length * 60, a);
    lines.forEach((l, i) => pvText(l, x, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
function endCard() {
  const a = ev(66.2, 0.7), b = ev(66.9, 0.8), c2 = ev(67.7, 0.8);
  const f = () => {
    pvText('Tranquilo:', 500, 790, 56, { italic: true, align: 'center', alpha: a });
    pvText('la Luna se aleja', 500, 930, 96, { align: 'center', alpha: b });
    pvText('3,8 cm cada año.', 500, 1050, 64, { align: 'center', alpha: c2 });
    ctx.save(); screen(); ctx.globalAlpha = 0.5 * c2; ctx.fillStyle = '#c8d0e0'; ctx.fillRect(440, 1095, 120, 3); ctx.restore();
  };
  if (DEFER) DEFER.push(f); else f();
}

function sceneTown() {
  const t = TT;
  if (t < 63.1) update3D();
  // the impact: grey-white spray, murky water with dark particles, then black
  const wh = ss(62.88, 63.04, t), mk = ss(63.1, 63.3, t), bk = ss(63.55, 64.0, t);
  if (wh > 0 && t < 63.3) { pvTint('#cfd4cf', wh * (1 - mk)); }
  if (t >= 63.1 && t < 64.05) { const R = RNG('murk', Math.floor(t * 24)); pvTint('#16211d', mk);
    ctx.save(); screen(); ctx.globalAlpha = 1 - bk;
    for (let i = 0; i < 70; i++) { const x = R.r(0, W), y = R.r(0, H), r = R.r(2, 9); ctx.fillStyle = `rgba(${R.f() < 0.6 ? '6,10,8' : '150,160,150'},${R.r(0.4, 0.8)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = 'rgba(170,180,170,0.35)'; ctx.lineWidth = 2; for (let i = 0; i < 22; i++) { const x = R.r(0, W), y = R.r(0, H), l = R.r(20, 70); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - l * 0.4, y + l); ctx.stroke(); }
    ctx.restore(); }
  if (bk > 0) pvTint('#050607', bk);
  if (t >= 64.0) fillAll('#050607');
  if (t >= 66) { pvGlow(500, 930, 820, 'rgba(60,70,100,0.4)', ev(66, 1.2)); endCard(); }
  hud();
  olTitle(['¿Qué pasaría si la Luna', 'chocara contra la Tierra?'], 0.3, 5.0);
  pvCaption('La Luna está cayendo.', 5.5, 15.6);
  pvCaption('Su gravedad arrastra el océano.', 16.5, 25.6);
  pvCaption('Entonces la Tierra la desgarra.', 26.5, 33.7);
  pvCaption('Se rompe.', 34.4, 37.8);
  pvCaption('Caen trozos como montañas.', 38.5, 47.6);
  pvCaption('Uno cae en el océano.', 48.3, 51.8);
  pvCaption('El mar se retira.', 52.0, 55.8);
  pvCaption('La ola mide 400 metros.', 56.3, 62.6);
}
