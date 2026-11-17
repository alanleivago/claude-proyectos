"""blender -b out/metalshadow.blend --python ms_measure.py   (per-bone vertex extents, dominant weight)"""
import bpy
o = bpy.data.objects["MetalShadow"]; vg = {g.index: g.name for g in o.vertex_groups}
B = {}; multi = 0
for v in o.data.vertices:
    gs = [g for g in v.groups if g.weight > 0.01]
    if len(gs) > 1: multi += 1
    g = max(v.groups, key=lambda e: e.weight); B.setdefault(vg[g.group], []).append(v.co)
for b, ps in B.items():
    print(b, len(ps), "x", round(min(p.x for p in ps),2), round(max(p.x for p in ps),2), "y", round(min(p.y for p in ps),2), round(max(p.y for p in ps),2), "z", round(min(p.z for p in ps),2), round(max(p.z for p in ps),2))
print("multi-weight verts", multi)
for b in bpy.data.objects["Armature"].data.bones: print(b.name, tuple(round(x,3) for x in b.head_local), tuple(round(x,3) for x in b.tail_local))
