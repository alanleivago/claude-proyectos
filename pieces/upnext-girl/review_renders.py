"""Rebuild + all review renders. exec in Blender: TAG = "v4"; exec(open(r".../review_renders.py").read())"""
import bpy
D0 = r"F:/Claude Proyectos/pieces/upnext-girl/"
for f in ("build.py", "poses.py", "render.py"):
    exec(open(D0 + f).read())
make_all()
TAG = globals().get("TAG", "vX")
show("turn_pose")
render_views(["front", "side_l", "back", "3q_l", "side", "3q"], f"review/{TAG}_{{view}}.png", action="turn_pose")
render_views(["front", "3q_l", "side_l"], f"review/{TAG}_head_{{view}}.png", action="turn_pose", center=(0, 0, 2.5), scale=4.2, res=(400, 400))
for n in ("tut_idle", "tut_hip", "tut_run"):
    show(n)
    render_views(["front", "3q_l"], f"review/{TAG}_{n}_{{view}}.png", action=n)
set_face("open", "neutral")
KEY8 = [("neutral", "open", "neutral"), ("happy", "happy", "smileOpen"), ("talk", "open", "talkA"),
        ("surprised", "surprised", "surprised"), ("angry", "angry", "shout"), ("sad", "sad", "frown"),
        ("blink", "blink", "neutral"), ("wink", "wink", "smile")]
show("turn_pose")
for nm, e, m in KEY8:
    set_face(e, m)
    render_views(["front"], f"review/{TAG}_expr_{nm}.png", action="turn_pose", center=(0, 0, 2.45), scale=3.6, res=(300, 300))
set_face("open", "neutral")
