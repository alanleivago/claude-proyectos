// =====================================================================
//  NANO — the cell surface with landing bacteriophages (virus, virus2), the crowded sea of molecules (mol, mol2),
//  chromatin: DNA double helices wound round histone spools (dna, the payoff on the music drop at 52.0) and the
//  crystal lattice of atoms (atoms). 44–57.5 s. Each world has its own units (see each stage).
// =====================================================================
const nnUp = new THREE.Vector3(0, 1, 0);
const nnPhys = (o) => new THREE.MeshPhysicalMaterial(Object.assign({ roughness: 0.5, metalness: 0 }, o));
// a unit rod (height 1, centred) stretched between a and b
function nnRod(m, a, b) { const d = new THREE.Vector3().subVectors(b, a), L = d.length(); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(nnUp, d.multiplyScalar(1 / L)); m.scale.set(1, L, 1); }
// key light + shadow box that follows the action (the scale changes 4x inside a shot)
function nnSun(st, dir, c, half) { const k = st.key, sc = k.shadow.camera; Object.assign(sc, { left: -half, right: half, top: half, bottom: -half, near: half * 0.05, far: half * 9 }); sc.updateProjectionMatrix();
  k.shadow.normalBias = half * 0.004; k.target.position.copy(c); k.target.updateMatrixWorld(); k.position.copy(c).addScaledVector(dir, half * 4.5); }
// instanced list: items {p:[x,y,z], s:[sx,sy,sz]|n, r:[rx,ry,rz], c}
function nnInst(par, geo, mat, L, shadow = true) { const m = IM(geo, mat, Math.max(1, L.length), shadow); if (!L.length) m.count = 0;
  L.forEach((q, i) => { const s = Array.isArray(q.s) ? q.s : [q.s, q.s, q.s], r = q.r || [0, 0, 0]; m.setMatrixAt(i, M4c(q.p[0], q.p[1], q.p[2], r[1], s[0], s[1], s[2], r[0], r[2])); if (q.c) m.setColorAt(i, lin(q.c)); });
  (par.scene || par).add(m); return m; }
// a gradient backdrop sphere that follows the camera (bigger worlds than makeStage's fixed dome)
function nnDome(st, top, hor, low) { const U = { top: { value: lin(top) }, hor: { value: lin(hor) }, low: { value: lin(low || hor) } };
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.ShaderMaterial({ uniforms: U, side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * mat4(mat3(modelViewMatrix)) * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: 'uniform vec3 top, hor, low; varying vec3 vD; void main(){ vec3 d = normalize(vD); vec3 c = d.y > 0.0 ? mix(hor, top, pow(d.y, 0.7)) : mix(hor, low, pow(-d.y, 0.6)); gl_FragColor = vec4(c, 1.0);\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n}' }));
  m.renderOrder = -10; m.frustumCulled = false; st.scene.add(m); return U; }
const nnH = (t) => HGT(t);
// lumpyGeo with smooth normals (its icosphere has split vertices, so its normals come out faceted)
function nnLumpy(d, a, seed) { const g = lumpyGeo(d, a, seed), p = g.attributes.position, n = g.attributes.normal, acc = new Map(), key = (i) => Math.round(p.getX(i) * 1e4) + ',' + Math.round(p.getY(i) * 1e4) + ',' + Math.round(p.getZ(i) * 1e4);
  for (let i = 0; i < p.count; i++) { const k = key(i), v = acc.get(k) || [0, 0, 0]; v[0] += n.getX(i); v[1] += n.getY(i); v[2] += n.getZ(i); acc.set(k, v); }
  for (let i = 0; i < p.count; i++) { const v = acc.get(key(i)), l = Math.hypot(v[0], v[1], v[2]) || 1; n.setXYZ(i, v[0] / l, v[1] / l, v[2] / l); } n.needsUpdate = true; return g; }
// distance from (x, z) to her swim path in the molecule sea
const nnMolPathD = (x, z) => { const ax = 1.5, az = -2, bx = -4.6, bz = -0.1, dx = bx - ax, dz = bz - az, u = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)); return Math.hypot(x - ax - dx * u, z - az - dz * u); };

// =====================================================================
//  VIRUS — units: 1 = 100 nm. She is 3.8 → 0.95 units (44–48 s). The cell (radius 120 = 12 µm) is the ground.
// =====================================================================
const NN_RC = 120;
const nnCellY = (x, z) => Math.sqrt(Math.max(0, NN_RC * NN_RC - x * x - z * z)) - NN_RC;
function nnPhageMats() { return { head: nnPhys({ color: '#eef1f5', roughness: 0.22, metalness: 0.15, clearcoat: 0.9, clearcoatRoughness: 0.15, flatShading: true }),
  sheath: nnPhys({ color: '#c4ccd8', roughness: 0.35, metalness: 0.2, clearcoat: 0.5 }), plate: nnPhys({ color: '#aeb6c4', roughness: 0.4, metalness: 0.25 }), leg: nnPhys({ color: '#dfe4ec', roughness: 0.35, metalness: 0.1, clearcoat: 0.4 }) }; }
function nnPhageGeos() { const ico = new THREE.IcosahedronGeometry(0.5, 0), v = new THREE.Vector3(0, 1, (1 + Math.sqrt(5)) / 2).normalize();
  ico.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(v, nnUp)); ico.scale(0.92, 1.22, 0.92);
  const prof = []; for (let i = 0; i <= 28; i++) { prof.push(new THREE.Vector2(i % 2 ? 0.1 : 0.084, i / 28)); }
  return { head: ico, sheath: new THREE.LatheGeometry(prof, 18), rod: new THREE.CylinderGeometry(0.02, 0.02, 1, 6), rodT: new THREE.CylinderGeometry(0.026, 0.026, 1, 6), knob: new THREE.SphereGeometry(0.034, 8, 6),
    plate: new THREE.CylinderGeometry(0.2, 0.17, 0.07, 6), collar: new THREE.CylinderGeometry(0.13, 0.16, 0.06, 14), tube: new THREE.CylinderGeometry(0.042, 0.042, 1, 10).translate(0, -0.5, 0), pin: new THREE.ConeGeometry(0.02, 0.12, 5).rotateX(Math.PI) }; }
function nnPhage(par, G, M) { const g = new THREE.Group(); par.add(g);
  const P = { g, head: mesh(G.head, M.head), sheath: mesh(G.sheath, M.sheath), collar: mesh(G.collar, M.plate), plate: mesh(G.plate, M.plate), tube: mesh(G.tube, M.plate), legs: [], pins: [] };
  g.add(P.head, P.sheath, P.collar, P.plate, P.tube);
  for (let k = 0; k < 6; k++) { const L = { up: mesh(G.rodT, M.leg), lo: mesh(G.rod, M.leg), kn: mesh(G.knob, M.leg), ft: mesh(G.knob, M.leg) }; g.add(L.up, L.lo, L.kn, L.ft); P.legs.push(L);
    const pin = mesh(G.pin, M.plate); g.add(pin); P.pins.push(pin); }
  P.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#b8ffe0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); P.glow.scale.setScalar(0.9); g.add(P.glow);
  return P; }
