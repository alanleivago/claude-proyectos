// =====================================================================
//  COSMOS (38–66) — owned by the cosmos agent. One stage for six shots: the Moon, the Sun and the planets, the nearest
//  star, the Milky Way from outside, Andromeda and the cosmic web, the observable universe.
//  Everything is placed from REAL distances in metres (Earth at the origin, the column rising along +y); every frame the
//  world is rescaled so the camera sits ~100 units from what it frames (X.u = metres per unit). So the one paper column
//  (makeColumn, style 'beam') keeps a steady width from 400.000 km to 107 mil millones de años luz.
// =====================================================================
const COS_LY = LIGHTYEAR, COS_AU = 1.496e11, COS_RE = 6.371e6, COS_RM = 1.737e6, COS_RS = 6.96e8;
const cosV = (x, y, z) => new THREE.Vector3(x, y, z);
const cosN = (x, y, z) => new THREE.Vector3(x, y, z).normalize();
const COS_UP = cosV(0, 1, 0);
const COS_SUN = cosN(0.45, 0.85, 0.28);                         // direction of the Sun seen from the Earth
const COS_MOON = cosN(0.25, 0.72, 0.65).multiplyScalar(3.844e8);  // the Moon (height ~277.000 km: passed by fold 42)
const COS_SUNP = COS_SUN.clone().multiplyScalar(COS_AU);          // the Sun (height ~127 million km: passed by fold 51)
const COS_LM = (() => { const m = COS_MOON.clone().normalize(), r = cosN(0.93, 0, -0.36); return r.multiplyScalar(0.9).addScaledVector(m, 0.12).add(cosV(0, 0.3, 0)).normalize(); })();   // sunlight in the Moon shot (half-lit Moon and Earth)
const COS_BAND = cosN(0.8, 0.55, -0.2);                           // normal of the Milky Way band in our sky / the local disk
const COS_ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
const cosG = (R) => (R.f() + R.f() + R.f() + R.f() - 2) * 1.732;
// the smoothed fold count (n + eased k, averaged over a short window) and the beam length it gives — for the camera
const cosFz = (t) => { const F = foldAt(t); return F.n + F.k * F.k * (3 - 2 * F.k); };
function cosZs(t, w = 0.35, ah = 0.2) { let a = 0; for (let i = 0; i < 12; i++) a += cosFz(t + ah - w * i / 11); return a / 12; }
const cosLen = (t, w, ah) => thickM(cosZs(t, w, ah));

const COS_GL = `
float cH(vec3 p){ p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
vec3 cH3(vec3 p){ return vec3(cH(p), cH(p + 17.31), cH(p + 41.73)); }
float cN(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(cH(i), cH(i + vec3(1, 0, 0)), f.x), mix(cH(i + vec3(0, 1, 0)), cH(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(cH(i + vec3(0, 0, 1)), cH(i + vec3(1, 0, 1)), f.x), mix(cH(i + vec3(0, 1, 1)), cH(i + vec3(1, 1, 1)), f.x), f.y), f.z); }
float cF(vec3 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++){ a += m * cN(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); m *= 0.5; } return a; }
vec3 cBump(vec3 N, vec3 P, float h, float k){ vec3 dpx = dFdx(P), dpy = dFdy(P); float hx = dFdx(h), hy = dFdy(h);
  vec3 r1 = cross(dpy, N), r2 = cross(N, dpx); float det = dot(dpx, r1); vec3 g = sign(det) * (hx * r1 + hy * r2); return normalize(abs(det) * N - k * g); }
`;
const COS_VS = 'varying vec3 vN, vWp; void main(){ vN = position; vec4 w = modelMatrix * vec4(position, 1.0); vWp = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';

// ---- painting helpers (soft dots, glows, star textures)
function cosDotImg(rgb, n = 32) { const c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'), g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(0.3, `rgba(${rgb},0.45)`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(0, 0, n, n); return c; }
const COS_DOTS = () => once('cos_dots', () => ({ blue: cosDotImg('130,170,255'), white: cosDotImg('255,250,240'), gold: cosDotImg('255,200,135'), pink: cosDotImg('255,100,165'), pale: cosDotImg('200,212,255'), dark: cosDotImg('6,4,3'), warm: cosDotImg('255,225,190') }));
function cosGlowC(x, cx, cy, r, rgb, a) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(0.3, `rgba(${rgb},${a * 0.4})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); }
// a star sprite texture: halo, hot core, diffraction spikes
function cosStarTex(rgb, spikes = 1) { return g3Tex((x, w) => { const c = w / 2; x.globalCompositeOperation = 'lighter';
  cosGlowC(x, c, c, w * 0.5, rgb, 0.35); cosGlowC(x, c, c, w * 0.16, rgb, 0.8); cosGlowC(x, c, c, w * 0.06, '255,255,255', 1); cosGlowC(x, c, c, w * 0.03, '255,255,255', 1);
  if (spikes) [0, 1].forEach((v) => [[0.004, 0.9], [0.016, 0.25], [0.05, 0.07]].forEach(([tw, a]) => { const g = v ? x.createLinearGradient(c, 0, c, w) : x.createLinearGradient(0, c, w, c);
    g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(0.5, `rgba(255,255,255,${a * spikes})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; const t2 = w * tw; if (v) x.fillRect(c - t2 / 2, 0, t2, w); else x.fillRect(0, c - t2 / 2, w, t2); }));
}, 256, 256); }
const cosSprite = (tex, col = '#ffffff', op = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map: tex, color: col, opacity: op, fog: false, toneMapped: false }, COS_ADD))); s.frustumCulled = false; return s; };
const COS_GLOW = () => once('cos_glow', () => g3Radial([[0, 'rgba(255,255,255,1)'], [0.12, 'rgba(255,255,255,0.55)'], [0.4, 'rgba(255,255,255,0.12)'], [1, 'rgba(255,255,255,0)']], 128));

