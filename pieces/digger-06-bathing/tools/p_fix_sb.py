import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine"))
s = open("d06_shots.js", encoding="utf-8").read()
def R(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
# labels live in camera space (always framed): slot 0 = under the meter, slot 1 = the line below; still extruded 3D, tilted
R("""  function label3D(scene, txt, x, y, z, tw, { size = 0.14, ry = 0, front, side } = {}) { const g = letters3D(scene, txt, { size, x, y, z, seed: txt.length * 7, front, side }); g.rotation.set(-0.15, ry, 0.03); g.visible = false;""",
  """  let CURCAM = null;
  function label3D(scene, txt, x, y, z, tw, { size = 0.14, ry = 0, front, side, slot = null } = {}) {
    if (slot === null) slot = /^\d{4}$/.test(txt) ? 0 : (size < 0.135 ? 1 : 0);
    const cam = CURCAM, d = 1.2, halfH = d * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), sz = Math.min(slot ? 0.055 : 0.08, 0.5 / (txt.length * 0.62));
    const g = letters3D(cam, txt, { size: sz, x: 0, y: halfH * (slot ? 0.38 : 0.56), z: -d, seed: txt.length * 7, front, side }); g.rotation.set(-0.25, 0.18, 0.03); g.visible = false;""")
R("    scene.add(cam); const g = new THREE.Group(); cam.add(g);", "    scene.add(cam); CURCAM = cam; const g = new THREE.Group(); cam.add(g);")
R("const SEPIA = [1.0, 0.84, 0.6];", "const SEPIA = [1.05, 0.78, 0.48];")
R("const sepia = (scene, keep = []) => { keep = keep.map((k) => k.root || k);", "const sepia = (scene, keep = []) => { keep = keep.map((k) => k.root || k); if (scene.background && scene.background.isColor) scene.background.multiply(new THREE.Color(...SEPIA)); scene.add(new THREE.PointLight(0xffb060, 1.6, 6).translateY(2.2).translateZ(1.2));")
# every shot: build the meter BEFORE the labels (labels use CURCAM) -- reorder where label3D comes before meter()
# framings (full body, head ~38 % from the top, under the labels)
rep = [
 ("CAM([[0.1, 1.05, 3.1], [0.08, 1.03, 2.85]], [[0, 0.95, 0.3]], 44)", "CAM([[0.1, 1.15, 3.5], [0.08, 1.13, 3.3]], [[0, 1.2, 0.3]], 46)"),
 ("CAM([[0.1, 1.25, 1.9], [0.1, 1.25, 1.8]], [[0, 1.15, 0.4]], 44)", "CAM([[0.9, 1.25, 2.6], [0.85, 1.25, 2.5]], [[0, 1.3, 0.4]], 44)"),
 ("CAM([[0.1, 1.0, 2.9], [0.08, 0.98, 2.7]], [[0, 0.85, 0.3]], 46)", "CAM([[0.1, 1.1, 3.4], [0.08, 1.08, 3.2]], [[0, 1.15, 0.3]], 46)"),
 ("CAM([[0.6, 1.4, 3.6], [0.5, 1.38, 3.4]], [[0, 0.8, -0.3]], 52)", "CAM([[0.2, 1.5, 4.2], [0.15, 1.48, 4.0]], [[-0.2, 1.1, 0.0]], 52)"),
 ("CAM([[0.15, 1.15, 2.6], [0.13, 1.13, 2.45]], [[0.05, 1.0, 0.6]], 44)", "CAM([[0.15, 1.15, 3.6], [0.13, 1.13, 3.45]], [[0.05, 1.2, 0.7]], 44)"),
 ("CAM([[0.2, 1.6, 2.8], [0.18, 1.55, 2.65]], [[0, 0.4, -0.5]], 50)", "CAM([[0.4, 1.6, 3.4], [0.38, 1.55, 3.25]], [[0.3, 0.75, -0.3]], 50)"),
 ("CAM([[0.1, 1.2, 3.3], [0.08, 1.18, 3.1]], [[0, 0.85, 0]], 50)", "CAM([[0.1, 1.25, 3.7], [0.08, 1.23, 3.5]], [[0, 1.15, 0]], 50)"),
 ("CAM([[0.1, 1.25, 3.4], [0.08, 1.23, 3.2]], [[0, 1.0, 0]], 50)", "CAM([[0.1, 1.35, 4.4], [0.08, 1.33, 4.2]], [[0.05, 1.3, 0]], 50)"),
 ("CAM([[0.1, 1.2, 3.2], [0.08, 1.18, 3.0]], [[0, 0.95, 0.1]], 50)", "CAM([[0.1, 1.3, 4.0], [0.08, 1.28, 3.8]], [[0, 1.2, 0.1]], 50)"),
 ("CAM([[0.15, 1.15, 3.0], [0.13, 1.13, 2.85]], [[0.1, 1.0, 0.4]], 48)", "CAM([[0.25, 1.2, 3.7], [0.23, 1.18, 3.55]], [[0.2, 1.2, 0.4]], 48)"),
 ("CAM([[0.4, 1.4, 3.6], [0.38, 1.38, 3.4]], [[0.4, 0.75, 0.0]], 52)", "CAM([[0.4, 1.5, 4.4], [0.38, 1.48, 4.2]], [[0.4, 1.05, 0.0]], 52)"),
 ("CAM([[0.1, 1.3, 2.4], [0.08, 1.28, 2.25]], [[0.0, 0.7, 0.3]], 50)", "CAM([[0.1, 1.4, 3.3], [0.08, 1.38, 3.15]], [[-0.05, 1.0, 0.3]], 50)"),
 ("CAM([[0.2, 1.45, 3.6], [0.2, 1.43, 3.4]], [[0.2, 1.4, 0]], 52)", "CAM([[0.2, 1.45, 4.3], [0.2, 1.43, 4.1]], [[0.2, 1.55, 0]], 52)"),
 ("CAM([[0.05, 1.5, 2.2], [0.05, 1.48, 2.1]], [[0.0, 1.35, 0]], 50)", "CAM([[0.05, 1.5, 3.4], [0.05, 1.48, 3.25]], [[0.0, 1.45, 0]], 50)"),
 ("CAM([[0.1, 1.3, 2.6], [0.08, 1.28, 2.4]], [[0.0, 1.15, -0.5]], 50)", "CAM([[0.1, 1.35, 3.2], [0.08, 1.33, 3.0]], [[0.0, 1.3, -0.5]], 50)"),
 ("CAM([[0.1, 1.1, 3.2], [0.1, 1.15, 3.6]], [[0.1, 1.05, 0.3]], 48)", "CAM([[0.1, 1.15, 3.4], [0.1, 1.2, 3.8]], [[0.0, 1.2, 0.3]], 48)"),
]
for a, b in rep: R(a, b)
# positions: shot 6 she inside the frame; shot 8 king smaller + her closer; shot 10 her centred; tubs smaller
R("const ch = hero(scene, { p: [0.9, 0, 0.75], ry: -0.6 }); sepia(scene, [ch]); const cam = CAM([[0.4,", "const ch = hero(scene, { p: [0.75, 0, 0.9], ry: -0.5 }); sepia(scene, [ch]); const cam = CAM([[0.4,")
R("const k = npcAt(scene, 'bank_teller', 'olive', -0.45, -0.1, 0.25, 1.3);", "const k = npcAt(scene, 'bank_teller', 'olive', -0.45, -0.1, 0.25, 1.1);")
R("const ch = hero(scene, { p: [-0.25, 0, 0.75], ry: 0.25 }); const ns = nightshirt(); ns.position.set(0.6, 2.05, 0.3);", "const ch = hero(scene, { p: [-0.1, 0, 0.75], ry: 0.25 }); const ns = nightshirt(); ns.position.set(0.72, 1.85, 0.0);")
R("const T0 = tinTub(scene, 0.45, 0.25);", "const T0 = tinTub(scene, 0.45, 0.25); T0.g.scale.setScalar(0.75);")
R("const T0 = tinTub(scene, 0.3, 0.25, 0x6a5a38);", "const T0 = tinTub(scene, 0.35, 0.15, 0x6a5a38); T0.g.scale.setScalar(0.8);")
open("d06_shots.js", "w", encoding="utf-8").write(s); print("ok")
