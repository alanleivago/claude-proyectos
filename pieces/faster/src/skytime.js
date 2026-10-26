// =====================================================================
//  SKYTIME — the sun on its daily circle around the pole (Brighton, lat 50.8°), the days and nights that flash past
//  (34–46 s), star trails, the thinning air (blue → deep blue → black, 40–47 s), the black noon sky with a harsh white
//  sun (46–52 s) and the airless sky after it (52–74 s). Also the things in the sky: photographic cumulus, stratocumulus and cirrus sprites, seagulls,
//  a light plane towing a banner (0–14 s), a helicopter (33–47 s), lightning (once), and the debris the wind carries
//  south when the air follows the water (40–47 s). Sets st.hemi / st.key / the sun / the sky dome / fog each frame and
//  K.exp, K.bloom for the renderer. Every pose is a pure function of t.
//  Axes: south = −z, north = +z, east = +x (as the cameras use it), up = y.
// =====================================================================
const SKT_LAT = 50.8 * DEG, SKT_DEC = 17 * DEG, SKT_ALT0 = Math.PI / 2 - SKT_LAT + SKT_DEC;
const SKT_POLE = new THREE.Vector3(0, Math.sin(SKT_LAT), Math.cos(SKT_LAT));
const SKT_NOON = new THREE.Vector3(0, Math.sin(SKT_ALT0), -Math.cos(SKT_ALT0));
function sktRot(v, k, a) { const c = Math.cos(a), s = Math.sin(a), kv = k.dot(v); return new THREE.Vector3().crossVectors(k, v).multiplyScalar(s).addScaledVector(v, c).addScaledVector(k, kv * (1 - c)); }
const sktSun = (H) => sktRot(SKT_NOON, SKT_POLE, H);
const SKT_H0 = -16 * DEG;                       // late morning before the spin-up
const SUN_PIER = sktSun(SKT_H0);
// hour angle H(t): still until 33 s, then the days flash (rate in cycles/s), landing exactly on noon at 46 s
const SKT_RATE = [[33, 0], [33.5, 0.62], [35, 0.48], [38, 0.55], [41, 0.8], [44, 1.0], [45.3, 0.9], [46, 0]];
const SKT_TAB = (() => { const dt = 0.005, n = Math.round(13 / dt), c = new Float64Array(n + 1); for (let i = 1; i <= n; i++) c[i] = c[i - 1] + knots(SKT_RATE, 33 + (i - 0.5) * dt) * dt; return { dt, n, c }; })();
const SKT_N = Math.round(SKT_TAB.c[SKT_TAB.n] + SKT_H0 / TAU);
function sktH(t) { const T = SKT_TAB;
  if (t < 33) return SKT_H0;
  if (t < 46) { const f = (t - 33) / T.dt, i = Math.min(T.n - 1, Math.floor(f)), c = lerp(T.c[i], T.c[i + 1], f - i); return lerp(SKT_H0, TAU * SKT_N, c / T.c[T.n]); }
  // noon held (slow creep), then the sun slides down to a low harsh afternoon sun (shadows sweep) and drifts on
  return TAU * SKT_N + 0.004 * (t - 46) + 70 * DEG * EZ.io(seg(t, 52.2, 56.5)) + 0.6 * DEG * Math.max(0, t - 56.5); }
const sktAlt = (t) => Math.asin(clamp(sktSun(sktH(t)).y, -1, 1)) / DEG;
// the lightning: at the darkest moment of the night near 37 s
const SKT_LT = (() => { let b = 37, bv = 9; for (let t = 36.3; t < 38.2; t += 0.01) { const a = sktAlt(t); if (a < bv) { bv = a; b = t; } } return b; })();
const sktLightning = (t) => { const u = t - SKT_LT; if (u < 0 || u > 0.5) return 0; return (u < 0.05 ? 1 : u < 0.09 ? 0.15 : u < 0.2 ? 0.9 : 0.9 * Math.exp(-(u - 0.2) * 14)); };
// sky colours by sun altitude (deg)
const SKT_COL = [[-18, '#020308', '#06080f'], [-9, '#080a1e', '#1a1838'], [-3, '#262658', '#8a5070'], [1, '#384a8c', '#e88a68'], [6, '#3d5ea6', '#eab090'], [14, '#3f68b4', '#d8d4cc'], [28, '#3a6cc0', '#c8d8e6'], [90, '#3568bc', '#c2d4e6']];
function sktSkyCol(alt) { const K = SKT_COL; if (alt <= K[0][0]) return [lin(K[0][1]), lin(K[0][2])]; for (let i = 0; i < K.length - 1; i++) if (alt < K[i + 1][0]) { const u = (alt - K[i][0]) / (K[i + 1][0] - K[i][0]); return [C3(K[i][1], K[i + 1][1], u), C3(K[i][2], K[i + 1][2], u)]; } return [lin(K[K.length - 1][1]), lin(K[K.length - 1][2])]; }
const sktSunCol = (alt) => (alt > 20 ? lin('#fff2e0') : alt > 6 ? C3('#ffc890', '#fff2e0', (alt - 6) / 14) : C3('#ff7040', '#ffc890', (alt + 1) / 7));
let SKT_LAST = null;

