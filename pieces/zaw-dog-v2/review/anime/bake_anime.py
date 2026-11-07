"""venv: python bake.py -> tex/atlas_<expr>.png (256 px, shared 256-colour palette (8-bit CLUT), Closest in Blender).

One colour function of the 3D rest position paints the whole dog: brown base with soft fur variation, the approved
white markings (blaze, muzzle, chest/bib, socks, tail tip) as 3D fields with a ragged fur edge, baked PS1 shading
(lighter on top, darker underneath, contact darkening). The face (eyes, brows, nostrils, lips, tears) is drawn
analytically in face-plane coordinates (x, z) and laid over the head front. Because colour depends only on the 3D
point, both sides of every UV seam get the same colour: no patches, no stickers. Only the face texels change between
the five atlases, and all five share one palette, so swapping expressions never changes the body colours."""
import json
import os

import numpy as np
from PIL import Image

H = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(H, "tex")
RES, SS = 256, 4
R = RES * SS
EXPRS = ["neutral", "happy", "sad", "judging", "shocked"]

BROWN = np.array([150, 84, 44], float)
BROWN_D = np.array([88, 46, 24], float)
BROWN_L = np.array([196, 132, 82], float)
WHITE = np.array([243, 237, 226], float)
WHITE_S = np.array([200, 194, 192], float)
NOSE = np.array([40, 31, 31], float)
MOUTH = np.array([92, 28, 34], float)
TONGUE = np.array([228, 114, 124], float)
LID = np.array([44, 26, 18], float)


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- 3D value noise

_rng = np.random.default_rng(7)
_PERM = _rng.permutation(256)
_VAL = _rng.random(256)


def _hash(ix, iy, iz):
    return _VAL[_PERM[(_PERM[(_PERM[ix & 255] + iy) & 255] + iz) & 255]]


def vnoise(p):
    f = np.floor(p); i = f.astype(int); t = p - f
    t = t * t * (3 - 2 * t)
    out = 0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (t[:, 0] if dx else 1 - t[:, 0]) * (t[:, 1] if dy else 1 - t[:, 1]) * (t[:, 2] if dz else 1 - t[:, 2])
                out = out + w * _hash(i[:, 0] + dx, i[:, 1] + dy, i[:, 2] + dz)
    return out


def fbm(p, oct=3):
    a, s, tot = 1.0, 1.0, 0.0
    out = 0
    for _ in range(oct):
        out = out + a * vnoise(p * s + 13.1 * s); tot += a; a *= 0.5; s *= 2.03
    return out / tot


def stretched(P, d, freq, stretch):
    d = np.asarray(d, float); d = d / np.linalg.norm(d, axis=-1, keepdims=True)
    q = P * freq
    along = (q * d).sum(-1, keepdims=True)
    return q - d * along * (1 - 1 / stretch)


# ---------------------------------------------------------------- rasterise the UV layout

def rasterise(tris):
    P = np.zeros((R, R, 3)); N = np.zeros((R, R, 3)); FN = np.zeros((R, R, 3)); PRM = np.zeros((R, R))
    PART = np.full((R, R), -1, int); FACE = np.zeros((R, R), bool)
    parts = []
    for t in tris:
        if t["part"] not in parts:
            parts.append(t["part"])
        uv = np.array(t["uv"]) * R
        uv[:, 1] = R - uv[:, 1]
        x0, y0 = np.floor(uv.min(0)).astype(int); x1, y1 = np.ceil(uv.max(0)).astype(int)
        x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, R - 1), min(y1, R - 1)
        if x1 < x0 or y1 < y0:
            continue
        ys, xs = np.mgrid[y0:y1 + 1, x0:x1 + 1]
        px = xs + 0.5; py = ys + 0.5
        (ax, ay), (bx, by), (cx, cy) = uv
        den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
        if abs(den) < 1e-12:
            continue
        l0 = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / den
        l1 = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / den
        l2 = 1 - l0 - l1
        m = (l0 >= -1e-3) & (l1 >= -1e-3) & (l2 >= -1e-3)
        if not m.any():
            continue
        L = np.stack([l0[m], l1[m], l2[m]], -1)
        yy, xx = ys[m], xs[m]
        P[yy, xx] = L @ np.array(t["co"])
        n = L @ np.array(t["n"]); N[yy, xx] = n / np.linalg.norm(n, axis=-1, keepdims=True)
        FN[yy, xx] = t["fn"]
        PRM[yy, xx] = L @ np.array(t["prm"])
        PART[yy, xx] = parts.index(t["part"])
        FACE[yy, xx] = t["face"]
    return P, N, FN, PRM, PART, FACE, parts


