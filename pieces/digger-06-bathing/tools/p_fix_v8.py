# v7 stills check: strigil pose (fists at the chest, face clear), face visibility by camera height (no head-bone tilt), tin tub framing, baby in frame
import os
E = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine")
p = os.path.join(E, "d06_body.js"); s = open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)
# faces: no head tilt (it rolled the head in the sitting pose); lower cameras so the face reads under the fringe; eyes open
rep(" faceUp(ch, 0.3); } }; });", " } }; });")
rep(" faceUp(ch, 0.45); } }; });", " } }; });")
rep(" faceUp(ch, 0.4); } }; });", " } }; });")
rep("const cam = CAM([[0.15, 1.1, 3.4], [0.13, 1.08, 3.2]], [[0, 1.15, 0.3]], 46);", "const cam = CAM([[0.15, 0.85, 3.4], [0.13, 0.84, 3.2]], [[0, 1.2, 0.3]], 46);")
rep("[[-99, 'happy', 'smile'], [tF, 'angry', 'frown']]", "[[-99, 'open', 'smile'], [tF, 'surprised', 'frown']]")
rep("const cam = CAM(SIDE ? [[3.8, 1.0, -0.2]] : [[0.3, 1.5, 3.9], [0.25, 1.48, 3.7]], [[0.0, 0.7, -0.25]], 50);", "const cam = CAM(SIDE ? [[3.8, 1.0, -0.2]] : [[0.25, 0.95, 3.6], [0.22, 0.95, 3.4]], [[0.0, 0.8, -0.25]], 50);")
rep("[[-99, 'happy', 'smile'], [t0 + 0.6, 'happy', 'smileOpen']]", "[[-99, 'open', 'smile'], [t0 + 0.6, 'open', 'smileOpen']]")
rep("[[0.1, 1.15, 3.2], [0.08, 1.13, 3.0]], SIDE ? [[0.05, 0.8, 0.1]] : [[0.0, 0.8, 0.0]], 48);", "[[0.1, 0.95, 3.2], [0.08, 0.94, 3.0]], SIDE ? [[0.05, 0.8, 0.1]] : [[0.0, 0.85, 0.0]], 48);")
rep("[[-99, 'happy', 'smile'], [tS, 'happy', 'smileOpen'], [tR, 'surprised', 'gasp']]", "[[-99, 'open', 'smile'], [tS, 'open', 'smileOpen'], [tR, 'surprised', 'gasp']]")
# strigil: fists together at the chest (face clear); flask tilts over the left forearm, then the strigil blade scrapes along it
rep("const sg = strigil2(); sg.scale.setScalar(1.5); scene.add(sg); const fl = oilFlask(); fl.scale.setScalar(1.6);", "const sg = strigil2(); sg.scale.setScalar(1.25); scene.add(sg); const fl = oilFlask(); fl.scale.setScalar(1.15);")
rep("ch.drive(t, q < tS - 0.1 ? [seg('warm_hands', t0 - 0.3, { loop: true })] : [seg('hold_up_object', tS - 0.15)], [[-99, 'open', 'smile'], [tO, 'happy', 'smileOpen'], [tS, 'happy', 'smileOpen']]);",
    "ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'smile'], [tO, 'open', 'smileOpen'], [tS, 'open', 'smileOpen']]);")
rep("if (oil) { fl.visible = true; fl.position.copy(fp).add(V3([0, 0.08, 0.05])); fl.rotation.set(0, 0, -1.25); }", "if (oil) { fl.visible = true; fl.position.copy(fp).add(V3([0.02, 0.0, 0.1])); fl.rotation.set(0, 0, -1.6); }")
rep("sg.visible = !oil && q >= tSc - 0.2; sg.position.copy(fp).add(V3([0, 0.02, 0.06])); if (q < tS - 0.1) { sg.lookAt(fq); sg.rotateX(-1.2 + 0.45 * Math.sin(q * 10)); } else sg.rotation.set(0, 0, 0.2); } }; });",
    "sg.visible = !oil && q >= tSc - 0.2; const dir = fq.clone().sub(fp).normalize(); sg.position.copy(fp).addScaledVector(dir, 0.04 + 0.07 * (0.5 + 0.5 * Math.sin(q * 11))).add(V3([0, 0, 0.08])); sg.lookAt(sg.position.clone().add(dir)); sg.rotateX(Math.PI / 2); } }; });")
rep("const cam = CAM([[0.1, 1.25, 3.3], [0.08, 1.23, 3.15]], [[0.0, 1.05, 0.9]], 46);", "const cam = CAM([[0.05, 1.3, 3.2], [0.04, 1.29, 3.05]], [[0.0, 1.1, 0.9]], 46);")
# tin tub: mother fully in frame (kettle in her hand), family to the right
rep("const K0 = cottageKitchen(scene); const T0 = tinTub(scene, -0.2, 0.4);", "const K0 = cottageKitchen(scene); const T0 = tinTub(scene, 0.05, 0.4);")
rep("const mum = npcAt(scene, 'art_student', 'rose', -0.95, 0.45, 1.45, 0.95);", "const mum = npcAt(scene, 'art_student', 'rose', -0.68, 0.45, 1.45, 0.95);")
rep("const pour = stream(scene, V3([-0.42, 0.88, 0.45]), V3([-0.34, 0.45, 0.42])", "const pour = stream(scene, V3([-0.15, 0.88, 0.45]), V3([-0.08, 0.45, 0.42])")
rep("const ch = hero(scene, { p: [-0.2, 0.17, 0.2], ry: 0.25 });", "const ch = hero(scene, { p: [0.05, 0.17, 0.2], ry: 0.25 });")
rep("[['bank_teller', 'grey', 0.55, -0.45, 0.95], ['homework_girl', 'red', 0.85, -0.72, 0.8], ['art_student', 'teal', 1.1, -0.98, 0.68], ['homework_girl', 'olive', 1.32, -1.2, 0.42]]",
    "[['bank_teller', 'grey', 0.8, -0.45, 0.95], ['homework_girl', 'red', 1.05, -0.72, 0.8], ['art_student', 'teal', 1.25, -0.98, 0.68], ['homework_girl', 'blue', 1.42, -1.2, 0.42]]")
rep("[[0.1, 1.5, 4.6], [0.1, 1.48, 4.4]], SIDE ? [[-0.2, 0.7, 0.3]] : [[0.1, 0.95, 0.0]], 52);", "[[0.3, 1.5, 4.8], [0.3, 1.48, 4.6]], SIDE ? [[-0.2, 0.7, 0.3]] : [[0.3, 0.95, 0.0]], 52);")
# baby: inside the frame next to the murky tub
rep("const bb = npcAt(scene, 'homework_girl', 'blue', 0.95, 0.75, -1.0, 0.42);", "const bb = npcAt(scene, 'homework_girl', 'blue', 0.82, 0.85, -0.9, 0.42);")
rep("const cam = CAM([[0.4, 1.3, 3.3], [0.38, 1.28, 3.15]], [[0.45, 0.85, 0.4]], 50);", "const cam = CAM([[0.4, 1.3, 3.5], [0.38, 1.28, 3.35]], [[0.42, 0.85, 0.4]], 50);")
open(p, "w", encoding="utf-8").write(s); print("ok")
