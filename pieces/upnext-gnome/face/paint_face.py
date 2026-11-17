"""Pip the gnome: paints the face atlases (pixel art, PS1 low-res) for the Servbot face plate.

    python face/paint_face.py          # -> tex/gnome_eyes.png, tex/gnome_mouth.png, review/face_atlas_x6.png

Same approach as pieces/zero-fem/face (16 cells side by side, three.js picks one with map.offset.x = cell/16),
but the cells are sized to the Servbot face plate at 5.25 px per model unit:
  gnome_eyes  1536x26  (16 cells of 96x26) option A, Servbot-style eyes (gnome_eyes_b.png = option B, small eyes + brows): face plate z 13.90..18.85  (brows, eyes, cheeks; top ~4 rows under the hat)
  gnome_mouth 1536x17  (16 cells of 96x17): face plate z 10.70..13.90  (moustache, mouth, beard)
Column 0..95 runs across the two angled front quads (x -7.9 -> +7.9, character's right -> left); row 0 = top.
Eyes are drawn as grids for the screen-LEFT eye; the right eye is the mirror (x -> 95-x) unless a pair is given."""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CW, N = 96, 16
EH, MH = 26, 17

# palette (all face colours; the body texture shares skin/beard/outline)
SKIN, SKIN_D, BLUSH = (237, 181, 150), (214, 150, 122), (229, 138, 118)
OUT, SCL, PUP = (58, 34, 24), (244, 238, 224), (28, 24, 32)
BRD, BRD_L, BRD_D = (217, 214, 207), (239, 237, 232), (172, 167, 158)
MOU, TNG = (74, 30, 26), (192, 80, 74)
PAL = {"K": OUT, "W": SCL, "P": PUP, "L": SKIN_D, "w": BRD_L, "b": BRD_D, "g": BRD, "M": MOU, "T": TNG, "c": BLUSH,
       "s": SKIN}

EYES = ["deadpan", "open", "unimpressed", "blink", "skeptical", "surprised", "annoyed", "sleepy", "happy", "lookside"]
MOUTHS = ["neutral", "smile", "talkA", "talkO", "talkE", "talkM", "surprised", "frown", "smirk", "sleepy"]

# ---- eye grids: 20 cols x 15 rows, placed at cell (x 19..38, y 4..18). '.' = leave skin
E0X, E0Y, EW = 19, 4, 20
def G(*rows, top=0):
    """rows of a grid starting at grid row `top`; pads to 15 rows of 20 '.'"""
    out = ["." * EW] * top + list(rows)
    return [r.ljust(EW, ".") for r in out] + ["." * EW] * (15 - len(out))
OPEN_EYE = [".....KKKKKKKKKK.....",
            "....KWWWWPPPWWWK....",
            "....KWWWPPPPPWWK....",
            "....KWWWPPPPPWWK....",
            "....KWWWWPPPWWWK....",
            ".....KKKKKKKKKK....."]
BROW = ["....bbbbbbbbbbbb....",
        "...bwwwwwwwwwwwwb...",
        "...bbwwwwwwwwwwbb...",
        ".....bbbbbbbbbb....."]
BROW_LOW = ["...bbbbbbbbbbbbbb...",
            "..bwwwwwwwwwwwwwwb..",
            "...bbbbbbbbbbbbbb..."]
LID = [".....LLLLLLLLLL.....",
       "....LLLLLLLLLLLL....",
       "...KKKKKKKKKKKKKK..."]
EG = {}
EG["open"] = G(*BROW, "", *OPEN_EYE, top=2)
EG["deadpan"] = G(*BROW_LOW, *LID, "....KWWWPPPPPWWK....", "....KWWWWPPPWWWK....", ".....KKKKKKKKKK.....", top=4)
EG["unimpressed"] = G(*BROW_LOW, *LID, "....KWWWPPPPPWWK....", ".....KKKKKKKKKK.....", top=5)
EG["blink"] = G(*BROW_LOW, ".....LLLLLLLLLL.....", "....LLLLLLLLLLLL....", "....LLLLLLLLLLLL....",
                "...KKKKKKKKKKKKKK...", ".....KKKKKKKKKK.....", top=4)