# ---------------------------------------------------------------- base colour (fur + markings + baked light)

def base_colour(P, N, PRM, part, legs):
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    nx, ny, nz = N[:, 0], N[:, 1], N[:, 2]
    isp = lambda *ps: np.isin(part, ps)
    edge = (fbm(P * 160.0, 2) - 0.5) * 0.020 + (fbm(P * 45.0, 2) - 0.5) * 0.016      # ragged fur border
    W = np.zeros(len(P))
    # --- white fields: a signed size s (> 0 inside), turned into a soft ragged mask
    def field(s, mask=True, soft=0.006):
        return np.where(mask, smooth(-soft, soft, s + edge), 0)
    W = np.maximum(W, isp("muzzle", "jaw") * 1.0)
    head = isp("head")
    # blaze: narrow stripe up the forehead, widening into the muzzle, fading out over the crown
    bw = np.interp(z, [0.58, 0.63, 0.68, 0.74, 0.80], [0.060, 0.042, 0.022, 0.017, 0.015])
    fade = smooth(-0.13, -0.20, y)
    W = np.maximum(W, field((bw - np.abs(x)) * fade - (1 - fade) * 0.02, head))
    # white around the muzzle (lower cheeks) and under the chin / throat
    s_mz = 1 - np.hypot(x / 0.100, (z - 0.588) / 0.058)
    W = np.maximum(W, field(s_mz * 0.05 - edge * 0.5 - np.clip(ny + 0.35, 0, None) * 0.05, head & (y < -0.26)))
    W = np.maximum(W, field((0.552 - z) * 1.0 + (-0.30 - y) * 0.5, head & (y < -0.12)))
    # neck front + chest bib
    W = np.maximum(W, field(-ny - 0.30 + (0.60 - z) * 0.6, isp("neck"), 0.05))
    s_bib = 1 - np.sqrt((x / 0.112) ** 2 + ((y + 0.30) / 0.11) ** 2 + ((z - 0.41) / 0.20) ** 2)
    W = np.maximum(W, field(s_bib * 0.06, isp("torso")))
    W = np.maximum(W, field((0.300 - z) * 0.6 + (-0.08 - y) * 0.2, isp("torso") & (y < 0.0), 0.01))  # chest between the front legs
    W = np.maximum(W, 0.55 * field((0.275 - z), isp("torso"), 0.012))                                 # paler belly
    # socks: higher on the front of the front legs (like the reference)
    fl, hl = isp("leg_f"), isp("leg_h")
    W = np.maximum(W, field(0.105 + 0.03 * smooth(0.2, 0.7, -ny) - z, fl, 0.006))
    W = np.maximum(W, field(0.088 - z, hl, 0.006))
    W = np.maximum(W, field(PRM - 0.84, isp("tail"), 0.03))
    # --- fur: one brown everywhere, with soft streaky variation along the hair direction
    d = np.zeros_like(P); d[:, 1] = 1
    d[isp("leg_f", "leg_h", "neck", "ear")] = (0, 0, 1)
    d[isp("tail")] = (0, 0.4, 1)
    d[head] = (0, 1, 0.35)
    q = stretched(P, d, 70.0, 4.0)
    n1 = fbm(q, 3); n2 = fbm(stretched(P, d, 150.0, 5.0), 2)
    n0 = fbm(P * 9.0, 2)                                                   # broad, soft tone drift (no patches)
    v = (n1 - 0.5) * 1.7 + (n2 - 0.5) * 1.5 + (n0 - 0.5) * 0.6
    fur = BROWN + np.clip(v, 0, None)[:, None] * (BROWN_L - BROWN) * 0.55 + np.clip(-v, 0, None)[:, None] * (BROWN_D - BROWN) * 0.75
    # gentle darker saddle on the back, a touch lighter on cheeks and legs, ears a little deeper
    sad = isp("torso", "neck") * smooth(0.35, 0.95, nz) * smooth(0.48, 0.58, z)
    fur *= (1 - 0.07 * sad)[:, None]
    fur *= (1 + 0.05 * isp("leg_f", "leg_h"))[:, None]
    ear = isp("ear")
    fur = np.where(ear[:, None], fur * (0.93 - 0.10 * PRM)[:, None], fur)
    white = WHITE + ((n1 - 0.5) * 18 + (n2 - 0.5) * 10)[:, None]
    white = white + (WHITE_S - WHITE) * smooth(0.0, -0.8, nz)[:, None] * 0.5
    col = fur * (1 - W[:, None]) + white * W[:, None]
    mid = 4 * W * (1 - W)                                                  # brown/white border: no pink in-between
    grey = col.mean(1, keepdims=True)
    col = col + (grey - col) * (0.35 * mid)[:, None]
    # --- nose, mouth, tongue
    nose = isp("nose")
    ncol = NOSE + (np.array([110, 96, 96]) - NOSE) * (smooth(0.35, 0.95, nz) * 0.55)[:, None]
    col = np.where(nose[:, None], ncol, col)
    col = np.where(isp("mouth")[:, None], MOUTH * (0.75 + 0.25 * smooth(-0.45, -0.32, -y))[:, None], col)
    # inside of the mouth (only seen when the jaw opens): top of the lower jaw, roof over it
    jaw_hw = np.interp(y, [-0.385, -0.360, -0.318], [0.032, 0.046, 0.052])
    inside = (isp("jaw") & (nz > 0.55) & (z > 0.556)) | (isp("muzzle") & (nz < -0.55) & (y > -0.378) & (np.abs(x) < jaw_hw - 0.008))
    col = np.where(inside[:, None], MOUTH * 1.15, col)
    tg = TONGUE * (1 + 0.12 * nz)[:, None]
    tg = tg * (1 - 0.18 * smooth(0.010, 0.0, np.abs(x)) * (nz > 0.3))[:, None]                     # centre groove
    col = np.where(isp("tongue")[:, None], tg, col)
    # --- toe grooves on the front of each paw
    for key, pt in (("f", "leg_f"), ("h", "leg_h")):
        X, Y = legs[key]
        for sx in (1, -1):
            m = isp(pt) & (np.sign(x) == sx) & (z < 0.034) & (y < Y - 0.025)
            lx = x - sx * X
            g = np.zeros(len(P))
            for o in (-0.021, 0.0, 0.021):
                g = np.maximum(g, smooth(0.0035, 0.0012, np.abs(lx - o)))
            g *= smooth(0.034, 0.024, z) * m
            col = col * (1 - 0.30 * g[:, None])
    # --- baked PS1 light: lighter on top, darker underneath; contact shadows
    light = 0.88 + 0.16 * nz
    light *= 1 - 0.20 * (isp("leg_f", "leg_h") * smooth(0.16, 0.30, z))                          # legs under the body
    light *= 1 - 0.14 * (isp("neck") * smooth(0.0, -0.6, nz))
    light *= 1 - 0.12 * (head * smooth(-0.3, -0.85, nz))                                           # under the head
    inner = ear & (nx * np.sign(x) < -0.25)
    light *= 1 - 0.22 * inner
    light *= 1 - 0.10 * (isp("torso") * smooth(0.36, 0.30, z) * smooth(0.1, -0.6, nz))
    return np.clip(col * light[:, None], 0, 255)


