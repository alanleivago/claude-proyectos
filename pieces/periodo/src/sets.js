
// =====================================================================
//  SETS — seven places, one day. Shared: pain poses (hunch / kneel / sit / lie, hands on the belly, a face that winces
//  and trembles), signs drawn on canvas, a room builder, people factories.
// =====================================================================
// a ring of distant buildings (lit windows) that fades into the fog
function horizon(st, R, r0, r1, n, cols, a0, a1, hk) { const mats = cols.map((c) => windowsMat(c)), ims = mats.map((m) => IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), m, n)), c = mats.map(() => 0);
  for (let i = 0; i < n; i++) { const k = i % mats.length, a = R.r(a0, a1), r = R.r(r0, r1), x = Math.sin(a) * r, z = -Math.cos(a) * r, h = R.r(12, 50) * hk * (1 + 1.5 * Math.exp(-(((r - r0) / 120) ** 2)) * R.f()); ims[k].setMatrixAt(c[k]++, M4c(x, 0, z, R.r(0, 1), R.r(12, 26), h, R.r(12, 26))); }
  ims.forEach((m, k) => { m.count = c[k]; m.castShadow = false; st.scene.add(m); }); }
const MEN_TOPS = ['#2f6fd1', '#1f2d3d', '#d94848', '#3a8a5a', '#f4f1ea', '#7a5a3a', '#5a5a6a', '#c8a070'], BOTS = ['#2b3a55', '#3a3a3a', '#c8b89a', '#1f2d3d', '#4a4a4a'];
function man(R, o = {}) { return makePerson(Object.assign({ skin: R.pick(SKINS), hair: R.pick(HAIRS), hairStyle: R.pick(['short', 'short', 'curly', 'none']), top: R.pick(MEN_TOPS), bottom: R.pick(BOTS), sleeve: R.f() < 0.5 ? 'short' : 'long', seed: Math.floor(R.f() * 900) }, o)); }
function woman(R, o = {}) { return makePerson(Object.assign({ female: true, skin: R.pick(SKINS), hair: R.pick(HAIRS), hairStyle: R.pick(['bob', 'pony', 'long', 'bun', 'curly']), top: R.pick(['#e86fa8', '#f0c33c', '#2a9d8f', '#7b4fc9', '#f4f1ea', '#c8372d']), bottom: R.pick(BOTS), seed: Math.floor(R.f() * 900) }, o)); }
const BELLY = [0.5, -0.28, 1.75];
// k = 0 normal ... 1 full pain. mode: hunch | kneel | sit | lie | curl (sitting on the ground, knees up)
const GLOWT = (() => { let t = null; return () => t || (t = g3Radial([[0, 'rgba(255,40,40,0.95)'], [0.45, 'rgba(230,20,30,0.55)'], [1, 'rgba(200,0,20,0)']], 128)); })();
function bellyGlow(P, k) { if (!P.glow) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOWT(), transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, toneMapped: false })); sp.scale.setScalar(0.55); sp.position.set(0, 0.06, 0.26); P.spine.add(sp); P.glow = sp; }
  P.glow.visible = k > 0.02; P.glow.material.opacity = k * (0.75 + 0.25 * Math.sin(TT * 5 + P.seed)); }
function pain(P, o) { bellyGlow(P, o.k ?? 1); const k = o.k ?? 1, t = TT + (o.ph || 0), sh = 0.03 * k * Math.sin(t * 23 + (o.ph || 0) * 7), mode = o.mode || 'hunch', e = { sad: 0.85 * k, fear: 0.35 * k, angry: 0.25 * k, open: k * (0.25 + 0.25 * Math.max(0, Math.sin(t * 2.3 + (o.ph || 0)))), tremble: k, blink: 0.55 * k + (o.blink ?? 0) };
  if (k < 0.02) { posePerson(P, Object.assign({ x: o.x, z: o.z, yaw: o.yaw, emo: o.emo || { smile: 0.3 } }, o.base || {})); return; }
  const arm = [lerp(o.base?.armL?.[0] ?? 0.1, BELLY[0], k), lerp(0.12, BELLY[1], k), lerp(0.2, BELLY[2], k)], armR = [lerp(o.base?.armR?.[0] ?? 0.1, BELLY[0], k), lerp(0.12, BELLY[1], k), lerp(0.2, BELLY[2], k)];
  if (mode === 'hunch') posePerson(P, { x: o.x, z: o.z, yaw: o.yaw, y: -0.12 * k, crouch: 0.7 * k, lean: 0.6 * k + sh, legL: [-0.55 * k, 1.0 * k], legR: [-0.45 * k, 0.9 * k], armL: arm, armR, headPitch: 0.3 * k, headYaw: o.headYaw || 0, emo: e });
  if (mode === 'kneel') posePerson(P, { x: o.x, z: o.z, yaw: o.yaw, kneel: k, lean: 0.75 * k + sh, armL: arm, armR, headPitch: 0.35 * k, emo: e });
  if (mode === 'sit') posePerson(P, { x: o.x, z: o.z, y: o.y ?? 0, yaw: o.yaw, sit: 1, lean: 0.7 * k + sh, armL: arm, armR, headPitch: 0.3 * k, emo: e });
  if (mode === 'curl') { posePerson(P, { x: o.x, z: o.z, y: -0.46, yaw: o.yaw, sit: 1, legL: [-2.1, 2.3], legR: [-2.0, 2.2], lean: 0.8 * k + sh, armL: arm, armR, headPitch: 0.4, emo: e }); }
  if (mode === 'lie') { posePerson(P, { x: 0, z: 0, yaw: 0, crouch: 1, lean: 0.5, legL: [-1.3, 1.9], legR: [-1.1, 1.7], armL: arm, armR, headPitch: 0.3, emo: e }); P.root.position.set(o.x, 0.2, o.z); P.root.rotation.set(0, o.yaw, (o.side || 1) * Math.PI / 2 + sh, 'YXZ'); }
}
function signTex(lines, o = {}) { const w = o.w || 512, h = o.h || 128; return g3Tex((x) => { x.fillStyle = o.bg || '#1f8a5a'; x.fillRect(0, 0, w, h); if (o.border) { x.strokeStyle = o.border; x.lineWidth = 8; x.strokeRect(4, 4, w - 8, h - 8); }
  x.fillStyle = o.fg || '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle'; const n = lines.length; lines.forEach((l, i) => { const sz = (o.size || 64) * (i ? 0.62 : 1); x.font = `bold ${sz}px Arial, sans-serif`; x.fillText(l, w / 2, h * (i + 0.5) / n + (n > 1 ? (i ? -6 : 6) : 0)); }); }, w, h); }
function sign(par, lines, x, y, z, w, h, o = {}) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: signTex(lines, Object.assign({ w: Math.round(512 * Math.min(2, w / h / 4 * 4) / 2) * 2 || 512, h: 128 }, o)), roughness: 0.5, emissive: '#ffffff', emissiveIntensity: o.glow ?? 0.15, emissiveMap: null })); m.material.emissiveMap = m.material.map; m.position.set(x, y, z); if (o.ry) m.rotation.y = o.ry; (par.scene || par).add(m); return m; }
function room(st, w, d, h, o = {}) { const g = new THREE.Group(); st.scene.add(g); const wallM = STDm({ color: o.wall || '#e8e4dc', roughness: 0.9, map: o.wallMap || null }), floorM = o.floorM || STDm({ color: o.floor || '#8a8a8a', roughness: 0.8 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), floorM); fl.receiveShadow = true; g.add(fl);
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(Math.PI / 2), STDm({ color: o.ceil || '#f0f0ee' })); ce.position.y = h; g.add(ce);
  [[0, h / 2, -d / 2, 0], [-w / 2, h / 2, 0, Math.PI / 2], [w / 2, h / 2, 0, -Math.PI / 2], [0, h / 2, d / 2, Math.PI]].forEach(([x, y, z, r]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(r % Math.PI ? d : w, h), wallM); m.position.set(x, y, z); m.rotation.y = r; m.receiveShadow = true; g.add(m); });
  return g; }
