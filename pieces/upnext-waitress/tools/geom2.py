"""Waitress v2 (OBJ coords: x, y up, z front).  python -I tools/geom2.py [B|C|all]
 B = high-waist shorts, C = cropped slim jeans (option A / skirt dropped).
 v2 changes: smaller shoes (x0.82) and hands (x0.85), curvy butt (slanted leg tops + cheek row), the corset-to-waist
 band rebuilt (waist 6 -> mid 8 -> hip 8, own texture, smooth normals through band / pelvis / legs), puff sleeves
 partly on the clavicle, bust bones, face split into an eyes + mouth region for the 16x4 expression atlases.
 -> ref/build2_<opt>.json, tex/lower2_<opt>.png"""
import json, math, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ASSET = os.path.abspath(os.path.join(ROOT, "..", "..", "assets", "waitress"))
D = json.load(open(os.path.join(ROOT, "ref", "orig.json")))
V0 = np.array(D["verts"], float)
F0 = D["faces"]

EYE_RECT = (8, 21, 54, 47)          # px in ST1AT_40 (x0, y0, x1, y1), brows + eyes + blush band
MOUTH_RECT = (18, 53, 43, 66)       # px, mouth + mole (strictly inside the face polygons)
FACE_COLS, FACE_ROWS = 16, 4

comps = {}
for i, f in enumerate(F0):
    comps.setdefault(f["comp"], []).append(i)
cverts = lambda fl: sorted({v for i in fl for v in F0[i]["v"]})
part_of = {}
for k, fl in comps.items():
    P = V0[cverts(fl)]; mn, mx = P.min(0), P.max(0); n = len(fl)
    nm = ("torso" if n == 45 else "head" if n == 53 else "shoe" if mx[1] < 0.25 else "pie" if n == 15 else
          "tray" if (n == 6 and mn[0] > 0.1) else "trayarm" if n == 47 else "uparm" if n == 21 else "forearm" if n == 22 else
          "neck" if n == 6 else "nose" if n == 3 else "bangs" if n == 4 else None)
    assert nm, (k, n)
    part_of[k] = nm
torso_v = cverts(comps[[k for k, v in part_of.items() if v == "torso"][0]])
pairs = [(V0[a, 0] + V0[b, 0]) / 2 for a in torso_v for b in torso_v
         if a < b and abs(V0[a, 1] - V0[b, 1]) < 1e-3 and abs(V0[a, 2] - V0[b, 2]) < 1e-3 and abs(V0[a, 0] - V0[b, 0]) > 0.05]
C = float(np.median(pairs))

PX = 175.0
TW, TH = 256, 128
HIP = {"F": (0.128, 1.011, 0.066), "S": (0.180, 0.992, -0.012), "B": (0.136, 0.992, -0.152)}   # v3 flat stomach, v4 curvier   # v3: flat stomach
# leg rings: y, lateral centre offset, centre z, rx, rz   (r0 is slanted: back verts lower, back radius bigger = butt)
RINGS = [
    (0.862, 0.099, -0.020, 0.096, 0.099),
    (0.720, 0.097, -0.028, 0.090, 0.092),
    (0.560, 0.089, -0.033, 0.066, 0.068),
    (0.480, 0.085, -0.035, 0.050, 0.054),
    (0.360, 0.083, -0.058, 0.056, 0.062),
    (0.270, 0.081, -0.074, 0.040, 0.043),
    (0.192, 0.079, -0.0875, 0.034, 0.036),
    (0.135, 0.079, -0.0875, 0.032, 0.034),
]
PHI = [270, 330, 30, 90, 150, 210]
LAB = ["I", "FI", "FO", "O", "BO", "BI"]
ABD = 15.0
SHOULDER = np.array([C - 0.150, 1.362, -0.040])
SHOE_S, SHOE_SY = 0.82, 0.90
HAND_S = 0.85
WRIST0 = np.array([-0.3015, 0.933, -0.035])          # rip coords (before the A-pose rotation)
SHORTS_HEM = 0.770
JEANS_HEM = 0.262


def ring_pt(k, j, s):
    y, off, cz, rx, rz = RINGS[k]
    p = math.radians(PHI[j]); c = math.cos(p)
    if k == 0 and c < 0: y -= 0.034 * (-c); rz *= 1.0 + 0.73 * (-c)       # gluteal fold lower, butt flows into the thigh (v4)
    if k == 1 and c < 0: rz *= 1.0 + 0.25 * (-c)
    return np.array([C + s * (off + rx * math.sin(p)), y, cz + rz * c])


def leg_axis(y):
    ys = [r[0] for r in RINGS]
    y = min(max(y, ys[-1]), ys[0])
    for k in range(len(RINGS) - 1):
        if RINGS[k + 1][0] <= y <= RINGS[k][0]:
            t = (RINGS[k][0] - y) / (RINGS[k][0] - RINGS[k + 1][0])
            a, b = np.array(RINGS[k][1:]), np.array(RINGS[k + 1][1:]); return a + (b - a) * t
    return np.array(RINGS[0][1:])


class Mesh:
    def __init__(s):
        s.V, s.W, s.F, s.key, s.attr = [], [], [], {}, {}

    def vert(s, key, p, w):
        if key in s.key: return s.key[key]
        s.key[key] = len(s.V); s.V.append(np.array(p, float)); s.W.append(w); return s.key[key]

    def face(s, vs, uvs, mat, part, inside=None, outward=True):
        if inside is not None:
            P = [s.V[v] for v in vs]
            n = np.cross(P[1] - P[0], P[2] - P[0])
            if len(P) == 4: n = n + np.cross(P[2] - P[0], P[3] - P[0])
            g = np.mean(P, 0)
            if (np.dot(n, g - inside(g)) < 0) == outward: vs, uvs = vs[::-1], uvs[::-1]
        s.F.append({"v": list(vs), "uv": [list(map(float, u)) for u in uvs], "mat": mat, "part": part})


