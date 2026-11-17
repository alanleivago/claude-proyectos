"""blender -b <file.blend> --python bl_review.py -- <spec.json>
spec: {"orig_offset_x": float|null, "size": 512, "shots": [{"out": path, "view": "front"|deg, "ctr": [x,y,z],
       "ext": metres, "elev": deg, "action": name|null, "frame": int}]}"""
import sys, os, json, bpy
sys.path.insert(0, os.path.dirname(__file__))
import render_lib as R
from mathutils import Vector

S = json.load(open(sys.argv[sys.argv.index("--") + 1]))
sc = R.setup(S.get("size", 512))
meshes = [o for o in sc.objects if o.type == "MESH"]
if S.get("orig_offset_x") is not None:
    for o in meshes: o.location.x += S["orig_offset_x"]
for o in sc.objects:
    if o.type == "ARMATURE":
        o.hide_render = True
arm = next((o for o in sc.objects if o.type == "ARMATURE"), None)
if arm and arm.animation_data:
    for t in arm.animation_data.nla_tracks: t.mute = True
for sh in S["shots"]:
    if arm:
        act = sh.get("action")
        arm.animation_data.action = bpy.data.actions[act] if act else None
        if act:
            a = bpy.data.actions[act]
            if hasattr(arm.animation_data, "action_slot") and len(a.slots):
                arm.animation_data.action_slot = a.slots[0]
        if not act:
            for p in arm.pose.bones:
                p.rotation_quaternion = (1, 0, 0, 0); p.location = (0, 0, 0)
        sc.frame_set(int(sh.get("frame", 1)))
    R.shoot(sh["out"], Vector(sh["ctr"]), sh["ext"], sh["view"], sh.get("elev", 0.0), sh.get("aspect", 1.0))
print("REVIEW done", len(S["shots"]))
