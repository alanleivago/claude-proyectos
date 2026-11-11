"""Self-check renders of a built human (hands, face wrap, neck seam, shoes) before it goes into any shot.
    Blender -b -P styles/zawdog/humans/inspect_human.py -- <name> <out_dir> [face=neutral] [pose=rest|walk]
-> <out_dir>/<name>_{front,34,side,back,head,head34,hands,feet,hipsF,hipsB,neckS}.png (480 px) for tools/tile.py-style contact sheets."""
import math
import os
import sys

import bpy
from mathutils import Vector

H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, H)
A = sys.argv[sys.argv.index("--") + 1:]
NAME, OUT = A[0], A[1]
OPT = dict(a.split("=") for a in A[2:])
os.makedirs(OUT, exist_ok=True)
import human as HU  # noqa: E402

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
P = HU.Human(NAME)
P.face(OPT.get("face", "neutral"))
if OPT.get("pose", "rest") == "down":
    P.arms_down()
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE"
sc.world = sc.world or bpy.data.worlds.new("w"); sc.world.use_nodes = True
sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.35, 0.36, 0.4, 1)
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
sun.rotation_euler = (math.radians(50), 0, math.radians(-30)); sun.data.energy = 3.5
fl = bpy.data.objects.new("floor", bpy.data.meshes.new("floor")); sc.collection.objects.link(fl)
fl.data.from_pydata([(-3, -3, 0), (3, -3, 0), (3, 3, 0), (-3, 3, 0)], [], [(0, 1, 2, 3)])
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
sc.render.resolution_x = sc.render.resolution_y = 480


def shot(tag, pos, aim, lens=50):
    cam.location = pos; d = Vector(aim) - Vector(pos); cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler(); cam.data.lens = lens
    sc.render.filepath = os.path.join(OUT, f"{NAME}_{tag}.png"); bpy.ops.render.render(write_still=True)


bpy.context.view_layer.update()
hand = P.bone_world("wrist.L"); foot = P.bone_world("foot.L")
shot("front", (0, -4.2, 1.0), (0, 0, 0.9), 40)
shot("34", (2.6, -3.2, 1.2), (0, 0, 0.9), 40)
shot("side", (4.2, 0, 1.0), (0, 0, 0.9), 40)
shot("back", (0, 4.2, 1.0), (0, 0, 0.9), 40)
shot("head", (0, -1.0, 1.66), (0, 0, 1.62), 50)
shot("head34", (0.7, -0.75, 1.68), (0, 0, 1.62), 50)
shot("hands", (hand.x + 0.15, hand.y - 0.75, hand.z), tuple(hand), 50)
shot("feet", (0.6, -1.1, 0.3), (0, 0, 0.06), 45)
shot("hipsF", (0, -1.6, 0.85), (0, 0, 0.85), 50)
shot("hipsB", (0, 1.6, 0.85), (0, 0, 0.85), 50)
shot("neckS", (0.75, -0.25, 1.5), (0, 0, 1.5), 50)
