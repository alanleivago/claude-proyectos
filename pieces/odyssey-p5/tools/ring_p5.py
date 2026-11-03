# bake the 5px orange ring into the new p5 layers (odyssey/cut/p5) and save webp in assets/ (persons 700 px high);
# the reused layers are copied ringed from the earlier parts' assets
import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, '..'); CUT = os.path.join(P, 'odyssey', 'cut', 'p5'); OUT = os.path.join(ROOT, 'assets')
RING = (229, 125, 54)
def ring(im, px=5, pad=8):
    im = im.convert('RGBA'); w, h = im.size
    big = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); big.paste(im, (pad, pad))
    a = big.split()[3].point(lambda v: 255 if v > 40 else 0)
    a = a.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.GaussianBlur(0.8))
    base = Image.new('RGBA', big.size, RING + (0,)); base.putalpha(a); base.alpha_composite(big); return base
def fit(im, hmax=700, wmax=1300):
    w, h = im.size; s = min(1, hmax / h, wmax / w); return im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im
SIZE = {'calypso_cave': (900, 1600), 'raft_sail': (700, 1100), 'ody_crawl': (500, 900), 'ody_lie': (360, 1100), 'guest_a': (560, 900)}
GREY = {'alcinous', 'demodocus'}          # grey hair and beards -> the figures' black (every figure is solid black)
DROP_SMALL = {'nausicaa_ball'}            # the ball floating over her hand goes (it is animated in code)
for f in sorted(os.listdir(CUT)):
    if not f.endswith('.png'): continue
    n = f[:-4]; im = Image.open(os.path.join(CUT, f)).convert('RGBA')
    a = np.array(im)
    if n in GREY:
        rgb = a[..., :3].astype(int); mx, mn = rgb.max(-1), rgb.min(-1); m = (mx - mn < 30) & (mx > 70) & (a[..., 3] > 0); a[m, :3] = 12
    if n in DROP_SMALL:
        lab, k = ndimage.label(a[..., 3] > 40); sz = ndimage.sum(np.ones_like(lab), lab, range(1, k + 1)); big = 1 + int(np.argmax(sz))
        keep = ndimage.binary_dilation(lab == big, iterations=3); a[~keep, 3] = 0
    im = Image.fromarray(a); im = im.crop(im.getbbox())
    ring(fit(im, *SIZE.get(n, (700, 1300)))).save(os.path.join(OUT, n + '.webp'), 'WEBP', quality=92, method=6); print(n, im.size)
# older layers that no earlier part ringed
for n in ['penelope', 'ody_beggar', 'cyclops_throw']:
    im = Image.open(os.path.join(P, 'odyssey', 'cut', n + '.png')).convert('RGBA'); im = im.crop(im.getbbox())
    ring(fit(im)).save(os.path.join(OUT, n + '.webp'), 'WEBP', quality=92, method=6); print(n, im.size)
