"""v6 low-poly hands for girl2, modelled in the hand bone's frame (HAND0: fingers dir d, palm normal p, thumb side t),
so every pose keeps its meaning. L = relaxed open hand (cupped palm, thumb wedge, two curled finger blocks:
index+middle / ring+pinky), R = fist (palm block, two curled finger rolls, thumb across the front).
Flat skin tones per face from a light fixed in the hand frame (the engine is unlit), painted as a small palette
in a free area of the body atlas. No painted finger lines."""
import json, numpy as np

HAND_RECT = (168, 2312, 376, 3096)
HAND_TONES = np.linspace(0.84, 1.03, 16)
HAND_SCALE = (0.84, 0.83, 0.74)      # along the fingers, across the palm, palm thickness
HAND0_FIX = {k: v for k, v in json.load(open("ref/hand0.json")).items()}
nrm = lambda v: v / (np.linalg.norm(v) + 1e-12)


def _section(c, a_v, a_w, pts):
    return [c + v * a_v + w * a_w for v, w in pts]


def _hex(hw, ht):
    return [(hw, 0), (0.55 * hw, ht), (-0.55 * hw, ht), (-hw, 0), (-0.55 * hw, -ht), (0.55 * hw, -ht)]


def _tube(sections, tip=None, base=None):
    """closed loft through rings with the same point count -> V, F"""
    V = [p for ring in sections for p in ring]; n = len(sections[0]); F = []
    for i in range(len(sections) - 1):
        for k in range(n):
            a, b, c, d = i * n + k, i * n + (k + 1) % n, (i + 1) * n + (k + 1) % n, (i + 1) * n + k
            F += [(a, b, c), (a, c, d)]
    for end, extra in ((0, base), (len(sections) - 1, tip)):
        ring = sections[end]; cen = np.mean(ring, 0) + (extra if extra is not None else 0)
        ci = len(V); V.append(cen)
        for k in range(n):
            a, b = end * n + k, end * n + (k + 1) % n
            F.append((ci, b, a) if end == 0 else (ci, a, b))
    return np.array(V), np.array(F)


def _rot(axis, deg):
    axis = nrm(np.asarray(axis, float)); a = np.radians(deg)
    K = np.array([[0, -axis[2], axis[1]], [axis[2], 0, -axis[0]], [-axis[1], axis[0], 0]])
    return np.eye(3) + np.sin(a) * K + (1 - np.cos(a)) * K @ K


def _curl_axis(d, towards):
    """rotation axis that turns direction d towards `towards`"""
    ax = nrm(np.cross(d, towards))
    return ax


def _chain(p0, d, towards, lens, bends, hws, hts, a_v0):
    pts, dirs = [p0], [d]
    for L, b in zip(lens, bends):
        d = _rot(_curl_axis(d, towards), b) @ d; pts.append(pts[-1] + d * L); dirs.append(d)
    secs = []
    for p, dd, hw, ht in zip(pts, dirs, hws, hts):
        av = nrm(a_v0 - (a_v0 @ dd) * dd); aw = nrm(np.cross(dd, av))
        if aw @ towards < 0: aw = -aw
        secs.append(_section(p, av, aw, _hex(hw, ht)))
    return secs, dirs[-1]


def _round_section(c, a_v, a_w, hw, wb, wp, bump=0.0, n=10, ex=0.55):
    """rounded-rectangle (bevelled) section: half-width hw along a_v, back -wb / palm +wp along a_w;
    bump pushes the thumb side (+a_v, palm half) out: the thumb as a fused mound, no gap"""
    pts = []
    for k in range(n):
        th = 2 * np.pi * k / n; cs, sn = np.cos(th), np.sin(th)
        v = hw * np.sign(cs) * abs(cs) ** ex; w = (wp if sn > 0 else wb) * np.sign(sn) * abs(sn) ** ex
        if bump:
            g = max(0.0, cs) ** 1.5 * max(0.0, sn + 0.35) / 1.35
            v += bump * g; w += 0.35 * bump * g
        pts.append(c + v * a_v + w * a_w)
    return pts


