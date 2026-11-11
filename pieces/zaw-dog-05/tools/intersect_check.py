"""Blender (exec'd inside build.py): every frame of the lab shots (05 06 07 08 11 12 13): does any dog vertex fall inside
the bounding box of the living-room furniture (TV unit, TV, armchair, sofa, bookshelf, dog bed, side table)?
-> review/intersect_check.txt      Blender -b -P build.py -- exec tools/intersect_check.py"""
import os
from mathutils import Vector
FURN = [o for o in bpy.data.objects if o.type == "MESH" and o.name.startswith(("tv_cab", "tv", "armchair", "sofa", "bookshelf", "dogbed", "st_", "plant", "floor_lamp"))]
def box_of(o):
    pts = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return [min(p[i] for p in pts) for i in range(3)], [max(p[i] for p in pts) for i in range(3)]
rows = []
for n in ("05", "06", "07", "08", "11", "12", "13"):
    b = BY[n]; hits = {}
    for f in range(b[1], b[2]):
        reset(); b[3]((f - b[1]) / FPS, (b[2] - b[1]) / FPS); bpy.context.view_layer.update()
        V = dog_low(bpy.context.evaluated_depsgraph_get())
        for o in FURN:
            if o.hide_render:
                continue
            lo, hi = box_of(o)
            inside = ((V[:, 0] > lo[0]) & (V[:, 0] < hi[0]) & (V[:, 1] > lo[1]) & (V[:, 1] < hi[1]) & (V[:, 2] > lo[2] + 0.01) & (V[:, 2] < hi[2])).sum()
            if inside:
                hits.setdefault(o.name, []).append((f, int(inside)))
    rows.append(f"{n}: " + ("clear" if not hits else "; ".join(f"{k} frames {v[0][0]}-{v[-1][0]} (max {max(x[1] for x in v)} verts)" for k, v in hits.items())))
open(os.path.join(H, "review", "intersect_check.txt"), "w").write("\n".join(rows) + "\n"); print("\n".join(rows))
