"""blender -b <suitor.blend> --python bl_pair.py -- <waitress.blend> <dx_units> <spec.json>
appends the waitress (mesh + rig, read-only) dx engine units to the side, then renders the shots of the spec (bl_review format)"""
import sys, os, json, bpy
sys.path.insert(0, os.path.dirname(__file__))
import render_lib as R
from mathutils import Vector
wb, dx, spec = sys.argv[sys.argv.index("--") + 1:][:3]
with bpy.data.libraries.load(wb, link=False) as (src, dst):
    dst.objects = [n for n in src.objects]
for o in dst.objects:
    if o is None: continue
    bpy.context.scene.collection.objects.link(o)
    if o.parent is None: o.location.x += float(dx)
    if o.type == "ARMATURE":
        o.hide_render = True
        if o.animation_data:
            o.animation_data.action = None
            for t in o.animation_data.nla_tracks: t.mute = True
S = json.load(open(spec))
sc = R.setup(S.get("size", 512))
for o in sc.objects:
    if o.type == "ARMATURE":
        o.hide_render = True
        if o.animation_data:
            o.animation_data.action = None
            for t in o.animation_data.nla_tracks: t.mute = True
        for p in o.pose.bones: p.matrix_basis.identity()
sc.frame_set(1)
for sh in S["shots"]:
    R.shoot(sh["out"], Vector(sh["ctr"]), sh["ext"], sh["view"], sh.get("elev", 0.0), sh.get("aspect", 1.0))
print("REVIEW done", len(S["shots"]))