function indoorStage(bg = '#d8d4cc', key = 1.6, hemi = 1.0) { const st = makeStage({ hemi, sky: 0xf4f0ea, ground: 0x8a8070, key, keyCol: '#fff4e4', box: 14, boxFar: 80, sunDist: 40 }); st.scene.background = lin(bg); st.setSun(new THREE.Vector3(0.4, 1, 0.5), new THREE.Vector3(0, 0, 0)); skyEnv(st, '#d8d4cc', '#f4f0ea', new THREE.Vector3(0.3, 1, 0.2), '#ffffff'); return st; }
function ceilLights(st, w, d, h, nx, nz) { const m = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }); for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.3), m); p.position.set(-w / 2 + (i + 0.5) * w / nx, h - 0.03, -d / 2 + (j + 0.5) * d / nz); st.scene.add(p); } }
const _cam = (st, p, q, f = 50) => { camLook(st.cam, p[0], p[1], p[2], q[0], q[1], q[2]); st.cam.fov = f; st.cam.updateProjectionMatrix(); };

// ----------------------------------------------------------------- 1. GYM
function buildGym() { const st = indoorStage('#3a3c40', 1.4, 0.8), R = RNG('gym'), S = { st };
  const rub = wrap(g3Tex((x, w) => { x.fillStyle = '#26282c'; x.fillRect(0, 0, w, w); speck(x, w, w, 20000, ['rgba(80,80,90,0.5)', 'rgba(10,10,12,0.5)'], RNG('rub'), 1, 2); x.strokeStyle = 'rgba(0,0,0,0.6)'; x.lineWidth = 3; x.strokeRect(0, 0, w, w); }, 256, 256), 14, 10);
  room(st, 16, 12, 4.2, { wall: '#5a5e66', floorM: STDm({ map: rub, roughness: 0.9 }) });
  const mir = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.6), STDm({ color: '#c8d0d8', metalness: 0.6, roughness: 0.12, envMapIntensity: 1.4 })); mir.position.set(0, 1.6, -5.98); st.scene.add(mir);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(6, 2), new THREE.MeshBasicMaterial({ color: '#dfeaf6', toneMapped: false })); win.position.set(-7.98, 2.3, 0); win.rotation.y = Math.PI / 2; st.scene.add(win);
  sign(st, ['FUERZA'], 0, 3.5, -5.95, 3, 0.6, { bg: '#c8372d', size: 80 });
  const steel = STDm({ color: '#b8bcc2', metalness: 0.9, roughness: 0.25 }), blk = STDm({ color: '#141416', roughness: 0.5 });
  const dumb = (s = 1) => { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 10).rotateZ(Math.PI / 2), steel)); [-0.13, 0.13].forEach((x) => g.add(mesh(new THREE.CylinderGeometry(0.06 * s, 0.06 * s, 0.07, 6).rotateZ(Math.PI / 2), blk, x, 0, 0))); return g; };
  // rack of dumbbells along the mirror
  for (let k = 0; k < 2; k++) { const rk = mesh(new THREE.BoxGeometry(5.5, 0.06, 0.5), steel, -2 + k * 0, 0.45 + k * 0.4, -5.3); st.scene.add(rk); for (let i = 0; i < 10; i++) { const d = dumb(0.8 + i * 0.06); d.position.set(-4.4 + i * 0.5, 0.52 + k * 0.4, -5.3); st.scene.add(d); } }
  // squat rack, benches, treadmills
  [[3.6, -4], [4.6, -4]].forEach(([x, z]) => [[-0.55], [0.55]].forEach(([dz]) => st.scene.add(mesh(new THREE.BoxGeometry(0.08, 2.4, 0.08), blk, x, 1.2, z + dz)))); st.scene.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 10).rotateZ(Math.PI / 2), steel, 4.1, 1.45, -4));
  [-0.9, 0.9].forEach((x) => st.scene.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 20).rotateZ(Math.PI / 2), blk, 4.1 + x, 1.45, -4)));
  const bench = (x, z, r) => { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = r; b.add(mesh(new THREE.BoxGeometry(1.2, 0.1, 0.3), STDm({ color: '#1a1a1c', roughness: 0.6 }), 0, 0.45, 0)); [-0.45, 0.45].forEach((dx) => b.add(mesh(new THREE.BoxGeometry(0.06, 0.4, 0.3), steel, dx, 0.2, 0))); st.scene.add(b); };
  bench(-3, -2.5, 0.3); bench(2.8, -1.5, -0.2);
  for (let i = 0; i < 3; i++) { const tm = new THREE.Group(); tm.position.set(-6.2, 0, -3 + i * 1.6); tm.rotation.y = Math.PI / 2; tm.add(mesh(new THREE.BoxGeometry(1.8, 0.2, 0.75), blk, 0, 0.1, 0)); tm.add(mesh(new THREE.BoxGeometry(1.6, 0.02, 0.5), STDm({ color: '#3a3a3e' }), 0, 0.21, 0)); [-0.32, 0.32].forEach((z) => tm.add(mesh(new THREE.BoxGeometry(0.05, 1.2, 0.05), steel, 0.75, 0.7, z))); tm.add(mesh(new THREE.BoxGeometry(0.15, 0.35, 0.7), blk, 0.8, 1.3, 0)); st.scene.add(tm); }
  // the hero (tank top, red shorts) curling dumbbells; another man on the bench; a woman on the treadmill
  S.hero = makePerson({ skin: SKINS[2], hair: HAIRS[1], hairStyle: 'short', top: '#1a1a1a', bottom: '#b8282c', sleeve: 'short', shorts: true, seed: 11 }); st.scene.add(S.hero.root);
  S.db = [dumb(1.1), dumb(1.1)]; S.db.forEach((d, i) => S.hero.arms[i].hand.add(d));
  S.b2 = man(R, { top: '#2f6fd1', shorts: true, sleeve: 'short' }); st.scene.add(S.b2.root); S.b3 = man(R, { top: '#3a8a5a', sleeve: 'short' }); st.scene.add(S.b3.root);
  S.w1 = woman(R, { top: '#e86fa8', hairStyle: 'pony', sleeve: 'short' }); st.scene.add(S.w1.root);
  return S; }
function poseGym(S, t) { const k = ss(3.4, 4.4, t), curl = 0.5 + 0.5 * Math.sin(t * 3.2);
  if (k < 0.01) { bellyGlow(S.hero, 0); posePerson(S.hero, { x: 0, z: -1.2, yaw: 0, armL: [0.25, 0.12, 0.3 + 1.9 * (1 - curl)], armR: [0.25, 0.12, 0.3 + 1.9 * curl], emo: { determined: 0.7, smile: 0.1 } }); }
  else pain(S.hero, { x: 0, z: -1.2, yaw: 0, k, mode: 'hunch' });
  // the dumbbells: in the hands, then dropped to the floor
  S.db.forEach((d, i) => { const H = S.hero.arms[i].hand; if (t < 3.6) { if (d.parent !== H) H.add(d); d.position.set(0, -0.075, 0.012); d.rotation.set(0, 0, 0); } else { if (d.parent !== S.st.scene) S.st.scene.add(d); const s = t - 3.6, y0 = 1.05 - 0.25 * i; d.position.set((i ? 0.3 : -0.3) + 0.12 * s, Math.max(0.06, y0 - 4.9 * s * s), -1.0 + 0.2 * s); d.rotation.set(0, 0.5 * i - 0.2, y0 - 4.9 * s * s > 0.06 ? s * 3 : 0.4); } });
  pain(S.b2, { x: 2.8, z: -1.9, yaw: -0.4, k: ss(4.0, 4.8, t), mode: 'sit', y: 0.0, base: { sit: 1 }, ph: 2 });
  pain(S.b3, { x: -3.2, z: -3.2, yaw: 0.5, k: ss(4.4, 5.4, t), mode: 'kneel', ph: 4 });
  posePerson(S.w1, { x: -6.2, z: -1.4, yaw: Math.PI / 2, run: 1, ph: t * 9, headYaw: -0.9 * ss(4.6, 5.2, t), emo: { surprise: ss(4.6, 5.2, t), open: 0.3 } }); }

