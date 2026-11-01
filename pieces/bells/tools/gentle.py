# gentle.py: the character shots on a FINER grid than native.py (480x268 = 4 screen px a cell instead of 8), so faces and
# expressions read (user: the coarse pass made faces unreadable). From the Flow original: luma box-sampled per cell,
# ink lines protected with a per-cell minimum (thin dark lines never average away), a slight gamma (1.2), lit skin kept
# the approved FLAT tones (flat4: black, dark grey, mid grey, white; no dither anywhere, user).
# Then the per-image fixes that prep.py made on the coarse layers are re-applied at this scale.
import sys, numpy as np
from PIL import Image
from scipy import ndimage
D = '/Users/alanleiva/claude-proyectos/pieces/bells/'
GW, GH = 480, 268
NAMES = ['b02_plague', 'b02_war', 'b03_monks', 'b03_villagers', 'b04_died', 'b06_dogs', 'b07_window', 'b07_window_b', 'b09_sunrise',
         'b12_rope', 'b16_historians', 'b20_empty', 'b21_carry', 'b22_hands', 'b23_above', 'b25_rang', 'b27_monk', 'b28_town']
def gentle(src, ink=0.16, levels=(0.13, 0.33, 0.72)):
    """flat4 tones (black / 56 / 142 / 253, flat areas, NO dither) on the finer grid; a cell whose darkest pixel is ink
    (a line) and whose mean is mid-light goes black, so thin lines on faces and hands survive"""
    im = Image.open(src).convert('L'); W0, H0 = im.size
    a = np.asarray(im).astype(float) / 255
    ys = (np.arange(GH + 1) * H0 / GH).astype(int); xs = (np.arange(GW + 1) * W0 / GW).astype(int)
    # the cell value: the median of its centre (as native.py samples), so JPEG ringing and hatching don't grey it out
    L = np.zeros((GH, GW))
    for j in range(GH):
        y0, y1 = ys[j], ys[j + 1]; yc0, yc1 = y0 + (y1 - y0) // 4, y1 - (y1 - y0) // 4
        row = a[yc0:max(yc0 + 1, yc1)]
        for i in range(GW):
            x0, x1 = xs[i], xs[i + 1]; L[j, i] = np.median(row[:, x0 + (x1 - x0) // 4:max(x0 + (x1 - x0) // 4 + 1, x1 - (x1 - x0) // 4)])
    mn = np.minimum.reduceat(np.minimum.reduceat(a, ys[:-1], axis=0), xs[:-1], axis=1)
    out = np.where(L < levels[0], 0, np.where(L < levels[1], 56, np.where(L < levels[2], 142, 253)))
    line = (mn < ink) & (L >= levels[1]) & (L < 0.9)
    lab, k = ndimage.label(line)   # only thin strokes: blobs of line cells wider than 3 cells in both directions are tone, not line
    if k:
        sl = ndimage.find_objects(lab); keep = np.zeros(k + 1, bool)
        for q, s_ in enumerate(sl): keep[q + 1] = min(s_[0].stop - s_[0].start, s_[1].stop - s_[1].start) <= 3 or (line[s_].mean() < 0.35)
        line = keep[lab] & line
    out[line] = 0
    return out.astype(np.uint8)
for n in (sys.argv[1:] or NAMES):
    v = gentle(D + f'gen/{n}.jpg')
    if n == 'b22_hands': v = gentle(D + f'gen/{n}.jpg', levels=(0.10, 0.20, 0.45))   # its greys sit low (wall black, sleeves dark grey, hands light)
    if n == 'b27_monk':   # the gibberish sign -> flat grey (the code draws "DRUM ÎNCHIS")
        x0, y0, x1, y1 = round(604 * GW / 1376), round(648 * GH / 768), round(808 * GW / 1376), round(748 * GH / 768); v[y0 + 2:y1 - 2, x0 + 2:x1 - 2] = 142
    if n == 'b25_rang': v[100:164, 100:156] = v[100:164, 44:100]   # the stray second monastery painted out (x2 of the coarse fix)
    Image.fromarray(np.dstack([v, v, v, np.full_like(v, 255)]), 'RGBA').save(D + f'assets/{n}.png'); print(n, v.shape)