// a spiral galaxy painted into a canvas (face-on): smooth disk, arms of blue stars, star clouds, feathery spurs,
// dust lanes on the arms' inner edges, pink HII knots, a golden bar and bulge
function cosPaintSpiral(x, cx, cy, Rr, o, R) { const D = COS_DOTS(), k = o.n || 1; x.globalCompositeOperation = 'lighter';
  const dot = (img, px, py, s, a) => { x.globalAlpha = Math.min(1, a); x.drawImage(img, px - s, py - s, 2 * s, 2 * s); };
  const b = o.pitch, rc = Rr * o.rc, phM = Math.log(1.02 * Rr / rc) / b;
  const arm = (a, u, sg) => { const ph = u * phM, r = rc * Math.exp(b * ph), th = o.rot + a * TAU / o.arms + ph; return [cx + r * Math.cos(th) + cosG(R) * sg, cy + r * Math.sin(th) + cosG(R) * sg]; };
  cosGlowC(x, cx, cy, Rr * 1.12, o.haze, 0.2); cosGlowC(x, cx, cy, Rr * 0.6, '255,214,170', 0.16);
  for (let i = 0; i < 26000 * k; i++) { const r = Rr * Math.min(1.08, -Math.log(R.f() + 1e-4) * o.sl), th = R.r(0, TAU); dot(r < Rr * 0.3 ? D.gold : D.pale, cx + r * Math.cos(th), cy + r * Math.sin(th), Rr * 0.006 + 1, 0.05); }
  for (let a = 0; a < o.arms; a++) {
    for (let i = 0; i < o.nArm * k; i++) { const u = Math.pow(R.f(), 0.85), [px, py] = arm(a, u, Rr * (0.014 + 0.05 * u)); dot(R.f() < 0.55 ? D.blue : R.f() < 0.5 ? D.white : D.pale, px, py, Rr * (0.004 + 0.011 * R.f() * R.f()) + 0.7, o.armA * (1 - 0.4 * u)); }
    for (let i = 0; i < 70 * k; i++) { const [px, py] = arm(a, R.r(0.04, 0.95), Rr * 0.03); cosGlowC(x, px, py, Rr * R.r(0.015, 0.045), '150,180,255', 0.09); }
    for (let i = 0; i < 3000 * k; i++) { const u = R.r(0.1, 0.95), ph = u * phM, r = rc * Math.exp(b * ph) * R.r(1.0, 1.25), th = o.rot + a * TAU / o.arms + ph + R.r(0.15, 0.9); dot(D.pale, cx + r * Math.cos(th) + cosG(R) * Rr * 0.01, cy + r * Math.sin(th) + cosG(R) * Rr * 0.01, Rr * 0.006 + 0.8, 0.07); }
  }
  x.globalCompositeOperation = 'source-over';
  for (let a = 0; a < o.arms; a++) for (let i = 0; i < o.nDust * k; i++) { const u = R.r(0.0, 0.92), ph = u * phM, r = rc * Math.exp(b * ph) * (0.95 - 0.03 * R.f()), th = o.rot + a * TAU / o.arms + ph - 0.06 + cosG(R) * 0.05;
    dot(D.dark, cx + r * Math.cos(th) + cosG(R) * Rr * 0.008, cy + r * Math.sin(th) + cosG(R) * Rr * 0.008, Rr * (0.006 + 0.02 * R.f()), o.dustA * 0.7); }
  x.globalCompositeOperation = 'lighter';
  for (let a = 0; a < o.arms; a++) for (let i = 0; i < 1500 * k; i++) { const [px, py] = arm(a, Math.pow(R.f(), 0.9), Rr * 0.03 * (o.wide || 1)); dot(R.f() < 0.6 ? D.white : D.blue, px, py, 0.9 + R.f() * 1.4, 0.55 * (o.young ?? 1)); }
  for (let i = 0; i < o.nHII * k; i++) { const [px, py] = arm(R.i(0, o.arms - 1), R.r(0.08, 0.95), Rr * 0.025); cosGlowC(x, px, py, Rr * R.r(0.003, 0.01), '255,80,150', R.r(0.35, 0.8)); dot(D.white, px, py, 1.2, 0.6); }
  if (o.bar) { x.save(); x.translate(cx, cy); x.rotate(o.rot); x.scale(1, 0.3); cosGlowC(x, 0, 0, Rr * o.rc * 1.25, '255,196,130', 0.6); x.restore(); }
  cosGlowC(x, cx, cy, Rr * o.bulge, '255,190,125', 0.5); cosGlowC(x, cx, cy, Rr * o.bulge * 0.4, '255,226,180', 0.85); cosGlowC(x, cx, cy, Rr * 0.035, '255,250,235', 1);
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
function cosGalTex(seed, o, w = 2048) { return g3Tex((x) => { const R = RNG('cosgal' + seed); x.fillStyle = '#000'; x.fillRect(0, 0, w, w); cosPaintSpiral(x, w / 2, w / 2, w * 0.45, o, R);
  const c2 = document.createElement('canvas'); c2.width = c2.height = w; const y = c2.getContext('2d'); y.filter = `blur(${w / 220}px)`; y.drawImage(x.canvas, 0, 0); x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.55; x.drawImage(c2, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }, w, w, false); }
const COS_MW = { arms: 4, pitch: 0.24, rc: 0.2, rot: 0.6, sl: 0.3, nArm: 9000, armA: 0.12, nDust: 3800, dustA: 0.16, nHII: 160, bar: true, bulge: 0.3, haze: '100,120,200', wide: 1.7, young: 0.4 };
const COS_M31 = { arms: 2, pitch: 0.13, rc: 0.3, rot: 1.9, sl: 0.33, nArm: 12000, armA: 0.11, nDust: 7000, dustA: 0.2, nHII: 160, bar: false, bulge: 0.42, haze: '150,150,190' };
// a small atlas of distant galaxies (4 × 2 tiles): spirals, ellipticals, an edge-on, a clumpy blue one
const COS_ATLAS = () => once('cos_atlas', () => g3Tex((x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); const D = COS_DOTS();
  for (let k = 0; k < 8; k++) { const cx = (k % 4) * 256 + 128, cy = Math.floor(k / 4) * 256 + 128, R = RNG('cosat' + k); x.save(); x.beginPath(); x.rect(cx - 128, cy - 128, 256, 256); x.clip();
    if (k < 4 || k === 6) { if (k === 6) { x.translate(cx, cy); x.scale(1, 0.22); x.translate(-cx, -cy); } cosPaintSpiral(x, cx, cy, 100, { arms: k === 2 ? 3 : 2, pitch: [0.24, 0.2, 0.3, 0.16, 0, 0, 0.2][k], rc: k === 1 ? 0.22 : 0.12, rot: R.r(0, TAU), sl: 0.3, nArm: 1600, armA: 0.25, nDust: 400, dustA: 0.15, nHII: 30, bar: k === 1, bulge: 0.3, haze: '110,130,220', n: 0.12 }, R); }
    else if (k < 6) { x.save(); x.translate(cx, cy); x.rotate(R.r(0, TAU)); x.scale(1, k === 4 ? 0.75 : 0.45); x.globalCompositeOperation = 'lighter'; cosGlowC(x, 0, 0, 110, '255,210,160', 0.35); cosGlowC(x, 0, 0, 50, '255,225,185', 0.7); cosGlowC(x, 0, 0, 14, '255,248,230', 1); x.restore(); }
    else { x.globalCompositeOperation = 'lighter'; for (let c = 0; c < 9; c++) { const ox = cx + cosG(R) * 30, oy = cy + cosG(R) * 30; cosGlowC(x, ox, oy, R.r(16, 34), '130,160,255', 0.45); for (let i = 0; i < 40; i++) { x.globalAlpha = 0.6; const s = R.r(1.5, 3); x.drawImage(R.f() < 0.75 ? D.blue : D.pink, ox + cosG(R) * 10 - s, oy + cosG(R) * 10 - s, 2 * s, 2 * s); } } x.globalAlpha = 1; }
    x.globalCompositeOperation = 'source-over'; x.restore(); } }, 1024, 512, false));

// =====================================================================
//  THE STAGE — sky (stars at infinity + the Milky Way band from inside), distant galaxies, the column
// =====================================================================
function cosStage() { return once('cos_stage', () => {
  const st = makeStage({ fov: 45, far: 4e6, hemi: 0.35, key: 0, sky: 0xffffff, ground: 0xffffff }); st.key.castShadow = false; st.cam.near = 0.02; st.cam.updateProjectionMatrix();
  const X = { st, u: 1, g: {} };
  X.sky = cosSkyBuild(st); X.bg = cosBgGalBuild(st);
  X.col = makeColumn(st.scene, { style: 'beam' });
  return X; }); }
function cosSkyBuild(st) { const R = RNG('cos_sky'), N = 30000, P = new Float32Array(N * 3), C = new Float32Array(N * 3), S = new Float32Array(N), nb = COS_BAND;
  const pal = [[1, 1, 1], [0.86, 0.9, 1], [0.72, 0.82, 1], [1, 0.94, 0.84], [1, 0.84, 0.66], [1, 0.72, 0.52]], v = new THREE.Vector3();
  for (let i = 0; i < N; i++) { v.set(cosG(R), cosG(R), cosG(R)).normalize(); const band = i > 11000; if (band) { v.addScaledVector(nb, -v.dot(nb) * (1 - Math.abs(cosG(R)) * 0.09 / Math.max(0.05, Math.abs(v.dot(nb))))).normalize(); }
    const m = band ? 0.32 + 1.2 * Math.pow(R.f(), 6) : 0.4 + 2.6 * Math.pow(R.f(), 8), c = R.pick(pal); P.set([v.x, v.y, v.z], i * 3); C.set([c[0] * m, c[1] * m, c[2] * m], i * 3); S[i] = band ? 1.6 + 1.2 * R.f() : 1.8 + 5.5 * Math.pow(R.f(), 6); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aC', new THREE.BufferAttribute(C, 3)); g.setAttribute('aS', new THREE.BufferAttribute(S, 1));
  const U = { uA: { value: 1 }, uR: { value: 1e6 }, uPx: { value: 1 } };
  const pts = new THREE.Points(g, new THREE.ShaderMaterial(Object.assign({ uniforms: U,
    vertexShader: 'uniform float uA, uR, uPx; attribute vec3 aC; attribute float aS; varying vec3 vC; void main(){ gl_Position = projectionMatrix * viewMatrix * vec4(cameraPosition + position * uR, 1.0); gl_PointSize = aS * uPx; vC = aC * uA; }',
    fragmentShader: 'varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q, q); gl_FragColor = vec4(vC * (exp(-d * 28.0) + 0.12 * exp(-d * 7.0)), 1.0); }' }, COS_ADD)));
  pts.frustumCulled = false; pts.renderOrder = -5; st.scene.add(pts);
  const HU = { uA: { value: 1 }, uNb: { value: nb.clone() }, uGc: { value: cosN(-0.85, -0.2, -0.3).addScaledVector(nb, 0).normalize() } };
  HU.uGc.value.addScaledVector(nb, -HU.uGc.value.dot(nb)).normalize();
  const haze = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), new THREE.ShaderMaterial(Object.assign({ uniforms: HU, side: THREE.BackSide,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * viewMatrix * vec4(cameraPosition + position * 9.0e5, 1.0); }',
    fragmentShader: COS_GL + `uniform float uA; uniform vec3 uNb, uGc; varying vec3 vD;
      void main(){ vec3 d = normalize(vD); float b = dot(d, uNb) + 0.03 * (cF(d * 5.0) - 0.5); float band = exp(-b * b / 0.010), wide = exp(-b * b / 0.05);
        float n = cF(d * 4.5), n2 = cF(d * 13.0 + 3.0), core = exp(-pow(acos(clamp(dot(d, uGc), -1.0, 1.0)), 2.0) / 0.5);
        float dust = smoothstep(0.42, 0.66, cF(d * 7.0 + 9.0)) * exp(-pow(b + 0.012, 2.0) / 0.0025);
        vec3 col = vec3(0.42, 0.5, 0.82) * band * (0.25 + 0.9 * n * n2) * 0.42 + vec3(1.0, 0.72, 0.45) * core * band * 0.5 * (0.4 + n2) + vec3(0.18, 0.22, 0.45) * wide * 0.06;
        col *= 1.0 - 0.8 * dust; col += vec3(0.7, 0.16, 0.32) * smoothstep(0.58, 0.76, cF(d * 6.0 + 2.0)) * band * 0.16;
        gl_FragColor = vec4(col * uA, 1.0); }` }, COS_ADD)));
  haze.frustumCulled = false; haze.renderOrder = -6; st.scene.add(haze);
  return { pts, haze, U, HU, set(a) { pts.visible = haze.visible = a > 0.001; U.uA.value = a; HU.uA.value = a; } }; }
