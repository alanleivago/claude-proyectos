# user fixes on approval: 3D North Star + 3D star sky + 3D clouds; fog volumes (shot 1, shot 12) with rocks close; 3D "?" on her head; a different ship for the sextant shot
import os, re
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine", "d07_body.js"); s = open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
L0 = s.split("\n")
# ---- helpers (before starHill)
HELP = """  // 3D star: an extruded, bevelled 5-point star with a soft glow shell and a light
  function star3D(parent, x, y, z, r = 0.3, col = 0xfff6c8) { const sh = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; const px = Math.cos(a) * rr, py = Math.sin(a) * rr; if (k) sh.lineTo(px, py); else sh.moveTo(px, py); }
    const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); const geo = new THREE.ExtrudeGeometry(sh, { depth: r * 0.35, bevelEnabled: true, bevelThickness: r * 0.12, bevelSize: r * 0.08, bevelSegments: 1 }); geo.center();
    L.mesh(geo, new THREE.MeshBasicMaterial({ color: col }), 0, 0, 0, g); L.mesh(new THREE.IcosahedronGeometry(r * 1.7, 1), new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.18, depthWrite: false }), 0, 0, 0, g);
    L.mesh(new THREE.IcosahedronGeometry(r * 2.6, 1), new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.07, depthWrite: false }), 0, 0, 0, g); const pl = new THREE.PointLight(0xfff0c0, 1.5, 6); g.add(pl); return g; }
  function starSky(scene, n = 170) { const m = new THREE.MeshBasicMaterial({ color: 0xf4f0d8 }), m2 = new THREE.MeshBasicMaterial({ color: 0xc8d8ff }), geo = new THREE.OctahedronGeometry(1, 0);
    for (let i = 0; i < n; i++) { const a = -2.6 + hash(i) * 2.1, e = 0.18 + hash(i + 500) * 1.1, r = 26; const o = new THREE.Mesh(geo, i % 3 ? m : m2); o.position.set(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r); o.scale.setScalar(0.05 + hash(i + 900) * 0.07); o.rotation.set(i, i * 2, 0); scene.add(o); } }
  function cloud3D(parent, x, y, z, s = 1, col = 0x4a5474) { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g); const m = new THREE.MeshLambertMaterial({ color: col, flatShading: true });
    for (const [px, py, r] of [[0, 0, 0.5], [0.55, -0.08, 0.4], [-0.55, -0.1, 0.38], [0.25, 0.25, 0.38], [-0.25, 0.2, 0.34], [0.95, -0.15, 0.28], [-0.95, -0.15, 0.26]]) L.mesh(new THREE.IcosahedronGeometry(r, 0), m, px, py, 0, g); return g; }
  function fogBank(parent, x, z, s = 1, op = 0.55) { const g = new THREE.Group(); g.position.set(x, 0.2, z); g.scale.set(s, s * 0.45, s); parent.add(g); const m = new THREE.MeshLambertMaterial({ color: 0xe8eef4, transparent: true, opacity: op, depthWrite: false, flatShading: true });
    for (const [px, py, r] of [[0, 0.3, 0.9], [0.9, 0.15, 0.7], [-0.9, 0.12, 0.75], [0.4, 0.75, 0.6], [-0.45, 0.65, 0.55]]) L.mesh(new THREE.IcosahedronGeometry(r, 1), m, px, py, 0, g); return g; }
  // a 3D extruded "?" parented to her head bone (pops in at tq, moves with her head)
  function q3D(scene, ch, tq) { const g = letters3D(scene, '?', { size: 0.2, x: 0, y: 0, z: 0, jitter: 0.3, seed: 3 }); g.visible = false; let hd = null; ch.root.traverse((o) => { if (!hd && o.isBone && o.name === 'Head') hd = o; }); let s0 = 1, done = false;
    return (t) => { if (!done) { done = true; ch.root.updateMatrixWorld(true); const p2 = hd.getWorldPosition(V3([0, 0, 0])); g.position.copy(p2).add(V3([0.22, 0.32, 0.05])); g.rotation.set(0, ch.root.rotation.y, 0.15); g.updateMatrixWorld(true); hd.attach(g); s0 = g.scale.x; }
      const f = (q15(t) - tq) * 30; g.visible = f >= 0; g.scale.setScalar(s0 * (f < 0 ? 0.01 : f < 3 ? [0.6, 1.15, 0.97][Math.floor(f)] : 1)); }; }
  // the second ship: a different vessel (navy hull with gold trim, two masts, cream sails with a red stripe, ratlines)
  function shipDeck2(scene) { L.addSky(scene, { near: 25, far: 110, preset: 'morning' }); scene.fog = null; const sea = seaPlane(scene, 0x2f80d0); const nv = litM(null, 0x1f3a6a), gd = litM(null, 0xd8b040);
    L.box(6, 0.12, 3.6, litM(L.rep(PLANK, 6, 4), 0xf0e0c0), 0, 0.0, 0.4, scene); for (const s2 of [-1, 1]) { L.box(6, 0.55, 0.12, nv, 0, 0.33, 0.4 + s2 * 1.75, scene); L.box(6, 0.06, 0.16, gd, 0, 0.62, 0.4 + s2 * 1.75, scene); L.box(6, 0.05, 0.14, gd, 0, 0.18, 0.4 + s2 * 1.76, scene); }
    const SAILS = tx(16, 16, (c) => { c.fillStyle = '#f2e8cc'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#c83a2a'; c.fillRect(0, 6, 16, 3); c.fillStyle = '#e0d4b4'; for (let x = 4; x < 16; x += 5) c.fillRect(x, 0, 1, 16); });
    for (const [mx, h] of [[-2.2, 5.0], [0.9, 4.4]]) { L.mesh(new THREE.CylinderGeometry(0.09, 0.12, h, 8), mm(MT.darkWood, 0.3, 3), mx, h / 2, -1.0, scene); L.box(2.0, 0.07, 0.07, mm(MT.darkWood, 2, 0.2), mx, h - 0.4, -1.0, scene); L.box(1.9, 1.6, 0.04, litM(L.rep(SAILS, 1, 1), 0xffffff), mx, h - 1.3, -0.95, scene);
      for (let k = 0; k < 6; k++) { const A = V3([mx, h - 0.5, -1.0]), B = V3([mx - 0.9 + k * 0.36, 0.62, -1.35]); const r = L.mesh(new THREE.CylinderGeometry(0.01, 0.01, A.distanceTo(B), 4), litM(null, 0x3a3a3a), 0, 0, 0, scene); r.position.copy(A).lerp(B, 0.5); r.quaternion.setFromUnitVectors(V3([0, 1, 0]), B.clone().sub(A).normalize()); } }
    const fl = L.box(0.5, 0.3, 0.02, litM(null, 0xe83a2a), -2.2 + 0.25, 4.85, -1.0, scene); islandHill(scene, -5, -11, 1.8); L.mesh(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff2a0 }), 3.0, 5.0, -9, scene);
    pottedTree(scene, 2.4, 1.4, 0.5); pottedTree(scene, -2.6, 1.5, 0.45); scene.add(new THREE.AmbientLight(0xfff0d8, 0.45)); return sea; }
"""
rep("  function starHill(scene) {", HELP + "  function starHill(scene) {")
# ---- starHill: 3D stars + a 3D North Star + 3D clouds (passing IN FRONT of the star)
i = s.index("    const pts = []; for (let i = 0; i < 420; i++)"); j = s.index("    const hill = L.mesh(new THREE.SphereGeometry(6, 14, 6", i)
s = s[:i] + """    starSky(scene); const polaris = star3D(scene, 0.7, 3.6, -5, 0.32); for (const [x, y] of [[0.4, -0.6], [0.15, -1.1], [0.5, -1.55], [1.05, -1.5], [1.25, -2.0], [0.8, -2.15]]) star3D(polaris, x, y, 0, 0.09, 0xe8ecff).children.forEach((c, k) => { if (k > 0) c.visible = k < 2; });
""" + s[j:]
rep("const clouds = new THREE.Group(); scene.add(clouds); for (let k = 0; k < 5; k++) L.box(1.4 + hash(k) * 0.8, 0.4 + hash(k + 9) * 0.25, 0.5, new THREE.MeshLambertMaterial({ color: 0x3a4460, flatShading: true }), k * 0.9, 4.5 + (hash(k + 3) - 0.5) * 0.6, -5.6, clouds);",
    "const clouds = new THREE.Group(); scene.add(clouds); for (let k = 0; k < 3; k++) cloud3D(clouds, k * 1.5, 3.6 + (hash(k + 3) - 0.5) * 0.5, -4.4, 0.9 + hash(k) * 0.3);")
