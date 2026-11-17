"""Blender headless: smart-UV-project a fitted mesh npz (V,F,P,names) per part into one atlas -> <out>_uv.npz (FUV m x 3 x 2)
blender -b --factory-startup --python tools/bl_uv.py -- <in.npz> <out.npz> [exclude_face_ids.npy]"""
import bpy, bmesh, sys, numpy as np
argv = sys.argv[sys.argv.index("--") + 1:]
D = np.load(argv[0], allow_pickle=True); V, F = D["V"], D["F"]
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
me = bpy.data.meshes.new("M"); me.from_pydata(V.tolist(), [], F.tolist()); me.update()
ob = bpy.data.objects.new("M", me); bpy.context.scene.collection.objects.link(ob)
bpy.context.view_layer.objects.active = ob; ob.select_set(True)
me.uv_layers.new(name="UV")
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.003, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)
bpy.ops.uv.pack_islands(margin=0.002, rotate=True)
bpy.ops.object.mode_set(mode="OBJECT")
uv = np.zeros((len(me.loops), 2)); me.uv_layers["UV"].data.foreach_get("uv", uv.ravel())
FUV = np.zeros((len(F), 3, 2))
for p in me.polygons:
    FUV[p.index] = uv[p.loop_start:p.loop_start + 3]
# loops follow polygon vertex order == F order
np.savez(argv[1], FUV=FUV)
print("UV ok", FUV.min(), FUV.max())
