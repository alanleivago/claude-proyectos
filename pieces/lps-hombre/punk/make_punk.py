"""Kaneda 'punk' atlas (venv python). Reads the PURCHASED atlas (never writes it) and writes
punk/Kaneda_punk.png (+ 4x preview + jacket mask preview).
- jacket recolour red -> cobalt ramp, masked by the jacket's UV faces (from kaneda_faces.json), red pixels only
- back emblem: 'punkpolyshorts' on the ring + low-poly bolt piercing a faceted triangle, pixel art at atlas res
"""
import json, math
from pathlib import Path
import numpy as np
from scipy import ndimage as nd
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / "modelo-comprado/AkiraModels/Kaneda/Kaneda.png"
atlas = np.asarray(Image.open(SRC).convert("RGBA")).astype(np.float32)
H, W = atlas.shape[:2]
faces = json.loads((HERE / "kaneda_faces.json").read_text())

# ---- 1. jacket mask by UV faces (rest-pose height: jacket = waist band up to collar; hands/gloves/trousers below)
def raster(polys, ss=4):
    im = Image.new("L", (W * ss, H * ss), 0)
    d = ImageDraw.Draw(im)
    for uv in polys:
        d.polygon([(u * W * ss, (1 - v) * H * ss) for u, v in uv], fill=255)
    return np.asarray(im.resize((W, H), Image.BOX)) > 96

def is_jacket(f):
    z = f["c"][2]
    u = sum(p[0] for p in f["uv"]) / len(f["uv"])
    # jacket: chest/back/sleeves/collar; its lower side panels (z ~ -0.4) use the JacketSide block (u < 160/192),
    # while the trousers' waistband (same height) lives in the trousers block (u >= 160/192)
    return (-0.3 < z < 1.3) or (-0.5 < z <= -0.3 and u < 160 / 192)


jacket_f = [f["uv"] for f in faces if is_jacket(f)]
other_f = [f["uv"] for f in faces if not is_jacket(f)]
mj, mo = raster(jacket_f), raster(other_f)
r, g, b = atlas[..., 0], atlas[..., 1], atlas[..., 2]
mx = atlas[..., :3].max(2); mn = atlas[..., :3].min(2)
sat = (mx - mn) / np.maximum(mx, 1)
reddish = (r >= g) & (r >= b) & (sat > 0.35) & ((g - b) < 60)          # red / dark red / pink-red, not skin (orange-ish)
skinlike = (r > 200) & (g > 140) & (b > 100) & ((r - b) < 110) & ((g - b) > 28)   # pink jacket highlights have g~b; skin is orange
yy0, xx0 = np.mgrid[:H, :W]
headrect = ((xx0 < 96) & (yy0 >= 64) & (yy0 < 128)) | ((xx0 >= 96) & (xx0 < 128) & (yy0 >= 64) & (yy0 < 112))   # face / ear / hair
mj2 = nd.binary_dilation(mj, iterations=2) & ~nd.binary_dilation(mo, iterations=1)   # cover island margins (Closest edge texels)
mask = reddish & ~skinlike & ~headrect          # ALL clothing (jacket, trousers, knee pads, gloves, cuffs, boots) -> cobalt; face/hair/ears block untouched
print("clothing px", int(mask.sum()), "| overlapping jacket/other px left red:", int((mj & mo).sum()))

# value ramp red -> cobalt
L = 0.3 * r + 0.59 * g + 0.11 * b
keys = np.array([20, 33, 90, 170, 230.0])
cols = np.array([[8, 20, 60], [14, 36, 102], [31, 79, 200], [92, 140, 255], [170, 200, 255.0]])
blue = np.stack([np.interp(L, keys, cols[:, c]) for c in range(3)], -1)
out = atlas.copy()
out[..., :3][mask] = blue[mask]
# leftover specks: texels only partly covered by a jacket face (island edges) that the strict mask skipped.
# Recolour them only inside jacket-only atlas blocks (never the glove block, trousers/boots column, face, emblem).
def raster_any(polys, ss=4):
    im = Image.new("L", (W * ss, H * ss), 0)
    dd = ImageDraw.Draw(im)
    for uv in polys:
        dd.polygon([(u * W * ss, (1 - v) * H * ss) for u, v in uv], fill=255)
    return np.asarray(im.resize((W, H), Image.BOX)) > 20
