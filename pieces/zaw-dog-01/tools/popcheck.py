"""venv: consecutive-frame pop check of review/anim/<beat>/ -> mean abs diff per step; flags steps > 3x the median
(and > 6 levels). Also writes a strip of the flagged pairs.  python tools/popcheck.py 01a 10a ..."""
import glob, os, sys
import numpy as np
from PIL import Image
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); rep = []
for b in sys.argv[1:]:
    fs = sorted(glob.glob(os.path.join(H, "review", "anim", b, "*.png")))
    a = [np.asarray(Image.open(f).convert("L"), np.float32) for f in fs]
    d = np.array([np.abs(a[i + 1] - a[i]).mean() for i in range(len(a) - 1)])
    med = float(np.median(d)); flags = [(os.path.basename(fs[i]), os.path.basename(fs[i + 1]), round(float(x), 2)) for i, x in enumerate(d) if x > max(3 * med, 6)]
    rep.append(f"{b}: {len(fs)} frames, step diff median {med:.2f}, max {d.max():.2f}, flags {flags or 'none'}")
open(os.path.join(H, "review", "popcheck.txt"), "w").write("\n".join(rep) + "\n"); print("\n".join(rep))
