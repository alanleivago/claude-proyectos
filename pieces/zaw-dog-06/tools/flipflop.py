"""venv: TRUE flicker = pixels that jump and jump BACK (sign reversal, both steps > 40 on the 270x480 PS1 grid) - unlike
flicker.py's 2nd difference, a clean camera move (edges sweeping one way) does not count.  python tools/flipflop.py <dir> [beat ...]"""
import json, os, sys
import numpy as np
from PIL import Image
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); B = json.load(open(os.path.join(H, "review", "beats.json"))); d = sys.argv[1]
g = lambda f: np.asarray(Image.open(os.path.join(d, f"{f:05d}.png")).convert("L").resize((270, 480), Image.NEAREST), np.float32)
for k in sys.argv[2:] or list(B):
    a0, a1, _ = B[k]; fs = [f for f in range(a0, a1) if os.path.exists(os.path.join(d, f"{f:05d}.png"))]
    if len(fs) < 3:
        continue
    a, b = g(fs[0]), g(fs[1]); sh = []
    for f in fs[2:]:
        c = g(f); d1, d2 = b - a, c - b
        sh.append(((np.abs(d1) > 40) & (np.abs(d2) > 40) & (np.sign(d1) != np.sign(d2))).mean() * 100); a, b = b, c
    print(f"{k}: flip-flop {np.mean(sh):.2f}%  worst {max(sh):.2f}%")
