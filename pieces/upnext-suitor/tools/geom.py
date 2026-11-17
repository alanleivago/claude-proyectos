"""Suitor (Artillery rip, MML1) rebuild.  python -I tools/geom.py [opt|all]
coords (like the waitress): x = his left, y up, z = his front, metres, feet on y = 0, centre x = 0.
 - drops the backpack (torso back wall rebuilt + a waist ring), the holster / gun, the hip skirt piece and the pelvis filler
 - arms abducted ABD deg about the shoulder (no longer touching the hips), weights blended at elbow / wrist / shoulder
 - new lower body (waitress topology): torso hem -> mid ring -> hip ring -> pelvis + box-ish trouser legs over the boots
 - new sweater texture (torso, sleeves, collar) per colour option, black trousers + belt texture, skin recoloured
 - head faces split into an eyes and a mouth region for the 16x4 expression atlases (his face UVs are mirrored at u=28 px;
   the cells hold both halves: screen-left = texture as is, screen-right = mirrored)
 -> ref/build_<opt>.json, tex/body.png, tex/sweater_<opt>.png, tex/lower.png"""
import json, math, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
ASSET = os.path.abspath(os.path.join(ROOT, "..", "..", "assets", "artillery"))
RAW = json.load(open(os.path.join(ROOT, "ref", "orig_raw.json")))
HEIGHT = 1.82
HEIGHT_OUT = 1.86                   # a touch taller than the waitress (1.75)
Y0, Y1 = -38.05, 26.15
SC = HEIGHT / (Y1 - Y0)
cvt = lambda p: np.array([-p[0] * SC, (p[1] - Y0) * SC, -p[2] * SC])
V0 = np.array([cvt(p) for p in RAW["verts"]])
F0 = RAW["faces"]
TW, TH = 256, 128
PX = 175.0

EYE_RECT = (5, 22, 28, 46)            # px in the body texture: half face (u 28 = face centre), brows + eyes + blush band
MOUTH_RECT = (17, 52, 28, 64)
UC = 28.0
FACE_COLS, FACE_ROWS = 16, 4

# ------------------------------------------------------------------ parts
comps = {}
for i, f in enumerate(F0): comps.setdefault(f["comp"], []).append(i)
cverts = lambda fl: sorted({v for i in fl for v in F0[i]["v"]})
part_of = {}
for k, fl in comps.items():
    P = V0[cverts(fl)]; mn, mx = P.min(0), P.max(0); n = len(fl)
    if n == 67: nm = "head"
    elif n == 3: nm = "nose" if mx[1] < 1.65 else "spike"
    elif n == 6: nm = "neck"
    elif n == 26: nm = "torso"
    elif n == 10 and mn[1] > 1.0: nm = "uparm"
    elif n == 10: nm = "hipskirt"
    elif n == 16: nm = "filler"
    elif n == 22 and mn[1] < 0.05: nm = "leg"
    elif n == 22 and (mx[0] - mn[0]) < 0.07: nm = "gun"
    elif n == 22: nm = "forearm"
    else: raise SystemExit(f"unknown part n={n}")
    part_of[k] = nm
part_comps = {}
for k, nm in part_of.items(): part_comps.setdefault(nm, []).append(k)
assert len(part_comps["uparm"]) == 2 and len(part_comps["forearm"]) == 2 and len(part_comps["leg"]) == 2, part_comps

ABD = 9.0
SHOULDER = np.array([0.181, 1.379, -0.023])           # left; right = mirrored
ELBOW_Y, WRIST_Y = 1.134, 0.872


def side_of(p): return "L" if p[0] > 0 else "R"


def rotz(p, piv, deg):
    a = math.radians(deg); q = p - piv
    return piv + np.array([q[0] * math.cos(a) - q[1] * math.sin(a), q[0] * math.sin(a) + q[1] * math.cos(a), q[2]])


def arm_pose(p, s):
    piv = SHOULDER * np.array([1 if s == "L" else -1, 1, 1])
    return rotz(p, piv, ABD if s == "L" else -ABD)


# boot: faces of the leg comps using only verts below the upper-leg ring
BOOT_TOP_Y = (-31.15 - Y0) * SC
BOOT_SHRINK = 0.90


def boot_pos(v):
    p = V0[v].copy()
    if abs(p[1] - BOOT_TOP_Y) < 1e-4:                  # boot top ring: pulled in so the trouser hem covers it
        ring = [u for u in range(len(V0)) if abs(V0[u][1] - BOOT_TOP_Y) < 1e-4 and np.sign(V0[u][0]) == np.sign(p[0])]
        c = V0[ring].mean(0); p = c + (p - c) * np.array([BOOT_SHRINK, 1, BOOT_SHRINK])
    return p


# ------------------------------------------------------------------ mesh
class Mesh:
    def __init__(s): s.V, s.W, s.F, s.key, s.attr = [], [], [], {}, {}

    def vert(s, key, p, w):
        if key in s.key: return s.key[key]
        s.key[key] = len(s.V); s.V.append(np.array(p, float)); s.W.append(w); return s.key[key]

    def face(s, vs, uvs, mat, part, inside=None, outward=True, extra=None):
        if inside is not None:
            P = [s.V[v] for v in vs]
            n = np.cross(P[1] - P[0], P[2] - P[0])
            if len(P) == 4: n = n + np.cross(P[2] - P[0], P[3] - P[0])
            g = np.mean(P, 0)
            if (np.dot(n, g - inside(g)) < 0) == outward: vs, uvs = vs[::-1], uvs[::-1]
        vs, uvs = list(vs), [list(map(float, u)) for u in uvs]
        for t in range(1, len(vs) - 1):
            f = {"v": [vs[0], vs[t], vs[t + 1]], "uv": [uvs[0], uvs[t], uvs[t + 1]], "mat": mat, "part": part}
            if extra: f.update(extra)
            s.F.append(f)


