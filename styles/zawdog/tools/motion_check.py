"""QA for a baked motion on a kit v3 human: strip of frames + real foot numbers from the evaluated (skinned) mesh.
    Blender -b -P styles/zawdog/tools/motion_check.py -- <action> <out_dir> [human=owner] [every=6] [view=side|front|34]
-> <out_dir>/<action>_strip.jpg (frames side by side, via tools/strip.py) and <action>_feet.txt: per foot the lowest shoe
   vertex z per frame (floating > +0.02 m or sinking < -0.015 m are flagged) and the slide of the planted sole."""
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Vector

ZD = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.join(ZD, "humans"))
A = sys.argv[sys.argv.index("--") + 1:]
NAME, OUT = A[0], A[1]
OPT = dict(human="owner", every="6", view="side"); OPT.update(dict(a.split("=") for a in A[2:]))
os.makedirs(OUT, exist_ok=True)
import human as HU  # noqa: E402

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
P = HU.Human(OPT["human"])
act = HU.load_action(NAME); P.play(act)
f0, f1 = int(act.frame_range[0]), int(act.frame_range[1])
sc = bpy.context.scene; sc.render.engine = "BLENDER_EEVEE"
sc.world = sc.world or bpy.data.worlds.new("w"); sc.world.use_nodes = True
sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.35, 0.36, 0.4, 1)
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
sun.rotation_euler = (math.radians(50), 0, math.radians(-30)); sun.data.energy = 3.5
fl = bpy.data.objects.new("floor", bpy.data.meshes.new("floor")); sc.collection.objects.link(fl)
fl.data.from_pydata([(-9, -9, 0), (9, -9, 0), (9, 9, 0), (-9, 9, 0)], [], [(0, 1, 2, 3)])
# grid lines on the floor to read sliding
for k in range(-8, 9):
    for ax in (0, 1):
        o = bpy.data.objects.new(f"g{k}{ax}", bpy.data.meshes.new("g")); sc.collection.objects.link(o)
        w = 0.01
        vs = [(-9, k * 0.5 - w, 0.001), (9, k * 0.5 - w, 0.001), (9, k * 0.5 + w, 0.001), (-9, k * 0.5 + w, 0.001)] if ax else \
             [(k * 0.5 - w, -9, 0.001), (k * 0.5 + w, -9, 0.001), (k * 0.5 + w, 9, 0.001), (k * 0.5 - w, 9, 0.001)]
        o.data.from_pydata(vs, [], [(0, 1, 2, 3)])
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
sc.render.resolution_x, sc.render.resolution_y = 320, 480

# feet numbers from the skinned mesh
me_ = P.body.data
foot_v = {s: [] for s in "LR"}
gi = {g.name: g.index for g in P.body.vertex_groups}
for v in me_.vertices:
    gs = sorted(v.groups, key=lambda g: -g.weight)
    if gs:
        n = P.body.vertex_groups[gs[0].group].name
        for s in "LR":
            if n.startswith(("foot", "toe")) and n.endswith("." + s):
                foot_v[s].append(v.index)
low = {s: [] for s in "LR"}; allco = {s: [] for s in "LR"}; hips = []
for f in range(f0, f1 + 1):
    sc.frame_set(f); dg = bpy.context.evaluated_depsgraph_get(); ev = P.body.evaluated_get(dg); mw = ev.matrix_world
    for s in "LR":
        c = np.array([tuple(mw @ ev.data.vertices[i].co) for i in foot_v[s]])
        allco[s].append(c); low[s].append(float(c[:, 2].min()))
    hips.append(tuple(P.bone_world("root")))
rows = []
for s in "LR":
    z = np.array(low[s]); C = allco[s]
    # real slide: the vertex that is lowest when a foot lands, followed while it stays on the floor (< 1.2 cm, < 2 cm/frame: a swinging toe is not 'planted')
    slide = 0.0; i = 0
    while i < len(z):
        if z[i] < 0.015:
            vi = int(np.argmin(C[i][:, 2])); p0 = C[i][vi, :2]; j = i
            while j + 1 < len(z) and C[j + 1][vi, 2] < 0.012 and np.linalg.norm(C[j + 1][vi, :2] - C[j][vi, :2]) < 0.02:
                j += 1
                slide = max(slide, float(np.linalg.norm(C[j][vi, :2] - p0)))
            i = j + 1
        else:
            i += 1
    rows.append(f"{s}: lowest shoe vertex {z.min():+.3f}..{z.max():+.3f} m; frames with both feet off the floor (>+0.02) "
                f"{int(sum(1 for k in range(len(z)) if min(low['L'][k], low['R'][k]) > 0.02))}; sinking(<-0.015) {int((z < -0.015).sum())}; "
                f"max slide of a planted sole vertex {slide:.3f} m")
open(os.path.join(OUT, f"{NAME}_feet.txt"), "w").write("\n".join(rows) + "\n"); print("\n".join(rows))

H_ = np.array(hips); c = (H_.min(0) + H_.max(0)) / 2; span = max(np.ptp(H_[:, 0]), np.ptp(H_[:, 1]), 1.0)
dirs = {"side": Vector((1, 0, 0)), "front": Vector((0, -1, 0)), "34": Vector((0.7, -0.7, 0))}
d = dirs[OPT["view"]]
cam.data.lens = 35
tgt = Vector((c[0], c[1], 0.9)); cam.location = tgt + d * (2.6 + span * 0.9) + Vector((0, 0, 0.3))
cam.rotation_euler = (tgt - cam.location).to_track_quat("-Z", "Y").to_euler()
paths = []
for f in range(f0, f1 + 1, int(OPT["every"])):
    sc.frame_set(f); p = os.path.join(OUT, f"_{NAME}_{f:04d}.png"); sc.render.filepath = p; bpy.ops.render.render(write_still=True); paths.append(p)
import subprocess
subprocess.run([os.path.join(ZD, "..", "..", ".venv", "bin", "python"), os.path.join(ZD, "tools", "strip.py"), OUT, NAME])
