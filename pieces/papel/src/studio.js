
// =====================================================================
//  STUDIO — shots fold, double, tall, ceiling (0–19 s) and record (66–68 s).
//  A studio on the top floor of a glass tower over Mexico City at dusk. Floor y 0 (the street is 225 m below, y −225).
//  The walnut desk (top y 0.75) stands by the east window (glass z −1.6, x −6..6; south glass x +6). Looking out (−z = east):
//  the city grid, Paseo de la Reforma and its towers, the Ángel, the Torre Latinoamericana 1.3 km away, and the
//  Iztaccíhuatl and the Popocatépetl in the haze. Behind (+z, west): Chapultepec and the setting sun (low in the south-west).
//  Folds 1–4: a real sheet bends over (a hand carries the edge and presses the crease), halving A4 → A8. From fold 5 the
//  stack is the shared column (column.js) with the same A8 footprint, standing on the desk; it breaks through the ceiling
//  and the camera flies out of the window to see it pass the Torre Latinoamericana (a hologram of the tower stands beside it).
// =====================================================================
const STU = { DESK: 0.75, COL: new THREE.Vector3(0, 0.75, -0.25), GZ: -1.6, GX: 6, CEIL: 3.2, ROOF: 3.6, GND: -225,
  LAT: new THREE.Vector3(-94, -225, 1124), SUN: dirV(128 * DEG, 3.5 * DEG), UP: new THREE.Vector3(0, 1, 0), TI: 14.42,
  U: { uSunD: { value: dirV(128 * DEG, 3.5 * DEG) }, uNight: { value: 0 }, uHaze: { value: 5200 }, uT: { value: 0 } } };
// shared GLSL: hashes, noise, the horizon colour in a direction (gold toward the sun, mauve away), the distance haze
const STU_GL = `uniform vec3 uSunD; uniform float uNight, uHaze, uT;
float stH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float stN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(stH(i), stH(i + vec2(1, 0)), f.x), mix(stH(i + vec2(0, 1)), stH(i + vec2(1, 1)), f.x), f.y); }
float stF(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++) { a += m * stN(p); p = p * 2.03 + 1.7; m *= 0.5; } return a; }
vec3 stuHor(vec3 d){ vec2 a = normalize(d.xz + vec2(1e-5)), s = normalize(uSunD.xz); float k = dot(a, s);
  vec3 dusk = mix(vec3(0.5, 0.3, 0.42), vec3(1.0, 0.52, 0.26), smoothstep(-0.25, 1.0, k)); return mix(dusk, vec3(0.03, 0.035, 0.075), uNight); }
vec3 stuHaze(vec3 c, vec3 wp){ vec3 v = wp - cameraPosition; float L = length(v); float f = 1.0 - exp(-L / uHaze);
  f *= mix(1.0, 0.7, smoothstep(0.0, 1200.0, wp.y + 225.0)); return mix(c, stuHor(v / L), clamp(f, 0.0, 1.0)); }`;
// a standard material that knows its world position (instancing too) and takes the city haze; extra(sh) patches more
function stuMat(m, key, extra) {
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, STU.U);
    sh.vertexShader = 'varying vec3 vWp; varying vec3 vWn; varying float vSd;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
 { mat4 IM4 = modelMatrix; vSd = 0.0;
#ifdef USE_INSTANCING
 IM4 = modelMatrix * instanceMatrix; vSd = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898, 78.233))) * 43758.5453);
#endif
 vWp = (IM4 * vec4(transformed, 1.0)).xyz; vWn = normalize(mat3(IM4) * objectNormal); }`);
    sh.fragmentShader = 'varying vec3 vWp; varying vec3 vWn; varying float vSd;\n' + STU_GL + '\n' + sh.fragmentShader.replace('#include <output_fragment>', 'outgoingLight = stuHaze(outgoingLight, vWp);\n#include <output_fragment>');
    if (extra) extra(sh); };
  m.customProgramCacheKey = () => 'stu-' + key; return m; }
// windows on every vertical face (world-space grid, anti-aliased to its average far away); lit ones glow warm or cool
function stuWin(col, o = {}) { const bw = (o.bw || 3.0).toFixed(2), fh = (o.fh || 3.6).toFixed(2), mx = (o.mx ?? 0.14).toFixed(3), my = (o.my ?? 0.2).toFixed(3), lit = (o.lit ?? 0.35).toFixed(3), em = (o.em ?? 1.6).toFixed(2), gc = o.gc || 'vec3(0.06, 0.08, 0.11)';
  const m = STDm({ color: col, roughness: o.rough ?? 0.6, metalness: o.metal ?? 0.1, envMapIntensity: o.env ?? 1 });
  return stuMat(m, 'win' + [bw, fh, mx, my, lit, em, gc, o.roof ?? 0.5].join(','), (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float wLit = 0.0; vec3 wCol = vec3(1.0, 0.72, 0.44);
      if (abs(vWn.y) < 0.5) { float u = abs(vWn.x) > 0.5 ? vWp.z : vWp.x; vec2 q = vec2(u / ${bw}, (vWp.y + 225.0) / ${fh});
        vec2 c = floor(q), f = fract(q); float h = stH(c + vSd * 91.0); float aa = clamp(1.6 - 1.2 * length(fwidth(q)), 0.0, 1.0);
        float win = step(${mx}, f.x) * step(f.x, 1.0 - ${mx}) * step(${my}, f.y) * step(f.y, 1.0 - ${my}); float avg = (1.0 - 2.0 * ${mx}) * (1.0 - 2.0 * ${my});
        win = mix(avg, win, aa); float pl = ${lit} + 0.3 * uNight; float on = mix(pl, step(h, pl), aa);
        float fl = stH(vec2(c.y, vSd * 17.0 + floor(c.x / 6.0))); on *= mix(1.0, step(0.25, fl), aa);
        wLit = win * on * (0.55 + 0.9 * stH(c * 1.7 + 3.0)); wCol = mix(wCol, vec3(0.85, 0.9, 1.0), step(0.72, stH(c * 0.37 + vSd))); diffuseColor.rgb = mix(diffuseColor.rgb, ${gc}, win * 0.85); }
      else diffuseColor.rgb *= ${(o.roof ?? 0.5).toFixed(2)};`).replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      totalEmissiveRadiance += wCol * wLit * ${em} * (1.0 + 0.6 * uNight);`); }); }
const stuPlain = (o, key) => stuMat(STDm(o), key || 'plain');

// ---- textures
const STX = {};
const stuPaperTex = () => STX.paper || (STX.paper = g3Tex((x, w) => { const R = RNG('stupaper'); x.fillStyle = '#f7f4ee'; x.fillRect(0, 0, w, w); for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${R.pick(['120,110,100', '255,255,255', '160,150,140'])},${R.r(0.03, 0.08)})`; x.fillRect(R.r(0, w), R.r(0, w), R.r(1, 4), R.r(0.5, 1.2)); } }, 256, 256));
const stuWalnut = () => STX.wal || (STX.wal = g3Tex((x, w, h) => { const R = RNG('walnut'); const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#4c3424'); g.addColorStop(0.5, '#43301f'); g.addColorStop(1, '#4a3322'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 340; i++) { const y0 = R.r(-20, h + 20), c = R.pick(['#2e1a10', '#7a5234', '#3a2214', '#8a6040', '#24140a']); x.strokeStyle = c; x.globalAlpha = R.r(0.05, 0.2); x.lineWidth = R.r(0.5, 2.0); x.beginPath();
    const f = R.r(0.003, 0.01), ph = R.r(0, 6), amp = R.r(3, 14); for (let px = 0; px <= w; px += 8) x.lineTo(px, y0 + Math.sin(px * f + ph) * amp + Math.sin(px * f * 3.1 + ph) * amp * 0.25); x.stroke(); }
  x.globalAlpha = 1; for (let i = 0; i < 6; i++) blot(x, R.r(0, w), R.r(0, h), R.r(30, 90), 'rgba(20,10,4,0.18)'); }, 1024, 512));
const stuRugTex = () => STX.rug || (STX.rug = g3Tex((x, w) => { const R = RNG('rug'); x.fillStyle = '#e4d6c0'; x.fillRect(0, 0, w, w);
  x.strokeStyle = '#2a2420'; x.lineWidth = 10; x.strokeRect(26, 26, w - 52, w - 52); x.strokeStyle = '#b4542e'; x.lineWidth = 5; x.strokeRect(48, 48, w - 96, w - 96);
  for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) { const cx = 100 + i * 78, cy = 100 + j * 78; x.fillStyle = (i + j) % 2 ? '#b4542e' : '#2a2420'; x.beginPath(); x.moveTo(cx, cy - 20); x.lineTo(cx + 14, cy); x.lineTo(cx, cy + 20); x.lineTo(cx - 14, cy); x.fill(); }
  for (let k = 0; k < 9000; k++) { x.fillStyle = `rgba(${R.pick(['255,255,255', '60,40,30'])},0.05)`; x.fillRect(R.r(0, w), R.r(0, w), 2, 2); } }, 512, 512));
const stuArtTex = (seed) => g3Tex((x, w, h) => { const R = RNG('art' + seed); x.fillStyle = R.pick(['#efe6d6', '#e8d8c0', '#1e2a36']); x.fillRect(0, 0, w, h);
  for (let i = 0; i < 6; i++) { x.fillStyle = R.pick(['#c8502e', '#e0a030', '#2e5a7a', '#1e1a18', '#d88a6a', '#6a8a5a']); x.globalAlpha = 0.9; x.beginPath(); if (R.f() < 0.5) x.arc(R.r(0, w), R.r(0, h), R.r(20, 80), 0, TAU); else x.rect(R.r(0, w), R.r(0, h), R.r(20, 120), R.r(20, 160)); x.fill(); } }, 256, 340);
const stuLeafTex = () => STX.leaf || (STX.leaf = g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#24481c'); g.addColorStop(0.5, '#3a6a28'); g.addColorStop(1, '#24481c'); x.fillStyle = g;
  x.beginPath(); x.moveTo(w / 2, h); x.bezierCurveTo(-w * 0.1, h * 0.7, w * 0.05, h * 0.05, w / 2, 0); x.bezierCurveTo(w * 0.95, h * 0.05, w * 1.1, h * 0.7, w / 2, h); x.fill();
  x.strokeStyle = 'rgba(190,220,140,0.5)'; x.lineWidth = 3; x.beginPath(); x.moveTo(w / 2, h); x.lineTo(w / 2, 6); x.stroke(); x.lineWidth = 1.2; for (let k = 1; k < 7; k++) { const y = h * (1 - k / 7.5); x.beginPath(); x.moveTo(w / 2, y); x.lineTo(w * 0.15, y - 18); x.moveTo(w / 2, y); x.lineTo(w * 0.85, y - 18); x.stroke(); } }, 128, 192));
const stuSmokeTex = () => STX.smoke || (STX.smoke = g3Tex((x, w) => { const R = RNG('smk'); x.clearRect(0, 0, w, w); for (let k = 0; k < 40; k++) blot(x, w / 2 + R.n(w * 0.22), w / 2 + R.n(w * 0.22), R.r(w * 0.12, w * 0.3), 'rgba(255,255,255,0.16)'); }, 128, 128));

