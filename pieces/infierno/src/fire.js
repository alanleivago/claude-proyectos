// =====================================================================
//  FIRE — the shared fire library. Everything is GPU-side: one instanced draw per system, so 3000 flames + 3000 embers +
//  smoke + a lava floor cost ~10 ms on the GPU. Flames and lava run on FIRE_T (= TT, set by main.js).
//  API (signatures are a contract — keep them):
//    makeFlames(scene, n, o)  → F; F.set(i, x, y, z, h, w, k) places flame i: base at (x,y,z), h tall, w wide (metres),
//                               k 0..1 strength (scales brightness and, 45→100 %, size; k=0 hides). F.done() after
//                               setting (positions persist between frames). Turns about the vertical to face the camera
//                               and leans toward a camera above. Shader: layered fbm scrolling up, teardrop that splits
//                               into licking tongues, white-yellow core → orange → deep red edge; detail and churn speed
//                               follow on-screen / world size (a far flame is a soft glowing drop, a 20 m flame has
//                               tongues, rising streaks and dark soot pockets and churns slower). Glow is additive; the
//                               bright body partly hides what is behind (no white-out when flames overlap).
//                               o: { color (tint, '#ffffff'), seed, intensity (1.05), occlude (0.8), wind (lean +x, 0) }
//                               F.mesh, F.U (F.U.uI.value intensity, F.U.uOcc.value, F.U.uWind.value.x)
//    makeEmbers(scene, n, o)  → E; E.update(t, centre: Vector3, radius, height) — sparks rising in a cylinder (centre = its
//                               base), drawn as thin glowing streaks along their screen motion, flicker, turbulence,
//                               fade in/out over their life; their clock is the t you pass. o: { size (1), rise (1 = cross
//                               the volume in ~4–12 s), turb (1), color (spark colour, '#ff6a1a'; the hottest sparks go
//                               yellow-white), seed, intensity (1) }. size is relative: 1 ≈ 3 cm sparks (~3 px at 20 m), streak width
//                               is clamped to 1.3–7 px. E.mesh (renderOrder 2)
//    makeSmoke(scene, n, o)   → S; S.update(t, centre, radius, height, k) — dark fbm billows rising from the base disc,
//                               growing and slowly turning, lit warm orange from below; k 0..1 fades (0 hides); clock = t.
//                               o: { size (0.55·radius, a puff near the top), rise (1), dark (alias color, '#120c0a'),
//                               warm ('#ff7a30'), opacity (0.85), seed }; S.mesh (renderOrder 1: after flames)
//    lavaMat(o)               → MeshStandardMaterial (onBeforeCompile) for lava / cracked glowing crust on ANY surface:
//                               3D Voronoi on the world position (floors, walls, ceilings, InstancedMesh rocks; fog OK).
//                               Basalt plates (dark, rough, bumped) with glowing jagged cracks that pulse and flow, hot
//                               regions, rim heat and hairline cracks on the plates. o: { scale: cell size in m (2),
//                               glow (1), crust: 0 molten flowing lava with floating skins … 1 solid cracked crust (0.7),
//                               flow (1), bump (1) }. m.userData.U = { uScale, uGlow, uCrust, uFlow, uBump } to animate.
//    heatHaze(t, amt)         → 2D post on ctx: 6 px horizontal strips waving upward, amt 0..1, stronger low in the frame
//                               (main.js calls it after the 3D render and before the overlays, so text never moves)
//  Extras:
//    fireRamp(h)              → THREE.Color of the flame temperature ramp, h 0 (black) … 0.42 orange … 1 (white-yellow)
//    fireLight(scene, x, y, z, o) → PointLight; call L.flicker(k = 1) each frame to make it breathe like fire.
//                               o: { color ('#ff7a2a'), intensity (4), dist (60 m reach), decay (2), seed }
//    fireGLSL                 → GLSL chunk for other shaders: hashes fH2/fH3/fH33, value noise fN2/fN3, fbm fFbm2/fFbm3
//                               (+ cheap fFbm2s/fFbm3s), fire ramp fRamp(h)
// =====================================================================
const fireGLSL = `
float fH2(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float fH3(vec3 p3){ p3 = fract(p3 * .1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
vec3 fH33(vec3 p3){ p3 = fract(p3 * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yxz + 33.33); return fract((p3.xxy + p3.yxx) * p3.zyx); }
float fN2(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(fH2(i), fH2(i + vec2(1, 0)), u.x), mix(fH2(i + vec2(0, 1)), fH2(i + vec2(1, 1)), u.x), u.y); }
float fN3(vec3 p){ vec3 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(mix(fH3(i), fH3(i + vec3(1, 0, 0)), u.x), mix(fH3(i + vec3(0, 1, 0)), fH3(i + vec3(1, 1, 0)), u.x), u.y),
             mix(mix(fH3(i + vec3(0, 0, 1)), fH3(i + vec3(1, 0, 1)), u.x), mix(fH3(i + vec3(0, 1, 1)), fH3(i + vec3(1, 1, 1)), u.x), u.y), u.z); }
float fFbm2(vec2 p){ float s = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 5; i++) { s += a * fN2(p); p = m * p + 7.3; a *= .5; } return s / .97; }
float fFbm3(vec3 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * fN3(p); p = p * 2.03 + vec3(3.1, 1.7, 5.3); a *= .5; } return s / .94; }
float fFbm2s(vec2 p){ float s = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 3; i++) { s += a * fN2(p); p = m * p + 7.3; a *= .5; } return s / .875; }
float fFbm3s(vec3 p){ return (fN3(p) * .667 + fN3(p * 2.03 + 3.1) * .333); }
vec3 fRamp(float h){ vec3 c = mix(vec3(0.), vec3(.42, .025, .0), smoothstep(0., .2, h));
  c = mix(c, vec3(1., .16, .01), smoothstep(.14, .42, h)); c = mix(c, vec3(1., .38, .05), smoothstep(.38, .68, h));
  c = mix(c, vec3(1., .66, .25), smoothstep(.64, .9, h)); return mix(c, vec3(1., .93, .78), smoothstep(.88, 1.12, h)); }
`;
const FIRE_RAMP = [[0, '#000000'], [0.2, '#6b1a00'], [0.42, '#ff5a0c'], [0.68, '#ffa23c'], [0.9, '#ffd690'], [1.12, '#fff6e6']];
function fireRamp(h) { const K = FIRE_RAMP; if (h <= 0) return lin(K[0][1]); for (let i = 1; i < K.length; i++) if (h <= K[i][0]) return C3(K[i - 1][1], K[i][1], (h - K[i - 1][0]) / (K[i][0] - K[i - 1][0])); return lin(K[K.length - 1][1]); }
function fireLight(scene, x, y, z, o = {}) { const L = new THREE.PointLight(o.color || '#ff7a2a', o.intensity ?? 4, o.dist ?? 60, o.decay ?? 2); L.position.set(x, y, z); scene.add(L);
  const base = L.intensity, sd = o.seed ?? x * 0.37 + z * 0.71; L.flicker = (k = 1) => { const t = FIRE_T.value; L.intensity = base * k * (0.82 + 0.1 * Math.sin(t * 11 + sd) + 0.05 * Math.sin(t * 23.7 + sd * 3) + 0.03 * Math.sin(t * 41 + sd * 7)); }; return L; }