// ----------------------------------------------------------------- 2. STREET
function buildStreet() { const st = makeStage({ skyTop: '#4a88d8', skyHor: '#dbe7f0', hemi: 0.85, key: 2.6, box: 30, boxFar: 200, fog: '#d8e2ea', fogNear: 80, fogFar: 600, sunDist: 120 }); st.setSun(dirV(150 * DEG, 48 * DEG)); const R = RNG('street'), S = { st };
  const road = new THREE.Mesh(new THREE.PlaneGeometry(400, 10).rotateX(-Math.PI / 2), STDm({ color: '#5a5c60', roughness: 0.9 })); road.position.z = 5; road.receiveShadow = true; st.scene.add(road);
  const walk = new THREE.Mesh(new THREE.BoxGeometry(400, 0.15, 6).translate(0, 0.075, 0), STDm({ map: wrap(texNoise('swalk', '#c8c2b6', ['rgba(80,75,70,0.25)', 'rgba(240,235,225,0.25)']), 120, 2), roughness: 0.85 })); walk.position.z = -3; walk.receiveShadow = true; st.scene.add(walk);
  for (let x = -60; x < 60; x += R.r(9, 13)) { const w = R.r(8, 12), h = R.r(12, 26); const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 10).translate(0, h / 2, 0), windowsMat(R.pick(['#e8dcc8', '#d8c0a8', '#c8d0d8', '#e0c8b8', '#f0ece4']))); b.position.set(x + w / 2, 0, -11); b.castShadow = b.receiveShadow = true; st.scene.add(b);
    const aw = mesh(new THREE.BoxGeometry(w * 0.8, 0.08, 1.6).rotateX(-0.25), STDm({ color: R.pick(['#c8372d', '#2a6a8a', '#3a7a4a', '#e8a838']) }), x + w / 2, 3.0, -5.4); st.scene.add(aw); const shop = mesh(new THREE.BoxGeometry(w * 0.8, 2.4, 0.05), STDm({ color: '#2a3a48', metalness: 0.5, roughness: 0.15 }), x + w / 2, 1.3, -5.98); st.scene.add(shop); }
  // café terrace
  const tables = [[-3, -2.6], [-1.2, -2.2], [0.8, -2.6]]; tables.forEach(([x, z]) => { st.scene.add(mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.03, 20), STDm({ color: '#f4f2ee' }), x, 0.88, z)); st.scene.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8), STDm({ color: '#2a2a2c' }), x, 0.5, z)); st.scene.add(mesh(new THREE.ConeGeometry(1.3, 0.5, 16, 1, true), STDm({ color: '#f4e8d0', side: THREE.DoubleSide }), x, 2.6, z)); st.scene.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.4, 6), STDm({ color: '#2a2a2c' }), x, 1.3, z)); });
  // a lamppost, a tree, a bicycle
  st.scene.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.5, 8), STDm({ color: '#2a2c30' }), 4.5, 2.25, -0.4)); const cr = new THREE.Mesh(lumpyGeo(3, 0.28, 61), STDm({ map: leafTex('stt', '#3a6a28') })); cr.position.set(-6, 4.2, -0.6); cr.scale.setScalar(1.8); cr.castShadow = true; st.scene.add(cr); st.scene.add(mesh(new THREE.CylinderGeometry(0.12, 0.18, 3.5, 8), STDm({ color: '#5a4636' }), -6, 1.75, -0.6));
  S.bike = new THREE.Group(); [-0.5, 0.5].forEach((x) => S.bike.add(mesh(new THREE.TorusGeometry(0.33, 0.03, 8, 24), STDm({ color: '#1a1a1a' }), x, 0.33, 0))); S.bike.add(mesh(new THREE.BoxGeometry(1.0, 0.05, 0.05), STDm({ color: '#2f6fd1' }), 0, 0.6, 0)); S.bike.position.set(2.6, 0, 1.8); S.bike.rotation.set(0, 0.4, 1.35); st.scene.add(S.bike);
  // men: postman (cap), cyclist, café man, businessman, a man with a dog lead; women walking by, puzzled
  S.m = [man(R, { top: '#2a4a8a', cap: '#2a4a8a', seed: 21 }), man(R, { top: '#e8a838', shorts: true, sleeve: 'short', seed: 22 }), man(R, { top: '#f4f1ea', seed: 23 }), man(R, { top: '#1f2d3d', bottom: '#1f2d3d', seed: 24 }), man(R, { seed: 25 })]; S.m.forEach((p) => st.scene.add(p.root));
  S.w = [woman(R, { seed: 31 }), woman(R, { seed: 32 }), woman(R, { seed: 33, top: '#f0c33c' })]; S.w.forEach((p) => st.scene.add(p.root));
  S.letters = IM(new THREE.BoxGeometry(0.22, 0.004, 0.11), STDm({ color: '#f4f2ee' }), 24, false); st.scene.add(S.letters); return S; }
function poseStreet(S, t) { const k = (a) => ss(a, a + 0.6, t);
  pain(S.m[0], { x: -4.4, z: -1.6, yaw: 0.4, k: k(6.2), mode: 'kneel', ph: 1 }); pain(S.m[1], { x: 2.0, z: 1.2, yaw: -0.7, k: k(6.0), mode: 'hunch', ph: 2 });
  pain(S.m[2], { x: -1.2, z: -1.5, yaw: Math.PI, k: k(6.5), mode: 'sit', ph: 3 }); pain(S.m[3], { x: 1.0, z: -0.8, yaw: 0.2, k: k(6.4), mode: 'lie', side: -1, ph: 4 }); pain(S.m[4], { x: 4.0, z: -2.0, yaw: -0.5, k: k(6.7), mode: 'hunch', ph: 5 });
  const R = RNG('letters'); for (let i = 0; i < 24; i++) S.letters.setMatrixAt(i, M4c(-4.4 + R.n(0.6), 0.16, -1.2 + R.n(0.5), R.r(0, 6))); S.letters.instanceMatrix.needsUpdate = true;
  [[-6, -0.2, Math.PI / 2], [6.5, -1.0, -Math.PI / 2], [-2.6, 0.2, Math.PI / 2 + 0.3]].forEach(([x0, z, yaw], i) => { const walk = 1 - ss(7.2 + i * 0.3, 7.8 + i * 0.3, t), x = x0 + Math.sin(yaw) * Math.min(t - 6, 1.6 + i * 0.3) * 1.1;
    posePerson(S.w[i], { x, z, yaw, walk, ph: t * 6 + i, headYaw: (1 - walk) * (i % 2 ? 0.8 : -0.8), armL: i === 2 && walk < 0.5 ? [0.9, 0.1, 1.8] : null, emo: { surprise: (1 - walk) * 0.7, open: (1 - walk) * 0.3 } }); }); }