// pose a phage: air = height above ground (0 = landed), k = tail contraction 0..1, sp = leg spread in the air
function nnPhagePose(P, x, z, yaw, air, k, tl) { const y0 = nnCellY(x, z); P.g.position.set(x, y0 + air, z); P.g.rotation.set(0.12 * Math.sin(tl * 1.7) * Math.min(1, air), yaw + 0.3 * air, 0.1 * Math.sin(tl * 1.3 + 1) * Math.min(1, air));
  const Hb = lerp(0.32, 0.06, k), L = lerp(0.74, 0.34, k), w = lerp(1, 1.5, k), fly = clamp(air * 2);
  P.plate.position.y = Hb + 0.035; P.sheath.position.y = Hb + 0.07; P.sheath.scale.set(w, L, w); P.collar.position.y = Hb + 0.1 + L; P.head.position.y = Hb + 0.13 + L + 0.61;
  P.tube.position.y = Hb + 0.07; P.tube.scale.set(1, 0.02 + 0.5 * k, 1);
  const A = new THREE.Vector3(), K = new THREE.Vector3(), F = new THREE.Vector3();
  P.legs.forEach((Lg, i) => { const a = i / 6 * TAU + 0.5, c = Math.cos(a), s = Math.sin(a), fr = lerp(0.82, 0.62, fly);
    A.set(0.18 * c, Hb + 0.05, 0.18 * s); K.set(0.48 * c, Hb + 0.3 + 0.06 * fly, 0.48 * s); F.set(fr * c, lerp(0.02, Hb - 0.28, fly), fr * s);
    nnRod(Lg.up, A, K); nnRod(Lg.lo, K, F); Lg.kn.position.copy(K); Lg.ft.position.copy(F);
    P.pins[i].position.set(0.13 * c, Hb - 0.04, 0.13 * s); });
  P.glow.position.set(0, 0.05, 0); P.glow.material.opacity = 0.55 * k * (0.7 + 0.3 * Math.sin(tl * 9)); }
function nnVirusStage() { return once('nnVirus', () => {
  const st = makeStage({ fov: 40, far: 6000, hemi: 0.85, sky: 0x9fe0e8, ground: 0x3f6a50, key: 2.1, keyCol: '#fff4e2', fog: '#2c7a8e', fogNear: 10, fogFar: 120 });
  const sun = dirV(-40 * DEG, 48 * DEG).normalize(), S = { st, sun }; skyEnv(st, '#164a7c', '#9ad8d8', sun); nnDome(st, '#071f48', '#2f8fa2', '#2c7a8e');
  // the membrane: a mottled pale green skin (lipid heads), bumpy
  const memT = g3Tex((x, w) => { const R = RNG('nnmem'); x.fillStyle = '#a6d6a2'; x.fillRect(0, 0, w, w); for (let k = 0; k < 60; k++) blot(x, R.r(0, w), R.r(0, w), R.r(20, 70), R.pick(['rgba(210,238,190,0.5)', 'rgba(120,180,130,0.35)', 'rgba(190,225,160,0.4)']));
    for (let k = 0; k < 9000; k++) { const l = R.r(-12, 12); x.fillStyle = `hsla(${R.r(100, 135)}, ${R.r(28, 42)}%, ${R.r(64, 74) + l * 0.2}%, 0.6)`; x.beginPath(); x.arc(R.r(0, w), R.r(0, w), R.r(1.2, 3.2), 0, TAU); x.fill(); } }, 512, 512);
  const bumpT = g3Tex((x, w) => { const R = RNG('nnmemb'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, w); for (let k = 0; k < 7000; k++) { x.fillStyle = `rgba(255,255,255,${R.r(0.1, 0.5)})`; x.beginPath(); x.arc(R.r(0, w), R.r(0, w), R.r(1.5, 4), 0, TAU); x.fill(); } }, 512, 512, false);
  const gG = new THREE.PlaneGeometry(220, 220, 520, 520).rotateX(-Math.PI / 2), gp = gG.attributes.position; for (let i = 0; i < gp.count; i++) gp.setY(i, nnCellY(gp.getX(i), gp.getZ(i))); gG.computeVertexNormals();
  const ground = mesh(gG, nnPhys({ color: '#ffffff', map: wrap(memT, 110, 110), bumpMap: wrap(bumpT, 220, 220), bumpScale: 0.35, roughness: 0.62, sheen: 0.6, sheenColor: lin('#e8ffe0'), sheenRoughness: 0.5 }), 0, 0, 0, { cast: false }); st.scene.add(ground);
  // membrane proteins (bumps and rocks, 5–70 nm), glycan stalks, specks in the water
  const R = RNG('nnvir'), pals = ['#cbe6ae', '#e6edb6', '#b2dca4', '#efe6bc', '#a4d6b4', '#d8ecc4', '#f2f0d0'];
  const pg = [0, 1, 2].map((i) => nnLumpy(3, 0.4, 40 + i)), pm = nnPhys({ color: '#ffffff', roughness: 0.42, sheen: 0.5, sheenColor: lin('#ffffff'), clearcoat: 0.25, clearcoatRoughness: 0.4 }), PL = [[], [], []];
  for (let i = 0; i < 3600; i++) { const r = 45 * Math.pow(R.f(), 1.25), a = R.r(0, TAU), x = Math.cos(a) * r, z = Math.sin(a) * r - 6; if (Math.hypot(x, z) < 0.7 || Math.hypot(x - 1.15, z + 0.7) < 0.95) continue; { const u = clamp(((x + 0.36) * -2.1 + z * 3.2) / 14.65), dd = Math.hypot(x + 0.36 + 2.1 * u, z - 3.2 * u); if (dd < 0.55 && R.f() < 0.9) continue; }
    const s = 0.04 + 0.32 * Math.pow(R.f(), 3) + (R.f() < 0.02 ? R.r(0.15, 0.35) : 0); PL[i % 3].push({ p: [x, nnCellY(x, z) + s * 0.25, z], s: [s * R.r(0.8, 1.3), s * R.r(0.6, 1), s * R.r(0.8, 1.3)], r: [R.n(0.3), R.r(0, TAU), R.n(0.3)], c: R.pick(pals) }); }
  PL.forEach((L, i) => nnInst(st, pg[i], pm, L));
  const bead = new THREE.SphereGeometry(1, 8, 6), BL = [];
  for (let i = 0; i < 420; i++) { const r = 30 * Math.pow(R.f(), 1.2), a = R.r(0, TAU), x = Math.cos(a) * r, z = Math.sin(a) * r - 4; if (Math.hypot(x, z) < 0.9) continue; const n = 3 + Math.floor(R.r(0, 6)), y0 = nnCellY(x, z), bx = R.n(0.05), bz = R.n(0.05), c = R.pick(['#e8f4c8', '#f4f0d4', '#d4ecc0']);
    for (let k = 0; k < n; k++) BL.push({ p: [x + bx * k * k * 0.3, y0 + 0.03 + k * 0.045, z + bz * k * k * 0.3], s: 0.026 - k * 0.0015, c }); }
  nnInst(st, bead, pm, BL);
  const SL = []; for (let i = 0; i < 700; i++) SL.push({ p: [R.r(-30, 30), R.r(0.4, 22), R.r(-60, 6)], s: R.r(0.02, 0.1), r: [R.r(0, 3), R.r(0, 3), 0], c: R.pick(['#d8f0e0', '#c0e4e8', '#e8f4d8']) });
  S.specks = nnInst(st, pg[0], nnPhys({ color: '#ffffff', roughness: 0.5, transparent: true, opacity: 0.85 }), SL, false);
  // a far bacterium drifting in the water (scale cue) and a second cell's limb on the horizon
  const bac = mesh(new THREE.CapsuleGeometry(2.5, 8, 8, 16), nnPhys({ color: '#9fc6c8', roughness: 0.5, transparent: true, opacity: 0.55 }), -26, 30, -95, { cast: false }); bac.rotation.set(0.4, 0.3, 1.1); st.scene.add(bac);
  // the phages: [x, z, land time, yaw]
  const G = nnPhageGeos(), M = nnPhageMats();
  S.ph = [[1.15, -0.7, 45.55, 0.4], [-3.4, -6, 44.85, 1], [4.2, -9, 45.25, 2.1], [-7.5, -14, 46.3, 0.3], [8.5, -17, 46.9, 1.4], [-1.5, -23, 47.4, 2.6], [10.5, -5.5, 46.05, 0.8], [-10, -8, 44.55, 1.9], [-6, -30, 40, 0.2], [14, -27, 40, 1.1], [3, -40, 40, 2], [-18, -36, 40, 0.6]].map(([x, z, lt, yaw], i) => ({ P: nnPhage(st.scene, G, M), x, z, lt, yaw, i }));
  S.girl = makeGirl(st); return S; }); }
