# outline.py (round 11): Flow's own outline is the outline. The code adds outline ONLY where the cut-out removed it:
# ring cells just outside the mask (1 cell) that were white in the full image (Flow's outline, left behind in the bg by
# the cut) are restored onto the fg layer, in their own pixels. Nothing inside the figure is changed; no new line is
# invented where Flow drew none. The reveal face also gets its right-half interior layer (the 1-s lag) here.
import sys, numpy as np
from PIL import Image
from scipy import ndimage
D = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'
BOARD = ['b02_porthole', 'b03_deck', 'b04_ship', 'b07_monitorc', 'b11_review', 'b14_biologist', 'b16_ids', 'b18_refused', 'b19_alone',
         'b22_turn_candidate', 'b23_smilingc', 'b27_piccard']
NAMES = sys.argv[1:] or ['f09_pilot', 'f09_pilot_b', 'f24_q'] + BOARD + [n + '_b' for n in ('b14_biologist', 'b23_smilingc', 'b16_ids', 'b27_piccard')] + ['b14_biologist_c', 'b07_monitorc_b']
K8 = np.ones((3, 3), bool)
for n in NAMES:
    try: f = np.asarray(Image.open(D + f'assets/{n}_fg.png').convert('RGBA')).copy()
    except FileNotFoundError: continue
    full = np.asarray(Image.open(D + f'assets/{n}.png').convert('L'))
    m = f[..., 3] > 0
    # round 12: ONE continuous cell, never doubled. Flow's 1-px outline mostly drops out of the 4-px medians (dotted), so:
    # where Flow drew an outline (white within 3 cells of the figure's edge, inside or outside), the 1-cell ring just
    # outside the mask is drawn in a light tone (214, subtle) -- except where the figure's own edge cell is already white
    # (Flow's line survived inside: no second line next to it).
    L = f[..., 0]
    edge = m & ~ndimage.binary_erosion(m, K8)
    ring = ndimage.binary_dilation(m, K8) & ~m
    ring[0, :] = ring[-1, :] = ring[:, 0] = ring[:, -1] = False
    flow = (ndimage.binary_dilation(m, K8, iterations=2) & ~ndimage.binary_erosion(m, K8, iterations=2)) & (full >= 214)
    near = ndimage.binary_dilation(flow, K8, iterations=3)
    inner_white = ndimage.binary_dilation(edge & (L >= 214), K8)
    keep = ring & near & ~inner_white
    if n.startswith(('b22_', 'b23_', 'f24_q')): keep[:] = False   # round 15: the cameraman keeps only Flow's own thin line (the ring read heavy round his hair)
    f[keep, :3] = 214; f[keep, 3] = 255
    Image.fromarray(f).save(D + f'assets/{n}_fg.png')
    if n == 'f24_q':
        inn = f.copy(); xs_ = np.arange(m.shape[1])[None]; inn[..., 3] = np.where(ndimage.binary_erosion(m, iterations=4) & (xs_ >= 245), 255, 0)
        Image.fromarray(inn).save(D + 'assets/f24_q_in.png')
    print(n, "ring cells", int(keep.sum()))
