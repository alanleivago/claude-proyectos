import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine", "d06_body.js")
s = open(p, encoding="utf-8").read()
R = [
# sit inside tubs (legs forward, inside the tub) instead of the one-knee kneel whose front foot poked through
("const KNEEL_IN = (t, t0) => [still('kneel', 1.5)];", "const KNEEL_IN = (t, t0) => [still('kneel', 1.5)]; const SIT_IN = () => [still('sit_floor', 1.5)];"),
# 5 strigil: left arm out toward camera (ry), strigil scrapes along it from the right fist
("const ch = hero(scene, { p: [0.15, 0, 1.15], ry: 0.2 }); sepia(scene, [ch]); const cam = CAM([[0.3, 1.2, 3.8], [0.28, 1.18, 3.65]], [[0.15, 1.2, 0.9]], 46); const mt = meter(scene, cam);\n    const sg = strigil(); sg.scale.setScalar(1.7); scene.add(sg); const fl = oilFlask(); fl.position.set(-0.55, 0.0, 1.25); fl.scale.setScalar(1.8); scene.add(fl); const fp = V3([0, 0, 0]);",
 "const ch = hero(scene, { p: [-0.15, 0, 1.15], ry: -0.75 }); sepia(scene, [ch]); const cam = CAM([[0.1, 1.2, 3.9], [0.08, 1.18, 3.75]], [[0.0, 1.15, 0.9]], 46); const mt = meter(scene, cam);\n    const sg = strigil(); sg.scale.setScalar(1.25); scene.add(sg); const fl = oilFlask(); fl.position.set(-0.6, 0.0, 1.4); fl.scale.setScalar(1.8); scene.add(fl); const fp = V3([0, 0, 0]), fq = V3([0, 0, 0]);"),
("ch.fist('R', fp); sg.position.copy(fp).add(V3([0.02, 0.0, 0.06])); sg.rotation.set(0, 0.3, -0.6 + 0.25 * Math.sin(q15(t) * 9)); } }; });",
 "ch.fist('R', fp); ch.fist('L', fq); const k = q15(t) < ws(3, 'scraped') ? 0.15 : 0.35 + 0.25 * Math.sin(q15(t) * 8); sg.position.copy(fp).lerp(fq, k).add(V3([0, 0.05, 0.04])); sg.rotation.set(0, 0.3 - 0.75, -0.6); } }; });"),
# 7 stews: sit in the tub
("const ch = hero(scene, { p: [0.05, 0.04, 0.32], ry: 0.05 }); sepia(scene, [ch]); const cam = CAM([[0.15, 1.45, 3.9]", "const ch = hero(scene, { p: [0.05, 0.04, 0.1], ry: 0.05 }); sepia(scene, [ch]); const cam = CAM([[0.15, 1.45, 3.9]"),
("ch.drive(t, KNEEL_IN(t, t0), [[-99, 'relaxed', 'smile'], [tS, 'happy', 'smileOpen'], [tR, 'surprised', 'gasp']]);", "ch.drive(t, SIT_IN(), [[-99, 'relaxed', 'smile'], [tS, 'happy', 'smileOpen'], [tR, 'surprised', 'gasp']]);"),
# 8 Henry on the right, she on the left points at him (her pointing arm goes screen-right)
("woodTub(scene, 0.95, 0.2, 0.5, 0.58); L.box(1.0, 0.16, 0.9, mm(MT.carved, 1, 0.3), -0.55, 0.08, -0.4, scene); henryVIII(scene, -0.55, -0.4, 1.0, 0.25);\n    const ch = hero(scene, { p: [0.3, 0, 0.95], ry: -0.35 });",
 "woodTub(scene, -0.95, -0.2, 0.5, 0.58); L.box(1.0, 0.16, 0.9, mm(MT.carved, 1, 0.3), 0.6, 0.08, -0.5, scene); henryVIII(scene, 0.6, -0.5, 1.0, -0.3);\n    const ch = hero(scene, { p: [-0.35, 0, 0.9], ry: 0.3 });"),
("const plank = L.box(1.15, 0.12, 0.05, mm(MT.wood, 1, 0.2), 0.95, 0.62, 0.72, scene);", "const plank = L.box(1.15, 0.12, 0.05, mm(MT.wood, 1, 0.2), -0.95, 0.62, 0.32, scene);"),
("{ size: 0.1, x: 0.95, y: 0.86, z: 0.75,", "{ size: 0.1, x: -0.95, y: 0.86, z: 0.35,"),
# 9 doctor fully in frame, basin behind between them
("const bs = woodTub(scene, 0.85, 0.1, 0.38, 0.45); const dr = doctorOf(npcAt(scene, 'bank_teller', 'grey', -0.45, 0.25, 0.5, 1.1));", "const bs = woodTub(scene, 0.25, -0.45, 0.38, 0.45); const dr = doctorOf(npcAt(scene, 'bank_teller', 'grey', -0.3, 0.35, 0.5, 1.05));"),
("const ch = hero(scene, { p: [0.45, 0, 1.0], ry: -0.4 }); sepia(scene, [ch]); const cam = CAM([[0.15, 1.3, 4.0], [0.13, 1.28, 3.8]], [[0.1, 1.2, 0.3]], 50); const mt = meter(scene, cam); const tD = ws(5, 'disease');",
 "const ch = hero(scene, { p: [0.55, 0, 0.95], ry: -0.4 }); sepia(scene, [ch]); const cam = CAM([[0.15, 1.3, 4.3], [0.13, 1.28, 4.1]], [[0.12, 1.15, 0.3]], 50); const mt = meter(scene, cam); const tD = ws(5, 'disease');"),
("add('steam', { world: [0.85, 0.5, 0.1], t0, dur: 99, every: 0.3, life: 1.3, rise: 45 })", "add('steam', { world: [0.25, 0.5, -0.45], t0, dur: 99, every: 0.3, life: 1.3, rise: 45 })"),
# 10 shirt + perfume: pointing arm turned toward camera (not out of frame, not over her face); spray mist follows the bottle
("const ch = hero(scene, { p: [0.2, 0, 0.85], ry: 0.15 }); const pf = perfume(); pf.scale.setScalar(1.7);", "const ch = hero(scene, { p: [-0.1, 0, 0.85], ry: -0.55 }); const pf = perfume(); pf.scale.setScalar(1.7);"),
("const cam = CAM([[0.3, 1.25, 3.7], [0.28, 1.23, 3.55]], [[0.25, 1.2, 0.5]], 48);", "const cam = CAM([[0.1, 1.25, 3.8], [0.08, 1.23, 3.65]], [[0.05, 1.2, 0.5]], 48);"),
("add('sparkle', { world: [0.75, 1.35, 0.95], t0: tP, dur: 99, n: 6, radius: 22, color: '#e8b0ff' })", "add('sparkle', { target: pf, offset: [0.05, 0.25, 0.05], t0: tP, dur: 99, n: 6, radius: 22, color: '#e8b0ff' })"),
# 11 tin tub: she sits in it; hearth + kettle in frame on the left, family queue on the right
("const K0 = cottageKitchen(scene); const T0 = tinTub(scene, 0.15, 0.4); T0.g.scale.setScalar(1.3);", "const K0 = cottageKitchen(scene); const T0 = tinTub(scene, -0.2, 0.4); T0.g.scale.setScalar(1.4);"),
("[['bank_teller', 'olive', 1.05, -0.2, 1.0], ['homework_girl', 'red', 1.4, -0.45, 0.9], ['art_student', 'teal', 1.7, -0.7, 0.75]]", "[['bank_teller', 'olive', 0.85, -0.3, 0.95], ['homework_girl', 'red', 1.15, -0.6, 0.85], ['art_student', 'teal', 1.4, -0.9, 0.72]]"),
("const ch = hero(scene, { p: [0.15, 0.03, 0.42], ry: 0.1 }); sepia(scene, [ch]); const cam = CAM([[0.4, 1.5, 4.2], [0.38, 1.48, 4.0]], [[0.4, 0.95, 0.0]], 52);",
 "const ch = hero(scene, { p: [-0.2, 0.03, 0.2], ry: 0.25 }); sepia(scene, [ch]); const cam = CAM([[0.0, 1.5, 4.3], [0.0, 1.48, 4.1]], [[-0.1, 0.95, 0.0]], 52);"),
("ch.drive(t, KNEEL_IN(t, t0), [[-99, 'happy', 'smile'], [tS, 'surprised', 'talkO']]);", "ch.drive(t, SIT_IN(), [[-99, 'happy', 'smile'], [tS, 'surprised', 'talkO']]);"),
("const T0 = tinTub(scene, 0.15, 0.4, 0x6a5a38); T0.g.scale.setScalar(1.3); const ch = hero(scene, { p: [0.15, 0.03, 0.42], ry: 0.1 });", "const T0 = tinTub(scene, 0.15, 0.4, 0x6a5a38); T0.g.scale.setScalar(1.4); const ch = hero(scene, { p: [0.15, 0.03, 0.2], ry: 0.15 });"),
("ch.drive(t, KNEEL_IN(t, t0), [[-99, 'disgust', 'disgust']]);", "ch.drive(t, SIT_IN(), [[-99, 'disgust', 'disgust']]);"),
# 15/16 green in the modern bathroom
("const B = bathroom(scene); const ch = hero(scene, { p: [0.0, 0, -0.62], ry: 0.15 });", "const B = bathroom(scene); pottedTree(scene, -0.95, -0.85, 0.55); pottedTree(scene, 1.35, -0.8, 0.55); const ch = hero(scene, { p: [0.0, 0, -0.62], ry: 0.15 });"),
("const scene = new THREE.Scene(); bathroom(scene); const ch = hero(scene, { p: [-0.25, 0, 0.6], ry: 0.2 });", "const scene = new THREE.Scene(); bathroom(scene); pottedTree(scene, -1.0, -0.6, 0.6); pottedTree(scene, 1.1, -0.7, 0.6); const ch = hero(scene, { p: [-0.25, 0, 0.6], ry: 0.2 });"),
("const H0 = hearth(scene, -1.6, -1.45); kettle(scene, -1.6, 0.97, -1.5);", "const H0 = hearth(scene, -1.25, -1.45); kettle(scene, -1.25, 0.97, -1.5);"),
("add('steam', { world: [-1.6, 1.3, -1.45]", "add('steam', { world: [-1.25, 1.3, -1.45]"),
]
for a, b in R:
    assert s.count(a) == 1, a[:70]
    s = s.replace(a, b)
open(p, "w", encoding="utf-8").write(s); print("ok")
