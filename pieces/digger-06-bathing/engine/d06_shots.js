  // ===================================== DIGGER 06: "how people bathed before showers" (cat.explains.it format, vertical) =====================================
  // problem -> solution chain; EVERYTHING WITH VOLUME: the CLEAN meter is a physical HUD panel parented to the camera, labels and years
  // are extruded 3D letters, eras are sepia LIGHT in the scene (grade of the set, never a 2D layer).
  const LGF = new Font(LUCKIEST);
  function letters3D(parent, txt, { size = 0.3, x = 0, y = 2, z = 0, seed = 7, jitter = 1, front = 0xffe21a, side = 0xa87800 } = {}) {
    const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); let r = seed; const rnd2 = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    const mats = [new THREE.MeshBasicMaterial({ color: front }), new THREE.MeshBasicMaterial({ color: side })];
    txt.split('|').forEach((line, li) => { let cx = 0; const items = [];
      for (const ch of line) { if (ch === ' ') { cx += size * 0.32; continue; }
        const geo = new TextGeometry(ch, { font: LGF, size, depth: size * 0.3, curveSegments: 4, bevelEnabled: true, bevelThickness: size * 0.02, bevelSize: size * 0.012, bevelSegments: 1 });
        geo.computeBoundingBox(); const bb = geo.boundingBox, w = LUCKIEST.glyphs[ch] ? LUCKIEST.glyphs[ch].ha / LUCKIEST.resolution * size * 0.92 : bb.max.x - bb.min.x; geo.translate(-(bb.min.x + bb.max.x) / 2, -size * 0.36, -size * 0.1);
        const m = new THREE.Mesh(geo, mats); const s = 1 + (rnd2() - 0.4) * 0.16 * jitter; m.scale.setScalar(s); m.rotation.set((rnd2() - 0.5) * 0.12 * jitter, (rnd2() - 0.5) * 0.16 * jitter, (rnd2() - 0.5) * 0.2 * jitter);
        m.position.set(cx + w / 2, -li * size * 1.08 + (rnd2() - 0.5) * size * 0.08 * jitter, 0); g.add(m); items.push(m); cx += w * s + size * 0.04; }
      for (const m of items) m.position.x -= cx / 2; }); return g; }
  // a 3D label that pops in at time tw (scale 0 -> 1.15 -> 1), facing the camera, tilted a little
  let CURCAM = null;
  function label3D(scene, txt, x, y, z, tw, { size = 0.14, ry = 0, front, side, slot = null } = {}) {
    if (slot === null) slot = /^\d{4}$/.test(txt) ? 0 : (size < 0.135 ? 1 : 0);
    const cam = CURCAM, d = 1.2, halfH = d * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), sz = Math.min(slot ? 0.055 : 0.08, 0.5 / (txt.length * 0.62));
    const g = letters3D(cam, txt, { size: sz, x: 0, y: halfH * (slot ? 0.38 : 0.56), z: -d, seed: txt.length * 7, front, side }); g.rotation.set(-0.25, 0.18, 0.03); g.visible = false;
    cue(tw, 'label'); return (t) => { const f = (q15(t) - tw) * 30; g.visible = f >= 0; g.scale.setScalar(f < 0 ? 0 : f < 3 ? [0.6, 1.15, 0.97][Math.floor(f)] : 1); }; }
  // ---- the CLEAN meter: MML2 HUD panel (bevelled dark plate, teal rim, extruded CLEAN, 5 bevelled emissive cells) parented to the camera ----
  const LV = []; const lvAt = (t) => { let n = 0, fl = false; for (const [tt, v, flick] of LV) if (t >= tt) { n = v; fl = !!flick && t < tt + 1.2; } return [n, fl]; };
  function meter(scene, cam) {
    scene.add(cam); CURCAM = cam; const g = new THREE.Group(); cam.add(g);
    const d = 1.2, halfH = d * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), halfW = halfH * LW / LH, w = 0.36, h = 0.11;
    g.position.set(-halfW + w / 2 + 0.03, halfH - h / 2 - 0.05, -d); g.rotation.set(0.12, 0.18, 0);
    L.box(w + 0.02, h + 0.02, 0.025, new THREE.MeshBasicMaterial({ color: 0x1f4a52 }), 0, 0, -0.006, g); L.box(w, h, 0.03, new THREE.MeshBasicMaterial({ color: 0x18203a }), 0, 0, 0, g);
    L.box(w - 0.01, 0.006, 0.032, new THREE.MeshBasicMaterial({ color: 0x5c8892 }), 0, h / 2 - 0.004, 0.001, g);
    letters3D(g, 'CLEAN', { size: 0.034, x: -w / 2 + 0.06, y: 0.0, z: 0.02, jitter: 0.4, front: 0xffffff, side: 0x9ab0c0 });
    const cells = []; for (let i = 0; i < 5; i++) { const on = new THREE.MeshBasicMaterial({ color: 0x5cff7a }), off = new THREE.MeshBasicMaterial({ color: 0x24303a });
      const c = L.box(0.038, 0.06, 0.02, off, -w / 2 + 0.135 + i * 0.046, 0, 0.02, g); const hi = L.box(0.03, 0.008, 0.022, new THREE.MeshBasicMaterial({ color: 0xb8ffc8 }), -w / 2 + 0.135 + i * 0.046, 0.022, 0.022, g); hi.visible = false; cells.push([c, on, off, hi]); }
    return (t) => { const [n, fl] = lvAt(t); const blink = fl && Math.floor(t * 10) % 2; cells.forEach(([c, on, off, hi], i) => { const lit = i < n || (blink && i === n); c.material = lit ? on : off; hi.visible = lit; }); }; }
  // ---- sets and props ----
  const SEPIA = [1.05, 0.78, 0.48];
  const sepia = (scene, keep = []) => { keep = keep.map((k) => k.root || k); if (scene.background && scene.background.isColor) scene.background.multiply(new THREE.Color(...SEPIA)); scene.add(new THREE.PointLight(0xffb060, 1.6, 6).translateY(2.2).translateZ(1.2)); grade(scene, SEPIA, { lit: true, skip: (o) => { let p = o; while (p) { if (keep.includes(p)) return true; p = p.parent; } return false; } }); };
  function waterBox(parent, w, d, y, x, z, col = 0x4a9ad8, op = 0.75) { return L.box(w, 0.04, d, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op }), x, y, z, parent); }
  function riverSet(scene) { hillSet(scene); waterBox(scene, 9, 2.6, 0.18, 0, 0.3, 0x3a8ad0, 0.8);
    for (const [x, z] of [[-1.6, -0.9], [1.7, -0.95], [-1.9, 1.5], [1.6, 1.55]]) { const r = L.mesh(new THREE.DodecahedronGeometry(0.22, 0), mm(MT.stone, 1, 1), x, 0.12, z, scene); r.rotation.set(x, z, 0); }
    for (let i = 0; i < 8; i++) L.box(0.5, 0.012, 0.03, new THREE.MeshBasicMaterial({ color: 0xbfe4ff }), -2 + i * 0.6, 0.205, 0.0 + (i % 3) * 0.5 - 0.5, scene); }
  function romanSet(scene) { L.addSky(scene, { near: 12, far: 60, preset: 'morning' });
    L.box(10, 0.1, 8, mm(MT.flag, 6, 5, 0xe8dcc0), 0, -0.05, 0, scene);
    const pool = new THREE.Group(); pool.position.set(0, 0, -0.6); scene.add(pool); for (const [w, d, x, z] of [[3.2, 0.2, 0, -0.9], [3.2, 0.2, 0, 0.9], [0.2, 2.0, -1.5, 0], [0.2, 2.0, 1.5, 0]]) L.box(w, 0.35, d, mm(MT.carved, 2, 0.4, 0xf0e8d8), x, 0.175, z, pool);
    const water = waterBox(pool, 2.8, 1.6, 0.26, 0, 0, 0x5ab8c8, 0.85);
    for (const x of [-2.6, -1.3, 1.3, 2.6]) ruinPillar(scene, x, -2.2, 3.4); reliefWall(scene, { x: 0, z: -2.6, len: 9, h: 3.6, upper: MT.carved });
    for (const [x, z] of [[-2.8, 0.8], [2.8, 0.6]]) pottedTree(scene, x, z, 0.9); scene.add(new THREE.AmbientLight(0xfff0d8, 0.5)); return { water }; }
  function strigil() { const g = new THREE.Group(), br = litM(null, 0xc8a050); const blade = L.mesh(new THREE.TorusGeometry(0.11, 0.016, 4, 12, Math.PI * 0.8), br, 0, 0.12, 0, g); blade.rotation.z = Math.PI * 0.6;
    L.box(0.035, 0.14, 0.03, litM(null, 0x8a6a3a), 0, 0.0, 0, g); return g; }
  function oilFlask() { const g = new THREE.Group(); L.mesh(new THREE.SphereGeometry(0.07, 8, 6), litM(null, 0x6a8a3a), 0, 0.07, 0, g); L.mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.06, 6), litM(null, 0x6a8a3a), 0, 0.15, 0, g); return g; }
  function woodTub(parent, x, z, r = 0.5, h = 0.55) { const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    L.mesh(new THREE.CylinderGeometry(r, r * 0.92, h, 14, 1, true), new THREE.MeshLambertMaterial({ map: L.rep(OAK, 3, 1), color: 0x9a6a3a, side: THREE.DoubleSide, flatShading: true }), 0, h / 2, 0, g);
    for (const y of [0.1, h - 0.08]) L.mesh(new THREE.TorusGeometry(r * 1.0, 0.018, 4, 16), litM(null, 0x3a3a40), 0, y, 0, g).rotation.x = Math.PI / 2;
    waterBox(g, r * 1.6, r * 1.6, h - 0.12, 0, 0, 0x7ab0b8, 0.85).geometry = new THREE.CylinderGeometry(r * 0.95, r * 0.95, 0.03, 14); return g; }
  function tinTub(parent, x, z, col = 0x8a8670) { const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    const b = L.mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.42, 16, 1, true), new THREE.MeshLambertMaterial({ color: 0xb8bcc4, side: THREE.DoubleSide, flatShading: true }), 0, 0.21, 0, g); b.scale.set(1.2, 1, 0.75);
    L.mesh(new THREE.CircleGeometry(0.5, 16), litM(null, 0x9a9ea8), 0, 0.005, 0, g).rotation.x = -Math.PI / 2;
    const w = L.mesh(new THREE.CircleGeometry(0.56, 16), new THREE.MeshBasicMaterial({ color: col }), 0, 0.32, 0, g); w.rotation.x = -Math.PI / 2; w.scale.set(1.2, 0.75, 1);
    const rim = L.mesh(new THREE.TorusGeometry(0.62, 0.02, 4, 18), litM(null, 0xd8dce4), 0, 0.42, 0, g); rim.rotation.x = Math.PI / 2; rim.scale.set(1.2, 0.75, 1); return { g, water: w }; }
  function kettle(parent, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); const m = litM(null, 0x2a2a30);
    L.mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.2, 10), m, 0, 0.1, 0, g); L.mesh(new THREE.ConeGeometry(0.12, 0.08, 10), m, 0, 0.24, 0, g); const sp = L.mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.18, 6), m, 0.15, 0.14, 0, g); sp.rotation.z = -0.9;
    L.mesh(new THREE.TorusGeometry(0.08, 0.012, 4, 10, Math.PI), m, 0, 0.27, 0, g); return g; }
  function perfume() { const g = new THREE.Group(); L.mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.1, 8), new THREE.MeshBasicMaterial({ color: 0xc8a0e8, transparent: true, opacity: 0.85 }), 0, 0.05, 0, g);
    L.mesh(new THREE.SphereGeometry(0.03, 6, 4), litM(null, 0xd8b040), 0, 0.12, 0, g); return g; }
  function crownOf(n) { const h = headInfo(n), r = Math.max(h.rx, h.rz), g = new THREE.Group(), gold = litM(null, 0xf0c030);
    L.mesh(new THREE.CylinderGeometry(r * 1.05, r * 1.05, r * 0.5, 10, 1, true), gold, 0, r * 0.15, 0, g); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; L.mesh(new THREE.ConeGeometry(r * 0.18, r * 0.4, 4), gold, Math.sin(a) * r * 1.0, r * 0.55, Math.cos(a) * r * 1.0, g); }
    L.mesh(new THREE.SphereGeometry(r * 0.12, 6, 4), litM(null, 0xd83030), 0, r * 0.2, r * 1.05, g); return seat(n, g); }
  function feethamShower(parent, x, z) { const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g); const wood = mm(MT.darkWood, 0.4, 2), tin = litM(null, 0x8aa070);
    for (const [px, pz] of [[-0.5, -0.45], [0.5, -0.45], [-0.5, 0.45], [0.5, 0.45]]) L.box(0.07, 2.5, 0.07, wood, px, 1.25, pz, g);
    L.mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.32, 14), tin, 0, 2.62, 0, g); L.mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.04, 14), litM(null, 0x5a6a48), 0, 2.79, 0, g);
    L.box(1.1, 0.06, 1.0, wood, 0, 0.03, 0, g); L.mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 6), tin, 0.62, 1.4, -0.45, g); const handle = L.box(0.4, 0.04, 0.04, litM(null, 0x3a3a40), 0.8, 1.4, -0.45, g);
    for (let i = 0; i < 9; i++) L.box(0.02, 0.05, 0.012, litM(null, 0x7a7a80), 0.18, 2.4 - i * 0.055, 0.1, g);
    const back = L.box(1.0, 2.3, 0.02, new THREE.MeshLambertMaterial({ color: 0xd8c8a0 }), 0, 1.25, -0.47, g); return g; }
  function bathroom(scene) { const TILE = L.cvs(16, 16, (c) => { c.fillStyle = '#f4f6f8'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#b8c4cc'; c.fillRect(0, 7, 16, 1); c.fillRect(7, 0, 1, 16); });
    const TL2 = L.cvs(16, 16, (c) => { c.fillStyle = '#5ab0a8'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#3a8a84'; c.fillRect(0, 7, 16, 1); c.fillRect(7, 0, 1, 16); });
    scene.background = new THREE.Color(0xdfe8ee); L.box(8, 0.1, 6, litM(L.rep(TL2, 10, 8), 0xffffff), 0, -0.05, 1, scene);
    L.box(8, 3.2, 0.1, litM(L.rep(TILE, 10, 4), 0xffffff), 0, 1.6, -1.2, scene); L.box(0.1, 3.2, 6, litM(L.rep(TILE, 8, 4), 0xffffff), -2.2, 1.6, 1, scene);
    const pipe = litM(null, 0xd8dce4); L.mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 6), pipe, 0.0, 2.15, -1.12, scene); const arm = L.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6), pipe, 0.0, 2.62, -0.97, scene); arm.rotation.x = Math.PI / 2;
    const head = L.mesh(new THREE.CylinderGeometry(0.13, 0.07, 0.07, 12), pipe, 0.0, 2.58, -0.78, scene);
    L.box(0.04, 2.4, 1.2, new THREE.MeshBasicMaterial({ color: 0xc8e8f0, transparent: true, opacity: 0.3 }), 0.85, 1.2, -0.55, scene);
    for (const [x, z, s] of [[-1.7, 0.6, 0.6], [1.6, 0.9, 0.55]]) pottedTree(scene, x, z, s);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(-1, 4, 3); scene.add(sun); return { head }; }
  // ===================================== production sets (user: a distinct, recognizable place for every solution, green balance) =====================================
  const tex = (w, h, fn) => { const t = L.cvs(w, h, fn); return t; };
  const MOSAIC = tex(32, 32, (c) => { for (let y = 0; y < 32; y += 2) for (let x = 0; x < 32; x += 2) { const k = ((x * 7 + y * 13) >> 2) % 5; c.fillStyle = ['#e8dcc0', '#d8c8a0', '#c86a3a', '#3a6a8a', '#e8dcc0'][k]; c.fillRect(x, y, 2, 2); }
    c.fillStyle = '#2a4a6a'; c.fillRect(0, 0, 32, 2); c.fillRect(0, 0, 2, 32); c.fillStyle = '#c86a3a'; c.fillRect(14, 14, 4, 4); });
  const PLASTER = tex(16, 16, (c) => { c.fillStyle = '#efe6d2'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#e2d8c2'; for (let i = 0; i < 10; i++) c.fillRect((i * 7) % 15, (i * 5) % 15, 2, 1); });
  const ERMINE = tex(16, 16, (c) => { c.fillStyle = '#f8f6f0'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#141418'; for (const [x, y] of [[3, 3], [11, 6], [6, 11], [13, 13]]) { c.fillRect(x, y, 1, 3); c.fillRect(x - 1, y, 3, 1); } });
  const DOUBLET = tex(16, 16, (c) => { c.fillStyle = '#7a1a1a'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#e8b840'; for (let x = 1; x < 16; x += 4) c.fillRect(x, 0, 1, 16); c.fillStyle = '#5a0e0e'; for (let y = 3; y < 16; y += 5) c.fillRect(0, y, 16, 1); });
  const LINEN = tex(16, 16, (c) => { c.fillStyle = '#f4f0e4'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#dcd6c4'; for (let x = 0; x < 16; x += 3) c.fillRect(x, 0, 1, 16); });
  function riverBank(scene) { meadow(scene); scene.fog = null; { const h = L.mesh(new THREE.SphereGeometry(4, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ map: meadowTex(32, 32, GRASS, [6, 3]), flatShading: true }), 0, -1.2, -4.6, scene); h.scale.y = 0.55; }
    L.box(10, 0.42, 2.4, new THREE.MeshLambertMaterial({ color: 0x6a5a3a }), 0, -0.25, 0.2, scene);   // the riverbed
    const water = L.box(10, 0.04, 2.4, new THREE.MeshBasicMaterial({ color: 0x3a8ad0, transparent: true, opacity: 0.72 }), 0, 0.3, 0.2, scene);
    for (const z of [-1.0, 1.4]) { const b = L.box(10, 0.32, 0.25, mm(MT.earth, 8, 0.5, 0x7a6a4a), 0, 0.12, z, scene); }
    const rip = []; for (let i = 0; i < 16; i++) { const r = L.box(0.35 + (i % 3) * 0.12, 0.02, 0.035, new THREE.MeshBasicMaterial({ color: 0xe8f8ff }), 0, 0.33, -0.75 + (i % 5) * 0.42, scene); r.userData.x0 = i * 0.61; rip.push(r); }
    for (const [x, z] of [[-0.9, -0.3], [1.1, 0.5], [-1.6, 0.8]]) { const o = L.mesh(new THREE.DodecahedronGeometry(0.16, 0), mm(MT.stone, 1, 1), x, 0.3, z, scene); o.rotation.set(x, z, 0); const f = L.mesh(new THREE.TorusGeometry(0.2, 0.03, 4, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }), x, 0.33, z, scene); f.rotation.x = Math.PI / 2; }
    for (const [x, z, r] of [[-1.5, -1.0, 0.22], [1.6, -0.95, 0.18], [-1.9, 1.4, 0.2], [1.9, 1.45, 0.24]]) { const o = L.mesh(new THREE.DodecahedronGeometry(r, 0), mm(MT.stone, 1, 1), x, 0.32, z, scene); o.rotation.set(x, z, 0); }
    leafTree(scene, -2.4, -1.8, 3.4); leafTree(scene, 2.6, -2.0, 3.8, { blossom: true }); bush(scene, -1.2, -1.5, 0.45); bush(scene, 1.3, -1.6, 0.4);
    for (let i = 0; i < 10; i++) { const r = L.box(0.03, 0.4 + (i % 3) * 0.1, 0.03, L.basic(null, 0x4a8a3a), -2.4 + i * 0.5, 0.45, -1.05 + (i % 2) * 0.08, scene); r.rotation.z = (i % 2 ? 0.15 : -0.1); }
    return { water, rip }; }
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
    for (const s2 of [-1, 1]) { L.box(0.2, 0.62, 0.2, white, s2 * 0.14, 0.31, 0, g); L.box(0.17, 0.08, 0.26, black, s2 * 0.13, 0.04, 0.04, g); L.mesh(new THREE.SphereGeometry(0.15, 8, 6), litM(L.rep(DOUBLET, 1, 1), 0xffffff), s2 * 0.13, 0.72, 0, g); }
    { const d = L.mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.64, 10), litM(L.rep(DOUBLET, 2, 2), 0xffffff), 0, 1.1, 0, g); d.scale.set(1, 1, 0.68); }   // broad barrel doublet
    { const b = L.mesh(new THREE.SphereGeometry(0.33, 10, 8), litM(L.rep(DOUBLET, 2, 2), 0xffffff), 0, 1.0, 0.1, g); b.scale.set(1.05, 0.95, 0.75); }   // the belly: a full, closed front
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
  function doctorOf(n) { labCoat(n, 0x2a2a34); const h = headInfo(n), r = Math.max(h.rx, h.rz), g = new THREE.Group(); L.mesh(new THREE.CylinderGeometry(r * 1.2, r * 1.12, r * 0.4, 10), litM(null, 0x18181c), 0, -r * 0.22, 0, g);
    L.box(r * 0.9, r * 0.18, 0.01, litM(null, 0xf4f0e8), 0, -r * 1.75, h.rz * 1.05, g); seat(n, g); return n; }
  // ---- the linen shirt worn OVER her armour: a loose smock shell parented to her chest bone (placed once, after the pose)
  function wearShirt(ch) { let chest = null; ch.root.traverse((o) => { if (!chest && o.isBone && o.name === 'Chest') chest = o; });
    const g = new THREE.Group(); const m = new THREE.MeshLambertMaterial({ map: L.rep(LINEN, 3, 2), side: THREE.DoubleSide, flatShading: true });
    const body = L.mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.5, 10, 1, true), m, 0, -0.1, 0, g); body.scale.set(1.2, 1, 0.9);
    L.mesh(new THREE.CylinderGeometry(0.09, 0.2, 0.06, 10, 1, true), m, 0, 0.17, 0, g).scale.set(1.2, 1, 0.9);   // shoulders
    for (const s2 of [-1, 1]) { const sl = L.mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.14, 8, 1, true), m, s2 * 0.25, 0.08, 0, g); sl.rotation.z = s2 * 0.35; }
    L.mesh(new THREE.TorusGeometry(0.09, 0.02, 4, 10), m, 0, 0.19, 0.01, g).rotation.x = Math.PI / 2;
    let done = false; const f = () => { if (done) return; done = true; ch.root.updateMatrixWorld(true); const p = chest.getWorldPosition(V3([0, 0, 0])); g.position.copy(p).add(V3([0, 0.02, 0])); g.rotation.y = ch.root.rotation.y; ch.root.parent.add(g); g.updateMatrixWorld(true); chest.attach(g); }; f.mat = m; return f; }
  function perfume2() { const g = new THREE.Group(); const gl = new THREE.MeshBasicMaterial({ color: 0xd8a8f0, transparent: true, opacity: 0.85 });
    const b = L.mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.09, 6), gl, 0, 0.045, 0, g); L.mesh(new THREE.SphereGeometry(0.055, 6, 4), gl, 0, 0.09, 0, g).scale.y = 0.5;
    L.mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 6), litM(null, 0xe0b840), 0, 0.13, 0, g); const tb = L.box(0.07, 0.01, 0.01, litM(null, 0xe0b840), 0.04, 0.15, 0, g);
    L.mesh(new THREE.SphereGeometry(0.03, 6, 4), litM(null, 0xe85a8a), 0.085, 0.15, 0, g).scale.set(1, 1.3, 1); return g; }
  // ---- water streams (volumes, not decals): a tapered translucent column + the splash ring
  function stream(scene, a, b, col = 0xbfe8ff, r0 = 0.06, r1 = 0.16) { const len = a.distanceTo(b); const m = L.mesh(new THREE.CylinderGeometry(r1, r0, len, 10, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }), 0, 0, 0, scene);
    m.position.copy(a).lerp(b, 0.5); m.quaternion.setFromUnitVectors(V3([0, 1, 0]), a.clone().sub(b).normalize());
    const drops = []; for (let i = 0; i < 14; i++) drops.push(L.mesh(new THREE.IcosahedronGeometry(0.018, 0), new THREE.MeshBasicMaterial({ color: col }), 0, 0, 0, scene));
    const f = (t) => { const q = q15(t); drops.forEach((d, i) => { const k = ((q * 1.8 + i / 14) % 1); d.position.copy(a).lerp(b, k).add(V3([Math.sin(i * 2.1) * (r0 + (r1 - r0) * k), 0, Math.cos(i * 1.7) * (r0 + (r1 - r0) * k)])); }); }; f.set = (v) => { m.visible = v; drops.forEach((d) => { d.visible = v; }); }; return f; }
  function headPos(ch) { let hd = null; ch.root.traverse((o) => { if (!hd && o.isBone && o.name === 'Head') hd = o; }); ch.root.updateMatrixWorld(true); return hd.getWorldPosition(V3([0, 0, 0])); }
  // Henry VIII (user v2): an EXISTING lib NPC, only a crown on the head + a royal cape (red, ermine trim) around the shoulders, both parented to it
  function royalCape(n) { const h = headInfo(n), H = h.top, r = Math.max(h.rx, h.rz), g = new THREE.Group(); g.position.set(h.cx, 0, h.cz); n.add(g);
    const red = new THREE.MeshLambertMaterial({ color: 0xb01a2a, side: THREE.DoubleSide, flatShading: true }), erm = litM(L.rep(ERMINE, 4, 1), 0xffffff); erm.side = THREE.DoubleSide;
    L.mesh(new THREE.CylinderGeometry(r * 1.55, r * 2.25, H * 0.66, 12, 1, true, Math.PI * 0.32, Math.PI * 1.36), red, 0, H * 0.43, -r * 0.1, g);   // open at the front
    L.mesh(new THREE.CylinderGeometry(r * 2.27, r * 2.27, H * 0.05, 12, 1, true, Math.PI * 0.32, Math.PI * 1.36), erm, 0, H * 0.12, -r * 0.1, g);   // ermine hem
    const col = L.mesh(new THREE.TorusGeometry(r * 1.45, r * 0.28, 5, 14), litM(L.rep(ERMINE, 3, 1), 0xffffff), 0, H * 0.76, -r * 0.05, g); col.rotation.x = Math.PI / 2; col.scale.set(1.05, 0.8, 1);   // ermine collar on the shoulders
    n.updateMatrixWorld(true); (n.bones.Bone000 || n).attach(g); return n; }
  function plagueDoctor(n) { const h = headInfo(n), H = h.top, r = Math.max(h.rx, h.rz), g = new THREE.Group(); g.position.set(h.cx, 0, h.cz); n.add(g); const blk = new THREE.MeshLambertMaterial({ color: 0x1e1e26, side: THREE.DoubleSide, flatShading: true });
    L.mesh(new THREE.CylinderGeometry(r * 1.4, r * 2.1, H * 0.74, 10, 1, true), blk, 0, H * 0.4, 0, g);   // long waxed robe to the floor
    L.mesh(new THREE.CylinderGeometry(r * 1.42, r * 1.42, H * 0.04, 10), litM(null, 0x3a2a1a), 0, H * 0.5, 0, g);   // belt
    const bk = L.box(r * 1.1, r * 1.4, r * 0.35, litM(null, 0x6a2a1a), r * 0.9, H * 0.52, r * 1.9, g); bk.rotation.y = -0.3; L.box(r * 1.0, r * 1.3, r * 0.37, litM(null, 0xf0e8d0), r * 0.86, H * 0.52, r * 1.9, g).rotation.y = -0.3;   // the medical book
    const fl = new THREE.Group(); fl.position.set(-r * 1.25, H * 0.5, r * 1.6); g.add(fl); L.mesh(new THREE.SphereGeometry(r * 0.45, 8, 6), new THREE.MeshBasicMaterial({ color: 0x5ac85a, transparent: true, opacity: 0.85 }), 0, 0, 0, fl); L.box(r * 0.2, r * 0.4, r * 0.2, litM(null, 0xc8a070), 0, r * 0.55, 0, fl);   // a flask of medicine
    n.updateMatrixWorld(true); (n.bones.Bone000 || n).attach(g);
    const hat = new THREE.Group(); L.mesh(new THREE.CylinderGeometry(r * 1.65, r * 1.65, r * 0.12, 14), litM(null, 0x18181c), 0, -r * 0.3, 0, hat); L.mesh(new THREE.CylinderGeometry(r * 0.95, r * 1.1, r * 0.9, 12), litM(null, 0x18181c), 0, r * 0.1, 0, hat);
    L.mesh(new THREE.CylinderGeometry(r * 1.11, r * 1.11, r * 0.16, 12), litM(null, 0x6a4a2a), 0, -r * 0.18, 0, hat); seat(n, hat); return n; }   // wide-brimmed period hat, seated on the head
  function strigil2() { const g = new THREE.Group(), st = litM(null, 0xc8d2dc), ed = null;
    const bl = L.mesh(new THREE.TorusGeometry(0.13, 0.03, 5, 14, Math.PI * 0.85), st, 0, 0.16, 0, g); bl.rotation.z = Math.PI * 0.55;    // bright silver blade with a dark rim
    L.box(0.04, 0.09, 0.04, litM(null, 0x6a4020), 0, 0.03, 0, g); return g; }
  function faceUp(ch, a) { let hd = null; ch.root.traverse((o) => { if (!hd && o.isBone && o.name === 'Head') hd = o; }); hd.rotation.x -= a; }   // hair off the face: lift the chin a little
  const IN = (ch, y) => { ch.root.position.y = y; }; const SIDE = /side/.test(location.search);
  // ---- level steps (word times) ----
  LV.push([ws(2, 'freezing'), 1], [ws(3, 'strigil'), 2], [ws(5, 'dry'), 3], [ws(7, 'again'), 4], [ws(8, 'shower'), 5]);
  for (const [tt] of LV) cue(tt, 'meter');
  const KNEEL_IN = (t, t0) => [still('kneel', 1.5)]; const SIT_IN = () => [still('sit_floor', 1.5)];
  // ===== 1. "There were no showers… so 500 years ago, you could go months without a full bath."  a period bedroom (sepia), flies; meter 0
  SH([1, 'Five'], 'C', (t0) => { const scene = new THREE.Scene(); periodBedroom(scene); const ch = hero(scene, { p: [0.45, 0, 0.75], ry: -0.15 }); sepia(scene, [ch]); const cam = CAM([[0.4, 1.1, 4.1], [0.38, 1.08, 3.9]], [[0.35, 1.05, 0.3]], 46); const mt = meter(scene, cam);
    const tM = ws(1, 'months'); const fx = new FX(LW, LH).add('flies', { obj: ch.root, bone: 'Head', offset: [0, 0.2, 0], t0: t0 + 0.3, dur: 99, n: 4, scale: 1.5 }); cue(t0 + 0.2, 'buzz'); const lab = label3D(scene, 'NO SHOWERS', 0, 0, 0, t0 + 0.25, { size: 0.15 });
    const lab2 = label3D(scene, 'MONTHS', 0, 0, 0, tM, { size: 0.13 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); lab2(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('look_around', t0 + 1.2, { fade: 0.15 })], [[-99, 'open', 'neutral'], [tM, 'surprised', 'gasp']]); } }; });
  // ===== 2. "And you'd smell."  closer: green stink lines + flies; she shakes her head, disgusted
  SH([1, 'And'], 'C', (t0) => { const scene = new THREE.Scene(); periodBedroom(scene); const ch = hero(scene, { p: [0.45, 0, 0.75], ry: -0.15 }); sepia(scene, [ch]); const cam = CAM([[1.2, 1.3, 2.7], [1.15, 1.3, 2.6]], [[0.4, 1.3, 0.5]], 44); const mt = meter(scene, cam);
    const fx = new FX(LW, LH).add('stink', { obj: ch.root, bone: 'Head', offset: [0, 0.1, 0.1], t0, dur: 99 }).add('flies', { obj: ch.root, bone: 'Head', offset: [0, 0.25, 0], t0, dur: 99, n: 3, scale: 1.5 }); cue(t0 + 0.1, 'sniff');
    return { scene, cam, fx, upd(t) { mt(t); ch.drive(t, [seg('shake_head', t0 - 0.1)], [[-99, 'disgust', 'disgust']]); } }; });
  // ===== 3. "First, the river. Free… but freezing."  she wades in, shivers; frost + teeth chatter; meter 1
  SH([2, 'First'], 'C', (t0) => { const scene = new THREE.Scene(); const RB = riverBank(scene); const ch = hero(scene, { p: [0.0, 0, 0.35], ry: -0.45 }); sepia(scene, [ch]); const cam = CAM([[0.15, 0.85, 3.4], [0.13, 0.84, 3.2]], [[0, 1.2, 0.3]], 46); const mt = meter(scene, cam);
    const tF = ws(2, 'freezing'); cue(t0 + 0.1, 'splash'); cue(tF, 'shiver_brr'); cue(tF + 0.3, 'teeth'); const lab = label3D(scene, 'RIVER', 0, 0, 0, t0 + 0.2, { size: 0.16 });
    const fx = new FX(LW, LH).add('snow', { world: [0, 1.4, 0.4], t0: tF, dur: 99 }).add('shake', { obj: ch.root, bone: 'Head', offset: [0.22, 0.1, 0], t0: tF, dur: 99 }).add('splash', { world: [0, 0.32, 0.45], t0: t0 + 0.1, dur: 0.8 }).add('steam', { obj: ch.root, bone: 'Head', offset: [0.2, -0.12, 0.12], t0: tF, dur: 99, every: 0.5, life: 0.8, rise: 10, color: '#e8f4ff', edge: '#a8c8d8' });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); RB.rip.forEach((r) => { r.position.x = ((r.userData.x0 + q15(t) * 0.5) % 5) - 2.5; }); ch.root.position.z = 0.35 - 0.2 * smooth((q15(t) - t0) / 0.8); ch.drive(t, q15(t) < tF ? [seg('walk', -99, { loop: true, speed: 0.5 })] : [seg('shiver', tF, { loop: true })], [[-99, 'open', 'smile'], [tF, 'surprised', 'frown']]); } }; });
  // ===== 4. "Rome had public baths."  the thermae: columns, arches, mosaic, steaming pool; she sits in the pool (kneels, water to the chest)
  SH([3, 'Rome'], 'C', (t0) => { const scene = new THREE.Scene(); thermae(scene); const ch = hero(scene, { p: [0.0, 0.0, -0.2], ry: 0.1 }); sepia(scene, [ch]); const cam = CAM(SIDE ? [[3.8, 1.0, -0.2]] : [[0.25, 0.95, 3.6], [0.22, 0.95, 3.4]], [[0.0, 0.8, -0.25]], 50); const mt = meter(scene, cam);
    const lab = label3D(scene, 'ROMAN BATHS', 0, 0, 0, t0 + 0.2, { size: 0.15 }); cue(t0 + 0.1, 'water_amb'); cue(t0 + 0.2, 'splash');
    const fx = new FX(LW, LH).add('steam', { world: [-0.8, 0.45, -0.3], t0, dur: 99, every: 0.3, life: 1.6, rise: 50, color: '#ffffff', edge: '#c8d8e0' }).add('steam', { world: [0.8, 0.45, -0.4], t0: t0 + 0.2, dur: 99, every: 0.35, life: 1.6, rise: 50, color: '#ffffff', edge: '#c8d8e0' });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, KNEEL_IN(t, t0), [[-99, 'open', 'smile'], [t0 + 0.6, 'open', 'smileOpen']]); } }; });
  // ===== 5. "No soap: you oiled your skin and scraped it off with a curved metal stick. This is a strigil."  hands together in front of her: the flask pours oil (gleam), then the big silver strigil scrapes along her arm; meter 2
  SH([3, 'No'], 'C', (t0) => { const scene = new THREE.Scene(); thermae(scene); const ch = hero(scene, { p: [0.0, 0, 1.15], ry: 0.1 }); sepia(scene, [ch]); const cam = CAM([[0.05, 1.4, 3.3], [0.04, 1.39, 3.15]], [[0.0, 1.3, 0.9]], 46); const mt = meter(scene, cam);
    const sg = strigil2(); sg.scale.setScalar(1.05); scene.add(sg); const fl = oilFlask(); fl.scale.setScalar(1.0); scene.add(fl); const fp = V3([0, 0, 0]), fq = V3([0, 0, 0]);
    const tS = ws(3, 'strigil'), tO = ws(3, 'oiled'), tSc = ws(3, 'scraped'); cue(tO, 'oil_pour'); cue(tSc, 'scrape'); cue(tSc + 0.6, 'scrape'); const lab = label3D(scene, 'STRIGIL', 0, 0, 0, tS, { size: 0.15 }); const lab2 = label3D(scene, 'OIL', 0, 0, 0, tO, { size: 0.12, slot: 1, front: 0xffd84a, side: 0x8a6a1a });
    const gl = new THREE.Group(); scene.add(gl); for (let i = 0; i < 4; i++) L.box(0.05, 0.012, 0.012, new THREE.MeshBasicMaterial({ color: 0xfff6a0 }), 0, i * 0.03, 0, gl);
    const fx = new FX(LW, LH).add('drip', { target: fl, offset: [0.1, 0.02, 0], t0: tO, dur: tSc - tO, color: '#f0c840' }).add('sparkle', { target: gl, offset: [0, 0.03, 0.03], t0: tO + 0.3, dur: tSc - tO, n: 5, radius: 14, color: '#fff2a0' })
      .add('sparkle', { target: sg, offset: [0, 0.2, 0.03], t0: tS, dur: 99, n: 4, radius: 16, color: '#ffffff' }).add('drip', { target: sg, offset: [0, 0.05, 0.03], t0: tSc, dur: tS - tSc, color: '#8a6a3a' });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); lab2(t); const q = q15(t); ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'smile'], [tO, 'open', 'smileOpen'], [tS, 'open', 'smileOpen']]);
      scene.updateMatrixWorld(true); ch.fist('R', fp); ch.fist('L', fq); const oil = q >= tO - 0.2 && q < tSc; gl.visible = q >= tO && q < tSc + 0.4; gl.position.copy(fq).lerp(fp, 0.25).add(V3([0, -0.07, 0.09]));
      if (oil) { fl.visible = true; fl.position.copy(fp).add(V3([0.0, -0.03, 0.05])); fl.rotation.set(0, 0, -1.3); } else { fl.visible = q < tO - 0.2; fl.position.set(-0.55, 0.0, 1.35); fl.rotation.set(0, 0, 0); }
      sg.visible = !oil && q >= tSc - 0.2; const dir = fq.clone().sub(fp).normalize(); sg.position.copy(fp).addScaledVector(dir, 0.04 + 0.07 * (0.5 + 0.5 * Math.sin(q * 11))).add(V3([0, 0, 0.08])); sg.lookAt(sg.position.clone().add(dir)); sg.rotateX(Math.PI / 2); sg.rotateY(Math.PI / 2); } }; });
  // ===== 6. "But the water wasn't always fresh."  the pool turns murky green, flies, bubbles; she steps back from the edge
  SH([3, 'But'], 'C', (t0) => { const scene = new THREE.Scene(); const R = thermae(scene); R.water.material.color.set(0x7a8a4a); R.water.material.opacity = 0.9; const ch = hero(scene, { p: [0.35, 0, 1.25], ry: -0.4 }); sepia(scene, [ch]);
    const cam = CAM([[0.6, 1.7, 3.9], [0.58, 1.65, 3.75]], [[0.2, 0.85, 0.2]], 50); const mt = meter(scene, cam);
    const fx = new FX(LW, LH).add('flies', { world: [0, 0.6, -0.4], t0, dur: 99, n: 6, scale: 1.6 }).add('bubbles', { world: [-0.4, 0.42, -0.4], t0, dur: 99 }).add('stink', { world: [0.3, 0.5, -0.3], t0, dur: 99 }); cue(t0 + 0.1, 'buzz'); const lab = label3D(scene, 'NOT FRESH', 0, 0, 0, ws(3, 'fresh'), { size: 0.15, front: 0xa8e85a, side: 0x5a8a2a });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, [seg('step_back', t0 + 0.1)], [[-99, 'angry', 'disgust']]); } }; });
  // ===== 7. "Medieval towns had steamy bathhouses called stews… with a bad reputation."  the timber-frame bathhouse; she sits in a tub in the steam, overheats (sparks)
  SH([4, 'Medieval'], 'C', (t0) => { const scene = new THREE.Scene(); stewsHall(scene); woodTub(scene, -1.4, -0.6, 0.55, 0.6); woodTub(scene, 1.5, -0.7, 0.55, 0.6); woodTub(scene, 0.05, 0.3, 0.62, 0.62);
    const ch = hero(scene, { p: [0.05, 0.2, 0.1], ry: 0.05 }); sepia(scene, [ch]); const cam = CAM(SIDE ? [[3.6, 1.1, 0.1]] : [[0.1, 0.95, 3.2], [0.08, 0.94, 3.0]], SIDE ? [[0.05, 0.8, 0.1]] : [[0.0, 0.85, 0.0]], 48); const mt = meter(scene, cam);
    const tS = ws(4, 'stews'), tR = ws(4, 'reputation'); cue(t0 + 0.1, 'steam_hiss'); cue(tR, 'zap'); const lab = () => {};
    const fx = new FX(LW, LH).add('steam', { world: [-0.42, 0.75, 0.25], t0, dur: 99, every: 0.25, life: 1.5, rise: 55, color: '#ffffff', edge: '#c8d0d8' }).add('steam', { world: [0.52, 0.75, 0.25], t0: t0 + 0.12, dur: 99, every: 0.25, life: 1.5, rise: 55, color: '#ffffff', edge: '#c8d0d8' }).add('steam', { world: [-1.4, 0.7, -0.6], t0, dur: 99, every: 0.3, life: 1.4, rise: 50 }).add('steam', { world: [1.5, 0.7, -0.7], t0, dur: 99, every: 0.3, life: 1.4, rise: 50 })
      .add('zap', { obj: ch.root, bone: 'Head', offset: [0.1, 0.25, 0], t0: tR, dur: 1.5 }).add('sweat', { obj: ch.root, bone: 'Head', offset: [0.2, 0.22, 0.05], t0: tS, dur: 99 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, SIT_IN(), [[-99, 'open', 'smile'], [tS, 'open', 'smileOpen'], [tR, 'surprised', 'gasp']]); } }; });
  // ===== 8. "In 1546, Henry the Eighth shut London's down."  person + year card: Henry VIII (own figure) on a plinth; a CLOSED plank across a tub
  SH([4, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); stewsHall(scene).sg.visible = false; woodTub(scene, -1.15, -0.6, 0.5, 0.58); L.box(0.9, 0.16, 0.8, mm(MT.carved, 1, 0.3), 0.95, 0.08, -0.5, scene); const hk = royalCape(npcAt(scene, 'bank_teller', 'navy', 0.95, -0.5, -0.35, 1.3)); hk.position.y = 0.16; hk.walk(0); crownOf(hk);
    const ch = hero(scene, { p: [-0.38, 0, 0.95], ry: 0.25 }); sepia(scene, [ch]); const cam = CAM([[0.15, 1.5, 4.9], [0.15, 1.48, 4.7]], [[0.15, 1.62, 0]], 50); const mt = meter(scene, cam); const tY = ws(4, '1546'), tD = ws(4, 'down');
    const y = label3D(scene, '1546', 0, 0, 0, tY, { size: 0.22, slot: 0 }); const n = label3D(scene, 'HENRY VIII', 0, 0, 0, tY + 0.25, { size: 0.13, slot: 1, front: 0xffffff, side: 0x9a8a6a });
    const plank = L.box(1.15, 0.12, 0.05, mm(MT.wood, 1, 0.2), -1.15, 0.62, -0.08, scene); plank.rotation.z = 0.3; plank.visible = false; cue(tD, 'stamp');
    const cl = letters3D(scene, 'CLOSED', { size: 0.26, x: -0.6, y: 2.0, z: -1.7, jitter: 0.6, front: 0xff6a5a, side: 0x8a2a1a }); cl.visible = false;
    return { scene, cam, upd(t) { mt(t); y(t); n(t); const c = q15(t) >= tD; plank.visible = c; cl.visible = c; ch.drive(t, [seg('point', t0 - 0.1)], [[-99, 'surprised', 'talkO']]); } }; });
  // ===== 9. "Doctors said hot water let disease in through the skin."  the period bedroom: a doctor in a long dark robe warns; she backs off from a steaming basin
  SH([5, 'Doctors'], 'C', (t0) => { const scene = new THREE.Scene(); periodBedroom(scene); const bs = woodTub(scene, 0.95, -0.55, 0.36, 0.45); const dr = plagueDoctor(npcAt(scene, 'bank_teller', 'grey', -0.3, 0.35, 0.5, 1.05)); dr.walk(0); const ld = label3D(scene, 'DOCTOR', 0, 0, 0, t0 + 0.15, { size: 0.12, slot: 1, front: 0xffffff, side: 0x9a8a6a });
    const ch = hero(scene, { p: [0.55, 0, 0.95], ry: -0.4 }); sepia(scene, [ch]); const cam = CAM([[0.15, 1.3, 4.3], [0.13, 1.28, 4.1]], [[0.12, 1.15, 0.3]], 50); const mt = meter(scene, cam); const tD = ws(5, 'disease'); cue(tD, 'sting');
    const fx = new FX(LW, LH).add('steam', { world: [0.95, 0.5, -0.55], t0, dur: 99, every: 0.3, life: 1.3, rise: 45 }).add('exclaim', { obj: ch.root, bone: 'Head', offset: [0.12, 0.42, 0], t0: tD, dur: 99 });
    const lab = label3D(scene, 'WATER DANGER?', 0, 0, 0, tD, { size: 0.12, front: 0xff8a6a, side: 0x8a2a1a });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ld(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('step_back', tD - 0.1, { fade: 0.1 })], [[-99, 'open', 'neutral'], [tD, 'surprised', 'gasp']]); } }; });
  // ===== 10. "So people wore a clean linen shirt to soak up the dirt… plus perfume. This is a dry wash."  she WEARS the linen shirt over her armour, sprays perfume (arm out to the side); meter 3
  SH([5, 'So'], 'C', (t0) => { const scene = new THREE.Scene(); periodBedroom(scene); const ch = hero(scene, { p: [-0.1, 0, 0.85], ry: -0.55 }); const pf = perfume2(); pf.scale.setScalar(1.4); scene.add(pf); const fp = V3([0, 0, 0]);
    sepia(scene, [ch, pf]); const shirt = wearShirt(ch); const cam = CAM(SIDE ? [[2.6, 1.3, 0.85]] : [[0.1, 1.25, 3.8], [0.08, 1.23, 3.65]], SIDE ? [[-0.1, 1.2, 0.85]] : [[0.05, 1.2, 0.5]], 48); const mt = meter(scene, cam);
    const tP = ws(5, 'perfume'), tW = ws(5, 'dry'); cue(ws(5, 'linen'), 'cloth'); cue(tP, 'spray'); const lab = label3D(scene, 'DRY WASH', 0, 0, 0, tW, { size: 0.15 }); const lab2 = label3D(scene, 'LINEN', 0, 0, 0, ws(5, 'linen'), { size: 0.12 });
    const fx = new FX(LW, LH).add('sparkle', { target: pf, offset: [0.05, 0.25, 0.05], t0: tP, dur: 99, n: 6, radius: 22, color: '#e8b0ff' }).add('flies', { obj: ch.root, bone: 'Head', offset: [0.0, 0.3, 0], t0: tW + 0.4, dur: 99, n: 2, scale: 1.5 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); lab2(t); ch.drive(t, [seg('point', t0 - 0.3)], [[-99, 'open', 'smile'], [tP, 'happy', 'smileOpen'], [tW + 0.4, 'open', 'frown']]); shirt(); const kd = Math.min(1, Math.max(0, (q15(t) - ws(5, 'dirt')) / 1.2)); shirt.mat.color.setRGB(1 - 0.28 * kd, 1 - 0.38 * kd, 1 - 0.55 * kd); scene.updateMatrixWorld(true); ch.fist('L', fp); pf.position.copy(fp).add(V3([0.0, -0.03, 0.03])); } }; });
  // ===== 11. "Later, the tin tub, filled pot by pot… and the whole family shared the water."  the cottage kitchen: kettle on the hearth, family waiting in line; she sits in the tub
  SH([6, 'Later'], 'C', (t0) => { const scene = new THREE.Scene(); const K0 = cottageKitchen(scene); const T0 = tinTub(scene, 0.05, 0.4); T0.g.scale.setScalar(1.4); for (const s2 of [-1, 1]) { const hd = L.mesh(new THREE.TorusGeometry(0.08, 0.018, 4, 8, Math.PI), litM(null, 0xd8dce4), s2 * 0.76, 0.36, 0, T0.g); hd.rotation.y = Math.PI / 2; }
    const mum = npcAt(scene, 'art_student', 'teal', -0.82, 0.42, 1.35, 0.95); mum.walk(0); npcSet(mum, 'Bone004', -1.25); const kt = kettle(scene, 0, 0, 0); kt.scale.setScalar(1.1); const hp0 = npcHand(mum, 'R'); kt.position.copy(hp0).add(V3([0.02, -0.14, 0])); mum.updateMatrixWorld(true); mum.bones.Bone005.attach(kt); const kr0 = kt.rotation.z; const tF0 = ws(6, 'filled'), tF1 = ws(6, 'whole');
    kt.rotation.z = kr0 - 0.8; scene.updateMatrixWorld(true); const sp = kt.localToWorld(V3([0.24, 0.2, 0])); kt.rotation.z = kr0; const pour = stream(scene, sp, V3([sp.x + 0.04, 0.45, sp.z]), 0xbfe0f0, 0.03, 0.06);
    const fxP = new FX(LW, LH);
    const fam = [['bank_teller', 'grey', 0.8, -0.45, 0.95], ['homework_girl', 'red', 1.05, -0.72, 0.8], ['art_student', 'violet', 1.25, -0.98, 0.68], ['homework_girl', 'blue', 1.42, -1.2, 0.42]].map(([id, v, x, z, s]) => { const n = npcAt(scene, id, v, x, z, -0.9, s); n.walk(0); return n; });
    const ch = hero(scene, { p: [0.05, 0.17, 0.2], ry: 0.25 }); sepia(scene, [ch]); const cam = CAM(SIDE ? [[3.6, 1.0, 0.3]] : [[0.2, 1.5, 4.8], [0.2, 1.48, 4.6]], SIDE ? [[-0.2, 0.7, 0.3]] : [[0.2, 0.95, 0.0]], 52); const mt = meter(scene, cam);
    const tS = ws(6, 'shared'); cue(t0 + 0.1, 'water_pour'); cue(ws(6, 'pot'), 'water_pour'); const lab = label3D(scene, 'TIN TUB', 0, 0, 0, t0 + 0.2, { size: 0.15 });
    const fx = new FX(LW, LH).add('steam', { world: [-1.25, 1.3, -1.45], t0, dur: 99, every: 0.35, life: 1.2, rise: 30 }).add('splash', { world: [sp.x + 0.04, 0.47, sp.z], t0: tF0, dur: tF1 - tF0, color: '#bfe0f0' });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); K0.H0.userData.tick(t); { const on = q15(t) >= tF0 && q15(t) < tF1; pour(t); pour.set(on); kt.rotation.z = kr0 + (on ? -0.8 : 0); } T0.water.material.color.set(q15(t) >= tS ? 0x8a7a50 : 0x8a9aa0); ch.drive(t, SIT_IN(), [[-99, 'happy', 'smile'], [tS, 'surprised', 'talkO']]); } }; });
  // ===== 12. "The story goes, the baby went last."  closer: the murky tub, she in it, disgusted; stink
  SH([6, 'The', 4], 'C', (t0) => { const scene = new THREE.Scene(); cottageKitchen(scene); const T0 = tinTub(scene, 0.15, 0.4, 0x6a5a38); T0.g.scale.setScalar(1.4); for (const s2 of [-1, 1]) { const hd = L.mesh(new THREE.TorusGeometry(0.08, 0.018, 4, 8, Math.PI), litM(null, 0xd8dce4), s2 * 0.76, 0.36, 0, T0.g); hd.rotation.y = Math.PI / 2; } const ch = hero(scene, { p: [0.15, 0.17, 0.2], ry: 0.15 }); sepia(scene, [ch]);
    const cam = CAM([[0.4, 1.3, 3.5], [0.38, 1.28, 3.35]], [[0.42, 0.85, 0.4]], 50); const mt = meter(scene, cam); const tB = ws(6, 'baby'); cue(tB, 'gasp');
    const fx = new FX(LW, LH).add('stink', { world: [0.55, 0.6, 0.6], t0, dur: 99 }).add('flies', { world: [0.5, 0.75, 0.55], t0, dur: 99, n: 3, scale: 1.5 });
    const lab = label3D(scene, 'BABY LAST', 0, 0, 0, tB, { size: 0.13 }); const bb = npcAt(scene, 'bank_teller', 'grey', 0.78, 0.55, -0.75, 0.95); bb.walk(0); npcSet(bb, 'Bone002', -1.1); npcSet(bb, 'Bone004', -1.1); const bh = npcHand(bb, 'R').lerp(npcHand(bb, 'L'), 0.5);
    const baby = new THREE.Group(); baby.position.copy(bh).add(V3([0, 0.06, 0.04])); scene.add(baby); L.mesh(new THREE.SphereGeometry(0.1, 8, 6), litM(null, 0xf4f0f8), 0, 0, 0, baby).scale.set(1.7, 0.85, 0.9); L.mesh(new THREE.SphereGeometry(0.065, 8, 6), litM(null, 0xf0c8a8), 0.17, 0.03, 0.02, baby);
    for (const s2 of [-1, 1]) L.box(0.012, 0.012, 0.005, litM(null, 0x18181c), 0.19 + s2 * 0.0, 0.05, 0.08 + s2 * 0.0, baby); L.mesh(new THREE.SphereGeometry(0.067, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), litM(null, 0xa8c8f0), 0.17, 0.045, 0.02, baby);
    bb.updateMatrixWorld(true); bb.bones.Bone005.attach(baby);
    fx.add('question', { target: baby, offset: [0.1, 0.25, 0], t0: tB, dur: 99 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, SIT_IN(), [[-99, 'disgust', 'disgust']]); } }; });
  // ===== 13. "In 1767, William Feetham patented a shower: pump water up by hand, pull a chain…"  a Georgian room; she stands in the hand-pump shower and pulls the chain
  SH([7, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); georgianRoom(scene); feethamShower(scene, 0.3, -0.35); const ch = hero(scene, { p: [0.3, 0.06, -0.3], ry: 0.0 }); sepia(scene, [ch]);
    const cam = CAM([[0.3, 1.45, 4.3], [0.3, 1.43, 4.1]], [[0.3, 1.55, 0]], 52); const mt = meter(scene, cam); const tY = ws(7, '1767'), tC = ws(7, 'chain');
    const y = label3D(scene, '1767', 0, 0, 0, tY, { size: 0.2, slot: 0 }); const n = label3D(scene, 'W. FEETHAM', 0, 0, 0, tY + 0.25, { size: 0.11, slot: 1, front: 0xffffff, side: 0x9a8a6a }); cue(ws(7, 'pump'), 'pump'); cue(tC, 'chain_pull');
    const tPm = ws(7, 'pump'); const lever = L.box(0.05, 1, 0.05, litM(null, 0x3a3a40), 0, 0, 0, scene), pv = V3([0.85, 1.25, -0.2]); L.mesh(new THREE.SphereGeometry(0.05, 6, 4), litM(null, 0x3a3a40), 0.85, 1.25, -0.2, scene);
    const links = []; for (let i = 0; i < 12; i++) links.push(L.box(0.025, 0.06, 0.015, litM(null, 0x8a8a90), 0, 0, 0, scene)); const top = V3([0.3, 2.44, -0.25]), fa = V3([0, 0, 0]), fb = V3([0, 0, 0]);
    return { scene, cam, upd(t) { mt(t); y(t); n(t); const q = q15(t); ch.drive(t, q < tPm - 0.2 ? [seg('idle', -99, { loop: true })] : q < tC - 0.2 ? [seg('pull_chain', tPm - 0.2, { loop: true, speed: 1.4 })] : [seg('pull_chain', tC - 0.2)], [[-99, 'open', 'smile'], [tPm, 'happy', 'talkO'], [tC, 'happy', 'smileOpen']]);
      scene.updateMatrixWorld(true); ch.fist('L', fa); ch.fist('R', fb); const hi = fa.y > fb.y ? fa : fb; const pumping = q >= tPm - 0.2 && q < tC - 0.2; const lt = pumping ? (fa.x > fb.x ? fa : fb) : V3([1.05, 0.95, -0.2]);
      lever.position.copy(pv).lerp(lt, 0.5); lever.scale.y = pv.distanceTo(lt); lever.quaternion.setFromUnitVectors(V3([0, 1, 0]), lt.clone().sub(pv).normalize());
      const end = q >= tC - 0.2 ? hi : V3([0.48, 1.75, -0.25]); links.forEach((l, i) => { l.position.copy(top).lerp(end, (i + 0.5) / links.length); l.rotation.y = i % 2 ? 1.57 : 0; }); } }; });
  // ===== 14. "…and the same dirty water falls again."  a brown stream from the tank onto her; wet-android sparks; meter 4
  SH([7, 'and'], 'C', (t0) => { const scene = new THREE.Scene(); georgianRoom(scene); feethamShower(scene, 0.0, -0.35); const ch = hero(scene, { p: [0.0, 0.06, -0.3], ry: 0.0 }); sepia(scene, [ch]);
    const cam = CAM([[0.05, 1.55, 3.4], [0.05, 1.53, 3.25]], [[0.0, 1.5, -0.3]], 50); const mt = meter(scene, cam); const tA = ws(7, 'again'); cue(t0 + 0.1, 'water_splash'); cue(tA, 'zap');
    const hp = headPos(ch); const st = stream(scene, V3([0, 2.44, -0.33]), V3([hp.x, hp.y + 0.22, hp.z]), 0x8a6a3a, 0.08, 0.18);
    const fx = new FX(LW, LH).add('splash', { obj: ch.root, bone: 'Head', offset: [0, 0.25, 0], t0, dur: 99, color: '#8a6a3a' }).add('zap', { obj: ch.root, bone: 'Head', offset: [0.12, 0.1, 0.05], t0: tA, dur: 2 });
    const lab = label3D(scene, 'SAME WATER', 0, 0, 0, tA - 0.4, { size: 0.13 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); st(t); ch.drive(t, [seg('shiver', t0 - 0.1, { loop: true })], [[-99, 'disgust', 'disgust'], [tA, 'surprised', 'gasp']]); } }; });
  // ===== 15. "Then came pipes and water heaters. Hot water, any time. This is a shower."  the modern bathroom: a big clear stream over her, steam; meter 5 FRESH
  SH([8, 'Then'], 'C', (t0) => { const scene = new THREE.Scene(); const B = bathroom(scene); { const wh = litM(null, 0xf4f4f0), cu = litM(null, 0xc87a3a), ch2 = litM(null, 0xd8dce4);
      L.mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.8, 12), wh, -0.75, 1.95, -0.92, scene); L.mesh(new THREE.SphereGeometry(0.24, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), wh, -0.75, 2.35, -0.92, scene); L.box(0.12, 0.08, 0.02, litM(null, 0xe84a3a), -0.75, 1.9, -0.67, scene);
      L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), cu, -0.75, 2.66, -0.92, scene); L.box(0.06, 0.06, 0.24, cu, -0.75, 2.76, -1.02, scene); L.box(0.78, 0.06, 0.06, cu, -0.37, 2.76, -1.12, scene);   // heater -> hot pipe -> the shower riser
      L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.55, 8), cu, -0.75, 0.78, -1.1, scene);   // supply pipe down into the floor
      L.mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.15, 8), ch2, 0.0, 2.2, -1.12, scene); const a2 = L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.38, 8), ch2, 0.0, 2.74, -0.95, scene); a2.rotation.x = Math.PI / 2;   // riser + arm
      L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), ch2, 0.0, 2.69, -0.77, scene); L.mesh(new THREE.CylinderGeometry(0.2, 0.09, 0.09, 14), ch2, 0.0, 2.6, -0.77, scene);   // the big shower head, hanging from the arm
      for (const [x, c] of [[-0.12, 0xe84a3a], [0.12, 0x4a8ae8]]) { L.mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 8), litM(null, c), x, 1.2, -1.12, scene).rotation.x = Math.PI / 2; } B.head.visible = false; }
    pottedTree(scene, -0.95, -0.85, 0.55); pottedTree(scene, 1.35, -0.8, 0.55); const ch = hero(scene, { p: [0.0, 0, -0.62], ry: 0.15 }); const cam = CAM([[0.1, 1.3, 3.6], [0.08, 1.3, 3.4]], [[0.0, 1.3, -0.5]], 52); const mt = meter(scene, cam);
    const tS = ws(8, 'shower'); cue(t0 + 0.2, 'shower_run'); cue(tS, 'sting'); const lab = label3D(scene, 'SHOWER', 0, 0, 0, tS, { size: 0.17 }); const lab2 = label3D(scene, 'FRESH', 0, 0, 0, tS + 0.4, { size: 0.12, front: 0x9cf09c, side: 0x3a8a4a });
    const hp = headPos(ch); const st = stream(scene, V3([0.0, 2.55, -0.77]), V3([hp.x, hp.y + 0.22, hp.z]), 0xbfe8ff, 0.1, 0.24);
    const fx = new FX(LW, LH).add('splash', { obj: ch.root, bone: 'Head', offset: [0, 0.25, 0], t0, dur: 99, color: '#bfe8ff' }).add('drip', { obj: ch.root, bone: 'Head', offset: [-0.2, -0.25, 0.05], t0, dur: 99, color: '#bfe8ff' }).add('drip', { obj: ch.root, bone: 'Head', offset: [0.2, -0.25, 0.05], t0: t0 + 0.2, dur: 99, color: '#bfe8ff' }).add('steam', { world: [0.0, 1.4, -0.5], t0: t0 + 0.4, dur: 99, every: 0.3, life: 1.3, rise: 40, color: '#ffffff', edge: '#c8d8e0' }).add('sparkle', { obj: ch.root, bone: 'Head', offset: [0.15, 0.1, 0.1], t0: tS, dur: 99, n: 4, radius: 18 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); lab2(t); st(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('cheer', tS - 0.1, { fade: 0.12 })], [[-99, 'relaxed', 'smile'], [tS, 'happy', 'smileOpen']]); } }; });
  // ===== 16. "Today, the average shower takes about eight minutes. Logging off."  3D "8 MIN" in the bathroom, she waves; small outro
  SH([9, 'Today'], 'C', (t0) => { const scene = new THREE.Scene(); bathroom(scene); pottedTree(scene, -1.0, -0.6, 0.6); pottedTree(scene, 1.1, -0.7, 0.6); const ch = hero(scene, { p: [-0.05, 0, 0.6], ry: 0.2 }); const cam = CAM([[0.1, 1.15, 3.6], [0.1, 1.2, 4.0]], [[0.0, 1.2, 0.3]], 48); const mt = meter(scene, cam);
    const tE = ws(9, 'eight'), tLo = ws(9, 'Logging'), tOut = TL.dur + 0.05; cue(tLo, 'blip'); cue(tOut, 'end_jingle'); const lab = label3D(scene, '8 MIN', 0, 0, 0, tE, { size: 0.26, slot: 0 });
    return { scene, cam, upd(t) { mt(t); lab(t); if (t >= tOut) cam.children.forEach((o) => { o.visible = false; }); ch.drive(t, [seg('present', t0 - 0.2), seg('wave', tLo - 0.3, { fade: 0.12 })], [[-99, 'happy', 'smileOpen'], [tLo, 'wink', 'blushSmile']]); },
      ov(o, t, c) { if (t >= tOut) { plateText(o, CHANNEL, CX, 40, { size: 12, border: '#fdd941', fg: '#fdd941', scale: popS(t, tOut) }); if (t >= tOut + 0.4) { const w = 90, h = 14, X = CX - w / 2, Y = 60; c.fillStyle = '#040412'; c.fillRect(X - 2, Y - 2, w + 4, h + 4); c.fillStyle = '#fe2c55'; c.fillRect(X, Y, w, h); bitText(c, 'FOLLOW', CX, Y + 7, 1, '#ffffff', { outline: null }); } } } }; });
