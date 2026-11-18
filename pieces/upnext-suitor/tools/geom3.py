"""Suitor v2: the ORIGINAL Artillery geometry everywhere, minus only the backpack and the holster / gun.
 python -I tools/geom3.py [colour]       -> ref/build3_<colour>.json, tex/body3_<colour>.png
 v3: 1.67 m, smaller rounder fists, welded blended knees, collar on its own green uv island, pocket openings painted on the hip piece
 - original hip piece (trousers top + belt, sits high), original thigh boxes (legs open up to the high crotch), shins, boots
 - backpack faces removed, the torso back closed with one quad textured like the front (straps painted out)
 - arms abducted ABD deg as in v1 (separated from the hips), weights blended at shoulder / elbow / wrist
 - ONE texture = the original recoloured per UV island, keeping the original shading levels:
   skin -> natural tone, gloves -> skin (bare fists), sweater purple -> colour ramp, trousers tan -> black (belt kept),
   backpack straps and the holster belt painted out
 - face split into the eyes / mouth atlas regions exactly as v1 (tools/geom.py)"""
import json, math, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import geom as G

HEIGHT_OUT = 1.67                      # she (waitress) is 1.75: slightly taller than him, his hair top at her brow
V0, F0, comps, part_comps = G.V0, G.F0, G.comps, G.part_comps
OY = lambda y: (y - G.Y0) * G.SC      # original OBJ y -> metres (1.82 m layout units)
MAT_BODY, MAT_EYES, MAT_MOUTH = 0, 1, 2
SWEATERS = {"forest": ["#cfe6bd", "#a7cf8f", "#86b46f", "#6f9a5a", "#557f46", "#4a733d"],
            "wine": ["#e6b0b4", "#c97880", "#b0525e", "#8e3242", "#7a2a3a", "#6a2232"],
            "oat": ["#fbf4e4", "#f0e6cc", "#e3d4b4", "#d0bc98", "#c0aa84", "#b09a74"]}
SKIN5 = ["#ffe0c0", "#f2c8a2", "#daa580", "#bb8462", "#94604a"]
BLACK5 = ["#3a3a44", "#2c2c34", "#222229", "#19191e", "#111115"]
HEX = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)])


def side_of(p): return "L" if p[0] > 0 else "R"


