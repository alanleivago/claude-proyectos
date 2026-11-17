"""blender -b -Y <MetalShadow.blend> --python inspect_uv.py  (read-only: faces whose UVs fall in the eye texture block)"""
import bpy
o = bpy.data.objects["Cube.002"]; me = o.data; uv = me.uv_layers.active.data
vg = {g.index: g.name for g in o.vertex_groups}
for p in me.polygons:
    us = [uv[l].uv for l in p.loop_indices]
    u0, u1 = min(u.x for u in us), max(u.x for u in us); v0, v1 = min(u.y for u in us), max(u.y for u in us)
    if u1 <= 0.51 and v0 >= 0.49:
        c = p.center; n = p.normal
        grp = {}
        for vi in p.vertices:
            for e in me.vertices[vi].groups: grp[vg[e.group]] = grp.get(vg[e.group], 0) + e.weight
        print(p.index, "n%d" % len(us), "uv", [(round(u.x*128,1), round((1-u.y)*128,1)) for u in us], "c", tuple(round(x,2) for x in c), "nrm", tuple(round(x,2) for x in n), max(grp, key=grp.get))