// ---- the sky dome (dusk ↔ night), with the sun just above the south-western horizon
function stuSky(st) { const m = new THREE.Mesh(new THREE.SphereGeometry(100000, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: STU.U,
  vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
  fragmentShader: STU_GL + `
varying vec3 vD;
void main(){ vec3 d = normalize(vD); float h = d.y, hh = max(h, 0.0); vec3 s = normalize(uSunD); float sd = dot(d, s); float az = dot(normalize(d.xz + vec2(1e-5)), normalize(s.xz));
  vec3 hor = stuHor(d);
  vec3 c = mix(hor, mix(vec3(0.5, 0.27, 0.4), vec3(0.85, 0.42, 0.3), max(az, 0.0)), smoothstep(0.0, 0.1, hh));
  c = mix(c, vec3(0.2, 0.16, 0.36), smoothstep(0.06, 0.4, hh)); c = mix(c, vec3(0.06, 0.07, 0.2), smoothstep(0.35, 1.0, hh));
  float anti = smoothstep(0.1, -0.8, az);
  c = mix(c, vec3(0.28, 0.25, 0.4), anti * (1.0 - smoothstep(0.0, 0.035, hh)) * 0.5);
  c += vec3(0.42, 0.14, 0.24) * anti * exp(-pow((hh - 0.075) / 0.05, 2.0)) * 0.55;
  c += vec3(1.0, 0.45, 0.15) * pow(max(sd, 0.0), 6.0) * 0.8 + vec3(1.0, 0.7, 0.4) * pow(max(sd, 0.0), 90.0) * 2.2 + vec3(1.0, 0.85, 0.6) * smoothstep(0.99975, 0.9999, sd) * 14.0;
  if (h > 0.0) { vec2 cp = d.xz / (h + 0.05); float n = stF(cp * vec2(0.35, 1.6) + 3.0), n2 = stF(cp * 1.7 + 9.0); float cov = smoothstep(0.5, 0.78, n * 0.8 + n2 * 0.35) * smoothstep(0.0, 0.05, h) * (1.0 - smoothstep(0.3, 0.7, h));
    vec3 cc = mix(vec3(0.85, 0.38, 0.42), vec3(1.0, 0.66, 0.36), max(az, 0.0)) * (0.55 + 0.6 * n2); cc = mix(cc, vec3(0.3, 0.22, 0.35), smoothstep(0.6, 0.9, n2) * 0.4); c = mix(c, cc, cov * 0.8 * (1.0 - uNight)); }
  if (h < 0.0) c = hor;
  vec3 nc = mix(vec3(0.06, 0.055, 0.1), vec3(0.008, 0.012, 0.04), pow(hh, 0.45)); nc += vec3(0.16, 0.08, 0.04) * exp(-hh * 22.0);
  vec2 sc = vec2(atan(d.z, d.x), asin(clamp(d.y, -1.0, 1.0))) * 320.0; float sh = stH(floor(sc)); nc += vec3(0.9, 0.92, 1.0) * step(0.986, sh) * smoothstep(0.45, 0.0, length(fract(sc) - 0.5)) * smoothstep(0.06, 0.3, h) * (0.3 + fract(sh * 31.0));
  if (h < 0.0) nc = vec3(0.05, 0.04, 0.06);
  c = mix(c, nc, uNight);
  gl_FragColor = vec4(c, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` })); m.renderOrder = -10; m.frustumCulled = false; st.scene.add(m); return m; }

// ---- the valley floor: a street grid aligned with Reforma (sodium lamps, lit windows), Reforma itself, the ejes, Chapultepec
function stuGround(st) { const m = new THREE.ShaderMaterial({ uniforms: STU.U, fog: false, extensions: { derivatives: true },
  vertexShader: 'varying vec3 vWp; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWp = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
  fragmentShader: STU_GL + `
varying vec3 vWp;
void main(){ vec2 p = vWp.xz; vec2 dd = normalize(vec2(-0.5, -1.0)), nn = vec2(-dd.y, dd.x); vec2 o = vec2(-48.0, 0.0);
  float a = dot(p - o, dd), b = dot(p - o, nn); vec2 ab = vec2(a, b);
  float mpp = max(length(fwidth(ab)), 0.02);
  vec2 bs = vec2(118.0, 82.0); vec2 g = ab / bs, c = floor(g), f = fract(g); vec2 e = min(f, 1.0 - f) * bs; float ed = min(e.x, e.y);
  float near = 1.0 - smoothstep(3.0, 12.0, mpp), near2 = 1.0 - smoothstep(0.8, 4.0, mpp);
  float ejeA = step(abs(mod(c.x + 0.5, 8.0) - 0.5), 0.6) * step(f.x, 0.5) + step(abs(mod(c.x + 1.5, 8.0) - 0.5), 0.6) * step(0.5, f.x);
  float sw = 5.0, street = 1.0 - smoothstep(sw - mpp, sw + mpp, ed); street = mix(0.17, street, near);
  vec2 rc = floor(ab / 13.0); float rh = stH(rc + c * 3.1);
  vec3 roof = mix(vec3(0.13, 0.11, 0.1), vec3(0.3, 0.24, 0.19), rh); roof = mix(roof, vec3(0.36, 0.18, 0.12), step(0.84, rh)); roof = mix(roof, vec3(0.42, 0.4, 0.38), step(0.94, rh));
  roof *= 0.7 + 0.45 * stN(ab * 0.06);
  vec3 base = mix(roof, vec3(0.045, 0.045, 0.055), street);
  float along = e.x < e.y ? b : a; float pulse = pow(0.5 + 0.5 * cos(along / 24.0 * 6.2832), 30.0); float lamp = mix(0.08, pulse, near2);
  vec3 E = street * vec3(1.0, 0.5, 0.17) * (mix(0.16, 0.05, near2) + 2.2 * lamp) * mix(0.9, 0.6, uNight);
  vec2 wc = floor(ab / 4.5); float wh = stH(wc + 7.0); float wdot = step(0.935 - 0.06 * uNight, wh) * (1.0 - street);
  E += mix(vec3(1.0, 0.7, 0.4), vec3(0.8, 0.88, 1.0), step(0.97, wh)) * mix(0.07 - 0.04 * uNight * 0.0, wdot, near2) * 0.7 * (1.0 + uNight);
  // the ejes: wide bright avenues every 8 blocks
  float eje = 1.0 - smoothstep(9.0 - mpp, 9.0 + mpp, abs(mod(a + 4.0 * bs.x, 8.0 * bs.x) - 4.0 * bs.x + 0.0)); float ejeB = 1.0 - smoothstep(9.0 - mpp, 9.0 + mpp, abs(mod(b + 5.0 * bs.y, 10.0 * bs.y) - 5.0 * bs.y));
  float ej = max(eje, ejeB); base = mix(base, vec3(0.05), ej); E += ej * vec3(1.0, 0.62, 0.3) * (0.5 + 0.6 * near2 * pow(0.5 + 0.5 * cos((eje > ejeB ? b : a) / 30.0 * 6.2832), 20.0));
  // Reforma: a 64 m boulevard with a tree median and white lamps
  float rf = 1.0 - smoothstep(32.0 - mpp, 32.0 + mpp, abs(b)); float med = 1.0 - smoothstep(8.0 - mpp, 8.0 + mpp, abs(b));
  base = mix(base, vec3(0.05, 0.05, 0.058), rf); base = mix(base, vec3(0.05, 0.09, 0.04) * (0.6 + 0.8 * stN(ab * 0.3)), med);
  float side = 1.0 - smoothstep(1.5 + mpp, 3.0 + mpp, abs(abs(b) - 28.0)); E += rf * side * vec3(1.0, 0.92, 0.8) * mix(0.25, pow(0.5 + 0.5 * cos(a / 22.0 * 6.2832), 30.0) * 2.5, near2);
  // Chapultepec (west, behind the tower): forest, no grid
  vec2 pc = p - vec2(-1600.0, 1300.0); float park = 1.0 - smoothstep(0.0, 120.0, length(pc * vec2(1.0, 0.75)) - 1050.0 + 140.0 * stN(p * 0.004));
  base = mix(base, vec3(0.04, 0.07, 0.035) * (0.5 + stF(p * 0.05)), park); E *= 1.0 - park * 0.97;
  float lum = mix(1.0, 0.25, uNight); vec3 col = base * lum + E;
  col = stuHaze(col, vWp);
  gl_FragColor = vec4(col, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` });
  const gm = new THREE.Mesh(new THREE.PlaneGeometry(90000, 90000).rotateX(-Math.PI / 2), m); gm.position.y = STU.GND; gm.frustumCulled = false; st.scene.add(gm); return gm; }

