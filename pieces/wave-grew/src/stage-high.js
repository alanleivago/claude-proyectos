// =====================================================================
//  STAGE HIGH — story time 185..290 s. The camera climbs out of the cloud deck (2 km) to the edge of space (190 km).
//  One region seen from ever higher: the coastal land the wave is crossing (fields, woods, towns, rivers, roads),
//  a bay ahead with a mountain cape across it, the open sea to the right. From 195 the sea ahead DRAINS into the
//  wave: a water-level uniform falls over a seabed heightfield (shelf, slope, abyss), boats strand, wrecks appear.
//  Then the jet under the lip, the steam, the sky going black with a blue limb, stars, the planet's curve.
//  World coords (metres): a fixed point (xw, zw) is drawn at camera-relative (xw, zw + travel(st)).
//  Everything top-level is prefixed `hi`.
// =====================================================================
let hiG = null;

// ---- JS ports of the shader noise (the seabed / coast functions are shared with GLSL so props sit on the floor)
const hiFr = (x) => x - Math.floor(x);
function hiHashJ(x, y) { let a = hiFr(x * 0.1031), b = hiFr(y * 0.1031), c = a; const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33); a += d; b += d; c += d; return hiFr((a + b) * c); }
function hiNoiseJ(x, y) { const ix = Math.floor(x), iy = Math.floor(y); let fx = x - ix, fy = y - iy; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hiHashJ(ix, iy), hiHashJ(ix + 1, iy), fx), lerp(hiHashJ(ix, iy + 1), hiHashJ(ix + 1, iy + 1), fx), fy); }
function hiFbmJ(x, y) { let s = 0, a = 0.5; for (let i = 0; i < 5; i++) { s += a * hiNoiseJ(x, y); const nx = 1.6 * x - 1.2 * y + 3.1, ny = 1.2 * x + 1.6 * y + 3.1; x = nx; y = ny; a *= 0.5; } return s / 0.96875; }
// continentalness (km; > 0 land) at q = world km
function hiCoastJ(x, y) {
  const zc = -16 + 2.2 * (hiNoiseJ(x * 0.21, 3.7) - 0.5) + 0.9 * (hiNoiseJ(x * 0.83, 9.1) - 0.5) - 8 * Math.exp(-(((x - 8) / 1.4) ** 2));
  const a = y - zc, b = -7 + 3 * (hiNoiseJ(y * 0.12, 5.3) - 0.5) - x;
  const cp = (1 - Math.hypot((x - 12) / 14, (y + 46) / 8)) * 11 + 4 * (hiNoiseJ(x * 0.18 + 2, y * 0.18 + 2) - 0.5);
  let c = Math.max(a, b, cp); c = c / (1 + Math.abs(c) / 30);
  const rho = Math.hypot(x - 5, y + 40);
  c += (hiFbmJ(x * 0.0045 + 11, y * 0.0045 + 11) - 0.47) * 260 * ss(80, 400, rho);
  c += (hiFbmJ(x * 0.05 + 7, y * 0.05 + 7) - 0.5) * 14 * ss(20, 70, rho);
  return c;
}
function hiBedLJ(x, y, s) {
  return -1 - 3 * ss(0, 0.3, s) - 150 * ss(0.2, 13, s) - 3250 * ss(11, 38, s) - 700 * ss(38, 160, s) + (hiNoiseJ(x * 0.09 + 3, y * 0.09 + 3) - 0.5) * 900 * ss(14, 40, s);
}
// the falling sea: level (m) and drain radius (km) by story time
const hiLEV = [[195, 0], [198, -20], [201, -80], [204, -165], [207, -600], [210, -2000], [213, -3400], [218, -4400], [240, -5000], [290, -5200]];
const hiDRR = [[185, 70], [195, 70], [212, 200], [250, 500], [290, 950]];
const hiLevAt = (st) => (st <= 195 ? 0 : knots(hiLEV, st));
const hiLevelJ = (x, y, st) => hiLevAt(st) * (1 - ss(knots(hiDRR, st) * 0.55, knots(hiDRR, st), Math.hypot(x - 5, y + 40)));

// ---- GLSL: noise, the world (coast, seabed, level), the atmosphere
const hiGLN = `
  float hiHash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float hiNoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hiHash(i), hiHash(i + vec2(1.0, 0.0)), f.x), mix(hiHash(i + vec2(0.0, 1.0)), hiHash(i + vec2(1.0, 1.0)), f.x), f.y); }
  float hiFbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * hiNoise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 3.1; a *= 0.5; } return s / 0.96875; }
  float hiFbm3(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 3; i++){ s += a * hiNoise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 3.1; a *= 0.5; } return s / 0.875; }
  float hiLod(float fw, float sz){ return 1.0 - smoothstep(sz * 0.3, sz * 1.2, fw); }
  float hiLine(float d, float w, float fw){ float W = max(w, fw * 1.2); return (1.0 - smoothstep(W * 0.5 - fw * 0.5, W * 0.5 + fw * 0.5, d)) * (w / W); }`;
const hiGLW = `
  uniform float uLev, uDrR, uTrav, uH;
  float hiCoast(vec2 q){
    float zc = -16.0 + 2.2 * (hiNoise(vec2(q.x * 0.21, 3.7)) - 0.5) + 0.9 * (hiNoise(vec2(q.x * 0.83, 9.1)) - 0.5);
    float pk = (q.x - 8.0) / 1.4; zc -= 8.0 * exp(-pk * pk);
    float a = q.y - zc, b = -7.0 + 3.0 * (hiNoise(vec2(q.y * 0.12, 5.3)) - 0.5) - q.x;
    float cp = (1.0 - length((q - vec2(12.0, -46.0)) / vec2(14.0, 8.0))) * 11.0 + 4.0 * (hiNoise(q * 0.18 + 2.0) - 0.5);
    float c = max(max(a, b), cp); c = c / (1.0 + abs(c) / 30.0);
    float rho = length(q - vec2(5.0, -40.0));
    c += (hiFbm(q * 0.0045 + 11.0) - 0.47) * 260.0 * smoothstep(80.0, 400.0, rho);
    c += (hiFbm(q * 0.05 + 7.0) - 0.5) * 14.0 * smoothstep(20.0, 70.0, rho);
    return c; }
  float hiBedL(vec2 q, float s){
    return -1.0 - 3.0 * smoothstep(0.0, 0.3, s) - 150.0 * smoothstep(0.2, 13.0, s) - 3250.0 * smoothstep(11.0, 38.0, s) - 700.0 * smoothstep(38.0, 160.0, s)
      + (hiNoise(q * 0.09 + 3.0) - 0.5) * 900.0 * smoothstep(14.0, 40.0, s); }
  float hiLandL(vec2 q, float c){
    float r = 1.0 - abs(2.0 * hiNoise(q * 0.012 + 4.0) - 1.0);
    return 1.0 + 30.0 * smoothstep(0.0, 1.5, c) + 170.0 * smoothstep(0.5, 6.0, c) * hiNoise(q * 0.2 + 5.0) + 2600.0 * r * r * r * smoothstep(25.0, 70.0, c); }
  // the wave's drawdown in front of the toe: an organic front ~1.42 H ahead (0 outside, 1 inside)
  float hiFloodE(vec2 pw){ return -1.42 + 0.34 * (hiFbm3(pw / (0.45 * uH) + 3.0) - 0.5) + 0.08 * (hiNoise(pw / (0.08 * uH) + 7.0) - 0.5); }
  float hiFlood(vec2 pw, float relz){ float e = hiFloodE(pw); return smoothstep(e - 0.012, e + 0.008, relz / uH); }
  float hiLevel(vec2 q){ return uLev * (1.0 - smoothstep(uDrR * 0.55, uDrR, length(q - vec2(5.0, -40.0)))); }`;
const hiGLA = `
  uniform vec3 uSunD, uHzB, uHzW, uHzS, uZen; uniform float uCamH, uBeta, uHs, uSpace, uDip, uAmb;
  float hiAir(float d){ float k = uHs * (1.0 - exp(-uCamH / uHs)) / max(uCamH, 1.0); return 1.0 - exp(-d * uBeta * k); }
  vec3 hiHazeCol(vec3 dir){ vec2 a = normalize(dir.xz + 1e-6), b = normalize(uSunD.xz); float s = pow(max(dot(a, b), 0.0), 2.0);
    return mix(mix(uHzB, uHzW, s * 0.85), uHzS, uSpace); }
  uniform vec3 uRay;
  vec3 hiAtmo(vec3 col, vec3 V, float d){   // two layers: Rayleigh blue (8 km scale height), aerosol haze (2.5 km)
    float h = max(uCamH, 1.0), kr = 8000.0 * (1.0 - exp(-h / 8000.0)) / h, ka = 1800.0 * (1.0 - exp(-h / 1800.0)) / h;
    col = mix(col, uRay, 1.0 - exp(-d * kr / 200000.0));
    return mix(col, hiHazeCol(V), 1.0 - exp(-d * ka * uBeta)); }
  vec3 hiSky(vec3 d){
    float e = asin(clamp(d.y, -1.0, 1.0)) + uDip;
    float w = mix(0.16, 0.012, pow(uSpace, 0.35));
    vec3 hor = hiHazeCol(d);
    vec3 c = mix(uZen, hor, exp(-max(e, 0.0) / w));
    c += vec3(0.05, 0.22, 0.85) * exp(-max(e, 0.0) / (w * 0.3)) * uSpace * 0.9;
    float sa = acos(clamp(dot(d, uSunD), -1.0, 1.0));
    c += vec3(1.0, 0.86, 0.66) * (6.0 * exp(-sa * sa / 0.00025) + 0.3 * exp(-sa * 5.0) * (1.0 - 0.6 * uSpace));
    if (e < 0.0) c = mix(c, hor, smoothstep(0.0, -0.02, e));
    return c; }`;

