"""Waitress rebuild (OBJ coords: x, y up, z front).  python -I tools/geom.py <A|B|C|all>
 - drops the tray, pie, tray arm and long skirt; re-poses the hanging arm 15 deg out (A-pose) and mirrors it
 - adds low-poly legs + pelvis (one closed 'pants' mesh joined to the torso hip ring), option A adds a pleated mini skirt
 - paints a 256x128 16-colour texture per option procedurally in 3D (no seams), palette taken from her CLUTs
 - writes ref/build_<opt>.json (mesh, per-loop uv, material, weights, bones) and tex/lower_<opt>.png"""
import json, math, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
D = json.load(open(os.path.join(ROOT, "ref", "orig.json")))
V0 = np.array(D["verts"], float)
F0 = D["faces"]

# ------------------------------------------------------------------ parts of the rip
comps = {}
for i, f in enumerate(F0):
    comps.setdefault(f["comp"], []).append(i)

def cverts(fl):
    return sorted({v for i in fl for v in F0[i]["v"]})

def cbox(fl):
    P = V0[cverts(fl)]
    return P.min(0), P.max(0)

part_of = {}
for k, fl in comps.items():
    mn, mx = cbox(fl)
    n = len(fl)
    if n == 45: nm = "torso"
    elif n == 53: nm = "head"
    elif mx[1] < 0.25: nm = "shoe"
    elif n == 15: nm = "pie"
    elif n == 6 and mn[0] > 0.1: nm = "tray"
    elif n == 47: nm = "trayarm"
    elif n == 21: nm = "uparm"
    elif n == 22: nm = "forearm"
    elif n == 6: nm = "neck"
    elif n == 3: nm = "nose"
    elif n == 4: nm = "bangs"
    else: raise SystemExit(f"unknown part {k} {n}")
    part_of[k] = nm
print("parts", sorted(part_of.values()))

torso_v = cverts(comps[[k for k, v in part_of.items() if v == "torso"][0]])
# symmetry plane from mirrored torso vertex pairs (same y,z)
pairs = []
for a in torso_v:
    for b in torso_v:
        if a < b and abs(V0[a, 1] - V0[b, 1]) < 1e-3 and abs(V0[a, 2] - V0[b, 2]) < 1e-3 and abs(V0[a, 0] - V0[b, 0]) > 0.05:
            pairs.append((V0[a, 0] + V0[b, 0]) / 2)
C = float(np.median(pairs))
print("centre x", round(C, 4), "pairs", len(pairs))

PX = 175.0          # texel density of the new texture (px per metre)
TW, TH = 256, 128

# ------------------------------------------------------------------ design constants
HIP = {  # new hip ring (sym), replaces the flared skirt top; (|x-c|, y, z)
    "F": (0.128, 1.011, 0.112), "S": (0.172, 0.992, -0.012), "B": (0.130, 0.992, -0.140)}
# leg rings: y, lateral offset of centre from C, centre z, rx, rz
RINGS = [
    (0.860, 0.092, -0.020, 0.088, 0.094),
    (0.720, 0.090, -0.028, 0.082, 0.085),
    (0.560, 0.087, -0.033, 0.061, 0.064),
    (0.480, 0.085, -0.035, 0.050, 0.054),
    (0.360, 0.083, -0.058, 0.056, 0.062),
    (0.270, 0.081, -0.074, 0.040, 0.043),
    (0.205, 0.079, -0.0875, 0.036, 0.038),
    (0.150, 0.079, -0.0875, 0.034, 0.036),
]
PHI = [270, 330, 30, 90, 150, 210]          # ring vertex angles (0 front, 90 outer)
LAB = ["I", "FI", "FO", "O", "BO", "BI"]
HEM_Y, R1_Y = 0.750, 0.905
SK_CZ = -0.012
ABD = 15.0                                   # arm abduction (A-pose)
SHOULDER = np.array([C - 0.150, 1.362, -0.040])

def ring_pt(k, j, s):
    y, off, cz, rx, rz = RINGS[k]
    p = math.radians(PHI[j])
    return np.array([C + s * (off + rx * math.sin(p)), y, cz + rz * math.cos(p)])

