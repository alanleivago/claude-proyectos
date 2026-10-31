# outline.py: a clean continuous white outline, 1 cell wide (4 px on the 480x268 grid), drawn around every character
# cut-out (assets/<n>_fg.png) from the mask's outer edge, replacing Flow's thin outline that the grid pass and the
# masks broke up. The ring sits on the fg layer (it moves with it). It is skipped on the frame border and where the
# background behind it is white (snow, sky: a white ring there reads as a bulge). Flow's leftover outline fragments
# on the inner edge (white edge cells with no white interior neighbour) take their dark neighbours' value.
import sys, numpy as np
from PIL import Image
from scipy import ndimage
D = '/Users/alanleiva/claude-proyectos/pieces/bells/'
NAMES = sys.argv[1:] or ['b02_plague', 'b02_war', 'b03_monks', 'b03_villagers', 'b04_died', 'b06_dogs', 'b07_window', 'b07_window_b', 'b09_sunrise',
         'b12_rope', 'b16_historians', 'b20_empty', 'b21_carry', 'b23_above', 'b25_rang', 'b27_monk', 'b28_town']
K4 = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], bool)
for n in NAMES:
    f = np.asarray(Image.open(D + f'assets/{n}_fg.png').convert('RGBA')).copy()
    bgn = 'b07_window' if n == 'b07_window_b' else n
    bg = np.asarray(Image.open(D + f'assets/{bgn}_bg.png').convert('L'))
    m = f[..., 3] > 0; L = f[..., 0].astype(int)
    # 1) Flow's broken outline fragments on the inner edge
    edge = m & ~ndimage.binary_erosion(m, K4)
    inner = m & ~edge
    P = np.pad(L, 1); Pi = np.pad(inner, 1)
    wn = np.zeros_like(L); dn = np.zeros_like(L); dv = np.zeros_like(L)
    for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)):
        nv = P[1 + dy:1 + dy + L.shape[0], 1 + dx:1 + dx + L.shape[1]]; ni = Pi[1 + dy:1 + dy + L.shape[0], 1 + dx:1 + dx + L.shape[1]]
        wn += ni & (nv == 253); dn += ni & (nv < 253); dv = np.maximum(dv, np.where(ni & (nv < 253), nv, 0))
    frag = edge & (L == 253) & (wn == 0) & (dn > 0)
    L[frag] = dv[frag]
    # 2) the new ring
    ring = ndimage.binary_dilation(m, K4) & ~m
    ring[0, :] = ring[-1, :] = ring[:, 0] = ring[:, -1] = False
    ring &= bg < 253
    f[..., 0] = f[..., 1] = f[..., 2] = np.where(ring, 253, L)
    f[ring, 3] = 255
    Image.fromarray(f).save(D + f'assets/{n}_fg.png'); print(n, 'fragments', int(frag.sum()), 'ring cells', int(ring.sum()))
