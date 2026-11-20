"""ownerf UV stage (Blender): join the parts of work/geo.blend into one mesh, keep the loft UVs as "local" (metres),
pack an atlas UV ("UVMap") with per-part texel density, add the face projection UV ("proj") and export the triangles
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
DENS = dict(head=0.55, ears=0.8, hair=1.35, body=1.0, jacket=1.0, forearm=0.8, hands=1.5, boots=0.85)

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
for p in me.polygons:
    k = DENS[PARTS[pa[p.index].value]]
    for l in p.loop_indices:
        uv[l].uv = uv[l].uv * k
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.select_all(action="SELECT")
bpy.ops.uv.pack_islands(margin=0.006, rotate=True, scale=True)
bpy.ops.object.mode_set(mode="OBJECT")

# face projection UV: front orthographic, scaled to the Flow portrait (face_lm.json, px of a 512 image)
me = ob.data
proj = me.uv_layers.new(name="proj")
S = FJ["m_per_px"]
for l in me.loops:
    co = me.vertices[l.vertex_index].co
    x_px = FJ["cx"] + co.x / S                                  # character's left (+X) = image right
    y_px = FJ["eye_y"] + (FJ["eye_z"] - co.z) / S
    proj.data[l.index].uv = (x_px / FJ["size"], 1 - y_px / FJ["size"])
me.uv_layers.active = me.uv_layers["UVMap"]
me.uv_layers["UVMap"].active_render = True

# export triangles
me = ob.data
pa = me.attributes["part"].data
src_at = me.attributes["src"].data
L_uv = me.uv_layers["UVMap"].data; L_loc = me.uv_layers["local"].data; L_pr = me.uv_layers["proj"].data
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
                    src=np.array(T_src), part=np.array(T_part), proj=np.array(T_pr), fi=np.array(T_fi))
json.dump(dict(src=SRC, parts=PARTS, joints=JN), open(os.path.join(W, "mesh_meta.json"), "w"))
print("uv done", len(me.polygons), "faces", len(T_uv), "tris")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(W, "uv.blend"))
