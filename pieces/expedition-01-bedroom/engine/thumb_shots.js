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
  function shotA(word, clip, ct, yaw, tilt, face) {
    SH([50, word], 'C', (t0) => { const scene = new THREE.Scene(); curvedGrid(scene); innBed3q(scene, { x: 0.75, z: -0.45, s: 1.35 });
      const ch = hero(scene, { p: [-0.6, 0, 1.35], ry: 0.18 }); letters3D(scene, 'WITH STRANGERS?', { size: 0.36, x: 0.32, y: 1.8, z: 0.15 }).rotation.set(-0.32, 0.2, 0.03);
      return { scene, cam: CAM([[0.05, 1.28, 4.0]], [[0.05, 0.94, 0]], 34), upd(t) { ch.drive(t, [still(clip, ct)], [[-99, ...face]], false); lookAtBed(ch, yaw, tilt); } }; }); }
  shotA('Expedition', 'hands_on_hips', 0.9, 0.5, -0.22, ['open', 'smirk']);   // A1 hands on hips, head tilted to the bed, amused
  shotA('complete', 'point', 0.8, 0.45, -0.15, ['surprised', 'talkO']);        // A2 pointing at the bed, surprised
  shotA('Logging', 'peek', 0.8, 0.35, -0.25, ['open', 'talkO']);               // A3 leaning to peek, puzzled
  // sparkles are added in thumb_compose.py (small gold four-point stars)