def build():
    M = G.Mesh(); uvsrc = []                       # (face index in M.F, rule) for the texture pass
    def add(ids, uv, part, rule, mat=MAT_BODY):
        M.F.append({"v": ids, "uv": [list(map(float, u)) for u in uv], "mat": mat, "part": part}); uvsrc.append(rule)
    # head / hair spikes / nose with the face split (v1)
    for nm in ("head", "spike", "nose"):
        for k in part_comps[nm]:
            for i in comps[k]:
                f = F0[i]; n0 = len(M.F)
                if nm == "head" and G.add_head_face(M, f["v"], f["uv"], [(G.MAT_EYES, G.EYE_RECT), (G.MAT_MOUTH, G.MOUTH_RECT)]):
                    for j in range(n0, len(M.F)):
                        if M.F[j]["mat"] == G.MAT_EYES: M.F[j]["mat"] = MAT_EYES
                        elif M.F[j]["mat"] == G.MAT_MOUTH: M.F[j]["mat"] = MAT_MOUTH
                        else: M.F[j]["mat"] = MAT_BODY
                        uvsrc.append("skin")
                    continue
                ids = [M.vert(("o", v), V0[v], {"Head": 1.0}) for v in f["v"]]
                add(ids, f["uv"], "head" if nm != "nose" else "nose", "skin")
    # neck (turtleneck, original uv column)
    for k in part_comps["neck"]:
        for i in comps[k]:
            f = F0[i]
            ids = [M.vert(("o", v), V0[v], {"Neck": 0.6, "Chest": 0.4} if V0[v][1] < 1.44 else {"Neck": 0.75, "Head": 0.25}) for v in f["v"]]
            uv = [G.px2uv(COLLAR[0] + 12 + V0[v][0] * 180, COLLAR[1] + 2 + (1.50 - V0[v][1]) * 160) for v in f["v"]]   # own island (old pack area)
            add(ids, uv, "neck", "collar")
    # arms (original uvs; abducted)
    for nm in ("uparm", "forearm"):
        for k in part_comps[nm]:
            for i in comps[k]:
                f = F0[i]; P0 = [V0[v] for v in f["v"]]; s = side_of(np.mean(P0, 0))
                sleeve = nm == "uparm" or all(p[1] > G.WRIST_Y - 0.002 for p in P0)
                ids = [M.vert(("o", v), G.arm_pose(fist_pos(v, k), s), arm_weight4(nm, V0[v], s)) for v in f["v"]]
                add(ids, f["uv"], "sleeve" if nm == "uparm" else ("cuff" if sleeve else "glove"), "sweater" if sleeve else "glove")
    # torso: original faces minus the backpack + a back wall
    TV = G.TV; pack = {12, 14, 20, 21}
    def tw(v):                                              # v4 armpit fix: shoulder corners share clavicle / upper arm
        p = V0[v]; sd = side_of(p)
        if p[1] <= 1.30: return {"Spine": 0.7, "Chest": 0.3}
        if v in (TV["top_FL"], TV["top_BL"], TV["top_FR"], TV["top_BR"]): return {"Chest": 0.72, "Clavicle." + sd: 0.28}
        if v in (TV["sh_FL"], TV["sh_BL"], TV["sh_FR"], TV["sh_BR"]): return {"Chest": 0.58, "Clavicle." + sd: 0.24, "UpperArm." + sd: 0.18}
        return {"Chest": 1.0}
    top_faces = []
    for k in part_comps["torso"]:
        for i in comps[k]:
            f = F0[i]
            if pack & set(f["v"]): continue
            ids = [M.vert(("o", v), V0[v], tw(v)) for v in f["v"]]
            add(ids, f["uv"], "torso", "sweater"); top_faces.append((len(M.F) - 1, f))
    # back wall (where the pack was), uv = the front panel mirrored (straps painted out below)
    FRONT = {TV["sh_FR"], TV["sh_FL"], TV["bo_FR"], TV["bo_FL"]}; front_uv = {}
    for k in part_comps["torso"]:
        for i in comps[k]:
            f = F0[i]
            if set(f["v"]) <= FRONT:
                for v, u in zip(f["v"], f["uv"]): front_uv[v] = (u[0] * 256, (1 - u[1]) * 128)
    back = [TV["sh_BR"], TV["sh_BL"], TV["bo_BL"], TV["bo_BR"]]
    mp = {TV["sh_BR"]: TV["sh_FR"], TV["sh_BL"]: TV["sh_FL"], TV["bo_BL"]: TV["bo_FL"], TV["bo_BR"]: TV["bo_FR"]}
    ids = [M.key[("o", v)] for v in back]
    uvq = [G.px2uv(*front_uv[mp[v]]) for v in back]
    c = np.mean([M.V[i] for i in ids], 0)
    n = np.cross(M.V[ids[1]] - M.V[ids[0]], M.V[ids[2]] - M.V[ids[0]])
    if n[2] > 0: ids, uvq = ids[::-1], uvq[::-1]                     # outward = back (-z)
    for t in ((0, 1, 2), (0, 2, 3)): add([ids[j] for j in t], [uvq[j] for j in t], "torso", "sweater")
    # shoulder slopes / sides sampled pack-flap pixels in the rip: re-map them onto a plain patch of the front panel
    for fi, f in top_faces:
        u = np.array([[a * 256, (1 - b) * 128] for a, b in f["uv"]])
        if u[:, 0].min() >= 145.5:                                       # back slope + shoulder sides islands
            P = np.array([M.V[v] for v in M.F[fi]["v"]])
            M.F[fi]["uv"] = [G.px2uv(122 + (p[0] + 0.15) * 30, 18 + (1.47 - p[1]) * 120 + (0.1 - p[2]) * 20) for p in P]
    # hip piece (original trousers top + belt): bottom corners follow the thighs a little
    for k in part_comps["hipskirt"]:
        for i in comps[k]:
            f = F0[i]; ids = []
            for v in f["v"]:
                p = V0[v]; s = side_of(p)
                w = {"Spine": 0.5, "Pelvis": 0.5} if p[1] > 0.95 else ({"Pelvis": 0.6, "Thigh." + s: 0.4} if p[2] > 0 else {"Pelvis": 0.75, "Thigh." + s: 0.25})
                ids.append(M.vert(("o", v), p, w))
            add(ids, f["uv"], "hips", "trousers")
    # thigh boxes (original "filler": two boxes meeting at the crotch, open legs up to y 0.90)
    for k in part_comps["filler"]:
        for i in comps[k]:
            f = F0[i]; ids = []
            for v in f["v"]:
                p = V0[v]; s = side_of(p)
                if p[1] > 0.8:
                    w = {"Pelvis": 1.0} if abs(p[0]) < 1e-4 else {"Pelvis": 0.5, "Thigh." + s: 0.5}; ids.append(M.vert(("o", v), p, w))
                else:                                                    # knee: thigh box bottom welded to the shin top, 50 / 50 skin
                    ids.append(M.vert(("knee", s, round(p[0], 4), round(p[2], 4)), [p[0], KNEE_Y, p[2]], {"Thigh." + s: 0.5, "Calf." + s: 0.5}))
            add(ids, f["uv"], "thigh", "trousers")
    # shins + boots (original leg comps)
    for k in part_comps["leg"]:
        for i in comps[k]:
            f = F0[i]; P = [V0[v] for v in f["v"]]; s = side_of(np.mean(P, 0))
            boot = all(p[1] < G.BOOT_TOP_Y + 1e-4 for p in P)
            ids = []
            for v in f["v"]:
                p = V0[v]
                if p[1] > 0.5:
                    ids.append(M.vert(("knee", s, round(p[0], 4), round(p[2], 4)), [p[0], KNEE_Y, p[2]], {"Thigh." + s: 0.5, "Calf." + s: 0.5})); continue
                elif abs(p[1] - G.BOOT_TOP_Y) < 1e-4: w = {"Calf." + s: 0.7, "Foot." + s: 0.3}
                else: w = {"Foot." + s: 1.0}
                ids.append(M.vert(("o", v), p, w))
            add(ids, f["uv"], "shoe" if boot else "leg", "keep" if boot else "trousers")
    n0 = len(M.F)
    if not os.environ.get("NO_ARMPIT"): add_armpits(M, add)
    uvsrc += ["sweater"] * (len(M.F) - n0)
    return M, uvsrc