// distant galaxies all around (no parallax: they ride with the camera)
function cosBgGalBuild(st) { const R = RNG('cos_bg'), n = 700, geo = new THREE.PlaneGeometry(1, 1), tile = new Float32Array(n), col = new Float32Array(n * 3);
  const mat = new THREE.ShaderMaterial(Object.assign({ uniforms: { uMap: { value: COS_ATLAS() }, uA: { value: 1 } }, side: THREE.DoubleSide,
    vertexShader: 'attribute float aTile; attribute vec3 aCol; varying vec2 vUv, vL; varying vec3 vC; void main(){ float c = mod(aTile, 4.0), r = floor(aTile / 4.0); vL = uv; vUv = vec2((uv.x + c) / 4.0, (uv.y + 1.0 - r) / 2.0); vC = aCol; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D uMap; uniform float uA; varying vec2 vUv, vL; varying vec3 vC; void main(){ vec2 d = abs(vL - 0.5); float e = 1.0 - smoothstep(0.42, 0.5, max(d.x, d.y)); gl_FragColor = vec4(texture2D(uMap, vUv).rgb * vC * e * uA, 1.0); }' }, COS_ADD));
  const m = new THREE.InstancedMesh(geo, mat, n), Rd = 8e5, M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3();
  for (let i = 0; i < n; i++) { v.set(cosG(R), cosG(R), cosG(R)).normalize(); tile[i] = R.f() < 0.55 ? R.i(0, 3) : R.f() < 0.6 ? R.i(4, 5) : R.i(6, 7); const k = R.r(0.7, 1.3) * (R.f() < 0.1 ? 2 : 1); col.set([k, k * R.r(0.92, 1.0), k * R.r(0.95, 1.1)], i * 3);
    const px = R.f() < 0.06 ? R.r(28, 60) : R.r(7, 22), s = px * 2 * Rd * Math.tan(22.5 * DEG) / H; q.setFromRotationMatrix(new THREE.Matrix4().lookAt(v, cosV(0, 0, 0), COS_UP)).multiply(new THREE.Quaternion().setFromEuler(e.set(R.r(0, 1.1), 0, R.r(0, TAU))));
    M.compose(v.clone().multiplyScalar(Rd), q, cosV(s, s, s)); m.setMatrixAt(i, M); }
  geo.setAttribute('aTile', new THREE.InstancedBufferAttribute(tile, 1)); geo.setAttribute('aCol', new THREE.InstancedBufferAttribute(col, 3));
  m.frustumCulled = false; m.renderOrder = -4; const g = new THREE.Group(); g.add(m); st.scene.add(g); return { g, mat, set(a, cam) { g.visible = a > 0.001; mat.uniforms.uA.value = a; g.position.copy(cam.position); } }; }

// ---- per-frame helpers: the camera (metres) → units; placing things; pixel sizes
function cosAim(obj, Tc, d, nx, ny, fv) { let P = obj.clone().add(obj.clone().sub(Tc).normalize().multiplyScalar(d)); const th = Math.tan(fv * DEG / 2);
  for (let i = 0; i < 8; i++) { const f = Tc.clone().sub(P).normalize(), r = new THREE.Vector3().crossVectors(f, COS_UP).normalize(), u = new THREE.Vector3().crossVectors(r, f);
    P = obj.clone().addScaledVector(f.addScaledVector(r, nx * th * W / H).addScaledVector(u, ny * th).normalize(), -d); } return P; }
// a close-up (obj at NDC nx,ny, distance d(t), looking at Tc1) until t1; then the camera backs away from Tc1 to Dend at
// t2 (accelerating, power pw), turning by `turn` (rad about +y) toward dirB, its target panning to TcB in step with distance
// o.dl: delay (s) before the camera turns toward dirB (the sun shot holds the Sun in frame while the caption names it)
function cosPull(t, o) { const aim = (tt) => cosAim(o.obj, o.Tc1, o.d(tt), o.nx(tt), o.ny(tt), o.fv0);
  if (t < o.t1) { const P = aim(t); return { Pc: P, Tc: o.Tc1, fv: o.fv0, D: P.distanceTo(o.Tc1) }; }
  const P1 = aim(o.t1), dir1 = P1.clone().sub(o.Tc1), D1 = dir1.length(), d1 = o.d(o.t1); dir1.normalize();
  const u = seg(t, o.t1, o.t2), Rend = (o.Dend - D1) / d1 + 1, D = D1 + d1 * (Math.exp(Math.log(Rend) * Math.pow(u, o.pw)) - 1), k = (D - D1) / (o.Dend - D1), k2 = 1 - D1 / D;
  const dir = dir1.clone().applyAxisAngle(COS_UP, (o.turn || 0) * k2); if (o.dirB) dir.lerp(o.dirB, k2 * ss(o.t1 + (o.dl || 0), o.t2, t)).normalize();
  return { Pc: o.Tc1.clone().addScaledVector(dir, D), Tc: o.Tc1.clone().lerp(o.TcB, k), fv: lerp(o.fv0, o.fv1 ?? o.fv0, k2), D }; }
function cosCam(X, Pc, Tc, fv, t, hh = 0.35) { X.u = Pc.distanceTo(Tc) / 100; const p = Pc.clone().divideScalar(X.u), q = Tc.clone().divideScalar(X.u);
  camPt(X.st, p.toArray(), q.toArray(), fv, t, hh, 11); X.st.cam.updateMatrixWorld(true); }
const cosAt = (X, o, m, r) => { o.position.copy(m).divideScalar(X.u); if (r !== undefined) o.scale.setScalar(r / X.u); };
const cosPxW = (X, pU, px) => px * pU.distanceTo(X.st.cam.position) * 2 * Math.tan(X.st.cam.fov * DEG / 2) / H;   // world size of `px` pixels at pU
function cosSpriteAt(X, s, m, rReal, minPx, op = 1) { const p = m.clone().divideScalar(X.u); s.position.copy(p); s.scale.setScalar(Math.max(rReal / X.u, cosPxW(X, p, minPx))); s.material.opacity = op; s.visible = op > 0.002; }
function cosBeam(X, baseM, t, glow = 1, fan = 1) { const F = foldAt(t), side = cosV(-1, 0, 0).applyQuaternion(X.st.cam.quaternion); X.col.pose(baseM.clone().divideScalar(X.u), COS_UP, thickM(F.n) / X.u, t, { glow, visible: true, side, fan }); }
function cosShow(X, keys) { Object.entries(X.g).forEach(([k, g]) => (g.visible = keys.includes(k))); }
function cosLabel(X, pM, title, sub, a, side) { if (a <= 0.001) return; const p = pM.clone().divideScalar(X.u), s = p.clone().project(X.st.cam); if (s.z > 1) return;
  colLabel(X.st, p, title, sub, a, side ?? (s.x > -0.1 ? 1 : -1)); }
// a ring of soft points (an orbit): radius 1 in the plane (e1, e2), centred at the origin of its group
function cosRing(n, col, size = 2.2) { const P = new Float32Array(n * 3); for (let i = 0; i < n; i++) P.set([Math.cos(i / n * TAU), 0, Math.sin(i / n * TAU)], i * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); const U = { uA: { value: 1 }, uC: { value: new THREE.Vector3(...col) }, uS: { value: size } };
  const m = new THREE.Points(g, new THREE.ShaderMaterial(Object.assign({ uniforms: U, vertexShader: 'uniform float uS; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = uS; }',
    fragmentShader: 'uniform float uA; uniform vec3 uC; void main(){ vec2 q = gl_PointCoord - 0.5; gl_FragColor = vec4(uC * uA * exp(-dot(q, q) * 14.0), 1.0); }' }, COS_ADD))); m.frustumCulled = false; m.U = U; return m; }
const cosBasis = (nrm) => { const n = nrm.clone().normalize(), a = Math.abs(n.y) < 0.9 ? COS_UP : cosV(1, 0, 0), e1 = new THREE.Vector3().crossVectors(a, n).normalize(), e2 = new THREE.Vector3().crossVectors(n, e1); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(e1, n, e2)); };

