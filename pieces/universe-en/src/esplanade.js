
// =====================================================================
//  ESPLANADE — a monumental fountain on a terrace over a bay at sunset. Behind you (+z) a domed palace on stairs;
//  in front (-z) the great round fountain (tiers, a ring of arching jets, lights), a patterned stone plaza, lamp
//  globes, benches, flower beds, cypresses and palms, people (a father with a child on his shoulders, a bubble man,
//  couples, kids, people on the fountain rim), and past the balustrade a small bluff over the bay: the old town on
//  both shores, a harbour with a lighthouse, boats, and across the water the downtown skyline the sun sets behind.
//  Day → night switch at 8 s (sunlight outrun); the sky itself is owned by space.js and the heat by heat.js.
// =====================================================================
const stoneM = (k, base = '#e2d6c0') => STDm({ map: texNoise(k, base, [C3(base, '#000000', 0.08).getStyle(), C3(base, '#ffffff', 0.12).getStyle(), C3(base, '#806040', 0.15).getStyle()], 5000), roughness: 0.85 });
const ESP = { FZ: -30, FR: 15, Y0: 0, BAL: -80, CITY_Y: -6, SEA_Y: -7.5, SHORE: -1460 };
const SUN_SET = dirV(-8 * DEG, 3.2 * DEG);          // the visible disc, low behind the skyline
const ESP_KEY = dirV(-8 * DEG, 13 * DEG);           // the key light (higher, so the ground catches it; shadows still long)
const espSunX = (z) => 2 - 0.1405 * (3 - z);        // the sun's azimuth line on the ground, seen from the plaza
function tileTex() { return wrap(g3Tex((x, w) => { const R = RNG('tile'); x.fillStyle = '#b8a890'; x.fillRect(0, 0, w, w); const n = 8, s = w / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const l = R.r(-12, 12); x.fillStyle = `rgb(${208 + l},${192 + l},${168 + l})`; x.fillRect(i * s + 1.5, j * s + 1.5, s - 3, s - 3); } }, 256, 256), 1, 1); }
// an environment map: sky gradient, ground, the sun's hot spot (reflections in water, metal)
function espEnv(top, hor, gnd, sun, sunCol) { const es = new THREE.Scene(), U = { top: { value: lin(top) }, hor: { value: lin(hor) }, gnd: { value: lin(gnd) }, sun: { value: sun.clone().normalize() }, sc: { value: lin(sunCol) } };
  es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: U,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top, hor, gnd, sun, sc; varying vec3 vD; void main(){ vec3 d = normalize(vD); vec3 c = d.y > 0.0 ? mix(hor, top, pow(d.y, 0.5)) : mix(hor * 0.5, gnd, clamp(-d.y * 4.0, 0.0, 1.0)); float s = max(dot(d, sun), 0.0); c += sc * (pow(s, 900.0) * 40.0 + pow(s, 14.0) * 0.7); gl_FragColor = vec4(c, 1.0); }' })));
  const pm = new THREE.PMREMGenerator(r3().r), tex = pm.fromScene(es, 0.02).texture; pm.dispose(); return tex; }
// a ripple normal map (water)
function espNormTex(seed, n = 40) { return wrap(g3Tex((x, w) => { const R = RNG('wn' + seed), Hh = new Float32Array(w * w), W = [];
  for (let k = 0; k < n; k++) W.push([R.r(0, TAU), R.i(1, 9), R.i(1, 9) * (R.f() < 0.5 ? -1 : 1), R.r(0.3, 1) / (1 + k * 0.08)]);
  for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) { let h = 0; W.forEach(([p, a, b, m]) => (h += m * Math.sin((a * i + b * j) / w * TAU + p))); Hh[j * w + i] = h; }
  const img = x.createImageData(w, w); for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) { const dx = Hh[j * w + (i + 1) % w] - Hh[j * w + (i + w - 1) % w], dy = Hh[((j + 1) % w) * w + i] - Hh[((j + w - 1) % w) * w + i], L = Math.hypot(dx, dy, 1.2), o = (j * w + i) * 4;
    img.data[o] = 128 - 127 * dx / L; img.data[o + 1] = 128 - 127 * dy / L; img.data[o + 2] = 255 * 1.2 / L; img.data[o + 3] = 255; } x.putImageData(img, 0, 0); }, 256, 256, false), 1, 1); }
// the plaza paving, procedural in world space: staggered slabs, a radial rose of pavers around the fountain with a star,
// red granite and marble bands, the axis to the palace, the border by the balustrade, gravel at the far sides
function pavingMat() { const m = STDm({ color: '#ffffff', roughness: 0.82 }); m.extensions = { derivatives: true };
  m.onBeforeCompile = (sh) => { sh.vertexShader = 'varying vec3 vPw;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vPw = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = `varying vec3 vPw;
float ph21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float pvn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(ph21(i), ph21(i + vec2(1, 0)), f.x), mix(ph21(i + vec2(0, 1)), ph21(i + vec2(1, 1)), f.x), f.y); }
float pjl(float x, float w){ float fw = min(fwidth(x), 0.35), d = abs(fract(x) - 0.5); return smoothstep(0.5 - w - fw, 0.5 - w, d); }
float pbd(float x, float a, float b){ float fw = fwidth(x); return smoothstep(a - fw, a + fw, x) - smoothstep(b - fw, b + fw, x); }
` + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
  { vec2 p = vPw.xz; vec3 sand = vec3(0.80, 0.69, 0.55), red = vec3(0.50, 0.27, 0.20), marble = vec3(0.93, 0.88, 0.80), grav = vec3(0.62, 0.55, 0.45);
    vec2 c = p - vec2(0.0, ${ESP.FZ.toFixed(1)}); float r = length(c), an = atan(c.y, c.x) / 6.28318 + 0.5; vec3 col; float j = 0.0;
    if (r < 26.6) { float ring = r / 0.72, ri = floor(ring), ns = max(6.0, floor(6.28318 * (ri + 0.5) * 0.72 / 0.85)), s = an * ns + 0.5 * mod(ri, 2.0);
      col = sand * (0.95 + 0.07 * ph21(vec2(ri, floor(s)))); j = max(pjl(ring + 0.5, 0.045), pjl(s + 0.5, 0.045 * ns / max(ring, 1.0)));
      float f = fract(an * 16.0) - 0.5, ray = step(abs(f), 0.5 * (1.0 - (r - 19.6) / 6.4)) * pbd(r, 19.6, 25.9); col = mix(col, mix(marble, red * 1.25, step(0.0, f)), ray);
      col = mix(col, red, pbd(r, 15.5, 16.5) + pbd(r, 25.9, 26.6)); col = mix(col, marble, pbd(r, 19.0, 19.6)); }
    else { vec2 q = vec2(p.x / 1.2, p.y / 0.6); q.x += 0.5 * mod(floor(q.y), 2.0);
      if (abs(p.x) < 3.6 && p.y > -6.0) { vec2 d = vec2(p.x + p.y, p.x - p.y) * 0.7071 / 0.7; q = d; q.x += 0.5 * mod(floor(q.y), 2.0); }
      col = sand * (0.95 + 0.07 * ph21(floor(q))); j = max(pjl(q.x + 0.5, 0.03), pjl(q.y + 0.5, 0.06));
      float bands = pbd(abs(p.x), 3.6, 4.2) * step(-6.0, p.y) + pbd(p.y, -78.8, -77.8) + pbd(abs(p.x), 52.0, 53.0) * step(p.y, 44.0);
      float lines = (pbd(mod(p.x + 6.0, 12.0), 0.0, 0.25) + pbd(mod(p.y + 6.0, 12.0), 0.0, 0.25)) * step(abs(p.x), 52.0) * step(p.y, 44.0);
      col = mix(col, marble, clamp(lines + pbd(p.y, -74.0, -73.4), 0.0, 1.0)); col = mix(col, red, clamp(bands, 0.0, 1.0));
      col = mix(col, grav * (0.85 + 0.3 * ph21(floor(p * 9.0))), step(53.0, abs(p.x)) * step(p.y, 44.0)); }
    col *= 0.9 + 0.12 * pvn(p * 0.09) + 0.05 * pvn(p * 0.8) + 0.04 * pvn(p * 7.0); diffuseColor.rgb *= col * (1.0 - 0.42 * j); }`); }; return m; }
// soap bubbles: a thin-film rim (fresnel) with rainbow tints and a sun highlight; nearly clear in the middle
let BUBM = null;
function bubbleMat() { return BUBM || (BUBM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uK: { value: 1 }, uSun: { value: ESP_KEY.clone() }, uTint: { value: lin('#ffffff') } },
  vertexShader: 'varying vec3 vN, vW; varying float vS; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); vS = fract(dot(modelMatrix[3].xyz, vec3(0.37, 0.71, 0.13))); gl_Position = projectionMatrix * viewMatrix * w; }',
  fragmentShader: `uniform float uK; uniform vec3 uSun, uTint; varying vec3 vN, vW; varying float vS;
void main(){ vec3 v = normalize(cameraPosition - vW), n = normalize(vN); float ndv = abs(dot(n, v)), fr = pow(1.0 - ndv, 2.6);
  float hue = fract(ndv * 1.6 + vW.y * 0.8 + vS); vec3 film = 0.6 + 0.4 * cos(6.28318 * (hue + vec3(0.0, 0.33, 0.67)));
  float sp = pow(max(dot(reflect(-v, n), normalize(uSun)), 0.0), 120.0) * 2.5 + pow(max(dot(reflect(-v, n), normalize(vec3(-0.4, 0.8, 0.5))), 0.0), 60.0) * 0.8;
  vec3 col = (film * (0.35 + 0.9 * fr) + sp) * uTint * uK; float a = clamp(0.04 + 0.85 * fr + sp, 0.0, 1.0) * min(1.0, uK + 0.25);
  gl_FragColor = vec4(col, a);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` })); }
