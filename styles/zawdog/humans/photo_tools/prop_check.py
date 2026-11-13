"""Clipping check of the rigid accessories (held prop, coat skirt, bag) against the body, over baked motions.
    Blender -b -P styles/zawdog/humans/photo_tools/prop_check.py -- <name> <action,action,...> [every=3]
Prints, per action, the worst penetration (mm) of each accessory's vertices into the body skin surface (legs/torso)."""
import os
import sys

import bmesh
import bpy
from mathutils.bvhtree import BVHTree

H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, H)
import human as HU  # noqa: E402

A = sys.argv[sys.argv.index("--") + 1:]
NAME, ACTS = A[0], A[1].split(",")
OPT = dict(a.split("=") for a in A[2:]); EVERY = int(OPT.get("every", 3))
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
P = HU.Human(NAME)
me0 = P.body.data
mat_names = [m.name for m in me0.materials]
groups = {}
for p in me0.polygons:
    groups.setdefault(mat_names[p.material_index], set()).update(p.vertices)
skin = [p.index for p in me0.polygons if mat_names[p.material_index].endswith("_skin")]
acc = {k: sorted(v) for k, v in groups.items() if "_solid" in k or k.endswith("_coat")}
gn = [g.name for g in P.body.vertex_groups]
vbone = [gn[max(v.groups, key=lambda g: g.weight).group] if len(v.groups) else "?" for v in me0.vertices]
sc = bpy.context.scene
for an in ACTS:
    act = HU.load_action(an); P.play(act)
    f0, f1 = (int(x) for x in act.frame_range)
    worst = {k: (0.0, None, "") for k in acc}
    for f in range(f0, f1 + 1, EVERY):
        sc.frame_set(f)
        dg = bpy.context.evaluated_depsgraph_get(); ob = P.body.evaluated_get(dg); me = ob.to_mesh()
        mw = ob.matrix_world
        V = [mw @ v.co for v in me.vertices]
        bvh = BVHTree.FromPolygons(V, [tuple(me.polygons[i].vertices) for i in skin])
        for k, idx in acc.items():
            for i in idx:
                loc, nrm, pi, dist = bvh.find_nearest(V[i])
                if loc is None:
                    continue
                d = (V[i] - loc).dot(nrm)
                if d < 0 and -d > worst[k][0] and dist < 0.15:
                    worst[k] = (-d, f, vbone[me.polygons[skin[pi]].vertices[0]])
        ob.to_mesh_clear()
    print(f"{NAME} {an}: " + ", ".join(f"{k.split('_', 1)[1]} {w * 1000:.0f} mm@{fr} {bn}" for k, (w, fr, bn) in worst.items()))