// =====================================================================
//  THE EARTH AND THE MOON (38–44)
// =====================================================================
function cosMoonBuild(X) { const g = new THREE.Group(); X.st.scene.add(g); X.g.moon = g; const L = { value: COS_LM.clone() };
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 160, 80), new THREE.ShaderMaterial({ uniforms: { uL: L }, extensions: { derivatives: true }, vertexShader: COS_VS,
    fragmentShader: COS_GL + `uniform vec3 uL; varying vec3 vN, vWp;
      void main(){ vec3 n = normalize(vN), V = normalize(cameraPosition - vWp); float c = cF(n * 1.5 + 4.0) + 0.32 * cF(n * 5.0 + 1.0), land = smoothstep(0.655, 0.67, c), lat = abs(n.y);
        float ice = smoothstep(0.84, 0.88, lat + 0.06 * cF(n * 8.0)); vec3 lc = mix(vec3(0.09, 0.2, 0.06), vec3(0.56, 0.42, 0.24), smoothstep(0.42, 0.62, cF(n * 3.0 + 7.0)) * (1.0 - smoothstep(0.45, 0.75, lat)));
        lc *= 0.7 + 0.6 * cF(n * 24.0); vec3 oc = mix(vec3(0.008, 0.04, 0.14), vec3(0.02, 0.14, 0.26), smoothstep(0.58, 0.66, c));
        vec3 alb = mix(mix(oc, lc, land), vec3(0.92, 0.94, 0.98), ice);
        vec3 w = n * 3.2 + 0.7 * vec3(cF(n * 2.0), cF(n * 2.0 + 5.0), cF(n * 2.0 + 9.0)); float cl = smoothstep(0.5, 0.78, cF(w)) * (0.75 + 0.25 * cF(n * 18.0));
        float mu0 = dot(n, uL), lit = smoothstep(-0.1, 0.2, mu0), mu = max(dot(n, V), 0.0);
        vec3 col = alb * max(mu0, 0.0) * 1.5; vec3 Hh = normalize(uL + V);
        col += (1.0 - land) * (1.0 - cl) * vec3(1.0, 0.88, 0.7) * pow(max(dot(n, Hh), 0.0), 50.0) * 0.8 * step(0.0, mu0);
        col = mix(col, vec3(1.0) * max(mu0, 0.0) * 1.3, cl * 0.92);
        float city = land * (1.0 - ice) * smoothstep(0.5, 0.72, cF(n * 9.0 + 2.0)) * step(0.55, cH(floor(n * 500.0)));
        col += vec3(1.0, 0.62, 0.28) * city * (1.0 - lit) * 0.9 * (1.0 - cl * 0.8);
        col += vec3(0.22, 0.48, 1.0) * pow(1.0 - mu, 2.5) * smoothstep(-0.25, 0.5, mu0) * 0.9;
        gl_FragColor = vec4(col, 1.0); }` }));
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1, 256, 128), new THREE.ShaderMaterial({ uniforms: { uL: L }, extensions: { derivatives: true }, vertexShader: COS_VS,
    fragmentShader: COS_GL + `uniform vec3 uL; varying vec3 vN, vWp;
      vec2 crat(vec3 p, float sc, float sd, float dens){ vec3 q = p * sc, i = floor(q), f = fract(q); float h = 0.0, al = 0.0;
        for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec3 c = vec3(float(x), float(y), float(z)), r = cH3(i + c + sd);
          float rad = 0.1 + 0.36 * r.x * r.x * r.x, d = length(c + 0.15 + r * 0.7 - f) / rad, on = step(dens, r.y);
          h += on * rad * ((d < 1.0 ? (d * d - 1.0) * 0.5 : 0.0) + 0.2 * exp(-pow((d - 1.0) * 5.0, 2.0)) + (r.x > 0.7 ? 0.12 * exp(-d * d * 30.0) : 0.0));
          al += on * step(0.93, r.z) * (exp(-d * 1.3) * 0.45 + 0.1 * exp(-d * 0.3) * smoothstep(0.62, 0.9, cN(vec3(atan(c.y + r.y - f.y, c.x + r.x - f.x) * 7.0, d * 0.5, sd)))); }
        return vec2(h / sc, al); }
      void main(){ vec3 n = normalize(vN), V = normalize(cameraPosition - vWp);
        float mv = cF(n * 1.1 + vec3(2.0, 1.0, 0.0)) + 0.1 * cF(n * 6.0), mare = smoothstep(0.53, 0.58, mv);
        vec2 c1 = crat(n, 3.0, 0.0, 0.82), c2 = crat(n, 7.0, 3.0, 0.62), c3 = crat(n, 16.0, 7.0, 0.5), c4 = crat(n, 38.0, 11.0, 0.42), c5 = crat(n, 90.0, 19.0, 0.35);
        float h = c1.x * 0.7 + c2.x * 0.7 + (c3.x * 0.65 + c4.x * 0.6 + c5.x * 0.55) * (1.0 - 0.75 * mare) + 0.003 * cF(n * 70.0);
        vec3 Nb = cBump(n, n, h, 1.0);
        float mu0 = dot(Nb, uL), mu = max(dot(n, V), 0.02), m0 = max(mu0, 0.0), lit = smoothstep(-0.03, 0.1, dot(n, uL));
        float alb = mix(0.66, 0.24, mare) * (0.8 + 0.4 * cF(n * 9.0 + 5.0)) * (0.9 + 0.2 * cN(n * 40.0)) + (c2.y + c3.y + c4.y * 0.7) * 0.45 * (1.0 - 0.4 * mare);
        vec3 tint = mix(vec3(1.0, 0.96, 0.91), vec3(0.9, 0.9, 0.93), mare);
        float bright = (2.0 * m0 / (m0 + mu) * 0.6 + 0.4 * m0) * lit;
        vec3 col = tint * alb * bright * 1.25 + tint * alb * vec3(0.014, 0.02, 0.034) * (1.0 - lit);
        gl_FragColor = vec4(col, 1.0); }` }));
  const eglow = cosSprite(COS_GLOW(), '#5f9bff', 0.5), mglow = cosSprite(COS_GLOW(), '#fff3e2', 0.25);
  const orbit = cosRing(720, [0.55, 0.62, 0.8], 2.0), oq = cosBasis(new THREE.Vector3().crossVectors(COS_MOON, cosV(-1, 0.15, 0.2)));
  g.add(eglow, mglow, earth, moon, orbit); return { earth, moon, eglow, mglow, orbit, oq }; }
function cosMoonCam(t) { return cosPull(t, { obj: COS_MOON, Tc1: cosV(0, 0.3e8, 0), d: (tt) => 9.4e6 * (1 + 0.03 * (tt - 38)), nx: (tt) => 0.16 - 0.02 * (tt - 38), ny: (tt) => -0.76 + 0.02 * (tt - 38), fv0: 50, fv1: 44,
  t1: 40.3, t2: 44, Dend: 2.5e10, pw: 1.35, turn: -0.35, dirB: cosN(0.2, 0.1, 1), TcB: cosV(-1e8, 3.0e9, 0) }); }
function cosMoon(X, t) { const M = once('cos_moon', () => cosMoonBuild(X)); cosShow(X, ['moon']); const C = cosMoonCam(t); cosCam(X, C.Pc, C.Tc, C.fv, t, 0.3);
  X.sky.set(1); X.bg.set(0, X.st.cam);
  cosAt(X, M.earth, cosV(0, 0, 0), COS_RE); cosAt(X, M.moon, COS_MOON, COS_RM); M.earth.rotation.y = 0.4 + 0.02 * (t - 38);
  cosSpriteAt(X, M.eglow, cosV(0, 0, 0), COS_RE * 3.2, 26, 0.55); cosSpriteAt(X, M.mglow, COS_MOON, COS_RM * 2.6, 14, 0.3);
  M.orbit.position.set(0, 0, 0); M.orbit.quaternion.copy(M.oq); M.orbit.scale.setScalar(3.844e8 / X.u); M.orbit.U.uA.value = 0.55 * ss(40.2, 41.6, t);
  cosBeam(X, cosV(0, COS_RE, 0), t); return M; }
SHOT_FN.moon = (lt, dur, t) => { const X = cosStage(), M = cosMoon(X, t); renderStage(X.st, 1.0); if (CAMONLY) return; bloom(0.5);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(X.st.cam.quaternion), a = ss(39.3, 39.7, t) * (1 - ss(43.4, 43.9, t));
  cosLabel(X, COS_MOON.clone().addScaledVector(up, COS_RM * 1.02), 'LA LUNA', 'a 384.400 km', a); };

