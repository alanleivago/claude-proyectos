"""Cast pack montage shot in the approved zaw-dog kit living room, with the dog (runs INSIDE pieces/zaw-dog-05/build.py
exec mode: sets, dog v2, PS1 snap, flat light), one fresh Blender per shot:
  Blender -b -P pieces/zaw-dog-05/build.py -- exec pieces/cast-pack/montage_kit.py <slug> <action> <face> <out_dir> <tag> [frames=40] [swap=8]
-> <out_dir>/<tag>/#####.png (720x1280). The busiest <frames> window of the action is used; neutral face, hard swap to
<face> at frame <swap>; the dog watches him / her and wags; the camera is the kit-v3 shot-C framing, tracking the root
(smoothed) with a slow push-in, so walkers stay in frame."""
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Vector

sys.path.insert(0, os.path.join(ROOT, "styles", "zawdog", "humans"))  # noqa: F821
import human as HU  # noqa: E402

XA = ARGS[2:]                                                           # noqa: F821
SLUG, ACTN, FACE, OUT, TAG = XA[:5]
OPT = dict(frames="40", swap="8"); OPT.update(dict(a.split("=") for a in XA[5:]))
NF, SWAP = int(OPT["frames"]), int(OPT["swap"])
LOC = Vector((0.55, -0.55, 0.0)); YAW = -math.pi / 2
DOGP = (1.15, -1.25)

_pic = bpy.data.objects["pic1"]; _pic.data.materials.clear(); _pic.data.materials.append(mtex("pic_dog"))   # noqa: F821  (dog pictures only)
P = HU.Human(SLUG)
P.body.modifiers.new("ps1", "NODES").node_group = bpy.data.node_groups["PS1Snap"]
act = HU.load_action(ACTN); P.play(act); P.rig.animation_data.action_extrapolation = "HOLD"
P.place(tuple(LOC), YAW); P.face("neutral")
f0, f1 = int(act.frame_range[0]), int(act.frame_range[1])
pts = []
for f in range(f0, f1 + 1):
    sc.frame_set(f); pts.append(np.array([tuple(P.bone_world(b)) for b in ("root", "wrist.L", "wrist.R", "head")]))   # noqa: F821
pts = np.array(pts); en = np.r_[0, np.linalg.norm(np.diff(pts, axis=0), axis=2).sum(1)]
n = len(en); w = min(NF, n)
best = max(range(0, n - w + 1), key=lambda i: en[i:i + w].sum())
win = list(range(f0 + best, f0 + best + w))
while len(win) < NF:
    win.append(win[-1])
rp = np.array([pts[min(f - f0, n - 1), 0] for f in win]); k_ = 9
rs = np.array([rp[max(0, i - k_):i + k_ + 1].mean(0) for i in range(len(rp))])
out = os.path.join(OUT, TAG); os.makedirs(out, exist_ok=True)
hz = P.bone_world("eye.L").z
SHADOW = CSH[3]                                                         # noqa: F821
for i, f in enumerate(win):
    reset()                                                             # noqa: F821
    P.show(True); P.play(act); sc.frame_set(f)                          # noqa: F821
    P.face(FACE if i >= SWAP else "neutral")
    bpy.context.view_layer.update()
    r = Vector(rs[i]); t = i / 30.0
    SHADOW.hide_render = SHADOW.hide_viewport = False
    SHADOW.location = (r.x, r.y, 0.004); SHADOW.scale = (0.62, 0.5, 1); SHADOW.rotation_euler = (0, 0, YAW)
    dd = dog(0, (DOGP[0], DOGP[1], 0), yaw_to(DOGP, (r.x, r.y)), "happy", t)   # noqa: F821
    D.happy_wag(dd["arm"], t, 1.0, 4.6, up=0.25)                        # noqa: F821
    ground_dog(0)                                                       # noqa: F821
    u = i / max(1, NF - 1)
    aim = Vector((r.x, r.y, hz * 0.52)) + Vector((-0.25, -0.1, 0))
    pos = aim + Vector((-1.15, -1.45, 0.62)) * (1.0 - 0.12 * u) * (hz / 1.66 * 0.6 + 0.4)
    cam(tuple(pos), tuple(aim), 22)                                     # noqa: F821
    bpy.context.view_layer.update(); K.ps1_snap_update(CAM)             # noqa: F821
    render(os.path.join(out, f"{i:05d}.png"), (720, 1280))              # noqa: F821