PIT_ARM, PIT_TORSO_Y = float(os.environ.get("PIT_ARM", 0.70)), float(os.environ.get("PIT_TY", 1.20))


def add_armpits(M, add):
    """v4 armpit bridge: the rigid PS1 sleeve and torso have no armpit surface, so a raised arm exposed a thin seam.
    Per side: a front web, a back web and an armpit floor join the sleeve's inner face to the torso side; arm-side verts
    follow the upper arm, torso-side verts the chest, so raising the arm stretches one continuous armpit."""
    TV = G.TV
    for s in "LR":
        sg = 1 if s == "L" else -1
        k = [kk for kk in part_comps["uparm"] if np.sign(np.mean([V0[u][0] for i in comps[kk] for u in F0[i]["v"]])) == sg][0]
        vs = sorted({u for i in comps[k] for u in F0[i]["v"]})
        top = [u for u in vs if V0[u][1] > 1.40]; bot = [u for u in vs if V0[u][1] < 1.16]
        inner = lambda grp: sorted(grp, key=lambda u: abs(V0[u][0]))[:2]
        it = sorted(inner(top), key=lambda u: -V0[u][2]); ib = sorted(inner(bot), key=lambda u: -V0[u][2])     # [front, back]
        A = [M.key[("o", u)] for u in it]; Bt = [M.key[("o", u)] for u in ib]
        T = [M.key[("o", TV["sh_F" + s])], M.key[("o", TV["sh_B" + s])]]
        Bo = [M.key[("o", TV["bo_F" + s])], M.key[("o", TV["bo_B" + s])]]
        aw = {"UpperArm." + s: 0.85, "Clavicle." + s: 0.10, "Chest": 0.05}
        tw = {"Chest": 0.80, "Clavicle." + s: 0.10, "UpperArm." + s: 0.10}
        a = [M.vert(("pit_a", s, j), M.V[A[j]] + (M.V[Bt[j]] - M.V[A[j]]) * PIT_ARM, aw) for j in (0, 1)]
        t = []
        for j in (0, 1):
            y0, y1 = M.V[T[j]][1], M.V[Bo[j]][1]; f = (y0 - PIT_TORSO_Y) / (y0 - y1)
            t.append(M.vert(("pit_t", s, j), M.V[T[j]] + (M.V[Bo[j]] - M.V[T[j]]) * f, tw))
        cen = (M.V[A[0]] + M.V[A[1]] + M.V[T[0]] + M.V[T[1]] + M.V[a[0]] + M.V[a[1]] + M.V[t[0]] + M.V[t[1]]) / 8
        cen = cen + np.array([0, 0.03, 0])
        uvp = lambda q: (124 + (abs(q[0]) - 0.12) * 60, 26 + (1.45 - q[1]) * 40 + (0.1 - q[2]) * 10)
        for quad in ((A[0], a[0], t[0], T[0]), (A[1], T[1], t[1], a[1]), (a[0], a[1], t[1], t[0])):
            M.face(list(quad), [uvp(M.V[v]) for v in quad], MAT_BODY, "armpit", lambda g, c=cen: c)
            for _ in range(2):
                M.F[-1 - _]["uv"] = [G.px2uv(*u) for u in M.F[-1 - _]["uv"]]
                add.__self__ if False else None
        # the face() helper appended 2 tris per quad without registering the texel rule: register them
    return


