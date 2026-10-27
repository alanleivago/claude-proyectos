"""Layer compositing for NETO's 256px texture: base (values) + color (Color blend) + multiply + highlights."""
import numpy as np
from PIL import Image

LAY = r"F:\Claude Proyectos\assets\neto512\layers"


def load(name):
    return np.asarray(Image.open(f"{LAY}\\{name}.png").convert("RGBA"), np.float32) / 255


def lum(c):
    return c[..., 0] * 0.3 + c[..., 1] * 0.59 + c[..., 2] * 0.11


def set_lum(c, l):   # W3C/Photoshop SetLum + ClipColor
    d = (l - lum(c))[..., None]
    c = c + d
    L = lum(c)[..., None]
    n = c.min(-1, keepdims=True); x = c.max(-1, keepdims=True)
    c = np.where(n < 0, L + (c - L) * L / np.maximum(L - n, 1e-6), c)
    c = np.where(x > 1, L + (c - L) * (1 - L) / np.maximum(x - L, 1e-6), c)
    return c


def over(dst, src_rgb, a):
    return dst * (1 - a[..., None]) + src_rgb * a[..., None]


def compose(color, base=None, flowers=None, mult=None, high=None, tint=False):
    """tint=False: Color blend (Krita/PS). tint=True: colour x base value normalised to the lit tone (keeps dark colours dark)."""
    base = load("base") if base is None else base
    out = base[..., :3].copy()
    if tint:
        shade = np.clip(lum(out) / 0.86, 0.3, 1.1)[..., None]
        out = over(out, color[..., :3] * shade, color[..., 3])
    else:
        out = over(out, set_lum(color[..., :3], lum(out)), color[..., 3])
    if flowers is not None:
        out = over(out, flowers[..., :3], flowers[..., 3])
    mult = load("multiply") if mult is None else mult
    out = over(out, out * mult[..., :3], mult[..., 3])
    high = load("highlights") if high is None else high
    out = over(out, 1 - (1 - out) * (1 - high[..., :3]), high[..., 3])   # screen
    a = np.maximum(base[..., 3], color[..., 3])
    return np.dstack([np.clip(out, 0, 1), a])


if __name__ == "__main__":
    ref = np.asarray(Image.open(r"F:\Claude Proyectos\assets\neto512\exported-textures\neto256.png").convert("RGBA"), np.float32) / 255
    mine = compose(load("color"), flowers=load("flowers"))
    m = ref[..., 3] > 0.5
    print("mean abs diff vs neto256.png:", float(np.abs(mine[..., :3] - ref[..., :3])[m].mean()))
    Image.fromarray((np.hstack([mine, ref]) * 255).astype(np.uint8)).resize((1024, 512), Image.NEAREST).save("work/compose_check.png")
