# approval fixes: distinct sets (palette, wall material, lighting), a real tinfoil CYLINDER phonograph, eyes open, no sepia wash
import os, re
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine", "d08_body.js"); s = open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
# ---- room(): wainscot option, floor tint, its own light; textures per era
rep("function room(scene, { wall = 0xe8d8b8, wallTex = null, floor = PLANK, floorTint = 0xffffff, win = 'green', wx = 1.2, preset = 'interior' } = {}) {",
    "function room(scene, { wall = 0xe8d8b8, wallTex = null, floor = PLANK, floorTint = 0xffffff, win = 'green', wx = 1.2, preset = 'interior', wains = null, amb = 0xffffff, ambI = 0.4, wrep = [8, 3] } = {}) {")
rep("const wm = litM(wallTex ? L.rep(wallTex, 8, 3) : null, wall);", "const wm = litM(wallTex ? L.rep(wallTex, wrep[0], wrep[1]) : null, wall); scene.add(new THREE.AmbientLight(amb, ambI));")
rep("    windowBox(scene, wx, 1.12, -1.6, 0.9); return w; }", "    if (wains) { L.box(9, 1.0, 0.04, litM(L.rep(wains, 9, 1), 0xffffff), 0, 0.5, -1.72, scene); L.box(0.04, 1.0, 7, litM(L.rep(wains, 7, 1), 0xffffff), -2.72, 0.5, 0.5, scene); L.box(9, 0.06, 0.08, litM(null, 0xf4ecd8), 0, 1.02, -1.7, scene); }\n    windowBox(scene, wx, 1.12, -1.6, 0.9); return w; }")
TEX = """  const PANELP = tx(16, 16, (c) => { c.fillStyle = '#f2d4dc'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#fae6ea'; c.fillRect(2, 2, 12, 12); c.fillStyle = '#e4bcc6'; c.fillRect(2, 13, 12, 1); c.fillRect(13, 2, 1, 12); });
  const PANELM = tx(16, 16, (c) => { c.fillStyle = '#bfe0d4'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#d4eee4'; c.fillRect(2, 2, 12, 12); c.fillStyle = '#a4cbbd'; c.fillRect(2, 13, 12, 1); c.fillRect(13, 2, 1, 12); });
  const HERRING = tx(16, 16, (c) => { c.fillStyle = '#d8a868'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#c08a4c'; for (let i = 0; i < 16; i += 4) for (let j = 0; j < 16; j += 4) { if (((i + j) / 4) % 2) c.fillRect(i, j, 4, 1); else c.fillRect(i, j, 1, 4); } });
  const WHITEW = tx(16, 16, (c) => { c.fillStyle = '#f4f2ea'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#e4e0d4'; for (let y = 0; y < 16; y += 4) c.fillRect(0, y, 16, 1); c.fillStyle = '#ece8dc'; for (let i = 0; i < 8; i++) c.fillRect((i * 5) % 15, (i * 7) % 15, 2, 1); });
  const DAMASK = tx(16, 16, (c) => { c.fillStyle = '#2f5a3a'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#4e8a5a'; for (const [x, y] of [[4, 4], [12, 12]]) { c.fillRect(x - 1, y - 3, 2, 6); c.fillRect(x - 3, y - 1, 6, 2); c.fillRect(x - 2, y - 2, 4, 4); } c.fillStyle = '#c8b060'; c.fillRect(4, 4, 1, 1); c.fillRect(12, 12, 1, 1); });
  const DECO = tx(16, 16, (c) => { c.fillStyle = '#163a3a'; c.fillRect(0, 0, 16, 16); c.strokeStyle = '#e0b850'; c.lineWidth = 1; for (const [x, y] of [[8, 16], [0, 8], [16, 8]]) for (const r of [3, 6]) { c.beginPath(); c.arc(x, y, r, Math.PI, 2 * Math.PI); c.stroke(); } c.fillStyle = '#e0b850'; c.fillRect(7, 0, 2, 2); });
  const STONEF = tx(16, 16, (c) => { c.fillStyle = '#b8bcc4'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#9aa0aa'; c.fillRect(0, 7, 16, 1); c.fillRect(7, 0, 1, 16); c.fillStyle = '#c8ccd4'; c.fillRect(1, 1, 5, 1); c.fillRect(9, 9, 5, 1); });
  function candles(scene, x, y, z, n = 3) { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); L.mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.05, 8), litM(null, 0xd8b040), 0, 0, 0, g); L.mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6), litM(null, 0xd8b040), 0, 0.15, 0, g);
    for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2, r = k ? 0.12 : 0; L.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 6), litM(null, 0xf8f0d8), Math.cos(a) * r, 0.36, Math.sin(a) * r, g); L.mesh(new THREE.ConeGeometry(0.015, 0.05, 5), L.basic(null, 0xffb030), Math.cos(a) * r, 0.46, Math.sin(a) * r, g); }
    const pl = new THREE.PointLight(0xffb060, 1.6, 4); pl.position.set(x, y + 0.5, z + 0.2); scene.add(pl); return g; }
  function sconce(scene, x, y, z) { L.box(0.06, 0.2, 0.06, litM(null, 0xc8a040), x, y, z, scene); const gl = L.mesh(new THREE.SphereGeometry(0.08, 8, 6), L.basic(null, 0xffd890), x, y + 0.15, z + 0.06, scene); gl.scale.y = 1.3; const pl = new THREE.PointLight(0xffa040, 1.5, 4); pl.position.set(x, y + 0.2, z + 0.4); scene.add(pl); }
  function wallClock(scene, x, y, z, r = 0.16, col = 0x8a5a2a) { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); L.mesh(new THREE.CylinderGeometry(r, r, 0.06, 16), litM(null, col), 0, 0, 0, g).rotation.x = Math.PI / 2; L.mesh(new THREE.CylinderGeometry(r * 0.85, r * 0.85, 0.065, 16), litM(null, 0xfaf6ea), 0, 0, 0.003, g).rotation.x = Math.PI / 2;
    L.box(0.012, r * 0.7, 0.01, litM(null, 0x1a1a24), 0, r * 0.3, 0.04, g); const h = L.box(0.012, r * 0.5, 0.01, litM(null, 0x1a1a24), r * 0.15, -r * 0.1, 0.04, g); h.rotation.z = 2.2; return g; }
"""
rep("  // 3D music notes (extruded eighth notes)", TEX + "  // 3D music notes (extruded eighth notes)")
# ---- 1/2: 18th-c. parlor: pastel pink paneling over mint wainscot, herringbone parquet, candles, warm candle light
P18 = "room(scene, { wall: 0xffffff, wallTex: PANELP, wrep: [10, 4], wains: PANELM, floor: HERRING, win: 'green', amb: 0xffe0c0, ambI: 0.35 }); candles(scene, -0.2, 1.0, -1.55); candles(scene, 1.9, 0.0, -1.5, 5); pottedTree(scene, -2.2, 0.3, 0.55);"
rep("room(scene, { wall: 0x9ab8a0, wallTex: WALLQ('#9ab8a0', '#8aa890'), win: 'green' });", P18, 2)
# ---- Geneva: grey-white plaster, stone floor, wall clocks, watch parts on the bench, big Alps window, cool daylight
rep("function geneva(scene) { room(scene, { wall: 0xe8dcc0, wallTex: WALLQ('#e8dcc0', '#dccfae'), win: 'alps', wx: 1.1 });",
    "function geneva(scene) { const wg = room(scene, { wall: 0xdfe6ee, floor: STONEF, win: 'alps', wx: 1.1, amb: 0xc8d8ff, ambI: 0.55 }); wg.scale.set(1.5, 1.4, 1); const sun = new THREE.DirectionalLight(0xd8e8ff, 1.1); sun.position.set(2, 3, 2); scene.add(sun);\n"
    "    for (const [x2, y2, r, c2] of [[-0.2, 2.5, 0.18, 0x8a5a2a], [0.35, 2.75, 0.13, 0x3a3a40], [-0.65, 2.85, 0.12, 0xd8b040], [2.3, 2.4, 0.2, 0x6a3a1a]]) wallClock(scene, x2, y2, -1.72, r, c2);")
