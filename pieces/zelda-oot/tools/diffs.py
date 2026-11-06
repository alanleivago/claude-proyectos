# consecutive-frame difference (mean abs, 320x180 gray) for frames a..b-1 (needs frame a-1 too if present) -> appends to renders/diffs.jsonl
import sys, json, os, numpy as np
from PIL import Image
a, b = int(sys.argv[1]), int(sys.argv[2]); prev = None; out = open('renders/diffs.jsonl', 'a')
for f in range(max(0, a - 1), b):
    p = f'frames/f{f:04d}.png'
    if not os.path.exists(p): prev = None; continue
    x = np.asarray(Image.open(p).convert('L').resize((320, 180)), np.float32)
    if prev is not None and f >= a: out.write(json.dumps([f, round(float(np.abs(x - prev).mean()), 2)]) + '\n')
    prev = x
