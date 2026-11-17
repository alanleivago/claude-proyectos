"""v8 face atlases from HIS Ashley_Face.png (not Roll's): the 11 expressions of his final atlas (UV editor at 11:27,
5 x 3 cells of 51x55 incl. the 1-px divider). Cells 0,1,3,4,5,6,9 are sampled texel by texel from his 400 % Aseprite
frames (9:26-10:15, v5/his_cells.py -> v5/cells/his_XX.png); 2, 7, 8, 10 are never shown at full zoom, so they are
repainted with his palette at the positions read off his atlas thumbnail. Everything is snapped to his palette.
Writes tex/ashley_face_256.png (his layout), tex/face_eyes.png + tex/face_mouth.png (engine strips), review/face_cells_v8.png."""
import os, numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); CELLS = os.path.join(HERE, "v5", "cells")
CW, CH = 51, 55; SPLIT = 34


def load(k):
    c = np.asarray(Image.open(os.path.join(CELLS, f"his_{k:02d}.png")).convert("RGB")).astype(int)   # 50x54 interior
    c = np.concatenate([c, c[:, -1:]], 1); c = np.concatenate([c, c[-1:]], 0)                          # -> 51x55
    r, g, b = c[..., 0], c[..., 1], c[..., 2]; pur = b > g + 5                        # Aseprite guide
    for i in range(CW):
        if pur[:, i].mean() > 0.25:
            src = c[:, i - 1] if i > 0 else c[:, i + 1]
            c[pur[:, i], i] = src[pur[:, i]]
    r, g, b = c[..., 0], c[..., 1], c[..., 2]; pur = (b > g + 5) | ((b > g - 25) & (r < 215) & (r > 120) & (b > 130))
    for j in range(CH):
        for i in range(1, CW - 1):
            if pur[j, i] and not pur[j, i - 1] and not pur[j, i + 1]: c[j, i] = c[j, i - 1]
    return c


