"""Kit v6.1 (2026-11-16): fold the skin / mask / seam fixes INTO a kit human's .blend and reweight the shoulder.
    Blender -b styles/zawdog/humans/<name>/<name>.blend -P styles/zawdog/humans/photo_tools/kit_fix.py -- <name>
- body.png (skin_match.py output: skin = the face photo's tone, garment hems from fix_body) and faces/mask.png
  (wider, softer face edge) are reloaded and packed in place of the old images (same nodes, nothing else changes);
- shoulder reweight (user / API review: "a white flap of torso polygons folds over the posed arm"): torso vertices
  near each shoulder joint, weighted mostly to the spine/clavicle, get a share of shoulder01 + upperarm01 that falls off
  with distance (r < 0.18 m), then two Laplacian smoothing passes of the arm groups over the mesh around the joint,
  then every vertex is normalised. The arm and the chest still bend at the same joints; the shoulder cap now follows
  the raised / forward arm instead of staying behind as a flap.
The first run keeps <name>_v6.blend next to it (the exported #6 / #7 used that version)."""
import os
import shutil
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Vector

name = sys.argv[sys.argv.index("--") + 1]
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", name)
blend = os.path.join(D, f"{name}.blend")
if not os.path.exists(os.path.join(D, f"{name}_v6.blend")):
    shutil.copy(blend, os.path.join(D, f"{name}_v6.blend"))
body = bpy.data.objects[f"{name}_body"]; rig = bpy.data.objects[f"{name}_rig"]


def repack(basename, path):
    new = bpy.data.images.load(path); new.pack(); new.name = f"{name}_{basename}_v61"
    n = 0
    for m in bpy.data.materials:
        if not m.node_tree:
            continue
        for nd in m.node_tree.nodes:
            if nd.type == "TEX_IMAGE" and nd.image and nd.image != new and (os.path.basename(nd.image.filepath) == basename or nd.image.name.startswith(basename.split(".")[0])):
                interp = nd.interpolation; nd.image = new; nd.interpolation = interp; n += 1
    print("repacked", basename, "in", n, "nodes")


repack("body.png", os.path.join(D, "body.png"))
repack("mask.png", os.path.join(D, "faces", "mask.png"))

# ---------------------------------------------------------------- shoulder reweight (once per .blend)
if body.get("kit_v61_reweight"):
    bpy.ops.wm.save_mainfile(filepath=blend); print("reweight already done; textures repacked"); sys.exit(0)
me = body.data; vg = {g.name: g.index for g in body.vertex_groups}
N = len(me.vertices); G = len(body.vertex_groups)
W = np.zeros((N, G), np.float32)
for v in me.vertices:
    for g in v.groups:
        W[v.index, g.group] = g.weight
co = np.array([v.co[:] for v in me.vertices], np.float32)               # rest (A-pose) mesh, object space = rig space
mw = body.matrix_world
cow = np.array([(mw @ Vector(c))[:] for c in co], np.float32)
adj = [[] for _ in range(N)]
for e in me.edges:
    a, b = e.vertices; adj[a].append(b); adj[b].append(a)
tors = [vg[n] for n in vg if n.startswith(("spine", "clavicle", "breast", "neck"))]
changed = 0
for sd in "LR":
    sh = vg.get(f"shoulder01.{sd}"); ua = vg.get(f"upperarm01.{sd}")
    if sh is None or ua is None:
        continue
    j = rig.matrix_world @ rig.data.bones[f"upperarm01.{sd}"].head_local
    d = np.linalg.norm(cow - np.array(j[:], np.float32), axis=1)
    near = d < 0.18
    out = np.sign(cow[:, 0] - 0.0) == np.sign(j.x)                       # the vertex is on this side of the body
    mtor = W[:, tors].sum(1)
    sel = near & out & (mtor > 0.3)
    k = np.clip(1 - d / 0.18, 0, 1) ** 1.2 * 0.5                        # share moved to the arm, 0.55 at the joint
    for i in np.flatnonzero(sel):
        mv = k[i] * mtor[i]
        W[i, tors] *= (1 - k[i])
        W[i, sh] += 0.6 * mv; W[i, ua] += 0.4 * mv
        changed += 1
    ring = d < 0.22
    for _ in range(2):                                                   # Laplacian smoothing of the arm groups near the joint
        for gi in (sh, ua):
            col = W[:, gi].copy()
            for i in np.flatnonzero(ring):
                if adj[i]:
                    W[i, gi] = 0.5 * col[i] + 0.5 * col[adj[i]].mean()
W /= np.maximum(W.sum(1, keepdims=True), 1e-6)
for gi, g in enumerate(body.vertex_groups):
    for i in range(N):
        w = float(W[i, gi])
        if w > 1e-4:
            g.add([i], w, "REPLACE")
        elif any(x.group == gi for x in me.vertices[i].groups):
            g.remove([i])
body["kit_v61_reweight"] = 1
print("shoulder reweight:", changed, "torso vertices now share the arm")
bpy.ops.wm.save_mainfile(filepath=blend)
print("saved", blend)
