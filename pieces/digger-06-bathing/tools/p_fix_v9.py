# review v3 fixes (renders/digger06_bathing_v3_revision.md)
import os
E = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine")
p = os.path.join(E, "d06_body.js"); s = open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)
# 1. tin tub mother: a textured NPC (teal), the kettle in her hand pours from its spout into the tub (stream starts AT the spout)
rep("const mum = npcAt(scene, 'art_student', 'rose', -0.68, 0.45, 1.45, 0.95);", "const mum = npcAt(scene, 'art_student', 'teal', -0.82, 0.42, 1.35, 0.95);")
rep("['art_student', 'teal', 1.25, -0.98, 0.68]", "['art_student', 'violet', 1.25, -0.98, 0.68]")
rep("const pour = stream(scene, V3([-0.15, 0.88, 0.45]), V3([-0.08, 0.45, 0.42]), 0xbfe0f0, 0.025, 0.05);",
    "kt.rotation.z = kr0 - 0.8; scene.updateMatrixWorld(true); const sp = kt.localToWorld(V3([0.24, 0.2, 0])); kt.rotation.z = kr0; const pour = stream(scene, sp, V3([sp.x + 0.04, 0.45, sp.z]), 0xbfe0f0, 0.03, 0.06);\n"
    "    const fxP = new FX(LW, LH);")
rep("const fx = new FX(LW, LH).add('steam', { world: [-1.25, 1.3, -1.45], t0, dur: 99, every: 0.35, life: 1.2, rise: 30 });", "const fx = new FX(LW, LH).add('steam', { world: [-1.25, 1.3, -1.45], t0, dur: 99, every: 0.35, life: 1.2, rise: 30 }).add('splash', { world: [sp.x + 0.04, 0.47, sp.z], t0: tF0, dur: tF1 - tF0, color: '#bfe0f0' });")
# 2./3. strigil: metal grey, smaller, its blade ON the left forearm, dirt falling while scraping; oil flask IN the right fist; perfume IN the left fist
rep("const g = new THREE.Group(), st = new THREE.MeshBasicMaterial({ color: 0xf2f6fa }), ed = new THREE.MeshBasicMaterial({ color: 0x3a4250 });", "const g = new THREE.Group(), st = litM(null, 0xc8d2dc), ed = null;")
rep("L.box(0.04, 0.09, 0.04, litM(null, 0x2a2a30), 0, 0.03, 0, g); return g; }", "L.box(0.04, 0.09, 0.04, litM(null, 0x6a4020), 0, 0.03, 0, g); return g; }")
rep("const sg = strigil2(); sg.scale.setScalar(1.25); scene.add(sg); const fl = oilFlask(); fl.scale.setScalar(1.15);", "const sg = strigil2(); sg.scale.setScalar(1.05); scene.add(sg); const fl = oilFlask(); fl.scale.setScalar(1.0);")
rep("if (oil) { fl.visible = true; fl.position.copy(fp).add(V3([0.1, -0.12, 0.14])); fl.rotation.set(0, 0, -1.3); }", "if (oil) { fl.visible = true; fl.position.copy(fp).add(V3([0.0, -0.03, 0.05])); fl.rotation.set(0, 0, -1.3); }")
rep("add('sparkle', { target: sg, offset: [0, 0.2, 0.03], t0: tS, dur: 99, n: 4, radius: 16, color: '#ffffff' });", "add('sparkle', { target: sg, offset: [0, 0.2, 0.03], t0: tS, dur: 99, n: 4, radius: 16, color: '#ffffff' }).add('drip', { target: sg, offset: [0, 0.05, 0.03], t0: tSc, dur: tS - tSc, color: '#8a6a3a' });")
rep("pf.position.copy(fp).add(V3([0.02, 0.04, 0.05]));", "pf.position.copy(fp).add(V3([0.0, -0.03, 0.03]));")
rep("const pf = perfume2(); pf.scale.setScalar(1.7);", "const pf = perfume2(); pf.scale.setScalar(1.4);")
# 6. the baby: a swaddled baby held by the father next to the tub; shorter label
rep("const bb = npcAt(scene, 'homework_girl', 'blue', 0.82, 0.85, -0.9, 0.42); bb.walk(0);",
    "const bb = npcAt(scene, 'bank_teller', 'grey', 0.95, 0.62, -0.75, 0.95); bb.walk(0); npcSet(bb, 'Bone002', -1.1); npcSet(bb, 'Bone004', -1.1); const bh = npcHand(bb, 'R').lerp(npcHand(bb, 'L'), 0.5);\n"
    "    const baby = new THREE.Group(); baby.position.copy(bh).add(V3([0, 0.06, 0.04])); scene.add(baby); L.mesh(new THREE.SphereGeometry(0.1, 8, 6), litM(null, 0xf4f0f8), 0, 0, 0, baby).scale.set(1.7, 0.85, 0.9); L.mesh(new THREE.SphereGeometry(0.065, 8, 6), litM(null, 0xf0c8a8), 0.17, 0.03, 0.02, baby);\n"
    "    for (const s2 of [-1, 1]) L.box(0.012, 0.012, 0.005, litM(null, 0x18181c), 0.19 + s2 * 0.0, 0.05, 0.08 + s2 * 0.0, baby); L.mesh(new THREE.SphereGeometry(0.067, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), litM(null, 0xa8c8f0), 0.17, 0.045, 0.02, baby);\n"
    "    bb.updateMatrixWorld(true); bb.bones.Bone005.attach(baby);")
