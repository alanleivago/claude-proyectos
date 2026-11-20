"""ownerf UV stage (Blender): join the parts of work/geo.blend into one mesh, keep the loft UVs as "local" (metres),
pack an atlas UV ("UVMap") with per-part texel density, add the head UV ("head") and export the triangles
for the texture baker (work/mesh.npz).    Blender -b work/geo.blend -P tools/uv.py"""
import json
import os
import sys

import bmesh
import bpy
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import D, NAME  # noqa: E402

W = os.path.join(D, "work")
G = json.load(open(os.path.join(W, "geo.json")))
SRC = G["src_names"]
FJ = json.load(open(os.path.join(D, "faces", "face_lm.json")))
PARTS = ["head", "ears", "hair", "body", "jacket", "forearm", "hands", "boots"]
DENS = dict(head=0.12, ears=0.8, hair=1.35, body=1.0, jacket=1.0, forearm=0.8, hands=1.5, boots=0.85)

objs = [bpy.data.objects[p] for p in PARTS]
for i, o in enumerate(objs):
    me = o.data
    me.uv_layers["UVMap"].name = "local"
    src = me.uv_layers["local"]
    dst = me.uv_layers.new(name="UVMap")
    for l in me.loops:
        dst.data[l.index].uv = src.data[l.index].uv
    at = me.attributes.new("part", "INT", "FACE")
    for p in me.polygons:
        at.data[p.index].value = i
bpy.ops.object.select_all(action="DESELECT")
for o in objs:
    o.select_set(True)
bpy.context.view_layer.objects.active = objs[3]
bpy.ops.object.join()
ob = bpy.context.active_object; ob.name = ob.data.name = NAME + "_body"
me = ob.data
me.uv_layers.active = me.uv_layers["UVMap"]

# per-part density: average island scale, then scale each part's islands, then pack
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.select_all(action="SELECT")
bpy.ops.uv.average_islands_scale()
bpy.ops.object.mode_set(mode="OBJECT")
uv = me.uv_layers["UVMap"].data
part = [p.attributes if False else None for p in []]
pa = me.attributes["part"].data
sa = me.attributes["src"].data
SRC_DENS = {"torso": 1.9}            # round 3: the chest / cleavage patch gets ~2x texel density (crisper cleavage line)
for p in me.polygons:
    k = DENS[PARTS[pa[p.index].value]] * SRC_DENS.get(SRC[sa[p.index].value], 1.0)
    for l in p.loop_indices:
        uv[l].uv = uv[l].uv * k
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.select_all(action="SELECT")
bpy.ops.uv.pack_islands(margin=0.006, rotate=True, scale=True)
bpy.ops.object.mode_set(mode="OBJECT")

# head UV ("head"): a cylindrical unwrap around the head's vertical axis, seam at the back of the skull (under the
# hair), the face given ~60 % of the width and of the height; ears -> a small skin patch. The face photo is BAKED into a
# per-expression head texture through this UV (face_bake.py): it wraps the cheeks and the sides with no seam (round 2).
me = ob.data
hl = me.uv_layers.new(name="headuv")
loc_ = me.uv_layers["local"].data; pa_ = me.attributes["part"].data
HEADP = PARTS.index("head")
hverts = np.array([me.vertices[v].co[:] for p in me.polygons if pa_[p.index].value == HEADP for v in p.vertices])
HCY = float(np.median(hverts[hverts[:, 2] > 1.50, 1])); HZ0, HZ1 = float(hverts[:, 2].min()), float(hverts[:, 2].max())
AU = [0, 70, 110, 180, 250, 290, 370]; UU = [0.0, 0.10, 0.20, 0.50, 0.80, 0.90, 1.0]      # a' (0 = back): face 110..250
ZV = [HZ0, 1.445, 1.645, HZ1 + 0.001]; VV = [0.02, 0.18, 0.86, 0.98]


def _is_ear(p):
    return all(abs(loc_[l].uv[0] - 0.9) < 1e-6 and min(abs(loc_[l].uv[1] - q) for q in (0.9, 0.93, 0.96)) < 1e-6
               for l in p.loop_indices)


for p in me.polygons:
    if pa_[p.index].value != HEADP:
        for l in p.loop_indices:
            hl.data[l].uv = (0.0, 0.0)
        continue
    if _is_ear(p):
        tv = loc_[p.loop_indices[0]].uv[1]
        for l in p.loop_indices:
            hl.data[l].uv = (0.012, 0.040 if abs(tv - 0.93) < 1e-6 else (0.068 if abs(tv - 0.96) < 1e-6 else 0.012))
        continue
    co = [me.vertices[me.loops[l].vertex_index].co for l in p.loop_indices]
    ap = [(np.degrees(np.arctan2(c.x, -(c.y - HCY))) + 180.0) % 360.0 for c in co]       # 0 at the back, 180 = front
    if max(ap) - min(ap) > 180:
        ap = [a_ + 360.0 if a_ < 180 else a_ for a_ in ap]
    for l, c, a_ in zip(p.loop_indices, co, ap):
        hl.data[l].uv = (float(np.interp(a_ + (0 if a_ <= 360 else 0), AU, UU)) * 0.97 + 0.02, float(np.interp(c.z, ZV, VV)))
me.uv_layers.active = me.uv_layers["UVMap"]
me.uv_layers["UVMap"].active_render = True

# export triangles
me = ob.data
pa = me.attributes["part"].data
src_at = me.attributes["src"].data
L_uv = me.uv_layers["UVMap"].data; L_loc = me.uv_layers["local"].data; L_pr = me.uv_layers["headuv"].data
T_uv, T_loc, T_pos, T_n, T_src, T_part, T_pr, T_fi = [], [], [], [], [], [], [], []
for p in me.polygons:
    li = list(p.loop_indices)
    for k in range(1, len(li) - 1):
        tri = (li[0], li[k], li[k + 1])
        T_uv.append([L_uv[l].uv[:] for l in tri]); T_loc.append([L_loc[l].uv[:] for l in tri]); T_pr.append([L_pr[l].uv[:] for l in tri])
        T_pos.append([me.vertices[me.loops[l].vertex_index].co[:] for l in tri])
        T_n.append(p.normal[:]); T_src.append(src_at[p.index].value); T_part.append(pa[p.index].value); T_fi.append(p.index)
rig = bpy.data.objects[NAME + "_rig"]
JN = {b.name: (list(b.head_local), list(b.tail_local)) for b in rig.data.bones}
np.savez_compressed(os.path.join(W, "mesh.npz"), uv=np.array(T_uv), loc=np.array(T_loc), pos=np.array(T_pos), n=np.array(T_n),
                    src=np.array(T_src), part=np.array(T_part), huv=np.array(T_pr), fi=np.array(T_fi))
json.dump(dict(src=SRC, parts=PARTS, joints=JN), open(os.path.join(W, "mesh_meta.json"), "w"))
print("uv done", len(me.polygons), "faces", len(T_uv), "tris")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(W, "uv.blend"))