def build_hand(s, wrist, d, p, open_hand):
    """v8: one solid rounded loft per hand (UpNext man style): wrist -> palm -> fingers as ONE block with a gentle curl,
    the thumb a small mound fused to the palm side; the fist is the same idea with the palm side bulging (curled fingers)"""
    d = nrm(np.asarray(d, float)); p = nrm(np.asarray(p, float))
    t = nrm(np.cross(d, p) if s == "R" else np.cross(p, d))
    # v9: boxy blunt mittens like the UpNext man (width / length ~0.58, thickness ~1/3 of the width, no taper, blunt tip)
    if open_hand:
        #        u      hw      back    palm    thumb  curl(deg, cumulative)
        prof = [(0.004, 0.019, 0.0100, 0.0080, 0.000, 0), (0.017, 0.025, 0.0120, 0.0100, 0.010, 0), (0.031, 0.0275, 0.0125, 0.0105, 0.013, 0),
                (0.046, 0.0285, 0.0120, 0.0100, 0.008, 0), (0.060, 0.0285, 0.0110, 0.0092, 0.000, 3), (0.074, 0.028, 0.0105, 0.0088, 0.000, 9),
                (0.086, 0.0275, 0.0100, 0.0083, 0.000, 15), (0.094, 0.027, 0.0095, 0.0078, 0.000, 19)]
        ex = 0.30
    else:                                                       # compact cube-ish fist: about as wide as it is long
        prof = [(0.004, 0.019, 0.0095, 0.0075, 0.000, 0), (0.016, 0.026, 0.0115, 0.0105, 0.004, 0), (0.030, 0.0295, 0.0125, 0.0180, 0.006, 0),
                (0.044, 0.030, 0.0125, 0.0250, 0.006, 0), (0.057, 0.030, 0.0125, 0.0270, 0.003, 0), (0.065, 0.0295, 0.0120, 0.0260, 0.000, 0)]
        ex = 0.25
    tipk = 0.0
    # spine with the curl towards the palm (+p) after the knuckles
    secs = []; c = wrist.copy(); dd = d.copy(); prev_u = 0.0; pw = p.copy()
    for u, hw, wb, wp, bump, curl in prof:
        step = u - prev_u; prev_u = u
        ang = np.radians(curl); dd = nrm(np.cos(ang) * d + np.sin(ang) * p); pw = nrm(np.cos(ang) * p - np.sin(ang) * d)
        c = c + dd * step
        secs.append(_round_section(c, t, pw, hw, -wb, wp, bump, ex=ex))
    last = secs[-1]; cl = np.mean(last, 0)                      # blunt rounded end: one bevel ring, then a flat cap
    secs.append([cl + 0.80 * (q - cl) + dd * 0.005 for q in last])
    Vp, Fp = _tube(secs, tip=dd * tipk, base=-d * 0.002)
    if not open_hand:                                           # thumb lying across the front of the fist, fused (no gap)
        tc = [wrist + d * 0.024 + t * 0.026 + p * 0.014, wrist + d * 0.044 + t * 0.022 + p * 0.026, wrist + d * 0.058 + t * 0.008 + p * 0.031]
        ts = []
        for i, c_ in enumerate(tc):
            tg = nrm(tc[min(i + 1, 2)] - tc[max(i - 1, 0)]); av = nrm(np.cross(tg, p)); aw = nrm(np.cross(tg, av))
            if aw @ p < 0: aw = -aw
            ts.append(_round_section(c_, av, aw, [0.0105, 0.0095, 0.0085][i], 0.007, [0.0085, 0.008, 0.007][i], n=8, ex=0.45))
        Vt, Ft = _tube(ts, tip=nrm(tc[2] - tc[1]) * 0.002)
        Fp = np.r_[Fp, Ft + len(Vp)]; Vp = np.r_[Vp, Vt]
    F = Fp.copy(); nmain = len(secs) * len(secs[0]) + 2
    for fi in range(len(F)):                                    # outward winding per part (convex-ish blobs)
        part = Vp[:nmain] if F[fi][0] < nmain else Vp[nmain:]; cen = part.mean(0)
        a_, b_, c_ = Vp[F[fi]]
        if np.cross(b_ - a_, c_ - a_) @ ((a_ + b_ + c_) / 3 - cen) < 0: F[fi] = F[fi][[0, 2, 1]]
    V = Vp
    # soft skin shading: per-face tone from the averaged vertex normals (gradient, not hard facets)
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    vn = np.zeros_like(V); [np.add.at(vn, F[:, k], fn) for k in range(3)]; vn /= np.linalg.norm(vn, axis=1, keepdims=True) + 1e-12
    n = vn[F].mean(1); n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-12
    Lg = nrm(-1.0 * p + 0.45 * t + 0.35 * d)
    lit = np.clip(n @ Lg, -1, 1)
    tone = np.clip(np.round((0.5 + 0.5 * lit) ** 1.1 * (len(HAND_TONES) - 1)), 0, len(HAND_TONES) - 1).astype(int)
    return V, F, tone, (V - wrist) @ d


def hand_uv(tone):
    x0, y0, x1, y1 = HAND_RECT; i = int(tone); cx, cy = x0 + 26 + (i % 4) * 52, y0 + 26 + (i // 4) * 52
    return [(x / 4096, 1 - y / 4096) for x, y in ((cx - 8, cy - 6), (cx + 8, cy - 6), (cx, cy + 8))]


def paint_hands(im, base, shadow=(226, 163, 148), light=(251, 204, 190)):
    """tones: warm shadow -> her skin -> a touch lighter (no grey desaturation)"""
    from PIL import ImageDraw
    dr = ImageDraw.Draw(im); x0, y0, x1, y1 = HAND_RECT; n = len(HAND_TONES); kb = 11
    for i in range(n):
        cx, cy = x0 + 26 + (i % 4) * 52, y0 + 26 + (i // 4) * 52
        if i <= kb: t = i / kb; col = [a + (b - a) * t for a, b in zip(shadow, base)]
        else: t = (i - kb) / (n - 1 - kb); col = [a + (b - a) * t for a, b in zip(base, light)]
        dr.rectangle([cx - 22, cy - 22, cx + 22, cy + 22], fill=tuple(int(round(c)) for c in col))
    return im


def add_hand(out, s, wrist, H, Fo, cf):
    """append the new hand of side s to a parts dict (V/F/UV/W/lab), weights blended to the forearm near the wrist"""
    d0, p0 = HAND0_FIX[s]
    Vh, Fh, tone, uh = build_hand(s, wrist, np.asarray(d0), np.asarray(p0), open_hand=(s == "L"))
    b0 = len(out["V"]); out["V"] += list(Vh); out["F"] += list(Fh + b0)
    out["UV"] += [hand_uv(t_) for t_ in tone]; out["lab"] += [cf] * len(Vh)
    for u in uh:
        hfr = float(np.clip(0.45 + 0.55 * (u + 0.006) / 0.028, 0.45, 1.0))
        out["W"].append({H: hfr, Fo: 1 - hfr} if hfr < 0.999 else {H: 1.0})
    return len(Vh), len(Fh)
