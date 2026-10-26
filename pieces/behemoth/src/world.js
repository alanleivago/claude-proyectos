// =====================================================================
//  WORLD — the summit of Mauna Kea at night: tephra slopes, cinder cones, snow patches, a dirt road, observatory domes
//  (rotating, with slits, catwalks, doors), the uncle (parka, thermos), a pickup, a sea of clouds below with billows,
//  stars and a moon. The Behemoth: a pale iguana head the size of a mountain (peeling scales, black lidless eyes,
//  jagged teeth, a crest), a long neck sinking into the clouds, and a hand that grips the summit. Tourists for the end.
// =====================================================================
let R3 = null, WJ = null;
function rend() {
  if (R3) return R3;
  const cv = document.createElement('canvas'); cv.width = YK.LW; cv.height = YK.LH;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: false, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
  r.setPixelRatio(1); r.setSize(YK.LW, YK.LH, false); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  R3 = { cv, r }; return R3;
}
// the summit: a plateau (0..~14 m of cinder cones) whose edge falls to the cloud sea beyond r ≈ 110
const CONES = [[-75, -40, 26, 16], [70, -85, 30, 18], [85, 10, 24, 14], [-95, 30, 28, 10]];
function th(x, z) {
  const r = Math.hypot(x, z * 1.15), n = fbm2(x * 0.03, z * 0.03) - 0.5, nn = fbm2(x * 0.15, z * 0.15) - 0.5;
  let h = 4 + n * 8 + nn * 1.2;
  CONES.forEach(([cx, cz, rr, hh]) => { const d = Math.hypot(x - cx, z - cz) / rr; h += d < 1 ? hh * (1 - d * d) * (d > 0.35 ? 1 : 0.6 + 0.4 * d / 0.35) : 0; });
  h -= ss(105, 200, r) * 140 + ss(95, 125, r) * 14;
  h = lerp(h, 2.5 + nn * 0.4, roadK(x, z) * 0.8);
  return h;
}
const ROAD = [[30, 70], [10, 30], [-5, -5], [-12, -25], [8, -40], [40, -30], [60, -5]];
function roadK(x, z) { let d = 1e9; for (let i = 0; i < ROAD.length - 1; i++) { const [ax, az] = ROAD[i], [bx, bz] = ROAD[i + 1], vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); d = Math.min(d, Math.hypot(x - ax - vx * u, z - az - vz * u)); } return 1 - ss(3, 6, d); }
const DOMES = [{ x: -18, z: -28, r: 13, h: 12 }, { x: 22, z: -48, r: 13, h: 12 }, { x: 52, z: -18, r: 7, h: 6 }, { x: -48, z: 2, r: 8, h: 7 }, { x: 4, z: -72, r: 6, h: 5 }];
const CLOUD_Y = -14;
const SM = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0 }, o));
const capsule = (r, l, mat, n = 8) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, n), mat); m.castShadow = true; m.receiveShadow = true; return m; };
const sph = (r, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; return m; };
const C3s = (a, b, k) => lin(a).lerp(lin(b), clamp(k));