# ---- shot 1/2: fog volumes, open sea, the boat clearly seen from above with her in it
rep("SH([1, 'A'], 'C', (t0) => { const scene = new THREE.Scene(); L.addSky(scene, { near: 5, far: 22, preset: 'morning' }); const sea = seaPlane(scene, 0x3a6a9a); const bt = rowboat(scene, 0, 0.3); const ch = hero(scene, { p: [-0.2, 0.12, 0.3], ry: 0.2 });\n    const cam = CAM([[0.2, 1.2, 4.0], [0.15, 1.15, 3.7]], [[0, 1.0, 0.2]], 46);",
    "SH([1, 'A'], 'C', (t0) => { const scene = new THREE.Scene(); L.addSky(scene, { near: 6, far: 26, preset: 'morning' }); const sea = seaPlane(scene, 0x3a6a9a); const bt = rowboat(scene, 0, 0.3); bt.scale.setScalar(1.15); const ch = hero(scene, { p: [-0.2, 0.12, 0.3], ry: 0.2 });\n"
    "    for (const [x, z, s2] of [[-2.6, -1.5, 1.6], [2.4, -2.2, 1.8], [-1.0, -4.5, 2.4], [1.6, -5.5, 2.2], [-3.4, 0.8, 1.3], [3.2, 0.5, 1.4]]) fogBank(scene, x, z, s2);\n"
    "    const cam = CAM([[0.6, 2.3, 4.4], [0.55, 2.25, 4.2]], [[0, 0.75, 0.2]], 46);")