rep("L.box(1.6, 0.08, 0.6, mm(MT.wood, 2, 1), 0, 0.85, 0, bn);", "L.box(1.6, 0.08, 0.6, mm(MT.wood, 2, 1), 0, 0.85, 0, bn); for (let k = 0; k < 9; k++) { const gp = L.mesh(new THREE.CylinderGeometry(0.03 + hash(k) * 0.03, 0.03 + hash(k) * 0.03, 0.01, 10), litM(null, k % 2 ? 0xd8b040 : 0xd8dce4), -0.6 + k * 0.14, 0.9, (hash(k + 4) - 0.5) * 0.4, bn); }")
# ---- Edison: whitewashed walls, dark boards, long chemistry tables with jars, bulbs on wires
rep("function edisonLab(scene) { room(scene, { wall: 0xb8a888, wallTex: PLANK, win: 'green', wx: 1.4 });",
    "function edisonLab(scene) { room(scene, { wall: 0xffffff, wallTex: WHITEW, wrep: [9, 4], floor: PLANK, floorTint: 0x8a7a6a, win: 'green', wx: 1.4, amb: 0xfff4e0, ambI: 0.6 });\n"
    "    const tbl = new THREE.Group(); tbl.position.set(-0.6, 0, -1.25); scene.add(tbl); L.box(3.0, 0.07, 0.6, litM(null, 0x3a2a1a), 0, 0.9, 0, tbl); for (const x2 of [-1.4, 0, 1.4]) for (const z2 of [-0.25, 0.25]) L.box(0.06, 0.9, 0.06, litM(null, 0x2a1a10), x2, 0.45, z2, tbl);\n"
    "    for (let j = 0; j < 9; j++) L.mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.16 + hash(j) * 0.12, 8), new THREE.MeshBasicMaterial({ color: [0x5ac85a, 0x5a8ae8, 0xe8c040, 0xc85a5a, 0xf0f0f0][j % 5], transparent: true, opacity: 0.85 }), -1.3 + j * 0.32, 1.02, (hash(j + 3) - 0.5) * 0.3, tbl);\n"
    "    for (let k = 0; k < 4; k++) { const A = V3([-1.6 + k * 0.9, 2.95, -0.6]), B = V3([-0.7 + k * 0.9, 2.95, -0.6]); const wr = L.mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.9, 4), litM(null, 0x1a1a24), 0, 0, 0, scene); wr.position.copy(A).lerp(B, 0.5); wr.rotation.z = Math.PI / 2; }")
