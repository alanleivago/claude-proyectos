import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine", "d06_body.js")
L = open(p, encoding="utf-8").read().split("\n")
assert "broad doublet" in L[63] and "flat Tudor cap" in L[73] and "// head" in L[70]
dbl = "litM(L.rep(DOUBLET, 2, 2), 0xffffff)"
L[63] = ("    { const d = L.mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.64, 10), %s, 0, 1.1, 0, g); d.scale.set(1, 1, 0.68); }   // broad barrel doublet\n"
         "    { const k = L.mesh(new THREE.CylinderGeometry(0.33, 0.44, 0.3, 10), %s, 0, 0.66, 0, g); k.scale.set(1, 1, 0.75); }   // skirted bases" % (dbl, dbl))
L[64] = "    { const b = L.mesh(new THREE.CylinderGeometry(0.345, 0.345, 0.06, 10), gold, 0, 0.8, 0, g); b.scale.set(1, 1, 0.7); }   // belt"
L[65] = ("    for (const s2 of [-1, 1]) { const sl = L.mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshLambertMaterial({ color: 0xa01a2a, flatShading: true }), s2 * 0.68, 1.18, 0.02, g); sl.scale.set(1, 1.25, 1);   // huge puffed gown sleeves\n"
         "      L.box(0.17, 0.36, 0.17, %s, s2 * 0.68, 0.86, 0.06, g); L.box(0.2, 0.06, 0.2, litM(L.rep(ERMINE, 1, 1), 0xffffff), s2 * 0.68, 0.7, 0.06, g); L.box(0.12, 0.12, 0.12, skin, s2 * 0.68, 0.61, 0.07, g); }" % dbl)
L[70] = ("    L.box(0.16, 0.12, 0.16, skin, 0, 1.5, 0.02, g); L.box(0.38, 0.4, 0.34, skin, 0, 1.74, 0.02, g);   // neck + big head\n"
         "    for (const s2 of [-1, 1]) L.box(0.06, 0.1, 0.1, skin, s2 * 0.21, 1.74, 0.02, g);   // ears")
L[71] = "    L.box(0.4, 0.2, 0.12, litM(null, 0xb85a2a), 0, 1.6, 0.16, g); L.box(0.42, 0.24, 0.3, litM(null, 0xb85a2a), 0, 1.62, 0.02, g); L.box(0.2, 0.04, 0.02, litM(null, 0xb85a2a), 0, 1.71, 0.2, g);   // red beard + moustache"
L[72] = "    for (const s2 of [-1, 1]) { L.box(0.07, 0.05, 0.01, black, s2 * 0.09, 1.8, 0.195, g); L.box(0.09, 0.025, 0.01, litM(null, 0x8a4a22), s2 * 0.09, 1.85, 0.195, g); } L.box(0.07, 0.07, 0.04, litM(null, 0xe0b090), 0, 1.75, 0.2, g);   // eyes, brows, nose"
L[73] = "    { const c = L.mesh(new THREE.CylinderGeometry(0.31, 0.3, 0.07, 12), black, 0.02, 1.97, 0.0, g); c.rotation.z = -0.12; }   // flat Tudor cap"
s = "\n".join(L)
s = s.replace("const crown = new THREE.Group(); crown.position.set(0, 1.92, 0);", "const crown = new THREE.Group(); crown.position.set(0.01, 2.0, 0);")
s = s.replace("const fe = L.box(0.03, 0.22, 0.02, white, 0.22, 2.0, -0.05, g); fe.rotation.z = -0.6;", "const fe = L.box(0.035, 0.24, 0.02, white, 0.27, 2.08, -0.04, g); fe.rotation.z = -0.7;")
# Henry shot framing: both fully in frame, crown below the labels
a = "henryVIII(scene, 0.45, -0.5, 1.0, -0.3);"; assert a in s; s = s.replace(a, "henryVIII(scene, 0.5, -0.5, 0.9, -0.3);").replace("mm(MT.carved, 1, 0.3), 0.45, 0.08, -0.5, scene)", "mm(MT.carved, 1, 0.3), 0.5, 0.08, -0.5, scene)")
a = "const ch = hero(scene, { p: [-0.45, 0, 0.9], ry: 0.3 });"; assert a in s; s = s.replace(a, "const ch = hero(scene, { p: [-0.3, 0, 0.9], ry: 0.3 });")
a = "const cam = CAM([[0.15, 1.35, 4.3], [0.13, 1.33, 4.1]], [[0.1, 1.3, 0]], 50);"; assert a in s; s = s.replace(a, "const cam = CAM([[0.05, 1.45, 4.5], [0.05, 1.43, 4.3]], [[0.05, 1.5, 0]], 50);")
# stews: she is small in the tub, come closer
a = "[[0.15, 1.45, 3.9], [0.13, 1.43, 3.7]], SIDE ? [[0.05, 0.8, 0.1]] : [[0.05, 1.05, 0.2]], 48);"; assert a in s; s = s.replace(a, "[[0.1, 1.4, 3.2], [0.08, 1.38, 3.0]], SIDE ? [[0.05, 0.8, 0.1]] : [[0.0, 1.2, 0.0]], 48);")
open(p, "w", encoding="utf-8").write(s); print("ok")