// ----------------------------------------------------------------- 3. BALLPARK
function buildBall() { const st = makeStage({ skyTop: '#3f7fd6', skyHor: '#dce8f2', hemi: 0.9, key: 2.6, box: 60, boxFar: 300, fog: '#d8e2ea', fogNear: 200, fogFar: 900, sunDist: 200 }); st.setSun(dirV(-60 * DEG, 45 * DEG)); const R = RNG('ball'), S = { st };
  const grass = wrap(g3Tex((x, w) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#3f7a32' : '#4a8a3a'; x.fillRect(0, i * w / 16, w, w / 16); } speck(x, w, w, 20000, ['rgba(20,50,10,0.3)', 'rgba(120,170,80,0.3)'], RNG('gr'), 1, 2); }, 512, 512), 10, 10);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(800, 800).rotateX(-Math.PI / 2), STDm({ color: '#3a6a2c', roughness: 1 })); under.position.y = -0.02; st.scene.add(under);
  const field = new THREE.Mesh(new THREE.CircleGeometry(130, 64, Math.PI * 0.25, Math.PI * 0.5).rotateX(-Math.PI / 2), STDm({ map: grass, roughness: 0.95 })); field.receiveShadow = true; st.scene.add(field);
  const dirt = STDm({ color: '#b07a50', roughness: 1, map: wrap(texNoise('dirtb', '#b07a50', ['rgba(90,55,30,0.35)', 'rgba(210,160,120,0.3)']), 8, 8) });
  const inf = new THREE.Mesh(new THREE.RingGeometry(26, 36, 64, 1, Math.PI * 0.25, Math.PI * 0.5).rotateX(-Math.PI / 2), dirt); inf.position.y = 0.01; st.scene.add(inf);
  const diamond = new THREE.Mesh(new THREE.PlaneGeometry(19.4, 19.4).rotateX(-Math.PI / 2), STDm({ map: grass, roughness: 0.95 })); diamond.rotation.y = Math.PI / 4; diamond.position.set(0, 0.015, -13.7); st.scene.add(diamond);
  st.scene.add(mesh(new THREE.CylinderGeometry(2.7, 2.9, 0.25, 32), dirt, 0, 0.12, -13.7)); const home = mesh(new THREE.CircleGeometry(4, 32).rotateX(-Math.PI / 2), dirt, 0, 0.012, 0); st.scene.add(home);
  [[0, 0], [13.7, -13.7], [0, -27.4], [-13.7, -13.7]].forEach(([x, z]) => st.scene.add(mesh(new THREE.BoxGeometry(0.4, 0.06, 0.4), STDm({ color: '#ffffff' }), x, 0.04, z)));
  const lineM = STDm({ color: '#f4f4f0' }); [-1, 1].forEach((s) => { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 120).rotateX(-Math.PI / 2), lineM); l.position.set(s * 42.4, 0.02, -42.4); l.rotation.y = -s * Math.PI / 4; st.scene.add(l); });
  // outfield wall + scoreboard; stands behind home and along the lines with a crowd
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(118, 118, 4, 64, 1, true, Math.PI * 0.75, Math.PI * 0.5), STDm({ color: '#1f4a32', side: THREE.DoubleSide })); wall.position.y = 2; st.scene.add(wall);
  S.board = sign(st, ['PARTIDO SUSPENDIDO', 'HOY · MAÑANA · SIEMPRE'], 0, 18, -116, 34, 9, { bg: '#121418', fg: '#ffcc33', size: 70, glow: 0.8 }); st.scene.add(mesh(new THREE.BoxGeometry(36, 11, 1), STDm({ color: '#2a2c30' }), 0, 18, -116.6)); [-14, 14].forEach((x) => st.scene.add(mesh(new THREE.BoxGeometry(0.8, 14, 0.8), STDm({ color: '#2a2c30' }), x, 7, -116.6)));
  const standM = STDm({ color: '#8a8e96', roughness: 0.8 }); const stands = []; [[0, 9, 0], [-30, -2, Math.PI / 4 + 0.15], [30, -2, -Math.PI / 4 - 0.15]].forEach(([x, z, r]) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r; st.scene.add(g); for (let k = 0; k < 12; k++) g.add(mesh(new THREE.BoxGeometry(46, 0.6, 1.2), standM, 0, 0.3 + k * 0.65, k * 1.1)); stands.push(g); });
  S.crowd = makeCrowd(900, { seed: 4 }); st.scene.add(S.crowd.grp); S.cl = []; for (let i = 0; i < 900; i++) { const g = stands[i % 3], k = Math.floor(R.f() * 12), lx = R.r(-22, 22), p = new THREE.Vector3(lx, 0.6 + k * 0.65, k * 1.1).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.rotation.y).add(g.position); S.cl.push({ p, yaw: g.rotation.y + Math.PI, ph: R.r(0, 6) }); }
  // players (white uniforms, caps) on the field; the umpire; a ball
  S.pl = []; [[0, -13.7, 'lie'], [12, -15, 'lie'], [-11, -16, 'kneel'], [1.5, -1.5, 'lie'], [0.6, 1.4, 'curl'], [3, -26, 'lie'], [-20, -30, 'lie'], [22, -34, 'kneel']].forEach(([x, z, mode], i) => { const P = man(R, { top: '#f4f2ee', bottom: '#f4f2ee', cap: i % 2 ? '#1a3a6a' : '#b8282c', sleeve: 'short', seed: 40 + i }); st.scene.add(P.root); S.pl.push({ P, x, z, mode, yaw: R.r(0, 6) }); });
  horizon(st, R, 160, 600, 160, ['#c8ccd4', '#b4b8c0', '#d4cfc6', '#a8b0bc', '#9aa4b0'], -Math.PI * 0.9, Math.PI * 0.9, 1.0);
  [[-60, -70], [60, -70], [-45, 30], [45, 30]].forEach(([x, z]) => { st.scene.add(mesh(new THREE.CylinderGeometry(0.4, 0.6, 38, 8).translate(0, 19, 0), STDm({ color: '#8a8e96', metalness: 0.5 }), x, 0, z)); st.scene.add(mesh(new THREE.BoxGeometry(6, 3, 0.6), STDm({ color: '#f4f4f0', emissive: '#ffffff', emissiveIntensity: 0.6 }), x, 39, z, { ry: Math.atan2(-x, -z - 14) })); });
  S.ball = mesh(new THREE.SphereGeometry(0.037, 16, 12), STDm({ color: '#f8f6f0' })); st.scene.add(S.ball); return S; }
function poseBall(S, t) { S.pl.forEach((p, i) => pain(p.P, { x: p.x, z: p.z, yaw: p.yaw, k: 1, mode: p.mode, side: i % 2 ? 1 : -1, ph: i * 1.3 }));
  S.cl.forEach((c, i) => S.crowd.set(i, c.p.x, c.p.y, c.p.z, c.yaw, 1, 0, 0.25 + 0.05 * Math.sin(t * 9 + c.ph))); S.crowd.done();
  const s = Math.max(0, t - 11); S.ball.position.set(1.2 + s * 0.8 * Math.exp(-s * 0.3), 0.037, -3 - s * 0.6 * Math.exp(-s * 0.3)); S.ball.rotation.x = s * 4; }