MAT_BODY, MAT_SWEATER, MAT_LOWER, MAT_EYES, MAT_MOUTH = 0, 1, 2, 3, 4
px2uv = lambda u, v: [u / 256.0, 1 - v / 128.0]


# ------------------------------------------------------------------ face split (UV-space clipping, from the waitress)
def clip_half(poly, axis, val, keep_less):
    out = []
    for i in range(len(poly)):
        a, b = poly[i], poly[(i + 1) % len(poly)]
        ia = (a[0][axis] <= val) if keep_less else (a[0][axis] >= val)
        ib = (b[0][axis] <= val) if keep_less else (b[0][axis] >= val)
        if ia: out.append(a)
        if ia != ib:
            t = (val - a[0][axis]) / (b[0][axis] - a[0][axis]); out.append((a[0] + (b[0] - a[0]) * t, None))
    return out


def poly_area(P): return 0.5 * sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P)))


def split_face(uvpx, rect):
    x0, y0, x1, y1 = rect
    tri = [(np.array(u, float), None) for u in uvpx]
    ins = clip_half(clip_half(clip_half(clip_half(tri, 0, x0, False), 0, x1, True), 1, y0, False), 1, y1, True)
    outs = [clip_half(tri, 1, y0, True), clip_half(tri, 1, y1, False)]
    mid = clip_half(clip_half(tri, 1, y0, False), 1, y1, True)
    outs += [clip_half(mid, 0, x0, True), clip_half(mid, 0, x1, False)]
    good = lambda p: len(p) >= 3 and abs(poly_area([q[0] for q in p])) > 1e-6
    return [[q[0] for q in ins]] if good(ins) else [], [[q[0] for q in p] for p in outs if good(p)]


def cell_uv(q, rect, sx):
    """uv of a face point q (px) inside a mirrored-half rect; sx = +1 for his left side (screen right, mirrored half)"""
    x0, y0, x1, y1 = rect; hw = UC - x0
    cx = hw - (UC - q[0]) if sx < 0 else hw + (UC - q[0])
    return [cx / (2 * hw) / FACE_COLS, 1 - (q[1] - y0) / (y1 - y0) / FACE_ROWS]


def add_head_face(M, vs, uvs, rect_list):
    uvpx = [np.array([u * 256.0, (1 - v) * 128.0]) for u, v in uvs]
    P3 = [V0[v] for v in vs]
    sx = 1 if np.mean([p[0] for p in P3]) > 0 else -1
    A = np.array([[uvpx[1][0] - uvpx[0][0], uvpx[2][0] - uvpx[0][0]], [uvpx[1][1] - uvpx[0][1], uvpx[2][1] - uvpx[0][1]]])
    if abs(np.linalg.det(A)) < 1e-9: return False
    polys = [(None, [u.copy() for u in uvpx])]; hit = False
    for mat, rect in rect_list:
        nxt = []
        for m, poly in polys:
            if m is not None: nxt.append((m, poly)); continue
            x = [p[0] for p in poly]; y = [p[1] for p in poly]
            if max(x) <= rect[0] or min(x) >= rect[2] or max(y) <= rect[1] or min(y) >= rect[3]: nxt.append((m, poly)); continue
            ins, outs = split_face(poly, rect); hit = True
            nxt += [(mat, p) for p in ins] + [(None, p) for p in outs]
        polys = []
        for m, p in nxt:
            for i in range(1, len(p) - 1): polys.append((m, [p[0], p[i], p[i + 1]]))
    if not hit: return False
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
    rects = dict(rect_list)
    for m, p in polys:
        ring = []
        for i in range(3):
            a, b = p[i], p[(i + 1) % 3]; ring.append(a); ex = []
            for r in allp:
                ab = b - a; t = np.dot(r - a, ab) / (np.dot(ab, ab) + 1e-12)
                if 1e-4 < t < 1 - 1e-4 and np.linalg.norm(a + ab * t - r) < 1e-5: ex.append((t, r))
            ring += [r for _, r in sorted(ex, key=lambda e: e[0])]
        uv = [px2uv(*q) for q in ring] if m is None else [cell_uv(q, rects[m], sx) for q in ring]
        ids = [vid(q) for q in ring]
        for i in range(1, len(ids) - 1):
            M.F.append({"v": [ids[0], ids[i], ids[i + 1]], "uv": [uv[0], uv[i], uv[i + 1]], "mat": MAT_BODY if m is None else m,
                        "part": "head" if m is None else "face"})
    return True


