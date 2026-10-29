
// =====================================================================
//  HELL — the lake of fire. Shots: lake, crowd, water, heaven, rest, devil, blaze, never.
//  One shared world, built once: a molten lake with drifting crust to the horizon, a cave roof of basalt plates with
//  glowing cracks, falls of lava from the roof, smoke columns rising forever, a rain of sparks, millions of burning
//  people (hero people up close → an instanced crowd → tiny shader figures to the horizon, each with its flame),
//  heaven far away across a bottomless chasm, and the throne in the smoke.
// =====================================================================
const HELL = { L: new THREE.Vector3(0, 0, 400), E: new THREE.Vector3(0, 0, -1150), D: new THREE.Vector3(-820, 0, 1060), CEIL: 175, HV: new THREE.Vector3(0, 270, -3100) };
// the cave roof's height (same formula in GLSL) and the chasm's edge line
const hellCeilY = (x, z) => HELL.CEIL - 22 * Math.sin(x * 0.0041 + 1.3) * Math.cos(z * 0.0033 - 0.4) - 10 * Math.sin(x * 0.011 + z * 0.009) + 250 * Math.exp(-((x - HELL.D.x) ** 2 + (z - HELL.D.z) ** 2) / 560 ** 2);
const hellEdgeZ = (x) => -1200 + 60 * (Math.sin(x * 0.004 + 0.7) - Math.sin(0.7)) + 25 * (Math.sin(x * 0.013 + 2.0) - Math.sin(2.0)) + 0.00012 * x * x;
const hellGL = `
float hH1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 hH2(vec2 p){ return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
float hVn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hH1(i), hH1(i + vec2(1.0, 0.0)), f.x), mix(hH1(i + vec2(0.0, 1.0)), hH1(i + vec2(1.0, 1.0)), f.x), f.y); }
float hFbm(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++) { a += m * hVn(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 1.7; m *= 0.5; } return a / 0.97; }
float hFbm3(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 3; i++) { a += m * hVn(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 1.7; m *= 0.5; } return a / 0.875; }
// voronoi: x = distance to the nearest edge, y = cell hash, z = distance to the cell centre (animated points)
vec3 hVor(vec2 p, float t){ vec2 n = floor(p), f = fract(p), mg = vec2(0.0), mr = vec2(0.0); float md = 8.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) { vec2 g = vec2(float(i), float(j)), o = hH2(n + g); o = 0.5 + 0.42 * sin(t + 6.2831 * o); vec2 r = g + o - f; float d = dot(r, r); if (d < md) { md = d; mr = r; mg = g; } }
  md = 8.0; for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) { vec2 g = mg + vec2(float(i), float(j)), o = hH2(n + g); o = 0.5 + 0.42 * sin(t + 6.2831 * o); vec2 r = g + o - f; if (dot(mr - r, mr - r) > 0.00001) md = min(md, dot(0.5 * (mr + r), normalize(r - mr))); }
  return vec3(md, hH1(n + mg), length(mr)); }
vec3 hRamp(float x){ x = clamp(x, 0.0, 1.0); vec3 c = mix(vec3(0.18, 0.012, 0.0), vec3(1.0, 0.16, 0.012), smoothstep(0.0, 0.4, x)); c = mix(c, vec3(1.0, 0.46, 0.06), smoothstep(0.35, 0.7, x)); c = mix(c, vec3(1.0, 0.86, 0.55), smoothstep(0.72, 1.0, x)); return c * (0.25 + 4.2 * x * x); }
float hCeil(vec2 p){ return ${HELL.CEIL.toFixed(1)} - 22.0 * sin(p.x * 0.0041 + 1.3) * cos(p.y * 0.0033 - 0.4) - 10.0 * sin(p.x * 0.011 + p.y * 0.009) + 250.0 * exp(-(pow(p.x - (${HELL.D.x.toFixed(1)}), 2.0) + pow(p.y - ${HELL.D.z.toFixed(1)}, 2.0)) / ${(560 * 560).toFixed(1)}); }
float hEdge(float x){ return -1200.0 + 60.0 * (sin(x * 0.004 + 0.7) - ${Math.sin(0.7).toFixed(6)}) + 25.0 * (sin(x * 0.013 + 2.0) - ${Math.sin(2.0).toFixed(6)}) + 0.00012 * x * x; }
`;
const HELL_U = { uT: { value: 0 }, uFogC: { value: lin('#7c3414') }, uFogD: { value: 0.0009 }, uHeat: { value: 0 }, uCam: { value: new THREE.Vector3() }, uSpk: { value: 1 } };
const hellSM = ({ u, ...o }) => new THREE.ShaderMaterial(Object.assign({ uniforms: Object.assign({}, HELL_U, u || {}) }, o));
const hellOUT = '#include <tonemapping_fragment>\n#include <encodings_fragment>\n';
const hellFog = 'float hFogK(float d){ return 1.0 - exp(-uFogD * uFogD * d * d); }\n';

