"""Kaneda_punk expressions (venv python): one full atlas per expression, swapped as a texture (LPS: no face rig,
the expression changes by texture swap). Reads punk/Kaneda_punk.png (neutral), writes punk/faces/Kaneda_<expr>.png.
Eyes and mouth are redrawn as pixel art at atlas resolution; the right eye is the left grid mirrored (x' = 63 - x).
Set modelled on the LPS protagonist: neutral deadpan, scream, bulging eyes, bloodshot eyes, dark circles, squint
grimace; plus the basics a short needs (blink, talk A/O, happy, sad, angry, blank)."""
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
base = np.asarray(Image.open(HERE / "Kaneda_punk.png").convert("RGBA")).copy()
SKIN = (250, 183, 141)
C = {"k": (0, 0, 0), "d": (141, 103, 80), "s": (220, 155, 115), "w": (255, 255, 255), "l": (198, 198, 198),
     "g": (149, 149, 149), "c": (252, 214, 191), "r": (196, 28, 36), "p": (238, 128, 116), "v": (214, 156, 150),
     "u": (178, 120, 126), "t": (244, 236, 224), "m": (96, 22, 26), "n": (200, 84, 88),
     "B": (60, 120, 210), "b": (150, 205, 255)}
EX0, EY0, EW, EH = 8, 86, 18, 12          # left-eye box (x 8..25, y 86..97)
MY0 = 108                                  # mouth box top row; grids are centred on x = 31.5

EYES = {
    "neutral": None,
    "blink": ["", "....kkkkkkkd", "...kd....dkkkd", "", "", ".....ssssssssssss", ".....dkkkkkkkkkkd", "......dddddddddd"],
    "half": ["", ".....dkkkkkd", "....kd.....dkkd", "", ".....dkkkkkkkkkkd", ".....kkkkkkkkkkkkk", ".....lwwkkkkkwwls",
             ".....wwwgkkkkgwws", ".....cwwwgkkgwwcs", "......vvvvvvvvvv", ".....uvvvvvvvvvvu", "......uuuuuuuuuu"],
    "wide": [".....dkkkkkkkkd", "....kd........dk", "", "......dkkkkkkd", "....dkwwwwwwwwkd", "...kwwwwwkkwwwwwk",
             "...kwwwwkkkkwwwwk", "...kwwwwkkkkwwwwk", "...kwwwwwkkwwwwwk", "....dkwwwwwwwwkd", "......dkkkkkkd"],
    "bloodshot": [".....dkkkkkkkd", "....kd.......dk", ".....pppppppppp", "....pdkkkkkkkkdp", "...pkwwrwwwwwrwkp",
                  "..pkwrwwgggwwrwwkp", "..pkrwwgkkkgwwwrkp", "..pkwwwgkkkgwrwwkp", "..pkwrwwgggwwwrwkp",
                  "...pkwwwwrwwwwwkp", "....pdkkkkkkkkdp", ".....pppppppppp"],
    "squint": ["", "...dkkkkkkd", ".....dkkkkkkkkd", ".......dd.....dkk", ".....dkkkkkkkkkkd", ".....kkwkkkkkwkkk",
               "......dkkkkkkkkd", ".......ddddddd"],
    "happy": ["", ".....dkkkkkd", "....kd......dkd", "", "........dkkkd", "......dkkddkkkd", ".....kkd.....dkk",
              ".....kd.......dk"],
    "sad": ["............dkkd", "........dkkkkd", "....dkkkkd", "...dkkkkkkkkkkd", ".....kkgglgkkkkkdk",
            ".....ggllgkwkkkkkk", ".....lwwwkwwkkkgls", ".....wwwwgkkkkgwls", ".....cwwwwgkkgwwcs", "......ccwwwwwwcc"],
    "angry": ["...dkd", "....dkkkd", ".......dkkkkd", "..........dkkkkkkk", ".....kkkkkkkkkkkkk", ".....lwwwkwwkkkgls",
              ".....wwwwgkkkkgwls", ".....cwwwwgkkgwwcs", "......ccwwwwwwcc"],
    "cross": [".....dkkkkkkkkd", "....kd........dk", "", "......dkkkkkkd", "....dkwwwwwwwwkd", "...kwwwwwwwwwwwk",
              "...kwwwwwwwwkkwk", "...kwwwwwwwkkkkk", "...kwwwwwwwwkkwk", "....dkwwwwwwwwkd", "......dkkkkkkd"],
    "tiny": [".....dkkkkkkkkd", "....kd........dk", "", "......dkkkkkkd", "....dkwwwwwwwwkd", "...kwwwwwwwwwwwk",
             "...kwwwwwkkwwwwwk", "...kwwwwwkkwwwwwk", "...kwwwwwwwwwwwk", "....dkwwwwwwwwkd", "......dkkkkkkd"],
    "flatlid": ["", "", "....dkkkkkkkkkkd", "", ".....kkkkkkkkkkkkk", ".....lwwkkkkkwwls", ".....wwwgkkkkgwws",
                ".....cwwwgkkgwwcs", "......ssssssssss"],
    "blank": [".....dkkkd....d", "....kkkkkkkd", "...kd....dkkkd", "..d...dkkkkkkkkd.k", ".....kklllllllllk",
              ".....llwwwwwwwwwl", ".....wwwwwwwwwwwl", ".....wwwwwwwwwwwl", ".....cwwwwwwwwwwc", "......ccwwwwwwcc"],
}
MOUTHS = {
    "neutral": None,
    "talkA": ["", "", "", ".dkkkkkkkkkkd", "dmmmmmmmmmmmmd", ".dmmmnnnnmmmd", "..dkkkkkkkkd", "", "...ssssssss"],
    "talkO": ["", "", "", "....dkkkkd", "...dmmmmmmd", "...dmmnnmmd", "....dkkkkd", "", ".....ssss"],
    "scream": ["...dkkkkkkkkkkd", "..dkttttttttttkd", "..kmmmmmmmmmmmmk", ".dkmmmmmmmmmmmmkd", ".kmmmmmmmmmmmmmmk",
               ".kmmmmmnnnnmmmmmk", ".kmmmmnnnnnnmmmmk", ".dkmmmnnnnnnmmmkd", "..dkkmmmmmmmmkkd", "....dkkkkkkkkd",
               ".....ssssssss"],
    "smallO": ["", "", "", "....dkkd", "...dmmmmd", "...dmmmmd", "....dkkd", "", "....ssss"],
    "frown": ["", "", "", "", "....dkkkkkkd", "..dkkd....dkkd", ".dd..........dd"],
    "grimace": ["", "", "", ".............dk", ".dkkkkkkkkkkkkd", ".kttktttkttkttk", "..dkkkkkkkkkkkd", "", "....ssssss"],
    "smile": ["", "", "", "d..............d", ".dd..........dd", "...dkkkkkkkkd", "....ssssssss"],
    "disgust": ["", "", "", "...........dkd", ".dkkkkkkkkkd.kd", "..dd......dktkd", "...........dkd", "", "....ssssss"],
    "flat": ["", "", "", "", "...ddkkkkkkkkdd", "", "", "....ssssssss"],
    "wavy": ["", "", "", "", "..kkk..kkk..kkk", ".k...kk...kk...k", "", "....ssssssss"],
    "crooked": ["", "", "", "..............kk", "...dkkkkkkkkkkd", "..d", "", "....ssssssss"],
}
EXPR = {  # name: (left eye, right eye, mouth)
    "neutral": ("neutral", "neutral", "neutral"), "blink": ("blink", "blink", "neutral"),
    "talkA": ("neutral", "neutral", "talkA"), "talkO": ("neutral", "neutral", "talkO"),
    "scream": ("wide", "wide", "scream"), "shocked": ("wide", "wide", "smallO"),
    "bloodshot": ("bloodshot", "bloodshot", "flat"), "tired": ("half", "half", "frown"),
    "grimace": ("squint", "neutral", "grimace"), "happy": ("happy", "happy", "smile"),
    "sad": ("sad", "sad", "frown"), "angry": ("angry", "angry", "grimace"), "blank": ("blank", "blank", "flat"),
    "disgust": ("squint", "neutral", "disgust"), "crosseyed": ("cross", "cross", "smallO"),
    # LPS deadpan set (fuentes/lowpolyshorts-style/expresiones-protagonista.md): one readable face per shot
    "stern": ("flatlid", "flatlid", "flat"), "nervous": ("tiny", "tiny", "wavy"), "skeptic": ("flatlid", "wide", "crooked"),
}
EXTRAS = {"nervous": (56, 83, ["..B..", "..B..", ".BbB.", "BbwbB", "BbbbB", "BbbbB", ".BBB."])}     # sweat drop on the temple


