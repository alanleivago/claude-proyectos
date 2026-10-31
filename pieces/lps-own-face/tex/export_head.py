"""blender -b ../lps-hombre/out/lps_hombre.blend -P tex/export_head.py : head mesh (local coords) + UVs -> tex/head_mesh.npz"""
import bpy, numpy as np, os
o = bpy.data.objects["head"]; me = o.data; me.calc_loop_triangles()
uv = me.uv_layers.active.data
P, U = [], []
for t in me.loop_triangles:
    P.append([tuple(me.vertices[v].co) for v in t.vertices]); U.append([tuple(uv[l].uv) for l in t.loops])
np.savez(os.path.join(os.path.dirname(bpy.data.filepath), "../../lps-own-face/tex/head_mesh.npz"), P=np.array(P), U=np.array(U))
print("tris", len(P), np.array(P).reshape(-1, 3).min(0), np.array(P).reshape(-1, 3).max(0), "scale", tuple(o.scale))
