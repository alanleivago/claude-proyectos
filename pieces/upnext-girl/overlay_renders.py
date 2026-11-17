"""Renders for tools/overlay.py: his three reference views at a fan of yaws (exec in Blender after poses.make_all)."""
import math
D0 = r"F:/Claude Proyectos/pieces/upnext-girl/"
for f in ("poses.py", "render.py"):
    exec(open(D0 + f).read())
FANS = {("tut_idle", "front"): (range(-30, 31, 10), (1,)), ("tut_hip", "3q"): (range(-70, -9, 10), (1,)),
        ("tut_hip", "side"): (range(-120, -59, 10), (1,)), ("tut_hip", "back"): (range(140, 221, 10), (1,)),
        ("tut_run", "run"): (range(-45, 31, 15), (1, 5, 9, 13))}
for (act, view), (yaws, frames) in FANS.items():
    show(act)
    for fr in frames:
        for yw in yaws:
            t = math.radians(yw); d = (math.sin(t), -math.cos(t), 0.12)
            render_views([d], f"review/ov/{act}_{view}_{yw:+04d}_f{fr:02d}.png", action=act, frame=fr, res=(420, 640))
