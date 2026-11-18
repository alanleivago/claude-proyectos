"""upnext-01 vertical cover (1080x1920, A1 style): engine frame of Ashley + Pip (no subtitle), cropped tighter,
yellow Luckiest Guy hook with the brown extrude + black outline like miniatura_A1, a few sparkles.
usage: python tools/cover.py <frame.png> <out.png>"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ENG = Path(__file__).resolve().parents[1] / 'engine'
src, out = sys.argv[1:3]
im = Image.open(src).convert('RGB')
W, H = im.size; z = 1.0; cw, ch = W, H; x0 = 0; y0 = 0
im = im.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, H), Image.NEAREST)
f = ImageFont.truetype(str(ENG / 'fonts_thumb' / 'LuckiestGuy-Regular.ttf'), 150)
d = ImageDraw.Draw(im)
def line(txt, y, size=150):
    ft = ImageFont.truetype(str(ENG / 'fonts_thumb' / 'LuckiestGuy-Regular.ttf'), size)
    w = d.textlength(txt, font=ft); x = (W - w) / 2
    for k in range(14, 0, -1): d.text((x + k * 0.5, y + k), txt, font=ft, fill=(150, 96, 8), stroke_width=10, stroke_fill=(20, 12, 4))
    d.text((x, y), txt, font=ft, fill=(255, 222, 40), stroke_width=10, stroke_fill=(20, 12, 4))
line('HE CHEATED', 120, 160); line('MY 4 AM?', 300, 190)
def sparkle(x, y, r):
    for rr, col in ((r + 5, (150, 90, 10)), (r, (255, 214, 60))):
        d.polygon([(x, y - rr), (x + rr * .24, y - rr * .24), (x + rr, y), (x + rr * .24, y + rr * .24), (x, y + rr), (x - rr * .24, y + rr * .24), (x - rr, y), (x - rr * .24, y - rr * .24)], fill=col)
for s in ((140, 700, 30), (560, 640, 22), (980, 980, 26), (420, 1500, 18)): sparkle(*s)
im.save(out); print(out, im.size)
