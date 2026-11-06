# The 16:9 hanging cloth: a warp/weft woven field (warmer, more muted than zelda-fairy's green), the v4 figured
# frieze as top and bottom bands, and a seamless weave tile (assets/weave.png) laid over the whole frame at render time.
# usage (from pieces/zelda-oot): ../../.venv/bin/python tools/make_bg.py
import numpy as np
from PIL import Image
from scipy import ndimage
W, H = 1920, 1080
BAND_H = 128                     # each band's height on screen
rng = np.random.default_rng(7)

def weave(h, w, p=4, seed=1):
    """Woven grain, values ~0 mean, ±1: over/under checker, per-thread tone, slubs, fibre noise. Seamless if w, h % p == 0."""
    r = np.random.default_rng(seed)
    nx, ny = w // p, h // p
    warp_tone = r.normal(0, 1, nx); weft_tone = r.normal(0, 1, ny)
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = xx // p, yy // p
    over = (cx + cy) % 2 == 0                                  # which thread is on top
    fx, fy = (xx % p) / p, (yy % p) / p
    # each visible thread is rounded: bright in its middle, dark at its edges
    warp_shape = np.sin(np.pi * (fx + 0.5 / p)) ; weft_shape = np.sin(np.pi * (fy + 0.5 / p))
    # slubs: slow thickness changes along each thread (periodic so the tile wraps)
    k = 2 * np.pi
    slub_warp = 0.5 * np.sin(k * (yy / h) * r.integers(2, 6, nx)[cx] + r.uniform(0, k, nx)[cx])
    slub_weft = 0.5 * np.sin(k * (xx / w) * r.integers(2, 6, ny)[cy] + r.uniform(0, k, ny)[cy])
    v = np.where(over, 0.6 * warp_shape + 0.10 * warp_tone[cx] + 0.3 * slub_warp, 1.0 * weft_shape + 0.14 * weft_tone[cy] + 0.4 * slub_weft)
    v = v + 0.25 * r.normal(0, 1, (h, w))
    return (v - v.mean()) / (v.std() * 2.2)

# --- the field
field = np.zeros((H, W, 3), np.float32) + np.array([126, 131, 64], np.float32)
low = ndimage.gaussian_filter(rng.normal(0, 1, (H // 8, W // 8)), 6); low = np.kron(low / low.std(), np.ones((8, 8)))[:H, :W]
field *= (1 + 0.05 * low)[..., None]                                        # a little dye unevenness
g = weave(H, W, 4, 3); field *= (1 + 0.22 * g)[..., None]
# soft vertical folds of a hanging cloth
xs = np.arange(W); fold = 0.045 * np.sin(xs / W * 2 * np.pi * 3.2 + 0.6) + 0.025 * np.sin(xs / W * 2 * np.pi * 7.1 + 2)
field *= (1 + fold)[None, :, None]
# --- bands: the v4 figured frieze, warmed and muted a touch, tiled
tile = Image.open('../zelda-fairy/gen4/band_tile.jpg').convert('RGB')
tw = round(tile.width * BAND_H / tile.height); tile = np.asarray(tile.resize((tw, BAND_H), Image.LANCZOS), np.float32)
L = tile.mean(-1, keepdims=True); tile = L + (tile - L) * 0.86; tile *= np.array([1.03, 0.99, 0.93])
band = np.tile(tile, (1, W // tw + 2, 1))[:, :W]
bw = weave(BAND_H, W, 4, 5); band *= (1 + 0.16 * bw)[..., None]
img = field.copy()
img[0:BAND_H] = band
img[H - BAND_H:H] = band[::-1, ::-1] if False else band
# a dark rust seam where the bands are sewn on
for y0 in (BAND_H, H - BAND_H):
    for d in range(-3, 4):
        y = y0 + d
        if 0 <= y < H: img[y] *= 0.62 + 0.06 * abs(d)
img = img.clip(0, 255).astype(np.uint8)
Image.fromarray(img).save('assets/bg.jpg', quality=93)
# --- the weave overlay tile (grey 128 = no change), applied in soft-light over everything
t = weave(512, 512, 4, 9); t = (128 + 70 * t).clip(0, 255).astype(np.uint8)
Image.fromarray(t, 'L').convert('RGB').save('assets/weave.png')
print('bg.jpg + weave.png')
