"""quick orthographic check renders of a .blend (Workbench): front / side / back (+ optional 3/4), one PNG each.
    Blender -b <file.blend> -P snap.py -- out_prefix [views=front,side,back] [res=900] [mode=random|tex|solid] [wire=1]
    [ortho=2.0] [cz=0.86] [hide=obj1,obj2]"""
import math
import sys

import bpy
from mathutils import Vector

A = sys.argv[sys.argv.index("--") + 1:]
OUT = A[0]
O = dict(views="front,side,back", res="900", mode="random", wire="0", ortho="1.9", cz="0.86", hide="", cx="0", lens="0", dist="6")
O.update(dict(a.split("=", 1) for a in A[1:]))
sc = bpy.context.scene
sc.render.engine = "BLENDER_WORKBENCH"
sh = sc.display.shading
sh.light = "FLAT" if O["mode"] in ("tex", "random") else "STUDIO"
sh.color_type = {"random": "RANDOM", "tex": "TEXTURE", "solid": "MATERIAL"}[O["mode"]]
sh.show_object_outline = False
sh.show_cavity = False
sc.world = sc.world or bpy.data.worlds.new("w")
sc.display.shading.background_type = "VIEWPORT"
if O.get("bg"):
    sc.display.shading.background_type = "WORLD"; sc.world.color = tuple(float(x) for x in O["bg"].split(","))
sc.render.film_transparent = False
sc.render.resolution_x = int(O["res"]); sc.render.resolution_y = int(int(O["res"]) * 1.25)
sc.render.image_settings.file_format = "PNG"
for n in [h for h in O["hide"].split(",") if h]:
    if n in bpy.data.objects:
        bpy.data.objects[n].hide_render = True
if O["wire"] == "1":
    for o in sc.objects:
        if o.type == "MESH":
            m = o.modifiers.new("wf", "WIREFRAME"); m.thickness = 0.0012; m.use_replace = False; m.use_even_offset = False
for o in sc.objects:
    if o.type == "ARMATURE":
        o.hide_render = True
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
if float(O["lens"]) > 0:
    cam.data.type = "PERSP"; cam.data.lens = float(O["lens"]); cam.data.sensor_width = 36
else:
    cam.data.type = "ORTHO"; cam.data.ortho_scale = float(O["ortho"])
VIEWS = {"front": 0, "side": 90, "back": 180, "34": 35, "side2": -90, "34b": 145}
cz = float(O["cz"]); cx = float(O["cx"]); dist = float(O["dist"])
for v in O["views"].split(","):
    yaw = math.radians(VIEWS[v])
    # camera looks at the figure from its front (-Y) rotated around Z by yaw (positive = towards the figure's left)
    pos = Vector((math.sin(yaw) * dist + cx, -math.cos(yaw) * dist, cz))
    cam.location = pos
    d = Vector((cx, 0, cz)) - pos
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = f"{OUT}_{v}.png"
    bpy.ops.render.render(write_still=True)
print("snap done")
