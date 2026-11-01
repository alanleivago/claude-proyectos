"""Miniatura J2/J3 (J con Ribbon, pose de H, REC) desde thumb.mjs + thumb_post.js (thumb_spec4.json).
python thumb_compose4.py RENDERS_DIR  -> ../miniatura_J2/J3.png + ../miniaturas_compare4.png"""
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


PIX = str(Path(__file__).resolve().parent / 'fonts' / 'PixelifySans.ttf')


def rec(im, stamp):
    d = ImageDraw.Draw(im)
    for x, y, sx, sy in [(36, 36, 1, 1), (1244, 36, -1, 1), (36, 684, 1, -1), (1244, 684, -1, -1)]:
        d.line((x, y, x + 100 * sx, y), fill=(240, 240, 240), width=7); d.line((x, y, x, y + 72 * sy), fill=(240, 240, 240), width=7)
    pf = ImageFont.truetype(PIX, 40)
    d.ellipse((64, 616, 96, 648), fill=RED); d.text((108, 610), 'REC', font=pf, fill=(240, 240, 240))
    d.text((1214, 610), stamp, font=pf, fill=(240, 240, 240), anchor='ra')



def base():
    im = ImageOps.autocontrast(load('J2e', (0, 0, 1920)), cutoff=(0.5, 0.5))
    im = im.point(lambda v: int(255 * (v / 255) ** 0.93))   # entre E (oscura) y J (0.85, muy clara)
    im = grade(im, 1.14, 1.15, 0.97)
    im = vignette(im, 0.28)
    rec(im, 'CAM 01  03:14 AM')
    return im


j2 = base()
text(j2, 'POLICE', (1250, 10), 160, anchor='ra')
text(j2, 'STATION', (1250, 170), 160, fill=RED, anchor='ra')
j2.save(OUT / 'miniatura_J2.png')

j3 = base()
text(j3, "DON'T", (1250, 10), 160, anchor='ra')
text(j3, 'OPEN', (1250, 170), 160, fill=RED, anchor='ra')
j3.save(OUT / 'miniatura_J3.png')

j4 = base()
text(j4, '3:14', (1250, 10), 170, anchor='ra')
text(j4, 'AM', (1250, 180), 170, fill=RED, anchor='ra')
j4.save(OUT / 'miniatura_J4.png')

# versiones con el texto pixelado (retro): capa de texto a 1/7, reescalada con vecino mas cercano
def px_words(lines, k=7):
    im = base()
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for s_, xy, size, fill in lines:
        text(lay, s_, xy, size, fill=fill, anchor='ra')
    small = lay.resize((W // k, H // k), Image.BOX)
    a_ = small.getchannel('A').point(lambda v: 255 if v > 100 else 0)
    small.putalpha(a_)
    big = small.resize((W // k * k, H // k * k), Image.NEAREST)
    im.paste(big, (0, 0), big)
    return im


pxs = []
for name, lines in [('J2px', [('POLICE', (1250, 10), 160, (255, 255, 255)), ('STATION', (1250, 170), 160, RED)]),
                    ('J3px', [("DON'T", (1250, 10), 160, (255, 255, 255)), ('OPEN', (1250, 170), 160, RED)]),
                    ('J4px', [('3:14', (1250, 10), 170, (255, 255, 255)), ('AM', (1250, 180), 170, RED)])]:
    im = px_words(lines); im.save(OUT / f'miniatura_{name}.png'); pxs.append((name, im))
sh = Image.new('RGB', (640 * 3 + 40, 360 + 94 + 80), (24, 24, 24)); d5 = ImageDraw.Draw(sh)
for n_, (name, im) in enumerate(pxs):
    x = 10 + n_ * 650
    d5.text((x, 6), name, font=ImageFont.truetype(IMPACT, 30), fill=(255, 255, 255))
    sh.paste(im.resize((640, 360), Image.LANCZOS), (x, 44)); sh.paste(im.resize((168, 94), Image.LANCZOS), (x, 44 + 360 + 16))
sh.save(OUT / 'miniaturas_compare5.png')

ims = [Image.open(OUT / 'miniatura_J.png').convert('RGB'), j2, j3]
sheet = Image.new('RGB', (640 * 3 + 40, 360 + 180 + 110), (24, 24, 24))
dd = ImageDraw.Draw(sheet)
lab = ImageFont.truetype(IMPACT, 30)
for n_, (im, n) in enumerate(zip(ims, ['J', 'J2', 'J3'])):
    x = 10 + n_ * 650
    dd.text((x, 6), n, font=lab, fill=(255, 255, 255))
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (x, 44))
    sheet.paste(im.resize((320, 180), Image.LANCZOS), (x, 44 + 360 + 20))
    sheet.paste(im.resize((168, 94), Image.LANCZOS), (x + 340, 44 + 360 + 20))
sheet.save(OUT / 'miniaturas_compare4.png')
print('ok')