# ---------------------------------------------------------------- face layer (analytic, face plane x/z in metres)

EYE = (0.092, 0.668)
EYE_YAW = np.radians(40)
ER = (0.0295, 0.0275)

# per expression: upper lid u0,u1(slope toward nose),u2 ; lower lid l0,l1,l2 ; iris radius ; pupil ; gaze (gx, gz);
# brow (dz, angle: + inner end up, length scale) ; tears ; lip corner (+ up)
EX = {
    "neutral": dict(up=(0.86, 0.06, -0.10), lo=(-0.97, 0.0, 0.05), iris=1.02, pupil=0.56, gaze=(0.0, 0.0),
                    brow=(0.0, 0.10), tears=False, lip=0.0),
    "happy":   dict(up=(0.95, 0.00, -0.12), lo=(-0.30, 0.0, -0.28), iris=1.02, pupil=0.58, gaze=(0.0, 0.10),
                    brow=(0.006, 0.12), tears=False, lip=1.0),
    "sad":     dict(up=(0.62, 0.42, -0.10), lo=(-0.92, 0.0, 0.05), iris=1.02, pupil=0.64, gaze=(0.0, 0.12),
                    brow=(0.008, 0.45), tears=True, lip=-0.6),
    "judging": dict(up=(0.08, -0.12, 0.0), lo=(-0.70, 0.0, 0.12), iris=0.88, pupil=0.50, gaze=(-0.50, -0.05),
                    brow=(-0.010, -0.22), tears=False, lip=-0.25),
    "shocked": dict(up=(1.25, 0.0, -0.1), lo=(-1.25, 0.0, 0.0), iris=0.66, pupil=0.36, gaze=(0.0, 0.0),
                    brow=(0.017, 0.15), tears=False, lip=0.0),
}