def rotz(p, piv, deg):
    a = math.radians(deg); q = p - piv
    return piv + np.array([q[0] * math.cos(a) - q[1] * math.sin(a), q[0] * math.sin(a) + q[1] * math.cos(a), q[2]])


def mirror(p): return np.array([2 * C - p[0], p[1], p[2]])


MAT_TEX0, MAT_LOWER, MAT_EYES, MAT_MOUTH = 0, 1, 2, 3
px2uv = lambda u, v: [u / 256.0, 1 - v / 128.0]


def shoe_xform(p):
    s = 1 if p[0] > C else -1
    piv = np.array([C + s * 0.0785, 0.0, -0.0875])
    q = p - piv
    return piv + np.array([q[0] * SHOE_S, q[1] * SHOE_SY, q[2] * SHOE_S])


def orig_pos(nm, v):
    p = V0[v].copy()
    if nm == "shoe": p = shoe_xform(p)
    if nm == "forearm" and p[1] < 0.92: p = WRIST0 + (p - WRIST0) * HAND_S
    if nm in ("uparm", "forearm"): p = rotz(p, SHOULDER, -ABD)
    return p


def orig_weight(nm, v, p, side):
    y = V0[v][1]
    if nm in ("head", "nose", "bangs"): return {"Head": 1.0}
    if nm == "neck": return {"Neck": 0.6, "Chest": 0.4} if y < 1.44 else {"Neck": 0.7, "Head": 0.3}
    if nm == "shoe": return {"Foot." + ("L" if p[0] > C else "R"): 1.0}
    if nm == "torso":
        sn = "L" if V0[v][0] > C else "R"
        if abs(y - 1.305) < 0.01: return {"Chest": 0.5, "Bust." + sn: 0.5}          # bust apex
        if abs(y - 1.237) < 0.01: return {"Chest": 0.75, "Bust." + sn: 0.25}        # under the bust
        if y > 1.2: return {"Chest": 1.0}
        return {"Spine": 0.7, "Chest": 0.3}
    if nm == "uparm":
        if y > 1.33: return {"UpperArm." + side: 0.6, "Clavicle." + side: 0.4}      # puff top / shoulder cap
        if y > 1.27: return {"UpperArm." + side: 0.85, "Clavicle." + side: 0.15}    # puff ring
        if y < 1.13: return {"UpperArm." + side: 0.5, "Forearm." + side: 0.5}
        return {"UpperArm." + side: 1.0}
    if nm == "forearm":
        if y > 1.12: return {"UpperArm." + side: 0.5, "Forearm." + side: 0.5}
        if y > 0.92: return {"Forearm." + side: 0.5, "Hand." + side: 0.5}
        return {"Hand." + side: 1.0}
    raise ValueError(nm)


def leg_weight(k, j, sn):
    T, Cf, Ft = "Thigh." + sn, "Calf." + sn, "Foot." + sn
    if k == 0: return {T: 0.5, "Pelvis": 0.5} if LAB[j] in ("FO", "O", "BO") else {T: 0.75, "Pelvis": 0.25}
    if k in (1, 2): return {T: 1.0}
    if k == 3: return {T: 0.5, Cf: 0.5}
    if k in (4, 5): return {Cf: 1.0}
    if k == 6: return {Cf: 0.7, Ft: 0.3}
    return {Cf: 0.4, Ft: 0.6}


# ------------------------------------------------------------------ face split (UV-space clipping of the head faces)
def clip_half(poly, axis, val, keep_less):
    out = []
    for i in range(len(poly)):
        a, b = poly[i], poly[(i + 1) % len(poly)]
        ia = (a[0][axis] <= val) if keep_less else (a[0][axis] >= val)
        ib = (b[0][axis] <= val) if keep_less else (b[0][axis] >= val)
        if ia: out.append(a)
        if ia != ib:
            t = (val - a[0][axis]) / (b[0][axis] - a[0][axis])
            out.append((a[0] + (b[0] - a[0]) * t, None))
    return out


def poly_area(P):
    return 0.5 * sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P)))


def split_face(uvpx, rect):
    """triangle (3 uv px) minus / inside an axis rect -> (inside polys, outside polys) of uv points"""
    x0, y0, x1, y1 = rect
    tri = [(np.array(u, float), None) for u in uvpx]
    ins = clip_half(clip_half(clip_half(clip_half(tri, 0, x0, False), 0, x1, True), 1, y0, False), 1, y1, True)
    outs = [clip_half(tri, 1, y0, True), clip_half(tri, 1, y1, False)]
    mid = clip_half(clip_half(tri, 1, y0, False), 1, y1, True)
    outs += [clip_half(mid, 0, x0, True), clip_half(mid, 0, x1, False)]
    good = lambda p: len(p) >= 3 and abs(poly_area([q[0] for q in p])) > 1e-6
    return [[q[0] for q in ins]] if good(ins) else [], [[q[0] for q in p] for p in outs if good(p)]


