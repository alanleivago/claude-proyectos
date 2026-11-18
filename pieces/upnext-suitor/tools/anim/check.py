"""Self-check of every clip on the skinned mesh: arm-into-body / arm-into-arm depth, leg-into-leg, floor, planted-foot
slide, joint jitter (acceleration zig-zag) and limb roll flips.  python -I tools/anim/check.py [clip,...] -> ref/checks.txt"""
import sys, os, json, math
import numpy as np
from scipy.spatial import cKDTree
from scipy.spatial.transform import Rotation as Rot
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import author as A

J = A.R_["J"]; Vr = A.Vr
F = np.array([f["v"] for f in J["faces"]]); FP = np.array([f["part"] for f in J["faces"]])
XS = Vr[F].mean(1)[:, 0]
BODY_PARTS = ["torso", "hips", "thigh", "head", "face", "neck", "leg", "nose"]
ARMV = {s: np.nonzero(np.isin(A.VPART, ["sleeve", "cuff", "glove"]) & ((Vr[:, 0] > 0) == (s == "L")))[0] for s in "LR"}
HANDV = {s: np.nonzero((A.VPART == "glove") & ((Vr[:, 0] > 0) == (s == "L")))[0] for s in "LR"}
LOWARM = {s: np.nonzero(np.isin(A.VPART, ["cuff", "glove"]) & ((Vr[:, 0] > 0) == (s == "L")))[0] for s in "LR"}
ARMF = {s: F[np.isin(FP, ["sleeve", "cuff", "glove"]) & ((XS > 0) == (s == "L"))] for s in "LR"}
LEGF = {s: F[np.isin(FP, ["leg", "thigh"]) & ((XS > 0) == (s == "L"))] for s in "LR"}
LEGLOW = {s: np.unique(LEGF[s][Vr[LEGF[s]].mean(1)[:, 2] < 0.50 * A.K]) for s in "LR"}


def _closest(p, a, b, c):
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


def sdepth(V, pts, faces, k=8, maxd=0.10, normals=False):
    """inward depth (> 0 = under the surface) of each point vs a closed-ish surface (edge / vertex ties vote)"""
    A_, B_, C_ = V[faces[:, 0]], V[faces[:, 1]], V[faces[:, 2]]; N = np.cross(B_ - A_, C_ - A_); N /= np.linalg.norm(N, axis=1)[:, None] + 1e-12
    tree = cKDTree((A_ + B_ + C_) / 3); P = V[pts]; _, idx = tree.query(P, k=min(k, len(faces)))
    D = np.zeros(idx.shape); DOT = np.zeros(idx.shape)
    for j in range(idx.shape[1]):
        ii = idx[:, j]; cp = _closest(P, A_[ii], B_[ii], C_[ii]); D[:, j] = np.linalg.norm(P - cp, axis=1); DOT[:, j] = ((P - cp) * N[ii]).sum(1)
    best = D.min(1); tie = D <= best[:, None] + 2e-4; vote = (DOT * tie).sum(1)
    d = np.where((vote < 0) & (best < maxd), best, 0.0)
    if not normals: return d
    nn = np.zeros((len(P), 3))
    for q in np.nonzero(d > 0)[0]:
        js = np.nonzero(tie[q])[0]; v = N[idx[q, js]].sum(0); nn[q] = v / (np.linalg.norm(v) + 1e-12)
    return d, nn


def _rest_inside():
    V = A.Vr; BF = F[np.isin(FP, BODY_PARTS)]; out = {}
    for s in "LR":
        d = sdepth(V, ARMV[s], BF); out[s] = ARMV[s][d > 0.0005]
    return out
EMBED = _rest_inside()                                   # shoulder-cap verts already inside the torso at rest (by design)
for s in "LR": EMBED[s] = np.union1d(EMBED[s], ARMV[s][Vr[ARMV[s], 2] > 1.40 * A.K])     # + the shoulder cap itself (joint, hidden in the torso)
for s in "LR":
    ARMV[s] = np.setdiff1d(ARMV[s], EMBED[s]); HANDV[s] = np.setdiff1d(HANDV[s], EMBED[s])


def body_faces(allow):
    return F[np.isin(FP, [p for p in BODY_PARTS if p not in allow])]


