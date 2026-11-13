"""Garment photo mapping (numpy only: runs in the venv AND inside Blender). Maps a body point, seen in the body's own
guide (guide.py), onto the same garment part of a Flow ghost-mannequin photo (parts.py found the landmarks of both):
torso rows by top / armpit / split / bottom and normalised across the torso edges, legs across each leg run, sleeves in
the sleeve frame (along the axis by real length for short sleeves, normalised for long ones, across by half-width).
paint() = the kit v6 garment texture: every texel of the body's own UV takes the photo's fabric (front photo for
front-facing texels, back photo for back-facing ones, cross-faded at the side seams); skin only where the photo shows
no garment (neck opening, below a short sleeve) and on the hands."""
import numpy as np

NB = 48                                                    # sleeve bins along the axis


# ---------------------------------------------------------------- the mapping (also used inside Blender: numpy only)
def vmap(y, g, f):
    """guide row -> flow row, piecewise linear through top / armpit / split / bottom."""
    gk = [g["top"], g["armpit"], g["split"], g["bottom"]]; fk = [f["top"], f["armpit"], f["split"], f["bottom"]]
    return np.interp(y, gk, fk, left=None, right=None) + np.where(y < gk[0], (y - gk[0]) * (fk[1] - fk[0]) / max(gk[1] - gk[0], 1), 0) \
        + np.where(y > gk[3], (y - gk[3]) * (fk[3] - fk[2]) / max(gk[3] - gk[2], 1), 0)


def rowval(arr, y):
    yi = np.clip(np.round(y).astype(int), 0, len(arr) - 1); return arr[yi]


def map_torso(x, y, g, f):
    fy = vmap(y, g, f)
    gl, gr = rowval(g["EL"], y), rowval(g["ER"], y); fl, fr = rowval(f["EL"], fy), rowval(f["ER"], fy)
    u = (x - (gl + gr) / 2) / np.maximum((gr - gl) / 2, 1)
    uc = np.clip(u, -0.96, 0.96)                                            # sample inside the photo's torso (no armpit shadow)
    return (fl + fr) / 2 + uc * (fr - fl) / 2, fy, u


def map_leg(x, y, side, g, f):
    """side: 'R' / 'L' of the person; the image-left leg is g['legleft']."""
    fy = vmap(y, g, f)
    j = 0 if side == g["legleft"] else 2
    gl, gr = rowval(g["LG"][:, j], y), rowval(g["LG"][:, j + 1], y)
    fl, fr = rowval(f["LG"][:, j], fy), rowval(f["LG"][:, j + 1], fy)
    u = (x - gl) / np.maximum(gr - gl, 1)
    return fl + u * (fr - fl), fy


def map_sleeve(x, y, side, g, f, ratio):
    """ratio = flow px per guide px (vertical torso scale). Returns flow x, y, covered (inside the sleeve length)."""
    gs, fs = g["sleeve"][side], f["sleeve"][side]
    P = np.stack([x, y], -1) - gs["root"]
    t = P @ gs["ax"]; a = P @ gs["pp"]
    tb = np.clip((t / gs["L"] * NB).astype(int), 0, NB - 1)
    an = (a - gs["cen"][tb]) / gs["hw"][tb]
    long_sleeve = fs["L"] / ratio > 0.8 * gs["L"]
    tf = t / gs["L"] * fs["L"] if long_sleeve else t * ratio
    fb = np.clip((tf / fs["L"] * NB).astype(int), 0, NB - 1)
    af = fs["cen"][fb] + an * fs["hw"][fb]
    q = fs["root"] + tf[..., None] * fs["ax"] + af[..., None] * fs["pp"]
    covered = tf <= fs["L"] * (1.0 if long_sleeve else 0.97)
    return q[..., 0], q[..., 1], covered