def add_head_face(M, f, rect_list):
    """add one head triangle, split against the eyes / mouth rects (shared points keyed by 3D position)"""
    vs = f["v"]
    uvpx = [np.array([u * 256.0, (1 - v) * 128.0]) for u, v in f["uv"]]
    P3 = [orig_pos("head", v) for v in vs]
    A = np.array([[uvpx[1][0] - uvpx[0][0], uvpx[2][0] - uvpx[0][0]], [uvpx[1][1] - uvpx[0][1], uvpx[2][1] - uvpx[0][1]]])
    if abs(np.linalg.det(A)) < 1e-9: return False
    polys = [(None, [u.copy() for u in uvpx])]
    hit = False
    for mat, rect in rect_list:
        nxt = []
        for m, poly in polys:
            if m is not None or len(poly) != 3: nxt.append((m, poly)); continue
            x = [p[0] for p in poly]; y = [p[1] for p in poly]
            if max(x) <= rect[0] or min(x) >= rect[2] or max(y) <= rect[1] or min(y) >= rect[3]: nxt.append((m, poly)); continue
            ins, outs = split_face(poly, rect); hit = True
            nxt += [(mat, p) for p in ins] + [(None, p) for p in outs]
        # outside pieces may be polygons; triangulate before the next rect
        polys = []
        for m, p in nxt:
            for i in range(1, len(p) - 1): polys.append((m, [p[0], p[i], p[i + 1]]))
    if not hit: return False
    # T-junction removal inside the triangle: insert collinear points on every piece edge
    allp = []
    for _, p in polys:
        for q in p:
            if not any(np.linalg.norm(q - r) < 1e-6 for r in allp): allp.append(q)
    Ainv = np.linalg.inv(A)
    def p3(q):
        l1, l2 = Ainv @ (q - uvpx[0]); return P3[0] + l1 * (P3[1] - P3[0]) + l2 * (P3[2] - P3[0])
    def vid(q):
        for k in range(3):
            if np.linalg.norm(q - uvpx[k]) < 1e-6: return M.vert(("o", vs[k]), P3[k], {"Head": 1.0})
        p = p3(q); return M.vert(("hs",) + tuple(np.round(p, 6)), p, {"Head": 1.0})
    for m, p in polys:
        ring = []
        for i in range(3):
            a, b = p[i], p[(i + 1) % 3]; ring.append(a)
            ex = []
            for r in allp:
                ab = b - a; t = np.dot(r - a, ab) / (np.dot(ab, ab) + 1e-12)
                if 1e-4 < t < 1 - 1e-4 and np.linalg.norm(a + ab * t - r) < 1e-5: ex.append((t, r))
            ring += [r for _, r in sorted(ex, key=lambda e: e[0])]
        if m is None:
            uv = [px2uv(*q) for q in ring]; mat = MAT_TEX0
        else:
            rx0, ry0, rx1, ry1 = dict(rect_list)[m]
            uv = [[(q[0] - rx0) / (rx1 - rx0) / FACE_COLS, 1 - (q[1] - ry0) / (ry1 - ry0) / FACE_ROWS] for q in ring]; mat = m
        ids = [vid(q) for q in ring]
        if len(ids) == 3:
            M.F.append({"v": ids, "uv": uv, "mat": mat, "part": "face" if m is not None else "head"})
        else:                                                   # fan from the first corner keeps it planar
            for i in range(1, len(ids) - 1):
                M.F.append({"v": [ids[0], ids[i], ids[i + 1]], "uv": [uv[0], uv[i], uv[i + 1]], "mat": mat,
                            "part": "face" if m is not None else "head"})
    return True


# ------------------------------------------------------------------ build
def zipper(A, B, angA, angB):
    """triangulate between two closed rings sorted by angle (degrees, increasing, both starting at 0)"""
    tris = []; i = j = 0; nA, nB = len(A), len(B)
    aA = angA + [angA[0] + 360]; aB = angB + [angB[0] + 360]
    while i < nA or j < nB:
        if j < nB and (i == nA or aB[j + 1] - aA[i] <= aA[i + 1] - aB[j]):
            tris.append((A[i % nA], B[j % nB], B[(j + 1) % nB])); j += 1
        else:
            tris.append((A[i % nA], B[j % nB], A[(i + 1) % nA])); i += 1
    return tris


def ang(p):
    return math.degrees(math.atan2(p[0] - C, p[2] + 0.012)) % 360          # 0 front, 90 her left (x > C)


