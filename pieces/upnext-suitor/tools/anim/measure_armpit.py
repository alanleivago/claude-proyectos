"""python -I tools/anim/measure_armpit.py : armpit seam gap + shoulder section thickness, before (no bridge) vs after,
at reach_up frame 17 (shot 14 of vera-01) and euphoria frame 31 (90 deg), right arm (screen left from the front) and left"""
import sys, os, json, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import author as A, clips as CL, rig as RG
ROOT = A.ROOT


def load(path):
    R = RG.load(path); F = np.array([f["v"] for f in R["J"]["faces"]]); P = np.array([f["part"] for f in R["J"]["faces"]])
    return R, F, P


def skin(R, Q, H):
    V = R["Vr"]; W = R["W"]; out = np.zeros_like(V)
    for i in range(len(R["Hr"])):
        w = W[:, i]; m = w > 0
        if m.any(): out[m] += w[m, None] * ((V[m] - R["Hr"][i]) @ Q[i].T + H[i])
    return out


def section(V, F, keep, o, n, up):
    """intersection segment points of the triangles (mask keep) with the plane (o, n); extent along `up`"""
    pts = []
    for f in F[keep]:
        P = V[f]; d = (P - o) @ n
        for i in range(3):
            j = (i + 1) % 3
            if d[i] * d[j] < 0: t = d[i] / (d[i] - d[j]); q = P[i] + (P[j] - P[i]) * t
            else: continue
            if np.linalg.norm(q - o) < 0.16: pts.append(q)
    if not pts: return 0.0
    pr = (np.array(pts) - o) @ up; return float(pr.max() - pr.min())


def measure(path, clip, frame):
    R, F, P = load(path); Q, H = A.run_clip(CL.CLIPS[clip])[frame]; V = skin(R, Q, H); out = {}
    for s in "LR":
        sh = H[A.BI[f"UpperArm.{s}"]]; el = H[A.BI[f"Forearm.{s}"]]; ax = A.nrm(el - sh)
        o = sh + ax * 0.05                                         # 5 cm down the upper arm from the shoulder joint
        pr = lambda v: v - (v @ ax) * ax
        med = np.array([-np.sign(sh[0]), 0, 0.0]); dn = np.array([0, 0, -1.0])
        up = A.nrm(pr(med) + pr(dn))                               # in-plane axis from the arm toward the armpit / torso
        keep = np.isin(P, ["sleeve", "armpit", "torso"]) & ((V[F].mean(1)[:, 0] > 0) == (s == "L"))
        th = section(V, F, keep, o, ax, up)
        # seam gap: torso side point at armpit height (chest-skinned) to the nearest sleeve surface point
        tor = [i for i, f in enumerate(F) if P[i] == "torso"]
        side_pts = V[np.unique(F[tor])]; side_pts = side_pts[(np.sign(side_pts[:, 0]) == (1 if s == "L" else -1))]
        sl = V[np.unique(F[P == "sleeve"])]; sl = sl[(np.sign(sl[:, 0]) == (1 if s == "L" else -1))]
        armpit_y = side_pts[np.argsort(-side_pts[:, 2])[:4]]       # the 4 highest torso-side verts (shoulder corner)
        gap = float(min(np.linalg.norm(sl - p, axis=1).min() for p in armpit_y))
        bridged = bool((P == "armpit").any())
        out[s] = dict(thickness_cm=round(th * 100, 1), corner_to_sleeve_cm=round(gap * 100, 1), bridged=bridged)
    return out


if __name__ == "__main__":
    res = {}
    for tag, path in (("before", os.path.join(ROOT, "ref", "build3_forest_noarmpit.json")), ("after", os.path.join(ROOT, "ref", "build3_forest.json"))):
        for clip, fr in (("reach_up", 16), ("euphoria", 30), ("cheer", 17)):
            r = measure(path, clip, fr); res[f"{tag} {clip}"] = r; print(tag, clip, r)
    json.dump(res, open(os.path.join(ROOT, "ref", "armpit_measure.json"), "w"), indent=1)
