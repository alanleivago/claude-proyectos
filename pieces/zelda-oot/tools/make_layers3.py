# round 3: warm thematic bands (thinner), and the sets cut into separate woven layers (Flow "keep only X on magenta" edits of
# the same set, so every piece lands where it was) for parallax and sway. Prints each layer's box in field coords (x, y, w, h).
# usage (from pieces/zelda-oot): ../../.venv/bin/python tools/make_layers3.py
import numpy as np
from PIL import Image
from scipy import ndimage
BAND_H = 112
def band(src, box, dst, lift=None):
    im = Image.open(src).convert('RGB').crop(box); w = round(im.width * BAND_H / im.height)
    a = np.asarray(im.resize((w, BAND_H), Image.LANCZOS), np.float32)
    if lift: a = 255 * (a / 255) ** lift[0] * np.array(lift[1])
    Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(dst, quality=93); print(dst, w)
band('gen/band_prologue_warm.jpg', (85, 30, 1285, 735), 'assets/band_prologue.jpg')
band('gen/band_desert_warm.jpg', (10, 118, 790, 662), 'assets/band_desert.jpg', (0.72, (1.12, 0.98, 0.86)))
band('../zelda-fairy/gen4/band_tile.jpg', (0, 0, 1080, 223), 'assets/band_forest.jpg')
def field(src):   # a 16:9 Flow image -> field coords (1920 x 824), like the sets
    return np.asarray(Image.open(src).convert('RGB').resize((1920, 1072), Image.LANCZOS), np.float32)[124:948]
def grade(a, sat=0.95, warm=(1.02, 1.0, 0.95)):
    L = a.mean(-1, keepdims=True); return (L + (a - L) * sat) * np.array(warm)
def save_plate(a, dst): Image.fromarray(grade(a).clip(0, 255).astype(np.uint8)).save(dst, quality=92); print(dst)
def key(src, dst, mask=None, split=None, gain=1.0):
    s = field(src); mg = np.minimum(s[..., 0], s[..., 2]) - s[..., 1]; al = np.clip((60 - mg) / 40, 0, 1)
    lab, n = ndimage.label(al > 0.5); sz = ndimage.sum(np.ones_like(al), lab, range(1, n + 1))
    al = al * ndimage.binary_dilation(np.isin(lab, [i + 1 for i, v in enumerate(sz) if v > 300]), iterations=2)
    g = s[..., 1]; m = al < 0.98; s[..., 0][m] = np.minimum(s[..., 0], g + 50)[m]; s[..., 2][m] = np.minimum(s[..., 2], g + 30)[m]
    al = ndimage.minimum_filter(al, 3)                                     # eat the 1px magenta fringe
    fr = (al > 0) & (al < 0.999)                                          # fringe pixels take the colour of the solid inside
    solid = al > 0.999; idx = ndimage.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    s[fr] = s[idx[0][fr], idx[1][fr]]
    if mask is not None: al = al * mask
    rgb = grade(s) * gain
    parts = [(dst, al)] if not split else [(d, al * (np.arange(1920)[None, :] < 960 if k == 0 else np.arange(1920)[None, :] >= 960)) for k, d in enumerate(split)]
    for d, A in parts:
        ys, xs = np.nonzero(A > 0.04); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        Image.fromarray(np.dstack([rgb, A * 255]).clip(0, 255).astype(np.uint8)[y0:y1, x0:x1]).save(d, quality=90)
        print(d, 'box', x0, y0, x1 - x0, y1 - y0)
L = 'gen/layers/'
# Hyrule
hp = field(L + 'hy_plate.jpg'); save_plate(hp, 'assets/hy_plate.jpg')
sky = (hp.std(-1) < 22) & (hp.mean(-1) > 150)                          # the pale sage sky of the plate
sky = ndimage.binary_opening(sky, iterations=2); skym = ndimage.gaussian_filter(sky.astype(np.float32), 2)
key(L + 'hy_volcano.jpg', 'assets/hy_volcano.webp', mask=np.clip(skym * 1.6, 0, 1))   # the volcano stays behind the hills
key(L + 'hy_ring.jpg', 'assets/hy_ring.webp')
key(L + 'hy_castle.jpg', 'assets/hy_castle.webp')
key(L + 'hy_trees.jpg', None, split=['assets/hy_tree_l.webp', 'assets/hy_tree_r.webp'])
# desert
save_plate(field(L + 'de_plate.jpg') * 0.97, 'assets/de_plate.jpg')
for n in ('sun', 'fort', 'palms', 'cacti'): key(L + f'de_{n}.jpg', f'assets/de_{n}.webp')
# prologue roots: the branches alone + a plain woven green plate built from the open middle of the roots cloth
key(L + 'ro_branches.jpg', 'assets/ro_branches.webp', gain=1.45)
r = np.asarray(Image.open('assets/roots.jpg').convert('RGB'), np.float32); patch = r[330:780, 620:1160]
pl = np.concatenate([patch, patch[:, ::-1]] * 2, 1); pl = np.concatenate([pl, pl[::-1]], 0)[:824, :1920]
save_plate(pl / np.array([1.02, 1.0, 0.95]), 'assets/ro_plate.jpg')
