"""head sheet: his FINAL head (intro turntable crops) vs ours (ortho renders), both scaled to the same hair-top -> chin
height and aligned at the hair top; columns centred on the head's own bounding box.
    .venv/bin/python headcmp.py out.jpg "LABEL|his.png|top_y,chin_y|ours.png|ortho_s,cz,top_z,chin_z" ... [--title "..."]
ours: square ortho render, world z -> row = N/2 - (z - cz) / ortho_s * N."""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

args = sys.argv[1:]; out = args[0]; title = ""; cells = []
i = 1
while i < len(args):
    if args[i] == "--title":
        title = args[i + 1]; i += 2; continue
    cells.append(args[i].split("|")); i += 1
HO, PT, PB = 430, 70, 150
WC = int(__import__('os').environ.get('WC', '470'))
FB = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
FS = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 17)


def place(im, top, chin):
    s = HO / (chin - top)
    a = np.asarray(im).astype(int)
    bg = np.median(np.concatenate([a[:6].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)]), 0)
    m = np.abs(a - bg).sum(2) > 40
    band = m[int(top):int(chin)]
    cols = np.nonzero(band.sum(0) > 1)[0]
    cx = (cols.min() + cols.max()) / 2 if len(cols) else im.size[0] / 2
    im2 = im.resize((int(im.size[0] * s), int(im.size[1] * s)), Image.LANCZOS)
    c = Image.new("RGB", (WC, PT + HO + PB), tuple(int(v) for v in bg))
    c.paste(im2, (int(WC / 2 - cx * s), int(PT - top * s)))
    return c


panels = []
for lab, ref, rl, ours, ol in cells:
    t, ch = (float(x) for x in rl.split(","))
    A = place(Image.open(ref).convert("RGB"), t, ch)
    s_, cz, tz, chz = (float(x) for x in ol.split(","))
    im = Image.open(ours).convert("RGB"); N = im.size[0]
    B = place(im, N / 2 - (tz - cz) / s_ * N, N / 2 - (chz - cz) / s_ * N)
    panels.append((lab, A, B))
top = 50 + (36 if title else 0)
S = Image.new("RGB", (len(panels) * (2 * WC + 24) + 12, top + PT + HO + PB + 34), (24, 24, 26)); d = ImageDraw.Draw(S)
if title:
    d.text((12, 12), title, fill=(255, 255, 255), font=FB)
x = 12
for lab, A, B in panels:
    d.text((x, top - 32), lab, fill=(255, 220, 90), font=FB)
    for P, cap in ((A, "TomGrave3D (painting stage)" if "hi-res" in lab else "TomGrave3D (final model)"), (B, "ownerf")):
        S.paste(P, (x, top)); dd = ImageDraw.Draw(S)
        for y in (top + PT, top + PT + HO):
            dd.line((x, y, x + WC, y), fill=(0, 170, 220))
        dd.text((x + 4, top + PT + HO + PB + 6), cap, fill=(190, 190, 190), font=FS)
        x += WC
    x += 24
S.save(out, quality=90)
print(out, S.size)