function nnVirusPose(S, t) { S.ph.forEach((q) => { const d = q.lt - t, air = d > 0 ? 2.4 * d + 0.9 * d * d : 0, land = d <= 0 ? -d : 0;
    let k = 0; if (q.i === 0) k = ss(46.75, 47.25, t); else if (q.i === 3) k = ss(47.3, 47.8, t);
    const settle = d <= 0 ? 0.035 * Math.exp(-land * 5) * Math.sin(land * 22) : 0; nnPhagePose(q.P, q.x, q.z, q.yaw, Math.max(0, air + settle), k, t + q.i); q.P.g.visible = air < 40; });
  S.specks.rotation.y = 0.004 * (t - 44); S.specks.position.y = -0.15 * (t - 44); }
SHOT_FN.virus = (lt, dur, t) => { const S = nnVirusStage(), st = S.st, h = nnH(t) / 1e-7; nnVirusPose(S, t);
  // she watches them come down; the close one lands at 45.55 and she backs off, an arm up
  const back = ss(45.25, 45.75, t), gx = -0.25 * back * h * 0.3;
  placeGirl(S.girl, gx, nnCellY(gx, 0), 0, h, { yaw: 0.55 - 0.25 * back, headPitch: -0.38 + 0.25 * back, headYaw: lerp(-0.35, 0.45, ss(44.6, 45.6, t)), look: [lerp(-0.4, 0.5, ss(44.6, 45.6, t)), 0.4 - 0.3 * back], lean: -0.12 * back,
    armR: [lerp(0.1, 1.6, back), 0.25, lerp(0.2, 1.9, back)], armL: [0.05 + 0.3 * back, 0.18, 0.25], emo: { surprise: 0.4 + 0.5 * back, fear: 0.4 * back } });
  const k = EZ.io(clamp(lt / dur)), c = [gx + lerp(1.2, 1.0, k) * h, lerp(0.3, 0.26, k) * h, lerp(2.75, 2.55, k) * h];
  nnSun(st, S.sun, new THREE.Vector3(0, 0, -3), 9);
  camPt(st, c, [gx - 0.2 * h, 0.42 * h, 0], 42, t, 0.5, 3); renderStage(st, 1.0); bloom(0.22); };
SHOT_FN.virus2 = (lt, dur, t) => { const S = nnVirusStage(), st = S.st, h = nnH(t) / 1e-7; nnVirusPose(S, t);
  // the phage next to her contracts its tail (46.75–47.25) and injects: she ducks, arms over her head, then peeks
  const duck = ss(46.6, 46.95, t), peek = ss(47.5, 47.95, t), gx = -0.36;
  placeGirl(S.girl, gx, nnCellY(gx, 0), 0, h, { yaw: 0.75 + 0.3 * duck, headPitch: lerp(-0.45, 0.35, duck) - 0.75 * peek, headYaw: 0.3, look: [0.5, 0.5 - 0.6 * duck], kneel: 0.9 * duck, lean: 0.45 * duck, crouch: duck, legL: duck > 0.05 ? [lerp(0, -1.75, duck), lerp(0.1, 2.3, duck)] : undefined, legR: duck > 0.05 ? [lerp(0, -1.3, duck), lerp(0.1, 2.0, duck)] : undefined,
    armL: [lerp(0.1, 2.5, duck), lerp(0.15, 0.55, duck), lerp(0.2, 2.1, duck)], armR: [lerp(0.15, 2.6, duck), lerp(0.2, 0.5, duck), lerp(0.25, 2.0, duck)], emo: { fear: 0.4 + 0.5 * duck, surprise: 0.6 * (1 - duck), open: 0.3 * duck } });
  const k = EZ.io(clamp(lt / dur)), sh = 0.06 * ss(46.75, 46.85, t) * Math.exp(-Math.max(0, t - 46.8) * 3) * Math.sin(t * 60);
  const c = [lerp(-2.5, -2.05, k), lerp(0.5, 0.42, k) + sh, lerp(3.4, 2.95, k)];
  nnSun(st, S.sun, new THREE.Vector3(0.3, 0, -0.6), 4);
  camPt(st, c, [0.05, lerp(0.62, 0.5, k), -0.4], 46, t, 0.5, 4); renderStage(st, 1.0); bloom(0.25); };

