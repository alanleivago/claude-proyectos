"""review/variants_v2.png (V2 | V3 at front, 3/4, side, back + butt-profile close-up), review/lowpoly_vs_his.png
(low-poly base vs his frames at 4 angles: his | ours | 50 % | diff) and review/variants_anims.png (walk/run/sit)."""
import numpy as np
from PIL import Image, ImageDraw


def lab(im, t):
    d = ImageDraw.Draw(im); d.rectangle([0, 0, 9 * len(t) + 10, 22], fill=(0, 0, 0)); d.text((5, 5), t, fill=(255, 255, 255)); return im


E = "review/engine/"
VIEWS = [(0, "front"), (42, "3/4"), (84, "side"), (125, "back")]
rows = []
for k, vn in VIEWS:
    cells = [lab(Image.open(f"{E}{p}ours_{k:03d}.png").convert("RGB").crop((200, 240, 900, 1850)), f"{t} - {vn}")
             for p, t in (("v2_", "V2 curvy, bare legs"), ("v3_", "V3 curvy, tights"))]
    row = Image.new("RGB", (1400, 1610)); [row.paste(c, (i * 700, 0)) for i, c in enumerate(cells)]; rows.append(row)
# butt profile close-up: side view hips, base vs V2 vs V3, scaled 1.5x
cl = [lab(Image.open(f"{E}{p}ours_084.png").convert("RGB").crop((330, 780, 760, 1240)).resize((466, 498)), t)
      for p, t in (("", "base (his)"), ("v2_", "V2 butt"), ("v3_", "V3 butt"))]
row = Image.new("RGB", (1400, 1610), (235, 221, 199)); [row.paste(c, (i * 466, 0)) for i, c in enumerate(cl)]
cb = [lab(Image.open(f"{E}{p}ours_125.png").convert("RGB").crop((330, 780, 760, 1240)).resize((466, 498)), t)
      for p, t in (("", "base back"), ("v2_", "V2 back"), ("v3_", "V3 back"))]
[row.paste(c, (i * 466, 560)) for i, c in enumerate(cb)]
rows.append(row.crop((0, 0, 1400, 1060)))
H = sum(r.height for r in rows); sh = Image.new("RGB", (1400, H)); y = 0
for r in rows: sh.paste(r, (0, y)); y += r.height
sh.resize((700, H // 2)).save("review/variants_v2.png")
# low poly vs his
rows = []
for k, vn in VIEWS:
    his = np.asarray(Image.open(f"ref/frames/f{k + 1:03d}.png").convert("RGB")).astype(float)
    ours = np.asarray(Image.open(f"{E}ours_{k:03d}.png").convert("RGB")).astype(float)
    dif = np.clip(np.abs(ours - his).sum(-1, keepdims=True).repeat(3, -1), 0, 255)
    cells = [lab(Image.fromarray(np.clip(x, 0, 255).astype(np.uint8)).crop((200, 240, 900, 1850)), t)
             for x, t in ((his, f"his f{k + 1:03d} {vn}"), (ours, "ours low poly"), (0.5 * his + 0.5 * ours, "50% overlay"), (dif, "|diff|"))]
    row = Image.new("RGB", (2800, 1610)); [row.paste(c, (i * 700, 0)) for i, c in enumerate(cells)]; rows.append(row)
sh = Image.new("RGB", (2800, 1610 * 4)); [sh.paste(r, (0, i * 1610)) for i, r in enumerate(rows)]
sh.resize((1400, 3220)).save("review/lowpoly_vs_his.png")
# animation check
rows = []
for p, t in (("v2_", "V2"), ("v3_", "V3")):
    for a in ("walk", "run", "sit_floor"):
        ims = [Image.open(f"{E}{p}anim_{a}_3q_{i}.png").convert("RGB") for i in range(5)] + \
              [Image.open(f"{E}{p}anim_{a}_side_{i}.png").convert("RGB") for i in (1, 3)]
        row = Image.new("RGB", (360 * 7, 560)); [row.paste(im, (i * 360, 0)) for i, im in enumerate(ims)]; rows.append(lab(row, f"{t}: {a}"))
sh = Image.new("RGB", (2520, 560 * len(rows))); [sh.paste(r, (0, i * 560)) for i, r in enumerate(rows)]
sh.resize((1260, 280 * len(rows))).save("review/variants_anims.png")
print("final sheets written")
