# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made SFX for religion. Deterministic."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(41)
T = lambda d: np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'highpass', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def env(n, a, r, shape=3.0):
    n = int(n); t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4))
def save(name, x): x = x / (np.abs(x).max() + 1e-9) * 0.89; sf.write(os.path.join(out, name), np.stack([x, x], 1).astype(np.float32), SR)
def put(x, y, t):
    i = int(t * SR); m = min(len(y), len(x) - i)
    if m > 0: x[i:i + m] += y[:m]
def chirp(f0, f1, d, c=1.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** c; return np.sin(2 * np.pi * np.cumsum(f) / SR)
# 1. the dissolve shimmer (1.6 s): a breathy rise and a shower of glassy pings
d = 1.6; t = T(d); x = 0.35 * hp(rng.standard_normal(len(t)), 3000) * np.sin(np.pi * t / d) ** 2
for k in range(40): n = int(0.5 * SR); f = rng.uniform(1800, 6000); put(x, 0.12 * np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, 0.003, 0.5, 5), rng.uniform(0.0, 1.1))
save('shimmer.wav', x)
# 2. the cut thump (0.8 s): a deep soft boom on each temple
d = 0.8; x = chirp(80, 38, d, 1.2) * env(int(d * SR), 0.004, 0.7, 3) + 0.2 * lp(rng.standard_normal(int(d * SR)), 300) * env(int(d * SR), 0.002, 0.3, 4); save('thump.wav', x)
# 3. the nursery monitor: soft double beeps
d = 5.0; x = np.zeros(int(d * SR))
for t0 in np.arange(0.3, d, 1.4): n = int(0.09 * SR); b = np.sin(2 * np.pi * 1500 * np.arange(n) / SR) * env(n, 0.005, 0.09, 2); put(x, b, t0); put(x, b, t0 + 0.16)
save('nursery.wav', x)
# 4. the hospital: a heart monitor beep every 0.9 s over an air-handling hum
d = 4.2; t = T(d); x = 0.15 * lp(rng.standard_normal(len(t)), 220) + 0.06 * np.sin(2 * np.pi * 60 * t)
for t0 in np.arange(0.2, d, 0.9): n = int(0.12 * SR); put(x, 0.8 * np.sin(2 * np.pi * 1000 * np.arange(n) / SR) * env(n, 0.004, 0.12, 2), t0)
save('hospital.wav', x)
# 5. THE SMASH support (46.5): a hard low thump under the glass
d = 1.6; x = 1.2 * chirp(90, 34, d, 1.3) * env(int(d * SR), 0.002, 1.4, 3) + 0.25 * lp(rng.standard_normal(int(d * SR)), 600) * env(int(d * SR), 0.001, 0.3, 5); save('smash.wav', x)
# 6. tension under the shop window before the silence (44.5 -> 45.5): a low swell that cuts
d = 1.0; t = T(d); x = 0.5 * np.sin(2 * np.pi * 55 * t) * (t / d) ** 2 + 0.2 * bp(rng.standard_normal(len(t)), 200, 800) * (t / d) ** 3; save('swell.wav', x)
# 7. the 7 % glow (52.4): a soft warm chord
d = 3.6; t = T(d); x = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(220, 1), (277, 0.6), (330, 0.6), (440, 0.3)]) * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 1.4); save('glow.wav', x)
# 8. end tone
d = 4.0; t = T(d); x = 0.5 * np.sin(2 * np.pi * 110 * t) * env(len(t), 0.6, 3.5, 2.5) + 0.3 * np.sin(2 * np.pi * 165 * t) * env(len(t), 0.8, 3, 3); save('end.wav', x)
print('ok')
