"""K4/K5/K6 (partida 9 PM exterior | 3:14 AM vestibulo, pose del usuario) + portada_short 1080x1920 (thumb_spec6.json).
python thumb_compose6.py RENDERS_DIR"""
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

R = Path(sys.argv[1]); OUT = Path(__file__).resolve().parent.parent
W, H = 1280, 720
BLACK = 'C:/Windows/Fonts/ariblk.ttf'
PIX = str(Path(__file__).resolve().parent / 'fonts' / 'PixelifySans.ttf')
CREAM, RED, INK = (246, 241, 230), (232, 52, 38), (40, 40, 44)
REF = Path(__file__).resolve().parents[4] / 'fuentes/miniaturas/competencia/ref_2XYr2AEHDGI/2XYr2AEHDGI.png'


def img(n): return Image.open(R / f'{n}.png').convert('RGB')


def crop(im, x0, y0, w, h, size): return im.crop((x0, y0, x0 + w, y0 + h)).resize(size, Image.LANCZOS)


def warm(im):   # 9 PM: calido y tranquilo
    im = ImageOps.autocontrast(im, cutoff=0.5).point(lambda v: int(255 * (v / 255) ** 0.88))
    im = Image.blend(im, ImageChops.multiply(im, Image.new('RGB', im.size, (255, 215, 160))), 0.25)
    return ImageEnhance.Color(im).enhance(1.1)


def dusk(im):   # 9 PM: cielo de atardecer calido arriba (sin lluvia), luz calida
    im = warm(im)
    sky = Image.linear_gradient('L').resize(im.size).point(lambda v: max(0, 255 - v * 4))
    grad = Image.new('RGB', im.size, (236, 140, 92))
    return Image.composite(Image.blend(im, ImageChops.screen(im, grad), 0.55), im, sky)


def storm(im):   # 3:14 AM: oscuro y azul + relampago en el cristal
    im = ImageOps.autocontrast(im, cutoff=0.5)
    r, g, b = im.split()
    glass = ImageChops.subtract(b, r).point(lambda v: 255 if v > 25 else int(v * 8)).filter(ImageFilter.GaussianBlur(6))
    vg = Image.linear_gradient('L').resize(im.size).point(lambda v: 255 if v < 130 else max(0, 255 - (v - 130) * 6))
    glass = ImageChops.multiply(glass, vg)
    dark = Image.blend(im, ImageChops.multiply(im, Image.new('RGB', im.size, (95, 120, 190))), 0.6)
    dark = ImageEnhance.Brightness(dark).enhance(0.78)
    flash = Image.blend(im, ImageChops.screen(im, Image.new('RGB', im.size, (90, 115, 170))), 0.6)
    out = Image.composite(flash, dark, glass)
    # la cara y el cuerpo de Ava (no azules) quedan un poco mas claros que el fondo
    return ImageEnhance.Contrast(out).enhance(1.12)


def hud(state, scale=1.0):
    """panel CONDITION de RE2 pequeno (pixel): STATION arriba, ECG verde/rojo, palabra de estado."""
    w, h = int(230 * scale), int(118 * scale)
    p = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(p)
    col = {'Fine': (98, 240, 90), 'Danger': (240, 58, 38)}[state]
    d.rectangle((0, 0, w - 1, h - 1), fill=(150, 152, 158, 235), outline=(70, 72, 78), width=max(2, int(3 * scale)))
    for y in range(4, h, int(5 * scale) or 1): d.line((3, y, w - 4, y), fill=(170, 172, 178, 235))
    f = ImageFont.truetype(PIX, int(20 * scale))
    d.rectangle((int(8 * scale), int(5 * scale), int(100 * scale), int(28 * scale)), fill=(30, 40, 90))
    d.text((int(12 * scale), int(5 * scale)), 'STATION', font=f, fill=(225, 235, 255))
    bx0, by0, bx1, by1 = int(8 * scale), int(32 * scale), w - int(8 * scale), int(88 * scale)
    d.rectangle((bx0, by0, bx1, by1), fill=(10, 30, 14), outline=col, width=max(2, int(2 * scale)))
    mid = (by0 + by1) // 2 - int(6 * scale); pts = []
    for i in range(bx0 + 4, bx1 - 4, max(1, int(2 * scale))):
        k = (i - bx0) % int(70 * scale); y = mid
        if int(20 * scale) < k < int(24 * scale): y = mid - int(16 * scale)
        elif int(24 * scale) <= k < int(28 * scale): y = mid + int(12 * scale)
        pts.append((i, y))
    d.line(pts, fill=col, width=max(2, int(2 * scale)))
    d.text((bx1 - int(6 * scale), by1 - int(4 * scale)), state, font=ImageFont.truetype(PIX, int(26 * scale)), fill=col, anchor='rd')
    d.text((int(10 * scale), int(90 * scale)), 'CONDITION', font=f, fill=(230, 232, 236))
    return p


