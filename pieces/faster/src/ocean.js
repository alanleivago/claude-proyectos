// =====================================================================
//  OCEAN — the sea under the pier and its retreat south (the ocean agent owns this file).
//  SEA(t): sea level y (0 → far below); SEAEDGE(t): the water's north edge (z), from the shoreline (z ≈ -3) to far
//  past the horizon. BED(z): the analytic seabed floor (the real bed adds non-negative bumps on top of it, so the
//  water, which sits at BED(SEAEDGE), never surfaces north of its edge). Everything is a pure function of t.
// =====================================================================
const OC_E0 = -3, OC_E1 = -14000;
const BED = (z) => (z >= 0 ? 0.3 : 0.3 - 1.4 * (1 - Math.exp(z / 14)) - 4.5 * (1 - Math.exp(z / 350)) + 0.0035 * z);
const SEAEDGE = (t) => (t <= 17 ? OC_E0 : Math.max(OC_E1, OC_E0 - 60 * (Math.exp(0.321 * (Math.min(t, 34) - 17)) - 1)));
const SEA = (t) => Math.min(0, BED(SEAEDGE(t)));
// bumps on the bed (>= 0): sand bars, hollows, long dunes; zero at the shoreline so the bed meets the beach
function ocBedN(x, z) { if (z >= 0) return 0; const a = 0.45 * clamp(-z / 60) + 1.2 * clamp(-z / 4000);
  const n = 0.55 * Math.sin(x * 0.013 + z * 0.021 + 1) * Math.sin(z * 0.017 - x * 0.006 + 1.3) + 0.3 * Math.sin(x * 0.05 + 1) * Math.sin(z * 0.043 + 2) + 0.15 * Math.sin(x * 0.11 + z * 0.07);
  return a * (0.5 + 0.5 * n) + 0.25 * clamp(-z / 40) * clamp(1 + z / 600) * (0.5 + 0.5 * Math.sin(z * 0.05 + Math.sin(x * 0.01) * 2)); }
const ocBedY = (x, z) => (z > 0 ? 0.3 : BED(z) + ocBedN(x, z));
// a grid axis: dense around c, spacing grows geometrically toward a and b
function ocAxis(c, a, b, d0, g) { const o = [c]; let v = c; while (v > a) { v -= d0 + g * (c - v); o.unshift(Math.max(a, v)); } v = c; while (v < b) { v += d0 + g * (v - c); o.push(Math.min(b, v)); } return o; }
function ocGrid(xs, zs, fy) { const nx = xs.length, nz = zs.length, P = new Float32Array(nx * nz * 3), I = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const k = (j * nx + i) * 3; P[k] = xs[i]; P[k + 1] = fy(xs[i], zs[j]); P[k + 2] = zs[j]; }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; I.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); return g; }
// shared GLSL: hash noise and the analytic bed
const OC_GLSL = `
uniform float uSea, uEdge, uT, uDry, uWetW;
varying vec3 vOcW;
float ocH(vec2 p){ p = mod(p, 512.0); return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float ocN(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f); return mix(mix(ocH(i), ocH(i + vec2(1.0, 0.0)), u.x), mix(ocH(i + vec2(0.0, 1.0)), ocH(i + vec2(1.0, 1.0)), u.x), u.y); }
float ocF(vec2 p){ float a = 0.0, m = 0.5; for (int k = 0; k < 4; k++) { a += m * ocN(p); p = p * 2.03 + vec2(17.1, 9.3); m *= 0.5; } return a; }
float ocBed(float z){ return z >= 0.0 ? 0.3 : 0.3 - 1.4 * (1.0 - exp(z / 14.0)) - 4.5 * (1.0 - exp(z / 350.0)) + 0.0035 * z; }
vec3 ocLin(vec3 c){ return pow(c, vec3(2.2)); }
`;
function ocShader(m, U, vtx, frag, key) { m.customProgramCacheKey = () => key; m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
  sh.vertexShader = OC_GLSL + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + (vtx || '')).replace('#include <project_vertex>', '{ vec4 w4 = modelMatrix * vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\n w4 = modelMatrix * instanceMatrix * vec4(transformed, 1.0);\n#endif\n vOcW = w4.xyz; }\n#include <project_vertex>');
  sh.fragmentShader = OC_GLSL + frag(sh.fragmentShader); }; return m; }

