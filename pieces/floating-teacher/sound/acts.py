import soundfile as sf, numpy as np, pyloudnorm as pyln
x, sr = sf.read("audio/mix.wav"); m = pyln.Meter(sr)
for n, a, b in [("hook", 0, 4.5), ("card", 4.5, 9), ("lesson", 9, 27), ("rising", 27, 45), ("reveal", 45.6, 55), ("board", 55, 64), ("goodbye", 64, 71)]:
    print(f"{n:8s} {m.integrated_loudness(x[int(a*sr):int(b*sr)]):6.1f} LUFS  peak {20*np.log10(np.abs(x[int(a*sr):int(b*sr)]).max()):6.1f}")
print("total", round(m.integrated_loudness(x), 1), "peak", round(20*np.log10(np.abs(x).max()), 2))
