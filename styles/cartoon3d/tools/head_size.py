"""Framing of a cartoon3d short: the biggest white round head per sampled frame, as % of frame height.
Heads = near-white (S<70, V>150) blobs that fill 62-88 % of their box (an ellipse fills 78.5 %), aspect 0.7-1.4.
Classes: CU >= 28 %, MCU 18-28, MS 10-18, WS 4-10, EWS < 4 or no head. Usage: head_size.py video.mp4 [...] [--debug dir]"""
import sys, os, cv2, numpy as np
def heads(f):
    H, W = f.shape[:2]; hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    m = ((hsv[..., 1] < 70) & (hsv[..., 2] > 150)).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8); out = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a < 0.0015 * H * W or w < 8 or h < 8: continue
        fill, asp = a / (w * h), w / h
        if 0.58 <= fill <= 0.9 and 0.7 <= asp <= 1.4 and y > 0 and x > 0 and x + w < W and y + h < H: out.append((h / H, (x, y, w, h)))
    return sorted(out, reverse=True)
def cls(p): return 'CU' if p >= .28 else 'MCU' if p >= .18 else 'MS' if p >= .10 else 'WS' if p >= .04 else 'EWS'
args = [a for a in sys.argv[1:] if not a.startswith('--')]; dbg = sys.argv[sys.argv.index('--debug') + 1] if '--debug' in sys.argv else None
if dbg: args = [a for a in args if a != dbg]; os.makedirs(dbg, exist_ok=True)
for p in args:
    cap = cv2.VideoCapture(p); fps = cap.get(5) or 30; N = int(cap.get(7)); C = {k: 0 for k in ['CU', 'MCU', 'MS', 'WS', 'EWS']}; P = []
    for k, fi in enumerate(range(int(fps * 0.5), N, int(fps * 0.5))):
        cap.set(1, fi); ok, f = cap.read()
        if not ok: break
        f = cv2.resize(f, (540, 960)); hs = heads(f); pc = hs[0][0] if hs else 0
        C[cls(pc)] += 1; P.append(pc)
        if dbg and k % 12 == 0:
            for _, (x, y, w, h) in hs[:3]: cv2.rectangle(f, (x, y), (x + w, y + h), (0, 0, 255), 2)
            cv2.imwrite(f"{dbg}/{os.path.basename(p)[:8]}_{k:03d}.jpg", f)
    T = sum(C.values()); Pz = [x for x in P if x > 0]
    print(f"{os.path.basename(p)[:14]:14s} n {T:3d} head med {np.median(Pz) * 100 if Pz else 0:4.1f}% | " + " ".join(f"{k} {C[k] / T:.0%}" for k in C), flush=True)
