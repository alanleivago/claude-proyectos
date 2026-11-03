import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine"))
s = open("d06_shots.js", encoding="utf-8").read()
def R(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
R("ch.drive(t, [seg('pinch_nose', t0 - 0.1)], [[-99, 'disgust', 'disgust']]); } }; });\n  // ===== 3.", "ch.drive(t, [seg('shake_head', t0 - 0.1)], [[-99, 'disgust', 'disgust']]); } }; });\n  // ===== 3.")
R("const ch = hero(scene, { p: [0.75, 0, 0.9], ry: -0.5 });", "const ch = hero(scene, { p: [0.45, 0, 1.0], ry: -0.4 });")
R("const ch = hero(scene, { p: [0.55, 0, 1.05], ry: -0.3 });", "const ch = hero(scene, { p: [0.35, 0, 1.05], ry: -0.3 });")
R("'WATER = DANGER?'", "'WATER DANGER?'")
R("ch.drive(t, [seg('hold_up_object', t0 - 0.3)], [[-99, 'open', 'smile'], [tP, 'happy', 'smileOpen'], [tW + 0.4, 'open', 'frown']]); scene.updateMatrixWorld(true); ch.fist('R', fp); pf.position.copy(fp).add(V3([0, 0.04, 0.06]));",
  "ch.drive(t, [seg('present', t0 - 0.3)], [[-99, 'open', 'smile'], [tP, 'happy', 'smileOpen'], [tW + 0.4, 'open', 'frown']]); scene.updateMatrixWorld(true); ch.fist('R', fp); pf.position.copy(fp).add(V3([0, 0.06, 0.04]));")
R("const ch = hero(scene, { p: [-0.2, 0, 0.95], ry: 0.3 }); sepia(scene, [ch]); const cam = CAM([[0.4, 1.5, 4.4], [0.38, 1.48, 4.2]], [[0.4, 1.05, 0.0]], 52);",
  "const ch = hero(scene, { p: [-0.05, 0, 0.95], ry: 0.3 }); sepia(scene, [ch]); const cam = CAM([[0.5, 1.5, 4.6], [0.48, 1.48, 4.4]], [[0.55, 1.05, 0.0]], 54);")
R("fam = [['bank_teller', 'olive', 1.35, -0.35, 1.0], ['homework_girl', 'red', 1.75, -0.15, 0.9], ['art_student', 'teal', 2.1, 0.05, 0.75]]", "fam = [['bank_teller', 'olive', 1.15, -0.45, 1.0], ['homework_girl', 'red', 1.45, -0.3, 0.9], ['art_student', 'teal', 1.7, -0.15, 0.75]]")
R("const T0 = tinTub(scene, 0.35, 0.15, 0x6a5a38); T0.g.scale.setScalar(0.8); const ch = hero(scene, { p: [-0.55, 0, 0.6], ry: 0.5 });", "const T0 = tinTub(scene, 0.4, 0.15, 0x6a5a38); T0.g.scale.setScalar(0.8); const ch = hero(scene, { p: [-0.35, 0, 0.75], ry: 0.45 });")
R("ch.drive(t, [seg('pinch_nose', t0 - 0.1)], [[-99, 'disgust', 'disgust']]); } }; });\n  // ===== 13.", "ch.drive(t, [seg('shake_head', t0 - 0.1)], [[-99, 'disgust', 'disgust']]); } }; });\n  // ===== 13.")
R("CAM([[0.1, 1.35, 3.2], [0.08, 1.33, 3.0]], [[0.0, 1.3, -0.5]], 50)", "CAM([[0.1, 1.45, 3.4], [0.08, 1.43, 3.2]], [[0.0, 1.55, -0.5]], 52)")
open("d06_shots.js", "w", encoding="utf-8").write(s); print("ok")