// the great fountain: a wide basin, an inner ring, a three-tier centre, a ring of arching jets and a tall centre jet; flowing
// glowing droplets along every jet, curtains from the tiers, glints on the water, lights under the water
function buildFountain(st, S) { const g = new THREE.Group(); g.position.set(0, 0, ESP.FZ); st.scene.add(g); S.fount = g; const stn = stoneM('fstn', '#dccfb4'), R = ESP.FR;
  g.add(mesh(new THREE.LatheGeometry([[R - 0.3, 0.2], [R, 0], [R + 0.55, 0], [R + 0.55, 0.12], [R + 0.45, 0.2], [R + 0.45, 0.68], [R + 0.6, 0.76], [R + 0.6, 0.86], [R - 0.35, 0.86], [R - 0.35, 0.76], [R - 0.3, 0.25], [0, 0.25]].map(([r, y]) => new THREE.Vector2(r, y)), 120), stn));
  g.add(mesh(new THREE.LatheGeometry([[6.4, 0.2], [6.85, 0.2], [6.85, 1.05], [6.95, 1.12], [6.95, 1.2], [6.15, 1.2], [6.2, 0.2]].map(([r, y]) => new THREE.Vector2(r, y)), 90), stn));
  S.waterM = new THREE.MeshPhysicalMaterial({ color: '#3e6e7c', roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.9, normalMap: espNormTex('f'), normalScale: new THREE.Vector2(0.35, 0.35) }); S.waterM.normalMap.repeat.set(6, 6);
  g.add(mesh(new THREE.RingGeometry(6.85, R - 0.3, 120).rotateX(-Math.PI / 2), S.waterM, 0, 0.64, 0, { cast: false })); g.add(mesh(new THREE.CircleGeometry(6.15, 72).rotateX(-Math.PI / 2), S.waterM, 0, 1.0, 0, { cast: false }));
  g.add(mesh(new THREE.LatheGeometry([[0.9, 0], [0.6, 2.2], [3.2, 2.6], [3.45, 2.9], [3.3, 3.0], [0.5, 2.85], [0.4, 4.6], [1.9, 4.9], [2.05, 5.1], [1.9, 5.15], [0.3, 5.05], [0.25, 6.4], [0.8, 6.6], [0.85, 6.8], [0.15, 6.8], [0, 7.1]].map(([r, y]) => new THREE.Vector2(r, y)), 64), stn, 0, 0.6, 0));
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, s = mesh(lumpyGeo(2, 0.35, 70 + k), stn, Math.cos(a) * 1.3, 2.0, Math.sin(a) * 1.3); s.scale.set(0.45, 0.9, 0.45); g.add(s); }   // carved figures under the basin
  // jets: tubes along parabolas (an outer ring arching inward, an inner ring, the tall centre)
  const jm = new THREE.MeshStandardMaterial({ color: '#eef6fa', emissive: '#fff2dc', emissiveIntensity: 0.3, transparent: true, opacity: 0.5, roughness: 0.05, depthWrite: false }); S.jetM = jm;
  S.arcs = []; const arc = (x0, z0, x1, z1, h, y0, r, n) => { S.arcs.push([x0, z0, x1, z1, h, y0, n]); const pts = []; for (let k = 0; k <= 20; k++) { const u = k / 20; pts.push(new THREE.Vector3(lerp(x0, x1, u), y0 + 4 * h * u * (1 - u), lerp(z0, z1, u))); } const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, r, 6), jm); m.renderOrder = 2; return m; };
  S.jets = []; for (let k = 0; k < 28; k++) { const a = k / 28 * TAU, m = arc(Math.cos(a) * (R - 0.7), Math.sin(a) * (R - 0.7), Math.cos(a) * 7.6, Math.sin(a) * 7.6, 3.6, 0.65, 0.06, 22); g.add(m); S.jets.push(m); }
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + 0.2, m = arc(Math.cos(a) * 6.0, Math.sin(a) * 6.0, Math.cos(a) * 3.7, Math.sin(a) * 3.7, 2.4, 1.05, 0.05, 16); g.add(m); S.jets.push(m); }
  S.cjet = mesh(new THREE.CylinderGeometry(0.06, 0.22, 7, 10, 1, true).translate(0, 3.5, 0), jm, 0, 7.6, 0, { cast: false }); g.add(S.cjet);
  // the flowing droplets (one Points: arcs, the centre column and its crown, the tier curtains)
  { let n = 0; S.arcs.forEach((a) => (n += a[6])); n += 90 + 72 + 56; S.dropN = n; const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage));
    S.dropM = new THREE.PointsMaterial({ map: glowTex(), color: '#ffffff', size: 0.22, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }); S.drops = new THREE.Points(geo, S.dropM); S.drops.frustumCulled = false; S.drops.renderOrder = 3; g.add(S.drops);
    const Rr = RNG('drops'); S.dropJ = []; for (let i = 0; i < n; i++) S.dropJ.push([Rr.r(0, 1), Rr.n(0.08), Rr.n(0.08), Rr.r(0, TAU)]); }
  S.spray = IM(new THREE.SphereGeometry(0.04, 5, 4), new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, emissive: '#ffe2b0', emissiveIntensity: 0 }), 700, false); S.spray.frustumCulled = false; g.add(S.spray); S.sp = []; const Rr = RNG('fspray'); for (let i = 0; i < 700; i++) S.sp.push([Rr.r(0, TAU), Rr.f() < 0.75 ? Rr.r(7.2, 8.2) : Rr.r(3.5, 4.0), Rr.r(0, 1), Rr.r(0.4, 1.3)]);
  // glints on the water (twinkling, per-point brightness)
  { const n = 360, pos = new Float32Array(n * 3), Rg = RNG('glint'); S.glintP = []; for (let i = 0; i < n; i++) { const inner = i < 70, a = Rg.r(0, TAU), r = inner ? Rg.r(0.5, 6.0) : Rg.r(7.1, R - 0.5); pos.set([Math.cos(a) * r, inner ? 1.02 : 0.66, Math.sin(a) * r], i * 3); S.glintP.push([Rg.r(1.5, 4.5), Rg.r(0, TAU)]); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage));
    S.glints = new THREE.Points(geo, new THREE.PointsMaterial({ map: glowTex(), vertexColors: true, size: 0.3, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.glints.frustumCulled = false; g.add(S.glints); }
  // underwater lights at the nozzles and round the centre (warm at night) and the glow they throw on the water
  const fl = new THREE.SpriteMaterial({ map: glowTex(), color: '#ffd8a0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  S.flights = []; for (let k = 0; k < 28; k++) { const a = (k + 0.5) / 28 * TAU, sp = new THREE.Sprite(fl); sp.position.set(Math.cos(a) * (R - 0.9), 0.8, Math.sin(a) * (R - 0.9)); sp.scale.setScalar(1.8); g.add(sp); S.flights.push(sp); }
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, sp = new THREE.Sprite(fl); sp.position.set(Math.cos(a) * 4.6, 1.15, Math.sin(a) * 4.6); sp.scale.setScalar(2.2); g.add(sp); S.flights.push(sp); }
  [[0, 4.3, 3.2], [0, 6.0, 2.4], [0, 9.0, 3.4], [0, 12.5, 3.0]].forEach(([x, y, s]) => { const sp = new THREE.Sprite(fl); sp.position.set(x, y, 0); sp.scale.setScalar(s); g.add(sp); S.flights.push(sp); });
  S.wglow = mesh(new THREE.RingGeometry(1, R - 0.3, 96).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: g3Radial([[0, 'rgba(255,255,255,0)'], [0.38, 'rgba(255,220,160,0.9)'], [0.55, 'rgba(255,200,120,0.5)'], [0.85, 'rgba(255,190,110,0.85)'], [1, 'rgba(255,170,90,0.3)']], 256), color: '#ffc070', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 0.68, 0, { cast: false, recv: false });
  S.wglow.geometry.attributes.uv.array.forEach((v, i, A) => { if (i % 2 === 0) { const x = S.wglow.geometry.attributes.position.array[i / 2 * 3], z = S.wglow.geometry.attributes.position.array[i / 2 * 3 + 2]; A[i] = 0.5 + x / (2 * R); A[i + 1] = 0.5 + z / (2 * R); } }); g.add(S.wglow);
  S.fpl = new THREE.PointLight('#ffcf90', 0, 27, 2); S.fpl.position.set(0, 3.5, 0); g.add(S.fpl); }
// a park lamp: base, fluted post, collar, a big glowing globe, a halo and a wide glare
function espLamp(st, S, x, z, light) { const ir = S.ironM; st.scene.add(mesh(new THREE.CylinderGeometry(0.17, 0.25, 0.6, 12).translate(0, 0.3, 0), ir, x, 0, z)); st.scene.add(mesh(new THREE.CylinderGeometry(0.06, 0.1, 3.6, 10).translate(0, 1.8, 0), ir, x, 0.5, z));
  st.scene.add(mesh(new THREE.CylinderGeometry(0.16, 0.08, 0.22, 12), ir, x, 4.05, z)); const gm = mesh(new THREE.SphereGeometry(0.3, 18, 14), S.globeM, x, 4.42, z, { cast: false }); st.scene.add(gm); S.lampSp.push(gm);
  const h1 = new THREE.Sprite(S.haloM); h1.position.set(x, 4.42, z); h1.scale.setScalar(2.6); st.scene.add(h1); S.lampSp.push(h1); const h2 = new THREE.Sprite(S.glareM); h2.position.set(x, 4.42, z); h2.scale.setScalar(9); st.scene.add(h2); S.lampSp.push(h2);
  if (light) { const L = new THREE.PointLight('#ffc884', 0, 11, 2); L.position.set(x, 4.2, z); st.scene.add(L); S.lampL.push(L); } }
// an instanced crowd with legs (same API as makeCrowd, plus o: { stride, look, point, sit, lean })
function espCrowd(n, seed) { const R = RNG('ecrowd', seed), grp = new THREE.Group();
  const mk = (g) => { const m = IM(g, STDm({ roughness: 0.85 }), n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; grp.add(m); return m; };
  const body = mk(new THREE.CapsuleGeometry(0.155, 0.36, 4, 10).scale(1, 1, 0.66).translate(0, 1.16, 0)), head = mk(new THREE.SphereGeometry(0.105, 12, 10).scale(0.92, 1.06, 1).translate(0, 0.14, 0.01)), hair = mk(new THREE.SphereGeometry(0.115, 12, 8, 0, TAU, 0, Math.PI * 0.55).translate(0, 0.16, -0.012));
  const legG = new THREE.CapsuleGeometry(0.068, 0.72, 3, 8).translate(0, -0.43, 0), armG = new THREE.CapsuleGeometry(0.044, 0.5, 3, 6).translate(0, -0.29, 0);
  const legL = mk(legG), legR = mk(legG), armL = mk(armG), armR = mk(armG);
  const tops = ['#c84a3a', '#2f5fa8', '#e8b83c', '#2a8a80', '#d86f98', '#6b4fa9', '#e0823a', '#3c9a5c', '#1f2d3d', '#f2ede2', '#a8402a', '#e8d8b8', '#5a6a7a', '#8a3048'], pants = ['#2b3a55', '#3a3a3a', '#c8b89a', '#1f2d3d', '#4a4038', '#6a6a70', '#e8e0d0'];
  const L = []; for (let i = 0; i < n; i++) { const q = { i, s: R.r(0.9, 1.06) * (R.f() < 0.14 ? 0.68 : 1), ph: R.r(0, TAU), top: R.pick(tops), skin: R.pick(SKINS), hair: R.pick(HAIRS), dress: R.f() < 0.15 };
    body.setColorAt(i, lin(q.top)); head.setColorAt(i, lin(q.skin)); hair.setColorAt(i, lin(q.hair)); armL.setColorAt(i, lin(q.top)); armR.setColorAt(i, lin(q.top)); const pc = lin(q.dress ? q.top : R.pick(pants)); legL.setColorAt(i, pc); legR.setColorAt(i, pc); L.push(q); }
  const all = [body, head, hair, legL, legR, armL, armR];
  return { grp, L, body, head, hair, armL, armR, legL, legR,
    set(i, x, y, z, yaw, s, armsUp = 0, sway = 0, gone = 0, o = {}) { const q = L[i]; if (gone >= 1) { all.forEach((m) => m.setMatrixAt(i, _hid)); return; } const k = s * q.s * (1 - gone), sit = o.sit || 0, st = o.stride || 0;
      const B = M4().compose(_v.set(x, y, z), _q.setFromEuler(_e.set(o.lean || 0, yaw, sway, 'YXZ')), _s.set(k, k, k)), B2 = B.clone().multiply(Tr(0, -0.42 * sit, 0)); body.setMatrixAt(i, B2);
      const H = B2.clone().multiply(Tr(0, 1.47, 0)).multiply(Rx(-(o.look || 0))); head.setMatrixAt(i, H); hair.setMatrixAt(i, H);
      [legL, legR].forEach((m, j) => m.setMatrixAt(i, B2.clone().multiply(Tr(j ? 0.085 : -0.085, 0.88, 0)).multiply(Rx((j ? 1 : -1) * st - 0.25 * sit))));
      [armL, armR].forEach((m, j) => { const sg = j ? 1 : -1, up = Array.isArray(armsUp) ? armsUp[j] : armsUp, pt = j && o.point ? 1 : 0; m.setMatrixAt(i, B2.clone().multiply(Tr(sg * 0.2, 1.42, 0)).multiply(Rz(sg * (0.1 + 2.5 * up))).multiply(Rx(-0.3 * up - 2.75 * pt + (j ? 1 : -1) * st * 0.8 - 0.5 * sit))); }); },
    done() { all.forEach((m) => (m.instanceMatrix.needsUpdate = true)); } }; }
// the bay: our bluff, the land round it, the water (with the skyline mirrored under it), the old town on both shores,
// the harbour and lighthouse, boats, the downtown skyline across the water, far hills, city lights, the sun's glitter
function espBay(st, S) { const R = RNG('bay'), W = ESP.SEA_Y, LY = ESP.CITY_Y;
  const bay = [[-112, -81], [-150, -150], [-230, -230], [-330, -320], [-440, -520], [-570, -760], [-730, -1020], [-900, -1260], [-1150, ESP.SHORE], [-600, ESP.SHORE - 20], [0, ESP.SHORE - 30], [600, ESP.SHORE - 20], [1150, ESP.SHORE + 40], [880, -1200], [690, -940], [530, -650], [390, -410], [250, -230], [165, -140], [112, -81]];
  const sh = new THREE.Shape([new THREE.Vector2(-9000, -3000), new THREE.Vector2(9000, -3000), new THREE.Vector2(9000, 9000), new THREE.Vector2(-9000, 9000)]); sh.holes.push(new THREE.Path(bay.map(([x, z]) => new THREE.Vector2(x, -z))));
  st.scene.add(mesh(new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2), STDm({ color: '#5c5844', roughness: 1 }), 0, LY, 0, { cast: false, recv: false }));
  st.scene.add(mesh(new THREE.BoxGeometry(700, 10, 2), stoneM('bluff', '#b8a688'), 0, -5, -81.5, { cast: false }));
  // the water: transparent over a mirrored copy of everything on the far shore (reflections that work at any camera)
  S.seaM = new THREE.MeshPhysicalMaterial({ color: '#2c4458', roughness: 0.14, metalness: 0.0, transparent: true, opacity: 0.72, normalMap: espNormTex('sea', 60), normalScale: new THREE.Vector2(0.5, 0.5) }); S.seaM.normalMap.repeat.set(900, 600);
  const sea = mesh(new THREE.PlaneGeometry(18000, 12000).rotateX(-Math.PI / 2), S.seaM, 0, W, -5500, { cast: false, recv: false }); sea.renderOrder = 1; st.scene.add(sea);
  const mir = new THREE.Group(); mir.scale.y = -1; mir.position.y = 2 * W; st.scene.add(mir); S.mirror = mir;
  const city = (geo, mat, list, mirror = true) => { const n = list.length; if (!n) return; const m = new THREE.InstancedMesh(geo, mat, n); list.forEach((M, i) => { m.setMatrixAt(i, M[0]); if (M[1]) m.setColorAt(i, lin(M[1])); }); st.scene.add(m);
    if (mirror) { const m2 = new THREE.InstancedMesh(geo, mat, n); m2.instanceMatrix = m.instanceMatrix; m2.instanceColor = m.instanceColor; m2.frustumCulled = false; mir.add(m2); } return m; };
  const boxG = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  // downtown across the water: towers (setbacks, spires, aviation lights), mid-rises, a cathedral dome under the sun
  const DT = [], ROOF = [], SPI = [], DOM = [], RED = [], LT = [], glass = ['#8a96a4', '#a8b0b8', '#c8bca8', '#7a8898', '#d4c8b2', '#9aa4ac', '#b8ac9c', '#e0d4bc'];
  for (let i = 0; i < 300; i++) { const z = R.r(ESP.SHORE - 50, -2600), x = R.r(-1400, 1400), core = Math.exp(-(((x - 120) / 620) ** 2)) * Math.exp(-(((z + 1800) / 520) ** 2)), gap = Math.abs(x - espSunX(z)) < 120;
    let h = R.r(16, 44) + (R.f() < core ? R.r(40, 190) * R.f() ** 0.5 : 0); if (gap) h = Math.min(h, 28); const w = R.r(22, 48), d = R.r(22, 48), ry = R.n(0.12), c = R.pick(glass);
    DT.push([M4c(x, LY, z, ry, w, h, d), c]); let y = LY + h, ww = w, dd = d;
    if (h > 90) { for (let s = 0, k = R.i(1, 2); s < k; s++) { ww *= 0.72; dd *= 0.72; const hh = R.r(14, 40); DT.push([M4c(x, y, z, ry, ww, hh, dd), c]); y += hh; } if (R.f() < 0.5) SPI.push([M4c(x, y, z, 0, R.r(1.2, 2.6), R.r(20, 55), R.r(1.2, 2.6))]); RED.push([x, y + 3, z]); }
    ROOF.push([M4c(x, y, z, ry, ww * 0.9, 1.6, dd * 0.9), '#5a5450']); for (let k = 0; k < 3; k++) LT.push([x + R.n(w * 0.6), LY + 1.5, z + R.n(d * 0.6)]); }
  [[espSunX(-1640), -1640, 30, 1], [520, -1900, 17, 0], [-720, -1720, 15, 0]].forEach(([x, z, r, big]) => { DT.push([M4c(x, LY, z, 0, r * 2, big ? 34 : 20, r * 2), '#e0d2b8']); DOM.push([M4c(x, LY + (big ? 34 : 20), z, 0, r * 0.95, r * 1.05, r * 0.95)]); SPI.push([M4c(x, LY + (big ? 34 : 20) + r * 1.05, z, 0, 1.5, 14, 1.5)]); });
  S.cityM = []; const mDT = winLit('#ffffff', 5), mOT = winLit('#ffffff', 9); [mDT, mOT].forEach((m) => { m.userData.U.uLit.value = 0; S.cityM.push(m); });
  // the old town on both shores, rising inland, terracotta roofs; church towers
  const OT = [], OR = [], walls = ['#e8d8bc', '#dcc0a0', '#f0e4cc', '#d8b890', '#c8a888', '#e8ccb0', '#b8a898'];
  const coastX = (side, z) => { const pts = side < 0 ? bay.slice(0, 9) : bay.slice(12).reverse(); for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1]; if (z <= z0 && z >= z1) return lerp(x0, x1, (z - z0) / (z1 - z0)); } return pts[pts.length - 1][0]; };
  [-1, 1].forEach((side) => { for (let i = 0; i < 520; i++) { const z = R.r(-120, ESP.SHORE + 30), inl = R.r(14, 700) * R.f() ** 0.5 + 10, x = coastX(side, z) + side * inl, rise = Math.min(60, inl * 0.09), h = R.r(9, 24) + rise, w = R.r(12, 26), d = R.r(12, 22), ry = R.n(0.3);
      OT.push([M4c(x, LY, z, ry, w, h, d), R.pick(walls)]); OR.push([M4c(x, LY + h, z, ry, w * 1.04, R.r(1.5, 3), d * 1.04), R.pick(['#a8583a', '#b86a48', '#985038', '#8a4a34'])]); if (R.f() < 0.5) LT.push([x + R.n(8), LY + 1.5 + rise * 0.5, z + R.n(8)]); if (R.f() < 0.012) SPI.push([M4c(x, LY + h, z, 0, 3, R.r(14, 26), 3)]); } });
  for (let k = 0; k < 900; k++) { const side = k % 2 ? 1 : -1, z = lerp(-110, ESP.SHORE + 20, (k >> 1) / 450); LT.push([coastX(side, z) + side * 5, LY + 1.2, z]); }   // the shore promenades
  for (let x = -1100; x <= 1100; x += 6) LT.push([x, LY + 1.2, ESP.SHORE - 34 + 10 * Math.sin(x * 0.004)]);
  city(boxG, mDT, DT); city(boxG, STDm({ color: '#4a4a50', roughness: 0.8 }), ROOF); city(boxG, mOT, OT); city(boxG, STDm({ color: '#a8583a', roughness: 0.9 }), OR, false);
  city(new THREE.ConeGeometry(1, 1, 8).translate(0, 0.5, 0), STDm({ color: '#6a6a70', metalness: 0.5, roughness: 0.4 }), SPI); city(new THREE.SphereGeometry(1, 24, 12, 0, TAU, 0, Math.PI / 2), STDm({ color: '#7a9a8a', metalness: 0.4, roughness: 0.45 }), DOM);
  // the harbour: a breakwater with lamps and a lighthouse; moored boats; a ferry and boats on the bay
  const bw = [[-230, -250], [-170, -400], [-120, -560]]; for (let i = 0; i < 2; i++) { const [x0, z0] = bw[i], [x1, z1] = bw[i + 1], L = Math.hypot(x1 - x0, z1 - z0), m = mesh(new THREE.BoxGeometry(9, 3, L), stoneM('brk', '#9a8e7a'), (x0 + x1) / 2, W + 1, (z0 + z1) / 2, { cast: false }); m.rotation.y = Math.atan2(x1 - x0, z1 - z0); st.scene.add(m); for (let k = 0; k <= 20; k++) LT.push([lerp(x0, x1, k / 20), W + 4, lerp(z0, z1, k / 20)]); }
  st.scene.add(mesh(new THREE.CylinderGeometry(2.2, 3.2, 22, 14).translate(0, 11, 0), STDm({ color: '#f0ece4' }), -120, W + 2, -560, { cast: false })); st.scene.add(mesh(new THREE.CylinderGeometry(2.4, 2.4, 3, 14), STDm({ color: '#b83a2a' }), -120, W + 25.5, -560, { cast: false }));
  S.lhouse = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#fff0c8', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); S.lhouse.position.set(-120, W + 25.5, -560); S.lhouse.scale.setScalar(26); st.scene.add(S.lhouse);
  const hull = STDm({ color: '#f2efe8', roughness: 0.5 }), hullD = STDm({ color: '#2a3a52', roughness: 0.5 }), BL = [];
  [[-260, -300, 14, 0.4], [-245, -330, 11, 0.5], [-275, -350, 16, 0.3], [-200, -280, 10, 0.6], [60, -420, 12, 1.2], [-40, -760, 9, 0.2], [260, -900, 13, -0.8], [-300, -1100, 18, 0.9], [140, -1250, 10, 1.5]].forEach(([x, z, l, ry], i) => {
    const b = new THREE.Group(); b.position.set(x, W, z); b.rotation.y = ry; st.scene.add(b); b.add(mesh(new THREE.CylinderGeometry(l * 0.18, l * 0.12, l, 6, 1).rotateX(Math.PI / 2).scale(1, 0.55, 1), i % 3 ? hull : hullD, 0, 0.6, 0, { cast: false })); b.add(mesh(new THREE.BoxGeometry(l * 0.22, l * 0.12, l * 0.3), hull, 0, 1.6, -l * 0.05, { cast: false }));
    if (i < 4) b.add(mesh(new THREE.CylinderGeometry(0.08, 0.1, l * 0.9, 5).translate(0, l * 0.45, 0), hull, 0, 1, 0.1 * l, { cast: false })); BL.push([x, W + 2.5, z]); BL.push([x + Math.sin(ry) * l * 0.4, W + 1.6, z + Math.cos(ry) * l * 0.4]); });
  { const f = new THREE.Group(); f.position.set(170, W, -680); f.rotation.y = 1.25; st.scene.add(f); f.add(mesh(new THREE.BoxGeometry(14, 4, 64), STDm({ color: '#e8e8ec' }), 0, 1.5, 0, { cast: false })); f.add(mesh(new THREE.BoxGeometry(12, 7, 40), mDT, 0, 3.5, 0, { cast: false })); f.add(mesh(new THREE.CylinderGeometry(1.4, 1.6, 5, 10), STDm({ color: '#c83a2a' }), 0, 12.5, 6, { cast: false })); }
  // far hills, faint in the haze
  for (let i = 0; i < 9; i++) { const x = -3600 + i * 900 + R.n(200), hm = new THREE.Mesh(lumpyGeo(3, 0.25, 60 + i), STDm({ color: '#6e6680', roughness: 1 })); hm.position.set(x, -60, -3600 - R.r(0, 900)); hm.scale.set(R.r(500, 800), R.r(180, 380), 400); st.scene.add(hm); }
  // night lights: streets and promenades (warm), aviation lights (red); each with its reflection in the water
  const pts = (list, col, size, op) => { const mk = (mirror) => { const a = new Float32Array(list.length * 3); list.forEach(([x, y, z], i) => a.set([x, mirror ? 2 * W - y : y, z], i * 3)); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3));
      const p = new THREE.Points(g, new THREE.PointsMaterial({ map: glowTex(), color: col, size, sizeAttenuation: false, transparent: true, opacity: mirror ? op * 0.45 : op, depthWrite: false, blending: THREE.AdditiveBlending })); p.frustumCulled = false; st.scene.add(p); return p; }; return [mk(false), mk(true)]; };
  S.nightPts = [...pts(LT, '#ffa850', 3.5, 0.8), ...pts(RED, '#ff3a2a', 6, 1), ...pts(BL, '#fff2d8', 5, 1)];
  // the sun's glitter path on the water, from the bluff toward the far shore under the disc
  { const z0 = -300, z1 = ESP.SHORE + 15, pos = [], uv = [], idx = [], N = 24; for (let k = 0; k <= N; k++) { const z = lerp(z0, z1, k / N), x = espSunX(z), hw = 0.03 * (3 - z) + 4; pos.push(x - hw, W + 0.15, z, x + hw, W + 0.15, z); uv.push(0, k / N * 6, 1, k / N * 6); if (k < N) idx.push(k * 2, k * 2 + 2, k * 2 + 1, k * 2 + 1, k * 2 + 2, k * 2 + 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    const tex = wrap(g3Tex((x, w, h) => { const Rg = RNG('glit'); x.fillStyle = '#000'; x.fillRect(0, 0, w, h); for (let k = 0; k < 900; k++) { const u = Rg.n(1) * Rg.f(), a = 1 - Math.abs(u); x.fillStyle = `rgba(255,${200 + Rg.i(0, 55)},${150 + Rg.i(0, 80)},${a * Rg.r(0.4, 1)})`; x.fillRect(w / 2 + u * w / 2 - 6, Rg.r(0, h), Rg.r(4, 14), Rg.r(1, 2.5)); } }, 64, 512), 1, 1);
    S.glitM = new THREE.MeshBasicMaterial({ map: tex, color: '#ffd8a8', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 1 }); S.glit = new THREE.Mesh(g, S.glitM); S.glit.renderOrder = 2; S.glit.frustumCulled = false; st.scene.add(S.glit); } }
// the palace behind (+z): stairs, a colonnaded portico with a pediment, two rows of windows, an attic balustrade with
// statues, a drum ringed with columns, a ribbed copper dome with a lantern, and two towers
function espPalace(st, S) { const p = new THREE.Group(); p.position.set(0, 0, 58); st.scene.add(p); S.palace = p; const pw = stoneM('pal', '#ecdcbc'), pw2 = stoneM('pal2', '#d4bf9c'), cu = STDm({ color: '#5f8f7c', metalness: 0.35, roughness: 0.5 }), gold = STDm({ color: '#d8a838', metalness: 0.9, roughness: 0.3 });
  for (let s = 0; s < 10; s++) p.add(mesh(new THREE.BoxGeometry(70 - s * 0.6, 0.4, 2), pw2, 0, 0.2 + s * 0.4, -12 + s * 1.2)); p.add(mesh(new THREE.BoxGeometry(100, 4, 42), pw2, 0, 2, 14));
  p.add(mesh(new THREE.BoxGeometry(90, 22, 30), pw, 0, 15, 10)); p.add(mesh(new THREE.BoxGeometry(91, 0.7, 30.8), pw2, 0, 12.2, 10)); p.add(mesh(new THREE.BoxGeometry(92, 1.4, 31.6), pw2, 0, 26.2, 10));
  const glassM = S.palWin = STDm({ color: '#2a2420', emissive: '#ffd090', emissiveIntensity: 0 }); const fr = [];
  for (let k = -12; k <= 11; k++) [[7.6, 4.2], [17.4, 3.6]].forEach(([y, h]) => { const x = k * 3.6 + 1.8; const wn = mesh(new THREE.PlaneGeometry(1.5, h), glassM, x, y, -5.04, { cast: false }); wn.rotation.y = Math.PI; p.add(wn); fr.push(M4c(x, y + h / 2 + 0.3, -5.2, 0, 2.1, 0.5, 0.5), M4c(x, y - h / 2 - 0.15, -5.2, 0, 2.0, 0.3, 0.6)); });
  { const m = IM(new THREE.BoxGeometry(1, 1, 1), pw2, fr.length); fr.forEach((M, i) => m.setMatrixAt(i, M)); p.add(m); }
  const colG = new THREE.CylinderGeometry(0.62, 0.72, 15, 16).translate(0, 7.5, 0), cap = new THREE.BoxGeometry(1.9, 0.55, 1.9);
  for (let k = -10; k <= 10; k++) { const x = k * 3.6, z = Math.abs(k) <= 4 ? -9 : -6.4; p.add(mesh(colG, pw, x, 4.6, z)); p.add(mesh(cap, pw2, x, 19.8, z)); p.add(mesh(new THREE.BoxGeometry(1.7, 0.6, 1.7), pw2, x, 4.3, z)); }
  p.add(mesh(new THREE.BoxGeometry(78, 2.2, 3.4), pw, 0, 21.2, -6.6)); p.add(mesh(new THREE.BoxGeometry(34, 2.2, 3.6), pw, 0, 21.2, -9.1)); p.add(mesh(new THREE.BoxGeometry(35, 0.5, 4), pw2, 0, 22.4, -9.1));
  { const s = new THREE.Shape(); s.moveTo(-17.5, 0); s.lineTo(17.5, 0); s.lineTo(0, 6.2); s.closePath(); p.add(mesh(new THREE.ExtrudeGeometry(s, { depth: 3.4, bevelEnabled: false }).translate(0, 0, -10.8), pw, 0, 22.6, 0));
    const t = new THREE.Shape(); t.moveTo(-14.5, 0.6); t.lineTo(14.5, 0.6); t.lineTo(0, 5.2); t.closePath(); p.add(mesh(new THREE.ExtrudeGeometry(t, { depth: 0.2, bevelEnabled: false }).translate(0, 0, -11.0), pw2, 0, 22.6, 0)); }
  // attic balustrade with statues
  { const bg = new THREE.CylinderGeometry(0.16, 0.2, 1.1, 8), n = 200, m = IM(bg, pw, n); for (let i = 0; i < n; i++) m.setMatrixAt(i, M4c(-44.5 + i * 0.45, 27.45, -4.8)); p.add(m); p.add(mesh(new THREE.BoxGeometry(90, 0.3, 0.6), pw, 0, 28.1, -4.8));
    for (let k = -4; k <= 4; k++) { const x = k * 10; p.add(mesh(new THREE.BoxGeometry(1.2, 1.4, 1.2), pw, x, 27.6, -4.8)); const f = mesh(lumpyGeo(2, 0.3, 90 + k), pw, x, 29.6, -4.8); f.scale.set(0.45, 1.3, 0.4); p.add(f); p.add(mesh(new THREE.SphereGeometry(0.3, 10, 8), pw, x, 31.1, -4.8)); } }
  // drum, dome, lantern
  p.add(mesh(new THREE.CylinderGeometry(13.6, 13.6, 2, 48), pw2, 0, 27.6, 10)); p.add(mesh(new THREE.CylinderGeometry(13, 13, 12, 48), pw, 0, 32.6, 10));
  for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; p.add(mesh(new THREE.CylinderGeometry(0.42, 0.48, 10.5, 8), pw, Math.sin(a) * 13.7, 32.6, 10 + Math.cos(a) * 13.7)); const w = mesh(archGeo(1.3, 3.2, 0.3, 8), glassM, Math.sin(a + 0.13) * 13.05, 30, 10 + Math.cos(a + 0.13) * 13.05, { cast: false }); w.rotation.y = a + 0.13; p.add(w); }
  p.add(mesh(new THREE.CylinderGeometry(14.5, 14.5, 1.4, 48), pw2, 0, 38.4, 10)); p.add(mesh(new THREE.SphereGeometry(13.4, 48, 24, 0, TAU, 0, Math.PI / 2).scale(1, 1.15, 1), cu, 0, 39, 10));
  for (let k = 0; k < 16; k++) { const rb = mesh(new THREE.TorusGeometry(13.5, 0.22, 5, 24, Math.PI / 2).scale(1, 1.15, 1), pw2, 0, 39, 10, { cast: false }); rb.rotation.y = k / 16 * TAU; p.add(rb); }
  p.add(mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.6, 16), pw2, 0, 54.5, 10)); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; p.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.6, 6), pw, Math.sin(a) * 2.2, 56.6, 10 + Math.cos(a) * 2.2)); }
  p.add(mesh(new THREE.CylinderGeometry(1.7, 1.7, 3.6, 12), glassM, 0, 56.6, 10)); p.add(mesh(new THREE.SphereGeometry(2.6, 20, 10, 0, TAU, 0, Math.PI / 2), cu, 0, 58.4, 10)); p.add(mesh(new THREE.SphereGeometry(0.55, 14, 10), gold, 0, 61.4, 10)); p.add(mesh(new THREE.CylinderGeometry(0.06, 0.1, 3, 6), gold, 0, 63.2, 10));
  [-40, 40].forEach((x) => { p.add(mesh(new THREE.BoxGeometry(9, 46, 9), pw, x, 23, 0)); [12.2, 26.2, 44].forEach((y) => p.add(mesh(new THREE.BoxGeometry(9.8, 0.9, 9.8), pw2, x, y, 0))); p.add(mesh(new THREE.ConeGeometry(6.4, 11, 4).rotateY(Math.PI / 4), cu, x, 51.5, 0)); p.add(mesh(new THREE.SphereGeometry(0.4, 10, 8), gold, x, 57.4, 0));
    for (let f = 0; f < 4; f++) { const r = f * Math.PI / 2, o = mesh(archGeo(2.4, 3.6, 0.4), pw2, x + Math.sin(r) * 4.55, 36, Math.cos(r) * 4.55); o.rotation.y = r; p.add(o); const d = mesh(new THREE.PlaneGeometry(2.4, 4.6), STDm({ color: '#2a2420' }), x + Math.sin(r) * 4.52, 37.6, Math.cos(r) * 4.52, { cast: false }); d.rotation.y = r; p.add(d); }
    const ck = mesh(new THREE.CircleGeometry(2.4, 32), STDm({ color: '#f4ecd8', emissive: '#fff2d0', emissiveIntensity: 0 }), x, 31, -4.56, { cast: false }); ck.rotation.y = Math.PI; p.add(ck); S.palClock = ck.material; }); }
