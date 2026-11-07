"""venv: python tools/overlay.py -> review/overlay_side.png: the ortho side render (review/check/ortho_side.png) with the
Flow reference's silhouette outline on top (scaled to the same height, aligned at the ground and the nose)."""
import os
import numpy as np
from PIL import Image, ImageFilter

H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ref = np.asarray(Image.open(os.path.join(H, "ref", "side.jpg")).convert("RGB"), float)
rm = np.linalg.norm(ref - ref[5, 5], axis=2) > 40
rm[:, :5] = rm[:, -5:] = False
dog = Image.open(os.path.join(H, "review", "check", "ortho_side.png")).convert("RGB")
d = np.asarray(dog, float)
dm = np.linalg.norm(d - d[5, 5], axis=2) > 30


def box(m):
    ys, xs = np.nonzero(m)
    return xs.min(), xs.max(), ys.min(), ys.max()


rx0, rx1, ry0, ry1 = box(rm[:int(rm.shape[0] * 0.93)])
ry1 = int(np.nonzero(rm.any(1))[0].max() * 0.995)
dx0, dx1, dy0, dy1 = box(dm)
k = (dy1 - dy0) / (ry1 - ry0)
small = Image.fromarray((rm * 255).astype(np.uint8)).resize((int(rm.shape[1] * k), int(rm.shape[0] * k)))
canvas = Image.new("L", dog.size, 0)
canvas.paste(small, (int(dx0 - rx0 * k), int(dy1 - ry1 * k)))
edge = np.asarray(canvas.filter(ImageFilter.FIND_EDGES)) > 60
out = np.asarray(dog).copy()
out[edge] = (0, 160, 255)
Image.fromarray(out).save(os.path.join(H, "review", "overlay_side.png"))
print("dog height px", dy1 - dy0, "length px", dx1 - dx0, "ref scaled length", (rx1 - rx0) * k)