def build(opt):
    M = Mesh()
    hip_ids = {}
    for v in torso_v:
        x, y, z = V0[v]
        if 0.95 < y < 1.05: hip_ids[v] = ("F" if z > 0.08 else "B" if z < -0.08 else "S", "L" if x > C else "R")
    hip_pos = lambda cls, s: np.array([C + (HIP[cls][0] if s == "L" else -HIP[cls][0]), HIP[cls][1], HIP[cls][2]])
    waist_v = [v for v in torso_v if 1.10 < V0[v][1] < 1.19]            # 18, 21 (front) 4, 12 (back)
    band_faces = {i for k, fl in comps.items() if part_of[k] == "torso" for i in fl if F0[i]["mat"] == 1}
    wkey = lambda v: ("o", v)
    # centre points on the waist front / back edges (torso faces on those edges are split too: no T-junctions)
    wf = [v for v in waist_v if V0[v][2] > 0]; wb = [v for v in waist_v if V0[v][2] < 0]
    WF = (V0[wf[0]] + V0[wf[1]]) / 2; WB = (V0[wb[0]] + V0[wb[1]]) / 2
    wwt = {"Spine": 0.7, "Chest": 0.3}
    for k, fl in comps.items():
        nm = part_of[k]
        if nm in ("pie", "tray", "trayarm"): continue
        for i in fl:
            f = F0[i]
            if nm == "torso" and (i in band_faces or any(V0[v, 1] < 0.5 for v in f["v"])): continue
            if nm == "head":
                n = len(f["v"]); left = []
                for t in range(1, n - 1):
                    sub = {"v": [f["v"][0], f["v"][t], f["v"][t + 1]], "uv": [f["uv"][0], f["uv"][t], f["uv"][t + 1]]}
                    if not add_head_face(M, sub, [(MAT_EYES, EYE_RECT), (MAT_MOUTH, MOUTH_RECT)]): left.append(sub)
                if len(left) == n - 2: left = [f]
                for sub in left:
                    ids = [M.vert(("o", v), orig_pos(nm, v), orig_weight(nm, v, None, "R")) for v in sub["v"]]
                    for t in range(1, len(ids) - 1):
                        M.F.append({"v": [ids[0], ids[t], ids[t + 1]], "uv": [sub["uv"][0], sub["uv"][t], sub["uv"][t + 1]], "mat": MAT_TEX0, "part": "head"})
                continue
            sides = ["R"] + (["L"] if nm in ("uparm", "forearm") else [])
            for side in sides:
                ids = []
                for v in f["v"]:
                    p = orig_pos(nm, v)
                    if side == "L": p = mirror(p)
                    ids.append(M.vert(("o" if side == "R" else "m", v), p, orig_weight(nm, v, p, side)))
                uv = [list(u) for u in f["uv"]]
                if side == "L": ids, uv = ids[::-1], uv[::-1]
                # split torso faces that use a waist front / back edge at its midpoint
                if nm == "torso":
                    for e, mid, key in ((wf, WF, "WF"), (wb, WB, "WB")):
                        a, b = M.key[wkey(e[0])] if wkey(e[0]) in M.key else None, M.key[wkey(e[1])] if wkey(e[1]) in M.key else None
                        if a in ids and b in ids:
                            n = len(ids); ia, ib = ids.index(a), ids.index(b)
                            if (ia + 1) % n == ib or (ib + 1) % n == ia:
                                pos = ia if (ia + 1) % n == ib else ib
                                mv = M.vert(("w", key), mid, wwt)
                                muv = [(uv[ia][0] + uv[ib][0]) / 2, (uv[ia][1] + uv[ib][1]) / 2]
                                ids = ids[:pos + 1] + [mv] + ids[pos + 1:]; uv = uv[:pos + 1] + [muv] + uv[pos + 1:]
                for t in range(1, len(ids) - 1):
                    M.F.append({"v": [ids[0], ids[t], ids[t + 1]], "uv": [uv[0], uv[t], uv[t + 1]], "mat": MAT_TEX0, "part": nm + ("_m" if side == "L" else "")})
    # ---- hip ring (8) and waist ring (6)
    H = {}
    for v, (cls, s) in hip_ids.items(): H[(cls, s)] = M.vert(("hip", cls, s), hip_pos(cls, s), {"Pelvis": 1.0})
    for c in "FB": H[(c, "C")] = M.vert(("hip", c, "C"), (M.V[H[(c, "L")]] + M.V[H[(c, "R")]]) / 2, {"Pelvis": 1.0})
    hip_ring = [H[k] for k in [("F", "C"), ("F", "L"), ("S", "L"), ("B", "L"), ("B", "C"), ("B", "R"), ("S", "R"), ("F", "R")]]
    wl = {("F", "L"): [v for v in wf if V0[v][0] > C][0], ("F", "R"): [v for v in wf if V0[v][0] < C][0],
          ("B", "L"): [v for v in wb if V0[v][0] > C][0], ("B", "R"): [v for v in wb if V0[v][0] < C][0]}
    for k, v in wl.items(): M.vert(("o", v), orig_pos("torso", v), orig_weight("torso", v, None, "R"))
    W_ = [M.vert(("w", "WF"), WF, wwt), M.key[("o", wl[("F", "L")])], M.key[("o", wl[("B", "L")])], M.vert(("w", "WB"), WB, wwt),
          M.key[("o", wl[("B", "R")])], M.key[("o", wl[("F", "R")])]]
    angW = [ang(M.V[v]) for v in W_]; angW[0] = 0.0; angW[3] = 180.0
    angH = [ang(M.V[v]) for v in hip_ring]; angH[0] = 0.0; angH[4] = 180.0
    # mid ring at the hip-ring angles, halfway, eased out a little (soft belly / hip curve)
    def waist_at(a):
        best = None
        for i in range(6):
            p, q = M.V[W_[i]], M.V[W_[(i + 1) % 6]]
            a0, a1 = angW[i], angW[(i + 1) % 6] if i < 5 else 360.0
            if a0 <= a <= a1 or (i == 5 and a >= a0):
                t = (a - a0) / ((a1 - a0) or 1); best = p + (q - p) * t
        return best
    MID = []
    for i, a in enumerate(angH):
        w = waist_at(a); h = M.V[hip_ring[i]]
        m = w * 0.48 + h * 0.52; cxz = np.array([C, m[1], -0.012]); m = cxz + (m - cxz) * np.array([1.035, 1, 1.035 if m[2] < -0.012 else 0.985])
        MID.append(M.vert(("mid", i), m, {"Spine": 0.45, "Pelvis": 0.55}))
    band_in = lambda g: np.array([C, g[1], -0.012])
    bt = M.attr.setdefault("bt", {})
    for v in W_: bt[v] = 0.0
    for v in MID: bt[v] = 0.5
    for v in hip_ring: bt[v] = 1.0
    UV_B = band_uv(M, W_, MID, hip_ring, angW, angH)
    for a, b, c in zipper(W_, MID, angW, angH):
        M.face([a, b, c], [UV_B[(v, (a, b, c))] for v in (a, b, c)], MAT_LOWER, "band", band_in)
    for i in range(8):
        i2 = (i + 1) % 8
        q = [MID[i], MID[i2], hip_ring[i2], hip_ring[i]]
        for t in ((0, 1, 2), (0, 2, 3)):
            vs = [q[k] for k in t]; M.face(vs, [UV_B[(v, tuple(vs))] for v in vs], MAT_LOWER, "band", band_in)
    # ---- legs
    UV = uv_layout()
    leg = {}
    for s, sn in ((1, "L"), (-1, "R")):
        for k in range(len(RINGS)):
            for j in range(6): leg[(sn, k, j)] = M.vert(("leg", sn, k, j), ring_pt(k, j, s), leg_weight(k, j, sn))
        leg[(sn, "cap")] = M.vert(("leg", sn, "cap"), [C + s * RINGS[-1][1], 0.12, RINGS[-1][2]], {"Foot." + sn: 0.6, "Calf." + sn: 0.4})
    for sn in "LR":
        s = 1 if sn == "L" else -1
        ins = lambda g, s=s: (lambda a: np.array([C + s * a[0], g[1], a[1]]))(leg_axis(g[1]))
        for k in range(len(RINGS) - 1):
            for j in range(6):
                j2 = (j + 1) % 6
                vs = [leg[(sn, k, j)], leg[(sn, k, j2)], leg[(sn, k + 1, j2)], leg[(sn, k + 1, j)]]
                uvs = [UV["leg"][(k, j)], UV["leg"][(k, j + 1)], UV["leg"][(k + 1, j + 1)], UV["leg"][(k + 1, j)]]
                for t in ((0, 1, 2), (0, 2, 3)):
                    M.face([vs[i] for i in t], [uvs[i] for i in t], MAT_LOWER, "leg", ins)
        kk = len(RINGS) - 1
        for j in range(6):
            M.face([leg[(sn, kk, j)], leg[(sn, kk, (j + 1) % 6)], leg[(sn, "cap")]],
                   [UV["leg"][(kk, j)], UV["leg"][(kk, j + 1)], UV["leg"]["cap"]], MAT_LOWER, "legcap", lambda g: np.array([g[0], 0.3, g[2]]))
    # ---- pelvis: sides, front fan, butt (cheek row), crotch
    pel_in = lambda g: np.array([C, 0.93, -0.015])
    L = lambda sn, lab: leg[(sn, 0, LAB.index(lab))]
    CF = M.vert(("pel", "CF"), [C, 0.905, 0.060], {"Pelvis": 0.8, "Thigh.L": 0.1, "Thigh.R": 0.1})
    CC = M.vert(("pel", "CC"), [C, 0.846, -0.022], {"Pelvis": 0.5, "Thigh.L": 0.25, "Thigh.R": 0.25})
    CB = M.vert(("pel", "CB"), [C, 0.890, -0.164], {"Pelvis": 0.8, "Thigh.L": 0.1, "Thigh.R": 0.1})
    CK = {sn: M.vert(("pel", "CK", sn), [C + (0.078 if sn == "L" else -0.078), 0.885, -0.182], {"Pelvis": 0.6, "Thigh." + sn: 0.4}) for sn in "LR"}
    PU = UV["pel"]
    def F_(vs, isl): M.face(vs, [PU[isl](M.V[v]) for v in vs], MAT_LOWER, "pelvis", pel_in)
    for sn in "LR":
        q1 = [H[("F", sn)], H[("S", sn)], L(sn, "O"), L(sn, "FO")]; q2 = [H[("S", sn)], H[("B", sn)], L(sn, "BO"), L(sn, "O")]
        for q in (q1, q2):
            F_([q[0], q[1], q[2]], "side"); F_([q[0], q[2], q[3]], "side")
    loop_f = [H[("F", "R")], H[("F", "C")], H[("F", "L")], L("L", "FO"), L("L", "FI"), L("R", "FI"), L("R", "FO")]
    for a, b in zip(loop_f, loop_f[1:] + loop_f[:1]): F_([a, b, CF], "front")
    loop_c = [L("L", "FI"), L("L", "I"), L("L", "BI"), L("R", "BI"), L("R", "I"), L("R", "FI")]
    for a, b in zip(loop_c, loop_c[1:] + loop_c[:1]): F_([a, b, CC], "crotch")
    BL, HB, BR = H[("B", "L")], H[("B", "C")], H[("B", "R")]
    for t in [(BL, HB, CB), (BL, CB, CK["L"]), (HB, BR, CK["R"]), (HB, CK["R"], CB),
              (BL, CK["L"], L("L", "BO")), (BR, L("R", "BO"), CK["R"]),
              (CK["L"], L("L", "BO"), L("L", "BI")), (CK["L"], L("L", "BI"), CB), (CB, L("L", "BI"), L("R", "BI")),
              (CB, L("R", "BI"), CK["R"]), (CK["R"], L("R", "BI"), L("R", "BO"))]:
        F_(list(t), "back")
    return M


