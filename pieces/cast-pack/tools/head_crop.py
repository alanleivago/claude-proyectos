"""crop the front-view head + shoulders of humans/<slug>/src/sheet.jpg -> src/head_crop.png (680 px), the reference for the
Flow neutral portrait.   .venv/bin/python pieces/cast-pack/tools/head_crop.py <slug>"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "styles", "zawdog", "humans", sys.argv[1], "src")
im = Image.open(os.path.join(H, "sheet.jpg")).convert("RGB"); a = np.asarray(im).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
bg = (r > 150) & (b > 150) & (g < 130)
fg = nd.binary_opening(~bg, iterations=2); lab, n = nd.label(fg)
sizes = nd.sum(fg, lab, range(1, n + 1)); big = [i + 1 for i in np.argsort(sizes)[::-1][:3]]
li = min(big, key=lambda i: np.flatnonzero((lab == i).any(0)).mean())
ys, xs = np.nonzero(lab == li); y0, y1 = ys.min(), ys.max(); hgt = y1 - y0
top = lab[y0:y0 + int(0.12 * hgt)] == li; cx = np.nonzero(top)[1].mean()
s = int(0.30 * hgt); x0 = int(cx - s / 2); yy = int(y0 - 0.03 * hgt)
im.crop((x0, yy, x0 + s, yy + s)).resize((680, 680), Image.LANCZOS).save(os.path.join(H, "head_crop.png"))
print(os.path.join(H, "head_crop.png"))