// ----------------------------------------------------------------- 4. BUILDING SITE
function buildSite() { const st = makeStage({ skyTop: '#5a8ad0', skyHor: '#e0e8ee', hemi: 0.85, key: 2.6, box: 40, boxFar: 200, fog: '#dce4ea', fogNear: 120, fogFar: 700, sunDist: 150 }); st.setSun(dirV(-50 * DEG, 40 * DEG)); const R = RNG('site'), S = { st };
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), STDm({ map: wrap(texNoise('sdirt', '#9a8060', ['rgba(60,45,30,0.4)', 'rgba(190,170,140,0.3)'], 20000), 60, 60), roughness: 1 })); gr.receiveShadow = true; st.scene.add(gr);
  const conc = STDm({ color: '#b8b4ac', roughness: 0.9, map: wrap(texNoise('conc2', '#b8b4ac', ['rgba(60,60,60,0.3)', 'rgba(230,230,225,0.25)']), 4, 4) }), rebar = STDm({ color: '#8a4a2a', metalness: 0.5, roughness: 0.6 });
  for (let f = 0; f < 4; f++) { st.scene.add(mesh(new THREE.BoxGeometry(18, 0.3, 12), conc, 0, 3.2 * f + 0.15, -12)); if (f < 3) for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) st.scene.add(mesh(new THREE.BoxGeometry(0.4, 3.2, 0.4), conc, -8 + i * 5.33, 3.2 * f + 1.75, -17 + j * 5)); }
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) for (let r = 0; r < 4; r++) st.scene.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 4), rebar, -8 + i * 5.33 + (r % 2) * 0.12, 10.6, -17 + j * 5 + (r > 1 ? 0.12 : 0)));
  // scaffolding in front
  const sc = STDm({ color: '#c8ccd0', metalness: 0.7, roughness: 0.4 }); for (let i = 0; i < 9; i++) for (let f = 0; f < 3; f++) { st.scene.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.2, 6), sc, -8 + i * 2, 3.2 * f + 1.6, -5.4)); st.scene.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.2, 6), sc, -8 + i * 2, 3.2 * f + 1.6, -6.2)); if (i < 8) { st.scene.add(mesh(new THREE.BoxGeometry(2, 0.05, 0.8), STDm({ color: '#a87a4a' }), -7 + i * 2, 3.2 * (f + 1), -5.8)); st.scene.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 2, 6).rotateZ(Math.PI / 2), sc, -7 + i * 2, 3.2 * f + 2.2, -5.4)); } }
  // tower crane (lattice mast, jib with a hanging load)
  { const ye = STDm({ color: '#e8b830', metalness: 0.4, roughness: 0.5 }), g = new THREE.Group(); g.position.set(14, 0, -22); st.scene.add(g); const H = 36;
    for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) g.add(mesh(new THREE.BoxGeometry(0.12, H, 0.12), ye, x * 0.9, H / 2, z * 0.9));
    for (let k = 0; k < 18; k++) { const y = k * H / 18; g.add(mesh(new THREE.BoxGeometry(1.8, 0.06, 0.06), ye, 0, y, 0.9)); g.add(mesh(new THREE.BoxGeometry(1.8, 0.06, 0.06), ye, 0, y, -0.9)); const d = mesh(new THREE.BoxGeometry(0.05, H / 18 * 1.4, 0.05), ye, 0, y + H / 36, 0.9); d.rotation.z = 0.78; g.add(d); }
    g.add(mesh(new THREE.BoxGeometry(34, 1.2, 1.2), ye, -10, H + 0.6, 0)); g.add(mesh(new THREE.BoxGeometry(2, 2, 2), STDm({ color: '#d8dce0' }), 0, H + 1.8, 0)); g.add(mesh(new THREE.BoxGeometry(6, 1.6, 1.4), STDm({ color: '#6a6c70' }), 7, H + 0.4, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 18, 4), STDm({ color: '#2a2a2a' }), -18, H - 9, 0)); g.add(mesh(new THREE.BoxGeometry(3, 0.8, 1.2), STDm({ color: '#8a6a4a' }), -18, H - 18.4, 0)); }
  // cement mixer, pallets of bricks, cones
  { const mx = new THREE.Group(); mx.position.set(-6, 0, -1.5); st.scene.add(mx); mx.add(mesh(new THREE.CylinderGeometry(0.5, 0.7, 1.1, 20).rotateZ(1.0), STDm({ color: '#d84a2a', metalness: 0.3 }), 0, 1.0, 0)); mx.add(mesh(new THREE.BoxGeometry(1.2, 0.1, 0.8), STDm({ color: '#2a2a2c' }), 0, 0.4, 0)); [-0.4, 0.4].forEach((z) => mx.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 14).rotateX(Math.PI / 2), STDm({ color: '#1a1a1a' }), -0.3, 0.2, z))); }
  for (let p = 0; p < 3; p++) { const px = 3 + p * 1.6, pz = -1.8; st.scene.add(mesh(new THREE.BoxGeometry(1.2, 0.12, 1.0), STDm({ color: '#a87a4a' }), px, 0.06, pz)); const br = IM(new THREE.BoxGeometry(0.22, 0.07, 0.1), STDm({ color: '#b04a32', roughness: 0.9 }), 60, true); let n = 0; for (let l = 0; l < 6; l++) for (let a = 0; a < 5; a++) for (let b = 0; b < 2; b++) br.setMatrixAt(n++, M4c(px - 0.46 + a * 0.23, 0.16 + l * 0.075, pz - 0.25 + b * 0.5 * (l % 2 ? 0.9 : 1), 0)); st.scene.add(br); }
  for (let i = 0; i < 6; i++) { st.scene.add(mesh(new THREE.ConeGeometry(0.18, 0.6, 14), STDm({ color: '#ff6a1a' }), -9 + i * 3.6, 0.3, 2.4)); }
  sign(st, ['OBRA PARADA'], -2, 2.2, -5.0, 3.2, 0.7, { bg: '#e8b830', fg: '#1a1a1a', size: 70 });
  horizon(st, R, 45, 400, 140, ['#e8dcc8', '#d8c0a8', '#c8d0d8', '#e0c8b8', '#b8bcc4'], -Math.PI, Math.PI, 0.55);
  { const fm = STDm({ color: '#6a6c70' }); [[-30, -8, 60, 0.2], [30, -8, 60, 0.2]].forEach(([x, z, L]) => st.scene.add(mesh(new THREE.BoxGeometry(0.1, 2, L), fm, x, 1, z))); st.scene.add(mesh(new THREE.BoxGeometry(60, 2, 0.1), STDm({ color: '#2a5a3a' }), 0, 1, -38)); }
  // workers: helmets, vests; curled up with hot-water bottles
  const bottle = () => mesh(new THREE.CapsuleGeometry(0.08, 0.12, 4, 10).scale(1, 1, 0.45), STDm({ color: '#d8302a', roughness: 0.4 }));
  S.wk = []; [[-2.4, 0.4, 'curl'], [-0.6, 1.2, 'sit'], [1.4, 0.6, 'lie'], [-4.0, 1.4, 'kneel'], [5.8, 0.4, 'curl'], [3.0, 3.6, 'hunch']].forEach(([x, z, mode], i) => { const P = man(R, { top: '#4a5a6a', bottom: '#3a4a6a', helmet: R.pick(['#f0c020', '#f4f2ee', '#ff6a1a']), vest: '#ff7a1a', seed: 70 + i }); st.scene.add(P.root); const b = bottle(); P.arms[1].hand.add(b); b.position.set(0, -0.08, 0.06); S.wk.push({ P, x, z, mode, yaw: R.r(-0.6, 0.6) }); });
  return S; }
function poseSite(S, t) { S.wk.forEach((w, i) => pain(w.P, { x: w.x, z: w.z, yaw: w.yaw, k: 1, mode: w.mode, side: i % 2 ? 1 : -1, y: w.mode === 'sit' ? 0.15 : 0, ph: i * 1.7 })); }

// ----------------------------------------------------------------- 5. SUPERMARKET
function buildMarket() { const st = indoorStage('#f0eee8', 1.2, 1.1), R = RNG('mkt'), S = { st };
  const tile = wrap(g3Tex((x, w) => { x.fillStyle = '#e8e6e0'; x.fillRect(0, 0, w, w); x.strokeStyle = '#c8c6c0'; x.lineWidth = 3; x.strokeRect(0, 0, w, w); speck(x, w, w, 3000, ['rgba(120,120,120,0.15)'], RNG('tl'), 1, 2); }, 128, 128), 30, 40);
  room(st, 22, 30, 4.5, { wall: '#f4f2ec', floorM: STDm({ map: tile, roughness: 0.25, metalness: 0.05 }) }); ceilLights(st, 22, 30, 4.5, 6, 8);
  const shelfM = STDm({ color: '#d8dce0', metalness: 0.4, roughness: 0.5 }), cols = ['#c8372d', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#f4f2ee', '#7b4fc9', '#ef8a3a', '#3a8a5a'];
  const aisle = (x, empty, label, chocolate) => { const g = new THREE.Group(); g.position.set(x, 0, -2); st.scene.add(g); g.add(mesh(new THREE.BoxGeometry(0.9, 2.0, 22), shelfM, 0, 1.0, 0)); for (let k = 0; k < 5; k++) g.add(mesh(new THREE.BoxGeometry(1.3, 0.03, 22), shelfM, 0, 0.2 + k * 0.42, 0));
    const box = IM(new THREE.BoxGeometry(0.18, 0.26, 0.14), STDm({ roughness: 0.5 }), 1600, false); let n = 0; for (let k = 0; k < 5; k++) for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 80; i++) { const z = -10.6 + i * 0.27; if (empty && Math.abs(z - empty[0]) < empty[1] && R.f() < 0.97) continue; box.setMatrixAt(n, M4c(s * 0.5, 0.36 + k * 0.42, z, R.n(0.05), 1, R.r(0.85, 1.15), 1)); box.setColorAt(n++, lin(chocolate && Math.abs(z - empty[0]) < empty[1] + 3 ? R.pick(['#5a2a1a', '#7a3a1a', '#3a1a10']) : R.pick(cols))); }
    box.count = n; g.add(box); if (label) { [-1, 1].forEach((s) => { const sg = sign(g, [label], s * 0.66, 2.35, empty ? empty[0] : 0, 2.6, 0.5, { bg: '#1f8a5a', size: 64, ry: s * Math.PI / 2 }); }); for (let k = 0; k < 5; k++) { const ag = sign(g, ['AGOTADO'], 0.66, 0.3 + k * 0.42, (empty ? empty[0] : 0) + R.n(1.5), 0.5, 0.14, { bg: '#ffffff', fg: '#c8372d', size: 80, ry: Math.PI / 2 }); } } return g; };
  aisle(-6, null); aisle(-2.4, [-3, 4], 'ANALGÉSICOS'); aisle(2.4, [2, 3.5], 'CHOCOLATE', true); aisle(6, null);
  // the queue of men; the man with a tower of chocolate bars; carts
  S.q = []; for (let i = 0; i < 7; i++) { const P = man(R, { seed: 100 + i }); st.scene.add(P.root); S.q.push({ P, x: 0.2 + (i % 2) * 0.4, z: 4 - i * 1.0 }); }
  S.hero = man(R, { top: '#2f6fd1', bottom: '#2b3a55', sleeve: 'short', hair: HAIRS[1], hairStyle: 'curly', seed: 120 }); st.scene.add(S.hero.root);
  S.tower = new THREE.Group(); for (let k = 0; k < 16; k++) { const b = mesh(new THREE.BoxGeometry(0.34, 0.05, 0.16), STDm({ color: R.pick(['#5a2a1a', '#7b4fc9', '#c8372d', '#3a1a10']) }), R.n(0.02), k * 0.052, R.n(0.02)); b.rotation.y = R.n(0.15); S.tower.add(b); } st.scene.add(S.tower);
  const cart = (x, z, r) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r; st.scene.add(g); const wm = STDm({ color: '#c8ccd0', metalness: 0.8, roughness: 0.3, wireframe: true }); g.add(mesh(new THREE.BoxGeometry(0.55, 0.45, 0.9, 4, 4, 6), wm, 0, 0.75, 0)); [[-0.22, -0.38], [0.22, -0.38], [-0.22, 0.38], [0.22, 0.38]].forEach(([a, b]) => g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 10).rotateZ(Math.PI / 2), STDm({ color: '#1a1a1a' }), a, 0.05, b))); };
  cart(-0.8, 2.4, 0.4); cart(1.2, -4, -0.3); return S; }
