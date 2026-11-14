# review v1 fixes (renders/digger09_toothbrush_v1_revision.md)
import os, re
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine", "d09_body.js"); s = open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
# 1. no "fi" ligature in the sticker (zero-width non-joiner)
rep("'first real brush?'", "'f\\u200Cirst real brush?'")
# 3. Addis drills DOWN into the bone lying on a small table: one arm forward, the gimlet handle in his fist
i = s.index("  // ===== 13. "); j = s.index("  // ===== ", i + 10)
s = s[:i] + """  // ===== 13. "He drilled holes in a leftover bone… and tied in bristles."  medium close: the bone lies on a little table, Addis turns a gimlet down into it with his fist on the handle; tufts pop into the holes
  SH([9, 'He'], 'C', (t0) => { const scene = new THREE.Scene(); prison(scene); const ad = labCoat(npcAt(scene, 'bank_teller', 'grey', -0.35, -0.6, 0.15, 1.25), 0x6a4a2a); ad.walk(0); npcSet(ad, 'Bone004', -1.05); const hr = npcHand(ad, 'R');
    const gm = gimlet(); gm.scale.setScalar(1.5); gm.position.copy(hr).add(V3([0, -0.12 * 1.5 - 0.01, 0])); scene.add(gm); const by = gm.position.y - 0.035 * 1.5 - 0.02;
    const tbl = new THREE.Group(); tbl.position.set(hr.x, 0, hr.z); scene.add(tbl); L.box(0.6, 0.05, 0.45, mm(MT.wood, 1, 0.5), 0, by - 0.035, 0, tbl); for (const [x2, z2] of [[-0.26, -0.18], [0.26, -0.18], [-0.26, 0.18], [0.26, 0.18]]) L.box(0.05, by - 0.06, 0.05, mm(MT.darkWood, 0.2, 1), x2, (by - 0.06) / 2, z2, tbl);
    const bone = new THREE.Group(); bone.position.set(hr.x, by, hr.z); scene.add(bone); const bm = litM(null, 0xeee4c8); L.box(0.4, 0.035, 0.06, bm, 0.05, 0, 0, bone); for (const s2 of [-1, 1]) L.mesh(new THREE.SphereGeometry(0.04, 6, 4), bm, 0.05 + s2 * 0.21, 0, 0, bone);
    const tufts = []; for (let k = 0; k < 6; k++) { L.box(0.018, 0.04, 0.018, litM(null, 0x3a3020), -0.05 + k * 0.035, 0.0, 0, bone); const tf = L.box(0.022, 0.06, 0.022, litM(null, 0x2a2420), -0.05 + k * 0.035, 0.045, 0, bone); tf.visible = false; tufts.push(tf); }
    ad.updateMatrixWorld(true); ad.bones.Bone005.attach(gm); const ch = hero(scene, { p: [0.45, 0, 0.55], ry: -0.55 }); const cam = CAM([[0.15, 1.6, 3.0], [0.15, 1.58, 2.88]], [[0.0, 1.0, -0.3]], 48);
    const tD = ws(9, 'drilled'), tT = ws(9, 'tied'); cue(tD, 'drill'); cue(tT, 'tie'); const fx = new FX(LW, LH).add('dust', { target: bone, offset: [0, 0.03, 0.03], t0: tD, dur: tT - tD });
    return { scene, cam, fx, upd(t) { const q = q15(t); gm.rotation.y = q >= tD && q < tT ? q * 14 : 0; tufts.forEach((tf, k) => { tf.visible = q >= tT + k * 0.12; }); ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'talkO'], [tT, 'open', 'smileOpen']]); } }; });
""" + s[j:]
# 4. the bone rests on a sandstone pillar beyond her fist (no crossing), the brush touches its end
rep("const bn = bigBone(scene, 0.38, 1.0, 0.75, 1.0); bn.rotation.z = 0.2; const ch = hero(scene, { p: [-0.3, 0, 0.75], ry: 0.3 });",
    "const ch = hero(scene, { p: [-0.35, 0, 0.75], ry: 0.3 }); ch.drive(0, [still('present', 1.2)], [[-99, 'open', 'smile']], false); ch.root.updateMatrixWorld(true); const f0 = ch.fist('L', V3([0, 0, 0])); const bn = bigBone(scene, f0.x + 0.38, f0.y + 0.02, f0.z, 0.7); bn.rotation.y = 0.3;\n"
    "    L.box(0.3, f0.y - 0.05, 0.3, mm(MT.stone, 1, 2, 0xd8b880), f0.x + 0.38, (f0.y - 0.05) / 2, f0.z, scene);")
