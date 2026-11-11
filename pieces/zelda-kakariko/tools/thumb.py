# Thumbnail: the calm village on top, the ground torn open under it, a giant Dead Hand and guillotines in the dark below,
# tiny Link at the edge, big stitched text. 1080x1920 (Shorts cover) + 1280x720 (search/home).
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np
A = 'assets/'; W, H = 1080, 1920
def lay(n): return Image.open(A + n).convert('RGBA')
def fit(im, w=None, h=None): r = (w / im.width) if w else (h / im.height); return im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
bg = Image.open(A + 'bg.jpg').convert('RGBA')
c = bg.copy()
gy = 700
# night village on top
houses = fit(lay('houses.webp'), w=760); c.alpha_composite(houses, (160, gy - houses.height + 30))
well = fit(lay('well.webp'), w=230); c.alpha_composite(well, (70, gy - well.height + 40))
# torn ground + red underground glow
d = ImageDraw.Draw(c)
pts = [(0, gy)] + [(x, gy + 18 * np.sin(x * 0.05) + (14 if (x // 60) % 2 else -6)) for x in range(0, W + 1, 30)] + [(W, 1745), (0, 1745)]
d.polygon(pts, fill=(30, 16, 14, 255))
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
gd.ellipse((140, 900, 940, 1700), fill=(190, 30, 40, 150)); glow = glow.filter(ImageFilter.GaussianBlur(120)); c.alpha_composite(glow)
for bx, by in [(150, 760), (860, 800), (500, 740)]:
    bl = fit(lay('blade.webp'), w=210); c.alpha_composite(bl, (bx - 105, by))
dh = fit(lay('deadhand.webp'), h=1050); c.alpha_composite(dh, (560 - dh.width // 2 + 80, 1745 - dh.height + 40))
for hx, hh, flip in [(140, 520, False), (930, 470, True)]:
    hd = fit(lay('hand_arm.png'), h=hh)
    if flip: hd = hd.transpose(Image.FLIP_LEFT_RIGHT)
    c.alpha_composite(hd, (hx - hd.width // 2, 1745 - hd.height + 20))
LK = Image.new('RGBA', lay('link_body.png').size)
for n in ['armB', 'legB', 'legF', 'body', 'armF']: LK.alpha_composite(lay(f'link_{n}.png'))
lk = fit(LK.crop(LK.getbbox()), h=260); c.alpha_composite(lk, (40, gy - 255))   # tiny Link standing on the village ground
# text
def font(sz):
    for f in ['/System/Library/Fonts/Supplemental/Georgia Bold.ttf', '/Library/Fonts/Georgia Bold.ttf']:
        try: return ImageFont.truetype(f, sz)
        except Exception: pass
    return ImageFont.load_default()
def text(s, y, sz, fill=(251, 240, 210), stroke=(42, 22, 8)):
    f = font(sz); w = d.textlength(s, font=f); x = (W - w) / 2
    d.text((x + 4, y + 8), s, font=f, fill=(0, 0, 0, 160), stroke_width=14, stroke_fill=(0, 0, 0, 160))
    d.text((x, y), s, font=f, fill=fill, stroke_width=12, stroke_fill=stroke)
d = ImageDraw.Draw(c)
text('UNDER THIS', 205, 120); text('VILLAGE...', 330, 120, fill=(230, 60, 50))
c.convert('RGB').save('thumb/thumb_vertical.jpg', quality=92)
# 16:9: the village and the creature on the right, the text on a dark woven panel on the left
base = c.convert('RGB').crop((0, 470, 1080, 1745)); base = base.resize((round(base.width * 720 / base.height), 720), Image.LANCZOS)
t = Image.open(A + 'bg.jpg').convert('RGB').crop((0, 400, 1080, 1008)).resize((1280, 720)); t = ImageEnhance.Brightness(t).enhance(0.7)
t.paste(base, (1280 - base.width, 0)); dt = ImageDraw.Draw(t); f = font(92)
for s_, y, col in [('UNDER', 150, (251, 240, 210)), ('THIS', 260, (251, 240, 210)), ('VILLAGE...', 370, (230, 60, 50))]:
    dt.text((44, y + 6), s_, font=f, fill=(0, 0, 0), stroke_width=12, stroke_fill=(0, 0, 0)); dt.text((40, y), s_, font=f, fill=col, stroke_width=10, stroke_fill=(42, 22, 8))
t.save('thumb/thumb_16x9.jpg', quality=92); print('ok')