def unpack(d, prefix, vi):
    p = f"{prefix}{vi}_"; v = {k: d[p + k] for k in ("top", "armpit", "split", "bottom", "cx", "EL", "ER", "LG")}
    for k in ("top", "armpit", "split", "bottom", "cx"):
        v[k] = float(v[k])
    v["legleft"] = "R" if vi == 0 else "L"
    v["sleeve"] = {s: ({k: d[p + s + "_" + k] for k in ("root", "ax", "pp", "L", "cen", "hw")} if bool(d[p + "has_" + s]) else None) for s in "LR"}
    for s in "LR":
        if v["sleeve"][s] is not None:
            v["sleeve"][s]["L"] = float(v["sleeve"][s]["L"])
    return v




REGS = ("torso", "neck", "head", "eye", "armL", "armR", "legL", "legR", "footL", "footR", "coat")
RC = {r: i for i, r in enumerate(REGS)}


def to_px(P, F, view):
    sx = 1.0 if view == 0 else -1.0
    return F["cx"][view] + sx * P[..., 0] * F["s"], F["floor"] - P[..., 2] * F["s"]


def load_views(d):
    g = [unpack(d, "g", 0), unpack(d, "g", 1)]; f = [unpack(d, "f", 0), unpack(d, "f", 1)]
    return g, f


def sample_views(P, N, R, F, d, arm_t=None):
    """P, N (n,3) rest positions / normals, R (n,) region codes, arm_t (n,) arm parameter (hands: > 1).
    -> colour (n,3) 0..255, garment weight (n,) 0..1."""
    g, f = load_views(d)
    img = d["flow"].astype(np.float32); fm = d["fmask"]
    Hh, W = fm.shape
    ratio = (f[0]["split"] - f[0]["top"]) / max(g[0]["split"] - g[0]["top"], 1)
    w0 = np.clip(0.5 - N[:, 1] * 2.5, 0, 1)                              # front photo for -Y facing texels
    col = np.zeros((len(P), 3), np.float32); gar = np.zeros(len(P), np.float32)
    for v, wv in ((0, w0), (1, 1 - w0)):
        gv, fv = g[v], f[v]
        X, Y = to_px(P, F, v)
        fx, fy, u = map_torso(X, Y, gv, fv)
        garment = np.ones(len(P), bool)
        is_t = np.isin(R, [RC["torso"], RC["coat"], RC["neck"]])          # the neck base spreads onto the trapezius
        for s in "LR":
            lg = R == RC["leg" + s]
            above = lg & (Y < gv["split"])                                 # thighs under a coat / blazer -> torso map
            is_t |= above
            leg = lg & ~above
            lx, ly = map_leg(X, Y, s, gv, fv)
            fx = np.where(leg, lx, fx); fy = np.where(leg, ly, fy)
            am = R == RC["arm" + s]
            if gv["sleeve"][s] is not None and fv["sleeve"][s] is not None:
                sx, sy, cov = map_sleeve(X, Y, s, gv, fv, ratio)
                fx = np.where(am, sx, fx); fy = np.where(am, sy, fy)
                garment &= ~(am & ~cov)
            elif gv["sleeve"][s] is not None:                             # sleeveless photo: bare arm
                garment &= ~am
        fxi = np.clip(np.round(fx).astype(int), 0, W - 1); fyi = np.clip(np.round(fy).astype(int), 0, Hh - 1)
        # torso: skin only through the photo's neck opening (no garment near the collar, inside the torso width)
        garment &= ~(is_t & d["hole"][fyi, fxi])
        garment &= ~((R == RC["neck"]) & ((fy < fv["top"] + 2) | (v == 0)) & (np.abs(u) < 0.45))   # throat / above the collar: skin (not the trapezius)
        garment &= ~((R == RC["torso"]) & (fy < fv["top"] + 2) & (np.abs(u) < 0.45))   # torso skin above the collar line
        cz = R == RC["coat"]                                               # the coat skirt never samples below its hem
        fy = np.where(cz, np.minimum(fy, fv["split"] - 4), fy)
        for s in "LR":                                                     # feet regions above the shoe = trouser legs
            ft = R == RC["foot" + s]
            lx, ly = map_leg(X, Y, s, gv, fv)
            fx = np.where(ft, lx, fx); fy = np.where(ft, ly, fy)
        fxi = np.clip(np.round(fx).astype(int), 0, W - 1); fyi = np.clip(np.round(fy).astype(int), 0, Hh - 1)
        if arm_t is not None:
            garment &= ~(np.isin(R, [RC["armL"], RC["armR"]]) & (arm_t > 1.0))
        garment &= ~np.isin(R, [RC["head"], RC["eye"]])
        col += wv[:, None] * img[fyi, fxi]; gar += wv * garment
    return col, gar


