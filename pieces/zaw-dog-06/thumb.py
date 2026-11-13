"""venv: renders/thumb/A.png (shots.py thumb) -> renders/thumbnail.png (1080x1920): the living room: the dog buried under bills + a toy car,
the owner rubbing his scared face, the boss shaking her fist;
"IT'S YOUR STRESS" big yellow, black stroke, in the sky (two lines)."""
import os, sys
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402
im = ps1_post(Image.open(os.path.join(H, "renders", "thumb", "A.png")).convert("RGB"))
d = ImageDraw.Draw(im); F = "/System/Library/Fonts/Supplemental/Arial Black.ttf"; size = 220
while d.textlength("IT'S YOUR", font=ImageFont.truetype(F, size)) > 980:
    size -= 4
for y, txt in ((260, "IT'S YOUR"), (260 + int(size * 1.05), "STRESS")):
    d.text((540, y), txt, font=ImageFont.truetype(F, size), fill=(255, 232, 40), anchor="ms", stroke_width=16, stroke_fill=(0, 0, 0))
im.save(os.path.join(H, "renders", "thumbnail.png")); print(os.path.join(H, "renders", "thumbnail.png"))
