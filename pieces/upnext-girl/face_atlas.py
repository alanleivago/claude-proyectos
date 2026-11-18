"""Face atlases rebuilt from the author's own Ashley_Face cells (video 10:26-11:08), pixel by pixel, at his
resolution (51x55 texels per expression).

    python pieces/upnext-girl/tools/extract_face_cells.py 640 660 662 664 666   (cells2/)  +  PARTIAL=1 ... 664 (cells3/)
    python pieces/upnext-girl/face_atlas.py

Writes
  tex/ashley_face_256.png   his layout: 5 columns x 3 rows, 51x55 cells + 1-texel black dividers, 12 expressions
  tex/face_eyes.png         engine layout (zero_fem): 16 cells x 51 px = 816x55, offset.x = cell/16
  tex/face_mouth.png        idem for the mouth polys
  review/face_atlas.png     preview x4
His cells: 00 neutral, 01 open smile (teeth), 02 eyes closed, 03 look left, 04 look right, 05 closed smile, 06 open O,
07 small open, 08 look left + teeth, 10 angry + frown, 11 wink (left half seen; right half behind the streamer's mascot
in every frame, rebuilt from his open eye). 09 is never visible: rebuilt as his half-lidded look from his own pixels.
The engine's extra names (hearts, dizzy, cat mouth...) are painted on top of his cells with his palette only.
"""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
FR = "/Users/alanleiva/claude-proyectos/fuentes/mml2-girl-tutorial/frames/"
CW, CH = 51, 55
SPLIT = 34                     # rows < SPLIT belong to face_eyes polys, rows >= SPLIT to face_mouth polys

def L(p): return np.asarray(Image.open(FR + p).convert("RGB")).astype(int)
def H(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)])

SKIN_U, SKIN_L, LASH, LASH_M = H("#f6ae81"), H("#f5cd9e"), H("#492924"), H("#a3684a")
BROW, SCL, IRIS, MOUTH_L, MOUTH_I = H("#ac6846"), H("#dfdfdf"), H("#196500"), H("#a56848"), H("#d6875f")
TEETH, CHIN, WHITE = H("#e0d7c2"), H("#f2af84"), H("#f4f4f2")
PINK_D, PINK, PINK_L, BLUSH = H("#96204e"), H("#de4682"), H("#ff9ac0"), H("#f0907e")
TONGUE = H("#e07a6a")


def clean_label(c):
    """his index digits (rows 48-54, cols 0-11) -> mirrored pixels from the right edge"""
    c = c.copy()
    for j in range(48, CH):
        for i in range(0, 12):
            c[j, i] = c[j, CW - 1 - i]
    return c


def fix_from(c, ref, mask):
    c = c.copy(); c[mask] = ref[mask]; return c


def is_bad(c):
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    green_overlay = (g > 200) & (r < 140) & (b < 140)
    magenta = (r > 240) & (g < 30) & (b > 240)
    mascot = ((r < 90) & (g < 60) & (b < 90) & ~((r > 60) & (g > 30))) | ((r > 180) & (g < 120) & (b > 60)) | ((r > 150) & (g < 70) & (b < 70))
    return green_overlay | magenta | mascot


def region(r0, r1, c0, c1):
    m = np.zeros((CH, CW), bool); m[r0:r1, c0:c1] = True; return m


# ---------------------------------------------------------------- his cells
C = {}
C[0] = L("cells2/t640_r4_c6.png"); C[1] = L("cells2/t640_r4_c7.png"); C[2] = L("cells2/t640_r4_c8.png")
C[3] = L("cells2/t640_r4_c9.png"); C[4] = L("cells2/t640_r4_c10.png"); C[5] = L("cells2/t666_r4_c5.png")
C[6] = L("cells2/t662_r4_c6.png")
a, b = L("cells2/t662_r4_c7.png"), L("cells2/t666_r4_c7.png")           # 07: merge the two views
C[7] = np.where(is_bad(a)[..., None], b, a); C[7] = fix_from(C[7], C[0], is_bad(C[7]))
c8 = L("cells2/t662_r1_c3.png")                                          # 08: mascot over the bottom right
c8 = fix_from(c8, C[3], region(6, 32, 38, CW)); c8 = fix_from(c8, C[0], region(32, CH, 33, CW)); c8 = fix_from(c8, C[0], region(43, CH, 29, CW))
C[8] = fix_from(c8, C[0], is_bad(c8))
c10 = L("cells3/t664_r5_c5.png"); C[10] = fix_from(c10, C[0], is_bad(c10))
c11 = L("cells3/t664_r5_c6.png")                                         # 11: left half seen, right half = his open eye
w = C[0].copy(); w[:SPLIT, :21] = c11[:SPLIT, :21]; w[SPLIT:] = C[5][SPLIT:]
C[11] = fix_from(w, C[0], is_bad(w))
for k in list(C): C[k] = clean_label(C[k])