// ---- builders
function sktGullGeo(a) { // a: wing angle (rad, + = up). body along z (nose −z), wings along x; vertex colours
  const P = [], C = [], tri = (p, c) => { P.push(...p[0], ...p[1], ...p[2]); for (let k = 0; k < 3; k++) C.push(...c); };
  const wc = [0.86, 0.87, 0.9], tip = [0.18, 0.18, 0.2], bc = [0.96, 0.96, 0.97];
  [-1, 1].forEach((s) => { const ca = Math.cos(a), sa = Math.sin(a), m = [s * 0.42 * ca, 0.42 * sa, 0.02], e = [s * (0.42 + 0.4 * Math.cos(a * 1.6)) , 0.42 * sa + 0.4 * Math.sin(a * 1.6), 0.12];
    tri([[0, 0, -0.14], [0, 0, 0.1], m], wc); tri([[0, 0, -0.14], m, [s * 0.38 * ca, 0.38 * sa, -0.1]], wc); tri([m, e, [s * 0.38 * ca, 0.38 * sa, -0.1]], tip); tri([[0, 0, 0.1], m, e], wc); });
  tri([[0, 0.05, -0.3], [-0.06, 0, 0], [0.06, 0, 0]], bc); tri([[0, -0.05, -0.3], [0.06, 0, 0], [-0.06, 0, 0]], bc); tri([[0, 0.04, 0.3], [0.06, 0, 0], [-0.06, 0, 0]], bc); tri([[0, -0.04, 0.3], [-0.06, 0, 0], [0.06, 0, 0]], bc);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals(); return g; }
function sktPlane(st) { const g = new THREE.Group(), wh = STDm({ color: '#f2f0ea', roughness: 0.45, metalness: 0.2 }), rd = STDm({ color: '#c42a2a', roughness: 0.5 }), dk = STDm({ color: '#1a2230', roughness: 0.2, metalness: 0.5 });
  const add = (m) => { m.castShadow = false; g.add(m); return m; };
  add(mesh(new THREE.CylinderGeometry(0.55, 0.28, 7.2, 12).rotateZ(Math.PI / 2), wh, 0.4, 0, 0));          // fuselage (nose −x)
  add(mesh(new THREE.SphereGeometry(0.6, 12, 10), wh, -3.1, 0, 0, { s: [1.2, 0.9, 0.95] }));
  add(mesh(new THREE.BoxGeometry(5.8, 0.06, 0.18), rd, 0.6, 0.1, 0.52)); add(mesh(new THREE.BoxGeometry(5.8, 0.06, 0.18), rd, 0.6, 0.1, -0.52));
  add(mesh(new THREE.BoxGeometry(1.5, 0.55, 1.0), dk, -1.7, 0.45, 0));                                     // cabin glass
  add(mesh(new THREE.BoxGeometry(1.5, 0.12, 11), wh, -1.5, 0.85, 0)); [-1, 1].forEach((s) => add(mesh(new THREE.BoxGeometry(0.5, 0.14, 1.2), rd, -1.5, 0.86, s * 5)));
  add(mesh(new THREE.BoxGeometry(1.2, 1.5, 0.08), rd, 3.6, 0.8, 0)); add(mesh(new THREE.BoxGeometry(1.0, 0.07, 3.4), wh, 3.7, 0.15, 0));
  [-1, 1].forEach((s) => { add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 5), dk, -1.4, -0.75, s * 0.8, { rx: s * 0.4 })); add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.14, 12).rotateX(Math.PI / 2), dk, -1.4, -1.3, s * 1.0)); });
  const prop = add(new THREE.Mesh(new THREE.CircleGeometry(0.9, 24).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#cfd4da', transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }))); prop.position.set(-3.85, 0, 0);
  st.scene.add(g);
  // the banner: cloth behind a tow line, text facing the pier (+z)
  const bw = 30, bh = 5, bg = new THREE.PlaneGeometry(bw, bh, 30, 3).translate(bw / 2, 0, 0);
  const tex = signTex(['BRIGHTON · HELADOS 2×1'], { w: 1536, h: 256, bg: '#f6f2e6', fg: '#c81e2a', border: '#1e3a8a', size: 150 });
  const ban = new THREE.Mesh(bg, STDm({ map: tex, roughness: 0.85, side: THREE.DoubleSide, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.12 })); ban.castShadow = false; st.scene.add(ban);
  const rope = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: '#30302c' })); st.scene.add(rope);
  return { g, prop, ban, rope, base: Float32Array.from(bg.attributes.position.array) }; }
function sktHeli(st) { const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const rd = STDm({ color: '#c8262a', roughness: 0.4, metalness: 0.25 }), wh = STDm({ color: '#eceae4', roughness: 0.45, metalness: 0.2 }), gl = STDm({ color: '#14202e', roughness: 0.08, metalness: 0.7 }), dk = STDm({ color: '#22262c', roughness: 0.6, metalness: 0.4 });
  const add = (m, p = body) => { m.castShadow = false; p.add(m); return m; };
  add(mesh(new THREE.SphereGeometry(1, 20, 14), wh, 0, 0, 0, { s: [2.5, 1.45, 1.35] })); add(mesh(new THREE.SphereGeometry(1, 20, 14), rd, 0.05, -0.32, 0, { s: [2.45, 1.15, 1.38] }));
  add(mesh(new THREE.SphereGeometry(1, 16, 12), gl, -1.25, 0.25, 0, { s: [1.35, 1.0, 1.18] }));
  add(mesh(new THREE.CylinderGeometry(0.42, 0.18, 6.4, 10).rotateZ(Math.PI / 2), wh, 4.9, 0.25, 0)); add(mesh(new THREE.BoxGeometry(2.2, 0.16, 0.2), rd, 5.2, 0.25, 0.38)); add(mesh(new THREE.BoxGeometry(2.2, 0.16, 0.2), rd, 5.2, 0.25, -0.38));
  add(mesh(new THREE.BoxGeometry(1.1, 1.9, 0.14), rd, 7.9, 0.95, 0, { rz: -0.3 })); add(mesh(new THREE.BoxGeometry(0.7, 0.1, 2.0), rd, 7.2, 0.35, 0));
  add(mesh(new THREE.BoxGeometry(2.0, 0.5, 1.2), dk, 0.4, 1.45, 0)); add(mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8), dk, 0, 1.85, 0));
  [-1, 1].forEach((s) => { add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.6, 8).rotateZ(Math.PI / 2), dk, 0.2, -1.75, s * 1.15)); [-0.9, 1.2].forEach((x) => add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6), dk, x, -1.45, s * 1.05, { rx: -s * 0.35 }))); });
  const rotor = new THREE.Group(); rotor.position.set(0, 2.15, 0); body.add(rotor);
  [0, 1].forEach((k) => { const b = add(mesh(new THREE.BoxGeometry(11, 0.06, 0.34), dk), rotor); b.rotation.y = k * Math.PI / 2; });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(5.6, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#2a2e34', transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide })); rotor.add(disc);
  const tr = new THREE.Group(); tr.position.set(8.1, 1.1, 0.16); body.add(tr); [0, 1].forEach((k) => { const b = add(mesh(new THREE.BoxGeometry(0.12, 2.0, 0.04), dk), tr); b.rotation.z = k * Math.PI / 2; });
  const bcn = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ff3020', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); bcn.position.set(0.3, -1.2, 0); bcn.scale.setScalar(1.6); body.add(bcn);
  const stb = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffffff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); stb.position.set(8.2, 1.9, 0); stb.scale.setScalar(1.4); body.add(stb);
  st.scene.add(g); return { g, body, rotor, tr, bcn, stb }; }
