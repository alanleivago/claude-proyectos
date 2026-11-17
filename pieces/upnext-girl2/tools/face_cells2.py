"""Her face atlases v2: 16 x 4 cells per sheet (eyes / mouth), every cell made from HER f001 pixels.
  row 0 = the 16 original names in the original order (old clips and old k/16 engines keep working)
  row 1 = 16 new expressions
  rows 2-3 = the same 32 cells with her blush ("<name>+blush", cell k + 32), so blush works on any eyes + mouth pair
Eyes are built by moving her own lash / sclera / iris / brow pixels (tools/face_eyemodel.py, integer shifts, no
resampling); half / blink are her real f027 / f030 eyes; mouths are drawn with her lip colour and bar thickness.
python tools/face_cells2.py ref/final_tex.npz
  -> tex/face_eyes.png, tex/face_mouth.png (4096x512, embedded by tools/anim/bl_build2.py), the same in out/,
     "_meta" in out/face_tracks.json (cols/rows/names), review/face_cells2.png (flat preview with names)
  then: python tools/anim/build_anims.py   (re-exports the GLBs with the face UVs fitted to one cell of the 16x4 grid)"""
import sys, os, json, numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd
sys.path.insert(0, os.path.dirname(__file__))
import face as FC
import face_eyemodel as EM

CW, CH = FC.CW, FC.CH
COLS, ROWS, BLUSH = 16, 4, 32
EYES = FC.EYE_ORDER + ["bedroom", "bedroomSide", "winkL", "winkR", "lookUp", "tease", "shy", "eyeRoll",
                       "gazeL", "gazeR", "gazeUp", "gazeDown", "smiling", "sulk", "dreamy", "glance"]
MOUTHS = FC.MOUTH_ORDER + ["softSmile", "pout", "lipBite", "laugh", "oh", "sadPout", "kiss", "kissBlow",
                           "talkClosed", "talkSmall", "talkWide", "talkOO", "talkEE", "smirkL", "grin", "parted"]
assert len(EYES) == 32 and len(MOUTHS) == 32

# ------------------------------------------------------------------------------------------------ her pixels
f0 = FC.frame(0)
E0 = FC.crop(f0, FC.EYE_RECT); M0 = FC.crop(f0, FC.MOUTH_RECT)
D = np.load(sys.argv[1], allow_pickle=True); V, F = D["V"], D["F"]; cam = json.loads(str(D["cam"])); A = D["alphas"]
HALF, _ = FC.reproject_cell(V, F, cam, A, 27, FC.EYE_RECT)
BLINK, _ = FC.reproject_cell(V, F, cam, A, 29, FC.EYE_RECT)
LAY, SK = EM.eye_layers(E0)
SKF = EM.skin_field(E0, LAY[0]["eye"] | LAY[1]["eye"], SK)
EYE = [EM.Eye(E0, d, SK, SKF) for d in LAY]                       # 0 = screen-left eye, 1 = screen-right eye
BR = [EM.Brow(E0, b["mask"], inner_right=(i == 0)) for i, b in enumerate(EM.brow_layers(E0))]
IR = [e.d["iris"] for e in EYE]
print("eyes", [e.d["box"] for e in EYE], "iris r", [round(i["r"], 2) for i in IR])


def real_eyes(src):
    """her real f027 / f030 eyes in f001: f001 eyes erased, then only the eye ink / sclera of `src` pasted (keeps the
    f001 hair / brows / skin, so nothing flickers around the eyes during a blink)"""
    out = E0.copy()
    for e in EYE:
        out[e.erase] = SKF[e.erase]
        x0, y0, x1, y1 = e.d["box"]; bx = np.zeros(E0.shape[:2], bool); bx[y0 - 4:y1 + 5, x0:x1 + 2] = True
        m = bx & (np.abs(src - SKF).sum(-1) > 22)
        hairish = np.abs(src - np.median(E0[30:60, 48:52].reshape(-1, 3), 0)).sum(-1) < 45
        m &= ~hairish
        lab, n = nd.label(m); keep = np.unique(lab[m & (EM.lum(src) < 60)]); m = np.isin(lab, keep[keep > 0])   # blobs with ink only
        m = nd.binary_dilation(m, iterations=1) & bx & ~hairish & (np.abs(src - SKF).sum(-1) > 8)
        out[m] = src[m]
    return out


