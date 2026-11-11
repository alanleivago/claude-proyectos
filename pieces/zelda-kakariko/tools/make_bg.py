# Night version of the zelda-fairy frame: the green field becomes a dark indigo/plum wool (same weave, warm centre),
# and the top/bottom bands become the Kakariko/Shadow frieze (eyes, harps, windmills, moons, wrapped dead) from zelda-oot.
# usage (from pieces/zelda-kakariko): ../../.venv/bin/python tools/make_bg.py
import numpy as np
from PIL import Image
from scipy import ndimage
src = np.asarray(Image.open('../zelda-fairy/assets/bg.jpg').convert('RGB'), np.float32)
H, W = src.shape[:2]
# the weave and mottling come from a clean patch of the old field only, mirrored and tiled, so no trace of the old
# frieze bands or leaves survives anywhere (the 'double meander' ghost)
P = src.mean(-1)[700:1212, 200:712]; P = np.concatenate([P, P[:, ::-1]], 1); P = np.concatenate([P, P[::-1]], 0)
L = np.tile(P, (H // P.shape[0] + 1, W // P.shape[1] + 1))[:H, :W]
wv = L - ndimage.gaussian_filter(L, 5); wv /= np.abs(wv).mean() * 5      # the weave, ~±0.2
lo = ndimage.gaussian_filter(L, 60); lo = (lo - lo.mean()) / (lo.std() * 6)               # the big mottling of the cloth
yy, xx = np.mgrid[0:H, 0:W]
top = np.array([42, 33, 58], np.float32); bot = np.array([54, 36, 44], np.float32); warm = np.array([112, 76, 80], np.float32)
v = (yy / H)[..., None]; base = top * (1 - v) + bot * v
d = np.sqrt(((xx - 540) / 620) ** 2 + ((yy - 1000) / 900) ** 2)[..., None]
base = base + (warm - base) * np.clip(1 - d, 0, 1) ** 1.6 * 0.55
out = base * (1 + wv[..., None] + lo[..., None])
# bands: one period of the frieze (1080 px in the source), scaled to the fairy band height, tiled
B = Image.open('../zelda-oot/gen/bands/shadow.jpg').convert('RGB')
per = B.crop((20, 30, 1100, 738)); bh = 150; bw = round(per.width * bh / per.height)
tile = np.asarray(per.resize((bw, bh), Image.LANCZOS), np.float32) * 0.92
row = np.tile(tile, (1, W // bw + 2, 1))[:, :W]
for y0 in (21, 1749): out[y0:y0 + bh] = row
# a dark stitched rule just outside each band
for y in (19, 20, 171, 172, 1747, 1748, 1899, 1900): out[y] = out[y] * 0.45
Image.fromarray(out.clip(0, 255).astype(np.uint8)).save('assets/bg.jpg', quality=92)
print('assets/bg.jpg', bw)
