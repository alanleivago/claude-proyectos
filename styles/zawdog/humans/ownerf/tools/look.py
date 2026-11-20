"""review renders of ownerf.blend through the kit loader (human.py): EEVEE, kit flat materials, grey studio.
    Blender -b -P look.py -- out_prefix [views=front,34,side,back] [pose=rest|tpose|tref] [res=720] [lens=50] [dist=4.2]
        [cz=0.9] [tz=0.9] [face=neutral] [w=720] [h=900] [action=<baked> frame=<f>] [bg=0.25] [cx=0]
Views name the camera yaw around the figure (front = from -Y)."""
import math
import os
import sys

import bpy
from mathutils import Euler, Quaternion, Vector

R = "/Users/alanleiva/claude-proyectos"
sys.path.insert(0, R + "/styles/zawdog/humans")
import human as HU  # noqa: E402

A = sys.argv[sys.argv.index("--") + 1:]
OUT = A[0]
O = dict(views="front,34,side,back", pose="rest", res="720", lens="50", dist="4.2", cz="0.9", tz="0.9", face="neutral", w="720",
         h="900", bg="0.25", cx="0", human="ownerf", frame="1")
O.update(dict(a.split("=", 1) for a in A[1:]))
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"
sc.render.resolution_x = int(O["w"]); sc.render.resolution_y = int(O["h"])
sc.view_settings.view_transform = "Standard"
sc.render.film_transparent = False
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
bgc = float(O["bg"]); w.node_tree.nodes["Background"].inputs[0].default_value = (bgc, bgc, bgc, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 1.0
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
sun.data.energy = 2.2; sun.rotation_euler = Euler((math.radians(50), 0, math.radians(-35)))
P = HU.Human(O["human"])
P.face(O["face"]) if O["face"] in P.faces else None
rig = P.rig
P.rest()


def rot_bone(bn, axis_world, deg):
    pb = rig.pose.bones[bn]
    M = (rig.matrix_world.to_3x3() @ pb.bone.matrix_local.to_3x3())
    ax = M.inverted() @ Vector(axis_world)
    pb.rotation_quaternion = Quaternion(ax, math.radians(deg)) @ pb.rotation_quaternion


def align_child(child, parent):
    """rotate `child` so its world direction continues `parent`'s (straight elbow)."""
    bpy.context.view_layer.update()
    pc = rig.pose.bones[child]; pp = rig.pose.bones[parent]
    dc = (rig.matrix_world.to_3x3() @ (pc.tail - pc.head)).normalized()
    dp = (rig.matrix_world.to_3x3() @ (pp.tail - pp.head)).normalized()
    q = dc.rotation_difference(dp)
    M = rig.matrix_world.to_3x3() @ pc.matrix.to_3x3()
    ax, ang = q.to_axis_angle()
    pc.rotation_quaternion = pc.rotation_quaternion @ Quaternion(M.inverted() @ ax, ang)


if O["pose"] in ("tpose", "tref"):
    # reference turntable pose: arms ~28 deg below horizontal, elbows and wrists straight, feet closer together
    arm = float(O.get("arm", "-20"))
    for s, sg in (("L", 1), ("R", -1)):
        rot_bone(f"upperarm01.{s}", (0, 1, 0), sg * arm)
        rot_bone(f"upperarm01.{s}", (0, 0, 1), -sg * 6)
        align_child(f"lowerarm01.{s}", f"upperarm02.{s}")
        align_child(f"wrist.{s}", f"lowerarm02.{s}")
        rot_bone(f"upperleg01.{s}", (0, 1, 0), sg * float(O.get("leg", "4")))
def curl(s, fingers, deg, thumb=None):
    for f_ in fingers:
        for k in (1, 2, 3):
            rot_local(f"finger{f_}-{k}.{s}", deg * (0.8 if k == 1 else 1.0))
    if thumb is not None:
        rot_local(f"finger1-1.{s}", thumb * 0.5, (0, 0, 1))
        for k in (2, 3):
            rot_local(f"finger1-{k}.{s}", thumb)


def rot_local(bn, deg, axis=(1, 0, 0)):
    pb = rig.pose.bones[bn]
    pb.rotation_quaternion = pb.rotation_quaternion @ Quaternion(Vector(axis), math.radians(deg))


HAND = O.get("hand", "")
CURL = float(O.get("curl", "70"))
for s in "LR":
    if HAND == "point":
        curl(s, (3, 4, 5), CURL, thumb=CURL * 0.6)
    elif HAND == "fist":
        curl(s, (2, 3, 4, 5), CURL, thumb=CURL * 0.6)
    elif HAND == "open":
        curl(s, (2, 3, 4, 5), -12)
FRAMES = [int(f) for f in O["frame"].split(",")]
if "action" in O:
    act = HU.load_action(O["action"]); P.play(act)
bpy.context.view_layer.update()
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = float(O["lens"]); cam.data.sensor_width = 36
if O.get("ortho"):                                  # ortho=<scale in m>: pure orthographic views (side/front/back checks)
    cam.data.type = "ORTHO"; cam.data.ortho_scale = float(O["ortho"])
VIEWS = {"front": 0, "34": 35, "side": 90, "back": 180, "34b": 145, "side2": -90, "34l": -35}
for fr in FRAMES:
    sc.frame_set(fr); bpy.context.view_layer.update()
    root = rig.matrix_world @ rig.pose.bones["root"].head if O.get("follow") else Vector((0, 0, 0))
    for v in O["views"].split(","):
        yaw = math.radians(float(VIEWS.get(v, v)))
        d = float(O["dist"]); cx = float(O["cx"]) + root.x; cy = root.y
        cam.location = Vector((math.sin(yaw) * d + cx, -math.cos(yaw) * d + cy, float(O["cz"])))
        tgt = Vector((cx, cy, float(O["tz"])))
        if O.get("bone"):
            bpy.context.view_layer.update()
            b_ = rig.pose.bones[O["bone"]]; tgt = rig.matrix_world @ ((b_.head + b_.tail) / 2)
            cam.location = tgt + Vector((math.sin(yaw) * d, -math.cos(yaw) * d, float(O.get("up", "0.0"))))
        cam.rotation_euler = (tgt - cam.location).to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = f"{OUT}_{v}.png" if len(FRAMES) == 1 else f"{OUT}_f{fr:03d}_{v}.png"
        bpy.ops.render.render(write_still=True)
print("look done")
