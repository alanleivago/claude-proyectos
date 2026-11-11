"""Kit v5 garments: clothes PAINTED into the low-poly body's own MakeHuman-UV texture (nothing can poke through), plus
the matching silhouette (vertex inflation). Pure numpy, used by build_human3.py inside Blender.

paint(): rasterise the body triangles into UV space (a position / normal / region map), then evaluate a procedural
garment "shader" per texel from the rest-pose 3D position: neckline (crew, V, shirt collar, open cardigan / blazer V
with the inner garment, high zip collar, hood fold), sleeve length + cuffs, hem bands, plackets + buttons (single or
double-breasted), pockets (chest, kangaroo, cargo, hip), belt + buckle, yoke / epaulettes / sleeve patch, zipper, knit
rib, denim twill, trouser crease. Colours come from the Flow outfit sheet (look.json). Skin elsewhere (skin.png),
hands re-toned to the arm skin (no light palms)."""
import numpy as np

REGS = ("torso", "neck", "head", "eye", "armL", "armR", "legL", "legR", "footL", "footR")
RC = {r: i for i, r in enumerate(REGS)}


def raster(tri_uv, attrs, S):
    """tri_uv (T,3,2) in 0..1; attrs: list of (T,3,C) arrays -> per-texel interpolated maps (S,S,C) + coverage +
    the index of the dominant corner (for categorical attributes)."""
    maps = [np.zeros((S, S, a.shape[2]), np.float32) for a in attrs]
    cov = np.zeros((S, S), bool); corner = np.zeros((S, S), np.int64) - 1; tri_id = np.zeros((S, S), np.int64) - 1
    P = tri_uv * S
    for t in range(len(P)):
        (x0, y0), (x1, y1), (x2, y2) = P[t]
        xa, xb = int(max(min(x0, x1, x2) - 1, 0)), int(min(max(x0, x1, x2) + 1, S - 1))
        ya, yb = int(max(min(y0, y1, y2) - 1, 0)), int(min(max(y0, y1, y2) + 1, S - 1))
        if xb < xa or yb < ya:
            continue
        gx, gy = np.meshgrid(np.arange(xa, xb + 1) + 0.5, np.arange(ya, yb + 1) + 0.5)
        den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if abs(den) < 1e-12:
            continue
        l0 = ((y1 - y2) * (gx - x2) + (x2 - x1) * (gy - y2)) / den
        l1 = ((y2 - y0) * (gx - x2) + (x0 - x2) * (gy - y2)) / den
        l2 = 1 - l0 - l1
        m = (l0 >= -0.02) & (l1 >= -0.02) & (l2 >= -0.02)
        if not m.any():
            continue
        L = np.stack([l0, l1, l2], -1)[m]
        iy, ix = (gy[m] - 0.5).astype(int), (gx[m] - 0.5).astype(int)
        for mp, a in zip(maps, attrs):
            mp[iy, ix] = L @ a[t]
        cov[iy, ix] = True; corner[iy, ix] = t * 3 + np.argmax(L, 1); tri_id[iy, ix] = t
    return maps, cov, corner


def dilate(img, cov, it=4):
    """push colours past the UV island borders (no dark seams after decimation / Closest filtering)."""
    img = img.copy(); c = cov.copy()
    for _ in range(it):
        acc = np.zeros_like(img); n = np.zeros(c.shape, np.float32)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sh = np.roll(np.roll(img, dy, 0), dx, 1); sc = np.roll(np.roll(c, dy, 0), dx, 1)
            acc[sc] += sh[sc]; n[sc] += 1
        new = (~c) & (n > 0)
        img[new] = acc[new] / n[new][:, None]; c |= new
    return img


def rgb(c):
    return np.array(c, np.float32)


