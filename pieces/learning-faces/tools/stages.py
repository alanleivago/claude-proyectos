# stages.py: code edits on the 480x268 grid after gentle.py, per stage of the thing (user round 3).
#  d2_imprint: Flow's two round holes with clean grey rims + a centred slit read cute (a cartoon ghost). They are cleared
#    to the membrane's white and re-drawn uneven: the left hole a ragged blob, the right one taller and torn downward into
#    a streak that follows the folds, no clean rims (only a broken dark-grey fringe), drag lines into the folds below,
#    and the slit off-centre and crooked.
import sys, numpy as np
from PIL import Image
D = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'
rng = np.random.default_rng(11)
def load(n): a = np.asarray(Image.open(D + f'assets/{n}.png')).copy(); return a, a[..., 0].astype(int)
def save(n, a, L): a[..., 0] = a[..., 1] = a[..., 2] = L.astype(np.uint8); Image.fromarray(a).save(D + f'assets/{n}.png'); print(n, 'staged')
def blob(L, cx, cy, rx, ry, jag, seed, tear=None):
    """a ragged black hole: radius wobbles with angle; a broken dark-grey fringe on ~half its edge"""
    r = np.random.default_rng(seed); k = r.random(7) * 2 * np.pi; amp = r.random(7)
    H, W = L.shape; yy, xx = np.mgrid[:H, :W]; th = np.arctan2(yy - cy, xx - cx)
    wob = 1 + jag * sum(amp[i] * np.sin((i + 2) * th + k[i]) for i in range(7)) / 3
    d = np.hypot((xx - cx) / rx, (yy - cy) / ry) / wob
    fr = (d > 1) & (d < 1.22) & (np.sin(th * 3 + k[0]) > -0.2) & (L >= 128)
    L[fr] = 46; L[d <= 1] = 0
from scipy import ndimage as _nd
def clear(L, cx, cy, r):   # round 11: cleared cells take the surrounding membrane's own tone (nearest cell outside)
    H, W = L.shape; yy, xx = np.mgrid[:H, :W]; m = np.hypot(xx - cx, yy - cy) <= r
    _, (iy, ix) = _nd.distance_transform_edt(m, return_indices=True); L[m] = L[iy[m], ix[m]]
def clearbox(L, ys, xs):
    m = np.zeros(L.shape, bool); m[ys, xs] = True; _, (iy, ix) = _nd.distance_transform_edt(m, return_indices=True); L[m] = L[iy[m], ix[m]]
def line(L, pts, w, col):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for i in range(n + 1):
            t = i / n; x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t; ww = w(t) if callable(w) else w
            for dy in range(-int(ww // 2), int(ww - ww // 2)):
                L[int(round(y + dy)), int(round(x))] = col
if 'd2_imprint' in (sys.argv[1:] or ['d2_imprint']):
    a, L = load('d2_imprint')
    clear(L, 286, 113, 17); clear(L, 341, 113, 17); clearbox(L, slice(150, 166), slice(296, 342))   # Flow's holes, rims and slit
    blob(L, 287, 112, 11.5, 12.5, 0.32, 3)                                        # left: a ragged blob
    blob(L, 342, 112, 10.0, 17.0, 0.28, 8)                                       # right: taller
    line(L, [(342, 126), (343, 136), (345, 146), (344, 158)], lambda t: 6 - 4.5 * t, 0)   # torn down into the folds
    for x0, y0, n in [(282, 122, 9), (291, 121, 6), (337, 140, 7), (347, 132, 10)]:     # grey drag lines along the folds
        line(L, [(x0, y0), (x0 + rng.integers(-1, 2), y0 + n)], 1, 87)
    line(L, [(306, 156), (316, 158), (323, 157), (331, 160), (339, 165)], 3, 0)        # the slit: off-centre, crooked
    line(L, [(310, 160), (320, 161), (330, 163)], 1, 46)
    save('d2_imprint', a, L)
#  d3_out: the dive-2 face seen small and dimmed through the porthole gets the same uneven holes and crooked slit
if 'd3_out' in sys.argv[1:]:   # round 13: retired (beat 9 is one Flow creature image now)
    a, L = load('d3_out')
    clear3 = lambda cx, cy, r: clear(L, cx, cy, r)
    OX, OY = -17, 38   # the membrane moved in mirror.py (round 3b)
    clear3(377 + OX, 103 + OY, 10); clear3(410 + OX, 103 + OY, 10); r_ = slice(124 + OY, 131 + OY); c_ = slice(383 + OX, 406 + OX); clearbox(L, r_, c_)
    blob(L, 377 + OX, 103 + OY, 6.5, 7.0, 0.3, 3); blob(L, 410 + OX, 103 + OY, 5.8, 9.5, 0.28, 8)
    line(L, [(410 + OX, 110 + OY), (411 + OX, 117 + OY), (412 + OX, 124 + OY)], lambda t: 3 - 2 * t, 0)
    line(L, [(386 + OX, 126 + OY), (393 + OX, 128 + OY), (399 + OX, 127 + OY), (405 + OX, 130 + OY)], 2, 0)
    # round 5: the hand grows OUT of the membrane (user: it looked detached): the wrist and the membrane's top are joined by
    # one fill of the same flesh (no gap, no outline at the join), the wrist's grey shade runs on down the right side,
    # and the veins carry across from the wrist into the folds
    from PIL import ImageDraw as _ID
    jm = Image.new('L', (480, 268)); _ID.Draw(jm).polygon([(299, 94), (347, 94), (360, 116), (378, 123), (330, 131), (299, 132), (296, 112)], fill=1)
    J = np.asarray(jm) > 0; L[J] = 168   # the join: light flesh tone (the membrane's lit value)
    line(L, [(346, 96), (352, 106), (358, 116), (366, 122)], 2, 87)                 # the shade side
    line(L, [(300, 96), (299, 112), (300, 128)], 2, 87)
    for pts in ([(316, 86), (319, 100), (315, 114), (318, 130), (314, 142)], [(331, 88), (334, 104), (338, 118), (343, 132), (347, 146)],
                [(308, 98), (306, 112), (309, 124), (305, 138)], [(340, 100), (348, 112), (356, 121), (362, 134)]):
        line(L, pts, 1, 0)                                                            # veins across the join
    save('d3_out', a, L)
