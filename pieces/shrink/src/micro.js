// =====================================================================
//  MICRO — flea (16–20), fur (20–24), mites (24–28), salt (28–31). The micro agent owns this file.
//  Each stage uses its own units: 1.6 units = her height at the shot start (so 1 unit = HGT(t0) / 1.6 m).
// =====================================================================
const MC_UP = new THREE.Vector3(0, 1, 0), mcV = [0, 1, 2, 3, 4, 5, 6, 7].map(() => new THREE.Vector3());
const mcH = (lt) => 1.6 * Math.pow(2, -lt / 2);                                          // her height in stage units
const mcF = (lt) => 1.6 * 2 / Math.LN2 * (1 - Math.pow(2, -lt / 2));                      // ∫ mcH
const mcWalk = (lt, v, a = 0) => lt <= a ? 0 : v * (mcF(lt) - mcF(a));                     // distance walked at v heights/s from a
const PHYm = (o) => new THREE.MeshPhysicalMaterial(Object.assign({ roughness: 0.6 }, o));

// ---- a stage with an indoor backdrop (gradient + soft bokeh discs), fog and an environment for reflections
function mcStage(o) { const st = makeStage(Object.assign({ far: 4000 }, o)); st.setSun(o.sun, o.target || new THREE.Vector3()); skyEnv(st, o.env[0], o.env[1], o.sun, o.env[2] || '#fff0dc');
  const U = { uT: { value: lin(o.back[0]) }, uM: { value: lin(o.back[1]) }, uB: { value: lin(o.back[2]) }, uS: { value: o.bokeh || 0 }, uBC: { value: lin(o.back[3] || '#ffffff') } };
  const m = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: U,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 uT, uM, uB, uBC; uniform float uS; varying vec3 vD;
float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
void main(){ vec3 d = normalize(vD); vec3 c = d.y > 0.0 ? mix(uM, uT, pow(d.y, 0.7)) : mix(uM, uB, pow(-d.y, 0.6));
  vec3 g = d * 11.0, i = floor(g); float b = 0.0;
  for (int k = 0; k < 8; k++) { float fk = float(k); vec3 o = vec3(mod(fk, 2.0), mod(floor(fk / 2.0), 2.0), floor(fk / 4.0)); vec3 cell = i + o; float r = h3(cell);
    vec3 cp = cell + vec3(h3(cell + 1.3), h3(cell + 2.7), h3(cell + 4.1)); float dd = length(g - cp), rad = 0.12 + 0.22 * h3(cell + 7.7);
    b += step(0.45, r) * smoothstep(rad, rad * 0.8, dd) * (0.35 + 0.65 * smoothstep(rad * 0.5, rad, dd)) * (0.3 + r) * 0.9; }
  c = mix(c, uBC, clamp(uS * b, 0.0, 1.0) * 0.6); gl_FragColor = vec4(c, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` }));
  m.frustumCulled = false; m.renderOrder = -10; st.scene.add(m); return st; }

// ---- fake depth of field: blur everything above y0 and below y1 (px from the top), fading in over `ramp`
let MC_DC = null;
function mcDof(y0, y1, ramp, px) { const w = W / 3, h = H / 3; if (!MC_DC) { MC_DC = document.createElement('canvas'); MC_DC.width = w; MC_DC.height = h; }
  const x = MC_DC.getContext('2d'); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w, h); x.filter = `blur(${px / 3}px)`; x.drawImage(ctx.canvas, -8, -8, w + 16, h + 16); x.filter = 'none';
  x.globalCompositeOperation = 'destination-in'; const g = x.createLinearGradient(0, 0, 0, h), f = (v) => clamp(v / H), A = (a) => `rgba(0,0,0,${a})`;
  const st = [[0, 1], [f(y0 - ramp), 1], [f(y0), 0], [f(y1), 0], [f(y1 + ramp), 1], [1, 1]]; let last = -1; st.forEach(([o, a]) => { o = Math.max(o, last); last = o; g.addColorStop(o, A(a)); });
  x.fillStyle = g; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'source-over'; ctx.save(); screen(); ctx.drawImage(MC_DC, 0, 0, W, H); ctx.restore(); }

// ---- a tube along a path P(s) with radius Rf(s) and optional colour Cf(s) (s = 0..1); uv.x runs along the tube
function mcTube(P, Rf, N, M, Cf) { const pos = [], nor = [], uv = [], col = [], idx = [], T = new THREE.Vector3(), Nn = new THREE.Vector3(), B = new THREE.Vector3(); let first = true;
  for (let i = 0; i <= N; i++) { const s = i / N, p = P(s), q = P(Math.min(1, s + 1e-3)), p0 = P(Math.max(0, s - 1e-3)); T.set(q[0] - p0[0], q[1] - p0[1], q[2] - p0[2]).normalize();
    if (first) { Nn.set(0, 0, 1); if (Math.abs(T.dot(Nn)) > 0.9) Nn.set(1, 0, 0); first = false; } Nn.addScaledVector(T, -T.dot(Nn)).normalize(); B.crossVectors(T, Nn);
    const r = Rf(s), c = Cf ? Cf(s) : null;
    for (let j = 0; j <= M; j++) { const an = j / M * TAU, ca = Math.cos(an), sa = Math.sin(an), nx = Nn.x * ca + B.x * sa, ny = Nn.y * ca + B.y * sa, nz = Nn.z * ca + B.z * sa;
      pos.push(p[0] + nx * r, p[1] + ny * r, p[2] + nz * r); nor.push(nx, ny, nz); uv.push(s, j / M); if (c) col.push(c.r, c.g, c.b); } }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) { const a0 = i * (M + 1) + j, a1 = a0 + M + 1; idx.push(a0, a0 + 1, a1, a1, a0 + 1, a1 + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  if (col.length) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); return g; }

// ---- limbs: rigid segments aimed point to point, 2-bone IK
function mcSeg(par, len, r0, r1, mat, rs = 8) { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(r1, r0, len, rs).translate(0, len / 2, 0), mat)); g.add(mesh(new THREE.SphereGeometry(r0 * 1.1, rs, 6), mat)); g.len = len; par.add(g); return g; }
function mcAim(g, A, B) { g.position.copy(A); mcV[7].subVectors(B, A).normalize(); g.quaternion.setFromUnitVectors(MC_UP, mcV[7]); }
function mcIK(A, T, l1, l2, pole, K) { const d = mcV[6].subVectors(T, A); const L = clamp(d.length(), Math.abs(l1 - l2) + 1e-4, l1 + l2 - 1e-4); d.normalize();
  const a = (l1 * l1 - l2 * l2 + L * L) / (2 * L), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), p = mcV[5].copy(pole).addScaledVector(d, -pole.dot(d)).normalize(); return K.copy(A).addScaledVector(d, a).addScaledVector(p, h); }
// spines along a segment (children of its group): n cones pointing mostly along the bone and outward
function mcSpines(g, n, len, r, mat, seed, out = 0.7) { const R = RNG('spn' + seed); for (let k = 0; k < n; k++) { const a = R.r(0, TAU), y = g.len * R.r(0.25, 0.95), c = mesh(new THREE.ConeGeometry(r, len, 4).translate(0, len / 2, 0), mat, 0, y, 0, { cast: false });
  c.quaternion.setFromUnitVectors(MC_UP, new THREE.Vector3(Math.cos(a) * out, 1, Math.sin(a) * out).normalize()); g.add(c); } }
// a leg: hip → coxa end (fixed), femur + tibia by IK to the ankle, tarsus from the ankle along fdir
function mcLeg(par, d, mat) { const L = Object.assign({}, d); L.cxs = mcSeg(par, d.hip.distanceTo(d.cx), d.rc, d.rc * 0.8, mat); L.fem = mcSeg(par, d.l1, d.rf[0], d.rf[1], mat); L.tib = mcSeg(par, d.l2, d.rt[0], d.rt[1], mat); L.tar = mcSeg(par, d.l3, d.rs[0], d.rs[1], mat, 6); L.K = new THREE.Vector3(); L.A = new THREE.Vector3(); return L; }
function mcLegPose(L, foot, fdir) { const A = L.A.copy(foot).addScaledVector(fdir, -L.l3); mcIK(L.cx, A, L.l1, L.l2, L.pole, L.K); mcAim(L.cxs, L.hip, L.cx); mcAim(L.fem, L.cx, L.K); mcAim(L.tib, L.K, A); mcAim(L.tar, A, foot); }
const mcV3 = (x, y, z) => new THREE.Vector3(x, y, z);
// instanced cones: list of [base, dir, len, r]
function mcCones(par, list, mat, seg = 4) { const m = IM(new THREE.ConeGeometry(1, 1, seg).translate(0, 0.5, 0), mat, list.length, false); const q = new THREE.Quaternion();
  list.forEach(([p, d, l, r], i) => { q.setFromUnitVectors(MC_UP, d.clone().normalize()); m.setMatrixAt(i, new THREE.Matrix4().compose(p, q, mcV3(r, l, r))); }); par.add(m); return m; }

// =====================================================================
//  FLEA — 16–20 s. 1 unit = 3.9 mm. A cat flea (3 mm = 0.77 units) on the giant wood grain of the floor.
// =====================================================================
function mcFlea(par) { const g = new THREE.Group(), body = new THREE.Group(); g.add(body); par.add(g);
  const plTex = g3Tex((x, w, h) => { const R = RNG('fleaPl'), gr = x.createLinearGradient(0, 0, 0, h);
    [[0, '#2a0c04'], [0.4, '#3e1608'], [0.75, '#4c1c0a'], [0.86, '#341206'], [0.92, '#8a4a1e'], [0.97, '#6a3214'], [1, '#1a0804']].forEach(([o, c]) => gr.addColorStop(o, c)); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 220; k++) { x.fillStyle = R.f() < 0.6 ? `rgba(30,8,4,${R.r(0.1, 0.25)})` : `rgba(220,140,70,${R.r(0.06, 0.15)})`; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, h * 0.86), R.r(0.6, 2.2), R.r(0.6, 1.6), 0, 0, TAU); x.fill(); }
    for (let k = 0; k < 12; k++) { x.strokeStyle = `rgba(40,12,4,${R.r(0.06, 0.14)})`; x.lineWidth = 1; x.beginPath(); const y = R.r(0, h * 0.8); x.moveTo(0, y); for (let i = 0; i <= 8; i++) x.lineTo(i / 8 * w, y + R.n(3)); x.stroke(); } }, 256, 256);
  const mat = PHYm({ map: plTex, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.3, sheenColor: lin('#d08850') });
  const legM = PHYm({ color: '#5a2a10', roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2 }), spM = STDm({ color: '#3a1808', roughness: 0.4 });
  const plates = [ // [z, yc, hy, hz, hx, rx]
    [0.41, 0.36, 0.125, 0.105, 0.07, -0.45], [0.31, 0.41, 0.14, 0.065, 0.065, -0.2], [0.23, 0.43, 0.16, 0.07, 0.068, -0.12], [0.15, 0.45, 0.18, 0.072, 0.072, -0.06]];
  [0.22, 0.245, 0.26, 0.265, 0.255, 0.225, 0.17].forEach((hy, i) => plates.push([0.06 - i * 0.075, [0.46, 0.47, 0.47, 0.465, 0.455, 0.445, 0.44][i], hy, 0.11, hy * 0.4, 0.05 + i * 0.06]));
  const sg = new THREE.SphereGeometry(1, 32, 20).rotateX(Math.PI / 2), cones = [];
  plates.forEach(([z, yc, hy, hz, hx, rx], i) => { const m = mesh(sg, mat, 0, yc, z, { s: [hx, hy, hz], rx }); body.add(m);
    // bristles on the rear rim of each plate (both sides), pointing back
    const n = i === 0 ? 2 : 3; for (let k = 0; k < n; k++) for (const s of [-1, 1]) { const a = lerp(-0.2, 1.3, k / (n - 1)) + 0.15 * Math.sin(i * 3.1 + k), p = mcV3(s * Math.cos(a) * hx * 0.98, yc + Math.sin(a) * hy * 0.98, z - hz * 0.55);
      cones.push([p, mcV3(s * Math.cos(a) * 0.35, Math.sin(a) * 0.35 - 0.1, -1), i > 3 ? 0.06 : 0.045, 0.004]); } });
  // pronotal comb (a row of flat dark spines along the rear of the pronotum) and genal comb (under the head)
  for (let k = 0; k < 9; k++) for (const s of [-1, 1]) { const a = lerp(-0.7, 1.45, k / 8); cones.push([mcV3(s * Math.cos(a) * 0.064, 0.41 + Math.sin(a) * 0.13, 0.27), mcV3(s * Math.cos(a) * 0.2, Math.sin(a) * 0.2 - 0.15, -1), 0.07, 0.009]); }
  for (let k = 0; k < 6; k++) for (const s of [-1, 1]) cones.push([mcV3(s * 0.05, 0.27 - k * 0.006, 0.45 - k * 0.022), mcV3(s * 0.25, -0.9, -0.7), 0.06, 0.008]);
  // head bristles
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) cones.push([mcV3(s * 0.06, 0.4 + k * 0.02, 0.44 - k * 0.02), mcV3(s * 0.3, 0.6, -1), 0.04, 0.004]);
  mcCones(body, cones, spM);
  // eyes, antennae (clubs resting in a groove behind the eyes), mouthparts
  const eyeM = PHYm({ color: '#0a0604', roughness: 0.15, clearcoat: 1 }); for (const s of [-1, 1]) body.add(mesh(new THREE.SphereGeometry(0.024, 16, 10), eyeM, s * 0.058, 0.39, 0.44));
  g.ant = [-1, 1].map((s) => { const a = new THREE.Group(); a.position.set(s * 0.062, 0.42, 0.37); a.add(mesh(new THREE.SphereGeometry(1, 14, 10), legM, 0, 0.03, 0, { s: [0.016, 0.045, 0.024] })); body.add(a); return a; });
  const palp = (s) => mcTube((u) => [s * 0.025 + s * 0.01 * u, 0.28 - 0.17 * u, 0.47 + 0.05 * u - 0.03 * u * u], (u) => 0.009 * (1 - 0.4 * u), 10, 6); for (const s of [-1, 1]) body.add(mesh(palp(s), legM));
  body.add(mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.16, 6), spM, 0, 0.2, 0.49, { rx: 0.25 }));
  // legs (side s = ±1): hip, coxa end, femur, tibia, tarsus; the hind legs are long and thick (the jumping legs)
  const defs = (s) => [
    { hip: mcV3(s * 0.04, 0.33, 0.35), cx: mcV3(s * 0.07, 0.22, 0.4), rc: 0.032, l1: 0.17, rf: [0.03, 0.022], l2: 0.17, rt: [0.02, 0.016], l3: 0.14, rs: [0.013, 0.008], pole: mcV3(s * 0.3, 1, 0.6), foot: mcV3(s * 0.15, 0, 0.66), fdir: mcV3(s * 0.15, -0.6, 1).normalize() },
    { hip: mcV3(s * 0.06, 0.33, 0.22), cx: mcV3(s * 0.1, 0.2, 0.22), rc: 0.036, l1: 0.2, rf: [0.032, 0.024], l2: 0.2, rt: [0.022, 0.017], l3: 0.15, rs: [0.013, 0.008], pole: mcV3(s, 1, 0.1), foot: mcV3(s * 0.34, 0, 0.26), fdir: mcV3(s, -0.7, 0.25).normalize() },
    { hip: mcV3(s * 0.07, 0.35, 0.08), cx: mcV3(s * 0.11, 0.2, 0.02), rc: 0.06, l1: 0.3, rf: [0.048, 0.034], l2: 0.32, rt: [0.03, 0.02], l3: 0.22, rs: [0.016, 0.009], pole: mcV3(s * 0.35, 1, 0.9), foot: mcV3(s * 0.26, 0, -0.5), fdir: mcV3(s * 0.15, -0.5, -1).normalize() }];
  g.legs = []; [-1, 1].forEach((s) => defs(s).forEach((d, i) => { const L = mcLeg(body, d, legM); mcSpines(L.tib, 6 + i * 2, 0.045, 0.004, spM, s * 10 + i); mcSpines(L.fem, 3, 0.035, 0.004, spM, s * 20 + i, 1); L.rest = d.foot.clone(); g.legs.push(L); }));
  g.body = body; return g; }
// pose: lunge forward (0..1), crouch (0..1), jump time u (s, <0 = on the ground)
function mcFleaPose(g, t, o) { const b = g.body, cr = o.crouch || 0, br = 0.006 * Math.sin(t * 5.3); b.position.set(0, -0.09 * cr + br, 0.06 * (o.lunge || 0)); b.rotation.x = -0.12 * cr;
  g.ant.forEach((a, i) => { a.rotation.set(-0.5 + 0.25 * Math.sin(t * 7 + i * 2) * (0.5 + 0.5 * Math.sin(t * 1.3 + i)), 0, (i ? -1 : 1) * 0.3); });
  const air = o.air || 0; g.legs.forEach((L, i) => { const f = mcV[0].copy(L.rest); f.z += 0.06 * (o.lunge || 0) * (L.rest.z > 0.5 ? 1 : 0); f.y -= b.position.y; f.z -= b.position.z;
    // in the air the legs trail, extended
    if (air) { f.y = lerp(f.y, -0.18, air); f.z = lerp(f.z, L.rest.z - 0.25, air * (L.rest.z < 0 ? 1 : 0.3)); }
    mcLegPose(L, f, L.fdir); }); }

function mcWoodTex() { return g3Tex((x, w, h) => { const R = RNG('mcwood'); x.fillStyle = '#a9794a'; x.fillRect(0, 0, w, h);
  let px = 0; while (px < w) { const bw = R.r(14, 46), late = R.r(3, 9), wob = R.r(2, 9), ph = R.r(0, 9);
    for (let y = 0; y < h; y += 4) { const ox = Math.sin(y / h * TAU * 2 + ph) * wob; const gr = x.createLinearGradient(px + ox, 0, px + ox + bw, 0);
      gr.addColorStop(0, 'rgba(200,150,95,0.5)'); gr.addColorStop(0.7, 'rgba(170,115,65,0.35)'); gr.addColorStop((bw - late) / bw, 'rgba(120,70,35,0.55)'); gr.addColorStop(1, 'rgba(90,50,24,0.7)'); x.fillStyle = gr; x.fillRect(px + ox, y, bw, 4); }
    px += bw; }
  for (let k = 0; k < 900; k++) { x.fillStyle = `rgba(55,28,12,${R.r(0.3, 0.7)})`; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, h), R.r(1.2, 2.4), R.r(5, 14), 0, 0, TAU); x.fill(); }
  for (let k = 0; k < 700; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '70,38,16' : '220,180,130'},${R.r(0.04, 0.1)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1.5, 3), R.r(10, 40)); }
  for (let k = 0; k < 14; k++) { x.strokeStyle = `rgba(240,220,190,${R.r(0.08, 0.2)})`; x.lineWidth = R.r(0.6, 1.6); x.beginPath(); const y0 = R.r(0, h), x0 = R.r(0, w), a = R.r(-0.6, 0.6), l = R.r(60, 300); x.moveTo(x0, y0); x.lineTo(x0 + Math.cos(a) * l, y0 + Math.sin(a) * l); x.stroke(); } }, 1024, 1024); }

function mcFleaStage() { return once('mcflea', () => { const sun = dirV(-55 * DEG, 32 * DEG);
  const st = mcStage({ hemi: 0.5, sky: '#f4e2c8', ground: '#4a3220', key: 2.0, keyCol: '#ffe2c0', box: 3.2, boxFar: 60, sunDist: 20, fog: '#c4a888', fogNear: 6, fogFar: 60, sun, target: mcV3(0, 0, -0.6), env: ['#c8b8a0', '#f0dcc0', '#fff0d8'], back: ['#d8c4a8', '#b08a62', '#6a4a30', '#fff2d8'], bokeh: 1 }), S = { st }, R = RNG('mcfleaS');
  const wt = wrap(mcWoodTex(), 30, 30); st.scene.add(mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), PHYm({ map: wt, bumpMap: wt, bumpScale: 0.8, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.35 }), 0, 0, -8, { cast: false }));
  // the gap between two planks
  st.scene.add(mesh(new THREE.PlaneGeometry(0.16, 40).rotateX(-Math.PI / 2), STDm({ color: '#1a0e06', roughness: 1 }), -1.9, 0.002, -8, { cast: false }));
  for (const s of [-1, 1]) st.scene.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 40, 8).rotateX(Math.PI / 2), PHYm({ color: '#8a5a32', roughness: 0.4, clearcoat: 0.6 }), -1.9 + s * 0.1, -0.012, -8, { cast: false }));
  // dust and grit lying on the floor
  const dg = lumpyGeo(2, 0.4, 31), dust = IM(dg, STDm({ color: '#b8aa98', roughness: 0.95 }), 260, true), c = new THREE.Color();
  for (let i = 0; i < 260; i++) { let x = R.r(-6, 6), z = R.r(-12, 3); if (Math.abs(x) < 0.6 && z > -1.8 && z < 1.4) x += 1.4 * Math.sign(x || 1); const s = R.r(0.01, 0.06) * (R.f() < 0.1 ? 2.5 : 1); dust.setMatrixAt(i, M4c(x, s * 0.4, z, R.r(0, 6), s, s * R.r(0.5, 0.9), s * R.r(0.7, 1.3)));
    dust.setColorAt(i, c.set(R.pick(['#c8bca8', '#9a8c7a', '#e0d8cc', '#7a6a58', '#b89878']))); } st.scene.add(dust);
  // lint fibres and two cat hairs lying on the floor
  const fM = [STDm({ color: '#d8d4cc', roughness: 0.9 }), STDm({ color: '#6a7a9a', roughness: 0.9 }), STDm({ color: '#9a8e80', roughness: 0.9 })];
  for (let k = 0; k < 10; k++) { const x0 = R.r(-5, 5), z0 = R.r(-10, -1.5), a = R.r(0, TAU), l = R.r(1.5, 5), r = R.r(0.012, 0.022), w1 = R.r(0.2, 0.6), ph = R.r(0, 6);
    st.scene.add(mesh(mcTube((u) => [x0 + Math.cos(a) * l * u + Math.sin(u * 7 + ph) * w1 * Math.sin(a), r + 0.02 * Math.max(0, Math.sin(u * 11 + ph)), z0 + Math.sin(a) * l * u - Math.sin(u * 7 + ph) * w1 * Math.cos(a)], () => r, 60, 6), R.pick(fM))); }
  const hairM = PHYm({ vertexColors: true, roughness: 0.35, clearcoat: 0.4 }), hcol = (u) => C3('#f4e2c4', '#d8803a', ss(0.1, 0.6, u));
  [[2.4, -4.2, 2.75, 7]].forEach(([x0, z0, a, l]) => st.scene.add(mesh(mcTube((u) => [x0 + Math.cos(a) * l * u, 0.07 * (1 - 0.6 * u), z0 + Math.sin(a) * l * u], (u) => 0.07 * (1 - 0.6 * u), 80, 12, hcol), hairM)));
  // the coin standing on its edge behind (out of focus) and the pencil far back
  const cT = g3Tex((x, w, h) => { x.filter = 'blur(5px)'; x.fillStyle = '#b4b4b4'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e8e8e8'; x.lineWidth = 14; x.beginPath(); x.arc(w / 2, h / 2, w * 0.44, 0, TAU); x.stroke();
    x.fillStyle = '#d8d8d8'; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; x.save(); x.translate(w / 2 + Math.cos(a) * w * 0.36, h / 2 + Math.sin(a) * w * 0.36); x.beginPath(); for (let i = 0; i < 10; i++) { const b = i / 10 * TAU, r = i % 2 ? 7 : 17; x.lineTo(Math.cos(b) * r, Math.sin(b) * r); } x.fill(); x.restore(); }
    x.lineWidth = 6; x.beginPath(); x.arc(w / 2, h / 2, w * 0.26, 0, TAU); x.stroke(); x.font = 'bold 150px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('1', w / 2, h / 2); }, 512, 512, false);
  const coinM = PHYm({ color: '#e4dfd4', map: cT, metalness: 1, roughness: 0.24 }), edgeM = PHYm({ color: '#c8c2b6', metalness: 1, roughness: 0.4, bumpMap: wrap(g3Tex((x, w, h) => { for (let i = 0; i < w; i += 4) { x.fillStyle = i % 8 ? '#000' : '#fff'; x.fillRect(i, 0, 4, h); } }, 512, 8, false), 12, 1), bumpScale: 2 });
  const coin = mesh(new THREE.CylinderGeometry(5.9, 5.9, 0.6, 128).rotateX(Math.PI / 2), [edgeM, coinM, coinM], 2.5, 5.9, -9, { ry: -0.35 }); st.scene.add(coin);
  const pen = mesh(new THREE.CylinderGeometry(0.9, 0.9, 60, 6).rotateZ(Math.PI / 2), STDm({ color: '#f0c020', roughness: 0.45 }), 0, 0.78, -16, { ry: -0.15 }); st.scene.add(pen);
  st.scene.add(mesh(new THREE.BoxGeometry(400, 30, 1), PHYm({ color: '#f2ece2', roughness: 0.5, clearcoat: 0.3 }), 0, 15, -60, { cast: false }));
  st.scene.add(mesh(new THREE.PlaneGeometry(400, 300), STDm({ color: '#e6dccb', roughness: 0.9 }), 0, 150, -62, { cast: false }));
  const crM = STDm({ color: '#c89a5a', roughness: 0.85 }); [[-2.6, -3.5, 0.35], [3.8, -7, 0.6], [-1.2, -9, 0.45]].forEach(([x, z, s], i) => st.scene.add(mesh(lumpyGeo(3, 0.5, 90 + i), crM, x, s * 0.5, z, { s: [s, s * 0.7, s * 0.9] })));
  S.flea = mcFlea(st.scene); S.flea.scale.setScalar(0.77); S.girl = makeGirl(st); return S; }); }

SHOT_FN.flea = (lt, dur, t) => { const S = mcFleaStage(), st = S.st, h = mcH(lt), F = S.flea;
  // the flea faces her (+z); it creeps forward once, crouches and springs away at the end
  const lunge = ss(1.7, 2.2, lt), crouch = ss(3.0, 3.35, lt) * (1 - ss(3.42, 3.5, lt)), u = lt - 3.45, air = clamp(u / 0.05);
  F.position.set(0.5, 0, -0.1); F.rotation.set(0, -Math.PI / 2 - 0.25, 0);
  if (u > 0) { F.position.y += 6 * u; F.position.x -= 2.5 * u; F.position.z += 1.5 * u; F.rotation.x = -u * 9; }
  mcFleaPose(F, t, { lunge, crouch, air });
  // she backs away from it, then flinches as it jumps
  const xg = -0.4 - mcWalk(lt, 0.16, 0.6) * ss(0.6, 1.0, lt), fl = ss(3.45, 3.7, lt), back = ss(0.5, 0.9, lt) * (1 - fl);
  placeGirl(S.girl, xg, 0, 0.1, h, { yaw: Math.PI / 2 - 0.35, walk: 0.55 * back, ph: -lt * 6.5, lean: -0.08 * back, crouch: 0.35 * fl, headPitch: -0.1 - 0.25 * fl, headYaw: -0.2,
    armL: [lerp(0.25, 1.6, fl), lerp(0.2, 0.45, fl), lerp(0.5, 1.4, fl)], armR: [lerp(0.4, 1.7, fl), lerp(0.15, 0.4, fl), lerp(0.7, 1.5, fl)], emo: { fear: 0.7, surprise: 0.3 + 0.6 * fl } });
  const mx = (xg + 0.6) / 2, cp = [mx - 0.2, 0.2 + 0.32 * h, 3.0 + 0.3 * h], tg = [mx, 0.26 + 0.27 * h, -0.1];
  camPt(st, cp, tg, 52, t, 0.5, 3); renderStage(st, 0.95); bloom(0.18); mcDof(600, 1420, 380, 9); };

// =====================================================================
//  FUR — 20–24 s. 1 unit = 1 mm. Inside the sleeping ginger cat's fur: hairs as leaning tapered trunks on the skin.
// =====================================================================
function mcCuticleTex() { return g3Tex((x, w, h) => { const R = RNG('mccut'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.filter = 'blur(1.2px)';
  for (let c = 0; c < 24; c++) { const x0 = c / 24 * w + R.n(3); x.strokeStyle = `rgba(150,110,80,${R.r(0.35, 0.6)})`; x.lineWidth = 2.2; x.beginPath(); for (let y = -4; y <= h + 4; y += 6) x.lineTo(x0 + Math.sin(y * 0.09 + c * 1.7) * 5 + R.n(1.5), y); x.stroke();
    const gr = x.createLinearGradient(x0, 0, x0 + w / 24, 0); gr.addColorStop(0, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(200,170,140,0.25)'); x.fillStyle = gr; x.fillRect(x0 + 2, 0, w / 24 - 2, h); } }, 512, 256); }
function mcFurStage() { return once('mcfur', () => { const sun = dirV(-25 * DEG, 62 * DEG);
  const st = mcStage({ hemi: 0.42, sky: '#ffcf98', ground: '#6a3418', key: 1.45, keyCol: '#ffd6a0', box: 7, boxFar: 120, sunDist: 40, fog: '#a8622c', fogNear: 2.5, fogFar: 18, sun, target: mcV3(0, 0, -1), env: ['#e8a868', '#ffd8a8', '#ffe8c8'], back: ['#ffc070', '#b0642a', '#5a2a10', '#ffe0a0'], bokeh: 1.2 }), S = { st }, R = RNG('mcfurS');
  const skT = g3Tex((x, w, h) => { const Q = RNG('mcskin'); x.fillStyle = '#b88068'; x.fillRect(0, 0, w, h); x.filter = 'blur(2px)'; for (let k = 0; k < 40; k++) blot(x, Q.r(0, w), Q.r(0, h), Q.r(20, 80), Q.pick(['rgba(240,200,170,0.5)', 'rgba(200,140,110,0.4)', 'rgba(250,220,200,0.4)']));
    x.strokeStyle = 'rgba(140,80,60,0.35)'; x.lineWidth = 3; for (let k = 0; k < 120; k++) { let px = Q.r(0, w), py = Q.r(0, h); x.beginPath(); x.moveTo(px, py); for (let i = 0; i < 5; i++) { px += Q.n(26); py += Q.n(26); x.lineTo(px, py); } x.stroke(); }
    for (let k = 0; k < 600; k++) blot(x, Q.r(0, w), Q.r(0, h), Q.r(3, 8), Q.pick(['rgba(255,235,220,0.35)', 'rgba(150,90,70,0.3)'])); }, 1024, 1024);
  wrap(skT, 6, 6); st.scene.add(mesh(new THREE.PlaneGeometry(60, 60, 1, 1).rotateX(-Math.PI / 2), PHYm({ map: skT, bumpMap: skT, bumpScale: 0.6, roughness: 0.5, sheen: 0.6, sheenColor: lin('#ffd8c0') }), 0, 0, -10, { cast: false }));
  // hair templates: guard hairs (thick) and undercoat (thin); each rises from the skin then bends over in +x
  const cut = mcCuticleTex(); wrap(cut, 1, 2); cut.repeat.set(90, 1);
  const hM = PHYm({ vertexColors: true, map: cut, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.25, sheen: 0.5, sheenColor: lin('#ffe0b0') });
  const hcol = (u) => u < 0.06 ? C3('#f6ecdc', '#f0d4a4', u / 0.06) : u < 0.3 ? C3('#f0d4a4', '#e2843a', (u - 0.06) / 0.24) : C3('#e2843a', '#b8561c', (u - 0.3) / 0.7);
  const tmpl = (r0, len, bend, N, M) => mcTube((u) => { const a = lerp(0.3, bend, Math.pow(u, 1.3)); return [len * (u * Math.sin(a) * 0.9), len * u * Math.cos(a * 0.8), 0]; }, (u) => r0 * (1 - 0.7 * u * u) * (u < 0.02 ? 1.25 - u * 12 : 1), N, M, hcol);
  const G = [tmpl(0.09, 16, 1.2, 48, 16), tmpl(0.08, 15, 1.5, 48, 16), tmpl(0.075, 17, 0.9, 48, 16)], U = [tmpl(0.026, 10, 1.3, 28, 7), tmpl(0.022, 9, 1.6, 28, 7)];
  const path = (x, z) => Math.abs(x - 0.1 + 0.12 * z) < 0.5 + Math.max(0, z + 1) * 0.25 && z > -4.2 && z < 8;
  const place = (geos, n, s0, s1, key) => geos.map((geo, gi) => { const m = IM(geo, hM, n, true), Q = RNG(key + gi), c = new THREE.Color(); let i = 0;
    while (i < n) { const x = Q.r(-9, 9), z = Q.r(-16, 4.5); if (path(x, z)) continue; const s = Q.r(s0, s1), yaw = Math.PI / 2 + Q.r(-0.55, 0.55) - 0.25 * Math.sign(x);
      m.setMatrixAt(i, M4c(x, 0, z, yaw, s, s, s, 0, Q.r(-0.05, 0.05))); const tab = Q.f() < 0.25 ? 0.72 : Q.r(0.88, 1.08); m.setColorAt(i, c.setRGB(tab, tab * Q.r(0.92, 1), tab * Q.r(0.85, 1))); i++; }
    st.scene.add(m); return m; });
  place(G, 150, 0.85, 1.25, 'gh'); place(U, 520, 0.8, 1.2, 'uh');
  // follicle collars at the base of hairs: small skin mounds (scattered, not under the path)
  const col = IM(new THREE.SphereGeometry(1, 16, 8, 0, TAU, 0, Math.PI / 2), PHYm({ color: '#dcae92', roughness: 0.5, sheen: 0.5 }), 120, false);
  for (let i = 0; i < 120; i++) { let x = R.r(-8, 8), z = R.r(-14, 4); if (path(x, z)) x += 1.2 * Math.sign(x - 0.1 || 1); const s = R.r(0.08, 0.16); col.setMatrixAt(i, M4c(x, 0, z, 0, s, s * 0.35, s)); } st.scene.add(col);
  // dandruff flakes lying on the skin (and a few caught higher up), translucent white
  const fl = IM(lumpyGeo(2, 0.35, 77), PHYm({ color: '#f6f0e4', roughness: 0.6, transmission: 0.25, thickness: 0.1, sheen: 0.4 }), 46, true);
  for (let i = 0; i < 46; i++) { let x = R.r(-6, 6), z = R.r(-12, 4); if (path(x, z)) x += 1.3 * Math.sign(x - 0.1 || 1); const s = R.r(0.12, 0.5), up = i > 38 ? R.r(1.5, 4) : s * 0.07;
    fl.setMatrixAt(i, M4c(x, up, z, R.r(0, 6), s, s * 0.12, s * R.r(0.6, 1), R.n(0.25), R.n(0.25))); } st.scene.add(fl);
  // floating motes
  const pg = new THREE.BufferGeometry(), pp = []; for (let i = 0; i < 260; i++) pp.push(R.r(-6, 6), R.r(0.2, 6), R.r(-12, 4)); pg.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3));
  S.motes = new THREE.Points(pg, new THREE.PointsMaterial({ map: glowTex(), color: '#ffe0b0', size: 0.03, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })); st.scene.add(S.motes);
  S.girl = makeGirl(st); return S; }); }

SHOT_FN.fur = (lt, dur, t) => { const S = mcFurStage(), st = S.st, h = mcH(lt);
  const d = mcWalk(lt, 0.42), zg = -2.2 + d, xg = 0.1 - 0.12 * zg; S.motes.position.set(0.02 * Math.sin(t * 0.7), 0.03 * t, 0.05 * Math.sin(t * 0.5));
  placeGirl(S.girl, xg, 0, zg, h, { yaw: Math.atan2(-0.12, 1) - 0.0, walk: 0.85, ph: t * 6.4, headYaw: 0.35 * Math.sin(lt * 1.1), headPitch: -0.12, look: [0.4 * Math.sin(lt * 1.1), 0.2], emo: { surprise: 0.4 } });
  const cz = zg + 1.7 + 1.6 * h, cp = [0.1 - 0.12 * cz + 0.25 + 0.3 * h, 0.2 + 0.55 * h, cz], tg = [xg, 0.25 + 0.5 * h, zg - 0.5];
  camPt(st, cp, tg, 46, t, 0.5, 7); renderStage(st, 0.76); bloom(0.22); mcDof(560, 1450, 420, 8); };

// =====================================================================
//  MITES — 24–28 s. 1 unit = 0.25 mm. Dust mites (0.3 mm) on the woven sofa fabric: yarns like giant ropes.
// =====================================================================
const MC_P = 1.9, MC_R = 0.82, MC_A = 0.36;
function mcSurf(x, z) { const i = Math.round(x / MC_P), dx = x - i * MC_P, j = Math.round(z / MC_P), dz = z - j * MC_P; let y = -1.2;
  if (Math.abs(dx) < MC_R) y = Math.max(y, MC_A * Math.cos(Math.PI * z / MC_P + i * Math.PI) + Math.sqrt(MC_R * MC_R - dx * dx));
  if (Math.abs(dz) < MC_R) y = Math.max(y, -MC_A * Math.cos(Math.PI * x / MC_P + j * Math.PI) + Math.sqrt(MC_R * MC_R - dz * dz)); return y; }
function mcYarnTex(base, key) { return g3Tex((x, w, h) => { const R = RNG(key), b = lin(base); x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 260; k++) { const x0 = R.r(-w, w), c = b.clone().multiplyScalar(R.r(0.6, 1.35)); x.strokeStyle = 'rgba(' + (c.r * 255 | 0) + ',' + (c.g * 255 | 0) + ',' + (c.b * 255 | 0) + ',' + R.r(0.5, 0.9) + ')'; x.lineWidth = R.r(1.5, 4);
    for (const o of [-w, 0, w]) { x.beginPath(); x.moveTo(x0 + o, 0); x.bezierCurveTo(x0 + o + w * 0.3, h * 0.33, x0 + o + w * 0.5, h * 0.66, x0 + o + w * 0.8 + R.n(4), h); x.stroke(); } } }, 256, 256); }
function mcMite(par, seed) { const g = new THREE.Group(), body = new THREE.Group(); g.add(body); par.add(g);
  const strT = g3Tex((x, w, h) => { x.fillStyle = '#f2e6cc'; x.fillRect(0, 0, w, h); x.filter = 'blur(0.8px)'; x.strokeStyle = 'rgba(170,140,100,0.22)'; x.lineWidth = 1; for (let y = 0; y < h; y += 3) { x.beginPath(); for (let i = 0; i <= 32; i++) x.lineTo(i / 32 * w, y + 1.5 * Math.sin(i * 0.9 + y * 0.3)); x.stroke(); } }, 512, 512);
  const skin = PHYm({ color: '#fbf2de', map: strT, roughness: 0.35, transmission: 0.7, thickness: 0.4, ior: 1.4, clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.5, sheenColor: lin('#fff4e0'), attenuationColor: lin('#e8c890'), attenuationDistance: 0.6 });
  const legM = PHYm({ color: '#e8d4ae', roughness: 0.45, transmission: 0.3, thickness: 0.1, clearcoat: 0.4 }), setM = STDm({ color: '#c8a878', roughness: 0.5 });
  body.add(mesh(new THREE.SphereGeometry(1, 40, 28), skin, 0, 0.42, 0, { s: [0.36, 0.27, 0.58] }));
  body.add(mesh(new THREE.SphereGeometry(1, 20, 14), STDm({ color: '#7a5226', roughness: 0.7 }), 0, 0.42, -0.05, { s: [0.17, 0.13, 0.32] }));            // gut seen through the body
  body.add(mesh(new THREE.SphereGeometry(1, 16, 12), skin, 0, 0.36, 0.56, { s: [0.13, 0.1, 0.14] }));                                                     // gnathosoma
  for (const s of [-1, 1]) { body.add(mesh(new THREE.CapsuleGeometry(0.025, 0.1, 4, 8).rotateX(Math.PI / 2), legM, s * 0.04, 0.33, 0.7)); body.add(mesh(new THREE.CapsuleGeometry(0.02, 0.12, 4, 8).rotateX(1.2), legM, s * 0.09, 0.3, 0.66)); }
  // setae: two pairs of long trailing hairs at the rear, short ones on the back and sides
  const seta = (p0, d, l, r) => mcTube((u) => [p0[0] + d[0] * l * u, p0[1] + d[1] * l * u - 0.15 * l * u * u, p0[2] + d[2] * l * u], (u) => r * (1 - 0.8 * u), 12, 5);
  for (const s of [-1, 1]) { body.add(mesh(seta([s * 0.1, 0.42, -0.55], [s * 0.35, 0.25, -1], 0.9, 0.012), setM)); body.add(mesh(seta([s * 0.2, 0.4, -0.5], [s * 0.6, 0.1, -0.8], 0.6, 0.01), setM));
    for (let k = 0; k < 4; k++) { const z = lerp(0.35, -0.35, k / 3); body.add(mesh(seta([s * 0.3, 0.48, z], [s * 0.8, 0.5, -0.4], 0.22, 0.008), setM)); body.add(mesh(seta([s * 0.12, 0.66, z], [s * 0.3, 0.6, -0.6], 0.16, 0.007), setM)); } }
  const D = (s) => [[0.36, 0.62, 0.42], [0.24, 0.3, 0.5], [-0.12, -0.18, 0.5], [-0.3, -0.52, 0.42]].map(([zh, zf, xf], i) => ({ hip: mcV3(s * 0.26, 0.34, zh), cx: mcV3(s * 0.33, 0.27, zh + (i < 2 ? 0.05 : -0.05)), rc: 0.05,
    l1: 0.17, rf: [0.045, 0.036], l2: 0.17, rt: [0.034, 0.026], l3: 0.1, rs: [0.024, 0.014], pole: mcV3(s, 1.2, i < 2 ? 0.4 : -0.4), foot: mcV3(s * xf, 0, zf), fdir: mcV3(s * 0.5, -1, i < 2 ? 0.4 : -0.4).normalize() }));
  g.legs = []; [-1, 1].forEach((s) => D(s).forEach((d, i) => { const L = mcLeg(body, d, legM); [L.fem, L.tib, L.tar].forEach((sg, k) => mcSpines(sg, 2, 0.1 - k * 0.02, 0.006, setM, seed * 50 + s * 10 + i * 3 + k, 1.2)); L.rest = d.foot; L.ph = (i + (s > 0 ? 0.5 : 0)) * Math.PI; g.legs.push(L); }));
  g.body = body; return g; }
// put a mite at (x, z) heading yaw, scale k, walking (0..1) at time t; feet on the woven surface
function mcMitePose(g, x, z, yaw, k, walk, t) { const cy = Math.max(mcSurf(x, z), mcSurf(x + Math.sin(yaw) * 0.4 * k, z + Math.cos(yaw) * 0.4 * k), mcSurf(x - Math.sin(yaw) * 0.4 * k, z - Math.cos(yaw) * 0.4 * k)) - 0.06 * k;
  g.position.set(x, cy, z); g.rotation.set(0, yaw, 0); g.scale.setScalar(k); g.body.position.y = 0.01 * Math.sin(t * 9) * walk; const cs = Math.cos(yaw), sn = Math.sin(yaw);
  g.legs.forEach((L) => { const ph = t * 9 + L.ph, f = mcV[0].copy(L.rest); f.z += 0.09 * Math.sin(ph) * walk; const wx = x + (f.x * cs + f.z * sn) * k, wz = z + (-f.x * sn + f.z * cs) * k;
    f.y = (mcSurf(wx, wz) - cy) / k + 0.07 * Math.max(0, Math.cos(ph)) * walk; mcLegPose(L, f, L.fdir); }); }
function mcMiteStage() { return once('mcmite', () => { const sun = dirV(-40 * DEG, 48 * DEG);
  const st = mcStage({ hemi: 0.5, sky: '#c8d4dc', ground: '#22282c', key: 1.7, keyCol: '#ffe8d0', box: 6, boxFar: 80, sunDist: 30, fog: '#3e4c54', fogNear: 4, fogFar: 22, sun, target: mcV3(0, 0, -1), env: ['#8a9aa6', '#d8d0c4', '#fff0dc'], back: ['#7a8890', '#46545c', '#1a2024', '#ffd8a8'], bokeh: 1 }), S = { st }, R = RNG('mcmiteS');
  st.scene.add(mesh(new THREE.PlaneGeometry(200, 200).rotateX(-Math.PI / 2), STDm({ color: '#141a1e', roughness: 1 }), 0, -1.2, 0, { cast: false }));
  const tW = mcYarnTex('#5e7c88', 'yw'), tF = mcYarnTex('#6e8a84', 'yf'), Lz = [-34, 12], Lx = [-22, 22];
  const mW = PHYm({ map: wrap(tW, 1, 1), roughness: 0.85, sheen: 1, sheenColor: lin('#c8dce4'), sheenRoughness: 0.5 }), mF = PHYm({ map: wrap(tF, 1, 1), roughness: 0.85, sheen: 1, sheenColor: lin('#d4e4dc'), sheenRoughness: 0.5 });
  tW.repeat.set((Lz[1] - Lz[0]) / 2.6, 1); tF.repeat.set((Lx[1] - Lx[0]) / 2.6, 1);
  const strM = PHYm({ color: '#7a98a0', roughness: 0.7, sheen: 1, sheenColor: lin('#e0eef2') });
  for (let i = -11; i <= 11; i++) { const x = i * MC_P, P = (u) => { const z = lerp(Lz[0], Lz[1], u); return [x, MC_A * Math.cos(Math.PI * z / MC_P + i * Math.PI), z]; };
    st.scene.add(mesh(mcTube(P, () => MC_R * 0.97, 360, 18), mW)); for (let q = 0; q < 2; q++) { const ph = q * Math.PI + i; st.scene.add(mesh(mcTube((u) => { const p = P(u), a = u * (Lz[1] - Lz[0]) * 2.4 + ph; return [p[0] + Math.cos(a) * MC_R * 0.97, p[1] + Math.sin(a) * MC_R * 0.97, p[2]]; }, () => 0.05, 1400, 5), strM, 0, 0, 0, { cast: false })); } }
  for (let j = -18; j <= 6; j++) { const z = j * MC_P, P = (u) => { const x = lerp(Lx[0], Lx[1], u); return [x, -MC_A * Math.cos(Math.PI * x / MC_P + j * Math.PI), z]; };
    st.scene.add(mesh(mcTube(P, () => MC_R * 0.97, 260, 18), mF)); for (let q = 0; q < 2; q++) { const ph = q * Math.PI + j; st.scene.add(mesh(mcTube((u) => { const p = P(u), a = u * (Lx[1] - Lx[0]) * 2.4 + ph; return [p[0], p[1] + Math.sin(a) * MC_R * 0.97, p[2] + Math.cos(a) * MC_R * 0.97]; }, () => 0.05, 1000, 5), strM, 0, 0, 0, { cast: false })); } }
  // loose fibre loops (fuzz) sticking out of the yarn
  const loops = [0, 1, 2].map((v) => mcTube((u) => [0.1 * Math.sin(u * 5 + v), Math.sin(Math.PI * u) * (0.3 + 0.2 * v), (u - 0.5) * (0.6 + 0.4 * v) + 0.15 * Math.sin(u * 6 + v)], () => 0.014, 24, 4));
  loops.forEach((geo, v) => { const m = IM(geo, strM, 140, false); let n = 0; while (n < 140) { const x = R.r(-12, 12), z = R.r(-20, 5); if (Math.hypot(x - 0.05, z) < 1.0) continue; m.setMatrixAt(n++, M4c(x, mcSurf(x, z) - 0.05, z, R.r(0, TAU), 1, R.r(0.6, 1.3), 1, R.n(0.4), R.n(0.4))); } st.scene.add(m); });
  // skin flakes lying on the fabric (mite food)
  const fl = IM(lumpyGeo(2, 0.35, 55), PHYm({ color: '#f2ece0', roughness: 0.5, transmission: 0.6, thickness: 0.05 }), 14, true);
  for (let i = 0; i < 14; i++) { let x = R.r(-7, 7), z = R.r(-14, 2); if (Math.hypot(x, z) < 3.5) x += 5 * Math.sign(x || 1); const s = R.r(0.25, 0.6); fl.setMatrixAt(i, M4c(x, mcSurf(x, z) + 0.02, z, R.r(0, 6), s, s * 0.08, s * R.r(0.6, 1), R.n(0.2), R.n(0.2))); } st.scene.add(fl);
  S.mites = [0, 1, 2, 3, 4, 5, 6].map((k) => mcMite(st.scene, k)); S.girl = makeGirl(st); return S; }); }
// mite paths: [x0, z0, heading, turn, speed (units/s), scale]
const MC_MP = [[1.55, -0.9, -1.9, 0.1, 0.1, 1.0], [-2.6, -3.5, 0.6, 0.15, 0.22, 1.05], [3.2, -5.2, -2.2, -0.12, 0.2, 0.95], [-0.8, -7.5, 1.4, 0.1, 0.25, 1.1], [5.5, -9, -1.2, 0.08, 0.2, 1.0], [-5.5, -10, 2.4, -0.1, 0.22, 1.05], [-2.4, 1.6, 1.3, -0.05, 0.25, 0.95]];
function mcMitePath(k, lt) { const [x0, z0, a0, tw, v] = MC_MP[k]; let x = x0, z = z0, a = a0; const n = 24, dt = lt / n; for (let i = 0; i < n; i++) { const tt = i * dt, sp = v * (k === 0 ? 1 - ss(2.2, 3.2, tt) * 0.85 : 1); a = a0 + tw * tt + 0.25 * Math.sin(tt * 0.9 + k); x += Math.sin(a) * sp * dt; z += Math.cos(a) * sp * dt; } return [x, z, a]; }
SHOT_FN.mites = (lt, dur, t) => { const S = mcMiteStage(), st = S.st, h = mcH(lt);
  S.mites.forEach((m, k) => { const [x, z, a] = mcMitePath(k, lt); mcMitePose(m, x, z, a, MC_MP[k][5], k === 0 ? 1 - 0.8 * ss(2.6, 3.4, lt) : 1, t + k * 0.37); });
  const gy = mcSurf(0, 0); placeGirl(S.girl, 0, gy, 0, h, { yaw: 1.05, headYaw: 0.25, headPitch: -0.1 - 0.15 * ss(1, 4, lt), armL: [0.35, 0.25, 0.6], armR: [0.6 + 0.4 * ss(2, 3, lt), 0.2, 0.9], look: [0.3, 0.1], emo: { surprise: 0.5, fear: 0.3 } });
  const cp = [-0.9 - 0.2 * h, gy + 0.9 + 0.55 * h, 2.2 + 0.8 * h], tg = [0.55, gy - 0.1 + 0.4 * h, -0.4];
  camPt(st, cp, tg, 48, t, 0.5, 11); renderStage(st, 0.95); bloom(0.15); mcDof(640, 1400, 420, 9); };

// =====================================================================
//  SALT — 28–31 s. 1 unit = 62.5 µm. A table-salt grain (0.3 mm = 4.8 units) on a wooden kitchen counter.
//  No transmission (it duplicated the girl): a frosted translucent shell over a milky core, fractures and
//  inclusions in between, stepped hopper terraces, clearcoat glints, star sparkles and a sharp caustic.
// =====================================================================
function mcRB(w, h, d, r) { const s = new THREE.Shape(), a = w / 2 - r, b = h / 2 - r; s.moveTo(-a, -h / 2); s.lineTo(a, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -b); s.lineTo(w / 2, b); s.quadraticCurveTo(w / 2, h / 2, a, h / 2); s.lineTo(-a, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, b); s.lineTo(-w / 2, -b); s.quadraticCurveTo(-w / 2, -h / 2, -a, -h / 2);
  return new THREE.ExtrudeGeometry(s, { depth: Math.max(d - 2 * r, 1e-3), bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 4, curveSegments: 5 }).translate(0, 0, -Math.max(d - 2 * r, 1e-3) / 2); }
let MC_SM = null;
// a painted salt-crystal face: frosted white rim, clearer cool depth inside, stepped hopper terraces,
// straight cleavage cracks with a rainbow fringe, inclusions and bubbles. bmp = height map for the bump.
function mcSaltFace(seed, bmp) { return g3Tex((x, w, h) => { const Q = RNG('mcface' + seed), c = w / 2;
    if (bmp) { x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); } else {
      const g = x.createRadialGradient(c * 1.05, c * 0.95, w * 0.05, c, c, w * 0.72); g.addColorStop(0, '#5e8296'); g.addColorStop(0.45, '#a6bec9'); g.addColorStop(0.8, '#eef4f6'); g.addColorStop(1, '#ffffff'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let k = 0; k < 5; k++) { const L = x.createLinearGradient(0, Q.r(0, h), w, Q.r(0, h)); L.addColorStop(0, 'rgba(255,255,255,0)'); L.addColorStop(Q.r(0.3, 0.7), 'rgba(255,255,255,' + Q.r(0.1, 0.25) + ')'); L.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = L; x.fillRect(0, 0, w, h); } }
    // hopper terraces: concentric rounded squares, denser toward the centre, slightly off-centre
    let ox = 0, oy = 0, f = 0.93; for (let k = 0; k < 9; k++) { f -= Q.r(0.05, 0.13); if (f < 0.14) break; ox += Q.n(14); oy += Q.n(14); const s = w * f, r = s * 0.06, x0 = c - s / 2 + ox, y0 = c - s / 2 + oy;
      const rr = (dx, dy, ss) => { x.beginPath(); x.moveTo(x0 + dx + r, y0 + dy); x.arcTo(x0 + dx + ss, y0 + dy, x0 + dx + ss, y0 + dy + ss, r); x.arcTo(x0 + dx + ss, y0 + dy + ss, x0 + dx, y0 + dy + ss, r); x.arcTo(x0 + dx, y0 + dy + ss, x0 + dx, y0 + dy, r); x.arcTo(x0 + dx, y0 + dy, x0 + dx + ss, y0 + dy, r); x.closePath(); };
      if (bmp) { const v = 128 - (k + 1) * 11; rr(0, 0, s); x.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; x.fill(); }
      else { x.lineWidth = 5; x.setLineDash([Q.r(200, 900), Q.r(20, 160)]); x.lineDashOffset = Q.r(0, 500); rr(-3, -3, s); x.strokeStyle = 'rgba(255,255,255,' + Q.r(0.6, 1) + ')'; x.stroke(); x.lineWidth = 4; rr(3, 3, s); x.strokeStyle = 'rgba(50,78,98,' + Q.r(0.35, 0.7) + ')'; x.stroke(); x.setLineDash([]); } }
    if (bmp) return;
    // cleavage cracks: straight, axis-aligned segments with a soft glow and a rainbow fringe
    for (let k = 0; k < 5; k++) { let px = Q.r(w * 0.15, w * 0.85), py = Q.r(h * 0.15, h * 0.85); const pts = [[px, py]]; for (let i = 0; i < 3; i++) { const a = Q.i(0, 3) * Math.PI / 2 + Q.n(0.04), l = Q.r(40, 160); px += Math.cos(a) * l; py += Math.sin(a) * l; pts.push([px, py]); }
      [['rgba(255,140,170,0.5)', -4, 5], ['rgba(140,210,255,0.5)', 4, 5], ['rgba(255,255,255,1)', 0, 3]].forEach(([col, d, lw]) => { x.strokeStyle = col; x.lineWidth = lw; x.shadowColor = 'rgba(255,255,255,0.8)'; x.shadowBlur = d ? 0 : 8; x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a + d, b) : x.moveTo(a + d, b)); x.stroke(); }); x.shadowBlur = 0; }
    // inclusions (tiny dark specks) and gas bubbles (bright rings)
    for (let k = 0; k < 26; k++) { x.fillStyle = 'rgba(70,60,50,' + Q.r(0.3, 0.7) + ')'; x.beginPath(); x.arc(Q.r(60, w - 60), Q.r(60, h - 60), Q.r(2, 6), 0, TAU); x.fill(); }
    for (let k = 0; k < 14; k++) { const px = Q.r(60, w - 60), py = Q.r(60, h - 60), r = Q.r(4, 12); x.strokeStyle = 'rgba(255,255,255,0.95)'; x.lineWidth = 2.5; x.beginPath(); x.arc(px, py, r, 0, TAU); x.stroke(); x.fillStyle = 'rgba(60,80,95,0.35)'; x.fill(); }
    // frosted speckle + whiter etched rim
    for (let k = 0; k < 3000; k++) { const v = Q.r(200, 255) | 0; x.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + Q.r(0.05, 0.3) + ')'; x.fillRect(Q.r(0, w), Q.r(0, h), Q.r(1, 3), Q.r(1, 3)); }
    x.strokeStyle = 'rgba(255,255,255,0.7)'; x.lineWidth = w * 0.035; x.strokeRect(0, 0, w, h);
    // clear crystal toward the centre: lower alpha so the inside and the far faces show through
    x.globalCompositeOperation = 'destination-out'; const cg = x.createRadialGradient(c + Q.n(40), c + Q.n(40), 0, c, c, w * 0.48); cg.addColorStop(0, 'rgba(0,0,0,0.72)'); cg.addColorStop(0.6, 'rgba(0,0,0,0.48)'); cg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = cg; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'source-over'; }, 1024, 1024, !bmp); }
function mcSaltMats() { if (MC_SM) return MC_SM;
  const mk = (seed) => { const a = mcSaltFace(seed, false), b = mcSaltFace(seed, true);
    return PHYm({ map: a, emissiveMap: a, emissive: lin('#34383c'), bumpMap: b, bumpScale: 0.05, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.06, specularIntensity: 1, ior: 1.544, sheen: 0.4, sheenColor: lin('#ffffff'), transparent: true, depthWrite: false }); };
  const cores = [mk(1), mk(2), mk(3)], backs = cores.map((m) => { const b = m.clone(); b.side = THREE.BackSide; b.color = lin('#c8d6dc'); b.emissive = lin('#20252a'); return b; });
  const shell = PHYm({ color: '#ffffff', emissive: lin('#3a3836'), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, ior: 1.544, transparent: true, opacity: 0.32, depthWrite: false, envMapIntensity: 2.4 });
  const star = new THREE.SpriteMaterial({ map: g3Tex((x, w, h) => { const c = w / 2; let g = x.createRadialGradient(c, c, 0, c, c, c * 0.35); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,240,220,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      [[1, 0.035], [0, 0.035]].forEach(([hz, th]) => { const L = x.createLinearGradient(hz ? 0 : c, hz ? c : 0, hz ? w : c, hz ? c : h); L.addColorStop(0, 'rgba(255,240,220,0)'); L.addColorStop(0.5, 'rgba(255,252,245,1)'); L.addColorStop(1, 'rgba(255,240,220,0)'); x.fillStyle = L; if (hz) x.fillRect(0, c - w * th / 2, w, w * th); else x.fillRect(c - w * th / 2, 0, w * th, h); }); }, 128, 128),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  // a kitchen-like reflection map with window strips and bulbs, so the faces and bevels show crisp reflections
  const es = new THREE.Scene(), bm = (c) => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide });
  es.add(mesh(new THREE.SphereGeometry(20, 24, 12), new THREE.MeshBasicMaterial({ color: '#2a1c12', side: THREE.BackSide })));
  es.add(mesh(new THREE.PlaneGeometry(60, 60), bm(lin('#7a4a22')), 0, -3, 0, { rx: -Math.PI / 2 }));
  [[-14, 6, 6, 8, 10, '#fff4e0'], [-14, 6, -6, 3, 10, '#fff0d8'], [8, 9, -14, 12, 3, '#ffe2b8'], [0, 18, 0, 10, 10, '#a08060'], [10, 3, 12, 6, 2, '#ffd8a8'], [14, 5, 0, 4, 8, '#e8f0ff'], [-4, 4, 15, 5, 3, '#ffffff'], [3, 2, -16, 2, 2, '#ffb070'], [-9, 2, -13, 2, 2, '#ffb070']].forEach(([x, y, z, w, h, c]) => { const m = mesh(new THREE.PlaneGeometry(w, h), bm(lin(c).multiplyScalar(2.2)), x, y, z); m.lookAt(0, 0, 0); es.add(m); });
  const pm = new THREE.PMREMGenerator(r3().r), env = pm.fromScene(es, 0.01).texture; pm.dispose(); shell.envMap = env; cores.concat(backs).forEach((m) => { m.envMap = env; m.envMapIntensity = 1.4; });
  return (MC_SM = { cores, backs, shell, star }); }
function mcSaltGrain(par, e, seed, M, rich) { const g = new THREE.Group(), R = RNG('salt' + seed); par.add(g); g.sp = [];
  const bg = new THREE.BoxGeometry(e * 0.97, e * 0.97, e * 0.97), cb = mesh(bg, M.backs[seed % 3], 0, e / 2, 0, { cast: false }), cf = mesh(bg, M.cores[seed % 3], 0, e / 2, 0); cb.renderOrder = 1; cf.renderOrder = 1.5; g.add(cb, cf);
  const sh = mesh(mcRB(e, e, e, e * 0.03), M.shell, 0, e / 2, 0, { cast: false }); sh.renderOrder = 2; g.add(sh);
  if (rich) { const em = new THREE.MeshBasicMaterial({ color: '#fff6e8', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }), a = e * 0.493, L = e * 0.86;
    [[0, 1, 1, 'x'], [-1, 1, 0, 'z'], [-1, 0, 1, 'y']].forEach(([sx, sy, sz, ax]) => {
      const m = mesh(new THREE.CylinderGeometry(e * 0.004, e * 0.004, L, 6), em, sx * a, sy ? e * 0.993 : e / 2, sz * a, { cast: false }); if (ax === 'x') m.rotation.z = Math.PI / 2; if (ax === 'z') m.rotation.x = Math.PI / 2; m.renderOrder = 3; g.add(m); }); }
  // sparkle points on the bevelled top edges / corners
  const ns = rich ? 7 : 2; for (let k = 0; k < ns; k++) { const sp = new THREE.Sprite(M.star), cx = R.pick([-1, 1]), cz = R.pick([-1, 1]), u = R.r(-0.9, 0.9), alongX = R.f() < 0.5;
    sp.position.set((alongX ? u : cx) * e * 0.5, e * (R.f() < 0.75 ? 0.995 : R.r(0.2, 0.95)), (alongX ? cz : u) * e * 0.5); sp.renderOrder = 4; sp.ph = R.r(0, TAU); sp.sz = e * R.r(0.07, 0.16); g.add(sp); g.sp.push(sp); }
  return g; }
function mcSaltStage() { return once('mcsalt', () => { const sun = dirV(32 * DEG, 30 * DEG);
  const st = mcStage({ hemi: 0.25, sky: '#ffe2bc', ground: '#5a3a22', key: 3.7, keyCol: '#ffd9a8', box: 12, boxFar: 120, sunDist: 40, fog: '#4a3020', fogNear: 18, fogFar: 120, sun, target: mcV3(2, 0, -4), env: ['#20160e', '#ffd0a0', '#fff2d8'], back: ['#4a2c18', '#6a4026', '#140c08', '#ffd49a'], bokeh: 2.4 }), S = { st }, R = RNG('mcsaltS');
  const fill = new THREE.DirectionalLight('#ffe4c4', 1.1); fill.position.set(-14, 5, 3); st.scene.add(fill);
  const rim = new THREE.PointLight('#ffcf90', 2.5, 30, 1.5); rim.position.set(4, 8, -14); st.scene.add(rim);
  // oiled oak counter seen at 60 µm per unit: fibre grooves, pores, scratches
  const ct = g3Tex((x, w, h) => { const Q = RNG('mcoak'); x.fillStyle = '#a8703c'; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 220; k++) { const y = Q.r(0, h); x.strokeStyle = Q.pick(['rgba(120,70,30,0.5)', 'rgba(200,140,80,0.35)', 'rgba(90,50,20,0.45)', 'rgba(230,170,100,0.25)']); x.lineWidth = Q.r(1, 7); x.beginPath(); x.moveTo(0, y); for (let i = 1; i <= 16; i++) x.lineTo(i * w / 16, y + Math.sin(i * 0.7 + k) * 3 + Q.n(1.5)); x.stroke(); }
    for (let k = 0; k < 500; k++) { x.fillStyle = Q.pick(['rgba(60,30,10,0.7)', 'rgba(80,45,20,0.6)']); x.beginPath(); x.ellipse(Q.r(0, w), Q.r(0, h), Q.r(2, 9), Q.r(0.8, 2.2), 0, 0, TAU); x.fill(); }
    x.strokeStyle = 'rgba(255,230,190,0.3)'; for (let k = 0; k < 30; k++) { x.lineWidth = Q.r(0.5, 1.4); x.beginPath(); const x0 = Q.r(0, w), y0 = Q.r(0, h), a = Q.r(0, TAU), l = Q.r(60, 400); x.moveTo(x0, y0); x.lineTo(x0 + Math.cos(a) * l, y0 + Math.sin(a) * l); x.stroke(); } }, 1024, 1024);
  const cg = new THREE.PlaneGeometry(240, 240, 300, 300).rotateX(-Math.PI / 2), cpa = cg.attributes.position;
  for (let i = 0; i < cpa.count; i++) { const x = cpa.getX(i), z = cpa.getZ(i); cpa.setY(i, 0.03 * Math.sin(z * 2.2 + Math.sin(x * 0.15) * 2) + 0.012 * Math.sin(z * 7.3 + x * 0.2) + 0.02 * Math.sin(x * 0.9) * Math.sin(z * 0.6)); } cg.computeVertexNormals();
  st.scene.add(mesh(cg, PHYm({ map: wrap(ct, 14, 14), roughness: 0.6, clearcoat: 0.3, clearcoatRoughness: 0.4 }), 0, 0, -60, { cast: false }));
  const M = mcSaltMats();
  S.big = mcSaltGrain(st.scene, 4.8, 1, M, true); S.big.position.set(2.2, 0, -5.4); S.big.rotation.y = 0.3;
  S.grains = [S.big];
  [[-4.6, -7.5, 1.6, 0.8], [6.8, -9.5, 2.2, -0.4], [-1.8, -13, 1.9, 0.2], [9, -18, 2.8, 0.6], [-8.5, -15, 1.4, 1.1], [6.2, -2.5, 0.7, 0.5], [-5.5, -4.0, 0.5, 0.9], [-12, -30, 3.4, 0.3], [13, -32, 3.0, 0.9], [-0.6, -24, 2.6, 0.7]].forEach(([x, z, e, ry], i) => { const gg = mcSaltGrain(st.scene, e, 10 + i, M, false); gg.position.set(x, 0, z); gg.rotation.y = ry; S.grains.push(gg); });
  // tiny chipped salt fragments and bits of dust/crumb on the wood
  const fg = new THREE.BoxGeometry(1, 1, 1), frag = IM(fg, PHYm({ color: '#f2f6f6', roughness: 0.25, clearcoat: 1, emissive: lin('#2a2420') }), 160, true);
  for (let i = 0; i < 160; i++) { let x = R.r(-12, 14), z = R.r(-28, 3.5); if (z > 0.6 && x > -3 && x < 0.6) z -= 3; const s = R.r(0.04, 0.22); frag.setMatrixAt(i, M4c(x, s * 0.45, z, R.r(0, 6), s, s * R.r(0.7, 1), s * R.r(0.7, 1.2), R.n(0.1), R.n(0.1))); } st.scene.add(frag);
  const dust = IM(lumpyGeo(2, 0.4, 7), STDm({ color: '#7a5a3a', roughness: 0.95 }), 90, true); for (let i = 0; i < 90; i++) { let x = R.r(-14, 14), z = R.r(-30, 3); if (z > 0.6 && x > -3 && x < 0.6) z -= 3; const s = R.r(0.03, 0.16); dust.setMatrixAt(i, M4c(x, s * 0.3, z, R.r(0, 6), s, s * 0.6, s)); } st.scene.add(dust);
  st.scene.add(mesh(mcTube((u) => [-14 + 24 * u, 0.1, -17 - 4 * u + Math.sin(u * 9) * 0.8], () => 0.1, 160, 8), STDm({ color: '#d8cbb8', roughness: 0.9 })));
  // sharp caustic: light focused through the grain lands beside its shadow, with a faint rainbow fringe
  const cau = g3Tex((x, w, h) => { const Q = RNG('mccau'), P = []; for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) P.push([(i + 0.5 + Q.n(0.3)) * w / 9, (j + 0.5 + Q.n(0.3)) * h / 9]);
    const draw = (col, dx, lw) => { x.strokeStyle = col; x.lineWidth = lw; x.shadowColor = col; x.shadowBlur = 6; P.forEach(([px, py], k) => { const q = P[(k + 1) % P.length], r = P[(k + 9) % P.length]; [q, r].forEach(([qx, qy]) => { if (Math.hypot(qx - px, qy - py) > w / 5) return; x.beginPath(); x.moveTo(px + dx, py); x.quadraticCurveTo((px + qx) / 2 + Q.n(10) + dx, (py + qy) / 2 + Q.n(10), qx + dx, qy); x.stroke(); }); }); };
    x.globalCompositeOperation = 'lighter'; draw('rgba(255,120,160,0.5)', -3, 3); draw('rgba(120,200,255,0.5)', 3, 3); draw('rgba(255,250,230,1)', 0, 2.2);
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.3); g.addColorStop(0, 'rgba(255,248,230,0.85)'); g.addColorStop(1, 'rgba(255,240,210,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'destination-in'; const m = x.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w / 2); m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = m; x.fillRect(0, 0, w, h); }, 512, 512);
  S.cau = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: cau, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 1, color: '#fff0d8' }));
  S.cau.position.set(0.9, 0.05, -1.6); S.cau.rotation.y = 0.75; st.scene.add(S.cau);
  // the milk drop far behind (the next shot): a big glossy white dome
  st.scene.add(mesh(new THREE.SphereGeometry(28, 64, 32, 0, TAU, 0, Math.PI / 2), PHYm({ color: '#f6f2ea', roughness: 0.08, clearcoat: 1, sheen: 0.6, sheenColor: lin('#fffaf0') }), -30, -2, -80, { s: [1, 0.55, 1] }));
  S.girl = makeGirl(st); return S; }); }
SHOT_FN.salt = (lt, dur, t) => { const S = mcSaltStage(), st = S.st, h = mcH(lt), yaw = Math.PI / 2 - 0.45, d = mcWalk(lt, 0.45), xg = -2.0 + Math.sin(yaw) * d, zg = 1.4 + Math.cos(yaw) * d;
  placeGirl(S.girl, xg, 0, zg, h, { yaw, walk: 0.85, ph: t * 6.2, headYaw: 0.15, headPitch: -0.5, look: [-0.3, 0.5], emo: { surprise: 0.6 } });
  S.grains.forEach((g) => g.sp.forEach((sp) => { const k = Math.pow(0.5 + 0.5 * Math.sin(t * 3.1 + sp.ph * 3), 3); sp.scale.setScalar(sp.sz * (0.4 + 1.1 * k)); }));
  const cp = [xg - 0.5, 0.5, zg + 5.0 - 0.95 * lt], tg = [xg * 0.6 + 1.0, 2.0, -6];
  camPt(st, cp, tg, 48, t, 0.5, 13); renderStage(st, 0.9); bloom(0.18); mcDof(-400, 1600, 300, 6); };