rep("for (const x2 of [-0.3, 0.5]) { const b = lightBulb(); b.position.set(x2, 2.5, -0.4);", "for (const x2 of [-1.6, -0.7, 0.2, 1.1]) { const b = lightBulb(); b.position.set(x2, 2.5, -0.6);")
rep("L.box(0.01, 0.8, 0.01, litM(null, 0x2a2a30), x2, 2.95, -0.4, scene); }", "L.box(0.01, 0.45, 0.01, litM(null, 0x2a2a30), x2, 2.75, -0.6, scene); const bl = new THREE.PointLight(0xfff0b0, 0.8, 3); bl.position.set(x2, 2.4, -0.4); scene.add(bl); }")
# ---- Victorian: green damask wallpaper, lace curtains and a lace doily, warm gaslight sconces
rep("function victorian(scene) { room(scene, { wall: 0x5a7a5a, wallTex: WALLQ('#5a7a5a', '#4a6a4a'), win: 'green', wx: 1.3 });",
    "function victorian(scene) { room(scene, { wall: 0xffffff, wallTex: DAMASK, wrep: [12, 5], floor: PLANK, floorTint: 0xb87a5a, win: 'green', wx: 1.3, amb: 0xffc890, ambI: 0.3 }); sconce(scene, 0.2, 1.8, -1.68); sconce(scene, 2.3, 1.8, -1.68);\n"
    "    const LACE = tx(8, 8, (c) => { c.fillStyle = '#f8f6f0'; c.fillRect(0, 0, 8, 8); c.fillStyle = '#d8d4c8'; for (let i = 0; i < 8; i += 2) { c.fillRect(i, 0, 1, 8); c.fillRect(0, i, 8, 1); } }); for (const s2 of [-1, 1]) L.box(0.3, 1.2, 0.03, litM(L.rep(LACE, 2, 6), 0xffffff), 1.3 + s2 * 0.62, 1.7, -1.6, scene);")
