"""Blender: every render for review/sheet_v5.png"""
import bpy
TAG = globals().get("TAG", "v6")
D0 = r"F:/Claude Proyectos/pieces/upnext-girl/"
for f in ("poses.py", "render.py"): exec(open(D0 + f).read())
exec(open(D0 + "v5/bl_refcams.py").read())
POSE_FACES["his_rest"] = ("open", "neutral")
arm = bpy.data.objects["Armature"]
for o in bpy.data.objects:
    if o.name.startswith(("Seg_", "HisHull")) or (o.users_collection and o.users_collection[0].name == "GirlV5"): o.hide_render = True
setup()
show("his_rest")
render_views(["front", "3q_l", "side_l", "back"], "review/" + TAG + "_turn_{view}.png", action="his_rest")
for n in ("tut_idle", "tut_hip", "tut_run"):
    show(n); render_views(["front", "3q_l"], f"review/{TAG}_{n}_{{view}}.png", action=n)
KEY8 = [("neutral", "open", "neutral"), ("happy", "happy", "smileOpen"), ("talk", "open", "talkA"),
        ("surprised", "surprised", "surprised"), ("angry", "angry", "shout"), ("sad", "sad", "frown"),
        ("blink", "blink", "neutral"), ("wink", "wink", "smile")]
show("his_rest")
for nm, e, m in KEY8:
    set_face(e, m); render_views(["front"], f"review/{TAG}_expr_{nm}.png", action="his_rest", center=(0, 0, 2.6), scale=3.8, res=(300, 300))
set_face("open", "neutral")
setup()
for view, act, fr in (("front", "his_rest", 1), ("q3", "tut_hip", 1), ("side", "tut_hip", 1), ("back", "tut_hip", 1), ("idle", "tut_idle", 1),
                      ("runA", "tut_run", 1), ("runB", "tut_run", 9)):
    show(act); arm.animation_data.action = bpy.data.actions[act]; bpy.context.scene.frame_set(fr)
    render_ref(view, D0 + f"v5/rr_{view}.png", pct=100)
    if view == "front": set_face("open", "neutral")
print("renders ok")
