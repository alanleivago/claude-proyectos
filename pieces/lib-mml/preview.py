"""lib-mml / preview.py
Importa cada GLB de models/ (comprueba que cargan) y renderiza cada variante de
textura (variants.json) en vista 3/4, sin luces (Workbench flat), vista Standard,
fondo gris. Salida: previews/<id>__<variante>.png  (sheet.py arma preview.png)

  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b --factory-startup --python preview.py
"""
import bpy, json, os, math, sys
from mathutils import Vector

OUT = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(OUT, "previews"), exist_ok=True)
stats = json.load(open(os.path.join(OUT, "data", "stats.json")))
vpath = os.path.join(OUT, "variants.json")
variants = json.load(open(vpath)) if os.path.exists(vpath) else {}
ONLY = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
RES = 360

for mid, st in stats.items():
    if ONLY and mid not in ONLY:
        continue
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    bpy.ops.import_scene.gltf(filepath=os.path.join(OUT, "models", mid + ".glb"))
    for o in list(sc.objects):
        if o.type == "MESH" and not o.material_slots:  # forma de hueso (Icosphere) del importador
            bpy.data.objects.remove(o)
    meshes = [o for o in sc.objects if o.type == "MESH"]
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in meshes:
        ev = o.evaluated_get(dg)
        pts += [ev.matrix_world @ v.co for v in ev.to_mesh().vertices]
    mn = Vector((min(p[i] for p in pts) for i in range(3)))
    mx = Vector((max(p[i] for p in pts) for i in range(3)))
    c = (mn + mx) / 2
    # vista 3/4 desde delante-derecha (el modelo mira a -Y en Blender)
    d = Vector((0.8, -1.0, 0.55)).normalized()
    cam_data = bpy.data.cameras.new("cam")
    cam_data.type = "ORTHO"
    cam = bpy.data.objects.new("cam", cam_data)
    sc.collection.objects.link(cam)
    cam.location = c + d * 50
    cam.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    sc.render.resolution_x = sc.render.resolution_y = RES
    bpy.context.view_layer.update()
    corners = [Vector((x, y, z)) for x in (mn.x, mx.x) for y in (mn.y, mx.y) for z in (mn.z, mx.z)]
    flat = [v for p in corners for v in p]
    loc, scale = cam.camera_fit_coords(bpy.context.evaluated_depsgraph_get(), flat)
    cam.location = loc
    cam_data.ortho_scale = scale * 1.15
    cam_data.clip_end = 1000
    sc.render.engine = "BLENDER_WORKBENCH"
    sh = sc.display.shading
    sh.light = "FLAT"
    sh.color_type = "TEXTURE"
    sh.show_backface_culling = False
    sc.view_settings.view_transform = "Standard"
    w = bpy.data.worlds.new("w")
    w.color = (0.21, 0.21, 0.21)
    sc.world = w
    sc.render.image_settings.file_format = "PNG"
    img_node = None
    for o in meshes:
        for ms in o.material_slots:
            for n in ms.material.node_tree.nodes:
                if n.type == "TEX_IMAGE":
                    img_node = n
    tex = st["tex"]
    vlist = [("orig", os.path.join(OUT, "textures", tex + "_orig.png"))]
    for v in variants.get(tex, []):
        vlist.append((v, os.path.join(OUT, "textures", "%s_%s.png" % (tex, v))))
    for vname, path in vlist:
        img_node.image = bpy.data.images.load(path, check_existing=True)
        img_node.interpolation = "Closest"
        sc.render.filepath = os.path.join(OUT, "previews", "%s__%s.png" % (mid, vname))
        bpy.ops.render.render(write_still=True)
    print("PREVIEW", mid, len(vlist), [o.name for o in sc.objects])
print("DONE")