SKEP_UP = G(".....bbbbbbbbb......",
            "...bbwwwwwwwwwbb....",
            "..bwwbbbbbbbbbwwb...",
            "..bb..........bbb...",
            "", "", "", *OPEN_EYE)
EG["skeptical"] = (SKEP_UP, EG["unimpressed"])      # screen-left brow up, screen-right lid low
EG["surprised"] = G(*BROW[:3], "",
                    ".....KKKKKKKKKK.....",
                    "....KWWWWWWWWWWK....",
                    "...KWWWWWPPWWWWWK...",
                    "...KWWWWPPPPWWWWK...",
                    "...KWWWWPPPPWWWWK...",
                    "...KWWWWWPPWWWWWK...",
                    "....KWWWWWWWWWWK....",
                    ".....KKKKKKKKKK.....", top=0)
EG["annoyed"] = G("..bbbb..............",
                  ".bwwwwbbbb..........",
                  "..bbbwwwwwbbbb......",
                  "......bbbbwwwwwbb...",
                  "..........bbbbbbbb..",
                  "....KKKKLLLLLLLLL...",
                  "....KWWWKKKKKKKKKK..",
                  "....KWWWPPPPPWWK....",
                  "....KWWWWPPPWWWK....",
                  ".....KKKKKKKKKK.....", top=3)
EG["sleepy"] = G("........bbbbbbbb....",
                 "....bbbbwwwwwwwwb...",
                 "..bbwwwwbbbbbbbb....",
                 "..bbbb..............",
                 ".....LLLLLLLLLL.....",
                 "....LLLLLLLLLLLL....",
                 "...KKKKKKKKKKKKKK...",
                 "....KKPPPPPPPPKK....", top=5)
EG["happy"] = G("....bbbbbbbbbbbb....",
                "...bwwwwwwwwwwwwb...",
                "....bbbbbbbbbbbb....",
                "", "", "",
                ".......KKKKKK.......",
                ".....KK......KK.....",
                "....K..........K....", top=2)
EG["lookside"] = G(*BROW_LOW, *LID, "....KPPPPPWWWWWK....", "....KWPPPWWWWWWK....", ".....KKKKKKKKKK.....", top=4)

# ---- mouth grids: 18 cols x 7 rows at cell (x 39..56, y 6..12)
M0X, M0Y = 39, 7
MG = {}
MG["neutral"] = ["..................",
                 "..................",
                 "..................",
                 ".....KKKKKKKK.....",
                 "..................",
                 "..................",
                 "..................", ]
MG["smile"] = ["..................",
               "..................",
               "....K........K....",
               ".....KKKKKKKK.....",
               "..................",
               "..................",
               "..................", ]
MG["talkA"] = ["..................",
               "......KKKKKK......",
               ".....KMMMMMMK.....",
               ".....KMMMMMMK.....",
               ".....KMTTTTMK.....",
               "......KKKKKK......",
               "..................", ]
MG["talkO"] = ["..................",
               ".......KKKK.......",
               "......KMMMMK......",
               "......KMMMMK......",
               ".......KKKK.......",
               "..................",
               "..................", ]
MG["talkE"] = ["..................",
               "..................",
               "....KKKKKKKKKK....",
               "....KWWWWWWWWK....",
               ".....KKKKKKKK.....",
               "..................",
               "..................", ]
MG["talkM"] = ["..................",
               "..................",
               "......KKKKKK......",
               "......KKKKKK......",
               "..................",
               "..................",
               "..................", ]
MG["surprised"] = [".......KKKK.......",
                   "......KMMMMK......",
                   ".....KMMMMMMK.....",
                   ".....KMMTTMMK.....",
                   "......KMMMMK......",
                   ".......KKKK.......",
                   "..................", ]
MG["frown"] = ["..................",
               "..................",
               ".....KKKKKKKK.....",
               "....K........K....",
               "..................",
               "..................",
               "..................", ]
MG["smirk"] = ["..................",
               "..................",
               "............K.....",
               ".....KKKKKKK......",
               "..................",
               "..................",
               "..................", ]
MG["sleepy"] = ["..................",
                "..................",
                ".......KKKK.......",
                "......KMMMMK......",
                ".......KKKK.......",
                "..................",
                "..................", ]


