"""venv: quick look sheet of review/raw frames (+ split panels stacked).  python tools/tile.py out.jpg beat [beat ...]"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); R = os.path.join(H, "review", "raw")
out, names = sys.argv[1], sys.argv[2:]; W, Hh = 270, 480; F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
sh = Image.new("RGB", (W * min(len(names), 6), Hh * ((len(names) + 5) // 6)), "black")
for i, n in enumerate(names):
    p = os.path.join(R, f"{n}.png")
    if os.path.exists(p):
        im = Image.open(p).convert("RGB").resize((W, Hh))
    else:
        ps = sorted(f for f in os.listdir(R) if f.startswith(n + "_p"))
        im = Image.new("RGB", (W, Hh))
        for k, f in enumerate(ps):
            a = Image.open(os.path.join(R, f)).convert("RGB"); a = a.resize((W, Hh)); h = Hh // len(ps)
            im.paste(a.crop((0, (Hh - h) // 2, W, (Hh - h) // 2 + h)), (0, k * h))
    ImageDraw.Draw(im).text((6, 4), n, font=F, fill="yellow", stroke_width=3, stroke_fill="black")
    sh.paste(im, ((i % 6) * W, (i // 6) * Hh))
sh.save(out, quality=88)
