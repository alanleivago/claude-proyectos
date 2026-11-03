# storyboard v1 stills check: framing, props below the face, stars in frame, satellites visible
import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine", "d07_body.js"); s = open(p, encoding="utf-8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:90]); s = s.replace(a, b)
# 2: no hand over the face
rep("ch.drive(t, [seg('think', t0 - 0.1)], [[-99, 'open', 'talkO']]); } }; });", "ch.drive(t, [still('hands_on_hips', 0.9)], [[-99, 'open', 'talkO']]); } }; });")
# 3/4: the North Star big and in frame, clouds off it at first; she is never at the edge
rep("const polaris = new THREE.Group(); polaris.position.set(0.9, 4.6, -6);", "const polaris = new THREE.Group(); polaris.position.set(0.7, 3.6, -5); polaris.scale.setScalar(1.6);")
rep("const ch = hero(scene, { p: [-0.35, 0.78, 0.4], ry: 0.35 }); const cam = CAM([[0.1, 1.4, 4.2], [0.1, 1.5, 4.0]], [[0.15, 2.2, 0]], 50); const mt = meter(scene, cam);",
    "const ch = hero(scene, { p: [-0.25, 0.78, 0.4], ry: 0.35 }); S0.clouds.position.x = -9; const cam = CAM([[0.1, 1.5, 4.4], [0.1, 1.6, 4.2]], [[0.2, 2.2, 0]], 50); const mt = meter(scene, cam);")
rep("const ch = hero(scene, { p: [-0.35, 0.78, 0.4], ry: 0.35 }); const cam = CAM([[0.4, 1.6, 3.6], [0.4, 1.62, 3.5]], [[0.3, 2.3, 0]], 50);", "const ch = hero(scene, { p: [-0.1, 0.78, 0.4], ry: 0.35 }); const cam = CAM([[0.3, 1.6, 4.0], [0.3, 1.62, 3.9]], [[0.3, 2.2, 0]], 50);")
rep("S0.clouds.position.x = -4.2 + 3.3 * smooth((q15(t) - t0) / 1.4);", "S0.clouds.position.x = -4.6 + 3.6 * smooth((q15(t) - t0) / 1.4);")
# 5: she STANDS in the beached canoe, the stick chart held in front of her chest (below the face)
rep("const ch = hero(scene, { p: [-0.25, 0.22, 0.1], ry: 0.12 }); const sc = stickChart(); sc.scale.setScalar(1.0);\n    const hold = holdIn(ch, 'R', sc, [0.1, 0.12, 0.12], [0, 0, 0]);",
    "const ch = hero(scene, { p: [0.05, 0.16, 0.1], ry: 0.12 }); const sc = stickChart(); sc.scale.setScalar(0.95);\n    const hold = holdIn(ch, 'R', sc, [0.14, -0.2, 0.14], [-0.35, 0, 0]);")
rep("ch.drive(t, [still('sit_floor', 1.5)], [[-99, 'open', 'smile'], [tW, 'happy', 'smileOpen']]); hold(); } }; });", "ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'smile'], [tW, 'happy', 'smileOpen']]); hold(); } }; });")
rep("const cam = CAM([[0.1, 1.15, 3.6], [0.1, 1.12, 3.4]], [[0, 0.85, 0.1]], 48);", "const cam = CAM([[0.15, 1.3, 3.7], [0.15, 1.28, 3.5]], [[0.05, 1.0, 0.1]], 48);")
# 6: no hand on the face: idle, then she crouches and lays the chart down
rep("ch.drive(t, [seg('think', t0 - 0.1), seg('press_down', tB - 0.3, { fade: 0.15 })]", "ch.drive(t, [seg('idle', -99, { loop: true }), seg('press_down', tB - 0.3, { fade: 0.15 })]")
# 9/10: the water compass held lower (below the chin), camera a bit higher to see into the bowl
rep("const wc = waterCompass(); wc.scale.setScalar(1.5);\n    const hold = holdIn(ch, 'R', wc, [0.08, -0.04, 0.1]); const cam = CAM([[0.15, 1.3, 3.4], [0.12, 1.28, 3.25]], [[0.0, 1.05, 0.4]], 48);",
    "const wc = waterCompass(); wc.scale.setScalar(1.25);\n    const hold = holdIn(ch, 'R', wc, [0.1, -0.2, 0.12]); const cam = CAM([[0.15, 1.5, 3.4], [0.12, 1.48, 3.25]], [[0.0, 1.0, 0.4]], 48);")
rep("const wc = waterCompass(); wc.scale.setScalar(1.5);\n    const hold = holdIn(ch, 'R', wc, [0.08, -0.04, 0.1]); const cam = CAM([[0.4, 1.4, 2.6], [0.38, 1.38, 2.5]], [[0.0, 1.1, 0.5]], 46);",
    "const wc = waterCompass(); wc.scale.setScalar(1.25);\n    const hold = holdIn(ch, 'R', wc, [0.1, -0.2, 0.12]); const cam = CAM([[0.35, 1.75, 2.7], [0.33, 1.73, 2.6]], [[0.0, 0.95, 0.5]], 46);")
# 11: the sea chart held low and tilted (she reads it), not in front of her face
rep("const ct = seaChart(); ct.scale.setScalar(1.25);\n    const hold = holdIn(ch, 'R', ct, [-0.12, 0.05, 0.16], [0, 0.1, 0]);", "const ct = seaChart(); ct.scale.setScalar(1.0);\n    const hold = holdIn(ch, 'R', ct, [-0.14, -0.22, 0.16], [-0.55, 0.1, 0]);")
# 15: satellites low enough to read in the sky, in front of the houses; camera closer
rep("const sats = [[-1.4, 3.6, -1.5], [-0.5, 4.1, -2.2], [0.7, 3.9, -2.0], [1.5, 3.4, -1.4]].map(([x, y, z]) => satellite(scene, x, y, z, 0.9));", "const sats = [[-0.95, 2.75, 0.3], [-0.35, 3.15, 0.1], [0.35, 3.1, 0.1], [0.95, 2.7, 0.3]].map(([x, y, z]) => satellite(scene, x, y, z, 0.6));")
rep("const cam = CAM([[0.1, 1.5, 4.3], [0.1, 1.6, 4.4]], [[0.0, 1.9, 0]], 52);", "const cam = CAM([[0.05, 1.4, 4.0], [0.05, 1.45, 4.1]], [[0.0, 1.85, 0.5]], 52);")
rep("const pin = pin3D(scene, 0.0, 2.35, 0.8);", "const pin = pin3D(scene, 0.0, 2.15, 0.8);")
rep("pin.position.y = 2.35 + 0.05 * Math.sin(q * 5);", "pin.position.y = 2.15 + 0.05 * Math.sin(q * 5);")
open(p, "w", encoding="utf-8").write(s); print("ok")