def band_uv(M, W_, MID, HR, angW, angH):
    """mirrored half strip per ring (u = arc from the front centre), keyed per (vertex, face) so faces that cross the
    centre line (none: rings have points at 0 / 180) stay consistent"""
    out = {}
    U0, VW, VM, VH = 108, 2, 16, 32
    def arc(ids, angs):
        half = [i for i, a in enumerate(angs) if a <= 180.0 + 1e-6]
        d = {half[0]: 0.0}
        for a, b in zip(half, half[1:]): d[b] = d[a] + float(np.linalg.norm(M.V[ids[b]] - M.V[ids[a]]))
        for i in range(len(ids)):
            if i not in d:
                p = mirror(M.V[ids[i]]); j = min(half, key=lambda j: np.linalg.norm(M.V[ids[j]] - p)); d[i] = d[j]
        return d
    dW, dM, dH = arc(W_, angW), arc(MID, angH), arc(HR, angH)
    table = {}
    for ids, d, vv in ((W_, dW, VW), (MID, dM, VM), (HR, dH, VH)):
        for i, v in enumerate(ids): table[v] = (U0 + d[i] * PX, vv)
    class K(dict):
        def __missing__(s, key): return table[key[0]]
    return K()


def uv_layout():
    UV = {"leg": {}}
    d_ = {}
    for k in range(len(RINGS)):
        pts = [ring_pt(k, j % 6, 1) for j in range(7)]
        d = [0.0]
        for a, b in zip(pts, pts[1:]): d.append(d[-1] + float(np.linalg.norm(b - a)))
        P = d[-1]
        for j in range(7): UV["leg"][(k, j)] = (52 + (d[j] - P / 2) * PX * 0.86, 1.5 + (RINGS[0][0] + 0.004 - pts[j][1]) * 168)
    UV["leg"]["cap"] = (52, 127)
    UV["pel"] = {
        "front": lambda p: (106 + (p[0] - C + 0.14) * PX, 50 + (1.015 - p[1]) * PX),
        "back": lambda p: (160 + (p[0] - C + 0.14) * PX, 50 + (1.015 - p[1]) * PX),
        "side": lambda p: (106 + (0.12 - p[2]) * PX, 84 + (1.015 - p[1]) * PX),
        "crotch": lambda p: (172 + (p[0] - C) * PX, 88 + (0.065 - p[2]) * PX),
    }
    return UV


