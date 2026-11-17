"""eye span (green irises) and eye-centre -> chin distance in px: ours (rr_<view>.png) vs his frame, same camera"""
import numpy as np, sys
from PIL import Image
from scipy import ndimage as nd
F = "F:/Claude Proyectos/fuentes/mml2-girl-tutorial/frames/"
V = {"q3": F + "turn5/t046.png", "idle": F + "cam/front_idle.png", "front": F + "rest2/r011.png", "side": F + "turn5/t011.png"}


def feats(a, box):
    x0, y0, x1, y1 = box; a = a[y0:y1, x0:x1].astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    green = (g > r + 25) & (g > b + 25) & (g > 70)
    lab, n = nd.label(green); sz = nd.sum(green, lab, range(1, n + 1))
    keep = [i + 1 for i in np.argsort(-sz)[:2] if sz[i] > 4]
    m = np.isin(lab, keep); ys, xs = np.nonzero(m)
    skin = (r > 225) & (g > 170) & (b > 120) & (b < 200)
    cx = int(xs.mean()); ey = int(ys.mean())
    col = skin[:, max(0, cx - 6):cx + 6].any(1); sy = np.nonzero(col)[0]; chin = sy.max()
    return dict(eye_span=int(xs.max() - xs.min()), eye_h=int(ys.max() - ys.min()), eye_to_chin=int(chin - ey), eye_y=ey + y0, cx=cx + x0)


for v in sys.argv[1:]:
    h = np.asarray(Image.open(V[v]).convert("RGB")); o = np.asarray(Image.open(f"rr_{v}.png").convert("RGBA"))
    al = o[..., 3:4] / 255.0; oc = (o[..., :3] * al + 40 * (1 - al)).astype(np.uint8)
    hm = np.asarray(Image.open({"q3": "ref_q3_mask.png", "idle": "ref_front_idle_mask.png", "front": "ref_front_mask.png", "side": "ref_side_mask.png"}[v])) > 127
    ys, xs = np.nonzero(hm); Ht = ys.max() - ys.min()
    box = (xs.min(), ys.min(), xs.max(), int(ys.min() + 0.24 * Ht))
    print(v, "his", feats(h, box), "ours", feats(oc, box))