// =====================================================================
//  THE SUN AND THE PLANETS (44–48), then THE NEAREST STARS (48–53)
// =====================================================================
const COS_PLAN = [['Mercurio', 57.9e9, '#c8b8a8', 2.2], ['Venus', 108.2e9, '#f4dcb0', 3], ['Tierra', COS_AU, '#7fb2ff', 3], ['Marte', 227.9e9, '#ff8a5a', 2.6], ['Júpiter', 778.5e9, '#f0d0a8', 4.5], ['Saturno', 1.434e12, '#f2dca8', 4], ['Urano', 2.871e12, '#a8e8f0', 3.2], ['Neptuno', 4.495e12, '#6a8cff', 3.4]];
const COS_ECL = (() => { const s = COS_SUN.clone(), n0 = cosN(0.05, 0.42, 0.9); return n0.addScaledVector(s, -n0.dot(s)).normalize(); })();   // ecliptic normal (the Earth's orbit passes the origin)
function cosSunBuild(X) { const g = new THREE.Group(); X.st.scene.add(g); X.g.sun = g; const T = { value: 0 };
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1, 192, 96), new THREE.ShaderMaterial({ uniforms: { uT: T }, extensions: { derivatives: true }, vertexShader: COS_VS,
    fragmentShader: COS_GL + `uniform float uT; varying vec3 vN, vWp;
      float vor(vec3 p){ vec3 i = floor(p), f = fract(p); float d1 = 8.0, d2 = 8.0;
        for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec3 c = vec3(float(x), float(y), float(z)), r = 0.5 + 0.42 * sin(uT * 0.7 + 6.2831 * cH3(i + c)); float d = length(c + r - f); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
        return d2 - d1; }
      void main(){ vec3 n = normalize(vN), V = normalize(cameraPosition - vWp); float mu = max(dot(n, V), 0.0);
        float fw = length(fwidth(n * 150.0)), gran = mix(smoothstep(0.02, 0.55, vor(n * 150.0)) * (0.75 + 0.5 * cN(n * 300.0)), 0.6, smoothstep(0.3, 1.0, fw));
        float sg = cF(n * 10.0 + uT * 0.02), fac = smoothstep(0.6, 0.74, cF(n * 16.0 + 3.0)), sp = cF(n * 3.6 + 11.0), pen = smoothstep(0.69, 0.73, sp), umb = smoothstep(0.74, 0.76, sp);
        float I = (0.8 + 0.22 * gran) * (0.82 + 0.36 * sg); I *= 1.0 - 0.45 * pen - 0.45 * umb; I += fac * 0.25 * pow(1.0 - mu, 1.5);
        float limb = 0.3 + 0.7 * pow(mu, 0.5); vec3 col = mix(vec3(0.95, 0.3, 0.04), vec3(1.0, 0.86, 0.56), pow(mu, 0.5)) * limb * I * 1.0;
        gl_FragColor = vec4(col, 1.0); }` }));
  const corona = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShaderMaterial(Object.assign({ uniforms: { uT: T, uA: { value: 1 } }, extensions: { derivatives: true },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: COS_GL + `uniform float uT, uA; varying vec2 vP;
      void main(){ float r = length(vP); if (r < 0.97) discard; float a = atan(vP.y, vP.x); vec2 cs = vec2(cos(a), sin(a)); float x = max(r - 1.0, 0.0);
        float st = cF(vec3(cs * 3.0, r * 0.3 - uT * 0.03)), st2 = cF(vec3(cs * 10.0, r * 0.7 + 2.0));
        float cor = (exp(-x * 5.0) * 0.8 + exp(-x * 1.4) * 0.32 * (0.3 + 1.3 * st * st) + exp(-x * 0.5) * 0.1) * (0.7 + 0.6 * st2);
        float act = smoothstep(0.5, 0.66, cF(vec3(cs * 2.0, 5.0)));
        float lp = cF(vec3(cs * 26.0 + vec2(0.0, x * 3.0), x * 9.0 - uT * 0.35)), loop = smoothstep(0.56, 0.74, lp) * exp(-x * 7.0) * act;
        float arc = exp(-pow((length(vP - 1.02 * vec2(cos(1.1), sin(1.1))) - 0.16) / 0.018, 2.0)) * step(0.0, dot(vP - vec2(cos(1.1), sin(1.1)), vec2(cos(1.1), sin(1.1)))) * smoothstep(0.35, 0.7, cF(vec3(vP * 30.0, uT * 0.4)));
        float spic = smoothstep(0.55, 0.9, cF(vec3(cs * 120.0, x * 50.0))) * exp(-x * 30.0);
        vec3 col = vec3(1.0, 0.7, 0.38) * cor * 0.42 + vec3(1.0, 0.3, 0.1) * (loop * 2.4 + arc * 2.0 + spic * 0.7);
        col *= smoothstep(0.97, 1.005, r); gl_FragColor = vec4(col * uA, 1.0); }` }, COS_ADD)));
  corona.renderOrder = 3;
  const halo = cosSprite(COS_GLOW(), '#ffb066', 0.6), halo2 = cosSprite(COS_GLOW(), '#ff8a3a', 0.25), star = cosSprite(cosStarTex('255,214,160'), '#ffffff', 1);
  const orbits = COS_PLAN.map(([, r], i) => { const o = cosRing(i < 4 ? 7000 : 5000, i === 2 ? [0.45, 0.62, 1.0] : [0.55, 0.6, 0.78], 2.0); g.add(o); return o; });
  const oq = cosBasis(COS_ECL), e1 = COS_SUNP.clone().negate().normalize(), e2 = new THREE.Vector3().crossVectors(COS_ECL, e1).normalize();
  const plan = COS_PLAN.map(([, r, c], i) => { const s = cosSprite(COS_GLOW(), c, 1); g.add(s); const an = i === 2 ? 0 : i === 7 ? Math.atan2(e2.y, e1.y) + 0.35 : [2.2, -0.9, 0, 2.6, -2.2, 1.5, -1.2, 0][i]; return COS_SUNP.clone().addScaledVector(e1, r * Math.cos(an)).addScaledVector(e2, r * Math.sin(an)); });
  const pdots = g.children.filter((c) => c.isSprite);
  g.add(halo2, halo, sun, corona, star); return { sun, corona, halo, halo2, star, orbits, oq, plan, pdots, T }; }
const COS_STAR_DIR0 = cosN(0.22, 0.1, 1);
function cosStarCam(t) { const Lb = cosLen(t, 0.45), dir = COS_STAR_DIR0.clone().applyAxisAngle(COS_UP, 0.32 * seg(t, 48, 53)).applyAxisAngle(cosV(1, 0, 0), -0.12 * seg(t, 48, 53)), D = 2.5 * Lb;
  const Tc = cosV(0, 0.27 * Lb, 0); return { Pc: Tc.clone().addScaledVector(dir, D), Tc, fv: 45, dir, D }; }
function cosSunCam(t) { const E = cosStarCam(48); return cosPull(t, { obj: COS_SUNP, Tc1: cosV(0, 0.62e11, 0), d: (tt) => 3.1e9 * (1 + 0.05 * (tt - 44)), nx: (tt) => 0.72 - 0.03 * (tt - 44), ny: (tt) => -0.2, fv0: 46, fv1: 45,
  t1: 45.2, t2: 48, Dend: E.D, pw: 1.55, dirB: E.dir, TcB: E.Tc, dl: 1.0 }); }
function cosSunPose(X, S, t, aOrb, aSun) { S.T.value = t; cosAt(X, S.sun, COS_SUNP, COS_RS); S.sun.visible = COS_RS / X.u > cosPxW(X, S.sun.position, 2);
  cosAt(X, S.corona, COS_SUNP, COS_RS); S.corona.quaternion.copy(X.st.cam.quaternion); S.corona.visible = S.sun.visible;
  const pS = COS_SUNP.clone().divideScalar(X.u), big = COS_RS / X.u / cosPxW(X, pS, 1);   // the Sun's radius in pixels
  cosSpriteAt(X, S.halo, COS_SUNP, COS_RS * 7, 70, 0.55 * aSun); cosSpriteAt(X, S.halo2, COS_SUNP, COS_RS * 20, 160, 0.22 * aSun);
  cosSpriteAt(X, S.star, COS_SUNP, 0, 90 * (1 - ss(40, 120, big)), aSun * (1 - ss(30, 90, big)));
  S.orbits.forEach((o, i) => { o.position.copy(pS); o.quaternion.copy(S.oq); o.scale.setScalar(COS_PLAN[i][1] / X.u); const rp = COS_PLAN[i][1] / X.u / cosPxW(X, pS, 1); o.U.uA.value = aOrb * (i === 2 ? 0.8 : 0.5) * ss(14, 60, rp) * (1 - ss(15000, 45000, rp)); o.visible = o.U.uA.value > 0.002; });
  S.pdots.forEach((s, i) => { const rp = COS_PLAN[i][1] / X.u / cosPxW(X, pS, 1); cosSpriteAt(X, s, S.plan[i], 0, COS_PLAN[i][3] * 3.2, aOrb * ss(25, 80, rp) * (i === 2 ? 0 : 1)); }); }
function cosSun(X, t) { const S = once('cos_sun', () => cosSunBuild(X)); cosShow(X, ['sun']); const C = cosSunCam(t); cosCam(X, C.Pc, C.Tc, C.fv, t, 0.3); X.sky.set(1); X.bg.set(0, X.st.cam);
  cosSunPose(X, S, t, ss(45.2, 46.2, t), 1); cosBeam(X, cosV(0, 0, 0), t); return S; }
SHOT_FN.sun = (lt, dur, t) => { const X = cosStage(), S = cosSun(X, t); renderStage(X.st, 1.0); if (CAMONLY) return; bloom(0.55);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(X.st.cam.quaternion), pS = COS_SUNP.clone().divideScalar(X.u), rp = COS_RS / X.u / cosPxW(X, pS, 1);
  cosLabel(X, COS_SUNP.clone().addScaledVector(up, COS_RS * (rp > 30 ? 1.05 : 0)), 'EL SOL', 'a 150 millones de km', ss(46.15, 46.5, t) * (1 - ss(47.3, 47.6, t)));
  cosLabel(X, S.plan[7], 'NEPTUNO', 'a 4.500 millones de km', ss(47.55, 47.85, t), -1); };

