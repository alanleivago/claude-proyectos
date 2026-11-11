"""venv: stranger_b's front view has a strand of ponytail poking out at her left neck (user: "dark strand on her neck").
Key it out (set the dark, non-skin pixels in that box to the sheet's magenta) -> ref/flow/retouch/stranger_b.jpg."""
import os
import numpy as np
from PIL import Image
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
src = os.path.join(H, "ref", "flow", "gen", "2026-11-06T15-33-39-photographic-character-reference-sheet-o-1.jpg")
a = np.asarray(Image.open(src).convert("RGB")).copy()
x0, x1, y0, y1 = 274, 302, 118, 160
reg = a[y0:y1, x0:x1].astype(int); lum = reg.mean(-1)
hair = (lum < 120) | ((reg[..., 0] - reg[..., 2]) < 40) & (lum < 150)          # dark / not skin
bg = np.array([214, 66, 186])                                                   # the sheet's magenta
reg[hair] = bg; a[y0:y1, x0:x1] = reg
Image.fromarray(a.astype(np.uint8)).save(os.path.join(H, "ref", "flow", "retouch", "stranger_b.jpg"), quality=95)
print("retouched", int(hair.sum()), "px")
