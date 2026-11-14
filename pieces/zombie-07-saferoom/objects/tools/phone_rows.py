# silueta del telefono por filas desde la foto sobre blanco -> tex/phone_rows.txt (v, ancho relativo)
import numpy as np, os
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)) + "/.."
a = np.asarray(Image.open(H + "/photos/phone/c_5.jpg").convert("L"), float)[60:2240, 100:1200]
m = a < 120; ys = np.where(m.any(1))[0]; y0, y1 = ys[0], ys[-1]; xs = np.where(m.any(0))[0]; W = xs[-1] - xs[0]
out = []
for v in [0, 0.005, 0.015, 0.03, 0.1, 0.5, 0.9, 0.97, 0.985, 0.995, 1.0]:
    r = m[min(y1, int(y0 + (1 - v) * (y1 - y0)))]; xx = np.where(r)[0]
    out.append(f"{v} {(xx[-1] - xx[0]) / W if len(xx) > 1 else 0.6:.3f}")
open(H + "/tex/phone_rows.txt", "w").write("\n".join(out)); print(out)