// ---- the volcanoes and the rim of hills: one displaced height field far away, its own haze and alpenglow
function stuMountains(st) { const geo = new THREE.PlaneGeometry(150000, 70000, 300, 140).rotateX(-Math.PI / 2), p = geo.attributes.position;
  const vh = (x, z) => { const pr = Math.hypot(x - 22000, z + 42000), popo = 4700 * Math.pow(Math.max(0, 1 - pr / 16000), 1.55) - 260 * Math.exp(-((pr / 700) ** 2));
    let iz = 0; [[2000, 3500, 2300], [6000, 4200, 3000], [9800, 4450, 2600], [13600, 4150, 2400], [16400, 3700, 2600]].forEach(([cx, hh, s]) => (iz = Math.max(iz, hh * Math.exp(-(((x - cx) / s) ** 2) - (((z + 39500) / 3600) ** 2)))));
    const R = (k) => Math.sin(x * 0.00031 * k + z * 0.00017) * Math.sin(z * 0.00027 * k - x * 0.00011);
    const rim = Math.max(0, 1 - Math.abs(Math.hypot(x / 1.0, (z + 4000) / 1.1) - 36000) / 9000) * (900 + 500 * R(1) + 300 * R(2.3)); return Math.max(popo, iz, rim) + 120 * R(4) - 320; };
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + 15000, z = p.getZ(i) - 22000; p.setY(i, vh(x, z)); }
  geo.computeVertexNormals();
  const m = new THREE.ShaderMaterial({ uniforms: STU.U, fog: false,
    vertexShader: 'varying vec3 vWp; varying vec3 vN; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWp = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: STU_GL + `
varying vec3 vWp; varying vec3 vN;
void main(){ float alt = vWp.y + 225.0; float sl = 1.0 - vN.y; float n = stF(vWp.xz * 0.0012);
  vec3 rock = mix(vec3(0.16, 0.12, 0.13), vec3(0.24, 0.2, 0.18), n);
  float snow = smoothstep(2900.0, 3300.0, alt + 500.0 * (n - 0.5) - sl * 900.0);
  float lit = clamp(dot(vN, normalize(uSunD + vec3(0.0, 0.08, 0.0))) * 1.4 + 0.25, 0.0, 1.5);
  vec3 alpen = mix(vec3(0.42, 0.32, 0.5), vec3(1.0, 0.62, 0.62), lit);
  vec3 col = mix(rock * (0.5 + 0.6 * lit), alpen * 0.95, snow);
  vec3 v = vWp - cameraPosition; float L = length(v); vec3 hz = stuHor(v / L);
  float hf = clamp(0.38 + L / 160000.0 - snow * 0.18, 0.0, 0.85); hf = mix(hf, 0.5, step(alt, 1500.0) * 0.6);
  hf += (1.0 - smoothstep(0.0, 2200.0, alt)) * 0.25; col = mix(col, hz, clamp(hf, 0.0, 0.95));
  col = mix(col, vec3(0.025, 0.028, 0.05), uNight * 0.92);
  gl_FragColor = vec4(col, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` });
  const mm = new THREE.Mesh(geo, m); mm.position.set(15000, STU.GND, -22000); mm.frustumCulled = false; st.scene.add(mm);
  // Popocatépetl breathes: a soft plume drifting from the crater
  const plume = []; for (let i = 0; i < 6; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: stuSmokeTex(), color: '#e8c8c0', transparent: true, depthWrite: false, opacity: 0.22, fog: false })); sp.position.set(22000 + 900 * i, STU.GND + 4500 + 260 * i, -42000 + 300 * i); sp.scale.set(1600 + 500 * i, 900 + 200 * i, 1); st.scene.add(sp); plume.push(sp); }
  return { mm, plume }; }

// ---- light streaks: cars on Reforma and the ejes (red tails going east, white heads coming west), aviation lights
function stuPts(st, P, Cc, A, B, Sx, o = {}) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aC', new THREE.BufferAttribute(Cc, 3)); g.setAttribute('aB', new THREE.BufferAttribute(B, 3)); g.setAttribute('aS', new THREE.BufferAttribute(Sx, 4));
  const U = Object.assign({ uMap: { value: STX.bulb || (STX.bulb = g3Radial([[0, 'rgba(255,255,255,1)'], [0.12, 'rgba(255,255,255,0.9)'], [0.35, 'rgba(255,255,255,0.18)'], [1, 'rgba(255,255,255,0)']], 64)) }, uK: { value: 1 } }, STU.U);
  const m = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `uniform float uT, uK, uNight; attribute vec3 aC, aB; attribute vec4 aS; varying vec3 vC;
      void main(){ float s = fract(aS.x + uT * aS.y); vec3 p = mix(position, aB, s) - normalize(aB - position) * aS.z * 3.5;
        if (aS.y == 0.0) p = position; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
        float blink = aS.w > 0.5 ? step(0.55, fract(uT * 0.8 + aS.x)) : 1.0;
        float sz = ${(o.size || 2.4).toFixed(2)} * projectionMatrix[1][1] * 960.0 / max(0.1, -mv.z); float ps = max(${(o.min || 1.6).toFixed(2)}, sz);
        vC = aC * (1.0 - aS.z * 0.28) * blink * uK * min(1.0, sz * sz / (ps * ps) + 0.45) * (1.0 + 0.5 * uNight); gl_PointSize = ps; }`,
    fragmentShader: 'uniform sampler2D uMap; varying vec3 vC; void main(){ vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vC * t.rgb * t.a, 1.0); }' });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; st.scene.add(pts); return { pts, U }; }
function stuCars(st) { const R = RNG('stucars'), L = [], dd = new THREE.Vector2(-0.5, -1).normalize(), nn = new THREE.Vector2(1, -0.5).normalize(), o = new THREE.Vector2(-48, 0), y = STU.GND + 1.2;
  const lane = (s0, s1, b, dir, gap) => { const a = o.clone().addScaledVector(dd, s0).addScaledVector(nn, b), c = o.clone().addScaledVector(dd, s1).addScaledVector(nn, b); L.push(dir > 0 ? [a, c, gap] : [c, a, gap]); };
  [10, 14, 18, 22].forEach((b) => { lane(-2500, 7000, b, 1, 55); lane(-2500, 7000, -b, -1, 55); });
  for (let k = -4; k <= 8; k++) { const a0 = k * 8 * 118 + 4 * 118 - 4 * 118; [3, 6].forEach((w) => { const A1 = o.clone().addScaledVector(dd, a0).addScaledVector(nn, -5000), B1 = o.clone().addScaledVector(dd, a0).addScaledVector(nn, 5000); const off = nn.clone().multiplyScalar(0); const sh = dd.clone().multiplyScalar(w);
    L.push([A1.clone().add(sh), B1.clone().add(sh), 110]); L.push([B1.clone().sub(sh), A1.clone().sub(sh), 110]); void off; }); }
  for (let k = -5; k <= 5; k++) { const b0 = k * 10 * 82; [3, 6].forEach((w) => { const A1 = o.clone().addScaledVector(dd, -4000).addScaledVector(nn, b0 + w), B1 = o.clone().addScaledVector(dd, 8000).addScaledVector(nn, b0 + w); L.push([A1, B1, 120]); L.push([B1.clone().addScaledVector(nn, -2 * w), A1.clone().addScaledVector(nn, -2 * w), 120]); }); }
  const P = [], C = [], B = [], S = [];
  L.forEach(([a, b, gap]) => { const len = a.distanceTo(b), n = Math.floor(len / gap), east = (b.y - a.y) < 0 || (b.x - a.x) < -0.1 * len; // heading east (−z) → we see their tail lights
    for (let i = 0; i < n; i++) { const s0 = R.f(), v = R.r(7, 15) / len, col = east ? [1.0, 0.12, 0.06] : [1.0, 0.92, 0.78], k = R.r(0.6, 1.2);
      for (let tr = 0; tr < 3; tr++) { P.push(a.x, y, a.y); B.push(b.x, y, b.y); C.push(col[0] * k, col[1] * k, col[2] * k); S.push(s0, v, tr, 0); } } });
  return stuPts(st, new Float32Array(P), new Float32Array(C), null, new Float32Array(B), new Float32Array(S), { size: 2.6, min: 1.3 }); }

// ---- landmarks
function stuLatino(m, mast, noMast) { const g = new THREE.Group();
  [[34, 0, 130], [31, 130, 142], [27, 142, 151], [22, 151, 158], [16, 158, 164], [11, 164, 168]].forEach(([w, y0, y1]) => g.add(mesh(new THREE.BoxGeometry(w, y1 - y0, w).translate(0, (y0 + y1) / 2, 0), m, 0, 0, 0, { cast: false })));
  g.add(mesh(new THREE.CylinderGeometry(4.6, 5.2, 9, 12).translate(0, 172.5, 0), m, 0, 0, 0, { cast: false })); g.add(mesh(new THREE.CylinderGeometry(3.2, 3.2, 6, 12).translate(0, 180, 0), mast, 0, 0, 0, { cast: false }));
  if (!noMast) { g.add(mesh(new THREE.CylinderGeometry(0.5, 1.8, 16, 6).translate(0, 191, 0), mast, 0, 0, 0, { cast: false })); g.add(mesh(new THREE.CylinderGeometry(0.12, 0.45, 9, 6).translate(0, 203, 0), mast, 0, 0, 0, { cast: false })); }
  return g; }
function stuCity(st, S) { const R = RNG('stucity'), dd = new THREE.Vector2(-0.5, -1).normalize(), nn = new THREE.Vector2(1, -0.5).normalize(), o = new THREE.Vector2(-48, 0), G = STU.GND;
  const at = (a, b) => o.clone().addScaledVector(dd, a).addScaledVector(nn, b);
  // low-rise blocks (instanced): 2–6 buildings per block, a few mid-rise; black water tanks (tinacos) on the roofs
  const lowM = stuWin('#ffffff', { bw: 3.2, fh: 3.3, lit: 0.22, em: 1.3, rough: 0.85 }), spots = [], tanks = [];
  const inPark = (x, z) => Math.hypot(x + 1600, (z - 1300) * 0.75) < 1000;
  for (let ia = -30; ia <= 40; ia++) for (let ib = -42; ib <= 42; ib++) { const ca = ia * 118 + 59, cb = ib * 82 + 41; if (Math.abs(cb) < 75) continue; const c = at(ca, cb), r = Math.hypot(c.x, c.y); if (r > 4200 || r < 60) continue; if (inPark(c.x, c.y)) continue;
    if (Math.abs(((ia % 8) + 8) % 8) === 0 || Math.abs(((ib % 10) + 10) % 10) === 0) { if (R.f() < 0.5) continue; }
    const nb = 2 + Math.floor(R.f() * 4), cap = c.y < 0 && r < 500 ? 22 : 999; for (let k = 0; k < nb; k++) { const w = R.r(16, 48), d = R.r(14, 34), h = Math.min(cap, R.f() < 0.06 ? R.r(35, 90) : R.r(5, 24)), pa = ca + R.r(-118 / 2 + 8 + w / 2, 118 / 2 - 8 - w / 2), pb = cb + R.r(-82 / 2 + 7 + d / 2, 82 / 2 - 7 - d / 2), q = at(pa, pb);
      spots.push([q.x, q.y, w, h, d]); if (R.f() < 0.7) for (let j = 0; j < 1 + Math.floor(R.f() * 3); j++) tanks.push([q.x + R.n(w * 0.35), G + h, q.y + R.n(d * 0.35)]); } }
  const ang = Math.atan2(-dd.x, -dd.y); const lowI = IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), lowM, spots.length, false); const cols = ['#b8a48c', '#c8b49a', '#9a8a7a', '#d0c0a8', '#a89078', '#8a7a6c', '#c86a4a', '#d8b060', '#7a94a8', '#e0d4c4', '#b07a5a'];
  spots.forEach(([x, z, w, h, d], i) => { lowI.setMatrixAt(i, M4c(x, G, z, ang, w, h, d)); lowI.setColorAt(i, lin(R.pick(cols)).multiplyScalar(0.55)); }); st.scene.add(lowI);
  const tk = IM(new THREE.CylinderGeometry(0.75, 0.75, 1.4, 8).translate(0, 0.7, 0), stuPlain({ color: '#141414', roughness: 0.6 }, 'tank'), tanks.length, false); tanks.forEach(([x, y, z], i) => tk.setMatrixAt(i, M4c(x, y, z))); st.scene.add(tk);
  // street trees: Reforma's median and sidewalks, scattered jacarandas
  const trees = []; for (let a = -2500; a < 7000; a += 9) { [-4, 4, -30, 30].forEach((b) => { if (R.f() < 0.8) { const q = at(a + R.n(3), b + R.n(1.5)); trees.push([q.x, q.y, R.r(4, 7)]); } }); }
  for (let i = 0; i < 2600; i++) { const q = at(R.r(-3000, 4500), R.r(-3500, 3500)); if (Math.hypot(q.x, q.y) < 70) continue; trees.push([q.x, q.y, R.r(3, 6)]); }
  // Chapultepec: dense forest and the castle on its hill
  for (let i = 0; i < 4200; i++) { const a = R.r(0, TAU), r = Math.sqrt(R.f()) * 1000, x = -1600 + Math.cos(a) * r, z = 1300 + Math.sin(a) * r / 0.75; trees.push([x, z, R.r(5, 10)]); }
  const trM = stuPlain({ color: '#ffffff', roughness: 1 }, 'tree'), trI = IM(lumpyGeo(0, 0.3, 41), trM, trees.length, false);
  trees.forEach(([x, z, s], i) => { trI.setMatrixAt(i, M4c(x, G + s * 0.9, z, R.r(0, 6), s, s * 0.85, s)); trI.setColorAt(i, lin(R.pick(['#2c4a22', '#36582a', '#24401e', '#4a6a30', '#6a5a8a'])).multiplyScalar(R.r(0.6, 1.0))); }); st.scene.add(trI);
  { const hill = mesh(lumpyGeo(3, 0.15, 9), stuPlain({ color: '#2a3a20', roughness: 1 }, 'hill'), -1500, G - 10, 1000, { cast: false }); hill.scale.set(180, 60, 140); st.scene.add(hill);
    const cm = stuWin('#d8ccb4', { bw: 3.6, fh: 4, lit: 0.6, em: 1.2, rough: 0.8, roof: 0.8 }); st.scene.add(mesh(new THREE.BoxGeometry(110, 14, 60).translate(0, 7, 0), cm, -1500, G + 42, 1000, { cast: false })); st.scene.add(mesh(new THREE.BoxGeometry(18, 16, 18).translate(0, 8, 0), cm, -1470, G + 56, 1000, { cast: false })); }
  // Reforma's towers (glass and stone), with names where it matters
  const glassM = stuWin('#9aa8b8', { bw: 1.5, fh: 4.0, mx: 0.05, my: 0.1, lit: 0.42, em: 1.4, rough: 0.16, metal: 0.75, env: 1.3, gc: 'vec3(0.1, 0.13, 0.17)', roof: 0.35 });
  const stoneM = stuWin('#c8bcac', { bw: 2.2, fh: 3.8, mx: 0.22, my: 0.25, lit: 0.45, em: 1.4, rough: 0.7, roof: 0.6 });
  const tw = [], beac = [];
  for (let a = -1600; a < 4200; a += R.r(70, 150)) [-1, 1].forEach((sd) => { if (R.f() < 0.3) return; const b = sd * R.r(60, 110), q = at(a, b); if (Math.hypot(q.x - 0, q.y - 16) < 60 || (q.y < 60 && Math.hypot(q.x, q.y) < 650)) return;
    const near = Math.exp(-(((a - 200) / 1600) ** 2)), h = R.r(40, 90) + near * R.r(0, 150); tw.push([q.x, q.y, R.r(22, 40), h, R.r(22, 40), R.f() < 0.65]); });
  // named: Torre Reforma (our neighbour), Torre BBVA, Torre Mayor, Chapultepec Uno
  [[-130, 70, 30, 246, 30, true], [-330, -80, 40, 235, 40, true], [-260, 95, 34, 225, 46, true], [-520, -70, 30, 240, 30, true]].forEach(([a, b, w, h, d, gl]) => { const q = at(a, b); tw.push([q.x, q.y, w, h, d, gl]); });
  const tg = tw.filter((x) => x[5]), ts = tw.filter((x) => !x[5]);
  [[tg, glassM], [ts, stoneM]].forEach(([L, mt]) => { const I = IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), mt, L.length, false); L.forEach(([x, z, w, h, d], i) => { I.setMatrixAt(i, M4c(x, G, z, ang + R.n(0.1), w, h, d)); I.setColorAt(i, lin(R.pick(mt === glassM ? ['#8a9cb0', '#a4b0bc', '#7890a4', '#b0a898'] : ['#c8bcac', '#b4a894', '#d4cab8']))); if (h > 120) beac.push([x, G + h + 2, z]); }); st.scene.add(I); });
  // the Ángel de la Independencia on its glorieta
  { const q = at(1250, 0), am = stuPlain({ color: '#d8d0c0', roughness: 0.6 }, 'angel'); st.scene.add(mesh(new THREE.CylinderGeometry(3.5, 5, 6, 16).translate(0, 3, 0), am, q.x, G, q.y, { cast: false })); st.scene.add(mesh(new THREE.CylinderGeometry(1.6, 2, 36, 12).translate(0, 36 / 2 + 6, 0), am, q.x, G, q.y, { cast: false }));
    const gold = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffd070', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9, fog: false })); gold.position.set(q.x, G + 46, q.y); gold.scale.setScalar(16); st.scene.add(gold);
    st.scene.add(mesh(new THREE.CylinderGeometry(42, 42, 0.4, 32), stuPlain({ color: '#1a1c18', roughness: 0.9 }, 'glor'), q.x, G + 0.2, q.y, { cast: false })); }
  // the Torre Latinoamericana, 1.3 km away
  { const lm = stuWin('#5a8a90', { bw: 1.6, fh: 3.7, mx: 0.06, my: 0.18, lit: 0.5, em: 1.5, rough: 0.25, metal: 0.55, gc: 'vec3(0.08, 0.14, 0.16)', roof: 0.6 }), mast = stuPlain({ color: '#c8c0b8', roughness: 0.5, metalness: 0.6, emissive: '#ffffff', emissiveIntensity: 0.05 }, 'mast');
    const g = stuLatino(lm, mast); g.position.copy(STU.LAT); g.rotation.y = 0.12; st.scene.add(g); S.latino = g; beac.push([STU.LAT.x, STU.LAT.y + 208, STU.LAT.z]);
    const crown = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffe0b0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55, fog: false })); crown.position.set(STU.LAT.x, STU.LAT.y + 176, STU.LAT.z); crown.scale.setScalar(30); st.scene.add(crown); }
  // aviation lights on the tall towers (blinking red)
  { const n = beac.length, P = new Float32Array(n * 3), C = new Float32Array(n * 3), B = new Float32Array(n * 3), Sx = new Float32Array(n * 4); beac.forEach((p, i) => { P.set(p, i * 3); B.set(p, i * 3); C.set([1.4, 0.08, 0.04], i * 3); Sx.set([i * 0.37, 0, 0, 1], i * 4); }); S.beacons = stuPts(st, P, C, null, B, Sx, { size: 3.5, min: 2.4 }); }
  S.cars = stuCars(st); S.mount = stuMountains(st);
  // high clouds catching the last light, far over the valley
  S.clouds = addSkyClouds(st, 14, 0, -20000, 9000, 26000, 2600, 4200, 'stu'); S.clouds.forEach((c, i) => { c.material.color.set(i % 3 ? '#f0a890' : '#ffc8a0'); c.material.opacity = 0.75; c.scale.multiplyScalar(1.6); }); }

// ---- our tower: the floors below (curtain wall), the rest of the top floor, the roof (with the plug the column punches), crown fins
function stuTower(st, S) { const G = STU.GND, gz = STU.GZ, gx = STU.GX;
  const body = stuWin('#7c8ea0', { bw: 1.5, fh: 4.0, mx: 0.04, my: 0.12, lit: 0.45, em: 1.5, rough: 0.12, metal: 0.8, env: 1.4, gc: 'vec3(0.09, 0.12, 0.16)', roof: 0.4 });
  const bx = (x0, x1, y0, y1, z0, z1, m) => { const b = mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, { cast: false }); st.scene.add(b); return b; };
  bx(-30, gx, G, -0.32, gz, 34, body); bx(-30, -6, -0.32, 3.2, gz, 34, body); bx(-6, gx, -0.32, 3.2, 8, 34, body);
  const slab = stuPlain({ color: '#b8b4ae', roughness: 0.85 }, 'slab'), roofM = stuPlain({ color: '#6a6864', roughness: 0.9, map: wrap(texNoise('sturoof', '#6a6864', ['#5a5854', '#7a7874', '#4a4844']), 8, 8) }, 'roof');
  bx(-30, gx, -0.32, 0, gz, 34, slab);
  bx(-30, -0.6, 3.2, 3.6, gz, 34, roofM); bx(0.6, gx, 3.2, 3.6, gz, 34, roofM); bx(-0.6, 0.6, 3.2, 3.6, gz, -0.85, roofM); bx(-0.6, 0.6, 3.2, 3.6, 0.35, 34, roofM);
  S.plug = bx(-0.6, 0.6, 3.2, 3.6, -0.85, 0.35, roofM);
  // spandrel band and parapet
  const band = stuPlain({ color: '#2a2e34', roughness: 0.4, metalness: 0.7 }, 'band'); bx(-30, gx + 0.05, -0.6, 0.02, gz - 0.06, gz + 0.02, band); bx(gx - 0.02, gx + 0.06, -0.6, 0.02, gz, 34, band); bx(-30, gx + 0.05, 3.2, 3.62, gz - 0.06, gz + 0.02, band); bx(gx - 0.02, gx + 0.06, 3.2, 3.62, gz, 34, band);
  const rail = new THREE.MeshStandardMaterial({ color: '#a8c0d0', roughness: 0.05, metalness: 0.6, transparent: true, opacity: 0.3 }); bx(-30, gx, 3.6, 4.7, gz, gz + 0.05, rail); bx(gx - 0.05, gx, 3.6, 4.7, gz, 34, rail);
  // crown: vertical fins with LED tips around the roof edge, a mechanical penthouse, a mast
  const fin = stuPlain({ color: '#3a4450', roughness: 0.3, metalness: 0.8 }, 'fin'), nf = 18 + 18, fI = IM(new THREE.BoxGeometry(0.08, 1.15, 0.08).translate(0, 0.57, 0), fin, nf, false); let k = 0;
  for (let i = 0; i < 18; i++) { fI.setMatrixAt(k++, M4c(-30 + (i + 0.5) * 36 / 18, 3.6, gz + 0.03)); fI.setMatrixAt(k++, M4c(gx - 0.03, 3.6, gz + (i + 0.5) * 35.6 / 18, Math.PI / 2)); } st.scene.add(fI);
  const led = new THREE.MeshBasicMaterial({ color: '#ffe6c0' }); const lI = IM(new THREE.BoxGeometry(0.3, 0.12, 0.85), led, nf, false); k = 0; for (let i = 0; i < 18; i++) { lI.setMatrixAt(k++, M4c(-30 + (i + 0.5) * 36 / 18, 4.72, gz + 0.03, 0, 6.6, 0.3, 0.1)); lI.setMatrixAt(k++, M4c(gx - 0.03, 4.72, gz + (i + 0.5) * 35.6 / 18, Math.PI / 2, 6.6, 0.3, 0.1)); } st.scene.add(lI);
  const pm = stuPlain({ color: '#4a4a4e', roughness: 0.8 }, 'pent'); bx(-24, -10, 3.6, 8.5, 12, 28, pm); bx(-8, -3, 3.6, 5.2, 18, 24, pm); bx(-27, -22, 3.6, 5.0, 2, 7, pm);
  st.scene.add(mesh(new THREE.CylinderGeometry(0.15, 0.3, 22, 6).translate(0, 11, 0), fin, -17, 8.5, 20, { cast: false }));
  S.towerTop = new THREE.Vector3(-17, 30.5, 20); }

// ---- the studio: floor, rug, ceiling tiles (four of them fall), walls, shelves, art, a plant, a sofa, glass and mullions
function stuRoom(st, S) { const gz = STU.GZ, gx = STU.GX, cy = STU.CEIL, R = RNG('sturoom');
  const conc = STDm({ map: wrap(texNoise('stufloor', '#8e8a84', ['#7e7a74', '#a09a92', '#86827c', '#96928a'], 9000), 6, 5), roughness: 0.32, metalness: 0.0 });
  st.scene.add(mesh(new THREE.PlaneGeometry(12, 9.6).rotateX(-Math.PI / 2), conc, 0, 0, gz + 4.8, { cast: false }));
  st.scene.add(mesh(new THREE.BoxGeometry(3.2, 0.012, 2.3), STDm({ map: stuRugTex(), roughness: 1 }), 0.1, 0.006, 0.0, { cast: false }));
  // ceiling: 0.6 m tiles on a grid with a corner at the column; LED slots
  const tileM = STDm({ color: '#eceae6', roughness: 0.9 }), z0 = -0.25 - 0.6 * 2, tiles = [];
  for (let i = -10; i < 10; i++) for (let j = 0; j < 16; j++) { const x = i * 0.6 + 0.3, z = z0 + j * 0.6 + 0.3; if (z > 8) continue; tiles.push([x, z]); }
  const tI = IM(new THREE.BoxGeometry(0.59, 0.02, 0.59), tileM, tiles.length, false); S.tiles = tI; S.tileHole = [];
  tiles.forEach(([x, z], i) => { tI.setMatrixAt(i, M4c(x, cy - 0.01, z)); if (Math.abs(x) < 0.6 && Math.abs(z + 0.25) < 0.6) S.tileHole.push(i); }); st.scene.add(tI);
  st.scene.add(mesh(new THREE.BoxGeometry(12, 0.03, 0.2), STDm({ color: '#d8d4ce' }), 0, cy - 0.015, gz + 0.1, { cast: false }));
  const ledM = new THREE.MeshBasicMaterial({ color: '#fff4e4' }); [-3.6, 2.4].forEach((x) => st.scene.add(mesh(new THREE.BoxGeometry(0.06, 0.01, 7), ledM, x, cy - 0.026, 4.2, { cast: false }))); S.ledM = ledM;
  // walls: oak slats on the north wall, plaster at the back
  const slat = g3Tex((x, w, h) => { x.fillStyle = '#7a5a3a'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 16) { x.fillStyle = '#9a7650'; x.fillRect(i, 0, 11, h); x.fillStyle = 'rgba(40,24,12,0.5)'; x.fillRect(i + 11, 0, 5, h); } }, 256, 64);
  st.scene.add(mesh(new THREE.PlaneGeometry(9.6, cy).rotateY(Math.PI / 2), STDm({ map: wrap(slat, 16, 1), roughness: 0.7 }), -5.98, cy / 2, gz + 4.8, { cast: false }));
  const plaster = STDm({ color: '#e8e2d8', roughness: 0.95 }); st.scene.add(mesh(new THREE.PlaneGeometry(12, cy).rotateY(Math.PI), plaster, 0, cy / 2, 7.98, { cast: false }));
  [[-2.6, 1.7, 1.1, 1.45, 1], [-1.1, 1.85, 0.8, 1.05, 2]].forEach(([x, y, w, h, s]) => { st.scene.add(mesh(new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.04), STDm({ color: '#1a1614', roughness: 0.5 }), x, y, 7.95, { cast: false })); st.scene.add(mesh(new THREE.PlaneGeometry(w, h).rotateY(Math.PI), STDm({ map: stuArtTex(s), roughness: 0.8 }), x, y, 7.92, { cast: false })); });
  st.scene.add(mesh(new THREE.BoxGeometry(1.0, 2.3, 0.06), STDm({ color: '#4a3424', roughness: 0.6 }), 3.6, 1.15, 7.96, { cast: false }));
  // shelves with books along the north wall
  { const wd = STDm({ color: '#3a2a1e', roughness: 0.6 }); for (let s = 0; s < 5; s++) st.scene.add(mesh(new THREE.BoxGeometry(0.36, 0.03, 3.6), wd, -5.78, 0.35 + s * 0.48, 3.2, { cast: false }));
    const bk = []; for (let s = 0; s < 4; s++) { let z = 1.5; while (z < 4.9) { const t = R.r(0.025, 0.06), h = R.r(0.22, 0.36); if (R.f() < 0.12) { z += R.r(0.1, 0.3); continue; } bk.push([z + t / 2, 0.365 + s * 0.48 + h / 2, t, h, R.r(0.17, 0.25)]); z += t + 0.003; } }
    const bI = IM(new THREE.BoxGeometry(1, 1, 1), STDm({ roughness: 0.7 }), bk.length, false); bk.forEach(([z, y, t, h, d], i) => { bI.setMatrixAt(i, M4c(-5.82 + d / 2 - 0.1, y, z, 0, d, h, t)); bI.setColorAt(i, lin(R.pick(['#8a2a22', '#2a4a6a', '#d8c8a0', '#1e1e1e', '#c87a2a', '#4a6a3a', '#e8e0d0', '#6a3a5a']))); }); st.scene.add(bI); }
  // sofa and coffee table, an arc floor lamp
  { const lth = STDm({ color: '#8a4a24', roughness: 0.45 }); const sf = new THREE.Group(); sf.position.set(-2.4, 0, 4.6); st.scene.add(sf);
    sf.add(mesh(new THREE.BoxGeometry(2.4, 0.42, 0.95), lth, 0, 0.21, 0)); sf.add(mesh(new THREE.BoxGeometry(2.4, 0.5, 0.2), lth, 0, 0.62, 0.38)); [-1.15, 1.15].forEach((x) => sf.add(mesh(new THREE.BoxGeometry(0.16, 0.6, 0.95), lth, x, 0.3, 0)));
    st.scene.add(mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 32), STDm({ color: '#2a2622', roughness: 0.3 }), -2.4, 0.4, 3.5)); st.scene.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.38, 12), STDm({ color: '#1a1a1a' }), -2.4, 0.19, 3.5));
    const arc = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.8, 0, 5.4), new THREE.Vector3(-0.8, 2.6, 5.0), new THREE.Vector3(-1.7, 1.9, 3.8)), 20, 0.018, 6), STDm({ color: '#c8a050', metalness: 0.9, roughness: 0.3 })); st.scene.add(arc);
    const sh = mesh(new THREE.SphereGeometry(0.2, 20, 10, 0, TAU, 0, Math.PI / 2), STDm({ color: '#c8a050', metalness: 0.9, roughness: 0.3, side: THREE.DoubleSide }), -1.7, 1.9, 3.8); st.scene.add(sh);
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffc880', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 })); gl.position.set(-1.7, 1.8, 3.8); gl.scale.setScalar(0.7); st.scene.add(gl); S.arcGlow = gl; }
  // a big plant by the corner window
  { const px = 4.9, pz = -0.9; st.scene.add(mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.5, 20).translate(0, 0.25, 0), STDm({ color: '#d8d0c4', roughness: 0.7 }), px, 0, pz)); const lf = []; const RL = RNG('plantlf');
    for (let s = 0; s < 3; s++) { const sx = px + RL.n(0.12), sz = pz + RL.n(0.12), top = RL.r(1.5, 2.1); st.scene.add(mesh(new THREE.CylinderGeometry(0.015, 0.025, top, 6).translate(0, top / 2, 0), STDm({ color: '#4a3a28' }), sx, 0.45, sz)); for (let l = 0; l < 16; l++) { const y = 0.45 + top * RL.r(0.35, 1.0); lf.push([sx, y, sz, RL.r(0, TAU), RL.r(0.2, 0.8)]); } }
    const lI = IM(new THREE.PlaneGeometry(0.24, 0.34).translate(0, 0.17, 0), new THREE.MeshStandardMaterial({ map: stuLeafTex(), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6 }), lf.length, true); lf.forEach(([x, y, z, a, t], i) => lI.setMatrixAt(i, M4c(x, y, z, a, 1, 1, 1, -t))); st.scene.add(lI); }
  // glass (with mullions), the east and south walls
  const glass = new THREE.MeshPhysicalMaterial({ color: '#8aa0b0', roughness: 0.04, metalness: 0.9, transparent: true, opacity: 0.12, envMapIntensity: 1.2, depthWrite: false }); S.glassM = glass;
  const ge = mesh(new THREE.PlaneGeometry(12, cy), glass, 0, cy / 2, gz, { cast: false, recv: false }); st.scene.add(ge); const gs = mesh(new THREE.PlaneGeometry(9.6, cy).rotateY(-Math.PI / 2), glass, gx, cy / 2, gz + 4.8, { cast: false, recv: false }); st.scene.add(gs);
  const mul = STDm({ color: '#22262a', roughness: 0.4, metalness: 0.7 }), nm = 9 + 7, mI = IM(new THREE.BoxGeometry(0.05, cy, 0.1).translate(0, cy / 2, 0), mul, nm, true); let k = 0;
  for (let i = 0; i < 9; i++) mI.setMatrixAt(k++, M4c(-6 + i * 1.5, 0, gz)); for (let i = 1; i < 8; i++) mI.setMatrixAt(k++, M4c(gx, 0, gz + i * 1.4, Math.PI / 2)); st.scene.add(mI);
  st.scene.add(mesh(new THREE.BoxGeometry(12, 0.06, 0.12), mul, 0, 0.03, gz, { cast: false })); st.scene.add(mesh(new THREE.BoxGeometry(0.12, 0.06, 9.6), mul, gx, 0.03, gz + 4.8, { cast: false }));
  // reflections in the glass: the lamp and the arc lamp mirrored behind the panes
  S.refl = []; [[-0.62, 1.16, -0.52, 0.2, '#ffcf90', 0.22], [-1.7, 1.8, 3.8, 0.5, '#ffc880', 0.12]].forEach(([x, y, z, s, c, a]) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: a })); sp.position.set(x, y, 2 * gz - z); sp.scale.setScalar(s * 2); st.scene.add(sp); S.refl.push(sp); }); }

// ---- the desk and its things: walnut top on black steel legs, a brass lamp (a real spot light), mug, pencils, notebook, ruler, phone, a succulent; the chair
function stuDesk(st, S) { const d = STU.DESK, R = RNG('studesk');
  const wal = new THREE.MeshPhysicalMaterial({ map: stuWalnut(), color: '#d8ccc4', roughness: 0.5, clearcoat: 0.15, clearcoatRoughness: 0.3, envMapIntensity: 0.45 });
  const top = mesh(new THREE.BoxGeometry(1.8, 0.04, 0.85), wal, 0, d - 0.02, -0.25); st.scene.add(top);
  const steel = STDm({ color: '#1a1a1c', roughness: 0.35, metalness: 0.8 }); [[-0.86, -0.63], [0.86, -0.63], [-0.86, 0.13], [0.86, 0.13]].forEach(([x, z]) => st.scene.add(mesh(new THREE.BoxGeometry(0.04, d - 0.04, 0.04).translate(0, (d - 0.04) / 2, 0), steel, x, 0, z)));
  st.scene.add(mesh(new THREE.BoxGeometry(1.7, 0.03, 0.03), steel, 0, d - 0.06, -0.63)); st.scene.add(mesh(new THREE.BoxGeometry(0.5, 0.1, 0.6), wal, 0.55, d - 0.1, -0.25));
  // brass lamp with a real spot (warm pool on the desk)
  const brass = STDm({ color: '#c8a050', roughness: 0.28, metalness: 0.9 }), L = new THREE.Group(); L.position.set(-0.62, d, -0.5); st.scene.add(L);
  L.add(mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.018, 32).translate(0, 0.009, 0), brass)); const a1 = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 10).translate(0, 0.21, 0), brass, 0, 0.018, 0); a1.rotation.z = -0.18; L.add(a1);
  const a2 = mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.34, 10).translate(0, 0.17, 0), brass, 0.075, 0.43, 0); a2.rotation.z = -1.9; a2.rotation.y = 0.25; L.add(a2);
  const shade = mesh(new THREE.CylinderGeometry(0.03, 0.085, 0.12, 32, 1, true), STDm({ color: '#1e3a32', roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide }), 0.37, 0.4, 0.07); shade.rotation.z = 0.35; L.add(shade);
  const bulb = mesh(new THREE.SphereGeometry(0.022, 16, 10), new THREE.MeshBasicMaterial({ color: '#fff0d0' }), 0.385, 0.37, 0.07, { cast: false }); L.add(bulb);
  const spot = new THREE.SpotLight('#ffc888', 2.2, 3.5, 0.95, 0.65, 1.4); spot.position.set(-0.62 + 0.385, d + 0.38, -0.5 + 0.07); spot.target.position.set(-0.05, d, -0.25); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0005; spot.shadow.radius = 8; spot.shadow.blurSamples = 16; spot.shadow.camera.near = 0.05; spot.shadow.camera.far = 3; st.scene.add(spot, spot.target); S.spot = spot;
  const lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffd8a0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 })); lg.position.set(-0.62 + 0.385, d + 0.36, -0.5 + 0.07); lg.scale.setScalar(0.18); st.scene.add(lg); S.lampGlow = lg;
  // mug of coffee
  { const mug = new THREE.Group(); mug.position.set(0.48, d, -0.08); st.scene.add(mug); const cer = new THREE.MeshPhysicalMaterial({ color: '#2c5866', roughness: 0.3, clearcoat: 0.8 });
    mug.add(mesh(new THREE.LatheGeometry([[0, 0], [0.036, 0], [0.04, 0.004], [0.041, 0.09], [0.037, 0.092], [0.036, 0.008], [0, 0.008]].map(([r, y]) => new THREE.Vector2(r, y)), 32), cer)); mug.add(mesh(new THREE.CircleGeometry(0.036, 24).rotateX(-Math.PI / 2), STDm({ color: '#2a160c', roughness: 0.15 }), 0, 0.078, 0));
    const hd = mesh(new THREE.TorusGeometry(0.024, 0.0065, 8, 20, Math.PI), cer, 0.04, 0.047, 0); hd.rotation.z = -Math.PI / 2; mug.add(hd); mug.rotation.y = -0.6; }
  // pencil cup + pencils; a loose pencil; ruler; notebook; phone; succulent
  const yel = STDm({ color: '#f0b828', roughness: 0.5 }), wood = STDm({ color: '#e8c89a', roughness: 0.8 }), lead = STDm({ color: '#222' }), pink = STDm({ color: '#e88a8a', roughness: 0.7 }), fer = STDm({ color: '#c8c4bc', metalness: 0.9, roughness: 0.3 });
  const pencil = (len) => { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(0.0038, 0.0038, len, 6).translate(0, len / 2, 0), yel)); g.add(mesh(new THREE.ConeGeometry(0.0038, 0.02, 6).translate(0, len + 0.01, 0), wood)); g.add(mesh(new THREE.ConeGeometry(0.0013, 0.006, 6).translate(0, len + 0.018, 0), lead)); g.add(mesh(new THREE.CylinderGeometry(0.0041, 0.0041, 0.01, 8).translate(0, -0.005, 0), fer)); g.add(mesh(new THREE.CylinderGeometry(0.0038, 0.0038, 0.008, 8).translate(0, -0.014, 0), pink)); return g; };
  { const cup = mesh(new THREE.CylinderGeometry(0.035, 0.032, 0.1, 24, 1, true).translate(0, 0.05, 0), STDm({ color: '#8a8682', roughness: 0.9, side: THREE.DoubleSide }), -0.32, d, -0.56); st.scene.add(cup); st.scene.add(mesh(new THREE.CircleGeometry(0.033, 20).rotateX(-Math.PI / 2), STDm({ color: '#3a3836' }), -0.32, d + 0.03, -0.56));
    for (let i = 0; i < 5; i++) { const p = pencil(R.r(0.15, 0.18)); p.position.set(-0.32 + R.n(0.015), d + 0.02, -0.56 + R.n(0.015)); p.rotation.set(R.n(0.25), R.r(0, 6), R.n(0.25)); st.scene.add(p); } }
  { const p = pencil(0.17); p.rotation.set(0, 0, Math.PI / 2); p.rotation.y = 0.5; p.position.set(0.26, d + 0.004, 0.06); st.scene.add(p); }
  { const rt = g3Tex((x, w, h) => { x.fillStyle = '#c8ccd0'; x.fillRect(0, 0, w, h); x.fillStyle = '#222'; for (let i = 0; i <= 300; i++) { const l = i % 10 === 0 ? 0.45 : i % 5 === 0 ? 0.32 : 0.2; x.fillRect(i * w / 300, 0, 1, h * l); if (i % 10 === 0) { x.font = '9px Arial'; x.fillText(String(i / 10), i * w / 300 + 2, h * 0.75); } } }, 1024, 48);
    st.scene.add(mesh(new THREE.BoxGeometry(0.3, 0.0012, 0.025), STDm({ map: rt, roughness: 0.25, metalness: 0.7 }), -0.2, d + 0.0006, 0.06, { ry: 0.08 })); }
  { const nb = new THREE.Group(); nb.position.set(-0.42, d, -0.12); nb.rotation.y = 0.22; st.scene.add(nb); nb.add(mesh(new THREE.BoxGeometry(0.15, 0.014, 0.21).translate(0, 0.007, 0), STDm({ color: '#1c1a1a', roughness: 0.55 }))); nb.add(mesh(new THREE.BoxGeometry(0.144, 0.011, 0.204).translate(0.004, 0.0075, 0), STDm({ color: '#efe6d2', roughness: 0.9 })));
    nb.add(mesh(new THREE.BoxGeometry(0.152, 0.0145, 0.006).translate(0, 0.0075, 0.06), STDm({ color: '#a82a22', roughness: 0.6 }))); }
  st.scene.add(mesh(new THREE.BoxGeometry(0.072, 0.008, 0.15), STDm({ color: '#141416', roughness: 0.25, metalness: 0.4 }), 0.62, d + 0.004, -0.5, { ry: -0.3 }));
  { const sx = 0.72, sz = -0.56; st.scene.add(mesh(new THREE.CylinderGeometry(0.042, 0.034, 0.07, 20).translate(0, 0.035, 0), STDm({ color: '#b8603a', roughness: 0.85 }), sx, d, sz)); const sc = IM(new THREE.ConeGeometry(0.012, 0.05, 6).translate(0, 0.025, 0), STDm({ color: '#6a8a6a', roughness: 0.6 }), 14, true);
    for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 0.006 + i * 0.0018; sc.setMatrixAt(i, M4c(sx + Math.cos(a) * r, d + 0.065, sz + Math.sin(a) * r, -a + Math.PI / 2, 1, 1, 1, 0.3 + i * 0.05)); } st.scene.add(sc); }
  // the chair, pushed back from the desk
  { const ch = new THREE.Group(); ch.position.set(1.5, 0, 0.7); ch.rotation.y = -1.2; st.scene.add(ch); const fab = STDm({ color: '#2a2a2e', roughness: 0.9 });
    ch.add(mesh(new THREE.BoxGeometry(0.5, 0.08, 0.48), fab, 0, 0.47, 0)); ch.add(mesh(new THREE.BoxGeometry(0.48, 0.55, 0.06), fab, 0, 0.82, 0.24)); ch.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 10), steel, 0, 0.26, 0));
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU, l = mesh(new THREE.BoxGeometry(0.03, 0.03, 0.32).translate(0, 0, 0.16), steel, 0, 0.07, 0); l.rotation.y = a; ch.add(l); } } }

// ---- the hand that folds (folds 1–4 are colPaperSheet): its index tip follows the flap's free edge, then presses the
// fresh crease, then moves to the next edge. Probes the sheet at fixed times so every frame is independent.
function stuProbe(S, tt) { const r = S.sheet.pose(STU.COL, tt, { n: 4 }), FR = S.sheet.g.children[0]; return { tip: r.tip && r.tip.clone(), crease: r.crease && r.crease.clone(), dir: new THREE.Vector3(0, 0, 1).applyQuaternion(FR.getWorldQuaternion(new THREE.Quaternion())) }; }
function stuHandPose(S, t) { const H = S.hand, fk = (i) => FOLD_T[i] - foldDur(i); let p, curl = 0.45, thumb = 0.55, press = 0;
  let i = 1; while (i <= 4 && t >= FOLD_T[i]) i++;                       // the next fold to happen (5 = all done)
  const grip = (j) => stuProbe(S, fk(j) + 0.004).tip, crease = (j, u) => { const c = stuProbe(S, FOLD_T[j] - 0.004), L = 0.3 * Math.min(...colFoot(j)); return c.crease.addScaledVector(c.dir, (u - 0.5) * 2 * L); };
  const F = foldAt(t), tl = i > 1 ? FOLD_T[i - 1] : -1, pe = tl + 0.42;
  if (i <= 4 && F.k > 0) { p = stuProbe(S, t).tip || grip(i); }
  else if (i > 1 && t < pe) { const u = clamp((t - tl - 0.04) / 0.34); p = crease(i - 1, EZ.io(u)); press = Math.sin(Math.PI * clamp((t - tl) / 0.42)); curl = 0.12; thumb = 0.2; }
  else if (i <= 4) { const a = i > 1 ? crease(i - 1, 1) : grip(1), b = grip(i), u = i > 1 ? EZ.io(clamp((t - pe) / Math.max(0.05, fk(i) - pe))) : 1; p = a.clone().lerp(b, u); p.y += Math.sin(Math.PI * u) * 0.05; curl = lerp(0.12, 0.45, u); thumb = lerp(0.2, 0.55, u); }
  else { const u = EZ.i2(clamp((t - pe) / 0.32)); p = crease(4, 1).add(new THREE.Vector3(0.45, 0.4, 0.45).multiplyScalar(u)); curl = 0.3; }
  S.sheet.pose(STU.COL, t, { n: 4, visible: t < 3.4 });
  p.y += 0.004 - press * 0.002;
  const wrist = p.clone().add(new THREE.Vector3(0.09, 0.085, 0.09)), fy = p.clone().sub(wrist).normalize(), up = new THREE.Vector3(0.15, 1, 0.25).normalize(), fz = up.sub(fy.clone().multiplyScalar(up.dot(fy))).normalize(), fx = fy.clone().cross(fz);
  H.root.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(fx, fy, fz)); H.root.position.copy(p).addScaledVector(fy, -0.168).addScaledVector(fz, 0.012);
  poseHand(H, { curl: [curl * 0.7, curl, curl * 1.15, curl * 1.25], spread: 0.25, thumb, wristPitch: 0.15 }); }

// ---- debris and dust when the column breaks the ceiling (inside) and the roof (outside)
function stuDebris(st, S) { const R = RNG('studeb'), n = 90, L = [];
  const tileM = STDm({ color: '#eceae6', roughness: 0.9 }), concM = STDm({ color: '#9a968e', roughness: 0.95 });
  const geoT = new THREE.BoxGeometry(1, 0.02, 1), geoC = lumpyGeo(1, 0.4, 5);
  const I1 = IM(geoT, tileM, n, true), I2 = IM(geoC, concM, n, true); [I1, I2].forEach((I) => { I.instanceMatrix.setUsage(THREE.DynamicDrawUsage); I.frustumCulled = false; st.scene.add(I); });
  for (let i = 0; i < n; i++) { const out = i % 3 === 0; L.push({ x: R.n(0.55), z: -0.25 + R.n(0.55), y: out ? 3.6 : 3.2 - R.r(0, 0.1), vx: R.n(out ? 4 : 2.2), vz: R.n(out ? 4 : 2.2), vy: out ? R.r(3, 10) : R.r(-1.5, 2.0), s: out ? R.r(0.04, 0.2) : (R.f() < 0.5 ? R.r(0.06, 0.16) : R.r(0.012, 0.05)), ax: R.r(-12, 12), ay: R.r(-12, 12), out, tile: !out && R.f() < 0.5, dt: R.r(0, 0.12) }); }
  const smk = []; for (let i = 0; i < 26; i++) { const out = i >= 16; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: stuSmokeTex(), color: out ? '#e8c8b0' : '#d8ccc0', transparent: true, depthWrite: false, opacity: 0 })); st.scene.add(sp); smk.push({ sp, out, a: R.r(0, TAU), r: R.r(0.2, 1), v: R.r(0.6, 1.6), ry: R.n(1), s: R.r(0.6, 1.4) }); }
  const shaft = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.2, 24, 1, true).translate(0, -1.6, 0), new THREE.MeshBasicMaterial({ map: g3Tex((c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }, 8, 64), color: '#ffb880', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  shaft.position.set(0, 3.2, -0.25); st.scene.add(shaft);
  const hang = IM(new THREE.BoxGeometry(0.28, 0.018, 0.26).translate(0, 0, 0.13), tileM, 8, true); hang.instanceMatrix.setUsage(THREE.DynamicDrawUsage); st.scene.add(hang); const HL = [];
  [[-0.6, 0, 1, 0], [0.6, 0, -1, 0], [0, -0.85, 0, 1], [0, 0.35, 0, -1]].forEach(([ex, ez, dx, dz], j) => [-0.3, 0.3].forEach((o) => HL.push({ x: ex + (dz ? o : 0), z: ez + (dx ? o : 0), yaw: Math.atan2(dx, dz), a: R.r(0.5, 1.3), w: R.r(5, 9), ph: R.r(0, 6) })));
  S.deb = { L, I1, I2, smk, shaft, hang, HL }; }
function stuDebrisPose(S, t) { const D = S.deb, tI = STU.TI, dt = t - tI, M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(); let c1 = 0, c2 = 0;
  const on = dt > 0 && dt < 30; S.plug.visible = !on; S.tileHole.forEach((i) => S.tiles.setMatrixAt(i, on ? _hid : M4c((Math.floor(i / 16) - 10) * 0.6 + 0.3, STU.CEIL - 0.01, -0.25 - 1.2 + (i % 16) * 0.6 + 0.3))); S.tiles.instanceMatrix.needsUpdate = true;
  D.L.forEach((b) => { let x = b.x, y = b.y, z = b.z, r = 0; const tt = dt - b.dt; if (tt > 0 && on) { const floor = b.out ? (Math.abs(x + b.vx * tt) < 6 && Math.abs(z + b.vz * tt) < 30 ? STU.ROOF : -300) : (Math.abs(x + b.vx * tt) < 0.9 && Math.abs(z + b.vz * tt + 0.25) < 0.42 ? STU.DESK : 0);
      x += b.vx * tt; z += b.vz * tt; y += b.vy * tt - 4.9 * tt * tt; if (y < floor + b.s * 0.3) { y = floor + b.s * 0.3; const tl = (b.vy + Math.sqrt(Math.max(0, b.vy * b.vy + 9.8 * (b.y - y)))) / 9.8; x = b.x + b.vx * Math.min(tt, tl) * 1.05; z = b.z + b.vz * Math.min(tt, tl) * 1.05; r = Math.min(tt, tl); } else r = tt; }
    else if (!on || tt <= 0) { const h = _hid; (b.tile ? D.I1 : D.I2).setMatrixAt(b.tile ? c1++ : c2++, h); return; }
    e.set(b.ax * r, b.ay * r, 0); q.setFromEuler(e); M.compose(_v.set(x, y, z), q, _s.set(b.s, b.tile ? 1 : b.s * 0.6, b.s)); (b.tile ? D.I1 : D.I2).setMatrixAt(b.tile ? c1++ : c2++, M); });
  for (; c1 < D.I1.count; c1++) D.I1.setMatrixAt(c1, _hid); for (; c2 < D.I2.count; c2++) D.I2.setMatrixAt(c2, _hid); D.I1.instanceMatrix.needsUpdate = true; D.I2.instanceMatrix.needsUpdate = true;
  D.smk.forEach((m) => { if (!on) { m.sp.visible = false; return; } m.sp.visible = true; const u = Math.max(0, dt) * m.v, r = 0.3 + m.r * (1 - Math.exp(-u * 1.2)) * (m.out ? 6 : 2.4);
    m.sp.position.set(Math.cos(m.a) * r, (m.out ? STU.ROOF + 0.5 + u * 0.9 : STU.CEIL - 0.2 - u * 0.25 + m.ry * 0.3), -0.25 + Math.sin(m.a) * r); m.sp.scale.setScalar((m.out ? 2.5 : 1.0) * m.s * (0.6 + u * 0.8)); m.sp.material.opacity = 0.6 * Math.exp(-dt * 0.45) * clamp(dt * 8); m.sp.material.rotation = m.a + u * 0.2; });
  D.HL.forEach((h, i) => D.hang.setMatrixAt(i, on ? M4c(h.x, STU.CEIL - 0.03, h.z, h.yaw, 1, 1, 1, h.a * EZ.back(clamp(dt * 3)) + 0.12 * Math.sin(dt * h.w + h.ph) * Math.exp(-dt * 1.2)) : _hid)); D.hang.instanceMatrix.needsUpdate = true;
  D.shaft.material.opacity = on ? 0.05 * clamp(dt * 3) * Math.exp(-dt * 0.5) : 0; }

// ---- 2D measuring brackets (a vertical rule beside a thing, with ticks and a label)
function stuBracket(st, p0, p1, title, sub, dx, a) { if (a <= 0) return; const s0 = p0.clone().project(st.cam), s1 = p1.clone().project(st.cam); if (s0.z > 1 || s1.z > 1) return;
  const x = (s0.x * 0.5 + 0.5) * W + dx, y0 = (-s0.y * 0.5 + 0.5) * H, y1 = (-s1.y * 0.5 + 0.5) * H, yy = lerp(y0, y1, ss(0, 1, a));
  const f = () => { ctx.save(); screen(); ctx.globalAlpha = clamp(a * 1.5); ctx.strokeStyle = 'rgba(255,248,236,0.92)'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(x - 14, y0); ctx.lineTo(x + 14, y0); ctx.moveTo(x, y0); ctx.lineTo(x, yy); if (a > 0.95) { ctx.moveTo(x - 14, y1); ctx.lineTo(x + 14, y1); } ctx.stroke(); ctx.restore();
    const side = dx > 0 ? 1 : -1, ty = (y0 + y1) / 2; pvText(title, x + side * 22, ty - 8, 28, { font: PV.sans, weight: 800, spacing: 2, align: side > 0 ? 'left' : 'right', alpha: clamp((a - 0.6) * 3) });
    if (sub) pvText(sub, x + side * 22, ty + 26, 22, { font: PV.sans, weight: 600, align: side > 0 ? 'left' : 'right', alpha: clamp((a - 0.6) * 3) * 0.85, color: ACCENT }); };
  if (DEFER) DEFER.push(f); else f(); }

// ---- build everything once
function stuBuild() { return once('studio', () => {
  const st = makeStage({ fov: 40, far: 160000, hemi: 0.5, sky: 0xc0a8a0, ground: 0x5a4030, key: 2.6, keyCol: '#ff9a52', box: 4.5, boxFar: 90, sunDist: 45 }); st.cam.near = 0.02;
  st.setSun(STU.SUN, new THREE.Vector3(0.5, STU.DESK, 0.6)); skyEnv(st, '#6a5070', '#f0a878', STU.SUN, '#ffb070');
  const fill = new THREE.DirectionalLight('#b8a0d0', 0.35); fill.position.set(0, 4, -30); st.scene.add(fill); st.fill = fill;
  const S = { st }; stuSky(st); stuGround(st); stuCity(st, S); stuTower(st, S); stuRoom(st, S); stuDesk(st, S); stuDebris(st, S);
  S.sheet = colPaperSheet(st.scene, {}); S.col = makeColumn(st.scene, { style: 'paper', minPx: 1.8 });
  S.hand = makeHand(1, { skin: '#b07c62', sleeve: '#e8e4dc' }); st.scene.add(S.hand.root); S.hand.fore.add(mesh(new THREE.CylinderGeometry(0.05, 0.056, 0.4, 20).translate(0, -0.42, 0), S.hand.sleeveM));
  S.hand.root.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  S.person = makePerson({ female: true, skin: '#c8906a', hair: '#1e1612', hairStyle: 'bun', top: '#d8a038', bottom: '#2a2e3a', shoe: '#3a2a20', sleeve: 'long', seed: 77 }); st.scene.add(S.person.root); S.person.root.visible = false;
  // the hologram of the Torre Latinoamericana that stands beside the column at 21 folds
  { const gm = new THREE.MeshBasicMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }); const g = stuLatino(gm, gm, true); const eg = new THREE.Group();
    g.children.forEach((c) => { const l = new THREE.LineSegments(new THREE.EdgesGeometry(c.geometry), new THREE.LineBasicMaterial({ color: '#c8f4ff', transparent: true, opacity: 0, depthWrite: false })); eg.add(l); });
    const ghost = new THREE.Group(); ghost.add(g, eg); ghost.position.set(50, STU.DESK, -7); ghost.visible = false; st.scene.add(ghost); S.ghost = { ghost, gm, lines: eg.children.map((l) => l.material) }; }
  return S; }); }
// time of day: 0 dusk … 1 night
function stuMood(S, night, lampK = 1) { const st = S.st; STU.U.uNight.value = night; STU.U.uT.value = TT; STU.U.uHaze.value = 5200;
  st.key.intensity = 2.6 * (1 - night); st.hemi.intensity = lerp(0.5, 0.12, night); st.hemi.color.set(night > 0.5 ? '#3a4a78' : '#c0a8a0'); st.fill.intensity = lerp(0.35, 0.08, night);
  S.spot.intensity = lerp(1.8, 1.7, night) * lampK; S.spot.color.set(night > 0.5 ? '#ffe0c0' : '#ffc888'); S.lampGlow.material.opacity = 0.6 * lampK; S.ledM.color.setScalar(lerp(0.85, 0.15, night)); S.refl[0].material.opacity = lerp(0.2, 0.5, night) * lampK;
  st.scene.environmentIntensity = 1; }
function stuInside(S, inside) { S.refl.forEach((r) => (r.visible = inside)); S.glassM.opacity = inside ? 0.12 : 0.22; }
function stuColPose(S, t, on = true) { return S.col.pose(STU.COL, STU.UP, colLen(t), t, { visible: on }); }

// ---- the shots
const stuOrbit = (tgt, D, az, el) => [tgt[0] + Math.sin(az) * Math.cos(el) * D, tgt[1] + Math.sin(el) * D, tgt[2] + Math.cos(az) * Math.cos(el) * D];
function stuHide(S, t) { S.person.root.visible = false; S.ghost.ghost.visible = false; S.hand.root.visible = false; if (S.wad) S.wad.visible = false; }
// FOLD: close on the desk; the sheet bends over four times under a hand; the title above (the window and the city behind it)
SHOT_FN.fold = (lt, dur, t) => { const S = stuBuild(), st = S.st, D = lerp(1.0, 0.62, EZ.io(t / 4)), el = lerp(25, 30, t / 4) * DEG, az = lerp(10, 18, t / 4) * DEG, tgt = [STU.COL.x + 0.01, STU.DESK + 0.004, STU.COL.z - 0.01];
  st.cam.near = 0.02; camPt(st, stuOrbit(tgt, D, az, el), tgt, 36, t, 0.35, 2);
  if (CAMONLY) return renderStage(st);
  stuMood(S, 0); stuInside(S, true); stuHide(S, t); stuDebrisPose(S, 0);
  if (t < 3.4) { stuColPose(S, t, false); S.hand.root.visible = true; stuHandPose(S, t); } else { S.sheet.pose(STU.COL, t, { visible: false }); stuColPose(S, t); S.hand.root.visible = t < 3.95; if (S.hand.root.visible) stuHandPose(S, t); S.sheet.pose(STU.COL, t, { visible: false }); }
  renderStage(st, 1.0); bloom(0.4); };
// DOUBLE: the stack doubles every fold (5 → 13), the camera backs off as it becomes a column
SHOT_FN.double = (lt, dur, t) => { const S = stuBuild(), st = S.st, Ls = colGrow(t);
  const D = 0.3 + 1.85 * Ls, h = Math.max(0.004, Ls * 0.5), az = lerp(30, 18, lt / dur) * DEG, el = lerp(26, 9, ss(4, 10, t)) * DEG, tgt = [STU.COL.x, STU.DESK + h, STU.COL.z];
  st.cam.near = 0.01; camPt(st, stuOrbit(tgt, D, az, el), tgt, 42, t, 0.35, 3);
  if (CAMONLY) return renderStage(st);
  stuMood(S, 0); stuInside(S, true); S.sheet.pose(STU.COL, t, { visible: false }); stuHide(S, t); stuDebrisPose(S, 0);
  stuColPose(S, t); renderStage(st, 1.0); bloom(0.4); };
// TALL: 14 folds, 1.64 m — someone walks by behind the desk, stops beside it, looks up
SHOT_FN.tall = (lt, dur, t) => { const S = stuBuild(), st = S.st, u = lt / dur;
  const p = [lerp(3.25, 2.95, u), 1.45, lerp(5.75, 5.35, u)]; st.cam.near = 0.05; camPt(st, p, [0.1, 1.2, -0.6], 30, t, 0.4, 4);   // long lens: she and the column at ~the same depth read the same size
  if (CAMONLY) return renderStage(st);
  stuMood(S, 0.02); stuInside(S, true); S.sheet.pose(STU.COL, t, { visible: false }); stuHide(S, t); stuDebrisPose(S, 0); stuColPose(S, t);
  const P = S.person; P.root.visible = true; const x = knots([[10.0, 3.2], [12.0, 0.45], [14.0, 0.45]], t), stop = ss(11.75, 12.05, t), walk = 1 - stop, look = ss(11.9, 12.35, t);   // she stays beside it to the cut (walking out crossed the HUD)
  posePerson(P, { x, z: -1.0, yaw: lerp(-Math.PI / 2, -0.35, stop), walk, ph: x * 4.0, headYaw: look * 0.75, headPitch: -look * 0.4, emo: { surprise: look * 0.8, open: look * 0.25, smile: look * 0.2 }, look: [look * 0.5, look * 0.6] });
  const bA = ss(10.55, 11.2, t), pA = ss(12.1, 12.6, t);
  stuBracket(st, new THREE.Vector3(STU.COL.x + 0.07, STU.DESK, STU.COL.z), new THREE.Vector3(STU.COL.x + 0.07, STU.DESK + thickM(14), STU.COL.z), '1,64 m', 'EL PAPEL', 22, bA);
  stuBracket(st, new THREE.Vector3(x - 0.3, 0, -1.0), new THREE.Vector3(x - 0.3, 1.7, -1.0), 'TÚ', '1,70 m', -14, pA);
  renderStage(st, 1.0); bloom(0.4); };
// CEILING: it breaks through; the camera backs out of the window into the sky and the column rises past the Torre Latino
const STU_CK = [ // t, target xyz, ln(distance), azimuth°, elevation°, fov
  [14.0, 0, 2.2, -0.25, Math.log(1.3), 32, -34, 64], [14.6, 0, 2.5, -0.25, Math.log(1.35), 30, -38, 64], [15.35, 0, 2.7, -0.25, Math.log(1.55), 26, -30, 62],
  [15.9, 0, 3.4, -0.25, Math.log(3.0), 22, -16, 58], [16.45, 0, 6, -0.25, Math.log(16), 14, -5, 56], [17.0, 0, 25, 0, Math.log(60), 0, 2, 46],
  [17.6, 20, 55, -4, Math.log(270), -5, 5, 42], [18.2, 60, 100, -9, Math.log(900), -8, 8, 40], [19.0, 61, 100, -10, Math.log(950), -10, 8, 40]];
function stuHerm(K, t) { const n = K.length; if (t <= K[0][0]) return K[0].slice(1); if (t >= K[n - 1][0]) return K[n - 1].slice(1); let i = 0; while (t > K[i + 1][0]) i++;
  const h = K[i + 1][0] - K[i][0], u = (t - K[i][0]) / h, h00 = 2 * u ** 3 - 3 * u * u + 1, h10 = u ** 3 - 2 * u * u + u, h01 = -2 * u ** 3 + 3 * u * u, h11 = u ** 3 - u * u;
  return K[i].slice(1).map((v0, d) => { const v1 = K[i + 1][d + 1], m0 = i > 0 ? (v1 - K[i - 1][d + 1]) / (K[i + 1][0] - K[i - 1][0]) * h : 0, m1 = i + 2 < n ? (K[i + 2][d + 1] - v0) / (K[i + 2][0] - K[i][0]) * h : 0; return h00 * v0 + h10 * m0 + h01 * v1 + h11 * m1; }); }
// (the city haze clears 17.4–18.6 toward the hand-off to the city shot)
SHOT_FN.ceiling = (lt, dur, t) => { const S = stuBuild(), st = S.st, [tx, ty, tz, lnD, A, E, fv] = stuHerm(STU_CK, t), D = Math.exp(lnD), a = A * DEG, e = E * DEG;
  const p = [tx + Math.sin(a) * Math.cos(e) * D, ty + Math.sin(e) * D, tz - Math.cos(a) * Math.cos(e) * D], shake = t > STU.TI ? Math.exp(-(t - STU.TI) * 5) : 0;
  st.cam.near = D > 30 ? 0.8 : D > 6 ? 0.1 : 0.03; camPt(st, p, [tx, ty, tz], fv, t, 0.4 + 6 * shake, 5); st.cam.rotation.z += 0.02 * shake * Math.sin(t * 60);
  if (CAMONLY) return renderStage(st);
  const inside = p[2] > STU.GZ; stuMood(S, 0.03); STU.U.uHaze.value = lerp(5200, 9500, ss(16, 17.6, t)) + 22000 * ss(17.4, 18.6, t); stuInside(S, inside); S.sheet.pose(STU.COL, t, { visible: false }); stuHide(S, t);
  stuDebrisPose(S, t); stuColPose(S, t);
  const ga = ss(17.7, 18.35, t); S.ghost.ghost.visible = ga > 0; S.ghost.gm.opacity = 0.06 * ga; S.ghost.lines.forEach((m) => (m.opacity = 0.8 * ga)); S.ghost.ghost.scale.y = lerp(0.02, 1, EZ.o3(ga));
  renderStage(st, 1.0); bloom(0.45);
  const la = ss(18.25, 18.7, t);
  if (la > 0) { const pr = (v) => { const q = v.clone().project(st.cam); return [(q.x * 0.5 + 0.5) * W, (-q.y * 0.5 + 0.5) * H]; }, [gx, gy] = pr(S.ghost.ghost.position.clone().add(new THREE.Vector3(0, 183, 0))), [cx, cy] = pr(STU.COL.clone().add(new THREE.Vector3(0, colLen(t), 0)));
    const f = () => { ctx.save(); screen(); ctx.globalAlpha = la; ctx.strokeStyle = 'rgba(200,244,255,0.85)'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(gx - 30, gy); ctx.lineTo(cx + 40, gy); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = ACCENT; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + 26, gy); ctx.lineTo(cx + 26, cy); ctx.moveTo(cx + 18, cy); ctx.lineTo(cx + 34, cy); ctx.stroke(); ctx.restore();
      pvText('+27 m', cx + 42, (gy + cy) / 2 + 12, 34, { font: PV.sans, weight: 800, alpha: la, color: ACCENT }); };
    if (DEFER) DEFER.push(f); else f(); }
  if (la > 0) { colLabel(st, S.ghost.ghost.position.clone().add(new THREE.Vector3(0, 183, 0)), 'TORRE LATINOAMERICANA', '183 m', la, 1); colLabel(st, STU.COL.clone().add(new THREE.Vector3(0, colLen(t), 0)), 'EL PAPEL', '210 m', la, -1, { dy: 10 }); } };
// RECORD: night, the desk lamp, a real sheet folded only a few times (the night city hazed back so the busy windows recede)
SHOT_FN.record = (lt, dur, t) => { const S = stuBuild(), st = S.st, W0 = S.wad || (S.wad = stuWad(st));
  const D = lerp(0.46, 0.34, EZ.io(lt / dur)), el = 21 * DEG, az = lerp(-14, -8, lt / dur) * DEG, tgt = [0.02, STU.DESK + 0.01, -0.22];
  st.cam.near = 0.01; camPt(st, [tgt[0] + Math.sin(az) * Math.cos(el) * D, tgt[1] + Math.sin(el) * D, tgt[2] + Math.cos(az) * Math.cos(el) * D], tgt, 40, t, 0.25, 6);
  if (CAMONLY) return renderStage(st);
  stuMood(S, 1); STU.U.uHaze.value = 1200; stuInside(S, true); stuColPose(S, t, false); S.sheet.pose(STU.COL, t, { visible: false }); stuHide(S, t); stuDebrisPose(S, 0); W0.visible = true;
  renderStage(st, 1.05); bloom(0.5); };
// the little wad: an A4 folded 7 times — rounded, bulging, its open edges fanning
function stuWad(st) { const tex = g3Tex((x, w, h) => { x.fillStyle = '#f2eee4'; x.fillRect(0, 0, w, h); const R = RNG('wad'); for (let i = 0; i < 64; i++) { const y = (i + 0.5) * h / 64 + R.n(0.6); x.strokeStyle = `rgba(80,70,60,${R.r(0.35, 0.7)})`; x.lineWidth = R.r(1, 2); x.beginPath(); x.moveTo(0, y); for (let px = 0; px <= w; px += 16) x.lineTo(px, y + Math.sin(px * 0.03 + i) * 0.8); x.stroke(); } }, 256, 256);
  const g = roundedBox(0.04, 0.0128, 0.028, 0.004, 10), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); p.setY(i, y * (1 + 0.6 * (1 - (x / 0.02) ** 2) * (1 - (z / 0.014) ** 2) * 0.15) + 0.0006 * Math.sin(x * 400 + z * 300)); } g.computeVertexNormals();
  const m = mesh(g, STDm({ map: tex, roughness: 0.95, color: '#f0ece6' }), 0.02, STU.DESK + 0.0072, -0.22, { ry: 0.5 }); st.scene.add(m); return m; }
