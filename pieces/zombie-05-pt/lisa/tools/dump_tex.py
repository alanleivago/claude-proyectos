# blender -b -P dump_tex.py -- <gltf> <outdir>: guarda las texturas de cada material como <objeto>.png
import bpy, sys
a = sys.argv[sys.argv.index("--") + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=a[0])
for o in bpy.context.scene.objects:
    if o.type != "MESH": continue
    for m in o.data.materials:
        for n in m.node_tree.nodes:
            if n.type == "TEX_IMAGE" and n.image:
                im = n.image; print("TEX", o.name, n.label or n.name, im.size[:], im.alpha_mode, [l.to_socket.name for l in n.outputs[0].links], [l.to_socket.name for l in n.outputs[1].links])
                im.filepath_raw = f"{a[1]}/{o.name.replace(' ', '_')}__{n.name.replace(' ', '_')}.png"; im.file_format = "PNG"; im.save()
