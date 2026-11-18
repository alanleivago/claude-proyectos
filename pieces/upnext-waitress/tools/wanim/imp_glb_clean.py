"""blender -b --factory-startup --python imp_glb_clean.py -- <in.glb> <out.blend>
Import a waitress GLB exactly as an engine would see it (mesh, skin, UVs, embedded textures, animations) and give every
material the same flat setup as our own build (nearest texture, alpha MASK on the body material, no scale channels), so
OLD and NEW GLBs are rendered by an identical pipeline (no importer alpha artefacts)."""
import bpy, sys
a = sys.argv[sys.argv.index("--") + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=a[0])
for o in list(bpy.data.objects):
    if o.type not in ("MESH", "ARMATURE"): bpy.data.objects.remove(o)
for m in bpy.data.materials:
    if not m.node_tree: continue
    nt = m.node_tree; img = next((n.image for n in nt.nodes if n.type == "TEX_IMAGE"), None)
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial"); bs = nt.nodes.new("ShaderNodeBsdfPrincipled"); tx = nt.nodes.new("ShaderNodeTexImage")
    tx.image = img; tx.interpolation = "Closest"
    if img is not None: img.alpha_mode = "STRAIGHT"
    nt.links.new(tx.outputs["Color"], bs.inputs["Base Color"]); nt.links.new(bs.outputs[0], out.inputs[0])
    if "body" in m.name:
        gt = nt.nodes.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.5
        nt.links.new(tx.outputs["Alpha"], gt.inputs[0]); nt.links.new(gt.outputs[0], bs.inputs["Alpha"])
    try: m.surface_render_method = "DITHERED"
    except Exception: pass
for act in bpy.data.actions:
    try:
        for fc in [fc for fc in act.fcurves if fc.data_path.endswith(".scale")]: act.fcurves.remove(fc)
    except Exception:
        for lay in act.layers:
            for st in lay.strips:
                for cb in st.channelbags:
                    for fc in [fc for fc in cb.fcurves if fc.data_path.endswith(".scale")]: cb.fcurves.remove(fc)
print("MATS", [(m.name, bool(m.node_tree)) for m in bpy.data.materials])
bpy.ops.wm.save_as_mainfile(filepath=a[1])
print("IMPORTED", a[1])