# ------------------------------------------------------------------ weights of kept parts
def arm_weight(nm, p0, s):
    """p0 = position before the abduction"""
    y = p0[1]; U, Fo, Hd, Cl = "UpperArm." + s, "Forearm." + s, "Hand." + s, "Clavicle." + s
    if nm == "uparm":
        if y > 1.40: return {U: 0.55, Cl: 0.45}
        if y > 1.33: return {U: 0.85, Cl: 0.15}
        if y < 1.15: return {U: 0.5, Fo: 0.5}
        return {U: 1.0}
    if y > 1.12: return {U: 0.5, Fo: 0.5}
    if y > WRIST_Y + 0.01: return {Fo: 1.0}
    if y > WRIST_Y - 0.03: return {Fo: 0.5, Hd: 0.5}
    return {Hd: 1.0}


# ------------------------------------------------------------------ build
def zipper(A, B, angA, angB):
    tris = []; i = j = 0; nA, nB = len(A), len(B)
    aA = angA + [angA[0] + 360]; aB = angB + [angB[0] + 360]
    while i < nA or j < nB:
        if j < nB and (i == nA or aB[j + 1] - aA[i] <= aA[i + 1] - aB[j]):
            tris.append((A[i % nA], B[j % nB], B[(j + 1) % nB])); j += 1
        else:
            tris.append((A[i % nA], B[j % nB], A[(i + 1) % nA])); i += 1
    return tris


def ang(p, cz=0.0): return math.degrees(math.atan2(p[0], p[2] - cz)) % 360          # 0 front, 90 his left


# torso corner verts of the rip (by original index)
TV = {}
for grp, vs in (("top", (0, 1, 2, 3)), ("sh", (4, 5, 16, 18)), ("bo", (13, 15, 17, 19))):
    for v in vs: TV[f"{grp}_{'F' if V0[v][2] > 0 else 'B'}{'L' if V0[v][0] > 0 else 'R'}"] = v
assert len(TV) == 12, TV

HIP = {"F": (0.150, 0.855, 0.098), "S": (0.172, 0.845, -0.004), "B": (0.152, 0.850, -0.112)}
# leg rings: y, lateral centre, centre z, rx, rz  (superellipse n=4, vertices at 45 deg: box-ish like the rip's legs)
RINGS = [
    (0.625, 0.083, -0.006, 0.072, 0.100),
    (0.520, 0.086, -0.010, 0.070, 0.098),
    (0.420, 0.087, -0.012, 0.066, 0.094),
    (0.375, 0.087, -0.013, 0.065, 0.093),
    (0.300, 0.088, -0.018, 0.068, 0.098),
    (0.215, 0.089, -0.026, 0.078, 0.108),
    (0.165, 0.089, -0.028, 0.082, 0.112),
]
PHI = [270, 315, 45, 90, 135, 225]
LAB = ["I", "FI", "FO", "O", "BO", "BI"]
SQ = 4.0
HEM_Y = RINGS[-1][0]


def se(c): return math.copysign(abs(c) ** (2 / SQ), c)


def ring_pt(k, j, s):
    y, off, cz, rx, rz = RINGS[k]
    p = math.radians(PHI[j])
    if k == 0 and math.cos(p) < 0: rz *= 1.06                       # a little seat
    return np.array([s * (off + rx * se(math.sin(p))), y, cz + rz * se(math.cos(p))])


def leg_axis(y):
    ys = [r[0] for r in RINGS]; y = min(max(y, ys[-1]), ys[0])
    for k in range(len(RINGS) - 1):
        if RINGS[k + 1][0] <= y <= RINGS[k][0]:
            t = (RINGS[k][0] - y) / (RINGS[k][0] - RINGS[k + 1][0])
            return np.array(RINGS[k][1:]) + (np.array(RINGS[k + 1][1:]) - np.array(RINGS[k][1:])) * t
    return np.array(RINGS[0][1:])


def leg_weight(k, j, sn):
    T, Cf, Ft = "Thigh." + sn, "Calf." + sn, "Foot." + sn
    if k == 0: return {T: 0.5, "Pelvis": 0.5} if LAB[j] in ("FO", "O", "BO") else {T: 0.75, "Pelvis": 0.25}
    if k in (1, 2): return {T: 1.0}
    if k == 3: return {T: 0.5, Cf: 0.5}
    if k == 4: return {Cf: 1.0}
    if k == 5: return {Cf: 0.85, Ft: 0.15}
    return {Cf: 0.7, Ft: 0.3}


def planar_uv(region, P, axes, origin, scale=PX):
    """px uv from a planar projection: region = (u0, v0) px, axes = (axis_u, sign_u, axis_v, sign_v)"""
    au, su, av, sv = axes
    return (region[0] + su * (P[au] - origin[0]) * scale, region[1] + sv * (P[av] - origin[1]) * scale)


