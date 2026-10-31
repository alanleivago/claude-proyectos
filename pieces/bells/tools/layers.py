# layers.py: splits board images into a foreground layer and an inpainted background for parallax.
# For each <name>, gen/layers/<name>_m.jpg is a Flow edit of the same image with everything but the foreground replaced by
# flat magenta. The magenta key (strong chroma, connected to the border) gives the mask on Flow's pixels; it is
# box-sampled onto the 240x134 native grid and applied to the native image (assets/<name>.png), so the pixels stay the
# approved ones. Background: the masked cells (grown 2 cells) are filled from the nearest unmasked cell in the same row,
# then the column (a stretched plate: only slivers of it ever show while the layers move a few cells).
import sys, numpy as np
from PIL import Image
from scipy import ndimage
D = '/Users/alanleiva/claude-proyectos/pieces/bells/'
NAMES = sys.argv[1:] or ['b02_plague', 'b02_war', 'b03_monks', 'b03_villagers', 'b04_died', 'b05_bell', 'b06_dogs', 'b07_window', 'b09_sunrise',
         'b12_rope', 'b16_historians', 'b20_empty', 'b21_carry', 'b23_above', 'b25_rang', 'b27_monk', 'b28_town', 'b29_empty']
STRUCT = {'b05_bell', 'b20_empty', 'b23_above', 'b25_rang', 'b29_empty'}
def fill_rows(img, m):   # nearest valid cell in 2D (a row-only fill smeared shadows across the ground)
    if not m.any(): return img.copy()
    _, (iy, ix) = ndimage.distance_transform_edt(m, return_indices=True)
    return img[iy, ix]
def fill_rows_old(img, m):
    out = img.copy(); h, w = m.shape
    for y in range(h):
        row = m[y]
        if not row.any(): continue
        if row.all(): continue
        idx = np.where(~row)[0]
        xs = np.arange(w); j = np.searchsorted(idx, xs); jl = idx[np.clip(j - 1, 0, len(idx) - 1)]; jr = idx[np.clip(j, 0, len(idx) - 1)]
        near = np.where(np.abs(xs - jl) <= np.abs(jr - xs), jl, jr)
        out[y, row] = img[y, near[row]]
    rows_all = m.all(1)
    for y in np.where(rows_all)[0]:   # fully masked rows: copy the nearest row
        free = np.where(~rows_all)[0]
        if not len(free): break
        out[y] = out[free[np.argmin(np.abs(free - y))]]
    return out
for n in NAMES:
    e = np.asarray(Image.open(D + f'gen/layers/{n}_m.jpg').convert('RGB')).astype(np.float32)
    mag = (e[..., 0] > 150) & (e[..., 2] > 150) & (e[..., 1] < 110)
    lab, _ = ndimage.label(mag); edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, edge[edge > 0]) | mag
    fg = ~ndimage.binary_dilation(bg, iterations=2)
    if n not in STRUCT: fg = ndimage.binary_fill_holes(fg)   # figures: no see-through holes; arches/towers keep their openings
    nat = np.asarray(Image.open(D + f'assets/{n}.png').convert('RGBA'))
    h, w = nat.shape[:2]
    m = np.asarray(Image.fromarray((fg * 255).astype(np.uint8)).resize((w, h), Image.BOX)) > 110
    m = ndimage.binary_opening(m, iterations=1)
    lab, k = ndimage.label(m)
    if k > 1:   # drop tiny islands
        sz = ndimage.sum(m, lab, range(1, k + 1)); m = np.isin(lab, 1 + np.where(sz >= 12)[0])
    # parts the Flow isolation missed (a paw, a hand, a foot on snow): dark cells within 4 cells of the figure that sit on
    # a light background (judged on a first fill) and connect to the figure join the fg, so nothing of it stays in the bg
    first = fill_rows(nat[..., :3], ndimage.binary_dilation(m, iterations=2))[..., 0]
    cand = ndimage.binary_dilation(m, iterations=4) & (nat[..., 0] <= 142) & (first >= 142)
    # small dark islands on white ground near the figure (shadows, a stray paw) go with the figure too
    near = ndimage.binary_dilation(m, iterations=12) & ~m
    isl = near & (nat[..., 0] <= 142); lab, k = ndimage.label(isl)
    feet = np.percentile(np.nonzero(m)[0], 50) if m.any() else 1e9   # only ground-level islands (shadows, paws): not houses or roofs
    for q, sl in enumerate(ndimage.find_objects(lab), 1):
        comp = lab == q; area = comp.sum()
        if area > 3000 or sl[0].start < feet: continue
        ring = ndimage.binary_dilation(comp, iterations=1) & ~comp
        if (nat[..., 0][ring] == 253).mean() > 0.55: m = m | comp
    f = nat.copy(); f[..., 3] = np.where(m, 255, 0); Image.fromarray(f).save(D + f'assets/{n}_fg.png')
    grow = ndimage.binary_dilation(m, iterations=4)   # the bg is cleared 4 cells out (no figure pixels, no outline left)
    b = nat.copy(); b[..., :3] = fill_rows(nat[..., :3], grow); Image.fromarray(b).save(D + f'assets/{n}_bg.png')
    print(n, 'fg cells %.0f%%' % (m.mean() * 100))
    if n == 'b07_window':   # the expression variant shares the mask
        nb = np.asarray(Image.open(D + 'assets/b07_window_b.png').convert('RGBA'))
        fb = nb.copy(); fb[..., 3] = np.where(m, 255, 0); Image.fromarray(fb).save(D + 'assets/b07_window_b_fg.png')

# ---- sky splits (no Flow edit needed): the background is the light region (clouds, fog, the face) connected to the top
# border; everything else (mountains, crag, monastery, village) is the foreground. Light = grey or white cells.
SKY = ['b01_monastery', 'b08_fog', 'face_closed', 'b11_slits', 'b11_half', 'reveal']
for n in (SKY if not sys.argv[1:] else []):
    nat = np.asarray(Image.open(D + f'assets/{n}.png').convert('RGBA')); L = nat[..., 0]
    light = (L >= 142) if n != 'b01_monastery' else (L == 253)   # b01: the crag is grey, only the white sky is sky
    lab, _ = ndimage.label(light); top = np.unique(lab[0]); sky = np.isin(lab, top[top > 0])
    sky = ndimage.binary_fill_holes(sky | (L == 0) & (np.arange(L.shape[0])[:, None] < 40)) if n != 'b01_monastery' else sky
    m = ~sky
    lab, k = ndimage.label(m)
    if k > 1: sz = ndimage.sum(m, lab, range(1, k + 1)); m = np.isin(lab, 1 + np.where(sz >= 20)[0])
    f = nat.copy(); f[..., 3] = np.where(m, 255, 0); Image.fromarray(f).save(D + f'assets/{n}_fg.png')
    grow = ndimage.binary_dilation(m, iterations=3)
    b = nat.copy(); b[..., :3] = fill_rows(nat[..., :3], grow); Image.fromarray(b).save(D + f'assets/{n}_bg.png')
    print(n, 'sky split, fg cells %.0f%%' % (m.mean() * 100))
