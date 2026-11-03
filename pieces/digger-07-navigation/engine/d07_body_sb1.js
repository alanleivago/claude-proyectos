  // ===================================== DIGGER 07 sets: a distinct, recognizable place per solution, green balance, everything with volume =====================================
  const tx = (w, h, fn) => L.cvs(w, h, fn);
  const SAND = tx(16, 16, (c) => { c.fillStyle = '#e8d49a'; c.fillRect(0, 0, 16, 16); for (let i = 0; i < 26; i++) { c.fillStyle = ['#d8c088', '#f2e2b0', '#cdb47c'][i % 3]; c.fillRect((i * 7) % 15, (i * 5) % 15, 2, 1); } });
  const PAVE = tx(32, 32, (c) => { c.fillStyle = '#8a8a7a'; c.fillRect(0, 0, 32, 32); const st = [[1, 1, 13, 9], [15, 1, 16, 7], [1, 11, 9, 10], [11, 9, 10, 12], [22, 9, 9, 11], [1, 22, 14, 9], [16, 21, 15, 10]];
    st.forEach(([x, y, w, h], i) => { c.fillStyle = ['#b8b2a0', '#aaa490', '#c4beaa'][i % 3]; c.fillRect(x, y, w, h); c.fillStyle = '#d4cebc'; c.fillRect(x, y, w, 1); }); });
  const PLANK = tx(32, 32, (c) => { c.fillStyle = '#b07a44'; c.fillRect(0, 0, 32, 32); for (let y = 0; y < 32; y += 6) { c.fillStyle = '#6a4220'; c.fillRect(0, y, 32, 1); c.fillStyle = '#c48e56'; c.fillRect(0, y + 1, 32, 1); } for (let i = 0; i < 6; i++) { c.fillStyle = '#5a3418'; c.fillRect((i * 11) % 31, (i * 6 + 3) % 31, 1, 1); } });
  const PARCH = tx(64, 48, (c) => { c.fillStyle = '#ecdcae'; c.fillRect(0, 0, 64, 48); c.fillStyle = '#d8c48e'; for (let i = 0; i < 30; i++) c.fillRect((i * 13) % 63, (i * 7) % 47, 2, 1);
    c.strokeStyle = '#b8443a'; c.lineWidth = 0.6; for (const [cx, cy] of [[20, 22], [46, 18]]) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * 60, cy + Math.sin(a) * 60); c.stroke(); }
    c.fillStyle = '#6a8a4a'; c.beginPath(); c.moveTo(0, 30); c.lineTo(14, 26); c.lineTo(22, 34); c.lineTo(34, 30); c.lineTo(40, 40); c.lineTo(0, 48); c.fill(); c.beginPath(); c.moveTo(38, 0); c.lineTo(64, 0); c.lineTo(64, 12); c.lineTo(52, 10); c.lineTo(44, 6); c.fill();
    c.strokeStyle = '#3a2a1a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 30); c.lineTo(14, 26); c.lineTo(22, 34); c.lineTo(34, 30); c.lineTo(40, 40); c.stroke(); c.fillStyle = '#d8b040'; c.fillRect(19, 21, 3, 3); c.fillRect(45, 17, 3, 3); });
  const EARTH = tx(64, 32, (c) => { c.fillStyle = '#2f74c8'; c.fillRect(0, 0, 64, 32); c.fillStyle = '#4eae3e'; for (const [x, y, w, h] of [[6, 6, 10, 8], [10, 14, 6, 10], [24, 4, 12, 7], [28, 11, 7, 12], [40, 6, 16, 9], [48, 15, 6, 6], [52, 22, 7, 5]]) c.fillRect(x, y, w, h);
    c.fillStyle = '#f4f8ff'; c.fillRect(0, 0, 64, 2); c.fillRect(0, 30, 64, 2); c.fillStyle = '#ffffff'; for (let i = 0; i < 10; i++) c.fillRect((i * 17) % 60, (i * 7) % 28 + 2, 4, 1); });
  const SAILR = tx(16, 16, (c) => { c.fillStyle = '#b8582e'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#9a4422'; for (let y = 3; y < 16; y += 4) c.fillRect(0, y, 16, 1); });
  const SAILW = tx(16, 16, (c) => { c.fillStyle = '#f4eedc'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#e0d8c0'; for (let x = 3; x < 16; x += 5) c.fillRect(x, 0, 1, 16); });
  function seaPlane(scene, col = 0x2f74c8) { const sea = L.mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshLambertMaterial({ color: col }), 0, -0.02, 0, scene); sea.rotation.x = -Math.PI / 2;
    const waves = []; for (let i = 0; i < 60; i++) { const w = L.box(0.5 + hash(i) * 0.7, 0.02, 0.06, new THREE.MeshBasicMaterial({ color: 0xa8d4f8 }), (hash(i + 3) - 0.5) * 18, 0.0, 3 - hash(i + 7) * 22, scene); w.userData.x0 = w.position.x; waves.push(w); }
    return (t) => { const q = q15(t); waves.forEach((w, i) => { w.position.x = w.userData.x0 + ((q * 0.35 + i * 0.13) % 1) * 0.6; }); }; }
  function islandHill(scene, x, z, s = 1) { const h = L.mesh(new THREE.SphereGeometry(2 * s, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ map: meadowTex(32, 32, GRASS, [4, 2]), flatShading: true }), x, -0.2, z, scene); h.scale.y = 0.5;
    for (let k = 0; k < 3; k++) palm(scene, x - 0.8 * s + k * 0.8 * s, z + 0.3 * s, 0.9 * s); }
  function palm(scene, x, z, s = 1) { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); scene.add(g); const tr = litM(null, 0x8a6a42);
    for (let k = 0; k < 6; k++) { const seg2 = L.mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.42, 6), tr, Math.sin(k * 0.35) * 0.18, 0.21 + k * 0.4, 0, g); seg2.rotation.z = -0.12; }
    const top = V3([Math.sin(5 * 0.35) * 0.18 + 0.05, 2.5, 0]); for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; const lf = L.box(1.0, 0.04, 0.24, litM(null, k % 2 ? 0x3e9a3a : 0x52b244), top.x + Math.cos(a) * 0.45, top.y - 0.12, Math.sin(a) * 0.45, g); lf.rotation.set(0, -a, -0.45); }
    for (let k = 0; k < 3; k++) L.mesh(new THREE.SphereGeometry(0.07, 6, 4), litM(null, 0x6a4a22), top.x + Math.cos(k * 2) * 0.1, top.y - 0.12, Math.sin(k * 2) * 0.1, g); return g; }
  function cypress(scene, x, z, h = 2.4) { L.mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.4, 6), litM(null, 0x6a4a2a), x, 0.2, z, scene); L.mesh(new THREE.ConeGeometry(0.34, h, 7), litM(null, 0x2e6a32), x, 0.35 + h / 2, z, scene); }
  // ---- 1. lost at sea in fog: a small rowboat, no land anywhere
  function rowboat(scene, x, z) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); const w = mm(MT.wood, 2, 0.5, 0xc89060);
    L.box(1.9, 0.08, 0.86, w, 0, 0.1, 0, g); for (const s2 of [-1, 1]) { const sd = L.box(1.9, 0.34, 0.07, w, 0, 0.27, s2 * 0.44, g); sd.rotation.x = s2 * -0.25; } for (const s2 of [-1, 1]) L.box(0.07, 0.34, 0.86, w, s2 * 0.95, 0.27, 0, g);
    L.box(0.12, 0.05, 0.84, mm(MT.darkWood, 0.5, 1), 0.5, 0.33, 0, g); for (const s2 of [-1, 1]) { const oar = L.box(1.5, 0.04, 0.06, mm(MT.wood, 2, 0.2), -0.2, 0.42, s2 * 0.75, g); oar.rotation.set(0, s2 * 0.35, -0.12); } return g; }
  // ---- 2. a night hill under the stars: the North Star big and bright, the Little Dipper around it, slow clouds
  function starHill(scene) { L.addSky(scene, { near: 30, far: 120, preset: 'night' }); scene.fog = null; scene.background = new THREE.Color(0x0c1638);
    const pts = []; for (let i = 0; i < 420; i++) { const a = hash(i) * Math.PI * 2, e = 0.12 + hash(i + 500) * 1.3, r = 40; pts.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r - 10); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xf4f0d8, size: 2, sizeAttenuation: false })));
    const polaris = new THREE.Group(); polaris.position.set(0.7, 3.6, -5); polaris.scale.setScalar(1.6); scene.add(polaris); L.mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshBasicMaterial({ color: 0xfffbe0 }), 0, 0, 0, polaris);
    for (const [s2, r] of [[1, 0.0], [-1, Math.PI / 4]]) { const ray = L.box(0.9, 0.04, 0.02, new THREE.MeshBasicMaterial({ color: 0xfff2a0 }), 0, 0, 0, polaris); ray.rotation.z = r; const ray2 = L.box(0.9, 0.04, 0.02, new THREE.MeshBasicMaterial({ color: 0xfff2a0 }), 0, 0, 0, polaris); ray2.rotation.z = r + Math.PI / 2; }
    for (const [x, y] of [[0.5, -0.5], [0.25, -1.05], [0.6, -1.5], [1.2, -1.45], [1.4, -1.95], [0.95, -2.1]]) L.mesh(new THREE.OctahedronGeometry(0.08, 0), new THREE.MeshBasicMaterial({ color: 0xe8ecff }), x, y, 0, polaris);
    const hill = L.mesh(new THREE.SphereGeometry(6, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ map: meadowTex(32, 32, GRASS, [8, 4]), flatShading: true }), 0, -5.2, 0, scene);
    for (const [x, z, h] of [[-2.2, -2.0, 3.0], [2.4, -2.6, 3.4]]) leafTree(scene, x, z, h); bush(scene, -1.3, -1.2, 0.4); bush(scene, 1.4, -1.0, 0.35);
    const clouds = new THREE.Group(); scene.add(clouds); for (let k = 0; k < 5; k++) L.box(1.4 + hash(k) * 0.8, 0.4 + hash(k + 9) * 0.25, 0.5, new THREE.MeshLambertMaterial({ color: 0x3a4460, flatShading: true }), k * 0.9, 4.5 + (hash(k + 3) - 0.5) * 0.6, -5.6, clouds);
    scene.add(new THREE.AmbientLight(0x8a9ad8, 0.75)); const moon = new THREE.DirectionalLight(0xc8d4ff, 0.9); moon.position.set(-2, 5, 3); scene.add(moon); return { polaris, clouds }; }
  // ---- 3. a Marshall Islands beach: sand, palms, an outrigger canoe at the waterline, the stick chart
  function beach(scene) { L.addSky(scene, { near: 25, far: 110, preset: 'morning' }); scene.fog = null; const sea = seaPlane(scene, 0x2a9ad0);
    const sand = L.box(14, 0.2, 5, litM(L.rep(SAND, 14, 5), 0xffffff), 0, -0.1, 1.6, scene); L.box(14, 0.02, 0.3, new THREE.MeshBasicMaterial({ color: 0xf4fbff }), 0, 0.005, -0.85, scene);
    for (const [x, z, s] of [[-2.2, -0.2, 1.1], [2.5, 0.2, 1.2], [-3.4, 1.3, 1.0], [3.3, 1.6, 0.9]]) palm(scene, x, z, s); islandHill(scene, -5, -9, 1.4);
    scene.add(new THREE.AmbientLight(0xfff0d8, 0.45)); return sea; }
  function canoe(scene, x, z, ry = 0) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const w = mm(MT.wood, 3, 0.5, 0xb07a44);
    const hull = L.mesh(new THREE.CylinderGeometry(0.26, 0.26, 2.6, 8, 1, false, 0, Math.PI), w, 0, 0.27, 0, g); hull.rotation.set(0, 0, Math.PI / 2); hull.rotation.x = Math.PI;   // open half-pipe hull
    for (const s2 of [-1, 1]) { const tip = L.mesh(new THREE.ConeGeometry(0.2, 0.5, 6), w, s2 * 1.5, 0.28, 0, g); tip.rotation.z = s2 * -Math.PI / 2; }
    L.mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.8, 6), w, 0, 0.12, -0.95, g).rotation.z = Math.PI / 2; for (const bx of [-0.5, 0.5]) L.box(0.06, 0.05, 1.05, mm(MT.darkWood, 0.2, 1), bx, 0.36, -0.48, g);
    L.box(0.5, 0.04, 0.5, mm(MT.wood, 1, 1), -0.45, 0.32, 0, g); return g; }
  function stickChart() { const g = new THREE.Group(), st = litM(null, 0xd8b878), sh = litM(null, 0xfff4e0);
    for (const [x, y, len, a] of [[0, 0, 0.62, 0], [0, 0, 0.62, Math.PI / 2], [0, 0, 0.75, Math.PI / 4], [0, 0, 0.75, -Math.PI / 4], [0, 0.22, 0.6, 0], [0, -0.22, 0.6, 0], [0.22, 0, 0.6, Math.PI / 2], [-0.22, 0, 0.6, Math.PI / 2]]) { const b = L.box(len, 0.018, 0.018, st, x, y, 0, g); b.rotation.z = a; }
    for (const [x, y, r] of [[-0.12, 0.16, 0.38], [0.14, -0.1, 0.32]]) { const c = L.mesh(new THREE.TorusGeometry(r * 0.5, 0.01, 4, 12, Math.PI), st, x, y, 0, g); c.rotation.z = 0.6; }
    for (const [x, y] of [[0.22, 0.22], [-0.22, -0.22], [0, 0], [-0.22, 0.22], [0.15, -0.2]]) L.mesh(new THREE.SphereGeometry(0.035, 6, 4), sh, x, y, 0.02, g); return g; }
  // ---- 4. a Roman road: paving, curbs, cypresses, the milestone
  function romanRoad(scene, { end = false } = {}) { L.addSky(scene, { near: 25, far: 110, preset: 'morning' }); scene.fog = null; meadow(scene);
    const len = end ? 4 : 30; const road = L.box(1.8, 0.1, len, litM(L.rep(PAVE, 2, len / 1.2), 0xffffff), 0, 0.05, end ? 0.2 : -10, scene); for (const s2 of [-1, 1]) L.box(0.14, 0.14, len, mm(MT.stone, 0.2, len), s2 * 0.97, 0.07, road.position.z, scene);
    for (let k = 0; k < (end ? 2 : 8); k++) for (const s2 of [-1, 1]) cypress(scene, s2 * 1.7, 1.0 - k * 2.2, 2.2 + hash(k + (s2 > 0 ? 7 : 0)) * 0.5);
    bush(scene, -2.6, 0.6, 0.45); bush(scene, 2.7, -0.3, 0.4); if (end) { for (let k = 0; k < 7; k++) bush(scene, -2 + k * 0.7, -2.4 - hash(k) * 1.5, 0.3 + hash(k + 2) * 0.3); flowers3D(scene, 0, -2.6, 3, 1.5); }
    scene.add(new THREE.AmbientLight(0xfff0d8, 0.35)); }
  function milestone(scene, x, z) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const ins = tx(32, 32, (c) => { c.fillStyle = '#d8d0b8'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#c8c0a6'; for (let i = 0; i < 20; i++) c.fillRect((i * 7) % 31, (i * 11) % 31, 2, 1); c.fillStyle = '#4a4436'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.fillText('M P', 16, 12); c.fillText('XII', 16, 24); });
    L.mesh(new THREE.CylinderGeometry(0.24, 0.27, 1.35, 12), litM(L.rep(ins, 2, 1), 0xffffff), 0, 0.78, 0, g).rotation.y = -Math.PI / 2; L.box(0.66, 0.12, 0.66, mm(MT.stone, 1, 0.3, 0xd8d0b8), 0, 0.06, 0, g); return g; }
  // ---- 5. a Song dynasty junk: battened red sails, lanterns, the water compass (magnetized fish needle in a bowl)
  function junkDeck(scene) { L.addSky(scene, { near: 25, far: 110, preset: 'morning' }); scene.fog = null; const sea = seaPlane(scene); islandHill(scene, 6, -10, 1.6);
    L.box(6, 0.12, 3.2, litM(L.rep(PLANK, 6, 3), 0xffffff), 0, 0.0, 0.3, scene); for (const s2 of [-1, 1]) L.box(6, 0.4, 0.1, mm(MT.darkWood, 6, 0.4, 0x8a3a2a), 0, 0.26, 0.3 + s2 * 1.55, scene);
    L.mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.4, 8), mm(MT.darkWood, 0.3, 3), 0.9, 2.2, -0.9, scene); const sail = new THREE.Group(); sail.position.set(0.9, 2.4, -0.98); scene.add(sail);
    L.box(2.4, 2.8, 0.04, litM(L.rep(SAILR, 2, 2), 0xffffff), 0, 0, 0, sail); for (let k = -3; k <= 3; k++) L.box(2.5, 0.05, 0.08, litM(null, 0xd8b878), 0, k * 0.4, 0.04, sail);
    for (const [x, y] of [[-1.6, 2.0], [2.6, 1.7]]) { L.box(0.02, 0.4, 0.02, litM(null, 0x2a2a30), x, y + 0.3, -1.0, scene); const ln = L.mesh(new THREE.SphereGeometry(0.17, 8, 6), L.basic(null, 0xe83a2a), x, y, -1.0, scene); ln.scale.y = 1.3; const p = new THREE.PointLight(0xffa060, 1.2, 3); p.position.set(x, y, -0.6); scene.add(p); }
    pottedTree(scene, -2.2, -0.6, 0.6); pottedTree(scene, 2.3, -0.5, 0.55); scene.add(new THREE.AmbientLight(0xfff0d8, 0.45)); return sea; }
  function waterCompass() { const g = new THREE.Group(); const bowl = L.mesh(new THREE.CylinderGeometry(0.16, 0.1, 0.09, 14, 1, true), new THREE.MeshLambertMaterial({ color: 0xf4f4f0, side: THREE.DoubleSide, flatShading: true }), 0, 0.045, 0, g);
    L.mesh(new THREE.CylinderGeometry(0.162, 0.162, 0.012, 14, 1, true), litM(null, 0x2a5ab8), 0, 0.08, 0, g).material.side = THREE.DoubleSide; L.mesh(new THREE.CircleGeometry(0.1, 12), litM(null, 0xf0f0ea), 0, 0.002, 0, g).rotation.x = -Math.PI / 2;
    const w = L.mesh(new THREE.CircleGeometry(0.15, 14), new THREE.MeshBasicMaterial({ color: 0x8ad0f0, transparent: true, opacity: 0.8 }), 0, 0.07, 0, g); w.rotation.x = -Math.PI / 2;
    const fish = new THREE.Group(); fish.position.y = 0.075; g.add(fish); L.box(0.16, 0.012, 0.04, litM(null, 0xd83a2a), 0, 0, 0, fish); const tl = L.mesh(new THREE.ConeGeometry(0.03, 0.05, 3), litM(null, 0xd83a2a), -0.09, 0, 0, fish); tl.rotation.z = Math.PI / 2;
    L.box(0.02, 0.014, 0.02, litM(null, 0x18181c), 0.06, 0.005, 0.012, fish); g.userData.fish = fish; return g; }
  // ---- 6. a chart maker's cabin: plank walls, a window onto the sea and a green island, desk, candle, ink; the sea chart (portolan)
  function chartCabin(scene) { L.addSky(scene, { near: 8, far: 40, preset: 'interior' }); scene.fog = null; const pw = litM(L.rep(PLANK, 4, 3), 0xd8b890);
    L.box(9, 0.08, 7, litM(L.rep(PLANK, 8, 6), 0xffffff), 0, -0.04, 0.5, scene); L.box(9, 3.4, 0.12, pw, 0, 1.7, -1.8, scene); L.box(0.12, 3.4, 7, pw, -2.6, 1.7, 0.5, scene);
    const win = new THREE.Group(); win.position.set(1.3, 1.75, -1.72); scene.add(win); L.plane(1.1, 0.8, L.basic(tx(16, 12, (c) => { c.fillStyle = '#8ad0f4'; c.fillRect(0, 0, 16, 12); c.fillStyle = '#2f74c8'; c.fillRect(0, 7, 16, 5); c.fillStyle = '#4eae3e'; c.fillRect(3, 5, 6, 3); c.fillRect(5, 4, 3, 1); }), 1), 0, 0, 0, win);
    for (const s2 of [-1, 1]) { L.box(0.08, 0.9, 0.1, mm(MT.darkWood, 0.2, 1), s2 * 0.58, 0, 0.03, win); L.box(1.24, 0.08, 0.12, mm(MT.darkWood, 1, 0.2), 0, s2 * 0.44, 0.03, win); } L.box(0.04, 0.8, 0.05, mm(MT.darkWood, 0.1, 1), 0, 0, 0.03, win);
    const dk = new THREE.Group(); dk.position.set(-1.25, 0, -1.2); scene.add(dk); L.box(1.6, 0.08, 0.8, mm(MT.wood, 2, 1), 0, 0.82, 0, dk); for (const [x, z] of [[-0.72, -0.32], [0.72, -0.32], [-0.72, 0.32], [0.72, 0.32]]) L.box(0.07, 0.82, 0.07, mm(MT.darkWood, 0.2, 1), x, 0.41, z, dk);
    L.mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 8), litM(null, 0xf4ecd0), 0.5, 0.95, 0.1, dk); L.mesh(new THREE.ConeGeometry(0.025, 0.07, 6), L.basic(null, 0xffb030), 0.5, 1.08, 0.1, dk); const cl = new THREE.PointLight(0xffb060, 1.6, 3); cl.position.set(-0.75, 1.3, -1.0); scene.add(cl);
    L.mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.07, 8), litM(null, 0x1a1a24), -0.3, 0.9, 0.15, dk); const q = L.box(0.015, 0.3, 0.05, litM(null, 0xf8f8f0), -0.28, 1.02, 0.15, dk); q.rotation.z = 0.35;
    L.plane(1.4, 1.0, litM(L.rep(PARCH, 1, 1), 0xffffff), -1.0, 1.95, -1.73, scene); pottedTree(scene, 2.2, -1.2, 0.55); scene.add(new THREE.AmbientLight(0xffe8c8, 0.5)); }
  function seaChart() { const g = new THREE.Group(); L.box(0.62, 0.44, 0.006, litM(L.rep(PARCH, 1, 1), 0xffffff), 0, 0, 0, g); for (const s2 of [-1, 1]) L.mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.46, 8), litM(null, 0xd8c08a), s2 * 0.32, 0, 0, g);
    const blot = L.mesh(new THREE.CircleGeometry(0.05, 9), new THREE.MeshBasicMaterial({ color: 0x14141c }), 0.08, -0.04, 0.006, g); blot.scale.set(1.3, 0.9, 1); blot.visible = false; g.userData.blot = blot; return g; }
  // ---- 7. an 18th-century ship deck at sea: planks, mast and white sails, wheel, rail; rocks ahead (fog) or a calm noon sun
  function shipDeck(scene, { rocks = false } = {}) { L.addSky(scene, { near: rocks ? 8 : 25, far: rocks ? 30 : 110, preset: 'morning' }); if (!rocks) scene.fog = null; const sea = seaPlane(scene, rocks ? 0x2a5a8a : 0x2f74c8);
    L.box(6, 0.12, 3.6, litM(L.rep(PLANK, 6, 4), 0xffffff), 0, 0.0, 0.4, scene); for (const s2 of [-1, 1]) { L.box(6, 0.5, 0.1, mm(MT.darkWood, 6, 0.4), 0, 0.31, 0.4 + s2 * 1.75, scene); for (let k = 0; k < 9; k++) L.box(0.06, 0.4, 0.06, mm(MT.darkWood, 0.2, 0.5), -2.8 + k * 0.7, 0.75, 0.4 + s2 * 1.75, scene); L.box(6, 0.06, 0.12, mm(MT.wood, 6, 0.2), 0, 0.96, 0.4 + s2 * 1.75, scene); }
    L.mesh(new THREE.CylinderGeometry(0.1, 0.13, 5.5, 8), mm(MT.darkWood, 0.3, 4), -1.6, 2.75, -0.9, scene); L.box(2.6, 0.08, 0.08, mm(MT.darkWood, 2, 0.2), -1.6, 4.4, -0.9, scene); L.box(2.4, 2.0, 0.04, litM(L.rep(SAILW, 2, 2), 0xffffff), -1.6, 3.35, -0.85, scene);
    for (const [a, b] of [[[-1.6, 4.4, -0.9], [-2.9, 0.95, -1.35]], [[-1.6, 4.4, -0.9], [-0.3, 0.95, -1.35]]]) { const A = V3(a), B = V3(b); const r = L.mesh(new THREE.CylinderGeometry(0.012, 0.012, A.distanceTo(B), 4), litM(null, 0xc8b080), 0, 0, 0, scene); r.position.copy(A).lerp(B, 0.5); r.quaternion.setFromUnitVectors(V3([0, 1, 0]), B.clone().sub(A).normalize()); }
    const wh = new THREE.Group(); wh.position.set(1.7, 1.1, -0.9); scene.add(wh); L.mesh(new THREE.TorusGeometry(0.35, 0.04, 5, 12), mm(MT.darkWood, 1, 0.2), 0, 0, 0, wh); for (let k = 0; k < 8; k++) { const sp = L.box(0.03, 0.85, 0.03, mm(MT.darkWood, 0.2, 1), 0, 0, 0, wh); sp.rotation.z = k * Math.PI / 8; } L.box(0.12, 1.1, 0.12, mm(MT.darkWood, 0.2, 1), 0, -0.55, -0.08, wh);
    if (rocks) for (let i = 0; i < 6; i++) { const o = L.mesh(new THREE.DodecahedronGeometry(0.5 + hash(i) * 0.6, 0), mm(MT.stone, 1, 1, 0x7a7a72), 1.5 + (hash(i + 1) - 0.5) * 3, 0.2, -4.5 - hash(i + 2) * 2, scene); o.rotation.set(i, i * 2, 0); }
    else { islandHill(scene, -5, -11, 1.8); const sun = L.mesh(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff2a0 }), 3.2, 5.2, -9, scene); }
    pottedTree(scene, 2.4, 1.6, 0.5); scene.add(new THREE.AmbientLight(0xfff0d8, rocks ? 0.3 : 0.45)); return sea; }
  function sextant() { const g = new THREE.Group(), br = litM(null, 0xd8a840), bk = litM(null, 0x2a2a30);
    const arc = L.mesh(new THREE.TorusGeometry(0.2, 0.014, 4, 10, Math.PI / 3), br, 0, 0, 0, g); arc.rotation.z = Math.PI / 3;
    for (const a of [Math.PI / 3, 2 * Math.PI / 3]) { const r = L.box(0.012, 0.2, 0.012, br, Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0, g); r.rotation.z = a - Math.PI / 2; }
    L.mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.12, 8), bk, 0.0, 0.12, 0.03, g).rotation.z = Math.PI / 2; L.box(0.04, 0.05, 0.005, litM(null, 0xb8d8f0), 0, 0.03, 0.01, g); L.box(0.02, 0.08, 0.02, mm(MT.darkWood, 0.2, 0.3), 0, -0.04, -0.03, g); return g; }
  function chronometerBox(scene, x, z) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); L.box(0.4, 0.22, 0.4, mm(MT.wood, 1, 0.5, 0x9a5a2a), 0, 0.11, 0, g); const lid = L.box(0.4, 0.04, 0.4, mm(MT.wood, 1, 1, 0x9a5a2a), 0, 0.4, -0.2, g); lid.rotation.x = -1.2;
    L.mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 16), litM(null, 0xd8dce4), 0, 0.24, 0, g); L.mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.045, 16), litM(null, 0xf8f4e8), 0, 0.245, 0, g); return g; }
  function bigWatch() { const g = new THREE.Group(); const c = L.mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 16), litM(null, 0xd8dce4), 0, 0, 0, g); c.rotation.x = Math.PI / 2;
    const f = L.mesh(new THREE.CircleGeometry(0.094, 16), litM(null, 0xfaf6ea), 0, 0, 0.021, g); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; L.box(0.008, 0.016, 0.003, litM(null, 0x1a1a24), Math.sin(a) * 0.08, Math.cos(a) * 0.08, 0.023, g).rotation.z = -a; }
    L.box(0.006, 0.06, 0.004, litM(null, 0x1a1a24), 0.012, 0.02, 0.025, g).rotation.z = -0.6; L.mesh(new THREE.TorusGeometry(0.025, 0.007, 4, 8), litM(null, 0xd8dce4), 0, 0.125, 0, g); return g; }
  // ---- 8. John Harrison's workshop: clock bench, gears on the wall, a window onto green, Harrison = an existing NPC + tricorn + brown coat + the H4 watch
  function workshop(scene) { const R0 = roomWithWindow(scene, { preset: 'morning', wx: 0.9 }); scene.fog = null; const bn = new THREE.Group(); bn.position.set(-1.2, 0, -0.9); scene.add(bn);
    L.box(1.6, 0.08, 0.6, mm(MT.wood, 2, 1), 0, 0.85, 0, bn); for (const [x, z] of [[-0.72, -0.25], [0.72, -0.25], [-0.72, 0.25], [0.72, 0.25]]) L.box(0.07, 0.85, 0.07, mm(MT.darkWood, 0.2, 1), x, 0.425, z, bn);
    for (const [x, y, r] of [[-1.6, 1.9, 0.3], [-0.9, 2.2, 0.22], [-1.1, 1.55, 0.16], [-0.4, 1.8, 0.2]]) { const gr = L.mesh(new THREE.CylinderGeometry(r, r, 0.04, 14), litM(null, 0xd8a840), x, y, -1.1, scene); gr.rotation.x = Math.PI / 2; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; L.box(0.05, 0.05, 0.04, litM(null, 0xd8a840), x + Math.cos(a) * (r + 0.02), y + Math.sin(a) * (r + 0.02), -1.1, scene).rotation.z = a; } }
    const lc = new THREE.Group(); lc.position.set(1.9, 0, -0.95); scene.add(lc); L.box(0.5, 2.0, 0.35, mm(MT.darkWood, 1, 2), 0, 1.0, 0, lc); L.mesh(new THREE.CircleGeometry(0.17, 14), litM(null, 0xfaf6ea), 0, 1.6, 0.18, lc);
    pottedTree(scene, 0.15, -0.8, 0.5); return R0; }
  // ---- 9. a modern town street with satellites overhead (4 of them, beams to her phone)
  function satellite(scene, x, y, z, s = 1) { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); scene.add(g);
    const PAN = tx(8, 16, (c) => { c.fillStyle = '#2a4ab8'; c.fillRect(0, 0, 8, 16); c.fillStyle = '#8ab0f8'; for (let y2 = 0; y2 < 16; y2 += 4) c.fillRect(0, y2, 8, 1); c.fillRect(3, 0, 1, 16); });
    L.box(0.32, 0.32, 0.4, litM(null, 0xe8c048), 0, 0, 0, g); for (const s2 of [-1, 1]) { L.box(0.6, 0.02, 0.26, litM(L.rep(PAN, 1, 1), 0xffffff), s2 * 0.52, 0, 0, g); L.box(0.2, 0.03, 0.03, litM(null, 0xb8b8c0), s2 * 0.22, 0, 0, g); }
    const d = L.mesh(new THREE.ConeGeometry(0.12, 0.08, 10, 1, true), litM(null, 0xf0f0f0), 0, -0.2, 0, g); d.material.side = THREE.DoubleSide; return g; }
  function beam(scene, a, b, col = 0x7af0ff) { const m = L.mesh(new THREE.CylinderGeometry(0.012, 0.012, a.distanceTo(b), 4), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8 }), 0, 0, 0, scene); m.position.copy(a).lerp(b, 0.5); m.quaternion.setFromUnitVectors(V3([0, 1, 0]), b.clone().sub(a).normalize()); return m; }
  function pin3D(scene, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); L.mesh(new THREE.SphereGeometry(0.14, 10, 8), litM(null, 0xe83a3a), 0, 0.12, 0, g); const c = L.mesh(new THREE.ConeGeometry(0.12, 0.26, 10), litM(null, 0xe83a3a), 0, -0.06, 0, g); c.rotation.x = Math.PI;
    L.mesh(new THREE.SphereGeometry(0.055, 8, 6), litM(null, 0xffffff), 0, 0.13, 0.1, g); return g; }
  // ---- 10. space: the Earth below, a GPS satellite with a clock
  function spaceSet(scene) { scene.background = new THREE.Color(0x04040e); scene.fog = null; const pts = []; for (let i = 0; i < 300; i++) pts.push((hash(i) - 0.5) * 60, (hash(i + 300) - 0.2) * 40, -20 - hash(i + 600) * 10);
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false })));
    const earth = L.mesh(new THREE.SphereGeometry(3, 24, 16), new THREE.MeshLambertMaterial({ map: L.rep(EARTH, 1, 1) }), 0, -3, 0, scene); earth.rotation.y = 1.0;
    scene.add(new THREE.AmbientLight(0xc8d4ff, 0.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(-3, 4, 4); scene.add(sun); return earth; }
  function clockFace(parent, x, y, z, s = 1) { const g = bigWatch(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g); return g; }
  // ---- props held IN the hand: placed at the fist once, then parented to the hand bone (they follow every pose)
  function holdIn(ch, side, prop, off = [0, 0, 0], rot = [0, 0, 0]) { let done = false; return () => { if (done) return; done = true; ch.root.updateMatrixWorld(true); const p = ch.fist(side, V3([0, 0, 0])); if (!prop.parent) ch.root.parent.add(prop);
    prop.position.copy(p).add(V3(off)); prop.rotation.set(...rot); prop.updateMatrixWorld(true); ch.hand(side).attach(prop); }; }
  function harrisonOf(n) { tricorn(n); labCoat(n, 0x6a4a2a); return n; }
  // ===================================== level steps (word times) =====================================
  LV.push([ws(2, 'Star'), 1], [ws(3, 'stick'), 2], [ws(5, 'compass'), 3], [ws(7, 'sextant'), 4], [ws(8, 'GPS'), 5]);
  for (const [tt] of LV) cue(tt, 'meter');
  // ===== 1. "A thousand years ago, there was no GPS… so you lose sight of land, and you're lost."  fog, open sea, a rowboat, no land; meter 0
  SH([1, 'A'], 'C', (t0) => { const scene = new THREE.Scene(); L.addSky(scene, { near: 5, far: 22, preset: 'morning' }); const sea = seaPlane(scene, 0x3a6a9a); const bt = rowboat(scene, 0, 0.3); const ch = hero(scene, { p: [-0.2, 0.12, 0.3], ry: 0.2 });
    const cam = CAM([[0.2, 1.2, 4.0], [0.15, 1.15, 3.7]], [[0, 1.0, 0.2]], 46); const mt = meter(scene, cam); const tL = ws(1, 'lost'); cue(t0 + 0.1, 'sea_amb'); cue(tL, 'sting');
    const lab = label3D(scene, 'NO GPS', 0, 0, 0, ws(1, 'GPS'), { size: 0.16 }); const lab2 = label3D(scene, 'LOST', 0, 0, 0, tL, { size: 0.13, front: 0xff8a6a, side: 0x8a2a1a });
    const fx = new FX(LW, LH).add('question', { obj: ch.root, bone: 'Head', offset: [0.16, 0.42, 0], t0: tL, dur: 99 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); lab2(t); sea(t); const q = q15(t); bt.rotation.z = 0.03 * Math.sin(q * 2); ch.root.rotation.z = bt.rotation.z; ch.drive(t, [seg('look_around', t0 + 0.4, { loop: true })], [[-99, 'open', 'neutral'], [tL, 'surprised', 'gasp']]); } }; });
  // ===== 2. "So how did anyone get home?"  closer on her in the boat, she shrugs to camera
  SH([1, 'So', 2], 'C', (t0) => { const scene = new THREE.Scene(); L.addSky(scene, { near: 5, far: 22, preset: 'morning' }); const sea = seaPlane(scene, 0x3a6a9a); rowboat(scene, 0, 0.3); const ch = hero(scene, { p: [-0.1, 0.12, 0.35], ry: 0.05 });
    const cam = CAM([[0.1, 1.3, 2.9], [0.1, 1.3, 2.75]], [[0, 1.25, 0.3]], 44); const mt = meter(scene, cam); cue(ws(1, 'home'), 'question_pop');
    const fx = new FX(LW, LH).add('question', { obj: ch.root, bone: 'Head', offset: [0.16, 0.42, 0], t0: ws(1, 'home'), dur: 99 });
    return { scene, cam, fx, upd(t) { mt(t); sea(t); ch.drive(t, [still('hands_on_hips', 0.9)], [[-99, 'open', 'talkO']]); } }; });
  // ===== 3. "First, the stars. You steer by the North Star…"  night hill: she looks up and points at the bright North Star; meter 1
  SH([2, 'First'], 'C', (t0) => { const scene = new THREE.Scene(); const S0 = starHill(scene); const ch = hero(scene, { p: [-0.25, 0.78, 0.4], ry: 0.35 }); S0.clouds.position.x = -9; const cam = CAM([[0.1, 1.5, 4.4], [0.1, 1.6, 4.2]], [[0.2, 2.2, 0]], 50); const mt = meter(scene, cam);
    const tN = ws(2, 'North'); cue(t0 + 0.1, 'night_amb'); cue(tN, 'twinkle'); const lab = label3D(scene, 'NORTH STAR', 0, 0, 0, tN, { size: 0.15 });
    const fx = new FX(LW, LH).add('sparkle', { target: S0.polaris, offset: [0, 0, 0], t0: tN, dur: 99, n: 5, radius: 22, color: '#fff6c0' });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, [seg('look_around', t0 - 0.2), seg('point', tN - 0.2, { fade: 0.15 })], [[-99, 'open', 'smile'], [tN, 'happy', 'smileOpen']]); } }; });
  // ===== 4. "…until clouds hide it."  dark clouds slide over the North Star, she looks up, lost again
  SH([2, 'until'], 'C', (t0) => { const scene = new THREE.Scene(); const S0 = starHill(scene); const ch = hero(scene, { p: [-0.1, 0.78, 0.4], ry: 0.35 }); const cam = CAM([[0.3, 1.6, 4.0], [0.3, 1.62, 3.9]], [[0.3, 2.2, 0]], 50); const mt = meter(scene, cam);
    const tC = ws(2, 'clouds'); cue(tC, 'wind'); const fx = new FX(LW, LH).add('question', { obj: ch.root, bone: 'Head', offset: [0.16, 0.42, 0], t0: tC + 0.4, dur: 99 });
    return { scene, cam, fx, upd(t) { mt(t); S0.clouds.position.x = -4.6 + 3.6 * smooth((q15(t) - t0) / 1.4); ch.drive(t, [seg('look_around', t0 - 0.2)], [[-99, 'open', 'neutral'], [tC, 'surprised', 'frown']]); } }; });
  // ===== 5. "Marshall Islanders built stick charts of the ocean swells."  the beach: she sits in the outrigger canoe, the stick chart in her hands; meter 2
  SH([3, 'Marshall'], 'C', (t0) => { const scene = new THREE.Scene(); const sea = beach(scene); canoe(scene, 0.1, 0.1, 0.12); const ch = hero(scene, { p: [0.05, 0.16, 0.1], ry: 0.12 }); const sc = stickChart(); sc.scale.setScalar(0.75);
    const hold = holdIn(ch, 'R', sc, [0.12, -0.3, 0.2], [-0.6, 0, 0]); const cam = CAM([[0.15, 1.3, 3.7], [0.15, 1.28, 3.5]], [[0.05, 1.0, 0.1]], 48); const mt = meter(scene, cam); const tS = ws(3, 'stick'), tW = ws(3, 'swells');
    cue(t0 + 0.1, 'beach_amb'); const lab = label3D(scene, 'STICK CHART', 0, 0, 0, tS, { size: 0.15 }); const fx = new FX(LW, LH).add('sparkle', { target: sc, offset: [0, 0, 0.05], t0: tS, dur: 1.2, n: 4, radius: 16 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); sea(t); ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'smile'], [tW, 'happy', 'smileOpen']]); hold(); } }; });
  // ===== 6. "They memorized them… and left them on the beach."  she lays the chart down on the sand (thought bubble of waves), pushes off
  SH([3, 'They'], 'C', (t0) => { const scene = new THREE.Scene(); const sea = beach(scene); canoe(scene, 0.4, -0.3, 0.12); const sc = stickChart(); sc.position.set(-0.55, 0.03, 0.55); sc.rotation.x = -Math.PI / 2; scene.add(sc);
    const ch = hero(scene, { p: [-0.1, 0, 0.55], ry: 0.25 }); const cam = CAM([[0.1, 1.2, 3.5], [0.12, 1.2, 3.4]], [[0, 0.8, 0.3]], 48); const mt = meter(scene, cam); const tM = ws(3, 'memorized'), tB = ws(3, 'beach');
    cue(tB, 'sand_drop'); const fx = new FX(LW, LH).add('thought', { obj: ch.root, bone: 'Head', offset: [0.2, 0.45, 0], t0: tM, dur: 99 }).add('dust', { world: [-0.55, 0.05, 0.55], t0: tB, dur: 0.8 });
    return { scene, cam, fx, upd(t) { mt(t); sea(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('press_down', tB - 0.3, { fade: 0.15 })], [[-99, 'open', 'smile'], [tM, 'open', 'talkO'], [tB, 'wink', 'blushSmile']]); } }; });
  // ===== 7. "Rome put milestones along its roads."  a Roman road between cypresses: she reads the milestone
  SH([4, 'Rome'], 'C', (t0) => { const scene = new THREE.Scene(); romanRoad(scene); milestone(scene, 0.55, 0.0); const ch = hero(scene, { p: [-0.25, 0.1, 0.45], ry: 0.55 }); sepia(scene, [ch]); const cam = CAM([[0.15, 1.2, 3.7], [0.12, 1.18, 3.5]], [[0.1, 0.95, 0]], 48); const mt = meter(scene, cam);
    const tMi = ws(4, 'milestones'); cue(t0 + 0.1, 'birds'); cue(tMi, 'stone_tap'); const lab = label3D(scene, 'MILESTONE', 0, 0, 0, tMi, { size: 0.15 });
    return { scene, cam, upd(t) { mt(t); lab(t); ch.drive(t, [seg('walk', -99, { loop: true, speed: 0.5 }), seg('point', tMi - 0.2, { fade: 0.15 })], [[-99, 'open', 'smile'], [tMi, 'happy', 'smileOpen']]); ch.root.position.x = -0.25 - 0.25 * (1 - smooth((q15(t) - t0) / 0.8)); } }; });
  // ===== 8. "Great… if you stayed on the road."  the road ends in wild grass; she stops at the edge, shrugs
  SH([4, 'Great'], 'C', (t0) => { const scene = new THREE.Scene(); romanRoad(scene, { end: true }); const ch = hero(scene, { p: [0.0, 0.1, -1.4], ry: 0.15 }); sepia(scene, [ch]); const cam = CAM([[0.3, 1.3, 2.4], [0.3, 1.3, 2.3]], [[0, 0.8, -1.4]], 50); const mt = meter(scene, cam);
    const tR = ws(4, 'road'); const fx = new FX(LW, LH).add('question', { obj: ch.root, bone: 'Head', offset: [0.16, 0.42, 0], t0: tR, dur: 99 });
    return { scene, cam, fx, upd(t) { mt(t); ch.drive(t, [seg('shake_head', t0)], [[-99, 'open', 'talkO'], [tR, 'open', 'frown']]); } }; });
  // ===== 9. "Around eleven hundred, Chinese sailors used a magnetized needle. This is a compass."  a Song junk: she holds the water compass; meter 3
  SH([5, 'Around'], 'C', (t0) => { const scene = new THREE.Scene(); const sea = junkDeck(scene); const ch = hero(scene, { p: [-0.15, 0.06, 0.6], ry: 0.15 }); sepia(scene, [ch]); const wc = waterCompass(); wc.scale.setScalar(1.25);
    const hold = holdIn(ch, 'R', wc, [0.1, -0.2, 0.12]); const cam = CAM([[0.15, 1.5, 3.4], [0.12, 1.48, 3.25]], [[0.0, 1.0, 0.4]], 48); const mt = meter(scene, cam);
    const tY = ws(5, 'eleven'), tC = ws(5, 'compass'); cue(t0 + 0.1, 'sea_amb'); cue(tC, 'sting'); const y = label3D(scene, 'AROUND 1100', 0, 0, 0, tY, { size: 0.13, slot: 0 }); const lab = label3D(scene, 'COMPASS', 0, 0, 0, tC, { size: 0.13, slot: 1 });
    const fx = new FX(LW, LH).add('sparkle', { target: wc, offset: [0, 0.12, 0], t0: tC, dur: 99, n: 4, radius: 16 });
    return { scene, cam, fx, upd(t) { mt(t); y(t); lab(t); sea(t); ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'smile'], [tC, 'happy', 'smileOpen']]); hold(); wc.userData.fish.rotation.y = 0.8 * Math.sin(q15(t) * 3) * Math.max(0, 1 - (q15(t) - t0) / 3); } }; });
  // ===== 10. "It points north… and that's all it tells you."  closer: the fish needle swings north (3D N), she looks around, puzzled
  SH([5, 'It'], 'C', (t0) => { const scene = new THREE.Scene(); const sea = junkDeck(scene); const ch = hero(scene, { p: [-0.15, 0.06, 0.6], ry: -0.2 }); sepia(scene, [ch]); const wc = waterCompass(); wc.scale.setScalar(1.25);
    const hold = holdIn(ch, 'R', wc, [0.1, -0.2, 0.12]); const cam = CAM([[0.35, 1.75, 2.7], [0.33, 1.73, 2.6]], [[0.0, 0.95, 0.5]], 46); const mt = meter(scene, cam); const tN = ws(5, 'north');
    const lab = label3D(scene, 'NORTH', 0, 0, 0, tN, { size: 0.14 }); cue(tN, 'blip'); const fx = new FX(LW, LH).add('question', { obj: ch.root, bone: 'Head', offset: [0.16, 0.42, 0], t0: ws(5, 'all') , dur: 99 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); sea(t); ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'talkO'], [ws(5, 'all'), 'open', 'frown']]); hold(); } }; });
  // ===== 11. "Sea charts were drawn by hand… and every copy could add a mistake."  the chart maker's cabin: she unrolls the sea chart, an ink blot appears
  SH([6, 'Sea'], 'C', (t0) => { const scene = new THREE.Scene(); chartCabin(scene); const ch = hero(scene, { p: [0.2, 0, 0.6], ry: -0.1 }); sepia(scene, [ch]); const ct = seaChart(); ct.scale.setScalar(1.0);
    const hold = holdIn(ch, 'R', ct, [-0.14, -0.22, 0.16], [-0.55, 0.1, 0]); const cam = CAM([[0.15, 1.3, 3.4], [0.15, 1.28, 3.25]], [[0.1, 1.1, 0.4]], 48); const mt = meter(scene, cam); const tC = ws(6, 'charts'), tM = ws(6, 'mistake');
    cue(tC, 'paper'); cue(tM, 'splat'); const lab = label3D(scene, 'SEA CHART', 0, 0, 0, tC, { size: 0.14 }); const lab2 = label3D(scene, 'MISTAKE', 0, 0, 0, tM, { size: 0.12, front: 0xff8a6a, side: 0x8a2a1a });
    return { scene, cam, upd(t) { mt(t); lab(t); lab2(t); ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'smile'], [tM, 'surprised', 'gasp']]); hold(); ct.userData.blot.visible = q15(t) >= tM; } }; });
  // ===== 12. "Out at sea, nobody could measure longitude."  an 18th-century deck in fog, rocks ahead; the ship lurches
  SH([7, 'Out'], 'C', (t0) => { const scene = new THREE.Scene(); const sea = shipDeck(scene, { rocks: true }); const ch = hero(scene, { p: [0.2, 0.06, 0.7], ry: -0.5 }); sepia(scene, [ch]); const cam = CAM([[0.6, 1.5, 3.8], [0.6, 1.5, 3.6]], [[0.1, 1.2, -0.5]], 50); const mt = meter(scene, cam);
    const tL = ws(7, 'longitude'); cue(t0 + 0.1, 'creak'); cue(tL, 'crash'); const lab = label3D(scene, 'LONGITUDE?', 0, 0, 0, tL, { size: 0.14 });
    const fx = new FX(LW, LH).add('shake', { obj: ch.root, bone: 'Head', offset: [0.2, 0.1, 0], t0: tL, dur: 0.8 }).add('splash', { world: [1.5, 0.5, -3.8], t0: tL, dur: 1.2 }).add('exclaim', { obj: ch.root, bone: 'Head', offset: [0.16, 0.42, 0], t0: tL, dur: 99 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); sea(t); const k = Math.max(0, 1 - Math.abs(q15(t) - tL) * 2); scene.rotation.z = 0.04 * k * Math.sin(q15(t) * 40); ch.drive(t, [seg('look_around', t0 - 0.2), seg('surprised', tL - 0.1, { fade: 0.1 })], [[-99, 'open', 'neutral'], [tL, 'surprised', 'gasp']]); } }; });
  // ===== 13. "In 1761, John Harrison's sea clock kept near-perfect time."  person + year card: Harrison (existing NPC + tricorn + brown coat) holds up the H4 watch in his workshop
  SH([7, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); workshop(scene); const jh = harrisonOf(npcAt(scene, 'bank_teller', 'grey', 0.55, -0.2, -0.35, 1.05)); jh.walk(0); npcSet(jh, 'Bone004', -1.25); const w = bigWatch(); w.scale.setScalar(1.5);
    const hp = npcHand(jh, 'R'); w.position.copy(hp).add(V3([0, 0.06, 0.06])); scene.add(w); jh.updateMatrixWorld(true); jh.bones.Bone005.attach(w);
    const ch = hero(scene, { p: [-0.45, 0, 0.75], ry: 0.45 }); sepia(scene, [ch]); const cam = CAM([[0.1, 1.4, 4.0], [0.1, 1.38, 3.8]], [[0.1, 1.35, 0]], 50); const mt = meter(scene, cam); const tY = ws(7, '1761'), tT = ws(7, 'time');
    cue(tY, 'stamp'); cue(t0 + 0.2, 'tick'); const y = label3D(scene, '1761', 0, 0, 0, tY, { size: 0.22, slot: 0 }); const n = label3D(scene, 'JOHN HARRISON', 0, 0, 0, tY + 0.25, { size: 0.12, slot: 1, front: 0xffffff, side: 0x9a8a6a });
    const fx = new FX(LW, LH).add('sparkle', { target: w, offset: [0, 0, 0.05], t0: tT, dur: 99, n: 5, radius: 18 });
    return { scene, cam, fx, upd(t) { mt(t); y(t); n(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('surprised', tT - 0.2, { fade: 0.15 })], [[-99, 'open', 'smile'], [tT, 'surprised', 'smileOpen']]); } }; });
  // ===== 14. "Add a sextant… and you knew where you were."  a calm noon deck: she sights the sun with the sextant held out, the chronometer box on deck; meter 4
  SH([7, 'Add'], 'C', (t0) => { const scene = new THREE.Scene(); const sea = shipDeck(scene); chronometerBox(scene, 0.75, 0.9); const ch = hero(scene, { p: [-0.2, 0.06, 0.8], ry: 0.25 }); sepia(scene, [ch]); const sx = sextant(); sx.scale.setScalar(1.4);
    const hold = holdIn(ch, 'L', sx, [0.02, 0.06, 0.06], [0, 0, 0.3]); const cam = CAM([[0.2, 1.3, 3.7], [0.18, 1.3, 3.55]], [[0.15, 1.15, 0.5]], 48); const mt = meter(scene, cam); const tS = ws(7, 'sextant'), tW = ws(7, 'where');
    cue(tS, 'sting'); cue(tW, 'chime'); const lab = label3D(scene, 'SEXTANT', 0, 0, 0, tS, { size: 0.14 }); const fx = new FX(LW, LH).add('sparkle', { target: sx, offset: [0, 0.15, 0], t0: tS, dur: 99, n: 4, radius: 16 }).add('exclaim', { obj: ch.root, bone: 'Head', offset: [0.16, 0.42, 0], t0: tW, dur: 99 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); sea(t); ch.drive(t, [seg('present', t0 - 0.2)], [[-99, 'open', 'smile'], [tW, 'happy', 'smileOpen']]); hold(); } }; });
  // ===== 15. "Then came satellites. Your phone listens to at least four of them. This is GPS."  a green town street: 4 satellites beam to the phone in her hand, a map pin; meter 5 FOUND
  SH([8, 'Then'], 'C', (t0) => { const scene = new THREE.Scene(); mmlTown(scene, { preset: 'morning' }); const ch = hero(scene, { p: [0.0, 0, 0.8], ry: 0.15 }); const ph = phone(); ph.scale.setScalar(1.3);
    const hold = holdIn(ch, 'R', ph, [0.0, 0.05, 0.06], [0, 0, 0]); const sats = [[-0.95, 2.75, 0.3], [-0.35, 3.15, 0.1], [0.35, 3.1, 0.1], [0.95, 2.7, 0.3]].map(([x, y, z]) => satellite(scene, x, y, z, 0.85));
    const cam = CAM([[0.05, 1.35, 3.5], [0.05, 1.4, 3.6]], [[0.0, 1.75, 0.5]], 52); const mt = meter(scene, cam); const tSa = ws(8, 'satellites'), tF = ws(8, 'four'), tG = ws(8, 'GPS'); cue(tSa, 'whoosh'); cue(tF, 'scan'); cue(tG, 'sting');
    const lab = label3D(scene, 'AT LEAST FOUR', 0, 0, 0, tF, { size: 0.13 }); const lab2 = label3D(scene, 'GPS', 0, 0, 0, tG, { size: 0.2, slot: 0 }); const lab3 = label3D(scene, 'FOUND', 0, 0, 0, tG + 0.4, { size: 0.12, slot: 1, front: 0x9cf09c, side: 0x3a8a4a });
    const pin = pin3D(scene, 0.0, 2.15, 0.8); const beams = []; const fx = new FX(LW, LH).add('sparkle', { target: pin, offset: [0, 0.2, 0], t0: tG, dur: 99, n: 5, radius: 18 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); lab2(t); lab3(t); const q = q15(t); sats.forEach((s, i) => { s.visible = q >= tSa + i * 0.15; s.rotation.y = q * 0.3; }); pin.visible = q >= tG; pin.position.y = 2.15 + 0.05 * Math.sin(q * 5);
      ch.drive(t, [seg('look_around', t0 - 0.2), seg('hold_up_object', tF - 0.3, { fade: 0.15 })], [[-99, 'open', 'smile'], [tG, 'happy', 'smileOpen']]); hold();
      if (q >= tF && !beams.length) { scene.updateMatrixWorld(true); const pp = ph.getWorldPosition(V3([0, 0, 0])); sats.forEach((s) => beams.push(beam(scene, s.position.clone(), pp))); } beams.forEach((b) => { b.visible = q >= tF && Math.floor(q * 6) % 2 === 0; }); } }; });
  // ===== 16. "GPS clocks run thirty-eight microseconds a day fast, because of Einstein. Unfixed, maps would drift about ten kilometers a day. Logging off."  space: she stands on top of the Earth, a GPS satellite with a clock; outro
  SH([9, 'GPS'], 'C', (t0) => { const scene = new THREE.Scene(); spaceSet(scene); const ch = hero(scene, { p: [0, 0, 0], ry: 0.2 }); const st = satellite(scene, 0.9, 1.9, -0.4, 1.0); const ck = clockFace(scene, 0.9, 2.35, -0.2, 1.6);
    const cam = CAM([[0.2, 1.2, 4.0], [0.2, 1.3, 4.3]], [[0.25, 1.15, 0]], 50); const mt = meter(scene, cam); const t38 = ws(9, 'thirty-eight'), tE = ws(9, 'Einstein'), tK = ws(9, 'ten'), tLo = ws(9, 'Logging'), tOut = TL.dur + 0.05;
    cue(t38, 'tick'); cue(tE, 'zap'); cue(tK, 'blip'); cue(tLo, 'blip'); cue(tOut, 'end_jingle'); const lab = label3D(scene, '38 MICROSECONDS', 0, 0, 0, t38, { size: 0.13, slot: 0 }); const lab2 = label3D(scene, '10 KM A DAY', 0, 0, 0, tK, { size: 0.12, slot: 1 });
    const fx = new FX(LW, LH).add('zap', { target: ck, offset: [0, 0, 0], t0: tE, dur: 1.4 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); lab2(t); if (t >= tOut) cam.children.forEach((o) => { o.visible = false; }); st.rotation.y = q15(t) * 0.4; ch.drive(t, [seg('present', t0 - 0.2), seg('wave', tLo - 0.3, { fade: 0.12 })], [[-99, 'open', 'smileOpen'], [tE, 'surprised', 'talkO'], [tLo, 'wink', 'blushSmile']]); },
      ov(o, t, c) { if (t >= tOut) { plateText(o, CHANNEL, CX, 40, { size: 12, border: '#fdd941', fg: '#fdd941', scale: popS(t, tOut) }); if (t >= tOut + 0.4) { const w = 90, h = 14, X = CX - w / 2, Y = 60; c.fillStyle = '#040412'; c.fillRect(X - 2, Y - 2, w + 4, h + 4); c.fillStyle = '#fe2c55'; c.fillRect(X, Y, w, h); bitText(c, 'FOLLOW', CX, Y + 7, 1, '#ffffff', { outline: null }); } } } }; });
