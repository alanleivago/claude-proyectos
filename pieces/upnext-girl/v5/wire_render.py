import sys, json, numpy as np
from PIL import Image
import wire_views as W
cams = json.load(open("wire_cams.json"))
for v in sys.argv[1:]:
    im, cov = W.render(v, cams[v]); im.save(f"wr_{v}.png")
    hm = W.his_mask(v); om = cov.copy(); om[1060:] = False
    print(v, "IoU", round((om & hm).sum() / max(1, (om | hm).sum()), 3))