def leg_axis(y):
    ys = [r[0] for r in RINGS]
    y = min(max(y, ys[-1]), ys[0])
    for k in range(len(RINGS) - 1):
        if RINGS[k + 1][0] <= y <= RINGS[k][0]:
            t = (RINGS[k][0] - y) / (RINGS[k][0] - RINGS[k + 1][0])
            a, b = np.array(RINGS[k][1:]), np.array(RINGS[k + 1][1:])
            return a + (b - a) * t     # off, cz, rx, rz
    return np.array(RINGS[0][1:])

# ------------------------------------------------------------------ mesh builder
class Mesh:
    def __init__(s):
        s.V, s.W, s.F = [], [], []      # F: dict(v, uv(px list), mat, part)
        s.key = {}
    def vert(s, key, p, w):
        if key in s.key: return s.key[key]
        s.key[key] = len(s.V); s.V.append(np.array(p, float)); s.W.append(w); return s.key[key]
    def face(s, vs, uvs, mat, part, inside=None, outward=True):
        if inside is not None:
            P = [s.V[v] for v in vs]
            n = np.cross(P[1] - P[0], P[2] - P[0])
            if len(P) == 4: n = n + np.cross(P[2] - P[0], P[3] - P[0])
            g = np.mean(P, 0)
            if (np.dot(n, g - inside(g)) < 0) == outward:
                vs, uvs = vs[::-1], uvs[::-1]
        s.F.append({"v": list(vs), "uv": [list(map(float, u)) for u in uvs], "mat": mat, "part": part})

def rotz(p, piv, deg):
    a = math.radians(deg); q = p - piv
    return piv + np.array([q[0] * math.cos(a) - q[1] * math.sin(a), q[0] * math.sin(a) + q[1] * math.cos(a), q[2]])

def mirror(p):
    return np.array([2 * C - p[0], p[1], p[2]])

