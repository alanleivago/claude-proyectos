import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine", "d06_body.js")
s = open(p, encoding="utf-8").read()
R = [
# stews sign low enough to be seen in shot 7, hidden in the Henry card (shot 8)
("const sg = new THREE.Group(); sg.position.set(0.05, 2.6, -1.6);", "const sg = new THREE.Group(); sg.position.set(-0.85, 2.0, -1.6);"),
("ivy(scene, 3.4, 1.5, -1.83, 0.9, 2.6);\n    scene.add(new THREE.AmbientLight(0xffe0c0, 0.45)); }", "ivy(scene, 3.4, 1.5, -1.83, 0.9, 2.6);\n    scene.add(new THREE.AmbientLight(0xffe0c0, 0.45)); return { sg }; }"),
("SH([4, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); stewsHall(scene);", "SH([4, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); stewsHall(scene).sg.visible = false;"),
# sitting in tubs: raise her so head + shoulders + chest clear the rim
("const ch = hero(scene, { p: [0.05, 0.04, 0.1], ry: 0.05 });", "const ch = hero(scene, { p: [0.05, 0.2, 0.1], ry: 0.05 });"),
("const ch = hero(scene, { p: [-0.2, 0.03, 0.2], ry: 0.25 }); sepia(scene, [ch]); const cam = CAM([[0.0, 1.5, 4.3], [0.0, 1.48, 4.1]], [[-0.1, 0.95, 0.0]], 52);",
 "const ch = hero(scene, { p: [-0.2, 0.17, 0.2], ry: 0.25 }); sepia(scene, [ch]); const cam = CAM(SIDE ? [[3.6, 1.0, 0.3]] : [[0.0, 1.45, 3.8], [0.0, 1.43, 3.6]], SIDE ? [[-0.2, 0.7, 0.3]] : [[-0.15, 0.95, 0.0]], 52);"),
("[['bank_teller', 'olive', 0.85, -0.3, 0.95]", "[['bank_teller', 'olive', 0.7, -0.3, 0.95]"),
("const ch = hero(scene, { p: [0.15, 0.03, 0.2], ry: 0.15 });", "const ch = hero(scene, { p: [0.15, 0.17, 0.2], ry: 0.15 });"),
# Henry fully inside the frame
("L.box(1.0, 0.16, 0.9, mm(MT.carved, 1, 0.3), 0.6, 0.08, -0.5, scene); henryVIII(scene, 0.6, -0.5, 1.0, -0.3);", "L.box(1.0, 0.16, 0.9, mm(MT.carved, 1, 0.3), 0.45, 0.08, -0.5, scene); henryVIII(scene, 0.45, -0.5, 1.0, -0.3);"),
("const ch = hero(scene, { p: [-0.35, 0, 0.9], ry: 0.3 });", "const ch = hero(scene, { p: [-0.45, 0, 0.9], ry: 0.3 });"),
]
for a, b in R:
    assert s.count(a) == 1, a[:70]
    s = s.replace(a, b)
s = s.replace("  const IN = (ch, y) => { ch.root.position.y = y; };", "  const IN = (ch, y) => { ch.root.position.y = y; }; const SIDE = /side/.test(location.search);")
# side-view check cameras for the pool, the stew tub and the shirt
s = s.replace("const cam = CAM([[0.3, 1.5, 3.9], [0.25, 1.48, 3.7]], [[0.0, 1.0, -0.3]], 50);", "const cam = CAM(SIDE ? [[3.8, 1.0, -0.2]] : [[0.3, 1.5, 3.9], [0.25, 1.48, 3.7]], [[0.0, 0.7, -0.25]], 50);")
s = s.replace("const cam = CAM([[0.15, 1.45, 3.9], [0.13, 1.43, 3.7]], [[0.05, 1.05, 0.2]], 48);", "const cam = CAM(SIDE ? [[3.6, 1.1, 0.1]] : [[0.15, 1.45, 3.9], [0.13, 1.43, 3.7]], SIDE ? [[0.05, 0.8, 0.1]] : [[0.05, 1.05, 0.2]], 48);")
s = s.replace("const cam = CAM([[0.1, 1.25, 3.8], [0.08, 1.23, 3.65]], [[0.05, 1.2, 0.5]], 48);", "const cam = CAM(SIDE ? [[2.6, 1.3, 0.85]] : [[0.1, 1.25, 3.8], [0.08, 1.23, 3.65]], SIDE ? [[-0.1, 1.2, 0.85]] : [[0.05, 1.2, 0.5]], 48);")
assert s.count("SIDE ?") >= 7
open(p, "w", encoding="utf-8").write(s); print("ok")
