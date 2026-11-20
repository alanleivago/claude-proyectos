"""frame-by-frame poke-through QA on the skinned ownerf mesh (evaluated, every frame of each action):
  torso->jacket   crop top / skin patch vertices under the jacket panels that come OUT through the jacket
  boot->cuff      boot shaft vertices above the cuff bottom that come out through the rolled jeans cuff
  forearm->sleeve forearm vertices inside the sleeve opening that come out through the sleeve / cuff band
  head->hair      skull vertices above the hair hem that come out through the hair shell
  arm->trunk      hand / forearm vertices more than 1.5 cm inside the jacket or jeans surface
    Blender -b -P qa_poke.py -- <out.txt> <action> [<action> ...]"""
import json
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

R = "/Users/alanleiva/claude-proyectos"
sys.path.insert(0, R + "/styles/zawdog/humans")
import human as HU  # noqa: E402

A = sys.argv[sys.argv.index("--") + 1:]
OUT, ACTS = A[0], A[1:]
META = json.load(open(R + "/styles/zawdog/humans/ownerf/work/mesh_meta.json"))
SRC = META["src"]; PARTS = META["parts"]
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
P = HU.Human("ownerf", flat_shading=False)
ob = P.body; me = ob.data
fsrc = np.array([SRC[me.attributes["src"].data[i].value] for i in range(len(me.polygons))])
fpart = np.array([PARTS[me.attributes["part"].data[i].value] for i in range(len(me.polygons))])
vs = [set() for _ in me.vertices]; vp = [set() for _ in me.vertices]
for p in me.polygons:
    for v in p.vertices:
        vs[v].add(fsrc[p.index]); vp[v].add(fpart[p.index])
rest = np.array([v.co[:] for v in me.vertices])
cuff_bot = min(rest[i, 2] for i in range(len(rest)) if "jcuff" in vs[i])
hair_faces = np.nonzero(fpart == "hair")[0]
hem_z = {}
INNER = {
    "torso->jacket": [i for i in range(len(rest)) if vs[i] == {"torso"} and rest[i, 2] > 1.05 and abs(math.degrees(math.atan2(rest[i, 0], -rest[i, 1]))) > 35],
    "boot->cuff": [i for i in range(len(rest)) if vs[i] <= {"boot", "sole"} and rest[i, 2] > cuff_bot + 0.004],
    "forearm->sleeve": [],
    "head->hair": [i for i in range(len(rest)) if vp[i] == {"head"} and rest[i, 2] > 1.60],
    "arm->trunk": [i for i in range(len(rest)) if vp[i] & {"forearm", "hands"}],
}
# forearm verts that start inside the sleeve (above the cuff band's lower ring)
SH = {s: np.array(P.rig.data.bones[f"lowerarm01.{s}"].head_local) for s in "LR"}
INNER["forearm->sleeve"] = [i for i in range(len(rest)) if vp[i] == {"forearm"} and np.linalg.norm(rest[i] - SH["L" if rest[i, 0] > 0 else "R"]) < 0.035]
OUTER = {"torso->jacket": {"jacket"}, "boot->cuff": {"jcuff"}, "forearm->sleeve": {"sleeve", "cuffband"}, "head->hair": {"hair"},
         "arm->trunk": {"jacket", "jeans", "torso"}}
sc = bpy.context.scene
lines = []
for an in ACTS:
    act = HU.load_action(an); P.play(act)
    f0, f1 = (int(x) for x in act.frame_range)
    worst = {k: (0.0, None) for k in INNER}
    for f in range(f0, f1 + 1):
        sc.frame_set(f)
        dg = bpy.context.evaluated_depsgraph_get(); eo = ob.evaluated_get(dg); em = eo.to_mesh()
        V = np.empty(len(em.vertices) * 3); em.vertices.foreach_get("co", V); V = V.reshape(-1, 3)
        for k, idx in INNER.items():
            fids = [p.index for p in em.polygons if fsrc[p.index] in OUTER[k]] if k != "head->hair" else list(hair_faces)
            if k == "boot->cuff":                     # the cuff's outer wall only (not its inner return flange)
                fids = [j for j in fids if abs(me.polygons[j].normal.z) < 0.6]
            if not fids or not idx:
                continue
            verts = [tuple(V[i]) for i in range(len(V))]
            polys = [tuple(em.polygons[j].vertices) for j in fids]
            bvh = BVHTree.FromPolygons(verts, polys)
            w = 0.0
            for i in idx:
                loc, nrm, _, d = bvh.find_nearest(Vector(V[i]), 0.08)
                if loc is None:
                    continue
                s = (Vector(V[i]) - loc).dot(nrm)
                if k == "arm->trunk":
                    if -s > 0.015 and d < 0.08 and -s - 0.015 > w:
                        w = -s - 0.015
                        if os.environ.get("QA_VERBOSE"):
                            print(f"  arm f{f} v{i} parts={sorted(vp[i])} src={sorted(vs[i])} rest={np.round(rest[i], 3)} depth={-s:.3f}")
                else:
                    if s > 0.002 and s > w:
                        w = s
                        if os.environ.get("QA_VERBOSE") and k in ("boot->cuff", "head->hair"):
                            print(f"  {k} f{f} v{i} rest={np.round(rest[i], 3)} now={np.round(V[i], 3)} near={tuple(round(x, 3) for x in loc)} n={tuple(round(x, 2) for x in nrm)} s={s:.3f}")
            if w > worst[k][0]:
                worst[k] = (w, f)
        eo.to_mesh_clear()
    lines.append(f"{an} ({f1 - f0 + 1} frames): " + ", ".join(f"{k} {v[0] * 100:.1f} cm @f{v[1]}" if v[1] else f"{k} 0" for k, v in worst.items()))
    print(lines[-1], flush=True)
open(OUT, "w").write("\n".join(lines) + "\n")