// ---- textures
function hiTexPuff(key, n, a, w = 128) {
  return g3Tex((x) => { const R = RNG(key); for (let i = 0; i < n; i++) { const px = w / 2 + R.n(w * 0.2), py = w / 2 + R.n(w * 0.18), s = R.r(w * 0.12, w * 0.3);
    const gr = x.createRadialGradient(px, py, 0, px, py, s); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, w); } }, w, w);
}
function hiTexSpark() {
  return g3Tex((x, w) => { const c = w / 2; let gr = x.createRadialGradient(c, c, 0, c, c, c * 0.35); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, w);
    x.globalCompositeOperation = 'lighter';
    for (const [dx, dy, L] of [[1, 0, 0.5], [0, 1, 0.5], [0.7, 0.7, 0.22], [0.7, -0.7, 0.22]]) { const g2 = x.createLinearGradient(c - dx * c * L * 2, c - dy * c * L * 2, c + dx * c * L * 2, c + dy * c * L * 2);
      g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(0.5, 'rgba(255,255,255,0.9)'); g2.addColorStop(1, 'rgba(255,255,255,0)'); x.strokeStyle = g2; x.lineWidth = 2;
      x.beginPath(); x.moveTo(c - dx * c * L * 2, c - dy * c * L * 2); x.lineTo(c + dx * c * L * 2, c + dy * c * L * 2); x.stroke(); } }, 64, 64);
}

// ---- the region's cloud field: one list -> 3D puffs (InstancedMesh) + a footprint texture for the ground's shadows
const hiCLR = [-90, -170, 210];   // km: x0, z0, size of the footprint square
function hiCloudList() {
  const R = RNG('hi-clouds'), L = [];
  for (let k = 0; k < 60000 && L.length < 2600; k++) {
    const x = R.r(hiCLR[0] + 4, hiCLR[0] + hiCLR[2] - 4), z = R.r(hiCLR[1] + 4, hiCLR[1] + hiCLR[2] - 4);
    const d = hiFbmJ(x * 0.05 + 3, z * 0.05 + 1), d2 = hiFbmJ(x * 0.18 + 9, z * 0.18 + 4);
    const boost = 1 + 1.6 * Math.exp(-Math.hypot(x - 4, z + 22) / 22);
    if (R.f() > (ss(0.4, 0.66, d) * (0.35 + 0.65 * ss(0.35, 0.62, d2)) * 0.95 + 0.012) * boost) continue;
    if (Math.hypot(x, z + 7.4) < 1.6) continue;          // keep the camera's first exit clear
    const r = 0.32 * Math.exp(R.r(0, 1.25)) * (0.7 + 0.6 * d);
    if (L.some((o) => Math.hypot(o.x - x, o.z - z) < (o.r + r) * 0.8)) continue;
    L.push({ x, z, r, base: R.r(820, 1050), tall: R.r(0.55, 1.0) * (1 + 0.6 * ss(0.55, 0.75, d)) });
  }
  return L;
}
// soft cumulus: every blob is a camera-facing sphere impostor (round lit top, shaded base, fluffy alpha edge),
// sorted back to front each frame so the soft edges blend over each other
function hiBuildClouds(list, U) {
  const R = RNG('hi-puffs'), B = [];
  for (const cl of list) {
    const nb = 6 + Math.min(12, Math.floor(cl.r * 9)), H0 = cl.r * 420 * cl.tall;
    for (let i = 0; i < nb; i++) {
      const a = R.r(0, TAU), rr = Math.sqrt(R.f()) * cl.r * 0.72, bx = cl.x + Math.cos(a) * rr * 1.25, bz = cl.z + Math.sin(a) * rr * 0.85, k = 1 - rr / cl.r;
      const br = cl.r * R.r(0.26, 0.42) * (0.55 + 0.7 * k) * 1000;
      B.push([bx * 1000, cl.base + br * 0.55 + k * k * H0 + R.r(0, 0.25) * H0, bz * 1000, br, cl.base, R.f(), R.r(0.9, 1.0)]);
    }
    for (let i = 0; i < 3; i++) { const a = R.r(0, TAU), rr = cl.r * R.r(0.2, 0.6); B.push([(cl.x + Math.cos(a) * rr) * 1000, cl.base + cl.r * 130, (cl.z + Math.sin(a) * rr * 0.7) * 1000, cl.r * R.r(0.4, 0.55) * 1000, cl.base, R.f(), 0.88]); }
  }
  const N = B.length, geo = new THREE.InstancedBufferGeometry(); const base = new THREE.PlaneGeometry(2, 2);
  geo.index = base.index; geo.setAttribute('position', base.attributes.position);
  const aC = new THREE.InstancedBufferAttribute(new Float32Array(N * 4), 4), aS = new THREE.InstancedBufferAttribute(new Float32Array(N * 4), 4);
  geo.setAttribute('aC', aC); geo.setAttribute('aS', aS); geo.instanceCount = N;
  const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
    vertexShader: `#include <common>
      #include <logdepthbuf_pars_vertex>
      ${CURVE_GLSL} ${hiGLN} ${hiGLW}
      attribute vec4 aC, aS; varying vec2 vUv; varying vec3 vW; varying float vR, vY, vBase, vSeed, vShade, vFade;
      void main(){
        vec3 c = aC.xyz + vec3(0.0, 0.0, uTrav);
        float fl = hiFlood(vec2(aC.x, aC.z), c.z);
        vec3 cd = curveDrop(c);
        vec4 vc = viewMatrix * vec4(cd, 1.0);
        float d = length(cd - cameraPosition);
        vFade = (1.0 - fl) * smoothstep(1.2 * aC.w, 3.0 * aC.w + 600.0, d);
        vec2 q = position.xy * 1.2; vc.xy += q * aC.w;
        vUv = q; vW = cd; vR = aC.w; vY = aC.y; vBase = aS.x; vSeed = aS.y; vShade = aS.z;
        gl_Position = projectionMatrix * vc;
        if (vFade < 0.01) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `#include <common>
      #include <logdepthbuf_pars_fragment>
      ${hiGLN} ${hiGLA}
      varying vec2 vUv; varying vec3 vW; varying float vR, vY, vBase, vSeed, vShade, vFade;
      void main(){
        #include <logdepthbuf_fragment>
        float r = length(vUv);
        float n = hiFbm3(vUv * 2.6 + vSeed * 31.0);
        float a = 1.0 - smoothstep(0.62 + 0.3 * n, 1.02 + 0.12 * n, r);
        a *= vFade; if (a < 0.01) discard;
        float rz = min(r, 0.999);
        vec3 nv = normalize(vec3(vUv * 0.95 + (vec2(hiNoise(vUv * 5.0 + vSeed * 9.0), hiNoise(vUv * 5.0 + 4.0 + vSeed * 9.0)) - 0.5) * 0.5, sqrt(1.0 - rz * rz) + 0.15));
        vec3 nw = normalize(transpose(mat3(viewMatrix)) * nv);
        float dif = dot(nw, uSunD), hh = vY + nw.y * vR - vBase;
        vec3 V = normalize(vW - cameraPosition);
        float top = smoothstep(-0.2, 1.0, hh / max(vR * 2.2, 1.0));
        vec3 lit = vec3(1.0, 0.97, 0.92) * (1.05 + 0.55 * max(dif, 0.0));
        vec3 shd = mix(vec3(0.46, 0.52, 0.64), vec3(0.72, 0.77, 0.86), top);
        vec3 col = mix(shd, lit, clamp(0.5 + 0.55 * dif, 0.0, 1.0) * (0.45 + 0.55 * top));
        col += vec3(1.0, 0.92, 0.8) * pow(max(dot(V, uSunD), 0.0), 6.0) * (1.0 - a) * 0.8;     // silver lining when backlit
        col *= vShade * mix(1.0, uAmb, 0.4);
        col = hiAtmo(col, V, length(vW - cameraPosition));
        gl_FragColor = vec4(col, a);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 2;
  return { mesh, B, aC, aS, order: new Int32Array(N).map((_, i) => i), d2: new Float32Array(N) };
}
function hiSortClouds(C, trav, eye) {
  const { B, aC, aS, order, d2 } = C;
  for (let i = 0; i < B.length; i++) { const b = B[i], z = b[2] + trav, y = b[1] - eye; d2[i] = b[0] * b[0] + y * y + z * z; }
  order.sort((p, q) => d2[q] - d2[p]);
  const c = aC.array, s = aS.array;
  for (let k = 0; k < order.length; k++) { const b = B[order[k]]; c[k * 4] = b[0]; c[k * 4 + 1] = b[1]; c[k * 4 + 2] = b[2]; c[k * 4 + 3] = b[3]; s[k * 4] = b[4]; s[k * 4 + 1] = b[5]; s[k * 4 + 2] = b[6]; }
  aC.needsUpdate = true; aS.needsUpdate = true;
}
function hiCloudTex(list) {
  const N = 2048, t = g3Tex((x) => { x.fillStyle = '#000'; x.fillRect(0, 0, N, N); x.globalCompositeOperation = 'lighter';
    for (const c of list) { const px = (c.x - hiCLR[0]) / hiCLR[2] * N, py = (c.z - hiCLR[1]) / hiCLR[2] * N, r = c.r * 1.15 / hiCLR[2] * N;
      const gr = x.createRadialGradient(px, py, 0, px, py, r); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = gr; x.beginPath(); x.ellipse(px, py, r * 1.2, r * 0.9, 0, 0, TAU); x.fill(); } }, N, N, false);
  t.flipY = false; t.minFilter = THREE.LinearMipmapLinearFilter; t.needsUpdate = true; return t;
}

// ---- the mountain cape across the bay: a faceted range with snow (world-fixed mesh)
function hiMountGeo() {
  const NX = 270, NZ = 165, x0 = -1500, x1 = 25500, z0 = -54000, z1 = -38000;
  const hgt = (x, z) => { const e = 1 - Math.hypot((x - 12000) / 12800, (z + 46000) / 7200); if (e <= 0) return -60;
    const env = ss(0, 0.4, e), axis = Math.exp(-(((z + 46000 + 1500 * Math.sin(x / 4000)) / 3200) ** 2));
    let s = 0, a = 1, f = 1 / 6500, wgt = 1;
    for (let o = 0; o < 4; o++) { const n = 1 - Math.abs(2 * hiNoiseJ(x * f * 0.75 + 3.3 * o, z * f * 1.3 + 1.7 * o) - 1); const v = n * n * wgt; s += v * a; wgt = clamp(v * 1.8); a *= 0.5; f *= 2.05; }
    return env * (120 + 2300 * Math.pow(s * (0.4 + 0.7 * axis), 1.3)) - 60 * (1 - env); };
  const pos = [], col = [], idx = [], hs = [];
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) { const x = lerp(x0, x1, i / NX), z = lerp(z0, z1, j / NZ); hs.push(hgt(x, z)); }
  const H0 = (i, j) => hs[clamp(j, 0, NZ) * (NX + 1) + clamp(i, 0, NX)];
  const snow = lin('#f4f6fa'), rock = lin('#7c7166'), rock2 = lin('#5f5953'), forest = lin('#3c5a2e'), meadow = lin('#7d8a4c'), scree = lin('#9c9184');
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
    const x = lerp(x0, x1, i / NX), z = lerp(z0, z1, j / NZ), h = H0(i, j);
    pos.push(x, h, z);
    const dx = (H0(i + 1, j) - H0(i - 1, j)) / (2 * (x1 - x0) / NX), dz = (H0(i, j + 1) - H0(i, j - 1)) / (2 * (z1 - z0) / NZ), sl = Math.hypot(dx, dz);
    const n = hiNoiseJ(x / 900, z / 900), line = 1500 + 420 * n;
    let c = h < 750 + 250 * n ? forest.clone().lerp(meadow, ss(500, 1100, h) * 0.6) : h < 1400 ? meadow.clone().lerp(rock, ss(1000, 1400, h)) : rock.clone().lerp(rock2, n).lerp(scree, ss(0.4, 0.9, hiNoiseJ(x / 400, z / 400)) * 0.4);
    void line; void snow; void sl;
    c.multiplyScalar(0.92 + 0.16 * hiHashJ(i, j));
    col.push(c.r, c.g, c.b);
  }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; if ((i + j) % 2) idx.push(a, c, b, b, c, d); else idx.push(a, c, d, a, d, b); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}