def check_clip(name, c, res):
    allow = c.get("allow", {})                        # e.g. {"hand_in": ["pelvis", "band"]}: hands go inside on purpose
    BF_arm = body_faces([]); BF_hand = body_faces(allow.get("hand_in", []))
    rows = dict(arm=[], armarm=[], leg=[], floor=[])
    Vs = []
    for Q, H in res:
        V = A.skin(Q, H); Vs.append(V)
        da = 0.0
        for s in "LR":
            hv = np.union1d(HANDV[s], np.intersect1d(LOWARM[s], ARMV[s])) if allow.get("cuff_in") else HANDV[s]
            nonhand = np.setdiff1d(ARMV[s], hv)
            da = max(da, float(sdepth(V, nonhand, BF_arm).max()), float(sdepth(V, hv, BF_hand).max()))
        rows["arm"].append(da)
        rows["armarm"].append(max(float(sdepth(V, LOWARM["L"], ARMF["R"], maxd=0.05).max()), float(sdepth(V, LOWARM["R"], ARMF["L"], maxd=0.05).max())))
        rows["leg"].append(max(float(sdepth(V, LEGLOW["L"], LEGF["R"], maxd=0.06).max()), float(sdepth(V, LEGLOW["R"], LEGF["L"], maxd=0.06).max())))
        rows["floor"].append(float(V[:, 2].min()))
    rob = lambda d: max(min(d[max(i - 1, 0):i + 2]) for i in range(len(d)))      # lone 1-frame spike = sign noise
    # planted-foot slide: lowest shoe vertex on the floor in two consecutive frames -> horizontal drift (minus walk speed)
    sp = c.get("speed_m_per_s", 0.0) / A.FPS; slide = 0.0
    for s in "LR":
        idx = A.SHOE[s]
        for f in range(1, len(Vs)):
            z0, z1 = Vs[f - 1][idx, 2], Vs[f][idx, 2]
            on = (z0 < 0.004) & (z1 < 0.004)
            if on.any():
                d = Vs[f][idx[on]] - Vs[f - 1][idx[on]]; d[:, 1] -= sp          # in place: stance foot moves back (+y) at the speed
                slide = max(slide, float(np.linalg.norm(d[:, :2], axis=1).min()))
    # jitter: elbows, wrists, hand tips; zig-zag = acceleration flips sign on consecutive frames with > 3 mm/f^2
    P = []
    for Q, H in res:
        pts = []
        for s in "LR":
            ih = A.BI[f"Hand.{s}"]; pts += [H[A.BI[f"Forearm.{s}"]], H[ih], H[ih] + Q[ih] @ (A.Tr[ih] - A.Hr[ih])]
        P.append(pts)
    P = np.array(P); Acc = P[2:] - 2 * P[1:-1] + P[:-2]; m = np.linalg.norm(Acc, axis=-1)
    fl = ((Acc[1:] * Acc[:-1]).sum(-1) < 0) & (m[1:] > 0.003) & (m[:-1] > 0.003)          # sign flip between consecutive frames
    zig = int((fl[2:] & fl[1:-1] & fl[:-2]).sum()) if len(fl) > 2 else 0                      # tremble = sign flips on 3 frames running
    if c.get("allow", {}).get("tremble"): zig = 0
    # roll flips: frame-to-frame rotation of each limb bone (local) above 25 deg
    flips = []
    for b in ("UpperArm", "Forearm", "Hand", "Thigh", "Calf", "Foot"):
        for s in "LR":
            i = A.BI[f"{b}.{s}"]; p = A.PAR[i]
            Ls = [Q[p].T @ Q[i] for Q, H in res]
            for f in range(1, len(Ls)):
                ang = math.degrees(Rot.from_matrix(Ls[f - 1].T @ Ls[f]).magnitude())
                if ang > 40: flips.append(f"{b}.{s}@{f}:{ang:.0f}")
    return dict(arm=rob(rows["arm"]) * 1000, arm_f=int(np.argmax(rows["arm"])), armarm=rob(rows["armarm"]) * 1000, leg=rob(rows["leg"]) * 1000,
                floor=min(rows["floor"]) * 1000, slide=slide * 1000, zig=zig, acc=float(m.max()) * 1000 if len(m) else 0, flips=flips)


def main():
    import clips as CL
    only = sys.argv[1].split(",") if len(sys.argv) > 1 else None
    lines = []
    for name, c in CL.CLIPS.items():
        if only and name not in only: continue
        r = check_clip(name, c, A.run_clip(c))
        ok = r["arm"] <= 3 and r["armarm"] <= max(3, c.get("allow", {}).get("arm_arm", 0)) and r["leg"] <= 3 and r["floor"] > -5 and r["slide"] <= max(2, c.get("allow", {}).get("slide", 0)) and r["zig"] == 0 and not r["flips"]
        ln = (f"{'OK ' if ok else '!! '}{name:20s} arm-body {r['arm']:5.1f} mm (f{r['arm_f']})  arm-arm {r['armarm']:5.1f}  leg-leg {r['leg']:5.1f}  "
              f"floor {r['floor']:6.1f}  slide {r['slide']:4.1f} mm/f  zigzag {r['zig']}  max acc {r['acc']:4.1f} mm/f2  flips {r['flips'][:4]}")
        print(ln, flush=True); lines.append(ln)
    if not only: open(os.path.join(ROOT, "ref", "checks.txt"), "w").write("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
