"""Miniaturas G/H/I/J (Ava de cerca, luminosas) desde thumb.mjs + thumb_post.js (thumb_spec3.json).
python thumb_compose3.py RENDERS_DIR  -> ../miniatura_G/H/I/J.png + ../miniaturas_compare3.png"""
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

R = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent
W, H = 1280, 720
IMPACT = 'C:/Windows/Fonts/impact.ttf'
SERIF = 'C:/Windows/Fonts/timesbd.ttf'
RED = (226, 30, 30)


def load(name, crop=None):
    im = Image.open(R / f'{name}.png').convert('RGB')
    if crop:  # (x0, y0, ancho) en px de 1920x1080, alto = ancho*9/16
        x, y, w = crop
        im = im.crop((x, y, x + w, y + round(w * 9 / 16)))
    return im.resize((W, H), Image.LANCZOS)


def grade(im, con=1.18, sat=1.25, bri=1.05):
    im = ImageEnhance.Contrast(im).enhance(con)
    im = ImageEnhance.Color(im).enhance(sat)
    return ImageEnhance.Brightness(im).enhance(bri)


def vignette(im, k=0.55):
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).ellipse((-W * 0.15, -H * 0.2, W * 1.15, H * 1.2), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(160))
    dark = ImageEnhance.Brightness(im).enhance(1 - k)
    return Image.composite(im, dark, m)


def text(im, s, xy, size, fill=(255, 255, 255), font=IMPACT, stroke=10, anchor='la', shadow=8):
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(font, size)
    if shadow:
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh).text((xy[0] + shadow, xy[1] + shadow), s, font=f, fill=(0, 0, 0, 200), anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0, 200))
        im.paste(sh.filter(ImageFilter.GaussianBlur(4)), (0, 0), sh.filter(ImageFilter.GaussianBlur(4)))
    d.text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0))
    return d.textbbox(xy, s, font=f, anchor=anchor, stroke_width=stroke)


def tag(im, s, xy, size=54, bg=RED):
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(IMPACT, size)
    x0, y0, x1, y1 = d.textbbox(xy, s, font=f)
    d.rectangle((x0 - 16, y0 - 12, x1 + 16, y1 + 12), fill=bg, outline=(0, 0, 0), width=5)
    d.text(xy, s, font=f, fill=(255, 255, 255))


def glow(im, box, color=RED, r=26):
    """Halo rojo alrededor de una zona (marca al personaje: regla 'personaje obvio')."""
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).ellipse(box, outline=255, width=10)
    m = m.filter(ImageFilter.GaussianBlur(r / 3))
    return Image.composite(Image.new('RGB', (W, H), color), im, m)


PIX = str(Path(__file__).resolve().parent / 'fonts' / 'PixelifySans.ttf')




def bright(im, gam=0.78, bri=1.08):
    """exposicion alta: sombras levantadas (gamma), contraste fuerte, nada de negros turbios."""
    im = ImageOps.autocontrast(im, cutoff=(0.5, 0.5))
    im = im.point(lambda v: int(255 * (v / 255) ** gam))
    im = grade(im, 1.12, 1.18, bri)
    return vignette(im, 0.18)


def cutout(name, box, scale_h, anchor):
    """Ava sobre verde -> RGBA recortado; box = recorte en 1920x1080; se escala a scale_h px de alto."""
    im = Image.open(R / f'{name}.png').convert('RGB').crop(box)
    r_, g_, b_ = im.split()
    key = Image.eval(ImageChops.subtract(g_, ImageChops.lighter(r_, b_)), lambda v: 255 if v > 60 else 0)
    alpha = ImageOps.invert(key).filter(ImageFilter.MinFilter(3))
    im = im.convert('RGBA'); im.putalpha(alpha)
    k = scale_h / im.height
    return im.resize((round(im.width * k), scale_h), Image.LANCZOS), anchor


# G: perfil apuntando hacia el cristal; Vickers grande y desenfocado detras (render aislado de Ava + plano de Vickers).
bgv = load('vf4', (300, 0, 1500))
bgv = bright(bgv.filter(ImageFilter.GaussianBlur(9)), 0.85, 1.1)
ava, _ = cutout('G_ava', (560, 180, 1300, 1080), 960, None)
g = bgv.copy(); g.paste(ava, (-60, 20), ava)
g = bright(g, 0.95, 1.02)
text(g, '3:14 AM', (1250, 20), 150, fill=RED, anchor='ra')
g.save(OUT / 'miniatura_G.png')

# H: pistola alzada junto a la cara, mira a camara; horda + Vickers + Ribbon detras.
h = bright(load('H3', (0, 0, 1920)))
text(h, 'LET HIM', (1250, 14), 140, anchor='ra')
text(h, 'IN?', (1250, 150), 140, fill=RED, anchor='ra')
h.save(OUT / 'miniatura_H.png')

# I: sobre el hombro, 3/4 de espaldas mirando a camara; cristal y horda delante.
i_ = bright(load('I4', (280, 0, 1520)))
text(i_, "DON'T", (1250, 14), 140, anchor='ra')
text(i_, 'OPEN', (1250, 150), 140, fill=RED, anchor='ra')
i_.save(OUT / 'miniatura_I.png')

# J: luces encendidas: vestibulo blanco, Ava en shock pero lista con la pistola, Vickers en el cristal.
j = bright(load('J3', (0, 0, 1920)), 0.85, 1.05)
text(j, 'LET HIM', (1250, 14), 140, anchor='ra')
text(j, 'IN?', (1250, 150), 140, fill=RED, anchor='ra')
j.save(OUT / 'miniatura_J.png')

ims = [g, h, i_, j]
sheet = Image.new('RGB', (640 * 4 + 50, 360 + 180 + 110), (24, 24, 24))
dd = ImageDraw.Draw(sheet)
lab = ImageFont.truetype(IMPACT, 30)
for n_, (im, n) in enumerate(zip(ims, 'GHIJ')):
    x = 10 + n_ * 650
    dd.text((x, 6), n, font=lab, fill=(255, 255, 255))
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (x, 44))
    sheet.paste(im.resize((320, 180), Image.LANCZOS), (x, 44 + 360 + 20))
    sheet.paste(im.resize((168, 94), Image.LANCZOS), (x + 340, 44 + 360 + 20))
sheet.save(OUT / 'miniaturas_compare3.png')
print('ok')
