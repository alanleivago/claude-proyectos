# ep10 (stairs): fotos de Flow aisladas -> recorte PNG (photos/_cut) -> texturas PS1 (128 px, 32 colores) en ../engine/tex/ep10/
# python -I tools/prep_ep10.py
import numpy as np, os
from PIL import Image, ImageFilter
from scipy import ndimage
H = os.path.dirname(os.path.abspath(__file__)) + "/.."; P = H + "/photos"; CUT = P + "/_cut"; OUT = H + "/../engine/tex/ep10"
os.makedirs(CUT, exist_ok=True); os.makedirs(OUT, exist_ok=True)
def cut(name, tol=18):
    im = Image.open(f"{P}/{name}/f_1.jpg").convert("RGB"); a = np.asarray(im, float)
    e = (np.abs(a - 255).max(-1) > tol)
    E = np.pad(np.asarray(Image.fromarray((e * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))) > 0, 2); lab, _ = ndimage.label(~E)
    m = (lab != lab[0, 0])[2:-2, 2:-2]; m = ndimage.binary_fill_holes(m)
    ys, xs = np.where(m); box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    im, m = im.crop(box), m[box[1]:box[3], box[0]:box[2]]
    rgba = Image.fromarray(np.dstack([np.asarray(im), (m * 255).astype(np.uint8)]), "RGBA"); rgba.save(f"{CUT}/{name}.png"); return rgba
def ps1(rgba, w, h, name):
    small = rgba.resize((w, h), Image.LANCZOS); a = np.asarray(small).copy()
    rgb = Image.fromarray(a[..., :3]).quantize(32, dither=Image.Dither.NONE).convert("RGB")
    out = np.dstack([np.asarray(rgb), np.where(a[..., 3] > 128, 255, 0).astype(np.uint8)])
    Image.fromarray(out, "RGBA").save(f"{OUT}/{name}.png"); print(name, w, h)
s = cut("shelf"); ps1(s, 96, 128, "shelf_front"); print("shelf aspect", s.size[1] / s.size[0])
b = cut("backpack"); ps1(b, 96, 112, "backpack_front"); print("backpack aspect", b.size[1] / b.size[0])
# costado del morral: franja vertical del borde izquierdo de la foto (lona + bolsillo lateral)
bb = np.asarray(b); x0 = int(bb.shape[1] * 0.12); side = Image.fromarray(bb[:, x0:x0 + int(bb.shape[1] * 0.12)]).resize((24, 112), Image.LANCZOS).convert("RGB").quantize(16, dither=Image.Dither.NONE).convert("RGB"); side.save(f"{OUT}/backpack_side.png")
