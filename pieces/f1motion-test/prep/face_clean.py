"""Remove white hoodie remnants under the chin from the head cutouts (bright, low-saturation pixels in the lower 40% of the head)."""
import numpy as np
from pathlib import Path
from PIL import Image
F = Path(__file__).resolve().parent / "face"
n = 0
for f in sorted(F.glob("o*.png")):
    if f.stat().st_size < 5000: continue
    im = np.asarray(Image.open(f)).copy()
    a = im[:, :, 3]
    ys, xs = np.nonzero(a > 128)
    if len(ys) < 2000: continue
    y0, y1 = ys.min(), ys.max()
    rgb = im[:, :, :3].astype(np.int16)
    mx, mn = rgb.max(2), rgb.min(2)
    white = (mn > 150) & ((mx - mn) < 28)
    zone = np.zeros_like(white); zone[int(y0 + (y1 - y0) * 0.58):] = True
    kill = white & zone
    # grow the kill mask 2 px so the hoodie edge goes too
    k2 = kill.copy()
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1),(2,0),(0,2),(0,-2)):
        k2 |= np.roll(np.roll(kill, dy, 0), dx, 1)
    im[:, :, 3] = np.where(k2 & zone, 0, a)
    Image.fromarray(im).save(f); n += 1
print("cleaned", n)