HALF_E = real_eyes(HALF); BLINK_E = real_eyes(BLINK)


def eyes(L=None, R=None, brows=(None, None), base=None):
    c = (E0 if base is None else base).copy()
    for i, sp in enumerate((L, R)):
        if sp is not None: EYE[i].render(c, **sp)
    for i, b in enumerate(brows):
        if b is not None: BR[i].render(c, *b)
    return c


def both(**k): return eyes(dict(k), dict(k))


def blink_one(i, c):
    """eye i from her real blink frame"""
    x0, y0, x1, y1 = EYE[i].d["box"]; m = np.zeros(E0.shape[:2], bool); m[y0 - 3:y1 + 4, x0 - 3:x1 + 3] = True
    w = nd.gaussian_filter(m.astype(np.float32), 1.2)[..., None]
    return c * (1 - w) + BLINK * w


# ---- iris variants in her palette (black ring, black upper half, teal lower half, square white highlight)
IRIS_T = np.array([118., 140., 136.]); IRIS_L = np.array([156., 192., 186.]); WHITE = np.array([253., 253., 253.])
PINK = np.array([222., 92., 128.]); PINK_L = np.array([246., 160., 184.])


def iris_small(scale):
    def f(c, cx, cy, r, clip):
        r = r * scale
        cov = EM.cover(lambda d, s: d.ellipse([(cx + .5 - r) * s, (cy + .5 - r) * s, (cx + .5 + r) * s, (cy + .5 + r) * s], fill=255), c.shape[:2])
        inn = EM.cover(lambda d, s: d.ellipse([(cx + .5 - r * .62) * s, (cy + .5 - r * .3) * s, (cx + .5 + r * .62) * s, (cy + .5 + r * .7) * s], fill=255), c.shape[:2])
        m = (cov >= 0.5) & clip; c[m] = EM.INK
        m2 = (inn >= 0.5) & clip & m; c[m2] = IRIS_T
        hx, hy = int(round(cx + r * 0.35)), int(round(cy - r * 0.45))
        if clip[hy, hx]: c[hy, hx] = WHITE
    return f


def iris_heart(c, cx, cy, r, clip):
    pts = []
    for t in np.linspace(0, 2 * np.pi, 80):
        x = 16 * np.sin(t) ** 3; y = 13 * np.cos(t) - 5 * np.cos(2 * t) - 2 * np.cos(3 * t) - np.cos(4 * t)
        pts.append((cx + .5 + x * r * 1.05 / 16, cy + 1.0 - y * r * 1.05 / 16))
    out = EM.cover(lambda d, s: d.polygon([(x * s, y * s) for x, y in pts], fill=255), c.shape[:2])
    inn = EM.cover(lambda d, s: d.polygon([((cx + .5 + (x - cx - .5) * .7) * s, (cy + 1.0 + (y - cy - 1.0) * .7) * s) for x, y in pts], fill=255), c.shape[:2])
    m = (out >= 0.5) & clip; c[m] = EM.INK
    m2 = (inn >= 0.5) & clip; c[m2] = PINK
    yy, xx = np.mgrid[0:c.shape[0], 0:c.shape[1]]
    low = m2 & (yy > cy + 1); c[low] = PINK_L
    hx, hy = int(round(cx - r * 0.35)), int(round(cy - r * 0.35))
    for (a, b) in ((0, 0), (1, 0), (0, 1), (1, 1)):
        if clip[hy + b, hx + a]: c[hy + b, hx + a] = WHITE


def iris_spiral(c, cx, cy, r, clip):
    c[clip & ((np.mgrid[0:c.shape[0], 0:c.shape[1]][1] - cx) ** 2 + (np.mgrid[0:c.shape[0], 0:c.shape[1]][0] - cy) ** 2 <= r * r)] = WHITE
    pts = [(cx + .5 + np.cos(t) * r * t / 13, cy + .5 + np.sin(t) * r * t / 13) for t in np.linspace(0.3, 13, 90)]
    cov = EM.cover(lambda d, s: d.line([(x * s, y * s) for x, y in pts], fill=255, width=int(1.7 * s)), c.shape[:2])
    m = (cov >= 0.45) & clip; c[m] = EM.INK