jacket_blocks = np.zeros((H, W), bool)
jacket_blocks[0:64, 0:64] = True        # front
jacket_blocks[0:64, 128:160] = True     # sleeves / jacket sides
jacket_blocks[112:128, 96:128] = True   # collar strip
jacket_blocks[128:160, 0:64] = True     # collar inside / shoulder stripes
specks = raster_any(jacket_f) & jacket_blocks & reddish & ~skinlike & ~mask
out[..., :3][specks] = blue[specks]
print("specks recoloured:", int(specks.sum()))

# ---- 2. back emblem block (64..128, 0..64): erase old lettering + pill, draw the new emblem
bx, by = 64, 0
blk = out[by:by + 64, bx:bx + 64, :3]
orig = atlas[by:by + 64, bx:bx + 64, :3]
yy, xx = np.mgrid[:64, :64]
CX, CY = 32.0, 27.0
rad = np.hypot(xx - CX, yy - CY)
disc_c = np.array([31, 79, 200.0])
# clean disc: rebuild the shaded disc where the old letters / pill were (normalised blur of the valid disc pixels)
Lb = L[by:by + 64, bx:bx + 64]
valid = reddish[by:by + 64, bx:bx + 64] & (Lb > 70)
zone = rad < 26.5
wsum = nd.gaussian_filter(valid.astype(float), 2.5)
fill = np.stack([nd.gaussian_filter(blk[..., c] * valid, 2.5) for c in range(3)], -1) / np.maximum(wsum, 1e-3)[..., None]
blk[zone] = fill[zone]

# ---- chunky PS1 emblem: everything drawn on a 32x32 cell grid (1 cell = 2x2 texels), upscaled nearest
N = 32
CS = 8                                    # supersampling for polygon rasterisation
def lay(poly):
    im = Image.new("L", (N * CS, N * CS), 0)
    ImageDraw.Draw(im).polygon([(x * CS, y * CS) for x, y in poly], fill=255)
    return np.asarray(im.resize((N, N), Image.BOX)) > 127


def ring(m):
    return nd.binary_dilation(m, structure=np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]])) & ~m


em = np.zeros((N, N, 3)); em_m = np.zeros((N, N), bool)
DARKC = np.array([12, 16, 44.0])
# faceted triangle (3 facets) behind
T = [(16, 10.2), (6.2, 19.8), (25.8, 19.8)]
C = (17, 16.4)
for tri, col in (((T[0], T[1], C), (236, 172, 20)), ((T[0], C, T[2]), (196, 132, 0)), ((T[1], T[2], C), (140, 88, 0))):
    m = lay(tri); em[m] = col; em_m |= m
tm = lay(T); em[ring(tm)] = DARKC; em_m |= ring(tm)
# classic 3-segment zigzag bolt, hand-placed cells (sharp top-right corner, jog, sharp tip below the triangle base)
BOLT = ["......####",
        ".....####.",
        "....####..",
        "...####...",
        "..####....",
        ".#########",
        "..#######.",
        "......###.",
        ".....###..",
        "....###...",
        "...###....",
        "..###.....",
        "..##......"]
bm = np.zeros((N, N), bool)
for ry, row in enumerate(BOLT):
    for rx, c in enumerate(row):
        if c == "#":
            bm[8 + ry, 11 + rx] = True
em[ring(bm)] = DARKC; em_m |= ring(bm)
em[bm] = (255, 210, 30); em_m |= bm                    # #FFD21E

# chunky lowercase font, 3 wide x 7 rows (2 ascender, 4 x-height, 1 descender)
G = {  # 3 wide x 8 rows: 0-1 ascender, 2-6 x-height, 7 descender
    "p": ["...", "...", "##.", "#.#", "#.#", "##.", "#..", "#.."],
    "u": ["...", "...", "#.#", "#.#", "#.#", "#.#", "###", "..."],
    "n": ["...", "...", "##.", "#.#", "#.#", "#.#", "#.#", "..."],
    "k": ["#..", "#..", "#.#", "#.#", "##.", "#.#", "#.#", "..."],
    "o": ["...", "...", "###", "#.#", "#.#", "#.#", "###", "..."],
    "l": ["#", "#", "#", "#", "#", "#", "#", "."],
    "y": ["...", "...", "#.#", "#.#", "#.#", "###", "..#", "##."],
    "s": ["...", "...", "###", "#..", "###", "..#", "###", "..."],
    "h": ["#..", "#..", "##.", "#.#", "#.#", "#.#", "#.#", "..."],
    "r": ["...", "...", "#.#", "##.", "#..", "#..", "#..", "..."],
    "t": [".#.", ".#.", "###", ".#.", ".#.", ".#.", ".##", "..."],
}
txt = np.zeros((N, N), bool)