def eye_box(side): return (6, 31, 4, 23) if side == "L" else (6, 31, 28, 48)    # r0, r1, c0, c1


def skin_at(c, j, i):
    return SKIN_L.copy() if (j >= 29 and 7 <= i <= 44) else SKIN_U.copy()


def is_hair(p): return p[0] > 150 and p[2] < 70 and p[0] - p[2] > 120


def is_lash(p): return p.sum() < 330 and not is_hair(p)


def is_eye(p):
    r, g, b = int(p[0]), int(p[1]), int(p[2])
    scl = abs(r - g) < 14 and abs(g - b) < 14 and 180 < r < 240
    green = g > r + 30 and g < 160
    return is_lash(p) or scl or green


def lower_lid(c, k):
    """half-closed look made from his own pixels: skin lid over the top k rows of the eye, his lash rows moved down"""
    out = c.copy()
    for side in "LR":
        r0, r1, c0, c1 = eye_box(side)
        for i in range(c0, c1):
            top = next((j for j in range(r0 + 1, r0 + 12) if is_eye(c[j, i]) and not is_hair(c[j, i])), None)
            if top is None: continue
            n = sum(1 for j in range(top, r1) if is_eye(c[j, i]))
            if n < k + 3: continue
            for j in range(top, top + k):
                if not is_hair(c[j, i]): out[j, i] = skin_at(c, j, i)
            for d in range(3):
                if is_lash(c[top + d, i]) and not is_hair(c[top + k + d, i]): out[top + k + d, i] = c[top + d, i]
    return out


def flip_closed(c):
    """happy ^ ^ from his closed-eye line (02): mirror the lash line vertically around its row"""
    out = c.copy()
    for side in "LR":
        r0, r1, c0, c1 = eye_box(side); r0 = 12
        blk = c[r0:r1, c0:c1].copy(); lash = (blk.sum(2) < 420) & ~((blk[..., 0] > 150) & (blk[..., 2] < 70))
        ys = np.nonzero(lash.any(1))[0]
        if not len(ys): continue
        y0, y1 = ys.min(), ys.max()
        sub = out[r0:r1, c0:c1]
        for j in range(y0, y1 + 1):
            for i in range(blk.shape[1]):
                if lash[j, i]: sub[j, i] = skin_at(c, r0 + j, c0 + i)
        for j in range(y0, y1 + 1):
            for i in range(blk.shape[1]):
                if lash[j, i]: sub[y0 + y1 - j - 1, i] = blk[j, i]
    return out


def iris_mask(c, side):
    r0, r1, c0, c1 = eye_box(side); m = np.zeros((CH, CW), bool)
    blk = c[r0:r1, c0:c1]
    g = (blk[..., 1] > blk[..., 0] + 30) & (blk[..., 1] < 160)              # green iris
    d = (blk.sum(2) < 200) & (np.arange(r1 - r0)[:, None] > 3)              # pupil (below the lash rows)
    m[r0:r1, c0:c1] = g | d
    return m


def eyes_replace(c, fn):
    out = c.copy()
    for side in "LR":
        m = iris_mask(c, side); fn(out, m, side)
    return out


def heart_fn(out, m, side):
    ys, xs = np.nonzero(m)
    if not len(ys): return
    out[m] = PINK_D
    cy, cx = int(ys.mean()), int(xs.mean())
    pat = ["..##.##..", ".#######.", ".#######.", "..#####..", "...###...", "....#...."]
    for j, row in enumerate(pat):
        for i, ch in enumerate(row):
            if ch == "#": out[cy - 3 + j, cx - 4 + i] = PINK
    out[cy - 2, cx - 2] = PINK_L; out[cy - 2, cx - 3] = PINK_L