// =====================================================================
//  MOLECULES — units: 1 = 10 nm. She is 9.7 → 2.4 units (48–52 s), chest-deep in a sea of molecules.
// =====================================================================
const NN_MPAL = ['#f2e0b0', '#f4c69a', '#f2a6a6', '#f0d070', '#f6eccc', '#a8c8e8', '#c4e0a4', '#ccb4e2', '#f4b8c8', '#e8d090', '#fff2d8'];
function nnMolStage() { return once('nnMol', () => {
  const st = makeStage({ fov: 42, far: 5000, hemi: 0.75, sky: 0xffe4b8, ground: 0x7a4a24, key: 2.3, keyCol: '#fff0d8', fog: '#c88a46', fogNear: 14, fogFar: 85 });
  const sun = dirV(30 * DEG, 52 * DEG).normalize(), S = { st, sun }; skyEnv(st, '#a8601e', '#f0c080', sun); nnDome(st, '#7a3c12', '#d89a4e', '#c88a46');
  const R = RNG('nnmol'), mm = nnPhys({ color: '#ffffff', roughness: 0.38, sheen: 0.7, sheenColor: lin('#fff4e8'), sheenRoughness: 0.4, clearcoat: 0.35, clearcoatRoughness: 0.3 });
  // the deep layer: a painted floor of packed molecules, seen through the gaps
  const flT = g3Tex((x, w) => { const R2 = RNG('nnmolf'); x.fillStyle = '#9a6a3a'; x.fillRect(0, 0, w, w); for (let k = 0; k < 2600; k++) { const px = R2.r(0, w), py = R2.r(0, w), r = R2.r(3, 9), c = lin(R2.pick(NN_MPAL)).multiplyScalar(R2.r(0.45, 0.8));
      const g = x.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r); g.addColorStop(0, '#' + c.clone().multiplyScalar(1.3).getHexString()); g.addColorStop(1, '#' + c.getHexString()); x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); } }, 512, 512);
  st.scene.add(mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), STDm({ map: wrap(flT, 130, 130), roughness: 0.6 }), 0, -0.3, -60, { cast: false }));
  // small molecules (2–6 nm): dense around her path, sparser far away
  const sg = [0, 1, 2, 3].map((i) => nnLumpy(1, 0.45, 60 + i)), SL = [[], [], [], []];
  for (let i = 0; i < 46000; i++) { const near = i < 32000, r = near ? 22 * Math.sqrt(R.f()) : R.r(22, 75), a = R.r(0, TAU), x = Math.cos(a) * r, z = Math.sin(a) * r * (near ? 1 : 1.2) - (near ? 3 : 12);
    const s = near ? R.r(0.09, 0.3) : R.r(0.25, 0.7); SL[i % 4].push({ p: [x, -0.3 + R.r(0, 0.32) + s * 0.4, z], s: [s * R.r(0.8, 1.2), s * R.r(0.7, 1), s * R.r(0.8, 1.2)], r: [R.r(0, 3), R.r(0, TAU), R.r(0, 3)], c: R.pick(NN_MPAL) }); }
  SL.forEach((L, i) => nnInst(st, sg[i], mm, L, i < 2));
  // medium proteins (5–15 nm), half-sunk
  const mg = [0, 1, 2].map((i) => nnLumpy(2, 0.5, 70 + i)), ML = [[], [], []];
  for (let i = 0; i < 1300; i++) { const r = 55 * Math.pow(R.f(), 0.8), a = R.r(0, TAU), x = Math.cos(a) * r, z = Math.sin(a) * r - 10, s = R.r(0.3, 0.85); if (nnMolPathD(x, z) < 10 + r * 0.05) continue;
    ML[i % 3].push({ p: [x, -0.05 + R.r(-0.1, 0.2), z], s: [s, s * R.r(0.7, 1), s * R.r(0.8, 1.2)], r: [R.r(0, 3), R.r(0, TAU), 0], c: R.pick(NN_MPAL) }); }
  ML.forEach((L, i) => nnInst(st, mg[i], mm, L));
  // big pink complexes (ribosome-like clusters, 15–40 nm): some afloat on the sea, some drifting in the sky
  const bg = [0, 1, 2].map((i) => nnLumpy(3, 0.55, 80 + i)), BL = [[], [], []], pinks = ['#ec9ab4', '#f2aec0', '#e488a6', '#f6c0cc', '#d87a9c'];
  const cl = []; for (let i = 0; i < 40; i++) { const sky = i % 3 !== 0, a = R.r(-1.9, 1.9) + (sky ? 0 : Math.PI * R.r(-0.2, 0.2)), r = R.r(10, 70); cl.push([Math.sin(a) * r, sky ? R.r(5, 30) : R.r(0.3, 1.2), -Math.cos(a) * r - 4, R.r(1.2, 3.4)]); }
  cl.push([9, 0.5, -12, 2.2], [-14, 0.6, -16, 2.6], [5, 7, -18, 2.0]);
  cl.forEach(([cx, cy, cz, cs]) => { if (nnMolPathD(cx, cz) < 9 + cs + (cy > 3 ? -4 : 0) || (cy > 3 && nnMolPathD(cx, cz) < 6)) return; const n = 7 + Math.floor(R.r(0, 8)), c = R.pick(pinks); for (let k = 0; k < n; k++) { const d = new THREE.Vector3(R.n(1), R.n(0.8), R.n(1)).normalize().multiplyScalar(cs * R.r(0.1, 0.6)), s = cs * R.r(0.3, 0.55);
    BL[k % 3].push({ p: [cx + d.x, cy + d.y, cz + d.z], s: [s, s * R.r(0.8, 1), s], r: [R.r(0, 3), R.r(0, 3), 0], c: C3(c, '#ffffff', R.r(0, 0.2)).getStyle() }); } });
  BL.forEach((L, i) => nnInst(st, bg[i], nnPhys({ color: '#ffffff', roughness: 0.42, sheen: 0.8, sheenColor: lin('#ffe0ea'), clearcoat: 0.3 }), L));
  // actin-like filaments: two twisted strands of beads, hanging down from the sky into the sea
  const ab = new THREE.IcosahedronGeometry(1, 2), AL = [];
  [[-6, -16, 0.35, 0.25], [9, -24, -0.4, 0.3], [-14, -34, 0.2, -0.3], [2, -40, 0.1, 0.4]].forEach(([x, z, tx, tz], j) => { const dir = new THREE.Vector3(tx, -1, tz).normalize(), o = new THREE.Vector3(x, -0.2, z).addScaledVector(dir, -38), e1 = new THREE.Vector3(1, 0, 0).cross(dir).normalize(), e2 = dir.clone().cross(e1);
    for (let k = 0; k < 140; k++) for (let s = 0; s < 2; s++) { const a = k * 2.9 + s * Math.PI, p = o.clone().addScaledVector(dir, k * 0.275 + s * 0.14).addScaledVector(e1, Math.cos(a * 0.08 + s * Math.PI) * 0.2).addScaledVector(e2, Math.sin(a * 0.08 + s * Math.PI) * 0.2);
      AL.push({ p: [p.x, p.y, p.z], s: 0.19, c: s ? '#e6ece8' : '#d4e0dc' }); } });
  nnInst(st, ab, nnPhys({ color: '#ffffff', roughness: 0.35, clearcoat: 0.4 }), AL);
  // water molecules (O red + 2 H white) swirling around her
  const NW = 900, wO = IM(new THREE.SphereGeometry(0.03, 10, 8), nnPhys({ color: '#e23a3a', roughness: 0.25, clearcoat: 0.8 }), NW, false), wH = IM(new THREE.SphereGeometry(0.021, 8, 6), nnPhys({ color: '#f4f4f4', roughness: 0.25, clearcoat: 0.8 }), NW * 2, false);
  [wO, wH].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; st.scene.add(m); });
  S.water = { wO, wH, L: Array.from({ length: NW }, () => ({ r: 0.05 + 0.6 * Math.pow(R.f(), 1.2), a: R.r(0, TAU), y: R.r(-0.01, 0.03) + 0.25 * Math.pow(R.f(), 2.2), w: R.r(0.15, 0.55) * (R.f() < 0.5 ? 1 : -1), q: [R.r(0, TAU), R.r(0, TAU), R.r(0, TAU)], qw: R.r(0.5, 2) })) };
  S.girl = makeGirl(st); return S; }); }
