"""raw_<expr>.png (transparent) -> avatar_<expr>.png 1024 px: pixel fire behind, PS1/CRT softness + scanlines like the LPS avatar.
python post_avatar.py <expr>"""
import sys
import numpy as np
from PIL import Image, ImageFilter

expr = sys.argv[1] if len(sys.argv) > 1 else "neutral"
rng = np.random.default_rng(7)
N = 48


def noise(n, oct=5):
    acc = np.zeros((n, n))
    for o in range(oct):
        s = 4 * 2 ** o
        g = rng.random((s + 1, s + 1))
        acc += np.array(Image.fromarray((g * 255).astype(np.uint8)).resize((n, n), Image.BICUBIC), float) / 255 / 2 ** o
    return acc / acc.max()


f = noise(N)
y = np.linspace(0, 1, N)[:, None]
heat = np.clip(f * 1.7 + 0.55 * y - 0.6, 0, 1)                      # hotter toward the bottom, dark smoke at the top
stops = np.array([[10, 4, 2], [90, 14, 4], [190, 50, 8], [240, 110, 20], [255, 170, 60]], float)
idx = heat * (len(stops) - 1); i0 = np.floor(idx).astype(int).clip(0, len(stops) - 2); t = (idx - i0)[..., None]
fire = (stops[i0] * (1 - t) + stops[i0 + 1] * t).astype(np.uint8)
bg = Image.fromarray(fire).resize((512, 512), Image.NEAREST).convert("RGBA")

fg = Image.open(f"raw_{expr}.png").convert("RGBA")
img = Image.alpha_composite(bg, fg).convert("RGB")
img = img.resize((256, 256), Image.BILINEAR).resize((1024, 1024), Image.NEAREST).filter(ImageFilter.GaussianBlur(1.2))
a = np.array(img, float)
a[1::4] *= 0.86; a[2::4] *= 0.93                                       # CRT scanlines
a[..., 0] = np.roll(a[..., 0], 2, axis=1); a[..., 2] = np.roll(a[..., 2], -2, axis=1)   # slight chroma bleed
Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(f"avatar_{expr}.png")
print("avatar", expr)
