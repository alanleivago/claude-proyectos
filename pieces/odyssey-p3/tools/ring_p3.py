# bake the 5px orange ring into the new p3 layers (odyssey/cut/p3) and the reused ones from odyssey/cut and save webp in assets/ (persons 700 px high)
import os
from PIL import Image, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUT = os.path.join(ROOT, '..', 'odyssey', 'cut', 'p3'); OLD = os.path.join(ROOT, '..', 'odyssey', 'cut'); OUT = os.path.join(ROOT, 'assets')
RING = (229, 125, 54)
def ring(im, px=5, pad=8):
    im = im.convert('RGBA'); w, h = im.size
    big = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); big.paste(im, (pad, pad))
    a = big.split()[3].point(lambda v: 255 if v > 40 else 0)
    a = a.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.GaussianBlur(0.8))
    base = Image.new('RGBA', big.size, RING + (0,)); base.putalpha(a); base.alpha_composite(big); return base
def fit(im, hmax=700, wmax=1300):
    w, h = im.size; s = min(1, hmax / h, wmax / w); return im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im
SIZE = {'circe_house': (800, 1400), 'circe_weave': (700, 1000), 'ram': (500, 800), 'bull': (500, 800)}
REUSE = ['ram', 'shade', 'king_a', 'bull', 'penelope', 'suitor', 'man_drink', 'man_lotus']
for src in [os.path.join(CUT, f) for f in sorted(os.listdir(CUT))] + [os.path.join(OLD, n + '.png') for n in REUSE]:
    n = os.path.basename(src)[:-4]; im = Image.open(src).convert('RGBA'); im = im.crop(im.getbbox())
    ring(fit(im, *SIZE.get(n, (700, 1300)))).save(os.path.join(OUT, n + '.webp'), 'WEBP', quality=92, method=6); print(n, im.size)