def eyes_cell(name):
    im = Image.new("RGB", (CW, EH), SKIN); px = im.load()
    for y in range(EH):                      # skin with a faint darker band under the hat line
        for x in range(CW):
            if y < 5 and (x + y) % 2 == 0:
                px[x, y] = SKIN_D
    for cx in (30, CW - 1 - 30):             # rosy cheeks
        for dy in range(3):
            for dx in range(-4, 5):
                if abs(dx) + dy * 2 <= 5 and (dx + dy) % 2 == 0:
                    px[cx + dx, 20 + dy] = BLUSH
    g = EG[name]
    L, R = g if isinstance(g, tuple) else (g, None)
    for side in (0, 1):
        grid = L if side == 0 else (R if R is not None else L)
        mirror = name != "lookside"
        for gy, row in enumerate(grid):
            for gx, ch in enumerate(row):
                if ch == ".":
                    continue
                x = E0X + gx
                if side == 1:
                    x = (CW - 1 - x) if mirror else (CW - 1 - (E0X + EW - 1) + gx)
                px[x, E0Y + gy] = PAL[ch]
    return im


# ---- option A: Servbot (MML1) eyes. Big oval: brown outline, light-grey ring, big dark pupil; expressions come from a
# skin-coloured lid closing over the eye (fraction f, tilt toward the nose) with a dark-brown lid line. Colours are the
# Servbot texture's own: outline (128,96,40), ring (200,200,208), pupil (56,56,64), line (88,56,16).
SB_OUT, SB_RING, SB_PUP, SB_LINE = (128, 96, 40), (200, 200, 208), (56, 56, 64), (88, 56, 16)
#            f     tilt  pupil dx dy  pupil scale  eye scale  mode
EA = {"deadpan":     (0.47, 0.0, 0, 2.4, 1.0, 1.0, "lid"),
      "open":        (0.0, 0.0, 0, 0.0, 1.0, 1.0, "lid"),
      "unimpressed": (0.6, 0.0, 0, 3.0, 1.0, 1.0, "lid"),
      "blink":       (1.0, 0.0, 0, 0.0, 1.0, 1.0, "closed"),
      "skeptical":   ((0.06, 0.0, 0, 0.0, 0.9, 1.04, "lid"), (0.6, 0.1, 0, 3.0, 1.0, 0.94, "lid")),
      "surprised":   (0.0, 0.0, 0, 0.0, 0.55, 1.04, "lid"),
      "annoyed":     (0.44, 0.38, 0, 1.6, 1.0, 1.0, "lid"),
      "sleepy":      (0.74, -0.12, 0, 3.0, 1.0, 1.0, "lid"),
      "happy":       (1.0, 0.0, 0, 0.0, 1.0, 1.0, "happy"),
      "lookside":    (0.47, 0.0, -4.5, 1.6, 1.0, 1.0, "lid")}


def sb_eye(px, cx, inner, prm):
    f, tilt, pdx, pdy, ps, es, mode = prm
    cy, rx, ry = 13.4, 13.0 * es, 9.6 * es        # Servbot proportions: each eye ~1/3 of the face width
    for y in range(EH):
        for x in range(max(0, int(cx - rx - 2)), min(CW, int(cx + rx + 2))):
            X, Y = x + 0.5 - cx, y + 0.5 - cy
            d = (X / rx) ** 2 + (Y / ry) ** 2
            if mode == "closed":
                if abs(X) < rx - 1.0 and abs(Y - (3.6 - 0.022 * X * X)) < 1.1:
                    px[x, y] = SB_LINE
                continue
            if mode == "happy":
                if abs(X) < rx - 1.0 and abs(Y - (4.0 - 0.024 * (rx * rx - X * X))) < 1.1:
                    px[x, y] = SB_LINE
                continue
            if d > 1.0:
                continue
            c = SB_OUT if d > 0.8 else SB_RING
            if (((X - pdx) / (7.0 * ps)) ** 2 + ((Y - pdy) / (5.6 * ps)) ** 2) <= 1.0 and d <= 0.8:
                c = SB_PUP
            ylid = -ry + f * 2 * ry + tilt * X * inner          # lid edge (eye-space y, grows downward)
            if Y < ylid:
                c = SKIN
            elif Y < ylid + 1.7 and f > 0:
                c = SB_LINE
            px[x, y] = c