function buildEsplanade(st) { const R = RNG('esp'), S = { st, lampSp: [], lampL: [] };
  // light: the key a little higher than the disc (long shadows toward the camera, but the ground lit); a shadow box that holds the
  // plaza and the palace; environment maps for the sunset and for the moonless night
  st.setSun(ESP_KEY, new THREE.Vector3(0, 0, -25)); Object.assign(st.key.shadow.camera, { left: -62, right: 62, top: 86, bottom: -20, near: 1, far: 700 }); st.key.shadow.camera.updateProjectionMatrix(); st.key.shadow.mapSize.set(4096, 4096); st.key.shadow.radius = 2;
  S.envD = espEnv('#3a4a80', '#e2a474', '#4a3a30', SUN_SET, '#ffd0a0'); S.envN = espEnv('#060a18', '#10142a', '#060508', new THREE.Vector3(0, -1, 0), '#000000'); st.scene.environment = S.envD;
  // the plaza floor (y 0, from the balustrade back past the palace)
  st.scene.add(mesh(new THREE.PlaneGeometry(600, 400).rotateX(-Math.PI / 2), pavingMat(), 0, 0, 119.5, { cast: false }));
  S.ironM = IRON(); S.globeM = STDm({ color: '#fff6e6', emissive: '#ffd898', emissiveIntensity: 0.25, roughness: 0.3 });
  S.haloM = new THREE.SpriteMaterial({ map: glowTex(), color: '#ffd49a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }); S.glareM = new THREE.SpriteMaterial({ map: glowTex(), color: '#ffb868', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  buildFountain(st, S); const bal = stoneM('bal', '#e4d8c0');
  // the balustrade at the edge of the bluff (z = -80): plinth, balusters, rail with a cap, pedestals with urns of flowers
  st.scene.add(mesh(new THREE.BoxGeometry(240, 0.3, 0.75), bal, 0, 0.15, ESP.BAL)); st.scene.add(mesh(new THREE.BoxGeometry(240, 0.14, 0.62), bal, 0, 0.98, ESP.BAL)); st.scene.add(mesh(new THREE.BoxGeometry(240, 0.1, 0.72), bal, 0, 1.08, ESP.BAL));
  { const bg = new THREE.LatheGeometry([[0.08, 0], [0.12, 0.06], [0.07, 0.2], [0.14, 0.42], [0.07, 0.62], [0.1, 0.68]].map(([r, y]) => new THREE.Vector2(r, y)), 10), bi = IM(bg, bal, 560); for (let i = 0; i < 560; i++) bi.setMatrixAt(i, M4c(-120 + i * 0.43, 0.3, ESP.BAL)); st.scene.add(bi); }
  const flowM = STDm({ roughness: 0.8 }), FL = [], RF = RNG('flowers'), fcol = ['#e84a5a', '#f0c030', '#f4f0f0', '#d860a8', '#8a5ad0', '#f08038', '#ff7aa0'];
  for (let x = -105; x <= 105; x += 14) { st.scene.add(mesh(new THREE.BoxGeometry(0.95, 1.35, 0.95), bal, x, 0.67, ESP.BAL)); st.scene.add(mesh(new THREE.LatheGeometry([[0.001, 0], [0.28, 0.05], [0.36, 0.35], [0.24, 0.6], [0.34, 0.72], [0.001, 0.72]].map(([r, y]) => new THREE.Vector2(r, y)), 14), bal, x, 1.35, ESP.BAL)); for (let k = 0; k < 12; k++) FL.push([x + RF.n(0.3), 2.12 + RF.r(0, 0.12), ESP.BAL + RF.n(0.3)]); }
  // flower beds: along the balustrade, round the palms and between the fountain lamps
  const hedge = STDm({ map: leafTex('hedge', '#2e4a26'), roughness: 1 }), curb = stoneM('curb', '#cfc2a8');
  const bed = (x, z, w, d) => { st.scene.add(mesh(new THREE.BoxGeometry(w, 0.32, d), curb, x, 0.16, z)); const h = mesh(new THREE.BoxGeometry(w - 0.3, 0.5, d - 0.3), hedge, x, 0.5, z); st.scene.add(h); for (let k = 0, n = Math.floor(w * d * 6); k < n; k++) FL.push([x + RF.n(w / 2 - 0.25), 0.78 + RF.r(0, 0.08), z + RF.n(d / 2 - 0.25)]); };
  [-1, 1].forEach((s) => { for (let x = 9; x < 58; x += 11) bed(s * (x + 4), ESP.BAL + 3.6, 8, 1.6); for (let z = 0; z > -72; z -= 12) bed(s * 27, z - 6, 2.4, 8); });
  for (let i = 0; i < 6; i++) { const a = (i / 6 + 1 / 12) * Math.PI + Math.PI, x = Math.cos(a) * 29, z = ESP.FZ + Math.sin(a) * 29; bed(x, z, 3.2, 3.2); }
  { const m = IM(new THREE.SphereGeometry(0.075, 6, 5), flowM, FL.length, false); FL.forEach(([x, y, z], i) => { m.setMatrixAt(i, M4c(x, y, z)); m.setColorAt(i, lin(RF.pick(fcol))); }); st.scene.add(m); }
  espBay(st, S); espPalace(st, S);
  // lamps: a ring round the fountain, a row along the balustrade, the axis to the palace; the nearest ones throw light
  for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * TAU, x = Math.cos(a) * 22, z = ESP.FZ + Math.sin(a) * 22; espLamp(st, S, x, z, Math.sin(a) > -0.3); }
  [-1, 1].forEach((s) => { [7, 21, 35, 49].forEach((x, k) => espLamp(st, S, s * x, ESP.BAL + 2.4, k === 0)); [8, 22, 36].forEach((z) => espLamp(st, S, s * 6, z, false)); [-18, -42, -64].forEach((z, k) => espLamp(st, S, s * 30.5, z, s < 0 && k < 2)); });
  // cypresses (tapered) and palms; benches
  const cyp = STDm({ map: leafTex('cyp', '#24402a'), roughness: 1 }), trunk = STDm({ color: '#5a4430', roughness: 1 }); S.trees = [];
  for (let i = 0; i < 22; i++) { const s = i % 2 ? 1 : -1, x = s * R.r(31, 46), z = R.r(10, -72), h = R.r(9, 13), geo = lumpyGeo(3, 0.18, 500 + i), P = geo.attributes.position;
    for (let k = 0; k < P.count; k++) { const y = P.getY(k), f = 1 - 0.55 * clamp((y + 0.3) / 1.2); P.setX(k, P.getX(k) * f); P.setZ(k, P.getZ(k) * f); } geo.computeVertexNormals();
    const t = mesh(geo, cyp, x, h * 0.5 + 0.4, z); t.scale.set(1.25, h * 0.52, 1.25); st.scene.add(t); st.scene.add(mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.2, 6).translate(0, 0.6, 0), trunk, x, 0, z)); S.trees.push({ m: t, x, z, h, kind: 'cyp' }); }
  for (let i = 0; i < 8; i++) { const s = i % 2 ? 1 : -1, x = s * R.r(24, 29), z = R.r(-5, -64); palm(st, x, z, R.r(1.1, 1.4), 'esp' + i); S.trees.push({ x, z, h: 9, kind: 'palm' }); }
  S.benchSeats = []; const wd = STDm({ color: '#6a4a2e', roughness: 0.7 });
  for (let i = 0; i < 10; i++) { const a = (i + 0.5) / 10 * TAU + Math.PI / 2, bx = Math.cos(a) * 18.6, bz = ESP.FZ + Math.sin(a) * 18.6, yaw = Math.atan2(Math.cos(a), Math.sin(a)), bn = new THREE.Group(); bn.position.set(bx, 0, bz); bn.rotation.y = yaw; st.scene.add(bn);
    for (let q = 0; q < 4; q++) bn.add(mesh(new THREE.BoxGeometry(1.9, 0.04, 0.09), wd, 0, 0.45, -0.2 + q * 0.12)); for (let q = 0; q < 3; q++) { const b = mesh(new THREE.BoxGeometry(1.9, 0.09, 0.03), wd, 0, 0.62 + q * 0.13, -0.3 - q * 0.015); b.rotation.x = -0.12; bn.add(b); }
    [-0.85, 0.85].forEach((b) => { bn.add(mesh(new THREE.BoxGeometry(0.06, 0.45, 0.5), S.ironM, b, 0.22, -0.05)); bn.add(mesh(new THREE.BoxGeometry(0.05, 0.5, 0.05), S.ironM, b, 0.68, -0.31)); }); S.benchSeats.push([bx, bz, yaw]); }
  // people: the father with the child on his shoulders, the mother, the bubble man; couples, kids, people on the rim and benches
  const P = (o) => { const p = makePerson(o); st.scene.add(p.root); return p; };
  S.dad = P({ skin: SKINS[2], hair: HAIRS[1], hairStyle: 'short', top: '#6a86b0', bottom: '#3a4458', seed: 2101 }); S.kid = P({ kid: true, skin: SKINS[2], hair: HAIRS[2], hairStyle: 'short', top: '#f2c42c', bottom: '#c8382e', shorts: true, seed: 2102 });
  S.mom = P({ female: true, skin: SKINS[1], hair: HAIRS[0], hairStyle: 'long', top: '#c8372d', bottom: '#2b3a55', seed: 2103 }); S.bubbleMan = P({ skin: SKINS[4], hair: HAIRS[4], hairStyle: 'curly', top: '#2a9d8f', bottom: '#3a3a3a', seed: 2104 });
  { const h = S.bubbleMan.arms[1].hand, w = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.75, 6).translate(0, -0.37, 0), STDm({ color: '#8a6a40' }), 0, -0.06, 0.02); w.rotation.x = 0.9; h.add(w); const ring = mesh(new THREE.TorusGeometry(0.13, 0.012, 6, 24), STDm({ color: '#f0f0f0' }), 0, -0.75, 0); ring.rotation.x = Math.PI / 2; w.add(ring);
    const bk = mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.26, 14), STDm({ color: '#3a7ae0', roughness: 0.5 }), 0, -0.2, 0); S.bubbleMan.arms[0].hand.add(bk); }
  const RP = RNG('heroes'), O = [], spec = [];
  const add = (o, q) => { const p = P(Object.assign({ skin: RP.pick(SKINS), hair: RP.pick(HAIRS), seed: 2200 + O.length }, o)); O.push(p); spec.push(q); return p; };
  add({ female: true, hairStyle: 'pony', top: '#e86fa8', bottom: '#2b3a55' }, { k: 'walk', x: -1.8, z: -13.4, yaw: Math.PI / 2, sp: 0.5 });
  add({ hairStyle: 'short', top: '#f4f2ee', bottom: '#2a2a2a' }, { k: 'walk', x: 10.5, z: -14.2, yaw: -Math.PI / 2, sp: 0.55 });
  add({ hairStyle: 'short', top: '#3a5a8a', bottom: '#c8b89a' }, { k: 'couple', x: 2.7, z: -12.2, yaw: -0.12, sp: 0.4, side: 0 });
  add({ female: true, hairStyle: 'bob', top: '#f0c33c', bottom: '#3a3a3a', skirt: '#3a3a3a' }, { k: 'couple', x: 3.25, z: -12.27, yaw: -0.12, sp: 0.4, side: 1 });
  add({ kid: true, hairStyle: 'curly', top: '#3a8ae8', bottom: '#2b3a55', shorts: true }, { k: 'chase', x: -3.6, z: -10.6, r: 1.3, ph: 0 });
  add({ kid: true, female: true, hairStyle: 'pigtails', top: '#ff7a9a', bottom: '#f4f0f0', skirt: '#ff7a9a' }, { k: 'chase', x: -1.4, z: -12.4, r: 1.0, ph: 2.4 });
  const rim = (deg) => { const a = deg * DEG, r = ESP.FR + 0.28; return { x: Math.cos(a) * r, z: ESP.FZ + Math.sin(a) * r, yaw: Math.atan2(Math.cos(a), Math.sin(a)) }; };
  add({ hairStyle: 'short', top: '#7a5a3a', bottom: '#2b3a55' }, Object.assign({ k: 'rim', arm: 1 }, rim(101)));
  add({ female: true, hairStyle: 'long', top: '#2a9d8f', bottom: '#2b3a55' }, Object.assign({ k: 'rim', lean: 1 }, rim(104.5)));
  add({ female: true, hairStyle: 'bun', top: '#f4f1ea', bottom: '#4a4a4a', glasses: true }, Object.assign({ k: 'read' }, rim(68)));
  add({ hairStyle: 'short', top: '#1f2d3d', bottom: '#c8b89a', cap: '#c83a3a' }, { k: 'photo', x: 7.4, z: -11, yaw: Math.PI - 0.25 });
  const b0 = S.benchSeats[0], b9 = S.benchSeats[9], seat = (b, off) => ({ x: b[0] + Math.cos(b[2]) * off - Math.sin(b[2]) * 0.05, z: b[1] - Math.sin(b[2]) * off - Math.cos(b[2]) * 0.05, yaw: b[2] });
  add({ hairStyle: 'none', hair: HAIRS[6], top: '#8a7a6a', bottom: '#4a4a4a', glasses: true }, Object.assign({ k: 'bench' }, seat(b9, -0.45)));
  add({ female: true, hairStyle: 'bun', hair: HAIRS[6], top: '#7b4fc9', bottom: '#3a3a3a' }, Object.assign({ k: 'bench', lean: 1 }, seat(b9, 0.4)));
  add({ female: true, hairStyle: 'long', top: '#c2185b', bottom: '#2b3a55' }, { k: 'walk', x: 12.5, z: -12.6, yaw: -Math.PI / 2 - 0.1, sp: 0.35, hold: 1 });
  add({ kid: true, kidScale: 0.55, hairStyle: 'bob', top: '#f2c94c', bottom: '#3a8ae8' }, { k: 'walk', x: 12.45, z: -12.05, yaw: -Math.PI / 2 - 0.1, sp: 0.35, toddler: 1 });
  add({ kid: true, hairStyle: 'short', top: '#3cae5c', bottom: '#2b3a55', shorts: true }, { k: 'wand', x: 0.2, z: -9.0, yaw: Math.PI - 0.5 });
  add({ hairStyle: 'curly', top: '#d94848', bottom: '#1f2d3d' }, { k: 'stand', x: 12.5, z: -17.0, yaw: Math.PI + 0.6 });
  add({ female: true, hairStyle: 'pony', top: '#2f6fd1', bottom: '#f4f0f0' }, { k: 'stand', x: 13.1, z: -17.6, yaw: -0.9 });
  S.others = O; S.oth = spec;
  { const ph = mesh(new THREE.BoxGeometry(0.075, 0.15, 0.01), STDm({ color: '#141414', emissive: '#a8c8ff', emissiveIntensity: 0.0 }), 0, -0.1, 0.04); O[9].arms[1].hand.add(ph); S.phoneM = ph.material; }
  // the crowd (instanced): round the fountain, on the rim, at the balustrade looking at the view, groups at the sides, the palace stairs
  const CL = [], Rc = RNG('crowdpos'), ok = (x, z) => !(z > -16 && Math.abs(x - 1) < 12) && !(Math.abs(x) < 4 && z < -60);
  const addC = (x, z, yaw, o = {}) => { if (CL.length < 300 && ok(x, z)) CL.push(Object.assign({ x, z, yaw, y: 0, sp: 0, ph: Rc.r(0, 6), look: Rc.r(0.45, 0.9), point: Rc.f() < 0.22, yawUp: Rc.n(0.5) }, o)); };
  for (let i = 0; i < 120; i++) { const a = Rc.r(0, TAU), r = Rc.r(17.5, 34); if (Rc.f() < 0.4 && Math.sin(a) < -0.35) addC(Math.cos(a) * r, ESP.FZ + Math.sin(a) * r, 0, { circ: 1, a0: a, r, dir: Rc.f() < 0.5 ? 1 : -1, sp: Rc.r(0.5, 1.0) }); else addC(Math.cos(a) * r, ESP.FZ + Math.sin(a) * r, Rc.r(0, TAU)); }
  for (let i = 0; i < 34; i++) { const a = Rc.r(200, 340) * DEG, r = ESP.FR + 0.75; addC(Math.cos(a) * r, ESP.FZ + Math.sin(a) * r, Math.atan2(Math.cos(a), Math.sin(a)), { sit: 1, y: 0.45 }); }
  for (let i = 0; i < 46; i++) { const x = (Rc.f() < 0.5 ? -1 : 1) * Rc.r(6, 60); addC(x, ESP.BAL + 0.75 + Rc.r(0, 0.4), Math.PI + Rc.n(0.4), { lean: 0.12 }); }
  for (let g = 0; g < 16; g++) { const s = g % 2 ? 1 : -1, cx = s * Rc.r(9, 24), cz = Rc.r(-36, -72), n = Rc.i(2, 4); for (let k = 0; k < n; k++) { const a = k / n * TAU + Rc.n(0.3); addC(cx + Math.cos(a) * 0.7, cz + Math.sin(a) * 0.7, Math.atan2(-Math.cos(a), -Math.sin(a))); } }
  for (let i = 0; i < 26; i++) { const s = Rc.i(0, 9), sit = Rc.f() < 0.6 ? 1 : 0; addC(Rc.r(-30, 30), 46 + s * 1.2 + 0.4, Math.PI + Rc.n(0.3), { sit, y: 0.4 * (s + 1) - 0.4 * sit }); }
  S.crowd = espCrowd(CL.length, 31); st.scene.add(S.crowd.grp); S.cl = CL;
  // soap bubbles: the bubble man's big ones and the wand kid's small ones
  S.bub = []; const bgeo = new THREE.SphereGeometry(1, 20, 14), Rb = RNG('bubbles');
  for (let i = 0; i < 110; i++) { const big = i < 75, b = new THREE.Mesh(bgeo, bubbleMat()); b.renderOrder = 4; b.frustumCulled = false; st.scene.add(b);
    S.bub.push({ b, src: big ? 0 : 1, life: Rb.r(6, 13), t0: Rb.r(0, 13), r: big ? (Rb.f() < 0.25 ? Rb.r(0.3, 0.55) : Rb.r(0.08, 0.26)) : Rb.r(0.035, 0.09), v: [Rb.r(0.3, 0.6), Rb.r(0.05, 0.22), Rb.r(0.05, 0.3)], ph: Rb.r(0, 6), side: Rb.n(0.5) }); }
  return S; }
