"""venv: the approved dog's REAR and TOP views (Flow, same markings, magenta) -> PS1 textures + projection metadata, so
build.fix_dog() can project real fur onto the back, rump, back of the neck/head (photo-based, VLVT method) instead of
the painted fills.   python prep_dogviews.py  -> tex/dog_rear.png, tex/dog_top.png, tex/dog_views.json"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

H = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(H, "tex"); G = os.path.join(H, "ref", "flow", "gen")
gen = sorted(os.listdir(G))
REAR = os.path.join(G, [f for f in gen if f.startswith("2026-11-06T11-45-55")][0])
TOP = os.path.join(G, [f for f in gen if f.startswith("2026-11-06T11-46-31")][0])


def keyed(path):
    a = np.asarray(Image.open(path).convert("RGB")).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = nd.binary_opening(~((r > 150) & (b > 150) & (g < 130) & (np.abs(r - b) < 90)), iterations=2)
    lab, n = nd.label(m); m = lab == (np.argmax(nd.sum(m, lab, range(1, n + 1))) + 1)
    ex = np.clip(np.minimum(r, b) - g, 0, None); a[..., 0] -= ex; a[..., 2] -= ex
    pk = np.clip(a[..., 2] - a[..., 1], 0, None)                        # magenta bounce on white fur: blue over green
    a[..., 2] -= pk; a[..., 0] -= pk                                     # (brown fur has b < g and is untouched)
    mm = nd.binary_erosion(m, iterations=3)
    _, (iy, ix) = nd.distance_transform_edt(~mm, return_indices=True)
    return np.clip(a[iy, ix], 0, 255).astype(np.uint8), m


def ps1(arr, box, tex_h):
    x0, x1, y0, y1 = box
    im = Image.fromarray(arr[y0:y1, x0:x1]); tw = max(16, round(tex_h * (x1 - x0) / (y1 - y0) / 4) * 4)
    return im.resize((tw, tex_h), Image.BOX).quantize(48, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


J = {}
a, m = keyed(REAR); ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
hips = [np.flatnonzero(m[y]) for y in range(int(y0 + 0.45 * (y1 - y0)), int(y0 + 0.6 * (y1 - y0)))]
cx = float(np.median([(r.min() + r.max()) / 2 for r in hips])); hw = float(np.median([(r.max() - r.min()) / 2 for r in hips]))
ps1(a, (x0, x1, y0, y1), 128).save(os.path.join(T, "dog_rear.png"))
J["rear"] = dict(box=[int(x0), int(x1), int(y0), int(y1)], cx=cx, sz=0.84 / (y1 - y0), sx=0.17 / hw)
a, m = keyed(TOP); ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
wd = {y: (lambda r: r.max() - r.min() if len(r) else 0)(np.flatnonzero(m[y])) for y in range(y0, y1)}
mid = [wd[y] for y in range(int(y0 + 0.45 * (y1 - y0)), int(y0 + 0.6 * (y1 - y0)))]; bw = float(np.median(mid))
rump = next(y for y in range(int(y0 + 0.6 * (y1 - y0)), y1) if wd[y] < 0.45 * bw)    # going down: the body ends, the tail starts
cxt = float(np.median([(lambda r: (r.min() + r.max()) / 2)(np.flatnonzero(m[y])) for y in range(int(y0 + 0.45 * (y1 - y0)), int(y0 + 0.6 * (y1 - y0)))]))
ps1(a, (x0, x1, y0, rump), 192).save(os.path.join(T, "dog_top.png"))
J["top"] = dict(box=[int(x0), int(x1), int(y0), int(rump)], cx=cxt, y_nose=-0.50, y_rump=0.315, sx=0.30 / bw)
json.dump(J, open(os.path.join(T, "dog_views.json"), "w"), indent=1); print(J)
