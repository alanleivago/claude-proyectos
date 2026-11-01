  // ===== THUMBNAIL-ONLY shots (injected by thumb_exp.mjs, never part of the video) =====
  // v4 (user: favourite "With Strangers?"): curved holographic grid room (wrap-around like the Gemini ref), Mechayuki BIG with a
  // THINKING pose (hand on chin, head tilted, eyes open), the inn bed in 3/4 with both strangers' faces visible, and REAL 3D
  // extruded letters in the scene ("Low Poly Shorts" logo spec: rounded blocky SM64-style font, extrusion ~20 % of the letter
  // height, per-letter jitter in rotation/scale, front #FFE21A, side #C89A00). Natural PS1 shading, no grading.
  function gridTexC(w, h, top, bottom, line, nx, ny, lw = 3) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(1, bottom); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = line; for (let i = 0; i < nx; i++) c.fillRect(Math.round(i * w / nx), 0, lw, h); for (let j = 0; j < ny; j++) c.fillRect(0, Math.round(j * h / ny), w, lw);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
  function curvedGrid(scene) {
    scene.background = new THREE.Color(0xbfe6ee); scene.fog = null;
    // the wrap-around wall + ceiling: the inside of a dome (lat/long grid lines bend like the ref's tunnel)
    const dome = new THREE.Mesh(new THREE.SphereGeometry(9, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ map: gridTexC(2048, 512, '#e6f8fa', '#9cd0e8', '#3f86cc', 64, 12, 3), side: THREE.BackSide }));
    dome.position.set(0, -0.02, 0); scene.add(dome);
    const floor = new THREE.MeshBasicMaterial({ map: gridTexC(1024, 1024, '#4f86de', '#0e2c88', '#66a8ff', 40, 40, 3), polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    const fl = new THREE.Mesh(new THREE.CircleGeometry(9, 48), floor); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.0; scene.add(fl);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8090c0, 2.0)); const sun = new THREE.DirectionalLight(0xffffff, 1.3); sun.position.set(-2, 5, 4); scene.add(sun);
  }
  const LGF = new Font(LUCKIEST);
  function letters3D(scene, txt, { size = 0.3, x = 0, y = 2, z = 0, seed = 7, jitter = 1, front = 0xffe21a, side = 0xa87800 } = {}) {
    const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); let r = seed; const rnd2 = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    const mats = [new THREE.MeshBasicMaterial({ color: front }), new THREE.MeshBasicMaterial({ color: side })]; const out = new THREE.MeshBasicMaterial({ color: 0x5a3200, side: THREE.BackSide });
    txt.split('|').forEach((line, li) => { let cx = 0; const items = [];
    for (const ch of line) { if (ch === ' ') { cx += size * 0.32; continue; }
      const geo = new TextGeometry(ch, { font: LGF, size, depth: size * 0.3, curveSegments: 4, bevelEnabled: true, bevelThickness: size * 0.02, bevelSize: size * 0.012, bevelSegments: 1 });
      geo.computeBoundingBox(); const bb = geo.boundingBox, w = (LUCKIEST.glyphs[ch] ? LUCKIEST.glyphs[ch].ha / LUCKIEST.resolution * size * 0.92 : bb.max.x - bb.min.x); geo.translate(-(bb.min.x + bb.max.x) / 2, -size * 0.36, -size * 0.1);   // advance-width spacing (L/A gap fix)
      const m = new THREE.Mesh(geo, mats);   // v5 (user): no dark rim; the amber side shows the extrusion
      const s = 1 + (rnd2() - 0.4) * 0.16 * jitter; m.scale.setScalar(s); m.rotation.set((rnd2() - 0.5) * 0.12 * jitter, (rnd2() - 0.5) * 0.16 * jitter, (rnd2() - 0.5) * 0.2 * jitter);
      m.position.set(cx + w / 2, -li * size * 1.08 + (rnd2() - 0.5) * size * 0.08 * jitter, 0); g.add(m); items.push(m); cx += w * s + size * 0.04; }
    for (const m of items) m.position.x -= cx / 2; }); return g; }
  function innBed3q(scene, { x = 0.75, z = -0.35, ry = -0.4, s = 1.15 } = {}) {   // the inn bed turned 3/4 to the camera, both strangers' faces up
    const bb = new THREE.Group(); bb.position.set(x, 0, z); bb.rotation.y = ry; bb.scale.setScalar(s); scene.add(bb);
    bigBed(bb, { x: 0, z: 0, w: 1.3, quilt: 0x8a3a2a });
    const wedge = L.box(1.2, 0.34, 0.5, litM(null, 0xf0eadc), 0, 0.62, -0.72, bb); wedge.rotation.x = -0.45;   // pillows piled against the headboard
    const a = lieNpc(bb, 'bank_teller', 'navy', -0.3, 0.5, 0.95, { tilt: 0.3, s: 1.05 }); nightcap(a); const b = lieNpc(bb, 'bank_teller', 'olive', 0.3, 0.5, 0.95, { tilt: 0.3, s: 1.05 }); franklinLook(b); return bb; }   // sitting up against the headboard: faces to camera
  const THINK = [[-99, 'open', 'talkO']];
  function lookAtBed(ch, yaw, tilt) { let hd = null; ch.root.traverse((o) => { if (!hd && o.isBone && o.name === 'Head') hd = o; }); if (hd) { hd.rotation.y += yaw; hd.rotation.z += tilt; } }   // eyes OPEN (user), puzzled little "o"
  // v5: A only, three poses that keep her whole face clear; bigger, rimless title; a bigger, closer bed (bigger strangers)
  // ===== Digger 04 vertical cover (A1 style): the knocker-up's pea shooter / pole and a twin-bell alarm clock
  function wallWindow(scene, x, z, y0 = 0.95) {   // an upper-floor wall section with a lit window and a flower box
    const g = new THREE.Group(); g.position.set(x, y0, z); scene.add(g);
    L.box(1.3, 1.5, 0.14, mm(MT.stucco, 1.2, 1.4, 0xf4e8d0), 0, 0.75, 0, g); L.box(1.36, 0.1, 0.2, mm(MT.darkWood, 1.3, 0.2), 0, 0.02, 0, g);
    L.box(0.66, 0.82, 0.04, L.basic(null, 0x2a3c6a), 0, 0.82, 0.07, g); for (const [w, h, dx, dy] of [[0.78, 0.07, 0, 0.41], [0.78, 0.07, 0, -0.41], [0.07, 0.86, 0.36, 0], [0.07, 0.86, -0.36, 0], [0.05, 0.82, 0, 0], [0.7, 0.05, 0, 0]]) L.box(w, h, 0.06, litM(null, 0xf6f2ea), dx, 0.82 + dy, 0.09, g);
    for (const s2 of [-1, 1]) { const sh = L.box(0.3, 0.86, 0.04, mm(MT.wainscot, 0.5, 1, 0x4a9a6a), s2 * 0.54, 0.82, 0.12, g); sh.rotation.y = s2 * 0.35; }
    windowBox(g, 0, 0.36, 0.16, 0.8); return g; }
  function twinBellClock(scene, x, z, s = 1, ry = -0.3) {   // a vintage twin-bell alarm clock: round face, two bells with a hammer, little legs
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; g.scale.setScalar(s); scene.add(g); const red = litM(null, 0xd83a2a), gold = litM(null, 0xd8b040);
    const body = L.mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.24, 20), red, 0, 0.62, 0, g); body.rotation.x = Math.PI / 2;
    const face = L.mesh(new THREE.CircleGeometry(0.36, 24), L.basic(null, 0xfbf6e8), 0, 0.62, 0.122, g);
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; L.box(k % 3 ? 0.02 : 0.035, k % 3 ? 0.05 : 0.08, 0.01, L.basic(null, 0x1a1a1a), Math.sin(a) * 0.3, 0.62 + Math.cos(a) * 0.3, 0.128, g).rotation.z = -a; }
    const hh = L.box(0.03, 0.18, 0.01, L.basic(null, 0x1a1a1a), 0, 0.62 + 0.09, 0.132, g); const mh = L.box(0.025, 0.26, 0.01, L.basic(null, 0x1a1a1a), 0.13 * Math.sin(Math.PI), 0, 0.134, g);
    hh.rotation.z = -Math.PI * 2 * 6.5 / 12; hh.position.set(0.09 * Math.sin(Math.PI * 2 * 6.5 / 12), 0.62 + 0.09 * Math.cos(Math.PI * 2 * 6.5 / 12), 0.132); mh.rotation.z = -Math.PI; mh.position.set(0, 0.62 - 0.13, 0.134);
    L.mesh(new THREE.CircleGeometry(0.03, 10), L.basic(null, 0x1a1a1a), 0, 0.62, 0.136, g);
    L.mesh(new THREE.TorusGeometry(0.42, 0.03, 6, 24), gold, 0, 0.62, 0.12, g);
    for (const s2 of [-1, 1]) { const b = L.mesh(new THREE.SphereGeometry(0.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), gold, s2 * 0.3, 1.06, 0, g); b.rotation.z = -s2 * 0.5; L.box(0.03, 0.12, 0.03, gold, s2 * 0.22, 0.98, 0, g).rotation.z = -s2 * 0.5;
      L.box(0.04, 0.16, 0.04, gold, s2 * 0.28, 0.12, 0, g).rotation.z = s2 * 0.4; }
    L.box(0.03, 0.2, 0.03, gold, 0, 1.12, 0, g); L.mesh(new THREE.SphereGeometry(0.045, 8, 6), gold, 0, 1.22, 0, g); return g; }
  function cover(word, build, txt, size) {
    SH([10, word], 'C', (t0) => { const scene = new THREE.Scene(); curvedGrid(scene); const upd = build(scene);
      txt.split('|').forEach((ln, i) => letters3D(scene, ln, { size, x: 0.05, y: 2.32 - i * size * 1.05, z: 0.35, seed: 5 + i }).rotation.set(-0.32, 0.18, 0.03));
      return { scene, cam: CAM([[0.1, 1.15, 3.6]], [[0.1, 1.18, 0]], 52), upd }; }); }
  const PEA = () => new THREE.MeshBasicMaterial({ color: 0x8cf04a });
  // v2 poses (user): 1 hands over the ears while it rings, 2 slapping the top knob (snooze), 3 blowpipe at her lips aimed at the clock
  cover('full', (scene) => { twinBellClock(scene, 0.5, 0.0, 1.1, -0.3); const ch = hero(scene, { p: [-0.25, 0, 0.75], ry: 0.15 });
    return (t) => ch.drive(t, [still('surprised', 0.8)], [[-99, 'surprised', 'gasp']], false); }, 'HUMAN|ALARM?', 0.32);
  cover('bedroom', (scene) => { const ck = twinBellClock(scene, 0.4, 0.0, 0.8, -0.3); const ch = hero(scene, { p: [-0.42, 0, 0.45], ry: 0.95 }); const fp = V3([0, 0, 0]), top = V3([0, 0, 0]);
    return (t) => { ch.drive(t, [still('point', 0.8)], [[-99, 'angry', 'frown']], false); scene.updateMatrixWorld(true); ch.fist('L', fp);
      // the clock moves so its top knob sits right under her fist (touching, no overlap)
      ck.updateMatrixWorld(true); ck.localToWorld(top.set(0, 1.26, 0)); ck.position.add(V3([fp.x - top.x, fp.y - 0.06 - top.y, fp.z - top.z])); }; }, 'HUMAN|ALARM?', 0.32);
  cover('expedition', (scene) => { twinBellClock(scene, 0.62, -0.3, 1.0, -0.4); const ch = hero(scene, { p: [-0.35, 0, 0.75], ry: 0.6 });
    const tube = L.mesh(new THREE.CylinderGeometry(0.045, 0.055, 1, 10), litM(null, 0x6a8a3a), 0, 0, 0, scene); const tg = V3([0.55, 0.75, -0.2]);
    const peas = [0.22, 0.48].map((k) => ({ k, m: L.mesh(new THREE.IcosahedronGeometry(0.09, 1), new THREE.MeshBasicMaterial({ color: 0x8cf04a }), 0, 0, 0, scene) })); const hd = V3([0, 0, 0]);
    let head = null; ch.root.traverse((o) => { if (!head && o.isBone && o.name === 'Head') head = o; });
    const fp = V3([0, 0, 0]);
    return (t) => { ch.drive(t, [still('point', 0.8)], [[-99, 'open', 'talkO']], false); scene.updateMatrixWorld(true); head.localToWorld(hd.set(0, 0, 0)); ch.fist('L', fp); const mouth = hd.clone().add(V3([0.07, -0.08, 0.07]));
      const d = fp.clone().sub(mouth).normalize(), a = mouth.clone(), b = fp.clone().addScaledVector(d, 0.12); orient(tube, a, b); peas.forEach(({ k, m }) => m.position.copy(b).lerp(tg, k)); }; }, 'HUMAN|ALARM?', 0.32);