// ---- boats, ships and wrecks (instanced, on the sea floor or floating until the water leaves them)
function hiHullGeo() {
  const sh = new THREE.Shape(); sh.moveTo(-0.5, -0.085); sh.lineTo(0.28, -0.085); sh.quadraticCurveTo(0.45, -0.06, 0.5, 0); sh.quadraticCurveTo(0.45, 0.06, 0.28, 0.085); sh.lineTo(-0.5, 0.085); sh.lineTo(-0.5, -0.085);
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.09, bevelEnabled: false, curveSegments: 4 }); g.rotateX(-Math.PI / 2); return g;
}
function hiBoatList() {
  const R = RNG('hi-boats'), L = [];
  const tryPut = (n, fx, fz, cmin, cmax, mk) => { for (let k = 0, got = 0; k < n * 40 && got < n; k++) { const x = fx(), z = fz(), c = hiCoastJ(x, z); if (c > cmax || c < cmin) continue; L.push(mk(x, z, -c)); got++; } };
  const hulls = ['#c8372d', '#1f4f7a', '#f0eee8', '#2a2f33', '#e3a33a', '#2e7a5a'].map(lin);
  tryPut(30, () => 8 + R.n(2.2), () => -24.2 + R.n(1.4), -1.6, -0.08, (x, z) => ({ x, z, L: R.r(26, 46), hd: R.r(0, TAU), col: R.pick(hulls), cab: true, tilt: R.n(0.45), sink: 0 }));   // the harbour at the peninsula
  tryPut(46, () => R.r(-5, 30), () => R.r(-17.5, -40), -16, -1.0, (x, z) => ({ x, z, L: R.r(34, 70), hd: R.r(0, TAU), col: R.pick(hulls), cab: true, tilt: R.n(0.5), sink: 0 }));        // fishing boats in the bay
  tryPut(7, () => R.r(0, 28), () => R.r(-18, -36), -13, -1.5, (x, z) => ({ x, z, L: R.r(180, 240), hd: R.r(-0.6, 0.6) + Math.PI * 0.5, col: R.pick([lin('#2a4a6a'), lin('#8a2a24'), lin('#26343c')]), cab: true, tilt: R.n(0.18), sink: 0, big: true }));   // cargo ships
  tryPut(16, () => R.r(-4, 34), () => R.r(-18, -50), -40, -2, (x, z) => ({ x, z, L: R.r(90, 200), hd: R.r(0, TAU), col: lin('#5a3a26').multiplyScalar(R.r(0.8, 1.2)), cab: R.f() < 0.5, tilt: R.n(0.6), sink: R.r(0.25, 0.55), wreck: true }));   // old wrecks
  return L;
}

// ---- the airliner (camera-relative; passes under the lip 217.5..226.5)
function hiJet() {
  const g = new THREE.Group(), white = new THREE.MeshStandardMaterial({ color: lin('#f3f5f7'), roughness: 0.4, metalness: 0.15 }), blue = new THREE.MeshStandardMaterial({ color: lin('#1f4f9a'), roughness: 0.5 }), grey = new THREE.MeshStandardMaterial({ color: lin('#9aa3ad'), roughness: 0.5, metalness: 0.3 });
  const fus = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.9, 52, 14).rotateZ(Math.PI / 2), white); g.add(fus);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(2.9, 14, 10).scale(2.6, 1, 1), white); nose.position.x = 26; g.add(nose);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(2.9, 14, 14).rotateZ(Math.PI / 2), white); tail.position.x = -32.5; tail.scale.set(1, 1, 1); g.add(tail);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(2.95, 2.95, 50, 14, 1, true, Math.PI * 0.35, Math.PI * 0.3).rotateZ(Math.PI / 2), blue); g.add(stripe);
  const plate = (pts, y, mat) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach((p) => s.lineTo(p[0], p[1])); const gg = new THREE.ShapeGeometry(s); gg.rotateX(Math.PI / 2); const m = new THREE.Mesh(gg, mat); m.position.y = y; return m; };
  const wmat = new THREE.MeshStandardMaterial({ color: lin('#e8ecf0'), roughness: 0.45, metalness: 0.2, side: THREE.DoubleSide });
  g.add(plate([[6, 2], [-6, 2], [-17, 31], [-12, 31]], -1.2, wmat), plate([[6, -2], [-6, -2], [-17, -31], [-12, -31]], -1.2, wmat));
  g.add(plate([[-30, 1], [-36, 1], [-41, 11], [-38, 11]], 1, wmat), plate([[-30, -1], [-36, -1], [-41, -11], [-38, -11]], 1, wmat));
  const fin = new THREE.Shape(); fin.moveTo(-27, 2); fin.lineTo(-38, 2); fin.lineTo(-42, 13); fin.lineTo(-37, 13); const fg = new THREE.ShapeGeometry(fin); const fm = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ color: lin('#1f4f9a'), roughness: 0.5, side: THREE.DoubleSide })); g.add(fm);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.4, 6.5, 12).rotateZ(Math.PI / 2), grey); e.position.set(1, -2.6, s * 10); g.add(e); }
  // contrails: two cones streaming back from the engines
  const trTex = g3Tex((x, w, h) => { const gr = x.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.04, 'rgba(255,255,255,0.0)'); gr.addColorStop(0.12, 'rgba(255,255,255,0.85)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, 8, 256);
  const trMat = new THREE.MeshBasicMaterial({ map: trTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, color: lin('#f4f7fb') });
  for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 9, 1800, 10, 1, true), trMat); t.rotation.z = -Math.PI / 2; t.position.set(-900 - 6, -2.6, s * 10); t.renderOrder = 2; g.add(t); }
  g.scale.setScalar(3.0); return g;
}

