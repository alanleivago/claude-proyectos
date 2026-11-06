"""Thumbnail (exaggerated, from the piece's own 3D): Henry clinging to the window bars, shocked, the hall floor gone,
tiny nobles tumbling into the brown pit below, a giant 3D "60".  blender -b -P thumb.py -> renders/thumb_raw.png
(post: python thumb_post.py -> renders/thumbnail.png)"""
import math, os, sys, bpy
from mathutils import Vector
sys.argv = [sys.argv[0], "--"]
__file__ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build.py"); exec(open(__file__).read())
bpy.app.handlers.frame_change_pre.clear(); apply(SHOT_RANGES[10][0] + 30)                                   # s11 state: no floor, Henry on the bars
for r in PEOPLE_ALL:
    show(r, False)
HERO.face("scream")
hang(HERO, BAR_Z - 0.03, NY + 0.72, EX, math.pi); crown_follow()
E_SKY.hide_render = True
E_PIT.location.z = -3.2
import numpy as np
rng = np.random.default_rng(4)
for k in range(26):                                            # nobles falling into the pit
    f = tiny(f"thf{k}", k % 5, (EX + rng.uniform(-1.8, 1.8), NY - 0.4 - rng.uniform(0, 2.8), rng.uniform(-3.0, -0.4)), s=0.85, skin=SKINS[k % 4])
    f.rotation_euler = tuple(rng.uniform(-2.5, 2.5, 3))
    for o in [f] + list(f.children_recursive):
        if o.type == "MESH":
            o.modifiers.new("ps1", "NODES").node_group = bpy.data.node_groups["PS1Snap"]
cam.data.lens = 17
c = HERO.head_world()
K.look(cam, c + Vector((0.3, 1.05, 0.75)), c + Vector((-0.1, -1.4, -1.9)), math.radians(8)); K.ps1_snap_update(cam)
bpy.context.view_layer.update()
letters_on_screen(T60, 2.0, 0.0, x=0.0, y=-0.62, width=0.75, depth=0.9, tilt=math.radians(-14))
sc.render.resolution_percentage = 100
sc.render.filepath = os.path.join(HERE, "renders", "thumb_raw.png"); bpy.ops.render.render(write_still=True)
print("THUMB done")
