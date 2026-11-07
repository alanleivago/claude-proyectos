"""venv: renders/thumb/A.png + B.png -> renders/thumbnail.png (1080x1920): the sad dog at the window with the
scent-hand clock behind it (top), the owner tiny down the street (bottom band), "YOU'RE LATE." big yellow + black stroke."""
import os, sys
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(H, "renders", "thumb")
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402
A = Image.open(os.path.join(T, "A.png")).convert("RGB"); B = Image.open(os.path.join(T, "B.png")).convert("RGB")
im = A.copy()
band = B.crop((0, 380, 1080, 1180)).resize((1080, 800))              # the street with the tiny owner
im.paste(band.crop((0, 0, 1080, 640)), (0, 1280))
im = ps1_post(im)
d = ImageDraw.Draw(im)
d.rectangle((0, 1272, 1080, 1290), fill=(0, 0, 0))
f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Black.ttf", 190)
d.text((540, 1235), "YOU'RE", font=f, fill=(255, 232, 40), anchor="ms", stroke_width=16, stroke_fill=(0, 0, 0))
d.text((540, 1460), "LATE.", font=f, fill=(255, 232, 40), anchor="ms", stroke_width=16, stroke_fill=(0, 0, 0))
im.save(os.path.join(H, "renders", "thumbnail.png")); print(os.path.join(H, "renders", "thumbnail.png"))
