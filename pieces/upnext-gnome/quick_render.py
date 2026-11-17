"""Flat unlit (Workbench, texture colour) ortho renders of the open .blend for quick checks.

    blender -b <file.blend> --python quick_render.py -- <out_prefix> [views=front,side,back,3q] [size=400]"""
import sys, math, bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
out = argv[0]; views = (argv[1] if len(argv) > 1 else "front,side,back,3q").split(","); size = int(argv[2]) if len(argv) > 2 else 400
sc = bpy.context.scene
sc.render.engine = "BLENDER_WORKBENCH"
sh = sc.display.shading
sh.light = "FLAT"; sh.color_type = "TEXTURE"; sh.show_object_outline = False
sc.render.resolution_x = sc.render.resolution_y = size
sc.render.film_transparent = False
sc.view_settings.view_transform = "Standard"
for m in bpy.data.materials:
    if m.node_tree:
        for l in list(m.node_tree.links):
            if l.to_socket.name == "Alpha": m.node_tree.links.remove(l)
for im in bpy.data.images: im.alpha_mode = "NONE"
sc.world = sc.world or bpy.data.worlds.new("W")
sh.background_type = "VIEWPORT"; sh.background_color = (0.75, 0.75, 0.78)
pts = [o.matrix_world @ Vector(c) for o in sc.objects if o.type == "MESH" and o.visible_get() for c in o.bound_box]
mn = Vector([min(p[i] for p in pts) for i in range(3)]); mx = Vector([max(p[i] for p in pts) for i in range(3)])
ctr = (mn + mx) / 2; ext = max(mx - mn) * 1.1
cam = bpy.data.objects.new("QCam", bpy.data.cameras.new("QCam")); sc.collection.objects.link(cam)
cam.data.type = "ORTHO"; cam.data.ortho_scale = ext; sc.camera = cam
ang = {"front": 0, "3q": 35, "side": 90, "back": 180, "side2": -90}
for v in views:
    a = math.radians(ang[v])
    cam.location = ctr + Vector((math.sin(a) * 100, -math.cos(a) * 100, 0))
    cam.rotation_euler = (math.radians(90), 0, a)
    sc.render.filepath = f"{out}_{v}.png"
    bpy.ops.render.render(write_still=True)
print("QR DONE")
