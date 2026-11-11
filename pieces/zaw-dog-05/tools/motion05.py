"""venv: review/board/motion05.jpg - the first and last FINAL frame (renders/post) of every shot, side by side, so the
camera move of each shot shows.  python tools/motion05.py"""
import json, os
from PIL import Image, ImageDraw, ImageFont
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); B = json.load(open(os.path.join(H, "review", "beats.json")))
P = os.path.join(H, "renders", "post"); W, Hh = 162, 288; cols = 6
items = list(B.items()); rows = -(-len(items) // cols)
sh = Image.new("RGB", (cols * (2 * W + 12), rows * (Hh + 30)), (20, 20, 20)); d = ImageDraw.Draw(sh)
f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 18)
for k, (n, (a, b, _)) in enumerate(items):
    x, y = (k % cols) * (2 * W + 12), (k // cols) * (Hh + 30)
    for j, fr in enumerate((a, b - 1)):
        sh.paste(Image.open(os.path.join(P, f"{fr:05d}.png")).convert("RGB").resize((W, Hh)), (x + j * W, y + 26))
    d.text((x + 4, y + 3), f"{n}  first | last", font=f, fill=(255, 230, 40))
sh.save(os.path.join(H, "review", "board", "motion05.jpg"), quality=88); print("motion05.jpg", len(items), "shots")
