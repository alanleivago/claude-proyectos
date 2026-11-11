"""Cast pack montage shot: one cast member doing one mocap clip with a face swap. Fresh Blender per shot:
    Blender -b -P pieces/cast-pack/montage.py -- <slug> <action> <face> <out_dir> [frames=40] [swap=8] [tag=NN_slug]
-> <out_dir>/<NN_slug>/#####.png (720x1280). The busiest <frames> window of the action (root + wrists + head motion) is
used; the face is neutral until frame <swap>, then hard-swapped to <face> (P.face). Plain kit-coloured room, slow
3/4 orbit + push-in (the zawdog camera rule: always moving). Then montage_post.py."""
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "styles", "zawdog", "humans"))
import human as HU  # noqa: E402

A = sys.argv[sys.argv.index("--") + 1:]
SLUG, ACT, FACE, OUT = A[:4]
OPT = dict(frames="40", swap="8", tag=SLUG); OPT.update(dict(a.split("=") for a in A[4:]))
NF, SWAP = int(OPT["frames"]), int(OPT["swap"])
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
P = HU.Human(SLUG); act = HU.load_action(ACT); P.play(act); P.face("neutral")
f0, f1 = int(act.frame_range[0]), int(act.frame_range[1])
sc = bpy.context.scene; sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x, sc.render.resolution_y = 720, 1280
sc.world = sc.world or bpy.data.worlds.new("w"); sc.world.use_nodes = True
sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.62, 0.72, 1)
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
sun.rotation_euler = (math.radians(52), 0, math.radians(-35)); sun.data.energy = 3.0


def box(name, size, loc, col):
    m = bpy.data.meshes.new(name); o = bpy.data.objects.new(name, m); sc.collection.objects.link(o)
    sx, sy, sz = (v / 2 for v in size)
    vs = [(x, y, z) for z in (-sz, sz) for y in (-sy, sy) for x in (-sx, sx)]
    m.from_pydata(vs, [], [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)])
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    mat.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (*col, 1); m.materials.append(mat)
    o.location = loc
    return o


pts = []
for f in range(f0, f1 + 1):
    sc.frame_set(f); pts.append(np.array([tuple(P.bone_world(b)) for b in ("root", "wrist.L", "wrist.R", "head")]))
pts = np.array(pts); en = np.r_[0, np.linalg.norm(np.diff(pts, axis=0), axis=2).sum(1)]
n = len(en); w = min(NF, n)
best = max(range(0, n - w + 1), key=lambda i: en[i:i + w].sum())
win = list(range(f0 + best, f0 + best + w))
while len(win) < NF:
    win.append(win[-1])                                                    # short clip: hold the last pose
c = pts[best:best + w, 0].mean(0)
box("floor", (14, 14, 0.02), (c[0], c[1], -0.01), (0.22, 0.14, 0.08))      # warm wood-ish floor (linear colours)
box("wall", (14, 0.1, 4), (c[0], c[1] + 3.2, 2), (0.42, 0.36, 0.26))
box("skirting", (14, 0.12, 0.12), (c[0], c[1] + 3.12, 0.06), (0.92, 0.92, 0.9))

cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 35
out = os.path.join(OUT, OPT["tag"]); os.makedirs(out, exist_ok=True)
hz = P.bone_world("eye.L").z
tgt = Vector((c[0], c[1], hz * 0.55))
sc.frame_set(win[len(win) // 2]); bpy.context.view_layer.update()
lat = P.bone_world("upperleg01.L") - P.bone_world("upperleg01.R"); lat.z = 0; lat.normalize()
fwd = lat.cross(Vector((0, 0, 1)))
rp = np.array([pts[min(f - f0, n - 1), 0] for f in win]); k_ = 9                # the camera tracks the (smoothed) root:
rs = np.array([rp[max(0, i - k_):i + k_ + 1].mean(0) for i in range(len(rp))])     # walkers stay framed
for i, f in enumerate(win):
    sc.frame_set(f)
    tgt = Vector((rs[i][0], rs[i][1], hz * 0.55))
    P.face(FACE if i >= SWAP else "neutral")
    a = math.radians(-30 + 22 * i / max(1, NF - 1))
    d = (1.5 + 1.25 * hz / 1.65) - 0.3 * i / max(1, NF - 1)
    cam.location = tgt + fwd * (d * math.cos(a)) + lat * (d * math.sin(a)) + Vector((0, 0, 0.25))
    cam.rotation_euler = (tgt - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = os.path.join(out, f"{i:05d}.png"); bpy.ops.render.render(write_still=True)
