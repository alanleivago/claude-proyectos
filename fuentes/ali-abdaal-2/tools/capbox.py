"""per-frame caption box left/right edge (box = black 30 % -> rows 1338-1352 are ~0.7x the rows 1316-1328 above) -> capbox.json + chunk swap frames"""
import json, subprocess, numpy as np
from pathlib import Path
D = Path(r"F:\Claude Proyectos\fuentes\ali-abdaal-2"); W, H = 1080, 1920
p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(D / "reel_yt.mp4"), "-vf", "crop=1080:44:0:1312,format=gray", "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
res = []
while True:
    b = p.stdout.read(W * 44)
    if len(b) < W * 44: break
    a = np.frombuffer(b, np.uint8).reshape(44, W).astype(np.float32)
    up = a[4:16].mean(0) + 1; ins = a[26:40].mean(0) + 1; r = ins / up
    m = r < 0.82
    m = np.convolve(m.astype(float), np.ones(15) / 15, "same") > 0.8
    xs = np.where(m)[0]
    res.append([int(xs.min()), int(xs.max())] if len(xs) > 60 else None)
(D / "capbox.json").write_text(json.dumps(res))
sw = []; prev = None
for i, r in enumerate(res):
    if r != prev and (r is None or prev is None or abs(r[0] - prev[0]) > 8 or abs(r[1] - prev[1]) > 8): sw.append((i, r))
    prev = r if r is not None else None
print(len(sw)); print(" ".join(f"{i}:{r}" for i, r in sw))
