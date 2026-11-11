"""review strip of a cast member's Flow sources: sheet + neutral with a 64 px grid (labels in 1024 units) + the faces.
    .venv/bin/python pieces/cast-pack/tools/preview.py <slug> -> review/work/<slug>_src.jpg"""
import os, sys
from PIL import Image, ImageDraw
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
D = os.path.join(R, "styles/zawdog/humans", sys.argv[1])
S = Image.new("RGB", (1500, 520 + 250), (20, 20, 20)); dr = ImageDraw.Draw(S)
sp = os.path.join(D, "src/sheet.jpg")
if os.path.exists(sp):
    S.paste(Image.open(sp).convert("RGB").resize((930, 520)), (0, 0))
n = os.path.join(D, "faces/neutral.jpg")
if os.path.exists(n):
    im = Image.open(n).convert("RGB").resize((512, 512)); d2 = ImageDraw.Draw(im)
    for y in range(0, 1024, 32):
        d2.line([(0, y / 2), (512 if y % 128 == 0 else 40, y / 2)], fill=(255, 0, 0) if y % 128 == 0 else (0, 200, 255))
        if y % 128 == 0: d2.text((4, y / 2 + 2), str(y), fill=(255, 0, 0))
    S.paste(im.resize((520, 520)), (970, 0))
E = ("neutral", "smile", "surprised", "crying", "laughing", "scared")
for i, e in enumerate(E):
    p = os.path.join(D, "faces", e + ".jpg")
    if os.path.exists(p):
        S.paste(Image.open(p).convert("RGB").resize((250, 250)), (i * 250, 520))
out = os.path.join(R, "pieces/cast-pack/review/work", sys.argv[1] + "_src.jpg"); S.save(out, quality=85); print(out)
