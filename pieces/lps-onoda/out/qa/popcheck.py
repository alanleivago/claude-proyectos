"""Frame-to-frame pop check: mean |diff| of consecutive frames (renders/frames, 270x480 gray); flags spikes outside the
shot cuts (> 3x the local median and > 6 levels).  python out/qa/popcheck.py"""
import json, os
import numpy as np
from PIL import Image

H = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TIM = json.load(open(os.path.join(H, "voice", "timing.json")))
CUT = [max(0, round((s - 0.15) * 30)) if i else 0 for i, s in enumerate(TIM["starts"])]
END = round(TIM["end"] * 30)
SRC = os.path.join(H, "renders", "frames")
load = lambda f: np.asarray(Image.open(os.path.join(SRC, f"{f:05d}.png")).convert("L").resize((270, 480)), np.float32)
d = np.zeros(END)
prev = load(0)
for f in range(1, END):
    cur = load(f); d[f] = np.abs(cur - prev).mean(); prev = cur
flags = []
for f in range(1, END):
    if f in CUT:
        continue
    lo, hi = max(1, f - 7), min(END, f + 8)
    loc = np.median([d[g] for g in range(lo, hi) if g != f and g not in CUT])
    if d[f] > 3 * max(loc, 0.5) and d[f] > 6:
        flags.append((f, round(float(d[f]), 1), round(float(loc), 1)))
json.dump({"diff": d.round(2).tolist(), "flags": flags}, open(os.path.join(H, "out", "qa", "popcheck.json"), "w"))
print("cuts", CUT[1:])
print("flagged (frame, diff, local median):", flags)