function nnWater(S, cx, cz, t, scale) { const W = S.water, B = M4(), O = new THREE.Vector3(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(1, 1, 1), H = new THREE.Vector3();
  W.L.forEach((m, i) => { const a = m.a + m.w * (t - 48) / Math.sqrt(m.r * 0.3 + 0.2), r = m.r * scale; O.set(cx + Math.cos(a) * r, m.y * scale + 0.02 * Math.sin(t * 1.3 + i), cz + Math.sin(a) * r);
    e.set(m.q[0] + t * m.qw, m.q[1] + t * m.qw * 0.7, m.q[2]); q.setFromEuler(e); W.wO.setMatrixAt(i, B.compose(O, q, sc));
    for (let k = 0; k < 2; k++) { const ang = (k ? 1 : -1) * 0.91; H.set(Math.sin(ang) * 0.034, Math.cos(ang) * 0.034, 0).applyQuaternion(q).add(O); W.wH.setMatrixAt(i * 2 + k, M4().compose(H, q, sc)); } });
  W.wO.instanceMatrix.needsUpdate = true; W.wH.instanceMatrix.needsUpdate = true; }
// where she is: swimming slowly forward-left
function nnMolGirl(S, t) { const h = nnH(t) / 1e-8, dir = new THREE.Vector3(-1, 0, 0.3).normalize(), d = 0.32 * 9.7 * (2 / Math.LN2) * (1 - Math.pow(2, -(t - 48) / 2)), x = dir.x * d + 1.5, z = dir.z * d - 2, ph = (t - 48) * 3.2;
  placeGirl(S.girl, x, -0.12 * h, z, h, { yaw: Math.atan2(dir.x, dir.z), walk: 0.6, ph: ph * 1.1, headPitch: -0.85, headYaw: 0.25 * Math.sin(t * 0.9), look: [0.25, 0.2],
    armL: [2.3 + 0.55 * Math.sin(ph), 0.45 + 0.55 * Math.cos(ph), 0.3 + 0.45 * Math.max(0, Math.sin(ph + 1))], armR: [2.3 + 0.55 * Math.sin(ph), 0.45 + 0.55 * Math.cos(ph), 0.3 + 0.45 * Math.max(0, Math.sin(ph + 1))], emo: { surprise: 0.35, smile: 0.35 } });
  const rt = S.girl.root; rt.rotation.order = 'YXZ'; rt.rotation.x = 1.1 + 0.04 * Math.sin(ph * 2);
  return { h, x, z, dir }; }
SHOT_FN.mol = (lt, dur, t) => { const S = nnMolStage(), st = S.st, G = nnMolGirl(S, t), h = G.h; nnWater(S, G.x + G.dir.x * 0.4 * h, G.z + G.dir.z * 0.4 * h, t, h);
  const k = EZ.io(clamp(lt / dur)), sd = new THREE.Vector3(-G.dir.z, 0, G.dir.x), hd = G.x + G.dir.x * 0.75 * h, hz = G.z + G.dir.z * 0.75 * h, c = [hd + G.dir.x * lerp(1.0, 0.85, k) * h + sd.x * lerp(0.9, 0.6, k) * h, lerp(1.05, 0.9, k) * h, hz + G.dir.z * lerp(1.0, 0.85, k) * h + sd.z * lerp(0.9, 0.6, k) * h];
  nnSun(st, S.sun, new THREE.Vector3(G.x, 0, G.z), Math.max(6, h * 1.6));
  camPt(st, c, [hd - G.dir.x * 0.15 * h, -0.05 * h, hz - G.dir.z * 0.15 * h], 44, t, 0.5, 5); renderStage(st, 0.9); bloom(0.2); };
SHOT_FN.mol2 = (lt, dur, t) => { const S = nnMolStage(), st = S.st, G = nnMolGirl(S, t), h = G.h; nnWater(S, G.x + G.dir.x * 0.4 * h, G.z + G.dir.z * 0.4 * h, t, h);
  const k = EZ.io(clamp(lt / 1.6)), sd = new THREE.Vector3(-G.dir.z, 0, G.dir.x), hd = G.x + G.dir.x * 0.75 * h, hz = G.z + G.dir.z * 0.75 * h, c = [hd + G.dir.x * lerp(1.1, 0.95, k) * h - sd.x * lerp(0.55, 0.7, k) * h, lerp(0.62, 0.55, k) * h, hz + G.dir.z * lerp(1.1, 0.95, k) * h - sd.z * lerp(0.55, 0.7, k) * h];
  nnSun(st, S.sun, new THREE.Vector3(G.x, 0, G.z), Math.max(4, h * 1.6));
  camPt(st, c, [hd - G.dir.x * 0.3 * h, -0.08 * h, hz - G.dir.z * 0.3 * h], 44, t, 0.5, 6); renderStage(st, 0.9); bloom(0.2); };

// =====================================================================
//  DNA — units: 1 = 1 nm. She is 25 → 6.25 units (52–56 s). Nucleosomes (histone octamers, ~7 nm lumpy spools) packed
//  in rows as the ground, the double helix (2 nm, 3.4 nm a turn, base pairs 0.34 nm apart) wound 1.65 times round each.
// =====================================================================
const NN_WR = 5.4, NN_BX = 3.55, NN_BY = 3.1;
function nnBasis(u) { const e1 = Math.abs(u.y) < 0.9 ? new THREE.Vector3(0, 1, 0).cross(u).normalize() : new THREE.Vector3(1, 0, 0).cross(u).normalize(); return [e1, u.clone().cross(e1).normalize()]; }
// the path of a chromatin chain: wraps round each bead (axis u) and straight linkers between them
function nnChainPath(beads) { const pts = [], n = beads.length;
  beads.forEach((b, k) => { const [e1, e2] = nnBasis(b.u), dIn = (k ? b.c.clone().sub(beads[k - 1].c) : beads[1].c.clone().sub(b.c)).normalize(), dOut = (k < n - 1 ? beads[k + 1].c.clone().sub(b.c) : dIn.clone()).normalize();
    const thIn = Math.atan2(dIn.dot(e2), dIn.dot(e1)), thOut = Math.atan2(dOut.dot(e2), dOut.dot(e1)), aIn = thIn - Math.PI / 2; let sw = ((thOut - thIn) % TAU + TAU) % TAU + TAU; if (sw > 1.9 * TAU) sw -= TAU * 0.0;
    const m = Math.ceil(sw / 0.22), at = (a, y) => b.c.clone().addScaledVector(e1, Math.cos(a) * NN_WR).addScaledVector(e2, Math.sin(a) * NN_WR).addScaledVector(b.u, y);
    if (!k) pts.push(at(aIn, -1.7).addScaledVector(dIn, -7));
    for (let j = 0; j <= m; j++) pts.push(at(aIn + sw * j / m, lerp(-1.7, 1.7, j / m)));
    if (k === n - 1) pts.push(at(aIn + sw, 1.7).addScaledVector(dOut, 7)); });
  return pts; }
// sweep the double helix along a path: two golden ribbons (vertices into A.pos/A.idx) and base-pair rungs (A.rungs)
function nnHelix(pts, ds, rungs, A) { let L0 = 0; for (let i = 1; i < pts.length; i++) L0 += pts[i].distanceTo(pts[i - 1]);
  const cv = new THREE.CatmullRomCurve3(pts, false, 'centripetal'); cv.arcLengthDivisions = Math.ceil(L0 / 0.05); const n = Math.ceil(cv.getLength() / ds), P = cv.getSpacedPoints(n);
  const T = P.map((p, i) => P[Math.min(n, i + 1)].clone().sub(P[Math.max(0, i - 1)]).normalize()), N = [], B = [];
  let nv = Math.abs(T[0].y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0); for (let i = 0; i <= n; i++) { nv = nv.clone().addScaledVector(T[i], -nv.dot(T[i])).normalize(); N.push(nv); B.push(T[i].clone().cross(nv)); }
  const wk = TAU / 3.4, RH = 0.95, rd = new THREE.Vector3(), ts = new THREE.Vector3(), w = new THREE.Vector3(), c = new THREE.Vector3(), R = RNG('nnbp' + A.rungs.length + n);
  [0, 2.35].forEach((off) => { const base = A.pos.length / 3;
    for (let i = 0; i <= n; i++) { const ph = i * ds * wk + off, co = Math.cos(ph), si = Math.sin(ph); rd.copy(N[i]).multiplyScalar(co).addScaledVector(B[i], si); c.copy(P[i]).addScaledVector(rd, RH);
      ts.copy(T[i]).addScaledVector(N[i], -si * wk * RH).addScaledVector(B[i], co * wk * RH).normalize(); w.crossVectors(rd, ts).normalize();
      [[0.38, 0.1], [-0.38, 0.1], [-0.38, -0.1], [0.38, -0.1]].forEach(([a, b]) => A.pos.push(c.x + w.x * a + rd.x * b, c.y + w.y * a + rd.y * b, c.z + w.z * a + rd.z * b));
      if (i) for (let j = 0; j < 4; j++) { const a0 = base + (i - 1) * 4 + j, a1 = base + (i - 1) * 4 + (j + 1) % 4, b0 = a0 + 4, b1 = a1 + 4; A.idx.push(a0, b0, a1, a1, b0, b1); } } });
  if (rungs) for (let i = 1; i < n; i += Math.max(1, Math.round(0.34 / ds))) { const ph = i * ds * wk, a = P[i].clone().addScaledVector(N[i], Math.cos(ph) * 0.82).addScaledVector(B[i], Math.sin(ph) * 0.82), b = P[i].clone().addScaledVector(N[i], Math.cos(ph + 2.35) * 0.82).addScaledVector(B[i], Math.sin(ph + 2.35) * 0.82), m = a.clone().lerp(b, 0.5), pr = R.pick(NN_BP), f = R.f() < 0.5;
    A.rungs.push([a, m, f ? pr[0] : pr[1]], [m, b, f ? pr[1] : pr[0]]); } }
const NN_BP = [['#f05a4a', '#4aa8f0'], ['#f4c83a', '#52c46a'], ['#4aa8f0', '#f05a4a'], ['#52c46a', '#f4c83a']];
function nnDnaStage() { return once('nnDna', () => {
  const st = makeStage({ fov: 44, far: 6000, hemi: 0.8, sky: 0xc8b0ff, ground: 0x3a2266, key: 2.4, keyCol: '#fff2e4', fog: '#5a3ea8', fogNear: 60, fogFar: 330 });
  const sun = dirV(-50 * DEG, 50 * DEG).normalize(), S = { st, sun }; skyEnv(st, '#3a2488', '#b49ae8', sun); nnDome(st, '#1e1258', '#6a4cc0', '#5a3ea8');
  const R = RNG('nndna'), beads = [], chains = [];
  // ground rows of nucleosomes (axis ~up); her row is z = 0 with beads at x = 0, 12.5, …
  for (let j = -12; j <= 12; j++) { const z0 = j * 11.6, row = []; let x = -150 + R.r(0, 6) + (j === 0 ? 0 : 0);
    if (j === 0) x = -150; while (x < 150) { const own = j === 0, c = new THREE.Vector3(own ? Math.round(x / 12.5) * 12.5 : x, own ? 0 : R.r(-0.6, 0.6), z0 + (own ? 0 : R.r(-1, 1)) + Math.sin(x * 0.05 + j) * (own ? 0 : 1.2));
      row.push({ c, u: new THREE.Vector3(R.n(own ? 0.03 : 0.08), 1, R.n(own ? 0.03 : 0.08)).normalize(), s: R.r(0.95, 1.06) }); x += own ? 12.5 : R.r(12.2, 13.4); }
    for (let a = 0; a < row.length;) { const len = 4 + Math.floor(R.r(0, 8)), part = row.slice(a, a + len); if (part.length > 1) chains.push({ b: part, ground: true }); a += len; }
    row.forEach((b) => beads.push(b)); }
  // floating chromatin: short chains drifting above, and long 30 nm solenoid fibres in the far sky
  [[-30, 34, -60, 5], [40, 30, -40, 4], [-55, 46, 10, 6], [25, 52, -95, 6], [70, 38, -20, 4], [-10, 60, -130, 5], [-70, 40, -80, 5], [5, 30, 60, 4]].forEach(([x, y, z, n], j) => { const d = new THREE.Vector3(R.n(1), R.n(0.4), R.n(1)).normalize(), b = [];
    for (let k = 0; k < n; k++) b.push({ c: new THREE.Vector3(x, y, z).addScaledVector(d, k * 13).add(new THREE.Vector3(R.n(2), R.n(2), R.n(2))), u: new THREE.Vector3(R.n(1), 1, R.n(1)).normalize(), s: 1 }); chains.push({ b, ground: false }); b.forEach((q) => beads.push(q)); });
  [[-120, 95, -170, 0.3], [90, 120, -200, -0.5], [180, 80, -40, 1.4], [-170, 110, 20, 1.2], [20, 150, -260, 0.1]].forEach(([x, y, z, ang]) => { const ax = new THREE.Vector3(Math.cos(ang), R.n(0.3), Math.sin(ang)).normalize(), [e1, e2] = nnBasis(ax), b = [];
    for (let k = 0; k < 42; k++) { const a = k * TAU / 6, c = new THREE.Vector3(x, y, z).addScaledVector(ax, (k - 21) * 11 / 6).addScaledVector(e1, Math.cos(a) * 11).addScaledVector(e2, Math.sin(a) * 11); b.push({ c, u: ax.clone(), s: 1 }); }
    chains.push({ b, ground: false, far: true }); b.forEach((q) => beads.push(q)); });
  S.beads = beads.filter((b) => Math.abs(b.c.y) < 2);
  // the spools: purple lumpy histone octamers
  const bgeo = [0, 1, 2, 3].map((i) => nnLumpy(3, 0.2, 90 + i)), BL = [[], [], [], []], lil = ['#b08ae6', '#a07ade', '#bc98ee', '#9a76d8', '#c4a2f0'];
  beads.forEach((b, i) => { const q = new THREE.Quaternion().setFromUnitVectors(nnUp, b.u).multiply(new THREE.Quaternion().setFromAxisAngle(nnUp, R.r(0, TAU))), m = new THREE.Matrix4().compose(b.c, q, new THREE.Vector3(NN_BX * b.s, NN_BY * b.s / 0.85 * 0.85, NN_BX * b.s));
    BL[i % 4].push({ m, c: R.pick(lil) }); });
  const bm = nnPhys({ color: '#ffffff', roughness: 0.42, sheen: 0.9, sheenColor: lin('#f0dcff'), sheenRoughness: 0.35, clearcoat: 0.3, clearcoatRoughness: 0.35 });
  BL.forEach((L, i) => { const m = IM(bgeo[i], bm, L.length); L.forEach((q, j) => { m.setMatrixAt(j, q.m); m.setColorAt(j, lin(q.c)); }); st.scene.add(m); });
  // a deeper layer of spools under the rows (no DNA) so the gaps read as more chromatin, not void
  const DL = []; for (let i = 0; i < 700; i++) { const x = R.r(-150, 150), z = R.r(-145, 145); DL.push({ p: [x, -6.5 + R.r(-1, 1), z], s: [NN_BX * 1.1, NN_BY, NN_BX * 1.1], r: [R.n(0.4), R.r(0, TAU), R.n(0.4)], c: C3(R.pick(lil), '#2a1660', 0.45).getStyle() }); }
  nnInst(st, bgeo[0], bm, DL); st.scene.add(mesh(new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2), STDm({ color: '#2a1a58', roughness: 0.8 }), 0, -8, 0, { cast: false }));
  // the double helices
  const A = { pos: [], idx: [], rungs: [] };
  chains.forEach((ch) => { const near = ch.b.some((b) => Math.hypot(b.c.x - 6, b.c.z) < 75 && b.c.y < 70); nnHelix(nnChainPath(ch.b), ch.far ? 0.34 : near ? 0.17 : 0.34, near, A); });
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(A.pos, 3)); rg.setIndex(new THREE.Uint32BufferAttribute(A.idx, 1)); rg.computeVertexNormals();
  st.scene.add(mesh(rg, nnPhys({ color: '#e6b440', metalness: 0.55, roughness: 0.28, clearcoat: 0.7, clearcoatRoughness: 0.2, side: THREE.DoubleSide })));
  const rodG = new THREE.CylinderGeometry(0.16, 0.16, 1, 7), rm = IM(rodG, nnPhys({ color: '#ffffff', roughness: 0.35, clearcoat: 0.5 }), A.rungs.length);
  const tmp = new THREE.Object3D(); A.rungs.forEach(([a, b, c], i) => { nnRod(tmp, a, b); tmp.updateMatrix(); rm.setMatrixAt(i, tmp.matrix); rm.setColorAt(i, lin(c)); }); st.scene.add(rm);
  // a haze of free molecules in the purple water
  const HL = []; for (let i = 0; i < 900; i++) { const p = [R.r(-160, 160), R.r(6, 140), R.r(-220, 120)]; if (p[1] < 45 && Math.abs(p[2]) < 40 && p[0] > -60 && p[0] < 45) continue; HL.push({ p, s: R.r(0.25, 0.9), r: [R.r(0, 3), R.r(0, 3), 0], c: R.pick(['#d8c8ff', '#f0b8d8', '#c0d8ff', '#ffd8b0']) }); }
  nnInst(st, nnLumpy(1, 0.4, 99), nnPhys({ color: '#ffffff', roughness: 0.4, clearcoat: 0.4 }), HL, false);
  S.girl = makeGirl(st); return S; }); }