def build(opt):
    M = Mesh()
    hip_ids = {}
    # hip ring vertex ids in the rip: map by position class
    for v in torso_v:
        x, y, z = V0[v]
        if 0.95 < y < 1.05:
            s = "L" if x > C else "R"
            cls = "F" if z > 0.08 else ("B" if z < -0.08 else "S")
            hip_ids[v] = (cls, s)
    def hip_pos(cls, s):
        o, y, z = HIP[cls]
        return np.array([C + (o if s == "L" else -o), y, z])
    # ---- original parts kept
    for k, fl in comps.items():
        nm = part_of[k]
        if nm in ("pie", "tray", "trayarm"): continue
        for i in fl:
            f = F0[i]
            if nm == "torso" and any(V0[v, 1] < 0.5 for v in f["v"]): continue   # long skirt
            ids = []
            for v in f["v"]:
                p = V0[v].copy()
                if nm == "torso" and v in hip_ids:
                    cls, s = hip_ids[v]; p = hip_pos(cls, s); key = ("hip", cls, s)
                    w = {"Pelvis": 1.0}
                else:
                    key = ("o", v)
                    w = orig_weight(nm, v, p, "R")
                    if nm in ("uparm", "forearm"):
                        p = rotz(p, SHOULDER, -ABD)
                ids.append(M.vert(key, p, w))
            M.F.append({"v": ids, "uv": [list(u) for u in f["uv"]], "mat": f["mat"], "part": nm})
            if nm in ("uparm", "forearm"):          # mirrored copy -> left arm (same uv, reversed winding)
                mids = []
                for v in f["v"]:
                    p = rotz(V0[v].copy(), SHOULDER, -ABD)
                    w = orig_weight(nm, v, p, "L")
                    mids.append(M.vert(("m", v), mirror(p), w))
                M.F.append({"v": mids[::-1], "uv": [list(u) for u in f["uv"]][::-1], "mat": f["mat"], "part": nm + "_m"})
    # ---- legs + pelvis ("pants" topology)
    UV = uv_layout()
    leg_ids = {}
    for s, sn in ((1, "L"), (-1, "R")):
        for k in range(len(RINGS)):
            for j in range(6):
                w = leg_weight(k, j, sn)
                leg_ids[(sn, k, j)] = M.vert(("leg", sn, k, j), ring_pt(k, j, s), w)
        leg_ids[(sn, "cap")] = M.vert(("leg", sn, "cap"), [C + s * RINGS[-1][1], 0.13, RINGS[-1][2]], {"Foot." + sn: 0.6, "Calf." + sn: 0.4})
    def leg_inside(sn):
        s = 1 if sn == "L" else -1
        def f(g):
            off, cz, rx, rz = leg_axis(g[1]); return np.array([C + s * off, g[1], cz])
        return f
    for sn in ("L", "R"):
        ins = leg_inside(sn)
        for k in range(len(RINGS) - 1):
            for j in range(6):
                j2 = (j + 1) % 6
                vs = [leg_ids[(sn, k, j)], leg_ids[(sn, k, j2)], leg_ids[(sn, k + 1, j2)], leg_ids[(sn, k + 1, j)]]
                uvs = [UV["leg"][(k, j)], UV["leg"][(k, j + 1)], UV["leg"][(k + 1, j + 1)], UV["leg"][(k + 1, j)]]
                M.face(vs, uvs, 2, "leg", ins)
        kk = len(RINGS) - 1
        for j in range(6):
            j2 = (j + 1) % 6
            M.face([leg_ids[(sn, kk, j)], leg_ids[(sn, kk, j2)], leg_ids[(sn, "cap")]],
                   [UV["leg"][(kk, j)], UV["leg"][(kk, j + 1)], UV["leg"]["cap"]], 2, "legcap",
                   lambda g, sn=sn: np.array([g[0], 0.3, g[2]]))
    H = {(c, s): M.key[("hip", c, s)] for c in "FSB" for s in "LR"}
    for c in "FB":                                     # centre-front/back hip points (on the FR-FL / BL-BR edges)
        q = (M.V[H[(c, "L")]] + M.V[H[(c, "R")]]) / 2
        H[(c, "C")] = M.vert(("hip", c, "C"), q, {"Pelvis": 1.0})
    pel_in = lambda g: np.array([C, 0.93, -0.015])
    CF = M.vert(("pel", "CF"), [C, 0.905, 0.088], {"Pelvis": 0.8, "Thigh.L": 0.1, "Thigh.R": 0.1})
    CB = M.vert(("pel", "CB"), [C, 0.905, -0.128], {"Pelvis": 0.8, "Thigh.L": 0.1, "Thigh.R": 0.1})
    CC = M.vert(("pel", "CC"), [C, 0.846, -0.018], {"Pelvis": 0.5, "Thigh.L": 0.25, "Thigh.R": 0.25})
    L = lambda sn, lab: leg_ids[(sn, 0, LAB.index(lab))]
    PU = UV["pel"]
    def pu(name, vid):
        return PU[name](M.V[vid])
    # sides (mirrored uv)
    for sn in "LR":
        M.face([H[("F", sn)], H[("S", sn)], L(sn, "O"), L(sn, "FO")], [pu("side", v) for v in [H[("F", sn)], H[("S", sn)], L(sn, "O"), L(sn, "FO")]], 2, "pelvis", pel_in)
        M.face([H[("S", sn)], H[("B", sn)], L(sn, "BO"), L(sn, "O")], [pu("side", v) for v in [H[("S", sn)], H[("B", sn)], L(sn, "BO"), L(sn, "O")]], 2, "pelvis", pel_in)
    loop_f = [H[("F", "R")], H[("F", "C")], H[("F", "L")], L("L", "FO"), L("L", "FI"), L("R", "FI"), L("R", "FO")]
    loop_b = [H[("B", "L")], H[("B", "C")], H[("B", "R")], L("R", "BO"), L("R", "BI"), L("L", "BI"), L("L", "BO")]
    loop_c = [L("L", "FI"), L("L", "I"), L("L", "BI"), L("R", "BI"), L("R", "I"), L("R", "FI")]
    for loop, ctr, nm in ((loop_f, CF, "front"), (loop_b, CB, "back"), (loop_c, CC, "crotch")):
        for a, b in zip(loop, loop[1:] + loop[:1]):
            M.face([a, b, ctr], [pu(nm, a), pu(nm, b), pu(nm, ctr)], 2, "pelvis", pel_in)
    # ---- pleated mini skirt (option A)
    if opt == "A":
        build_skirt(M, H, UV)
    return M

# ------------------------------------------------------------------ weights
def orig_weight(nm, v, p, side):
    y = p[1]
    if nm in ("head", "nose", "bangs"): return {"Head": 1.0}
    if nm == "neck": return {"Neck": 0.6, "Chest": 0.4} if y < 1.44 else {"Neck": 0.7, "Head": 0.3}
    if nm == "shoe":
        sn = "L" if p[0] > C else "R"
        return {"Foot." + sn: 1.0}
    if nm == "torso":
        if y > 1.2: return {"Chest": 1.0}
        return {"Spine": 0.7, "Chest": 0.3}
    if nm == "uparm":
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