def build(opt):
    M = Mesh()
    # ---- head, hair spikes, nose (body texture; face split into the expression materials)
    for nm in ("head", "spike", "nose"):
        for k in part_comps[nm]:
            for i in comps[k]:
                f = F0[i]
                if nm == "head" and add_head_face(M, f["v"], f["uv"], [(MAT_EYES, EYE_RECT), (MAT_MOUTH, MOUTH_RECT)]): continue
                ids = [M.vert(("o", v), V0[v], {"Head": 1.0}) for v in f["v"]]
                M.F.append({"v": ids, "uv": [list(u) for u in f["uv"]], "mat": MAT_BODY, "part": "head" if nm != "nose" else "nose"})
    # ---- neck (sweater collar: own uv in the sweater sheet)
    for k in part_comps["neck"]:
        for i in comps[k]:
            f = F0[i]; ids, uvs = [], []
            for v in f["v"]:
                p = V0[v]; w = {"Neck": 0.6, "Chest": 0.4} if p[1] < 1.44 else {"Neck": 0.75, "Head": 0.25}
                ids.append(M.vert(("o", v), p, w))
                uvs.append((230 + p[0] * PX, 40 + (1.49 - p[1]) * PX))
            M.F.append({"v": ids, "uv": [list(map(float, u)) for u in uvs], "mat": MAT_SWEATER, "part": "collar"})
    # ---- arms (abducted, both original sides)
    for nm in ("uparm", "forearm"):
        for k in part_comps[nm]:
            for i in comps[k]:
                f = F0[i]; P0 = [V0[v] for v in f["v"]]
                s = side_of(np.mean(P0, 0))
                sleeve = nm == "uparm" or all(p[1] > WRIST_Y - 0.002 for p in P0)
                ids = [M.vert(("o", v), arm_pose(V0[v], s), arm_weight(nm, V0[v], s)) for v in f["v"]]
                if sleeve:
                    uvs = [sleeve_uv(nm, p, P0, s) for p in P0]
                    M.F.append({"v": ids, "uv": [list(map(float, u)) for u in uvs], "mat": MAT_SWEATER, "part": "sleeve" if nm == "uparm" else "cuff",
                                "side": s})
                else:
                    M.F.append({"v": ids, "uv": [list(u) for u in f["uv"]], "mat": MAT_BODY, "part": "glove"})
    # ---- boots
    for k in part_comps["leg"]:
        for i in comps[k]:
            f = F0[i]
            if any(V0[v][1] > BOOT_TOP_Y + 1e-4 for v in f["v"]): continue
            s = side_of(np.mean([V0[v] for v in f["v"]], 0))
            ids = []
            for v in f["v"]:
                p = boot_pos(v); w = {"Foot." + s: 1.0} if p[1] < 0.14 else {"Foot." + s: 0.6, "Calf." + s: 0.4}
                ids.append(M.vert(("o", v), p, w))
            M.F.append({"v": ids, "uv": [list(u) for u in f["uv"]], "mat": MAT_BODY, "part": "shoe"})
    build_torso(M)
    build_lower(M)
    return M


def sleeve_uv(nm, p, P0, s):
    """planar uv per face of the arm boxes (pre-abduction coords, mirrored |x|) in the sweater sheet"""
    a, b, c = P0; n = np.cross(b - a, c - a); n = n / (np.linalg.norm(n) + 1e-12)
    ax = abs(p[0]); cx = 0.196
    (bu, bv), top = ((0, 72), 1.44) if nm == "uparm" else ((108, 76), 1.15)
    k = int(np.argmax(np.abs(n)))
    if k == 1: return (88 + (ax - cx + 0.06) * PX, 74 + (p[2] + 0.08) * PX)          # shoulder cap
    if k == 2: return (bu + (0 if n[2] > 0 else 22) + (ax - cx + 0.06) * PX, bv + (top - p[1]) * PX)
    outer = (n[0] > 0) == (s == "L")
    return (bu + (44 if outer else 66) + (p[2] + 0.08) * PX, bv + (top - p[1]) * PX)


def build_torso(M):
    tv = {k: V0[v] for k, v in TV.items()}
    cw = lambda y: ({"Chest": 1.0} if y > 1.30 else {"Chest": 0.65, "Spine": 0.35} if y > 1.18 else {"Spine": 0.7, "Chest": 0.3})
    P = {}
    for k, p in tv.items(): P[k] = M.vert(("t", k), p, cw(p[1]))
    # bottom ring with centre points (6): FC FL BL BC BR FR ; mid ring (6) ; shoulder ring (4 + centres)
    def mid(a, b): return (M.V[a] + M.V[b]) / 2
    FCb = M.vert(("t", "bo_FC"), mid(P["bo_FL"], P["bo_FR"]), cw(1.0)); BCb = M.vert(("t", "bo_BC"), mid(P["bo_BL"], P["bo_BR"]), cw(1.0))
    R0 = [FCb, P["bo_FL"], P["bo_BL"], BCb, P["bo_BR"], P["bo_FR"]]
    FCs = M.vert(("t", "sh_FC"), mid(P["sh_FL"], P["sh_FR"]) + [0, 0, 0.004], cw(1.4)); BCs = M.vert(("t", "sh_BC"), mid(P["sh_BL"], P["sh_BR"]), cw(1.4))
    R2 = [FCs, P["sh_FL"], P["sh_BL"], BCs, P["sh_BR"], P["sh_FR"]]
    R1 = []
    for i, (a, b) in enumerate(zip(R0, R2)):
        p = M.V[a] * 0.55 + M.V[b] * 0.45; p = p * np.array([1.03, 1, 1.0])
        R1.append(M.vert(("t", "mid", i), p, cw(p[1])))
    M.attr["waist"] = R0
    ins = lambda g: np.array([0.0, g[1], -0.002])
    for ra, rb in ((R0, R1), (R1, R2)):
        for i in range(6):
            i2 = (i + 1) % 6
            q = [ra[i], ra[i2], rb[i2], rb[i]]
            M.face(q, [torso_uv(M.V[v], q) for v in q], MAT_SWEATER, "torso", ins)
    # caps (original topology): front slope, back slope, top, shoulder sides
    caps = [("sh_FC", "sh_FL", "top_FL"), ("sh_FC", "top_FL", "top_FR"), ("sh_FC", "top_FR", "sh_FR"),
            ("sh_BC", "sh_BL", "top_BL"), ("sh_BC", "top_BL", "top_BR"), ("sh_BC", "top_BR", "sh_BR"),
            ("top_FL", "top_BL", "top_BR"), ("top_FL", "top_BR", "top_FR"),
            ("sh_FL", "sh_BL", "top_BL"), ("sh_FL", "top_BL", "top_FL"), ("sh_FR", "sh_BR", "top_BR"), ("sh_FR", "top_BR", "top_FR")]
    for t in caps:
        vs = [P[k] if k in P else (FCs if k == "sh_FC" else BCs) for k in t]
        M.face(vs, [cap_uv(M.V[v], vs) for v in vs], MAT_SWEATER, "torso", lambda g: np.array([0.0, 1.30, -0.002]))