// ---- the molten lake: flowing domain-warped heat, drifting crust plates with hot rims, open channels; cut at the chasm
function hellLake() { const g = new THREE.PlaneGeometry(9000, 6600, 1, 1).rotateX(-Math.PI / 2).translate(0, 0, 1500);
  const m = hellSM({ vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uT, uFogD, uHeat; uniform vec3 uFogC; varying vec3 vW;\n${hellGL}${hellFog}
void main(){ float ez = hEdge(vW.x); if (vW.z < ez) discard;
  vec2 p = vW.xz; vec2 fw2 = fwidth(p); float d = length(vW - cameraPosition), px = sqrt(fw2.x * fw2.y) * 1.3;
  vec2 q = p * 0.011, wp = vec2(hFbm(q + vec2(0.0, uT * 0.012)), hFbm(q + vec2(5.2, 1.3) - uT * 0.01)), pw = p + (wp - 0.5) * 46.0;
  float lodA = smoothstep(0.05, 0.5, px), lodB = smoothstep(0.5, 3.5, px);
  float heat = hFbm(pw * 0.028 + vec2(uT * 0.03, -uT * 0.02));
  float flow = hFbm(vec2(pw.x * 0.09, pw.y * 0.025) + wp * 2.0 + vec2(0.0, uT * 0.15));
  float bub = mix(hVn(pw * 0.8 + vec2(0.0, uT * 0.5)), 0.5, lodA);
  float cover = smoothstep(0.3, 0.6, hFbm(pw * 0.0055 + 11.0)) * (0.6 + 0.4 * smoothstep(0.0, 30.0, vW.z - ez));
  vec3 v = hVor(pw / 9.0 + vec2(uT * 0.03, uT * 0.012), uT * 0.08);
  float ph = hH1(vec2(v.y * 91.0, 3.0)), gw = hFbm3(pw * 0.02 + 5.0), gap = mix(0.42, 0.02, cover) * (0.35 + 1.3 * ph * gw), aa = px / 9.0 * 1.5 + 0.004;
  float plate = smoothstep(gap, gap + aa, v.x - 0.08 * (hVn(pw * 0.9) - 0.5)) * step(0.25, cover + 0.5 * v.y);
  vec3 v3 = hVor(pw / 2.6 + 7.0 + uT * 0.05, uT * 0.3); float frag = smoothstep(0.2, 0.2 + px / 2.6 * 1.5 + 0.01, v3.x) * step(0.62, v3.y) * (1.0 - cover) * (1.0 - lodA);
  vec3 v2 = hVor(pw / 1.7 + v.y * 9.0, 0.0); float fine = (1.0 - smoothstep(0.0, 0.04 + px / 1.7 * 1.5, v2.x)) * (1.0 - lodA);
  float rim = exp(-max(v.x - gap, 0.0) * 34.0), rimW = exp(-max(v.x - gap, 0.0) * 7.0);
  float skin = smoothstep(0.3, 0.75, hFbm3(vec2(pw.x * 0.5 + flow * 3.0, pw.y * 0.16) + vec2(0.0, uT * 0.2)));
  vec3 molten = hRamp(0.26 + 0.4 * heat + 0.18 * flow + 0.12 * bub - 0.18 * skin * (1.0 - lodA)) * 0.75;
  float rough = hVn(pw * 2.1) * hVn(pw * 0.7 + 3.0) + 0.5 * hVn(pw * 6.0);
  vec3 crust = vec3(0.016, 0.009, 0.008) * (0.35 + 1.4 * rough + 0.6 * v.y) + vec3(0.22, 0.03, 0.0) * smoothstep(0.62, 0.85, heat) * (1.0 - smoothstep(0.0, 0.3, v.x)) * 0.5;
  crust += hRamp(0.5 + 0.2 * heat) * rim * 0.45 + vec3(0.32, 0.03, 0.0) * rimW * 0.25 + hRamp(0.4) * fine * 0.18 * (0.3 + heat);
  vec3 v4 = hVor(pw / 1.3 + vec2(flow * 2.0, uT * 0.15), uT * 0.4); float sk = smoothstep(0.05, 0.05 + px / 1.3 * 1.5 + 0.02, v4.x) * smoothstep(0.25, 0.5, hFbm3(pw * 0.09 + 2.0)) * (1.0 - smoothstep(0.015, 0.09, px));
  molten *= 1.0 - 0.78 * sk * (0.55 + 0.45 * v4.y);
  vec3 col = mix(molten, crust, max(plate, frag));
  vec3 farC = mix(hRamp(0.36 + 0.25 * heat) * 0.6, vec3(0.05, 0.016, 0.008), cover * 0.8);
  col = mix(col, farC, lodB);
  col *= 1.0 + uHeat * (1.2 + heat);
  col = mix(col, uFogC, hFogK(d));
  gl_FragColor = vec4(col, 1.0);
${hellOUT}}` });
  const L = new THREE.Mesh(g, m); L.frustumCulled = false; return L; }

// ---- the cave roof: basalt plates (lit from below by the lake), wide glowing cracks + fine cracks, embers stuck in it
function hellRoof() { const g = new THREE.PlaneGeometry(9000, 6300, 220, 160).rotateX(Math.PI / 2).translate(0, 0, 1650);
  const m = hellSM({ side: THREE.DoubleSide, vertexShader: `varying vec3 vW;\n${hellGL}\nvoid main(){ vec4 w = modelMatrix * vec4(position, 1.0); w.y = hCeil(w.xz) - 18.0 * hFbm3(w.xz * 0.012); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float uT, uFogD, uHeat; uniform vec3 uFogC; varying vec3 vW;\n${hellGL}${hellFog}
void main(){ float rim = -1500.0 + 160.0 * hFbm3(vec2(vW.x * 0.008, 3.0)); if (vW.z < rim) discard;
  vec2 p = vW.xz; float d = length(vW - cameraPosition), px = length(fwidth(p));
  vec3 v = hVor(p / 34.0 + 0.4 * vec2(hFbm3(p * 0.01), hFbm3(p * 0.01 + 4.0)), 0.0); float cw = 0.045 + px / 34.0 * 1.3;
  float crack = 1.0 - smoothstep(0.0, cw, v.x), halo = exp(-v.x * 7.0);
  vec3 v2 = hVor(p / 10.0 + 3.1, 0.0); float crack2 = (1.0 - smoothstep(0.0, 0.025 + px / 10.0 * 1.3, v2.x)) * smoothstep(0.06, 0.16, v.x) * step(0.45, hH1(vec2(v.y * 77.0, v2.y * 13.0)));
  float pulse = 0.65 + 0.35 * sin(uT * 1.1 + v.y * 31.0) * (0.5 + 0.5 * hVn(p * 0.01 + uT * 0.15));
  float tilt = 0.55 + 0.9 * v.y * (0.5 + 0.5 * smoothstep(0.0, 0.3, v.x));
  vec3 bas = vec3(0.03, 0.017, 0.014) * (0.45 + hFbm(p * 0.35)) * tilt;
  bas += vec3(0.13, 0.034, 0.008) * (0.25 + 0.75 * hFbm3(p * 0.04 + 7.0)) * tilt * (0.6 + 0.6 * halo);
  float sp = step(0.993, hH1(floor(p * 0.9))) * smoothstep(0.35, 0.1, length(fract(p * 0.9) - 0.5)) * (0.5 + 0.5 * sin(uT * 3.0 + hH1(floor(p * 0.9) + 3.0) * 40.0)) * (1.0 - smoothstep(0.3, 1.2, px));
  vec3 col = bas + hRamp(0.74) * crack * pulse + hRamp(0.6) * halo * 0.22 * pulse + hRamp(0.7) * crack2 * pulse * 0.55 + hRamp(0.75) * sp;
  col *= 1.0 + uHeat * 0.8;
  float fk = smoothstep(1500.0, 4200.0, d), f = hFogK(d) * mix(0.7, 1.0, fk); col = mix(col, uFogC * mix(0.8, 1.0, fk), f);
  gl_FragColor = vec4(col, 1.0);
${hellOUT}}` });
  const M = new THREE.Mesh(g, m); M.frustumCulled = false; return M; }

// ---- the chasm wall under the lake's edge: rough black rock, lava pouring over in falls, dark below
function hellCliff() { const NX = 900, NY = 40, pos = [], idx = [];
  for (let j = 0; j <= NY; j++) { const v = j / NY, y = -2800 * v * v * v; for (let i = 0; i <= NX; i++) { const x = -3200 + 6400 * i / NX; const k = Math.min(1, -y / 40); pos.push(x, y + 0.3, hellEdgeZ(x) + 0.5 + k * (-6 * Math.sin(x * 0.05 + y * 0.03) - 4 * Math.sin(x * 0.13 - y * 0.07) - 8) + y * 0.14); } }
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = hellSM({ side: THREE.DoubleSide, vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uT, uFogD; uniform vec3 uFogC; varying vec3 vW;\n${hellGL}
void main(){ float d = length(vW - cameraPosition), y = vW.y;
  float fallM = smoothstep(0.68, 0.8, hVn(vec2((vW.x - vW.z * 0.7) * 0.022, 1.0)));
  float u = vW.x - vW.z * 0.7, str = hFbm3(vec2(u * 0.12, y * 0.012 + uT * 0.9)), str2 = hVn(vec2(u * 0.5, y * 0.03 + uT * 1.8));
  float fall = fallM * smoothstep(0.42, 0.75, str) * exp(y / 450.0);
  float rt = hFbm(vec2(u, y) * vec2(0.09, 0.05)), rt2 = hFbm3(vec2(u, y) * vec2(0.5, 0.25)), ridge = abs(sin(u * 0.21 + rt * 4.0));
  vec3 rock = vec3(0.018, 0.011, 0.01) * (0.15 + 1.8 * rt * rt * (0.5 + ridge) + 0.5 * rt2);
  rock += vec3(0.3, 0.06, 0.01) * exp(y / 25.0) * 0.12 * rt * ridge + hRamp(0.5) * exp(y / 1.5) * 0.5;                          // the lip, lit by the lake
  rock += vec3(0.25, 0.05, 0.01) * fallM * exp(y / 300.0) * 0.25 * (0.5 + rt);              // glow around the falls
  vec3 col = rock + hRamp(0.5 + 0.45 * str2) * fall;
  col *= smoothstep(-2600.0, -300.0, y) * 0.9 + 0.1;
  col = mix(col, vec3(0.012, 0.004, 0.002), smoothstep(-200.0, -2400.0, y) * 0.8);
  col = mix(col, vec3(0.025, 0.007, 0.004), 1.0 - exp(-d * 0.0014));
  gl_FragColor = vec4(col, 1.0);
${hellOUT}}` });
  return new THREE.Mesh(g, m); }

// ---- the sky beyond the roof's rim: fog colour near the horizon, black above, heaven's glow, the abyss below
function hellSky() { const m = hellSM({ side: THREE.BackSide, depthWrite: false, u: { uHv: { value: HELL.HV.clone().normalize() } },
  vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
  fragmentShader: `uniform vec3 uFogC, uHv; uniform float uT; varying vec3 vD;\n${hellGL}
void main(){ vec3 d = normalize(vD); float h = d.y, k = max(dot(d, normalize(vec3(0.0, 0.07, -1.0))), 0.0);
  vec3 col = mix(uFogC, uFogC * 0.18, smoothstep(0.0, 0.35, h));
  float s = hFbm(d.xz / (abs(d.y) + 0.25) * 3.0 + uT * 0.01);
  vec3 gold = vec3(1.0, 0.78, 0.42);
  col = mix(col, mix(uFogC * 0.7, gold * 0.55, s * 0.5), pow(k, 10.0) * smoothstep(-0.1, 0.05, h));
  col += gold * (pow(k, 90.0) * 0.5 + pow(k, 14.0) * 0.2) * smoothstep(-0.06, 0.04, h);
  col = mix(col, vec3(0.01, 0.003, 0.002), smoothstep(0.0, -0.25, h) * (0.6 + 0.4 * k));
  gl_FragColor = vec4(col, 1.0);
${hellOUT}}` });
  const s = new THREE.Mesh(new THREE.SphereGeometry(9000, 48, 24), m); s.renderOrder = -10; s.frustumCulled = false; return s; }

// ---- flames: instanced camera-facing quads, a procedural licking flame each (noise tongues, hot core). Static fields
//      (set once) and dynamic sets (set each frame) share the shader. set(i, x, y, z, w, h, k)
function hellFlames(n, o = {}) { const g = new THREE.InstancedBufferGeometry(); const b = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0); g.index = b.index; g.setAttribute('position', b.attributes.position);
  const aP = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3), aS = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3), aR = new THREE.InstancedBufferAttribute(new Float32Array(n), 1);
  if (o.dyn) { aP.setUsage(THREE.DynamicDrawUsage); aS.setUsage(THREE.DynamicDrawUsage); }
  g.setAttribute('aP', aP); g.setAttribute('aS', aS); g.setAttribute('aR', aR); g.instanceCount = n; for (let i = 0; i < n; i++) aR.array[i] = hsh(i, 7 + (o.seed || 0));
  const m = hellSM({ transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendEquation: o.add ? THREE.AddEquation : THREE.MaxEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, u: { uGain: { value: o.gain || 1 } },
    vertexShader: `attribute vec3 aP, aS; attribute float aR; uniform float uT; varying vec2 vUv; varying float vR, vK, vD;
void main(){ vUv = vec2(position.x + 0.5, position.y);
  float fl = 0.86 + 0.12 * sin(uT * (8.0 + 5.0 * aR) + aR * 40.0) + 0.08 * sin(uT * 21.0 + aR * 13.0);
  vec4 c = viewMatrix * vec4(aP, 1.0); vec3 upV = (viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz; float L = length(upV.xy);
  vec2 ud = L > 0.001 ? upV.xy / L : vec2(0.0, 1.0), rd = vec2(ud.y, -ud.x);
  float h = aS.y * fl * mix(0.5, 1.0, L), w = aS.x * (1.0 + 0.4 * (1.0 - L));
  c.xy += rd * (position.x * w + sin(uT * 2.3 + aR * 20.0) * 0.1 * w * position.y * position.y) + ud * position.y * h;
  vR = aR; vK = aS.z; vD = -c.z; gl_Position = projectionMatrix * c; }`,
    fragmentShader: `uniform float uT, uFogD, uGain; varying vec2 vUv; varying float vR, vK, vD;\n${hellGL}
void main(){ if (vK < 0.005) discard; float x = vUv.x - 0.5, y = vUv.y, sp = 1.5 + 1.0 * vR;
  float n = hFbm3(vec2(x * 3.6 + vR * 17.0, y * 2.6 - uT * sp)), n2 = hFbm3(vec2(x * 9.0 - vR * 9.0, y * 6.0 - uT * sp * 2.1)), n3 = hVn(vec2(x * 20.0 + vR * 5.0, y * 12.0 - uT * sp * 3.0));
  float wd = 0.46 * pow(max(1.0 - y, 0.0), 0.6) * smoothstep(-0.02, 0.12, y);
  float xx = x + (n - 0.5) * 0.5 * y + sin(y * 7.0 - uT * 6.0 + vR * 30.0) * 0.05 * y;
  float e = abs(xx) / max(wd, 0.001);
  float body = 1.0 - smoothstep(0.62, 0.95, e + (n2 - 0.5) * 0.7 * y + (n3 - 0.5) * 0.15);
  float top = smoothstep(0.92, 0.55, y + (n2 - 0.5) * 0.8 * y + (n3 - 0.5) * 0.2 - (n - 0.5) * 0.35);
  float f = body * top; if (f < 0.003) discard;
  float heat = (1.0 - e * 0.8) * (1.0 - y * 0.85) * (0.6 + 0.5 * n2) + 0.12 * n3;
  vec3 col = hRamp(clamp(0.18 + heat * 0.62, 0.0, 1.0)) * 0.75 * f * vK * uGain * exp(-uFogD * uFogD * vD * vD) * mix(1.0, 0.35, smoothstep(30.0, 600.0, vD));
  gl_FragColor = vec4(col, 1.0);
${hellOUT}}` });
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 3;
  return { mesh, n, set(i, x, y, z, w, h, k) { aP.array[i * 3] = x; aP.array[i * 3 + 1] = y; aP.array[i * 3 + 2] = z; aS.array[i * 3] = w; aS.array[i * 3 + 1] = h; aS.array[i * 3 + 2] = k; },
    done(cnt) { if (cnt != null) g.instanceCount = cnt; aP.needsUpdate = true; aS.needsUpdate = true; } }; }