def shocked_fn(out, m, side):
    out[m] = SCL
    ys, xs = np.nonzero(m)
    if len(ys): cy, cx = int(ys.mean()), int(xs.mean()); out[cy - 1:cy + 1, cx - 1:cx + 1] = LASH


def dizzy_fn(out, m, side):
    out[m] = SCL
    ys, xs = np.nonzero(m)
    if not len(ys): return
    cy, cx = ys.mean(), xs.mean()
    for t in np.linspace(0, 4.4 * np.pi, 60):
        r = 0.55 * t
        y, x = int(round(cy + r * np.sin(t))), int(round(cx + r * np.cos(t)))
        if m[min(CH - 1, max(0, y)), min(CW - 1, max(0, x))]: out[y, x] = LASH


def sparkle(c):
    out = c.copy()
    for (y, x) in ((22, 16), (21, 17), (23, 17), (22, 18), (26, 12), (22, 36), (21, 37), (23, 37), (22, 38), (26, 32)):
        out[y, x] = WHITE
    return out


def brows(c, kind):
    """redraw his thin brows tilted (sad = inner end up, angry = inner end down)"""
    out = c.copy()
    for j in range(2, 8):
        for i in range(CW):
            p = c[j, i]
            if is_hair(p): continue
            if abs(p - SKIN_U).sum() > 45: out[j, i] = SKIN_U.copy()          # brow pixels (and their AA) -> skin
    for side, (x0, x1) in (("L", (4, 17)), ("R", (31, 45))):
        for i in range(x0, x1 + 1):
            t = (i - x0) / (x1 - x0)
            inner = t if side == "L" else 1 - t
            y = int(round(7 - 3 * inner)) if kind == "sad" else int(round(4 + 3 * inner))
            if out[y, i].sum() < 600 or out[y, i][2] < 60: continue       # keep the orange strands
            out[y, i] = BROW
    return out


def erase_mouth(c):
    out = c.copy()
    for j in range(SPLIT + 3, 48):
        for i in range(14, 38):
            if j in (46, 47) and 22 <= i <= 28: continue                    # chin shade stays
            out[j, i] = SKIN_L
    return out


def put(out, pts, col):
    for y, x in pts: out[y, x] = col


def mouth_cat(c):
    o = erase_mouth(c)
    put(o, [(41, 20), (42, 21), (42, 22), (41, 23), (41, 24), (42, 25), (42, 26), (41, 27), (41, 28)], MOUTH_L)
    put(o, [(40, 19), (40, 29)], MOUTH_L); return o


def mouth_smirk(c):
    o = erase_mouth(c)
    put(o, [(42, 20), (42, 21), (42, 22), (42, 23), (42, 24), (41, 25), (41, 26), (40, 27), (40, 28), (39, 29)], MOUTH_L)
    put(o, [(43, 21), (43, 22), (43, 23), (42, 26), (41, 28)], MOUTH_I); return o


def mouth_disgust(c):
    o = erase_mouth(c)
    put(o, [(42, 18), (41, 19), (41, 20), (42, 21), (42, 22), (41, 23), (41, 24), (42, 25), (42, 26), (41, 27), (41, 28), (42, 29), (43, 30)], MOUTH_L)
    put(o, [(43, 27), (43, 28), (44, 27), (44, 28)], TONGUE); return o


def blep(c):
    o = c.copy()
    put(o, [(43, 26), (43, 27), (43, 28), (44, 26), (44, 27), (44, 28), (45, 27)], TONGUE); return o


def big_shock(c):
    o = erase_mouth(c)
    for j in range(38, 47):
        for i in range(19, 32):
            e = ((i - 25) / 6.5) ** 2 + ((j - 42.5) / 4.6) ** 2
            if e < 1: o[j, i] = MOUTH_I if e < 0.62 else MOUTH_L
    put(o, [(38, x) for x in range(22, 29)], TEETH); put(o, [(45, x) for x in range(22, 29)], TONGUE)
    return o


