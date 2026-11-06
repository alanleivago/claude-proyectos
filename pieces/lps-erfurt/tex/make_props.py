"""venv: small prop textures for lps-erfurt.
  props/toilet_front.png, toilet_top.png  - the latrine box from ONE Flow photo (ref/toilet.jpg): front planks + the
                                            top plank with a round dark hole (photobox() in build.py)
  props/tally_XX.png                       - the shot-9 tally counter (0..60 and "~60"), black LCD-ish card"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

H = Path(__file__).resolve().parent; R = H.parent / "ref"; P = H / "props"; P.mkdir(exist_ok=True)
q = lambda im, n=32: im.quantize(n, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")

t = Image.open(R / "toilet.jpg").convert("RGB")
q(t.crop((180, 390, 850, 805)).resize((128, 80), Image.BOX)).save(P / "toilet_front.png")
top = t.crop((150, 300, 880, 370)).resize((128, 80), Image.BOX)       # plank grain only, stretched to the lid
d = ImageDraw.Draw(top)
d.ellipse((44, 22, 84, 58), fill=(40, 26, 16)); d.ellipse((48, 26, 80, 54), fill=(12, 8, 6))
q(top).save(P / "toilet_top.png")

F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Impact.ttf", 120)
for n in list(range(0, 61, 3)) + ["~60"]:
    im = Image.new("RGB", (256, 160), (18, 18, 20)); d = ImageDraw.Draw(im)
    d.rectangle((6, 6, 249, 153), outline=(240, 200, 60), width=6)
    d.text((128, 84), str(n), font=F, fill=(250, 235, 60), anchor="mm", stroke_width=4, stroke_fill=(90, 20, 10))
    im.save(P / f"tally_{n if isinstance(n, str) is False else 'final'}.png")
print(sorted(p.name for p in P.glob("*.png")))
