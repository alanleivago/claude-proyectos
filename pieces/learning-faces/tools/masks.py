# masks.py: fg/bg layers for the look frames. Flow would not isolate on magenta here (two tries came back grey, one
# re-posed the pilot: gen/stale), so each figure is cut on the 480x268 grid (assets/<n>.png from gentle.py) from a hand
# polygon traced on the Flow original: the polygon eroded 5 cells is surely figure, outside it dilated 5 cells is surely
# background, and the band between is settled by a flood from the background that stops at the figure's own white
# outline cells. bg = the image with the figure(s) removed, grown 4 cells and filled from the nearest remaining cell
# (bells' layers.py rule: no ghost pixels). Then outline.py draws the continuous 1-cell ring.
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
D = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'
GW, GH, FW, FH = 480, 268, 1376, 768
POLY = {   # Flow px
 'f08_face': [(1110, 72), (1180, 98), (1198, 160), (1192, 262), (1152, 302), (1172, 320), (1252, 343), (1278, 392), (1288, 480), (1296, 600), (1300, 648),
              (928, 648), (934, 560), (948, 450), (958, 370), (990, 330), (1060, 300), (1040, 242), (1032, 150), (1060, 95)],
 'f09_pilot': [(320, 140), (350, 98), (420, 84), (500, 94), (562, 140), (572, 200), (560, 282), (536, 330), (600, 398), (640, 330), (662, 268), (700, 248), (752, 250),
               (790, 296), (800, 388), (770, 420), (700, 444), (660, 474), (560, 502), (430, 562), (400, 640), (380, 768), (0, 768), (0, 540), (60, 430),
               (200, 338), (330, 300), (318, 230)],
 'f09_creature': [(1000, 158), (1062, 148), (1104, 182), (1112, 282), (1092, 352), (1152, 420), (1204, 470), (1184, 562), (940, 584), (900, 522), (872, 470),
                  (858, 420), (818, 380), (788, 330), (788, 278), (812, 262), (842, 300), (862, 350), (902, 410), (948, 380), (958, 330), (950, 280), (960, 200)],
 'f24_q': [(430, 150), (470, 60), (560, 18), (700, 8), (860, 18), (950, 90), (962, 200), (912, 300), (884, 420), (866, 500), (1000, 556), (1124, 636), (1144, 768),
           (236, 768), (256, 636), (380, 556), (506, 500), (472, 420), (466, 300)],
 'f24_base': [(418, 768), (418, 560), (424, 450), (408, 320), (428, 150), (478, 58), (540, 0), (930, 0), (992, 120), (1002, 300), (992, 420), (962, 520),
              (982, 560), (1062, 620), (1112, 768)],
}
def poly_mask(pts):
    im = Image.new('L', (GW, GH)); ImageDraw.Draw(im).polygon([(x * GW / FW, y * GH / FH) for x, y in pts], fill=255)
    return np.asarray(im) > 0
def cut(src, key):
    L = np.asarray(Image.open(D + f'assets/{src}.png'))[..., 0]
    p = poly_mask(POLY[key]); core = ndimage.binary_erosion(p, iterations=5); far = ~ndimage.binary_dilation(p, iterations=5)
    # the barrier: the figure's thin white outline, taken from the Flow original at full res (the grid pass thins it out),
    # a cell is barrier if any of its pixels is outline-white
    a = np.asarray(Image.open(D + f'gen/{src.replace("_reveal", "_base")}.jpg').convert('L')).astype(float) / 255
    ys = (np.arange(GH + 1) * FH / GH).astype(int); xs = (np.arange(GW + 1) * FW / GW).astype(int)
    wmax = np.maximum.reduceat(np.maximum.reduceat(a, ys[:-1], axis=0), xs[:-1], axis=1)
    free = ~core & (L < 255) & (wmax < 0.8)      # the flood crosses anything but white and the core
    lab, _ = ndimage.label(free); seeds = np.unique(lab[far & free]); bgc = np.isin(lab, seeds[seeds > 0])
    m = ~bgc & ~far
    m = ndimage.binary_fill_holes(m); m = ndimage.binary_opening(m, iterations=1)
    lab, k = ndimage.label(m)
    if k > 1: sz = ndimage.sum(m, lab, range(1, k + 1)); m = lab == (1 + np.argmax(sz))
    return m
