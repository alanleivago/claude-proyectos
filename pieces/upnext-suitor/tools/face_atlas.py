"""His expression atlases (16 x 4 cells, the waitress / Ashley cell names), drawn at the native MML texel size from HIS face
pixels (tex/body.png, skin already recoloured), then x4 nearest.
 His face UVs are mirrored at u = 28 px, so a cell holds the full face: left half = the texture half as is (screen-left eye =
 his right eye), right half = mirrored. Asymmetric cells (wink, smirk, gaze...) edit each eye on its own.
 Masculine pass on every cell: straighter, thicker brows; flat / wide mouths without lip colour; a hatch blush.
python -I tools/face_atlas.py -> tex/face_eyes.png, tex/face_mouth.png, ref/face_meta.json, review/face_cells.png"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from geom import EYE_RECT, MOUTH_RECT, FACE_COLS, FACE_ROWS

UP = 4
TEX = np.array(Image.open(os.path.join(ROOT, "tex", "body.png")).convert("RGB")).astype(int)
H_ = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)])
P = {"e": H_("#f2c8a2"), "b": H_("#daa580"), "c": H_("#bb8462"), "d": H_("#94604a"),       # skin light .. dark (recoloured)
     "f": np.array([88, 72, 88]), "g": np.array([128, 104, 128]), "h": np.array([184, 168, 184]), "j": np.array([232, 224, 232]),
     "k": np.array([72, 104, 168]), "K": np.array([48, 72, 128]), "l": np.array([64, 48, 64]), "m": np.array([56, 40, 56]),
     "o": np.array([112, 56, 32]), "i": np.array([136, 88, 32]), "M": H_("#5a2a28"), "t": H_("#c4645e"), "T": H_("#94403e"),
     "r": H_("#e04a5a"), "R": H_("#a02838"), "y": H_("#eea08e"), "Y": H_("#d4766a"), "w": np.array([255, 255, 255])}
EYES = ["open", "half", "blink", "happy", "surprised", "angry", "sad", "wink", "hearts", "shocked", "dizzy", "relaxed", "disgust",
        "smirk", "soft", "sparkle", "bedroom", "bedroomSide", "winkL", "winkR", "lookUp", "tease", "shy", "eyeRoll",
        "gazeL", "gazeR", "gazeUp", "gazeDown", "smiling", "sulk", "dreamy", "glance"]
MOUTHS = ["neutral", "smile", "smileOpen", "talkA", "talkO", "surprised", "frown", "shout", "blep", "cat", "gasp", "bigShock",
          "disgust", "smirk", "blushSmile", "blushGasp", "softSmile", "pout", "lipBite", "laugh", "oh", "sadPout", "kiss",
          "kissBlow", "talkClosed", "talkSmall", "talkWide", "talkOO", "talkEE", "smirkL", "grin", "parted"]


def full(rect):
    x0, y0, x1, y1 = rect; half = TEX[y0:y1, x0:x1]
    return np.concatenate([half, half[:, ::-1]], 1)


def is_c(img, x, y, cs): return any((img[y, x] == P[c]).all() for c in cs)


def put(img, x, y, c):
    if 0 <= y < img.shape[0] and 0 <= x < img.shape[1]: img[y, x] = P[c] if isinstance(c, str) else c


def stamp(img, art, x0, y0, mask=None):
    for j, row in enumerate(art):
        for i, ch in enumerate(row):
            if ch != "." and (mask is None or mask[y0 + j, x0 + i]): put(img, x0 + i, y0 + j, ch)


# ------------------------------------------------------------------ eyes (cell coords: x = tex x - 5, y = tex y - 22; side 0 = screen-left)
E0 = full(EYE_RECT)
EH, EW = E0.shape[:2]
EY0, EY1 = 9, 21                       # eye rows (lash top .. lower edge)
EX0, EX1 = 1, 17                       # side-0 eye columns
IRIS = (9, 15)                         # iris columns (dark top, blue bottom)
SK = "eb"


def eye_mask(img):
    m = np.zeros(img.shape[:2], bool)
    for y in range(EY0, EY1 + 1):
        for x in range(EX0, EX1 + 1):
            if not is_c(img, x, y, SK): m[y, x] = True
    return m


def brow_mask(img):
    m = np.zeros(img.shape[:2], bool)
    for y in range(2, 7):
        for x in range(1, 18):
            if is_c(img, x, y, "cd"): m[y, x] = True
    return m


EM = eye_mask(E0)
OPEN = EM & np.array([[is_c(E0, x, y, "ghjk") or (is_c(E0, x, y, "f") and y >= 11 and IRIS[0] <= x <= IRIS[1]) for x in range(EW)] for y in range(EH)])
BM = brow_mask(E0)


def skin_at(x, y):                      # erased skin: shaded forehead band above, light cheek below (his split)
    if y <= 16: return "b"
    return "b" if x <= 4 + (21 - y) // 2 else "e"


BASE0 = E0.copy()
for y, x in zip(*np.nonzero(EM | BM)):
    BASE0[y, x] = P[skin_at(x, y)]; BASE0[y, EW - 1 - x] = P[skin_at(x, y)]      # both halves (the canvas is mirrored)
BROW = ["....ddoooooo...", "..doooooooooooo", ".dd............"]   # masculine brow (side 0), cols 1.., rows 3..
BROW_X, BROW_Y = 2, 3


def draw_brow(img, dy=0, tilt=0, hide=False):
    """straight thick brow; tilt = inner end offset (+ down = angry), dy = + down"""
    if hide: return
    w = len(BROW[0])
    for j, row in enumerate(BROW):
        for i, ch in enumerate(row):
            if ch == ".": continue
            t = i / (w - 1)
            put(img, BROW_X + i, BROW_Y + j + dy + int(round(tilt * t)), ch)


def base_cell():
    img = BASE0.copy()                 # both eyes / brows erased; eyes are drawn back per side
    return img


def eye_open(img, mask_from=E0):
    for y, x in zip(*np.nonzero(EM)): img[y, x] = mask_from[y, x]


def eye_draw(img, lid=0, low=0, closed=None, gx=0, gy=0, iris="n", spark=False):
    """side-0 eye on a canvas whose side-0 eye is erased"""
    if closed:
        w = EX1 - EX0 - 3; cx = (EX0 + 2 + EX1 - 1) / 2
        for x in range(EX0 + 2, EX1):
            t = (x - cx) / (w / 2)
            if closed == "blink": y = 17 + round(1.0 * (1 - t * t))
            elif closed == "happy": y = 17 - round(2.4 * (1 - t * t))
            else: y = 17 - round(0.8 * (1 - t * t))
            edge = abs(t) > 0.82
            put(img, x, y, "f" if edge else "l")
            if not edge and closed == "happy": put(img, x, y + 1, "c")
        put(img, EX0 + 1, 16 if closed != "happy" else 17, "l")              # outer lash flick
        return
    src = E0.copy()
    eye_open(img)
    if gx or gy or iris != "n":
        ix0, ix1 = IRIS
        for y in range(EY0 + 2, EY1 + 1):                                     # iris -> sclera
            for x in range(ix0, ix1 + 1):
                if OPEN[y, x]: img[y, x] = P["j"] if y < EY1 else P["h"]
        cx, cy = (ix0 + ix1) // 2 + gx, 16 + gy
        if iris == "n":
            for y in range(EY0 + 2, EY1 + 1):
                for x in range(ix0, ix1 + 1):
                    xs, ys = x + gx, y + gy
                    if OPEN[y, x] and 0 <= xs < EW and 0 <= ys < EH and OPEN[ys, xs]: img[ys, xs] = src[y, x]
        elif iris == "small":
            stamp(img, [".ff.", "fkkf", "fkkf", ".ff."], cx - 2, cy - 1, OPEN)
        elif iris == "tiny":
            stamp(img, ["ll", "ll"], cx - 1, cy - 1, OPEN)
        elif iris == "heart":
            stamp(img, [".r.r.", "rrrrr", "rRrrr", ".rrr.", "..r.."], cx - 2, cy - 2, None)
        elif iris == "spiral":
            for y, x in zip(*np.nonzero(EM)): img[y, x] = BASE0[y, x]
            stamp(img, [".llll..", "l....l.", "l.ll..l", "l.l.l.l", "l..l..l", ".l...l.", "..lll.."], cx - 4, 12)
            return
    if spark:
        cx = (IRIS[0] + IRIS[1]) // 2 + gx
        for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)): put(img, cx - 1 + dx, 13 + gy + dy, "w")
        put(img, cx + 2, 18 + gy, "j")
    if lid:
        yl = EY0 + lid
        xs = [x for x in range(EX0, EX1 + 1) if EM[yl:EY1 + 1, x].any()]
        for y in range(EY0, yl):
            for x in range(EX0, EX1 + 1):
                if EM[y, x]: img[y, x] = BASE0[y, x]
        for x in xs:
            put(img, x, yl, "l"); put(img, x, yl - 1, "c" if x in (xs[0], xs[-1]) else "d")
    if low:
        yb = EY1 - low
        for y in range(yb + 1, EY1 + 1):
            for x in range(EX0, EX1 + 1):
                if EM[y, x]: img[y, x] = BASE0[y, x]
        for x in range(EX0 + 3, EX1 - 1):
            if EM[yb, x]: put(img, x, yb + 1, "c")


def side(img, s, fn):
    """apply fn (side-0 drawing) to side s of the canvas"""
    if s == 0: fn(img); return
    f = img[:, ::-1].copy(); fn(f); img[:] = f[:, ::-1]


def both(img, eye=None, brow=None, eye1=None, brow1=None):
    """eye / brow kwargs for side 0 (screen-left); eye1 / brow1 for side 1 (default: same, gaze x mirrored)"""
    eye = eye or {}; brow = brow or {}
    if eye1 is None:
        eye1 = dict(eye)
        if "gx" in eye1: eye1["gx"] = -eye1["gx"]
    brow1 = brow if brow1 is None else brow1
    side(img, 0, lambda c: (eye_draw(c, **eye), draw_brow(c, **brow)))
    side(img, 1, lambda c: (eye_draw(c, **eye1), draw_brow(c, **brow1)))


def blush_eyes(img):
    for s in (0, 1):
        def f(c):
            for y in (EH - 2, EH - 1):
                for x in range(3, 15):
                    if is_c(c, x, y, "eb"): put(c, x, y, "y")
            for k in range(3):
                bx = 5 + 3 * k
                put(c, bx + 1, EH - 2, "Y"); put(c, bx, EH - 1, "Y")
        side(img, s, f)


def eyes_cell(n):
    img = base_cell()
    S = lambda **k: k
    if n == "open": both(img)
    elif n == "half": both(img, S(lid=5), S(dy=1))
    elif n == "blink": both(img, S(closed="blink"))
    elif n == "happy": both(img, S(closed="happy"), S(dy=-1, tilt=-1))
    elif n == "surprised": both(img, S(iris="small"), S(dy=-2))
    elif n == "angry": both(img, S(lid=3), S(dy=1, tilt=3))
    elif n == "sad": both(img, S(lid=3, gy=1), S(dy=0, tilt=-3))
    elif n in ("wink", "winkR"): both(img, S(), S(dy=-1), S(closed="happy"), S(dy=1))
    elif n == "winkL": both(img, S(closed="happy"), S(dy=1), S(), S(dy=-1))
    elif n == "hearts": both(img, S(iris="heart"), S(dy=-1))
    elif n == "shocked": both(img, S(iris="tiny"), S(dy=-2))
    elif n == "dizzy": both(img, S(iris="spiral"), S(dy=-1, tilt=-2))
    elif n == "relaxed": both(img, S(closed="soft"), S(tilt=-1))
    elif n == "disgust": both(img, S(lid=4, low=2), S(dy=1, tilt=2), S(lid=2), S(dy=-1, tilt=1))
    elif n == "smirk": both(img, S(lid=3), S(dy=1, tilt=1), S(lid=1), S(dy=-2))
    elif n == "soft": both(img, S(lid=2, low=1), S(tilt=-1))
    elif n == "sparkle": both(img, S(spark=True), S(dy=-1))
    elif n == "bedroom": both(img, S(lid=6, gy=1), S(dy=0, tilt=-1))
    elif n == "bedroomSide": both(img, S(lid=6, gx=-2), S(tilt=-1))
    elif n == "lookUp": both(img, S(gy=-2), S(dy=-1))
    elif n == "tease": both(img, S(lid=4, gx=1), S(dy=-2), S(closed="happy"), S(dy=1))
    elif n == "shy": both(img, S(lid=3, gy=2, gx=-1), S(dy=-1, tilt=-2))
    elif n == "eyeRoll": both(img, S(lid=2, gy=-3, gx=1), S(dy=-2, tilt=1))
    elif n == "gazeL": both(img, S(gx=-2))
    elif n == "gazeR": both(img, S(gx=2))
    elif n == "gazeUp": both(img, S(gy=-2))
    elif n == "gazeDown": both(img, S(gy=2, lid=2), S(dy=1))
    elif n == "smiling": both(img, S(low=3), S(dy=-1))
    elif n == "sulk": both(img, S(lid=4, gx=2, gy=1), S(dy=1, tilt=2))
    elif n == "dreamy": both(img, S(lid=4, spark=True, gy=-1), S(dy=-1, tilt=-1))
    elif n == "glance": both(img, S(lid=2, gx=2))
    else: raise KeyError(n)
    return img


# ------------------------------------------------------------------ mouths (cell coords: x = tex x - 17 (mirrored right half), y = tex y - 52)
M0 = full(MOUTH_RECT)
MH, MW = M0.shape[:2]
MCX, MCY = MW / 2, 7
MBASE = M0.copy()
for y in range(4, 11):
    for x in range(1, MW - 1): MBASE[y, x] = P["e"]
MART = {
    "smile": ["d..........d", ".oooooooooo."],
    "smileOpen": ["oooooooooo", "oMMMMMMMMo", ".oMttttMo.", "..oooooo.."],
    "talkA": [".oooooo.", "oMMMMMMo", "oMMttMMo", ".oooooo."],
    "talkO": ["..oooo..", ".oMMMMo.", ".oMMMMo.", "..oooo.."],
    "surprised": [".oooo.", "oMMMMo", "oMMMMo", ".oooo."],
    "frown": [".oooooooooo.", "d..........d"],
    "shout": [".oooooooooooo.", "ojjjjjjjjjjjjo", "oMMMMMMMMMMMMo", ".oMMttttttMMo.", "..oooooooooo.."],
    "blep": ["dooooooooood", "....otto....", "....otTo....", ".....oo....."],
    "cat": ["o...oo...o", ".o.o..o.o.", "..o....o.."],
    "gasp": [".oooo.", "oMMMMo", "oMMMMo", "oMttMo", ".oooo."],
    "bigShock": ["..oooooo..", ".oMMMMMMo.", "oMMMMMMMMo", "oMMMMMMMMo", ".oMttttMo.", "..oooooo.."],
    "disgust": ["oo......oo", "ojjjjjjjjo", ".oooooooo."],
    "smirk": ["...........o", "..........o.", "oooooooooo.."],
    "blushSmile": ["o..........o", ".oMMMMMMMMo.", "..oooooooo.."],
    "blushGasp": [".oooo.", "oMMMMo", ".oooo."],
    "softSmile": ["d........d", ".oooooooo."],
    "pout": ["..dddd..", ".dooood.", "..dddd.."],
    "lipBite": ["oooooooooo", "ojjjjjjjjo", ".dddddddd."],
    "laugh": ["oooooooooooo", "ojjjjjjjjjjo", "oMMMMMMMMMMo", ".oMMttttMMo.", "..oooooooo.."],
    "oh": [".oo.", "oMMo", ".oo."],
    "sadPout": ["...oooo...", "..o....o..", ".o......o."],
    "kiss": [".oo.", "oddo", ".oo."],
    "kissBlow": [".oo...", "oddo..", ".oo.yY", "....YY"],
    "talkClosed": ["oooooooooo"],
    "talkSmall": [".oooooo.", "oMMMMMMo", ".oooooo."],
    "talkWide": ["oooooooooooo", "oMMMMMMMMMMo", ".oooooooooo."],
    "talkOO": [".oo.", "oMMo", "oMMo", ".oo."],
    "talkEE": ["oooooooooooo", "ojjjjjjjjjjo", ".oooooooooo."],
    "smirkL": ["o...........", ".o..........", "..oooooooooo"],
    "grin": ["o............o", "ojjjjjjjjjjjjo", ".ojjjjjjjjjjo.", "..oooooooooo.."],
    "parted": [".dddddd.", "oMMMMMMo", ".dddddd."],
}


def mouth_cell(name):
    if name == "neutral": return M0.copy()
    img = MBASE.copy(); art = MART[name]; w, h = len(art[0]), len(art)
    stamp(img, art, int(round(MCX - w / 2)), MCY - (h - 1) // 2 - (1 if h >= 5 else 0))
    return img


def blush_mouth(img): return


# ------------------------------------------------------------------ sheets
def sheet(cell_fn, names, blush_fn, shape):
    ch, cw = shape
    S = np.zeros((FACE_ROWS * ch, FACE_COLS * cw, 3), np.uint8); cells = {}
    for k in range(FACE_COLS * FACE_ROWS):
        n = names[k % 32]; img = cell_fn(n)
        if k >= 32: img = img.copy(); blush_fn(img); n = n + "+blush"
        c = np.clip(img, 0, 255).astype(np.uint8); cells[n] = c
        r, q = divmod(k, FACE_COLS); S[r * ch:(r + 1) * ch, q * cw:(q + 1) * cw] = c
    return S, cells


def main():
    SE, CE = sheet(eyes_cell, EYES, blush_eyes, E0.shape[:2])
    SM, CM = sheet(mouth_cell, MOUTHS, blush_mouth, M0.shape[:2])
    Image.fromarray(SE).resize((SE.shape[1] * UP, SE.shape[0] * UP), Image.NEAREST).save(os.path.join(ROOT, "tex", "face_eyes.png"))
    Image.fromarray(SM).resize((SM.shape[1] * UP, SM.shape[0] * UP), Image.NEAREST).save(os.path.join(ROOT, "tex", "face_mouth.png"))
    meta = {"cells": 16, "cols": FACE_COLS, "rows": FACE_ROWS, "cell_px": [EW * UP, EH * UP], "cell_px_mouth": [MW * UP, MH * UP],
            "blush_suffix": "+blush", "face_eyes": EYES + [n + "+blush" for n in EYES], "face_mouth": MOUTHS + [n + "+blush" for n in MOUTHS],
            "note": ("64 cells per sheet (face_eyes.png / face_mouth.png, embedded in the GLB as materials face_eyes / face_mouth): cell k = "
                     "column k % cols, row k // cols (row 0 = top). The face UVs cover ONE cell at the top-left, so an engine only sets "
                     "map.offset = ((k % cols)/cols, floor(k/cols)/rows) (glTF textures, flipY=false), no repeat. Same names as the "
                     "waitress (upnext-waitress) and Ashley. '+blush' = same cell with his blush: put it on the eyes AND the mouth together "
                     "(the blush sits in the eyes cell). L/R in names = screen left/right seen from the front (winkL closes the eye on screen "
                     "left = his right eye). Drawn at his native MML texel size (x4 nearest), from his own face pixels, masculine pass "
                     "(straight thick brows, flat mouths without lip colour).")}
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
    a = grid(CE, EYES + [n + "+blush" for n in EYES[:8]], 8, "Eyes (32 + blush), drawn from his own MML face pixels (native texels x5)")
    b = grid(CM, MOUTHS + [n + "+blush" for n in MOUTHS[:8]], 10, "Mouths (32 + blush)")
    out = Image.new("RGB", (max(a.width, b.width), a.height + b.height), (32, 34, 40)); out.paste(a, (0, 0)); out.paste(b, (0, a.height))
    out.save(os.path.join(ROOT, "review", "face_cells.png"))


if __name__ == "__main__":
    main()
