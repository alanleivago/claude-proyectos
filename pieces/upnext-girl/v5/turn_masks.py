import numpy as np, glob, sys
from PIL import Image
from scipy import ndimage as nd
D = "/Users/alanleiva/claude-proyectos/fuentes/mml2-girl-tutorial/frames/turn5/"


def gmask(a, x0=600, x1=1350):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = (r - b > 12) | (g - b > 15) | (r + g + b > 330) | (r - g > 10)
    m[:, :x0] = False; m[:, x1:] = False; m[:60] = False
    m = nd.binary_opening(m, iterations=1)
    lab, n = nd.label(m); sz = nd.sum(m, lab, range(1, n + 1))
    m = lab == (np.argmax(sz) + 1)
    return nd.binary_fill_holes(nd.binary_closing(m, iterations=3))


fs = sorted(glob.glob(D + "t*.png"))
M = []
for f in fs:
    a = np.asarray(Image.open(f).convert("RGB")).astype(int); M.append(gmask(a))
M = np.array(M); np.save("turn5_masks.npy", np.packbits(M, axis=-1)); print(M.shape)
n = len(M); S = np.zeros((n, n))
small = M[:, ::4, ::4]
for i in range(n):
    for j in range(n):
        S[i, j] = (small[i] & small[j]).sum() / max(1, (small[i] | small[j]).sum())
np.save("turn5_sim.npy", S)
for lag in range(30, 70):
    print(lag, round(float(np.mean([S[i, i + lag] for i in range(n - lag)])), 4))
