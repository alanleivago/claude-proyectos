"""Shared headless-Blender helpers: flat unlit PS1-look ortho renders (Workbench, texture colour)."""
import math
import bpy
from mathutils import Vector

ANG = {"front": 0, "3q": 35, "side": 90, "back": 180, "3qb": 145, "side2": -90, "3ql": -35}


def setup(size=512, bg=(0.62, 0.64, 0.68)):
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_WORKBENCH"
    sh = sc.display.shading
    sh.light = "FLAT"
    sh.color_type = "TEXTURE"
    sh.show_object_outline = False
    sh.show_backface_culling = False
    sh.background_type = "VIEWPORT"
    sh.background_color = bg
    sc.render.resolution_x = sc.render.resolution_y = size
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "Standard"
    sc.display.render_aa = "OFF"
    for m in bpy.data.materials:
        try:
            m.surface_render_method = "DITHERED"
        except Exception:
            pass
        if m.node_tree:
            for n in m.node_tree.nodes:
                if n.type == "TEX_IMAGE":
                    n.interpolation = "Closest"
    return sc


def bounds(objs):
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    mn = Vector([min(p[i] for p in pts) for i in range(3)])
    mx = Vector([max(p[i] for p in pts) for i in range(3)])
    return mn, mx


def camera(name="QCam"):
    sc = bpy.context.scene
    cam = bpy.data.objects.get(name)
    if cam is None:
        cam = bpy.data.objects.new(name, bpy.data.cameras.new(name))
        sc.collection.objects.link(cam)
    cam.data.type = "ORTHO"
    sc.camera = cam
    return cam


def shoot(path, ctr, ext, view="front", elev=0.0, aspect=1.0):
    """Ortho shot centred on ctr; ext = vertical extent in metres; view = name or yaw degrees."""
    sc = bpy.context.scene
    cam = camera()
    a = math.radians(ANG[view] if isinstance(view, str) else view)
    e = math.radians(elev)
    d = 50
    cam.location = Vector(ctr) + Vector((math.sin(a) * math.cos(e) * d, -math.cos(a) * math.cos(e) * d, math.sin(e) * d))
    cam.rotation_euler = (math.radians(90) - e, 0, a)
    cam.data.ortho_scale = ext * max(1.0, aspect)
    cam.data.clip_end = 200
    sc.render.resolution_x = int(sc.render.resolution_y * aspect)
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