function buildOcean(st, S) { const O = { st }, R = RNG('ocean'), sc = st.scene;
  const U = O.U = { uSea: { value: 0 }, uEdge: { value: OC_E0 }, uT: { value: 0 }, uDry: { value: 0 }, uWetW: { value: 30 } };
  // ---- the seabed: one graded grid from under the beach to 30 km south, ±12 km wide
  const bedGeo = ocGrid(ocAxis(0, -12000, 12000, 1.5, 0.035), ocAxis(-80, -30000, 3, 1.5, 0.035), (x, z) => (z > 0 ? 0.28 : ocBedY(x, z)));
  const bedM = ocShader(STDm({ color: '#ffffff', roughness: 1 }), U, '', (f) => f.replace('#include <color_fragment>', `#include <color_fragment>
    vec2 bp = vOcW.xz; float bd = length(vOcW - cameraPosition), near = 1.0 - smoothstep(25.0, 140.0, bd), mid = 1.0 - smoothstep(200.0, 1500.0, bd);
    float n1 = ocF(bp * 0.012), n2 = ocF(bp * 0.09), n3 = ocN(mat2(0.8, -0.6, 0.6, 0.8) * bp * 2.7), n4 = ocF(bp * 0.0025);
    vec3 dry = mix(vec3(0.62, 0.51, 0.36), vec3(0.72, 0.61, 0.44), n1); dry = mix(dry, vec3(0.56, 0.47, 0.35), smoothstep(0.55, 0.8, n4) * 0.6);
    dry *= 0.86 + 0.24 * mix(0.5, n2, mid); dry *= 1.0 + near * (0.18 * step(0.86, n3) - 0.22 * step(n3, 0.07));
    float dn = vOcW.z - uEdge, under = uSea - vOcW.y;
    float wet = 1.0 - smoothstep(0.0, uWetW, dn); wet = max(wet, smoothstep(0.58, 0.74, ocF(bp * 0.02 + 3.0)) * (0.75 - 0.55 * uDry));
    wet = max(wet, step(0.0, under)); wet = clamp(wet + 0.25 * (n2 - 0.5) * (1.0 - step(0.0, under)), 0.0, 1.0);
    vec3 wc = dry * vec3(0.66, 0.63, 0.62);
    float rp = vOcW.x * 1.3 + vOcW.z * 2.6 + 6.0 * ocF(bp * 0.08), rip = sin(rp) * near;
    vec3 bc = mix(dry, wc, wet) * (1.0 + 0.04 * rip * near);
    if (under > 0.0) { float c1 = ocN(bp * 0.45 + vec2(uT * 0.35, uT * 0.2)), c2 = ocN(bp * 0.45 - vec2(uT * 0.25, -uT * 0.3) + 7.0); float ca = pow(1.0 - abs(c1 - c2), 8.0); bc += vec3(0.45, 0.5, 0.42) * ca * (1.0 - smoothstep(0.3, 3.0, under)) * near; bc *= mix(1.0, 0.8, smoothstep(0.0, 4.0, under)); }
    diffuseColor.rgb = ocLin(bc);
    float ocRough = mix(1.0, 0.32, wet * (1.0 - smoothstep(0.0, uWetW * 0.6, dn) * 0.4));
    vec3 ocNv = vec3(1.3, 0.0, 2.6) * cos(rp) * 0.012 * near * near;`).replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = ocRough;')
    .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n normal = normalize(normal - (viewMatrix * vec4(ocNv, 0.0)).xyz);'));
  const bed = mesh(bedGeo, bedM, 0, 0, 0, { cast: false }); bed.frustumCulled = false; sc.add(bed); O.bed = bed;

  // ---- the water: graded grid at y = 0, raised to SEA(t); swell in the vertex, wave normals + foam in the fragment
  const WAV = `
  float ocWav(vec2 p, float t, out vec2 g, float hf){ float h = 0.0; g = vec2(0.0);
    vec4 W[9]; W[0] = vec4(0.10, 1.0, 22.0, 0.17); W[1] = vec4(-0.32, 1.0, 13.0, 0.09); W[2] = vec4(0.42, 1.0, 8.0, 0.05); W[3] = vec4(-0.65, 0.8, 5.0, 0.03); W[4] = vec4(0.8, 0.6, 3.1, 0.016);
    W[5] = vec4(-0.2, 1.0, 1.9, 0.009); W[6] = vec4(0.95, 0.3, 1.3, 0.006); W[7] = vec4(-0.7, -0.7, 0.8, 0.004); W[8] = vec4(0.3, -0.95, 0.55, 0.0025);
    for (int i = 0; i < 9; i++) { vec2 d = normalize(W[i].xy); float k = 6.2832 / W[i].z, w = sqrt(9.8 * k), a = W[i].w * (i > 4 ? hf : 1.0), ph = k * dot(d, p) - w * t + float(i) * 1.7;
      h += a * sin(ph); g += a * k * d * cos(ph); } return h; }
`;
  const watM = ocShader(STDm({ color: '#ffffff', roughness: 0.06, metalness: 0.0, transparent: true, envMapIntensity: 0.45 }), U,
    `{ vec2 wp = (modelMatrix * vec4(transformed, 1.0)).xz; float dep = uSea - ocBed(wp.y); vec2 gg; transformed.y += ocWavV(wp, uT, gg, 0.0) * smoothstep(0.0, 2.0, dep); }`,
    (f) => WAV + f.replace('#include <color_fragment>', `#include <color_fragment>
    vec2 wp = vOcW.xz; if (wp.y > uEdge + 3.0) discard;
    float wd = length(vOcW - cameraPosition), wf = 1.0 - smoothstep(60.0, 700.0, wd), dep = uSea - ocBed(wp.y);
    vec2 g; ocWav(wp, uT, g, wf); g *= mix(1.0, 0.35, smoothstep(300.0, 3000.0, wd));
    float e = 0.35, f0 = ocF(wp * 1.3 + uT * vec2(0.3, 0.5)), fx = ocF((wp + vec2(e, 0.0)) * 1.3 + uT * vec2(0.3, 0.5)), fz = ocF((wp + vec2(0.0, e)) * 1.3 + uT * vec2(0.3, 0.5));
    g += vec2(fx - f0, fz - f0) / e * 0.05 * (1.0 - smoothstep(10.0, 90.0, wd));
    vec3 ocWN = normalize(vec3(-g.x, 1.0, -g.y));
    vec3 sh = vec3(0.42, 0.84, 0.76), md = vec3(0.10, 0.68, 0.72), dp = vec3(0.04, 0.40, 0.56);
    vec3 wc = mix(sh, md, smoothstep(0.0, 3.5, dep)); wc = mix(wc, dp, smoothstep(4.0, 30.0, dep)); wc *= 0.92 + 0.12 * ocF(wp * 0.02 + uT * 0.02);
    float al = mix(0.4, 0.97, smoothstep(0.0, 4.0, dep));
    float rush = smoothstep(17.0, 18.5, uT), sw = 0.12 * sin(uT * 0.9 + wp.x * 0.02);
    float lace = ocF(wp * vec2(0.9, 1.4) + vec2(0.0, -uT * 0.6)), lace2 = ocF(wp * 0.35 + vec2(uT * 0.1, uT * 0.4));
    float fShore = (1.0 - smoothstep(0.0, 0.7 + 0.5 * rush, dep + sw)) * smoothstep(0.25, 0.5, lace);
    float band = smoothstep(0.7, 0.95, sin(wp.y * 0.33 - uT * 1.9 + 4.0 * lace2)) * (1.0 - smoothstep(0.8, 2.6, dep)) * smoothstep(0.3, 0.55, lace);
    float caps = smoothstep(0.72, 0.8, ocF(wp * 0.25 + vec2(uT * 0.15, -uT * 0.2))) * smoothstep(0.5, 0.7, lace) * 0.55 * smoothstep(3.0, 8.0, dep) * (1.0 - smoothstep(150.0, 600.0, wd));
    float streak = rush * smoothstep(0.6, 0.85, ocF(wp * vec2(0.6, 0.06) + vec2(0.0, uT * 2.5))) * (1.0 - smoothstep(1.0, 12.0, dep)) * 0.7;
    float ocFoam = clamp(max(max(fShore, band), max(caps, streak)), 0.0, 1.0) * mix(1.0, 0.0, smoothstep(1500.0, 4000.0, wd));
    diffuseColor.rgb = ocLin(mix(wc, vec3(0.96, 0.98, 0.97), ocFoam)); diffuseColor.a = max(al, ocFoam);
    float ocRough = mix(0.06, 0.75, ocFoam);`).replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = ocRough;')
    .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n normal = normalize((viewMatrix * vec4(ocWN, 0.0)).xyz);'), 'ocwater');
  watM.onBeforeCompile = ((ob) => (sh) => { ob(sh); sh.vertexShader = sh.vertexShader.replace('varying vec3 vOcW;', 'varying vec3 vOcW;' + WAV.replace('ocWav(', 'ocWavV(')); })(watM.onBeforeCompile);
  const water = mesh(ocGrid(ocAxis(4, -20000, 20000, 1.0, 0.04), ocAxis(-80, -40000, 60, 1.0, 0.04), () => 0), watM, 0, 0, 0, { cast: false }); water.frustumCulled = false; water.renderOrder = 1; sc.add(water); O.water = water;

  // ---- rocks and boulders (instanced, three shapes), seaweed, tide pools; kept off the pier and off walkers' paths
  O.paths = []; // [x0, z0, x1, z1] of walkers on the bed, filled below (people first so rocks can avoid them)
  const crowd = O.crowd = makeCrowd(280, { seed: 77, kids: 0.15 }); sc.add(crowd.grp); O.pp = [];
  for (let i = 0; i < 280; i++) { const swim = i < 150, side = R.f() < 0.8 ? 1 : -1;
    let x0 = side * (9 + Math.pow(R.f(), 1.5) * (swim ? 180 : 300)), z0 = swim ? -8 - Math.pow(R.f(), 1.6) * 300 : R.r(3, 40);
    const ts = swim ? 17 + Math.log(1 + Math.max(0, -3 - z0 + 15) / 60) / 0.321 + R.r(0.5, 4) : R.r(18.5, 33), v = swim ? R.r(0.7, 1.4) : R.f() < 0.2 ? R.r(2.4, 3.6) : R.r(1.1, 1.8), dur = R.r(20, 50), hd = swim ? R.r(-1.6, 1.6) : R.r(-0.35, 0.35) + (side > 0 ? 0.1 : -0.1);
    let dx = Math.sin(hd), dz = -Math.cos(hd); const L = v * dur; if (Math.abs(x0 + dx * L) < 9 || Math.sign(x0 + dx * L) !== side) dx = side * Math.abs(dx);
    const p = { swim, x0, z0, ts, v, dur, dx, dz, ph: R.r(0, TAU), stop: R.r(0, 1) < 0.3, wav: R.f() };
    p.x1 = x0 + dx * L; p.z1 = z0 + dz * L; O.pp.push(p); O.paths.push([x0, z0, p.x1, p.z1]); }
  const offPath = (x, z, r) => { if (Math.abs(x) < 8 + r) return false; for (const [a, b, c, d] of O.paths) { const ux = c - a, uz = d - b, l2 = ux * ux + uz * uz || 1, k = clamp(((x - a) * ux + (z - b) * uz) / l2); if (Math.hypot(a + ux * k - x, b + uz * k - z) < r + 0.8) return false; } return true; };
  const rockG = [lumpyGeo(2, 0.55, 3), lumpyGeo(2, 0.4, 8), lumpyGeo(1, 0.7, 12)], rockM = STDm({ color: '#ffffff', roughness: 0.85 });
  const RK = rockG.map((g) => IM(g, rockM, 260, true)); RK.forEach((m) => { m.count = 0; sc.add(m); });
  const rockCols = ['#7a7670', '#8a847a', '#6a6660', '#5e5a54', '#9a948a', '#585a5c'];
  const placeRock = (x, z, s) => { if (!offPath(x, z, s * 1.2)) return; const m = RK[R.i(0, 2)]; if (m.count >= 260) return; const y = ocBedY(x, z) - 0.3 * s;
    m.setMatrixAt(m.count, M4c(x, y, z, R.r(0, TAU), s * R.r(0.9, 1.4), s * R.r(0.55, 0.9), s, R.r(-0.2, 0.2), R.r(-0.2, 0.2))); m.setColorAt(m.count, lin(R.pick(rockCols))); m.count++; };
  for (let k = 0; k < 560; k++) { const far = R.f(); const z = -R.r(6, 60) - Math.pow(far, 2.2) * 2400, x = R.r(-200, 900) * (0.4 + Math.min(2, -z / 400)); placeRock(x, z, R.f() < 0.12 ? R.r(1.5, 3.4) : R.r(0.25, 1.1)); }
  // a few rocky outcrops (clusters) like the ref's boulder fields
  [[45, -150], [110, -95], [70, -330], [180, -260], [30, -520], [260, -700], [-60, -180], [140, -1100], [420, -1500]].forEach(([cx, cz]) => { for (let k = 0; k < 14; k++) placeRock(cx + R.n(14), cz + R.n(14), k < 3 ? R.r(1.8, 3.2) : R.r(0.4, 1.4)); });
  RK.forEach((m) => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
  // seaweed: flat dark blobs and ribbons lying on the bed, thick around the rocks
  const wb = IM(lumpyGeo(1, 0.6, 21), STDm({ color: '#ffffff', roughness: 0.35 }), 900, false), wr = IM(new THREE.BoxGeometry(1, 0.03, 0.12).translate(0.5, 0, 0), STDm({ color: '#ffffff', roughness: 0.3 }), 1400, false);
  const weedCols = ['#2a3618', '#363c1a', '#222c14', '#3e3418', '#2c2610', '#3a4220'];
  let nb = 0, nr = 0; for (let k = 0; k < 900; k++) { const z = -R.r(4, 30) - Math.pow(R.f(), 2) * 900, x = R.r(-120, 520) * (0.5 + Math.min(1.5, -z / 300)); if (!offPath(x, z, 0.6)) continue; const y = ocBedY(x, z), s = R.r(0.3, 1.2);
    wb.setMatrixAt(nb, M4c(x, y - 0.02, z, R.r(0, TAU), s * R.r(1, 2), 0.1 * s, s)); wb.setColorAt(nb++, lin(R.pick(weedCols)));
    for (let q = 0; q < 2 && nr < 1400; q++) { wr.setMatrixAt(nr, M4c(x + R.n(1.2), y + 0.01, z + R.n(1.2), R.r(0, TAU), R.r(0.6, 2.2), 1, R.r(0.6, 1.4), 0, 0)); wr.setColorAt(nr++, lin(R.pick(weedCols))); } }
  wb.count = nb; wr.count = nr; [wb, wr].forEach((m) => { m.receiveShadow = true; sc.add(m); });
  // tide pools: flat blue mirrors in the bed hollows, shown once the sea has left them
  const poolG = (() => { const sh = new THREE.Shape(), Rp = RNG('pool'); for (let k = 0; k <= 24; k++) { const a = k / 24 * TAU, r = 1 + 0.25 * Math.sin(a * 3 + 1) + 0.15 * Math.sin(a * 5 + 2) + Rp.n(0.08); k ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } return new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2); })();
  O.pools = IM(poolG, STDm({ color: '#2f78d0', roughness: 0.08, metalness: 0.0, envMapIntensity: 0.5 }), 220, false); O.pools.castShadow = false; O.pl = [];
  for (let k = 0; k < 3000 && O.pl.length < 220; k++) { const z = -R.r(10, 40) - Math.pow(R.f(), 2.2) * 1600, x = R.r(-120, 600) * (0.3 + Math.min(1.6, -z / 400)); if (Math.abs(x) < 10) continue;
    if (ocBedN(x, z) > 0.45 * (0.45 * clamp(-z / 60) + 1.2 * clamp(-z / 4000)) + 0.05) continue; // only in hollows
    const s = R.r(1.5, 6) * (1 + Math.min(3, -z / 300)); let y = -1e9; for (let a = 0; a < 6; a++) y = Math.max(y, ocBedY(x + Math.cos(a) * s * 0.6, z + Math.sin(a) * s * 0.6)); y = Math.min(y, ocBedY(x, z) + 0.12) + 0.03;
    const sx = R.r(0.6, 1.5); if (Math.abs(x) < s * Math.max(1, sx) * 1.35 + 6) continue; O.pl.push({ x, z, y, s, ry: R.r(0, TAU), sx }); }
  sc.add(O.pools);
  // fish flapping on the wet sand near the pier
  const fishG = new THREE.SphereGeometry(1, 10, 6).scale(0.5, 0.05, 0.13), tailG = new THREE.ConeGeometry(0.12, 0.22, 4).scale(1, 1, 0.25).rotateZ(Math.PI / 2).translate(-0.6, 0, 0).rotateX(Math.PI / 2);
  const fishM = STDm({ color: '#c8d0d8', metalness: 0.7, roughness: 0.25 }); O.fishB = IM(fishG, fishM, 80, true); O.fishT = IM(tailG, fishM, 80, false); O.fishB.instanceMatrix.setUsage(THREE.DynamicDrawUsage); O.fishT.instanceMatrix.setUsage(THREE.DynamicDrawUsage); O.fish = [];
  for (let k = 0; k < 80; k++) { const x = R.r(7, 70) * (R.f() < 0.85 ? 1 : -1), z = -R.r(12, 260), s = R.r(0.5, 1.0); O.fish.push({ x, z, s, y: ocBedY(x, z), ry: R.r(0, TAU), ph: R.r(0, TAU), die: R.r(36, 60) }); O.fishB.setColorAt(k, lin(R.pick(['#b8c4cc', '#d0d4d0', '#8a9aa4', '#c8b898']))); }
  sc.add(O.fishB, O.fishT);

  // ---- boats: dinghies, motor cruisers, sailing yachts; they float, settle on the bed and lie over
  const hullGeo = (L, H, B) => { const g = new THREE.BoxGeometry(L, H, B, 14, 4, 6), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const u = p.getX(i) / (L / 2), v = clamp(p.getY(i) / H + 0.5);
      let w = u > 0 ? 1 - Math.pow(u, 2.2) * 0.96 : 1 - 0.12 * u * u; w *= lerp(0.35, 1, Math.pow(v, 0.55)); p.setZ(i, p.getZ(i) * w); p.setY(i, p.getY(i) + (u > 0 ? u * u * H * 0.35 * v : 0) + (1 - v) * Math.abs(u) * H * 0.25); }
    g.computeVertexNormals(); return g; };
  const boat = (kind, s, col) => { const G = new THREE.Group(), body = new THREE.Group(); G.add(body); const white = STDm({ color: '#f2f2ee', roughness: 0.45 }), dark = STDm({ color: '#1e2a36', roughness: 0.2, metalness: 0.3 }), wood = STDm({ color: '#a07a50', roughness: 0.7 });
    const add = (g, m, x, y, z) => { const o = mesh(g, m, x, y, z); body.add(o); return o; }; let L, B, H, draft, lean;
    if (kind === 'dinghy') { L = 4; B = 1.6; H = 0.7; draft = 0.25; lean = 0.35; add(hullGeo(L, H, B), STDm({ color: col, roughness: 0.5 }), 0, H / 2, 0); add(new THREE.BoxGeometry(L * 0.7, 0.05, B * 0.7), wood, -0.2, H * 0.92, 0); add(new THREE.BoxGeometry(0.3, 0.5, 0.25), dark, -L / 2 - 0.05, H * 0.8, 0); }
    else if (kind === 'motor') { L = 10; B = 3.4; H = 1.5; draft = 0.6; lean = 0.5; add(hullGeo(L, H, B), white, 0, H / 2, 0); add(hullGeo(L * 1.002, H * 0.2, B * 1.01), STDm({ color: col, roughness: 0.5 }), 0, H * 0.25, 0);
      add(new THREE.BoxGeometry(L * 0.8, 0.06, B * 0.8), wood, -0.4, H * 1.02, 0); add(new THREE.BoxGeometry(L * 0.38, 1.3, B * 0.72), white, -0.6, H + 0.65, 0); add(new THREE.BoxGeometry(L * 0.39, 0.45, B * 0.74), dark, -0.6, H + 0.85, 0); add(new THREE.BoxGeometry(L * 0.3, 0.1, B * 0.8), white, -0.6, H + 1.35, 0); }
    else { L = 9; B = 3; H = 1.2; draft = 1.4; lean = 1.05; add(hullGeo(L, H, B), STDm({ color: col, roughness: 0.45 }), 0, H / 2, 0); add(new THREE.BoxGeometry(L * 0.86, 0.05, B * 0.82), wood, -0.3, H * 1.0, 0); add(new THREE.BoxGeometry(L * 0.3, 0.6, B * 0.6), white, 0.2, H + 0.3, 0);
      add(new THREE.BoxGeometry(1.6, 0.6, 0.18), dark, 0, -0.25, 0); add(new THREE.CylinderGeometry(0.07, 0.09, 12, 6).translate(0, 6, 0), white, 0.9, H, 0); const boom = add(new THREE.CylinderGeometry(0.06, 0.06, 4, 6), white, -1.1, H + 1.6, 0); boom.rotation.z = Math.PI / 2;
      add(new THREE.CylinderGeometry(0.2, 0.2, 3.6, 8), STDm({ color: '#2a4a8a', roughness: 0.7 }), -1.1, H + 1.85, 0).rotation.z = Math.PI / 2; }
    G.scale.setScalar(s); return { G, body, L: L * s, B: B * s, H: H * s, draft: draft * s, lean, kind }; };
  const BC = ['#c83a3a', '#2a5aa8', '#f2f2ee', '#1e6a5a', '#e8b030', '#f2f2ee', '#3a3a48'];
  O.boats = [[22, -32, 'dinghy', 0.4], [32, -14, 'dinghy', -1.2], [-26, -40, 'dinghy', 2.0], [38, -120, 'motor', 0.3], [62, -62, 'sail', -0.4], [-34, -95, 'motor', 2.6], [95, -205, 'sail', 0.9], [150, -140, 'dinghy', 1.4],
    [52, -310, 'motor', -0.2], [210, -430, 'sail', 0.5], [-90, -260, 'sail', 2.2], [310, -720, 'motor', 1.0], [130, -900, 'sail', -0.6], [520, -1300, 'motor', 0.4], [80, -45, 'motor', 1.7], [-60, -150, 'dinghy', 0.2],
    [700, -2200, 'sail', 0.3, 1.6], [-420, -1850, 'motor', 2.0, 1.4], [240, -1700, 'sail', 1.1, 1.5]].map(([x, z, kind, ry, s = 1], i) => {
    if (!offPath(x, z, kind === 'dinghy' ? 2.5 : 6)) { x += 14 * Math.sign(x); }
    const b = boat(kind, s, BC[i % BC.length]); b.x = x; b.z = z; b.ry = ry; b.ph = i * 1.7; b.gy = ocBedY(x, z); b.side = i % 2 ? 1 : -1; sc.add(b.G); return b; });
  // far ships on the horizon (cargo ship, ferry)
  const ship = (L, col, cont) => { const G = new THREE.Group(); const hull = mesh(hullGeo(L, L * 0.11, L * 0.15), STDm({ color: col, roughness: 0.6 }), 0, L * 0.055, 0); G.add(hull);
    G.add(mesh(hullGeo(L * 1.003, L * 0.03, L * 0.151), STDm({ color: '#7a2a22', roughness: 0.7 }), 0, L * 0.012, 0)); G.add(mesh(new THREE.BoxGeometry(L * 0.1, L * 0.12, L * 0.13), STDm({ color: '#f2f2ee' }), -L * 0.4, L * 0.16, 0));
    if (cont) { const cm = IM(new THREE.BoxGeometry(1, 1, 1), STDm({ roughness: 0.7 }), 60, false); let k = 0; const Rs = RNG('ship' + L); for (let i = 0; i < 12; i++) for (let j = 0; j < 5; j++) { cm.setMatrixAt(k, M4c(-L * 0.3 + i * L * 0.058, L * 0.11 + j * 0.0, (j - 2) * L * 0.027, 0, L * 0.052, L * 0.06 * (1 + (Rs.f() * 1.5 | 0)), L * 0.024)); cm.setColorAt(k++, lin(Rs.pick(['#c83a3a', '#2a5aa8', '#e8b030', '#3a8a5a', '#d06a2a', '#8a8a8a']))); } G.add(cm); }
    else { G.add(mesh(new THREE.BoxGeometry(L * 0.6, L * 0.06, L * 0.12), STDm({ color: '#f2f2ee' }), 0, L * 0.14, 0)); G.add(mesh(new THREE.BoxGeometry(L * 0.04, L * 0.08, L * 0.04), STDm({ color: '#c83a3a' }), 0, L * 0.2, 0)); }
    sc.add(G); return G; };
  O.ships = [[1100, -3600, 180, '#2a3a5a', true, 0.15], [-1600, -5200, 140, '#f2f2ee', false, -0.1], [2600, -6500, 200, '#3a4a3a', true, 0.3]].map(([x, z, L, col, c, ry]) => ({ G: ship(L, col, c), x, z, L, ry, gy: ocBedY(x, z) }));
  return O; }

function poseOcean(O, t) { const U = O.U, sea = SEA(t), edge = SEAEDGE(t);
  U.uSea.value = sea; U.uEdge.value = edge; U.uT.value = t; U.uDry.value = ss(24, 70, t); U.uWetW.value = Math.min(220, 25 + 0.05 * (OC_E0 - edge));
  O.water.position.y = sea; O.water.visible = edge > -9500;
  // boats: bob while afloat, settle onto the bed as the level drops below their keel, then lie over
  O.boats.forEach((b) => { const flo = sea + 0.12 * Math.sin(t * 1.3 + b.ph) * ss(17, 15, t) + 0.05 * Math.sin(t * 2.1 + b.ph);
    const g = ss(0, 1.2, b.gy + b.draft - sea), lie = b.lean * ss(0, 1, b.gy + b.draft - sea - 0.4) * b.side;
    const y = Math.max(flo - b.draft, b.gy - b.draft * 0.5 * (1 - Math.abs(Math.sin(lie))) + b.B * 0.12 * Math.abs(Math.sin(lie)));
    b.G.position.set(b.x, y, b.z); b.G.rotation.set(0.05 * Math.sin(t * 1.1 + b.ph) * (1 - g) + lie, b.ry, 0.03 * Math.sin(t * 0.8 + b.ph) * (1 - g) + 0.04 * g * b.side, 'YXZ'); });
  O.ships.forEach((s) => { const g = ss(0, 4, s.gy + 6 - sea); s.G.position.set(s.x, Math.max(sea - 6, s.gy - 5), s.z); s.G.rotation.set(0.12 * g, s.ry, 0.02 * g, 'YXZ'); });
  // people: swimmers bob with their heads out, then stand and wander out over the bed; beachgoers walk out after the sea
  O.pp.forEach((p, i) => { const k = Math.max(0, t - p.ts), d = p.v * Math.min(k, p.dur) * (p.stop && k > p.dur * 0.6 ? 0.6 : 1), x = p.x0 + p.dx * d, z = p.z0 + p.dz * d, gy = ocBedY(x, z);
    const moving = k > 0 && k < p.dur, bob = moving ? 0.03 * Math.abs(Math.sin(t * 7 * p.v + p.ph)) : 0;
    if (p.swim) { const y = Math.max(gy, sea - 1.42 + 0.06 * Math.sin(t * 1.5 + p.ph)), fl = ss(17.5, 19, t) * (1 - ss(22, 26, t));
      O.crowd.set(i, x, y + bob, z, k > 0 ? Math.atan2(p.dx, p.dz) : p.ph, 1, Math.max(fl * (0.6 + 0.4 * p.wav), sea - gy > 1 ? 0.25 : 0), 0.04 * Math.sin(t * 3 + p.ph) * (1 - ss(0, 1, k))); }
    else O.crowd.set(i, x, gy + bob, z, Math.atan2(p.dx, p.dz), 1, 0, 0, k > 0 ? 0 : 1); });
  O.crowd.done();
  // tide pools appear once the water drops below them
  O.pl.forEach((p, i) => O.pools.setMatrixAt(i, sea < p.y - 0.06 ? M4c(p.x, p.y, p.z, p.ry, p.s * p.sx, 1, p.s) : _hid)); O.pools.count = O.pl.length; O.pools.instanceMatrix.needsUpdate = true;
  // fish: flap and hop on the sand once stranded, slow down and lie still
  O.fish.forEach((f, i) => { if (sea > f.y - 0.05) { O.fishB.setMatrixAt(i, _hid); O.fishT.setMatrixAt(i, _hid); return; }
    const live = 1 - ss(f.die - 8, f.die, t), w = Math.max(0, Math.sin(t * 9 + f.ph)), hop = 0.12 * f.s * Math.pow(w, 6) * live * (0.5 + 0.5 * Math.sin(t * 1.3 + f.ph));
    const M = M4c(f.x, f.y + 0.04 * f.s + hop, f.z, f.ry + 0.3 * Math.sin(t * 2 + f.ph) * live, f.s, f.s, f.s, 0, 0.5 * Math.sin(t * 13 + f.ph) * live * Math.pow(w, 2));
    O.fishB.setMatrixAt(i, M); O.fishT.setMatrixAt(i, M.clone().multiply(Ry(0.6 * Math.sin(t * 16 + f.ph) * live))); });
  O.fishB.instanceMatrix.needsUpdate = O.fishT.instanceMatrix.needsUpdate = true; }
