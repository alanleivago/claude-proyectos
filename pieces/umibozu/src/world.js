// =====================================================================
//  WORLD — a squid boat at night off the Gotō Islands: a black, glassy sea with lamp reflections, the boat (hull, cabin,
//  mast, a long line of bare white squid lamps), nets, floats, a bailing bucket and the broken ladle on a hook; the
//  grandfather; the Umibōzu (a wet black bald giant, glowing white eyes, barnacles, old ropes, water streaming off it,
//  a huge hand); a harbour at dawn. One renderer at the yokai low res.
// =====================================================================
let R3 = null, WJ = null;
function rend() {
  if (R3) return R3;
  const cv = document.createElement('canvas'); cv.width = YK.LW; cv.height = YK.LH;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: false, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(YK.LW, YK.LH, false); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  R3 = { cv, r }; return R3;
}
// the summit: a plateau (0..~14 m of cinder cones) whose edge falls to the cloud sea beyond r ≈ 110
const SM = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0 }, o));
const capsule = (r, l, mat, n = 8) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, n), mat); m.castShadow = true; m.receiveShadow = true; return m; };
const sph = (r, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; return m; };
const C3s = (a, b, k) => lin(a).lerp(lin(b), clamp(k));

// ---- people (as in the template): hips → chest → neck/head; arms and legs in two segments
const SKIN = '#c8946a';
function mkMan(o = {}) {
  const C = Object.assign({ skin: SKIN, top: null, topCol: '#ffffff', legs: '#5a5046', wrap: '#b9b4a6', feet: '#cfae78', hair: '#0b0d10', band: '#eeeadb' }, o);
  const topM = C.top === null ? SM({ map: texKasuri() }) : SM({ color: C.topCol, map: texCloth('cloth', '#ffffff', 'rgba(0,0,0,0.12)') });
  const skinM = SM({ color: C.skin, roughness: 0.7 }), legM = SM({ color: C.legs, map: texCloth('legs', '#ffffff', 'rgba(0,0,0,0.15)') }), wrapM = SM({ color: C.wrap, map: texCloth('wrap', '#ffffff', 'rgba(60,50,40,0.35)', [1, 4]) });
  const G = () => new THREE.Group(), root = G(), hips = G(), chest = G(), neck = G(), J = {}; root.rotation.order = 'YXZ';
  root.add(hips); hips.position.y = 0.95; hips.add(chest);
  { const p = sph(0.15, legM, 1.15, 0.7, 0.8); p.position.y = 0.03; hips.add(p); }
  { const t = capsule(0.16, 0.22, topM, 10); t.scale.set(1.2, 1, 0.78); t.position.y = 0.3; chest.add(t);
    const ob = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.185, 0.07, 14), SM({ color: '#2b2219' })); ob.scale.z = 0.8; ob.position.y = 0.1; ob.castShadow = true; chest.add(ob);
    [-1, 1].forEach((s) => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.02), SM({ color: '#e8e2d2' })); c.position.set(s * 0.05, 0.36, 0.125); c.rotation.z = s * 0.35; chest.add(c); }); }
  chest.add(neck); neck.position.y = 0.5;
  { const nk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 8), skinM); neck.add(nk);
    const hd = sph(0.115, skinM, 0.9, 1.08, 1.0); hd.position.y = 0.14; neck.add(hd);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 5), skinM); nose.rotation.x = Math.PI / 2; nose.position.set(0, 0.13, 0.115); neck.add(nose);
    [-1, 1].forEach((s) => { const e = sph(0.025, skinM, 0.5, 1, 0.8); e.position.set(s * 0.105, 0.14, 0); neck.add(e); const ey = sph(0.012, SM({ color: '#1a1410' })); ey.position.set(s * 0.04, 0.16, 0.098); neck.add(ey); });
    const hr = sph(0.12, SM({ color: C.hair, roughness: 0.6 }), 0.95, 0.75, 1.02); hr.position.set(0, 0.2, -0.015); neck.add(hr);
    if (C.hat) { const st = SM({ color: '#c8a868', map: txCanvas('straw', 64, 64, (x, w, h, R) => { x.fillStyle = '#c8a868'; x.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { x.fillStyle = R.pick(['#a88848', '#e0c888', '#8a6a38']); x.fillRect(R.r(0, w), R.r(0, h), 1, R.r(3, 9)); } }) });
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.16, 18), st); hat.position.y = 0.33; hat.castShadow = true; neck.add(hat); const ch = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.006, 4, 12), SM({ color: '#3c2c1e' })); ch.position.set(0, 0.07, 0.02); ch.rotation.x = 0.4; neck.add(ch); }
    else if (C.band) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.108, 0.016, 6, 16), SM({ color: C.band })); b.rotation.x = Math.PI / 2; b.position.y = 0.19; neck.add(b); const k = sph(0.025, SM({ color: C.band }), 1.4, 0.8, 0.6); k.position.set(0.03, 0.19, -0.11); neck.add(k); } }
  const limb = (parent, x, y, r1, l1, m1, r2, l2, m2, end) => {
    const a = G(); a.position.set(x, y, 0); parent.add(a); const u = capsule(r1, l1 - r1, m1); u.position.y = -l1 / 2; a.add(u);
    const b = G(); b.position.y = -l1; a.add(b); const lo = capsule(r2, l2 - r2, m2); lo.position.y = -l2 / 2; b.add(lo);
    const e = G(); e.position.y = -l2; b.add(e); if (end) e.add(end);
    return { a, b, end: e };
  };
  const hand = () => { const h = sph(0.045, skinM, 0.9, 1.2, 0.6); h.position.y = -0.03; return h; };
  const foot = () => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.24), SM({ color: C.feet })); f.position.set(0, -0.02, 0.06); f.castShadow = true; return f; };
  J.armL = limb(chest, 0.25, 0.44, 0.058, 0.3, topM, 0.045, 0.27, skinM, hand());
  J.armR = limb(chest, -0.25, 0.44, 0.058, 0.3, topM, 0.045, 0.27, skinM, hand());
  J.legL = limb(hips, 0.1, 0, 0.08, 0.46, legM, 0.06, 0.45, wrapM, foot());
  J.legR = limb(hips, -0.1, 0, 0.08, 0.46, legM, 0.06, 0.45, wrapM, foot());
  J.handR = J.armR.end; J.handL = J.armL.end;
  root.userData = { hips, chest, neck, J };
  return root;
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

const SEA_Y = 0;
const BOAT = { x: 0, z: 0, ry: 0 };   // the boat's bow points to -z
// ---- textures: hull paint, wood deck, rusty steel, the creature's wet black skin
function texHull() { return txCanvas('hull', 256, 128, (x, w, h, R) => { x.fillStyle = '#e6e4da'; x.fillRect(0, 0, w, h); x.fillStyle = '#8e3a24'; x.fillRect(0, h * 0.72, w, h * 0.28); x.fillStyle = '#26304a'; x.fillRect(0, h * 0.62, w, h * 0.06);
  for (let i = 0; i < 60; i++) { x.fillStyle = 'rgba(110,70,40,0.35)'; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(6, 30)); } x.fillStyle = '#26304a'; for (let k = 0; k < 4; k++) x.fillRect(30 + k * 14, 20, 9, 18); }, [1, 1]); }