rep("bn.position.y = 1.0 + 0.02 * Math.sin(q * 20);", "bn.position.y = f0.y + 0.02 + 0.006 * Math.sin(q * 20);")
rep("const cam = CAM([[0.11, 1.40, 3.69], [0.11, 1.37, 3.51]], [[0.05, 1.1, 0.5]], 46);", "const cam = CAM([[0.15, 1.40, 3.9], [0.15, 1.37, 3.7]], [[0.15, 1.05, 0.5]], 46);")
# 5./8. nylon close: the LEFT hand holds it out, she faces the camera (3/4)
rep("const ch = hero(scene, { p: [-0.35, 0, -0.1], ry: -0.55 }); const tb = toothbrush(0xe83a3a); tb.scale.setScalar(2.0); const hold = holdIn(ch, 'R', tb, [0.0, 0.05, 0.05], [0, 0.3, 0]);",
    "const ch = hero(scene, { p: [-0.25, 0, 0.0], ry: 0.55 }); const tb = toothbrush(0xe83a3a); tb.scale.setScalar(2.0); const hold = holdIn(ch, 'L', tb, [0.0, 0.05, 0.05], [0, -0.3, 0]);")
rep("const cam = CAM([[1.2, 1.4, 1.6], [1.15, 1.38, 1.5]], [[-0.4, 1.15, -0.4]], 44);", "const cam = CAM([[1.1, 1.4, 2.4], [1.05, 1.38, 2.3]], [[0.0, 1.15, -0.2]], 46);")
# 7. chewing: the twig's frayed end at her mouth (hands raised), shavings fly
rep("const hold = holdIn(ch, 'R', cs, [0.02, 0.02, 0.06], [0, 0, 0.6]);", "const hold = holdIn(ch, 'R', cs, [0.0, 0.0, 0.05], [0, 0, 1.25]);")
rep("ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'smile'], [tC, 'open', chew", "ch.drive(t, [still('blow_tube', 1.0)], [[-99, 'open', 'smile'], [tC, 'open', chew")
# 9. framings: teeth, market, bristle-brush close
rep("const cam = CAM([[0.10, 1.36, 3.57], [0.10, 1.34, 3.45]], [[0.1, 0.95, 0.5]], 46);", "const cam = CAM([[0.15, 1.36, 3.9], [0.15, 1.34, 3.78]], [[0.15, 0.95, 0.5]], 48);")
rep("const ch = hero(scene, { p: [3.9, 0, 0.5], ry: -0.5 }); const cam = CAM([[3.4, 1.45, 4.1], [3.38, 1.43, 3.9]], [[3.4, 1.0, -0.6]], 52);", "const ch = hero(scene, { p: [3.75, 0, 0.5], ry: -0.5 }); const cam = CAM([[3.35, 1.45, 4.3], [3.33, 1.43, 4.1]], [[3.35, 1.0, -0.6]], 52);")
rep("const cam = CAM([[0.26, 1.44, 3.20], [0.26, 1.42, 3.08]], [[0.2, 1.15, 0.6]], 44);", "const cam = CAM([[0.3, 1.44, 3.6], [0.3, 1.42, 3.48]], [[0.25, 1.1, 0.6]], 46);")
# 10. ending: she and the drone on the grass, not in the pond
rep("const dr = drone(); dr.position.set(-2.0, 0.08, -1.9); scene.add(dr); const ch = hero(scene, { p: [-2.5, 0.04, -2.0], ry: 0.6 });", "const dr = drone(); dr.position.set(-1.85, 0.08, -0.9); scene.add(dr); const ch = hero(scene, { p: [-2.45, 0.04, -1.25], ry: 0.6 });")
rep("const cam = CAM([[-1.47, 1.24, 1.07], [-1.47, 1.35, 1.54]], [[-2.3, 1.0, -2.0]], 48);", "const cam = CAM([[-1.4, 1.24, 1.9], [-1.4, 1.35, 2.3]], [[-2.2, 1.0, -1.25]], 48);")
# 14. the closing question from a different angle (low, from the other side)
rep("const cam = CAM([[-0.63, 1.40, 2.09], [-0.65, 1.37, 1.97]], [[-1.10, 1.1, -1.1]], 46);", "const cam = CAM([[-2.2, 0.9, 1.2], [-2.15, 0.9, 1.1]], [[-1.3, 1.15, -1.1]], 46);")
rep("const ch = hero(scene, { p: [-1.4, 0.04, -1.1], ry: 0.5 });", "const ch = hero(scene, { p: [-1.4, 0.04, -1.1], ry: -0.4 });")
# 2. ARTIFACT 004 label clear of the drone
rep("const dr = drone(); dr.position.set(0.9, 1.9, -0.6);", "const dr = drone(); dr.position.set(1.0, 1.25, -0.9);")
# 11. prison: a ceiling (no black strip), no loose ivy squares
rep("ivy(scene, 0.6, 2.6, -1.68, 0.9, 1.0);", "L.box(9, 0.2, 7, sw, 0, 3.45, 0.5, scene);")
open(p, "w", encoding="utf-8").write(s)
# 6. reaction pause after "Gross."
a = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "voz", "scripts", "assemble.py"); t = open(a, encoding="utf-8").read()
t = t.replace("GAP = {i: 0.28 for i in range(1, 14)}", "GAP = {i: 0.25 for i in range(1, 14)}").replace("GAP.update({1: 0.4, 7: 0.35, 12: 0.45})", "GAP.update({1: 0.4, 7: 0.3, 8: 0.6, 12: 0.4})")
open(a, "w", encoding="utf-8").write(t); print("ok")