def sparkle(i):
    def f(c, cx, cy, r, clip):
        EYE[i]._paste_iris(c, 0, 0, clip)
        for (ox, oy, s) in ((-0.42, 0.25, 3.2), (0.38, 0.5, 2.0)):
            x, y = cx + .5 + ox * r, cy + .5 + oy * r
            cov = EM.cover(lambda d, k: (d.polygon([(x * k, (y - s) * k), ((x + s * .28) * k, y * k), (x * k, (y + s) * k), ((x - s * .28) * k, y * k)], fill=255),
                                         d.polygon([((x - s) * k, y * k), (x * k, (y + s * .28) * k), ((x + s) * k, y * k), (x * k, (y - s * .28) * k)], fill=255)), c.shape[:2])
            m = (cov >= 0.45) & clip; c[m] = WHITE
    return f


# ------------------------------------------------------------------------------------------------ eye cells
def mirror_inner(v, i):
    """gaze dx in 'toward screen-right' px is the same for both eyes; nothing to mirror (helper kept explicit)"""
    return v


EC = {}
EC["open"] = E0.copy()
EC["half"] = HALF_E
EC["blink"] = BLINK_E
EC["happy"] = eyes(dict(closed="happy", lash_flick=True), dict(closed="happy", lash_flick=True), brows=((-2, -1, 1), (-2, -1, 1)))
EC["surprised"] = eyes(dict(raise_px=3.5), dict(raise_px=3.0), brows=((-4, -3, 1), (-4, -3, 1)))
EC["angry"] = eyes(dict(lid=(0.42, 0.08)), dict(lid=(0.42, 0.08)), brows=((4, -1, 0), (4, -1, 0)))
EC["sad"] = eyes(dict(lid=(0.0, 0.32), gaze=(0, 2)), dict(lid=(0.0, 0.32), gaze=(0, 2)), brows=((-4, 1, 0), (-4, 1, 0)))
EC["wink"] = None                                    # = winkR (filled below)
EC["hearts"] = eyes(dict(iris_fn=iris_heart), dict(iris_fn=iris_heart))
EC["shocked"] = eyes(dict(raise_px=3.5, iris_fn=iris_small(0.42)), dict(raise_px=3.0, iris_fn=iris_small(0.48)), brows=((-5, -3, 1), (-5, -3, 1)))
EC["dizzy"] = eyes(dict(iris_fn=iris_spiral), dict(iris_fn=iris_spiral))
EC["relaxed"] = eyes(dict(closed="relaxed", lash_flick=True), dict(closed="relaxed", lash_flick=True), brows=((-1, 0, 0), (-1, 0, 0)))
EC["disgust"] = eyes(dict(lid=(0.5, 0.25), low=0.15), dict(lid=(0.5, 0.25), low=0.15), brows=((3, 0, 0), (3, 0, 0)))
EC["smirk"] = eyes(dict(lid=(0.12, 0.12)), dict(lid=(0.38, 0.32)), brows=((-2, -3, 1), (1, 1, 0)))
EC["soft"] = eyes(dict(lid=(0.3, 0.3), low=0.1), dict(lid=(0.3, 0.3), low=0.1))
EC["sparkle"] = eyes(dict(iris_fn=sparkle(0)), dict(iris_fn=sparkle(1)))
# ---- new: flirty / gaze set
EC["bedroom"] = eyes(dict(lid=(0.46, 0.5)), dict(lid=(0.46, 0.5)), brows=((1, 0, 0), (1, 0, 0)))
EC["bedroomSide"] = eyes(dict(lid=(0.46, 0.5), gaze=(5, 1)), dict(lid=(0.46, 0.5), gaze=(4, 1)), brows=((1, 0, 0), (0, -1, 1)))
EC["winkL"] = eyes(dict(closed="happy", lash_flick=True), dict(lid=(0.12, 0.15)), brows=((2, 2, 0), (-3, -3, 2)))
EC["winkR"] = eyes(dict(lid=(0.12, 0.15)), dict(closed="happy", lash_flick=True), brows=((-3, -3, 2), (2, 2, 0)))
EC["wink"] = EC["winkR"]
EC["lookUp"] = eyes(dict(gaze=(-1, -4), raise_px=1.0), dict(gaze=(-1, -4), raise_px=1.0), brows=((-3, -1, 0), (-3, -1, 0)))
EC["tease"] = eyes(dict(lid=(0.3, 0.3)), dict(lid=(0.08, 0.05)), brows=((2, 1, 0), (-4, -5, 3)))
EC["shy"] = eyes(dict(lid=(0.3, 0.34), gaze=(-5, 3)), dict(lid=(0.3, 0.34), gaze=(-4, 3)), brows=((-2, 0, 0), (-2, 0, 0)))
EC["eyeRoll"] = eyes(dict(lid=(0.3, 0.3), gaze=(3, -6)), dict(lid=(0.3, 0.3), gaze=(3, -6)), brows=((1, 1, 0), (1, 1, 0)))
EC["gazeL"] = both(gaze=(-6, 0))
EC["gazeR"] = both(gaze=(5, 0))
EC["gazeUp"] = both(gaze=(0, -4), raise_px=1.0)
EC["gazeDown"] = both(gaze=(0, 3), lid=(0.25, 0.25))
EC["smiling"] = eyes(dict(lid=(0.1, 0.12), low=0.3), dict(lid=(0.1, 0.12), low=0.3), brows=((-1, 0, 0), (-1, 0, 0)))
EC["sulk"] = eyes(dict(lid=(0.28, 0.2), gaze=(-5, 1)), dict(lid=(0.28, 0.2), gaze=(-5, 1)), brows=((2, -1, 0), (2, -1, 0)))
EC["dreamy"] = eyes(dict(lid=(0.36, 0.36), gaze=(0, -3), iris_fn=sparkle(0)), dict(lid=(0.36, 0.36), gaze=(0, -3), iris_fn=sparkle(1)), brows=((-2, 0, 0), (-2, 0, 0)))
EC["glance"] = eyes(dict(lid=(0.16, 0.18), gaze=(6, 0)), dict(lid=(0.16, 0.18), gaze=(5, 0)), brows=((0, 0, 0), (-2, -2, 1)))