rep("L.box(0.03, 0.2, 0.03, litM(null, 0xd8a840), 0.15, 1.17, -0.15, g);", "L.box(0.03, 0.2, 0.03, litM(null, 0xd8a840), 0.15, 1.17, -0.15, g); L.mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.006, 14), litM(null, 0xf8f6f0), 0, 0.845, 0, g);")
# ---- 1920s: art-deco wallpaper, a sofa, a big rug, the lamp
rep("function twenties(scene) { room(scene, { wall: 0xe8c890, wallTex: WALLQ('#e8c890', '#d8b478'), win: 'green', wx: -1.2 });",
    "function twenties(scene) { room(scene, { wall: 0xffffff, wallTex: DECO, wrep: [12, 5], floor: HERRING, floorTint: 0x9a7050, win: 'green', wx: -1.2, amb: 0xffe0b0, ambI: 0.45 }); L.box(2.0, 0.03, 1.4, litM(L.rep(tx(8, 8, (c) => { c.fillStyle = '#2a6a7a'; c.fillRect(0, 0, 8, 8); c.fillStyle = '#e0b850'; c.fillRect(0, 0, 8, 1); c.fillRect(0, 7, 8, 1); c.fillRect(3, 3, 2, 2); }), 3, 2), 0xffffff), 0.2, 0.015, 0.5, scene);\n"
    "    const sf = new THREE.Group(); sf.position.set(-1.6, 0, -1.1); scene.add(sf); const vel = litM(null, 0x6a3a7a); L.box(1.6, 0.4, 0.7, vel, 0, 0.3, 0, sf); L.box(1.6, 0.5, 0.18, vel, 0, 0.65, -0.28, sf); for (const s2 of [-1, 1]) L.box(0.2, 0.45, 0.7, vel, s2 * 0.8, 0.5, 0, sf); const lpl = new THREE.PointLight(0xffc070, 1.2, 4); lpl.position.set(-1.9, 1.6, -0.9); scene.add(lpl);")