function sktStars(st) { const R = RNG('stars'), N = 3200, SEG = 12, S = new Float32Array(N * SEG * 2 * 3), F = new Float32Array(N * SEG * 2), B = new Float32Array(N * SEG * 2), PS = new Float32Array(N * 3), PB = new Float32Array(N);
  let k = 0; for (let i = 0; i < N; i++) { const z = R.r(-1, 1), a = R.r(0, TAU), r = Math.sqrt(1 - z * z), v = [r * Math.cos(a), z, r * Math.sin(a)], b = 0.12 + 0.88 * R.f() ** 3.2;
    PS.set(v, i * 3); PB[i] = b; for (let s = 0; s < SEG; s++) for (const f of [s / SEG, (s + 1) / SEG]) { S.set(v, k * 3); F[k] = f; B[k] = b; k++; } }
  const U = { uTh: { value: 0 }, uLen: { value: 0.3 }, uVis: { value: 0 }, uP: { value: SKT_POLE.clone() } };
  const VS = `attribute vec3 aS; attribute float aF, aB; uniform float uTh, uLen, uVis; uniform vec3 uP; varying float vA;
    vec3 rot(vec3 v, vec3 k, float a){ return v * cos(a) + cross(k, v) * sin(a) + k * dot(k, v) * (1.0 - cos(a)); }`;
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(S, 3)); lg.setAttribute('aS', new THREE.BufferAttribute(S, 3)); lg.setAttribute('aF', new THREE.BufferAttribute(F, 1)); lg.setAttribute('aB', new THREE.BufferAttribute(B, 1));
  const lines = new THREE.LineSegments(lg, new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: VS + `void main(){ vec3 d = rot(aS, uP, uTh - aF * uLen); vA = uVis * aB * pow(1.0 - aF, 0.7) * smoothstep(0.01, 0.07, d.y); gl_Position = projectionMatrix * modelViewMatrix * vec4(d * 20000.0, 1.0); }`,
    fragmentShader: 'varying float vA; void main(){ gl_FragColor = vec4(vec3(1.0, 0.96, 0.9) * vA * 1.6, 1.0); }' }));
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(PS, 3)); pg.setAttribute('aS', new THREE.BufferAttribute(PS, 3)); pg.setAttribute('aB', new THREE.BufferAttribute(PB, 1)); pg.setAttribute('aF', new THREE.BufferAttribute(new Float32Array(N), 1));
  const pts = new THREE.Points(pg, new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: VS + `void main(){ vec3 d = rot(aS, uP, uTh); vA = uVis * aB * smoothstep(0.01, 0.07, d.y); gl_Position = projectionMatrix * modelViewMatrix * vec4(d * 20000.0, 1.0); gl_PointSize = 1.4 + 2.6 * aB; }`,
    fragmentShader: 'varying float vA; void main(){ vec2 q = gl_PointCoord - 0.5; float m = smoothstep(0.5, 0.15, length(q)); gl_FragColor = vec4(vec3(1.0, 0.97, 0.93) * vA * m * 1.8, 1.0); }' }));
  const g = new THREE.Group(); g.add(lines, pts); [lines, pts].forEach((o) => { o.frustumCulled = false; o.renderOrder = -5; }); st.scene.add(g); return { g, U }; }