// additive / fog bits shared by the particle shaders (fog fades additive light instead of painting the quad fog-coloured)
const fireFogFade = `
#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogF = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
  #else
    float fogF = smoothstep(fogNear, fogFar, vFogDepth);
  #endif
  col *= 1.0 - 0.9 * fogF;
#endif
`;
const fireShader = (U, vs, fs, o = {}) => new THREE.ShaderMaterial(Object.assign({ uniforms: Object.assign(THREE.UniformsUtils.merge([THREE.UniformsLib.fog]), U), vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false, fog: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }, o));
const fireQuad = (n, attrs) => { const g = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 1)); g.instanceCount = n; for (const k in attrs) g.setAttribute(k, new THREE.InstancedBufferAttribute(attrs[k], 4)); return g; };

// ---------------------------------------------------------------- flames
const fireFlameVS = `
attribute vec4 aP;   // x y z (base) k
attribute vec4 aD;   // w h seed lean
uniform float uT, uRes; uniform vec2 uWind;
varying vec2 vQ; varying float vK, vSeed, vPx, vAsp, vDim, vSpd;
#include <fog_pars_vertex>
void main(){
  vK = aP.w; vSeed = aD.z; if (vK <= 0.001) { gl_Position = vec4(2., 2., 2., 1.); return; }
  vec3 c = (modelMatrix * vec4(aP.xyz, 1.)).xyz;
  float sz = mix(0.45, 1.0, clamp(vK, 0., 1.)), sw = aD.x * sz, sh = aD.y * sz;
  vSpd = clamp(1.5 / sqrt(max(sh, 0.05)), 0.3, 1.8);              // big fires churn slower (flicker ~ 1/sqrt(size))
  vec3 toC = cameraPosition - c; float dist = length(toC); toC /= max(dist, 1e-4);
  vec3 up = vec3(0., 1., 0.), right = cross(up, toC); float rl = length(right); right = rl > 1e-3 ? right / rl : vec3(1., 0., 0.);
  vec3 ax = normalize(up - toC * dot(up, toC) * 0.75);
  // projected size; tiny flames are kept >= 4 px and dimmed so they don't sparkle
  float depth = max(-(viewMatrix * vec4(c, 1.)).z, 0.05);
  vPx = sh * projectionMatrix[1][1] * 0.5 * uRes / depth;
  float sc = max(1., 4. / max(vPx, 0.01)); sw *= sc; sh *= sc; vDim = 1. / (sc * sc); vPx *= sc;
  float fl = 1. + (0.07 * sin(uT * 9.3 * vSpd + vSeed * 40.) + 0.05 * sin(uT * 21.7 * vSpd + vSeed * 13.)) * min(vSpd, 1.) - 0.06;
  vec2 q = vec2(position.x * 1.7, uv.y * 1.32 - 0.13);   // flame space: x in widths, y in heights (0 = base, 1 = tip)
  vQ = q; vAsp = sw / sh;
  float lean = (aD.w + uWind.x) * q.y * q.y;
  vec3 toH = normalize(vec3(toC.x, 0., toC.z) + 1e-5);
  vec3 p = c + toH * sw * 0.25 + right * (q.x + lean) * sw + ax * (q.y + 0.13) * sh * fl;   // base above the anchor, nudged toward the camera
  vec4 mvPosition = viewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const fireFlameFS = `
