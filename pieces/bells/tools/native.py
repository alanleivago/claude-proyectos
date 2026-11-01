# native.py <in> <out.png> <flat|check>: recovers the native pixel grid of a Flow pixel-art image (~134x240 for a
# 768x1376 render), samples each native pixel at its centre, and maps it to the onebit palette there:
#   flat4 = black / dark grey 56 / grey / white (bells);
#   flat  = black / grey #8e8e8e / white;   check = black / a checkerboard of native pixels for grey / white.
# Keyed layers (RGBA) keep their alpha per native pixel and get a 1-pixel white outline (the World of Horror rim).
# Re-pixelating on a grid that doesn't match the source's breaks every line into uneven steps; this keeps them whole.
import sys
import numpy as np
from PIL import Image

src, dst, mode = sys.argv[1], sys.argv[2], sys.argv[3]
P0 = float(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4][0] != '-' else 0   # optional: the known pixel period (when the search locks onto a wrong one)
im = Image.open(src); has_a = im.mode == 'RGBA'
rgba = np.asarray(im.convert('RGBA')).astype(np.float32)
L = (0.299 * rgba[..., 0] + 0.587 * rgba[..., 1] + 0.114 * rgba[..., 2]) / 255
A = rgba[..., 3] / 255

def grid(edge, n):
    """period and phase of the pixel grid along one axis, from the edge energy profile"""
    best = (-1, 0, 0)
    for p in (np.arange(P0 - 0.03, P0 + 0.03, 0.005) if P0 else np.arange(5.4, 6.2, 0.005)):
        for ph in np.arange(0, p, 0.25):
            idx = np.round(ph + np.arange(0, n / p) * p).astype(int); idx = idx[idx < len(edge)]
            s = edge[idx].mean()
            if s > best[0]: best = (s, p, ph)
    return best[1], best[2]

ex = np.abs(np.diff(L, axis=1)).mean(0); ey = np.abs(np.diff(L, axis=0)).mean(1)
px, phx = grid(np.append(ex, 0), L.shape[1]); py, phy = grid(np.append(ey, 0), L.shape[0])
# cell k spans [ph + (k-1) p, ph + k p): sample a small block at its centre (median resists JPEG ringing)
cx = phx - px / 2 + px * np.arange(int((L.shape[1] - phx) / px) + 2); cx = cx[(cx >= 0) & (cx < L.shape[1])]
cy = phy - py / 2 + py * np.arange(int((L.shape[0] - phy) / py) + 2); cy = cy[(cy >= 0) & (cy < L.shape[0])]
def sample(M):
    out = np.zeros((len(cy), len(cx)), np.float32)
    for j, y in enumerate(cy):
        y0, y1 = int(max(0, y - 1)), int(min(M.shape[0], y + 2))
        for i, x in enumerate(cx):
            x0, x1 = int(max(0, x - 1)), int(min(M.shape[1], x + 2))
            out[j, i] = np.median(M[y0:y1, x0:x1])
    return out
v, a = sample(L), sample(A) > 0.5
h, w = v.shape
yy, xx = np.mgrid[0:h, 0:w]
if mode == 'check':
    lv = np.where(v < 0.3, 0, np.where(v < 0.72, np.where((xx + yy) % 2 == 0, 253, 0), 253))
elif mode == 'flat4':   # bells: a dark grey step too, so the mountains, forest and stone walls stay readable
    lv = np.where(v < 0.13, 0, np.where(v < 0.33, 56, np.where(v < 0.72, 142, 253)))
else:
    lv = np.where(v < 0.3, 0, np.where(v < 0.72, 142, 253))
lv = lv.astype(np.uint8)
rgb = np.dstack([lv, lv, lv])
RIM = '--norim' not in sys.argv
if has_a and RIM:
    # a 1-pixel white outline outside the figure
    pad = np.pad(a, 1); ring = np.zeros_like(a)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            ring |= pad[1 + dy:1 + dy + h, 1 + dx:1 + dx + w]
    ring &= ~a
    rgb[ring] = 253
    alpha = ((a | ring) * 255).astype(np.uint8)
elif has_a:
    alpha = (a * 255).astype(np.uint8)   # no code rim: Flow's own thin outline is the subtle one (user)
else:
    alpha = np.full((h, w), 255, np.uint8)
Image.fromarray(np.dstack([rgb, alpha]), 'RGBA').save(dst)
print(dst, f'{w}x{h}', f'pixel {px:.3f}x{py:.3f}', mode)
