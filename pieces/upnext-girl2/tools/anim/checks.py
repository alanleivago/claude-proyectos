"""Self-checks per clip on the skinned mesh: interpenetration depth between body parts, foot sliding, sole below the
floor, IK at full stretch. Signed distance = to the nearest triangle (of the k nearest by centroid), sign by its normal."""
import numpy as np
from scipy.spatial import cKDTree
import core as C

F = C.G["F"]; LAB = C.LAB
COMP = {}
for c, d in C.CDOM.items(): COMP.setdefault(d, []).append(c)
def verts_of(*doms): return np.nonzero(np.isin(LAB, sum([COMP.get(d, []) for d in doms], [])))[0]
def faces_of(*doms):
    v = set(verts_of(*doms).tolist()); return np.array([i for i, f in enumerate(F) if f[0] in v])
GROUPS = {"torso": "Chest", "skirt": "Pelvis", "head": "Head", "thighL": "Thigh.L", "thighR": "Thigh.R", "bootL": "Calf.L", "bootR": "Calf.R",
          "uarmL": "UpperArm.L", "uarmR": "UpperArm.R", "farmL": "Forearm.L", "farmR": "Forearm.R"}
GV = {k: verts_of(v) for k, v in GROUPS.items()}; GF = {k: faces_of(v) for k, v in GROUPS.items()}
for s_ in "LR":   # v3 arm loft: the top rings sit inside the shoulder on purpose (chest / clavicle weighted) -> not tested
    hid = (C.W[:, C.BI["Chest"]] + C.W[:, C.BI[f"Clavicle.{s_}"]]) > 0.05
    GV["uarm" + s_] = GV["uarm" + s_][~hid[GV["uarm" + s_]]]
PAIRS = [("farmL", "torso"), ("farmR", "torso"), ("uarmL", "torso"), ("uarmR", "torso"), ("farmL", "head"), ("farmR", "head"),
         ("farmL", "skirt"), ("farmR", "skirt"), ("farmL", "thighL"), ("farmR", "thighR"), ("farmL", "farmR"),
         ("thighL", "thighR"), ("bootL", "bootR"), ("skirt", "thighL"), ("skirt", "thighR"), ("thighL", "bootR"), ("thighR", "bootL"),
         ("farmL", "thighR"), ("farmR", "thighL")]
BASE = {}


def closest_on_tri(p, a, b, c):
    # Ericson, vectorised over rows
    ab, ac, ap = b - a, c - a, p - a
    d1, d2 = (ab * ap).sum(1), (ac * ap).sum(1)
    bp = p - b; d3, d4 = (ab * bp).sum(1), (ac * bp).sum(1)
    cp = p - c; d5, d6 = (ab * cp).sum(1), (ac * cp).sum(1)
    va = d3 * d6 - d5 * d4; vb = d5 * d2 - d1 * d6; vc = d1 * d4 - d3 * d2
    den = np.where(np.abs(va + vb + vc) < 1e-15, 1e-15, va + vb + vc)
    v = vb / den; w = vc / den; res = a + ab * v[:, None] + ac * w[:, None]
    m = (d1 <= 0) & (d2 <= 0); res[m] = a[m]
    m = (d3 >= 0) & (d4 <= d3); res[m] = b[m]
    m = (d6 >= 0) & (d5 <= d6); res[m] = c[m]
    m = (vc <= 0) & (d1 >= 0) & (d3 <= 0); t = d1 / np.where(d1 - d3 == 0, 1e-15, d1 - d3); res[m] = (a + ab * t[:, None])[m]
    m = (vb <= 0) & (d2 >= 0) & (d6 <= 0); t = d2 / np.where(d2 - d6 == 0, 1e-15, d2 - d6); res[m] = (a + ac * t[:, None])[m]
    m = (va <= 0) & ((d4 - d3) >= 0) & ((d5 - d6) >= 0); t = (d4 - d3) / np.where((d4 - d3) + (d5 - d6) == 0, 1e-15, (d4 - d3) + (d5 - d6))
    res[m] = (b + (c - b) * t[:, None])[m]
    return res