function texSkin() { return txCanvas('skin', 256, 256, (x, w, h, R) => { x.fillStyle = '#0d0f12'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) { x.fillStyle = R.pick(['rgba(40,48,56,0.5)', 'rgba(20,24,28,0.6)', 'rgba(70,80,90,0.25)']); blob(x, R.r(0, w), R.r(0, h), R.r(3, 18), RNG('sk', i)); x.fill(); }
  for (let i = 0; i < 80; i++) { let px = R.r(0, w), py = 0; x.strokeStyle = 'rgba(140,170,180,0.25)'; x.lineWidth = R.r(1, 2.5); x.beginPath(); x.moveTo(px, py); while (py < h) { py += R.r(8, 20); px += R.n(2); x.lineTo(px, py); } x.stroke(); } }, [2, 2]); }
// ---- the boat
function mkBoat() {
  const g = new THREE.Group(), hullM = SM({ map: texHull(), roughness: 0.6 }), deck = SM({ map: texPlank(), color: '#a08068' }), wht = SM({ color: '#d3d6cc' }), dk = SM({ color: '#2b2d29' }), rust = SM({ color: '#7e3a26', roughness: 0.7 });
  // hull: a lathe-like shape, pointed bow at -z
  const sh = new THREE.Shape(); sh.moveTo(-2.2, 6); sh.lineTo(2.2, 6); sh.quadraticCurveTo(2.5, -2, 0, -8); sh.quadraticCurveTo(-2.5, -2, -2.2, 6);
  const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 2.2, bevelEnabled: false }), hullM); hull.rotation.x = Math.PI / 2; hull.position.y = 1.3; g.add(hull);
  deck.side = THREE.DoubleSide; const dk2 = new THREE.Mesh(new THREE.ShapeGeometry(sh), deck); dk2.rotation.x = Math.PI / 2; dk2.position.y = 1.33; dk2.scale.setScalar(0.97); g.add(dk2);
  g.userData.railPts = []; for (let i = 0; i <= 60; i++) { const u = i / 60, x = (1 - u) ** 2 * 2.2 + 2 * (1 - u) * u * 2.5, z = (1 - u) ** 2 * 6 + 2 * (1 - u) * u * -2 + u * u * -8; g.userData.railPts.push([z, x]); }
  const rail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sh.getPoints(30).map((p) => V3(p.x, 1.95, p.y))), 60, 0.05, 5, true), wht); g.add(rail);
  const bul = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sh.getPoints(30).map((p) => V3(p.x, 1.45, p.y))), 60, 0.12, 5, true), wht); g.add(bul);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 2.4), wht); cab.position.set(0, 2.25, 2.6); g.add(cab);
  const cabTop = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 2.6), dk); cabTop.position.set(0, 3.2, 2.6); g.add(cabTop);
  for (let k = 0; k < 3; k++) { const wn = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.05), new THREE.MeshBasicMaterial({ color: '#c4a458' })); wn.position.set(-0.8 + k * 0.8, 2.2, 1.38); g.add(wn); }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 7, 6), wht); mast.position.set(0, 4.5, 0.5); g.add(mast);
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), wht); boom.rotation.z = Math.PI / 2; boom.position.set(0, 6.5, 0.5); g.add(boom);
  const stern = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 4, 6), wht); stern.position.set(0, 3, 5.6); g.add(stern);
  // the lamp line: bare bulbs from bow post to mast to stern post, on both sides
  g.userData.bulbs = []; const bulbG = new THREE.SphereGeometry(0.12, 8, 6), glowT = g3Radial([[0, 'rgba(255,255,240,1)'], [0.25, 'rgba(255,250,220,0.5)'], [1, 'rgba(255,240,200,0)']]);
  [-1, 1].forEach((sd) => { const pts = [V3(sd * 0.3, 3.2, -7), V3(sd * 1.6, 6.3, 0.5), V3(sd * 0.3, 4.9, 5.6)]; const cv = new THREE.CatmullRomCurve3(pts);
    const wire = new THREE.Mesh(new THREE.TubeGeometry(cv, 30, 0.015, 3), dk); g.add(wire);
    for (let k = 0; k <= 16; k++) { const p = cv.getPoint(k / 16).add(V3(0, -0.2, 0)); const b = new THREE.Mesh(bulbG, new THREE.MeshBasicMaterial({ color: '#fbf7ea' })); b.position.copy(p); g.add(b);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#fff6dc' })); s.scale.setScalar(0.9); s.position.copy(p); g.add(s); g.userData.bulbs.push({ b, s, i: g.userData.bulbs.length }); } });
  g.userData.lamps = [V3(0, 6, -3), V3(0, 6, 3)].map((p) => { const l = new THREE.PointLight('#fff1d0', 2.2, 26, 1.6); l.position.copy(p); g.add(l); return l; });
  // nets, floats, crates, the squid racks, the bucket, the ladle hook
  const net = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), SM({ color: '#3f4542', wireframe: false, map: txCanvas('net', 64, 64, (x, w, h) => { x.fillStyle = '#3a4a48'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8fb1b0'; x.lineWidth = 2; for (let i = 0; i < w; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 8, h); x.moveTo(i + 8, 0); x.lineTo(i, h); x.stroke(); } }, [3, 3]) }));
  net.scale.set(1.2, 0.35, 1.0); net.position.set(-1.1, 1.3, 4.6); g.add(net);
  for (let k = 0; k < 5; k++) { const f = sph(0.18, SM({ color: k % 2 ? '#d9592a' : '#c4a458' })); f.position.set(1.4 - k * 0.12, 1.25, -2 + k * 0.4); g.add(f); }
  for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.5), SM({ color: '#4e8389', map: texPlank() })); c.position.set(1.2, 1.25 + k * 0.46 * (k < 2 ? 1 : 0), 4.2 - (k === 2 ? 0.6 : 0)); g.add(c); }
  const bucket = new THREE.Group(); { const bk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.45, 14, 1, true), SM({ color: '#848a8b', metalness: 0.5, side: THREE.DoubleSide })); bk.position.y = 0.22; bucket.add(bk); const bt = new THREE.Mesh(new THREE.CircleGeometry(0.22, 14), SM({ color: '#5b6466' })); bt.rotation.x = -Math.PI / 2; bt.position.y = 0.01; bucket.add(bt); const hd = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.015, 4, 16, Math.PI), dk); hd.position.y = 0.45; bucket.add(hd); }
  bucket.position.set(0.9, 1.33, 1.0); bucket.scale.setScalar(1.5); g.add(bucket); g.userData.bucket = bucket;
  const hook = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), dk); hook.position.set(-1.3, 2.4, 1.39); g.add(hook);
  g.userData.ladle = mkLadle(true); g.userData.ladle.position.set(-1.3, 2.2, 1.45); g.add(g.userData.ladle);
  // the sonar screen in the cabin
  { const con = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.0, 0.5), SM({ color: '#2b2d29' })); con.position.set(0.75, 2.2, 1.12); g.add(con);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.45), SM({ color: '#3f4542' })); leg.position.set(0.75, 1.75, 1.12); g.add(leg);
    for (let k = 0; k < 4; k++) { const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), SM({ color: '#848a8b' })); kn.rotation.x = Math.PI / 2; kn.position.set(0.3 + k * 0.3, 1.78, 0.86); g.add(kn); } }
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.7), new THREE.MeshBasicMaterial({ map: sonarTex() })); scr.position.set(0.75, 2.25, 0.84); scr.rotation.y = Math.PI; g.add(scr); g.userData.sonar = scr;
  g.traverse((m) => { if (m.isMesh && !m.material.isMeshBasicMaterial) { m.castShadow = true; m.receiveShadow = true; } }); return g;
}
function mkLadle(broken) {
  const g = new THREE.Group(), wood = SM({ color: '#a07c50', map: texPlank() });
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.9, 6), wood); h.position.y = 0.45; g.add(h);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.18, 12, 1, true), SM({ color: '#a07c50', map: texPlank(), side: THREE.DoubleSide })); cup.position.set(0, -0.05, 0.12); cup.rotation.x = Math.PI / 2; g.add(cup);
  if (!broken) { const b = new THREE.Mesh(new THREE.CircleGeometry(0.14, 12), wood); b.position.set(0, -0.05, 0.21); g.add(b); }
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; }); return g;
}
let _sonar = null;
function sonarTex() { if (_sonar) return _sonar.t; const c = document.createElement('canvas'); c.width = 96; c.height = 64; const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.magFilter = THREE.NearestFilter; _sonar = { c, t }; drawSonar(0, 0); return t; }
function drawSonar(t, k) {   // k: 0..1 how far the big echo has risen
  const x = _sonar.c.getContext('2d'), w = 96, h = 64; x.fillStyle = '#0b2c38'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < w; i++) { const age = (w - i) / w, depth = 50 + 4 * Math.sin(i * 0.3); x.fillStyle = '#c4a458'; x.fillRect(i, depth, 1, 2); x.fillStyle = '#5a2418'; x.fillRect(i, depth + 2, 1, h - depth);
    const top = lerp(56, 8, clamp(k - age * 0.8)); if (k > 0 && i > w * (1 - k)) { x.fillStyle = '#b3271c'; x.fillRect(i, top, 1, depth - top); x.fillStyle = '#c4a458'; x.fillRect(i, top + 2, 1, (depth - top) * 0.6); } }
  x.fillStyle = '#4e8389'; x.fillRect(0, 0, w, 1); x.fillRect(Math.floor(t * 20) % w, 0, 1, h); _sonar.t.needsUpdate = true;
}
// ---- the Umibōzu: head and shoulders from a lathe (bald dome, a neck that widens into shoulders), arms with huge hands
function mkUmi() {
  const g = new THREE.Group(), U = {}, skin = new THREE.MeshPhongMaterial({ color: '#15181c', specular: '#3f4542', shininess: 25, map: texSkin(), side: THREE.DoubleSide });
  const pts = [[0, 9.6], [1.8, 9.4], [3.0, 8.7], [3.5, 7.6], [3.6, 6.4], [3.4, 5.0], [2.9, 3.9], [2.6, 3.3], [3.6, 2.8], [6.2, 2.2], [7.6, 1.0], [8.0, -3], [7.6, -9], [6.0, -14], [3.0, -17], [0, -18]].reverse().map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), skin); body.scale.z = 0.72; g.add(body); U.body = body;
  // the face: deep sockets carved as dark shadows around the eyes, a brow ridge melted into the dome
  { const brow = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.42, 10, 32, Math.PI), skin); brow.position.set(0, 6.1, 1.85); brow.scale.set(1, 0.55, 0.7); brow.rotation.x = -0.25; g.add(brow);
    [-1, 1].forEach((sd) => { const sk = new THREE.Mesh(new THREE.CircleGeometry(1.15, 24), new THREE.MeshBasicMaterial({ color: '#020306' })); sk.position.set(sd * 1.3, 6.4, 2.46); sk.rotation.y = sd * 0.3; sk.scale.set(1, 0.85, 1); g.add(sk); }); }
  // the eyes: flat white discs with a glow, no pupils
  const glowT = g3Radial([[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(220,240,240,0.55)'], [1, 'rgba(180,220,220,0)']]);
  U.eyes = [-1, 1].map((sd) => { const e = new THREE.Mesh(new THREE.CircleGeometry(0.75, 24), new THREE.MeshBasicMaterial({ color: '#f4f8f4' })); e.position.set(sd * 1.3, 6.45, 2.52); e.rotation.y = sd * 0.3; e.scale.setScalar(0.85); g.add(e);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#d3e6e6' })); s.position.copy(e.position).add(V3(0, 0, 0.3)); s.scale.setScalar(5); g.add(s); return { e, s }; });
  // a vertical seam down the face that can part (the mouth)
  U.seam = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 3.2), new THREE.MeshBasicMaterial({ color: '#020306' })); U.seam.position.set(0, 4.3, 2.7); g.add(U.seam);
  U.mouth = new THREE.Mesh(new THREE.PlaneGeometry(1, 3.0), new THREE.MeshBasicMaterial({ color: '#5a2418' })); U.mouth.position.set(0, 4.3, 2.68); U.mouth.scale.x = 0.001; g.add(U.mouth);
  // barnacles and limpets on the shoulders and crown
  { const R = RNG('barn'), bar = IM(new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0), SM({ color: '#b9cbc6', roughness: 0.6 }), 160);
    for (let i = 0; i < 160; i++) { const a = R.r(-1.6, 1.6) + (R.f() < 0.5 ? Math.PI : 0), y = R.f() < 0.6 ? R.r(0.5, 2.6) : R.r(7.8, 9.4), r = y < 3 ? lerp(7.4, 4.4, (y - 0.4) / 2.2) : lerp(3.6, 1.5, (y - 7.8) / 1.6), s = R.r(0.12, 0.32);
      const p = V3(Math.sin(a) * r, y, Math.cos(a) * r * 0.72), n = p.clone().setY(y < 3 ? 2 : 3).normalize(); const q = new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), n);
      bar.setMatrixAt(i, new THREE.Matrix4().compose(p, q, V3(s, s * 0.8, s))); bar.setColorAt(i, lin(R.pick(['#d3d6cc', '#acb6b3', '#848a8b', '#5b6466']))); } g.add(bar); }
  // old ropes draped over the shoulders, and a torn net
  const ropeM = SM({ color: '#a07c50', map: txCanvas('straw2', 64, 64, (x, w, h) => { x.fillStyle = '#b8a070'; x.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#8a7048' : '#d0b888'; x.save(); x.translate(i * 8, 0); x.transform(1, 0, 0.6, 1, 0, 0); x.fillRect(0, 0, 4, h); x.restore(); } }, [8, 1]) });
  const PR = [[-3, 8.0], [1.0, 7.6], [2.2, 6.2], [2.8, 3.6], [3.3, 2.6], [3.9, 2.9], [5.0, 3.4], [6.4, 3.6], [7.6, 3.5], [8.7, 3.0], [9.4, 1.8], [9.6, 0]];
  const rr = (y) => { for (let i = 0; i < PR.length - 1; i++) if (y <= PR[i + 1][0]) return lerp(PR[i][1], PR[i + 1][1], (y - PR[i][0]) / (PR[i + 1][0] - PR[i][0])); return 0; };
  [[-1, 0.55], [1, 0.75], [-1, 1.15], [1, 1.35]].forEach(([sd, a0]) => { const pts2 = [3.2, 2.6, 1.8, 0.8, -0.6].map((y, k) => { const a = sd * (a0 + k * 0.12), r = rr(y) + 0.16; return V3(Math.sin(a) * r, y, Math.cos(a) * r * 0.72); });
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 30, 0.16, 6), ropeM)); });
  // water streaming off it: thin vertical line segments, animated
  { const n = 260, pos = new Float32Array(n * 6), R = RNG('drip'); U.dripP = []; for (let i = 0; i < n; i++) { const a = R.r(-1.4, 1.4), y0 = R.r(2.5, 9.2); U.dripP.push({ a, y0, v: R.r(0.6, 1.4), L: R.r(0.3, 1.2) }); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); U.drips = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#65969a', transparent: true, opacity: 0.45 })); U.drips.frustumCulled = false; g.add(U.drips); }
  // the arm: upper arm and forearm (two-bone IK, posed per shot), joints, barnacles; a huge hand: palm, knuckles, four long
  // three-jointed fingers with dark nails, a thumb. Hand frame: wrist at origin, fingers along +z, back of the hand +y.
  U.upper = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 1.0, 1, 18, 4), skin); g.add(U.upper);
  U.fore = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.86, 1, 18, 4), skin); g.add(U.fore);
  U.jS = sph(1.25, skin); U.jE = sph(0.95, skin); U.jW = sph(0.62, skin, 1.1, 0.8, 1.0); [U.jS, U.jE, U.jW].forEach((m) => g.add(m));
  { const R = RNG('armbar'); U.armBar = IM(new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0), SM({ color: '#acb6b3' }), 40); U.armBarP = [];
    for (let i = 0; i < 40; i++) U.armBarP.push({ seg: i % 2, u: R.r(0.1, 0.9), a: R.r(0, TAU), s: R.r(0.12, 0.28) }); g.add(U.armBar); }
  const hand = new THREE.Group(); g.add(hand); U.hand = hand;
  { const palm = sph(1, skin, 1.35, 0.5, 1.45); palm.position.set(0, 0, 1.1); hand.add(palm);
    const heel = sph(1, skin, 1.1, 0.55, 0.8); heel.position.set(0, -0.05, 0.25); hand.add(heel);
    for (let f = 0; f < 4; f++) { const k = sph(0.36, skin, 1, 0.8, 1); k.position.set(-0.98 + f * 0.65, 0.12, 2.3); hand.add(k); }
    const bh = IM(new THREE.ConeGeometry(1, 1, 6).translate(0, 0.5, 0), SM({ color: '#b9cbc6' }), 14), R = RNG('handbar');
    for (let i = 0; i < 14; i++) bh.setMatrixAt(i, M4c(R.r(-1, 1), 0.45, R.r(0.3, 2.0), 0, R.r(0.1, 0.2), R.r(0.08, 0.15), R.r(0.1, 0.2))); hand.add(bh); }
  U.fingers = []; const nail = SM({ color: '#2b2d29', roughness: 0.3 });
  for (let f = 0; f < 4; f++) { let par = new THREE.Group(); par.position.set(-0.98 + f * 0.65, 0, 2.35); par.rotation.y = (f - 1.5) * 0.07; hand.add(par); const segs = [], Ls = [1.35 - Math.abs(f - 1.5) * 0.12, 1.05, 0.85];
    for (let k = 0; k < 3; k++) { const l = Ls[k], sg = new THREE.Group(); sg.position.z = k ? Ls[k - 1] : 0; par.add(sg); const c = capsule(0.3 - k * 0.05, l, skin); c.rotation.x = Math.PI / 2; c.position.z = l / 2; sg.add(c); sg.add(sph(0.3 - k * 0.04, skin)); segs.push(sg); par = sg; }
    const n = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.5, 6), nail); n.rotation.x = Math.PI / 2; n.position.set(0, 0.05, Ls[2] + 0.15); par.add(n); U.fingers.push(segs); }
  { const th = new THREE.Group(); th.position.set(1.25, -0.15, 0.7); th.rotation.set(0, 0.75, -0.3); hand.add(th); U.thumb = []; let par = th;
    for (let k = 0; k < 2; k++) { const l = [1.1, 0.85][k], sg = new THREE.Group(); sg.position.z = k ? 1.1 : 0; par.add(sg); const c = capsule(0.34 - k * 0.06, l, skin); c.rotation.x = Math.PI / 2; c.position.z = l / 2; sg.add(c); sg.add(sph(0.33, skin)); U.thumb.push(sg); par = sg; } }
  // water sheets pouring off the head and shoulders (lengths set per frame down to the waterline)
  U.sheets = []; { const R = RNG('sheet'); const sm = shaderMat({ t: { value: 0 }, wet: { value: 1 } }, `uniform float t, wet;
    void main(){ float s=n2(vec2(vUv.x*6.,vUv.y*3.+t*3.))*0.6+n2(vec2(vUv.x*14.,vUv.y*7.+t*5.))*0.4; float edge=smoothstep(0.,0.3,vUv.x)*smoothstep(1.,0.7,vUv.x);
      float a=smoothstep(0.35,0.7,s)*edge*wet*(0.4+0.6*smoothstep(0.,0.4,1.-vUv.y)); gl_FragColor=vec4(mix(vec3(0.55,0.7,0.72),vec3(0.92,0.96,0.94),s),a);
      #END
    }`, { mat: { transparent: true, depthWrite: false, side: THREE.DoubleSide } }); U.sheetMat = sm;
    for (let i = 0; i < 18; i++) { const geo = new THREE.PlaneGeometry(1, 1, 1, 8).translate(0, -0.5, 0); const m = new THREE.Mesh(geo, sm); m.renderOrder = 6; m.frustumCulled = false;
      m.userData = { a: (R.f() < 0.5 ? -1 : 1) * R.r(0.2, 1.5), y0: i < 8 ? R.r(6.5, 9.0) : R.r(2.3, 3.0), w: R.r(0.5, 1.2) }; g.add(m); U.sheets.push(m); } }
  g.traverse((m) => { if (m.isMesh && !m.material.isMeshBasicMaterial) { m.castShadow = true; m.receiveShadow = true; } }); g.userData = U; return g;
}
const UMI_PROF = [[-3, 8.0], [1.0, 7.6], [2.2, 6.2], [2.8, 3.6], [3.3, 2.6], [3.9, 2.9], [5.0, 3.4], [6.4, 3.6], [7.6, 3.5], [8.7, 3.0], [9.4, 1.8], [9.6, 0]];
const umiR = (y) => { const P = UMI_PROF; if (y <= P[0][0]) return P[0][1]; for (let i = 0; i < P.length - 1; i++) if (y <= P[i + 1][0]) return lerp(P[i][1], P[i + 1][1], (y - P[i][0]) / (P[i + 1][0] - P[i][0])); return 0; };
function twoBone(S, T, L1, L2, pole) {
  const d = T.clone().sub(S), len = clamp(d.length(), 0.5, L1 + L2 - 0.05), dir = d.normalize(), a = (L1 * L1 - L2 * L2 + len * len) / (2 * len), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const po = pole.clone().addScaledVector(dir, -pole.dot(dir)).normalize(); return { E: S.clone().addScaledVector(dir, a).addScaledVector(po, h), W: S.clone().addScaledVector(dir, len) };
}
function poseUmi(Wd, o) {
  const B = Wd.umi, U = B.userData; B.visible = o.show ?? true; if (!B.visible) return;
  const s = o.s ?? 1; B.position.copy(o.pos); B.scale.setScalar(s); B.rotation.set(o.lean ?? 0, o.yaw ?? 0, 0); B.updateMatrixWorld(true);
  const eo = o.eyes ?? 1; U.eyes.forEach(({ e, s: sp }) => { e.scale.set(0.85, Math.max(0.02, eo) * 0.85, 0.85); sp.material.opacity = eo; });
  U.mouth.scale.x = Math.max(0.001, o.mouth ?? 0); U.seam.visible = (o.mouth ?? 0) < 0.05;
  if (typeof o.arm === 'function') o.arm = o.arm();
  const has = !!o.arm; [U.upper, U.fore, U.jS, U.jE, U.jW, U.hand, U.armBar].forEach((m) => (m.visible = has));
  if (has) { const A = o.arm, inv = B.quaternion.clone().invert(), toL = (v) => B.worldToLocal(v.clone()), dirL = (v) => v.clone().applyQuaternion(inv).normalize();
    const S = V3(-4.9, 2.7, 1.4), Wt = toL(A.wrist), pole = V3(-1, 1.3, -0.2), { E, W } = twoBone(S, Wt, 6.4, 6.4, pole);
    between(U.upper, S, E, 1.15); between(U.fore, E, W, 0.8); U.jS.position.copy(S); U.jE.position.copy(E); U.jW.position.copy(W);
    U.armBarP.forEach((q, i) => { const a = q.seg ? S : E, b = q.seg ? E : W, p = a.clone().lerp(b, q.u), ax = b.clone().sub(a).normalize(), side = V3(Math.cos(q.a), 0.3, Math.sin(q.a)).addScaledVector(ax, -V3(Math.cos(q.a), 0.3, Math.sin(q.a)).dot(ax)).normalize();
      p.addScaledVector(side, q.seg ? 0.95 : 0.8); U.armBar.setMatrixAt(i, new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), side), V3(q.s, q.s * 0.8, q.s))); }); U.armBar.instanceMatrix.needsUpdate = true;
    const Z = dirL(A.fdir), Y0 = dirL(A.back), Y = Y0.addScaledVector(Z, -Y0.dot(Z)).normalize(), X = Y.clone().cross(Z);
    U.hand.position.copy(W); U.hand.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z)); U.hand.scale.setScalar(A.hs ?? 1);
    const c = A.curl ?? 0.3; U.fingers.forEach((sg, f) => sg.forEach((m, j) => (m.rotation.x = c * [0.55, 0.8, 0.9][j] + 0.04 * Math.sin(TT * 2 + f + j) * (A.twitch ?? 0))));
    U.thumb.forEach((m, j) => (m.rotation.x = (A.thumb ?? c) * [0.4, 0.6][j])); }
  // water sheets down to the waterline; drips
  const wl = (0 - B.position.y) / s, wet = o.wet ?? 0.3; U.sheetMat.uniforms.t.value = TT; U.sheetMat.uniforms.wet.value = wet;
  U.sheets.forEach((m) => { const { a, y0, w } = m.userData, r = umiR(y0) + 0.12, len = y0 - Math.max(wl, -3); m.visible = wet > 0.02 && len > 0.3 && y0 > wl;
    const nx = Math.sin(a), nz = Math.cos(a); m.position.set(nx * r, y0, nz * r * 0.72); m.rotation.set(0, Math.atan2(nx, nz / 0.72), 0); m.scale.set(w, len, 1); });
  const P = U.drips.geometry.attributes.position, t = TT;
  U.dripP.forEach((q, i) => { const y = q.y0 - mod(t * q.v * 1.5, q.y0 + 1), rr = umiR(y) + 0.06, x = Math.sin(q.a) * rr, z = Math.cos(q.a) * rr * 0.72; P.setXYZ(i * 2, x, y, z); P.setXYZ(i * 2 + 1, x, y - q.L, z); }); P.needsUpdate = true;
}
function world() {
  if (WJ) return WJ;
  const scene = new THREE.Scene(), Wd = { scene };
  scene.fog = new THREE.Fog('#172728', 40, 400);
  Wd.cam = new THREE.PerspectiveCamera(50, YK.LW / YK.LH, 0.1, 4000);
  Wd.hemi = new THREE.HemisphereLight('#346c76', '#06090f', 0.7); scene.add(Wd.hemi);
  const sun = new THREE.DirectionalLight('#b9cbc6', 1.2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -40; sc.right = 40; sc.top = 40; sc.bottom = -40; sc.near = 1; sc.far = 400; sun.shadow.bias = -0.0005;
  scene.add(sun); scene.add(sun.target); Wd.sun = sun;
  Wd.sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), shaderMat({ top: { value: lin('#06090f') }, hor: { value: lin('#1f3c44') }, cloud: { value: lin('#26304a') }, cloudSh: { value: lin('#0b1a22') }, sunCol: { value: lin('#d3d6cc') }, sunDir: { value: V3(-0.3, 0.35, -0.9) }, t: { value: 0 }, cover: { value: 0.55 }, stars: { value: 1 } },
    `uniform vec3 top, hor, cloud, cloudSh, sunCol, sunDir; uniform float t, cover, stars;
    void main(){ vec3 d=normalize(vW-cameraPosition); float y=max(d.y,0.); vec3 c=mix(hor,top,pow(y,0.45));
      vec2 sp=vec2(atan(d.x,d.z)*180.,d.y*300.); c+=vec3(step(0.996,h2(floor(sp)))*smoothstep(0.05,0.3,d.y)*stars)*0.8;
      vec2 uv=d.xz/(d.y+0.12)*0.8+vec2(t*0.004,0.); float cl=smoothstep(cover,cover+0.15,fbm(uv*0.6))*smoothstep(0.,0.15,d.y); c=mix(c,mix(cloud,cloudSh,fbm(uv*0.6+0.1)),cl*0.8);
      float s=max(dot(d,normalize(sunDir)),0.); c+=sunCol*(pow(s,10.)*0.4+smoothstep(0.9994,0.9997,s)*2.);
      gl_FragColor=vec4(c,1.);
      #include <encodings_fragment>
    }`, { mat: { side: THREE.BackSide, depthWrite: false } })); Wd.sky.material.fog = false; Wd.sky.renderOrder = -10; scene.add(Wd.sky);
  // the sea: displaced swells + a water dome, a ring wave, eye glows under the surface; shaded per fragment from the same
  // height function (normals, fresnel to the sky, moon and lamp glints, foam on crests, around the dome and on the ring)
  const SEA_GL = `uniform float t, calm, agit, bumpR, bumpH, ringT, ringA, eyeI; uniform vec2 bumpC, ringC; uniform vec4 eyes;
  float H(vec2 q){ float k=(1.-calm*0.85)*(1.+agit);
    float w=0.42*sin(dot(q,vec2(0.12,0.05))+t*0.9)+0.26*sin(dot(q,vec2(-0.07,0.16))+t*1.2)+0.14*sin(dot(q,vec2(0.31,0.22))+t*1.9)+0.08*sin(dot(q,vec2(-0.45,0.38))+t*2.6);
    float d=distance(q,bumpC); float b=bumpH*exp(-d*d/(bumpR*bumpR));
    float dr=distance(q,ringC); float r= ringT>0. ? ringA*sin(dr*0.7-ringT*7.)*exp(-abs(dr-ringT*9.)/6.)*exp(-ringT*0.3) : 0.;
    return w*k+b+r; }
  `;
  const seaU = { t: { value: 0 }, calm: { value: 0 }, agit: { value: 0 }, bumpR: { value: 20 }, bumpH: { value: 0 }, ringT: { value: -1 }, ringA: { value: 0 }, eyeI: { value: 0 }, bumpC: { value: new THREE.Vector2() }, ringC: { value: new THREE.Vector2() }, eyes: { value: new THREE.Vector4() },
    deep: { value: lin('#06090f') }, hi: { value: lin('#346c76') }, sky: { value: lin('#2a4f57') }, foamC: { value: lin('#d3d6cc') }, lamp: { value: lin('#efd7a2') }, boat: { value: V3(0, 0, 0) }, lampOn: { value: 1 }, moonDir: { value: V3(-0.3, 0.35, -0.9) } };
  const seaMat = shaderMat(seaU, SEA_GL + `uniform vec3 deep, hi, sky, foamC, lamp, boat, moonDir; uniform float lampOn;
    void main(){ vec2 q=vW.xz; float e=0.35, h0=H(q);
      vec3 N=normalize(vec3(H(q-vec2(e,0.))-H(q+vec2(e,0.)), 2.*e, H(q-vec2(0.,e))-H(q+vec2(0.,e))));
      N=normalize(N+vec3(n2(q*1.3+t*0.3)-0.5,0.,n2(q*1.3-t*0.25+7.)-0.5)*0.16*(1.-calm*0.7));
      vec3 V=normalize(cameraPosition-vW); float fr=pow(1.-max(dot(N,V),0.),3.);
      vec3 c=mix(deep, sky, clamp(fr,0.,1.)); c=mix(c, hi, clamp(h0*0.1+0.12,0.,0.3)*(0.6+0.4*max(N.x+N.z,0.)));
      vec3 R=reflect(-V,N); float m=pow(max(dot(R,normalize(moonDir)),0.),90.);
      vec3 toL=normalize(vec3(boat.x,6.,boat.z)-vW); float l=pow(max(dot(R,toL),0.),24.)*smoothstep(90.,4.,distance(q,boat.xz))*lampOn;
      float d=distance(q,bumpC); float foam=smoothstep(0.5,0.85,fbm(q*0.7+t*0.5))*smoothstep(bumpR*1.25,bumpR*0.55,d)*clamp(abs(bumpH)*0.5,0.,1.)*0.45;
      float bb=bumpH*exp(-d*d/(bumpR*bumpR)); foam+=smoothstep(0.35,0.75,h0-bb-0.45*(1.-calm))*0.7*(0.4+agit);
      float dr=distance(q,ringC); foam+= ringT>0. ? smoothstep(4.,0.,abs(dr-ringT*9.))*exp(-ringT*0.35)*smoothstep(0.35,0.7,fbm(q*1.2+t)) : 0.;
      float eg=exp(-pow(distance(q,eyes.xy),2.)/3.)+exp(-pow(distance(q,eyes.zw),2.)/3.); float eh=exp(-pow(distance(q,eyes.xy),2.)/30.)+exp(-pow(distance(q,eyes.zw),2.)/30.);
      c+=vec3(0.85,0.9,0.85)*m*1.6+lamp*l*1.3+vec3(0.75,0.95,0.9)*(eg*1.1+eh*0.06)*eyeI; c=mix(c, foamC, clamp(foam,0.,0.9));
      gl_FragColor=vec4(c,1.);
      #END
    }`, { vpre: SEA_GL, vbody: `vec2 wq=(modelMatrix*vec4(position,1.)).xz; p.y += H(wq);` });
  Wd.sea = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400, 350, 350).rotateX(-Math.PI / 2), seaMat); scene.add(Wd.sea);
  Wd.seaFar = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000, 60, 60).rotateX(-Math.PI / 2), seaMat); Wd.seaFar.position.y = -0.8; scene.add(Wd.seaFar);
  // foam: a churning skirt where a body meets the water, and a foam disc spreading round it
  Wd.skirt = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.15, 1, 48, 1, true), shaderMat({ t: { value: 0 }, k: { value: 1 } }, `uniform float t, k;
    void main(){ float a=atan(vW.z,vW.x); float f=n2(vec2(a*9.,vUv.y*3.-t*2.5))*0.6+n2(vec2(a*23.,vUv.y*6.-t*4.))*0.4; float al=smoothstep(0.5,0.8,f)*pow(1.-vUv.y,1.5)*k*0.6;
      gl_FragColor=vec4(vec3(0.75,0.85,0.84),al);
      #END
    }`, { mat: { transparent: true, depthWrite: false, side: THREE.DoubleSide } })); Wd.skirt.renderOrder = 7; Wd.skirt.visible = false; scene.add(Wd.skirt);
  Wd.foam = new THREE.Mesh(new THREE.RingGeometry(0.9, 2.2, 64, 4).rotateX(-Math.PI / 2), shaderMat({ t: { value: 0 }, k: { value: 1 } }, `uniform float t, k;
    void main(){ float r=length(vUv-0.5)*2.; float f=fbm(vW.xz*0.35+vec2(t*0.3,-t*0.2)); float al=smoothstep(0.45,0.75,f)*smoothstep(1.,0.4,r)*k;
      gl_FragColor=vec4(vec3(0.88,0.93,0.9),al*0.9);
      #END
    }`, { mat: { transparent: true, depthWrite: false } })); Wd.foam.renderOrder = 5; Wd.foam.visible = false; scene.add(Wd.foam);
  // spray thrown up round the waterline; a stream pouring from the bottomless ladle
  { const R = RNG('spray'), n = 1400; Wd.sprayP = []; for (let i = 0; i < n; i++) Wd.sprayP.push({ a: R.r(0, TAU), rj: R.r(0.85, 1.25), vy: R.r(3, 10), vo: R.r(0.5, 4), ph: R.f() });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); Wd.spray = new THREE.Points(g, new THREE.PointsMaterial({ color: '#eef6f4', size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false })); Wd.spray.frustumCulled = false; Wd.spray.visible = false; scene.add(Wd.spray);
    const m = 500; Wd.streamP = []; for (let i = 0; i < m; i++) Wd.streamP.push({ jx: R.n(0.5), jz: R.n(0.5), ph: R.f() });
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.BufferAttribute(new Float32Array(m * 3), 3)); Wd.stream = new THREE.Points(g2, new THREE.PointsMaterial({ color: '#b9cbc6', size: 2.5, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false })); Wd.stream.frustumCulled = false; Wd.stream.visible = false; scene.add(Wd.stream); }
  Wd.bigLadle = new THREE.Group(); { const wood = SM({ color: '#c8a878', map: texPlank() }), inner = SM({ color: '#5a4430', side: THREE.DoubleSide }); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.95, 8), wood); h.position.y = 0.5; Wd.bigLadle.add(h);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.17, 0.2, 18, 1, true), SM({ color: '#c8a878', map: texPlank(), side: THREE.DoubleSide })); wall.rotation.x = Math.PI / 2; wall.position.set(0, 0, 0.1); Wd.bigLadle.add(wall);
    const bs = new THREE.Shape(); bs.absarc(0, 0, 0.17, 0, TAU); const hole = new THREE.Path(); for (let i = 0; i <= 9; i++) { const a = i / 9 * TAU, r = 0.08 + 0.03 * Math.sin(i * 2.7); i ? hole.lineTo(Math.cos(a) * r, Math.sin(a) * r) : hole.moveTo(Math.cos(a) * r, Math.sin(a) * r); } bs.holes.push(hole);
    const bot = new THREE.Mesh(new THREE.ShapeGeometry(bs), inner); bot.position.set(0, 0, 0.0); Wd.bigLadle.add(bot);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.018, 6, 20), SM({ color: '#a07c50' })); rim.position.z = 0.2; Wd.bigLadle.add(rim);
    Wd.bigLadle.traverse((m) => { if (m.isMesh) m.castShadow = true; }); Wd.bigLadle.visible = false; scene.add(Wd.bigLadle); }
  // rain
  { const n = 2400, pos = new Float32Array(n * 6), R = RNG('rain'); Wd.rainP = []; for (let i = 0; i < n; i++) Wd.rainP.push({ x: R.n(1), y: R.f(), z: R.n(1), v: R.r(0.8, 1.2) });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); Wd.rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#8fb1b0', transparent: true, opacity: 0.45, depthWrite: false })); Wd.rain.frustumCulled = false; scene.add(Wd.rain); }
  Wd.moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,255,250,1)'], [0.16, 'rgba(240,245,240,1)'], [0.2, 'rgba(200,220,220,0.4)'], [1, 'rgba(160,200,200,0)']], 128), transparent: true, depthWrite: false, fog: false })); Wd.moon.scale.setScalar(260); Wd.moon.position.set(-600, 700, -1800); scene.add(Wd.moon);
  // distant island silhouettes
  { const R = RNG('isl'); for (let i = 0; i < 5; i++) { const h = new THREE.Mesh(new THREE.ConeGeometry(R.r(80, 200), R.r(30, 90), 7), SM({ color: '#0b1a22' })); h.scale.z = 0.5; h.position.set(R.r(-1500, 1500), 0, R.r(-1400, -900)); scene.add(h); } }
  Wd.boat = mkBoat(); scene.add(Wd.boat);
  Wd.man = mkMan({ legs: '#3c2c1e', wrap: '#d3d6cc', band: '#eeeadb', hat: true, skin: '#c8946a', feet: '#3c2c1e' }); scene.add(Wd.man);
  Wd.umi = mkUmi(); scene.add(Wd.umi);
  // the harbour at dawn: other boats with holed buckets and broken ladles hanging, a quay
  Wd.harbour = new THREE.Group(); { const quay = new THREE.Mesh(new THREE.BoxGeometry(60, 2, 8), SM({ map: texStone(), color: '#8a8c84' })); quay.position.set(0, 0.6, -9); Wd.harbour.add(quay);
    for (let i = 0; i < 3; i++) { const b = mkBoat(); b.scale.setScalar(0.9); b.position.set(-14 + i * 12, 0, -1 + (i % 2) * 2); b.rotation.y = Math.PI / 2 + (i - 1) * 0.06; b.userData.bulbs.forEach(({ b: bb, s }) => { bb.material = new THREE.MeshBasicMaterial({ color: '#848a8b' }); s.visible = false; }); b.userData.lamps.forEach((l) => (l.visible = false)); Wd.harbour.add(b);
      for (let k = 0; k < 3; k++) { const bk = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.33, 0.62, 12, 1, true), SM({ color: '#a8a89c', side: THREE.DoubleSide })); bk.position.set(b.position.x - 1.1 + k * 1.1, 1.5, b.position.z + 2.6); Wd.harbour.add(bk);
        const bot = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.33, 14), SM({ color: '#848a8b', side: THREE.DoubleSide })); bot.rotation.x = -Math.PI / 2; bot.position.copy(bk.position).add(V3(0, -0.3, 0)); Wd.harbour.add(bot);
        const lad = mkLadle(true); lad.scale.setScalar(1.2); lad.position.copy(bk.position).add(V3(0.45, 0.2, 0.2)); lad.rotation.z = 0.4; Wd.harbour.add(lad); } }
    const torii = new THREE.Group(), red = SM({ color: '#8e3a24' }); [-2, 2].forEach((x) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 6, 8), red); p.position.set(x, 3, 0); torii.add(p); }); const kb = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 0.5), red); kb.position.y = 6; torii.add(kb); const nk = new THREE.Mesh(new THREE.BoxGeometry(5, 0.3, 0.4), red); nk.position.y = 5; torii.add(nk);
    torii.position.set(16, 1.6, -10); Wd.harbour.add(torii); Wd.harbour.visible = false; scene.add(Wd.harbour); }
  const grad = new THREE.DataTexture(new Uint8Array([45, 45, 45, 255, 135, 135, 135, 255, 255, 255, 255, 255]), 3, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const done = new Map(); scene.traverse((m) => { if (!m.isMesh || !m.material || !m.material.isMeshStandardMaterial) return; const o = m.material;
    if (!done.has(o)) done.set(o, new THREE.MeshToonMaterial({ color: o.color, map: o.map, vertexColors: o.vertexColors, side: o.side, gradientMap: grad, transparent: o.transparent })); m.material = done.get(o); });
  WJ = Wd; return Wd;
}
const SEA = { calm: 0, agit: 0, bumpR: 20, bumpH: 0, bumpC: [0, 0], ringT: -1, ringA: 0, ringC: [0, 0], eyeI: 0, eyes: [0, 0, 0, 0] };
function Hs(x, z) { const k = (1 - SEA.calm * 0.85) * (1 + SEA.agit), t = TT;
  const w = 0.42 * Math.sin(x * 0.12 + z * 0.05 + t * 0.9) + 0.26 * Math.sin(-x * 0.07 + z * 0.16 + t * 1.2) + 0.14 * Math.sin(x * 0.31 + z * 0.22 + t * 1.9) + 0.08 * Math.sin(-x * 0.45 + z * 0.38 + t * 2.6);
  const d = Math.hypot(x - SEA.bumpC[0], z - SEA.bumpC[1]), b = SEA.bumpH * Math.exp(-d * d / (SEA.bumpR * SEA.bumpR)), dr = Math.hypot(x - SEA.ringC[0], z - SEA.ringC[1]);
  const r = SEA.ringT > 0 ? SEA.ringA * Math.sin(dr * 0.7 - SEA.ringT * 7) * Math.exp(-Math.abs(dr - SEA.ringT * 9) / 6) * Math.exp(-SEA.ringT * 0.3) : 0; return w * k + b + r; }
