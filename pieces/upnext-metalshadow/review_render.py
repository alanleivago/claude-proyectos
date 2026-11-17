"""Flat unlit (Workbench, texture colour) ortho stills of the animated .blend for review.

    blender -b out/metalshadow_anim.blend --python review_render.py -- <out_dir> <spec> [size=360]
spec: 'turn' -> rest/stand turntable (front, 3q, side, back) in clip idle f1
      'clip:frame:view,...'  e.g. 'walk:1:3q,walk:8:side'  (view = front | 3q | side | back | 3qb)
Files: <out_dir>/<clip>_<frame>_<view>.png. The camera frames a fixed box (same scale for every still)."""
import sys, os, math, bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
out, spec = argv[0], argv[1]; size = int(argv[2]) if len(argv) > 2 else 360
os.makedirs(out, exist_ok=True)
sc = bpy.context.scene
sc.render.engine = "BLENDER_WORKBENCH"
sh = sc.display.shading; sh.light = "FLAT"; sh.color_type = "TEXTURE"; sh.show_object_outline = False
sc.render.resolution_x = size; sc.render.resolution_y = int(size * 1.25); sc.render.resolution_percentage = 100
sc.view_settings.view_transform = "Standard"
sh.background_type = "VIEWPORT"; sh.background_color = (0.78, 0.78, 0.8)
sc.render.film_transparent = False
arm = bpy.data.objects["Armature"]
ad = arm.animation_data
for t in ad.nla_tracks: t.mute = True
cam = bpy.data.objects.new("RCam", bpy.data.cameras.new("RCam")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = "ORTHO"; cam.data.ortho_scale = 10.5
# floor line
bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 0, -0.005))
fl = bpy.context.active_object; m = bpy.data.materials.new("floor"); m.diffuse_color = (0.55, 0.55, 0.6, 1); fl.data.materials.append(m)
fl.display_type = "SOLID"
ANG = {"front": 0, "3q": 35, "side": 90, "back": 180, "3qb": 145, "high": 35, "top": 90}
ELEV = {"high": 35, "top": 50, "side": 3}
items = [("idle", 1, v) for v in ("front", "3q", "side", "back")] if spec == "turn" else \
        [(s.split(":")[0], int(s.split(":")[1]), s.split(":")[2]) for s in spec.split(",")]
REST = spec == "turn" and len(argv) > 3 and argv[3] == "rest"
for clip, f, view in items:
    ad.action = None if REST else bpy.data.actions[clip]
    if REST:
        for pb in arm.pose.bones: pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0)
    sc.frame_set(f)
    a = math.radians(ANG[view]); ctr = Vector((0, 0, 3.9))
    e = math.radians(ELEV.get(view, 6)); ctr = Vector((0, 0, 3.9 if view not in ("high", "top") else 1.5))
    cam.location = ctr + Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e))) * 40
    cam.rotation_euler = (math.pi / 2 - e, 0, a)
    sc.render.filepath = os.path.join(out, f"{clip}_{f}_{view}.png")
    bpy.ops.render.render(write_still=True)
print("RR DONE", len(items))