def torso_uv(p, q):
    """mirrored half strip around the torso: u = arc from the front centre (approx by angle), v = height"""
    ax = abs(p[0]); z = p[2]
    a = math.degrees(math.atan2(ax, z + 0.002))           # 0 front .. 180 back
    w, d = 0.135, 0.082
    if a <= 58: arc = ax
    elif a >= 122: arc = w + 2 * d + (w - ax)
    else: arc = w + (d - z)
    return (40 + arc * PX * 0.85, 2 + (1.45 - p[1]) * PX)


def cap_uv(p, vs):
    return (226 + p[0] * PX, 2 + (p[2] + 0.09) * PX)


def build_lower(M):
    W_ = M.attr["waist"]                                     # FC FL BL BC BR FR (torso hem)
    angW = [ang(M.V[v]) for v in W_]; angW[0], angW[3] = 0.0, 180.0
    order = [("F", "C"), ("F", "L"), ("S", "L"), ("B", "L"), ("B", "C"), ("B", "R"), ("S", "R"), ("F", "R")]
    H = {}
    for c, s in order:
        if s == "C": continue
        o, y, z = HIP[c]; H[(c, s)] = M.vert(("hip", c, s), [o if s == "L" else -o, y, z], {"Pelvis": 1.0})
    for c in "FB": H[(c, "C")] = M.vert(("hip", c, "C"), (M.V[H[(c, "L")]] + M.V[H[(c, "R")]]) / 2 + [0, 0, 0.006 if c == "F" else -0.004], {"Pelvis": 1.0})
    HR = [H[k] for k in order]
    angH = [ang(M.V[v]) for v in HR]; angH[0], angH[4] = 0.0, 180.0
    def waist_at(a):
        for i in range(6):
            p, q = M.V[W_[i]], M.V[W_[(i + 1) % 6]]
            a0, a1 = angW[i], (angW[(i + 1) % 6] if i < 5 else 360.0)
            if a0 <= a <= a1: return p + (q - p) * ((a - a0) / ((a1 - a0) or 1))
        return M.V[W_[0]]
    MID = []
    for i, a in enumerate(angH):
        w = waist_at(a); h = M.V[HR[i]]; m = w * 0.5 + h * 0.5
        m = np.array([m[0] * 1.02, m[1], m[2] * 1.02])
        MID.append(M.vert(("mid", i), m, {"Spine": 0.45, "Pelvis": 0.55}))
    bt = M.attr.setdefault("bt", {})
    for v in W_: bt[v] = 0.0
    for v in MID: bt[v] = 0.5
    for v in HR: bt[v] = 1.0
    band_in = lambda g: np.array([0.0, g[1], -0.005])
    UVB = band_uv(M, W_, MID, HR, angW, angH)
    for a, b, c in zipper(W_, MID, angW, angH):
        M.face([a, b, c], [UVB[v] for v in (a, b, c)], MAT_LOWER, "band", band_in)
    for i in range(8):
        i2 = (i + 1) % 8; q = [MID[i], MID[i2], HR[i2], HR[i]]
        M.face(q, [UVB[v] for v in q], MAT_LOWER, "band", band_in)
    # legs
    UV = uv_layout(); leg = {}
    for s, sn in ((1, "L"), (-1, "R")):
        for k in range(len(RINGS)):
            for j in range(6): leg[(sn, k, j)] = M.vert(("leg", sn, k, j), ring_pt(k, j, s), leg_weight(k, j, sn))
    for sn in "LR":
        s = 1 if sn == "L" else -1
        ins = lambda g, s=s: (lambda a: np.array([s * a[0], g[1], a[1]]))(leg_axis(g[1]))
        for k in range(len(RINGS) - 1):
            for j in range(6):
                j2 = (j + 1) % 6
                vs = [leg[(sn, k, j)], leg[(sn, k, j2)], leg[(sn, k + 1, j2)], leg[(sn, k + 1, j)]]
                uvs = [UV["leg"][(k, j)], UV["leg"][(k, j + 1)], UV["leg"][(k + 1, j + 1)], UV["leg"][(k + 1, j)]]
                M.face(vs, uvs, MAT_LOWER, "leg", ins)
    # pelvis
    pel_in = lambda g: np.array([0.0, 0.74, -0.01])
    L = lambda sn, lab: leg[(sn, 0, LAB.index(lab))]
    CF = M.vert(("pel", "CF"), [0, 0.640, 0.088], {"Pelvis": 0.8, "Thigh.L": 0.1, "Thigh.R": 0.1})
    CC = M.vert(("pel", "CC"), [0, 0.600, -0.008], {"Pelvis": 0.5, "Thigh.L": 0.25, "Thigh.R": 0.25})
    CB = M.vert(("pel", "CB"), [0, 0.640, -0.112], {"Pelvis": 0.8, "Thigh.L": 0.1, "Thigh.R": 0.1})
    PU = UV["pel"]
    def F_(vs, isl): M.face(vs, [PU[isl](M.V[v]) for v in vs], MAT_LOWER, "pelvis", pel_in)
    for sn in "LR":
        F_([H[("F", sn)], H[("S", sn)], L(sn, "O"), L(sn, "FO")], "side")
        F_([H[("S", sn)], H[("B", sn)], L(sn, "BO"), L(sn, "O")], "side")
    loop_f = [H[("F", "R")], H[("F", "C")], H[("F", "L")], L("L", "FO"), L("L", "FI"), L("R", "FI"), L("R", "FO")]
    for a, b in zip(loop_f, loop_f[1:] + loop_f[:1]): F_([a, b, CF], "front")
    loop_b = [H[("B", "L")], H[("B", "C")], H[("B", "R")], L("R", "BO"), L("R", "BI"), L("L", "BI"), L("L", "BO")]
    for a, b in zip(loop_b, loop_b[1:] + loop_b[:1]): F_([a, b, CB], "back")
    loop_c = [L("L", "FI"), L("L", "I"), L("L", "BI"), L("R", "BI"), L("R", "I"), L("R", "FI")]
    for a, b in zip(loop_c, loop_c[1:] + loop_c[:1]): F_([a, b, CC], "crotch")


