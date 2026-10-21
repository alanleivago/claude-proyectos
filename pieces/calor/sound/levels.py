# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""levels.py mix.wav: loudest 100 ms windows and RMS in the planned silences."""
import sys, numpy as np, soundfile as sf
x, sr = sf.read(sys.argv[1]); m = x.mean(axis=1) if x.ndim > 1 else x
n = sr // 10; r = 20 * np.log10(np.sqrt(np.mean(m[: len(m) // n * n].reshape(-1, n) ** 2, axis=1)) + 1e-12)
top = np.argsort(r)[::-1]; seen = []
for i in top:
    if all(abs(i - j) > 10 for j in seen): seen.append(i)
    if len(seen) == 6: break
print("loudest 100 ms:", ", ".join(f"{i/10:.1f}s {r[i]:.1f} dB" for i in seen))
for a, b in [(56.05, 56.55), (20.0, 30.0), (0.5, 4.5)]:
    s = m[int(a * sr):int(b * sr)]; print(f"{a}-{b}s RMS {20*np.log10(np.sqrt(np.mean(s**2))+1e-12):.1f} dB")
