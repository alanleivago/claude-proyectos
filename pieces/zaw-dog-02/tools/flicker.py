"""venv: temporal flicker metric on a folder of frames. Flicker = pixels that jump and jump back: the 2nd temporal
difference |f(t+1) - 2 f(t) + f(t-1)| on the 270x480 PS1 grid (smooth motion keeps it low, z-fight / jitter / dither
crawl make it high). Prints per-beat mean and the share of 'flicker pixels' (2nd diff > 40), skipping cuts.
python tools/flicker.py <dir> [beat ...]          (dir with #####.png)
python tools/flicker.py <dir> --map f0 f1 out.png  (heat map of where it flickers, summed over f0..f1)"""
import json, os, sys
import numpy as np
from PIL import Image

H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
B = json.load(open(os.path.join(H, "review", "beats.json")))
d = sys.argv[1]


def g(f):
    return np.asarray(Image.open(os.path.join(d, f"{f:05d}.png")).convert("L").resize((270, 480), Image.NEAREST), np.float32)


if "--map" in sys.argv:
    i = sys.argv.index("--map"); f0, f1, out = int(sys.argv[i + 1]), int(sys.argv[i + 2]), sys.argv[i + 3]
    acc = np.zeros((480, 270))
    a, b = g(f0), g(f0 + 1)
    for f in range(f0 + 2, f1):
        c = g(f); acc += np.abs(c - 2 * b + a) > 40; a, b = b, c
    Image.fromarray((np.clip(acc / max(1, acc.max()), 0, 1) * 255).astype(np.uint8)).resize((540, 960)).save(out)
    print("map", out, "max", acc.max())
    sys.exit()
beats = [x for x in sys.argv[2:]] or list(B)
for k in beats:
    a0, a1, _ = B[k]
    fs = [f for f in range(a0, a1) if os.path.exists(os.path.join(d, f"{f:05d}.png"))]
    if len(fs) < 3:
        continue
    vals, share = [], []
    a, b = g(fs[0]), g(fs[1])
    for f in fs[2:]:
        c = g(f); s2 = np.abs(c - 2 * b + a); vals.append(s2.mean()); share.append((s2 > 40).mean() * 100); a, b = b, c
    print(f"{k}: 2nd-diff mean {np.mean(vals):.2f}  flicker px {np.mean(share):.2f}%  worst frame {fs[2 + int(np.argmax(share))]} {max(share):.2f}%")
