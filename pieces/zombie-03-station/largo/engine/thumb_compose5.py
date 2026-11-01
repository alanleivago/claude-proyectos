"""Miniaturas K1/K2/K3: estilo pantalla partida de NobodyGetsIn (DAY 1 | DAY 30) con Ava (thumb_spec5.json + J2e).
python thumb_compose5.py RENDERS_DIR -> ../miniatura_K1/K2/K3.png + ../miniaturas_compare6.png"""
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

R = Path(sys.argv[1]); OUT = Path(__file__).resolve().parent.parent
W, H = 1280, 720
BLACK = 'C:/Windows/Fonts/ariblk.ttf'
CREAM, ORANGE, INK = (246, 241, 230), (232, 67, 43), (40, 40, 44)
REF = Path(__file__).resolve().parents[4] / 'fuentes/miniaturas/competencia/ref_2XYr2AEHDGI/2XYr2AEHDGI.png'


def half(name, x0, y0=165, w=720):   # recorte w x (w*9/8) -> 640x720: Ava abajo (cabeza ~30 %), sin pies, texto arriba libre
    return Image.open(R / f'{name}.png').convert('RGB').crop((x0, y0, x0 + w, y0 + w * 9 // 8)).resize((W // 2, H), Image.LANCZOS)


def calm(im):   # izquierda: clara, pastel, poco contraste (como el aula de dia)
    im = ImageOps.autocontrast(im, cutoff=0.5).point(lambda v: int(255 * (v / 255) ** 0.85))
    return ImageEnhance.Color(ImageEnhance.Contrast(im).enhance(0.95)).enhance(0.9)


def night(im, k=0.3, gam=1.0):   # derecha: gris azulado con bruma, mas oscura, la cara sigue legible
    im = ImageOps.autocontrast(im, cutoff=0.5).point(lambda v: int(255 * (v / 255) ** gam))
    im = ImageEnhance.Color(im).enhance(0.8)
    im = Image.blend(im, ImageChops.multiply(im, Image.new('RGB', im.size, (150, 170, 215))), k)
    haze = Image.new('RGB', im.size, (70, 78, 92))
    return Image.blend(im, haze, 0.12)


def words(lay, s, cx, size, fill):
    d = ImageDraw.Draw(lay); f = ImageFont.truetype(BLACK, size)
    sh = Image.new('RGBA', lay.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((cx + 6, 34), s, font=f, fill=(0, 0, 0, 150), anchor='ma', stroke_width=9, stroke_fill=(0, 0, 0, 150))
    sh = sh.filter(ImageFilter.GaussianBlur(5)); lay.alpha_composite(sh)
    d.text((cx, 28), s, font=f, fill=fill, anchor='ma', stroke_width=9, stroke_fill=INK)


def make(left, right, pixel=False):
    im = Image.new('RGB', (W, H)); im.paste(left, (0, 0)); im.paste(right, (W // 2, 0))
    d = ImageDraw.Draw(im)   # separador blanco algo inclinado con borde oscuro
    d.polygon([(W // 2 + 6, 0), (W // 2 + 22, 0), (W // 2 - 6, H), (W // 2 - 22, H)], fill=INK)
    d.polygon([(W // 2 + 10, 0), (W // 2 + 18, 0), (W // 2 - 10, H), (W // 2 - 18, H)], fill=(250, 248, 240))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    words(lay, '9 PM', W // 4, 128, CREAM)
    words(lay, '3:14 AM', 3 * W // 4, 112, ORANGE)
    if pixel:
        k = 6; sm = lay.resize((W // k, H // k), Image.BOX)
        sm.putalpha(sm.getchannel('A').point(lambda v: 255 if v > 100 else 0))
        lay = sm.resize((W, H), Image.NEAREST)
    im.paste(lay, (0, 0), lay)
    return im


L = calm(half('L_glass', 540))
k1 = make(L, night(half('R_fifty', 520), 0.25, 0.8))
k2 = make(L, night(half('R_fifty', 520), 0.25, 0.8), pixel=True)
k3 = make(L, night(half('J2e', 520), 0.55))
for n, im in [('K1', k1), ('K2', k2), ('K3', k3)]: im.save(OUT / f'miniatura_{n}.png')

ims = [('REF', Image.open(REF).convert('RGB')), ('K1', k1), ('K2', k2), ('K3', k3)]
sh = Image.new('RGB', (640 * 4 + 50, 360 + 94 + 80), (24, 24, 24)); dd = ImageDraw.Draw(sh)
for i, (n, im) in enumerate(ims):
    x = 10 + i * 650
    dd.text((x, 6), n, font=ImageFont.truetype(BLACK, 26), fill=(255, 255, 255))
    sh.paste(im.resize((640, 360), Image.LANCZOS), (x, 44)); sh.paste(im.resize((168, 94), Image.LANCZOS), (x, 44 + 360 + 16))
sh.save(OUT / 'miniaturas_compare6.png')
print('ok')
