"""Silhouette masks of his 250 frames (cream bg 235,221,199) -> ref/masks.npz (bool, full res)."""
import numpy as np, glob
from PIL import Image
from scipy import ndimage as nd
BG = np.array([235, 221, 199])
fs = sorted(glob.glob("ref/frames/f*.png")); M = []
for f in fs:
    im = np.asarray(Image.open(f).convert("RGB")).astype(int)
    d = np.abs(im - BG).sum(-1)
    m = d > 30
    m = nd.binary_opening(m, iterations=1)
    lab, n = nd.label(m); sz = nd.sum(m, lab, range(1, n + 1))
    keep = np.zeros(n + 1, bool); keep[1:] = sz > 200
    m = keep[lab]
    hl, hn = nd.label(~m); hs = np.bincount(hl.ravel()); small = hs < 400; small[0] = False
    small[hl[0, 0]] = False; m = m | small[hl]
    M.append(m)
M = np.array(M); np.savez_compressed("ref/masks.npz", m=np.packbits(M, axis=-1), shape=M.shape)
print(M.shape, M.sum((1, 2))[:10])
ys, xs = np.nonzero(M.any(0)); print("bbox all", ys.min(), ys.max(), xs.min(), xs.max())
for k in (0, 60, 120, 180):
    ys, xs = np.nonzero(M[k]); print(k, ys.min(), ys.max(), xs.min(), xs.max())