// ---- sparks: rising embers + a rain of falling fire streaks in a box that wraps around the camera (all in the shader)
function hellSparks(n, box) { const g = new THREE.InstancedBufferGeometry(), b = new THREE.PlaneGeometry(1, 1); g.index = b.index; g.setAttribute('position', b.attributes.position);
  const a = new Float32Array(n * 4), R = RNG('hellspk'); for (let i = 0; i < n; i++) a.set([R.f(), R.f(), R.f(), R.f()], i * 4); g.setAttribute('aP', new THREE.InstancedBufferAttribute(a, 4)); g.instanceCount = n;
  const m = hellSM({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, u: { uBox: { value: box } },
    vertexShader: `attribute vec4 aP; uniform float uT, uBox, uSpk; uniform vec3 uCam; varying vec2 vUv; varying float vA, vS;
void main(){ float s = aP.w, dir = s < 0.62 ? 1.0 : -1.0, spd = dir > 0.0 ? mix(0.8, 3.2, fract(s * 13.0)) * uSpk : mix(7.0, 16.0, fract(s * 7.0));
  vec3 p = aP.xyz * uBox; p.y += dir * spd * uT;
  if (dir > 0.0) { p.x += sin(uT * (0.7 + s) + s * 30.0) * 1.2; p.z += cos(uT * (0.6 + s) + s * 20.0) * 1.2; }
  p = mod(p - uCam + uBox * 0.5, uBox) - uBox * 0.5 + uCam;
  vec4 c = viewMatrix * vec4(p, 1.0); vec3 upV = (viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz; float L = length(upV.xy); vec2 ud = L > 0.001 ? upV.xy / L : vec2(0.0, 1.0), rd = vec2(ud.y, -ud.x);
  float dd = max(-c.z, 0.1), len = (dir > 0.0 ? 0.04 + spd * 0.03 : spd * 0.055) * max(L, 0.15), wid = max(0.02 + 0.025 * fract(s * 31.0), dd * 0.0011);
  c.xy += rd * position.x * wid + ud * position.y * max(len, wid);
  vA = smoothstep(uBox * 0.5, uBox * 0.32, length(p - uCam)) * smoothstep(0.15, 0.6, dd) * (dir > 0.0 ? 1.0 : 0.55) * (0.5 + 0.5 * sin(uT * 9.0 + s * 70.0)) * min(1.0, 0.03 / max(wid, 0.001) * 1.5);
  vS = s; vUv = position.xy + 0.5; gl_Position = projectionMatrix * c; }`,
    fragmentShader: `uniform float uSpk; varying vec2 vUv; varying float vA, vS;\n${hellGL}
void main(){ float x = (vUv.x - 0.5) * 2.0, k = exp(-x * x * 4.0) * smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
  vec3 col = hRamp(0.75 + 0.25 * fract(vS * 17.0)) * k * vA * (0.7 + 0.5 * uSpk);
  gl_FragColor = vec4(col, 1.0);
${hellOUT}}` });
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 4; return mesh; }

// ---- a smoke column: a tall camera-facing sheet of rising, curling smoke, lit orange from below
function hellSmoke(x, z, w, h, seed, o = {}) { const g = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
  const m = hellSM({ transparent: true, depthWrite: false, u: { uSeed: { value: seed }, uLit: { value: o.lit ?? 1 }, uDark: { value: o.dark ?? 1 }, uA: { value: o.a ?? 0.9 }, uFg: { value: o.abyss ? 0.25 : 0.85 } },
    vertexShader: 'varying vec2 vUv; varying vec3 vW; void main(){ vUv = position.xy + vec2(0.5, 0.0); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uT, uSeed, uFogD, uLit, uDark, uA, uFg; uniform vec3 uFogC; varying vec2 vUv; varying vec3 vW;\n${hellGL}${hellFog}
void main(){ float y = vUv.y, cx = vUv.x - 0.5;
  float n = hFbm(vec2(cx * 2.2 + uSeed, y * 3.2 - uT * 0.05)), n2 = hFbm(vec2(cx * 6.0 - uSeed * 2.0, y * 9.0 - uT * 0.13));
  float wd = 0.14 + 0.26 * y + 0.12 * smoothstep(0.8, 1.0, y);
  float e = abs(cx + (n - 0.5) * 0.45 * (0.3 + y)) / wd;
  float a = smoothstep(1.0, 0.25, e + (n2 - 0.5) * 0.6) * smoothstep(0.0, 0.05, y) * smoothstep(1.0, 0.86, y);
  vec3 col = mix(vec3(0.012, 0.008, 0.007), vec3(0.07, 0.045, 0.038), n2) * uDark;
  col += vec3(1.0, 0.3, 0.06) * exp(-y * 9.0) * 0.9 * uLit * (0.4 + n);
  col += vec3(0.6, 0.16, 0.03) * smoothstep(0.82, 1.0, y) * 0.3 * uLit;
  col += vec3(0.5, 0.12, 0.02) * (1.0 - smoothstep(0.3, 0.9, e)) * 0.0;
  float f = hFogK(length(vW - cameraPosition)) * uFg; col = mix(col, uFogC, f);
  gl_FragColor = vec4(col, a * uA * (1.0 - f * 0.5));
${hellOUT}}` });
  const s = new THREE.Mesh(g, m); s.position.set(x, o.y || -2, z); s.scale.set(w, h, 1); s.renderOrder = 2; s.frustumCulled = false; return s; }

// ---- drifting smoke clouds hanging under the roof (the camera falls through them): instanced soft billboards
function hellPuffs(spots, o = {}) { const g = new THREE.InstancedBufferGeometry(), b = new THREE.PlaneGeometry(1, 1); g.index = b.index; g.setAttribute('position', b.attributes.position);
  const a = new Float32Array(spots.length * 4); spots.forEach((s, i) => a.set(s, i * 4)); g.setAttribute('aP', new THREE.InstancedBufferAttribute(a, 4)); g.instanceCount = spots.length;
  const m = hellSM({ transparent: true, depthWrite: false, u: { uA: { value: o.a ?? 0.7 } },
    vertexShader: `attribute vec4 aP; uniform float uT; varying vec2 vUv; varying float vD, vS, vY;
void main(){ vec3 p = aP.xyz + vec3(sin(uT * 0.05 + aP.w) * 6.0, 0.0, uT * 0.8); vec4 c = viewMatrix * vec4(p, 1.0); c.xy += position.xy * aP.w; vD = -c.z; vS = fract(aP.w * 0.137 + aP.x * 0.01); vY = p.y; vUv = position.xy + 0.5; gl_Position = projectionMatrix * c; }`,
    fragmentShader: `uniform float uT, uFogD, uA; uniform vec3 uFogC; varying vec2 vUv; varying float vD, vS, vY;\n${hellGL}${hellFog}
void main(){ vec2 c = vUv * 2.0 - 1.0; float r = length(c), n = hFbm(c * 1.5 + vS * 40.0 + vec2(uT * 0.03, -uT * 0.02)), n2 = hFbm3(c * 4.0 - vS * 20.0 + uT * 0.05);
  float a = smoothstep(1.0, 0.15, r + (n - 0.5) * 0.9) * (0.55 + 0.6 * n2) * uA * smoothstep(1.0, 12.0, vD);
  vec3 col = mix(vec3(0.02, 0.012, 0.01), vec3(0.08, 0.045, 0.035), n2) + vec3(0.9, 0.25, 0.05) * clamp(0.5 - c.y * 0.6, 0.0, 1.0) * 0.18 * (1.0 - smoothstep(20.0, 160.0, vY));
  float f = hFogK(vD); col = mix(col, uFogC, f * 0.8); if (a < 0.003) discard;
  gl_FragColor = vec4(col, a * (1.0 - f * 0.6));
${hellOUT}}` });
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 1; return mesh; }
// ---- a fall of lava from a crack in the roof: a glowing ribbon, flowing down
function hellFall(x, z, w, seed) { const top = hellCeilY(x, z) - 10, g = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
  const m = hellSM({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, u: { uSeed: { value: seed } },
    vertexShader: 'varying vec2 vUv; varying vec3 vW; void main(){ vUv = position.xy + vec2(0.5, 0.0); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uT, uSeed, uFogD; varying vec2 vUv; varying vec3 vW;\n${hellGL}
void main(){ float x = vUv.x - 0.5, y = vUv.y; float s = hFbm3(vec2(x * 7.0 + uSeed, y * 6.0 + uT * 0.9)), s2 = hVn(vec2(x * 18.0 - uSeed, y * 14.0 + uT * 2.0));
  float wd = 0.32 + 0.12 * y + 0.1 * smoothstep(0.15, 0.0, y); float b = (1.0 - smoothstep(wd * 0.4, wd, abs(x + (s - 0.5) * 0.12))) ;
  float heat = b * (0.45 + 0.45 * s + 0.2 * s2);
  vec3 col = hRamp(heat) * b * (0.6 + 0.4 * smoothstep(0.0, 0.1, y)) * exp(-uFogD * uFogD * dot(vW - cameraPosition, vW - cameraPosition));
  gl_FragColor = vec4(col, 1.0);
${hellOUT}}` });
  const f = new THREE.Mesh(g, m); f.position.set(x, -1, z); f.scale.set(w, top + 1, 1); f.renderOrder = 2; f.frustumCulled = false; return f; }

// ---- the far crowd: tiny people as instanced low-poly figures; arms raised and waving, swaying, lit from below
function hellFigGeo() { const parts = [], add = (g, arm) => { g = g.toNonIndexed(); g.deleteAttribute('uv'); g.setAttribute('aArm', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(arm), 1)); parts.push(g); };
  add(new THREE.CylinderGeometry(0.19, 0.13, 0.62, 6, 1, true).translate(0, 1.12, 0), 0); add(new THREE.CylinderGeometry(0.12, 0.19, 0.08, 6, 1, true).translate(0, 1.46, 0), 0);
  [-1, 1].forEach((s) => add(new THREE.CylinderGeometry(0.07, 0.05, 0.84, 5, 1, true).translate(0.09 * s, 0.42, 0), 0));
  add(new THREE.SphereGeometry(0.11, 6, 5).translate(0, 1.6, 0), 0);
  [-1, 1].forEach((s) => add(new THREE.CylinderGeometry(0.045, 0.035, 0.64, 5, 1, true).translate(0.21 * s, 1.4 - 0.32, 0), s));
  let n = 0; parts.forEach((p) => (n += p.attributes.position.count)); const P = new Float32Array(n * 3), N = new Float32Array(n * 3), A = new Float32Array(n); let o = 0;
  parts.forEach((p) => { P.set(p.attributes.position.array, o * 3); N.set(p.attributes.normal.array, o * 3); A.set(p.attributes.aArm.array, o); o += p.attributes.position.count; });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(N, 3)); g.setAttribute('aArm', new THREE.BufferAttribute(A, 1)); return g; }
