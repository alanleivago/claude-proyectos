# production fixes asked by the user on storyboard v1
import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine"))
s = open("film.js", encoding="utf-8").read()
def R(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
# shot 2: less tight
R("CAM([[0.45, 1.25, 1.05], [0.43, 1.23, 0.98]], [[-0.22, 0.92, -0.55]], 48)", "CAM([[0.7, 1.3, 1.55], [0.68, 1.28, 1.48]], [[-0.22, 0.88, -0.55]], 48)")
# shots 6/8: wider (camera further, higher, looking down the room)
R("CAM([[1.2, 1.9, 2.9], [1.15, 1.85, 2.75]], [[0, 0.55, 0.2]], 46)", "CAM([[1.5, 2.3, 4.2], [1.45, 2.25, 4.05]], [[0, 0.65, 0.3]], 46)")
R("CAM([[-1.2, 1.9, 2.9], [-1.15, 1.85, 2.75]], [[0, 0.55, 0.2]], 46)", "CAM([[-1.5, 2.3, 4.2], [-1.45, 2.25, 4.05]], [[0, 0.65, 0.3]], 46)")
# shot 9: she thinks with her hand down (hands on hips), the sticker high and clear of her face
R("return { scene, fx, cam: CAM([[0.1, 1.0, 3.1]], [[0.0, 0.95, 0.5]], 40), upd(t) { ch.drive(t, [seg('think', t0 - 0.2)], [[-99, 'open', 'talkO']]); },\n      ov(o, t) { if (t >= tN) sticker(o, t - tN, { user: 'operator_nina', lines: ['so what did they do', 'at midnight?'], y: 92 }); } }; });",
  "return { scene, fx, cam: CAM([[0.1, 0.85, 3.3]], [[0.0, 0.78, 0.5]], 40), upd(t) { ch.drive(t, [seg('hands_on_hips', t0 - 0.2)], [[-99, 'open', 'talkO']]); },\n      ov(o, t) { if (t >= tN) sticker(o, t - tN, { user: 'operator_nina', lines: ['so what did they do', 'at midnight?'], y: 48 }); } }; });")
# shot 10: open eyes while praying/talking
R("ch.drive(t, [still('kneel', 1.5)], [[-99, 'relaxed', 'smile'], [tT, 'happy', 'smileOpen']]);", "ch.drive(t, [still('kneel', 1.5)], [[-99, 'open', 'smile'], [tT, 'open', 'smileOpen']]);")
# shot 11: the hearth from the side, she kneels at it in profile, face visible
R("const H0 = hearth(scene, 0.1, -0.45); const ch = hero(scene, { p: [0.62, 0, 0.3], ry: -2.0 });", "const H0 = hearth(scene, 0.1, -0.45); const ch = hero(scene, { p: [0.7, 0, -0.05], ry: -1.75 });")
R("CAM([[1.1, 1.15, 2.6], [1.05, 1.13, 2.5]], [[0.3, 0.55, -0.2]], 50)", "CAM([[1.15, 1.05, 2.3], [1.1, 1.03, 2.2]], [[0.35, 0.55, -0.25]], 52)")
# shot 14: she is fully in frame, the page a bit to the right
R("const ch = hero(scene, { p: [-0.55, -0.6, 0.4], ry: 0.5 }); const tF = ws(5, 'first');", "const ch = hero(scene, { p: [-0.42, -0.6, 0.2], ry: 0.5 }); const tF = ws(5, 'first');")
R("return { scene, cam: CAM([[0, 0.65, 3.4]], [[0, 0.65, 0]], 46), upd(t) { ch.drive(t, [seg('point', t0 - 0.2)]", "return { scene, cam: CAM([[0, 0.5, 4.0]], [[0, 0.45, 0]], 46), upd(t) { ch.drive(t, [seg('point', t0 - 0.2)]")
s = s.replace("cham(c, 96, 60, 166, 250, 5, '#141008'); cham(c, 98, 62, 162, 246, 4, '#efe4c8'); c.fillStyle = '#7a2a1a'; c.fillRect(98, 62, 162, 16); bitText(c, 'CHAUCER', 179, 70,",
              "cham(c, 118, 60, 146, 250, 5, '#141008'); cham(c, 120, 62, 142, 246, 4, '#efe4c8'); c.fillStyle = '#7a2a1a'; c.fillRect(120, 62, 142, 16); bitText(c, 'CHAUCER', 191, 70,")
s = s.replace("bitText(c, 'c. 1390', 179, 92,", "bitText(c, 'c. 1390', 191, 92,").replace("for (let y = 108; y < 300; y += 9) c.fillRect(110, y, 138, 1);", "for (let y = 108; y < 300; y += 9) c.fillRect(128, y, 126, 1);")
s = s.replace("c.fillStyle = '#c84a3a'; c.fillRect(110, 150, 14, 14); bitText(c, 'S', 117, 157,", "c.fillStyle = '#c84a3a'; c.fillRect(128, 150, 14, 14); bitText(c, 'S', 135, 157,")
s = s.replace("c.fillRect(106, 180, 146, 30); } bitText(c, 'SHE SLEPT HIR', 179, 188,", "c.fillRect(124, 180, 136, 30); } bitText(c, 'SHE SLEPT HIR', 191, 188,").replace("bitText(c, 'FIRSTE SLEEP', 179, 202,", "bitText(c, 'FIRSTE SLEEP', 191, 202,")
# shots 19/20: beds 3/4 toward camera, volunteers bigger (scale 1.25) and propped on pillows, closer camera
R("function wardBeds(scene) { const vs = []; [-0.95, 0, 0.95].forEach((x, i) => { const b = bed(scene, { x, z: 0, quilt: [0x4a72b8, 0x7a5a3a, 0x4a8a5a][i], full: true }); vs.push(lieNpc(scene, ['homework_girl', 'bank_teller', 'art_student'][i], ['green', 'navy', 'teal'][i], x, 0.56, 0.75)); }); return vs; }",
  "function wardBeds(scene) { const vs = []; [[-0.7, -0.5], [0.7, 0.3]].forEach(([x, z], i) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = -0.45; g.scale.setScalar(1.25); scene.add(g); bed(g, { x: 0, z: 0, quilt: [0x4a72b8, 0x4a8a5a][i], full: true });\n    const w = L.box(0.8, 0.3, 0.4, litM(null, 0xf0eadc), 0, 0.6, -0.72, g); w.rotation.x = -0.45; vs.push(lieNpc(g, ['homework_girl', 'art_student'][i], ['green', 'teal'][i], 0, 0.5, 0.95, { tilt: 0.3, s: 0.95 })); }); return vs; }")
s = s.replace("CAM([[0.0, 2.6, 3.6], [0.0, 2.55, 3.45]], [[0.0, 0.4, 0.0]], 50)", "CAM([[0.2, 1.9, 3.6], [0.2, 1.87, 3.45]], [[0.0, 0.75, -0.1]], 50)")
s = s.replace("vs.forEach((n, i) => { fx.add('exclaim', { target: n, offset: [0, 0.35, -1.2],", "vs.forEach((n, i) => { fx.add('exclaim', { target: n, offset: [0, 0.6, -1.3],")
# green balance in the night town: ivy on the houses, window boxes, more potted trees and bushes
R("    if (night) scene.add(new THREE.AmbientLight(0x8090c0, 0.25));\n  }", """    if (night) scene.add(new THREE.AmbientLight(0x8090c0, 0.25));
    // digger 05 (green balance): ivy up the house fronts, window boxes, potted trees and bushes in every town shot
    for (const [x, y, z, w, h] of [[-6.4, 1.6, -3.38, 0.9, 3.2], [-2.6, 1.4, -3.38, 0.7, 2.6], [2.5, 1.8, -4.58, 0.9, 3.4], [6.8, 1.5, -3.18, 0.8, 2.8]]) ivy(scene, x, y, z, w, h);
    for (const [x, y, z] of [[-5.25, 2.3, -3.0], [-3.9, 2.3, -3.0], [4.4, 2.0, -2.8], [5.6, 2.0, -2.8], [-0.9, 2.5, -4.2], [1.3, 2.5, -4.2]]) windowBox(scene, x, y, z, 0.7);
    for (const [x, z, s] of [[-1.2, -2.0, 0.7], [1.6, -1.9, 0.7], [-3.6, 0.4, 0.8], [3.8, 0.6, 0.8]]) pottedTree(scene, x, z, s);
    for (const [x, z, r] of [[-4.6, -1.2, 0.45], [4.9, -1.0, 0.5], [-0.4, -2.6, 0.35]]) bush(scene, x, z, r);
  }""")
open("film.js", "w", encoding="utf-8").write(s); print("ok")