function sktDebris(st) { const R = RNG('debris'), kinds = [];
  const stripe = (n, a, b) => g3Tex((x, w) => { for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? a : b; x.fillRect(i * w / n, 0, w / n + 1, w); } }, 64, 64);
  const umb = new THREE.ConeGeometry(1.25, 0.5, 8, 1, true).translate(0, 0.9, 0), pole = new THREE.CylinderGeometry(0.03, 0.03, 1.9, 5).translate(0, 0, 0);
  kinds.push({ n: 46, geo: umb, mat: STDm({ map: stripe(8, '#ffffff', '#d8d8d8'), side: THREE.DoubleSide, roughness: 0.7 }), cols: ['#e8343a', '#f4c430', '#2a8ae8', '#2ab07a', '#f07ab0', '#ff8a2a'], s: 1.15 });
  kinds.push({ n: 46, geo: pole, mat: STDm({ color: '#e8e4dc', roughness: 0.5 }), cols: ['#f0ece4'], s: 1.15, twin: 0 });
  kinds.push({ n: 80, geo: new THREE.BoxGeometry(1.8, 0.02, 0.95), mat: STDm({ map: stripe(6, '#ffffff', '#cfcfcf'), roughness: 0.95 }), cols: ['#2ab0d8', '#f04a6a', '#f8d040', '#8a4ad8', '#3ac87a', '#ff7a3a', '#f4f0e8'], s: 1.1 });
  const hat = new THREE.CylinderGeometry(0.42, 0.42, 0.03, 14); { const cr = new THREE.CylinderGeometry(0.17, 0.21, 0.2, 12).translate(0, 0.11, 0), a = hat.toNonIndexed(), b = cr.toNonIndexed(), p = new Float32Array(a.attributes.position.count * 3 + b.attributes.position.count * 3); p.set(a.attributes.position.array); p.set(b.attributes.position.array, a.attributes.position.array.length); var hatG = new THREE.BufferGeometry(); hatG.setAttribute('position', new THREE.BufferAttribute(p, 3)); hatG.computeVertexNormals(); }
  kinds.push({ n: 55, geo: hatG, mat: STDm({ roughness: 0.9 }), cols: ['#e8d8a8', '#f4e8c8', '#d8302a', '#2a4a8a', '#f4f4f0'], s: 1.3 });
  kinds.push({ n: 50, geo: new THREE.SphereGeometry(0.36, 14, 10), mat: STDm({ map: stripe(6, '#ffffff', '#c8c8c8'), roughness: 0.35 }), cols: ['#e8343a', '#2a8ae8', '#f4c430', '#2ab07a', '#ff8a2a'], s: 1.4 });
  kinds.push({ n: 190, geo: new THREE.PlaneGeometry(0.32, 0.42), mat: STDm({ side: THREE.DoubleSide, roughness: 1 }), cols: ['#f6f4ee', '#ffffff', '#e8e2d0', '#f8e0a0', '#a8d8f0'], s: 1.4 });
  const cam = new THREE.Vector3(2.5, PIER.DECK + 1.65, -82); let umbIt = null;
  kinds.forEach((K, ki) => { K.im = IM(K.geo, K.mat, K.n, true); K.im.frustumCulled = false; K.it = [];
    if (K.twin === 0) K.it = umbIt; else for (let i = 0; i < K.n; i++) { const t0 = R.r(39.4, 45.6), p0 = new THREE.Vector3(R.r(-70, 170), R.r(4, 60), R.r(60, 260)); let T;
      do T = new THREE.Vector3(R.r(-50, 80), R.r(-4, 46), R.r(-95, -220)); while (new THREE.Line3(p0, T).closestPointToPoint(cam, false, new THREE.Vector3()).distanceTo(cam) < 3.5);
      K.it.push({ t0, p0, d: T.sub(p0).normalize(), v: R.r(16, 42), ax: new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize(), w: R.r(2, 9), a0: R.r(0, TAU), ph: R.r(0, TAU), s: R.r(0.8, 1.25) }); }
    if (ki === 0) umbIt = K.it; for (let i = 0; i < K.n; i++) K.im.setColorAt(i, lin(K.cols[i % K.cols.length])); K.im.instanceColor.needsUpdate = true; st.scene.add(K.im); });
  return kinds; }