function hellFarCrowd(spots) { const base = hellFigGeo(), g = new THREE.InstancedBufferGeometry(); ['position', 'normal', 'aArm'].forEach((k) => g.setAttribute(k, base.attributes[k]));
  const n = spots.length, aO = new Float32Array(n * 4), aPh = new Float32Array(n); spots.forEach((s, i) => { aO.set([s[0], s[1], s[2], s[3]], i * 4); aPh[i] = hsh(i, 3); });
  g.setAttribute('aO', new THREE.InstancedBufferAttribute(aO, 4)); g.setAttribute('aPh', new THREE.InstancedBufferAttribute(aPh, 1)); g.instanceCount = n;
  const m = hellSM({ vertexShader: `attribute float aArm, aPh; attribute vec4 aO; uniform float uT; varying vec3 vN; varying float vH, vD, vPh;
void main(){ vec3 p = position, n = normal; float ph = aPh * 6.2831;
  if (aArm != 0.0) { vec2 pv = vec2(0.21 * aArm, 1.4); float up = fract(aPh * 3.7) < 0.8 ? 1.0 : 0.3;
    float a = aArm * (up * 2.35 + 0.25 + 0.4 * sin(uT * (2.2 + 2.5 * fract(aPh * 5.3)) + ph + aArm)); float c = cos(a), s = sin(a);
    vec2 q = p.xy - pv; p.xy = pv + vec2(c * q.x - s * q.y, s * q.x + c * q.y); n.xy = vec2(c * n.x - s * n.y, s * n.x + c * n.y); }
  float sw = 0.1 * sin(uT * (0.9 + fract(aPh * 9.1)) + ph * 2.0), c = cos(sw), s = sin(sw); p.xy = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  float cy = cos(aO.z), sy = sin(aO.z); p.xz = vec2(cy * p.x + sy * p.z, -sy * p.x + cy * p.z); n.xz = vec2(cy * n.x + sy * n.z, -sy * n.x + cy * n.z);
  vec3 w = vec3(aO.x, -0.15, aO.y) + p * aO.w; vH = p.y; vN = n; vPh = aPh;
  vec4 mv = viewMatrix * vec4(w, 1.0); vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uT, uFogD, uHeat; uniform vec3 uFogC; varying vec3 vN; varying float vH, vD, vPh;\n${hellFog}
void main(){ vec3 base = mix(vec3(0.03, 0.02, 0.018), vec3(0.09, 0.055, 0.04), fract(vPh * 11.0));
  vec3 n = normalize(vN); float up = clamp(-n.y * 0.5 + 0.5, 0.0, 1.0), low = 1.0 - smoothstep(-0.1, 1.8, vH), fl = 0.8 + 0.2 * sin(uT * 11.0 + vPh * 50.0);
  vec3 col = base + vec3(1.0, 0.3, 0.06) * (0.06 + 0.5 * low * low) * (0.4 + 0.6 * up) * fl * (0.35 + 0.65 * abs(n.x)) * (1.0 + uHeat);
  col = mix(col, uFogC, hFogK(vD));
  gl_FragColor = vec4(col, 1.0);
${hellOUT}}` });
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; return mesh; }

// ---- heaven: dark cliffs rising out of the abyss, a city of white-gold spires on the highest mesa, its light, the rays
const hellProf = (x) => { const ax = Math.abs(x), c = ss(720, 420, ax) + 0.35 * ss(260, 60, ax); return 60 + 190 * c + 30 * Math.sin(x * 0.004 + 1) + 16 * Math.sin(x * 0.017) * (1 - 0.7 * c) + 9 * Math.sin(x * 0.07 + 2) + 5 * Math.sin(x * 0.23) + 2.5 * Math.sin(x * 0.61); };
function hellRidge(z, amp, yOff, seed, dark) { const NX = 240, NY = 14, pos = [], aD = [], idx = [];
  for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) { const x = -3600 + 7200 * i / NX, top = yOff + amp * hellProf(x + seed * 400) + (seed ? 30 * Math.sin(x * 0.009 + seed) : 0), v = j / NY, y = lerp(top, -2600, v * v); pos.push(x, y, z + 40 * Math.sin(x * 0.01 + seed)); aD.push(top - y); }
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aD', new THREE.Float32BufferAttribute(aD, 1)); g.setIndex(idx);
  const m = hellSM({ fog: false, u: { uDark: { value: dark } }, vertexShader: 'attribute float aD; varying float vD2; varying vec3 vW; void main(){ vD2 = aD; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uT, uDark; varying float vD2; varying vec3 vW;\n${hellGL}
void main(){ float r = hFbm(vW.xy * vec2(0.02, 0.03)) * 0.7 + 0.3 * hFbm(vW.xy * vec2(0.006, 0.05)), r2 = hVn(vW.xy * vec2(0.05, 0.03));
  float cx = exp(-pow(vW.x / 900.0, 2.0));
  vec3 gold = vec3(1.0, 0.74, 0.38);
  vec3 col = vec3(0.035, 0.025, 0.024) * (0.3 + 1.4 * r * r) * (1.0 - uDark * 0.6);
  col += gold * exp(-vD2 / (5.0 + 9.0 * r2)) * (0.3 + 2.0 * cx) * (1.0 - uDark * 0.5);           // rim lit by heaven
  col += gold * 0.25 * cx * exp(-vD2 / 260.0) * (0.5 + r) * (1.0 - uDark * 0.7);                   // light spilling down the faces
  col = mix(col, vec3(0.12, 0.07, 0.05) * (0.4 + 0.6 * cx), 0.15 + 0.2 * (1.0 - uDark));         // aerial haze toward the light
  col *= mix(1.0, 0.03, 1.0 - exp(-vD2 / 320.0));                                                    // the gulf swallows the base
  gl_FragColor = vec4(col, 1.0);
${hellOUT}}` });
  return new THREE.Mesh(g, m); }
function hellHeaven() { const G = new THREE.Group(), HV = HELL.HV;
  G.add(hellRidge(-4100, 1.25, 120, 2, 0.0), hellRidge(HV.z, 1.0, 0, 0, 0.0), hellRidge(-2500, 0.55, -40, 5, 0.55));
  // the city: spires, towers, domes — glowing white-gold
  const R = RNG('hellcity'), n = 230, tw = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), sp = new THREE.SphereGeometry(0.5, 12, 8, 0, TAU, 0, Math.PI / 2);
  const cm = hellSM({ fog: false, vertexShader: 'varying vec3 vN; varying vec3 vW; void main(){ vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix * instanceMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uT; varying vec3 vN; varying vec3 vW;\n${hellGL}
void main(){ vec3 n = normalize(vN); float l = 0.35 + 0.65 * max(dot(n, normalize(vec3(-0.35, 0.5, 0.8))), 0.0) + 0.3 * max(n.y, 0.0); float hgt = smoothstep(${HV.y}.0, ${HV.y + 160}.0, vW.y);
  float win = step(0.55, hVn(floor(vW.xy * vec2(0.25, 0.16)) * 1.7)) * step(0.3, fract(vW.y * 0.16)) * 0.5;
  vec3 col = mix(vec3(1.0, 0.62, 0.3), vec3(1.0, 0.93, 0.8), hgt) * (0.8 + 1.6 * hgt) * l + vec3(1.0, 0.85, 0.5) * win * 2.5;
  gl_FragColor = vec4(col, 1.0);
${hellOUT}}` });
  const T = new THREE.InstancedMesh(tw, cm, n), S = new THREE.InstancedMesh(sp, cm, n);
  for (let i = 0; i < n; i++) { const x = R.n(1) * (0.15 + 0.85 * R.f()) * 380, c = Math.exp(-((x / 200) ** 2)), base = hellProf(x) - 8, w = R.r(9, 24) * (0.7 + 0.5 * c), h = (14 + R.f() * 34) * (0.5 + 1.6 * c) + (i < 6 ? 90 : 0) * c, z = HV.z - 30 + R.n(70);
    T.setMatrixAt(i, M4c(x, base, z, R.r(-0.3, 0.3), w, h, w * R.r(0.8, 1.4))); S.setMatrixAt(i, R.f() < 0.4 || i < 6 ? M4c(x, base + h - 1, z, 0, w * 0.95, w * (i < 6 ? 2.2 : 0.9), w) : _hid); }
  G.add(T, S);
  // light: halo sprites + god rays fanning down from above the city
  const halo = (sz, col, op, y = HV.y + 60) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.position.set(0, y, HV.z + 200); s.scale.set(sz, sz, 1); G.add(s); return s; };
  const halos = [halo(2200, '#ff9a40', 0.08, HV.y + 40), halo(900, '#ffd8a0', 0.1, HV.y + 120), halo(260, '#fff4e0', 0.18, HV.y + 160)];
  const rayTex = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, h, 0, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.06, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'destination-in'; const g2 = x.createLinearGradient(0, 0, w, 0); g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(0.5, 'rgba(0,0,0,1)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g2; x.fillRect(0, 0, w, h); }, 64, 256);
  const rays = []; const RR = RNG('hellrays'); for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ map: rayTex, color: i % 3 ? '#ffd890' : '#fff0d0', transparent: true, opacity: RR.r(0.03, 0.08), depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide }));
    m.position.set(RR.n(60), HV.y + 70, HV.z - 160); m.scale.set(RR.r(50, 200), RR.r(1500, 3200), 1); m.userData = { a: (i / 25 - 0.5) * 2.9 + RR.n(0.06), ph: RR.r(0, TAU), op: m.material.opacity }; m.rotation.z = m.userData.a; G.add(m); rays.push(m); }
  return { G, rays, halos }; }

// ---- the throne in the smoke: a colossal seated horned figure of black rock, lava veins, lit from below
function hellHorn(s) { const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push(new THREE.Vector3(s * (10 + 34 * u - 6 * u * u * u), 10 + 42 * u + 18 * Math.sin(u * 2.4) , -6 - 14 * u)); }
  const cur = new THREE.CatmullRomCurve3(pts), g = new THREE.TubeGeometry(cur, 24, 7, 10), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = Math.floor(i / 11) / 24, c = cur.getPointAt(Math.min(1, k)); _v.fromBufferAttribute(p, i).sub(c).multiplyScalar(1 - k * 0.92).add(c); p.setXYZ(i, _v.x, _v.y, _v.z); } g.computeVertexNormals(); return g; }