function poseMarket(S, t) { S.q.forEach((q, i) => pain(q.P, { x: q.x, z: q.z, yaw: Math.PI, k: 0.85, mode: i % 3 === 2 ? 'kneel' : 'hunch', ph: i * 1.1 }));
  const s = Math.max(0, t - 26), z = -6 + s * 0.55; posePerson(S.hero, { x: 0, z, yaw: 0, walk: 0.7, ph: t * 4, armL: [1.35, -0.12, 1.15], armR: [1.35, -0.12, 1.15], lean: -0.15, headPitch: -0.05, emo: { sad: 0.7, tremble: 0.6, blink: 0.4 } }); S.tower.position.set(0, 1.0, z + 0.32); S.tower.rotation.z = 0.04 * Math.sin(t * 4); }

// ----------------------------------------------------------------- 6. PARLIAMENT
function buildParl() { const st = indoorStage('#3a2a24', 1.0, 0.9), R = RNG('parl'), S = { st };
  const wood = STDm({ color: '#6a4028', roughness: 0.6, map: wrap(texNoise('pwood', '#6a4028', ['rgba(30,15,8,0.35)', 'rgba(150,100,60,0.25)']), 4, 1) }), red = STDm({ color: '#a8282a', roughness: 0.7 }), carpet = STDm({ color: '#6a1a1c', roughness: 1 });
  room(st, 40, 34, 14, { wall: '#d8c8b0', floorM: STDm({ color: '#5a3a2a', roughness: 0.9 }) }); const crp = new THREE.Mesh(new THREE.CircleGeometry(6.5, 48).rotateX(-Math.PI / 2), carpet); crp.position.set(0, 0.01, -2); st.scene.add(crp); ceilLights(st, 40, 34, 14, 5, 4);
  // the hemicycle: curved rows of desks and red seats around the floor, rising backward
  S.seats = []; const chrome = STDm({ color: '#c8ccd0', metalness: 0.8, roughness: 0.3 }), riser = STDm({ color: '#5a3a26', roughness: 0.7, map: wrap(texNoise('riser', '#5a3a26', ['rgba(30,15,8,0.3)', 'rgba(140,90,60,0.25)']), 6, 1) });
  const NMAX = 400, seatI = IM(new THREE.BoxGeometry(0.5, 0.08, 0.48), red, NMAX), backI = IM(new THREE.BoxGeometry(0.5, 0.62, 0.07), red, NMAX), legI = IM(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 6), chrome, NMAX * 4), deskI = IM(new THREE.BoxGeometry(0.62, 0.72, 0.42), wood, NMAX), topI = IM(new THREE.BoxGeometry(0.66, 0.04, 0.5), STDm({ color: '#3a2418', roughness: 0.4 }), NMAX); let ns = 0, nl = 0;
  for (let r = 6; r >= 0; r--) { const rad = 7 + r * 1.7, y = r * 0.42; const tier = new THREE.Mesh(new THREE.CylinderGeometry(rad + 1.25, rad + 1.25, y + 0.42, 72, 1, false, Math.PI * 0.58, Math.PI * 0.84), [riser, carpet, riser]); tier.position.set(0, (y + 0.42) / 2 - 0.42, -2); tier.receiveShadow = true; st.scene.add(tier); }
  for (let r = 0; r < 7; r++) { const rad = 7 + r * 1.7, y = r * 0.42, n = Math.round(rad * 2.0);
    for (let i = 0; i < n && ns < NMAX; i++) { const a = Math.PI + lerp(-Math.PI * 0.4, Math.PI * 0.4, (i + 0.5) / n), cx = Math.sin(a) * (rad + 0.5), cz = -2 - Math.cos(a) * (rad + 0.5), yaw = a + Math.PI; S.seats.push({ x: cx, y, z: cz, yaw, r });
      const fx = -Math.sin(a), fz = Math.cos(a); seatI.setMatrixAt(ns, M4c(cx, y + 0.45, cz, yaw)); backI.setMatrixAt(ns, M4c(cx - fx * 0.24, y + 0.78, cz - fz * 0.24, yaw, 1, 1, 1, -0.12)); deskI.setMatrixAt(ns, M4c(cx + fx * 0.62, y + 0.36, cz + fz * 0.62, yaw)); topI.setMatrixAt(ns, M4c(cx + fx * 0.62, y + 0.74, cz + fz * 0.62, yaw));
      [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([dx, dz]) => { const c = Math.cos(yaw), s = Math.sin(yaw); legI.setMatrixAt(nl++, M4c(cx + dx * c + dz * s, y + 0.22, cz - dx * s + dz * c)); }); ns++; } }
  [seatI, backI, deskI, topI].forEach((m) => { m.count = ns; st.scene.add(m); }); legI.count = nl; st.scene.add(legI);
  // the president's dais and the big screen
  st.scene.add(mesh(new THREE.BoxGeometry(8, 1.4, 2), wood, 0, 0.7, -17)); st.scene.add(mesh(new THREE.BoxGeometry(5, 1.0, 1.4), wood, 0, 1.9, -17.6));
  const scv = document.createElement('canvas'); scv.width = 1024; scv.height = 576; S.scv = scv; S.scr = new THREE.CanvasTexture(scv); S.scr.encoding = THREE.sRGBEncoding;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(12, 6.75), new THREE.MeshBasicMaterial({ map: S.scr, toneMapped: false })); screen.position.set(0, 7.6, -16.9); st.scene.add(screen); st.scene.add(mesh(new THREE.BoxGeometry(12.6, 7.3, 0.3), STDm({ color: '#1a1a1c' }), 0, 7.6, -17.1));
  // flags
  [-7, 7].forEach((x) => { st.scene.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 5, 8), STDm({ color: '#c8a050', metalness: 0.8 }), x, 2.5, -16.5)); st.scene.add(mesh(new THREE.PlaneGeometry(1.4, 0.95), STDm({ color: '#c8372d', side: THREE.DoubleSide }), x + 0.72, 4.4, -16.5)); });
  // deputies: suits, all in pain; a few women deputies calm, pressing "Sí"
  S.dep = []; const RR = RNG('deps'); S.seats.forEach((s, i) => { if (RR.f() < 0.45) return; const fem = RR.f() < 0.28, P = fem ? woman(RR, { top: '#1f2d3d', bottom: '#1f2d3d', seed: 300 + i }) : man(RR, { top: RR.pick(['#1f2d3d', '#2a2a2e', '#3a3a4a', '#4a3a2a']), bottom: '#1f2d3d', seed: 300 + i }); st.scene.add(P.root); S.dep.push({ P, s, fem, ph: RR.r(0, 6) }); });
  S.speaker = man(R, { top: '#1f2d3d', bottom: '#1f2d3d', hair: HAIRS[6], glasses: true, seed: 299 }); st.scene.add(S.speaker.root); return S; }
