# levels.py: momentary loudness (approx. K-weighted, 400 ms) of final.wav: the loudest moments, the quietest stretches,
# the near-silence before the hit and the hit itself.
import os, numpy as np, soundfile as sf
from scipy import signal
A = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
x, sr = sf.read(os.path.join(A, "final.wav"), always_2d=True)
y = signal.lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585], x, axis=0)
y = signal.lfilter([1, -2, 1], [1, -1.99004745483398, 0.99007225036621], y, axis=0)   # BS.1770 K-weighting (48 kHz)
w = int(0.4 * sr); h = int(0.1 * sr)
m = np.array([10 * np.log10(np.mean(np.sum(y[i:i + w] ** 2, 1)) + 1e-12) - 0.691 for i in range(0, len(y) - w, h)])
t = np.arange(len(m)) * 0.1
top = np.argsort(-m)[:400]; seen = []
for i in top:
    if all(abs(t[i] - s) > 3 for s in seen): seen.append(t[i])
    if len(seen) == 8: break
print("loudest:", ", ".join(f"{s:.1f}s {m[int(s * 10)]:.1f}" for s in sorted(seen, key=lambda s: -m[int(s * 10)])))
print("pre-hit 325.15-326.1 max:", round(m[int(325.15 * 10):int(326.1 * 10) - 4].max(), 1), " hit 326.2-327 max:", round(m[3262:3270].max(), 1))
for t0 in range(0, 510, 10):
    seg = m[t0 * 10:(t0 + 10) * 10]; print(f"{t0:3d}s  med {np.median(seg):6.1f}  min {seg.min():6.1f}  max {seg.max():6.1f}")