# ------------------------------------------------------------------------------------------------ mouth
ML = EM.lum(M0)
win = np.zeros(ML.shape, bool); win[45:75, 95:165] = True
mm = win & (ML < 185)
lab_, n_ = nd.label(nd.binary_dilation(mm, iterations=2)); c_ = lab_[56, 126]
mm = mm & (lab_ == c_)
ys, xs = np.nonzero(mm); MX0, MY0, MX1, MY1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
LIP = np.median(M0[mm & (ML < 160)], 0)
MSK = np.median(M0[40:46, 110:145].reshape(-1, 3), 0)
INSIDE = np.array([112., 50., 54.]); TEETH = np.array([250., 248., 245.]); TONGUE = np.array([206., 110., 112.])
MC = 126.0                      # mouth centre x (her bars: upper 112..140 rows 53-58, lower 115..138 rows 62-64)
print("mouth box", (MX0, MY0, MX1, MY1), "lip", LIP.round(), "skin", MSK.round())


def mbase():
    out = M0.copy(); er = nd.binary_dilation(mm, iterations=2)
    out[er] = MSK; return out


def band(d, s, xa, xb, yf, tf, n=40):
    """filled band along y=yf(u) with thickness tf(u), u in -1..1 over x xa..xb"""
    us = np.linspace(-1, 1, n); xs_ = xa + (us + 1) / 2 * (xb - xa)
    top = [((x + .5) * s, (yf(u) - tf(u) / 2 + .5) * s) for x, u in zip(xs_, us)]
    bot = [((x + .5) * s, (yf(u) + tf(u) / 2 + .5) * s) for x, u in zip(xs_[::-1], us[::-1])]
    d.polygon(top + bot, fill=255)


def taper(t0, k=0.55, p=4): return lambda u: t0 * (1 - k * abs(u) ** p)


def paint(c, fn, col, hard=0.5, soft=0.2):
    cov = EM.cover(fn, c.shape[:2]); return EM.ink_paint(c, cov, col, hard, soft)


def mouth(*layers):
    c = mbase()
    for fn, col in layers: paint(c, fn, col)
    return c