// the water effects round the creature: skirt, foam disc, spray (o: { wet, splash, foam })
function waterFX(Wd, o = {}) {
  const B = Wd.umi, on = B.visible && o.fx !== false; Wd.skirt.visible = Wd.foam.visible = Wd.spray.visible = false; if (!on) return;
  const s = B.scale.x, wl = (0 - B.position.y) / s, r = (umiR(wl) + 0.4) * s, c = B.position, k = o.foam ?? 0.8;
  if (wl > -3 && wl < 9.2) { Wd.skirt.visible = true; Wd.skirt.position.set(c.x, -0.4, c.z); Wd.skirt.scale.set(r, 1.6 + 2 * (o.splash ?? 0), r * 0.78); Wd.skirt.rotation.y = B.rotation.y; Wd.skirt.material.uniforms.k.value = k;
    Wd.foam.visible = true; Wd.foam.position.set(c.x, 0.12, c.z); Wd.foam.scale.set(r, 1, r * 0.8); Wd.foam.rotation.y = B.rotation.y; Wd.foam.material.uniforms.k.value = k; }
  const sp = o.splash ?? 0; if (sp > 0.02) { Wd.spray.visible = true; Wd.spray.material.opacity = 0.9 * sp; const P = Wd.spray.geometry.attributes.position;
    Wd.sprayP.forEach((q, i) => { const tt = mod(q.ph + TT * 0.7, 1) * 1.6, rr = r * q.rj + q.vo * tt, y = 0.2 + q.vy * tt * (0.5 + sp) - 4.9 * tt * tt;
      P.setXYZ(i, c.x + Math.cos(q.a) * rr, y > 0 ? y : -50, c.z + Math.sin(q.a) * rr * 0.8); }); P.needsUpdate = true; }
}
const LIGHT = {
  night: { top: '#06090f', hor: '#1f3c44', cloud: '#26304a', cloudSh: '#0b1a22', sunC: '#b9cbc6', sunI: 1.0, sunD: [-0.3, 0.5, -0.8], hemS: '#346c76', hemG: '#06090f', hemI: 0.7, fog: '#172728', fn: 30, ff: 500, cover: 0.55, exp: 1.0, stars: 1, deep: '#06090f', hi: '#2a4f57' },
  dawn:  { top: '#4e8389', hor: '#cfae78', cloud: '#d3d6cc', cloudSh: '#65969a', sunC: '#efd7a2', sunI: 2.0, sunD: [0.7, 0.2, -0.7], hemS: '#8fb1b0', hemG: '#3c2c1e', hemI: 1.0, fog: '#8fb1b0', fn: 20, ff: 400, cover: 0.5, exp: 1.0, stars: 0, deep: '#1f3c44', hi: '#8fb1b0' },
};
function setLight(Wd, L, focus) {
  const U = Wd.sky.material.uniforms; U.top.value.set(L.top); U.hor.value.set(L.hor); U.cloud.value.set(L.cloud); U.cloudSh.value.set(L.cloudSh); U.cover.value = L.cover; U.stars.value = L.stars;
  Wd.sun.color.set(L.sunC); Wd.sun.intensity = L.sunI; const f = focus || V3(0, 2, 0); Wd.sun.target.position.copy(f); Wd.sun.position.copy(f).addScaledVector(V3(...L.sunD).normalize(), 120); Wd.sun.target.updateMatrixWorld();
  Wd.hemi.color.set(L.hemS); Wd.hemi.groundColor.set(L.hemG); Wd.hemi.intensity = L.hemI; Wd.scene.fog.color.set(L.fog); Wd.scene.fog.near = L.fn; Wd.scene.fog.far = L.ff;
  const S = Wd.sea.material.uniforms; S.deep.value.set(L.deep); S.hi.value.set(L.hi); S.sky.value.set(L.seaSky || L.hor); Wd.moon.visible = L.stars > 0; rend().r.toneMappingExposure = L.exp;
}
function animWorld(Wd, t, o = {}) {
  WIND.value = t; Wd.sky.material.uniforms.t.value = t; SEA.calm = o.calm ?? SEA.calm; const S = Wd.sea.material.uniforms; S.t.value = t; S.calm.value = SEA.calm; S.agit.value = SEA.agit;
  S.bumpR.value = SEA.bumpR; S.bumpH.value = SEA.bumpH; S.bumpC.value.set(SEA.bumpC[0], SEA.bumpC[1]); S.ringT.value = SEA.ringT; S.ringA.value = SEA.ringA; S.ringC.value.set(SEA.ringC[0], SEA.ringC[1]); S.eyeI.value = SEA.eyeI; S.eyes.value.set(...SEA.eyes);
  S.boat.value.copy(Wd.boat.position); S.lampOn.value = Wd.boat.visible ? clamp(1 - (o.out ?? 0)) : 0;
  Wd.foam.material.uniforms.t.value = t; Wd.skirt.material.uniforms.t.value = t;
  // the boat rides the water: heave from the surface height, pitch and roll from its slope, plus a little rock
  { const bx = Wd.boat.position.x, bz = Wd.boat.position.z, h = Hs(bx, bz), hx = (Hs(bx + 2, bz) - Hs(bx - 2, bz)) / 4, hz = (Hs(bx, bz + 5) - Hs(bx, bz - 5)) / 10, rk = 1 - SEA.calm;
    Wd.boat.position.y = h * 0.85 + (o.sink ?? 0); Wd.boat.rotation.set(Math.atan(hz) * 0.8 + 0.015 * Math.sin(t * 0.8) * rk, BOAT.ry, -Math.atan(hx) * 0.8 + 0.03 * Math.sin(t * 0.6 + 1) * rk + (o.tilt ?? 0)); }
  // lamps: on, or going out one by one from the bow (o.out 0..1)
  const out = o.out ?? 0; Wd.boat.userData.bulbs.forEach(({ b, s, i }) => { const k = (i % 17) / 16, on = k > out ? 1 : 0, fl = out > 0 && Math.abs(k - out) < 0.08 ? (Math.sin(t * 40 + i) > 0 ? 1 : 0.2) : 1; b.material.color.set(on ? '#fbf7ea' : '#2b2d29'); s.visible = !!on; s.material.opacity = fl; });
  Wd.boat.userData.lamps.forEach((l, j) => (l.intensity = 2.2 * clamp(1 - out * 1.15 + (j ? 0.15 : 0))));
  { const c = WJ.cam.position, Sz = 30, P = Wd.rain.geometry.attributes.position; Wd.rain.visible = o.rain ?? true;
    Wd.rainP.forEach((q, i) => { const y = c.y + Sz - mod(q.y * 2 * Sz + t * 22 * q.v, 2 * Sz), x = c.x + q.x * Sz + (y - c.y) * 0.15, z = c.z + q.z * Sz, L = Sz * 0.03; P.setXYZ(i * 2, x, y, z); P.setXYZ(i * 2 + 1, x - L * 0.15, y - L, z); }); P.needsUpdate = true; }
}
