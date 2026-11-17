"""IoU per band + overlay for a single reference view: python ov_single.py <posed npz> <view>"""
import sys, json, numpy as np
sys.path.insert(0, "."); import rast
from fit import his, scores, FR, FRAMES
from PIL import Image
d = np.load(sys.argv[1]); view = sys.argv[2]; cam = json.loads(str(d["cam"]))
om = rast.raster_cls(d["tris"], d["col"], cam, 0.5) != 0; hm = his(view, 0.5)
print(view, {k: round(float(v), 3) for k, v in scores(om, hm, view).items()})
a = np.asarray(Image.open(FR + FRAMES[view]).convert("RGB").resize((960, 540))).astype(float)
o = a * 0.7; o[om & ~hm] = [255, 50, 50]; o[hm & ~om] = [50, 140, 255]; o[om & hm] = a[om & hm] * 0.6 + 60
ys, xs = np.nonzero(hm | om)
Image.fromarray(o.astype(np.uint8)).crop((xs.min() - 20, ys.min() - 20, xs.max() + 20, ys.max() + 20)).save(f"ov_{view}.png")
