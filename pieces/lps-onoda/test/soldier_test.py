"""Blender: Kaneda soldier test — front / 3-4 / profile / back, wear 0 and 2. blender -b -P test/soldier_test.py -- <out_dir>"""
import math, os, sys
import bpy
from mathutils import Vector
H = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, H)
import lpskit as K

out = sys.argv[sys.argv.index("--") + 1]
sc = K.reset("#6E8A5A")
sc.render.resolution_x = sc.render.resolution_y = 540
cam = K.camera("Cam", 40)
ks = []
for i, w in enumerate((0, 2)):
    k = K.Kaneda(f"sold{w}", (i * 1.2 - 0.6, 0, 0), faces_dir=os.path.join(H, "tex/soldier", f"w{w}"))
    k.face("stern")
    K.field_cap(k, f"cap{w}", flaps=(w == 0))
    r = K.rifle(f"rifle{w}")                                  # slung on the back, muzzle up over the right shoulder
    r.location = (k.arm.location.x - 0.02, 0.13, 1.18); r.rotation_euler = (math.radians(90), math.radians(-30), 0)
    K.attach(r, k, "Chest")
    ks.append(k)
K.ps1_snap(cam, grid_h=180)
for vi, (az, dist) in enumerate(((0, 2.0), (35, 2.0), (90, 2.0), (180, 2.0))):
    for i, k in enumerate(ks):
        c = k.head_world() + Vector((0, 0, -0.05))
        a = math.radians(az)
        K.look(cam, c + Vector((math.sin(a) * 0.75, -math.cos(a) * 0.75, 0.05)), c)
        K.ps1_snap_update(cam)
        sc.render.filepath = os.path.join(out, f"w{i}_{az:03d}.png")
        bpy.ops.render.render(write_still=True)
# full body
c = Vector((0, 0, 0.95)); K.look(cam, c + Vector((0.6, -4.2, 0.2)), c); K.ps1_snap_update(cam)
sc.render.filepath = os.path.join(out, "full.png"); bpy.ops.render.render(write_still=True)
K.look(cam, c + Vector((-2.6, 3.3, 0.3)), c); K.ps1_snap_update(cam)
sc.render.filepath = os.path.join(out, "full_back.png"); bpy.ops.render.render(write_still=True)