def eyes_cell_a(name):
    im = Image.new("RGB", (CW, EH), SKIN); px = im.load()
    for cx in (14, CW - 1 - 14):             # rosy cheeks below-outside the big eyes
        for dy in range(2):
            for dx in range(-3, 4):
                if abs(dx) + dy * 2 <= 4 and (dx + dy) % 2 == 0:
                    px[cx + dx, 23 + dy] = BLUSH
    prm = EA[name]
    L, R = prm if isinstance(prm[0], tuple) else (prm, prm)
    sb_eye(px, 26.0, +1, L)                  # screen-left eye: inner corner toward +x
    sb_eye(px, CW - 26.0, -1, R)
    return im


def mouth_cell(name):
    im = Image.new("RGB", (CW, MH), SKIN); px = im.load()
    for y in range(MH):                      # beard (white strands) widening down to the geometry's top edge (+-36 px)
        hw = 15 + y * 21 / 16
        for x in range(CW):
            if abs(x - 47.5) <= hw:
                k = (x * 3 + y * 5 + (x // 7) * 11) % 13
                px[x, y] = BRD_L if k == 0 else (BRD_D if k == 6 or abs(abs(x - 47.5) - hw) < 1 else BRD)
    for y in range(MH):                      # skin patch around the mouth (rounded), cheeks meet at the top
        for x in range(CW):
            dx = abs(x - 47.5)
            top = False
            patch = 4 <= y <= 14 and dx <= 11 - max(0, y - 11) * 2
            if top or patch:
                px[x, y] = SKIN
    for x in range(CW):                      # moustache: two drooping lobes under the nose
        dx = abs(x - 47.5)
        if dx <= 16:
            top = 1 if dx < 9 else 1 + int((dx - 9) * 0.6)
            bot = 5 + (1 if 3 < dx < 12 else 0) + (1 if 6 < dx < 10 else 0)
            for y in range(top, bot + 1):
                px[x, y] = BRD_L if (y == top or (x + y) % 5 == 0) else BRD
            px[x, bot + 1] = BRD_D
    for gy, row in enumerate(MG[name]):
        for gx, ch in enumerate(row):
            if ch != ".":
                px[M0X + gx, M0Y + gy] = PAL[ch]
    return im


def build():
    ea = Image.new("RGB", (CW * N, EH)); eb = Image.new("RGB", (CW * N, EH)); ma = Image.new("RGB", (CW * N, MH))
    for i in range(N):
        nm = EYES[i] if i < len(EYES) else "deadpan"
        ea.paste(eyes_cell_a(nm), (i * CW, 0)); eb.paste(eyes_cell(nm), (i * CW, 0))
        ma.paste(mouth_cell(MOUTHS[i] if i < len(MOUTHS) else "neutral"), (i * CW, 0))
    os.makedirs(os.path.join(ROOT, "tex"), exist_ok=True)
    # option A (Servbot eyes) is the default atlas; option B (small gnome eyes + white brows, review v1) is kept
    ea.save(os.path.join(ROOT, "tex", "gnome_eyes.png")); eb.save(os.path.join(ROOT, "tex", "gnome_eyes_b.png"))
    ma.save(os.path.join(ROOT, "tex", "gnome_mouth.png"))
    # preview: each expression = eyes cell over mouth cell, x6
    cols = 5; rows = (max(len(EYES), len(MOUTHS)) + cols - 1) // cols
    pv = Image.new("RGB", (cols * (CW + 4), 2 * rows * (EH + MH + 4)), (40, 40, 40))
    for k, e in enumerate((ea, eb)):
        for i in range(max(len(EYES), len(MOUTHS))):
            x, y = (i % cols) * (CW + 4), (k * rows + i // cols) * (EH + MH + 4)
            pv.paste(e.crop((i * CW, 0, i * CW + CW, EH)), (x, y)); pv.paste(ma.crop((i * CW, 0, i * CW + CW, MH)), (x, y + EH))
    os.makedirs(os.path.join(ROOT, "review"), exist_ok=True)
    pv.resize((pv.width * 6, pv.height * 6), Image.NEAREST).save(os.path.join(ROOT, "review", "face_atlas_x6.png"))
    print("FACE ATLAS", ea.size, ma.size)


if __name__ == "__main__":
    build()