// the top of the spool field under (x, z)
function nnBeadTop(S, x, z) { let y = -4; S.beads.forEach((b) => { const d = Math.hypot(x - b.c.x, z - b.c.z), r = NN_BX * 0.92 * b.s; if (d < r) y = Math.max(y, b.c.y + NN_BY * 0.88 * b.s * Math.sqrt(1 - (d / r) ** 2)); }); return y; }
function nnDnaGirl(S, lt) { let d = 0; const st0 = 52; for (let u = 0; u < lt; u += 0.02) d += 0.02 * 0.33 * nnH(st0 + u) / 1e-9 * (1 - ss(2.5, 3.5, u));
  const h = nnH(st0 + lt) / 1e-9, x = -3 + d, fp = Math.max(0.28 * h, 2.2); let y = -4; for (let k = -3; k <= 3; k++) y = Math.max(y, nnBeadTop(S, x + fp * k / 3, 0), nnBeadTop(S, x + fp * k / 6, 0.12 * h));
  return { h, x, y: y - 0.02, walking: 1 - ss(2.4, 3.6, lt) }; }
SHOT_FN.dna = (lt, dur, t) => { const S = nnDnaStage(), st = S.st, G = nnDnaGirl(S, lt), h = G.h;
  placeGirl(S.girl, G.x, G.y, 0, h, { yaw: Math.PI / 2 - 0.15 * (1 - G.walking), walk: 0.85 * G.walking, ph: lt * 5.5, headPitch: lerp(-0.15, -0.38, ss(2.6, 3.8, lt)), headYaw: lerp(0.15, -0.55, ss(2.4, 3.9, lt)), look: [lerp(0.2, -0.5, ss(2.4, 3.9, lt)), 0.3],
    armL: G.walking < 0.5 ? [0.15, 0.22, 0.3] : undefined, armR: G.walking < 0.5 ? [0.15, 0.22, 0.3] : undefined, emo: { surprise: 0.55, smile: 0.25 } });
  // slow epic move: low behind her at knee height, craning up and orbiting round to her front-side as the field grows
  const k = EZ.io(clamp(lt / dur)), th = lerp(-1.35, 0.38, k), d = 2.1 * h + 9, hc = lerp(0.2, 1.05, k) * h + lerp(5, 6, k);
  const c = [G.x + Math.sin(th) * d, G.y + hc, Math.cos(th) * d], tg = [G.x + 0.12 * h * Math.cos(th), G.y + lerp(0.62, 0.42, k) * h, 0];
  nnSun(st, S.sun, new THREE.Vector3(G.x, 0, 0), Math.max(18, h * 2.2));
  camPt(st, c, tg, lerp(50, 44, k), t, 0.35, 7); renderStage(st, 1.0); bloom(0.26); };

