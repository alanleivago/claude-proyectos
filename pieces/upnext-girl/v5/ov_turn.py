"""overlay sheet of posed_<tag>.npz on his turntable frames: red = ours only, blue = his only. Prints IoU per band."""
import sys, json, numpy as np
sys.path.insert(0, "."); import rast
from PIL import Image
from scipy import ndimage as nd
tag = sys.argv[1]; ks = [int(x) for x in sys.argv[2].split(",")] if len(sys.argv) > 2 else list(range(0, 50, 5))
d = np.load(f"posed_{tag}.npz"); cam = json.load(open("turn_cam.json"))
MS = np.unpackbits(np.load("turn5_masks.npy"), axis=-1)[..., :1920].astype(bool)
D = "/Users/alanleiva/claude-proyectos/fuentes/mml2-girl-tutorial/frames/turn5/"
BANDS = (("head", 0.0, 0.215), ("body", 0.215, 0.585), ("legs", 0.585, 1.0))
def iou(a, b): return (a & b).sum() / max(1, (a | b).sum())
tiles = []; tot = {n: [] for n in ("all", "head", "body", "legs")}
for k in ks:
    p = dict(cam); p["theta"] = float(d["theta0"]) - 7.2 * k
    om = rast.raster_cls(d["tris"], d["col"], p, 0.5) != 0
    hm = MS[k, ::2, ::2]
    ys = np.nonzero(hm.any(1))[0]; y0, y1 = ys.min(), ys.max() + 1
    r = {"all": iou(om, hm)}
    for n, a, b in BANDS:
        A, B = int(y0 + a * (y1 - y0)), int(y0 + b * (y1 - y0)); r[n] = iou(om[A:B], hm[A:B])
    for n in r: tot[n].append(r[n])
    a = np.asarray(Image.open(D + "t%03d.png" % (k + 1)).convert("RGB").resize((960, 540))).astype(float)
    o = a * 0.7; o[om & ~hm] = [255, 50, 50]; o[hm & ~om] = [50, 140, 255]
    o[om & hm] = a[om & hm] * 0.6 + 60
    tiles.append(Image.fromarray(o.astype(np.uint8)).crop((300, 30, 660, 510)))
    print(k, {n: round(v, 3) for n, v in r.items()})
print("MEAN", {n: round(float(np.mean(v)), 3) for n, v in tot.items()})
sh = Image.new("RGB", (360 * len(tiles), 480))
for i, t in enumerate(tiles): sh.paste(t, (360 * i, 0))
sh.save(f"ov_{tag}.png")
