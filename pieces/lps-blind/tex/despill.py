"""venv: kill the magenta fringe in photoprop textures (ref/*_tex.png: replace with the nearest clean texel) and
alpha cut-outs (ref/*_cut.png: magenta-ish texels -> transparent). Also writes ref/<x>_cut.png for the lathe props
(the eyeball targets). python tex/despill.py"""
import glob, os
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt

R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ref")


def magenta(a):
    r, g, b = (a[..., i].astype(int) for i in range(3))
    return (r - g > 60) & (b - g > 60)


for f in glob.glob(os.path.join(R, "*_tex.png")):
    a = np.asarray(Image.open(f).convert("RGB")).copy(); m = magenta(a)
    if m.any():
        _, (iy, ix) = distance_transform_edt(m, return_indices=True); a = a[iy, ix]
        Image.fromarray(a).save(f); print("tex", os.path.basename(f), int(m.sum()))
for nm in ("clock_nohands", "mug", "lamp", "door", "window", "shelf"):                      # alpha cut-outs of the lathe props
    a = np.asarray(Image.open(os.path.join(R, nm + ".jpg")).convert("RGB")).astype(float)
    k = np.linalg.norm(a - a[5, 5], axis=2) > 90
    ys, xs = np.where(k); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]; k = k[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = Image.fromarray(a.astype(np.uint8)); h = 224 if nm in ('door', 'window', 'shelf') else 160; w = round(h * im.width / im.height)
    rgba = np.dstack([np.asarray(im.resize((w, h), Image.BOX)), np.asarray(Image.fromarray((k * 255).astype(np.uint8)).resize((w, h), Image.BOX))])
    Image.fromarray(rgba.astype(np.uint8)).save(os.path.join(R, nm + "_cut.png"))
for f in glob.glob(os.path.join(R, "*_cut.png")):
    a = np.asarray(Image.open(f).convert("RGBA")).copy()
    m = magenta(a) | (a[..., 3] < 128)
    a[..., 3] = np.where(m, 0, 255)
    _, (iy, ix) = distance_transform_edt(m, return_indices=True)
    a[..., :3] = a[iy, ix, :3]                                     # transparent texels carry the edge colour (no halo)
    Image.fromarray(a).save(f); print("cut", os.path.basename(f), int(m.sum()))
