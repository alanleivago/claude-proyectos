"""venv: review/board/motion06.jpg - first | last FINAL frame of every shot (renders/post) so each camera move shows.
python tools/motion06.py"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402
B = json.load(open(os.path.join(H, "review", "beats.json"))); E = os.path.join(H, "review", "ends")
W, Hh, cols = 162, 288, 6; items = list(B.items()); rows = -(-len(items) // cols)
sh = Image.new("RGB", (cols * (2 * W + 12), rows * (Hh + 30) + 34), (20, 20, 20)); d = ImageDraw.Draw(sh)
f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 18)
d.text((6, 6), "zaw-dog-06 FINAL motion check: first | last frame of each shot (the camera moves in every shot)", font=f, fill=(255, 230, 40))
for k, (n, (a, b, _)) in enumerate(items):
    x, y = (k % cols) * (2 * W + 12), 34 + (k // cols) * (Hh + 30)
    for j, s in enumerate("ab"):
        fr = a if s == "a" else b - 1
        im = Image.open(os.path.join(H, "renders", "post", f"{fr:05d}.png")).convert("RGB")   # the FINAL frames
        sh.paste(im.resize((W, Hh)), (x + j * W, y + 26))
    d.text((x + 4, y + 3), f"{n}  {a / 30:.2f}-{b / 30:.2f}s  first | last", font=f, fill=(255, 230, 40))
p = os.path.join(H, "review", "board", "motion06.jpg"); os.makedirs(os.path.dirname(p), exist_ok=True); sh.save(p, quality=88); print(p)
