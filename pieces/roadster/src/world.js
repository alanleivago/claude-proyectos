// =====================================================================
//  WORLD — a dusk test track in three.js (styles/pov3d/three.js, r149), rendered offscreen and drawn under the HUD.
//  x runs along the road, y is up, z is across. The loop rises from x = 0 (radius LR, in the x-y plane), turns over
//  at the top and continues as an inverted CEILING deck back over the road (x from 0 to -CL at y = 2·LR), under a
//  truss gantry. trackPose(s) gives the car's pose at arc length s (s < 0 = the road before the loop).
// =====================================================================
THREE.ColorManagement.legacyMode = false;
const lin = (h) => new THREE.Color(h);
const LR = 12, CL = 34, DW = 7.5, DT = 0.8;          // loop radius, ceiling length, deck width, deck thickness
const LOOP_LEN = Math.PI * LR, TRACK_END = LOOP_LEN + CL;
function g3Tex(draw, w = 256, h = 256, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: lin(c), roughness: o.r ?? 0.8, metalness: o.m ?? 0, map: o.map ?? null, emissive: lin(o.em ?? '#000000'), emissiveIntensity: o.ei ?? 1, side: o.side ?? THREE.FrontSide, transparent: o.tr ?? false, opacity: o.op ?? 1, envMapIntensity: o.env ?? 1 });
const basic = (c, o = {}) => new THREE.MeshBasicMaterial({ color: lin(c), transparent: o.tr ?? false, opacity: o.op ?? 1, depthWrite: o.dw ?? true, side: o.side ?? THREE.FrontSide, map: o.map ?? null, toneMapped: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending });
function mesh(geo, mat, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz;
  if (o.s) m.scale.set(...o.s); m.castShadow = o.cast ?? true; m.receiveShadow = o.recv ?? true; return m;
}
const hexMix = (a, b, t) => { const h = (c, i) => parseInt(c.slice(i, i + 2), 16); return '#' + [1, 3, 5].map((i) => Math.round(lerp(h(a, i), h(b, i), t)).toString(16).padStart(2, '0')).join(''); };

// ---- the track: pose at arc length s → { p, t (forward), n (the car's up) }
function trackPose(s) {
  if (s <= 0) return { p: new THREE.Vector3(s, 0, 0), t: new THREE.Vector3(1, 0, 0), n: new THREE.Vector3(0, 1, 0) };
  if (s <= LOOP_LEN) { const th = s / LR; return { p: new THREE.Vector3(LR * Math.sin(th), LR - LR * Math.cos(th), 0), t: new THREE.Vector3(Math.cos(th), Math.sin(th), 0), n: new THREE.Vector3(-Math.sin(th), Math.cos(th), 0) }; }
  return { p: new THREE.Vector3(-(s - LOOP_LEN), 2 * LR, 0), t: new THREE.Vector3(-1, 0, 0), n: new THREE.Vector3(0, -1, 0) };
}
// place a car group at a pose (forward = t, up = n), lifted along n by h
const _mb = new THREE.Matrix4(), _z = new THREE.Vector3();
function poseCar(car, P, h = 0) {
  _z.crossVectors(P.t, P.n); _mb.makeBasis(P.t, P.n, _z);
  car.quaternion.setFromRotationMatrix(_mb); car.position.copy(P.p).addScaledVector(P.n, h);
}

// ---- textures
function texAsphalt(lines) {
  return g3Tex((x, w, h) => {
    x.fillStyle = '#34343a'; x.fillRect(0, 0, w, h); const R = RNG('asph');
    for (let i = 0; i < 9000; i++) { x.fillStyle = R.f() < 0.5 ? `rgba(20,20,24,${R.r(0.1, 0.3)})` : `rgba(110,110,118,${R.r(0.08, 0.2)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 3)); }
    if (lines) { x.fillStyle = '#e9e6dc'; x.fillRect(0, 10, w, 7); x.fillRect(0, h - 17, w, 7); x.fillStyle = '#e8b830'; for (let u = 0; u < w; u += 64) x.fillRect(u, h / 2 - 4, 36, 8); }
  }, 512, 256);
}
function texDesert() {
  return g3Tex((x, w, h) => {
    x.fillStyle = '#6e4a34'; x.fillRect(0, 0, w, h); const R = RNG('desert');
    for (let i = 0; i < 300; i++) { const px = R.r(0, w), py = R.r(0, h), s = R.r(20, 90), g = x.createRadialGradient(px, py, 0, px, py, s); const c = R.f() < 0.5 ? '120,80,56' : '72,46,34'; g.addColorStop(0, `rgba(${c},0.25)`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.fillRect(px - s, py - s, 2 * s, 2 * s); }
    for (let i = 0; i < 12000; i++) { x.fillStyle = R.f() < 0.5 ? `rgba(40,26,20,${R.r(0.1, 0.3)})` : `rgba(170,120,86,${R.r(0.08, 0.2)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 2.5), R.r(1, 2.5)); }
  }, 512, 512, [60, 60]);
}
function texBattery() {
  return g3Tex((x, w, h) => { x.fillStyle = '#2a6fd6'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(200,230,255,0.75)'; x.lineWidth = 3;
    for (let i = 1; i < 12; i++) { x.beginPath(); x.moveTo(i * w / 12, 0); x.lineTo(i * w / 12, h); x.stroke(); } for (let j = 1; j < 6; j++) { x.beginPath(); x.moveTo(0, j * h / 6); x.lineTo(w, j * h / 6); x.stroke(); } }, 256, 128);
}
function texSoft(c = '255,255,255') { return g3Tex((x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, `rgba(${c},1)`); g.addColorStop(0.4, `rgba(${c},0.55)`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.fillRect(0, 0, w, w); }, 128, 128); }