// day (sunset) → night: at 8 s the Earth outruns the sunlight; the city, lamps and fountain lights come on
function lightEsplanade(S, t, o = {}) { const st = S.st, night = t >= 8 ? 1 : 0;
  st.key.intensity = night ? 0.06 : 2.7; st.key.color.set(night ? '#6878a8' : '#ffb070'); st.hemi.intensity = night ? 0.1 : 0.42; st.hemi.color.set(night ? '#2a3458' : '#c8bcc8'); st.hemi.groundColor.set(night ? '#0c0a10' : '#7a5a44');
  st.scene.environment = night ? S.envN : S.envD;
  S.cityM.forEach((m) => (m.userData.U.uLit.value = night ? 0.75 : 0.04)); S.lampSp.forEach((m) => { if (m.isSprite) m.material.opacity = night ? (m.material === S.glareM ? 0.22 : 0.95) : 0; else m.material.emissiveIntensity = night ? 4.0 : 0.25; });
  S.lampL.forEach((L) => (L.intensity = night ? 1.0 : 0)); S.nightPts.forEach((p) => (p.visible = !!night)); S.lhouse.material.opacity = night ? 0.8 : 0; S.glit.visible = !night;
  S.flights.forEach((sp) => (sp.material.opacity = night ? 0.95 : 0)); S.wglow.material.opacity = night ? 0.55 : 0; S.fpl.intensity = night ? 1.6 : 0;
  S.jetM.emissive.set(night ? '#ffcf8a' : '#fff2dc'); S.jetM.emissiveIntensity = night ? 2.0 : 0.3; S.jetM.opacity = night ? 0.7 : 0.5; S.dropM.color.set(night ? '#ffd8a0' : '#ffffff'); S.dropM.opacity = night ? 1.0 : 0.28; S.dropM.size = night ? 0.3 : 0.15;
  S.spray.material.emissiveIntensity = night ? 1.6 : 0; S.palWin.emissiveIntensity = night ? 1.3 : 0; S.palClock.emissiveIntensity = night ? 0.9 : 0; if (S.phoneM) S.phoneM.emissiveIntensity = night ? 1.5 : 0.2;
  S.waterM.color.set(night ? '#1a3038' : '#3e6e7c'); S.waterM.emissive.set(night ? '#4a3010' : '#000000');
  S.seaM.color.set(night ? '#06101c' : '#2c4458'); S.seaM.opacity = night ? 0.6 : 0.72;
  const BU = bubbleMat().uniforms; BU.uK.value = night ? 0.4 : 1; BU.uTint.value.set(night ? '#ffd8a8' : '#ffffff');
  st.scene.fog.color.set(night ? '#07080e' : '#eab48c'); st.scene.fog.near = night ? 900 : 140; st.scene.fog.far = night ? 14000 : 3700; }