# ------------------------------------------------------------------ uv layout (pixels in a 256x128 sheet)
def ellipse_cum(k):
    pts = [ring_pt(k, j % 6, 1) for j in range(7)]
    d = [0.0]
    for a, b in zip(pts, pts[1:]): d.append(d[-1] + float(np.linalg.norm(b - a)))
    return d

def uv_layout():
    UV = {"leg": {}}
    for k in range(len(RINGS)):
        d = ellipse_cum(k); P = d[-1]
        v = 2 + (RINGS[0][0] - RINGS[k][0]) * PX
        for j in range(7): UV["leg"][(k, j)] = (50 + (d[j] - P / 2) * PX, v)
    UV["leg"]["cap"] = (50, 127)
    UV["pel"] = {
        "front": lambda p: (106 + (p[0] - C + 0.14) * PX, 52 + (1.015 - p[1]) * PX),
        "back": lambda p: (160 + (p[0] - C + 0.14) * PX, 52 + (1.015 - p[1]) * PX),
        "side": lambda p: (106 + (0.12 - p[2]) * PX, 84 + (1.015 - p[1]) * PX),
        "crotch": lambda p: (170 + (abs(p[0] - C) * (1 if p[0] >= C else -1)) * PX, 84 + (0.10 - p[2]) * PX),
    }
    return UV

# ------------------------------------------------------------------ skirt
def hip_angle(p):
    return math.degrees(math.atan2(abs(p[0] - C), p[2] - SK_CZ))     # 0 front .. 180 back (half)