def OY_(v): return V0[v][1]


KNEE_Y = (OY(-18.4) + OY(-17.25)) / 2          # welded knee ring (= knee joint)


def arm_weight4(nm, p0, s):
    """v4: the sleeve cap blends into the chest (armpit keeps its volume when the arm goes up)"""
    if nm == "uparm":
        U, Cl = "UpperArm." + s, "Clavicle." + s; y = p0[1]; inner = abs(p0[0]) < 0.16
        if y > 1.40: return {U: 0.45, Cl: 0.35, "Chest": 0.20} if inner else {U: 0.60, Cl: 0.40}
        if y > 1.33: return {U: 0.70, Cl: 0.20, "Chest": 0.10} if inner else {U: 0.80, Cl: 0.20}
    return G.arm_weight(nm, p0, s)
COLLAR = (168, 4)                              # collar patch (px) in the freed backpack area of the texture
FIST_S = np.array([0.72, 0.84, 0.80])          # fist (hand wedge) scale about the wrist: smaller, less blocky
_WRIST = {}


def fist_pos(v, k):
    """hand-wedge verts of a forearm comp scaled about that wrist's ring centre (before the abduction)"""
    p = V0[v].copy()
    if G.part_of.get(k) != "forearm" or p[1] >= G.WRIST_Y - 0.01: return p
    if k not in _WRIST:
        ring = [u for i in comps[k] for u in F0[i]["v"] if abs(V0[u][1] - G.WRIST_Y) < 0.006]
        _WRIST[k] = V0[sorted(set(ring))].mean(0)
    c = _WRIST[k]; return c + (p - c) * FIST_S


