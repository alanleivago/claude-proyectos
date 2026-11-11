"""Cast pack review renders (headless, one fresh Blender per job).
    Blender -b -P pieces/cast-pack/tools/cast_render.py -- sheet <slug> <out_dir>
        -> <slug>_front/_34/_side.png (relaxed idle, ortho, 600x1000) + <slug>_head_<expr>.png (6 faces on the model, 360 px)
    Blender -b -P pieces/cast-pack/tools/cast_render.py -- lineup <slug,slug,...> <out_png>
        -> every human side by side in the relaxed idle (arms down), ortho, shared scale
The relaxed idle is motions/baked/c_<slug>_idle (retarget.py 100style/Neutral_ID start=700 end=820 still=1 stance=0.1 human=<slug>), frame 30."""
import math
import os
import sys

import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "styles", "zawdog", "humans"))
import human as HU  # noqa: E402

A = sys.argv[sys.argv.index("--") + 1:]
MODE, WHO, OUT = A[0], A[1].split(","), A[2]
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE"
sc.world = sc.world or bpy.data.worlds.new("w"); sc.world.use_nodes = True
sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.36, 0.37, 0.41, 1)
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
sun.rotation_euler = (math.radians(50), 0, math.radians(-25)); sun.data.energy = 3.0
fl = bpy.data.objects.new("floor", bpy.data.meshes.new("floor")); sc.collection.objects.link(fl)
fl.data.from_pydata([(-30, -30, 0), (30, -30, 0), (30, 30, 0), (-30, 30, 0)], [], [(0, 1, 2, 3)])
fm = bpy.data.materials.new("floor"); fm.use_nodes = True
fm.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (0.55, 0.55, 0.53, 1); fl.data.materials.append(fm)
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
sc.frame_set(30)


def human(slug, x=0.0):
    P = HU.Human(slug); P.place((x, 0)); P.play(HU.load_action(f"c_{slug}_idle")); return P


def freeze(Ps):
    """hold frame 30 of the idle, then drop the action and level the neck + head (the idle actors look at the floor)."""
    sc.frame_set(30); bpy.context.view_layer.update()
    for P in Ps:
        P.rig.animation_data.action = None
        for pb in P.rig.pose.bones:
            if pb.name.startswith(("neck", "head")):
                pb.rotation_quaternion = (1, 0, 0, 0)
    bpy.context.view_layer.update()


def aim(pos, at):
    cam.location = pos; cam.rotation_euler = (Vector(at) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()


def render(path, w, h):
    sc.render.resolution_x, sc.render.resolution_y = w, h; sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


if MODE == "sheet":
    os.makedirs(OUT, exist_ok=True); slug = WHO[0]; P = human(slug); freeze([P])
    hz = P.bone_world("eye.L").z; top = hz + 0.14
    cam.data.type = "ORTHO"; cam.data.ortho_scale = top * 1.08
    for tag, ang in (("front", 0), ("34", 40), ("side", 90)):
        a = math.radians(ang); aim((6 * math.sin(a), -6 * math.cos(a), top * 0.5), (0, 0, top * 0.5))
        render(os.path.join(OUT, f"{slug}_{tag}.png"), 600, 1000)
    cam.data.type = "PERSP"; cam.data.lens = 60
    head = P.bone_world("head"); hz = P.bone_world("eye.L").z - 0.03
    aim((0.12, -0.95, hz + 0.02), (head.x, head.y, hz))
    for e in HU.EXPR:
        P.face(e); render(os.path.join(OUT, f"{slug}_head_{e}.png"), 360, 360)
else:
    xs = []; x = 0.0; Ps = []
    for slug in WHO:
        Ps.append(human(slug, x)); xs.append(x); x += 0.62
    freeze(Ps)
    cx = xs[-1] / 2; cam.data.type = "ORTHO"; cam.data.ortho_scale = x + 0.2
    aim((cx, -20, 0.95), (cx, 0, 0.95))
    render(OUT, 3000, int(3000 * 2.1 / (x + 0.2)))
