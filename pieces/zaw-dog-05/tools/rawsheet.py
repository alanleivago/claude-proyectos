"""venv: review/raw/*.png -> review/rawsheet.jpg (quick look, names on top).  python tools/rawsheet.py [names...]"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); R = os.path.join(H, "review", "raw")
ns = sys.argv[1:] or sorted(f[:-4] for f in os.listdir(R) if f.endswith(".png"))
W, Hh = 270, 480; cols = min(6, len(ns)); rows = -(-len(ns) // cols)
sh = Image.new("RGB", (cols * W, rows * Hh), (20, 20, 20)); d = ImageDraw.Draw(sh); f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
for k, n in enumerate(ns):
    x, y = (k % cols) * W, (k // cols) * Hh; sh.paste(Image.open(os.path.join(R, n + ".png")).convert("RGB").resize((W - 4, Hh - 4)), (x + 2, y + 2))
    d.text((x + 8, y + 6), n, font=f, fill=(255, 255, 0), stroke_width=2, stroke_fill=(0, 0, 0))
sh.save(os.path.join(H, "review", "rawsheet.jpg"), quality=88)