// ---- a swept deck along the loop + ceiling: inner (driving) surface gets the asphalt, the rest is concrete
function buildDeck(Tasph) {
  const N = 220, pos = [], uv = [], idx = [], pos2 = [], idx2 = [];
  const pt = [];
  for (let i = 0; i <= N; i++) { const s = (i / N) * TRACK_END, P = trackPose(s); pt.push({ s, P }); }
  pt.forEach(({ s, P }) => { const z = DW / 2; pos.push(P.p.x, P.p.y, -z, P.p.x, P.p.y, z); uv.push(s / 8, 0, s / 8, 1); });
  for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const top = new THREE.BufferGeometry(); top.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); top.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); top.setIndex(idx); top.computeVertexNormals();
  // the body: outer face + two sides, offset away from the driving side
  pt.forEach(({ P }) => { const o = P.p.clone().addScaledVector(P.n, -DT), z = DW / 2; pos2.push(P.p.x, P.p.y, -z, o.x, o.y, -z, o.x, o.y, z, P.p.x, P.p.y, z); });
  for (let i = 0; i < N; i++) { const a = i * 4, b = a + 4; for (const [p, q] of [[0, 1], [1, 2], [2, 3]]) idx2.push(a + p, b + p, a + q, a + q, b + p, b + q); }
  const body = new THREE.BufferGeometry(); body.setAttribute('position', new THREE.Float32BufferAttribute(pos2, 3)); body.setIndex(idx2); body.computeVertexNormals();
  const g = new THREE.Group();
  const tm = std('#ffffff', { map: Tasph, r: 0.85, side: THREE.DoubleSide }), bm = std('#a8998e', { r: 0.9, side: THREE.DoubleSide });
  const a = new THREE.Mesh(top, tm), b = new THREE.Mesh(body, bm); a.receiveShadow = b.receiveShadow = true; a.castShadow = b.castShadow = true; g.add(a, b);
  // orange edge strips along both rims of the driving surface
  const strip = std('#ff8a3c', { em: '#ff6a1c', ei: 0.8 });
  for (const zz of [-DW / 2 - 0.06, DW / 2 + 0.06]) { const sp = [], si = []; pt.forEach(({ P }) => { const o = P.p.clone().addScaledVector(P.n, -DT * 0.35); sp.push(P.p.x, P.p.y, zz, o.x, o.y, zz); }); for (let i = 0; i < N; i++) { const q = i * 2; si.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); } const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); sg.setIndex(si); sg.computeVertexNormals(); g.add(new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: lin('#ff8a3c'), side: THREE.DoubleSide, toneMapped: false }))); }
  return g;
}
// a truss beam from a to b: chords + verticals + diagonals as thin boxes (InstancedMesh), square section sz
function buildTruss(a, b, sz, step, mat) {
  const d = b.clone().sub(a), L = d.length(), n = Math.max(1, Math.round(L / step)), dir = d.clone().normalize();
  const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0), s1 = new THREE.Vector3().crossVectors(dir, up).normalize(), s2 = new THREE.Vector3().crossVectors(s1, dir).normalize();
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => s1.clone().multiplyScalar(u * sz / 2).addScaledVector(s2, v * sz / 2));
  const bars = [];
  for (const c of corners) bars.push([a.clone().add(c), b.clone().add(c)]);
  for (let i = 0; i <= n; i++) { const p = a.clone().addScaledVector(dir, (L * i) / n); for (let k = 0; k < 4; k++) bars.push([p.clone().add(corners[k]), p.clone().add(corners[(k + 1) % 4])]); }
  for (let i = 0; i < n; i++) { const p = a.clone().addScaledVector(dir, (L * i) / n), q = a.clone().addScaledVector(dir, (L * (i + 1)) / n); for (let k = 0; k < 4; k++) bars.push([p.clone().add(corners[k]), q.clone().add(corners[(k + 1) % 4])]); }
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, bars.length), m = new THREE.Matrix4(), q = new THREE.Quaternion(), X = new THREE.Vector3(1, 0, 0);
  bars.forEach(([p, r], i) => { const v = r.clone().sub(p); q.setFromUnitVectors(X, v.clone().normalize()); m.compose(p.clone().add(r).multiplyScalar(0.5), q, new THREE.Vector3(v.length(), 0.12, 0.12)); im.setMatrixAt(i, m); });
  im.castShadow = true; im.receiveShadow = false; return im;
}

