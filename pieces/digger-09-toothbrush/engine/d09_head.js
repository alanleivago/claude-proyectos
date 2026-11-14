  // ===================================== DIGGER 08: "how people listened to music before Spotify" (cat.explains.it format, vertical) =====================================
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
    letters3D(g, 'X', { size: 0.034, x: -w / 2 + 0.06, y: 0.0, z: 0.02, jitter: 0.4, front: 0xffffff, side: 0x9ab0c0 });
    const cells = []; for (let i = 0; i < 5; i++) { const on = new THREE.MeshBasicMaterial({ color: 0x5cff7a }), off = new THREE.MeshBasicMaterial({ color: 0x24303a });
      const c = L.box(0.038, 0.06, 0.02, off, -w / 2 + 0.135 + i * 0.046, 0, 0.02, g); const hi = L.box(0.03, 0.008, 0.022, new THREE.MeshBasicMaterial({ color: 0xb8ffc8 }), -w / 2 + 0.135 + i * 0.046, 0.022, 0.022, g); hi.visible = false; cells.push([c, on, off, hi]); }
    return (t) => { const [n, fl] = lvAt(t); const blink = fl && Math.floor(t * 10) % 2; cells.forEach(([c, on, off, hi], i) => { const lit = i < n || (blink && i === n); c.material = lit ? on : off; hi.visible = lit; }); }; }
  // ---- sets and props ----
  const SEPIA = [1.05, 0.78, 0.48];
  const sepia = (scene, keep = []) => { keep = keep.map((k) => k.root || k); if (scene.background && scene.background.isColor) scene.background.multiply(new THREE.Color(...SEPIA)); scene.add(new THREE.PointLight(0xffb060, 1.6, 6).translateY(2.2).translateZ(1.2)); grade(scene, SEPIA, { lit: true, skip: (o) => { let p = o; while (p) { if (keep.includes(p)) return true; p = p.parent; } return false; } }); };
  function waterBox(parent, w, d, y, x, z, col = 0x4a9ad8, op = 0.75) { return L.box(w, 0.04, d, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op }), x, y, z, parent); }
  function crownOf(n) { const h = headInfo(n), r = Math.max(h.rx, h.rz), g = new THREE.Group(), gold = litM(null, 0xf0c030);
    L.mesh(new THREE.CylinderGeometry(r * 1.05, r * 1.05, r * 0.5, 10, 1, true), gold, 0, r * 0.15, 0, g); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; L.mesh(new THREE.ConeGeometry(r * 0.18, r * 0.4, 4), gold, Math.sin(a) * r * 1.0, r * 0.55, Math.cos(a) * r * 1.0, g); }
    L.mesh(new THREE.SphereGeometry(r * 0.12, 6, 4), litM(null, 0xd83030), 0, r * 0.2, r * 1.05, g); return seat(n, g); }