uniform float uT, uI, uOcc; uniform vec3 uTint;
varying vec2 vQ; varying float vK, vSeed, vPx, vAsp, vDim, vSpd;
#include <fog_pars_fragment>
${fireGLSL}
void main(){
  float X = vQ.x, Y = vQ.y, s = vSeed * 31.7;
  float t = uT * vSpd * (0.85 + 0.3 * fract(vSeed * 7.13));
  float det = clamp((vPx - 8.) / 220., 0., 1.);                   // detail level from on-screen size
  float fm = mix(1., 1.8, det), ax = vAsp * 2.6 * fm;             // noise ~isotropic in world space; finer when big
  // two layers of upward-scrolling, domain-warped fbm: big licks + fine turbulence
  float n1 = fFbm2(vec2(X * ax + s, Y * 2.2 * fm - t * 2.4));
  float n2 = fFbm2(vec2(X * ax * 2.3 - s + n1 * 1.4, Y * 4.6 * fm - t * 5.2 + n1 * 1.2));
  float n3 = fN2(vec2(X * ax * 6. + n2 * 2., Y * 9. * fm - t * 9.));
  float sway = ((n1 - 0.5) * 0.75 * Y * Y + 0.06 * sin(t * 1.9 + s) * Y) * mix(0.4, 1., det);
  float xx = X - sway, yy = clamp(Y, 0., 1.);
  // teardrop: round base, widest at ~20 %, long tapering tip
  float sv = fract(vSeed * 13.7), sv2 = fract(vSeed * 29.3);
  float wid = 0.5 * pow(1. - yy, mix(0.5, 0.95, sv)) * (0.6 + 0.4 * smoothstep(0., 0.22, yy));
  float d = abs(xx) / max(wid, 1e-3);
  float turb = mix(n2, n2 * 0.75 + n3 * 0.25, det);
  float erode = (turb * 1.35 - 0.5) * (0.15 + 1.45 * Y) * mix(0.4, 1., det) * mix(0.8, 1.35, sv2);
  // fingers: the upper body splits into separate licking tongues
  float fing = fN2(vec2(xx * ax * 2.6 + s * 1.7, Y * 1.3 * fm - t * 1.9));
  erode += (0.55 - fing) * smoothstep(0.15, 0.9, Y) * mix(0.12, 1.1, det);
  float heat = (1. - d) * 0.95 + (1. - Y) * 0.12 - erode;
  heat *= smoothstep(-0.13, 0.1, Y + (n1 - 0.5) * 0.12);
  // sharp licking edges on big flames, soft blobs when tiny
  float a = smoothstep(0.0, mix(0.32, 0.04, det), heat);
  float core = exp(-d * d * 4.) * (1. - smoothstep(0.05, 0.6, Y)) * smoothstep(-0.02, 0.2, Y);
  float fil = pow(1. - abs(fN2(vec2(X * ax * 4.5 + n1 * 2.2, Y * 1.7 - t * 3.2 + s)) * 2. - 1.), 2.5);   // soft rising streaks
  float soot = smoothstep(0.42, 0.18, n2) * smoothstep(0.2, 0.7, Y);                                        // dark rolling pockets
  float temp = heat * 0.78 + core * 0.26 + ((n2 - 0.5) * 0.5 + (n3 - 0.5) * 0.25 + (fil - 0.4) * 0.22 - soot * 0.45) * det - Y * 0.14;
  temp *= mix(0.8, 1., smoothstep(-0.12, 0.14, Y));
  vec3 col = fRamp(clamp(temp, 0.05, 1.2)) * a * (0.22 + 0.78 * smoothstep(0.12, 1.0, temp));
  // soft outer halo (reads as glow at distance), clipped to the quad
  float halo = exp(-d * 1.6) * smoothstep(-0.13, 0.12, Y) * (1. - smoothstep(0.15, 1.05, Y)) * (1. - smoothstep(0.55, 0.85, abs(X)));
  col += vec3(1., 0.25, 0.03) * halo * (1. - a) * mix(0.3, 0.1, det);
  float k = uI * vK * vDim * (0.84 + 0.16 * fN2(vec2(uT * 7., s)));
  col *= k; float al = a * smoothstep(0.12, 0.75, temp) * uOcc * min(1., vK * vDim * 1.5);   // only the bright body occludes
  ${fireFogFade}
  #ifdef USE_FOG
    al *= 1.0 - 0.9 * fogF;
  #endif
  gl_FragColor = vec4(col * uTint, al);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}`;
function makeFlames(scene, n, o = {}) {
  const P = new Float32Array(n * 4), D = new Float32Array(n * 4), sd = o.seed ?? 1;
  for (let i = 0; i < n; i++) { D[i * 4 + 2] = hsh(i, 3.1 + sd); D[i * 4 + 3] = (hsh(i, 5.7 + sd) - 0.5) * 0.25; }
  const g = fireQuad(n, { aP: P, aD: D }), U = { uT: FIRE_T, uRes: { value: H }, uI: { value: o.intensity ?? 1.05 }, uOcc: { value: o.occlude ?? 0.8 }, uTint: { value: lin(o.color || '#ffffff') }, uWind: { value: new THREE.Vector2(o.wind || 0, 0) } };
  const mesh = new THREE.Mesh(g, fireShader(U, fireFlameVS, fireFlameFS, { blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor })); mesh.frustumCulled = false; mesh.renderOrder = 0; scene.add(mesh);
  const aP = g.attributes.aP, aD = g.attributes.aD;
  return { mesh, U, n,
    set(i, x, y, z, h, w, k) { const j = i * 4; P[j] = x; P[j + 1] = y; P[j + 2] = z; P[j + 3] = k > 0.002 ? k : 0; D[j] = w; D[j + 1] = h; },
    done() { aP.needsUpdate = true; aD.needsUpdate = true; } };
}

// ---------------------------------------------------------------- embers
const fireEmberVS = `
attribute vec4 aS;
uniform float uT, uR, uH, uSize, uRise, uTurb, uRes; uniform vec3 uC;
varying vec2 vQ; varying float vA, vHot, vStreak;
#include <fog_pars_vertex>
vec3 emPos(float u, float t){
  float a = aS.x * 6.2832, rr = sqrt(aS.y) * uR, y = u * uH;
  vec3 p = uC + vec3(cos(a) * rr, y, sin(a) * rr);
  float k = uTurb * (0.05 * uH + 0.15 * uR) * (0.3 + u);
  p.x += k * (sin(y * 0.21 + t * 0.9 + aS.w * 9.) * 0.6 + sin(y * 0.67 - t * 1.7 + aS.z * 7.) * 0.4) * 0.35;
  p.z += k * (cos(y * 0.19 - t * 0.8 + aS.z * 11.) * 0.6 + sin(y * 0.53 + t * 1.3 + aS.x * 5.) * 0.4) * 0.35;
  return p;
}
void main(){
  float L = (4. + 8. * aS.w) / max(uRise, 1e-3), dt = 0.08;
  float ph = aS.z + uT / L, u = fract(ph);
  vec3 p0 = emPos(u, uT), p1 = emPos(u - dt / L, uT - dt);
  p0 = (modelMatrix * vec4(p0, 1.)).xyz; p1 = (modelMatrix * vec4(p1, 1.)).xyz;
  vec4 c0 = projectionMatrix * viewMatrix * vec4(p0, 1.), c1 = projectionMatrix * viewMatrix * vec4(p1, 1.);
  if (c0.w < 0.05 || c1.w < 0.05) { gl_Position = vec4(2., 2., 2., 1.); return; }
  vec2 hr = vec2(uRes * ${(W / H).toFixed(6)}, uRes) * 0.5;
  vec2 s0 = c0.xy / c0.w * hr, s1 = c1.xy / c1.w * hr, dv = s0 - s1; float len = length(dv);
  vec2 dir = len > 1e-3 ? dv / len : vec2(0., 1.), nrm = vec2(dir.y, -dir.x);
  float px = uSize * (0.35 + aS.y * aS.y * 1.2) * 0.03 * projectionMatrix[1][1] * hr.y / c0.w;
  float wpx = clamp(px, 1.3, 7.); len = min(len, 320.);
  vec2 mid = s0 - dir * len * 0.5;
  vec2 sp = mid + dir * position.y * (len + wpx * 3.) + nrm * position.x * wpx * 3.;
  gl_Position = vec4(sp / hr * c0.w, c0.z, c0.w);
  vQ = vec2(position.x * 3., position.y); vStreak = len / (len + wpx * 3.);
  float life = smoothstep(0., 0.08, u) * (1. - smoothstep(0.6, 1., u));
  float fl = 0.55 + 0.45 * sin(uT * (9. + aS.x * 14.) + aS.y * 50.);
  vA = life * fl * min(1., px / 1.3) * clamp(sqrt(wpx * 4. / (len + wpx * 4.)), 0.4, 1.);
  vHot = aS.w;
  vec4 mvPosition = viewMatrix * vec4(p0, 1.);
  #include <fog_vertex>
}`;
const fireEmberFS = `
uniform float uI; uniform vec3 uCol;
varying vec2 vQ; varying float vA, vHot, vStreak;
#include <fog_pars_fragment>
void main(){
  float across = exp(-vQ.x * vQ.x * 3.);
  float al = vQ.y + 0.5, along = smoothstep(0., mix(0.5, 0.95, vStreak), al) * (1. - smoothstep(0.86, 1., al));
  float core = exp(-vQ.x * vQ.x * 14.) * along;
  vec3 hot = mix(uCol * vec3(1., 1.5, 2.), mix(uCol, vec3(1., .85, .6), 0.55), vHot * vHot);
  vec3 col = (hot * across * along * 0.5 + mix(hot, vec3(1., .85, .55), 0.6) * core * 2.2) * vA * uI * 3.8;
  ${fireFogFade}
  gl_FragColor = vec4(col, 1.);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}`;
function makeEmbers(scene, n, o = {}) {
  const S = new Float32Array(n * 4), sd = o.seed ?? 2; for (let i = 0; i < n * 4; i++) S[i] = hsh(i, 9.3 + sd);
  const U = { uT: { value: 0 }, uRes: { value: H }, uC: { value: new THREE.Vector3() }, uR: { value: 10 }, uH: { value: 10 }, uSize: { value: o.size ?? 1 }, uRise: { value: o.rise ?? 1 }, uTurb: { value: o.turb ?? 1 }, uI: { value: o.intensity ?? 1 }, uCol: { value: lin(o.color || '#ff6a1a') } };
  const mesh = new THREE.Mesh(fireQuad(n, { aS: S }), fireShader(U, fireEmberVS, fireEmberFS)); mesh.frustumCulled = false; mesh.renderOrder = 2; scene.add(mesh);
  return { mesh, U, update(t, c, r, h) { U.uT.value = t; U.uC.value.set(c.x, c.y, c.z); U.uR.value = r; U.uH.value = h; } };
}

// ---------------------------------------------------------------- smoke
const fireSmokeVS = `
attribute vec4 aS;
uniform float uT, uR, uH, uSz, uRise; uniform vec3 uC;
varying vec2 vQ; varying float vU, vSeed, vRot;
#include <fog_pars_vertex>
void main(){
  float L = (12. + 10. * aS.w) / max(uRise, 1e-3), u = fract(aS.z + uT / L);
  float a = aS.x * 6.2832, rr = sqrt(aS.y) * uR * (0.55 + 0.6 * u);
  vec3 c = uC + vec3(cos(a) * rr, u * uH, sin(a) * rr);
  c.x += sin(uT * 0.11 + aS.w * 8.) * uR * 0.12 * u; c.z += cos(uT * 0.09 + aS.x * 8.) * uR * 0.12 * u;
  c = (modelMatrix * vec4(c, 1.)).xyz;
  float size = uSz * mix(0.3, 1., pow(u, 0.6)) * (0.7 + 0.6 * aS.y);
  vec3 cr = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]), cu = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 p = c + (cr * position.x + cu * position.y) * size;
  vQ = position.xy * 2.; vU = u; vSeed = aS.y * 17. + aS.x * 5.; vRot = aS.w * 6.28 + uT * (aS.x - 0.5) * 0.12;
  vec4 mvPosition = viewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const fireSmokeFS = `
uniform float uT, uK, uOp; uniform vec3 uDark, uWarm;
varying vec2 vQ; varying float vU, vSeed, vRot;
#include <fog_pars_fragment>
${fireGLSL}
void main(){
  float cs = cos(vRot), sn = sin(vRot); vec2 q = mat2(cs, sn, -sn, cs) * vQ;
  float r = length(vQ);
  vec2 w = vec2(fFbm2s(q * 1.3 + vSeed), fFbm2s(q * 1.3 - vSeed + 4.1)) - 0.5;
  vec2 np = q * 1.7 + w * 1.4 + vec2(vSeed, -uT * 0.04);
  float n = fFbm2(np), nb = fFbm2(np + vec2(0., 0.22));       // nb: sample nearer the fire below
  float dens = smoothstep(1.0, 0.25, r + (0.5 - n) * 0.85) * smoothstep(0.15, 0.6, n + 0.2 * (1. - r));
  float lit = clamp((nb - n) * 4. + 0.45, 0., 1.) * clamp(0.6 - vQ.y * 0.5, 0., 1.);
  float below = pow(1. - vU, 2.2);
  vec3 col = uDark * (0.7 + 0.6 * n) + uWarm * lit * (0.03 + 1.0 * below) * (0.6 + 0.8 * (1. - n));
  float a = dens * uK * uOp * smoothstep(0., 0.12, vU) * (1. - smoothstep(0.65, 1., vU));
  gl_FragColor = vec4(col, a);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
  #include <fog_fragment>
}`;
function makeSmoke(scene, n, o = {}) {
  const S = new Float32Array(n * 4), sd = o.seed ?? 3; for (let i = 0; i < n * 4; i++) S[i] = hsh(i, 4.7 + sd);
  const U = { uT: { value: 0 }, uC: { value: new THREE.Vector3() }, uR: { value: 10 }, uH: { value: 10 }, uSz: { value: 5 }, uRise: { value: o.rise ?? 1 }, uK: { value: 1 }, uOp: { value: o.opacity ?? 0.85 }, uDark: { value: lin(o.dark || o.color || '#120c0a') }, uWarm: { value: lin(o.warm || '#ff7a30') } };
  const mesh = new THREE.Mesh(fireQuad(n, { aS: S }), fireShader(U, fireSmokeVS, fireSmokeFS, { blending: THREE.NormalBlending })); mesh.frustumCulled = false; mesh.renderOrder = 1; scene.add(mesh);
  return { mesh, U, update(t, c, r, h, k = 1) { U.uT.value = t; U.uC.value.set(c.x, c.y, c.z); U.uR.value = r; U.uH.value = h; U.uSz.value = o.size ?? r * 0.55; U.uK.value = k; mesh.visible = k > 0.003; } };
}

