# pops on a held-frame cadence (the tapestry wiggle re-seeds every few frames): compare each changed frame with the
# previous distinct frame at half res, flag jumps > 1.8x the local median that are not inside a panel slide.
import sys, json, glob, numpy as np
from PIL import Image
fr = sorted(glob.glob(sys.argv[1] + '/f*.png')); TB = [p['t0'] for p in json.load(open('board/times.json'))[1:]]
L = lambda f: np.asarray(Image.open(f).convert('L').reduce(2), np.float32)
prev = L(fr[0]); ch = []
for i in range(1, len(fr)):
    q = L(fr[i]); c = int((np.abs(q - prev) > 25).sum())
    if c: ch.append((i, c)); prev = q
c = np.array([x[1] for x in ch]); out = []
for k, (i, v) in enumerate(ch):
    nb = np.median(np.r_[c[max(0, k - 4):k], c[k + 1:k + 5]]); t = i / 24
    if v > 1.8 * max(nb, 500) and not any(abs(t - b) < 0.55 for b in TB): out.append((i, round(t, 2), v, int(nb)))
print(len(ch), 'changed frames; pops outside slides:', out or 'none')