C = {k: load(k) for k in (0, 1, 3, 4, 5, 6, 9)}
px = np.concatenate([c.reshape(-1, 3) for c in C.values()]).astype(float)
cols, inv, cnt = np.unique((px // 6).astype(int), axis=0, return_inverse=True, return_counts=True)
PAL = []
for i in np.argsort(-cnt):
    m = px[inv.ravel() == i].mean(0)
    if all(np.abs(m - q).sum() > 30 for q in PAL): PAL.append(m)
    if len(PAL) >= 18 or cnt[i] < 5: break
PAL = np.array(PAL)


def snap(c): return PAL[np.abs(c[..., None, :] - PAL).sum(-1).argmin(-1)]


for k in C: C[k] = snap(C[k])
SK_L, SK_U = PAL[0], PAL[1]
LASH = PAL[np.argmin(np.abs(PAL - np.array([73, 41, 31])).sum(1))]
WHITE = np.array([244, 244, 240.]); RED = np.array([226, 44, 34.]); RED_D = np.array([168, 24, 24.])
BROWN = np.array([170, 104, 70.]); TEETH = np.array([236, 226, 206.]); MOUTH_D = np.array([120, 60, 44.])


def is_skin(p): return min(np.abs(p - SK_L).sum(), np.abs(p - SK_U).sum()) < 1


def blank():
    st = np.stack([C[k] for k in (0, 3, 4, 5, 6, 9)]); out = np.zeros((CH, CW, 3))
    for j in range(CH):
        for i in range(CW):
            v = [tuple(p) for p in st[:, j, i] if is_skin(p)]
            out[j, i] = max(set(v), key=v.count) if v else SK_L
    return out


B = blank()


def put(o, pts, col):
    for y, x in pts:
        if 0 <= y < CH and 0 <= x < CW: o[int(y), int(x)] = col


def line(o, p0, p1, col, w=1):
    n = int(max(abs(p1[0] - p0[0]), abs(p1[1] - p0[1]))) * 2 + 1
    for t in np.linspace(0, 1, n):
        y, x = p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t
        for d in range(w): put(o, [(round(y) + d, round(x))], col)


# 2: angry - V brows down to the nose, small ringed dot eyes, small open ^ mouth
c2 = B.copy()
for x0, x1, cx in ((3, 21, 13), (47, 29, 37)):
    line(c2, (8, x0), (17, (x0 + x1) / 2), LASH, 1); line(c2, (17, (x0 + x1) / 2), (22, x1), LASH, 2)
    put(c2, [(24 + a, cx + b) for a in range(-2, 3) for b in range(-2, 3) if abs(a) + abs(b) <= 3 and (a, b) != (0, 0)], LASH)
    put(c2, [(24, cx)], BROWN)
put(c2, [(43, 25), (44, 24), (44, 26), (45, 23), (45, 27)], LASH); put(c2, [(44, 25), (45, 24), (45, 25), (45, 26)], MOUTH_D)
# 7: relaxed happy - his green eyes with the upper lid lowered to row 16, wider smile
c7 = C[0].copy()
EYE_ROWS = [j for j in range(SPLIT) if any(abs(C[0][j, i] - np.array([224, 222, 220])).sum() < 30 for i in range(4, 48))]
lid = EYE_ROWS[0] + (EYE_ROWS[-1] - EYE_ROWS[0]) * 45 // 100          # upper lid lowered to 45 % of the eye
for j in range(9, lid):
    for i in range(4, 48):
        if not is_skin(C[0][j, i]): c7[j, i] = B[j, i]
for i in range(4, 48):
    if not is_skin(C[0][lid, i]) or not is_skin(C[0][lid + 1, i]): c7[lid, i] = LASH
for x in range(15, 36):
    for j in (39, 40, 41, 42): c7[j, x] = B[j, x]
put(c7, [(40, 17), (41, 18)] + [(42, x) for x in range(19, 32)] + [(41, 32), (40, 33)], BROWN)
# 8: eyes closed - lash arcs + brows, small open mouth
c8 = B.copy()
for cx in (12, 37):
    put(c8, [(24, cx + d) for d in range(-6, 7)] + [(25, cx + d) for d in range(-5, 6)] + [(23, cx - 7), (23, cx + 7)], LASH)
    put(c8, [(6, cx + d) for d in range(-4, 5)] + [(7, cx - 5), (7, cx + 5)], BROWN)
put(c8, [(40, x) for x in range(22, 29)], BROWN); put(c8, [(41, x) for x in range(21, 30)] + [(42, x) for x in range(21, 30)], MOUTH_D)
put(c8, [(43, x) for x in range(22, 29)], BROWN)
# 10: heart eyes + open smile with teeth
c10 = B.copy()
HEART = ["..###...###..", ".#####.#####.", "#############", "#############", "#############", ".###########.",
         "..#########..", "...#######...", "....#####....", ".....###.....", "......#......"]
for cx in (12, 36):
    for j, row in enumerate(HEART):
        for i, ch in enumerate(row):
            if ch == "#": put(c10, [(14 + j, cx - 6 + i)], RED)
    put(c10, [(16, cx - 3), (16, cx - 2), (17, cx - 3)], WHITE)
put(c10, [(38, x) for x in range(18, 33)], BROWN); put(c10, [(39, x) for x in range(18, 33)], TEETH)
put(c10, [(40, x) for x in range(19, 32)], TEETH); put(c10, [(41, x) for x in range(20, 31)], MOUTH_D); put(c10, [(42, x) for x in range(22, 29)], BROWN)
C.update({2: c2, 7: c7, 8: c8, 10: c10})
WINK = C[0].copy(); WINK[:SPLIT, 26:] = C[8][:SPLIT, 26:]
EYES = {"open": 0, "half": 1, "blink": 8, "happy": 3, "surprised": 6, "angry": 2, "sad": 9, "wink": WINK, "hearts": 10,
        "shocked": 6, "dizzy": 4, "relaxed": 7, "disgust": 1, "smirk": 5, "soft": 7, "sparkle": 0}
MOUTHS = {"neutral": 0, "smile": 7, "smileOpen": 10, "talkA": 5, "talkO": 6, "surprised": 6, "frown": 1, "shout": 2,
          "blep": 9, "cat": 3, "gasp": 6, "bigShock": 9, "disgust": 4, "smirk": 1, "blushSmile": 3, "blushGasp": 9}
EYE_ORDER = ["open", "half", "blink", "happy", "surprised", "angry", "sad", "wink", "hearts", "shocked", "dizzy",
             "relaxed", "disgust", "smirk", "soft", "sparkle"]
MOUTH_ORDER = ["neutral", "smile", "smileOpen", "talkA", "talkO", "surprised", "frown", "shout", "blep", "cat", "gasp",
               "bigShock", "disgust", "smirk", "blushSmile", "blushGasp"]


def cell(v): return C[v] if isinstance(v, int) else v


def build():
    tex = os.path.join(HERE, "tex")
    for tag, order, src in (("eyes", EYE_ORDER, EYES), ("mouth", MOUTH_ORDER, MOUTHS)):
        at = np.zeros((CH, CW * 16, 3), np.uint8)
        for k, n in enumerate(order): at[:, k * CW:(k + 1) * CW] = np.clip(cell(src[n]), 0, 255)
        Image.fromarray(at).save(os.path.join(tex, f"face_{tag}.png"))
    his = np.zeros((256, 256, 3), np.uint8); his[:] = (20, 20, 20)
    for k in range(11):
        r, c = divmod(k, 5); his[r * 55 + 1:r * 55 + 55, c * 51 + 1:c * 51 + 51] = np.clip(C[k][:54, :50], 0, 255)
    his[201:255, 205:255] = np.clip(C[0][:54, :50], 0, 255)
    Image.fromarray(his).save(os.path.join(tex, "ashley_face_256.png"))
    Image.fromarray(his).resize((768, 768), Image.NEAREST).save(os.path.join(HERE, "review", "face_cells_v8.png"))
    print("v8 face atlas ok, palette", len(PAL))


if __name__ == "__main__":
    build()