def over(dst, rgb, a):
    """alpha-composite colour rgb (3 or Nx3) with alpha a (N) onto dst RGBA (N x 4, straight alpha)."""
    a = np.clip(a, 0, 1)
    out_a = a + dst[:, 3] * (1 - a)
    rgb = np.broadcast_to(np.asarray(rgb, float), dst[:, :3].shape)
    c = (rgb * a[:, None] + dst[:, :3] * (dst[:, 3] * (1 - a))[:, None]) / np.maximum(out_a, 1e-6)[:, None]
    dst[:, :3] = c; dst[:, 3] = out_a


def seg_dist(px, pz, pts):
    """distance from points to a polyline."""
    d = np.full(px.shape, 1e9)
    for (ax, az), (bx, bz) in zip(pts, pts[1:]):
        vx, vz = bx - ax, bz - az
        t = np.clip(((px - ax) * vx + (pz - az) * vz) / (vx * vx + vz * vz), 0, 1)
        d = np.minimum(d, np.hypot(px - ax - t * vx, pz - az - t * vz))
    return d


def face_layer(X, Z, e, eyes, nose_w=1.0):
    """RGBA (N x 4) of the face features. Nostrils use the front plane (X, Z); each eye uses its own plane, turned
    EYE_YAW out from the front (eyes[sx] = (horizontal offset, vertical offset, facing gate)), so the eyes sit a little
    on the sides of the head and still read in profile."""
    S = EX[e]
    out = np.zeros((len(X), 4))
    px = 1.0 / 5000                                   # ~ half a face-texel in metres: anti-alias width
    for sx in (1, -1):
        Xl = eyes[sx][0] + sx * EYE[0]; Zl = eyes[sx][1] + EYE[1]
        o2 = np.zeros((len(X), 4))
        ex = (Xl - sx * EYE[0]) / ER[0]; ez = (Zl - EYE[1]) / ER[1]
        xi = -sx * ex                                 # > 0 toward the nose
        r = np.hypot(ex, ez)
        u0, u1, u2 = S["up"]; l0, l1, l2 = S["lo"]
        upper = u0 + u1 * xi + u2 * xi * xi
        lower = l0 + l1 * xi + l2 * xi * xi
        aa = px / ER[1]
        vis = smooth(1 + aa * 1.5, 1 - aa * 1.5, r) * smooth(-aa * 1.5, aa * 1.5, upper - ez) * smooth(-aa * 1.5, aa * 1.5, ez - lower)
        # socket shading: a soft darker ring of fur around the eye gives it depth
        over(o2, BROWN_D * 0.8, 0.30 * smooth(1.75, 1.05, np.hypot(ex * 0.95, ez * 1.05)) * (Zl > 0.62))
        # rim (dark lid line), drawn a little bigger than the visible eye
        rim_o = 0.11
        rim = smooth(1 + rim_o + aa * 2, 1 + rim_o - aa, r) * smooth(-rim_o - aa * 2, -rim_o + aa, upper - ez + 0.0) \
            * smooth(-rim_o - aa * 2, -rim_o + aa, ez - lower)
        over(o2, LID, rim)
        # eyeball: sclera, iris (amber-brown, darker limbal ring), pupil, lid shadow, catchlights
        gx, gz = S["gaze"]
        ix = ex - gx; iz = ez - gz; ir = np.hypot(ix, iz) / S["iris"]
        ball = np.array([232, 224, 212], float) + np.zeros((len(Xl), 3))
        ball = ball * (1 - 0.25 * smooth(0.3, 1.0, ez))[:, None]
        # warm amber iris: lighter round the pupil and low down (light caught from below), soft dark edge, fibres
        ang = np.arctan2(iz, ix)
        fib = 1 + 0.07 * np.sin(ang * 23 + 1.3) * np.sin(ang * 7)
        t_ = np.clip((ir - S["pupil"] / S["iris"]) / (1 - S["pupil"] / S["iris"]), 0, 1)
        iris = np.array([158, 94, 40], float) * (1 - t_)[:, None] + np.array([90, 48, 20], float) * t_[:, None]
        iris = iris * (1 + 0.22 * smooth(0.1, -0.8, iz))[:, None] * fib[:, None]
        iris = iris * (1 - 0.55 * smooth(0.80, 1.0, ir))[:, None]
        col = np.where((ir < 1)[:, None], iris, ball)
        pr = np.hypot(ix, iz) / S["pupil"]
        col = np.where((pr < 1)[:, None], np.array([16, 11, 10], float), col)
        col = col * (1 - 0.45 * smooth(upper - 0.45, upper, ez))[:, None]                 # upper-lid shadow
        hl = np.hypot((ix + 0.36) / 0.25, (iz - 0.36) / 0.27)
        col = np.where((hl < 1)[:, None], np.array([255, 255, 250], float), col)
        hl2 = np.hypot((ix - 0.33) / 0.11, (iz + 0.30) / 0.11)
        col = np.where((hl2 < 1)[:, None], np.array([238, 236, 232], float), col)
        if e == "sad":                                                                  # wet, glossy puppy eyes
            hl3 = np.hypot((ix - 0.05) / 0.5, (iz + 0.62) / 0.10)
            col = np.where((hl3 < 1)[:, None], np.array([196, 214, 236], float), col)
        over(o2, col, vis)
        # brow tuft: soft darker fur above the eye, tilted with the emotion
        dz, ang = S["brow"]
        bx0 = sx * EYE[0]; bz0 = EYE[1] + 0.041 + dz
        bxl = (Xl - bx0) * (-sx); bzl = Zl - bz0 - ang * 0.03 * np.clip(bxl / 0.022, -1, 1)
        bd = np.hypot(bxl / 0.021, bzl / 0.0075)
        over(o2, BROWN_D * 0.85, 0.45 * smooth(1.0, 0.3, bd))
        if S["tears"]:
            tx0 = sx * (EYE[0] - 0.016); tz0 = EYE[1] - 0.022
            path = [(tx0, tz0), (tx0 - sx * 0.003, tz0 - 0.022), (tx0 + sx * 0.002, tz0 - 0.045), (tx0 - sx * 0.001, tz0 - 0.064)]
            td = seg_dist(Xl, Zl, path)
            over(o2, np.array([110, 170, 235], float), smooth(0.0052, 0.0035, td))
            over(o2, np.array([215, 238, 255], float), smooth(0.0016, 0.0006, seg_dist(Xl - sx * 0.0012, Zl, path[:3])))
            dd = np.hypot((Xl - path[-1][0]) / 0.0075, (Zl - path[-1][1] + 0.006) / 0.0095)
            over(o2, np.array([110, 170, 235], float), smooth(1.0, 0.8, dd))
            over(o2, np.array([230, 245, 255], float), smooth(1.0, 0.5, np.hypot((Xl - path[-1][0] + sx * 0.002) / 0.0022, (Zl - path[-1][1] + 0.003) / 0.0028)))
            lw = smooth(0.12, 0.0, np.abs(ez - lower - 0.08)) * (r < 1.05) * (ez < 0)              # wet lower lid
            over(o2, np.array([150, 200, 245], float), 0.7 * lw)
        over(out, o2[:, :3], o2[:, 3] * eyes[sx][2])
    # nostrils (comma shapes on the nose front)
    for sx in (1, -1):
        nd = np.hypot((X - sx * 0.0115) / 0.0075, (Z - 0.6155) / 0.0045)
        over(out, np.array([10, 8, 8], float), smooth(1.0, 0.75, nd) * nose_w)
    return out


