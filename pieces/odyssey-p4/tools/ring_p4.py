# bake the 5px orange ring into the new p4 layers (odyssey/cut/p4), the reused ones from odyssey/cut (+p2, p3) and the
# Scylla short's layers (scylla/cut, scylla/assets heads) and save webp in assets/ (persons 700 px high)
import os
from PIL import Image, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, '..'); CUT = os.path.join(P, 'odyssey', 'cut', 'p4'); OLD = os.path.join(P, 'odyssey', 'cut'); OUT = os.path.join(ROOT, 'assets')
RING = (229, 125, 54)
def ring(im, px=5, pad=8):
    im = im.convert('RGBA'); w, h = im.size
    big = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); big.paste(im, (pad, pad))
    a = big.split()[3].point(lambda v: 255 if v > 40 else 0)
    a = a.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.GaussianBlur(0.8))
    base = Image.new('RGBA', big.size, RING + (0,)); base.putalpha(a); base.alpha_composite(big); return base
def fit(im, hmax=700, wmax=1300):
    w, h = im.size; s = min(1, hmax / h, wmax / w); return im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im
SIZE = {'cow': (500, 800), 'bull': (500, 800), 'bones': (400, 1300), 'hide': (400, 1100), 'ody_raft': (400, 1300), 'man_sleep': (360, 1100),
        'charybdis': (900, 900), 'scylla': (1000, 1000), 'figtree': (900, 900), 'man_spit': (600, 1000)}
# crop: fraction of the height to cut off the top (ody_hang came with a black bar along the top edge)
CROP_TOP = {'ody_hang': 0.07}
REUSE = ['troy_walls', 'coast', 'man_fear', 'man_skin', 'man_walk', 'man_beg', 'man_dead', 'man_resist', 'bull', 'ody_look', 'ody_point', 'ody_shout', 'ody_offer',
         'p2/man_untie', 'p2/ody_kneel', 'p2/ody_sleep', 'p2/man_swim', 'p2/man_whisper', 'p3/eury_wary', 'p3/circe_wand']
SCY = ['scylla', 'charybdis', 'figtree', 'ody_helmet', 'ody_grief', 'ody_throw', 'ody_stand']
src = [os.path.join(CUT, f) for f in sorted(os.listdir(CUT)) if f.endswith('.png')] + [os.path.join(OLD, n + '.png') for n in REUSE]
src += [os.path.join(P, 'scylla', 'cut', n + '.png') for n in SCY] + [os.path.join(P, 'scylla', 'assets', 'head%d.webp' % i) for i in range(6)]
for s in src:
    n = os.path.splitext(os.path.basename(s))[0]
    if n == 'ody_stand': n = 'ody_arm'
    im = Image.open(s).convert('RGBA')
    if n in CROP_TOP: im = im.crop((0, int(im.height * CROP_TOP[n]), im.width, im.height))
    if n == 'helmsman':   # his grey hair and beard -> the figures' black (every figure is solid black)
        import numpy as np; a = np.array(im); rgb = a[..., :3].astype(int); mx, mn = rgb.max(-1), rgb.min(-1)
        m = (mx - mn < 30) & (mx > 70); a[m, :3] = 12; im = Image.fromarray(a)
    im = im.crop(im.getbbox())
    ring(fit(im, *SIZE.get(n, (700, 1300)))).save(os.path.join(OUT, n + '.webp'), 'WEBP', quality=92, method=6); print(n, im.size)
