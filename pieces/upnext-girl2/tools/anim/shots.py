"""python tools/anim/shots.py out.png clip:frame,... views [scale] -> grid (rows = shots, cols = views)"""
import sys
from PIL import Image, ImageDraw
out, shots, views = sys.argv[1], sys.argv[2].split(","), sys.argv[3].split(","); sc = float(sys.argv[4]) if len(sys.argv) > 4 else 1
ims = [[Image.open(f"review/engine2/shot_{s.split(':')[0]}_{s.split(':')[1]}_{v}.png").convert("RGB") for v in views] for s in shots]
w, h = ims[0][0].size; cw, ch = int(w * sc), int(h * sc)
G = Image.new("RGB", (cw * len(views), ch * len(shots)))
for r, row in enumerate(ims):
    for c, im in enumerate(row): G.paste(im.resize((cw, ch)), (c * cw, r * ch))
    ImageDraw.Draw(G).text((4, r * ch + 4), shots[r], fill=(0, 0, 0))
G.save(out); print(out, G.size)
