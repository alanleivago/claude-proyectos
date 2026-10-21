# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made SFX for pulsar. Deterministic."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(29)
T = lambda d: np.arange(int(round(d * SR))) / SR
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'highpass', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def env(n, a, r, shape=3.0):
    n = int(n); t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4))
def save(name, x): x = x / (np.abs(x).max() + 1e-9) * 0.89; sf.write(os.path.join(out, name), np.stack([x, x], 1).astype(np.float32), SR)
def put(x, y, t):
    i = int(round(t * SR)); m = min(len(y), len(x) - i)
    if m > 0: x[i:i + m] += y[:m]
def chirp(f0, f1, d, c=1.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** c; return np.sin(2 * np.pi * np.cumsum(f) / SR)
# 1. the appearance (9.0): a high glassy shimmer that rises, then holds (6 s)
d = 6.0; t = T(d); x = sum(a * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.4 * t)) for f, a in [(1320, 0.5), (1760, 0.4), (2640, 0.25)]) * np.minimum(1, t / 2.0) * np.minimum(1, (d - t) / 1.0); save('appear.wav', x)
# 2. the pulse (16 -> 44): a whooshing sweep every 1.5 s, growing; a low hum underneath
d = 28.0; t = T(d); x = 0.4 * np.sin(2 * np.pi * 55 * t) * np.minimum(1, t / 2) * (0.6 + 0.4 * t / d)
for k in range(int(d / 1.5)): n = int(0.7 * SR); g = bp(rng.standard_normal(n), 300, 6000) * np.sin(np.pi * np.arange(n) / n) ** 3; put(x, g * (0.4 + 0.8 * (k * 1.5 / d)) + 0.5 * chirp(220, 90, 0.7) * np.sin(np.pi * np.arange(n) / n) ** 2, k * 1.5 + 0.4)
save('pulse.wav', x * np.minimum(1, (d - t) / 0.05))
# 3. the aurora crackle (24 -> 44): faint sizzle and whistling tones
d = 20.0; t = T(d); x = 0.3 * hp(rng.standard_normal(len(t)), 4000) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.2 * t)) + 0.2 * chirp(3000, 1200, d, 0.8) * np.sin(np.pi * t / d); save('aurora.wav', x * np.minimum(1, t / 3) * np.minimum(1, (d - t) / 0.05))
# 4. THE FLARE (44.0, 7 s): a white-noise blast with a deep sub, a ringing violet chord
d = 7.0; t = T(d); x = np.zeros(len(t)); n = int(3 * SR); put(x, 1.2 * chirp(60, 24, 3.0, 1.3) * env(n, 0.004, 2.6, 2.2), 0)
put(x, 0.8 * lp(rng.standard_normal(int(5 * SR)), 3000) * env(int(5 * SR), 0.01, 4, 2.0), 0); x += 0.3 * sum(a * np.sin(2 * np.pi * f * t) for f, a in [(220, 1), (277, 0.8), (330, 0.6), (440, 0.4)]) * env(len(t), 0.05, 6, 1.8); save('flare.wav', x)
# 5. the shockwave (51.0, 4 s): a deep boom with a rumble tail
d = 4.0; t = T(d); x = 1.2 * chirp(48, 22, 2.0, 1.2) * env(int(2.0 * SR), 0.003, 1.8, 2.5).tolist() + [0] * (len(t) - int(2.0 * SR)) if False else None
x = np.zeros(len(t)); put(x, 1.3 * chirp(48, 22, 2.0, 1.2) * env(int(2.0 * SR), 0.003, 1.8, 2.5), 0); x += 0.6 * lp(rng.standard_normal(len(t)), 300) * env(len(t), 0.02, 3.5, 2.2); save('shock.wav', x)
# 6. the blackout (52.5): an electric zap and power-down whine
d = 2.4; t = T(d); x = np.zeros(len(t)); put(x, 0.6 * bp(rng.standard_normal(int(0.3 * SR)), 1500, 8000) * env(int(0.3 * SR), 0.002, 0.25, 4), 0); put(x, 0.6 * chirp(400, 40, 2.0) * env(int(2.0 * SR), 0.01, 1.8, 2.5), 0.15); save('powerdown.wav', x)
# 7. end tone
d = 8.0; t = T(d); x = 0.5 * np.sin(2 * np.pi * 98 * t) * env(len(t), 1.5, 6, 2.5) + 0.3 * np.sin(2 * np.pi * 147 * t) * env(len(t), 2.0, 5, 3); save('end.wav', x)
print('ok')