function drawVote(S, t) { const x = S.scv.getContext('2d'), w = 1024, h = 576, v = ss(38.0, 41.0, t), done = t > 41.2;
  x.fillStyle = '#0e1626'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8282a'; x.fillRect(0, 0, w, 96); x.fillStyle = '#fff'; x.font = 'bold 54px Arial'; x.textAlign = 'left'; x.fillText('SESIÓN DE EMERGENCIA', 40, 66);
  x.font = 'bold 50px Arial'; x.fillText('LEY DE COMPRESAS GRATIS', 40, 180); x.fillStyle = '#26324a'; x.fillRect(40, 230, 944, 80); x.fillRect(40, 340, 944, 80);
  x.fillStyle = '#3ab86a'; x.fillRect(40, 230, 944 * v, 80); x.fillStyle = '#fff'; x.font = 'bold 44px Arial'; x.fillText(`SÍ  ${Math.round(100 * v)} %`, 60, 285); x.fillText('NO  0 %', 60, 395);
  x.fillStyle = done ? '#ffcc33' : '#8a96aa'; x.font = 'bold 42px Arial'; x.fillText(done ? 'APROBADA EN 4 SEGUNDOS' : 'VOTANDO…', 40, 500); S.scr.needsUpdate = true; }
function poseParl(S, t) { drawVote(S, t); S.dep.forEach((d) => { if (d.fem) posePerson(d.P, { x: d.s.x, y: d.s.y + 0.03, z: d.s.z, yaw: d.s.yaw, sit: 1, armR: t > 38 + d.ph * 0.4 ? [1.2, 0.1, 0.5] : [0.6, 0.1, 1.0], emo: { smile: 0.2 } }); else pain(d.P, { x: d.s.x, z: d.s.z, y: d.s.y + 0.03, yaw: d.s.yaw, k: 0.9, mode: 'sit', ph: d.ph }); });
  pain(S.speaker, { x: 0, z: -16.2, yaw: 0, k: 0.8, mode: 'hunch', ph: 1 }); S.speaker.root.position.y += 1.4; }

// ----------------------------------------------------------------- 7. OFFICE (women, a normal Tuesday)
function buildOffice() { const st = indoorStage('#f4f2ee', 1.4, 1.1), R = RNG('office'), S = { st };
  room(st, 18, 14, 3.2, { wall: '#f4f2ee', floorM: STDm({ map: wrap(texNoise('ocarpet', '#8a8e96', ['rgba(60,60,70,0.3)', 'rgba(170,170,180,0.3)'], 20000), 8, 6), roughness: 1 }) }); ceilLights(st, 18, 14, 3.2, 4, 4);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(16, 2.4), new THREE.MeshBasicMaterial({ color: '#cfe4f8', toneMapped: false })); win.position.set(0, 1.7, -6.98); st.scene.add(win); for (let i = -8; i <= 8; i += 2) st.scene.add(mesh(new THREE.BoxGeometry(0.08, 2.5, 0.08), STDm({ color: '#2a2c30' }), i, 1.7, -6.9));
  const deskM = STDm({ color: '#e8e2d8', roughness: 0.5 }), dark = STDm({ color: '#1a1c20', roughness: 0.4 });
  const desk = (x, z, r) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r; st.scene.add(g); g.add(mesh(new THREE.BoxGeometry(1.6, 0.04, 0.8), deskM, 0, 0.74, 0)); [[-0.75, -0.35], [0.75, -0.35], [-0.75, 0.35], [0.75, 0.35]].forEach(([a, b]) => g.add(mesh(new THREE.BoxGeometry(0.04, 0.74, 0.04), dark, a, 0.37, b)));
    g.add(mesh(new THREE.BoxGeometry(0.6, 0.36, 0.03), dark, 0, 1.0, -0.25)); g.add(mesh(new THREE.PlaneGeometry(0.56, 0.32), new THREE.MeshBasicMaterial({ color: R.pick(['#cfe2ff', '#e8f0e0', '#ffe8d0']), toneMapped: false }), 0, 1.0, -0.234)); g.add(mesh(new THREE.BoxGeometry(0.42, 0.02, 0.14), dark, 0, 0.77, 0.08));
    g.add(mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 14), STDm({ color: R.pick(['#f4f2ee', '#c8372d', '#2f6fd1']) }), 0.55, 0.81, 0.1)); };
  [[-4, -2.5, 0], [-1.2, -2.5, 0], [1.6, -2.5, 0], [4.4, -2.5, 0], [-4, 0.5, Math.PI], [1.6, 0.5, Math.PI], [4.4, 0.4, 0]].forEach(([x, z, r]) => desk(x, z, r));
  for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(lumpyGeo(3, 0.3, 80 + i), STDm({ map: leafTex('opl', '#3a6a28') })); p.position.set(-7.5 + i * 5, 1.1, -6.2); p.scale.set(0.45, 0.6, 0.45); st.scene.add(p); st.scene.add(mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.5, 14), STDm({ color: '#f4f2ee' }), -7.5 + i * 5, 0.25, -6.2)); }
  // the wall TV with breaking news about the men
  const tcv = document.createElement('canvas'); tcv.width = 640; tcv.height = 360; const x = tcv.getContext('2d'); const g = x.createLinearGradient(0, 0, 640, 360); g.addColorStop(0, '#2a4a7a'); g.addColorStop(1, '#0e1a2e'); x.fillStyle = g; x.fillRect(0, 0, 640, 360);
  x.fillStyle = '#5a6a7a'; for (let i = 0; i < 6; i++) { x.beginPath(); x.ellipse(80 + i * 95, 250, 40, 14, 0.2, 0, TAU); x.fill(); } x.fillStyle = '#c8282a'; x.fillRect(0, 280, 640, 80); x.fillStyle = '#fff'; x.font = 'bold 34px Arial'; x.fillText('ÚLTIMA HORA: HOMBRES, DOLOR 10', 20, 332); x.font = 'bold 26px Arial'; x.fillText('EN DIRECTO', 20, 40);
  const tv = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.35), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(tcv), toneMapped: false })); tv.position.set(0, 2.1, 6.95); tv.rotation.y = Math.PI; st.scene.add(tv); st.scene.add(mesh(new THREE.BoxGeometry(2.5, 1.45, 0.08), dark, 0, 2.1, 6.99));
  // the coffee point
  st.scene.add(mesh(new THREE.BoxGeometry(1.4, 0.9, 0.6), deskM, 6.5, 0.45, 4.2)); st.scene.add(mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), dark, 6.5, 1.15, 4.2));
  S.w = [[-4, -1.9, Math.PI, 'type'], [-1.2, -1.9, Math.PI, 'phone'], [1.6, -1.9, Math.PI, 'type'], [5.6, 3.6, -2.4, 'coffee'], [6.6, 3.0, 2.8, 'laugh'], [-1.2, 1.4, 0.4, 'walk'], [3.2, -0.6, -1.0, 'talk'], [-3.2, 1.6, 2.6, 'laugh'], [-2.4, 2.2, -2.2, 'talk'], [4.4, 0.9, Math.PI, 'type'], [0.4, 2.6, 2.8, 'coffee']].map(([x, z, yaw, role], i) => { const P = woman(R, { seed: 500 + i }); st.scene.add(P.root); return { P, x, z, yaw, role }; });
  S.cups = S.w.filter((w) => w.role === 'coffee' || w.role === 'laugh' || w.role === 'talk').map((w) => { const c = mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 14), STDm({ color: '#f4f2ee' })); w.P.arms[1].hand.add(c); c.position.set(0, -0.09, 0.03); return c; }); return S; }