# ---- the 1877 tinfoil CYLINDER phonograph: base board, uprights, a threaded shaft, a foil-wrapped drum with grooves, a side crank, a small mouthpiece
i = s.index("  function phonograph(parent, x, z, ry = 0) {"); j = s.index("  function gramophone(", i)
s = s[:i] + """  function phonograph(parent, x, z, ry = 0) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g); const ir = litM(null, 0x2a2a30), br = litM(null, 0xc89a3a), w = mm(MT.wood, 1, 0.5, 0x8a5a2a);
    L.box(0.7, 0.04, 0.32, w, 0, 0.89, 0, g); for (const s2 of [-1, 1]) { L.box(0.04, 0.2, 0.05, ir, s2 * 0.28, 1.0, 0, g); L.box(0.08, 0.03, 0.12, ir, s2 * 0.28, 0.925, 0, g); }
    L.mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.72, 6), ir, 0, 1.06, 0, g).rotation.z = Math.PI / 2; for (let k = 0; k < 24; k++) { const xk = (k < 12 ? -0.27 + k * 0.012 : 0.135 + (k - 12) * 0.012); const th = L.mesh(new THREE.TorusGeometry(0.013, 0.003, 3, 8), ir, xk, 1.06, 0, g); th.rotation.y = Math.PI / 2; }
    const cyl = new THREE.Group(); cyl.position.set(0, 1.06, 0); g.add(cyl); const dr = L.mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.24, 16), litM(null, 0xeef2f6), 0, 0, 0, cyl); dr.rotation.z = Math.PI / 2; for (let k = 0; k < 9; k++) { const gv = L.mesh(new THREE.TorusGeometry(0.0655, 0.0025, 3, 16), litM(null, 0x8a8e98), -0.1 + k * 0.025, 0, 0, cyl); gv.rotation.y = Math.PI / 2; }
    const ck = new THREE.Group(); ck.position.set(0.36, 1.06, 0); g.add(ck); L.box(0.02, 0.14, 0.02, ir, 0, -0.06, 0, ck); L.mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.07, 6), w, 0.035, -0.12, 0, ck).rotation.z = Math.PI / 2;
    L.box(0.03, 0.14, 0.03, br, 0, 1.17, -0.06, g); const mp = new THREE.Group(); mp.position.set(0, 1.2, 0.05); mp.rotation.x = 0.9; g.add(mp); L.mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 12), br, 0, 0, 0, mp); const horn = L.mesh(new THREE.ConeGeometry(0.06, 0.13, 12, 1, true), litM(null, 0xd8a840), 0, 0.07, 0, mp); horn.material.side = THREE.DoubleSide; horn.rotation.x = Math.PI;
    const tb = new THREE.Group(); g.add(tb); L.box(0.9, 0.06, 0.55, mm(MT.wood, 1, 1), 0, 0.84, 0, tb); for (const [px, pz] of [[-0.4, -0.22], [0.4, -0.22], [-0.4, 0.22], [0.4, 0.22]]) L.box(0.05, 0.84, 0.05, mm(MT.darkWood, 0.2, 1), px, 0.42, pz, tb);
    g.userData.cyl = cyl; g.userData.horn = horn; g.userData.crank = ck; return g; }
""" + s[j:]
s = s.replace("ph.userData.cyl.rotation.x = q15(t) >= tB ? q15(t) * 6 : 0;", "ph.userData.cyl.rotation.x = q15(t) >= tB ? q15(t) * 6 : 0; ph.userData.crank.rotation.x = ph.userData.cyl.rotation.x;")
s = s.replace("ph.userData.cyl.rotation.x = q15(t) < tW ? q15(t) * 6 : 0;", "ph.userData.cyl.rotation.x = q15(t) < tW ? q15(t) * 6 : 0; ph.userData.crank.rotation.x = ph.userData.cyl.rotation.x;")
# shot 8: the mouthpiece faces her, the dynamic crank on the crank side, her head by the small horn
rep("const ph = phonograph(scene, 0.42, 0.1, -0.5); const ch = hero(scene, { p: [-0.25, 0, 0.55], ry: 0.55 });", "const ph = phonograph(scene, 0.3, 0.0, -0.75); ph.userData.crank.visible = false; const ch = hero(scene, { p: [-0.22, 0, 0.5], ry: 0.75 });")
rep("const pv = ph.localToWorld(V3([0.32, 1.06, 0])); const cr = crankTo(scene, pv, 0.16);", "const pv = ph.localToWorld(V3([0.36, 1.06, 0])); const cr = crankTo(scene, pv, 0.14);")
rep("rip = L.box(0.12, 0.02, 0.005, litM(null, 0x6a6a72), 0.1, 1.135, 0.27, scene);", "rip = L.box(0.1, 0.02, 0.005, litM(null, 0x4a4a52), 0.25, 1.13, 0.27, scene);")
# ---- no sepia wash (it made every era the same colour); era = set palette + light
s = re.sub(r" sepia\(scene, \[[^\]]*\]\);", "", s)
# ---- eyes open in key shots: no closed 'happy' eye cells
s = s.replace("'happy', 'talkA'", "'open', 'talkA'").replace("'happy', 'smileOpen'", "'open', 'smileOpen'").replace("'happy', 'smile'", "'open', 'smile'")
open(p, "w", encoding="utf-8").write(s); print("ok", s.count("'happy'"), s.count("sepia("))