def bars(up_y, lo_y, up=(111.5, 140.5), lo=(115.5, 137.5), ut=4.4, lt=3.0):
    return [(lambda d, s: band(d, s, up[0], up[1], up_y, taper(ut)), LIP), (lambda d, s: band(d, s, lo[0], lo[1], lo_y, taper(lt)), LIP)]


def ell(cx, cy, rx, ry): return lambda d, s: d.ellipse([(cx + .5 - rx) * s, (cy + .5 - ry) * s, (cx + .5 + rx) * s, (cy + .5 + ry) * s], fill=255)


def opening(cx, ytop, hw, depth, top_curve=0.0, teeth=0.0, tongue=0.0, lip_t=2.6, lower_lip=True):
    """open mouth: top edge y = ytop - top_curve*u^2 (her upper bar on it), bottom = a U of `depth`; teeth / tongue bands"""
    yt = lambda u: ytop - top_curve * u * u
    yb = lambda u: ytop + depth * (1 - u * u) ** 0.85 - top_curve * u * u * 0.4

    def shape(d, s):
        us = np.linspace(-1, 1, 40); xs_ = cx + us * hw
        d.polygon([((x + .5) * s, (yt(u) + .5) * s) for x, u in zip(xs_, us)] + [((x + .5) * s, (yb(u) + .5) * s) for x, u in zip(xs_[::-1], us[::-1])], fill=255)
    L = [(shape, INSIDE)]
    if teeth:
        def th(d, s):
            us = np.linspace(-0.86, 0.86, 30); xs_ = cx + us * hw
            d.polygon([((x + .5) * s, (yt(u) + .5) * s) for x, u in zip(xs_, us)] + [((x + .5) * s, (yt(u) + teeth + .5) * s) for x, u in zip(xs_[::-1], us[::-1])], fill=255)
        L.append((th, TEETH))
    if tongue:
        L.append((lambda d, s: d.chord([(cx + .5 - hw * .62) * s, (ytop + depth - tongue * 2 + .5) * s, (cx + .5 + hw * .62) * s, (ytop + depth + .5) * s], 180, 360, fill=255) or
                  d.rectangle([(cx + .5 - hw * .62) * s, (ytop + depth - tongue + .5) * s, (cx + .5 + hw * .62) * s, (ytop + depth + .6) * s], fill=255), TONGUE))
    L.append((lambda d, s: band(d, s, cx - hw - 1.2, cx + hw + 1.2, lambda u: yt(u) - lip_t / 2 + 0.6, taper(lip_t + 0.6, 0.6)), LIP))
    if lower_lip:
        L.append((lambda d, s: band(d, s, cx - hw * 0.8, cx + hw * 0.8, lambda u: yb(u * 0.8) + 1.3, taper(2.4, 0.7)), LIP))
    return L


def oval_mouth(cx, cy, rx, ry, ring=2.2, teeth=False, tongue=False):
    L = [(ell(cx, cy, rx + ring * 0.75, ry + ring * 1.05), LIP), (ell(cx, cy, rx, ry), INSIDE)]
    if teeth: L.append((lambda d, s: d.chord([(cx + .5 - rx * .8) * s, (cy + .5 - ry * 1.0) * s, (cx + .5 + rx * .8) * s, (cy + .5 + ry * 0.2) * s], 180, 360, fill=255), TEETH))
    if tongue: L.append((lambda d, s: d.chord([(cx + .5 - rx * .7) * s, (cy + .5) * s, (cx + .5 + rx * .7) * s, (cy + .5 + ry) * s], 0, 180, fill=255), TONGUE))
    return L


