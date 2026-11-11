# per-frame changed pixels (>25 grey levels, full res) and isolated spikes; usage: popseries.py frames [from to]
import sys, numpy as np
from PIL import Image
def L(i): return np.asarray(Image.open(f'{sys.argv[1]}/f{i:04d}.png').convert('L'), np.float32)
n = len(__import__('glob').glob(sys.argv[1] + '/f*.png')); c = []; p = L(0)
for i in range(1, n): q = L(i); c.append(int((np.abs(q - p) > 25).sum())); p = q
c = np.array(c); sp = []
for i in range(2, len(c) - 2):
    nb = np.median(np.r_[c[max(0, i - 3):i], c[i + 1:i + 4]])
    if c[i] > 400 and c[i] > 2.5 * max(nb, 50): sp.append((i + 1, int(c[i]), int(nb)))
zero = [i + 1 for i in range(len(c)) if c[i] == 0]
print(f"{n} frames; spikes (frame, changed px, neighbour median): {sp or 'none'}")
print(f"frozen frames (no pixel changed): {len(zero)} {zero[:20]}")
if len(sys.argv) > 3: print([(i + 1, int(c[i])) for i in range(int(sys.argv[2]) - 1, int(sys.argv[3]))])