def build_skirt(M, H, UV):
    # half-ring angles; ring1: 0, F, mid, S, mid, B, 180 ; corners at odd indices
    corner = {c: hip_angle(M.V[H[(c, "L")]]) for c in "FSB"}
    a1 = [0.0, corner["F"], (corner["F"] + corner["S"]) / 2, corner["S"], (corner["S"] + corner["B"]) / 2, corner["B"], 180.0]
    def ell(a, y, ax, az):
        r = math.radians(a)
        return np.array([math.sin(r) * ax, y, SK_CZ + math.cos(r) * az])
    def full(i, n):                       # index on full ring -> (half index, side)
        return (i, "L") if i <= n // 2 else (n - i, "R")
    sk_w = lambda a, x, top: skirt_weight(a, x, top)
    r1, hem = {}, {}
    a24 = [15.0 * k for k in range(13)]                     # 13 half-ring angles (uniform pleats)
    for i in range(24):
        hi, sn = full(i, 24); s = 1 if sn == "L" else -1
        side = sn if hi not in (0, 12) else "C"
        f1 = 0.985 if hi % 2 == 0 else 1.02
        p = ell(a24[hi], R1_Y, 0.184 * f1, 0.148 * f1)
        pos = np.array([C + s * p[0], p[1], p[2]])
        r1[i] = M.vert(("r1", hi, side), pos, sk_w(a24[hi], pos[0], True))
        f = 0.95 if hi % 2 == 0 else 1.05
        p = ell(a24[hi], HEM_Y + (0.004 if hi % 2 else 0), 0.200 * f, 0.185 * f)
        pos = np.array([C + s * p[0], p[1], p[2]])
        hem[i] = M.vert(("hem", hi, side), pos, sk_w(a24[hi], pos[0], False))
    def arcs(pts):
        d = [0.0]
        for a, b in zip(pts, pts[1:]): d.append(d[-1] + float(np.linalg.norm(b - a)))
        return d
    hkeys = [("F", "C"), ("F", "L"), ("S", "L"), ("B", "L"), ("B", "C")]
    hp = [M.V[H[k]] for k in hkeys]
    hang = [hip_angle(p) for p in hp]; hang[0], hang[-1] = 0.0, 180.0
    r1_half = [M.V[r1[i]] for i in range(13)]
    hem_half = [M.V[hem[i]] for i in range(13)]
    d1, dh, dhip = arcs(r1_half), arcs(hem_half), arcs(hp)
    U0, V_HIP, V_R1, V_HEM = 106, 2, 18, 46
    uv_hip = [(U0 + d * PX, V_HIP) for d in dhip]
    uv_r1 = {i: (U0 + d1[i] * PX, V_R1) for i in range(13)}
    uv_hem = {i: (U0 + dh[i] * PX, V_HEM) for i in range(13)}
    half = lambda i: i if i <= 12 else 24 - i
    U1 = lambda i: uv_r1[half(i)]
    UM = lambda i: uv_hem[half(i)]
    ins = lambda g: np.array([C, g[1], SK_CZ])
    PL = M.__dict__.setdefault("pleat", {})
    for sn in "LR":                                    # zipper hip (5) -> ring1 (13) per half, mirrored uv
        hid = [H[(k[0], "C" if k[1] == "C" else sn)] for k in hkeys]
        rid = [r1[i if sn == "L" else (24 - i) % 24] for i in range(13)]
        i = j = 0
        while i < 4 or j < 12:
            adv_ring = i == 4 or (j < 12 and a24[j + 1] <= hang[i + 1] + 1e-6 and not (a24[j + 1] - hang[i] > hang[i + 1] - a24[j + 1] and i < 4 and a24[j] >= hang[i + 1] - 7.5))
            if j < 12 and (i == 4 or a24[j + 1] <= (hang[i] + hang[i + 1]) / 2 + 7.5):
                M.face([hid[i], rid[j], rid[j + 1]], [uv_hip[i], uv_r1[j], uv_r1[j + 1]], 2, "skirt", ins); j += 1
            else:
                M.face([hid[i], rid[j], hid[i + 1]], [uv_hip[i], uv_r1[j], uv_hip[i + 1]], 2, "skirt", ins); i += 1
    for i in range(24):
        i2 = (i + 1) % 24
        fl = min(half(i), half(i2)) % 2
        M.face([r1[i], r1[i2], hem[i2]], [U1(i), U1(i2), UM(i2)], 2, "skirt", ins); M.F[-1]["flank"] = fl
        M.face([r1[i], hem[i2], hem[i]], [U1(i), UM(i2), UM(i)], 2, "skirt", ins); M.F[-1]["flank"] = fl
    for i in range(24):
        PL[hem[i]] = 1.0 if i % 2 else 0.0
        PL[r1[i]] = 1.0 if i % 2 else 0.0
    # inner shell (reversed, slightly inset, solid dark block in the sheet)
    nF = len(M.F)
    shell = {}
    for f in [f for f in M.F if f["part"] == "skirt"]:
        ids = []
        for v in f["v"]:
            if v not in shell:
                p = M.V[v].copy(); q = np.array([C, p[1], SK_CZ]); p = q + (p - q) * 0.96
                shell[v] = M.vert(("shell", v), p, dict(M.W[v]))
            ids.append(shell[v])
        M.face(ids, [(246, 122), (250, 122), (248, 125), (247, 125)][:len(ids)], 2, "skirt_in", ins, outward=False)

def skirt_weight(a, x, top):
    wF = (1 + math.cos(math.radians(a))) / 2
    wL = min(max(0.5 + (x - C) / 0.08, 0.0), 1.0)
    q = {"SkirtFL": wF * wL, "SkirtFR": wF * (1 - wL), "SkirtBL": (1 - wF) * wL, "SkirtBR": (1 - wF) * (1 - wL)}
    k = 0.35 if top else 1.0
    w = {n: v * k for n, v in q.items() if v * k > 0.01}
    if top: w["Pelvis"] = 0.65
    t = sum(w.values()); return {n: v / t for n, v in w.items()}

