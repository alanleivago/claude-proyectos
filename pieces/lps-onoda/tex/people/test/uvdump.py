import bpy, json
bpy.ops.wm.open_mainfile(filepath="/Users/alanleiva/claude-proyectos/pieces/lps-hombre/out/lps_hombre.blend")
for o in bpy.data.objects:
    o.animation_data_clear()
    if o.type == "MESH": o.rotation_euler = (0, 0, 0)
bpy.context.view_layer.update()
out = []
for o in bpy.data.objects:
    if o.type != "MESH" or not o.data.uv_layers: continue
    m = o.material_slots[0].material if o.material_slots else None
    if m is None or "head" in m.name: continue
    uv = o.data.uv_layers[0].data; mw = o.matrix_world
    for p in o.data.polygons:
        out.append([o.name.split(".")[0], [round(v, 4) for v in (mw.to_3x3() @ p.normal).normalized()],
                    [[round(c, 5) for c in uv[i].uv] for i in p.loop_indices],
                    [[round(c, 4) for c in mw @ o.data.vertices[v].co] for v in p.vertices]])
json.dump(out, open("/Users/alanleiva/claude-proyectos/pieces/lps-onoda/tex/people/body_uv.json", "w"))
print("polys", len(out), sorted({o[0] for o in out}))