def bones():
    def ar(p): return rotz(np.array(p, float), SHOULDER, -ABD)
    B = {}
    B["Pelvis"] = ([C, 0.93, -0.020], [C, 1.06, -0.020], None)
    B["Spine"] = ([C, 1.06, -0.020], [C, 1.21, -0.012], "Pelvis")
    B["Chest"] = ([C, 1.21, -0.012], [C, 1.40, -0.045], "Spine")
    B["Neck"] = ([C, 1.40, -0.045], [C, 1.48, -0.045], "Chest")
    B["Head"] = ([C, 1.48, -0.045], [C, 1.72, -0.045], "Neck")
    AX = -0.2905
    el = ar([AX, 1.125, -0.040]); wr = ar([AX - 0.011, 0.930, -0.035])
    ht = ar(WRIST0 + (np.array([AX - 0.016, 0.795, -0.020]) - WRIST0) * HAND_S)
    for sn in ("R", "L"):
        m = (lambda p: np.array(p, float)) if sn == "R" else mirror
        B["Clavicle." + sn] = (m(np.array([C - 0.03, 1.365, -0.035])), m(SHOULDER), "Chest")
        B["UpperArm." + sn] = (m(SHOULDER), m(el), "Clavicle." + sn)
        B["Forearm." + sn] = (m(el), m(wr), "UpperArm." + sn)
        B["Hand." + sn] = (m(wr), m(ht), "Forearm." + sn)
        s = 1 if sn == "L" else -1
        B["Bust." + sn] = ([C + s * 0.068, 1.300, 0.030], [C + s * 0.068, 1.292, 0.120], "Chest")
    for sn, s in (("L", 1), ("R", -1)):
        ank = [C + s * 0.0785, 0.108, -0.0875]
        B["Thigh." + sn] = ([C + s * 0.090, 0.880, -0.025], [C + s * 0.085, 0.480, -0.035], "Pelvis")
        B["Calf." + sn] = ([C + s * 0.085, 0.480, -0.035], ank, "Thigh." + sn)
        B["Foot." + sn] = (ank, [C + s * 0.084, 0.025, 0.105], "Calf." + sn)
    return {k: {"head": list(map(float, h)), "tail": list(map(float, t)), "parent": p} for k, (h, t, p) in B.items()}


# ------------------------------------------------------------------ painting
HEX = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
SKIN = [HEX(h) for h in ("#ffe7c6", "#efcea5", "#e7b58c", "#c6946b", "#a57352")]
NAVY = [HEX(h) for h in ("#424a73", "#39426b", "#313963", "#29315a", "#212952")]
LILAC, LILAC_D, WHITE, DENIM_LT, STITCH, STITCH_D, BLACK = (HEX("#cebdce"), HEX("#7b738c"), HEX("#efe7ef"), HEX("#525a8c"),
                                                            HEX("#212952"), HEX("#212952"), HEX("#393939"))      # v3: dark stitching (was orange)


def lvl(pal, b, th):
    for c, t in zip(pal, th):
        if b > t: return c
    return pal[min(len(th), len(pal) - 1)]


SK_TH = (0.74, 0.60, 0.42, 0.27)
NV_TH = (0.70, 0.55, 0.40, 0.27)


def leg_phi(P):
    off, cz, rx, rz = leg_axis(P[1])
    return math.degrees(math.atan2((abs(P[0] - C) - off) / rx, (P[2] - cz) / rz)) % 360


def light(N):
    return 0.84 - 0.40 * abs(N[0]) ** 2.0 + 0.10 * max(N[1], 0) - 0.18 * max(-N[1], 0)


def near_line(p, a, b, w=0.0032):
    a, b = np.asarray(a, float), np.asarray(b, float); ab = b - a
    t = np.clip(np.dot(p - a, ab) / np.dot(ab, ab), 0, 1); return np.linalg.norm(p - (a + ab * t)) < w


def dash(v, period=0.0115): return (v % period) < period * 0.55


