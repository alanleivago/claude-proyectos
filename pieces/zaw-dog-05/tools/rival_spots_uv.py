"""Blender: pick spot centres on the v2 dog's REST mesh (back, flanks, rump, one ear) and export the UV polygons of the
faces inside each spot -> tex/rival_spots.json (prep_04.py paints them black into the rival atlases: crisp PS1 spots).
/Applications/Blender.app/Contents/MacOS/Blender -b -P tools/rival_spots_uv.py"""
import json, os, sys
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path[:0] = [os.path.join(H, "..", "zaw-dog-v2"), os.path.join(H, "..", "lps-onoda")]
import numpy as np  # noqa: E402
import lpskit as K  # noqa: E402
import dog as D  # noqa: E402
K.reset("#808080")
o, arm, fn = D.build(); me = o.data
pa = [0] * len(me.polygons); me.attributes["part"].data.foreach_get("value", pa)
V = np.array([tuple(v.co) for v in me.vertices]); uv = me.uv_layers.active.data
torso = [p for p in me.polygons if D.PARTS[pa[p.index]] == "torso"]
tv = np.array(sorted({v for p in torso for v in p.vertices})); T = V[tv]
ymin, ymax = T[:, 1].min(), T[:, 1].max(); zmax = T[:, 2].max(); xmax = T[:, 0].max()
def near(c):
    return tv[np.argmin(((T - np.array(c)) ** 2).sum(1))]
L_ = ymax - ymin
centres = [  # (vertex index, radius m): back (mid), left flank (rear), right flank (front), rump top
    (near((0.0, ymin + 0.55 * L_, zmax)), 0.055), (near((xmax, ymin + 0.7 * L_, zmax - 0.08)), 0.05),
    (near((-xmax, ymin + 0.35 * L_, zmax - 0.07)), 0.042), (near((0.03, ymin + 0.85 * L_, zmax)), 0.035),
    (near((-xmax, ymin + 0.75 * L_, zmax - 0.1)), 0.045), (near((0.7 * xmax, ymin + 0.3 * L_, zmax - 0.03)), 0.04)]
spots = {"centres": [[*map(float, V[vi]), r] for vi, r in centres], "tris": [], "ear": []}
for p in torso:                                                                    # triangles near a spot: UV + rest-pose XYZ
    if any(np.linalg.norm(np.mean([V[v] for v in p.vertices], 0) - V[vi]) < 2.5 * r for vi, r in centres):
        lv = list(zip(p.loop_indices, p.vertices))
        for k in range(1, len(lv) - 1):
            tri = [lv[0], lv[k], lv[k + 1]]
            spots["tris"].append([[*uv[li].uv, *map(float, V[v])] for li, v in tri])
for p in me.polygons:                                                              # one black ear (the dog's left, +X)
    if D.PARTS[pa[p.index]] == "ear" and np.mean([V[v][0] for v in p.vertices]) > 0:
        spots["ear"].append([list(uv[li].uv) for li in p.loop_indices])
json.dump(spots, open(os.path.join(H, "tex", "rival_spots.json"), "w")); print("spot tris", len(spots["tris"]), "ear polys", len(spots["ear"]))
