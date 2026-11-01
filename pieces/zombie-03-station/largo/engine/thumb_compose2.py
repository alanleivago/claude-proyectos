"""Miniaturas D/E/F (Ava heroina de cuerpo entero, pistola) desde thumb.mjs + thumb_post.js (thumb_spec2.json).
python thumb_compose2.py RENDERS_DIR  -> ../miniatura_D/E/F.png + ../miniaturas_compare2.png"""
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


def mood(im, k=1.0):
    """noche RE: sombras azuladas, contraste alto, cielo/techo oscurecido arriba para el texto."""
    im = ImageOps.autocontrast(im, cutoff=(1, 0.5))
    im = grade(im, 1.15, 1.2, 0.92)
    blue = Image.new('RGB', (W, H), (40, 70, 130))
    im = Image.blend(im, ImageChops.multiply(im, blue.point(lambda v: min(255, v + 150))), 0.35 * k)
    g = Image.linear_gradient('L').resize((W, H)).point(lambda v: int(255 * min(1, v / 255 * 1.0 + 0.35)))
    im = Image.composite(im, ImageEnhance.Brightness(im).enhance(0.45), g)
    return vignette(im, 0.45)


def rec(im, stamp):
    d = ImageDraw.Draw(im)
    for x, y, sx, sy in [(36, 36, 1, 1), (1244, 36, -1, 1), (36, 684, 1, -1), (1244, 684, -1, -1)]:
        d.line((x, y, x + 100 * sx, y), fill=(240, 240, 240), width=7); d.line((x, y, x, y + 72 * sy), fill=(240, 240, 240), width=7)
    pf = ImageFont.truetype(PIX, 40)
    d.ellipse((64, 616, 96, 648), fill=RED); d.text((108, 610), 'REC', font=pf, fill=(240, 240, 240))
    d.text((1214, 610), stamp, font=pf, fill=(240, 240, 240), anchor='ra')


# D: Ava de perfil, cuerpo entero, apunta con las dos manos a Vickers tras el cristal; Ribbon ladra. Texto arriba a la derecha.
d_ = mood(load('D11', (0, 100, 1720)))
text(d_, '3:14 AM', (1250, 20), 150, fill=RED, anchor='ra')
d_.save(OUT / 'miniatura_D.png')

# E: pose de portada RE (pistola alzada junto a la cara), mira a camara; detras el cristal con la horda y Vickers.
e = mood(load('E10', (160, 0, 1700)))
text(e, 'LET HIM', (1250, 14), 140, anchor='ra')
text(e, 'IN?', (1250, 150), 140, fill=RED, anchor='ra')
e.save(OUT / 'miniatura_E.png')

# F: marco de camara REC (refs PS1); Ava a la derecha apunta a Vickers, Ribbon en medio.
f = mood(load('F9', (200, 120, 1600)), 1.3)
text(f, "DON'T", (70, 60), 140, anchor='la')
text(f, 'OPEN', (70, 196), 140, fill=RED, anchor='la')
rec(f, 'CAM 01  03:14 AM')
f.save(OUT / 'miniatura_F.png')

ims = [d_, e, f]
sheet = Image.new('RGB', (640 * 3 + 40, 360 + 180 + 110), (24, 24, 24))
dd = ImageDraw.Draw(sheet)
lab = ImageFont.truetype(IMPACT, 30)
for i, (im, n) in enumerate(zip(ims, 'DEF')):
    x = 10 + i * 650
    dd.text((x, 6), n, font=lab, fill=(255, 255, 255))
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (x, 44))
    sheet.paste(im.resize((320, 180), Image.LANCZOS), (x, 44 + 360 + 20))
    sheet.paste(im.resize((168, 94), Image.LANCZOS), (x + 340, 44 + 360 + 20))
sheet.save(OUT / 'miniaturas_compare2.png')
print('ok')
