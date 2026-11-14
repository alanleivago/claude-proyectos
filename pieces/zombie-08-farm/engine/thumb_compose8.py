"""ep8 thumbnail, same recipe as the APPROVED station long thumbnail (largo/engine/thumb_compose9.py, K9):
split screen 6:42 AM farm by day (calm, Ava hands on hips) | 11:48 PM barn ajar at night (Ava in the user's key-art pose with the
black pistol, the thing in the gap), real engine HUD (hud_png.mjs) upscaled nearest, Arial Black time words pixelated.
python thumb_compose8.py RENDERS_DIR   (RENDERS_DIR = review/thumb with L.png, R.png, hud/)"""
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps
R = Path(sys.argv[1]); OUT = Path(__file__).resolve().parent.parent
W, H = 1280, 720
BLACK = 'C:/Windows/Fonts/ariblk.ttf'
CREAM, RED, INK = (246, 241, 230), (232, 52, 38), (40, 40, 44)
def img(n): return Image.open(R / f'{n}.png').convert('RGB')
def crop(im, x0, y0, w, h, size): return im.crop((x0, y0, x0 + w, y0 + h)).resize(size, Image.LANCZOS)
def day(im):
    im = ImageOps.autocontrast(im, cutoff=0.5).point(lambda v: int(255 * (v / 255) ** 0.92))
    im = Image.blend(im, ImageChops.multiply(im, Image.new('RGB', im.size, (255, 232, 196))), 0.18)
    return ImageEnhance.Color(im).enhance(1.12)
def night(im):
    im = ImageOps.autocontrast(im, cutoff=0.2)
    dark = Image.blend(im, ImageChops.multiply(im, Image.new('RGB', im.size, (90, 110, 190))), 0.55)
    dark = ImageEnhance.Brightness(dark).enhance(0.82)
    # Ava (warm skin/hair) stays a bit warmer than the blue night
    r, g, b = im.split(); warm = ImageChops.subtract(r, b).point(lambda v: 255 if v > 22 else 0).filter(ImageFilter.GaussianBlur(3))
    out = Image.composite(Image.blend(im, dark, 0.15), dark, warm)
    return ImageEnhance.Contrast(out).enhance(1.1)
def eyes(im):
    """the creature's eye in the barn gap: a soft sick-green glow on its own eye pixels (no new geometry)"""
    px = im.load(); w, h = im.size; pts = [(x, y) for y in range(int(h * 0.3), int(h * 0.75), 2) for x in range(int(w * 0.25), int(w * 0.55), 2)
           if px[x, y][1] > 70 and px[x, y][1] > px[x, y][0] + 6 and px[x, y][1] > px[x, y][2] + 20]
    if not pts: return im
    gl = Image.new('RGB', im.size, (0, 0, 0)); d = ImageDraw.Draw(gl)
    for x, y in pts: d.ellipse((x - 9, y - 9, x + 9, y + 9), fill=(150, 200, 80))
    return ImageChops.screen(im, gl.filter(ImageFilter.GaussianBlur(7)))
def hud(state, scale=1.0):
    im = Image.open(R / 'hud' / f'hud_{state.upper()}.png').convert('RGBA')
    tw = round(230 * scale); k = tw / im.width
    if abs(k - round(k)) < 0.08: return im.resize((im.width * round(k), im.height * round(k)), Image.NEAREST)
    big = im.resize((im.width * 4, im.height * 4), Image.NEAREST); return big.resize((tw, round(im.height * k)), Image.LANCZOS)
def words(lay, s, cx, y, size, fill):
    f = ImageFont.truetype(BLACK, size); sh = Image.new('RGBA', lay.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((cx + 6, y + 6), s, font=f, fill=(0, 0, 0, 150), anchor='ma', stroke_width=9, stroke_fill=(0, 0, 0, 150))
    lay.alpha_composite(sh.filter(ImageFilter.GaussianBlur(5))); ImageDraw.Draw(lay).text((cx, y), s, font=f, fill=fill, anchor='ma', stroke_width=9, stroke_fill=INK)
def pixelate(lay, k=6):
    sm = lay.resize((lay.width // k, lay.height // k), Image.BOX); sm.putalpha(sm.getchannel('A').point(lambda v: 255 if v > 100 else 0)); return sm.resize(lay.size, Image.NEAREST)
def split(left, right):
    im = Image.new('RGB', (W, H)); im.paste(right, (W // 2 - 40, 0))
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(0, 0), (W // 2 + 14, 0), (W // 2 - 14, H), (0, H)], fill=255)
    im.paste(left, (0, 0), m.crop((0, 0, left.width, H))); d = ImageDraw.Draw(im)
    d.polygon([(W // 2 + 6, 0), (W // 2 + 22, 0), (W // 2 - 6, H), (W // 2 - 22, H)], fill=INK)
    d.polygon([(W // 2 + 10, 0), (W // 2 + 18, 0), (W // 2 - 10, H), (W // 2 - 18, H)], fill=(250, 248, 240))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); words(lay, '6:42 AM', 430, 14, 74, CREAM); words(lay, '11:48 PM', W // 2 + 400, 14, 74, RED)
    lay = pixelate(lay); im.paste(lay, (0, 0), lay)
    for st, x in [('Fine', 14), ('Danger', W // 2 + 22)]:
        hp = hud(st, 0.68); im.paste(hp, (x, 14), hp)
    return im
L_ = day(crop(img('L'), 300, 0, 1020, 1080, (W // 2 + 40, H)))
R_ = night(eyes(crop(img('R'), 560, 40, 1010, 1040, (W // 2 + 40, H))))

k = split(L_, R_); k.save(OUT / 'miniatura_1280x720.png')
# review: full + 4x crops (faces, hands + pistol) + 168x94
rv = Image.new('RGB', (2020, 1500), (24, 24, 24)); dr = ImageDraw.Draw(rv); fl = ImageFont.truetype(BLACK, 24)
rv.paste(k, (10, 40)); dr.text((10, 6), 'miniatura 1280x720', font=fl, fill=(255, 255, 255))
def z(box, at, lab):
    c = k.crop(box).resize(((box[2] - box[0]) * 4, (box[3] - box[1]) * 4), Image.NEAREST); rv.paste(c, at); dr.text((at[0], at[1] - 28), lab, font=fl, fill=(255, 255, 255))
for b_, at, lab in [((340, 270, 450, 380), (10, 830), 'face AM 4x'), ((1050, 280, 1160, 390), (470, 830), 'face PM 4x'), ((955, 405, 1135, 505), (930, 830), 'hands + pistol 4x')]: z(b_, at, lab)
rv.paste(k.resize((168, 94), Image.LANCZOS), (1320, 60)); dr.text((1320, 30), '168x94', font=fl, fill=(255, 255, 255))
rv.save(OUT / 'review' / 'review_thumb.png'); print('ok')
