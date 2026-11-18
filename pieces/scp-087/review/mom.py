import soundfile as sf, numpy as np, pyloudnorm as pyln, sys
x, sr = sf.read(sys.argv[1]); m = pyln.Meter(sr, block_size=0.4)
v = []
for i in range(0, len(x) - int(0.4 * sr), int(0.1 * sr)):
    with np.errstate(all="ignore"):
        try: v.append((round(m.integrated_loudness(x[i:i + int(0.4 * sr)]), 1), round(i / sr, 1)))
        except Exception: pass
v = [a for a in v if np.isfinite(a[0])]; print(sorted(v, reverse=True)[:5]); print("hit 45.6-46.6 max", max(a for a in v if 45.5 <= a[1] <= 46.6))
