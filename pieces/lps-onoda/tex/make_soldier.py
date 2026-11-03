"""venv: Kaneda in an IJA field uniform — every expression atlas (lps-hombre/punk/faces) with the cobalt jacket
turned olive drab, the punkpoly back logo replaced by plain cloth, and wear stages for the 29 years in the jungle:
  wear 0 = new (1944), 1 = faded + a few patches, 2 = sun-bleached, patched all over, frayed (1974).
Writes tex/soldier/w<N>/Kaneda_<expr>.png (same names, so K.Kaneda(..., faces_dir=...) swaps them)."""
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
FACES = HERE.parents[1] / "lps-hombre/punk/faces"
rng = np.random.default_rng(3)
# olive drab ramp, dark -> light (sampled from IJA tunic photos, pushed toward PS1 saturation)
OLIVE = [np.array(c, float) for c in ((44, 46, 24), (78, 80, 40), (112, 112, 58), (146, 142, 82), (178, 172, 112))]
WEAR = [dict(fade=0.0, patches=0, holes=0), dict(fade=0.25, patches=9, holes=4), dict(fade=0.45, patches=20, holes=12),
        dict(fade=0.6, patches=30, holes=20)]          # w3 = 1974: bleached and patched all over (v3: clearer wear)
PATCH = [(96, 74, 46), (70, 86, 52), (128, 108, 70), (58, 60, 64), (150, 130, 92)]


def ramp(v):
    v = np.clip(v, 0, 1) * (len(OLIVE) - 1)
    i = np.clip(np.floor(v).astype(int), 0, len(OLIVE) - 2); t = (v - i)[..., None]
    return np.stack(OLIVE)[i] * (1 - t) + np.stack(OLIVE)[i + 1] * t


def soldier(a, w):
    a = a.astype(float).copy()
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    h, wd = r.shape
    yy, xx = np.mgrid[:h, :wd]
    face = (xx < 96) & (yy >= 64) & (yy < 128)                           # face block: the sweat drop stays blue
    blue = (b > r + 0.15 * 255) & (b > g + 0.08 * 255) & ~face
    lum = (0.25 * r + 0.35 * g + 0.4 * b) / 255
    lum = (lum - 0.12) / 0.75
    logo = (xx >= 64) & (xx < 128) & (yy < 60)                          # punkpoly patch on the back -> plain cloth
    lum = np.where(logo, 0.5 + 0.06 * rng.standard_normal(lum.shape), lum)
    blue |= logo
    col = ramp(lum)
    p = WEAR[w]
    col = col * (1 - p["fade"]) + np.array((196, 186, 140)) * p["fade"] * (0.6 + 0.4 * lum[..., None])
    for _ in range(p["patches"]):                                       # square cloth patches with a stitched rim
        while True:
            x0, y0 = rng.integers(0, wd - 14), rng.integers(0, h - 14); s = rng.integers(4 + w, 8 + 2 * w)
            if blue[y0:y0 + s, x0:x0 + s].all():
                break
        c = np.array(PATCH[rng.integers(len(PATCH))], float)
        col[y0:y0 + s, x0:x0 + s] = c * (0.9 + 0.2 * rng.random((s, s, 1)))
        col[y0, x0:x0 + s:2] = col[y0 + s - 1, x0:x0 + s:2] = (40, 34, 24)
        col[y0:y0 + s:2, x0] = col[y0:y0 + s:2, x0 + s - 1] = (40, 34, 24)
    for _ in range(p["holes"]):                                         # frayed tears: dark slit + light threads
        while True:
            x0, y0 = rng.integers(2, wd - 6), rng.integers(2, h - 4)
            if blue[y0:y0 + 2, x0:x0 + 5].all():
                break
        col[y0, x0:x0 + 5] = (26, 22, 16); col[y0 + 1, x0 + 1:x0 + 4:2] = (200, 190, 150)
    a[..., :3] = np.where(blue[..., None], col, a[..., :3])
    return a.clip(0, 255).astype(np.uint8)


for w in range(len(WEAR)):
    out = HERE / "soldier" / f"w{w}"; out.mkdir(parents=True, exist_ok=True)
    for f in sorted(FACES.glob("Kaneda_*.png")):
        rng = np.random.default_rng(3)                                  # same patches on every expression
        Image.fromarray(soldier(np.asarray(Image.open(f).convert("RGBA")), w)).save(out / f.name)
    print("wear", w, "->", out)