def word(text, top_row, drop_ends=0):
    """Variable-width glyphs, 1 cell gap, centred; outermost letters step drop_ends cells (shallow arc)."""
    widths = [len(G[c][0]) for c in text]
    total = sum(widths) + len(text) - 1
    x = (N - total) // 2
    n = len(text)
    for i, ch in enumerate(text):
        dy = drop_ends if i in (0, n - 1) else 0
        for ry, row in enumerate(G[ch]):
            for rx, c in enumerate(row):
                if c == "#" and 0 <= top_row + ry + dy < N and 0 <= x + rx < N:
                    txt[top_row + ry + dy, x + rx] = True
        x += widths[i] + 1


# layout fitted to the back panel's UV polygon (usable width: 24 cells at the top, 29 cells mid-back):
# icon on top, "punkpoly" across the widest band, "shorts" below
CREAM = np.array([250, 240, 214.0])
em[txt] = CREAM; em_m |= txt
up = lambda a: np.kron(a, np.ones((2, 2))) if a.ndim == 2 else np.kron(a, np.ones((2, 2, 1)))
M2 = up(em_m.astype(float)) > 0.5
blk[M2] = up(em)[M2]

# ring lettering at texel scale (fits the arc): lowercase 4x8 glyphs, 2-row ascenders, x-height 5
F4 = {
    "p": ["....", "....", "###.", "#..#", "#..#", "###.", "#...", "#..."],
    "u": ["....", "....", "#..#", "#..#", "#..#", "#..#", ".###", "...."],
    "n": ["....", "....", "###.", "#..#", "#..#", "#..#", "#..#", "...."],
    "k": ["#...", "#...", "#..#", "#.#.", "##..", "#.#.", "#..#", "...."],
    "o": ["....", "....", ".##.", "#..#", "#..#", "#..#", ".##.", "...."],
    "l": ["#.", "#.", "#.", "#.", "#.", "#.", ".#", ".."],
    "y": ["....", "....", "#..#", "#..#", "#..#", ".###", "...#", ".##."],
    "s": ["....", "....", ".###", "#...", ".##.", "...#", "###.", "...."],
    "h": ["#...", "#...", "###.", "#..#", "#..#", "#..#", "#..#", "...."],
    "r": ["....", "....", "#.##", "##..", "#...", "#...", "#...", "...."],
    "t": [".#..", ".#..", "###.", ".#..", ".#..", ".#..", "..##", "...."],
}
t64 = np.zeros((64, 64), bool)


def arc64(text, y_mid, bend):
    widths = [len(F4[c][0]) for c in text]
    total = sum(widths) + 2 * (len(text) - 1)
    x = 32 - total // 2
    for i, ch in enumerate(text):
        cxl = x + widths[i] / 2 - 32
        gx, gy = int(round(x)), int(round(y_mid + bend * cxl * cxl - 4))
        for ry, row in enumerate(F4[ch]):
            for rx, c in enumerate(row):
                if c == "#" and 0 <= gy + ry < 64 and 0 <= gx + rx < 64:
                    t64[gy + ry, gx + rx] = True
        x += widths[i] + 2


arc64("punkpoly", 8.0, 0.012)       # upper arc: ends drop
arc64("shorts", 51.5, -0.02)        # lower arc: ends rise
blk[t64] = CREAM
M2 = M2 | t64
out[by:by + 64, bx:bx + 64, :3] = blk
rb = reddish[by:by + 64, bx:bx + 64] & ~M2
out[by:by + 64, bx:bx + 64, :3][rb & ~zone] = blue[by:by + 64, bx:bx + 64][rb & ~zone]

res = np.clip(out, 0, 255).astype(np.uint8)
Image.fromarray(res, "RGBA").save(HERE / "Kaneda_punk.png")
Image.fromarray(res, "RGBA").resize((W * 4, H * 4), Image.NEAREST).save(HERE.parent / "out/punk/Kaneda_punk_atlas_x4.png")
mprev = atlas.copy(); mprev[..., :3][mask] = [0, 255, 0]
Image.fromarray(np.clip(mprev, 0, 255).astype(np.uint8), "RGBA").resize((W * 4, H * 4), Image.NEAREST).save(HERE.parent / "out/punk/jacket_mask_x4.png")
print("ok")
