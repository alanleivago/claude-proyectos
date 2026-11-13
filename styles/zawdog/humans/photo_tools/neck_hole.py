"""Clear the neck opening of a garment sheet with the hole of a Flow edit (venv). Flow edits keep the layout but may
change the rest (background colour, an inner shirt), so only the edit's new magenta neck hole is copied onto the
original: pixels magenta in the edit, garment in the original, in the upper front view.
    .venv/bin/python styles/zawdog/humans/photo_tools/neck_hole.py <original.jpg> <edit.jpg> <out.png> [--keep-blue]
--keep-blue keeps light-blue pixels (an inner shirt the edit wrongly removed)."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from parts import bg_mask  # noqa: E402
o = np.asarray(Image.open(sys.argv[1]).convert("RGB").resize((1376, 768), Image.LANCZOS), np.float32)
e = np.asarray(Image.open(sys.argv[2]).convert("RGB").resize((1376, 768), Image.LANCZOS), np.float32)
hole = bg_mask(e) & ~bg_mask(o)
hole[300:] = False; hole[:, 688:] = False                      # front view, upper body only
if "--keep-blue" in sys.argv:
    hole &= ~((o[..., 2] > o[..., 0] + 10) & (o[..., 2] > 120))
lab, n = nd.label(hole)
if n:
    sz = nd.sum(hole, lab, range(1, n + 1)); hole = lab == (1 + int(np.argmax(sz)))   # the one neck hole
hole = nd.binary_dilation(hole, iterations=1)
out = o.copy(); out[hole] = (255, 0, 255)
Image.fromarray(out.astype(np.uint8)).save(sys.argv[3]); print("hole px", int(hole.sum()))
