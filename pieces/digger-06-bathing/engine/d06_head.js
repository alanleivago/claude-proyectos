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