MC_ = {}
MC_["neutral"] = M0.copy()
MC_["smile"] = mouth(*bars(lambda u: 56.6 - 2.8 * u * u, lambda u: 63.2 - 1.6 * u * u))
MC_["smileOpen"] = mouth(*opening(MC, 56.0, 12.5, 6.0, top_curve=2.4, teeth=2.2, tongue=1.4))
MC_["talkA"] = mouth(*opening(MC, 56.0, 8.5, 7.0, top_curve=0.8, teeth=2.0, tongue=1.8))
MC_["talkO"] = mouth(*oval_mouth(MC, 59.0, 3.4, 4.2, ring=2.4))
MC_["surprised"] = mouth(*oval_mouth(MC, 59.5, 4.6, 5.6, ring=2.2))
MC_["frown"] = mouth(*bars(lambda u: 55.6 + 2.4 * u * u, lambda u: 63.4 + 1.2 * u * u, up=(112.5, 139.5), lo=(117.5, 135.5)))
MC_["shout"] = mouth(*opening(MC, 55.0, 13.0, 11.0, top_curve=0.6, teeth=2.4, tongue=2.6))
MC_["blep"] = mouth(*bars(lambda u: 56.4 - 2.4 * u * u, lambda u: 63.2 - 1.4 * u * u, lo=(115.5, 126.5)),
                    (ell(131.0, 60.2, 3.2, 2.9), TONGUE), (lambda d, s: d.line([(131.5 * s, 58.6 * s), (131.5 * s, 61.4 * s)], fill=255, width=int(0.9 * s)), np.array([180., 88., 92.])))


def catw(d, s):
    us = np.linspace(-1, 1, 50); pts = [((MC + .5 + u * 11) * s, (58.5 + 2.6 * abs(np.sin(np.pi * u)) - 1.4 * u * u + .5) * s) for u in us]
    d.line(pts, fill=255, width=int(2.6 * s), joint="curve")


MC_["cat"] = mouth((catw, LIP))
MC_["gasp"] = mouth(*oval_mouth(MC, 59.5, 2.0, 2.6, ring=2.0))
MC_["bigShock"] = mouth(*oval_mouth(MC, 61.0, 7.5, 8.0, ring=2.0, tongue=True))


def disg(d, s):
    us = np.linspace(-1, 1, 50); pts = [((MC + .5 + u * 13) * s, (58.0 + 1.1 * np.sin(u * 2.6 * np.pi) + 1.4 * u + .5) * s) for u in us]
    d.line(pts, fill=255, width=int(3.0 * s), joint="curve")


MC_["disgust"] = mouth((disg, LIP))
sm = lambda u: 56.2 - 3.4 * ((u + 1) / 2) ** 2.4 + 0.4
MC_["smirk"] = mouth((lambda d, s: band(d, s, 112.5, 141.0, sm, taper(4.2, 0.5)), LIP),
                     (lambda d, s: band(d, s, 116.5, 136.5, lambda u: 63.0 - 1.6 * ((u + 1) / 2) ** 2.4, taper(2.8, 0.6)), LIP))
MC_["blushSmile"] = MC_["smile"]
MC_["blushGasp"] = MC_["gasp"]
# ---- new
MC_["softSmile"] = mouth(*bars(lambda u: 56.0 - 1.5 * u * u, lambda u: 63.3 - 0.9 * u * u, ut=4.4, lt=3.4))
MC_["pout"] = mouth((lambda d, s: band(d, s, 117.5, 135.0, lambda u: 56.6 + 0.9 * u * u, taper(4.6, 0.45, 2)), LIP),
                    (lambda d, s: band(d, s, 118.5, 134.0, lambda u: 62.0 + 0.6 * u * u, taper(4.6, 0.55, 2)), LIP))
MC_["lipBite"] = mouth((lambda d, s: band(d, s, 112.0, 140.5, lambda u: 56.0 - 1.8 * ((u + 1) / 2) ** 2, taper(4.2)), LIP),
                       (lambda d, s: band(d, s, 115.5, 137.5, lambda u: 61.9 - 0.8 * ((u + 1) / 2) ** 2, taper(3.6, 0.6)), LIP),
                       (lambda d, s: d.rounded_rectangle([119.6 * s, 58.2 * s, 126.4 * s, 60.5 * s], radius=int(0.8 * s), fill=255), TEETH))
MC_["laugh"] = mouth(*opening(MC, 55.6, 13.5, 9.0, top_curve=2.8, teeth=2.4, tongue=2.4))
MC_["oh"] = mouth(*oval_mouth(MC, 59.4, 2.6, 3.2, ring=2.6))
MC_["sadPout"] = mouth((lambda d, s: band(d, s, 115.0, 137.0, lambda u: 55.8 + 2.2 * u * u, taper(4.2, 0.5)), LIP),
                       (lambda d, s: band(d, s, 119.0, 133.0, lambda u: 62.4 + 0.8 * u * u, taper(4.4, 0.55, 2)), LIP))
