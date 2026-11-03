# Woven-in layers: key the raw Flow canvases (magenta), give them a thin cream thread outline, and press the
# background cloth's own weave into them so they read as part of the tapestry, not stickers on top.
# usage: python weave.py <ring_px> raw1.jpg out1.webp [raw2.jpg out2.webp ...]   (several pairs = one shared crop: pose pairs)
import sys, numpy as np
from PIL import Image
from scipy import ndimage
R = int(sys.argv[1]); pairs = list(zip(sys.argv[2::2], sys.argv[3::2]))
bg = np.asarray(Image.open('assets/bg.jpg').convert('L'), np.float32)[700:1300, 200:900]
wv = bg - ndimage.gaussian_filter(bg, 6); wv = wv / (np.abs(wv).mean() * 4)            # the weave, ~±0.25 around 0
col = np.array([244, 228, 186], np.float32)
def key(p):
    im = np.asarray(Image.open(p).convert('RGB'), np.float32)
    mg = np.minimum(im[..., 0], im[..., 2]) - im[..., 1]
    a = np.clip((70 - mg) / 45, 0, 1)
    lab, n = ndimage.label(a > 0.5); s = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
    a = a * ndimage.binary_dilation(np.isin(lab, [i + 1 for i, v in enumerate(s) if v > 400]), iterations=2)
    rgb = im.copy(); g = im[..., 1]; m = a < 0.98
    rgb[..., 0][m] = np.minimum(im[..., 0], g + 60)[m]; rgb[..., 2][m] = np.minimum(im[..., 2], g + 40)[m]   # despill the fringe
    d = ndimage.distance_transform_edt(a < 0.5); ring = np.clip(R + 0.8 - d, 0, 1) * 0.85
    A = np.maximum(a, ring); out = (rgb * a[..., None] + col * (ring * (1 - a))[..., None]) / np.maximum(A, 1e-4)[..., None]
    h, w = A.shape; ty = np.tile(wv, (h // wv.shape[0] + 1, w // wv.shape[1] + 1))[:h, :w]
    out = out * (1 + 0.55 * ty[..., None])                                                   # the cloth's threads run through the figure
    L = out.mean(-1, keepdims=True); out = L + (out - L) * 1.18                                # a touch more colour so figures read
    return np.dstack([out, A * 255]).clip(0, 255).astype(np.uint8)
ims = [key(r) for r, _ in pairs]
al = np.zeros(ims[0].shape[:2], bool)
for im in ims: al |= im[..., 3] > 8
ys, xs = np.nonzero(al); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
for im, (_, o) in zip(ims, pairs): Image.fromarray(im[y0:y1, x0:x1]).save(o, quality=92); print(o, x1 - x0, y1 - y0)
