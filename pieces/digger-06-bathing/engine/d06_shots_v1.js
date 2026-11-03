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
  // ---- level steps (word times) ----
  LV.push([ws(2, 'freezing'), 1], [ws(3, 'strigil'), 2], [ws(4, 'down'), 2, true], [ws(5, 'dry'), 3], [ws(7, 'again'), 4], [ws(8, 'shower'), 5]);
  for (const [tt] of LV) cue(tt, 'meter');
  // ===== 1. "There were no showers… so 500 years ago, you could go months without a full bath."  a medieval room, grimy; flies; meter 0
  SH([1, 'There'], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); const ch = hero(scene, { p: [0, 0, 0.6], ry: 0.1 }); sepia(scene, [ch]); const cam = CAM([[0.1, 1.15, 3.5], [0.08, 1.13, 3.3]], [[0, 1.2, 0.3]], 46); const mt = meter(scene, cam);
    const tM = ws(1, 'months'); const fx = new FX(LW, LH).add('flies', { world: [0.15, 1.2, 0.6], t0: t0 + 0.3, dur: 99, n: 4, scale: 1.5 }); cue(t0 + 0.2, 'buzz'); const lab = label3D(scene, 'NO SHOWERS', 0, 2.05, 0.2, t0 + 0.25, { size: 0.15 });
    const lab2 = label3D(scene, 'MONTHS', 0.0, 1.78, 0.25, tM, { size: 0.13 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); lab2(t); ch.drive(t, [seg('look_around', t0 - 0.2)], [[-99, 'open', 'neutral'], [tM, 'surprised', 'gasp']]); } }; });
  // ===== 2. "And you'd smell."  she sniffs, green stink lines, pinches her nose
  SH([1, 'And'], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); const ch = hero(scene, { p: [0, 0, 0.6], ry: 0.1 }); sepia(scene, [ch]); const cam = CAM([[0.9, 1.25, 2.6], [0.85, 1.25, 2.5]], [[0, 1.3, 0.4]], 44); const mt = meter(scene, cam);
    const fx = new FX(LW, LH).add('stink', { obj: ch.root, bone: 'Head', offset: [0, 0.1, 0.1], t0, dur: 99 }).add('flies', { obj: ch.root, bone: 'Head', offset: [0, 0.25, 0], t0, dur: 99, n: 3, scale: 1.5 }); cue(t0 + 0.1, 'sniff');
    return { scene, cam, fx, upd(t) { mt(t); ch.drive(t, [seg('shake_head', t0 - 0.1)], [[-99, 'disgust', 'disgust']]); } }; });
  // ===== 3. "First, the river. Free… but freezing."  knee-deep in a river on the meadow; she shivers; frost; meter 1
  SH([2, 'First'], 'C', (t0) => { const scene = new THREE.Scene(); riverSet(scene); const ch = hero(scene, { p: [0, 0, 0.35], ry: 0.15 }); const cam = CAM([[0.1, 1.1, 3.4], [0.08, 1.08, 3.2]], [[0, 1.15, 0.3]], 46); const mt = meter(scene, cam);
    const tF = ws(2, 'freezing'); cue(t0 + 0.1, 'splash'); cue(tF, 'shiver_brr'); const lab = label3D(scene, 'RIVER', 0, 1.95, 0.1, t0 + 0.2, { size: 0.16 });
    const fx = new FX(LW, LH).add('snow', { world: [0, 1.4, 0.4], t0: tF, dur: 99 }).add('shake', { obj: ch.root, bone: 'Head', offset: [0, -0.1, 0], t0: tF, dur: 99 }).add('splash', { world: [0, 0.2, 0.45], t0: t0 + 0.1, dur: 0.8 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, q15(t) < tF ? [seg('idle', -99, { loop: true })] : [seg('shiver', tF, { loop: true })], [[-99, 'happy', 'smile'], [tF, 'surprised', 'talkO']]); } }; });
  // ===== 4. "Rome had public baths."  the Roman pool, columns; she presents it (sepia)
  SH([3, 'Rome'], 'C', (t0) => { const scene = new THREE.Scene(); const R = romanSet(scene); const ch = hero(scene, { p: [-0.6, 0, 0.75], ry: 0.4 }); sepia(scene, [ch]); const cam = CAM([[0.2, 1.5, 4.2], [0.15, 1.48, 4.0]], [[-0.2, 1.1, 0.0]], 52); const mt = meter(scene, cam);
    const lab = label3D(scene, 'ROME', 0.3, 2.25, -0.4, t0 + 0.2, { size: 0.2 }); cue(t0 + 0.1, 'water_amb');
    return { scene, cam, upd(t) { mt(t); lab(t); ch.drive(t, [seg('present', t0 - 0.2)], [[-99, 'happy', 'smileOpen']]); } }; });
  // ===== 5. "No soap: you oiled your skin and scraped it off with a curved metal stick. This is a strigil."  she scrapes her arm; oil flask; meter 2
  SH([3, 'No'], 'C', (t0) => { const scene = new THREE.Scene(); romanSet(scene); const ch = hero(scene, { p: [0, 0, 0.9], ry: 0.25 }); sepia(scene, [ch]); const cam = CAM([[0.15, 1.15, 3.6], [0.13, 1.13, 3.45]], [[0.05, 1.2, 0.7]], 44); const mt = meter(scene, cam);
    const sg = strigil(); sg.scale.setScalar(1.6); scene.add(sg); const fl = oilFlask(); fl.position.set(0.55, 0.0, 0.75); fl.scale.setScalar(1.8); scene.add(fl); const fp = V3([0, 0, 0]);
    const tS = ws(3, 'strigil'), tO = ws(3, 'oiled'); cue(tO, 'oil_pour'); cue(ws(3, 'scraped'), 'scrape'); const lab = label3D(scene, 'STRIGIL', 0.1, 1.95, 0.5, tS, { size: 0.15 });
    const fx = new FX(LW, LH).add('sparkle', { obj: ch.root, bone: 'Head', offset: [0.2, -0.2, 0.1], t0: tO, dur: 99, n: 3, radius: 14, color: '#fff2a0' });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, [seg('hold_up_object', t0 - 0.3)], [[-99, 'open', 'smile'], [tS, 'happy', 'smileOpen']]); scene.updateMatrixWorld(true); ch.fist('R', fp); sg.position.copy(fp).add(V3([0, 0.02, 0.06])); sg.rotation.set(0, 0.3, 0.4); } }; });
  // ===== 6. "But the water wasn't always fresh."  the pool turns murky green, flies; she grimaces
  SH([3, 'But'], 'C', (t0) => { const scene = new THREE.Scene(); const R = romanSet(scene); R.water.material.color.set(0x7a8a4a); const ch = hero(scene, { p: [0.45, 0, 1.0], ry: -0.4 }); sepia(scene, [ch]); const cam = CAM([[0.4, 1.6, 3.4], [0.38, 1.55, 3.25]], [[0.3, 0.75, -0.3]], 50); const mt = meter(scene, cam);
    const fx = new FX(LW, LH).add('flies', { world: [0, 0.5, -0.6], t0, dur: 99, n: 6, scale: 1.6 }).add('bubbles', { world: [-0.4, 0.35, -0.6], t0, dur: 99 }); cue(t0 + 0.1, 'buzz'); const lab = label3D(scene, 'NOT FRESH', 0, 1.85, -0.3, ws(3, 'fresh'), { size: 0.15, front: 0xa8e85a, side: 0x5a8a2a });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, [seg('step_back', t0 + 0.1)], [[-99, 'disgust', 'disgust']]); } }; });
  // ===== 7. "Medieval towns had steamy bathhouses called stews… with a bad reputation."  wooden tubs, steam; she overheats (steam + sparks)
  SH([4, 'Medieval'], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); for (const [x, z] of [[-0.9, -0.1], [0.9, -0.2]]) woodTub(scene, x, z, 0.5, 0.6); const ch = hero(scene, { p: [0, 0, 0.75], ry: 0.05 }); sepia(scene, [ch]);
    const cam = CAM([[0.1, 1.25, 3.7], [0.08, 1.23, 3.5]], [[0, 1.15, 0]], 50); const mt = meter(scene, cam); const tS = ws(4, 'stews'), tR = ws(4, 'reputation'); cue(t0 + 0.1, 'steam_hiss'); cue(tR, 'zap');
    const fx = new FX(LW, LH).add('steam', { world: [-0.9, 0.7, -0.1], t0, dur: 99, every: 0.25, life: 1.4, rise: 50 }).add('steam', { world: [0.9, 0.7, -0.2], t0, dur: 99, every: 0.3, life: 1.4, rise: 50 }).add('zap', { obj: ch.root, bone: 'Head', offset: [0.1, 0.25, 0], t0: tR, dur: 1.5 }).add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: tS, dur: 99 });
    const lab = label3D(scene, 'STEWS', 0, 2.0, -0.3, tS, { size: 0.17 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, [seg('warm_hands', t0 - 0.2), seg('surprised', tR - 0.1, { fade: 0.12 })], [[-99, 'happy', 'smileOpen'], [tR, 'surprised', 'gasp']]); } }; });
  // ===== 8. "In 1546, Henry the Eighth shut London's down."  person + year card: the king on a plinth, extruded 1546 + HENRY VIII; a CLOSED plank over a tub
  SH([4, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); woodTub(scene, 0.85, 0.2, 0.45, 0.55); const k = npcAt(scene, 'bank_teller', 'olive', -0.45, -0.1, 0.25, 1.1); k.walk(0); crownOf(k);
    L.box(0.9, 0.14, 0.9, mm(MT.carved, 1, 0.3), -0.45, 0.07, -0.1, scene); k.position.y = 0.14; const ch = hero(scene, { p: [0.2, 0, 1.15], ry: -0.3 }); sepia(scene, [ch]);
    const cam = CAM([[0.1, 1.35, 4.4], [0.08, 1.33, 4.2]], [[0.05, 1.3, 0]], 50); const mt = meter(scene, cam); const tY = ws(4, '1546'), tD = ws(4, 'down');
    const y = label3D(scene, '1546', -0.45, 2.55, 0.0, tY, { size: 0.22 }); const n = label3D(scene, 'HENRY VIII', -0.3, 2.22, 0.1, tY + 0.25, { size: 0.13, front: 0xffffff, side: 0x9a8a6a });
    const plank = L.box(1.1, 0.12, 0.05, mm(MT.wood, 1, 0.2), 0.85, 0.62, 0.66, scene); plank.rotation.z = 0.35; plank.visible = false; const cl = label3D(scene, 'CLOSED', 0.85, 0.95, 0.7, tD, { size: 0.1, front: 0xff6a5a, side: 0x8a2a1a }); cue(tD, 'stamp');
    return { scene, cam, upd(t) { mt(t); y(t); n(t); cl(t); plank.visible = q15(t) >= tD; ch.drive(t, [seg('point', t0 - 0.1)], [[-99, 'surprised', 'talkO']]); } }; });
  // ===== 9. "Doctors said hot water let disease in through the skin."  a doctor (black coat) warns; she backs off from a steaming tub
  SH([5, 'Doctors'], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); woodTub(scene, 0.75, -0.2, 0.45, 0.55); const dr = npcAt(scene, 'bank_teller', 'grey', -0.55, 0.0, 0.5, 1.15); dr.walk(0); tricorn(dr); npcSet(dr, 'Bone004', -1.6);
    const ch = hero(scene, { p: [0.35, 0, 0.85], ry: -0.5 }); sepia(scene, [ch]); const cam = CAM([[0.1, 1.3, 4.0], [0.08, 1.28, 3.8]], [[0, 1.2, 0.1]], 50); const mt = meter(scene, cam); const tD = ws(5, 'disease'); cue(tD, 'sting');
    const fx = new FX(LW, LH).add('steam', { world: [0.75, 0.65, -0.2], t0, dur: 99, every: 0.3, life: 1.3, rise: 45 }).add('exclaim', { obj: ch.root, bone: 'Head', offset: [0.12, 0.42, 0], t0: tD, dur: 99 });
    const lab = label3D(scene, 'WATER DANGER?', 0, 2.1, -0.2, tD, { size: 0.12, front: 0xff8a6a, side: 0x8a2a1a });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('step_back', tD - 0.1, { fade: 0.1 })], [[-99, 'open', 'neutral'], [tD, 'surprised', 'gasp']]); } }; });
  // ===== 10. "So people wore a clean linen shirt to soak up the dirt… plus perfume. This is a dry wash."  she holds the linen shirt, perfume puff; flies still; meter 3
  SH([5, 'So'], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); const ch = hero(scene, { p: [-0.1, 0, 0.75], ry: 0.25 }); const ns = nightshirt(); ns.position.set(0.72, 1.85, 0.0); ns.scale.setScalar(1.0); scene.add(ns);
    const pf = perfume(); pf.scale.setScalar(1.8); scene.add(pf); const fp = V3([0, 0, 0]); sepia(scene, [ch, pf]); const cam = CAM([[0.25, 1.2, 3.7], [0.23, 1.18, 3.55]], [[0.2, 1.2, 0.4]], 48); const mt = meter(scene, cam);
    const tP = ws(5, 'perfume'), tW = ws(5, 'dry'); cue(ws(5, 'linen'), 'cloth'); cue(tP, 'spray'); const lab = label3D(scene, 'DRY WASH', 0.1, 2.25, 0.35, tW, { size: 0.15 });
    const fx = new FX(LW, LH).add('sparkle', { world: [0.1, 1.3, 0.9], t0: tP, dur: 99, n: 5, radius: 22, color: '#e8b0ff' }).add('flies', { obj: ch.root, bone: 'Head', offset: [0.0, 0.3, 0], t0: tW + 0.4, dur: 99, n: 2, scale: 1.5 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, [seg('present', t0 - 0.3)], [[-99, 'open', 'smile'], [tP, 'happy', 'smileOpen'], [tW + 0.4, 'open', 'frown']]); scene.updateMatrixWorld(true); ch.fist('R', fp); pf.position.copy(fp).add(V3([0, 0.06, 0.04])); } }; });
  // ===== 11. "Later, the tin tub, filled pot by pot… and the whole family shared the water."  the cottage: tin tub, kettle on the hearth, family queue
  SH([6, 'Later'], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); const H0 = hearth(scene, -0.9, -0.45); kettle(scene, -0.9, 0.97, -0.55); const T0 = tinTub(scene, 0.45, 0.25); T0.g.scale.setScalar(0.75);
    const fam = [['bank_teller', 'olive', 1.15, -0.45, 1.0], ['homework_girl', 'red', 1.45, -0.3, 0.9], ['art_student', 'teal', 1.7, -0.15, 0.75]].map(([id, v, x, z, s]) => { const n = npcAt(scene, id, v, x, z, -1.2, s); n.walk(0); return n; });
    const ch = hero(scene, { p: [-0.05, 0, 0.95], ry: 0.3 }); sepia(scene, [ch]); const cam = CAM([[0.5, 1.5, 4.6], [0.48, 1.48, 4.4]], [[0.55, 1.05, 0.0]], 54); const mt = meter(scene, cam);
    const tS = ws(6, 'shared'); cue(t0 + 0.1, 'water_pour'); cue(ws(6, 'pot'), 'water_pour'); const lab = label3D(scene, 'TIN TUB', 0.45, 1.95, 0.1, t0 + 0.2, { size: 0.15 });
    const fx = new FX(LW, LH).add('steam', { world: [-0.9, 1.25, -0.5], t0, dur: 99, every: 0.35, life: 1.2, rise: 30 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); H0.userData.tick(t); T0.water.material.color.set(q15(t) >= tS ? 0x8a7a50 : 0x8a9aa0); ch.drive(t, [seg('present', t0 - 0.2)], [[-99, 'happy', 'smile'], [tS, 'surprised', 'talkO']]); } }; });
  // ===== 12. "The story goes, the baby went last."  close on the murky tub; she pinches her nose
  SH([6, 'The', 4], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); const T0 = tinTub(scene, 0.4, 0.15, 0x6a5a38); T0.g.scale.setScalar(0.8); const ch = hero(scene, { p: [-0.2, 0, 0.85], ry: 0.45 }); sepia(scene, [ch]);
    const cam = CAM([[0.1, 1.4, 3.3], [0.08, 1.38, 3.15]], [[-0.05, 1.0, 0.3]], 50); const mt = meter(scene, cam); const tB = ws(6, 'baby'); cue(tB, 'gasp');
    const fx = new FX(LW, LH).add('stink', { world: [0.3, 0.4, 0.25], t0, dur: 99 }).add('flies', { world: [0.3, 0.55, 0.25], t0, dur: 99, n: 3, scale: 1.5 });
    const lab = label3D(scene, 'BABY: LAST', 0.15, 1.75, 0.3, tB, { size: 0.13 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, [seg('shake_head', t0 - 0.1)], [[-99, 'disgust', 'disgust']]); } }; });
  // ===== 13. "In 1767, William Feetham patented a shower: pump water up by hand, pull a chain…"  year card + the hand-pump shower; she pulls the chain
  SH([7, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); feethamShower(scene, 0.2, -0.1); const ch = hero(scene, { p: [0.2, 0.06, -0.05], ry: 0.0 }); sepia(scene, [ch]);
    const cam = CAM([[0.2, 1.45, 4.3], [0.2, 1.43, 4.1]], [[0.2, 1.55, 0]], 52); const mt = meter(scene, cam); const tY = ws(7, '1767'), tC = ws(7, 'chain');
    const y = label3D(scene, '1767', -0.95, 2.45, 0.4, tY, { size: 0.2 }); const n = label3D(scene, 'W. FEETHAM', -0.75, 2.15, 0.5, tY + 0.25, { size: 0.11, front: 0xffffff, side: 0x9a8a6a }); cue(ws(7, 'pump'), 'pump'); cue(tC, 'chain_pull');
    return { scene, cam, upd(t) { mt(t); y(t); n(t); ch.drive(t, q15(t) < tC ? [seg('idle', -99, { loop: true })] : [seg('pull_chain', tC - 0.2)], [[-99, 'open', 'smile'], [tC, 'happy', 'smileOpen']]); } }; });
  // ===== 14. "…and the same dirty water falls again."  brown water drips on her; wet android sparks; meter 4
  SH([7, 'and'], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); feethamShower(scene, 0.0, -0.1); const ch = hero(scene, { p: [0.0, 0.06, -0.05], ry: 0.0 }); sepia(scene, [ch]);
    const cam = CAM([[0.05, 1.5, 3.4], [0.05, 1.48, 3.25]], [[0.0, 1.45, 0]], 50); const mt = meter(scene, cam); const tA = ws(7, 'again'); cue(t0 + 0.1, 'water_splash'); cue(tA, 'zap');
    const fx = new FX(LW, LH).add('drip', { world: [-0.1, 2.3, 0], t0, dur: 99, color: '#8a6a3a' }).add('drip', { world: [0.12, 2.3, 0], t0: t0 + 0.2, dur: 99, color: '#8a6a3a' }).add('zap', { obj: ch.root, bone: 'Head', offset: [0.12, 0.2, 0], t0: tA, dur: 2 });
    const lab = label3D(scene, 'SAME WATER', 0, 2.0, 0.6, tA - 0.4, { size: 0.12, front: 0xc8a060, side: 0x6a4a1a });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, [seg('shiver', t0 - 0.1, { loop: true })], [[-99, 'disgust', 'disgust'], [tA, 'surprised', 'gasp']]); } }; });
  // ===== 15. "Then came pipes and water heaters. Hot water, any time. This is a shower."  the modern bathroom: she under a hot shower, happy; meter 5 FRESH
  SH([8, 'Then'], 'C', (t0) => { const scene = new THREE.Scene(); const B = bathroom(scene); const ch = hero(scene, { p: [0.0, 0, -0.55], ry: 0.15 }); const cam = CAM([[0.1, 1.45, 3.4], [0.08, 1.43, 3.2]], [[0.0, 1.55, -0.5]], 52); const mt = meter(scene, cam);
    const tS = ws(8, 'shower'); cue(t0 + 0.2, 'shower_run'); cue(tS, 'sting'); const lab = label3D(scene, 'SHOWER', 0, 2.3, -0.3, tS, { size: 0.17 }); const lab2 = label3D(scene, 'FRESH', 0.15, 2.02, -0.1, tS + 0.4, { size: 0.13, front: 0x9cf09c, side: 0x3a8a4a });
    const fx = new FX(LW, LH).add('drip', { world: [0.0, 2.5, -0.75], t0, dur: 99, color: '#bfe8ff' }).add('steam', { world: [0.0, 1.4, -0.5], t0: t0 + 0.4, dur: 99, every: 0.3, life: 1.3, rise: 40, color: '#ffffff', edge: '#c8d8e0' }).add('sparkle', { obj: ch.root, bone: 'Head', offset: [0.1, 0.3, 0], t0: tS, dur: 99, n: 4, radius: 18 });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); lab2(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('cheer', tS - 0.1, { fade: 0.12 })], [[-99, 'relaxed', 'smile'], [tS, 'happy', 'smileOpen']]); } }; });
  // ===== 16. "Today, the average shower takes about eight minutes. Logging off."  big 3D "8 MIN" in the bathroom, she waves; small outro
  SH([9, 'Today'], 'C', (t0) => { const scene = new THREE.Scene(); bathroom(scene); const ch = hero(scene, { p: [-0.3, 0, 0.6], ry: 0.2 }); const cam = CAM([[0.1, 1.15, 3.4], [0.1, 1.2, 3.8]], [[0.0, 1.2, 0.3]], 48); const mt = meter(scene, cam);
    const tE = ws(9, 'eight'), tLo = ws(9, 'Logging'), tOut = TL.dur + 0.05; cue(tLo, 'blip'); cue(tOut, 'end_jingle'); const lab = label3D(scene, '8 MIN', 0.35, 2.05, 0.2, tE, { size: 0.26 });
    return { scene, cam, upd(t) { mt(t); lab(t); ch.drive(t, [seg('present', t0 - 0.2), seg('wave', tLo - 0.3, { fade: 0.12 })], [[-99, 'happy', 'smileOpen'], [tLo, 'wink', 'blushSmile']]); },
      ov(o, t, c) { if (t >= tOut) { plateText(o, CHANNEL, CX, 40, { size: 12, border: '#fdd941', fg: '#fdd941', scale: popS(t, tOut) }); if (t >= tOut + 0.4) { const w = 90, h = 14, X = CX - w / 2, Y = 60; c.fillStyle = '#040412'; c.fillRect(X - 2, Y - 2, w + 4, h + 4); c.fillStyle = '#fe2c55'; c.fillRect(X, Y, w, h); bitText(c, 'FOLLOW', CX, Y + 7, 1, '#ffffff', { outline: null }); } } } }; });