def _nb(m, fn):
    o = m.copy()
    for ax, sh in ((0, 1), (0, -1), (1, 1), (1, -1)):
        o = fn(o, np.roll(m, sh, ax))
    return o


def _erode(m, it):
    for _ in range(it):
        m = _nb(m, np.logical_and)
    return m


def _dilate(m, it):
    for _ in range(it):
        m = _nb(m, np.logical_or)
    return m


def _open(m, it):
    return _dilate(_erode(m, it), it)


def _close(m, it):
    return _erode(_dilate(m, it), it)


def _fill(col, known, target, it):
    """grow the colours of `known` texels into the rest of `target` (mean of the known 4-neighbours, `it` rings)."""
    col = col.copy(); known = known.copy()
    for _ in range(it):
        acc = np.zeros_like(col); n = np.zeros(known.shape, np.float32)
        for ax, sh in ((0, 1), (0, -1), (1, 1), (1, -1)):
            k = np.roll(known, sh, ax); acc += np.roll(col, sh, ax) * k[..., None]; n += k
        new = target & ~known & (n > 0)
        col[new] = acc[new] / n[new][:, None]; known |= new
    return col


def paint(pos, nrm, reg, cov, skin, L, F, d, hd=None):
    """kit v6 body texture: pos / nrm (S,S,3) rest maps, reg (S,S) region codes (garments.RC order), skin (S,S,3) 0..255,
    L = landmarks (arm axes), F = guide.json, d = map.npz. Returns (S,S,3) 0..255."""
    out = skin.astype(np.float32).copy()
    t = np.zeros(pos.shape[:2], np.float32)
    for s in "LR":
        a0, a1 = np.array(L["arm"][s][0]), np.array(L["arm"][s][1]); dv = a1 - a0
        m = reg == RC["arm" + s]
        t[m] = ((pos[m] - a0) @ dv) / (dv @ dv)
    m = cov & ~np.isin(reg, [RC["head"], RC["eye"]])
    col, gar = sample_views(pos[m], nrm[m], reg[m], F, d, t[m])
    # v6.1 (user, video 6 review): clean garment edges. The per-texel garment test left jagged collar / sleeve-hem lines
    # and the photo's frayed edge pixels (despilled magenta, skin showing through) along them. The garment mask is
    # smoothed (open + close, 1 texel) and a 2-texel band along every garment edge takes the fabric colour from just
    # inside the garment, so the hems are clean straight cloth against clean skin.
    G0 = np.zeros(pos.shape[:2], bool); G0[m] = gar >= 0.5
    GC = np.zeros(pos.shape[:2] + (3,), np.float32); GC[m] = col
    G1 = _close(_open(G0, 3), 3) & m
    core = _erode(G1, 3) & G0
    GC = _fill(GC, core, G1, 8)
    out[G1] = GC[G1]
    # hands and bare arms: skin toned to the bare forearm (or the neck), finger gaps darker
    arm = cov & np.isin(reg, [RC["armL"], RC["armR"]])
    hand = arm & (t > 1.0)
    G = G1
    bare = arm & ~hand & ~G
    ref = np.median(out[bare], 0) if bare.sum() > 20 else np.median(skin[cov & (reg == RC["neck"])], 0)
    lum = skin[..., :3].mean(-1)
    if hand.any():
        det = np.clip(lum[hand] / max(np.median(lum[hand]), 1), 0.75, 1.2)
        out[hand] = ref[None, :] * det[:, None]
        if hd is not None and "hand" in L:                                # kit v6: the hands from a Flow hand photo
            sm = {s: hand & (reg == RC["arm" + s]) for s in "LR"}
            hc = paint_hands(pos, nrm, sm, L["hand"], hd, ref)
            for s, c in hc.items():
                out[sm[s]] = c
    return np.clip(out, 0, 255), G


