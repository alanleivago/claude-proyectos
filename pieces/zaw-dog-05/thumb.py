"""venv: renders/thumb/A.png (build.py -- thumb) -> renders/thumbnail.png (1080x1920): the street; the dog's nose on the
lamppost, tiny reading glasses, a newspaper floating in front of it, the owner pulling the leash behind;
"LET HIM READ!" big yellow, black stroke, in the sky (two lines)."""
import os, sys
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402
im = ps1_post(Image.open(os.path.join(H, "renders", "thumb", "A.png")).convert("RGB"))
d = ImageDraw.Draw(im); F = "/System/Library/Fonts/Supplemental/Arial Black.ttf"; size = 220
while d.textlength("LET HIM", font=ImageFont.truetype(F, size)) > 980:
    size -= 4
for y, txt in ((260, "LET HIM"), (260 + int(size * 1.05), "READ!")):
    d.text((540, y), txt, font=ImageFont.truetype(F, size), fill=(255, 232, 40), anchor="ms", stroke_width=16, stroke_fill=(0, 0, 0))
im.save(os.path.join(H, "renders", "thumbnail.png")); print(os.path.join(H, "renders", "thumbnail.png"))