function hiBuild(g) {
  const scene = new THREE.Scene();
  const cloudList = hiCloudList(), clTex = hiCloudTex(cloudList);
  const towns = [[8.1, -22.7, 1.2], [0.9, -15.0, 1.7], [-3.6, -9.2, 0.8], [14.6, -13.4, 1.0], [5.2, -6.6, 1.1], [-12, -30, 0.9], [-15, -22, 1.0], [24, -10.5, 1.4]].map((t) => new THREE.Vector3(...t));
  const U = {
    uT: TIMEU, uSunD: SUNU, uCurveR: CURVE_R, uTrav: { value: 0 }, uH: { value: 1000 }, uLev: { value: 0 }, uDrR: { value: 70 }, uDrain: { value: 0 },
    uCamH: { value: 2000 }, uBeta: { value: 1 / 50000 }, uRay: { value: lin('#8fb3e6') }, uHs: { value: 8000 }, uSpace: { value: 0 }, uDip: { value: 0 }, uStar: { value: 0 }, uAmb: { value: 1 },
    uHzB: { value: lin('#c3d2e4') }, uHzW: { value: lin('#f1dcc2') }, uHzS: { value: lin('#a6c9f2') }, uZen: { value: lin('#3d70c2') },
    uCl: { value: clTex }, uClR: { value: new THREE.Vector3(...hiCLR) }, uTowns: { value: towns }, uKind: { value: 0 }, uAlpha: { value: 1 },
  };
  // --- sky (a dome that follows the camera; drawn first, no depth)
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1e7, 48, 32), new THREE.ShaderMaterial({ uniforms: U, side: THREE.BackSide, depthTest: false, depthWrite: false,
    vertexShader: `varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = vec4(p.xy, p.w * 0.9999, p.w); }`,
    fragmentShader: `#include <common>
      uniform float uStar; ${hiGLN} ${hiGLA}
      varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); vec3 c = hiSky(d);
        float lum = dot(c, vec3(0.3, 0.55, 0.15));
        vec2 sp = vec2(atan(d.z, d.x), d.y) * 330.0, si = floor(sp); float sh = hiHash(si + 0.5);
        if (sh > 0.982) { vec2 o = fract(sp) - 0.5 - (vec2(hiHash(si + 1.3), hiHash(si + 7.1)) - 0.5) * 0.5; float b = (sh - 0.982) / 0.018;
          c += mix(vec3(0.8, 0.88, 1.0), vec3(1.0, 0.9, 0.75), hiHash(si + 3.0)) * smoothstep(0.24, 0.02, length(o)) * (0.25 + 2.4 * b * b) * uStar * (1.0 - clamp(lum * 5.0, 0.0, 1.0)); }
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

  // --- the ground: a camera-centred disc, rings spaced ~3.4% of their radius out to 7,000 km
  const NA = 900, NR = 262, rr = (k) => 40 * (Math.pow(1.034, k) - 1) / 0.034;
  const pos = new Float32Array(NA * (NR + 1) * 3), idx = [];
  for (let k = 0; k <= NR; k++) for (let a = 0; a < NA; a++) { const r = rr(k), t = a / NA * TAU, i = (k * NA + a) * 3; pos[i] = Math.cos(t) * r; pos[i + 1] = 0; pos[i + 2] = Math.sin(t) * r; }
  for (let k = 0; k < NR; k++) for (let a = 0; a < NA; a++) { const a1 = (a + 1) % NA, p = k * NA + a, q = k * NA + a1, s = (k + 1) * NA + a, t = (k + 1) * NA + a1; idx.push(p, s, q, q, s, t); }
  const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); tg.setIndex(idx);
  const terrain = new THREE.Mesh(tg, new THREE.ShaderMaterial({ uniforms: U, side: THREE.DoubleSide,
    vertexShader: `#include <common>
      #include <logdepthbuf_pars_vertex>
      ${CURVE_GLSL} ${hiGLN} ${hiGLW}
      varying vec3 vW; varying vec2 vP;
      void main(){
        vec2 pw = vec2(position.x, position.z - uTrav), q = pw * 0.001;
        float c = hiCoast(q), y = c > 0.0 ? hiLandL(q, c) : max(hiBedL(q, -c), hiLevel(q));
        vec3 w = curveDrop(vec3(position.x, y, position.z));
        vW = w; vP = pw;
        gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `#include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uT, uDrain; uniform sampler2D uCl; uniform vec3 uClR; uniform vec3 uTowns[8];
      ${hiGLN} ${hiGLW} ${hiGLA}
      varying vec3 vW; varying vec2 vP;
      float hiRiverD(vec2 q){
        float xa = 0.6 + 1.0 * sin(q.y * 0.33 + 0.4) + 0.35 * sin(q.y * 1.21 + 1.0);
        float xb = 15.0 + 1.3 * sin(q.y * 0.27 + 2.0) + 0.4 * sin(q.y * 0.93);
        return min(abs(q.x - xa), abs(q.x - xb)) * 1000.0; }
      float hiRoadD(vec2 q){
        float a = abs(q.y - (-13.4 + 0.6 * sin(q.x * 0.31 + 1.0) + 0.25 * sin(q.x * 1.3)));
        float b = abs(q.x - (4.0 - 0.12 * (q.y + 20.0) + 0.5 * sin(q.y * 0.4)));
        float c = abs(q.y - (-4.0 + 0.8 * sin(q.x * 0.2)));
        float d = abs(q.y - (-52.0 + 1.2 * sin(q.x * 0.25)));
        return min(min(a, b), min(c, d)) * 1000.0; }
      vec3 hiLand(vec2 pw, vec2 q, float c, float fw, out float hd){
        // farm districts (2.4 km squares), each with its own field grid
        vec2 dq = pw / 2400.0, di = floor(dq), df = fract(dq);
        float hD = hiHash(di + 17.0), an = (hD - 0.5) * 0.7, ca = cos(an), sa = sin(an);
        vec2 lp = mat2(ca, sa, -sa, ca) * ((df - 0.5) * 2400.0);
        float RH = 200.0 + 90.0 * hiHash(di + 3.0), row = floor(lp.y / RH), hr = hiHash(vec2(row, hD * 97.0 + 1.0));
        float cw = 140.0 + 300.0 * hr, ux = lp.x + hr * 517.0;
        vec2 cell = vec2(floor(ux / cw), row);
        float h1 = hiHash(cell + di * 7.13), h2 = hiHash(cell.yx * 1.37 + di * 3.1 + 5.0);
        vec2 f = vec2(fract(ux / cw) * cw, fract(lp.y / RH) * RH);
        float edge = min(min(f.x, cw - f.x), min(f.y, RH - f.y));
        float k = h1 + (hD - 0.5) * 0.4;
        vec3 cc;
        if (k < 0.2) cc = vec3(0.45, 0.62, 0.26); else if (k < 0.38) cc = vec3(0.33, 0.52, 0.21); else if (k < 0.53) cc = vec3(0.60, 0.71, 0.31);
        else if (k < 0.71) cc = vec3(0.86, 0.76, 0.42); else if (k < 0.83) cc = vec3(0.58, 0.44, 0.29); else if (k < 0.93) cc = vec3(0.76, 0.64, 0.40); else cc = vec3(0.92, 0.84, 0.30);
        cc *= 0.88 + 0.24 * h2;
        float rows = 0.5 + 0.5 * sin((h2 > 0.5 ? lp.x : lp.y) * 0.8);
        cc *= 1.0 - 0.14 * rows * hiLod(fw, 8.0) * step(0.53, k);
        vec3 mean = mix(vec3(0.55, 0.65, 0.30), vec3(0.74, 0.66, 0.40), clamp(hD * 0.9, 0.0, 1.0));
        cc = mix(cc, mean, 1.0 - hiLod(fw, 170.0));
        cc = mix(cc, vec3(0.24, 0.35, 0.17), hiLine(edge, 7.0, fw) * 0.85);                                  // hedgerows
        vec2 de = min(df, 1.0 - df) * 2400.0;
        cc = mix(cc, vec3(0.74, 0.72, 0.66), hiLine(min(de.x, de.y), 9.0, fw) * 0.75);                       // lanes
        hd = (1.0 - hiLine(edge, 7.0, fw)) * 0.0 + hiLine(edge, 7.0, fw) * 6.0 * hiLod(fw, 10.0);
        // farmsteads at some field corners
        float fm = step(0.9, hiHash(cell * 2.1 + di)) * (1.0 - smoothstep(10.0, 24.0, length(f - vec2(30.0, 30.0))));
        cc = mix(cc, vec3(0.86, 0.80, 0.72), fm * hiLod(fw, 25.0)); hd += fm * 8.0 * hiLod(fw, 25.0);
        // soil mottling, hedgerow trees, lone trees in the pastures
        cc *= 0.92 + 0.16 * hiNoise(pw / 45.0) * hiLod(fw, 45.0) + 0.08 * (hiNoise(pw / 12.0) - 0.5) * hiLod(fw, 12.0);
        vec2 tc = floor(pw / 11.0); float tdot = step(0.45, hiHash(tc + 5.0)) * (1.0 - smoothstep(0.22, 0.4, length(fract(pw / 11.0) - 0.5)));
        float hedgeT = (1.0 - smoothstep(5.0, 9.0, edge)) * tdot + step(0.965, hiHash(floor(pw / 32.0) + 9.0)) * (1.0 - smoothstep(0.1, 0.25, length(fract(pw / 32.0) - 0.5))) * step(k, 0.38);
        cc = mix(cc, vec3(0.17, 0.28, 0.13), hedgeT * hiLod(fw, 11.0));
        hd += hedgeT * 9.0 * hiLod(fw, 11.0);
        // woods
        float fo = hiFbm(q * 0.42 + 3.0) + 0.06 * (hiNoise(pw / 120.0) - 0.5) * hiLod(fw, 120.0) + 0.05 * smoothstep(3.0, 12.0, c);
        float wood = smoothstep(0.61, 0.625, fo);
        float crowns = hiNoise(pw / 13.0) * hiLod(fw, 13.0) + 0.5 * (1.0 - hiLod(fw, 13.0));
        cc = mix(cc, vec3(0.22, 0.36, 0.17) * (0.78 + 0.45 * crowns) * (0.8 + 0.3 * hiNoise(pw / 70.0) * hiLod(fw, 70.0) + 0.15 * hiNoise(pw / 260.0)) * mix(vec3(1.0), vec3(1.15, 1.05, 0.8), hiNoise(pw / 500.0 + 3.0) * 0.6), wood);
        hd += wood * (12.0 + 10.0 * crowns);
        // macro colour at large scales
        float m1 = hiFbm(q * 0.03 + 2.0), m2 = hiFbm(q * 0.11 + 8.0);
        vec3 macro = mix(vec3(0.50, 0.62, 0.30), vec3(0.76, 0.67, 0.42), smoothstep(0.42, 0.66, m1));
        macro = mix(macro, vec3(0.28, 0.42, 0.21), smoothstep(0.55, 0.7, m2) * 0.8);
        cc = mix(cc, macro, smoothstep(700.0, 2600.0, fw));
        return cc; }
      vec3 hiSea(vec2 pw, vec2 q, float s, float fw, out float hd, out float pool, out float chan){
        float bl = hiBedL(q, s), rough = hiFbm(q * 0.6 + 4.0), fine = hiFbm3(q * 4.0 + 2.0);
        float shelf = 1.0 - smoothstep(12.0, 18.0, s);
        // sand ripples parallel to the old coast: 140 m sand waves + 35 m ripples, warped
        float warp = rough * 9.0 + 3.0 * hiNoise(pw / 1200.0);
        float rip = sin(pw.y * 0.045 + warp) * hiLod(fw * 2.5, 140.0);
        float rip2 = sin(pw.y * 0.18 + pw.x * 0.03 + warp * 2.0 + 2.0 * hiNoise(pw / 300.0)) * hiLod(fw * 2.5, 35.0);
        float sandy = shelf * (1.0 - smoothstep(0.55, 0.7, rough));
        // sea-grass meadows, rocky reefs with crevices, sandbars
        float grass = smoothstep(0.57, 0.6, hiFbm(q * 0.9 + 13.0) + 0.06 * fine) * smoothstep(0.6, 2.0, s) * (1.0 - smoothstep(8.0, 12.0, s));
        float rf = hiFbm(q * 1.6 + 9.0), reef = smoothstep(0.6, 0.66, rf) * (1.0 - smoothstep(3.0, 7.0, s));
        float crev = smoothstep(0.5, 0.8, hiNoise(pw / 70.0)) * hiLod(fw, 70.0);
        float bars = smoothstep(0.3, 0.95, sin(s * 2.4 + rough * 6.0)) * (1.0 - smoothstep(3.0, 8.0, s));
        // canyons down the continental slope
        float cn = abs(hiNoise(vec2(q.x * 0.32, q.y * 0.06) + rough * 0.3) - 0.5);
        float canyon = (1.0 - smoothstep(0.0, 0.09, cn)) * smoothstep(12.0, 20.0, s) * (1.0 - smoothstep(45.0, 70.0, s));
        // a few big channels still draining back towards the wave (+z)
        float gn = abs(hiNoise(vec2(q.x * 0.7, q.y * 0.14) + rough * 0.6) - 0.5) * 1000.0 / 1.1;
        chan = hiLine(gn, 130.0, fw) * shelf * smoothstep(0.5, 2.0, s);
        float kd = smoothstep(0.2, 6.0, s);
        hd = bl + ((rip * 1.6 + rip2 * 0.35) * sandy + bars * 4.0 + reef * (18.0 + 14.0 * rf - 8.0 * crev) + grass * 1.5 + (rough - 0.5) * 200.0 * kd
           + (fine - 0.5) * 16.0 * hiLod(fw, 300.0)) * (0.25 + 0.75 * kd) - canyon * 480.0 - chan * 9.0;
        hd = min(hd, -1.5 - 2.0 * smoothstep(0.0, 0.5, s));
        vec3 col = mix(vec3(0.90, 0.81, 0.62), vec3(0.78, 0.68, 0.52), smoothstep(0.5, 8.0, s));
        col = mix(col, vec3(0.60, 0.54, 0.46), smoothstep(13.0, 26.0, s));
        col = mix(col, vec3(0.46, 0.43, 0.40), smoothstep(22.0, 40.0, s));
        col = mix(col, vec3(0.56, 0.53, 0.49), smoothstep(45.0, 90.0, s));
        col *= 0.88 + 0.22 * rough + 0.10 * (fine - 0.5) * hiLod(fw, 150.0);
        col *= 1.0 + (0.05 * rip + 0.05 * rip2) * sandy + 0.06 * bars;
        col = mix(col, vec3(0.30, 0.34, 0.18) * (0.8 + 0.4 * fine), grass * 0.9);
        col = mix(col, mix(vec3(0.62, 0.58, 0.50), vec3(0.32, 0.30, 0.27), crev) * mix(vec3(1.0), vec3(0.8, 0.9, 0.7), smoothstep(0.66, 0.74, rf)), reef);
        col = mix(col, vec3(0.36, 0.34, 0.31), canyon * 0.55);
        pool = smoothstep(0.27, 0.24, hiFbm(q * 1.4 + 1.7)) * shelf;
        return col; }
      float hiClouds(vec2 q, float fw, out float far){
        vec2 uv = (q - uClR.xy) / uClR.z;
        vec2 o = vec2(0.12 / uClR.z, 0.0), uc = clamp(uv, 0.0, 1.0);
        float tex = 0.25 * (texture2D(uCl, uc + o).r + texture2D(uCl, uc - o).r + texture2D(uCl, uc + o.yx).r + texture2D(uCl, uc - o.yx).r);
        float wIn = 1.0 - smoothstep(0.62, 0.95, length(uv - 0.5) * 2.0 + 0.15 * (hiFbm3(q * 0.03) - 0.5));
        float clus = smoothstep(0.38, 0.62, hiFbm(q * 0.025 + 1.0));
        float pc = mix(smoothstep(0.55, 0.68, hiFbm(q * 0.42 + 5.0)), 0.3, smoothstep(300.0, 1500.0, fw)) * clus;
        far = pc * (1.0 - wIn);
        return tex * wIn + far; }
      void main(){
        #include <logdepthbuf_fragment>
        vec2 pw = vP, q = pw * 0.001;
        vec3 rel = vW - cameraPosition; float dist = length(rel); vec3 V = rel / dist;
        float fw = max(length(fwidth(pw)), 0.3);
        float c = hiCoast(q), lev = hiLevel(q);
        vec3 alb; float hd = 0.0, water = 0.0, wdep = 0.0, pool = 0.0, chan = 0.0, sea = 0.0, wet = 0.0;
        float rv = hiRiverD(q);
        if (c > 0.0) {
          float hl; alb = hiLand(pw, q, c, fw, hl); hd = hiLandL(q, c) + hl * hiLod(fw, 40.0);
          // towns
          for (int i = 0; i < 8; i++) {
            vec3 t = uTowns[i];
            float d = length(q - t.xy) / t.z + 0.35 * (hiNoise(pw / 380.0 + float(i) * 7.0) - 0.5);
            float m = 1.0 - smoothstep(0.5, 1.0, d);
            if (m > 0.0) {
              vec2 bf = fract(pw / 85.0) * 85.0; float sd = min(min(bf.x, 85.0 - bf.x), min(bf.y, 85.0 - bf.y));
              vec2 hq = floor(pw / 14.0); float hh = hiHash(hq + 3.3), lh = hiLod(fw, 14.0);
              vec3 roof = hh < 0.42 ? vec3(0.74, 0.40, 0.28) : hh < 0.66 ? vec3(0.57, 0.56, 0.54) : hh < 0.82 ? vec3(0.86, 0.83, 0.78) : vec3(0.40, 0.52, 0.28);
              vec3 tc = mix(vec3(0.64, 0.53, 0.46), roof, lh);
              float stt = hiLine(sd, 10.0, fw);
              tc = mix(tc, vec3(0.70, 0.69, 0.66), stt);
              m *= smoothstep(0.0, 0.25, 1.0 - d) * (d < 0.55 ? 1.0 : (0.45 + 0.55 * step(0.5, hiHash(floor(pw / 85.0)))));
              alb = mix(alb, tc, m); hd += m * (hh < 0.82 ? 8.0 : 0.0) * lh * (1.0 - stt);
            }
          }
          // villages: one in about half of the 3.5 km cells
          { vec2 vc = floor(pw / 3500.0); float vh = hiHash(vc + 41.0);
            vec2 ctr = (vc + 0.3 + 0.4 * vec2(hiHash(vc + 3.0), hiHash(vc + 8.0))) * 3500.0;
            float vr = 220.0 + 330.0 * hiHash(vc + 12.0), vd = length(pw - ctr) / vr + 0.3 * (hiNoise(pw / 160.0) - 0.5);
            float vm = step(0.5, vh) * (1.0 - smoothstep(0.6, 1.0, vd)) * smoothstep(0.3, 1.0, c);
            if (vm > 0.0) {
              vec2 hq = floor(pw / 13.0); float hh = hiHash(hq + 7.7), lh = hiLod(fw, 13.0);
              float house = step(0.35, hh) * (1.0 - smoothstep(0.3, 0.42, max(abs(fract(pw.x / 13.0) - 0.5), abs(fract(pw.y / 13.0) - 0.5))));
              vec3 roof = hh < 0.6 ? vec3(0.72, 0.38, 0.26) : hh < 0.82 ? vec3(0.55, 0.54, 0.52) : vec3(0.85, 0.82, 0.76);
              vec3 vcol = mix(vec3(0.50, 0.55, 0.38), mix(vec3(0.38, 0.50, 0.28), roof, house), lh);
              alb = mix(alb, vcol, vm); hd += vm * house * 7.0 * lh;
            } }
          alb = mix(alb, vec3(0.90, 0.84, 0.68), (1.0 - smoothstep(0.06, 0.16, c + 0.04 * hiNoise(pw / 200.0))) * step(-0.5, -hiLandL(q, c) + 40.0));   // beaches
          // roads
          alb = mix(alb, vec3(0.62, 0.62, 0.60), hiLine(hiRoadD(q), 16.0, fw) * 0.9);
          // rivers (with a band of riverside trees) and lakes
          float wR = 55.0 + 60.0 * smoothstep(0.0, -16.0, q.y);
          alb = mix(alb, vec3(0.24, 0.37, 0.18), hiLine(rv, wR + 90.0, fw) * 0.7);
          float rw = hiLine(rv, wR, fw);
          float lake = smoothstep(0.735, 0.745, hiFbm(q * 0.55 + 21.0)) * smoothstep(1.0, 2.0, c);
          if (rw + lake > 0.5) { water = 1.0; wdep = 4.0; }
          else alb = mix(alb, vec3(0.20, 0.36, 0.44), clamp(rw + lake, 0.0, 1.0));
        } else {
          float s = -c; sea = 1.0;
          alb = hiSea(pw, q, s, fw, hd, pool, chan);
          float rch = hiLine(rv, 60.0 + 25.0 * s, fw) * (1.0 - smoothstep(10.0, 22.0, s));   // the rivers keep running across the exposed shelf
          hd -= rch * 8.0;
          if (hd < lev) { water = 1.0; wdep = lev - hd; }
          else {
            float up = hd - lev;                    // metres above the falling water
            wet = max(1.0 - smoothstep(0.0, 160.0, up), 0.45 * (1.0 - smoothstep(218.0, 262.0, uT)));
            float sw = max(max(chan, rch), pool) * smoothstep(0.0, 6.0, up + 3.0);
            if (sw > 0.55) { water = 1.0; wdep = 1.2; }
          }
        }
        float hN = water > 0.5 ? (sea > 0.5 ? lev : hd) : hd;
        vec3 P = vec3(pw.x, hN * 1.6, pw.y);
        vec3 N = normalize(cross(dFdy(P), dFdx(P))); if (N.y < 0.0) N = -N;
        float far; float csh = hiClouds(q + uSunD.xz / uSunD.y * 1.3, fw, far);
        float farHere; float clHere = hiClouds(q, fw, farHere);
        float shade = 1.0 - 0.8 * csh;
        vec3 sunC = vec3(1.0, 0.90, 0.76) * 2.3, amb = vec3(0.50, 0.58, 0.72) * uAmb;
        vec3 a = pow(alb, vec3(2.2));
        a *= 1.0 - 0.38 * wet;
        float dif = max(dot(N, uSunD), 0.0);
        vec3 col = a * (amb * (0.55 + 0.45 * N.y) * (1.0 - 0.25 * csh) + sunC * dif * shade);
        // wet seabed shine
        vec3 Hh = normalize(uSunD - V);
        col += vec3(1.0, 0.9, 0.75) * pow(max(dot(N, Hh), 0.0), 60.0) * wet * 0.6 * shade;
        if (sea > 0.5 && water < 0.5) {   // wet sand mirrors the sky
          vec3 Nm = normalize(mix(N, vec3(0.0, 1.0, 0.0), 0.6)), Rw = reflect(V, Nm); Rw.y = abs(Rw.y) + 0.03;
          float frw = 0.04 + 0.96 * pow(1.0 - max(dot(-V, Nm), 0.0), 5.0);
          col = mix(col, hiSky(Rw) * 0.85, clamp(wet * (0.18 + 0.9 * frw), 0.0, 0.8));
        }
        if (water > 0.5) {
          float lw = hiLod(fw, 70.0);
          vec2 gg = vec2(sin(pw.x * 0.021 + uT * 0.7) + 0.6 * sin(pw.x * 0.047 - pw.y * 0.033 + uT * 1.1), sin(pw.y * 0.019 - uT * 0.6) + 0.6 * sin(pw.y * 0.051 + pw.x * 0.029 - uT * 0.9)) * 0.045 * lw;
          vec3 Nw = normalize(vec3(gg.x, 1.0, gg.y)), R = reflect(V, Nw); R.y = abs(R.y) + 0.02;
          float fr = 0.03 + 0.97 * pow(1.0 - max(dot(-V, Nw), 0.0), 5.0);
          vec3 body = mix(vec3(0.10, 0.36, 0.38), vec3(0.008, 0.045, 0.10), smoothstep(1.0, 40.0, wdep));
          body = mix(col * vec3(0.42, 0.62, 0.68), body, smoothstep(0.0, 8.0, wdep));
          body *= mix(1.0, amb.b * 0.6 + sunC.r * 0.25 * shade, smoothstep(0.0, 8.0, wdep));
          vec3 wc = mix(body, hiSky(R), clamp(fr * mix(0.25, 0.5, smoothstep(2.0, 10.0, wdep)), 0.0, 1.0));
          wc += vec3(1.0, 0.9, 0.75) * pow(max(dot(R, uSunD), 0.0), 400.0) * 4.0 * shade;
          // the receding edge: foam lines and streaks pulled towards the wave
          float surf = smoothstep(0.55, 1.0, sin(wdep * 0.9 - uT * 3.0 + 3.0 * hiNoise(pw / 400.0))) * exp(-wdep / 18.0) * hiLod(fw, 25.0);
          float fl = (exp(-wdep / 3.0) * (0.75 + 0.25 * hiNoise(vec2(pw.x / 45.0, pw.y / 220.0 - uT * 0.6))) + 0.6 * surf) * sea * (0.4 + 0.6 * hiLod(fw, 60.0));
          float strk = smoothstep(0.6, 0.82, hiNoise(vec2(pw.x / 80.0, pw.y / 900.0 - uT * 0.1))) * (1.0 - smoothstep(0.0, 600.0, wdep)) * uDrain * sea * hiLod(fw, 90.0);
          wc = mix(wc, vec3(0.85, 0.88, 0.88) * (0.6 + 0.5 * shade), clamp(fl + strk * 0.12, 0.0, 1.0));
          col = wc;
        }
        // the wave's toe: dark water sucked up the face, foam streaks
        float fe = hiFloodE(pw), zr = vW.z / uH;
        float flood = smoothstep(fe - 0.012, fe + 0.008, zr + 0.01 * (hiNoise(pw / 90.0) - 0.5) * hiLod(fw, 90.0));
        if (flood > 0.0) {
          float fz = zr - fe;                                                          // 0 at the flood front, grows towards the wave
          float mrb = smoothstep(0.52, 0.72, hiFbm3(vec2(pw.x / 260.0, pw.y / 420.0 - uT * 0.25))) * hiLod(fw, 120.0) + 0.06 * (1.0 - hiLod(fw, 120.0));
          float edgeF = exp(-max(fz, 0.0) * 45.0) * (0.55 + 0.45 * hiNoise(pw / 60.0)) * (0.5 + 0.5 * hiLod(fw, 60.0));
          vec3 deepC = mix(vec3(0.012, 0.055, 0.075), vec3(0.020, 0.100, 0.120), smoothstep(0.0, 0.3, fz));
          float fd = max(dot(normalize(vec3(0.0, 1.0, 0.25)), uSunD), 0.0);
          vec3 fc = deepC * (0.8 + fd) + hiSky(reflect(V, vec3(0.0, 1.0, 0.0))) * 0.04;
          fc = mix(fc, vec3(0.62, 0.70, 0.72), clamp(mrb * 0.3 * smoothstep(0.0, 0.1, fz) + edgeF, 0.0, 1.0));
          col = mix(col, fc, flood);
        }
        // the cloud field seen from far away (outside the 3D puffs)
        vec3 cloudC = vec3(1.0, 0.98, 0.95) * (amb * 0.8 + sunC * 0.45);
        col = mix(col, cloudC, farHere * 0.92 * (1.0 - flood));
        // aerial perspective
        col = hiAtmo(col, V, dist);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` }));
  terrain.frustumCulled = false; scene.add(terrain);

  // --- world-fixed things (clouds, mountains, boats) live in one group moved by travel(st)
  const world = new THREE.Group(); scene.add(world);
  const objMat = (kind, extra = {}) => new THREE.ShaderMaterial({ uniforms: { ...U, uKind: { value: kind }, uAlpha: { value: 1 } }, ...extra,
    vertexShader: `#include <common>
      #include <logdepthbuf_pars_vertex>
      uniform float uKind; ${CURVE_GLSL} ${hiGLN} ${hiGLW}
      varying vec3 vW; varying vec3 vC; varying vec3 vN; varying vec2 vP; varying float vY, vFl;
      void main(){
        vec4 lp = vec4(position, 1.0);
        #ifdef USE_INSTANCING
        lp = instanceMatrix * lp;
        #endif
        vec4 w = modelMatrix * lp; vY = w.y; vP = vec2(w.x, w.z - uTrav); vN = normalize(mat3(modelMatrix) * normal);
        vFl = 0.0;
        vFl = w.z;   // camera-relative z, for the drawdown test in the fragment
        if (uKind > 1.5) { float e = -1.42 + 0.34 * (hiFbm3(vP / (0.45 * uH) + 3.0) - 0.5); w.y = mix(w.y, -150.0, smoothstep(e - 0.3, e, w.z / uH)); }   // the range settles into the drawdown before it is swallowed
        w.xyz = curveDrop(w.xyz); vW = w.xyz;
        vC = vec3(1.0);
        #ifdef USE_COLOR
        vC *= color;
        #endif
        #ifdef USE_INSTANCING_COLOR
        vC *= instanceColor;
        #endif
        gl_Position = projectionMatrix * viewMatrix * w;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `#include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uKind, uAlpha; ${hiGLN} ${hiGLW} ${hiGLA}
      varying vec3 vW; varying vec3 vC; varying vec3 vN; varying vec2 vP; varying float vY, vFl;
      void main(){
        #include <logdepthbuf_fragment>
        float fl = uKind > 1.5 ? hiFlood(vP, vFl) : 0.0;
        if (fl > 0.5) discard;   // the range is swallowed by the wave's drawdown
        vec3 rel = vW - cameraPosition; float dist = length(rel); vec3 V = rel / dist;
        vec3 N = normalize(cross(dFdx(vW), dFdy(vW))); if (dot(N, V) > 0.0) N = -N;
        vec3 alb = vC;
        if (uKind > 1.5) {
          // the range: smooth normals, rock texture, gullies, snow by height + slope
          float fw = length(fwidth(vP)), b1 = hiFbm3(vP / 420.0), b2 = hiNoise(vP / 110.0) * hiLod(fw, 110.0) + 0.5 * (1.0 - hiLod(fw, 110.0));
          N = normalize(vN + vec3(b1 - 0.5, 0.0, hiFbm3(vP / 420.0 + 9.0) - 0.5) * 0.7 + vec3(b2 - 0.5, 0.0, 0.0) * 0.25);
          float gul = smoothstep(0.55, 0.75, hiNoise(vec2(vP.x / 160.0, vP.y / 900.0) + b1 * 2.0)) * hiLod(fw, 160.0);
          alb *= 0.85 + 0.3 * b1 - 0.18 * gul;
          float line = 1500.0 + 420.0 * (b1 - 0.5) * 2.0 + 120.0 * (b2 - 0.5);
          float sn = smoothstep(line - 90.0, line + 90.0, vY) * smoothstep(0.42, 0.62, N.y + 0.15 * (b2 - 0.5)) + smoothstep(2700.0, 3100.0, vY) * 0.7;
          alb = mix(alb, vec3(0.93, 0.95, 0.98) * (0.94 + 0.06 * b2), clamp(sn, 0.0, 1.0));
        }
        float dif = dot(N, uSunD);
        vec3 amb = vec3(0.50, 0.58, 0.72) * (0.55 + 0.45 * N.y) * uAmb;
        vec3 col = alb * (amb + vec3(1.0, 0.9, 0.76) * 2.3 * max(dif, 0.0));
        col = mix(col, vec3(0.8, 0.85, 0.86), smoothstep(0.1, 0.5, fl));
        col = hiAtmo(col, V, dist);
        gl_FragColor = vec4(col, uAlpha);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` });
  const clouds = hiBuildClouds(cloudList, U); scene.add(clouds.mesh);
  const mount = new THREE.Mesh(hiMountGeo(), objMat(2, { vertexColors: true })); mount.frustumCulled = false; world.add(mount);
  const boats = hiBoatList(), hullM = new THREE.InstancedMesh(hiHullGeo(), objMat(0), boats.length), cabM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.09, 0.12), objMat(0), boats.length);
  boats.forEach((b, i) => { hullM.setColorAt(i, b.col); cabM.setColorAt(i, b.wreck ? lin('#4a3424') : lin('#eeeae2')); });
  hullM.frustumCulled = cabM.frustumCulled = false; world.add(hullM, cabM);
  // long soft shadows of the stranded hulls (the sun is only ~11.6 deg up)
  const shGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const shM = new THREE.InstancedMesh(shGeo, new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4,
    vertexShader: `#include <common>
      #include <logdepthbuf_pars_vertex>
      ${CURVE_GLSL}
      varying vec2 vUv;
      void main(){ vUv = uv; vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0); w.xyz = curveDrop(w.xyz);
        gl_Position = projectionMatrix * viewMatrix * w;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `#include <common>
      #include <logdepthbuf_pars_fragment>
      varying vec2 vUv;
      void main(){
        #include <logdepthbuf_fragment>
        vec2 d = abs(vUv - 0.5) * 2.0; float a = (1.0 - smoothstep(0.55, 1.0, d.x)) * (1.0 - smoothstep(0.35, 1.0, d.y)) * mix(1.0, 0.55, vUv.y);
        gl_FragColor = vec4(0.05, 0.06, 0.09, a * 0.55);
      }` }), boats.length);
  shM.frustumCulled = false; shM.renderOrder = 1; world.add(shM);
  boats.forEach((b) => { b.bed = hiBedLJ(b.x, b.z, -hiCoastJ(b.x, b.z)); });
  const shDir = new THREE.Vector3(-SUN.x, 0, -SUN.z).normalize(), shLen = 0.22 / Math.tan(Math.asin(SUN.y));

  // --- lights for the standard-material jet
  const sun = new THREE.DirectionalLight(0xfff0dc, 2.4); sun.position.copy(SUN).multiplyScalar(1000); const hemi = new THREE.HemisphereLight(0xcfe0f6, 0x7a8a6a, 1.0);
  scene.add(sun, sun.target, hemi);
  const jet = hiJet(); jet.visible = false; scene.add(jet);

  // --- passing cloud wisps (the exit from the deck) and the steam / ice sprites, camera-relative
  const wispTex = hiTexPuff('hi-wisp', 30, 0.32), wisps = [];
  { const R = RNG('hi-wisps'); for (let i = 0; i < 26; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: wispTex, transparent: true, depthWrite: false, opacity: 0, color: lin('#f6f8fb') }));
    s.userData = { x: R.r(-900, 1400), y: R.r(-500, 180), z: R.r(-2600, -250), s: R.r(500, 1300), ph: R.f() }; s.renderOrder = 3; scene.add(s); wisps.push(s); } }
  const steamTex = hiTexPuff('hi-steam', 34, 0.22), steam = [];
  { const R = RNG('hi-steam'); for (let i = 0; i < 90; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0, color: lin('#eef2f6') }));
    s.userData = { u: R.r(0.05, 1.1), v: R.r(-0.3, 0.4), ph: R.f(), sp: R.r(0.04, 0.09), s: R.r(0.035, 0.1) }; s.renderOrder = 3; scene.add(s); steam.push(s); } }
  const NI = 520, iceP = new Float32Array(NI * 3), iceC = new Float32Array(NI * 3), iceSeed = [];
  { const R = RNG('hi-ice'); for (let i = 0; i < NI; i++) iceSeed.push([R.r(-1, 1), R.r(-1, 1), R.r(0, 1), R.r(0, TAU), R.r(0.5, 2.2), R.f()]); }
  const ice = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(iceP, 3)).setAttribute('color', new THREE.BufferAttribute(iceC, 3)),
    new THREE.PointsMaterial({ map: hiTexSpark(), size: 0.09, sizeAttenuation: true, transparent: true, depthWrite: false, vertexColors: true, blending: THREE.AdditiveBlending, toneMapped: false }));
  ice.frustumCulled = false; ice.renderOrder = 4; scene.add(ice);

  return { scene, U, sky, terrain, world, clouds, mount, boats, hullM, cabM, shM, shDir, shLen, jet, sun, hemi, wisps, steam, ice, iceSeed, NI };
}