function poseEsplanade(S, t) { const ts = t < 8 ? t : t < 70 ? 8 + (t - 8) / 14 : 8 + (t - 70), tw = Math.min(ts, 8.3); // the living clock (slowed while the Earth flies); tw: walking stops at the switch
  // the fountain water: jets ripple; droplets flow along every jet; spray at the landings; glints twinkle
  S.jets.forEach((m, i) => (m.scale.y = 1 + 0.03 * Math.sin(ts * 7 + i))); S.sp.forEach(([a, r, ph, sz], i) => { const u = (ts * 0.8 + ph) % 1; S.spray.setMatrixAt(i, M4c(Math.cos(a) * r, 0.7 + u * 1.0 - u * u * 1.2 + (r < 5 ? 0.35 : 0), Math.sin(a) * r, 0, sz, sz, sz)); }); S.spray.instanceMatrix.needsUpdate = true;
  { const A = S.drops.geometry.attributes.position.array, J = S.dropJ; let i = 0;
    S.arcs.forEach(([x0, z0, x1, z1, h, y0, n]) => { for (let k = 0; k < n; k++, i++) { const u = mod(k / n + ts * 0.42 + J[i][0] * 0.04, 1); A[i * 3] = lerp(x0, x1, u) + J[i][1] * u; A[i * 3 + 1] = y0 + 4 * h * u * (1 - u); A[i * 3 + 2] = lerp(z0, z1, u) + J[i][2] * u; } });
    for (let k = 0; k < 90; k++, i++) { const u = mod(k / 90 + ts * 0.5, 1), up = k < 50, a = J[i][3]; if (up) { A[i * 3] = J[i][1]; A[i * 3 + 1] = 7.6 + 7 * u; A[i * 3 + 2] = J[i][2]; } else { const rr = 0.2 + 1.3 * u; A[i * 3] = Math.cos(a) * rr; A[i * 3 + 1] = 14.6 - 7.2 * u * u; A[i * 3 + 2] = Math.sin(a) * rr; } }
    for (let k = 0; k < 72; k++, i++) { const u = mod(k / 72 * 5 + ts * 0.9, 1), a = k / 72 * TAU + J[i][1]; A[i * 3] = Math.cos(a) * (3.5 + 0.35 * u); A[i * 3 + 1] = 3.55 - 2.55 * u * u; A[i * 3 + 2] = Math.sin(a) * (3.5 + 0.35 * u); }
    for (let k = 0; k < 56; k++, i++) { const u = mod(k / 56 * 4 + ts * 0.9, 1), a = k / 56 * TAU + J[i][1]; A[i * 3] = Math.cos(a) * (2.1 + 0.6 * u); A[i * 3 + 1] = 5.75 - 2.3 * u * u; A[i * 3 + 2] = Math.sin(a) * (2.1 + 0.6 * u); }
    S.drops.geometry.attributes.position.needsUpdate = true; }
  { const C = S.glints.geometry.attributes.color.array, night = t >= 8; S.glintP.forEach(([f, p], i) => { const b = Math.max(0, Math.sin(ts * f + p)) ** 10 * (night ? 0.5 : 1.2); C[i * 3] = b; C[i * 3 + 1] = b * (night ? 0.8 : 0.95); C[i * 3 + 2] = b * (night ? 0.55 : 0.85); }); S.glints.geometry.attributes.color.needsUpdate = true; }
  S.waterM.normalMap.offset.set(ts * 0.02, ts * 0.013); S.seaM.normalMap.offset.set(ts * 0.004, -ts * 0.006); S.glitM.map.offset.y = -ts * 0.08;
  // people
  const up = t > 8.3 ? 1 : 0, scared = ss(52, 56, t), emo = t < 8 ? { smile: 0.6 } : t < 46 ? { surprise: 0.7, open: 0.3 } : { fear: 0.6 + 0.4 * scared, open: 0.5 }, run = t > 52 && t < 62 ? 0.4 : 0;
  { const yaw = -2.45, f = [Math.sin(yaw), Math.cos(yaw)], d = 0.22 * tw;
    posePerson(S.dad, { x: -2.3 + f[0] * d, z: -4.6 + f[1] * d, yaw, walk: t < 8 ? 0.7 : 0, ph: ts * 4, headPitch: -0.55 * up, headYaw: up ? 0.2 : -0.15, armL: [1.05, 0.28, 1.55], armR: [1.05, 0.28, 1.55], emo });
    S.dad.root.updateMatrixWorld(true); const n = new THREE.Vector3(); S.dad.neck.getWorldPosition(n);
    posePerson(S.kid, { x: n.x - f[0] * 0.1, y: n.y - 0.32, z: n.z - f[1] * 0.1, yaw, sit: 1, legL: [-1.25, 1.55], legR: [-1.25, 1.55], armL: up ? [3.0, 0.25, 0.05] : [2.3 + 0.2 * Math.sin(ts * 2), 0.35, 0.3], armR: up ? [1.2, 0.3, 1.2] : [1.0, 0.25, 1.4], headPitch: up ? -0.75 : -0.25, headYaw: up ? 0 : 0.45, emo: t < 8 ? { smile: 1, open: 0.5 } : { surprise: 1, open: 0.7 } });
    S.kid.legs[0].th.rotation.z = -0.5; S.kid.legs[1].th.rotation.z = 0.5; }
  posePerson(S.mom, { x: -0.9 + Math.sin(-2.6) * 0.22 * tw, z: -6.2 + Math.cos(-2.6) * 0.22 * tw, yaw: -2.6, walk: t < 8 ? 0.7 : 0, ph: ts * 4 + 1.3, headPitch: -0.65 * up, headYaw: up ? -0.2 : 0.3, armR: up ? [2.9, 0.15, 0.08] : undefined, emo });
  { const sw = Math.sin(ts * 1.6); posePerson(S.bubbleMan, { x: -8.4, z: -10.6, yaw: 0.95, armR: up ? [0.4, 0.15, 0.3] : [1.5 + 0.55 * sw, 0.35 + 0.3 * Math.sin(ts * 0.8), 0.35], armL: [0.15, 0.12, 0.35], headPitch: up ? -0.7 : -0.15, headYaw: up ? 0 : 0.3 * sw, emo }); }
  S.others.forEach((p, i) => { const q = S.oth[i], lk = { headPitch: -(0.55 + 0.25 * ((i * 0.37) % 1)) * up, headYaw: up ? ((i * 0.61) % 1 - 0.5) * 0.6 : 0, emo }; let Q;
    if (q.k === 'walk' || q.k === 'couple') { const v = q.sp * tw; Q = { x: q.x + Math.sin(q.yaw) * v, z: q.z + Math.cos(q.yaw) * v, yaw: q.yaw, walk: t < 8 ? (q.toddler ? 1.2 : 1) : 0, run, ph: ts * (q.toddler ? 7 : 5) + i };
      if (q.k === 'couple') Q[q.side ? 'armL' : 'armR'] = [0.35, q.side ? 0.1 : 0.12, 1.2]; if (q.hold) Q.armL = [0.25, 0.25, 0.1]; if (q.toddler) Q.armR = [0.9, -0.1, 0.1]; if (up && i % 3 === 0) Q.armR = [2.85, 0.2, 0.1]; }
    else if (q.k === 'chase') { const a = q.ph + 1.6 * tw, cx = q.x + Math.cos(a) * q.r, cz = q.z + Math.sin(a) * q.r; Q = { x: cx, z: cz, yaw: Math.atan2(-Math.sin(a), Math.cos(a)), run: t < 8 ? 0.8 : 0, ph: ts * 9 + q.ph, armR: [2.6 + 0.3 * Math.sin(ts * 5 + i), 0.3, 0.25], armL: up ? [2.8, 0.4, 0.2] : [1.2, 0.3, 0.6] }; }
    else if (q.k === 'rim' || q.k === 'read' || q.k === 'bench') { Q = { x: q.x, y: q.k === 'bench' ? 0.0 : 0.43, z: q.z, yaw: q.yaw, sit: 1, lean: q.lean ? 0.08 : 0, armL: [0.55, 0.15, 0.9], armR: q.k === 'read' && !up ? [0.75, -0.1, 1.5] : up && q.arm ? [2.85, 0.15, 0.1] : [0.55, 0.15, 0.9], headPitch: q.k === 'read' && !up ? 0.45 : lk.headPitch }; }
    else if (q.k === 'photo') Q = { x: q.x, z: q.z, yaw: q.yaw, armR: up ? [2.6, 0.05, 0.35] : [1.45, -0.05, 1.35], armL: up ? [2.5, 0.1, 0.5] : [1.4, 0.05, 1.4], headPitch: up ? -0.7 : 0.05 };
    else if (q.k === 'wand') Q = { x: q.x, z: q.z, yaw: q.yaw, armR: up ? [2.9, 0.2, 0.05] : [1.6, -0.2, 1.7], armL: [0.3, 0.15, 0.4] };
    else Q = { x: q.x, z: q.z, yaw: q.yaw, armR: up && i % 2 ? [2.85, 0.2, 0.1] : [0.3, 0.12, 0.5 + 0.3 * Math.sin(ts * 1.3 + i)], headYaw: up ? 0 : 0.3 * Math.sin(ts * 0.7 + i) };
    posePerson(p, Object.assign({ emo }, lk, Q)); });
  // the crowd: circling and standing; at the switch they stop and look up, some pointing
  S.cl.forEach((c, i) => { let x = c.x, z = c.z, yaw = c.yaw; if (c.circ) { const a = c.a0 + c.dir * c.sp * tw / c.r; x = Math.cos(a) * c.r; z = ESP.FZ + Math.sin(a) * c.r; yaw = Math.atan2(-Math.sin(a) * c.dir, Math.cos(a) * c.dir); }
    const walking = c.circ && t < 8, st = walking ? 0.35 * Math.sin(ts * 5 + c.ph) : 0;
    S.crowd.set(i, x, c.y, z, yaw + (up ? c.yawUp * 0.3 : 0), 1, 0, walking ? 0 : 0.03 * Math.sin(ts * 1.5 + c.ph), 0, { stride: st, look: up ? c.look : (c.lean ? 0.2 : 0), point: up && c.point, sit: c.sit || 0, lean: up ? 0 : c.lean || 0 }); }); S.crowd.done();
  // soap bubbles: born at the wand, drifting downwind, wobbling, popping
  const bm = S.bubbleMan.root.position;
  S.bub.forEach((b) => { const age = mod(ts - b.t0, b.life), tb = ts - age, src = b.src ? S.others[14].root.position : bm, yw = b.src ? -2.6 : 0.95, lat = b.src ? 0 : 0.35 * Math.sin(tb * 0.8) + b.side * 0.4, hy = b.src ? 1.0 : 1.55 + 0.45 * Math.sin(tb * 1.6), fw = b.src ? 0.3 : 0.7;
    const ex = src.x + Math.sin(yw) * fw + Math.cos(yw) * lat, ez = src.z + Math.cos(yw) * fw - Math.sin(yw) * lat;
    b.b.position.set(ex + b.v[0] * age + 0.25 * Math.sin(age * 1.3 + b.ph), hy + b.v[1] * age + 0.15 * Math.sin(age * 2.1 + b.ph), ez + b.v[2] * age + 0.2 * Math.cos(age * 1.1 + b.ph)); b.b.scale.setScalar(b.r * Math.min(1, age * 3)); b.b.visible = age < b.life - 0.05; }); }
