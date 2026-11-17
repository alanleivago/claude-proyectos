"""Class-map repair in the head rows: lashes/pupils/brows (dark, read as boots/leggings or bg holes) are face -> skin."""
import numpy as np
d = np.load("ref/masks.npz"); MS = np.unpackbits(d["m"], axis=-1)[..., :1080].astype(bool)
import os
src = "ref/cls_orig.npz" if os.path.exists("ref/cls_orig.npz") else "ref/cls.npz"
C = np.load(src)["c"]
from PIL import Image
n0 = 0
for k in range(250):
    c = C[k]; top = np.zeros(c.shape, bool); top[:520] = True
    im = np.asarray(Image.open(f'ref/frames/f{k + 1:03d}.png').convert('RGB')).astype(float)
    dark = (im @ [0.3, 0.59, 0.11]) < 95
    bad = top & MS[k] & (np.isin(c, (0, 4, 5, 6)) | ((c == 2) & dark))
    n0 += bad.sum(); c[bad] = 1
np.savez_compressed("ref/cls.npz", c=C); print("repaired px", n0)