def surf_uv(M, part, x, y):
    """uv (px) and z of the front-facing surface of `part` at (x, y) (rest layout coords)"""
    best = None
    for f in M.F:
        if f["part"] != part: continue
        P = np.array([M.V[v] for v in f["v"]]); n = np.cross(P[1] - P[0], P[2] - P[0])
        if n[2] <= 0.2 * np.linalg.norm(n): continue
        A = P[:, :2]; l, inside, d = G.bary(A, np.array([x, y]))
        if not inside: continue
        z = float(l @ P[:, 2])
        if best is None or z > best[1]:
            uv = np.array([[u * 256, (1 - w) * 128] for u, w in f["uv"]]); best = (l @ uv, z)
    return best


def bones():
    def ar(p, s):
        p = np.array(p, float) * np.array([1 if s == "L" else -1, 1, 1]); return G.arm_pose(p, s)
    B = {}
    B["Pelvis"] = ([0, 0.880, -0.008], [0, 0.985, -0.008], None)
    B["Spine"] = ([0, 0.985, -0.008], [0, 1.140, -0.006], "Pelvis")
    B["Chest"] = ([0, 1.140, -0.006], [0, 1.41, -0.020], "Spine")
    B["Neck"] = ([0, 1.41, -0.020], [0, 1.47, -0.010], "Chest")
    B["Head"] = ([0, 1.47, -0.010], [0, 1.80, -0.010], "Neck")
    for s in ("L", "R"):
        m = 1 if s == "L" else -1
        sh = ar(G.SHOULDER, s); el = ar([0.196, G.ELBOW_Y, -0.022], s); wr = ar([0.197, G.WRIST_Y, -0.018], s); ht = ar([0.192, 0.74, -0.010], s)
        B["Clavicle." + s] = ([m * 0.03, 1.395, -0.020], sh, "Chest")
        B["UpperArm." + s] = (sh, el, "Clavicle." + s)
        B["Forearm." + s] = (el, wr, "UpperArm." + s)
        B["Hand." + s] = (wr, ht, "Forearm." + s)
        ank = [m * 0.090, 0.088, -0.026]
        B["Thigh." + s] = ([m * 0.083, 0.860, -0.010], [m * 0.088, 0.573, -0.012], "Pelvis")
        B["Calf." + s] = ([m * 0.088, 0.573, -0.012], ank, "Thigh." + s)
        B["Foot." + s] = (ank, [m * 0.092, 0.030, 0.190], "Calf." + s)
    return {k: {"head": list(map(float, h)), "tail": list(map(float, t)), "parent": p} for k, (h, t, p) in B.items()}


# ------------------------------------------------------------------ texture: the original recoloured per uv island
def raster_mask(M, uvsrc, shape):
    H, Wd = shape; owner = {}
    for f, rule in zip(M.F, uvsrc):
        if f["mat"] != MAT_BODY: continue
        A = np.array([[u * 256, (1 - v) * 128] for u, v in f["uv"]])
        x0, y0 = np.floor(A.min(0) - 1).astype(int); x1, y1 = np.ceil(A.max(0) + 1).astype(int)
        for py in range(max(y0, 0), min(y1 + 1, H)):
            for px in range(max(x0, 0), min(x1 + 1, Wd)):
                l, inside, dist = G.bary(A, np.array([px + 0.5, py + 0.5]))
                if inside: owner.setdefault((py, px), [set(), set()])[0].add(rule)
                elif dist < 0.75: owner.setdefault((py, px), [set(), set()])[1].add(rule)
    return {k: (v[0] if v[0] else v[1]) for k, v in owner.items()}          # texels a face covers beat texels it only touches


