"""python -I tools/anim/tune.py "<python dict of pose channels>" : joint positions, lowest points, leg / arm depths of one static pose"""
import sys, os, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import author as A, check as C
from clips import *      # noqa: shared pose dicts
p = eval(sys.argv[1]); c = dict(frames=2, keys=[(0, p), (1, p)], push=len(sys.argv) > 2)
Q, H = A.run_clip(c)[0]; V = A.skin(Q, H)
for n in ("Pelvis", "Thigh.L", "Calf.L", "Foot.L", "Thigh.R", "Calf.R", "Foot.R", "Hand.L", "Hand.R"):
    h = H[A.BI[n]]; print(f"{n:8s} x {h[0]:6.3f} fwd {-h[1]:6.3f} z {h[2]:6.3f}")
for part in ("hips", "thigh", "leg", "shoe", "glove"):
    m = A.VPART == part
    if m.any(): print(f"min z {part:6s} {V[m, 2].min():.3f}")
print("leg-leg", round(max(float(C.sdepth(V, C.LEGLOW['L'], C.LEGF['R'], maxd=0.06).max()), float(C.sdepth(V, C.LEGLOW['R'], C.LEGF['L'], maxd=0.06).max())) * 1000, 1), "mm")
