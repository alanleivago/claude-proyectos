"""Blender: jungle set test. blender -b -P test/jungle_test.py [-- day|night|all]
-> test/jungle_wide.png, jungle_medium.png, jungle_low.png, jungle_night_wide.png (1080x1920)."""
import math, os, sys, time
import bpy
from mathutils import Vector
H = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, H)
import lpskit as K
import jungle as J

OUT = os.path.join(H, "test")
which = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "all"

SHOTS = {                      # name: (cam pos, target, lens)
    "wide": ((1.8, -6.2, 2.6), (0, 0.6, 1.0), 24),
    "medium": ((0.15, -3.4, 0.95), (0, 0, 1.15), 30),
    "low": ((0.2, 0.9, 0.25), (1.2, 4.6, 6.5), 18),
}


def build(night):
    sc = K.reset("#9AA0A8"); K.Kaneda._faces.clear()      # the face cache holds images freed by reset
    sc.eevee.taa_render_samples = 16
    cam = K.camera("Cam", 35)
    t = time.time()
    s = J.jungle((0, 0, 0), size=(14, 14), seed=0, night=night)
    # foreground framing leaves for the medium shot (the shot owns them, not the set)
    import numpy as np
    rng = np.random.default_rng(7)
    for nm, x, y, kind, sc_ in (("fg_l", -0.6, -2.45, "banana", 1.0), ("fg_r", 0.7, -2.4, "monstera", 1.4)):
        J.leaf_clump((x, y, s["ground_z"](x, y)), rng, kind, name=nm, scale=sc_)
    J.fern((0.3, -2.55, s["ground_z"](0.3, -2.55)), rng, name="fg_f", scale=1.0)
    k = K.Kaneda("k", (0, 0, 0))
    print(f"jungle: {s['polys']} polys, {len(s['plants'])} plants, built in {time.time() - t:.1f}s")
    K.ps1_snap(cam, grid_h=180)
    return sc, cam


def shot(sc, cam, name, fn):
    pos, tgt, lens = SHOTS[name]
    cam.data.lens = lens; K.look(cam, pos, tgt); K.ps1_snap_update(cam)
    sc.render.filepath = os.path.join(OUT, fn)
    t = time.time(); bpy.ops.render.render(write_still=True); print(f"{fn}: {time.time() - t:.1f}s")


if which in ("day", "all"):
    sc, cam = build(False)
    for n in SHOTS:
        shot(sc, cam, n, f"jungle_{n}.png")
if which in ("night", "all"):
    sc, cam = build(True)
    shot(sc, cam, "wide", "jungle_night_wide.png")
