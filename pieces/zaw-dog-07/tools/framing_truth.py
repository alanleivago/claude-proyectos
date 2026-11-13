"""Blender (exec'd inside pieces/zaw-dog-05/build.py, loads shots.py): the TRUE framing of every #7 shot at its first,
board and last frame: camera height, pitch, lens, distance to the dog / each human, and the projected height of the dog
and the humans as a fraction of the frame (world_to_camera_view of every vertex, clipped to the frame).
[Z7_SHOTS=v1/shots_v1.py Z7_TRUTH_OUT=framing_truth_v1.json] Blender -b -P pieces/zaw-dog-05/build.py -- exec pieces/zaw-dog-07/tools/framing_truth.py
-> review/framing_truth.json"""
import json, math, os
from bpy_extras.object_utils import world_to_camera_view
SHOTS_ = os.environ.get("Z7_SHOTS") or os.path.join(ROOT, "pieces", "zaw-dog-07", "shots.py")   # noqa: F821
exec(open(SHOTS_).read().replace("XA = ARGS[2:]", 'XA = ["none"]'))   # noqa: F821


def frac(o):
    dg = bpy.context.evaluated_depsgraph_get(); ev = o.evaluated_get(dg); mw = ev.matrix_world
    ys = []; xs = []
    for v in list(ev.data.vertices)[::2]:
        p = world_to_camera_view(sc, CAM, mw @ v.co)                   # noqa: F821
        if p.z > 0:
            ys.append(p.y); xs.append(p.x)
    if not ys:
        return None
    inx = [y for x, y in zip(xs, ys) if 0 <= x <= 1]
    if not inx:
        return 0.0
    lo, hi = max(0.0, min(inx)), min(1.0, max(inx))
    return round(max(0.0, hi - lo), 3)


rows = {}
for b in BEATS7:
    out = []
    for f in (b[1], round(b[1] + b[4] * (b[2] - b[1])), b[2] - 1):
        frame7(b, f); bpy.context.view_layer.update()
        m = CAM.matrix_world; pos = m.translation; fwd = m.to_3x3() @ Vector((0, 0, -1))   # noqa: F821
        r = {"f": f, "cam_h": round(pos.z, 2), "pitch": round(math.degrees(math.asin(max(-1, min(1, fwd.z)))), 1), "lens": round(CAM.data.lens, 1)}   # noqa: F821
        if not DOGS[0]["o"].hide_render:                                # noqa: F821
            hd = dog_head(0); r["dog_dist"] = round((hd - pos).length, 2); r["dog_h"] = frac(DOGS[0]["o"])   # noqa: F821
        for s_, P in CAST.items():
            if not P.body.hide_render:
                r[f"{s_}_dist"] = round((head_c(P) - pos).length, 2); r[f"{s_}_h"] = frac(P.body)
        out.append(r)
    rows[b[0]] = out; print("TRUTH", b[0], out[1])
json.dump(rows, open(os.path.join(Z7, "review", os.environ.get("Z7_TRUTH_OUT") or "framing_truth.json"), "w"), indent=1)
