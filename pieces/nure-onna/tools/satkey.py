# satkey.py <in.jpg> <out.png>: keys out a saturated flat background (magenta, blue...) from a greyscale figure.
# Background = strongly coloured pixels (absolute chroma, so a near-black with a faint tint stays opaque) that are
# connected to the image border; every enclosed area stays opaque, so the figure never gets see-through patches.
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
im = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)
mx, mn = im.max(2), im.min(2)
bgc = (mx - mn) > 70                                           # clearly coloured
lab, _ = ndimage.label(bgc)
edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
bg = np.isin(lab, edge[edge > 0])
bg = ndimage.binary_dilation(bg, iterations=1)                 # eat the 1-px colour fringe
fig = ~bg
fig = ndimage.binary_fill_holes(fig)
fig = ndimage.binary_opening(fig, iterations=1)                # drop specks left in the background
a = fig.astype(np.float32)
grey = np.asarray(Image.fromarray(mn.astype(np.uint8)).filter(ImageFilter.MedianFilter(3))).astype(np.float32)
out = np.dstack([grey, grey, grey, a * 255]).astype(np.uint8)
img = Image.fromarray(out, 'RGBA'); img.save(sys.argv[2])
print(sys.argv[2], 'opaque %.1f%%' % (100 * a.mean()), 'bbox', img.getbbox())