def blush(c):
    o = c.copy()
    for x0 in (6, 37):
        for i in range(x0, x0 + 8):
            for j in (34, 35):
                if (i + j) % 2 == 0: o[j, i] = BLUSH
    return o


EYES = {
    "open": C[0], "half": lower_lid(C[0], 7), "blink": C[2], "happy": flip_closed(C[2]), "surprised": C[6],
    "angry": C[10], "sad": lower_lid(brows(C[0], "sad"), 2), "wink": C[11],
    "hearts": eyes_replace(C[0], heart_fn), "shocked": eyes_replace(C[0], shocked_fn), "dizzy": eyes_replace(C[0], dizzy_fn),
    "relaxed": C[2], "disgust": lower_lid(C[10], 3), "smirk": lower_lid(C[4], 8),
    "soft": lower_lid(C[5], 3), "sparkle": sparkle(C[0]),
}
MOUTHS = {
    "neutral": C[0], "smile": C[5], "smileOpen": C[1], "talkA": C[7], "talkO": C[3], "surprised": C[6],
    "frown": C[10], "shout": C[8], "blep": blep(C[5]), "cat": mouth_cat(C[0]), "gasp": C[2],
    "bigShock": big_shock(C[6]), "disgust": mouth_disgust(C[0]), "smirk": mouth_smirk(C[0]),
    "blushSmile": blush(C[5]), "blushGasp": blush(C[2]),
}
EYE_ORDER = ["open", "half", "blink", "happy", "surprised", "angry", "sad", "wink", "hearts", "shocked", "dizzy",
             "relaxed", "disgust", "smirk", "soft", "sparkle"]
MOUTH_ORDER = ["neutral", "smile", "smileOpen", "talkA", "talkO", "surprised", "frown", "shout", "blep", "cat", "gasp",
               "bigShock", "disgust", "smirk", "blushSmile", "blushGasp"]


def build():
    tex = os.path.join(HERE, "tex"); os.makedirs(tex, exist_ok=True)
    for tag, order, src in (("eyes", EYE_ORDER, EYES), ("mouth", MOUTH_ORDER, MOUTHS)):
        at = np.zeros((CH, CW * 16, 3), np.uint8)
        for k, n in enumerate(order): at[:, k * CW:(k + 1) * CW] = np.clip(src[n], 0, 255)
        Image.fromarray(at).save(os.path.join(tex, f"face_{tag}.png"))
    his = np.zeros((256, 256, 3), np.uint8)               # his layout, for reference
    for k in range(12):
        if k == 9: cell = EYES["smirk"]
        else: cell = C[k]
        r, cl = divmod(k, 5); his[r * 56:r * 56 + CH, cl * 51:cl * 51 + CW] = np.clip(cell, 0, 255)
    Image.fromarray(his).save(os.path.join(tex, "ashley_face_256.png"))
    pv = Image.new("RGB", (CW * 4 * 8 + 16, (CH * 4 + 6) * 4), (20, 20, 24))
    for k in range(16):
        f = np.clip(MOUTHS[MOUTH_ORDER[k]], 0, 255).astype(np.uint8).copy()
        f[:SPLIT] = np.clip(EYES[EYE_ORDER[k]][:SPLIT], 0, 255)
        pv.paste(Image.fromarray(f).resize((CW * 4, CH * 4), Image.NEAREST), ((k % 8) * (CW * 4 + 2), (k // 8) * (CH * 4 + 6)))
    for k in range(12):
        cell = EYES["smirk"] if k == 9 else C[k]
        pv.paste(Image.fromarray(np.clip(cell, 0, 255).astype(np.uint8)).resize((CW * 4 // 2 * 2 // 1, CH * 4), Image.NEAREST).resize((CW * 2, CH * 2), Image.NEAREST),
                 ((k % 12) * (CW * 2 + 4), 2 * (CH * 4 + 6) + 10))
    os.makedirs(os.path.join(HERE, "review"), exist_ok=True)
    pv.save(os.path.join(HERE, "review", "face_atlas.png")); print("face atlas ok")


if __name__ == "__main__":
    build()