def band_uv(M, W_, MID, HR, angW, angH):
    U0, VW, VM, VH = 108, 2, 16, 32
    def arc(ids, angs):
        half = [i for i, a in enumerate(angs) if a <= 180.0 + 1e-6]; d = {half[0]: 0.0}
        for a, b in zip(half, half[1:]): d[b] = d[a] + float(np.linalg.norm(M.V[ids[b]] - M.V[ids[a]]))
        for i in range(len(ids)):
            if i not in d:
                p = M.V[ids[i]] * [-1, 1, 1]; j = min(half, key=lambda j: np.linalg.norm(M.V[ids[j]] - p)); d[i] = d[j]
        return d
    t = {}
    for ids, angs, vv in ((W_, angW, VW), (MID, angH, VM), (HR, angH, VH)):
        d = arc(ids, angs)
        for i, v in enumerate(ids): t[v] = (U0 + d[i] * PX * 0.8, vv)
    return t


def uv_layout():
    UV = {"leg": {}}
    for k in range(len(RINGS)):
        pts = [ring_pt(k, j % 6, 1) for j in range(7)]; d = [0.0]
        for a, b in zip(pts, pts[1:]): d.append(d[-1] + float(np.linalg.norm(b - a)))
        P = d[-1]
        for j in range(7): UV["leg"][(k, j)] = (52 + (d[j] - P / 2) * PX * 0.62, 2 + (RINGS[0][0] + 0.004 - pts[j][1]) * 255)
    UV["pel"] = {
        "front": lambda p: (106 + (p[0] + 0.17) * PX * 0.75, 50 + (0.87 - p[1]) * PX * 0.75),
        "back": lambda p: (160 + (p[0] + 0.17) * PX * 0.75, 50 + (0.87 - p[1]) * PX * 0.75),
        "side": lambda p: (106 + (0.12 - p[2]) * PX * 0.75, 84 + (0.87 - p[1]) * PX * 0.75),
        "crotch": lambda p: (180 + p[0] * PX, 92 + (0.1 - p[2]) * PX * 0.6),
    }
    return UV


def bones():
    def ar(p, s):
        p = np.array(p, float) * np.array([1 if s == "L" else -1, 1, 1]); return arm_pose(p, s)
    B = {}
    B["Pelvis"] = ([0, 0.80, -0.008], [0, 0.95, -0.008], None)
    B["Spine"] = ([0, 0.95, -0.008], [0, 1.13, -0.006], "Pelvis")
    B["Chest"] = ([0, 1.13, -0.006], [0, 1.41, -0.020], "Spine")
    B["Neck"] = ([0, 1.41, -0.020], [0, 1.47, -0.010], "Chest")
    B["Head"] = ([0, 1.47, -0.010], [0, 1.80, -0.010], "Neck")
    for s in ("L", "R"):
        m = 1 if s == "L" else -1
        sh = ar(SHOULDER, s); el = ar([0.196, ELBOW_Y, -0.022], s); wr = ar([0.197, WRIST_Y, -0.018], s); ht = ar([0.192, 0.74, -0.010], s)
        B["Clavicle." + s] = ([m * 0.03, 1.395, -0.020], sh, "Chest")
        B["UpperArm." + s] = (sh, el, "Clavicle." + s)
        B["Forearm." + s] = (el, wr, "UpperArm." + s)
        B["Hand." + s] = (wr, ht, "Forearm." + s)
        ank = [m * 0.090, 0.088, -0.026]
        B["Thigh." + s] = ([m * 0.086, 0.660, -0.008], [m * 0.088, 0.375, -0.013], "Pelvis")
        B["Calf." + s] = ([m * 0.088, 0.375, -0.013], ank, "Thigh." + s)
        B["Foot." + s] = (ank, [m * 0.092, 0.030, 0.190], "Calf." + s)
    return {k: {"head": list(map(float, h)), "tail": list(map(float, t)), "parent": p} for k, (h, t, p) in B.items()}