// photographic clouds: each texture is a 2D density field (blobs + domain-warped fbm at several scales) lit by marching
// its own density towards the sun (bright sunlit tops and edges, self-shadowed cores) and stored as
// R = sunlit amount, G = closeness to the flat base, A = opacity. The shader tints R/G per sprite (sun, sky, haze).
function sktVN(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const h = (a, b) => { let n = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(s, 1442695041)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v); }
function sktFbm(x, y, s, o) { let a = 0.5, t = 0, n = 0; for (let i = 0; i < o; i++) { t += a * sktVN(x, y, s + i * 17); n += a; const X = x * 1.6 - y * 1.2, Y = x * 1.2 + y * 1.6; x = X + 3.1; y = Y - 1.7; a *= 0.5; } return t / n; }
function sktCloudTex(seed, kind) { const R = RNG('sktcl' + kind + seed), W = 512, H = kind === 'ci' ? 128 : 256, D = new Float32Array(W * H), S = (seed * 7 + 3) | 0;
  const yb = H * 0.1, B = [];
  if (kind === 'cu') { const n = R.i(4, 7), tall = R.r(0.7, 1.25); for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, r = H * (0.13 + 0.22 * Math.sin(Math.PI * u) ** 1.2) * R.r(0.75, 1.15) * tall; B.push([W * (0.14 + 0.72 * u) + R.n(14), yb + r * R.r(0.25, 0.6), r, r * R.r(1.1, 1.5)]); }
    for (let i = 0; i < R.i(2, 5); i++) { const r = H * R.r(0.1, 0.2) * tall; B.push([W * R.r(0.3, 0.7), yb + H * R.r(0.28, 0.5) * tall, r, r]); }
    for (let i = 0; i < R.i(3, 7); i++) { const r = H * R.r(0.05, 0.1); B.push([W * R.r(0.08, 0.92), yb + H * R.r(0.05, 0.3), r, r * 1.3]); }
    // cauliflower turrets: small puffs sitting on the upper contour of the big ones
    const nb = B.length; for (let i = 0; i < 64; i++) { const P = B[R.i(0, nb - 1)], a = R.r(0.15, Math.PI - 0.15), r = P[2] * R.r(0.14, 0.32); B.push([P[0] + Math.cos(a) * P[3] * 0.84, P[1] + Math.sin(a) * P[2] * 0.84, r, r * R.r(1, 1.25)]); } }
  const lx = R.r(-0.55, 0.55), ln = Math.hypot(lx, 1), Lx = lx / ln, Ly = 1 / ln;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const u = x / W, v = y / H;
    const wx = x + (sktFbm(x / 70, y / 70, S, 3) - 0.5) * 60, wy = y + (sktFbm(x / 70 + 9, y / 70 + 4, S + 5, 3) - 0.5) * 40; let d = 0;
    if (kind === 'cu') { for (const [cx, cy, ry, rx] of B) { const q = ((wx - cx) / rx) ** 2 + ((wy - cy) / ry) ** 2; if (q < 1) { const f = (1 - q) ** 0.7; d = d + f - d * f; } }
      const n1 = sktFbm(wx / 34, wy / 30, S + 11, 4), n2 = sktFbm(wx / 11, wy / 10, S + 23, 3);
      d = d * (0.55 + 0.6 * n1) - 0.28 * (1 - n2) * (1 - d) - 0.12; d *= ss(yb - 3, yb + 9 + 10 * sktVN(x / 25, 0.5, S), y); }
    else if (kind === 'sc') { const e = Math.max(0, 1 - ((u - 0.5) / 0.47) ** 2 - ((v - 0.42) / 0.36) ** 2); const c = sktFbm(wx / 46, wy / 22, S + 3, 4), c2 = sktFbm(wx / 13, wy / 9, S + 31, 3);
      d = (ss(0.45, 0.7, c) * 0.9 + 0.25 * c2 - 0.18) * Math.sqrt(e) * ss(0, 0.25, e); }
    else { const e = Math.max(0, 1 - ((u - 0.5) / 0.48) ** 2 - ((v - 0.5) / 0.42) ** 2); const sx = wx + 25 * Math.sin(wy / 18), c = sktFbm(sx / 160, wy / 7, S + 7, 5), c2 = sktFbm(sx / 40, wy / 3, S + 19, 3);
      d = ss(0.42, 0.85, c * 0.75 + c2 * 0.35) * e * 0.45; }
    D[y * W + x] = Math.max(0, d); }
  const data = new Uint8Array(W * H * 4), st = 3, sig = kind === 'cu' ? 0.055 : 0.035, l3 = Math.hypot(Lx, Ly, 0.7), Dv = (x, y) => D[clamp(y, 0, H - 1) * W + clamp(x, 0, W - 1)];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, d = D[i]; let acc = 0;
    if (d > 0.002) for (let k = 1; k < 30; k++) { const px = Math.round(x + Lx * st * k), py = Math.round(y + Ly * st * k); if (px < 0 || px >= W || py >= H) break; acc += D[py * W + px]; }
    // billow normals from the thickness field: each lobe gets its own rounded light and shadow side
    const gx = (Dv(x + 3, y) - Dv(x - 3, y)) * 4.5, gy = (Dv(x, y + 3) - Dv(x, y - 3)) * 4.5, nl = Math.hypot(gx, gy, 1), lam = Math.max(0, (-gx * Lx - gy * Ly + 0.7) / (nl * l3));
    const T = Math.exp(-acc * st * sig), a = 1 - Math.exp(-d * (kind === 'ci' ? 3 : 8)), edge = 1 - ss(0.05, 0.5, d);
    const lit = clamp((0.08 + 0.92 * T ** 0.6) * (kind === 'cu' ? 0.5 + 0.6 * lam : 1) + 0.22 * edge * T), bas = kind === 'cu' ? (1 - ss(yb, yb + H * 0.32, y)) * (0.4 + 0.6 * ss(0.1, 0.6, d)) : 0;
    data[i * 4] = lit * 255; data[i * 4 + 1] = bas * 255; data[i * 4 + 3] = clamp(a) * 255; }
  const tx = new THREE.DataTexture(data, W, H, THREE.RGBAFormat); tx.flipY = false; tx.generateMipmaps = true; tx.minFilter = THREE.LinearMipmapLinearFilter; tx.magFilter = THREE.LinearFilter; tx.needsUpdate = true;
  return { tx, base: kind === 'cu' ? yb / H : 0.5, asp: H / W }; }
const SKT_CU = { uLit: { value: new THREE.Color() }, uShade: { value: new THREE.Color() }, uHaze: { value: new THREE.Color() } };
function sktCloudMat(tex) { const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }), U = { uBase: { value: 0 }, uFar: { value: 0 } }; m.userData.U = U;
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, SKT_CU, U);
    sh.fragmentShader = 'uniform vec3 uLit, uShade, uHaze; uniform float uBase, uFar;\n' + sh.fragmentShader.replace('#include <map_fragment>',
      `vec4 cT = texture2D(map, vUv); vec3 cc = mix(uShade, uLit, cT.r); cc = mix(cc, uShade * 0.8, cT.g * uBase);
       cc = mix(cc, uHaze, uFar); diffuseColor = vec4(cc, opacity * cT.a * (1.0 - 0.45 * uFar));`); };
  return m; }
