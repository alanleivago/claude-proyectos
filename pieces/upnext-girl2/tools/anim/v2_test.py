"""debug clips (only when V2TEST=1)"""
from v2_clips import *
c = clip("zz_wrist", 70, note="hand orientation test")
c.follow = {}; c.drag = {"L": 0, "R": 0}; c.wrdrag = {"L": 0, "R": 0}; c.skirt = 0
vals = [((0.3, -1, 0.1), (0, 0, 1)), ((0.3, -1, 0.1), (0, 0, -1)), ((0.1, -0.2, 1), (0, -1, 0)), ((0.2, -0.3, -1), (-1, 0.2, 0)),
        ((0.6, -0.8, 0.2), (-0.3, 0.2, 1)), ((-0.3, -1, 0.3), (0.2, 0.2, 1)), ((0.0, -0.4, 1), (-1, 0, 0))]
for i, h in enumerate(vals):
    c.k(i * 10, **M(B0, aL=W("L", 0.22, -0.28, 1.05, pole=(0.8, 0.5, -0.6), hand=h), aR=W("R", 0.22, -0.28, 1.05, pole=(-0.8, 0.5, -0.6), hand=h)))
