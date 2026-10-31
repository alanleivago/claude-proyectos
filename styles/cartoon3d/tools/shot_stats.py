"""Shot boundaries in a finished short (hard cuts AND short dissolves) + continuous camera moves.
Samples 15 fps at 135 px wide; a boundary = local max of the 0.33 s-apart frame difference (colour histogram). Prints shot lengths. Usage: shot_stats.py video.mp4 [...]"""
import sys, json, cv2, numpy as np
def boundaries(path, fps=15, thr=0.25):
    # colour-histogram (HSV 12x6x6) Bhattacharyya distance between frames 0.2 s apart: a cut or dissolve swaps the
    # palette, a moving camera barely changes it. Calibrated on lego-sea (34/34 known boundaries at 0.15-0.2).
    cap = cv2.VideoCapture(path); src = cap.get(5) or 30; step = max(1, round(src / fps)); H = []; i = 0
    while True:
        ok, f = cap.read()
        if not ok: break
        if i % step == 0:
            hsv = cv2.cvtColor(cv2.resize(f, (135, 240)), cv2.COLOR_BGR2HSV)
            h = cv2.calcHist([hsv], [0, 1, 2], None, [12, 6, 6], [0, 180, 0, 256, 0, 256]); cv2.normalize(h, h); H.append(h)
        i += 1
    dur = i / src; k = 3
    d = np.array([0] * k + [cv2.compareHist(H[j], H[j - k], cv2.HISTCMP_BHATTACHARYYA) for j in range(k, len(H))])
    out = []
    for j in range(2, len(d) - 2):
        if d[j] > thr and d[j] == d[max(0, j - 5):j + 6].max():
            t = j / fps
            if not out or t - out[-1] > 0.45: out.append(t)
    return dur, out, float(np.median(d))
res = {}
for p in sys.argv[1:]:
    dur, B, base = boundaries(p); t = [0] + B + [dur]; L = [b - a for a, b in zip(t, t[1:])]
    res[p] = {'dur': round(dur, 2), 'cuts': [round(x, 2) for x in B], 'lens': [round(x, 2) for x in L], 'motion': round(base, 2)}
    print(f"{p.split('/')[-1][:14]:14s} dur {dur:5.1f} shots {len(L):3d} median {np.median(L):.2f} mean {np.mean(L):.2f} >3s {np.mean([x > 3 for x in L]):.0%} max {max(L):.1f} motion {base:.1f}", flush=True)
json.dump(res, open('shot_stats.json', 'w'), indent=0)
