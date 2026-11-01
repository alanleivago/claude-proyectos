"""Bike 'punk' atlas (venv python). Reads the PURCHASED BikeTexture.png (never writes it) and writes
punk/bike/Bike_punk.png (+ 4x preview).
- all red paint -> the same cobalt value ramp as Kaneda_punk (shading kept); seat, glass, tyres, dash untouched
- sticker block (u 160-192, v 64-104; only the 'Plane' decal object uses it) repainted with original decals:
  PUNK / POLY / SHORTS plates, the bolt-in-triangle icon, hazard stripes, checker. No real brands.
  Rects that are shared by both sides of the bike (mirrored UVs) get symmetric designs only (no text).
"""
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / "modelo-comprado/AkiraModels/Bike/BikeTexture.png"
OUT = HERE / "bike"
atlas = np.asarray(Image.open(SRC).convert("RGBA")).astype(np.float32)
H, W = atlas.shape[:2]

# ---- 1. red paint -> cobalt ramp (same keys/colours as make_punk.py)
r, g, b = atlas[..., 0], atlas[..., 1], atlas[..., 2]
mx = atlas[..., :3].max(2); mn = atlas[..., :3].min(2)
sat = (mx - mn) / np.maximum(mx, 1)
reddish = (r >= g) & (r >= b) & (sat > 0.35) & ((g - b) < 60)
yy, xx = np.mgrid[:H, :W]
seat = (xx >= 128) & (yy < 64)                    # brown seat block stays
mask = reddish & ~seat
L = 0.3 * r + 0.59 * g + 0.11 * b
keys = np.array([20, 33, 90, 170, 230.0])
cols = np.array([[8, 20, 60], [14, 36, 102], [31, 79, 200], [92, 140, 255], [170, 200, 255.0]])
blue = np.stack([np.interp(L, keys, cols[:, c]) for c in range(3)], -1)
out = atlas.copy()
out[..., :3][mask] = blue[mask]
print("paint px", int(mask.sum()))

# ---- 2. decals
CREAM = (250, 240, 214); YEL = (255, 210, 30); DARK = (12, 16, 44); COB = (31, 79, 200); COBD = (14, 36, 102)
F = {  # 3x5 caps
    "P": ["##.", "#.#", "##.", "#..", "#.."], "U": ["#.#", "#.#", "#.#", "#.#", "###"],
    "N": ["#.#", "###", "###", "#.#", "#.#"], "K": ["#.#", "##.", "#..", "##.", "#.#"],
    "O": ["###", "#.#", "#.#", "#.#", "###"], "L": ["#..", "#..", "#..", "#..", "###"],
    "Y": ["#.#", "#.#", ".#.", ".#.", ".#."], "S": ["###", "#..", "###", "..#", "###"],
    "H": ["#.#", "#.#", "###", "#.#", "#.#"], "R": ["##.", "#.#", "##.", "#.#", "#.#"],
    "T": ["###", ".#.", ".#.", ".#.", ".#."],
}
px = out[..., :3]


def rect(x0, y0, x1, y1, col):
    px[y0:y1, x0:x1] = col


def plate(x0, y0, x1, y1, text, bg, fg):
    rect(x0, y0, x1, y1, bg)
    tw = 4 * len(text) - 1
    x = x0 + (x1 - x0 - tw) // 2; y = y0 + (y1 - y0 - 5) // 2
    for ch in text:
        for ry, row in enumerate(F[ch]):
            for rx, c in enumerate(row):
                if c == "#":
                    px[y + ry, x + rx] = fg
        x += 4


def hazard(x0, y0, x1, y1):
    for y in range(y0, y1):
        for x in range(x0, x1):
            px[y, x] = YEL if ((x + y) // 2) % 2 == 0 else DARK


def checker(x0, y0, x1, y1):
    for y in range(y0, y1):
        for x in range(x0, x1):
            px[y, x] = CREAM if ((x // 2) + (y // 2)) % 2 == 0 else DARK


ICON = ["...##...",   # bolt-in-triangle, 8x8, symmetric triangle with a centred bolt
        "..#YY#..",
        "..#DY#..",
        ".#YDDY#.",
        ".#YYDY#.",
        "#YYDYYY#",
        "#YYYYYY#",
        "########"]


def icon(x0, y0, bg=COBD):
    for ry, row in enumerate(ICON):
        for rx, c in enumerate(row):
            px[y0 + ry, x0 + rx] = {"#": DARK, "Y": YEL, "D": DARK, ".": bg}[c]


def dot(x0, y0, n, ring, core):
    c = (n - 1) / 2
    for y in range(n):
        for x in range(n):
            d = np.hypot(x - c, y - c)
            px[y0 + y, x0 + x] = core if d < n * 0.28 else ring if d < n * 0.52 else COBD


plate(160, 64, 176, 72, "PUNK", YEL, DARK)          # right side, front fairing (face 276/277)
checker(176, 64, 192, 72)                            # shared both sides (278/295) -> symmetric
hazard(160, 72, 176, 80)                             # undersides
icon(176, 72); icon(184, 72)                         # 279-282
# UV orientation checked per face (right/down vs normal): 276/277, 284, 292 read correctly; shared/mirrored rects are symmetric
plate(160, 80, 184, 88, "SHORTS", CREAM, DARK)       # left side (284)
dot(184, 80, 8, CREAM, YEL)                          # 285/286
plate(160, 88, 178, 96, "POLY", DARK, YEL)           # left side (292)
rect(178, 88, 184, 96, COBD); dot(178, 90, 6, YEL, DARK)
icon(184, 88, COB); rect(184, 96, 192, 104, COB); icon(184, 96, COB)
hazard(160, 96, 178, 104)
rect(178, 96, 184, 104, COBD)

res = np.clip(out, 0, 255).astype(np.uint8)
OUT.mkdir(exist_ok=True)
Image.fromarray(res, "RGBA").save(OUT / "Bike_punk.png")
Image.fromarray(res, "RGBA").resize((W * 4, H * 4), Image.NEAREST).save(HERE.parent / "out/punk_bike/Bike_punk_atlas_x4.png")
print("ok")
