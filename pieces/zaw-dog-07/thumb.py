"""venv: renders/thumb/A.png + pts.json (shots.py thumb) -> renders/thumbnail.png (1080x1920): the owner points hard at the
EMPTY bowl with a guilty grin + sweat drops; the dog faces the lens, judging, a giant red "?" over its head; behind, the
mailman laughs and waves; "IT KNOWS." big yellow, black stroke, at the top.   python thumb.py"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402
im = ps1_post(Image.open(os.path.join(H, "renders", "thumb", "A.png")).convert("RGB"))
W, Hh = im.size; P = json.load(open(os.path.join(H, "renders", "thumb", "pts.json")))
xy = lambda k: (P[k][0] * W, (1 - P[k][1]) * Hh)
d = ImageDraw.Draw(im); F = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
size = 260
while d.textlength("IT KNOWS.", font=ImageFont.truetype(F, size)) > 1000:
    size -= 4
d.text((540, 300), "IT KNOWS.", font=ImageFont.truetype(F, size), fill=(255, 232, 40), anchor="ms", stroke_width=18, stroke_fill=(0, 0, 0))
dx, dy = xy("dog_head"); dx = min(dx, 0.84 * W)                                                # the giant red "?" over the dog's head
d.text((dx, dy - 190), "?", font=ImageFont.truetype(F, 300), fill=(235, 30, 30), anchor="ms", stroke_width=16, stroke_fill=(0, 0, 0))
ox, oy = xy("owner_head")                                                # sweat drops flying off the liar's head
for k, (ax, ay, s) in enumerate(((95, -70, 1.0), (125, -10, 0.8), (-80, -95, 0.75))):
    cx, cy, r = ox + ax, oy + ay, 22 * s
    d.polygon([(cx, cy - 2.4 * r), (cx - r, cy), (cx + r, cy)], fill=(120, 200, 255), outline=(0, 0, 0))
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(120, 200, 255), outline=(0, 0, 0), width=4)
    d.ellipse((cx - 0.45 * r, cy - 0.5 * r, cx - 0.05 * r, cy - 0.1 * r), fill=(235, 250, 255))
im.save(os.path.join(H, "renders", "thumbnail.png")); print(os.path.join(H, "renders", "thumbnail.png"))
