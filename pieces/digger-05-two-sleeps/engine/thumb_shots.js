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
  // ===== Digger 05 vertical cover (1080x1920), A1 style: curved grid dome, big 3D jittered letters, her big with open eyes, one big artifact
  function bigCandle(scene, x, z, s = 1) { const cd = new THREE.Group(); cd.position.set(x, 0, z); cd.scale.setScalar(s); scene.add(cd);
    L.mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.07, 16), litM(null, 0x8a8e98), 0, 0.035, 0, cd); L.mesh(new THREE.TorusGeometry(0.2, 0.03, 4, 12, Math.PI), litM(null, 0x8a8e98), 0.4, 0.2, 0, cd).rotation.z = -Math.PI / 2;
    L.mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.85, 14), litM(null, 0xf6eed8, false), 0, 0.5, 0, cd); for (let k = 0; k < 5; k++) L.box(0.05, 0.14 + (k % 2) * 0.1, 0.04, litM(null, 0xf8f2e2), Math.cos(k * 1.3) * 0.16, 0.86 - (k % 2) * 0.05, Math.sin(k * 1.3) * 0.16, cd);
    L.box(0.015, 0.06, 0.015, L.basic(null, 0x2a2a2a), 0, 0.95, 0, cd); L.mesh(new THREE.ConeGeometry(0.07, 0.24, 7), L.basic(null, 0xffa020), 0, 1.09, 0, cd); L.mesh(new THREE.ConeGeometry(0.035, 0.13, 6), L.basic(null, 0xfff3a0), 0, 1.04, 0.015, cd); return cd; }
  function moon3D(scene, x, y, z, r = 0.3) { const mo = new THREE.Shape(); mo.absarc(0, 0, r, Math.PI * 0.3, Math.PI * 1.7, false); mo.absarc(r * 0.42, 0, r * 0.82, Math.PI * 1.55, Math.PI * 0.45, true);   // crescent: outer arc + inner arc
    const m = L.mesh(new THREE.ExtrudeGeometry(mo, { depth: 0.07, bevelEnabled: false }), litM(null, 0xffe27a), x, y, z, scene); m.rotation.z = 0.5; return m; }
  function clock3D(scene, x, y, z, s = 1, ry = -0.25) {   // a big bedside digital clock glowing 3:00 (7-segment digits drawn on a canvas)
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s); scene.add(g);
    L.box(0.95, 0.5, 0.32, litM(null, 0x22222a), 0, 0.25, 0, g); L.box(0.99, 0.05, 0.36, litM(null, 0x34343e), 0, 0.02, 0, g);
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 112; const c = cv.getContext('2d'); c.fillStyle = '#100608'; c.fillRect(0, 0, 256, 112);
    const SEG = { 0: 'abcdef', 3: 'abcdg' }, seg = (x0, ch, on) => { const w = 44, h = 80, t = 10, y0 = 16; const R = { a: [x0 + t, y0, w - 2 * t, t], b: [x0 + w - t, y0 + t, t, h / 2 - t], c: [x0 + w - t, y0 + h / 2, t, h / 2 - t], d: [x0 + t, y0 + h - t, w - 2 * t, t], e: [x0, y0 + h / 2, t, h / 2 - t], f: [x0, y0 + t, t, h / 2 - t], g: [x0 + t, y0 + h / 2 - t / 2, w - 2 * t, t] };
      for (const k of 'abcdefg') { c.fillStyle = SEG[ch].includes(k) ? on : '#2a0c0c'; c.fillRect(...R[k]); } };
    seg(28, 3, '#ff3a2a'); c.fillStyle = '#ff3a2a'; c.fillRect(90, 36, 10, 10); c.fillRect(90, 70, 10, 10); seg(116, 0, '#ff3a2a'); seg(176, 0, '#ff3a2a');
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; L.plane(0.82, 0.36, new THREE.MeshBasicMaterial({ map: tx }), 0, 0.26, 0.162, g);
    const gl = new THREE.PointLight(0xff4030, 2.2, 2.2); gl.position.set(0, 0.3, 0.6); g.add(gl); return g; }
  function zz3D(scene, x, y, z, size) { return letters3D(scene, 'Zz', { size, x, y, z, seed: 9, front: 0xc8f8ff, side: 0x6a9ac8 }); }
  function cover(word, build, txt, size) {
    SH([10, word], 'C', (t0) => { const scene = new THREE.Scene(); curvedGrid(scene); const upd = build(scene);
      txt.split('|').forEach((ln, i) => letters3D(scene, ln, { size, x: 0.05, y: 2.22 - i * size * 1.05, z: 0.35, seed: 5 + i }).rotation.set(-0.32, 0.18, 0.03));
      return { scene, cam: CAM([[0.1, 1.1, 3.45]], [[0.1, 1.12, 0]], 52), upd }; }); }
  // A: the big glowing 3:00 clock on a nightstand, she stands beside it, surprised, eyes open
  cover('full', (scene) => { const ns = new THREE.Group(); ns.position.set(0.47, 0, 0.1); scene.add(ns); L.box(0.7, 0.62, 0.5, litM(L.rep(OAK, 0.8, 0.8), 0x8a5a34), 0, 0.31, 0, ns); L.box(0.74, 0.05, 0.54, litM(null, 0x5a3418), 0, 0.64, 0, ns);
    clock3D(scene, 0.47, 0.66, 0.15, 0.85, -0.3); moon3D(scene, 0.8, 1.75, -0.6, 0.3); const ch = hero(scene, { p: [-0.18, 0, 0.75], ry: 0.15 });
    return (t) => ch.drive(t, [still('hands_on_hips', 0.9)], [[-99, 'surprised', 'gasp']], false); }, 'SLEPT|TWICE?', 0.3);
  // B: she sits up wide awake in bed under the moon, the 3:00 clock beside the bed
  cover('bedroom', (scene) => { const bd = bed(scene, { x: 0.35, z: -0.4, full: true }); bd.rotation.y = -0.6; const ch = hero(scene); inBed(ch, bd);
    const ns = new THREE.Group(); ns.position.set(-0.2, 0, 1.15); scene.add(ns); L.box(0.55, 0.45, 0.42, litM(L.rep(OAK, 0.8, 0.8), 0x8a5a34), 0, 0.225, 0, ns); clock3D(scene, -0.2, 0.46, 1.18, 0.62, 0.1);
    moon3D(scene, 0.85, 1.7, -0.6, 0.3); return (t) => ch.drive(t, [still('wake_sit_up', 9)], [[-99, 'surprised', 'gasp']], false); }, 'SLEPT|TWICE?', 0.3);
  // C: the night split in two: "Zz" | 3:00 | "Zz" over her, she points at the clock
  cover('expedition', (scene) => { clock3D(scene, 0.32, 0.0, 0.25, 1.0, -0.2); zz3D(scene, 0.1, 1.55, 0.4, 0.3).rotation.set(-0.3, 0.2, 0.1); zz3D(scene, 0.75, 1.15, 0.3, 0.3).rotation.set(-0.3, -0.1, -0.1);
    const ch = hero(scene, { p: [-0.32, 0, 0.8], ry: 0.25 }); return (t) => ch.drive(t, [still('point', 0.8)], [[-99, 'surprised', 'talkO']], false); }, 'TWO|SLEEPS?', 0.3);