# ------------------------------------------------------------------ bones (OBJ coords)
def bones(opt):
    def ar(p): return rotz(np.array(p, float), SHOULDER, -ABD)
    B = {}
    B["Pelvis"] = ([C, 0.93, -0.020], [C, 1.06, -0.020], None)
    B["Spine"] = ([C, 1.06, -0.020], [C, 1.21, -0.012], "Pelvis")
    B["Chest"] = ([C, 1.21, -0.012], [C, 1.40, -0.045], "Spine")
    B["Neck"] = ([C, 1.40, -0.045], [C, 1.48, -0.045], "Chest")
    B["Head"] = ([C, 1.48, -0.045], [C, 1.72, -0.045], "Neck")
    sh = SHOULDER
    AX = -0.2905                                  # hanging-arm box centre x in the rip
    el = ar([AX, 1.125, -0.040])
    wr = ar([AX - 0.011, 0.930, -0.035])
    ht = ar([AX - 0.016, 0.795, -0.020])
    for sn, s in (("R", 1), ("L", -1)):
        m = (lambda p: np.array(p, float)) if sn == "R" else mirror
        B["Clavicle." + sn] = (list(m(np.array([C - 0.03, 1.365, -0.035]))), list(m(sh)), "Chest")
        B["UpperArm." + sn] = (list(m(sh)), list(m(el)), "Clavicle." + sn)
        B["Forearm." + sn] = (list(m(el)), list(m(wr)), "UpperArm." + sn)
        B["Hand." + sn] = (list(m(wr)), list(m(ht)), "Forearm." + sn)
    for sn, s in (("L", 1), ("R", -1)):
        B["Thigh." + sn] = ([C + s * 0.090, 0.880, -0.025], [C + s * 0.085, 0.480, -0.035], "Pelvis")
        B["Calf." + sn] = ([C + s * 0.085, 0.480, -0.035], [C + s * 0.079, 0.120, -0.0875], "Thigh." + sn)
        B["Foot." + sn] = ([C + s * 0.079, 0.120, -0.0875], [C + s * 0.086, 0.030, 0.140], "Calf." + sn)
    if opt == "A":
        for nm, sx, sz in (("SkirtFL", 1, 1), ("SkirtFR", -1, 1), ("SkirtBL", 1, -1), ("SkirtBR", -1, -1)):
            B[nm] = ([C + sx * 0.075, 0.975, SK_CZ + sz * 0.10], [C + sx * 0.135, HEM_Y, SK_CZ + sz * 0.165], "Pelvis")
    return {k: {"head": list(map(float, h)), "tail": list(map(float, t)), "parent": p} for k, (h, t, p) in B.items()}

# ------------------------------------------------------------------ texture painting
HEX = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
SKIN = [HEX(h) for h in ("#ffe7c6", "#efcea5", "#e7b58c", "#c6946b", "#a57352")]
NAVY = [HEX(h) for h in ("#424a73", "#39426b", "#313963", "#29315a", "#212952")]
MAUVE = [HEX(h) for h in ("#8c738c", "#7b637b", "#524a6b")]
LILAC, DENIM_LT, STITCH, BLACK = HEX("#cebdce"), HEX("#525a8c"), HEX("#b57331"), HEX("#393939")

def lvl(pal, b, th):
    for c, t in zip(pal, th):
        if b > t: return c
    return pal[len(th)] if len(th) < len(pal) else pal[-1]

SK_TH = (0.74, 0.60, 0.42, 0.27)
NV_TH = (0.70, 0.55, 0.40, 0.27)

def shade(opt, part, P, N, Nf, pleat):
    x, y, z = P
    ax = abs(x - C)
    if part in ("leg", "legcap"):
        off, cz, rx, rz = leg_axis(y)
        n = np.array([(ax - off) / rx ** 2, 0.0, (z - cz) / rz ** 2]); n /= np.linalg.norm(n) + 1e-12
        N = np.array([n[0] * (1 if x >= C else -1), 0.0, n[2]])
    lat = abs(N[0])
    b = 0.84 - 0.40 * lat ** 2.0 + 0.10 * max(N[1], 0) - 0.18 * max(-N[1], 0)
    if part in ("leg", "legcap"):
        inner = (ax - off) < -0.45 * rx                                   # side facing the other leg
        if inner and y > 0.55: b -= 0.08
        if 0.46 < y < 0.50 and N[2] < -0.7: b -= 0.14                     # back of the knee crease
    is_fabric = False
    if opt == "A":
        if part in ("leg", "legcap") and y > 0.800 or part == "pelvis":
            return lvl(NAVY[2:], b - 0.25, (0.5, 0.3))                       # safety shorts under the skirt
        if part in ("leg", "legcap") and HEM_Y - 0.05 < y < HEM_Y + 0.05:
            b -= 0.24 if y > HEM_Y - 0.03 else 0.12                         # painted skirt shadow on the thigh
        if part == "skirt":
            return skirt_col(P, N, Nf, pleat)
    if opt == "B":
        if part == "pelvis" or (part in ("leg", "legcap") and y > 0.770):
            return shorts_col(part, P, N, b)
        if part in ("leg", "legcap") and 0.735 < y <= 0.770: b -= 0.18
    if opt == "C":
        if part == "pelvis" or (part in ("leg", "legcap") and y > 0.262):
            return jeans_col(part, P, N, b)
        if part in ("leg", "legcap") and 0.235 < y <= 0.262: b -= 0.18
    return lvl(SKIN, b, SK_TH)

