# bake the 5px orange ring into the new p1 layers (odyssey/cut + troya-bf reuse) and save webp in assets/ (persons 700 px high)
import os
from PIL import Image, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUT = os.path.join(ROOT, '..', 'odyssey', 'cut'); TROYA = os.path.join(ROOT, '..', 'troya-bf', 'assets'); OUT = os.path.join(ROOT, 'assets')
RING = (229, 125, 54)
def ring(im, px=5, pad=8):
    im = im.convert('RGBA'); w, h = im.size
    big = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); big.paste(im, (pad, pad))
    a = big.split()[3].point(lambda v: 255 if v > 40 else 0)
    a = a.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.GaussianBlur(0.8))
    base = Image.new('RGBA', big.size, RING + (0,)); base.putalpha(a); base.alpha_composite(big); return base
def fit(im, hmax=700, wmax=1300):
    w, h = im.size; s = min(1, hmax / h, wmax / w); return im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im
NEW = 'trojan_walk trojan_pull trojan_dance soldier_rope woman_plead athena man_sack ciconian bull man_drink man_dead achilles_dead lotus lotus_eater man_lotus ody_drag man_resist shade ody_beggar ody_bow suitor king_a king_b ody_point penelope soldier_torch'.split()
for n in NEW:
    im = Image.open(os.path.join(CUT, n + '.png')).convert('RGBA'); im = im.crop(im.getbbox())
    ring(fit(im)).save(os.path.join(OUT, n + '.webp'), 'WEBP', quality=92, method=6); print(n)
tw = Image.open(os.path.join(CUT, 'troy_walls.png')).convert('RGBA'); tw.save(os.path.join(OUT, 'troy_walls.webp'), 'WEBP', quality=92, method=6)
for n in ['trojan_horse', 'temple', 'soldier_attack', 'soldier_spear', 'sleeping_trojan', 'odysseus_think', 'zeus', 'troy_city', 'gate_door']:
    im = Image.open(os.path.join(TROYA, n + '.png')).convert('RGBA'); im = im.crop(im.getbbox())
    out = im if n in ('troy_city', 'gate_door') else ring(fit(im, 900, 1300))
    out.save(os.path.join(OUT, n + '.webp'), 'WEBP', quality=92, method=6); print(n, out.size)
