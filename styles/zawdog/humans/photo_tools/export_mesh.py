"""Blender -b -P styles/zawdog/humans/photo_tools/export_mesh.py -- <name>
-> humans/<name>/photo/mesh.npz: the built body's rest-pose triangles (positions, normals, material name per triangle,
vertex region) so the garment guides can be drawn and registered outside Blender."""
import os, sys
import bpy
import numpy as np
H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAME = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.open_mainfile(filepath=os.path.join(H, NAME, NAME + ".blend"))
b = bpy.data.objects[NAME + "_body"]; me = b.data; rig = bpy.data.objects[NAME + "_rig"]
names = [g.name for g in b.vertex_groups]
def region(bn):
    if bn.startswith(("head", "jaw", "eye", "oris", "special", "levator", "risorius", "orbicularis", "oculi", "temporalis", "tongue")): return "head"
    if bn.startswith("neck"): return "neck"
    for s in "LR":
        if bn.endswith("." + s):
            if bn.startswith(("upperarm", "lowerarm", "wrist", "finger", "metacarpal")): return "arm" + s
            if bn.startswith(("upperleg", "lowerleg")): return "leg" + s
            if bn.startswith(("foot", "toe")): return "foot" + s
    return "torso"
reg = []
for v in me.vertices:
    gs = sorted(((g.weight, names[g.group]) for g in v.groups), reverse=True)
    reg.append(region(gs[0][1]) if gs else "torso")
CO = np.array([v.co[:] for v in me.vertices], np.float32)
uvl = me.uv_layers["UVMap"]
tris, mats, tuv = [], [], []
for p in me.polygons:
    vs = list(p.vertices)
    for k in range(1, len(vs) - 1):
        tris.append((vs[0], vs[k], vs[k + 1])); mats.append(me.materials[p.material_index].name)
        li = list(p.loop_indices); tuv.append([tuple(uvl.data[li[i]].uv) for i in (0, k, k + 1)])
B = {bb.name: bb for bb in rig.data.bones}
bones = {n: np.array(B[n].head_local[:] + B[n].tail_local[:]) for n in B.keys()}
os.makedirs(os.path.join(H, NAME, "photo"), exist_ok=True)
np.savez(os.path.join(H, NAME, "photo", "mesh.npz"), co=CO, tris=np.array(tris), mats=np.array(mats), tuv=np.array(tuv, np.float32), reg=np.array(reg),
         bone_names=np.array(list(bones)), bone_ht=np.array(list(bones.values())))
print(NAME, "exported", len(CO), "verts", len(tris), "tris", sorted(set(mats)))
