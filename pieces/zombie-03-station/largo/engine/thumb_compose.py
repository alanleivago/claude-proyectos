"""Miniaturas A/B/C 1280x720 a partir de los fotogramas limpios de thumb.mjs (thumb_spec.json).
python thumb_compose.py RENDERS_DIR  -> ../miniatura_A/B/C.png + ../miniaturas_compare.png"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

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


# A: primer plano de Ava asustada + Vickers y la horda tras el cristal. Texto arriba a la derecha (zona vacia del cristal).
a = vignette(grade(load('a9', (60, 0, 1800))), 0.5)
text(a, "DON'T", (1240, 18), 168, anchor='ra')
text(a, 'OPEN', (1240, 176), 168, fill=RED, anchor='ra')
tag(a, '3:14 AM', (560, 30), 50)
a.save(OUT / 'miniatura_A.png')

# B: camara de seguridad (refs HawkesByte / AlexPalex: un solo monstruo PS1 enorme + marco REC; NobodyGetsIn: zombi en el cristal).
PIX = str(Path(__file__).resolve().parent / 'fonts' / 'PixelifySans.ttf')
b = load('vf4', (520, 0, 1100))
b = ImageOps.autocontrast(ImageEnhance.Color(b).enhance(0.6), cutoff=(6, 1))
b = b.point(lambda v: int(255 * (v / 255) ** 1.5))
b = vignette(grade(b, 1.1, 1.1, 1.0), 0.75)
d = ImageDraw.Draw(b)
for x, y, sx, sy in [(40, 40, 1, 1), (1240, 40, -1, 1), (40, 680, 1, -1), (1240, 680, -1, -1)]:
    d.line((x, y, x + 110 * sx, y), fill=(240, 240, 240), width=8); d.line((x, y, x, y + 80 * sy), fill=(240, 240, 240), width=8)
pf = ImageFont.truetype(PIX, 46)
d.ellipse((72, 70, 108, 106), fill=RED); d.text((122, 64), 'REC', font=pf, fill=(240, 240, 240))
d.text((1210, 64), 'CAM 01  LOBBY', font=pf, fill=(240, 240, 240), anchor='ra')
d.text((1210, 616), '03:14 AM', font=pf, fill=(240, 240, 240), anchor='ra')
text(b, 'LET HIM', (60, 150), 150, anchor='la')
text(b, 'IN?', (60, 300), 150, fill=RED, anchor='la')
b.save(OUT / 'miniatura_B.png')

# C: pantalla partida 9 PM | 3 AM (formula DAY 1 | DAY 30 de NobodyGetsIn, 14x y 8x su mediana): Ava tranquila -> el policia zombi y la horda.
left = grade(load('seven', (900, 120, 1000)), 1.12, 1.15, 1.08)
right = grade(load('s_fudge', (0, 0, 1920)), 1.2, 1.2, 1.02)
c = Image.new('RGB', (W, H))
c.paste(left.crop((W // 4, 0, W // 4 + W // 2, H)), (0, 0))
c.paste(right.crop((50, 0, 50 + W // 2, H)), (W // 2, 0))
c = vignette(c, 0.3)
ImageDraw.Draw(c).polygon([(W // 2 - 4, 0), (W // 2 + 10, 0), (W // 2 + 4, H), (W // 2 - 10, H)], fill=(255, 255, 255))
text(c, '9 PM', (W // 4, 14), 150, anchor='ma')
text(c, '3 AM', (3 * W // 4, 14), 150, fill=RED, anchor='ma')
c.save(OUT / 'miniatura_C.png')

# hoja comparativa: tamano completo (fila 1, a 640) + tamano movil 320x180 (fila 2)
ims = [a, b, c]
sheet = Image.new('RGB', (640 * 3 + 40, 360 + 180 + 110), (24, 24, 24))
d = ImageDraw.Draw(sheet)
lab = ImageFont.truetype(IMPACT, 30)
for i, (im, n) in enumerate(zip(ims, 'ABC')):
    x = 10 + i * 650
    d.text((x, 6), n, font=lab, fill=(255, 255, 255))
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (x, 44))
    sheet.paste(im.resize((320, 180), Image.LANCZOS), (x, 44 + 360 + 20))
    sheet.paste(im.resize((168, 94), Image.LANCZOS), (x + 340, 44 + 360 + 20))
sheet.save(OUT / 'miniaturas_compare.png')
print('ok')