# ------------------------------------------------------------------ colours
HEX = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
SWEATERS = {   # 5-step ramps light -> dark
    "wine": ["#a8424f", "#8e3242", "#752638", "#5c1c2c", "#431420"],
    "forest": ["#5f8a4c", "#4a733d", "#3a5f33", "#2c4b29", "#1f361e"],
    "oat": ["#ece0c4", "#d9c7a3", "#c3ad87", "#a68f6c", "#856f54"],
}
OPTS = list(SWEATERS)
BLACK = [HEX(h) for h in ("#3a3a44", "#2c2c34", "#222229", "#19191e", "#111115")]
BELT = [HEX(h) for h in ("#985f38", "#7a4628", "#5e341e", "#3f2414")]
METAL = [HEX(h) for h in ("#e8e0e8", "#b8a8b8", "#807080")]


def lvl(pal, b, th):
    for c, t in zip(pal, th):
        if b > t: return c
    return pal[min(len(th), len(pal) - 1)]


TH5 = (0.74, 0.60, 0.44, 0.30)


def light(N): return 0.84 - 0.40 * abs(N[0]) ** 2.0 + 0.10 * max(N[1], 0) - 0.18 * max(-N[1], 0)


THS = (0.86, 0.68, 0.50, 0.33)          # sweater: lit fronts take the 2nd tone, only tops catch the 1st


def sweater_col(opt, part, P, N, attr):
    pal = [HEX(h) for h in SWEATERS[opt]]
    x, y, z = P; b = light(N)
    if part == "torso":
        if y < 1.085: return lvl(pal, b - 0.02 - (0.18 if int((abs(x) + 0.003) * 260) % 2 else 0.0), THS)   # ribbed hem
        if y > 1.38 and abs(x) < 0.07 and z > 0: b -= 0.10                                                 # under the collar
        if abs(N[0]) > 0.5 and y > 1.30: b -= 0.06
        knit = (int((abs(x) + 0.004) * 150) + int(y * 150)) % 2 == 0
        if knit and z > 0 and abs(x) < 0.11 and 1.12 < y < 1.36 and int((abs(x) + 0.004) * 75) % 3 == 1: b -= 0.07   # cable columns
        return lvl(pal, b, THS)
    if part == "collar":
        return lvl(pal, b - 0.04 - (0.16 if int((math.atan2(x, z) + 4) * 9) % 2 else 0.0), THS)
    if part in ("sleeve", "cuff"):
        if part == "cuff" and y < WRIST_Y + 0.045:                                                            # ribbed cuff
            return lvl(pal, b - 0.02 - (0.16 if int((z + 0.1) * 230 + abs(x) * 230) % 2 else 0.0), THS)
        if part == "sleeve" and y > 1.40: b -= 0.04
        return lvl(pal, b, THS)
    return pal[2]


def lower_col(part, P, N, attr):
    x, y, z = P; ax = abs(x); b = light(N)
    if part == "band":
        t = attr.get("bt", 0.5)
        if t < 0.28: return None                                         # sweater hem part of the band (painted by caller)
        if t < 0.33: return BLACK[4]
        if t < 0.62:                                                     # belt
            if z > 0 and ax < 0.022 and 0.36 < t < 0.59:                  # buckle
                if ax < 0.012 and 0.41 < t < 0.54: return BELT[1] if ax > 0.004 else METAL[2]
                return METAL[0] if (t < 0.40 or t > 0.55 or ax > 0.017) else METAL[1]
            if abs(t - 0.37) < 0.012 or abs(t - 0.57) < 0.012: return BELT[3]
            if any(abs(math.degrees(math.atan2(ax, z)) - a) < 4 for a in (55, 120, 160)): return BELT[3]   # belt loops edge
            return lvl(BELT, b + 0.04, (0.72, 0.52, 0.34))
        if z > 0 and ax < 0.003: return BLACK[4]
        return lvl(BLACK, b, TH5)
    if part == "leg":
        if y < HEM_Y + 0.018: return BLACK[4] if y < HEM_Y + 0.006 else lvl(BLACK, b - 0.10, TH5)
        ph = math.degrees(math.atan2(ax - leg_axis(y)[0], z - leg_axis(y)[1])) % 360
        if abs(ph - 90) < 5: return BLACK[3]                              # side seam
        if 0.36 < y < 0.40 and (ph > 120 and ph < 240): b -= 0.10         # back of the knee
        if (ph < 30 or ph > 330) and 0.33 < y < 0.43: b += 0.05           # knee
        return lvl(BLACK, b, TH5)
    if part == "pelvis":
        if z > 0.02 and ax < 0.003 and y > 0.66: return BLACK[4]          # fly
        if z > 0.02 and x > 0 and abs(ax - 0.026) < 0.003 and 0.70 < y < 0.84: return BLACK[3]
        if z < -0.03:
            if ax < 0.003: return BLACK[4]
            if 0.035 < ax < 0.115 and abs(y - 0.80) < 0.003: return BLACK[3]   # back pocket tops
        if z < -0.03 and y < 0.68: b -= 0.06
        return lvl(BLACK, b, TH5)
    return BLACK[2]


