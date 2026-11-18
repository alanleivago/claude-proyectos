"""Blender (exec'd inside pieces/zaw-dog-05/build.py, loads shots.py): scene QA on EVERY frame of every shot ->
review/qa_scene.txt:  feet (people + dog lowest vertex), dog vs furniture (vertices inside the bounding box), dog vs people
(dog vertices INSIDE a human mesh: ray parity on a BVH), trembling (2nd temporal difference of the dog head / human heads, mm).
Blender -b -P pieces/zaw-dog-05/build.py -- exec pieces/zaw-dog-06/tools/qa_scene.py [beat ...]"""
import os
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
SEL = ARGS[2:]                                                          # noqa: F821
exec(open(os.path.join(ROOT, "pieces", "zaw-dog-06", "shots.py")).read().replace("XA = ARGS[2:]", 'XA = ["none"]'))   # noqa: F821
FURN = [o for o in bpy.data.objects if o.type == "MESH" and o.name.startswith(("tv_cab", "tv", "armchair", "sofa", "bookshelf", "dogbed", "plant", "floor_lamp", "ct_top", "lamp_pole", "st_hedge"))]


def box_of(o):
    pts = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return [min(p[i] for p in pts) for i in range(3)], [max(p[i] for p in pts) for i in range(3)]


def inside_count(bvh, V):
    n = 0
    for v in V[::3]:
        hits, o, d = 0, Vector(v), Vector((0.0, 0.0, 1.0))
        while True:
            loc, nor, idx, dist = bvh.ray_cast(o, d)
            if loc is None:
                break
            hits += 1; o = loc + d * 1e-4
            if hits > 8:
                break
        n += hits % 2
    return n


rows = []
for b in BEATS6:
    n = b[0]
    if SEL and n not in SEL:
        continue
    low_p, low_d, furn, ppl, heads = {}, [], {}, {}, {}
    for f in range(b[1], b[2]):
        frame6(b, f); dg = bpy.context.evaluated_depsgraph_get()
        dog_on = not DOGS[0]["o"].hide_render                           # noqa: F821
        V = dog_low(dg) if dog_on else None                             # noqa: F821
        if dog_on:
            low_d.append(float(V[:, 2].min()))
            for o in FURN:
                if o.hide_render or o.hide_get():
                    continue
                lo, hi = box_of(o)
                k = int(((V[:, 0] > lo[0]) & (V[:, 0] < hi[0]) & (V[:, 1] > lo[1]) & (V[:, 1] < hi[1]) & (V[:, 2] > lo[2] + 0.01) & (V[:, 2] < hi[2])).sum())
                if k:
                    furn.setdefault(o.name, []).append(f)
            heads.setdefault("dog", []).append(tuple(dog_head(0)))     # noqa: F821
        for s_, P in CAST.items():
            if P.body.hide_render:
                continue
            ev = P.body.evaluated_get(dg); mw = ev.matrix_world
            pts = [mw @ v.co for v in ev.data.vertices]
            low_p.setdefault(s_, []).append(min(p.z for p in pts))
            heads.setdefault(s_, []).append(tuple(P.bone_world("head")))
            if dog_on and f % 2 == 0:
                bvh = BVHTree.FromObject(ev, dg)                          # world-space test: transform the dog verts into object space
                inv = mw.inverted(); Vl = np.array([tuple(inv @ Vector(v)) for v in V])
                k = inside_count(bvh, Vl)
                if k:
                    ppl.setdefault(s_, []).append((f, k))
    line = f"{n}:"
    if low_d:
        line += f" dog low {min(low_d):+.3f}..{max(low_d):+.3f}"
    for s_, v in low_p.items():
        line += f" | {s_} low {min(v):+.3f}..{max(v):+.3f}"
    for s_, hp_ in heads.items():
        a = np.array(hp_)
        if len(a) > 3:
            j = np.linalg.norm(a[2:] - 2 * a[1:-1] + a[:-2], axis=1) * 1000
            line += f" | tremble {s_} med {np.median(j):.1f} p95 {np.percentile(j, 95):.1f} mm"
    line += " | furniture " + ("clear" if not furn else "; ".join(f"{k} f{v[0]}-{v[-1]}" for k, v in furn.items()))
    line += " | dog-in-person " + ("clear" if not ppl else "; ".join(f"{k} {len(v)} fr (max {max(x[1] for x in v)} v)" for k, v in ppl.items()))
    rows.append(line); print("QA", line, flush=True)
open(os.path.join(Z6, "review", "qa_scene.txt"), "a").write("\n".join(rows) + "\n")
