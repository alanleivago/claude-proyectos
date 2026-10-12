import soundfile as sf, numpy as np
for f in ("audio/own/hero-hit.wav", "audio/own/hero-boom.wav"):
    x, sr = sf.read(f); m = np.abs(x if x.ndim == 1 else x.mean(axis=1)); n = int(0.002 * sr)
    env = np.convolve(m, np.ones(n) / n, mode="same"); p = int(np.argmax(env)); a = max(0, p - int(0.004 * sr))
    y = x[a:].copy(); k = int(0.002 * sr); y[:k] *= np.linspace(0, 1, k) if y.ndim == 1 else np.linspace(0, 1, k)[:, None]
    sf.write(f, y, sr); print(f, "peak was at", round(p / sr, 3), "s; now starts", round(a / sr, 3))
