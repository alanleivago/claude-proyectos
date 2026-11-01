"""Digger 05 vertical cover (A1 style): python thumb_compose.py RENDERS WINNER -> ../portada_1080x1920.png (+ portada_A/B/C, compare sheet with the
mobile check at 94x168). The render is only copied (no brightness/contrast/saturation); sparkles are added."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
R = Path(sys.argv[1]); OUT = Path(__file__).resolve().parent.parent
def sparkle(im, x, y, r):
    d = ImageDraw.Draw(im)
    for rr, col in ((r + 4, (150, 90, 10)), (r, (255, 214, 60))):
        d.polygon([(x, y - rr), (x + rr * 0.24, y - rr * 0.24), (x + rr, y), (x + rr * 0.24, y + rr * 0.24), (x, y + rr), (x - rr * 0.24, y + rr * 0.24), (x - rr, y), (x - rr * 0.24, y - rr * 0.24)], fill=col)
    d.ellipse((x - r * 0.18, y - r * 0.18, x + r * 0.18, y + r * 0.18), fill=(255, 255, 230))
SP = [(1010, 820, 28), (560, 860, 18), (1020, 1240, 22), (760, 700, 14)]
ims = {}
for n, src in (('A', 'full'), ('B', 'bedroom'), ('C', 'expedition')):
    im = Image.open(R / f'{src}.png').convert('RGB')
    for s in SP: sparkle(im, *s)
    ims[n] = im; im.save(OUT / f'portada_{n}.png')
ims[sys.argv[2]].save(OUT / 'portada_1080x1920.png'); ims[sys.argv[2]].save(OUT / 'You Wake Up at 3 AM Because of This 600-Year-Old Habit.png')
f = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 22)
sheet = Image.new('RGB', (3 * 370 + 10, 30 + 640 + 220), (24, 24, 32)); d = ImageDraw.Draw(sheet)
for i, (n, lab) in enumerate((('A', 'A  3:00 clock, hands on hips'), ('B', 'B  awake in bed + clock'), ('C', 'C  pointing, Zz | 3:00 | Zz'))):
    sheet.paste(ims[n].resize((360, 640), Image.LANCZOS), (10 + i * 370, 30)); d.text((10 + i * 370, 4), lab, font=f, fill=(255, 220, 60))
    sheet.paste(ims[n].resize((94, 168), Image.LANCZOS).resize((94, 168)), (10 + i * 370 + 40, 690))
    sheet.paste(ims[n].resize((94, 168), Image.LANCZOS).resize((188, 336), Image.NEAREST).crop((0, 0, 188, 200)), (10 + i * 370 + 150, 680))
d.text((10, 870), 'mobile check: 94x168 (left) and the same shown 2x (right, top part)', font=f, fill=(200, 200, 210))
sheet.save(OUT / 'portadas_compare.png'); print('ok')
