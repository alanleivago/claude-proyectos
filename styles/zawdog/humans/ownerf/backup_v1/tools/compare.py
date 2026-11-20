"""side-by-side sheet: reference frames vs our renders, each cropped to the figure's bounding box and scaled to the same
height.   .venv/bin/python compare.py out.jpg "label|ref.jpg|ours.png" ... [--h 760] [--title "..."]"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

args = sys.argv[1:]
out = args[0]; items = []; Hh = 760; title = ""
i = 1
while i < len(args):
    if args[i] == "--h":
        Hh = int(args[i + 1]); i += 2; continue
    if args[i] == "--title":
        title = args[i + 1]; i += 2; continue
    items.append(args[i].split("|")); i += 1
FNT = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
FNS = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 18)


def crop_fig(path, pad=0.04, roi=None):
    im = Image.open(path).convert("RGB")
    if roi:
        W_, H_ = im.size; im = im.crop((int(roi[0] * W_), int(roi[1] * H_), int(roi[2] * W_), int(roi[3] * H_)))
    a = np.asarray(im).astype(int)
    bg = np.median(np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)]), 0)
    m = np.abs(a - bg).sum(2) > 40
    rows = np.nonzero(m.sum(1) > 2)[0]; cols = np.nonzero(m.sum(0) > 2)[0]
    if not len(rows):
        return im
    y0, y1, x0, x1 = rows.min(), rows.max(), cols.min(), cols.max()
    p = int((y1 - y0) * pad)
    return im.crop((max(x0 - p, 0), max(y0 - p, 0), min(x1 + p, im.size[0]), min(y1 + p, im.size[1])))


cells = []
for it in items:
    lab, ref, ours = it[0], it[1], it[2]
    roi = [float(x) for x in it[3].split(",")] if len(it) > 3 and it[3] else None
    a = crop_fig(ref, roi=roi); b = crop_fig(ours)
    a = a.resize((int(a.size[0] * Hh / a.size[1]), Hh), Image.LANCZOS); b = b.resize((int(b.size[0] * Hh / b.size[1]), Hh), Image.LANCZOS)
    cells.append((lab, a, b))
pad = 16; top = 46 + (40 if title else 0)
Wt = sum(a.size[0] + b.size[0] + 3 * pad for _, a, b in cells) + pad
S = Image.new("RGB", (Wt, Hh + top + 40), (24, 24, 26)); d = ImageDraw.Draw(S)
if title:
    d.text((pad, 10), title, fill=(255, 255, 255), font=FNT)
x = pad
for lab, a, b in cells:
    d.text((x, top - 34), lab, fill=(255, 220, 90), font=FNT)
    S.paste(a, (x, top)); d.text((x + 4, top + Hh + 8), "reference (TomGrave3D)", fill=(190, 190, 190), font=FNS)
    x += a.size[0] + pad
    S.paste(b, (x, top)); d.text((x + 4, top + Hh + 8), "ours (ownerf)", fill=(190, 190, 190), font=FNS)
    x += b.size[0] + 2 * pad
S.save(out, quality=90)
print(out, S.size)