rep("SH([1, 'So', 2], 'C', (t0) => { const scene = new THREE.Scene(); L.addSky(scene, { near: 5, far: 22, preset: 'morning' }); const sea = seaPlane(scene, 0x3a6a9a); rowboat(scene, 0, 0.3);",
    "SH([1, 'So', 2], 'C', (t0) => { const scene = new THREE.Scene(); L.addSky(scene, { near: 6, far: 26, preset: 'morning' }); const sea = seaPlane(scene, 0x3a6a9a); rowboat(scene, 0, 0.3); for (const [x, z, s2] of [[-2.2, -1.8, 1.6], [2.2, -2.4, 1.8], [0.2, -4.6, 2.4]]) fogBank(scene, x, z, s2);")
# ---- shot 12: rocks close to the ship + fog volumes
rep("if (rocks) for (let i = 0; i < 6; i++) { const o = L.mesh(new THREE.DodecahedronGeometry(0.5 + hash(i) * 0.6, 0), mm(MT.stone, 1, 1, 0x7a7a72), 1.5 + (hash(i + 1) - 0.5) * 3, 0.2, -4.5 - hash(i + 2) * 2, scene); o.rotation.set(i, i * 2, 0); }",
    "if (rocks) { for (let i = 0; i < 7; i++) { const o = L.mesh(new THREE.DodecahedronGeometry(0.35 + hash(i) * 0.5, 0), mm(MT.stone, 1, 1, 0x6a6a64), 0.6 + hash(i + 1) * 2.4, 0.15 + hash(i + 4) * 0.3, -2.4 - hash(i + 2) * 1.6, scene); o.rotation.set(i, i * 2, 0); const f = L.mesh(new THREE.TorusGeometry(0.4 + hash(i) * 0.5, 0.05, 4, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }), o.position.x, 0.03, o.position.z, scene); f.rotation.x = Math.PI / 2; }\n"
    "      for (const [x, z, s2] of [[-2.2, -3.0, 2.0], [3.4, -4.4, 2.2], [0.5, -6.0, 2.6], [-3.6, -0.6, 1.4]]) fogBank(scene, x, z, s2, 0.5); }")
rep("const ch = hero(scene, { p: [0.2, 0.06, 0.7], ry: -0.5 }); sepia(scene, [ch]); const cam = CAM([[0.6, 1.5, 3.8], [0.6, 1.5, 3.6]], [[0.1, 1.2, -0.5]], 50);",
    "const ch = hero(scene, { p: [-0.1, 0.06, 0.7], ry: -0.6 }); sepia(scene, [ch]); const cam = CAM([[-0.4, 1.7, 3.9], [-0.4, 1.7, 3.7]], [[0.5, 1.0, -0.8]], 52);")
# ---- shot 14: the second, different ship
rep("SH([7, 'Add'], 'C', (t0) => { const scene = new THREE.Scene(); const sea = shipDeck(scene);", "SH([7, 'Add'], 'C', (t0) => { const scene = new THREE.Scene(); const sea = shipDeck2(scene);")
# ---- 3D "?" on her head instead of the 2D FX
lines = s.split("\n"); out = []; pend = False
for ln in lines:
    m = re.search(r"const fx = new FX\(LW, LH\)\.add\('question', \{ obj: ch\.root, bone: 'Head', offset: \[0\.16, 0\.42, 0\], t0: (.+?) ?, dur: 99 \}\);", ln)
    if m: ln = ln.replace(m.group(0), "const fx = new FX(LW, LH); const qm = q3D(scene, ch, " + m.group(1).strip() + ");"); pend = True
    elif pend and "return { scene, cam, fx, upd(t)" in ln:
        k = ln.rindex("} }; });"); ln = ln[:k] + "qm(t); } }; });" + ln[k + 8:]; pend = False
    out.append(ln)
s = "\n".join(out); assert s.count("q3D(scene, ch,") == 6, s.count("q3D(scene, ch,"); assert s.count("qm(t);") == 5
open(p, "w", encoding="utf-8").write(s); print("ok")
