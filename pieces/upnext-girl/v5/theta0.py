import sys, json, numpy as np; sys.path.insert(0, "."); from fit import *
from PIL import Image
cam = json.load(open("turn_cam.json"))
D = "F:/Claude Proyectos/fuentes/mml2-girl-tutorial/frames/turn5/"
MS = np.unpackbits(np.load("turn5_masks.npy"), axis=-1)[..., :W0].astype(bool)
SC = 0.25
def hc(k):
    a = Image.open(D + "t%03d.png" % (k + 1)).convert("RGB").resize((480, 270), Image.NEAREST)
    c = classify(np.asarray(a)); m = MS[k, ::4, ::4]; c[~m] = 0; c[m & (c == 0)] = -1; return c
d = np.load(sys.argv[1] if len(sys.argv) > 1 else "tris_v4_hip.npz")
ks = list(range(0, 50, 5)); H = {k: hc(k) for k in ks}
res = []
for t0 in range(-180, 180, 10):
    s = np.mean([cls_score(raster_cls(d["tris"], d["col"], {**cam, "theta": t0 - 7.2 * k}, SC), H[k]) for k in ks])
    res.append((s, t0))
res.sort(reverse=True); print(res[:5])