def inpaint(img, mask, pal, iters=300):
    f = img.astype(float).copy(); f[mask] = f[~mask].mean(0) if (~mask).any() else 0
    for _ in range(iters):
        nb = (np.roll(f, 1, 0) + np.roll(f, -1, 0) + np.roll(f, 1, 1) + np.roll(f, -1, 1)) / 4; f[mask] = nb[mask]
    pal = np.array(pal, float); q = pal[np.argmin(((f[mask][:, None, :] - pal[None]) ** 2).sum(-1), 1)]
    out = img.copy(); out[mask] = q.astype(int); return out


PURPLE = [(232, 224, 232), (184, 168, 184), (128, 104, 128), (88, 72, 88), (64, 48, 64), (56, 40, 56)]     # light -> dark
BELT = {(112, 56, 32), (128, 72, 48)}
METAL = {(232, 224, 232), (184, 168, 184), (128, 104, 128), (88, 72, 88), (64, 48, 64), (56, 40, 56)}
lum = lambda c: 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]


def ramp_map(colours, counts, ramp, base_idx):
    """most frequent colour -> ramp[base_idx]; lighter / darker colours keep their order around it"""
    cs = sorted(colours, key=lum, reverse=True); base = max(colours, key=lambda c: counts.get(c, 0)); b = cs.index(base)
    return {c: HEX(ramp[min(max(base_idx + (i - b), 0), len(ramp) - 1)]) for i, c in enumerate(cs)}


def paint(M, uvsrc, opt, path):
    src = np.array(Image.open(os.path.join(G.ASSET, "Artillery_the_Digger.png")).convert("RGBA")).astype(int)
    rgb, alpha = src[..., :3].copy(), src[..., 3]
    # 1) paint out: backpack straps on the front panel (+ its shoulder tops), the holster belt / strap on the hip piece
    m = np.zeros(rgb.shape[:2], bool)
    m[0:67, 109:119] = True; m[0:67, 134:146] = True
    inside_front = np.zeros_like(m); inside_front[0:67, 109:146] = True
    rgb = inpaint(rgb, m, [(56, 40, 56), (64, 48, 64)])
    m2 = np.zeros_like(m)
    m2[13:40, 197:255] = True; m2[98:126, 197:255] = True; m2[54:84, 195:255] = True   # diagonal holster belt front / back, side straps
    trouser_base = [(144, 112, 48), (136, 88, 32)]
    rgb = inpaint(rgb, m2, trouser_base)
    # 2) recolour per uv island
    owner = raster_mask(M, uvsrc, rgb.shape[:2])
    by = {}
    for (py, px), rules in owner.items():
        r = sorted(rules)[0] if len(rules) == 1 else ("keep" if "keep" in rules else "sweater" if ("sweater" in rules or "neck" in rules) else sorted(rules)[0])
        by.setdefault(r, []).append((py, px))
    out = rgb.copy()
    def cnt(px):
        d = {}
        for py, x in px: c = tuple(int(v) for v in rgb[py, x]); d[c] = d.get(c, 0) + 1
        return d
    sw = SWEATERS[opt]
    pmap = {c: HEX(sw[i]) for i, c in enumerate(PURPLE)}
    for py, px in by.get("sweater", []) + by.get("neck", []):
        c = tuple(int(v) for v in rgb[py, px])
        if c in pmap: out[py, px] = pmap[c]
        elif c in G.SKIN_MAP or c in BELT or lum(c) > 60: out[py, px] = pmap[(56, 40, 56)]                # stray non-sweater texels at island edges
    gl = by.get("glove", []); gc = cnt(gl)
    gcol = [c for c in gc if c not in METAL]; gmap = ramp_map(gcol, gc, SKIN5, 1)
    for py, px in gl:
        c = tuple(int(v) for v in rgb[py, px])
        out[py, px] = gmap[c] if c in gmap else HEX("#94604a")                                         # glove seams -> skin crease
    tr = by.get("trousers", []); tc = cnt(tr)
    tcol = [c for c in tc if c not in BELT and c not in METAL]; tmap = ramp_map(tcol, tc, BLACK5, 1)
    for py, px in tr:
        c = tuple(int(v) for v in rgb[py, px])
        if c in tmap: out[py, px] = tmap[c]
    for py, px in by.get("skin", []):
        c = tuple(int(v) for v in rgb[py, px])
        if c in G.SKIN_MAP: out[py, px] = G.SKIN_MAP[c]
    # collar patch: ribbed knit in the sweater ramp (its own island)
    cx, cy = COLLAR
    for yy in range(cy, cy + 18):
        for xx in range(cx, cx + 26):
            out[yy, xx] = HEX(sw[4] if (xx - cx) % 2 else sw[5]) if yy > cy + 1 else HEX(sw[3])
    # pocket openings on the hip piece front (slanted slit + lighter lip), both sides
    for sg in (1, -1):
        for t in np.linspace(0, 1, 40):
            x = sg * (0.104 + 0.046 * t); y = 1.005 - 0.085 * t
            r = surf_uv(M, "hips", x, y)
            if r is None: continue
            (u, v), z = r; iu, iv = int(u), int(v)
            if 0 <= iv < 127 and 0 <= iu < 256:
                out[iv, iu] = HEX(BLACK5[4]); out[iv + 1, iu] = HEX(BLACK5[0])
    alpha = alpha.copy(); alpha[cy:cy + 18, cx:cx + 26] = 255
    Image.fromarray(np.dstack([out, alpha]).astype(np.uint8)).save(path)
    return {k: len(v) for k, v in by.items()}


