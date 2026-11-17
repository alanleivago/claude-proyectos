"""motion strips from review/engine2/vid: python tools/anim/strip.py clip:f0:step:n,... out.png"""
import sys
from PIL import Image, ImageDraw
rows = []
for spec in sys.argv[1].split(","):
    c, f0, st, n = spec.split(":"); f0, st, n = int(f0), int(st), int(n)
    ims = [Image.open(f"review/engine2/vid/{c}_{f0 + i * st:03d}.png").convert("RGB").crop((70, 60, 470, 900)).resize((160, 336)) for i in range(n)]
    row = Image.new("RGB", (160 * n, 336)); [row.paste(im, (i * 160, 0)) for i, im in enumerate(ims)]
    ImageDraw.Draw(row).text((3, 3), spec, fill=(0, 0, 0)); rows.append(row)
W = max(r.width for r in rows); G = Image.new("RGB", (W, 336 * len(rows)), (235, 221, 199))
for i, r in enumerate(rows): G.paste(r, (0, i * 336))
G.save(sys.argv[2]); print(G.size)
