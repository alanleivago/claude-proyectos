// rbx-chess BOX set: inside the Box. Dark walnut plank walls, brass corner brackets, a lid with a light slit along
// one edge, and a heap of every captured citizen stacked to the ceiling (instanced low-poly R6 figures with their
// piece hats; the oldest ones faded grey). Interior: x -22..22, z -26..26, floor y=0, lid underside y=34.
// The heap rises from the front (+z, ~5 high) to the back wall (to the ceiling). Dad lies on top (mark p_dad_top).
'use strict';
SETS.box = async function (ctx) {
  const T = THREE, { cnv, tex, pbr, rng, fbm } = RBX, { V, uvBox } = KIT;
  const scene = new T.Scene(), props = {}, marks = {}, PI = Math.PI, C = (h) => new T.Color(h);
  const W = 44, D = 52, H = 34, SS = T.MathUtils.smoothstep;
  const SM = (o) => new T.MeshStandardMaterial(o);
  const BX = (w, h, d, m, x, y, z, par = scene) => { const me = new T.Mesh(uvBox(new T.BoxGeometry(w, h, d), w, h, d), m); me.position.set(x, y, z); par.add(me); return me; };
  const P = (t, o) => pbr(t.c, t.h, o);

  // ---------- materials ----------
  const wallT = KIT.woodPlanks(1024, 501, { rows: 6, tones: ['#4a2a18', '#3e2414', '#55301c', '#42261a', '#4c2c1a'], knots: 16 });
  const floorT = KIT.woodPlanks(1024, 502, { rows: 8, tones: ['#3a2214', '#33200f', '#42281a'], knots: 10 });
  const M = { wall: P(wallT, { physical: true, rough: 0.55, bump: 4, repeat: [1 / 18, 1 / 9] }), floor: P(floorT, { rough: 0.7, bump: 3, repeat: [1 / 16, 1 / 16] }),
    lid: P(wallT, { rough: 0.7, bump: 4, repeat: [1 / 18, 1 / 9] }), brass: SM({ color: '#b08a4a', roughness: 0.35, metalness: 0.85 }), nail: SM({ color: '#3a3a3e', roughness: 0.4, metalness: 0.8 }),
    felt: SM({ color: '#2a3a2a', roughness: 1 }), heap: SM({ color: '#1a1412', roughness: 1 }) };
  // ---------- shell ----------
  BX(W, 1, D, M.floor, 0, -0.5, 0);
  [[W, H, 1, 0, H / 2, -D / 2 - 0.5], [W, H, 1, 0, H / 2, D / 2 + 0.5], [1, H, D, -W / 2 - 0.5, H / 2, 0], [1, H, D, W / 2 + 0.5, H / 2, 0]].forEach(([w, h, d, x, y, z]) => BX(w, h, d, M.wall, x, y, z));
  // corner posts + brass brackets + nail rows
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => { BX(2.2, H, 2.2, M.wall, sx * (W / 2 - 1.1), H / 2, sz * (D / 2 - 1.1));
    for (let k = 0; k < 3; k++) { BX(2.6, 1.6, 0.25, M.brass, sx * (W / 2 - 1.4), 3 + k * 13, sz * (D / 2 - 2.3)); BX(0.25, 1.6, 2.6, M.brass, sx * (W / 2 - 2.3), 3 + k * 13, sz * (D / 2 - 1.4)); } }));
  const nailG = new T.SphereGeometry(0.12, 8, 6), nails = new T.InstancedMesh(nailG, M.nail, 400); let ni = 0; const m4 = new T.Matrix4();
  for (let y = 2; y < H; y += 5.6) for (let x = -W / 2 + 3; x < W / 2 - 2; x += 3.2) [-1, 1].forEach((s) => { if (ni < 400) nails.setMatrixAt(ni++, m4.makeTranslation(x, y, s * (D / 2 - 0.02))); });
  for (let y = 2; y < H; y += 5.6) for (let z = -D / 2 + 3; z < D / 2 - 2; z += 3.2) [-1, 1].forEach((s) => { if (ni < 400) nails.setMatrixAt(ni++, m4.makeTranslation(s * (W / 2 - 0.02), y, z)); });
  nails.count = ni; scene.add(nails);
  // lid: underside planks with cross battens; it sits a little open along the +x edge -> a slit of daylight
  const SLIT = 1.6;
  BX(W - SLIT, 1.2, D, M.lid, -SLIT / 2, H + 0.6, 0);
  for (let z = -D / 2 + 6; z < D / 2; z += 10) BX(W - SLIT - 1, 0.8, 1.6, M.wall, -SLIT / 2, H - 0.4, z);
  const outside = new T.Mesh(new T.PlaneGeometry(SLIT * 4, D * 1.4), new T.MeshBasicMaterial({ color: C('#fff1d6').multiplyScalar(8), toneMapped: false, fog: false }));
  outside.rotation.x = PI / 2; outside.position.set(W / 2 - SLIT / 2, H + 3, 0); scene.add(outside);
  BX(W + 4, 1, D + 4, M.lid, 0, H + 6, 0);   // the lid's far top (keeps the slit light a slit)

  // ---------- the heap ----------
  const hN = fbm(511, 3, 4);
  const heapH = (x, z) => { const front = SS(-z, -22, 0), back = SS(-z, 13, 24), nz = hN((x + 22) / 44, (z + 26) / 52) - 0.5, edge = SS(Math.abs(x), W * 0.3, W * 0.5);
    return Math.min(H - 0.8, 3 + 18.5 * front + 13 * back + nz * (2 + 5 * front) + 5 * edge * front + 4 * edge * back); };
  props.heapH = heapH;
  { const g = new T.PlaneGeometry(W, D, 66, 78); g.rotateX(-PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, Math.max(0, heapH(p.getX(i), p.getZ(i)) - 1.6)); g.computeVertexNormals(); scene.add(new T.Mesh(g, M.heap)); }
  // instanced figures: template rig -> per-part world matrices
  const fab = (seed) => { const f = RBX.fleece(256, 256, '#ffffff', seed); return pbr(f.c, f.h, { rough: 0.9, bump: 1.5, nscale: 0.3 }); };
  const clothM = fab(521), skinM = SM({ color: '#ffffff', roughness: 0.6 }), lacM = new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.35, clearcoat: 0.6 });
  const faceT = RBX.faceTex('neutral'), faceT2 = RBX.faceTex('closed');
  const faceM = SM({ map: faceT, transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }), faceM2 = SM({ map: faceT2, transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 });
  const G = { torso: RBX.rbox(2, 2, 1, 0.08, 4), limb: RBX.rbox(1, 2, 1, 0.08, 4), head: new T.CylinderGeometry(0.6, 0.6, 1.2, 16), face: new T.CylinderGeometry(0.61, 0.61, 0.8, 12, 1, true, -PI / 3, (2 * PI) / 3),
    pawn: (() => { const a = new T.SphereGeometry(0.52, 14, 10); a.translate(0, 1.42, 0); return a; })(), collar: (() => { const a = CHESS.latheGeo([[0, 0.5], [0.78, 0.5], [0.8, 0.66], [0.5, 0.8], [0.3, 1.05], [0.42, 1.1], [0, 1.12]], 16); return a; })(),
    rook: (() => { const a = CHESS.latheGeo([[0, 0.4], [0.7, 0.4], [0.62, 1.1], [0.86, 1.25], [0.86, 1.75], [0.55, 1.75], [0.55, 1.55], [0, 1.55]], 8); return a; })(), mitre: (() => { const a = CHESS.latheGeo([[0, 0.4], [0.7, 0.4], [0.78, 0.9], [0.6, 1.6], [0.25, 2.2], [0.12, 2.35], [0, 2.4]], 14); return a; })(),
    crown: (() => { const a = new T.CylinderGeometry(0.9, 0.7, 0.9, 9, 1, true); a.translate(0, 0.95, 0); return a; })(), mane: (() => { const a = new T.SphereGeometry(0.85, 14, 10); a.scale(1, 1.1, 1.05); a.translate(0, 0.2, -0.05); return a; })() };
  const L = {}; const push = (k, geo, mat, m, c) => { (L[k] = L[k] || { geo, mat, ms: [], cs: [] }); L[k].ms.push(m.clone()); L[k].cs.push(c); };
  const rig = new T.Group(), body = new T.Group(); rig.add(body); body.position.y = 3;
  const parts = { torso: new T.Object3D(), head: new T.Object3D(), armL: new T.Group(), armR: new T.Group(), legL: new T.Group(), legR: new T.Group() };
  body.add(parts.torso); const neck = new T.Group(); neck.position.y = 1; body.add(neck); parts.head.position.y = 0.64; neck.add(parts.head);
  [['armL', 1.5, 1], ['armR', -1.5, 1], ['legL', 0.5, -1], ['legR', -0.5, -1]].forEach(([k, x, y]) => { parts[k].position.set(x, y, 0); body.add(parts[k]); const o = new T.Object3D(); o.position.y = -1; parts[k].add(o); parts[k].end = o; });
  const SHIRTS = ['#ece2cc', '#34302e', '#efe6d2', '#2c2a30', '#b4581e', '#3c5a8a', '#8e5fc0', '#3a8a4a', '#c4362e', '#e8b830'], SKIN = ['#efcfa8', '#e0b48a', '#c8946a', '#f2d8b8'];
  const HATS = ['pawn', 'pawn', 'pawn', 'pawn', 'rook', 'mitre', 'pawn', 'crown', 'mane', 'pawn'];
  const grey = (hex, k) => { const c = C(hex), l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11; return c.lerp(C('#7c7a77').multiplyScalar(0.75 + l * 0.35), k); };
  const r = rng(531), q = new T.Quaternion(), up = V(0, 1, 0);
  let count = 0;
  const place = (x, z, lift = 0) => {
    const y = heapH(x, z) + lift, e = 0.6, nx = (heapH(x - e, z) - heapH(x + e, z)) / (2 * e), nz = (heapH(x, z - e) - heapH(x, z + e)) / (2 * e), n = V(nx, 1, nz).normalize();
    // lying on the slope: body axis roughly along the surface, random spin and roll
    rig.position.set(x, y - 0.4, z); rig.quaternion.setFromUnitVectors(up, n); rig.rotateY(r() * PI * 2); rig.rotateX(-PI / 2 + (r() - 0.5) * 0.9); rig.rotateZ((r() - 0.5) * 1.1);
    rig.translateZ(0); rig.translateY(-3 + (r() - 0.5));
    const pose = () => [(r() - 0.5) * 1.2, 0, (r() - 0.5) * 0.6];
    ['armL', 'armR', 'legL', 'legR'].forEach((k) => parts[k].rotation.set(...pose())); neck.rotation.set((r() - 0.5) * 0.8, (r() - 0.5) * 1.4, (r() - 0.5) * 0.6);
    rig.updateMatrixWorld(true);
    const fade = r() < 0.38 ? 0.9 + r() * 0.1 : r() * 0.05, sh = grey(SHIRTS[(r() * SHIRTS.length) | 0], fade), pa = grey(['#1d1b1c', '#b9a88a', '#2c3140', '#4a4a52'][(r() * 4) | 0], fade), sk = grey(SKIN[(r() * 4) | 0], fade * 0.9);
    const side = r() < 0.5 ? '#efe0c0' : '#2e2420', hc = grey(side, fade);
    push('torso', G.torso, clothM, parts.torso.matrixWorld, sh); push('head', G.head, skinM, parts.head.matrixWorld, sk); push(r() < 0.5 ? 'face' : 'face2', G.face, r() < 0.5 ? faceM : faceM2, parts.head.matrixWorld, C(fade > 0.5 ? '#9a9a9a' : '#ffffff'));
    ['armL', 'armR'].forEach((k) => push('arm', G.limb, clothM, parts[k].end.matrixWorld, sh)); ['legL', 'legR'].forEach((k) => push('leg', G.limb, clothM, parts[k].end.matrixWorld, pa));
    const hat = HATS[(r() * HATS.length) | 0];
    if (hat === 'pawn') { push('collar', G.collar, lacM, parts.head.matrixWorld, hc); push('pawn', G.pawn, lacM, parts.head.matrixWorld, hc); }
    else if (hat === 'crown') push('crown', G.crown, lacM, parts.head.matrixWorld, grey('#e2b450', fade));
    else if (hat === 'mane') push('mane', G.mane, clothM, parts.head.matrixWorld, grey(['#8a5232', '#5a3a2a', '#d8c8a8'][(r() * 3) | 0], fade));
    else push(hat, G[hat], lacM, parts.head.matrixWorld, hc);
    count++;
  };
  // layers: dense jittered grid over the heap, two layers
  for (let layer = 0; layer < 2; layer++) for (let x = -W / 2 + 2; x < W / 2 - 1; x += 2.9) for (let z = -D / 2 + 2; z < D / 2 - 6; z += 2.5) {
    if (layer && r() < 0.6) continue; const jx = x + (r() - 0.5) * 1.4, jz = z + (r() - 0.5) * 1.4; if (heapH(jx, jz) < 2.5 && r() < 0.6) continue; place(jx, jz, layer * 0.9 - 0.3); }
  // a few loose ones on the floor near the front
  for (let i = 0; i < 14; i++) place(-16 + r() * 32, 10 + r() * 12, 0);
  const tmp = new T.Matrix4();
  Object.values(L).forEach((l) => { const im = new T.InstancedMesh(l.geo, l.mat, l.ms.length); l.ms.forEach((m, i) => { im.setMatrixAt(i, m); im.setColorAt(i, l.cs[i]); }); im.castShadow = !l.mat.transparent; im.receiveShadow = true; scene.add(im); });
  console.log('box figures', count);

  // ---------- light: slit sun + dust ----------
  const hemi = new T.HemisphereLight('#4a5a88', '#3a2010', 1.1);
  const fillB = new T.DirectionalLight('#8aa0d8', 0.8); fillB.position.set(-10, 20, 40); scene.add(fillB); scene.add(hemi);
  const sun = new T.DirectionalLight('#ffd7a0', 7); sun.position.set(W / 2 - SLIT / 2 + 20, H + 40, 0); sun.target.position.set(-6, 12, -6); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 140 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.05; scene.add(sun, sun.target);
  const slitL = new T.PointLight('#ffc890', 900, 70, 2); slitL.position.set(W / 2 - 4, H - 3, -4); scene.add(slitL);
  const bounce = new T.PointLight('#ff9a50', 260, 60, 2); bounce.position.set(-4, 22, 4); scene.add(bounce);
  const beamM = RBX.beamMat('#ffd8a0', 0.07), dir = sun.target.position.clone().sub(sun.position).normalize();
  const beam = RBX.beam(V(W / 2 - SLIT / 2, H, 0), dir, D * 0.85, 3.0, 60, beamM); scene.add(beam); props.beam = beam;
  { const N = 900, g = new T.BufferGeometry(), p = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const t = r() * 50; p[i * 3] = W / 2 - 1 + dir.x * t + (r() - 0.5) * 4; p[i * 3 + 1] = H + dir.y * t + (r() - 0.5) * 3; p[i * 3 + 2] = (r() - 0.5) * D * 0.8; }
    g.setAttribute('position', new T.BufferAttribute(p, 3)); const dust = new T.Points(g, new T.PointsMaterial({ color: C('#ffe8c0').multiplyScalar(3), size: 0.12, transparent: true, opacity: 0.7, depthWrite: false, toneMapped: false })); scene.add(dust); props.dust = dust; }
  scene.fog = new T.FogExp2(C('#0a0604'), 0.006); scene.background = C('#050302');
  scene.traverse((m) => { if (m.isMesh && !m.isInstancedMesh) { const mt = Array.isArray(m.material) ? m.material[0] : m.material; m.castShadow = !(mt.isMeshBasicMaterial || mt.isShaderMaterial); m.receiveShadow = !mt.isMeshBasicMaterial; } });

  // ---------- marks / views ----------
  const mk = (name, x, z, ry = 0, dy = 0) => { marks[name] = { p: [x, +(heapH(x, z) + dy).toFixed(2), z], ry }; };
  mk('p_dad_top', 0, -7, 0.3, 0.6); mk('p_hero_floor', 3, 21, PI, 0); marks.p_hero_floor.p[1] = 0;
  mk('p_pile_a', -10, 4, 0.5); mk('p_pile_b', 12, 0, -0.6);
  const views = {
    wide: { p: [4, 6, 25], l: [0, 18, -14], fov: 62 },
    dad: { p: [6, heapH(1, -6) + 4, 6], l: [1, heapH(1, -6) + 2, -6], fov: 50 },
    slit: { p: [-14, 10, 20], l: [16, 30, -6], fov: 60 },
  };
  return { scene, grade: 'box', marks, props, views, mood() {}, reset() {} };
};