def words(lay, s, cx, y, size, fill):
    f = ImageFont.truetype(BLACK, size)
    sh = Image.new('RGBA', lay.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((cx + 6, y + 6), s, font=f, fill=(0, 0, 0, 150), anchor='ma', stroke_width=9, stroke_fill=(0, 0, 0, 150))
    lay.alpha_composite(sh.filter(ImageFilter.GaussianBlur(5)))
    ImageDraw.Draw(lay).text((cx, y), s, font=f, fill=fill, anchor='ma', stroke_width=9, stroke_fill=INK)


def pixelate(lay, k=6):
    sm = lay.resize((lay.width // k, lay.height // k), Image.BOX)
    sm.putalpha(sm.getchannel('A').point(lambda v: 255 if v > 100 else 0))
    return sm.resize(lay.size, Image.NEAREST)


def split(left, right, pixel=False, hud_y=14):
    im = Image.new('RGB', (W, H)); im.paste(left, (0, 0)); im.paste(right, (W // 2, 0))
    d = ImageDraw.Draw(im)
    d.polygon([(W // 2 + 6, 0), (W // 2 + 22, 0), (W // 2 - 6, H), (W // 2 - 22, H)], fill=INK)
    d.polygon([(W // 2 + 10, 0), (W // 2 + 18, 0), (W // 2 - 10, H), (W // 2 - 18, H)], fill=(250, 248, 240))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    words(lay, '9 PM', 410, 10, 86, CREAM)
    words(lay, '3:14 AM', W // 2 + 418, 14, 76, RED)
    if pixel: lay = pixelate(lay)
    im.paste(lay, (0, 0), lay)
    for st, x in [('Fine', 14), ('Danger', W // 2 + 22)]:
        hp = hud(st, 0.68); im.paste(hp, (x, hud_y), hp)
    return im


ext, r3 = img('L_dry'), img('R_glass')
L = dusk(crop(ext, 400, 0, 960, 1080, (W // 2, H)))
Rt = storm(crop(r3, 720, 60, 900, 1012, (W // 2, H)))
k4 = split(L, Rt); k5 = split(L, Rt, pixel=True)
Rb = storm(crop(r3, 820, 200, 720, 810, (W // 2, H)))
k6 = split(L, Rb)
for n, im in [('K4', k4), ('K5', k5), ('K6', k6)]: im.save(OUT / f'miniatura_{n}.png')

# portada vertical para Shorts: HUD arriba, Ava con la pose, horda detras
V_ = Image.new('RGB', (1080, 1920), (14, 18, 30))
body = storm(crop(r3, 770, 0, 680, 1080, (1080, 1715)))
V_.paste(body, (0, 1920 - 1715))
g = Image.linear_gradient('L').resize((1080, 220))
V_.paste(Image.new('RGB', (1080, 220), (14, 18, 30)), (0, 1920 - 1715), ImageOps.invert(g))
hp = hud('Danger', 1.2); V_.paste(hp, (40, 40), hp)
lay = Image.new('RGBA', V_.size, (0, 0, 0, 0))
words(lay, "DON'T OPEN", 540, 230, 120, CREAM)
V_.paste(lay, (0, 0), lay)
V_.save(OUT / 'portada_short.png')

ims = [('REF', Image.open(REF).convert('RGB')), ('K4', k4), ('K5', k5), ('K6', k6)]
sh = Image.new('RGB', (640 * 4 + 50, 360 + 94 + 80), (24, 24, 24)); dd = ImageDraw.Draw(sh)
for i, (n, im) in enumerate(ims):
    x = 10 + i * 650
    dd.text((x, 6), n, font=ImageFont.truetype(BLACK, 26), fill=(255, 255, 255))
    sh.paste(im.resize((640, 360), Image.LANCZOS), (x, 44)); sh.paste(im.resize((168, 94), Image.LANCZOS), (x, 44 + 360 + 16))
sh.save(OUT / 'miniaturas_compare7.png')
print('ok')
