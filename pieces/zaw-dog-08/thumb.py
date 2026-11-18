"""venv: renders/thumb/A.png + pts.json (shots.py thumb) -> renders/thumbnail.png (1080x1920): the hallway, the owner holds the
biscuit HIGH out of reach with a smug grin (sparkle + motion arcs on the biscuit); the dog sits facing the lens with a flat
judging squint and a giant red "?"; "HE KNOWS." big yellow, black stroke, at the bottom (the biscuit owns the top).   python thumb.py"""
import json, math, os, sys
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402
im = ps1_post(Image.open(os.path.join(H, "renders", "thumb", "A.png")).convert("RGB"))
W, Hh = im.size; P = json.load(open(os.path.join(H, "renders", "thumb", "pts.json")))
xy = lambda k: (P[k][0] * W, (1 - P[k][1]) * Hh)
d = ImageDraw.Draw(im); F = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
size = 280
while d.textlength("HE KNOWS.", font=ImageFont.truetype(F, size)) > 1010:
    size -= 4
d.text((540, 1830), "HE KNOWS.", font=ImageFont.truetype(F, size), fill=(255, 232, 40), anchor="ms", stroke_width=20, stroke_fill=(0, 0, 0))
tx, ty = xy("treat")                                                      # the biscuit: a glow ring + wiggle arcs (teasing)
for r, w in ((95, 10), (70, 6)):
    d.arc((tx - r, ty - r, tx + r, ty + r), 200, 340, fill=(255, 240, 120), width=w)
for k in range(8):
    a = 2 * math.pi * k / 8; d.line((tx + 48 * math.cos(a), ty + 48 * math.sin(a), tx + 78 * math.cos(a), ty + 78 * math.sin(a)), fill=(255, 250, 200), width=7)
dx, dy = xy("dog_head"); dx = min(max(dx + 230, 160), 0.86 * W)         # the giant red "?" beside the dog's head
d.text((dx, dy - 120), "?", font=ImageFont.truetype(F, 330), fill=(235, 30, 30), anchor="ms", stroke_width=18, stroke_fill=(0, 0, 0))
im.save(os.path.join(H, "renders", "thumbnail.png")); print(os.path.join(H, "renders", "thumbnail.png"))
