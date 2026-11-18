"""venv: consecutive-frame pop check of the whole picture (default: the preview frames review/preview/nc_*, no captions).
python tools/popcheck_final.py [dir prefix out] Step diffs at the planned cuts are
expected; any other step > max(4x the beat's median, 8) is flagged. -> review/popcheck_final.txt"""
import json, os
import numpy as np
from PIL import Image
import sys
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DIR = sys.argv[1] if len(sys.argv) > 1 else os.path.join(H, "review", "preview"); PRE = sys.argv[2] if len(sys.argv) > 2 else "nc_"
OUTF = sys.argv[3] if len(sys.argv) > 3 else os.path.join(H, "review", "popcheck_preview.txt")
B = json.load(open(os.path.join(H, "review", "beats.json"))); END = max(v[1] for v in B.values())
cuts = {v[0] for v in B.values()}
prev = None; d = np.zeros(END)
for f in range(END):
    a = np.asarray(Image.open(os.path.join(DIR, f"{PRE}{f:05d}.png")).convert("L").resize((270, 480), Image.NEAREST), np.float32)
    if prev is not None:
        d[f] = np.abs(a - prev).mean()
    prev = a
rep, flags = [], []
for k, (a, b, _) in B.items():
    inner = [f for f in range(a + 1, b)]
    med = float(np.median(d[inner])) if inner else 0
    for f in inner:
        if d[f] > max(4 * med, 8):
            flags.append((k, f, round(float(d[f]), 1), round(med, 1)))
rep.append(f"{END} frames; cut steps (expected): {len(cuts) - 1}; in-shot step median {np.median(d[[f for f in range(1, END) if f not in cuts]]):.2f}")
rep.append(f"flags (beat, frame, step, beat median): {flags or 'none'}")
open(OUTF, "w").write("\n".join(rep) + "\n"); print("\n".join(rep))