def paint_eye(a, grid, right):
    if grid is None:
        return
    for ry, row in enumerate(grid):
        for rx, ch in enumerate(row.ljust(EW, ".")[:EW]):
            x = EX0 + rx
            if right:
                x = 63 - x
            a[EY0 + ry, x, :3] = C[ch] if ch in C else SKIN


def paint_mouth(a, grid):
    if grid is None:
        return
    a[109:121, 18:46, :3] = SKIN                                   # erase the original line + lip shade
    w = max(len(r) for r in grid)
    x0 = 32 - (w + 1) // 2
    for ry, row in enumerate(grid):
        for rx, ch in enumerate(row):
            if ch in C:
                a[MY0 + ry, x0 + rx, :3] = C[ch]


out = HERE / "faces"
out.mkdir(exist_ok=True)
for name, (le, re, mo) in EXPR.items():
    a = base.copy()
    for grid, right in ((EYES[le], False), (EYES[re], True)):
        if grid is not None:
            xs = [63 - x for x in range(EX0, EX0 + EW)] if right else list(range(EX0, EX0 + EW))
            a[EY0:EY0 + EH, min(xs):max(xs) + 1, :3] = SKIN       # clear the whole eye box first
            paint_eye(a, grid, right)
    paint_mouth(a, MOUTHS[mo])
    if name in EXTRAS:
        x0, y0, g = EXTRAS[name]
        for ry, row in enumerate(g):
            for rx, ch in enumerate(row):
                if ch in C:
                    a[y0 + ry, x0 + rx, :3] = C[ch]
    Image.fromarray(a, "RGBA").save(out / f"Kaneda_{name}.png")
print("faces:", list(EXPR))