def shade(opt, part, P, N, attr):
    x, y, z = P; ax = abs(x - C); sg = 1 if x >= C else -1
    if part in ("leg", "legcap"):
        off, cz, rx, rz = leg_axis(y)
        n = np.array([(ax - off) / rx ** 2, 0.0, (z - cz) / rz ** 2]); n /= np.linalg.norm(n) + 1e-12
        N = np.array([n[0] * sg, 0.0, n[2]])
    b = light(N)
    hem = SHORTS_HEM if opt == "B" else JEANS_HEM
    if part == "band":
        return band_col(opt, P, N, b, attr.get("bt", 0.5))
    if part in ("leg", "legcap") and y <= hem:
        if part == "leg":
            inner = (ax - leg_axis(y)[0]) < -0.45 * leg_axis(y)[2]
            if inner and y > 0.55: b -= 0.08
            if 0.46 < y < 0.50 and N[2] < -0.7: b -= 0.14
            if hem - 0.035 < y <= hem: b -= 0.16                                  # cast shadow of the cuff
        return lvl(SKIN, b, SK_TH)
    return (shorts_col if opt == "B" else jeans_col)(part, P, N, b)


def band_col(opt, P, N, b, t):
    x, y, z = P; ax = abs(x - C)
    vpt = 0.50 + 0.16 * max(0.0, 1 - ax / 0.032) if z > 0 else 0.50          # corset point at the centre front
    if t < vpt - 0.035: return BLACK
    if t < vpt + 0.005: return NAVY[4]                                       # corset hem shadow / waistband top edge
    a = math.degrees(math.atan2(ax, z + 0.012))
    if any(abs(a - la) < 3.2 for la in (40, 100, 145)) and t < 0.97: return NAVY[3]   # belt loops
    if opt == "B":
        for bx in (0.022,):                                                   # two lilac buttons on the front panel
            if z > 0 and (ax - bx) ** 2 + ((t - 0.78) * 0.09) ** 2 < 0.0062 ** 2:
                return LILAC if (ax - bx) ** 2 + ((t - 0.78) * 0.09) ** 2 < 0.0040 ** 2 else NAVY[4]
        if 0.905 < t < 0.94: return NAVY[3]                                   # waistband bottom seam
        if z > 0 and ax < 0.0028: return NAVY[3]                               # centre seam
        return lvl(NAVY, b + 0.06, NV_TH)
    if z > 0 and ax ** 2 + ((t - 0.76) * 0.09) ** 2 < 0.0065 ** 2:            # metal button
        return WHITE if ax ** 2 + ((t - 0.76) * 0.09) ** 2 < 0.0038 ** 2 else LILAC_D
    if abs(t - 0.64) < 0.03 or abs(t - 0.91) < 0.03: return STITCH
    return lvl(NAVY, b + 0.06, (0.70, 0.55, 0.40, 0.27))


def garment_lines(part, P, y_hem):
    """seam / pocket geometry shared by shorts and jeans: returns a tag or None"""
    x, y, z = P; ax = abs(x - C)
    if part == "pelvis":
        if z > 0.02:
            if ax < 0.0028 and y > 0.875: return "seam"                       # fly / centre front
            if x > C and abs(ax - 0.024) < 0.003 and 0.912 < y < 1.0: return "fly"
            if x > C and near_line(P, [C + 0.024, 0.912, z], [C + 0.004, 0.890, z]): return "fly"
            # front pocket opening: curve from the waist at |x| 0.075 to the side at y 0.915
            u = (1.0 - y) / 0.085
            if 0 < u < 1 and abs(ax - (0.075 + 0.085 * u ** 0.75)) < 0.0034: return "pocket"
        if z < -0.03:
            if ax < 0.0028: return "seam"                                     # centre back
            yk = 0.958 - 0.030 * (1 - min(ax / 0.13, 1))                       # yoke: V down to the centre
            if abs(y - yk) < 0.0032: return "yoke"
            # back pockets on the cheeks
            px0, px1, py0, py1 = 0.030, 0.112, 0.872, yk - 0.008
            if px0 - 0.0035 < ax < px1 + 0.0035 and py0 - 0.004 < y < py1 + 0.0035:
                bot = py0 + 0.014 * min(1.0, abs((ax - (px0 + px1) / 2) / ((px1 - px0) / 2)))   # pointed bottom (down at the centre)
                if y > bot - 0.0032 and (abs(ax - px0) < 0.0032 or abs(ax - px1) < 0.0032 or abs(y - py1) < 0.0032 or abs(y - bot) < 0.0034):
                    return "pocket"
                if y < bot - 0.003: return None
        if abs(z + 0.012) < 0.0035 and ax > 0.15: return "side"
    if part == "leg":
        ph = leg_phi(P)
        if abs(ph - 90) < 4.5: return "side"
        if abs(ph - 270) < 4.0 and y < 0.84: return "inseam"
    return None


def shorts_col(part, P, N, b):
    x, y, z = P
    if part == "leg" and y < SHORTS_HEM + 0.024:                             # rolled cuff
        if y < SHORTS_HEM + 0.004: return NAVY[4]
        if abs(y - (SHORTS_HEM + 0.018)) < 0.0026: return NAVY[3]
        return lvl([NAVY[0], NAVY[1], NAVY[2]], b + 0.05, (0.60, 0.42))
    tag = garment_lines(part, P, SHORTS_HEM)
    if tag in ("seam", "fly", "pocket", "yoke", "inseam"): return NAVY[4]
    if tag == "side": return NAVY[3]
    if part == "pelvis" and z < -0.03 and y < 0.90: b -= 0.06                # under-curve of the butt
    return lvl(NAVY, b, NV_TH)