// ---------------------------------------------------------------- lava / glowing crust
function lavaMat(o = {}) {
  const U = { uT: FIRE_T, uScale: { value: o.scale ?? 2 }, uGlow: { value: o.glow ?? 1 }, uCrust: { value: o.crust ?? 0.7 }, uFlow: { value: o.flow ?? 1 }, uBump: { value: o.bump ?? 1 } };
  const m = STDm({ color: '#ffffff', roughness: 0.85 }); m.userData.U = U;
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
    sh.vertexShader = 'varying vec3 vLW;\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      vec4 lw = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        lw = instanceMatrix * lw;
      #endif
      vLW = (modelMatrix * lw).xyz;`);
    sh.fragmentShader = `uniform float uT, uScale, uGlow, uCrust, uFlow, uBump; varying vec3 vLW;
${fireGLSL}
vec3 fVor(vec3 p){ vec3 i = floor(p), f = fract(p); float d1 = 8., d2 = 8., id = 0.;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec3 g = vec3(x, y, z), r = g + fH33(i + g) * 0.9 + 0.05 - f; float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; id = fH3(i + g + 17.1); } else if (d < d2) d2 = d; }
  return vec3(sqrt(d1), sqrt(d2) - sqrt(d1), id); }
` + sh.fragmentShader
      .replace('#include <map_fragment>', `#include <map_fragment>
  vec3 P = vLW / uScale; float tt = uT * uFlow, cr = clamp(uCrust, 0., 1.);
  float fw = length(fwidth(P));
  vec3 drift = vec3(0.09, 0.0, 0.06) * tt * (1. - cr);
  vec3 wq = P * 0.6 + drift * 0.5;
  vec3 wv = vec3(fFbm3(wq + 3.1), fFbm3(wq + 7.7), fFbm3(wq + 1.3)) - 0.5;
  vec3 V = fVor(P + wv * 0.75 - drift);
  float edge = max(V.y + (fFbm3s(P * 5.5) - 0.5) * 0.09, 0.), cid = V.z;   // jagged crack edges
  float hot = fFbm3s(P * 0.16 + vec3(0., tt * 0.02, 0.));
  float heatF = smoothstep(0.32, 0.78, hot);
  float cw = mix(0.5, 0.055, cr) * (0.55 + 0.9 * heatF);
  float cwA = cw + fw * 0.8, aa = mix(1., cw / cwA, cr);            // widen sub-pixel cracks, keep their energy
  float fn = fFbm3(P * 2.6 + vec3(tt * 0.12, -tt * 0.21, tt * 0.17));
  float pulse = 0.72 + 0.28 * sin(tt * 1.4 + cid * 6.28 + hot * 9.);
  // skins: molten -> only some cells keep a (shrunk) crust; solid -> all
  float keep = step(cid, mix(0.5, 1.01, cr));
  float plate = keep * smoothstep(cwA * 0.85, cwA * 1.05 + 0.03, edge);
  // fine hairline cracks inside plates (fade out when sub-pixel)
  float fineA = 1. - smoothstep(0.08, 0.25, fw * 3.);
  float fine = 0.;
  if (fineA > 0.01) { vec3 V2 = fVor(P * 3.1 + wv * 1.5 + 9.3); fine = (1. - smoothstep(0., 0.07 + fw * 3., V2.y)) * fineA * plate * (0.25 + 0.75 * heatF); }
  float grit = fFbm3(P * 7.0);
  // temperature of the surface
  float vein = pow(1. - abs(fFbm3(P * 0.9 + vec3(tt * 0.06, -tt * 0.1, 0.) + wv) * 2. - 1.), 7.);
  float film = smoothstep(0.42, 0.6, fFbm3s(P * 1.3 + vec3(tt * 0.05, 0., -tt * 0.04)));   // cooling film on open lava
  float Tm = (0.16 + 0.16 * fn + 0.62 * vein + 0.16 * heatF) * (1. - 0.55 * film);          // open molten lava
  float Tc = (0.58 + 0.42 * (1. - edge / max(cwA, 1e-3))) * (0.7 + 0.3 * fn) * pulse * (0.75 + 0.35 * heatF);
  float T = mix(mix(Tm, Tc, cr), 0., plate);
  float rim = plate * exp(-(edge - cwA) * mix(9., 14., cr) / max(cw * 3., 0.15)) * (0.25 + 0.3 * heatF) * pulse;
  T = max(T, rim * 0.62);
  T = max(T, fine * 0.55 * pulse);
  vec3 lavaE = fRamp(T) * (pow(clamp(T, 0., 1.2), 2.4) * 3.2 + 0.06 * (1. - plate)) * uGlow * mix(aa, 1., plate);
  lavaE += vec3(0.05, 0.009, 0.0) * plate * (0.25 + heatF) * (0.4 + grit) * uGlow;   // faint heat through the crust
  // basalt plates
  vec3 bas = mix(vec3(.012, .009, .008), vec3(.06, .045, .038), cid * 0.5 + grit * 0.5);
  bas = mix(bas, vec3(.09, .03, .015), heatF * 0.35);
  diffuseColor.rgb = mix(vec3(0.08, 0.02, 0.0), bas, plate);
  float lavaH = plate * (smoothstep(cwA, cwA + 0.18, edge) * 0.7 + 0.3) + plate * (grit - 0.5) * 0.35 - fine * 0.2;`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
  roughnessFactor = mix(0.35, 0.78 + 0.2 * grit, plate);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  { vec3 dpx = dFdx(-vViewPosition), dpy = dFdy(-vViewPosition); float hx = dFdx(lavaH), hy = dFdy(lavaH);
    vec3 r1 = cross(dpy, normal), r2 = cross(normal, dpx); float dt = dot(dpx, r1);
    vec3 gr = sign(dt) * (hx * r1 + hy * r2) * uBump * uScale * 0.35; normal = normalize(abs(dt) * normal - gr); }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
  totalEmissiveRadiance = lavaE;`);
  };
  m.customProgramCacheKey = () => 'lavaMat1';
  return m;
}

// ---------------------------------------------------------------- heat haze (2D post)
let fireHZ = null;
function heatHaze(t, amt) {
  if (!(amt > 0.01)) return;
  if (!fireHZ) { fireHZ = document.createElement('canvas'); fireHZ.width = W; fireHZ.height = H; }
  const x = fireHZ.getContext('2d'); x.globalCompositeOperation = 'copy'; x.drawImage(ctx.canvas, 0, 0);
  ctx.save(); screen(); const S = 6;
  for (let y = 0; y < H; y += S) {
    const wy = amt * (0.18 + 0.82 * Math.pow(y / H, 1.7));
    const dx = wy * 5.5 * (0.65 * Math.sin(y * 0.029 + t * 6.3) * Math.sin(y * 0.0061 + t * 1.3 + 1) + 0.35 * Math.sin(y * 0.091 + t * 10.7));
    const dy = wy * 2.0 * Math.sin(y * 0.047 + t * 8.1);
    const sy = clamp(y + dy, 0, H - S);
    ctx.drawImage(fireHZ, 0, sy, W, S, dx, y, W, S);
  }
  ctx.restore();
}
