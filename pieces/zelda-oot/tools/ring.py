# crop a keyed layer to its alpha, add a cream stitched ring so it pops off the green cloth, save webp in assets/
# usage: python ring.py cut/x.png assets/x.webp [ring_px]
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src, dst = sys.argv[1], sys.argv[2]; R = int(sys.argv[3]) if len(sys.argv) > 3 else 7
im = np.array(Image.open(src).convert('RGBA')).astype(np.float32)
a = im[..., 3] / 255
lab, n = ndimage.label(a > 0.5); sizes = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 400])        # drop key specks
a = a * ndimage.binary_dilation(keep, iterations=2)
pad = R + 4; a = np.pad(a, pad); rgb = np.pad(im[..., :3], ((pad, pad), (pad, pad), (0, 0)))
ys, xs = np.nonzero(a > 0.05)
d = ndimage.distance_transform_edt(a < 0.5)
ring = np.clip((R + 0.8 - d), 0, 1)                                           # soft ring of R px
col = np.array([246, 232, 192], np.float32)
outA = np.maximum(a, ring)
out = (rgb * a[..., None] + col * (ring * (1 - a))[..., None]) / np.maximum(outA, 1e-4)[..., None]
img = np.dstack([out, outA * 255]).clip(0, 255).astype(np.uint8)
y0, y1, x0, x1 = ys.min() - R - 2, ys.max() + R + 3, xs.min() - R - 2, xs.max() + R + 3
Image.fromarray(img[y0:y1, x0:x1]).save(dst, quality=92)
print(dst, x1 - x0, y1 - y0)
