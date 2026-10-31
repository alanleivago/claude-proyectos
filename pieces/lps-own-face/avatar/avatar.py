"""Blender: channel avatar — Kaneda head-on, deadpan, transparent bg (post_avatar.py adds the fire).
blender -b -P avatar.py -- <expr> <out.png>"""
import math, os, sys
import bpy
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import lpskit as K

expr, out = sys.argv[sys.argv.index("--") + 1:][:2]
sc = K.reset()
sc.render.resolution_x = sc.render.resolution_y = 512
sc.render.film_transparent = True
cam = K.camera("Cam", 50)
k = K.Kaneda("hero", (0, 0, 0)); k.face(expr)
c = k.head_world() + Vector((0, 0, -0.094))
K.look(cam, c + Vector((0, -0.6, 0.0)), c)
K.ps1_snap(cam, grid_h=240)
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