// the nearest stars: Proxima (a red dwarf), Alpha Centauri A and B; a 3D field of stars from 3 to 40.000 light-years
// (log-spaced, flattened into the local disk far out) so the pull-back streams them inward; nebulae and clusters
const COS_PROX = cosN(0.5, 0.8, 0.33).multiplyScalar(4.24 * COS_LY), COS_ACEN = cosN(0.52, 0.79, 0.32).multiplyScalar(4.37 * COS_LY);
function cosNebTex(kind, seed) { return g3Tex((x, w) => { const R = RNG('cosneb' + seed), c = w / 2, D = COS_DOTS(); x.fillStyle = '#000'; x.fillRect(0, 0, w, w); x.globalCompositeOperation = 'lighter';
  const cols = kind === 0 ? ['255,80,120', '255,140,90', '200,80,200'] : kind === 1 ? ['110,150,255', '150,190,255', '120,120,255'] : ['80,220,210', '255,90,130', '120,160,255'];
  if (kind === 2) { for (let i = 0; i < 900; i++) { const a = R.r(0, TAU), r = w * (0.22 + 0.04 * cosG(R)); cosGlowC(x, c + r * Math.cos(a), c + r * Math.sin(a) * 0.8, w * 0.04, i % 3 ? cols[0] : cols[1], 0.05); } cosGlowC(x, c, c, w * 0.18, cols[2], 0.25); }
  else for (let i = 0; i < 260; i++) { const a = R.r(0, TAU), r = w * 0.3 * Math.pow(R.f(), 0.8), px = c + r * Math.cos(a) + cosG(R) * 10, py = c + r * Math.sin(a) * 0.8; cosGlowC(x, px, py, w * R.r(0.04, 0.14), R.pick(cols), R.r(0.03, 0.09)); }
  x.globalCompositeOperation = 'source-over'; if (kind === 0) for (let i = 0; i < 260; i++) { const a = R.r(0, TAU), r = w * 0.22 * R.f(); x.globalAlpha = 0.18; const s = w * R.r(0.01, 0.04); x.drawImage(D.dark, c + r * Math.cos(a) + cosG(R) * 20 - s, c + r * Math.sin(a) - s, 2 * s, 2 * s); }
  x.globalAlpha = 1; x.globalCompositeOperation = 'lighter'; for (let i = 0; i < (kind === 1 ? 30 : 60); i++) { const s = kind === 1 && i < 8 ? R.r(8, 16) : R.r(1.5, 4); x.drawImage(D.white, c + cosG(R) * w * 0.12 - s, c + cosG(R) * w * 0.12 - s, 2 * s, 2 * s); }
  x.globalCompositeOperation = 'destination-in'; const g = x.createRadialGradient(c, c, w * 0.2, c, c, w * 0.5); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); x.globalCompositeOperation = 'source-over'; }, 256, 256, false); }
