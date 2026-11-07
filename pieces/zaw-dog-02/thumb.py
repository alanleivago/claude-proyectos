"""venv: renders/thumb/A.png (build.py -- thumb) -> renders/thumbnail.png (1080x1920): the owner mid fake-throw with
the ball hidden behind his back, the dog's heavy side-eye in front, red 3D "?" over the empty hand; "LIAR." big yellow
with a black stroke in the empty ceiling space."""
import os, sys
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402
im = ps1_post(Image.open(os.path.join(H, "renders", "thumb", "A.png")).convert("RGB"))
d = ImageDraw.Draw(im)
f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Black.ttf", 250)
d.text((540, 440), "LIAR.", font=f, fill=(255, 232, 40), anchor="ms", stroke_width=20, stroke_fill=(0, 0, 0))
im.save(os.path.join(H, "renders", "thumbnail.png")); print(os.path.join(H, "renders", "thumbnail.png"))
