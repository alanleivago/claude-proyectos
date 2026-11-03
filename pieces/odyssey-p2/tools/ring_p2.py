# bake the 5px orange ring into the new p2 layers (odyssey/cut/p2) and save webp in assets/ (persons 700 px high)
import os
from PIL import Image, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUT = os.path.join(ROOT, '..', 'odyssey', 'cut', 'p2'); OUT = os.path.join(ROOT, 'assets')
RING = (229, 125, 54)
def ring(im, px=5, pad=8):
    im = im.convert('RGBA'); w, h = im.size
    big = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); big.paste(im, (pad, pad))
    a = big.split()[3].point(lambda v: 255 if v > 40 else 0)
    a = a.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.GaussianBlur(0.8))
    base = Image.new('RGBA', big.size, RING + (0,)); base.putalpha(a); base.alpha_composite(big); return base
def fit(im, hmax=700, wmax=1300):
    w, h = im.size; s = min(1, hmax / h, wmax / w); return im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im
SIZE = {'aeolus_island': (900, 1400), 'cliff': (1000, 900), 'bag': (400, 400)}
for f in sorted(os.listdir(CUT)):
    n = f[:-4]; im = Image.open(os.path.join(CUT, f)).convert('RGBA'); im = im.crop(im.getbbox())
    if n == 'man_swim':   # drop the waterline Flow drew under him (the code sea covers his waist)
        w, h = im.size; im = im.crop((0, 0, w, h - 14)); im = im.crop(im.getbbox())
    ring(fit(im, *SIZE.get(n, (700, 1300)))).save(os.path.join(OUT, n + '.webp'), 'WEBP', quality=92, method=6); print(n, im.size)
