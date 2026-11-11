"""Blender (exec'd inside build.py): hand + feet close-ups of the owner at each board frame where he appears
(01a, 04, 10, 14a): both hands (front 3/4 + side) and both shoes, so floating hands, detached arms or feet off the
ground show.  -> review/people3/h5_<beat>_<part><k>.png
/Applications/Blender.app/Contents/MacOS/Blender -b -P build.py -- exec tools/hands5_check.py"""
import os
OUTD = os.path.join(H, "review", "people3"); os.makedirs(OUTD, exist_ok=True)
for n in ("01a", "04", "10", "14a"):
    b = BY[n]; fb = round(b[1] + b[4] * (b[2] - b[1])); t, d = (fb - b[1]) / FPS, (b[2] - b[1]) / FPS
    for part, pts in (("handR", lambda: OWNER.hand_pos("R")), ("handL", lambda: OWNER.hand_pos("L")),
                      ("feet", lambda: (bone_w(OWNER, "foot.L") + bone_w(OWNER, "foot.R")) / 2)):
        for k, off in enumerate(((0.45, -0.45, 0.15), (-0.5, 0.1, 0.1))):
            reset(); sc.frame_set(fb); b[3](t, d); bpy.context.view_layer.update()
            c = pts(); off_w = pvec(OWNER, off)
            cam(tuple(c + off_w), tuple(c), 32); render(os.path.join(OUTD, f"h5_{n}_{part}{k}.png"), (360, 360))
print("hands5 done")
