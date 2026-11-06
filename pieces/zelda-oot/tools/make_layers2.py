# round 2 layers: thematic band tiles (cropped to one period, scaled to BAND_H), the green-sky Hyrule set, the woven scroll split
# into left roll / cloth / right roll (cloth widened by repeating a middle slice of its vine border).
# usage (from pieces/zelda-oot): ../../.venv/bin/python tools/make_layers2.py
import numpy as np
from PIL import Image
from scipy import ndimage
BAND_H = 136
def band(src, box, dst, sat=0.95):
    im = Image.open(src).convert('RGB').crop(box); w = round(im.width * BAND_H / im.height)
    a = np.asarray(im.resize((w, BAND_H), Image.LANCZOS), np.float32); L = a.mean(-1, keepdims=True); a = L + (a - L) * sat
    Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(dst, quality=93); print(dst, w)
band('gen/band_prologue.jpg', (85, 30, 1285, 735), 'assets/band_prologue.jpg')
band('gen/band_desert.jpg', (10, 118, 790, 662), 'assets/band_desert.jpg')
band('../zelda-fairy/gen4/band_tile.jpg', (0, 0, 1080, 223), 'assets/band_forest.jpg', 0.88)
# Hyrule with the pale sage sky
im = Image.open('gen/hyrule_green.jpg').convert('RGB').resize((1920, 1072), Image.LANCZOS); a = np.asarray(im, np.float32)[124:948]
L = a.mean(-1, keepdims=True); a = (L + (a - L) * 0.95) * np.array([1.02, 1.0, 0.95])
Image.fromarray(a.clip(0, 255).astype(np.uint8)).save('assets/hyrule.jpg', quality=92)
# the scroll: key the magenta, then split and widen
s = np.asarray(Image.open('gen/scroll.jpg').convert('RGB'), np.float32)
mg = np.minimum(s[..., 0], s[..., 2]) - s[..., 1]; al = np.clip((70 - mg) / 45, 0, 1)
lab, n = ndimage.label(al > 0.5); sz = ndimage.sum(np.ones_like(al), lab, range(1, n + 1)); al = al * ndimage.binary_dilation(np.isin(lab, [i + 1 for i, v in enumerate(sz) if v > 400]), iterations=2)
rgb = s.copy(); g = s[..., 1]; m = al < 0.98; rgb[..., 0][m] = np.minimum(s[..., 0], g + 60)[m]; rgb[..., 2][m] = np.minimum(s[..., 2], g + 40)[m]
img = np.dstack([rgb, al * 255]).clip(0, 255).astype(np.uint8)
ys = np.nonzero(al.max(1) > 0.1)[0]; img = img[ys.min():ys.max() + 1]
Lr, Rr = 150, 1228                                    # roll / cloth seams
left, right, cloth = img[:, :Lr], img[:, Rr:], img[:, Lr:Rr]
mid = cloth[:, 420:660]                               # a slice of plain centre + vine border, repeated to widen the cloth
def join(a, b, o=40):    # overlap-blend two RGBA strips over o columns so the repeats leave no seam
    w = np.linspace(0, 1, o)[None, :, None]; a = a.astype(np.float32); b = b.astype(np.float32)
    return np.concatenate([a[:, :-o], a[:, -o:] * (1 - w) + b[:, :o] * w, b[:, o:]], 1).clip(0, 255).astype(np.uint8)
cl = cloth[:, :560]
for _ in range(9): cl = join(cl, cloth[:, 400:680])
cl = join(cl, cloth[:, 520:])
for nme, part in (('scroll_l', left), ('scroll_r', right), ('scroll_m', cl)): Image.fromarray(part).save(f'assets/{nme}.webp', quality=92); print(nme, part.shape)