function buildSkyTime(st, S) { const K = { st, S, exp: 0.9, bloom: 0.25 }, R = RNG('skytime');
  st.skyU.uCl.value = 0.1;
  // photographic clouds: a cumulus deck (flat bases at ~650 m, smaller and flatter toward the horizon), patchy
  // stratocumulus higher up and thin cirrus streaks very high. One material per sprite for its own shading/haze.
  const CT = { cu: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => sktCloudTex(k, 'cu')), sc: [0, 1, 2].map((k) => sktCloudTex(k, 'sc')), ci: [0, 1].map((k) => sktCloudTex(k, 'ci')) };
  K.clouds = []; const addC = (kind, w, x0, z0, y, sp2) => { const T = R.pick(CT[kind]), m = sktCloudMat(T.tx), sp = new THREE.Sprite(m); sp.center.set(0.5, T.base); sp.renderOrder = -6; st.scene.add(sp); K.clouds.push({ sp, m, kind, w, h: w * T.asp * R.r(0.85, 1.2), x0, z0, y, sp2 }); };
  const ring = (r0, r1) => { const a = R.r(0, TAU), r = r0 + (r1 - r0) * R.f() ** 0.8; return [Math.cos(a) * r, -70 + Math.sin(a) * r]; };
  for (let i = 0; i < 150; i++) { const [x, z] = ring(700, 9000); addC('cu', R.f() < 0.3 ? R.r(260, 550) : R.r(550, 1500), x, z, R.r(600, 720), R.r(0.7, 1.3)); }
  for (let i = 0; i < 9; i++) addC('cu', R.r(450, 800), R.r(-900, 900), -70 + R.r(-900, 700), R.r(600, 680), 1);
  for (let i = 0; i < 16; i++) { const [x, z] = ring(1500, 9500); addC('sc', R.r(1800, 3600), x, z, R.r(1700, 2300), R.r(0.8, 1.1)); }
  for (let i = 0; i < 10; i++) { const [x, z] = ring(1000, 12000); addC('ci', R.r(3000, 7000), x, z, R.r(6000, 8000), 0.6); }
  // seagulls: three flap poses as three instanced meshes; each gull uses one per frame
  const gm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide });
  K.gullIM = [0.55, 0.12, -0.3].map((a) => { const m = IM(sktGullGeo(a), gm, 40, false); m.frustumCulled = false; st.scene.add(m); return m; });
  K.gulls = []; for (let i = 0; i < 40; i++) K.gulls.push({ cx: R.r(-60, 70), cz: R.r(-230, 40), cy: R.r(11, 42), r: R.r(8, 40), w: R.r(0.18, 0.4) * (R.f() < 0.5 ? 1 : -1), ph: R.r(0, TAU), fl: R.r(2.2, 3.4), glide: R.f() < 0.4, s: R.r(1.0, 1.35) });
  K.plane = sktPlane(st); K.heli = sktHeli(st); K.stars = sktStars(st); K.debris = sktDebris(st);
  // lamp glows (if the pier exposes lamp meshes)
  K.glows = []; if (S && Array.isArray(S.lamps)) { const gt = glowTex(); S.lamps.forEach((l) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, color: '#ffd59a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); l.updateWorldMatrix(true, false); l.getWorldPosition(sp.position); sp.scale.setScalar(2.6); st.scene.add(sp); K.glows.push(sp); }); }
  return K; }

function poseSkyTime(K, t, cam) { const st = K.st, S = K.S;
  if (!K.envMats) { K.envMats = []; const seen = new Set(); st.scene.traverse((o) => { if (!o.material) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (seen.has(m) || !m.isMeshStandardMaterial) return; seen.add(m); m.userData.sktEnv0 = m.envMapIntensity ?? 1; K.envMats.push(m); }); }); }
  const H = sktH(t), sun = sktSun(H), alt = Math.asin(clamp(sun.y, -1, 1)) / DEG;
  const thin = ss(40, 44.5, t), black = ss(43, 47.2, t);           // the air leaving: deep blue, then black
  const airless = Math.max(thin * 0.5, black);
  const dayK = ss(-4, 8, alt), nightK = 1 - ss(-9, -1, alt), lt = sktLightning(t);
  // ---- sky dome
  let [top, hor] = sktSkyCol(alt);
  top.lerp(lin('#0c2462'), thin * dayK * 0.9).lerp(lin('#000000'), black); hor.lerp(lin('#4a6aa8'), thin * dayK * 0.7).lerp(lin('#030408'), black * 0.97);
  if (lt > 0) { top.lerp(lin('#5a50b8'), lt * 0.8); hor.lerp(lin('#b0a8f0'), lt * 0.7); }
  const U = st.skyU; U.uTop.value.copy(top); U.uHor.value.copy(hor); U.uSun.value.copy(sun);
  U.uSunC.value.copy(sktSunCol(alt).lerp(lin('#ffffff'), airless).multiplyScalar(ss(-3, 1, alt) * (1 - 0.35 * black)));
  U.uCl.value = 0.1 * (1 - ss(39.5, 43, t)) * ss(4, 20, alt);
  // ---- lights: the sun moves, so the shadows sweep. The shadow box follows the view (snapped to 1 m)
  const fw = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion); fw.y = 0; if (fw.lengthSq() < 1e-4) fw.set(0, 0, -1); fw.normalize();
  const tg = cam.position.clone().addScaledVector(fw, 42); tg.set(Math.round(tg.x), PIER.DECK - 3, Math.round(tg.z)); st.setSun(sun, tg);
  const sc = sktSunCol(alt).lerp(lin('#ffffff'), airless);
  st.key.color.copy(sc); st.key.intensity = 2.2 * ss(-1.5, 6, alt) * (0.6 + 0.4 * ss(6, 30, alt)) * (1 + 0.35 * black);
  const hs = top.clone().lerp(hor, 0.45).lerp(lin('#cfe0f4'), dayK * (1 - airless) * 0.6);
  st.hemi.color.copy(hs); st.hemi.groundColor.copy(C3('#8a7a68', '#1a1612', nightK)); st.hemi.intensity = lerp(lerp(0.16, 0.6, dayK), 0.16 * dayK + 0.05, black) * (1 - thin * 0.25) + lt * 1.6;
  if (lt > 0) st.hemi.color.lerp(lin('#b8b0ff'), lt);
  const envK = lerp(lerp(0.12, 1, dayK), 0.2 * dayK + 0.04, black); K.envMats.forEach((m) => (m.envMapIntensity = m.userData.sktEnv0 * envK));
  if (st.scene.fog) { st.scene.fog.color.copy(hor); st.scene.fog.near = lerp(600, 20000, black); st.scene.fog.far = lerp(9000, 90000, black); }
  K.exp = lerp(lerp(1.25, 0.9, dayK), 0.85, black * dayK) + lt * 0.3; K.bloom = lerp(lerp(0.42, 0.25, dayK), 0.4, black) + lt * 0.3;
  // ---- lamps: lit at night and once the sky is black
  const lampK = Math.max(1 - ss(-2, 6, alt), ss(46.5, 52.5, t));
  if (S && S.lampMat) S.lampMat.emissiveIntensity = lerp(0.3, 5, lampK);
  else if (S && Array.isArray(S.lamps)) S.lamps.forEach((l) => l.material && (l.material.emissiveIntensity = lerp(0.3, 5, lampK)));
  K.glows.forEach((g) => (g.material.opacity = 0.85 * lampK));
  // ---- clouds: drift, race through the flashing days, get swept south with the air and thin out
  const cyc = (H - SKT_H0) / TAU, cK = 1 - ss(40, 43.5, t), dusk = (1 - ss(4, 16, alt)) * ss(-4, 2, alt), cp = cam.position;
  SKT_CU.uLit.value.copy(C3('#07080e', '#fffaf2', dayK).lerp(lin('#ffa47e'), dusk * 0.8)); SKT_CU.uShade.value.copy(C3('#04050a', '#8d9ab2', dayK).lerp(lin('#6a5a78'), dusk * 0.7)); SKT_CU.uHaze.value.copy(hor);
  const cOp = cK * (0.55 + 0.45 * ss(-12, 0, alt));
  K.clouds.forEach((c) => { c.sp.visible = cK > 0.01; if (!c.sp.visible) return; const off = -3.5 * t * c.sp2 - 650 * cyc * c.sp2; let x = c.x0 + off; x = ((x + 13000) % 26000 + 26000) % 26000 - 13000;
    const z = c.z0 - 2400 * EZ.i2(seg(t, 39.5, 43.5)) * c.sp2, D = Math.hypot(x - cp.x, z - cp.z), el = Math.atan2(c.y - cp.y, D); c.sp.position.set(x, c.y, z);
    c.sp.scale.set(c.w, c.h * (c.kind === 'cu' ? 0.6 + 0.4 * ss(0.02, 0.22, el) : 1), 1); const U = c.m.userData.U; U.uBase.value = ss(0.15, 0.7, el); U.uFar.value = ss(1500, 11000, D) * (c.kind === 'ci' ? 0.5 : 0.9);
    c.m.opacity = cOp * (1 - ss(11000, 13000, Math.abs(x))) * (c.kind === 'ci' ? 0.75 : 1); });
  // ---- seagulls (blown away when the air goes)
  const gb = ss(39, 43, t); K.gullIM.forEach((m) => (m.count = 40));
  K.gulls.forEach((g, i) => { const a = g.ph + g.w * t, x = g.cx + Math.cos(a) * g.r, z = g.cz + Math.sin(a) * g.r, y = g.cy + 1.5 * Math.sin(t * 0.7 + g.ph), yaw = -a + (g.w > 0 ? 0 : Math.PI);
    const pose = g.glide ? 1 : [0, 1, 2, 1][Math.floor((t * g.fl + g.ph) * 4) & 3], blow = 160 * EZ.i2(seg(t, 39.5, 43.5)), vis = t < 43.5;
    K.gullIM.forEach((m, k) => m.setMatrixAt(i, k === pose && vis ? M4c(x + blow * 0.2, y + blow * 0.15, z - blow, yaw, g.s, g.s, g.s, 0, (g.w > 0 ? -1 : 1) * 0.25) : _hid)); });
  K.gullIM.forEach((m) => (m.instanceMatrix.needsUpdate = true));
  // ---- the banner plane, 3.5–14 s, flying west (−x) in front of the pier, ~430 m south
  { const P = K.plane, on = t > 3 && t < 14; P.g.visible = P.ban.visible = P.rope.visible = on;
    if (on) { const px = 74 - 26 * (t - 3.5), py = 92 + 1.2 * (t - 3.5) + 0.4 * Math.sin(t * 1.3), pz = -330; P.g.position.set(px, py, pz); P.g.rotation.set(0.04 * Math.sin(t * 0.9), 0, 0.03 + 0.02 * Math.sin(t * 1.1)); P.prop.rotation.x = t * 50;
      const bx = px + 22, by = py - 2.2, pos = P.ban.geometry.attributes.position; P.ban.position.set(bx, by, pz);
      for (let i = 0; i < pos.count; i++) { const u = P.base[i * 3], v = P.base[i * 3 + 1], k = u / 30; pos.setXYZ(i, u, v - 0.6 * k * k, (0.25 + 0.9 * k) * Math.sin(u * 0.42 - t * 8.5) + 0.15 * Math.sin(v * 1.3 + u * 0.8 - t * 11)); }
      pos.needsUpdate = true; P.ban.geometry.computeVertexNormals(); const rp = P.rope.geometry.attributes.position; rp.setXYZ(0, px + 3.9, py - 0.1, pz); rp.setXYZ(1, bx, by + 0.4, pz); rp.needsUpdate = true; } }
  // ---- the helicopter, 33–47 s: hovering over the beach, then struggling in the thin air
  { const Hh = K.heli, on = t > 33 && t < 47.5; Hh.g.visible = on;
    if (on) { const sK = ss(40.5, 46, t), wob = 0.04 + 0.22 * sK; Hh.g.position.set(30 + 2 * Math.sin(t * 0.6) + 6 * sK * Math.sin(t * 1.7), 30 + 0.8 * Math.sin(t * 0.9) - 14 * EZ.i2(seg(t, 42, 47.5)) + 2 * sK * Math.sin(t * 3.1), -20 + 4 * Math.sin(t * 0.4));
      Hh.g.scale.setScalar(0.75); Hh.g.rotation.set(0, 2.3 + 0.15 * Math.sin(t * 0.5) + 0.5 * sK * Math.sin(t * 1.3), 0); Hh.body.rotation.set(wob * Math.sin(t * 2.3), 0, -0.08 + wob * 0.8 * Math.sin(t * 1.9 + 1));
      Hh.rotor.rotation.y = t * (34 - 8 * sK); Hh.tr.rotation.z = t * 60; Hh.bcn.material.opacity = (Math.floor(t * 1.6) % 2 ? 0.15 : 1) * (0.35 + 0.65 * (1 - dayK)); Hh.stb.material.opacity = ((t * 1.1) % 1 < 0.06 ? 1 : 0); } }
  // ---- star trails: the sky turns about the pole star (north, 50.8° up)
  { const U2 = K.stars.U, rate = knots(SKT_RATE, t), vis = Math.max(nightK * (1 - 0.6 * dayK), black * 0.9, thin * 0.35 * dayK) * (1 - lt);
    let th = H, len = clamp(TAU * rate * 0.42, 0.04, 1.7);
    if (t >= 46) { const w = (u) => 0.02 * u; th = H + w(Math.min(t, 52) - 46) + 0.35 * Math.max(0, t - 52) + 0.03 * Math.max(0, t - 52) ** 2; len = t < 52 ? 0.006 : lerp(0.006, 0.55, ss(52, 55, t)); }
    U2.uTh.value = th; U2.uLen.value = len; U2.uVis.value = vis; K.stars.g.position.copy(cam.position); K.stars.g.visible = vis > 0.01; }
  // ---- debris carried south by the wind (40–47 s)
  { const dbOn = t > 39.3 && t < 48; K.debris.forEach((D) => { D.im.visible = dbOn; if (!dbOn) return;
    D.it.forEach((d, i) => { const u = t - d.t0; if (u < 0 || u > 9) { D.im.setMatrixAt(i, _hid); return; }
      const s = d.v * u + 3.5 * u * u, p = d.p0.clone().addScaledVector(d.d, s); p.y += 1.2 * Math.sin(u * 2.4 + d.ph) + 1.6 * u; const q = new THREE.Quaternion().setFromAxisAngle(d.ax, d.a0 + d.w * u), sc = D.s * d.s * ss(0, 0.35, u);
      D.im.setMatrixAt(i, new THREE.Matrix4().compose(p, q, new THREE.Vector3(sc, sc, sc))); }); D.im.instanceMatrix.needsUpdate = true; }); }
  SKT_LAST = { t, st, sun, alt, black, dayK, lt }; }