// ---- per frame
const hiM4 = new THREE.Matrix4(), hiM4b = new THREE.Matrix4(), hiQ = new THREE.Quaternion(), hiE = new THREE.Euler(), hiV = new THREE.Vector3(), hiS = new THREE.Vector3();
function stageHigh(g, st) {
  if (!hiG) hiG = hiBuild(g);
  const S = hiG, U = S.U, hH = waveH(st), eye = eyeY(st), trav = travel(st);
  applyCam(g, st, Math.max(4, eye * 0.0015), 2.2e7);
  updateWave(g, st); if (g.wave.mesh.parent !== S.scene) S.scene.add(g.wave.mesh);
  // --- the atmosphere thins: 0 at 10 km, 1 at 150 km
  const space = ss(0, 1, Math.log(eye / 10000) / Math.log(15)), dip = Math.acos(R_EARTH / (R_EARTH + eye));
  U.uTrav.value = trav; U.uH.value = hH; U.uCamH.value = eye; U.uSpace.value = space; U.uDip.value = dip;
  U.uLev.value = hiLevAt(st); U.uDrR.value = knots(hiDRR, st); U.uDrain.value = ss(195, 198, st) * (1 - ss(214, 222, st));
  U.uStar.value = ss(254, 266, st); U.uAmb.value = 1 - 0.45 * space;
  U.uZen.value.set('#3a6cc0').lerp(lin('#0b1f4a'), ss(0, 0.45, space)).lerp(lin('#000000'), ss(0.35, 0.9, space));
  U.uHzB.value.set('#c3d2e4').lerp(lin('#9cbfe9'), space); U.uHzW.value.set('#f1dcc2').lerp(lin('#c7d8ee'), space);
  CURVE_R.value = R_EARTH;
  // the wave sees the same air
  FOGD.value = U.uBeta.value * 1800 * (1 - Math.exp(-eye / 1800)) / eye + 8000 * (1 - Math.exp(-eye / 8000)) / eye / 200000;
  FOGC.value.copy(U.uHzB.value).lerp(U.uHzS.value, space);
  SKYC.value.copy(U.uZen.value).lerp(U.uHzB.value, 0.45 * (1 - space));
  g.wave.U.uBoil.value = ss(233, 246, st); g.wave.U.uIce.value = ss(278, 290, st);
  // --- world-fixed things
  S.world.position.set(0, 0, trav);
  hiSortClouds(S.clouds, trav, eye);
  const lev = U.uLev.value;
  S.boats.forEach((b, i) => {
    const gone = b.z * 1000 + trav > -1.62 * hH;                       // swallowed by the wave's toe
    const L = b.L * (b.big ? 2.6 : b.wreck ? 2.6 : 4.5), lw = hiLevelJ(b.x, b.z, st);
    const y = (b.wreck ? b.bed : Math.max(b.bed, lw)) - (b.wreck ? b.sink * L * 0.09 : 0);
    const tilt = b.tilt * (b.wreck ? 1 : ss(0, 4, lw > b.bed ? 0 : 4));   // a hull lies on its side once the water has gone
    hiQ.setFromEuler(hiE.set(tilt * 0.6, b.hd, tilt, 'YXZ'));
    hiM4.compose(hiV.set(b.x * 1000, y, b.z * 1000), hiQ, gone ? hiS.set(0, 0, 0) : hiS.set(L, L, L)); S.hullM.setMatrixAt(i, hiM4);
    if (b.cab && !gone) hiM4.multiply(hiM4b.makeTranslation(-0.18, 0.12, 0)); else hiM4.makeScale(0, 0, 0);
    S.cabM.setMatrixAt(i, hiM4);
    // shadow: a parallelogram spanned by the hull's axis and (beam + sun offset), lying on the floor
    const dry = b.wreck || lw <= b.bed + 1;
    if (gone || !dry) hiM4.makeScale(0, 0, 0);
    else { const ax = hiV.set(Math.cos(b.hd), 0, -Math.sin(b.hd)).multiplyScalar(L), sh = S.shDir.clone().multiplyScalar(L * S.shLen * (b.wreck ? 0.5 : 1));
      const side = new THREE.Vector3(Math.sin(b.hd), 0, Math.cos(b.hd)).multiplyScalar(L * 0.2), a2 = side.add(sh);
      hiM4.makeBasis(ax.clone(), new THREE.Vector3(0, 1, 0), a2).setPosition(b.x * 1000 + sh.x * 0.5, y + 2, b.z * 1000 + sh.z * 0.5); }
    S.shM.setMatrixAt(i, hiM4);
  });
  S.hullM.instanceMatrix.needsUpdate = true; S.cabM.instanceMatrix.needsUpdate = true; S.shM.instanceMatrix.needsUpdate = true;
  // --- sky dome follows the eye
  S.sky.position.copy(g.cam.position);
  // --- the airliner: crosses in front of the face, under the lip, 217.5..226.5
  const ja = ss(218.5, 219.3, st) * (1 - ss(227.6, 228.4, st));
  S.jet.visible = ja > 0;
  if (S.jet.visible) {
    const u = st - 223.5, yJ = eyeY(223.5) - 1000;
    S.jet.position.set(1300 + 300 * u, yJ - 6 * u, -2300 + 30 * u);
    S.jet.rotation.set(0, Math.atan2(-40, 330), 0.02);
  }
  // --- wisps of the cloud deck streaming past as we climb out
  const wa = 1 - ss(187.5, 191, st);
  S.wisps.forEach((s) => { const d = s.userData, rise = (st - 185) * 260; s.visible = wa > 0;
    if (!s.visible) return; s.position.set(d.x, eye - 300 + d.y - rise * (0.6 + d.ph) + 400, d.z + (st - 185) * 120 * d.ph); s.scale.set(d.s * 1.6, d.s, 1); s.material.opacity = 0.75 * wa; });
  // --- steam: vapour lifts off the face below and drifts up towards the crest (camera-relative, in H units)
  const sa = ss(234, 244, st) * (1 - 0.5 * ss(276, 288, st));
  S.steam.forEach((s) => { const d = s.userData, ph = (st * d.sp + d.ph) % 1; s.visible = sa > 0.01;
    if (!s.visible) return;
    const zf = -0.95 + 0.75 * d.u / 1.1 + 0.35 * ph, x = hH * (0.15 + d.u * 2.2 + d.v), y = (waveProfile(zf)[1] + 0.03 + 0.12 * ph) * hH;
    s.position.set(x, y, (zf + 0.1) * hH); const k = hH * d.s * (0.5 + 0.9 * ph); s.scale.set(k * 1.6, k, 1); s.material.opacity = sa * 0.55 * Math.sin(ph * Math.PI); });
  // --- ice crystals glittering round the board (camera space -> world)
  const ia = ss(278, 284, st);
  S.ice.visible = ia > 0;
  if (ia > 0) {
    const P = S.ice.geometry.attributes.position, C = S.ice.geometry.attributes.color, m = g.cam.matrixWorld;
    for (let i = 0; i < S.NI; i++) { const [a, b, c, ph, sp, tw] = S.iceSeed[i], zf = (c + st * 0.18 * sp) % 1;
      hiV.set(a * 7 + Math.sin(st * 0.7 + ph) * 0.6, b * 4 + 0.5 - zf * 1.5, -2 - (1 - zf) * 16).applyMatrix4(m); P.setXYZ(i, hiV.x, hiV.y, hiV.z);
      const fl = ia * (0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(st * (6 + 9 * tw) + ph * 3), 6)) * Math.sin(zf * Math.PI); C.setXYZ(i, fl * 0.9, fl * 0.95, fl); }
    P.needsUpdate = true; C.needsUpdate = true;
  }
  g.r.render(S.scene, g.cam);
  // --- light for the rider
  const skyL = lin('#cfe3ff').lerp(lin('#5a6f96'), space), grL = lin('#6d7a5a').lerp(lin('#4a5a70'), ss(197, 210, st) * 0.5);
  return {
    sky: skyL, ground: grL, key: 2.2 + 0.4 * space, hemi: 0.9 - 0.45 * space, spray: 0.9 - 0.4 * ss(250, 285, st), flare: 0.75 + 0.25 * space, bloom: 0.26,
    post: (t) => {
      const a = 1 - ss(185.15, 189, t); if (a <= 0) return;
      ctx.save(); screen();
      const gr = ctx.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, `rgba(242,245,249,${clamp(a * 1.7 - 0.7)})`); gr.addColorStop(0.55, `rgba(240,243,247,${clamp(a * 1.35 - 0.3)})`); gr.addColorStop(1, `rgba(236,240,245,${clamp(a * 1.15)})`);
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      const R = RNG('hi-white');
      for (let i = 0; i < 9; i++) { const x = R.r(0, W), y = R.r(0, H) + (t - 185) * R.r(120, 260), r = R.r(250, 600), al = a * R.r(0.25, 0.5);
        const g2 = ctx.createRadialGradient(x, y, 0, x, y, r); g2.addColorStop(0, `rgba(255,255,255,${al})`); g2.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g2; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
      ctx.restore();
    },
  };
}