def leg_phi(P):
    off, cz, rx, rz = leg_axis(P[1])
    return math.degrees(math.atan2((abs(P[0] - C) - off) / rx, (P[2] - cz) / rz)) % 360

def skirt_col(P, N, Nf, pleat):
    x, y, z = P
    a = hip_angle(P)
    rad = np.array([x - C, 0.0, z - SK_CZ]); rad /= np.linalg.norm(rad) + 1e-12
    tang = np.array([rad[2], 0.0, -rad[0]])                                # around the skirt
    flank = Nf
    b = 0.78 - 0.36 * abs(rad[0]) ** 2.0
    if flank is not None:
        b += 0.08 if flank == 0 else -0.27                                 # alternating pleat flanks
        if pleat is not None and flank == 0 and pleat > 0.80: b += 0.06
    else:
        b -= 0.02
    if y > 0.975: b -= 0.10
    h = y - HEM_Y
    if h < 0.019:
        return lvl(MAUVE, b, (0.66, 0.42))
    if h < 0.025: return NAVY[4]
    return lvl(NAVY, b, NV_TH)

def shorts_col(part, P, N, b):
    x, y, z = P
    if part == "pelvis" and abs(x - C) < 0.0035 and y > 0.90 and z > 0: return NAVY[4]       # fly seam
    if part == "pelvis" and z > 0 and (x - C) ** 2 + (y - 0.978) ** 2 < 0.009 ** 2:
        return LILAC if (x - C) ** 2 + (y - 0.978) ** 2 < 0.006 ** 2 else NAVY[4]           # button
    if part in ("leg", "legcap"):
        ph = leg_phi(P)
        if abs(ph - 90) < 5: return NAVY[3]                                                    # side seam
        if y < 0.790: return lvl([NAVY[0], NAVY[1], NAVY[2]], b, (0.62, 0.45))                 # cuff
        if y < 0.797: return NAVY[4]
        if y > 0.835 and ph < 40 and part == "leg": b += 0.05
    return lvl(NAVY, b, NV_TH)

def jeans_col(part, P, N, b):
    x, y, z = P
    if part == "pelvis" and z > 0:
        dx = abs(x - C)
        if dx < 0.0035 and y > 0.90: return NAVY[4]
        if abs(dx - 0.024) < 0.003 and 0.915 < y < 1.0 and x > C: return STITCH                 # J-stitch
    if part in ("leg", "legcap"):
        ph = leg_phi(P)
        if abs(ph - 90) < 4.5: return STITCH if int(y * 120) % 2 == 0 else NAVY[3]            # outseam
        if y < 0.300:                                                                           # rolled cuff
            if y > 0.293: return NAVY[4]
            return lvl([DENIM_LT, NAVY[0], NAVY[1]], b, (0.62, 0.45))
        if (ph < 45 or ph > 315) and 0.58 < y < 0.80: b += 0.12                                  # thigh fade
        if (ph < 40 or ph > 320) and 0.44 < y < 0.52: b += 0.08                                  # knee fade
    c = lvl(NAVY, b, (0.78, 0.58, 0.42, 0.28))
    if b > 0.90: c = DENIM_LT
    return c

def vertex_normals(M, parts):
    n = np.zeros((len(M.V), 3))
    for f in M.F:
        if f["part"] not in parts: continue
        P = [M.V[v] for v in f["v"]]
        fn = np.cross(P[1] - P[0], P[2] - P[0])
        if len(P) == 4: fn = fn + np.cross(P[2] - P[0], P[3] - P[0])
        for v in f["v"]: n[v] += fn
    l = np.linalg.norm(n, axis=1); l[l == 0] = 1
    return n / l[:, None]

