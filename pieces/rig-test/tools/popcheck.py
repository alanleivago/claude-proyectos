# Frame-to-frame pop check: mean abs diff between consecutive frames; a frame whose diff is > 2.2x the median of its
# neighbours (and above a floor) is a pop. Also reports the motion of the character's silhouette bbox.
import sys, glob, numpy as np
from PIL import Image
fs = sorted(glob.glob(sys.argv[1] + '/f*.png'), key=lambda p: int(p.split('/f')[-1][:-4]))
prev = None; d = []
for f in fs:
    im = np.asarray(Image.open(f).convert('L').resize((480, 270)), np.float32)
    if prev is not None: d.append(np.abs(im - prev).mean())
    prev = im
d = np.array(d); pops = []
for i in range(len(d)):
    nb = np.r_[d[max(0, i - 4):i], d[i + 1:i + 5]]
    if d[i] > 0.35 and d[i] > 2.2 * np.median(nb): pops.append((i + 1, round(float(d[i]), 3), round(float(np.median(nb)), 3)))
print(f"{len(fs)} frames, diff mean {d.mean():.3f}, max {d.max():.3f} at f{d.argmax()+1}")
print("POPS:", pops if pops else "none")