// ---- people (as in the template): hips → chest → neck/head; arms and legs in two segments
function mkMan(o = {}) {
  const C = Object.assign({ skin: '#c8946a', topCol: '#8e3a24', legs: '#26304a', wrap: '#26304a', feet: '#2b2d29', hair: '#0b0d10', band: '#2b2d29', hood: true }, o);
  const topM = SM({ color: C.topCol, map: texCloth('cloth', '#ffffff', 'rgba(0,0,0,0.14)') }), skinM = SM({ color: C.skin, roughness: 0.7 }), legM = SM({ color: C.legs, map: texCloth('legs', '#ffffff', 'rgba(0,0,0,0.15)') }), wrapM = SM({ color: C.wrap });
  const G = () => new THREE.Group(), root = G(), hips = G(), chest = G(), neck = G(), J = {}; root.rotation.order = 'YXZ';
  root.add(hips); hips.position.y = 0.95; hips.add(chest);
  hips.add(sph(0.16, legM, 1.15, 0.7, 0.85));
  { const t = capsule(0.19, 0.24, topM, 10); t.scale.set(1.15, 1, 0.85); t.position.y = 0.3; chest.add(t);
    if (C.hood) { const hd = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.06, 6, 14), topM); hd.rotation.x = Math.PI / 2; hd.position.y = 0.52; chest.add(hd); }
    const zip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.4, 0.02), SM({ color: '#d3d6cc' })); zip.position.set(0, 0.3, 0.2); chest.add(zip); }
  chest.add(neck); neck.position.y = 0.52;
  { const hd = sph(0.115, skinM, 0.9, 1.08, 1.0); hd.position.y = 0.14; neck.add(hd);
    const nose = sph(0.02, skinM, 1, 1, 1.6); nose.position.set(0, 0.13, 0.11); neck.add(nose);
    [-1, 1].forEach((s) => { const ey = sph(0.012, SM({ color: '#1a1410' })); ey.position.set(s * 0.04, 0.16, 0.098); neck.add(ey); });
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.125, 14, 8, 0, TAU, 0, 1.5), SM({ color: C.band, map: texCloth('knit', '#ffffff', 'rgba(0,0,0,0.25)') })); cap.position.y = 0.17; neck.add(cap);
    const bob = sph(0.035, SM({ color: '#d3d6cc' })); bob.position.y = 0.3; neck.add(bob); }
  const limb = (parent, x, y, r1, l1, m1, r2, l2, m2, end) => {
    const a = G(); a.position.set(x, y, 0); parent.add(a); const u = capsule(r1, l1 - r1, m1); u.position.y = -l1 / 2; a.add(u);
    const b = G(); b.position.y = -l1; a.add(b); const lo = capsule(r2, l2 - r2, m2); lo.position.y = -l2 / 2; b.add(lo);
    const e = G(); e.position.y = -l2; b.add(e); if (end) e.add(end); return { a, b, end: e };
  };
  const hand = () => sph(0.05, SM({ color: '#2b2d29' }), 0.9, 1.2, 0.7);
  const foot = () => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.26), SM({ color: C.feet })); f.position.set(0, -0.02, 0.06); f.castShadow = true; return f; };
  J.armL = limb(chest, 0.27, 0.44, 0.07, 0.3, topM, 0.06, 0.27, topM, hand());
  J.armR = limb(chest, -0.27, 0.44, 0.07, 0.3, topM, 0.06, 0.27, topM, hand());
  J.legL = limb(hips, 0.1, 0, 0.085, 0.46, legM, 0.065, 0.45, wrapM, foot());
  J.legR = limb(hips, -0.1, 0, 0.085, 0.46, legM, 0.065, 0.45, wrapM, foot());
  J.handR = J.armR.end; J.handL = J.armL.end;
  root.userData = { hips, chest, neck, J }; return root;
}
const POSE = {
  stand: { y: 0.95, sp: [0, 0, 0], nk: [0, 0, 0], aL: [0.05, 0.12, -0.15], aR: [0.05, -0.12, -0.15], lL: [0, 0.02, 0], lR: [0, -0.02, 0] },
  drink: { y: 0.95, sp: [0, 0, 0], nk: [-0.1, 0, 0], aL: [0.05, 0.12, -0.15], aR: [-0.6, -0.25, -1.9], lL: [0, 0.03, 0], lR: [0, -0.03, 0] },
  lean:  { y: 0.92, sp: [0.25, 0, 0], nk: [-0.2, 0, 0], aL: [-0.9, 0.2, -0.5], aR: [-0.9, -0.2, -0.5], lL: [0, 0.05, 0], lR: [0.2, -0.05, 0.1] },
  look:  { y: 0.95, sp: [-0.15, 0, 0], nk: [-0.6, 0, 0], aL: [0.0, 0.2, -0.1], aR: [0.0, -0.2, -0.1], lL: [0, 0.05, 0], lR: [0, -0.05, 0] },
  shock: { y: 0.9, sp: [-0.2, 0, 0], nk: [-0.7, 0, 0], aL: [-0.4, 0.5, -0.4], aR: [-0.4, -0.5, -0.4], lL: [0.2, 0.06, 0.2], lR: [-0.15, -0.06, 0.1] },
  sit:   { y: 0.55, sp: [0.05, 0, 0], nk: [-0.1, 0, 0], aL: [-1.1, 0.1, -0.6], aR: [-1.1, -0.1, -0.6], lL: [-1.5, 0.1, 1.5], lR: [-1.5, -0.1, 1.5] },
  phone: { y: 0.95, sp: [0, 0, 0], nk: [-0.15, 0, 0], aL: [-1.2, 0.3, -1.3], aR: [-1.3, -0.3, -1.2], lL: [0, 0.05, 0], lR: [0, -0.05, 0] },
};
Object.values(POSE).forEach((p) => { p.rx = p.rx ?? 0; p.rz = p.rz ?? 0; });
const mixPose = (A, Bp, k) => { const o = {}; for (const key in A) { const a = A[key], b = Bp[key] ?? (key === 'rx' || key === 'rz' ? 0 : a); o[key] = Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], k)) : lerp(a, b, k); } for (const key in Bp) if (!(key in o)) o[key] = Bp[key]; return o; };
function setPose(man, P) {
  const { hips, chest, neck, J } = man.userData;
  hips.position.y = P.y; man.rotation.x = P.rx ?? 0; man.rotation.z = P.rz ?? 0;
  chest.rotation.set(P.sp[0], P.sp[1], P.sp[2]); neck.rotation.set(P.nk[0], P.nk[1], P.nk[2]);
  const seg2 = (A, v) => { A.a.rotation.set(v[0], 0, v[1]); A.b.rotation.set(v[2], 0, 0); };
  seg2(J.armL, P.aL); seg2(J.armR, P.aR); seg2(J.legL, P.lL); seg2(J.legR, P.lR);
}
function gait(ph, amp = 1) {
  const s = Math.sin(ph * TAU), c = Math.cos(ph * TAU);
  return { rx: 0, rz: 0, y: 0.95 - 0.04 * amp + 0.05 * amp * Math.abs(c), sp: [0.25 * amp, 0.1 * s * amp, 0], nk: [-0.15 * amp, 0, 0],
    aL: [0.9 * s * amp, 0.12, -0.9 * amp], aR: [-0.9 * s * amp, -0.12, -0.9 * amp],
    lL: [-0.75 * s * amp, 0.03, 0.6 * amp * Math.max(0, -c) + 0.15], lR: [0.75 * s * amp, -0.03, 0.6 * amp * Math.max(0, c) + 0.15] };
}
const WIND = { value: 0 };
function windMat(mat, amp = 0.12) {
  mat.onBeforeCompile = (sh) => { sh.uniforms.uWind = WIND; sh.vertexShader = 'uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    #ifdef USE_INSTANCING
      vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      float sw = sin(uWind * 2.2 + ip.x * 0.45 + ip.z * 0.3) + 0.4 * sin(uWind * 4.1 + ip.x * 1.3);
      transformed.x += sw * ${amp.toFixed(3)} * position.y * position.y; transformed.z += sw * ${(amp * 0.5).toFixed(3)} * position.y * position.y;
    #endif`); };
  mat.customProgramCacheKey = () => 'wind' + amp; return mat;
}

// ---- an observatory: drum, rotating dome with a slit and shutter, catwalk, door, a telescope inside
function mkDome(D, i) {
  const g = new THREE.Group(), wM = SM({ map: texDome(), color: '#8a9290', roughness: 0.4, metalness: 0.2 }), dk = SM({ color: '#0b1a22' }), rail = SM({ color: '#848a8b', metalness: 0.4 });
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(D.r, D.r, D.h, 32, 1), wM); drum.position.y = D.h / 2; g.add(drum);
  const top = new THREE.Group(); top.position.y = D.h; g.add(top);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(D.r * 1.02, 32, 16, 0.18, TAU - 0.36, 0, Math.PI / 2), wM); dome.rotation.y = Math.PI / 2; top.add(dome);
  const slitIn = new THREE.Mesh(new THREE.SphereGeometry(D.r * 0.98, 16, 12, -0.18 + Math.PI / 2, 0.36, 0, Math.PI / 2), dk); top.add(slitIn);
  const shutter = new THREE.Mesh(new THREE.SphereGeometry(D.r * 1.04, 8, 12, -0.2 + Math.PI / 2, 0.4, 0, Math.PI / 2), wM); top.add(shutter);
  [-1, 1].forEach((s) => { const rib = new THREE.Mesh(new THREE.TorusGeometry(D.r * 1.03, 0.25, 4, 24, Math.PI), rail); rib.rotation.y = Math.PI / 2 + s * 0.19; top.add(rib); });
  // the telescope: a tube tilted inside (visible through the slit)
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(D.r * 0.18, D.r * 0.22, D.r * 1.1, 12), SM({ color: '#3f4542', metalness: 0.5 })); tube.position.set(0, D.r * 0.2, D.r * 0.15); tube.rotation.x = 0.7; top.add(tube); g.userData.tube = tube;
  const cat = new THREE.Mesh(new THREE.TorusGeometry(D.r + 1.2, 0.12, 4, 40), rail); cat.rotation.x = Math.PI / 2; cat.position.y = D.h * 0.62; g.add(cat);
  const deck = new THREE.Mesh(new THREE.RingGeometry(D.r, D.r + 1.3, 40), SM({ color: '#5b6466', side: THREE.DoubleSide })); deck.rotation.x = -Math.PI / 2; deck.position.y = D.h * 0.62 - 1.0; g.add(deck);
  for (let k = 0; k < 20; k++) { const a = k / 20 * TAU, p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.08), rail); p.position.set(Math.cos(a) * (D.r + 1.2), D.h * 0.62 - 0.5, Math.sin(a) * (D.r + 1.2)); g.add(p); }
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.2), SM({ color: '#2b2d29' })); door.position.set(0, 1.2, D.r + 0.05); g.add(door);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.2), new THREE.MeshBasicMaterial({ color: '#f9bd5c' })); lamp.position.set(0, 2.7, D.r + 0.1); g.add(lamp); g.userData.lamp = lamp;
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,220,150,0.9)'], [0.3, 'rgba(240,160,80,0.35)'], [1, 'rgba(200,120,60,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(5); gl.position.set(0, 2.7, D.r + 0.4); g.add(gl);
  const pl = new THREE.PointLight('#f0a050', 1.6, 14, 2); pl.position.set(0, 2.6, D.r + 1.2); g.add(pl);
  g.position.set(D.x, th(D.x, D.z) - 0.5, D.z); g.userData.top = top; g.userData.shutter = shutter; g.userData.D = D; g.userData.ry0 = (hsh(i, 3) - 0.5) * 2;
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g;
}
function mkTruck() {
  const g = new THREE.Group(), body = SM({ color: '#848a8b', metalness: 0.4, roughness: 0.45 }), dk = SM({ color: '#191b18' }), trim = SM({ color: '#2b2d29', metalness: 0.3 }), glass = SM({ color: '#0b1a22', roughness: 0.15, metalness: 0.5 }), chrome = SM({ color: '#d3d6cc', metalness: 0.8, roughness: 0.2 });
  const box = (w, h, d, m, x, y, z, rx = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.rotation.x = rx; g.add(b); return b; };
  box(2.0, 0.55, 5.4, body, 0, 0.95, 0); box(1.9, 0.35, 1.6, body, 0, 1.38, 1.85, -0.08);            // body, hood
  box(1.92, 0.85, 2.0, body, 0, 1.75, 0.45); box(1.8, 0.62, 0.05, glass, 0, 1.8, 1.47, -0.3);       // cab, windscreen
  box(1.8, 0.5, 0.05, glass, 0, 1.85, -0.56);                                                        // rear window
  [-1, 1].forEach((sd) => { box(0.05, 0.5, 0.85, glass, sd * 0.97, 1.82, 0.85); box(0.05, 0.5, 0.75, glass, sd * 0.97, 1.82, -0.05); box(0.05, 0.75, 0.04, trim, sd * 0.97, 1.75, 0.4);
    box(0.06, 0.6, 1.95, trim, sd * 1.0, 1.15, -1.6); box(0.12, 0.1, 0.25, trim, sd * 1.06, 1.85, 1.3);   // bed side, mirror
    box(0.15, 0.06, 1.0, trim, sd * 1.05, 0.62, 0.3);                                                // step
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 6, 14, Math.PI), trim); arch.rotation.y = Math.PI / 2; arch.position.set(sd * 1.0, 0.68, 1.7); g.add(arch); const a2 = arch.clone(); a2.position.z = -1.7; g.add(a2); });
  box(1.95, 0.08, 2.1, dk, 0, 1.2, -1.6); box(1.95, 0.6, 0.06, trim, 0, 1.15, -2.62);                  // bed floor, tailgate
  box(1.9, 0.3, 0.12, trim, 0, 0.85, 2.72); for (let k = 0; k < 5; k++) box(1.2, 0.04, 0.04, chrome, 0, 1.1 + k * 0.06, 2.66); // bumper, grille
  box(1.6, 0.06, 1.5, trim, 0, 2.2, 0.45); [-0.7, 0.7].forEach((x) => box(0.05, 0.08, 1.5, chrome, x, 2.26, 0.45));   // roof rack
  box(1.0, 0.25, 0.4, SM({ color: '#4c5a40' }), 0.2, 1.45, -1.3); box(0.45, 0.45, 0.45, SM({ color: '#8e3a24' }), -0.5, 1.45, -2.1); // gear in the bed
  box(0.15, 0.6, 0.15, dk, 0, 2.5, 0.0); box(0.6, 0.12, 0.12, SM({ color: '#c4a458' }), 0, 2.85, 0.0);  // a beacon on the roof (observatory truck)
  g.userData.wheels = []; [[-1, 1.7], [1, 1.7], [-1, -1.7], [1, -1.7]].forEach(([sd, z]) => { const w = new THREE.Group(); w.position.set(sd * 1.0, 0.45, z); g.add(w);
    const ty = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16), dk); ty.rotation.z = Math.PI / 2; w.add(ty); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.37, 8), chrome); hub.rotation.z = Math.PI / 2; w.add(hub); g.userData.wheels.push(w); });
  g.userData.lights = [-1, 1].map((sd) => box(0.38, 0.2, 0.05, new THREE.MeshBasicMaterial({ color: '#3f4542' }), sd * 0.72, 1.12, 2.74));
  g.userData.tail = [-1, 1].map((sd) => box(0.15, 0.3, 0.05, new THREE.MeshBasicMaterial({ color: '#5a2418' }), sd * 0.9, 1.2, -2.66));
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g;
}
// ---- the Behemoth (matches the reference design): a long narrow needle snout, grey ridged hide that cracks and peels,
// a round lidless eye in concentric rings, long needle teeth on both jaws, a pink mouth, a fan of black quills.
// Head units: 1 = the skull's half-height-ish; front of the head = +z, the snout tip at z ≈ 4.2.
function mkBehemoth() {
  const g = new THREE.Group(), U = {}, hide = SM({ map: texRidges(), roughness: 0.6 }), blk = new THREE.MeshPhongMaterial({ color: '#020306', shininess: 200, specular: '#5b6466' });
  const toothM = SM({ color: '#e6e4da', roughness: 0.4 }), pink = SM({ color: '#b8784a', roughness: 0.35 }), ringM = SM({ color: '#848a8b' }), quill = SM({ color: '#0b0d10', roughness: 0.4 });
  const neckPts = [V3(0, -10, -12), V3(0, -6, -8.5), V3(0, -2.6, -5), V3(0, -0.4, -2.4), V3(0, 0.4, -0.6)];
  const curve = new THREE.CatmullRomCurve3(neckPts);
  const neck = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 1, 18, false), hide);
  { const P = neck.geometry.attributes.position, uv = neck.geometry.attributes.uv; for (let i = 0; i < P.count; i++) { const v = V3(P.getX(i), P.getY(i), P.getZ(i)), u = uv.getX(i); const c = curve.getPoint(u); const d = v.clone().sub(c).multiplyScalar(lerp(2.2, 1.3, u) * (1 + 0.06 * Math.sin(u * 60))); P.setXYZ(i, c.x + d.x, c.y + d.y, c.z + d.z); } neck.geometry.computeVertexNormals(); }
  g.add(neck); U.neck = neck;
  const head = new THREE.Group(); g.add(head); U.head = head;
  // upper skull: a long spindle, deep at the back, tapering to a needle point; the underside flat (the mouth line)
  const WV = (zz) => -0.045 * Math.max(0, zz + 0.6) ** 2;   // the whole snout bends gently down toward the tip (a soft curve, not a wave)
  const TOP = (zz) => 1 - 0.34 * Math.exp(-((zz - 1.1) ** 2) / 0.45) + 0.3 * Math.exp(-((zz - 2.5) ** 2) / 0.3);   // the brow-to-snout wave of the print: a dip after the eye, a bump on the nose
  const spindle = (len, depth, wid, up, zo = 0) => { const geo = new THREE.SphereGeometry(1, 64, 32); const P = geo.attributes.position;
    for (let i = 0; i < P.count; i++) { const x0 = P.getX(i), y0 = P.getY(i), z0 = P.getZ(i), r0 = Math.sqrt(Math.max(1e-6, 1 - z0 * z0)), nx = x0 / r0, ny = y0 / r0, f = (z0 + 1) / 2;
      const prof = Math.sqrt(Math.min(1, f / 0.2)) * (Math.pow(1 - 0.82 * f, 1.15) - 0.02 * f), y = (up ? (ny > 0 ? ny * depth : ny * 0.06) : (ny < 0 ? ny * depth : ny * 0.06)) * prof;
      const zz = -1.6 + f * len; P.setXYZ(i, nx * wid * prof, y + WV(zz + zo), zz); }
    geo.computeVertexNormals(); return geo; };
  head.add(new THREE.Mesh(spindle(5.4, 2.7, 1.4, true), hide));
  { const cran = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), hide); cran.scale.set(1.3, 1.45, 1.9); cran.position.set(0, 0.55, -0.9); head.add(cran);
    const nape = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), hide); nape.scale.set(1.35, 1.3, 1.6); nape.position.set(0, 0.1, -1.9); head.add(nape); }
  const mouthIn = new THREE.Mesh(spindle(5.2, 0.3, 1.25, false, 0.05), pink); mouthIn.position.set(0, 0.0, 0.05); head.add(mouthIn);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.02, -1.4); head.add(jaw); U.jaw = jaw;
  const jm = new THREE.Mesh(spindle(5.0, 1.0, 1.3, false, -0.1), hide); jm.position.z = 1.4 - 0.1; jaw.add(jm);
  const tongue = new THREE.Mesh(spindle(4.4, 0.12, 0.95, true), pink); tongue.position.set(0, -0.02, 1.4); jaw.add(tongue);
  // needle teeth: long and thin, evenly spaced, both jaws
  const tg = new THREE.ConeGeometry(1, 1, 5); tg.translate(0, 0.5, 0);   // base at the gum, tip up; upper teeth are flipped
  const up = [], lo = []; for (let k = 0; k < 20; k++) { const u = k / 19, z = lerp(3.1, -0.4, u), f = (z + 1.6) / 5.4, hw = 1.4 * Math.sqrt(Math.min(1, f / 0.2)) * Math.pow(1 - f, 1.25) * 0.92, s = lerp(0.38, 0.2, u) * (0.75 + 0.5 * hsh(k, 2));
    [-1, 1].forEach((sd) => { up.push({ x: sd * hw, z, s }); lo.push({ x: sd * hw * 0.92, z: z + 1.2 - 0.2, s: s * 0.9 }); }); }
  const tu = IM(tg, toothM, up.length), tl = IM(tg, toothM, lo.length);
  up.forEach((t, i) => tu.setMatrixAt(i, M4c(t.x * 0.78, 0.03 + WV(t.z), t.z, 0, t.s * 0.09, t.s * 0.8, t.s * 0.09, Math.PI - 0.12, 0))); head.add(tu);
  lo.forEach((t, i) => tl.setMatrixAt(i, M4c(t.x * 0.7, -0.06 + WV(t.z - 1.0), t.z + 0.4, 0, t.s * 0.09, t.s * 0.6, t.s * 0.09, 0.12, 0))); jaw.add(tl);
  // the eye: a glossy black ball in three grey rings, no lid
  U.eyeG = []; U.eyes = [-1, 1].map((sd) => { const grp = new THREE.Group(); U.eyeG.push(grp); grp.position.set(sd * 1.12, 0.95, -0.15); grp.rotation.y = sd * Math.PI / 2 * 0.86; head.add(grp);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 16), blk); grp.add(e); const pv = new THREE.Group(); grp.add(pv); const gl = new THREE.Mesh(new THREE.CircleGeometry(0.075, 14), new THREE.MeshBasicMaterial({ color: '#c41e14' })); gl.position.z = 0.262; grp.add(gl); const gl2 = new THREE.Mesh(new THREE.CircleGeometry(0.03, 10), new THREE.MeshBasicMaterial({ color: '#ff5a3a' })); gl2.position.z = 0.264; grp.add(gl2); e.userData.pv = pv;
    [0.34, 0.44, 0.54].forEach((r, k) => { const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 6, 32), ringM); ring.position.z = -0.03 * k; grp.add(ring); });
    const disk = new THREE.Mesh(new THREE.CircleGeometry(0.58, 32), SM({ color: '#c8ccc4' })); disk.position.z = -0.12; grp.add(disk); return e; });
  // gill-like curved grooves behind the eye
  for (let k = 0; k < 4; k++) [-1, 1].forEach((sd) => { const gr = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.025, 4, 16, 1.4), SM({ color: '#2b2d29' })); gr.position.set(sd * 0.85, 0.5, -0.4 - k * 0.3); gr.rotation.set(0, sd * Math.PI / 2, -0.7); head.add(gr); });
  // wet strands hanging from the teeth, swaying (updated in poseBH)
  U.drool = []; for (let k = 0; k < 10; k++) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(3 * 12), 3));
    const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#d3d6cc', transparent: true, opacity: 0.85 })); l.frustumCulled = false; head.add(l); l.userData = { z: lerp(2.6, -0.2, k / 9) + hsh(k, 3) * 0.3, sd: k % 2 ? 1 : -1, L: 0.6 + hsh(k, 6) * 1.6, ph: hsh(k, 8) * TAU }; U.drool.push(l); }
  // a fan of long black quills at the back of the head
  { const qg = new THREE.ConeGeometry(1, 1, 5).translate(0, 0.5, 0), qm = IM(qg, quill, 9); U.quills = qm;
    for (let k = 0; k < 9; k++) qm.setMatrixAt(k, M4c(0, 1.9 - k * 0.1, -0.9 - k * 0.3, 0, 0.09, 1.6 + 0.6 * Math.sin(k * 0.6), 0.09, -0.95 - k * 0.06, (hsh(k, 7) - 0.5) * 0.2)); head.add(qm);
    const cr = IM(qg, quill, 22); for (let k = 0; k < 22; k++) { const u = 1 - k / 21, p = curve.getPoint(u), r = lerp(2.2, 1.05, u); cr.setMatrixAt(k, M4c(p.x, p.y + r * 0.9, p.z, 0, 0.14, 0.8 + 0.6 * hsh(k, 4), 0.14, -0.6, 0)); } g.add(cr); }
  { const ropeU = 0.62, c0 = curve.getPoint(ropeU), tg = curve.getTangent(ropeU), r = lerp(2.2, 1.3, ropeU) * 1.02;
    const rope = new THREE.Mesh(new THREE.TorusGeometry(r, 0.32, 8, 40), SM({ map: txCanvas('straw2', 64, 64, (x, w, h, R) => { x.fillStyle = '#b8a070'; x.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#8a7048' : '#d0b888'; x.save(); x.translate(i * 8, 0); x.transform(1, 0, 0.6, 1, 0, 0); x.fillRect(0, 0, 4, h); x.restore(); } }, [8, 1]) }));
    rope.position.copy(c0); rope.quaternion.setFromUnitVectors(V3(0, 0, 1), tg); g.add(rope);
    const shide = SM({ color: '#eeeadb', side: THREE.DoubleSide }); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + 0.3, sh = new THREE.Group(); const off = V3(Math.cos(a), Math.sin(a), 0).multiplyScalar(r); sh.position.copy(c0).add(off.applyQuaternion(rope.quaternion)); g.add(sh);
      for (let j = 0; j < 4; j++) { const pz = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), shide); pz.position.set((j % 2 ? 0.22 : -0.22), -0.35 - j * 0.55, 0); pz.rotation.z = j % 2 ? 0.4 : -0.4; sh.add(pz); } sh.lookAt(c0); }
    const ofT = txCanvas('ofuda', 32, 96, (x, w, h, R) => { x.fillStyle = '#e8dcb4'; x.fillRect(0, 0, w, h); x.fillStyle = '#8e3a24'; x.fillRect(4, 4, w - 8, 10); x.fillStyle = '#1a1410'; for (let i = 0; i < 6; i++) { x.fillRect(10 + R.n(3), 20 + i * 12, R.r(8, 14), R.r(3, 7)); x.fillRect(12, 22 + i * 12, 2, 8); } });
    const ofM = SM({ map: ofT, side: THREE.DoubleSide }); const PN = neck.geometry.attributes.position, NN = neck.geometry.attributes.normal, UVn = neck.geometry.attributes.uv, R2 = RNG('ofuda');
    for (let k = 0; k < 9; k++) { let j = 0; for (let tries = 0; tries < 200; tries++) { j = Math.floor(R2.f() * PN.count); const u = UVn.getX(j), v = UVn.getY(j); if (u > 0.45 && u < 0.95 && Math.abs(Math.sin(v * TAU)) > 0.2) break; }
      const o = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.3), ofM), n = V3(NN.getX(j), NN.getY(j), NN.getZ(j)); o.position.set(PN.getX(j), PN.getY(j), PN.getZ(j)).addScaledVector(n, 0.03); o.lookAt(o.position.clone().add(n)); o.rotateZ(R2.n(0.3)); g.add(o); } }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  g.userData = U; return g;
}
// the hand: a palm and four long three-jointed fingers with black talons; local units ~ the head's
function mkHand() {
  const g = new THREE.Group(), scM = SM({ map: texRidges(), roughness: 0.6 }), tal = SM({ color: '#06090f', roughness: 0.3 }), U = { fingers: [] };
  const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), scM); palm.rotation.z = Math.PI / 2; palm.scale.set(0.45, 1.15, 1.0); g.add(palm);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.95, 9, 16), scM); arm.position.set(0, -2.4, -4.2); arm.rotation.x = -1.0; g.add(arm);
  for (let f = 0; f < 4; f++) { const kn = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), scM); kn.position.set(-0.78 + f * 0.52, 0.12, 0.82); g.add(kn);
    const base = new THREE.Group(); base.position.set(-0.78 + f * 0.52, 0.05, 0.85); base.rotation.y = (f - 1.5) * 0.12; g.add(base); let par = base; const segs = [];
    for (let k = 0; k < 3; k++) { const l = [1.0, 0.8, 0.6][k], sg = new THREE.Group(); sg.position.z = k ? [1.0, 0.8][k - 1] : 0; par.add(sg); const c = capsule(0.2 - k * 0.035, l, scM); c.rotation.x = Math.PI / 2; c.position.z = l / 2; sg.add(c);
      const j = new THREE.Mesh(new THREE.SphereGeometry(0.21 - k * 0.035, 10, 8), scM); sg.add(j); segs.push(sg); par = sg; }
    const t = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.75, 6), tal); t.rotation.x = Math.PI / 2 + 0.6; t.position.set(0, -0.15, 0.85); par.add(t); U.fingers.push(segs); }
  { const th2 = new THREE.Group(); th2.position.set(-1.05, -0.05, 0.1); th2.rotation.y = -0.9; g.add(th2); const c = capsule(0.2, 1.0, scM); c.rotation.x = Math.PI / 2; c.position.z = 0.5; th2.add(c); const t = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 6), tal); t.rotation.x = Math.PI / 2 + 0.5; t.position.set(0, -0.1, 1.2); th2.add(t); }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); g.userData = U; return g;
}
function curlHand(h, k) { h.userData.fingers.forEach((segs, f) => segs.forEach((s, j) => (s.rotation.x = k * [0.5, 0.7, 0.8][j] + 0.05 * Math.sin(f + j)))); }