def hand_frames(CO, REG, B, L):
    """per side: wrist point, axis to the middle fingertip, thumb direction, palm normal, length, half-width per bin.
    CO (n,3) rest verts, REG (n,) region names, B {bone: (head, tail)} rest positions."""
    fr = {}
    for s, inward in (("L", -1.0), ("R", 1.0)):
        w = np.array(B[f"wrist.{s}"][0]); tip = np.array(B[f"finger3-3.{s}"][1]); th = np.array(B[f"finger1-3.{s}"][1])
        d = tip - w; Lh = float(np.linalg.norm(d)); d /= Lh
        a0, a1 = np.array(L["arm"][s][0]), np.array(L["arm"][s][1]); dv = a1 - a0
        sel = (REG == "arm" + s) & (((CO - a0) @ dv) / (dv @ dv) > 1.0)
        P = CO[sel]
        if len(P):
            Lh = max(Lh, float(((P - w) @ d).max()))
        t_ = th - w; t_ -= (t_ @ d) * d; t_ /= np.linalg.norm(t_)
        n_ = np.cross(d, t_)
        if n_[0] * inward < 0:
            n_ = -n_                                          # the palm faces the body (MakeHuman A-pose)
        hw = np.full(NB, 0.04)
        if len(P):
            sb = np.clip((((P - w) @ d) / Lh * NB).astype(int), 0, NB - 1); aa = np.abs((P - w) @ t_)
            for b in range(NB):
                if (sb == b).any():
                    hw[b] = max(aa[sb == b].max(), 0.01)
            hw = np.convolve(np.pad(hw, 2, mode="edge"), np.ones(5) / 5, "valid")
        fr[s] = dict(w=w, d=d, th=t_, n=n_, L=Lh, hw=hw)
    return fr


def paint_hands(pos, nrm, side_mask, frames, hd, ref):
    """hand texels -> the Flow hand photo (back of the hand / palm by the normal), toned to the forearm skin ref."""
    img = hd["img"].astype(np.float32)
    # tone: the photo's back-of-hand median -> the forearm skin
    y0, y1 = int(hd["v0_top"]), int(hd["v0_bot"])
    cen, hw = hd["v0_cen"], hd["v0_hw"]
    ys = np.arange(y0 + 10, int(y0 + 0.45 * (y1 - y0)))
    samp = np.concatenate([img[y, int(cen[y] - 0.5 * hw[y]):int(cen[y] + 0.5 * hw[y])] for y in ys])
    gain = np.clip(np.array(ref, np.float32) / np.maximum(np.median(samp, 0), 1), 0.5, 1.8)
    out = {}
    for s, m in side_mask.items():
        if not m.any():
            continue
        f = frames[s]; P = pos[m] - f["w"]; N = nrm[m]
        sv = np.clip((P @ f["d"]) / f["L"], 0, 1)
        b = np.clip((sv * NB).astype(int), 0, NB - 1)
        a = np.clip((P @ f["th"]) / f["hw"][b], -1.1, 1.1)
        wb = np.clip(0.5 - (N @ f["n"]) * 2.0, 0, 1)                      # back of the hand when facing away from the palm
        col = np.zeros((m.sum(), 3), np.float32)
        for v, wv in ((0, wb), (1, 1 - wb)):
            top, bot = float(hd[f"v{v}_top"]), float(hd[f"v{v}_bot"])
            y = top + sv * (bot - top); yi = np.clip(np.round(y).astype(int), 0, img.shape[0] - 1)
            x = hd[f"v{v}_cen"][yi] + a * hd[f"v{v}_thumb"] * hd[f"v{v}_hw"][yi]
            xi = np.clip(np.round(x).astype(int), 0, img.shape[1] - 1)
            col += wv[:, None] * img[yi, xi]
        out[s] = np.clip(col * gain[None, :], 0, 255)
    return out
