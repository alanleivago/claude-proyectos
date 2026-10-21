# Align a pose pair from Flow (same raw canvas) and split each into a common part (_c) and the part that changes (_d),
# so the piece can swap a limb without ghosting the whole figure. Run with the VoxDoc venv python (PIL, scipy).
# usage: posepair.py <piece> <nameA> <rawA.jpg> <cutA.png> <nameB> <rawB.jpg> <cutB.png>
import sys, numpy as np
from PIL import Image
from scipy import ndimage
piece, a, ra, ca, b, rb, cb = sys.argv[1:8]
def onraw(rawjpg, cutpng):   # put the keyed cut-out back on the raw canvas (key.py crops it)
    r = np.asarray(Image.open(rawjpg).convert('RGB'), dtype=float)
    notmag = ndimage.binary_opening(~((r[..., 0] > 170) & (r[..., 2] > 170) & (r[..., 1] < 110)), iterations=2)
    ys, xs = np.where(notmag); C = np.asarray(Image.open(cutpng).convert('RGBA'), dtype=float); cam = C[..., 3] > 128
    best = None; x0, y0 = xs.min(), ys.min()
    for ox in range(max(0, x0 - 14), x0 + 3):
        for oy in range(max(0, y0 - 14), y0 + 3):
            h = min(cam.shape[0], r.shape[0] - oy); w = min(cam.shape[1], r.shape[1] - ox)
            e = (notmag[oy:oy + h, ox:ox + w] ^ cam[:h, :w]).mean()
            if best is None or e < best[0]: best = (e, ox, oy)
    _, ox, oy = best; cv = np.zeros((r.shape[0], r.shape[1], 4)); h = min(C.shape[0], r.shape[0] - oy); w = min(C.shape[1], r.shape[1] - ox)
    cv[oy:oy + h, ox:ox + w] = C[:h, :w]; return cv
A, Bm = onraw(ra, ca), onraw(rb, cb)
d = (np.abs(A[..., :3] - Bm[..., :3]).sum(-1) > 110) & ((A[..., 3] > 40) | (Bm[..., 3] > 40)) | (np.abs(A[..., 3] - Bm[..., 3]) > 110)
d = ndimage.binary_opening(d, iterations=3)
lab, n = ndimage.label(d); sizes = ndimage.sum(d, lab, range(1, n + 1)); keep = np.isin(lab, 1 + np.where(sizes > 500)[0])
m = ndimage.binary_dilation(keep, iterations=16).astype(float); m = np.clip(ndimage.gaussian_filter(m, 6) * 1.4, 0, 1)
al = np.maximum(A[..., 3], Bm[..., 3]) > 8; ys, xs = np.where(al); bb = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
W0, H0 = bb[2] - bb[0], bb[3] - bb[1]; s = min(1.0, 900 / max(W0, H0)); size = (round(W0 * s), round(H0 * s))
def out(X, nm): Image.fromarray(np.clip(X, 0, 255).astype('uint8'), 'RGBA').crop(bb).resize(size, Image.LANCZOS).save(f'{piece}/assets/{nm}.webp', quality=88, method=5)
for X, nm in ((A, a), (Bm, b)):
    out(X, nm); c = X.copy(); c[..., 3] *= (1 - m); out(c, nm + '_c'); e = X.copy(); e[..., 3] *= m; out(e, nm + '_d')
print(a, b, 'changed', round(float((m > 0.5).sum() / al.sum()), 3), '(> 0.2: the edit redrew the figure; regenerate with a smaller-change prompt)')
