# review v1 fixes (renders/digger07_navigation_v1_revision.md)
import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine", "d07_body.js"); s = open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
# 1. props AT the fists (both hands on them), held like a tray so the face stays clear; cameras a bit higher to see them
rep("const hold = holdIn(ch, 'R', sc, [0.12, -0.38, 0.2], [-0.6, 0, 0]); const cam = CAM([[0.15, 1.3, 3.7], [0.15, 1.28, 3.5]], [[0.05, 1.0, 0.1]], 48);",
    "const hold = holdIn(ch, 'R', sc, [0.12, -0.02, 0.12], [-1.25, 0, 0]); const cam = CAM([[0.15, 1.9, 3.5], [0.15, 1.88, 3.3]], [[0.05, 1.0, 0.1]], 48);")
rep("const hold = holdIn(ch, 'R', wc, [0.1, -0.2, 0.12]); const cam = CAM([[0.15, 1.6, 3.7], [0.12, 1.58, 3.55]], [[0.0, 1.2, 0.4]], 48);",
    "const hold = holdIn(ch, 'R', wc, [0.1, -0.07, 0.08]); const cam = CAM([[0.15, 1.75, 3.7], [0.12, 1.73, 3.55]], [[0.0, 1.2, 0.4]], 48);")
rep("const hold = holdIn(ch, 'R', wc, [0.1, -0.2, 0.12]); const cam = CAM([[0.35, 1.75, 2.7], [0.33, 1.73, 2.6]], [[0.0, 0.95, 0.5]], 46);",
    "const hold = holdIn(ch, 'R', wc, [0.1, -0.07, 0.08]); const cam = CAM([[0.35, 1.8, 2.9], [0.33, 1.78, 2.8]], [[0.0, 1.15, 0.5]], 46);")
rep("const wc = waterCompass(); wc.scale.setScalar(1.25);", "const wc = waterCompass(); wc.scale.setScalar(1.05);", 2)
rep("const hold = holdIn(ch, 'R', ct, [-0.14, -0.22, 0.16], [-0.55, 0.1, 0]); const cam = CAM([[0.15, 1.3, 3.4], [0.15, 1.28, 3.25]], [[0.1, 1.1, 0.4]], 48);",
    "const hold = holdIn(ch, 'R', ct, [-0.12, -0.03, 0.14], [-1.15, 0.1, 0]); const cam = CAM([[0.15, 1.9, 3.3], [0.15, 1.88, 3.15]], [[0.1, 1.05, 0.4]], 48);")
rep("const ct = seaChart(); ct.scale.setScalar(1.0);", "const ct = seaChart(); ct.scale.setScalar(0.9);")
rep("const hold = holdIn(ch, 'R', ph, [0.02, -0.16, 0.1], [-0.3, 0, 0]);", "const hold = holdIn(ch, 'R', ph, [0.0, -0.01, 0.05], [-0.4, 0, 0]);")
# 2./3. GPS shot: the pin beside her, AT LEAST FOUR gone when GPS pops; she whole in frame; satellites lower
rep("const pin = pin3D(scene, 0.0, 2.15, 0.8);", "const pin = pin3D(scene, 0.42, 1.95, 0.8);")
rep("pin.position.y = 2.15 + 0.05 * Math.sin(q * 5);", "pin.position.y = 1.95 + 0.05 * Math.sin(q * 5);")
rep("upd(t) { mt(t); lab(t); lab2(t); lab3(t); const q = q15(t); sats", "upd(t) { mt(t); lab(q15(t) < tG ? t : -9); lab2(t); lab3(t); const q = q15(t); sats")
rep("const sats = [[-0.95, 2.75, 0.3], [-0.35, 3.15, 0.1], [0.35, 3.1, 0.1], [0.95, 2.7, 0.3]]", "const sats = [[-0.95, 2.35, 0.3], [-0.35, 2.65, 0.1], [0.35, 2.6, 0.1], [0.95, 2.3, 0.3]]")
rep("const cam = CAM([[0.05, 1.35, 3.5], [0.05, 1.4, 3.6]], [[0.0, 1.75, 0.5]], 52);", "const cam = CAM([[0.05, 1.3, 4.3], [0.05, 1.32, 4.4]], [[0.0, 1.35, 0.5]], 52);")
# 3. Harrison: she is not at the edge
rep("const ch = hero(scene, { p: [-0.45, 0, 0.75], ry: 0.45 });", "const ch = hero(scene, { p: [-0.28, 0, 0.75], ry: 0.45 });")
# 4. NORTH label clear of her hair: her head lower in frame (done with the compass camera above)
# 5. no empty thought bubble
rep("const fx = new FX(LW, LH).add('thought', { obj: ch.root, bone: 'Head', offset: [0.2, 0.45, 0], t0: tM, dur: 99 }).add('dust'", "const fx = new FX(LW, LH).add('dust'")
# 7. the North Star: a thick extruded star turned a little (its volume shows), no flat glow shells; the space clock turned to show its thickness
rep("const geo = new THREE.ExtrudeGeometry(sh, { depth: r * 0.35, bevelEnabled: true, bevelThickness: r * 0.12, bevelSize: r * 0.08, bevelSegments: 1 }); geo.center();",
    "const geo = new THREE.ExtrudeGeometry(sh, { depth: r * 0.6, bevelEnabled: true, bevelThickness: r * 0.15, bevelSize: r * 0.1, bevelSegments: 2 }); geo.center(); g.rotation.set(0.25, 0.5, 0);")
rep("L.mesh(geo, new THREE.MeshBasicMaterial({ color: col }), 0, 0, 0, g); L.mesh(new THREE.IcosahedronGeometry(r * 1.7, 1), new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.18, depthWrite: false }), 0, 0, 0, g);\n"
    "    L.mesh(new THREE.IcosahedronGeometry(r * 2.6, 1), new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.07, depthWrite: false }), 0, 0, 0, g);",
    "L.mesh(geo, [new THREE.MeshBasicMaterial({ color: col }), new THREE.MeshBasicMaterial({ color: 0xd8b040 })], 0, 0, 0, g);")
rep(".children.forEach((c, k) => { if (k > 0) c.visible = k < 2; });", ";")
# 8. the road end: camera turned off the beige object on the far wall
rep("const cam = CAM([[0.3, 1.3, 2.4], [0.3, 1.3, 2.3]], [[0, 0.8, -1.4]], 50);", "const cam = CAM([[-0.3, 1.3, 2.4], [-0.3, 1.3, 2.3]], [[0.1, 0.8, -1.4]], 50);")
# 9. no near rail between the camera and her feet (both ships)
rep("for (const s2 of [-1, 1]) { L.box(6, 0.55, 0.12, nv,", "for (const s2 of [-1]) { L.box(6, 0.55, 0.12, nv,")
rep("for (const s2 of [-1, 1]) { L.box(6, 0.5, 0.1, mm(MT.darkWood, 6, 0.4),", "for (const s2 of [-1]) { L.box(6, 0.5, 0.1, mm(MT.darkWood, 6, 0.4),")
# 10. space: satellite and clock to the right and lower, clear of the labels
rep("const st = satellite(scene, 0.9, 1.9, -0.4, 1.0); const ck = clockFace(scene, 0.9, 2.35, -0.2, 1.6);", "const st = satellite(scene, 1.0, 1.15, -0.5, 0.9); const ck = clockFace(scene, 0.95, 1.7, -0.2, 1.5); ck.rotation.y = -0.55;")
open(p, "w", encoding="utf-8").write(s); print("ok")