// ---- cars: profile extrusions; x forward, y up, z across; wheels touch y = 0
function extrudeProfile(pts, depth, bevel) {
  const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 12 });
  g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return g;
}
// a rounded body from a curved side profile: the sides lean in toward the roof and the nose (tumblehome), so it is not a slab
function roundBody(draw, depth, bevel, tumble = 0.28, noseX = 1.5) {
  const sh = new THREE.Shape(); draw(sh);
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 20, steps: 1 });
  g.translate(0, 0, -depth / 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 - tumble * smooth(0.55, 1.3, y) - 0.16 * smooth(noseX, 2.4, x) - 0.1 * smooth(-1.6, -2.4, x); p.setZ(i, z * k); }
  g.computeVertexNormals(); return g;
}
function buildWheel(r, w, rimC) {
  const g = new THREE.Group(), tire = std('#16161a', { r: 0.9 }), rim = std(rimC, { r: 0.35, m: 0.35, env: 0.6 }), cal = std('#d23a2a', { r: 0.5 });
  g.add(mesh(new THREE.CylinderGeometry(r, r, w, 28), tire, 0, 0, 0, { rx: Math.PI / 2 }));
  g.add(mesh(new THREE.CylinderGeometry(r * 0.66, r * 0.66, w + 0.02, 24), std('#2a2a30', { r: 0.6 }), 0, 0, 0, { rx: Math.PI / 2 }));
  for (let k = 0; k < 5; k++) { const sp = mesh(new THREE.BoxGeometry(r * 1.2, r * 0.13, 0.04), rim, 0, 0, w / 2 + 0.01, { rz: (k / 5) * Math.PI }); g.add(sp); }
  g.add(mesh(new THREE.CylinderGeometry(r * 0.16, r * 0.16, w + 0.06, 12), rim, 0, 0, 0, { rx: Math.PI / 2 }));
  g.add(mesh(new THREE.BoxGeometry(r * 0.35, r * 0.5, 0.06), cal, r * 0.42, 0, w / 2 - 0.06));
  return g;
}
function buildRoadster() {
  const g = new THREE.Group(), body = new THREE.Group(), xr = new THREE.Group(); g.add(body, xr);
  const paint = std('#c9ced6', { r: 0.28, m: 0.55, env: 1.2, tr: true }), glass = std('#121822', { r: 0.08, m: 0.2, env: 1.6, tr: true }), trim = std('#1a1a1e', { r: 0.5 });
  const shell = roundBody((s) => { s.moveTo(-2.15, 0.32); s.lineTo(1.95, 0.32); s.quadraticCurveTo(2.32, 0.34, 2.28, 0.5); s.quadraticCurveTo(2.16, 0.66, 1.25, 0.76); s.quadraticCurveTo(0.2, 0.9, -0.9, 0.96); s.quadraticCurveTo(-1.95, 1.0, -2.2, 0.84); s.quadraticCurveTo(-2.32, 0.55, -2.15, 0.32); }, 1.62, 0.14, 0.22);
  const cab = roundBody((s) => { s.moveTo(0.9, 0.82); s.quadraticCurveTo(0.25, 1.3, -0.45, 1.29); s.quadraticCurveTo(-1.3, 1.25, -1.8, 0.93); s.lineTo(-0.9, 0.9); s.lineTo(0.9, 0.82); }, 1.22, 0.1, 0.35, 3);
  body.add(mesh(shell, paint), mesh(cab, glass));
  for (const z of [-0.9, 0.9]) body.add(mesh(new THREE.BoxGeometry(3.9, 0.12, 0.1), trim, 0, 0.36, z));             // sills
  body.add(mesh(new THREE.BoxGeometry(0.06, 0.06, 1.5), basic('#e8f4ff'), 2.23, 0.55, 0));                       // LED front bar
  body.add(mesh(new THREE.BoxGeometry(0.06, 0.07, 1.7), basic('#ff2a2a'), -2.3, 0.72, 0));                       // rear light bar
  body.add(mesh(new THREE.BoxGeometry(0.5, 0.05, 1.9), trim, -2.0, 0.98, 0));                                    // rear lip
  const wheels = []; for (const [x, z] of [[1.38, 0.86], [1.38, -0.86], [-1.36, 0.88], [-1.36, -0.88]]) { const w = buildWheel(0.37, 0.3, '#d6d9de'); w.position.set(x, 0.37, z); if (z < 0) w.rotation.y = Math.PI; g.add(w); wheels.push(w); }
  // x-ray parts
  const cy = std('#2fd6dc', { r: 0.4, em: '#0a6a70', ei: 0.6 }), dark = std('#22262c', { r: 0.6 });
  const P = {};
  P.edges = new THREE.LineSegments(new THREE.EdgesGeometry(shell, 25), new THREE.LineBasicMaterial({ color: lin('#8fe9f0'), transparent: true, opacity: 0, toneMapped: false })); xr.add(P.edges);
  P.ghostM = new THREE.MeshBasicMaterial({ color: lin('#6fe2ea'), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  P.ghost = new THREE.Mesh(shell, P.ghostM); xr.add(P.ghost);
  P.frame = new THREE.Group(); for (const z of [-0.55, 0.55]) P.frame.add(mesh(new THREE.BoxGeometry(4.0, 0.1, 0.12), dark, 0, 0.42, z)); for (const x of [-1.4, -0.4, 0.6, 1.5]) P.frame.add(mesh(new THREE.BoxGeometry(0.12, 0.1, 1.2), dark, x, 0.42, 0)); xr.add(P.frame);
  P.engine = new THREE.Group(); P.engine.add(mesh(new THREE.BoxGeometry(0.9, 0.5, 0.8), std('#c8352a', { r: 0.5 }), 1.25, 0.72, 0)); P.engine.add(mesh(new THREE.BoxGeometry(0.7, 0.12, 0.6), std('#5a5f66', { r: 0.4, m: 0.6 }), 1.25, 1.03, 0)); xr.add(P.engine);
  P.motors = new THREE.Group(); for (const x of [1.38, -1.36]) P.motors.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.6, 20), cy, x, 0.37, 0, { rx: Math.PI / 2 })); xr.add(P.motors);
  P.battery = mesh(new THREE.BoxGeometry(2.9, 0.14, 1.5), std('#ffffff', { map: texBattery(), r: 0.4, em: '#0b2a5a', ei: 0.5 }), -0.05, 0.47, 0); xr.add(P.battery);
  P.fans = []; const fanG = new THREE.Group(); for (const x of [0.75, -0.85]) { const f = new THREE.Group(); f.position.set(x, 0.2, 0); f.add(mesh(new THREE.TorusGeometry(0.58, 0.06, 8, 32), basic('#3fd0d6'), 0, 0, 0, { rx: Math.PI / 2 })); const rot = new THREE.Group(); for (let k = 0; k < 7; k++) rot.add(mesh(new THREE.BoxGeometry(1.05, 0.03, 0.16), basic('#8ff4f8'), 0, 0, 0, { ry: (k / 7) * Math.PI })); f.add(rot); f.userData.rot = rot; fanG.add(f); P.fans.push(f); } xr.add(fanG); P.fanG = fanG;
  P.skirts = new THREE.Group(); const sk = std('#0d0d10', { r: 0.95 }); P.skirts.add(mesh(new THREE.BoxGeometry(3.6, 0.2, 0.06), sk, 0, 0.22, 0.86), mesh(new THREE.BoxGeometry(3.6, 0.2, 0.06), sk, 0, 0.22, -0.86), mesh(new THREE.BoxGeometry(0.06, 0.2, 1.72), sk, 1.8, 0.22, 0), mesh(new THREE.BoxGeometry(0.06, 0.2, 1.72), sk, -1.8, 0.22, 0)); xr.add(P.skirts);
  P.tank = mesh(new THREE.CylinderGeometry(0.27, 0.27, 1.25, 24), std('#e8f2f6', { r: 0.25, m: 0.5, em: '#1a4a55', ei: 0.4 }), -0.75, 0.68, 0, { rz: Math.PI / 2 }); xr.add(P.tank);
  P.nozzles = new THREE.Group(); for (const z of [-0.5, 0, 0.5]) P.nozzles.add(mesh(new THREE.ConeGeometry(0.12, 0.3, 16, 1, true), std('#9aa2ac', { r: 0.3, m: 0.8, side: THREE.DoubleSide }), -2.32, 0.58, z, { rz: Math.PI / 2 })); g.add(P.nozzles);
  P.minis = new THREE.Group(); P.miniPts = [[1.9, 0.9, 0.95], [1.9, 0.9, -0.95], [-1.9, 0.95, 0.95], [-1.9, 0.95, -0.95], [0.3, 1.0, 1.0], [0.3, 1.0, -1.0], [1.9, 0.35, 0.95], [-1.9, 0.35, -0.95]];
  P.miniPts.forEach(([x, y, z]) => P.minis.add(mesh(new THREE.ConeGeometry(0.07, 0.16, 10), std('#8a929c', { r: 0.3, m: 0.8 }), x, y, z, { rx: z > 0 ? Math.PI / 2 : -Math.PI / 2 }))); g.add(P.minis);
  g.userData = { body, xr, paint, glass, wheels, P };
  return g;
}
function buildSedan(c) {   // the Toyota Corolla (generic sedan, red)
  const g = new THREE.Group(), paint = std(c, { r: 0.35, m: 0.35 }), glass = std('#141a22', { r: 0.1, m: 0.2, env: 1.4 });
  const sh = extrudeProfile([[-2.3, 0.36], [2.28, 0.36], [2.36, 0.62], [2.12, 0.8], [0.95, 0.88], [0.32, 1.34], [-1.15, 1.38], [-1.85, 0.98], [-2.36, 0.92]], 1.68, 0.1);
  const win = extrudeProfile([[0.86, 0.9], [0.32, 1.3], [-1.1, 1.33], [-1.72, 0.98]], 1.72, 0.03);
  g.add(mesh(sh, paint), mesh(win, glass));
  g.add(mesh(new THREE.BoxGeometry(0.06, 0.1, 1.4), basic('#fff6dc'), 2.36, 0.66, 0), mesh(new THREE.BoxGeometry(0.06, 0.1, 1.5), basic('#c01818'), -2.4, 0.8, 0));
  const wheels = []; for (const [x, z] of [[1.42, 0.84], [1.42, -0.84], [-1.4, 0.84], [-1.4, -0.84]]) { const w = buildWheel(0.36, 0.26, '#a8adb4'); w.position.set(x, 0.36, z); if (z < 0) w.rotation.y = Math.PI; g.add(w); wheels.push(w); }
  g.userData = { wheels }; return g;
}
function buildTruck() {
  const g = new THREE.Group(), w = std('#d9dce0', { r: 0.35, m: 0.4 }), d = std('#1b1d22', { r: 0.4 });
  g.add(mesh(extrudeProfile([[-2.6, 0.7], [2.2, 0.7], [2.6, 1.6], [2.4, 3.2], [1.0, 3.9], [-2.6, 3.9]], 2.5, 0.2), w));
  g.add(mesh(extrudeProfile([[2.25, 2.0], [2.42, 3.1], [1.05, 3.72], [0.9, 2.0]], 2.56, 0.03), d));
  for (const [x, z] of [[1.6, 1.2], [1.6, -1.2], [-1.6, 1.2], [-1.6, -1.2]]) g.add(mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 20), std('#16161a'), x, 0.55, z, { rx: Math.PI / 2 }));
  return g;
}
// an arrow (shaft + head) along +y, length L
function buildArrow(c, L = 2, r = 0.12) {
  const m = basic(c, { tr: true }), g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, L * 0.7, 12), m)); g.children[0].position.y = L * 0.35;
  g.add(new THREE.Mesh(new THREE.ConeGeometry(r * 2.6, L * 0.3, 16), m)); g.children[1].position.y = L * 0.85;
  g.userData.mat = m; return g;
}

