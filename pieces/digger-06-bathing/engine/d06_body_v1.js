  // ===================================== production sets (user: a distinct, recognizable place for every solution, green balance) =====================================
  const tex = (w, h, fn) => { const t = L.cvs(w, h, fn); return t; };
  const MOSAIC = tex(32, 32, (c) => { for (let y = 0; y < 32; y += 2) for (let x = 0; x < 32; x += 2) { const k = ((x * 7 + y * 13) >> 2) % 5; c.fillStyle = ['#e8dcc0', '#d8c8a0', '#c86a3a', '#3a6a8a', '#e8dcc0'][k]; c.fillRect(x, y, 2, 2); }
    c.fillStyle = '#2a4a6a'; c.fillRect(0, 0, 32, 2); c.fillRect(0, 0, 2, 32); c.fillStyle = '#c86a3a'; c.fillRect(14, 14, 4, 4); });
  const PLASTER = tex(16, 16, (c) => { c.fillStyle = '#efe6d2'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#e2d8c2'; for (let i = 0; i < 10; i++) c.fillRect((i * 7) % 15, (i * 5) % 15, 2, 1); });
  const ERMINE = tex(16, 16, (c) => { c.fillStyle = '#f8f6f0'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#141418'; for (const [x, y] of [[3, 3], [11, 6], [6, 11], [13, 13]]) { c.fillRect(x, y, 1, 3); c.fillRect(x - 1, y, 3, 1); } });
  const DOUBLET = tex(16, 16, (c) => { c.fillStyle = '#7a1a1a'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#e8b840'; for (let x = 1; x < 16; x += 4) c.fillRect(x, 0, 1, 16); c.fillStyle = '#5a0e0e'; for (let y = 3; y < 16; y += 5) c.fillRect(0, y, 16, 1); });
  const LINEN = tex(16, 16, (c) => { c.fillStyle = '#f4f0e4'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#dcd6c4'; for (let x = 0; x < 16; x += 3) c.fillRect(x, 0, 1, 16); });
  function riverBank(scene) { hillSet(scene); scene.fog = null;
    L.box(10, 0.42, 2.4, new THREE.MeshLambertMaterial({ color: 0x6a5a3a }), 0, -0.25, 0.2, scene);   // the riverbed
    const water = L.box(10, 0.04, 2.4, new THREE.MeshBasicMaterial({ color: 0x3a8ad0, transparent: true, opacity: 0.72 }), 0, 0.3, 0.2, scene);
    for (const z of [-1.0, 1.4]) { const b = L.box(10, 0.32, 0.25, mm(MT.earth, 8, 0.5, 0x7a6a4a), 0, 0.12, z, scene); }
    for (let i = 0; i < 9; i++) L.box(0.5, 0.012, 0.03, new THREE.MeshBasicMaterial({ color: 0xd8f0ff }), -2.2 + i * 0.55, 0.325, -0.4 + (i % 3) * 0.45, scene);
    for (const [x, z, r] of [[-1.5, -1.0, 0.22], [1.6, -0.95, 0.18], [-1.9, 1.4, 0.2], [1.9, 1.45, 0.24]]) { const o = L.mesh(new THREE.DodecahedronGeometry(r, 0), mm(MT.stone, 1, 1), x, 0.32, z, scene); o.rotation.set(x, z, 0); }
    leafTree(scene, -2.4, -1.8, 3.4); leafTree(scene, 2.6, -2.0, 3.8, { blossom: true }); bush(scene, -1.2, -1.5, 0.45); bush(scene, 1.3, -1.6, 0.4);
    for (let i = 0; i < 10; i++) { const r = L.box(0.03, 0.4 + (i % 3) * 0.1, 0.03, L.basic(null, 0x4a8a3a), -2.4 + i * 0.5, 0.45, -1.05 + (i % 2) * 0.08, scene); r.rotation.z = (i % 2 ? 0.15 : -0.1); }
    return { water }; }
  function thermae(scene) { L.addSky(scene, { near: 14, far: 60, preset: 'morning' }); scene.fog = null;
    L.box(10, 0.1, 8, litM(L.rep(MOSAIC, 10, 8), 0xffffff), 0, -0.05, 0.5, scene);
    const pool = new THREE.Group(); pool.position.set(0, 0, -0.3); scene.add(pool);
    for (const [w, d, x, z] of [[3.4, 0.22, 0, -1.05], [3.4, 0.22, 0, 1.05], [0.22, 2.3, -1.6, 0], [0.22, 2.3, 1.6, 0]]) L.box(w, 0.42, d, mm(MT.carved, 2, 0.4, 0xf4ecdc), x, 0.21, z, pool);
    L.box(3.0, 0.02, 1.9, litM(L.rep(MOSAIC, 4, 3), 0xa8d0d8), 0, 0.01, 0, pool); const water = L.box(3.0, 0.04, 1.9, new THREE.MeshBasicMaterial({ color: 0x5ac0d0, transparent: true, opacity: 0.7 }), 0, 0.36, 0, pool);
    const col = litM(null, 0xfaf6ee);   // white marble colonnade over a Pompeian-red wall, so the columns and arches read
    for (const x of [-2.4, -0.8, 0.8, 2.4]) { L.mesh(new THREE.CylinderGeometry(0.17, 0.19, 2.2, 12), col, x, 1.1, -2.2, scene); L.box(0.48, 0.16, 0.48, col, x, 2.27, -2.2, scene); L.box(0.48, 0.14, 0.48, col, x, 0.07, -2.2, scene); }
    for (const x of [-1.6, 0, 1.6]) L.mesh(new THREE.TorusGeometry(0.8, 0.12, 5, 12, Math.PI), col, x, 2.35, -2.2, scene);
    L.box(8, 0.26, 0.36, col, 0, 3.3, -2.2, scene); L.box(9, 4.4, 0.1, litM(null, 0xa8443a), 0, 2.2, -3.0, scene); L.box(9, 0.9, 0.12, litM(null, 0x2a5a4a), 0, 0.45, -2.95, scene);
    for (const [x, z] of [[-1.6, -2.6], [0, -2.6], [1.6, -2.6]]) pottedTree(scene, x, z, 0.8); for (const [x, z] of [[-2.9, 0.6], [2.9, 0.5]]) pottedTree(scene, x, z, 0.9);
    scene.add(new THREE.AmbientLight(0xfff0d8, 0.5)); return { water }; }
  function stewsHall(scene) { L.addSky(scene, { near: 8, far: 40, preset: 'interior' }); scene.fog = null; const beam = mm(MT.darkWood, 0.3, 3), pl = new THREE.MeshLambertMaterial({ map: L.rep(PLASTER, 3, 2), flatShading: true });
    L.box(9, 0.08, 7, mm(MT.wood, 8, 6, 0x9a6a3a), 0, -0.04, 0.5, scene);
    L.box(9, 3.6, 0.12, pl, 0, 1.8, -1.9, scene); L.box(0.12, 3.6, 7, pl, -3.0, 1.8, 0.5, scene);
    for (let x = -4; x <= 4; x += 1.2) L.box(0.16, 3.6, 0.1, beam, x, 1.8, -1.82, scene); for (const y of [1.1, 2.4, 3.5]) L.box(9, 0.14, 0.1, beam, 0, y, -1.82, scene);
    for (const [x, y] of [[-3.4, 1.75], [-1.0, 1.75], [1.4, 1.75], [3.8, 1.75]]) { const d = L.box(1.3, 0.12, 0.08, beam, x, y, -1.8, scene); d.rotation.z = (x > 0 ? 0.55 : -0.55); }
    for (let z = -1.6; z < 3; z += 1.3) L.box(9, 0.2, 0.18, beam, 0, 3.55, z, scene);
    const sg = new THREE.Group(); sg.position.set(-0.85, 1.7, -1.6); scene.add(sg); L.box(1.1, 0.42, 0.06, mm(MT.wood, 1, 0.4, 0x7a4a24), 0, 0, 0, sg); for (const s2 of [-1, 1]) L.box(0.02, 0.4, 0.02, litM(null, 0x2a2a30), s2 * 0.45, 0.4, 0, sg);
    letters3D(sg, 'STEWS', { size: 0.17, x: 0, y: -0.02, z: 0.06, jitter: 0.5, front: 0xffe8a0, side: 0x8a6a2a });
    for (const [x, y] of [[1.6, 2.3], [-2.7, 2.2]]) { L.box(0.18, 0.26, 0.18, L.basic(null, 0xffd890), x, y, -1.7, scene); const p = new THREE.PointLight(0xffc070, 2.2, 5); p.position.set(x, y, -1.2); scene.add(p); }
    pottedTree(scene, 2.6, -1.2, 0.7); pottedTree(scene, -2.5, 1.2, 0.6); ivy(scene, 3.4, 1.5, -1.83, 0.9, 2.6);
    scene.add(new THREE.AmbientLight(0xffe0c0, 0.45)); return { sg }; }
  function periodBedroom(scene) { const R0 = roomWithWindow(scene, { preset: 'morning', wx: 0.75 }); scene.fog = null;
    const bd = bed(scene, { x: -1.0, z: -0.3, quilt: 0x6a4a8a, full: true }); for (const [x, z] of [[-1.45, -1.2], [-0.55, -1.2], [-1.45, 0.65], [-0.55, 0.65]]) L.box(0.06, 2.1, 0.06, mm(MT.darkWood, 0.2, 2), x, 1.05, z, scene);
    L.box(1.0, 0.06, 1.95, new THREE.MeshLambertMaterial({ color: 0x8a2a3a, flatShading: true }), -1.0, 2.1, -0.28, scene);
    const wr = L.box(0.8, 1.9, 0.5, mm(MT.darkWood, 1, 2, 0x8a5a34), 1.6, 0.95, -0.95, scene); pottedTree(scene, 0.25, -0.75, 0.55);
    return { R0, bd }; }
  function cottageKitchen(scene) { L.addSky(scene, { near: 8, far: 40, preset: 'interior' }); scene.fog = null;
    L.box(9, 0.08, 7, mm(MT.flag, 6, 5, 0xc8b8a0), 0, -0.04, 0.5, scene);
    stoneCourses(scene, { x0: -4, x1: 4, y0: 0, y1: 3.4, z: -1.8, depth: 0.3, seed: 12 }); stoneCourses(scene, { x0: -1.8, x1: 3, y0: 0, y1: 3.4, z: -3.2, ry: -Math.PI / 2, depth: 0.3, seed: 17 });
    for (let z = -1.5; z < 3; z += 1.2) L.box(9, 0.18, 0.16, mm(MT.darkWood, 6, 0.3), 0, 3.3, z, scene);
    const H0 = hearth(scene, -1.25, -1.45); kettle(scene, -1.25, 0.97, -1.5);
    const wg = new THREE.Group(); wg.position.set(1.4, 1.75, -1.62); scene.add(wg); L.plane(0.8, 0.8, L.basic(L.cvs(8, 8, (c) => { c.fillStyle = '#7ac85a'; c.fillRect(0, 0, 8, 8); c.fillStyle = '#5aa8e8'; c.fillRect(0, 0, 8, 3); c.fillStyle = '#4a9a3a'; c.fillRect(1, 4, 3, 2); }), 1), 0, 0, 0, wg);
    for (const s2 of [-1, 1]) { L.box(0.08, 0.9, 0.1, mm(MT.darkWood, 0.2, 1), s2 * 0.44, 0, 0.02, wg); L.box(0.96, 0.08, 0.12, mm(MT.darkWood, 1, 0.2), 0, s2 * 0.44, 0.02, wg); }
    windowBox(scene, 1.4, 1.27, -1.5, 0.8);
    const tb = new THREE.Group(); tb.position.set(1.9, 0, -1.0); scene.add(tb); L.box(1.0, 0.06, 0.6, mm(MT.wood, 1, 0.6), 0, 0.75, 0, tb); for (const [x, z] of [[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]]) L.box(0.06, 0.75, 0.06, mm(MT.darkWood, 0.2, 1), x, 0.375, z, tb);
    for (let i = 0; i < 4; i++) { const hb = L.box(0.06, 0.25, 0.06, L.basic(null, 0x5a9a3a), -0.9 + i * 0.22, 3.1, -1.4, scene); }
    scene.add(new THREE.AmbientLight(0xffe0c0, 0.5)); return { H0 }; }
  function georgianRoom(scene) { const R0 = roomWithWindow(scene, { preset: 'morning', wx: -1.1, tint: 0.95 }); scene.fog = null;
    L.box(8, 0.12, 0.08, mm(MT.wood, 6, 0.2, 0xf4f0e4), 0, 0.95, -1.18, scene); L.box(8, 0.14, 0.1, mm(MT.wood, 6, 0.2, 0xf4f0e4), 0, 2.9, -1.18, scene);
    for (let x = -3.2; x <= 3.2; x += 0.9) if (Math.abs(x + 1.1) > 0.7) L.box(0.7, 0.62, 0.03, mm(MT.wainscot, 1, 1, 0x9ac8b8), x, 0.5, -1.16, scene);
    pottedTree(scene, -1.9, -0.6, 0.6); pottedTree(scene, 1.7, -0.7, 0.6); return { R0 }; }
  // ---- Henry VIII: his own PS1 figure (broad Tudor build, beard, flat feathered cap with a crown, red cape with ermine, striped doublet); all one group
  function henryVIII(parent, x, z, s = 1, ry = 0) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; g.scale.setScalar(s); parent.add(g);
    const skin = litM(null, 0xf0c8a0), white = litM(null, 0xf4f0e8), black = litM(null, 0x18181c), gold = litM(null, 0xf0c030);
    for (const s2 of [-1, 1]) { L.box(0.14, 0.62, 0.15, white, s2 * 0.13, 0.31, 0, g); L.box(0.17, 0.08, 0.26, black, s2 * 0.13, 0.04, 0.04, g); L.mesh(new THREE.SphereGeometry(0.15, 8, 6), litM(L.rep(DOUBLET, 1, 1), 0xffffff), s2 * 0.13, 0.72, 0, g); }
    { const d = L.mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.64, 10), litM(L.rep(DOUBLET, 2, 2), 0xffffff), 0, 1.1, 0, g); d.scale.set(1, 1, 0.68); }   // broad barrel doublet
    { const k = L.mesh(new THREE.CylinderGeometry(0.33, 0.44, 0.3, 10), litM(L.rep(DOUBLET, 2, 2), 0xffffff), 0, 0.66, 0, g); k.scale.set(1, 1, 0.75); }   // skirted bases
    { const b = L.mesh(new THREE.CylinderGeometry(0.345, 0.345, 0.06, 10), gold, 0, 0.8, 0, g); b.scale.set(1, 1, 0.7); }   // belt
    for (const s2 of [-1, 1]) { const sl = L.mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshLambertMaterial({ color: 0xa01a2a, flatShading: true }), s2 * 0.68, 1.18, 0.02, g); sl.scale.set(1, 1.25, 1);   // huge puffed gown sleeves
      L.box(0.17, 0.36, 0.17, litM(L.rep(DOUBLET, 2, 2), 0xffffff), s2 * 0.68, 0.86, 0.06, g); L.box(0.2, 0.06, 0.2, litM(L.rep(ERMINE, 1, 1), 0xffffff), s2 * 0.68, 0.7, 0.06, g); L.box(0.12, 0.12, 0.12, skin, s2 * 0.68, 0.61, 0.07, g); }
    const cape = L.mesh(new THREE.CylinderGeometry(0.64, 0.74, 1.15, 12, 1, true, Math.PI * 0.3, Math.PI * 1.4), new THREE.MeshLambertMaterial({ color: 0xa01a2a, side: THREE.DoubleSide, flatShading: true }), 0, 0.88, -0.02, g);   // open at the front: the doublet shows
    for (const s2 of [-1, 1]) { const tr = L.box(0.14, 1.15, 0.05, litM(L.rep(ERMINE, 1, 4), 0xffffff), s2 * 0.6 * Math.sin(Math.PI * 0.3) * 1.08, 0.88, 0.69 * Math.cos(Math.PI * 0.3), g); tr.rotation.y = s2 * 0.5; }   // ermine edges
    const collar = L.mesh(new THREE.TorusGeometry(0.5, 0.1, 5, 14), litM(L.rep(ERMINE, 3, 1), 0xffffff), 0, 1.44, -0.02, g); collar.rotation.x = Math.PI / 2; collar.scale.set(1.1, 0.75, 1);
    L.mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.1, 12, 1, true, Math.PI * 0.3, Math.PI * 1.4), litM(L.rep(ERMINE, 4, 1), 0xffffff), 0, 0.34, -0.02, g).material.side = THREE.DoubleSide;
    L.box(0.16, 0.12, 0.16, skin, 0, 1.5, 0.02, g); L.box(0.38, 0.4, 0.34, skin, 0, 1.74, 0.02, g);   // neck + big head
    for (const s2 of [-1, 1]) L.box(0.06, 0.1, 0.1, skin, s2 * 0.21, 1.74, 0.02, g);   // ears
    L.box(0.4, 0.2, 0.12, litM(null, 0xb85a2a), 0, 1.6, 0.16, g); L.box(0.42, 0.24, 0.3, litM(null, 0xb85a2a), 0, 1.62, 0.02, g); L.box(0.2, 0.04, 0.02, litM(null, 0xb85a2a), 0, 1.71, 0.2, g);   // red beard + moustache
    for (const s2 of [-1, 1]) { L.box(0.07, 0.05, 0.01, black, s2 * 0.09, 1.8, 0.195, g); L.box(0.09, 0.025, 0.01, litM(null, 0x8a4a22), s2 * 0.09, 1.85, 0.195, g); } L.box(0.07, 0.07, 0.04, litM(null, 0xe0b090), 0, 1.75, 0.2, g);   // eyes, brows, nose
    { const c = L.mesh(new THREE.CylinderGeometry(0.31, 0.3, 0.07, 12), black, 0.02, 1.97, 0.0, g); c.rotation.z = -0.12; }   // flat Tudor cap
    const crown = new THREE.Group(); crown.position.set(0.01, 2.0, 0); g.add(crown); L.mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.08, 10, 1, true), gold, 0, 0.04, 0, crown).material.side = THREE.DoubleSide;
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; L.mesh(new THREE.ConeGeometry(0.035, 0.09, 4), gold, Math.sin(a) * 0.14, 0.12, Math.cos(a) * 0.14, crown); }
    const fe = L.box(0.035, 0.24, 0.02, white, 0.27, 2.08, -0.04, g); fe.rotation.z = -0.7;
    return g; }
  // ---- the dark-robed doctor (17th c.): a lib NPC inside a long black robe + a flat black cap
  function doctorOf(n) { labCoat(n, 0x2a2a34); const h = headInfo(n), r = Math.max(h.rx, h.rz), g = new THREE.Group(); L.mesh(new THREE.CylinderGeometry(r * 1.15, r * 1.15, r * 0.35, 10), litM(null, 0x18181c), 0, r * 0.05, 0, g);
    L.box(r * 0.9, r * 0.18, 0.01, litM(null, 0xf4f0e8), 0, -r * 1.75, h.rz * 1.05, g); seat(n, g); return n; }
  // ---- the linen shirt worn OVER her armour: a loose smock shell parented to her chest bone (placed once, after the pose)
  function wearShirt(ch) { let chest = null; ch.root.traverse((o) => { if (!chest && o.isBone && o.name === 'Chest') chest = o; });
    const g = new THREE.Group(); const m = new THREE.MeshLambertMaterial({ map: L.rep(LINEN, 3, 2), side: THREE.DoubleSide, flatShading: true });
    const body = L.mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.5, 10, 1, true), m, 0, -0.1, 0, g); body.scale.set(1.2, 1, 0.9);
    L.mesh(new THREE.CylinderGeometry(0.09, 0.2, 0.06, 10, 1, true), m, 0, 0.17, 0, g).scale.set(1.2, 1, 0.9);   // shoulders
    for (const s2 of [-1, 1]) { const sl = L.mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.14, 8, 1, true), m, s2 * 0.25, 0.08, 0, g); sl.rotation.z = s2 * 0.35; }
    L.mesh(new THREE.TorusGeometry(0.09, 0.02, 4, 10), m, 0, 0.19, 0.01, g).rotation.x = Math.PI / 2;
    let done = false; return () => { if (done) return; done = true; ch.root.updateMatrixWorld(true); const p = chest.getWorldPosition(V3([0, 0, 0])); g.position.copy(p).add(V3([0, 0.02, 0])); g.rotation.y = ch.root.rotation.y; ch.root.parent.add(g); g.updateMatrixWorld(true); chest.attach(g); }; }
  // ---- water streams (volumes, not decals): a tapered translucent column + the splash ring
  function stream(scene, a, b, col = 0xbfe8ff, r0 = 0.06, r1 = 0.16) { const len = a.distanceTo(b); const m = L.mesh(new THREE.CylinderGeometry(r1, r0, len, 10, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }), 0, 0, 0, scene);
    m.position.copy(a).lerp(b, 0.5); m.quaternion.setFromUnitVectors(V3([0, 1, 0]), a.clone().sub(b).normalize());
    const drops = []; for (let i = 0; i < 14; i++) drops.push(L.mesh(new THREE.IcosahedronGeometry(0.018, 0), new THREE.MeshBasicMaterial({ color: col }), 0, 0, 0, scene));
    return (t) => { const q = q15(t); m.visible = true; drops.forEach((d, i) => { const k = ((q * 1.8 + i / 14) % 1); d.position.copy(a).lerp(b, k).add(V3([Math.sin(i * 2.1) * (r0 + (r1 - r0) * k), 0, Math.cos(i * 1.7) * (r0 + (r1 - r0) * k)])); }); }; }
  function headPos(ch) { let hd = null; ch.root.traverse((o) => { if (!hd && o.isBone && o.name === 'Head') hd = o; }); ch.root.updateMatrixWorld(true); return hd.getWorldPosition(V3([0, 0, 0])); }
  const IN = (ch, y) => { ch.root.position.y = y; }; const SIDE = /side/.test(location.search);
  // ---- level steps (word times) ----
  LV.push([ws(2, 'freezing'), 1], [ws(3, 'strigil'), 2], [ws(4, 'down'), 2, true], [ws(5, 'dry'), 3], [ws(7, 'again'), 4], [ws(8, 'shower'), 5]);
  for (const [tt] of LV) cue(tt, 'meter');
  const KNEEL_IN = (t, t0) => [still('kneel', 1.5)]; const SIT_IN = () => [still('sit_floor', 1.5)];
  // ===== 1. "There were no showers… so 500 years ago, you could go months without a full bath."  a period bedroom (sepia), flies; meter 0
  SH([1, 'There'], 'C', (t0) => { const scene = new THREE.Scene(); periodBedroom(scene); const ch = hero(scene, { p: [0.45, 0, 0.75], ry: -0.15 }); sepia(scene, [ch]); const cam = CAM([[0.4, 1.15, 3.5], [0.38, 1.13, 3.3]], [[0.35, 1.2, 0.3]], 46); const mt = meter(scene, cam);
    const tM = ws(1, 'months'); const fx = new FX(LW, LH).add('flies', { obj: ch.root, bone: 'Head', offset: [0, 0.2, 0], t0: t0 + 0.3, dur: 99, n: 4, scale: 1.5 }); cue(t0 + 0.2, 'buzz'); const lab = label3D(scene, 'NO SHOWERS', 0, 0, 0, t0 + 0.25, { size: 0.15 });
    const lab2 = label3D(scene, 'MONTHS', 0, 0, 0, tM, { size: 0.13 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); lab2(t); ch.drive(t, [seg('look_around', t0 - 0.2)], [[-99, 'open', 'neutral'], [tM, 'surprised', 'gasp']]); } }; });
  // ===== 2. "And you'd smell."  closer: green stink lines + flies; she shakes her head, disgusted
  SH([1, 'And'], 'C', (t0) => { const scene = new THREE.Scene(); periodBedroom(scene); const ch = hero(scene, { p: [0.45, 0, 0.75], ry: -0.15 }); sepia(scene, [ch]); const cam = CAM([[1.2, 1.3, 2.7], [1.15, 1.3, 2.6]], [[0.4, 1.3, 0.5]], 44); const mt = meter(scene, cam);
    const fx = new FX(LW, LH).add('stink', { obj: ch.root, bone: 'Head', offset: [0, 0.1, 0.1], t0, dur: 99 }).add('flies', { obj: ch.root, bone: 'Head', offset: [0, 0.25, 0], t0, dur: 99, n: 3, scale: 1.5 }); cue(t0 + 0.1, 'sniff');
    return { scene, cam, fx, upd(t) { mt(t); ch.drive(t, [seg('shake_head', t0 - 0.1)], [[-99, 'disgust', 'disgust']]); } }; });
  // ===== 3. "First, the river. Free… but freezing."  she wades in, shivers; frost + teeth chatter; meter 1
  SH([2, 'First'], 'C', (t0) => { const scene = new THREE.Scene(); riverBank(scene); const ch = hero(scene, { p: [0.0, 0, 0.35], ry: 0.15 }); const cam = CAM([[0.15, 1.1, 3.4], [0.13, 1.08, 3.2]], [[0, 1.15, 0.3]], 46); const mt = meter(scene, cam);
    const tF = ws(2, 'freezing'); cue(t0 + 0.1, 'splash'); cue(tF, 'shiver_brr'); cue(tF + 0.3, 'teeth'); const lab = label3D(scene, 'RIVER', 0, 0, 0, t0 + 0.2, { size: 0.16 });
    const fx = new FX(LW, LH).add('snow', { world: [0, 1.4, 0.4], t0: tF, dur: 99 }).add('shake', { obj: ch.root, bone: 'Head', offset: [0, -0.1, 0], t0: tF, dur: 99 }).add('splash', { world: [0, 0.32, 0.45], t0: t0 + 0.1, dur: 0.8 }).add('steam', { obj: ch.root, bone: 'Head', offset: [0.08, -0.05, 0.12], t0: tF, dur: 99, every: 0.5, life: 0.8, rise: 16, color: '#e8f4ff', edge: '#a8c8d8' });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.root.position.z = 0.35 - 0.2 * smooth((q15(t) - t0) / 0.8); ch.drive(t, q15(t) < tF ? [seg('walk', -99, { loop: true, speed: 0.5 })] : [seg('shiver', tF, { loop: true })], [[-99, 'happy', 'smile'], [tF, 'angry', 'frown']]); } }; });
  // ===== 4. "Rome had public baths."  the thermae: columns, arches, mosaic, steaming pool; she sits in the pool (kneels, water to the chest)
  SH([3, 'Rome'], 'C', (t0) => { const scene = new THREE.Scene(); thermae(scene); const ch = hero(scene, { p: [0.0, 0.0, -0.2], ry: 0.1 }); sepia(scene, [ch]); const cam = CAM(SIDE ? [[3.8, 1.0, -0.2]] : [[0.3, 1.5, 3.9], [0.25, 1.48, 3.7]], [[0.0, 0.7, -0.25]], 50); const mt = meter(scene, cam);
    const lab = label3D(scene, 'ROMAN BATHS', 0, 0, 0, t0 + 0.2, { size: 0.15 }); cue(t0 + 0.1, 'water_amb'); cue(t0 + 0.2, 'splash');
    const fx = new FX(LW, LH).add('steam', { world: [-0.8, 0.45, -0.3], t0, dur: 99, every: 0.3, life: 1.6, rise: 50, color: '#ffffff', edge: '#c8d8e0' }).add('steam', { world: [0.8, 0.45, -0.4], t0: t0 + 0.2, dur: 99, every: 0.35, life: 1.6, rise: 50, color: '#ffffff', edge: '#c8d8e0' });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, KNEEL_IN(t, t0), [[-99, 'relaxed', 'smile'], [t0 + 0.6, 'happy', 'smileOpen']]); } }; });
  // ===== 5. "No soap: you oiled your skin and scraped it off with a curved metal stick. This is a strigil."  at the pool edge, strigil in hand; oil sparkle; meter 2
  SH([3, 'No'], 'C', (t0) => { const scene = new THREE.Scene(); thermae(scene); const ch = hero(scene, { p: [-0.15, 0, 1.15], ry: -0.75 }); sepia(scene, [ch]); const cam = CAM([[0.1, 1.2, 3.9], [0.08, 1.18, 3.75]], [[0.0, 1.15, 0.9]], 46); const mt = meter(scene, cam);
    const sg = strigil(); sg.scale.setScalar(1.6); scene.add(sg); const fl = oilFlask(); fl.position.set(-0.6, 0.0, 1.4); fl.scale.setScalar(1.8); scene.add(fl); const fp = V3([0, 0, 0]), fq = V3([0, 0, 0]);
    const tS = ws(3, 'strigil'), tO = ws(3, 'oiled'); cue(tO, 'oil_pour'); cue(ws(3, 'scraped'), 'scrape'); const lab = label3D(scene, 'STRIGIL', 0, 0, 0, tS, { size: 0.15 });
    const fx = new FX(LW, LH).add('sparkle', { obj: ch.root, bone: 'Head', offset: [0.25, -0.35, 0.1], t0: tO, dur: 99, n: 4, radius: 16, color: '#fff2a0' });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, [seg('present', t0 - 0.3)], [[-99, 'open', 'smile'], [tS, 'happy', 'smileOpen']]); scene.updateMatrixWorld(true); ch.fist('R', fp); ch.fist('L', fq); const k = q15(t) < ws(3, 'scraped') ? 0.15 : 0.35 + 0.25 * Math.sin(q15(t) * 8); sg.position.copy(fp).lerp(fq, k).add(V3([0, 0.05, 0.04])); sg.rotation.set(0, 0.3 - 0.75, -0.6); } }; });
  // ===== 6. "But the water wasn't always fresh."  the pool turns murky green, flies, bubbles; she steps back from the edge
  SH([3, 'But'], 'C', (t0) => { const scene = new THREE.Scene(); const R = thermae(scene); R.water.material.color.set(0x7a8a4a); R.water.material.opacity = 0.9; const ch = hero(scene, { p: [0.35, 0, 1.25], ry: -0.4 }); sepia(scene, [ch]);
    const cam = CAM([[0.6, 1.7, 3.9], [0.58, 1.65, 3.75]], [[0.2, 0.85, 0.2]], 50); const mt = meter(scene, cam);
    const fx = new FX(LW, LH).add('flies', { world: [0, 0.6, -0.4], t0, dur: 99, n: 6, scale: 1.6 }).add('bubbles', { world: [-0.4, 0.42, -0.4], t0, dur: 99 }).add('stink', { world: [0.3, 0.5, -0.3], t0, dur: 99 }); cue(t0 + 0.1, 'buzz'); const lab = label3D(scene, 'NOT FRESH', 0, 0, 0, ws(3, 'fresh'), { size: 0.15, front: 0xa8e85a, side: 0x5a8a2a });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, [seg('step_back', t0 + 0.1)], [[-99, 'disgust', 'disgust']]); } }; });
  // ===== 7. "Medieval towns had steamy bathhouses called stews… with a bad reputation."  the timber-frame bathhouse; she sits in a tub in the steam, overheats (sparks)
  SH([4, 'Medieval'], 'C', (t0) => { const scene = new THREE.Scene(); stewsHall(scene); woodTub(scene, -1.4, -0.6, 0.55, 0.6); woodTub(scene, 1.5, -0.7, 0.55, 0.6); woodTub(scene, 0.05, 0.3, 0.62, 0.62);
    const ch = hero(scene, { p: [0.05, 0.2, 0.1], ry: 0.05 }); sepia(scene, [ch]); const cam = CAM(SIDE ? [[3.6, 1.1, 0.1]] : [[0.1, 1.15, 3.2], [0.08, 1.13, 3.0]], SIDE ? [[0.05, 0.8, 0.1]] : [[0.0, 0.8, 0.0]], 48); const mt = meter(scene, cam);
    const tS = ws(4, 'stews'), tR = ws(4, 'reputation'); cue(t0 + 0.1, 'steam_hiss'); cue(tR, 'zap'); const lab = label3D(scene, 'STEWS', 0, 0, 0, tS, { size: 0.17 });
    const fx = new FX(LW, LH).add('steam', { world: [0.05, 0.75, 0.3], t0, dur: 99, every: 0.22, life: 1.5, rise: 55, color: '#ffffff', edge: '#c8d0d8' }).add('steam', { world: [-1.4, 0.7, -0.6], t0, dur: 99, every: 0.3, life: 1.4, rise: 50 }).add('steam', { world: [1.5, 0.7, -0.7], t0, dur: 99, every: 0.3, life: 1.4, rise: 50 })
      .add('zap', { obj: ch.root, bone: 'Head', offset: [0.1, 0.25, 0], t0: tR, dur: 1.5 }).add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: tS, dur: 99 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, SIT_IN(), [[-99, 'relaxed', 'smile'], [tS, 'happy', 'smileOpen'], [tR, 'surprised', 'gasp']]); } }; });
  // ===== 8. "In 1546, Henry the Eighth shut London's down."  person + year card: Henry VIII (own figure) on a plinth; a CLOSED plank across a tub
  SH([4, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); stewsHall(scene).sg.visible = false; woodTub(scene, -0.95, -0.2, 0.5, 0.58); L.box(1.0, 0.16, 0.9, mm(MT.carved, 1, 0.3), 0.5, 0.08, -0.5, scene); henryVIII(scene, 0.5, -0.5, 0.9, -0.3);
    const ch = hero(scene, { p: [-0.3, 0, 0.9], ry: 0.3 }); sepia(scene, [ch]); const cam = CAM([[0.05, 1.45, 4.5], [0.05, 1.43, 4.3]], [[0.05, 1.5, 0]], 50); const mt = meter(scene, cam); const tY = ws(4, '1546'), tD = ws(4, 'down');
    const y = label3D(scene, '1546', 0, 0, 0, tY, { size: 0.22, slot: 0 }); const n = label3D(scene, 'HENRY VIII', 0, 0, 0, tY + 0.25, { size: 0.13, slot: 1, front: 0xffffff, side: 0x9a8a6a });
    const plank = L.box(1.15, 0.12, 0.05, mm(MT.wood, 1, 0.2), -0.95, 0.62, 0.32, scene); plank.rotation.z = 0.3; plank.visible = false; cue(tD, 'stamp');
    const cl = letters3D(scene, 'CLOSED', { size: 0.26, x: -0.6, y: 2.0, z: -1.7, jitter: 0.6, front: 0xff6a5a, side: 0x8a2a1a }); cl.visible = false;
    return { scene, cam, upd(t) { mt(t); y(t); n(t); const c = q15(t) >= tD; plank.visible = c; cl.visible = c; ch.drive(t, [seg('point', t0 - 0.1)], [[-99, 'surprised', 'talkO']]); } }; });
  // ===== 9. "Doctors said hot water let disease in through the skin."  the period bedroom: a doctor in a long dark robe warns; she backs off from a steaming basin
  SH([5, 'Doctors'], 'C', (t0) => { const scene = new THREE.Scene(); periodBedroom(scene); const bs = woodTub(scene, 0.25, -0.45, 0.38, 0.45); const dr = doctorOf(npcAt(scene, 'bank_teller', 'grey', -0.3, 0.35, 0.5, 1.05)); dr.walk(0); npcSet(dr, 'Bone004', -1.6);
    const ch = hero(scene, { p: [0.55, 0, 0.95], ry: -0.4 }); sepia(scene, [ch]); const cam = CAM([[0.15, 1.3, 4.3], [0.13, 1.28, 4.1]], [[0.12, 1.15, 0.3]], 50); const mt = meter(scene, cam); const tD = ws(5, 'disease'); cue(tD, 'sting');
    const fx = new FX(LW, LH).add('steam', { world: [0.25, 0.5, -0.45], t0, dur: 99, every: 0.3, life: 1.3, rise: 45 }).add('exclaim', { obj: ch.root, bone: 'Head', offset: [0.12, 0.42, 0], t0: tD, dur: 99 });
    const lab = label3D(scene, 'WATER DANGER?', 0, 0, 0, tD, { size: 0.12, front: 0xff8a6a, side: 0x8a2a1a });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('step_back', tD - 0.1, { fade: 0.1 })], [[-99, 'open', 'neutral'], [tD, 'surprised', 'gasp']]); } }; });
  // ===== 10. "So people wore a clean linen shirt to soak up the dirt… plus perfume. This is a dry wash."  she WEARS the linen shirt over her armour, sprays perfume (arm out to the side); meter 3
  SH([5, 'So'], 'C', (t0) => { const scene = new THREE.Scene(); periodBedroom(scene); const ch = hero(scene, { p: [-0.1, 0, 0.85], ry: -0.55 }); const pf = perfume(); pf.scale.setScalar(1.7); scene.add(pf); const fp = V3([0, 0, 0]);
    sepia(scene, [ch, pf]); const shirt = wearShirt(ch); const cam = CAM(SIDE ? [[2.6, 1.3, 0.85]] : [[0.1, 1.25, 3.8], [0.08, 1.23, 3.65]], SIDE ? [[-0.1, 1.2, 0.85]] : [[0.05, 1.2, 0.5]], 48); const mt = meter(scene, cam);
    const tP = ws(5, 'perfume'), tW = ws(5, 'dry'); cue(ws(5, 'linen'), 'cloth'); cue(tP, 'spray'); const lab = label3D(scene, 'DRY WASH', 0, 0, 0, tW, { size: 0.15 }); const lab2 = label3D(scene, 'LINEN', 0, 0, 0, ws(5, 'linen'), { size: 0.12 });
    const fx = new FX(LW, LH).add('sparkle', { target: pf, offset: [0.05, 0.25, 0.05], t0: tP, dur: 99, n: 6, radius: 22, color: '#e8b0ff' }).add('flies', { obj: ch.root, bone: 'Head', offset: [0.0, 0.3, 0], t0: tW + 0.4, dur: 99, n: 2, scale: 1.5 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); lab2(t); ch.drive(t, [seg('point', t0 - 0.3)], [[-99, 'open', 'smile'], [tP, 'happy', 'smileOpen'], [tW + 0.4, 'open', 'frown']]); shirt(); scene.updateMatrixWorld(true); ch.fist('L', fp); pf.position.copy(fp).add(V3([0.02, 0.04, 0.05])); } }; });
  // ===== 11. "Later, the tin tub, filled pot by pot… and the whole family shared the water."  the cottage kitchen: kettle on the hearth, family waiting in line; she sits in the tub
  SH([6, 'Later'], 'C', (t0) => { const scene = new THREE.Scene(); const K0 = cottageKitchen(scene); const T0 = tinTub(scene, -0.2, 0.4); T0.g.scale.setScalar(1.4);
    const fam = [['bank_teller', 'olive', 0.7, -0.3, 0.95], ['homework_girl', 'red', 1.15, -0.6, 0.85], ['art_student', 'teal', 1.4, -0.9, 0.72]].map(([id, v, x, z, s]) => { const n = npcAt(scene, id, v, x, z, -0.9, s); n.walk(0); return n; });
    const ch = hero(scene, { p: [-0.2, 0.17, 0.2], ry: 0.25 }); sepia(scene, [ch]); const cam = CAM(SIDE ? [[3.6, 1.0, 0.3]] : [[0.0, 1.45, 3.8], [0.0, 1.43, 3.6]], SIDE ? [[-0.2, 0.7, 0.3]] : [[-0.15, 0.95, 0.0]], 52); const mt = meter(scene, cam);
    const tS = ws(6, 'shared'); cue(t0 + 0.1, 'water_pour'); cue(ws(6, 'pot'), 'water_pour'); const lab = label3D(scene, 'TIN TUB', 0, 0, 0, t0 + 0.2, { size: 0.15 });
    const fx = new FX(LW, LH).add('steam', { world: [-1.25, 1.3, -1.45], t0, dur: 99, every: 0.35, life: 1.2, rise: 30 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); K0.H0.userData.tick(t); T0.water.material.color.set(q15(t) >= tS ? 0x8a7a50 : 0x8a9aa0); ch.drive(t, SIT_IN(), [[-99, 'happy', 'smile'], [tS, 'surprised', 'talkO']]); } }; });
  // ===== 12. "The story goes, the baby went last."  closer: the murky tub, she in it, disgusted; stink
  SH([6, 'The', 4], 'C', (t0) => { const scene = new THREE.Scene(); cottageKitchen(scene); const T0 = tinTub(scene, 0.15, 0.4, 0x6a5a38); T0.g.scale.setScalar(1.4); const ch = hero(scene, { p: [0.15, 0.17, 0.2], ry: 0.15 }); sepia(scene, [ch]);
    const cam = CAM([[0.2, 1.35, 3.1], [0.18, 1.33, 2.95]], [[0.15, 0.95, 0.3]], 50); const mt = meter(scene, cam); const tB = ws(6, 'baby'); cue(tB, 'gasp');
    const fx = new FX(LW, LH).add('stink', { world: [0.55, 0.6, 0.6], t0, dur: 99 }).add('flies', { world: [0.5, 0.75, 0.55], t0, dur: 99, n: 3, scale: 1.5 });
    const lab = label3D(scene, 'BABY: LAST', 0, 0, 0, tB, { size: 0.13 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, SIT_IN(), [[-99, 'disgust', 'disgust']]); } }; });
  // ===== 13. "In 1767, William Feetham patented a shower: pump water up by hand, pull a chain…"  a Georgian room; she stands in the hand-pump shower and pulls the chain
  SH([7, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); georgianRoom(scene); feethamShower(scene, 0.3, -0.35); const ch = hero(scene, { p: [0.3, 0.06, -0.3], ry: 0.0 }); sepia(scene, [ch]);
    const cam = CAM([[0.3, 1.45, 4.3], [0.3, 1.43, 4.1]], [[0.3, 1.55, 0]], 52); const mt = meter(scene, cam); const tY = ws(7, '1767'), tC = ws(7, 'chain');
    const y = label3D(scene, '1767', 0, 0, 0, tY, { size: 0.2, slot: 0 }); const n = label3D(scene, 'W. FEETHAM', 0, 0, 0, tY + 0.25, { size: 0.11, slot: 1, front: 0xffffff, side: 0x9a8a6a }); cue(ws(7, 'pump'), 'pump'); cue(tC, 'chain_pull');
    return { scene, cam, upd(t) { mt(t); y(t); n(t); ch.drive(t, q15(t) < tC ? [seg('idle', -99, { loop: true })] : [seg('pull_chain', tC - 0.2)], [[-99, 'open', 'smile'], [tC, 'happy', 'smileOpen']]); } }; });
  // ===== 14. "…and the same dirty water falls again."  a brown stream from the tank onto her; wet-android sparks; meter 4
  SH([7, 'and'], 'C', (t0) => { const scene = new THREE.Scene(); georgianRoom(scene); feethamShower(scene, 0.0, -0.35); const ch = hero(scene, { p: [0.0, 0.06, -0.3], ry: 0.0 }); sepia(scene, [ch]);
    const cam = CAM([[0.05, 1.55, 3.4], [0.05, 1.53, 3.25]], [[0.0, 1.5, -0.3]], 50); const mt = meter(scene, cam); const tA = ws(7, 'again'); cue(t0 + 0.1, 'water_splash'); cue(tA, 'zap');
    const hp = headPos(ch); const st = stream(scene, V3([0, 2.44, -0.33]), V3([hp.x, hp.y + 0.22, hp.z]), 0x8a6a3a, 0.08, 0.18);
    const fx = new FX(LW, LH).add('splash', { obj: ch.root, bone: 'Head', offset: [0, 0.25, 0], t0, dur: 99, color: '#8a6a3a' }).add('zap', { obj: ch.root, bone: 'Head', offset: [0.12, 0.1, 0.05], t0: tA, dur: 2 });
    const lab = label3D(scene, 'SAME WATER', 0, 0, 0, tA - 0.4, { size: 0.12, front: 0xc8a060, side: 0x6a4a1a });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); st(t); ch.drive(t, [seg('shiver', t0 - 0.1, { loop: true })], [[-99, 'disgust', 'disgust'], [tA, 'surprised', 'gasp']]); } }; });
  // ===== 15. "Then came pipes and water heaters. Hot water, any time. This is a shower."  the modern bathroom: a big clear stream over her, steam; meter 5 FRESH
  SH([8, 'Then'], 'C', (t0) => { const scene = new THREE.Scene(); const B = bathroom(scene); pottedTree(scene, -0.95, -0.85, 0.55); pottedTree(scene, 1.35, -0.8, 0.55); const ch = hero(scene, { p: [0.0, 0, -0.62], ry: 0.15 }); const cam = CAM([[0.1, 1.45, 3.4], [0.08, 1.43, 3.2]], [[0.0, 1.55, -0.5]], 52); const mt = meter(scene, cam);
    const tS = ws(8, 'shower'); cue(t0 + 0.2, 'shower_run'); cue(tS, 'sting'); const lab = label3D(scene, 'SHOWER', 0, 0, 0, tS, { size: 0.17 }); const lab2 = label3D(scene, 'FRESH', 0, 0, 0, tS + 0.4, { size: 0.12, front: 0x9cf09c, side: 0x3a8a4a });
    const hp = headPos(ch); const st = stream(scene, V3([0.0, 2.54, -0.78]), V3([hp.x, hp.y + 0.22, hp.z]), 0xbfe8ff, 0.1, 0.24);
    const fx = new FX(LW, LH).add('splash', { obj: ch.root, bone: 'Head', offset: [0, 0.25, 0], t0, dur: 99, color: '#bfe8ff' }).add('steam', { world: [0.0, 1.4, -0.5], t0: t0 + 0.4, dur: 99, every: 0.3, life: 1.3, rise: 40, color: '#ffffff', edge: '#c8d8e0' }).add('sparkle', { obj: ch.root, bone: 'Head', offset: [0.15, 0.1, 0.1], t0: tS, dur: 99, n: 4, radius: 18 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); lab2(t); st(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('cheer', tS - 0.1, { fade: 0.12 })], [[-99, 'relaxed', 'smile'], [tS, 'happy', 'smileOpen']]); } }; });
  // ===== 16. "Today, the average shower takes about eight minutes. Logging off."  3D "8 MIN" in the bathroom, she waves; small outro
  SH([9, 'Today'], 'C', (t0) => { const scene = new THREE.Scene(); bathroom(scene); pottedTree(scene, -1.0, -0.6, 0.6); pottedTree(scene, 1.1, -0.7, 0.6); const ch = hero(scene, { p: [-0.25, 0, 0.6], ry: 0.2 }); const cam = CAM([[0.1, 1.15, 3.4], [0.1, 1.2, 3.8]], [[0.0, 1.2, 0.3]], 48); const mt = meter(scene, cam);
    const tE = ws(9, 'eight'), tLo = ws(9, 'Logging'), tOut = TL.dur + 0.05; cue(tLo, 'blip'); cue(tOut, 'end_jingle'); const lab = label3D(scene, '8 MIN', 0, 0, 0, tE, { size: 0.26, slot: 0 });
    return { scene, cam, upd(t) { mt(t); lab(t); ch.drive(t, [seg('present', t0 - 0.2), seg('wave', tLo - 0.3, { fade: 0.12 })], [[-99, 'happy', 'smileOpen'], [tLo, 'wink', 'blushSmile']]); },
      ov(o, t, c) { if (t >= tOut) { plateText(o, CHANNEL, CX, 40, { size: 12, border: '#fdd941', fg: '#fdd941', scale: popS(t, tOut) }); if (t >= tOut + 0.4) { const w = 90, h = 14, X = CX - w / 2, Y = 60; c.fillStyle = '#040412'; c.fillRect(X - 2, Y - 2, w + 4, h + 4); c.fillStyle = '#fe2c55'; c.fillRect(X, Y, w, h); bitText(c, 'FOLLOW', CX, Y + 7, 1, '#ffffff', { outline: null }); } } } }; });
