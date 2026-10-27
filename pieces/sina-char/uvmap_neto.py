"""blender -b neto.blend --python uvmap_neto.py -- <out_dir>
Rasterizes every mesh's UV triangles into the 256x256 texture space and saves, per texel:
 obj id (uvmap_obj.png, palette in uvmap_objs.txt), rest-pose 3D position (uvmap_pos.npy) and normal (uvmap_nrm.npy).
Mirror modifiers are evaluated so both halves are covered. Never saves the .blend."""
import bpy, sys, os
import numpy as np

OUT = sys.argv[sys.argv.index("--") + 1:][0]
os.makedirs(OUT, exist_ok=True)
N = 256
obj_id = np.zeros((N, N), np.uint8)
pos = np.zeros((N, N, 3), np.float32)
nrm = np.zeros((N, N, 3), np.float32)
names = []

rig = bpy.data.objects["rig"]
rig.data.pose_position = "REST"
dg = bpy.context.evaluated_depsgraph_get()
for o in bpy.data.objects:
    if o.type != "MESH" or o.parent != rig:
        continue
    names.append(o.name); oid = len(names)
    ev = o.evaluated_get(dg); me = ev.to_mesh()
    me.calc_loop_triangles()
    uv = me.uv_layers.active.data
    M = o.matrix_world
    for tri in me.loop_triangles:
        mat = o.material_slots[tri.material_index].material if o.material_slots else None
        if not mat or mat.name != "base":   # face parts have their own 32x32 sprites
            continue
        P = [np.array(M @ me.vertices[v].co) for v in tri.vertices]
        n = np.array((M.to_3x3() @ tri.normal).normalized())
        T = [np.array(uv[l].uv) * N for l in tri.loops]
        x0, y0 = np.floor(np.min(T, 0)).astype(int); x1, y1 = np.ceil(np.max(T, 0)).astype(int)
        (ax, ay), (bx, by), (cx, cy) = T
        den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
        if abs(den) < 1e-9:
            continue
        for py in range(max(y0, 0), min(y1 + 1, N)):
            for px in range(max(x0, 0), min(x1 + 1, N)):
                sx, sy = px + 0.5, py + 0.5
                w0 = ((by - cy) * (sx - cx) + (cx - bx) * (sy - cy)) / den
                w1 = ((cy - ay) * (sx - cx) + (ax - cx) * (sy - cy)) / den
                w2 = 1 - w0 - w1
                if min(w0, w1, w2) < -0.02:
                    continue
                r = N - 1 - py   # image row (UV v goes up)
                obj_id[r, px] = oid
                pos[r, px] = w0 * P[0] + w1 * P[1] + w2 * P[2]
                nrm[r, px] = n
    ev.to_mesh_clear()

np.save(os.path.join(OUT, "uvmap_pos.npy"), pos)
np.save(os.path.join(OUT, "uvmap_nrm.npy"), nrm)
np.save(os.path.join(OUT, "uvmap_obj.npy"), obj_id)
open(os.path.join(OUT, "uvmap_objs.txt"), "w").write("\n".join(f"{i+1} {n}" for i, n in enumerate(names)))
print("UVMAP", names, int((obj_id > 0).sum()), "texels")