function world() {
  if (WJ) return WJ;
  const scene = new THREE.Scene(), Wd = { scene };
  scene.fog = new THREE.Fog('#1f3c44', 80, 1500);
  Wd.cam = new THREE.PerspectiveCamera(50, YK.LW / YK.LH, 0.1, 9000);
  Wd.hemi = new THREE.HemisphereLight('#4e8389', '#221c15', 0.9); scene.add(Wd.hemi);
  const sun = new THREE.DirectionalLight('#b9cbc6', 2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -140; sc.right = 140; sc.top = 140; sc.bottom = -140; sc.near = 1; sc.far = 900; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.2;
  scene.add(sun); scene.add(sun.target); Wd.sun = sun;
  Wd.key = new THREE.DirectionalLight('#d3d6cc', 0); scene.add(Wd.key); scene.add(Wd.key.target);
  // sky: gradient, stars, the milky way band, thin clouds, the moon glow
  Wd.sky = new THREE.Mesh(new THREE.SphereGeometry(8000, 32, 16), shaderMat({ top: { value: lin('#06090f') }, hor: { value: lin('#1f3c44') }, cloud: { value: lin('#346c76') }, cloudSh: { value: lin('#0b1a22') }, sunCol: { value: lin('#b9cbc6') }, sunDir: { value: V3(0.4, 0.4, -0.6) }, t: { value: 0 }, cover: { value: 0.6 }, stars: { value: 1 } },
    `uniform vec3 top, hor, cloud, cloudSh, sunCol, sunDir; uniform float t, cover, stars;
    void main(){ vec3 d=normalize(vW-cameraPosition); float y=max(d.y,0.); vec3 c=mix(hor,top,pow(y,0.45));
      vec2 sp=vec2(atan(d.x,d.z)*180.,d.y*300.); float st=step(0.996,h2(floor(sp)))*smoothstep(0.02,0.2,d.y)*stars; c+=vec3(st)*0.9*(0.6+0.4*sin(t*3.+h2(floor(sp))*40.));
      float mw=exp(-pow(d.x*0.8+d.y*0.6-0.2,2.)*18.)*fbm(sp*0.02)*stars; c+=vec3(0.25,0.32,0.34)*mw*smoothstep(0.,0.3,d.y);
      vec2 uv=d.xz/(d.y+0.12)*0.8+vec2(t*0.004,0.); float cl=smoothstep(cover,cover+0.15,fbm(uv*0.6))*smoothstep(0.,0.15,d.y);
      c=mix(c,mix(cloud,cloudSh,fbm(uv*0.6+0.1)),cl*0.8);
      float s=max(dot(d,normalize(sunDir)),0.); c+=sunCol*(pow(s,8.)*0.35+smoothstep(0.9993,0.9997,s)*2.);
      gl_FragColor=vec4(c,1.);
      #include <encodings_fragment>
    }`, { mat: { side: THREE.BackSide, depthWrite: false } }));
  Wd.sky.material.fog = false; Wd.sky.renderOrder = -10; scene.add(Wd.sky);
  // the summit: tephra, darker lava rock on the slopes, snow in the hollows, the dirt road
  { const S = 640, n = 220, geo = new THREE.PlaneGeometry(S, S, n, n); geo.rotateX(-Math.PI / 2);
    const P = geo.attributes.position, col = []; for (let i = 0; i < P.count; i++) P.setY(i, th(P.getX(i), P.getZ(i)));
    geo.computeVertexNormals(); const N = geo.attributes.normal;
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), ny = N.getY(i), m = fbm2(x * 0.05, z * 0.05), sn = fbm2(x * 0.08 + 9, z * 0.08);
      let c = C3s('#a8846a', '#7a6a62', m); if (ny < 0.82) c = C3s('#5a463c', '#3f4542', m); c.lerp(lin('#eeeadb'), ss(0.62, 0.7, sn) * (ny > 0.8 ? 1 : 0.3) * (y > 0 ? 1 : 0));
      c.lerp(lin('#cfae78'), roadK(x, z) * 0.7); col.push(c.r, c.g, c.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.Mesh(geo, SM({ map: texTephra(), vertexColors: true, roughness: 0.95 })); m.receiveShadow = true; scene.add(m); Wd.ground = m; }
  // rocks and boulders; road markers; a sign; tufts of dry grass
  { const R = RNG('rk'), rk = []; for (let i = 0; i < 900; i++) { const x = R.r(-140, 140), z = R.r(-140, 120); if (roadK(x, z) > 0.1 || DOMES.some((D) => Math.hypot(x - D.x, z - D.z) < D.r + 4)) continue; rk.push({ x, z, s: R.r(0.2, 1.4) * (R.f() < 0.05 ? 3 : 1) }); }
    const g = new THREE.IcosahedronGeometry(1, 1), P = g.attributes.position; for (let i = 0; i < P.count; i++) { const v = V3(P.getX(i), P.getY(i), P.getZ(i)), k = 0.75 + 0.4 * vn2(v.x * 2 + 5, v.z * 2 + v.y * 2); P.setXYZ(i, v.x * k, v.y * k, v.z * k); } g.computeVertexNormals();
    const m = IM(g, SM({ map: texStone(), flatShading: true }), rk.length); rk.forEach((r, i) => { m.setMatrixAt(i, M4c(r.x, th(r.x, r.z), r.z, hsh(i) * 6, r.s, r.s * 0.65, r.s * 1.1, hsh(i, 3))); m.setColorAt(i, lin(['#5a463c', '#3f4542', '#7a6a62', '#2b2d29', '#8a6a56'][i % 5])); }); scene.add(m);
    const posts = []; for (let i = 0; i < ROAD.length - 1; i++) for (let u = 0; u < 1; u += 0.12) { const x = lerp(ROAD[i][0], ROAD[i + 1][0], u) + 5, z = lerp(ROAD[i][1], ROAD[i + 1][1], u); posts.push([x, z]); }
    const pm = IM(new THREE.BoxGeometry(0.15, 1.2, 0.15).translate(0, 0.6, 0), SM({ color: '#d3d6cc' }), posts.length); posts.forEach(([x, z], i) => pm.setMatrixAt(i, M4c(x, th(x, z), z))); scene.add(pm); Wd.posts = pm;
    const tufts = []; for (let i = 0; i < 9000; i++) { const x = R.r(-130, 130), z = R.r(-130, 110); if (roadK(x, z) > 0.2 || th(x, z) < -2 || fbm2(x * 0.1, z * 0.1) < 0.45) continue; tufts.push([x, z, R.r(0.2, 0.6)]); }
    const bg = new THREE.ConeGeometry(0.04, 1, 3).translate(0, 0.5, 0); const tm = IM(bg, windMat(new THREE.MeshLambertMaterial({ color: '#a07c50' }), 0.1), tufts.length, false);
    tufts.forEach(([x, z, h], i) => tm.setMatrixAt(i, M4c(x, th(x, z), z, i, 1, h, 1, (hsh(i) - 0.5) * 0.6, (hsh(i, 2) - 0.5) * 0.6))); scene.add(tm); }
  Wd.domes = DOMES.map((D, i) => { const d = mkDome(D, i); scene.add(d); return d; });
  // the sea of clouds: a lit, drifting floor of billows; puffs on top; wisps rising at the summit's edge
  Wd.sea = new THREE.Mesh(new THREE.PlaneGeometry(12000, 12000, 1, 1).rotateX(-Math.PI / 2), shaderMat({ t: { value: 0 }, lo: { value: lin('#1f3c44') }, hi: { value: lin('#b9cbc6') }, sh: { value: lin('#0b1a22') } },
    `uniform float t; uniform vec3 lo, hi, sh;
    void main(){ vec2 q=vW.xz*0.004+vec2(t*0.004,t*0.002); float f=fbm(q*3.)*0.6+fbm(q*9.+1.3)*0.4; float b=smoothstep(0.35,0.75,f);
      vec3 c=mix(sh,mix(lo,hi,b),0.4+0.6*smoothstep(0.25,0.6,f)); gl_FragColor=vec4(c,1.);
      #END
    }`)); Wd.sea.position.y = CLOUD_Y; scene.add(Wd.sea);
  { const tex = g3Radial([[0, 'rgba(255,255,255,0.95)'], [0.45, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0)']]), R = RNG('puff'); Wd.puffs = [];
    for (let i = 0; i < 260; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: '#b9cbc6', transparent: true, opacity: 0.55, depthWrite: false, fog: true }));
      const a = R.r(-1.4, 1.4), d = R.r(450, 2400); s.userData = { x: Math.sin(a) * d, z: -Math.cos(a) * d, y: CLOUD_Y + R.r(-12, 4), s: R.r(40, 130), v: R.r(1, 4), ph: R.f() * TAU }; scene.add(s); Wd.puffs.push(s); }
    // billows that hug the creature where its body meets the clouds (placed per shot)
    Wd.hug = []; for (let i = 0; i < 70; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: '#d3d6cc', transparent: true, opacity: 0.8, depthWrite: false, fog: true })); s.userData = { a: R.r(0, TAU), r: R.r(0.2, 1.4), y: R.r(-0.5, 1.2), s: R.r(0.8, 2.2), ph: R.f() * TAU }; scene.add(s); Wd.hug.push(s); } }
  // falling scale flakes (shed by the creature): small pale plates tumbling
  { const R = RNG('flake'); Wd.flakeP = []; for (let i = 0; i < 300; i++) Wd.flakeP.push({ u: R.f(), v: R.r(0.3, 1), a: R.r(0, TAU), r: R.r(0, 1), ph: R.f() * TAU });
    Wd.flakes = IM(new THREE.PlaneGeometry(1, 0.7), SM({ color: '#e6e4da', side: THREE.DoubleSide }), 300, false); Wd.flakes.frustumCulled = false; Wd.flakes.visible = false; scene.add(Wd.flakes); }
  // falling rocks (the hand's grip)
  { Wd.rockP = []; const R = RNG('fall'); for (let i = 0; i < 80; i++) Wd.rockP.push({ x: R.n(1), z: R.n(1), t0: R.r(0, 3), s: R.r(0.4, 2.5) });
    Wd.falling = IM(new THREE.DodecahedronGeometry(1, 0), SM({ color: '#5a463c', flatShading: true }), 80, false); Wd.falling.frustumCulled = false; Wd.falling.visible = false; scene.add(Wd.falling); }
  { const n = 2200, pos = new Float32Array(n * 6), R = RNG('rain'); Wd.rainP = []; for (let i = 0; i < n; i++) Wd.rainP.push({ x: R.n(1), y: R.f(), z: R.n(1), v: R.r(0.8, 1.2) });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); Wd.rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#8fb1b0', transparent: true, opacity: 0.55, depthWrite: false })); Wd.rain.frustumCulled = false; scene.add(Wd.rain); }
  Wd.moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,255,250,1)'], [0.16, 'rgba(240,245,240,1)'], [0.2, 'rgba(200,220,220,0.4)'], [1, 'rgba(160,200,200,0)']], 128), transparent: true, depthWrite: false, fog: false })); Wd.moon.scale.setScalar(900); scene.add(Wd.moon);
  Wd.man = mkMan(); scene.add(Wd.man);
  Wd.thermos = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.25, 10), SM({ color: '#848a8b', metalness: 0.6, roughness: 0.3 })); Wd.thermos.position.y = -0.05; Wd.man.userData.J.handR.add(Wd.thermos);
  Wd.cup = new THREE.Group(); { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 14), SM({ color: '#d3d6cc' })); const hd = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 12), SM({ color: '#d3d6cc' })); hd.position.x = 0.065; Wd.cup && 0; c.add(hd); Wd.cup.add(c); Wd.coffee = new THREE.Mesh(new THREE.CircleGeometry(0.055, 18).rotateX(-Math.PI / 2), shaderMat({ t: { value: 0 }, amp: { value: 0 } }, `uniform float t, amp; void main(){ float d=length(vUv-0.5)*2.; float w=sin(d*40.-t*30.)*amp; vec3 c=mix(vec3(0.05,0.03,0.02),vec3(0.8,0.78,0.7),smoothstep(0.5,1.,w)); gl_FragColor=vec4(c,1.);
      #END
    }`)); Wd.coffee.position.y = 0.045; Wd.cup.add(Wd.coffee); } scene.add(Wd.cup);
  Wd.truck = mkTruck(); scene.add(Wd.truck);
  Wd.bh = mkBehemoth(); scene.add(Wd.bh);
  Wd.hand = mkHand(); scene.add(Wd.hand);
  Wd.tour = [0, 1, 2, 3, 4].map((i) => { const c = [['#8e3a24', '#26304a'], ['#d3d6cc', '#3f4542'], ['#c4a458', '#191b18'], ['#4e8389', '#5a4430'], ['#3a3f4a', '#2b2d29']][i]; const m = mkMan({ topCol: c[0], legs: c[1], wrap: c[1], band: i % 2 ? '#26304a' : '#8e3a24', skin: ['#d8b090', '#c8946a', '#a07c50', '#e0c0a0', '#b88a64'][i] });
    const ph = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.02), SM({ color: '#020306' })); ph.position.set(0, -0.08, 0.04); m.userData.J.handR.add(ph); scene.add(m); return m; });
  Wd.cars = [0, 1, 2].map(() => { const t = mkTruck(); scene.add(t); return t; });
  // cel shading: every lit material → toon, 3 bands
  const grad = new THREE.DataTexture(new Uint8Array([45, 45, 45, 255, 135, 135, 135, 255, 255, 255, 255, 255]), 3, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const done = new Map();
  scene.traverse((m) => { if (!m.isMesh || !m.material || !m.material.isMeshStandardMaterial) return; const o = m.material;
    if (!done.has(o)) done.set(o, new THREE.MeshToonMaterial({ color: o.color, map: o.map, vertexColors: o.vertexColors, side: o.side, gradientMap: grad, transparent: o.transparent }));
    m.material = done.get(o); });
  WJ = Wd; return Wd;
}
const LIGHT = {
  night: { top: '#06090f', hor: '#1f3c44', cloud: '#26304a', cloudSh: '#0b1a22', sunC: '#b9cbc6', sunI: 1.8, sunD: [0.35, 0.45, 0.8], hemS: '#346c76', hemG: '#221c15', hemI: 0.75, fog: '#172728', fn: 50, ff: 1500, cover: 0.58, exp: 1.0, stars: 1, moon: [-0.35, 0.35, -0.85], sea: ['#1f3c44', '#8fb1b0', '#0b1a22'] },
  deep:  { top: '#020306', hor: '#0b1a22', cloud: '#141a2e', cloudSh: '#06090f', sunC: '#8fb1b0', sunI: 1.4, sunD: [0.35, 0.45, 0.8], hemS: '#1f3c44', hemG: '#06090f', hemI: 0.6, fog: '#0b1a22', fn: 40, ff: 1300, cover: 0.62, exp: 1.0, stars: 1, moon: [-0.35, 0.35, -0.85], sea: ['#172728', '#65969a', '#06090f'] },
  dusk:  { top: '#26304a', hor: '#cfae78', cloud: '#d0a26a', cloudSh: '#5a2418', sunC: '#d0a26a', sunI: 2.6, sunD: [-0.8, 0.12, -0.6], hemS: '#65969a', hemG: '#3c2c1e', hemI: 1.0, fog: '#65969a', fn: 60, ff: 1800, cover: 0.55, exp: 1.05, stars: 0, moon: [0.5, 0.5, -0.7], sea: ['#65969a', '#eeeadb', '#26304a'] },
};
function setLight(Wd, L, focus) {
  const U = Wd.sky.material.uniforms; U.top.value.set(L.top); U.hor.value.set(L.hor); U.cloud.value.set(L.cloud); U.cloudSh.value.set(L.cloudSh); U.sunCol.value.set(L.sunC); U.sunDir.value.set(...L.moon); U.cover.value = L.cover; U.stars.value = L.stars;
  Wd.sun.color.set(L.sunC); Wd.sun.intensity = L.sunI; const f = focus || V3(0, 4, -20); Wd.sun.target.position.copy(f); Wd.sun.position.copy(f).addScaledVector(V3(...L.sunD).normalize(), 400); Wd.sun.target.updateMatrixWorld();
  Wd.hemi.color.set(L.hemS); Wd.hemi.groundColor.set(L.hemG); Wd.hemi.intensity = L.hemI;
  Wd.scene.fog.color.set(L.fog); Wd.scene.fog.near = L.fn; Wd.scene.fog.far = L.ff;
  const S = Wd.sea.material.uniforms; S.lo.value.set(L.sea[0]); S.hi.value.set(L.sea[1]); S.sh.value.set(L.sea[2]);
  Wd.moon.position.copy(V3(...L.moon).normalize().multiplyScalar(7000)); Wd.moon.visible = L.stars > 0;
  Wd.puffs.forEach((p) => p.material.color.set(L.sea[1])); Wd.hug.forEach((p) => p.material.color.set(L.sea[1]));
  rend().r.toneMappingExposure = L.exp;
}
// the creature's pose: position (its head's origin), scale, yaw, head pitch/yaw, jaw open, the hug of clouds where it meets the sea
function poseBH(Wd, o) {
  const B = Wd.bh; B.visible = o.show ?? true; if (!B.visible) { Wd.hug.forEach((s) => (s.visible = false)); return; }
  B.position.copy(o.pos); B.scale.setScalar(o.s); B.rotation.set(0, o.yaw ?? 0, 0);
  const U = B.userData; U.head.rotation.set(o.pitch ?? 0, o.hyaw ?? 0, o.roll ?? 0); U.jaw.rotation.x = o.jaw ?? 0.05;
  B.updateMatrixWorld(true); const cam = WJ.cam.position;
  U.eyes.forEach((e) => { const pv = e.userData.pv, lp = e.worldToLocal(cam.clone()).normalize(); pv.quaternion.setFromUnitVectors(V3(0, 0, 1), lp); });
  U.drool.forEach((l) => { const { z, sd, L, ph } = l.userData, f = Math.min(0.95, (z + 1.6) / 5.4), hw = 1.4 * Math.sqrt(Math.min(1, f / 0.2)) * Math.pow(1 - f, 1.25) * 0.85, P = l.geometry.attributes.position, open = (o.jaw ?? 0) * 3.5;
    for (let k = 0; k < 12; k++) { const u = k / 11, sw = Math.sin(TT * 1.3 + ph + u * 3) * 0.12 * u; P.setXYZ(k, sd * hw + sw, -0.15 - u * L * (0.4 + open), z + sw * 0.5); } P.needsUpdate = true; l.visible = (o.jaw ?? 0) > 0.08; });
  if (U.quills) { for (let k = 0; k < 9; k++) U.quills.setMatrixAt(k, M4c(0, 1.9 - k * 0.1, -0.9 - k * 0.3, 0, 0.09, 1.6 + 0.6 * Math.sin(k * 0.6), 0.09, -0.95 - k * 0.06 + 0.05 * Math.sin(TT * 9 + k * 2.3) * (Math.sin(TT * 0.7 + k) > 0.6 ? 1 : 0), (hsh(k, 7) - 0.5) * 0.2)); U.quills.instanceMatrix.needsUpdate = true; }
  // clouds hugging the neck where it meets the sea (in world space)
  const base = V3(0, -10, -12).multiplyScalar(o.s).applyEuler(new THREE.Euler(0, o.yaw ?? 0, 0)).add(o.pos); base.y = Math.max(base.y, CLOUD_Y);
  const cl = o.cloak ?? 0, hc = V3(0, 0, 1.5).multiplyScalar(o.s).applyEuler(new THREE.Euler(0, o.yaw ?? 0, 0)).add(o.pos);
  Wd.hug.forEach((s, i) => { const u = s.userData; s.visible = o.hug ?? true; if (cl > 0 && i % 2) { s.visible = true; const tc = WJ.cam.position.clone().sub(hc).normalize(); s.position.set(hc.x + Math.cos(u.a + TT * 0.05) * u.r * o.s * 3.4, hc.y + (u.y - 0.3) * o.s * 1.8, hc.z + Math.sin(u.a + TT * 0.05) * u.r * o.s * 2).addScaledVector(tc, o.s * 2.5); s.scale.setScalar(u.s * o.s * 2.4); s.material.opacity = 0.9 * cl; return; } s.material.opacity = 0.8; s.position.set(base.x + Math.cos(u.a + TT * 0.03) * u.r * o.s * 3, CLOUD_Y + u.y * o.s * 1.2 + Math.sin(TT * 0.3 + u.ph) * o.s * 0.1, base.z + Math.sin(u.a + TT * 0.03) * u.r * o.s * 3); s.scale.setScalar(u.s * o.s * 2.2); });
}
function animWorld(Wd, t, o = {}) {
  WIND.value = t; Wd.sky.material.uniforms.t.value = t;
  { const c = WJ.cam.position, S = o.rainR ?? 30, P = Wd.rain.geometry.attributes.position; Wd.rain.visible = o.rain ?? true;
    Wd.rainP.forEach((q, i) => { const y = c.y + S - mod(q.y * 2 * S + t * 22 * q.v, 2 * S), x = c.x + q.x * S + (y - c.y) * 0.25, z = c.z + q.z * S, L = S * 0.035; P.setXYZ(i * 2, x, y, z); P.setXYZ(i * 2 + 1, x - L * 0.25, y - L, z); }); P.needsUpdate = true; } Wd.sea.material.uniforms.t.value = t * 6;
  Wd.puffs.forEach((s) => { const u = s.userData; s.position.set(u.x + t * u.v * 3, u.y + Math.sin(t * 0.2 + u.ph) * 2, u.z); s.scale.set(u.s * 2.2, u.s, 1); s.material.opacity = 0.5; });
  Wd.domes.forEach((d, i) => { d.userData.top.rotation.y = d.userData.ry0 + (o.domeSpin && i === o.domeSpin.i ? o.domeSpin.a : 0);  });
}