// 2D: the harsh airless sun (a star-shaped flare), the daytime lens flare and the lightning bolt
function skyOverlay(t) { const L = SKT_LAST; if (!L || t >= 74 || Math.abs(L.t - t) > 0.01) return; const st = L.st;
  const upK = ss(-2, 4, L.alt), cam = st.cam;
  const s = cam.position.clone().addScaledVector(L.sun, 5000).project(cam);
  if (s.z < 1 && upK > 0) { const x = (s.x * 0.5 + 0.5) * W, y = (-s.y * 0.5 + 0.5) * H, k = upK * L.black * clamp(1.6 - Math.hypot(s.x, s.y * 0.7) * 0.9);
    lensFlare(st, L.sun, upK * (0.35 * (1 - L.black) * L.dayK + 0.18 * L.black));
    if (k > 0.01) { ctx.save(); screen(); ctx.globalCompositeOperation = 'screen';
      pvGlow(x, y, 200, 'rgba(255,250,240,0.45)', k); pvGlow(x, y, 80, 'rgba(255,255,255,1)', k);
      ctx.fillStyle = '#ffffff'; ctx.globalAlpha = k; ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU); ctx.fill();
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + 0.11, Ls = (i % 2 ? 260 : 900) * (0.85 + 0.15 * Math.sin(i * 3.7)), wd = i % 2 ? 2.5 : 4.5, gx = Math.cos(a), gy = Math.sin(a);
        const gr = ctx.createLinearGradient(x, y, x + gx * Ls, y + gy * Ls); gr.addColorStop(0, `rgba(255,252,245,${0.95 * k})`); gr.addColorStop(0.25, `rgba(255,245,230,${0.5 * k})`); gr.addColorStop(1, 'rgba(255,240,220,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x - gy * wd, y + gx * wd); ctx.lineTo(x + gx * Ls, y + gy * Ls); ctx.lineTo(x + gy * wd, y - gx * wd); ctx.closePath(); ctx.fill(); }
      const hg = ctx.createLinearGradient(0, 0, W, 0); hg.addColorStop(0, 'rgba(255,245,230,0)'); hg.addColorStop(clamp(x / W, 0.05, 0.95), `rgba(255,252,245,${0.9 * k})`); hg.addColorStop(1, 'rgba(255,245,230,0)');
      ctx.fillStyle = hg; ctx.fillRect(0, y - 2.5, W, 5); ctx.globalAlpha = 0.35; ctx.fillRect(0, y - 9, W, 18); ctx.restore(); } }
  // lightning: a jagged bolt far over the town, and the flash
  if (L.lt > 0) { const R = RNG('bolt'), a = cam.position, p0 = new THREE.Vector3(a.x + 520, 640, a.z + 1000).project(cam), p1 = new THREE.Vector3(a.x + 470, 140, a.z + 1050).project(cam);
    if (p0.z < 1) { const X = (p) => (p.x * 0.5 + 0.5) * W, Y = (p) => (-p.y * 0.5 + 0.5) * H, path = (x0, y0, x1, y1, n, j) => { const P = [[x0, y0]]; for (let i = 1; i < n; i++) { const f = i / n; P.push([lerp(x0, x1, f) + R.n(j), lerp(y0, y1, f) + R.n(j * 0.3)]); } P.push([x1, y1]); return P; };
      const main = path(X(p0), Y(p0), X(p1), Y(p1), 16, 34), br = [main]; [4, 7, 10].forEach((i) => { const [bx, by] = main[i]; br.push(path(bx, by, bx + R.n(160), by + R.r(120, 260), 7, 18)); });
      ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; ctx.lineJoin = 'round'; br.forEach((P, bi) => { [[16, 'rgba(170,150,255,0.35)'], [6, 'rgba(210,200,255,0.8)'], [2.2, 'rgba(255,255,255,1)']].forEach(([w, c]) => { ctx.globalAlpha = L.lt * (bi ? 0.7 : 1); ctx.strokeStyle = c; ctx.lineWidth = w * (bi ? 0.6 : 1); ctx.beginPath(); P.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke(); }); });
      ctx.restore(); }
    pvTint('#9a90ff', 0.18 * L.lt, 'screen'); } }