LOWSKIRT = np.nonzero(C.W[:, [C.BI[n] for n in ("SkirtFL", "SkirtFR", "SkirtBL", "SkirtBR")]].sum(1) > 0.45)[0]


def parity(P, T, d):
    """odd number of ray hits from points P along d through triangles T -> inside (closed-ish mesh)"""
    A0 = T[:, 0]; e1 = T[:, 1] - A0; e2 = T[:, 2] - A0
    pv = np.cross(d, e2); det = (e1 * pv).sum(1); ok = np.abs(det) > 1e-12; inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
    tv = P[:, None, :] - A0[None]; u = (tv * pv[None]).sum(2) * inv
    qv = np.cross(tv, e1[None]); v = (qv * d).sum(2) * inv; t = (qv * e2[None]).sum(2) * inv
    hit = ok[None] & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 0)
    return hit.sum(1) % 2 == 1


def depth(V, ga, gb, k=6, base=None):
    """max penetration (m) of group ga's vertices into the closed surface of group gb (ray parity on 2 skew rays,
    depth = distance to the nearest triangle), minus the same pair's depth in his_idle"""
    P = V[LOWSKIRT if ga == "skirt" else GV[ga]]; T = V[F[GF[gb]]]
    lo, hi = T.reshape(-1, 3).min(0) - 0.01, T.reshape(-1, 3).max(0) + 0.01
    m = np.all((P > lo) & (P < hi), 1)
    dep = 0.0
    if m.any():
        Q = P[m]; ins = parity(Q, T, np.array([0.013, 0.021, 1.0])) & parity(Q, T, np.array([1.0, 0.017, 0.023]))
        if ins.any():
            Q = Q[ins]; cen = T.mean(1); kk = min(k, len(cen)); _, idx = cKDTree(cen).query(Q, kk)
            best = np.full(len(Q), np.inf)
            for j in range(kk):
                ii = idx[:, j]; q = closest_on_tri(Q, T[ii, 0], T[ii, 1], T[ii, 2]); best = np.minimum(best, np.linalg.norm(Q - q, axis=1))
            dep = float(best.max())
    if base is None: return dep
    return max(0.0, dep - base)


SOLE = {s: verts_of(f"Calf.{s}") for s in "LR"}


def check_clip(c, Vs, Hs, thr=0.012):
    if not BASE:
        V0 = C.G["V"]
        for a, b in PAIRS: BASE[(a, b)] = depth(V0, a, b)
    worst = {}
    step = max(1, len(Vs) // 16)
    for fi in range(0, len(Vs), step):
        for a, b in PAIRS:
            d = depth(Vs[fi], a, b, base=BASE[(a, b)])
            if d > thr and d > worst.get((a, b), (0, 0))[0]: worst[(a, b)] = (d, fi)
    out = [f"[{c.name}]"]
    if worst: out.append("  clip: " + ", ".join(f"{a}>{b} {d * 100:.1f}cm@f{fi}" for (a, b), (d, fi) in sorted(worst.items(), key=lambda x: -x[1][0])))
    zmin = min(float(V[np.r_[SOLE['L'], SOLE['R']], 2].min()) for V in Vs)
    if zmin < -0.014: out.append(f"  sole below floor {zmin * 100:.1f}cm")
    if not getattr(c, "speed", None):
        slide = 0.0
        for s in "LR":
            sv = SOLE[s]
            for a, b in zip(Vs[:-1], Vs[1:]):
                low = sv[(a[sv, 2] < 0.0) & (b[sv, 2] < 0.0)]
                if len(low): slide = max(slide, float(np.linalg.norm((b[low] - a[low])[:, :2], axis=1).max()))
        if slide > 0.003: out.append(f"  foot slide {slide * 1000:.1f} mm/frame")
    full = 0
    for H in Hs:
        for s in "LR":
            L = np.linalg.norm(H[C.BI[f"Foot.{s}"]] - H[C.BI[f"Thigh.{s}"]])
            if L > 0.997 * (C.LEN[f"Thigh.{s}"] + C.LEN[f"Calf.{s}"]): full += 1
    if full: out.append(f"  leg at full stretch in {full} foot-frames")
    if len(out) == 1: out.append("  ok")
    return "\n".join(out)