def run(opt):
    M, uvsrc = build()
    K = HEIGHT_OUT / G.HEIGHT
    tex = os.path.join(ROOT, "tex", f"body3_{opt}.png")
    stats = paint(M, uvsrc, opt, tex)
    if opt == "forest":                                     # the face atlases read the face pixels (same in every colour)
        pass
    faces, keep = [], {}
    hc = np.mean([M.V[v] for f in M.F if f["part"] in ("head", "face") for v in f["v"]], 0)
    def outward(f):
        P = [M.V[v] for v in f["v"]]; n = np.cross(P[1] - P[0], P[2] - P[0]); return float(n @ (np.mean(P, 0) - hc))
    for i, f in enumerate(M.F):
        k = tuple(sorted(f["v"]))
        if k not in keep or outward(f) > outward(M.F[keep[k]]): keep[k] = i
    kept = set(keep.values())
    for i, f in enumerate(M.F):
        P = [M.V[v] for v in f["v"]]
        if i not in kept or np.linalg.norm(np.cross(P[1] - P[0], P[2] - P[0])) < 1e-12: continue
        faces.append({"v": f["v"], "uv": f["uv"], "mat": f["mat"], "part": f["part"]})
    B = bones()
    for b in B.values(): b["head"] = [c * K for c in b["head"]]; b["tail"] = [c * K for c in b["tail"]]
    out = {"centre_x": 0.0, "height": HEIGHT_OUT, "verts": [list(map(float, p * K)) for p in M.V], "weights": M.W, "faces": faces, "bones": B,
           "mats": [["suitor_body", os.path.abspath(tex), True],
                    ["suitor_face_eyes", os.path.abspath(os.path.join(ROOT, "tex", "face_eyes.png")), False],
                    ["suitor_face_mouth", os.path.abspath(os.path.join(ROOT, "tex", "face_mouth.png")), False]]}
    json.dump(out, open(os.path.join(ROOT, "ref", f"build3_{opt}{'_noarmpit' if os.environ.get('NO_ARMPIT') else ''}.json"), "w"))
    print(f"GEOM3 {opt}: verts {len(M.V)} tris {len(faces)} texels {stats}")


if __name__ == "__main__":
    for o in (["forest", "wine", "oat"] if len(sys.argv) < 2 or sys.argv[1] == "all" else [sys.argv[1]]):
        run(o)
