# cutm.py: fg/bg layers for the board shots with figures, from Flow magenta isolations (gen/layers/<n>_m.jpg: the same
# image with everything but the figures painted #FF00FF; alignment checked in review/iso_check). The bg is the magenta
# connected to the frame border (grown 2 px); the figure mask fills its holes, is box-sampled onto the 480x268 grid and
# applied to the approved grid image (assets/<n>.png). bg = the image with the figure cleared 6 cells out (and 10 where
# white outline bits sit) and filled from the nearest remaining cell, so parallax leaves no ghost pixels.
import sys, numpy as np
from PIL import Image
from scipy import ndimage
D = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'
NAMES = ['b02_porthole', 'b03_deck', 'b04_ship', 'b07_monitorc', 'b11_review', 'b14_biologist', 'b16_ids', 'b18_refused', 'b19_alone',
         'b22_turn_candidate', 'b23_smilingc', 'b27_piccard']
def mask_of(path, h, w):
    e = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    mag = (e[..., 0] > 150) & (e[..., 2] > 150) & (e[..., 1] < 110)
    lab, _ = ndimage.label(mag); edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bgm = np.isin(lab, edge[edge > 0]); fg = ndimage.binary_fill_holes(~ndimage.binary_dilation(bgm, iterations=2))
    m = np.asarray(Image.fromarray((fg * 255).astype(np.uint8)).resize((w, h), Image.BOX)) > 110
    m = ndimage.binary_opening(m, iterations=1); lab, k = ndimage.label(m)
    if k > 1: sz = ndimage.sum(m, lab, range(1, k + 1)); m = np.isin(lab, 1 + np.where(sz >= 30)[0])
    return m
import os
for n in (sys.argv[1:] or NAMES):
    a = np.asarray(Image.open(D + f'assets/{n}.png').convert('RGBA')).copy(); h, w = a.shape[:2]
    m = mask_of(D + f'gen/layers/{n}_m.jpg', h, w)
    if n == 'b18_refused':   # round 15: the gap between his legs (open to the frame bottom) became a flat filled block:
        cl = ndimage.binary_closing(np.pad(m, 10), iterations=10)[10:-10, 10:-10]; m = m | (cl & (np.arange(h)[:, None] > h * 0.55))   # it is the figure's own pixels now
    allm = m.copy()
    f = a.copy(); f[..., 3] = np.where(m, 255, 0)
    Image.fromarray(f).save(D + f'assets/{n}_fg.png')
    for sfx in ('_b', '_c'):   # expression variants: their own mask if isolated (an arm that moved), else the base one
        if not os.path.exists(D + f'assets/{n}{sfx}.png'): continue
        mv = mask_of(D + f'gen/layers/{n}{sfx}_m.jpg', h, w) if os.path.exists(D + f'gen/layers/{n}{sfx}_m.jpg') else m
        allm |= mv; vb = np.asarray(Image.open(D + f'assets/{n}{sfx}.png').convert('RGBA')).copy(); vb[..., 3] = np.where(mv, 255, 0)
        # round 12: the variant's figure tones rank-matched to the base figure's (the cameraman variant came out whiter)
        both = mv & m; src_ = vb[..., 0][mv]; ref_ = np.sort(a[..., 0][m])
        if len(ref_) and len(src_):
            order = np.argsort(src_, kind='stable'); q = ref_[np.linspace(0, len(ref_) - 1, len(src_)).astype(int)]
            T7 = np.array([0, 46, 87, 128, 168, 214, 255]); out = np.empty(len(src_), np.uint8); out[order] = q
            vb[mv, 0] = vb[mv, 1] = vb[mv, 2] = T7[np.abs(out[:, None].astype(int) - T7).argmin(1)]
        Image.fromarray(vb).save(D + f'assets/{n}{sfx}_fg.png')
    m = allm   # the bg is cleared under every pose, so no arm of the other pose is left behind
    grow = ndimage.binary_dilation(m, iterations=6) | (ndimage.binary_dilation(m, iterations=10) & (a[..., 0] == 255))
    _, (iy, ix) = ndimage.distance_transform_edt(grow, return_indices=True); b = a.copy(); b[..., :3] = a[iy, ix, :3]
    Image.fromarray(b).save(D + f'assets/{n}_bg.png'); print(n, 'fg %.0f%%' % (m.mean() * 100))
