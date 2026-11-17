"""Blender headless: true low-poly version of the fitted parts (quadric collapse to a per-part triangle budget).
Hair: only its outer surface is decimated (the shell is rebuilt afterwards in lowpoly.py).
blender -b --factory-startup --python tools/bl_lowpoly.py -- <dense.npz> <out_parts.npz>"""
import bpy, bmesh, sys, json, numpy as np
argv = sys.argv[sys.argv.index("--") + 1:]
D = np.load(argv[0], allow_pickle=True); V, F, P = D["V"], D["F"], D["P"]; names = [str(n) for n in D["names"]]
BUDGET = dict(hair=560, face=320, neck=40, torso=360, skirt=240, legL=150, legR=150, bootL=170, bootR=170,
              uarmL=70, uarmR=70, farmL=240, farmR=260)
out = {}
for i, n in enumerate(names):
    fs = F[P == i]
    if n == "hair":                                  # outer surface = first half of the hair vertex block
        lo, hi = fs.min(), fs.max() + 1; n0 = (hi - lo) // 2
        fs = fs[(fs < lo + n0).all(1)]
    vid = np.unique(fs); rm = -np.ones(len(V), int); rm[vid] = np.arange(len(vid))
    for o in list(bpy.data.objects): bpy.data.objects.remove(o)
    me = bpy.data.meshes.new(n); me.from_pydata(V[vid].tolist(), [], rm[fs].tolist()); me.update()
    ob = bpy.data.objects.new(n, me); bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob; ob.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.remove_doubles(threshold=1e-6)
    bpy.ops.object.mode_set(mode="OBJECT")
    m = ob.modifiers.new("dec", "DECIMATE"); m.decimate_type = "COLLAPSE"
    m.ratio = min(1.0, BUDGET.get(n, 200) / max(1, len(me.polygons))); m.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=m.name)
    bm = bmesh.new(); bm.from_mesh(ob.data); bmesh.ops.triangulate(bm, faces=bm.faces[:]); bm.to_mesh(ob.data); bm.free()
    vv = np.array([v.co[:] for v in ob.data.vertices]); ff = np.array([list(p.vertices) for p in ob.data.polygons])
    out[n + "_V"] = vv; out[n + "_F"] = ff
    print("LOWPOLY", n, len(fs), "->", len(ff))
np.savez(argv[1], names=np.array(names), **out)
