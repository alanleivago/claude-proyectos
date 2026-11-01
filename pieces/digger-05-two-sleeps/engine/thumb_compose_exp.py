"""Expedition 01 thumbnails v3 (user's Gemini ref: holographic grid room, golden 3D game-title lettering, full body, open eyes).
python thumb_compose.py RENDERS_DIR WINNER FILM_FRAME -> ../miniatura_A/B/C.png, ../miniatura_1280x720.png, ../miniaturas_compare.png
The render is only resized (no brightness / contrast / saturation / bloom). Lettering: Lilita One (OFL, engine/fonts_thumb/),
golden face gradient, orange-brown extrusion + outline, soft drop shadow."""
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont
R = Path(sys.argv[1]); HERE = Path(__file__).resolve().parent; OUT = HERE.parent; W, H = 1280, 720
FONT = str(HERE / 'fonts_thumb' / 'LilitaOne-Regular.ttf')

def load(name): return Image.open(R / f'{name}.png').convert('RGB').resize((W, H), Image.LANCZOS)   # plain resize, no grading

def mask_of(txt, size, x, y):
    m = Image.new('L', (W, H), 0); f = ImageFont.truetype(FONT, size); d = ImageDraw.Draw(m)
    tw = d.textlength(txt, font=f); d.text((x - tw / 2, y), txt, font=f, fill=255); return m

def gold_title(im, txt, size=150, y=26, cx=W // 2):
    m = mask_of(txt, size, cx, y); out = im.convert('RGBA')
    sh = Image.new('RGBA', (W, H), (10, 20, 60, 0)); sh.putalpha(ImageChops.offset(m, 10, 16).filter(ImageFilter.GaussianBlur(10)).point(lambda v: v * 0.6))
    out = Image.alpha_composite(out, sh)
    o = m.filter(ImageFilter.MaxFilter(13))                                        # dark brown outline (~6 px)
    for k in range(9, 0, -1):                                                      # orange-brown extrusion, stacked down-right
        lay = Image.new('RGBA', (W, H), (110, 46, 10, 255) if k > 2 else (150, 70, 14, 255)); lay.putalpha(ImageChops.offset(o, k // 2, k)); out = Image.alpha_composite(out, lay)
    lay = Image.new('RGBA', (W, H), (96, 38, 6, 255)); lay.putalpha(o); out = Image.alpha_composite(out, lay)
    grad = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(grad)
    for yy in range(H):
        t = min(1, max(0, (yy - y - size * 0.18) / (size * 0.95)))
        c = [int(a + (b - a) * t) for a, b in zip((255, 246, 140), (238, 150, 20))] if t < 1 else [238, 150, 20]
        gd.line([(0, yy), (W, yy)], fill=(*c, 255))
    grad.putalpha(m); out = Image.alpha_composite(out, grad)
    hi = ImageChops.subtract(m, ImageChops.offset(m, 0, 4)).filter(ImageFilter.GaussianBlur(1))   # light top bevel edge
    lay = Image.new('RGBA', (W, H), (255, 252, 214, 255)); lay.putalpha(hi.point(lambda v: v * 0.8)); out = Image.alpha_composite(out, lay)
    return out.convert('RGB')

def sparkle(im, x, y, r):
    d = ImageDraw.Draw(im)
    for rr, col in ((r + 3, (150, 90, 10)), (r, (255, 214, 60))):
        d.polygon([(x, y - rr), (x + rr * 0.24, y - rr * 0.24), (x + rr, y), (x + rr * 0.24, y + rr * 0.24), (x, y + rr), (x - rr * 0.24, y + rr * 0.24), (x - rr, y), (x - rr * 0.24, y - rr * 0.24)], fill=col)
    d.ellipse((x - r * 0.18, y - r * 0.18, x + r * 0.18, y + r * 0.18), fill=(255, 255, 230))
    return im

# v4: the title is REAL 3D letters in the scene (thumb_shots.js); here only sparkles are added
# v5: A only, three poses (A1 hands on hips, A2 pointing at the bed, A3 peeking); the title is 3D in the scene
V = {'A1': ('Expedition', [(1150, 250, 18), (520, 300, 14), (1080, 520, 12)]),
     'A2': ('complete', [(1150, 250, 18), (700, 330, 14), (1080, 520, 12)]),
     'A3': ('Logging', [(1150, 250, 18), (560, 300, 14), (1080, 520, 12)])}
ims = {}
for n, (src, sp) in V.items():
    im = load(src)
    for sp_ in sp: sparkle(im, *sp_)
    ims[n] = im; im.save(OUT / f'miniatura_{n}.png')
ims[sys.argv[2]].save(OUT / 'miniatura_1280x720.png')
ref = Image.open(sys.argv[3]).convert('RGB').resize((W, H), Image.LANCZOS); f = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 22)
sheet = Image.new('RGB', (4 * 490, 30 + 270 + 210), (24, 24, 32)); d = ImageDraw.Draw(sheet)
for i, (lab, im) in enumerate([('A1  hands on hips', ims['A1']), ('A2  pointing at the bed', ims['A2']), ('A3  peeking', ims['A3']), ('real v3 frame (shading ref)', ref)]):
    sheet.paste(im.resize((480, 270), Image.LANCZOS), (i * 490, 30)); d.text((i * 490 + 4, 4), lab, font=f, fill=(255, 220, 60))
    if i < 3: sheet.paste(im.resize((168, 94), Image.LANCZOS).resize((336, 188), Image.NEAREST), (i * 490 + 72, 312))
d.text((3 * 490 + 10, 330), 'bottom row: 168x94 mobile\n(shown 2x, nearest)', font=f, fill=(200, 200, 210))
sheet.save(OUT / 'miniaturas_compare.png'); print('ok')
