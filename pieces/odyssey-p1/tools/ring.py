# bake the 5px orange separation ring (dilated alpha) into each layer and save as webp in assets/
import sys, glob, os
from PIL import Image, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, '..', 'odyssey', 'cut')
OUT = os.path.join(ROOT, 'assets')
RING = (229, 125, 54)
def ring(im, px=5, pad=8):
    im = im.convert('RGBA'); w, h = im.size
    big = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); big.paste(im, (pad, pad))
    a = big.split()[3].point(lambda v: 255 if v > 40 else 0)
    for _ in range(px): a = a.filter(ImageFilter.MaxFilter(3))
    a = a.filter(ImageFilter.GaussianBlur(0.7))
    base = Image.new('RGBA', big.size, RING + (0,)); base.putalpha(a)
    base.alpha_composite(big)
    return base
for f in sorted(glob.glob(os.path.join(SRC, '*.png'))):
    n = os.path.basename(f)[:-4]; im = Image.open(f)
    out = im.convert('RGBA') if n == 'cave' else ring(im)
    out.save(os.path.join(OUT, n + '.webp'), 'WEBP', quality=92, method=6)
    print(n, out.size)
ship = Image.open(os.path.join(ROOT, '..', 'scylla', 'assets', 'ship.webp'))
ring(ship).save(os.path.join(OUT, 'ship.webp'), 'WEBP', quality=92, method=6); print('ship')
