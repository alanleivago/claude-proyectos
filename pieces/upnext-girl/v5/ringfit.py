"""Re-place each ring of a piece on his hull cross-section (rest space of the piece's bone).
python ringfit.py <state_tag> <hull_obj> <piece,piece,...>  -> updates pieces.json verts"""
import sys, json, numpy as np
from scipy.spatial import cKDTree, ConvexHull
st = json.load(open(f"state_{sys.argv[1]}.json")); hull_obj = sys.argv[2]; which = sys.argv[3].split(",")
H = np.array([[float(x) for x in l.split()[1:4]] for l in open(hull_obj) if l.startswith("v ")])
rng = np.random.default_rng(1)
import os
SCMAX = float(os.environ.get("SCMAX", "1.04"))
AX = {"Foot": np.array([0, -1.0, 0])}


def A_of(name):
    b = st["bones"][st["pieces"][name]["bone"]]
    return np.array(b["pose"]) @ np.linalg.inv(np.array(b["rest"]))


def samples(V, faces, k=80):
    pts = []
    for f in faces:
        for i in range(1, len(f) - 1):
            a, b, c = V[f[0]], V[f[i]], V[f[i + 1]]
            n = max(4, int(np.linalg.norm(np.cross(b - a, c - a)) * k))
            r = rng.random((n, 2)); m = r.sum(1) > 1; r[m] = 1 - r[m]
            pts.append(a + r[:, :1] * (b - a) + r[:, 1:] * (c - a))
    return np.concatenate(pts)


allp, lab = [], []
for name, p in st["pieces"].items():
    A = A_of(name); q = samples(np.array(p["verts"]), p["faces"]) @ A[:3, :3].T + A[:3, 3]
    allp.append(q); lab += [name] * len(q)
allp = np.concatenate(allp); lab = np.array(lab)
d, i = cKDTree(allp).query(H); L = lab[i]
P = json.load(open("pieces.json"))


def ray_poly(c, ang, hull2):
    """distance from c along angle ang to the convex polygon boundary"""
    dvec = np.array([np.cos(ang), np.sin(ang)]); best = None
    pts = hull2
    for j in range(len(pts)):
        a, b = pts[j], pts[(j + 1) % len(pts)]
        M = np.array([dvec, a - b]).T
        if abs(np.linalg.det(M)) < 1e-9: continue
        t, s = np.linalg.solve(M, a - c)
        if t > 0 and 0 <= s <= 1: best = t if best is None else max(best, t)
    return best


report = {}
for name in which:
    p = st["pieces"][name]; A = A_of(name); Ai = np.linalg.inv(A)
    seg = H[(L == name) & (d < 0.8)]
    if len(seg) < 30: report[name] = "few"; continue
    segr = seg @ Ai[:3, :3].T + Ai[:3, 3]                     # rest space
    base = name.split(".")[0]
    RS = {"LegUpper": 4, "LegLower": 4, "UpperArm": 4, "Forearm": 4, "Boot": 6, "Skirt": 8, "Torso": 8, "Neck": 6, "Foot": 4, "Hand": 4}[base]
    V = np.array(P[name]["verts"]); cen = V.mean(0)
    ax = np.array({"UpperArm": (1, 0, 0), "Forearm": (1, 0, 0), "Hand": (1, 0, 0), "Foot": (0, 1, 0)}.get(base, (0, 0, 1)), float)
    t = V @ ax; order = np.argsort(t)
    rings = [list(order[k:k + RS]) for k in range(0, len(V), RS)]
    planes = []
    for r in rings:
        Q = V[r]; c = Q.mean(0); w2, U2 = np.linalg.eigh(np.cov((Q - c).T)); n = U2[:, 0]
        if n @ ax < 0: n = -n
        planes.append((c, n))
    ts = [float(c @ ax) for c, n in planes]
    out = V.copy(); info = []
    for k, r in enumerate(rings):
        c0, nrm = planes[k]
        e1 = np.cross(nrm, [0, 0, 1.0]) if abs(nrm[2]) < 0.9 else np.cross(nrm, [0, 1.0, 0]); e1 /= np.linalg.norm(e1); e2 = np.cross(nrm, e1)
        dd = (segr - c0) @ nrm
        lo = -(ts[k] - ts[k - 1]) * 0.45 if k > 0 else -0.04
        hi = (ts[k + 1] - ts[k]) * 0.45 if k < len(rings) - 1 else 0.04
        bh0 = np.array(st["bones"][p["bone"]]["rest"])[:3, 3]
        if base == "LegUpper" and np.linalg.norm(c0 - bh0) < np.linalg.norm(planes[len(rings) - 1 - k][0] - bh0):
            sp = abs(ts[-1] - ts[0]); sgn = 1 if k == 0 else -1
            mid = sgn * 0.6 * sp; lo, hi = mid - 0.15, mid + 0.15
        sl = segr[(dd >= lo - 0.03) & (dd <= hi + 0.03)]
        if len(sl) < 12 or len(r) < 3: info.append(0); continue
        q2 = np.stack([sl @ e1, sl @ e2], 1)
        try: hv = q2[ConvexHull(q2).vertices]
        except Exception: info.append(0); continue
        c = q2.mean(0)
        v2 = np.stack([V[r] @ e1, V[r] @ e2], 1); vc = v2.mean(0)
        newc = c
        rad = []
        for j, vi in enumerate(r):
            ang = np.arctan2(*(v2[j] - vc)[::-1]); dist = ray_poly(newc, ang, hv)
            rad.append(dist if dist else np.linalg.norm(v2[j] - vc))
        # area compensation: inscribed polygon -> same area as the cross-section
        new2 = np.array([newc + rr * np.array([np.cos(np.arctan2(*(v2[j] - vc)[::-1])), np.sin(np.arctan2(*(v2[j] - vc)[::-1]))]) for j, rr in enumerate(rad)])
        order = np.argsort([np.arctan2(*(x - newc)[::-1]) for x in new2])
        poly = new2[order]; ar = 0.5 * abs(np.dot(poly[:, 0], np.roll(poly[:, 1], 1)) - np.dot(poly[:, 1], np.roll(poly[:, 0], 1)))
        harea = ConvexHull(q2).volume
        sc = np.sqrt(harea / ar) if ar > 1e-6 else 1.0; sc = min(max(sc, 1.0), SCMAX)
        new2 = newc + (new2 - newc) * sc
        for j, vi in enumerate(r):
            h = (V[vi] - c0) @ nrm
            bh = np.array(st["bones"][p["bone"]]["rest"])[:3, 3]
            far = np.linalg.norm(planes[k][0] - bh) > np.linalg.norm(planes[len(rings) - 1 - k][0] - bh)
            if base in ("Foot", "Hand") and k in (0, len(rings) - 1) and (far or base == "Foot"):
                ax_s = (segr - c0) @ nrm
                h += (np.percentile(ax_s, 1.5) if k == 0 else np.percentile(ax_s, 98.5)) * 0.8
            out[vi] = c0 + nrm * h + e1 * (new2[j, 0] - c0 @ e1) + e2 * (new2[j, 1] - c0 @ e2)
        info.append(len(sl))
    P[name]["verts"] = np.round(out, 4).tolist(); report[name] = info
json.dump(P, open("pieces.json", "w"), indent=0)
print(report)