def lip_layer(X, Z, e):
    """philtrum + upper lip (muzzle only): dark line from the nose down the split, then the mouth curve each side."""
    lip = EX[e]["lip"]
    out = np.zeros((len(X), 4))
    for sx in (1, -1):
        pts = [(0.0, 0.600), (0.0, 0.574), (sx * 0.015, 0.564), (sx * 0.034, 0.561 + 0.003 * lip), (sx * 0.060, 0.563 + 0.008 * lip)]
        over(out, np.array([38, 26, 24], float), smooth(0.0032, 0.0016, seg_dist(X, Z, pts)))
    return out


def side_layer(Y, Z, e):
    """mouth corner on the sides of the muzzle (seen from 3/4 and profile): (y, z) plane."""
    lip = EX[e]["lip"]
    out = np.zeros((len(Y), 4))
    pts = [(-0.448, 0.570), (-0.42, 0.561), (-0.38, 0.558), (-0.350, 0.560 + 0.010 * lip), (-0.334, 0.567 + 0.016 * lip)]
    over(out, np.array([38, 26, 24], float), smooth(0.0040, 0.0020, seg_dist(Y, Z, pts)))
    return out


# ---------------------------------------------------------------- main

def dilate(img, cov, n=8):
    img = img.copy(); cov = cov.copy()
    for _ in range(n):
        acc = np.zeros_like(img); cnt = np.zeros(cov.shape)
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)):
            sh = np.roll(np.roll(cov, dy, 0), dx, 1)
            acc += np.roll(np.roll(img, dy, 0), dx, 1) * sh[..., None]; cnt += sh
        new = (~cov) & (cnt > 0)
        img[new] = acc[new] / cnt[new][:, None]; cov = cov | new
    return img


