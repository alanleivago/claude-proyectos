"""venv: the assistant ("pointer") atlas - skin-coloured smears on the sweater shoulders / arm tops (the neck skin sampled
into the shoulder rings) -> the sweater's own nearest colour. Neck rows and trousers untouched.
python tools/fix_sweater.py   (run after photohuman2.py prep/shoes for pointer)"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); sys.path.insert(0, H)
import photohuman2 as PH  # noqa: E402
p = os.path.join(H, "tex", "people3", "pointer_atlas.png")
A = np.asarray(Image.open(p).convert("RGB")).astype(int); W4, Hh, R = PH.layout()
r, g, b = A[..., 0], A[..., 1], A[..., 2]
sweater = (r > 140) & (g > 85) & (b < 105) & (r - b > 85)
zone = np.zeros(A.shape[:2], bool)
rb = R["body"]; zone[12:188, rb["px"]:rb["px"] + rb["w"]] = True                  # shoulders .. hem (neck rows above 12 stay skin)
for k in ("armL", "armR"):
    ra = R[k]; zone[0:int(ra["h"] * 0.92), ra["px"]:ra["px"] + ra["w"]] = True       # sleeves (the wrist end stays)
bad = zone & ~sweater
_, (iy, ix) = nd.distance_transform_edt(~(zone & sweater), return_indices=True)
A[bad] = A[iy[bad], ix[bad]]
Image.fromarray(A.astype(np.uint8)).save(p); print("fixed", int(bad.sum()), "texels")