MC_["kiss"] = mouth((ell(MC, 59.4, 5.6, 4.6), LIP),
                    (lambda d, s: d.line([((MC - 2.4) * s, 59.9 * s), ((MC + 3.4) * s, 59.9 * s)], fill=255, width=int(1.2 * s)), INSIDE))
MC_["kissBlow"] = mouth((ell(MC, 59.4, 5.4, 4.8), LIP), (ell(MC, 59.6, 1.6, 1.5), INSIDE))
MC_["talkClosed"] = mouth(*bars(lambda u: 56.8 + 0.3 * u * u, lambda u: 60.8 + 0.2 * u * u, ut=4.2, lt=2.8))
MC_["talkSmall"] = mouth((lambda d, s: band(d, s, 116.5, 136.5, lambda u: 59.6, taper(3.0, 0.7)), INSIDE), *bars(lambda u: 56.0, lambda u: 63.6, lt=2.8))
MC_["talkWide"] = mouth(*opening(MC, 55.6, 11.0, 9.5, top_curve=0.8, teeth=2.2, tongue=2.2))
MC_["talkOO"] = mouth(*oval_mouth(MC, 59.4, 2.2, 2.8, ring=3.0))
MC_["talkEE"] = mouth((lambda d, s: band(d, s, 113.5, 138.5, lambda u: 59.8 - 0.6 * u * u, taper(3.6, 0.6)), INSIDE),
                      (lambda d, s: band(d, s, 115.0, 137.0, lambda u: 59.2 - 0.6 * u * u, taper(2.3, 0.6)), TEETH),
                      *bars(lambda u: 56.6 - 1.2 * u * u, lambda u: 62.6 - 0.8 * u * u, up=(111.0, 141.0), lo=(115.0, 137.0), lt=2.8))
sl = lambda u: 56.2 - 3.4 * ((1 - u) / 2) ** 2.4 + 0.4
MC_["smirkL"] = mouth((lambda d, s: band(d, s, 111.0, 139.5, sl, taper(4.2, 0.5)), LIP),
                      (lambda d, s: band(d, s, 115.5, 135.5, lambda u: 63.0 - 1.6 * ((1 - u) / 2) ** 2.4, taper(2.8, 0.6)), LIP))
MC_["grin"] = mouth((lambda d, s: band(d, s, 113.0, 139.0, lambda u: 59.4 - 2.4 * u * u, lambda u: 3.6 * (1 - 0.55 * u ** 4)), INSIDE),
                    (lambda d, s: band(d, s, 114.0, 138.0, lambda u: 58.9 - 2.4 * u * u, lambda u: 2.6 * (1 - 0.6 * u ** 4)), TEETH),
                    *bars(lambda u: 56.2 - 2.6 * u * u, lambda u: 62.9 - 2.0 * u * u, up=(110.5, 141.5), lt=2.8))
MC_["parted"] = mouth(*bars(lambda u: 55.7, lambda u: 63.2, ut=4.6, lt=3.4), (lambda d, s: band(d, s, 119.0, 133.0, lambda u: 59.5, taper(1.6, 0.8)), INSIDE))

# ------------------------------------------------------------------------------------------------ blush (f001 coords)
ROSE = np.array([236., 116., 124.])


def blush_layer(shape, origin):
    """her cheeks: flat rose oval at 30 % (one soft step), in f001 coordinates -> alpha for a cell at `origin`"""
    ox, oy = origin; a = np.zeros(shape[:2], np.float32)
    # eye-cell coords, kept on the front cheek facets (the outer cheek is foreshortened in the f001 projection and
    # would stretch into a band at 3/4)
    for (cx, cy) in ((82.5, 69.5), (163.5, 69.5)):
        fx, fy = cx + FC.EYE_RECT[0] - ox, cy + FC.EYE_RECT[1] - oy
        cov = EM.cover(lambda d, s: d.ellipse([(fx - 10.5) * s, (fy - 4.4) * s, (fx + 10.5) * s, (fy + 4.4) * s], fill=255), shape[:2])
        a = np.maximum(a, np.where(cov >= 0.5, 0.30, np.where(cov >= 0.15, 0.15, 0.0)))
    return a


def blushed(img, origin):
    a = blush_layer(img.shape, origin)[..., None]; return img * (1 - a) + ROSE * a