def paint(M, opt, path):
    img = np.zeros((TH, TW, 3), np.uint8); img[:] = NAVY[3]
    pri = np.zeros((TH, TW), np.int8)
    newparts = ("leg", "legcap", "pelvis", "skirt")
    VN_body = vertex_normals(M, ("leg", "legcap", "pelvis"))
    VN_skirt = vertex_normals(M, ("skirt",))
    pleat = M.__dict__.get("pleat", {})
    for f in M.F:
        if f["part"] not in newparts: continue
        vs, uvs = f["v"], f["uv"]
        VN = VN_skirt if f["part"] == "skirt" else VN_body
        tris = [(0, 1, 2)] if len(vs) == 3 else [(0, 1, 2), (0, 2, 3)]
        P = [M.V[v] for v in vs]
        fn = np.cross(P[1] - P[0], P[2] - P[0]); fn /= np.linalg.norm(fn) + 1e-12
        for t in tris:
            A = np.array([uvs[i] for i in t], float)
            x0, y0 = np.floor(A.min(0) - 2).astype(int); x1, y1 = np.ceil(A.max(0) + 2).astype(int)
            for py in range(max(y0, 0), min(y1, TH)):
                for px in range(max(x0, 0), min(x1, TW)):
                    q = np.array([px + 0.5, py + 0.5])
                    l, inside, dist = bary(A, q)
                    if not inside and dist > 1.6: continue
                    pr = 2 if inside else 1
                    if pri[py, px] >= pr: continue
                    Pq = sum(l[k] * P[t[k]] for k in range(3))
                    Nq = sum(l[k] * VN[vs[t[k]]] for k in range(3)); Nq /= np.linalg.norm(Nq) + 1e-12
                    pl = None
                    if all(vs[t[k]] in pleat for k in range(3)): pl = sum(l[k] * pleat[vs[t[k]]] for k in range(3))
                    img[py, px] = shade(opt, f["part"], Pq, Nq, f.get("flank"), pl)
                    pri[py, px] = pr
    img[118:128, 240:256] = NAVY[4]                                       # skirt lining block
    Image.fromarray(img).save(path)

def bary(A, q):
    a, b, c = A
    v0, v1, v2 = b - a, c - a, q - a
    d = v0[0] * v1[1] - v1[0] * v0[1]
    if abs(d) < 1e-9: return np.array([1, 0, 0.]), False, 99
    l1 = (v2[0] * v1[1] - v1[0] * v2[1]) / d
    l2 = (v0[0] * v2[1] - v2[0] * v0[1]) / d
    l = np.array([1 - l1 - l2, l1, l2])
    if l.min() >= -1e-6: return l, True, 0.0
    best = None
    for i, j in ((0, 1), (1, 2), (2, 0)):
        p0, p1 = A[i], A[j]; e = p1 - p0
        t = float(np.clip(np.dot(q - p0, e) / (np.dot(e, e) + 1e-12), 0, 1))
        cp = p0 + e * t; d2 = float(np.linalg.norm(q - cp))
        if best is None or d2 < best[0]:
            ll = np.zeros(3); ll[i] = 1 - t; ll[j] = t; best = (d2, ll)
    return best[1], False, best[0]

# ------------------------------------------------------------------ main
def run(opt):
    M = build(opt)
    tex = os.path.join(ROOT, "tex", f"lower_{opt}.png")
    paint(M, opt, tex)
    out = {"centre_x": C, "verts": [list(map(float, p)) for p in M.V], "weights": M.W,
           "faces": [{"v": f["v"], "uv": [[u / TW, 1 - v / TH] for u, v in f["uv"]] if f["mat"] == 2 else f["uv"],
                      "mat": f["mat"], "part": f["part"]} for f in M.F],
           "bones": bones(opt), "tex": [os.path.abspath(os.path.join(ROOT, "..", "..", "assets", "waitress", "ST1AT_40.png")),
                                        os.path.abspath(os.path.join(ROOT, "..", "..", "assets", "waitress", "ST1AT_40__ST1AT_41.png")),
                                        os.path.abspath(tex)]}
    json.dump(out, open(os.path.join(ROOT, "ref", f"build_{opt}.json"), "w"))
    nf = sum(1 if len(f["v"]) == 3 else 2 for f in M.F)
    print(f"GEOM {opt}: verts {len(M.V)} tris {nf}")

if __name__ == "__main__":
    for o in (["A", "B", "C"] if sys.argv[1] == "all" else [sys.argv[1]]):
        run(o)
