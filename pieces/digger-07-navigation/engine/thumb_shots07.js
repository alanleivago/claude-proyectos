  // ===== THUMBNAIL-ONLY shots for the Digger 07 vertical cover (injected by thumb_exp06.mjs, never part of the video) =====
  // A1 style (approved): curved holographic grid dome, BIG 3D jittered Luckiest letters (#FFE21A front, #A87800 extrusion, no rim),
  // her big, full body, eyes open; ONE big artifact (Feetham's 1767 hand-pump shower raining the same brown water). No grading.
  function gridTexC(w, h, top, bottom, line, nx, ny, lw = 3) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(1, bottom); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = line; for (let i = 0; i < nx; i++) c.fillRect(Math.round(i * w / nx), 0, lw, h); for (let j = 0; j < ny; j++) c.fillRect(0, Math.round(j * h / ny), w, lw);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
  function curvedGrid(scene) {
    scene.background = new THREE.Color(0xbfe6ee); scene.fog = null;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(9, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ map: gridTexC(2048, 512, '#e6f8fa', '#9cd0e8', '#3f86cc', 64, 12, 3), side: THREE.BackSide }));
    dome.position.set(0, -0.02, 0); scene.add(dome);
    const floor = new THREE.MeshBasicMaterial({ map: gridTexC(1024, 1024, '#4f86de', '#0e2c88', '#66a8ff', 40, 40, 3), polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    const fl = new THREE.Mesh(new THREE.CircleGeometry(9, 48), floor); fl.rotation.x = -Math.PI / 2; scene.add(fl);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8090c0, 2.0)); const sun = new THREE.DirectionalLight(0xffffff, 1.3); sun.position.set(-2, 5, 4); scene.add(sun);
  }
  function cover07(word, build, txt, size) {
    SH([9, word], 'C', (t0) => { const scene = new THREE.Scene(); curvedGrid(scene); const upd = build(scene);
      txt.split('|').forEach((ln, i) => letters3D(scene, ln, { size, x: -0.05, y: 2.36 - i * size * 1.05, z: 0.35, seed: 5 + i }).rotation.set(-0.32, 0.18, 0.03));
      return { scene, cam: CAM([[0.12, 1.1, 3.75]], [[0.12, 1.12, 0]], 52), upd }; }); }
  // A: the big 3D North Star glowing to the right, she points at it from the left, eyes open
  cover07('clocks', (scene) => { const st = star3D(scene, 0.8, 1.86, -0.5, 0.38); for (const [x, y] of [[0.95, 1.2], [1.05, 2.25]]) star3D(scene, x, y, -0.8, 0.09, 0xe8ecff);
    const ch = hero(scene, { p: [-0.28, 0, 0.72], ry: 0.2 }); let hd = null; ch.root.traverse((o) => { if (!hd && o.isBone && o.name === 'Head') hd = o; });
    return (t) => { st.rotation.y = 0.5; ch.drive(t, [still('point', 0.8)], [[-99, 'surprised', 'gasp']], false); hd.rotation.y -= 0.7; }; }, 'WHICH|WAY?', 0.27);
  // B: she holds the water compass up, the big star behind
  cover07('run', (scene) => { star3D(scene, 0.55, 2.0, -0.8, 0.4); const ch = hero(scene, { p: [-0.05, 0, 0.72], ry: 0.1 }); const wc = waterCompass(); wc.scale.setScalar(1.6); const hold = holdIn(ch, 'R', wc, [0.1, -0.07, 0.1]);
    return (t) => { ch.drive(t, [still('surprised', 1.0)], [[-99, 'surprised', 'smileOpen']], false); hold(); }; }, 'WHICH|WAY?', 0.27);
