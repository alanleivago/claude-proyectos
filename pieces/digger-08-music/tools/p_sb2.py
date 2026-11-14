# storyboard v1 stills check: music box below the face, she never at the frame edge
import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine", "d08_body.js"); s = open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
rep("const lid = L.box(0.27, 0.02, 0.19, w, 0, 0.17, -0.09, g); lid.rotation.x = -1.2;", "const lid = L.box(0.27, 0.02, 0.19, w, 0, 0.13, -0.17, g); lid.rotation.x = -0.45;")
rep("const mb = musicBox(); mb.scale.setScalar(1.3);\n    const hold = holdIn(ch, 'R', mb, [0.1, -0.06, 0.1]);", "const mb = musicBox(); mb.scale.setScalar(1.1);\n    const hold = holdIn(ch, 'R', mb, [0.1, -0.16, 0.12]);", 2)
rep("const cam = CAM([[0.0, 1.4, 3.3], [0.0, 1.38, 3.15]], [[0.1, 1.1, 0.4]], 48);", "const cam = CAM([[-0.1, 1.4, 3.9], [-0.1, 1.38, 3.75]], [[0.1, 1.1, 0.3]], 48);")
rep("const ph = phonograph(scene, 0.1, 0.2, -0.15); const ch = hero(scene, { p: [-0.45, 0, 0.7], ry: 0.35 });", "const ph = phonograph(scene, 0.25, 0.2, -0.15); const ch = hero(scene, { p: [-0.25, 0, 0.7], ry: 0.35 });")
rep("const gr = gramophone(scene, 0.3, 0.0, 0.0); const ch = hero(scene, { p: [-0.42, 0, 0.6], ry: 0.6 });", "const gr = gramophone(scene, 0.45, 0.0, 0.0); const ch = hero(scene, { p: [-0.22, 0, 0.6], ry: 0.6 });")
rep("const ch = hero(scene, { p: [-0.35, 0, 0.75], ry: 0.3 }); sepia(scene, [ch]);\n    const cam = CAM([[0.1, 1.5, 3.1], [0.1, 1.48, 3.0]], [[0.05, 1.1, 0.4]], 46);", "const ch = hero(scene, { p: [-0.2, 0, 0.75], ry: 0.3 }); sepia(scene, [ch]);\n    const cam = CAM([[0.1, 1.5, 3.3], [0.1, 1.48, 3.2]], [[0.1, 1.1, 0.4]], 46);")
rep("const ch = hero(scene, { p: [-0.4, 0, 0.6], ry: 0.3 }); const cam = CAM([[0.1, 1.3, 3.8], [0.1, 1.35, 4.1]], [[0.15, 1.2, 0]], 50);", "const ch = hero(scene, { p: [-0.2, 0, 0.6], ry: 0.3 }); const cam = CAM([[0.15, 1.3, 3.9], [0.15, 1.35, 4.2]], [[0.2, 1.2, 0]], 50);")
open(p, "w", encoding="utf-8").write(s); print("ok")
