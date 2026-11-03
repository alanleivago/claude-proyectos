"""Blender: turntable test of photoprop.loft() -> renders/raw/####.png (1080x1920, black bg, 200 frames = 1 spin).
blender -b -P test.py -- [--frames a,b]"""
import math, os, sys
H = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [H, os.path.join(H, "..", "lps-onoda")]
import bpy
import lpskit as K
import photoprop as P

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
a, b = (map(int, args[args.index("--frames") + 1].split(","))) if "--frames" in args else (0, 199)
sc = K.reset("#000000")
bot = P.loft(os.path.join(H, "ref/bottle.jpg"), "bottle", height=0.32, sides=8, loc=(-0.11, 0, 0))
can = P.loft(os.path.join(H, "ref/can.jpg"), "can", height=0.16, sides=10, loc=(0.11, 0, 0))
cam = K.camera(lens=50); K.look(cam, (0, -1.15, 0.22), (0, 0, 0.14))
K.ps1_snap(cam, grid_h=240)


def apply(s, *_):
    t = s.frame_current / 200
    for o, ph in ((bot, 0), (can, math.pi)):
        o.rotation_euler = (0, 0, 2 * math.pi * t + ph)
    K.ps1_snap_update(cam)


bpy.app.handlers.frame_change_pre.append(apply)
os.makedirs(os.path.join(H, "renders/raw"), exist_ok=True)
for f in range(a, b + 1):
    sc.frame_set(f)
    sc.render.filepath = os.path.join(H, f"renders/raw/{f:04d}.png")
    bpy.ops.render.render(write_still=True)