function poseOffice(S, t) { S.w.forEach((w, i) => { const ph = t + i; let q = { x: w.x, z: w.z, yaw: w.yaw, emo: { smile: 0.6 } };
  if (w.role === 'type') q = Object.assign(q, { sit: 1, y: 0.0, armL: [1.1, 0.0, 1.2 + 0.08 * Math.sin(ph * 14)], armR: [1.1, 0.0, 1.2 + 0.08 * Math.sin(ph * 13 + 1)], headPitch: 0.1 });
  if (w.role === 'phone') q = Object.assign(q, { sit: 1, armR: [1.6, 0.0, 2.2], headRoll: 0.15, emo: { smile: 0.7, open: 0.35 * Math.abs(Math.sin(ph * 5)) } });
  if (w.role === 'coffee') q = Object.assign(q, { armR: [0.9 + 0.5 * Math.max(0, Math.sin(ph * 0.8)), 0.1, 1.6 + 0.4 * Math.max(0, Math.sin(ph * 0.8))], emo: { smile: 0.8, open: 0.4 * Math.abs(Math.sin(ph * 4)) } });
  if (w.role === 'laugh') q = Object.assign(q, { armR: [0.9, 0.1, 1.6], lean: -0.1 * Math.abs(Math.sin(ph * 3)), headPitch: -0.2 * Math.abs(Math.sin(ph * 3)), emo: { smile: 1, open: 0.6 * Math.abs(Math.sin(ph * 8)) } });
  if (w.role === 'walk') { const s = t - 43; q = Object.assign(q, { x: w.x + Math.sin(w.yaw) * s * 0.9, z: w.z + Math.cos(w.yaw) * s * 0.9, walk: 1, ph: t * 6, armL: [0.9, 0.1, 1.6] }); }
  if (w.role === 'talk') q = Object.assign(q, { armR: [0.9, 0.1, 1.6], armL: [0.6 + 0.3 * Math.sin(ph * 3), 0.3, 1.0], headYaw: 0.2 * Math.sin(ph), emo: { smile: 0.7, open: 0.4 * Math.max(0, Math.sin(ph * 6)) } });
  posePerson(w.P, q); }); }

// ----------------------------------------------------------------- 8. DUSK (hour 24)
function buildDusk() { const st = makeStage({ skyTop: '#1a2a5a', skyHor: '#e88a5a', hemi: 0.55, sky: 0x8a90c0, ground: 0x3a3020, key: 1.6, keyCol: '#ffa060', box: 20, boxFar: 120, fog: '#7a6a7a', fogNear: 40, fogFar: 260, sunDist: 80 }); st.setSun(dirV(-80 * DEG, 6 * DEG)); const R = RNG('dusk'), S = { st };
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(300, 300).rotateX(-Math.PI / 2), STDm({ map: wrap(texNoise('dgr', '#3a5a2a', ['rgba(20,40,10,0.45)', 'rgba(90,120,50,0.35)'], 20000), 60, 60), roughness: 1 })); gr.receiveShadow = true; st.scene.add(gr);
  const tuft = IM(grassTuftGeo(9, 14), windMat({ roughness: 0.8 }), 20000, false); let n = 0; for (let i = 0; i < 20000; i++) { const x = R.r(-14, 14), z = R.r(-12, 6); tuft.setMatrixAt(n++, M4c(x, 0.01, z, R.r(0, 6), R.r(0.8, 1.2), R.r(0.7, 1.2), R.r(0.8, 1.2))); } tuft.count = n; st.scene.add(tuft);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3, 80).rotateX(-Math.PI / 2), STDm({ color: '#b8a888', roughness: 1 })); path.position.set(4, 0.02, -10); path.rotation.y = 0.3; st.scene.add(path);
  for (let i = 0; i < 26; i++) { const a = R.r(-1.2, 1.2), r = R.r(14, 60), x = Math.sin(a) * r, z = -Math.cos(a) * r - 4, h = R.r(6, 11); st.scene.add(mesh(new THREE.CylinderGeometry(0.15, 0.25, h * 0.5, 8).translate(0, h * 0.25, 0), STDm({ color: '#3a2a1e' }), x, 0, z)); const c = new THREE.Mesh(lumpyGeo(3, 0.3, 90 + i), STDm({ map: leafTex('dlt', '#2a4a1e') })); c.position.set(x, h * 0.62, z); c.scale.setScalar(h * 0.3); c.castShadow = true; st.scene.add(c); }
  horizon(st, R, 70, 400, 120, ['#2a2c3a', '#3a3a4a', '#2a3040', '#343848'], -Math.PI * 0.8, Math.PI * 0.8, 1.2);
  for (let i = 0; i < 18; i++) { const a = R.r(-1.4, 1.4), r = R.r(90, 220), s = R.r(40, 90); const h = new THREE.Mesh(lumpyGeo(2, 0.3, 120 + i), STDm({ color: '#2a3a2a', roughness: 1 })); h.position.set(Math.sin(a) * r, -s * 0.6, -Math.cos(a) * r); h.scale.set(s * 1.6, s, s); st.scene.add(h); }
  for (let i = 0; i < 30; i++) { const a = R.r(-1.6, 1.6), r = R.r(18, 45), x = Math.sin(a) * r, z = -Math.cos(a) * r, h = R.r(5, 9); st.scene.add(mesh(new THREE.CylinderGeometry(0.15, 0.22, h * 0.5, 8).translate(0, h * 0.25, 0), STDm({ color: '#3a2a1e' }), x, 0, z)); const c = new THREE.Mesh(lumpyGeo(2, 0.3, 140 + i), STDm({ map: leafTex('dlt2', '#2a4a1e') })); c.position.set(x, h * 0.62, z); c.scale.setScalar(h * 0.3); st.scene.add(c); }
  { const wd = STDm({ color: '#6a4a32' }); st.scene.add(mesh(new THREE.BoxGeometry(1.8, 0.06, 0.5), wd, -4.4, 0.45, -1.6)); st.scene.add(mesh(new THREE.BoxGeometry(1.8, 0.45, 0.05), wd, -4.4, 0.72, -1.85)); }
  S.lamps = []; [[-4, -3], [7, -6]].forEach(([x, z]) => { st.scene.add(mesh(new THREE.CylinderGeometry(0.06, 0.09, 3.8, 8), STDm({ color: '#1e2226' }), x, 1.9, z)); st.scene.add(mesh(new THREE.SphereGeometry(0.22, 14, 10), new THREE.MeshBasicMaterial({ color: '#ffe0a0', toneMapped: false }), x, 3.9, z)); const L = new THREE.PointLight(0xffd090, 3, 12, 1.5); L.position.set(x, 3.7, z); st.scene.add(L); });
  S.hero = man(R, { top: '#4a7ab8', bottom: '#2b3a55', hair: HAIRS[0], hairStyle: 'short', seed: 601 }); st.scene.add(S.hero.root);
  S.others = [man(R, { seed: 602 }), man(R, { seed: 603, top: '#3a8a5a' }), man(R, { seed: 604, top: '#c8a070' })]; S.others.forEach((p) => st.scene.add(p.root));
  S.wa = woman(R, { top: '#c8372d', hairStyle: 'curly', hair: HAIRS[0], skin: SKINS[4], seed: 610 }); S.wb = woman(R, { top: '#f0c33c', hairStyle: 'bun', skin: SKINS[1], seed: 611 }); st.scene.add(S.wa.root, S.wb.root); return S; }
function poseDusk(S, t) { const up = ss(50.9, 52.0, t);
  if (up < 0.02) pain(S.hero, { x: 0, z: -2, yaw: 0.3, k: 1, mode: 'lie', side: 1 }); else { const st = ss(52.0, 53.2, t); posePerson(S.hero, { x: 0, z: -2, yaw: 0.3, kneel: 1 - up, armL: [lerp(0.2, 2.9, st), 0.25, lerp(1.2, 0.3, st)], armR: [lerp(0.2, 2.9, st), 0.25, lerp(1.2, 0.3, st)], lean: -0.15 * st, headPitch: -0.2 * st, emo: { smile: 0.6 * st, open: 0.4 * ss(53.5, 54, t) * (1 - ss(55, 55.5, t)) } }); }
  [[-3, -4, 1.2], [3.5, -5, -0.6], [-1.5, -7, 0.6]].forEach(([x, z, yaw], i) => { const u = ss(51.0 + i * 0.3, 52.4 + i * 0.3, t); if (u < 0.05) pain(S.others[i], { x, z, yaw, k: 1, mode: 'lie', side: i % 2 ? 1 : -1, ph: i }); else posePerson(S.others[i], { x, z, yaw, kneel: 1 - u, emo: { smile: 0.3 * u } }); });
  const look = ss(52.6, 53.2, t); [[S.wa, 1.8, 0.4, -0.5], [S.wb, 2.6, -0.2, -0.75]].forEach(([P, x, z, yaw], i) => posePerson(P, { x, z, yaw, armL: [0.35, -0.2, 1.8, -1.4], armR: [0.42, -0.2, 1.7, -1.4], headPitch: -0.05, headYaw: 0.2 * (1 - look), headRoll: i ? 0.08 * look : -0.06 * look, emo: { angry: 0.6 * look, blink: 0.35 * look, smile: 0 } })); }