def band_sweater(opt, P, N, t):
    pal = [HEX(h) for h in SWEATERS[opt]]; b = light(N)
    return lvl(pal, b - 0.04 - (0.18 if int((abs(P[0]) + 0.003) * 260) % 2 else 0.0), THS)


# ------------------------------------------------------------------ painting
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


def paint(M, mat, fn, path, bg, smooth_parts):
    img = np.zeros((TH, TW, 3), np.uint8); img[:] = bg
    pri = np.zeros((TH, TW), np.int8)
    VN = vertex_normals(M, smooth_parts)
    bt = M.attr.get("bt", {})
    for f in M.F:
        if f["mat"] != mat: continue
        vs, uvs = f["v"], f["uv"]; P = [M.V[v] for v in vs]
        fnrm = np.cross(P[1] - P[0], P[2] - P[0]); fnrm /= np.linalg.norm(fnrm) + 1e-12
        A = np.array(uvs, float); x0, y0 = np.floor(A.min(0) - 2).astype(int); x1, y1 = np.ceil(A.max(0) + 2).astype(int)
        for py in range(max(y0, 0), min(y1, TH)):
            for px in range(max(x0, 0), min(x1, TW)):
                l, inside, dist = bary(A, np.array([px + 0.5, py + 0.5]))
                if not inside and dist > 1.6: continue
                pr = 2 if inside else 1
                if pri[py, px] >= pr: continue
                Pq = sum(l[k] * P[k] for k in range(3))
                if f["part"] in smooth_parts:
                    Nq = sum(l[k] * VN[vs[k]] for k in range(3)); Nq /= np.linalg.norm(Nq) + 1e-12
                else:
                    Nq = fnrm
                at = {}
                if all(v in bt for v in vs): at["bt"] = sum(l[k] * bt[vs[k]] for k in range(3))
                img[py, px] = fn(f["part"], Pq, Nq, at); pri[py, px] = pr
    Image.fromarray(img).save(path)


SKIN_MAP = {(200, 136, 96): HEX("#f2c8a2"), (176, 120, 72): HEX("#daa580"), (152, 96, 56): HEX("#bb8462"), (128, 72, 48): HEX("#94604a")}


def recolor_body(path):
    a = np.array(Image.open(os.path.join(ASSET, "Artillery_the_Digger.png")).convert("RGBA"))
    out = a.copy()
    for y in range(0, 80):
        for x in range(0, 108):
            c = tuple(int(v) for v in a[y, x, :3])
            if c in SKIN_MAP and a[y, x, 3] > 0: out[y, x, :3] = SKIN_MAP[c]
    Image.fromarray(out).save(path)


def run(opt, lower_done=[False]):
    M = build(opt)
    tex = os.path.join(ROOT, "tex")
    os.makedirs(tex, exist_ok=True)
    if not lower_done[0]:
        recolor_body(os.path.join(tex, "body.png"))
    sw = os.path.join(tex, f"sweater_{opt}.png")
    paint(M, MAT_SWEATER, lambda part, P, N, at: sweater_col(opt, part, P, N, at), sw, HEX(SWEATERS[opt][2]), ("torso", "collar"))
    lw = os.path.join(tex, f"lower_{opt}.png")
    def lfn(part, P, N, at):
        c = lower_col(part, P, N, at)
        return band_sweater(opt, P, N, at.get("bt", 0)) if c is None else c
    paint(M, MAT_LOWER, lfn, lw, BLACK[3], ("band", "pelvis", "leg"))
    faces = []
    for f in M.F:
        uv = f["uv"] if f["mat"] in (MAT_BODY, MAT_EYES, MAT_MOUTH) else [[u / TW, 1 - v / TH] for u, v in f["uv"]]
        faces.append({"v": f["v"], "uv": uv, "mat": f["mat"], "part": f["part"]})
    K = HEIGHT_OUT / HEIGHT                              # final size (the layout constants above are in 1.82 m units)
    B = bones()
    for b in B.values(): b["head"] = [c * K for c in b["head"]]; b["tail"] = [c * K for c in b["tail"]]
    out = {"centre_x": 0.0, "height": HEIGHT_OUT, "verts": [list(map(float, p * K)) for p in M.V], "weights": M.W, "faces": faces, "bones": B,
           "mats": [["suitor_body", os.path.abspath(os.path.join(tex, "body.png")), True],
                    ["suitor_sweater", os.path.abspath(sw), False],
                    ["suitor_lower", os.path.abspath(lw), False],
                    ["suitor_face_eyes", os.path.abspath(os.path.join(tex, "face_eyes.png")), False],
                    ["suitor_face_mouth", os.path.abspath(os.path.join(tex, "face_mouth.png")), False]]}
    json.dump(out, open(os.path.join(ROOT, "ref", f"build_{opt}.json"), "w"))
    lower_done[0] = True
    print(f"GEOM {opt}: verts {len(M.V)} tris {len(M.F)} face tris {sum(1 for f in M.F if f['part'] == 'face')}")


if __name__ == "__main__":
    for o in (OPTS if len(sys.argv) < 2 or sys.argv[1] == "all" else [sys.argv[1]]):
        run(o)