def jeans_col(part, P, N, b):
    x, y, z = P
    if part == "leg":
        ph = leg_phi(P)
        if y < JEANS_HEM + 0.036:                                            # rolled cuff, stitched
            if y < JEANS_HEM + 0.004: return NAVY[4]
            if abs(y - (JEANS_HEM + 0.030)) < 0.0026: return NAVY[4]
            if abs(y - (JEANS_HEM + 0.010)) < 0.0029: return STITCH
            return lvl([DENIM_LT, NAVY[0], NAVY[1]], b, (0.62, 0.45))
        if (ph < 45 or ph > 315) and 0.58 < y < 0.80: b += 0.12               # thigh fade
        if (ph < 40 or ph > 320) and 0.44 < y < 0.52: b += 0.08               # knee fade
        if 120 < ph < 240 and 0.46 < y < 0.50: b -= 0.10                      # back of the knee
    tag = garment_lines(part, P, JEANS_HEM)
    if tag == "seam": return NAVY[4]
    if tag in ("fly", "pocket", "yoke"): return STITCH
    if tag == "side": return STITCH_D
    if tag == "inseam": return NAVY[4]
    if part == "pelvis" and z < -0.03 and y < 0.90: b -= 0.06
    c = lvl(NAVY, b, (0.78, 0.58, 0.42, 0.28))
    return DENIM_LT if b > 0.90 else c


def vertex_normals(M, parts):
    n = np.zeros((len(M.V), 3))
    for f in M.F:
        if f["part"] not in parts: continue
        P = [M.V[v] for v in f["v"]]; fn = np.cross(P[1] - P[0], P[2] - P[0])
        for v in f["v"]: n[v] += fn
    l = np.linalg.norm(n, axis=1); l[l == 0] = 1
    return n / l[:, None]


def bary(A, q):
    a, b, c = A; v0, v1, v2 = b - a, c - a, q - a
    d = v0[0] * v1[1] - v1[0] * v0[1]
    if abs(d) < 1e-9: return np.array([1, 0, 0.]), False, 99
    l1 = (v2[0] * v1[1] - v1[0] * v2[1]) / d; l2 = (v0[0] * v2[1] - v2[0] * v0[1]) / d
    l = np.array([1 - l1 - l2, l1, l2])
    if l.min() >= -1e-6: return l, True, 0.0
    best = None
    for i, j in ((0, 1), (1, 2), (2, 0)):
        p0, p1 = A[i], A[j]; e = p1 - p0; t = float(np.clip(np.dot(q - p0, e) / (np.dot(e, e) + 1e-12), 0, 1))
        cp = p0 + e * t; d2 = float(np.linalg.norm(q - cp))
        if best is None or d2 < best[0]: ll = np.zeros(3); ll[i] = 1 - t; ll[j] = t; best = (d2, ll)
    return best[1], False, best[0]


def paint(M, opt, path):
    img = np.zeros((TH, TW, 3), np.uint8); img[:] = NAVY[3]
    pri = np.zeros((TH, TW), np.int8)
    parts = ("leg", "legcap", "pelvis", "band")
    VN = vertex_normals(M, parts)                      # one smooth normal field: band -> pelvis -> legs (no shading step)
    bt = M.attr.get("bt", {})
    for f in M.F:
        if f["part"] not in parts: continue
        vs, uvs = f["v"], f["uv"]; P = [M.V[v] for v in vs]
        A = np.array(uvs, float); x0, y0 = np.floor(A.min(0) - 2).astype(int); x1, y1 = np.ceil(A.max(0) + 2).astype(int)
        for py in range(max(y0, 0), min(y1, TH)):
            for px in range(max(x0, 0), min(x1, TW)):
                l, inside, dist = bary(A, np.array([px + 0.5, py + 0.5]))
                if not inside and dist > 1.6: continue
                pr = 2 if inside else 1
                if pri[py, px] >= pr: continue
                Pq = sum(l[k] * P[k] for k in range(3))
                Nq = sum(l[k] * VN[vs[k]] for k in range(3)); Nq /= np.linalg.norm(Nq) + 1e-12
                at = {}
                if all(v in bt for v in vs): at["bt"] = sum(l[k] * bt[vs[k]] for k in range(3))
                img[py, px] = shade(opt, f["part"], Pq, Nq, at); pri[py, px] = pr
    Image.fromarray(img).save(path)


def run(opt):
    M = build(opt)
    tex = os.path.join(ROOT, "tex", f"lower2_{opt}.png")
    paint(M, opt, tex)
    faces = []
    for f in M.F:
        uv = f["uv"] if f["mat"] in (MAT_TEX0, MAT_EYES, MAT_MOUTH) else [[u / TW, 1 - v / TH] for u, v in f["uv"]]
        faces.append({"v": f["v"], "uv": uv, "mat": f["mat"], "part": f["part"]})
    out = {"centre_x": C, "verts": [list(map(float, p)) for p in M.V], "weights": M.W, "faces": faces, "bones": bones(),
           "mats": [["waitress_body", os.path.join(ASSET, "ST1AT_40.png"), True],
                    ["waitress_lower", os.path.abspath(tex), False],
                    ["waitress_face_eyes", os.path.abspath(os.path.join(ROOT, "tex", "face_eyes.png")), False],
                    ["waitress_face_mouth", os.path.abspath(os.path.join(ROOT, "tex", "face_mouth.png")), False]]}
    json.dump(out, open(os.path.join(ROOT, "ref", f"build2_{opt}.json"), "w"))
    print(f"GEOM2 {opt}: verts {len(M.V)} tris {len(M.F)} face tris {sum(1 for f in M.F if f['part'] == 'face')}")


if __name__ == "__main__":
    for o in (["B", "C"] if len(sys.argv) < 2 or sys.argv[1] == "all" else [sys.argv[1]]):
        run(o)