def paint(pos, nrm, reg, cov, skin, L, G, seed=1):
    """pos / nrm (S,S,3) rest-pose maps, reg (S,S) region codes, skin (S,S,3) 0..255 skin texture, L = landmarks
    (z of neck base, shoulder, waist, knee, ankle, arm axes, K), G = garment spec. Returns (S,S,3) 0..255."""
    S = pos.shape[0]; rng = np.random.default_rng(seed)
    x, y, z = pos[..., 0], pos[..., 1], pos[..., 2]
    K = L["K"]; ZN, ZS, ZW, ZKN, ZA = L["neck"], L["sh"], L["waist"], L["knee"], L["ankle"]
    out = skin.astype(np.float32).copy()
    # torso / legs by POSITION (bone regions mix at the hips -> patches), arms + head by region
    arm = cov & np.isin(reg, [RC["armL"], RC["armR"]])
    headr = cov & np.isin(reg, [RC["head"], RC["eye"]])
    body_ = cov & ~arm & ~headr
    torso = body_ & (z >= L["crotch"])
    leg = body_ & (z < L["crotch"])
    # arm parameter t: 0 at the shoulder joint, 1 at the wrist (rest A-pose axes)
    t = np.zeros_like(z)
    for s, rc in (("L", RC["armL"]), ("R", RC["armR"])):
        a0, a1 = np.array(L["arm"][s][0]), np.array(L["arm"][s][1]); d = a1 - a0; ln = np.linalg.norm(d)
        m = reg == rc
        t[m] = ((pos[m] - a0) @ d) / (ln * ln)
    hand = arm & (t > 1.0)
    # front / back: relative to the torso centre line at that height
    yc = L["yc"](z)
    front = y < yc
    ax = np.abs(x)

    # ---------------------------------------------------------------- the top
    T = G.get("top", {}); tt = T.get("type", "tee"); tc = rgb(T.get("col", (200, 200, 200))); ic = rgb(T.get("inner", tc))
    acc_c = rgb(T.get("accent", tc * 0.35)); sleeve = T.get("sleeve", 0.42 if tt in ("tee", "vneck", "polo", "uniform_short", "scrubs") else 1.0)
    hem = ZW - {"blazer": 0.17, "jacket": 0.12, "cardigan": 0.13, "chef": 0.15, "hoodie": 0.1, "sweater": 0.09, "zip": 0.07}.get(tt, 0.08) * K
    neck_line = np.full_like(z, ZN - 0.012 * K)
    if tt in ("vneck", "scrubs"):
        neck_line = np.where(front, ZN - 0.012 * K - 0.10 * K * np.clip(1 - ax / (0.065 * K), 0, 1), neck_line)
    if tt in ("shirt", "uniform", "uniform_short", "polo", "chef"):
        neck_line = np.full_like(z, ZN + 0.012 * K)
    if tt == "zip":
        neck_line = np.full_like(z, ZN + 0.035 * K)
    open_v = tt in ("cardigan", "blazer")
    if open_v:                                                    # open V: the inner garment fills it up to a crew / collar
        vdepth = 0.20 * K if tt == "blazer" else 0.16 * K
        vline = ZN - 0.01 * K - vdepth * np.clip(1 - ax / (0.085 * K), 0, 1)
        inner_m = torso & front & (z > vline) & (z < ZN + 0.01 * K) & (z > hem)
    top_m = (torso & (z < neck_line) & (z > hem)) | (arm & (t < sleeve) & ~hand)
    if open_v:
        top_m |= torso & (z < ZN + 0.01 * K) & (z > hem) & ~front
    col = np.broadcast_to(tc, out.shape).copy()
    shade = np.ones_like(z)
    # fabric
    knit = tt in ("cardigan", "sweater")
    if knit:
        shade *= 0.93 + 0.07 * (np.sin(2 * np.pi * (x + 0.5 * y) / (0.007 * K)) > 0)
    else:
        shade *= 1 + 0.035 * rng.standard_normal(z.shape)
    # yoke (two-tone jacket) / epaulettes / sleeve patch
    if T.get("yoke"):
        ym = (z > ZS - 0.07 * K) | (arm & (t < 0.22))
        col[ym] = acc_c
    if tt in ("uniform", "uniform_short"):
        ep = torso & (z > ZS - 0.02 * K) & (ax > 0.07 * K) & (ax < 0.17 * K) & (np.abs(y - yc) < 0.02 * K)
        shade[ep] *= 0.75
        a0, a1 = np.array(L["arm"]["L"][0]), np.array(L["arm"]["L"][1])
        axp = a0[None, None, :] + t[..., None] * (a1 - a0)[None, None, :]
        pt = arm & (reg == RC["armL"]) & (t > 0.10) & (t < 0.21) & ((x - axp[..., 0]) > 0.012 * K) & (np.abs(y - axp[..., 1]) < 0.03 * K)
        col[pt] = rgb(T.get("patch", (196, 160, 70)))
    # hem / cuff bands
    band = 0.016 * K
    shade[top_m & torso & (z < hem + band)] *= 0.85 if tt in ("hoodie", "sweater", "zip", "cardigan") else 0.9
    shade[top_m & arm & (t > sleeve - 0.035)] *= 0.85
    # placket + buttons (single / double-breasted), zipper
    cols_x = {"shirt": [0.0], "uniform": [0.0], "uniform_short": [0.0], "polo": [0.0], "cardigan": [0.055 * K], "blazer": [0.06 * K],
              "chef": [-0.05 * K, 0.05 * K], "scrubs": []}.get(tt, [])
    z_top_btn = {"polo": ZN - 0.07 * K}.get(tt, None)
    for bx in cols_x:
        pl = top_m & torso & front & (np.abs(x - bx) < 0.006 * K) & (z < (z_top_btn if z_top_btn else neck_line - 0.01 * K) + 0.04 * K)
        shade[pl] *= 0.86
        for bz in np.arange(hem + 0.05 * K, (z_top_btn or ZN) - 0.02 * K, 0.075 * K):
            bt = top_m & torso & front & ((x - bx) ** 2 + (z - bz) ** 2 < (0.0065 * K) ** 2)
            col[bt] = rgb(T.get("button", tc * 0.55 if tt != "chef" else (40, 40, 44)))
    if tt in ("jacket", "zip", "hoodie") and T.get("zipper", tt != "hoodie"):
        zp = top_m & torso & front & (ax < 0.004 * K)
        col[zp] = rgb((150, 150, 152)); shade[zp] = 1.0
    # collars: a lighter shirt collar band and its two points, lapels on the V
    if tt in ("shirt", "uniform", "uniform_short", "polo", "chef"):
        cl = top_m & torso & (z > ZN - 0.03 * K) & ((~front) | (ax > 0.012 * K))
        shade[cl] *= 1.08
        pts = top_m & torso & front & (z < ZN - 0.0 * K) & (z > ZN - 0.055 * K) & (np.abs(ax - (0.03 * K + (ZN - z) * 0.5)) < 0.012 * K)
        shade[pts] *= 1.1
        edge = top_m & torso & front & (np.abs(z - (ZN - 0.03 * K)) < 0.003 * K)
        shade[edge] *= 0.8
    if open_v:
        lap = torso & front & (z < ZN + 0.01 * K) & (z > hem) & (np.abs(z - vline) < 0.018 * K) & (z < vline)
        shade[lap] *= 0.82 if tt == "blazer" else 0.9
    if tt == "hoodie":                                            # the folded hood behind the neck + kangaroo pocket + cords
        hd = torso & ~front & (z > ZN - 0.07 * K) & (z < ZN + 0.02 * K)
        top_m |= hd; shade[hd] *= 0.82
        kp = top_m & torso & front & (ax < 0.11 * K) & (z > hem + 0.02 * K) & (z < hem + 0.13 * K)
        kpe = kp & ((np.abs(ax - 0.11 * K) < 0.004 * K) | (np.abs(z - (hem + 0.13 * K)) < 0.004 * K))
        shade[kpe] *= 0.78
        for cx_ in (-0.025 * K, 0.025 * K):
            cd = torso & front & (np.abs(x - cx_) < 0.003 * K) & (z < ZN - 0.01 * K) & (z > ZN - 0.12 * K)
            col[cd] = rgb((235, 235, 230))
    # pockets
    if T.get("chest_pocket", tt in ("scrubs", "shirt", "uniform", "uniform_short")):
        for sx in ([1] if tt == "scrubs" else [1, -1]):
            pz0, pz1 = ZS - 0.17 * K, ZS - 0.08 * K; px0, px1 = 0.04 * K, 0.11 * K
            pk = top_m & torso & front & (sx * x > px0) & (sx * x < px1) & (z > pz0) & (z < pz1)
            pe = pk & ((np.abs(sx * x - px0) < 0.003 * K) | (np.abs(sx * x - px1) < 0.003 * K) | (np.abs(z - pz0) < 0.003 * K) | (np.abs(z - pz1) < 0.004 * K))
            shade[pe] *= 0.78
    if tt in ("blazer", "jacket", "cardigan"):
        for sx in (1, -1):
            pk = top_m & torso & front & (np.abs(z - (hem + 0.07 * K)) < 0.004 * K) & (sx * x > 0.05 * K) & (sx * x < 0.13 * K)
            shade[pk] *= 0.75
    out[top_m] = (col * shade[..., None])[top_m]
    if open_v:
        out[inner_m] = (ic * (1 + 0.02 * rng.standard_normal(z.shape))[..., None])[inner_m]
        if T.get("inner_collar", True):
            ic_m = inner_m & (z > ZN - 0.04 * K); out[ic_m] *= 1.06

    # ---------------------------------------------------------------- the bottom
    Bt = G.get("bottom", {}); bt = Bt.get("type", "trousers"); bc = rgb(Bt.get("col", (60, 60, 70)))
    bot_m = (torso & (z <= ZW + 0.03 * K) & ~top_m) | leg                   # down to the shoe (no skin steps at the ankle)
    if bt == "skirt":
        bot_m = (torso & (z <= ZW + 0.03 * K) & ~top_m) | (leg & (z > ZKN + 0.02 * K))
    bshade = np.ones_like(z) + 0.03 * rng.standard_normal(z.shape)
    if bt == "jeans":
        bshade *= 0.94 + 0.06 * (np.sin(2 * np.pi * (z + x) / (0.005 * K)) > 0)
        fade = leg & front & (np.abs(x - np.sign(x) * 0.09 * K) < 0.03 * K) & (z > ZKN - 0.1 * K) & (z < ZW - 0.05 * K)
        bshade[fade] *= 1.12
    if bt in ("trousers", "chinos", "scrubs"):                          # front crease
        cr = leg & front & (np.abs(np.abs(x) - L["legx"]) < 0.004 * K); bshade[cr] *= 0.88
    if bt in ("jeans", "chinos", "trousers", "cargo"):
        for sx in (1, -1):                                             # slanted hip pockets
            hp = bot_m & front & (np.abs((sx * x - 0.10 * K) - (ZW - z) * 0.6) < 0.004 * K) & (z < ZW) & (z > ZW - 0.10 * K)
            bshade[hp] *= 0.78
    if bt == "cargo":
        for sx in (1, -1):
            cp = leg & (sx * x > L["legx"] + 0.03 * K) & (z > ZKN + 0.08 * K) & (z < ZKN + 0.22 * K)
            cpe = cp & ((np.abs(z - (ZKN + 0.22 * K)) < 0.006 * K) | (np.abs(z - (ZKN + 0.08 * K)) < 0.004 * K))
            bshade[cp] *= 0.93; bshade[cpe] *= 0.75
    if bt == "joggers":
        cf = leg & (z < ZA + 0.05 * K); bshade[cf] *= 0.82
    if bt == "leggings":
        bshade = 0.97 + 0.03 * rng.standard_normal(z.shape)
        st = leg & (np.abs(np.abs(x) - (L["legx"] + 0.045 * K)) < 0.004 * K); bshade[st] *= 0.75
    bshade[bot_m & leg & (z < ZA + 0.03 * K)] *= 0.88                    # hem
    out[bot_m] = (bc * bshade[..., None])[bot_m]
    if T.get("coat"):                                              # a long coat: its colour on the thighs too (the skirt
        cm = leg & (z > ZKN + 0.02 * K)                            # mesh swings; a stepping thigh then reads as coat)
        out[cm] = (rgb(T["coat"]) * (0.92 + 0.04 * rng.standard_normal(z.shape))[..., None])[cm]
    if Bt.get("belt") is not None:
        bl = (torso | leg) & (np.abs(z - (ZW + 0.015 * K)) < 0.016 * K) & ~top_m
        out[bl] = rgb(Bt["belt"])
        bk = bl & front & (ax < 0.022 * K); out[bk] = rgb((190, 170, 110))

    # ---------------------------------------------------------------- skin: hands toned to the forearm skin
    bare_arm = arm & ~top_m & ~hand
    ref = np.median(out[bare_arm], 0) if bare_arm.sum() > 20 else np.median(skin[cov & (reg == RC["neck"])], 0)
    lum = skin[..., :3].mean(-1)
    if hand.any():
        det = np.clip(lum[hand] / max(np.median(lum[hand]), 1), 0.75, 1.2)
        out[hand] = ref[None, :] * det[:, None]
        # finger separation: darker lines between the fingers (texels whose normal turns sideways on the hand)
        side = hand & (np.abs(nrm[..., 0]) > 0.75)
        out[side] *= 0.8
    return np.clip(out, 0, 255)


