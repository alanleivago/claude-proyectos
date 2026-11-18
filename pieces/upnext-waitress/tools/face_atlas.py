"""Her expression atlases (16 x 4 cells, Ashley's cell names), drawn at the native MML2 pixel size from HER face pixels
in ST1AT_40 (16-colour CLUT + blush / heart pinks), then x4 nearest so the GLB samples crisp texels.
  row 0-1 = 32 expressions, rows 2-3 = the same with blush (+blush) ; cell k = column k % 16, row k // 16
python -I tools/face_atlas.py  -> tex/face_eyes.png, tex/face_mouth.png, ref/face_meta.json,
                                  review/face_cells.png, review/face_combo.png"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from geom2 import EYE_RECT, MOUTH_RECT, CHEEK_RECT, FACE_COLS, FACE_ROWS, ASSET

UP = 4
SRC = np.array(Image.open(os.path.join(ASSET, "ST1AT_40.png")).convert("RGB")).astype(int)
H_ = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)])
P = {c: H_(h) for c, h in zip("bcdefghijklmnop", ["#393939", "#394242", "#42524a", "#4a5a52", "#845a42", "#a57352", "#7b738c",
                                                    "#c6946b", "#bdadbd", "#e7b58c", "#cebdce", "#efcea5", "#decede", "#ffe7c6", "#efe7ef"])}
P.update({"t": H_("#e07a86"), "T": H_("#b8505e"), "r": H_("#e46a8c"), "R": H_("#a8385a"), "y": H_("#f6c2ac"), "Y": H_("#e88e88")})
EYES = ["open", "half", "blink", "happy", "surprised", "angry", "sad", "wink", "hearts", "shocked", "winkBrow", "relaxed", "boredSexy",
        "smirk", "soft", "sparkle", "bedroom", "smug", "sideEyeL", "winkR", "lookUp", "tease", "shy", "challenge",
        "gazeL", "gazeR", "gazeUp", "gazeDown", "smiling", "sulk", "adoring", "sideEyeR"]
# flirty set (v6, @missmedannypsx): smug <- bedroomSide, sideEyeL <- winkL, challenge <- eyeRoll, adoring <- dreamy,
# sideEyeR <- glance ; mouths: sweetSmile <- oh, laughOpen <- kissBlow, ahTongue <- parted (row-0 cells untouched)
MOUTHS = ["neutral", "smile", "smileOpen", "talkA", "talkO", "surprised", "frown", "shout", "blep", "cat", "gasp", "bigShock",
          "partedTeeth", "smirk", "blushSmile", "parted", "softSmile", "pout", "lipBite", "laugh", "sweetSmile", "sadPout", "kiss",
          "laughOpen", "talkClosed", "talkSmall", "talkWide", "talkOO", "talkEE", "smirkL", "grin", "ahTongue"]

def is_c(img, x, y, cs): return any((img[y, x] == P[c]).all() for c in cs)

# ------------------------------------------------------------------ her eyes: boxes, masks, erased base
EYE = {0: dict(x0=10, x1=24, iris=(17, 21), inner=24, outer=10), 1: dict(x0=37, x1=51, iris=(40, 44), inner=37, outer=51)}
Y0, Y1 = 31, 44                       # eye rows (lash top .. lower lid)
SKINC = "kmo"


def eye_mask(img, e):
    m = np.zeros(img.shape[:2], bool)
    for y in range(Y0, Y1 + 1):
        for x in range(e["x0"], e["x1"] + 1):
            if not is_c(img, x, y, SKINC): m[y, x] = True
    return m


def brow_mask(img, side):
    m = np.zeros(img.shape[:2], bool)
    xs = range(9, 24) if side == 0 else range(38, 53)
    for y in range(22, 29):
        for x in xs:
            if is_c(img, x, y, "cfgi"): m[y, x] = True
    return m


EM = {s: eye_mask(SRC, EYE[s]) for s in (0, 1)}
BM = {s: brow_mask(SRC, s) for s in (0, 1)}
BASE = SRC.copy()                     # eyes and brows erased: Laplace inpaint from the surrounding skin, snapped to her skin CLUT
def inpaint(img, mask, cols="kmo", iters=400):
    f = img.astype(float).copy(); f[mask] = f[~mask].mean(0)
    for _ in range(iters):
        nb = (np.roll(f, 1, 0) + np.roll(f, -1, 0) + np.roll(f, 1, 1) + np.roll(f, -1, 1)) / 4
        f[mask] = nb[mask]
    pal = np.array([P[c] for c in cols], float)
    q = pal[np.argmin(((f[mask][:, None, :] - pal[None]) ** 2).sum(-1), 1)]
    out = img.copy(); out[mask] = q.astype(int); return out
_m = np.zeros(SRC.shape[:2], bool)
for s in (0, 1): _m |= EM[s]
BASE = inpaint(BASE, _m)
# v3: closed lids sit on a clean skin split (mid tone above the lash line, light lower face below, darker outer
# cheek edge) instead of the quantised inpaint patches
for s in (0, 1):
    e = EYE[s]
    for y, x in zip(*np.nonzero(EM[s])):
        outer = (x <= e["x0"] + 1) if s == 0 else (x >= e["x1"] - 1)
        if outer: c = "k" if y <= 43 else "m"
        else: c = "k" if y <= 38 else ("m" if y == 39 else "o")
        if is_c(SRC, x, y, "o") and y > 37: c = "o"
        BASE[y, x] = P[c]
_b = np.zeros(SRC.shape[:2], bool)
for s in (0, 1): _b |= BM[s]
BASE = inpaint(BASE, _b, "km")


def sclera_fill(img, e, x, y):
    for d in range(1, 8):
        for xx in (x - d, x + d):
            if e["x0"] <= xx <= e["x1"] and not (e["iris"][0] <= xx <= e["iris"][1]) and is_c(img, xx, y, "jlnp"):
                return img[y, xx].copy()
    return P["p"].copy()


def put(img, x, y, c):
    if 0 <= y < img.shape[0] and 0 <= x < img.shape[1]: img[y, x] = P[c] if isinstance(c, str) else c


def stamp(img, art, x0, y0):
    for j, row in enumerate(art):
        for i, ch in enumerate(row):
            if ch != ".": put(img, x0 + i, y0 + j, ch)


# ------------------------------------------------------------------ eye operations (side 0 = screen-left)
def eye_draw(img, s, lid=0, low=0, closed=None, gx=0, gy=0, iris="n", spark=False):
    e = EYE[s]; m = EM[s]
    if closed:                                                          # erase, then draw the closed lash line
        for y, x in zip(*np.nonzero(m)): img[y, x] = BASE[y, x]
        w = e["x1"] - e["x0"]; cx = (e["x0"] + e["x1"]) / 2
        for x in range(e["x0"] + 1, e["x1"]):
            t = (x - cx) / (w / 2)
            if closed == "blink": y = 39 + round(1.6 * (1 - t * t)) - 1
            elif closed == "happy": y = 40 - round(2.6 * (1 - t * t))
            else: y = 40 - round(1.2 * (1 - t * t))                    # 'soft' closed: flatter content arc
            edge = abs(t) > 0.8
            put(img, x, y, "f" if edge else "b")
            if not edge: put(img, x, y + 1 if closed != "happy" else y + 1, "g" if closed == "happy" else "f")
        ox = e["outer"]; dx = -1 if s == 0 else 1                         # lash flick at the outer corner
        put(img, ox + dx * 0, 38 if closed != "happy" else 39, "b")
        return
    src = img.copy()
    if gx or gy or iris != "n":                                         # rebuild the iris
        ix0, ix1 = e["iris"]
        sc = {}
        for y in range(33, Y1):
            for x in range(ix0, ix1 + 1):
                if m[y, x] and is_c(src, x, y, "bdh") or (m[y, x] and is_c(src, x, y, "p") and ix0 <= x <= ix1):
                    sc[(x, y)] = sclera_fill(src, e, x, y)
        for (x, y), c in sc.items(): img[y, x] = c
        opening = m & np.array([[is_c(src, x, y, "bdhjlnp") for x in range(src.shape[1])] for y in range(src.shape[0])])
        opening[:34] = False
        cx, cy = (ix0 + ix1) // 2 + gx, 39 + gy
        if iris == "n":
            for (x, y) in sc:
                xs, ys = x + gx, y + gy
                if opening[ys, xs] or (ys >= 33 and m[ys, xs]): img[ys, xs] = src[y, x]
        elif iris == "small":
            stamp_iris(img, opening, cx, cy, [".bb.", "bbbb", "bhpb", "bbbb", ".bb."], 2, 2)
        elif iris == "tiny":
            stamp_iris(img, opening, cx, cy, ["bb", "bb", "bb"], 1, 1)
        elif iris == "heart":
            stamp_iris(img, opening, cx, cy, [".r.r.", "rrrrr", "rRrrr", ".rrr.", "..r.."], 2, 2, force=True)
        elif iris == "spiral":
            for y, x in zip(*np.nonzero(m)): img[y, x] = BASE[y, x]
            stamp(img, [".bbbb..", "b....b.", "b.bb..b", "b.b.b.b", "b..b..b", ".b...b.", "..bbb.."], cx - 3, 35)
            return
    if spark:
        ix0, ix1 = e["iris"]; cx = (ix0 + ix1) // 2 + gx
        for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)): put(img, cx - 1 + dx, 36 + gy + dy, "p")
        put(img, cx + 1, 41 + gy, "p"); put(img, cx + 2, 40 + gy, "l")
    if lid:                                                             # upper lid down to row Y0 + lid
        yl = Y0 + lid
        xs = [x for x in range(e["x0"], e["x1"] + 1) if m[yl:Y1, x].any()]
        for y in range(Y0, yl):
            for x in range(e["x0"], e["x1"] + 1):
                if m[y, x] or y >= Y0: img[y, x] = BASE[y, x] if m[y, x] else img[y, x]
        for x in xs:
            put(img, x, yl, "b"); put(img, x, yl - 1, "f" if x in (xs[0], xs[-1]) else "i")
        put(img, xs[0] if s == 0 else xs[-1], yl - 1, "b")
    if low:                                                             # lower lid pushed up (smile squint)
        yb = Y1 - low
        for y in range(yb + 1, Y1 + 1):
            for x in range(e["x0"], e["x1"] + 1):
                if m[y, x]: img[y, x] = BASE[y, x]
        for x in range(e["x0"] + 2, e["x1"] - 1):
            if m[yb, x]: put(img, x, yb + 1, "i")


def stamp_iris(img, opening, cx, cy, art, ox, oy, force=False):
    for j, row in enumerate(art):
        for i, ch in enumerate(row):
            x, y = cx - ox + i, cy - oy + j
            if ch != "." and (force or opening[y, x]): put(img, x, y, ch)


def brow_draw(img, s, dy=0, tilt=0):
    """move her brow: dy (+ down), tilt = inner end offset (+ down, angry) in px"""
    m = BM[s]; src = img.copy()
    for y, x in zip(*np.nonzero(m)): img[y, x] = BASE[y, x]
    xs = [x for x in range(img.shape[1]) if m[:, x].any()]; xi, xo = (max(xs), min(xs)) if s == 0 else (min(xs), max(xs))
    for y, x in zip(*np.nonzero(m)):
        t = (x - xo) / (xi - xo)
        put(img, x, y + dy + round(tilt * t), src[y, x])


def blush_eyes(img):
    return                                                      # v8b: the blush lives in the cheek band (face_cheeks)


def cheek_cell(name):
    return SRC.copy()


BLUSH_A = 0.68                                                  # v9: ~32 % lighter than the solid v8 blush


def blush_cheeks(img):
    """v9: soft blush, same place as v8 (cheeks, clear gap below the lashes): a radial falloff blended over her skin
    (fill + the three '///' hatch strokes), no hard rectangle edge"""
    src = img.copy()
    for s, x0 in ((0, 11), (1, 40)):
        cx, cy = x0 + 5.0, 49.0
        wgt = {}
        for y in range(47, 52):
            for x in range(x0 - 2, x0 + 13):
                r2 = ((x - cx) / 6.8) ** 2 + ((y - cy) / 2.1) ** 2
                if r2 < 1 and is_c(src, x, y, "mok"): wgt[(x, y)] = (1 - r2) ** 0.85
        for (x, y), w in wgt.items():
            img[y, x] = np.round(src[y, x] + (P["y"] - src[y, x]) * BLUSH_A * w).astype(int)
        for k in range(3):
            bx = x0 + 2 + 3 * k
            for j in range(3):
                x, y = bx + 2 - j, 48 + j
                if (x, y) in wgt:
                    w = wgt[(x, y)] ** 0.6
                    img[y, x] = np.round(img[y, x] + (P["Y"] - img[y, x]) * BLUSH_A * w).astype(int)


def eyes_cell(name):
    img = SRC.copy(); n = name
    if n == "open": pass
    elif n == "half": [eye_draw(img, s, lid=5) for s in (0, 1)]
    elif n == "blink": [eye_draw(img, s, closed="blink") for s in (0, 1)]
    elif n == "happy": [eye_draw(img, s, closed="happy") or brow_draw(img, s, dy=-1) for s in (0, 1)]
    elif n == "surprised": [eye_draw(img, s, iris="small") or brow_draw(img, s, dy=-2) for s in (0, 1)]
    elif n == "angry": [eye_draw(img, s, lid=3) or brow_draw(img, s, dy=1, tilt=3) for s in (0, 1)]
    elif n == "sad": [eye_draw(img, s, lid=3, gy=1) or brow_draw(img, s, dy=-1, tilt=-3) for s in (0, 1)]
    elif n in ("wink", "winkR"): eye_draw(img, 1, closed="happy"); brow_draw(img, 1, dy=1); brow_draw(img, 0, dy=-1)
    elif n == "sideEyeL": [eye_draw(img, s, lid=1, gx=-3) for s in (0, 1)]; brow_draw(img, 1, dy=-2, tilt=-1); brow_draw(img, 0, dy=1, tilt=1)
    elif n == "hearts": [eye_draw(img, s, iris="heart") or brow_draw(img, s, dy=-1) for s in (0, 1)]
    elif n == "shocked": [eye_draw(img, s, iris="tiny") or brow_draw(img, s, dy=-2) for s in (0, 1)]
    elif n == "winkBrow":                                       # v10 (@askforvera): sly wink, the open eye half-lidded, brow up
        eye_draw(img, 1, closed="happy"); brow_draw(img, 1, dy=1, tilt=1)
        eye_draw(img, 0, lid=4, gx=1); brow_draw(img, 0, dy=-2, tilt=-2)
    elif n == "relaxed": [eye_draw(img, s, closed="soft") or brow_draw(img, s, dy=0, tilt=-1) for s in (0, 1)]
    elif n == "boredSexy": [eye_draw(img, s, lid=5, low=1, gy=-1, gx=1) or brow_draw(img, s, dy=-2, tilt=0) for s in (0, 1)]   # v10: unimpressed-seductive
    elif n == "smirk": eye_draw(img, 0, lid=3); eye_draw(img, 1, lid=1); brow_draw(img, 1, dy=-2); brow_draw(img, 0, dy=1, tilt=1)
    elif n == "soft": [eye_draw(img, s, lid=2, low=1) or brow_draw(img, s, tilt=-1) for s in (0, 1)]
    elif n == "sparkle": [eye_draw(img, s, spark=True) or brow_draw(img, s, dy=-1) for s in (0, 1)]
    elif n == "bedroom": [eye_draw(img, s, lid=6, gy=1) or brow_draw(img, s, dy=-1, tilt=-1) for s in (0, 1)]
    elif n == "smug": [eye_draw(img, s, lid=4, low=1) for s in (0, 1)]; brow_draw(img, 0, dy=0, tilt=1); brow_draw(img, 1, dy=-2, tilt=-1)
    elif n == "lookUp": [eye_draw(img, s, gy=-2) or brow_draw(img, s, dy=-1) for s in (0, 1)]
    elif n == "tease": eye_draw(img, 0, lid=4, gx=1); eye_draw(img, 1, closed="happy"); brow_draw(img, 0, dy=-2); brow_draw(img, 1, dy=1)
    elif n == "shy": [eye_draw(img, s, lid=3, gy=2, gx=-1) or brow_draw(img, s, dy=-1, tilt=-2) for s in (0, 1)]
    elif n == "challenge": [eye_draw(img, s, lid=3, gy=-1) or brow_draw(img, s, dy=2, tilt=2) for s in (0, 1)]
    elif n == "gazeL": [eye_draw(img, s, gx=-2) for s in (0, 1)]
    elif n == "gazeR": [eye_draw(img, s, gx=2) for s in (0, 1)]
    elif n == "gazeUp": [eye_draw(img, s, gy=-2) for s in (0, 1)]
    elif n == "gazeDown": [eye_draw(img, s, gy=2, lid=2) for s in (0, 1)]
    elif n == "smiling": [eye_draw(img, s, low=3) or brow_draw(img, s, dy=-1) for s in (0, 1)]
    elif n == "sulk": [eye_draw(img, s, lid=4, gx=2, gy=1) or brow_draw(img, s, dy=1, tilt=2) for s in (0, 1)]
    elif n == "adoring": [eye_draw(img, s, lid=2, gy=-2) or brow_draw(img, s, dy=-1, tilt=-1) for s in (0, 1)]
    elif n == "sideEyeR": [eye_draw(img, s, lid=1, gx=3) for s in (0, 1)]; brow_draw(img, 0, dy=-2, tilt=-1); brow_draw(img, 1, dy=1, tilt=1)
    else: raise KeyError(n)
    for s_ in (0, 1): add_lashes(img, s_)
    return img


def add_lashes(img, s):
    """v7 lashes: thicker dark upper lash line tapering to the inner corner, two flicked lashes at the outer corner and a
    small lower flick; on closed lids a two-pixel wing on the outer end of the arc"""
    e = EYE[s]; dx = -1 if s == 0 else 1; xs = range(e["x0"], e["x1"] + 1)
    opened = any(is_c(img, x, y, "jlnph") for x in xs for y in range(33, Y1))
    tops = {}
    for x in xs:
        for y in range(29, Y1 + 1):
            if is_c(img, x, y, "bc"): tops[x] = y; break
    if not tops: return
    xo = min(tops) if s == 0 else max(tops); xi = max(tops) if s == 0 else min(tops)
    if opened:
        span = abs(xi - xo) or 1
        for x, y in tops.items():
            if abs(x - xo) <= 0.72 * span and is_c(img, x, y - 1, "kmoifg"): put(img, x, y - 1, "b")
        yo = min(tops[x] for x in tops if abs(x - xo) <= 1) - 1
        for px, py in ((xo + dx, yo + 1), (xo + 2 * dx, yo), (xo + dx, yo - 1), (xo + 2 * dx, yo - 2)):
            put(img, px, py, "b")
        bots = [y for x in xs if abs(x - xo) <= 2 for y in range(33, Y1 + 1) if is_c(img, x, y, "jlnphbd")]
        if bots: put(img, xo + dx, max(bots) + 1, "g")
    else:
        arc = [(x, y) for x in xs for y in range(35, Y1 + 1) if is_c(img, x, y, "b")]
        if not arc: return
        xa = min(a[0] for a in arc) if s == 0 else max(a[0] for a in arc); ya = min(a[1] for a in arc if a[0] == xa)
        for px, py in ((xa + dx, ya - 1), (xa + 2 * dx, ya - 2), (xa + dx, ya)):
            put(img, px, py, "b" if py < ya else "f")


# ------------------------------------------------------------------ mouths (ASCII pixel art on her erased mouth)
MBASE = SRC.copy()
for y in range(55, 64):
    for x in range(24, 37):
        MBASE[y, x] = P["o"]
MART = {
    "smile": ["g.......g", ".ggggggg."],
    "smileOpen": ["ggggggggg", ".gffffffg.", "..gtttg.."],
    "talkA": [".ggggg.", "gfffffg", "gfffffg", ".gtttg.", "..ggg.."],
    "talkO": [".ggg.", "gfffg", "gfffg", "gfffg", ".ggg."],
    "surprised": [".gg.", "gffg", "gffg", ".gg."],
    "frown": [".ggggggg.", "g.......g"],
    "shout": [".ggggggggg.", "gpppppppppg", "gfffffffffg", "gfffffffffg", ".gfftttffg.", "..ggggggg.."],
    "blep": ["g.......g", ".ggggggg.", "..gttg...", "..gtTg...", "...gg...."],
    "cat": ["g...g...g", ".g.g.g.g.", "..g...g.."],
    "gasp": [".ggg.", "gfffg", "gfffg", "gfffg", "gtttg", ".ggg."],
    "bigShock": ["..ggggg..", ".gfffffg.", "gfffffffg", "gfffffffg", "gfffffffg", ".gtttttg.", "..ggggg.."],
    "disgust": ["gg.....gg", "gpgpgpgpg", ".ggggggg."],
    "smirk": ["........g", ".......g.", "ggggggg.."],
    "blushSmile": ["g.........g", ".gfffffffg.", "..ggggggg.."],
    "blushGasp": [".ggg.", "gfffg", "gtttg", ".ggg."],
    "softSmile": ["g.....g", ".ggggg."],
    "pout": [".iiii.", "igffgi", ".iiii."],
    "lipBite": ["ggggggg", "gpppppg", ".iiiii.", "..kkk.."],
    "laugh": ["ggggggggggg", "gpppppppppg", ".gfffffffg.", "..gtttttg..", "...ggggg..."],
    "sweetSmile": ["g.......g", ".g.....g.", "..ggggg.."],
    "sadPout": ["..ggg..", ".g...g.", "g.....g"],
    "kiss": [".ii.", "iffi", ".ii."],
    "laughOpen": ["ggggggggggg", "gfffffffffg", "gfftttttffg", ".gfftttffg.", "..ggggggg.."],
    "talkClosed": ["ggggggg"],
    "talkSmall": [".ggggg.", "gfffffg", ".ggggg."],
    "talkWide": ["ggggggggg", "gfffffffg", ".ggggggg."],
    "talkOO": [".ii.", "igfi", "igfi", ".ii."],
    "talkEE": ["ggggggggg", "gpppppppg", ".ggggggg."],
    "smirkL": ["g........", ".g.......", "..ggggggg"],
    "grin": ["g.........g", "gpppppppppg", ".gpppppppg.", "..ggggggg.."],
    "ahTongue": [".gggg.", "gfttfg", ".gggg."],
}
MCX, MCY = 30, 58                     # her mouth centre (px)


LIPMASK = [(x, y) for y in range(56, 64) for x in range(24, 37) if not is_c(SRC, x, y, "o")]


def lips(dy=lambda x: 0, sx=1.0, gap=0, close=True, tongue=False, cat=False, hole=False):
    """her own full painted lips, deformed: per-column lift (smile / smirk), horizontal squeeze (pout / kiss), a gap
    between the lips (parted / tongue). Shading pixels move with the lips, nothing is redrawn as a thin line."""
    out = MBASE.copy(); upper_bot, lower_top = {}, {}
    for x, y in sorted(LIPMASK, key=lambda q: abs(q[0] - MCX), reverse=True):
        c = SRC[y, x].copy()
        if close and (c == P["f"]).all(): c = P["g"]
        xn = MCX + int(round((x - MCX) * sx)); yn = y + int(dy(x)) + (gap if y >= 59 else 0)
        out[yn, xn] = c
        if y <= 58: upper_bot[xn] = max(upper_bot.get(xn, -1), yn)
        else: lower_top[xn] = min(lower_top.get(xn, 99), yn)
    if gap:
        for x in upper_bot:
            if x in lower_top and abs(x - MCX) <= 4 - (1 if gap == 1 else 0):     # inner mouth only, corners stay closed
                for y in range(upper_bot[x] + 1, lower_top[x]): put(out, x, y, "f")
            elif x in lower_top:
                for y in range(upper_bot[x] + 1, lower_top[x]): put(out, x, y, "g" if abs(x - MCX) <= 5 else "i")
        if tongue:
            ys = [lower_top[x] - 1 for x in lower_top if x in upper_bot and abs(x - MCX) <= 2]
            for x in range(MCX - 2, MCX + 3):
                if x in lower_top and x in upper_bot and lower_top[x] - 1 > upper_bot[x]: put(out, x, lower_top[x] - 1, "t")
    if cat:                                                     # small up-bump in the lip line at the centre: "w"
        for y in range(54, 63):
            if is_c(out, MCX, y, "g"): put(out, MCX, y - 1, "g"); put(out, MCX, y, "i"); break
    if hole:
        put(out, MCX, 59, "f"); put(out, MCX, 58, "f")
    return out


def teeth(img):
    """v10: her full lips parted with a line of upper teeth"""
    for x in range(MCX - 3, MCX + 4):
        for y in range(54, 64):
            if is_c(img, x, y, "f"): put(img, x, y, "p" if abs(x - MCX) <= 2 else "l"); break
    return img


FULL = {
    "softSmile": lambda: lips(dy=lambda x: -round(1.3 * ((x - MCX) / 6.5) ** 2)),
    "sweetSmile": lambda: lips(dy=lambda x: -round(2.6 * ((x - MCX) / 6.5) ** 2)),
    "smirk": lambda: lips(dy=lambda x: -round(2.4 * max(0.0, (x - MCX) / 6.5) ** 1.4)),
    "smirkL": lambda: lips(dy=lambda x: -round(2.4 * max(0.0, (MCX - x) / 6.5) ** 1.4)),
    "cat": lambda: lips(dy=lambda x: -round(1.6 * ((x - MCX) / 6.5) ** 2), cat=True),
    "pout": lambda: lips(sx=0.78, dy=lambda x: round(0.6 * (1 - ((x - MCX) / 5.0) ** 2))),
    "kiss": lambda: lips(sx=0.6, close=False, hole=True),
    "parted": lambda: lips(gap=1, close=False),
    "partedTeeth": lambda: teeth(lips(gap=2, close=False)),
    "ahTongue": lambda: lips(gap=2, close=False, tongue=True, sx=0.9),
}


def mouth_cell(name):
    if name == "neutral": return SRC.copy()
    if name in FULL: return FULL[name]()
    img = MBASE.copy(); art = MART[name]
    w = len(art[0]); h = len(art)
    stamp(img, art, MCX - w // 2, MCY - (h - 1) // 2 - (1 if h >= 5 else 0))
    return img


def blush_mouth(img):
    return
    for x0 in (18, 40):
        for y in (53, 54):
            for x in range(x0, x0 + 3):
                if is_c(img, x, y, "mok"): put(img, x, y, "y")


# ------------------------------------------------------------------ sheets
def sheet(cell_fn, names, rect, blush_fn):
    x0, y0, x1, y1 = rect; cw, ch = x1 - x0, y1 - y0
    S = np.zeros((FACE_ROWS * ch, FACE_COLS * cw, 3), np.uint8)
    cells = {}
    for k in range(FACE_COLS * FACE_ROWS):
        n = names[k % 32]; img = cell_fn(n)
        if k >= 32: img = img.copy(); blush_fn(img); n = n + "+blush"
        c = img[y0:y1, x0:x1].astype(np.uint8); cells[n] = c
        r, q = divmod(k, FACE_COLS); S[r * ch:(r + 1) * ch, q * cw:(q + 1) * cw] = c
    return S, cells


def main():
    SE, CE = sheet(eyes_cell, EYES, EYE_RECT, blush_eyes)
    SM, CM = sheet(mouth_cell, MOUTHS, MOUTH_RECT, blush_mouth)
    SC, CC = sheet(cheek_cell, MOUTHS, CHEEK_RECT, blush_cheeks)
    Image.fromarray(SC).resize((SC.shape[1] * UP, SC.shape[0] * UP), Image.NEAREST).save(os.path.join(ROOT, "tex", "face_cheeks.png"))
    os.makedirs(os.path.join(ROOT, "tex"), exist_ok=True)
    Image.fromarray(SE).resize((SE.shape[1] * UP, SE.shape[0] * UP), Image.NEAREST).save(os.path.join(ROOT, "tex", "face_eyes.png"))
    Image.fromarray(SM).resize((SM.shape[1] * UP, SM.shape[0] * UP), Image.NEAREST).save(os.path.join(ROOT, "tex", "face_mouth.png"))
    ex, ey = EYE_RECT[2] - EYE_RECT[0], EYE_RECT[3] - EYE_RECT[1]; mx, my = MOUTH_RECT[2] - MOUTH_RECT[0], MOUTH_RECT[3] - MOUTH_RECT[1]
    meta = {"cells": 16, "cols": FACE_COLS, "rows": FACE_ROWS, "cell_px": [ex * UP, ey * UP], "cell_px_mouth": [mx * UP, my * UP],
            "blush_suffix": "+blush", "face_eyes": EYES + [n + "+blush" for n in EYES], "face_mouth": MOUTHS + [n + "+blush" for n in MOUTHS],
            "face_cheeks": MOUTHS + [n + "+blush" for n in MOUTHS],
            "cell_px_cheeks": [(CHEEK_RECT[2] - CHEEK_RECT[0]) * UP, (CHEEK_RECT[3] - CHEEK_RECT[1]) * UP],
            "note": ("64 cells per sheet (face_eyes.png / face_mouth.png, embedded in the GLB as materials waitress_face_eyes / "
                     "waitress_face_mouth): cell k = column k % cols, row k // cols (row 0 = top). The face UVs cover ONE cell at the "
                     "top-left, so an engine only sets map.offset = ((k % cols)/cols, floor(k/cols)/rows) (glTF textures, flipY=false), "
                     "no repeat. Same names as Ashley (upnext-girl2) except the 8 flirty cells (2026-11-17, from @missmedannypsx) that replaced unused row-1 cells: eyes smug<-bedroomSide, sideEyeL<-winkL, challenge<-eyeRoll, adoring<-dreamy, sideEyeR<-glance; mouths sweetSmile<-oh, laughOpen<-kissBlow, ahTongue<-parted; 2026-11-17 v7: parted (full lips) <- blushGasp, v10 (@askforvera): winkBrow <- dizzy, boredSexy <- disgust (eyes), partedTeeth <- disgust (mouth), all unused; v9: softer blush (radial falloff, ~32 % lighter); v8: the blush moved down onto the cheeks: a third face material face_cheeks (cheek band under the eyes) keyed by the MOUTH name, exactly like engines already key face_mouth (setFace: any material named in _meta takes the mouth name unless it is face_eyes), so '+blush' on the mouth now shows the blush; eye cells are unchanged since v7 (their '+blush' cells equal the plain ones), lashes on every eye cell, full-lip mouths (softSmile, sweetSmile, smirk, smirkL, cat, pout, kiss, parted, ahTongue). '+blush' = same cell with her blush: put it on the eyes AND the "
                     "mouth together. L/R in names = screen left/right seen from the front (winkL closes the eye on screen left = her "
                     "right eye). Drawn at her native MML2 texel size (x4 nearest), from her own face pixels.")}
    json.dump(meta, open(os.path.join(ROOT, "ref", "face_meta.json"), "w"), indent=1)
    review(CE, CM)
    print("FACE atlases", SE.shape, SM.shape)


def font(n):
    for f in ("arialbd.ttf", "arial.ttf"):
        try: return ImageFont.truetype(f, n)
        except Exception: pass
    return ImageFont.load_default()


def review(CE, CM):
    Z = 5
    def grid(cells, names, cols, title):
        c0 = next(iter(cells.values())); h, w = c0.shape[:2]; W, Hh = w * Z + 8, h * Z + 26
        rows = (len(names) + cols - 1) // cols
        im = Image.new("RGB", (cols * W, rows * Hh + 40), (32, 34, 40)); d = ImageDraw.Draw(im)
        d.text((8, 8), title, fill=(235, 235, 235), font=font(22))
        for i, n in enumerate(names):
            r, q = divmod(i, cols)
            im.paste(Image.fromarray(cells[n]).resize((w * Z, h * Z), Image.NEAREST), (q * W + 4, 40 + r * Hh))
            d.text((q * W + 6, 40 + r * Hh + h * Z + 3), n, fill=(220, 220, 220), font=font(15))
        return im
    a = grid(CE, EYES + [n + "+blush" for n in EYES[:8]], 8, "Eyes (32 + blush), drawn from her own MML2 face pixels (native texels x5)")
    b = grid(CM, MOUTHS + [n + "+blush" for n in MOUTHS[:8]], 10, "Mouths (32 + blush)")
    out = Image.new("RGB", (max(a.width, b.width), a.height + b.height), (32, 34, 40)); out.paste(a, (0, 0)); out.paste(b, (0, a.height))
    out.save(os.path.join(ROOT, "review", "face_cells.png"))
    combos = [("open", "neutral"), ("happy", "smileOpen"), ("blink", "softSmile"), ("surprised", "gasp"), ("angry", "frown"),
              ("sad", "sadPout"), ("wink", "blep"), ("hearts+blush", "kiss+blush"), ("shocked", "bigShock"), ("winkBrow", "smirk"),
              ("smirk", "smirk"), ("bedroom+blush", "lipBite+blush"), ("shy+blush", "blushSmile+blush"), ("sparkle", "grin"),
              ("relaxed", "smile"), ("challenge", "smirk"), ("boredSexy", "partedTeeth"), ("tease", "smirkL"), ("half", "talkA"),
              ("smiling", "laugh"), ("gazeL", "ahTongue"), ("sulk", "pout"), ("adoring", "sweetSmile"), ("sideEyeR", "talkEE")]
    Z2 = 6; fx0, fy0, fx1, fy1 = 4, 14, 58, 76
    W, Hh = (fx1 - fx0) * Z2 + 10, (fy1 - fy0) * Z2 + 30
    im = Image.new("RGB", (8 * W, 3 * Hh + 44), (32, 34, 40)); d = ImageDraw.Draw(im)
    d.text((8, 10), "Eyes + mouth combos on her face (texture space, native texels x6)", fill=(235, 235, 235), font=font(22))
    for i, (e, m) in enumerate(combos):
        f = SRC.copy()
        f[EYE_RECT[1]:EYE_RECT[3], EYE_RECT[0]:EYE_RECT[2]] = CE[e]; f[MOUTH_RECT[1]:MOUTH_RECT[3], MOUTH_RECT[0]:MOUTH_RECT[2]] = CM[m]
        r, q = divmod(i, 8)
        im.paste(Image.fromarray(f[fy0:fy1, fx0:fx1].astype(np.uint8)).resize(((fx1 - fx0) * Z2, (fy1 - fy0) * Z2), Image.NEAREST), (q * W + 5, 44 + r * Hh))
        d.text((q * W + 8, 44 + r * Hh + (fy1 - fy0) * Z2 + 4), f"{e} / {m}", fill=(220, 220, 220), font=font(14))
    im.save(os.path.join(ROOT, "review", "face_combo_tex.png"))


if __name__ == "__main__":
    main()