let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(45, W / H, 0.3, 4000); scene.add(cam);
  const HOR = '#f08a5a';
  scene.fog = new THREE.Fog(lin('#b0607a'), 160, 1100);
  // sky: navy top → violet → hot horizon, a low sun glow behind the loop
  const SUN = new THREE.Vector3(-0.35, 0.03, -1).normalize();
  const skyM = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
    uniforms: { top: { value: lin('#11163a') }, mid: { value: lin('#5a3a7e') }, low: { value: lin('#d0607a') }, hor: { value: lin(HOR) }, sun: { value: SUN } },
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, mid, low, hor, sun; varying vec3 vD;
      void main(){ vec3 d = normalize(vD); float h = d.y;
        vec3 c = mix(hor, low, smoothstep(0.0, 0.08, h)); c = mix(c, mid, smoothstep(0.06, 0.3, h)); c = mix(c, top, smoothstep(0.28, 0.75, h));
        if (h < 0.0) c = mix(hor, vec3(0.25, 0.12, 0.12), smoothstep(0.0, -0.2, h));
        float a = max(dot(d, sun), 0.0); c += vec3(1.0, 0.62, 0.35) * (pow(a, 40.0) * 0.8 + pow(a, 6.0) * 0.18);
        gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }` });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(2500, 48, 24), skyM); scene.add(sky);
  { const pm = new THREE.PMREMGenerator(r), es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyM)); scene.environment = pm.fromScene(es, 0.02).texture; }
  // lights
  scene.add(new THREE.HemisphereLight(0x9b8ad0, 0x5a3424, 0.8));
  const under = new THREE.DirectionalLight(0xff9a7a, 0.55); under.position.set(20, -60, 50); scene.add(under);
  const key = new THREE.DirectionalLight(0xffc89a, 1.6); key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 3; key.shadow.bias = -0.0003; key.shadow.normalBias = 0.03;
  Object.assign(key.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 400 }); scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xff8aa0, 0.6); rim.position.copy(SUN).multiplyScalar(200).setY(30); scene.add(rim);
  // ground, road, pads
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), std('#ffffff', { map: texDesert(), r: 1 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const Tasph = texAsphalt(true); Tasph.wrapS = Tasph.wrapT = THREE.RepeatWrapping; Tasph.repeat.set(1, 1);
  const Troad = texAsphalt(true); Troad.wrapS = THREE.RepeatWrapping; Troad.repeat.set(40, 1);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(320, 10), std('#ffffff', { map: Troad, r: 0.85 })); road.rotation.x = -Math.PI / 2; road.position.set(-140, 0.06, 0); road.material.polygonOffset = true; road.material.polygonOffsetFactor = -2; road.receiveShadow = true; scene.add(road);
  const Tpad = texAsphalt(false); Tpad.wrapS = Tpad.wrapT = THREE.RepeatWrapping; Tpad.repeat.set(6, 3);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(70, 22), std('#ffffff', { map: Tpad, r: 0.9 })); pad.rotation.x = -Math.PI / 2; pad.position.set(-70, 0.04, -20); pad.material.polygonOffset = true; pad.material.polygonOffsetFactor = -1; pad.receiveShadow = true; scene.add(pad);
  // the loop + ceiling deck, truss gantry and towers, the speed sign
  scene.add(buildDeck(Tasph));
  const steel = std('#8f949c', { r: 0.45, m: 0.7 });
  const TY = 2 * LR + DT + 0.4;
  for (const z of [-3.2, 3.2]) scene.add(buildTruss(new THREE.Vector3(-CL - 6, TY + 1.6, z), new THREE.Vector3(LR + 6, TY + 1.6, z), 2.2, 2.4, steel));
  for (const x of [-CL - 6, LR + 6]) for (const z of [-3.2, 3.2]) scene.add(buildTruss(new THREE.Vector3(x, 0, z), new THREE.Vector3(x, TY + 2.7, z), 1.6, 2.2, steel));
  for (let x = -CL; x <= 0; x += 4) for (const z of [-2.6, 2.6]) scene.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6), steel, x, TY + 0.4, z));   // hangers
  const signC = document.createElement('canvas'); signC.width = 256; signC.height = 128; const signT = new THREE.CanvasTexture(signC); signT.encoding = THREE.sRGBEncoding;
  const sign = new THREE.Group(); sign.add(mesh(new THREE.BoxGeometry(4.4, 2.4, 0.4), std('#121216', { r: 0.5 }))); const face = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.0), basic('#ffffff', { map: signT })); face.position.z = 0.21; sign.add(face); sign.position.set(LR + 6, 16, 4.6); scene.add(sign);
  // barriers along the road, cones, light poles
  const jersey = extrudeProfile([[-0.35, 0], [0.35, 0], [0.18, 0.25], [0.12, 0.85], [-0.12, 0.85], [-0.18, 0.25]], 2.9, 0.02); jersey.rotateY(Math.PI / 2);
  const barM = std('#e7e2d8', { r: 0.8 }), bars = new THREE.InstancedMesh(jersey, barM, 200); let bi = 0; const m4 = new THREE.Matrix4();
  for (let x = -230; x < -2; x += 3) for (const z of [-6.2, 6.2]) { if (z < 0 && x > -106 && x < -34) continue; if (bi < 200) bars.setMatrixAt(bi++, m4.makeTranslation(x, 0, z)); }
  bars.count = bi; bars.castShadow = bars.receiveShadow = true; scene.add(bars);
  const cones = new THREE.InstancedMesh(new THREE.ConeGeometry(0.22, 0.7, 12), std('#ff6a1a', { r: 0.6 }), 40); { const R = RNG('cones'); for (let i = 0; i < 40; i++) cones.setMatrixAt(i, m4.makeTranslation(R.r(-120, 20), 0.35, R.f() < 0.5 ? R.r(7.5, 9) : -R.r(7.5, 9))); } cones.castShadow = true; scene.add(cones);
  const poleM = std('#3a3c42', { r: 0.6 }), lampM = basic('#fff1cc');
  for (let x = -200; x < 60; x += 36) for (const z of [-12, 12]) { scene.add(mesh(new THREE.CylinderGeometry(0.15, 0.2, 12, 8), poleM, x, 6, z)); scene.add(mesh(new THREE.BoxGeometry(2.4, 0.5, 0.8), poleM, x, 12.2, z)); scene.add(mesh(new THREE.BoxGeometry(2.2, 0.12, 0.6), lampM, x, 11.92, z, { cast: false })); }
  // the parking pad: parked cars and a truck
  const parked = []; { const R = RNG('parked'), cols = ['#2850c8', '#b8202a', '#16181c', '#e8e8ea', '#5a6470', '#2a2c30']; for (let i = 0; i < 9; i++) { const c = buildSedan(cols[i % cols.length]); c.position.set(-98 + i * 6.2, 0, -24); c.rotation.y = Math.PI / 2 + R.n(0.04); scene.add(c); parked.push(c); } }
  const truck = buildTruck(); truck.position.set(-44, 0, -22); truck.rotation.y = Math.PI / 2; scene.add(truck);
  // the grandstand and its crowd
  const stand = new THREE.Group(); for (let k = 0; k < 7; k++) stand.add(mesh(new THREE.BoxGeometry(150, 0.8, 2.2), std('#575a62', { r: 0.8 }), -50, 0.4 + k * 0.8, 34 + k * 2.2)); scene.add(stand);
  const crowd = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.28, 0.7, 3, 8), std('#ffffff', { r: 0.8 }), 1400); crowd.userData.base = []; { const R = RNG('crowd'), c = new THREE.Color(), pal = ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#f4f1ea', '#7b4fc9', '#ef8a3a', '#1f2d3d', '#9a9a9a'];
    for (let i = 0; i < 1400; i++) { const k = R.i(0, 6), p = [R.r(-124, 24), 1.4 + k * 0.8, 34.6 + k * 2.2 + R.n(0.3)]; crowd.setMatrixAt(i, m4.makeTranslation(...p)); crowd.setColorAt(i, c.set(R.pick(pal))); crowd.userData.base.push(p); } }
  crowd.castShadow = false; scene.add(crowd);
  // desert scatter: rocks, shrubs, far mountains
  const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), std('#5e3e2e', { r: 1 }), 260), shrubs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), std('#4f5a34', { r: 1 }), 260);
  { const R = RNG('scatter'), q = new THREE.Quaternion(), e = new THREE.Euler(); for (let i = 0; i < 260; i++) { let x, z; do { x = R.r(-420, 260); z = R.r(-300, 300); } while (Math.abs(z) < 16 || (z < -10 && z > -36 && x > -110 && x < -30) || (z > 28 && z < 52 && x > -128 && x < 28));
    const s = R.r(0.4, 2.2); rocks.setMatrixAt(i, m4.compose(new THREE.Vector3(x, s * 0.3, z), q.setFromEuler(e.set(R.r(0, 3), R.r(0, 3), 0)), new THREE.Vector3(s, s * 0.6, s)));
    const x2 = R.r(-420, 260), z2 = (R.f() < 0.5 ? -1 : 1) * R.r(18, 300), s2 = R.r(0.5, 1.4); shrubs.setMatrixAt(i, m4.compose(new THREE.Vector3(x2, s2 * 0.5, z2), q.identity(), new THREE.Vector3(s2, s2 * 0.7, s2))); } }
  rocks.castShadow = shrubs.castShadow = true; scene.add(rocks, shrubs);
  { const pts = [], idx = [], R = RNG('mtn'), N = 120; for (let i = 0; i <= N; i++) { const a = (i / N) * TAU, rr = 1300, h = 40 + 70 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.13)) + R.r(0, 30); pts.push(Math.cos(a) * rr, -2, Math.sin(a) * rr, Math.cos(a) * rr, h, Math.sin(a) * rr); }
    for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); mg.setIndex(idx); mg.computeVertexNormals();
    scene.add(new THREE.Mesh(mg, new THREE.MeshBasicMaterial({ color: lin('#4a2a4a'), side: THREE.DoubleSide, fog: true }))); }
  // clouds: soft pink puffs low in the sky
  const cloudT = texSoft('255,200,210'), clouds = []; { const R = RNG('clouds'); for (let i = 0; i < 18; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudT, transparent: true, opacity: R.r(0.18, 0.35), depthWrite: false, fog: false })); const a = R.r(0, TAU), d = R.r(600, 1400); s.position.set(Math.cos(a) * d, R.r(90, 320), Math.sin(a) * d); const w = R.r(300, 700); s.scale.set(w, w * 0.28, 1); scene.add(s); clouds.push(s); } }

  // the hero and the Corolla
  const hero = buildRoadster(); scene.add(hero);
  const corolla = buildSedan('#c4161c'); scene.add(corolla);
  // effects: puffs (soft white sprites), arrows, contact glows, the balloon
  const puffT = texSoft(), puffs = Array.from({ length: 260 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; scene.add(s); return s; });
  const arrows = Array.from({ length: 24 }, (_, i) => { const a = buildArrow(i < 4 ? '#f2b632' : i < 20 ? '#7ec8ff' : '#3fd0d6'); a.visible = false; scene.add(a); return a; });
  const glowT = texSoft('90,255,140'), glows = Array.from({ length: 4 }, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: glowT, transparent: true, depthWrite: false, toneMapped: false, opacity: 0, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); return m; });
  const balloon = new THREE.Group(); balloon.add(mesh(new THREE.SphereGeometry(0.45, 24, 18), std('#e8262a', { r: 0.25, m: 0.1 }), 0, 0, 0, { s: [1, 1.2, 1] })); balloon.add(mesh(new THREE.ConeGeometry(0.08, 0.14, 8), std('#c01818'), 0, -0.56, 0, { rx: Math.PI })); balloon.visible = false; scene.add(balloon);
  G = { r, cv, scene, cam, key, crowd, sign, signC, signT, hero, corolla, puffs, arrows, glows, balloon, SUN };
  return G;
}

// ---- per-frame helpers
let PI_ = 0, RNOW = 0;
function resetWorld() {
  const g = g3(); PI_ = 0;
  g.puffs.forEach((p) => (p.visible = false)); g.arrows.forEach((a) => (a.visible = false)); g.glows.forEach((m) => (m.visible = false)); g.balloon.visible = false;
  g.hero.visible = true; g.corolla.visible = false; xray(0, {});
  spinWheels(g.hero, 0); spinWheels(g.corolla, 0); g.hero.userData.P.fans.forEach((f) => (f.userData.rot.rotation.y = 0));   // nothing carries over between frames
}
// x-ray state of the hero: u = how see-through the body is; parts = { frame, engine, motors, battery, fans, skirts, tank } 0..1
function xray(u, parts) {
  const h = g3().hero.userData, P = h.P;
  h.paint.opacity = 1 - 0.88 * u; h.glass.opacity = 1 - 0.85 * u; h.paint.depthWrite = h.glass.depthWrite = u < 0.5;
  P.ghostM.opacity = 0.10 * u; P.edges.material.opacity = 0.75 * u; P.edges.visible = P.ghost.visible = u > 0;
  for (const k of ['frame', 'engine', 'motors', 'battery', 'skirts', 'tank']) { const v = parts[k] ?? 0; P[k].visible = v > 0; P[k].scale.setScalar(Math.max(0.001, k === 'battery' || k === 'skirts' ? 1 : v)); if (k === 'battery') P[k].position.x = -0.05 - (1 - v) * 3.5; }
  P.fanG.visible = (parts.fans ?? 0) > 0; P.fanG.scale.setScalar(Math.max(0.001, parts.fans ?? 0));
}
function spinWheels(car, dist) { car.userData.wheels.forEach((w) => { w.rotation.z = -dist / 0.37; }); }
// a soft puff at world point p, size s, opacity a
function puff(p, s, a, c = '#ffffff') { const g = g3(), q = g.puffs[PI_++]; if (!q || a <= 0) return; q.visible = true; q.position.copy(p); q.scale.set(s, s, 1); q.material.opacity = clamp(a); q.material.color.set(c); }
// an arrow from a toward direction d (world), length L
const _Y = new THREE.Vector3(0, 1, 0);
function arrowAt(i, a, d, L, op = 1) { const ar = g3().arrows[i]; if (!ar || op <= 0) return; ar.visible = true; ar.position.copy(a); ar.quaternion.setFromUnitVectors(_Y, d.clone().normalize()); ar.scale.set(L / 2, L / 2, L / 2); ar.userData.mat.opacity = clamp(op); }
function camKeys(R, keys) {
  let i = 0; while (i < keys.length - 2 && R > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1] ?? a, u = b === a ? 0 : EZ.io(seg(R, a[0], b[0]));
  const L = (p, q) => p.map((v, k) => lerp(v, q[k], u));
  return { pos: L(a[1], b[1]), tgt: L(a[2], b[2]), fov: lerp(a[3], b[3], u) };
}
function setCam(c, sway = 1) {
  const g = g3(), R = RNOW, s = sway * 0.08, sx = Math.sin(R * 0.7) * s, sy = Math.sin(R * 0.53 + 1) * s * 0.6;
  g.cam.position.set(c.pos[0] + sx, c.pos[1] + sy, c.pos[2]); g.cam.fov = c.fov; g.cam.updateProjectionMatrix();
  g.cam.lookAt(c.tgt[0] + sx * 0.5, c.tgt[1] + sy * 0.5, c.tgt[2]); g.cam.updateMatrixWorld();
}
// a camera that follows a moving point: offset from it and look at it
const follow = (p, off, fov, look = [0, 0, 0]) => ({ pos: [p.x + off[0], p.y + off[1], p.z + off[2]], tgt: [p.x + look[0], p.y + look[1], p.z + look[2]], fov });
const mixCam = (a, b, u) => ({ pos: a.pos.map((v, k) => lerp(v, b.pos[k], u)), tgt: a.tgt.map((v, k) => lerp(v, b.tgt[k], u)), fov: lerp(a.fov, b.fov, u) });
function lightOn(x, y, z) { const g = g3(); g.key.target.position.set(x, y, z); g.key.position.set(x + 60, y + 90, z + 70); g.key.target.updateMatrixWorld(); }
function speedSign(v) {
  const g = g3(), x = g.signC.getContext('2d'); x.fillStyle = '#0b0b0d'; x.fillRect(0, 0, 256, 128);
  x.fillStyle = '#ff7a2a'; x.font = `700 22px ${S3.font}`; x.fillText('VELOCIDAD', 16, 30);
  x.font = `700 78px ${S3.font}`; x.textAlign = 'right'; x.fillText(String(Math.round(v)).padStart(2, '0'), 200, 108); x.textAlign = 'left'; x.font = `700 22px ${S3.font}`; x.fillText('km/h', 204, 108);
  g.signT.needsUpdate = true;
}
// the crowd celebrating: everyone jumps on their own beat, a little squash on landing (u = how excited, 0..1)
function cheer(u) {
  const c = g3().crowd, m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), v = new THREE.Vector3();
  c.userData.base.forEach((p, i) => { const Rn = RNG('cheer', i), ph = Rn.f() * TAU, f = Rn.r(2.2, 3.4), on = Rn.f() < 0.85 ? 1 : 0.2, j = Math.max(0, Math.sin(RNOW * f * Math.PI + ph)) * u * on;
    const sq = 1 - 0.12 * u * on * Math.max(0, -Math.sin(RNOW * f * Math.PI + ph)); m.compose(v.set(p[0], p[1] + j * 0.9, p[2]), q, sc.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq))); c.setMatrixAt(i, m); });
  c.instanceMatrix.needsUpdate = true;
}
function renderWorld(a = 1) { const g = g3(); g.r.render(g.scene, g.cam); ctx.save(); screen(); ctx.globalAlpha = a; ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore(); }
const P2 = (v) => s3Proj(v, g3().cam);
const hpt = (x, y, z) => { const h = g3().hero; h.updateMatrixWorld(); return new THREE.Vector3(x, y, z).applyMatrix4(h.matrixWorld); };
