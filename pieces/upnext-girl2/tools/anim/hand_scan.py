"""hand clipping scan: python tools/anim/hand_scan.py [clip,clip]  (hand verts into torso / head / skirt / thighs, cm)"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np, core as C, checks as K
import v2_clips as V2
from scipy.spatial import cKDTree
only = sys.argv[1].split(",") if len(sys.argv) > 1 else None
F = C.G["F"]
hands = {s: np.nonzero(C.W[:, C.BI["Hand." + s]] >= 0.5)[0] for s in "LR"}
TG = {g: F[K.GF[g]] for g in ("torso", "head", "skirt", "thighL", "thighR")}
def depth_of(V, idx, g):
    P = V[idx]; T = V[TG[g]]
    lo, hi = T.reshape(-1, 3).min(0) - 0.01, T.reshape(-1, 3).max(0) + 0.01; m = np.all((P > lo) & (P < hi), 1)
    if not m.any(): return 0.0
    P = P[m]; ins = K.parity(P, T, np.array([0.013, 0.021, 1.0])) & K.parity(P, T, np.array([1.0, 0.017, 0.023]))
    if not ins.any(): return 0.0
    Q = P[ins]; cen = T.mean(1); kk = min(8, len(cen)); _, nn = cKDTree(cen).query(Q, kk); best = np.full(len(Q), 9.0)
    for j in range(kk):
        q = K.closest_on_tri(Q, T[nn[:, j], 0], T[nn[:, j], 1], T[nn[:, j], 2]); best = np.minimum(best, np.linalg.norm(Q - q, axis=1))
    return best.max()
for c in V2.CL:
    if c.name.startswith("zz") or (only and c.name not in only): continue
    out = c.solve_all(); worst = {}
    for f in range(0, len(out), 3):
        V = C.skin(*out[f])
        for s in "LR":
            for g in TG:
                d = depth_of(V, hands[s], g)
                if d > worst.get((s, g), (0, 0))[0]: worst[(s, g)] = (d, f)
    bad = {f"{s}>{g}": (round(d * 100, 1), f) for (s, g), (d, f) in worst.items() if d > 0.012}
    print(c.name, bad if bad else "ok")
