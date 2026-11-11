"""self-check strip: a human playing a baked action, N frames side by side (front 3/4, camera tracking the root).
    Blender -b -P pieces/cast-pack/tools/motion_strip.py -- <slug> <action> <out.png> [n=6]"""
import math, os, sys
import bpy
from mathutils import Vector
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "styles", "zawdog", "humans"))
import human as HU  # noqa: E402
A = sys.argv[sys.argv.index("--") + 1:]; SLUG, ACT, OUT = A[:3]; NN = int(A[3].split("=")[1]) if len(A) > 3 else 6
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
P = HU.Human(SLUG); act = HU.load_action(ACT); P.play(act)
sc = bpy.context.scene; sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x, sc.render.resolution_y = 300, 520
sc.world = sc.world or bpy.data.worlds.new("w"); sc.world.use_nodes = True
sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.36, 0.37, 0.41, 1)
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
sun.rotation_euler = (math.radians(50), 0, math.radians(-25)); sun.data.energy = 3.0
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = 35
f0, f1 = int(act.frame_range[0]), int(act.frame_range[1]); outs = []
for k in range(NN):
    f = int(f0 + (f1 - f0) * k / max(1, NN - 1)); sc.frame_set(f); bpy.context.view_layer.update()
    r = P.bone_world("root"); tgt = Vector((r.x, r.y, 0.85))
    cam.location = tgt + Vector((1.6, -2.6, 0.25)); cam.rotation_euler = (tgt - cam.location).to_track_quat("-Z", "Y").to_euler()
    p = OUT[:-4] + f"_{k}.png"; sc.render.filepath = p; bpy.ops.render.render(write_still=True); outs.append(p)
import numpy as np
ims = [np.array(bpy.data.images.load(p).pixels[:]).reshape(520, 300, 4) for p in outs]
st = np.concatenate(ims, axis=1); im = bpy.data.images.new("strip", st.shape[1], st.shape[0]); im.pixels = st.ravel()
im.filepath_raw = OUT; im.file_format = "PNG"; im.save()
for p in outs:
    os.remove(p)
print("STRIP", OUT)
