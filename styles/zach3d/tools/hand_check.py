"""Self-check: the hand alone, 3 poses x (back, palm).  blender -b -P styles/zach3d/tools/hand_check.py -- out.png"""
import math, os, sys
import bpy
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "kit"))
import zk
out = sys.argv[sys.argv.index("--") + 1]
S = zk.reset(); S.cycles.samples = 48
S.render.resolution_x, S.render.resolution_y = 1800, 600
zk.world()
poses = {"open": dict(curl=(0.05, 0.05, 0.05, 0.08, 0.12), spread=0.13, thumb_open=1.0, arm=0.04),
         "grip": dict(curl=(0.45, 0.5, 0.55, 0.6, 0.65), spread=0.04, thumb_open=0.45, arm=0.04),
         "fist": dict(curl=(0.9, 1.0, 1.0, 1.0, 1.0), spread=0.0, thumb_open=0.0, arm=0.04)}
for i, p in enumerate(poses):
    for j in range(2):
        h = zk.Hand(f"h{i}{j}", poses)
        for sk in h.keys.values(): sk.value = 0
        h.keys[p].value = 1; h._set_nails(i)
        h.root.location = ((i * 2 + j) * 0.13 - 0.325, 0, -0.06)
        # fingers up (+Z); j=0 back of the hand to camera (-Y), j=1 palm to camera
        h.root.rotation_euler = (math.radians(90), 0, math.radians(180 * j))
        h.snap_nails()
zk.area("key", (-0.5, -0.8, 0.6), (0, 0, 0), 1.0, 120)
zk.area("fill", (0.6, -0.6, 0.0), (0, 0, 0), 1.0, 40, "#DFF2FA")
c = zk.camera("cam", fov_v=16); c.location = (0, -1.25, 0.02); zk.aim(c, (0, 0, 0))
S.camera = c
S.render.filepath = out
bpy.ops.render.render(write_still=True)
