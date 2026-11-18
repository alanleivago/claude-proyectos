"""Key a Flow layer shot on flat magenta or green into a trimmed RGBA PNG.
usage: python key.py in.jpg out.png magenta|green
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, out, mode = sys.argv[1], sys.argv[2], sys.argv[3]
im = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
R, G, B = im[..., 0], im[..., 1], im[..., 2]
if mode == "magenta":
    k = (np.minimum(R, B) - G) / 255.0
else:
    k = (G - np.maximum(R, B)) / 255.0
a = 1.0 - np.clip((k - 0.42) / (0.70 - 0.42), 0, 1)
# despill: pull the key colour out of what stays
if mode == "magenta":
    s = np.clip(np.minimum(R, B) - G - 70, 0, None)
    R -= s; B -= s
else:
    s = np.clip(G - np.maximum(R, B) - 20, 0, None)
    G -= s
alpha = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
rgb = Image.fromarray(np.clip(np.stack([R, G, B], -1), 0, 255).astype(np.uint8))
rgba = rgb.copy(); rgba.putalpha(alpha)
bb = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
print(out, "bbox", bb, "size", rgba.size)
rgba.save(out)
