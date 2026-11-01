# fixes from revisar_render v1
import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine"))
s = open("film.js", encoding="utf-8").read()
def R(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
# 1. shot 18: she is inside the frame and points at the scientist (no empty fist)
R("const ch = hero(scene, { p: [-0.55, 0, 0.5], ry: 0.4 }); const tW = ws(7, 'Wehr');", "const ch = hero(scene, { p: [-0.35, 0, 0.7], ry: 0.55 }); const tW = ws(7, 'Wehr');")
R("return { scene, cam: CAM([[0.05, 1.35, 2.8], [0.0, 1.33, 2.6]], [[0.0, 1.0, -0.5]], 50), upd(t) { ch.drive(t, [seg('present', t0 - 0.1)], [[-99, 'happy', 'smileOpen']]); },",
  "return { scene, cam: CAM([[0.1, 1.3, 3.4], [0.08, 1.28, 3.2]], [[0.1, 0.95, -0.3]], 50), upd(t) { ch.drive(t, [seg('point', t0 - 0.1)], [[-99, 'happy', 'smileOpen']]); },")
# 2. shot 17: a readable pose and face (shrug, surprised at "one") instead of the bowed press_down
R("ch.drive(t, [seg('press_down', t0 - 0.1, { loop: true })], [[-99, 'angry', 'frown'], [tO, 'surprised', 'gasp']]);", "ch.drive(t, [seg('shrug', t0 - 0.1), seg('surprised', tO - 0.1, { fade: 0.12 })], [[-99, 'open', 'frown'], [tO, 'surprised', 'gasp']]);")
# 3. shot 20: the Zs anchored on each volunteer's head (thought bubbles), not between the beds
R("cue(tS, 'snore');\n    return { scene, fx, cam:", "cue(tS, 'snore'); vs.forEach((n, i) => fx.add('thought', { target: n, offset: [0, 0.6, -1.3], t0: tS + i * 0.15, dur: 9, scale: 0.7 }));\n    return { scene, fx, cam:")
R("sleepBar(o, 380, 1, t >= tS ? clamp01((t - tS) / 0.8) : 0); if (t >= tS) zzz(o, 160, 230, t - tS); } }; });", "sleepBar(o, 380, 1, t >= tS ? clamp01((t - tS) / 0.8) : 0); } }; });")
# 9. shot 20: a camera jump at "middle" (the 10 s block gets two framings)
R("SH([7, 'After'], 'C', (t0) => { const scene = new THREE.Scene(); sleepLab(scene); const vs = wardBeds(scene); nightGrade(scene); const tM = ws(7, 'middle'), tS = ws(7, 'sleeping');",
  "SH([7, 'After'], 'C', (t0) => { const scene = new THREE.Scene(); sleepLab(scene); const vs = wardBeds(scene); nightGrade(scene); const tM = ws(7, 'many'), tS = ws(7, 'sleeping');")
s = s.replace("return { scene, fx, cam: CAM([[0.2, 1.9, 3.6], [0.2, 1.87, 3.45]], [[0.0, 0.75, -0.1]], 50),\n      ov(o, t) { plateText(o, 'WEEK 4'",
              "return { scene, fx, cam: CAM([[0.2, 1.9, 3.6], [0.2, 1.87, 3.45]], [[0.0, 0.75, -0.1]], 50, { jumps: [{ t: tM, p: [[-1.3, 1.5, 2.2], [-1.25, 1.48, 2.1]], l: [[0.2, 0.7, -0.2]], fov: [48] }] }),\n      ov(o, t) { plateText(o, 'WEEK 4'")
# 4. shot 21: eyes open (calm smile, not the squint)
R("ch.drive(t, [still('wake_sit_up', 9)], [[-99, 'relaxed', 'smile']]); },\n      ov(o, t) { sunInWindow(o, this.cam, R0.win, 0.8, t - t0, 'moon'); clock(o, CX, 90, '3:00'); if (t >= tO)",
  "ch.drive(t, [still('wake_sit_up', 9)], [[-99, 'open', 'smile']]); },\n      ov(o, t) { sunInWindow(o, this.cam, R0.win, 0.8, t - t0, 'moon'); clock(o, CX, 90, '3:00'); if (t >= tO)")
# 5. legs cut: shots 4 (street), 13 (desk), 16 (lit town) pulled back
R("CAM([[-0.3, 1.25, 2.9], [-0.35, 1.25, 2.6]], [[-0.8, 1.05, 0.4]], 50)", "CAM([[-0.4, 1.2, 3.6], [-0.42, 1.2, 3.35]], [[-0.8, 0.9, 0.4]], 50)")
R("CAM([[0.6, 1.35, 1.9], [0.55, 1.33, 1.75]], [[0.5, 0.95, -0.4]], 50)", "CAM([[0.7, 1.3, 2.6], [0.65, 1.28, 2.45]], [[0.5, 0.8, -0.3]], 52)")
R("CAM([[0.1, 1.3, 3.0], [0.05, 1.3, 2.8]], [[-0.1, 1.1, -0.8]], 54)", "CAM([[0.1, 1.2, 3.6], [0.05, 1.2, 3.4]], [[-0.1, 0.9, -0.8]], 54)")
# 10. the lab's floor cables (thin brown sticks entering the frame) are hidden in this short
R("    for (const [a, b] of [[[-2.4, 0.02, -2.3], [-0.6, 0.02, -1.4]], [[1.6, 0.02, -2.3], [2.6, 0.02, -0.6]]]) root(F, a, b, 0.04);\n", "")
open("film.js", "w", encoding="utf-8").write(s); print("ok")
