# bake the 5px orange ring into the new p6 layers (odyssey/cut/p6) and save webp in assets/ (persons 700 px high);
# coloured fills (brown, red, grey beards, the table) go to the figures' black: every figure is solid black with thin
# orange incised lines only (a coloured patch wider than an incised line is a fill)
import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, '..'); CUT = os.path.join(P, 'odyssey', 'cut', 'p6'); OUT = os.path.join(ROOT, 'assets')
RING = (229, 125, 54)
def ring(im, px=5, pad=8):
    im = im.convert('RGBA'); w, h = im.size
    big = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); big.paste(im, (pad, pad))
    a = big.split()[3].point(lambda v: 255 if v > 40 else 0)
    a = a.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.GaussianBlur(0.8))
    base = Image.new('RGBA', big.size, RING + (0,)); base.putalpha(a); base.alpha_composite(big); return base
def fit(im, hmax=700, wmax=1300):
    w, h = im.size; s = min(1, hmax / h, wmax / w); return im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im
SIZE = {'olive_bed': (800, 1300), 'argos': (360, 700), 'argos_dead': (300, 800), 'suitor_dead': (300, 900), 'embrace': (720, 900)}
KEEP_COL = {'athena_wand'}                # the golden wand stays
def blacken(a, r=3):
    rgb = a[..., :3].astype(int); lum = rgb.max(-1)
    col = (lum > 55) & (a[..., 3] > 0)                      # anything that is not the figure's black
    wide = ndimage.binary_opening(col, iterations=r)        # survives an opening = wider than an incised line
    wide = ndimage.binary_dilation(wide, iterations=1) & col
    a[wide, :3] = 12; return a
for f in sorted(os.listdir(CUT)):
    if not f.endswith('.png'): continue
    n = f[:-4]; im = Image.open(os.path.join(CUT, f)).convert('RGBA'); im = im.crop(im.getbbox())
    im = fit(im, *SIZE.get(n, (700, 1300)))
    a = np.array(im)
    if n not in KEEP_COL: a = blacken(a)
    ring(Image.fromarray(a)).save(os.path.join(OUT, n + '.webp'), 'WEBP', quality=92, method=6); print(n, im.size)
# older layers that no earlier part ringed
for n in ['suitor', 'ody_bow', 'ody_sword', 'ody_shout']:
    im = Image.open(os.path.join(P, 'odyssey', 'cut', n + '.png')).convert('RGBA'); im = im.crop(im.getbbox())
    ring(fit(im)).save(os.path.join(OUT, n + '.webp'), 'WEBP', quality=92, method=6); print(n, im.size)
