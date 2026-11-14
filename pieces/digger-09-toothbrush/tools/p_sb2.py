# storyboard framing: she is never cut at the edge (cameras pulled back and centred on her + prop), bigger discovery read
import os, re
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine", "d09_body.js"); s = open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
# pull every shot camera ~18 % further from its target (wider framing), keeping the angle
def widen(m):
    pts = re.findall(r"\[(-?[\d.]+), (-?[\d.]+), (-?[\d.]+)\]", m.group(1)); tg = [float(v) for v in re.findall(r"-?[\d.]+", m.group(2))[:3]]
    out = []
    for x, y, z in pts:
        x, y, z = float(x), float(y), float(z); out.append("[%.2f, %.2f, %.2f]" % (tg[0] + (x - tg[0]) * 1.18, tg[1] + (y - tg[1]) * 1.18, tg[2] + (z - tg[2]) * 1.18))
    return "CAM([" + ", ".join(out) + "], [" + m.group(2) + "]"
s = re.sub(r"CAM\(\[((?:\[[^\]]*\](?:, )?)+)\], \[(\[[^\]]*\])\]", lambda m: widen(m), s)
# centre on her (she stands left, the prop/arm goes right)
rep("const ch = hero(scene, { p: [-0.55, 0, 0.9], ry: 0.5 });", "const ch = hero(scene, { p: [-0.35, 0, 0.95], ry: 0.5 });")
rep("0.35, 0.15, 0.6, scene);\n    const tb = toothbrush(); tb.position.set(0.35, 0.02, 0.6);", "0.45, 0.15, 0.7, scene);\n    const tb = toothbrush(); tb.position.set(0.45, 0.02, 0.7);")
s = s.replace("dr.position.set(0.35 + 0.05 * Math.sin(q * 2), 1.15", "dr.position.set(0.45 + 0.05 * Math.sin(q * 2), 1.05")
s = s.replace("world: [0.35, 0.2, 0.6]", "world: [0.45, 0.2, 0.7]").replace("world: [0.35, 0.6, 0.6]", "world: [0.45, 0.6, 0.7]").replace("world: [0.35, 0.1, 0.6]", "world: [0.45, 0.1, 0.7]")
# every hero in a 'present' shot: target x = hero x + 0.3
def recentre(block):
    m = re.search(r"hero\(scene, \{ p: \[(-?[\d.]+), (-?[\d.]+), (-?[\d.]+)\]", block); c = re.search(r"\], \[\[(-?[\d.]+), (-?[\d.]+), (-?[\d.]+)\]\], (\d+)\)", block)
    if not m or not c: return block
    hx = float(m.group(1)); tx_ = float(c.group(1)); want = hx + 0.3
    if abs(tx_ - want) < 0.12: return block
    d = want - tx_; old = c.group(0); new = "], [[%.2f, %s, %s]], %s)" % (want, c.group(2), c.group(3), c.group(4))
    # move the camera positions by the same dx
    cm = re.search(r"CAM\(\[((?:\[[^\]]*\](?:, )?)+)\]", block); cams = re.sub(r"\[(-?[\d.]+), ", lambda mm: "[%.2f, " % (float(mm.group(1)) + d), cm.group(1))
    block = block.replace(cm.group(1), cams, 1).replace(old, new, 1); return block
parts = re.split(r"(?=  SH\(\[)", s); s = parts[0] + "".join(recentre(b) for b in parts[1:])
# the prison shots: she on the right edge -> bring her in
rep("const ch = hero(scene, { p: [0.4, 0, 0.6], ry: -0.45 });", "const ch = hero(scene, { p: [0.2, 0, 0.7], ry: -0.45 });")
rep("const ch = hero(scene, { p: [0.55, 0, 0.4], ry: -0.5 });", "const ch = hero(scene, { p: [0.35, 0, 0.5], ry: -0.5 });")
# the happy pig fully in frame
rep("const pg = pig(scene, 0.2, 0.3, 0.3, 1.2);", "const pg = pig(scene, 0.0, 0.0, 0.3, 0.9);")
open(p, "w", encoding="utf-8").write(s); print("ok")
