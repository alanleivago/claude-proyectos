"""ownerf motion test inside the approved zaw-dog kit (hallway, set x1.35, Zaw framing: lens 25 mm, knee-up 1.0-1.4 m,
camera at chest height, every shot moves). Runs through the kit's exec mode, one Blender:
    Blender -b -P pieces/zaw-dog-05/build.py -- exec styles/zawdog/humans/ownerf/tools/motion_kit.py <out_dir> [step]
Clips (baked for ownerf by styles/zawdog/tools/retarget.py): of_walk (100STYLE Neutral_FW), of_idle (100STYLE Neutral_ID),
of_startle (Kimodo startle_jump_back). Hanging arms get the kit abduction (ABDUCT 13 deg: her hips are wider)."""
import math
import os
import sys

import bpy
from mathutils import Quaternion, Vector

sys.path.insert(0, os.path.join(ROOT, "styles", "zawdog", "humans"))  # noqa: F821
import human as HU  # noqa: E402

OUTD = ARGS[2]; os.makedirs(OUTD, exist_ok=True)                        # noqa: F821
STEP = int(ARGS[3]) if len(ARGS) > 3 else 1                             # noqa: F821
reset()                                                                 # noqa: F821
scale_set(1.35)                                                         # noqa: F821
SKYO = [o for o in bpy.data.objects if o.type == "MESH" and any(m_ and m_.node_tree and any(n_.type == "TEX_IMAGE" and n_.image and n_.image.name.startswith("sky_v1px")
        for n_ in m_.node_tree.nodes) for m_ in o.data.materials)]
for o in [bpy.data.objects[n_] for n_ in ("facade_e0", "facade_e_eave")] + RACK:   # noqa: F821  (hallway: kit rule)
    hide(o, True)                                                       # noqa: F821
for o in SKYO:
    hide(o, o.name in ("r_sky", "st_sky0", "st_sky1", "p_sky2", "p_sky3"))   # noqa: F821
DOOR_PIV.rotation_euler = (0, 0, -1.75)                                 # noqa: F821
HXW, DOORY = sw((HX, 0.0))[0], sw((0.0, 2.5))[1]                        # noqa: F821

P = HU.Human("ownerf")
P.body.modifiers.new("ps1", "NODES").node_group = bpy.data.node_groups["PS1Snap"]
ACT = {k: HU.load_action(k) for k in ("of_walk", "of_idle", "of_startle")}


def abduct(deg=13.0):
    bpy.context.view_layer.update()
    fwd = (P.rig.matrix_world.to_3x3() @ Vector((0, -1, 0))).normalized(); c = P.bone_world("spine03")
    for sd in "LR":
        pb = P.rig.pose.bones[f"upperarm01.{sd}"]
        h = P.bone_world(f"upperarm01.{sd}"); tl = P.bone_world(f"upperarm01.{sd}", tail=True); d = (tl - h).normalized()
        k = min(1.0, max(0.0, -d.z - 0.3) / 0.6)
        if k <= 0:
            continue
        side = h - c; side.z = 0; side.normalize()
        best = None
        for sg in (1, -1):
            q = Quaternion(fwd, sg * math.radians(deg) * k)
            if best is None or (q @ d).dot(side) > (best @ d).dot(side):
                best = q
        mq = (P.rig.matrix_world @ pb.matrix).to_quaternion()
        pb.rotation_quaternion = pb.rotation_quaternion @ (mq.inverted() @ best @ mq)
        bpy.context.view_layer.update()


def pose(act, f, loc, yaw, face):
    a = ACT[act]; P.show(True); P.place(loc, yaw); P.play(a)
    f = int(min(max(f, a.frame_range[0]), a.frame_range[1]))
    sc.frame_set(f)                                                     # noqa: F821
    vals = [(pb, pb.rotation_quaternion.copy(), pb.location.copy()) for pb in P.rig.pose.bones]
    P.rig.animation_data.action = None
    for pb, q, l_ in vals:
        pb.rotation_quaternion = q; pb.location = l_
    abduct()
    P.face(face)
    bpy.context.view_layer.update()
    r = P.bone_world("root")
    cshadow(3, r.x, r.y, 0.0, 0.62, 0.5, yaw)                          # noqa: F821
    return r


def zcam(aim, az, dist, h, lens=25):
    a = math.radians(az)
    cam((aim[0] + dist * math.sin(a), aim[1] - dist * math.cos(a), h), aim, lens)   # noqa: F821


START = (HXW + 0.05, DOORY - 0.75)
frames = []
# walk: towards the camera down the hallway, the camera backs up in front of her (knee-up, slight push)
for f in range(1, 92, STEP):
    u = (f - 1) / 90
    r = pose("of_walk", f, START, 0.0, "neutral")
    zcam((r.x, r.y, 1.04), 8 - 10 * u, 1.25 - 0.15 * u, 1.3)
    frames.append(("walk", f))
    render(os.path.join(OUTD, f"{len(frames):04d}.png"), (540, 960))  # noqa: F821
END = (P.bone_world("root").x, P.bone_world("root").y)
# idle: knee-up 3/4, slow orbit + push, a smile swap half-way
for f in range(1, 91, STEP):
    u = (f - 1) / 89
    r = pose("of_idle", f, (END[0], END[1]), 0.0, "neutral" if u < 0.45 else "smile")
    zcam((r.x, r.y, 1.02), -32 + 14 * u, 1.25 - 0.18 * u, 1.3)
    frames.append(("idle", f))
    render(os.path.join(OUTD, f"{len(frames):04d}.png"), (540, 960))  # noqa: F821
# startle: medium shot, she jumps back; surprised -> scared swaps on the beat
for f in range(1, 106, STEP):
    u = (f - 1) / 104
    face = "neutral" if f < 22 else ("surprised" if f < 34 else "scared")
    r = pose("of_startle", f, (END[0], END[1] - 0.2), 0.0, face)
    zcam((r.x, r.y, 0.98), 18, 1.75 - 0.15 * u, 1.28)
    frames.append(("startle", f))
    render(os.path.join(OUTD, f"{len(frames):04d}.png"), (540, 960))  # noqa: F821
open(os.path.join(OUTD, "segments.txt"), "w").write("\n".join(f"{i + 1} {s} {f}" for i, (s, f) in enumerate(frames)))
print("motion_kit done", len(frames))