function cosStarsBuild(X) { const g = new THREE.Group(); X.st.scene.add(g); X.g.stars = g; const R = RNG('cos_loc'), N = 60000, P = new Float32Array(N * 3), C = new Float32Array(N * 3), S = new Float32Array(N), v = new THREE.Vector3();
  const pal = [[1, 1, 1], [0.84, 0.9, 1], [0.7, 0.8, 1], [1, 0.93, 0.8], [1, 0.8, 0.6], [1, 0.62, 0.45]];
  for (let i = 0; i < N; i++) { const r = Math.exp(lerp(Math.log(3), Math.log(4e4), R.f())) * COS_LY; v.set(cosG(R), cosG(R), cosG(R)).normalize(); const h = v.dot(COS_BAND), th = Math.min(1, 900 * COS_LY / r);
    v.addScaledVector(COS_BAND, h * (th - 1)); v.multiplyScalar(r); P.set([v.x, v.y, v.z], i * 3); const c = R.pick(pal), m = 0.35 + 1.8 * Math.pow(R.f(), 6); C.set([c[0] * m, c[1] * m, c[2] * m], i * 3); S[i] = (0.6 + 1.6 * Math.pow(R.f(), 3)) * r; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('aC', new THREE.BufferAttribute(C, 3)); geo.setAttribute('aS', new THREE.BufferAttribute(S, 1));
  const U = { uA: { value: 1 }, uK: { value: 0.012 } };
  const pts = new THREE.Points(geo, new THREE.ShaderMaterial(Object.assign({ uniforms: U,
    vertexShader: 'uniform float uA, uK; attribute vec3 aC; attribute float aS; varying vec3 vC; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; float s = aS * uK / max(-mv.z, 1e-3); float sc = clamp(s, 1.0, 9.0); gl_PointSize = sc; vC = aC * uA * min(1.0, s * s) * clamp(9.0 / s, 0.25, 1.0); }',
    fragmentShader: 'varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q, q); gl_FragColor = vec4(vC * (exp(-d * 22.0) + 0.1 * exp(-d * 6.0)), 1.0); }' }, COS_ADD)));
  pts.frustumCulled = false; g.add(pts);
  const prox = cosSprite(cosStarTex('255,110,70'), '#ffffff', 1), proxG = cosSprite(COS_GLOW(), '#ff4a2a', 0.5), acA = cosSprite(cosStarTex('255,236,200'), '#ffffff', 1), acB = cosSprite(cosStarTex('255,210,160'), '#ffffff', 1);
  g.add(proxG, prox, acA, acB);
  const neb = [], NR = RNG('cos_nebs'); [[444, 1, cosN(-0.6, 0.55, 0.45), 90], [1344, 0, cosN(0.7, -0.15, 0.62), 380], [2100, 2, cosN(-0.3, 0.9, -0.2), 120]].concat(Array.from({ length: 22 }, (_, i) => [Math.exp(lerp(Math.log(500), Math.log(25000), NR.f())), NR.f() < 0.6 ? 0 : NR.f() < 0.6 ? 1 : 2, cosN(cosG(NR), cosG(NR), cosG(NR)), NR.r(200, 1500)]))
    .forEach(([d, kind, dir, size], i) => { const s = cosSprite(cosNebTex(kind, i), '#ffffff', 1); s.material.rotation = i * 1.3; dir.addScaledVector(COS_BAND, -dir.dot(COS_BAND) * Math.min(1, d / 3000) * 0.9).normalize(); g.add(s); neb.push({ s, p: dir.multiplyScalar(d * COS_LY), r: size * COS_LY }); });
  return { pts, U, prox, proxG, acA, acB, neb }; }
function cosStarsPose(X, L, t, a) { L.U.uA.value = a; L.pts.scale.setScalar(1 / X.u); L.U.uK.value = 0.0016 * (H / 2) / Math.tan(X.st.cam.fov * DEG / 2) / X.u;
  const pP = COS_PROX.clone().divideScalar(X.u), fl = 1 + 0.35 * Math.exp(-Math.pow((t - 50.0) / 0.25, 2));
  cosSpriteAt(X, L.prox, COS_PROX, 0, 150 * fl, a * ss(48.8, 49.4, t)); cosSpriteAt(X, L.proxG, COS_PROX, 0, 300 * fl, 0.45 * a * ss(48.8, 49.4, t));
  cosSpriteAt(X, L.acA, COS_ACEN, 0, 120, a * ss(48.8, 49.4, t)); cosSpriteAt(X, L.acB, COS_ACEN.clone().add(cosV(0.06, -0.03, 0.02).multiplyScalar(COS_LY)), 0, 80, a * ss(48.8, 49.4, t));
  L.neb.forEach((o) => { const p = o.p.clone().divideScalar(X.u), px = o.r / X.u / cosPxW(X, p, 1); cosSpriteAt(X, o.s, o.p, o.r, 0, a * 0.9 * ss(3, 30, px) * (1 - ss(500, 1400, px))); }); return pP; }
SHOT_FN.star = (lt, dur, t) => { const X = cosStage(), S = once('cos_sun', () => cosSunBuild(X)), L = once('cos_stars', () => cosStarsBuild(X)); cosShow(X, ['sun', 'stars']);
  const C = cosStarCam(t); cosCam(X, C.Pc, C.Tc, C.fv, t, 0.3); X.sky.set(1); X.bg.set(0, X.st.cam);
  cosSunPose(X, S, t, 1 - ss(48.6, 49.3, t), 1); cosStarsPose(X, L, t, ss(48.5, 49.5, t)); cosBeam(X, cosV(0, 0, 0), t);
  renderStage(X.st, 1.0); if (CAMONLY) return; bloom(0.55);
  cosLabel(X, S.plan[7], 'NEPTUNO', 'a 4.500 millones de km', 1 - ss(48.5, 48.85, t), -1);
  cosLabel(X, COS_PROX, 'PRÓXIMA CENTAURI', 'a 4,24 años luz', ss(49.85, 50.2, t) * (1 - ss(52.2, 52.6, t))); };

// =====================================================================
//  THE MILKY WAY FROM OUTSIDE (53–57)
// =====================================================================
const COS_GC = cosN(-0.42, 0.9, 0.08).multiplyScalar(26000 * COS_LY);          // the galactic centre (the Sun is 26.000 ly out)
const COS_GN = (() => { const g = COS_GC.clone().normalize(), n0 = cosN(0.86, 0.0, 0.5); return n0.addScaledVector(g, -n0.dot(g)).normalize(); })();
function cosGalMesh(tex, gain) { return new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial(Object.assign({ uniforms: { uMap: { value: tex }, uA: { value: 1 }, uG: { value: gain } }, side: THREE.DoubleSide,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform sampler2D uMap; uniform float uA, uG; varying vec2 vUv; void main(){ vec3 c = texture2D(uMap, vUv).rgb; gl_FragColor = vec4(c * uG * uA, 1.0); }' }, COS_ADD))); }
// the disk basis: x axis from the centre toward `toward` (so the Sun sits on +x), normal n
function cosDiskQ(n, toward) { const e1 = toward.clone().addScaledVector(n, -toward.dot(n)).normalize(), e2 = new THREE.Vector3().crossVectors(n, e1); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(e1, e2, n)); }
function cosGalBuild(X) { const g = new THREE.Group(); X.st.scene.add(g); X.g.gal = g;
  const mw = cosGalMesh(cosGalTex('mw', COS_MW), 1.25); mw.quaternion.copy(cosDiskQ(COS_GN, COS_GC.clone().negate())); g.add(mw);
  // a thin halo of bright foreground stars for sparkle and depth (3D, inside the disk)
  const R = RNG('cos_mwst'), N = 9000, P = new Float32Array(N * 3), C = new Float32Array(N * 3), q = mw.quaternion;
  for (let i = 0; i < N; i++) { const r = 0.95 * Math.sqrt(R.f()), a = R.r(0, TAU), v = cosV(r * Math.cos(a), r * Math.sin(a), cosG(R) * 0.012).applyQuaternion(q); P.set([v.x, v.y, v.z], i * 3); const k = 0.35 + 0.8 * Math.pow(R.f(), 4), b = R.f() < 0.6; C.set(b ? [0.75 * k, 0.85 * k, k] : [k, 0.9 * k, 0.75 * k], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('aC', new THREE.BufferAttribute(C, 3));
  const U = { uA: { value: 1 }, uPx: { value: 2 } }; const pts = new THREE.Points(geo, new THREE.ShaderMaterial(Object.assign({ uniforms: U, vertexShader: 'uniform float uA, uPx; attribute vec3 aC; varying vec3 vC; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = uPx; vC = aC * uA; }',
    fragmentShader: 'varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; gl_FragColor = vec4(vC * exp(-dot(q, q) * 16.0), 1.0); }' }, COS_ADD))); pts.frustumCulled = false; g.add(pts);
  const core = cosSprite(COS_GLOW(), '#ffd6a0', 0.6), sunM = cosSprite(cosStarTex('255,230,190', 0.6), '#ffffff', 1); g.add(core, sunM);
  return { mw, pts, U, core, sunM }; }
const COS_MWR = 50000 * COS_LY / 0.9;   // plane half-size: the painted disk radius (0.9 of the half-size) = 50.000 ly
function cosGalPose(X, G, a, base = cosV(0, 0, 0)) { const c = base.clone().add(COS_GC); cosAt(X, G.mw, c, COS_MWR); G.mw.material.uniforms.uA.value = a; G.pts.position.copy(G.mw.position); G.pts.scale.copy(G.mw.scale);
  const rp = COS_MWR / X.u / cosPxW(X, G.mw.position, 1); G.U.uA.value = a * ss(150, 500, rp); G.U.uPx.value = clamp(rp / 350, 1, 2.6); G.pts.visible = G.U.uA.value > 0.003;
  cosSpriteAt(X, G.core, c, 9000 * COS_LY, 10, 0.55 * a); cosSpriteAt(X, G.sunM, base, 0, 46 * ss(150, 400, rp), a); return rp; }
function cosGalCam(t) { const dir = cosN(-0.08, 0.06, 1).applyAxisAngle(COS_UP, 0.08 * (t - 53)), Lb = cosLen(t, 0.5), w = ss(54.3, 55.6, t);
  const D0 = 1.65e5 * COS_LY * Math.exp(-0.035 * (t - 53)), D = Math.exp(lerp(Math.log(D0), Math.log(2.5 * Lb), w));
  const Tc = COS_GC.clone().multiplyScalar(0.9).lerp(cosV(-6e3 * COS_LY, 0.5 * 1.02e5 * COS_LY, 0), ss(53.2, 54.2, t)).lerp(cosV(0, 0.27 * Lb, 0), w);
  return { Pc: Tc.clone().addScaledVector(dir, D), Tc, fv: 45 }; }
SHOT_FN.galaxy = (lt, dur, t) => { const X = cosStage(), G = once('cos_gal', () => cosGalBuild(X)); cosShow(X, ['gal']); const C = cosGalCam(t); cosCam(X, C.Pc, C.Tc, C.fv, t, 0.3);
  X.sky.set(0); X.bg.set(1, X.st.cam); cosGalPose(X, G, 1); cosBeam(X, cosV(0, 0, 0), t); renderStage(X.st, 1.0); if (CAMONLY) return; bloom(0.5);
  cosLabel(X, COS_GC.clone().add(cosV(0, -48000 * COS_LY, 0)), 'LA VÍA LÁCTEA', '~100.000 años luz', ss(54.0, 54.4, t) * (1 - ss(56.6, 57.0, t)), -1); };

// =====================================================================
//  ANDROMEDA AND THE LOCAL GROUP (57–58.5), THE COSMIC WEB RUSHING PAST (58.5–61.5)
// =====================================================================
const COS_AND = cosN(0.36, 0.8, 0.48).multiplyScalar(2.5e6 * COS_LY), COS_ANDR = 110000 * COS_LY / 0.9;
const COS_ANDN = (() => { const v = COS_AND.clone().sub(cosV(-3e5 * COS_LY, 2.1e6 * COS_LY, 0)).normalize(), q = new THREE.Vector3().crossVectors(v, cosN(0.55, 1, 0)).normalize(); return q.multiplyScalar(Math.sin(77 * DEG)).addScaledVector(v, Math.cos(77 * DEG)).normalize(); })();
function cosWebGeo() { return once('cos_webgeo', () => { const R = RNG('cos_web'), nd = []; for (let i = 0; i < 380; i++) nd.push(cosV(R.n(1), R.n(1), R.n(1)));
  const ed = new Set(); nd.forEach((a, i) => nd.map((b, j) => [j, a.distanceToSquared(b)]).filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]).slice(0, 3).forEach(([j]) => ed.add(i < j ? i + '_' + j : j + '_' + i)));
  const P = [], S = [], C = [], fil = [0.55, 0.65, 0.95], gal = [1, 0.95, 0.88], hot = [1, 0.86, 0.7], v = new THREE.Vector3();
  const add = (x, y, z, s, b, c) => { P.push(x, y, z); S.push(s); C.push(c[0] * b, c[1] * b, c[2] * b); };
  ed.forEach((k) => { const [i, j] = k.split('_').map(Number), a = nd[i], b = nd[j], len = a.distanceTo(b), mid = a.clone().lerp(b, 0.5).add(cosV(R.n(len * 0.18), R.n(len * 0.18), R.n(len * 0.18))), n = Math.round(len * 1500);
    for (let q = 0; q < n; q++) { const u = R.f(); v.copy(a).multiplyScalar((1 - u) * (1 - u)).addScaledVector(mid, 2 * u * (1 - u)).addScaledVector(b, u * u); const sg = 0.011 * (0.5 + 0.9 * R.f()) * (1.25 - 0.5 * Math.sin(u * Math.PI));
      v.add(cosV(cosG(R) * sg, cosG(R) * sg, cosG(R) * sg)); if (R.f() < 0.06) add(v.x, v.y, v.z, 0.0025, 1.3, gal); else add(v.x, v.y, v.z, 0.012, 0.09, fil); } });
  nd.forEach((a, i) => { const big = i % 7 === 0, n = big ? 420 : 150, sg = big ? 0.03 : 0.018; for (let q = 0; q < n; q++) add(a.x + cosG(R) * sg, a.y + cosG(R) * sg, a.z + cosG(R) * sg, 0.003, 1.1, R.f() < 0.5 ? gal : hot);
    add(a.x, a.y, a.z, big ? 0.05 : 0.025, big ? 0.9 : 0.45, hot); add(a.x, a.y, a.z, big ? 0.16 : 0.08, 0.12, [1, 0.8, 0.65]); });
  for (let q = 0; q < 9000; q++) add(R.n(1), R.n(1), R.n(1), 0.004, 0.25, fil);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('aS', new THREE.Float32BufferAttribute(S, 1)); g.setAttribute('aCol', new THREE.Float32BufferAttribute(C, 3)); return g; }); }
function cosWebLayer(geo) { const U = { uK: { value: 1 }, uA: { value: 1 }, uSc: { value: 1 }, uClip: { value: 9 } };
  const m = new THREE.Points(geo, new THREE.ShaderMaterial(Object.assign({ uniforms: U,
    vertexShader: 'uniform float uK, uA, uSc, uClip; attribute float aS; attribute vec3 aCol; varying vec3 vC; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; float s = aS * uSc * uK / max(-mv.z, 1e-3), sc = clamp(s, 1.2, 70.0); gl_PointSize = sc; vC = aCol * uA * (s < 1.2 ? s * s / 1.44 : 1.0) * clamp(26.0 / s, 0.12, 1.0) * step(length(position), uClip); if (-mv.z < 0.5) vC *= 0.0; }',
    fragmentShader: 'varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; gl_FragColor = vec4(vC * exp(-dot(q, q) * 16.0), 1.0); }' }, COS_ADD)));
  m.frustumCulled = false; m.U = U; return m; }
function cosAndBuild(X) { const g = new THREE.Group(); X.st.scene.add(g); X.g.and = g;
  const m31 = cosGalMesh(cosGalTex('m31', COS_M31), 1.3); m31.quaternion.copy(cosDiskQ(COS_ANDN, cosV(0.3, 1, 0.1))); g.add(m31);
  const sat = [['#ffe2c0', 0.42, 2.2e4, cosV(0.9e5, -0.2e5, 0.4e5)], ['#ffe6c8', 0.3, 4.5e4, cosV(-1.1e5, 1.0e5, 0.3e5)], ['#b8c8ff', 0.4, 6e4, cosV(-6e5, -4e5, 2e5)]].map(([c, o, r, off]) => { const s = cosSprite(COS_GLOW(), c, o); g.add(s); return { s, r: r * COS_LY, o, p: COS_AND.clone().add(off.multiplyScalar(COS_LY)) }; });
  const mwSmall = cosGalMesh(once('cos_mwtex', () => cosGalTex('mw', COS_MW)), 1.2); mwSmall.quaternion.copy(cosDiskQ(COS_GN, COS_GC.clone().negate())); g.add(mwSmall);
  const geo = cosWebGeo(), layers = [0, 1, 2, 3].map((j) => { const m = cosWebLayer(geo); m.rotation.set(j * 1.3, j * 2.1 + 0.4, j * 0.7); g.add(m); return m; });
  return { m31, sat, mwSmall, layers }; }
const COS_WEB0 = 3e7 * COS_LY;   // the smallest web layer: half-size 120 million ly
function cosWebPose(X, A, D, a, f) { A.layers.forEach((m, j) => { const Ls = COS_WEB0 * Math.pow(12, j), rho = Ls / D; m.position.set(0, 0, 0); m.scale.setScalar(Ls / X.u);
  m.U.uK.value = f; m.U.uSc.value = Ls / X.u; m.U.uA.value = a * ss(0.04, 0.25, rho) * (1 - ss(6, 30, rho)); m.visible = m.U.uA.value > 0.002; }); }
// TcB is off-centre so the beam ends right of the HUD's long GROSOR line ('… millones de años luz')
function cosAndCam(t) { return cosPull(t, { obj: COS_AND, Tc1: cosV(-3e5 * COS_LY, 2.1e6 * COS_LY, 0), d: (tt) => 6.4e5 * COS_LY * (1 + 0.04 * (tt - 57)), nx: (tt) => 0.34, ny: (tt) => -0.12 + 0.02 * (tt - 57), fv0: 45,
  t1: 58.2, t2: 61.5, Dend: 2.5 * cosLen(61.45, 0.5, 0), pw: 1.25, turn: 0.25, dirB: cosN(0.1, 0.12, 1), TcB: cosV(-0.22 * cosLen(61.45, 0.5, 0), 0.27 * cosLen(61.45, 0.5, 0), 0) }); }
SHOT_FN.andromeda = (lt, dur, t) => { const X = cosStage(), A = once('cos_and', () => cosAndBuild(X)); cosShow(X, ['and']); const C = cosAndCam(t); cosCam(X, C.Pc, C.Tc, C.fv, t, 0.3);
  X.sky.set(0); X.bg.set(1 - ss(59.0, 60.5, t), X.st.cam); const f = (H / 2) / Math.tan(C.fv * DEG / 2);
  cosAt(X, A.m31, COS_AND, COS_ANDR); A.m31.material.uniforms.uA.value = 1;
  A.sat.forEach((o) => cosSpriteAt(X, o.s, o.p, o.r, 6, o.o));
  cosAt(X, A.mwSmall, COS_GC, COS_MWR); cosWebPose(X, A, C.D, ss(58.3, 59.0, t), f); cosBeam(X, cosV(0, 0, 0), t, 1, 0.3);   // fan 0.3: the swept sector of fold 88 washed half the frame
  renderStage(X.st, 1.0); if (CAMONLY) return; bloom(0.55);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(X.st.cam.quaternion);
  cosLabel(X, COS_AND.clone().addScaledVector(up, 0.5 * COS_ANDR), 'ANDRÓMEDA', 'a 2,5 millones de años luz', ss(57.75, 58.1, t) * (1 - ss(59.4, 59.8, t))); };

// =====================================================================
//  THE OBSERVABLE UNIVERSE (62–66): the CMB sphere (93.000 million ly across) with the web inside, the beam piercing it
// =====================================================================
const COS_RU = 46.5e9 * COS_LY;
function cosUniBuild(X) { const g = new THREE.Group(); X.st.scene.add(g); X.g.uni = g; const T = { value: 0 }, RIP = { value: 0 }, A = { value: 1 };
  const cmb = (back) => new THREE.Mesh(new THREE.SphereGeometry(1, 192, 96), new THREE.ShaderMaterial({ uniforms: { uT: T, uRip: RIP, uA: A }, transparent: true, depthWrite: false, side: back ? THREE.BackSide : THREE.FrontSide, extensions: { derivatives: true }, vertexShader: COS_VS,
    fragmentShader: COS_GL + `uniform float uT, uRip, uA; varying vec3 vN, vWp;
      vec3 cmap(float v){ v = clamp(v, 0.0, 1.0); vec3 c0 = vec3(0.02, 0.08, 0.38), c1 = vec3(0.25, 0.55, 1.0), c2 = vec3(1.0, 0.95, 0.85), c3 = vec3(1.0, 0.62, 0.22), c4 = vec3(0.78, 0.18, 0.06);
        return v < 0.25 ? mix(c0, c1, v / 0.25) : v < 0.5 ? mix(c1, c2, (v - 0.25) / 0.25) : v < 0.75 ? mix(c2, c3, (v - 0.5) / 0.25) : mix(c3, c4, (v - 0.75) / 0.25); }
      void main(){ vec3 n = normalize(vN), V = normalize(cameraPosition - vWp); float mu = abs(dot(n, V));
        float v = cF(n * 2.4 + 1.0) * 0.5 + cF(n * 7.0 + 4.0) * 0.32 + cF(n * 20.0 + 9.0) * 0.2 + cN(n * 60.0) * 0.06; v = (v - 0.54) * 2.6 + 0.5;
        vec3 col = cmap(v); float fr = pow(1.0 - mu, 2.0);
        float ang = acos(clamp(n.y, -1.0, 1.0)), rip = exp(-pow((ang - uRip) / 0.05, 2.0)) * smoothstep(1.4, 0.2, uRip) + exp(-pow(ang / 0.08, 2.0)) * 0.6;
        ${back ? 'gl_FragColor = vec4(col * 0.35, 0.9 * uA);' : 'col = col * (0.85 + 0.35 * fr) + vec3(1.0, 0.8, 0.55) * pow(1.0 - mu, 5.0) * 1.2 + vec3(1.0, 0.95, 0.85) * rip * 1.4; gl_FragColor = vec4(col, mix(0.42, 1.0, fr) * uA);'} }` }));
  const back = cmb(true), front = cmb(false); back.renderOrder = 1; front.renderOrder = 4;
  const web = cosWebLayer(cosWebGeo()); web.renderOrder = 2; web.U.uClip.value = 0.98;
  const halo = cosSprite(COS_GLOW(), '#ffb070', 0.5), halo2 = cosSprite(COS_GLOW(), '#ff8040', 0.2), flare = cosSprite(cosStarTex('255,240,220'), '#ffffff', 1);
  [halo2, halo].forEach((s) => (s.renderOrder = 0)); flare.renderOrder = 6; g.add(halo2, halo, back, web, front, flare);
  return { back, front, web, halo, halo2, flare, T, RIP, A }; }
// the sphere sits above the HUD; the beam rises from its bottom pole and the flare marks the paper's tip past the edge
function cosUniCam(t) { const u = seg(t, 62, 66), D = (5.3e11 - 0.4e11 * EZ.o3(u)) * COS_LY, dir = cosN(0.18, 0.1, 1).applyAxisAngle(COS_UP, -0.1 * u), Tc = cosV(-3.0e10 * COS_LY, -9.0e10 * COS_LY, 0); return { Pc: Tc.clone().addScaledVector(dir, D), Tc, fv: 45 }; }
SHOT_FN.universe = (lt, dur, t) => { const X = cosStage(), U = once('cos_uni', () => cosUniBuild(X)); cosShow(X, ['uni']); const C = cosUniCam(t); cosCam(X, C.Pc, C.Tc, C.fv, t, 0.2);
  X.sky.set(0); X.bg.set(0.35, X.st.cam); const f = (H / 2) / Math.tan(C.fv * DEG / 2); U.T.value = t; U.RIP.value = 0.05 + 1.6 * EZ.o3(seg(t, 62, 64.5)); U.A.value = 1;
  [U.back, U.front].forEach((m) => cosAt(X, m, cosV(0, 0, 0), COS_RU)); U.web.position.set(0, 0, 0); U.web.scale.setScalar(COS_RU / X.u); U.web.rotation.set(0.3, 0.2 + 0.03 * (t - 62), 0); U.web.U.uK.value = f; U.web.U.uSc.value = COS_RU / X.u; U.web.U.uA.value = 1.6;
  cosSpriteAt(X, U.halo, cosV(0, 0, 0), COS_RU * 2.6, 0, 0.42); cosSpriteAt(X, U.halo2, cosV(0, 0, 0), COS_RU * 4.2, 0, 0.18);
  cosSpriteAt(X, U.flare, cosV(0, thickM(103) - COS_RU, 0), 0, 150 * (1 + 0.8 * Math.exp(-(t - 62) * 2.5)), 0.9);
  cosBeam(X, cosV(0, -COS_RU, 0), t, 1.4); renderStage(X.st, 1.0); if (CAMONLY) return; bloom(0.6);   // the beam stands across the whole sphere (107 vs 93 thousand million ly) so it reads longer than it
  cosLabel(X, cosV(-COS_RU * 0.8, COS_RU * 0.45, 0), 'EL UNIVERSO OBSERVABLE', '~93.000 millones de años luz', ss(62.6, 63.1, t) * (1 - ss(65.3, 65.7, t)), 1); };