def main():
    M = json.load(open(os.path.join(TEX, "bake_mesh.json")))
    P, N, FN, PRM, PART, FACE, parts = rasterise(M["tris"])
    cov = PART >= 0
    idx = np.nonzero(cov)
    p, n, prm = P[idx], N[idx], PRM[idx]
    part = np.array(parts)[PART[idx]]
    hd = M["head"]; hm = np.isin(part, hd["parts"])
    p = p.copy(); p[hm] = np.array(hd["pivot"]) + (p[hm] - np.array(hd["pivot"])) / hd["scale"]    # head -> design space
    base = base_colour(p, n, prm, part, M["legs"])
    # face-layer weights: front-facing head surfaces; side layer: muzzle/jaw sides
    front = np.isin(part, ["head", "muzzle", "jaw", "nose"]) & (p[:, 1] < -0.25)
    wf = front * smooth(0.10, 0.35, -n[:, 1])
    ws = (part == "muzzle") * smooth(0.25, 0.55, np.abs(n[:, 0])) * (p[:, 1] < -0.32)
    # eye planes: centre on the skull surface at (+-EYE x, EYE z), axis turned EYE_YAW outward from -Y
    eyes = {}
    hp = np.isin(part, ["head", "muzzle"])
    for sx in (1, -1):
        m = hp & (np.abs(p[:, 0] - sx * EYE[0]) < 0.005) & (np.abs(p[:, 2] - EYE[1]) < 0.005) & (n[:, 1] < 0)
        ey = p[m, 1].min()
        d = np.array([sx * np.sin(EYE_YAW), -np.cos(EYE_YAW), 0.0]); t = np.array([sx * np.cos(EYE_YAW), np.sin(EYE_YAW), 0.0])
        rel = p - np.array([sx * EYE[0], ey, EYE[1]])
        L = sx * (rel @ t)
        gate = hp * smooth(0.05, 0.30, n @ d) * ((rel @ d) > -0.05) * (p[:, 1] < -0.22)
        eyes[sx] = (L, rel[:, 2], gate)
    outs = {}
    for e in EXPRS:
        col = base.copy()
        fl = face_layer(p[:, 0], p[:, 2], e, eyes, wf * (part == "nose"))
        a = fl[:, 3]
        col = col * (1 - a[:, None]) + fl[:, :3] * a[:, None]
        ll = lip_layer(p[:, 0], p[:, 2], e)
        a = ll[:, 3] * wf * (part == "muzzle")
        col = col * (1 - a[:, None]) + ll[:, :3] * a[:, None]
        sl = side_layer(p[:, 1], p[:, 2], e)
        a = sl[:, 3] * ws
        col = col * (1 - a[:, None]) + sl[:, :3] * a[:, None]
        img = np.zeros((R, R, 3)); img[idx] = col
        # supersampled -> 256: average only the covered subpixels
        c4 = cov.reshape(RES, SS, RES, SS).sum((1, 3))
        s4 = img.reshape(RES, SS, RES, SS, 3).sum((1, 3))
        small = s4 / np.maximum(c4, 1)[..., None]
        small = dilate(small, c4 > 0, 10)
        outs[e] = small
    # one shared palette for all five atlases
    stack = Image.fromarray(np.concatenate([outs[e] for e in EXPRS], 0).clip(0, 255).astype(np.uint8))
    pal = stack.quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    for e in EXPRS:
        im = Image.fromarray(outs[e].clip(0, 255).astype(np.uint8)).quantize(palette=pal, dither=Image.Dither.NONE).convert("RGB")
        im.save(os.path.join(TEX, f"atlas_{e}.png"))
    # debug: big preview of the neutral atlas
    Image.open(os.path.join(TEX, "atlas_neutral.png")).resize((1024, 1024), Image.NEAREST).save(os.path.join(H, "review", "atlas_neutral_x4.png"))
    print("baked", len(EXPRS), "atlases; parts", parts)


if __name__ == "__main__":
    os.makedirs(os.path.join(H, "review"), exist_ok=True)
    main()