# ------------------------------------------------------------------------------------------------ write
def atomic_save(arr, path):
    tmp = path + ".tmp.png"; Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(tmp); os.replace(tmp, path)


PREV = sys.argv[sys.argv.index("--preview") + 1] if "--preview" in sys.argv else None
sheets = {}
for tag, names, cells, rect in (("eyes", EYES, EC, FC.EYE_RECT), ("mouth", MOUTHS, MC_, FC.MOUTH_RECT)):
    at = np.zeros((CH * ROWS, CW * COLS, 3), np.float32)
    for k in range(64):
        nme = names[k % 32]; img = cells[nme].astype(np.float32)
        if k >= BLUSH or nme in ("blushSmile", "blushGasp"): img = blushed(img, rect)
        r, c = divmod(k, COLS); at[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW] = img
    sheets[tag] = at
    if PREV: atomic_save(at, f"{PREV}/face_{tag}.png"); continue
    atomic_save(at, f"tex/face_{tag}.png")              # what tools/anim/bl_build2.py embeds in the GLBs
    atomic_save(at, f"out/face_{tag}.png")              # same sheet next to the GLBs, for engines that load it apart
# "_meta" in face_tracks.json (build_anims.py keeps "_" keys and rewrites only the clip tracks)
SUF = "+blush"
meta = dict(cells=COLS, cols=COLS, rows=ROWS, cell_px=[CW, CH], blush_suffix=SUF,
            face_eyes=EYES + [n + SUF for n in EYES], face_mouth=MOUTHS + [n + SUF for n in MOUTHS],
            note="64 cells per sheet: cell k = column k % cols, row k // cols (row 0 = top). bl_build2.py scales the face UVs "
                 "to ONE cell at the top-left (u * 16/cols, v into the top row), so an engine only sets "
                 "map.offset = ((k % cols)/cols, floor(k/cols)/rows) (glTF textures, flipY=false), no repeat. "
                 "Row 0 = the 16 original names in the original order (old k/16 engines still show them). "
                 "'+blush' names = the same cell with her blush: put it on the eyes AND the mouth together. "
                 "L/R in names = screen left/right seen from the front (winkL closes the eye on screen left = her right eye).")
FT = "out/face_tracks.json"
if not PREV:
    T = json.load(open(FT)) if os.path.exists(FT) else {}
    T.pop("_atlas", None); T["_meta"] = meta
    tmp = FT + ".tmp"; json.dump(T, open(tmp, "w"), indent=1); os.replace(tmp, FT)

# flat preview with names
try: font = ImageFont.truetype("arial.ttf", 13)
except OSError: font = ImageFont.load_default()
tiles = []
for tag, names, rect, crop in (("eyes", EYES, FC.EYE_RECT, (12, 76, 40, 216)), ("mouth", MOUTHS, FC.MOUTH_RECT, (30, 90, 70, 190))):
    at = sheets[tag]
    for k in range(64):
        r, c = divmod(k, COLS); cell = at[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW][crop[0]:crop[1], crop[2]:crop[3]]
        im = Image.fromarray(np.clip(cell, 0, 255).astype(np.uint8)); im = im.resize((im.width * 2, im.height * 2), Image.NEAREST)
        t = Image.new("RGB", (352, im.height + 18), (24, 24, 28)); t.paste(im, ((352 - im.width) // 2, 18))
        ImageDraw.Draw(t).text((4, 2), f"{k:02d} {names[k % 32]}{' +blush' if k >= 32 else ''}", fill=(240, 240, 240), font=font)
        tiles.append(t)
W8 = 8; rows = []
for i in range(0, len(tiles), W8):
    grp = tiles[i:i + W8]; h = max(t.height for t in grp); row = Image.new("RGB", (352 * W8, h), (24, 24, 28))
    for j, t in enumerate(grp): row.paste(t, (j * 352, 0))
    rows.append(row)
sheet = Image.new("RGB", (352 * W8, sum(r.height for r in rows)), (24, 24, 28)); y = 0
for r in rows: sheet.paste(r, (0, y)); y += r.height
sheet.save(f"{PREV}/face_cells2.png" if PREV else "review/face_cells2.png")
print("face atlases v2 written:", len(EYES), "eyes,", len(MOUTHS), "mouths, x2 with blush")
