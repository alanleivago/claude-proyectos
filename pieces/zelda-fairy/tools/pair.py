# key a pose pair straight off the raw Flow canvases (same canvas), ring both, crop both with one shared box
# usage: python pair.py raw_a.jpg raw_b.jpg assets/a.webp assets/b.webp [ring_px]
import sys, numpy as np
from PIL import Image
from scipy import ndimage
ra, rb, da, db = sys.argv[1:5]; R = int(sys.argv[5]) if len(sys.argv) > 5 else 6
col = np.array([246, 232, 192], np.float32)
def key(p):
    im = np.asarray(Image.open(p).convert('RGB'), np.float32)
    mg = np.minimum(im[..., 0], im[..., 2]) - im[..., 1]
    a = np.clip((40 - mg) / 55, 0, 1)
    lab, n = ndimage.label(a > 0.5); s = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
    a = a * ndimage.binary_dilation(np.isin(lab, [i + 1 for i, v in enumerate(s) if v > 400]), iterations=2)
    sp = (1 - a)[..., None]; rgb = im.copy(); g = im[..., 1:2]; rgb[..., 0:1] = np.minimum(im[..., 0:1], g + 40 * (1 - sp) + 255 * 0) ; rgb[..., 2:3] = np.minimum(im[..., 2:3], g + 40)   # despill
    rgb = np.where(a[..., None] > 0.98, im, rgb)
    d = ndimage.distance_transform_edt(a < 0.5); ring = np.clip(R + 0.8 - d, 0, 1)
    A = np.maximum(a, ring); out = (rgb * a[..., None] + col * (ring * (1 - a))[..., None]) / np.maximum(A, 1e-4)[..., None]
    return np.dstack([out, A * 255]).clip(0, 255).astype(np.uint8)
A, B = key(ra), key(rb)
al = (A[..., 3] > 8) | (B[..., 3] > 8); ys, xs = np.nonzero(al)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
for im, d in ((A, da), (B, db)): Image.fromarray(im[y0:y1, x0:x1]).save(d, quality=92); print(d, x1 - x0, y1 - y0)
