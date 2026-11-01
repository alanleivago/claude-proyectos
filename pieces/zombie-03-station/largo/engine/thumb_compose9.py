"""K9 (margen del 9 PM, fachada entera, Ava al centro, pistola negra) + portada_short. Antes: K8 (K7 sin hueco en el separador, 9 PM junto al separador, entrada visible, pistola clara) + portada_short como la captura. Antes: K7 (K5 sin halo, Ava iluminada de frente, mas grande afuera) + portada_short. Antes: K4/K5/K6 (partida 9 PM exterior | 3:14 AM vestibulo, pose del usuario) + portada_short 1080x1920 (thumb_spec6.json).
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
    glass = ImageChops.subtract(b, r).point(lambda v: 255 if v > 25 else 0).filter(ImageFilter.MinFilter(9)).filter(ImageFilter.GaussianBlur(2))   # erosion: sin halo alrededor de Ava
    vg = Image.linear_gradient('L').resize(im.size).point(lambda v: 255 if v < 130 else max(0, 255 - (v - 130) * 6))
    glass = ImageChops.multiply(glass, vg)
    dark = Image.blend(im, ImageChops.multiply(im, Image.new('RGB', im.size, (95, 120, 190))), 0.6)
    dark = ImageEnhance.Brightness(dark).enhance(0.78)
    flash = Image.blend(im, ImageChops.screen(im, Image.new('RGB', im.size, (60, 80, 130))), 0.35)
    out = Image.composite(flash, dark, glass)
    # la cara y el cuerpo de Ava (no azules) quedan un poco mas claros que el fondo
    return ImageEnhance.Contrast(out).enhance(1.12)


def hud(state, scale=1.0):
    """panel CONDITION REAL del motor (film.js hud(), renderizado por hud_png.mjs a 118x66).
    Ancho final = 230*scale como antes. Escala entera con vecino mas cercano; si no es entera, x4 vecino y bajada suave."""
    im = Image.open(R / 'hud' / f'hud_{state.upper()}.png').convert('RGBA')
    tw = round(230 * scale); k = tw / im.width
    if abs(k - round(k)) < 0.08: return im.resize((im.width * round(k), im.height * round(k)), Image.NEAREST)
    big = im.resize((im.width * 4, im.height * 4), Image.NEAREST)
    return big.resize((tw, round(im.height * k)), Image.LANCZOS)

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
    im = Image.new('RGB', (W, H)); im.paste(right, (W // 2 - 40, 0))
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(0, 0), (W // 2 + 14, 0), (W // 2 - 14, H), (0, H)], fill=255)
    im.paste(left, (0, 0), m.crop((0, 0, left.width, H)))   # cada mitad llega hasta el separador: sin hueco
    d = ImageDraw.Draw(im)
    d.polygon([(W // 2 + 6, 0), (W // 2 + 22, 0), (W // 2 - 6, H), (W // 2 - 22, H)], fill=INK)
    d.polygon([(W // 2 + 10, 0), (W // 2 + 18, 0), (W // 2 - 10, H), (W // 2 - 18, H)], fill=(250, 248, 240))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    words(lay, '9 PM', 485, 14, 76, CREAM)
    words(lay, '3:14 AM', W // 2 + 418, 14, 76, RED)
    if pixel: lay = pixelate(lay)
    im.paste(lay, (0, 0), lay)
    for st, x in [('Fine', 14), ('Danger', W // 2 + 22)]:
        hp = hud(st, 0.68); im.paste(hp, (x, hud_y), hp)
    return im


ext, r3, vv = img('Lc'), img('Rk'), img('Vi')
L = dusk(crop(ext, 370, 0, 1020, 1080, (W // 2 + 40, H)))
Rt = storm(crop(r3, 690, 60, 935, 1012, (W // 2 + 40, H)))
k8 = split(L, Rt, pixel=True)  # K9
k8.save(OUT / 'miniatura_K9.png')

# portada vertical: misma composicion que la captura del usuario (puertas al fondo, Ava a la derecha, Ribbon), sin texto
V_ = crop(vv, 830, 0, 608, 1080, (1080, 1920))
V_ = ImageEnhance.Contrast(ImageOps.autocontrast(V_, cutoff=0.5)).enhance(1.08)   # tono de la captura: vestibulo iluminado, pared beige
V_ = Image.new('RGB', (1080, 1920), (8, 10, 16)); V_.paste(ImageEnhance.Contrast(ImageOps.autocontrast(crop(vv, 830, 0, 608, 1080, (1080, 1920)), cutoff=0.5)).enhance(1.08).crop((0, 0, 1080, 1840)), (0, 80))
fade = Image.linear_gradient('L').resize((1080, 380))
V_.paste(Image.new('RGB', (1080, 380), (8, 10, 16)), (0, 0), ImageOps.invert(fade))
hp = hud('Fine', 472 / 230); V_.paste(hp, ((1080 - hp.width) // 2, 228), hp)
V_.save(OUT / 'portada_short.png')

# review_K9: K9 completa, recortes 4x de cada Ava (cara, manos+pistola), short junto a la captura, versiones 168x94
REFP = Path(__file__).resolve().parents[4] / 'fuentes/miniaturas/ref_pose/ava_pose_usuario.jpg'
rv = Image.new('RGB', (2020, 1800), (24, 24, 24)); dr = ImageDraw.Draw(rv); fl = ImageFont.truetype(BLACK, 24)
rv.paste(k8, (10, 40)); dr.text((10, 6), 'K9 1280x720', font=fl, fill=(255, 255, 255))
def z(box, at, lab):
    c = k8.crop(box).resize(((box[2] - box[0]) * 4, (box[3] - box[1]) * 4), Image.NEAREST); rv.paste(c, at); dr.text((at[0], at[1] - 28), lab, font=fl, fill=(255, 255, 255))
ZOOMS = [((250, 255, 370, 375), (10, 830), 'cara 9 PM 4x'), ((955, 195, 1085, 325), (500, 830), 'cara 3:14 4x'),
         ((815, 330, 995, 440), (1040, 830), 'manos + pistola 4x'), ((150, 490, 430, 590), (10, 1380), 'manos 9 PM 4x')]
for b_, at, lab in ZOOMS: z(b_, at, lab)
rv.paste(k8.resize((168, 94), Image.LANCZOS), (1180, 1380)); dr.text((1180, 1350), '168x94', font=fl, fill=(255, 255, 255))
rv.paste(Image.open(REFP).convert('RGB').resize((330, 590)), (1320, 40)); dr.text((1320, 6), 'captura', font=fl, fill=(255, 255, 255))
rv.paste(V_.resize((332, 590), Image.LANCZOS), (1670, 40)); dr.text((1670, 6), 'short', font=fl, fill=(255, 255, 255))
rv.paste(V_.resize((94, 168), Image.LANCZOS), (1670, 650))
rv.save(OUT / 'review_K9.png')
print('ok')