def inflation(co, reg_names, L, G):
    """per-vertex outward offset (m): garments thicken the low-poly body a little (looser ones more), regular-fit trouser
    legs (no skinny calves), cuffs. co (N,3) rest positions, reg_names (N,) region strings."""
    K = L["K"]; ZN, ZW, ZKN, ZA = L["neck"], L["waist"], L["knee"], L["ankle"]
    T = G.get("top", {}); tt = T.get("type", "tee"); Bt = G.get("bottom", {}); bt = Bt.get("type", "trousers")
    off = np.zeros(len(co), np.float32)
    z = co[:, 2]
    torso = np.isin(reg_names, ["torso"])
    loose = {"blazer": 0.014, "jacket": 0.014, "cardigan": 0.011, "hoodie": 0.014, "sweater": 0.010, "chef": 0.012}.get(tt, 0.006)
    hem = ZW - {"blazer": 0.17, "jacket": 0.12, "cardigan": 0.13, "chef": 0.15, "hoodie": 0.1, "sweater": 0.09, "zip": 0.07}.get(tt, 0.08) * K
    off[torso & (z < ZN - 0.02 * K) & (z > hem)] = loose * K
    arm = np.char.startswith(reg_names.astype(str), "arm")
    off[arm] = np.maximum(off[arm], 0.0)
    leg = np.char.startswith(reg_names.astype(str), "leg")
    if bt == "leggings":
        off[leg & (z > ZA)] = 0.002 * K
    elif bt == "skirt":
        pass
    else:
        base = {"jeans": 0.006, "chinos": 0.008, "trousers": 0.009, "scrubs": 0.012, "cargo": 0.012, "joggers": 0.010}.get(bt, 0.008)
        below = np.clip((ZKN - z) / max(ZKN - ZA, 1e-3), 0, 1)                # calf -> ankle: regular fit (straight leg)
        off[leg & (z > ZA - 0.01 * K)] = (base + 0.012 * below[leg & (z > ZA - 0.01 * K)]) * K
    return off