def save(src, out, m):
    a = np.asarray(Image.open(D + f'assets/{src}.png').convert('RGBA')).copy(); a[..., 3] = np.where(m, 255, 0)
    Image.fromarray(a).save(D + f'assets/{out}.png'); print(out, 'cells %.0f%%' % (m.mean() * 100))
def bg(src, out, m):
    a = np.asarray(Image.open(D + f'assets/{src}.png').convert('RGBA')).copy()
    grow = ndimage.binary_dilation(m, iterations=6) | (ndimage.binary_dilation(m, iterations=10) & (a[..., 0] == 255))   # no white outline bits as fill sources
    _, (iy, ix) = ndimage.distance_transform_edt(grow, return_indices=True); a[..., :3] = a[iy, ix, :3]
    Image.fromarray(a).save(D + f'assets/{out}.png'); print(out)
# beat 8 stays ONE layer on purpose: the thing is perfectly still (the device); the motion there is the marine snow,
# the lamp flicker and the slow push, all in code
mp = cut('f09_pilot', 'f09_pilot'); mc = cut('f09_pilot', 'f09_creature')
# round 16: the pilot layer must carry only the pilot: the dark porthole glass the polygon grabbed beside his hand goes
_Lp = np.asarray(Image.open(D + 'assets/f09_pilot.png'))[..., 0]; _bx = np.zeros(mp.shape, bool); _bx[80:150, 225:300] = True
mp = mp & ~(_bx & (_Lp <= 46)); mp = ndimage.binary_opening(mp, iterations=1)
_lab, _k = ndimage.label(mp)
if _k > 1: _sz = ndimage.sum(mp, _lab, range(1, _k + 1)); mp = _lab == (1 + np.argmax(_sz))
save('f09_pilot', 'f09_pilot_fg', mp); save('f09_pilot_b', 'f09_pilot_b_fg', mp)
bg('f09_pilot', 'f09_pilot_bg', mp | mc)
# behind the creature is only the black glass: its hole is filled black inside the glass circle (no smear)
G = np.asarray(Image.open(D + 'assets/f09_pilot_bg.png')).copy(); yy, xx = np.mgrid[:GH, :GW]
glass = ((xx - 905 * GW / FW) ** 2 / (300 * GW / FW) ** 2 + (yy - 330 * GH / FH) ** 2 / (300 * GH / FH) ** 2) < 1
hole = glass & ~ndimage.binary_dilation(mp, iterations=1); G[hole, :3] = 0   # round 3: the whole glass black (less clutter)
Image.fromarray(G).save(D + 'assets/f09_pilot_bg.png')
# round 2: the quiet reveal (f24_q) and the dive-3 thing outside the glass (d3_out: lit cells inside the glass circle)
mq = cut('f24_q', 'f24_q'); save('f24_q', 'f24_q_fg', mq); bg('f24_q', 'f24_q_bg', mq)
L3 = np.asarray(Image.open(D + 'assets/d3_out.png'))[..., 0]; yy, xx = np.mgrid[:GH, :GW]
g3 = ((xx - 905 * GW / FW) ** 2 / (290 * GW / FW) ** 2 + (yy - 330 * GH / FH) ** 2 / (290 * GH / FH) ** 2) < 1
m3 = ndimage.binary_fill_holes(ndimage.binary_closing((L3 > 0) & g3, iterations=1)) & g3; save('d3_out', 'd3_out_fg', m3)
# (round 13: the falloff is in mirror.py now; the creature is one image)
