"""Read-only: dump per-face UVs, dominant bone and rest-pose centre of the purchased Kaneda (never saves)."""
import bpy, json, sys
out = sys.argv[sys.argv.index("--") + 1]
for o in bpy.context.scene.objects:
    if o.type == "ARMATURE":
        o.data.pose_position = "REST"
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
res = []
for ob in bpy.context.scene.objects:
    if ob.type != "MESH":
        continue
    e = ob.evaluated_get(dg); me = e.to_mesh()
    names = {g.index: g.name for g in ob.vertex_groups}
    uv = me.uv_layers.active.data
    src = ob.data
    for p in me.polygons:
        w = {}
        for vi in p.vertices:
            v = me.vertices[vi]
            for g in getattr(v, "groups", []):
                w[names.get(g.group, "?")] = w.get(names.get(g.group, "?"), 0) + g.weight
        c = ob.matrix_world @ p.center
        res.append(dict(obj=ob.name, uv=[tuple(uv[li].uv) for li in p.loop_indices], bone=max(w, key=w.get) if w else None,
                        c=tuple(c), n=tuple((ob.matrix_world.to_3x3() @ p.normal).normalized())))
    e.to_mesh_clear()
json.dump(res, open(out, "w"))
print("DUMPED", len(res))