function hellDevil() { const G = new THREE.Group();
  const m = hellSM({ vertexShader: 'varying vec3 vN; varying vec3 vW; varying vec3 vL; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vL = position; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uT, uFogD; uniform vec3 uFogC; varying vec3 vN; varying vec3 vW; varying vec3 vL;\n${hellGL}${hellFog}
void main(){ vec3 n = normalize(vN); float up = clamp(-n.y * 0.6 + 0.4, 0.0, 1.0), h = vW.y;
  vec3 v = hVor(vec2(vW.x + vW.z, vW.y) * 0.05, 0.0); float vein = (1.0 - smoothstep(0.0, 0.05, v.x)) * smoothstep(0.7, 0.85, hVn(vW.xy * 0.02 + vW.z * 0.01));
  vec3 col = vec3(0.006, 0.004, 0.004) * (0.6 + hFbm(vW.xy * 0.08));
  col += vec3(1.0, 0.26, 0.05) * up * exp(-h / 70.0) * 2.2 + vec3(1.0, 0.35, 0.08) * pow(1.0 - abs(dot(n, normalize(cameraPosition - vW))), 6.0) * 0.5 * exp(-h / 200.0);                                // lava light from below
  col += vec3(0.5, 0.12, 0.03) * up * 0.08;
  col += hRamp(0.55 + 0.1 * sin(uT * 1.7 + v.y * 20.0)) * vein * exp(-h / 25.0);
  col = mix(col, uFogC * 0.6, hFogK(length(vW - cameraPosition)) * 0.1);
  gl_FragColor = vec4(col, 1.0);
${hellOUT}}` });
  const add = (g, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => { const k = new THREE.Mesh(g, m); k.position.set(x, y, z); k.scale.set(sx, sy, sz); k.rotation.set(rx, ry, rz); G.add(k); return k; };
  // throne: a slab back with two spires, arms, a stepped base
  add(lumpyGeo(3, 0.12, 31), 0, 20, -10, 120, 30, 70); add(lumpyGeo(3, 0.1, 32), 0, 110, -48, 95, 120, 22);
  [-1, 1].forEach((s) => add(new THREE.ConeGeometry(14, 120, 7), s * 78, 200, -50, 1, 1, 1, 0, 0, -s * 0.12));
  // the figure: legs, torso, shoulders, arms resting, head, horns
  
  add(lumpyGeo(3, 0.14, 44), 0, 100, -12, 42, 55, 26); add(lumpyGeo(2, 0.12, 45), 0, 140, -14, 60, 18, 26);
  [-1, 1].forEach((s) => { add(lumpyGeo(2, 0.12, 46 + s), s * 56, 110, -10, 13, 34, 14, 0, 0, s * 0.25); add(lumpyGeo(2, 0.12, 48 + s), s * 60, 78, 6, 9, 9, 26); });
  const head = new THREE.Group(); head.position.set(0, 168, -6); G.add(head); const hk = new THREE.Mesh(lumpyGeo(3, 0.12, 50), m); hk.scale.set(17, 21, 18); head.add(hk);
  const jaw = new THREE.Mesh(lumpyGeo(2, 0.1, 51), m); jaw.position.set(0, -12, 6); jaw.scale.set(12, 9, 11); head.add(jaw);
  [-1, 1].forEach((s) => { const hn = new THREE.Mesh(hellHorn(s), m); head.add(hn); });
  const eyes = [-1, 1].map((s) => { const e = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ff8a30', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false })); e.position.set(s * 6.5, 2, 18); e.scale.set(14, 7, 1); head.add(e); return e; });
  const back = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ff6a20', transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); back.position.set(0, 120, -120); back.scale.set(520, 420, 1); G.add(back);
  return { G, head, eyes }; }

// ---- hero people: tattered, sooty clothes; posed by each shot
const HELL_TOPS = ['#3a2c24', '#4a3a30', '#2a221e', '#5a4434', '#3c3230', '#6a5240', '#463026', '#584a40'], HELL_BOTS = ['#241c18', '#2e2622', '#3a2e26', '#1c1816'];
function hellHeroes(st) { const R = RNG('hellheroes'), L = [];
  const mk = (f, o) => { const P = f(R, Object.assign({ top: R.pick(HELL_TOPS), bottom: R.pick(HELL_BOTS), sleeve: R.f() < 0.6 ? 'short' : 'long' }, o)); P.root.visible = false; st.scene.add(P.root); L.push(P); return P; };
  mk(man, { skin: '#c89070', hairStyle: 'short', hair: '#2a1d16', top: '#4a3a30', seed: 11 }); mk(woman, { skin: '#d4a07a', hairStyle: 'long', hair: '#3a2418', seed: 12 }); mk(man, { skin: '#8a5a3a', hairStyle: 'curly', seed: 13 });
  mk(woman, { skin: '#e8bb94', hairStyle: 'bob', hair: '#7a5230', seed: 14 }); mk(man, { skin: '#b07a54', hairStyle: 'none', seed: 15 }); mk(woman, { skin: '#b07a54', hairStyle: 'curly', hair: '#1a1a1a', seed: 16 });
  mk(man, { skin: '#d4a07a', hairStyle: 'short', hair: '#4a3020', seed: 17 }); mk(man, { skin: '#5e3a26', hairStyle: 'short', hair: '#1a1a1a', seed: 18 });
  return L; }
// a hero in terror: arms up (or reaching), screaming, trembling. q: x, z, yaw, reach (0 up .. 1 reach forward), k (panic), head pitch...
function hellPose(P, q) { const t = TT + (P.seed % 7), k = q.k ?? 1, tr = Math.sin(t * 13) * 0.05 * k, sw = Math.sin(t * 1.7) * 0.08 * k;
  const reach = q.reach || 0, fwd = lerp(2.75, 1.55, reach), out = lerp(0.42, 0.12, reach);
  const arm = (s) => [fwd + 0.18 * Math.sin(t * 3.1 + s) * k + tr, out + 0.1 * Math.sin(t * 2.3 + s * 2), lerp(0.55, 0.15, reach) + 0.25 * Math.sin(t * 2.7 + s) * k, 0];
  posePerson(P, { x: q.x, y: q.y || 0, z: q.z, yaw: q.yaw, lean: (q.lean ?? -0.08) + 0.05 * Math.sin(t * 2.1), sway: sw, twist: 0.15 * Math.sin(t * 1.3) * k, kneel: q.kneel || 0,
    headPitch: (q.hp ?? -0.35) + 0.08 * Math.sin(t * 2.9), headYaw: (q.hy || 0) + 0.12 * Math.sin(t * 1.9), headRoll: 0.1 * Math.sin(t * 1.4),
    armL: q.armL || arm(-1), armR: q.armR || arm(1), look: q.look || [0, 0.3], emo: Object.assign({ fear: 1, open: 0.75 + 0.25 * Math.sin(t * 4.0), cry: 0.6, tremble: 1, surprise: 0.3 }, q.emo || {}) });
  P.root.visible = true; }

// ---- the world
function hellWorld() { return once('hellWorld', () => {
  const st = makeStage({ fov: 50, far: 20000, hemi: 0.55, sky: 0x4a2014, ground: 0xff6a24, key: 1.0, keyCol: '#ffa050', box: 14, boxFar: 120, sunDist: 50 });
  st.cam.near = 0.08; st.cam.updateProjectionMatrix(); st.scene.fog = new THREE.FogExp2(HELL_U.uFogC.value.clone(), 0.0009); st.scene.background = HELL_U.uFogC.value.clone();
  r3().r.shadowMap.enabled = true;
  const S = st.scene, W0 = { st };
  W0.sky = hellSky(); S.add(W0.sky);
  W0.lake = hellLake(); S.add(W0.lake); W0.roof = hellRoof(); S.add(W0.roof); W0.cliff = hellCliff(); S.add(W0.cliff);
  W0.heaven = hellHeaven(); S.add(W0.heaven.G);
  W0.devil = hellDevil(); W0.devil.G.position.copy(HELL.D); W0.devil.G.scale.setScalar(1.45); W0.devil.G.rotation.y = Math.atan2(HELL.L.x - HELL.D.x, HELL.L.z - HELL.D.z); S.add(W0.devil.G);
  // crowds: spots around L and E (mid = makeCrowd people, far = shader figures), flames on most of them, more on the lake
  const R = RNG('hellcrowd'), farSpots = [], midA = [], midB = [];
  const ring = (c, n, r0, r1, out, edge) => { for (let i = 0; i < n; i++) { const a = R.f() * TAU, r = lerp(r0, r1, R.f() ** 0.85), x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r; if (edge && z < hellEdgeZ(x) + 2.5) continue; out.push([x, z, R.f() * TAU, R.r(0.88, 1.08)]); } };
  ring(HELL.L, 1500, 2.4, 70, midA, false); ring(HELL.E, 1300, 2.4, 70, midB, true);
  ring(HELL.L, 34000, 55, 2600, farSpots, true); ring(HELL.E, 16000, 55, 1400, farSpots, true); ring(HELL.D, 6000, 30, 600, farSpots, false);
  W0.far = hellFarCrowd(farSpots); S.add(W0.far);
  const tops = ['#5a4434', '#3a2c24', '#6a5444', '#4a3a30', '#2a221e', '#7a6050', '#3a3030', '#5a3a2a'];
  W0.cA = makeCrowd(midA.length, { seed: 31, tops }); W0.cB = makeCrowd(midB.length, { seed: 32, tops }); W0.midA = midA; W0.midB = midB; S.add(W0.cA.grp, W0.cB.grp);
  const fl = []; const flame = (x, z, s) => fl.push([x, z, s]);
  [...midA, ...midB].forEach((p, i) => { if (hsh(i, 21) < 0.85) flame(p[0] + R.n(0.4), p[1] + R.n(0.4), R.r(0.7, 1.4)); if (hsh(i, 22) < 0.4) flame(p[0] + R.n(0.9), p[1] + R.n(0.9), R.r(0.4, 0.9)); });
  farSpots.forEach((p, i) => { if (hsh(i, 23) < 0.75) flame(p[0] + R.n(0.5), p[1] + R.n(0.5), R.r(0.8, 1.6)); });
  for (let i = 0; i < 9000; i++) { const a = R.f() * TAU, r = lerp(5, 3000, R.f() ** 1.4), x = HELL.L.x + Math.cos(a) * r, z = HELL.L.z + Math.sin(a) * r * 1.3; if (z > hellEdgeZ(x) + 3) flame(x, z, R.r(0.8, 3.5)); }
  for (let i = 0; i < 1400; i++) { const a = R.f() * TAU, r = R.r(5, 300) * (i < 500 ? 0.5 : 1); flame(HELL.D.x + Math.cos(a) * r, HELL.D.z + Math.sin(a) * r, i < 500 ? -R.r(18, 45) : -R.r(6, 22)); }
  W0.fField = hellFlames(fl.length, { seed: 1 }); fl.forEach(([x, z, s], i) => { const big = s < 0; s = Math.abs(s); W0.fField.set(i, x, -0.1, z, s * 0.9, s * 1.9, R.r(0.55, 1.0) * (big ? 5 : 1)); }); W0.fField.done(); S.add(W0.fField.mesh);
  W0.fNear = hellFlames(500, { dyn: true, seed: 2 }); S.add(W0.fNear.mesh);
  W0.fHero = makeFlames(S, 220, { seed: 9 }); W0.fHeroN = 0; W0.bSmoke = makeSmoke(S, 60, { opacity: 0.8, seed: 4 });
  W0.sparks = hellSparks(9000, 70); S.add(W0.sparks);
  // smoke columns rising forever (to the roof), falls of lava from the roof
  W0.smoke = []; const RS = RNG('hellsmoke');
  for (let i = 0; i < 26; i++) { const a = RS.r(-1.2, 1.2) + (i % 3 === 0 ? Math.PI * 0.5 : 0) * (i % 2 ? 1 : -1), r = RS.r(180, 1600), x = HELL.L.x + Math.sin(a) * r, z = HELL.L.z + Math.cos(a) * r; const s = hellSmoke(x, z, RS.r(70, 160), hellCeilY(x, z) + 10, RS.r(0, 50)); S.add(s); W0.smoke.push(s); }
  [[0.83, 0.56, 150, 70], [0.95, 0.3, 260, 110]].forEach(([dx, dz, r, wd], i) => { const x = HELL.L.x + dx * r, z = HELL.L.z + dz * r, sm = hellSmoke(x, z, wd, hellCeilY(x, z) + 10, 7 + i * 13); S.add(sm); W0.smoke.push(sm); });
  { const dl = new THREE.Vector3().subVectors(HELL.L, HELL.D).setY(0).normalize(); for (let i = 0; i < 7; i++) { const sd = i % 2 ? 1 : -1, back = RS.r(160, 420), side = sd * RS.r(120, 460), x = HELL.D.x - dl.x * back + dl.z * side, z = HELL.D.z - dl.z * back - dl.x * side; const sm = hellSmoke(x, z, RS.r(120, 220), hellCeilY(x, z) + 10, RS.r(0, 50), { a: 0.75 }); S.add(sm); W0.smoke.push(sm); } }
  for (let i = 0; i < 6; i++) { const x = RS.n(1400), z = -1500 - RS.r(0, 1200); const s = hellSmoke(x, z, RS.r(180, 380), 2400, RS.r(0, 50), { y: -2200, lit: 0.0, a: 0.4, abyss: 1 }); s.position.z = -1350 - RS.r(0, 900); S.add(s); W0.smoke.push(s); }
  { const RP = RNG('hellpuff'), sp = []; for (let i = 0; i < 70; i++) sp.push([HELL.L.x + RP.n(260), RP.r(26, 150), HELL.L.z - 380 + RP.r(0, 600), RP.r(40, 130)]); for (let i = 0; i < 60; i++) { const a = RP.f() * TAU, r = RP.r(300, 2200); sp.push([HELL.L.x + Math.sin(a) * r, RP.r(90, 165), HELL.L.z + Math.cos(a) * r, RP.r(150, 400)]); } W0.puffs = hellPuffs(sp); S.add(W0.puffs); }
  W0.falls = []; [[-420, 1300, 18], [380, 1900, 26], [900, 900, 12], [-1100, 2300, 30], [150, 2900, 34], [-760, 700, 10], [1400, 1500, 22], [-160, 1050, 9]].forEach(([x, z, w], i) => { const f = hellFall(x, z, w, i * 3.1); S.add(f); W0.falls.push(f); });
  // lights near the heroes (flicker), heroes, a hand
  W0.pl = [0, 1, 2].map(() => { const p = new THREE.PointLight('#ff7a2a', 0, 9, 2); S.add(p); return p; }); W0.handL = new THREE.PointLight('#ffc8a0', 0, 3, 2); st.cam.add(W0.handL); W0.handL.position.set(-0.3, -0.1, 0.1);
  W0.heroes = hellHeroes(st);
  W0.hand = makeHand(1, { skin: '#d8a888' }); st.cam.add(W0.hand.root); W0.hand.root.visible = false;
  { const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.068, 0.7, 20, 6, true).translate(0, -0.6, 0), STDm({ color: '#2a201c', roughness: 0.95, side: THREE.DoubleSide, map: texNoise('hellsleeve', '#6a5a50', ['#3a302a', '#8a7a70', '#1a1412'], 9000) }));
    W0.hand.fore.add(sl); }
  const dropTex = g3Tex((x, w, h) => { const cx = w / 2, cy = h * 0.66, r = w * 0.36; x.beginPath(); x.moveTo(cx, h * 0.04); x.bezierCurveTo(cx + r * 0.25, cy - r * 1.3, cx + r, cy - r * 0.6, cx + r, cy); x.arc(cx, cy, r, 0, Math.PI); x.bezierCurveTo(cx - r, cy - r * 0.6, cx - r * 0.25, cy - r * 1.3, cx, h * 0.04); x.closePath();
    const g = x.createRadialGradient(cx + r * 0.1, cy + r * 0.25, r * 0.1, cx, cy, r * 1.3); g.addColorStop(0, '#f4fcff'); g.addColorStop(0.45, '#9fd4f4'); g.addColorStop(0.85, '#3a78b0'); g.addColorStop(1, '#16304e'); x.fillStyle = g; x.fill();
    x.save(); x.clip(); x.fillStyle = 'rgba(255,150,60,0.55)'; x.beginPath(); x.ellipse(cx, cy + r * 0.95, r * 0.8, r * 0.3, 0, 0, TAU); x.fill(); x.restore();
    x.fillStyle = 'rgba(255,255,255,0.95)'; x.beginPath(); x.ellipse(cx - r * 0.38, cy - r * 0.35, r * 0.16, r * 0.3, -0.5, 0, TAU); x.fill(); x.lineWidth = 2; x.strokeStyle = 'rgba(20,40,70,0.7)'; x.stroke(); }, 128, 192);
  W0.drop = new THREE.Sprite(new THREE.SpriteMaterial({ map: dropTex, transparent: true, depthWrite: false, fog: false })); W0.drop.renderOrder = 6; S.add(W0.drop); W0.drop.visible = false;
  W0.dropGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#9fd8ff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); S.add(W0.dropGlow);
  W0.dropCore = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffffff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); S.add(W0.dropCore);
  W0.steam = []; for (let i = 0; i < 26; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#e8e4e2', transparent: true, depthWrite: false, opacity: 0 })); s.renderOrder = 7; S.add(s); W0.steam.push(s); }
  W0.heavLight = new THREE.DirectionalLight('#ffe4b0', 0); W0.heavLight.position.set(0, 300, -3000); S.add(W0.heavLight, W0.heavLight.target);
  return W0; }); }

// per-frame world state. o: { c: camera centre for the mid crowd ('A' | 'B' | null), heat, spk, fog }
function hellTick(w, t, o = {}) { const cam = w.st.cam; HELL_U.uT.value = t; HELL_U.uHeat.value = o.heat || 0; HELL_U.uSpk.value = o.spk ?? 1; HELL_U.uCam.value.copy(cam.position); HELL_U.uFogD.value = o.fog ?? 0.0009; w.st.scene.fog.density = HELL_U.uFogD.value;
  w.sky.position.copy(cam.position);
  w.smoke.forEach((s) => (s.rotation.y = Math.atan2(cam.position.x - s.position.x, cam.position.z - s.position.z)));
  w.falls.forEach((s) => (s.rotation.y = Math.atan2(cam.position.x - s.position.x, cam.position.z - s.position.z)));
  w.bSmoke.update(t, w.st.cam.position, 1, 1, 0); w.heaven.rays.forEach((r) => { r.rotation.z = r.userData.a + 0.05 * Math.sin(t * 0.3 + r.userData.ph); r.material.opacity = r.userData.op * (0.7 + 0.3 * Math.sin(t * 0.7 + r.userData.ph)); });
  // mid crowds: writhing, arms up, swaying
  [['A', w.cA, w.midA], ['B', w.cB, w.midB]].forEach(([k, C, sp]) => { C.grp.visible = o.c === k || o.c === 'AB'; if (!C.grp.visible) return; const ex = o.exclude || [];
    sp.forEach((p, i) => { let gone = 0; for (const e of ex) if ((p[0] - e[0]) ** 2 + (p[1] - e[1]) ** 2 < e[2] * e[2]) gone = 1; const ph = hsh(i, 5) * TAU; C.set(i, p[0], -0.12, p[1], p[2] + 0.3 * Math.sin(t * 0.7 + ph), p[3], hsh(i, 6) < 0.8 ? 0.85 + 0.15 * Math.sin(t * 2 + ph) : 0.2, 0.12 * Math.sin(t * (1 + hsh(i, 8)) + ph), gone); }); C.done(); });
  w.heroes.forEach((P) => (P.root.visible = false)); w.hand.root.visible = false; w.drop.visible = false; w.dropGlow.material.opacity = 0; w.steam.forEach((s) => (s.material.opacity = 0));
  hellNear(w, []); w.fNear.done(0); w.pl.forEach((p) => (p.intensity = 0)); w.handL.intensity = 0; w.dropCore.material.opacity = 0; w.heavLight.intensity = 0; w.devil.eyes.forEach((e) => (e.material.opacity = 0)); }
// near flames for this frame: list of [x, y, z, w, h, k]
function hellNear(w, list) { const F = w.fHero, n = Math.min(list.length, 220); for (let i = 0; i < Math.max(n, w.fHeroN); i++) { if (i < n) { const [x, y, z, wd, h, k] = list[i]; F.set(i, x, y, z, h, wd, Math.min(1, k)); } else F.set(i, 0, -50, 0, 0, 0, 0); } w.fHeroN = n; F.done(); }
function hellLights(w, pts, t) { pts.forEach((p, i) => { const L = w.pl[i]; L.position.set(p[0], p[1], p[2]); L.intensity = p[3] * (0.8 + 0.2 * Math.sin(t * 17 + i * 3) + 0.1 * Math.sin(t * 29 + i)); L.distance = p[4] || 9; }); }
function hellKey(w, dir, target, k, col = '#ffa050') { w.st.setSun(dir, target); w.st.key.intensity = k; w.st.key.color.set(col); }
// flames around a person's legs (burning) and a ring of flames
function hellBurn(list, x, z, k = 1, n = 4, seed = 0) { for (let j = 0; j < n; j++) { const a = hsh(seed, j + 1) * TAU, r = 0.18 + 0.3 * hsh(seed, j + 9); list.push([x + Math.cos(a) * r, -0.05, z + Math.sin(a) * r, 0.5 + 0.4 * hsh(seed, j + 17), (0.9 + 0.9 * hsh(seed, j + 25)) * k, 0.9]); } }
// a dark band behind the captions (the lower third burns bright)
function hellBand(a = 0.3) { if (a <= 0) return; ctx.save(); screen(); const g = ctx.createRadialGradient(CX, 1370, 40, CX, 1370, 560); g.addColorStop(0, `rgba(14,6,3,${a})`); g.addColorStop(0.55, `rgba(14,6,3,${a * 0.6})`); g.addColorStop(1, 'rgba(14,6,3,0)'); ctx.translate(0, 1370); ctx.scale(1, 0.42); ctx.translate(0, -1370); ctx.fillStyle = g; ctx.fillRect(0, 700, W, 1340); ctx.restore(); }
function hellPost(b = 0.55, band = 0.3) { bloom(b); hellBand(band); }
const hellAt = (v, y = 0) => new THREE.Vector3(HELL.L.x + v[0], y + (v[1] || 0), HELL.L.z + v[2]);

// =====================================================================
//  SHOTS
// =====================================================================
// lake (18–26): from high above, descending over the lake of fire toward the crowd
SHOT_FN.lake = (lt, dur, t) => { const w = hellWorld(), st = w.st, L = HELL.L, u = lt / dur;
  const y = knots([[0, 112], [2.5, 88], [4.5, 48], [6.5, 14], [8, 4.2]], lt), z = L.z + knots([[0, -330], [3, -230], [6, -70], [8, -9]], lt), x = 8 * Math.sin(lt * 0.4);
  const pitch = knots([[0, -64], [2.5, -44], [5, -22], [7, -8], [8, -4]], lt) * DEG, yaw = knots([[0, 0.12], [8, -0.05]], lt);
  camPt(st, [x, y, z], [x + Math.sin(yaw) * 100, y + Math.tan(pitch) * 100, z + Math.cos(yaw) * 100], knots([[0, 58], [8, 52]], lt), t, 0.8, 3); st.cam.rotation.z += 0.05 * Math.sin(lt * 0.5);
  if (CAMONLY) return renderStage(st);
  hellTick(w, t, { c: 'A', fog: 0.0008 });
  hellKey(w, dirV(0.3, 0.5), L, 0.6);
  renderStage(st, 1.05); hellPost(0.7, 0.25); };

// crowd (26–31): you land among them: first person, burning figures all around; a screaming man turns to you
SHOT_FN.crowd = (lt, dur, t) => { const w = hellWorld(), st = w.st, L = HELL.L, [P0, P1, P2, P3, P4] = w.heroes;
  const turn = ss(1.3, 2.4, lt), yaw = lerp(0.1, -0.16, ss(0, 2.4, lt)) + 0.1 * ss(3, 5, lt), drop = (1 - ss(0, 0.5, lt)) * 1.2;
  const ey = 1.62 + drop + 0.03 * Math.sin(lt * 7), pitch = lerp(-6, -3, ss(0, 1, lt)) * DEG - 0.1 * (1 - ss(0, 0.6, lt));
  camPt(st, [L.x, ey, L.z], [L.x + Math.sin(yaw) * 10, ey + Math.tan(pitch) * 10, L.z + Math.cos(yaw) * 10], 54, t, 2.2, 5);
  if (CAMONLY) return renderStage(st);
  hellTick(w, t, { c: 'A', exclude: [[L.x, L.z, 6.5]] });
  const hx = L.x - 0.65, hz = L.z + 2.4;
  hellPose(P0, { x: hx, z: hz, yaw: lerp(-0.35, Math.PI - 0.12, turn), reach: turn * 0.9, hp: lerp(-0.5, 0.05, turn), hy: lerp(-0.4, 0, turn), look: [0, 0.1], emo: { fear: 1, open: 0.9 + 0.1 * Math.sin(t * 5), cry: 0.8, surprise: 0.6 } });
  hellPose(P1, { x: L.x + 1.5, z: L.z + 3.4, yaw: -0.6 + Math.PI, hp: -0.55 });
  hellPose(P2, { x: L.x - 2.1, z: L.z + 4.6, yaw: Math.PI + 0.5, hp: -0.4 });
  hellPose(P3, { x: L.x + 0.5, z: L.z + 6.5, yaw: -0.2, hp: -0.6 });
  hellPose(P4, { x: L.x - 3.6, z: L.z + 2.6, yaw: Math.PI - 1.1, reach: 0.3, hp: -0.3 });
  const nf = []; hellBurn(nf, hx, hz, 1.1, 5, 1); hellBurn(nf, L.x + 1.5, L.z + 3.4, 1.2, 4, 2); hellBurn(nf, L.x - 2.1, L.z + 4.6, 1.3, 4, 3); hellBurn(nf, L.x + 0.5, L.z + 6.5, 1.5, 4, 4); hellBurn(nf, L.x - 3.6, L.z + 2.6, 1.2, 4, 5);
  nf.push([L.x + 0.62, -0.1, L.z + 0.95, 0.7, 1.25, 0.8], [L.x - 0.75, -0.1, L.z + 1.0, 0.6, 1.05, 0.75], [L.x + 0.2, -0.1, L.z + 1.2, 0.5, 0.7, 0.6]);
  hellNear(w, nf); hellLights(w, [[hx, 0.3, hz - 0.45, 2.2, 4], [L.x + 1, 0.4, L.z + 3, 2, 6], [L.x + 0.3, 0.3, L.z + 0.6, 1.2, 3]], t);
  hellKey(w, new THREE.Vector3(-0.3, 0.35, -1), new THREE.Vector3(hx, 1, hz), 0.7);
  renderStage(st, 0.88); hellPost(0.5, 0.35); };

// water (37–43): your hand reaches up to the glowing roof; a drop forms, falls … and boils away before it reaches you
SHOT_FN.water = (lt, dur, t) => { const w = hellWorld(), st = w.st, L = HELL.L, H0 = w.hand;
  const pitch = lerp(46, 52, ss(0, 6, lt)) * DEG, yaw = -0.04 + 0.03 * Math.sin(lt * 0.3), ey = 1.65;
  camPt(st, [L.x, ey, L.z], [L.x + Math.sin(yaw) * 10, ey + Math.tan(pitch) * 10, L.z + Math.cos(yaw) * 10], 50, t, 1.4, 7);
  if (CAMONLY) return renderStage(st);
  hellTick(w, t, { c: 'A', exclude: [[L.x, L.z, 2]] });
  // the hand: rises, strains, trembles; clenches when the drop is gone
  const gone = ss(4.1, 4.9, lt), reach = ss(0, 1.4, lt) * (1 - 0.25 * gone) + 0.12 * ss(2.4, 3.8, lt), tr = 0.6 + 0.4 * ss(2, 4, lt);
  H0.root.visible = true; H0.root.position.set(0.15 - 0.03 * reach, -0.4 + 0.22 * reach + 0.004 * Math.sin(t * 19) * tr, -0.46 - 0.04 * reach); H0.root.rotation.set(-0.5 - 0.25 * reach, 2.2, -0.22 + 0.03 * Math.sin(t * 2));
  poseHand(H0, { curl: [0.12 + 0.6 * gone, 0.08 + 0.65 * gone, 0.14 + 0.7 * gone, 0.2 + 0.7 * gone], spread: 0.9 - 0.6 * gone, thumb: 0.15 + 0.4 * gone, wristPitch: -0.25 + 0.1 * Math.sin(t * 1.3), tremble: tr * 2.5 });
  // the drop: forms at a crack (38.5), falls (39.4), boils away (≈40.9)
  w.handL.intensity = 0.9; const P0 = new THREE.Vector3(L.x - 2.5, 0, L.z + 66); P0.y = hellCeilY(P0.x, P0.z) - 16; const tf = 2.5, te = 3.95, Y1 = 96, form = ss(0.9, 2.5, lt), fall = clamp((lt - tf) / (te - tf));
  const yy = P0.y - (P0.y - Y1) * fall * fall, sz = 8.5 * (0.35 + 0.65 * form) * (1 - 0.25 * fall);
  if (lt > 0.9 && lt < te) { const D = w.drop; D.visible = true; D.position.set(P0.x, yy, P0.z); D.center.set(0.5, lt < tf ? 0.97 : 0.6); D.scale.set(sz * 0.66, sz * (lt < tf ? 1 + 0.5 * form : 1.1), 1); D.material.opacity = Math.min(1, form * 1.5);
    w.dropGlow.position.set(P0.x, yy - (lt < tf ? sz * 0.6 : 0), P0.z); w.dropGlow.scale.setScalar(sz * 5); w.dropGlow.material.opacity = 0.6 * form; }
  const se = clamp((lt - te) / 1.7); if (se > 0 && se < 1) { w.steam.forEach((s, i) => { const a = hsh(i, 41) * TAU, b = hsh(i, 42), rr = (3 + 22 * b) * Math.sqrt(se); s.position.set(P0.x + Math.cos(a) * rr, Y1 + 12 * se * (0.5 + b) + Math.sin(a) * rr * 0.5, P0.z + Math.sin(a) * rr * 0.6); s.scale.setScalar((10 + 26 * b) * (0.35 + se)); s.material.opacity = 0.75 * (1 - se) ** 1.5 * (0.4 + 0.6 * b); });
    w.dropCore.position.set(P0.x, Y1, P0.z); w.dropCore.scale.setScalar(26 * (0.3 + se)); w.dropCore.material.opacity = 0.9 * (1 - ss(0, 0.3, se)); }
  const nf = []; hellBurn(nf, L.x - 1.5, L.z + 2.5, 1.4, 4, 7); hellBurn(nf, L.x + 1.8, L.z + 2.2, 1.4, 4, 8); hellNear(w, nf);
  hellLights(w, [[L.x + 0.3, 1.0, L.z + 0.1, 1.6, 3]], t);
  renderStage(st, 1.0); if (se > 0 && se < 0.25) pvTint('#fff4e8', 0.18 * (1 - se / 0.25), 'screen'); hellPost(0.65, 0.3); };

// heaven (43–49): across the chasm, heaven far away; people reaching toward it; the bottomless gap between
SHOT_FN.heaven = (lt, dur, t) => { const w = hellWorld(), st = w.st, E = HELL.E, [P0, P1, P2, P3, P4] = w.heroes;
  const g = ss(3.0, 5.9, lt), ez0 = hellEdgeZ(0), cz = lerp(E.z - 6 * ss(0, 3.2, lt), ez0 + 3.5, g), ey = 1.7 + 0.5 * g, tilt = lerp(lerp(4.6, 5.6, ss(0, 3, lt)), -27, g) * DEG, yaw = 0.02 * Math.sin(lt * 0.4) - 0.3 * g;
  camPt(st, [E.x + 0.3, ey, cz], [E.x + 0.3 - Math.sin(yaw) * 100, ey + Math.tan(tilt) * 100, cz - Math.cos(yaw) * 100], lerp(34, 60, g), t, 1.0, 9);
  if (CAMONLY) return renderStage(st);
  hellTick(w, t, { c: 'B', exclude: [[E.x, E.z, 7], [E.x, E.z - 12, 7], [E.x, E.z - 24, 7]], fog: 0.0008 });
  const ez = hellEdgeZ(0);
  hellPose(P1, { x: E.x - 0.9, z: E.z - 5.5, yaw: Math.PI + 0.1, reach: 0.25, hp: 0.15, k: 0.6, emo: { fear: 0.4, cry: 1, open: 0.4 } });
  hellPose(P0, { x: E.x + 1.5, z: E.z - 8, yaw: Math.PI - 0.15, reach: 0.15, hp: 0.15, k: 0.6 });
  hellPose(P3, { x: E.x - 3.4, z: E.z - 20, yaw: Math.PI + 0.2, reach: 0.2, hp: 0.1, k: 0.6 });
  hellPose(P2, { x: E.x + 1.0, z: ez + 2.2, yaw: Math.PI, reach: 0.3, kneel: 1, hp: 0.15, k: 0.5 });
  hellPose(P4, { x: E.x - 2.2, z: ez + 2.6, yaw: Math.PI - 0.3, reach: 0.1, hp: 0.15, k: 0.6 });
  const nf = []; [[-0.9, E.z - 5.5], [1.5, E.z - 8], [-3.4, E.z - 20], [1.0, ez + 2.2], [-2.2, ez + 2.6]].forEach(([x, z], i) => hellBurn(nf, E.x + x, z, 1.0 + 0.1 * i, 4, 11 + i)); hellNear(w, nf);
  hellKey(w, new THREE.Vector3(0, 0.25, -1), new THREE.Vector3(E.x, 1, E.z - 12), 0.9, '#ffd9a0');
  hellLights(w, [[E.x, 0.4, E.z - 7, 3, 9]], t);
  renderStage(st, 1.0); hellPost(0.7, 0.3); };

// rest (49–55): the crowd under endless smoke columns; no rest; the camera drifts; looks up at the smoke
SHOT_FN.rest = (lt, dur, t) => { const w = hellWorld(), st = w.st, L = HELL.L, [P0, P1, P2, P3, P4, P5, P6, P7] = w.heroes;
  const cx = L.x - 2 + 3.2 * ss(0, 6, lt), cz = L.z + 1.5 * ss(0, 6, lt), ey = 1.75 + 0.4 * ss(0, 6, lt), yaw = (62 - 8 * ss(0, 6, lt)) * DEG, pitch = lerp(2, 30, ss(3.2, 5.8, lt)) * DEG;
  camPt(st, [cx, ey, cz], [cx + Math.sin(yaw) * 10, ey + Math.tan(pitch) * 10, cz + Math.cos(yaw) * 10], 52, t, 1.2, 11);
  if (CAMONLY) return renderStage(st);
  hellTick(w, t, { c: 'A', exclude: [[cx, cz, 9]] });
  const sp = [[3.5, 2.5, 0], [5.5, 5.5, 1], [2.2, 5.2, 2], [7.5, 2.0, 3], [6.2, 8.5, 4]], nf = [];
  [P6, P1, P7, P5, P4].forEach((P, i) => { const [dx, dz] = sp[i], x = L.x + dx, z = L.z + dz, tw = Math.sin(t * 1.5 + i);
    hellPose(P, { x, z, yaw: Math.atan2(cx - x, cz - z) + 0.6 * tw + (i === 2 ? Math.PI : 0), kneel: i === 1 ? 1 : 0, hp: -0.4 + 0.25 * tw, reach: i === 3 ? 0.4 : 0,
      armL: i === 0 ? [2.9, 0.35, 2.2 + 0.2 * tw, 0] : undefined, armR: i === 0 ? [2.9, 0.35, 2.3 - 0.2 * tw, 0] : undefined, k: 1.2 });
    hellBurn(nf, x, z, 1.3, 4, 20 + i); });
  hellNear(w, nf); hellLights(w, [[L.x + 3.5, 0.4, L.z + 2.5, 6, 7], [L.x + 5.5, 0.4, L.z + 5.5, 6, 7]], t);
  hellKey(w, new THREE.Vector3(-0.5, 0.4, 0.6), L, 1.2);
  renderStage(st, 1.0); hellPost(0.6, 0.32); };

// devil (55–57.8): far away in the smoke, the colossal throne, lit from below; the crowd tiny beneath it
SHOT_FN.devil = (lt, dur, t) => { const w = hellWorld(), st = w.st, L = HELL.L, D = HELL.D;
  const cp = [L.x - 20, 2.0, L.z + 30], tg = [D.x, 175 + 15 * ss(0, 2.8, lt), D.z];
  camPt(st, cp, tg, lerp(30, 26, ss(0, 2.8, lt)), t, 0.5, 13);
  if (CAMONLY) return renderStage(st);
  hellTick(w, t, { c: 'A', fog: 0.00062 });
  w.devil.eyes.forEach((e) => (e.material.opacity = 0.9 + 0.1 * Math.sin(t * 2.3)));
  w.devil.head.rotation.set(0.12, 0.06 * Math.sin(t * 0.3), 0);
  hellKey(w, new THREE.Vector3(0.2, -0.3, 1), L, 0.0);
  renderStage(st, 0.95); hellPost(0.6, 0.3); };

// blaze (58.4–63): everything erupts — a wall of fire roars up around you, people engulfed
SHOT_FN.blaze = (lt, dur, t) => { const w = hellWorld(), st = w.st, L = HELL.L, [P0, P1, P2, P3] = w.heroes;
  const er = ss(0, 0.55, lt), sh = 1 - 0.6 * ss(0.3, 4.5, lt), yaw = 0.05 * Math.sin(lt * 0.7), ey = 1.6;
  camPt(st, [L.x, ey, L.z], [L.x + Math.sin(yaw) * 10, ey + lerp(-0.4, 0.6, ss(0, 4.6, lt)), L.z + Math.cos(yaw) * 10], lerp(58, 52, ss(0, 4.6, lt)), t, 1.5, 15);
  st.cam.rotation.x += 0.006 * sh * Math.sin(t * 8.3); st.cam.rotation.y += 0.005 * sh * Math.sin(t * 7.1 + 1); st.cam.rotation.z += 0.006 * sh * Math.sin(t * 5.3);
  if (CAMONLY) return renderStage(st);
  hellTick(w, t, { c: 'A', heat: 0.4 * er, spk: 1 + 2.5 * er, exclude: [[L.x, L.z, 7]] });
  hellPose(P0, { x: L.x - 0.9, z: L.z + 3.2, yaw: Math.PI + 0.3, hp: -0.2, k: 1.3, emo: { fear: 1, open: 1, cry: 1 } });
  hellPose(P1, { x: L.x + 1.3, z: L.z + 4.4, yaw: Math.PI - 0.4, hp: -0.5, k: 1.3 });
  hellPose(P2, { x: L.x + 0.2, z: L.z + 7.0, yaw: Math.PI, hp: -0.6, k: 1.3 });
  const nf = [], R = RNG('hellblaze');
  for (let i = 0; i < 120; i++) { const a = R.f() * TAU, r = lerp(2.6, 18, R.f() ** 1.3), x = L.x + Math.sin(a) * r, z = L.z + Math.cos(a) * r, del = R.r(0, 0.4) + r * 0.012, g = ss(del, del + 0.55, lt);
    nf.push([x, -0.2, z, (0.9 + r * 0.14) * R.r(0.7, 1.3), (2.0 + r * 0.55) * R.r(0.7, 1.5) * (0.3 + 0.7 * g) * (1 + 0.15 * Math.sin(t * 3 + i)), g * R.r(0.55, 0.95)]); }
  for (let i = 0; i < 6; i++) { const a = (i / 6 - 0.5) * 1.9 + R.n(0.1), r = R.r(0.9, 1.4), g = ss(0.05 + i * 0.04, 0.5, lt); nf.push([L.x + Math.sin(a) * r, -0.3, L.z + Math.cos(a) * r, R.r(0.45, 0.8), R.r(1.0, 1.9) * g, 0.6 * g]); }
  hellBurn(nf, L.x - 0.9, L.z + 3.2, 2.0, 5, 31); hellBurn(nf, L.x + 1.3, L.z + 4.4, 2.0, 5, 32); hellBurn(nf, L.x + 0.2, L.z + 7.0, 2.4, 5, 33);
  w.bSmoke.update(t, new THREE.Vector3(L.x, 0, L.z + 9), 9, 16, 0.9 * er);
  hellNear(w, nf); hellLights(w, [[L.x, 1, L.z + 2, 12 * er, 10], [L.x - 1, 0.5, L.z + 3.5, 8 * er, 8], [L.x + 1, 0.5, L.z + 0.5, 6 * er, 6]], t);
  hellKey(w, new THREE.Vector3(0, 0.3, -1), L, 1.6 * er, '#ffb070');
  renderStage(st, lerp(0.95, 1.12, er) - 0.08 * ss(3, 4.6, lt)); hellPost(0.75, 0.4); };

// never (63–67): the camera pulls back and up from you in the burning crowd: the lake to the horizon, forever
SHOT_FN.never = (lt, dur, t) => { const w = hellWorld(), st = w.st, L = HELL.L, [P0, P1] = w.heroes, u = EZ.o3 ? ss(0, 4, lt) : ss(0, 4, lt);
  const y = lerp(1.6, 85, u ** 1.4), z = L.z - 130 * u, pitch = lerp(-2, -20, ss(0, 3, lt)) * DEG;
  camPt(st, [L.x, y, z], [L.x, y + Math.tan(pitch) * 100, z + 100], lerp(52, 60, u), t, 0.8, 17);
  if (CAMONLY) return renderStage(st);
  hellTick(w, t, { c: 'A', heat: 0.25 * (1 - u), exclude: [[L.x, L.z, 2]] });
  hellPose(P0, { x: L.x - 0.9, z: L.z + 3.2, yaw: Math.PI + 0.3, hp: -0.4 }); hellPose(P1, { x: L.x + 1.3, z: L.z + 4.4, yaw: Math.PI - 0.4, hp: -0.5 });
  const nf = []; hellBurn(nf, L.x - 0.9, L.z + 3.2, 1.6, 5, 41); hellBurn(nf, L.x + 1.3, L.z + 4.4, 1.6, 5, 42); for (let i = 0; i < 40; i++) { const a = hsh(i, 51) * TAU, r = 1.5 + 9 * hsh(i, 52); nf.push([L.x + Math.sin(a) * r, -0.2, L.z + Math.cos(a) * r, 1, 2.2 + 2 * hsh(i, 53), 0.9]); } hellNear(w, nf);
  hellKey(w, new THREE.Vector3(0, 0.4, -1), L, 0.8);
  renderStage(st, 1.0); hellPost(0.65, 0.3); };
