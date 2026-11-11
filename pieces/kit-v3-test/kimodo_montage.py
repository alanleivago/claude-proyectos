"""Montage of the official-Kimodo clips (PC, SOMA-SEED-v1.1) on the kit v3 owner: ~2 s each, plain grey room, slow
orbiting camera, neutral face. One fresh Blender process per clip:
    Blender -b -P pieces/kit-v3-test/kimodo_montage.py -- <action k_name> <out_dir> [frames=60]
-> <out_dir>/<name>/#####.png (720x1280). The 60-frame window with the most motion is used. Clips with "sit" get a
seat (and backrest) at the height the hips come to rest, so he never sits on air. Then kimodo_montage_post.py."""
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
ACT, OUT = A[0], A[1]
OPT = dict(frames="60"); OPT.update(dict(a.split("=") for a in A[2:]))
NF = int(OPT["frames"])
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
P = HU.Human("owner"); act = HU.load_action(ACT); P.play(act); P.face("neutral")
f0, f1 = int(act.frame_range[0]), int(act.frame_range[1])
sc = bpy.context.scene; sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x, sc.render.resolution_y = 720, 1280
sc.world = sc.world or bpy.data.worlds.new("w"); sc.world.use_nodes = True
sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.42, 0.43, 0.46, 1)
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
sun.rotation_euler = (math.radians(52), 0, math.radians(-35)); sun.data.energy = 3.2


def box(name, size, loc, col):
    m = bpy.data.meshes.new(name); o = bpy.data.objects.new(name, m); sc.collection.objects.link(o)
    sx, sy, sz = (v / 2 for v in size)
    vs = [(x, y, z) for z in (-sz, sz) for y in (-sy, sy) for x in (-sx, sx)]
    m.from_pydata(vs, [], [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)])
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    mat.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (*col, 1); m.materials.append(mat)
    o.location = loc
    return o


box("floor", (12, 12, 0.02), (0, 0, -0.01), (0.62, 0.62, 0.64))
box("wall", (12, 0.1, 4), (0, 3.0, 2), (0.55, 0.55, 0.58))

# motion energy per frame (root + wrists), pick the busiest window
pts = []
for f in range(f0, f1 + 1):
    sc.frame_set(f); pts.append(np.array([tuple(P.bone_world(b)) for b in ("root", "wrist.L", "wrist.R", "head")]))
pts = np.array(pts); en = np.r_[0, np.linalg.norm(np.diff(pts, axis=0), axis=2).sum(1)]
n = len(en); w = min(NF, n)
best = max(range(0, n - w + 1), key=lambda i: en[i:i + w].sum())
if "sit" in ACT:
    best = n - w                                                        # the sit-down and the seated end
win = range(f0 + best, f0 + best + w)
centre = pts[best:best + w, 0].mean(0)

if "sit" in ACT:                                                        # seat under the resting hips + a backrest
    sc.frame_set(f1); bpy.context.view_layer.update()
    hips = P.bone_world("root")
    lat = P.bone_world("upperleg01.L") - P.bone_world("upperleg01.R"); lat.z = 0; lat.normalize()
    fwd = lat.cross(Vector((0, 0, 1)))                                  # left x up = forward
    dg = bpy.context.evaluated_depsgraph_get(); ev = P.body.evaluated_get(dg); mw = ev.matrix_world
    near = [mw @ v.co for v in ev.data.vertices if (mw @ v.co - hips).length < 0.28]
    seat_z = min(p.z for p in near) if near else hips.z - 0.15
    c = hips - fwd * 0.05
    box("seat", (0.62, 0.62, seat_z), (c.x, c.y, seat_z / 2), (0.55, 0.35, 0.22))
    b = hips - fwd * 0.36
    box("back", (0.62, 0.12, seat_z + 0.38), (b.x, b.y, (seat_z + 0.38) / 2), (0.55, 0.35, 0.22))
    print(f"SEAT {ACT}: seat top {seat_z:.3f} m (kit sofa cushion top 0.38 m)")

cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 30
out = os.path.join(OUT, ACT[2:] if ACT.startswith("k_") else ACT); os.makedirs(out, exist_ok=True)
tgt = Vector((centre[0], centre[1], 0.95))
sc.frame_set(win[len(win) // 2] if "sit" not in ACT else f1); bpy.context.view_layer.update()
lat_ = P.bone_world("upperleg01.L") - P.bone_world("upperleg01.R"); lat_.z = 0; lat_.normalize()
fwd_ = lat_.cross(Vector((0, 0, 1)))                                    # the actor's facing (left x up)
base = math.atan2(fwd_.x, -fwd_.y)                                     # camera angle that looks at his front
for i, f in enumerate(win):
    sc.frame_set(f)
    a = math.radians(-35 + 25 * i / max(1, w - 1))                     # slow 25 deg orbit, 3/4 front
    d = 3.3 - 0.4 * i / max(1, w - 1)                                   # + a gentle push-in
    cam.location = tgt + Vector((-d * math.sin(a + base), d * math.cos(a + base), 0.35)) * 1.0
    cam.location = tgt + fwd_ * (d * math.cos(a)) + lat_ * (d * math.sin(a)) + Vector((0, 0, 0.35))
    cam.rotation_euler = (tgt - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = os.path.join(out, f"{i:05d}.png"); bpy.ops.render.render(write_still=True)
