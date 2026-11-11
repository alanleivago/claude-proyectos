"""venv: renders/post (the final frames) -> review/board/motion04.jpg: first | last frame of every
shot side by side, so each camera move is visible.  python tools/motion_sheet.py"""
import json, os
from PIL import Image, ImageDraw
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); E = os.path.join(H, "review", "ends")
B = json.load(open(os.path.join(H, "review", "beats.json")))
MOVES = json.load(open(os.path.join(H, "review", "moves04.json")))
w, h, cols = 180, 320, 4
names = list(B); rows = (len(names) + cols - 1) // cols
sh = Image.new("RGB", (cols * (2 * w + 14), rows * (h + 30) + 30), (18, 18, 18)); d = ImageDraw.Draw(sh)
d.text((6, 6), "zaw-dog-04 motion check: first | last frame of each shot", fill="yellow")
for k, n in enumerate(names):
    x, y = (k % cols) * (2 * w + 14) + 4, 30 + (k // cols) * (h + 30)
    for j, s in enumerate("ab"):
        f_ = B[n][0] if s == "a" else B[n][1] - 1                                 # the FINAL frames (renders/post)
        p = os.path.join(H, "renders", "post", f"{f_:05d}.png")
        if os.path.exists(p):
            sh.paste(Image.open(p).convert("RGB").resize((w, h)), (x + j * (w + 2), y))
    d.text((x, y + h + 4), f"{n}: {MOVES.get(n, '')}", fill=(230, 230, 230))
p = os.path.join(H, "review", "board", "motion04.jpg"); sh.save(p, quality=88); print(p)
