"""review/variants_sheet.png: V1 | V2 | V3 at front, 3/4, side, back (engine renders, his camera, his_idle) and
review/variants_anims.png: walk / run / sit_floor frames per variant."""
import numpy as np
from PIL import Image, ImageDraw
VIEWS = [(0, "front"), (42, "3/4"), (84, "side"), (125, "back")]
VAR = [("", "V1 identical"), ("v2_", "V2 curvy, bare legs"), ("v3_", "V3 curvy, tights")]
def lab(im, t):
    d = ImageDraw.Draw(im); d.rectangle([0, 0, 9 * len(t) + 10, 22], fill=(0, 0, 0)); d.text((5, 5), t, fill=(255, 255, 255)); return im
rows = []
for k, vn in VIEWS:
    cells = [lab(Image.open(f"review/engine/{p}ours_{k:03d}.png").convert("RGB").crop((200, 240, 900, 1850)), f"{t} - {vn}") for p, t in VAR]
    row = Image.new("RGB", (700 * 3, 1610)); [row.paste(c, (i * 700, 0)) for i, c in enumerate(cells)]; rows.append(row)
sh = Image.new("RGB", (2100, 1610 * 4)); [sh.paste(r, (0, i * 1610)) for i, r in enumerate(rows)]
sh.resize((1050, 3220)).save("review/variants_sheet.png")
rows = []
for p, t in VAR:
    for a in ("walk", "run", "sit_floor"):
        ims = [Image.open(f"review/engine/{p}anim_{a}_3q_{i}.png").convert("RGB") for i in range(5)] + \
              [Image.open(f"review/engine/{p}anim_{a}_side_{i}.png").convert("RGB") for i in (1, 3)]
        row = Image.new("RGB", (360 * 7, 560)); [row.paste(im, (i * 360, 0)) for i, im in enumerate(ims)]
        rows.append(lab(row, f"{t}: {a}"))
sh = Image.new("RGB", (2520, 560 * len(rows))); [sh.paste(r, (0, i * 560)) for i, r in enumerate(rows)]
sh.resize((1260, 280 * len(rows))).save("review/variants_anims.png")
print("variant sheets written")
