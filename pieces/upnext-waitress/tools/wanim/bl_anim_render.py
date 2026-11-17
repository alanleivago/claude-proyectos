"""blender -b <waitress.blend> --python bl_anim_render.py -- <spec.json>
spec: {"size": 400, "meta": face _meta, "shots": [{"out", "clip", "frame", "view", "ctr", "ext", "elev", "eyes", "mouth"}]}
Flat unlit Workbench renders of clip frames; the face cells are applied by offsetting the face UVs (what an engine does
with map.offset)."""
import sys, os, json, bpy
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
import render_lib as R
from mathutils import Vector

S = json.load(open(sys.argv[sys.argv.index("--") + 1]))
sc = R.setup(S.get("size", 400))
arm = next(o for o in sc.objects if o.type == "ARMATURE"); arm.hide_render = True
ob = next(o for o in sc.objects if o.type == "MESH")
ad = arm.animation_data
for t in ad.nla_tracks: t.mute = True
me = ob.data; uvl = me.uv_layers.active
mi = {m.name: i for i, m in enumerate(me.materials)}
meta = S["meta"]; cols, rows = meta["cols"], meta["rows"]
face_loops = {k: [li for p in me.polygons if p.material_index == mi.get(k, -9) for li in p.loop_indices] for k in ("face_eyes", "face_mouth")}
base = {li: tuple(uvl.data[li].uv) for k in face_loops for li in face_loops[k]}


def set_face(eyes, mouth):
    for key, name in (("face_eyes", eyes), ("face_mouth", mouth)):
        names = meta[key]; k = names.index(name) if name in names else 0
        du, dv = (k % cols) / cols, -(k // cols) / rows
        for li in face_loops[key]:
            u, v = base[li]; uvl.data[li].uv = (u + du, v + dv)
    me.update()


cur = None
for sh in S["shots"]:
    c = sh.get("clip")
    if c != cur:
        a = bpy.data.actions.get(c) if c else None
        ad.action = a
        if a is not None and len(a.slots): ad.action_slot = a.slots[0]
        if a is None:
            for p in arm.pose.bones: p.matrix_basis.identity()
        cur = c
    sc.frame_set(int(sh.get("frame", 1)))
    for n in ("UpperArm.L", "UpperArm.R"):                       # profile shots: collapse the arms so the waist line shows
        pbn = arm.pose.bones.get(n)
        if pbn: pbn.scale = (0.001,) * 3 if sh.get("noarms") else (1, 1, 1)
    bpy.context.view_layer.update()
    set_face(sh.get("eyes", "open"), sh.get("mouth", "neutral"))
    R.shoot(sh["out"], Vector(sh["ctr"]), sh["ext"], sh.get("view", "front"), sh.get("elev", 0.0), sh.get("aspect", 1.0))
print("ARENDER done", len(S["shots"]))
