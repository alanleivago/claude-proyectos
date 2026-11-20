"""side_compare.jpg: a large pure side view of the full body, his vs ours, plus our silhouette with his outline on top
(both scaled to the same height, aligned at the centre of the rolled jeans cuff) so the leg line (belly - belt - thigh - knee - shin, butt -
back of the thigh - calf) can be read directly.
    .venv/bin/python sidecmp.py out.jpg his.jpg x0,y0,x1,y1(roi fractions) ours.png [--h 1100] [--title "..."]"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

a = sys.argv[1:]; out, his, roi, ours = a[:4]; H = 1100; title = ""
for i, t in enumerate(a):
    if t == "--h":
        H = int(a[i + 1])
    if t == "--title":
        title = a[i + 1]
FB = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 24)
FS = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 18)


def prep(path, roi=None):
    im = Image.open(path).convert("RGB")
    if roi:
        W_, H_ = im.size; r = [float(x) for x in roi.split(",")]
        im = im.crop((int(r[0] * W_), int(r[1] * H_), int(r[2] * W_), int(r[3] * H_)))
    ar = np.asarray(im).astype(int)
    bg = np.median(np.concatenate([ar[:6].reshape(-1, 3), ar[:, :6].reshape(-1, 3), ar[:, -6:].reshape(-1, 3)]), 0)
    m = np.abs(ar - bg).sum(2) > 32
    m = np.asarray(Image.fromarray(m).filter(ImageFilter.MedianFilter(3)))
    rows = np.nonzero(m.sum(1) > 2)[0]; y0, y1 = rows.min(), rows.max()
    s = H / (y1 - y0)
    im2 = im.resize((int(im.size[0] * s), int(im.size[1] * s)), Image.LANCZOS)
    m2 = np.asarray(Image.fromarray(m).resize(im2.size, Image.NEAREST))
    yo = int(y0 * s)
    cuff = m2[int(y1 * s) - int(0.17 * H):int(y1 * s) - int(0.12 * H)]  # the rolled jeans cuff (boots differ in length)
    xs = np.nonzero(cuff.sum(0) > 1)[0]
    return im2, m2, yo, (xs.min() + xs.max()) / 2


A, mA, yA, hA = prep(his, roi); B, mB, yB, hB = prep(ours)
WC = 520; PAD = 60
def panel(im, yo, heel, bgc=None):
    c = Image.new("RGB", (WC, H + 2 * PAD), bgc or tuple(int(v) for v in np.asarray(im)[2, 2]))
    c.paste(im, (int(WC * 0.30 - heel), PAD - yo)); return c
PA = panel(A, yA, hA); PB = panel(B, yB, hB)
# overlay: our silhouette (grey) + his outline (yellow)
sil = Image.new("L", B.size, 0); sil.paste(Image.fromarray((mB * 255).astype(np.uint8)), (0, 0))
PO = Image.new("RGB", (WC, H + 2 * PAD), (30, 30, 34))
grey = Image.new("RGB", B.size, (150, 140, 175)); PO.paste(grey, (int(WC * 0.30 - hB), PAD - yB), sil)
ea = Image.fromarray((mA * 255).astype(np.uint8)); edge = np.asarray(ea.filter(ImageFilter.FIND_EDGES)) > 0
ed = Image.new("RGB", A.size, (255, 225, 0)); PO.paste(ed, (int(WC * 0.30 - hA), PAD - yA), Image.fromarray((edge * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)))
top = 50 + (36 if title else 0)
S = Image.new("RGB", (3 * WC + 4 * 16, top + H + 2 * PAD + 34), (24, 24, 26)); d = ImageDraw.Draw(S)
if title:
    d.text((16, 12), title, fill=(255, 255, 255), font=FB)
for k, (P, cap) in enumerate(((PA, "TomGrave3D (final turntable, side)"), (PB, "ownerf round 3 (orthographic side)"),
                              (PO, "ownerf silhouette + his outline (yellow)"))):
    x = 16 + k * (WC + 16); S.paste(P, (x, top)); d.text((x + 4, top + H + 2 * PAD + 6), cap, fill=(200, 200, 200), font=FS)
S.save(out, quality=90); print(out, S.size)
