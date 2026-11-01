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
      geo.computeBoundingBox(); const bb = geo.boundingBox, w = bb.max.x - bb.min.x; geo.translate(-bb.min.x - w / 2, -size * 0.36, -size * 0.1);
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
  function flatKey(sc = 1) {   // real 3D flat key: extruded blade with 5 cut teeth, round bow with a hole, ridge groove
    const g = new THREE.Group(), sh = new THREE.Shape();
    sh.moveTo(0, 0.012); sh.lineTo(0.14, 0.012); sh.lineTo(0.155, 0.0);
    [0.13, 0.105, 0.08, 0.055, 0.03].forEach((x, i) => { const d = 0.006 + [0.06, 0.12, 0.03, 0.1, 0.05][i] * 0.09; sh.lineTo(x + 0.008, -0.004); sh.lineTo(x, -0.004 - d); sh.lineTo(x - 0.008, -0.004); });
    sh.lineTo(0.0, -0.004); sh.lineTo(0, 0.012);
    const bow = new THREE.Shape(); bow.absarc(-0.03, 0.004, 0.034, 0, Math.PI * 2, false); const hole = new THREE.Path(); hole.absarc(-0.045, 0.004, 0.009, 0, Math.PI * 2, true); bow.holes.push(hole);
    const nickel = L.lam(null, 0xd8dce4, { side: THREE.DoubleSide }); nickel.flatShading = true;
    for (const shp of [sh, bow]) L.mesh(new THREE.ExtrudeGeometry(shp, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.001, bevelSegments: 1 }), nickel, 0, 0, -0.003, g);
    L.box(0.13, 0.002, 0.008, L.basic(null, 0x8a8e98), 0.072, 0.004, 0.0, g);   // groove
    L.box(0.12, 0.0015, 0.001, L.basic(null, 0xffffff), 0.07, 0.011, 0.0045, g);   // glint
    g.scale.setScalar(sc); return g;
  }
  // ===== Digger 03 vertical cover (A1 style, different backgrounds): the giant "UNPICKABLE" padlock, lockpicks, the flat key
  function gridFloor(scene) { const floor = new THREE.MeshBasicMaterial({ map: gridTexC(1024, 1024, '#4f86de', '#0e2c88', '#66a8ff', 40, 40, 3) }); const fl = new THREE.Mesh(new THREE.CircleGeometry(9, 48), floor); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.005; scene.add(fl); }
  function bigPadlock(scene, x, z, s = 5.2, ry = -0.35) { const p = padlock(s); p.position.set(x, 0, z); p.rotation.y = ry; scene.add(p);
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 32; const c = cv.getContext('2d'); c.fillStyle = '#f4ecd0'; c.fillRect(0, 0, 128, 32); c.strokeStyle = '#2a1a0a'; c.lineWidth = 3; c.strokeRect(2, 2, 124, 28);
    c.fillStyle = '#b8201a'; c.font = 'bold 19px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('UNPICKABLE', 64, 17); const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
    const tag = L.plane(0.11, 0.028, new THREE.MeshBasicMaterial({ map: tx }), 0, 0.105, 0.0315, p); return p; }
  function picks(scene) { const g = new THREE.Group(); scene.add(g); g.scale.setScalar(1.8); const st = litM(null, 0xd8dce4);
    L.box(0.02, 0.32, 0.012, st, 0, 0.16, 0, g); L.box(0.02, 0.05, 0.012, st, 0.012, 0.34, 0, g).rotation.z = -0.6; L.box(0.02, 0.28, 0.012, st, 0.045, 0.14, 0.01, g); L.box(0.05, 0.02, 0.012, st, 0.06, 0.28, 0.01, g);
    L.box(0.04, 0.09, 0.03, litM(null, 0x2a2a30), 0.02, 0.02, 0.0, g); return g; }
  function magnifier(scene) { const g = new THREE.Group(); scene.add(g); g.scale.setScalar(1.6); L.mesh(new THREE.TorusGeometry(0.11, 0.022, 6, 18), litM(null, 0x2a2a30), 0, 0.24, 0, g);
    L.mesh(new THREE.CircleGeometry(0.1, 18), new THREE.MeshBasicMaterial({ color: 0xcfeefa, transparent: true, opacity: 0.6, side: THREE.DoubleSide }), 0, 0.24, 0, g); L.box(0.035, 0.16, 0.035, litM(null, 0x6a3a1a), 0, 0.07, 0, g); return g; }
  function cover(word, build, txt, size) {
    SH([10, word], 'C', (t0) => { const scene = new THREE.Scene(); const upd = build(scene);
      txt.split('|').forEach((ln, i) => letters3D(scene, ln, { size, x: 0.05, y: 2.32 - i * size * 1.05, z: 0.35, seed: 5 + i }).rotation.set(-0.32, 0.18, 0.03));
      return { scene, cam: CAM([[0.1, 1.15, 3.6]], [[0.1, 1.18, 0]], 52), upd }; }); }
  // A: grid floor + the red plank door in a stone wall behind; she points the lockpicks at the giant UNPICKABLE padlock
  cover('full', (scene) => { scene.background = new THREE.Color(0x2a2430); gridFloor(scene); stoneCourses(scene, { x0: -4, x1: 4, y0: 0, y1: 4.2, z: -1.6, depth: 0.4, seed: 4 }); door3D(scene, { x: 0.1, z: -1.35, w: 1.2, h: 2.4, tint: 0x9a2a1a });
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8090c0, 1.8)); const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(-2, 5, 4); scene.add(sun);
    bigPadlock(scene, 0.55, -0.4); const ch = hero(scene, { p: [-0.32, 0, 0.75], ry: 0.25 }); const pk = picks(scene); const fp = V3([0, 0, 0]);
    const HY = +(new URLSearchParams(location.search).get('hy') || -0.7);
    return (t) => { ch.drive(t, [still('point', 0.8)], [[-99, 'open', 'smile']], false); lookAtBed(ch, HY, 0); scene.updateMatrixWorld(true); ch.fist('L', fp); pk.position.copy(fp).add(V3([0.0, -0.06, 0.04])); pk.rotation.set(0, 0.3, -0.25); }; }, 'PICK|THIS?', 0.5);
  // B: the MML2 town at night (curved grid feel gone); she holds up the giant flat key next to the padlock
  cover('bedroom', (scene) => { const D = dungeon(scene); scene.fog = null; D.bd.visible = false; D.wd.visible = false; scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    bigPadlock(scene, 0.55, -0.4); const ch = hero(scene, { p: [-0.3, 0, 0.75], ry: 0.2 }); const key = flatKey(4.2); scene.add(key); const fp = V3([0, 0, 0]);
    return (t) => { ch.drive(t, [still('point', 0.8)], [[-99, 'open', 'smileOpen']], false); scene.updateMatrixWorld(true); ch.fist('L', fp); key.position.copy(fp).add(V3([0.02, 0.04, 0.05])); key.rotation.set(0, -0.3, 1.35); }; }, 'KEY|TEETH?', 0.32);
  // C: the curved holographic grid blended into an MML2 ruin (stone pillars + rubble inside the dome); magnifier on the padlock
  cover('expedition', (scene) => { curvedGrid(scene); for (const [x, z] of [[-1.6, -1.6], [1.8, -1.8]]) ruinPillar(scene, x, z, 3.2); rubble(scene, -1.2, -1.0, 6, 1, 3); rubble(scene, 1.6, -1.2, 5, 1, 9);
    stoneCourses(scene, { x0: -1.2, x1: 1.2, y0: 0, y1: 1.2, z: -2.2, depth: 0.35, seed: 7 }); bigPadlock(scene, 0.55, -0.4); const ch = hero(scene, { p: [-0.32, 0, 0.75], ry: 0.25 }); const mg = magnifier(scene); const fp = V3([0, 0, 0]);
    return (t) => { ch.drive(t, [still('point', 0.8)], [[-99, 'surprised', 'talkO']], false); scene.updateMatrixWorld(true); ch.fist('L', fp); mg.position.copy(fp).add(V3([0.0, -0.08, 0.04])); mg.rotation.set(0, 0.4, -0.2); }; }, 'PICK|THIS?', 0.32);
