"""venv: renders/thumb/A.png (build.py -- thumb) -> renders/thumbnail.png (1080x1920): the dog park, he crouches petting
the fluffy white dog, ours glares at us in the foreground under a red 3D "!"; "CHEATER?!" big yellow, black stroke, in the sky."""
import os, sys
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402
im = ps1_post(Image.open(os.path.join(H, "renders", "thumb", "A.png")).convert("RGB"))
d = ImageDraw.Draw(im); size = 200
while d.textlength("CHEATER?!", font=ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Black.ttf", size)) > 1000:
    size -= 4
d.text((540, 300), "CHEATER?!", font=ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Black.ttf", size), fill=(255, 232, 40),
       anchor="ms", stroke_width=16, stroke_fill=(0, 0, 0))
im.save(os.path.join(H, "renders", "thumbnail.png")); print(os.path.join(H, "renders", "thumbnail.png"))