rep("fx.add('question', { target: bb, offset: [0, 0.75, 0], t0: tB, dur: 99 });", "fx.add('question', { target: baby, offset: [0.1, 0.25, 0], t0: tB, dur: 99 });")
rep("const lab = label3D(scene, 'BABY: LAST', 0, 0, 0, tB, { size: 0.13 });", "const lab = label3D(scene, 'BABY LAST', 0, 0, 0, tB, { size: 0.13 });")
# 7. doctor: smaller hat brim, a doctor's bag
rep("L.mesh(new THREE.CylinderGeometry(r * 2.1, r * 2.1, r * 0.12, 14), litM(null, 0x18181c), 0, -r * 0.3, 0, hat);", "L.mesh(new THREE.CylinderGeometry(r * 1.65, r * 1.65, r * 0.12, 14), litM(null, 0x18181c), 0, -r * 0.3, 0, hat);")
# 9. freezing: 3/4 turn so the hugging arms don't cover the face
rep("const RB = riverBank(scene); const ch = hero(scene, { p: [0.0, 0, 0.35], ry: 0.15 });", "const RB = riverBank(scene); const ch = hero(scene, { p: [0.0, 0, 0.35], ry: -0.45 });")
# 10. modern shower: the head lower in frame (clear of the label), water running down her shoulders
rep("const cam = CAM([[0.1, 1.45, 3.4], [0.08, 1.43, 3.2]], [[0.0, 1.55, -0.5]], 52);", "const cam = CAM([[0.1, 1.3, 3.6], [0.08, 1.3, 3.4]], [[0.0, 1.3, -0.5]], 52);")
rep("add('splash', { obj: ch.root, bone: 'Head', offset: [0, 0.25, 0], t0, dur: 99, color: '#bfe8ff' }).add('steam', { world: [0.0, 1.4, -0.5]",
    "add('splash', { obj: ch.root, bone: 'Head', offset: [0, 0.25, 0], t0, dur: 99, color: '#bfe8ff' }).add('drip', { obj: ch.root, bone: 'Head', offset: [-0.2, -0.25, 0.05], t0, dur: 99, color: '#bfe8ff' }).add('drip', { obj: ch.root, bone: 'Head', offset: [0.2, -0.25, 0.05], t0: t0 + 0.2, dur: 99, color: '#bfe8ff' }).add('steam', { world: [0.0, 1.4, -0.5]")
# 11. framing: opening wider (feet in), Henry shot: her arm off the edge + the label clear of the crown, outro wave off the edge
rep("const cam = CAM([[0.4, 1.15, 3.5], [0.38, 1.13, 3.3]], [[0.35, 1.2, 0.3]], 46);", "const cam = CAM([[0.4, 1.1, 4.1], [0.38, 1.08, 3.9]], [[0.35, 1.05, 0.3]], 46);")
rep("const ch = hero(scene, { p: [-0.45, 0, 0.95], ry: 0.25 });", "const ch = hero(scene, { p: [-0.38, 0, 0.95], ry: 0.25 });")
rep("L.box(0.9, 0.16, 0.8, mm(MT.carved, 1, 0.3), 0.85, 0.08, -0.5, scene); const hk = royalCape(npcAt(scene, 'bank_teller', 'navy', 0.85, -0.5, -0.35, 1.3));", "L.box(0.9, 0.16, 0.8, mm(MT.carved, 1, 0.3), 0.95, 0.08, -0.5, scene); const hk = royalCape(npcAt(scene, 'bank_teller', 'navy', 0.95, -0.5, -0.35, 1.3));")
rep("const cam = CAM([[0.08, 1.45, 4.7], [0.08, 1.43, 4.5]], [[0.08, 1.45, 0]], 50);", "const cam = CAM([[0.15, 1.5, 4.9], [0.15, 1.48, 4.7]], [[0.15, 1.62, 0]], 50);")
rep("const ch = hero(scene, { p: [-0.25, 0, 0.6], ry: 0.2 }); const cam = CAM([[0.1, 1.15, 3.4], [0.1, 1.2, 3.8]], [[0.0, 1.2, 0.3]], 48);", "const ch = hero(scene, { p: [-0.05, 0, 0.6], ry: 0.2 }); const cam = CAM([[0.1, 1.15, 3.6], [0.1, 1.2, 4.0]], [[0.0, 1.2, 0.3]], 48);")
# 12. "not fresh": disgust on the face
i = s.index("SH([3, 'But']"); j = s.index("SH(", i + 5)
blk = s[i:j].replace("[[-99, 'disgust', 'disgust']]", "[[-99, 'angry', 'disgust']]"); s = s[:i] + blk + s[j:]
open(p, "w", encoding="utf-8").write(s); print("ok")
