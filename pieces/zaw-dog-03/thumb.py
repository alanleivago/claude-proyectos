"""venv: renders/thumb/A.png (build.py -- thumb) -> renders/thumbnail.png (1080x1920): night living room, he sobs on the
sofa behind a giant tissue with popcorn, the dog mid-leap at him with a first-aid box in its mouth and tears streaming
back, a red 3D "!" over it; "YOU'RE HURT?!" big yellow with a black stroke in the empty ceiling space."""
import os, sys
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402
import board as BD  # noqa: E402
im = ps1_post(BD.night(Image.open(os.path.join(H, "renders", "thumb", "A.png")).convert("RGB")))
d = ImageDraw.Draw(im)
f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Black.ttf", 175)
for y, t in ((250, "YOU'RE"), (440, "HURT?!")):
    d.text((540, y), t, font=f, fill=(255, 232, 40), anchor="ms", stroke_width=16, stroke_fill=(0, 0, 0))
im.save(os.path.join(H, "renders", "thumbnail.png")); print(os.path.join(H, "renders", "thumbnail.png"))
