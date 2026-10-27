"""blender -b neto.blend --python export_neto.py -- <out.glb> [texture.png]
Swaps the asset's Diffuse+Transparent node setups for a Principled BSDF with alpha clip (what glTF understands)
and exports the meshes + deform bones. Run on the asset in background; the .blend is not saved."""
import bpy, sys, os

argv = sys.argv[sys.argv.index("--") + 1:]
OUT = argv[0]
BODY_TEX = argv[1] if len(argv) > 1 else None

for m in bpy.data.materials:
    if not m.use_nodes or m.name == "uvs":
        continue
    nt = m.node_tree
    tex = next((n for n in nt.nodes if n.type == "TEX_IMAGE" and n.image), None)
    if not tex:
        continue
    img = tex.image
    if m.name == "base" and BODY_TEX:
        img = bpy.data.images.load(BODY_TEX, check_existing=True)
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = img; t.interpolation = "Closest"
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    o = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    nt.links.new(t.outputs["Alpha"], b.inputs["Alpha"])
    b.inputs["Roughness"].default_value = 1.0
    nt.links.new(b.outputs["BSDF"], o.inputs["Surface"])
    m.blend_method = "CLIP" if hasattr(m, "blend_method") else m.blend_method

# only the character: rig + its meshes
keep = {"rig"} | {o.name for o in bpy.data.objects if o.parent and o.parent.name == "rig" and o.type == "MESH"}
for o in bpy.data.objects:
    o.select_set(o.name in keep)

bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_apply=True, export_def_bones=True,
                          export_animations=False, export_yup=True, export_image_format="AUTO")
print("EXPORTED", OUT, os.path.getsize(OUT))
