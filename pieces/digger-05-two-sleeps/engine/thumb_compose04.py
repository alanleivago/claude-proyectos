"""Digger 04 vertical cover (A1 style): python thumb_compose04.py RENDERS WINNER -> pieces/digger-04-alarm/portada_*.png + compare sheet.
The render is only copied (no grading); gold sparkles are added around the artifact."""
import sys, shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
R = Path(sys.argv[1]); OUT = Path(r"F:/Claude Proyectos/pieces/digger-04-alarm"); TITLE = "People paid someone to shoot peas at their window"
def sparkle(im, x, y, r):
    d = ImageDraw.Draw(im)
    for rr, col in ((r + 4, (150, 90, 10)), (r, (255, 214, 60))):
        d.polygon([(x, y - rr), (x + rr * 0.24, y - rr * 0.24), (x + rr, y), (x + rr * 0.24, y + rr * 0.24), (x, y + rr), (x - rr * 0.24, y + rr * 0.24), (x - rr, y), (x - rr * 0.24, y - rr * 0.24)], fill=col)
    d.ellipse((x - r * 0.18, y - r * 0.18, x + r * 0.18, y + r * 0.18), fill=(255, 255, 230))
import math
def ring(im, x, y, side):   # cartoon ring/vibration strokes off a bell (white with a dark outline), side = -1 left, +1 right
    d = ImageDraw.Draw(im)
    for k, a in enumerate((-55, -25, 5)):
        r0, r1 = 60 + k * 5, 100 + k * 5; t = math.radians(a)
        p0 = (x + side * r0 * math.cos(t), y + r0 * math.sin(t)); p1 = (x + side * r1 * math.cos(t), y + r1 * math.sin(t))
        d.line([p0, p1], fill=(20, 20, 40), width=16); d.line([p0, p1], fill=(255, 255, 255), width=9)
RING = {'A': [(560, 900, -1), (935, 900, 1)], 'B': [(590, 1040, 1)], 'C': [(930, 960, 1)]}
SP = {'A': [(1010, 1250, 22), (480, 1150, 14)], 'B': [(700, 1300, 22), (300, 760, 14)], 'C': [(1030, 1250, 22), (800, 760, 14)]}
ims = {}
for n, src in (('A', 'full'), ('B', 'bedroom'), ('C', 'expedition')):
    im = Image.open(R / f'{src}.png').convert('RGB')
    for s in SP[n]: sparkle(im, *s)
    for r_ in RING[n]: ring(im, *r_)
    ims[n] = im; im.save(OUT / f'portada_{n}.png')
ims[sys.argv[2]].save(OUT / 'portada_1080x1920.png'); ims[sys.argv[2]].save(OUT / f'{TITLE}.png')
f = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 22)
sheet = Image.new('RGB', (3 * 370 + 10, 30 + 640 + 220), (24, 24, 32)); d = ImageDraw.Draw(sheet)
for i, (n, lab) in enumerate((('A', 'A  hands to ears, ringing'), ('B', 'B  snooze slap'), ('C', 'C  blowpipe + peas'))):
    sheet.paste(ims[n].resize((360, 640), Image.LANCZOS), (10 + i * 370, 30)); d.text((10 + i * 370, 4), lab, font=f, fill=(255, 220, 60))
    sheet.paste(ims[n].resize((94, 168), Image.LANCZOS), (10 + i * 370 + 40, 690))
    sheet.paste(ims[n].resize((94, 168), Image.LANCZOS).resize((188, 336), Image.NEAREST).crop((0, 0, 188, 200)), (10 + i * 370 + 150, 680))
d.text((10, 870), 'mobile check: 94x168 (left) and the same shown 2x (right, top part)', font=f, fill=(200, 200, 210))
sheet.save(OUT / 'portadas_compare.png'); print('ok')
