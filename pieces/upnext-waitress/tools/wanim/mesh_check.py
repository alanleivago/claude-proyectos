"""Mesh-based self-check of every retargeted clip (independent of the push-out proxies):
signed distance of the forearm / hand vertices to the skinned body surface (torso + waist band + hips + legs + head),
thigh vs thigh, floor. python -I tools/wanim/mesh_check.py -> ref/mesh_checks.txt"""
import sys, os, json, numpy as np
from scipy.spatial import cKDTree
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import retarget as T

J = T.W_["J"]
F = np.array([f["v"] for f in J["faces"]]); FP = np.array([f["part"] for f in J["faces"]])
ARM = {s: np.nonzero(np.isin(T.VPART, ["forearm" if s == "R" else "forearm_m"]))[0] for s in "LR"}
BODYF = F[np.isin(FP, ["torso", "band", "pelvis", "head", "face", "neck", "leg"])]
XS = np.array([T.VrW[f[0], 0] for f in F])
LEGF = {s: F[(FP == "leg") & ((XS > 0) == (s == "L"))] for s in "LR"}
LEGV = {s: np.unique(LEGF[s][T.VrW[LEGF[s]].mean(1)[:, 2] < 0.78]) for s in "LR"}   # below the crotch (thighs touch at the top by design)


def closest(p, a, b, c):
    ab, ac, ap = b - a, c - a, p - a
    d1, d2 = (ab * ap).sum(1), (ac * ap).sum(1); bp = p - b; d3, d4 = (ab * bp).sum(1), (ac * bp).sum(1)
    cp = p - c; d5, d6 = (ab * cp).sum(1), (ac * cp).sum(1)
    va = d3 * d6 - d5 * d4; vb = d5 * d2 - d1 * d6; vc = d1 * d4 - d3 * d2
    den = np.where(np.abs(va + vb + vc) < 1e-15, 1e-15, va + vb + vc); v = vb / den; w = vc / den
    res = a + ab * v[:, None] + ac * w[:, None]
    m = (d1 <= 0) & (d2 <= 0); res[m] = a[m]
    m = (d3 >= 0) & (d4 <= d3); res[m] = b[m]
    m = (d6 >= 0) & (d5 <= d6); res[m] = c[m]
    m = (vc <= 0) & (d1 >= 0) & (d3 <= 0); t = d1 / np.where(d1 - d3 == 0, 1e-15, d1 - d3); res[m] = (a + ab * t[:, None])[m]
    m = (vb <= 0) & (d2 >= 0) & (d6 <= 0); t = d2 / np.where(d2 - d6 == 0, 1e-15, d2 - d6); res[m] = (a + ac * t[:, None])[m]
    m = (va <= 0) & ((d4 - d3) >= 0) & ((d5 - d6) >= 0); t = (d4 - d3) / np.where((d4 - d3) + (d5 - d6) == 0, 1e-15, (d4 - d3) + (d5 - d6))
    res[m] = (b + (c - b) * t[:, None])[m]
    return res


def depth(V, pts, faces, k=8, maxd=0.10):
    """max inward depth (same signed-distance test as the retarget: edge / vertex ties vote)"""
    return float(T.sdepth(V, pts, faces, k, maxd)[0].max())


def pose(q, l, f):
    Q = np.zeros((T.NB, 3, 3))
    for i in range(T.NB):
        L = T.RbW[i] @ T.qmat(q[f, i]) @ T.RbW[i].T; p = T.PAR[i]; Q[i] = L if p < 0 else Q[p] @ L
    return Q, T.fk(Q, T.HrW[0] + T.RbW[0] @ l[f])


def main():
    A = np.load(os.path.join(ROOT, "ref", "anim_w.npz"), allow_pickle=True); clips = json.loads(str(A["clips"]))
    V0 = T.VrW
    base = max(depth(V0, ARM[s], BODYF) for s in "LR")
    lines = [f"rest baseline arm-in-body depth {base * 1000:.1f} mm"]
    worst_all = 0
    for c in clips:
        q, l = A["q_" + c], A["l_" + c]; da, dl = [], []
        for f in range(len(q)):
            Q, H = pose(q, l, f); V = T.skin(T.VrW, T.WW, T.HrW, Q, H)
            da.append(max(depth(V, ARM[s], BODYF) for s in "LR"))
            dl.append(max(depth(V, LEGV["L"], LEGF["R"], maxd=0.06), depth(V, LEGV["R"], LEGF["L"], maxd=0.06)))
        rob = lambda d: max((min(d[max(i - 1, 0):i + 2]), i) for i in range(len(d)))     # a lone 1-frame spike = sign flip, not a clip
        w, wl = rob(da), rob(dl); raw = max(da)
        worst_all = max(worst_all, w[0])
        ln = f"{c:18s} arm-into-body {w[0] * 1000:5.1f} mm (f{w[1]}, raw max {raw * 1000:5.1f})   leg-into-leg {wl[0] * 1000:5.1f} mm (f{wl[1]})"
        print(ln, flush=True); lines.append(ln)
    open(os.path.join(ROOT, "ref", "mesh_checks.txt"), "w").write("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()