# outline.py: a clean continuous white outline, 1 cell wide (4 px on the 480x268 grid), drawn around every character
# cut-out (assets/<n>_fg.png) from the mask's outer edge, replacing Flow's thin outline that the grid pass and the
# masks broke up. The ring sits on the fg layer (it moves with it). It is skipped on the frame border and where the
# background behind it is white (snow, sky: a white ring there reads as a bulge). Flow's leftover outline fragments
# on the inner edge (white edge cells with no white interior neighbour) take their dark neighbours' value.
import sys, numpy as np
from PIL import Image
from scipy import ndimage
D = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'
BOARD = ['b02_porthole', 'b03_deck', 'b04_ship', 'b07_monitorc', 'b11_review', 'b14_biologist', 'b16_ids', 'b18_refused', 'b19_alone',
         'b22_turn_candidate', 'b23_smilingc', 'b27_piccard']
NAMES = sys.argv[1:] or ['f09_pilot', 'f09_pilot_b', 'f24_q'] + BOARD
SMOOTH = {'b22_turn_candidate', 'b23_smilingc', 'f24_q'}
K4 = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], bool)
for n in NAMES:
    f = np.asarray(Image.open(D + f'assets/{n}_fg.png').convert('RGBA')).copy()
    bgn = 'f09_pilot' if n in ('f09_pilot_b', 'f09_creature') else n
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
    # round 7 (user: thick/doubled outlines): Flow's own outline is KEPT where it exists (no fragment removal) and the
    # code ring fills only the gaps: a ring cell is drawn only where no white cell of the figure's own edge touches it
    flow_edge = edge & (L == 253)
    has_flow = ndimage.binary_dilation(flow_edge, iterations=1)
    # 2) the new ring
    ring = ndimage.binary_dilation(m, K4) & ~m
    ring[0, :] = ring[-1, :] = ring[:, 0] = ring[:, -1] = False
    ring &= bg < 253
    # learning-faces: the masks follow a hand polygon where the figure meets a dark background with no outline, so the
    # ring is drawn only where Flow drew an outline (within 2 cells): no straight white lines along the polygon cuts
    src = {'f09_creature': 'f09_pilot', 'f24_reveal': 'f24_base'}.get(n, n)
    a = np.asarray(Image.open(D + f'gen/{src}.jpg').convert('L')).astype(float) / 255; GH, GW = m.shape; FH, FW = a.shape
    ys = (np.arange(GH + 1) * FH / GH).astype(int); xs = (np.arange(GW + 1) * FW / GW).astype(int)
    wmax = np.maximum.reduceat(np.maximum.reduceat(a, ys[:-1], axis=0), xs[:-1], axis=1)
    if n not in BOARD: ring &= ndimage.binary_dilation(wmax >= 0.8, iterations=2)   # magenta masks follow the real edge: full ring (user rule)
    # Flow's thin outline often lands grey on the grid: look for it at full res (any pixel >= 0.8 in the cell) along the
    # mask's edge band (edge cells + the ring cells); where it runs, it is set to clean white and no code ring is added
    if n in SMOOTH:   # round 8: the cameraman's spiky hair outline -> the mask is simplified (closed + opened by a disk), Flow's
        # outline cells near the edge are taken out (they take the dark next to them), the fg is cut to the smooth mask and
        # ONE continuous code ring follows it
        disk = np.hypot(*np.mgrid[-3:4, -3:4]) <= 3
        ms = ndimage.binary_opening(ndimage.binary_closing(m, disk), disk) & m | ndimage.binary_erosion(m, disk)
        ms = ndimage.binary_fill_holes(ms)
        nearE = ms & ~ndimage.binary_erosion(ms, iterations=9)   # Flow's spiky outline bits sit up to ~8 cells in from the smoothed edge
        dark = ndimage.grey_erosion(np.where(L == 253, 255, L), size=3)
        L = np.where(nearE & (L == 253), np.minimum(dark, 56), L)
        blk = ndimage.uniform_filter((L == 0).astype(float), 7)   # white bits sitting in the dark hair (Flow's broken outline/
        L = np.where(ms & (L == 253) & (blk > 0.35), 0, L)         # highlights) -> black hair; face highlights (in grey) stay
        L = np.where(ms & ~ndimage.binary_erosion(ms, iterations=14) & (L >= 142) & (blk > 0.3), 0, L)      # grey outline remnants in the hair edge -> black too
        m = ms; ring = ndimage.binary_dilation(m, K4) & ~m
        ring[0, :] = ring[-1, :] = ring[:, 0] = ring[:, -1] = False
        if n == 'f24_q': ring[188:, :] = False   # the cut runs through his jumpsuit below the neck: no line across the body
        f[..., 0] = f[..., 1] = f[..., 2] = np.where(ring, 253, L); f[..., 3] = np.where(m | ring, 255, 0)
        Image.fromarray(f).save(D + f'assets/{n}_fg.png')
        if n == 'f24_q':   # the right half's interior for the reveal's 1-s lag (the outline stays on the whole layer)
            inn = f.copy(); xs_ = np.arange(m.shape[1])[None]; inn[..., 3] = np.where(ndimage.binary_erosion(m, iterations=4) & (xs_ >= 245), 255, 0)
            Image.fromarray(inn).save(D + 'assets/f24_q_in.png')
        print(n, 'smoothed ring', int(ring.sum())); continue
    fl = edge & (wmax >= 0.8)                                    # Flow's outline passes through this edge cell (seen at full res)
    L = np.where(fl, 253, L)                                     # -> the edge cell is the outline, clean white
    for _ in range(2):   # bridge 1-cell breaks along the edge (diagonal steps read as a dotted line)
        we = edge & (L == 253); P = np.pad(we, 1)
        nb = sum(P[1 + dy:1 + dy + we.shape[0], 1 + dx:1 + dx + we.shape[1]].astype(int) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
        L = np.where(edge & ~we & (nb >= 2) & (L > 0), 253, L)
    has_flow = ndimage.binary_dilation(edge & (L == 253), K4)    # ring cells next to it are not drawn (no second line)
    ring &= ~has_flow   # a gap only: one continuous cell, never a second line beside Flow's
    f[..., 0] = f[..., 1] = f[..., 2] = np.where(ring, 253, L)
    f[ring, 3] = 255
    Image.fromarray(f).save(D + f'assets/{n}_fg.png'); print(n, 'flow edge cells', int(flow_edge.sum()), 'gap ring cells', int(ring.sum()))
