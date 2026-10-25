# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made SFX for universe. Deterministic."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(1380)
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
# 1. countdown ticks (3 -> 8)
d = 5.2; x = np.zeros(int(d * SR))
for k in range(5): n = int(0.06 * SR); put(x, (0.5 + 0.12 * k) * bp(rng.standard_normal(n), 2000, 6000) * env(n, 0.001, 0.05, 4), k * 1.0 + 0.2)
save('ticks.wav', x)
# 2. the Earth leaves (8.0): a giant air-tearing whoosh, a sub drop, the world muffled
d = 3.0; t = T(d); x = 0.7 * bp(rng.standard_normal(len(t)), 300, 9000) * np.exp(-t * 1.6) * np.minimum(1, t / 0.01); put(x, 1.2 * chirp(90, 25, 2.4, 1.1) * env(int(2.4 * SR), 0.004, 2.2, 2.5), 0); save('leave.wav', x)
# 3. the space drone (8 -> 46): low, slowly beating, with a faint high shimmer
d = 38.0; t = T(d); x = 0.35 * np.sin(2 * np.pi * 36 * t + 0.5 * np.sin(2 * np.pi * 0.05 * t)) + 0.22 * np.sin(2 * np.pi * 54.3 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.09 * t)) + 0.05 * hp(rng.standard_normal(len(t)), 7000) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * t))
x *= np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 0.5); save('drone.wav', x)
# 4. star streaks (10.5 -> 13): many whooshes passing
d = 3.0; x = np.zeros(int(d * SR))
for k in range(22): dd = rng.uniform(0.25, 0.7); n = int(dd * SR); put(x, rng.uniform(0.2, 0.6) * bp(rng.standard_normal(n), rng.uniform(800, 2000), rng.uniform(4000, 9000)) * np.sin(np.pi * np.arange(n) / n) ** 2, rng.uniform(0, d - dd))
save('streaks.wav', x)
# 5. the Milky Way / galaxies: a wide glassy shimmer chord (7 s)
d = 7.0; t = T(d); x = sum(a * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.2 * t + f)) for f, a in [(220, 0.6), (330, 0.5), (440, 0.4), (660, 0.3), (990, 0.2)]) * np.minimum(1, t / 2) * np.minimum(1, (d - t) / 2); save('shimmer.wav', x)
# 6. the rush toward the Earth view (24 -> 27): wind building and cutting
d = 3.0; t = T(d); x = lp(rng.standard_normal(len(t)), 900) * (t / d) ** 1.5 * np.minimum(1, (d - t) / 0.05); save('rush.wav', x)
# 7. the quasar (32.5): a rising whine then a bright boom and ringing (4.5 s)
d = 4.5; t = T(d); x = np.zeros(len(t)); put(x, 0.4 * chirp(400, 3200, 1.6, 1.8) * np.linspace(0, 1, int(1.6 * SR)), 0); put(x, 1.0 * chirp(140, 40, 2.5, 1.2) * env(int(2.5 * SR), 0.003, 2.2, 2.4), 1.6)
put(x, 0.3 * np.sin(2 * np.pi * 1760 * T(2.9)) * env(int(2.9 * SR), 0.01, 2.8, 2.0), 1.6); save('quasar.wav', x)
# 8. the first stars (37 -> 40): soft high chimes
d = 3.2; x = np.zeros(int(d * SR))
for k in range(9): n = int(1.6 * SR); f = rng.choice([1047, 1319, 1568, 2093, 2637]); put(x, 0.3 * np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, 0.005, 1.6, 4), k * 0.33)
save('chimes.wav', x)
# 9. the heat (43 -> 61.6): a roar that rises from almost nothing to a blasting furnace, cut dead at the end
d = 18.6; t = T(d); k = (t / d) ** 2; nz = rng.standard_normal(len(t)); x = ((1 - k) * lp(nz, 300) + k * lp(nz, 2800)) * (0.05 + 0.95 * k) + 0.4 * np.sin(2 * np.pi * (40 + 30 * k) * t) * k
x *= np.minimum(1, (d - t) / 0.02); save('heat.wav', x)
# 10. the remote click (66.6)
n = int(0.05 * SR); x = bp(rng.standard_normal(n), 2000, 8000) * env(n, 0.001, 0.03, 5); save('click.wav', np.concatenate([x, np.zeros(int(0.3 * SR))]))
# 11. REWIND (67.0): a tape-rewind screech rising, a reversed boom, the world sucked backward (3 s)
d = 3.0; t = T(d); x = 0.5 * chirp(200, 2600, d, 0.7) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 9 * t))) * np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.1)
rb = chirp(120, 30, 1.6, 1.2) * env(int(1.6 * SR), 0.003, 1.5, 2.4); put(x, 1.3 * rb, 0.0); x += 0.3 * bp(rng.standard_normal(len(t)), 500, 6000) * (t / d) * np.minimum(1, (d - t) / 0.1); save('rewind.wav', x)
# 12. end tone
d = 7.0; t = T(d); x = 0.5 * np.sin(2 * np.pi * 98 * t) * env(len(t), 1.0, 6, 2.5) + 0.3 * np.sin(2 * np.pi * 147 * t) * env(len(t), 1.4, 5, 3); save('end.wav', x)
print('ok')
