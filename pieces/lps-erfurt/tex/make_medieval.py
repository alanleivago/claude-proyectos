"""venv: Kaneda as King Henry VI (1184) — texture swap like lps-onoda's soldier atlases. Every expression atlas
(lps-hombre/punk/faces) gets the cobalt jacket turned into a burgundy wool tunic with gold trim (collar strip, back
emblem -> plain cloth with a gold Hohenstaufen eagle-ish cross), and the trousers/boots into brown hose and dark boots.
Jacket vs trousers by the purchased model's UV faces (kaneda_faces.json, same split as make_punk.py).
Writes tex/medieval/Kaneda_<expr>.png (same names, so K.Kaneda(..., faces_dir=...) swaps them)."""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
PUNK = HERE.parents[1] / "lps-hombre/punk"
SRC = HERE / "faces"                         # punk atlases + this piece's extra expressions
OUT = HERE / "medieval"; OUT.mkdir(exist_ok=True)
faces = json.loads((PUNK / "kaneda_faces.json").read_text())
W, H = 192, 160


def raster(polys, ss=4):
    im = Image.new("L", (W * ss, H * ss), 0); d = ImageDraw.Draw(im)
    for uv in polys:
        d.polygon([(u * W * ss, (1 - v) * H * ss) for u, v in uv], fill=255)
    return np.asarray(im.resize((W, H), Image.BOX)) > 96


def is_jacket(f):
    z = f["c"][2]; u = sum(p[0] for p in f["uv"]) / len(f["uv"])
    return (-0.3 < z < 1.3) or (-0.5 < z <= -0.3 and u < 160 / 192)


MJ = raster([f["uv"] for f in faces if is_jacket(f)])
yy, xx = np.mgrid[:H, :W]
HEAD = ((xx < 96) & (yy >= 64) & (yy < 128)) | ((xx >= 96) & (xx < 128) & (yy >= 64) & (yy < 112))
EMB = (xx >= 64) & (xx < 128) & (yy < 64)
JB = np.zeros((H, W), bool); JB[0:64, 0:64] = JB[0:64, 128:160] = JB[112:128, 96:128] = JB[128:160, 0:64] = True   # jacket-only blocks
COLLAR = (xx >= 96) & (xx < 128) & (yy >= 112) & (yy < 128)


def ramp(L, keys, cols):
    return np.stack([np.interp(L, keys, np.array(cols, float)[:, c]) for c in range(3)], -1)


def medieval(a):
    a = a.astype(float).copy(); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    blue = (b > r + 0.15 * 255) & (b > g + 0.08 * 255) & ~HEAD
    L = (0.25 * r + 0.35 * g + 0.4 * b) / 255
    rng = np.random.default_rng(7)
    L = np.where(EMB, 0.55 + 0.04 * rng.standard_normal(L.shape), L)            # punkpoly patch -> plain wool
    keys = [0.05, 0.2, 0.45, 0.7, 0.95]
    tunic = ramp(L, keys, [(34, 6, 12), (70, 14, 24), (118, 24, 38), (160, 46, 56), (196, 92, 96)])
    hose = ramp(L, keys, [(22, 14, 8), (44, 28, 16), (78, 52, 30), (110, 78, 48), (150, 112, 76)])
    col = np.where((MJ | EMB | JB)[..., None], tunic, hose)
    gold = np.array((214, 168, 52.)) * (0.85 + 0.3 * L[..., None])
    col = np.where(COLLAR[..., None], gold, col)                                 # gold collar band
    ex, ey = xx - 96, yy - 28                                                    # small gold cross-and-ring badge on the back
    badge = EMB & (((np.abs(ex) < 3) & (np.abs(ey) < 14)) | ((np.abs(ey + 3) < 3) & (np.abs(ex) < 11)) |
                   (np.abs(np.hypot(ex, ey) - 17) < 1.4))
    col = np.where(badge[..., None], gold, col)
    m = (blue | EMB)
    a[..., :3] = np.where(m[..., None], col, a[..., :3])
    return a.clip(0, 255).astype(np.uint8)


for f in sorted(SRC.glob("Kaneda_*.png")):
    Image.fromarray(medieval(np.asarray(Image.open(f).convert("RGBA")))).save(OUT / f.name)
Image.open(OUT / "Kaneda_neutral.png").resize((768, 640), Image.NEAREST).save(HERE / "people" / "test" / "kaneda_medieval_atlas.png")
print("medieval atlases ->", OUT, len(list(OUT.glob("*.png"))))