// =====================================================================
//  ATOMS — units: 1 = 1 Å. She is 62 → 37 units (56–57.5 s): a rock-salt lattice (big mint Cl, small lilac Na), a wall of it
//  behind her, and water molecules floating in the purple sky.
// =====================================================================
function nnAtomStage() { return once('nnAtom', () => {
  const st = makeStage({ fov: 44, far: 8000, hemi: 0.85, sky: 0xc8b8ff, ground: 0x4a6a6a, key: 2.2, keyCol: '#fff4e8', fog: '#5e4cb0', fogNear: 110, fogFar: 600 });
  const sun = dirV(-55 * DEG, 46 * DEG).normalize(), S = { st, sun }; skyEnv(st, '#3a2a98', '#c0b0f0', sun); nnDome(st, '#1c1060', '#5a44b8', '#7a68c0');
  const a = 2.82, CL = [], NA = [], R = RNG('nnat');
  const add = (p, type) => (type ? NA : CL).push(p);
  for (let i = -58; i <= 58; i++) for (let j = -120; j <= 28; j++) { const x = i * a, z = j * a, far = Math.hypot(x, z + 60); if (far > 330) continue; add([x, 0, z], (i + j) & 1); if (Math.abs(i) < 26 && j > -40 && j < 18) add([x, -a, z], (i + j + 1) & 1); }
  // the wall: a slab of the same crystal resting on the floor, receding to the right behind her
  const wd = new THREE.Vector3(Math.cos(-0.42), 0, Math.sin(-0.42)), wn = new THREE.Vector3(-wd.z, 0, wd.x), wo = new THREE.Vector3(-90, a, -62);
  for (let u = -10; u < 120; u++) for (let v = 0; v < 13; v++) for (let w = 0; w < 3; w++) { const p = wo.clone().addScaledVector(wd, u * a).addScaledVector(wn, -w * a); add([p.x, v * a + a * 0.95, p.z], (u + v + w) & 1); }
  const sph = new THREE.SphereGeometry(1, 16, 12), jit = (c, k) => C3(c, '#ffffff', R.r(-k, k)).getStyle();
  nnInst(st, sph, nnPhys({ color: '#ffffff', roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25, sheen: 0.5, sheenColor: lin('#e8fff4') }), CL.map((p) => ({ p, s: 1.62, c: jit('#9ce6c6', 0.12) })));
  nnInst(st, sph, nnPhys({ color: '#ffffff', roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25 }), NA.map((p) => ({ p, s: 1.0, c: jit('#a88ae6', 0.1) })));
  // water molecules in the sky (space-filling: red O, two white H), drifting and tumbling
  const NW = 520, wO = IM(new THREE.SphereGeometry(1.4, 16, 12), nnPhys({ color: '#e04450', roughness: 0.22, clearcoat: 0.9 }), NW, false), wH = IM(new THREE.SphereGeometry(1.0, 12, 10), nnPhys({ color: '#f6f2f4', roughness: 0.22, clearcoat: 0.9 }), NW * 2, false);
  [wO, wH].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; st.scene.add(m); });
  S.water = { wO, wH, L: Array.from({ length: NW }, (_, i) => ({ p: i < 90 ? [R.r(-90, 90), R.r(45, 110), R.r(-110, 20)] : [R.r(-300, 300), R.r(60, 330), R.r(-420, 40)], q: [R.r(0, TAU), R.r(0, TAU), R.r(0, TAU)], w: R.r(0.3, 1.2), v: [R.n(2), R.n(1.5), R.n(2)] })) };
  S.girl = makeGirl(st); return S; }); }
