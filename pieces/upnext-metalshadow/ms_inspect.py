"""blender -b -Y <MetalShadow.blend> --python inspect.py   (read-only dump)"""
import bpy
for o in bpy.data.objects:
    print("OBJ", o.name, o.type, "parent=", o.parent.name if o.parent else None, "loc", tuple(round(v,3) for v in o.location), "rot", tuple(round(v,3) for v in o.rotation_euler), "scale", tuple(round(v,3) for v in o.scale), "dims", tuple(round(v,3) for v in o.dimensions))
    if o.type == "MESH":
        me = o.data
        print("   verts", len(me.vertices), "faces", len(me.polygons), "mats", [m.name if m else None for m in me.materials], "uvs", [u.name for u in me.uv_layers], "vgroups", [g.name for g in o.vertex_groups][:40], "mods", [(m.type, m.name) for m in o.modifiers], "shapekeys", [k.name for k in me.shape_keys.key_blocks] if me.shape_keys else None)
        import mathutils
        ws = [o.matrix_world @ v.co for v in me.vertices]
        print("   zmin", round(min(w.z for w in ws),3), "zmax", round(max(w.z for w in ws),3), "x", round(min(w.x for w in ws),3), round(max(w.x for w in ws),3), "y", round(min(w.y for w in ws),3), round(max(w.y for w in ws),3))
    if o.type == "ARMATURE":
        for b in o.data.bones:
            print("   BONE", b.name, "parent", b.parent.name if b.parent else None, tuple(round(v,3) for v in b.head_local), tuple(round(v,3) for v in b.tail_local))
for m in bpy.data.materials:
    if m.node_tree:
        print("MAT", m.name, [(n.type, getattr(n, 'image', None) and n.image.name) for n in m.node_tree.nodes])
for im in bpy.data.images:
    print("IMG", im.name, im.filepath, im.size[:], im.packed_file is not None)
for a in bpy.data.actions:
    print("ACT", a.name, a.frame_range[:])
print("TEXTS", [t.name for t in bpy.data.texts])