SHOT_FN.atoms = (lt, dur, t) => { const S = nnAtomStage(), st = S.st, h = nnH(t) / 1e-10, W = S.water, q = new THREE.Quaternion(), e = new THREE.Euler(), O = new THREE.Vector3(), H = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  W.L.forEach((m, i) => { O.set(m.p[0] + m.v[0] * lt, m.p[1] + m.v[1] * lt, m.p[2] + m.v[2] * lt); q.setFromEuler(e.set(m.q[0] + lt * m.w, m.q[1] + lt * m.w * 0.6, m.q[2])); W.wO.setMatrixAt(i, M4().compose(O, q, one));
    for (let k = 0; k < 2; k++) { const an = (k ? 1 : -1) * 0.91; H.set(Math.sin(an) * 1.2, Math.cos(an) * 1.2, 0).applyQuaternion(q).add(O); W.wH.setMatrixAt(i * 2 + k, M4().compose(H, q, one)); } });
  W.wO.instanceMatrix.needsUpdate = true; W.wH.instanceMatrix.needsUpdate = true;
  placeGirl(S.girl, 0, 1.55, 0, h, { yaw: 0.95, headYaw: 0.55 * Math.sin(lt * 2.0 - 0.6), headPitch: -0.1 - 0.12 * Math.sin(lt * 1.3), look: [0.6 * Math.sin(lt * 2.0 - 0.4), 0.2], armL: [0.08, 0.2, 0.25], armR: [0.12, 0.22, 0.3], emo: { surprise: 0.5, smile: 0.2 } });
  const k = EZ.io(clamp(lt / dur)), c = [lerp(0.95, 0.85, k) * h + 18, lerp(0.42, 0.4, k) * h + 3, lerp(1.55, 1.4, k) * h + 26];
  nnSun(st, S.sun, new THREE.Vector3(0, 0, -10), Math.max(60, h * 1.8));
  camPt(st, c, [-0.3 * h, 0.52 * h, -0.5 * h], 44, t, 0.4, 8); renderStage(st, 1.0); bloom(0.22); };
